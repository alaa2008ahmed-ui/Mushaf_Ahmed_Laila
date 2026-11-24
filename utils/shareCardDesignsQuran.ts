import type { ShareDesignId, DesignTypographyTheme } from './shareCardDesigns';
import type { ExtraShareDesignMeta } from './shareCardDesignsExtra';
import { drawRoundRectPath } from './shareCardDesigns';

export type QuranPageShareDesignId =
  | 'quran_page_gold'
  | 'quran_page_sky'
  | 'quran_page_emerald'
  | 'quran_page_maroon'
  | 'quran_page_night';

export const DARK_QURAN_PAGE_SHARE_DESIGN_IDS: QuranPageShareDesignId[] = [
  'quran_page_night',
];

export interface QuranPageShareDesignMeta extends Omit<ExtraShareDesignMeta, 'id'> {
  id: QuranPageShareDesignId;
  isDark: boolean;
}

export interface QuranPageSharePalette {
  frameBg: string;
  pageBg: string;
  primary: string;
  secondary: string;
  deep: string;
  gold: string;
  cartoucheFill: string;
  bannerText: string;
  metaText: string;
  textColor: string;
  verseBracket: string;
  verseNumber: string;
  isDark: boolean;
}

export const QURAN_PAGE_SHARE_CARD_DESIGNS: QuranPageShareDesignMeta[] = [
  {
    id: 'quran_page_gold',
    nameAr: 'صفحة المصحف الذهبية',
    nameEn: 'Quran Page · Gold',
    descAr: 'مطابق لتصميم وألوان وزخارف صفحات القرآن بالثيم الذهبي',
    descEn: 'Exact match to the Gold theme Quran page frame, Surah banner & ornaments',
    previewColors: ['#fdf8ea', '#b45309', '#d4af37'],
    isDark: false,
  },
  {
    id: 'quran_page_sky',
    nameAr: 'صفحة المصحف السماوية',
    nameEn: 'Quran Page · Sky',
    descAr: 'مطابق لتصميم وألوان وزخارف صفحات القرآن بالثيم السماوي',
    descEn: 'Exact match to the Sky theme Quran page frame, Surah banner & ornaments',
    previewColors: ['#eff6fc', '#3573a8', '#c89b45'],
    isDark: false,
  },
  {
    id: 'quran_page_emerald',
    nameAr: 'صفحة المصحف الزمردية',
    nameEn: 'Quran Page · Emerald',
    descAr: 'مطابق لتصميم وألوان وزخارف صفحات القرآن بالثيم الزمردي',
    descEn: 'Exact match to the Emerald theme Quran page frame, Surah banner & ornaments',
    previewColors: ['#eefaf2', '#15803d', '#c89b45'],
    isDark: false,
  },
  {
    id: 'quran_page_maroon',
    nameAr: 'صفحة المصحف العنابية',
    nameEn: 'Quran Page · Maroon',
    descAr: 'مطابق لتصميم وألوان وزخارف صفحات القرآن بالثيم العنابي',
    descEn: 'Exact match to the Maroon theme Quran page frame, Surah banner & ornaments',
    previewColors: ['#fdf2f6', '#831843', '#c89b45'],
    isDark: false,
  },
  {
    id: 'quran_page_night',
    nameAr: 'صفحة المصحف الليلية',
    nameEn: 'Quran Page · Night',
    descAr: 'مطابق لتصميم وألوان وزخارف صفحات القرآن بالثيم الليلي الأسود',
    descEn: 'Exact match to the Night Black & Gold Quran page frame, banner & ornaments',
    previewColors: ['#121316', '#8b8d98', '#fbbf24'],
    isDark: true,
  },
];

