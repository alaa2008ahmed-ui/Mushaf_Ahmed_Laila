import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Clock, Check, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
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
    const { theme, themeKey } = useTheme();

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
        // Resolve current inputs if user typed without blurring
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

    // Hour Input Focus / Click Handler: Automatically empties the field on focus/click for instant typing
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

    // Hour Input Change Handler: Allows typing 1-12, 11, 12, 8, etc. without losing digits
    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 2);
        hourInputStrRef.current = raw;
        setHourInput(raw);

        if (raw === '') {
            return;
        }

        const val = parseInt(raw, 10);
        if (isNaN(val)) return;

        // If user typed a number > 12 (e.g. 15), clamp to 12
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

    // Hour Input Blur Handler
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

    // Minute Input Focus / Click Handler: Automatically empties field on focus/click for instant typing
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

    // Minute Input Change Handler: Allows typing 0-59
    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 2);
        minuteInputStrRef.current = raw;
        setMinuteInput(raw);

        if (raw === '') {
            return;
        }

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

    // Minute Input Blur Handler
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

    // Dynamic Theme Detection & Color Resolution
    const domQrAccent = typeof window !== 'undefined' && typeof document !== 'undefined'
        ? getComputedStyle(document.documentElement).getPropertyValue('--qr-accent').trim()
        : '';

    // Check if golden theme is active in any form (Quran reader theme, global theme, or CSS class)
    const goldHexes = [
        '#d97706', '#d4af37', '#f59e0b', '#fbbf24', '#eab308', 
        '#ca8a04', '#b45309', '#fde047', '#fef08a'
    ];
    const isGoldKey = [
        'shiny_gold', 'gold', 'royal_gold', 'i_gold', 'i_royal_gold', 
        'amber_light', 'i_amber', 'golden_sand', 'black_gold'
    ].includes(themeKey);

    const hasGoldName = Boolean(
        theme?.name && (
            theme.name.includes('ذهب') || 
            theme.name.toLowerCase().includes('gold') || 
            theme.name.includes('عنبر') || 
            theme.name.includes('كهرمان')
        )
    );

    const hasGoldAccent = Boolean(
        (theme?.accent && goldHexes.includes(theme.accent.toLowerCase())) ||
        (domQrAccent && goldHexes.includes(domQrAccent.toLowerCase())) ||
        (propAccentColor && goldHexes.includes(propAccentColor.toLowerCase()))
    );

    const isGoldClass = typeof document !== 'undefined' && (
        document.body.classList.contains('theme-shiny-gold') ||
        document.documentElement.classList.contains('theme-shiny-gold')
    );

    const isGolden = isGoldKey || hasGoldName || hasGoldAccent || isGoldClass;

    const isDark = Boolean(
        theme?.isDark || 
        themeKey === 'deep_black' || 
        themeKey === 'night' || 
        themeKey === 'i_midnight' ||
        themeKey === 'i_slate' ||
        (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
    );

    const effectiveAccent = (
        propAccentColor || 
        domQrAccent || 
        theme?.accent || 
        theme?.palette?.[0] || 
        (isGolden ? '#D97706' : (isDark ? '#FFFFFF' : '#059669'))
    ).trim();

    // Palette fields:
    let primaryAccent: string;
    let primaryAccentText: string;
    let cardBgColor: string;
    let cardBorderColor: string;
    let headerBg: string;
    let headerBorder: string;
    let textPrimary: string;
    let textSecondary: string;
    let segmentBg: string;
    let segmentBorder: string;
    let boxBg: string;
    let boxBorder: string;
    let inputActiveBg: string;
    let inputActiveText: string;
    let inputInactiveBg: string;
    let inputInactiveBorder: string;
    let actionSaveBg: string;
    let actionSaveText: string;
    let actionCancelBorder: string;
    let actionCancelText: string;
    let presetBtnBg: string;
    let presetBtnText: string;
    let presetBtnBorder: string;
    let nowBtnBg: string;
    let nowBtnText: string;
    let nowBtnBorder: string;
    let footerBg: string;
    let footerBorder: string;

    if (isGolden) {
        if (isDark) {
            // Dark Gold Theme (e.g. i_royal_gold, black_gold, i_gold)
            primaryAccent = '#F59E0B';
            primaryAccentText = '#000000';
            cardBgColor = '#18150C';
            cardBorderColor = '#78350F';
            headerBg = '#292213';
            headerBorder = '#78350F';
            textPrimary = '#FDE68A';
            textSecondary = '#F59E0B';
            segmentBg = '#292213';
            segmentBorder = '#78350F';
            boxBg = '#292213';
            boxBorder = '#78350F';
            inputActiveBg = '#D97706';
            inputActiveText = '#FFFFFF';
            inputInactiveBg = '#18150C';
            inputInactiveBorder = '#78350F';
            actionSaveBg = '#D97706';
            actionSaveText = '#FFFFFF';
            actionCancelBorder = '#78350F';
            actionCancelText = '#FDE68A';
            presetBtnBg = '#292213';
            presetBtnText = '#FDE68A';
            presetBtnBorder = '#78350F';
            nowBtnBg = '#292213';
            nowBtnText = '#FDE68A';
            nowBtnBorder = '#78350F';
            footerBg = '#15130A';
            footerBorder = '#78350F';
        } else {
            // Light Golden Theme (matches Quran gold & shiny_gold screenshots)
            primaryAccent = '#D97706';
            primaryAccentText = '#FFFFFF';
            cardBgColor = '#FFFDF5';
            cardBorderColor = '#FCD34D';
            headerBg = '#FDE68A';
            headerBorder = '#F59E0B33';
            textPrimary = '#1F2937';
            textSecondary = '#78350F';
            segmentBg = '#FFFBEB';
            segmentBorder = '#FDE68A';
            boxBg = '#FEF3C7';
            boxBorder = '#FCD34D';
            inputActiveBg = '#D97706';
            inputActiveText = '#FFFFFF';
            inputInactiveBg = '#FFFFFF';
            inputInactiveBorder = '#FCD34D';
            actionSaveBg = '#D97706';
            actionSaveText = '#FFFFFF';
            actionCancelBorder = '#FCD34D';
            actionCancelText = '#78350F';
            presetBtnBg = '#FEF3C7';
            presetBtnText = '#92400E';
            presetBtnBorder = '#FCD34D';
            nowBtnBg = '#FDE68A';
            nowBtnText = '#78350F';
            nowBtnBorder = '#F59E0B';
            footerBg = '#FEF3C755';
            footerBorder = '#F59E0B22';
        }
    } else if (isDark) {
        // Pure Dark OLED Theme
        primaryAccent = effectiveAccent && effectiveAccent !== '#FFFFFF' ? effectiveAccent : '#FFFFFF';
        primaryAccentText = effectiveAccent && effectiveAccent !== '#FFFFFF' ? '#FFFFFF' : '#000000';
        cardBgColor = '#121215';
        cardBorderColor = '#27272A';
        headerBg = '#18181D';
        headerBorder = '#27272A';
        textPrimary = '#FFFFFF';
        textSecondary = '#A1A1AA';
        segmentBg = '#18181D';
        segmentBorder = '#27272A';
        boxBg = '#18181D';
        boxBorder = '#27272A';
        inputActiveBg = primaryAccent;
        inputActiveText = primaryAccentText;
        inputInactiveBg = '#27272A';
        inputInactiveBorder = '#3F3F46';
        actionSaveBg = primaryAccent;
        actionSaveText = primaryAccentText;
        actionCancelBorder = '#3F3F46';
        actionCancelText = '#E4E4E7';
        presetBtnBg = '#1E1E24';
        presetBtnText = '#E4E4E7';
        presetBtnBorder = '#27272A';
        nowBtnBg = '#27272A';
        nowBtnText = '#FFFFFF';
        nowBtnBorder = '#3F3F46';
        footerBg = '#151518';
        footerBorder = '#27272A';
    } else {
        // Light Theme: determine color family (Blue, Red, Purple, Orange, Green, etc.)
        const accLower = effectiveAccent.toLowerCase();
        const isBlueFamily = ['night_sky', 'blue', 'cyan', 'fajr_light', 'blue_sky', 'midnight_blue', 'i_lapis', 'i_deep_ocean', 'i_turquoise'].includes(themeKey) ||
            accLower.startsWith('#3b') || accLower.startsWith('#25') || accLower.startsWith('#028') || accLower.startsWith('#089') || accLower.startsWith('#4f') ||
            Boolean(theme?.name && (theme.name.includes('أزرق') || theme.name.includes('سماوي') || theme.name.includes('نيلي')));

        const isRedFamily = ['red', 'maroon', 'i_ruby', 'rose_gold'].includes(themeKey) ||
            accLower.startsWith('#dc') || accLower.startsWith('#ef') || accLower.startsWith('#83') ||
            Boolean(theme?.name && (theme.name.includes('أحمر') || theme.name.includes('نبيتي') || theme.name.includes('ياقوت')));

        const isPurpleFamily = ['purple', 'i_amethyst', 'i_brocade', 'purple_haze', 'i_sunset_royal'].includes(themeKey) ||
            accLower.startsWith('#93') || accLower.startsWith('#7c') || accLower.startsWith('#8b') || accLower.startsWith('#4c') ||
            Boolean(theme?.name && (theme.name.includes('بنفسجي') || theme.name.includes('أرجوان') || theme.name.includes('إستبرق')));

        const isOrangeFamily = ['orange', 'sunset'].includes(themeKey) ||
            accLower.startsWith('#ea') || accLower.startsWith('#f9') ||
            Boolean(theme?.name && (theme.name.includes('برتقالي') || theme.name.includes('غروب')));

        if (isBlueFamily) {
            primaryAccent = effectiveAccent || '#2563EB';
            primaryAccentText = '#FFFFFF';
            cardBgColor = '#FFFFFF';
            cardBorderColor = '#BFDBFE';
            headerBg = '#EFF6FF';
            headerBorder = '#DBEAFE';
            textPrimary = '#0F172A';
            textSecondary = '#1E40AF';
            segmentBg = '#EFF6FF';
            segmentBorder = '#DBEAFE';
            boxBg = '#F0F9FF';
            boxBorder = '#BAE6FD';
            inputActiveBg = primaryAccent;
            inputActiveText = '#FFFFFF';
            inputInactiveBg = '#FFFFFF';
            inputInactiveBorder = '#BAE6FD';
            actionSaveBg = primaryAccent;
            actionSaveText = '#FFFFFF';
            actionCancelBorder = '#BFDBFE';
            actionCancelText = '#1E40AF';
            presetBtnBg = '#F0F9FF';
            presetBtnText = '#0369A1';
            presetBtnBorder = '#BAE6FD';
            nowBtnBg = '#E0F2FE';
            nowBtnText = '#0284C7';
            nowBtnBorder = '#BAE6FD';
            footerBg = '#F8FAFC';
            footerBorder = '#E2E8F0';
        } else if (isRedFamily) {
            primaryAccent = effectiveAccent || '#DC2626';
            primaryAccentText = '#FFFFFF';
            cardBgColor = '#FFFFFF';
            cardBorderColor = '#FECACA';
            headerBg = '#FEF2F2';
            headerBorder = '#FEE2E2';
            textPrimary = '#0F172A';
            textSecondary = '#991B1B';
            segmentBg = '#FEF2F2';
            segmentBorder = '#FEE2E2';
            boxBg = '#FFF1F2';
            boxBorder = '#FECDD3';
            inputActiveBg = primaryAccent;
            inputActiveText = '#FFFFFF';
            inputInactiveBg = '#FFFFFF';
            inputInactiveBorder = '#FECDD3';
            actionSaveBg = primaryAccent;
            actionSaveText = '#FFFFFF';
            actionCancelBorder = '#FECACA';
            actionCancelText = '#991B1B';
            presetBtnBg = '#FFF1F2';
            presetBtnText = '#9F1239';
            presetBtnBorder = '#FECDD3';
            nowBtnBg = '#FEE2E2';
            nowBtnText = '#B91C1C';
            nowBtnBorder = '#FECACA';
            footerBg = '#F8FAFC';
            footerBorder = '#E2E8F0';
        } else if (isPurpleFamily) {
            primaryAccent = effectiveAccent || '#9333EA';
            primaryAccentText = '#FFFFFF';
            cardBgColor = '#FFFFFF';
            cardBorderColor = '#E9D5FF';
            headerBg = '#FAF5FF';
            headerBorder = '#F3E8FF';
            textPrimary = '#0F172A';
            textSecondary = '#6B21A8';
            segmentBg = '#FAF5FF';
            segmentBorder = '#F3E8FF';
            boxBg = '#FAF5FF';
            boxBorder = '#E9D5FF';
            inputActiveBg = primaryAccent;
            inputActiveText = '#FFFFFF';
            inputInactiveBg = '#FFFFFF';
            inputInactiveBorder = '#E9D5FF';
            actionSaveBg = primaryAccent;
            actionSaveText = '#FFFFFF';
            actionCancelBorder = '#E9D5FF';
            actionCancelText = '#6B21A8';
            presetBtnBg = '#FAF5FF';
            presetBtnText = '#6B21A8';
            presetBtnBorder = '#E9D5FF';
            nowBtnBg = '#F3E8FF';
            nowBtnText = '#7E22CE';
            nowBtnBorder = '#E9D5FF';
            footerBg = '#F8FAFC';
            footerBorder = '#E2E8F0';
        } else if (isOrangeFamily) {
            primaryAccent = effectiveAccent || '#EA580C';
            primaryAccentText = '#FFFFFF';
            cardBgColor = '#FFFFFF';
            cardBorderColor = '#FED7AA';
            headerBg = '#FFF7ED';
            headerBorder = '#FFEDD5';
            textPrimary = '#0F172A';
            textSecondary = '#9A3412';
            segmentBg = '#FFF7ED';
            segmentBorder = '#FFEDD5';
            boxBg = '#FFF7ED';
            boxBorder = '#FED7AA';
            inputActiveBg = primaryAccent;
            inputActiveText = '#FFFFFF';
            inputInactiveBg = '#FFFFFF';
            inputInactiveBorder = '#FED7AA';
            actionSaveBg = primaryAccent;
            actionSaveText = '#FFFFFF';
            actionCancelBorder = '#FED7AA';
            actionCancelText = '#9A3412';
            presetBtnBg = '#FFF7ED';
            presetBtnText = '#9A3412';
            presetBtnBorder = '#FED7AA';
            nowBtnBg = '#FFEDD5';
            nowBtnText = '#C2410C';
            nowBtnBorder = '#FED7AA';
            footerBg = '#F8FAFC';
            footerBorder = '#E2E8F0';
        } else {
            // Emerald Green / Islamic Default
            primaryAccent = effectiveAccent || '#059669';
            primaryAccentText = '#FFFFFF';
            cardBgColor = '#FFFFFF';
            cardBorderColor = '#BBF7D0';
            headerBg = '#F0FDF4';
            headerBorder = '#DCFCE7';
            textPrimary = '#0F172A';
            textSecondary = '#166534';
            segmentBg = '#F0FDF4';
            segmentBorder = '#DCFCE7';
            boxBg = '#F0FDF4';
            boxBorder = '#BBF7D0';
            inputActiveBg = primaryAccent;
            inputActiveText = '#FFFFFF';
            inputInactiveBg = '#FFFFFF';
            inputInactiveBorder = '#BBF7D0';
            actionSaveBg = primaryAccent;
            actionSaveText = '#FFFFFF';
            actionCancelBorder = '#CBD5E1';
            actionCancelText = '#166534';
            presetBtnBg = '#F0FDF4';
            presetBtnText = '#166534';
            presetBtnBorder = '#BBF7D0';
            nowBtnBg = '#DCFCE7';
            nowBtnText = '#15803D';
            nowBtnBorder = '#BBF7D0';
            footerBg = '#F8FAFC';
            footerBorder = '#E2E8F0';
        }
    }

    return (
        <div 
            dir={isEn ? 'ltr' : 'rtl'}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-[340px] sm:max-w-[365px] rounded-3xl shadow-2xl overflow-hidden border flex flex-col transition-all animate-scaleUp select-none"
                style={{
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                    color: textPrimary
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Banner - Clean with No 'X' button, Title & Icon Centered */}
                <div 
                    className="py-3.5 px-4 flex items-center justify-center border-b shrink-0"
                    style={{
                        backgroundColor: headerBg,
                        borderColor: headerBorder
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <div 
                            className="w-7 h-7 rounded-xl flex items-center justify-center shadow-xs shrink-0"
                            style={{ backgroundColor: primaryAccent, color: primaryAccentText }}
                        >
                            <Clock className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base tracking-wide" style={{ color: textPrimary }}>
                            {title || (isEn ? 'Set Time' : 'تحديد الوقت')}
                        </h3>
                    </div>
                </div>

                {/* Body - Digital Picker */}
                <div className="p-4 sm:p-5 space-y-4">
                    {/* AM / PM Segmented Switch */}
                    <div 
                        className="flex items-center justify-center p-1 rounded-2xl border"
                        style={{
                            backgroundColor: segmentBg,
                            borderColor: segmentBorder
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setIsPM(false)}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
                                !isPM
                                    ? 'shadow-md scale-[1.02]'
                                    : 'opacity-60 hover:opacity-90'
                            }`}
                            style={{
                                backgroundColor: !isPM ? primaryAccent : 'transparent',
                                color: !isPM ? primaryAccentText : textPrimary
                            }}
                        >
                            <span>☀️</span>
                            <span>{isEn ? 'AM (Morning)' : 'صباحاً'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPM(true)}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
                                isPM
                                    ? 'shadow-md scale-[1.02]'
                                    : 'opacity-60 hover:opacity-90'
                            }`}
                            style={{
                                backgroundColor: isPM ? primaryAccent : 'transparent',
                                color: isPM ? primaryAccentText : textPrimary
                            }}
                        >
                            <span>🌙</span>
                            <span>{isEn ? 'PM (Evening)' : 'مساءً'}</span>
                        </button>
                    </div>

                    {/* Digital Time Pods Display (Direct Typing + Steppers) */}
                    <div 
                        className="flex items-center justify-center gap-2 sm:gap-3 py-3 px-3 rounded-2xl border shadow-inner"
                        style={{
                            backgroundColor: boxBg,
                            borderColor: boxBorder
                        }}
                    >
                        {/* Hours Digital Column */}
                        <div className="flex flex-col items-center">
                            <button
                                type="button"
                                onClick={() => adjustHours(1)}
                                className="w-10 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 transition-transform cursor-pointer border-0"
                                style={{ color: textPrimary }}
                                title={isEn ? 'Add Hour' : 'زيادة ساعة'}
                            >
                                <ChevronUp className="w-5 h-5 opacity-70" />
                            </button>

                            <div className="relative">
                                <input
                                    ref={hourInputRef}
                                    type="text"
                                    dir="ltr"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={2}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    value={hourInput}
                                    onFocus={handleHourFocus}
                                    onClick={handleHourClick}
                                    onChange={handleHourChange}
                                    onBlur={handleHourBlur}
                                    placeholder="--"
                                    className={`w-20 sm:w-24 h-16 sm:h-20 rounded-2xl font-black text-3xl sm:text-4xl text-center tabular-nums transition-all outline-none border cursor-text ${
                                        activeField === 'hours'
                                            ? 'shadow-lg ring-2 ring-offset-2'
                                            : 'shadow-xs hover:border-black/20 dark:hover:border-white/20'
                                    }`}
                                    style={{
                                        backgroundColor: activeField === 'hours' ? inputActiveBg : inputInactiveBg,
                                        color: activeField === 'hours' ? inputActiveText : textPrimary,
                                        borderColor: activeField === 'hours' ? primaryAccent : inputInactiveBorder,
                                        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Cairo", sans-serif'
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => adjustHours(-1)}
                                className="w-10 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 transition-transform cursor-pointer border-0"
                                style={{ color: textPrimary }}
                                title={isEn ? 'Subtract Hour' : 'إنقاص ساعة'}
                            >
                                <ChevronDown className="w-5 h-5 opacity-70" />
                            </button>

                            <span className="text-xs font-bold mt-0.5" style={{ color: textSecondary }}>
                                {isEn ? 'Hour' : 'ساعة'}
                            </span>
                        </div>

                        {/* Digital Separator Colon */}
                        <div className="flex flex-col items-center justify-center pb-5">
                            <span 
                                className="text-3xl sm:text-4xl font-black opacity-60 animate-pulse select-none"
                                style={{ color: textPrimary }}
                            >
                                :
                            </span>
                        </div>

                        {/* Minutes Digital Column */}
                        <div className="flex flex-col items-center">
                            <button
                                type="button"
                                onClick={() => adjustMinutes(1)}
                                className="w-10 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 transition-transform cursor-pointer border-0"
                                style={{ color: textPrimary }}
                                title={isEn ? 'Add Minute' : 'زيادة دقيقة'}
                            >
                                <ChevronUp className="w-5 h-5 opacity-70" />
                            </button>

                            <div className="relative">
                                <input
                                    ref={minuteInputRef}
                                    type="text"
                                    dir="ltr"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={2}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    value={minuteInput}
                                    onFocus={handleMinuteFocus}
                                    onClick={handleMinuteClick}
                                    onChange={handleMinuteChange}
                                    onBlur={handleMinuteBlur}
                                    placeholder="--"
                                    className={`w-20 sm:w-24 h-16 sm:h-20 rounded-2xl font-black text-3xl sm:text-4xl text-center tabular-nums transition-all outline-none border cursor-text ${
                                        activeField === 'minutes'
                                            ? 'shadow-lg ring-2 ring-offset-2'
                                            : 'shadow-xs hover:border-black/20 dark:hover:border-white/20'
                                    }`}
                                    style={{
                                        backgroundColor: activeField === 'minutes' ? inputActiveBg : inputInactiveBg,
                                        color: activeField === 'minutes' ? inputActiveText : textPrimary,
                                        borderColor: activeField === 'minutes' ? primaryAccent : inputInactiveBorder,
                                        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Cairo", sans-serif'
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => adjustMinutes(-1)}
                                className="w-10 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 transition-transform cursor-pointer border-0"
                                style={{ color: textPrimary }}
                                title={isEn ? 'Subtract Minute' : 'إنقاص دقيقة'}
                            >
                                <ChevronDown className="w-5 h-5 opacity-70" />
                            </button>

                            <span className="text-xs font-bold mt-0.5" style={{ color: textSecondary }}>
                                {isEn ? 'Minute' : 'دقيقة'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Minute Interval Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
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
                                    className={`py-1 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                        isActive ? 'shadow-xs scale-105' : 'opacity-70 hover:opacity-100'
                                    }`}
                                    style={{
                                        backgroundColor: isActive ? primaryAccent : presetBtnBg,
                                        color: isActive ? primaryAccentText : presetBtnText,
                                        borderColor: isActive ? primaryAccent : presetBtnBorder
                                    }}
                                >
                                    :{isEn ? mStr : toArabic(mStr)}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => adjustMinutes(-5)}
                            className="py-1 px-2 rounded-xl text-xs font-bold opacity-80 hover:opacity-100 transition-opacity cursor-pointer border"
                            style={{ 
                                backgroundColor: presetBtnBg,
                                color: presetBtnText,
                                borderColor: presetBtnBorder
                            }}
                        >
                            -5{isEn ? 'm' : 'د'}
                        </button>

                        <button
                            type="button"
                            onClick={() => adjustMinutes(5)}
                            className="py-1 px-2 rounded-xl text-xs font-bold opacity-80 hover:opacity-100 transition-opacity cursor-pointer border"
                            style={{ 
                                backgroundColor: presetBtnBg,
                                color: presetBtnText,
                                borderColor: presetBtnBorder
                            }}
                        >
                            +5{isEn ? 'm' : 'د'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSetNow}
                            className="py-1 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 opacity-90 hover:opacity-100 transition-all cursor-pointer border shadow-xs"
                            style={{ 
                                backgroundColor: nowBtnBg,
                                color: nowBtnText,
                                borderColor: nowBtnBorder
                            }}
                            title={isEn ? 'Set Current Time' : 'ضبط الوقت الحالي'}
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>{isEn ? 'Now' : 'الآن'}</span>
                        </button>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div 
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 border-t shrink-0"
                    style={{
                        backgroundColor: footerBg,
                        borderColor: footerBorder
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm opacity-85 hover:opacity-100 transition-all cursor-pointer border hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
                        style={{
                            borderColor: actionCancelBorder,
                            color: actionCancelText,
                            backgroundColor: 'transparent'
                        }}
                    >
                        {isEn ? 'Cancel' : 'إلغاء'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg active:scale-95 hover:brightness-105 transition-all cursor-pointer border-0"
                        style={{
                            backgroundColor: actionSaveBg,
                            color: actionSaveText
                        }}
                    >
                        <Check className="w-4 h-4" />
                        <span>{isEn ? 'Save Time' : 'حفظ الوقت'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IslamicTimePickerModal;
