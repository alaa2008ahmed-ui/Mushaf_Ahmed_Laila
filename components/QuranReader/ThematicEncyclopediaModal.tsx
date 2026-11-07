import React, { useState, useEffect } from 'react';
import { ChevronDown, ZoomIn, Copy, Check, Share2, Volume2, VolumeX, BookOpen, Search, ExternalLink } from 'lucide-react';
import { THEMATIC_CATEGORIES, ThematicCategory, ThematicConcept, ThematicVerse } from '../../data/thematicQuranData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

interface ThematicEncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: any;
  onJumpToAyah?: (surah: number, ayah: number) => void;
  showToast?: (msg: string) => void;
  isLandscape?: boolean;
}

const ThematicEncyclopediaModal: React.FC<ThematicEncyclopediaModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onJumpToAyah,
  showToast,
  isLandscape = false
}) => {
  const { language, dir } = useLanguage();
  const isEn = language === 'en';

  const [fontSize, setFontSize] = useState<number>(17);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedAyahKey, setCopiedAyahKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ThematicCategory>(THEMATIC_CATEGORIES[0]);
  const [selectedConcept, setSelectedConcept] = useState<ThematicConcept>(THEMATIC_CATEGORIES[0].concepts[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeTTS((playingText) => {
      setIsPlaying(Boolean(playingText));
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const allFilteredConcepts = React.useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: { categoryName: string; concept: ThematicConcept }[] = [];
    THEMATIC_CATEGORIES.forEach(cat => {
      const cName = isEn ? (cat.nameEn || cat.nameAr) : cat.nameAr;
      cat.concepts.forEach(c => {
        const titleText = isEn ? (c.titleEn || c.titleAr) : c.titleAr;
        const descText = isEn ? (c.descriptionEn || c.descriptionAr) : c.descriptionAr;
        if (
          titleText.toLowerCase().includes(q) ||
          descText.toLowerCase().includes(q) ||
          c.verses.some(v => v.verseSnippet.toLowerCase().includes(q) || (v.keyMeaningEn || v.keyMeaningAr).toLowerCase().includes(q))
        ) {
          results.push({ categoryName: cName, concept: c });
        }
      });
    });
    return results;
  }, [searchQuery, isEn]);

  if (!isOpen) return null;

  const themeAccent = currentTheme?.accent || '#10b981';
  const isDark = currentTheme?.id === 'deep_black';
  const themeAccentColor = isDark ? '#ffffff' : themeAccent;
  const modalBg = currentTheme?.modalBg || currentTheme?.bg || '#ffffff';
  const modalText = currentTheme?.modalText || currentTheme?.text || '#000000';

  const conceptTitleText = isEn ? (selectedConcept.titleEn || selectedConcept.titleAr) : selectedConcept.titleAr;
  const conceptDescText = isEn ? (selectedConcept.descriptionEn || selectedConcept.descriptionAr) : selectedConcept.descriptionAr;

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 28 ? 15 : prev + 3));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const versesText = selectedConcept.verses
      .map(v => {
        const sName = isEn ? (SURAH_NAMES_EN[v.surahNumber - 1] || v.surahName) : v.surahName;
        const meaning = isEn ? (v.keyMeaningEn || v.keyMeaningAr) : v.keyMeaningAr;
        return `${sName} (${isEn ? `Ayah ${v.ayahNumber}` : `آية ${toArabic(v.ayahNumber)}`}):\n${v.verseSnippet}\n${isEn ? 'Meaning:' : 'المعنى والمقصد:'} ${meaning}`;
      })
      .join('\n\n');
    const headerRef = isEn ? `[Thematic Encyclopedia - ${conceptTitleText}]` : `[الموسوعة الموضوعية للقرآن - ${conceptTitleText}]`;
    const fullText = `${conceptDescText}\n\n${versesText}\n\n${headerRef}`;

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
    const versesText = selectedConcept.verses
      .map(v => `• ${isEn ? (SURAH_NAMES_EN[v.surahNumber - 1] || v.surahName) : v.surahName} (${v.ayahNumber}): ${v.verseSnippet}`)
      .join('\n\n');
    const fullShareText = `${conceptTitleText}\n\n${conceptDescText}\n\n${versesText}`;

    await shareAsImage({
      text: fullShareText,
      title: isEn ? "Thematic Quranic Encyclopedia" : "الموسوعة الموضوعية للقرآن",
      source: conceptTitleText,
      category: isEn ? "Thematic Index" : "الفهرس الموضوعي",
      isEn,
      language: isEn ? 'en' : 'ar',
      setToastMessage: showToast,
    });
  };


  const handleCopySingleVerse = (e: React.MouseEvent, v: ThematicVerse) => {
    e.stopPropagation();
    const sName = isEn ? (SURAH_NAMES_EN[v.surahNumber - 1] || v.surahName) : v.surahName;
    const meaning = isEn ? (v.keyMeaningEn || v.keyMeaningAr) : v.keyMeaningAr;
    const key = `${v.surahNumber}:${v.ayahNumber}`;
    const text = `${sName} (${isEn ? `Ayah ${v.ayahNumber}` : `آية ${toArabic(v.ayahNumber)}`}):\n${v.verseSnippet}\n${isEn ? 'Key purpose:' : 'المقصد والمفهوم:'} ${meaning}\n[${isEn ? "Thematic Quranic Encyclopedia" : "الموسوعة والمفاهيم القرآنية"}]`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedAyahKey(key);
        setTimeout(() => setCopiedAyahKey(null), 1800);
        if (showToast) showToast(isEn ? 'Ayah copied' : 'تم نسخ الآية');
      });
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopTTS();
      setIsPlaying(false);
      return;
    }
    const textToRead = `${conceptTitleText}. ${conceptDescText}`;
    playTTS(textToRead, {
      isEn,
      onToast: (msg) => { if (showToast) showToast(msg); }
    });
    setIsPlaying(true);
  };

  return (
    <div 
      className="fixed inset-0 z-[1300] bg-black/65 backdrop-blur-xs flex flex-col justify-end select-none animate-fadeIn"
      onClick={onClose}
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
              {isEn ? "Thematic Quranic Encyclopedia" : "الموسوعة والفهرس الموضوعي للقرآن"}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-2 pb-1 shrink-0">
          <div 
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
            }}
          >
            <Search size={16} className="opacity-50" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search topics (e.g. Sabr, Parents, Tawheed)..." : "ابحث في المفاهيم الموضوعية (مثل: الصبر، التوكل، بر الوالدين)..."}
              className="bg-transparent border-0 outline-none w-full text-xs sm:text-sm placeholder:opacity-50 font-bold"
              style={{ color: modalText }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 opacity-60 hover:opacity-100">
                ×
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-3">
          {!allFilteredConcepts ? (
            <>
              {/* Category Pills Header */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 custom-scrollbar">
                {THEMATIC_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.id === cat.id;
                  const catLabel = isEn ? (cat.nameEn || cat.nameAr) : cat.nameAr;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedConcept(cat.concepts[0]);
                      }}
                      className="px-3.5 py-1.5 rounded-xl font-extrabold text-xs whitespace-nowrap border transition-all quran-raised-btn"
                      style={{
                        backgroundColor: isSelected ? `${themeAccent}25` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
                        borderColor: isSelected ? themeAccentColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                        color: isSelected ? themeAccentColor : modalText
                      }}
                    >
                      {catLabel}
                    </button>
                  );
                })}
              </div>

              {/* Concept Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar">
                {selectedCategory.concepts.map((c) => {
                  const isSelected = selectedConcept.id === c.id;
                  const cTitle = isEn ? (c.titleEn || c.titleAr) : c.titleAr;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConcept(c)}
                      className="px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap border transition-all quran-raised-btn"
                      style={{
                        backgroundColor: isSelected ? `${themeAccent}18` : 'transparent',
                        borderColor: isSelected ? themeAccentColor : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                        color: isSelected ? themeAccentColor : modalText
                      }}
                    >
                      {cTitle}
                    </button>
                  );
                })}
              </div>

              {/* Concept Header Card */}
              <div 
                className="p-4 rounded-2xl border quran-raised-card space-y-2 mb-3"
                style={{ backgroundColor: `${themeAccent}08`, borderColor: `${themeAccent}20` }}
              >
                <h4 className="font-extrabold text-base" style={{ color: themeAccentColor }}>
                  {conceptTitleText}
                </h4>
                <p className="text-xs sm:text-sm font-bold leading-[2] opacity-90 select-text" style={{ fontSize: `${fontSize}px` }}>
                  {conceptDescText}
                </p>
              </div>

              {/* Linked Verses */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-xs opacity-80">
                  <BookOpen size={16} style={{ color: themeAccentColor }} />
                  <span>
                    {isEn ? `Quranic verses related to «${conceptTitleText}»:` : `الآيات القرآنية المرتبطة بـ «${conceptTitleText}»:`}
                  </span>
                </div>

                {selectedConcept.verses.map((v, idx) => {
                  const vSurahName = isEn ? (SURAH_NAMES_EN[v.surahNumber - 1] || v.surahName) : v.surahName;
                  const vKeyMeaning = isEn ? (v.keyMeaningEn || v.keyMeaningAr) : v.keyMeaningAr;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border transition-all quran-raised-card"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                          {vSurahName} - {isEn ? `Ayah ${v.ayahNumber}` : `آية ${toArabic(v.ayahNumber)}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleCopySingleVerse(e, v)}
                            className="p-1 rounded-xl text-xs font-bold flex items-center justify-center border transition-all quran-raised-btn"
                            style={{ 
                              backgroundColor: copiedAyahKey === `${v.surahNumber}:${v.ayahNumber}` ? '#10b98125' : `${themeAccent}14`, 
                              borderColor: copiedAyahKey === `${v.surahNumber}:${v.ayahNumber}` ? '#10b981' : `${themeAccent}25`, 
                              color: copiedAyahKey === `${v.surahNumber}:${v.ayahNumber}` ? '#10b981' : themeAccentColor 
                            }}
                            title={isEn ? "Copy Ayah" : "نسخ الآية"}
                          >
                            {copiedAyahKey === `${v.surahNumber}:${v.ayahNumber}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
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
                      </div>

                      <p className="text-xs sm:text-sm font-bold leading-[2.1] select-text" dir="rtl">
                        {v.verseSnippet}
                      </p>

                      <div className="mt-2 text-[11px] font-extrabold opacity-80 text-amber-600 dark:text-amber-400">
                        💡 {isEn ? 'Key purpose & theme:' : 'المقصد والمفهوم:'} {vKeyMeaning}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Search Results View */
            <div className="space-y-3">
              <div className="font-bold text-xs opacity-80">
                {isEn ? `Search results for «${searchQuery}» (${allFilteredConcepts.length}):` : `نتائج البحث عن «${searchQuery}» (${allFilteredConcepts.length}):`}
              </div>

              {allFilteredConcepts.length === 0 ? (
                <div className="py-8 text-center text-sm opacity-60 font-bold">
                  {isEn ? "No matching topics found in the encyclopedia." : "لم يتم العثور على نتائج متطابقة في الموسوعة."}
                </div>
              ) : (
                allFilteredConcepts.map(({ categoryName, concept }, idx) => {
                  const cTitle = isEn ? (concept.titleEn || concept.titleAr) : concept.titleAr;
                  const cDesc = isEn ? (concept.descriptionEn || concept.descriptionAr) : concept.descriptionAr;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        const parentCat = THEMATIC_CATEGORIES.find(cat => cat.concepts.some(c => c.id === concept.id));
                        if (parentCat) {
                          setSelectedCategory(parentCat);
                        }
                        setSelectedConcept(concept);
                        setSearchQuery('');
                      }}
                      className="p-3.5 rounded-2xl border cursor-pointer transition-all quran-raised-btn space-y-1.5"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          {cTitle}
                        </span>
                        <span className="text-[10px] opacity-60 font-bold px-2 py-0.5 rounded-lg border">
                          {categoryName}
                        </span>
                      </div>
                      <p className="text-xs font-bold opacity-80 line-clamp-2">
                        {cDesc}
                      </p>
                    </div>
                  );
                })
              )}
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
              isPlaying ? 'ring-2 ring-red-400/80 animate-pulse' : 'quran-raised-card'
            }`}
            style={{ 
              backgroundColor: isPlaying ? '#dc2626' : `${themeAccent}18`, 
              color: isPlaying ? '#ffffff' : themeAccentColor 
            }}
            title={isPlaying ? (isEn ? "Stop Audio" : "إيقاف الصوت") : (isEn ? "Listen" : "استماع")}
          >
            {isPlaying ? <VolumeX size={20} className="text-white animate-pulse" /> : <Volume2 size={20} style={{ color: themeAccentColor }} />}
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
            onClick={onClose}
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

export default ThematicEncyclopediaModal;
