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
import NotificationSettingsModal from '../components/QuranReader/NotificationSettingsModal';
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

    const isDefaultTheme = themeKey === 'default';
    const isBlackAndWhite = themeKey === 'deep_black';
    const isBlackTheme = theme.bgColor === '#000000';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));
    const secondaryColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[1]));
    const topBarTextColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (theme.topBarText || (isBlackAndWhite ? '#FFFFFF' : theme.palette[0])));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
    const [currentEditingKey, setCurrentEditingKey] = useState(null);
    const [tempOffset, setTempOffset] = useState(0);
    const [tempIqama, setTempIqama] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const searchIconRef = useRef(null);
    const [toastMessage, setToastMessage] = useState('');
    
    const isAudioMuted = config.audioMutedUntil && Date.now() < config.audioMutedUntil;
    
    const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
    const isSummerTimeActive = config.isSummerTime && supportsDST;

    const prayerTutorialSteps: TutorialStep[] = [
        {
            id: 'location-refresh',
            title: 'تحديد الموقع الجغرافي',
            text: 'اضغط هنا لتحديث موقعك الحالي عبر الـ GPS. هذا يضمن لك الحصول على مواقيت صلاة دقيقة جداً متوافقة مع مكان تواجدك الفعلي، وهو أمر حيوي خاصة عند السفر أو التنقل بين المدن.',
            selector: '#location-refresh-btn',
            icon: <MapPin className="w-8 h-8 text-white" />
        },
        {
            id: 'date-search',
            title: 'البحث العالمي عن المواقيت',
            text: 'هل تود معرفة مواقيت الصلاة في مدينة أخرى؟ استخدم شريط البحث الذكي هذا للبحث عن أي مدينة حول العالم. سيعرض لك التطبيق المواقيت الخاصة بها فوراً مع إمكانية حفظها كموقع افتراضي.',
            selector: '#search-input-container',
            icon: <Search className="w-8 h-8 text-white" />
        },
        {
            id: 'next-prayer',
            title: 'عداد الصلاة',
            text: 'هذا القسم هو رفيقك لتنظيم وقتك؛ فهو يعرض اسم الصلاة القادمة مع عد تنازلي دقيق بالثواني.',
            selector: '#next-prayer-countdown-container',
            icon: <Clock className="w-8 h-8 text-white" />
        },
        {
            id: 'night-times',
            title: 'أوقات قيام الليل والتهجد',
            text: 'للمهتمين بقيام الليل، يوفر التطبيق حساباً دقيقاً لمنتصف الليل والثلث الأخير (وقت النزول الإلهي). يمكنك تفعيل تنبيهات خاصة لهذه الأوقات لتعينك على صلاة التهجد والاستغفار بالأسحار.',
            selector: '#night-times-container',
            icon: <Bell className="w-8 h-8 text-white" />
        },
        {
            id: 'prayer-settings',
            title: 'التحكم في الأذان',
            text: 'لكل صلاة إعدادات مستقلة؛ يمكنك تفعيل الأذان الكامل، أو التنبيه فقط، أو كتم الصوت. كما يمكنك الضغط على "تخصيص" لاختيار صوت المؤذن المفضل لديك (مثل الحرم المكي أو المدني) وضبط دقائق التنبيه قبل الصلاة.',
            selector: '#prayer-actions-container',
            icon: <Bell className="w-8 h-8 text-white" />
        },
        {
            id: 'monthly-times',
            title: 'إمساكية الشهر الكاملة',
            text: 'اضغط هنا لعرض جدول كامل لمواقيت الصلاة طوال الشهر الحالي. هذا يساعدك في التخطيط لعباداتك، ومعرفة مواعيد السحور والإفطار في أيام الصيام.',
            selector: '#monthly-times-btn',
            icon: <Calendar className="w-8 h-8 text-white" />
        },
        {
            id: 'android-widget',
            title: 'تطبيق مصغر لشاشة الهاتف',
            text: 'الآن أصبح بإمكانك وضع تطبيق مصغر (Widget) لمواقيت الصلاة على شاشة هاتفك الرئيسية، لمعرفة مواقيت الصلاة مباشرة ومتابعة ميعاد الصلاة القادمة والعد التنازلي لها دون الحاجة لفتح التطبيق.',
            icon: <Clock className="w-8 h-8 text-white" />
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
        if (isAudioMuted) {
            showToast("التنبيهات الصوتية متوقفة حالياً. قم بتفعيلها أولاً.");
            return;
        }
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
        <div className="h-screen w-screen flex flex-col" style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : 'transparent', color: isDefaultTheme ? '#000000' : theme.textColor }}>
            <PrayerTimesHeader 
                handleRefreshLocation={handleRefreshLocation}
                onOpenNotifications={() => setIsNotifModalOpen(true)}
                cityGov={config.location.cityGov}
                fullCountry={config.location.fullCountry}
                combinedCode={config.location.combinedCode}
                topBarTextColor={topBarTextColor}
            />

            <main className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-1">
                <div className="max-w-md mx-auto flex flex-col h-full">
                    <div className={`themed-card ${isDefaultTheme ? 'bg-white border-gray-200' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5'} border rounded-xl p-2 mb-1.5 shadow-sm`}>
                        <div className="flex gap-2 mb-1.5">
                            <button
                                onClick={() => {
                                    const lat = config.location?.lat;
                                    const lng = config.location?.lng;
                                    let url = 'https://www.google.com/maps/search/?api=1&query=مسجد';
                                    if (lat && lng) {
                                        url = `https://www.google.com/maps/search/مسجد/@${lat},${lng},15z`;
                                    }
                                    window.open(url, '_blank');
                                }}
                                className={`${isDefaultTheme ? 'bg-white' : 'themed-card'} flex-1 rounded-xl p-3 flex items-center justify-center gap-1.5 shadow-sm font-bold text-[13px] active:scale-95 transition-all hover:bg-black/5 dark:hover:bg-white/5`}
                                style={{ color: primaryColor, border: isDefaultTheme ? '1px solid #f3f4f6' : undefined }}
                            >
                                <MapPin size={18} className="shrink-0" />
                                <span className="truncate whitespace-nowrap">البحث عن المساجد</span>
                            </button>
                             <button
                                onClick={() => onNavigate('monthly-prayer-times')}
                                id="monthly-times-btn"
                                className={`${isDefaultTheme ? 'bg-white' : 'themed-card'} flex-1 rounded-xl p-3 flex items-center justify-center gap-1.5 shadow-sm font-bold text-[13px] active:scale-95 transition-all hover:bg-black/5 dark:hover:bg-white/5`}
                                style={{ color: secondaryColor, border: isDefaultTheme ? '1px solid #f3f4f6' : undefined }}
                            >
                                <Calendar size={18} className="shrink-0" />
                                <span className="truncate whitespace-nowrap">المواقيت الشهرية</span>
                            </button>
                        </div>

                        <PrayerTimesDateSearch 
                            searchInput={searchInput}
                            setSearchInput={setSearchInput}
                            handleManualSearch={handleManualSearch}
                            searchIconRef={searchIconRef}
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                        />
                    </div>
                    
                    {isAudioMuted && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <Bell className="w-5 h-5" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">التنبيهات الصوتية متوقفة</span>
                                    <span className="text-xs opacity-80">حتى {new Date(config.audioMutedUntil!).toLocaleDateString('ar-SA')}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => updateConfig({ audioMutedUntil: undefined })}
                                className="text-xs bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-lg font-bold"
                            >
                                تفعيل
                            </button>
                        </div>
                    )}
                    
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
                                isDefaultTheme={isDefaultTheme}
                                isBlackTheme={isBlackTheme}
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

                    <div id="prayer-list" className="grid grid-cols-2 gap-2 mt-2">
                        {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key, idx) => {
                             const totalOffset = (config.prayerOffsets[key] || 0) + (isSummerTimeActive ? 60 : 0);
                             const displayTimeStr = applyOffset(times[key], totalOffset);
                             const iqamaTime = applyOffset(displayTimeStr, config.iqamaOffsets[key]);
                             const isMuted = config.mutedPrayers[key] || isAudioMuted;
                             
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
                                        isDefaultTheme={isDefaultTheme}
                                        isBlackTheme={isBlackTheme}
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
                    
                    <p className="text-center text-sm mt-3 opacity-70" style={{ color: secondaryColor }}>
                        (يجب تفعيل الموقع للهاتف لحساب الموقع بدقه)
                    </p>
                </div>
                <div className="w-full h-12 shrink-0"></div>
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

            {isNotifModalOpen && (
                <NotificationSettingsModal 
                    onClose={() => setIsNotifModalOpen(false)}
                    showToast={showToast}
                    isLandscape={false}
                    modeSuffix="_prayer_times"
                    initialTab="phone"
                />
            )}

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