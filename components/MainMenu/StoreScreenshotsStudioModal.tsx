import React, { useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import {
  Download,
  Package,
  Loader2,
  Palette,
  Languages,
  Maximize2,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { showGlobalAppToast } from '../../utils/appNotificationSettings';
import {
  STORE_SCREENSHOT_SPECS,
  STUDIO_THEMES,
  StorePosterStage,
  StoreScreenshotSpec,
  StudioLang,
  StudioThemeId,
} from './StoreScreenPreviews';

interface StoreScreenshotsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHome?: () => void;
}

const THEME_ORDER: StudioThemeId[] = ['gold', 'sky', 'emerald', 'burgundy', 'night'];

const waitFrames = (count = 2) =>
  new Promise<void>((resolve) => {
    const step = (n: number) => {
      if (n <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => step(n - 1));
    };
    step(count);
  });

async function waitForImagesInNode(node: HTMLElement): Promise<void> {
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((res) => {
        const done = () => {
          img.removeEventListener('load', done);
          img.removeEventListener('error', done);
          res();
        };
        img.addEventListener('load', done);
        img.addEventListener('error', done);
        setTimeout(done, 1500);
      });
    })
  );
}

function dataUrlToBase64(dataUrl: string): string {
  const idx = dataUrl.indexOf(',');
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

interface ScaledPosterCardProps {
  spec: StoreScreenshotSpec;
  themeId: StudioThemeId;
  lang: StudioLang;
  uiIsEn: boolean;
  isExporting: boolean;
  isAnyBusy: boolean;
  onDownload: (spec: StoreScreenshotSpec) => void;
  onInspect: (spec: StoreScreenshotSpec) => void;
}

const ScaledPosterCard: React.FC<ScaledPosterCardProps> = ({
  spec,
  themeId,
  lang,
  uiIsEn,
  isExporting,
  isAnyBusy,
  onDownload,
  onInspect,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(0.72);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setScale(w / 360);
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const label = uiIsEn
    ? `${spec.order}. ${spec.labelEn}`
    : `${spec.order}. ${spec.labelAr}`;

  return (
    <div className="p-3.5 rounded-3xl white-3d-container-card flex flex-col gap-3">
      {/* Screen Header Label + Lightbox Inspect Button */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="text-xs sm:text-sm font-black truncate">{label}</span>
        <button
          type="button"
          onClick={() => onInspect(spec)}
          className="w-8 h-8 rounded-xl flex items-center justify-center white-3d-card-btn cursor-pointer shrink-0 active:scale-95 transition-transform"
          title={uiIsEn ? 'Full Preview' : 'معاينة مكبرة'}
          aria-label={uiIsEn ? 'Full Preview' : 'معاينة مكبرة'}
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Exact 9:16 Live Preview Frame */}
      <div
        ref={containerRef}
        onClick={() => onInspect(spec)}
        className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative cursor-pointer shadow-lg bg-black/5 group"
        title={uiIsEn ? 'Tap to preview full size' : 'انقر للمعاينة بالحجم الكامل'}
      >
        <div
          style={{
            width: '360px',
            height: '640px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          <StorePosterStage spec={spec} themeId={themeId} lang={lang} />
        </div>
      </div>

      {/* Individual 1080x1920 PNG Export Button */}
      <button
        type="button"
        disabled={isAnyBusy}
        onClick={() => onDownload(spec)}
        className="w-full min-h-[44px] px-3 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-[0.98] transition-all golden-3d-pill-btn disabled:opacity-60 disabled:cursor-wait"
      >
        {isExporting ? (
          <>
            <Loader2 size={16} className="animate-spin shrink-0" />
            <span>{uiIsEn ? 'Exporting 1080×1920...' : 'جاري التصدير...'}</span>
          </>
        ) : (
          <>
            <Download size={16} className="shrink-0" />
            <span>{uiIsEn ? 'Download PNG' : 'تحميل الصورة PNG'}</span>
          </>
        )}
      </button>
    </div>
  );
};

export const StoreScreenshotsStudioModal: React.FC<StoreScreenshotsStudioModalProps> = ({
  isOpen,
  onClose,
  onHome,
}) => {
  const { language } = useLanguage();
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const uiIsEn = language === 'en';

  const isBlackTheme =
    isNightMode ||
    themeKey === 'deep_black' ||
    theme?.bgColor === '#000000' ||
    theme?.name === 'اسود' ||
    theme?.name === 'black';

  const pageBgColor = isBlackTheme
    ? '#000000'
    : homeThemeVariant === 'sky'
    ? '#F0F9FF'
    : homeThemeVariant === 'emerald'
    ? '#F0FDF4'
    : homeThemeVariant === 'burgundy'
    ? '#FFF1F2'
    : '#FEF9C3';

  const themeAccentColor = isNightMode
    ? '#f59e0b'
    : homeThemeVariant === 'sky'
    ? '#0284c7'
    : homeThemeVariant === 'emerald'
    ? '#047857'
    : homeThemeVariant === 'burgundy'
    ? '#881337'
    : theme?.palette?.[0] || '#ca8a04';

  // Studio-independent live preview controls
  const [studioTheme, setStudioTheme] = useState<StudioThemeId>(() =>
    isNightMode ? 'night' : homeThemeVariant || 'gold'
  );
  const [studioLang, setStudioLang] = useState<StudioLang>(() =>
    language === 'en' ? 'en' : 'ar'
  );
  const [inspectedSpec, setInspectedSpec] = useState<StoreScreenshotSpec | null>(null);

  // Sync defaults cleanly when studio opens
  useEffect(() => {
    if (!isOpen) return;
    setStudioTheme(isNightMode ? 'night' : homeThemeVariant || 'gold');
    setStudioLang(language === 'en' ? 'en' : 'ar');
  }, [isOpen, isNightMode, homeThemeVariant, language]);

  // Export states & offscreen unscaled capture stage
  const [exportSpec, setExportSpec] = useState<StoreScreenshotSpec | null>(null);
  const exportNodeRef = useRef<HTMLDivElement | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null);

  const isAnyBusy = Boolean(downloadingId) || Boolean(zipProgress);

  // Back interceptor: closes lightbox first, then closes Studio
  const stateRef = useRef({ inspectedSpec, onClose });
  stateRef.current = { inspectedSpec, onClose };

  useEffect(() => {
    if (!isOpen) return;
    const unregister = registerBackInterceptor(() => {
      if (stateRef.current.inspectedSpec) {
        setInspectedSpec(null);
        return true;
      }
      stateRef.current.onClose();
      return true;
    });
    return unregister;
  }, [isOpen]);

  // Capture an exact 1080x1920 (360x640 @ pixelRatio 3) PNG Data URL cleanly from offscreen node
  const captureSpecAs1080x1920Png = useCallback(async (spec: StoreScreenshotSpec): Promise<string> => {
    setExportSpec(spec);
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }
    await waitFrames(3);

    const node = exportNodeRef.current;
    if (!node) {
      throw new Error('Capture stage not mounted');
    }

    await waitForImagesInNode(node);
    await waitFrames(1);

    try {
      return await toPng(node, {
        width: 360,
        height: 640,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#000000',
      });
    } catch {
      // Safe fallback in restricted offline WebViews if external Google Font rules block CSS inspection
      return await toPng(node, {
        width: 360,
        height: 640,
        pixelRatio: 3,
        skipFonts: true,
        cacheBust: true,
        backgroundColor: '#000000',
      });
    }
  }, []);

  const triggerDownloadFile = useCallback(async (blob: Blob, filename: string, title: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const reader = new FileReader();
        const base64: string = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const res = String(reader.result || '');
            resolve(res.includes(',') ? res.split(',')[1] : res);
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
        await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Cache,
        });
        const uriRes = await Filesystem.getUri({
          path: filename,
          directory: Directory.Cache,
        });
        await Share.share({
          title,
          url: uriRes.uri,
          dialogTitle: title,
        });
        return;
      } catch (e) {
        console.warn('Native export fallback to anchor download', e);
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, []);

  const handleDownloadSingle = async (spec: StoreScreenshotSpec) => {
    if (isAnyBusy) return;
    setDownloadingId(spec.id);
    try {
      const pngDataUrl = await captureSpecAs1080x1920Png(spec);
      const base64 = dataUrlToBase64(pngDataUrl);
      const blob = base64ToBlob(base64, 'image/png');
      const filename = `${spec.slug}-${studioLang}-${studioTheme}-1080x1920.png`;
      await triggerDownloadFile(
        blob,
        filename,
        uiIsEn ? 'Store Screenshot 1080×1920' : 'لقطة متجر 1080×1920'
      );
      showGlobalAppToast(
        uiIsEn
          ? `Downloaded ${spec.labelEn} (1080×1920 PNG)`
          : `تم تحميل صورة "${spec.labelAr}" بدقة 1080×1920`
      );
    } catch (err) {
      console.error('PNG Export error:', err);
      showGlobalAppToast(
        uiIsEn ? 'Failed to export screenshot image' : 'تعذر تصدير الصورة، يرجى المحاولة مرة أخرى'
      );
    } finally {
      setDownloadingId(null);
      setExportSpec(null);
    }
  };

  const handleDownloadAllZip = async () => {
    if (isAnyBusy) return;
    const total = STORE_SCREENSHOT_SPECS.length;
    setZipProgress({ current: 0, total });

    try {
      const zip = new JSZip();
      const folderName = `google-play-screenshots-${studioLang}-${studioTheme}`;
      const folder = zip.folder(folderName) || zip;

      for (let i = 0; i < total; i++) {
        const spec = STORE_SCREENSHOT_SPECS[i];
        setZipProgress({ current: i + 1, total });
        const pngDataUrl = await captureSpecAs1080x1920Png(spec);
        const base64 = dataUrlToBase64(pngDataUrl);
        folder.file(`${spec.slug}-${studioLang}-${studioTheme}-1080x1920.png`, base64, {
          base64: true,
        });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFilename = `mushaf-ahmed-laila-store-${studioLang}-${studioTheme}.zip`;
      await triggerDownloadFile(
        zipBlob,
        zipFilename,
        uiIsEn ? 'Store Screenshots Pack (ZIP)' : 'حزمة لقطات المتجر (ZIP)'
      );
      showGlobalAppToast(
        uiIsEn
          ? 'All 8 Google Play screenshots (1080×1920) exported as ZIP!'
          : 'تم تحميل جميع اللقطات الـ 8 بدقة 1080×1920 في ملف ZIP بنجاح!'
      );
    } catch (err) {
      console.error('ZIP Export error:', err);
      showGlobalAppToast(
        uiIsEn ? 'Failed to export ZIP archive' : 'تعذر إنشاء ملف ZIP، يرجى المحاولة مرة أخرى'
      );
    } finally {
      setZipProgress(null);
      setExportSpec(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="store-screenshots-studio-modal"
      className="fixed inset-0 z-[9999999] flex flex-col font-cairo select-none overflow-hidden animate-fadeIn"
      style={{ backgroundColor: pageBgColor }}
      dir={uiIsEn ? 'ltr' : 'rtl'}
    >
      {/* Top Bar identical to HomeScreenSettingsModal */}
      <header className="app-top-bar settings-top-bar shrink-0 w-full" dir={uiIsEn ? 'ltr' : 'rtl'}>
        <div className="app-top-bar__inner">
          <div className="relative flex items-center justify-center w-full min-h-[44px]">
            <div className={`absolute ${uiIsEn ? 'left-0' : 'right-0'} flex items-center`}>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={uiIsEn ? 'Go Back' : 'رجوع للخلف'}
                aria-label={uiIsEn ? 'Go Back' : 'رجوع للخلف'}
              >
                <i className={`fa-solid ${uiIsEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
              </button>
            </div>

            <div className="text-center px-12 min-w-0">
              <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate">
                {uiIsEn ? 'Store Screenshots Studio' : 'استوديو لقطات المتجر'}
              </h1>
            </div>

            {onHome && (
              <div className={`absolute ${uiIsEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                <button
                  type="button"
                  onClick={onHome}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  title={uiIsEn ? 'Home' : 'الصفحة الرئيسية'}
                  aria-label={uiIsEn ? 'Home' : 'الصفحة الرئيسية'}
                >
                  <i className="fa-solid fa-house text-xl"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Scrollable Studio Workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 pt-4 pb-10 app-scroll-safe no-scrollbar">
        <div className="max-w-7xl mx-auto w-full space-y-5">
          {/* Studio Control Bar: Themes + Language + Bulk ZIP Download */}
          <div className="p-4 sm:p-5 rounded-3xl white-3d-container-card space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Studio Info */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} style={{ color: themeAccentColor }} className="shrink-0" />
                  <h2 className="text-base sm:text-lg font-black" style={{ color: themeAccentColor }}>
                    {uiIsEn
                      ? 'Google Play Store Mockups (9:16 • 1080×1920)'
                      : 'مولّد لقطات متجر Google Play (9:16 • 1080×1920)'}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-medium opacity-80">
                  {uiIsEn
                    ? 'Switch themes and language below to generate matching real-UI store posters.'
                    : 'بدّل بين ثيمات التطبيق واللغتين العربية والإنجليزية أدناه ثم حمّل الصور عالية الدقة.'}
                </p>
              </div>

              {/* Prominent Bulk Export ZIP Button */}
              <button
                type="button"
                disabled={isAnyBusy}
                onClick={handleDownloadAllZip}
                className="min-h-[48px] px-5 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer active:scale-[0.98] transition-all golden-3d-pill-btn shrink-0 disabled:opacity-65 disabled:cursor-wait"
              >
                {zipProgress ? (
                  <>
                    <Loader2 size={18} className="animate-spin shrink-0" />
                    <span>
                      {uiIsEn
                        ? `Preparing ${zipProgress.current} of ${zipProgress.total}...`
                        : `جاري تجهيز ${zipProgress.current} من ${zipProgress.total}...`}
                    </span>
                  </>
                ) : (
                  <>
                    <Package size={18} className="shrink-0" />
                    <span>
                      {uiIsEn
                        ? 'Download All Screenshots (ZIP)'
                        : 'تحميل جميع اللقطات دفعة واحدة (ZIP)'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Live Progress Bar for Batch Export */}
            {zipProgress && (
              <div className="w-full space-y-1.5">
                <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((zipProgress.current / zipProgress.total) * 100)}%`,
                      backgroundColor: themeAccentColor,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="app-3d-divider" />

            {/* Interactive Controls Row: Theme Switcher + Language Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* 5 Theme Swatches */}
              <div className="flex flex-col gap-2 min-w-0">
                <span className="text-xs font-black flex items-center gap-1.5 opacity-80">
                  <Palette size={14} style={{ color: themeAccentColor }} />
                  <span>{uiIsEn ? 'App Theme & Day/Night' : 'ثيم التطبيق والوضع الليلي'}</span>
                </span>
                <div className="flex items-center flex-wrap gap-2">
                  {THEME_ORDER.map((id) => {
                    const tInfo = STUDIO_THEMES[id];
                    const selected = studioTheme === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setStudioTheme(id)}
                        className={`min-h-[44px] px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
                          selected ? 'golden-3d-pill-btn' : 'white-3d-card-btn'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 border border-white/60 shadow-xs"
                          style={{ backgroundColor: tInfo.swatchColor }}
                        />
                        <span>{uiIsEn ? tInfo.nameEn : tInfo.nameAr}</span>
                        {selected && <CheckCircle2 size={14} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Switcher (AR RTL / EN LTR) */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className="text-xs font-black flex items-center gap-1.5 opacity-80">
                  <Languages size={14} style={{ color: themeAccentColor }} />
                  <span>{uiIsEn ? 'Preview & Export Language' : 'لغة اللقطات والاتجاه'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStudioLang('ar')}
                    className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
                      studioLang === 'ar' ? 'golden-3d-pill-btn' : 'white-3d-card-btn'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioLang('en')}
                    className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
                      studioLang === 'en' ? 'golden-3d-pill-btn' : 'white-3d-card-btn'
                    }`}
                  >
                    English (LTR)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive 8-Card Store Mockups Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {STORE_SCREENSHOT_SPECS.map((spec) => (
              <ScaledPosterCard
                key={spec.id}
                spec={spec}
                themeId={studioTheme}
                lang={studioLang}
                uiIsEn={uiIsEn}
                isExporting={downloadingId === spec.id}
                isAnyBusy={isAnyBusy}
                onDownload={handleDownloadSingle}
                onInspect={setInspectedSpec}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Full-Size Poster Lightbox */}
      {inspectedSpec && (
        <div
          className="fixed inset-0 z-[99999999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectedSpec(null)}
        >
          <div
            className="relative flex flex-col items-center gap-3 max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full gap-3 text-white">
              <span className="text-sm font-black truncate">
                {uiIsEn ? inspectedSpec.labelEn : inspectedSpec.labelAr} — 1080×1920
              </span>
              <button
                type="button"
                onClick={() => setInspectedSpec(null)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
                aria-label={uiIsEn ? 'Close' : 'إغلاق'}
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl max-h-[78dvh] flex items-center justify-center">
              <div className="scale-[0.82] sm:scale-100 origin-center">
                <StorePosterStage
                  spec={inspectedSpec}
                  themeId={studioTheme}
                  lang={studioLang}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isAnyBusy}
              onClick={() => handleDownloadSingle(inspectedSpec)}
              className="min-h-[44px] px-6 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer golden-3d-pill-btn"
            >
              {downloadingId === inspectedSpec.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>{uiIsEn ? 'Download PNG (1080×1920)' : 'تحميل الصورة PNG (1080×1920)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden Offscreen Unscaled 360x640 Stage for Crisp 1080x1920 PNG Export */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-12000px',
          top: 0,
          width: '360px',
          height: '640px',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        {exportSpec && (
          <StorePosterStage
            stageRef={exportNodeRef}
            spec={exportSpec}
            themeId={studioTheme}
            lang={studioLang}
          />
        )}
      </div>
    </div>
  );
};

export default StoreScreenshotsStudioModal;
