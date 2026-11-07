import React, { useState, useEffect } from 'react';
import { ChevronDown, ZoomIn, Copy, Check, Share2, Volume2, VolumeX, GitCompare, ExternalLink, Sparkles } from 'lucide-react';
import { MUTASHABIHAT_GROUPS, MutashabihGroup, getMutashabihatForAyah } from '../../data/mutashabihatData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

interface MutashabihatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: any;
  surahNumber?: number;
  ayahNumber?: number;
  surahName?: string;
  verseText?: string;
  onJumpToAyah?: (surah: number, ayahNumber: number) => void;
  onPlayAudio?: (surah: number, ayah: number) => void;
  onStopAudio?: () => void;
  isAudioPlaying?: boolean;
  showToast?: (msg: string) => void;
  isLandscape?: boolean;
}

const MutashabihatModal: React.FC<MutashabihatModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  surahNumber = 1,
  ayahNumber = 1,
  surahName = '',
  verseText = '',
  onJumpToAyah,
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

  const currentAyahGroup = React.useMemo(() => {
    return getMutashabihatForAyah(surahNumber, ayahNumber);
  }, [surahNumber, ayahNumber]);

  const [selectedGroup, setSelectedGroup] = useState<MutashabihGroup>(() => {
    return currentAyahGroup || MUTASHABIHAT_GROUPS[0];
  });

  useEffect(() => {
    if (currentAyahGroup) {
      setSelectedGroup(currentAyahGroup);
    }
  }, [currentAyahGroup]);

  if (!isOpen) return null;

  const themeAccent = currentTheme?.accent || '#10b981';
  const isDark = currentTheme?.id === 'deep_black';
  const themeAccentColor = isDark ? '#ffffff' : themeAccent;
  const modalBg = currentTheme?.modalBg || currentTheme?.bg || '#ffffff';
  const modalText = currentTheme?.modalText || currentTheme?.text || '#000000';

  const surahNameEn = SURAH_NAMES_EN[surahNumber - 1] || `Surah ${surahNumber}`;
  const displaySurah = isEn ? surahNameEn : (surahName.includes('سورة') ? surahName : `سورة ${surahName}`);

  const groupTopicText = isEn ? (selectedGroup.topicEn || selectedGroup.topicAr) : selectedGroup.topicAr;
  const groupRuleText = isEn ? (selectedGroup.summaryRuleEn || selectedGroup.summaryRuleAr) : selectedGroup.summaryRuleAr;

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 32 ? 16 : prev + 3));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const versesText = selectedGroup.verses
      .map(v => `${SURAH_NAMES_EN[v.surahNumber - 1] || v.surahName} (${isEn ? `Ayah ${v.ayahNumber}` : `آية ${toArabic(v.ayahNumber)}`}):\n${v.verseText}`)
      .join('\n\n');
    const headerRef = isEn ? `[Mutashabihat Concordance - ${groupTopicText}]` : `[متشابهات القرآن - ${groupTopicText}]`;
    const fullText = `${groupRuleText}\n\n${versesText}\n\n${headerRef}`;

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
    const versesText = selectedGroup.verses
      .map(v => `• ${SURAH_NAMES_EN[v.surahNumber - 1] || v.surahName} (${v.ayahNumber}): ${v.verseText}`)
      .join('\n\n');
    const fullShareText = `${groupRuleText}\n\n${versesText}`;

    await shareAsImage({
      text: fullShareText,
      title: isEn ? "Mutashabihat & Verse Concordance" : "متشابهات الآية اللفظية",
      source: groupTopicText,
      category: isEn ? "Mutashabihat" : "متشابهات القرآن",
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
    const textToRead = verseText ? `${verseText}. ${groupRuleText}` : groupRuleText;
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
              {isEn ? "Mutashabihat & Ayah Concordance Engine" : "محرك المتشابهات اللفظية للآية"}
            </span>
            <span className="text-[11px] font-bold opacity-60 mt-1">
              {isEn 
                ? `Verse Concordance: ${displaySurah} (Ayah ${ayahNumber})` 
                : `المتشابهات والنظائر: ${displaySurah} (آية ${toArabic(ayahNumber)})`}
            </span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-3">
          {/* Display Ayah Text if available */}
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

          {/* Golden Rule Summary */}
          <div 
            className="p-4 my-2 rounded-2xl border quran-raised-card transition-all"
            style={{ backgroundColor: `${themeAccent}08`, borderColor: `${themeAccent}20` }}
          >
            <div className="flex items-center gap-2 mb-1.5 font-bold" style={{ color: themeAccentColor, fontSize: `${fontSize + 1}px` }}>
              <Sparkles size={18} />
              <span>{isEn ? "Golden Rule for Distinguishing Verses:" : "القاعدة الذهبية للضبط والتمييز:"}</span>
            </div>
            <p className="leading-[2.2] font-bold opacity-90 select-text transition-all" style={{ fontSize: `${fontSize}px` }}>
              {groupRuleText}
            </p>
          </div>

          {/* Comparison Cards Across Surahs */}
          <div className="space-y-3 my-3">
            <div className="flex items-center gap-2 font-bold opacity-80 transition-all" style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}>
              <GitCompare size={16} style={{ color: themeAccentColor }} />
              <span>{isEn ? "Comparing verse with similar Quranic passages:" : "مقارنة الموضع الحالي مع النظائر والآيات المتشابهة:"}</span>
            </div>

            {selectedGroup.verses.map((v, idx) => {
              const isCurrent = v.surahNumber === surahNumber && v.ayahNumber === ayahNumber;
              const vSurahName = isEn ? (SURAH_NAMES_EN[v.surahNumber - 1] || v.surahName) : v.surahName;
              const contextText = isEn ? (v.contextExplanationEn || v.contextExplanation) : v.contextExplanation;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all quran-raised-card ${
                    isCurrent ? 'ring-2 ring-emerald-500/40' : ''
                  }`}
                  style={{
                    backgroundColor: isCurrent ? `${themeAccent}12` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                    borderColor: isCurrent ? themeAccentColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 transition-all" style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}>
                      {vSurahName} - {isEn ? `Ayah ${v.ayahNumber}` : `آية ${toArabic(v.ayahNumber)}`} {isCurrent && (isEn ? '(Current Verse)' : '(الموضع الحالي)')}
                    </span>
                    {onJumpToAyah && (
                      <button
                        onClick={() => {
                          onJumpToAyah(v.surahNumber, v.ayahNumber);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all quran-raised-btn"
                        style={{ backgroundColor: `${themeAccent}18`, borderColor: `${themeAccent}30`, color: themeAccentColor }}
                      >
                        <span>{isEn ? "Jump" : "انتقال"}</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>

                  <p className="font-bold leading-[2.2] select-text transition-all" style={{ fontSize: `${fontSize + 2}px` }} dir="rtl">
                    {v.verseText}
                  </p>

                  <div className="mt-2 font-extrabold opacity-80 text-amber-600 dark:text-amber-400 transition-all" style={{ fontSize: `${fontSize}px` }}>
                    💡 {isEn ? 'Key difference & wisdom:' : 'موضع الفروق والدلالة:'} {v.highlightedDifference} - {contextText}
                  </div>
                </div>
              );
            })}
          </div>

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

export default MutashabihatModal;
