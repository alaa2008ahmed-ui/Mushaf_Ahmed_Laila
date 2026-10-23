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
    HistoricalEventLocalized
} from '../utils/calendarTranslations';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, RefreshCw, ZoomIn, Copy, Share2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { CALENDAR_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

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

const CalendarGrid = ({ viewDate, onSelectDay, selectedDay, theme, primaryColor, secondaryColor, isBlackAndWhite, isDefaultTheme, language }: any) => {
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
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full p-1 sm:p-2">
            {CALENDAR_WEEKDAYS.map((_, dayIdx) => (
                <div key={dayIdx} className="text-center py-2 text-[10px] sm:text-xs font-black themed-text-muted opacity-40 uppercase tracking-tighter">
                    {getCalendarWeekdayName(dayIdx, true, language)}
                </div>
            ))}
            {cells.map((cell, idx) => {
                const dayDate = new Date(cell.date);
                dayDate.setHours(0,0,0,0);
                const isToday = dayDate.getTime() === today.getTime();
                const isSelected = selectedDay && dayDate.getTime() === new Date(selectedDay).setHours(0,0,0,0);
                const hijri = getHijriDetails(cell.date);
                const event = islamicEvents.find(e => e.day === hijri.day && e.month === hijri.month);
                const isRamadan = hijri.month === 9;

                // Color definition for the border
                const borderColor = isDefaultTheme ? '#000000' : (theme.palette?.[0] || '#000000');

                let dynamicBgClass = 'bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm';
                let dynamicTextClass = '';
                let dynamicDotClass = '';
                
                if (event?.isPrimary) {
                    if (isSelected) {
                        dynamicBgClass = 'bg-red-500 text-white shadow-lg border-transparent';
                        dynamicDotClass = 'bg-white';
                    } else {
                        dynamicBgClass = 'bg-red-500/15 dark:bg-red-500/25 border border-red-500/30 shadow-sm text-red-500';
                        dynamicTextClass = 'text-red-600 dark:text-red-400';
                        dynamicDotClass = 'bg-red-500';
                    }
                } else if (event) {
                    if (isSelected) {
                        dynamicBgClass = 'bg-blue-500 text-white shadow-lg border-transparent';
                        dynamicDotClass = 'bg-white';
                    } else {
                        dynamicBgClass = 'bg-blue-500/15 dark:bg-blue-500/25 border border-blue-500/30 shadow-sm text-blue-500';
                        dynamicTextClass = 'text-blue-600 dark:text-blue-400';
                        dynamicDotClass = 'bg-blue-500';
                    }
                } else if (isRamadan) {
                    if (isSelected) {
                        dynamicBgClass = 'bg-emerald-500 text-white shadow-lg border-transparent';
                    } else {
                        dynamicBgClass = 'bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/30 shadow-sm text-emerald-600 dark:text-emerald-400';
                        dynamicTextClass = 'text-emerald-700 dark:text-emerald-400';
                    }
                } else {
                    if (isSelected) {
                        dynamicBgClass = 'shadow-xl text-white';
                    }
                }

                let cellStyle: React.CSSProperties = {};
                if (!event && !isRamadan) {
                    if (isSelected) {
                        cellStyle.backgroundColor = isDefaultTheme ? '#000000' : secondaryColor;
                        cellStyle.color = isBlackAndWhite ? '#000' : '#FFF';
                    } else if (isToday) {
                        if (isDefaultTheme) {
                            cellStyle.backgroundColor = '#000000';
                            cellStyle.color = '#FFFFFF';
                        }
                    }
                } else if (isToday && !isSelected) {
                    dynamicBgClass += ' ring-2 ring-offset-1 ' + (event?.isPrimary ? 'ring-red-500 dark:ring-offset-gray-900' : (event ? 'ring-blue-500 dark:ring-offset-gray-900' : 'ring-emerald-500 dark:ring-offset-gray-900'));
                }

                return (
                    <button
                        key={idx}
                        onClick={() => onSelectDay(cell.date)}
                        className={`relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl transition-all aspect-square 
                            ${cell.isCurrentMonth ? dynamicBgClass : 'opacity-30 ' + dynamicBgClass}
                            ${isSelected ? 'scale-110 z-10 shadow-xl' : 'hover:scale-[1.02] hover:bg-white/80 dark:hover:bg-white/10'}
                        `}
                        style={{ ...cellStyle, border: `1px solid ${borderColor}` }}
                    >
                        <span className={`text-sm sm:text-lg font-black leading-none ${!isSelected ? dynamicTextClass : ''}`}>
                            {formatCalendarNumber(cell.day, language)}
                        </span>
                        <span className={`text-[9px] sm:text-[10px] mt-1 font-bold ${isSelected || isToday ? 'opacity-100' : 'opacity-40'} ${event ? 'opacity-100 font-black' : ''}`}>
                            {formatCalendarNumber(hijri.day, language)}
                        </span>
                        
                        {isToday && !isSelected && !isDefaultTheme && !event && !isRamadan && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white dark:border-gray-900" style={{ backgroundColor: secondaryColor }}></div>
                        )}

                        {event && (
                            <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${dynamicDotClass}`}></div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// --- Main Component ---
function HijriCalendar({ onBack, onNavigate }: { onBack: () => void, onNavigate: (id: string, params?: any) => void; }) {
    const { theme, themeKey } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const isBlackAndWhite = themeKey === 'deep_black';
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];
    const secondaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[1];
    
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
        const randomIndex = Math.floor(Math.random() * HISTORICAL_EVENTS_TRANSLATED.length);
        setHistoricalEvent(HISTORICAL_EVENTS_TRANSLATED[randomIndex]);
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
                                <HelpCircle size={19} />
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

            <main className="flex-1 overflow-y-auto px-3 pt-2 pb-6 shadow-inner">
                <div className="w-full max-w-lg mx-auto space-y-3">
                    
                    {/* Mode Toggles */}
                    <div className="flex p-1 rounded-2xl themed-bg-alt shadow-inner bg-white" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <button 
                            onClick={() => setActiveTab('calendar')}
                            className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center gap-2 duration-300 ${activeTab === 'calendar' ? 'shadow-lg' : (isDefaultTheme ? 'text-black opacity-60' : 'themed-text-muted hover:bg-black/5')}`}
                            style={activeTab === 'calendar' ? { backgroundColor: isDefaultTheme ? '#000000' : primaryColor, color: isDefaultTheme ? '#FFFFFF' : (isBlackAndWhite ? '#000' : '#FFF') } : (isDefaultTheme ? { backgroundColor: '#FFFFFF', color: '#000000' } : {})}
                        >
                            <CalendarIcon size={16} />
                            {tCalendar('calendarView', language)}
                        </button>
                        <button 
                            onClick={() => setActiveTab('converter')}
                            className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center gap-2 duration-300 ${activeTab === 'converter' ? 'shadow-lg' : (isDefaultTheme ? 'text-black opacity-60' : 'themed-text-muted hover:bg-black/5')}`}
                            style={activeTab === 'converter' ? { backgroundColor: isDefaultTheme ? '#000000' : primaryColor, color: isDefaultTheme ? '#FFFFFF' : (isBlackAndWhite ? '#000' : '#FFF') } : (isDefaultTheme ? { backgroundColor: '#FFFFFF', color: '#000000' } : {})}
                        >
                            <RefreshCw size={16} />
                            {tCalendar('dateConverter', language)}
                        </button>
                    </div>

                    {activeTab === 'calendar' ? (
                        <div className="space-y-2">
                            {/* Calendar Header Card */}
                            <div className="themed-card rounded-2xl shadow-lg overflow-hidden relative" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: isDefaultTheme ? '#000000' : primaryColor }}></div>
                                <div className="flex items-center justify-between p-3">
                                    <button 
                                        onClick={() => changeMonth(isRTL ? -1 : 1)} 
                                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all group active:scale-90"
                                        title={isRTL ? tCalendar('prevMonth', language) : tCalendar('nextMonth', language)}
                                    >
                                        <ChevronRight size={22} style={{ color: isDefaultTheme ? '#000000' : primaryColor }} />
                                    </button>
                                    <div className="flex-1 flex flex-col items-center justify-center cursor-pointer group" onClick={() => openPicker('calendarMonth')}>
                                        <h2 className="text-lg font-black tracking-tight group-active:scale-95 transition-transform" style={{ color: isDefaultTheme ? '#000000' : primaryColor }}>
                                            {getCalendarMonthName(viewDate.getMonth(), false, language)}{' '}
                                            <span onClick={(e) => { e.stopPropagation(); openPicker('calendarYear'); }}>
                                                {formatCalendarNumber(viewDate.getFullYear(), language)}
                                            </span>
                                        </h2>
                                        <p className="text-xs font-bold opacity-70 mt-0.5">
                                            {getCalendarMonthName(getHijriDetails(viewDate).month - 1, true, language)}{' '}
                                            {formatCalendarNumber(getHijriDetails(viewDate).year, language)} {tCalendar('hijriYearSuffix', language)}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => changeMonth(isRTL ? 1 : -1)} 
                                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all group active:scale-90"
                                        title={isRTL ? tCalendar('nextMonth', language) : tCalendar('prevMonth', language)}
                                    >
                                        <ChevronLeft size={22} style={{ color: isDefaultTheme ? '#000000' : primaryColor }} />
                                    </button>
                                </div>

                                {/* Calendar Grid */}
                                <div className="px-2 pb-3">
                                    <CalendarGrid 
                                        viewDate={viewDate} 
                                        onSelectDay={handleSelectDay} 
                                        selectedDay={selectedDate}
                                        theme={theme}
                                        primaryColor={primaryColor}
                                        secondaryColor={secondaryColor}
                                        isBlackAndWhite={isBlackAndWhite}
                                        isDefaultTheme={isDefaultTheme}
                                        language={language}
                                    />
                                </div>
                            </div>

                            {/* Event List Section */}
                            <div className="themed-card p-5 rounded-2xl shadow-md" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                <h3 className="font-kufi font-black text-lg mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: secondaryColor }}></div>
                                    {tCalendar('eventsTitle', language)}
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
                                                <div key={event.id} className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all shadow-sm" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm shrink-0 ${event.isPrimary ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                                                    <div className="flex-1">
                                                        <p className="font-black text-base opacity-95 mb-1" style={{ color: primaryColor }}>
                                                            {eventLocalizedName}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                            <span className="text-sm font-black" style={{ color: 'var(--text-color)' }}>
                                                                {formatCalendarNumber(event.day, language)} {getCalendarMonthName(event.month - 1, true, language)}
                                                            </span>
                                                            <span className="text-xs opacity-30">|</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm font-black" style={{ color: secondaryColor }}>{dayName}</span>
                                                                <span className="text-xs font-black" style={{ color: 'var(--text-color)' }}>{gFormatted}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    }
                                    return (
                                        <div className="text-center py-6 opacity-40 grayscale">
                                            <CalendarIcon size={36} className="mx-auto mb-2" />
                                            <p className="text-sm font-bold">{tCalendar('noEvents', language)}</p>
                                        </div>
                                    );
                                })()}
                            </div>
                            </div>
                        </div>
                    ) : (
                        /* Converter View */
                        <div className="space-y-3">
                            <div className="themed-card p-5 rounded-2xl shadow-lg space-y-5 relative overflow-hidden" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 -mr-12 -mt-12" style={{ backgroundColor: isDefaultTheme ? '#000000' : primaryColor }}></div>
                                
                                <div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold" style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}>
                                    <button 
                                        onClick={() => setConvTab('hijriToGregorian')}
                                        className={`flex-1 py-2 px-1 rounded-lg transition-all duration-300 ${convTab === 'hijriToGregorian' ? 'themed-card shadow-md transform scale-100 font-black' : 'themed-text-muted opacity-50 scale-95'}`}
                                        style={convTab === 'hijriToGregorian' ? { borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' } : {}}
                                    >
                                        {tCalendar('hijriToGregorian', language)}
                                    </button>
                                    <button 
                                        onClick={() => setConvTab('gregorianToHijri')}
                                        className={`flex-1 py-2 px-1 rounded-lg transition-all duration-300 ${convTab === 'gregorianToHijri' ? 'themed-card shadow-md transform scale-100 font-black' : 'themed-text-muted opacity-50 scale-95'}`}
                                        style={convTab === 'gregorianToHijri' ? { borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' } : {}}
                                    >
                                        {tCalendar('gregorianToHijri', language)}
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {convTab === 'gregorianToHijri' ? (
                                        <>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('gDay')}>
                                                <label className="text-[10px] themed-text-muted font-black">{tCalendar('dayLabel', language)}</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner text-xs" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                                    {formatCalendarNumber(inputs.gDay, language)}
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('gMonth')}>
                                                <label className="text-[10px] themed-text-muted font-black">{tCalendar('monthLabel', language)}</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner text-[10px]" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                                    {getCalendarMonthName(inputs.gMonth - 1, false, language)}
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('gYear')}>
                                                <label className="text-[10px] themed-text-muted font-black">{tCalendar('yearLabel', language)}</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner text-xs" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                                    {formatCalendarNumber(inputs.gYear, language)}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('hDay')}>
                                                <label className="text-[10px] themed-text-muted font-black">{tCalendar('dayLabel', language)}</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner text-xs" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                                    {formatCalendarNumber(inputs.hDay, language)}
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('hMonth')}>
                                                <label className="text-[10px] themed-text-muted font-black">{tCalendar('monthLabel', language)}</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner text-[10px]" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                                    {getCalendarMonthName(inputs.hMonth - 1, true, language)}
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('hYear')}>
                                                <label className="text-[10px] themed-text-muted font-black">{tCalendar('yearLabel', language)}</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner text-xs" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                                    {formatCalendarNumber(inputs.hYear, language)}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {convResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-center p-4 rounded-2xl bg-black/5 dark:bg-white/5 relative"
                                            style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'dashed' }}
                                        >
                                            <p className="text-[10px] themed-text-muted font-black mb-1 tracking-widest">{convMessage}</p>
                                            <p className="text-xl font-black" style={{ color: isDefaultTheme ? '#000000' : primaryColor }}>{convResult}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {historicalEvent && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="themed-card p-4 rounded-2xl shadow-md relative mt-1 group"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="absolute top-0 right-0 w-12 h-1 bg-gradient-to-l from-transparent" style={{ backgroundColor: isDefaultTheme ? '#000000' : secondaryColor, borderTopRightRadius: '999px' }}></div>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={refreshEvent}
                                                className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-all active:scale-90"
                                                title={tCalendar('anotherEvent', language)}
                                            >
                                                <RefreshCw size={12} className="hover:rotate-180 transition-transform duration-500" style={{ color: secondaryColor }} />
                                            </button>
                                            <h4 className="text-[10px] sm:text-xs font-black opacity-30 uppercase tracking-widest">
                                                {tCalendar('historyTitle', language)}
                                            </h4>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setShowZoomModal(true)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                                title={tCalendar('zoomIn', language)}
                                            >
                                                <ZoomIn size={14} style={{ color: secondaryColor }} />
                                            </button>
                                            <button 
                                                onClick={() => handleCopy(language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                                title={tCalendar('copy', language)}
                                            >
                                                <Copy size={14} style={{ color: secondaryColor }} />
                                            </button>
                                            <button 
                                                onClick={() => handleShare(
                                                    language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr,
                                                    language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr
                                                )}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                                title={tCalendar('share', language)}
                                            >
                                                <Share2 size={14} style={{ color: secondaryColor }} />
                                            </button>
                                        </div>
                                    </div>
                                    <h5 className="text-lg sm:text-xl font-black mb-1.5" style={{ color: isDefaultTheme ? '#000000' : primaryColor }}>
                                        {language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr}
                                    </h5>
                                    <div className="flex gap-4 text-xs font-bold themed-text-muted mb-3 justify-end">
                                        <span className="flex items-center gap-1.5">
                                            <CalendarIcon size={13} /> {language === 'en' ? historicalEvent.hijriYearEn : historicalEvent.hijriYearAr}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CalendarIcon size={13} /> {language === 'en' ? historicalEvent.gregorianYearEn : historicalEvent.gregorianYearAr}
                                        </span>
                                    </div>
                                    <p 
                                        className={`leading-relaxed themed-text-muted text-justify ${language === 'ar' ? 'font-amiri border-r-2 pr-4' : 'font-sans border-l-2 pl-4'}`} 
                                        style={{ 
                                            borderColor: `${secondaryColor}40`,
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
                        className="fixed bottom-8 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Zoom Modal */}
            <AnimatePresence>
                {showZoomModal && historicalEvent && (
                    <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => setShowZoomModal(false)}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="themed-card p-8 rounded-3xl w-full max-w-2xl text-center relative shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" 
                            style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            onClick={e => e.stopPropagation()}
                            dir={dir}
                        >
                            <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                                <h3 className="text-2xl font-black mb-6" style={{ color: isDefaultTheme ? '#000000' : primaryColor }}>
                                    {language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr}
                                </h3>
                                <div 
                                    className={`text-2xl md:text-3xl leading-relaxed themed-text ${language === 'ar' ? 'font-amiri' : 'font-sans'}`}
                                >
                                    {language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr}
                                </div>
                                <div className="flex gap-6 text-sm font-bold themed-text-muted mt-8 justify-center">
                                    <span className="flex items-center gap-2">
                                        <CalendarIcon size={18} /> {language === 'en' ? historicalEvent.hijriYearEn : historicalEvent.hijriYearAr}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <CalendarIcon size={18} /> {language === 'en' ? historicalEvent.gregorianYearEn : historicalEvent.gregorianYearAr}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 shrink-0 flex gap-3">
                                <button onClick={() => setShowZoomModal(false)} className="flex-1 py-4 rounded-2xl font-black bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors">
                                    {tCalendar('close', language)}
                                </button>
                                <button 
                                    onClick={() => handleShare(
                                        language === 'en' ? historicalEvent.titleEn : historicalEvent.titleAr,
                                        language === 'en' ? historicalEvent.descriptionEn : historicalEvent.descriptionAr
                                    )}
                                    className="flex-1 py-4 rounded-2xl font-black text-white"
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
                    className="fixed inset-0 bg-black/40 z-[300] flex items-center justify-center p-6 backdrop-blur-[1px]"
                    onClick={() => setPickerConfig(p => ({ ...p, isOpen: false }))}
                    dir={dir}
                >
                    <div 
                        className="themed-card w-full max-w-[280px] rounded-[2.5rem] shadow-2xl flex flex-col max-h-[450px] overflow-hidden"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-black/5 dark:border-white/5 text-center shrink-0 bg-black/[0.03] dark:bg-white/[0.03]">
                            <h3 className="text-sm font-black opacity-80" style={{ color: primaryColor }}>{pickerConfig.title}</h3>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 hide-scrollbar">
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
                                        className={`w-full flex items-center justify-center p-3 rounded-2xl transition-all active:scale-[0.94] ${
                                            isSelected ? 'shadow-md z-10' : 'hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                        style={isSelected ? { backgroundColor: secondaryColor, color: isBlackAndWhite ? '#000' : '#FFF' } : {}}
                                    >
                                        <span className={`text-base ${isSelected ? 'font-black scale-110' : 'font-bold opacity-60'}`}>
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
