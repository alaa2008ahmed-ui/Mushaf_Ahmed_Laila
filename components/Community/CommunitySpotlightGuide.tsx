import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ChevronRight, ChevronLeft, Check, X, HelpCircle, 
  Eye, Info, MessageSquare, Users, BookOpen, Send, Mic, Paperclip, Smile,
  Clock, Bell, Calendar, Volume2, Settings, MapPin, Moon, FileText, Share2, Sliders, Compass
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface SpotlightStep {
  id: string;
  targetSelector?: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr?: string;
  badgeEn?: string;
  iconName?: 'lang' | 'tab' | 'user' | 'country' | 'lock' | 'action' | 'nav' | 'profile' | 'quran' | 'search' | 'group' | 'block' | 'chat' | 'verse' | 'attach' | 'emoji' | 'text' | 'voice' | 'clock' | 'bell' | 'calendar' | 'volume' | 'gear' | 'map' | 'moon' | 'file' | 'share' | 'slider' | 'compass';
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

export const getGuideSeen = (key: string): boolean => {
  try {
    return localStorage.getItem(`guide_seen_${key}`) === 'true';
  } catch (e) {
    return false;
  }
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
      'custom_habit_modal_spotlight'
    ];
    keys.forEach(k => localStorage.removeItem(`guide_seen_${k}`));
  } catch (e) {}
};

