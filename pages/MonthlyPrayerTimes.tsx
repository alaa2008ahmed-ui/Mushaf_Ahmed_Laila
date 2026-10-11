import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import moment from 'moment-hijri';
import { formatTime12_clean, applyOffset } from '../utils/prayerTimesUtils';
import jsPDF from 'jspdf';
import { safeHtml2Canvas } from '../utils/canvasHelper';
import { Share2, ArrowRight, Download, ChevronRight, ChevronLeft, Calendar, X, FileText } from 'lucide-react';
import { Share as CapacitorShare } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import BottomBar from '../components/BottomBar';
import { registerBackInterceptor } from '../hooks/useBackButton';

const HIJRI_MONTHS = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
    "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

const GREGORIAN_MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const getCalculationParams = (country: string, code: string) => {
    let params = CalculationMethod.MuslimWorldLeague();
    if (code.startsWith('+20') || country.includes('مصر')) {
        params = CalculationMethod.Egyptian();
    } else if (code.startsWith('+966') || country.includes('السعودية')) {
        params = CalculationMethod.UmmAlQura();
    } else if (code.startsWith('+971') || country.includes('الإمارات')) {
        params = CalculationMethod.Dubai();
    } else if (code.startsWith('+965') || country.includes('الكويت')) {
        params = CalculationMethod.Kuwait();
    } else if (code.startsWith('+974') || country.includes('قطر')) {
        params = CalculationMethod.Qatar();
    } else if (code.startsWith('+1') || country.includes('أمريكا') || country.includes('كندا')) {
        params = CalculationMethod.NorthAmerica();
    } else if (code.startsWith('+90') || country.includes('تركيا')) {
        params = CalculationMethod.Turkey();
    } else if (code.startsWith('+92') || country.includes('باكستان')) {
        params = CalculationMethod.Karachi();
    }
    return params;
};

