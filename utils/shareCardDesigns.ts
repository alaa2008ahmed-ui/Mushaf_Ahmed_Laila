import { Preferences } from '@capacitor/preferences';
import {
  ExtraShareDesignId,
  EXTRA_SHARE_CARD_DESIGNS,
  isExtraShareDesignId,
  getExtraDesignTypographyTheme,
} from './shareCardDesignsExtra';

export type ShareDesignId =
  | 'classic_gold'
  | 'sanaani_qamariya'
  | 'lapis_turquoise'
  | 'rasulid_garnet'
  | 'hadrami_jade'
  | 'obsidian_gold'
  | 'sky_azure'
  | 'emerald_sanctuary'
  | 'royal_amethyst'
  | 'sunset_saffron'
  | ExtraShareDesignId;

export const SHARE_DESIGN_STORAGE_KEY = 'app_share_card_design';
export const SHARE_DESIGN_CHANGE_EVENT = 'app-share-card-design-changed';

export interface ShareDesignMeta {
  id: ShareDesignId;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  previewColors: [string, string, string];
}

const BASE_LIGHT_SHARE_CARD_DESIGNS: ShareDesignMeta[] = [
  {
    id: 'classic_gold',
    nameAr: 'المخطوطة الذهبية والزمردية',
    nameEn: 'Royal Gold & Emerald',
    descAr: 'التصميم الكلاسيكي بالرقّ المذهب والقنديل والشمسة الزمردية',
    descEn: 'Classic illuminated parchment with emerald & 24k gold motifs',
    previewColors: ['#FAF4E4', '#C59B27', '#064E3B'],
  },
  {
    id: 'sky_azure',
    nameAr: 'الفجر السماوي واللازورد',
    nameEn: 'Sky Azure & Silver',
    descAr: 'إطلالة سماوية صافية بأقواس فضية وميدالية مائية زرقاء',
    descEn: 'Crisp dawn azure sky with silver arches & sapphire medallion',
    previewColors: ['#E0F2FE', '#0284C7', '#0C4A6E'],
  },
  {
    id: 'emerald_sanctuary',
    nameAr: 'الروضة الزمردية المضيئة',
    nameEn: 'Emerald Sanctuary',
    descAr: 'رقّ أخضر زمردي مستوحى من الروضة الشريفة بنقوش نباتية وذهبية',
    descEn: 'Illuminated emerald sanctuary frame with golden botanical arabesques',
    previewColors: ['#ECFDF5', '#059669', '#D97706'],
  },
  {
    id: 'sunset_saffron',
    nameAr: 'وهج الغروب والزعفران',
    nameEn: 'Sunset Saffron & Copper',
    descAr: 'شفق دافئ بلون الزعفران والنحاس المعتّق وزخارف الزليج المغربي',
    descEn: 'Warm golden-hour saffron & antique copper with Moroccan zellige geometry',
    previewColors: ['#FFF7ED', '#EA580C', '#9A3412'],
  },
  {
    id: 'sanaani_qamariya',
    nameAr: 'قمرية صنعاء المضيئة',
    nameEn: "Sana'ani Qamariya",
    descAr: 'طراز صنعاء القديمة بالآجرّ والجص الأبيض والقمرية المضيئة',
    descEn: "Old Sana'a brick, white gypsum fretwork & carved arch",
    previewColors: ['#7C2D12', '#FFFDF9', '#D97706'],
  },
  {
    id: 'hadrami_jade',
    nameAr: 'قباب تريم والعقيق اليماني',
    nameEn: 'Tarim Jade & Yemeni Agate',
    descAr: 'قباب ومآذن تريم الهادئة بفصوص العقيق اليماني والمشربية الخضراء',
    descEn: 'Hadrami oasis domes, mashrabiya lattice & carnelian Yemeni agate',
    previewColors: ['#0F5257', '#F4FAF6', '#C2410C'],
  },
  {
    id: 'rasulid_garnet',
    nameAr: 'الطراز الرسولي القرمزي',
    nameEn: 'Rasulid Garnet & Pearl',
    descAr: 'عقد مفصّص وزخارف نباتية تعزية بلون القرمز واللؤلؤ والنحاس الوردي',
    descEn: 'Taiz Rasulid polylobed arch, floral vines, garnet & rose-gold',
    previewColors: ['#581024', '#FFF9F6', '#C87D55'],
  },
];

const BASE_DARK_SHARE_CARD_DESIGNS: ShareDesignMeta[] = [
  {
    id: 'lapis_turquoise',
    nameAr: 'اللازورد الليلي والفيروزي',
    nameEn: 'Lapis Night & Turquoise',
    descAr: 'إطار مثمّن كحلي ملكي بالمشكاة المزدوجة والنجوم الفيروزية',
    descEn: 'Midnight sapphire octagonal frame with twin lamps & turquoise stars',
    previewColors: ['#0B1633', '#2DD4BF', '#FCD34D'],
  },
  {
    id: 'royal_amethyst',
    nameAr: 'الأرجواني الملكي والبنفسجي',
    nameEn: 'Royal Amethyst & Gold',
    descAr: 'مخطوطة ليلية بلون الأرجوان الملكي ومدارات فلكية ذهبية',
    descEn: 'Imperial amethyst twilight manuscript with golden astrolabe rings',
    previewColors: ['#1E0B4B', '#A855F7', '#FCD34D'],
  },
  {
    id: 'obsidian_gold',
    nameAr: 'الليل الملكي والذهبي',
    nameEn: 'Obsidian Night & Gold',
    descAr: 'خلفية ليلية داكنة فاخرة بزخارف ذهبية عيار ٢٤ وقنديل مضيء',
    descEn: 'Luxurious obsidian night backdrop with 24k gold filigree & lantern',
    previewColors: ['#07070A', '#F59E0B', '#FDE68A'],
  },
];

const EXTRA_LIGHT_SHARE_CARD_DESIGNS: ShareDesignMeta[] = EXTRA_SHARE_CARD_DESIGNS.filter(
  (d) => !d.isDark
).map(({ isDark: _isDark, ...meta }) => meta);

const EXTRA_DARK_SHARE_CARD_DESIGNS: ShareDesignMeta[] = EXTRA_SHARE_CARD_DESIGNS.filter(
  (d) => d.isDark
).map(({ isDark: _isDark, ...meta }) => meta);

export const SHARE_CARD_DESIGNS: ShareDesignMeta[] = [
  // Light designs first, followed by dark designs
  ...BASE_LIGHT_SHARE_CARD_DESIGNS,
  ...EXTRA_LIGHT_SHARE_CARD_DESIGNS,
  ...BASE_DARK_SHARE_CARD_DESIGNS,
  ...EXTRA_DARK_SHARE_CARD_DESIGNS,
];

const VALID_DESIGN_IDS = new Set<ShareDesignId>(SHARE_CARD_DESIGNS.map((d) => d.id));

function normalizeDesignId(raw: string | null | undefined): ShareDesignId {
  if (raw && VALID_DESIGN_IDS.has(raw as ShareDesignId)) {
    return raw as ShareDesignId;
  }
  return 'classic_gold';
}

// Hydrate from Capacitor Preferences on native platforms if localStorage is empty
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(SHARE_DESIGN_STORAGE_KEY)) {
      Preferences.get({ key: SHARE_DESIGN_STORAGE_KEY })
        .then(({ value }) => {
          if (value && VALID_DESIGN_IDS.has(value as ShareDesignId)) {
            try {
              localStorage.setItem(SHARE_DESIGN_STORAGE_KEY, value);
              window.dispatchEvent(
                new CustomEvent(SHARE_DESIGN_CHANGE_EVENT, { detail: { designId: value } })
              );
            } catch {}
          }
        })
        .catch(() => {});
    }
  } catch {}
}

export function getSelectedShareDesign(): ShareDesignId {
  try {
    return normalizeDesignId(localStorage.getItem(SHARE_DESIGN_STORAGE_KEY));
  } catch {
    return 'classic_gold';
  }
}

export function setSelectedShareDesign(id: ShareDesignId): void {
  const safeId = normalizeDesignId(id);
  try {
    localStorage.setItem(SHARE_DESIGN_STORAGE_KEY, safeId);
  } catch {}
  Preferences.set({ key: SHARE_DESIGN_STORAGE_KEY, value: safeId }).catch(() => {});
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(SHARE_DESIGN_CHANGE_EVENT, { detail: { designId: safeId } })
    );
  }
}

export function getShareDesignMeta(id?: ShareDesignId): ShareDesignMeta {
  const target = id ? normalizeDesignId(id) : getSelectedShareDesign();
  return SHARE_CARD_DESIGNS.find((d) => d.id === target) || SHARE_CARD_DESIGNS[0];
}

// ============================================================================
// SHARED VECTOR PRIMITIVES
// ============================================================================

