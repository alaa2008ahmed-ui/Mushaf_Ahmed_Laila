import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Volume2,
  Loader2,
  Pause,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_LIST } from '../../data/listenQuranData';
import {
  getSurahDisplayName,
  formatListenTime,
  tListen,
} from '../../utils/listenQuranTranslations';
import {
  useListenQuranStore,
  isFloatingListenButtonEnabled,
  FLOATING_LISTEN_BTN_ENABLED_KEY,
  FLOATING_LISTEN_BTN_VISIBILITY_EVENT,
} from '../../hooks/useListenQuranStore';

const POSITION_STORAGE_KEY = 'listen_floating_btn_pos_v4';
const LEGACY_POSITION_STORAGE_KEY = 'listen_floating_btn_pos_v3';
const FAB_POSITION_STORAGE_KEY = 'fab_custom_position';
const LONG_PRESS_DELAY_MS = 340;
const MOVE_CANCEL_THRESHOLD_PX = 10;
const FAB_GAP_PX = 10;

type FloatingActionType = 'prev' | 'toggle' | 'next' | 'stop';

interface FloatingPosition {
  x: number;
  y: number;
}

interface FloatingListenButtonProps {
  isSplashActive?: boolean;
}

interface ViewportMetrics {
  width: number;
  height: number;
  isSm: boolean;
  fabSize: number;
  edgeMargin: number;
  defaultCardWidth: number;
}

const getViewportMetrics = (): ViewportMetrics => {
  if (typeof window === 'undefined') {
    return {
      width: 390,
      height: 844,
      isSm: false,
      fabSize: 44,
      edgeMargin: 20,
      defaultCardWidth: 296,
    };
  }
  const width =
    (typeof document !== 'undefined' && document.documentElement?.clientWidth) ||
    window.innerWidth;
  const height = window.innerHeight;
  const isSm = width >= 640;
  const fabSize = isSm ? 48 : 44;
  const edgeMargin = isSm ? 32 : 20;
  const defaultCardWidth = Math.max(180, width - (edgeMargin + fabSize + FAB_GAP_PX) - edgeMargin);
  return { width, height, isSm, fabSize, edgeMargin, defaultCardWidth };
};

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

const clampPosition = (
  pos: FloatingPosition,
  cardWidth?: number,
  cardHeight?: number
): FloatingPosition => {
  if (typeof window === 'undefined') return pos;
  const metrics = getViewportMetrics();
  const w = cardWidth ?? metrics.defaultCardWidth;
  const h = cardHeight ?? metrics.fabSize;
  const { top, bottom } = getSafeInsets();
  const minX = 12;
  const maxX = Math.max(minX, window.innerWidth - w - 12);
  const minY = top;
  const maxY = Math.max(minY, window.innerHeight - h - bottom);
  return {
    x: Math.round(Math.min(Math.max(pos.x, minX), maxX)),
    y: Math.round(Math.min(Math.max(pos.y, minY), maxY)),
  };
};

const readStoredPosition = (): FloatingPosition | null => {
  try {
    localStorage.removeItem(LEGACY_POSITION_STORAGE_KEY);
    const raw = localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return clampPosition({ x: parsed.x, y: parsed.y });
    }
  } catch {}
  return null;
};

