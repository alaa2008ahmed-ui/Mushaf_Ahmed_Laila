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
    const isBlackAndWhite = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
    const primaryColor = isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]);
    const secondaryColor = isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[1]);
    const topBarTextColor = isDefaultTheme ? '#000000' : (theme.topBarText || (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));
    const tableBorderColor = isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : (theme.palette?.[0] || '#000000'));

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
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* أزرار يمين النص: زر الرجوع للخلف + زر PDF */}
                        <div className="absolute right-0 flex items-center gap-1">
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="رجوع للخلف"
                                aria-label="رجوع للخلف"
                            >
                                <i className="fa-solid fa-arrow-right text-xl"></i>
                            </button>
                            <button 
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer border"
                                style={{ 
                                    borderColor: isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : primaryColor),
                                    color: topBarTextColor,
                                    backgroundColor: 'transparent'
                                }}
                                title="تصدير ملف PDF"
                                aria-label="تصدير ملف PDF"
                            >
                                <FileText size={18} className={isExporting ? 'animate-pulse' : ''} />
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-16 min-w-0">
                            <h1 className="app-top-bar__title text-base sm:text-lg font-kufi truncate">
                                مواقيت الشهر
                            </h1>
                        </div>

                        {/* أزرار يسار النص: زر مشاركة + قفل الثيم + زر الهوم */}
                        <div className="absolute left-0 flex items-center gap-1">
                            <button 
                                onClick={handleShare}
                                disabled={isSharing}
                                className="h-9 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer border"
                                style={{ 
                                    borderColor: isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : primaryColor),
                                    color: topBarTextColor,
                                    backgroundColor: 'transparent'
                                }}
                                title="مشاركة المواقيت"
                                aria-label="مشاركة المواقيت"
                            >
                                <Share2 size={16} />
                                <span className="hidden xs:inline">{isSharing ? '...' : 'مشاركة'}</span>
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="الصفحة الرئيسية"
                                aria-label="الصفحة الرئيسية"
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Month Navigation */}
            <div className={`flex items-center justify-between px-4 py-1.5 ${isDefaultTheme ? 'bg-white' : 'themed-bg-alt'} border-b`} style={{ borderColor: tableBorderColor }}>
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
                    <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border" style={{ borderColor: tableBorderColor }}>
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
                <div 
                    className="max-w-4xl w-full mx-auto overflow-auto rounded-xl shadow-sm" 
                    style={{ 
                        border: `2px solid ${tableBorderColor}`, 
                        borderColor: tableBorderColor,
                        backgroundColor: isDefaultTheme ? '#FFFFFF' : (theme.cardBg || 'var(--card-bg)') 
                    }}
                >
                    <table 
                        className="w-full text-center text-[11px] xs:text-xs border-collapse" 
                        dir="rtl" 
                        style={{ 
                            border: `1.5px solid ${tableBorderColor}`,
                            borderColor: tableBorderColor 
                        }}
                    >
                        <thead className="z-20" style={{ color: isDefaultTheme ? '#000000' : '#fff' }}>
                            <tr style={{ borderBottom: `1.5px solid ${tableBorderColor}` }}>
                                <th className="sticky top-0 px-1 py-2 font-bold z-10" style={{ border: `1.5px solid ${tableBorderColor}`, backgroundColor: isDefaultTheme ? '#f3f4f6' : (isBlackAndWhite ? '#222222' : primaryColor), color: isDefaultTheme ? '#000000' : '#FFFFFF' }}>اليوم</th>
                                <th className="sticky top-0 px-1 py-2 font-bold z-10" style={{ border: `1.5px solid ${tableBorderColor}`, backgroundColor: isDefaultTheme ? '#f3f4f6' : (isBlackAndWhite ? '#222222' : primaryColor), color: isDefaultTheme ? '#000000' : '#FFFFFF' }}>م/هـ</th>
                                <th className="sticky top-0 px-1 py-2 font-bold z-10" style={{ border: `1.5px solid ${tableBorderColor}`, backgroundColor: isDefaultTheme ? '#f3f4f6' : (isBlackAndWhite ? '#222222' : primaryColor), color: isDefaultTheme ? '#000000' : '#FFFFFF' }}>الفجر</th>
                                <th className="sticky top-0 px-1 py-2 font-bold z-10" style={{ border: `1.5px solid ${tableBorderColor}`, backgroundColor: isDefaultTheme ? '#f3f4f6' : (isBlackAndWhite ? '#222222' : primaryColor), color: isDefaultTheme ? '#000000' : '#FFFFFF' }}>الظهر</th>
                                <th className="sticky top-0 px-1 py-2 font-bold z-10" style={{ border: `1.5px solid ${tableBorderColor}`, backgroundColor: isDefaultTheme ? '#f3f4f6' : (isBlackAndWhite ? '#222222' : primaryColor), color: isDefaultTheme ? '#000000' : '#FFFFFF' }}>العصر</th>
                                <th className="sticky top-0 px-1 py-2 font-bold z-10" style={{ border: `1.5px solid ${tableBorderColor}`, backgroundColor: isDefaultTheme ? '#f3f4f6' : (isBlackAndWhite ? '#222222' : primaryColor), color: isDefaultTheme ? '#000000' : '#FFFFFF' }}>المغرب</th>
                                <th className="sticky top-0 px-1 py-2 font-bold z-10" style={{ border: `1.5px solid ${tableBorderColor}`, backgroundColor: isDefaultTheme ? '#f3f4f6' : (isBlackAndWhite ? '#222222' : primaryColor), color: isDefaultTheme ? '#000000' : '#FFFFFF' }}>العشاء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthData.map((day, idx) => {
                                const isToday = day.gregorianDateStr === `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`;
                                
                                let rowBg: string | undefined = undefined;
                                let rowTextColor = isDefaultTheme ? '#000000' : 'inherit';
                                let rowBorderColor = tableBorderColor;

                                if (isToday) {
                                    if (isBlackAndWhite) {
                                        // الثيم الأسود: لون أخضر زمردي إسلامي مميز وزاهي جداً مع نص أبيض ناصع
                                        rowBg = '#059669';
                                        rowTextColor = '#FFFFFF';
                                        rowBorderColor = '#34d399';
                                    } else if (isDefaultTheme) {
                                        // الثيم الافتراضي: خلفية سوداء مع نص أبيض
                                        rowBg = '#000000';
                                        rowTextColor = '#FFFFFF';
                                        rowBorderColor = '#FFFFFF';
                                    } else {
                                        // باقي الثيمات: خلفية ملونة بلون الثيم
                                        rowBg = `${primaryColor}25`;
                                        rowTextColor = primaryColor;
                                        rowBorderColor = primaryColor;
                                    }
                                }

                                const cellStyle = {
                                    border: `1.5px solid ${rowBorderColor}`,
                                    borderColor: rowBorderColor,
                                    borderWidth: '1.5px',
                                    borderStyle: 'solid',
                                    backgroundColor: rowBg
                                };

                                return (
                                    <tr 
                                        key={idx} 
                                        ref={isToday ? todayRowRef : null}
                                        className={`transition-colors ${isToday ? 'font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} 
                                        style={{ 
                                            backgroundColor: rowBg,
                                            color: rowTextColor 
                                        }}
                                    >
                                        <td className="px-1 py-2 font-medium" style={cellStyle}>{day.dayName}</td>
                                        <td className="px-1 py-2 font-mono text-[9px] xs:text-[10px]" style={cellStyle} dir="ltr">
                                            <span className="font-bold" style={{ 
                                                color: isToday 
                                                    ? (isBlackAndWhite ? '#FDE047' : (isDefaultTheme ? '#FFFFFF' : primaryColor)) 
                                                    : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : primaryColor)) 
                                            }}>
                                                {day.hijriDay}
                                            </span>
                                            <span className="mx-0.5 opacity-60">/</span>
                                            <span className="opacity-80">{day.gregorianDay}</span>
                                        </td>
                                        <td className="px-1 py-2 font-mono" style={cellStyle}>{formatTime12_clean(applyOffset(day.timings.Fajr, getOffset('Fajr')))}</td>
                                        <td className="px-1 py-2 font-mono" style={cellStyle}>{formatTime12_clean(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')))}</td>
                                        <td className="px-1 py-2 font-mono" style={cellStyle}>{formatTime12_clean(applyOffset(day.timings.Asr, getOffset('Asr')))}</td>
                                        <td className="px-1 py-2 font-mono" style={cellStyle}>{formatTime12_clean(applyOffset(day.timings.Maghrib, getOffset('Maghrib')))}</td>
                                        <td className="px-1 py-2 font-mono" style={cellStyle}>{formatTime12_clean(applyOffset(day.timings.Isha, getOffset('Isha')))}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Hidden Table for PDF Export */}
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1000 }}>
                <div ref={pdfTableRef} style={{ width: '800px', padding: '20px', backgroundColor: '#fff', color: '#000', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '24px', color: primaryColor }}>مواقيت الصلاة لشهر {monthNameDisplay}</h1>
                        <p style={{ fontSize: '16px', color: '#666' }}>الموقع: {config.location.cityGov}</p>
                        <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>تم الإنشاء بواسطة: مصحف احمد وليلى</p>
                    </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px', border: `1.5px solid ${tableBorderColor}` }}>
                    <thead>
                        <tr style={{ backgroundColor: isDefaultTheme ? '#000000' : primaryColor, color: '#fff' }}>
                            <th style={{ padding: '10px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor }}>اليوم</th>
                            <th style={{ padding: '10px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor }}>التاريخ الهجري</th>
                            <th style={{ padding: '10px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor }}>التاريخ الميلادي</th>
                            <th style={{ padding: '10px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor }}>الفجر</th>
                            <th style={{ padding: '10px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor }}>الظهر</th>
                            <th style={{ padding: '10px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor }}>العصر</th>
                            <th style={{ padding: '10px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor }}>المغرب</th>
                            <th style={{ padding: '10px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor }}>العشاء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthData.map((day, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '8px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor }}>{day.dayName}</td>
                                <td style={{ padding: '8px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor, direction: 'ltr' }}>{day.hijriDateStr}</td>
                                <td style={{ padding: '8px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor, direction: 'ltr' }}>{day.gregorianDateStr}</td>
                                <td style={{ padding: '8px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor, direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Fajr, getOffset('Fajr')))}</td>
                                <td style={{ padding: '8px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor, direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')))}</td>
                                <td style={{ padding: '8px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor, direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Asr, getOffset('Asr')))}</td>
                                <td style={{ padding: '8px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor, direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Maghrib, getOffset('Maghrib')))}</td>
                                <td style={{ padding: '8px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: tableBorderColor, direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Isha, getOffset('Isha')))}</td>
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

