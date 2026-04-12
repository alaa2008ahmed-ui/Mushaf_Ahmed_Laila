import React, { useState, useEffect, useRef, useCallback } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { prayerNamesAr, internetTones } from '../data/prayerTimesData';
import { usePrayerTimes, copyAssetToDevice } from '../context/PrayerTimesContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import PrayerTimesSettingsModal from '../components/PrayerTimes/PrayerTimesSettingsModal';
import PrayerCard from '../components/PrayerTimes/PrayerCard';
import PrayerTimesHeader from '../components/PrayerTimes/PrayerTimesHeader';
import PrayerTimesDateSearch from '../components/PrayerTimes/PrayerTimesDateSearch';
import NextPrayerCard from '../components/PrayerTimes/NextPrayerCard';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { MapPin, Search, Clock, Bell, Calendar, Palette } from 'lucide-react';
import {
    applyOffset,
    formatTime12,
    formatTime12_EN,
    formatTime12_clean,
    playNotificationSound,
    stopNotificationSound,
    checkSupportsDST,
    calculateNightTimes
} from '../utils/prayerTimesUtils';

// Main Component
function PrayerTimes({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const { times, dates, nextPrayer, countdown, config, refreshLocation, manualSearch, updateConfig } = usePrayerTimes();

    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];
    const secondaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[1];
    const topBarTextColor = theme.topBarText || (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditingKey, setCurrentEditingKey] = useState(null);
    const [tempOffset, setTempOffset] = useState(0);
    const [tempIqama, setTempIqama] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const searchIconRef = useRef(null);
    const [toastMessage, setToastMessage] = useState('');
    
    const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
    const isSummerTimeActive = config.isSummerTime && supportsDST;

    const prayerTutorialSteps: TutorialStep[] = [
        {
            id: 'location-refresh',
            text: 'اضغط هنا لتحديث موقعك الحالي والحصول على مواقيت دقيقة.',
            position: { top: '60px', left: '20px' },
            selector: '#location-refresh-btn',
            arrow: 'up',
            icon: <MapPin className="w-8 h-8 text-white" />
        },
        {
            id: 'date-search',
            text: 'يمكنك البحث عن مواقيت الصلاة لأي مدينة أو محافظة أخرى من هنا.',
            position: { top: '150px' },
            selector: '#search-input-container',
            arrow: 'up',
            icon: <Search className="w-8 h-8 text-white" />
        },
        {
            id: 'next-prayer',
            text: 'هنا يظهر الوقت المتبقي للصلاة القادمة.',
            position: { top: '250px' },
            selector: '#next-prayer-card',
            arrow: 'up',
            icon: <Clock className="w-8 h-8 text-white" />
        },
        {
            id: 'night-times',
            text: 'يمكنك تفعيل أو تعطيل إشعارات أوقات الليل (أول الليل، منتصف الليل، الثلث الأخير) من هنا.',
            position: { top: '250px' },
            selector: '#night-times-container',
            arrow: 'up',
            icon: <Bell className="w-8 h-8 text-white" />
        },
        {
            id: 'prayer-settings',
            text: 'الدائرة العلوية لتفعيل أو كتم صوت الأذان، والزر بالأسفل لتعديل التنبيهات، صوت الأذان، أو وقت الإقامة.',
            position: { top: '450px' },
            selector: '#prayer-actions-container',
            arrow: 'up',
            icon: <Bell className="w-8 h-8 text-white" />
        },
        {
            id: 'monthly-times',
            text: 'عرض جدول مواقيت الصلاة للشهر الحالي، كما يمكنك عرض الشهور السابقة واللاحقة.',
            position: { top: '150px' },
            selector: '#monthly-times-btn',
            arrow: 'up',
            icon: <Calendar className="w-8 h-8 text-white" />
        }
    ];
    
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);
    
    const showToast = useCallback((msg) => setToastMessage(msg), []);

    useEffect(() => {
        const interceptor = () => {
            if (isModalOpen) {
                setIsModalOpen(false);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isModalOpen]);

    const handleRefreshLocation = async () => {
        showToast("جاري تحديد الموقع الحالي...");
        try {
            await refreshLocation();
            showToast("تم تحديث الموقع بنجاح");
        } catch (e) {
            console.error(e);
            showToast("حدث خطأ أثناء تحديد الموقع");
        }
    };

    const handleManualSearch = async () => {
        if(!searchInput) return;
        if (searchIconRef.current) searchIconRef.current.className = 'fa-solid fa-spinner fa-spin';
        try {
            await manualSearch(searchInput);
        } catch(e) { 
            console.error(e); 
            showToast("حدث خطأ أثناء البحث أو لم يتم العثور على نتائج.");
        } 
        finally { if (searchIconRef.current) searchIconRef.current.className = 'fa-solid fa-magnifying-glass'; }
    }
    
    const openSettings = (key) => {
        setCurrentEditingKey(key);
        setTempOffset(config.prayerOffsets[key] || 0);
        setTempIqama(config.iqamaOffsets[key] || 0);
        setIsModalOpen(true);
    };

    const saveUserConfig = () => {
        stopNotificationSound(); // Stop audio preview on save
        updateConfig({
            prayerOffsets: { ...config.prayerOffsets, [currentEditingKey]: tempOffset },
            iqamaOffsets: { ...config.iqamaOffsets, [currentEditingKey]: tempIqama }
        });
        setIsModalOpen(false);
    };

    const closeModal = () => {
        stopNotificationSound(); // Stop audio preview on close
        setIsModalOpen(false);
    };

    const togglePrayerSound = (key) => {
        updateConfig({
            mutedPrayers: {...config.mutedPrayers, [key]: !config.mutedPrayers[key] }
        });
    }

    const toggleSummerTime = () => {
        if (!supportsDST) return;
        const newState = !config.isSummerTime;
        updateConfig({ isSummerTime: newState });
        showToast(newState ? "تم تفعيل التقويم الصيفي (+60 دقيقة)" : "تم إلغاء التقويم الصيفي");
    };

    const handleToneSelection = async (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            document.getElementById('sound-file-input').click();
        } else if (value === 'none') {
            stopNotificationSound();
            updateConfig({
                tones: { ...config.tones, [currentEditingKey]: { name: 'بدون تنبيه', data: 'none' } }
            });
        } else {
            const selectedInternet = internetTones.find(t => t.path === value);
            if (selectedInternet) {
                try {
                    let localUri = selectedInternet.path;
                    if (localUri.startsWith('http')) {
                        showToast("جاري تحميل الصوت للمعاينة...");
                        localUri = await copyAssetToDevice(selectedInternet.path);
                    }
                    playNotificationSound(localUri); // Play preview
                    updateConfig({
                        tones: { ...config.tones, [currentEditingKey]: { name: selectedInternet.name, data: localUri, originalUrl: selectedInternet.path }}
                    });
                    if (localUri.startsWith('http')) {
                        showToast("تم اختيار الصوت بنجاح");
                    }
                } catch (err) {
                    console.error("Failed to download tone:", err);
                    showToast("فشل في تحميل الملف الصوتي. يرجى التحقق من اتصالك بالإنترنت.");
                }
            }
        }
    };
    
    const handleToneUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const audioDataUrl = event.target.result as string;
                playNotificationSound(audioDataUrl); // Play preview
                updateConfig({
                    tones: { ...config.tones, [currentEditingKey]: { name: file.name, data: audioDataUrl }}
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col" style={{ backgroundColor: 'transparent', color: theme.textColor }}>
            <PrayerTimesHeader 
                handleRefreshLocation={handleRefreshLocation}
                cityGov={config.location.cityGov}
                fullCountry={config.location.fullCountry}
                combinedCode={config.location.combinedCode}
                topBarTextColor={topBarTextColor}
            />

            <main className="flex-1 overflow-y-auto hide-scrollbar p-4 pb-24">
                <div className="max-w-md mx-auto">
                    <PrayerTimesDateSearch 
                        dates={dates}
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        handleManualSearch={handleManualSearch}
                        searchIconRef={searchIconRef}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                        onNavigateToMonthly={() => onNavigate('monthly-prayer-times')}
                    />
                    
                    {(() => {
                        const maghribOffset = (config.prayerOffsets.Maghrib || 0) + (isSummerTimeActive ? 60 : 0);
                        const fajrOffset = (config.prayerOffsets.Fajr || 0) + (isSummerTimeActive ? 60 : 0);
                        const maghribTime = applyOffset(times.Maghrib, maghribOffset);
                        const fajrTime = applyOffset(times.Fajr, fajrOffset);
                        const nightTimes = calculateNightTimes(maghribTime, fajrTime);

                        return (
                            <NextPrayerCard 
                                nextPrayer={nextPrayer}
                                times={times}
                                countdown={countdown}
                                isBlackAndWhite={isBlackAndWhite}
                                themePalette0={theme.palette[0]}
                                themePalette1={theme.palette[1]}
                                formatTime12={formatTime12}
                                applyOffset={applyOffset}
                                prayerOffset={nextPrayer ? (config.prayerOffsets[nextPrayer.key] || 0) + (isSummerTimeActive ? 60 : 0) : 0}
                                nightTimes={nightTimes}
                                nightNotifications={config.nightNotifications}
                                onToggleNightNotification={(key) => {
                                    const currentNotifs = config.nightNotifications || { firstThird: true, midnight: true, lastThird: true };
                                    updateConfig({
                                        nightNotifications: {
                                            ...currentNotifs,
                                            [key]: !currentNotifs[key]
                                        }
                                    });
                                }}
                            />
                        );
                    })()}

                    <div id="prayer-list" className="space-y-3 mt-5">
                        {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key, idx) => {
                             const totalOffset = (config.prayerOffsets[key] || 0) + (isSummerTimeActive ? 60 : 0);
                             const displayTimeStr = applyOffset(times[key], totalOffset);
                             const iqamaTime = applyOffset(displayTimeStr, config.iqamaOffsets[key]);
                             const isMuted = config.mutedPrayers[key];
                             
                            return (
                                <PrayerCard
                                    key={key}
                                    prayerKey={key}
                                    idx={idx}
                                    displayTimeStr={displayTimeStr}
                                    iqamaTime={iqamaTime}
                                    isMuted={isMuted}
                                    isNextPrayer={nextPrayer?.key === key}
                                    prayerNameAr={prayerNamesAr[key]}
                                    primaryColor={primaryColor}
                                    secondaryColor={secondaryColor}
                                    isBlackAndWhite={isBlackAndWhite}
                                    themePalette1={theme.palette[1]}
                                    togglePrayerSound={togglePrayerSound}
                                    openSettings={openSettings}
                                    formatTime12={formatTime12}
                                    formatTime12_clean={formatTime12_clean}
                                    isSummerTime={isSummerTimeActive}
                                    toggleSummerTime={toggleSummerTime}
                                    supportsDST={supportsDST}
                                />
                            )
                        })}
                    </div>
                    
                    <p className="text-center text-sm mt-6 opacity-70" style={{ color: secondaryColor }}>
                        (يجب تفعيل الموقع للهاتف لحساب الموقع بدقه)
                    </p>
                </div>
            </main>

            <PrayerTimesSettingsModal 
                isOpen={isModalOpen}
                currentEditingKey={currentEditingKey}
                prayerNamesAr={prayerNamesAr}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                isBlackAndWhite={isBlackAndWhite}
                closeModal={closeModal}
                tempOffset={tempOffset}
                setTempOffset={setTempOffset}
                tempIqama={tempIqama}
                setTempIqama={setTempIqama}
                times={times}
                formatTime12_EN={formatTime12_EN}
                applyOffset={applyOffset}
                configTones={config.tones}
                internetTones={internetTones}
                handleToneSelection={handleToneSelection}
                handleToneUpload={handleToneUpload}
                saveUserConfig={saveUserConfig}
                isSummerTime={isSummerTimeActive}
            />

            {toastMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[100]">
                    {toastMessage}
                </div>
            )}
            <BottomBar onHomeClick={() => onNavigate('home')} onThemesClick={() => {}} showThemes={false} />
            <TutorialOverlay tutorialId="prayer-times-tutorial" steps={prayerTutorialSteps} />
        </div>
    );
}

export default PrayerTimes;