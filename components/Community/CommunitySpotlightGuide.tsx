import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  MessageSquare,
  Users,
  BookOpen,
  Mic,
  Paperclip,
  Smile,
  Clock,
  Bell,
  Calendar,
  Volume2,
  Settings,
  MapPin,
  Moon,
  FileText,
  Share2,
  Sliders,
  Compass,
  LayoutGrid,
  Cloud
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useShowPageGuides } from '../../utils/guideManager';

export interface SpotlightStep {
  id: string;
  targetSelector?: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr?: string;
  badgeEn?: string;
  iconName?: 'lang' | 'tab' | 'user' | 'country' | 'lock' | 'action' | 'nav' | 'profile' | 'quran' | 'search' | 'group' | 'block' | 'chat' | 'verse' | 'attach' | 'emoji' | 'text' | 'voice' | 'clock' | 'bell' | 'calendar' | 'volume' | 'gear' | 'map' | 'moon' | 'file' | 'share' | 'slider' | 'compass' | 'widgets' | 'sparkles' | 'cloud';
  accentColor: string; // e.g. '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'
  gradient: string; // e.g. 'from-sky-500 to-blue-600'
  preferredPlacement?: 'top' | 'bottom' | 'center';
}

interface CommunitySpotlightGuideProps {
  guideKey: string;
  steps: SpotlightStep[];
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
  onStepChange?: (index: number) => void;
}

export const getGuideSeen = (_key: string): boolean => {
  return true; // Guides never open automatically on first launch; they only work when pressing the guide button
};

export const setGuideSeen = (key: string): void => {
  try {
    localStorage.setItem(`guide_seen_${key}`, 'true');
  } catch (e) {}
};

export const resetCommunityGuides = (): void => {
  try {
    const keys = [
      'onboarding_register',
      'onboarding_restore',
      'community_header',
      'tab_chats',
      'tab_community',
      'tab_users',
      'tab_blocked',
      'chat_room',
      'group_chat_room',
      'memorization_setup_tour',
      'memorization_review_tour',
      'ruqyah_page_spotlight',
      'hijri_calendar_page_spotlight',
      'hajj_umrah_page_spotlight',
      'tasbeeh_page_spotlight',
      'prophetic_seerah_page_spotlight',
      'prayer_times_page_spotlight',
      'prayer_times_page_spotlight_v2',
      'monthly_prayer_times_spotlight',
      'prayer_settings_modal_spotlight',
      'daily_wird_progress_tour',
      'daily_wird_settings_tour',
      'listen_quran_page_spotlight',
      'calc_tab_zakat_spotlight',
      'calc_tab_mawarith_spotlight',
      'calc_tab_kaffarat_spotlight',
      'calc_subtab_fitr_spotlight',
      'calc_subtab_udhiyah_spotlight',
      'calc_tab_fitr_udhiyah_spotlight',
      'calc_tab_fitr-udhiyah_spotlight',
      'calculator_page_spotlight',
      'worship_mentor_page_spotlight',
      'custom_habit_modal_spotlight',
      'smart_home_page_spotlight'
    ];
    keys.forEach(k => localStorage.removeItem(`guide_seen_${k}`));
  } catch (e) {}
};

