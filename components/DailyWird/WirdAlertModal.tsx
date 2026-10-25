import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { BookOpen, Check, X, Volume2, VolumeX, ArrowLeft, ArrowRight, Sparkles, AlertCircle, Languages } from 'lucide-react';
import { playNotificationSound, stopNotificationSound } from '../../utils/prayerTimesUtils';
import { useLanguage } from '../../context/LanguageContext';
import { WirdAlertData } from '../../utils/dailyWirdNotificationService';

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
  const isEn = language === 'en';
  const [isPlayingSound, setIsPlayingSound] = useState(true);

  useEffect(() => {
    // Only play sound if on web/browser (never in native APK)
    if (alert && !Capacitor.isNativePlatform()) {
      // Play gentle chime sound upon alert appearance
      playNotificationSound('/assets/audio/chime.mp3', true);
      setIsPlayingSound(true);
    }
    return () => {
      stopNotificationSound();
    };
  }, [alert]);

  // NEVER render inside native APK
  if (!alert || Capacitor.isNativePlatform()) return null;

  const handleToggleSound = () => {
    if (isPlayingSound) {
      stopNotificationSound();
      setIsPlayingSound(false);
    } else {
      playNotificationSound('/assets/audio/chime.mp3', true);
      setIsPlayingSound(true);
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
      className="fixed inset-0 bg-black/65 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleClose}
      dir={dir}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 border-2 border-emerald-500/80 shadow-2xl overflow-hidden p-6 relative flex flex-col items-center text-center animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors cursor-pointer`}
          title={isEn ? 'Close' : 'إغلاق'}
          aria-label={isEn ? 'Close' : 'إغلاق'}
        >
          <X size={18} />
        </button>

        {/* Animated Quran Book Icon */}
        <div className="relative mb-3 mt-1">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-4xl shadow-inner animate-pulse">
            📖
          </div>
          <span className={`absolute -bottom-1 ${isRTL ? '-right-1' : '-left-1'} w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md animate-bounce`}>
            <Sparkles size={14} />
          </span>
        </div>

        {/* Badge */}
        <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 mb-2 flex items-center gap-1.5">
          <span>{isEn ? 'Daily Wird Reminder' : 'تنبيه الورد القرآني'}</span>
          {alert.profileName && <span className="opacity-75">({alert.profileName})</span>}
        </span>

        {/* Title */}
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-snug">
          {alert.title}
        </h3>

        {/* Main message */}
        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 leading-relaxed mb-4 px-2">
          {alert.message}
        </p>

        {/* Wird Card Info */}
        <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3.5 mb-3 text-center">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-2">
            <span>{isEn ? `Day ${alert.currentDay} of ${alert.totalDays}` : `اليوم ${alert.currentDay} من ${alert.totalDays}`}</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100 font-black">
              {isEn ? `Pages ${alert.startPage} - ${alert.endPage}` : `الصفحات ${alert.startPage} إلى ${alert.endPage}`}
            </span>
          </div>

          {alert.missedDaysCount > 0 && (
            <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-bold">
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
        <div className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-xl p-2.5 mb-5 text-[11px] text-gray-600 dark:text-gray-300">
          <span>{isEn ? '“Read the Qur’an, for it will come as an intercessor for its companions on the Day of Resurrection.”' : 'قال رسول الله ﷺ: «اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعًا لأَصْحابِهِ»'}</span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {/* Primary Action Button(s) */}
          {isEn ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                type="button"
                onClick={() => handleReadNow('mushaf')}
                className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <BookOpen size={16} />
                <span>Read in Mushaf</span>
              </button>

              <button
                type="button"
                onClick={() => handleReadNow('translation')}
                className="flex-1 py-3 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-teal-600/30 transition-all cursor-pointer"
              >
                <Languages size={16} />
                <span>Read Translation</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleReadNow('mushaf')}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <BookOpen size={18} />
              <span>ابدأ قراءة الورد الآن</span>
              {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>
          )}

          <div className="flex items-center gap-2 w-full">
            {/* Toggle sound button */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
              title={isPlayingSound ? (isEn ? 'Mute Sound' : 'إيقاف الصوت') : (isEn ? 'Play Sound' : 'تشغيل الصوت')}
            >
              {isPlayingSound ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isPlayingSound ? (isEn ? 'Mute' : 'كتم') : (isEn ? 'Sound' : 'صوت')}</span>
            </button>

            {/* View Daily Wird details */}
            <button
              type="button"
              onClick={handleGoToWirdPage}
              className="flex-1 py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <span>{isEn ? 'Daily Wird Plan' : 'صفحة الورد'}</span>
            </button>

            {/* Read Later / Dismiss */}
            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-4 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-600 dark:text-gray-400 font-bold text-xs transition-all active:scale-95 cursor-pointer shrink-0"
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
