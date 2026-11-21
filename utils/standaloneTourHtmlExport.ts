import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { toCanvas } from 'html-to-image';
import { TourSlide } from '../data/appTourSlidesData';
import { safeHtml2Canvas } from './canvasHelper';

export interface CapturedSlideSnapshot {
  html: string;
  htmlClass: string;
  rootStyle: string;
  bodyClass: string;
  bodyStyle: string;
  lang: 'ar' | 'en';
  dir: 'rtl' | 'ltr';
}

export interface StandaloneExportOptions {
  slides: TourSlide[];
  initialLang: 'ar' | 'en';
  initialNightMode: boolean;
  themeVariant: 'gold' | 'sky' | 'emerald' | 'burgundy';
  exportMode?: 'full' | 'screen-only';
  appCss?: string;
  fontLinksHtml?: string;
  assets?: string[];
  snapshots?: CapturedSlideSnapshot[];
}

export interface CaptureTourExportParams {
  slides: TourSlide[];
  iframe: HTMLIFrameElement;
  initialLang: 'ar' | 'en';
  initialNightMode: boolean;
  themeVariant: 'gold' | 'sky' | 'emerald' | 'burgundy';
  onProgress?: (current: number, total: number, label: string) => void;
}

const CORE_FONT_FAMILY_REGEX = /(Font Awesome|Cairo|Amiri|Noto Naskh)/i;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

