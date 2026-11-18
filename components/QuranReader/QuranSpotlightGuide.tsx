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

interface QuranSpotlightGuideProps {
  guideKey: string;
  steps: QuranGuideStep[];
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
  onStepChange?: (stepIndex: number, step: QuranGuideStep) => void;
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
      'sidebar_menu',
      'surah_juz_modal',
      'surah_juz_modal_v2',
      'bookmarks_modal',
      'ayah_action_menu'
    ];
    keys.forEach(k => localStorage.removeItem(`quran_guide_seen_${k}`));
  } catch (e) {}
};

const renderStepIcon = (type?: string, accentColor?: string) => {
  const iconProps = { size: 18, className: "text-white drop-shadow-sm" };
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
}) => {
  const { isNightMode, homeThemeVariant, themeKey } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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
            step.id === 'verse_num_bracket';

          if (isSingleTargetStep) {
            let chosen = visibleElements[0];
            
            // Dynamically select the best element on the current visible page
            const inViewport = visibleElements.filter(el => {
              const r = el.getBoundingClientRect();
              return r.top >= -20 && r.bottom <= window.innerHeight + 50;
            });
            if (inViewport.length > 0) {
              chosen = inViewport[0];
            }

            const rawRect = chosen.getBoundingClientRect();
            if (rawRect.width > 0 && rawRect.height > 0) {
              // For verse number brackets, apply full child union and generous padding so the spotlight circle frames the ornamental brackets ﴿ ﴾ and verse number cleanly without clipping
              if (step.id === 'verse_num_bracket' || chosen.classList.contains('verse-container')) {
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
    } catch (e) {}

    setTargetRect(null);
  }, [step]);

  // Smoothly scroll the container or window to bring the target element into view
  const scrollToTarget = useCallback((chosen: HTMLElement) => {
    try {
      const scrollParent = findScrollParent(chosen);
      if (scrollParent) {
        const isSidebarGuide = guideKey.startsWith('sidebar_menu') || scrollParent.id === 'floating-menu-scroll-container';

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
          return r.top >= -20 && r.bottom <= window.innerHeight + 50;
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

  // Compute position for tooltip card
  let cardPositionStyle: React.CSSProperties = {};
  let pointerPlacement: 'top' | 'bottom' | 'center' = 'center';

  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 700;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 380;
  const cardWidth = Math.min(380, screenWidth - 28);
  const margin = 14;
  const cardHeight = cardRef.current?.offsetHeight || 240;

  let beakLeft = Math.round(cardWidth / 2 - 8);

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const spaceBelow = screenHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const isTargetVeryLarge = targetRect.height > screenHeight * 0.45;

    const computedLeft = Math.max(14, Math.min(screenWidth - cardWidth - 14, Math.round(targetCenterX - cardWidth / 2)));
    beakLeft = Math.max(20, Math.min(cardWidth - 28, Math.round(targetCenterX - computedLeft - 8)));

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

  const currentAccent = step.accentColor || '#10b981';
  const isDarkCard = isNightMode || themeKey === 'deep_black' || themeKey === 'black_gold';

  const cardSurface = (() => {
    if (isDarkCard) {
      return {
        bg: 'linear-gradient(168deg, #252530 0%, #15151e 100%)',
        beakTopBg: '#24242f',
        beakBottomBg: '#16161f',
        lip: '#07070b',
        outerShadow: '0 22px 48px rgba(0, 0, 0, 0.85)',
        inset: 'rgba(255, 255, 255, 0.16)',
        text: '#ffffff',
        descText: '#e4e4e7',
        divider: 'rgba(255, 255, 255, 0.12)',
        dotInactive: 'rgba(255, 255, 255, 0.28)',
        pillBg: 'linear-gradient(180deg, #32323e 0%, #24242e 100%)',
        pillLip: '#09090d',
        pillText: '#e4e4e7',
        pillBorder: 'rgba(255, 255, 255, 0.16)',
      };
    }
    const tintBottom =
      homeThemeVariant === 'sky' ? '#eff8ff' :
      homeThemeVariant === 'emerald' ? '#ecfdf5' :
      homeThemeVariant === 'burgundy' ? '#fff1f2' :
      '#fffbeb';
    return {
      bg: `linear-gradient(180deg, #ffffff 0%, ${tintBottom} 100%)`,
      beakTopBg: '#ffffff',
      beakBottomBg: tintBottom,
      lip: `${currentAccent}55`,
      outerShadow: '0 22px 44px rgba(15, 23, 42, 0.30)',
      inset: 'rgba(255, 255, 255, 0.98)',
      text: '#0f172a',
      descText: '#334155',
      divider: 'rgba(15, 23, 42, 0.10)',
      dotInactive: 'rgba(15, 23, 42, 0.18)',
      pillBg: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
      pillLip: 'rgba(15, 23, 42, 0.18)',
      pillText: '#1e293b',
      pillBorder: 'rgba(15, 23, 42, 0.14)',
    };
  })();

  return (
    <div
      id="quran-spotlight-guide-root"
      className="quran-spotlight-guide fixed inset-0 z-[100000] pointer-events-none select-none font-sans"
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {/* Subtle, crystal-clear dismiss backdrop with spotlight mask cutout */}
      {targetRect ? (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-300"
          onClick={handleSkip}
        >
          <defs>
            <mask id={`spotlight-mask-${step.id}`}>
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={Math.max(0, targetRect.left - 4)}
                y={Math.max(0, targetRect.top - 4)}
                width={targetRect.width + 8}
                height={targetRect.height + 8}
                rx="16"
                ry="16"
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
          className="absolute inset-0 bg-black/55 pointer-events-auto"
          onClick={handleSkip}
        />
      )}

      {/* Target Element Luminous Spotlight Highlight Frame */}
      {targetRect && (
        <motion.div
          key={`spotlight-${step.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-none rounded-2xl transition-all duration-300"
          style={{
            top: Math.max(0, targetRect.top - 4),
            left: Math.max(0, targetRect.left - 4),
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: `0 0 0 3px ${currentAccent}, 0 0 28px ${currentAccent}80, inset 0 0 14px ${currentAccent}25`,
            border: `2px solid ${currentAccent}`,
            zIndex: 100001
          }}
        >
          {/* Pulsing corner beacons */}
          <span
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full animate-ping"
            style={{ backgroundColor: currentAccent }}
          />
          <span
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full shadow-md"
            style={{ backgroundColor: currentAccent }}
          />
          <span
            className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full animate-ping"
            style={{ backgroundColor: currentAccent }}
          />
          <span
            className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full shadow-md"
            style={{ backgroundColor: currentAccent }}
          />
        </motion.div>
      )}

      {/* Floating Tooltip Card — Unified 3D Elevated Style */}
      <motion.div
        key={`card-${step.id}`}
        ref={cardRef}
        data-guide-card="true"
        initial={{ opacity: 0, scale: 0.93, y: pointerPlacement === 'top' ? -12 : (pointerPlacement === 'bottom' ? 12 : 0) }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed z-[100002] pointer-events-auto rounded-3xl p-4 sm:p-5 flex flex-col border-2 overflow-visible box-border max-w-[calc(100vw-28px)]"
        style={{
          ...cardPositionStyle,
          background: cardSurface.bg,
          color: cardSurface.text,
          borderColor: currentAccent,
          boxShadow: `0 7px 0 ${cardSurface.lip}, ${cardSurface.outerShadow}, inset 0 2px 2px ${cardSurface.inset}`
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
            className="absolute -top-2.5 w-4 h-4 rotate-45 border-t-2 border-l-2"
            style={{
              backgroundColor: cardSurface.beakTopBg,
              borderColor: currentAccent,
              left: beakLeft
            }}
          />
        )}
        {pointerPlacement === 'bottom' && (
          <div
            className="absolute -bottom-2.5 w-4 h-4 rotate-45 border-b-2 border-r-2"
            style={{
              backgroundColor: cardSurface.beakBottomBg,
              borderColor: currentAccent,
              left: beakLeft
            }}
          />
        )}

        {/* Top Accent Bevel Bar */}
        <div
          className="absolute top-0 inset-x-10 h-1 rounded-b-full opacity-90 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, ${currentAccent}, #ffffff, ${currentAccent})`
          }}
        />

        {/* Scrollable Content Container */}
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar mb-2.5 pe-0.5">
          {/* Header: Step Icon, Badge & Close Button */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold shrink-0"
                style={{
                  backgroundColor: currentAccent,
                  backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(0,0,0,0.12) 100%)',
                  color: '#ffffff',
                  boxShadow: `0 3.5px 0 rgba(0,0,0,0.28), 0 6px 12px ${currentAccent}45, inset 0 1.5px 1px rgba(255,255,255,0.45)`
                }}
              >
                {renderStepIcon(step.iconType, currentAccent)}
              </div>

              <span
                className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider truncate max-w-[180px]"
                style={{
                  backgroundColor: isDarkCard ? `${currentAccent}28` : `${currentAccent}1a`,
                  color: isDarkCard ? '#f8fafc' : '#0f172a',
                  border: `1px solid ${currentAccent}55`,
                  boxShadow: `0 2px 0 ${currentAccent}30, inset 0 1px 1px rgba(255,255,255,${isDarkCard ? '0.15' : '0.6'})`
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
              className="unified-3d-btn w-8 h-8 rounded-full flex items-center justify-center hover:text-red-500 cursor-pointer shrink-0"
              style={{
                background: cardSurface.pillBg,
                color: cardSurface.pillText,
                border: `1px solid ${cardSurface.pillBorder}`,
                boxShadow: `0 2.5px 0 ${cardSurface.pillLip}, 0 4px 8px rgba(0,0,0,0.14), inset 0 1px 1px ${cardSurface.inset}`
              }}
              title={isEn ? "Skip Tour" : "تخطي الإرشاد"}
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Step Title */}
          <h3 className="text-base sm:text-lg font-black font-cairo mb-1.5 flex items-center gap-1.5 leading-snug">
            <span style={{ color: isDarkCard ? currentAccent : '#0f172a' }}>
              {isEn ? step.titleEn : step.titleAr}
            </span>
          </h3>

          {/* Detailed Explanation */}
          <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: cardSurface.descText }}>
            {isEn ? step.descEn : step.descAr}
          </p>
        </div>

        {/* Bottom Actions: Progress Dots & Next/Prev */}
        <div
          className="flex items-center justify-between gap-2 pt-2.5 shrink-0 mt-auto w-full min-w-0"
          style={{ borderTop: `1px solid ${cardSurface.divider}` }}
        >
          {/* Progress Dots or Compact Step Indicator */}
          {steps.length <= 6 ? (
            <div className="flex items-center gap-1.5 shrink-0 overflow-hidden">
              {steps.map((_, idx) => (
                <span
                  key={idx}
                  className="h-1.5 rounded-full transition-all duration-300 shrink-0"
                  style={{
                    width: idx === currentStepIndex ? '16px' : '5px',
                    backgroundColor: idx === currentStepIndex ? currentAccent : cardSurface.dotInactive
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink min-w-0 overflow-hidden">
              <span
                className="text-[11px] font-black px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0"
                style={{
                  background: cardSurface.pillBg,
                  color: cardSurface.pillText,
                  border: `1px solid ${cardSurface.pillBorder}`,
                  boxShadow: `0 2px 0 ${cardSurface.pillLip}, inset 0 1px 1px ${cardSurface.inset}`
                }}
              >
                <span style={{ color: isDarkCard ? currentAccent : cardSurface.pillText }}>{currentStepIndex + 1}</span>
                <span className="opacity-45 mx-0.5">/</span>
                <span>{steps.length}</span>
              </span>
              <div className="flex items-center gap-1 shrink-0 overflow-hidden">
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
                        className="h-1.5 rounded-full transition-all duration-300 shrink-0"
                        style={{
                          width: actualIdx === currentStepIndex ? '14px' : '4px',
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
          <div className="flex items-center gap-2 shrink-0 ms-auto">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="unified-3d-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                style={{
                  background: cardSurface.pillBg,
                  color: cardSurface.pillText,
                  border: `1px solid ${cardSurface.pillBorder}`,
                  boxShadow: `0 3px 0 ${cardSurface.pillLip}, 0 5px 10px rgba(0,0,0,0.14), inset 0 1.5px 1px ${cardSurface.inset}`
                }}
              >
                {isEn ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                <span>{isEn ? 'Back' : 'السابق'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="unified-3d-btn px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 relative z-10 whitespace-nowrap"
              style={{
                backgroundColor: currentAccent,
                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(0,0,0,0.08) 100%)',
                color: '#ffffff',
                boxShadow: `0 4px 0 rgba(0,0,0,0.32), 0 8px 16px -2px ${currentAccent}55, inset 0 1.5px 1px rgba(255,255,255,0.45)`
              }}
            >
              <span>
                {isLastStep
                  ? (isEn ? 'Got it 👍' : 'فهمت ذلك 👍')
                  : (isEn ? 'Next' : 'التالي')}
              </span>
              {!isLastStep ? (
                isEn ? <ChevronRight size={14} /> : <ChevronLeft size={14} />
              ) : (
                <Check size={14} className="stroke-[3]" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
