import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ZoomIn,
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  Compass,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Sparkles,
  X
} from 'lucide-react';
import { 
  WAQF_SIGNS, 
  WaqfSignInfo, 
  WaqfOccurrence, 
  extractWaqfOccurrencesFromVerse, 
  parseVerseWithWaqfMarks 
} from '../../data/waqfData';
import { formatQuranWordForLabel } from '../../utils/quranData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { resolveQuranModalPalette } from './modalThemeUtils';

interface WaqfGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: any;
  currentAyahText?: string;
  surahName?: string;
  ayahNumber?: number;
  surahNumber?: number;
  onPlayAudio?: (surah: number, ayah: number) => void;
  onStopAudio?: () => void;
  isAudioPlaying?: boolean;
  showToast?: (msg: string) => void;
  isLandscape?: boolean;
}

const WaqfGuideModal: React.FC<WaqfGuideModalProps> = React.memo(({
  isOpen,
  onClose,
  currentTheme,
  currentAyahText = '',
  surahName = '',
  ayahNumber = 1,
  surahNumber = 1,
  onPlayAudio,
  onStopAudio,
  isAudioPlaying,
  showToast,
  isLandscape = false
}) => {
  const { language, dir } = useLanguage();
  const isEn = language === 'en';

  const [fontSize, setFontSize] = useState<number>(20);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Track selected occurrence inside the verse (0, 1, 2...)
  const [selectedOccurrenceIdx, setSelectedOccurrenceIdx] = useState<number>(0);
  // Optional: user toggles full catalog view when browsing general signs
  const [selectedGeneralSignId, setSelectedGeneralSignId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTTS((playingText) => {
      setIsPlaying(Boolean(playingText));
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const occurrences = useMemo(() => {
    if (!isOpen) return [];
    return extractWaqfOccurrencesFromVerse(currentAyahText);
  }, [isOpen, currentAyahText]);

  const verseSegments = useMemo(() => {
    if (!isOpen) return [];
    return parseVerseWithWaqfMarks(currentAyahText);
  }, [isOpen, currentAyahText]);

  // Reset or initialize selection whenever modal opens or ayah changes
  useEffect(() => {
    if (isOpen) {
      setSelectedOccurrenceIdx(0);
      setSelectedGeneralSignId(null);
    }
  }, [isOpen, currentAyahText, ayahNumber, surahNumber]);

  // Determine active sign and active occurrence
  const activeOccurrence: WaqfOccurrence | undefined = occurrences[selectedOccurrenceIdx] || occurrences[0];
  
  const activeSign: WaqfSignInfo = useMemo(() => {
    if (selectedGeneralSignId) {
      const found = WAQF_SIGNS.find(s => s.id === selectedGeneralSignId);
      if (found) return found;
    }
    if (activeOccurrence) {
      return activeOccurrence.sign;
    }
    return WAQF_SIGNS[0];
  }, [selectedGeneralSignId, activeOccurrence]);

  const isAudioActive = isAudioPlaying !== undefined ? isAudioPlaying : isPlaying;

  const handleClose = () => {
    stopTTS();
    if (onStopAudio && isAudioActive) {
      onStopAudio();
    }
    onClose();
  };

  if (!isOpen) return null;

  const p = resolveQuranModalPalette(currentTheme);

  // Sanitize Surah Name to prevent "سورة سُورَةُ"
  const surahNameEn = SURAH_NAMES_EN[surahNumber - 1] || `Surah ${surahNumber}`;
  const cleanSurahNameAr = (surahName || '').replace(/^(سُورَةُ|سورة)\s*/g, '').trim();
  const displaySurah = isEn 
    ? surahNameEn 
    : (cleanSurahNameAr ? `سورة ${cleanSurahNameAr}` : `سورة ${surahName}`);

  const hasSignsInVerse = occurrences.length > 0;

  const signNameText = isEn ? (activeSign.nameEn || activeSign.nameAr) : activeSign.nameAr;
  const signSummaryText = isEn ? (activeSign.summaryEn || activeSign.summaryAr) : activeSign.summaryAr;
  const signImpactText = isEn ? (activeSign.impactOnMeaningEn || activeSign.impactOnMeaningAr) : activeSign.impactOnMeaningAr;
  const signAudioGuideText = isEn ? (activeSign.audioGuideEn || activeSign.audioGuideAr) : activeSign.audioGuideAr;

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 32 ? 18 : prev + 3));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    let signInfoText = '';
    if (hasSignsInVerse && activeOccurrence) {
      signInfoText = isEn
        ? `Stopping Symbol in Ayah: «${activeOccurrence.sign.symbol}» at word: «${activeOccurrence.wordBefore}»\nRule: ${signSummaryText}\nImpact: ${signImpactText}`
        : `علامة الوقف في الآية: «${activeOccurrence.sign.symbol}» عند كلمة: «${activeOccurrence.wordBefore}»\nالحكم والمعنى: ${signSummaryText}\nالتأثير على المعنى: ${signImpactText}`;
    } else {
      signInfoText = isEn
        ? `This Ayah has no intermediate stopping signs. Continuous recitation until the verse end (Ayah ${ayahNumber}) is recommended.`
        : `هذه الآية الكريمة لا تحتوي على علامات وقف وسطية، ويُستحب وصل القراءة حتى رأس الآية (آية ${toArabic(ayahNumber)}).`;
    }

    const headerRef = isEn 
      ? `[Waqf Signs - ${displaySurah} Ayah ${ayahNumber}]` 
      : `[علامات الوقف - ${displaySurah} آية ${toArabic(ayahNumber)}]`;
    
    const fullText = currentAyahText ? `${currentAyahText}\n\n${signInfoText}\n\n${headerRef}` : `${signInfoText}\n\n${headerRef}`;

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
    let signShareText = '';
    if (hasSignsInVerse && activeOccurrence) {
      signShareText = `علامة الوقف بالآية: «${activeOccurrence.sign.symbol}» عند كلمة «${activeOccurrence.wordBefore}»\n${signSummaryText}`;
    } else {
      signShareText = `آية متصلة خالية من علامات الوقف الوسطية، والوقف مستحب عند رأس الآية (${toArabic(ayahNumber)}).`;
    }

    const fullShareText = currentAyahText ? `${currentAyahText}\n\n${signShareText}` : signShareText;
    const sourceRef = isEn ? `${displaySurah} (Ayah ${ayahNumber})` : `${displaySurah} (آية ${toArabic(ayahNumber)})`;

    await shareAsImage({
      text: fullShareText,
      title: isEn ? "Waqf & Stopping Signs" : "علامات الوقف بالآية",
      source: sourceRef,
      category: isEn ? "Waqf Guide" : "علامات الوقف",
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
    const textToRead = currentAyahText ? `${currentAyahText}. ${signSummaryText}` : signSummaryText;
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
                {isEn ? "Waqf & Stopping Signs Guide" : "دليل علامات الوقف وضبط المصحف"}
              </span>
              <span className={`${isLandscape ? 'text-[10px]' : 'text-[11px]'} font-bold truncate font-cairo`} style={{ color: p.mutedText }}>
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
          
          {/* 1. Display Ayah Card with Illuminated Colored Waqf Marks */}
          {currentAyahText && (
            <div 
              className="p-4 rounded-2xl text-center select-text leading-[2.3] font-bold border-0 quran-raised-card"
              style={{
                backgroundColor: p.cardBg,
                color: p.cardText,
                fontSize: `${fontSize + 3}px`,
                fontFamily: "'Amiri Quran', 'Amiri', 'Cairo', serif"
              }}
              dir="rtl"
            >
              {verseSegments.map((seg, idx) => {
                if (seg.type === 'text') {
                  return (
                    <span key={`text-${idx}`} className="transition-colors">
                      {seg.content}
                    </span>
                  );
                }

                // Waqf Mark Segment: Illuminated and Colored 3D chip
                const isSelected = hasSignsInVerse && selectedOccurrenceIdx === seg.occurrenceIndex;
                const signInfo = seg.sign;

                return (
                  <button
                    key={`waqf-badge-${seg.occurrenceIndex}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOccurrenceIdx(seg.occurrenceIndex);
                      setSelectedGeneralSignId(null);
                    }}
                    className={`inline-flex items-center justify-center mx-1.5 px-2.5 py-0.5 rounded-xl font-black cursor-pointer select-none align-middle border-0 quran-raised-btn ${
                      isSelected ? 'ring-2 ring-offset-1' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? signInfo.color : signInfo.bgColor,
                      color: isSelected ? '#ffffff' : signInfo.color,
                      fontSize: `${Math.max(13, fontSize - 4)}px`,
                      fontFamily: "'Cairo', sans-serif",
                      lineHeight: '1.4'
                    }}
                    title={`${signInfo.nameAr} عند «${seg.wordBefore}»`}
                  >
                    <span className="font-extrabold ml-1">{signInfo.symbol}</span>
                    <span className="text-[10px] font-bold opacity-90 hidden sm:inline">{signInfo.shortNameAr}</span>
                  </button>
                );
              })}
              
              {/* Ayah End Symbol */}
              {ayahNumber ? (
                <span className="mr-2 font-extrabold whitespace-nowrap" style={{ color: p.headerAccent }}>
                  ﴿{toArabic(ayahNumber)}﴾
                </span>
              ) : null}
            </div>
          )}

          {/* 2. Detected Waqf Marks in this Ayah */}
          {hasSignsInVerse ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm" style={{ color: p.headerAccent }}>
                  <Compass size={17} />
                  <span>
                    {isEn 
                      ? `Stopping marks found in this Ayah (${occurrences.length}):` 
                      : `علامات الوقف الموجودة بهذه الآية (${toArabic(occurrences.length)}):`}
                  </span>
                </div>
                {occurrences.length > 1 && (
                  <span className="text-[11px] font-bold" style={{ color: p.mutedText }}>
                    {isEn ? 'Tap to view rule' : 'انقر على العلامة لمعرفة حكمها'}
                  </span>
                )}
              </div>

              {/* 3D Pills for each occurrence found in this specific ayah (pb-3.5 prevents clipping 6.5px bevel) */}
              <div className="flex items-center gap-2.5 overflow-x-auto pt-1.5 pb-3.5 px-1 custom-scrollbar">
                {occurrences.map((occ, idx) => {
                  const isSelected = selectedOccurrenceIdx === idx && !selectedGeneralSignId;
                  const sign = occ.sign;

                  return (
                    <button
                      key={`occ-pill-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedOccurrenceIdx(idx);
                        setSelectedGeneralSignId(null);
                      }}
                      className="px-3.5 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap border-0 flex items-center gap-2.5 cursor-pointer quran-raised-btn shrink-0"
                      style={{
                        backgroundColor: isSelected ? sign.color : p.cardBg,
                        color: isSelected ? '#ffffff' : p.cardText
                      }}
                    >
                      <span 
                        className="px-2 py-0.5 rounded-lg text-xs font-black"
                        style={{ 
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.22)' : sign.color,
                          color: '#ffffff'
                        }}
                      >
                        {sign.symbol}
                      </span>
                      <div className="flex flex-col text-start">
                        <span className="text-xs font-black">{sign.nameAr}</span>
                        {occ.wordBefore && (
                          <span 
                            className="text-xs font-bold font-cairo leading-tight"
                            style={{ color: isSelected ? 'rgba(255,255,255,0.92)' : p.mutedText }}
                          >
                            عند: «<span className="font-extrabold text-xs sm:text-sm px-0.5" style={{ fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif", letterSpacing: '0px', color: isSelected ? '#ffffff' : (p.isDark ? '#34d399' : '#065f46') }}>{formatQuranWordForLabel(occ.wordBefore)}</span>»
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* No Waqf Signs in this Ayah Notice */
            <div 
              className="p-4 sm:p-5 rounded-2xl border-0 text-start space-y-2 quran-raised-card"
              style={{
                backgroundColor: p.cardBg,
                color: p.cardText
              }}
            >
              <div className="flex items-center gap-2 font-black text-sm" style={{ color: p.isDark ? '#34d399' : '#047857' }}>
                <Sparkles size={18} />
                <span>
                  {isEn ? "Continuous Recitation (No intermediate waqf marks in this Ayah)" : "آية متصلة (لا توجد علامات وقف وسطية في هذه الآية)"}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] leading-[1.85] font-bold" style={{ color: p.cardText }}>
                {isEn
                  ? `This noble Ayah does not contain intermediate stopping symbols. The reciter continues recitation smoothly until the end of the verse (Ayah ${ayahNumber}), where stopping is Sunnah. In case of running out of breath, stop with a permissible pause and resume cleanly.`
                  : `هذه الآية الكريمة لا تتضمن علامات وقف وسطية؛ وتُقرأ متصلة المعنى حتى رأس الآية ﴿${toArabic(ayahNumber)}﴾، حيث يُسنّ الوقف عند رؤوس الآيات اتباعاً لهدي المصطفى ﷺ. وإن انقطع النَّفَس أثناء تلاوتها يجوز الوقف الاضطراري وحُسن الابتداء بما يربط المعنى دون إخلال.`}
              </p>
            </div>
          )}

          {/* 3. Active Sign Detail Card */}
          <div 
            className="p-4 sm:p-5 rounded-2xl border-0 quran-raised-card space-y-3.5"
            style={{ 
              backgroundColor: p.cardBg,
              color: p.cardText
            }}
          >
            {/* Header: Symbol + Name + Location */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200/60 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white quran-raised-card border-0 shrink-0"
                  style={{ backgroundColor: activeSign.color }}
                >
                  {activeSign.symbol}
                </span>
                <div className="flex flex-col text-start">
                  <span className="font-black text-sm sm:text-base" style={{ color: activeSign.color }}>
                    {signNameText}
                  </span>
                  {hasSignsInVerse && activeOccurrence?.wordBefore && (
                    <span className="text-xs sm:text-[13px] font-extrabold text-amber-800 dark:text-amber-300 font-cairo leading-relaxed mt-0.5">
                      موضع الوقف في الآية: عند قوله تعالى «<span className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300 px-0.5" style={{ fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif", letterSpacing: '0px' }}>{formatQuranWordForLabel(activeOccurrence.wordBefore)} {activeSign.symbol}</span>»
                    </span>
                  )}
                </div>
              </div>

              <span 
                className="text-xs px-2.5 py-1 rounded-lg font-black" 
                style={{ 
                  backgroundColor: `${activeSign.color}18`, 
                  color: activeSign.color 
                }}
              >
                {activeSign.shortNameAr || activeSign.category}
              </span>
            </div>

            {/* Rule & Linguistic Detail */}
            <div className="space-y-3 select-text text-start font-cairo">
              {/* الحكم والمعنى */}
              <div className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-[13px] leading-[1.8] font-bold">
                  <span className="font-black text-emerald-700 dark:text-emerald-400">
                    {isEn ? 'Rule & Meaning: ' : 'الحكم والمعنى: '}
                  </span>
                  <span>{signSummaryText}</span>
                </div>
              </div>

              {/* التأثير على المعنى */}
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-[13px] leading-[1.8] font-bold">
                  <span className="font-black text-amber-700 dark:text-amber-400">
                    {isEn ? 'Impact on Meaning: ' : 'التأثير على المعنى: '}
                  </span>
                  <span>{signImpactText}</span>
                </div>
              </div>

              {/* توجيه الأداء للقارئ */}
              <div 
                className="pt-2.5 border-t border-dashed border-slate-200 dark:border-zinc-800 flex items-start gap-2"
              >
                <span className="text-base shrink-0">🎙️</span>
                <div className="text-xs sm:text-[13px] leading-[1.8] font-bold">
                  <span className="font-black text-sky-700 dark:text-sky-400">
                    {isEn ? 'Reciter Guidance: ' : 'توجيه الأداء للقارئ: '}
                  </span>
                  <span>{signAudioGuideText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Complete Waqf Signs Reference (Always accessible for browsing) */}
          <div className="pt-1 space-y-2">
            <div className="flex items-center gap-1.5 px-1 font-black text-xs" style={{ color: p.mutedText }}>
              <BookOpen size={15} />
              <span>{isEn ? "General Quranic Waqf Signs Guide (6 Marks):" : "الدليل الشامل لعلامات الوقف بالمصحف الشريف:"}</span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pt-1.5 pb-3.5 px-1 custom-scrollbar">
              {WAQF_SIGNS.slice(0, 6).map((s) => {
                const isSelected = activeSign.id === s.id;
                return (
                  <button
                    key={`catalog-sign-${s.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedGeneralSignId(s.id);
                    }}
                    className="px-3.5 py-2 rounded-2xl font-black text-xs whitespace-nowrap border-0 flex items-center gap-1.5 cursor-pointer quran-raised-btn shrink-0"
                    style={{
                      backgroundColor: isSelected ? s.color : p.cardBg,
                      color: isSelected ? '#ffffff' : p.cardText
                    }}
                  >
                    <span className="font-extrabold" style={{ color: isSelected ? '#ffffff' : s.color }}>{s.symbol}</span>
                    <span>{s.shortNameAr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sculpted 3D Bottom Action Bar: Audio, Share, Copy, Zoom, Close */}
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
            title={isAudioActive ? (isEn ? "Stop Audio" : "إيقاف الصوت") : (isEn ? "Listen to Ayah" : "استماع للآية")}
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

export default WaqfGuideModal;