export function drawRoundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawChamferRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cut: number
) {
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.lineTo(x + w, y + h - cut);
  ctx.lineTo(x + w - cut, y + h);
  ctx.lineTo(x + cut, y + h);
  ctx.lineTo(x, y + h - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

export function drawIslamicStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points = 8,
  fillColor?: string | CanvasGradient | CanvasPattern,
  strokeColor?: string,
  lineWidth = 2
) {
  ctx.save();
  ctx.beginPath();
  const step = Math.PI / points;
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill?: string,
  stroke?: string,
  lineWidth = 1.5
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.lineTo(cx + rx, cy);
  ctx.lineTo(cx, cy + ry);
  ctx.lineTo(cx - rx, cy);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

// ============================================================================
// DESIGN PALETTES FOR TYPOGRAPHY & BADGES
// ============================================================================

export interface DesignTypographyTheme {
  bismillahColor: string;
  bismillahShadow: string;
  badgeBgStops: [string, string, string];
  badgeBorder: string;
  badgeInnerLine: string;
  badgeStarColor: string;
  badgeTextColor: string;
  titleColor: string;
  titleShadow: string;
  bodyColor: string;
  highlightColor: string;
  highlightShadow: string;
  bulletColor: string;
  bodyShadow: string;
  sourceDividerColor: string;
  sourceColor: string;
  footerLineColor: string;
  footerStarFill: string;
  footerStarStroke: string;
  brandColor: string;
  brandShadow: string;
  subtitleColor: string;
}

export function getDesignTypographyTheme(designId: ShareDesignId): DesignTypographyTheme {
  if (isExtraShareDesignId(designId)) {
    return getExtraDesignTypographyTheme(designId);
  }
  switch (designId) {
    case 'sanaani_qamariya':
      return {
        bismillahColor: '#7C2D12',
        bismillahShadow: 'rgba(217, 119, 6, 0.25)',
        badgeBgStops: ['#FFF8ED', '#FFFFFF', '#FDEFD9'],
        badgeBorder: '#B45309',
        badgeInnerLine: 'rgba(124, 45, 18, 0.38)',
        badgeStarColor: '#D97706',
        badgeTextColor: '#7C2D12',
        titleColor: '#7C2D12',
        titleShadow: 'rgba(217, 119, 6, 0.25)',
        bodyColor: '#29150E',
        highlightColor: '#9A3412',
        highlightShadow: 'rgba(154, 52, 18, 0.16)',
        bulletColor: '#431D12',
        bodyShadow: 'rgba(0, 0, 0, 0.06)',
        sourceDividerColor: 'rgba(180, 83, 9, 0.55)',
        sourceColor: '#92400E',
        footerLineColor: '#B45309',
        footerStarFill: '#F59E0B',
        footerStarStroke: '#7C2D12',
        brandColor: '#5A2116',
        brandShadow: 'rgba(217, 119, 6, 0.25)',
        subtitleColor: '#92400E',
      };

    case 'lapis_turquoise':
      return {
        bismillahColor: '#FDE68A',
        bismillahShadow: 'rgba(45, 212, 191, 0.35)',
        badgeBgStops: ['#102A4C', '#163763', '#0F2544'],
        badgeBorder: '#2DD4BF',
        badgeInnerLine: 'rgba(253, 230, 138, 0.45)',
        badgeStarColor: '#FCD34D',
        badgeTextColor: '#E2FBF8',
        titleColor: '#5EEAD4',
        titleShadow: 'rgba(45, 212, 191, 0.25)',
        bodyColor: '#F8FAFC',
        highlightColor: '#5EEAD4',
        highlightShadow: 'rgba(45, 212, 191, 0.28)',
        bulletColor: '#E2E8F0',
        bodyShadow: 'rgba(0, 0, 0, 0.45)',
        sourceDividerColor: 'rgba(45, 212, 191, 0.55)',
        sourceColor: '#FDE68A',
        footerLineColor: '#2DD4BF',
        footerStarFill: '#FCD34D',
        footerStarStroke: '#14B8A6',
        brandColor: '#BAE6FD',
        brandShadow: 'rgba(6, 18, 42, 0.75)',
        subtitleColor: '#99F6E4',
      };

    case 'rasulid_garnet':
      return {
        bismillahColor: '#6B122C',
        bismillahShadow: 'rgba(200, 125, 85, 0.3)',
        badgeBgStops: ['#FFF5F0', '#FFFFFF', '#FCE6DC'],
        badgeBorder: '#C87D55',
        badgeInnerLine: 'rgba(107, 18, 44, 0.35)',
        badgeStarColor: '#9F1239',
        badgeTextColor: '#6B122C',
        titleColor: '#881337',
        titleShadow: 'rgba(200, 125, 85, 0.25)',
        bodyColor: '#2A0A14',
        highlightColor: '#9F1239',
        highlightShadow: 'rgba(159, 18, 57, 0.18)',
        bulletColor: '#4A1224',
        bodyShadow: 'rgba(0, 0, 0, 0.06)',
        sourceDividerColor: 'rgba(200, 125, 85, 0.65)',
        sourceColor: '#9A4D2E',
        footerLineColor: '#C87D55',
        footerStarFill: '#E2A878',
        footerStarStroke: '#6B122C',
        brandColor: '#6B122C',
        brandShadow: 'rgba(200, 125, 85, 0.3)',
        subtitleColor: '#9A4D2E',
      };

    case 'hadrami_jade':
      return {
        bismillahColor: '#0F5257',
        bismillahShadow: 'rgba(176, 137, 67, 0.25)',
        badgeBgStops: ['#F0FAF6', '#FFFFFF', '#E2F3EA'],
        badgeBorder: '#0F766E',
        badgeInnerLine: 'rgba(194, 65, 12, 0.35)',
        badgeStarColor: '#C2410C',
        badgeTextColor: '#0D4A4E',
        titleColor: '#0D4A4E',
        titleShadow: 'rgba(15, 118, 110, 0.18)',
        bodyColor: '#0B2E2C',
        highlightColor: '#0F766E',
        highlightShadow: 'rgba(15, 118, 110, 0.2)',
        bulletColor: '#134E4A',
        bodyShadow: 'rgba(0, 0, 0, 0.05)',
        sourceDividerColor: 'rgba(194, 65, 12, 0.5)',
        sourceColor: '#9A3412',
        footerLineColor: '#0F766E',
        footerStarFill: '#C2410C',
        footerStarStroke: '#0D4A4E',
        brandColor: '#9A3412',
        brandShadow: 'rgba(194, 65, 12, 0.18)',
        subtitleColor: '#0F766E',
      };

    case 'obsidian_gold':
      return {
        bismillahColor: '#FDE68A',
        bismillahShadow: 'rgba(245, 158, 11, 0.4)',
        badgeBgStops: ['#16130D', '#261E11', '#120F0A'],
        badgeBorder: '#F59E0B',
        badgeInnerLine: 'rgba(253, 230, 138, 0.45)',
        badgeStarColor: '#FBBF24',
        badgeTextColor: '#FEF3C7',
        titleColor: '#FBBF24',
        titleShadow: 'rgba(245, 158, 11, 0.35)',
        bodyColor: '#FFFDF7',
        highlightColor: '#FCD34D',
        highlightShadow: 'rgba(245, 158, 11, 0.3)',
        bulletColor: '#FDE68A',
        bodyShadow: 'rgba(0, 0, 0, 0.65)',
        sourceDividerColor: 'rgba(245, 158, 11, 0.55)',
        sourceColor: '#FDE68A',
        footerLineColor: '#D97706',
        footerStarFill: '#F59E0B',
        footerStarStroke: '#FDE68A',
        brandColor: '#F8FAFC',
        brandShadow: 'rgba(0, 0, 0, 0.8)',
        subtitleColor: '#D6B87A',
      };

    case 'sky_azure':
      return {
        bismillahColor: '#0369A1',
        bismillahShadow: 'rgba(56, 189, 248, 0.35)',
        badgeBgStops: ['#F0F9FF', '#FFFFFF', '#E0F2FE'],
        badgeBorder: '#0284C7',
        badgeInnerLine: 'rgba(3, 105, 161, 0.32)',
        badgeStarColor: '#0EA5E9',
        badgeTextColor: '#0C4A6E',
        titleColor: '#0369A1',
        titleShadow: 'rgba(14, 165, 233, 0.25)',
        bodyColor: '#082F49',
        highlightColor: '#0284C7',
        highlightShadow: 'rgba(2, 132, 199, 0.2)',
        bulletColor: '#075985',
        bodyShadow: 'rgba(0, 0, 0, 0.05)',
        sourceDividerColor: 'rgba(2, 132, 199, 0.45)',
        sourceColor: '#0369A1',
        footerLineColor: '#0284C7',
        footerStarFill: '#38BDF8',
        footerStarStroke: '#075985',
        brandColor: '#0C4A6E',
        brandShadow: 'rgba(56, 189, 248, 0.3)',
        subtitleColor: '#0369A1',
      };

    case 'emerald_sanctuary':
      return {
        bismillahColor: '#065F46',
        bismillahShadow: 'rgba(16, 185, 129, 0.3)',
        badgeBgStops: ['#ECFDF5', '#FFFFFF', '#D1FAE5'],
        badgeBorder: '#059669',
        badgeInnerLine: 'rgba(217, 119, 6, 0.38)',
        badgeStarColor: '#D97706',
        badgeTextColor: '#064E3B',
        titleColor: '#047857',
        titleShadow: 'rgba(5, 150, 105, 0.22)',
        bodyColor: '#052E23',
        highlightColor: '#059669',
        highlightShadow: 'rgba(5, 150, 105, 0.22)',
        bulletColor: '#065F46',
        bodyShadow: 'rgba(0, 0, 0, 0.05)',
        sourceDividerColor: 'rgba(5, 150, 105, 0.45)',
        sourceColor: '#B45309',
        footerLineColor: '#059669',
        footerStarFill: '#D97706',
        footerStarStroke: '#064E3B',
        brandColor: '#92400E',
        brandShadow: 'rgba(217, 119, 6, 0.22)',
        subtitleColor: '#047857',
      };

    case 'royal_amethyst':
      return {
        bismillahColor: '#FDE68A',
        bismillahShadow: 'rgba(168, 85, 247, 0.45)',
        badgeBgStops: ['#2E1065', '#4C1D95', '#27104D'],
        badgeBorder: '#C084FC',
        badgeInnerLine: 'rgba(253, 230, 138, 0.45)',
        badgeStarColor: '#FCD34D',
        badgeTextColor: '#F3E8FF',
        titleColor: '#E9D5FF',
        titleShadow: 'rgba(168, 85, 247, 0.35)',
        bodyColor: '#FAF5FF',
        highlightColor: '#FCD34D',
        highlightShadow: 'rgba(252, 211, 77, 0.3)',
        bulletColor: '#E9D5FF',
        bodyShadow: 'rgba(0, 0, 0, 0.5)',
        sourceDividerColor: 'rgba(192, 132, 252, 0.5)',
        sourceColor: '#FDE68A',
        footerLineColor: '#A855F7',
        footerStarFill: '#FCD34D',
        footerStarStroke: '#C084FC',
        brandColor: '#FFFFFF',
        brandShadow: 'rgba(23, 7, 46, 0.85)',
        subtitleColor: '#D8B4FE',
      };

    case 'sunset_saffron':
      return {
        bismillahColor: '#9A3412',
        bismillahShadow: 'rgba(234, 88, 12, 0.28)',
        badgeBgStops: ['#FFF7ED', '#FFFFFF', '#FFEDD5'],
        badgeBorder: '#EA580C',
        badgeInnerLine: 'rgba(154, 52, 18, 0.35)',
        badgeStarColor: '#F97316',
        badgeTextColor: '#7C2D12',
        titleColor: '#C2410C',
        titleShadow: 'rgba(234, 88, 12, 0.22)',
        bodyColor: '#431407',
        highlightColor: '#EA580C',
        highlightShadow: 'rgba(234, 88, 12, 0.2)',
        bulletColor: '#7C2D12',
        bodyShadow: 'rgba(0, 0, 0, 0.05)',
        sourceDividerColor: 'rgba(234, 88, 12, 0.48)',
        sourceColor: '#9A3412',
        footerLineColor: '#EA580C',
        footerStarFill: '#F59E0B',
        footerStarStroke: '#9A3412',
        brandColor: '#7C2D12',
        brandShadow: 'rgba(234, 88, 12, 0.25)',
        subtitleColor: '#C2410C',
      };

    case 'classic_gold':
    default:
      return {
        bismillahColor: '#064E3B',
        bismillahShadow: 'rgba(197, 155, 39, 0.45)',
        badgeBgStops: ['#FDF8E8', '#FFFBF0', '#F8EFD4'],
        badgeBorder: '#C59B27',
        badgeInnerLine: 'rgba(6, 78, 59, 0.45)',
        badgeStarColor: '#C59B27',
        badgeTextColor: '#064E3B',
        titleColor: '#064E3B',
        titleShadow: 'rgba(197, 155, 39, 0.4)',
        bodyColor: '#13281E',
        highlightColor: '#065F46',
        highlightShadow: 'rgba(6, 95, 70, 0.25)',
        bulletColor: '#1E3A2B',
        bodyShadow: 'rgba(0, 0, 0, 0.08)',
        sourceDividerColor: 'rgba(197, 155, 39, 0.55)',
        sourceColor: '#92400E',
        footerLineColor: '#C59B27',
        footerStarFill: '#C59B27',
        footerStarStroke: '#064E3B',
        brandColor: '#064E3B',
        brandShadow: 'rgba(197, 155, 39, 0.45)',
        subtitleColor: '#854D0E',
      };
  }
}

// ============================================================================
// DESIGN 2: SANA'ANI QAMARIYA (قمرية صنعاء المضيئة)
// ============================================================================

export function drawSanaaniBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  // 1. Deep Sana'ani Terracotta & Baked Brick outer backdrop
  const outerGrad = ctx.createLinearGradient(0, 0, width, height);
  outerGrad.addColorStop(0, '#5A2116');
  outerGrad.addColorStop(0.5, '#7C2D12');
  outerGrad.addColorStop(1, '#431407');
  ctx.fillStyle = outerGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle horizontal brick masonry texture on outer rim
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 245, 230, 0.08)';
  ctx.lineWidth = 1.4;
  for (let y = 18; y < height; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // 2. White Gypsum Diamond Frieze Band (حزام المعينات الصنعاني الأبيض) along perimeter
  const bandMargin = 22;
  ctx.strokeStyle = '#FFFDF9';
  ctx.lineWidth = 3;
  drawRoundRectPath(
    ctx,
    bandMargin,
    bandMargin,
    width - bandMargin * 2,
    height - bandMargin * 2,
    24
  );
  ctx.stroke();

  // Top & Bottom repeating white gypsum diamonds
  const diamondStep = 36;
  for (let x = 58; x <= width - 58; x += diamondStep) {
    drawDiamond(ctx, x, 40, 12, 8, '#FFFDF9', '#D97706', 1.2);
    drawDiamond(ctx, x, 40, 4, 3, '#7C2D12');
    drawDiamond(ctx, x, height - 40, 12, 8, '#FFFDF9', '#D97706', 1.2);
    drawDiamond(ctx, x, height - 40, 4, 3, '#7C2D12');
  }
  // Left & Right repeating white gypsum diamonds
  for (let y = 76; y <= height - 76; y += diamondStep) {
    drawDiamond(ctx, 40, y, 8, 12, '#FFFDF9', '#D97706', 1.2);
    drawDiamond(ctx, 40, y, 3, 4, '#7C2D12');
    drawDiamond(ctx, width - 40, y, 8, 12, '#FFFDF9', '#D97706', 1.2);
    drawDiamond(ctx, width - 40, y, 3, 4, '#7C2D12');
  }

  // 3. Inner Luminous Sandstone-Gypsum Sanctuary Card
  const cardX = innerMargin + 6;
  const cardY = innerMargin + 6;
  const cardW = width - (innerMargin + 6) * 2;
  const cardH = height - (innerMargin + 6) * 2;

  const innerGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
  innerGrad.addColorStop(0, '#FFFCF7');
  innerGrad.addColorStop(0.5, '#FFFDF9');
  innerGrad.addColorStop(1, '#FAF0E1');
  ctx.fillStyle = innerGrad;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 30);
  ctx.fill();

  // Warm central ambient glow
  const glow = ctx.createRadialGradient(
    width / 2,
    height * 0.45,
    60,
    width / 2,
    height * 0.45,
    width * 0.68
  );
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  glow.addColorStop(0.6, 'rgba(254, 243, 199, 0.25)');
  glow.addColorStop(1, 'rgba(217, 119, 6, 0.04)');
  ctx.fillStyle = glow;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 30);
  ctx.fill();

  // Subtle Sana'ani zigzag geometric lattice watermark
  ctx.save();
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 30);
  ctx.clip();
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.05)';
  ctx.lineWidth = 1.2;
  for (let y = cardY + 60; y < cardY + cardH; y += 110) {
    ctx.beginPath();
    for (let x = cardX; x <= cardX + cardW; x += 55) {
      if ((Math.round((x - cardX) / 55) % 2) === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y + 24);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Double Gypsum + Gold Inner Frame
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 3;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 30);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(124, 45, 18, 0.4)';
  ctx.lineWidth = 1.4;
  drawRoundRectPath(ctx, cardX + 10, cardY + 10, cardW - 20, cardH - 20, 22);
  ctx.stroke();

  // 4. Stepped Sana'ani Corner Crenellations (الشرفات الصنعانية في الزوايا)
  const drawSanaaniCornerCrest = (cx: number, cy: number, sx: 1 | -1, sy: 1 | -1) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sx, sy);
    ctx.fillStyle = '#7C2D12';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(74, 0);
    ctx.lineTo(74, 16);
    ctx.lineTo(54, 16);
    ctx.lineTo(54, 34);
    ctx.lineTo(34, 34);
    ctx.lineTo(34, 54);
    ctx.lineTo(16, 54);
    ctx.lineTo(16, 74);
    ctx.lineTo(0, 74);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawDiamond(ctx, 20, 20, 7, 7, '#FFFDF9', '#F59E0B', 1);
    ctx.restore();
  };

  drawSanaaniCornerCrest(cardX + 10, cardY + 10, 1, 1);
  drawSanaaniCornerCrest(cardX + cardW - 10, cardY + 10, -1, 1);
  drawSanaaniCornerCrest(cardX + 10, cardY + cardH - 10, 1, -1);
  drawSanaaniCornerCrest(cardX + cardW - 10, cardY + cardH - 10, -1, -1);
}