const readFabCustomPosition = (): FloatingPosition | null => {
  try {
    const raw = localStorage.getItem(FAB_POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return { x: parsed.x, y: parsed.y };
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
    surahNumber,
    stopFromFloating,
    nextSurah,
    prevSurah,
  } = useListenQuranStore();

  const {
    isNightMode,
    homeThemeVariant,
    theme,
    themeKey,
    isQuranPage,
    currentPage: themeCurrentPage,
  } = useTheme();
  const { language, isRTL, dir } = useLanguage();

  const effectivePage = themeCurrentPage || currentPage || 'home';
  const isQuranView =
    isQuranPage ||
    effectivePage === 'quran' ||
    effectivePage === 'quran-landscape' ||
    effectivePage === 'quran-search' ||
    effectivePage.startsWith('quran_') ||
    (typeof document !== 'undefined' && document.body.classList.contains('quran-context'));

  const [mounted, setMounted] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => isFloatingListenButtonEnabled());
  const [isDragging, setIsDragging] = useState(false);
  const [customPos, setCustomPos] = useState<FloatingPosition | null>(() => readStoredPosition());
  const [fabCustomPos, setFabCustomPos] = useState<FloatingPosition | null>(() =>
    readFabCustomPosition()
  );
  const [metrics, setMetrics] = useState<ViewportMetrics>(() => getViewportMetrics());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const customPosRef = useRef<FloatingPosition | null>(customPos);
  const dragSizeRef = useRef<{ width: number; height: number } | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ghostShieldCleanupRef = useRef<(() => void) | null>(null);
  const lastGestureHandledAtRef = useRef<number>(0);

  const gestureRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
    cardWidth: number;
    cardHeight: number;
    action: FloatingActionType;
    isDragMode: boolean;
    hasMovedDuringDrag: boolean;
    cancelled: boolean;
  } | null>(null);

  useEffect(() => {
    customPosRef.current = customPos;
  }, [customPos]);

  useEffect(() => {
    setMounted(true);
    setIsEnabled(isFloatingListenButtonEnabled());
    setFabCustomPos(readFabCustomPosition());
    setMetrics(getViewportMetrics());

    const handleVisibilityChange = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (typeof detail?.enabled === 'boolean') {
        setIsEnabled(detail.enabled);
      } else {
        setIsEnabled(isFloatingListenButtonEnabled());
      }
    };

    const syncFabPos = () => {
      setFabCustomPos(readFabCustomPosition());
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === FLOATING_LISTEN_BTN_ENABLED_KEY) {
        setIsEnabled(isFloatingListenButtonEnabled());
      }
      if (e.key === null || e.key === FAB_POSITION_STORAGE_KEY) {
        syncFabPos();
      }
    };

    const handleResize = () => {
      const nextMetrics = getViewportMetrics();
      setMetrics(nextMetrics);
      if (customPosRef.current) {
        const clamped = clampPosition(
          customPosRef.current,
          nextMetrics.defaultCardWidth,
          nextMetrics.fabSize
        );
        setCustomPos(clamped);
        customPosRef.current = clamped;
      }
    };

    window.addEventListener(FLOATING_LISTEN_BTN_VISIBILITY_EVENT, handleVisibilityChange);
    window.addEventListener('save-home-cards-layout', syncFabPos);
    window.addEventListener('reset-home-cards-layout', syncFabPos);
    window.addEventListener('home-edit-mode-changed', syncFabPos);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener(FLOATING_LISTEN_BTN_VISIBILITY_EVENT, handleVisibilityChange);
      window.removeEventListener('save-home-cards-layout', syncFabPos);
      window.removeEventListener('reset-home-cards-layout', syncFabPos);
      window.removeEventListener('home-edit-mode-changed', syncFabPos);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('resize', handleResize);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      if (ghostShieldCleanupRef.current) {
        ghostShieldCleanupRef.current();
        ghostShieldCleanupRef.current = null;
      }
    };
  }, []);

  // Ensure Listen-Quran audio stops and card disappears completely when entering Quran Reading page
  useEffect(() => {
    if (isQuranView && (hasFloatingSession || isPlaying || isLoading || isPausedByInterruption)) {
      stopFromFloating();
    }
  }, [isQuranView, hasFloatingSession, isPlaying, isLoading, isPausedByInterruption, stopFromFloating]);

  const clearGhostShield = useCallback(() => {
    if (ghostShieldCleanupRef.current) {
      ghostShieldCleanupRef.current();
      ghostShieldCleanupRef.current = null;
    }
  }, []);

  const installGhostClickShield = useCallback(
    (clientX: number, clientY: number) => {
      clearGhostShield();
      if (typeof window === 'undefined') return;

      const SHIELD_WINDOW_MS = 450;
      const MAX_RADIUS_PX = 48;
      const startedAt = Date.now();

      const shouldBlockAtPoint = (x: number | undefined, y: number | undefined) => {
        if (typeof x !== 'number' || typeof y !== 'number') return true;
        if (x === 0 && y === 0 && (clientX > 10 || clientY > 10)) return false;
        return Math.hypot(x - clientX, y - clientY) <= MAX_RADIUS_PX;
      };

      const blocker = (ev: Event) => {
        if (Date.now() - startedAt > SHIELD_WINDOW_MS) {
          clearGhostShield();
          return;
        }

        let evX: number | undefined;
        let evY: number | undefined;
        if ('changedTouches' in ev && (ev as TouchEvent).changedTouches?.length) {
          evX = (ev as TouchEvent).changedTouches[0].clientX;
          evY = (ev as TouchEvent).changedTouches[0].clientY;
        } else if ('clientX' in ev) {
          evX = (ev as MouseEvent).clientX;
          evY = (ev as MouseEvent).clientY;
        }

        if (shouldBlockAtPoint(evX, evY)) {
          ev.preventDefault();
          ev.stopPropagation();
          if (typeof ev.stopImmediatePropagation === 'function') {
            ev.stopImmediatePropagation();
          }
          if (ev.type === 'click') {
            clearGhostShield();
          }
        }
      };

      const shieldEvents: Array<keyof WindowEventMap> = [
        'mousedown',
        'mouseup',
        'click',
        'touchend',
        'pointerup',
      ];
      shieldEvents.forEach((evtName) => {
        window.addEventListener(evtName, blocker, true);
      });

      const timer = window.setTimeout(() => {
        clearGhostShield();
      }, SHIELD_WINDOW_MS);

      ghostShieldCleanupRef.current = () => {
        window.clearTimeout(timer);
        shieldEvents.forEach((evtName) => {
          window.removeEventListener(evtName, blocker, true);
        });
      };
    },
    [clearGhostShield]
  );

  const persistPosition = useCallback(
    (pos: FloatingPosition, cardWidth?: number, cardHeight?: number) => {
      const clamped = clampPosition(pos, cardWidth, cardHeight);
      setCustomPos(clamped);
      customPosRef.current = clamped;
      try {
        localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(clamped));
      } catch {}
    },
    []
  );

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const triggerFloatingAction = useCallback(
    (action: FloatingActionType) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(18);
        } catch {}
      }
      if (action === 'prev') {
        prevSurah();
      } else if (action === 'next') {
        nextSurah();
      } else {
        stopFromFloating();
      }
    },
    [nextSurah, prevSurah, stopFromFloating]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();

    const el = containerRef.current;
    if (!el) return;

    const targetEl = e.target as HTMLElement | null;
    const rawAction = targetEl
      ?.closest('[data-floating-action]')
      ?.getAttribute('data-floating-action') as FloatingActionType | undefined;

    const rect = el.getBoundingClientRect();
    const pointerId = e.pointerId;
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const cardWidth = rect.width || metrics.defaultCardWidth;
    const cardHeight = rect.height || metrics.fabSize;

    gestureRef.current = {
      pointerId,
      startClientX,
      startClientY,
      originX: rect.left,
      originY: rect.top,
      cardWidth,
      cardHeight,
      action: rawAction || 'stop',
      isDragMode: false,
      hasMovedDuringDrag: false,
      cancelled: false,
    };

    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      const g = gestureRef.current;
      if (!g || g.pointerId !== pointerId || g.cancelled) return;

      g.isDragMode = true;
      dragSizeRef.current = { width: g.cardWidth, height: g.cardHeight };
      setIsDragging(true);

      const snapped = clampPosition(
        { x: g.originX, y: g.originY },
        g.cardWidth,
        g.cardHeight
      );
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

    if (Math.hypot(dx, dy) > 4) {
      g.hasMovedDuringDrag = true;
    }

    const nextPos = clampPosition(
      {
        x: g.originX + dx,
        y: g.originY + dy,
      },
      g.cardWidth,
      g.cardHeight
    );
    setCustomPos(nextPos);
    customPosRef.current = nextPos;
  };

  const finishGesture = (e: React.PointerEvent<HTMLDivElement>, isCancel: boolean) => {
    const g = gestureRef.current;
    if (!g || e.pointerId !== g.pointerId) return;

    e.stopPropagation();
    if (!isCancel) {
      e.preventDefault();
    }

    clearHoldTimer();
    gestureRef.current = null;

    try {
      if (containerRef.current?.hasPointerCapture?.(e.pointerId)) {
        containerRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (!isCancel) {
      lastGestureHandledAtRef.current = Date.now();
      installGhostClickShield(e.clientX, e.clientY);
    }

    if (g.isDragMode) {
      setIsDragging(false);
      if (g.hasMovedDuringDrag && customPosRef.current) {
        persistPosition(customPosRef.current, g.cardWidth, g.cardHeight);
      } else if (!g.hasMovedDuringDrag && !readStoredPosition()) {
        setCustomPos(null);
        customPosRef.current = null;
      }
      dragSizeRef.current = null;
      return;
    }

    if (!isCancel && !g.cancelled) {
      triggerFloatingAction(g.action);
    }
  };

  if (!mounted || typeof document === 'undefined') return null;
  if (isSplashActive) return null;

  // Rule 3: Automatically hide when disabled, inside Listen to Quran, or inside Quran Reading page
  if (!isEnabled || !hasFloatingSession || currentPage === 'listen' || isQuranView) {
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

  // Full 3D sculpted theme-matched card appearance (aligned with ScrollToTopFAB)
  const isBlackTheme =
    isNightMode ||
    themeKey === 'deep_black' ||
    theme?.name === 'اسود' ||
    (theme?.bgColor === '#000000' && !themeKey.includes('gold'));
  const isBlackGoldTheme = themeKey === 'black_gold';

  let cardStyle: React.CSSProperties = {};
  let ringColor = '#FBBF24';
  const textColor = '#FFFFFF';
  let inner3DButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 100%)',
    boxShadow:
      '0 2.5px 0 rgba(0, 0, 0, 0.28), 0 4px 8px rgba(0, 0, 0, 0.18), inset 0 1.5px 1px rgba(255, 255, 255, 0.45), inset 0 -1.5px 2px rgba(0, 0, 0, 0.16)',
  };

  if (isNightMode) {
    cardStyle = {
      background: 'linear-gradient(160deg, #27272a 0%, #18181b 55%, #09090b 100%)',
      border: 'none',
      boxShadow:
        '0 5px 0 #3f3f46, 0 12px 24px rgba(0, 0, 0, 0.85), 0 0 12px rgba(255, 255, 255, 0.2), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.38), inset 0 -2px 4px rgba(0, 0, 0, 0.65)',
    };
    ringColor = '#FFFFFF';
    inner3DButtonStyle = {
      background: 'linear-gradient(160deg, #3f3f46 0%, #27272a 100%)',
      boxShadow:
        '0 2.5px 0 #18181b, 0 4px 8px rgba(0, 0, 0, 0.55), inset 0 1.5px 1px rgba(255, 255, 255, 0.32), inset 0 -1.5px 2px rgba(0, 0, 0, 0.4)',
    };
  } else if (homeThemeVariant === 'sky') {
    cardStyle = {
      background: 'linear-gradient(160deg, #0ea5e9 0%, #0284c7 55%, #0369a1 100%)',
      border: 'none',
      boxShadow:
        '0 5px 0 #075985, 0 12px 22px -2px rgba(2, 132, 199, 0.45), inset 0 2px 1.5px rgba(255, 255, 255, 0.5), inset 0 -2px 4px rgba(0, 0, 0, 0.18)',
    };
    ringColor = '#BAE6FD';
  } else if (homeThemeVariant === 'emerald') {
    cardStyle = {
      background: 'linear-gradient(160deg, #10b981 0%, #059669 55%, #047857 100%)',
      border: 'none',
      boxShadow:
        '0 5px 0 #065f46, 0 12px 22px -2px rgba(5, 150, 105, 0.45), inset 0 2px 1.5px rgba(255, 255, 255, 0.5), inset 0 -2px 4px rgba(0, 0, 0, 0.18)',
    };
    ringColor = '#A7F3D0';
  } else if (homeThemeVariant === 'burgundy') {
    cardStyle = {
      background: 'linear-gradient(160deg, #be123c 0%, #9f1239 55%, #881337 100%)',
      border: 'none',
      boxShadow:
        '0 5px 0 #4c0519, 0 12px 22px -2px rgba(136, 19, 55, 0.48), inset 0 2px 1.5px rgba(255, 255, 255, 0.45), inset 0 -2px 4px rgba(0, 0, 0, 0.22)',
    };
    ringColor = '#FECDD3';
  } else {
    cardStyle = {
      background: 'linear-gradient(160deg, #fbbf24 0%, #f59e0b 55%, #e08b08 100%)',
      border: 'none',
      boxShadow:
        '0 5px 0 #b45309, 0 12px 22px -2px rgba(217, 119, 6, 0.34), inset 0 2px 1.5px rgba(255, 255, 255, 0.62), inset 0 -2px 4px rgba(146, 64, 14, 0.14)',
    };
    ringColor = '#FEF08A';
    inner3DButtonStyle = {
      background: 'linear-gradient(160deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.16) 100%)',
      boxShadow:
        '0 2.5px 0 rgba(180, 83, 9, 0.32), 0 4px 8px rgba(180, 83, 9, 0.16), inset 0 1.5px 1px rgba(255, 255, 255, 0.55), inset 0 -1.5px 2px rgba(146, 64, 14, 0.12)',
    };
  }

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  const surahObj = SURAH_LIST.find((s) => s.number === surahNumber);
  const localizedSurahName = getSurahDisplayName(surahNumber, surahObj?.name, language);
  const surahLabel = `${tListen('surahPrefix', language)} ${localizedSurahName}`;
  const formattedElapsedTime = formatListenTime(currentTime, language);

  const {
    fabSize,
    edgeMargin,
    defaultCardWidth,
    width: viewportWidth,
    height: viewportHeight,
  } = metrics;

  const isHomePage = effectivePage === 'home';

  let containerStyle: React.CSSProperties;

  if (customPos) {
    const activeWidth = dragSizeRef.current?.width ?? defaultCardWidth;
    containerStyle = {
      position: 'fixed',
      left: `${customPos.x}px`,
      top: `${customPos.y}px`,
      width: `${activeWidth}px`,
      height: `${fabSize}px`,
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
    };
  } else if (isHomePage && fabCustomPos) {
    const { top: topInset, bottom: bottomInset } = getSafeInsets();
    const alignedTop = Math.round(
      Math.max(topInset, Math.min(viewportHeight - fabSize - bottomInset, fabCustomPos.y))
    );
    const fabCenterX = fabCustomPos.x + fabSize / 2;
    const rightSpace = viewportWidth - (fabCustomPos.x + fabSize + FAB_GAP_PX) - edgeMargin;
    const leftSpace = fabCustomPos.x - FAB_GAP_PX - edgeMargin;
    const placeRightOfFab =
      fabCenterX <= viewportWidth / 2
        ? rightSpace >= 170 || rightSpace >= leftSpace
        : leftSpace < 170 && rightSpace > leftSpace;

    containerStyle = {
      position: 'fixed',
      top: `${alignedTop}px`,
      height: `${fabSize}px`,
      ...(placeRightOfFab
        ? {
            left: `${Math.round(fabCustomPos.x + fabSize + FAB_GAP_PX)}px`,
            right: `${edgeMargin}px`,
          }
        : {
            left: `${edgeMargin}px`,
            right: `${Math.round(viewportWidth - fabCustomPos.x + FAB_GAP_PX)}px`,
          }),
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
    };
  } else if (isHomePage) {
    containerStyle = {
      position: 'fixed',
      bottom: 'calc(var(--app-bottom-clearance) + clamp(1rem, 2.5dvh, 1.5rem))',
      insetInlineStart: `${edgeMargin + fabSize + FAB_GAP_PX}px`,
      insetInlineEnd: `${edgeMargin}px`,
      height: `${fabSize}px`,
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
    };
  } else {
    containerStyle = {
      position: 'fixed',
      bottom: 'calc(var(--app-bottom-clearance) + clamp(1rem, 2.5dvh, 1.5rem))',
      left: 0,
      right: 0,
      marginLeft: 'auto',
      marginRight: 'auto',
      width: `${defaultCardWidth}px`,
      height: `${fabSize}px`,
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
    };
  }

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    action: FloatingActionType
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (Date.now() - lastGestureHandledAtRef.current < 500) {
      return;
    }
    lastGestureHandledAtRef.current = Date.now();
    triggerFloatingAction(action);
  };

  const controlBtnClass =
    'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 active:translate-y-[1.5px] active:scale-95 cursor-pointer outline-none';

  const floatingElement = (
    <div
      ref={containerRef}
      id="floating-listen-quran-btn"
      dir={dir}
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
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (Date.now() - lastGestureHandledAtRef.current < 500) {
          return;
        }
        lastGestureHandledAtRef.current = Date.now();
        stopFromFloating();
      }}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          e.stopPropagation();
          stopFromFloating();
        }
      }}
      style={containerStyle}
      className={`z-[9998] rounded-2xl flex items-center font-cairo transition-transform duration-150 ${
        isDragging
          ? 'scale-[1.03] cursor-grabbing ring-4 ring-amber-400/70'
          : 'cursor-pointer'
      }`}
    >
      {/* Subtle pulse halo while actively playing */}
      {isPlaying && !isPausedByInterruption && !isDragging && (
        <span
          className="absolute inset-0 rounded-2xl animate-pulse opacity-35 pointer-events-none"
          style={{ boxShadow: `0 0 0 3px ${ringColor}` }}
        />
      )}

      <div
        className="relative w-full h-full rounded-2xl flex items-center justify-between gap-2 px-2.5 sm:px-3 overflow-hidden"
        style={{ ...cardStyle, color: textColor }}
      >
        {/* Top 3D specular gloss edge */}
        <span
          className="absolute inset-x-2 top-[1px] h-[1px] rounded-full pointer-events-none opacity-60"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.15) 100%)',
          }}
        />

        {/* Surah Name + Bilingual Elapsed Time Counter */}
        <div
          className="flex items-center gap-1.5 min-w-0 flex-1 pointer-events-none"
          style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.28)' }}
        >
          <span className="text-xs sm:text-sm font-extrabold truncate leading-tight">
            {surahLabel}
          </span>
          <span className="text-xs sm:text-sm font-bold shrink-0 opacity-85 leading-tight">
            -
          </span>
          <span
            dir="ltr"
            className="text-xs sm:text-sm font-extrabold tabular-nums shrink-0 leading-tight"
          >
            {formattedElapsedTime}
          </span>
        </div>

        {/* 3D Playback Controls: Previous, Volume/Interrupted-Pause (stops & hides bar), Next */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-floating-action="prev"
            aria-label={tListen('previous', language)}
            title={tListen('previous', language)}
            onClick={(e) => handleButtonClick(e, 'prev')}
            className={controlBtnClass}
            style={inner3DButtonStyle}
          >
            {isRTL ? (
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
            ) : (
              <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
            )}
          </button>

          <button
            type="button"
            data-floating-action="toggle"
            aria-label={
              isPausedByInterruption
                ? 'إيقاف تلاوة القرآن المؤقتة'
                : 'إيقاف صوت تلاوة القرآن'
            }
            title={
              isPausedByInterruption
                ? 'إيقاف تلاوة القرآن المؤقتة'
                : 'إيقاف صوت تلاوة القرآن'
            }
            onClick={(e) => handleButtonClick(e, 'toggle')}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 active:translate-y-[1.5px] active:scale-95 cursor-pointer outline-none"
            style={{
              ...inner3DButtonStyle,
              background:
                isBlackTheme || isBlackGoldTheme || isNightMode
                  ? 'linear-gradient(160deg, #52525b 0%, #27272a 100%)'
                  : 'linear-gradient(160deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.18) 100%)',
            }}
          >
            {isLoading && !isPausedByInterruption ? (
              <Loader2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] animate-spin" />
            ) : isPausedByInterruption ? (
              <Pause className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-200" strokeWidth={2.5} />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.3} />
            )}
            {isPausedByInterruption && (
              <span className="absolute top-1 end-1 w-1.5 h-1.5 rounded-full bg-amber-300 shadow pointer-events-none" />
            )}
          </button>

          <button
            type="button"
            data-floating-action="next"
            aria-label={tListen('next', language)}
            title={tListen('next', language)}
            onClick={(e) => handleButtonClick(e, 'next')}
            className={controlBtnClass}
            style={inner3DButtonStyle}
          >
            {isRTL ? (
              <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
            ) : (
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Bottom track progress indicator */}
        <div
          className="absolute bottom-0 inset-x-0 h-[4px] app-3d-progress-track rounded-none pointer-events-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.22)' }}
        >
          <div
            className="h-full app-3d-progress-fill rounded-none transition-[width] duration-200"
            style={{
              width: `${(progress * 100).toFixed(2)}%`,
              backgroundColor: ringColor,
              backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 60%)',
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(floatingElement, document.body);
};

export default FloatingListenButton;
