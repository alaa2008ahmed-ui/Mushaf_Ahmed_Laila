import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown } from 'lucide-react';
import { hexToRgba, getModernFlatTokens } from '../../utils/flatDesignTokens';
import { registerBackInterceptor } from '../../hooks/useBackButton';

export interface UnifiedEventZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryTitle: string;
  text: string;
  subtitle?: string;
  source?: string;
  setToastMessage?: (msg: string) => void;
  isGolden?: boolean;
}

export const UnifiedEventZoomModal: React.FC<UnifiedEventZoomModalProps> = ({
  isOpen,
  onClose,
  categoryTitle,
  text,
  subtitle,
  source,
  setToastMessage,
  isGolden,
}) => {
  const { theme, themeKey } = useTheme();
  const { language, dir } = useLanguage();
  const tokens = getModernFlatTokens(theme, themeKey);
  const isEn = language === 'en';

  const [copied, setCopied] = useState(false);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(26);

  // Auto-detect golden mode if on modern home layout
  const isGoldenMode = isGolden ?? (
    typeof document !== 'undefined' && (
      document.body.classList.contains('modern-home-active') ||
      document.querySelector('.modern-home-layout') !== null ||
      localStorage.getItem('home_layout_system') === 'modern'
    )
  );

  useEffect(() => {
    const unsubscribe = subscribeTTS(setPlayingText);
    return () => {
      unsubscribe();
      stopTTS();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const unregister = registerBackInterceptor(() => {
      onClose();
      return true;
    });
    return unregister;
  }, [isOpen, onClose]);

  if (!isOpen || !text) return null;

  const cleanPlainText = text.replace(/<[^>]*>/g, '').trim();
  const isPlaying = playingText === cleanPlainText || playingText === text;

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopTTS();
    } else {
      playTTS(cleanPlainText, {
        isEn,
        onToast: (msg) => {
          if (setToastMessage) setToastMessage(msg);
        },
      });
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cleanPlainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (setToastMessage) {
        setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
      }
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await shareAsImage({
      text,
      title: categoryTitle,
      source: subtitle || source || '',
      category: categoryTitle,
      theme,
      isEn,
      language: isEn ? 'en' : 'ar',
      setToastMessage,
    });
  };

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSize((prev) => (prev >= 38 ? 22 : prev + 4));
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 z-[140] flex flex-col justify-end backdrop-blur-xs select-none"
        onClick={onClose}
        dir={dir}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className={`w-full max-w-xl mx-auto rounded-t-[32px] flex flex-col max-h-[85vh] overflow-hidden relative shadow-2xl ${
            isGoldenMode ? 'border-t-2 border-x-2 border-amber-400/80' : ''
          }`}
          style={{
            background: isGoldenMode
              ? 'linear-gradient(170deg, #FFFDF8 0%, #FEF8E7 15%, #FDECB8 45%, #F7D780 80%, #EDB948 100%)'
              : tokens.cardBgColor,
            boxShadow: isGoldenMode
              ? '0 -10px 40px rgba(146, 64, 14, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(146, 64, 14, 0.15)'
              : undefined,
            color: isGoldenMode ? '#291305' : 'var(--text-color)',
            fontFamily: isEn ? 'sans-serif' : (isGoldenMode ? "'Cairo', sans-serif" : theme.font),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Drag Handle & Category Badge */}
          <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
            <div
              className={`w-12 h-1.5 rounded-full mb-2.5 ${
                isGoldenMode ? 'bg-amber-800/30 border border-amber-400/40' : 'bg-slate-300 dark:bg-zinc-700'
              }`}
            />
            <div className="w-full flex items-center justify-center">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isGoldenMode 
                    ? 'border border-amber-400/70 shadow-2xs text-[#451A03]'
                    : ''
                }`}
                style={{
                  background: isGoldenMode 
                    ? 'rgba(255, 255, 255, 0.92)' 
                    : hexToRgba(tokens.primaryColor, 0.1),
                  color: isGoldenMode ? '#451A03' : tokens.primaryColor,
                  boxShadow: isGoldenMode 
                    ? 'inset 0 1px 1.5px rgba(255, 255, 255, 0.9), 0 2px 6px rgba(180, 115, 20, 0.15)' 
                    : undefined,
                }}
              >
                {categoryTitle}
              </span>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto hide-scrollbar flex-1 px-6 py-4">
            {isEn ? (
              <div
                className={`leading-relaxed font-sans font-bold text-center my-4 select-none text-balance ${
                  isGoldenMode ? 'text-[#291305]' : ''
                }`}
                style={{ 
                  fontSize: `${fontSize}px`,
                  textShadow: isGoldenMode ? '0 1px 1px rgba(255, 255, 255, 0.75)' : undefined 
                }}
                dir="ltr"
              >
                {text}
              </div>
            ) : (
              <div
                className={`leading-[2.2] sm:leading-[2.4] font-bold text-center select-none py-3 px-1 ${
                  isGoldenMode ? 'font-cairo text-[#291305]' : 'font-amiri'
                }`}
                style={{ 
                  fontSize: `${fontSize + (isGoldenMode ? 2 : 4)}px`,
                  textShadow: isGoldenMode ? '0 1px 1px rgba(255, 255, 255, 0.75)' : undefined
                }}
                dir="rtl"
              >
                {text}
              </div>
            )}

            {subtitle && (
              <div className="flex items-center justify-center mt-3">
                <span
                  className={`text-xs sm:text-sm font-bold font-cairo text-center px-3.5 py-1 rounded-xl shadow-2xs ${
                    isGoldenMode ? 'border border-amber-400/50 text-[#451A03]' : ''
                  }`}
                  style={{
                    background: isGoldenMode ? 'rgba(255, 255, 255, 0.85)' : undefined,
                    color: isGoldenMode ? '#451A03' : tokens.primaryColor,
                  }}
                  dir={isEn ? 'ltr' : 'rtl'}
                >
                  {subtitle}
                </span>
              </div>
            )}
          </div>

          {/* Action Bar matching image with safe-area bottom elevation */}
          <div
            className={`p-4 pt-3.5 shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t ${
              isGoldenMode ? 'border-amber-300/70 shadow-inner' : 'border-slate-100 dark:border-white/5'
            }`}
            dir="ltr"
            style={{
              background: isGoldenMode 
                ? 'linear-gradient(180deg, rgba(254, 243, 199, 0.5) 0%, rgba(252, 231, 153, 0.8) 100%)'
                : tokens.cardBgColor,
              paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
            }}
          >
            {/* 1. Chevron Down / Hide Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 ${
                isGoldenMode ? 'golden-3d-btn-light' : ''
              }`}
              style={!isGoldenMode ? {
                backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: tokens.textColor,
              } : undefined}
              title={isEn ? 'Hide list' : 'إخفاء القائمة'}
            >
              <ChevronDown className={`w-5 h-5 ${isGoldenMode ? 'text-amber-950' : ''}`} />
            </button>

            {/* 2. Zoom Button */}
            <button
              type="button"
              onClick={handleToggleZoom}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 ${
                isGoldenMode ? 'golden-3d-btn-light' : ''
              }`}
              style={!isGoldenMode ? {
                backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: tokens.textColor,
              } : undefined}
              title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
            >
              <ZoomIn className={`w-5 h-5 ${isGoldenMode ? 'text-amber-950' : ''}`} />
            </button>

            {/* 3. Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 ${
                isGoldenMode && !copied ? 'golden-3d-btn-light' : ''
              }`}
              style={copied ? {
                backgroundColor: '#10B981',
                color: '#FFFFFF',
              } : (!isGoldenMode ? {
                backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: tokens.textColor,
              } : undefined)}
              title={isEn ? 'Copy text' : 'نسخ النص'}
            >
              {copied ? <Check className="w-5 h-5 text-white stroke-[2.5]" /> : <Copy className={`w-5 h-5 ${isGoldenMode ? 'text-amber-950' : ''}`} />}
            </button>

            {/* 4. Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 ${
                isGoldenMode ? 'golden-3d-btn-light' : ''
              }`}
              style={!isGoldenMode ? {
                backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                color: tokens.textColor,
              } : undefined}
              title={isEn ? 'Share Image' : 'مشاركة كصورة'}
            >
              <Share2 className={`w-5 h-5 ${isGoldenMode ? 'text-amber-950' : ''}`} />
            </button>

            {/* 5. Audio / TTS Button */}
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 ${
                isGoldenMode 
                  ? (isPlaying ? 'golden-3d-pill-btn ring-2 ring-white/80 animate-pulse text-white' : 'golden-3d-btn-light')
                  : ''
              }`}
              style={!isGoldenMode ? {
                backgroundColor: isPlaying
                  ? hexToRgba(tokens.primaryColor, 0.15)
                  : (tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
                color: isPlaying ? '#EF4444' : tokens.textColor,
              } : undefined}
              title={isEn ? (isPlaying ? 'Stop audio' : 'Play audio') : (isPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
            >
              {isPlaying ? (
                <VolumeX className="w-5 h-5 text-white animate-pulse" />
              ) : (
                <Volume2 className={`w-5 h-5 ${isGoldenMode ? 'text-amber-950' : ''}`} />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnifiedEventZoomModal;
