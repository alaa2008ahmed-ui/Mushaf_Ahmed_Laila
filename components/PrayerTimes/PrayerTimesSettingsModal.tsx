import React, { useState, useEffect } from 'react';
import { ShieldAlert, HelpCircle } from 'lucide-react';
import ToneSelector from './ToneSelector';
import { Capacitor } from '@capacitor/core';
import { isDndPermissionGranted, requestDndPermission } from '../../utils/silentMode';
import { LocalNotifications } from '@capacitor/local-notifications';
import { playNotificationSound } from '../../utils/prayerTimesUtils';
import { useLanguage } from '../../context/LanguageContext';
import { tPrayer, getPrayerDisplayName } from '../../utils/prayerTimesTranslations';
import { CommunitySpotlightGuide, getGuideSeen } from '../Community/CommunitySpotlightGuide';
import { PRAYER_SETTINGS_MODAL_STEPS } from '../Community/communityTourSteps';

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
    const { language, isRTL, dir } = useLanguage();
    const [hasDndPermission, setHasDndPermission] = useState(true);
    const [showGuide, setShowGuide] = useState(false);
    // Local string state to handle manual typing seamlessly across Android APK and web
    const [offsetInputValue, setOffsetInputValue] = useState<string>(() => String(tempOffset));

    useEffect(() => {
        if (isOpen && Capacitor.getPlatform() === 'android') {
            isDndPermissionGranted().then(setHasDndPermission);
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

    const isEffectiveBlack = isBlackTheme || isBlackAndWhite;
    const primaryColor = isEffectiveBlack ? '#FFFFFF' : propPrimaryColor;
    const secondaryColor = isEffectiveBlack ? '#FFFFFF' : propSecondaryColor;
    const modalBorderColor = cardBorderColor || (isDefaultTheme ? '#000000' : (isEffectiveBlack ? '#FFFFFF' : primaryColor));
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 sm:p-6 scale-in"
        >
            <div 
                className="rounded-[2.5rem] w-full max-w-sm max-h-[92vh] flex flex-col p-5 sm:p-6 shadow-2xl" 
                style={{ 
                    backgroundColor: 'var(--modal-bg)', 
                    color: 'var(--modal-text)',
                    border: `2px solid ${modalBorderColor}`
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b shrink-0" style={{ borderColor: 'var(--card-border)' }}>
                    <h3 className="font-black text-sm sm:text-base" style={{ color: primaryColor }}>
                        {tPrayer('prayerSettingsTitle', language, { p: getPrayerDisplayName(currentEditingKey, language) })}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <button 
                            type="button"
                            onClick={() => setShowGuide(true)} 
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer" 
                            style={{ color: secondaryColor }}
                            title={language === 'en' ? "Settings Guide" : "دليل إعدادات الصلاة"}
                            aria-label={language === 'en' ? "Settings Guide" : "دليل إعدادات الصلاة"}
                        >
                            <HelpCircle size={19} />
                        </button>
                        <button 
                            onClick={closeModal} 
                            className="hover:text-red-500 transition-colors cursor-pointer" 
                            style={{ color: secondaryColor }}
                            title={tPrayer('close', language)}
                            aria-label={tPrayer('close', language)}
                        >
                            <i className="fa-solid fa-circle-xmark text-2xl"></i>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div id="prayer-settings-scroll-container" className="space-y-3 overflow-y-auto hide-scrollbar flex-1 pr-0.5">
                    {/* تعديل وقت الأذان يدوياً وبالأزرار */}
                    <div id="setting-adhan-adjustment">
                        <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest text-center" style={{ color: secondaryColor }}>
                            {tPrayer('adjustAdhanTime', language)}
                        </label>
                        <div className="flex items-center justify-between themed-bg-alt p-2 rounded-2xl border-2 border-black dark:border-white shadow-xs">
                            <button 
                                type="button" 
                                onClick={() => setTempOffset(p => p - 1)} 
                                className="control-btn text-red-500 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                                title={tPrayer('decreaseMinuteTooltip', language)}
                            >
                                <i className="fa-solid fa-minus"></i>
                            </button>

                            <div className="text-center flex flex-col items-center">
                                {/* Time display with direct time adjustment */}
                                <div className="relative group flex items-center justify-center gap-1.5">
                                    <span className="text-base font-black en-digits tracking-wide" style={{ color: primaryColor }}>
                                        {formatTime12_EN(applyOffset(times[currentEditingKey], totalPreviewOffset))}
                                    </span>
                                    <div className="relative flex items-center">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newTime = prompt(tPrayer('directTimePrompt', language), formatTime12_EN(applyOffset(times[currentEditingKey], totalPreviewOffset)));
                                                if (newTime) {
                                                    handleDirectTimeChange(newTime);
                                                }
                                            }}
                                            className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center text-[11px] opacity-70 hover:opacity-100 cursor-pointer"
                                            style={{ color: primaryColor }}
                                            title={tPrayer('directTimeEditTooltip', language)}
                                        >
                                            <i className="fa-regular fa-clock"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Manual minute offset input */}
                                <div className="flex items-center justify-center gap-1 mt-1" dir={dir}>
                                    <span className="text-[10px] font-bold" style={{ color: secondaryColor }}>{tPrayer('offsetLabel', language)}</span>
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
                                        className="w-14 text-center text-xs font-black py-0.5 px-1 rounded-md bg-black/5 dark:bg-white/10 border border-black/15 dark:border-white/20 en-digits focus:outline-hidden cursor-text"
                                        style={{ color: primaryColor }}
                                        title={tPrayer('manualOffsetTooltip', language)}
                                        placeholder="0"
                                    />
                                    <span className="text-[10px] font-bold" style={{ color: secondaryColor }}>{tPrayer('minuteShort', language)}</span>
                                </div>
                            </div>

                            <button 
                                type="button" 
                                onClick={() => setTempOffset(p => p + 1)} 
                                className="control-btn shadow-sm cursor-pointer hover:scale-105 active:scale-95" 
                                style={{ color: primaryColor }}
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
                            secondaryColor={secondaryColor}
                            primaryColor={primaryColor}
                            cardBorderColor={cardBorderColor}
                            isDefaultTheme={isDefaultTheme}
                            isBlackTheme={isEffectiveBlack}
                        />
                    </div>

                    {/* 1. تنبيه الاستعداد للصلاة */}
                    {!isSunrise && (
                        <div id="setting-pre-reminder" className="themed-bg-alt p-2.5 rounded-2xl border-2 border-black dark:border-white shadow-xs space-y-1.5 transition-all">
                            <div className="flex items-center justify-between gap-3">
                                {/* Toggle Switch */}
                                <button
                                    type="button"
                                    onClick={handleTogglePreReminder}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                                        tempPreReminderEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    style={{ backgroundColor: tempPreReminderEnabled ? (isEffectiveBlack ? '#FFFFFF' : primaryColor) : undefined }}
                                    title={tPrayer('readinessReminder', language)}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                            tempPreReminderEnabled 
                                                ? (isEffectiveBlack ? (isRTL ? 'bg-black -translate-x-5' : 'bg-black translate-x-5') : (isRTL ? 'bg-white -translate-x-5' : 'bg-white translate-x-5')) 
                                                : 'bg-white translate-x-0'
                                        }`}
                                    />
                                </button>

                                {/* Title & Badge */}
                                <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-start gap-1.5 flex-wrap`} dir={dir}>
                                    <span className="font-bold text-xs" style={{ color: isEffectiveBlack ? '#FFFFFF' : undefined }}>
                                        {tPrayer('readinessReminder', language)}
                                    </span>
                                    <span 
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors"
                                        style={{
                                            backgroundColor: isEffectiveBlack ? 'rgba(255,255,255,0.18)' : `${primaryColor}18`,
                                            color: isEffectiveBlack ? '#FFFFFF' : primaryColor
                                        }}
                                    >
                                        {tPrayer('beforeMinutes', language, { m: tempPreReminderMinutes })}
                                    </span>
                                </div>
                            </div>

                            {/* Duration options and +/- buttons */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-black/10 dark:border-white/10" dir={dir}>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] opacity-80" style={{ color: isEffectiveBlack ? '#FFFFFF' : undefined }}>{tPrayer('timeLabel', language)}</span>
                                    {[10, 15, 20].map((mins) => {
                                        const isSelected = tempPreReminderMinutes === mins;
                                        return (
                                            <button
                                                key={mins}
                                                type="button"
                                                onClick={() => setTempPreReminderMinutes(mins)}
                                                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'shadow-xs'
                                                        : 'bg-black/5 dark:bg-white/10 opacity-90 hover:opacity-100'
                                                }`}
                                                style={isSelected ? {
                                                    backgroundColor: isEffectiveBlack ? '#FFFFFF' : primaryColor,
                                                    color: isEffectiveBlack ? '#000000' : '#ffffff'
                                                } : {
                                                    color: isEffectiveBlack ? '#FFFFFF' : undefined
                                                }}
                                            >
                                                {mins}{tPrayer('minuteShort', language)}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* +/- Buttons */}
                                <div className="flex items-center gap-1">
                                    <button 
                                        type="button" 
                                        onClick={() => setTempPreReminderMinutes(p => Math.max(1, p - 1))} 
                                        className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center text-red-500 text-[10px] font-bold hover:scale-105 active:scale-95 cursor-pointer"
                                        title={tPrayer('decreaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTempPreReminderMinutes(p => p + 1)} 
                                        className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold hover:scale-105 active:scale-95 cursor-pointer"
                                        style={{ color: primaryColor }}
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
                        <div id="setting-iqama-alert" className="themed-bg-alt p-2.5 rounded-2xl border-2 border-black dark:border-white shadow-xs space-y-1.5 transition-all">
                            <div className="flex items-center justify-between gap-3">
                                {/* Toggle Switch */}
                                <button
                                    type="button"
                                    onClick={handleToggleIqama}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                                        tempIqamaEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    style={{ backgroundColor: tempIqamaEnabled ? (isEffectiveBlack ? '#FFFFFF' : primaryColor) : undefined }}
                                    title={tPrayer('iqamaToggleTooltip', language)}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                            tempIqamaEnabled 
                                                ? (isEffectiveBlack ? (isRTL ? 'bg-black -translate-x-5' : 'bg-black translate-x-5') : (isRTL ? 'bg-white -translate-x-5' : 'bg-white translate-x-5')) 
                                                : 'bg-white translate-x-0'
                                        }`}
                                    />
                                </button>

                                {/* Title & Badge */}
                                <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-start gap-1.5 flex-wrap`} dir={dir}>
                                    <span className="font-bold text-xs" style={{ color: isEffectiveBlack ? '#FFFFFF' : undefined }}>
                                        {tPrayer('iqamaAlert', language)}
                                    </span>
                                    <span 
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors"
                                        style={{
                                            backgroundColor: isEffectiveBlack ? 'rgba(255,255,255,0.18)' : `${primaryColor}18`,
                                            color: isEffectiveBlack ? '#FFFFFF' : primaryColor
                                        }}
                                    >
                                        {tPrayer('afterMinutes', language, { m: tempIqama })}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => playNotificationSound('/assets/audio/chime.mp3', true)}
                                    className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                                    title={tPrayer('iqamaSoundPreviewTooltip', language)}
                                    style={{ color: primaryColor }}
                                >
                                    <i className="fa-solid fa-volume-high text-[9px]"></i>
                                    <span>{tPrayer('iqamaSoundBtn', language)}</span>
                                </button>
                            </div>

                            {/* Duration options and inline +/- */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-black/10 dark:border-white/10" dir={dir}>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] opacity-80" style={{ color: isEffectiveBlack ? '#FFFFFF' : undefined }}>{tPrayer('durationLabel', language)}</span>
                                    {[10, 15, 20].map((mins) => {
                                        const isSelected = tempIqama === mins;
                                        return (
                                            <button
                                                key={mins}
                                                type="button"
                                                onClick={() => setTempIqama(mins)}
                                                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'shadow-xs'
                                                        : 'bg-black/5 dark:bg-white/10 opacity-90 hover:opacity-100'
                                                }`}
                                                style={isSelected ? {
                                                    backgroundColor: isEffectiveBlack ? '#FFFFFF' : primaryColor,
                                                    color: isEffectiveBlack ? '#000000' : '#ffffff'
                                                } : {
                                                    color: isEffectiveBlack ? '#FFFFFF' : undefined
                                                }}
                                            >
                                                {mins}{tPrayer('minuteShort', language)}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Fine-tuning +/- buttons */}
                                <div className="flex items-center gap-1">
                                    <button 
                                        type="button" 
                                        onClick={() => setTempIqama(p => Math.max(0, p - 1))} 
                                        className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center text-red-500 text-[10px] font-bold hover:scale-105 active:scale-95 cursor-pointer"
                                        title={tPrayer('decreaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTempIqama(p => p + 1)} 
                                        className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold hover:scale-105 active:scale-95 cursor-pointer"
                                        style={{ color: primaryColor }}
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
                        <div id="setting-auto-silent" className="themed-bg-alt p-2.5 rounded-2xl border-2 border-black dark:border-white shadow-xs space-y-1.5 transition-all">
                            <div className="flex items-center justify-between gap-3">
                                {/* Toggle Switch */}
                                <button
                                    type="button"
                                    onClick={handleToggleAutoSilent}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                                        tempAutoSilentEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    style={{ backgroundColor: tempAutoSilentEnabled ? (isEffectiveBlack ? '#FFFFFF' : primaryColor) : undefined }}
                                    title={tPrayer('autoSilent', language)}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                            tempAutoSilentEnabled 
                                                ? (isEffectiveBlack ? (isRTL ? 'bg-black -translate-x-5' : 'bg-black translate-x-5') : (isRTL ? 'bg-white -translate-x-5' : 'bg-white translate-x-5')) 
                                                : 'bg-white translate-x-0'
                                        }`}
                                    />
                                </button>

                                {/* Title & Badge */}
                                <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-start gap-1.5 flex-wrap`} dir={dir}>
                                    <span className="font-bold text-xs" style={{ color: isEffectiveBlack ? '#FFFFFF' : undefined }}>
                                        {tPrayer('autoSilent', language)}
                                    </span>
                                    <span 
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors"
                                        style={{
                                            backgroundColor: isEffectiveBlack ? 'rgba(255,255,255,0.18)' : `${primaryColor}18`,
                                            color: isEffectiveBlack ? '#FFFFFF' : primaryColor
                                        }}
                                    >
                                        {tempAutoSilentDuration}{tPrayer('minuteShort', language)}
                                    </span>
                                </div>
                            </div>

                            {/* Duration options and +/- buttons */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-black/10 dark:border-white/10" dir={dir}>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] opacity-80" style={{ color: isEffectiveBlack ? '#FFFFFF' : undefined }}>{tPrayer('durationLabel', language)}</span>
                                    {[10, 15, 20].map((duration) => {
                                        const isSelected = tempAutoSilentDuration === duration;
                                        return (
                                            <button
                                                key={duration}
                                                type="button"
                                                onClick={() => setTempAutoSilentDuration(duration)}
                                                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'shadow-xs'
                                                        : 'bg-black/5 dark:bg-white/10 opacity-90 hover:opacity-100'
                                                }`}
                                                style={isSelected ? {
                                                    backgroundColor: isEffectiveBlack ? '#FFFFFF' : primaryColor,
                                                    color: isEffectiveBlack ? '#000000' : '#ffffff'
                                                } : {
                                                    color: isEffectiveBlack ? '#FFFFFF' : undefined
                                                }}
                                            >
                                                {duration}{tPrayer('minuteShort', language)}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* +/- Buttons */}
                                <div className="flex items-center gap-1">
                                    <button 
                                        type="button" 
                                        onClick={() => setTempAutoSilentDuration(p => Math.max(1, p - 1))} 
                                        className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center text-red-500 text-[10px] font-bold hover:scale-105 active:scale-95 cursor-pointer"
                                        title={tPrayer('decreaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTempAutoSilentDuration(p => p + 1)} 
                                        className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold hover:scale-105 active:scale-95 cursor-pointer"
                                        style={{ color: primaryColor }}
                                        title={tPrayer('increaseMinuteTooltip', language)}
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Android DND Permission Notice if not granted */}
                            {tempAutoSilentEnabled && !hasDndPermission && Capacitor.getPlatform() === 'android' && (
                                <div className={`mt-1.5 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-between gap-2`} dir={dir}>
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
                                        className="text-[10px] font-bold px-2 py-1 rounded-lg text-white shrink-0 cursor-pointer shadow-xs active:scale-95"
                                        style={{ backgroundColor: isEffectiveBlack ? '#FFFFFF' : primaryColor, color: isEffectiveBlack ? '#000000' : '#FFFFFF' }}
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
                    onClick={saveUserConfig} 
                    className="w-full mt-4 text-white py-3 sm:py-3.5 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer" 
                    style={{backgroundColor: isEffectiveBlack ? '#FFFFFF' : primaryColor, color: isEffectiveBlack ? '#000000' : '#FFF'}}
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
        </div>
    );
};

export default PrayerTimesSettingsModal;
