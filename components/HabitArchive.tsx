import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronRight, BarChart2, CalendarDays } from 'lucide-react';
import moment from 'moment-hijri';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import BottomBar from './BottomBar';

interface HabitArchiveProps {
    onBack: () => void;
}

const HabitArchive: React.FC<HabitArchiveProps> = ({ onBack }) => {
    const { theme } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const hexColor = isBlackTheme ? '#FFFFFF' : (theme.palette && theme.palette.length > 0 ? theme.palette[0] : '#059669');
    const records = useHabitTracker((state) => state.records);
    const getDailyProgress = useHabitTracker((state) => state.getDailyProgress);
    
    const [activeTab, setActiveTab] = useState<'days' | 'months'>('days');
    
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
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 shadow-sm border border-black/5 dark:border-white/5 mb-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
               <BarChart2 className="w-5 h-5 opacity-70" style={{ color: hexColor }} />
               مقارنة بين يومين
            </h3>
            <div className="flex justify-between items-center gap-4 mb-4">
                <div className="flex-1">
                    <label className="block text-xs font-semibold opacity-70 mb-1 dark:text-gray-300">اليوم الأول</label>
                    <select 
                        value={compareDate1} 
                        onChange={(e) => setCompareDate1(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 text-sm font-bold p-2 rounded-xl text-gray-900 dark:text-white"
                    >
                        {allDates.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <span className="font-bold text-gray-400 mt-5">VS</span>
                <div className="flex-1">
                    <label className="block text-xs font-semibold opacity-70 mb-1 dark:text-gray-300">اليوم الثاني</label>
                    <select 
                        value={compareDate2} 
                        onChange={(e) => setCompareDate2(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 text-sm font-bold p-2 rounded-xl text-gray-900 dark:text-white"
                    >
                        {allDates.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
               <div className="text-center">
                  <div className="text-xl font-bold font-sans" style={{ color: hexColor }}>{prog1}%</div>
                  <div className="text-[10px] opacity-70 dark:text-gray-300">{compareDate1}</div>
               </div>
               <div className="text-center font-bold text-sm">
                  {diff > 0 
                     ? <span className="text-green-600 dark:text-green-400">تحسن بـ {diff}% 📈</span> 
                     : diff < 0 
                     ? <span className="text-orange-600 dark:text-orange-400">تراجع بـ {Math.abs(diff)}% 📉</span> 
                     : <span className="text-gray-600 dark:text-gray-400">نفس الإنجاز ➖</span>}
               </div>
               <div className="text-center">
                  <div className="text-xl font-bold font-sans" style={{ color: hexColor }}>{prog2}%</div>
                  <div className="text-[10px] opacity-70 dark:text-gray-300">{compareDate2}</div>
               </div>
            </div>
        </div>
    );

    const renderMonthComparisonTab = () => {
        if (monthKeys.length < 2) {
             return (
                 <div className="text-center p-8 opacity-70 text-sm font-bold dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 rounded-2xl mb-6 border border-black/5 dark:border-white/5">
                     لا توجد بيانات لأكثر من شهر للمقارنة حتى الآن.
                 </div>
             );
        }

        const avg1 = m1 && monthsData[m1] ? Math.round(monthsData[m1].total / monthsData[m1].count) : 0;
        const avg2 = m2 && monthsData[m2] ? Math.round(monthsData[m2].total / monthsData[m2].count) : 0;
        const mDiff = avg2 - avg1;

        return (
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 shadow-sm border border-black/5 dark:border-white/5 mb-6">
                 <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                   <CalendarDays className="w-5 h-5 opacity-70" style={{ color: hexColor }} />
                   مقارنة بين شهرين (المتوسط)
                 </h3>
                 <div className="flex justify-between items-center gap-4 mb-4">
                     <div className="flex-1">
                         <label className="block text-xs font-semibold opacity-70 mb-1 dark:text-gray-300">الشهر الأول</label>
                         <select 
                             value={m1} 
                             onChange={(e) => setM1(e.target.value)}
                             className="w-full bg-gray-100 dark:bg-gray-700 text-sm font-bold p-2 rounded-xl text-gray-900 dark:text-white"
                         >
                             {monthKeys.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                     </div>
                     <span className="font-bold text-gray-400 mt-5">VS</span>
                     <div className="flex-1">
                         <label className="block text-xs font-semibold opacity-70 mb-1 dark:text-gray-300">الشهر الثاني</label>
                         <select 
                             value={m2} 
                             onChange={(e) => setM2(e.target.value)}
                             className="w-full bg-gray-100 dark:bg-gray-700 text-sm font-bold p-2 rounded-xl text-gray-900 dark:text-white"
                         >
                             {monthKeys.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                     </div>
                 </div>
                 
                 <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-center">
                       <div className="text-xl font-bold font-sans" style={{ color: hexColor }}>{avg1}%</div>
                       <div className="text-[10px] opacity-70 dark:text-gray-300">متوسط الإنجاز</div>
                    </div>
                    <div className="text-center font-bold text-sm">
                       {mDiff > 0 
                          ? <span className="text-green-600 dark:text-green-400">تحسن بـ {mDiff}% 📈</span> 
                          : mDiff < 0 
                          ? <span className="text-orange-600 dark:text-orange-400">تراجع بـ {Math.abs(mDiff)}% 📉</span> 
                          : <span className="text-gray-600 dark:text-gray-400">نفس الإنجاز ➖</span>}
                    </div>
                    <div className="text-center">
                       <div className="text-xl font-bold font-sans" style={{ color: hexColor }}>{avg2}%</div>
                       <div className="text-[10px] opacity-70 dark:text-gray-300">متوسط الإنجاز</div>
                    </div>
                 </div>
            </div>
        );
    };

    return (
        <div className="h-screen h-[100dvh] max-h-screen max-h-[100dvh] flex flex-col bg-transparent relative overflow-hidden" dir="rtl">
            <header className="app-top-bar shrink-0">
                <div className="app-top-bar__inner">
                    <button 
                        onClick={onBack}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/20 dark:bg-gray-800/50 hover:opacity-80 active:scale-95 transition-all z-10 flex items-center justify-center"
                        style={{ color: 'inherit' }}
                        title="الرجوع"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="relative flex items-center justify-center w-full">
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            سجل الإنجاز والمقارنة
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle">
                        متابعة الأداء والتقييم الشهري
                    </p>
                </div>
            </header>

            <main className="flex-1 min-h-0 overflow-y-auto px-4 py-6 pb-36 overscroll-contain">
                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
                    <button 
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'days' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        onClick={() => setActiveTab('days')}
                        style={activeTab === 'days' ? { color: hexColor } : {}}
                    >
                        مقارنة الأيام
                    </button>
                    <button 
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'months' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        onClick={() => setActiveTab('months')}
                        style={activeTab === 'months' ? { color: hexColor } : {}}
                    >
                        مقارنة الشهور
                    </button>
                </div>

                {activeTab === 'days' ? renderComparisonTab() : renderMonthComparisonTab()}

                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">الأرشيف المفصل ({allDates.length} يوم)</h3>
                <div className="space-y-3 pb-8">
                    {allDates.length === 0 && (
                        <div className="text-center p-8 opacity-70 text-sm font-bold dark:text-gray-300">
                            لا يوجد إنجازات مسجلة بعد.
                        </div>
                    )}
                    {allDates.map(date => {
                        const progress = getDailyProgress(date);
                        return (
                           <div key={date} className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                   <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700" style={{ color: hexColor }}>
                                      <Calendar className="w-5 h-5" />
                                   </div>
                                   <div>
                                       <span className="font-bold block text-sm dark:text-white">{date}</span>
                                       <span className="text-[10px] font-semibold opacity-70 dark:text-gray-300">
                                            {progress === 100 ? 'إنجاز كامل 🌟' : `${progress}% مكتمل`}
                                       </span>
                                   </div>
                               </div>
                               <div className="text-xl font-bold font-sans" style={{ color: hexColor }}>
                                   {progress}%
                               </div>
                           </div>
                        );
                    })}
                </div>
            </main>
            
            <div className="shrink-0 z-30">
                <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
            </div>
        </div>
    );
};

export default HabitArchive;
