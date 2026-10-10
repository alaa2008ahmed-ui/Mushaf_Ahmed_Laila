import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Calendar, TrendingUp, X, Zap, ChevronRight } from 'lucide-react';
import { Theme } from '../../context/themes';
import { toArabicNumerals } from '../../utils/tasbeehUtils';
import BottomBar from '../BottomBar';
import moment from 'moment-hijri';

interface TasbeehChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    dailyStats: { date: string; count: number }[];
    theme: Theme;
    themeKey: string;
}

type PeriodType = 'weekly' | 'monthly';

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_DAYS_SHORT = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const TasbeehChartModal: React.FC<TasbeehChartModalProps> = ({
    isOpen,
    onClose,
    dailyStats = [],
    theme,
    themeKey
}) => {
    const [period, setPeriod] = useState<PeriodType>('weekly');
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default';
    const primaryColor = isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]);
    const secondaryColor = isDefaultTheme ? '#4b5563' : (isBlackTheme ? '#d1d5db' : (theme.palette[1] || theme.palette[0]));
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Build the dataset for weekly (7 days) or monthly (30 days) with full Arabic localization
    const chartData = useMemo(() => {
        const daysCount = period === 'weekly' ? 7 : 30;
        const result = [];

        for (let i = daysCount - 1; i >= 0; i--) {
            const dateObj = moment().subtract(i, 'days');
            const dateStr = dateObj.format('YYYY-MM-DD');
            const stat = dailyStats.find(s => s.date === dateStr);
            const count = stat ? stat.count : 0;
            const isToday = dateStr === todayStr;

            const jsDate = dateObj.toDate();
            const dayOfWeek = jsDate.getDay();
            const dayOfMonth = jsDate.getDate();
            const monthIdx = jsDate.getMonth();

            result.push({
                date: dateStr,
                count,
                isToday,
                dayName: ARABIC_DAYS[dayOfWeek],
                shortDayName: ARABIC_DAYS_SHORT[dayOfWeek],
                dayNumber: toArabicNumerals(dayOfMonth),
                formattedDate: `${toArabicNumerals(dayOfMonth)} ${ARABIC_MONTHS[monthIdx]}`,
                shortDate: `${toArabicNumerals(dayOfMonth)}/${toArabicNumerals(monthIdx + 1)}`
            });
        }

        return result;
    }, [period, dailyStats, todayStr]);

    // Summary calculations
    const statsSummary = useMemo(() => {
        const total = chartData.reduce((acc, curr) => acc + curr.count, 0);
        const daysWithCount = chartData.filter(d => d.count > 0).length;
        const average = Math.round(total / (chartData.length || 1));
        const max = Math.max(...chartData.map(d => d.count), 0);
        const peakDay = chartData.find(d => d.count === max && max > 0);
        const todayStat = chartData.find(d => d.isToday);

        return {
            total,
            daysWithCount,
            average,
            max,
            peakDay,
            todayCount: todayStat ? todayStat.count : 0
        };
    }, [chartData]);

    const activeSelectedDay = selectedDayIndex !== null 
        ? chartData[selectedDayIndex] 
        : (chartData.find(d => d.isToday) || chartData[chartData.length - 1]);

    if (!isOpen) return null;

    // SVG coordinates computation
    const svgWidth = 320;
    const svgHeight = 140;
    const chartTopPadding = 20;
    const chartBottomPadding = 25;
    const usableHeight = svgHeight - chartTopPadding - chartBottomPadding;
    const maxVal = Math.max(statsSummary.max, 10);
    const numBars = chartData.length;
    const barSpacing = svgWidth / numBars;
    const barWidth = period === 'weekly' ? Math.min(28, barSpacing * 0.65) : Math.min(8, barSpacing * 0.7);

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                dir="rtl"
            >
                {/* Full Screen Top Header */}
                <header className="app-top-bar shrink-0">
                    <div className="app-top-bar__inner">
                        <div className="relative flex items-center justify-center w-full px-2">
                            <div className="text-center mx-2 min-w-0">
                                <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                    مخطط التسبيح
                                </h1>
                                <p className="app-top-bar__subtitle truncate">
                                    تطور التسبيحات
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto px-3 sm:px-4 pt-3 pb-36 max-w-lg mx-auto w-full space-y-3.5 overscroll-contain">
                    
                    {/* Period Switcher (Weekly / Monthly) */}
                    <div className="shrink-0">
                        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-gray-200/70 dark:bg-gray-800 border border-black/5 dark:border-white/5">
                            <button
                                type="button"
                                onClick={() => {
                                    setPeriod('weekly');
                                    setSelectedDayIndex(null);
                                }}
                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    period === 'weekly' 
                                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                                style={period === 'weekly' ? { color: primaryColor } : {}}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>أسبوعي (آخر ٧ أيام)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setPeriod('monthly');
                                    setSelectedDayIndex(null);
                                }}
                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    period === 'monthly' 
                                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                                style={period === 'monthly' ? { color: primaryColor } : {}}
                            >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>شهري (آخر ٣٠ يوماً)</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Summary Grid */}
                    <div className="grid grid-cols-3 gap-2 shrink-0">
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-black/5 dark:border-white/5 shadow-xs text-center flex flex-col items-center justify-center">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-0.5">الإجمالي</span>
                            <span className="text-base sm:text-lg font-black leading-tight" style={{ color: primaryColor }}>
                                {toArabicNumerals(statsSummary.total)}
                            </span>
                            <span className="text-[9px] opacity-60">تسبيحة</span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-black/5 dark:border-white/5 shadow-xs text-center flex flex-col items-center justify-center">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-0.5">المتوسط اليومي</span>
                            <span className="text-base sm:text-lg font-black leading-tight" style={{ color: secondaryColor }}>
                                {toArabicNumerals(statsSummary.average)}
                            </span>
                            <span className="text-[9px] opacity-60">تسبيحة / يوم</span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-black/5 dark:border-white/5 shadow-xs text-center flex flex-col items-center justify-center">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-0.5">أعلى يوم</span>
                            <span className="text-base sm:text-lg font-black leading-tight text-amber-600 dark:text-amber-400">
                                {toArabicNumerals(statsSummary.max)}
                            </span>
                            <span className="text-[9px] opacity-60 font-bold">
                                {statsSummary.peakDay ? statsSummary.peakDay.dayName : '—'}
                            </span>
                        </div>
                    </div>

                    {/* Interactive SVG Chart Box */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-gray-800/80 border border-black/5 dark:border-white/5 shadow-xs flex flex-col">
                        {/* Selected Day Info Banner */}
                        {activeSelectedDay && (
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5 text-xs">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <span className="text-amber-500">✨</span>
                                    <span>{activeSelectedDay.isToday ? 'اليوم' : activeSelectedDay.dayName}</span>
                                    <span className="text-[11px] text-gray-500 font-normal">({activeSelectedDay.formattedDate})</span>
                                </div>
                                <div className="flex items-center gap-1 font-bold" style={{ color: primaryColor }}>
                                    <span className="text-sm font-black">{toArabicNumerals(activeSelectedDay.count)}</span>
                                    <span className="text-[10px] font-normal">تسبيحة</span>
                                </div>
                            </div>
                        )}

                        {/* SVG Chart */}
                        <div className="w-full relative" dir="ltr">
                            <svg 
                                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                                className="w-full h-40 sm:h-44 overflow-visible"
                            >
                                <defs>
                                    <linearGradient id="tasbeehBarGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                                        <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.7" />
                                    </linearGradient>
                                    <linearGradient id="tasbeehBarTodayGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
                                    </linearGradient>
                                </defs>

                                {/* Horizontal Guidelines */}
                                {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
                                    const y = chartTopPadding + usableHeight * (1 - pct);
                                    return (
                                        <g key={idx}>
                                            <line 
                                                x1="0" 
                                                y1={y} 
                                                x2={svgWidth} 
                                                y2={y} 
                                                stroke="currentColor" 
                                                strokeDasharray="3 3" 
                                                className="text-gray-200 dark:text-gray-700" 
                                                strokeWidth="0.8"
                                            />
                                            <text 
                                                x="4" 
                                                y={y - 3} 
                                                className="text-[8px] fill-gray-400 dark:fill-gray-500 font-sans"
                                            >
                                                {toArabicNumerals(Math.round(maxVal * pct))}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Base Line */}
                                <line 
                                    x1="0" 
                                    y1={svgHeight - chartBottomPadding} 
                                    x2={svgWidth} 
                                    y2={svgHeight - chartBottomPadding} 
                                    stroke="currentColor" 
                                    className="text-gray-300 dark:text-gray-600" 
                                    strokeWidth="1"
                                />

                                {/* Bars */}
                                {chartData.map((item, index) => {
                                    const barHeight = statsSummary.max > 0 
                                        ? Math.max(3, (item.count / maxVal) * usableHeight)
                                        : 3;
                                    const x = index * barSpacing + (barSpacing - barWidth) / 2;
                                    const y = (svgHeight - chartBottomPadding) - barHeight;
                                    const isSelected = selectedDayIndex === index;

                                    return (
                                        <g 
                                            key={index} 
                                            className="cursor-pointer group"
                                            onClick={() => setSelectedDayIndex(index)}
                                        >
                                            {/* Click target area */}
                                            <rect 
                                                x={index * barSpacing} 
                                                y={0} 
                                                width={barSpacing} 
                                                height={svgHeight} 
                                                fill="transparent" 
                                            />

                                            {/* Bar Rect */}
                                            <rect
                                                x={x}
                                                y={y}
                                                width={barWidth}
                                                height={barHeight}
                                                rx={period === 'weekly' ? 4 : 2}
                                                fill={item.isToday ? 'url(#tasbeehBarTodayGrad)' : (item.count > 0 ? 'url(#tasbeehBarGrad)' : 'currentColor')}
                                                className={`transition-all duration-300 ${
                                                    item.count === 0 
                                                        ? 'text-gray-200 dark:text-gray-700 opacity-60' 
                                                        : (isSelected ? 'opacity-100 filter brightness-110' : 'opacity-90 hover:opacity-100')
                                                }`}
                                                stroke={isSelected ? (isBlackTheme ? '#FFFFFF' : '#000000') : (item.isToday ? '#f59e0b' : 'none')}
                                                strokeWidth={isSelected ? 1.5 : (item.isToday ? 1 : 0)}
                                            />

                                            {/* Bar top label for weekly */}
                                            {period === 'weekly' && item.count > 0 && (
                                                <text
                                                    x={x + barWidth / 2}
                                                    y={Math.max(12, y - 4)}
                                                    textAnchor="middle"
                                                    className="text-[9px] font-bold fill-gray-700 dark:fill-gray-200"
                                                >
                                                    {toArabicNumerals(item.count)}
                                                </text>
                                            )}

                                            {/* X Axis Label */}
                                            {period === 'weekly' ? (
                                                <text
                                                    x={x + barWidth / 2}
                                                    y={svgHeight - 10}
                                                    textAnchor="middle"
                                                    className={`text-[9px] font-medium transition-colors ${
                                                        item.isToday 
                                                            ? 'fill-amber-600 dark:fill-amber-400 font-bold' 
                                                            : 'fill-gray-500 dark:fill-gray-400'
                                                    }`}
                                                >
                                                    {item.shortDayName}
                                                </text>
                                            ) : (
                                                // For monthly, show every 5th day label plus today
                                                (index % 5 === 0 || item.isToday) && (
                                                    <text
                                                        x={x + barWidth / 2}
                                                        y={svgHeight - 10}
                                                        textAnchor="middle"
                                                        className={`text-[8px] font-medium ${
                                                            item.isToday 
                                                                ? 'fill-amber-600 dark:fill-amber-400 font-bold' 
                                                                : 'fill-gray-400 dark:fill-gray-500'
                                                        }`}
                                                    >
                                                        {item.dayNumber}
                                                    </text>
                                                )
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                        <span className="text-[10px] text-center text-gray-400 dark:text-gray-500 mt-1">
                            انقر على أي عمود لعرض تفاصيل ذلك اليوم
                        </span>
                    </div>

                    {/* Day-by-Day Detailed Log */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span>سجل التسبيح يوماً بيوم</span>
                            </h4>
                            <span className="text-[10px] text-gray-400 font-bold">
                                {period === 'weekly' ? '٧ أيام' : '٣٠ يوماً'}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            {[...chartData].reverse().map((item, idx) => {
                                const percentOfMax = statsSummary.max > 0 ? (item.count / statsSummary.max) * 100 : 0;
                                const isSelected = activeSelectedDay?.date === item.date;

                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => {
                                            const origIdx = chartData.findIndex(d => d.date === item.date);
                                            setSelectedDayIndex(origIdx);
                                        }}
                                        className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                            isSelected 
                                                ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/10' 
                                                : 'bg-white dark:bg-gray-800/80 border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {/* Day & Date */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {item.isToday ? 'اليوم' : item.dayName}
                                                </span>
                                                {item.isToday && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                                                        الحالي
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                                    ({item.formattedDate})
                                                </span>
                                            </div>

                                            {/* Mini progress bar */}
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ 
                                                        width: `${percentOfMax}%`,
                                                        backgroundColor: item.isToday ? '#f59e0b' : primaryColor
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Count number */}
                                        <div className="text-left shrink-0">
                                            <span className="text-sm font-black" style={{ color: item.isToday ? '#f59e0b' : primaryColor }}>
                                                {toArabicNumerals(item.count)}
                                            </span>
                                            <span className="text-[10px] text-gray-400 mr-1">تسبيحة</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </main>

                {/* Bottom Bar with Home button */}
                <BottomBar onHomeClick={onClose} onThemesClick={() => {}} showThemes={false} />
            </motion.div>
        </AnimatePresence>
    );
};

export default TasbeehChartModal;
