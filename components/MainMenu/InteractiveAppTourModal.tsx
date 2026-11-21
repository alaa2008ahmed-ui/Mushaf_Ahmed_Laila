import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Sun,
  Moon,
  Languages,
  CheckCircle2,
  Sparkles,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  Info,
  Smartphone,
} from 'lucide-react';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useTheme, restoreHomeThemeDOMInstantly } from '../../context/ThemeContext';
import { APP_TOUR_SLIDES, TourSlide } from '../../data/appTourSlidesData';
import {
  captureRealAppTourSnapshots,
  downloadStandaloneTourHtml,
} from '../../utils/standaloneTourHtmlExport';
import { showGlobalAppToast } from '../../utils/appNotificationSettings';
import { registerBackInterceptor } from '../../hooks/useBackButton';

interface InteractiveAppTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHONE_SCREEN_WIDTH = 390;
const PHONE_SCREEN_HEIGHT = 780;
const PHONE_FRAME_WIDTH = 414;
const PHONE_FRAME_HEIGHT = 826;

function findPrimaryScrollContainer(root: HTMLElement, viewWin: Window): HTMLElement | null {
  const candidates: HTMLElement[] = [];
  const all = root.querySelectorAll<HTMLElement>(
    '#mushaf-content, main, .overflow-y-auto, [class*="overflow-y-auto"]'
  );
  all.forEach((el) => {
    const style = viewWin.getComputedStyle(el);
    const overflowY = style.overflowY;
    const isScrollableStyle = overflowY === 'auto' || overflowY === 'scroll';
    if (
      isScrollableStyle &&
      el.clientHeight >= 140 &&
      el.scrollHeight > el.clientHeight + 18
    ) {
      candidates.push(el);
    }
  });

  if (candidates.length === 0) {
    const docEl = root.ownerDocument?.documentElement;
    if (docEl && docEl.scrollHeight > viewWin.innerHeight + 18) {
      return docEl;
    }
    return null;
  }

  candidates.sort((a, b) => {
    const aPriority = a.id === 'mushaf-content' || a.tagName === 'MAIN' ? 10000 : 0;
    const bPriority = b.id === 'mushaf-content' || b.tagName === 'MAIN' ? 10000 : 0;
    return bPriority + b.clientHeight - (aPriority + a.clientHeight);
  });

  return candidates[0];
}

