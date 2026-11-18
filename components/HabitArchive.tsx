import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronRight, BarChart2, CalendarDays, Edit3, Plus } from 'lucide-react';
import moment from 'moment-hijri';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';

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
    const dateInputRef = useRef<HTMLInputElement>(null);
    const todayStr = moment().format('YYYY-MM-DD');
    
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

    const renderComparisonTab = () => (
        <div 
            className={`app-page-card border-0 rounded-3xl p-4 sm:p-5 mb-6 ${s3d.surfaceCardClass}`}
        >
            <h3 className="font-extrabold text-base sm:text-lg mb-4 flex items-center gap-2.5" style={{ color: s3d.textColor }}>
               <span className={`border-0 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                 <BarChart2 className="w-4 h-4" style={{ color: hexColor }} />
               </span>
               {isEn ? 'Day Comparison' : 'مقارنة بين يومين'}
            </h3>
            <div className="flex justify-between items-center gap-3 sm:gap-4 mb-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold mb-1.5" style={{ color: s3d.subtextColor }}>
                        {isEn ? 'First Day' : 'اليوم الأول'}
                    </label>
                    <select 
                        value={compareDate1} 
                        onChange={(e) => setCompareDate1(e.target.value)}
                        className={`border-0 w-full text-sm font-bold p-2.5 rounded-2xl cursor-pointer focus:outline-none ${s3d.recessedInputClass}`}
                    >
                        {allDates.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <span className="font-black text-xs mt-5 opacity-60">VS</span>
                <div className="flex-1">
                    <label className="block text-xs font-bold mb-1.5" style={{ color: s3d.subtextColor }}>
                        {isEn ? 'Second Day' : 'اليوم الثاني'}
                    </label>
                    <select 
                        value={compareDate2} 
                        onChange={(e) => setCompareDate2(e.target.value)}
                        className={`border-0 w-full text-sm font-bold p-2.5 rounded-2xl cursor-pointer focus:outline-none ${s3d.recessedInputClass}`}
                    >
                        {allDates.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>
            
            <div 
                className="border-0 flex justify-between items-center p-3.5 rounded-2xl"
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
                   <span className={`border-0 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                     <CalendarDays className="w-4 h-4" style={{ color: hexColor }} />
                   </span>
                   {isEn ? 'Month Comparison (Average)' : 'مقارنة بين شهرين (المتوسط)'}
                 </h3>
                 <div className="flex justify-between items-center gap-3 sm:gap-4 mb-4">
                     <div className="flex-1">
                         <label className="block text-xs font-bold mb-1.5" style={{ color: s3d.subtextColor }}>
                             {isEn ? 'First Month' : 'الشهر الأول'}
                         </label>
                         <select 
                             value={m1} 
                             onChange={(e) => setM1(e.target.value)}
                             className={`border-0 w-full text-sm font-bold p-2.5 rounded-2xl cursor-pointer focus:outline-none ${s3d.recessedInputClass}`}
                         >
                             {monthKeys.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                     </div>
                     <span className="font-black text-xs mt-5 opacity-60">VS</span>
                     <div className="flex-1">
                         <label className="block text-xs font-bold mb-1.5" style={{ color: s3d.subtextColor }}>
                             {isEn ? 'Second Month' : 'الشهر الثاني'}
                         </label>
                         <select 
                             value={m2} 
                             onChange={(e) => setM2(e.target.value)}
                             className={`border-0 w-full text-sm font-bold p-2.5 rounded-2xl cursor-pointer focus:outline-none ${s3d.recessedInputClass}`}
                         >
                             {monthKeys.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                     </div>
                 </div>
                 
                 <div 
                     className="border-0 flex justify-between items-center p-3.5 rounded-2xl"
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
<<<<<<< HEAD
            style={{ backgroundColor: s3d.pageBgColor, color: s3d.textColor, fontFamily: theme.font }}
=======
            style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
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
                    <h3 className="font-extrabold text-base sm:text-lg" style={{ color: s3d.textColor }}>
                        {isEn ? `Detailed Archive (${allDates.length} days)` : `الأرشيف المفصل (${allDates.length} يوم)`}
                    </h3>
                    {onSelectDate && (
                        <div>
                            <input
                                type="date"
                                ref={dateInputRef}
                                max={todayStr}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        onSelectDate(e.target.value);
                                    }
                                }}
                                className="sr-only"
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
                                className="app-page-card border-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer"
                                style={{ backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }}
                            >
                                <Plus className="w-3.5 h-3.5 stroke-[2.75]" />
                                <span>{isEn ? 'Log past day 🗓️' : 'تسجيل يوم سابق 🗓️'}</span>
                            </motion.button>
                        </div>
                    )}
                </div>

<<<<<<< HEAD
                <div className="space-y-3 pb-4">
=======
                <div className="space-y-3">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
                                    <div className={`border-0 p-2.5 rounded-xl shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`} style={{ color: hexColor }}>
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
        </div>
    );
};

export default HabitArchive;
