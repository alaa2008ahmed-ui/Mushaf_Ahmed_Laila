import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ChevronRight, ChevronLeft, Check, X, HelpCircle, 
  Eye, Info, MessageSquare, Users, BookOpen, Send, Mic, Paperclip, Smile
} from 'lucide-react';

export interface SpotlightStep {
  id: string;
  targetSelector?: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr?: string;
  badgeEn?: string;
  iconName?: 'lang' | 'tab' | 'user' | 'country' | 'lock' | 'action' | 'nav' | 'profile' | 'quran' | 'search' | 'group' | 'block' | 'chat' | 'verse' | 'attach' | 'emoji' | 'text' | 'voice';
  accentColor: string; // e.g. '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'
  gradient: string; // e.g. 'from-sky-500 to-blue-600'
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
      'memorization_review_tour'
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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      if (onStepChange) onStepChange(0);
      setGuideSeen(guideKey);
    }
  }, [isOpen, guideKey]);

  const step = steps[currentStepIndex];

  // Update target bounding box
  const updateRect = useCallback(() => {
    if (!step?.targetSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (el) {
      // Scroll into view if needed
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      } catch (e) {}

      const rect = el.getBoundingClientRect();
      // Ensure target has width & height
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
        return;
      }
    }
    setTargetRect(null);
  }, [step]);

  useEffect(() => {
    if (!isOpen || !step) return;

    // Immediate check
    updateRect();

    // Check again shortly in case of animations/layout shifts
    const timer1 = setTimeout(updateRect, 100);
    const timer2 = setTimeout(updateRect, 300);

    const handleResizeOrScroll = () => {
      updateRect();
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen, step, updateRect]);

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

  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 640;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
  const cardWidthEstimate = Math.min(380, screenWidth - 28);
  const margin = 14;
  const tooltipHeightEstimate = 240;

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2;

    // Decide whether to place above or below target
    const spaceBelow = screenHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    // If target element is large (e.g. chats list or members list spanning > 45% of screen), center the card directly
    const isTargetLarge = targetRect.height > screenHeight * 0.45;

    const computedLeft = Math.max(14, Math.min(screenWidth - cardWidthEstimate - 14, Math.round(targetCenterX - cardWidthEstimate / 2)));

    if (!isTargetLarge && spaceBelow >= tooltipHeightEstimate + margin) {
      // Place below target
      pointerPlacement = 'top';
      cardPositionStyle = {
        top: Math.min(targetRect.bottom + margin, screenHeight - tooltipHeightEstimate - 20),
        left: computedLeft,
        width: cardWidthEstimate
      };
    } else if (!isTargetLarge && spaceAbove >= tooltipHeightEstimate + margin) {
      // Place above target
      pointerPlacement = 'bottom';
      cardPositionStyle = {
        top: Math.max(14, targetRect.top - tooltipHeightEstimate - margin),
        left: computedLeft,
        width: cardWidthEstimate
      };
    } else {
      // Centered cleanly on the screen (no reliance on CSS transform which framer motion overrides)
      pointerPlacement = 'center';
      const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidthEstimate) / 2));
      const centeredTop = Math.max(14, Math.round((screenHeight - 260) / 2));
      cardPositionStyle = {
        top: centeredTop,
        left: centeredLeft,
        width: cardWidthEstimate
      };
    }
  } else {
    // Center of screen
    pointerPlacement = 'center';
    const centeredLeft = Math.max(14, Math.round((screenWidth - cardWidthEstimate) / 2));
    const centeredTop = Math.max(14, Math.round((screenHeight - 260) / 2));
    cardPositionStyle = {
      top: centeredTop,
      left: centeredLeft,
      width: cardWidthEstimate
    };
  }

  const currentAccent = step.accentColor || '#10b981';

  return (
    <div 
      className="fixed inset-0 z-[100001] pointer-events-none select-none"
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {/* Subtle, crystal-clear dismiss backdrop matching Quran reader */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-auto transition-opacity"
        onClick={handleSkip}
      />

      {/* Target Element Luminous Spotlight Frame - Crisp & 100% Clear with zero dimming */}
      {targetRect && (
        <motion.div
          key={`spotlight-${step.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-none rounded-2xl transition-all duration-300"
          style={{
            top: Math.max(0, targetRect.top - 4),
            left: Math.max(0, targetRect.left - 4),
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: `0 0 0 3px ${currentAccent}, 0 0 24px ${currentAccent}90, inset 0 0 12px ${currentAccent}25`,
            border: `2.5px solid ${currentAccent}`,
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
        initial={{ opacity: 0, scale: 0.92, y: pointerPlacement === 'top' ? -10 : (pointerPlacement === 'bottom' ? 10 : 0) }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed z-[100003] pointer-events-auto rounded-3xl p-4 sm:p-5 shadow-2xl border-2 flex flex-col bg-slate-900/98 text-white backdrop-blur-xl"
        style={{
          ...cardPositionStyle,
          borderColor: currentAccent,
          boxShadow: `0 20px 45px -10px ${currentAccent}50, 0 0 0 1px ${currentAccent}60`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pointer Beak pointing toward highlighted target */}
        {pointerPlacement === 'top' && (
          <div 
            className="absolute -top-2.5 left-10 w-4 h-4 rotate-45 border-t-2 border-l-2 bg-slate-900"
            style={{ borderColor: currentAccent }}
          />
        )}
        {pointerPlacement === 'bottom' && (
          <div 
            className="absolute -bottom-2.5 left-10 w-4 h-4 rotate-45 border-b-2 border-r-2 bg-slate-900"
            style={{ borderColor: currentAccent }}
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
              {isEn 
                ? (step.badgeEn || `Step ${currentStepIndex + 1} of ${steps.length}`)
                : (step.badgeAr || `خطوة ${currentStepIndex + 1} من ${steps.length}`)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            title={isEn ? "Skip Tour" : "تخطي الإرشاد"}
          >
            <X size={15} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black font-kufi mb-1.5 flex items-center gap-1.5">
          <span style={{ color: currentAccent }}>
            {isEn ? step.titleEn : step.titleAr}
          </span>
        </h3>

        {/* Detailed Explanation */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium mb-4">
          {isEn ? step.descEn : step.descAr}
        </p>

        {/* Bottom Bar: Dots Progress & Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
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
                {isEn ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                <span>{isEn ? 'Back' : 'السابق'}</span>
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