export const InteractiveAppTourModal: React.FC<InteractiveAppTourModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, setLanguage } = useLanguage();
  const { theme, themeKey, isNightMode, setNightModeActive, homeThemeVariant } = useTheme();
  const isEn = language === 'en';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressPct, setProgressPct] = useState(0);
  const [activeExportMode, setActiveExportMode] = useState<'full' | 'screen-only' | null>(null);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const isExportingHtml = activeExportMode !== null;
  const [showSlidesDrawer, setShowSlidesDrawer] = useState(false);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [phoneScale, setPhoneScale] = useState(0.75);

  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const [showMobileDetailsSheet, setShowMobileDetailsSheet] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const phoneSlotRef = useRef<HTMLDivElement | null>(null);
  const initialPrefsRef = useRef<{ lang: Language; night: boolean } | null>(null);
  const activeCloseHandlerRef = useRef<() => void>(() => {});
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const activeSlide: TourSlide = APP_TOUR_SLIDES[currentIndex] || APP_TOUR_SLIDES[0];

  const isSkyTheme = homeThemeVariant === 'sky';
  const isEmeraldTheme = homeThemeVariant === 'emerald';
  const isBurgundyTheme = homeThemeVariant === 'burgundy';
  const isBlackTheme =
    isNightMode ||
    themeKey === 'deep_black' ||
    themeKey === 'black_gold' ||
    theme?.bgColor === '#000000';

  const pageBgColor = isBlackTheme
    ? '#050505'
    : theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff'
    ? theme.bgColor
    : isSkyTheme
    ? '#F0F9FF'
    : isEmeraldTheme
    ? '#F0FDF4'
    : isBurgundyTheme
    ? '#FFF1F2'
    : '#FEF9C3';

  const themeAccentColor = isNightMode
    ? '#f59e0b'
    : isSkyTheme
    ? '#0284c7'
    : isEmeraldTheme
    ? '#047857'
    : isBurgundyTheme
    ? '#881337'
    : theme.palette?.[0] || '#ca8a04';

  // Responsive breakpoint listener (<1024px uses dedicated mobile layout; >=1024px preserves desktop layout)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    const syncViewport = () => {
      const mobile = mq.matches;
      setIsMobileViewport(mobile);
      if (!mobile) {
        setIsMobileFullscreen(false);
        setShowFullscreenControls(false);
        setShowMobileDetailsSheet(false);
      }
    };
    syncViewport();
    mq.addEventListener('change', syncViewport);
    return () => mq.removeEventListener('change', syncViewport);
  }, []);

  // Fixed preview iframe URL built once per modal open; slide transitions use instant postMessage
  const iframeSrc = useMemo(() => {
    if (!isOpen || typeof window === 'undefined') return '';
    const firstSlide = APP_TOUR_SLIDES[0];
    const params = new URLSearchParams();
    params.set('tourPreview', '1');
    params.set('tourPage', firstSlide?.page || 'home');
    params.set('tourLang', language);
    params.set('tourNight', isNightMode ? '1' : '0');
    params.set('tourVariant', homeThemeVariant || 'gold');
    return `${window.location.pathname}?${params.toString()}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Capture user's original language & night mode when opening, restore cleanly on close
  useEffect(() => {
    if (isOpen) {
      initialPrefsRef.current = { lang: language, night: isNightMode };
      setCurrentIndex(0);
      setIsPlaying(true);
      setProgressPct(0);
      setShowSlidesDrawer(false);
      setIsMobileFullscreen(false);
      setShowFullscreenControls(false);
      setShowMobileDetailsSheet(false);
      setIsIframeReady(false);
      document.body.classList.add('tour-showcase-open');
    } else {
      document.body.classList.remove('tour-showcase-open');
      setIsMobileFullscreen(false);
      setShowFullscreenControls(false);
      setShowMobileDetailsSheet(false);
      setIsIframeReady(false);
    }
    return () => {
      document.body.classList.remove('tour-showcase-open');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCloseTour = useCallback(() => {
    setIsPlaying(false);
    const saved = initialPrefsRef.current;
    if (saved) {
      if (saved.lang !== language) {
        setLanguage(saved.lang);
      }
      if (saved.night !== isNightMode) {
        setNightModeActive(saved.night);
      }
      initialPrefsRef.current = null;
    }
    restoreHomeThemeDOMInstantly();
    onClose();
  }, [language, isNightMode, setLanguage, setNightModeActive, onClose]);

  activeCloseHandlerRef.current = handleCloseTour;

  // Register hardware/browser Back interceptor while tour modal is open
  useEffect(() => {
    if (!isOpen) return;
    let unregister: (() => void) | null = null;
    const timer = window.setTimeout(() => {
      unregister = registerBackInterceptor(() => {
        if (showSlidesDrawer) {
          setShowSlidesDrawer(false);
          return true;
        }
        if (showMobileDetailsSheet) {
          setShowMobileDetailsSheet(false);
          return true;
        }
        if (isMobileFullscreen) {
          setIsMobileFullscreen(false);
          setShowFullscreenControls(false);
          return true;
        }
        activeCloseHandlerRef.current();
        return true;
      });
    }, 80);

    return () => {
      window.clearTimeout(timer);
      if (unregister) unregister();
    };
  }, [isOpen, currentIndex, showSlidesDrawer, showMobileDetailsSheet, isMobileFullscreen]);

  // Measure available phone slot with ResizeObserver to scale the 390x780 mobile frame cleanly
  useEffect(() => {
    if (!isOpen || isMobileFullscreen) return;
    const el = phoneSlotRef.current;
    if (!el) return;

    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const cs = window.getComputedStyle(el);
      const cssPadX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const cssPadY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      const padW = cssPadX + (isMobileViewport ? 6 : 12);
      const padH = cssPadY + (isMobileViewport ? 8 : 12);
      const availW = Math.max(180, rect.width - padW);
      const availH = Math.max(220, rect.height - padH);
      const next = Math.min(1, availW / PHONE_FRAME_WIDTH, availH / PHONE_FRAME_HEIGHT);
      setPhoneScale(Math.max(0.32, Number(next.toFixed(4))));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    window.addEventListener('resize', updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [isOpen, isMobileViewport, isMobileFullscreen]);

  const syncIframeState = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage(
        {
          type: 'TOUR_SYNC_STATE',
          page: activeSlide.page,
          navParams: activeSlide.navParams ?? null,
          language,
          isNightMode,
          themeVariant: homeThemeVariant,
        },
        window.location.origin
      );
    } catch {}
  }, [activeSlide, language, isNightMode, homeThemeVariant]);

  // Listen for iframe readiness signal
  useEffect(() => {
    if (!isOpen) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === 'TOUR_PREVIEW_READY') {
        setIsIframeReady(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isOpen]);

  // Push slide/language/theme changes immediately into the live mobile iframe
  useEffect(() => {
    if (!isOpen || !isIframeReady) return;
    syncIframeState();
  }, [isOpen, isIframeReady, syncIframeState]);

  // Pause auto-scroll on manual scroll inside iframe & toggle fullscreen overlay controls on screen tap
  useEffect(() => {
    if (!isOpen || !isIframeReady) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    let downInfo: { x: number; y: number; t: number } | null = null;

    const pauseFromUser = () => {
      if (isPlayingRef.current) {
        setIsPlaying(false);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      downInfo = { x: e.clientX, y: e.clientY, t: Date.now() };
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!downInfo || !isMobileFullscreen) {
        downInfo = null;
        return;
      }
      const dist = Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y);
      const elapsed = Date.now() - downInfo.t;
      downInfo = null;
      if (dist < 12 && elapsed < 450) {
        setShowFullscreenControls((prev) => !prev);
      }
    };

    try {
      doc.addEventListener('wheel', pauseFromUser, { passive: true });
      doc.addEventListener('touchmove', pauseFromUser, { passive: true });
      doc.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
      doc.addEventListener('pointerup', handlePointerUp, { capture: true, passive: true });
    } catch {}

    return () => {
      try {
        doc.removeEventListener('wheel', pauseFromUser);
        doc.removeEventListener('touchmove', pauseFromUser);
        doc.removeEventListener('pointerdown', handlePointerDown, { capture: true });
        doc.removeEventListener('pointerup', handlePointerUp, { capture: true });
      } catch {}
    };
  }, [isOpen, isIframeReady, currentIndex, isMobileFullscreen]);

  const goToSlide = useCallback((idx: number) => {
    const normalized = ((idx % APP_TOUR_SLIDES.length) + APP_TOUR_SLIDES.length) % APP_TOUR_SLIDES.length;
    setCurrentIndex(normalized);
    setProgressPct(0);
  }, []);

  const handlePrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const handleNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  // Smooth Auto-Scroll + Auto-Advance engine operating inside the same-origin mobile iframe
  useEffect(() => {
    if (!isOpen || !isPlaying || !isIframeReady) return;

    let rafId: number | null = null;
    let settleTimer: number | null = null;
    let dwellEndTimer: number | null = null;
    let cancelled = false;

    setProgressPct(0);

    settleTimer = window.setTimeout(() => {
      if (cancelled) return;
      const doc = iframeRef.current?.contentDocument;
      const viewWin = iframeRef.current?.contentWindow;
      const scroller = doc?.body && viewWin ? findPrimaryScrollContainer(doc.body, viewWin) : null;

      if (scroller) {
        scroller.scrollTop = 0;
      }

      const clientH = scroller
        ? scroller === doc?.documentElement
          ? viewWin?.innerHeight || scroller.clientHeight
          : scroller.clientHeight
        : 0;
      const maxAvail = scroller ? Math.max(0, scroller.scrollHeight - clientH) : 0;
      const hasVerticalScroll = maxAvail > 18;
      const travelDistance = hasVerticalScroll ? Math.min(maxAvail, 1600) : 0;
      const durationMs = hasVerticalScroll
        ? Math.min(6200, Math.max(3800, Math.round(travelDistance * 3.8)))
        : 4500;
      const startTime = performance.now();

      const animate = (now: number) => {
        if (cancelled) return;
        const elapsed = now - startTime;
        const rawT = Math.min(1, elapsed / durationMs);
        const easedT = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

        setProgressPct(Math.round(rawT * 100));
        if (scroller && travelDistance > 0) {
          scroller.scrollTop = travelDistance * easedT;
        }

        if (rawT < 1) {
          rafId = requestAnimationFrame(animate);
        } else {
          dwellEndTimer = window.setTimeout(() => {
            if (cancelled) return;
            setCurrentIndex((prev) => (prev + 1) % APP_TOUR_SLIDES.length);
          }, 950);
        }
      };

      rafId = requestAnimationFrame(animate);
    }, 850);

    return () => {
      cancelled = true;
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      if (dwellEndTimer !== null) window.clearTimeout(dwellEndTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isOpen, isPlaying, isIframeReady, currentIndex, language, isNightMode]);

  const handleManualInteractionPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const handleExportHtml = useCallback(async (mode: 'full' | 'screen-only' = 'full') => {
    if (isExportingHtml) return;
    const iframe = iframeRef.current;
    if (!iframe || !isIframeReady) {
      showGlobalAppToast(
        isEn
          ? 'Please wait a moment for the live preview to load.'
          : 'يرجى الانتظار لحظة حتى تكتمل تهيئة المعاينة.'
      );
      return;
    }

    const wasPlaying = isPlaying;
    setIsPlaying(false);
    setActiveExportMode(mode);
    setExportProgress({ current: 0, total: APP_TOUR_SLIDES.length });

    try {
      const capturedOptions = await captureRealAppTourSnapshots({
        slides: APP_TOUR_SLIDES,
        iframe,
        initialLang: language,
        initialNightMode: isNightMode,
        themeVariant: homeThemeVariant,
        onProgress: (current, total) => setExportProgress({ current, total }),
      });
      await downloadStandaloneTourHtml({ ...capturedOptions, exportMode: mode });
      showGlobalAppToast(
        mode === 'screen-only'
          ? isEn
            ? 'Frameless phone screen-only HTML downloaded!'
            : 'تم تصدير ملف HTML لشاشة الهاتف فقط بدون إطار بنجاح!'
          : isEn
          ? 'Standalone interactive HTML showcase downloaded!'
          : 'تم تصدير العرض التفاعلي كملف HTML مطابق للتطبيق بنجاح!'
      );
    } catch (err) {
      console.error('Standalone HTML export failed:', err);
      showGlobalAppToast(
        isEn
          ? 'Could not export HTML file. Please try again.'
          : 'تعذر تصدير ملف HTML، يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setExportProgress(null);
      setActiveExportMode(null);
      syncIframeState();
      if (wasPlaying) {
        setIsPlaying(true);
      }
    }
  }, [isExportingHtml, isIframeReady, isPlaying, language, isNightMode, homeThemeVariant, isEn, syncIframeState]);

  if (!isOpen) return null;

  const featuresList = isEn ? activeSlide.featuresEn : activeSlide.featuresAr;
  const activeSlideTitle = isEn ? activeSlide.titleEn : activeSlide.titleAr;
  const activeSlideCategory = isEn ? activeSlide.categoryEn : activeSlide.categoryAr;

  const renderSpotlightBody = (compact = false) => (
    <>
      {/* Title & Icon Header */}
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl golden-3d-card flex items-center justify-center shrink-0">
          <i
            className={`fa-solid ${activeSlide.icon} text-xl sm:text-2xl`}
            style={{ color: isBlackTheme ? '#f59e0b' : activeSlide.accentColor }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-xs font-black tracking-wide mb-0.5"
            style={{ color: isBlackTheme ? '#fbbf24' : themeAccentColor }}
          >
            {activeSlideCategory}
          </div>
          <h2 className="text-lg sm:text-2xl font-black leading-snug">
            {activeSlideTitle}
          </h2>
        </div>
      </div>

      {/* Concise Powerful Description */}
      <p className="text-sm sm:text-base font-bold leading-relaxed opacity-85">
        {isEn ? activeSlide.descriptionEn : activeSlide.descriptionAr}
      </p>

      <div className="app-3d-divider" />

      {/* Top 3 Practical Features */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-black" style={{ color: isBlackTheme ? '#fbbf24' : themeAccentColor }}>
          <Sparkles size={16} />
          <span>
            {isEn ? 'Top 3 Features on This Screen' : 'أبرز ٣ مميزات عملية في هذه الصفحة'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {featuresList.map((feature, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-3.5 rounded-2xl white-3d-card-btn flex items-start gap-3"
            >
              <CheckCircle2
                size={18}
                strokeWidth={2.4}
                className="shrink-0 mt-0.5"
                style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }}
              />
              <span className="text-xs sm:text-sm font-extrabold leading-relaxed">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Slide Quick Strip */}
      <div className={compact ? 'pt-1' : 'pt-1 hidden sm:block'}>
        <div className="flex items-center justify-between text-xs font-extrabold opacity-75 mb-2">
          <span>
            {isEn ? 'Quick Screen Navigation' : 'التنقل السريع بين شاشات التطبيق'}
          </span>
          <span>
            {currentIndex + 1} / {APP_TOUR_SLIDES.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {APP_TOUR_SLIDES.map((s, idx) => {
            const selected = idx === currentIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  goToSlide(idx);
                  if (compact) setShowMobileDetailsSheet(false);
                }}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
                  selected ? 'golden-3d-pill-btn' : 'white-3d-card-btn'
                }`}
              >
                <span className="opacity-75">{idx + 1}.</span>
                <span className="whitespace-nowrap">{isEn ? s.titleEn : s.titleAr}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div
      id="interactive-app-tour-modal"
      className="fixed inset-0 z-[9999999] flex flex-col font-cairo select-none overflow-hidden"
      style={{
        backgroundColor: pageBgColor,
        color: isBlackTheme ? '#FFFFFF' : '#1E1B18',
        paddingTop: isMobileFullscreen ? '0px' : 'var(--app-safe-top, 0px)',
        paddingBottom: isMobileFullscreen ? '0px' : 'var(--app-safe-bottom, 0px)',
        paddingLeft: isMobileFullscreen ? '0px' : 'env(safe-area-inset-left, 0px)',
        paddingRight: isMobileFullscreen ? '0px' : 'env(safe-area-inset-right, 0px)',
      }}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {/* ==================== TOP HEADER BAR ==================== */}
      {isMobileViewport ? (
        /* MOBILE TOP BAR: Strictly ONE clean single row */
        !isMobileFullscreen && (
          <header className="shrink-0 w-full px-3 pt-2.5 pb-1 z-30">
            <div className="w-full px-2.5 py-2 rounded-2xl white-3d-container-card flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCloseTour}
                className="w-9 h-9 rounded-xl white-3d-card-btn flex items-center justify-center shrink-0 cursor-pointer"
                title={isEn ? 'Close Tour' : 'إغلاق العرض والعودة للإعدادات'}
                aria-label={isEn ? 'Close Tour' : 'إغلاق'}
              >
                <X size={18} strokeWidth={2.5} />
              </button>

              <div
                className="min-w-0 flex-1 text-xs sm:text-sm font-black truncate"
                style={{ color: isBlackTheme ? '#fbbf24' : themeAccentColor }}
                title={activeSlideTitle}
              >
                {currentIndex + 1}. {activeSlideTitle}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setNightModeActive(!isNightMode)}
                  className="w-9 h-9 rounded-xl white-3d-card-btn flex items-center justify-center cursor-pointer"
                  title={isNightMode ? (isEn ? 'Day Mode' : 'الوضع النهاري') : isEn ? 'Night Mode' : 'الوضع الليلي'}
                  aria-label={isNightMode ? (isEn ? 'Day Mode' : 'الوضع النهاري') : isEn ? 'Night Mode' : 'الوضع الليلي'}
                >
                  {isNightMode ? (
                    <Sun size={15} className="text-amber-400" />
                  ) : (
                    <Moon size={15} style={{ color: themeAccentColor }} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSlidesDrawer((v) => !v)}
                  className="h-9 px-2.5 rounded-xl white-3d-card-btn flex items-center gap-1 text-[11px] font-black cursor-pointer shrink-0"
                  title={isEn ? 'Jump to Page' : 'فهرس الصفحات'}
                >
                  <Layers size={14} style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
                  <span>
                    {currentIndex + 1}/{APP_TOUR_SLIDES.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Thin Progress Bar */}
            <div className="w-full mt-1.5 px-0.5">
              <div className="w-full h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${isPlaying ? progressPct : 100}%`,
                    backgroundColor: isBlackTheme ? '#f59e0b' : themeAccentColor,
                    opacity: isPlaying ? 1 : 0.45,
                  }}
                />
              </div>
            </div>
          </header>
        )
      ) : (
        /* DESKTOP TOP BAR: Unchanged browser layout */
        <header className="shrink-0 w-full px-3 sm:px-5 pt-2.5 pb-1.5 z-30">
          <div className="max-w-7xl mx-auto p-2.5 sm:p-3 rounded-2xl white-3d-container-card flex flex-col xl:flex-row xl:items-center justify-between gap-2">
            <div className="flex items-center justify-between xl:justify-start gap-2.5 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={handleCloseTour}
                  className="w-10 h-10 rounded-xl white-3d-card-btn flex items-center justify-center shrink-0 cursor-pointer"
                  title={isEn ? 'Close Tour' : 'إغلاق العرض والعودة للإعدادات'}
                  aria-label={isEn ? 'Close Tour' : 'إغلاق'}
                >
                  <X size={19} strokeWidth={2.5} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-extrabold opacity-75 truncate">
                    {isEn
                      ? `Interactive App Tour • ${activeSlideCategory}`
                      : `الجولة التعريفية التلقائية • ${activeSlideCategory}`}
                  </div>
                  <div
                    className="text-sm sm:text-base font-black truncate leading-snug"
                    style={{ color: isBlackTheme ? '#fbbf24' : themeAccentColor }}
                    title={activeSlideTitle}
                  >
                    {currentIndex + 1}. {activeSlideTitle}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSlidesDrawer((v) => !v)}
                className="min-h-[40px] px-3 py-1.5 rounded-xl white-3d-card-btn flex items-center gap-1.5 text-xs font-black cursor-pointer shrink-0"
                title={isEn ? 'Jump to Page' : 'فهرس الصفحات'}
              >
                <Layers size={15} style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
                <span>
                  {currentIndex + 1} / {APP_TOUR_SLIDES.length}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between xl:justify-end gap-1.5 sm:gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-xl white-3d-card-btn flex items-center justify-center cursor-pointer"
                  title={isEn ? 'Previous Screen' : 'الشاشة السابقة'}
                  aria-label={isEn ? 'Previous' : 'السابق'}
                >
                  {isEn ? <ChevronLeft size={19} /> : <ChevronRight size={19} />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="min-h-[40px] px-3.5 sm:px-4 py-1.5 rounded-full golden-3d-pill-btn text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer"
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                  <span>
                    {isPlaying
                      ? isEn
                        ? 'Pause'
                        : 'إيقاف مؤقت'
                      : isEn
                      ? 'Auto Play'
                      : 'تشغيل تلقائي'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-10 h-10 rounded-xl white-3d-card-btn flex items-center justify-center cursor-pointer"
                  title={isEn ? 'Next Screen' : 'الشاشة التالية'}
                  aria-label={isEn ? 'Next' : 'التالي'}
                >
                  {isEn ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLanguage(isEn ? 'ar' : 'en')}
                  className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl white-3d-card-btn text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  title={isEn ? 'Switch to Arabic' : 'التبديل للإنجليزية'}
                >
                  <Languages size={15} style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
                  <span>{isEn ? 'عربي' : 'EN'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNightModeActive(!isNightMode)}
                  className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl white-3d-card-btn text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  title={isNightMode ? (isEn ? 'Day Mode' : 'الوضع النهاري') : isEn ? 'Night Mode' : 'الوضع الليلي'}
                >
                  {isNightMode ? (
                    <Sun size={15} className="text-amber-400" />
                  ) : (
                    <Moon size={15} style={{ color: themeAccentColor }} />
                  )}
                  <span className="hidden sm:inline">
                    {isNightMode ? (isEn ? 'Day' : 'نهاري') : isEn ? 'Night' : 'ليلي'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isExportingHtml}
                  onClick={() => handleExportHtml('screen-only')}
                  className="min-h-[40px] px-2.5 sm:px-3.5 py-1.5 rounded-xl white-3d-card-btn text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                  title={
                    isEn
                      ? 'Export Phone Screen Only HTML (No Bezel)'
                      : 'تصدير ملف HTML لشاشة الهاتف فقط بدون إطار'
                  }
                >
                  {activeExportMode === 'screen-only' ? (
                    <Loader2 size={15} className="animate-spin" style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
                  ) : (
                    <Smartphone size={15} style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
                  )}
                  <span className="hidden md:inline">
                    {activeExportMode === 'screen-only' && exportProgress
                      ? `${exportProgress.current}/${exportProgress.total}`
                      : isEn
                      ? 'Screen Only HTML'
                      : 'شاشة الهاتف HTML'}
                  </span>
                  <span className="md:hidden">
                    {activeExportMode === 'screen-only' && exportProgress
                      ? `${exportProgress.current}/${exportProgress.total}`
                      : isEn
                      ? 'Screen'
                      : 'الشاشة'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isExportingHtml}
                  onClick={() => handleExportHtml('full')}
                  className="min-h-[40px] px-3 sm:px-4 py-1.5 rounded-xl golden-3d-pill-btn text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                  title={isEn ? 'Download Standalone HTML' : 'تصدير العرض كملف HTML مستقل'}
                >
                  {activeExportMode === 'full' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  <span className="hidden md:inline">
                    {activeExportMode === 'full' && exportProgress
                      ? `${exportProgress.current}/${exportProgress.total}`
                      : isEn
                      ? 'Export HTML'
                      : 'تصدير HTML مستقل'}
                  </span>
                  <span className="md:hidden">
                    {activeExportMode === 'full' && exportProgress ? `${exportProgress.current}/${exportProgress.total}` : 'HTML'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Auto-Tour Scroll Progress Indicator */}
          <div className="max-w-7xl mx-auto mt-1.5 px-1">
            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${isPlaying ? progressPct : 100}%`,
                  backgroundColor: isBlackTheme ? '#f59e0b' : themeAccentColor,
                  opacity: isPlaying ? 1 : 0.45,
                }}
              />
            </div>
          </div>
        </header>
      )}

      {/* ==================== ALL SLIDES SELECTOR DRAWER ==================== */}
      {showSlidesDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center px-4"
          style={{
            paddingTop: 'calc(var(--app-safe-top, 0px) + 4rem)',
            paddingBottom: 'calc(var(--app-safe-bottom, 0px) + 1rem)',
            paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
          }}
          onClick={() => setShowSlidesDrawer(false)}
        >
          <div
            className="w-full max-w-3xl max-h-full overflow-y-auto p-4 sm:p-5 rounded-3xl white-3d-container-card space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-black" style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }}>
                {isEn
                  ? `All App Screens (${APP_TOUR_SLIDES.length})`
                  : `جميع صفحات التطبيق (${APP_TOUR_SLIDES.length} صفحة)`}
              </h3>
              <button
                type="button"
                onClick={() => setShowSlidesDrawer(false)}
                className="w-9 h-9 rounded-full white-3d-card-btn flex items-center justify-center cursor-pointer"
                aria-label={isEn ? 'Close' : 'إغلاق'}
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {APP_TOUR_SLIDES.map((s, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      goToSlide(idx);
                      setShowSlidesDrawer(false);
                    }}
                    className={`p-3 rounded-2xl text-start flex items-center gap-2.5 text-xs font-black cursor-pointer transition-all ${
                      isSelected ? 'golden-3d-pill-btn' : 'white-3d-card-btn'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-black/10 dark:bg-white/15 flex items-center justify-center shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="truncate">{isEn ? s.titleEn : s.titleAr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MAIN STAGE ==================== */}
      {isMobileViewport ? (
        /* ---------- DEDICATED MOBILE STAGE ---------- */
        <main className="flex-1 min-h-0 w-full relative flex flex-col items-center justify-between px-3 pb-3 pt-1 overflow-hidden">
          {/* Phone Container (Scales smoothly in normal view; expands edge-to-edge on tap in Fullscreen) */}
          <section
            ref={phoneSlotRef}
            className={
              isMobileFullscreen
                ? 'fixed inset-0 z-40 flex items-center justify-center bg-black'
                : 'flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden pb-[4.5rem]'
            }
            aria-label={isEn ? 'Live Application Screen' : 'شاشة التطبيق الحية'}
          >
            <div
              dir="ltr"
              className={isMobileFullscreen ? 'w-full h-full relative' : 'relative shrink-0'}
              style={
                isMobileFullscreen
                  ? undefined
                  : {
                      width: `${Math.round(PHONE_FRAME_WIDTH * phoneScale)}px`,
                      height: `${Math.round(PHONE_FRAME_HEIGHT * phoneScale)}px`,
                    }
              }
              onWheel={handleManualInteractionPause}
              onTouchStart={handleManualInteractionPause}
            >
              <div
                className={
                  isMobileFullscreen
                    ? 'w-full h-full flex flex-col'
                    : 'p-3 rounded-[2.6rem] shadow-2xl flex flex-col relative'
                }
                style={
                  isMobileFullscreen
                    ? undefined
                    : {
                        width: `${PHONE_FRAME_WIDTH}px`,
                        height: `${PHONE_FRAME_HEIGHT}px`,
                        transform: `scale(${phoneScale})`,
                        transformOrigin: 'top left',
                        background: isBlackTheme
                          ? 'linear-gradient(145deg, #27272a 0%, #09090b 100%)'
                          : 'linear-gradient(145deg, #334155 0%, #0f172a 100%)',
                        boxShadow:
                          '0 24px 48px -12px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
                      }
                }
              >
                {/* Speaker Notch (hidden in Fullscreen) */}
                {!isMobileFullscreen && (
                  <div className="shrink-0 w-28 h-4 mx-auto mb-2 rounded-full bg-black/90 flex items-center justify-center gap-2">
                    <span className="w-9 h-1 rounded-full bg-white/15" />
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400/60" />
                  </div>
                )}

                {/* Live Iframe Container */}
                <div
                  className={
                    isMobileFullscreen
                      ? 'relative w-full h-full overflow-hidden bg-white dark:bg-black'
                      : 'relative rounded-[1.9rem] overflow-hidden bg-white dark:bg-black border border-white/15'
                  }
                  style={
                    isMobileFullscreen
                      ? undefined
                      : {
                          width: `${PHONE_SCREEN_WIDTH}px`,
                          height: `${PHONE_SCREEN_HEIGHT}px`,
                        }
                  }
                >
                  {iframeSrc && (
                    <iframe
                      ref={iframeRef}
                      src={iframeSrc}
                      title={isEn ? 'Interactive Live App Preview' : 'معاينة التطبيق الحية'}
                      onLoad={() => {
                        setIsIframeReady(true);
                        syncIframeState();
                      }}
                      style={{
                        width: isMobileFullscreen ? '100%' : `${PHONE_SCREEN_WIDTH}px`,
                        height: isMobileFullscreen ? '100%' : `${PHONE_SCREEN_HEIGHT}px`,
                        border: 'none',
                        display: 'block',
                        backgroundColor: isBlackTheme ? '#000000' : '#ffffff',
                      }}
                    />
                  )}

                  {/* Tap-to-Expand Transparent Layer in Compact Mobile View */}
                  {!isMobileFullscreen && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileFullscreen(true);
                        setShowFullscreenControls(false);
                      }}
                      aria-label={isEn ? 'Tap phone to expand full screen' : 'اضغط للتكبير ملء الشاشة'}
                      className="absolute inset-0 z-10 bg-transparent cursor-pointer flex items-end justify-center pb-3.5"
                    >
                      <span className="px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-black flex items-center gap-1.5 shadow-lg border border-white/15">
                        <Maximize2 size={13} />
                        <span>{isEn ? 'Tap to Full Screen' : 'اضغط للتكبير بكامل الشاشة'}</span>
                      </span>
                    </button>
                  )}

                  {!isIframeReady && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/20 backdrop-blur-xs">
                      <Loader2 size={28} className="animate-spin text-amber-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </section>

          {/* ---------- MOBILE FLOATING BOTTOM CONTROLS (Single unified pill card) ---------- */}
          {(!isMobileFullscreen || showFullscreenControls) && (
          <div
            className="fixed inset-x-3 z-50 flex items-center justify-center pointer-events-none"
            style={{
              bottom: 'calc(0.75rem + var(--app-safe-bottom, 0px))',
              paddingLeft: 'env(safe-area-inset-left, 0px)',
              paddingRight: 'env(safe-area-inset-right, 0px)',
            }}
            dir={isEn ? 'ltr' : 'rtl'}
          >
            {/* Unified Floating Pill Dock: Prev / Play-Pause / Next / Language / Minimize (when fullscreen) / Details */}
            <div className="pointer-events-auto w-full max-w-md p-1.5 rounded-full white-3d-container-card backdrop-blur-md shadow-2xl flex items-center justify-around gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-10 h-10 rounded-full white-3d-card-btn flex items-center justify-center shrink-0 cursor-pointer"
                title={isEn ? 'Previous Screen' : 'السابق'}
                aria-label={isEn ? 'Previous Screen' : 'السابق'}
              >
                {isEn ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="w-10 h-10 rounded-full golden-3d-pill-btn flex items-center justify-center shrink-0 cursor-pointer"
                title={isPlaying ? (isEn ? 'Pause' : 'إيقاف') : isEn ? 'Play' : 'تشغيل'}
                aria-label={isPlaying ? (isEn ? 'Pause' : 'إيقاف') : isEn ? 'Play' : 'تشغيل'}
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} />}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="w-10 h-10 rounded-full white-3d-card-btn flex items-center justify-center shrink-0 cursor-pointer"
                title={isEn ? 'Next Screen' : 'التالي'}
                aria-label={isEn ? 'Next Screen' : 'التالي'}
              >
                {isEn ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage(isEn ? 'ar' : 'en')}
                className="w-10 h-10 rounded-full white-3d-card-btn flex items-center justify-center shrink-0 cursor-pointer"
                title={isEn ? 'Switch to Arabic' : 'تبديل اللغة'}
                aria-label={isEn ? 'Switch Language' : 'تبديل اللغة'}
              >
                <Languages size={16} style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
              </button>

              {isMobileFullscreen && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileFullscreen(false);
                    setShowFullscreenControls(false);
                  }}
                  className="w-10 h-10 rounded-full white-3d-card-btn flex items-center justify-center shrink-0 cursor-pointer"
                  title={isEn ? 'Exit Full Screen' : 'تصغير الشاشة'}
                  aria-label={isEn ? 'Exit Full Screen' : 'تصغير الشاشة'}
                >
                  <Minimize2 size={16} style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowMobileDetailsSheet(true)}
                className="w-10 h-10 rounded-full golden-3d-pill-btn flex items-center justify-center shrink-0 cursor-pointer"
                title={isEn ? 'Page Details & Features' : 'بيانات ومميزات الصفحة'}
                aria-label={isEn ? 'Page Details' : 'تفاصيل الصفحة'}
              >
                <Info size={18} />
              </button>
            </div>
          </div>
          )}

          {/* ---------- MOBILE HIDDEN DETAILS BOTTOM SHEET MODAL ---------- */}
          {showMobileDetailsSheet && (
            <div
              className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-xs flex items-end justify-center"
              style={{
                paddingTop: 'calc(var(--app-safe-top, 0px) + 1rem)',
                paddingLeft: 'env(safe-area-inset-left, 0px)',
                paddingRight: 'env(safe-area-inset-right, 0px)',
              }}
              onClick={() => setShowMobileDetailsSheet(false)}
            >
              <div
                className="w-full max-w-lg max-h-full rounded-t-3xl white-3d-container-card p-4 flex flex-col gap-3 overflow-y-auto no-scrollbar modal-sheet-safe-bottom shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2 text-xs font-black opacity-80">
                    <Sparkles size={15} style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
                    <span>
                      {isEn ? 'Screen Info & Tools' : 'تفاصيل الصفحة وأدوات العرض'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isExportingHtml}
                      onClick={() => handleExportHtml('screen-only')}
                      className="h-9 px-2.5 rounded-xl white-3d-card-btn text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                      title={
                        isEn
                          ? 'Export Phone Screen Only HTML (No Bezel)'
                          : 'تصدير ملف HTML لشاشة الهاتف فقط بدون إطار'
                      }
                    >
                      {activeExportMode === 'screen-only' ? (
                        <Loader2 size={14} className="animate-spin" style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
                      ) : (
                        <Smartphone size={14} style={{ color: isBlackTheme ? '#f59e0b' : themeAccentColor }} />
                      )}
                      <span>
                        {activeExportMode === 'screen-only' && exportProgress
                          ? `${exportProgress.current}/${exportProgress.total}`
                          : isEn
                          ? 'Screen HTML'
                          : 'الشاشة HTML'}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={isExportingHtml}
                      onClick={() => handleExportHtml('full')}
                      className="h-9 px-3 rounded-xl golden-3d-pill-btn text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                      title={isEn ? 'Download Standalone HTML' : 'تصدير العرض كملف HTML مستقل'}
                    >
                      {activeExportMode === 'full' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      <span>
                        {activeExportMode === 'full' && exportProgress ? `${exportProgress.current}/${exportProgress.total}` : 'HTML'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileDetailsSheet(false);
                        setIsMobileFullscreen((v) => !v);
                      }}
                      className="w-9 h-9 rounded-xl white-3d-card-btn flex items-center justify-center cursor-pointer"
                      title={isMobileFullscreen ? (isEn ? 'Shrink' : 'تصغير') : isEn ? 'Full Screen' : 'ملء الشاشة'}
                    >
                      {isMobileFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMobileDetailsSheet(false)}
                      className="w-9 h-9 rounded-full white-3d-card-btn flex items-center justify-center cursor-pointer"
                      aria-label={isEn ? 'Close' : 'إغلاق'}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {renderSpotlightBody(true)}
              </div>
            </div>
          )}
        </main>
      ) : (
        /* ---------- DESKTOP / BROWSER STAGE (UNCHANGED) ---------- */
        <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-3 sm:px-6 pb-3 pt-1 grid grid-cols-1 lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)] gap-3 sm:gap-5 items-stretch overflow-y-auto lg:overflow-hidden no-scrollbar">
          {/* Live Real-UI Phone Frame (True 390px mobile viewport) */}
          <section
            ref={phoneSlotRef}
            className="flex items-center justify-center min-h-[420px] sm:min-h-[500px] lg:min-h-0 h-full overflow-hidden"
            aria-label={isEn ? 'Live Application Screen' : 'شاشة التطبيق الحية'}
          >
            <div
              dir="ltr"
              style={{
                width: `${Math.round(PHONE_FRAME_WIDTH * phoneScale)}px`,
                height: `${Math.round(PHONE_FRAME_HEIGHT * phoneScale)}px`,
                position: 'relative',
                flexShrink: 0,
              }}
              onWheel={handleManualInteractionPause}
              onTouchStart={handleManualInteractionPause}
            >
              <div
                className="p-3 rounded-[2.6rem] shadow-2xl flex flex-col"
                style={{
                  width: `${PHONE_FRAME_WIDTH}px`,
                  height: `${PHONE_FRAME_HEIGHT}px`,
                  transform: `scale(${phoneScale})`,
                  transformOrigin: 'top left',
                  background: isBlackTheme
                    ? 'linear-gradient(145deg, #27272a 0%, #09090b 100%)'
                    : 'linear-gradient(145deg, #334155 0%, #0f172a 100%)',
                  boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
                }}
              >
                {/* Speaker Notch */}
                <div className="shrink-0 w-28 h-4 mx-auto mb-2 rounded-full bg-black/90 flex items-center justify-center gap-2">
                  <span className="w-9 h-1 rounded-full bg-white/15" />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400/60" />
                </div>

                {/* Isolated 390x780 Live App Iframe */}
                <div
                  className="relative rounded-[1.9rem] overflow-hidden bg-white dark:bg-black border border-white/15"
                  style={{
                    width: `${PHONE_SCREEN_WIDTH}px`,
                    height: `${PHONE_SCREEN_HEIGHT}px`,
                  }}
                >
                  {iframeSrc && (
                    <iframe
                      ref={iframeRef}
                      src={iframeSrc}
                      title={isEn ? 'Interactive Live App Preview' : 'معاينة التطبيق الحية'}
                      onLoad={() => {
                        setIsIframeReady(true);
                        syncIframeState();
                      }}
                      style={{
                        width: `${PHONE_SCREEN_WIDTH}px`,
                        height: `${PHONE_SCREEN_HEIGHT}px`,
                        border: 'none',
                        display: 'block',
                        backgroundColor: isBlackTheme ? '#000000' : '#ffffff',
                      }}
                    />
                  )}

                  {!isIframeReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 backdrop-blur-xs">
                      <Loader2 size={28} className="animate-spin text-amber-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Feature Spotlight Skeuomorphic Card */}
          <section className="min-h-0 flex flex-col justify-center">
            <div className="p-4 sm:p-6 rounded-3xl white-3d-container-card flex flex-col gap-4 max-h-full overflow-y-auto no-scrollbar">
              {renderSpotlightBody(false)}
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default InteractiveAppTourModal;
