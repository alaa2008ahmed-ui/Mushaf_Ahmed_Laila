import React, { useState, useEffect } from 'react';
import { ChevronDown, ZoomIn, Copy, Check, Share2, Volume2, VolumeX, Scroll, Award } from 'lucide-react';
import { getSababNuzulForAyah, SababNuzulEntry } from '../../data/asbabNuzulData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

interface AsbabNuzulModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: any;
  surahNumber: number;
  ayahNumber: number;
  surahName?: string;
  verseText?: string;
  onPlayAudio?: (surah: number, ayah: number) => void;
  onStopAudio?: () => void;
  isAudioPlaying?: boolean;
  showToast?: (msg: string) => void;
  isLandscape?: boolean;
}

const AsbabNuzulModal: React.FC<AsbabNuzulModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  surahNumber,
  ayahNumber,
  surahName = '',
  verseText = '',
  onPlayAudio,
  onStopAudio,
  isAudioPlaying,
  showToast,
  isLandscape = false
}) => {
  const { language, dir } = useLanguage();
  const isEn = language === 'en';

  const [fontSize, setFontSize] = useState<number>(18);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeTTS((playingText) => {
      setIsPlaying(Boolean(playingText));
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const isAudioActive = isAudioPlaying !== undefined ? isAudioPlaying : isPlaying;

  const handleClose = () => {
    stopTTS();
    if (onStopAudio && isAudioActive) {
      onStopAudio();
    }
    onClose();
  };

  const entry: SababNuzulEntry | null = React.useMemo(() => {
    return getSababNuzulForAyah(surahNumber, ayahNumber);
  }, [surahNumber, ayahNumber]);

  if (!isOpen) return null;

  const themeAccent = currentTheme?.accent || '#10b981';
  const isDark = currentTheme?.id === 'deep_black';
  const themeAccentColor = isDark ? '#ffffff' : themeAccent;
  const modalBg = currentTheme?.modalBg || currentTheme?.bg || '#ffffff';
  const modalText = currentTheme?.modalText || currentTheme?.text || '#000000';

  const surahNameEn = SURAH_NAMES_EN[surahNumber - 1] || `Surah ${surahNumber}`;
  const displaySurah = isEn ? surahNameEn : (surahName.includes('سورة') ? surahName : `سورة ${surahName}`);

  const storyTitleText = isEn 
    ? (entry?.storyTitleEn || entry?.storyTitleAr || 'Occasion of Revelation')
    : (entry?.storyTitleAr || 'سبب النزول');

  const causeText = isEn
    ? (entry?.causeEn || entry?.causeAr || 'This verse was revealed as divine guidance for the believers.')
    : (entry?.causeAr || 'نزلت هذه الآية الكريمة هدايةً للمؤمنين.');

  const sourceText = isEn
    ? (entry?.sourceEn || entry?.sourceAr || 'Tafsir & Hadith Literature')
    : (entry?.sourceAr || 'كتب التفسير والحديث');

  const lessonText = isEn
    ? (entry?.lessonEn || entry?.lessonAr)
    : entry?.lessonAr;

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 32 ? 16 : prev + 3));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const headerRef = isEn
      ? `[Asbab Al-Nuzul - ${displaySurah} Ayah ${ayahNumber}]`
      : `[أسباب النزول - ${displaySurah} آية ${toArabic(ayahNumber)}]`;
    const fullText = verseText 
      ? `${verseText}\n\n${storyTitleText}\n${causeText}\n\n${headerRef}` 
      : `${storyTitleText}\n${causeText}\n\n${headerRef}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (showToast) showToast(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullShareText = verseText ? `${verseText}\n\n${storyTitleText}\n\n${causeText}` : `${storyTitleText}\n\n${causeText}`;
    const sourceRef = isEn ? `${displaySurah} (Ayah ${ayahNumber})` : `${displaySurah} (آية ${toArabic(ayahNumber)})`;

    await shareAsImage({
      text: fullShareText,
      title: isEn ? "Asbab Al-Nuzul & Story" : "أسباب النزول والقصص",
      source: sourceRef,
      category: isEn ? "Revelation Context" : "أسباب النزول",
      isEn,
      language: isEn ? 'en' : 'ar',
      setToastMessage: showToast,
    });
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAudioActive) {
      stopTTS();
      if (onStopAudio) onStopAudio();
      setIsPlaying(false);
      return;
    }
    if (onPlayAudio && surahNumber && ayahNumber) {
      stopTTS();
      onPlayAudio(surahNumber, ayahNumber);
      return;
    }
    const textToRead = verseText ? `${verseText}. ${causeText}` : causeText;
    playTTS(textToRead, {
      isEn,
      onToast: (msg) => { if (showToast) showToast(msg); }
    });
    setIsPlaying(true);
  };

  return (
    <div 
      className="fixed inset-0 z-[1300] bg-black/65 backdrop-blur-xs flex flex-col justify-end select-none animate-fadeIn"
      onClick={handleClose}
      dir={dir}
    >
      <div 
        className={`zoom-modal-sheet w-full max-w-xl mx-auto rounded-t-[32px] flex flex-col overflow-hidden relative shadow-2xl animate-modal-enter ${
          isLandscape ? 'max-h-[92vh]' : 'max-h-[85vh]'
        }`}
        style={{ 
          backgroundColor: modalBg, 
          color: modalText,
          fontFamily: currentTheme?.font || "'Cairo', sans-serif"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Drag Handle & Category Badge */}
        <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
          <div className="w-12 h-1.5 rounded-full mb-2.5 bg-slate-300 dark:bg-zinc-700 opacity-70 mx-auto" />
          
          <div className="w-full flex flex-col items-center justify-center relative px-2">
            <span 
              className="px-4 py-1.5 rounded-full text-xs font-extrabold shadow-2xs border transition-all"
              style={{
                backgroundColor: `${themeAccent}18`,
                borderColor: `${themeAccent}40`,
                color: themeAccentColor
              }}
            >
              {isEn ? "Asbab Al-Nuzul & Revelation Story" : "أسباب النزول والقصص النبوية"}
            </span>
            <span className="text-[11px] font-bold opacity-60 mt-1">
              {isEn 
                ? `Context of Revelation: ${displaySurah} (Ayah ${ayahNumber})` 
                : `سبب وسياق النزول: ${displaySurah} (آية ${toArabic(ayahNumber)})`}
            </span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-3">
          {/* Display Ayah Text */}
          {verseText && (
            <div 
              className="py-3 px-4 my-2.5 rounded-2xl text-center select-text leading-[2.1] font-bold border quran-raised-card font-cairo transition-all"
              style={{
                backgroundColor: `${themeAccent}0d`,
                borderColor: `${themeAccent}25`,
                fontSize: `${fontSize + 4}px`,
                fontFamily: "'Cairo', sans-serif"
              }}
              dir="rtl"
            >
              {verseText} {ayahNumber ? <span>﴿{toArabic(ayahNumber)}﴾</span> : ''}
            </div>
          )}

          {/* Cause Story / Context */}
          {entry ? (
            <div className="space-y-4 py-2">
              <div 
                className="p-4 rounded-2xl border quran-raised-card transition-all" 
                style={{ 
                  backgroundColor: `${themeAccent}08`, 
                  borderColor: `${themeAccent}20` 
                }}
              >
                <div className="flex items-center gap-2 mb-2 font-bold" style={{ color: themeAccentColor, fontSize: `${fontSize + 1}px` }}>
                  <Scroll size={18} />
                  <span>{storyTitleText}</span>
                </div>
                <p 
                  className="leading-[2.2] select-text font-bold transition-all" 
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {causeText}
                </p>
                <div className="mt-3 opacity-70 flex items-center gap-1.5 transition-all" style={{ fontSize: `${Math.max(11, fontSize - 4)}px` }}>
                  <span>{isEn ? "Source citation:" : "المصدر والتخريج:"}</span>
                  <span className="font-bold">{sourceText}</span>
                </div>
              </div>

              {/* Spiritual Lessons */}
              {lessonText && (
                <div 
                  className="p-4 rounded-2xl border quran-raised-card transition-all" 
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', 
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' 
                  }}
                >
                  <div className="flex items-center gap-2 mb-2 font-bold" style={{ color: themeAccentColor, fontSize: `${fontSize}px` }}>
                    <Award size={18} />
                    <span>{isEn ? "Spiritual Lessons & Key Takeaways:" : "الدروس والعبر المستفادة من النزول:"}</span>
                  </div>
                  <p className="font-bold opacity-90 leading-[2.1] select-text transition-all" style={{ fontSize: `${fontSize}px` }}>
                    {lessonText}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center opacity-80 leading-[2.2] font-bold transition-all" style={{ fontSize: `${fontSize}px` }}>
              {isEn 
                ? "This verse was revealed as initial divine guidance and wisdom for all believers without a specific isolated event." 
                : "نزلت هذه الآية الكريمة ابتداءً كإجابة هادية وهداية ربانية عامة للمؤمنين دون حادثة خاصة منقولة بالتحديد."}
            </div>
          )}

          {/* Reference Citation Subtitle */}
          {(surahName || (surahNumber && ayahNumber)) && (
            <div className="flex items-center justify-center mt-4 mb-2">
              <span 
                className="font-extrabold text-center px-4 py-1.5 rounded-xl border shadow-2xs font-cairo transition-all"
                style={{
                  backgroundColor: `${themeAccent}12`,
                  borderColor: `${themeAccent}35`,
                  color: themeAccentColor,
                  fontSize: `${Math.max(12, fontSize - 4)}px`
                }}
                dir={isEn ? 'ltr' : 'rtl'}
              >
                {isEn 
                  ? `${displaySurah} (Ayah ${ayahNumber})` 
                  : `من ${displaySurah} (آية ${toArabic(ayahNumber || 1)})`}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Action Bar matching image (5 round action buttons in RTL: Audio on Right, Chevron on Left) */}
        <div 
          className="p-3 px-6 border-t shrink-0 flex items-center justify-center gap-3 sm:gap-4 font-cairo border-slate-200/50 dark:border-white/10"
          dir="rtl"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
            backgroundColor: modalBg
          }}
        >
          {/* 1. Audio / Recitation Play Button (RIGHTMOST in RTL) */}
          <button 
            onClick={handlePlayAudio}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border-0 ${
              isAudioActive ? 'ring-2 ring-red-400/80 animate-pulse' : 'quran-raised-card'
            }`}
            style={{ 
              backgroundColor: isAudioActive ? '#dc2626' : `${themeAccent}18`, 
              color: isAudioActive ? '#ffffff' : themeAccentColor 
            }}
            title={isAudioActive ? (isEn ? "Stop Audio" : "إيقاف الصوت") : (isEn ? "Listen" : "استماع")}
          >
            {isAudioActive ? <VolumeX size={20} className="text-white animate-pulse" /> : <Volume2 size={20} style={{ color: themeAccentColor }} />}
          </button>

          {/* 2. Share Button */}
          <button 
            onClick={handleShare}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border-0 quran-raised-card"
            style={{ backgroundColor: `${themeAccent}18`, color: themeAccentColor }}
            title={isEn ? "Share" : "مشاركة"}
          >
            <Share2 size={20} style={{ color: themeAccentColor }} />
          </button>

          {/* 3. Copy Button */}
          <button 
            onClick={handleCopy}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border-0 quran-raised-card"
            style={{ 
              backgroundColor: copied ? '#10b981' : `${themeAccent}18`, 
              color: copied ? '#ffffff' : themeAccentColor 
            }}
            title={isEn ? "Copy" : "نسخ"}
          >
            {copied ? <Check size={20} className="text-white stroke-[2.5]" /> : <Copy size={20} style={{ color: themeAccentColor }} />}
          </button>

          {/* 4. Zoom Button */}
          <button 
            onClick={handleToggleZoom}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border-0 quran-raised-card"
            style={{ backgroundColor: `${themeAccent}18`, color: themeAccentColor }}
            title={isEn ? "Text Size" : "حجم الخط"}
          >
            <ZoomIn size={20} style={{ color: themeAccentColor }} />
          </button>

          {/* 5. Chevron Down / Hide Modal Button (LEFTMOST in RTL) */}
          <button 
            onClick={handleClose}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border-0 quran-raised-card"
            style={{ backgroundColor: `${themeAccent}18`, color: themeAccentColor }}
            title={isEn ? "Close" : "إغلاق"}
          >
            <ChevronDown size={22} style={{ color: themeAccentColor }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsbabNuzulModal;
