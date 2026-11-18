import React, { useState, useEffect } from 'react';
import { ShieldAlert, HelpCircle, X } from 'lucide-react';
import ToneSelector from './ToneSelector';
import { Capacitor } from '@capacitor/core';
import { isDndPermissionGranted, requestDndPermission } from '../../utils/silentMode';
import { LocalNotifications } from '@capacitor/local-notifications';
import { playNotificationSound } from '../../utils/prayerTimesUtils';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { tPrayer, getPrayerDisplayName } from '../../utils/prayerTimesTranslations';
import { CommunitySpotlightGuide, getGuideSeen } from '../Community/CommunitySpotlightGuide';
import { PRAYER_SETTINGS_MODAL_STEPS } from '../Community/communityTourSteps';
import { IslamicTimePickerModal } from '../Common/IslamicTimePickerModal';
import { useShowPageGuides } from '../../utils/guideManager';

interface PrayerTimesSettingsModalProps {
    isOpen: boolean;
    currentEditingKey: string | null;
    prayerNamesAr: Record<string, string>;
    primaryColor: string;
    secondaryColor: string;
    isBlackAndWhite: boolean;
    cardBorderColor?: string;
    isDefaultTheme?: boolean;
    isBlackTheme?: boolean;
    closeModal: () => void;
    tempOffset: number;
    setTempOffset: React.Dispatch<React.SetStateAction<number>>;
    tempIqama: number;
    setTempIqama: React.Dispatch<React.SetStateAction<number>>;
    tempIqamaEnabled: boolean;
    setTempIqamaEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    times: Record<string, string>;
    formatTime12_EN: (time: string) => string;
    applyOffset: (timeStr: string, offsetMins: number) => string;
    configTones: Record<string, any>;
    internetTones: { name: string; path: string }[];
    handleToneSelection: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleToneUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    saveUserConfig: () => void;
    isSummerTime?: boolean;
    // Readiness alert & Auto-silent settings
    isGlobalPreReminderActive: boolean;
    globalPreReminderMinutes: number;
    tempPreReminderEnabled: boolean;
    setTempPreReminderEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    tempPreReminderMinutes: number;
    setTempPreReminderMinutes: React.Dispatch<React.SetStateAction<number>>;
    isGlobalAutoSilentActive: boolean;
    globalAutoSilentDuration: number;
    tempAutoSilentEnabled: boolean;
    setTempAutoSilentEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    tempAutoSilentDuration: number;
    setTempAutoSilentDuration: React.Dispatch<React.SetStateAction<number>>;
}

