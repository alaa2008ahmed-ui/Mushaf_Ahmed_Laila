import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Menu,
  BookOpen,
  Compass,
  Headphones,
  Type,
  Sparkles,
  ZoomIn,
  Share2,
  Bookmark,
  Play,
  Home,
  Palette,
  Settings,
  Download,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  HelpCircle,
  Bell
} from 'lucide-react';
import { QuranGuideStep } from './quranGuideSteps';
import { useTheme } from '../../context/ThemeContext';
import { getMadinahThemePalette } from './MadinahFrameSVG';
import { isDarkQuranTheme } from './constants';
import { resolveQuranModalPalette } from './modalThemeUtils';

interface QuranSpotlightGuideProps {
  guideKey: string;
  steps: QuranGuideStep[];
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
  onStepChange?: (stepIndex: number, step: QuranGuideStep) => void;
  currentTheme?: any;
  isMadinahMode?: boolean;
}

export const getQuranGuideSeen = (_guideKey: string): boolean => {
  return true; // Guides never open automatically on first launch; they only work when pressing the guide button
};

export const setQuranGuideSeen = (guideKey: string): void => {
  try {
    localStorage.setItem(`quran_guide_seen_${guideKey}`, 'true');
  } catch (e) {}
};

export const resetQuranGuides = (): void => {
  try {
    const keys = [
      'main_reader',
      'madinah_reader',
      'sidebar_menu',
      'sidebar_menu_v2',
      'madinah_sidebar_menu_v2',
      'surah_juz_modal',
      'surah_juz_modal_v2',
      'bookmarks_modal',
      'ayah_action_menu'
    ];
    keys.forEach(k => localStorage.removeItem(`quran_guide_seen_${k}`));
  } catch (e) {}
};

const renderStepIcon = (type?: string, size = 18, flat = false) => {
  const iconProps = { size, className: flat ? 'text-white' : 'text-white drop-shadow-sm' };
  switch (type) {
    case 'menu':
      return <Menu {...iconProps} />;
    case 'book':
      return <BookOpen {...iconProps} />;
    case 'page':
    case 'compass':
      return <Compass {...iconProps} />;
    case 'audio':
    case 'headphones':
      return <Headphones {...iconProps} />;
    case 'text':
    case 'type':
      return <Type {...iconProps} />;
    case 'zoom':
      return <ZoomIn {...iconProps} />;
    case 'share':
      return <Share2 {...iconProps} />;
    case 'bookmark':
      return <Bookmark {...iconProps} />;
    case 'scroll':
    case 'play':
      return <Play {...iconProps} />;
    case 'home':
      return <Home {...iconProps} />;
    case 'theme':
      return <Palette {...iconProps} />;
    case 'settings':
      return <Settings {...iconProps} />;
    case 'download':
      return <Download {...iconProps} />;
    case 'search':
      return <Search {...iconProps} />;
    case 'sajdah':
      return <Compass {...iconProps} />;
    case 'bell':
    case 'notification':
      return <Bell {...iconProps} />;
    case 'star':
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'info':
      return <HelpCircle {...iconProps} />;
    default:
      return <BookOpen {...iconProps} />;
  }
};

