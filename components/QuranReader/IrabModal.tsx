import React, { useState, useEffect } from 'react';
import { ChevronDown, ZoomIn, Copy, Check, Share2, Volume2, VolumeX, Layers, BookOpen, X } from 'lucide-react';
import { getIrabForAyah, AyahSyntaxEntry } from '../../data/irabData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { resolveQuranModalPalette } from './modalThemeUtils';

interface IrabModalProps {
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

const IrabModal: React.FC<IrabModalProps> = React.memo(({
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
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);

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

  const syntaxEntry: AyahSyntaxEntry | null = React.useMemo(() => {
    if (!isOpen) return null;
    return getIrabForAyah(surahNumber, ayahNumber, verseText);
  }, [isOpen, surahNumber, ayahNumber, verseText]);

  if (!isOpen || !syntaxEntry) return null;

  const p = resolveQuranModalPalette(currentTheme);

  const surahNameEn = SURAH_NAMES_EN[surahNumber - 1] || `Surah ${surahNumber}`;
  const displaySurah = isEn ? surahNameEn : (surahName.includes('سورة') ? surahName : `سورة ${surahName}`);

  const overallStructureText = isEn 
    ? (syntaxEntry.overallStructureEn || syntaxEntry.overallStructureAr)
    : syntaxEntry.overallStructureAr;

  const rhetoricalInsightText = isEn
    ? (syntaxEntry.rhetoricalInsightEn || syntaxEntry.rhetoricalInsightAr)
    : syntaxEntry.rhetoricalInsightAr;

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 32 ? 16 : prev + 3));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wordListText = syntaxEntry.words
      .map(w => `${w.word}: ${isEn ? (w.posEn || w.pos) : w.pos} - ${isEn ? (w.grammarEn || w.grammarAr) : w.grammarAr}`)
      .join('\n');
    const headerRef = isEn
      ? `[Quranic I'rab - ${displaySurah} Ayah ${ayahNumber}]`
      : `[إعراب الآية - ${displaySurah} آية ${toArabic(ayahNumber)}]`;
    const fullText = verseText 
      ? `${verseText}\n\n${isEn ? 'Word-by-Word Parsing:' : 'الإعراب المفرداتي:'}\n${wordListText}\n\n${isEn ? 'Sentence Structure:' : 'إعراب الجمل:'}\n${overallStructureText}\n\n${headerRef}` 
      : `${wordListText}\n\n${headerRef}`;

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
    const wordListText = syntaxEntry.words
      .slice(0, 6)
      .map(w => `• ${w.word}: ${isEn ? (w.posEn || w.pos) : w.pos}`)
      .join('\n');
    const fullShareText = verseText ? `${verseText}\n\n${wordListText}` : wordListText;
    const sourceRef = isEn ? `${displaySurah} (Ayah ${ayahNumber})` : `${displaySurah} (آية ${toArabic(ayahNumber)})`;