export function drawSanaaniUpperQamariya(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const radius = Math.min(115, Math.max(54, availableHeight * 0.68));
  const baseY = cy + radius * 0.42;

  // Radiant light aura behind Qamariya
  const aura = ctx.createRadialGradient(cx, baseY - radius * 0.35, 10, cx, baseY - radius * 0.35, radius * 1.45);
  aura.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
  aura.addColorStop(0.55, 'rgba(217, 119, 6, 0.08)');
  aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, baseY - radius * 0.2, radius * 1.45, 0, Math.PI * 2);
  ctx.fill();

  // Flanking Sana'ani gypsum horizontal wings with trefoil arches
  const wingSpan = Math.min(340, 220 + radius * 0.8);
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - wingSpan, baseY);
  ctx.lineTo(cx - radius - 14, baseY);
  ctx.moveTo(cx + radius + 14, baseY);
  ctx.lineTo(cx + wingSpan, baseY);
  ctx.stroke();

  // Flanking miniature gypsum arches
  for (const dir of [-1, 1] as const) {
    const ax = cx + dir * (radius + 64);
    ctx.fillStyle = '#FFFDF9';
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(ax, baseY, 22, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawDiamond(ctx, ax, baseY - 10, 5, 5, '#B45309');
    drawDiamond(ctx, cx + dir * (wingSpan - 12), baseY, 7, 7, '#B45309', '#FFFDF9', 1.2);
  }

  // Outer Gypsum Frame of the Qamariya
  ctx.fillStyle = '#FFFDF9';
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(cx, baseY, radius + 10, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Carved Gypsum Lattice Sectors (أقواس وفصوص الجص الصنعاني بدون تلوين)
  const sectors = 7;
  const innerR = radius * 0.34;
  const midR = radius * 0.68;
  const outerR = radius * 0.96;

  for (let i = 0; i < sectors; i++) {
    const a1 = Math.PI + (i * Math.PI) / sectors;
    const a2 = Math.PI + ((i + 1) * Math.PI) / sectors;

    // Outer carved gypsum band
    ctx.fillStyle = i % 2 === 0 ? '#FFFDF9' : '#FAF0E1';
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, baseY, outerR, a1, a2);
    ctx.arc(cx, baseY, midR, a2, a1, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Middle warm ivory gypsum ring
    ctx.fillStyle = i % 2 === 0 ? '#FAF0E1' : '#FFFDF9';
    ctx.beginPath();
    ctx.arc(cx, baseY, midR, a1, a2);
    ctx.arc(cx, baseY, innerR, a2, a1, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Inner Golden Sun Half-Rosette
  const coreGrad = ctx.createRadialGradient(cx, baseY, 2, cx, baseY, innerR);
  coreGrad.addColorStop(0, '#FFFFFF');
  coreGrad.addColorStop(0.45, '#FDE68A');
  coreGrad.addColorStop(1, '#D97706');
  ctx.fillStyle = coreGrad;
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, baseY, innerR, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gypsum sill bar under Qamariya
  ctx.fillStyle = '#7C2D12';
  drawRoundRectPath(ctx, cx - radius - 14, baseY - 2, (radius + 14) * 2, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#FFFDF9';
  drawRoundRectPath(ctx, cx - radius - 8, baseY, (radius + 8) * 2, 4, 2);
  ctx.fill();

  ctx.restore();
}

export function drawSanaaniLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const scale = availableHeight >= 115 ? 1 : 0.72;
  const span = 300 * scale;

  // Sana'ani zigzag gypsum divider bar
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - 56 * scale, cy);
  ctx.moveTo(cx + 56 * scale, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  // Flanking warm gold & terracotta diamonds
  const offsets = [-190, -115, 115, 190];
  offsets.forEach((off, idx) => {
    const color = idx % 2 === 0 ? '#D97706' : '#7C2D12';
    drawDiamond(ctx, cx + off * scale, cy, 11 * scale, 11 * scale, '#FFFDF9', '#7C2D12', 1.8);
    drawDiamond(ctx, cx + off * scale, cy, 5 * scale, 5 * scale, color);
  });

  // Central Sana'ani Triple-Diamond Gypsum Medallion
  drawDiamond(ctx, cx, cy, 46 * scale, 34 * scale, '#7C2D12', '#D97706', 2.4);
  drawDiamond(ctx, cx, cy, 34 * scale, 24 * scale, '#FFFDF9', '#B45309', 1.6);
  drawIslamicStar(
    ctx,
    cx,
    cy,
    18 * scale,
    9 * scale,
    8,
    '#D97706',
    '#7C2D12',
    1.5
  );
  drawDiamond(ctx, cx, cy, 6 * scale, 6 * scale, '#FFFDF9');
  ctx.restore();
}

// ============================================================================
// DESIGN 3: LAPIS NIGHT & TURQUOISE (اللازورد الليلي والفيروزي)
// ============================================================================

export function drawLapisBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  // 1. Deep Royal Midnight Lapis Lazuli Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#071126');
  bgGrad.addColorStop(0.45, '#0E2046');
  bgGrad.addColorStop(0.8, '#0A1938');
  bgGrad.addColorStop(1, '#060F22');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Luminous Sapphire-Turquoise Celestial Glow
  const centerGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.45,
    40,
    width / 2,
    height * 0.45,
    width * 0.72
  );
  centerGlow.addColorStop(0, 'rgba(45, 212, 191, 0.14)');
  centerGlow.addColorStop(0.5, 'rgba(37, 99, 235, 0.10)');
  centerGlow.addColorStop(1, 'rgba(7, 17, 38, 0)');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Celestial Starfield & Girih 12-Point Stars
  ctx.save();
  for (let x = 80; x < width; x += 120) {
    for (let y = 90; y < height; y += 120) {
      drawIslamicStar(ctx, x, y, 20, 9, 12, undefined, 'rgba(45, 212, 191, 0.08)', 1.1);
    }
  }
  ctx.restore();

  // 3. Outer & Inner Chamfered Octagonal Frames (إطار مثمّن الزوايا)
  ctx.strokeStyle = 'rgba(252, 211, 77, 0.65)';
  ctx.lineWidth = 2.6;
  drawChamferRectPath(
    ctx,
    outerMargin,
    outerMargin,
    width - outerMargin * 2,
    height - outerMargin * 2,
    52
  );
  ctx.stroke();

  // Inner Lapis Glass Panel
  const inX = innerMargin;
  const inY = innerMargin;
  const inW = width - innerMargin * 2;
  const inH = height - innerMargin * 2;

  ctx.fillStyle = 'rgba(11, 25, 56, 0.78)';
  ctx.strokeStyle = '#2DD4BF';
  ctx.lineWidth = 2.8;
  drawChamferRectPath(ctx, inX, inY, inW, inH, 42);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(252, 211, 77, 0.55)';
  ctx.lineWidth = 1.2;
  drawChamferRectPath(ctx, inX + 10, inY + 10, inW - 20, inH - 20, 36);
  ctx.stroke();

  // 4. Four Octagonal Corner Seal Rosettes
  const cornerOffsets: [number, number][] = [
    [inX + 26, inY + 26],
    [inX + inW - 26, inY + 26],
    [inX + 26, inY + inH - 26],
    [inX + inW - 26, inY + inH - 26],
  ];
  for (const [cx, cy] of cornerOffsets) {
    drawIslamicStar(ctx, cx, cy, 18, 9, 8, '#0D9488', '#FCD34D', 1.6);
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Left & Right Vertical Turquoise Geometric Star Chains
  for (let y = inY + 140; y <= inY + inH - 140; y += 95) {
    drawIslamicStar(ctx, inX + 24, y, 9, 4.5, 8, 'rgba(45, 212, 191, 0.35)', '#2DD4BF', 1);
    drawIslamicStar(ctx, inX + inW - 24, y, 9, 4.5, 8, 'rgba(45, 212, 191, 0.35)', '#2DD4BF', 1);
  }
}

export function drawLapisUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 115;
  const span = isSpacious ? 260 : 190;

  // Celestial Scalloped Turquoise Dome Line
  ctx.strokeStyle = '#2DD4BF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy + 8);
  ctx.quadraticCurveTo(cx - span * 0.45, cy - 32, cx, cy - 28);
  ctx.quadraticCurveTo(cx + span * 0.45, cy - 32, cx + span, cy + 8);
  ctx.stroke();

  // Central Glowing Crescent Moon (هلال مضيء)
  const moonR = isSpacious ? 26 : 18;
  const moonY = cy - (isSpacious ? 6 : 2);
  const moonGlow = ctx.createRadialGradient(cx, moonY, 2, cx, moonY, moonR * 2);
  moonGlow.addColorStop(0, 'rgba(252, 211, 77, 0.45)');
  moonGlow.addColorStop(1, 'rgba(252, 211, 77, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(cx, moonY, moonR * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FCD34D';
  ctx.beginPath();
  ctx.arc(cx, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0D1E42';
  ctx.beginPath();
  ctx.arc(cx + moonR * 0.38, moonY - moonR * 0.14, moonR * 0.84, 0, Math.PI * 2);
  ctx.fill();

  // Small accompanying star inside crescent
  drawIslamicStar(ctx, cx + moonR * 0.55, moonY - moonR * 0.12, 6, 2.8, 5, '#5EEAD4');

  // Twin Hanging Mosque Meshkah Lamps flanking crescent when spacious
  if (isSpacious) {
    for (const dir of [-1, 1] as const) {
      const lx = cx + dir * 138;
      const chainTop = cy - 16;
      const bodyTop = chainTop + 26;
      const bodyH = 44;

      // Chain
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(lx, chainTop);
      ctx.lineTo(lx, bodyTop);
      ctx.stroke();

      // Lamp warm glow
      const lampGlow = ctx.createRadialGradient(lx, bodyTop + bodyH * 0.5, 2, lx, bodyTop + bodyH * 0.5, 34);
      lampGlow.addColorStop(0, 'rgba(253, 224, 71, 0.65)');
      lampGlow.addColorStop(0.6, 'rgba(45, 212, 191, 0.2)');
      lampGlow.addColorStop(1, 'rgba(13, 30, 66, 0)');
      ctx.fillStyle = lampGlow;
      ctx.beginPath();
      ctx.arc(lx, bodyTop + bodyH * 0.5, 34, 0, Math.PI * 2);
      ctx.fill();

      // Lamp body
      const bodyGrad = ctx.createLinearGradient(lx - 14, bodyTop, lx + 14, bodyTop + bodyH);
      bodyGrad.addColorStop(0, '#FEF08A');
      bodyGrad.addColorStop(0.5, '#2DD4BF');
      bodyGrad.addColorStop(1, '#0F766E');
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lx, bodyTop - 4);
      ctx.quadraticCurveTo(lx + 16, bodyTop + 14, lx + 9, bodyTop + bodyH);
      ctx.lineTo(lx - 9, bodyTop + bodyH);
      ctx.quadraticCurveTo(lx - 16, bodyTop + 14, lx, bodyTop - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.arc(lx, bodyTop + bodyH + 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawLapisLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 115;
  const r = isLarge ? Math.min(54, availableHeight * 0.3) : 26;
  const armSpan = isLarge ? 290 : 200;

  // Flanking geometric lines
  ctx.strokeStyle = '#2DD4BF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - armSpan, cy);
  ctx.lineTo(cx - r - 18, cy);
  ctx.moveTo(cx + r + 18, cy);
  ctx.lineTo(cx + armSpan, cy);
  ctx.stroke();

  for (const off of [-armSpan, -armSpan * 0.62, armSpan * 0.62, armSpan]) {
    drawIslamicStar(ctx, cx + off, cy, 7, 3.5, 8, '#FCD34D');
  }

  // Outer Compass Halo
  ctx.strokeStyle = 'rgba(252, 211, 77, 0.7)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
  ctx.stroke();

  // 12-Pointed Turquoise & Gold Star Mandala
  drawIslamicStar(ctx, cx, cy, r, r * 0.56, 12, 'rgba(45, 212, 191, 0.35)', '#2DD4BF', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.74, r * 0.38, 12, '#FCD34D', '#0F172A', 1.4);

  // Glowing Turquoise Core Gem
  const core = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, r * 0.34);
  core.addColorStop(0, '#FFFFFF');
  core.addColorStop(0.4, '#5EEAD4');
  core.addColorStop(1, '#0F766E');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============================================================================
// DESIGN 4: RASULID GARNET & PEARL (الطراز الرسولي القرمزي واللؤلؤي)
// ============================================================================

export function drawRasulidBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  // 1. Royal Rasulid Garnet / Pomegranate Burgundy Outer Frame
  const outerGrad = ctx.createLinearGradient(0, 0, width, height);
  outerGrad.addColorStop(0, '#4C0D20');
  outerGrad.addColorStop(0.5, '#701430');
  outerGrad.addColorStop(1, '#3D0818');
  ctx.fillStyle = outerGrad;
  ctx.fillRect(0, 0, width, height);

  // Rose-gold outer pinstripe
  ctx.strokeStyle = 'rgba(229, 169, 130, 0.7)';
  ctx.lineWidth = 2.4;
  drawRoundRectPath(
    ctx,
    outerMargin - 4,
    outerMargin - 4,
    width - (outerMargin - 4) * 2,
    height - (outerMargin - 4) * 2,
    36
  );
  ctx.stroke();

  // 2. Inner Luminous Pearl-Rose Sanctuary Panel
  const cardX = innerMargin + 6;
  const cardY = innerMargin + 6;
  const cardW = width - (innerMargin + 6) * 2;
  const cardH = height - (innerMargin + 6) * 2;

  const pearlGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
  pearlGrad.addColorStop(0, '#FFFBF8');
  pearlGrad.addColorStop(0.5, '#FFF6F1');
  pearlGrad.addColorStop(1, '#FBEBE3');
  ctx.fillStyle = pearlGrad;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.fill();

  // Subtle floral arabesque medallions watermark
  ctx.save();
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.clip();
  ctx.strokeStyle = 'rgba(200, 125, 85, 0.065)';
  ctx.lineWidth = 1.2;
  for (let x = cardX + 90; x < cardX + cardW; x += 150) {
    for (let y = cardY + 120; y < cardY + cardH; y += 150) {
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.stroke();
      drawIslamicStar(ctx, x, y, 22, 10, 12, undefined, 'rgba(136, 19, 55, 0.04)', 1);
    }
  }
  ctx.restore();

  // Double Copper-Gold & Garnet Border
  ctx.strokeStyle = '#C87D55';
  ctx.lineWidth = 3.2;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.stroke();

  ctx.strokeStyle = '#881337';
  ctx.lineWidth = 1.5;
  drawRoundRectPath(ctx, cardX + 9, cardY + 9, cardW - 18, cardH - 18, 25);
  ctx.stroke();

  // 3. Top & Bottom Scalloped Polylobed Borders (الأقواس المفصصة الرسولية)
  const lobeCount = 9;
  const lobeStartX = cardX + 90;
  const lobeEndX = cardX + cardW - 90;
  const lobeSpan = (lobeEndX - lobeStartX) / lobeCount;

  ctx.save();
  ctx.strokeStyle = '#C87D55';
  ctx.lineWidth = 2;
  for (let i = 0; i < lobeCount; i++) {
    const lx = lobeStartX + i * lobeSpan + lobeSpan / 2;
    // Top subtle scalloped crest (stays strictly inside top edge <= y=88)
    ctx.fillStyle = i % 2 === 0 ? '#881337' : '#E2A878';
    ctx.beginPath();
    ctx.arc(lx, cardY + 10, 10, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Bottom subtle scalloped crest
    ctx.beginPath();
    ctx.arc(lx, cardY + cardH - 10, 10, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 4. Vertical Side Illuminated Floral Marginalia Vines (حاشية نباتية مذهبة)
  ctx.save();
  const drawSideVine = (vx: number) => {
    ctx.strokeStyle = 'rgba(200, 125, 85, 0.5)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(vx, cardY + 110);
    for (let y = cardY + 110; y < cardY + cardH - 110; y += 70) {
      ctx.quadraticCurveTo(vx + 10, y + 18, vx, y + 35);
      ctx.quadraticCurveTo(vx - 10, y + 52, vx, y + 70);
    }
    ctx.stroke();

    for (let y = cardY + 145; y < cardY + cardH - 130; y += 70) {
      drawIslamicStar(ctx, vx, y, 7, 3.5, 6, '#C87D55', '#881337', 0.9);
    }
  };
  drawSideVine(cardX + 26);
  drawSideVine(cardX + cardW - 26);
  ctx.restore();
}

export function drawRasulidUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const r = isSpacious ? Math.min(44, availableHeight * 0.28) : 22;
  const span = isSpacious ? 270 : 200;

  // Symmetrical copper-rose arabesque wings
  ctx.strokeStyle = '#C87D55';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - r - 12, cy);
  ctx.bezierCurveTo(cx - r - 55, cy - 22, cx - span * 0.65, cy + 20, cx - span, cy - 4);
  ctx.moveTo(cx + r + 12, cy);
  ctx.bezierCurveTo(cx + r + 55, cy - 22, cx + span * 0.65, cy + 20, cx + span, cy - 4);
  ctx.stroke();

  // Pomegranate-petal buds on wing tips
  for (const dir of [-1, 1] as const) {
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.arc(cx + dir * span, cy - 4, 5.5, 0, Math.PI * 2);
    ctx.fill();
    drawDiamond(ctx, cx + dir * span * 0.55, cy, 8, 5, '#E2A878', '#881337', 1.2);
  }

  // Central Rasulid Polylobed Crest Medallion
  const petals = 12;
  ctx.fillStyle = 'rgba(136, 19, 55, 0.14)';
  ctx.strokeStyle = '#881337';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < petals; i++) {
    const a = (i * Math.PI * 2) / petals;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  drawIslamicStar(ctx, cx, cy, r * 0.75, r * 0.38, 12, '#C87D55', '#6B122C', 1.4);
  ctx.fillStyle = '#FFF9F6';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#881337';
  ctx.stroke();
  ctx.restore();
}

export function drawRasulidLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 115;
  const r = isLarge ? Math.min(52, availableHeight * 0.3) : 24;
  const span = isLarge ? 300 : 210;

  // Curved floral bracket ribbon
  ctx.strokeStyle = '#881337';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r - 16, cy);
  ctx.moveTo(cx + r + 16, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  // Taiz Rasulid Shamsa (شمسة تعز الرسولية)
  const shamsaGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, r);
  shamsaGrad.addColorStop(0, '#FFF5F0');
  shamsaGrad.addColorStop(0.55, '#E2A878');
  shamsaGrad.addColorStop(1, '#881337');

  drawIslamicStar(ctx, cx, cy, r, r * 0.62, 16, shamsaGrad, '#6B122C', 1.8);
  drawIslamicStar(ctx, cx, cy, r * 0.62, r * 0.32, 8, '#FFF9F6', '#C87D55', 1.4);
  ctx.fillStyle = '#881337';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============================================================================
// DESIGN 5: HADRAMI TARIM DOMES & YEMENI AGATE (قباب تريم والعقيق اليماني)
// ============================================================================

function drawYemeniAgateGem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  // Bronze braided bezel ring
  ctx.fillStyle = '#B08943';
  ctx.strokeStyle = '#0D4A4E';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glossy Yemeni Carnelian Agate (العقيق اليماني)
  const agateGrad = ctx.createRadialGradient(
    cx - radius * 0.3,
    cy - radius * 0.3,
    1,
    cx,
    cy,
    radius
  );
  agateGrad.addColorStop(0, '#FDBA74');
  agateGrad.addColorStop(0.28, '#EA580C');
  agateGrad.addColorStop(0.68, '#B91C1C');
  agateGrad.addColorStop(1, '#7F1D1D');
  ctx.fillStyle = agateGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Specular gem glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.ellipse(cx - radius * 0.32, cy - radius * 0.32, radius * 0.25, radius * 0.14, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawHadramiBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  // 1. Oasis Mist-Mint & Cream Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#F7FCF9');
  bgGrad.addColorStop(0.45, '#ECF7F1');
  bgGrad.addColorStop(1, '#DFF0E7');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft Sandstone-Jade Outer Frame Mat
  ctx.strokeStyle = '#0F5257';
  ctx.lineWidth = 5;
  drawRoundRectPath(
    ctx,
    outerMargin,
    outerMargin,
    width - outerMargin * 2,
    height - outerMargin * 2,
    34
  );
  ctx.stroke();

  ctx.strokeStyle = '#C8A26B';
  ctx.lineWidth = 2;
  drawRoundRectPath(
    ctx,
    outerMargin + 9,
    outerMargin + 9,
    width - (outerMargin + 9) * 2,
    height - (outerMargin + 9) * 2,
    28
  );
  ctx.stroke();

  // Inner Sanctuary Frame
  const cardX = innerMargin + 4;
  const cardY = innerMargin + 4;
  const cardW = width - (innerMargin + 4) * 2;
  const cardH = height - (innerMargin + 4) * 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.strokeStyle = '#0F766E';
  ctx.lineWidth = 2.4;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fill();
  ctx.stroke();

  // 2. Vertical Mashrabiya Lattice Columns on Left & Right
  ctx.save();
  const drawMashrabiyaStrip = (sx: number) => {
    ctx.strokeStyle = 'rgba(15, 118, 110, 0.25)';
    ctx.lineWidth = 1.4;
    for (let y = cardY + 120; y <= cardY + cardH - 140; y += 44) {
      drawDiamond(ctx, sx, y, 10, 18, undefined, 'rgba(15, 118, 110, 0.26)', 1.2);
      drawDiamond(ctx, sx, y, 4, 7, 'rgba(194, 65, 12, 0.22)');
    }
  };
  drawMashrabiyaStrip(cardX + 24);
  drawMashrabiyaStrip(cardX + cardW - 24);
  ctx.restore();

  // 3. Twin Tarim Slender Minarets at Top Left & Right Framing Header
  const drawTarimMinaret = (mx: number) => {
    ctx.save();
    ctx.fillStyle = '#0D4A4E';
    ctx.strokeStyle = '#C8A26B';
    ctx.lineWidth = 1.6;
    // Tower shaft
    ctx.beginPath();
    ctx.moveTo(mx - 10, cardY + 76);
    ctx.lineTo(mx - 7, cardY + 34);
    ctx.lineTo(mx + 7, cardY + 34);
    ctx.lineTo(mx + 10, cardY + 76);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Dome tip
    ctx.beginPath();
    ctx.moveTo(mx - 9, cardY + 34);
    ctx.quadraticCurveTo(mx, cardY + 12, mx + 9, cardY + 34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  drawTarimMinaret(cardX + 95);
  drawTarimMinaret(cardX + cardW - 95);

  // 4. Four Corner Yemeni Agate Cabochons (فصوص العقيق اليماني بالأركان)
  drawYemeniAgateGem(ctx, cardX + 28, cardY + 28, 12);
  drawYemeniAgateGem(ctx, cardX + cardW - 28, cardY + 28, 12);
  drawYemeniAgateGem(ctx, cardX + 28, cardY + cardH - 28, 12);
  drawYemeniAgateGem(ctx, cardX + cardW - 28, cardY + cardH - 28, 12);
}

export function drawHadramiUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const domeW = isSpacious ? 120 : 84;
  const domeH = isSpacious ? 62 : 34;
  const baseY = cy + domeH * 0.45;

  // Flanking Jade Oasis Leaf Scroll Wings
  const wingSpan = isSpacious ? 270 : 210;
  ctx.strokeStyle = '#0F766E';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - wingSpan, baseY);
  ctx.quadraticCurveTo(cx - wingSpan * 0.65, baseY - 22, cx - domeW * 0.55, baseY);
  ctx.moveTo(cx + wingSpan, baseY);
  ctx.quadraticCurveTo(cx + wingSpan * 0.65, baseY - 22, cx + domeW * 0.55, baseY);
  ctx.stroke();

  // Tarim Layered Ogee Mosque Dome
  const domeGrad = ctx.createLinearGradient(cx, baseY - domeH, cx, baseY);
  domeGrad.addColorStop(0, '#115E59');
  domeGrad.addColorStop(0.55, '#0F766E');
  domeGrad.addColorStop(1, '#CCFBF1');
  ctx.fillStyle = domeGrad;
  ctx.strokeStyle = '#B08943';
  ctx.lineWidth = 2.4;

  ctx.beginPath();
  ctx.moveTo(cx - domeW * 0.5, baseY);
  ctx.bezierCurveTo(
    cx - domeW * 0.55,
    baseY - domeH * 0.55,
    cx - domeW * 0.14,
    baseY - domeH * 0.72,
    cx,
    baseY - domeH
  );
  ctx.bezierCurveTo(
    cx + domeW * 0.14,
    baseY - domeH * 0.72,
    cx + domeW * 0.55,
    baseY - domeH * 0.55,
    cx + domeW * 0.5,
    baseY
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner white arch silhouette
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.moveTo(cx - domeW * 0.28, baseY);
  ctx.quadraticCurveTo(cx, baseY - domeH * 0.75, cx + domeW * 0.28, baseY);
  ctx.closePath();
  ctx.fill();

  // Finial + Yemeni Agate center gem
  drawYemeniAgateGem(ctx, cx, baseY - domeH * 0.28, isSpacious ? 11 : 7);

  ctx.restore();
}

export function drawHadramiLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const span = isLarge ? 290 : 200;

  // Braided Double Knotwork Ribbon
  ctx.strokeStyle = '#0F766E';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let x = cx - span; x <= cx + span; x += 40) {
    const wave = Math.sin(((x - (cx - span)) / (span * 2)) * Math.PI * 8) * (isLarge ? 12 : 8);
    if (x === cx - span) ctx.moveTo(x, cy + wave);
    else ctx.lineTo(x, cy + wave);
  }
  ctx.stroke();

  ctx.strokeStyle = '#B08943';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let x = cx - span; x <= cx + span; x += 40) {
    const wave = -Math.sin(((x - (cx - span)) / (span * 2)) * Math.PI * 8) * (isLarge ? 12 : 8);
    if (x === cx - span) ctx.moveTo(x, cy + wave);
    else ctx.lineTo(x, cy + wave);
  }
  ctx.stroke();

  // Central Jade Star + Yemeni Carnelian Agate Brooch
  const starR = isLarge ? 36 : 22;
  drawIslamicStar(ctx, cx, cy, starR, starR * 0.55, 8, '#0D4A4E', '#B08943', 2);
  drawYemeniAgateGem(ctx, cx, cy, isLarge ? 14 : 9);

  ctx.restore();
}

// ============================================================================
// DESIGN 6: OBSIDIAN NIGHT & GOLD (الليل الملكي والذهبي)
// ============================================================================

export function drawObsidianGoldBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#050508');
  bgGrad.addColorStop(0.48, '#0D0B12');
  bgGrad.addColorStop(1, '#040406');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Warm ambient golden radial glow
  const centerGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.46,
    50,
    width / 2,
    height * 0.46,
    width * 0.72
  );
  centerGlow.addColorStop(0, 'rgba(245, 158, 11, 0.14)');
  centerGlow.addColorStop(0.55, 'rgba(180, 83, 9, 0.06)');
  centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, width, height);

  // Delicate golden geometric star tessellation
  ctx.save();
  for (let x = 60; x < width; x += 120) {
    for (let y = 60; y < height; y += 120) {
      drawIslamicStar(ctx, x, y, 13, 6, 8, undefined, 'rgba(245, 158, 11, 0.08)', 1);
    }
  }
  ctx.restore();

  // Outer gilded frame
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  drawChamferRectPath(
    ctx,
    outerMargin,
    outerMargin,
    width - outerMargin * 2,
    height - outerMargin * 2,
    30
  );
  ctx.stroke();

  ctx.strokeStyle = 'rgba(253, 230, 138, 0.45)';
  ctx.lineWidth = 1.4;
  drawChamferRectPath(
    ctx,
    outerMargin + 9,
    outerMargin + 9,
    width - (outerMargin + 9) * 2,
    height - (outerMargin + 9) * 2,
    24
  );
  ctx.stroke();

  // Inner dark velvet panel
  const cardX = innerMargin + 4;
  const cardY = innerMargin + 4;
  const cardW = width - (innerMargin + 4) * 2;
  const cardH = height - (innerMargin + 4) * 2;

  ctx.fillStyle = 'rgba(14, 12, 18, 0.72)';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.4;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fill();
  ctx.stroke();

  // Corner 8-point gold medallions
  const corners = [
    [cardX + 30, cardY + 30],
    [cardX + cardW - 30, cardY + 30],
    [cardX + 30, cardY + cardH - 30],
    [cardX + cardW - 30, cardY + cardH - 30],
  ];
  corners.forEach(([cx, cy]) => {
    drawIslamicStar(ctx, cx, cy, 16, 7.5, 8, '#78350F', '#FBBF24', 1.5);
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawObsidianGoldUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const archW = isSpacious ? 260 : 200;
  const archH = isSpacious ? 74 : 42;
  const baseY = cy + archH * 0.4;

  // Flanking golden filigree wings
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - archW * 0.9, baseY - 6);
  ctx.quadraticCurveTo(cx - archW * 0.55, baseY - 26, cx - archW * 0.25, baseY - 6);
  ctx.moveTo(cx + archW * 0.9, baseY - 6);
  ctx.quadraticCurveTo(cx + archW * 0.55, baseY - 26, cx + archW * 0.25, baseY - 6);
  ctx.stroke();

  // Central luminous crescent + hanging lantern glow
  const glow = ctx.createRadialGradient(cx, cy - 4, 4, cx, cy - 4, isSpacious ? 56 : 36);
  glow.addColorStop(0, 'rgba(253, 224, 71, 0.55)');
  glow.addColorStop(0.55, 'rgba(245, 158, 11, 0.16)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy - 4, isSpacious ? 56 : 36, 0, Math.PI * 2);
  ctx.fill();

  const r = isSpacious ? 28 : 18;
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r * 0.85, r * 0.42, 12, '#B45309', '#FDE68A', 1.6);
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.arc(cx, cy, isSpacious ? 6 : 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawObsidianGoldLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const span = isLarge ? 290 : 200;

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - 56, cy);
  ctx.moveTo(cx + 56, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawDiamond(ctx, cx - span * 0.55, cy, 12, 6, '#78350F', '#FBBF24', 1.4);
  drawDiamond(ctx, cx + span * 0.55, cy, 12, 6, '#78350F', '#FBBF24', 1.4);

  const outerR = isLarge ? 42 : 26;
  drawIslamicStar(ctx, cx, cy, outerR, outerR * 0.58, 12, '#451A03', '#F59E0B', 2);
  drawIslamicStar(ctx, cx, cy, outerR * 0.55, outerR * 0.28, 8, '#F59E0B', '#FEF3C7', 1.4);
  ctx.restore();
}

// ============================================================================
// DESIGN 7: SKY AZURE & SILVER (الفجر السماوي واللازورد)
// ============================================================================

export function drawSkyAzureBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#F8FCFF');
  bgGrad.addColorStop(0.5, '#E0F2FE');
  bgGrad.addColorStop(1, '#BAE6FD');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const sunGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.22,
    30,
    width / 2,
    height * 0.22,
    width * 0.72
  );
  sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
  sunGlow.addColorStop(0.5, 'rgba(224, 242, 254, 0.55)');
  sunGlow.addColorStop(1, 'rgba(186, 230, 253, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, width, height);

  // Outer cerulean arch-cornered frame
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 4.5;
  drawRoundRectPath(
    ctx,
    outerMargin,
    outerMargin,
    width - outerMargin * 2,
    height - outerMargin * 2,
    36
  );
  ctx.stroke();

  ctx.strokeStyle = '#7DD3FC';
  ctx.lineWidth = 1.8;
  drawRoundRectPath(
    ctx,
    outerMargin + 9,
    outerMargin + 9,
    width - (outerMargin + 9) * 2,
    height - (outerMargin + 9) * 2,
    29
  );
  ctx.stroke();

  const cardX = innerMargin + 4;
  const cardY = innerMargin + 4;
  const cardW = width - (innerMargin + 4) * 2;
  const cardH = height - (innerMargin + 4) * 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.strokeStyle = '#0369A1';
  ctx.lineWidth = 2.2;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fill();
  ctx.stroke();

  // Subtle horizontal cloud-wave lattice along sides
  ctx.save();
  ctx.strokeStyle = 'rgba(2, 132, 199, 0.16)';
  ctx.lineWidth = 1.4;
  for (let y = cardY + 130; y <= cardY + cardH - 130; y += 52) {
    ctx.beginPath();
    ctx.arc(cardX + 22, y, 7, 0, Math.PI * 2);
    ctx.arc(cardX + cardW - 22, y, 7, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Four corner azure medallions
  [
    [cardX + 28, cardY + 28],
    [cardX + cardW - 28, cardY + 28],
    [cardX + 28, cardY + cardH - 28],
    [cardX + cardW - 28, cardY + cardH - 28],
  ].forEach(([cx, cy]) => {
    drawIslamicStar(ctx, cx, cy, 14, 7, 8, '#0284C7', '#E0F2FE', 1.6);
  });
}

export function drawSkyAzureUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const domeW = isSpacious ? 136 : 92;
  const domeH = isSpacious ? 58 : 34;
  const baseY = cy + domeH * 0.42;

  // Flanking cerulean waves
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2;
  const span = isSpacious ? 260 : 195;
  ctx.beginPath();
  ctx.moveTo(cx - span, baseY);
  ctx.quadraticCurveTo(cx - span * 0.55, baseY - 22, cx - domeW * 0.55, baseY);
  ctx.moveTo(cx + span, baseY);
  ctx.quadraticCurveTo(cx + span * 0.55, baseY - 22, cx + domeW * 0.55, baseY);
  ctx.stroke();

  // Cerulean & Silver Dawn Dome
  const domeGrad = ctx.createLinearGradient(cx, baseY - domeH, cx, baseY);
  domeGrad.addColorStop(0, '#0369A1');
  domeGrad.addColorStop(0.55, '#0EA5E9');
  domeGrad.addColorStop(1, '#E0F2FE');
  ctx.fillStyle = domeGrad;
  ctx.strokeStyle = '#0C4A6E';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - domeW * 0.5, baseY);
  ctx.quadraticCurveTo(cx, baseY - domeH * 1.35, cx + domeW * 0.5, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawIslamicStar(
    ctx,
    cx,
    baseY - domeH * 0.34,
    isSpacious ? 14 : 9,
    isSpacious ? 7 : 4.5,
    8,
    '#FFFFFF',
    '#0369A1',
    1.4
  );
  ctx.restore();
}

export function drawSkyAzureLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const span = isLarge ? 280 : 190;

  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - 50, cy);
  ctx.moveTo(cx + 50, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  const r = isLarge ? 38 : 24;
  drawIslamicStar(ctx, cx, cy, r, r * 0.58, 12, '#0284C7', '#BAE6FD', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.5, r * 0.25, 8, '#FFFFFF', '#0369A1', 1.4);
  ctx.restore();
}

// ============================================================================
// DESIGN 8: EMERALD SANCTUARY (الروضة الزمردية المضيئة)
// ============================================================================

export function drawEmeraldSanctuaryBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#F5FEF9');
  bgGrad.addColorStop(0.5, '#E4FBF0');
  bgGrad.addColorStop(1, '#CCF5E1');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Rawdah botanical star watermark pattern
  ctx.save();
  for (let x = 75; x < width; x += 130) {
    for (let y = 75; y < height; y += 130) {
      drawIslamicStar(ctx, x, y, 14, 7, 8, undefined, 'rgba(5, 150, 105, 0.08)', 1);
    }
  }
  ctx.restore();

  // Outer emerald & amber-gold dual borders
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 4.5;
  drawRoundRectPath(
    ctx,
    outerMargin,
    outerMargin,
    width - outerMargin * 2,
    height - outerMargin * 2,
    34
  );
  ctx.stroke();

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.8;
  drawRoundRectPath(
    ctx,
    outerMargin + 9,
    outerMargin + 9,
    width - (outerMargin + 9) * 2,
    height - (outerMargin + 9) * 2,
    27
  );
  ctx.stroke();

  const cardX = innerMargin + 4;
  const cardY = innerMargin + 4;
  const cardW = width - (innerMargin + 4) * 2;
  const cardH = height - (innerMargin + 4) * 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.76)';
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 2.2;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fill();
  ctx.stroke();

  [
    [cardX + 28, cardY + 28],
    [cardX + cardW - 28, cardY + 28],
    [cardX + 28, cardY + cardH - 28],
    [cardX + cardW - 28, cardY + cardH - 28],
  ].forEach(([cx, cy]) => {
    drawIslamicStar(ctx, cx, cy, 15, 7.5, 8, '#059669', '#FDE68A', 1.6);
  });
}

export function drawEmeraldSanctuaryUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const archW = isSpacious ? 240 : 185;
  const archH = isSpacious ? 58 : 34;
  const baseY = cy + archH * 0.42;

  // Flanking gold leaf arabesque arcs
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - archW * 0.95, baseY);
  ctx.quadraticCurveTo(cx - archW * 0.6, baseY - 22, cx - archW * 0.28, baseY);
  ctx.moveTo(cx + archW * 0.95, baseY);
  ctx.quadraticCurveTo(cx + archW * 0.6, baseY - 22, cx + archW * 0.28, baseY);
  ctx.stroke();

  // Rawdah Emerald Mihrab Arch
  const grad = ctx.createLinearGradient(cx, baseY - archH, cx, baseY);
  grad.addColorStop(0, '#047857');
  grad.addColorStop(0.65, '#10B981');
  grad.addColorStop(1, '#D1FAE5');
  ctx.fillStyle = grad;
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - archW * 0.28, baseY);
  ctx.bezierCurveTo(
    cx - archW * 0.3,
    baseY - archH * 0.6,
    cx - archW * 0.08,
    baseY - archH * 0.8,
    cx,
    baseY - archH
  );
  ctx.bezierCurveTo(
    cx + archW * 0.08,
    baseY - archH * 0.8,
    cx + archW * 0.3,
    baseY - archH * 0.6,
    cx + archW * 0.28,
    baseY
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawIslamicStar(
    ctx,
    cx,
    baseY - archH * 0.32,
    isSpacious ? 13 : 8,
    isSpacious ? 6.5 : 4,
    8,
    '#FEF3C7',
    '#B45309',
    1.4
  );
  ctx.restore();
}

export function drawEmeraldSanctuaryLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const span = isLarge ? 280 : 190;

  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - 52, cy);
  ctx.moveTo(cx + 52, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawDiamond(ctx, cx - span * 0.55, cy, 11, 5.5, '#D1FAE5', '#059669', 1.4);
  drawDiamond(ctx, cx + span * 0.55, cy, 11, 5.5, '#D1FAE5', '#059669', 1.4);

  const r = isLarge ? 38 : 24;
  drawIslamicStar(ctx, cx, cy, r, r * 0.58, 10, '#047857', '#D97706', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.48, r * 0.24, 8, '#FDE68A', '#065F46', 1.4);
  ctx.restore();
}

// ============================================================================
// DESIGN 9: ROYAL AMETHYST & GOLD (الأرجواني الملكي والبنفسجي)
// ============================================================================

export function drawRoyalAmethystBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#17072E');
  bgGrad.addColorStop(0.5, '#2E1065');
  bgGrad.addColorStop(1, '#120526');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const aura = ctx.createRadialGradient(
    width / 2,
    height * 0.44,
    60,
    width / 2,
    height * 0.44,
    width * 0.72
  );
  aura.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
  aura.addColorStop(0.6, 'rgba(109, 40, 217, 0.08)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Subtle astrolabe celestial circles
  ctx.save();
  ctx.strokeStyle = 'rgba(216, 180, 254, 0.08)';
  ctx.lineWidth = 1.6;
  [width * 0.34, width * 0.46, width * 0.58].forEach((radius) => {
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.5, radius, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();

  ctx.strokeStyle = '#C084FC';
  ctx.lineWidth = 3.8;
  drawChamferRectPath(
    ctx,
    outerMargin,
    outerMargin,
    width - outerMargin * 2,
    height - outerMargin * 2,
    30
  );
  ctx.stroke();

  ctx.strokeStyle = 'rgba(252, 211, 77, 0.6)';
  ctx.lineWidth = 1.5;
  drawChamferRectPath(
    ctx,
    outerMargin + 9,
    outerMargin + 9,
    width - (outerMargin + 9) * 2,
    height - (outerMargin + 9) * 2,
    24
  );
  ctx.stroke();

  const cardX = innerMargin + 4;
  const cardY = innerMargin + 4;
  const cardW = width - (innerMargin + 4) * 2;
  const cardH = height - (innerMargin + 4) * 2;

  ctx.fillStyle = 'rgba(30, 11, 75, 0.62)';
  ctx.strokeStyle = '#A855F7';
  ctx.lineWidth = 2.2;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fill();
  ctx.stroke();

  [
    [cardX + 28, cardY + 28],
    [cardX + cardW - 28, cardY + 28],
    [cardX + 28, cardY + cardH - 28],
    [cardX + cardW - 28, cardY + cardH - 28],
  ].forEach(([cx, cy]) => {
    drawIslamicStar(ctx, cx, cy, 15, 7, 8, '#7C3AED', '#FCD34D', 1.6);
  });
}

export function drawRoyalAmethystUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const r = isSpacious ? 30 : 19;
  const wingSpan = isSpacious ? 260 : 190;

  ctx.strokeStyle = '#C084FC';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx - wingSpan, cy);
  ctx.quadraticCurveTo(cx - wingSpan * 0.55, cy - 22, cx - r * 1.4, cy);
  ctx.moveTo(cx + wingSpan, cy);
  ctx.quadraticCurveTo(cx + wingSpan * 0.55, cy - 22, cx + r * 1.4, cy);
  ctx.stroke();

  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r, r * 0.48, 12, '#7C3AED', '#FDE68A', 1.8);
  ctx.fillStyle = '#FCD34D';
  ctx.beginPath();
  ctx.arc(cx, cy, isSpacious ? 5.5 : 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawRoyalAmethystLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const span = isLarge ? 285 : 195;

  ctx.strokeStyle = 'rgba(192, 132, 252, 0.7)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - 56, cy);
  ctx.moveTo(cx + 56, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawDiamond(ctx, cx - span * 0.55, cy, 11, 5.5, '#5B21B6', '#FCD34D', 1.4);
  drawDiamond(ctx, cx + span * 0.55, cy, 11, 5.5, '#5B21B6', '#FCD34D', 1.4);

  const r = isLarge ? 40 : 25;
  drawIslamicStar(ctx, cx, cy, r, r * 0.58, 16, '#4C1D95', '#FCD34D', 1.8);
  drawIslamicStar(ctx, cx, cy, r * 0.5, r * 0.25, 8, '#C084FC', '#FEF3C7', 1.4);
  ctx.restore();
}

// ============================================================================
// DESIGN 10: SUNSET SAFFRON & COPPER (وهج الغروب والزعفران)
// ============================================================================

export function drawSunsetSaffronBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FFFBF5');
  bgGrad.addColorStop(0.5, '#FFEDD5');
  bgGrad.addColorStop(1, '#FED7AA');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const horizonGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.28,
    40,
    width / 2,
    height * 0.28,
    width * 0.75
  );
  horizonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
  horizonGlow.addColorStop(0.55, 'rgba(251, 146, 60, 0.14)');
  horizonGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#EA580C';
  ctx.lineWidth = 4.5;
  drawRoundRectPath(
    ctx,
    outerMargin,
    outerMargin,
    width - outerMargin * 2,
    height - outerMargin * 2,
    34
  );
  ctx.stroke();

  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 1.8;
  drawRoundRectPath(
    ctx,
    outerMargin + 9,
    outerMargin + 9,
    width - (outerMargin + 9) * 2,
    height - (outerMargin + 9) * 2,
    27
  );
  ctx.stroke();

  const cardX = innerMargin + 4;
  const cardY = innerMargin + 4;
  const cardW = width - (innerMargin + 4) * 2;
  const cardH = height - (innerMargin + 4) * 2;

  ctx.fillStyle = 'rgba(255, 253, 249, 0.78)';
  ctx.strokeStyle = '#C2410C';
  ctx.lineWidth = 2.2;
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fill();
  ctx.stroke();

  // Moroccan zellige diamond lattice along sides
  ctx.save();
  for (let y = cardY + 130; y <= cardY + cardH - 130; y += 48) {
    drawDiamond(ctx, cardX + 22, y, 8, 13, undefined, 'rgba(234, 88, 12, 0.24)', 1.2);
    drawDiamond(ctx, cardX + cardW - 22, y, 8, 13, undefined, 'rgba(234, 88, 12, 0.24)', 1.2);
  }
  ctx.restore();

  [
    [cardX + 28, cardY + 28],
    [cardX + cardW - 28, cardY + 28],
    [cardX + 28, cardY + cardH - 28],
    [cardX + cardW - 28, cardY + cardH - 28],
  ].forEach(([cx, cy]) => {
    drawIslamicStar(ctx, cx, cy, 15, 7.5, 8, '#EA580C', '#FFF7ED', 1.6);
  });
}

