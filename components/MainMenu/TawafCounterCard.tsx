import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { getTawafCounterState, saveTawafCounterState, subscribeTawafCounter, TawafCounterState } from '../../utils/tawafCounterStorage';
import { useLanguage } from '../../context/LanguageContext';

interface TawafCounterCardProps {
  theme: any;
  onNavigate?: (pageId: string, params?: any) => void;
}

export const TawafCounterCard: React.FC<TawafCounterCardProps> = ({ theme }) => {
  const { language, dir, t, formatNumber } = useLanguage();
  const [state, setState] = useState<TawafCounterState>(getTawafCounterState());

  useEffect(() => {
    return subscribeTawafCounter((updated) => {
      setState(updated);
    });
  }, []);

  if (!state.showOnHome) {
    return null;
  }

  const isBlackTheme = theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';
  const primaryAccent = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || '#10b981');
  const cardBg = theme?.cardBg || 'rgba(255, 255, 255, 0.85)';
  const currentCount = state.activeTab === 'tawaf' ? state.tawafCount : state.saiCount;
  const isComplete = currentCount >= 7;

  const handleIncrement = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentCount >= 7) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(40); } catch {}
    }

    saveTawafCounterState(prev => {
      if (prev.activeTab === 'tawaf') {
        const next = Math.min(7, prev.tawafCount + 1);
        return { ...prev, tawafCount: next };
      } else {
        const next = Math.min(7, prev.saiCount + 1);
        return { ...prev, saiCount: next };
      }
    });
  };

  const handleReset = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(30); } catch {}
    }
    saveTawafCounterState(prev => {
      if (prev.activeTab === 'tawaf') {
        return { ...prev, tawafCount: 0 };
      } else {
        return { ...prev, saiCount: 0 };
      }
    });
  };

  const handleSwitchTab = (tab: 'tawaf' | 'sai', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    saveTawafCounterState({ activeTab: tab });
  };

  return (
    <div
      className="w-full mt-2 py-3.5 px-4 sm:px-5 rounded-2xl shadow-lg border-2 relative overflow-hidden flex flex-col gap-3 transition-all duration-300"
      style={{
        borderColor: primaryAccent,
        backgroundColor: cardBg,
        fontFamily: theme?.font
      }}
      dir={dir}
    >
      {/* 1. Header with Mode Tabs, Quick reset and Title */}
      <div className="flex items-center justify-between z-10 w-full relative gap-2">
        <span className="text-sm md:text-base font-bold font-kufi truncate" style={{ color: primaryAccent }}>
          {state.activeTab === 'tawaf' ? t('tawaf.title', 'عداد أشواط الطواف') : t('sai.title', 'عداد أشواط السعي')}
        </span>

        {/* Controls: Tawaf/Sai Toggle + Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tab Selector */}
          <div className="flex p-0.5 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 text-[11px] font-bold">
            <button
              onClick={(e) => handleSwitchTab('tawaf', e)}
              className={`px-2 py-1 rounded-md transition-all ${
                state.activeTab === 'tawaf'
                  ? (isBlackTheme ? 'bg-white text-black shadow-sm' : 'shadow-sm text-white')
                  : 'opacity-60'
              }`}
              style={{
                backgroundColor: state.activeTab === 'tawaf' ? (isBlackTheme ? '#FFFFFF' : primaryAccent) : 'transparent',
                color: state.activeTab === 'tawaf' ? (isBlackTheme ? '#000000' : '#FFFFFF') : 'var(--text-color)'
              }}
            >
              {t('tawaf.tab', 'طواف')}
            </button>
            <button
              onClick={(e) => handleSwitchTab('sai', e)}
              className={`px-2 py-1 rounded-md transition-all ${
                state.activeTab === 'sai'
                  ? (isBlackTheme ? 'bg-white text-black shadow-sm' : 'shadow-sm text-white')
                  : 'opacity-60'
              }`}
              style={{
                backgroundColor: state.activeTab === 'sai' ? (isBlackTheme ? '#FFFFFF' : primaryAccent) : 'transparent',
                color: state.activeTab === 'sai' ? (isBlackTheme ? '#000000' : '#FFFFFF') : 'var(--text-color)'
              }}
            >
              {t('sai.tab', 'سعي')}
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            title={t('tawaf.reset_tooltip', 'إعادة ضبط العداد')}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 active:scale-90 transition-all text-gray-500 dark:text-gray-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Visual 7 Laps Stepper Dots */}
      <div className="flex items-center justify-between gap-1.5 px-0.5 py-1">
        {[1, 2, 3, 4, 5, 6, 7].map((lap) => {
          const isPassed = lap <= currentCount;
          const isCurrent = lap === currentCount + 1 && !isComplete;

          return (
            <div key={lap} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-3.5 rounded-full transition-all duration-300 ${
                  isPassed
                    ? 'shadow-sm'
                    : isCurrent
                    ? 'ring-2 ring-amber-400 ring-offset-1 animate-pulse shadow-sm'
                    : 'bg-black/10 dark:bg-white/10 opacity-35'
                }`}
                style={{
                  backgroundColor: isPassed
                    ? (isBlackTheme ? '#FFFFFF' : primaryAccent)
                    : isCurrent
                    ? '#f59e0b'
                    : undefined
                }}
              />
              <span className={`text-[10px] font-mono font-bold ${isPassed || isCurrent ? 'opacity-95' : 'opacity-40'}`} style={{ color: 'var(--text-color)' }}>
                {formatNumber(lap)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Main Lap Counter */}
      <div className="w-full">
        <button
          onClick={() => handleIncrement()}
          disabled={isComplete}
          className={`w-full py-3.5 px-5 rounded-2xl font-bold flex items-center justify-between shadow-md transition-all ${
            isComplete
              ? 'bg-emerald-600 text-white cursor-default'
              : 'active:scale-[0.98] cursor-pointer'
          }`}
          style={{
            backgroundColor: isComplete
              ? '#16a34a'
              : (isBlackTheme ? '#FFFFFF' : primaryAccent),
            color: isComplete
              ? '#FFFFFF'
              : (isBlackTheme ? '#000000' : '#FFFFFF')
          }}
        >
          <div className="text-start">
            <span className="block text-base md:text-lg font-bold leading-tight font-kufi">
              {isComplete 
                ? t('tawaf.completed_title', 'اكتملت 7 أشواط مباركة!') 
                : (language === 'en' 
                    ? `Record Lap (${formatNumber(currentCount + 1)})` 
                    : `تسجيل الشوط (${formatNumber(currentCount + 1)})`)}
            </span>
            <span className="block text-xs opacity-85 mt-1 font-medium">
              {isComplete ? t('tawaf.completed_subtitle', 'تقبل الله نسككم وطاعتكم') : t('tawaf.tap_hint', 'اضغط بعد كل شوط لاحتساب الرقم')}
            </span>
          </div>

          <div className="text-center font-mono">
            <span className="text-3xl font-black leading-none">{formatNumber(currentCount)}</span>
            <span className="block text-[10px] opacity-80 font-sans font-bold mt-0.5">{t('tawaf.of_seven', 'من 7')}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TawafCounterCard;