const renderStepIcon = (iconName: string | undefined, color: string) => {
  switch (iconName) {
    case 'lang':
      return <span className="font-bold text-xs select-none">ع/En</span>;
    case 'tab':
      return <Users size={16} />;
    case 'user':
      return <span className="text-base select-none">👤</span>;
    case 'country':
      return <span className="text-base select-none">🌍</span>;
    case 'lock':
      return <span className="text-base select-none">🔐</span>;
    case 'action':
      return <Check size={16} className="stroke-[3]" />;
    case 'nav':
      return <span className="text-base select-none">🧭</span>;
    case 'profile':
      return <span className="text-base select-none">✨</span>;
    case 'quran':
      return <BookOpen size={16} />;
    case 'search':
      return <span className="text-base select-none">🔍</span>;
    case 'group':
      return <Users size={16} />;
    case 'block':
      return <span className="text-base select-none">🛡️</span>;
    case 'chat':
      return <MessageSquare size={16} />;
    case 'verse':
      return <BookOpen size={16} />;
    case 'attach':
      return <Paperclip size={16} />;
    case 'emoji':
      return <Smile size={16} />;
    case 'voice':
      return <Mic size={16} />;
    case 'clock':
      return <Clock size={16} />;
    case 'bell':
      return <Bell size={16} />;
    case 'calendar':
      return <Calendar size={16} />;
    case 'volume':
      return <Volume2 size={16} />;
    case 'gear':
      return <Settings size={16} />;
    case 'map':
      return <MapPin size={16} />;
    case 'moon':
      return <Moon size={16} />;
    case 'file':
      return <FileText size={16} />;
    case 'share':
      return <Share2 size={16} />;
    case 'slider':
      return <Sliders size={16} />;
    case 'compass':
      return <Compass size={16} />;
    default:
      return <Sparkles size={16} />;
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
  const { language, formatNumber } = useLanguage();
  const effectiveIsEn = isEn || language === 'en';
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      if (onStepChange) onStepChange(0);
      setGuideSeen(guideKey);
    }
  }, [isOpen, guideKey]);

  const step = steps[currentStepIndex];

  useEffect(() => {
    if (isOpen && step && onStepChange) {
      onStepChange(currentStepIndex);
    }
  }, [isOpen, currentStepIndex, step, onStepChange]);

  // Helper to find scrollable parent container
  const findScrollParent = useCallback((el: HTMLElement): HTMLElement | null => {
    const namedContainer = el.closest('#calc-scroll-container, #memorization-scroll-container, #wird-scroll-container, #chat-messages-container, #direct-chat-messages-container, #prayer-settings-scroll-container, #listen-scroll-container, main, #app-scroll-container') as HTMLElement | null;
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

  if (!isOpen || !step) return null;

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
  const cardWidth = Math.min(380, screenWidth - 28);
  const margin = 14;
  const cardHeight = cardRef.current?.offsetHeight || 240;

  let beakLeft = Math.round(cardWidth / 2 - 8);

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const spaceBelow = screenHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const isTargetVeryLarge = targetRect.height > screenHeight * 0.40;

    const computedLeft = Math.max(14, Math.min(screenWidth - cardWidth - 14, Math.round(targetCenterX - cardWidth / 2)));
    beakLeft = Math.max(20, Math.min(cardWidth - 28, Math.round(targetCenterX - computedLeft - 8)));

    // Smart placement: center the card when target is very large, center is requested, or space is cramped
    if (step.preferredPlacement === 'center' || isTargetVeryLarge) {
      pointerPlacement = 'center';
      const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidth) / 2));
      const centeredTop = Math.max(14, Math.round((screenHeight - cardHeight) / 2));
      cardPositionStyle = {
        top: centeredTop,
        left: centeredLeft,
        width: cardWidth,
        maxHeight: Math.max(260, screenHeight - 28)
      };
    } else if (step.preferredPlacement === 'bottom' || step.id === 'group_chat_feed') {
      pointerPlacement = 'top';
      cardPositionStyle = {
        bottom: 80,
        left: computedLeft,
        width: cardWidth,
        maxHeight: Math.min(cardHeight + 40, screenHeight - 140)
      };
    } else if (step.preferredPlacement === 'top') {
      pointerPlacement = 'bottom';
      cardPositionStyle = {
        top: Math.max(14, targetRect.bottom + margin),
        left: computedLeft,
        width: cardWidth,
        maxHeight: Math.min(cardHeight + 40, screenHeight - 140)
      };
    } else if (spaceBelow >= cardHeight + margin + 10) {
      pointerPlacement = 'top';
      cardPositionStyle = {
        top: Math.min(targetRect.bottom + margin, screenHeight - cardHeight - 20),
        left: computedLeft,
        width: cardWidth
      };
    } else if (spaceAbove >= cardHeight + margin + 10) {
      pointerPlacement = 'bottom';
      cardPositionStyle = {
        top: Math.max(12, targetRect.top - cardHeight - margin),
        left: computedLeft,
        width: cardWidth
      };
    } else {
      // If neither spaceBelow nor spaceAbove can fit the card comfortably, center it in the middle of the screen!
      pointerPlacement = 'center';
      const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidth) / 2));
      const centeredTop = Math.max(14, Math.round((screenHeight - cardHeight) / 2));
      cardPositionStyle = {
        top: centeredTop,
        left: centeredLeft,
        width: cardWidth,
        maxHeight: Math.max(260, screenHeight - 28)
      };
    }
  } else {
    // Center of screen when no specific target is supplied
    pointerPlacement = 'center';
    const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidth) / 2));
    const centeredTop = Math.max(14, Math.round((screenHeight - cardHeight) / 2));
    cardPositionStyle = {
      top: centeredTop,
      left: centeredLeft,
      width: cardWidth,
      maxHeight: Math.max(260, screenHeight - 28)
    };
  }

  const currentAccent = step.accentColor || '#10b981';

  return (
    <div 
      id="community-spotlight-guide-root"
      className="community-spotlight-guide fixed inset-0 z-[100001] pointer-events-none select-none font-sans"
      dir={effectiveIsEn ? 'ltr' : 'rtl'}
    >
      {/* Subtle, crystal-clear dismiss backdrop with SVG spotlight mask cutout matching Quran page */}
      {targetRect ? (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-300"
          onClick={handleSkip}
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
          className="absolute inset-0 bg-black/45 backdrop-blur-[1px] pointer-events-auto transition-opacity"
          onClick={handleSkip}
        />
      )}

      {/* Target Element Luminous Spotlight Highlight Frame - Crisp & 100% Clear with zero dimming */}
      {targetRect && (
        <motion.div
          key={`spotlight-${step.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-none rounded-2xl transition-all duration-300"
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
        </motion.div>
      )}

      {/* Floating Tooltip Card */}
      <motion.div
        key={`card-${step.id}`}
        ref={cardRef}
        data-guide-card="true"
        initial={{ opacity: 0, scale: 0.93, y: pointerPlacement === 'top' ? -12 : (pointerPlacement === 'bottom' ? 12 : 0) }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed z-[100003] pointer-events-auto rounded-3xl p-4 sm:p-5 shadow-2xl border-2 flex flex-col bg-slate-900/98 text-white backdrop-blur-xl overflow-y-auto hide-scrollbar"
        style={{
          ...cardPositionStyle,
          borderColor: currentAccent,
          boxShadow: `0 20px 50px -10px ${currentAccent}45, 0 0 0 1px ${currentAccent}60`
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
            className="absolute -top-2.5 w-4 h-4 rotate-45 border-t-2 border-l-2 bg-slate-900"
            style={{ borderColor: currentAccent, left: beakLeft }}
          />
        )}
        {pointerPlacement === 'bottom' && (
          <div 
            className="absolute -bottom-2.5 w-4 h-4 rotate-45 border-b-2 border-r-2 bg-slate-900"
            style={{ borderColor: currentAccent, left: beakLeft }}
          />
        )}

        {/* Colorful Gradient Accent Header Bar */}
        <div 
          className="absolute -top-1.5 inset-x-6 h-1.5 rounded-full bg-gradient-to-r opacity-90 shadow-sm"
          style={{
            backgroundImage: `linear-gradient(to right, ${currentAccent}, #ffffff, ${currentAccent})`
          }}
        />

        {/* Top Header: Badge, Step counter, Close / Skip */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            {/* Step Icon inside colorful circular badge */}
            <div 
              className="w-8 h-8 rounded-2xl flex items-center justify-center font-bold shadow-md flex-shrink-0"
              style={{
                backgroundColor: currentAccent,
                color: '#ffffff'
              }}
            >
              {renderStepIcon(step.iconName, currentAccent)}
            </div>

            {/* Step Tag */}
            <span 
              className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs"
              style={{
                backgroundColor: `${currentAccent}25`,
                color: currentAccent,
                border: `1px solid ${currentAccent}50`
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
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            title={effectiveIsEn ? "Skip Tour" : "تخطي الإرشاد"}
          >
            <X size={15} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black font-kufi mb-1.5 flex items-center gap-1.5">
          <span style={{ color: currentAccent }}>
            {effectiveIsEn ? (step.titleEn || step.titleAr) : step.titleAr}
          </span>
        </h3>

        {/* Detailed Explanation */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium mb-4">
          {effectiveIsEn ? (step.descEn || formatNumber(step.descAr)) : step.descAr}
        </p>

        {/* Bottom Bar: Dots Progress & Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 shrink-0 mt-auto">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: idx === currentStepIndex ? '18px' : '6px',
                  backgroundColor: idx === currentStepIndex ? currentAccent : 'rgba(255,255,255,0.25)'
                }}
              />
            ))}
          </div>

          {/* Buttons: Prev & Next */}
          <div className="flex items-center gap-1.5">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                {effectiveIsEn ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                <span>{effectiveIsEn ? 'Back' : 'السابق'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              style={{
                backgroundColor: currentAccent,
                color: '#ffffff',
                boxShadow: `0 4px 14px ${currentAccent}60`
              }}
            >
              <span>
                {isLastStep 
                  ? (effectiveIsEn ? 'Got it 👍' : 'فهمت ذلك 👍') 
                  : (effectiveIsEn ? 'Next' : 'التالي')}
              </span>
              {!isLastStep ? (
                effectiveIsEn ? <ChevronRight size={14} /> : <ChevronLeft size={14} />
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