const renderStepIcon = (iconName: string | undefined, color: string, iconSize: number = 16) => {
  const emojiClass = iconSize <= 13 ? 'text-[13px] leading-none select-none' : 'text-base select-none';
  switch (iconName) {
    case 'lang':
      return <span className={`font-bold select-none ${iconSize <= 13 ? 'text-[10px]' : 'text-xs'}`}>ع/En</span>;
    case 'tab':
      return <Users size={iconSize} />;
    case 'user':
      return <span className={emojiClass}>👤</span>;
    case 'country':
      return <span className={emojiClass}>🌍</span>;
    case 'lock':
      return <span className={emojiClass}>🔐</span>;
    case 'action':
      return <Check size={iconSize} className="stroke-[3]" />;
    case 'nav':
      return <span className={emojiClass}>🧭</span>;
    case 'profile':
      return <span className={emojiClass}>✨</span>;
    case 'quran':
      return <BookOpen size={iconSize} />;
    case 'search':
      return <span className={emojiClass}>🔍</span>;
    case 'group':
      return <Users size={iconSize} />;
    case 'block':
      return <span className={emojiClass}>🛡️</span>;
    case 'chat':
      return <MessageSquare size={iconSize} />;
    case 'verse':
      return <BookOpen size={iconSize} />;
    case 'attach':
      return <Paperclip size={iconSize} />;
    case 'emoji':
      return <Smile size={iconSize} />;
    case 'voice':
      return <Mic size={iconSize} />;
    case 'clock':
      return <Clock size={iconSize} />;
    case 'bell':
      return <Bell size={iconSize} />;
    case 'calendar':
      return <Calendar size={iconSize} />;
    case 'volume':
      return <Volume2 size={iconSize} />;
    case 'gear':
      return <Settings size={iconSize} />;
    case 'map':
      return <MapPin size={iconSize} />;
    case 'moon':
      return <Moon size={iconSize} />;
    case 'file':
      return <FileText size={iconSize} />;
    case 'share':
      return <Share2 size={iconSize} />;
    case 'slider':
      return <Sliders size={iconSize} />;
    case 'compass':
      return <Compass size={iconSize} />;
    case 'widgets':
      return <LayoutGrid size={iconSize} />;
    case 'cloud':
      return <Cloud size={iconSize} />;
    default:
      return <Sparkles size={iconSize} />;
  }
};

