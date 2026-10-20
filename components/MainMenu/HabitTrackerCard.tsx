import React, { useMemo } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment-hijri';
import { useHabitTracker } from '../../hooks/useHabitTracker';
import { useLanguage } from '../../context/LanguageContext';

interface HabitTrackerCardProps {
  theme: any;
  onNavigate: (pageId: string, params?: any) => void;
}

export const HabitTrackerCard: React.FC<HabitTrackerCardProps> = ({
  theme,
  onNavigate,
}) => {
  const { isRTL, dir, t, language } = useLanguage();
  const isEn = language === 'en';
  const { getDailyProgress, records } = useHabitTracker();

  // Dates: Today, Yesterday (اليوم السابق), Day Before Yesterday (الذي قبله)
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

  // Theme styling helpers
  const isBlackTheme = theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';
  const primaryAccent = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || '#10b981');
  const textColor = isBlackTheme ? '#FFFFFF' : (theme?.textColor || '#1f2937');
  const cardBg = theme?.cardBg || 'rgba(255, 255, 255, 0.85)';

  return (
    <div
      className="w-full mt-2 py-3 px-4 sm:px-5 rounded-2xl shadow-lg border-2 relative overflow-hidden flex flex-col gap-2.5 cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.99]"
      style={{
        borderColor: primaryAccent,
        backgroundColor: cardBg,
        fontFamily: theme?.font
      }}
      dir={dir}
      onClick={() => onNavigate('habit-tracker')}
    >
      {/* 1. Header with Title & Navigation icon */}
      <div className="flex items-center justify-between z-10 w-full relative">
        <div className="flex items-center gap-2" style={{ color: primaryAccent }}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span className="text-[12px] font-bold font-kufi">{t('habit_card.title', 'مربي العبادات')}</span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold opacity-90"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.18)' : `${primaryAccent}15`,
              color: primaryAccent
            }}
          >
            {t('habit_card.today_badge', 'إنجاز اليوم')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold opacity-80 hover:opacity-100 transition-opacity" style={{ color: primaryAccent }}>
          <span className="text-[10px] hidden sm:inline">{isEn ? 'Open Log' : 'فتح السجل'}</span>
          {isRTL ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
        </div>
      </div>

      {/* 2. Compact Today's Progress Section (Progress bar + percentage + motivational badge) */}
      <div className="flex flex-col gap-1.5 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black font-sans tracking-tight" style={{ color: primaryAccent }}>
              {todayProgress}%
            </span>
            <span className="text-[10px] opacity-70 font-bold" style={{ color: textColor }}>
              {t('habit_card.completion_rate', 'نسبة إنجاز اليوم')}
            </span>
          </div>

          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: todayProgress >= 80 
                ? 'rgba(16, 185, 129, 0.18)' 
                : todayProgress >= 40 
                  ? 'rgba(234, 179, 8, 0.18)' 
                  : (isBlackTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(107, 114, 128, 0.12)'),
              color: todayProgress >= 80 
                ? '#10b981' 
                : todayProgress >= 40 
                  ? '#eab308' 
                  : (isBlackTheme ? '#FFFFFF' : '#6b7280')
            }}
          >
            {todayProgress === 100 
              ? t('habit_card.completed', 'مكتمل ما شاء الله 🌟')
              : todayProgress >= 70 
                ? t('habit_card.excellent', 'إنجاز ممتاز 🌿')
                : todayProgress > 0 
                  ? t('habit_card.in_progress', 'مستمر بالعمل 🤲')
                  : t('habit_card.start_today', 'ابدأ عبادات اليوم ✨')}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 relative">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(2, todayProgress)}%`,
              backgroundColor: isBlackTheme ? '#FFFFFF' : primaryAccent
            }}
          />
        </div>
      </div>

      {/* 3. Summary of Previous Day and Day Before (النسبة المئوية فقط) */}
      <div 
        className="pt-2 mt-0.5 border-t flex items-center justify-between gap-2 text-xs relative z-10"
        style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)' }}
      >
        <span className="text-[10px] font-bold opacity-75 shrink-0" style={{ color: textColor }}>
          {t('habit_card.prev_summary', 'ملخص الأيام السابقة:')}
        </span>

        <div className="flex items-center gap-2">
          {/* اليوم السابق (أمس) - النسبة المئوية فقط */}
          <div
            className="flex items-center gap-1.5 py-0.5 px-2 rounded-lg border font-bold text-[11px]"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)'
            }}
            title="إجمالي اليوم السابق"
          >
            <span className="text-[10px] opacity-75" style={{ color: textColor }}>{t('habit_card.yesterday', 'اليوم السابق:')}</span>
            <span className="font-sans font-black" style={{ color: primaryAccent }}>
              {yesterdayProgress}%
            </span>
          </div>

          {/* والذي قبله (أول أمس) - النسبة المئوية فقط */}
          <div
            className="flex items-center gap-1.5 py-0.5 px-2 rounded-lg border font-bold text-[11px]"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)'
            }}
            title="إجمالي اليوم الذي قبله"
          >
            <span className="text-[10px] opacity-75" style={{ color: textColor }}>{t('habit_card.before_yesterday', 'الذي قبله:')}</span>
            <span className="font-sans font-black" style={{ color: primaryAccent }}>
              {beforeYesterdayProgress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerCard;