const QURAN_PAGE_PALETTES: Record<QuranPageShareDesignId, QuranPageSharePalette> = {
  quran_page_gold: {
    frameBg: '#fdf8ea',
    pageBg: '#ffffff',
    primary: '#b45309',
    secondary: '#e5b842',
    deep: '#78350f',
    gold: '#d4af37',
    cartoucheFill: '#ffffff',
    bannerText: '#78350f',
    metaText: '#92400e',
    textColor: '#000000',
    verseBracket: '#d4af37',
    verseNumber: '#b91c1c',
    isDark: false,
  },
  quran_page_sky: {
    frameBg: '#eff6fc',
    pageBg: '#ffffff',
    primary: '#3573a8',
    secondary: '#6ba3d4',
    deep: '#1f4f7a',
    gold: '#c89b45',
    cartoucheFill: '#ffffff',
    bannerText: '#133a5e',
    metaText: '#1f4f7a',
    textColor: '#000000',
    verseBracket: '#16a34a',
    verseNumber: '#b91c1c',
    isDark: false,
  },
  quran_page_emerald: {
    frameBg: '#eefaf2',
    pageBg: '#ffffff',
    primary: '#15803d',
    secondary: '#4ade80',
    deep: '#14532d',
    gold: '#c89b45',
    cartoucheFill: '#ffffff',
    bannerText: '#14532d',
    metaText: '#166534',
    textColor: '#000000',
    verseBracket: '#d97706',
    verseNumber: '#b91c1c',
    isDark: false,
  },
  quran_page_maroon: {
    frameBg: '#fdf2f6',
    pageBg: '#ffffff',
    primary: '#831843',
    secondary: '#d4739a',
    deep: '#500724',
    gold: '#c89b45',
    cartoucheFill: '#ffffff',
    bannerText: '#500724',
    metaText: '#831843',
    textColor: '#000000',
    verseBracket: '#16a34a',
    verseNumber: '#b91c1c',
    isDark: false,
  },
  quran_page_night: {
    frameBg: '#121316',
    pageBg: '#000000',
    primary: '#8b8d98',
    secondary: '#52525b',
    deep: '#27272a',
    gold: '#fbbf24',
    cartoucheFill: '#0a0a0c',
    bannerText: '#f8fafc',
    metaText: '#fbbf24',
    textColor: '#ffffff',
    verseBracket: '#fbbf24',
    verseNumber: '#38bdf8',
    isDark: true,
  },
};

export function isQuranPageShareDesignId(id: string): id is QuranPageShareDesignId {
  return id in QURAN_PAGE_PALETTES;
}

export function getQuranPageDesignPalette(
  designId: QuranPageShareDesignId
): QuranPageSharePalette {
  return QURAN_PAGE_PALETTES[designId] || QURAN_PAGE_PALETTES.quran_page_gold;
}

export function getQuranPageDesignTypographyTheme(
  designId: QuranPageShareDesignId
): DesignTypographyTheme {
  const p = getQuranPageDesignPalette(designId);
  return {
    bismillahColor: p.isDark ? '#f8fafc' : p.deep,
    bismillahShadow: p.isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.04)',
    badgeBgStops: [p.cartoucheFill, p.cartoucheFill, p.frameBg],
    badgeBorder: p.primary,
    badgeInnerLine: p.gold,
    badgeStarColor: p.gold,
    badgeTextColor: p.bannerText,
    titleColor: p.bannerText,
    titleShadow: p.isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.04)',
    bodyColor: p.textColor,
    highlightColor: p.primary,
    highlightShadow: p.isDark ? 'rgba(251, 191, 36, 0.25)' : 'rgba(0, 0, 0, 0.05)',
    bulletColor: p.metaText,
    bodyShadow: p.isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.03)',
    sourceDividerColor: p.gold,
    sourceColor: p.metaText,
    footerLineColor: p.gold,
    footerStarFill: p.gold,
    footerStarStroke: p.primary,
    brandColor: p.bannerText,
    brandShadow: p.isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.05)',
    subtitleColor: p.metaText,
  };
}

// ============================================================================
// EXACT MADINAH DESIGN-1 VECTOR HELPERS (MATCHING MadinahFrameSVG & madinahFrameDesigns)
// ============================================================================

