import React, { useState, useEffect } from 'react';
import { ChevronDown, ZoomIn, Copy, Check, Share2, Volume2, VolumeX, Compass, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WAQF_SIGNS, WaqfSignInfo, extractWaqfSignsFromVerse } from '../../data/waqfData';
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

  const verseSigns = React.useMemo(() => {
    return extractWaqfSignsFromVerse(currentAyahText);
  }, [currentAyahText]);

  const [selectedSign, setSelectedSign] = useState<WaqfSignInfo>(() => {
    if (verseSigns.length > 0) return verseSigns[0];
    return WAQF_SIGNS[0];
  });

  if (!isOpen) return null;

  const themeAccent = currentTheme?.accent || '#10b981';
  const isDark = currentTheme?.id === 'deep_black';
  const themeAccentColor = isDark ? '#ffffff' : themeAccent;
  const modalBg = currentTheme?.modalBg || currentTheme?.bg || '#ffffff';
  const modalText = currentTheme?.modalText || currentTheme?.text || '#000000';

  const surahNameEn = SURAH_NAMES_EN[surahNumber - 1] || `Surah ${surahNumber}`;
  const displaySurah = isEn ? surahNameEn : (surahName.includes('سورة') ? surahName : `سورة ${surahName}`);

  const signNameText = isEn ? (selectedSign.nameEn || selectedSign.nameAr) : selectedSign.nameAr;
  const signSummaryText = isEn ? (selectedSign.summaryEn || selectedSign.summaryAr) : selectedSign.summaryAr;
  const signImpactText = isEn ? (selectedSign.impactOnMeaningEn || selectedSign.impactOnMeaningAr) : selectedSign.impactOnMeaningAr;
  const signAudioGuideText = isEn ? (selectedSign.audioGuideEn || selectedSign.audioGuideAr) : selectedSign.audioGuideAr;

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 32 ? 16 : prev + 3));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const signText = isEn
      ? `Stopping Symbol: «${selectedSign.symbol}» (${signNameText})\nRule & Meaning: ${signSummaryText}\nImpact: ${signImpactText}`
      : `رمز الوقف: «${selectedSign.symbol}» (${signNameText})\nالمعنى والحكم: ${signSummaryText}\nتأثير الوقف والوصل: ${signImpactText}`;
    const headerRef = isEn ? `[Waqf Signs - ${displaySurah} Ayah ${ayahNumber}]` : `[علامات الوقف - ${displaySurah} آية ${toArabic(ayahNumber)}]`;
    const fullText = currentAyahText ? `${currentAyahText}\n\n${signText}\n\n${headerRef}` : `${signText}\n\n${headerRef}`;

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
    const signText = `Symbol: «${selectedSign.symbol}» (${signNameText})\n${signSummaryText}`;
    const fullShareText = currentAyahText ? `${currentAyahText}\n\n${signText}` : signText;
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
              {isEn ? "Waqf & Stopping Signs Guide" : "دليل علامات الوقف وضبط المصحف"}
            </span>
            <span className="text-[11px] font-bold opacity-60 mt-1">
              {isEn 
                ? `Stopping signs in: ${displaySurah} (Ayah ${ayahNumber})` 
                : `علامات الوقف المضيئة: ${displaySurah} (آية ${toArabic(ayahNumber)})`}
            </span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-3">
          {/* Display Ayah Text if available */}
          {currentAyahText && (
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
              {currentAyahText} {ayahNumber ? <span>﴿{toArabic(ayahNumber)}﴾</span> : ''}
            </div>
          )}

          {/* Signs Selection Pills */}
          <div className="my-2 space-y-2">
            <div className="flex items-center gap-2 font-bold opacity-80 mb-1 transition-all" style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}>
              <Compass size={16} style={{ color: themeAccentColor }} />
              <span>{isEn ? "Select stopping symbol for audio & rule guide:" : "اختر رمز الوقف لمعرفة المعنى والأداء الصوتي:"}</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
              {(verseSigns.length > 0 ? verseSigns : WAQF_SIGNS).map((s, idx) => {
                const isSelected = selectedSign.symbol === s.symbol;
                const nameLabel = isEn ? (s.nameEn || s.nameAr) : s.nameAr;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedSign(s)}
                    className="px-3.5 py-1.5 rounded-xl font-black text-sm whitespace-nowrap border transition-all quran-raised-btn flex items-center gap-1.5"
                    style={{
                      backgroundColor: isSelected ? `${themeAccent}25` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
                      borderColor: isSelected ? themeAccentColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                      color: isSelected ? themeAccentColor : modalText
                    }}
                  >
                    <span className="text-base text-amber-500">{s.symbol}</span>
                    <span>{nameLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Sign Detail Card */}
          <div 
            className="p-4 rounded-2xl border quran-raised-card space-y-3 transition-all"
            style={{ backgroundColor: `${themeAccent}08`, borderColor: `${themeAccent}20` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold transition-all" style={{ color: themeAccentColor, fontSize: `${fontSize + 2}px` }}>
                <span className="text-2xl text-amber-500">{selectedSign.symbol}</span>
                <span>{signNameText}</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold border" style={{ backgroundColor: `${themeAccent}15`, borderColor: `${themeAccent}30`, color: themeAccentColor }}>
                {selectedSign.category}
              </span>
            </div>

            <div className="font-bold leading-[2] select-text transition-all" style={{ fontSize: `${fontSize}px` }}>
              <div className="flex items-start gap-1.5 mb-1.5">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-1" />
                <div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{isEn ? 'Rule & Meaning: ' : 'الحكم والمعنى: '}</span>
                  <span>{signSummaryText}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 mb-1.5">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-1" />
                <div>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">{isEn ? 'Impact on Meaning: ' : 'التأثير على المعنى المعنوي: '}</span>
                  <span>{signImpactText}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-dashed border-emerald-500/20 font-extrabold opacity-90 transition-all" style={{ fontSize: `${fontSize}px` }}>
                🎙️ <span className="text-emerald-600 dark:text-emerald-400">{isEn ? 'Reciter Guidance: ' : 'توجيه الأداء للقارئ: '}</span>
                <span>{signAudioGuideText}</span>
              </div>
            </div>
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

export default WaqfGuideModal;
