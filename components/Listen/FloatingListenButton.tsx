import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  useListenQuranStore,
  isFloatingListenButtonEnabled,
  FLOATING_LISTEN_BTN_ENABLED_KEY,
  FLOATING_LISTEN_BTN_VISIBILITY_EVENT,
} from '../../hooks/useListenQuranStore';

const POSITION_STORAGE_KEY = 'listen_floating_btn_pos_v2';
const BUTTON_SIZE = 52;
const LONG_PRESS_DELAY_MS = 340;
const MOVE_CANCEL_THRESHOLD_PX = 10;

interface FloatingPosition {
  x: number;
  y: number;
}

interface FloatingListenButtonProps {
  isSplashActive?: boolean;
}

const getSafeInsets = (): { top: number; bottom: number } => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { top: 12, bottom: 16 };
  }
  try {
    const styles = getComputedStyle(document.documentElement);
    const parseCssPx = (val: string) => {
      const parsed = parseFloat(val);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const topInset = Math.max(
      parseCssPx(styles.getPropertyValue('--native-safe-top')),
      parseCssPx(styles.getPropertyValue('--app-safe-top'))
    );
    const bottomInset = Math.max(
      parseCssPx(styles.getPropertyValue('--native-safe-bottom')),
      parseCssPx(styles.getPropertyValue('--app-bottom-clearance'))
    );
    return {
      top: Math.max(12, topInset + 8),
      bottom: Math.max(16, bottomInset + 10),
    };
  } catch {
    return { top: 12, bottom: 16 };
  }
};

const clampPosition = (pos: FloatingPosition): FloatingPosition => {
  if (typeof window === 'undefined') return pos;
  const { top, bottom } = getSafeInsets();
  const minX = 12;
  const maxX = Math.max(minX, window.innerWidth - BUTTON_SIZE - 12);
  const minY = top;
  const maxY = Math.max(minY, window.innerHeight - BUTTON_SIZE - bottom);
  return {
    x: Math.round(Math.min(Math.max(pos.x, minX), maxX)),
    y: Math.round(Math.min(Math.max(pos.y, minY), maxY)),
  };
};

const readStoredPosition = (): FloatingPosition | null => {
  try {
    const raw = localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return clampPosition({ x: parsed.x, y: parsed.y });
    }
  } catch {}
  return null;
};

