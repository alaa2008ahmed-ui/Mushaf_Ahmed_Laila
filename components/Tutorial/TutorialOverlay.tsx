import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTutorial } from "../../context/TutorialContext";
import { Info, ChevronLeft } from "lucide-react";

export interface TutorialStep {
  id: string;
  title?: string;
  text: string;
  icon?: React.ReactNode;
  position?: { top?: string; bottom?: string; left?: string; right?: string };
  arrow?: "up" | "down" | "left" | "right";
  selector?: string;
}

interface TutorialOverlayProps {
  tutorialId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onStepChange?: (stepId: string) => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  tutorialId,
  steps,
  onComplete,
  onStepChange,
}) => {
  const { shouldShowTutorial, markTutorialAsSeen } = useTutorial();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (shouldShowTutorial(tutorialId)) {
      // Don't show if landscape (w > h)
      if (window.innerWidth > window.innerHeight) {
        setIsVisible(false);
        markTutorialAsSeen(tutorialId);
      } else {
        setIsVisible(true);
      }
    }
  }, [tutorialId, shouldShowTutorial, markTutorialAsSeen]);

  useEffect(() => {
    if (isVisible && onStepChange && steps[currentStep]) {
      onStepChange(steps[currentStep].id);
    }
  }, [isVisible, currentStep, onStepChange, steps]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onStepChange) {
        onStepChange(steps[nextStep].id);
      }
    } else {
      handleClose();
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onStepChange) {
        onStepChange(steps[prevStep].id);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    markTutorialAsSeen(tutorialId);
    if (onStepChange) onStepChange("");
    if (onComplete) onComplete();
  };

  const step = steps[currentStep];

  useEffect(() => {
    if (isVisible && step?.selector) {
      const el = document.querySelector(step.selector!);
      if (el) {
        const htmlEl = el as HTMLElement;
        const originalMargin = htmlEl.style.scrollMarginTop;
        htmlEl.style.scrollMarginTop = "120px";

        el.scrollIntoView({ behavior: "smooth", block: "start" });

        setTimeout(() => {
          if (htmlEl) htmlEl.style.scrollMarginTop = originalMargin;
        }, 1000);

        const update = () => {
          setTargetRect(el.getBoundingClientRect());
        };

        // Update immediately and after a short delay for scroll
        update();
        const timer = setTimeout(update, 500);
        const longTimer = setTimeout(update, 1000); // Second check for slow scrolls

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(el);
        resizeObserver.observe(document.body);

        window.addEventListener("scroll", update, true);
        window.addEventListener("resize", update);

        return () => {
          clearTimeout(timer);
          clearTimeout(longTimer);
          resizeObserver.disconnect();
          window.removeEventListener("scroll", update, true);
          window.removeEventListener("resize", update);
        };
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isVisible, step?.selector]);

  if (!isVisible) return null;

  const getTooltipStyle = (): React.CSSProperties => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const tooltipWidth = Math.min(330, windowWidth - 24);

    let style: React.CSSProperties = {
      position: "fixed",
      width: `${tooltipWidth}px`,
      maxWidth: "calc(100vw - 24px)",
      zIndex: 10001,
    };

    if (step.position) {
      if (step.position.top) style.top = step.position.top;
      if (step.position.bottom) style.bottom = step.position.bottom;
      if (step.position.left) style.left = step.position.left;
      if (step.position.right) style.right = step.position.right;
      if (step.position.top || step.position.bottom) {
        style.transform = step.position.left || step.position.right ? "none" : "translateX(-50%)";
        if (!step.position.left && !step.position.right) style.left = "50%";
      }
      return style;
    }

    if (!targetRect) {
      style.top = "50%";
      style.left = "50%";
      style.transform = "translate(-50%, -50%)";
      return style;
    }

    // Always center horizontally for optimal readability and full text display
    style.left = "50%";
    style.transform = "translateX(-50%)";

    const spaceAbove = targetRect.top;
    const spaceBelow = windowHeight - targetRect.bottom;
    const margin = 16;

    // Place below if there is enough space below or more space than above
    if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
      style.top = `${Math.min(targetRect.bottom + margin, windowHeight - 210)}px`;
    } else {
      style.bottom = `${Math.min(windowHeight - targetRect.top + margin, windowHeight - 60)}px`;
    }

    return style;
  };

  const tooltipStyle = getTooltipStyle();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] select-none overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          {/* Backdrop with Hole using Clip-Path */}
          <div
            className="absolute inset-0 bg-black/85 pointer-events-auto"
            style={{
              clipPath: targetRect
                ? `polygon(
                0% 0%, 0% 100%, 
                ${targetRect.left - 4}px 100%, 
                ${targetRect.left - 4}px ${targetRect.top - 4}px, 
                ${targetRect.right + 4}px ${targetRect.top - 4}px, 
                ${targetRect.right + 4}px ${targetRect.bottom + 4}px, 
                ${targetRect.left - 4}px ${targetRect.bottom + 4}px, 
                ${targetRect.left - 4}px 100%, 
                100% 100%, 100% 0%
              )`
                : "none",
            }}
          />

          {/* Highlight Ring */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed border-2 border-white rounded-xl pointer-events-none z-[10000] shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              style={{
                top: targetRect.top - 6,
                left: targetRect.left - 6,
                width: targetRect.width + 12,
                height: targetRect.height + 12,
              }}
            />
          )}

          {/* Tooltip Container */}
          <div className="fixed inset-0 pointer-events-none z-[10001]">
            <div className="absolute" style={tooltipStyle}>
              <motion.div
                key={currentStep}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl pointer-events-auto border border-white/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-5">
                  <div className="text-right mb-3">
                    {step.title && (
                      <h3 className="font-bold text-[16px] text-gray-900 mb-1 leading-snug break-words">
                        {step.title}
                      </h3>
                    )}
                    <p className="text-[14px] text-gray-600 leading-relaxed break-words">
                      {step.text}
                    </p>
                  </div>

                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                    <button
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[14px] font-bold shadow-md active:scale-95 transition-all cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                    >
                      {currentStep === steps.length - 1 ? "إنهاء" : "التالي"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Global Instruction removed as per user request */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialOverlay;
