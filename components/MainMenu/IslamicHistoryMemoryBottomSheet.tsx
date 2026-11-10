import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScrollText,
  CalendarDays,
  Share2,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  ZoomIn,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { HistoricalEventLocalized, formatCalendarNumber } from '../../utils/calendarTranslations';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

interface IslamicHistoryMemoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  event: HistoricalEventLocalized | null;
  onNextEvent: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
}

export const IslamicHistoryMemoryBottomSheet: React.FC<IslamicHistoryMemoryBottomSheetProps> = ({
  isOpen,
  onClose,
  event,
  onNextEvent,
  onShare,
  onCopy,
}) => {
  const { language, dir, t } = useLanguage();
  const { theme, themeKey } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(22);

  useEffect(() => {
    const unsubscribe = subscribeTTS(setPlayingText);
    return () => {
      unsubscribe();
      stopTTS();
    };
  }, []);

  const isBlackTheme =
    themeKey === 'deep_black' ||
    theme.bgColor === '#000000' ||
    theme.name === 'اسود' ||
    theme.name === 'black';
  const primaryColor = isBlackTheme ? '#10b981' : (theme.palette?.[0] || '#059669');

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy(e);
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 500);
    onNextEvent(e);
  };

  if (!isOpen || !event) return null;

  const eventTitle = language === 'en' ? event.titleEn : event.titleAr;
  const eventDescription = language === 'en' ? event.descriptionEn : event.descriptionAr;
  const hijriYear = language === 'en'
    ? event.hijriYearEn
    : formatCalendarNumber(event.hijriYearAr, 'ar');
  const gregorianYear = language === 'en'
    ? event.gregorianYearEn
    : formatCalendarNumber(event.gregorianYearAr, 'ar');

  const fullTextToRead = `${eventTitle}. ${eventDescription}`.replace(/<[^>]*>/g, '').trim();
  const isPlaying = playingText === fullTextToRead;

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopTTS();
    } else {
      playTTS(fullTextToRead, { isEn: language === 'en' });
    }
  };

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 32 ? 18 : prev + 4));
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex flex-col justify-end bg-black/60 backdrop-blur-xs select-none"
        dir={dir}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg mx-auto rounded-t-[28px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative ${
            isBlackTheme ? 'bg-[#18181b] border-t border-zinc-800 text-white' : 'bg-white text-slate-800'
          }`}
          style={{
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
          }}
        >
          {/* 1. Drag Handle & Header */}
          <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
            <div className={`w-12 h-1.5 rounded-full mb-3 ${isBlackTheme ? 'bg-zinc-700' : 'bg-slate-300'}`} />

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.2)' : `${primaryColor}18`,
                    color: primaryColor,
                  }}
                >
                  <ScrollText className="w-5 h-5" strokeWidth={2.4} />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className={`text-base sm:text-lg font-bold font-kufi leading-tight truncate ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
                    {language === 'en' ? 'Islamic History Memory' : 'ذاكرة التاريخ الإسلامي'}
                  </h3>
                  <span className={`text-xs font-medium truncate ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                    {language === 'en' ? 'Illuminating Milestones of Islamic Civilization' : 'محطات مضيئة من التاريخ والحضارة الإسلامية'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleNextClick}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isBlackTheme
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600'
                  }`}
                  title={language === 'en' ? 'Another Event' : 'حدث آخر'}
                  aria-label={language === 'en' ? 'Another Event' : 'حدث آخر'}
                >
                  <RotateCw
                    className={`w-4 h-4 transition-transform duration-500 ${isRotating ? 'rotate-180' : ''}`}
                    strokeWidth={2.2}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="overflow-y-auto px-6 py-4 flex flex-col gap-4 flex-1 overscroll-contain">
            <h4
              className="text-xl sm:text-2xl font-black font-kufi leading-snug text-center"
              style={{ color: primaryColor }}
            >
              {eventTitle}
            </h4>

            <div
              className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between ${
                isBlackTheme ? 'bg-zinc-800/80 border border-zinc-700/60' : 'bg-slate-50 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4.5 h-4.5 shrink-0" style={{ color: primaryColor }} />
                <span className={`text-sm sm:text-base font-bold font-kufi ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
                  {hijriYear}
                </span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl shadow-xs border ${
                  isBlackTheme ? 'bg-zinc-700 border-zinc-600' : 'bg-white border-slate-100'
                }`}
              >
                <CalendarDays className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                <span className={`text-sm sm:text-base font-black ${isBlackTheme ? 'text-white' : 'text-slate-900'}`}>
                  {gregorianYear}
                </span>
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 sm:p-7 shadow-xs ${
                isBlackTheme
                  ? 'bg-zinc-900/90 border border-zinc-700/60'
                  : 'bg-[#FAF9F5] border border-stone-200/50'
              }`}
            >
              <p
                className={`font-bold font-hafs leading-[2.1] sm:leading-[2.2] tracking-wide text-justify ${
                  isBlackTheme ? 'text-zinc-100' : 'text-slate-800'
                }`}
                style={{ 
                  wordBreak: 'break-word',
                  fontSize: `${fontSize}px` 
                }}
              >
                {eventDescription}
              </p>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className={`flex items-center gap-2 text-xs font-semibold ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === 'en' ? 'Reflections from Islamic History' : 'صفحات مشرقة من ذاكرة الأمة'}</span>
              </div>

              <button
                type="button"
                onClick={handleNextClick}
                className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  isBlackTheme ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                <span>{language === 'en' ? 'Show another event' : 'عرض حدث آخر'}</span>
                <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3. Sticky Bottom 5 Action Buttons matching Supplications page */}
          <div
            className={`p-4 pt-3 shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t ${
              isBlackTheme
                ? 'bg-[#18181b] border-zinc-800'
                : 'bg-white border-slate-100'
            }`}
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
            }}
          >
            {/* 1. Audio Button */}
            <button
              type="button"
              onClick={handlePlayAudio}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: isPlaying ? 'rgba(239, 68, 68, 0.15)' : (isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
                color: isPlaying ? '#EF4444' : (isBlackTheme ? '#FFFFFF' : '#1E293B')
              }}
              title={language === 'en' ? (isPlaying ? 'Stop audio' : 'Play audio') : (isPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
            >
              {isPlaying ? <VolumeX className="w-5 h-5 text-red-500 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* 2. Share Button */}
            <button
              type="button"
              onClick={onShare}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: isBlackTheme ? '#FFFFFF' : '#1E293B'
              }}
              title={language === 'en' ? 'Share Image' : 'مشاركة كصورة'}
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* 3. Copy Button */}
            <button
              type="button"
              onClick={handleCopyClick}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: copied ? '#10B981' : (isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
                color: copied ? '#FFFFFF' : (isBlackTheme ? '#FFFFFF' : '#1E293B')
              }}
              title={language === 'en' ? 'Copy text' : 'نسخ النص'}
            >
              {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
            </button>

            {/* 4. Zoom Font Size Button */}
            <button
              type="button"
              onClick={handleToggleZoom}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: isBlackTheme ? '#FFFFFF' : '#1E293B'
              }}
              title={language === 'en' ? 'Enlarge font size' : 'تكبير حجم الخط'}
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* 5. Close / Hide Sheet Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: isBlackTheme ? '#FFFFFF' : '#1E293B'
              }}
              title={language === 'en' ? 'Hide list' : 'إخفاء القائمة'}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IslamicHistoryMemoryBottomSheet;