export const FloatingListenButton: React.FC<FloatingListenButtonProps> = ({
  isSplashActive = false,
}) => {
  const {
    hasFloatingSession,
    isPlaying,
    isLoading,
    isPausedByInterruption,
    currentPage,
    currentTime,
    duration,
    stopFromFloating,
  } = useListenQuranStore();

  const { isNightMode, homeLayout, homeThemeVariant, theme, themeKey } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => isFloatingListenButtonEnabled());
  const [isDragging, setIsDragging] = useState(false);
  const [customPos, setCustomPos] = useState<FloatingPosition | null>(() => readStoredPosition());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const customPosRef = useRef<FloatingPosition | null>(customPos);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gestureRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
    isDragMode: boolean;
    cancelled: boolean;
  } | null>(null);

  useEffect(() => {
    customPosRef.current = customPos;
  }, [customPos]);

  useEffect(() => {
    setMounted(true);
    setIsEnabled(isFloatingListenButtonEnabled());

    const handleVisibilityChange = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (typeof detail?.enabled === 'boolean') {
        setIsEnabled(detail.enabled);
      } else {
        setIsEnabled(isFloatingListenButtonEnabled());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === FLOATING_LISTEN_BTN_ENABLED_KEY) {
        setIsEnabled(isFloatingListenButtonEnabled());
      }
    };

    const handleResize = () => {
      if (customPosRef.current) {
        const clamped = clampPosition(customPosRef.current);
        setCustomPos(clamped);
        customPosRef.current = clamped;
      }
    };

    window.addEventListener(FLOATING_LISTEN_BTN_VISIBILITY_EVENT, handleVisibilityChange);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener(FLOATING_LISTEN_BTN_VISIBILITY_EVENT, handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('resize', handleResize);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, []);

  const persistPosition = useCallback((pos: FloatingPosition) => {
    const clamped = clampPosition(pos);
    setCustomPos(clamped);
    customPosRef.current = clamped;
    try {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(clamped));
    } catch {}
  }, []);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pointerId = e.pointerId;
    const startClientX = e.clientX;
    const startClientY = e.clientY;

    gestureRef.current = {
      pointerId,
      startClientX,
      startClientY,
      originX: rect.left,
      originY: rect.top,
      isDragMode: false,
      cancelled: false,
    };

    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      const g = gestureRef.current;
      if (!g || g.pointerId !== pointerId || g.cancelled) return;

      g.isDragMode = true;
      setIsDragging(true);

      const snapped = clampPosition({ x: g.originX, y: g.originY });
      setCustomPos(snapped);
      customPosRef.current = snapped;

      try {
        el.setPointerCapture(pointerId);
      } catch {}

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(28);
        } catch {}
      }
    }, LONG_PRESS_DELAY_MS);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (!g || e.pointerId !== g.pointerId) return;

    const dx = e.clientX - g.startClientX;
    const dy = e.clientY - g.startClientY;

    if (!g.isDragMode) {
      if (Math.hypot(dx, dy) > MOVE_CANCEL_THRESHOLD_PX) {
        clearHoldTimer();
        g.cancelled = true;
      }
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const nextPos = clampPosition({
      x: g.originX + dx,
      y: g.originY + dy,
    });
    setCustomPos(nextPos);
    customPosRef.current = nextPos;
  };

  const finishGesture = (e: React.PointerEvent<HTMLDivElement>, isCancel: boolean) => {
    const g = gestureRef.current;
    if (!g || e.pointerId !== g.pointerId) return;

    clearHoldTimer();
    gestureRef.current = null;

    try {
      if (containerRef.current?.hasPointerCapture?.(e.pointerId)) {
        containerRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (g.isDragMode) {
      setIsDragging(false);
      if (customPosRef.current) {
        persistPosition(customPosRef.current);
      }
      return;
    }

    if (!isCancel && !g.cancelled) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(18);
        } catch {}
      }
      stopFromFloating();
    }
  };

  if (!mounted || typeof document === 'undefined') return null;
  if (isSplashActive) return null;

  // Rule 3: Automatically hide when disabled or when inside the Listen to Quran page
  if (!isEnabled || !hasFloatingSession || currentPage === 'listen') {
    return null;
  }

  // Hide while boot splash overlays exist
  if (
    document.getElementById('initial-boot-splash') ||
    document.getElementById('app-image-splash') ||
    document.getElementById('app-welcome-splash')
  ) {
    return null;
  }

  // Theme-matched button appearance
  const isModern = homeLayout !== 'classic';
  let buttonStyle: React.CSSProperties = {};
  let ringColor = '#FBBF24';

  if (isModern) {
    if (isNightMode) {
      buttonStyle = {
        background: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 10px 26px rgba(0, 0, 0, 0.75), 0 0 14px rgba(255, 255, 255, 0.22)',
      };
      ringColor = '#FFFFFF';
    } else if (homeThemeVariant === 'sky') {
      buttonStyle = {
        background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        border: '1.5px solid #7DD3FC',
        boxShadow: '0 8px 22px rgba(3, 105, 161, 0.48)',
      };
      ringColor = '#BAE6FD';
    } else if (homeThemeVariant === 'emerald') {
      buttonStyle = {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        border: '1.5px solid #6EE7B7',
        boxShadow: '0 8px 22px rgba(4, 120, 87, 0.48)',
      };
      ringColor = '#A7F3D0';
    } else if (homeThemeVariant === 'burgundy') {
      buttonStyle = {
        background: 'linear-gradient(135deg, #881337 0%, #6b1d45 100%)',
        border: '1.5px solid #FDA4AF',
        boxShadow: '0 8px 22px rgba(136, 19, 55, 0.5)',
      };
      ringColor = '#FECDD3';
    } else {
      buttonStyle = {
        background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
        border: '1.5px solid #FCD34D',
        boxShadow: '0 8px 22px rgba(180, 83, 9, 0.48)',
      };
      ringColor = '#FEF08A';
    }
  } else {
    const isBlackTheme =
      isNightMode || themeKey === 'deep_black' || themeKey === 'black_gold';
    if (isBlackTheme) {
      buttonStyle = {
        background: '#111111',
        border: '1.5px solid #FFFFFF',
        boxShadow: '0 8px 22px rgba(0, 0, 0, 0.8)',
      };
      ringColor = '#FFFFFF';
    } else {
      const primaryColor = theme?.palette?.[0] || theme?.btnBg || theme?.accent || '#D97706';
      buttonStyle = {
        background: primaryColor,
        border: '1.5px solid rgba(255, 255, 255, 0.65)',
        boxShadow: '0 8px 22px rgba(0, 0, 0, 0.3)',
      };
      ringColor = '#FFFFFF';
    }
  }

  // Circular SVG progress ring calculation
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const radius = 23;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const containerStyle: React.CSSProperties = customPos
    ? {
        position: 'fixed',
        left: `${customPos.x}px`,
        top: `${customPos.y}px`,
        width: `${BUTTON_SIZE}px`,
        height: `${BUTTON_SIZE}px`,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }
    : {
        position: 'fixed',
        top: 'calc(var(--app-safe-top, 0px) + 50px)',
        right: 'clamp(1.125rem, 4vw, 1.5rem)',
        width: `${BUTTON_SIZE}px`,
        height: `${BUTTON_SIZE}px`,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      };

  const defaultPositionClasses = '';

  const floatingElement = (
    <div
      ref={containerRef}
      id="floating-listen-quran-btn"
      role="button"
      tabIndex={0}
      aria-label={
        isPausedByInterruption
          ? 'إيقاف تلاوة القرآن المؤقتة'
          : 'إيقاف صوت تلاوة القرآن'
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => finishGesture(e, false)}
      onPointerCancel={(e) => finishGesture(e, true)}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          stopFromFloating();
        }
      }}
      style={containerStyle}
      className={`${defaultPositionClasses} z-[9998] rounded-full flex items-center justify-center transition-transform duration-150 ${
        isDragging
          ? 'scale-110 cursor-grabbing ring-4 ring-amber-400/70'
          : 'cursor-pointer active:scale-95'
      }`}
    >
      {/* Subtle pulse halo while actively playing */}
      {isPlaying && !isPausedByInterruption && !isDragging && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30 pointer-events-none"
          style={{ backgroundColor: ringColor }}
        />
      )}

      <div
        className="relative w-full h-full rounded-full flex items-center justify-center text-white overflow-hidden"
        style={buttonStyle}
      >
        {/* Outer SVG progress track & animated rotating circular ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 52 52"
        >
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.24)"
            strokeWidth="2.5"
          />
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeOpacity="0.45"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none ${
            isPlaying && !isPausedByInterruption
              ? 'animate-[spin_2.2s_linear_infinite]'
              : '-rotate-90'
          }`}
          viewBox="0 0 52 52"
        >
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(circumference * 0.1).toFixed(1)} ${(circumference * 0.9).toFixed(1)}`}
            style={{
              filter: `drop-shadow(0 0 3px ${ringColor})`,
            }}
          />
        </svg>

        {isLoading && !isPausedByInterruption ? (
          <Loader2 className="w-5 h-5 text-white animate-spin relative z-10 pointer-events-none" />
        ) : isPausedByInterruption ? (
          <VolumeX className="w-5 h-5 text-amber-200 relative z-10 pointer-events-none" />
        ) : (
          <Volume2 className="w-5 h-5 text-white relative z-10 pointer-events-none" />
        )}

        {/* Small interruption indicator dot when paused by another audio/mic */}
        {isPausedByInterruption && (
          <span className="absolute top-2 end-2 w-2 h-2 rounded-full bg-amber-300 shadow pointer-events-none" />
        )}
      </div>
    </div>
  );

  return createPortal(floatingElement, document.body);
};

export default FloatingListenButton;
