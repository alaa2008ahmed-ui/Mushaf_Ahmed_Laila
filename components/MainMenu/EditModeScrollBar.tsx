import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditModeScrollBarProps {
  isEditMode: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  isRTL?: boolean;
  language?: string;
  isNightMode?: boolean;
}

export const EditModeScrollBar: React.FC<EditModeScrollBarProps> = ({
  isEditMode,
  scrollContainerRef,
  isRTL = true,
  language = 'ar',
  isNightMode = false,
}) => {
  const [scrollRatio, setScrollRatio] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [trackHeight, setTrackHeight] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const lastVibrateTimeRef = useRef(0);

  const isEn = language === 'en';
  const thumbHeight = 54; // px

  // Measure track height on mount and resize
  const measureTrack = useCallback(() => {
    if (trackRef.current) {
      setTrackHeight(trackRef.current.clientHeight);
    }
  }, []);

  // Update scroll ratio from container
  const updateRatioFromScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) {
      setScrollRatio(0);
      return;
    }
    const current = el.scrollTop;
    const ratio = Math.max(0, Math.min(1, current / maxScroll));
    setScrollRatio(ratio);
  }, [scrollContainerRef]);

  useEffect(() => {
    if (!isEditMode) return;

    measureTrack();
    updateRatioFromScroll();

    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (!isPointerDownRef.current) {
        updateRatioFromScroll();
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measureTrack);

    // Initial check after short delay to let layout settle
    const t = setTimeout(() => {
      measureTrack();
      updateRatioFromScroll();
    }, 150);

    return () => {
      clearTimeout(t);
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measureTrack);
    };
  }, [isEditMode, measureTrack, updateRatioFromScroll, scrollContainerRef]);

  // Haptic feedback throttled
  const triggerHaptic = useCallback(() => {
    const now = Date.now();
    if (now - lastVibrateTimeRef.current > 70) {
      lastVibrateTimeRef.current = now;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(15);
        } catch {}
      }
    }
  }, []);

  // Apply new scroll position from Y coordinate inside track
  const applyScrollFromClientY = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return;
      const el = scrollContainerRef.current;
      if (!el) return;

      const rect = trackRef.current.getBoundingClientRect();
      const availableTrack = Math.max(1, rect.height - thumbHeight);
      const relativeY = clientY - rect.top - thumbHeight / 2;
      const ratio = Math.max(0, Math.min(1, relativeY / availableTrack));

      setScrollRatio(ratio);
      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTop = ratio * maxScroll;
      triggerHaptic();
    },
    [scrollContainerRef, thumbHeight, triggerHaptic]
  );

  // Pointer Down on track / thumb
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isPointerDownRef.current = true;
    setIsDragging(true);

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    applyScrollFromClientY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    applyScrollFromClientY(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    isPointerDownRef.current = false;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (!isEditMode) return null;

  const availableHeight = Math.max(0, trackHeight - thumbHeight);
  const thumbTop = Math.round(scrollRatio * availableHeight);

  // Percent text
  const percent = Math.round(scrollRatio * 100);
  let statusText = `${percent}%`;
  if (scrollRatio <= 0.08) {
    statusText = isEn ? 'Top' : 'أعلى الصفحة';
  } else if (scrollRatio >= 0.92) {
    statusText = isEn ? 'Bottom' : 'أسفل الصفحة';
  }

  // Positioning side based on app language:
  // Arabic (RTL): on the left side
  // English (LTR): on the right side
  const sideClass = isRTL ? 'left-1.5 sm:left-3' : 'right-1.5 sm:right-3';

  return (
    <AnimatePresence>
      <motion.div
        key="edit-mode-vertical-scrollbar"
        initial={{ opacity: 0, x: isRTL ? -30 : 30, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: isRTL ? -30 : 30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`fixed top-20 bottom-16 sm:top-24 sm:bottom-20 ${sideClass} z-[160] flex flex-col items-center select-none pointer-events-auto`}
        style={{ touchAction: 'none' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Vertical Track Container with wide touch hit area */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative flex-1 w-8 sm:w-9 flex items-center justify-center cursor-pointer group"
          style={{ touchAction: 'none' }}
        >
          {/* Thin visual vertical rail */}
          <div
            className={`w-2.5 sm:w-3 h-full rounded-full transition-all duration-200 ${
              isNightMode
                ? 'bg-zinc-900/90 border border-amber-500/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]'
                : 'bg-amber-900/20 border border-amber-400/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]'
            } ${isDragging ? 'w-3 sm:w-3.5 border-amber-400' : ''}`}
          />

          {/* Draggable Thumb / Slider Handle */}
          <div
            className={`absolute w-3.5 sm:w-4 rounded-full transition-shadow duration-150 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing ${
              isDragging ? 'scale-110 shadow-xl' : 'shadow-md'
            }`}
            style={{
              height: `${thumbHeight}px`,
              top: `${thumbTop}px`,
              background: isNightMode
                ? 'linear-gradient(180deg, #F59E0B 0%, #D97706 50%, #B45309 100%)'
                : 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
              boxShadow: isNightMode
                ? '0 2px 10px rgba(0,0,0,0.9), 0 0 12px rgba(245,158,11,0.6), inset 0 1px 1px rgba(255,255,255,0.7)'
                : '0 3px 12px rgba(180,83,9,0.45), inset 0 1px 1px rgba(255,255,255,0.8)',
              border: isNightMode ? '1.5px solid #FCD34D' : '1.5px solid #FFFFFF',
            }}
          >
            {/* Tactile micro grip ridges */}
            <div className="w-1.5 h-0.5 bg-black/40 rounded-full mb-0.5" />
            <div className="w-1.5 h-0.5 bg-black/40 rounded-full mb-0.5" />
            <div className="w-1.5 h-0.5 bg-black/40 rounded-full" />

            {/* Position Tooltip badge when dragging or hovering */}
            <AnimatePresence>
              {(isDragging || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute ${
                    isRTL ? 'left-full ml-2' : 'right-full mr-2'
                  } whitespace-nowrap px-2.5 py-1 rounded-xl shadow-xl font-bold text-[11px] sm:text-xs z-50 pointer-events-none flex items-center gap-1 font-cairo ${
                    isNightMode
                      ? 'bg-zinc-950/95 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-amber-900/95 text-amber-50 border border-amber-200/40 shadow-lg'
                  }`}
                >
                  <span>{statusText}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditModeScrollBar;
