import React, { useState, useEffect } from 'react';
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
import { getCalculator3DStyles } from '../../utils/calculator3DStyles';

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
      <div
        className="fixed inset-0 z-[120] flex flex-col justify-end bg-black/65 select-none"
        dir={dir}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`app-page-card border-0 w-full max-w-lg mx-auto rounded-t-[28px] flex flex-col max-h-[90dvh] overflow-hidden relative ${s3d.surfaceCardClass}`}
          style={{
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            fontFamily: language === 'en' ? 'sans-serif' : "'Cairo', sans-serif",
          }}
        >
          {/* 1. Drag Handle */}
          <div className="pt-3 px-6 pb-1 shrink-0 flex flex-col items-center">
            <div className={`app-3d-drag-handle w-12 h-1.5 rounded-full mb-1 ${isBlackTheme ? 'bg-zinc-700' : 'bg-slate-300 dark:bg-zinc-600'}`} />
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="overflow-y-auto px-6 py-4 flex flex-col gap-4 flex-1 min-h-0 overscroll-contain">
            <div className="flex items-center justify-center gap-2.5 w-full">
              <h4
                className={`text-xl sm:text-2xl font-black leading-snug text-center ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}
                style={{ color: primaryColor }}
              >
                {eventTitle}
              </h4>
              <button
                type="button"
                onClick={handleNextClick}
                className={`wird-inner-raised border-0 w-9 h-9 rounded-full flex items-center justify-center transition-transform cursor-pointer shrink-0 ${s3d.innerCardClass}`}
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
                <span className={`text-sm sm:text-base font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'}`} style={{ color: s3d.textColor }}>
                  {hijriYear}
                </span>
              </div>

              <div
                className={`wird-inner-raised border-0 flex items-center gap-1.5 px-3 py-1 rounded-xl ${s3d.innerCardClass}`}
              >
                <CalendarDays className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                <span className={`text-sm sm:text-base font-black ${language === 'ar' ? 'font-cairo' : 'font-sans'}`} style={{ color: s3d.textColor }}>
                  {gregorianYear}
                </span>
              </div>
            </div>

            <div
              className={`wird-inner-raised border-0 rounded-2xl p-6 sm:p-7 ${s3d.recessedInputClass}`}
            >
              <p
                className={`font-bold leading-[2.1] sm:leading-[2.2] tracking-wide text-center ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}
                style={{ 
                  color: s3d.textColor,
                  wordBreak: 'break-word',
                  fontSize: `${fontSize}px` 
                }}
              >
                {eventDescription}
              </p>
            </div>
          </div>

          {/* 3. Sticky Bottom 5 Action Buttons */}
          <div
            className={`p-4 pt-3 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t ${s3d.dividerClass} ${s3d.surfaceCardClass}`}
          >
            {/* 1. Audio Button */}
            <button
              type="button"
              onClick={handlePlayAudio}
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
            </button>

            {/* 2. Share Button */}
            <button
              type="button"
              onClick={onShare}
              className={`wird-inner-raised border-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform cursor-pointer shrink-0 ${s3d.innerCardClass}`}
              style={{ color: s3d.textColor }}
              title={language === 'en' ? 'Share Image' : 'مشاركة كصورة'}
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* 3. Copy Button */}
            <button
              type="button"
              onClick={handleCopyClick}
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
              title={language === 'en' ? 'Copy text' : 'نسخ النص'}
            >
              {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
            </button>

            {/* 4. Zoom Font Size Button */}
            <button
              type="button"
              onClick={handleToggleZoom}
              className={`wird-inner-raised border-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform cursor-pointer shrink-0 ${s3d.innerCardClass}`}
              style={{ color: s3d.textColor }}
              title={language === 'en' ? 'Enlarge font size' : 'تكبير حجم الخط'}
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* 5. Close / Hide Sheet Button */}
            <button
              type="button"
              onClick={onClose}
              className={`wird-inner-raised border-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform cursor-pointer shrink-0 ${s3d.innerCardClass}`}
              style={{ color: s3d.textColor }}
              title={language === 'en' ? 'Hide list' : 'إخفاء القائمة'}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
  );
};

export default IslamicHistoryMemoryBottomSheet;
