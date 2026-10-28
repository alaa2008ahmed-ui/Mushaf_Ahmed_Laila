import React, { useMemo } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment-hijri';
import { useHabitTracker } from '../../hooks/useHabitTracker';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface HabitTrackerCardProps {
  theme?: any;
  onNavigate: (pageId: string, params?: any) => void;
}

export const HabitTrackerCard: React.FC<HabitTrackerCardProps> = ({
  theme: propTheme,
  onNavigate,
}) => {
  const { isRTL, dir, t, language, formatNumber } = useLanguage();
  const isEn = language === 'en';
  const { theme: contextTheme, themeKey } = useTheme();
  const theme = propTheme || contextTheme;

  const { getDailyProgress, records } = useHabitTracker();

  // Dates: Today, Yesterday, Day Before Yesterday
  const todayStr = useMemo(() => moment().format('YYYY-MM-DD'), []);
  const yesterdayStr = useMemo(() => moment().subtract(1, 'days').format('YYYY-MM-DD'), []);
  const beforeYesterdayStr = useMemo(() => moment().subtract(2, 'days').format('YYYY-MM-DD'), []);

  // Total percentages (re-calculated whenever records change)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const todayProgress = useMemo(() => getDailyProgress(todayStr), [records, todayStr]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const yesterdayProgress = useMemo(() => getDailyProgress(yesterdayStr), [records, yesterdayStr]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const beforeYesterdayProgress = useMemo(() => getDailyProgress(beforeYesterdayStr), [records, beforeYesterdayStr]);

  // Modern flat design palette & Black Theme support
  const isBlackTheme = themeKey === 'deep_black' || theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';
  const primaryColor = isBlackTheme ? '#10b981' : (theme?.palette?.[0] || '#2E7D5E');

  return (
    <div
      id="habit-tracker-card"
      dir={dir}
      onClick={() => onNavigate('habit-tracker')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate('habit-tracker');
        }
      }}
      className={`w-full p-5 sm:p-6 cursor-pointer relative overflow-hidden select-none flex flex-col gap-4 mt-2 ${
        isBlackTheme ? 'bg-[#18181b] text-white tactile-3d-card-dark' : 'bg-white tactile-3d-card-light'
      }`}
      title={isEn ? 'Click to open Worship Habit Tracker' : 'انقر لفتح سجل مربي العبادات'}
    >
      {/* 3D Glossy specular sheen */}
      <div className="absolute inset-x-2 top-0.5 h-[35%] rounded-t-[18px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none" />
      <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/10 rounded-b-[20px] pointer-events-none" />
      {/* 1. الترويسة (Header): أيقونة الصح + عنوان + شارة إنجاز اليوم + رابط السجل */}
      <div className="flex items-center justify-between w-full">
        {/* عنوان مربي العبادات مع أيقونة الصح وشارة إنجاز اليوم */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.2)' : `${primaryColor}14`,
              color: primaryColor,
            }}
          >
            <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
          </div>

          <span className={`text-xs sm:text-sm font-bold tracking-tight font-kufi ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
            {t('habit_card.title', 'مربي العبادات')}
          </span>

          {/* شارة إنجاز اليوم الأنيقة */}
          <span
            className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-tight transition-colors"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.2)' : `${primaryColor}12`,
              color: primaryColor,
            }}
          >
            {t('habit_card.today_badge', 'إنجاز اليوم')}
          </span>
        </div>

        {/* سهم التنقل لفتح السجل */}
        <div
          className="flex items-center gap-1 transition-colors cursor-pointer text-xs font-semibold"
          style={{ color: primaryColor }}
        >
          <span className="text-[11px] hidden sm:inline">
            {isEn ? 'Open Log' : 'فتح السجل'}
          </span>
          {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>

      {/* 2. قسم نسبة الإنجاز وشريط التقدم الأفقي (بدون زر ابدأ عبادات اليوم لتخفيف الحجم والازدحام) */}
      <div className="flex flex-col gap-2 w-full">
        {/* نسبة إنجاز اليوم مع النسبة المئوية */}
        <div className="flex items-baseline gap-2">
          <span
            className="text-2xl sm:text-3xl font-black font-sans tracking-tight"
            style={{ color: primaryColor }}
          >
            {formatNumber ? formatNumber(todayProgress) : todayProgress}%
          </span>
          <span className={`text-xs sm:text-sm font-bold font-kufi ${isBlackTheme ? 'text-zinc-300' : 'text-slate-500'}`}>
            {t('habit_card.completion_rate', 'نسبة إنجاز اليوم')}
          </span>
        </div>

        {/* شريط تقدم أفقي (Linear Progress Bar) عصري بزوايا دائرية كاملة */}
        <div className={`w-full h-2.5 rounded-full overflow-hidden relative ${isBlackTheme ? 'bg-zinc-800' : 'bg-slate-100'}`}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(todayProgress > 0 ? todayProgress : 2, 2)}%`,
              background: `linear-gradient(90deg, ${primaryColor}, #10b981)`,
            }}
          />
        </div>
      </div>

      {/* 3. قسم الملخص السفلي (Footer): خط فاصل رقيق ورقاقات الأيام السابقة */}
      <div className={`pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${isBlackTheme ? 'border-zinc-800' : 'border-slate-100'}`}>
        {/* نص ملخص الأيام السابقة */}
        <span className={`text-xs font-semibold font-kufi shrink-0 ${isBlackTheme ? 'text-zinc-400' : 'text-slate-500'}`}>
          {t('habit_card.prev_summary', 'ملخص الأيام السابقة:')}
        </span>

        {/* رقاقات الأيام السابقة (Chips / Tags) مسطحة وأنيقة متوافقة مع الثيمين */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* رقاقة اليوم السابق */}
          <div
            className={`flex items-center gap-1.5 py-1 px-3 rounded-xl transition-colors text-xs ${
              isBlackTheme 
                ? 'bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50' 
                : 'bg-slate-50 hover:bg-slate-100/80'
            }`}
            title={isEn ? 'Yesterday total completion' : 'إجمالي اليوم السابق'}
          >
            <span className={isBlackTheme ? 'text-zinc-300 font-medium' : 'text-slate-600 font-medium'}>
              {t('habit_card.yesterday', 'اليوم السابق:')}
            </span>
            <span
              className="font-sans font-black text-xs sm:text-sm"
              style={{ color: primaryColor }}
            >
              {formatNumber ? formatNumber(yesterdayProgress) : yesterdayProgress}%
            </span>
          </div>

          {/* رقاقة اليوم الذي قبله */}
          <div
            className={`flex items-center gap-1.5 py-1 px-3 rounded-xl transition-colors text-xs ${
              isBlackTheme 
                ? 'bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50' 
                : 'bg-slate-50 hover:bg-slate-100/80'
            }`}
            title={isEn ? 'Day before yesterday total completion' : 'إجمالي اليوم الذي قبله'}
          >
            <span className={isBlackTheme ? 'text-zinc-300 font-medium' : 'text-slate-600 font-medium'}>
              {t('habit_card.before_yesterday', 'الذي قبله:')}
            </span>
            <span
              className="font-sans font-black text-xs sm:text-sm"
              style={{ color: primaryColor }}
            >
              {formatNumber ? formatNumber(beforeYesterdayProgress) : beforeYesterdayProgress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerCard;