export const QuranSpotlightGuide: React.FC<QuranSpotlightGuideProps> = ({
  guideKey,
  steps,
  isOpen,
  onClose,
  isEn = false,
  onStepChange,
  currentTheme,
  isMadinahMode,
}) => {
  const { theme: appTheme, isNightMode, homeThemeVariant, themeKey } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isMadinah = Boolean(
    isMadinahMode ||
    guideKey.startsWith('madinah_') ||
    (typeof document !== 'undefined' && document.querySelector('#app-container.quran-reader-container.madinah-mode'))
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setQuranGuideSeen(guideKey);
    }
  }, [isOpen, guideKey]);

  const step = steps[currentStepIndex];

  // Notify parent of step change
  useEffect(() => {
    if (isOpen && step && onStepChange) {
      onStepChange(currentStepIndex, step);
    }
  }, [isOpen, currentStepIndex, step, onStepChange]);

  // Helper to find the scrollable parent container of a given element
  const findScrollParent = useCallback((el: HTMLElement): HTMLElement | null => {
    // 1. Direct check for the Quran floating sidebar menu container
    const menuContainer = el.closest('#floating-menu-scroll-container') as HTMLElement | null;
    if (menuContainer) return menuContainer;

    // 2. Check if inside floating-menu
    const floatingMenu = el.closest('#floating-menu') as HTMLElement | null;
    if (floatingMenu) {
      const scrollableInside = floatingMenu.querySelector('.overflow-y-auto') as HTMLElement | null;
      if (scrollableInside) return scrollableInside;
    }

    // 3. Direct check for the Quran reader scroll container
    const mushafContent = el.closest('#mushaf-content') as HTMLElement | null;
    if (mushafContent) return mushafContent;

    // 4. Walk up the DOM tree looking for an overflow container
    let p = el.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      const s = window.getComputedStyle(p);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && p.scrollHeight > p.clientHeight + 10) {
        return p;
      }
      p = p.parentElement;
    }
    return null;
  }, []);

  // Update target bounding box
  const updateRect = useCallback(() => {
    if (!step?.targetSelector) {
      setTargetRect(null);
      return;
    }

    try {
      const elements = Array.from(document.querySelectorAll(step.targetSelector)) as HTMLElement[];
      if (elements && elements.length > 0) {
        // Filter elements that have layout dimensions and are not hidden
        const visibleElements = elements.filter(el => {
          const r = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return (
            r.width > 0 &&
            r.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0'
          );
        });

        if (visibleElements.length > 0) {
          const isSingleTargetStep =
            visibleElements.length === 1 ||
            step.id === 'surah_header_style' ||
            step.id === 'ayah_text_touch' ||
            step.id === 'verse_num_bracket' ||
            step.id === 'madinah_ayah_text' ||
            step.id === 'madinah_verse_end' ||
            step.id === 'madinah_bottom_page' ||
            step.id === 'madinah_autoscroll' ||
            step.id === 'madinah_menu_button' ||
            step.id === 'madinah_surah_header' ||
            step.id === 'madinah_header_bookmark' ||
            step.id === 'madinah_play_audio' ||
            step.id === 'madinah_swipe_nav';

          if (isSingleTargetStep) {
            let chosen = visibleElements[0];
            
            // Dynamically select the best element on the current visible page (horizontal + vertical bounds)
            const inViewport = visibleElements.filter(el => {
              const r = el.getBoundingClientRect();
              return (
                r.top >= -20 &&
                r.bottom <= window.innerHeight + 50 &&
                r.left >= -10 &&
                r.right <= window.innerWidth + 10
              );
            });
            if (inViewport.length > 0) {
              chosen = inViewport[0];
            }

            const rawRect = chosen.getBoundingClientRect();
            if (rawRect.width > 0 && rawRect.height > 0) {
              // For verse number brackets/rosettes, apply full child union and generous padding so the spotlight circle frames them cleanly without clipping
              if (step.id === 'verse_num_bracket' || step.id === 'madinah_verse_end' || chosen.classList.contains('verse-container')) {
                let minLeft = rawRect.left;
                let minTop = rawRect.top;
                let maxRight = rawRect.right;
                let maxBottom = rawRect.bottom;

                // Union bounds of all rendered children (brackets and inner digits)
                if (chosen.children && chosen.children.length > 0) {
                  Array.from(chosen.children).forEach((child) => {
                    const cr = child.getBoundingClientRect();
                    if (cr.width > 0 && cr.height > 0) {
                      if (cr.left < minLeft) minLeft = cr.left;
                      if (cr.top < minTop) minTop = cr.top;
                      if (cr.right > maxRight) maxRight = cr.right;
                      if (cr.bottom > maxBottom) maxBottom = cr.bottom;
                    }
                  });
                }

                const boundsW = maxRight - minLeft;
                const boundsH = maxBottom - minTop;
                const padX = 14;
                const padY = 10;
                const minW = 56;
                const minH = 46;

                const w = Math.max(minW, boundsW + padX * 2);
                const h = Math.max(minH, boundsH + padY * 2);
                const cx = (minLeft + maxRight) / 2;
                const cy = (minTop + maxBottom) / 2;
                setTargetRect(new DOMRect(cx - w / 2, cy - h / 2, w, h));
              } else {
                setTargetRect(rawRect);
              }
              return;
            }
          } else {
            // Multi-element target (e.g., all 4 items spanning the selected row)
            let minLeft = Infinity;
            let minTop = Infinity;
            let maxRight = -Infinity;
            let maxBottom = -Infinity;

            for (const el of visibleElements) {
              const r = el.getBoundingClientRect();
              if (r.left < minLeft) minLeft = r.left;
              if (r.top < minTop) minTop = r.top;
              if (r.right > maxRight) maxRight = r.right;
              if (r.bottom > maxBottom) maxBottom = r.bottom;
            }

            if (minLeft < Infinity && maxRight > -Infinity && maxRight > minLeft && maxBottom > minTop) {
              setTargetRect(new DOMRect(minLeft, minTop, maxRight - minLeft, maxBottom - minTop));
              return;
            }
          }
        }
      }

      if (step.id === 'madinah_autoscroll') {
        const pageBadge = document.querySelector('#madinah-bottom-page-btn, .madinah-bottom-page-badge') as HTMLElement | null;
        if (pageBadge) {
          const r = pageBadge.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            const centerX = r.left + r.width / 2;
            const btnSize = 22;
            setTargetRect(new DOMRect(centerX + 37, r.bottom - btnSize, btnSize, btnSize));
            return;
          }
        }
      }
    } catch (e) {}

    setTargetRect(null);
  }, [step]);

  // Smoothly scroll the container or window to bring the target element into view
  const scrollToTarget = useCallback((chosen: HTMLElement) => {
    try {
      const scrollParent = findScrollParent(chosen);
      if (scrollParent) {
        const isSidebarGuide = guideKey.includes('sidebar_menu') || scrollParent.id === 'floating-menu-scroll-container';

        // Step 0 in sidebar menu: reset to top
        if (isSidebarGuide && currentStepIndex === 0) {
          scrollParent.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Special handling for Surah Header frame:
        // Scroll the mushaf-content container to top: 0 so Surah Al-Fatihah is fully visible at top
        if (
          step?.id === 'surah_header_style' ||
          chosen.classList.contains('surah-header-visual') ||
          chosen.closest('#surah-header-container')
        ) {
          scrollParent.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const containerRect = scrollParent.getBoundingClientRect();
        const elRect = chosen.getBoundingClientRect();
        const currentScroll = scrollParent.scrollTop;
        const relativeTop = elRect.top - containerRect.top;

        // Center the element inside the scrollable container so it's fully visible
        const desiredRelativeTop = Math.max(20, (containerRect.height - elRect.height) / 2);
        const scrollDiff = relativeTop - desiredRelativeTop;
        const targetScroll = Math.max(0, currentScroll + scrollDiff);

        if (Math.abs(scrollDiff) > 6) {
          scrollParent.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
      } else {
        // Fallback for standard elements in window
        if (step?.id === 'madinah_bottom_page' || step?.id === 'madinah_autoscroll') {
          return;
        }
        const viewportH = window.innerHeight;
        const elRect = chosen.getBoundingClientRect();
        if (elRect.top < 70 || elRect.bottom > viewportH - 70) {
          try {
            chosen.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          } catch (e) {}
        }
      }
    } catch (e) {}
  }, [findScrollParent, guideKey, currentStepIndex, step]);

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !step) return;

    // 1. Immediately find the target element and trigger auto-scroll
    try {
      const elements = Array.from(document.querySelectorAll(step.targetSelector || '')) as HTMLElement[];
      const visible = elements.filter(el => {
        const r = el.getBoundingClientRect();
        const s = window.getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
      });
      if (visible.length > 0) {
        let toScroll = visible[0];
        const inViewport = visible.filter(el => {
          const r = el.getBoundingClientRect();
          return (
            r.top >= -20 &&
            r.bottom <= window.innerHeight + 50 &&
            r.left >= -10 &&
            r.right <= window.innerWidth + 10
          );
        });
        if (inViewport.length > 0) {
          toScroll = inViewport[0];
        }
        scrollToTarget(toScroll);
      }
    } catch (e) {}

    // 2. Perform initial rect computation
    updateRect();

    // 3. Continuous RAF tracking loop while the smooth scroll animates
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const startTimestamp = performance.now();
    const trackAnimation = () => {
      updateRect();
      if (performance.now() - startTimestamp < 750) {
        rafRef.current = requestAnimationFrame(trackAnimation);
      }
    };
    rafRef.current = requestAnimationFrame(trackAnimation);

    // 4. Staggered timers as reliable fallbacks
    const t1 = setTimeout(updateRect, 50);
    const t2 = setTimeout(updateRect, 150);
    const t3 = setTimeout(updateRect, 300);
    const t4 = setTimeout(updateRect, 500);
    const t5 = setTimeout(updateRect, 750);

    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, step, currentStepIndex, scrollToTarget, updateRect]);

  if (!isOpen || !step) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setQuranGuideSeen(guideKey);
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setQuranGuideSeen(guideKey);
    onClose();
  };

  // Compute position for tooltip card (20% smaller across all Quran pages)
  let cardPositionStyle: React.CSSProperties = {};
  let pointerPlacement: 'top' | 'bottom' | 'center' = 'center';
  const isCompact = true;

  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 700;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 380;
  const cardWidth = isCompact
    ? Math.min(304, Math.round((screenWidth - 28) * 0.8))
    : Math.min(380, screenWidth - 28);
  const margin = isCompact ? 11 : 14;
  const cardHeight = cardRef.current?.offsetHeight || (isCompact ? 192 : 240);
  const beakHalf = isCompact ? 6 : 8;

  let beakLeft = Math.round(cardWidth / 2 - beakHalf);

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const spaceBelow = screenHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const isTargetVeryLarge = targetRect.height > screenHeight * 0.45;

    const computedLeft = Math.max(14, Math.min(screenWidth - cardWidth - 14, Math.round(targetCenterX - cardWidth / 2)));
    beakLeft = Math.max(
      isCompact ? 16 : 20,
      Math.min(cardWidth - (isCompact ? 22 : 28), Math.round(targetCenterX - computedLeft - beakHalf))
    );

    if (!isTargetVeryLarge && spaceBelow >= cardHeight + margin + 10) {
      pointerPlacement = 'top';
      cardPositionStyle = {
        top: Math.min(targetRect.bottom + margin, screenHeight - cardHeight - 20),
        left: computedLeft,
        width: cardWidth
      };
    } else if (!isTargetVeryLarge && spaceAbove >= cardHeight + margin + 10) {
      pointerPlacement = 'bottom';
      cardPositionStyle = {
        top: Math.max(14, targetRect.top - cardHeight - margin),
        left: computedLeft,
        width: cardWidth
      };
    } else {
      pointerPlacement = 'center';
      const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidth) / 2));
      const centeredTop = Math.max(14, Math.round((screenHeight - cardHeight) / 2));
      cardPositionStyle = {
        top: centeredTop,
        left: centeredLeft,
        width: cardWidth
      };
    }
  } else {
    pointerPlacement = 'center';
    const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidth) / 2));
    const centeredTop = Math.max(14, Math.round((screenHeight - cardHeight) / 2));
    cardPositionStyle = {
      top: centeredTop,
      left: centeredLeft,
      width: cardWidth
    };
  }

  // Always match the active Quran / Madinah theme colors
  const hasQuranTheme = Boolean(currentTheme);
  const isDarkCard = hasQuranTheme
    ? (isDarkQuranTheme(currentTheme) || currentTheme?.id === 'deep_black')
    : (isNightMode || themeKey === 'deep_black' || themeKey === 'black_gold');

  const madinahPalette = isMadinah ? getMadinahThemePalette(currentTheme) : null;
  const quranModalPalette = !isMadinah && hasQuranTheme ? resolveQuranModalPalette(currentTheme) : null;

  const hasColoredDarkAccent =
    isDarkCard &&
    typeof currentTheme?.accent === 'string' &&
    currentTheme.accent.toLowerCase() !== '#27272a' &&
    currentTheme.accent.toLowerCase() !== '#000000';

  const currentAccent = madinahPalette
    ? madinahPalette.primary
    : quranModalPalette
      ? (quranModalPalette.isDeepBlack
          ? (hasColoredDarkAccent ? quranModalPalette.accentColor : '#71717a')
          : quranModalPalette.headerAccent)
      : (appTheme?.primaryColor || '#10b981');

  const cardSurface = (() => {
    if (madinahPalette) {
      const solidFillBg = isDarkCard && !hasColoredDarkAccent ? '#27272a' : madinahPalette.primary;
      const borderStrong = `${madinahPalette.primary}99`;
      const borderSubtle = `${madinahPalette.primary}44`;
      return {
        bg: madinahPalette.frameBg,
        beakTopBg: madinahPalette.frameBg,
        beakBottomBg: madinahPalette.frameBg,
        borderColor: borderStrong,
        lip: 'transparent',
        outerShadow: isDarkCard ? '0 10px 28px rgba(0, 0, 0, 0.55)' : '0 10px 26px rgba(15, 23, 42, 0.14)',
        inset: 'transparent',
        text: isDarkCard ? '#f8fafc' : madinahPalette.bannerText,
        titleColor: isDarkCard ? '#f8fafc' : madinahPalette.primary,
        descText: isDarkCard ? '#e4e4e7' : madinahPalette.metaText,
        divider: borderSubtle,
        dotInactive: `${madinahPalette.primary}38`,
        pillBg: madinahPalette.cartoucheFill,
        pillLip: 'transparent',
        pillText: isDarkCard ? '#f8fafc' : madinahPalette.bannerText,
        pillBorder: borderSubtle,
        badgeBg: isDarkCard ? 'rgba(255, 255, 255, 0.08)' : `${madinahPalette.primary}16`,
        badgeText: isDarkCard ? '#f8fafc' : madinahPalette.bannerText,
        badgeBorder: borderSubtle,
        solidFillBg,
        solidFillBorder: isDarkCard && !hasColoredDarkAccent ? borderStrong : 'transparent',
      };
    }

    if (quranModalPalette) {
      const solidFillBg = quranModalPalette.isDeepBlack && !hasColoredDarkAccent ? '#27272a' : currentAccent;
      const flatBorderStrong = quranModalPalette.isDark
        ? 'rgba(255, 255, 255, 0.28)'
        : `${currentAccent}88`;
      const flatBorderSubtle = quranModalPalette.isDark
        ? 'rgba(255, 255, 255, 0.16)'
        : `${currentAccent}38`;
      if (quranModalPalette.isDark) {
        const opaqueDarkCard = quranModalPalette.cardBg?.startsWith('#') ? quranModalPalette.cardBg : '#18181f';
        const opaqueDarkModal = quranModalPalette.modalBg?.startsWith('#') ? quranModalPalette.modalBg : '#0e0e14';
        return {
          bg: 'none',
          beakTopBg: opaqueDarkCard,
          beakBottomBg: opaqueDarkModal,
          borderColor: flatBorderStrong,
          lip: 'transparent',
          outerShadow: 'none',
          inset: 'transparent',
          text: quranModalPalette.modalText,
          titleColor: quranModalPalette.isDeepBlack ? '#f8fafc' : currentAccent,
          descText: quranModalPalette.mutedText,
          divider: flatBorderSubtle,
          dotInactive: 'rgba(255, 255, 255, 0.28)',
          pillBg: quranModalPalette.closeBg,
          pillLip: 'transparent',
          pillText: quranModalPalette.modalText,
          pillBorder: flatBorderSubtle,
          badgeBg: `${currentAccent}22`,
          badgeText: '#f8fafc',
          badgeBorder: flatBorderSubtle,
          solidFillBg,
          solidFillBorder: quranModalPalette.isDeepBlack && !hasColoredDarkAccent ? flatBorderStrong : 'transparent',
        };
      }
      const lightBg = quranModalPalette.modalBg || '#ffffff';
      return {
        bg: 'none',
        beakTopBg: lightBg,
        beakBottomBg: lightBg,
        borderColor: flatBorderStrong,
        lip: 'transparent',
        outerShadow: 'none',
        inset: 'transparent',
        text: quranModalPalette.modalText,
        titleColor: currentAccent,
        descText: quranModalPalette.mutedText,
        divider: flatBorderSubtle,
        dotInactive: `${currentAccent}33`,
        pillBg: quranModalPalette.closeBg,
        pillLip: 'transparent',
        pillText: quranModalPalette.cardText,
        pillBorder: flatBorderSubtle,
        badgeBg: `${currentAccent}16`,
        badgeText: quranModalPalette.cardText,
        badgeBorder: flatBorderSubtle,
        solidFillBg,
        solidFillBorder: 'transparent',
      };
    }

    if (isDarkCard) {
      return {
        bg: 'none',
        beakTopBg: '#1c1c24',
        beakBottomBg: '#1c1c24',
        borderColor: 'rgba(255, 255, 255, 0.28)',
        lip: 'transparent',
        outerShadow: 'none',
        inset: 'transparent',
        text: '#ffffff',
        titleColor: currentAccent,
        descText: '#e4e4e7',
        divider: 'rgba(255, 255, 255, 0.14)',
        dotInactive: 'rgba(255, 255, 255, 0.28)',
        pillBg: '#27272f',
        pillLip: 'transparent',
        pillText: '#e4e4e7',
        pillBorder: 'rgba(255, 255, 255, 0.16)',
        badgeBg: `${currentAccent}22`,
        badgeText: '#f8fafc',
        badgeBorder: `${currentAccent}48`,
        solidFillBg: currentAccent,
        solidFillBorder: 'transparent',
      };
    }

    return {
      bg: 'none',
      beakTopBg: '#ffffff',
      beakBottomBg: '#ffffff',
      borderColor: `${currentAccent}88`,
      lip: 'transparent',
      outerShadow: 'none',
      inset: 'transparent',
      text: '#0f172a',
      titleColor: '#0f172a',
      descText: '#334155',
      divider: 'rgba(15, 23, 42, 0.12)',
      dotInactive: 'rgba(15, 23, 42, 0.18)',
      pillBg: '#f8fafc',
      pillLip: 'transparent',
      pillText: '#1e293b',
      pillBorder: 'rgba(15, 23, 42, 0.16)',
      badgeBg: `${currentAccent}16`,
      badgeText: '#0f172a',
      badgeBorder: `${currentAccent}48`,
      solidFillBg: currentAccent,
      solidFillBorder: 'transparent',
    };
  })();

  const spotlightPad = isCompact ? 3 : 4;
  const spotlightRadius = isCompact ? 13 : 16;

  return (
    <div
      id="quran-spotlight-guide-root"
      className="quran-spotlight-guide fixed inset-0 z-[100000] pointer-events-none select-none font-sans"
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {/* Subtle, crystal-clear dismiss backdrop with spotlight mask cutout */}
      {targetRect && !step.hideSpotlight ? (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-300"
          onClick={handleSkip}
        >
          <defs>
            <mask id={`spotlight-mask-${step.id}`}>
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={Math.max(0, targetRect.left - spotlightPad)}
                y={Math.max(0, targetRect.top - spotlightPad)}
                width={targetRect.width + spotlightPad * 2}
                height={targetRect.height + spotlightPad * 2}
                rx={spotlightRadius}
                ry={spotlightRadius}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.45)"
            mask={`url(#spotlight-mask-${step.id})`}
          />
        </svg>
      ) : (
        <div
          className={`absolute inset-0 pointer-events-auto ${step.hideSpotlight ? 'bg-black/45' : 'bg-black/55'}`}
          onClick={handleSkip}
        />
      )}

      {/* Target Element Luminous Spotlight Highlight Frame */}
      {targetRect && !step.hideSpotlight && (
        <motion.div
          key={`spotlight-${step.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`absolute pointer-events-none transition-all duration-300 ${isCompact ? 'rounded-[13px]' : 'rounded-2xl'}`}
          style={{
            top: Math.max(0, targetRect.top - spotlightPad),
            left: Math.max(0, targetRect.left - spotlightPad),
            width: targetRect.width + spotlightPad * 2,
            height: targetRect.height + spotlightPad * 2,
            boxShadow: `0 0 0 2px ${currentAccent}`,
            border: `2px solid ${currentAccent}`,
            zIndex: 100001
          }}
        >
          {/* Pulsing corner beacons */}
          <span
            className={`absolute -top-1.5 -right-1.5 rounded-full animate-ping ${isCompact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`}
            style={{ backgroundColor: currentAccent }}
          />
          <span
            className={`absolute -top-1.5 -right-1.5 rounded-full ${isCompact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`}
            style={{ backgroundColor: currentAccent }}
          />
          <span
            className={`absolute -bottom-1.5 -left-1.5 rounded-full animate-ping ${isCompact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`}
            style={{ backgroundColor: currentAccent }}
          />
          <span
            className={`absolute -bottom-1.5 -left-1.5 rounded-full ${isCompact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`}
            style={{ backgroundColor: currentAccent }}
          />
        </motion.div>
      )}

      {/* Floating Tooltip Card — Flat across all Quran reading modes */}
      <motion.div
        key={`card-${step.id}`}
        ref={cardRef}
        data-guide-card="true"
        initial={{ opacity: 0, scale: 0.93, y: pointerPlacement === 'top' ? -12 : (pointerPlacement === 'bottom' ? 12 : 0) }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`fixed z-[100002] pointer-events-auto flex flex-col border-2 overflow-visible box-border max-w-[calc(100vw-28px)] ${
          isCompact ? 'rounded-[19px] p-3 sm:p-4' : 'rounded-3xl p-4 sm:p-5'
        }`}
        style={{
          ...cardPositionStyle,
          backgroundColor: cardSurface.beakTopBg,
          backgroundImage: cardSurface.bg,
          color: cardSurface.text,
          borderColor: cardSurface.borderColor,
          boxShadow: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Pointer Beak */}
        {pointerPlacement === 'top' && (
          <div
            className={`absolute rotate-45 border-t-2 border-l-2 ${isCompact ? '-top-[7px] w-3 h-3' : '-top-2.5 w-4 h-4'}`}
            style={{
              backgroundColor: cardSurface.beakTopBg,
              borderColor: cardSurface.borderColor,
              left: beakLeft
            }}
          />
        )}
        {pointerPlacement === 'bottom' && (
          <div
            className={`absolute rotate-45 border-b-2 border-r-2 ${isCompact ? '-bottom-[7px] w-3 h-3' : '-bottom-2.5 w-4 h-4'}`}
            style={{
              backgroundColor: cardSurface.beakBottomBg,
              borderColor: cardSurface.borderColor,
              left: beakLeft
            }}
          />
        )}

        {/* Top Accent Bar */}
        <div
          className={`absolute top-0 rounded-b-full opacity-90 pointer-events-none ${isCompact ? 'inset-x-8 h-[3px]' : 'inset-x-10 h-1'}`}
          style={{
            backgroundColor: currentAccent,
            backgroundImage: 'none'
          }}
        />

        {/* Scrollable Content Container */}
        <div className={`flex-1 min-h-0 overflow-y-auto hide-scrollbar pe-0.5 ${isCompact ? 'mb-2' : 'mb-2.5'}`}>
          {/* Header: Step Icon, Badge & Close Button */}
          <div className={`flex items-center justify-between ${isCompact ? 'gap-1.5 mb-2' : 'gap-2 mb-2.5'}`}>
            <div className={`flex items-center min-w-0 ${isCompact ? 'gap-1.5' : 'gap-2'}`}>
              <div
                className={`flex items-center justify-center font-bold shrink-0 ${
                  isCompact ? 'w-7 h-7 rounded-[11px]' : 'w-9 h-9 rounded-2xl'
                }`}
                style={{
                  backgroundColor: cardSurface.solidFillBg,
                  backgroundImage: 'none',
                  color: '#ffffff',
                  border: `1px solid ${cardSurface.solidFillBorder}`,
                  boxShadow: 'none'
                }}
              >
                {renderStepIcon(step.iconType, isCompact ? 14 : 18, true)}
              </div>

              <span
                className={`font-extrabold rounded-full uppercase tracking-wider truncate ${
                  isCompact
                    ? 'text-[9px] px-2 py-[1px] max-w-[144px]'
                    : 'text-[11px] px-2.5 py-0.5 max-w-[180px]'
                }`}
                style={{
                  backgroundColor: cardSurface.badgeBg,
                  color: cardSurface.badgeText,
                  border: `1px solid ${cardSurface.badgeBorder}`,
                  boxShadow: 'none'
                }}
              >
                {isEn
                  ? (step.badgeEn || `Step ${currentStepIndex + 1} of ${steps.length}`)
                  : (step.badgeAr || `خطوة ${currentStepIndex + 1} من ${steps.length}`)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className={`rounded-full flex items-center justify-center hover:text-red-500 cursor-pointer shrink-0 ${
                isCompact ? 'w-[26px] h-[26px]' : 'w-8 h-8'
              }`}
              style={{
                background: cardSurface.pillBg,
                color: cardSurface.pillText,
                border: `1.5px solid ${cardSurface.pillBorder}`,
                boxShadow: 'none'
              }}
              title={isEn ? "Skip Tour" : "تخطي الإرشاد"}
            >
              <X size={isCompact ? 12 : 15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Step Title */}
          <h3 className={`font-black font-cairo flex items-center leading-snug ${
            isCompact ? 'text-[13px] sm:text-[14.5px] mb-1 gap-1' : 'text-base sm:text-lg mb-1.5 gap-1.5'
          }`}>
            <span style={{ color: cardSurface.titleColor }}>
              {isEn ? step.titleEn : step.titleAr}
            </span>
          </h3>

          {/* Detailed Explanation */}
          <p
            className={`font-medium whitespace-pre-line ${isCompact ? 'text-[10px] sm:text-[11.5px] leading-[1.55]' : 'text-xs sm:text-sm leading-relaxed'}`}
            style={{ color: cardSurface.descText }}
          >
            {isEn ? step.descEn : step.descAr}
          </p>
        </div>

        {/* Bottom Actions: Progress Dots & Next/Prev */}
        <div
          className={`flex items-center justify-between shrink-0 mt-auto w-full min-w-0 ${
            isCompact ? 'gap-1.5 pt-2' : 'gap-2 pt-2.5'
          }`}
          style={{ borderTop: `1px solid ${cardSurface.divider}` }}
        >
          {/* Progress Dots or Compact Step Indicator */}
          {steps.length <= 6 ? (
            <div className={`flex items-center shrink-0 overflow-hidden ${isCompact ? 'gap-1' : 'gap-1.5'}`}>
              {steps.map((_, idx) => (
                <span
                  key={idx}
                  className={`rounded-full transition-all duration-300 shrink-0 ${isCompact ? 'h-[5px]' : 'h-1.5'}`}
                  style={{
                    width: idx === currentStepIndex ? (isCompact ? '13px' : '16px') : (isCompact ? '4px' : '5px'),
                    backgroundColor: idx === currentStepIndex ? currentAccent : cardSurface.dotInactive
                  }}
                />
              ))}
            </div>
          ) : (
            <div className={`flex items-center shrink min-w-0 overflow-hidden ${isCompact ? 'gap-1' : 'gap-1.5'}`}>
              <span
                className={`font-black rounded-lg whitespace-nowrap shrink-0 ${
                  isCompact ? 'text-[9px] px-1.5 py-[1px]' : 'text-[11px] px-2 py-0.5'
                }`}
                style={{
                  background: cardSurface.pillBg,
                  color: cardSurface.pillText,
                  border: `1px solid ${cardSurface.pillBorder}`,
                  boxShadow: 'none'
                }}
              >
                <span style={{ color: isDarkCard && !isMadinah ? currentAccent : cardSurface.pillText }}>{currentStepIndex + 1}</span>
                <span className="opacity-45 mx-0.5">/</span>
                <span>{steps.length}</span>
              </span>
              <div className={`flex items-center shrink-0 overflow-hidden ${isCompact ? 'gap-0.5' : 'gap-1'}`}>
                {(() => {
                  const total = steps.length;
                  let startIdx = Math.max(0, currentStepIndex - 2);
                  let endIdx = Math.min(total, startIdx + 5);
                  if (endIdx - startIdx < 5) {
                    startIdx = Math.max(0, endIdx - 5);
                  }
                  return steps.slice(startIdx, endIdx).map((_, i) => {
                    const actualIdx = startIdx + i;
                    return (
                      <span
                        key={actualIdx}
                        className={`rounded-full transition-all duration-300 shrink-0 ${isCompact ? 'h-[5px]' : 'h-1.5'}`}
                        style={{
                          width: actualIdx === currentStepIndex ? (isCompact ? '11px' : '14px') : (isCompact ? '3px' : '4px'),
                          backgroundColor: actualIdx === currentStepIndex ? currentAccent : cardSurface.dotInactive
                        }}
                      />
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`flex items-center shrink-0 ms-auto ${isCompact ? 'gap-1.5' : 'gap-2'}`}>
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className={`font-bold flex items-center cursor-pointer shrink-0 ${
                  isCompact ? 'px-2.5 py-1 rounded-[10px] text-[10px] gap-0.5' : 'px-3 py-1.5 rounded-xl text-xs gap-1'
                }`}
                style={{
                  background: cardSurface.pillBg,
                  color: cardSurface.pillText,
                  border: `1.5px solid ${cardSurface.pillBorder}`,
                  boxShadow: 'none'
                }}
              >
                {isEn ? <ChevronLeft size={isCompact ? 11 : 14} /> : <ChevronRight size={isCompact ? 11 : 14} />}
                <span>{isEn ? 'Back' : 'السابق'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`font-black flex items-center cursor-pointer shrink-0 relative z-10 whitespace-nowrap ${
                isCompact ? 'px-2.5 py-1 rounded-[10px] text-[10px] gap-1' : 'px-3.5 py-1.5 rounded-xl text-xs gap-1.5'
              }`}
              style={{
                backgroundColor: cardSurface.solidFillBg,
                backgroundImage: 'none',
                color: '#ffffff',
                border: `1px solid ${cardSurface.solidFillBorder}`,
                boxShadow: 'none'
              }}
            >
              <span>
                {isLastStep
                  ? (isEn ? 'Got it 👍' : 'فهمت ذلك 👍')
                  : (isEn ? 'Next' : 'التالي')}
              </span>
              {!isLastStep ? (
                isEn ? <ChevronRight size={isCompact ? 11 : 14} /> : <ChevronLeft size={isCompact ? 11 : 14} />
              ) : (
                <Check size={isCompact ? 11 : 14} className="stroke-[3]" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

