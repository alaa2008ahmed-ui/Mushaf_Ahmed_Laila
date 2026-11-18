import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePrayerTimes, getCalculationParams } from '../context/PrayerTimesContext';
import { Coordinates, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import moment from 'moment-hijri';
import { applyOffset } from '../utils/prayerTimesUtils';
import jsPDF from 'jspdf';
import { safeHtml2Canvas } from '../utils/canvasHelper';
import { Share2, ChevronRight, ChevronLeft, Calendar, X, FileText, ChevronDown, Check } from 'lucide-react';
import { Share as CapacitorShare } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { useLanguage } from '../context/LanguageContext';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { MONTHLY_PRAYER_TIMES_STEPS } from '../components/Community/communityTourSteps';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';
import {
    tPrayer,
    getPrayerDisplayName,
    getLocalizedLocationName,
    HIJRI_MONTHS_AR,
    HIJRI_MONTHS_EN,
    GREGORIAN_MONTHS_AR,
    GREGORIAN_MONTHS_EN,
    toEnglishDigits
} from '../utils/prayerTimesTranslations';

const toArabicDigits = (val: string | number): string => {
    if (val === null || val === undefined) return '';
    return String(val).replace(/[0-9]/g, w => '٠١٢٣٤٥٦٧٨٩'[+w]);
};

const formatLocalizedTime = (time24Str: string, isAr: boolean) => {
    if (!time24Str || time24Str.includes('--')) return "--:--";
    const cleaned = toEnglishDigits(time24Str);
    let [h, m] = cleaned.split(':');
    if (!h || !m) return time24Str;
    let hInt = parseInt(h, 10);
    const ap = hInt >= 12 ? (isAr ? 'م' : 'pm') : (isAr ? 'ص' : 'am');
    hInt = hInt % 12 || 12;
    
    if (isAr) {
        const hStr = toArabicDigits(hInt);
        const mStr = toArabicDigits(m.toString().padStart(2, '0'));
        return `${hStr}:${mStr} ${ap}`;
    } else {
        const hStr = String(hInt);
        const mStr = m.toString().padStart(2, '0');
        return `${hStr}:${mStr} ${ap}`;
    }
};

export default function MonthlyPrayerTimes({ onBack, onNavigate }: { onBack: () => void, onNavigate: (id: string) => void }) {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const { config } = usePrayerTimes();
    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const [viewDate, setViewDate] = useState(moment());
    const [calendarType, setCalendarType] = useState<'hijri' | 'gregorian'>('hijri');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [openPickerMenu, setOpenPickerMenu] = useState<'month' | 'year' | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const pdfTableRef = useRef<HTMLDivElement>(null);
    const todayRowRef = useRef<HTMLTableRowElement>(null);

    const isDefaultTheme = themeKey === 'default';
    const isShinyGold = themeKey === 'shiny_gold';
    const isBlackAndWhite = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
    const primaryColor = isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]);
    const secondaryColor = isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[1]);
    const topBarTextColor = isDefaultTheme ? '#000000' : (theme.topBarText || (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));
    const tableBorderColor = isShinyGold ? '#D97706' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : (theme.palette?.[0] || '#000000')));

    useEffect(() => {
        if (!getGuideSeen('monthly_prayer_times_spotlight')) {
            setShowGuide(true);
        }
    }, []);

    useEffect(() => {
        const interceptor = () => {
            if (openPickerMenu) {
                setOpenPickerMenu(null);
                return true;
            }
            if (isPickerOpen) {
                setIsPickerOpen(false);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isPickerOpen, openPickerMenu]);

    const monthData = useMemo(() => {
        const data = [];
        const coordinates = new Coordinates(config.location.lat, config.location.lng);
        const isAr = language === 'ar';

        let daysInMonth = 30;
        if (calendarType === 'hijri') {
            daysInMonth = moment.iDaysInMonth(viewDate.iYear(), viewDate.iMonth());
        } else {
            daysInMonth = viewDate.daysInMonth();
        }

        for (let day = 1; day <= daysInMonth; day++) {
            let date: Date;
            if (calendarType === 'hijri') {
                date = moment().iYear(viewDate.iYear()).iMonth(viewDate.iMonth()).iDate(day).toDate();
            } else {
                date = moment().year(viewDate.year()).month(viewDate.month()).date(day).toDate();
            }
            
            const { params: dayParams } = getCalculationParams(date, config.location, config);
            const prayerTimes = new AdhanPrayerTimes(coordinates, date, dayParams);
            
            const formatTime = (d: Date) => {
                return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            };

            // Ramadan Isha Adjustment for specific countries (Saudi Arabia, Qatar)
            const isRamadan = moment(date).iMonth() === 8;
            const country = config.location.fullCountry || '';
            const code = config.location.combinedCode || '';
            
            let ishaTime = prayerTimes.isha;
            if (isRamadan && (code.startsWith('+966') || country.includes('السعودية') || code.startsWith('+974') || country.includes('قطر'))) {
                const maghribMs = prayerTimes.maghrib.getTime();
                const ishaMs = prayerTimes.isha.getTime();
                const diffMinutes = (ishaMs - maghribMs) / 60000;
                
                if (diffMinutes < 110) {
                    ishaTime = new Date(ishaMs + 30 * 60000);
                }
            }

            const dayName = new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', { weekday: 'long' }).format(date);
            
            const gregorianDayNum = date.getDate();
            const hijriDayNum = moment(date).iDate();

            const gregorianDay = isAr ? toArabicDigits(gregorianDayNum) : String(gregorianDayNum);
            const hijriDay = isAr ? toArabicDigits(hijriDayNum) : String(hijriDayNum);

            const gregorianYear = isAr ? toArabicDigits(date.getFullYear()) : String(date.getFullYear());
            const gregorianMonth = isAr ? toArabicDigits(date.getMonth() + 1) : String(date.getMonth() + 1);

            const hijriYear = isAr ? toArabicDigits(moment(date).iYear()) : String(moment(date).iYear());
            const hijriMonth = isAr ? toArabicDigits(moment(date).iMonth() + 1) : String(moment(date).iMonth() + 1);

            const rawGregorianDateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
            
            const timings = {
                Fajr: formatTime(prayerTimes.fajr),
                Dhuhr: formatTime(prayerTimes.dhuhr),
                Asr: formatTime(prayerTimes.asr),
                Maghrib: formatTime(prayerTimes.maghrib),
                Isha: formatTime(ishaTime),
            };

            data.push({
                hijriDay,
                gregorianDay,
                rawGregorianDateStr,
                gregorianDateStr: `${gregorianYear}/${gregorianMonth}/${gregorianDay}`,
                hijriDateStr: `${hijriYear}/${hijriMonth}/${hijriDay}`,
                dayName,
                timings
            });
        }
        return data;
    }, [viewDate, calendarType, config.location, language]);

    // Scroll to today's row when the component mounts or viewDate changes
    useEffect(() => {
        if (todayRowRef.current) {
            setTimeout(() => {
                todayRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [monthData]);

    const handlePrevMonth = () => {
        if (calendarType === 'hijri') {
            setViewDate(prev => prev.clone().subtract(1, 'iMonth'));
        } else {
            setViewDate(prev => prev.clone().subtract(1, 'month'));
        }
    };

    const handleNextMonth = () => {
        if (calendarType === 'hijri') {
            setViewDate(prev => prev.clone().add(1, 'iMonth'));
        } else {
            setViewDate(prev => prev.clone().add(1, 'month'));
        }
    };

    const monthNameDisplay = useMemo(() => {
        const isAr = language === 'ar';
        if (calendarType === 'hijri') {
            const mIdx = viewDate.iMonth();
            const yearVal = viewDate.iYear();
            const yearStr = isAr ? toArabicDigits(yearVal) : String(yearVal);
            if (!isAr) {
                const name = HIJRI_MONTHS_EN[mIdx] || '';
                return `${name} ${yearStr} AH`;
            } else {
                const name = HIJRI_MONTHS_AR[mIdx] || '';
                return `${name} ${yearStr} هـ`;
            }
        } else {
            const mIdx = viewDate.month();
            const yearVal = viewDate.year();
            const yearStr = isAr ? toArabicDigits(yearVal) : String(yearVal);
            if (!isAr) {
                const name = GREGORIAN_MONTHS_EN[mIdx] || '';
                return `${name} ${yearStr} AD`;
            } else {
                const name = GREGORIAN_MONTHS_AR[mIdx] || '';
                return `${name} ${yearStr} م`;
            }
        }
    }, [viewDate, calendarType, language]);

    const generateImage = async () => {
        if (!pdfTableRef.current) return null;
        const canvas = await safeHtml2Canvas(pdfTableRef.current, {
            scale: 2.5,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: 800
        });
        return {
            canvas,
            dataUrl: canvas.toDataURL('image/jpeg', 0.95)
        };
    };

    const handleShare = async () => {
        setIsSharing(true);
        const heading = tPrayer('monthlyShareHeading', language, { m: monthNameDisplay });
        const rawLoc = language === 'en'
            ? (config.location?.cityGovEn || config.location?.cityGov)
            : (config.location?.cityGovAr || config.location?.cityGov);
        const loc = tPrayer('locationLabel', language, { loc: getLocalizedLocationName(rawLoc, language) });
        const by = tPrayer('generatedByLabel', language, { app: tPrayer('createdAppAttribution', language) });
        const text = `${heading}\n${loc}\n${by}`;

        try {
            const result = await generateImage();
            if (!result) return;
            
            const fileName = `prayer_times_${Date.now()}.jpg`;

            if (Capacitor.isNativePlatform()) {
                const base64Data = result.dataUrl.split(',')[1];
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });
                
                await CapacitorShare.share({
                    title: `${tPrayer('monthlyPrayerTitle', language)} - ${monthNameDisplay}`,
                    text: text,
                    url: savedFile.uri,
                    dialogTitle: tPrayer('shareMonthlyTimes', language),
                });
            } else if (navigator.share) {
                try {
                    const blob = await (await fetch(result.dataUrl)).blob();
                    const file = new File([blob], fileName, { type: 'image/jpeg' });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: `${tPrayer('monthlyPrayerTitle', language)} - ${monthNameDisplay}`,
                            text: text,
                            files: [file]
                        });
                    } else {
                        await navigator.share({
                            title: `${tPrayer('monthlyPrayerTitle', language)} - ${monthNameDisplay}`,
                            text: text,
                        });
                    }
                } catch (e: any) {
                    if (e.name !== 'AbortError') {
                        await navigator.share({ title: tPrayer('monthlyPrayerTitle', language), text: text }).catch(() => {});
                    }
                }
            } else {
                alert(tPrayer('shareNotSupported', language));
            }
        } catch (err) {
            console.error("Share failed:", err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const result = await generateImage();
            if (!result) return;
            const { canvas, dataUrl } = result;
            
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'l' : 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(dataUrl, 'JPEG', 0, 0, canvas.width, canvas.height);
            
            const fileName = `prayer_times_${calendarType === 'hijri' ? viewDate.iYear() : viewDate.year()}_${(calendarType === 'hijri' ? viewDate.iMonth() : viewDate.month()) + 1}.pdf`;

            if (Capacitor.isNativePlatform()) {
                const pdfBase64 = pdf.output('datauristring').split(',')[1];
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: pdfBase64,
                    directory: Directory.Cache
                });
                await CapacitorShare.share({
                    title: tPrayer('monthlyPrayerTitle', language),
                    text: tPrayer('monthlyShareHeading', language, { m: monthNameDisplay }),
                    url: savedFile.uri,
                    dialogTitle: tPrayer('sharePdfTitle', language)
                });
            } else {
                pdf.save(fileName);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(tPrayer('pdfError', language));
        } finally {
            setIsExporting(false);
        }
    };

    const getOffset = (key: string) => (config.prayerOffsets[key] || 0) + (config.isSummerTime ? 60 : 0);

    return (
        <div 
            dir={dir}
            className="h-[100dvh] w-screen flex flex-col overflow-hidden" 
            style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : theme.bgColor, color: isDefaultTheme ? '#000000' : theme.textColor }}
        >
            {/* Top Bar */}
            <header className="app-top-bar" dir={dir}>
                <div className="app-top-bar__inner">
                    <div className="flex items-center justify-between w-full min-h-[44px] px-1 sm:px-2">
                        {/* Start buttons: Back + PDF */}
                        <div className="flex items-center gap-1 shrink-0 z-10">
                            <button
                                onClick={onBack}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tPrayer('back', language)}
                                aria-label={tPrayer('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-lg sm:text-xl`}></i>
                            </button>
                            <button 
                                id="btn-monthly-pdf"
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ 
                                    color: topBarTextColor,
                                    backgroundColor: 'transparent'
                                }}
                                title={tPrayer('exportPdf', language)}
                                aria-label={tPrayer('exportPdf', language)}
                            >
                                <FileText size={17} className={isExporting ? 'animate-pulse' : ''} />
                            </button>
                        </div>

                        {/* Center Title */}
                        <div className="text-center px-2 min-w-0 flex-1">
                            <h1 className="app-top-bar__title text-base sm:text-lg font-cairo truncate">
                                {tPrayer('monthlyPrayerTitle', language)}
                            </h1>
                        </div>

                        {/* End buttons: Share + ThemeLock + Home */}
                        <div className="flex items-center gap-1 shrink-0 z-10">
                            <button 
                                id="btn-monthly-share"
                                onClick={handleShare}
                                disabled={isSharing}
                                className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ 
                                    color: topBarTextColor,
                                    backgroundColor: 'transparent'
                                }}
                                title={tPrayer('shareMonthlyTimes', language)}
                                aria-label={tPrayer('shareMonthlyTimes', language)}
                            >
                                <Share2 size={15} />
                                <span className="hidden xs:inline">{isSharing ? '...' : tPrayer('share', language)}</span>
                            </button>
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tPrayer('home', language)}
                                aria-label={tPrayer('home', language)}
                            >
                                <i className="fa-solid fa-house text-lg sm:text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-2.5 shrink-0" dir={dir}>
                <button 
                    id="btn-monthly-prev"
                    onClick={handlePrevMonth} 
                    className={`app-page-card border-0 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                    title={language === 'en' ? 'Previous Month' : 'الشهر السابق'}
                >
                    {isRTL ? <ChevronRight size={22} color={primaryColor} /> : <ChevronLeft size={22} color={primaryColor} />}
                </button>
                <div className="flex flex-col items-center gap-1.5">
                    <button 
                        id="btn-monthly-picker"
                        onClick={() => {
                            setOpenPickerMenu(null);
                            setIsPickerOpen(true);
                        }}
                        className={`app-page-card unified-3d-btn border-0 text-sm sm:text-base font-bold flex items-center gap-2 px-4 py-1.5 rounded-2xl transition-all cursor-pointer ${s3d.surfaceCardClass}`} 
                        style={{ color: primaryColor }}
                    >
                        <span>{monthNameDisplay}</span>
                        <Calendar size={16} />
                    </button>
                    <div id="btn-monthly-calendar-toggle" className={`app-page-card border-0 flex p-1 rounded-2xl gap-1 overflow-visible ${s3d.surfaceCardClass}`}>
                        <button 
                            onClick={() => setCalendarType('hijri')}
                            className={`app-page-card border-0 px-3.5 py-1 text-[11px] rounded-xl font-bold transition-all cursor-pointer ${
                                calendarType === 'hijri' ? '' : s3d.surfaceCardClass
                            }`}
                            style={calendarType === 'hijri' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                        >
                            {tPrayer('hijri', language)}
                        </button>
                        <button 
                            onClick={() => setCalendarType('gregorian')}
                            className={`app-page-card border-0 px-3.5 py-1 text-[11px] rounded-xl font-bold transition-all cursor-pointer ${
                                calendarType === 'gregorian' ? '' : s3d.surfaceCardClass
                            }`}
                            style={calendarType === 'gregorian' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                        >
                            {tPrayer('gregorian', language)}
                        </button>
                    </div>
                </div>
                <button 
                    id="btn-monthly-next"
                    onClick={handleNextMonth} 
                    className={`app-page-card border-0 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                    title={language === 'en' ? 'Next Month' : 'الشهر القادم'}
                >
                    {isRTL ? <ChevronLeft size={22} color={primaryColor} /> : <ChevronRight size={22} color={primaryColor} />}
                </button>
            </div>

            {/* Table */}
            <main 
                className="flex-1 min-h-0 flex flex-col overflow-hidden px-3 pt-1 app-scroll-safe" 
                dir={dir}
            >
                <div 
                    id="monthly-table-container"
                    className={`app-page-card border-0 max-w-4xl w-full min-h-0 mx-auto overflow-auto rounded-3xl p-2 sm:p-2.5 ${s3d.surfaceCardClass}`}
                >
                    <table 
                        className="w-full text-center text-[11px] xs:text-xs border-separate" 
                        dir={dir} 
                        style={{ 
                            borderSpacing: '3px 5px',
                        }}
                    >
                        <thead className="z-20">
                            {(() => {
                                const headerBg = isDefaultTheme
                                    ? '#f1f5f9'
                                    : (isBlackAndWhite ? '#27272a' : (isShinyGold ? '#D97706' : s3d.primaryColor));
                                const headerText = isDefaultTheme ? '#0f172a' : '#FFFFFF';
                                const headerShadow = isBlackAndWhite || s3d.isDark
                                    ? '0 3px 0 #09090b, 0 5px 10px rgba(0, 0, 0, 0.5), inset 0 1.5px 1px rgba(255, 255, 255, 0.22)'
                                    : '0 3px 0 rgba(0, 0, 0, 0.16), 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1.5px 1px rgba(255, 255, 255, 0.55)';
                                const thStyle: React.CSSProperties = {
                                    backgroundColor: headerBg,
                                    color: headerText,
                                    fontWeight: 900,
                                    boxShadow: headerShadow,
                                };
                                return (
                                    <tr>
                                        <th className="sticky top-0 px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm z-10 rounded-xl border-0" style={thStyle}>
                                            {tPrayer('dayHeader', language)}
                                        </th>
                                        <th className="sticky top-0 px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm z-10 rounded-xl border-0" style={thStyle}>
                                            {tPrayer('dateHeader', language)}
                                        </th>
                                        <th className="sticky top-0 px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm z-10 rounded-xl border-0" style={thStyle}>
                                            {getPrayerDisplayName('Fajr', language)}
                                        </th>
                                        <th className="sticky top-0 px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm z-10 rounded-xl border-0" style={thStyle}>
                                            {getPrayerDisplayName('Dhuhr', language)}
                                        </th>
                                        <th className="sticky top-0 px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm z-10 rounded-xl border-0" style={thStyle}>
                                            {getPrayerDisplayName('Asr', language)}
                                        </th>
                                        <th className="sticky top-0 px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm z-10 rounded-xl border-0" style={thStyle}>
                                            {getPrayerDisplayName('Maghrib', language)}
                                        </th>
                                        <th className="sticky top-0 px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm z-10 rounded-xl border-0" style={thStyle}>
                                            {getPrayerDisplayName('Isha', language)}
                                        </th>
                                    </tr>
                                );
                            })()}
                        </thead>
                        <tbody>
                            {monthData.map((day, idx) => {
                                const isToday = day.rawGregorianDateStr === `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`;
                                
                                let rowBg = s3d.isDark
                                    ? (isBlackAndWhite ? (idx % 2 === 0 ? '#222226' : '#1b1b1f') : (idx % 2 === 0 ? '#1E293B' : '#172030'))
                                    : (idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
                                let rowTextColor = s3d.isDark ? '#FFFFFF' : '#0F172A';
                                let cellShadow = s3d.isDark
                                    ? '0 2.5px 0 #09090b, 0 4px 8px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.14), inset 0 -1px 2px rgba(0, 0, 0, 0.35)'
                                    : '0 2.5px 0 rgba(15, 23, 42, 0.08), 0 3px 7px rgba(15, 23, 42, 0.06), inset 0 1.5px 1px rgba(255, 255, 255, 0.96), inset 0 -1px 2px rgba(15, 23, 42, 0.04)';

                                if (isToday) {
                                    if (isBlackAndWhite) {
                                        rowBg = '#FFFFFF';
                                        rowTextColor = '#000000';
                                        cellShadow = '0 3px 0 #52525b, 0 6px 12px rgba(255, 255, 255, 0.16), inset 0 1.5px 1px rgba(255, 255, 255, 0.95)';
                                    } else if (isDefaultTheme) {
                                        rowBg = '#0F172A';
                                        rowTextColor = '#FFFFFF';
                                        cellShadow = '0 3px 0 rgba(0, 0, 0, 0.35), 0 6px 12px rgba(15, 23, 42, 0.22), inset 0 1.5px 1px rgba(255, 255, 255, 0.22)';
                                    } else {
                                        rowBg = '#FEF08A';
                                        rowTextColor = '#000000';
                                        cellShadow = '0 3px 0 rgba(180, 83, 9, 0.32), 0 6px 12px rgba(217, 119, 6, 0.18), inset 0 1.5px 1px rgba(255, 255, 255, 0.9)';
                                    }
                                }

                                const cellStyle: React.CSSProperties = {
                                    border: 'none',
                                    backgroundColor: rowBg,
                                    color: rowTextColor,
                                    fontWeight: 800,
                                    boxShadow: cellShadow,
                                };

                                return (
                                    <tr 
                                        key={idx} 
                                        ref={isToday ? todayRowRef : null}
                                        className="font-black" 
                                    >
                                        <td className="px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm rounded-xl border-0" style={cellStyle}>
                                            <span style={{ color: rowTextColor, fontWeight: 800 }}>{day.dayName}</span>
                                        </td>
                                        <td className="px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm whitespace-nowrap rounded-xl border-0" style={cellStyle} dir="ltr">
                                            <span className="font-black" style={{ color: rowTextColor, fontWeight: 800 }}>
                                                {day.hijriDay}
                                            </span>
                                            <span className="mx-0.5 font-black opacity-70" style={{ color: rowTextColor }}>/</span>
                                            <span className="font-black" style={{ color: rowTextColor, fontWeight: 800 }}>
                                                {day.gregorianDay}
                                            </span>
                                        </td>
                                        <td className="px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm whitespace-nowrap rounded-xl border-0" style={cellStyle} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                            <span className="font-black" style={{ color: rowTextColor, fontWeight: 800 }}>
                                                {formatLocalizedTime(applyOffset(day.timings.Fajr, getOffset('Fajr')), language === 'ar')}
                                            </span>
                                        </td>
                                        <td className="px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm whitespace-nowrap rounded-xl border-0" style={cellStyle} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                            <span className="font-black" style={{ color: rowTextColor, fontWeight: 800 }}>
                                                {formatLocalizedTime(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')), language === 'ar')}
                                            </span>
                                        </td>
                                        <td className="px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm whitespace-nowrap rounded-xl border-0" style={cellStyle} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                            <span className="font-black" style={{ color: rowTextColor, fontWeight: 800 }}>
                                                {formatLocalizedTime(applyOffset(day.timings.Asr, getOffset('Asr')), language === 'ar')}
                                            </span>
                                        </td>
                                        <td className="px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm whitespace-nowrap rounded-xl border-0" style={cellStyle} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                            <span className="font-black" style={{ color: rowTextColor, fontWeight: 800 }}>
                                                {formatLocalizedTime(applyOffset(day.timings.Maghrib, getOffset('Maghrib')), language === 'ar')}
                                            </span>
                                        </td>
                                        <td className="px-1.5 py-2 sm:py-2.5 font-black text-xs sm:text-sm whitespace-nowrap rounded-xl border-0" style={cellStyle} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                            <span className="font-black" style={{ color: rowTextColor, fontWeight: 800 }}>
                                                {formatLocalizedTime(applyOffset(day.timings.Isha, getOffset('Isha')), language === 'ar')}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Hidden Table for PDF Export */}
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1000 }}>
                <div ref={pdfTableRef} style={{ width: '800px', padding: '20px', backgroundColor: '#fff', color: '#000', direction: isRTL ? 'rtl' : 'ltr', fontFamily: 'Cairo, sans-serif' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '24px', color: primaryColor, fontWeight: 'bold' }}>
                            {tPrayer('monthlyShareHeading', language, { m: monthNameDisplay })}
                        </h1>
                        <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
                            {tPrayer('locationLabel', language, { 
                                loc: getLocalizedLocationName(
                                    (language === 'en' ? config.location?.cityGovEn : config.location?.cityGovAr) || config.location?.cityGov, 
                                    language
                                ) 
                            })}
                        </p>
                        <p style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>
                            {tPrayer('generatedByLabel', language, { app: tPrayer('createdAppAttribution', language) })}
                        </p>
                    </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px', border: `1.5px solid ${tableBorderColor}` }}>
                    <thead>
                        <tr style={{ backgroundColor: isDefaultTheme ? '#000000' : primaryColor, color: '#fff', fontWeight: 'bold' }}>
                            <th style={{ padding: '10px', border: `1.5px solid ${tableBorderColor}` }}>{tPrayer('dayHeader', language)}</th>
                            <th style={{ padding: '10px', border: `1.5px solid ${tableBorderColor}` }}>{tPrayer('hijriDateHeader', language)}</th>
                            <th style={{ padding: '10px', border: `1.5px solid ${tableBorderColor}` }}>{tPrayer('gregorianDateHeader', language)}</th>
                            <th style={{ padding: '10px', border: `1.5px solid ${tableBorderColor}` }}>{getPrayerDisplayName('Fajr', language)}</th>
                            <th style={{ padding: '10px', border: `1.5px solid ${tableBorderColor}` }}>{getPrayerDisplayName('Dhuhr', language)}</th>
                            <th style={{ padding: '10px', border: `1.5px solid ${tableBorderColor}` }}>{getPrayerDisplayName('Asr', language)}</th>
                            <th style={{ padding: '10px', border: `1.5px solid ${tableBorderColor}` }}>{getPrayerDisplayName('Maghrib', language)}</th>
                            <th style={{ padding: '10px', border: `1.5px solid ${tableBorderColor}` }}>{getPrayerDisplayName('Isha', language)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthData.map((day, idx) => (
                            <tr key={idx} style={{ fontWeight: 'bold', color: '#000000' }}>
                                <td style={{ padding: '8px', border: `1.5px solid ${tableBorderColor}`, fontWeight: 'bold', color: '#000000' }}>{day.dayName}</td>
                                <td style={{ padding: '8px', border: `1.5px solid ${tableBorderColor}`, fontWeight: 'bold', color: '#000000', direction: 'ltr' }}>{day.hijriDateStr}</td>
                                <td style={{ padding: '8px', border: `1.5px solid ${tableBorderColor}`, fontWeight: 'bold', color: '#000000', direction: 'ltr' }}>{day.gregorianDateStr}</td>
                                <td style={{ padding: '8px', border: `1.5px solid ${tableBorderColor}`, fontWeight: 'bold', color: '#000000', direction: language === 'ar' ? 'rtl' : 'ltr' }}>{formatLocalizedTime(applyOffset(day.timings.Fajr, getOffset('Fajr')), language === 'ar')}</td>
                                <td style={{ padding: '8px', border: `1.5px solid ${tableBorderColor}`, fontWeight: 'bold', color: '#000000', direction: language === 'ar' ? 'rtl' : 'ltr' }}>{formatLocalizedTime(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')), language === 'ar')}</td>
                                <td style={{ padding: '8px', border: `1.5px solid ${tableBorderColor}`, fontWeight: 'bold', color: '#000000', direction: language === 'ar' ? 'rtl' : 'ltr' }}>{formatLocalizedTime(applyOffset(day.timings.Asr, getOffset('Asr')), language === 'ar')}</td>
                                <td style={{ padding: '8px', border: `1.5px solid ${tableBorderColor}`, fontWeight: 'bold', color: '#000000', direction: language === 'ar' ? 'rtl' : 'ltr' }}>{formatLocalizedTime(applyOffset(day.timings.Maghrib, getOffset('Maghrib')), language === 'ar')}</td>
                                <td style={{ padding: '8px', border: `1.5px solid ${tableBorderColor}`, fontWeight: 'bold', color: '#000000', direction: language === 'ar' ? 'rtl' : 'ltr' }}>{formatLocalizedTime(applyOffset(day.timings.Isha, getOffset('Isha')), language === 'ar')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Month/Year Picker Modal */}
            {isPickerOpen && (
                <div
                    className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 settings-3d-adia-scope ${s3d.isDark ? 'settings-3d-dark' : ''}`}
                    onClick={() => {
                        setOpenPickerMenu(null);
                        setIsPickerOpen(false);
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`app-page-card border-0 w-full max-w-sm rounded-3xl overflow-hidden ${s3d.surfaceCardClass}`}
                        dir={dir}
                    >
                        <div className="p-5 sm:p-6 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg sm:text-xl font-black font-kufi" style={{ color: s3d.noticeAccent }}>
                                    {tPrayer('selectMonthYear', language)}
                                </h3>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setOpenPickerMenu(null);
                                        setIsPickerOpen(false);
                                    }} 
                                    className={`app-page-card unified-3d-btn border-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${s3d.innerCardClass}`}
                                    title={tPrayer('close', language)}
                                    aria-label={tPrayer('close', language)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {(() => {
                                const monthsList = calendarType === 'hijri'
                                    ? (language === 'en' ? HIJRI_MONTHS_EN : HIJRI_MONTHS_AR)
                                    : (language === 'en' ? GREGORIAN_MONTHS_EN : GREGORIAN_MONTHS_AR);
                                const selectedMonth = calendarType === 'hijri' ? viewDate.iMonth() : viewDate.month();
                                const selectedYear = calendarType === 'hijri' ? viewDate.iYear() : viewDate.year();
                                const baseYear = calendarType === 'hijri' ? moment().iYear() : moment().year();
                                const yearsList = Array.from({ length: 20 }, (_, i) => baseYear - 10 + i);

                                return (
                                    <div className="flex flex-col gap-3">
                                        <div className="grid grid-cols-2 gap-3.5">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs opacity-70 font-bold">{tPrayer('month', language)}</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenPickerMenu(prev => prev === 'month' ? null : 'month')}
                                                    className={`${s3d.recessedInputClass} app-3d-recessed-field border-0 px-3 py-3 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer font-bold text-xs sm:text-sm ${
                                                        openPickerMenu === 'month' ? 'ring-2' : ''
                                                    }`}
                                                    style={openPickerMenu === 'month' ? ({ '--tw-ring-color': s3d.primaryColor } as React.CSSProperties) : undefined}
                                                >
                                                    <span className="truncate">{monthsList[selectedMonth]}</span>
                                                    <ChevronDown
                                                        size={16}
                                                        className={`shrink-0 transition-transform duration-200 ${openPickerMenu === 'month' ? 'rotate-180' : ''}`}
                                                        style={{ color: s3d.noticeAccent }}
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs opacity-70 font-bold">{tPrayer('year', language)}</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenPickerMenu(prev => prev === 'year' ? null : 'year')}
                                                    className={`${s3d.recessedInputClass} app-3d-recessed-field border-0 px-3 py-3 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer font-bold font-mono text-xs sm:text-sm ${
                                                        openPickerMenu === 'year' ? 'ring-2' : ''
                                                    }`}
                                                    style={openPickerMenu === 'year' ? ({ '--tw-ring-color': s3d.primaryColor } as React.CSSProperties) : undefined}
                                                >
                                                    <span>{language === 'ar' ? toArabicDigits(selectedYear) : selectedYear}</span>
                                                    <ChevronDown
                                                        size={16}
                                                        className={`shrink-0 transition-transform duration-200 ${openPickerMenu === 'year' ? 'rotate-180' : ''}`}
                                                        style={{ color: s3d.noticeAccent }}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {openPickerMenu === 'month' && (
                                            <div className={`app-3d-recessed-field border-0 rounded-2xl p-2 grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto ${s3d.recessedInputClass}`}>
                                                {monthsList.map((m, i) => {
                                                    const isSelected = selectedMonth === i;
                                                    return (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => {
                                                                if (calendarType === 'hijri') {
                                                                    setViewDate(prev => prev.clone().iMonth(i));
                                                                } else {
                                                                    setViewDate(prev => prev.clone().month(i));
                                                                }
                                                                setOpenPickerMenu(null);
                                                            }}
                                                            className={`app-page-card unified-3d-btn border-0 px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-1 cursor-pointer transition-all ${
                                                                isSelected ? '' : s3d.innerCardClass
                                                            }`}
                                                            style={isSelected ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                                                        >
                                                            <span className="truncate">{m}</span>
                                                            {isSelected && <Check size={13} className="shrink-0" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {openPickerMenu === 'year' && (
                                            <div className={`app-3d-recessed-field border-0 rounded-2xl p-2 grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto ${s3d.recessedInputClass}`}>
                                                {yearsList.map((year) => {
                                                    const isSelected = selectedYear === year;
                                                    return (
                                                        <button
                                                            key={year}
                                                            type="button"
                                                            onClick={() => {
                                                                if (calendarType === 'hijri') {
                                                                    setViewDate(prev => prev.clone().iYear(year));
                                                                } else {
                                                                    setViewDate(prev => prev.clone().year(year));
                                                                }
                                                                setOpenPickerMenu(null);
                                                            }}
                                                            className={`app-page-card unified-3d-btn border-0 px-2 py-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                                                isSelected ? '' : s3d.innerCardClass
                                                            }`}
                                                            style={isSelected ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                                                        >
                                                            <span>{language === 'ar' ? toArabicDigits(year) : year}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="pb-1 overflow-visible">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setOpenPickerMenu(null);
                                        setIsPickerOpen(false);
                                    }} 
                                    className="app-page-card unified-3d-btn border-0 w-full py-3.5 rounded-2xl font-extrabold transition-all cursor-pointer"
                                    style={s3d.primary3DStyle}
                                >
                                    {tPrayer('done', language)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CommunitySpotlightGuide
                guideKey="monthly_prayer_times_spotlight"
                steps={MONTHLY_PRAYER_TIMES_STEPS}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={language === 'en'}
            />
        </div>
    );
}
