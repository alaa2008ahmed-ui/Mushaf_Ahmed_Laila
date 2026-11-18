import React, { useState, useEffect, useMemo, useRef } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import IslamicHistoryMemoryBottomSheet from '../components/MainMenu/IslamicHistoryMemoryBottomSheet';
import { hijriMonths, islamicEvents } from '../data/calendarData';
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
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, RefreshCw, ZoomIn, Copy, Share2, Check } from 'lucide-react';
import { shareAsImage } from '../utils/shareAsImage';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { CALENDAR_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getCalculator3DStyles, Calculator3DStyles } from '../utils/calculator3DStyles';
import { getToast3DStyles } from '../utils/toast3DStyles';

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
    s3d: Calculator3DStyles;
    language: Language;
}

const CalendarGrid = ({
    viewDate,
    onSelectDay,
    selectedDay,
    s3d,
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
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full">
            {CALENDAR_WEEKDAYS.map((_, dayIdx) => (
                <div
                    key={dayIdx}
                    className="text-center py-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-tight"
                    style={{ color: s3d.subtextColor }}
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

                let dayContainerStyle: React.CSSProperties = {};
                let buttonClass = '';
                let mainTextColor = s3d.textColor;
                let hijriTextColor = s3d.subtextColor;

                if (isToday) {
                    dayContainerStyle = {
                        backgroundColor: s3d.primaryColor,
                        color: s3d.btnTextColor,
                        ...(isSelected ? { outline: `2px solid ${s3d.isBlackTheme ? '#F59E0B' : s3d.primaryColor}`, outlineOffset: '2px' } : {})
                    };
                    buttonClass = 'app-page-card border-0 z-10';
                    mainTextColor = s3d.btnTextColor;
                    hijriTextColor = s3d.btnTextColor;
                } else if (isSelected) {
                    dayContainerStyle = {
                        backgroundColor: s3d.activeTintBg,
                        boxShadow: s3d.isBlackTheme
                            ? '0 0 0 2px #FFFFFF'
                            : `0 0 0 2px ${s3d.primaryColor}`
                    };
                    buttonClass = 'app-page-card border-0 z-10';
                    mainTextColor = s3d.isBlackTheme ? '#FFFFFF' : s3d.primaryColor;
                    hijriTextColor = s3d.isBlackTheme ? 'rgba(255,255,255,0.85)' : s3d.primaryColor;
                } else if (cell.isCurrentMonth) {
                    buttonClass = `app-page-card border-0 ${s3d.surfaceCardClass}`;
                } else {
                    buttonClass = `app-inner-3d-box border-0 opacity-45 hover:opacity-75 active:scale-95 ${s3d.isBlackTheme ? 'bg-[#18181b]/75' : 'bg-slate-100/80 dark:bg-zinc-900/50'}`;
                }

                return (
                    <button
                        type="button"
                        key={idx}
                        onClick={() => onSelectDay(cell.date)}
                        className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-150 aspect-square cursor-pointer ${buttonClass}`}
                        style={dayContainerStyle}
                    >
                        <span className="text-sm sm:text-base font-black leading-none" style={{ color: mainTextColor }}>
                            {formatCalendarNumber(cell.day, language)}
                        </span>

                        <span
                            className="text-[9px] sm:text-[10px] mt-1 font-bold leading-none"
                            style={{ color: hijriTextColor, opacity: isToday ? 0.85 : 0.8 }}
                        >
                            {formatCalendarNumber(hijri.day, language)}
                        </span>

                        {event && (
                            <span
                                className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                                    isToday ? '' : (event.isPrimary ? 'bg-red-500' : 'bg-blue-500')
                                }`}
                                style={isToday ? { backgroundColor: s3d.btnTextColor } : undefined}
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
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const primaryColor = s3d.primaryColor;

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
        <div
            className="h-[100dvh] flex flex-col font-sans overflow-hidden"
            style={{ backgroundColor: s3d.pageBgColor, color: s3d.textColor, fontFamily: theme.font }}
            dir={dir}
        >
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
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate">
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
                                <i className="fa-solid fa-circle-question text-lg"></i>
                            </button>
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

            <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 pt-3 app-scroll-safe">
                <div className="w-full max-w-lg mx-auto space-y-3.5">
                    
                    {/* Main 3D Segmented Control: Calendar / Date Converter */}
                    <div className={`app-page-card border-0 flex p-2 pb-2.5 rounded-2xl gap-2 overflow-visible ${s3d.surfaceCardClass}`}>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('calendar')}
                            className={`app-page-card border-0 flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer ${
                                activeTab === 'calendar' 
                                    ? 'font-black' 
                                    : `font-bold ${s3d.surfaceCardClass}`
                            }`}
                            style={activeTab === 'calendar' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : { color: s3d.subtextColor }}
                        >
                            <CalendarIcon size={16} />
                            <span>{tCalendar('calendarView', language)}</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('converter')}
                            className={`app-page-card border-0 flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer ${
                                activeTab === 'converter' 
                                    ? 'font-black' 
                                    : `font-bold ${s3d.surfaceCardClass}`
                            }`}
                            style={activeTab === 'converter' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : { color: s3d.subtextColor }}
                        >
                            <RefreshCw size={16} />
                            <span>{tCalendar('dateConverter', language)}</span>
                        </button>
                    </div>

                    {activeTab === 'calendar' ? (
                        <div className="space-y-4">
                            {/* Calendar Card: 3D Tasbeeh Card */}
                            <div className={`app-page-card border-0 rounded-3xl overflow-hidden ${s3d.surfaceCardClass}`}>
                                {/* Month Navigation Header */}
                                <div className={`flex items-center justify-between gap-2 p-3.5 sm:p-4 pb-4.5 border-b overflow-visible ${s3d.dividerClass}`}>
                                    <button 
                                        type="button"
                                        onClick={() => changeMonth(isRTL ? -1 : 1)} 
                                        className={`app-page-card border-0 w-10 h-10 flex items-center justify-center rounded-2xl transition-all cursor-pointer shrink-0 ${s3d.surfaceCardClass}`}
                                        title={isRTL ? tCalendar('prevMonth', language) : tCalendar('nextMonth', language)}
                                    >
                                        <ChevronRight size={20} style={{ color: primaryColor }} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`app-page-card border-0 flex-1 max-w-[230px] px-3.5 py-2 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${s3d.surfaceCardClass}`}
                                        onClick={() => openPicker('calendarMonth')}
                                    >
                                        <h2 
                                            className="text-sm sm:text-base font-black tracking-tight text-center leading-tight" 
                                            style={{ color: primaryColor }}
                                        >
                                            {getCalendarMonthName(viewDate.getMonth(), false, language)}{' '}
                                            <span onClick={(e) => { e.stopPropagation(); openPicker('calendarYear'); }} className="hover:underline">
                                                {formatCalendarNumber(viewDate.getFullYear(), language)}
                                            </span>
                                        </h2>
                                        <p className="text-[11px] font-bold mt-0.5 leading-tight" style={{ color: s3d.subtextColor }}>
                                            {getCalendarMonthName(getHijriDetails(viewDate).month - 1, true, language)}{' '}
                                            {formatCalendarNumber(getHijriDetails(viewDate).year, language)} {tCalendar('hijriYearSuffix', language)}
                                        </p>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => changeMonth(isRTL ? 1 : -1)} 
                                        className={`app-page-card border-0 w-10 h-10 flex items-center justify-center rounded-2xl transition-all cursor-pointer shrink-0 ${s3d.surfaceCardClass}`}
                                        title={isRTL ? tCalendar('nextMonth', language) : tCalendar('prevMonth', language)}
                                    >
                                        <ChevronLeft size={20} style={{ color: primaryColor }} />
                                    </button>
                                </div>

                                {/* Calendar Days Grid */}
                                <div className="p-3 sm:p-4 pb-4.5 overflow-visible">
                                    <CalendarGrid 
                                        viewDate={viewDate} 
                                        onSelectDay={handleSelectDay} 
                                        selectedDay={selectedDate}
                                        s3d={s3d}
                                        language={language}
                                    />
                                </div>
                            </div>

                            {/* Event List Section (أبرز المناسبات): 3D Tasbeeh Card */}
                            <div className={`app-page-card border-0 p-5 rounded-3xl ${s3d.surfaceCardClass}`}>
                                <h3
                                    className="font-cairo font-black text-base sm:text-lg mb-4 flex items-center gap-2.5"
                                    style={{ fontFamily: "'Cairo', sans-serif" }}
                                >
                                    <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                    <span style={{ color: primaryColor }}>{tCalendar('eventsTitle', language)}</span>
                                </h3>
                                <div className="space-y-3">
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
                                                        className={`app-inner-3d-box border-0 flex items-center gap-3.5 p-3.5 rounded-2xl transition-all ${s3d.innerCardClass}`}
                                                    >
                                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${event.isPrimary ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-extrabold text-sm sm:text-base mb-1 truncate" style={{ color: primaryColor }}>
                                                                {eventLocalizedName}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" style={{ color: s3d.subtextColor }}>
                                                                <span className="font-black" style={{ color: s3d.textColor }}>
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
                                            <div className={`app-3d-recessed-field border-0 text-center py-8 rounded-2xl ${s3d.recessedInputClass}`} style={{ color: s3d.subtextColor }}>
                                                <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-xs sm:text-sm font-bold">{tCalendar('noEvents', language)}</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Converter View (محول التاريخ): 3D Tasbeeh Card */
                        <div className="space-y-4">
                            <div className={`app-page-card border-0 p-5 rounded-3xl space-y-5 relative ${s3d.surfaceCardClass}`}>
                                
                                {/* Mode Toggles: Hijri <-> Gregorian 3D Segmented Control */}
                                <div className={`app-3d-recessed-field border-0 flex p-2 pb-2.5 rounded-2xl gap-2 text-xs font-bold overflow-visible ${s3d.recessedInputClass}`}>
                                    <button 
                                        type="button"
                                        onClick={() => setConvTab('hijriToGregorian')}
                                        className={`app-page-card border-0 flex-1 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                                            convTab === 'hijriToGregorian' 
                                                ? 'font-black' 
                                                : `font-bold ${s3d.surfaceCardClass}`
                                        }`}
                                        style={convTab === 'hijriToGregorian' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : { color: s3d.subtextColor }}
                                    >
                                        {tCalendar('hijriToGregorian', language)}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setConvTab('gregorianToHijri')}
                                        className={`app-page-card border-0 flex-1 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                                            convTab === 'gregorianToHijri' 
                                                ? 'font-black' 
                                                : `font-bold ${s3d.surfaceCardClass}`
                                        }`}
                                        style={convTab === 'gregorianToHijri' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : { color: s3d.subtextColor }}
                                    >
                                        {tCalendar('gregorianToHijri', language)}
                                    </button>
                                </div>

                                {/* Convert Date Section Label */}
                                <div className="flex items-center justify-center gap-2.5 pt-0.5">
                                    <div className="h-px flex-1 opacity-20" style={{ backgroundColor: primaryColor }} />
                                    <span
                                        className="font-cairo text-xs sm:text-sm font-black tracking-wide"
                                        style={{ color: primaryColor, fontFamily: "'Cairo', sans-serif" }}
                                    >
                                        {language === 'en' ? 'Convert Date' : 'تحويل التاريخ'}
                                    </span>
                                    <div className="h-px flex-1 opacity-20" style={{ backgroundColor: primaryColor }} />
                                </div>

                                {/* 3D Sculpted Picker Fields for Day / Month / Year */}
                                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 overflow-visible pb-1">
                                    {convTab === 'gregorianToHijri' ? (
                                        <>
                                            <div className="space-y-1.5 text-center overflow-visible">
                                                <label className="text-[11px] font-bold block" style={{ color: s3d.subtextColor }}>
                                                    {tCalendar('dayLabel', language)}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => openPicker('gDay')}
                                                    className={`app-page-card border-0 w-full p-3 sm:p-3.5 rounded-2xl font-black text-center text-sm sm:text-base transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                                                >
                                                    {formatCalendarNumber(inputs.gDay, language)}
                                                </button>
                                            </div>
                                            <div className="space-y-1.5 text-center overflow-visible">
                                                <label className="text-[11px] font-bold block" style={{ color: s3d.subtextColor }}>
                                                    {tCalendar('monthLabel', language)}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => openPicker('gMonth')}
                                                    className={`app-page-card border-0 w-full p-3 sm:p-3.5 rounded-2xl font-black text-center text-xs sm:text-sm transition-all truncate cursor-pointer ${s3d.surfaceCardClass}`}
                                                >
                                                    {getCalendarMonthName(inputs.gMonth - 1, false, language)}
                                                </button>
                                            </div>
                                            <div className="space-y-1.5 text-center overflow-visible">
                                                <label className="text-[11px] font-bold block" style={{ color: s3d.subtextColor }}>
                                                    {tCalendar('yearLabel', language)}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => openPicker('gYear')}
                                                    className={`app-page-card border-0 w-full p-3 sm:p-3.5 rounded-2xl font-black text-center text-sm sm:text-base transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                                                >
                                                    {formatCalendarNumber(inputs.gYear, language)}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1.5 text-center overflow-visible">
                                                <label className="text-[11px] font-bold block" style={{ color: s3d.subtextColor }}>
                                                    {tCalendar('dayLabel', language)}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => openPicker('hDay')}
                                                    className={`app-page-card border-0 w-full p-3 sm:p-3.5 rounded-2xl font-black text-center text-sm sm:text-base transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                                                >
                                                    {formatCalendarNumber(inputs.hDay, language)}
                                                </button>
                                            </div>
                                            <div className="space-y-1.5 text-center overflow-visible">
                                                <label className="text-[11px] font-bold block" style={{ color: s3d.subtextColor }}>
                                                    {tCalendar('monthLabel', language)}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => openPicker('hMonth')}
                                                    className={`app-page-card border-0 w-full p-3 sm:p-3.5 rounded-2xl font-black text-center text-xs sm:text-sm transition-all truncate cursor-pointer ${s3d.surfaceCardClass}`}
                                                >
                                                    {getCalendarMonthName(inputs.hMonth - 1, true, language)}
                                                </button>
                                            </div>
                                            <div className="space-y-1.5 text-center overflow-visible">
                                                <label className="text-[11px] font-bold block" style={{ color: s3d.subtextColor }}>
                                                    {tCalendar('yearLabel', language)}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => openPicker('hYear')}
                                                    className={`app-page-card border-0 w-full p-3 sm:p-3.5 rounded-2xl font-black text-center text-sm sm:text-base transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                                                >
                                                    {formatCalendarNumber(inputs.hYear, language)}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* 3D Conversion Result Container */}
                                {convResult && (
                                    <div 
                                        className="app-inner-3d-box border-0 text-center p-5 rounded-2xl relative"
                                        style={{ backgroundColor: s3d.softResultBg }}
                                    >
                                        <p 
                                            className="text-xs font-bold mb-1 tracking-wider opacity-85"
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
                                    </div>
                                )}
                            </div>

                            {/* Historical Event Card (بطاقة ذاكرة التاريخ): 3D Tasbeeh Card */}
                            {historicalEvent && (
                                <div 
                                    className={`app-page-card border-0 p-5 rounded-3xl relative group ${s3d.surfaceCardClass} ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}
                                    style={{ fontFamily: language === 'en' ? 'sans-serif' : "'Cairo', sans-serif" }}
                                >
                                    <div className="flex justify-between items-center mb-3.5 pb-1 overflow-visible">
                                        <div className="flex items-center gap-2.5 overflow-visible">
                                            <button 
                                                type="button"
                                                onClick={refreshEvent}
                                                className={`app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                                                title={tCalendar('anotherEvent', language)}
                                            >
                                                <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" style={{ color: s3d.textColor }} />
                                            </button>
                                            <h4 className={`text-[11px] font-bold uppercase tracking-widest ${language === 'ar' ? 'font-cairo' : 'font-sans'}`} style={{ color: s3d.subtextColor }}>
                                                {tCalendar('historyTitle', language)}
                                            </h4>
                                        </div>
                                        <div className="flex gap-2 overflow-visible">
                                            <button 
                                                type="button"
                                                onClick={() => setShowZoomModal(true)}
                                                className={`app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                                                title={tCalendar('zoomIn', language)}
                                            >
                                                <ZoomIn size={15} style={{ color: s3d.textColor }} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleCopy(language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr)}
                                                className={`app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                                                title={tCalendar('copy', language)}
                                            >
                                                <Copy size={15} style={{ color: s3d.textColor }} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleShare(
                                                    language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr,
                                                    language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr
                                                )}
                                                className={`app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                                                title={tCalendar('share', language)}
                                            >
                                                <Share2 size={15} style={{ color: s3d.textColor }} />
                                            </button>
                                        </div>
                                    </div>
                                    <h5 
                                        className={`text-lg sm:text-xl font-black mb-2.5 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`} 
                                        style={{ color: primaryColor }}
                                    >
                                        {language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr}
                                    </h5>
                                    <div className={`flex flex-wrap gap-2 text-xs font-bold mb-3.5 justify-end ${language === 'ar' ? 'font-cairo' : 'font-sans'}`} style={{ color: s3d.subtextColor }}>
                                        <span className={`app-3d-badge border-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${s3d.innerCardClass}`}>
                                            <CalendarIcon size={13} style={{ color: primaryColor }} /> {language === 'en' ? historicalEvent.hijriYearEn : historicalEvent.hijriYearAr}
                                        </span>
                                        <span className={`app-3d-badge border-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${s3d.innerCardClass}`}>
                                            <CalendarIcon size={13} style={{ color: primaryColor }} /> {language === 'en' ? historicalEvent.gregorianYearEn : historicalEvent.gregorianYearAr}
                                        </span>
                                    </div>
                                    <div className={`app-inner-3d-box border-0 p-4 rounded-2xl ${s3d.recessedInputClass}`}>
                                        <p 
                                            className={`leading-relaxed text-center font-medium ${
                                                language === 'ar' ? 'font-cairo' : 'font-sans'
                                            }`} 
                                            style={{ 
                                                color: s3d.textColor,
                                                fontSize: `${1.0 * historyFontSize}rem`
                                            }}
                                        >
                                            {(language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr)?.replace(/[ \t]+/g, ' ').trim()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Final Spacer */}
                    <div className="h-6" />
                </div>
            </main>

            {/* Toast Notification */}
            {toastMessage && (
                <div 
                    className="app-3d-toast fixed bottom-[calc(var(--app-bottom-clearance,0px)+1rem)] left-1/2 -translate-x-1/2 z-[200] max-w-[85vw] w-max px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-center leading-normal break-words pointer-events-none flex items-center justify-center gap-2.5"
                    style={toast3D.style}
                >
                    <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={toast3D.iconStyle}
                    >
                        <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Zoom Bottom Sheet (ذاكرة التاريخ الإسلامي) */}
            <IslamicHistoryMemoryBottomSheet
                isOpen={showZoomModal}
                onClose={() => setShowZoomModal(false)}
                event={historicalEvent}
                onNextEvent={(e) => {
                    e.stopPropagation();
                    refreshEvent();
                }}
                onShare={(e) => {
                    e.stopPropagation();
                    if (historicalEvent) {
                        handleShare(
                            language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr,
                            language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr
                        );
                    }
                }}
                onCopy={(e) => {
                    e.stopPropagation();
                    if (historicalEvent) {
                        handleCopy(language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr);
                    }
                }}
            />

            {/* Custom Picker Modal - 3D Sculpted */}
            {pickerConfig.isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-6"
                    onClick={() => setPickerConfig(p => ({ ...p, isOpen: false }))}
                    dir={dir}
                >
                    <div 
                        className={`app-page-card border-0 w-full max-w-[295px] rounded-3xl flex flex-col max-h-[72dvh] overflow-hidden ${s3d.surfaceCardClass}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`p-4 border-b ${s3d.dividerClass} text-center shrink-0`}>
                            <h3 className="text-sm font-black" style={{ color: primaryColor }}>{pickerConfig.title}</h3>
                        </div>

                        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3 space-y-2.5 hide-scrollbar">
                            {pickerConfig.options.map((opt, i) => {
                                const currentValue = pickerConfig.type === 'calendarMonth' ? viewDate.getMonth() 
                                                    : pickerConfig.type === 'calendarYear' ? viewDate.getFullYear()
                                                    : (inputs as any)[pickerConfig.type];
                                const isSelected = String(opt.value) === String(currentValue);

                                return (
                                    <button
                                        type="button"
                                        key={i}
                                        data-selected={isSelected}
                                        onClick={() => handlePickerSelect(opt.value)}
                                        className={`app-page-card border-0 w-full flex items-center justify-center p-3 rounded-2xl transition-all cursor-pointer ${
                                            isSelected 
                                                ? 'z-10 font-black' 
                                                : `font-bold ${s3d.surfaceCardClass}`
                                        }`}
                                        style={isSelected ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : { color: s3d.textColor }}
                                    >
                                        <span className="text-sm sm:text-base">
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
