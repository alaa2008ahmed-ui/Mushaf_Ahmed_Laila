import React, { useState, useEffect, useMemo, useRef } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ThemePageLock from '../components/ThemePageLock';
import { gregorianMonths, hijriMonths, islamicEvents, IslamicEvent } from '../data/calendarData';
import {
    tCalendar,
    formatCalendarNumber,
    getCalendarMonthName,
    getCalendarWeekdayName,
    CALENDAR_WEEKDAYS,
    CALENDAR_GREGORIAN_MONTHS,
    CALENDAR_HIJRI_MONTHS,
    HISTORICAL_EVENTS_TRANSLATED,
    ISLAMIC_EVENTS_TRANSLATED,
    HistoricalEventLocalized,
    Language
} from '../utils/calendarTranslations';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, RefreshCw, ZoomIn, Copy, Share2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { CALENDAR_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

// Helper to convert hex colors to RGBA for smooth dynamic theme tints
function hexToRgba(hex: string, alpha: number = 1): string {
    if (!hex) return `rgba(46, 125, 94, ${alpha})`;
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return `rgba(46, 125, 94, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Convert Gregorian to Hijri for a given date
function getHijriDetails(date: Date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return g2h(y, m, d);
}

function g2h(year: number, month: number, day: number) {
    const gDate = new Date(year, month - 1, day);
    
    // Try Intl first for modern dates (very accurate for today)
    try {
        const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
        const parts = formatter.formatToParts(gDate);
        const find = (type: string) => parts.find(p => p.type === type)?.value || '0';
        
        const hDay = parseInt(find('day'));
        const hMonth = parseInt(find('month'));
        const hYear = parseInt(find('year'));
        
        if (hDay > 0 && hMonth > 0 && hYear > 0) {
            return {
                day: hDay,
                month: hMonth,
                year: hYear,
                monthName: hijriMonths[hMonth - 1]?.name || ''
            };
        }
    } catch (e) {
        // Fallback to mathematical
    }

    // Mathematical algorithm (Tabular) - calibrated for historical dates
    let y = year;
    let m = month;
    if (m < 3) {
        y -= 1;
        m += 12;
    }
    let a = Math.floor(y / 100);
    let b = 2 - a + Math.floor(a / 4);
    if (y < 1583) b = 0;
    if (y === 1582) {
        if (m > 10) b = -10;
        if (m === 10 && day > 14) b = -10;
    }

    let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
    
    // Adjust JD for better alignment with standard tabular calendars
    // 1948440 is the epoch for AH 1, Muharram 1.
    let l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const hMonth = Math.floor((24 * l) / 709);
    const hDay = l - Math.floor((709 * hMonth) / 24);
    const hYear = 30 * n + j - 30;

    return {
        day: hDay,
        month: hMonth,
        year: hYear,
        monthName: hijriMonths[hMonth - 1]?.name || ''
    };
}

/**
 * Robust Hijri to Gregorian conversion.
 * Uses iterative search for precision.
 */
function h2g(y: number, m: number, d: number): Date {
    const daysSinceEpoch = Math.floor((y - 1) * 354.367) + (m - 1) * 29.5 + d;
    const estimateDate = new Date(622, 6, 19); // Hijri AH 1-1-1 epoch
    estimateDate.setDate(estimateDate.getDate() + daysSinceEpoch);
    
    let bestDate = new Date(estimateDate);
    
    for (let i = -5; i <= 5; i++) {
        const testDate = new Date(estimateDate);
        testDate.setDate(testDate.getDate() + i);
        const res = g2h(testDate.getFullYear(), testDate.getMonth() + 1, testDate.getDate());
        if (res.year === y && res.month === m && res.day === d) {
            return testDate;
        }
    }
    
    return bestDate;
}

// --- Sub-components ---

interface CalendarGridProps {
    viewDate: Date;
    onSelectDay: (date: Date) => void;
    selectedDay: Date;
    primaryColor: string;
    secondaryColor: string;
    language: Language;
}

const CalendarGrid = ({
    viewDate,
    onSelectDay,
    selectedDay,
    primaryColor,
    secondaryColor,
    language
}: CalendarGridProps) => {
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 is Sunday
    
    const prevMonthDays = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
    
    const cells = [];
    
    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, prevMonthDays - i);
        cells.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            date: d
        });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
        cells.push({
            day: i,
            isCurrentMonth: true,
            date: d
        });
    }
    
    // Next month padding
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, i);
        cells.push({
            day: i,
            isCurrentMonth: false,
            date: d
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full">
            {CALENDAR_WEEKDAYS.map((_, dayIdx) => (
                <div
                    key={dayIdx}
                    className="text-center py-2 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight"
                >
                    {getCalendarWeekdayName(dayIdx, true, language)}
                </div>
            ))}
            {cells.map((cell, idx) => {
                const dayDate = new Date(cell.date);
                dayDate.setHours(0, 0, 0, 0);
                const isToday = dayDate.getTime() === today.getTime();
                const isSelected = selectedDay && dayDate.getTime() === new Date(selectedDay).setHours(0, 0, 0, 0);
                const hijri = getHijriDetails(cell.date);
                const event = islamicEvents.find(e => e.day === hijri.day && e.month === hijri.month);

                // Styling logic:
                // 1. Is Today: Filled with the dynamic primary theme color, soft rounded shape (circle/rounded-2xl)
                // 2. Is Selected (not today): Highlighted with theme-tinted background and border ring
                // 3. Normal days: Free numbers with NO square borders, clean subtle hover
                let dayContainerStyle: React.CSSProperties = {};
                let textClasses = 'text-slate-800 dark:text-slate-100';
                let hijriTextClasses = 'text-slate-400 dark:text-slate-500';
                let stateClasses = 'hover:bg-slate-100/80 dark:hover:bg-white/10 active:scale-95';

                if (isToday) {
                    dayContainerStyle = {
                        backgroundColor: primaryColor,
                        color: '#FFFFFF'
                    };
                    textClasses = 'text-white font-black';
                    hijriTextClasses = 'text-white/80 font-bold';
                    stateClasses = 'shadow-md shadow-black/10 scale-100 z-10';
                    if (isSelected) {
                        stateClasses += ' ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900';
                    }
                } else if (isSelected) {
                    dayContainerStyle = {
                        backgroundColor: hexToRgba(primaryColor, 0.15),
                        color: primaryColor
                    };
                    textClasses = 'font-black';
                    hijriTextClasses = 'opacity-80 font-bold';
                    stateClasses = 'ring-1.5 ring-inset ring-current scale-105 z-10 shadow-sm';
                }

                return (
                    <button
                        key={idx}
                        onClick={() => onSelectDay(cell.date)}
                        className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-200 aspect-square cursor-pointer
                            ${cell.isCurrentMonth ? '' : 'opacity-25'}
                            ${stateClasses}
                        `}
                        style={dayContainerStyle}
                    >
                        {/* Gregorian Day (Free, unboxed number) */}
                        <span className={`text-sm sm:text-base font-black leading-none ${textClasses}`}>
                            {formatCalendarNumber(cell.day, language)}
                        </span>

                        {/* Hijri Day */}
                        <span className={`text-[9px] sm:text-[10px] mt-1 font-semibold leading-none ${hijriTextClasses}`}>
                            {formatCalendarNumber(hijri.day, language)}
                        </span>

                        {/* Event indicator dot */}
                        {event && (
                            <span
                                className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                                    isToday
                                        ? 'bg-white'
                                        : (event.isPrimary ? 'bg-red-500' : 'bg-blue-500')
                                }`}
                                title={event.name}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// --- Main Component ---
function HijriCalendar({ onBack, onNavigate }: { onBack: () => void; onNavigate: (id: string, params?: any) => void; }) {
    const { theme, themeKey } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const isBlackAndWhite = themeKey === 'deep_black' || theme.name === 'اسود';
    const isBlackTheme = theme.bgColor === '#000000' || isBlackAndWhite;

    // Use dynamic theme primary color seamlessly
    const primaryColor = isBlackTheme ? 'rgba(255, 255, 255, 0.22)' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const secondaryColor = isBlackTheme ? '#A1A1AA' : (theme.palette?.[1] || theme.palette?.[0] || '#4B5563');

    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'calendar' | 'converter'>('calendar');
    const [convTab, setConvTab] = useState<'hijriToGregorian' | 'gregorianToHijri'>('hijriToGregorian');
    const [historicalEvent, setHistoricalEvent] = useState<HistoricalEventLocalized | null>(null);
    const [historyFontSize] = useState(1);
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Picker States
    const [pickerConfig, setPickerConfig] = useState<{
        isOpen: boolean;
        type: 'gDay' | 'gMonth' | 'gYear' | 'hDay' | 'hMonth' | 'hYear' | 'calendarMonth' | 'calendarYear';
        options: { label: string; value: any }[];
        title: string;
    }>({ isOpen: false, type: 'gMonth', options: [], title: '' });

    // Converter State
    const [inputs, setInputs] = useState(() => {
        const h = getHijriDetails(new Date());
        return {
            gDay: new Date().getDate(),
            gMonth: new Date().getMonth() + 1,
            gYear: String(new Date().getFullYear()),
            hDay: h.day,
            hMonth: h.month,
            hYear: String(h.year)
        };
    });
    const [convResult, setConvResult] = useState('');
    const [convMessage, setConvMessage] = useState('');
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('hijri_calendar');
        if (!getGuideSeen('hijri_calendar_page_spotlight')) {
            setShowGuide(true);
        }
        const randomIndex = Math.floor(Math.random() * HISTORICAL_EVENTS_TRANSLATED.length);
        setHistoricalEvent(HISTORICAL_EVENTS_TRANSLATED[randomIndex]);
    }, []);

    const selectedHijri = useMemo(() => getHijriDetails(selectedDate), [selectedDate]);

    const refreshEvent = () => {
        if (HISTORICAL_EVENTS_TRANSLATED.length <= 1) return;
        setHistoricalEvent(prev => {
            let randomIndex = Math.floor(Math.random() * HISTORICAL_EVENTS_TRANSLATED.length);
            if (prev && HISTORICAL_EVENTS_TRANSLATED[randomIndex]?.titleAr === prev.titleAr) {
                randomIndex = (randomIndex + 1) % HISTORICAL_EVENTS_TRANSLATED.length;
            }
            return HISTORICAL_EVENTS_TRANSLATED[randomIndex];
        });
    };

    const handleBack = () => {
        if (showZoomModal) {
            setShowZoomModal(false);
        } else if (pickerConfig.isOpen) {
            setPickerConfig({ ...pickerConfig, isOpen: false });
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (showZoomModal) {
            setShowZoomModal(false);
        }
        if (pickerConfig.isOpen) {
            setPickerConfig({ ...pickerConfig, isOpen: false });
        }
        onNavigate('home');
    };

    useEffect(() => {
        const interceptor = () => {
            if (showZoomModal) { setShowZoomModal(false); return true; }
            if (pickerConfig.isOpen) { setPickerConfig({ ...pickerConfig, isOpen: false }); return true; }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [showZoomModal, pickerConfig.isOpen]);

    const changeMonth = (offset: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleSelectDay = (date: Date) => {
        setSelectedDate(date);
    };

    // Converter Logic
    useEffect(() => {
        if (convTab === 'gregorianToHijri') {
            const gY = parseInt(String(inputs.gYear));
            const gM = parseInt(String(inputs.gMonth));
            const gD = parseInt(String(inputs.gDay));

            if (isNaN(gY) || isNaN(gM) || isNaN(gD)) {
                setConvResult(tCalendar('invalidDate', language));
                setConvMessage('');
                return;
            }

            const hijri = g2h(gY, gM, gD);
            const mName = getCalendarMonthName(hijri.month - 1, true, language);
            setConvResult(`${formatCalendarNumber(hijri.day, language)} ${mName} ${formatCalendarNumber(hijri.year, language)} ${tCalendar('hijriYearSuffix', language)}`);
            setConvMessage(tCalendar('hijriResultPrefix', language));
        } else {
            const hY = parseInt(String(inputs.hYear));
            const hM = parseInt(String(inputs.hMonth));
            const hD = parseInt(String(inputs.hDay));
            
            if (isNaN(hY) || isNaN(hM) || isNaN(hD) || hY < 1 || hM < 1 || hM > 12 || hD < 1 || hD > 30) {
                 setConvResult(tCalendar('invalidHijriDate', language));
                 setConvMessage('');
                 return;
            }

            const date = h2g(hY, hM, hD);
            if (isNaN(date.getTime())) {
                setConvResult(tCalendar('conversionError', language));
                setConvMessage('');
            } else {
                const dayNum = formatCalendarNumber(date.getDate(), language);
                const monthName = getCalendarMonthName(date.getMonth(), false, language);
                const yearNum = formatCalendarNumber(date.getFullYear(), language);
                setConvResult(`${dayNum} ${monthName} ${yearNum} ${tCalendar('gregorianYearSuffix', language)}`);
                setConvMessage(tCalendar('gregorianResultPrefix', language));
            }
        }
    }, [inputs, convTab, activeTab, language]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setToastMessage(tCalendar('copiedToClipboard', language));
            setTimeout(() => setToastMessage(''), 2000);
        });
    };

    const handleShare = async (title: string, desc: string) => {
        if (!historicalEvent) return;
        const hijriY = language === 'en' ? historicalEvent.hijriYearEn : historicalEvent.hijriYearAr;
        const gregY = language === 'en' ? historicalEvent.gregorianYearEn : historicalEvent.gregorianYearAr;
        const dateStr = `${hijriY} • ${gregY}`;
        await shareAsImage({
            text: desc,
            source: `${title} (${dateStr})`,
            category: tCalendar('historyTitle', language),
            theme,
            setToastMessage
        });
    };

    const openPicker = (type: typeof pickerConfig.type) => {
        let options: { label: string; value: any }[] = [];
        let title = '';

        switch (type) {
            case 'gDay':
                options = Array.from({ length: 31 }, (_, i) => ({ label: formatCalendarNumber(i + 1, language), value: i + 1 }));
                title = tCalendar('selectGDay', language);
                break;
            case 'gMonth':
                options = CALENDAR_GREGORIAN_MONTHS.map(m => ({ label: language === 'en' ? m.en : m.ar, value: m.id }));
                title = tCalendar('selectGMonth', language);
                break;
            case 'gYear':
                options = Array.from({ length: 2100 - 622 + 1 }, (_, i) => ({ label: formatCalendarNumber(622 + i, language), value: 622 + i }));
                title = tCalendar('selectGYear', language);
                break;
            case 'hDay':
                options = Array.from({ length: 30 }, (_, i) => ({ label: formatCalendarNumber(i + 1, language), value: i + 1 }));
                title = tCalendar('selectHDay', language);
                break;
            case 'hMonth':
                options = CALENDAR_HIJRI_MONTHS.map(m => ({ label: language === 'en' ? m.en : m.ar, value: m.id }));
                title = tCalendar('selectHMonth', language);
                break;
            case 'hYear':
                options = Array.from({ length: 1600 }, (_, i) => ({ label: formatCalendarNumber(i + 1, language), value: i + 1 }));
                title = tCalendar('selectHYear', language);
                break;
            case 'calendarMonth':
                options = CALENDAR_GREGORIAN_MONTHS.map(m => ({ label: language === 'en' ? m.en : m.ar, value: m.id - 1 }));
                title = tCalendar('selectMonth', language);
                break;
            case 'calendarYear':
                const startGY = 1800;
                options = Array.from({ length: 2100 - 1800 + 1 }, (_, i) => ({ label: formatCalendarNumber(startGY + i, language), value: startGY + i }));
                title = tCalendar('selectYear', language);
                break;
        }

        setPickerConfig({ isOpen: true, type, options, title });
    };

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (pickerConfig.isOpen && scrollRef.current) {
            const selectedItem = scrollRef.current.querySelector('[data-selected="true"]');
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
    }, [pickerConfig.isOpen]);

    const handlePickerSelect = (value: any) => {
        const type = pickerConfig.type;
        if (type === 'calendarMonth') {
            setViewDate(new Date(viewDate.getFullYear(), value, 1));
        } else if (type === 'calendarYear') {
            setViewDate(new Date(value, viewDate.getMonth(), 1));
        } else {
            setInputs(prev => ({ ...prev, [type]: value }));
        }
        setPickerConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="h-screen flex flex-col bg-transparent font-sans overflow-hidden" dir={dir}>
            {/* Top Bar */}
            <header className="app-top-bar shrink-0">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back button */}
                        <div className="absolute right-0 flex items-center rtl:right-0 rtl:left-auto ltr:right-auto ltr:left-0">
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tCalendar('back', language)}
                                aria-label={tCalendar('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Page Title */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {tCalendar('pageTitle', language)}
                            </h1>
                        </div>

                        {/* Guide, Home button & Theme Lock */}
                        <div className="absolute left-0 flex items-center gap-1 rtl:left-0 rtl:right-auto ltr:left-auto ltr:right-0">
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={language === 'en' ? "Calendar Guide" : "دليل التقويم"}
                                aria-label={language === 'en' ? "Calendar Guide" : "دليل التقويم"}
                            >
                                <i className="fa-solid fa-circle-question text-lg text-black"></i>
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={handleGoHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tCalendar('home', language)}
                                aria-label={tCalendar('home', language)}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-3 sm:px-4 pt-3 pb-8">
                <div className="w-full max-w-lg mx-auto space-y-3.5">
                    
                    {/* Modern Segmented Control / Chips for Tabs (Zero solid black border, dynamic theming) */}
                    <div className="flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5 gap-1.5">
                        <button 
                            onClick={() => setActiveTab('calendar')}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm duration-200 cursor-pointer ${
                                activeTab === 'calendar' 
                                    ? 'shadow-md shadow-black/5 dark:shadow-none font-black' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/5'
                            }`}
                            style={activeTab === 'calendar' ? { backgroundColor: primaryColor, color: '#FFFFFF' } : {}}
                        >
                            <CalendarIcon size={16} />
                            <span>{tCalendar('calendarView', language)}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('converter')}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm duration-200 cursor-pointer ${
                                activeTab === 'converter' 
                                    ? 'shadow-md shadow-black/5 dark:shadow-none font-black' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/5'
                            }`}
                            style={activeTab === 'converter' ? { backgroundColor: primaryColor, color: '#FFFFFF' } : {}}
                        >
                            <RefreshCw size={16} />
                            <span>{tCalendar('dateConverter', language)}</span>
                        </button>
                    </div>

                    {activeTab === 'calendar' ? (
                        <div className="space-y-3.5">
                            {/* Calendar Card: Pure white / dark background with soft drop shadow, NO harsh black border */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm sm:shadow-md border border-slate-100 dark:border-white/5 overflow-hidden">
                                {/* Month Navigation Header */}
                                <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-white/5">
                                    <button 
                                        onClick={() => changeMonth(isRTL ? -1 : 1)} 
                                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all active:scale-90 cursor-pointer"
                                        title={isRTL ? tCalendar('prevMonth', language) : tCalendar('nextMonth', language)}
                                    >
                                        <ChevronRight size={22} style={{ color: primaryColor }} />
                                    </button>
                                    <div 
                                        className="flex-1 flex flex-col items-center justify-center cursor-pointer group px-2"
                                        onClick={() => openPicker('calendarMonth')}
                                    >
                                        <h2 
                                            className="text-base sm:text-lg font-black tracking-tight group-active:scale-95 transition-transform text-center" 
                                            style={{ color: primaryColor }}
                                        >
                                            {getCalendarMonthName(viewDate.getMonth(), false, language)}{' '}
                                            <span onClick={(e) => { e.stopPropagation(); openPicker('calendarYear'); }} className="hover:underline">
                                                {formatCalendarNumber(viewDate.getFullYear(), language)}
                                            </span>
                                        </h2>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                            {getCalendarMonthName(getHijriDetails(viewDate).month - 1, true, language)}{' '}
                                            {formatCalendarNumber(getHijriDetails(viewDate).year, language)} {tCalendar('hijriYearSuffix', language)}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => changeMonth(isRTL ? 1 : -1)} 
                                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all active:scale-90 cursor-pointer"
                                        title={isRTL ? tCalendar('nextMonth', language) : tCalendar('prevMonth', language)}
                                    >
                                        <ChevronLeft size={22} style={{ color: primaryColor }} />
                                    </button>
                                </div>

                                {/* Calendar Days Grid */}
                                <div className="p-2 sm:p-3">
                                    <CalendarGrid 
                                        viewDate={viewDate} 
                                        onSelectDay={handleSelectDay} 
                                        selectedDay={selectedDate}
                                        primaryColor={primaryColor}
                                        secondaryColor={secondaryColor}
                                        language={language}
                                    />
                                </div>
                            </div>

                            {/* Event List Section (أبرز المناسبات): Clean flat cards, dynamic theme coloring */}
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm sm:shadow-md border border-slate-100 dark:border-white/5">
                                <h3 className="font-kufi font-black text-base sm:text-lg mb-4 flex items-center gap-2.5">
                                    <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                    <span style={{ color: primaryColor }}>{tCalendar('eventsTitle', language)}</span>
                                </h3>
                                <div className="space-y-2.5">
                                    {(() => {
                                        const mYear = viewDate.getFullYear();
                                        const mMonth = viewDate.getMonth();
                                        const daysInMonth = new Date(mYear, mMonth + 1, 0).getDate();
                                        
                                        const eventsToShow: any[] = [];
                                        for (let i = 1; i <= daysInMonth; i++) {
                                            const dayDate = new Date(mYear, mMonth, i);
                                            const hInfo = getHijriDetails(dayDate);
                                            const e = islamicEvents.find(ev => ev.day === hInfo.day && ev.month === hInfo.month);
                                            if (e) {
                                                if (!eventsToShow.find(existing => existing.id === e.id)) {
                                                    eventsToShow.push({ ...e, gDate: dayDate });
                                                }
                                            }
                                        }
                                        
                                        if (eventsToShow.length > 0) {
                                            return eventsToShow.map((event: any) => {
                                                const gDate = event.gDate;
                                                const dayName = getCalendarWeekdayName(gDate.getDay(), false, language);
                                                const gFormatted = `${formatCalendarNumber(gDate.getDate(), language)} ${getCalendarMonthName(gDate.getMonth(), false, language)}`;
                                                const eventLocalizedName = language === 'en' && ISLAMIC_EVENTS_TRANSLATED[event.name]
                                                    ? ISLAMIC_EVENTS_TRANSLATED[event.name].enName
                                                    : event.name;

                                                return (
                                                    <div 
                                                        key={event.id} 
                                                        className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 dark:hover:bg-white/10 rounded-2xl transition-all border border-slate-100 dark:border-white/5 shadow-xs"
                                                    >
                                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${event.isPrimary ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm sm:text-base mb-1 truncate" style={{ color: primaryColor }}>
                                                                {eventLocalizedName}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                                                                <span className="font-black text-slate-800 dark:text-slate-200">
                                                                    {formatCalendarNumber(event.day, language)} {getCalendarMonthName(event.month - 1, true, language)}
                                                                </span>
                                                                <span className="opacity-30">|</span>
                                                                <div className="flex items-center gap-1.5 font-medium">
                                                                    <span className="font-bold" style={{ color: primaryColor }}>{dayName}</span>
                                                                    <span>{gFormatted}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        }
                                        return (
                                            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                                <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-xs sm:text-sm font-bold">{tCalendar('noEvents', language)}</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Converter View (محول التاريخ): Modern filled text fields, clean 10% theme container, dynamic theming */
                        <div className="space-y-3.5">
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm sm:shadow-md border border-slate-100 dark:border-white/5 space-y-5 relative">
                                
                                {/* Mode Toggles: Hijri <-> Gregorian Chips */}
                                <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-white/10 gap-1.5 text-xs font-bold">
                                    <button 
                                        onClick={() => setConvTab('hijriToGregorian')}
                                        className={`flex-1 py-2.5 px-2 rounded-xl transition-all duration-200 cursor-pointer ${
                                            convTab === 'hijriToGregorian' 
                                                ? 'shadow-sm font-black' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        style={convTab === 'hijriToGregorian' ? { backgroundColor: primaryColor, color: '#FFFFFF' } : {}}
                                    >
                                        {tCalendar('hijriToGregorian', language)}
                                    </button>
                                    <button 
                                        onClick={() => setConvTab('gregorianToHijri')}
                                        className={`flex-1 py-2.5 px-2 rounded-xl transition-all duration-200 cursor-pointer ${
                                            convTab === 'gregorianToHijri' 
                                                ? 'shadow-sm font-black' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        style={convTab === 'gregorianToHijri' ? { backgroundColor: primaryColor, color: '#FFFFFF' } : {}}
                                    >
                                        {tCalendar('gregorianToHijri', language)}
                                    </button>
                                </div>

                                {/* Modern Filled Text Fields for Day / Month / Year */}
                                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                                    {convTab === 'gregorianToHijri' ? (
                                        <>
                                            <div 
                                                className="space-y-1 text-center cursor-pointer group" 
                                                onClick={() => openPicker('gDay')}
                                            >
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                                                    {tCalendar('dayLabel', language)}
                                                </label>
                                                <div className="w-full p-3 sm:p-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200/70 dark:hover:bg-white/15 rounded-2xl font-black text-center text-sm sm:text-base text-slate-800 dark:text-slate-100 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                                    {formatCalendarNumber(inputs.gDay, language)}
                                                </div>
                                            </div>
                                            <div 
                                                className="space-y-1 text-center cursor-pointer group" 
                                                onClick={() => openPicker('gMonth')}
                                            >
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                                                    {tCalendar('monthLabel', language)}
                                                </label>
                                                <div className="w-full p-3 sm:p-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200/70 dark:hover:bg-white/15 rounded-2xl font-black text-center text-xs sm:text-sm text-slate-800 dark:text-slate-100 transition-all active:scale-95 truncate border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                                    {getCalendarMonthName(inputs.gMonth - 1, false, language)}
                                                </div>
                                            </div>
                                            <div 
                                                className="space-y-1 text-center cursor-pointer group" 
                                                onClick={() => openPicker('gYear')}
                                            >
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                                                    {tCalendar('yearLabel', language)}
                                                </label>
                                                <div className="w-full p-3 sm:p-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200/70 dark:hover:bg-white/15 rounded-2xl font-black text-center text-sm sm:text-base text-slate-800 dark:text-slate-100 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                                    {formatCalendarNumber(inputs.gYear, language)}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div 
                                                className="space-y-1 text-center cursor-pointer group" 
                                                onClick={() => openPicker('hDay')}
                                            >
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                                                    {tCalendar('dayLabel', language)}
                                                </label>
                                                <div className="w-full p-3 sm:p-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200/70 dark:hover:bg-white/15 rounded-2xl font-black text-center text-sm sm:text-base text-slate-800 dark:text-slate-100 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                                    {formatCalendarNumber(inputs.hDay, language)}
                                                </div>
                                            </div>
                                            <div 
                                                className="space-y-1 text-center cursor-pointer group" 
                                                onClick={() => openPicker('hMonth')}
                                            >
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                                                    {tCalendar('monthLabel', language)}
                                                </label>
                                                <div className="w-full p-3 sm:p-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200/70 dark:hover:bg-white/15 rounded-2xl font-black text-center text-xs sm:text-sm text-slate-800 dark:text-slate-100 transition-all active:scale-95 truncate border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                                    {getCalendarMonthName(inputs.hMonth - 1, true, language)}
                                                </div>
                                            </div>
                                            <div 
                                                className="space-y-1 text-center cursor-pointer group" 
                                                onClick={() => openPicker('hYear')}
                                            >
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                                                    {tCalendar('yearLabel', language)}
                                                </label>
                                                <div className="w-full p-3 sm:p-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200/70 dark:hover:bg-white/15 rounded-2xl font-black text-center text-sm sm:text-base text-slate-800 dark:text-slate-100 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                                    {formatCalendarNumber(inputs.hYear, language)}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Conversion Result Container: 10% Opacity Theme Tint, NO Dashed Border */}
                                <AnimatePresence>
                                    {convResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 8 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            className="text-center p-5 rounded-2xl relative transition-all duration-300"
                                            style={{ backgroundColor: hexToRgba(primaryColor, 0.10) }}
                                        >
                                            <p 
                                                className="text-xs font-bold mb-1 tracking-wider opacity-80"
                                                style={{ color: primaryColor }}
                                            >
                                                {convMessage}
                                            </p>
                                            <p 
                                                className="text-lg sm:text-2xl font-black" 
                                                style={{ color: primaryColor }}
                                            >
                                                {convResult}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Historical Event Card (بطاقة ذاكرة التاريخ): Soft drop shadow, primary-themed action buttons and side line */}
                            {historicalEvent && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm sm:shadow-md border border-slate-100 dark:border-white/5 relative group"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <button 
                                                onClick={refreshEvent}
                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                style={{ backgroundColor: hexToRgba(primaryColor, 0.08) }}
                                                title={tCalendar('anotherEvent', language)}
                                            >
                                                <RefreshCw size={13} className="hover:rotate-180 transition-transform duration-500" style={{ color: primaryColor }} />
                                            </button>
                                            <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                {tCalendar('historyTitle', language)}
                                            </h4>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setShowZoomModal(true)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                style={{ backgroundColor: hexToRgba(primaryColor, 0.08) }}
                                                title={tCalendar('zoomIn', language)}
                                            >
                                                <ZoomIn size={14} style={{ color: primaryColor }} />
                                            </button>
                                            <button 
                                                onClick={() => handleCopy(language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                style={{ backgroundColor: hexToRgba(primaryColor, 0.08) }}
                                                title={tCalendar('copy', language)}
                                            >
                                                <Copy size={14} style={{ color: primaryColor }} />
                                            </button>
                                            <button 
                                                onClick={() => handleShare(
                                                    language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr,
                                                    language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr
                                                )}
                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                style={{ backgroundColor: hexToRgba(primaryColor, 0.08) }}
                                                title={tCalendar('share', language)}
                                            >
                                                <Share2 size={14} style={{ color: primaryColor }} />
                                            </button>
                                        </div>
                                    </div>
                                    <h5 
                                        className="text-lg sm:text-xl font-black mb-2" 
                                        style={{ color: primaryColor }}
                                    >
                                        {language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr}
                                    </h5>
                                    <div className="flex gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 justify-end">
                                        <span className="flex items-center gap-1.5">
                                            <CalendarIcon size={13} style={{ color: primaryColor }} /> {language === 'en' ? historicalEvent.hijriYearEn : historicalEvent.hijriYearAr}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CalendarIcon size={13} style={{ color: primaryColor }} /> {language === 'en' ? historicalEvent.gregorianYearEn : historicalEvent.gregorianYearAr}
                                        </span>
                                    </div>
                                    <p 
                                        className={`leading-relaxed text-slate-700 dark:text-slate-300 text-justify ${
                                            language === 'ar' ? 'font-amiri border-r-2 pr-4' : 'font-sans border-l-2 pl-4'
                                        }`} 
                                        style={{ 
                                            borderColor: primaryColor,
                                            fontSize: `${1.0 * historyFontSize}rem`
                                        }}
                                    >
                                        {language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Final Spacer */}
                    <div className="h-6" />
                </div>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Zoom Modal */}
            <AnimatePresence>
                {showZoomModal && historicalEvent && (
                    <div className="fixed inset-0 bg-black/75 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => setShowZoomModal(false)}>
                        <motion.div 
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-2xl text-center relative shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 dark:border-white/10" 
                            onClick={e => e.stopPropagation()}
                            dir={dir}
                        >
                            <div className="overflow-y-auto hide-scrollbar flex-1 py-2">
                                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6" style={{ color: primaryColor }}>
                                    {language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr}
                                </h3>
                                <div 
                                    className={`text-xl sm:text-2xl leading-relaxed text-slate-800 dark:text-slate-100 ${
                                        language === 'ar' ? 'font-amiri' : 'font-sans'
                                    }`}
                                >
                                    {language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr}
                                </div>
                                <div className="flex gap-6 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mt-6 justify-center">
                                    <span className="flex items-center gap-1.5">
                                        <CalendarIcon size={16} style={{ color: primaryColor }} /> {language === 'en' ? historicalEvent.hijriYearEn : historicalEvent.hijriYearAr}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CalendarIcon size={16} style={{ color: primaryColor }} /> {language === 'en' ? historicalEvent.gregorianYearEn : historicalEvent.gregorianYearAr}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 shrink-0 flex gap-3">
                                <button 
                                    onClick={() => setShowZoomModal(false)} 
                                    className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-100 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                >
                                    {tCalendar('close', language)}
                                </button>
                                <button 
                                    onClick={() => handleShare(
                                        language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr,
                                        language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr
                                    )}
                                    className="flex-1 py-3.5 rounded-2xl font-bold text-white shadow-md transition-all active:scale-98 cursor-pointer"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {tCalendar('shareEvent', language)}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Picker Modal */}
            {pickerConfig.isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-6 backdrop-blur-xs"
                    onClick={() => setPickerConfig(p => ({ ...p, isOpen: false }))}
                    dir={dir}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 w-full max-w-[290px] rounded-3xl shadow-2xl flex flex-col max-h-[460px] overflow-hidden border border-slate-100 dark:border-white/10"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-white/5 text-center shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-black" style={{ color: primaryColor }}>{pickerConfig.title}</h3>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1 hide-scrollbar">
                            {pickerConfig.options.map((opt, i) => {
                                const currentValue = pickerConfig.type === 'calendarMonth' ? viewDate.getMonth() 
                                                    : pickerConfig.type === 'calendarYear' ? viewDate.getFullYear()
                                                    : (inputs as any)[pickerConfig.type];
                                const isSelected = String(opt.value) === String(currentValue);

                                return (
                                    <button
                                        key={i}
                                        data-selected={isSelected}
                                        onClick={() => handlePickerSelect(opt.value)}
                                        className={`w-full flex items-center justify-center p-3 rounded-2xl transition-all active:scale-[0.96] cursor-pointer ${
                                            isSelected 
                                                ? 'shadow-sm z-10 font-black' 
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
                                        }`}
                                        style={isSelected ? { backgroundColor: primaryColor, color: '#FFFFFF' } : {}}
                                    >
                                        <span className={`text-sm sm:text-base ${isSelected ? 'scale-105' : 'opacity-70'}`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Spotlight Guide */}
            <CommunitySpotlightGuide 
                guideKey="hijri_calendar_page_spotlight"
                steps={CALENDAR_PAGE_STEPS}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={language === 'en'}
            />
        </div>
    );
}

export default HijriCalendar;
