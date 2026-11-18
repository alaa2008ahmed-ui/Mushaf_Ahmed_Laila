import React, { useState, useEffect } from 'react';
import { ChevronDown, ZoomIn, Copy, Check, Share2, Volume2, VolumeX, BookOpen, Search, ExternalLink, X } from 'lucide-react';
import { THEMATIC_CATEGORIES, ThematicCategory, ThematicConcept, ThematicVerse } from '../../data/thematicQuranData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { resolveQuranModalPalette } from './modalThemeUtils';

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

  const p = resolveQuranModalPalette(currentTheme);

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
      className={`fixed inset-0 z-[1300] bg-black/70 flex flex-col select-none ${isLandscape ? 'justify-center items-center p-2.5' : 'justify-end'}`}
      onClick={onClose}
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
        <div className={`${isLandscape ? 'pt-2.5 px-3 pb-1.5' : 'pt-3 px-4 sm:px-5 pb-2'} shrink-0 flex flex-col`}>
          {!isLandscape && (
            <div className="app-3d-drag-handle w-12 h-1.5 rounded-full mb-2.5 bg-slate-300/80 dark:bg-zinc-600/80 mx-auto" />
          )}
          
          <div 
            className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between gap-2 quran-raised-card border-0`}
            style={{ backgroundColor: p.headerBg }}
          >
            <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide truncate`} style={{ color: p.headerAccent }}>
              {isEn ? "Thematic Quranic Encyclopedia" : "الموسوعة والفهرس الموضوعي للقرآن"}
            </span>
            <button 
              type="button"
              onClick={onClose} 
              className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
              style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
              aria-label={isEn ? "Close" : "إغلاق"}
            >
              <X size={isLandscape ? 14 : 16} />
            </button>
          </div>
        </div>

        {/* 3D Search Bar */}
        <div className={`${isLandscape ? 'px-3 pt-1 pb-2' : 'px-4 sm:px-5 pt-1.5 pb-3'} shrink-0`}>
          <div 
            className={`flex items-center gap-2 ${isLandscape ? 'px-3 py-1.5 rounded-xl' : 'px-3.5 py-2.5 rounded-2xl'} border-0 quran-raised-card`}
            style={{
              backgroundColor: p.cardBg,
              color: p.cardText
            }}
          >
            <Search size={isLandscape ? 14 : 16} style={{ color: p.headerAccent }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search topics (e.g. Sabr, Parents, Tawheed)..." : "ابحث في المفاهيم الموضوعية (مثل: الصبر، التوكل، بر الوالدين)..."}
              className={`bg-transparent border-0 outline-none w-full ${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} placeholder:opacity-50 font-bold`}
              style={{ color: p.cardText }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 rounded-full quran-raised-btn border-0 flex items-center justify-center shrink-0 cursor-pointer"
                style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
              >
                <X size={12} className="quran-3d-icon" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className={`overflow-y-auto custom-scrollbar flex-1 min-h-0 ${isLandscape ? 'px-3 pt-1 pb-3 space-y-2.5' : 'px-4 sm:px-5 pt-1 pb-5 space-y-3'}`}>
          {!allFilteredConcepts ? (
            <>
              {/* Category Pills Header */}
              <div className="flex items-center gap-2.5 overflow-x-auto pt-1 pb-3 px-1 custom-scrollbar">
                {THEMATIC_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.id === cat.id;
                  const catLabel = isEn ? (cat.nameEn || cat.nameAr) : cat.nameAr;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedConcept(cat.concepts[0]);
                      }}
                      className={`px-3.5 py-2 rounded-2xl font-extrabold text-xs whitespace-nowrap border-0 cursor-pointer shrink-0 ${
                        isSelected ? 'quran-raised-btn-selected' : 'quran-raised-btn'
                      }`}
                      style={{
                        backgroundColor: isSelected ? undefined : p.cardBg,
                        color: isSelected ? p.selectedText : p.cardText
                      }}
                    >
                      {catLabel}
                    </button>
                  );
                })}
              </div>

              {/* Concept Pills */}
              <div className="flex items-center gap-2.5 overflow-x-auto pt-0.5 pb-3.5 px-1 custom-scrollbar">
                {selectedCategory.concepts.map((c) => {
                  const isSelected = selectedConcept.id === c.id;
                  const cTitle = isEn ? (c.titleEn || c.titleAr) : c.titleAr;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedConcept(c)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap border-0 cursor-pointer shrink-0 ${
                        isSelected ? 'quran-raised-btn-selected' : 'quran-raised-btn'
                      }`}
                      style={{
                        backgroundColor: isSelected ? undefined : p.cardBg,
                        color: isSelected ? p.selectedText : p.cardText
                      }}
                    >
                      {cTitle}
                    </button>
                  );
                })}
              </div>

              {/* Concept Header Card */}
              <div 
                className="p-4 rounded-2xl border-0 quran-raised-card space-y-2"
                style={{ backgroundColor: p.cardBg, color: p.cardText }}
              >
                <h4 className="font-extrabold text-base" style={{ color: p.headerAccent }}>
                  {conceptTitleText}
                </h4>
                <p className="text-xs sm:text-sm font-bold leading-[2] select-text" style={{ fontSize: `${fontSize}px`, color: p.cardText }}>
                  {conceptDescText}
                </p>
              </div>

              {/* Linked Verses */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 font-bold text-xs px-1" style={{ color: p.headerAccent }}>
                  <BookOpen size={16} style={{ color: p.headerAccent }} />
                  <span>
                    {isEn ? `Quranic verses related to «${conceptTitleText}»:` : `الآيات القرآنية المرتبطة بـ «${conceptTitleText}»:`}
                  </span>
                </div>

                {selectedConcept.verses.map((v, idx) => {
                  const vSurahName = isEn ? (SURAH_NAMES_EN[v.surahNumber - 1] || v.surahName) : v.surahName;
                  const vKeyMeaning = isEn ? (v.keyMeaningEn || v.keyMeaningAr) : v.keyMeaningAr;
                  const isCopiedAyah = copiedAyahKey === `${v.surahNumber}:${v.ayahNumber}`;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border-0 quran-raised-card"
                      style={{
                        backgroundColor: p.cardBg,
                        color: p.cardText
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                          {vSurahName} - {isEn ? `Ayah ${v.ayahNumber}` : `آية ${toArabic(v.ayahNumber)}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleCopySingleVerse(e, v)}
                            className="p-1.5 rounded-xl text-xs font-bold flex items-center justify-center border-0 quran-raised-btn cursor-pointer"
                            style={{ 
                              backgroundColor: isCopiedAyah ? '#10b981' : p.closeBg, 
                              color: isCopiedAyah ? '#ffffff' : p.headerAccent 
                            }}
                            title={isEn ? "Copy Ayah" : "نسخ الآية"}
                          >
                            {isCopiedAyah ? <Check size={12} className="text-white" /> : <Copy size={12} />}
                          </button>
                          {onJumpToAyah && (
                            <button
                              type="button"
                              onClick={() => {
                                onJumpToAyah(v.surahNumber, v.ayahNumber);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border-0 quran-raised-btn cursor-pointer"
                              style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            >
                              <span>{isEn ? "Jump" : "انتقال"}</span>
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-bold leading-[2.1] select-text" dir="rtl" style={{ color: p.cardText }}>
                        {v.verseSnippet}
                      </p>

                      <div className="mt-2.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold text-amber-700 dark:text-amber-300" style={{ backgroundColor: p.subtleBg }}>
                        💡 {isEn ? 'Key purpose & theme:' : 'المقصد والمفهوم:'} {vKeyMeaning}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Search Results View */
            <div className="space-y-4">
              <div className="font-bold text-xs px-1" style={{ color: p.mutedText }}>
                {isEn ? `Search results for «${searchQuery}» (${allFilteredConcepts.length}):` : `نتائج البحث عن «${searchQuery}» (${allFilteredConcepts.length}):`}
              </div>

              {allFilteredConcepts.length === 0 ? (
                <div className="p-6 rounded-2xl border-0 quran-raised-card text-center text-sm font-bold" style={{ backgroundColor: p.cardBg, color: p.mutedText }}>
                  {isEn ? "No matching topics found in the encyclopedia." : "لم يتم العثور على نتائج متطابقة في الموسوعة."}
                </div>
              ) : (
                allFilteredConcepts.map(({ categoryName, concept }, idx) => {
                  const cTitle = isEn ? (concept.titleEn || concept.titleAr) : concept.titleAr;
                  const cDesc = isEn ? (concept.descriptionEn || concept.descriptionAr) : concept.descriptionAr;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const parentCat = THEMATIC_CATEGORIES.find(cat => cat.concepts.some(c => c.id === concept.id));
                        if (parentCat) {
                          setSelectedCategory(parentCat);
                        }
                        setSelectedConcept(concept);
                        setSearchQuery('');
                      }}
                      className="w-full text-start p-4 rounded-2xl border-0 cursor-pointer quran-raised-btn space-y-1.5"
                      style={{
                        backgroundColor: p.cardBg,
                        color: p.cardText
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          {cTitle}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: p.subtleBg, color: p.headerAccent }}>
                          {categoryName}
                        </span>
                      </div>
                      <p className="text-xs font-bold line-clamp-2" style={{ color: p.mutedText }}>
                        {cDesc}
                      </p>
                    </button>
                  );
                })
              )}
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
              isPlaying ? 'ring-2 ring-red-400/80 animate-pulse' : ''
            }`}
            style={{ 
              backgroundColor: isPlaying ? '#dc2626' : p.closeBg, 
              color: isPlaying ? '#ffffff' : p.headerAccent 
            }}
            title={isPlaying ? (isEn ? "Stop Audio" : "إيقاف الصوت") : (isEn ? "Listen" : "استماع")}
          >
            {isPlaying ? <VolumeX size={isLandscape ? 17 : 20} className="text-white animate-pulse" /> : <Volume2 size={isLandscape ? 17 : 20} style={{ color: p.headerAccent }} />}
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
            onClick={onClose}
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
};

export default ThematicEncyclopediaModal;
