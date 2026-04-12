import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import moment from 'moment-hijri';
import { formatTime12_clean, applyOffset } from '../utils/prayerTimesUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Share, ArrowRight, Download, ChevronRight, ChevronLeft, Calendar, X } from 'lucide-react';
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

export default function MonthlyPrayerTimes({ onBack }: { onBack: () => void }) {
    const { theme, themeKey } = useTheme();
    const { config } = usePrayerTimes();
    const [viewDate, setViewDate] = useState(moment());
    const [calendarType, setCalendarType] = useState<'hijri' | 'gregorian'>('hijri');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const pdfTableRef = useRef<HTMLDivElement>(null);
    const todayRowRef = useRef<HTMLTableRowElement>(null);

    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];
    const secondaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[1];
    const topBarTextColor = theme.topBarText || (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]);

    useEffect(() => {
        const interceptor = () => {
            if (isPickerOpen) {
                setIsPickerOpen(false);
                return true;
            }
            onBack();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isPickerOpen, onBack]);

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
        const canvas = await html2canvas(pdfTableRef.current, {
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
                } catch (e) {
                    await navigator.share({ title: `مواقيت الصلاة`, text: text });
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
        <div className="h-screen w-screen flex flex-col" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
            {/* Top Bar */}
            <div className="app-top-bar">
                <div className="app-top-bar__inner relative flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="app-top-bar__title text-xl" style={{ color: topBarTextColor }}>
                            مواقيت الشهر
                        </h1>
                        <p className="app-top-bar__subtitle" style={{ color: topBarTextColor }}>
                            {config.location.cityGov}
                        </p>
                    </div>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-3 themed-bg-alt border-b" style={{ borderColor: 'var(--card-border)' }}>
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <ChevronRight size={24} color={primaryColor} />
                </button>
                <div className="flex flex-col items-center gap-1">
                    <button 
                        onClick={() => setIsPickerOpen(true)}
                        className="text-lg font-bold flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
                        style={{ color: primaryColor }}
                    >
                        {monthNameDisplay}
                        <Calendar size={16} />
                    </button>
                    <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg">
                        <button 
                            onClick={() => setCalendarType('hijri')}
                            className={`px-3 py-0.5 text-[10px] rounded-md transition-all ${calendarType === 'hijri' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'opacity-50'}`}
                            style={{ color: calendarType === 'hijri' ? primaryColor : undefined }}
                        >
                            هجري
                        </button>
                        <button 
                            onClick={() => setCalendarType('gregorian')}
                            className={`px-3 py-0.5 text-[10px] rounded-md transition-all ${calendarType === 'gregorian' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'opacity-50'}`}
                            style={{ color: calendarType === 'gregorian' ? primaryColor : undefined }}
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
            <main className="flex-1 overflow-y-auto p-2 pb-24">
                <div className="max-w-4xl mx-auto overflow-x-auto rounded-xl border shadow-sm" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                    <table className="w-full text-center text-[11px] xs:text-xs" dir="rtl">
                        <thead style={{ backgroundColor: primaryColor, color: isBlackAndWhite ? '#000' : '#fff' }}>
                            <tr>
                                <th className="px-1 py-2 border-b border-l border-white/20">اليوم</th>
                                <th className="px-1 py-2 border-b border-l border-white/20">م/هـ</th>
                                <th className="px-1 py-2 border-b border-l border-white/20">الفجر</th>
                                <th className="px-1 py-2 border-b border-l border-white/20">الظهر</th>
                                <th className="px-1 py-2 border-b border-l border-white/20">العصر</th>
                                <th className="px-1 py-2 border-b border-l border-white/20">المغرب</th>
                                <th className="px-1 py-2 border-b border-white/20">العشاء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthData.map((day, idx) => {
                                const isToday = day.gregorianDateStr === `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`;
                                const textColor = isToday ? primaryColor : 'inherit';
                                return (
                                    <tr 
                                        key={idx} 
                                        ref={isToday ? todayRowRef : null}
                                        className={`border-b last:border-0 transition-colors ${isToday ? 'bg-primary/10 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} 
                                        style={{ borderColor: 'var(--card-border)', color: textColor }}
                                    >
                                        <td className="px-1 py-2 border-l" style={{ borderColor: 'var(--card-border)' }}>{day.dayName}</td>
                                        <td className="px-1 py-2 border-l font-mono text-[9px] xs:text-[10px]" style={{ borderColor: 'var(--card-border)' }} dir="ltr">
                                            <span style={{ color: isToday ? primaryColor : primaryColor }}>{day.hijriDay}</span>
                                            <span className="mx-0.5 opacity-50">/</span>
                                            <span className="opacity-70">{day.gregorianDay}</span>
                                        </td>
                                        <td className="px-1 py-2 border-l font-mono" style={{ borderColor: 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Fajr, getOffset('Fajr')))}</td>
                                        <td className="px-1 py-2 border-l font-mono" style={{ borderColor: 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')))}</td>
                                        <td className="px-1 py-2 border-l font-mono" style={{ borderColor: 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Asr, getOffset('Asr')))}</td>
                                        <td className="px-1 py-2 border-l font-mono" style={{ borderColor: 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Maghrib, getOffset('Maghrib')))}</td>
                                        <td className="px-1 py-2 font-mono">{formatTime12_clean(applyOffset(day.timings.Isha, getOffset('Isha')))}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            <nav className="app-bottom-bar">
                <div className="app-bottom-bar__inner !justify-between gap-3">
                    <button 
                        onClick={handleShare}
                        disabled={isSharing}
                        className="bar-button btn-3d-effect !flex-1 !py-2.5 !px-2 !text-sm !rounded-xl shadow-lg"
                        style={{ background: primaryColor, color: 'white', fontFamily: theme.font, border: theme.btnBorder || 'none' }}
                    >
                        <Share size={18} />
                        <span className="hidden xs:inline">{isSharing ? '...' : 'مشاركة'}</span>
                    </button>

                    <button 
                        onClick={onBack} 
                        className="bar-button btn-3d-effect !flex-[2] max-w-[160px] py-2.5 px-4 rounded-xl shadow-lg"
                        style={{ background: '#8B5CF6', color: 'white', fontFamily: theme.font, border: theme.btnBorder || 'none' }}
                    >
                        <span className="text-xl">🏠</span>
                        <span className="hidden sm:inline">الرئيسية</span>
                    </button>

                    <button 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="bar-button btn-3d-effect !flex-1 !py-2.5 !px-2 !text-sm !rounded-xl shadow-lg"
                        style={{ background: primaryColor, color: 'white', fontFamily: theme.font, border: theme.btnBorder || 'none' }}
                    >
                        <Download size={18} />
                        <span className="hidden xs:inline">{isExporting ? '...' : 'PDF'}</span>
                    </button>
                </div>
            </nav>

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
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>اليوم</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>التاريخ الهجري</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>التاريخ الميلادي</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>الفجر</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>الظهر</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>العصر</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>المغرب</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>العشاء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthData.map((day, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{day.dayName}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{day.hijriDateStr}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{day.gregorianDateStr}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Fajr, getOffset('Fajr')))}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')))}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Asr, getOffset('Asr')))}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Maghrib, getOffset('Maghrib')))}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Isha, getOffset('Isha')))}</td>
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

