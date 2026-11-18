import React, { useState, useEffect } from 'react';
import { ChevronDown, ZoomIn, Copy, Check, Share2, Volume2, VolumeX, Scroll, Award, ShieldCheck, CheckCircle2, Info, X } from 'lucide-react';
import { getSababNuzulForAyah, SababNuzulEntry } from '../../data/asbabNuzulData/asbabNuzulData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { resolveQuranModalPalette } from './modalThemeUtils';

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

const AsbabNuzulModal: React.FC<AsbabNuzulModalProps> = React.memo(({
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
    if (!isOpen) return null;
    return getSababNuzulForAyah(surahNumber, ayahNumber);
  }, [isOpen, surahNumber, ayahNumber]);

  if (!isOpen) return null;

  const p = resolveQuranModalPalette(currentTheme);

  const surahNameEn = SURAH_NAMES_EN[surahNumber - 1] || `Surah ${surahNumber}`;
  const rawSurahName = surahName || (entry?.surahName ?? '');
  const cleanSurahName = rawSurahName.replace(/[\u064B-\u065F\u0670]/g, '').trim();
  const displaySurah = isEn 
    ? surahNameEn 
    : (cleanSurahName.startsWith('سورة') ? rawSurahName : `سورة ${rawSurahName}`);

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

  const authGradeText = isEn
    ? (entry?.authenticityGradeEn || entry?.authenticityGradeAr || 'Authentic Context')
    : (entry?.authenticityGradeAr || 'سياق نزول محقق');

  const takhrijNoteText = isEn
    ? (entry?.takhrijNoteEn || entry?.takhrijNoteAr || 'Verified by classical Hadith & Tafsir authorities.')
    : (entry?.takhrijNoteAr || 'محقّق في كتب الحديث وأسباب النزول المعتمدة.');

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 32 ? 16 : prev + 3));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const headerRef = isEn
      ? `[Asbab Al-Nuzul - ${displaySurah} Ayah ${ayahNumber}]`
      : `[أسباب النزول - ${displaySurah} آية ${toArabic(ayahNumber)}]`;
    const authSection = isEn
      ? `\n\nAuthenticity Grade: ${authGradeText}\nTakhrij & Scholarly Verification: ${takhrijNoteText}`
      : `\n\nدرجة الرواية: ${authGradeText}\nالتخريج وتحقيق أهل الحديث: ${takhrijNoteText}`;
    const fullText = verseText 
      ? `${verseText}\n\n${storyTitleText}\n${causeText}${authSection}\n\n${headerRef}` 
      : `${storyTitleText}\n${causeText}${authSection}\n\n${headerRef}`;

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
    const authSection = isEn
      ? `\n\n[Grade: ${authGradeText}]\n${takhrijNoteText}`
      : `\n\n[درجة الرواية: ${authGradeText}]\n${takhrijNoteText}`;
    const fullShareText = verseText 
      ? `${verseText}\n\n${storyTitleText}\n\n${causeText}${authSection}` 
      : `${storyTitleText}\n\n${causeText}${authSection}`;
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
      className={`fixed inset-0 z-[1300] bg-black/70 flex flex-col select-none ${isLandscape ? 'justify-center items-center p-2.5' : 'justify-end'}`}
      onClick={handleClose}
      dir={dir}
    >
      <div 
        className={`zoom-modal-sheet modal-skinned settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} flex flex-col overflow-hidden relative shadow-2xl border-0 ${
          isLandscape ? 'w-[62%] max-w-[430px] max-h-[86%] rounded-3xl' : 'w-full max-w-xl mx-auto rounded-t-[32px] max-h-[88dvh]'
        }`}
        style={{ 
          backgroundColor: p.modalBg, 
          color: p.modalText,
          fontFamily: p.fontFamily || "'Cairo', sans-serif",
          border: 'none',
          outline: 'none'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Canonical Raised 3D Header */}
        <div className={`${isLandscape ? 'pt-2.5 px-3 pb-1.5' : 'pt-3 px-4 sm:px-5 pb-2.5'} shrink-0 flex flex-col`}>
          {!isLandscape && (
            <div className="app-3d-drag-handle w-12 h-1.5 rounded-full mb-2.5 bg-slate-300/80 dark:bg-zinc-600/80 mx-auto" />
          )}
          
          <div 
            className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between gap-2 quran-raised-card border-0`}
            style={{ backgroundColor: p.headerBg }}
          >
            <div className="flex flex-col min-w-0 text-start">
              <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide truncate`} style={{ color: p.headerAccent }}>
                {isEn ? "Asbab Al-Nuzul & Revelation Story" : "أسباب النزول والقصص النبوية"}
              </span>
              <span className={`${isLandscape ? 'text-[10px]' : 'text-[11px]'} font-bold truncate`} style={{ color: p.mutedText }}>
                {isEn 
                  ? `${displaySurah} • Ayah ${ayahNumber}` 
                  : `${displaySurah} • آية ${toArabic(ayahNumber)}`}
              </span>
            </div>
            <button 
              type="button"
              onClick={handleClose} 
              className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
              style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
              aria-label={isEn ? "Close" : "إغلاق"}
            >
              <X size={isLandscape ? 14 : 16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className={`overflow-y-auto custom-scrollbar flex-1 min-h-0 ${isLandscape ? 'px-3 pt-1 pb-3 space-y-2.5' : 'px-4 sm:px-5 pt-2 pb-5 space-y-4'}`}>
          {/* Display Ayah Text in Raised 3D Card */}
          {verseText && (
            <div 
              className="p-4 rounded-2xl text-center select-text leading-[2.1] font-bold border-0 quran-raised-card"
              style={{
                backgroundColor: p.cardBg,
                color: p.cardText,
                fontSize: `${fontSize + 4}px`,
                fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif"
              }}
              dir="rtl"
            >
              {verseText} {ayahNumber ? <span style={{ color: p.headerAccent }}>﴿{toArabic(ayahNumber)}﴾</span> : ''}
            </div>
          )}

          {/* Cause Story / Context */}
          {entry ? (
            <div className="space-y-4">
              {/* Cause Story / Context Card */}
              <div 
                className="p-4 sm:p-5 rounded-2xl border-0 quran-raised-card" 
                style={{ 
                  backgroundColor: p.cardBg,
                  color: p.cardText
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 font-bold" style={{ color: p.headerAccent, fontSize: `${fontSize + 1}px` }}>
                    <Scroll size={18} />
                    <span>{storyTitleText}</span>
                  </div>

                  {/* Authenticity Badge */}
                  {entry?.authenticityGradeAr && (
                    <span 
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border-0 font-cairo ${
                        entry.authenticity === 'sahih'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : entry.authenticity === 'hasan'
                          ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                          : entry.authenticity === 'mursal'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {entry.authenticity === 'sahih' || entry.authenticity === 'hasan' ? (
                        <ShieldCheck size={13} className="shrink-0" />
                      ) : entry.authenticity === 'mursal' ? (
                        <Info size={13} className="shrink-0" />
                      ) : (
                        <CheckCircle2 size={13} className="shrink-0" />
                      )}
                      <span>{authGradeText}</span>
                    </span>
                  )}
                </div>

                <p 
                  className="leading-[2.2] select-text font-bold whitespace-pre-line" 
                  style={{ fontSize: `${fontSize}px`, color: p.cardText }}
                >
                  {causeText}
                </p>

                <div 
                  className="mt-3.5 px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold font-cairo"
                  style={{ backgroundColor: p.subtleBg }}
                >
                  <span style={{ color: p.mutedText }}>{isEn ? "Source citation:" : "المصدر الأساسي:"}</span>
                  <span className="font-black" style={{ color: p.headerAccent }}>{sourceText}</span>
                </div>
              </div>

              {/* Hadith Grading & Takhrij Section */}
              <div 
                className="p-4 sm:p-5 rounded-2xl border-0 quran-raised-card font-cairo"
                style={{ 
                  backgroundColor: p.cardBg,
                  color: p.cardText
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-200/50 dark:border-white/10">
                  <div className="flex items-center gap-2 font-black text-xs" style={{ color: p.headerAccent }}>
                    <ShieldCheck size={16} />
                    <span>{isEn ? "Hadith Takhrij & Scholarly Verification:" : "تخريج وتحقيق أهل الحديث لسبب النزول:"}</span>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: p.mutedText }}>
                    {isEn ? "Scholarly Grading" : "الدرجة والتحقيق"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span style={{ color: p.mutedText }}>{isEn ? "Grading:" : "درجة الرواية:"}</span>
                    <span className="font-black px-2.5 py-0.5 rounded-lg text-[11px]" style={{
                      backgroundColor: entry?.authenticity === 'sahih' ? 'rgba(16, 185, 129, 0.16)' : 'rgba(217, 119, 6, 0.16)',
                      color: entry?.authenticity === 'sahih' ? (p.isDark ? '#34d399' : '#059669') : (p.isDark ? '#fbbf24' : '#b45309')
                    }}>
                      {authGradeText}
                    </span>
                  </div>
                  <p className="leading-relaxed text-[12px] font-bold pt-1 text-justify" style={{ color: p.cardText }}>
                    {takhrijNoteText}
                  </p>
                </div>
              </div>

              {/* Spiritual Lessons */}
              {lessonText && (
                <div 
                  className="p-4 sm:p-5 rounded-2xl border-0 quran-raised-card font-cairo" 
                  style={{ 
                    backgroundColor: p.cardBg,
                    color: p.cardText
                  }}
                >
                  <div className="flex items-center gap-2 mb-2 font-bold" style={{ color: p.headerAccent, fontSize: `${fontSize}px` }}>
                    <Award size={18} />
                    <span>{isEn ? "Spiritual Lessons & Key Takeaways:" : "الدروس والعبر المستفادة من النزول:"}</span>
                  </div>
                  <p className="font-bold leading-[2.1] select-text whitespace-pre-line" style={{ fontSize: `${fontSize}px`, color: p.cardText }}>
                    {lessonText}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="p-5 rounded-2xl border-0 quran-raised-card text-center leading-[2.2] font-bold" 
              style={{ fontSize: `${fontSize}px`, backgroundColor: p.cardBg, color: p.cardText }}
            >
              {isEn 
                ? "This verse was revealed as initial divine guidance and wisdom for all believers without a specific isolated event." 
                : "نزلت هذه الآية الكريمة ابتداءً كإجابة هادية وهداية ربانية عامة للمؤمنين دون حادثة خاصة منقولة بالتحديد."}
            </div>
          )}
        </div>

        {/* Sculpted 3D Bottom Action Bar */}
        <div 
          data-toast-bottom-bar="true"
          className={`${isLandscape ? 'pt-2 pb-2.5 px-3 gap-3' : 'pt-3.5 pb-4 px-6 modal-sheet-safe-bottom gap-3.5 sm:gap-4'} shrink-0 flex items-center justify-center font-cairo zoom-modal-action-bar-3d`}
          dir="rtl"
          style={{
            backgroundColor: p.modalBg
          }}
        >
          {/* 1. Audio / Recitation Play Button (RIGHTMOST in RTL) */}
          <button 
            type="button"
            onClick={handlePlayAudio}
            className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer font-cairo border-0 quran-raised-btn ${
              isAudioActive ? 'ring-2 ring-red-400/80 animate-pulse' : ''
            }`}
            style={{ 
              backgroundColor: isAudioActive ? '#dc2626' : p.closeBg, 
              color: isAudioActive ? '#ffffff' : p.headerAccent
            }}
            title={isAudioActive ? (isEn ? "Stop Audio" : "إيقاف الصوت") : (isEn ? "Listen" : "استماع")}
          >
            {isAudioActive ? <VolumeX size={isLandscape ? 17 : 20} className="text-white animate-pulse" /> : <Volume2 size={isLandscape ? 17 : 20} style={{ color: p.headerAccent }} />}
          </button>

          {/* 2. Share Button */}
          <button 
            type="button"
            onClick={handleShare}
            className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer font-cairo border-0 quran-raised-btn`}
            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
            title={isEn ? "Share" : "مشاركة"}
          >
            <Share2 size={isLandscape ? 17 : 20} style={{ color: p.headerAccent }} />
          </button>

          {/* 3. Copy Button */}
          <button 
            type="button"
            onClick={handleCopy}
            className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer font-cairo border-0 quran-raised-btn`}
            style={{ 
              backgroundColor: copied ? '#10b981' : p.closeBg, 
              color: copied ? '#ffffff' : p.headerAccent
            }}
            title={isEn ? "Copy" : "نسخ"}
          >
            {copied ? <Check size={isLandscape ? 17 : 20} className="text-white stroke-[2.5]" /> : <Copy size={isLandscape ? 17 : 20} style={{ color: p.headerAccent }} />}
          </button>

          {/* 4. Zoom Button */}
          <button 
            type="button"
            onClick={handleToggleZoom}
            className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer font-cairo border-0 quran-raised-btn`}
            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
            title={isEn ? "Text Size" : "حجم الخط"}
          >
            <ZoomIn size={isLandscape ? 17 : 20} style={{ color: p.headerAccent }} />
          </button>

          {/* 5. Chevron Down / Hide Modal Button (LEFTMOST in RTL) */}
          <button 
            type="button"
            onClick={handleClose}
            className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer font-cairo border-0 quran-raised-btn`}
            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
            title={isEn ? "Close" : "إغلاق"}
          >
            <ChevronDown size={isLandscape ? 18 : 22} style={{ color: p.headerAccent }} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default AsbabNuzulModal;
