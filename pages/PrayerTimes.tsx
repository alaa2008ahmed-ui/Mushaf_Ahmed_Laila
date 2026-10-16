import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { MapPin, Calendar, Bell } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
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
    const { 
        times, dates, nextPrayer, countdown, config, refreshLocation, manualSearch, updateConfig,
        isPrayerSilentActive, activeSilentPrayerName
    } = usePrayerTimes();

    const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
    const isBlackAndWhite = themeKey === 'deep_black' || theme.name === 'اسود';
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || theme.name === 'اسود' || themeKey === 'deep_black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));
    const secondaryColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[1]));
    const topBarTextColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (theme.topBarText || (isBlackAndWhite ? '#FFFFFF' : theme.palette[0])));

    const cardBorderColor = isDefaultTheme 
      ? '#000000' 
      : (isBlackTheme 
          ? '#FFFFFF' 
          : (theme.palette?.[0] || theme.accent || '#000000'));

    const getNextPrayerBorderColor = () => {
        if (isDefaultTheme) {
            return '#059669'; // زمردي إسلامي مميز يختلف دائماً عن الأسود
        }
        if (isBlackTheme || isBlackAndWhite) {
            return '#10b981'; // زمردي مضيء يختلف دائماً عن الأبيض
        }
        const pal0 = (theme.palette?.[0] || '').toLowerCase();
        const isGreenTheme = pal0.includes('059669') || pal0.includes('10b981') || pal0.includes('16a34a') || pal0.includes('22c55e') || theme.name?.includes('أخضر') || theme.name?.includes('زيتوني') || theme.name?.includes('الروضة');
        if (isGreenTheme) {
            return '#d97706'; // عنبري ذهبي مختلف تماماً عن الأخضر
        }
        const isWarmTheme = pal0.includes('d97706') || pal0.includes('f59e0b') || pal0.includes('eab308') || theme.name?.includes('ذهبي') || theme.name?.includes('برتقالي') || theme.name?.includes('غروب');
        if (isWarmTheme) {
            return '#059669'; // زمردي مختلف تماماً عن الذهبي والبرتقالي
        }
        return '#059669'; // زمردي مميز وفاخر لسائر الثيمات الملونة
    };

    const nextPrayerBorderColor = getNextPrayerBorderColor();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
    const [currentEditingKey, setCurrentEditingKey] = useState(null);
    const [tempOffset, setTempOffset] = useState(0);
    const [tempIqama, setTempIqama] = useState(0);
    const [tempIqamaEnabled, setTempIqamaEnabled] = useState(false);
    const [tempPreReminderEnabled, setTempPreReminderEnabled] = useState(false);
    const [tempPreReminderMinutes, setTempPreReminderMinutes] = useState(15);
    const [tempAutoSilentEnabled, setTempAutoSilentEnabled] = useState(false);
    const [tempAutoSilentDuration, setTempAutoSilentDuration] = useState(15);
    const [searchInput, setSearchInput] = useState("");
    const searchIconRef = useRef(null);
    const [toastMessage, setToastMessage] = useState('');
    
    const isAudioMuted = config.audioMutedUntil && Date.now() < config.audioMutedUntil;
    
    const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
    const isSummerTimeActive = config.isSummerTime && supportsDST;

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
                closeModal();
                return true;
            }
            if (isNotifModalOpen) {
                setIsNotifModalOpen(false);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isModalOpen, isNotifModalOpen]);

    const handleBack = () => {
        if (isModalOpen) {
            closeModal();
        } else if (isNotifModalOpen) {
            setIsNotifModalOpen(false);
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (isModalOpen) closeModal();
        if (isNotifModalOpen) setIsNotifModalOpen(false);
        onNavigate('home');
    };

    const handleRefreshLocation = async () => {
        showToast("جاري تحديد الموقع واستعادة المواقيت الأصلية...");
        try {
            await refreshLocation(true);
            showToast("تم تحديد الموقع واستعادة المواقيت الأصلية تلقائياً");
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
            showToast("تم تحديد المدينة بنجاح واستعادة المواقيت الأصلية");
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
        
        // Load per-prayer or global defaults for Iqama
        const prayerIqama = config.prayerIqamaReminders?.[key];
        if (prayerIqama) {
            setTempIqamaEnabled(!!prayerIqama.enabled);
            setTempIqama(prayerIqama.minutes ?? config.iqamaOffsets[key] ?? 15);
        } else {
            setTempIqamaEnabled(!!config.iqamaReminder?.enabled);
            setTempIqama(config.iqamaOffsets[key] || 15);
        }

        // Load per-prayer or global defaults for Pre-Reminder
        const prayerPre = config.prayerPreReminders?.[key];
        if (prayerPre) {
            setTempPreReminderEnabled(!!prayerPre.enabled);
            setTempPreReminderMinutes(prayerPre.minutes || 15);
        } else {
            setTempPreReminderEnabled(!!config.preAthanReminder?.enabled);
            setTempPreReminderMinutes(config.preAthanReminder?.minutes || 15);
        }

        const prayerSilent = config.prayerAutoSilent?.[key];
        if (prayerSilent) {
            setTempAutoSilentEnabled(prayerSilent.enabled);
            setTempAutoSilentDuration(prayerSilent.duration || 15);
        } else {
            setTempAutoSilentEnabled(!!config.autoSilent);
            setTempAutoSilentDuration(config.autoSilentDuration || 15);
        }

        setIsModalOpen(true);
    };

    const saveUserConfig = () => {
        stopNotificationSound(); // Stop audio preview on save
        updateConfig({
            prayerOffsets: { ...config.prayerOffsets, [currentEditingKey]: tempOffset },
            iqamaOffsets: { ...config.iqamaOffsets, [currentEditingKey]: tempIqama },
            prayerIqamaReminders: {
                ...(config.prayerIqamaReminders || {}),
                [currentEditingKey]: {
                    enabled: tempIqamaEnabled,
                    minutes: tempIqama
                }
            },
            prayerPreReminders: {
                ...(config.prayerPreReminders || {}),
                [currentEditingKey]: {
                    enabled: tempPreReminderEnabled,
                    minutes: tempPreReminderMinutes
                }
            },
            prayerAutoSilent: {
                ...(config.prayerAutoSilent || {}),
                [currentEditingKey]: {
                    enabled: tempAutoSilentEnabled,
                    duration: tempAutoSilentDuration
                }
            }
        });
        showToast("تم حفظ تعديل وقت الصلاة بنجاح");
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
                onBack={handleBack}
                onHome={handleGoHome}
            />

            <main className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-1">
                <div className="max-w-md mx-auto flex flex-col h-full">
                    <div 
                        className={`themed-card ${isDefaultTheme ? 'bg-white' : 'bg-black/5 dark:bg-white/5'} rounded-xl p-2 mb-1.5 shadow-sm`}
                        style={{
                            border: `1.5px solid ${cardBorderColor}`,
                            backgroundColor: isDefaultTheme ? '#FFFFFF' : undefined
                        }}
                    >
                        <div className="flex gap-2 mb-1.5">
                            <button
                                onClick={async () => {
                                    const lat = config.location?.lat;
                                    const lng = config.location?.lng;
                                    let url = 'https://www.google.com/maps/search/?api=1&query=مسجد';
                                    if (lat && lng) {
                                        url = `https://www.google.com/maps/search/مسجد/@${lat},${lng},15z`;
                                    }
                                    if (Capacitor.isNativePlatform()) {
                                        try {
                                            await Browser.open({ url });
                                        } catch (e) {
                                            console.error("Browser open error:", e);
                                            window.open(url, '_system');
                                        }
                                    } else {
                                        window.open(url, '_blank');
                                    }
                                }}
                                className={`${isDefaultTheme ? 'bg-white' : 'themed-card'} flex-1 rounded-xl p-3 flex items-center justify-center gap-1.5 shadow-sm font-bold text-[13px] active:scale-95 transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                style={{ 
                                    color: isBlackTheme ? '#FFFFFF' : primaryColor, 
                                    border: `1.5px solid ${cardBorderColor}`,
                                    backgroundColor: isDefaultTheme ? '#FFFFFF' : (isBlackTheme ? '#111111' : undefined) 
                                }}
                            >
                                <MapPin size={18} className="shrink-0" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} />
                                <span className="truncate whitespace-nowrap" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }}>المساجد القريبة</span>
                            </button>
                             <button
                                onClick={() => onNavigate('monthly-prayer-times')}
                                id="monthly-times-btn"
                                className={`${isDefaultTheme ? 'bg-white' : 'themed-card'} flex-1 rounded-xl p-3 flex items-center justify-center gap-1.5 shadow-sm font-bold text-[13px] active:scale-95 transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                style={{ 
                                    color: isBlackTheme ? '#FFFFFF' : secondaryColor, 
                                    border: `1.5px solid ${cardBorderColor}`,
                                    backgroundColor: isDefaultTheme ? '#FFFFFF' : (isBlackTheme ? '#111111' : undefined) 
                                }}
                            >
                                <Calendar size={18} className="shrink-0" style={{ color: isBlackTheme ? '#FFFFFF' : secondaryColor }} />
                                <span className="truncate whitespace-nowrap" style={{ color: isBlackTheme ? '#FFFFFF' : secondaryColor }}>المواقيت الشهرية</span>
                            </button>
                        </div>

                        <PrayerTimesDateSearch 
                            searchInput={searchInput}
                            setSearchInput={setSearchInput}
                            handleManualSearch={handleManualSearch}
                            searchIconRef={searchIconRef}
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                            cardBorderColor={cardBorderColor}
                            isDefaultTheme={isDefaultTheme}
                            isBlackTheme={isBlackTheme}
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
                                cardBorderColor={cardBorderColor}
                                nextPrayerBorderColor={nextPrayerBorderColor}
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

                    {/* Live active notification banner if currently active during prayer */}
                    {isPrayerSilentActive && (
                        <div className="p-2.5 px-3.5 mt-2 rounded-2xl bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100 flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <span className="text-base">🔕</span>
                                <span>وضع الصامت نَشِط حالياً لأداء صلاة {activeSilentPrayerName}</span>
                            </div>
                            <span className="text-[10px] opacity-75 font-normal">تقبل الله طاعتكم</span>
                        </div>
                    )}

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
                                        cardBorderColor={cardBorderColor}
                                        nextPrayerBorderColor={nextPrayerBorderColor}
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
                    
                    <p className="text-center text-sm mt-3 opacity-90" style={{ color: isBlackTheme ? '#FFFFFF' : secondaryColor }}>
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
                isBlackTheme={isBlackTheme}
                cardBorderColor={cardBorderColor}
                isDefaultTheme={isDefaultTheme}
                closeModal={closeModal}
                tempOffset={tempOffset}
                setTempOffset={setTempOffset}
                tempIqama={tempIqama}
                setTempIqama={setTempIqama}
                tempIqamaEnabled={tempIqamaEnabled}
                setTempIqamaEnabled={setTempIqamaEnabled}
                times={times}
                formatTime12_EN={formatTime12_EN}
                applyOffset={applyOffset}
                configTones={config.tones}
                internetTones={internetTones}
                handleToneSelection={handleToneSelection}
                handleToneUpload={handleToneUpload}
                saveUserConfig={saveUserConfig}
                isSummerTime={isSummerTimeActive}
                isGlobalPreReminderActive={config.preAthanReminder?.enabled !== false}
                globalPreReminderMinutes={config.preAthanReminder?.minutes || 15}
                tempPreReminderEnabled={tempPreReminderEnabled}
                setTempPreReminderEnabled={setTempPreReminderEnabled}
                tempPreReminderMinutes={tempPreReminderMinutes}
                setTempPreReminderMinutes={setTempPreReminderMinutes}
                isGlobalAutoSilentActive={!!config.autoSilent}
                globalAutoSilentDuration={config.autoSilentDuration || 15}
                tempAutoSilentEnabled={tempAutoSilentEnabled}
                setTempAutoSilentEnabled={setTempAutoSilentEnabled}
                tempAutoSilentDuration={tempAutoSilentDuration}
                setTempAutoSilentDuration={setTempAutoSilentDuration}
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
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[100]">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

export default PrayerTimes;