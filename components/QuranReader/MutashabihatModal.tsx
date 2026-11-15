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
  ExternalLink, 
  Sparkles, 
  Search, 
  BookOpen, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  MutashabihGroup, 
  MutashabihVerse, 
  getMutashabihatForAyah, 
  cleanSingleWord,
  CLASSICAL_MUTASHABIHAT_GROUPS
} from '../../data/mutashabihatData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_AR, SURAH_NAMES_EN, toArabic } from './constants';
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
  const activeGroup: MutashabihGroup = useMemo(() => {
    return getMutashabihatForAyah(surahNumber, ayahNumber, verseText);
  }, [surahNumber, ayahNumber, verseText]);

  const isAudioActive = isAudioPlaying !== undefined ? isAudioPlaying : isPlaying;

  const handleClose = () => {
    stopTTS();
    if (onStopAudio && isAudioActive) {
      onStopAudio();
    }
    onClose();
  };

  if (!isOpen) return null;

  const themeAccent = currentTheme?.accent || '#10b981';
  const isDark = currentTheme?.id === 'deep_black';
  const themeAccentColor = isDark ? '#ffffff' : themeAccent;
  const modalBg = currentTheme?.modalBg || currentTheme?.bg || '#ffffff';
  const modalText = currentTheme?.modalText || currentTheme?.text || '#000000';

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
  const amberVerseColor = isDark ? '#f59e0b' : '#d97706';

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
      className="fixed inset-0 z-[1300] bg-black/65 backdrop-blur-xs flex flex-col justify-end select-none animate-fadeIn"
      onClick={handleClose}
      dir={dir}
    >
      <div 
        className={`zoom-modal-sheet w-full max-w-xl mx-auto rounded-t-[32px] flex flex-col overflow-hidden relative shadow-2xl animate-modal-enter ${
          isLandscape ? 'max-h-[92dvh]' : 'max-h-[88dvh]'
        }`}
        style={{ 
          backgroundColor: modalBg, 
          color: modalText,
          fontFamily: currentTheme?.font || "'Cairo', sans-serif"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Drag Handle & Title Header */}
        <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center border-b border-slate-200/50 dark:border-white/10">
          <div className="w-12 h-1.5 rounded-full mb-2 bg-slate-300 dark:bg-zinc-700 opacity-70 mx-auto" />
          
          <div className="w-full flex flex-col items-center justify-center relative px-2 py-0.5">
            <div className="flex items-center gap-2">
              <span 
                className="text-[13px] font-extrabold opacity-90 font-cairo tracking-normal"
                style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", letterSpacing: '0px', color: themeAccentColor }}
              >
                {isEn 
                  ? `Verse Concordance: ${displaySurah} (Ayah ${ayahNumber})` 
                  : `المتشابهات والنظائر: ${displaySurah} (آية ${toArabic(ayahNumber)})`}
              </span>
              {activeGroup.verses.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-cairo">
                  {isEn ? `${activeGroup.verses.length} Matches` : `${toArabic(activeGroup.verses.length)} نظائر`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 px-5 sm:px-6 py-3 space-y-3">
          {/* 1. Display Selected Current Ayah Text (Colored distinctly with warm cream/amber tint) */}
          {verseText && (
            <div 
              className="p-3.5 sm:p-4 rounded-2xl select-text leading-[2.2] font-bold border quran-raised-card transition-all relative overflow-hidden shadow-xs"
              style={{
                backgroundColor: isDark ? 'rgba(217, 119, 6, 0.16)' : 'rgba(254, 243, 199, 0.7)',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(217, 119, 6, 0.35)',
                fontSize: `${fontSize}px`,
                fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                color: amberVerseColor
              }}
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-amber-600/15 font-cairo">
                <span 
                  className="text-xs font-black px-2.5 py-0.5 rounded-md tracking-normal border border-amber-600/30"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(217, 119, 6, 0.25)' : 'rgba(251, 191, 36, 0.3)', 
                    color: isDark ? '#fbbf24' : '#b45309',
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
              className="p-3.5 sm:p-4 rounded-2xl border quran-raised-card font-cairo shadow-xs transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(217, 119, 6, 0.1)' : 'rgba(254, 243, 199, 0.5)',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.25)'
              }}
            >
              <div className="flex items-center gap-2 mb-1.5 text-xs font-black" style={{ color: amberVerseColor }}>
                <Sparkles size={15} />
                <span>{isEn ? "Golden Memorization Rule:" : "الضابط الإتقاني والقاعدة الذهبية للمتشابهة:"}</span>
              </div>
              <p className="text-xs sm:text-[13px] font-bold leading-relaxed opacity-95 text-justify" style={{ color: modalText }}>
                {groupRuleText}
              </p>
            </div>
          )}

          {/* Rhetorical Nuances & Eloquence Card (أسرار الفروق البلاغية واللطائف البيانية) */}
          {activeGroup.rhetoricalSecretAr && (
            <div 
              className="p-3.5 sm:p-4 rounded-2xl border quran-raised-card font-cairo shadow-xs transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(236, 253, 245, 0.7)',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.3)'
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-emerald-600/15">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                  <BookOpen size={15} />
                  <span>{isEn ? "Rhetorical Secrets & Eloquence Nuances:" : "أسرار الفروق البلاغية واللطائف البيانية:"}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                  {isEn ? "Al-Iskafi & Al-Gharnati" : "درة التنزيل وملاك التأويل"}
                </span>
              </div>
              <p className="text-xs sm:text-[12.5px] font-bold leading-relaxed text-justify opacity-95" style={{ color: modalText }}>
                {activeGroup.rhetoricalSecretAr}
              </p>
              <div className="mt-2 text-[10.5px] opacity-70 flex items-center gap-1 font-bold">
                <span>{isEn ? "Classical references:" : "المرجع التراثي المعتمد:"}</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400">
                  {activeGroup.rhetoricalReference || (isEn ? "Durrat Al-Tanzil (Al-Iskafi) & Malak Al-Ta'wil (Al-Gharnati)" : "«درة التنزيل وغرة التأويل» للخطيب الإسكافي و«ملاك التأويل» لابن الزبير الغرناطي")}
                </span>
              </div>
            </div>
          )}

          {/* 2. Comparison Cards Across Surahs */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between font-bold opacity-80 transition-all text-xs font-cairo">
              <div className="flex items-center gap-1.5">
                <GitCompare size={15} style={{ color: themeAccentColor }} />
                <span>
                  {activeGroup.isUniqueAyah
                    ? (isEn ? "Unique Quranic Placement:" : "خصوصية الموضع في كتاب الله:")
                    : (isEn ? "Comparing with similar Quranic verses:" : "مقارنة الموضع مع النظائر والآيات المتشابهة:")}
                </span>
              </div>
              <span className="text-[11px] opacity-70">
                {isEn ? `${filteredVerses.length} verses` : `${toArabic(filteredVerses.length)} آيات`}
              </span>
            </div>

            {filteredVerses.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 opacity-60 text-xs font-bold font-cairo">
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
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all quran-raised-card ${
                      isCurrent ? 'ring-2 ring-amber-500/50' : ''
                    }`}
                    style={{
                      backgroundColor: isCurrent ? (isDark ? 'rgba(217,119,6,0.12)' : 'rgba(254, 243, 199, 0.35)') : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                      borderColor: isCurrent ? amberVerseColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')
                    }}
                  >
                    {/* Top Row: Verse Number badge + Surah & Ayah badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap font-cairo">
                        <span 
                          className="font-extrabold transition-all flex items-center gap-1.5 font-cairo tracking-normal"
                          style={{ 
                            fontSize: `${Math.max(13, fontSize - 2)}px`, 
                            color: amberVerseColor,
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            letterSpacing: '0px'
                          }}
                        >
                          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-md text-[11px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
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
                          <span className="text-[10px] opacity-60 font-bold hidden sm:inline font-cairo">
                            {isEn ? `Juz ${v.juz}` : `الجزء ${toArabic(v.juz)}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Verse Text rendered in Amiri Quran font with amber color */}
                    <p 
                      className="font-normal leading-[2.2] select-text transition-all text-right my-1.5" 
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
                        className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-white/10 space-y-1.5 font-cairo text-right"
                      >
                        {v.highlightedDifference && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10.5px] font-bold opacity-75">
                              {isEn ? "Variation Point:" : "موضع التباين:"}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/25">
                              {v.highlightedDifference}
                            </span>
                          </div>
                        )}
                        {v.balaghahInsight && (
                          <p className="text-[11.5px] font-bold leading-relaxed opacity-90 text-justify pt-0.5">
                            <span className="text-emerald-700 dark:text-emerald-400 font-black ml-1">﴿السر البلاغي﴾:</span>
                            {v.balaghahInsight}
                          </p>
                        )}
                        {!v.balaghahInsight && v.contextExplanation && (
                          <p className="text-[11.5px] font-bold leading-relaxed opacity-85 text-justify pt-0.5">
                            <span className="text-amber-700 dark:text-amber-300 font-black ml-1">﴿التوجيه﴾:</span>
                            {v.contextExplanation}
                          </p>
                        )}
                        {v.balaghahReference && (
                          <div className="text-[10px] opacity-60 font-bold flex items-center gap-1 pt-0.5">
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

        {/* Bottom Action Bar (matching UI: 5 round action buttons in RTL) */}
        <div 
          data-toast-bottom-bar="true"
          className="pt-3 px-6 modal-sheet-safe-bottom border-t shrink-0 flex items-center justify-center gap-3 sm:gap-4 font-cairo border-slate-200/50 dark:border-white/10"
          dir="rtl"
          style={{
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
            title={isEn ? "Share" : "مشاركة المتشابهات"}
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
            title={isEn ? "Copy" : "نسخ المتشابهات"}
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

export default MutashabihatModal;
