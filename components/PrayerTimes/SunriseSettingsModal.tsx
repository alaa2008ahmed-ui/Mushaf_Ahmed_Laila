import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Sun, Clock } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { SunriseAlertsConfig, DEFAULT_SUNRISE_ALERTS } from '../../context/PrayerTimesContext';
import { tPrayer } from '../../utils/prayerTimesTranslations';
import { applyOffset, formatTime12_EN } from '../../utils/prayerTimesUtils';
import { CommunitySpotlightGuide, getGuideSeen } from '../Community/CommunitySpotlightGuide';
import { SUNRISE_SETTINGS_MODAL_STEPS } from '../Community/communityTourSteps';
import { IslamicTimePickerModal } from '../Common/IslamicTimePickerModal';
import { useShowPageGuides } from '../../utils/guideManager';

interface SunriseSettingsModalProps {
    isOpen: boolean;
    closeModal: () => void;
    sunriseTimeStr: string;
    currentSunriseOffset: number;
    isSummerTime?: boolean;
    currentSettings?: SunriseAlertsConfig;
    isSunriseMuted: boolean;
    onSave: (settings: SunriseAlertsConfig, sunriseOffset: number) => void;
    isBlackAndWhite?: boolean;
    isBlackTheme?: boolean;
}

const SunriseSettingsModal: React.FC<SunriseSettingsModalProps> = ({
    isOpen,
    closeModal,
    sunriseTimeStr,
    currentSunriseOffset,
    isSummerTime,
    currentSettings,
    isSunriseMuted,
    onSave,
    isBlackAndWhite,
    isBlackTheme
}) => {
    const showPageGuides = useShowPageGuides();
    const { language, isRTL, dir, formatNumber } = useLanguage();
    const { theme, themeKey, homeThemeVariant } = useTheme();
    const isEn = language === 'en';

    const [tempSunriseOffset, setTempSunriseOffset] = useState<number>(currentSunriseOffset || 0);
    const [offsetInputValue, setOffsetInputValue] = useState<string>(() => String(currentSunriseOffset || 0));
    const [isDirectTimePickerOpen, setIsDirectTimePickerOpen] = useState<boolean>(false);
    const [preEnabled, setPreEnabled] = useState<boolean>(DEFAULT_SUNRISE_ALERTS.preSunriseEnabled);
    const [preMinutes, setPreMinutes] = useState<number>(DEFAULT_SUNRISE_ALERTS.preSunriseMinutes);
    const [atSunriseEnabled, setAtSunriseEnabled] = useState<boolean>(DEFAULT_SUNRISE_ALERTS.atSunriseEnabled);
    const [duhaEnabled, setDuhaEnabled] = useState<boolean>(DEFAULT_SUNRISE_ALERTS.duhaEnabled);
    const [duhaMinutes, setDuhaMinutes] = useState<number>(DEFAULT_SUNRISE_ALERTS.duhaMinutes);
    const [showGuide, setShowGuide] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            const merged = { ...DEFAULT_SUNRISE_ALERTS, ...(currentSettings || {}) };
            setTempSunriseOffset(currentSunriseOffset || 0);
            setOffsetInputValue(String(currentSunriseOffset || 0));
            setPreEnabled(isSunriseMuted ? false : Boolean(merged.preSunriseEnabled));
            setPreMinutes(merged.preSunriseMinutes || 15);
            setAtSunriseEnabled(isSunriseMuted ? false : Boolean(merged.atSunriseEnabled));
            setDuhaEnabled(isSunriseMuted ? false : Boolean(merged.duhaEnabled));
            setDuhaMinutes(merged.duhaMinutes || 15);
            if (!getGuideSeen('sunrise_settings_modal_spotlight')) {
                setShowGuide(true);
            }
        }
    }, [isOpen, currentSettings, isSunriseMuted, currentSunriseOffset]);

    useEffect(() => {
        setOffsetInputValue(String(tempSunriseOffset));
    }, [tempSunriseOffset]);

    if (!isOpen) return null;

    const ensureNotifPermissionOnEnable = async (nextState: boolean) => {
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

    const isEffectiveBlack =
        isBlackTheme ||
        isBlackAndWhite ||
        themeKey === 'deep_black' ||
        Boolean(theme?.isDark && theme?.bgColor === '#000000');

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

    const totalPreviewOffset = tempSunriseOffset + (isSummerTime ? 60 : 0);
    const effectiveSunrise24 = applyOffset(sunriseTimeStr, totalPreviewOffset);
    const preSunrise24 = applyOffset(effectiveSunrise24, -preMinutes);
    const duha24 = applyOffset(effectiveSunrise24, duhaMinutes);

    const formatClock12 = (time24: string) => {
        if (!time24 || time24.includes('--')) return '--:--';
        const [hh, mm] = time24.split(':');
        const hInt = parseInt(hh, 10);
        if (isNaN(hInt)) return '--:--';
        const isPm = hInt >= 12;
        const h12 = hInt % 12 || 12;
        const period = isEn ? (isPm ? 'PM' : 'AM') : (isPm ? 'م' : 'ص');
        const timeCore = `${h12}:${mm.padStart(2, '0')}`;
        return isEn ? `${timeCore} ${period}` : `${formatNumber(timeCore)} ${period}`;
    };

    const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value;
        raw = raw
            .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
            .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
            .replace(/[−–—]/g, '-');

        if (raw === '' || raw === '-') {
            setOffsetInputValue(raw);
            setTempSunriseOffset(0);
            return;
        }

        const match = raw.match(/^-?\d*/);
        if (match && match[0] !== '') {
            const valStr = match[0];
            setOffsetInputValue(valStr);
            const parsed = parseInt(valStr, 10);
            if (!isNaN(parsed)) {
                const clamped = Math.max(-720, Math.min(720, parsed));
                setTempSunriseOffset(clamped);
            }
        } else {
            setOffsetInputValue(raw);
        }
    };

    const handleOffsetBlur = () => {
        if (offsetInputValue === '' || offsetInputValue === '-') {
            setOffsetInputValue('0');
            setTempSunriseOffset(0);
        } else {
            const parsed = parseInt(offsetInputValue, 10);
            if (isNaN(parsed)) {
                setOffsetInputValue('0');
                setTempSunriseOffset(0);
            } else {
                const clamped = Math.max(-720, Math.min(720, parsed));
                setOffsetInputValue(String(clamped));
                setTempSunriseOffset(clamped);
            }
        }
    };

    const handleDirectTimeChange = (newTimeStr: string) => {
        if (!newTimeStr || !sunriseTimeStr || sunriseTimeStr.includes('--')) return;
        const [targetH, targetM] = newTimeStr.split(':').map(Number);
        const [baseH, baseM] = sunriseTimeStr.split(':').map(Number);
        if (isNaN(targetH) || isNaN(targetM) || isNaN(baseH) || isNaN(baseM)) return;
        let diff = (targetH * 60 + targetM) - (baseH * 60 + baseM);
        if (isSummerTime) diff -= 60;
        if (diff > 720) diff -= 1440;
        if (diff < -720) diff += 1440;
        setTempSunriseOffset(diff);
    };

    const handleSave = () => {
        onSave(
            {
                preSunriseEnabled: preEnabled,
                preSunriseMinutes: preMinutes,
                atSunriseEnabled,
                duhaEnabled,
                duhaMinutes
            },
            tempSunriseOffset
        );
    };

    const renderToggle = (checked: boolean, onClick: () => void, label: string) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onClick}
            className={`app-3d-switch-track w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                checked ? '' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            style={{ backgroundColor: checked ? themeStyles.accent : undefined }}
            title={label}
        >
            <div
                className={`app-3d-switch-thumb ${isEffectiveBlack && checked ? 'app-3d-switch-thumb-dark' : ''} w-4 h-4 rounded-full transform transition-transform ${
                    checked
                        ? (isRTL
                            ? (isEffectiveBlack ? 'bg-black -translate-x-5' : 'bg-white -translate-x-5')
                            : (isEffectiveBlack ? 'bg-black translate-x-5' : 'bg-white translate-x-5'))
                        : 'bg-white translate-x-0'
                }`}
            />
        </button>
    );

    return (
        <div
            dir={dir}
            onClick={closeModal}
            className="fixed inset-0 bg-black/65 z-[60] flex items-center justify-center p-4 sm:p-6"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="rounded-[2.5rem] w-full max-w-sm max-h-[92dvh] flex flex-col p-5 sm:p-6 border-0"
                style={{
                    backgroundColor: themeStyles.modalBg,
                    color: themeStyles.modalText,
                    boxShadow: themeStyles.modalShadow
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3 pb-2.5 border-b shrink-0" style={{ borderColor: themeStyles.dividerColor }}>
                    <h3 className="font-black text-sm sm:text-base truncate" style={{ color: themeStyles.accent }}>
                        {tPrayer('sunriseSettingsTitle', language)}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
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
                                title={tPrayer('sunriseSettingsGuideTooltip', language)}
                                aria-label={tPrayer('sunriseSettingsGuideTooltip', language)}
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

                {/* Scrollable Body */}
                <div className="space-y-3.5 overflow-y-auto hide-scrollbar flex-1 min-h-0 px-0.5 pb-1">
                    {/* تعديل وقت الشروق بالدقائق */}
                    <div id="sunrise-setting-time-adjustment">
                        <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest text-center" style={{ color: themeStyles.accent }}>
                            {tPrayer('adjustSunriseTime', language)}
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
                                onClick={() => setTempSunriseOffset((p) => p - 1)}
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
                                <div className="relative group flex items-center justify-center gap-1.5">
                                    <span className="text-base font-black en-digits tracking-wide" style={{ color: themeStyles.text }}>
                                        {formatTime12_EN(effectiveSunrise24)}
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

                                <div className="flex items-center justify-center gap-1.5 mt-1.5" dir={dir}>
                                    <span className="text-[10px] font-bold" style={{ color: themeStyles.subtext }}>{tPrayer('offsetLabel', language)}</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9\-]*"
                                        dir="ltr"
                                        value={offsetInputValue}
                                        onFocus={() => setOffsetInputValue('')}
                                        onClick={() => setOffsetInputValue('')}
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
                                onClick={() => setTempSunriseOffset((p) => p + 1)}
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

                    {/* 1. تنبيه قرب الشروق (لإدراك صلاة الفجر) */}
                    <div
                        id="sunrise-setting-pre-alert"
                        className="p-2.5 rounded-2xl space-y-2 transition-all border-0"
                        style={{
                            backgroundColor: themeStyles.cardBg,
                            boxShadow: themeStyles.cardShadow
                        }}
                    >
                        <div className="flex items-center justify-between gap-3">
                            {renderToggle(
                                preEnabled,
                                () => {
                                    const next = !preEnabled;
                                    setPreEnabled(next);
                                    ensureNotifPermissionOnEnable(next);
                                },
                                tPrayer('sunrisePreAlertTitle', language)
                            )}

                            <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-start gap-1.5 flex-wrap`} dir={dir}>
                                <span className="font-bold text-xs" style={{ color: themeStyles.text }}>
                                    {tPrayer('sunrisePreAlertTitle', language)}
                                </span>
                                <span
                                    className="app-3d-badge text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors tabular-nums"
                                    style={{
                                        backgroundColor: isEffectiveBlack ? 'rgba(255, 255, 255, 0.15)' : `${themeStyles.accent}1f`,
                                        color: isEffectiveBlack ? '#ffffff' : themeStyles.accent
                                    }}
                                >
                                    {tPrayer('beforeMinutes', language, { m: formatNumber(preMinutes) })}
                                    {!preSunrise24.includes('--') ? ` • ${formatClock12(preSunrise24)}` : ''}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t" style={{ borderColor: themeStyles.dividerColor }} dir={dir}>
                            <div className="flex items-center gap-1 flex-wrap">
                                {[10, 15, 20, 30].map((mins) => {
                                    const isSelected = preMinutes === mins;
                                    return (
                                        <button
                                            key={mins}
                                            type="button"
                                            onClick={() => setPreMinutes(mins)}
                                            className="unified-3d-btn px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer border-0 tabular-nums"
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
                                            {formatNumber(mins)}{tPrayer('minuteShort', language)}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setPreMinutes((p) => Math.max(1, p - 1))}
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
                                    onClick={() => setPreMinutes((p) => Math.min(120, p + 1))}
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

                    {/* 2. تنبيه لحظة الشروق (انتهاء وقت الفجر وبداية وقت النهي) */}
                    <div
                        id="sunrise-setting-at-alert"
                        className="p-2.5 rounded-2xl transition-all border-0"
                        style={{
                            backgroundColor: themeStyles.cardBg,
                            boxShadow: themeStyles.cardShadow
                        }}
                    >
                        <div className="flex items-center justify-between gap-3">
                            {renderToggle(
                                atSunriseEnabled,
                                () => {
                                    const next = !atSunriseEnabled;
                                    setAtSunriseEnabled(next);
                                    ensureNotifPermissionOnEnable(next);
                                },
                                tPrayer('sunriseAtAlertTitle', language)
                            )}

                            <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-start gap-1.5 flex-wrap`} dir={dir}>
                                <span className="font-bold text-xs" style={{ color: themeStyles.text }}>
                                    {tPrayer('sunriseAtAlertTitle', language)}
                                </span>
                                <span
                                    className="app-3d-badge text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors tabular-nums inline-flex items-center gap-1"
                                    style={{
                                        backgroundColor: isEffectiveBlack ? 'rgba(255, 255, 255, 0.15)' : `${themeStyles.accent}1f`,
                                        color: isEffectiveBlack ? '#ffffff' : themeStyles.accent
                                    }}
                                >
                                    <Sun className="w-2.5 h-2.5" />
                                    {tPrayer('sunriseAtBadge', language)}
                                    {!effectiveSunrise24.includes('--') ? ` • ${formatClock12(effectiveSunrise24)}` : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. تنبيه صلاة الضحى / الإشراق */}
                    <div
                        id="sunrise-setting-duha-alert"
                        className="p-2.5 rounded-2xl space-y-2 transition-all border-0"
                        style={{
                            backgroundColor: themeStyles.cardBg,
                            boxShadow: themeStyles.cardShadow
                        }}
                    >
                        <div className="flex items-center justify-between gap-3">
                            {renderToggle(
                                duhaEnabled,
                                () => {
                                    const next = !duhaEnabled;
                                    setDuhaEnabled(next);
                                    ensureNotifPermissionOnEnable(next);
                                },
                                tPrayer('duhaAlertTitle', language)
                            )}

                            <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-start gap-1.5 flex-wrap`} dir={dir}>
                                <span className="font-bold text-xs" style={{ color: themeStyles.text }}>
                                    {tPrayer('duhaAlertTitle', language)}
                                </span>
                                <span
                                    className="app-3d-badge text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors tabular-nums inline-flex items-center gap-1"
                                    style={{
                                        backgroundColor: isEffectiveBlack ? 'rgba(255, 255, 255, 0.15)' : `${themeStyles.accent}1f`,
                                        color: isEffectiveBlack ? '#ffffff' : themeStyles.accent
                                    }}
                                >
                                    <Clock className="w-2.5 h-2.5" />
                                    {tPrayer('afterMinutes', language, { m: formatNumber(duhaMinutes) })}
                                    {!duha24.includes('--') ? ` • ${formatClock12(duha24)}` : ''}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t" style={{ borderColor: themeStyles.dividerColor }} dir={dir}>
                            <div className="flex items-center gap-1 flex-wrap">
                                {[15, 30, 60, 120].map((mins) => {
                                    const isSelected = duhaMinutes === mins;
                                    const label = mins === 15
                                        ? `${formatNumber(mins)}${tPrayer('minuteShort', language)} (${tPrayer('ishraqStartHint', language)})`
                                        : `${formatNumber(mins)}${tPrayer('minuteShort', language)}`;
                                    return (
                                        <button
                                            key={mins}
                                            type="button"
                                            onClick={() => setDuhaMinutes(mins)}
                                            className="unified-3d-btn px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer border-0 tabular-nums"
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
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setDuhaMinutes((p) => Math.max(1, p - 1))}
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
                                    onClick={() => setDuhaMinutes((p) => Math.min(240, p + 1))}
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
                </div>

                {/* Save Button */}
                <button
                    id="sunrise-setting-save-btn"
                    type="button"
                    onClick={handleSave}
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

            <CommunitySpotlightGuide
                guideKey="sunrise_settings_modal_spotlight"
                steps={SUNRISE_SETTINGS_MODAL_STEPS}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={isEn}
            />

            {isDirectTimePickerOpen && (
                <IslamicTimePickerModal
                    isOpen={isDirectTimePickerOpen}
                    onClose={() => setIsDirectTimePickerOpen(false)}
                    initialTime={effectiveSunrise24}
                    onSave={(newTime24) => handleDirectTimeChange(newTime24)}
                    title={tPrayer('sunriseSettingsTitle', language)}
                    accentColor={themeStyles.accent}
                />
            )}
        </div>
    );
};

export default SunriseSettingsModal;