export const CommunitySpotlightGuide: React.FC<CommunitySpotlightGuideProps> = ({
  guideKey,
  steps,
  isOpen,
  onClose,
  isEn = false,
  onStepChange
}) => {
  const showPageGuides = useShowPageGuides();
  const { language, formatNumber } = useLanguage();
  const { isNightMode, homeThemeVariant, themeKey } = useTheme();
  const effectiveIsEn = isEn || language === 'en';
  const isSingleStep = steps.length === 1;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [measuredCardHeight, setMeasuredCardHeight] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setMeasuredCardHeight(null);
      if (onStepChange) onStepChange(0);
      setGuideSeen(guideKey);
    }
  }, [isOpen, guideKey]);

  const step = steps[currentStepIndex];

  useLayoutEffect(() => {
    if (isOpen && cardRef.current) {
      const h = cardRef.current.offsetHeight;
      if (h > 0 && h !== measuredCardHeight) {
        setMeasuredCardHeight(h);
      }
    }
  }, [isOpen, currentStepIndex, step?.id, isSingleStep, effectiveIsEn]);

  useEffect(() => {
    if (isOpen && step && onStepChange) {
      onStepChange(currentStepIndex);
    }
  }, [isOpen, currentStepIndex, step, onStepChange]);

  // Helper to find scrollable parent container
  const findScrollParent = useCallback((el: HTMLElement): HTMLElement | null => {
    const namedContainer = el.closest('#main-menu-scroll-container, #calc-scroll-container, #memorization-scroll-container, #wird-scroll-container, #chat-messages-container, #direct-chat-messages-container, #prayer-settings-scroll-container, #listen-scroll-container, main, #app-scroll-container') as HTMLElement | null;
    if (namedContainer) return namedContainer;

    let p = el.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      const s = window.getComputedStyle(p);
      const isScrollable = (s.overflowY === 'auto' || s.overflowY === 'scroll');
      if (isScrollable || p.tagName === 'MAIN') {
        return p;
      }
      p = p.parentElement;
    }
    return null;
  }, []);

  // Update target bounding box with crystal clarity & multi-element support
  const updateRect = useCallback(() => {
    if (!step?.targetSelector) {
      setTargetRect(null);
      return;
    }

    try {
      const elements = Array.from(document.querySelectorAll(step.targetSelector)) as HTMLElement[];
      if (elements && elements.length > 0) {
        const visibleElements = elements.filter(el => {
          const r = el.getBoundingClientRect();
          const s = window.getComputedStyle(el);
          return (
            r.width > 0 &&
            r.height > 0 &&
            s.display !== 'none' &&
            s.visibility !== 'hidden' &&
            s.opacity !== '0'
          );
        });

        if (visibleElements.length > 0) {
          let chosen = visibleElements[0];

          // If the step is targeting a community list or section, isolate the representative first card/item
          if (
            (step.id === 'tab_chats_list' ||
             step.id === 'tab_comm_list' ||
             step.id === 'tab_users_actions' ||
             step.id === 'tab_blocked_info') &&
            chosen.children && chosen.children.length > 0
          ) {
            const childCandidates = Array.from(chosen.children) as HTMLElement[];
            const firstValidChild = childCandidates.find(c => {
              const cr = c.getBoundingClientRect();
              return cr.width > 50 && cr.height > 20;
            });
            if (firstValidChild) {
              chosen = firstValidChild;
            }
          }

          if (visibleElements.length === 1 || chosen !== visibleElements[0]) {
            let finalRect = chosen.getBoundingClientRect();
            if (finalRect.width > 0 && finalRect.height > 0) {
              setTargetRect(finalRect);
              return;
            }
          } else {
            // Multi-element target (e.g. tabs or row controls)
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
              setTargetRect(new DOMRect(minLeft, minTop, maxRight - minLeft, Math.max(30, maxBottom - minTop)));
              return;
            }
          }
        }
      }
    } catch (e) {}

    setTargetRect(null);
  }, [step]);

  // Smoothly scroll the container or window to bring the target element into view
  const scrollToTarget = useCallback((chosen: HTMLElement, stepIdx?: number) => {
    try {
      const scrollParent = findScrollParent(chosen);
      if (scrollParent) {
        const effectiveIndex = stepIdx !== undefined ? stepIdx : currentStepIndex;

        // Step 0: Always reset to top smoothly
        if (effectiveIndex === 0) {
          scrollParent.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const containerRect = scrollParent.getBoundingClientRect();
        const elRect = chosen.getBoundingClientRect();
        const currentScroll = scrollParent.scrollTop;
        const relativeTop = elRect.top - containerRect.top;

        // Determine if target should be positioned in upper or lower half of container
        // To leave maximum space for the explanation card without overlapping
        const isNearEnd = effectiveIndex >= Math.max(1, steps.length - 2) && relativeTop > containerRect.height * 0.45;
        
        let desiredRelativeTop: number;
        if (isNearEnd) {
          // Leave space above for card
          desiredRelativeTop = Math.max(60, containerRect.height - elRect.height - 25);
        } else {
          // Leave space below for card: place target near top of container
          if (step.id === 'reg_avatar') {
            const headerEl = scrollParent.querySelector('.app-top-bar, header') as HTMLElement | null;
            const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 56;
            desiredRelativeTop = headerHeight + 14;
          } else {
            desiredRelativeTop = 20;
          }
        }

        const scrollDiff = relativeTop - desiredRelativeTop;
        const targetScroll = Math.max(0, currentScroll + scrollDiff);

        if (Math.abs(scrollDiff) > 6) {
          scrollParent.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
      } else {
        const viewportH = window.innerHeight;
        const elRect = chosen.getBoundingClientRect();
        if (elRect.top < 70 || elRect.bottom > viewportH - 70) {
          try {
            chosen.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          } catch (e) {}
        }
      }
    } catch (e) {}
  }, [findScrollParent, currentStepIndex, steps.length]);

  useEffect(() => {
    if (!isOpen || !step) return;

    // 1. Immediately find the target element and trigger smooth auto-scroll
    try {
      const elements = Array.from(document.querySelectorAll(step.targetSelector || '')) as HTMLElement[];
      const visible = elements.filter(el => {
        const r = el.getBoundingClientRect();
        const s = window.getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
      });
      if (visible.length > 0) {
        let toScroll = visible[0];
        if (
          (step.id === 'tab_chats_list' ||
           step.id === 'tab_comm_list' ||
           step.id === 'tab_users_actions' ||
           step.id === 'tab_blocked_info') &&
          toScroll.children && toScroll.children.length > 0
        ) {
          const childCandidates = Array.from(toScroll.children) as HTMLElement[];
          const firstValidChild = childCandidates.find(c => {
            const cr = c.getBoundingClientRect();
            return cr.width > 50 && cr.height > 20;
          });
          if (firstValidChild) {
            toScroll = firstValidChild;
          }
        }
        scrollToTarget(toScroll, currentStepIndex);
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

    const handleResizeOrScroll = () => {
      updateRect();
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen, step, currentStepIndex, updateRect, scrollToTarget]);

  if (!showPageGuides || !isOpen || !step) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setGuideSeen(guideKey);
      onClose();
    } else {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (onStepChange) onStepChange(nextIdx);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (onStepChange) onStepChange(prevIdx);
    }
  };

  const handleSkip = () => {
    setGuideSeen(guideKey);
    onClose();
  };

  // Compute position for tooltip card
  let cardPositionStyle: React.CSSProperties = {};
  let pointerPlacement: 'top' | 'bottom' | 'center' = 'center';

  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 700;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 380;
  const sizeScale = isSingleStep ? 0.8 : 1;
  const cardWidth = Math.round(Math.min(380, screenWidth - 28) * sizeScale);
  const margin = isSingleStep ? 12 : 14;
  const fallbackCardHeight = isSingleStep ? 192 : 240;
  const cardHeight = cardRef.current?.offsetHeight || measuredCardHeight || fallbackCardHeight;

  let beakLeft = Math.round(cardWidth / 2 - (isSingleStep ? 6 : 8));

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const spaceBelow = screenHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const isTargetVeryLarge = targetRect.height > screenHeight * 0.40;

    const computedLeft = Math.max(14, Math.min(screenWidth - cardWidth - 14, Math.round(targetCenterX - cardWidth / 2)));
    beakLeft = Math.max(18, Math.min(cardWidth - 24, Math.round(targetCenterX - computedLeft - (isSingleStep ? 6 : 8))));

    const minCardMaxHeight = isSingleStep
      ? Math.max(176, Math.min(336, screenHeight - 80))
      : Math.max(220, Math.min(420, screenHeight - 100));

    // Smart placement: center the card when target is very large, center is requested, or space is cramped
    const neededTooltipSpace = isSingleStep ? Math.max(176, cardHeight + margin) : Math.max(220, cardHeight + margin);
    const spaceThreshold = isSingleStep ? 160 : 200;
    const minSubHeight = isSingleStep ? 144 : 180;

    if (step.preferredPlacement === 'center' || isTargetVeryLarge) {
      pointerPlacement = 'center';
      const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidth) / 2));
      const centeredTop = Math.max(24, Math.round((screenHeight - cardHeight) / 2));
      cardPositionStyle = {
        top: centeredTop,
        left: centeredLeft,
        width: cardWidth,
        maxHeight: minCardMaxHeight
      };
    } else if (step.preferredPlacement === 'top' && spaceAbove >= spaceThreshold) {
      // Requested top and has ample room above — anchor by bottom so card never overlaps target
      pointerPlacement = 'bottom';
      cardPositionStyle = {
        bottom: Math.max(16, screenHeight - targetRect.top + margin),
        left: computedLeft,
        width: cardWidth,
        maxHeight: Math.max(minSubHeight, targetRect.top - margin - 20)
      };
    } else if (spaceBelow >= neededTooltipSpace || (spaceBelow >= spaceThreshold && spaceBelow >= spaceAbove) || targetRect.top <= 160) {
      // Target is near top of screen or has ample room below: place cleanly below target
      pointerPlacement = 'top';
      cardPositionStyle = {
        top: Math.max(16, targetRect.bottom + margin),
        left: computedLeft,
        width: cardWidth,
        maxHeight: Math.max(minSubHeight, screenHeight - targetRect.bottom - margin - 16)
      };
    } else if (spaceAbove >= spaceThreshold) {
      // Ample space above: anchor bottom edge cleanly above targetRect.top
      pointerPlacement = 'bottom';
      cardPositionStyle = {
        bottom: Math.max(16, screenHeight - targetRect.top + margin),
        left: computedLeft,
        width: cardWidth,
        maxHeight: Math.max(minSubHeight, targetRect.top - margin - 20)
      };
    } else if (spaceBelow >= (isSingleStep ? 136 : 170)) {
      // Tight space fallback preferring below without shifting up over target
      pointerPlacement = 'top';
      cardPositionStyle = {
        top: Math.max(16, targetRect.bottom + margin),
        left: computedLeft,
        width: cardWidth,
        maxHeight: Math.max(isSingleStep ? 128 : 160, screenHeight - targetRect.bottom - margin - 16)
      };
    } else {
      // Safe fallback: center on screen
      pointerPlacement = 'center';
      const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidth) / 2));
      const centeredTop = Math.max(24, Math.round((screenHeight - cardHeight) / 2));
      cardPositionStyle = {
        top: centeredTop,
        left: centeredLeft,
        width: cardWidth,
        maxHeight: minCardMaxHeight
      };
    }
  } else {
    // Center of screen when no specific target is supplied
    pointerPlacement = 'center';
    const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidth) / 2));
    const centeredTop = Math.max(24, Math.round((screenHeight - cardHeight) / 2));
    cardPositionStyle = {
      top: centeredTop,
      left: centeredLeft,
      width: cardWidth,
      maxHeight: isSingleStep
        ? Math.max(192, Math.round((screenHeight - 48) * 0.8))
        : Math.max(240, screenHeight - 48)
    };
  }

  // Dynamic theme accent color adaptation according to active theme
  const isDarkCard = isNightMode || themeKey === 'deep_black' || themeKey === 'black_gold';
  let themeAccent = step?.accentColor;
  if (isDarkCard) {
    themeAccent = '#F59E0B'; // Amber Gold for Night Mode
  } else if (homeThemeVariant === 'sky') {
    themeAccent = '#0284C7'; // Sky Blue
  } else if (homeThemeVariant === 'emerald') {
    themeAccent = '#059669'; // Emerald Green
  } else if (homeThemeVariant === 'burgundy') {
    themeAccent = '#E11D48'; // Burgundy Rose
  } else if (homeThemeVariant === 'gold') {
    themeAccent = '#D97706'; // Golden Amber
  }

  const currentAccent = themeAccent || step?.accentColor || '#10b981';

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

  const guideContent = (
    <div 
      id="community-spotlight-guide-root"
      className="community-spotlight-guide fixed inset-0 z-[100001] pointer-events-none select-none font-sans"
      dir={effectiveIsEn ? 'ltr' : 'rtl'}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Subtle, crystal-clear dismiss backdrop with SVG spotlight mask cutout matching Quran page */}
      {targetRect ? (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-300"
          onClick={(e) => { e.stopPropagation(); handleSkip(); }}
        >
          <defs>
            <mask id={`community-spotlight-mask-${step.id}`}>
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={Math.max(0, targetRect.left - 6)}
                y={Math.max(0, targetRect.top - 6)}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="18"
                ry="18"
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
            mask={`url(#community-spotlight-mask-${step.id})`}
          />
        </svg>
      ) : (
        <div 
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={(e) => { e.stopPropagation(); handleSkip(); }}
        />
      )}

      {/* Target Element Luminous Spotlight Highlight Frame - Crisp & 100% Clear with zero dimming */}
      {targetRect && (
        <div
          key={`spotlight-${step.id}`}
          className="absolute pointer-events-none rounded-2xl"
          style={{
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: `0 0 0 3px ${currentAccent}, 0 0 32px ${currentAccent}80`,
            border: `2px solid ${currentAccent}`,
            zIndex: 100002
          }}
        >
          {/* Pulsing corner beacons for high visibility */}
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
        </div>
      )}

      {/* Floating Tooltip Card — Unified 3D Elevated Style */}
      <div
        key={`card-${step.id}`}
        ref={cardRef}
        data-guide-card="true"
        className={`fixed z-[100003] pointer-events-auto border-2 flex flex-col overflow-visible box-border max-w-[calc(100vw-28px)] ${
          isSingleStep ? 'rounded-[20px] p-3 sm:p-4' : 'rounded-3xl p-4 sm:p-5'
        }`}
        style={{
          ...cardPositionStyle,
          background: cardSurface.bg,
          color: cardSurface.text,
          borderColor: currentAccent,
          boxShadow: `0 ${isSingleStep ? '5.5px' : '7px'} 0 ${cardSurface.lip}, ${cardSurface.outerShadow}, inset 0 2px 2px ${cardSurface.inset}`
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Pointer Beak pointing dynamically toward highlighted target */}
        {pointerPlacement === 'top' && (
          <div 
            className={`absolute rotate-45 border-t-2 border-l-2 ${
              isSingleStep ? '-top-[7px] w-3 h-3' : '-top-2.5 w-4 h-4'
            }`}
            style={{
              backgroundColor: cardSurface.beakTopBg,
              borderColor: currentAccent,
              left: beakLeft
            }}
          />
        )}
        {pointerPlacement === 'bottom' && (
          <div 
            className={`absolute rotate-45 border-b-2 border-r-2 ${
              isSingleStep ? '-bottom-[7px] w-3 h-3' : '-bottom-2.5 w-4 h-4'
            }`}
            style={{
              backgroundColor: cardSurface.beakBottomBg,
              borderColor: currentAccent,
              left: beakLeft
            }}
          />
        )}

        {/* Top Accent Bevel Bar */}
        <div 
          className={`absolute top-0 rounded-b-full opacity-90 pointer-events-none ${
            isSingleStep ? 'inset-x-8 h-[3px]' : 'inset-x-10 h-1'
          }`}
          style={{
            backgroundImage: `linear-gradient(to right, ${currentAccent}, #ffffff, ${currentAccent})`
          }}
        />

        {/* Scrollable Content Container */}
        <div className={`flex-1 min-h-0 overflow-y-auto hide-scrollbar pe-0.5 ${isSingleStep ? 'mb-2' : 'mb-2.5'}`}>
          {/* Top Header: Badge, Step counter, Close / Skip */}
          <div className={`flex items-center justify-between ${isSingleStep ? 'gap-1.5 mb-2' : 'gap-2 mb-2.5'}`}>
            <div className={`flex items-center min-w-0 ${isSingleStep ? 'gap-1.5' : 'gap-2'}`}>
              {/* Step Icon inside 3D pedestal */}
              <div 
                className={`flex items-center justify-center font-bold flex-shrink-0 ${
                  isSingleStep ? 'w-7 h-7 rounded-xl' : 'w-9 h-9 rounded-2xl'
                }`}
                style={{
                  backgroundColor: currentAccent,
                  backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(0,0,0,0.12) 100%)',
                  color: '#ffffff',
                  boxShadow: `0 ${isSingleStep ? '2.5px' : '3.5px'} 0 rgba(0,0,0,0.28), 0 6px 12px ${currentAccent}45, inset 0 1.5px 1px rgba(255,255,255,0.45)`
                }}
              >
                {renderStepIcon(step.iconName, currentAccent, isSingleStep ? 13 : 16)}
              </div>

              {/* Step Tag */}
              <span 
                className={`font-extrabold rounded-full uppercase tracking-wider truncate ${
                  isSingleStep
                    ? 'text-[9.5px] px-2 py-0.5 max-w-[145px]'
                    : 'text-[11px] px-2.5 py-0.5 max-w-[180px]'
                }`}
                style={{
                  backgroundColor: isDarkCard ? `${currentAccent}28` : `${currentAccent}1a`,
                  color: isDarkCard ? '#f8fafc' : '#0f172a',
                  border: `1px solid ${currentAccent}55`,
                  boxShadow: `0 2px 0 ${currentAccent}30, inset 0 1px 1px rgba(255,255,255,${isDarkCard ? '0.15' : '0.6'})`
                }}
              >
                {effectiveIsEn 
                  ? (step.badgeEn || `Step ${currentStepIndex + 1} of ${steps.length}`)
                  : (step.badgeAr || `خطوة ${formatNumber(currentStepIndex + 1)} من ${formatNumber(steps.length)}`)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className={`unified-3d-btn rounded-full flex items-center justify-center hover:text-red-500 cursor-pointer shrink-0 ${
                isSingleStep ? 'w-[26px] h-[26px]' : 'w-8 h-8'
              }`}
              style={{
                background: cardSurface.pillBg,
                color: cardSurface.pillText,
                border: `1px solid ${cardSurface.pillBorder}`,
                boxShadow: `0 ${isSingleStep ? '2px' : '2.5px'} 0 ${cardSurface.pillLip}, 0 4px 8px rgba(0,0,0,0.14), inset 0 1px 1px ${cardSurface.inset}`
              }}
              title={effectiveIsEn ? "Skip Tour" : "تخطي الإرشاد"}
            >
              <X size={isSingleStep ? 12 : 15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Title */}
          <h3 className={`font-black font-cairo flex items-center gap-1.5 leading-snug ${
            isSingleStep ? 'text-[13px] sm:text-[14.5px] mb-1' : 'text-base sm:text-lg mb-1.5'
          }`}>
            <span style={{ color: isDarkCard ? currentAccent : '#0f172a' }}>
              {effectiveIsEn ? (step.titleEn || step.titleAr) : step.titleAr}
            </span>
          </h3>

          {/* Detailed Explanation */}
          <p className={`leading-relaxed font-medium whitespace-pre-line ${
            isSingleStep ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
          }`} style={{ color: cardSurface.descText }}>
            {effectiveIsEn ? (step.descEn || formatNumber(step.descAr)) : step.descAr}
          </p>
        </div>

        {/* Bottom Bar: Dots Progress & Action Controls */}
        <div 
          className={`flex items-center justify-between shrink-0 mt-auto w-full min-w-0 ${
            isSingleStep ? 'gap-1.5 pt-2' : 'gap-2 pt-2.5'
          }`}
          style={{ borderTop: `1px solid ${cardSurface.divider}` }}
        >
          {/* Progress Dots or Compact Step Indicator */}
          {steps.length <= 6 ? (
            <div className="flex items-center gap-1.5 shrink-0 overflow-hidden">
              {steps.map((_, idx) => (
                <span
                  key={idx}
                  className={`${isSingleStep ? 'h-1' : 'h-1.5'} rounded-full transition-all duration-300 shrink-0`}
                  style={{
                    width: idx === currentStepIndex ? (isSingleStep ? '13px' : '16px') : (isSingleStep ? '4px' : '5px'),
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
                <span style={{ color: isDarkCard ? currentAccent : cardSurface.pillText }}>{formatNumber(currentStepIndex + 1)}</span>
                <span className="opacity-45 mx-0.5">/</span>
                <span>{formatNumber(steps.length)}</span>
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

          {/* Buttons: Prev & Next */}
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
                {effectiveIsEn ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                <span>{effectiveIsEn ? 'Back' : 'السابق'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`unified-3d-btn font-black flex items-center cursor-pointer shrink-0 relative z-10 whitespace-nowrap ${
                isSingleStep
                  ? 'px-2.5 py-1 rounded-[10px] text-[10.5px] gap-1'
                  : 'px-3.5 py-1.5 rounded-xl text-xs gap-1.5'
              }`}
              style={{
                backgroundColor: currentAccent,
                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(0,0,0,0.08) 100%)',
                color: '#ffffff',
                boxShadow: `0 ${isSingleStep ? '3px' : '4px'} 0 rgba(0,0,0,0.32), 0 8px 16px -2px ${currentAccent}55, inset 0 1.5px 1px rgba(255,255,255,0.45)`
              }}
            >
              <span>
                {isLastStep 
                  ? (effectiveIsEn ? 'Got it 👍' : 'فهمت ذلك 👍') 
                  : (effectiveIsEn ? 'Next' : 'التالي')}
              </span>
              {!isLastStep ? (
                effectiveIsEn ? <ChevronRight size={isSingleStep ? 12 : 14} /> : <ChevronLeft size={isSingleStep ? 12 : 14} />
              ) : (
                <Check size={isSingleStep ? 12 : 14} className="stroke-[3]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(guideContent, document.body) : guideContent;
};