    await shareAsImage({
      text: fullShareText,
      title: isEn ? "Quranic Syntax & I'rab" : "إعراب الآية وبيانها",
      source: sourceRef,
      category: isEn ? "Grammatical Parsing" : "إعراب القرآن",
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
    const textToRead = verseText ? `${verseText}. ${overallStructureText}` : overallStructureText;
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
                {isEn ? "Quranic Syntax & I'rab Explorer" : "إعراب الآية والبيان النحوي"}
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

          {/* Word by Word Syntax Cards */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 font-bold px-1" style={{ fontSize: `${Math.max(12, fontSize - 2)}px`, color: p.headerAccent }}>
              <Layers size={16} style={{ color: p.headerAccent }} />
              <span>
                {isEn ? "Word-by-Word Grammatical Parsing (Tap word for details):" : "التحليل المفرداتي للكلمات (اضغط على الكلمة للتفاصيل):"}
              </span>
            </div>

            <div className={`grid ${isLandscape ? 'grid-cols-3 gap-2' : 'grid-cols-2 sm:grid-cols-3 gap-3'} pb-1`}>
              {syntaxEntry.words.map((w, idx) => {
                const isSelected = selectedWordIdx === idx;
                const posText = isEn ? (w.posEn || w.pos) : w.pos;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedWordIdx(isSelected ? null : idx)}
                    className={`${isLandscape ? 'p-2 rounded-xl' : 'p-3 rounded-2xl'} border-0 text-right flex flex-col justify-between cursor-pointer ${
                      isSelected ? 'quran-raised-btn-selected' : 'quran-raised-btn'
                    }`}
                    style={{
                      backgroundColor: isSelected ? undefined : p.cardBg,
                      color: isSelected ? p.selectedText : p.cardText
                    }}
                  >
                    <span 
                      className="font-extrabold" 
                      style={{ 
                        fontSize: `${fontSize + 2}px`,
                        fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                        color: isSelected ? p.selectedText : (p.isDark ? '#34d399' : '#059669')
                      }}
                    >
                      {w.word}
                    </span>
                    <span 
                      className="font-bold mt-1 line-clamp-1" 
                      style={{ 
                        fontSize: `${Math.max(11, fontSize - 4)}px`,
                        color: isSelected ? p.selectedText : p.mutedText
                      }}
                    >
                      {posText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Word Details */}
            {selectedWordIdx !== null && syntaxEntry.words[selectedWordIdx] && (
              <div 
                className="p-4 rounded-2xl border-0 quran-raised-card"
                style={{ backgroundColor: p.cardBg, color: p.cardText }}
              >
                <div className="font-extrabold mb-1.5" style={{ fontSize: `${fontSize}px`, color: p.headerAccent }}>
                  {isEn ? `Grammatical detail: «` : `إعراب كلمة: «`}
                  <span style={{ fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" }}>
                    {syntaxEntry.words[selectedWordIdx].word}
                  </span>
                  »
                </div>
                <div className="font-bold leading-[2.1]" style={{ fontSize: `${fontSize}px`, color: p.cardText }}>
                  • <span className="underline">{isEn ? 'Part of Speech:' : 'جزء الكلام والموقع:'}</span> {isEn ? (syntaxEntry.words[selectedWordIdx].posEn || syntaxEntry.words[selectedWordIdx].pos) : syntaxEntry.words[selectedWordIdx].pos}<br/>
                  • <span className="underline">{isEn ? 'Grammatical Analysis:' : 'التفصيل النحوي:'}</span> {isEn ? (syntaxEntry.words[selectedWordIdx].grammarEn || syntaxEntry.words[selectedWordIdx].grammarAr) : syntaxEntry.words[selectedWordIdx].grammarAr}
                </div>
              </div>
            )}

            {/* Overall Sentence Structure & Rhetorical Insight */}
            <div 
              className="p-4 sm:p-5 rounded-2xl border-0 quran-raised-card"
              style={{
                backgroundColor: p.cardBg,
                color: p.cardText
              }}
            >
              <div className="flex items-center gap-2 mb-2 font-bold" style={{ color: p.headerAccent, fontSize: `${fontSize + 1}px` }}>
                <BookOpen size={18} />
                <span>{isEn ? "Overall Sentence Structure:" : "إعراب الجمل الكلي والبيان النحوي:"}</span>
              </div>
              <p className="leading-[2.2] font-bold select-text" style={{ fontSize: `${fontSize}px`, color: p.cardText }}>
                {overallStructureText}
              </p>

              {rhetoricalInsightText && (
                <div className="mt-3 pt-3 border-t border-dashed border-emerald-500/20 font-bold" style={{ fontSize: `${fontSize}px`, color: p.cardText }}>
                  <span className="font-extrabold" style={{ color: p.isDark ? '#34d399' : '#059669' }}>
                    {isEn ? "Rhetorical Syntax Insight: " : "اللمسة البلاغية: "}
                  </span>
                  <span>{rhetoricalInsightText}</span>
                </div>
              )}
            </div>
          </div>
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

export default IrabModal;
