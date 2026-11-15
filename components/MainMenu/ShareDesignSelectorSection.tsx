import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, ZoomIn, X, Sparkles } from 'lucide-react';
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

interface ShareDesignSelectorSectionProps {
  isEn: boolean;
  isNightMode: boolean;
  themeAccentColor: string;
}

const THUMB_RENDER_SCALE = 0.2; // 216x384 (>2.3x retina for 80-91px cards)
const FULL_PREVIEW_RENDER_SCALE = 0.75; // 810x1440
const THUMB_LS_PREFIX = 'share_design_thumbs_v3_';

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
  const [selectedId, setSelectedId] = useState<ShareDesignId>(() => getSelectedShareDesign());
  const [thumbs, setThumbs] = useState<Record<string, string>>(() => getCachedThumbsSnapshot(isEn));
  const [zoomedDesign, setZoomedDesign] = useState<ShareDesignMeta | null>(null);
  const [zoomedPreviewUrl, setZoomedPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const syncSelected = () => setSelectedId(getSelectedShareDesign());
    syncSelected();
    window.addEventListener(SHARE_DESIGN_CHANGE_EVENT, syncSelected);
    return () => window.removeEventListener(SHARE_DESIGN_CHANGE_EVENT, syncSelected);
  }, []);

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

  // Load 810x1440 preview when zooming a card to full page
  useEffect(() => {
    if (!zoomedDesign) {
      setZoomedPreviewUrl(null);
      return;
    }
    let cancelled = false;
    setZoomedPreviewUrl(thumbs[zoomedDesign.id] || null);
    generateDesignPreviewUrl(
      zoomedDesign.id,
      isEn,
      FULL_PREVIEW_RENDER_SCALE,
      fullPreviewCache,
      'full',
      0.92
    )
      .then((url) => {
        if (!cancelled) setZoomedPreviewUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [zoomedDesign, isEn, thumbs]);

  // Register hardware back button close for zoomed preview modal
  useEffect(() => {
    if (!zoomedDesign) return;
    const unregister = registerBackInterceptor(() => {
      setZoomedDesign(null);
      return true;
    });
    return unregister;
  }, [zoomedDesign]);

  const handleSelectDesign = useCallback(
    (design: ShareDesignMeta) => {
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
    zoomedDesign && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999999] w-screen h-[100dvh] bg-black flex items-center justify-center overflow-hidden"
            onClick={() => setZoomedDesign(null)}
            dir={isEn ? 'ltr' : 'rtl'}
            role="dialog"
            aria-modal="true"
            aria-label={isEn ? zoomedDesign.nameEn : zoomedDesign.nameAr}
          >
            {zoomedPreviewUrl ? (
              <img
                src={zoomedPreviewUrl}
                alt={isEn ? zoomedDesign.nameEn : zoomedDesign.nameAr}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain select-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Sparkles className="w-8 h-8 text-white animate-spin opacity-75" />
              </div>
            )}

            {/* Floating Close Button (Top Safe Area) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedDesign(null);
              }}
              className={`fixed top-[max(env(safe-area-inset-top,0px),14px)] ${
                isEn ? 'right-4' : 'left-4'
              } w-11 h-11 rounded-full bg-black/65 hover:bg-black/85 text-white border border-white/25 backdrop-blur-md flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-95`}
              aria-label={isEn ? 'Close' : 'إغلاق'}
            >
              <X size={20} />
            </button>

            {/* Floating Select Action Button (Bottom Safe Area) */}
            <div
              className="fixed bottom-[max(env(safe-area-inset-bottom,0px),18px)] inset-x-0 flex justify-center px-5 pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  handleSelectDesign(zoomedDesign);
                  setZoomedDesign(null);
                }}
                className="pointer-events-auto min-h-[44px] px-6 py-2.5 rounded-full font-black text-sm flex items-center justify-center gap-2 cursor-pointer bg-zinc-950/85 hover:bg-black text-white border border-white/25 backdrop-blur-md shadow-2xl whitespace-nowrap transition-transform active:scale-95"
              >
                <Check
                  size={17}
                  strokeWidth={2.8}
                  className={selectedId === zoomedDesign.id ? 'text-emerald-400' : 'text-amber-400'}
                />
                <span>
                  {selectedId === zoomedDesign.id
                    ? isEn
                      ? 'Currently Selected'
                      : 'مُفعّل حالياً'
                    : isEn
                    ? 'Use This Design'
                    : 'اعتماد هذا التصميم'}
                </span>
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="p-4 sm:p-5 rounded-3xl transition-all white-3d-container-card">
        <div className="pb-3 border-b border-amber-500/20 dark:border-zinc-800">
          <h3
            className="text-base sm:text-lg font-black tracking-wide truncate"
            style={{ color: themeAccentColor }}
          >
            {isEn ? 'Share Designs' : 'تصاميم المشاركه'}
          </h3>
        </div>

        {/* Inner 3D Card containing the Horizontal Showcase Strip of all 10 Islamic Share Card Designs */}
        <div className="mt-3 p-2.5 sm:p-3 rounded-2xl white-3d-card-btn shadow-xs border-0 hover:!transform-none active:!transform-none">
            <div
              className="flex items-stretch gap-2.5 overflow-x-auto py-0.5 px-0.5 no-scrollbar snap-x snap-mandatory"
              dir={isEn ? 'ltr' : 'rtl'}
            >
            {SHARE_CARD_DESIGNS.map((design) => {
              const isSelected = selectedId === design.id;
              const thumbUrl = thumbs[design.id];

              return (
                <div
                  key={design.id}
                  className="snap-start shrink-0 w-[80px] sm:w-[91px] flex flex-col"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectDesign(design)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectDesign(design);
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

                      {/* Full-Page Zoom Preview Trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedDesign(design);
                        }}
                        className={`absolute bottom-0.5 ${
                          isEn ? 'right-0.5' : 'left-0.5'
                        } w-7 h-7 flex items-center justify-center cursor-pointer border-0 bg-transparent`}
                        title={isEn ? 'Full screen preview' : 'معاينة بملء الشاشة'}
                        aria-label={isEn ? 'Full screen preview' : 'معاينة بملء الشاشة'}
                      >
                        <span className="w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs shadow-md transition-all">
                          <ZoomIn size={11} />
                        </span>
                      </button>
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
