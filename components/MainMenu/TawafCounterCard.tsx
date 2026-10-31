import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { getTawafCounterState, saveTawafCounterState, subscribeTawafCounter, TawafCounterState } from '../../utils/tawafCounterStorage';
import { useLanguage } from '../../context/LanguageContext';

interface TawafCounterCardProps {
  theme?: any;
  isGolden?: boolean;
  onNavigate?: (pageId: string, params?: any) => void;
}

export const TawafCounterCard: React.FC<TawafCounterCardProps> = ({ theme, isGolden = false, onNavigate }) => {
  const { language, dir, t, formatNumber } = useLanguage();
  const [state, setState] = useState<TawafCounterState>(getTawafCounterState());
  const isEn = language === 'en';

  useEffect(() => {
    return subscribeTawafCounter((updated) => {
      setState(updated);
    });
  }, []);

  if (!state.showOnHome) {
    return null;
  }

  const isBlackTheme = !isGolden && (theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black');
  const primaryAccent = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || '#10b981');
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

  // --- التصميم الذكي الحديث (البطاقات الذهبية 3D) ---
  if (isGolden) {
    return (
      <div
        id="modern-tawaf-counter-card"
        className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all duration-300 flex flex-col gap-3.5"
        style={{ fontFamily: "'Cairo', sans-serif" }}
        dir={dir}
      >
        {/* 1. الترويسة مع العنوان وأزرار التبديل وزر إعادة الضبط */}
        <div className="flex items-center justify-between w-full relative gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-300/80 flex items-center justify-center shrink-0 shadow-2xs">
              <RotateCcw className="w-4 h-4 text-amber-800" />
            </div>
            <span className="text-sm sm:text-base font-bold text-[#451A03] font-cairo truncate">
              {isEn ? 'Laps Counter' : 'عداد الأشواط'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* مبدل الطواف / السعي بألوان البطاقات الذهبية */}
            <div className="flex p-0.5 rounded-xl golden-3d-inset text-[11px] font-bold">
              <button
                type="button"
                onClick={(e) => handleSwitchTab('tawaf', e)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  state.activeTab === 'tawaf'
                    ? 'golden-3d-btn font-extrabold shadow-2xs'
                    : 'text-amber-950/80 hover:text-amber-950'
                }`}
              >
                {isEn ? 'Tawaf' : 'الطواف'}
              </button>
              <button
                type="button"
                onClick={(e) => handleSwitchTab('sai', e)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  state.activeTab === 'sai'
                    ? 'golden-3d-btn font-extrabold shadow-2xs'
                    : 'text-amber-950/80 hover:text-amber-950'
                }`}
              >
                {isEn ? "Sa'i" : 'السعي'}
              </button>
            </div>

            {/* زر إعادة ضبط العداد بالنمط الذهبي الفاتح */}
            <button
              type="button"
              onClick={handleReset}
              title={t('tawaf.reset_tooltip', 'إعادة ضبط العداد')}
              className="w-8 h-8 rounded-xl golden-3d-btn-light flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-900" />
            </button>
          </div>
        </div>

        {/* 2. مؤشر الأشواط السبعة (7 Laps Stepper Dots) بنمط ذهبي مجسم */}
        <div className="flex items-center justify-between gap-1.5 px-0.5 py-1">
          {[1, 2, 3, 4, 5, 6, 7].map((lap) => {
            const isPassed = lap <= currentCount;
            const isCurrent = lap === currentCount + 1 && !isComplete;

            return (
              <div key={lap} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full h-3.5 rounded-full transition-all duration-300 ${
                    isPassed
                      ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 shadow-2xs'
                      : isCurrent
                      ? 'bg-white ring-2 ring-amber-500 ring-offset-1 animate-pulse shadow-2xs'
                      : 'golden-3d-inset opacity-50'
                  }`}
                />
                <span 
                  className={`text-[10px] font-mono font-bold ${
                    isPassed || isCurrent ? 'text-amber-950 font-black' : 'text-amber-900/40'
                  }`}
                >
                  {formatNumber(lap)}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3. زر الضغط الرئيسي لاحتساب الشوط بالزر الذهبي المجسم 3D */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleIncrement()}
            disabled={isComplete}
            className={`w-full py-2.5 px-4 rounded-2xl font-extrabold flex items-center justify-between transition-all select-none ${
              isComplete
                ? 'cursor-default shadow-none bg-emerald-600 text-white'
                : 'active:scale-[0.98] cursor-pointer golden-3d-pill-btn'
            }`}
          >
            <div className="w-full flex items-center justify-center text-center">
              <span className="text-sm sm:text-base font-extrabold leading-tight font-cairo text-white flex items-center gap-1.5 justify-center">
                {isComplete ? (
                  t('tawaf.completed_title', 'اكتملت 7 أشواط مباركة!')
                ) : language === 'en' ? (
                  <>
                    <span>Record Lap</span>
                    <span className="text-lg sm:text-xl font-black">({formatNumber(currentCount)})</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الشوط</span>
                    <span className="text-lg sm:text-xl font-black">({formatNumber(currentCount)})</span>
                  </>
                )}
              </span>
            </div>
          </button>

          {/* 4. زرين بصف واحد: الحج والعمرة (يمين) - أدعية وأذكار (يسار) بنفس لون زر تسجيل الشوط */}
          <div className="flex items-center justify-center gap-2 w-full" dir={dir}>
            <button
              type="button"
              onClick={() => onNavigate?.('hajj-umrah')}
              className="w-auto py-1.5 px-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all golden-3d-pill-btn cursor-pointer text-white shadow-none"
            >
              <span className="text-white font-extrabold font-cairo whitespace-nowrap">
                {isEn ? 'Hajj & Umrah' : 'الحج والعمرة'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('hajj-umrah', { screen: 'duaa' })}
              className="w-auto py-1.5 px-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all golden-3d-pill-btn cursor-pointer text-white shadow-none"
            >
              <span className="text-white font-extrabold font-cairo whitespace-nowrap">
                {isEn ? 'Duas & Adhkar' : 'أدعية وأذكار'}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- التصميم الكلاسيكي الأصلي ---
  return (
    <div
      className={`w-full mt-2 py-3.5 px-4 sm:px-5 relative overflow-hidden flex flex-col gap-3 select-none ${
        isBlackTheme ? 'bg-[#18181b] text-white tactile-3d-card-dark' : 'bg-white tactile-3d-card-light'
      }`}
      style={{
        fontFamily: theme?.font
      }}
      dir={dir}
    >
      {/* 3D Glossy specular sheen */}
      <div className="absolute inset-x-2 top-0.5 h-[35%] rounded-t-[18px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none" />
      <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/10 rounded-b-[20px] pointer-events-none" />

      {/* 1. Header with Mode Tabs, Quick reset and Title */}
      <div className="flex items-center justify-between z-10 w-full relative gap-2">
        <span className="text-sm md:text-base font-bold font-kufi truncate" style={{ color: primaryAccent }}>
          {isEn ? 'Laps Counter' : 'عداد الأشواط'}
        </span>

        {/* Controls: Tawaf/Sai Toggle + Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tab Selector */}
          <div className="flex p-0.5 rounded-xl bg-black/5 dark:bg-white/10 text-[11px] font-bold shadow-inner">
            <button
              onClick={(e) => handleSwitchTab('tawaf', e)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                state.activeTab === 'tawaf'
                  ? (isBlackTheme ? 'bg-white text-black shadow-xs' : 'shadow-xs text-white')
                  : 'opacity-60'
              }`}
              style={{
                backgroundColor: state.activeTab === 'tawaf' ? (isBlackTheme ? '#FFFFFF' : primaryAccent) : 'transparent',
                color: state.activeTab === 'tawaf' ? (isBlackTheme ? '#000000' : '#FFFFFF') : 'var(--text-color)',
                boxShadow: state.activeTab === 'tawaf' ? '0 2px 0 rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)' : 'none'
              }}
            >
              {isEn ? 'Tawaf' : 'الطواف'}
            </button>
            <button
              onClick={(e) => handleSwitchTab('sai', e)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                state.activeTab === 'sai'
                  ? (isBlackTheme ? 'bg-white text-black shadow-xs' : 'shadow-xs text-white')
                  : 'opacity-60'
              }`}
              style={{
                backgroundColor: state.activeTab === 'sai' ? (isBlackTheme ? '#FFFFFF' : primaryAccent) : 'transparent',
                color: state.activeTab === 'sai' ? (isBlackTheme ? '#000000' : '#FFFFFF') : 'var(--text-color)',
                boxShadow: state.activeTab === 'sai' ? '0 2px 0 rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)' : 'none'
              }}
            >
              {isEn ? "Sa'i" : 'السعي'}
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            title={t('tawaf.reset_tooltip', 'إعادة ضبط العداد')}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all text-gray-600 dark:text-gray-300 active:scale-90"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.08)' : '#f8fafc',
              boxShadow: '0 2px 0 rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.7)'
            }}
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
      <div className="w-full flex flex-col gap-2">
        <button
          onClick={() => handleIncrement()}
          disabled={isComplete}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold flex items-center justify-between transition-all relative overflow-hidden select-none ${
            isComplete
              ? 'bg-emerald-600 text-white cursor-default'
              : 'active:scale-[0.98] active:translate-y-0.5 cursor-pointer'
          }`}
          style={{
            backgroundColor: isComplete
              ? '#16a34a'
              : (isBlackTheme ? '#FFFFFF' : primaryAccent),
            color: isComplete
              ? '#FFFFFF'
              : (isBlackTheme ? '#000000' : '#FFFFFF'),
            boxShadow: isBlackTheme
              ? '0 4.5px 0 #222222, 0 8px 16px rgba(0, 0, 0, 0.6), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.3)'
              : '0 4.5px 0 rgba(0, 0, 0, 0.22), 0 8px 16px rgba(0, 0, 0, 0.15), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65)',
            border: 'none',
          }}
        >
          {/* 3D Glossy specular sheen across top half */}
          <div className="absolute inset-x-1 top-0.5 h-[45%] rounded-t-[14px] bg-gradient-to-b from-white/35 via-white/12 to-transparent pointer-events-none" />
          <div className="absolute inset-x-3 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none" />
          <div className="absolute inset-x-2 bottom-0 h-[2px] bg-black/15 rounded-b-2xl pointer-events-none" />
          <div className="w-full flex items-center justify-center text-center">
            <span className="text-sm sm:text-base font-bold leading-tight font-kufi flex items-center gap-1.5 justify-center">
              {isComplete ? (
                t('tawaf.completed_title', 'اكتملت 7 أشواط مباركة!')
              ) : language === 'en' ? (
                <>
                  <span>Record Lap</span>
                  <span className="text-lg sm:text-xl font-black">({formatNumber(currentCount)})</span>
                </>
              ) : (
                <>
                  <span>تسجيل الشوط</span>
                  <span className="text-lg sm:text-xl font-black">({formatNumber(currentCount)})</span>
                </>
              )}
            </span>
          </div>
        </button>

        {/* 4. Navigation Buttons: Hajj & Umrah / Duas & Adhkar */}
        <div className="flex items-center justify-center gap-2 w-full" dir={dir}>
          <button
            type="button"
            onClick={() => onNavigate?.('hajj-umrah')}
            className="w-auto py-1.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer text-center"
            style={{
              backgroundColor: isBlackTheme ? '#FFFFFF' : primaryAccent,
              color: isBlackTheme ? '#000000' : '#FFFFFF',
              boxShadow: isBlackTheme
                ? '0 3.5px 0 #222222, 0 6px 12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                : '0 3.5px 0 rgba(0, 0, 0, 0.2), 0 6px 12px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              border: 'none',
            }}
          >
            <span className="whitespace-nowrap font-kufi">{isEn ? 'Hajj & Umrah' : 'الحج والعمرة'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('hajj-umrah', { screen: 'duaa' })}
            className="w-auto py-1.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer text-center"
            style={{
              backgroundColor: isBlackTheme ? '#FFFFFF' : primaryAccent,
              color: isBlackTheme ? '#000000' : '#FFFFFF',
              boxShadow: isBlackTheme
                ? '0 3.5px 0 #222222, 0 6px 12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                : '0 3.5px 0 rgba(0, 0, 0, 0.2), 0 6px 12px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              border: 'none',
            }}
          >
            <span className="whitespace-nowrap font-kufi">{isEn ? 'Duas & Adhkar' : 'أدعية وأذكار'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TawafCounterCard;
