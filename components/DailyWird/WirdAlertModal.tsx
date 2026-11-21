import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { BookOpen, X, Volume2, VolumeX, ArrowLeft, ArrowRight, Sparkles, AlertCircle, Languages } from 'lucide-react';
import { playNotificationSound, stopNotificationSound, getActiveNotificationSoundPath } from '../../utils/prayerTimesUtils';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { WirdAlertData } from '../../utils/dailyWirdNotificationService';
import { triggerAlertVibration } from '../../utils/vibrationHelper';

interface WirdAlertModalProps {
  alert: WirdAlertData | null;
  onDismiss: () => void;
  onStartReading: (startPage: number, mode?: 'mushaf' | 'translation') => void;
  onOpenDailyWird: () => void;
}

export const WirdAlertModal: React.FC<WirdAlertModalProps> = ({
  alert,
  onDismiss,
  onStartReading,
  onOpenDailyWird
}) => {
  const { language, isRTL, dir } = useLanguage();
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const isEn = language === 'en';
  const [isPlayingSound, setIsPlayingSound] = useState(true);

  useEffect(() => {
    // Only play sound if on web/browser (never in native APK)
    if (alert && !Capacitor.isNativePlatform()) {
      // Vibrate and play chosen notification sound upon alert appearance
      triggerAlertVibration('alert');
      const sound = getActiveNotificationSoundPath();
      if (sound && sound !== 'none') {
        playNotificationSound(sound, true);
        setIsPlayingSound(true);
      } else {
        setIsPlayingSound(false);
      }
    }
    return () => {
      stopNotificationSound();
    };
  }, [alert]);

  // NEVER render inside native APK
  if (!alert || Capacitor.isNativePlatform()) return null;

  const isDark = Boolean(theme.isDark) || Boolean(isNightMode) || themeKey === 'black_gold' || theme.bgColor === '#000000';

  const accent = isDark
    ? {
        circleBg: 'radial-gradient(circle at 35% 30%, rgba(245, 158, 11, 0.25) 0%, #18181b 75%)',
        badgeCircleBg: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
        badgeCircleShadow: '0 3px 0 #92400e, 0 6px 12px rgba(217, 119, 6, 0.38), inset 0 1.5px 1px rgba(255,255,255,0.4)',
        pillBg: 'rgba(245, 158, 11, 0.16)',
        pillText: '#fbbf24',
        boxBg: 'rgba(245, 158, 11, 0.12)',
        boxText: '#fde68a',
        chipBg: 'rgba(245, 158, 11, 0.22)',
        chipText: '#fef3c7',
        primaryBtnBg: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
        primaryBtnShadow: '0 4.5px 0 #78350f, 0 10px 20px -4px rgba(217, 119, 6, 0.4), inset 0 1.5px 1px rgba(255, 255, 255, 0.35)',
      }
    : homeThemeVariant === 'sky'
      ? {
          circleBg: 'radial-gradient(circle at 35% 30%, #f0f9ff 0%, #bae6fd 100%)',
          badgeCircleBg: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
          badgeCircleShadow: '0 3px 0 #0369a1, 0 6px 12px rgba(2, 132, 199, 0.36), inset 0 1.5px 1px rgba(255,255,255,0.45)',
          pillBg: '#e0f2fe',
          pillText: '#0369a1',
          boxBg: '#f0f9ff',
          boxText: '#0c4a6e',
          chipBg: '#bae6FD',
          chipText: '#075985',
          primaryBtnBg: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
          primaryBtnShadow: '0 4.5px 0 #0369a1, 0 10px 20px -4px rgba(2, 132, 199, 0.42), inset 0 1.5px 1px rgba(255, 255, 255, 0.4)',
        }
      : homeThemeVariant === 'emerald'
        ? {
            circleBg: 'radial-gradient(circle at 35% 30%, #ecfdf5 0%, #d1fae5 100%)',
            badgeCircleBg: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
            badgeCircleShadow: '0 3px 0 #047857, 0 6px 12px rgba(5, 150, 105, 0.38), inset 0 1.5px 1px rgba(255,255,255,0.45)',
            pillBg: '#d1fae5',
            pillText: '#047857',
            boxBg: '#ecfdf5',
            boxText: '#064e3b',
            chipBg: '#a7f3d0',
            chipText: '#064e3b',
            primaryBtnBg: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
            primaryBtnShadow: '0 4.5px 0 #047857, 0 10px 20px -4px rgba(5, 150, 105, 0.42), inset 0 1.5px 1px rgba(255, 255, 255, 0.4)',
          }
        : homeThemeVariant === 'burgundy'
          ? {
              circleBg: 'radial-gradient(circle at 35% 30%, #fff1f2 0%, #fecdd3 100%)',
              badgeCircleBg: 'linear-gradient(180deg, #fb7185 0%, #e11d48 100%)',
              badgeCircleShadow: '0 3px 0 #9f1239, 0 6px 12px rgba(225, 29, 72, 0.36), inset 0 1.5px 1px rgba(255,255,255,0.45)',
              pillBg: '#ffe4e6',
              pillText: '#9f1239',
              boxBg: '#fff1f2',
              boxText: '#881337',
              chipBg: '#fecdd3',
              chipText: '#881337',
              primaryBtnBg: 'linear-gradient(180deg, #e11d48 0%, #9f1239 100%)',
              primaryBtnShadow: '0 4.5px 0 #881337, 0 10px 20px -4px rgba(159, 18, 57, 0.42), inset 0 1.5px 1px rgba(255, 255, 255, 0.38)',
            }
          : {
              circleBg: 'radial-gradient(circle at 35% 30%, #fffbeb 0%, #fde68a 100%)',
              badgeCircleBg: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
              badgeCircleShadow: '0 3px 0 #b45309, 0 6px 12px rgba(217, 119, 6, 0.38), inset 0 1.5px 1px rgba(255,255,255,0.5)',
              pillBg: '#fef3c7',
              pillText: '#92400e',
              boxBg: '#fffbeb',
              boxText: '#78350f',
              chipBg: '#fde68a',
              chipText: '#78350f',
              primaryBtnBg: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
              primaryBtnShadow: '0 4.5px 0 #92400e, 0 10px 20px -4px rgba(180, 83, 9, 0.42), inset 0 1.5px 1px rgba(255, 255, 255, 0.4)',
            };

  const secondaryBtnStyle: React.CSSProperties = {
    background: isDark
      ? 'linear-gradient(180deg, #32323e 0%, #24242e 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
    color: isDark ? '#e4e4e7' : '#334155',
    boxShadow: isDark
      ? '0 4px 0 #09090b, 0 8px 16px rgba(0,0,0,0.45), inset 0 1.5px 1px rgba(255,255,255,0.16)'
      : '0 4px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.08), inset 0 1.5px 1px rgba(255,255,255,0.95)'
  };

  const handleToggleSound = () => {
    if (isPlayingSound) {
      stopNotificationSound();
      setIsPlayingSound(false);
    } else {
      const sound = getActiveNotificationSoundPath();
      if (sound && sound !== 'none') {
        playNotificationSound(sound, true);
        setIsPlayingSound(true);
      }
    }
  };

  const handleClose = () => {
    stopNotificationSound();
    onDismiss();
  };

  const handleReadNow = (mode: 'mushaf' | 'translation' = 'mushaf') => {
    stopNotificationSound();
    onStartReading(alert.startPage, mode);
    onDismiss();
  };

  const handleGoToWirdPage = () => {
    stopNotificationSound();
    onOpenDailyWird();
    onDismiss();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
      dir={dir}
    >
      <div
        className={`settings-3d-adia-scope ${isDark ? 'settings-3d-dark' : ''} w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl p-6 relative flex flex-col items-center text-center`}
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #1b1b22 0%, #101015 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          color: isDark ? '#ffffff' : '#0f172a',
          border: 'none',
          boxShadow: isDark
            ? '0 8px 0 #09090b, 0 24px 50px rgba(0, 0, 0, 0.88), inset 0 2px 2px rgba(255, 255, 255, 0.16)'
            : '0 8px 0 rgba(0, 0, 0, 0.14), 0 24px 48px rgba(0, 0, 0, 0.28), inset 0 2px 2px rgba(255, 255, 255, 0.96)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X button */}
        <button
          type="button"
          onClick={handleClose}
          className={`unified-3d-btn absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:text-red-500`}
          style={{
            background: isDark
              ? 'linear-gradient(180deg, #32323e 0%, #24242e 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
            color: isDark ? '#e4e4e7' : '#475569',
            boxShadow: isDark
              ? '0 3px 0 #09090b, 0 5px 10px rgba(0,0,0,0.45), inset 0 1.5px 1px rgba(255,255,255,0.16)'
              : '0 3px 0 rgba(0,0,0,0.12), 0 5px 10px rgba(0,0,0,0.08), inset 0 1.5px 1px rgba(255,255,255,0.95)'
          }}
          title={isEn ? 'Close' : 'إغلاق'}
          aria-label={isEn ? 'Close' : 'إغلاق'}
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Animated Quran Book Icon */}
        <div className="relative mb-3 mt-1">
          <div
            className="app-inner-3d-box w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-pulse"
            style={{ background: accent.circleBg }}
          >
            📖
          </div>
          <span
            className={`app-3d-badge absolute -bottom-1 ${isRTL ? '-right-1' : '-left-1'} w-7 h-7 rounded-full text-white flex items-center justify-center text-xs animate-bounce`}
            style={{
              background: accent.badgeCircleBg,
              boxShadow: accent.badgeCircleShadow
            }}
          >
            <Sparkles size={14} />
          </span>
        </div>

        {/* Badge */}
        <span
          className="app-3d-badge border-0 text-xs font-black px-3.5 py-1 rounded-full mb-2 flex items-center gap-1.5"
          style={{ backgroundColor: accent.pillBg, color: accent.pillText }}
        >
          <span>{isEn ? 'Daily Wird Reminder' : 'تنبيه الورد القرآني'}</span>
          {alert.profileName && <span className="opacity-75">({alert.profileName})</span>}
        </span>

        {/* Title */}
        <h3 className={`text-lg font-black mb-2 leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {alert.title}
        </h3>

        {/* Main message */}
        <p className={`text-xs sm:text-sm font-medium leading-relaxed mb-4 px-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {alert.message}
        </p>

        {/* Wird Card Info */}
        <div
          className="app-inner-3d-box border-0 w-full rounded-2xl p-3.5 mb-3 text-center"
          style={{ backgroundColor: accent.boxBg }}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1" style={{ color: accent.boxText }}>
            <span>{isEn ? `Day ${alert.currentDay} of ${alert.totalDays}` : `اليوم ${alert.currentDay} من ${alert.totalDays}`}</span>
            <span
              className="app-3d-badge border-0 px-2.5 py-0.5 rounded-lg font-black"
              style={{ backgroundColor: accent.chipBg, color: accent.chipText }}
            >
              {isEn ? `Pages ${alert.startPage} - ${alert.endPage}` : `الصفحات ${alert.startPage} إلى ${alert.endPage}`}
            </span>
          </div>

          {alert.missedDaysCount > 0 && (
            <div className="app-3d-divider-top mt-2 pt-2 flex items-center justify-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-bold">
              <AlertCircle size={14} className="shrink-0" />
              <span>
                {alert.missedDaysCount === 1 
                  ? (isEn ? 'Missed yesterday\'s wird' : 'ورد الأمس لم يُقرأ بعد')
                  : (isEn ? `${alert.missedDaysCount} previous wird days pending` : `لديك (${alert.missedDaysCount}) أوراد سابقة لم تُقرأ بعد`)}
              </span>
            </div>
          )}
        </div>

        {/* Prophetic encouragement note */}
        <div className="app-inner-3d-box border-0 w-full bg-slate-50 dark:bg-zinc-800/70 rounded-2xl p-3 mb-5 text-[11px] font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">
          <span>{isEn ? '“Read the Qur’an, for it will come as an intercessor for its companions on the Day of Resurrection.”' : 'قال رسول الله ﷺ: «اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعًا لأَصْحابِهِ»'}</span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 overflow-visible pb-1">
          {/* Primary Action Button(s) */}
          {isEn ? (
            <button
              type="button"
              onClick={() => handleReadNow('translation')}
              className="unified-3d-btn border-0 w-full py-3.5 px-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                background: accent.primaryBtnBg,
                boxShadow: accent.primaryBtnShadow
              }}
            >
              <Languages size={18} />
              <span>Read Translation</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleReadNow('mushaf')}
              className="unified-3d-btn border-0 w-full py-3.5 px-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                background: accent.primaryBtnBg,
                boxShadow: accent.primaryBtnShadow
              }}
            >
              <BookOpen size={18} />
              <span>ابدأ قراءة الورد الآن</span>
              {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>
          )}

          <div className="flex items-center gap-2 w-full overflow-visible pb-0.5">
            {/* Toggle sound button */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="unified-3d-btn border-0 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              style={secondaryBtnStyle}
              title={isPlayingSound ? (isEn ? 'Mute Sound' : 'إيقاف الصوت') : (isEn ? 'Play Sound' : 'تشغيل الصوت')}
            >
              {isPlayingSound ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isPlayingSound ? (isEn ? 'Mute' : 'كتم') : (isEn ? 'Sound' : 'صوت')}</span>
            </button>

            {/* View Daily Wird details */}
            <button
              type="button"
              onClick={handleGoToWirdPage}
              className="unified-3d-btn border-0 flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
              style={secondaryBtnStyle}
            >
              <span>{isEn ? 'Daily Wird Plan' : 'صفحة الورد'}</span>
            </button>

            {/* Read Later / Dismiss */}
            <button
              type="button"
              onClick={handleClose}
              className="unified-3d-btn border-0 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0"
              style={secondaryBtnStyle}
            >
              <span>{isEn ? 'Later' : 'سأقرأ لاحقاً'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WirdAlertModal;

