import React, { useState, useEffect } from 'react';
import { ChevronDown, ZoomIn, Copy, Check, Share2, Volume2, VolumeX, Layers, BookOpen } from 'lucide-react';
import { getIrabForAyah, AyahSyntaxEntry } from '../../data/irabData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

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

const IrabModal: React.FC<IrabModalProps> = ({
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

  const syntaxEntry: AyahSyntaxEntry = React.useMemo(() => {
    return getIrabForAyah(surahNumber, ayahNumber, verseText);
  }, [surahNumber, ayahNumber, verseText]);

  if (!isOpen) return null;

  const themeAccent = currentTheme?.accent || '#10b981';
  const isDark = currentTheme?.id === 'deep_black';
  const themeAccentColor = isDark ? '#ffffff' : themeAccent;
  const modalBg = currentTheme?.modalBg || currentTheme?.bg || '#ffffff';
  const modalText = currentTheme?.modalText || currentTheme?.text || '#000000';

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
              {isEn ? "Quranic Syntax & I'rab Explorer" : "إعراب الآية والبيان النحوي"}
            </span>
            <span className="text-[11px] font-bold opacity-60 mt-1">
              {isEn 
                ? `Grammatical parsing: ${displaySurah} (Ayah ${ayahNumber})` 
                : `البيان والتحليل النحوي: ${displaySurah} (آية ${toArabic(ayahNumber)})`}
            </span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-3">
          {/* Display Ayah Text */}
          {verseText && (
            <div 
              className="py-3 px-4 my-2.5 rounded-2xl text-center select-text leading-[2.1] font-bold border quran-raised-card transition-all"
              style={{
                backgroundColor: `${themeAccent}0d`,
                borderColor: `${themeAccent}25`,
                fontSize: `${fontSize + 4}px`,
                fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif"
              }}
              dir="rtl"
            >
              {verseText} {ayahNumber ? <span>﴿{toArabic(ayahNumber)}﴾</span> : ''}
            </div>
          )}

          {/* Word by Word Syntax Cards */}
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 font-bold opacity-80 mb-1 transition-all" style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}>
              <Layers size={16} style={{ color: themeAccentColor }} />
              <span>
                {isEn ? "Word-by-Word Grammatical Parsing (Tap word for details):" : "التحليل المفرداتي للكلمات (اضغط على الكلمة للتفاصيل):"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {syntaxEntry.words.map((w, idx) => {
                const isSelected = selectedWordIdx === idx;
                const posText = isEn ? (w.posEn || w.pos) : w.pos;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedWordIdx(isSelected ? null : idx)}
                    className="p-2.5 rounded-xl border text-right transition-all quran-raised-btn flex flex-col justify-between"
                    style={{
                      backgroundColor: isSelected ? `${themeAccent}20` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
                      borderColor: isSelected ? themeAccentColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')
                    }}
                  >
                    <span 
                      className="font-extrabold text-emerald-600 dark:text-emerald-400 transition-all" 
                      style={{ 
                        fontSize: `${fontSize + 2}px`,
                        fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" 
                      }}
                    >
                      {w.word}
                    </span>
                    <span className="font-bold opacity-80 mt-1 line-clamp-1 transition-all" style={{ fontSize: `${Math.max(11, fontSize - 4)}px` }}>{posText}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Word Details */}
            {selectedWordIdx !== null && syntaxEntry.words[selectedWordIdx] && (
              <div 
                className="p-3.5 rounded-2xl border animate-fadeIn quran-raised-card transition-all"
                style={{ backgroundColor: `${themeAccent}10`, borderColor: `${themeAccent}30` }}
              >
                <div className="font-extrabold mb-1 text-emerald-700 dark:text-emerald-300 transition-all" style={{ fontSize: `${fontSize}px` }}>
                  {isEn ? `Grammatical detail: «` : `إعراب كلمة: «`}
                  <span style={{ fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" }}>
                    {syntaxEntry.words[selectedWordIdx].word}
                  </span>
                  »
                </div>
                <div className="font-bold leading-[2.1] opacity-90 transition-all" style={{ fontSize: `${fontSize}px` }}>
                  • <span className="underline">{isEn ? 'Part of Speech:' : 'جزء الكلام والموقع:'}</span> {isEn ? (syntaxEntry.words[selectedWordIdx].posEn || syntaxEntry.words[selectedWordIdx].pos) : syntaxEntry.words[selectedWordIdx].pos}<br/>
                  • <span className="underline">{isEn ? 'Grammatical Analysis:' : 'التفصيل النحوي:'}</span> {isEn ? (syntaxEntry.words[selectedWordIdx].grammarEn || syntaxEntry.words[selectedWordIdx].grammarAr) : syntaxEntry.words[selectedWordIdx].grammarAr}
                </div>
              </div>
            )}

            {/* Overall Sentence Structure & Rhetorical Insight */}
            <div 
              className="p-4 rounded-2xl border quran-raised-card mt-3 transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
              }}
            >
              <div className="flex items-center gap-2 mb-2 font-bold" style={{ color: themeAccentColor, fontSize: `${fontSize + 1}px` }}>
                <BookOpen size={18} />
                <span>{isEn ? "Overall Sentence Structure:" : "إعراب الجمل الكلي والبيان النحوي:"}</span>
              </div>
              <p className="leading-[2.2] font-bold opacity-90 select-text transition-all" style={{ fontSize: `${fontSize}px` }}>
                {overallStructureText}
              </p>

              {rhetoricalInsightText && (
                <div className="mt-3 pt-3 border-t border-dashed border-emerald-500/20 font-bold opacity-90 transition-all" style={{ fontSize: `${fontSize}px` }}>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {isEn ? "Rhetorical Syntax Insight: " : "اللمسة البلاغية: "}
                  </span>
                  <span>{rhetoricalInsightText}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar (5 round action buttons in RTL: Audio on Right, Chevron on Left) */}
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
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border border-slate-200/80 ${
              isAudioActive ? 'ring-2 ring-red-400/80 animate-pulse' : ''
            }`}
            style={{ 
              backgroundColor: isAudioActive ? '#dc2626' : '#ffffff', 
              color: isAudioActive ? '#ffffff' : (currentTheme?.accent || themeAccent)
            }}
            title={isAudioActive ? (isEn ? "Stop Audio" : "إيقاف الصوت") : (isEn ? "Listen" : "استماع")}
          >
            {isAudioActive ? <VolumeX size={20} className="text-white animate-pulse" /> : <Volume2 size={20} style={{ color: currentTheme?.accent || themeAccent }} />}
          </button>

          {/* 2. Share Button */}
          <button 
            onClick={handleShare}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border border-slate-200/80"
            style={{ backgroundColor: '#ffffff', color: currentTheme?.accent || themeAccent }}
            title={isEn ? "Share" : "مشاركة"}
          >
            <Share2 size={20} style={{ color: currentTheme?.accent || themeAccent }} />
          </button>

          {/* 3. Copy Button */}
          <button 
            onClick={handleCopy}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border border-slate-200/80"
            style={{ 
              backgroundColor: copied ? '#10b981' : '#ffffff', 
              color: copied ? '#ffffff' : (currentTheme?.accent || themeAccent)
            }}
            title={isEn ? "Copy" : "نسخ"}
          >
            {copied ? <Check size={20} className="text-white stroke-[2.5]" /> : <Copy size={20} style={{ color: currentTheme?.accent || themeAccent }} />}
          </button>

          {/* 4. Zoom Button */}
          <button 
            onClick={handleToggleZoom}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border border-slate-200/80"
            style={{ backgroundColor: '#ffffff', color: currentTheme?.accent || themeAccent }}
            title={isEn ? "Text Size" : "حجم الخط"}
          >
            <ZoomIn size={20} style={{ color: currentTheme?.accent || themeAccent }} />
          </button>

          {/* 5. Chevron Down / Hide Modal Button (LEFTMOST in RTL) */}
          <button 
            onClick={handleClose}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border border-slate-200/80"
            style={{ backgroundColor: '#ffffff', color: currentTheme?.accent || themeAccent }}
            title={isEn ? "Close" : "إغلاق"}
          >
            <ChevronDown size={22} style={{ color: currentTheme?.accent || themeAccent }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IrabModal;