function escapeJsonForScriptTag(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function createAssetInliner(baseOrigin: string) {
  const assetUrlToIndex = new Map<string, number>();
  const dataUrlPromiseCache = new Map<string, Promise<string>>();
  const assets: string[] = [];

  const fetchAsDataUrl = async (resolvedUrl: string): Promise<string> => {
    if (!resolvedUrl || resolvedUrl.startsWith('data:') || resolvedUrl.startsWith('blob:')) {
      return resolvedUrl;
    }
    const existing = dataUrlPromiseCache.get(resolvedUrl);
    if (existing) return existing;

    const task = (async () => {
      try {
        const res = await fetch(resolvedUrl, { credentials: 'same-origin' });
        if (!res.ok) return resolvedUrl;
        const blob = await res.blob();
        return await blobToDataUrl(blob);
      } catch {
        return resolvedUrl;
      }
    })();

    dataUrlPromiseCache.set(resolvedUrl, task);
    return task;
  };

  const getAssetPlaceholder = async (rawUrl: string, baseHref: string): Promise<string> => {
    if (!rawUrl || rawUrl.startsWith('data:')) return rawUrl;
    let resolved = rawUrl;
    try {
      resolved = new URL(rawUrl, baseHref).href;
    } catch {
      return rawUrl;
    }

    if (!resolved.startsWith(baseOrigin)) {
      return rawUrl;
    }

    const existingIdx = assetUrlToIndex.get(resolved);
    if (existingIdx !== undefined) {
      return `__TOUR_ASSET_${existingIdx}__`;
    }

    const dataUrl = await fetchAsDataUrl(resolved);
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      return rawUrl;
    }

    const idx = assets.push(dataUrl) - 1;
    assetUrlToIndex.set(resolved, idx);
    return `__TOUR_ASSET_${idx}__`;
  };

  const inlineCssUrls = async (cssText: string, baseHref: string, isFontFace: boolean): Promise<string> => {
    const matches = Array.from(cssText.matchAll(/url\((['"]?)([^)'"]+)\1\)/g));
    if (matches.length === 0) return cssText;

    let result = cssText;
    for (const m of matches) {
      const fullMatch = m[0];
      const rawUrl = m[2]?.trim();
      if (!rawUrl || rawUrl.startsWith('data:') || rawUrl.startsWith('#')) continue;
      let resolved: string;
      try {
        resolved = new URL(rawUrl, baseHref).href;
      } catch {
        continue;
      }
      if (!resolved.startsWith(baseOrigin)) continue;
      if (isFontFace && !CORE_FONT_FAMILY_REGEX.test(cssText)) continue;

      const dataUrl = await fetchAsDataUrl(resolved);
      if (dataUrl.startsWith('data:')) {
        result = result.split(fullMatch).join(`url("${dataUrl}")`);
      }
    }
    return result;
  };

  const registerDataUrlAsset = (dataUrl: string): string => {
    if (!dataUrl || !dataUrl.startsWith('data:')) return '';
    const idx = assets.push(dataUrl) - 1;
    return `__TOUR_ASSET_${idx}__`;
  };

  return { assets, getAssetPlaceholder, inlineCssUrls, registerDataUrlAsset };
}

function normalizeFontFamilyName(name: string): string {
  return name.trim().replace(/^["']+|["']+$/g, '').toLowerCase();
}

async function collectFontEmbedCssForNodes(
  nodes: HTMLElement[],
  doc: Document,
  inlineCssUrls: (cssText: string, baseHref: string, isFontFace: boolean) => Promise<string>
): Promise<string> {
  const origin = window.location.origin;
  const win = doc.defaultView || window;
  const usedFonts = new Set<string>([
    'amiri',
    'amiri quran',
    'scheherazade new',
    'noto naskh arabic',
    'cairo',
    'font awesome 6 free',
    'font awesome 6 solid',
  ]);

  for (const root of nodes) {
    const elements: HTMLElement[] = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
    for (const el of elements) {
      try {
        const ff = el.style?.fontFamily || win.getComputedStyle(el).fontFamily;
        if (ff) {
          ff.split(',').forEach((part) => {
            const norm = normalizeFontFamilyName(part);
            if (norm) usedFonts.add(norm);
          });
        }
      } catch {}
    }
  }

  const fontFaceRules: string[] = [];
  for (const sheet of Array.from(doc.styleSheets)) {
    const sheetHref = sheet.href || doc.baseURI || origin;
    if (sheet.href && !sheet.href.startsWith(origin)) continue;

    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;

    for (const rule of Array.from(rules)) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
      const fontRule = rule as CSSFontFaceRule;
      const familyName = normalizeFontFamilyName(fontRule.style.getPropertyValue('font-family') || '');
      if (familyName && !usedFonts.has(familyName)) continue;
      try {
        fontFaceRules.push(await inlineCssUrls(rule.cssText, sheetHref, false));
      } catch {
        fontFaceRules.push(rule.cssText);
      }
    }
  }

  return fontFaceRules.join('\n');
}

function isCanvasNonBlank(canvas: HTMLCanvasElement): boolean {
  try {
    if (!canvas || canvas.width < 10 || canvas.height < 10) return false;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    if (!data || data.length < 16) return false;
    const r0 = data[0];
    const g0 = data[1];
    const b0 = data[2];
    const a0 = data[3];
    const totalPixels = canvas.width * canvas.height;
    const step = Math.max(1, Math.floor(totalPixels / 800));
    for (let p = 0; p < totalPixels; p += step) {
      const i = p * 4;
      const diff =
        Math.abs(data[i] - r0) +
        Math.abs(data[i + 1] - g0) +
        Math.abs(data[i + 2] - b0) +
        Math.abs(data[i + 3] - a0);
      if (diff > 18) return true;
    }
    return false;
  } catch {
    return canvas.width > 10 && canvas.height > 10;
  }
}

async function waitForMushafPagesReady(doc: Document): Promise<void> {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    const p1 = doc.getElementById('page-1');
    const p2 = doc.getElementById('page-2');
    const p1Ready = Boolean(
      p1 &&
      p1.querySelector('.ayah-text-block') &&
      (p1.textContent || '').trim().length > 20 &&
      p1.getBoundingClientRect().height > 100
    );
    const p2Ready = Boolean(
      p2 &&
      p2.querySelector('.ayah-text-block') &&
      (p2.textContent || '').trim().length > 20 &&
      p2.getBoundingClientRect().height > 100
    );
    if (p1Ready && p2Ready) break;
    await sleep(70);
  }
  try {
    if ((doc as any).fonts?.ready) {
      await Promise.race([(doc as any).fonts.ready, sleep(1500)]);
    }
  } catch {}
  await nextFrame();
  await nextFrame();
}

async function captureMushafPageScreenshot(
  pageEl: HTMLElement,
  doc: Document,
  fontEmbedCss: string
): Promise<string> {
  const win = doc.defaultView || window;
  const computed = win.getComputedStyle(pageEl);
  let resolvedBg = computed.backgroundColor || '';
  if (!resolvedBg || resolvedBg === 'transparent' || resolvedBg === 'rgba(0, 0, 0, 0)') {
    const isDark =
      doc.documentElement.classList.contains('dark') ||
      doc.documentElement.classList.contains('theme-black-gold') ||
      doc.body?.classList.contains('dark');
    resolvedBg = isDark ? '#000000' : '#ffffff';
  }

  const rect = pageEl.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || pageEl.offsetWidth || 390));
  const height = Math.max(1, Math.round(rect.height || pageEl.offsetHeight || 540));

  try {
    const canvas = await toCanvas(pageEl, {
      width,
      height,
      pixelRatio: 2,
      backgroundColor: resolvedBg,
      ...(fontEmbedCss ? { fontEmbedCSS: fontEmbedCss } : { skipFonts: true }),
    });
    if (isCanvasNonBlank(canvas)) {
      return canvas.toDataURL('image/png');
    }
  } catch (err) {
    console.warn('toCanvas mushaf page capture failed, trying html2canvas fallback:', err);
  }

  try {
    const rootStyleAttr = doc.documentElement.getAttribute('style') || '';
    const rootClassName = doc.documentElement.className || '';
    const canvas = await safeHtml2Canvas(pageEl, {
      scale: 2,
      backgroundColor: resolvedBg,
      width,
      height,
      onclone: (clonedDoc) => {
        try {
          if (rootClassName) clonedDoc.documentElement.className = rootClassName;
          if (rootStyleAttr) clonedDoc.documentElement.setAttribute('style', rootStyleAttr);
          const fixStyle = clonedDoc.createElement('style');
          fixStyle.textContent = `
            .ayah-text-block span[style*="display: contents"],
            .ayah-text-block > span[style*="display: contents"] span,
            .quran-word-span {
              display: inline !important;
            }
          `;
          clonedDoc.head.appendChild(fixStyle);
          clonedDoc.querySelectorAll<HTMLElement>('[style*="contents"]').forEach((el) => {
            if (el.style.display === 'contents') {
              el.style.display = 'inline';
            }
          });
        } catch {}
      },
    });
    if (isCanvasNonBlank(canvas)) {
      return canvas.toDataURL('image/png');
    }
  } catch (err) {
    console.warn('html2canvas mushaf page capture fallback failed:', err);
  }

  return '';
}

async function collectIframeStylesAndLinks(
  doc: Document,
  inlineCssUrls: (cssText: string, baseHref: string, isFontFace: boolean) => Promise<string>
): Promise<{ appCss: string; fontLinksHtml: string }> {
  const origin = window.location.origin;
  const cssParts: string[] = [];
  const externalLinks: string[] = [];

  for (const link of Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('http') && !href.startsWith(origin)) {
      externalLinks.push(`<link rel="stylesheet" href="${href.replace(/"/g, '&quot;')}" />`);
    }
  }

  for (const sheet of Array.from(doc.styleSheets)) {
    const sheetHref = sheet.href || doc.baseURI || origin;
    if (sheet.href && !sheet.href.startsWith(origin)) {
      continue;
    }

    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;

    const rawChunk: string[] = [];
    for (const rule of Array.from(rules)) {
      const text = rule.cssText;
      if (!text) continue;
      if (text.includes('url(')) {
        const isFontFace = rule.type === CSSRule.FONT_FACE_RULE || text.startsWith('@font-face');
        rawChunk.push(await inlineCssUrls(text, sheetHref, isFontFace));
      } else {
        rawChunk.push(text);
      }
    }
    cssParts.push(rawChunk.join('\n'));
  }

  const appCss = cssParts
    .join('\n')
    .replace(/<\/style/gi, '<\\/style');

  return {
    appCss,
    fontLinksHtml: externalLinks.join('\n'),
  };
}

async function captureSingleSlideDom(
  doc: Document,
  getAssetPlaceholder: (rawUrl: string, baseHref: string) => Promise<string>,
  mushafPageScreenshots?: Record<number, string>
): Promise<CapturedSlideSnapshot> {
  const rootEl = doc.getElementById('root');
  if (!rootEl) {
    return {
      html: '',
      htmlClass: doc.documentElement.className || '',
      rootStyle: doc.documentElement.getAttribute('style') || '',
      bodyClass: doc.body?.className || '',
      bodyStyle: doc.body?.getAttribute('style') || '',
      lang: doc.documentElement.lang === 'en' ? 'en' : 'ar',
      dir: doc.documentElement.dir === 'ltr' ? 'ltr' : 'rtl',
    };
  }

  // Wait briefly for visible images in viewport to finish loading
  const imgs = Array.from(rootEl.querySelectorAll<HTMLImageElement>('img'));
  await Promise.all(
    imgs.slice(0, 40).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          window.setTimeout(done, 250);
        })
    )
  );

  // Capture live canvas bitmaps before cloning
  const liveCanvases = Array.from(rootEl.querySelectorAll<HTMLCanvasElement>('canvas'));
  const canvasDataUrls = liveCanvases.map((c) => {
    try {
      return c.toDataURL('image/png');
    } catch {
      return '';
    }
  });

  // Sync live form control states into DOM attributes before cloning
  const liveInputs = Array.from(rootEl.querySelectorAll<HTMLInputElement>('input'));
  const inputValues = liveInputs.map((inp) => ({ value: inp.value, checked: inp.checked }));
  const liveTextareas = Array.from(rootEl.querySelectorAll<HTMLTextAreaElement>('textarea'));
  const textareaValues = liveTextareas.map((ta) => ta.value);
  const liveSelects = Array.from(rootEl.querySelectorAll<HTMLSelectElement>('select'));
  const selectIndices = liveSelects.map((sel) => sel.selectedIndex);

  const clone = rootEl.cloneNode(true) as HTMLElement;

  // Apply form states to clone
  Array.from(clone.querySelectorAll<HTMLInputElement>('input')).forEach((inp, idx) => {
    const state = inputValues[idx];
    if (!state) return;
    inp.setAttribute('value', state.value);
    if (state.checked) inp.setAttribute('checked', 'checked');
    else inp.removeAttribute('checked');
  });
  Array.from(clone.querySelectorAll<HTMLTextAreaElement>('textarea')).forEach((ta, idx) => {
    if (textareaValues[idx] !== undefined) ta.textContent = textareaValues[idx];
  });
  Array.from(clone.querySelectorAll<HTMLSelectElement>('select')).forEach((sel, idx) => {
    const selectedIdx = selectIndices[idx];
    if (selectedIdx >= 0 && sel.options[selectedIdx]) {
      Array.from(sel.options).forEach((opt, optIdx) => {
        if (optIdx === selectedIdx) opt.setAttribute('selected', 'selected');
        else opt.removeAttribute('selected');
      });
    }
  });

  // Replace canvases with crisp static <img> snapshots
  Array.from(clone.querySelectorAll<HTMLCanvasElement>('canvas')).forEach((clonedCanvas, idx) => {
    const dataUrl = canvasDataUrls[idx];
    if (!dataUrl || !clonedCanvas.parentNode) return;
    const replacement = doc.createElement('img');
    replacement.setAttribute('src', dataUrl);
    if (clonedCanvas.className) replacement.setAttribute('class', clonedCanvas.className);
    const style = clonedCanvas.getAttribute('style');
    if (style) replacement.setAttribute('style', style);
    clonedCanvas.parentNode.replaceChild(replacement, clonedCanvas);
  });

  // Remove script tags inside captured subtree
  clone.querySelectorAll('script').forEach((s) => s.remove());

  // Reset scrollTop on scrollable cloned elements just in case
  const baseHref = doc.baseURI || window.location.origin;

  // Replace all <img> src with deduplicated placeholders
  const clonedImgs = Array.from(clone.querySelectorAll<HTMLImageElement>('img'));
  await Promise.all(
    clonedImgs.map(async (img) => {
      const rawSrc = img.getAttribute('src');
      if (!rawSrc || rawSrc.startsWith('data:') || rawSrc.startsWith('__TOUR_ASSET_')) return;
      const placeholder = await getAssetPlaceholder(rawSrc, baseHref);
      img.setAttribute('src', placeholder);
      img.removeAttribute('loading');
    })
  );

  // Replace inline CSS background-image url(...) if referencing local assets
  const styledEls = Array.from(clone.querySelectorAll<HTMLElement>('[style*="url("]'));
  await Promise.all(
    styledEls.map(async (el) => {
      let styleText = el.getAttribute('style') || '';
      const matches = Array.from(styleText.matchAll(/url\((['"]?)([^)'"]+)\1\)/g));
      for (const m of matches) {
        const rawUrl = m[2]?.trim();
        if (!rawUrl || rawUrl.startsWith('data:')) continue;
        const placeholder = await getAssetPlaceholder(rawUrl, baseHref);
        if (placeholder !== rawUrl) {
          styleText = styleText.split(m[0]).join(`url("${placeholder}")`);
        }
      }
      el.setAttribute('style', styleText);
    })
  );

  // Replace Mushaf pages 1 & 2 with captured high-DPI screenshots so Quranic script always renders cleanly
  if (mushafPageScreenshots && Object.keys(mushafPageScreenshots).length > 0) {
    const pagesContainer = clone.querySelector('#pages-container');
    if (pagesContainer) {
      Array.from(pagesContainer.children).forEach((child) => {
        const pageEl = child as HTMLElement;
        const pageNumAttr = Number(pageEl.getAttribute('data-page') || pageEl.id?.replace('page-', ''));
        const placeholder = mushafPageScreenshots[pageNumAttr];
        if (placeholder) {
          pageEl.innerHTML = '';
          pageEl.style.padding = '0';
          pageEl.style.margin = '0';
          pageEl.style.border = 'none';
          const screenshotImg = doc.createElement('img');
          screenshotImg.setAttribute('src', placeholder);
          screenshotImg.setAttribute('alt', `القرآن الكريم - الصفحة ${pageNumAttr}`);
          screenshotImg.setAttribute(
            'style',
            'width:100%;height:auto;display:block;pointer-events:none;user-select:none;'
          );
          pageEl.appendChild(screenshotImg);
        } else if (pageNumAttr > 2 || !pageNumAttr) {
          pageEl.remove();
        }
      });
    }
  }

  return {
    html: clone.innerHTML,
    htmlClass: doc.documentElement.className || '',
    rootStyle: doc.documentElement.getAttribute('style') || '',
    bodyClass: doc.body?.className || '',
    bodyStyle: doc.body?.getAttribute('style') || '',
    lang: doc.documentElement.lang === 'en' ? 'en' : 'ar',
    dir: doc.documentElement.dir === 'ltr' ? 'ltr' : 'rtl',
  };
}

export async function captureRealAppTourSnapshots(
  params: CaptureTourExportParams
): Promise<StandaloneExportOptions> {
  const { slides, iframe, initialLang, initialNightMode, themeVariant, onProgress } = params;
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    throw new Error('Live preview frame unavailable for capture');
  }

  const { assets, getAssetPlaceholder, inlineCssUrls, registerDataUrlAsset } = createAssetInliner(window.location.origin);
  const snapshots: CapturedSlideSnapshot[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    onProgress?.(i + 1, slides.length, initialLang === 'en' ? slide.titleEn : slide.titleAr);

    win.postMessage(
      {
        type: 'TOUR_SYNC_STATE',
        page: slide.page,
        navParams: slide.navParams ?? null,
        language: initialLang,
        isNightMode: initialNightMode,
        themeVariant,
      },
      window.location.origin
    );

    // Allow React mount, async JSON reads (Quran/Tafseer/Adhkar/PrayerTimes), and layout to settle
    await nextFrame();
    await nextFrame();
    await sleep(380);
    await nextFrame();

    const isQuranMushafSlide =
      slide.id === 'quran-mushaf' ||
      (slide.page === 'quran' && slide.navParams?.readingMode === 'mushaf');

    if (isQuranMushafSlide) {
      await waitForMushafPagesReady(doc);
    }

    // Ensure scroll container starts cleanly at top before capturing DOM snapshot
    try {
      const scrollers = doc.body?.querySelectorAll<HTMLElement>('#mushaf-content, main, .overflow-y-auto, [class*="overflow-y-auto"]');
      scrollers?.forEach((el) => {
        el.scrollTop = 0;
      });
    } catch {}

    let mushafPageScreenshots: Record<number, string> | undefined;
    if (isQuranMushafSlide) {
      const page1El = doc.getElementById('page-1');
      const page2El = doc.getElementById('page-2');
      const targetNodes = [page1El, page2El].filter((el): el is HTMLElement => Boolean(el));
      if (targetNodes.length > 0) {
        const fontEmbedCss = await collectFontEmbedCssForNodes(targetNodes, doc, inlineCssUrls);
        const capturedMap: Record<number, string> = {};
        for (const [pageNum, el] of [
          [1, page1El],
          [2, page2El],
        ] as const) {
          if (!el) continue;
          const pngDataUrl = await captureMushafPageScreenshot(el, doc, fontEmbedCss);
          if (pngDataUrl) {
            const placeholder = registerDataUrlAsset(pngDataUrl);
            if (placeholder) capturedMap[pageNum] = placeholder;
          }
        }
        if (Object.keys(capturedMap).length > 0) {
          mushafPageScreenshots = capturedMap;
        }
      }
    }

    const snap = await captureSingleSlideDom(doc, getAssetPlaceholder, mushafPageScreenshots);
    snapshots.push(snap);
  }

  // Collect full app CSS + FontAwesome/core fonts once after all styles have resolved
  const { appCss, fontLinksHtml } = await collectIframeStylesAndLinks(doc, inlineCssUrls);

  return {
    slides,
    initialLang,
    initialNightMode,
    themeVariant,
    appCss,
    fontLinksHtml,
    assets,
    snapshots,
  };
}

export function buildStandaloneTourHtml(options: StandaloneExportOptions): string {
  const {
    slides,
    initialLang,
    initialNightMode,
    themeVariant,
    appCss = '',
    fontLinksHtml = '',
    assets = [],
    snapshots = [],
  } = options;

  const serializedSlides = escapeJsonForScriptTag(slides);
  const serializedSnapshots = escapeJsonForScriptTag(snapshots);
  const serializedAssets = escapeJsonForScriptTag(assets);
  const serializedAppCss = escapeJsonForScriptTag(appCss);
  const serializedFontLinks = escapeJsonForScriptTag(fontLinksHtml);

  const variantPalette: Record<string, { accent: string; accentDark: string; pageBg: string; topBarBg: string }> = {
    gold: { accent: '#ca8a04', accentDark: '#92400e', pageBg: '#FEF9C3', topBarBg: '#b45309' },
    sky: { accent: '#0284c7', accentDark: '#0369a1', pageBg: '#F0F9FF', topBarBg: '#0284c7' },
    emerald: { accent: '#047857', accentDark: '#065f46', pageBg: '#F0FDF4', topBarBg: '#047857' },
    burgundy: { accent: '#881337', accentDark: '#9f1239', pageBg: '#FFF1F2', topBarBg: '#881337' },
  };
  const activePalette = variantPalette[themeVariant] || variantPalette.gold;

  return `<!DOCTYPE html>
<html lang="${initialLang}" dir="${initialLang === 'ar' ? 'rtl' : 'ltr'}" class="${initialNightMode ? 'night' : 'day'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>مُصْحَفُ أَحْمَدَ وَلَيْلَى — الجولة التعريفية التفاعلية</title>
  ${fontLinksHtml}
  <style>
    :root {
      --accent: ${activePalette.accent};
      --accent-dark: ${activePalette.accentDark};
      --page-bg: ${activePalette.pageBg};
      --topbar-bg: ${activePalette.topBarBg};
      --text-main: #1f1708;
      --text-muted: #5c4b2c;
      --card-bg: linear-gradient(180deg, #fffef9 0%, #fef8eb 60%, #fdf2db 100%);
      --card-border: rgba(254, 240, 199, 0.95);
      --card-shadow: 0 5px 0 rgba(217, 119, 6, 0.2), 0 14px 28px -4px rgba(180, 115, 20, 0.18), inset 0 2px 2px rgba(255, 255, 255, 0.92);
      --btn-bg: linear-gradient(180deg, #fffef9 0%, #fef9ed 65%, #fdf4df 100%);
      --btn-shadow: 0 4px 0 rgba(217, 119, 6, 0.16), 0 8px 16px -3px rgba(180, 115, 20, 0.14), inset 0 2px 1px rgba(255, 255, 255, 0.9);
      --gold-card: linear-gradient(140deg, #FFFDF7 0%, #FEF8E7 18%, #FCE8AB 50%, #F5D374 80%, #E8BE48 100%);
      --phone-bezel: linear-gradient(145deg, #334155 0%, #0f172a 100%);
      --pill-bg: #c25e00;
      --pill-text: #ffffff;
    }

    html.night {
      --accent: #f59e0b;
      --accent-dark: #fbbf24;
      --page-bg: #050505;
      --topbar-bg: #111111;
      --text-main: #f8fafc;
      --text-muted: #cbd5e1;
      --card-bg: linear-gradient(180deg, #171717 0%, #111111 70%, #0b0b0b 100%);
      --card-border: rgba(245, 158, 11, 0.25);
      --card-shadow: 0 6px 0 rgba(0, 0, 0, 0.6), 0 16px 32px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      --btn-bg: linear-gradient(180deg, #1f1f23 0%, #151518 100%);
      --btn-shadow: 0 4px 0 rgba(0, 0, 0, 0.65), 0 8px 16px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      --gold-card: linear-gradient(145deg, #1d1810 0%, #16120c 55%, #0e0b07 100%);
      --phone-bezel: linear-gradient(145deg, #27272a 0%, #09090b 100%);
      --pill-bg: #d97706;
      --pill-text: #000000;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%;
      font-family: "Cairo", "Segoe UI", Tahoma, Arial, sans-serif;
      background: var(--page-bg);
      color: var(--text-main);
      overflow: hidden;
      user-select: none;
    }

    .app-shell {
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      flex-shrink: 0;
      padding: 10px 14px 6px;
      z-index: 30;
    }
    .topbar-card {
      max-width: 1280px;
      margin: 0 auto;
      padding: 10px 14px;
      border-radius: 18px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      box-shadow: var(--card-shadow);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }
    .brand-group { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
    .brand-badge {
      width: 38px; height: 38px; border-radius: 12px;
      background: var(--pill-bg); color: var(--pill-text);
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 18px; flex-shrink: 0;
    }
    .brand-title { font-size: 14px; font-weight: 900; color: var(--accent-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .brand-sub { font-size: 11px; color: var(--text-muted); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .controls-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .btn-3d {
      border: 1px solid var(--card-border);
      background: var(--btn-bg); color: var(--text-main);
      box-shadow: var(--btn-shadow);
      border-radius: 12px; padding: 8px 12px;
      font-family: inherit; font-size: 12px; font-weight: 800;
      cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
    }
    .btn-3d:active { transform: scale(0.96); }
    .btn-pill {
      border: none; background: var(--pill-bg); color: var(--pill-text);
      border-radius: 999px; padding: 8px 16px;
      font-family: inherit; font-size: 12px; font-weight: 900;
      cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
      box-shadow: 0 4px 12px rgba(194, 94, 0, 0.25);
    }

    .progress-wrap { max-width: 1280px; margin: 6px auto 0; padding: 0 4px; }
    .progress-track { height: 5px; width: 100%; background: rgba(0,0,0,0.1); border-radius: 999px; overflow: hidden; }
    html.night .progress-track { background: rgba(255,255,255,0.12); }
    .progress-fill { height: 100%; width: 0%; background: var(--accent); transition: width 0.15s linear; }

    .stage {
      flex: 1; min-height: 0;
      max-width: 1280px; width: 100%; margin: 0 auto;
      padding: 6px 14px 14px;
      display: grid;
      grid-template-columns: minmax(300px, 420px) minmax(0, 1fr);
      gap: 20px; align-items: stretch;
      overflow: hidden;
    }

    .phone-slot {
      display: flex; align-items: center; justify-content: center;
      min-height: 0; height: 100%; overflow: hidden; position: relative;
    }
    .phone-scale-box { position: relative; flex-shrink: 0; direction: ltr; }
    .phone-bezel {
      width: 414px; height: 826px; padding: 12px; border-radius: 42px;
      background: var(--phone-bezel);
      box-shadow: 0 24px 55px -12px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.25);
      display: flex; flex-direction: column;
      transform-origin: top left;
    }
    .phone-notch {
      width: 112px; height: 16px; background: #09090b; border-radius: 999px;
      margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; gap: 6px;
      flex-shrink: 0;
    }
    .phone-cam { width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; opacity: 0.55; }
    .phone-screen-wrap {
      width: 390px; height: 780px; border-radius: 30px; overflow: hidden;
      background: #ffffff; border: 1px solid rgba(255,255,255,0.15);
      position: relative;
    }
    html.night .phone-screen-wrap { background: #000000; }
    #live-page-frame {
      width: 390px; height: 780px; border: none; display: block;
    }

    .tap-expand-overlay {
      display: none; position: absolute; inset: 0; z-index: 10; background: transparent;
      border: none; cursor: pointer; align-items: flex-end; justify-content: center; padding-bottom: 14px;
    }
    .tap-expand-badge {
      padding: 6px 14px; border-radius: 999px; background: rgba(0,0,0,0.7);
      color: #fff; font-size: 11px; font-weight: 900; font-family: inherit;
      backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15);
    }

    .spotlight-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 26px; padding: 22px; box-shadow: var(--card-shadow);
      display: flex; flex-direction: column; gap: 15px; overflow-y: auto; max-height: 100%;
    }
    .spot-head { display: flex; align-items: center; gap: 14px; }
    .spot-icon {
      width: 52px; height: 52px; border-radius: 16px;
      background: var(--gold-card); border: 1.5px solid rgba(217, 119, 6, 0.45);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 900; color: var(--accent-dark); flex-shrink: 0;
    }
    .spot-cat { font-size: 12px; font-weight: 800; color: var(--accent); margin-bottom: 2px; }
    .spot-title { font-size: 21px; font-weight: 900; line-height: 1.25; }
    .spot-desc { font-size: 14px; color: var(--text-muted); font-weight: 700; line-height: 1.65; }
    .features-heading { font-size: 13px; font-weight: 900; color: var(--accent); margin-bottom: 8px; }
    .features-list { display: flex; flex-direction: column; gap: 9px; }
    .feature-item {
      background: var(--btn-bg); border: 1px solid var(--card-border);
      box-shadow: var(--btn-shadow); border-radius: 15px;
      padding: 11px 13px; display: flex; align-items: flex-start; gap: 10px;
      font-size: 13px; font-weight: 800; line-height: 1.5;
    }
    .feature-num {
      width: 22px; height: 22px; border-radius: 7px; background: var(--pill-bg); color: var(--pill-text);
      font-size: 11px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .slides-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
      gap: 7px; max-height: 200px; overflow-y: auto; padding: 2px;
    }
    .slide-chip {
      border: 1px solid var(--card-border); background: var(--btn-bg); color: var(--text-main);
      box-shadow: var(--btn-shadow); border-radius: 12px; padding: 8px 10px;
      font-family: inherit; font-size: 11px; font-weight: 800; text-align: start;
      cursor: pointer; display: flex; align-items: center; gap: 5px;
    }
    .slide-chip.active { background: var(--pill-bg); color: var(--pill-text); border-color: transparent; }

    /* Mobile Responsive Layout (< 1024px) */
    .mobile-bottom-dock, .mobile-fs-topbar, .details-sheet-backdrop { display: none; }

    @media (max-width: 1023px) {
      .topbar .controls-row .desktop-only-ctrl { display: none; }
      .brand-sub { display: none; }
      .stage { grid-template-columns: 1fr; padding: 4px 10px 72px; }
      .spotlight-card { display: none; }
      .tap-expand-overlay { display: flex; }

      .mobile-bottom-dock {
        display: flex; position: fixed; bottom: 12px; left: 12px; right: 12px; z-index: 60;
        align-items: center; justify-content: center; pointer-events: none;
      }
      .mobile-dock-pill {
        pointer-events: auto; width: 100%; max-width: 440px; display: flex; align-items: center; justify-content: space-around; gap: 4px;
        padding: 5px; border-radius: 999px; background: var(--card-bg);
        border: 1px solid var(--card-border); box-shadow: 0 12px 30px rgba(0,0,0,0.22);
      }
      .mobile-icon-btn {
        width: 40px; height: 40px; padding: 0; border-radius: 999px;
        display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .mobile-fs-only-btn { display: none; }
      body.mobile-fullscreen .mobile-fs-only-btn { display: inline-flex; }

      body.mobile-fullscreen .topbar { display: none; }
      body.mobile-fullscreen .phone-slot {
        position: fixed; inset: 0; z-index: 40; background: #000; padding: 0;
      }
      body.mobile-fullscreen .phone-scale-box,
      body.mobile-fullscreen .phone-bezel,
      body.mobile-fullscreen .phone-screen-wrap,
      body.mobile-fullscreen #live-page-frame {
        width: 100% !important; height: 100% !important; transform: none !important;
        padding: 0 !important; border-radius: 0 !important; border: none !important;
      }
      body.mobile-fullscreen .phone-notch,
      body.mobile-fullscreen .tap-expand-overlay { display: none !important; }

      body.mobile-fullscreen:not(.fs-controls-visible) .mobile-bottom-dock {
        display: none !important;
      }

      .details-sheet-backdrop.open {
        display: flex; position: fixed; inset: 0; z-index: 80;
        background: rgba(0,0,0,0.55); align-items: flex-end; justify-content: center;
      }
      .details-sheet {
        width: 100%; max-width: 520px; max-height: 82dvh; overflow-y: auto;
        border-radius: 24px 24px 0 0; padding: 18px;
        background: var(--card-bg); border-top: 1px solid var(--card-border);
        display: flex; flex-direction: column; gap: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-card">
        <div class="brand-group">
          <div class="brand-badge">۞</div>
          <div style="min-width:0; flex:1;">
            <div class="brand-title" id="brand-title"></div>
            <div class="brand-sub" id="brand-sub"></div>
          </div>
        </div>
        <div class="controls-row">
          <button class="btn-3d desktop-only-ctrl" id="btn-prev" type="button"></button>
          <button class="btn-pill desktop-only-ctrl" id="btn-play" type="button"></button>
          <button class="btn-3d desktop-only-ctrl" id="btn-next" type="button"></button>
          <span class="btn-3d" id="slide-counter" style="cursor:default;">1 / ${slides.length}</span>
          <button class="btn-3d desktop-only-ctrl" id="btn-lang" type="button"></button>
          <button class="btn-3d" id="btn-theme" type="button"></button>
        </div>
      </div>
      <div class="progress-wrap">
        <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
      </div>
    </header>

    <main class="stage">
      <section class="phone-slot" id="phone-slot">
        <div class="phone-scale-box" id="phone-scale-box">
          <div class="phone-bezel" id="phone-bezel">
            <div class="phone-notch"><span class="phone-cam"></span></div>
            <div class="phone-screen-wrap">
              <iframe id="live-page-frame" title="Live App Screen"></iframe>
              <button class="tap-expand-overlay" id="btn-tap-fullscreen" type="button">
                <span class="tap-expand-badge" id="tap-expand-label"></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="spotlight-card" id="desktop-spotlight"></section>
    </main>
  </div>

  <!-- Mobile Floating Bottom Dock (Single unified pill card, icon-only) -->
  <div class="mobile-bottom-dock">
    <div class="mobile-dock-pill">
      <button class="btn-3d mobile-icon-btn" id="m-btn-prev" type="button"></button>
      <button class="btn-pill mobile-icon-btn" id="m-btn-play" type="button"></button>
      <button class="btn-3d mobile-icon-btn" id="m-btn-next" type="button"></button>
      <button class="btn-3d mobile-icon-btn" id="m-btn-lang" type="button"></button>
      <button class="btn-3d mobile-icon-btn mobile-fs-only-btn" id="btn-exit-fs" type="button"></button>
      <button class="btn-pill mobile-icon-btn" id="btn-open-details" type="button"></button>
    </div>
  </div>

  <!-- Mobile Details Bottom Sheet -->
  <div class="details-sheet-backdrop" id="details-backdrop">
    <div class="details-sheet" id="mobile-details-sheet"></div>
  </div>

  <script>
    (function() {
      var SLIDES = ${serializedSlides};
      var SNAPSHOTS = ${serializedSnapshots};
      var ASSETS = ${serializedAssets};
      var APP_CSS = ${serializedAppCss};
      var FONT_LINKS = ${serializedFontLinks};

      var state = {
        index: 0,
        lang: ${JSON.stringify(initialLang)},
        night: ${JSON.stringify(initialNightMode)},
        playing: true,
        scrollRaf: null,
        advanceTimer: null
      };

      var elHtml = document.documentElement;
      var frame = document.getElementById('live-page-frame');
      var elProgress = document.getElementById('progress-fill');

      function stopTimers() {
        if (state.scrollRaf) { cancelAnimationFrame(state.scrollRaf); state.scrollRaf = null; }
        if (state.advanceTimer) { clearTimeout(state.advanceTimer); state.advanceTimer = null; }
      }

      function updatePhoneScale() {
        var slot = document.getElementById('phone-slot');
        var box = document.getElementById('phone-scale-box');
        var bezel = document.getElementById('phone-bezel');
        if (!slot || !box || !bezel || document.body.classList.contains('mobile-fullscreen')) return;
        var r = slot.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        var s = Math.min(1, (r.width - 10) / 414, (r.height - 10) / 826);
        s = Math.max(0.36, s);
        box.style.width = Math.round(414 * s) + 'px';
        box.style.height = Math.round(826 * s) + 'px';
        bezel.style.transform = 'scale(' + s.toFixed(4) + ')';
      }

      function buildSpotlightHtml(s, isAr) {
        var feats = isAr ? s.featuresAr : s.featuresEn;
        var featHtml = feats.map(function(f, idx) {
          return '<div class="feature-item"><span class="feature-num">' + (idx + 1) + '</span><span>' + escHtml(f) + '</span></div>';
        }).join('');
        var chipsHtml = SLIDES.map(function(item, idx) {
          var cls = idx === state.index ? 'slide-chip active' : 'slide-chip';
          return '<button type="button" class="' + cls + '" data-jump-idx="' + idx + '"><span>' + (idx + 1) + '.</span><span>' + escHtml(isAr ? item.titleAr : item.titleEn) + '</span></button>';
        }).join('');

        return (
          '<div class="spot-head">' +
            '<div class="spot-icon">' + (state.index + 1) + '</div>' +
            '<div>' +
              '<div class="spot-cat">' + escHtml(isAr ? s.categoryAr : s.categoryEn) + '</div>' +
              '<h1 class="spot-title">' + escHtml(isAr ? s.titleAr : s.titleEn) + '</h1>' +
            '</div>' +
          '</div>' +
          '<p class="spot-desc">' + escHtml(isAr ? s.descriptionAr : s.descriptionEn) + '</p>' +
          '<div><div class="features-heading">' + (isAr ? 'أبرز 3 مميزات عملية في هذه الصفحة' : 'Top 3 Features on This Screen') + '</div><div class="features-list">' + featHtml + '</div></div>' +
          '<div><div class="features-heading">' + (isAr ? 'التنقل السريع (' + SLIDES.length + ' صفحة)' : 'Quick Screen Navigation (' + SLIDES.length + ')') + '</div><div class="slides-grid">' + chipsHtml + '</div></div>'
        );
      }

      function escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      function renderControls() {
        var isAr = state.lang === 'ar';
        var s = SLIDES[state.index];
        elHtml.lang = state.lang;
        elHtml.dir = isAr ? 'rtl' : 'ltr';
        elHtml.classList.toggle('night', state.night);
        elHtml.classList.toggle('day', !state.night);

        document.getElementById('brand-title').textContent = (state.index + 1) + '. ' + (isAr ? s.titleAr : s.titleEn);
        document.getElementById('brand-sub').textContent = isAr ? ('الجولة التعريفية • ' + s.categoryAr) : ('Interactive App Tour • ' + s.categoryEn);
        document.getElementById('btn-prev').textContent = isAr ? 'السابق' : 'Prev';
        document.getElementById('btn-next').textContent = isAr ? 'التالي' : 'Next';
        document.getElementById('btn-play').textContent = state.playing ? (isAr ? 'إيقاف مؤقت' : 'Pause') : (isAr ? 'تشغيل تلقائي' : 'Play');
        document.getElementById('btn-lang').textContent = isAr ? 'EN' : 'عربي';
        document.getElementById('btn-theme').textContent = state.night ? (isAr ? 'نهاري' : 'Day') : (isAr ? 'ليلي' : 'Night');
        document.getElementById('slide-counter').textContent = (state.index + 1) + ' / ' + SLIDES.length;

        document.getElementById('tap-expand-label').textContent = isAr ? 'اضغط للتكبير بكامل الشاشة' : 'Tap for Full Screen';

        var svgChevRight = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
        var svgChevLeft = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
        var svgPlay = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
        var svgPause = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
        var svgLang = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>';
        var svgShrink = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
        var svgInfo = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';

        var mPrev = document.getElementById('m-btn-prev');
        mPrev.innerHTML = isAr ? svgChevRight : svgChevLeft;
        mPrev.setAttribute('aria-label', isAr ? 'السابق' : 'Prev');
        mPrev.title = isAr ? 'السابق' : 'Prev';

        var mPlay = document.getElementById('m-btn-play');
        mPlay.innerHTML = state.playing ? svgPause : svgPlay;
        mPlay.setAttribute('aria-label', state.playing ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Play'));
        mPlay.title = state.playing ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Play');

        var mNext = document.getElementById('m-btn-next');
        mNext.innerHTML = isAr ? svgChevLeft : svgChevRight;
        mNext.setAttribute('aria-label', isAr ? 'التالي' : 'Next');
        mNext.title = isAr ? 'التالي' : 'Next';

        var mLang = document.getElementById('m-btn-lang');
        mLang.innerHTML = svgLang;
        mLang.setAttribute('aria-label', isAr ? 'تبديل اللغة' : 'Switch Language');
        mLang.title = isAr ? 'تبديل اللغة' : 'Switch Language';

        var mShrink = document.getElementById('btn-exit-fs');
        mShrink.innerHTML = svgShrink;
        mShrink.setAttribute('aria-label', isAr ? 'تصغير' : 'Shrink');
        mShrink.title = isAr ? 'تصغير' : 'Shrink';

        var mDetails = document.getElementById('btn-open-details');
        mDetails.innerHTML = svgInfo;
        mDetails.setAttribute('aria-label', isAr ? 'البيانات' : 'Details');
        mDetails.title = isAr ? 'البيانات' : 'Details';

        var spotHtml = buildSpotlightHtml(s, isAr);
        var desktopSpot = document.getElementById('desktop-spotlight');
        desktopSpot.innerHTML = spotHtml;
        var sheet = document.getElementById('mobile-details-sheet');
        sheet.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<strong style="font-size:13px;color:var(--accent-dark);">' + (isAr ? 'تفاصيل الصفحة' : 'Page Details') + '</strong>' +
            '<button type="button" class="btn-3d" id="btn-close-sheet">' + (isAr ? 'إغلاق' : 'Close') + '</button>' +
          '</div>' + spotHtml;

        document.getElementById('btn-close-sheet').onclick = function() {
          document.getElementById('details-backdrop').classList.remove('open');
        };
        document.querySelectorAll('[data-jump-idx]').forEach(function(btn) {
          btn.onclick = function() {
            state.index = Number(btn.getAttribute('data-jump-idx'));
            document.getElementById('details-backdrop').classList.remove('open');
            renderSlide();
          };
        });
      }

      function applyNightOverlayToFrameDoc(fDoc) {
        if (!fDoc || !fDoc.documentElement || !fDoc.body) return;
        if (state.night) {
          fDoc.documentElement.classList.add('theme-black-gold', 'dark');
          fDoc.body.classList.add('theme-black-gold', 'dark');
          fDoc.documentElement.classList.remove('theme-shiny-gold', 'theme-sky', 'theme-emerald', 'theme-burgundy');
          fDoc.body.classList.remove('theme-shiny-gold', 'theme-sky', 'theme-emerald', 'theme-burgundy');
          fDoc.body.style.backgroundColor = '#000000';
          fDoc.body.style.color = '#ffffff';
        }
      }

      function findPrimaryScroller(root, win) {
        var list = root.querySelectorAll('#mushaf-content, main, .overflow-y-auto, [class*="overflow-y-auto"]');
        var best = null;
        var bestScore = -1;
        for (var i = 0; i < list.length; i++) {
          var el = list[i];
          var st = win.getComputedStyle(el);
          if ((st.overflowY === 'auto' || st.overflowY === 'scroll') && el.clientHeight >= 140 && el.scrollHeight > el.clientHeight + 18) {
            var pri = (el.id === 'mushaf-content' || el.tagName === 'MAIN') ? 10000 : 0;
            if (pri + el.clientHeight > bestScore) { bestScore = pri + el.clientHeight; best = el; }
          }
        }
        return best;
      }

      function bindFrameInteractions(fDoc) {
        if (!fDoc) return;
        var down = null;
        fDoc.addEventListener('wheel', function() {
          if (state.playing) { state.playing = false; stopTimers(); renderControls(); }
        }, { passive: true });
        fDoc.addEventListener('touchmove', function() {
          if (state.playing) { state.playing = false; stopTimers(); renderControls(); }
        }, { passive: true });
        fDoc.addEventListener('pointerdown', function(e) {
          down = { x: e.clientX, y: e.clientY, t: Date.now() };
        }, { capture: true, passive: true });
        fDoc.addEventListener('pointerup', function(e) {
          if (!down || !document.body.classList.contains('mobile-fullscreen')) { down = null; return; }
          var d = Math.hypot(e.clientX - down.x, e.clientY - down.y);
          var dt = Date.now() - down.t;
          down = null;
          if (d < 12 && dt < 450) {
            document.body.classList.toggle('fs-controls-visible');
          }
        }, { capture: true, passive: true });
      }

      function renderSlide() {
        stopTimers();
        renderControls();
        elProgress.style.width = '0%';

        var snap = SNAPSHOTS[state.index];
        if (!snap) return;

        var hydratedHtml = snap.html.replace(/__TOUR_ASSET_(\\d+)__/g, function(_, num) {
          return ASSETS[Number(num)] || '';
        });

        var docHtml =
          '<!DOCTYPE html>' +
          '<html lang="' + snap.lang + '" dir="' + snap.dir + '" class="' + escHtml(snap.htmlClass) + '" style="' + escHtml(snap.rootStyle) + '">' +
          '<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
          FONT_LINKS +
          '<style>' + APP_CSS + '</style>' +
          '<style>html,body,#root{width:100%;height:100%;margin:0;padding:0;}</style>' +
          '</head>' +
          '<body class="' + escHtml(snap.bodyClass) + '" style="' + escHtml(snap.bodyStyle) + '">' +
          '<div id="root">' + hydratedHtml + '</div>' +
          '</body></html>';

        frame.onload = function() {
          try {
            var fDoc = frame.contentDocument;
            var fWin = frame.contentWindow;
            if (state.night !== ${JSON.stringify(initialNightMode)}) {
              applyNightOverlayToFrameDoc(fDoc);
            }
            bindFrameInteractions(fDoc);
            startAutoTour(fDoc, fWin);
          } catch (err) {
            startAutoTour(null, null);
          }
        };
        frame.srcdoc = docHtml;
      }

      function startAutoTour(fDoc, fWin) {
        stopTimers();
        elProgress.style.width = '0%';
        if (!state.playing) return;

        state.advanceTimer = setTimeout(function() {
          if (!state.playing) return;
          var scroller = (fDoc && fDoc.body && fWin) ? findPrimaryScroller(fDoc.body, fWin) : null;
          if (scroller) scroller.scrollTop = 0;

          var maxAvail = scroller ? Math.max(0, scroller.scrollHeight - scroller.clientHeight) : 0;
          var hasScroll = maxAvail > 18;
          var travel = hasScroll ? Math.min(maxAvail, 1600) : 0;
          var dur = hasScroll ? Math.min(6200, Math.max(3800, Math.round(travel * 3.8))) : 4500;
          var t0 = performance.now();

          function step(now) {
            if (!state.playing) return;
            var rawT = Math.min(1, (now - t0) / dur);
            var eased = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;
            elProgress.style.width = Math.round(rawT * 100) + '%';
            if (scroller && travel > 0) scroller.scrollTop = travel * eased;
            if (rawT < 1) {
              state.scrollRaf = requestAnimationFrame(step);
            } else {
              state.advanceTimer = setTimeout(function() {
                if (!state.playing) return;
                state.index = (state.index + 1) % SLIDES.length;
                renderSlide();
              }, 950);
            }
          }
          state.scrollRaf = requestAnimationFrame(step);
        }, 700);
      }

      function togglePlay() {
        state.playing = !state.playing;
        renderControls();
        if (state.playing) {
          try { startAutoTour(frame.contentDocument, frame.contentWindow); } catch { startAutoTour(null, null); }
        } else {
          stopTimers();
        }
      }

      document.getElementById('btn-prev').onclick = document.getElementById('m-btn-prev').onclick = function() {
        state.index = (state.index - 1 + SLIDES.length) % SLIDES.length;
        renderSlide();
      };
      document.getElementById('btn-next').onclick = document.getElementById('m-btn-next').onclick = function() {
        state.index = (state.index + 1) % SLIDES.length;
        renderSlide();
      };
      document.getElementById('btn-play').onclick = document.getElementById('m-btn-play').onclick = togglePlay;
      document.getElementById('btn-lang').onclick = document.getElementById('m-btn-lang').onclick = function() {
        state.lang = state.lang === 'ar' ? 'en' : 'ar';
        renderControls();
      };
      document.getElementById('btn-theme').onclick = function() {
        state.night = !state.night;
        renderSlide();
      };
      document.getElementById('btn-tap-fullscreen').onclick = function() {
        document.body.classList.add('mobile-fullscreen');
        document.body.classList.remove('fs-controls-visible');
      };
      document.getElementById('btn-exit-fs').onclick = function() {
        document.body.classList.remove('mobile-fullscreen', 'fs-controls-visible');
        updatePhoneScale();
      };
      document.getElementById('btn-open-details').onclick = function() {
        document.getElementById('details-backdrop').classList.add('open');
      };
      document.getElementById('details-backdrop').onclick = function(e) {
        if (e.target === this) this.classList.remove('open');
      };

      window.addEventListener('resize', updatePhoneScale);
      updatePhoneScale();
      renderSlide();
    })();
  </script>
</body>
</html>`;
}

export function buildPhoneScreenOnlyTourHtml(options: StandaloneExportOptions): string {
  const {
    slides,
    initialLang,
    initialNightMode,
    themeVariant,
    appCss = '',
    fontLinksHtml = '',
    assets = [],
    snapshots = [],
  } = options;

  const serializedSlides = escapeJsonForScriptTag(slides);
  const serializedSnapshots = escapeJsonForScriptTag(snapshots);
  const serializedAssets = escapeJsonForScriptTag(assets);
  const serializedAppCss = escapeJsonForScriptTag(appCss);
  const serializedFontLinks = escapeJsonForScriptTag(fontLinksHtml);

  const variantBg: Record<string, string> = {
    gold: '#FEF9C3',
    sky: '#F0F9FF',
    emerald: '#F0FDF4',
    burgundy: '#FFF1F2',
  };
  const lightBg = variantBg[themeVariant] || '#FEF9C3';

  return `<!DOCTYPE html>
<html lang="${initialLang}" dir="${initialLang === 'ar' ? 'rtl' : 'ltr'}" class="${initialNightMode ? 'night' : 'day'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>مُصْحَفُ أَحْمَدَ وَلَيْلَى — شاشة التطبيق</title>
  ${fontLinksHtml}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      height: 100dvh;
      overflow: hidden;
      font-family: "Cairo", "Segoe UI", Tahoma, Arial, sans-serif;
      background: ${initialNightMode ? '#000000' : lightBg};
      user-select: none;
    }
    html.night, html.night body { background: #000000; }

    .screen-host {
      width: 100%;
      height: 100%;
      height: 100dvh;
      display: flex;
      align-items: stretch;
      justify-content: center;
      background: transparent;
    }

    /* Frameless pure screen container: zero black phone bezel */
    #live-page-frame {
      width: 100%;
      max-width: 430px;
      height: 100%;
      height: 100dvh;
      border: none;
      display: block;
      background: ${initialNightMode ? '#000000' : '#ffffff'};
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    }
    @media (max-width: 540px) {
      #live-page-frame {
        max-width: 100%;
        box-shadow: none;
      }
    }

    /* Tap-to-reveal minimal floating icon controls (hidden by default) */
    .fs-bottom-bar {
      display: none;
      position: fixed;
      z-index: 50;
      left: 12px;
      right: 12px;
      bottom: 14px;
      pointer-events: none;
      justify-content: center;
    }

    body.controls-visible .fs-bottom-bar {
      display: flex;
    }

    .bottom-dock {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.84);
      border: 1px solid rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(10px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.34);
    }
    .dock-btn {
      border: none;
      border-radius: 999px;
      width: 38px;
      height: 38px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.14);
      color: #ffffff;
      cursor: pointer;
    }
    .dock-btn.primary {
      background: #d97706;
      color: #ffffff;
    }
    .dock-btn:active { transform: scale(0.95); }
  </style>
</head>
<body>
  <main class="screen-host">
    <iframe id="live-page-frame" title="App Screen"></iframe>
  </main>

  <div class="fs-bottom-bar">
    <div class="bottom-dock">
      <button class="dock-btn" id="btn-prev" type="button"></button>
      <button class="dock-btn primary" id="btn-play" type="button"></button>
      <button class="dock-btn" id="btn-next" type="button"></button>
      <button class="dock-btn" id="btn-theme" type="button"></button>
    </div>
  </div>

  <script>
    (function() {
      var SLIDES = ${serializedSlides};
      var SNAPSHOTS = ${serializedSnapshots};
      var ASSETS = ${serializedAssets};
      var APP_CSS = ${serializedAppCss};
      var FONT_LINKS = ${serializedFontLinks};

      var state = {
        index: 0,
        lang: ${JSON.stringify(initialLang)},
        night: ${JSON.stringify(initialNightMode)},
        playing: true,
        scrollRaf: null,
        advanceTimer: null
      };

      var elHtml = document.documentElement;
      var frame = document.getElementById('live-page-frame');

      function stopTimers() {
        if (state.scrollRaf) { cancelAnimationFrame(state.scrollRaf); state.scrollRaf = null; }
        if (state.advanceTimer) { clearTimeout(state.advanceTimer); state.advanceTimer = null; }
      }

      function escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      function renderControls() {
        var isAr = state.lang === 'ar';
        elHtml.lang = state.lang;
        elHtml.dir = isAr ? 'rtl' : 'ltr';
        elHtml.classList.toggle('night', state.night);
        elHtml.classList.toggle('day', !state.night);

        var svgChevRight = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
        var svgChevLeft = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
        var svgPlay = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
        var svgPause = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
        var svgMoon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
        var svgSun = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';

        var btnPrev = document.getElementById('btn-prev');
        btnPrev.innerHTML = isAr ? svgChevRight : svgChevLeft;
        btnPrev.setAttribute('aria-label', isAr ? 'السابق' : 'Prev');

        var btnPlay = document.getElementById('btn-play');
        btnPlay.innerHTML = state.playing ? svgPause : svgPlay;
        btnPlay.setAttribute('aria-label', state.playing ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Play'));

        var btnNext = document.getElementById('btn-next');
        btnNext.innerHTML = isAr ? svgChevLeft : svgChevRight;
        btnNext.setAttribute('aria-label', isAr ? 'التالي' : 'Next');

        var btnTheme = document.getElementById('btn-theme');
        btnTheme.innerHTML = state.night ? svgSun : svgMoon;
        btnTheme.setAttribute('aria-label', state.night ? (isAr ? 'نهاري' : 'Day') : (isAr ? 'ليلي' : 'Night'));
      }

      function applyNightOverlayToFrameDoc(fDoc) {
        if (!fDoc || !fDoc.documentElement || !fDoc.body) return;
        if (state.night) {
          fDoc.documentElement.classList.add('theme-black-gold', 'dark');
          fDoc.body.classList.add('theme-black-gold', 'dark');
          fDoc.documentElement.classList.remove('theme-shiny-gold', 'theme-sky', 'theme-emerald', 'theme-burgundy');
          fDoc.body.classList.remove('theme-shiny-gold', 'theme-sky', 'theme-emerald', 'theme-burgundy');
          fDoc.body.style.backgroundColor = '#000000';
          fDoc.body.style.color = '#ffffff';
        }
      }

      function findPrimaryScroller(root, win) {
        var list = root.querySelectorAll('#mushaf-content, main, .overflow-y-auto, [class*="overflow-y-auto"]');
        var best = null;
        var bestScore = -1;
        for (var i = 0; i < list.length; i++) {
          var el = list[i];
          var st = win.getComputedStyle(el);
          if ((st.overflowY === 'auto' || st.overflowY === 'scroll') && el.clientHeight >= 140 && el.scrollHeight > el.clientHeight + 18) {
            var pri = (el.id === 'mushaf-content' || el.tagName === 'MAIN') ? 10000 : 0;
            if (pri + el.clientHeight > bestScore) { bestScore = pri + el.clientHeight; best = el; }
          }
        }
        return best;
      }

      function bindFrameInteractions(fDoc) {
        if (!fDoc) return;
        var down = null;
        fDoc.addEventListener('wheel', function() {
          if (state.playing) { state.playing = false; stopTimers(); renderControls(); }
        }, { passive: true });
        fDoc.addEventListener('touchmove', function() {
          if (state.playing) { state.playing = false; stopTimers(); renderControls(); }
        }, { passive: true });
        fDoc.addEventListener('pointerdown', function(e) {
          down = { x: e.clientX, y: e.clientY, t: Date.now() };
        }, { capture: true, passive: true });
        fDoc.addEventListener('pointerup', function(e) {
          if (!down) return;
          var d = Math.hypot(e.clientX - down.x, e.clientY - down.y);
          var dt = Date.now() - down.t;
          down = null;
          if (d < 12 && dt < 450) {
            document.body.classList.toggle('controls-visible');
          }
        }, { capture: true, passive: true });
      }

      function startAutoTour(fDoc, fWin) {
        stopTimers();
        if (!state.playing) return;

        state.advanceTimer = setTimeout(function() {
          if (!state.playing) return;
          var scroller = (fDoc && fDoc.body && fWin) ? findPrimaryScroller(fDoc.body, fWin) : null;
          if (scroller) scroller.scrollTop = 0;

          var maxAvail = scroller ? Math.max(0, scroller.scrollHeight - scroller.clientHeight) : 0;
          var hasScroll = maxAvail > 18;
          var travel = hasScroll ? Math.min(maxAvail, 1600) : 0;
          var dur = hasScroll ? Math.min(6200, Math.max(3800, Math.round(travel * 3.8))) : 4500;
          var t0 = performance.now();

          function step(now) {
            if (!state.playing) return;
            var rawT = Math.min(1, (now - t0) / dur);
            var eased = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;
            if (scroller && travel > 0) scroller.scrollTop = travel * eased;
            if (rawT < 1) {
              state.scrollRaf = requestAnimationFrame(step);
            } else {
              state.advanceTimer = setTimeout(function() {
                if (!state.playing) return;
                state.index = (state.index + 1) % SLIDES.length;
                renderSlide();
              }, 950);
            }
          }
          state.scrollRaf = requestAnimationFrame(step);
        }, 700);
      }

      function renderSlide() {
        stopTimers();
        renderControls();
        var snap = SNAPSHOTS[state.index];
        if (!snap) return;

        var hydratedHtml = snap.html.replace(/__TOUR_ASSET_(\\d+)__/g, function(_, num) {
          return ASSETS[Number(num)] || '';
        });

        var docHtml =
          '<!DOCTYPE html>' +
          '<html lang="' + snap.lang + '" dir="' + snap.dir + '" class="' + escHtml(snap.htmlClass) + '" style="' + escHtml(snap.rootStyle) + '">' +
          '<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
          FONT_LINKS +
          '<style>' + APP_CSS + '</style>' +
          '<style>html,body,#root{width:100%;height:100%;margin:0;padding:0;}</style>' +
          '</head>' +
          '<body class="' + escHtml(snap.bodyClass) + '" style="' + escHtml(snap.bodyStyle) + '">' +
          '<div id="root">' + hydratedHtml + '</div>' +
          '</body></html>';

        frame.onload = function() {
          try {
            var fDoc = frame.contentDocument;
            var fWin = frame.contentWindow;
            if (state.night !== ${JSON.stringify(initialNightMode)}) {
              applyNightOverlayToFrameDoc(fDoc);
            }
            bindFrameInteractions(fDoc);
            startAutoTour(fDoc, fWin);
          } catch (err) {
            startAutoTour(null, null);
          }
        };
        frame.srcdoc = docHtml;
      }

      document.getElementById('btn-prev').onclick = function() {
        state.index = (state.index - 1 + SLIDES.length) % SLIDES.length;
        renderSlide();
      };
      document.getElementById('btn-next').onclick = function() {
        state.index = (state.index + 1) % SLIDES.length;
        renderSlide();
      };
      document.getElementById('btn-play').onclick = function() {
        state.playing = !state.playing;
        renderControls();
        if (state.playing) {
          try { startAutoTour(frame.contentDocument, frame.contentWindow); } catch { startAutoTour(null, null); }
        } else {
          stopTimers();
        }
      };
      document.getElementById('btn-theme').onclick = function() {
        state.night = !state.night;
        renderSlide();
      };

      renderSlide();
    })();
  </script>
</body>
</html>`;
}

export async function downloadStandaloneTourHtml(options: StandaloneExportOptions): Promise<void> {
  const isScreenOnly = options.exportMode === 'screen-only';
  const html = isScreenOnly
    ? buildPhoneScreenOnlyTourHtml(options)
    : buildStandaloneTourHtml(options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const filename = isScreenOnly
    ? `mushaf-ahmed-laila-screen-only-${options.initialLang}.html`
    : `mushaf-ahmed-laila-interactive-tour-${options.initialLang}.html`;
  const title = isScreenOnly
    ? options.initialLang === 'en'
      ? 'Phone Screen Only (Standalone HTML)'
      : 'شاشة الهاتف فقط (HTML مستقل)'
    : options.initialLang === 'en'
    ? 'Interactive App Tour (Standalone HTML)'
    : 'الجولة التعريفية التلقائية للتطبيق (HTML مستقل)';

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
      console.warn('Native HTML tour export fallback to anchor download', e);
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
}
