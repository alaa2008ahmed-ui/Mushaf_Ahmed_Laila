import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, ChevronLeft, ChevronDown, BarChart2, CalendarDays, Edit3, X, Check } from 'lucide-react';
import moment from 'moment-hijri';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';
import { gregorianMonths } from '../data/calendarData';
import { registerBackInterceptor } from '../hooks/useBackButton';

interface HabitArchiveProps {
    onBack: () => void;
    onHome?: () => void;
    onSelectDate?: (date: string) => void;
}

const HabitArchive: React.FC<HabitArchiveProps> = ({ onBack, onHome, onSelectDate }) => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const isBlackTheme = s3d.isBlackTheme;
    const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
    const hexColor = s3d.primaryColor;
    
    // In default theme: Black (#000000). In black theme: White (#FFFFFF). In other themes: adapt with theme
    const navIconColor = isDefaultTheme 
      ? '#000000' 
      : (isBlackTheme 
          ? '#FFFFFF' 
          : (theme.topBarText || theme.textColor || theme.palette?.[0] || '#000000'));
    const records = useHabitTracker((state) => state.records);
    const getDailyProgress = useHabitTracker((state) => state.getDailyProgress);
    
    const [activeTab, setActiveTab] = useState<'days' | 'months'>('days');
    const [activePicker, setActivePicker] = useState<'date1' | 'date2' | 'month1' | 'month2' | null>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const todayStr = moment().format('YYYY-MM-DD');
    const [calendarViewMonth, setCalendarViewMonth] = useState(() => moment().startOf('month'));
    const [pickerSelectedDate, setPickerSelectedDate] = useState(() => todayStr);
    
    // Sort all dates
    const allDates = useMemo(() => {
        return Object.keys(records).sort((a, b) => moment(b).valueOf() - moment(a).valueOf());
    }, [records]);

    const [compareDate1, setCompareDate1] = useState(() => {
        return moment().subtract(1, 'days').format('YYYY-MM-DD');
    });
    const [compareDate2, setCompareDate2] = useState(() => {
        return moment().format('YYYY-MM-DD');
    });

    useEffect(() => {
        if (allDates.length > 0) {
            if (!allDates.includes(compareDate2)) {
                setCompareDate2(allDates[0]);
            }
            if (!allDates.includes(compareDate1)) {
                setCompareDate1(allDates.length > 1 ? allDates[1] : allDates[0]);
            }
        }
    }, [allDates]);

    // Group by month
    const monthsData = useMemo(() => {
        const data: Record<string, { total: number, count: number }> = {};
        allDates.forEach(date => {
            const m = moment(date).format('YYYY-MM');
            if (!data[m]) data[m] = { total: 0, count: 0 };
            data[m].total += getDailyProgress(date);
            data[m].count += 1;
        });
        return data;
    }, [allDates, records, getDailyProgress]);

    const monthKeys = useMemo(() => {
        return Object.keys(monthsData).sort((a, b) => moment(b, 'YYYY-MM').valueOf() - moment(a, 'YYYY-MM').valueOf());
    }, [monthsData]);

    const [m1, setM1] = useState(() => monthKeys.length > 1 ? monthKeys[1] : (monthKeys[0] || ''));
    const [m2, setM2] = useState(() => monthKeys[0] || '');

    useEffect(() => {
        if (monthKeys.length > 0) {
            if (!monthKeys.includes(m2)) {
                setM2(monthKeys[0]);
            }
            if (!monthKeys.includes(m1)) {
                setM1(monthKeys.length > 1 ? monthKeys[1] : monthKeys[0]);
            }
        }
    }, [monthKeys]);

    const prog1 = getDailyProgress(compareDate1);
    const prog2 = getDailyProgress(compareDate2);
    const diff = prog2 - prog1;

    useEffect(() => {
        if (!activePicker && !isDatePickerOpen) return;
        const unregister = registerBackInterceptor(() => {
            if (isDatePickerOpen) {
                setIsDatePickerOpen(false);
                return true;
            }
            if (activePicker) {
                setActivePicker(null);
                return true;
            }
            return false;
        });
        return unregister;
    }, [activePicker, isDatePickerOpen]);

    const openPastDatePicker = () => {
        setCalendarViewMonth(moment(todayStr, 'YYYY-MM-DD').startOf('month'));
        setPickerSelectedDate(todayStr);
        setIsDatePickerOpen(true);
    };

    const ENGLISH_MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekdayLabels = isEn
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        : ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

    const calendarDays = useMemo(() => {
        const startOfMonth = calendarViewMonth.clone().startOf('month');
        const daysInMonth = calendarViewMonth.daysInMonth();
        const leadingEmptyCount = startOfMonth.day(); // 0 (Sun) - 6 (Sat)
        const cells: Array<{ dateStr: string; dayNum: number } | null> = [];
        for (let i = 0; i < leadingEmptyCount; i++) {
            cells.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = calendarViewMonth.clone().date(d).format('YYYY-MM-DD');
            cells.push({ dateStr, dayNum: d });
        }
        return cells;
    }, [calendarViewMonth]);

    const canGoNextMonth = useMemo(() => {
        const currentMonthStart = moment(todayStr, 'YYYY-MM-DD').startOf('month');
        return calendarViewMonth.isBefore(currentMonthStart, 'month');
    }, [calendarViewMonth, todayStr]);

    const renderComparisonTab = () => (
        <div 
            className={`app-page-card border-0 rounded-3xl p-4 sm:p-5 mb-6 ${s3d.surfaceCardClass}`}
        >
            <h3 className="font-extrabold text-base sm:text-lg mb-4 flex items-center gap-2.5" style={{ color: s3d.textColor }}>
               <span className={`app-3d-badge border-0 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                 <BarChart2 className="w-4 h-4" style={{ color: hexColor }} />
               </span>
               {isEn ? 'Day Comparison' : 'مقارنة بين يومين'}
            </h3>
            <div className="flex justify-between items-center gap-3 sm:gap-4 mb-4">
                <div className="flex-1 min-w-0">
                    <label className="block text-xs font-bold mb-1.5" style={{ color: s3d.subtextColor }}>
                        {isEn ? 'First Day' : 'اليوم الأول'}
                    </label>
                    <button
                        type="button"
                        onClick={() => setActivePicker('date1')}
                        className={`app-inner-3d-box border-0 w-full text-sm font-bold px-3 py-2.5 rounded-2xl cursor-pointer flex items-center justify-between gap-2 active:translate-y-[2px] transition-all ${s3d.innerCardClass}`}
                        style={{ color: s3d.textColor }}
                    >
                        <span className="truncate tabular-nums font-sans">{compareDate1 || '—'}</span>
                        <span
                            className={`app-3d-badge border-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                            style={{ color: hexColor }}
                        >
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                    </button>
                </div>
                <span className="font-black text-xs mt-5 opacity-60 shrink-0">VS</span>
                <div className="flex-1 min-w-0">
                    <label className="block text-xs font-bold mb-1.5" style={{ color: s3d.subtextColor }}>
                        {isEn ? 'Second Day' : 'اليوم الثاني'}
                    </label>
                    <button
                        type="button"
                        onClick={() => setActivePicker('date2')}
                        className={`app-inner-3d-box border-0 w-full text-sm font-bold px-3 py-2.5 rounded-2xl cursor-pointer flex items-center justify-between gap-2 active:translate-y-[2px] transition-all ${s3d.innerCardClass}`}
                        style={{ color: s3d.textColor }}
                    >
                        <span className="truncate tabular-nums font-sans">{compareDate2 || '—'}</span>
                        <span
                            className={`app-3d-badge border-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                            style={{ color: hexColor }}
                        >
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                    </button>
                </div>
            </div>
            
            <div 
                className="app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl"
                style={{ backgroundColor: s3d.softResultBg }}
            >
               <div className="text-center">
                  <div className="text-xl font-black font-sans" style={{ color: hexColor }}>{prog1}%</div>
                  <div className="text-[10px] font-semibold mt-0.5" style={{ color: s3d.subtextColor }}>{compareDate1}</div>
               </div>
               <div className="text-center font-extrabold text-xs sm:text-sm px-2">
                  {diff > 0 
                     ? <span className="text-emerald-600 dark:text-emerald-400">{isEn ? `Improved by ${diff}% 📈` : `تحسن بـ ${diff}% 📈`}</span> 
                     : diff < 0 
                     ? <span className="text-orange-600 dark:text-orange-400">{isEn ? `Declined by ${Math.abs(diff)}% 📉` : `تراجع بـ ${Math.abs(diff)}% 📉`}</span> 
                     : <span style={{ color: s3d.subtextColor }}>{isEn ? 'Same achievement ➖' : 'نفس الإنجاز ➖'}</span>}
               </div>
               <div className="text-center">
                  <div className="text-xl font-black font-sans" style={{ color: hexColor }}>{prog2}%</div>
                  <div className="text-[10px] font-semibold mt-0.5" style={{ color: s3d.subtextColor }}>{compareDate2}</div>
               </div>
            </div>
        </div>
    );

    const renderMonthComparisonTab = () => {
        if (monthKeys.length < 2) {
             return (
                 <div 
                     className={`app-page-card border-0 text-center p-8 text-sm font-bold rounded-3xl mb-6 ${s3d.surfaceCardClass}`}
                 >
                     <span style={{ color: s3d.subtextColor }}>
                       {isEn ? 'No data for more than one month to compare yet.' : 'لا توجد بيانات لأكثر من شهر للمقارنة حتى الآن.'}
                     </span>
                 </div>
             );
        }

        const avg1 = m1 && monthsData[m1] ? Math.round(monthsData[m1].total / monthsData[m1].count) : 0;
        const avg2 = m2 && monthsData[m2] ? Math.round(monthsData[m2].total / monthsData[m2].count) : 0;
        const mDiff = avg2 - avg1;

        return (
            <div 
                className={`app-page-card border-0 rounded-3xl p-4 sm:p-5 mb-6 ${s3d.surfaceCardClass}`}
            >
                 <h3 className="font-extrabold text-base sm:text-lg mb-4 flex items-center gap-2.5" style={{ color: s3d.textColor }}>
                   <span className={`app-3d-badge border-0 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                     <CalendarDays className="w-4 h-4" style={{ color: hexColor }} />
                   </span>
                   {isEn ? 'Month Comparison (Average)' : 'مقارنة بين شهرين (المتوسط)'}
                 </h3>
                 <div className="flex justify-between items-center gap-3 sm:gap-4 mb-4">
                     <div className="flex-1 min-w-0">
                         <label className="block text-xs font-bold mb-1.5" style={{ color: s3d.subtextColor }}>
                             {isEn ? 'First Month' : 'الشهر الأول'}
                         </label>
                         <button
                             type="button"
                             onClick={() => setActivePicker('month1')}
                             className={`app-inner-3d-box border-0 w-full text-sm font-bold px-3 py-2.5 rounded-2xl cursor-pointer flex items-center justify-between gap-2 active:translate-y-[2px] transition-all ${s3d.innerCardClass}`}
                             style={{ color: s3d.textColor }}
                         >
                             <span className="truncate tabular-nums font-sans">{m1 || '—'}</span>
                             <span
                                 className={`app-3d-badge border-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                                 style={{ color: hexColor }}
                             >
                                 <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                             </span>
                         </button>
                     </div>
                     <span className="font-black text-xs mt-5 opacity-60 shrink-0">VS</span>
                     <div className="flex-1 min-w-0">
                         <label className="block text-xs font-bold mb-1.5" style={{ color: s3d.subtextColor }}>
                             {isEn ? 'Second Month' : 'الشهر الثاني'}
                         </label>
                         <button
                             type="button"
                             onClick={() => setActivePicker('month2')}
                             className={`app-inner-3d-box border-0 w-full text-sm font-bold px-3 py-2.5 rounded-2xl cursor-pointer flex items-center justify-between gap-2 active:translate-y-[2px] transition-all ${s3d.innerCardClass}`}
                             style={{ color: s3d.textColor }}
                         >
                             <span className="truncate tabular-nums font-sans">{m2 || '—'}</span>
                             <span
                                 className={`app-3d-badge border-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                                 style={{ color: hexColor }}
                             >
                                 <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                             </span>
                         </button>
                     </div>
                 </div>
                 
                 <div 
                     className="app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl"
                     style={{ backgroundColor: s3d.softResultBg }}
                 >
                    <div className="text-center">
                       <div className="text-xl font-black font-sans" style={{ color: hexColor }}>{avg1}%</div>
                       <div className="text-[10px] font-semibold mt-0.5" style={{ color: s3d.subtextColor }}>{isEn ? 'Average Achievement' : 'متوسط الإنجاز'}</div>
                    </div>
                    <div className="text-center font-extrabold text-xs sm:text-sm px-2">
                       {mDiff > 0 
                          ? <span className="text-emerald-600 dark:text-emerald-400">{isEn ? `Improved by ${mDiff}% 📈` : `تحسن بـ ${mDiff}% 📈`}</span> 
                          : mDiff < 0 
                          ? <span className="text-orange-600 dark:text-orange-400">{isEn ? `Declined by ${Math.abs(mDiff)}% 📉` : `تراجع بـ ${Math.abs(mDiff)}% 📉`}</span> 
                          : <span style={{ color: s3d.subtextColor }}>{isEn ? 'Same achievement ➖' : 'نفس الإنجاز ➖'}</span>}
                    </div>
                    <div className="text-center">
                       <div className="text-xl font-black font-sans" style={{ color: hexColor }}>{avg2}%</div>
                       <div className="text-[10px] font-semibold mt-0.5" style={{ color: s3d.subtextColor }}>{isEn ? 'Average Achievement' : 'متوسط الإنجاز'}</div>
                    </div>
                 </div>
            </div>
        );
    };

    return (
        <div 
            className="h-[100dvh] max-h-[100dvh] flex flex-col relative overflow-hidden" 
            style={{ backgroundColor: s3d.pageBgColor, color: s3d.textColor, fontFamily: theme.font }}
            dir={isEn ? 'ltr' : 'rtl'}
        >
            <header className="app-top-bar shrink-0">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* زر الرجوع للخلف: على اليمين في العربي، وعلى اليسار في الإنجليزي */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: navIconColor }}
                                title={isEn ? 'Back' : 'رجوع للخلف'}
                                aria-label={isEn ? 'Back' : 'رجوع للخلف'}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate">
                                {isEn ? 'Record' : 'السجل'}
                            </h1>
                        </div>

                        {/* أيقونة المنزل: على اليسار في العربي، وعلى اليمين في الإنجليزي */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                onClick={onHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: navIconColor }}
                                title={isEn ? 'Home' : 'الصفحة الرئيسية'}
                                aria-label={isEn ? 'Home' : 'الصفحة الرئيسية'}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main 
                className="flex-1 min-h-0 overflow-y-auto px-4 pt-6 app-scroll-safe overscroll-contain"
            >
                {/* Tabs */}
                <div 
                    className={`app-page-card border-0 flex rounded-2xl p-2 pb-2.5 mb-6 gap-2 overflow-visible ${s3d.surfaceCardClass}`}
                >
                    <button 
                        className={`app-page-card border-0 flex-1 py-2.5 text-sm rounded-xl transition-all cursor-pointer ${
                          activeTab === 'days'
                            ? 'font-black'
                            : `font-bold opacity-85 ${s3d.surfaceCardClass}`
                        }`}
                        onClick={() => setActiveTab('days')}
                        style={activeTab === 'days' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                    >
                        {isEn ? 'Days' : 'الأيام'}
                    </button>
                    <button 
                        className={`app-page-card border-0 flex-1 py-2.5 text-sm rounded-xl transition-all cursor-pointer ${
                          activeTab === 'months'
                            ? 'font-black'
                            : `font-bold opacity-85 ${s3d.surfaceCardClass}`
                        }`}
                        onClick={() => setActiveTab('months')}
                        style={activeTab === 'months' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                    >
                        {isEn ? 'Months' : 'الشهور'}
                    </button>
                </div>

                {activeTab === 'days' ? renderComparisonTab() : renderMonthComparisonTab()}

                <div className="flex items-center justify-between mb-4 gap-2 overflow-visible pb-1">
                    <h3 className="font-extrabold text-sm sm:text-base whitespace-nowrap truncate min-w-0" style={{ color: s3d.textColor }}>
                        {isEn ? `Detailed Archive (${allDates.length} days)` : `الأرشيف المفصل (${allDates.length} يوم)`}
                    </h3>
                    {onSelectDate && (
                        <div className="shrink-0">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={openPastDatePicker}
                                className="app-page-card border-0 flex items-center justify-center px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer"
                                style={{ backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }}
                            >
                                <span>{isEn ? 'Log past day' : 'تسجيل يوم سابق'}</span>
                            </motion.button>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pb-4">
                    {allDates.length === 0 && (
                        <div 
                            className={`app-page-card border-0 text-center p-8 text-sm font-bold rounded-3xl ${s3d.surfaceCardClass}`}
                        >
                            <span style={{ color: s3d.subtextColor }}>
                              {isEn 
                                  ? 'No achievements recorded yet. Click "Log past day" above to record any missed day.' 
                                  : 'لا يوجد إنجازات مسجلة بعد. يمكنك النقر على "تسجيل يوم سابق" بالأعلى لتسجيل أي يوم فاتك.'}
                            </span>
                        </div>
                    )}
                    {allDates.map(date => {
                        const progress = getDailyProgress(date);
                        return (
                           <div 
                                key={date} 
                                className={`app-page-card border-0 rounded-2xl p-4 flex items-center justify-between gap-3 ${s3d.surfaceCardClass}`}
                           >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`app-3d-badge border-0 p-2.5 rounded-xl shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`} style={{ color: hexColor }}>
                                       <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="font-extrabold block text-sm truncate" style={{ color: s3d.textColor }}>{date}</span>
                                        <span className="text-[11px] font-semibold block mt-0.5" style={{ color: s3d.subtextColor }}>
                                             {progress === 100 ? (isEn ? 'Full achievement 🌟' : 'إنجاز كامل 🌟') : (isEn ? `${progress}% completed` : `${progress}% مكتمل`)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 overflow-visible pb-1">
                                    <div className="text-xl font-black font-sans" style={{ color: hexColor }}>
                                        {progress}%
                                    </div>
                                    {onSelectDate && (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onSelectDate(date)}
                                            className={`app-page-card border-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${s3d.surfaceCardClass}`}
                                            title={isEn ? 'Edit habits for this day' : 'تعديل عبادات هذا اليوم'}
                                        >
                                            <Edit3 className="w-3.5 h-3.5" style={{ color: hexColor }} />
                                            <span className="hidden sm:inline">{isEn ? 'Edit' : 'تعديل'}</span>
                                        </motion.button>
                                    )}
                                </div>
                           </div>
                        );
                    })}
                </div>
            </main>

            {/* 3D Sculpted Selection Modal for Comparison Lists (Days / Months) */}
            {typeof document !== 'undefined' && activePicker && createPortal(
                    (() => {
                        const isMonthPicker = activePicker === 'month1' || activePicker === 'month2';
                        const options = isMonthPicker ? monthKeys : allDates;
                        const currentVal =
                            activePicker === 'date1' ? compareDate1
                            : activePicker === 'date2' ? compareDate2
                            : activePicker === 'month1' ? m1
                            : m2;

                        const titleText =
                            activePicker === 'date1' ? (isEn ? 'Select First Day' : 'اختر اليوم الأول')
                            : activePicker === 'date2' ? (isEn ? 'Select Second Day' : 'اختر اليوم الثاني')
                            : activePicker === 'month1' ? (isEn ? 'Select First Month' : 'اختر الشهر الأول')
                            : (isEn ? 'Select Second Month' : 'اختر الشهر الثاني');

                        const handlePickOption = (val: string) => {
                            if (activePicker === 'date1') setCompareDate1(val);
                            else if (activePicker === 'date2') setCompareDate2(val);
                            else if (activePicker === 'month1') setM1(val);
                            else setM2(val);
                            setActivePicker(null);
                        };

                        return (
                            <div
                                onClick={() => setActivePicker(null)}
                                className="fixed inset-0 z-[999999] bg-black/60 flex items-center justify-center p-4"
                                dir={isEn ? 'ltr' : 'rtl'}
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className={`app-page-card border-0 rounded-3xl p-4 sm:p-5 w-full max-w-sm max-h-[75dvh] flex flex-col ${s3d.surfaceCardClass}`}
                                    style={{
                                        color: s3d.textColor,
                                        fontFamily: theme.font,
                                        boxShadow: s3d.isBlackTheme
                                            ? '0 8px 0 #09090b, 0 22px 44px rgba(0, 0, 0, 0.88), inset 0 2px 2px rgba(255, 255, 255, 0.2)'
                                            : '0 8px 0 rgba(0, 0, 0, 0.16), 0 22px 44px rgba(0, 0, 0, 0.22), inset 0 2px 2px rgba(255, 255, 255, 0.95)',
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-3 pb-3 mb-3 app-3d-divider shrink-0">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span
                                                className={`app-3d-badge border-0 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                                                style={{ color: hexColor }}
                                            >
                                                {isMonthPicker ? <CalendarDays className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                                            </span>
                                            <h4 className="font-black text-base truncate">{titleText}</h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setActivePicker(null)}
                                            className={`app-inner-3d-box border-0 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:translate-y-[1.5px] transition-all shrink-0 ${s3d.innerCardClass}`}
                                            style={{ color: s3d.textColor }}
                                            aria-label={isEn ? 'Close' : 'إغلاق'}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 p-1 no-scrollbar">
                                        {options.length === 0 ? (
                                            <div className={`app-inner-3d-box border-0 rounded-2xl p-6 text-center text-sm font-bold ${s3d.innerCardClass}`} style={{ color: s3d.subtextColor }}>
                                                {isEn ? 'No recorded entries yet' : 'لا توجد سجلات متاحة بعد'}
                                            </div>
                                        ) : (
                                            options.map((opt) => {
                                                const isSelected = opt === currentVal;
                                                const optProg = isMonthPicker
                                                    ? (monthsData[opt] ? Math.round(monthsData[opt].total / monthsData[opt].count) : 0)
                                                    : getDailyProgress(opt);

                                                return (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => handlePickOption(opt)}
                                                        className={`app-page-card border-0 w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer active:translate-y-[2px] transition-all ${
                                                            isSelected ? '' : s3d.innerCardClass
                                                        }`}
                                                        style={isSelected ? s3d.primary3DStyle : { color: s3d.textColor }}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span
                                                                className={`app-3d-badge border-0 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                                                    isSelected
                                                                        ? 'bg-white/25'
                                                                        : (s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10')
                                                                }`}
                                                                style={{ color: isSelected ? s3d.btnTextColor : hexColor }}
                                                            >
                                                                {isSelected
                                                                    ? <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                    : (isMonthPicker ? <CalendarDays className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />)}
                                                            </span>
                                                            <span className="font-extrabold text-sm tabular-nums font-sans truncate">
                                                                {opt}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className="text-xs font-black font-sans px-2.5 py-1 rounded-xl shrink-0"
                                                            style={
                                                                isSelected
                                                                    ? { backgroundColor: 'rgba(255,255,255,0.2)', color: s3d.btnTextColor }
                                                                    : { backgroundColor: s3d.softResultBg, color: hexColor }
                                                            }
                                                        >
                                                            {optProg}%
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })(),
                document.body
            )}

            {/* 3D Sculpted In-App Calendar Date Picker Modal for Past Day Logging */}
            {typeof document !== 'undefined' && isDatePickerOpen && createPortal(
                    (() => {
                        const monthIdx = calendarViewMonth.month();
                        const monthName = isEn ? ENGLISH_MONTHS[monthIdx] : (gregorianMonths[monthIdx]?.name || '');
                        const yearNum = calendarViewMonth.year();
                        const selectedProgress = getDailyProgress(pickerSelectedDate);
                        const hasSelectedRecord = Boolean(records[pickerSelectedDate]);

                        return (
                            <div
                                onClick={() => setIsDatePickerOpen(false)}
                                className="fixed inset-0 z-[999999] bg-black/60 flex items-center justify-center p-4"
                                dir={isEn ? 'ltr' : 'rtl'}
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className={`app-page-card border-0 rounded-3xl p-4 sm:p-5 w-full max-w-sm max-h-[90dvh] overflow-y-auto no-scrollbar flex flex-col ${s3d.surfaceCardClass}`}
                                    style={{
                                        color: s3d.textColor,
                                        fontFamily: theme.font,
                                        boxShadow: s3d.isBlackTheme
                                            ? '0 8px 0 #09090b, 0 22px 44px rgba(0, 0, 0, 0.88), inset 0 2px 2px rgba(255, 255, 255, 0.2)'
                                            : '0 8px 0 rgba(0, 0, 0, 0.16), 0 22px 44px rgba(0, 0, 0, 0.22), inset 0 2px 2px rgba(255, 255, 255, 0.95)',
                                    }}
                                >
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 app-3d-divider">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span
                                                className={`app-3d-badge border-0 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                                                style={{ color: hexColor }}
                                            >
                                                <Calendar className="w-4 h-4" />
                                            </span>
                                            <h4 className="font-black text-base truncate">
                                                {isEn ? 'Select Date' : 'اختيار التاريخ'}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCalendarViewMonth(moment(todayStr, 'YYYY-MM-DD').startOf('month'));
                                                    setPickerSelectedDate(todayStr);
                                                }}
                                                className={`app-inner-3d-box border-0 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer active:translate-y-[1.5px] transition-all ${s3d.innerCardClass}`}
                                                style={{ color: hexColor }}
                                            >
                                                {isEn ? 'Today' : 'اليوم'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsDatePickerOpen(false)}
                                                className={`app-inner-3d-box border-0 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:translate-y-[1.5px] transition-all ${s3d.innerCardClass}`}
                                                style={{ color: s3d.textColor }}
                                                aria-label={isEn ? 'Close' : 'إغلاق'}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 3D Month Navigation Bar */}
                                    <div className={`app-inner-3d-box border-0 rounded-2xl p-2 mb-3 flex items-center justify-between gap-2 ${s3d.innerCardClass}`}>
                                        <button
                                            type="button"
                                            onClick={() => setCalendarViewMonth((prev) => prev.clone().subtract(1, 'month'))}
                                            className={`app-3d-badge border-0 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer active:translate-y-[1.5px] transition-all ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                                            style={{ color: hexColor }}
                                            aria-label={isEn ? 'Previous month' : 'الشهر السابق'}
                                        >
                                            {isEn ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>

                                        <div className="font-black text-sm sm:text-base text-center select-none">
                                            {monthName} <span className="font-sans tabular-nums">{yearNum}</span>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={!canGoNextMonth}
                                            onClick={() => canGoNextMonth && setCalendarViewMonth((prev) => prev.clone().add(1, 'month'))}
                                            className={`app-3d-badge border-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                                canGoNextMonth
                                                    ? 'cursor-pointer active:translate-y-[1.5px]'
                                                    : 'opacity-30 cursor-not-allowed'
                                            } ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                                            style={{ color: hexColor }}
                                            aria-label={isEn ? 'Next month' : 'الشهر التالي'}
                                        >
                                            {isEn ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Weekday Labels */}
                                    <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
                                        {weekdayLabels.map((lbl) => (
                                            <div key={lbl} className="text-[10px] font-extrabold opacity-70 truncate" style={{ color: s3d.subtextColor }}>
                                                {lbl}
                                            </div>
                                        ))}
                                    </div>

                                    {/* 3D Day Grid */}
                                    <div className="grid grid-cols-7 gap-1.5 mb-4 p-0.5">
                                        {calendarDays.map((cell, idx) => {
                                            if (!cell) {
                                                return <div key={`empty-${idx}`} className="aspect-square" />;
                                            }
                                            const isFuture = cell.dateStr > todayStr;
                                            const isSelected = cell.dateStr === pickerSelectedDate;
                                            const isToday = cell.dateStr === todayStr;
                                            const hasRecord = Boolean(records[cell.dateStr]);

                                            return (
                                                <button
                                                    key={cell.dateStr}
                                                    type="button"
                                                    disabled={isFuture}
                                                    onClick={() => setPickerSelectedDate(cell.dateStr)}
                                                    className={`app-inner-3d-box border-0 aspect-square rounded-xl flex flex-col items-center justify-center relative text-xs font-extrabold font-sans tabular-nums transition-all ${
                                                        isFuture
                                                            ? 'opacity-25 cursor-not-allowed'
                                                            : 'cursor-pointer active:translate-y-[1.5px]'
                                                    } ${!isSelected ? s3d.innerCardClass : ''}`}
                                                    style={
                                                        isSelected
                                                            ? { ...s3d.primary3DStyle }
                                                            : {
                                                                  color: isToday ? hexColor : s3d.textColor,
                                                                  outline: isToday ? `1.5px solid ${hexColor}` : undefined,
                                                                  outlineOffset: '-2px',
                                                              }
                                                    }
                                                >
                                                    <span>{cell.dayNum}</span>
                                                    {hasRecord && (
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full mt-0.5"
                                                            style={{ backgroundColor: isSelected ? s3d.btnTextColor : hexColor }}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Selected Day Summary Preview */}
                                    <div
                                        className="app-inner-3d-box border-0 rounded-2xl px-3.5 py-2.5 mb-3.5 flex items-center justify-between gap-2"
                                        style={{ backgroundColor: s3d.softResultBg }}
                                    >
                                        <span className="text-xs font-extrabold font-sans tabular-nums" style={{ color: s3d.textColor }}>
                                            {pickerSelectedDate}
                                        </span>
                                        <span className="text-xs font-black" style={{ color: hexColor }}>
                                            {hasSelectedRecord
                                                ? (isEn ? `${selectedProgress}% logged` : `مسجل ${selectedProgress}%`)
                                                : (isEn ? 'Not logged yet' : 'غير مسجل بعد')}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (pickerSelectedDate && onSelectDate) {
                                                    onSelectDate(pickerSelectedDate);
                                                }
                                                setIsDatePickerOpen(false);
                                            }}
                                            className="app-page-card border-0 flex-1 py-3 rounded-2xl text-sm font-black cursor-pointer active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                                            style={s3d.primary3DStyle}
                                        >
                                            <Check className="w-4 h-4 stroke-[2.75]" />
                                            <span>{isEn ? 'Open Selected Day' : 'فتح اليوم المختار'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsDatePickerOpen(false)}
                                            className={`app-page-card border-0 px-4 py-3 rounded-2xl text-sm font-bold cursor-pointer active:translate-y-[2px] transition-all ${s3d.innerCardClass}`}
                                            style={{ color: s3d.textColor }}
                                        >
                                            {isEn ? 'Cancel' : 'إلغاء'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })(),
                document.body
            )}
        </div>
    );
};

export default HabitArchive;
