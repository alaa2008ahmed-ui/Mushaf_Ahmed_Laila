import React, { useState, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { Theme } from '../../context/themes';
import { useLanguage } from '../../context/LanguageContext';
import { formatTasbeehNumber, tTasbeeh } from '../../utils/tasbeehTranslations';
import moment from 'moment-hijri';

interface TasbeehChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    dailyStats: { date: string; count: number }[];
    theme: Theme;
    themeKey: string;
    onNavigate?: (pageId: string) => void;
}

type PeriodType = 'weekly' | 'monthly';

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_DAYS_SHORT = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ENGLISH_DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];
const ENGLISH_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const TasbeehChartModal: React.FC<TasbeehChartModalProps> = ({
    isOpen,
    onClose,
    dailyStats = [],
    theme,
    themeKey,
    onNavigate
}) => {
    const { language, isRTL, dir } = useLanguage();
    const [period, setPeriod] = useState<PeriodType>('weekly');
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const secondaryColor = isBlackTheme ? '#d1d5db' : (theme.palette?.[1] || '#059669');
    const cardBorderColor = isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';
    const todayStr = useMemo(() => moment().format('YYYY-MM-DD'), []);

    const isEn = language === 'en';

    // Build the dataset for the current week only (Sat-Fri) or current month only (1st to last day of month)
    const chartData = useMemo(() => {
        const today = moment().startOf('day');
        const result = [];

        let startDate: moment.Moment;
        let daysCount: number;

        if (period === 'weekly') {
            // Current week starting Saturday (Arab week convention used across the app)
            const dayOfWeek = today.day(); // 0=Sun, 1=Mon, ..., 6=Sat
            const daysSinceSaturday = (dayOfWeek + 1) % 7;
            startDate = today.clone().subtract(daysSinceSaturday, 'days');
            daysCount = 7;
        } else {
            // Current month only (from 1st of current month to last day of current month)
            startDate = today.clone().startOf('month');
            daysCount = today.daysInMonth();
        }

        for (let i = 0; i < daysCount; i++) {
            const dateObj = startDate.clone().add(i, 'days');
            const dateStr = dateObj.format('YYYY-MM-DD');
            const stat = dailyStats.find(s => s.date === dateStr);
            const count = stat ? stat.count : 0;
            const isToday = dateStr === todayStr;
            const isFuture = dateObj.isAfter(today, 'day');

            const jsDate = dateObj.toDate();
            const dayOfWeek = jsDate.getDay();
            const dayOfMonth = jsDate.getDate();
            const monthIdx = jsDate.getMonth();

            const dayName = isEn ? ENGLISH_DAYS[dayOfWeek] : ARABIC_DAYS[dayOfWeek];
            const shortDayName = isEn ? ENGLISH_DAYS_SHORT[dayOfWeek] : ARABIC_DAYS_SHORT[dayOfWeek];
            const monthName = isEn ? ENGLISH_MONTHS[monthIdx] : ARABIC_MONTHS[monthIdx];

            result.push({
                date: dateStr,
                count,
                isToday,
                isFuture,
                dayName,
                shortDayName,
                dayNumber: formatTasbeehNumber(dayOfMonth, language),
                formattedDate: isEn ? `${monthName} ${dayOfMonth}` : `${formatTasbeehNumber(dayOfMonth, language)} ${monthName}`,
                shortDate: isEn ? `${monthIdx + 1}/${dayOfMonth}` : `${formatTasbeehNumber(dayOfMonth, language)}/${formatTasbeehNumber(monthIdx + 1, language)}`
            });
        }

        return result;
    }, [period, dailyStats, todayStr, isEn, language]);

    // Summary calculations
    const statsSummary = useMemo(() => {
        const total = chartData.reduce((acc, curr) => acc + curr.count, 0);
        const daysWithCount = chartData.filter(d => d.count > 0).length;
        const elapsedDays = chartData.filter(d => !d.isFuture).length || 1;
        const average = Math.round(total / elapsedDays);
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
        <div 
            className="fixed inset-0 z-50 flex flex-col text-gray-900 dark:text-gray-100"
            style={{ backgroundColor: isBlackTheme ? '#000000' : (theme.bgColor || (theme.isDark ? '#0F172A' : '#F5F7FA')) }}
            dir={dir}
        >
                {/* Full Screen Top Header */}
                <header className="app-top-bar shrink-0">
                    <div className="app-top-bar__inner">
                        <div className="relative flex items-center justify-center w-full min-h-[44px]">
                            {/* Back arrow */}
                            <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} flex items-center`}>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    title={isEn ? 'Back' : 'رجوع للخلف'}
                                    aria-label={isEn ? 'Back' : 'رجوع للخلف'}
                                >
                                    <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-xl`}></i>
                                </button>
                            </div>

                            {/* Page Title */}
                            <div className="text-center px-12 min-w-0">
                                <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate">
                                    {isEn ? 'Tasbeeh Chart' : 'مخطط التسبيح'}
                                </h1>
                            </div>

                            {/* Home icon */}
                            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} flex items-center gap-1`}>
                                <button
                                    onClick={() => {
                                        onClose();
                                        if (onNavigate) onNavigate('home');
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    title={isEn ? 'Home' : 'الصفحة الرئيسية'}
                                    aria-label={isEn ? 'Home' : 'الصفحة الرئيسية'}
                                >
                                    <i className="fa-solid fa-house text-xl"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <main 
                    className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 pt-3 pb-5 max-w-lg mx-auto w-full space-y-4 overscroll-contain app-scroll-safe"
                >
                    {/* Period Switcher (Weekly / Monthly) */}
                    <div className="shrink-0 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setPeriod('weekly');
                                setSelectedDayIndex(null);
                            }}
                            className={`app-page-card border-0 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                period === 'weekly' 
                                    ? 'bg-white dark:bg-[#1E293B]' 
                                    : 'bg-white/80 dark:bg-[#1E293B]/75 opacity-75 hover:opacity-100'
                            }`}
                            style={{ color: period === 'weekly' ? primaryColor : (isBlackTheme ? '#d4d4d8' : '#64748b') }}
                        >
                            <span>{tTasbeeh('weeklyTab', language)}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setPeriod('monthly');
                                setSelectedDayIndex(null);
                            }}
                            className={`app-page-card border-0 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                period === 'monthly' 
                                    ? 'bg-white dark:bg-[#1E293B]' 
                                    : 'bg-white/80 dark:bg-[#1E293B]/75 opacity-75 hover:opacity-100'
                            }`}
                            style={{ color: period === 'monthly' ? primaryColor : (isBlackTheme ? '#d4d4d8' : '#64748b') }}
                        >
                            <span>{tTasbeeh('monthlyTab', language)}</span>
                        </button>
                    </div>

                    {/* Quick Stats Summary Grid */}
                    <div className="grid grid-cols-3 gap-2.5 shrink-0">
                        <div 
                            className="app-page-card border-0 p-2.5 rounded-2xl bg-white dark:bg-[#1E293B] text-center flex flex-col items-center justify-center transition-all"
                        >
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-0.5">
                                {isEn ? 'Total' : 'الإجمالي'}
                            </span>
                            <span className="text-base sm:text-lg font-black leading-tight" style={{ color: primaryColor }}>
                                {formatTasbeehNumber(statsSummary.total, language)}
                            </span>
                            <span className="text-[9px] opacity-60">
                                {isEn ? 'Tasbeeh' : 'تسبيحة'}
                            </span>
                        </div>

                        <div 
                            className="app-page-card border-0 p-2.5 rounded-2xl bg-white dark:bg-[#1E293B] text-center flex flex-col items-center justify-center transition-all"
                        >
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-0.5">
                                {isEn ? 'Daily Average' : 'المتوسط اليومي'}
                            </span>
                            <span className="text-base sm:text-lg font-black leading-tight" style={{ color: secondaryColor }}>
                                {formatTasbeehNumber(statsSummary.average, language)}
                            </span>
                            <span className="text-[9px] opacity-60">
                                {isEn ? 'Tasbeeh / day' : 'تسبيحة / يوم'}
                            </span>
                        </div>

                        <div 
                            className="app-page-card border-0 p-2.5 rounded-2xl bg-white dark:bg-[#1E293B] text-center flex flex-col items-center justify-center transition-all"
                        >
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-0.5">
                                {isEn ? 'Peak Day' : 'أعلى يوم'}
                            </span>
                            <span className="text-base sm:text-lg font-black leading-tight text-amber-600 dark:text-amber-400">
                                {formatTasbeehNumber(statsSummary.max, language)}
                            </span>
                            <span className="text-[9px] opacity-60 font-bold truncate max-w-[80px]">
                                {statsSummary.peakDay ? statsSummary.peakDay.dayName : '—'}
                            </span>
                        </div>
                    </div>

                    {/* Interactive SVG Chart Box */}
                    <div 
                        className="app-page-card border-0 p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] flex flex-col transition-all"
                    >
                        {/* Selected Day Info Banner */}
                        {activeSelectedDay && (
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5 text-xs">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <span className="text-amber-500">✨</span>
                                    <span>{activeSelectedDay.isToday ? (isEn ? 'Today' : 'اليوم') : activeSelectedDay.dayName}</span>
                                    <span className="text-[11px] text-gray-500 font-normal">({activeSelectedDay.formattedDate})</span>
                                </div>
                                <div className="flex items-center gap-1 font-bold" style={{ color: primaryColor }}>
                                    <span className="text-sm font-black">{formatTasbeehNumber(activeSelectedDay.count, language)}</span>
                                    <span className="text-[10px] font-normal">{isEn ? 'Tasbeeh' : 'تسبيحة'}</span>
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
                                                {formatTasbeehNumber(Math.round(maxVal * pct), language)}
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
                                                    {formatTasbeehNumber(item.count, language)}
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
                            {isEn ? 'Click on any bar to view day details' : 'انقر على أي عمود لعرض تفاصيل ذلك اليوم'}
                        </span>
                    </div>

                    {/* Day-by-Day Detailed Log */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span>{isEn ? 'Daily Tasbeeh Log' : 'سجل التسبيح يوماً بيوم'}</span>
                            </h4>
                            <span className="text-[10px] text-gray-400 font-bold">
                                {period === 'weekly' ? (isEn ? 'Current Week' : 'الأسبوع الحالي') : (isEn ? 'Current Month' : 'الشهر الحالي')}
                            </span>
                        </div>

                        <div className="space-y-2.5 pb-2">
                            {chartData.filter(d => !d.isFuture).reverse().map((item, idx) => {
                                const percentOfMax = statsSummary.max > 0 ? (item.count / statsSummary.max) * 100 : 0;
                                const isSelected = activeSelectedDay?.date === item.date;

                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => {
                                            const origIdx = chartData.findIndex(d => d.date === item.date);
                                            setSelectedDayIndex(origIdx);
                                        }}
                                        className={`app-page-card border-0 tasbeeh-pressable p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                            isSelected 
                                                ? 'bg-amber-50 dark:bg-[#27272a]' 
                                                : 'bg-white dark:bg-[#1E293B]'
                                        }`}
                                    >
                                        {/* Day & Date */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {item.isToday ? (isEn ? 'Today' : 'اليوم') : item.dayName}
                                                </span>
                                                {item.isToday && (
                                                    <span className="app-3d-badge border-0 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                                                        {isEn ? 'Current' : 'الحالي'}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                                    ({item.formattedDate})
                                                </span>
                                            </div>

                                            {/* Mini progress bar */}
                                            <div className="app-3d-progress-track border-0 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                                <div 
                                                    className="app-3d-progress-fill h-full rounded-full transition-all duration-500"
                                                    style={{ 
                                                        width: `${percentOfMax}%`,
                                                        backgroundColor: item.isToday ? '#f59e0b' : primaryColor
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Count number */}
                                        <div className="text-end shrink-0">
                                            <span className="text-sm font-black" style={{ color: item.isToday ? '#f59e0b' : primaryColor }}>
                                                {formatTasbeehNumber(item.count, language)}
                                            </span>
                                            <span className="text-[10px] text-gray-400 mx-1">
                                                {isEn ? 'Tasbeeh' : 'تسبيحة'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
    );
};

export default TasbeehChartModal;
