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
  Info,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { 
  WAQF_SIGNS, 
  WaqfSignInfo, 
  WaqfOccurrence, 
  extractWaqfOccurrencesFromVerse, 
  parseVerseWithWaqfMarks 
} from '../../data/waqfData';
import { normalizeQuranText, formatQuranWordForLabel } from '../../utils/quranData';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

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

const WaqfGuideModal: React.FC<WaqfGuideModalProps> = ({
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
    return extractWaqfOccurrencesFromVerse(currentAyahText);
  }, [currentAyahText]);

  const verseSegments = useMemo(() => {
    return parseVerseWithWaqfMarks(currentAyahText);
  }, [currentAyahText]);

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

  const themeAccent = currentTheme?.accent || '#10b981';
  const isDark = currentTheme?.id === 'deep_black';
  const themeAccentColor = isDark ? '#ffffff' : themeAccent;
  const modalBg = currentTheme?.modalBg || currentTheme?.bg || '#ffffff';
  const modalText = currentTheme?.modalText || currentTheme?.text || '#000000';

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
          fontFamily: "'Cairo', sans-serif"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Drag Handle & Title Bar */}
        <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
          <div className="w-12 h-1.5 rounded-full mb-2 bg-slate-300 dark:bg-zinc-700 opacity-70 mx-auto" />
          
          <div className="w-full flex flex-col items-center justify-center relative px-2">
            <span 
              className="px-4 py-1.5 rounded-full text-xs font-black shadow-xs border transition-all"
              style={{
                backgroundColor: `${themeAccent}18`,
                borderColor: `${themeAccent}40`,
                color: themeAccentColor
              }}
            >
              {isEn ? "Waqf & Stopping Signs Guide" : "دليل علامات الوقف وضبط المصحف"}
            </span>
            <span className="text-[12px] font-black opacity-75 mt-1 font-cairo">
              {isEn 
                ? `${displaySurah} (Ayah ${ayahNumber})` 
                : `${displaySurah} (آية ${toArabic(ayahNumber)})`}
            </span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 px-4 sm:px-6 py-2 space-y-3">
          
          {/* 1. Display Ayah Card with Illuminated Colored Waqf Marks */}
          {currentAyahText && (
            <div 
              className="py-3.5 px-4 rounded-2xl text-center select-text leading-[2.3] font-bold border quran-raised-card transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                borderColor: `${themeAccent}30`,
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

                // Waqf Mark Segment: Illuminated and Colored
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
                    className={`inline-flex items-center justify-center mx-1.5 px-2.5 py-0.5 rounded-xl font-black transition-all cursor-pointer select-none align-middle ${
                      isSelected 
                        ? 'scale-110 shadow-md ring-2 ring-offset-1' 
                        : 'hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? signInfo.color : signInfo.bgColor,
                      color: isSelected ? '#ffffff' : signInfo.color,
                      borderColor: signInfo.borderColor,
                      borderWidth: '1.5px',
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
                <span className="mr-2 text-amber-600 dark:text-amber-400 font-extrabold whitespace-nowrap">
                  ﴿{toArabic(ayahNumber)}﴾
                </span>
              ) : null}
            </div>
          )}

          {/* 2. Detected Waqf Marks in this Ayah */}
          {hasSignsInVerse ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm" style={{ color: themeAccentColor }}>
                  <Compass size={17} />
                  <span>
                    {isEn 
                      ? `Stopping marks found in this Ayah (${occurrences.length}):` 
                      : `علامات الوقف الموجودة بهذه الآية (${toArabic(occurrences.length)}):`}
                  </span>
                </div>
                {occurrences.length > 1 && (
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                    {isEn ? 'Tap to view rule' : 'انقر على العلامة لمعرفة حكمها'}
                  </span>
                )}
              </div>

              {/* Pills for each occurrence found in this specific ayah */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
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
                      className={`px-3.5 py-2 rounded-xl font-black text-xs whitespace-nowrap border transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                        isSelected ? 'scale-[1.02] shadow-sm' : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${sign.color}20` : (isDark ? 'rgba(255,255,255,0.04)' : '#ffffff'),
                        borderColor: isSelected ? sign.color : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                        color: isSelected ? sign.color : modalText
                      }}
                    >
                      <span 
                        className="px-2 py-0.5 rounded-lg text-xs font-black text-white"
                        style={{ backgroundColor: sign.color }}
                      >
                        {sign.symbol}
                      </span>
                      <div className="flex flex-col text-start">
                        <span className="text-xs font-black">{sign.nameAr}</span>
                        {occ.wordBefore && (
                          <span className="text-xs font-bold font-cairo text-amber-900/90 dark:text-amber-200/90 leading-tight">
                            عند: «<span className="font-extrabold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 px-0.5" style={{ fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif", letterSpacing: '0px' }}>{formatQuranWordForLabel(occ.wordBefore)}</span>»
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
              className="p-4 rounded-2xl border text-start space-y-2 quran-raised-card transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
                borderColor: 'rgba(16, 185, 129, 0.25)'
              }}
            >
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-sm">
                <Sparkles size={18} />
                <span>
                  {isEn ? "Continuous Recitation (No intermediate waqf marks in this Ayah)" : "آية متصلة (لا توجد علامات وقف وسطية في هذه الآية)"}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] leading-[1.8] font-bold text-slate-700 dark:text-zinc-300">
                {isEn
                  ? `This noble Ayah does not contain intermediate stopping symbols. The reciter continues recitation smoothly until the end of the verse (Ayah ${ayahNumber}), where stopping is Sunnah. In case of running out of breath, stop with a permissible pause and resume cleanly.`
                  : `هذه الآية الكريمة لا تتضمن علامات وقف وسطية؛ وتُقرأ متصلة المعنى حتى رأس الآية ﴿${toArabic(ayahNumber)}﴾، حيث يُسنّ الوقف عند رؤوس الآيات اتباعاً لهدي المصطفى ﷺ. وإن انقطع النَّفَس أثناء تلاوتها يجوز الوقف الاضطراري وحُسن الابتداء بما يربط المعنى دون إخلال.`}
              </p>
            </div>
          )}

          {/* 3. Active Sign Detail Card */}
          <div 
            className="p-4 sm:p-5 rounded-2xl border quran-raised-card space-y-3.5 transition-all"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff', 
              borderColor: activeSign ? `${activeSign.color}40` : `${themeAccent}30`,
              boxShadow: activeSign ? `0 4px 20px ${activeSign.color}15` : undefined
            }}
          >
            {/* Header: Symbol + Name + Location */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200/60 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-sm"
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
                className="text-xs px-2.5 py-1 rounded-lg font-black border" 
                style={{ 
                  backgroundColor: `${activeSign.color}15`, 
                  borderColor: `${activeSign.color}35`, 
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
          <div className="pt-2 pb-1 space-y-2">
            <div className="flex items-center gap-1.5 px-1 font-black text-xs text-slate-500 dark:text-zinc-400">
              <BookOpen size={15} />
              <span>{isEn ? "General Quranic Waqf Signs Guide (6 Marks):" : "الدليل الشامل لعلامات الوقف بالمصحف الشريف:"}</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {WAQF_SIGNS.slice(0, 6).map((s) => {
                const isSelected = activeSign.id === s.id;
                return (
                  <button
                    key={`catalog-sign-${s.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedGeneralSignId(s.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs whitespace-nowrap border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${s.color}20` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                      borderColor: isSelected ? s.color : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                      color: isSelected ? s.color : modalText
                    }}
                  >
                    <span className="font-extrabold" style={{ color: s.color }}>{s.symbol}</span>
                    <span>{s.shortNameAr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar: Audio, Share, Copy, Zoom, Close */}
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
            type="button"
            onClick={handlePlayAudio}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border border-slate-200/80 ${
              isAudioActive ? 'ring-2 ring-red-400/80 animate-pulse' : ''
            }`}
            style={{ 
              backgroundColor: isAudioActive ? '#dc2626' : '#ffffff', 
              color: isAudioActive ? '#ffffff' : (currentTheme?.accent || themeAccent)
            }}
            title={isAudioActive ? (isEn ? "Stop Audio" : "إيقاف الصوت") : (isEn ? "Listen to Ayah" : "استماع للآية")}
          >
            {isAudioActive ? <VolumeX size={20} className="text-white animate-pulse" /> : <Volume2 size={20} style={{ color: currentTheme?.accent || themeAccent }} />}
          </button>

          {/* 2. Share Button */}
          <button 
            type="button"
            onClick={handleShare}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border border-slate-200/80"
            style={{ backgroundColor: '#ffffff', color: currentTheme?.accent || themeAccent }}
            title={isEn ? "Share" : "مشاركة"}
          >
            <Share2 size={20} style={{ color: currentTheme?.accent || themeAccent }} />
          </button>

          {/* 3. Copy Button */}
          <button 
            type="button"
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
            type="button"
            onClick={handleToggleZoom}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer font-cairo shadow-md active:scale-90 border border-slate-200/80"
            style={{ backgroundColor: '#ffffff', color: currentTheme?.accent || themeAccent }}
            title={isEn ? "Text Size" : "حجم الخط"}
          >
            <ZoomIn size={20} style={{ color: currentTheme?.accent || themeAccent }} />
          </button>

          {/* 5. Chevron Down / Hide Modal Button (LEFTMOST in RTL) */}
          <button 
            type="button"
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

export default WaqfGuideModal;
