import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  renderCardToPureCanvas,
  SHARE_CARD_DESIGNS,
  ShareDesignId,
  getSelectedShareDesign,
  setSelectedShareDesign,
} from '../../utils/shareAsImage';
import { SHARE_DESIGN_CHANGE_EVENT, ShareDesignMeta } from '../../utils/shareCardDesigns';
import { showGlobalAppToast } from '../../utils/appNotificationSettings';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { useTheme } from '../../context/ThemeContext';

interface ShareDesignSelectorSectionProps {
  isEn: boolean;
  isNightMode: boolean;
  themeAccentColor: string;
}

const THUMB_RENDER_SCALE = 0.2; // 216x384 (>2.3x retina for 80-91px cards)
const FULL_PREVIEW_RENDER_SCALE = 1; // Crisp 1080x1920 fullscreen preview
const THUMB_LS_PREFIX = 'share_design_thumbs_v5_';

const thumbCache = new Map<string, string>();
const fullPreviewCache = new Map<string, string>();
const hydratedLangs = new Set<string>();
const thumbListeners = new Set<() => void>();
const inFlightPrewarm = new Map<string, Promise<void>>();

function getLangKey(isEn: boolean): 'en' | 'ar' {
  return isEn ? 'en' : 'ar';
}

function hydrateThumbCacheFromStorage(isEn: boolean): void {
  const lang = getLangKey(isEn);
  if (hydratedLangs.has(lang)) return;
  hydratedLangs.add(lang);
  try {
    const raw = localStorage.getItem(`${THUMB_LS_PREFIX}${lang}`);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, string>;
    if (parsed && typeof parsed === 'object') {
      for (const design of SHARE_CARD_DESIGNS) {
        const val = parsed[design.id];
        if (typeof val === 'string' && val.startsWith('data:image/')) {
          thumbCache.set(`${design.id}_${lang}_thumb`, val);
        }
      }
    }
  } catch {
    // Ignore storage read errors
  }
}

