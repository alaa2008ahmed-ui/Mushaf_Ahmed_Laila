import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown, RotateCw } from 'lucide-react';
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
  onNextEvent?: (e?: React.MouseEvent) => void;
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
  onNextEvent,
}) => {
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const { language, dir } = useLanguage();
  const tokens = getModernFlatTokens(theme, themeKey);
  const isEn = language === 'en';

  const [copied, setCopied] = useState(false);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(26);

  // Auto-detect golden/modern mode if on modern home layout
  const isGoldenMode = isGolden ?? (
    typeof document !== 'undefined' && (
      document.body.classList.contains('modern-home-active') ||
      document.querySelector('.modern-home-layout') !== null ||
      localStorage.getItem('home_layout_system') === 'modern'
    )
  );

  // Detect night mode in smart design / app
  const isNight = Boolean(
    isNightMode ||
    tokens.isDark ||
    theme.isDark ||
    themeKey === 'black_gold' ||
    themeKey === 'deep_black' ||
    themeKey === 'black' ||
    (typeof document !== 'undefined' && (
      document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('theme-black-gold') ||
      document.body.classList.contains('theme-black') ||
      document.body.classList.contains('dark') ||
      localStorage.getItem('night_mode_active_modern') === 'true'
    ))
  );

  // Detect active theme variants (Sky, Emerald, Burgundy)
  const isSkyTheme = !isNight && (
    homeThemeVariant === 'sky' ||
    (typeof document !== 'undefined' && (
      document.body.classList.contains('theme-sky') ||
      document.documentElement.classList.contains('theme-sky') ||
      localStorage.getItem('home_theme_variant') === 'sky'
    ))
  );

  const isEmeraldTheme = !isNight && (
    homeThemeVariant === 'emerald' ||
    (typeof document !== 'undefined' && (
      document.body.classList.contains('theme-emerald') ||
      document.documentElement.classList.contains('theme-emerald') ||
      localStorage.getItem('home_theme_variant') === 'emerald'
    ))
  );

  const isBurgundyTheme = !isNight && (
    homeThemeVariant === 'burgundy' ||
    (typeof document !== 'undefined' && (
      document.body.classList.contains('theme-burgundy') ||
      document.documentElement.classList.contains('theme-burgundy') ||
      localStorage.getItem('home_theme_variant') === 'burgundy'
    ))
  );

  const isModernMode = Boolean(
    isGoldenMode || isSkyTheme || isEmeraldTheme || isBurgundyTheme
  );

  const themeStyles = useMemo(() => {
    if (isNight) {
      return {
        variant: 'night',
        modalBorderClass: 'border-t-2 border-x-2 border-amber-500/50',
        modalBg: 'linear-gradient(168deg, #26242c 0%, #1a1921 48%, #121117 100%)',
        modalBoxShadow: '0 -14px 44px rgba(0, 0, 0, 0.95), inset 0 2px 1.5px rgba(255, 255, 255, 0.18), inset 0 -3px 6px rgba(0, 0, 0, 0.8)',
        textColor: '#FFFFFF',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.8)',
        dragHandleClass: 'bg-amber-400/60 border border-amber-400/40 shadow-xs',
        badgeBg: 'linear-gradient(180deg, #36343e 0%, #26242c 60%, #1c1a22 100%)',
        badgeBorder: 'rgba(245, 158, 11, 0.45)',
        badgeColor: '#FBBF24',
        badgeShadow: '0 3px 8px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        subtitleBg: 'linear-gradient(180deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.1) 100%)',
        subtitleBorder: 'rgba(245, 158, 11, 0.4)',
        subtitleColor: '#FDE68A',
        actionBarBorderClass: 'border-amber-500/25',
        actionBarBg: 'linear-gradient(180deg, rgba(26, 24, 32, 0.98) 0%, rgba(16, 14, 20, 0.99) 100%)',
        btnBg: 'linear-gradient(145deg, #322f3d 0%, #201e28 55%, #16151d 100%)',
        btnBorder: '1px solid rgba(245, 158, 11, 0.4)',
        btnShadow: '0 4px 10px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.6)',
        btnColor: '#F59E0B',
        iconColorClass: 'text-amber-400',
        activeBtnBg: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
        activeBtnColor: '#FFFFFF',
        activeBtnBorder: '1px solid rgba(16, 185, 129, 0.6)',
      };
    }

    if (isSkyTheme) {
      return {
        variant: 'sky',
        modalBorderClass: 'border-t-2 border-x-2 border-sky-400/80',
        modalBg: 'linear-gradient(170deg, #F0F9FF 0%, #E0F2FE 20%, #BAE6FD 50%, #7DD3FC 80%, #38BDF8 100%)',
        modalBoxShadow: '0 -10px 40px rgba(2, 132, 199, 0.32), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(2, 132, 199, 0.15)',
        textColor: '#000000',
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.85)',
        dragHandleClass: 'bg-sky-600/40 border border-sky-400/50',
        badgeBg: 'rgba(255, 255, 255, 0.94)',
        badgeBorder: 'rgba(2, 132, 199, 0.45)',
        badgeColor: '#0369a1',
        badgeShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.95), 0 2px 6px rgba(2, 132, 199, 0.16)',
        subtitleBg: 'rgba(255, 255, 255, 0.92)',
        subtitleBorder: 'rgba(2, 132, 199, 0.45)',
        subtitleColor: '#0369a1',
        actionBarBorderClass: 'border-sky-300/70',
        actionBarBg: 'linear-gradient(180deg, rgba(224, 242, 254, 0.55) 0%, rgba(186, 230, 253, 0.85) 100%)',
        btnBg: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 60%, #BAE6FD 100%)',
        btnBorder: '1px solid rgba(2, 132, 199, 0.45)',
        btnShadow: '0 3px 6px rgba(2, 132, 199, 0.2), inset 0 1px 1px #FFFFFF',
        btnColor: '#0369a1',
        iconColorClass: 'text-sky-700',
        activeBtnBg: 'linear-gradient(145deg, #0284c7 0%, #0369a1 100%)',
        activeBtnColor: '#FFFFFF',
        activeBtnBorder: '1px solid rgba(3, 105, 161, 0.6)',
      };
    }

    if (isEmeraldTheme) {
      return {
        variant: 'emerald',
        modalBorderClass: 'border-t-2 border-x-2 border-emerald-400/80',
        modalBg: 'linear-gradient(170deg, #F0FDF4 0%, #DCFCE7 20%, #BBF7D0 50%, #86EFAC 80%, #34D399 100%)',
        modalBoxShadow: '0 -10px 40px rgba(5, 150, 105, 0.32), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(5, 150, 105, 0.15)',
        textColor: '#000000',
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.85)',
        dragHandleClass: 'bg-emerald-600/40 border border-emerald-400/50',
        badgeBg: 'rgba(255, 255, 255, 0.94)',
        badgeBorder: 'rgba(5, 150, 105, 0.45)',
        badgeColor: '#047857',
        badgeShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.95), 0 2px 6px rgba(5, 150, 105, 0.16)',
        subtitleBg: 'rgba(255, 255, 255, 0.92)',
        subtitleBorder: 'rgba(5, 150, 105, 0.45)',
        subtitleColor: '#047857',
        actionBarBorderClass: 'border-emerald-300/70',
        actionBarBg: 'linear-gradient(180deg, rgba(220, 252, 231, 0.55) 0%, rgba(187, 247, 208, 0.85) 100%)',
        btnBg: 'linear-gradient(180deg, #FFFFFF 0%, #DCFCE7 60%, #BBF7D0 100%)',
        btnBorder: '1px solid rgba(5, 150, 105, 0.45)',
        btnShadow: '0 3px 6px rgba(5, 150, 105, 0.2), inset 0 1px 1px #FFFFFF',
        btnColor: '#047857',
        iconColorClass: 'text-emerald-700',
        activeBtnBg: 'linear-gradient(145deg, #059669 0%, #047857 100%)',
        activeBtnColor: '#FFFFFF',
        activeBtnBorder: '1px solid rgba(4, 120, 87, 0.6)',
      };
    }

    if (isBurgundyTheme) {
      return {
        variant: 'burgundy',
        modalBorderClass: 'border-t-2 border-x-2 border-rose-400/80',
        modalBg: 'linear-gradient(170deg, #FFF1F2 0%, #FFE4E6 20%, #FECDD3 50%, #FDA4AF 80%, #FB7185 100%)',
        modalBoxShadow: '0 -10px 40px rgba(159, 18, 57, 0.32), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(159, 18, 57, 0.15)',
        textColor: '#000000',
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.85)',
        dragHandleClass: 'bg-rose-700/40 border border-rose-400/50',
        badgeBg: 'rgba(255, 255, 255, 0.94)',
        badgeBorder: 'rgba(225, 29, 72, 0.45)',
        badgeColor: '#881337',
        badgeShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.95), 0 2px 6px rgba(159, 18, 57, 0.16)',
        subtitleBg: 'rgba(255, 255, 255, 0.92)',
        subtitleBorder: 'rgba(225, 29, 72, 0.45)',
        subtitleColor: '#881337',
        actionBarBorderClass: 'border-rose-300/70',
        actionBarBg: 'linear-gradient(180deg, rgba(255, 228, 230, 0.55) 0%, rgba(254, 205, 211, 0.85) 100%)',
        btnBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFE4E6 60%, #FECDD3 100%)',
        btnBorder: '1px solid rgba(225, 29, 72, 0.45)',
        btnShadow: '0 3px 6px rgba(159, 18, 57, 0.2), inset 0 1px 1px #FFFFFF',
        btnColor: '#881337',
        iconColorClass: 'text-rose-800',
        activeBtnBg: 'linear-gradient(145deg, #9f1239 0%, #881337 100%)',
        activeBtnColor: '#FFFFFF',
        activeBtnBorder: '1px solid rgba(136, 19, 55, 0.6)',
      };
    }

    // Default: Golden / Amber Theme
    return {
      variant: 'gold',
      modalBorderClass: 'border-t-2 border-x-2 border-amber-400/80',
      modalBg: 'linear-gradient(170deg, #FFFDF8 0%, #FEF8E7 15%, #FDECB8 45%, #F7D780 80%, #EDB948 100%)',
      modalBoxShadow: '0 -10px 40px rgba(146, 64, 14, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(146, 64, 14, 0.15)',
      textColor: '#291305',
      textShadow: '0 1px 1px rgba(255, 255, 255, 0.75)',
      dragHandleClass: 'bg-amber-800/30 border border-amber-400/40',
      badgeBg: 'rgba(255, 255, 255, 0.92)',
      badgeBorder: 'rgba(217, 119, 6, 0.45)',
      badgeColor: '#451A03',
      badgeShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.9), 0 2px 6px rgba(180, 115, 20, 0.15)',
      subtitleBg: 'rgba(255, 255, 255, 0.85)',
      subtitleBorder: 'rgba(217, 119, 6, 0.5)',
      subtitleColor: '#451A03',
      actionBarBorderClass: 'border-amber-300/70',
      actionBarBg: 'linear-gradient(180deg, rgba(254, 243, 199, 0.5) 0%, rgba(252, 231, 153, 0.8) 100%)',
      btnBg: 'linear-gradient(180deg, #FFFFFF 0%, #FEF9C3 60%, #FEF08A 100%)',
      btnBorder: '1px solid rgba(217, 119, 6, 0.45)',
      btnShadow: '0 3px 6px rgba(180, 115, 20, 0.2), inset 0 1px 1px #FFFFFF',
      btnColor: '#451A03',
      iconColorClass: 'text-amber-950',
      activeBtnBg: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
      activeBtnColor: '#FFFFFF',
      activeBtnBorder: '1px solid rgba(16, 185, 129, 0.6)',
    };
  }, [isNight, isSkyTheme, isEmeraldTheme, isBurgundyTheme]);

  useEffect(() => {
    const unsubscribe = subscribeTTS(setPlayingText);
    return () => {
      unsubscribe();
      stopTTS();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('zoom-modal-active');
        document.body.removeAttribute('data-zoom-modal');
        window.dispatchEvent(new CustomEvent('modal-state-changed', { detail: { isOpen: false, type: 'zoom' } }));
      }
      return;
    }
    if (typeof document !== 'undefined') {
      document.body.classList.add('zoom-modal-active');
      document.body.setAttribute('data-zoom-modal', 'true');
      window.dispatchEvent(new CustomEvent('modal-state-changed', { detail: { isOpen: true, type: 'zoom' } }));
    }
    const unregister = registerBackInterceptor(() => {
      onClose();
      return true;
    });
    return () => {
      unregister();
      if (typeof document !== 'undefined') {
        document.body.classList.remove('zoom-modal-active');
        document.body.removeAttribute('data-zoom-modal');
        window.dispatchEvent(new CustomEvent('modal-state-changed', { detail: { isOpen: false, type: 'zoom' } }));
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !text || typeof document === 'undefined') return null;

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

  // Button styles based on mode
  const getActionButtonStyle = (isActionActive = false): React.CSSProperties => {
    if (isModernMode) {
      if (isActionActive) {
        return {
          background: themeStyles.activeBtnBg,
          border: themeStyles.activeBtnBorder,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          color: themeStyles.activeBtnColor,
        };
      }
      return {
        background: themeStyles.btnBg,
        border: themeStyles.btnBorder,
        boxShadow: themeStyles.btnShadow,
        color: themeStyles.btnColor,
      };
    }
    return {
      backgroundColor: isActionActive
        ? '#10B981'
        : (tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
      color: isActionActive ? '#FFFFFF' : tokens.textColor,
    };
  };

  const getActionIconColorClass = () => {
    if (isModernMode) {
      return themeStyles.iconColorClass;
    }
    return '';
  };

  return createPortal(
    <div
      id="unified-event-zoom-modal-backdrop"
      className="fixed inset-0 bg-black/65 z-[10000] flex flex-col justify-end backdrop-blur-xs select-none"
      onClick={onClose}
      dir={dir}
    >
        <motion.div
          initial={{ y: '100%', opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className={`zoom-modal-sheet w-full max-w-xl mx-auto rounded-t-[32px] flex flex-col max-h-[88dvh] overflow-hidden relative shadow-2xl ${
            isModernMode ? themeStyles.modalBorderClass : ''
          }`}
          style={{
            background: isModernMode ? themeStyles.modalBg : tokens.cardBgColor,
            boxShadow: isModernMode ? themeStyles.modalBoxShadow : undefined,
            color: isModernMode ? themeStyles.textColor : 'var(--text-color)',
            fontFamily: isEn ? 'sans-serif' : (isModernMode ? "'Cairo', sans-serif" : theme.font),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Drag Handle & Category Badge */}
          <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
            <div
              className={`w-12 h-1.5 rounded-full mb-2.5 ${
                isModernMode ? themeStyles.dragHandleClass : 'bg-slate-300 dark:bg-zinc-700'
              }`}
            />
            <div className="w-full flex items-center justify-center gap-2">
              <span
                className={`zoom-category-badge px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isModernMode ? 'border shadow-2xs' : ''
                }`}
                style={{
                  background: isModernMode ? themeStyles.badgeBg : hexToRgba(tokens.primaryColor, 0.1),
                  borderColor: isModernMode ? themeStyles.badgeBorder : undefined,
                  color: isModernMode ? themeStyles.badgeColor : tokens.primaryColor,
                  boxShadow: isModernMode ? themeStyles.badgeShadow : undefined,
                }}
              >
                {categoryTitle}
              </span>
              {onNextEvent && (
                <button
                  type="button"
                  onClick={onNextEvent}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-90 cursor-pointer shadow-2xs shrink-0 ${
                    isModernMode ? 'border' : ''
                  }`}
                  style={{
                    background: isModernMode ? themeStyles.badgeBg : hexToRgba(tokens.primaryColor, 0.1),
                    borderColor: isModernMode ? themeStyles.badgeBorder : undefined,
                    color: isModernMode ? themeStyles.badgeColor : tokens.primaryColor,
                    boxShadow: isModernMode ? themeStyles.badgeShadow : undefined,
                  }}
                  title={isEn ? 'Show another event' : 'حدث آخر'}
                  aria-label={isEn ? 'Show another event' : 'حدث آخر'}
                >
                  <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 active:rotate-180" strokeWidth={2.2} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-4">
            {isEn ? (
              <div
                className="leading-relaxed font-sans font-bold text-center my-4 select-none text-balance zoom-modal-text"
                style={{ 
                  fontSize: `${fontSize}px`,
                  color: isModernMode ? themeStyles.textColor : undefined,
                  textShadow: isModernMode ? themeStyles.textShadow : undefined 
                }}
                dir="ltr"
              >
                {text}
              </div>
            ) : (
              <div
                className={`leading-[2.2] sm:leading-[2.4] font-bold text-center select-none py-3 px-1 zoom-modal-text ${
                  isModernMode ? 'font-cairo' : 'font-amiri'
                }`}
                style={{ 
                  fontSize: `${fontSize + (isModernMode ? 2 : 4)}px`,
                  color: isModernMode ? themeStyles.textColor : undefined,
                  textShadow: isModernMode ? themeStyles.textShadow : undefined
                }}
                dir="rtl"
              >
                {text}
              </div>
            )}

            {subtitle && (
              <div className="flex items-center justify-center mt-3">
                <span
                  className={`zoom-subtitle-badge text-xs sm:text-sm font-bold font-cairo text-center px-3.5 py-1 rounded-xl shadow-2xs ${
                    isModernMode ? 'border' : ''
                  }`}
                  style={{
                    background: isModernMode ? themeStyles.subtitleBg : undefined,
                    borderColor: isModernMode ? themeStyles.subtitleBorder : undefined,
                    color: isModernMode ? themeStyles.subtitleColor : tokens.primaryColor,
                    boxShadow: isModernMode && isNight
                      ? '0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                      : undefined,
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
            className={`zoom-modal-action-bar p-4 pt-3.5 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t ${
              isModernMode ? `${themeStyles.actionBarBorderClass} shadow-inner` : 'border-slate-100 dark:border-white/5'
            }`}
            dir="ltr"
            style={{
              background: isModernMode ? themeStyles.actionBarBg : tokens.cardBgColor,
            }}
          >
            {/* 1. Chevron Down / Hide Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="zoom-action-btn w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={getActionButtonStyle()}
              title={isEn ? 'Hide list' : 'إخفاء القائمة'}
            >
              <ChevronDown className={`w-5 h-5 ${getActionIconColorClass()}`} style={{ color: themeStyles.btnColor, stroke: themeStyles.btnColor }} />
            </button>

            {/* 2. Zoom Button */}
            <button
              type="button"
              onClick={handleToggleZoom}
              className="zoom-action-btn w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={getActionButtonStyle()}
              title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
            >
              <ZoomIn className={`w-5 h-5 ${getActionIconColorClass()}`} style={{ color: themeStyles.btnColor, stroke: themeStyles.btnColor }} />
            </button>

            {/* 3. Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="zoom-action-btn w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={getActionButtonStyle(copied)}
              title={isEn ? 'Copy text' : 'نسخ النص'}
            >
              {copied ? (
                <Check className="w-5 h-5 text-white stroke-[2.5]" />
              ) : (
                <Copy className={`w-5 h-5 ${getActionIconColorClass()}`} style={{ color: themeStyles.btnColor, stroke: themeStyles.btnColor }} />
              )}
            </button>

            {/* 4. Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="zoom-action-btn w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
              style={getActionButtonStyle()}
              title={isEn ? 'Share Image' : 'مشاركة كصورة'}
            >
              <Share2 className={`w-5 h-5 ${getActionIconColorClass()}`} style={{ color: themeStyles.btnColor, stroke: themeStyles.btnColor }} />
            </button>

            {/* 5. Audio / TTS Button */}
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`zoom-action-btn w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 ${
                isPlaying ? 'ring-2 ring-red-400/80 animate-pulse' : ''
              }`}
              style={
                isPlaying
                  ? {
                      background: 'linear-gradient(145deg, #EF4444 0%, #DC2626 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.6)',
                      boxShadow: '0 0 16px rgba(239, 68, 68, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }
                  : getActionButtonStyle()
              }
              title={isEn ? (isPlaying ? 'Stop audio' : 'Play audio') : (isPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
            >
              {isPlaying ? (
                <VolumeX className="w-5 h-5 text-white animate-pulse" />
              ) : (
                <Volume2 className={`w-5 h-5 ${getActionIconColorClass()}`} style={{ color: themeStyles.btnColor, stroke: themeStyles.btnColor }} />
              )}
            </button>
          </div>
        </motion.div>
      </div>,
    document.body
  );
};

export default UnifiedEventZoomModal;
