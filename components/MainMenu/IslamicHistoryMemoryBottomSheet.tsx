import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Share2,
  Copy,
  Check,
  RotateCw,
  Volume2,
  VolumeX,
  ZoomIn,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { HistoricalEventLocalized, formatCalendarNumber } from '../../utils/calendarTranslations';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
<<<<<<< HEAD
import { getCalculator3DStyles } from '../../utils/calculator3DStyles';
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

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
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(22);
<<<<<<< HEAD
=======

  useEffect(() => {
    const unsubscribe = subscribeTTS(setPlayingText);
    return () => {
      unsubscribe();
      stopTTS();
    };
  }, []);
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

  useEffect(() => {
    const unsubscribe = subscribeTTS(setPlayingText);
    return () => {
      unsubscribe();
      stopTTS();
    };
  }, []);

  const isBlackTheme = s3d.isBlackTheme;
  const primaryColor = s3d.primaryColor;

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
  const rawDesc = language === 'en' ? event.descriptionEn : event.descriptionAr;
  const eventDescription = (rawDesc || '').replace(/[ \t]+/g, ' ').trim();
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
<<<<<<< HEAD
          className={`app-page-card border-0 w-full max-w-lg mx-auto rounded-t-[28px] flex flex-col max-h-[90dvh] overflow-hidden relative ${s3d.surfaceCardClass}`}
=======
          className={`w-full max-w-lg mx-auto rounded-t-[28px] shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden relative ${
            isBlackTheme ? 'bg-[#18181b] border-t border-zinc-800 text-white' : 'bg-white text-slate-800'
          }`}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
          style={{
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
          }}
        >
          {/* 1. Drag Handle */}
          <div className="pt-3 px-6 pb-1 shrink-0 flex flex-col items-center">
<<<<<<< HEAD
            <div className={`w-12 h-1.5 rounded-full mb-1 ${isBlackTheme ? 'bg-zinc-700' : 'bg-slate-300 dark:bg-zinc-600'}`} />
=======
            <div className={`w-12 h-1.5 rounded-full mb-1 ${isBlackTheme ? 'bg-zinc-700' : 'bg-slate-300'}`} />
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="overflow-y-auto px-6 py-4 flex flex-col gap-4 flex-1 min-h-0 overscroll-contain">
            <div className="flex items-center justify-center gap-2.5 w-full">
              <h4
                className="text-xl sm:text-2xl font-black font-kufi leading-snug text-center"
                style={{ color: primaryColor }}
              >
                {eventTitle}
              </h4>
              <button
                type="button"
                onClick={handleNextClick}
<<<<<<< HEAD
                className={`wird-inner-raised border-0 w-9 h-9 rounded-full flex items-center justify-center transition-transform cursor-pointer shrink-0 ${s3d.innerCardClass}`}