const PrayerTimesSettingsModal: React.FC<PrayerTimesSettingsModalProps> = ({
    isOpen,
    currentEditingKey,
    prayerNamesAr,
    primaryColor: propPrimaryColor,
    secondaryColor: propSecondaryColor,
    isBlackAndWhite,
    isBlackTheme,
    cardBorderColor,
    isDefaultTheme,
    closeModal,
    tempOffset,
    setTempOffset,
    tempIqama,
    setTempIqama,
    tempIqamaEnabled,
    setTempIqamaEnabled,
    times,
    formatTime12_EN,
    applyOffset,
    configTones,
    internetTones,
    handleToneSelection,
    handleToneUpload,
    saveUserConfig,
    isSummerTime,
    isGlobalPreReminderActive,
    globalPreReminderMinutes,
    tempPreReminderEnabled,
    setTempPreReminderEnabled,
    tempPreReminderMinutes,
    setTempPreReminderMinutes,
    isGlobalAutoSilentActive,
    globalAutoSilentDuration,
    tempAutoSilentEnabled,
    setTempAutoSilentEnabled,
    tempAutoSilentDuration,
    setTempAutoSilentDuration
}) => {
    const showPageGuides = useShowPageGuides();
    const { language, isRTL, dir } = useLanguage();
    const { theme, themeKey, homeThemeVariant } = useTheme();
    const { alertVolume = 100, setAlertVolume } = usePrayerTimes();
    const [tempAlertVolume, setTempAlertVolume] = useState<number>(alertVolume);
    const [hasDndPermission, setHasDndPermission] = useState(true);
    const [showGuide, setShowGuide] = useState(false);

    // Local string state to handle manual typing seamlessly across Android APK and web
    const [offsetInputValue, setOffsetInputValue] = useState<string>(() => String(tempOffset));
    const [isDirectTimePickerOpen, setIsDirectTimePickerOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTempAlertVolume(alertVolume);
        }
    }, [isOpen, alertVolume]);

    useEffect(() => {
        if (isOpen && Capacitor.getPlatform() === 'android') {
            isDndPermissionGranted().then(setHasDndPermission).catch((err) => {
                console.warn('isDndPermissionGranted error:', err);
                setHasDndPermission(true);
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && currentEditingKey) {
            if (!getGuideSeen('prayer_settings_modal_spotlight')) {
                setShowGuide(true);
            }
        }
    }, [isOpen, currentEditingKey]);

    useEffect(() => {
        setOffsetInputValue(String(tempOffset));
    }, [tempOffset, currentEditingKey]);

    if (!isOpen || !currentEditingKey) return null;

    const handleTogglePreReminder = async () => {
        const nextState = !tempPreReminderEnabled;
        setTempPreReminderEnabled(nextState);
        if (nextState && Capacitor.isNativePlatform()) {
            try {
                const status = await LocalNotifications.checkPermissions();
                if (status.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }
            } catch (e) {
                console.warn('Notification permission check error', e);
            }
        }
    };

    const handleToggleIqama = async () => {
        const nextState = !tempIqamaEnabled;
        setTempIqamaEnabled(nextState);
        if (nextState && Capacitor.isNativePlatform()) {
            try {
                const status = await LocalNotifications.checkPermissions();
                if (status.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }
            } catch (e) {
                console.warn('Notification permission check error', e);
            }
        }
    };

    const handleToggleAutoSilent = async () => {
        const nextState = !tempAutoSilentEnabled;
        setTempAutoSilentEnabled(nextState);
        if (nextState && Capacitor.isNativePlatform()) {
            try {
                const status = await LocalNotifications.checkPermissions();
                if (status.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }
            } catch (e) {}
        }
        if (nextState && Capacitor.getPlatform() === 'android') {
            const granted = await isDndPermissionGranted();
            setHasDndPermission(granted);
        }
    };

    const isEffectiveBlack = isBlackTheme || isBlackAndWhite || themeKey === 'deep_black' || Boolean(theme?.isDark && theme?.bgColor === '#000000');

    const themeStyles = (() => {
        const cardShadowLight = '0 5px 0 rgba(0, 0, 0, 0.13), 0 10px 20px -2px rgba(0, 0, 0, 0.11), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(0, 0, 0, 0.05)';
        const chipShadowLight = '0 3px 0 rgba(0, 0, 0, 0.12), 0 5px 10px rgba(0, 0, 0, 0.08), inset 0 1.5px 1px rgba(255, 255, 255, 0.95)';
        const modalShadowLight = '0 8px 0 rgba(0, 0, 0, 0.16), 0 24px 48px rgba(0, 0, 0, 0.30), inset 0 2px 2px rgba(255, 255, 255, 0.92)';

        if (isEffectiveBlack) {
            return {
                modalBg: '#121214',
                modalShadow: '0 8px 0 #050507, 0 24px 50px rgba(0, 0, 0, 0.85), inset 0 2px 2px rgba(255, 255, 255, 0.14)',
                modalText: '#ffffff',
                cardBg: '#18181b',
                cardShadow: '0 5px 0 #09090b, 0 12px 24px rgba(0, 0, 0, 0.72), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.16), inset 0 -2px 4px rgba(0, 0, 0, 0.45)',
                chipBg: '#27272a',
                chipShadow: '0 3px 0 #09090b, 0 5px 10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.14)',
                dividerColor: 'rgba(255, 255, 255, 0.12)',
                inputBg: '#27272a',
                inputShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.65), inset 0 -1px 1px rgba(255, 255, 255, 0.12)',
                text: '#ffffff',
                subtext: '#a1a1aa',
                accent: '#ffffff',
                btnBg: '#ffffff',
                btnLip: '#52525b',
                btnText: '#000000'
            };
        }
        if (themeKey === 'sky_mode' || homeThemeVariant === 'sky') {
            const pageBg = (theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff') ? theme.bgColor : '#F0F9FF';
            return {
                modalBg: pageBg,
                modalShadow: modalShadowLight,
                modalText: '#0f172a',
                cardBg: '#ffffff',
                cardShadow: cardShadowLight,
                chipBg: '#ffffff',
                chipShadow: chipShadowLight,
                dividerColor: 'rgba(15, 23, 42, 0.08)',
                inputBg: '#f8fafc',
                inputShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.14), inset 0 -1px 1px rgba(255, 255, 255, 0.92)',
                text: '#0f172a',
                subtext: '#475569',
                accent: '#0284c7',
                btnBg: '#0284c7',
                btnLip: '#0369a1',
                btnText: '#ffffff'
            };
        }
        if (themeKey === 'emerald_mode' || homeThemeVariant === 'emerald') {
            const pageBg = (theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff') ? theme.bgColor : '#F0FDF4';
            return {
                modalBg: pageBg,
                modalShadow: modalShadowLight,
                modalText: '#0f172a',
                cardBg: '#ffffff',
                cardShadow: cardShadowLight,
                chipBg: '#ffffff',
                chipShadow: chipShadowLight,
                dividerColor: 'rgba(15, 23, 42, 0.08)',
                inputBg: '#f8fafc',
                inputShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.14), inset 0 -1px 1px rgba(255, 255, 255, 0.92)',
                text: '#0f172a',
                subtext: '#475569',
                accent: '#059669',
                btnBg: '#059669',
                btnLip: '#047857',
                btnText: '#ffffff'
            };
        }
        if (themeKey === 'burgundy_mode' || homeThemeVariant === 'burgundy') {
            const pageBg = (theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff') ? theme.bgColor : '#FFF1F2';
            return {
                modalBg: pageBg,
                modalShadow: modalShadowLight,
                modalText: '#0f172a',
                cardBg: '#ffffff',
                cardShadow: cardShadowLight,
                chipBg: '#ffffff',
                chipShadow: chipShadowLight,
                dividerColor: 'rgba(15, 23, 42, 0.08)',
                inputBg: '#f8fafc',
                inputShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.14), inset 0 -1px 1px rgba(255, 255, 255, 0.92)',
                text: '#0f172a',
                subtext: '#475569',
                accent: '#be123c',
                btnBg: '#be123c',
                btnLip: '#881337',
                btnText: '#ffffff'
            };
        }
        // Golden (Default Modern — matches NotificationSettingsModal #FEF9C3 + #ffffff cards + #ca8a04 accent)
        const pageBg = (theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff') ? theme.bgColor : '#FEF9C3';
        return {
            modalBg: pageBg,
            modalShadow: modalShadowLight,
            modalText: '#0f172a',
            cardBg: '#ffffff',
            cardShadow: cardShadowLight,
            chipBg: '#ffffff',
            chipShadow: chipShadowLight,
            dividerColor: 'rgba(15, 23, 42, 0.08)',
            inputBg: '#f8fafc',
            inputShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.14), inset 0 -1px 1px rgba(255, 255, 255, 0.92)',
            text: '#0f172a',
            subtext: '#475569',
            accent: '#ca8a04',
            btnBg: '#ca8a04',
            btnLip: '#a16207',
            btnText: '#ffffff'
        };
    })();

    const totalPreviewOffset = tempOffset + (isSummerTime ? 60 : 0);
    const isSunrise = currentEditingKey === 'Sunrise';

    const handleOffsetFocus = () => {
        setOffsetInputValue('');
    };

    const handleOffsetClick = () => {
        setOffsetInputValue('');
    };

    const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value;
        // Normalize Arabic-Indic digits (٠-٩, ۰-۹) and various unicode minus signs
        raw = raw
            .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
            .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
            .replace(/[−–—]/g, '-');

        if (raw === '' || raw === '-') {
            setOffsetInputValue(raw);
            setTempOffset(0);
            return;
        }

        // Match integer (optionally starting with -)
        const match = raw.match(/^-?\d*/);
        if (match && match[0] !== '') {
            const valStr = match[0];
            setOffsetInputValue(valStr);
            const parsed = parseInt(valStr, 10);
            if (!isNaN(parsed)) {
                const clamped = Math.max(-720, Math.min(720, parsed));
                setTempOffset(clamped);
            }
        } else {
            setOffsetInputValue(raw);
        }
    };

    const handleOffsetBlur = () => {
        if (offsetInputValue === '' || offsetInputValue === '-') {
            setOffsetInputValue('0');
            setTempOffset(0);
        } else {
            const parsed = parseInt(offsetInputValue, 10);
            if (isNaN(parsed)) {
                setOffsetInputValue('0');
                setTempOffset(0);
            } else {
                const clamped = Math.max(-720, Math.min(720, parsed));
                setOffsetInputValue(String(clamped));
                setTempOffset(clamped);
            }
        }
    };

    const handleDirectTimeChange = (newTimeStr: string) => {
        if (!newTimeStr || !times[currentEditingKey]) return;
        const [targetH, targetM] = newTimeStr.split(':').map(Number);
        const [baseH, baseM] = times[currentEditingKey].split(':').map(Number);
        if (isNaN(targetH) || isNaN(targetM) || isNaN(baseH) || isNaN(baseM)) return;
        let diff = (targetH * 60 + targetM) - (baseH * 60 + baseM);
        if (isSummerTime) diff -= 60;
        if (diff > 720) diff -= 1440;
        if (diff < -720) diff += 1440;
        setTempOffset(diff);
    };

    return (
        <div 
            dir={dir}
            className="fixed inset-0 bg-black/65 z-[60] flex items-center justify-center p-4 sm:p-6"
        >
            <div 
                className="rounded-[2.5rem] w-full max-w-sm max-h-[92dvh] flex flex-col p-5 sm:p-6 border-0" 
                style={{ 
                    backgroundColor: themeStyles.modalBg, 
                    color: themeStyles.modalText,
                    boxShadow: themeStyles.modalShadow
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3 pb-2.5 border-b shrink-0" style={{ borderColor: themeStyles.dividerColor }}>
                    <h3 className="font-black text-sm sm:text-base" style={{ color: themeStyles.accent }}>
                        {tPrayer('prayerSettingsTitle', language, { p: getPrayerDisplayName(currentEditingKey, language) })}
                    </h3>
                    <div className="flex items-center gap-2">
                        {showPageGuides && (
                            <button 
                                type="button"
                                onClick={() => setShowGuide(true)} 
                                className="unified-3d-btn w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-0" 
                                style={{ 
                                    backgroundColor: themeStyles.chipBg,
                                    color: themeStyles.accent,
                                    boxShadow: themeStyles.chipShadow
                                }}
                                title={language === 'en' ? "Settings Guide" : "دليل إعدادات الصلاة"}
                                aria-label={language === 'en' ? "Settings Guide" : "دليل إعدادات الصلاة"}
                            >
                                <HelpCircle size={17} />
                            </button>
                        )}
                        <button 
                            type="button"
                            onClick={closeModal} 
                            className="unified-3d-btn w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:text-red-500 border-0" 
                            style={{ 
                                backgroundColor: themeStyles.chipBg,
                                color: isEffectiveBlack ? '#e4e4e7' : '#475569',
                                boxShadow: themeStyles.chipShadow
                            }}
                            title={tPrayer('close', language)}
                            aria-label={tPrayer('close', language)}
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div id="prayer-settings-scroll-container" className="space-y-3.5 overflow-y-auto hide-scrollbar flex-1 min-h-0 px-0.5 pb-1">
                    {/* تعديل وقت الأذان يدوياً وبالأزرار */}
                    <div id="setting-adhan-adjustment">
                        <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest text-center" style={{ color: themeStyles.accent }}>
                            {tPrayer('adjustAdhanTime', language)}
                        </label>
                        <div 
                            className="flex items-center justify-between p-2.5 rounded-2xl border-0"
                            style={{ 
                                backgroundColor: themeStyles.cardBg, 
                                boxShadow: themeStyles.cardShadow
                            }}
                        >
                            <button 
                                 type="button" 
                                 onClick={() => setTempOffset(p => p - 1)} 
                                 className="unified-3d-btn w-10 h-10 rounded-xl flex items-center justify-center text-red-500 text-sm font-black cursor-pointer shrink-0 border-0"
                                 style={{ 
                                     backgroundColor: themeStyles.chipBg,
                                     boxShadow: themeStyles.chipShadow
                                 }}
                                 title={tPrayer('decreaseMinuteTooltip', language)}
                            >
                                <i className="fa-solid fa-minus"></i>
                            </button>

                            <div className="text-center flex flex-col items-center">
                                {/* Time display with direct time adjustment */}
                                <div className="relative group flex items-center justify-center gap-1.5">
                                    <span className="text-base font-black en-digits tracking-wide" style={{ color: themeStyles.text }}>
                                        {formatTime12_EN(applyOffset(times[currentEditingKey], totalPreviewOffset))}
                                    </span>
                                    <div className="relative flex items-center">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsDirectTimePickerOpen(true)}
                                            className="unified-3d-btn w-6 h-6 rounded-lg flex items-center justify-center text-[11px] cursor-pointer border-0"
                                            style={{ 
                                                backgroundColor: themeStyles.chipBg,
                                                color: themeStyles.accent,
                                                boxShadow: themeStyles.chipShadow
                                            }}
                                            title={tPrayer('directTimeEditTooltip', language)}
                                        >
                                            <i className="fa-regular fa-clock"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Manual minute offset input */}
                                <div className="flex items-center justify-center gap-1.5 mt-1.5" dir={dir}>
                                    <span className="text-[10px] font-bold" style={{ color: themeStyles.subtext }}>{tPrayer('offsetLabel', language)}</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9\-]*"
                                        dir="ltr"
                                        value={offsetInputValue}
                                        onFocus={handleOffsetFocus}
                                        onClick={handleOffsetClick}
                                        onChange={handleOffsetChange}
                                        onBlur={handleOffsetBlur}
                                        className="w-14 text-center text-xs font-black py-0.5 px-1.5 rounded-lg en-digits focus:outline-hidden cursor-text border-0"
                                        style={{ 
                                            backgroundColor: themeStyles.inputBg,
                                            boxShadow: themeStyles.inputShadow,
                                            color: themeStyles.text 
                                        }}
                                        title={tPrayer('manualOffsetTooltip', language)}
                                        placeholder="0"
                                    />
                                    <span className="text-[10px] font-bold" style={{ color: themeStyles.subtext }}>{tPrayer('minuteShort', language)}</span>
                                </div>
                            </div>

                            <button 
                                type="button" 
                                onClick={() => setTempOffset(p => p + 1)} 
                                className="unified-3d-btn w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black cursor-pointer shrink-0 border-0" 
                                style={{ 
                                    backgroundColor: themeStyles.chipBg,
                                    color: themeStyles.text,
                                    boxShadow: themeStyles.chipShadow
                                }}
                                title={tPrayer('increaseMinuteTooltip', language)}
                            >
                                <i className="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    {/* نغمة التنبيه */}
                    <div id="setting-tone-selector">
                        <ToneSelector 
                            currentEditingKey={currentEditingKey}
                            configTones={configTones}
                            internetTones={internetTones}
                            handleToneSelection={handleToneSelection}
                            handleToneUpload={handleToneUpload}
                            secondaryColor={themeStyles.subtext}
                            primaryColor={themeStyles.accent}
                            isDefaultTheme={isDefaultTheme}
                            isBlackTheme={isEffectiveBlack}
                            cardBg={themeStyles.cardBg}
                            modalBg={themeStyles.modalBg}
                        />
                    </div>

                    {/* 1. تنبيه الاستعداد للصلاة */}
                    {!isSunrise && (
                        <div 
                            id="setting-pre-reminder" 
                            className="p-2.5 rounded-2xl space-y-1.5 transition-all border-0"
                            style={{ 
                                backgroundColor: themeStyles.cardBg, 
                                boxShadow: themeStyles.cardShadow
                            }}
                        >
                            <div className="flex items-center justify-between gap-3">
                                {/* Toggle Switch */}
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={tempPreReminderEnabled}
                                    onClick={handleTogglePreReminder}
                                    className={`app-3d-switch-track w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                                        tempPreReminderEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    style={{ backgroundColor: tempPreReminderEnabled ? themeStyles.accent : undefined }}
                                    title={tPrayer('readinessReminder', language)}
                                >
                                    <div
                                        className={`app-3d-switch-thumb ${isEffectiveBlack && tempPreReminderEnabled ? 'app-3d-switch-thumb-dark' : ''} w-4 h-4 rounded-full transform transition-transform ${
                                            tempPreReminderEnabled 
                                                ? (isRTL ? (isEffectiveBlack ? 'bg-black -translate-x-5' : 'bg-white -translate-x-5') : (isEffectiveBlack ? 'bg-black translate-x-5' : 'bg-white translate-x-5'))
                                                : 'bg-white translate-x-0'
                                        }`}
                                    />
                                </button>

                                {/* Title & Badge */}
                                <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-start gap-1.5 flex-wrap`} dir={dir}>
                                    <span className="font-bold text-xs" style={{ color: themeStyles.text }}>
                                        {tPrayer('readinessReminder', language)}
                                    </span>
                                    <span 
                                        className="app-3d-badge text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors"
                                        style={{
                                            backgroundColor: isEffectiveBlack ? 'rgba(255, 255, 255, 0.15)' : `${themeStyles.accent}1f`,
                                            color: isEffectiveBlack ? '#ffffff' : themeStyles.accent
                                        }}
                                    >
                                        {tPrayer('beforeMinutes', language, { m: tempPreReminderMinutes })}
                                    </span>
                                </div>
                            </div>

                            {/* Duration options and +/- buttons */}
                            <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: themeStyles.dividerColor }} dir={dir}>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] opacity-80" style={{ color: themeStyles.subtext }}>{tPrayer('timeLabel', language)}</span>
                                    {[10, 15, 20].map((mins) => {
                                        const isSelected = tempPreReminderMinutes === mins;
                                        return (
                                            <button
                                                key={mins}
                                                type="button"
                                                onClick={() => setTempPreReminderMinutes(mins)}
                                                className="unified-3d-btn px-2.5 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer border-0"
                                                style={isSelected ? {
                                                    backgroundColor: themeStyles.btnBg,
                                                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.06) 100%)',
                                                    color: themeStyles.btnText,
                                                    boxShadow: `0 2.5px 0 ${themeStyles.btnLip}, 0 4px 8px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.35)`
                                                } : {
                                                    backgroundColor: themeStyles.chipBg,
                                                    color: themeStyles.text,
                                                    boxShadow: themeStyles.chipShadow
                                                }}
                                            >
                                                {mins}{tPrayer('minuteShort', language)}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* +/- Buttons */}
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        type="button" 
                                        onClick={() => setTempPreReminderMinutes(p => Math.max(1, p - 1))} 
                                        className="unified-3d-btn w-6 h-6 rounded-lg flex items-center justify-center text-red-500 text-[10px] font-black cursor-pointer border-0"
                                        style={{
                                            backgroundColor: themeStyles.chipBg,
                                            boxShadow: themeStyles.chipShadow
                                        }}
                                        title={tPrayer('decreaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTempPreReminderMinutes(p => p + 1)} 
                                        className="unified-3d-btn w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black cursor-pointer border-0"
                                        style={{ 
                                            backgroundColor: themeStyles.chipBg,
                                            color: themeStyles.text,
                                            boxShadow: themeStyles.chipShadow
                                        }}
                                        title={tPrayer('increaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. تنبيه الإقامة */}
                    {!isSunrise && (
                        <div 
                            id="setting-iqama-alert" 
                            className="p-2.5 rounded-2xl space-y-1.5 transition-all border-0"
                            style={{ 
                                backgroundColor: themeStyles.cardBg, 
                                boxShadow: themeStyles.cardShadow
                            }}
                        >
                            <div className="flex items-center justify-between gap-3">
                                {/* Toggle Switch */}
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={tempIqamaEnabled}
                                    onClick={handleToggleIqama}
                                    className={`app-3d-switch-track w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                                        tempIqamaEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    style={{ backgroundColor: tempIqamaEnabled ? themeStyles.accent : undefined }}
                                    title={tPrayer('iqamaToggleTooltip', language)}
                                >
                                    <div
                                        className={`app-3d-switch-thumb ${isEffectiveBlack && tempIqamaEnabled ? 'app-3d-switch-thumb-dark' : ''} w-4 h-4 rounded-full transform transition-transform ${
                                            tempIqamaEnabled 
                                                ? (isRTL ? (isEffectiveBlack ? 'bg-black -translate-x-5' : 'bg-white -translate-x-5') : (isEffectiveBlack ? 'bg-black translate-x-5' : 'bg-white translate-x-5'))
                                                : 'bg-white translate-x-0'
                                        }`}
                                    />
                                </button>

                                {/* Title & Badge */}
                                <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-start gap-1.5 flex-wrap`} dir={dir}>
                                    <span className="font-bold text-xs" style={{ color: themeStyles.text }}>
                                        {tPrayer('iqamaAlert', language)}
                                    </span>
                                    <span 
                                        className="app-3d-badge text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors"
                                        style={{
                                            backgroundColor: isEffectiveBlack ? 'rgba(255, 255, 255, 0.15)' : `${themeStyles.accent}1f`,
                                            color: isEffectiveBlack ? '#ffffff' : themeStyles.accent
                                        }}
                                    >
                                        {tPrayer('afterMinutes', language, { m: tempIqama })}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        playNotificationSound('/assets/audio/notif_droplet.wav', true);
                                    }}
                                    className="unified-3d-btn px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0 border-0"
                                    title={tPrayer('iqamaSoundPreviewTooltip', language)}
                                    style={{ 
                                        backgroundColor: themeStyles.chipBg,
                                        color: themeStyles.accent,
                                        boxShadow: themeStyles.chipShadow
                                    }}
                                >
                                    <i className="fa-solid fa-volume-high text-[9px]"></i>
                                    <span>{tPrayer('iqamaSoundBtn', language)}</span>
                                </button>
                            </div>

                            {/* Duration options and inline +/- */}
                            <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: themeStyles.dividerColor }} dir={dir}>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] opacity-80" style={{ color: themeStyles.subtext }}>{tPrayer('durationLabel', language)}</span>
                                    {[10, 15, 20].map((mins) => {
                                        const isSelected = tempIqama === mins;
                                        return (
                                            <button
                                                key={mins}
                                                type="button"
                                                onClick={() => setTempIqama(mins)}
                                                className="unified-3d-btn px-2.5 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer border-0"
                                                style={isSelected ? {
                                                    backgroundColor: themeStyles.btnBg,
                                                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.06) 100%)',
                                                    color: themeStyles.btnText,
                                                    boxShadow: `0 2.5px 0 ${themeStyles.btnLip}, 0 4px 8px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.35)`
                                                } : {
                                                    backgroundColor: themeStyles.chipBg,
                                                    color: themeStyles.text,
                                                    boxShadow: themeStyles.chipShadow
                                                }}
                                            >
                                                {mins}{tPrayer('minuteShort', language)}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Fine-tuning +/- buttons */}
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        type="button" 
                                        onClick={() => setTempIqama(p => Math.max(0, p - 1))} 
                                        className="unified-3d-btn w-6 h-6 rounded-lg flex items-center justify-center text-red-500 text-[10px] font-black cursor-pointer border-0"
                                        style={{
                                            backgroundColor: themeStyles.chipBg,
                                            boxShadow: themeStyles.chipShadow
                                        }}
                                        title={tPrayer('decreaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTempIqama(p => p + 1)} 
                                        className="unified-3d-btn w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black cursor-pointer border-0"
                                        style={{ 
                                            backgroundColor: themeStyles.chipBg,
                                            color: themeStyles.text,
                                            boxShadow: themeStyles.chipShadow
                                        }}
                                        title={tPrayer('increaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. الصامت التلقائي */}
                    {!isSunrise && (
                        <div 
                            id="setting-auto-silent" 
                            className="p-2.5 rounded-2xl space-y-1.5 transition-all border-0"
                            style={{ 
                                backgroundColor: themeStyles.cardBg, 
                                boxShadow: themeStyles.cardShadow
                            }}
                        >
                            <div className="flex items-center justify-between gap-3">
                                {/* Toggle Switch */}
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={tempAutoSilentEnabled}
                                    onClick={handleToggleAutoSilent}
                                    className={`app-3d-switch-track w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                                        tempAutoSilentEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    style={{ backgroundColor: tempAutoSilentEnabled ? themeStyles.accent : undefined }}
                                    title={tPrayer('autoSilent', language)}
                                >
                                    <div
                                        className={`app-3d-switch-thumb ${isEffectiveBlack && tempAutoSilentEnabled ? 'app-3d-switch-thumb-dark' : ''} w-4 h-4 rounded-full transform transition-transform ${
                                            tempAutoSilentEnabled 
                                                ? (isRTL ? (isEffectiveBlack ? 'bg-black -translate-x-5' : 'bg-white -translate-x-5') : (isEffectiveBlack ? 'bg-black translate-x-5' : 'bg-white translate-x-5'))
                                                : 'bg-white translate-x-0'
                                        }`}
                                    />
                                </button>

                                {/* Title & Badge */}
                                <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-start gap-1.5 flex-wrap`} dir={dir}>
                                    <span className="font-bold text-xs" style={{ color: themeStyles.text }}>
                                        {tPrayer('autoSilent', language)}
                                    </span>
                                    <span 
                                        className="app-3d-badge text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors"
                                        style={{
                                            backgroundColor: isEffectiveBlack ? 'rgba(255, 255, 255, 0.15)' : `${themeStyles.accent}1f`,
                                            color: isEffectiveBlack ? '#ffffff' : themeStyles.accent
                                        }}
                                    >
                                        {tempAutoSilentDuration}{tPrayer('minuteShort', language)}
                                    </span>
                                </div>
                            </div>

                            {/* Duration options and +/- buttons */}
                            <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: themeStyles.dividerColor }} dir={dir}>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] opacity-80" style={{ color: themeStyles.subtext }}>{tPrayer('durationLabel', language)}</span>
                                    {[10, 15, 20].map((duration) => {
                                        const isSelected = tempAutoSilentDuration === duration;
                                        return (
                                            <button
                                                key={duration}
                                                type="button"
                                                onClick={() => setTempAutoSilentDuration(duration)}
                                                className="unified-3d-btn px-2.5 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer border-0"
                                                style={isSelected ? {
                                                    backgroundColor: themeStyles.btnBg,
                                                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.06) 100%)',
                                                    color: themeStyles.btnText,
                                                    boxShadow: `0 2.5px 0 ${themeStyles.btnLip}, 0 4px 8px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.35)`
                                                } : {
                                                    backgroundColor: themeStyles.chipBg,
                                                    color: themeStyles.text,
                                                    boxShadow: themeStyles.chipShadow
                                                }}
                                            >
                                                {duration}{tPrayer('minuteShort', language)}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* +/- Buttons */}
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        type="button" 
                                        onClick={() => setTempAutoSilentDuration(p => Math.max(1, p - 1))} 
                                        className="unified-3d-btn w-6 h-6 rounded-lg flex items-center justify-center text-red-500 text-[10px] font-black cursor-pointer border-0"
                                        style={{
                                            backgroundColor: themeStyles.chipBg,
                                            boxShadow: themeStyles.chipShadow
                                        }}
                                        title={tPrayer('decreaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTempAutoSilentDuration(p => p + 1)} 
                                        className="unified-3d-btn w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black cursor-pointer border-0"
                                        style={{ 
                                            backgroundColor: themeStyles.chipBg,
                                            color: themeStyles.text,
                                            boxShadow: themeStyles.chipShadow
                                        }}
                                        title={tPrayer('increaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Android DND Permission Notice if not granted */}
                            {tempAutoSilentEnabled && !hasDndPermission && Capacitor.getPlatform() === 'android' && (
                                <div 
                                    className={`mt-1.5 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-between gap-2`} 
                                    dir={dir}
                                    style={{ boxShadow: '0 3px 0 rgba(217,119,6,0.22), inset 0 1px 1px rgba(255,255,255,0.4)' }}
                                >
                                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                        <span>{tPrayer('dndRequiredNotice', language)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await requestDndPermission();
                                            setTimeout(async () => {
                                                const granted = await isDndPermissionGranted();
                                                setHasDndPermission(granted);
                                            }, 1500);
                                        }}
                                        className="unified-3d-btn text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer border-0"
                                        style={{ 
                                            backgroundColor: themeStyles.btnBg,
                                            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.06) 100%)',
                                            color: themeStyles.btnText,
                                            boxShadow: `0 2.5px 0 ${themeStyles.btnLip}, 0 4px 8px rgba(0,0,0,0.16), inset 0 1px 1px rgba(255,255,255,0.35)`
                                        }}
                                    >
                                        {tPrayer('grantPermission', language)}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Save button */}
                <button 
                    id="setting-save-btn"
                    onClick={() => {
                        setAlertVolume(tempAlertVolume);
                        saveUserConfig();
                    }} 
                    className="unified-3d-btn w-full mt-4 py-3 sm:py-3.5 rounded-2xl font-black text-sm shrink-0 cursor-pointer border-0" 
                    style={{ 
                        backgroundColor: themeStyles.btnBg,
                        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(0,0,0,0.08) 100%)',
                        color: themeStyles.btnText,
                        boxShadow: `0 5px 0 ${themeStyles.btnLip}, 0 14px 26px -4px rgba(0,0,0,0.24), inset 0 1.5px 1px rgba(255,255,255,0.45)`
                    }}
                >
                    {tPrayer('saveChanges', language)}
                </button>
            </div>

            {/* Spotlight Guidance Tour for Prayer Settings Modal */}
            <CommunitySpotlightGuide
                guideKey="prayer_settings_modal_spotlight"
                steps={PRAYER_SETTINGS_MODAL_STEPS}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={language === 'en'}
            />

            {isDirectTimePickerOpen && currentEditingKey && (
                <IslamicTimePickerModal
                    isOpen={isDirectTimePickerOpen}
                    onClose={() => setIsDirectTimePickerOpen(false)}
                    initialTime={applyOffset(times[currentEditingKey], totalPreviewOffset)}
                    onSave={(newTime24) => handleDirectTimeChange(newTime24)}
                    title={tPrayer('prayerSettingsTitle', language, { p: getPrayerDisplayName(currentEditingKey, language) })}
                    accentColor={themeStyles.accent}
                />
            )}
        </div>
    );
};

export default PrayerTimesSettingsModal;