export default function MonthlyPrayerTimes({ onBack, onNavigate }: { onBack: () => void, onNavigate: (id: string) => void }) {
    const { theme, themeKey } = useTheme();
    const { config } = usePrayerTimes();
    const [viewDate, setViewDate] = useState(moment());
    const [calendarType, setCalendarType] = useState<'hijri' | 'gregorian'>('hijri');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const pdfTableRef = useRef<HTMLDivElement>(null);
    const todayRowRef = useRef<HTMLTableRowElement>(null);

    const isDefaultTheme = themeKey === 'default';
    const isBlackAndWhite = themeKey === 'deep_black';
    const primaryColor = isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]);
    const secondaryColor = isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[1]);
    const topBarTextColor = isDefaultTheme ? '#000000' : (theme.topBarText || (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));

    const btnBorderParts = useMemo(() => {
        if (!theme.btnBorder || theme.btnBorder === 'none') {
            return { borderWidth: 0, borderStyle: 'none' as const, borderColor: 'transparent' };
        }
        const parts = theme.btnBorder.split(' ');
        return {
            borderWidth: parts[0] || '1px',
            borderStyle: (parts[1] || 'solid') as any,
            borderColor: parts[2] || primaryColor
        };
    }, [theme.btnBorder, primaryColor]);

    useEffect(() => {
        const interceptor = () => {
            if (isPickerOpen) {
                setIsPickerOpen(false);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isPickerOpen]);

    const monthData = useMemo(() => {
        const data = [];
        const coordinates = new Coordinates(config.location.lat, config.location.lng);
        const params = getCalculationParams(config.location.fullCountry, config.location.combinedCode);

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
            
            const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);
            
            const formatTime = (d: Date) => {
                return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            };

            // Ramadan Isha Adjustment for specific countries (Saudi Arabia, Qatar)
            // In Ramadan, Isha is delayed by 30 minutes (90 min -> 120 min after Maghrib)
            const isRamadan = moment(date).iMonth() === 8;
            const country = config.location.fullCountry || '';
            const code = config.location.combinedCode || '';
            
            let ishaTime = prayerTimes.isha;
            if (isRamadan && (code.startsWith('+966') || country.includes('السعودية') || code.startsWith('+974') || country.includes('قطر'))) {
                const maghribMs = prayerTimes.maghrib.getTime();
                const ishaMs = prayerTimes.isha.getTime();
                const diffMinutes = (ishaMs - maghribMs) / 60000;
                
                // If the library returned the standard 90-minute offset, add the extra 30 minutes for Ramadan
                if (diffMinutes < 110) {
                    ishaTime = new Date(ishaMs + 30 * 60000);
                }
            }

            const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(date);
            const gregorianDay = date.getDate();
            const hijriDay = moment(date).iDate();
            
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
                gregorianDateStr: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
                hijriDateStr: `${moment(date).iYear()}/${moment(date).iMonth() + 1}/${hijriDay}`,
                dayName,
                timings
            });
        }
        return data;
    }, [viewDate, calendarType, config.location]);

    // Scroll to today's row when the component mounts or viewDate changes
    useEffect(() => {
        if (todayRowRef.current) {
            // Add a small delay to ensure rendering is complete
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
        if (calendarType === 'hijri') {
            const name = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { month: 'long' }).format(viewDate.toDate());
            return `${name} ${viewDate.iYear()} هـ`;
        } else {
            const name = new Intl.DateTimeFormat('ar-SA', { month: 'long' }).format(viewDate.toDate());
            return `${name} ${viewDate.year()} م`;
        }
    }, [viewDate, calendarType]);

    const generateImage = async () => {
        if (!pdfTableRef.current) return null;
        const canvas = await safeHtml2Canvas(pdfTableRef.current, {
            scale: 2.5, // Increased scale for better print quality and clarity
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: 800
        });
        return {
            canvas,
            dataUrl: canvas.toDataURL('image/jpeg', 0.95) // High quality JPEG
        };
    };

    const handleShare = async () => {
        setIsSharing(true);
        const text = `مواقيت الصلاة لشهر ${monthNameDisplay}\nالموقع: ${config.location.cityGov}\nتم الإنشاء بواسطة: مصحف احمد وليلى`;
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
                    title: `مواقيت الصلاة - ${monthNameDisplay}`,
                    text: text,
                    url: savedFile.uri,
                    dialogTitle: 'مشاركة مواقيت الصلاة',
                });
            } else if (navigator.share) {
                try {
                    const blob = await (await fetch(result.dataUrl)).blob();
                    const file = new File([blob], fileName, { type: 'image/jpeg' });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: `مواقيت الصلاة - ${monthNameDisplay}`,
                            text: text,
                            files: [file]
                        });
                    } else {
                        await navigator.share({
                            title: `مواقيت الصلاة - ${monthNameDisplay}`,
                            text: text,
                        });
                    }
                } catch (e: any) {
                    if (e.name !== 'AbortError') {
                        await navigator.share({ title: `مواقيت الصلاة`, text: text }).catch(() => {});
                    }
                }
            } else {
                alert("المشاركة غير مدعومة في هذا المتصفح");
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
                    title: 'مواقيت الصلاة',
                    text: `مواقيت الصلاة لشهر ${monthNameDisplay}`,
                    url: savedFile.uri,
                    dialogTitle: 'مشاركة أو حفظ ملف PDF'
                });
            } else {
                pdf.save(fileName);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("حدث خطأ أثناء إنشاء ملف PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const getOffset = (key: string) => (config.prayerOffsets[key] || 0) + (config.isSummerTime ? 60 : 0);

    return (
        <div className="h-screen w-screen flex flex-col" style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : theme.bgColor, color: isDefaultTheme ? '#000000' : theme.textColor }}>
            {/* Top Bar */}
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            مواقيت الشهر
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle font-bold">
                        {config.location.cityGov}
                    </p>
                </div>
            </header>

            {/* Month Navigation */}
            <div className={`flex items-center justify-between px-4 py-1.5 ${isDefaultTheme ? 'bg-white' : 'themed-bg-alt'} border-b`} style={{ borderColor: isDefaultTheme ? '#f3f4f6' : 'var(--card-border)' }}>
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <ChevronRight size={24} color={primaryColor} />
                </button>
                <div className="flex flex-col items-center gap-0.5">
                    <button 
                        onClick={() => setIsPickerOpen(true)}
                        className="text-lg font-bold flex items-center gap-2 px-3 py-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
                        style={{ color: primaryColor }}
                    >
                        {monthNameDisplay}
                        <Calendar size={16} />
                    </button>
                    <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg">
                        <button 
                            onClick={() => setCalendarType('hijri')}
                            className={`px-3 py-0.5 text-[10px] rounded-md transition-all ${calendarType === 'hijri' ? 'themed-card shadow-sm' : 'opacity-50'}`}
                            style={{ color: calendarType === 'hijri' ? (isBlackAndWhite ? '#8B5CF6' : primaryColor) : (isBlackAndWhite ? '#fff' : undefined) }}
                        >
                            هجري
                        </button>
                        <button 
                            onClick={() => setCalendarType('gregorian')}
                            className={`px-3 py-0.5 text-[10px] rounded-md transition-all ${calendarType === 'gregorian' ? 'themed-card shadow-sm' : 'opacity-50'}`}
                            style={{ color: calendarType === 'gregorian' ? (isBlackAndWhite ? '#8B5CF6' : primaryColor) : (isBlackAndWhite ? '#fff' : undefined) }}
                        >
                            ميلادي
                        </button>
                    </div>
                </div>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <ChevronLeft size={24} color={primaryColor} />
                </button>
            </div>

            {/* Table */}
            <main className="flex-1 flex flex-col overflow-hidden p-2">
                <div className="max-w-4xl w-full mx-auto overflow-auto rounded-xl border shadow-sm" style={{ borderColor: isDefaultTheme ? '#e5e7eb' : 'var(--card-border)', backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--card-bg)' }}>
                    <table className="w-full text-center text-[11px] xs:text-xs border-collapse" dir="rtl">
                        <thead className="z-20" style={{ color: isDefaultTheme ? '#000000' : '#fff' }}>
                            <tr className={`divide-x ${isDefaultTheme ? 'divide-gray-200' : 'divide-white/20'} divide-x-reverse`}>
                                <th className={`sticky top-0 px-1 py-2 border-b ${isDefaultTheme ? 'border-gray-200' : 'border-white/20'} z-10`} style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (isBlackAndWhite ? '#222' : primaryColor) }}>اليوم</th>
                                <th className={`sticky top-0 px-1 py-2 border-b ${isDefaultTheme ? 'border-gray-200' : 'border-white/20'} z-10`} style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (isBlackAndWhite ? '#222' : primaryColor) }}>م/هـ</th>
                                <th className={`sticky top-0 px-1 py-2 border-b ${isDefaultTheme ? 'border-gray-200' : 'border-white/20'} z-10`} style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (isBlackAndWhite ? '#222' : primaryColor) }}>الفجر</th>
                                <th className={`sticky top-0 px-1 py-2 border-b ${isDefaultTheme ? 'border-gray-200' : 'border-white/20'} z-10`} style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (isBlackAndWhite ? '#222' : primaryColor) }}>الظهر</th>
                                <th className={`sticky top-0 px-1 py-2 border-b ${isDefaultTheme ? 'border-gray-200' : 'border-white/20'} z-10`} style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (isBlackAndWhite ? '#222' : primaryColor) }}>العصر</th>
                                <th className={`sticky top-0 px-1 py-2 border-b ${isDefaultTheme ? 'border-gray-200' : 'border-white/20'} z-10`} style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (isBlackAndWhite ? '#222' : primaryColor) }}>المغرب</th>
                                <th className={`sticky top-0 px-1 py-2 border-b ${isDefaultTheme ? 'border-gray-200' : 'border-white/20'} z-10`} style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (isBlackAndWhite ? '#222' : primaryColor) }}>العشاء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthData.map((day, idx) => {
                                const isToday = day.gregorianDateStr === `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`;
                                const textColor = isToday ? (isDefaultTheme ? '#FFFFFF' : primaryColor) : 'inherit';
                                return (
                                    <tr 
                                        key={idx} 
                                        ref={isToday ? todayRowRef : null}
                                        className={`border-b last:border-0 transition-colors ${isToday ? (isDefaultTheme ? 'font-bold' : 'bg-primary/10 font-bold') : 'hover:bg-black/5 dark:hover:bg-white/5'}`} 
                                        style={{ 
                                            borderColor: isDefaultTheme ? '#f3f4f6' : 'var(--card-border)', 
                                            backgroundColor: isToday && isDefaultTheme ? '#000000' : undefined,
                                            color: isToday && isDefaultTheme ? '#FFFFFF' : textColor 
                                        }}
                                    >
                                        <td className="px-1 py-2 border-l" style={{ borderColor: isDefaultTheme ? '#f3f4f6' : 'var(--card-border)' }}>{day.dayName}</td>
                                        <td className="px-1 py-2 border-l font-mono text-[9px] xs:text-[10px]" style={{ borderColor: isDefaultTheme ? '#f3f4f6' : 'var(--card-border)' }} dir="ltr">
                                            <span style={{ color: isToday ? (isDefaultTheme ? '#FFFFFF' : primaryColor) : (isDefaultTheme ? '#000000' : primaryColor) }}>{day.hijriDay}</span>
                                            <span className="mx-0.5 opacity-50">/</span>
                                            <span className="opacity-70">{day.gregorianDay}</span>
                                        </td>
                                        <td className="px-1 py-2 border-l font-mono" style={{ borderColor: isDefaultTheme ? '#f3f4f6' : 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Fajr, getOffset('Fajr')))}</td>
                                        <td className="px-1 py-2 border-l font-mono" style={{ borderColor: isDefaultTheme ? '#f3f4f6' : 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')))}</td>
                                        <td className="px-1 py-2 border-l font-mono" style={{ borderColor: isDefaultTheme ? '#f3f4f6' : 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Asr, getOffset('Asr')))}</td>
                                        <td className="px-1 py-2 border-l font-mono" style={{ borderColor: isDefaultTheme ? '#f3f4f6' : 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Maghrib, getOffset('Maghrib')))}</td>
                                        <td className="px-1 py-2 font-mono">{formatTime12_clean(applyOffset(day.timings.Isha, getOffset('Isha')))}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="h-24 w-full shrink-0"></div>
                </div>
            </main>

            <BottomBar 
                onHomeClick={onBack} 
                onThemesClick={() => {}} 
                showThemes={false} 
                leftButton={
                    <button 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="bar-button btn-3d-effect min-w-[44px] h-[44px] flex items-center justify-center gap-2 px-3 rounded-xl shadow-md transition-all active:scale-95"
                        style={{ 
                            background: isDefaultTheme ? '#FFFFFF' : primaryColor, 
                            color: isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#000' : 'white'), 
                            fontFamily: theme.font,
                            borderWidth: isDefaultTheme ? '1px' : btnBorderParts.borderWidth,
                            borderStyle: isDefaultTheme ? 'solid' : btnBorderParts.borderStyle,
                            borderColor: isDefaultTheme ? 'rgba(0,0,0,0.1)' : btnBorderParts.borderColor
                        }}
                    >
                        <span className="font-bold text-sm" style={{ color: isDefaultTheme ? '#000000' : 'inherit' }}>{isExporting ? '...' : 'PDF'}</span>
                    </button>
                }
                rightButton={
                    <button 
                        onClick={handleShare}
                        disabled={isSharing}
                        className="bar-button btn-3d-effect min-w-[44px] h-[44px] flex items-center justify-center gap-2 px-3 rounded-xl shadow-md transition-all active:scale-95"
                        style={{ 
                            background: isDefaultTheme ? '#FFFFFF' : primaryColor, 
                            color: isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#000' : 'white'), 
                            fontFamily: theme.font,
                            borderWidth: isDefaultTheme ? '1px' : btnBorderParts.borderWidth,
                            borderStyle: isDefaultTheme ? 'solid' : btnBorderParts.borderStyle,
                            borderColor: isDefaultTheme ? 'rgba(0,0,0,0.1)' : btnBorderParts.borderColor
                        }}
                    >
                        <Share2 size={18} color={isDefaultTheme ? '#000000' : 'currentColor'} />
                        <span className="hidden xs:inline" style={{ color: isDefaultTheme ? '#000000' : 'inherit' }}>{isSharing ? '...' : 'مشاركة'}</span>
                    </button>
                }
            />

            {/* Hidden Table for PDF Export */}
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1000 }}>
                <div ref={pdfTableRef} style={{ width: '800px', padding: '20px', backgroundColor: '#fff', color: '#000', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '24px', color: primaryColor }}>مواقيت الصلاة لشهر {monthNameDisplay}</h1>
                        <p style={{ fontSize: '16px', color: '#666' }}>الموقع: {config.location.cityGov}</p>
                        <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>تم الإنشاء بواسطة: مصحف احمد وليلى</p>
                    </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: primaryColor, color: '#fff' }}>
                            <th style={{ padding: '10px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }}>اليوم</th>
                            <th style={{ padding: '10px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }}>التاريخ الهجري</th>
                            <th style={{ padding: '10px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }}>التاريخ الميلادي</th>
                            <th style={{ padding: '10px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }}>الفجر</th>
                            <th style={{ padding: '10px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }}>الظهر</th>
                            <th style={{ padding: '10px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }}>العصر</th>
                            <th style={{ padding: '10px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }}>المغرب</th>
                            <th style={{ padding: '10px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }}>العشاء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthData.map((day, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }}>{day.dayName}</td>
                                <td style={{ padding: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd', direction: 'ltr' }}>{day.hijriDateStr}</td>
                                <td style={{ padding: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd', direction: 'ltr' }}>{day.gregorianDateStr}</td>
                                <td style={{ padding: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Fajr, getOffset('Fajr')))}</td>
                                <td style={{ padding: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')))}</td>
                                <td style={{ padding: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Asr, getOffset('Asr')))}</td>
                                <td style={{ padding: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Maghrib, getOffset('Maghrib')))}</td>
                                <td style={{ padding: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Isha, getOffset('Isha')))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Month/Year Picker Modal */}
            {isPickerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
                        <div className="p-6 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold" style={{ color: primaryColor }}>اختيار الشهر والسنة</h3>
                                <button onClick={() => setIsPickerOpen(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs opacity-60 font-bold">الشهر</label>
                                    <select 
                                        value={calendarType === 'hijri' ? viewDate.iMonth() : viewDate.month()}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (calendarType === 'hijri') {
                                                setViewDate(prev => prev.clone().iMonth(val));
                                            } else {
                                                setViewDate(prev => prev.clone().month(val));
                                            }
                                        }}
                                        className="bg-black/5 dark:bg-white/5 p-3 rounded-xl outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: 'var(--card-border)', color: theme.textColor, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                                    >
                                        {(calendarType === 'hijri' ? HIJRI_MONTHS : GREGORIAN_MONTHS).map((m, i) => (
                                            <option key={i} value={i} style={{ backgroundColor: theme.cardBg, color: theme.textColor }}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs opacity-60 font-bold">السنة</label>
                                    <select 
                                        value={calendarType === 'hijri' ? viewDate.iYear() : viewDate.year()}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (calendarType === 'hijri') {
                                                setViewDate(prev => prev.clone().iYear(val));
                                            } else {
                                                setViewDate(prev => prev.clone().year(val));
                                            }
                                        }}
                                        className="bg-black/5 dark:bg-white/5 p-3 rounded-xl outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: 'var(--card-border)', color: theme.textColor, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                                    >
                                        {Array.from({ length: 20 }, (_, i) => {
                                            const baseYear = calendarType === 'hijri' ? moment().iYear() : moment().year();
                                            const year = baseYear - 10 + i;
                                            return <option key={year} value={year} style={{ backgroundColor: theme.cardBg, color: theme.textColor }}>{year}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsPickerOpen(false)}
                                className="w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95"
                                style={{ backgroundColor: primaryColor }}
                            >
                                تم
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