export function drawSunsetSaffronUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const archW = isSpacious ? 250 : 190;
  const archH = isSpacious ? 58 : 34;
  const baseY = cy + archH * 0.42;

  ctx.strokeStyle = '#EA580C';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - archW * 0.9, baseY);
  ctx.quadraticCurveTo(cx - archW * 0.55, baseY - 22, cx - archW * 0.26, baseY);
  ctx.moveTo(cx + archW * 0.9, baseY);
  ctx.quadraticCurveTo(cx + archW * 0.55, baseY - 22, cx + archW * 0.26, baseY);
  ctx.stroke();

  const sunGrad = ctx.createLinearGradient(cx, baseY - archH, cx, baseY);
  sunGrad.addColorStop(0, '#C2410C');
  sunGrad.addColorStop(0.55, '#F97316');
  sunGrad.addColorStop(1, '#FFEDD5');
  ctx.fillStyle = sunGrad;
  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - archW * 0.28, baseY);
  ctx.quadraticCurveTo(cx, baseY - archH * 1.4, cx + archW * 0.28, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawIslamicStar(
    ctx,
    cx,
    baseY - archH * 0.34,
    isSpacious ? 13 : 8.5,
    isSpacious ? 6.5 : 4.2,
    8,
    '#FFFBEB',
    '#9A3412',
    1.4
  );
  ctx.restore();
}

