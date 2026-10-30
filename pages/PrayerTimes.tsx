import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
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
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { PRAYER_TIMES_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
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
import { tPrayer, getPrayerDisplayName } from '../utils/prayerTimesTranslations';

class ModalErrorBoundary extends React.Component<{ children: React.ReactNode; onClose?: () => void }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("PrayerTimes Modal error caught by boundary:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-white p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-xl">
                        <p className="font-bold text-sm">حدث خطأ غير متوقع أثناء فتح الإعدادات</p>
                        <button
                            type="button"
                            onClick={() => {
                                this.setState({ hasError: false });
                                if (this.props.onClose) this.props.onClose();
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Main Component
function PrayerTimes({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const { 
        times, dates, nextPrayer, countdown, config, refreshLocation, manualSearch, updateConfig,
        isPrayerSilentActive, activeSilentPrayerName
    } = usePrayerTimes();

    const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
    const isBlackAndWhite = themeKey === 'deep_black' || theme.name === 'اسود';
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || theme.name === 'اسود' || themeKey === 'deep_black';
    const isGoldenTheme = themeKey === 'shiny_gold' || theme.name === 'الذهبي اللامع' || theme.cardBg === '#FDE047';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || theme.btnBg || '#2E7D5E');
    const secondaryColor = isBlackTheme ? '#A1A1AA' : (theme.palette?.[1] || theme.palette?.[0] || '#4B5563');
    const pageBgColor = isBlackTheme ? '#000000' : (theme.bgColor || '#F8FAFC');
    const topBarTextColor = isBlackTheme ? '#FFFFFF' : (theme.topBarText || theme.textColor || '#1E293B');

    const cardBorderColor = isBlackTheme ? '#FFFFFF' : 'transparent';
    const nextPrayerCardBorderColor = primaryColor;
    const nextPrayerBorderColor = primaryColor;

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
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('prayer_times');
        if (!getGuideSeen('prayer_times_page_spotlight_v2')) {
            const timer = setTimeout(() => {
                setShowGuide(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);
    
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
        showToast(tPrayer('toastLocating', language));
        try {
            await refreshLocation(true);
            showToast(tPrayer('toastLocationSuccess', language));
        } catch (e) {
            console.error(e);
            showToast(tPrayer('toastLocationError', language));
        }
    };

    const handleManualSearch = async () => {
        if(!searchInput) return;
        if (searchIconRef.current) searchIconRef.current.className = 'fa-solid fa-spinner fa-spin';
        try {
            await manualSearch(searchInput);
            showToast(tPrayer('toastCitySuccess', language));
        } catch(e) { 
            console.error(e); 
            showToast(tPrayer('toastSearchError', language));
        } 
        finally { if (searchIconRef.current) searchIconRef.current.className = 'fa-solid fa-magnifying-glass'; }
    };
    
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
        showToast(tPrayer('toastSettingsSaved', language));
        setIsModalOpen(false);
    };

    const closeModal = () => {
        stopNotificationSound(); // Stop audio preview on close
        setIsModalOpen(false);
    };

    const togglePrayerSound = (key) => {
        if (isAudioMuted) {
            showToast(tPrayer('toastAudioMutedNotice', language));
            return;
        }
        const willBeMuted = !config.mutedPrayers[key];
        if (willBeMuted) {
            stopNotificationSound();
        }
        updateConfig({
            mutedPrayers: {...config.mutedPrayers, [key]: willBeMuted }
        });
        const pName = getPrayerDisplayName(key, language);
        showToast(
            willBeMuted 
                ? tPrayer('toastPrayerDisabled', language, { p: pName })
                : tPrayer('toastPrayerEnabled', language, { p: pName })
        );
    }

    const toggleSummerTime = () => {
        if (!supportsDST) return;
        const newState = !config.isSummerTime;
        updateConfig({ isSummerTime: newState });
        showToast(newState ? tPrayer('toastDstEnabled', language) : tPrayer('toastDstDisabled', language));
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
                        showToast(tPrayer('toastDownloadingTone', language));
                        localUri = await copyAssetToDevice(selectedInternet.path);
                    }
                    playNotificationSound(localUri, true); // Play preview immediately
                    updateConfig({
                        tones: { ...config.tones, [currentEditingKey]: { name: selectedInternet.name, data: localUri, originalUrl: selectedInternet.path }}
                    });
                    if (localUri.startsWith('http')) {
                        showToast(tPrayer('toastToneSelected', language));
                    }
                } catch (err) {
                    console.error("Failed to download tone:", err);
                    showToast(tPrayer('toastToneDownloadFailed', language));
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
                playNotificationSound(audioDataUrl, true); // Play preview immediately
                updateConfig({
                    tones: { ...config.tones, [currentEditingKey]: { name: file.name, data: audioDataUrl }}
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div 
            dir={dir}
            className="h-[100dvh] w-full flex flex-col font-cairo select-none" 
            style={{ backgroundColor: pageBgColor, color: isBlackTheme ? '#FFFFFF' : (theme.textColor || '#1E293B') }}
        >
            <PrayerTimesHeader 
                handleRefreshLocation={handleRefreshLocation}
                onOpenNotifications={() => setIsNotifModalOpen(true)}
                cityGov={config.location.cityGov}
                fullCountry={config.location.fullCountry}
                combinedCode={config.location.combinedCode}
                location={config.location}
                topBarTextColor={topBarTextColor}
                onBack={handleBack}
                onHome={handleGoHome}
                onOpenGuide={() => setShowGuide(true)}
            />

            <main className="flex-1 overflow-y-auto hide-scrollbar px-3 sm:px-4 pt-3 pb-6">
                <div className="max-w-md mx-auto flex flex-col space-y-3">
                    {/* Top Action Bar & Date Search */}
                    <div className="flex flex-col space-y-2.5">
                        <div className="flex gap-2.5">
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
                                id="nearby-mosques-btn"
                                className={`flex-1 rounded-2xl p-3 sm:p-3.5 flex items-center justify-center gap-2 font-bold text-xs sm:text-[13px] active:scale-95 transition-all cursor-pointer ${
                                    isBlackTheme 
                                        ? 'bg-[#18181b] border border-white/10 text-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.7)]' 
                                        : 'bg-white text-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)]'
                                }`}
                                style={{ borderRadius: '16px' }}
                            >
                                <div 
                                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                    style={{ 
                                        backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${primaryColor}14`, 
                                        color: primaryColor 
                                    }}
                                >
                                    <MapPin size={15} />
                                </div>
                                <span className="truncate whitespace-nowrap">
                                    {tPrayer('nearbyMosques', language)}
                                </span>
                            </button>
                            <button
                                onClick={() => onNavigate('monthly-prayer-times')}
                                id="monthly-times-btn"
                                className={`flex-1 rounded-2xl p-3 sm:p-3.5 flex items-center justify-center gap-2 font-bold text-xs sm:text-[13px] active:scale-95 transition-all cursor-pointer ${
                                    isBlackTheme 
                                        ? 'bg-[#18181b] border border-white/10 text-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.7)]' 
                                        : 'bg-white text-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)]'
                                }`}
                                style={{ borderRadius: '16px' }}
                            >
                                <div 
                                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                    style={{ 
                                        backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${primaryColor}14`, 
                                        color: primaryColor 
                                    }}
                                >
                                    <Calendar size={15} />
                                </div>
                                <span className="truncate whitespace-nowrap">
                                    {tPrayer('monthlyTimes', language)}
                                </span>
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
                                    <span className="text-sm font-bold">{tPrayer('audioAlertsPaused', language)}</span>
                                    <span className="text-xs opacity-80">{tPrayer('untilDate', language)}{new Date(config.audioMutedUntil!).toLocaleDateString(language === 'en' ? 'en-US-u-nu-latn' : 'ar-EG-u-nu-arab')}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => updateConfig({ audioMutedUntil: undefined })}
                                className="text-xs bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-lg font-bold"
                            >
                                {tPrayer('enable', language)}
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
                                isDarkTheme={theme.isDark}
                                themeCardBg={theme.cardBg}
                                themeTextColor={isBlackTheme ? '#FFFFFF' : (theme.isDark ? theme.textColor : primaryColor)}
                                themePalette0={theme.palette[0]}
                                themePalette1={theme.palette[1]}
                                cardBorderColor={cardBorderColor}
                                nextPrayerBorderColor={nextPrayerCardBorderColor}
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
                                <span>{tPrayer('silentModeActive', language, { p: getPrayerDisplayName(activeSilentPrayerName, language) })}</span>
                            </div>
                            <span className="text-[10px] opacity-75 font-normal">{tPrayer('mayAllahAccept', language)}</span>
                        </div>
                    )}

                    <div id="prayer-list" className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-1">
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
                                        isGoldenTheme={isGoldenTheme}
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
                        {tPrayer('locationRequirementNote', language)}
                    </p>
                </div>
                <div className="w-full h-12 shrink-0"></div>
            </main>

            <ModalErrorBoundary onClose={closeModal}>
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
            </ModalErrorBoundary>

            {isNotifModalOpen && (
                <ModalErrorBoundary onClose={() => setIsNotifModalOpen(false)}>
                    <NotificationSettingsModal 
                        onClose={() => setIsNotifModalOpen(false)}
                        showToast={showToast}
                        isLandscape={false}
                        modeSuffix="_prayer_times"
                        initialTab="phone"
                        hideAppTab={true}
                        phoneTabTitle={language === 'en' ? 'Prayer Settings & Notifications' : 'إعدادات الصلاة والإشعارات'}
                    />
                </ModalErrorBoundary>
            )}

            {toastMessage && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[100]">
                    {toastMessage}
                </div>
            )}

            <CommunitySpotlightGuide
                guideKey="prayer_times_page_spotlight_v2"
                steps={PRAYER_TIMES_PAGE_STEPS}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={language === 'en'}
            />
        </div>
    );
}

export default PrayerTimes;