function drawRoyalCornerRosette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  palette: QuranPageSharePalette
) {
  const s = size / 28;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Outer rounded square
  drawRoundRectPath(ctx, 0.75, 0.75, 26.5, 26.5, 2.5);
  ctx.fillStyle = palette.frameBg;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // Inner gold hairline square
  drawRoundRectPath(ctx, 3.5, 3.5, 21, 21, 1.5);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 0.95;
  ctx.stroke();

  // Translucent center halo circle
  ctx.beginPath();
  ctx.arc(14, 14, 6.8, 0, Math.PI * 2);
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = palette.primary;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // 4-point crisp star (MadinahCornerRosetteSVG design 1)
  ctx.beginPath();
  ctx.moveTo(14, 5.5);
  ctx.lineTo(16.2, 11.8);
  ctx.lineTo(22.5, 14);
  ctx.lineTo(16.2, 16.2);
  ctx.lineTo(14, 22.5);
  ctx.lineTo(11.8, 16.2);
  ctx.lineTo(5.5, 14);
  ctx.lineTo(11.8, 11.8);
  ctx.closePath();
  ctx.fillStyle = palette.gold;
  ctx.fill();
  ctx.strokeStyle = palette.deep;
  ctx.lineWidth = 0.65;
  ctx.stroke();

  // Center jewel dot
  ctx.beginPath();
  ctx.arc(14, 14, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = palette.cartoucheFill;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
}

function drawHorizontalLeafTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  palette: QuranPageSharePalette,
  flipY = false
) {
  ctx.save();
  ctx.translate(x, y);
  if (flipY) {
    ctx.translate(0, 16 * scaleY);
    ctx.scale(scaleX, -scaleY);
  } else {
    ctx.scale(scaleX, scaleY);
  }

  ctx.fillStyle = palette.frameBg;
  ctx.fillRect(0, 0, 36, 16);

  // Top primary border & bottom gold border
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(0, 1);
  ctx.lineTo(36, 1);
  ctx.stroke();

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.lineTo(36, 15);
  ctx.stroke();

  // Two almond leaf-lattice petals
  const drawLeaf = (x1: number, x2: number, x3: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, 8);
    ctx.bezierCurveTo(x1 + (x2 - x1) * 0.45, 4, x2 - (x2 - x1) * 0.25, 4, x3, 8);
    ctx.bezierCurveTo(x2 - (x2 - x1) * 0.25, 12, x1 + (x2 - x1) * 0.45, 12, x1, 8);
    ctx.closePath();
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = palette.secondary;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 0.85;
    ctx.stroke();
  };

  drawLeaf(2, 13, 18);
  drawLeaf(18, 29, 34);

  // Center gold dot
  ctx.fillStyle = palette.gold;
  ctx.beginPath();
  ctx.arc(18, 8, 2, 0, Math.PI * 2);
  ctx.fill();

  // Edge connector dots
  ctx.fillStyle = palette.deep;
  ctx.beginPath();
  ctx.arc(0, 8, 1.3, 0, Math.PI * 2);
  ctx.arc(36, 8, 1.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawVerticalLeafTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  palette: QuranPageSharePalette,
  flipX = false
) {
  ctx.save();
  ctx.translate(x, y);
  if (flipX) {
    ctx.translate(16 * scaleX, 0);
    ctx.scale(-scaleX, scaleY);
  } else {
    ctx.scale(scaleX, scaleY);
  }

  ctx.fillStyle = palette.frameBg;
  ctx.fillRect(0, 0, 16, 36);

  // Outer primary line & inner gold line
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(1, 36);
  ctx.stroke();

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(15, 36);
  ctx.stroke();

  const drawVerticalLeaf = (yStart: number, yMid: number, yEnd: number) => {
    ctx.beginPath();
    ctx.moveTo(8, yStart);
    ctx.quadraticCurveTo(12, (yStart + yEnd) / 2 - 2.5, 8, yEnd);
    ctx.quadraticCurveTo(4, (yStart + yEnd) / 2 - 2.5, 8, yStart);
    ctx.closePath();

    // Better symmetric curve matching M8 2 C12 7 12 13 8 18 C4 13 4 7 8 2
    ctx.beginPath();
    ctx.moveTo(8, yStart);
    ctx.bezierCurveTo(12, yStart + 5, 12, yMid - 5, 8, yEnd);
    ctx.bezierCurveTo(4, yMid - 5, 4, yStart + 5, 8, yStart);
    ctx.closePath();

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = palette.secondary;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 0.85;
    ctx.stroke();
  };

  drawVerticalLeaf(2, 18, 18);
  drawVerticalLeaf(18, 34, 34);

  ctx.fillStyle = palette.gold;
  ctx.beginPath();
  ctx.arc(8, 18, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.deep;
  ctx.beginPath();
  ctx.arc(8, 0, 1.4, 0, Math.PI * 2);
  ctx.arc(8, 36, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// MAIN FULL-PAGE FRAME & BACKDROP RENDERER (1080x1920)
// ============================================================================

export function drawQuranPageBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  designId: ShareDesignId,
  width: number,
  height: number,
  _outerMargin: number,
  _innerMargin: number
): boolean {
  if (!isQuranPageShareDesignId(designId)) return false;
  const palette = getQuranPageDesignPalette(designId);

  // 1. Entire perimeter base matching Madinah shell background
  ctx.fillStyle = palette.frameBg;
  ctx.fillRect(0, 0, width, height);

  // Frame band proportions matching screenshot (/public/assets/aistudio/image_e04fe710.png)
  const scaleFactor = width / 1080;
  const outerPad = Math.round(14 * scaleFactor);
  const bandScale = 2.15 * scaleFactor;
  const bandThickness = Math.round(16 * bandScale); // ~34px on 1080px canvas
  const tileLong = Math.round(36 * bandScale); // ~77px tile repeat

  const frameLeft = outerPad;
  const frameTop = outerPad;
  const frameRight = width - outerPad;
  const frameBottom = height - outerPad;

  const innerX = frameLeft + bandThickness;
  const innerY = frameTop + bandThickness;
  const innerW = frameRight - bandThickness - innerX;
  const innerH = frameBottom - bandThickness - innerY;

  // 2. Crisp pure page interior (#ffffff in light, #000000 in night)
  ctx.fillStyle = palette.pageBg;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  // 3. Top & Bottom repeating horizontal leaf-lattice bands
  ctx.save();
  ctx.beginPath();
  ctx.rect(innerX - 2, frameTop, innerW + 4, bandThickness + 2);
  ctx.clip();
  for (let x = innerX; x < frameRight - bandThickness + tileLong; x += tileLong) {
    drawHorizontalLeafTile(ctx, x, frameTop, bandScale, bandScale, palette, false);
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(innerX - 2, frameBottom - bandThickness, innerW + 4, bandThickness + 2);
  ctx.clip();
  for (let x = innerX; x < frameRight - bandThickness + tileLong; x += tileLong) {
    drawHorizontalLeafTile(
      ctx,
      x,
      frameBottom - bandThickness,
      bandScale,
      bandScale,
      palette,
      true
    );
  }
  ctx.restore();

  // 4. Left & Right repeating vertical leaf-lattice bands
  ctx.save();
  ctx.beginPath();
  ctx.rect(frameLeft, innerY - 2, bandThickness + 2, innerH + 4);
  ctx.clip();
  for (let y = innerY; y < frameBottom - bandThickness + tileLong; y += tileLong) {
    drawVerticalLeafTile(ctx, frameLeft, y, bandScale, bandScale, palette, false);
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(frameRight - bandThickness, innerY - 2, bandThickness + 2, innerH + 4);
  ctx.clip();
  for (let y = innerY; y < frameBottom - bandThickness + tileLong; y += tileLong) {
    drawVerticalLeafTile(
      ctx,
      frameRight - bandThickness,
      y,
      bandScale,
      bandScale,
      palette,
      true
    );
  }
  ctx.restore();

  // Subtle gold inner border around pure reading stage (like MadinahFrameSVG .madinah-inner-stage)
  ctx.save();
  ctx.strokeStyle = palette.gold;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = Math.max(1.2, 2.0 * scaleFactor);
  ctx.strokeRect(innerX, innerY, innerW, innerH);
  ctx.restore();

  // 5. Four Corner Square Medallions (overlapping band junctions just like MadinahFrameSVG)
  const rosetteSize = Math.round(44 * scaleFactor);
  const cornerInset = Math.round(outerPad - 4 * scaleFactor);
  drawRoyalCornerRosette(ctx, cornerInset, cornerInset, rosetteSize, palette);
  drawRoyalCornerRosette(
    ctx,
    width - cornerInset - rosetteSize,
    cornerInset,
    rosetteSize,
    palette
  );
  drawRoyalCornerRosette(
    ctx,
    cornerInset,
    height - cornerInset - rosetteSize,
    rosetteSize,
    palette
  );
  drawRoyalCornerRosette(
    ctx,
    width - cornerInset - rosetteSize,
    height - cornerInset - rosetteSize,
    rosetteSize,
    palette
  );

  return true;
}

// ============================================================================
// SURAH HEADER BANNER ORNAMENTAL BACKDROP (Cached PNG for ShareAyahModal DOM/Canvas)
// ============================================================================

const quranSurahBannerCache = new Map<QuranPageShareDesignId, string>();

function drawSurahBannerLeafPatternTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileW: number,
  tileH: number,
  palette: QuranPageSharePalette
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(tileW / 48, tileH / 24);

  const drawPetal = (x1: number, x2: number, x3: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, 12);
    ctx.bezierCurveTo(x1 + (x2 - x1) * 0.48, 6, x2 - (x2 - x1) * 0.2, 6, x3, 12);
    ctx.bezierCurveTo(x2 - (x2 - x1) * 0.2, 18, x1 + (x2 - x1) * 0.48, 18, x1, 12);
    ctx.closePath();

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = palette.secondary;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 0.75;
    ctx.stroke();
    ctx.restore();
  };

  drawPetal(3, 15, 24);
  drawPetal(24, 39, 45);

  ctx.save();
  ctx.globalAlpha = 0.44;
  ctx.fillStyle = palette.gold;
  ctx.beginPath();
  ctx.arc(24, 12, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(13.5, 12, 0.9, 0, Math.PI * 2);
  ctx.arc(34.5, 12, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawSurahBannerCornerRosette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  palette: QuranPageSharePalette
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 14, size / 14);

  drawRoundRectPath(ctx, 1.5, 1.5, 11, 11, 2);
  ctx.fillStyle = palette.frameBg;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 0.95;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(7, 2.5);
  ctx.lineTo(8.3, 5.7);
  ctx.lineTo(11.5, 7);
  ctx.lineTo(8.3, 8.3);
  ctx.lineTo(7, 11.5);
  ctx.lineTo(5.7, 8.3);
  ctx.lineTo(2.5, 7);
  ctx.lineTo(5.7, 5.7);
  ctx.closePath();
  ctx.fillStyle = palette.gold;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(7, 7, 1.1, 0, Math.PI * 2);
  ctx.fillStyle = palette.cartoucheFill;
  ctx.fill();

  ctx.restore();
}

function drawOctagonalSideBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: QuranPageSharePalette
) {
  const cutX = w * 0.11;
  const cutY = h * 0.24;
  const traceOct = (ox: number, oy: number, ow: number, oh: number, cx: number, cy: number) => {
    ctx.beginPath();
    ctx.moveTo(ox + cx, oy);
    ctx.lineTo(ox + ow - cx, oy);
    ctx.lineTo(ox + ow, oy + cy);
    ctx.lineTo(ox + ow, oy + oh - cy);
    ctx.lineTo(ox + ow - cx, oy + oh);
    ctx.lineTo(ox + cx, oy + oh);
    ctx.lineTo(ox, oy + oh - cy);
    ctx.lineTo(ox, oy + cy);
    ctx.closePath();
  };

  traceOct(x, y, w, h, cutX, cutY);
  ctx.fillStyle = palette.cartoucheFill;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';
  ctx.stroke();

  const inset = 5.5;
  traceOct(x + inset, y + inset, w - inset * 2, h - inset * 2, cutX * 0.72, cutY * 0.72);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

function drawCenterSurahCartouche(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: QuranPageSharePalette
) {
  const cutX = Math.min(24, h * 0.28);
  const traceChamfer = (ox: number, oy: number, ow: number, oh: number, cx: number) => {
    const cy = oh * 0.23;
    ctx.beginPath();
    ctx.moveTo(ox + cx, oy);
    ctx.lineTo(ox + ow - cx, oy);
    ctx.lineTo(ox + ow, oy + cy);
    ctx.lineTo(ox + ow, oy + oh - cy);
    ctx.lineTo(ox + ow - cx, oy + oh);
    ctx.lineTo(ox + cx, oy + oh);
    ctx.lineTo(ox, oy + oh - cy);
    ctx.lineTo(ox, oy + cy);
    ctx.closePath();
  };

  traceChamfer(x, y, w, h, cutX);
  ctx.fillStyle = palette.cartoucheFill;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';
  ctx.stroke();

  const inset = 6;
  traceChamfer(x + inset, y + inset, w - inset * 2, h - inset * 2, cutX * 0.76);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 1.75;
  ctx.stroke();

  // Left & Right gold diamonds inside cartouche tips
  const drawTipDiamond = (dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(dx, dy - 6.5);
    ctx.lineTo(dx + 6.5, dy);
    ctx.lineTo(dx, dy + 6.5);
    ctx.lineTo(dx - 6.5, dy);
    ctx.closePath();
    ctx.fillStyle = palette.gold;
    ctx.fill();
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 1.1;
    ctx.stroke();
  };

  drawTipDiamond(x + 18, y + h / 2);
  drawTipDiamond(x + w - 18, y + h / 2);
}

/**
 * Renders the exact Royal Madinah Surah Header ornamental frame (backdrop + pattern +
 * 4 corners + flanking octagonal plaques + central chamfered cartouche) to a crisp cached PNG data URL.
 */
export function renderQuranSurahBannerBackdropToDataUrl(
  designId: QuranPageShareDesignId
): string {
  const cached = quranSurahBannerCache.get(designId);
  if (cached) return cached;
  if (typeof document === 'undefined') return '';

  const palette = getQuranPageDesignPalette(designId);
  const w = 920;
  const h = 114;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Rounded banner box with frameBg fill + primary outer border
  drawRoundRectPath(ctx, 2, 2, w - 4, h - 4, 16);
  ctx.fillStyle = palette.frameBg;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 3;
  ctx.stroke();

  // 2. Clipped leaf-lattice background pattern inside banner
  ctx.save();
  drawRoundRectPath(ctx, 4, 4, w - 8, h - 8, 14);
  ctx.clip();
  const tileW = 96;
  const tileH = 48;
  for (let px = 0; px < w; px += tileW) {
    for (let py = -8; py < h; py += tileH) {
      drawSurahBannerLeafPatternTile(ctx, px, py, tileW, tileH, palette);
    }
  }
  ctx.restore();

  // 3. Inner gold hairline border
  ctx.save();
  ctx.globalAlpha = 0.72;
  drawRoundRectPath(ctx, 7, 7, w - 14, h - 14, 11);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 4. Four corner rosettes inside banner
  const cSize = 22;
  drawSurahBannerCornerRosette(ctx, 7, 7, cSize, palette);
  drawSurahBannerCornerRosette(ctx, w - 7 - cSize, 7, cSize, palette);
  drawSurahBannerCornerRosette(ctx, 7, h - 7 - cSize, cSize, palette);
  drawSurahBannerCornerRosette(ctx, w - 7 - cSize, h - 7 - cSize, cSize, palette);

  // 5. Left & Right flanking octagonal plaques (Ayah count & Makki/Madani)
  const sideW = 166;
  const sideH = 68;
  const sideY = (h - sideH) / 2;
  drawOctagonalSideBadge(ctx, 32, sideY, sideW, sideH, palette);
  drawOctagonalSideBadge(ctx, w - 32 - sideW, sideY, sideW, sideH, palette);

  // 6. Center chamfered octagonal Surah name cartouche
  const centerW = 468;
  const centerH = 82;
  drawCenterSurahCartouche(ctx, (w - centerW) / 2, (h - centerH) / 2, centerW, centerH, palette);

  const url = canvas.toDataURL('image/png');
  quranSurahBannerCache.set(designId, url);
  return url;
}

// ============================================================================
// PURE-CANVAS UPPER & LOWER MOTIFS (For ShareDesignSelectorSection & Azkar cards)
// ============================================================================

export function drawQuranPageUpperMotif(
  ctx: CanvasRenderingContext2D,
  designId: ShareDesignId,
  cx: number,
  cy: number,
  availableHeight: number
): boolean {
  if (!isQuranPageShareDesignId(designId)) return false;
  const palette = getQuranPageDesignPalette(designId);

  ctx.save();
  const isSpacious = availableHeight >= 110;
  const bw = isSpacious ? 580 : 450;
  const bh = isSpacious ? 74 : 52;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;

  // Miniature Royal Madinah Surah Banner ornament
  drawRoundRectPath(ctx, bx, by, bw, bh, 12);
  ctx.fillStyle = palette.frameBg;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.save();
  drawRoundRectPath(ctx, bx + 2, by + 2, bw - 4, bh - 4, 10);
  ctx.clip();
  for (let px = bx; px < bx + bw; px += 64) {
    for (let py = by; py < by + bh; py += 32) {
      drawSurahBannerLeafPatternTile(ctx, px, py, 64, 32, palette);
    }
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.72;
  drawRoundRectPath(ctx, bx + 5, by + 5, bw - 10, bh - 10, 8);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  const cSize = 15;
  drawSurahBannerCornerRosette(ctx, bx + 4, by + 4, cSize, palette);
  drawSurahBannerCornerRosette(ctx, bx + bw - 4 - cSize, by + 4, cSize, palette);
  drawSurahBannerCornerRosette(ctx, bx + 4, by + bh - 4 - cSize, cSize, palette);
  drawSurahBannerCornerRosette(ctx, bx + bw - 4 - cSize, by + bh - 4 - cSize, cSize, palette);

  const sideW = bw * 0.18;
  const sideH = bh * 0.6;
  drawOctagonalSideBadge(ctx, bx + 20, cy - sideH / 2, sideW, sideH, palette);
  drawOctagonalSideBadge(ctx, bx + bw - 20 - sideW, cy - sideH / 2, sideW, sideH, palette);

  const centerW = bw * 0.48;
  const centerH = bh * 0.74;
  drawCenterSurahCartouche(ctx, cx - centerW / 2, cy - centerH / 2, centerW, centerH, palette);

  ctx.restore();
  return true;
}

export function drawQuranPageLowerMotif(
  ctx: CanvasRenderingContext2D,
  designId: ShareDesignId,
  cx: number,
  cy: number,
  availableHeight: number
): boolean {
  if (!isQuranPageShareDesignId(designId)) return false;
  const palette = getQuranPageDesignPalette(designId);

  ctx.save();
  const isLarge = availableHeight >= 110;
  const span = isLarge ? 270 : 195;

  // Crisp gold divider rule matching screenshot footer divider
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy + 12);
  ctx.lineTo(cx + span, cy + 12);
  ctx.stroke();

  // Centered Madinah hexagonal medallion above rule
  const medW = isLarge ? 136 : 98;
  const medH = isLarge ? 44 : 32;
  const mx = cx - medW / 2;
  const my = cy - medH / 2 - 12;

  const traceHex = (ox: number, oy: number, ow: number, oh: number) => {
    const cut = ow * 0.11;
    ctx.beginPath();
    ctx.moveTo(ox + cut, oy);
    ctx.lineTo(ox + ow - cut, oy);
    ctx.lineTo(ox + ow, oy + oh / 2);
    ctx.lineTo(ox + ow - cut, oy + oh);
    ctx.lineTo(ox + cut, oy + oh);
    ctx.lineTo(ox, oy + oh / 2);
    ctx.closePath();
  };

  traceHex(mx, my, medW, medH);
  ctx.fillStyle = palette.cartoucheFill;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  traceHex(mx + 5, my + 4.5, medW - 10, medH - 9);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Small gold rosette inside medallion
  const r = isLarge ? 9 : 6.5;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const px = cx + Math.cos(angle) * rad;
    const py = my + medH / 2 + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = palette.gold;
  ctx.fill();
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  ctx.restore();
  return true;
}