export function drawSunsetSaffronLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const span = isLarge ? 280 : 190;

  ctx.strokeStyle = '#EA580C';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - 52, cy);
  ctx.moveTo(cx + 52, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  const r = isLarge ? 38 : 24;
  drawIslamicStar(ctx, cx, cy, r, r * 0.56, 12, '#C2410C', '#FDE68A', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.5, r * 0.24, 8, '#F59E0B', '#FFFBEB', 1.4);
  ctx.restore();
}

// ============================================================================
// THEME-TO-SHARE-DESIGN AUTO-SYNC MAPPERS
// ============================================================================

export function getShareDesignForHomeVariant(
  variant: 'gold' | 'sky' | 'emerald' | 'burgundy',
  isNightMode?: boolean
): ShareDesignId {
  if (isNightMode) return 'obsidian_gold';
  switch (variant) {
    case 'sky':
      return 'sky_azure';
    case 'emerald':
      return 'emerald_sanctuary';
    case 'burgundy':
      return 'rasulid_garnet';
    case 'gold':
    default:
      return 'classic_gold';
  }
}

const PRESET_THEME_SHARE_DESIGN_MAP: Record<string, ShareDesignId> = {
  black_gold: 'obsidian_gold',
  sky_mode: 'sky_azure',
  emerald_mode: 'emerald_sanctuary',
  burgundy_mode: 'rasulid_garnet',
  shiny_gold: 'classic_gold',
};

export function getShareDesignForPresetTheme(
  themeKey: string,
  isNightMode?: boolean
): ShareDesignId {
  if (isNightMode) return 'obsidian_gold';
  return PRESET_THEME_SHARE_DESIGN_MAP[themeKey] || 'classic_gold';
}