function persistThumbCacheToStorage(isEn: boolean): void {
  const lang = getLangKey(isEn);
  try {
    const payload: Record<string, string> = {};
    for (const design of SHARE_CARD_DESIGNS) {
      const val = thumbCache.get(`${design.id}_${lang}_thumb`);
      if (val) payload[design.id] = val;
    }
    localStorage.setItem(`${THUMB_LS_PREFIX}${lang}`, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

function getCachedThumbsSnapshot(isEn: boolean): Record<string, string> {
  hydrateThumbCacheFromStorage(isEn);
  const lang = getLangKey(isEn);
  const out: Record<string, string> = {};
  for (const design of SHARE_CARD_DESIGNS) {
    const val = thumbCache.get(`${design.id}_${lang}_thumb`);
    if (val) out[design.id] = val;
  }
  return out;
}

export function getShareDesignThumbsSnapshot(isEn: boolean): Record<string, string> {
  return getCachedThumbsSnapshot(isEn);
}

export function subscribeShareDesignThumbs(listener: () => void): () => void {
  thumbListeners.add(listener);
  return () => {
    thumbListeners.delete(listener);
  };
}

function notifyThumbListeners(): void {
  thumbListeners.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
}

async function generateDesignPreviewUrl(
  designId: ShareDesignId,
  isEn: boolean,
  renderScale: number,
  cache: Map<string, string>,
  cacheSuffix: string,
  quality: number
): Promise<string> {
  const lang = getLangKey(isEn);
  const key = `${designId}_${lang}_${cacheSuffix}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const canvas = await renderCardToPureCanvas({
    text: isEn
      ? 'Glory be to Allah and praise Him, Glory be to Allah the Almighty.'
      : 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    category: isEn ? 'Selected Dhikr' : 'أذكار مختارة',
    source: isEn ? 'Sahih Al-Bukhari & Muslim' : 'متفق عليه',
    isEn,
    language: lang,
    designId,
    renderScale,
  });

  const url = canvas.toDataURL('image/jpeg', quality);
  cache.set(key, url);
  return url;
}

export function prewarmShareDesignThumbs(isEn: boolean): Promise<void> {
  hydrateThumbCacheFromStorage(isEn);
  const lang = getLangKey(isEn);

  const allCached = SHARE_CARD_DESIGNS.every((d) =>
    thumbCache.has(`${d.id}_${lang}_thumb`)
  );
  if (allCached) return Promise.resolve();

  const existing = inFlightPrewarm.get(lang);
  if (existing) return existing;

  const task = (async () => {
    // Wait briefly if fonts are still loading so cached thumbnails always use the crisp Quran/Arabic font
    if (typeof document !== 'undefined' && document.fonts && document.fonts.status !== 'loaded') {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 400)),
        ]);
      } catch {}
    }

    let generatedAny = false;
    for (const design of SHARE_CARD_DESIGNS) {
      const key = `${design.id}_${lang}_thumb`;
      if (thumbCache.has(key)) continue;
      try {
        await generateDesignPreviewUrl(
          design.id,
          isEn,
          THUMB_RENDER_SCALE,
          thumbCache,
          'thumb',
          0.86
        );
        generatedAny = true;
        notifyThumbListeners();
        // Yield micro-frame so UI stays 60fps responsive while pre-warming
        await new Promise((resolve) => setTimeout(resolve, 0));
      } catch {
        // Fallback gradient stays visible if canvas fails
      }
    }
    if (generatedAny) {
      persistThumbCacheToStorage(isEn);
    }
  })().finally(() => {
    inFlightPrewarm.delete(lang);
  });

  inFlightPrewarm.set(lang, task);
  return task;
}

export const ShareDesignSelectorSection: React.FC<ShareDesignSelectorSectionProps> = ({
  isEn,
  isNightMode,
  themeAccentColor,
}) => {
  const { theme, themeKey, isNightMode: ctxNightMode, homeThemeVariant } = useTheme();
  const [selectedId, setSelectedId] = useState<ShareDesignId>(() => getSelectedShareDesign());
  const [thumbs, setThumbs] = useState<Record<string, string>>(() => getCachedThumbsSnapshot(isEn));
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [fullPreviews, setFullPreviews] = useState<Record<string, string>>({});

  const isNightActive = Boolean(isNightMode || ctxNightMode);
  const isBlackTheme =
    isNightActive ||
    themeKey === 'black_gold' ||
    themeKey === 'deep_black' ||
    theme?.bgColor === '#000000' ||
    theme?.name === 'اسود' ||
    theme?.name === 'black';

  const surfaceBg = isBlackTheme ? '#141418' : '#FFFFFF';
  const dividerColor = isBlackTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)';
  const textPrimary = isBlackTheme ? '#FFFFFF' : '#0F172A';
  const applyTextColor = isBlackTheme
    ? '#FBBF24'
    : homeThemeVariant === 'sky' || themeKey === 'sky_mode'
      ? '#0284C7'
      : homeThemeVariant === 'emerald' || themeKey === 'emerald_mode'
        ? '#047857'
        : homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode'
          ? '#881337'
          : '#B45309';

  const tactileNeutralShadow = isBlackTheme
    ? '0 3.5px 0 #050507, 0 8px 16px rgba(0,0,0,0.65), inset 0 1.5px 1px rgba(255,255,255,0.16), inset 0 -1.5px 2px rgba(0,0,0,0.45)'
    : '0 3.5px 0 rgba(148,163,184,0.34), 0 8px 16px -3px rgba(15,23,42,0.09), inset 0 1.5px 1px rgba(255,255,255,0.95), inset 0 -1.5px 2px rgba(15,23,42,0.04)';

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const stripItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasDidInitialStripScrollRef = useRef(false);
  const userTouchedStripRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  const mouseDragStartXRef = useRef<number | null>(null);
  const tapStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const didInitScrollRef = useRef(false);
  const programmaticScrollUntilRef = useRef(0);

  const centerSelectedStripItem = useCallback(
    (targetId: ShareDesignId, behavior: ScrollBehavior = 'auto') => {
      const strip = stripRef.current;
      const itemEl = stripItemRefs.current[targetId];
      if (!strip || !itemEl) return;

      const stripRect = strip.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();
      if (stripRect.width === 0 || itemRect.width === 0) return;

      const deltaToCenter =
        itemRect.left + itemRect.width / 2 - (stripRect.left + stripRect.width / 2);

      if (Math.abs(deltaToCenter) < 1) return;

      strip.scrollBy({
        left: deltaToCenter,
        behavior,
      });
    },
    []
  );

  const zoomedDesign =
    zoomedIndex !== null && zoomedIndex >= 0 && zoomedIndex < SHARE_CARD_DESIGNS.length
      ? SHARE_CARD_DESIGNS[zoomedIndex]
      : null;

  useEffect(() => {
    const syncSelected = () => {
      userTouchedStripRef.current = false;
      setSelectedId(getSelectedShareDesign());
    };
    syncSelected();
    window.addEventListener(SHARE_DESIGN_CHANGE_EVENT, syncSelected);
    return () => window.removeEventListener(SHARE_DESIGN_CHANGE_EVENT, syncSelected);
  }, []);

  // Ensure the currently selected share design is always visible in the strip when opening/returning to Settings
  useEffect(() => {
    const isInitialMount = !hasDidInitialStripScrollRef.current;
    hasDidInitialStripScrollRef.current = true;
    const behavior: ScrollBehavior = isInitialMount ? 'auto' : 'smooth';

    let raf1 = 0;
    let raf2 = 0;
    let settleTimer: number | null = null;

    raf1 = requestAnimationFrame(() => {
      if (userTouchedStripRef.current) return;
      centerSelectedStripItem(selectedId, behavior);
      raf2 = requestAnimationFrame(() => {
        if (userTouchedStripRef.current) return;
        centerSelectedStripItem(selectedId, 'auto');
      });
    });

    settleTimer = window.setTimeout(() => {
      if (!userTouchedStripRef.current) {
        centerSelectedStripItem(selectedId, 'auto');
      }
    }, 220);

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (settleTimer !== null) window.clearTimeout(settleTimer);
    };
  }, [selectedId, isEn, centerSelectedStripItem]);

  // Hydrate immediately and pre-warm thumbnails as soon as Settings mounts (before user taps Share Designs)
  useEffect(() => {
    setThumbs(getCachedThumbsSnapshot(isEn));
    const listener = () => {
      setThumbs(getCachedThumbsSnapshot(isEn));
    };
    thumbListeners.add(listener);
    prewarmShareDesignThumbs(isEn);
    return () => {
      thumbListeners.delete(listener);
    };
  }, [isEn]);

  // Preload 810x1440 previews for active slide and immediate neighbors so swiping stays sharp
  useEffect(() => {
    if (zoomedIndex === null) {
      didInitScrollRef.current = false;
      programmaticScrollUntilRef.current = 0;
      return;
    }

    let cancelled = false;
    const lang = getLangKey(isEn);
    const candidateIndices = [zoomedIndex, zoomedIndex - 1, zoomedIndex + 1].filter(
      (idx) => idx >= 0 && idx < SHARE_CARD_DESIGNS.length
    );

    const immediateCached: Record<string, string> = {};
    for (const idx of candidateIndices) {
      const design = SHARE_CARD_DESIGNS[idx];
      const key = `${design.id}_${lang}_full`;
      const cached = fullPreviewCache.get(key);
      if (cached) immediateCached[design.id] = cached;
    }
    if (Object.keys(immediateCached).length > 0) {
      setFullPreviews((prev) => ({ ...prev, ...immediateCached }));
    }

    (async () => {
      for (const idx of candidateIndices) {
        if (cancelled) break;
        const design = SHARE_CARD_DESIGNS[idx];
        const key = `${design.id}_${lang}_full`;
        if (fullPreviewCache.has(key)) continue;
        try {
          const url = await generateDesignPreviewUrl(
            design.id,
            isEn,
            FULL_PREVIEW_RENDER_SCALE,
            fullPreviewCache,
            'full',
            0.92
          );
          if (!cancelled) {
            setFullPreviews((prev) =>
              prev[design.id] === url ? prev : { ...prev, [design.id]: url }
            );
          }
        } catch {}
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [zoomedIndex, isEn]);

  // Center initial zoomed slide immediately when modal opens
  useEffect(() => {
    if (zoomedIndex === null || didInitScrollRef.current) return;
    const targetSlide = slideRefs.current[zoomedIndex];
    if (targetSlide) {
      programmaticScrollUntilRef.current = Date.now() + 180;
      targetSlide.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
      didInitScrollRef.current = true;
    }
  }, [zoomedIndex]);

  const scrollToSlide = useCallback((targetIdx: number) => {
    const clamped = Math.max(0, Math.min(SHARE_CARD_DESIGNS.length - 1, targetIdx));
    programmaticScrollUntilRef.current = Date.now() + 420;
    setZoomedIndex(clamped);
    const el = slideRefs.current[clamped];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  const handleCarouselScroll = useCallback(() => {
    if (Date.now() < programmaticScrollUntilRef.current) return;
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (Date.now() < programmaticScrollUntilRef.current) return;
      const container = carouselRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      let closestIdx = 0;
      let minDist = Infinity;
      for (let i = 0; i < SHARE_CARD_DESIGNS.length; i++) {
        const slideEl = slideRefs.current[i];
        if (!slideEl) continue;
        const sRect = slideEl.getBoundingClientRect();
        const sCenter = sRect.left + sRect.width / 2;
        const dist = Math.abs(sCenter - centerX);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }
      setZoomedIndex((prev) => (prev === closestIdx ? prev : closestIdx));
    });
  }, []);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  // Keyboard navigation + hardware back button for fullscreen carousel
  useEffect(() => {
    if (zoomedIndex === null) return;
    const unregister = registerBackInterceptor(() => {
      setZoomedIndex(null);
      return true;
    });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedIndex(null);
      } else if (e.key === 'ArrowRight') {
        scrollToSlide(isEn ? zoomedIndex + 1 : zoomedIndex - 1);
      } else if (e.key === 'ArrowLeft') {
        scrollToSlide(isEn ? zoomedIndex - 1 : zoomedIndex + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      unregister();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [zoomedIndex, isEn, scrollToSlide]);

  const handleSelectDesign = useCallback(
    (design: ShareDesignMeta) => {
      userTouchedStripRef.current = false;
      setSelectedId(design.id);
      setSelectedShareDesign(design.id);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(25);
        } catch {}
      }
      showGlobalAppToast(
        isEn ? 'Share image updated' : 'تم تغيير صورة المشاركه'
      );
    },
    [isEn]
  );

  const zoomedPortal =
    zoomedDesign && zoomedIndex !== null && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999999] w-screen h-[100dvh] bg-black flex flex-col overflow-hidden select-none"
            dir={isEn ? 'ltr' : 'rtl'}
            role="dialog"
            aria-modal="true"
            aria-label={isEn ? zoomedDesign.nameEn : zoomedDesign.nameAr}
          >
            {/* Swipeable Full-Screen Carousel Track (Full Bleed) */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              onTouchStart={() => {
                programmaticScrollUntilRef.current = 0;
              }}
              onWheel={() => {
                programmaticScrollUntilRef.current = 0;
              }}
              onMouseDown={(e) => {
                if (e.button === 0) mouseDragStartXRef.current = e.clientX;
              }}
              onMouseUp={(e) => {
                if (mouseDragStartXRef.current === null) return;
                const dx = e.clientX - mouseDragStartXRef.current;
                mouseDragStartXRef.current = null;
                if (Math.abs(dx) > 45) {
                  const moveNext = isEn ? dx < 0 : dx > 0;
                  scrollToSlide(zoomedIndex + (moveNext ? 1 : -1));
                }
              }}
              className="flex w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x"
              dir={isEn ? 'ltr' : 'rtl'}
            >
              {SHARE_CARD_DESIGNS.map((design, idx) => {
                const previewSrc = fullPreviews[design.id] || thumbs[design.id];
                const shouldRenderImg = Math.abs(idx - zoomedIndex) <= 2 || Boolean(previewSrc);
                return (
                  <div
                    key={design.id}
                    ref={(el) => {
                      slideRefs.current[idx] = el;
                    }}
                    onPointerDown={(e) => {
                      tapStartPosRef.current = { x: e.clientX, y: e.clientY };
                    }}
                    onClick={(e) => {
                      const start = tapStartPosRef.current;
                      tapStartPosRef.current = null;
                      if (start) {
                        const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
                        if (moved > 10) return;
                      }
                      setZoomedIndex(null);
                    }}
                    className="w-screen h-full shrink-0 snap-center flex items-center justify-center p-0 cursor-zoom-out"
                  >
                    {shouldRenderImg && previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={isEn ? design.nameEn : design.nameAr}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        onPointerDown={(e) => {
                          tapStartPosRef.current = { x: e.clientX, y: e.clientY };
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const start = tapStartPosRef.current;
                          tapStartPosRef.current = null;
                          if (start) {
                            const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
                            if (moved > 10) return;
                          }
                          setZoomedIndex(null);
                        }}
                        className="w-full h-full object-contain select-none"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Sparkles className="w-8 h-8 text-white animate-spin opacity-75" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Side Previous / Next Arrows (Compact Share-Page White 3D Style) */}
            {zoomedIndex > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSlide(zoomedIndex - 1);
                }}
                className={`fixed top-1/2 -translate-y-1/2 z-20 ${
                  isEn ? 'left-2' : 'right-2'
                } w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-0 cursor-pointer transition-transform active:scale-90`}
                style={{
                  backgroundColor: surfaceBg,
                  color: textPrimary,
                  border: `1px solid ${dividerColor}`,
                  boxShadow: tactileNeutralShadow,
                }}
                aria-label={isEn ? 'Previous design' : 'التصميم السابق'}
              >
                {isEn ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            )}

            {zoomedIndex < SHARE_CARD_DESIGNS.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSlide(zoomedIndex + 1);
                }}
                className={`fixed top-1/2 -translate-y-1/2 z-20 ${
                  isEn ? 'right-2' : 'left-2'
                } w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-0 cursor-pointer transition-transform active:scale-90`}
                style={{
                  backgroundColor: surfaceBg,
                  color: textPrimary,
                  border: `1px solid ${dividerColor}`,
                  boxShadow: tactileNeutralShadow,
                }}
                aria-label={isEn ? 'Next design' : 'التصميم التالي'}
              >
                {isEn ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}

            {/* Bottom Raised Apply & Cancel Buttons (Matched to Share-Page Tactile 3D Button Colors) */}
            <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+34px)] inset-x-0 z-20 flex items-center justify-center gap-4 pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectDesign(zoomedDesign);
                  setZoomedIndex(null);
                }}
                className="pointer-events-auto !min-h-0 !min-w-0 w-fit px-7 py-3 rounded-full font-extrabold text-sm leading-none cursor-pointer whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1.5"
                style={{
                  backgroundColor: surfaceBg,
                  color: applyTextColor,
                  border: `1px solid ${dividerColor}`,
                  boxShadow: tactileNeutralShadow,
                }}
              >
                <Check size={15} strokeWidth={3} />
                <span>{isEn ? 'Apply' : 'تطبيق'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomedIndex(null);
                }}
                className="pointer-events-auto !min-h-0 !min-w-0 w-fit px-7 py-3 rounded-full font-extrabold text-sm leading-none cursor-pointer whitespace-nowrap active:scale-95 transition-transform"
                style={{
                  backgroundColor: surfaceBg,
                  color: textPrimary,
                  border: `1px solid ${dividerColor}`,
                  boxShadow: tactileNeutralShadow,
                }}
              >
                {isEn ? 'Cancel' : 'إلغاء'}
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="p-4 sm:p-5 rounded-3xl transition-all white-3d-container-card">
        <div className="space-y-2.5">
          <h3
            className="text-base sm:text-lg font-black tracking-wide truncate"
            style={{ color: themeAccentColor }}
          >
            {isEn ? 'Share Designs' : 'تصاميم المشاركه'}
          </h3>
          <div className="app-3d-divider" />
        </div>

        {/* Inner 3D Card containing the Horizontal Showcase Strip of all 10 Islamic Share Card Designs */}
        <div className="mt-3 p-2.5 sm:p-3 rounded-2xl white-3d-card-btn shadow-xs border-0 hover:!transform-none active:!transform-none">
            <div
              ref={stripRef}
              onTouchStart={() => {
                userTouchedStripRef.current = true;
              }}
              onPointerDown={() => {
                userTouchedStripRef.current = true;
              }}
              onWheel={() => {
                userTouchedStripRef.current = true;
              }}
              className="flex items-stretch gap-2.5 overflow-x-auto py-0.5 px-0.5 no-scrollbar snap-x snap-mandatory"
              dir={isEn ? 'ltr' : 'rtl'}
            >
            {SHARE_CARD_DESIGNS.map((design, idx) => {
              const isSelected = selectedId === design.id;
              const thumbUrl = thumbs[design.id];

              return (
                <div
                  key={design.id}
                  ref={(el) => {
                    stripItemRefs.current[design.id] = el;
                  }}
                  className="snap-center shrink-0 w-[80px] sm:w-[91px] flex flex-col"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      didInitScrollRef.current = false;
                      setZoomedIndex(idx);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        didInitScrollRef.current = false;
                        setZoomedIndex(idx);
                      }
                    }}
                    className={`relative w-full p-1 rounded-xl transition-all cursor-pointer white-3d-card-btn ${
                      isSelected ? 'ring-2 ring-offset-1' : ''
                    }`}
                    style={
                      isSelected
                        ? ({
                            '--tw-ring-color': themeAccentColor,
                          } as React.CSSProperties)
                        : undefined
                    }
                    aria-pressed={isSelected}
                    aria-label={isEn ? design.nameEn : design.nameAr}
                  >
                    {/* 9:16 Live Canvas Preview Thumbnail (50% compact size) */}
                    <div
                      className="relative w-full aspect-[9/16] rounded-lg overflow-hidden shadow-inner flex items-center justify-center"
                      style={{
                        background: `linear-gradient(155deg, ${design.previewColors[0]} 0%, ${design.previewColors[1]} 55%, ${design.previewColors[2]} 100%)`,
                      }}
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={isEn ? design.nameEn : design.nameAr}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover select-none pointer-events-none"
                          loading="eager"
                          decoding="sync"
                        />
                      ) : (
                        <Sparkles className="w-4 h-4 opacity-60 animate-pulse" />
                      )}

                      {/* Active Checkmark Badge */}
                      {isSelected && (
                        <span
                          className={`prayer-done-badge absolute top-1.5 ${
                            isEn ? 'right-1.5' : 'left-1.5'
                          } w-5 h-5 rounded-full flex items-center justify-center shadow-md`}
                          style={{
                            backgroundColor: isNightMode ? '#10b981' : themeAccentColor,
                            color: '#FFFFFF',
                          }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {zoomedPortal}
    </>
  );
};

export default ShareDesignSelectorSection;