=======
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs ${
                  isBlackTheme
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                    : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/60'
                }`}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                title={language === 'en' ? 'Another Event' : 'حدث آخر'}
                aria-label={language === 'en' ? 'Another Event' : 'حدث آخر'}
              >
                <RotateCw
                  className={`w-4 h-4 transition-transform duration-500 ${isRotating ? 'rotate-180' : ''}`}
                  strokeWidth={2.2}
                />
              </button>
            </div>

            <div
              className={`wird-inner-raised border-0 w-full py-3 px-4 rounded-2xl flex items-center justify-between ${s3d.recessedInputClass}`}
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4.5 h-4.5 shrink-0" style={{ color: primaryColor }} />
                <span className="text-sm sm:text-base font-bold font-kufi" style={{ color: s3d.textColor }}>
                  {hijriYear}
                </span>
              </div>

              <div
                className={`wird-inner-raised border-0 flex items-center gap-1.5 px-3 py-1 rounded-xl ${s3d.innerCardClass}`}
              >
                <CalendarDays className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                <span className="text-sm sm:text-base font-black" style={{ color: s3d.textColor }}>
                  {gregorianYear}
                </span>
              </div>
            </div>

            <div
              className={`wird-inner-raised border-0 rounded-2xl p-6 sm:p-7 ${s3d.recessedInputClass}`}
            >
              <p
<<<<<<< HEAD
                className="font-bold font-hafs leading-[2.1] sm:leading-[2.2] tracking-wide text-center"
                style={{ 
                  color: s3d.textColor,
=======
                className={`font-bold font-hafs leading-[2.1] sm:leading-[2.2] tracking-wide text-center ${
                  isBlackTheme ? 'text-zinc-100' : 'text-slate-800'
                }`}
                style={{ 
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                  wordBreak: 'break-word',
                  fontSize: `${fontSize}px` 
                }}
              >
                {eventDescription}
              </p>
            </div>
          </div>

<<<<<<< HEAD
          {/* 3. Sticky Bottom 5 Action Buttons */}
          <div
            className={`p-4 pt-3 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t ${s3d.dividerClass} ${s3d.surfaceCardClass}`}
=======
          {/* 3. Sticky Bottom 5 Action Buttons matching Supplications page */}
          <div
            className={`p-4 pt-3 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t ${
              isBlackTheme
                ? 'bg-[#18181b] border-zinc-800'
                : 'bg-white border-slate-100'
            }`}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
          >
            {/* 1. Audio Button */}
            <button
              type="button"
              onClick={handlePlayAudio}
<<<<<<< HEAD
              className={`${
                isPlaying
                  ? 'border-0 active:translate-y-[2px]'
                  : `wird-inner-raised border-0 ${s3d.innerCardClass}`
              } w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0`}
              style={isPlaying ? {
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                boxShadow: '0 4px 0 #b91c1c, inset 0 1px 1px rgba(255,255,255,0.35)'
              } : { color: s3d.textColor }}
              title={language === 'en' ? (isPlaying ? 'Stop audio' : 'Play audio') : (isPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
            >
              {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
=======
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: isPlaying ? 'rgba(239, 68, 68, 0.15)' : (isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
                color: isPlaying ? '#EF4444' : (isBlackTheme ? '#FFFFFF' : '#1E293B')
              }}
              title={language === 'en' ? (isPlaying ? 'Stop audio' : 'Play audio') : (isPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
            >
              {isPlaying ? <VolumeX className="w-5 h-5 text-red-500 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
            </button>

            {/* 2. Share Button */}
            <button
              type="button"
              onClick={onShare}
<<<<<<< HEAD
              className={`wird-inner-raised border-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform cursor-pointer shrink-0 ${s3d.innerCardClass}`}
              style={{ color: s3d.textColor }}
=======
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: isBlackTheme ? '#FFFFFF' : '#1E293B'
              }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
              title={language === 'en' ? 'Share Image' : 'مشاركة كصورة'}
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* 3. Copy Button */}
            <button
              type="button"
              onClick={handleCopyClick}
<<<<<<< HEAD
              className={`${
                copied
                  ? 'border-0 active:translate-y-[2px]'
                  : `wird-inner-raised border-0 ${s3d.innerCardClass}`
              } w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0`}
              style={copied ? {
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                boxShadow: '0 4px 0 #047857, inset 0 1px 1px rgba(255,255,255,0.35)'
              } : { color: s3d.textColor }}
=======
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: copied ? '#10B981' : (isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
                color: copied ? '#FFFFFF' : (isBlackTheme ? '#FFFFFF' : '#1E293B')
              }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
              title={language === 'en' ? 'Copy text' : 'نسخ النص'}
            >
              {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
            </button>

            {/* 4. Zoom Font Size Button */}
            <button
              type="button"
              onClick={handleToggleZoom}
<<<<<<< HEAD
              className={`wird-inner-raised border-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform cursor-pointer shrink-0 ${s3d.innerCardClass}`}
              style={{ color: s3d.textColor }}
=======
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: isBlackTheme ? '#FFFFFF' : '#1E293B'
              }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
              title={language === 'en' ? 'Enlarge font size' : 'تكبير حجم الخط'}
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* 5. Close / Hide Sheet Button */}
            <button
              type="button"
              onClick={onClose}
<<<<<<< HEAD
              className={`wird-inner-raised border-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform cursor-pointer shrink-0 ${s3d.innerCardClass}`}
              style={{ color: s3d.textColor }}
=======
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={{
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: isBlackTheme ? '#FFFFFF' : '#1E293B'
              }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
