import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Check, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { toArabic } from '../QuranReader/constants';

export interface IslamicTimePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTime?: string; // "HH:mm" in 24h format e.g. "08:00" or "20:30"
    onSave: (newTime24: string) => void;
    title?: string;
    accentColor?: string;
}

const toEnglishDigits = (val: string | number): string =>
    String(val ?? '')
        .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632))
        .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));

export const IslamicTimePickerModal: React.FC<IslamicTimePickerModalProps> = ({
    isOpen,
    onClose,
    initialTime = '08:00',
    onSave,
    title,
    accentColor: propAccentColor
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const { theme, themeKey, homeThemeVariant, isNightMode } = useTheme();

    // Parse initial time (24h -> 12h + AM/PM)
    const initialParsed = useMemo(() => {
        const cleaned = toEnglishDigits(initialTime || '08:00').trim();
        const [hStr, mStr] = cleaned.split(':');
        const h24 = parseInt(hStr || '8', 10);
        const m = parseInt(mStr || '0', 10);
        const validH24 = isNaN(h24) ? 8 : Math.max(0, Math.min(23, h24));
        const validM = isNaN(m) ? 0 : Math.max(0, Math.min(59, m));
        const isPM = validH24 >= 12;
        const h12 = validH24 % 12 || 12;
        return { h12, m: validM, isPM };
    }, [initialTime]);

    const [hour, setHour] = useState<number>(initialParsed.h12);
    const [minute, setMinute] = useState<number>(initialParsed.m);
    const [isPM, setIsPM] = useState<boolean>(initialParsed.isPM);

    // Direct text input states for manual typing
    const [hourInput, setHourInput] = useState<string>(String(initialParsed.h12).padStart(2, '0'));
    const [minuteInput, setMinuteInput] = useState<string>(String(initialParsed.m).padStart(2, '0'));
    const [activeField, setActiveField] = useState<'hours' | 'minutes' | null>(null);

    // Refs to hold current values avoiding stale closure issues in blur/save
    const hourRef = useRef<number>(initialParsed.h12);
    const minuteRef = useRef<number>(initialParsed.m);
    const hourInputStrRef = useRef<string>(String(initialParsed.h12).padStart(2, '0'));
    const minuteInputStrRef = useRef<string>(String(initialParsed.m).padStart(2, '0'));

    const hourInputRef = useRef<HTMLInputElement | null>(null);
    const minuteInputRef = useRef<HTMLInputElement | null>(null);

    // Synchronize when modal opens
    useEffect(() => {
        if (isOpen) {
            setHour(initialParsed.h12);
            setMinute(initialParsed.m);
            setIsPM(initialParsed.isPM);
            const hStr = String(initialParsed.h12).padStart(2, '0');
            const mStr = String(initialParsed.m).padStart(2, '0');
            setHourInput(hStr);
            setMinuteInput(mStr);
            hourRef.current = initialParsed.h12;
            minuteRef.current = initialParsed.m;
            hourInputStrRef.current = hStr;
            minuteInputStrRef.current = mStr;
            setActiveField(null);
        }
    }, [isOpen, initialParsed]);

    // Android hardware back button support
    useEffect(() => {
        if (!isOpen) return;
        const unregister = registerBackInterceptor(() => {
            onClose();
            return true;
        });
        return unregister;
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Convert to 24h string
    const get24HourString = (h12: number, min: number, pm: boolean): string => {
        let h24 = h12 % 12;
        if (pm) h24 += 12;
        const hStr = String(h24).padStart(2, '0');
        const mStr = String(min).padStart(2, '0');
        return `${hStr}:${mStr}`;
    };

    const handleSave = () => {
        let finalHour = hourRef.current;
        let finalMinute = minuteRef.current;

        const hClean = toEnglishDigits(hourInputStrRef.current).trim();
        if (hClean) {
            const hNum = parseInt(hClean, 10);
            if (!isNaN(hNum)) {
                finalHour = Math.max(1, Math.min(12, hNum));
            }
        }

        const mClean = toEnglishDigits(minuteInputStrRef.current).trim();
        if (mClean) {
            const mNum = parseInt(mClean, 10);
            if (!isNaN(mNum)) {
                finalMinute = Math.max(0, Math.min(59, mNum));
            }
        }

        const result = get24HourString(finalHour, finalMinute, isPM);
        onSave(result);
        onClose();
    };

    const handleSetNow = () => {
        const now = new Date();
        const h24 = now.getHours();
        const m = now.getMinutes();
        const h12 = h24 % 12 || 12;
        setHour(h12);
        setMinute(m);
        setIsPM(h24 >= 12);
        hourRef.current = h12;
        minuteRef.current = m;
        const hStr = String(h12).padStart(2, '0');
        const mStr = String(m).padStart(2, '0');
        setHourInput(hStr);
        setMinuteInput(mStr);
        hourInputStrRef.current = hStr;
        minuteInputStrRef.current = mStr;
    };

    const adjustHours = (delta: number) => {
        let newH = ((hourRef.current - 1 + delta) % 12);
        if (newH < 0) newH += 12;
        const finalH = newH + 1;
        setHour(finalH);
        hourRef.current = finalH;
        const formatted = String(finalH).padStart(2, '0');
        setHourInput(formatted);
        hourInputStrRef.current = formatted;
    };

    const adjustMinutes = (delta: number) => {
        let total = hourRef.current * 60 + minuteRef.current + delta;
        if (total < 0) total += 12 * 60;
        const newHour = Math.floor((total / 60) % 12) || 12;
        const newMin = ((total % 60) + 60) % 60;
        setHour(newHour);
        setMinute(newMin);
        hourRef.current = newHour;
        minuteRef.current = newMin;
        const hFormatted = String(newHour).padStart(2, '0');
        const mFormatted = String(newMin).padStart(2, '0');
        setHourInput(hFormatted);
        setMinuteInput(mFormatted);
        hourInputStrRef.current = hFormatted;
        minuteInputStrRef.current = mFormatted;
    };

    const handleHourFocus = () => {
        setActiveField('hours');
        setHourInput('');
        hourInputStrRef.current = '';
    };

    const handleHourClick = () => {
        setActiveField('hours');
        setHourInput('');
        hourInputStrRef.current = '';
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 2);
        hourInputStrRef.current = raw;
        setHourInput(raw);

        if (raw === '') return;

        const val = parseInt(raw, 10);
        if (isNaN(val)) return;

        if (val > 12) {
            const clamped = 12;
            setHour(clamped);
            hourRef.current = clamped;
            const cStr = String(clamped);
            hourInputStrRef.current = cStr;
            setHourInput(cStr);
            return;
        }

        if (val >= 1 && val <= 12) {
            setHour(val);
            hourRef.current = val;
        }
    };

    const handleHourBlur = () => {
        setActiveField(null);
        const raw = toEnglishDigits(hourInputStrRef.current).trim();
        if (!raw || raw === '0') {
            const fallback = hourRef.current > 0 ? hourRef.current : 12;
            const formatted = String(fallback).padStart(2, '0');
            setHour(fallback);
            hourRef.current = fallback;
            setHourInput(formatted);
            hourInputStrRef.current = formatted;
        } else {
            const val = parseInt(raw, 10);
            const clamped = isNaN(val) ? (hourRef.current || 12) : Math.max(1, Math.min(12, val));
            setHour(clamped);
            hourRef.current = clamped;
            const formatted = String(clamped).padStart(2, '0');
            setHourInput(formatted);
            hourInputStrRef.current = formatted;
        }
    };

    const handleMinuteFocus = () => {
        setActiveField('minutes');
        setMinuteInput('');
        minuteInputStrRef.current = '';
    };

    const handleMinuteClick = () => {
        setActiveField('minutes');
        setMinuteInput('');
        minuteInputStrRef.current = '';
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 2);
        minuteInputStrRef.current = raw;
        setMinuteInput(raw);

        if (raw === '') return;

        const val = parseInt(raw, 10);
        if (isNaN(val)) return;

        if (val > 59) {
            const clamped = 59;
            setMinute(clamped);
            minuteRef.current = clamped;
            const cStr = '59';
            minuteInputStrRef.current = cStr;
            setMinuteInput(cStr);
            return;
        }

        setMinute(val);
        minuteRef.current = val;
    };

    const handleMinuteBlur = () => {
        setActiveField(null);
        const raw = toEnglishDigits(minuteInputStrRef.current).trim();
        if (!raw) {
            const fallback = minuteRef.current >= 0 ? minuteRef.current : 0;
            const formatted = String(fallback).padStart(2, '0');
            setMinute(fallback);
            minuteRef.current = fallback;
            setMinuteInput(formatted);
            minuteInputStrRef.current = formatted;
        } else {
            const val = parseInt(raw, 10);
            const clamped = isNaN(val) ? (minuteRef.current || 0) : Math.max(0, Math.min(59, val));
            setMinute(clamped);
            minuteRef.current = clamped;
            const formatted = String(clamped).padStart(2, '0');
            setMinuteInput(formatted);
            minuteInputStrRef.current = formatted;
        }
    };

    // Unified Theme Resolution matching NotificationSettingsModal & PrayerTimesSettingsModal
    const isDark = Boolean(
        isNightMode ||
        theme?.isDark ||
        themeKey === 'deep_black' ||
        themeKey === 'black_gold' ||
        themeKey === 'night' ||
        themeKey === 'i_midnight' ||
        themeKey === 'i_slate' ||
        (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
    );

    const cleanPropAccent = propAccentColor?.trim();

    const isSky = !isDark && (
        themeKey === 'sky_mode' ||
        homeThemeVariant === 'sky' ||
        ['night_sky', 'blue', 'cyan', 'fajr_light', 'blue_sky', 'midnight_blue', 'i_lapis', 'i_deep_ocean', 'i_turquoise'].includes(themeKey)
    );

    const isEmerald = !isDark && (
        themeKey === 'emerald_mode' ||
        homeThemeVariant === 'emerald'
    );

    const isBurgundy = !isDark && (
        themeKey === 'burgundy_mode' ||
        homeThemeVariant === 'burgundy' ||
        ['red', 'maroon', 'i_ruby', 'rose_gold'].includes(themeKey)
    );

    const isGold = !isDark && (
        themeKey === 'shiny_gold' ||
        themeKey === 'gold' ||
        homeThemeVariant === 'gold' ||
        ['royal_gold', 'i_gold', 'i_royal_gold', 'amber_light', 'i_amber', 'golden_sand'].includes(themeKey)
    );

    const palette = (() => {
        if (isDark) {
            const darkAccent = (cleanPropAccent && cleanPropAccent.toLowerCase() !== '#000000')
                ? cleanPropAccent
                : '#ffffff';
            const isWhiteAccent = darkAccent.toLowerCase() === '#ffffff' || darkAccent.toLowerCase() === '#fff';
            return {
                modalBg: '#121214',
                headerBg: '#18181b',
                cardBg: '#18181b',
                innerBg: '#27272a',
                dividerColor: 'rgba(255, 255, 255, 0.12)',
                textPrimary: '#ffffff',
                textSecondary: '#a1a1aa',
                primaryAccent: darkAccent,
                primaryAccentText: isWhiteAccent ? '#000000' : '#ffffff',
                modalShadow: '0 8px 0 #050507, 0 24px 50px rgba(0, 0, 0, 0.85), inset 0 2px 2px rgba(255, 255, 255, 0.14)',
                inputShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.65), inset 0 -1px 1px rgba(255, 255, 255, 0.12)'
            };
        }

        const modalShadowLight = '0 8px 0 rgba(0, 0, 0, 0.16), 0 24px 48px rgba(0, 0, 0, 0.30), inset 0 2px 2px rgba(255, 255, 255, 0.92)';
        const inputShadowLight = 'inset 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 -1px 1px rgba(255, 255, 255, 0.92)';

        if (isSky) {
            return {
                modalBg: '#E0F2FE',
                headerBg: '#BAE6FD',
                cardBg: '#ffffff',
                innerBg: '#f8fafc',
                dividerColor: 'rgba(2, 132, 199, 0.12)',
                textPrimary: '#0f172a',
                textSecondary: '#0369a1',
                primaryAccent: cleanPropAccent || '#0284c7',
                primaryAccentText: '#ffffff',
                modalShadow: modalShadowLight,
                inputShadow: inputShadowLight
            };
        }
        if (isEmerald) {
            return {
                modalBg: '#D1FAE5',
                headerBg: '#A7F3D0',
                cardBg: '#ffffff',
                innerBg: '#f8fafc',
                dividerColor: 'rgba(5, 150, 105, 0.12)',
                textPrimary: '#0f172a',
                textSecondary: '#047857',
                primaryAccent: cleanPropAccent || '#059669',
                primaryAccentText: '#ffffff',
                modalShadow: modalShadowLight,
                inputShadow: inputShadowLight
            };
        }
        if (isBurgundy) {
            return {
                modalBg: '#FFE4E6',
                headerBg: '#FECDD3',
                cardBg: '#ffffff',
                innerBg: '#f8fafc',
                dividerColor: 'rgba(190, 18, 60, 0.12)',
                textPrimary: '#0f172a',
                textSecondary: '#881337',
                primaryAccent: cleanPropAccent || '#be123c',
                primaryAccentText: '#ffffff',
                modalShadow: modalShadowLight,
                inputShadow: inputShadowLight
            };
        }
        if (isGold) {
            return {
                modalBg: '#FEF9C3',
                headerBg: '#FEF08A',
                cardBg: '#ffffff',
                innerBg: '#fffbeb',
                dividerColor: 'rgba(180, 83, 9, 0.14)',
                textPrimary: '#0f172a',
                textSecondary: '#854d0e',
                primaryAccent: cleanPropAccent || '#ca8a04',
                primaryAccentText: '#ffffff',
                modalShadow: modalShadowLight,
                inputShadow: inputShadowLight
            };
        }

        const fallbackAccent = cleanPropAccent || theme?.accent || theme?.palette?.[0] || '#059669';
        return {
            modalBg: '#F8FAFC',
            headerBg: '#F1F5F9',
            cardBg: '#ffffff',
            innerBg: '#f8fafc',
            dividerColor: 'rgba(15, 23, 42, 0.08)',
            textPrimary: '#0f172a',
            textSecondary: '#475569',
            primaryAccent: fallbackAccent,
            primaryAccentText: '#ffffff',
            modalShadow: modalShadowLight,
            inputShadow: inputShadowLight
        };
    })();

    const modalContent = (
        <div
            dir={isEn ? 'ltr' : 'rtl'}
            className="fixed inset-0 z-[10000000] flex items-center justify-center p-4 bg-black/65"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className={`settings-3d-adia-scope ${isDark ? 'settings-3d-dark' : ''} w-full max-w-[292px] sm:max-w-[314px] rounded-[2rem] overflow-hidden flex flex-col select-none border-0`}
                style={{
                    backgroundColor: palette.modalBg,
                    color: palette.textPrimary,
                    boxShadow: palette.modalShadow
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Compact Header */}
                <div
                    className="py-2.5 px-4 flex items-center justify-center border-b shrink-0"
                    style={{
                        backgroundColor: palette.headerBg,
                        borderColor: palette.dividerColor
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="app-page-card quran-raised-btn-selected border-0 w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                                backgroundColor: palette.primaryAccent,
                                color: palette.primaryAccentText
                            }}
                        >
                            <Clock className="w-3.5 h-3.5" />
                        </div>
                        <h3
                            className="font-black text-xs sm:text-sm tracking-wide truncate"
                            style={{ color: isDark ? palette.textPrimary : palette.textSecondary }}
                        >
                            {title || (isEn ? 'Set Time' : 'تحديد الوقت')}
                        </h3>
                    </div>
                </div>

                {/* Compact Body */}
                <div className="p-3 sm:p-3.5 space-y-3 overflow-visible">
                    {/* AM / PM 3D Tactile Switch */}
                    <div className="grid grid-cols-2 gap-2.5 overflow-visible">
                        <button
                            type="button"
                            onClick={() => setIsPM(false)}
                            className={`app-page-card border-0 py-2 px-2.5 rounded-2xl font-extrabold text-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                                !isPM ? 'quran-raised-btn-selected' : ''
                            }`}
                            style={{
                                backgroundColor: !isPM ? palette.primaryAccent : palette.cardBg,
                                color: !isPM ? palette.primaryAccentText : palette.textPrimary
                            }}
                        >
                            <span>☀️</span>
                            <span>{isEn ? 'AM' : 'صباحاً'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPM(true)}
                            className={`app-page-card border-0 py-2 px-2.5 rounded-2xl font-extrabold text-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                                isPM ? 'quran-raised-btn-selected' : ''
                            }`}
                            style={{
                                backgroundColor: isPM ? palette.primaryAccent : palette.cardBg,
                                color: isPM ? palette.primaryAccentText : palette.textPrimary
                            }}
                        >
                            <span>🌙</span>
                            <span>{isEn ? 'PM' : 'مساءً'}</span>
                        </button>
                    </div>

                    {/* 3D Embossed Digital Time Pods Card - Always Hours on Left, Minutes on Right */}
                    <div
                        dir="ltr"
                        className="app-page-card border-0 rounded-2xl py-2.5 px-3 flex items-center justify-center gap-2.5 overflow-visible"
                        style={{
                            backgroundColor: palette.cardBg,
                            color: palette.textPrimary
                        }}
                    >
                        {/* Hours Digital Column */}
                        <div className="flex flex-col items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => adjustHours(1)}
                                className="app-page-card border-0 w-9 h-7 rounded-xl flex items-center justify-center cursor-pointer"
                                style={{
                                    color: palette.textPrimary,
                                    backgroundColor: palette.innerBg
                                }}
                                title={isEn ? 'Add Hour' : 'زيادة ساعة'}
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>

                            <input
                                ref={hourInputRef}
                                type="text"
                                dir="ltr"
                                inputMode="numeric"
                                pattern="[0-9\u0660-\u0669]*"
                                maxLength={2}
                                autoComplete="off"
                                autoCorrect="off"
                                value={isEn ? hourInput : toArabic(hourInput)}
                                onFocus={handleHourFocus}
                                onClick={handleHourClick}
                                onChange={handleHourChange}
                                onBlur={handleHourBlur}
                                placeholder="--"
                                className="w-16 sm:w-[68px] h-12 sm:h-[52px] rounded-2xl font-black text-2xl text-center tabular-nums transition-all outline-none border-0 cursor-text"
                                style={{
                                    backgroundColor: activeField === 'hours' ? palette.primaryAccent : palette.innerBg,
                                    color: activeField === 'hours' ? palette.primaryAccentText : palette.textPrimary,
                                    boxShadow: activeField === 'hours'
                                        ? (isDark ? '0 4px 0 #07070b, inset 0 1.5px 1px rgba(255,255,255,0.3)' : '0 4px 0 rgba(0,0,0,0.22), inset 0 1.5px 1px rgba(255,255,255,0.45)')
                                        : palette.inputShadow,
                                    fontFamily: isEn ? 'system-ui, -apple-system, "Segoe UI", Roboto, "Cairo", sans-serif' : undefined
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => adjustHours(-1)}
                                className="app-page-card border-0 w-9 h-7 rounded-xl flex items-center justify-center cursor-pointer"
                                style={{
                                    color: palette.textPrimary,
                                    backgroundColor: palette.innerBg
                                }}
                                title={isEn ? 'Subtract Hour' : 'إنقاص ساعة'}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            <span className="text-[10px] font-bold" style={{ color: palette.textSecondary }}>
                                {isEn ? 'Hour' : 'ساعة'}
                            </span>
                        </div>

                        {/* Digital Separator Colon */}
                        <div className="flex flex-col items-center justify-center pb-4">
                            <span
                                className="text-2xl font-black opacity-55 animate-pulse select-none"
                                style={{ color: palette.textPrimary }}
                            >
                                :
                            </span>
                        </div>

                        {/* Minutes Digital Column */}
                        <div className="flex flex-col items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => adjustMinutes(1)}
                                className="app-page-card border-0 w-9 h-7 rounded-xl flex items-center justify-center cursor-pointer"
                                style={{
                                    color: palette.textPrimary,
                                    backgroundColor: palette.innerBg
                                }}
                                title={isEn ? 'Add Minute' : 'زيادة دقيقة'}
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>

                            <input
                                ref={minuteInputRef}
                                type="text"
                                dir="ltr"
                                inputMode="numeric"
                                pattern="[0-9\u0660-\u0669]*"
                                maxLength={2}
                                autoComplete="off"
                                autoCorrect="off"
                                value={isEn ? minuteInput : toArabic(minuteInput)}
                                onFocus={handleMinuteFocus}
                                onClick={handleMinuteClick}
                                onChange={handleMinuteChange}
                                onBlur={handleMinuteBlur}
                                placeholder="--"
                                className="w-16 sm:w-[68px] h-12 sm:h-[52px] rounded-2xl font-black text-2xl text-center tabular-nums transition-all outline-none border-0 cursor-text"
                                style={{
                                    backgroundColor: activeField === 'minutes' ? palette.primaryAccent : palette.innerBg,
                                    color: activeField === 'minutes' ? palette.primaryAccentText : palette.textPrimary,
                                    boxShadow: activeField === 'minutes'
                                        ? (isDark ? '0 4px 0 #07070b, inset 0 1.5px 1px rgba(255,255,255,0.3)' : '0 4px 0 rgba(0,0,0,0.22), inset 0 1.5px 1px rgba(255,255,255,0.45)')
                                        : palette.inputShadow,
                                    fontFamily: isEn ? 'system-ui, -apple-system, "Segoe UI", Roboto, "Cairo", sans-serif' : undefined
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => adjustMinutes(-1)}
                                className="app-page-card border-0 w-9 h-7 rounded-xl flex items-center justify-center cursor-pointer"
                                style={{
                                    color: palette.textPrimary,
                                    backgroundColor: palette.innerBg
                                }}
                                title={isEn ? 'Subtract Minute' : 'إنقاص دقيقة'}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            <span className="text-[10px] font-bold" style={{ color: palette.textSecondary }}>
                                {isEn ? 'Minute' : 'دقيقة'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Minute Interval Chips - Symmetrical 4-Column 3D Grid */}
                    <div className="grid grid-cols-4 gap-2 pt-0.5 overflow-visible">
                        {[0, 15, 30, 45].map((mVal) => {
                            const mStr = String(mVal).padStart(2, '0');
                            const isActive = minute === mVal;
                            return (
                                <button
                                    key={mVal}
                                    type="button"
                                    onClick={() => {
                                        setMinute(mVal);
                                        minuteRef.current = mVal;
                                        setMinuteInput(mStr);
                                        minuteInputStrRef.current = mStr;
                                    }}
                                    className={`app-page-card border-0 py-1.5 px-1 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center ${
                                        isActive ? 'quran-raised-btn-selected' : ''
                                    }`}
                                    style={{
                                        backgroundColor: isActive ? palette.primaryAccent : palette.cardBg,
                                        color: isActive ? palette.primaryAccentText : palette.textPrimary
                                    }}
                                >
                                    <span dir="ltr">:{isEn ? mStr : toArabic(mStr)}</span>
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => adjustMinutes(-5)}
                            className="app-page-card border-0 py-1.5 px-1 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center"
                            style={{
                                backgroundColor: palette.cardBg,
                                color: palette.textPrimary
                            }}
                        >
                            {isEn ? '-5m' : <span dir="ltr">-{toArabic('5')} د</span>}
                        </button>

                        <button
                            type="button"
                            onClick={() => adjustMinutes(5)}
                            className="app-page-card border-0 py-1.5 px-1 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center"
                            style={{
                                backgroundColor: palette.cardBg,
                                color: palette.textPrimary
                            }}
                        >
                            {isEn ? '+5m' : <span dir="ltr">+{toArabic('5')} د</span>}
                        </button>

                        <button
                            type="button"
                            onClick={handleSetNow}
                            className="app-page-card border-0 col-span-2 py-1.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                            style={{
                                backgroundColor: palette.cardBg,
                                color: isDark ? palette.textPrimary : palette.textSecondary
                            }}
                            title={isEn ? 'Set Current Time' : 'ضبط الوقت الحالي'}
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>{isEn ? 'Now' : 'الآن'}</span>
                        </button>
                    </div>
                </div>

                {/* Compact 3D Footer Action Buttons */}
                <div
                    className="px-3 pb-3 pt-2 flex items-center justify-between gap-2.5 border-t shrink-0 overflow-visible"
                    style={{
                        backgroundColor: palette.modalBg,
                        borderColor: palette.dividerColor
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="app-page-card border-0 flex-1 py-2 px-3 rounded-2xl font-extrabold text-xs cursor-pointer flex items-center justify-center"
                        style={{
                            backgroundColor: palette.cardBg,
                            color: palette.textPrimary
                        }}
                    >
                        {isEn ? 'Cancel' : 'إلغاء'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="app-page-card quran-raised-btn-selected border-0 flex-1 py-2 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{
                            backgroundColor: palette.primaryAccent,
                            color: palette.primaryAccentText
                        }}
                    >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Save Time' : 'حفظ الوقت'}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined' && document.body) {
        return createPortal(modalContent, document.body);
    }

    return modalContent;
};

export default IslamicTimePickerModal;
