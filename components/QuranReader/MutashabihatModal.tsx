import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ZoomIn,
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  GitCompare,
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';
import {
  MutashabihGroup,
  getMutashabihatForAyah,
  cleanSingleWord
} from '../../data/mutashabihatData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_AR, SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { resolveQuranModalPalette } from './modalThemeUtils';

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

const MutashabihatModal: React.FC<MutashabihatModalProps> = React.memo(({
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

  const [fontSize, setFontSize] = useState<number>(16);
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

  // Compute the mutashabihat group dynamically for the EXACT chosen ayah
  const activeGroup: MutashabihGroup | null = useMemo(() => {
    if (!isOpen) return null;
    return getMutashabihatForAyah(surahNumber, ayahNumber, verseText);
  }, [isOpen, surahNumber, ayahNumber, verseText]);

  const isAudioActive = isAudioPlaying !== undefined ? isAudioPlaying : isPlaying;

  const handleClose = () => {
    stopTTS();
    if (onStopAudio && isAudioActive) {
      onStopAudio();
    }
    onClose();
  };

  if (!isOpen || !activeGroup) return null;

  const p = resolveQuranModalPalette(currentTheme);

  // Surah name clean formatting for title
  const cleanSurahName = SURAH_NAMES_AR[surahNumber - 1] || surahName.replace(/سُورَةُ\s*/g, '').trim();
  const surahNameEn = SURAH_NAMES_EN[surahNumber - 1] || `Surah ${surahNumber}`;
  const displaySurah = isEn ? surahNameEn : `سورة ${cleanSurahName}`;

  const groupTopicText = isEn ? (activeGroup.topicEn || activeGroup.topicAr) : activeGroup.topicAr;
  const groupRuleText = isEn ? (activeGroup.summaryRuleEn || activeGroup.summaryRuleAr) : activeGroup.summaryRuleAr;

  const filteredVerses = activeGroup.verses;

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 26 ? 14 : prev + 2));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rhetoricalHeader = activeGroup.rhetoricalSecretAr
      ? (isEn ? `\n\nRhetorical Nuance & Eloquence (Al-Iskafi & Al-Gharnati):\n${activeGroup.rhetoricalSecretAr}` : `\n\nأسرار الفروق البلاغية واللطائف البيانية (درة التنزيل للإسكافي وملاك التأويل للغرناطي):\n${activeGroup.rhetoricalSecretAr}`)
      : '';
    const versesText = activeGroup.verses
      .map(v => {
        const title = `${SURAH_NAMES_EN[v.surahNumber - 1] || SURAH_NAMES_AR[v.surahNumber - 1] || v.surahName} (${isEn ? `Ayah ${v.ayahNumber}` : `آية ${toArabic(v.ayahNumber)}`})`;
        const diff = v.highlightedDifference ? `\n[موضع التباين]: ${v.highlightedDifference}` : '';
        const insight = v.balaghahInsight ? `\n[السر البلاغي]: ${v.balaghahInsight}` : '';
        return `${title}:\n${v.verseText}${diff}${insight}`;
      })
      .join('\n\n');
    const headerRef = isEn ? `[Mutashabihat Concordance - ${groupTopicText}]` : `[متشابهات القرآن - ${groupTopicText}]`;
    const fullText = `${displaySurah} (${isEn ? `Ayah ${ayahNumber}` : `آية ${toArabic(ayahNumber)}`}):\n${verseText}\n\n[القاعدة الذهبية للضبط]:\n${groupRuleText}${rhetoricalHeader}\n\n${headerRef}\n\n${versesText}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (showToast) showToast(isEn ? 'Copied to clipboard' : 'تم نسخ المتشابهات والفروق البلاغية إلى الحافظة');
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const rhetoricalHeader = activeGroup.rhetoricalSecretAr
      ? `\n\n[سر الفرق البلاغي (درة التنزيل وملاك التأويل)]:\n${activeGroup.rhetoricalSecretAr}`
      : '';
    const versesText = activeGroup.verses
      .slice(0, 6)
      .map(v => {
        const diff = v.highlightedDifference ? ` (${v.highlightedDifference})` : '';
        return `• ${SURAH_NAMES_AR[v.surahNumber - 1] || v.surahName} (${toArabic(v.ayahNumber)}): ${v.verseText}${diff}`;
      })
      .join('\n\n');
    const fullShareText = `${displaySurah} (${toArabic(ayahNumber)}):\n${verseText}\n\n[الضابط الإتقاني]:\n${groupRuleText}${rhetoricalHeader}\n\n[النظائر القرآنية]:\n${versesText}`;

    await shareAsImage({
      text: fullShareText,
      title: isEn ? "Mutashabihat & Rhetorical Nuances" : "متشابهات الآية وأسرار الفروق البلاغية",
      source: groupTopicText,
      category: isEn ? "Mutashabihat & Balaghah" : "متشابهات وبلاغة القرآن",
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
    if (verseText) {
      playTTS(verseText, {
        isEn,
        onToast: (msg) => { if (showToast) showToast(msg); }
      });
      setIsPlaying(true);
    }
  };

  // Helper to render verse in amber color without underline
  const amberVerseColor = p.isDark ? '#fbbf24' : '#b45309';

  const renderHighlightedVerse = (
    text: string, 
    phraseToHighlight?: string, 
    isCurrent?: boolean,
    verseColor?: string
  ) => {
    const vColor = verseColor || amberVerseColor;

    if (!phraseToHighlight || !phraseToHighlight.trim()) {
      return <span style={{ color: vColor }}>{text}</span>;
    }

    const cleanTargets = phraseToHighlight
      .split(' ')
      .map(w => cleanSingleWord(w))
      .filter(w => w.length > 1);

    if (cleanTargets.length === 0) return <span style={{ color: vColor }}>{text}</span>;

    const words = text.split(' ');
    return (
      <span style={{ color: vColor }}>
        {words.map((w, idx) => {
          const cw = cleanSingleWord(w);
          const isMatched = cleanTargets.includes(cw);
          return (
            <React.Fragment key={idx}>
              {isMatched ? (
                <span
                  className="font-black"
                  style={{ color: vColor }}
                >
                  {w}
                </span>
              ) : (
                <span className="opacity-95">{w}</span>
              )}
              {idx < words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </span>
    );
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
              <div className="flex items-center gap-2 min-w-0">
                <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide truncate`} style={{ color: p.headerAccent }}>
                  {isEn ? "Verse Concordance & Mutashabihat" : "المتشابهات اللفظية والنظائر"}
                </span>
                {activeGroup.verses.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0 font-cairo">
                    {isEn ? `${activeGroup.verses.length} Matches` : `${toArabic(activeGroup.verses.length)} نظائر`}
                  </span>
                )}
              </div>
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
          {/* 1. Display Selected Current Ayah Text */}
          {verseText && (
            <div 
              className="p-4 rounded-2xl select-text leading-[2.2] font-bold border-0 quran-raised-card relative overflow-hidden"
              style={{
                backgroundColor: p.cardBg,
                fontSize: `${fontSize}px`,
                fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                color: amberVerseColor
              }}
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-amber-600/15 font-cairo">
                <span 
                  className="text-xs font-black px-2.5 py-0.5 rounded-lg tracking-normal"
                  style={{ 
                    backgroundColor: p.isDark ? 'rgba(217, 119, 6, 0.25)' : 'rgba(251, 191, 36, 0.25)', 
                    color: p.isDark ? '#fbbf24' : '#b45309',
                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                    letterSpacing: '0px'
                  }}
                >
                  {displaySurah} - {isEn ? `Ayah ${ayahNumber}` : `آية ${toArabic(ayahNumber)}`}
                </span>
                <span className="text-[11px] font-black text-amber-700 dark:text-amber-300">
                  {isEn ? "★ Selected Ayah" : "★ الآية المختارة الحالية"}
                </span>
              </div>

              <div className="text-right">
                {renderHighlightedVerse(verseText, activeGroup.topicAr || activeGroup.verses[0]?.matchedPhrase, true, amberVerseColor)}
                {ayahNumber ? <span className="inline-block mr-1 opacity-80 text-xs font-cairo" style={{ color: amberVerseColor }}>﴿{toArabic(ayahNumber)}﴾</span> : ''}
              </div>
            </div>
          )}

          {/* Golden Rule Card for Mutashabihat */}
          {groupRuleText && (
            <div 
              className="p-4 rounded-2xl border-0 quran-raised-card font-cairo"
              style={{
                backgroundColor: p.cardBg,
                color: p.cardText
              }}
            >
              <div className="flex items-center gap-2 mb-1.5 text-xs font-black" style={{ color: amberVerseColor }}>
                <Sparkles size={15} />
                <span>{isEn ? "Golden Memorization Rule:" : "الضابط الإتقاني والقاعدة الذهبية للمتشابهة:"}</span>
              </div>
              <p className="text-xs sm:text-[13px] font-bold leading-relaxed text-justify" style={{ color: p.cardText }}>
                {groupRuleText}
              </p>
            </div>
          )}

          {/* Rhetorical Nuances & Eloquence Card */}
          {activeGroup.rhetoricalSecretAr && (
            <div 
              className="p-4 rounded-2xl border-0 quran-raised-card font-cairo"
              style={{
                backgroundColor: p.cardBg,
                color: p.cardText
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-600/15 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                  <BookOpen size={15} />
                  <span>{isEn ? "Rhetorical Secrets & Eloquence Nuances:" : "أسرار الفروق البلاغية واللطائف البيانية:"}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                  {isEn ? "Al-Iskafi & Al-Gharnati" : "درة التنزيل وملاك التأويل"}
                </span>
              </div>
              <p className="text-xs sm:text-[12.5px] font-bold leading-relaxed text-justify" style={{ color: p.cardText }}>
                {activeGroup.rhetoricalSecretAr}
              </p>
              <div className="mt-2.5 px-3 py-1.5 rounded-xl text-[10.5px] flex items-center gap-1 font-bold flex-wrap" style={{ backgroundColor: p.subtleBg }}>
                <span style={{ color: p.mutedText }}>{isEn ? "Classical references:" : "المرجع التراثي المعتمد:"}</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400">
                  {activeGroup.rhetoricalReference || (isEn ? "Durrat Al-Tanzil (Al-Iskafi) & Malak Al-Ta'wil (Al-Gharnati)" : "«درة التنزيل وغرة التأويل» للخطيب الإسكافي و«ملاك التأويل» لابن الزبير الغرناطي")}
                </span>
              </div>
            </div>
          )}

          {/* 2. Comparison Cards Across Surahs */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between font-bold text-xs font-cairo px-1" style={{ color: p.headerAccent }}>
              <div className="flex items-center gap-1.5">
                <GitCompare size={15} style={{ color: p.headerAccent }} />
                <span>
                  {activeGroup.isUniqueAyah
                    ? (isEn ? "Unique Quranic Placement:" : "خصوصية الموضع في كتاب الله:")
                    : (isEn ? "Comparing with similar Quranic verses:" : "مقارنة الموضع مع النظائر والآيات المتشابهة:")}
                </span>
              </div>
              <span className="text-[11px]" style={{ color: p.mutedText }}>
                {isEn ? `${filteredVerses.length} verses` : `${toArabic(filteredVerses.length)} آيات`}
              </span>
            </div>

            {filteredVerses.length === 0 ? (
              <div 
                className="p-6 text-center rounded-2xl border-0 quran-raised-card text-xs font-bold font-cairo"
                style={{ backgroundColor: p.cardBg, color: p.mutedText }}
              >
                {isEn ? "No verses available." : "لا توجد آيات مطابقة."}
              </div>
            ) : (
              filteredVerses.map((v, idx) => {
                const isCurrent = v.surahNumber === surahNumber && v.ayahNumber === ayahNumber;
                const cleanVName = SURAH_NAMES_AR[v.surahNumber - 1] || (v.surahName || '').replace(/سُورَةُ\s*/g, '').trim();
                const vSurahName = isEn ? (SURAH_NAMES_EN[v.surahNumber - 1] || v.surahName) : cleanVName;
                const cardKey = `${v.surahNumber}:${v.ayahNumber}`;

                return (
                  <div
                    key={`${cardKey}-${idx}`}
                    className={`p-4 rounded-2xl border-0 quran-raised-card ${
                      isCurrent ? 'ring-2 ring-amber-500/60' : ''
                    }`}
                    style={{
                      backgroundColor: p.cardBg,
                      color: p.cardText
                    }}
                  >
                    {/* Top Row: Verse Number badge + Surah & Ayah badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap font-cairo">
                        <span 
                          className="font-extrabold flex items-center gap-1.5 font-cairo tracking-normal"
                          style={{ 
                            fontSize: `${Math.max(13, fontSize - 2)}px`, 
                            color: amberVerseColor,
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            letterSpacing: '0px'
                          }}
                        >
                          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-md text-[11px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            {toArabic(idx + 1)}
                          </span>
                          <BookOpen size={13} className="shrink-0" />
                          {vSurahName} - {isEn ? `Ayah ${v.ayahNumber}` : `آية ${toArabic(v.ayahNumber)}`}
                        </span>

                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 font-cairo">
                            {isEn ? 'Current Verse' : 'الموضع الحالي'}
                          </span>
                        ) : v.matchTypeDesc ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 font-cairo">
                            {v.matchTypeDesc}
                          </span>
                        ) : null}

                        {v.juz && (
                          <span className="text-[10px] font-bold hidden sm:inline font-cairo" style={{ color: p.mutedText }}>
                            {isEn ? `Juz ${v.juz}` : `الجزء ${toArabic(v.juz)}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Verse Text rendered in Amiri Quran font with amber color */}
                    <p 
                      className="font-normal leading-[2.2] select-text text-right my-1.5" 
                      style={{ 
                        fontSize: `${Math.max(14, fontSize - 1)}px`,
                        fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                        color: amberVerseColor
                      }} 
                      dir="rtl"
                    >
                      {renderHighlightedVerse(v.verseText, v.matchedPhrase || activeGroup.topicAr, isCurrent, amberVerseColor)}
                    </p>

                    {/* Difference and Balaghah Insight for this specific occurrence */}
                    {(v.highlightedDifference || v.balaghahInsight || v.contextExplanation) && (
                      <div 
                        className="mt-2.5 pt-2.5 border-t border-slate-200/50 dark:border-white/10 space-y-1.5 font-cairo text-right"
                      >
                        {v.highlightedDifference && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10.5px] font-bold" style={{ color: p.mutedText }}>
                              {isEn ? "Variation Point:" : "موضع التباين:"}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-500/15 text-amber-800 dark:text-amber-200">
                              {v.highlightedDifference}
                            </span>
                          </div>
                        )}
                        {v.balaghahInsight && (
                          <p className="text-[11.5px] font-bold leading-relaxed text-justify pt-0.5" style={{ color: p.cardText }}>
                            <span className="text-emerald-700 dark:text-emerald-400 font-black ml-1">﴿السر البلاغي﴾:</span>
                            {v.balaghahInsight}
                          </p>
                        )}
                        {!v.balaghahInsight && v.contextExplanation && (
                          <p className="text-[11.5px] font-bold leading-relaxed text-justify pt-0.5" style={{ color: p.cardText }}>
                            <span className="text-amber-700 dark:text-amber-300 font-black ml-1">﴿التوجيه﴾:</span>
                            {v.contextExplanation}
                          </p>
                        )}
                        {v.balaghahReference && (
                          <div className="text-[10px] font-bold flex items-center gap-1 pt-0.5" style={{ color: p.mutedText }}>
                            <span>{isEn ? "Ref:" : "المرجع:"}</span>
                            <span>{v.balaghahReference}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
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
            title={isEn ? "Share" : "مشاركة المتشابهات"}
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
            title={isEn ? "Copy" : "نسخ المتشابهات"}
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

export default MutashabihatModal;
