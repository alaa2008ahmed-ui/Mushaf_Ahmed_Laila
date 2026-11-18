import type { ShareDesignId, ShareDesignMeta, DesignTypographyTheme } from './shareCardDesigns';
import { drawRoundRectPath, drawIslamicStar } from './shareCardDesigns';

export type ExtraShareDesignId =
  | 'kiswa_calligraphy'
  | 'andalusian_zellige'
  | 'ottoman_iznik'
  | 'ramadan_crescent_dome'
  | 'damascene_abjad'
  | 'mamluk_marble'
  | 'aqsa_golden_sand'
  | 'madinah_courtyard'
  | 'isfahan_turquoise_silk'
  | 'desert_sunrise_oasis';

export const DARK_EXTRA_SHARE_DESIGN_IDS: ExtraShareDesignId[] = [
  'kiswa_calligraphy',
  'andalusian_zellige',
  'ottoman_iznik',
  'ramadan_crescent_dome',
  'damascene_abjad',
];

export interface ExtraShareDesignMeta extends Omit<ShareDesignMeta, 'id'> {
  id: ExtraShareDesignId;
  isDark: boolean;
}

export const EXTRA_SHARE_CARD_DESIGNS: ExtraShareDesignMeta[] = [
  // --- 5 LIGHT PROMINENT DESIGNS ---
  {
    id: 'isfahan_turquoise_silk',
    nameAr: 'القاشاني الفيروزي والعاجي',
    nameEn: 'Haft-Rangi Turquoise & Ivory',
    descAr: 'خزف عاجي فاخر مزخرف بعقود فيروزية وزعفرانية بارزة من الجانبين',
    descEn: 'Porcelain ivory illuminated by bold polychrome turquoise & saffron spandrels',
    previewColors: ['#F8FAFC', '#0284C7', '#D97706'],
    isDark: false,
  },
  {
    id: 'madinah_courtyard',
    nameAr: 'أروقة المدينة وظلال الحرم',
    nameEn: 'Madinah Arches & Shade',
    descAr: 'رخام الحرم العاجي المظلل بأقواس خضراء زمردية وأعمدة برونزية',
    descEn: 'Luminous Madinah courtyard travertine framed by emerald shade arches',
    previewColors: ['#F2FAF5', '#047857', '#B45309'],
    isDark: false,
  },
  {
    id: 'aqsa_golden_sand',
    nameAr: 'حجر القدس وقبة الصخرة',
    nameEn: 'Jerusalem Stone & Olive Gold',
    descAr: 'حجر قدسي مشرق مع هالة القبة المذهّبة وأغصان الزيتون المباركة',
    descEn: 'Sunlit Jerusalem limestone ashlar with golden dome sunburst & olive branches',
    previewColors: ['#FBF6E9', '#CA8A04', '#3F6212'],
    isDark: false,
  },
  {
    id: 'mamluk_marble',
    nameAr: 'الرخام المملوكي الأبلق',
    nameEn: 'Cairo Mamluk Ablaq Marble',
    descAr: 'مداميك حجر أبلق متناوب بالرخام العاجي والمغري مع تنّور مملوكي',
    descEn: 'Sculpted Mamluk alternating limestone masonry & brass chandelier crest',
    previewColors: ['#F6EFE2', '#B45309', '#7C2D12'],
    isDark: false,
  },
  {
    id: 'desert_sunrise_oasis',
    nameAr: 'واحة الفجر ونسيج السدو',
    nameEn: 'Oasis Sunrise & Sadu',
    descAr: 'شروق صحراوي دافئ بكثبان رملية وسعف النخيل ونقش السدو التراثي',
    descEn: 'Warm apricot dawn dunes, date-palm fronds & woven Bedouin Sadu border',
    previewColors: ['#FFF2E2', '#EA580C', '#9A3412'],
    isDark: false,
  },

  // --- 5 DARK PROMINENT DESIGNS ---
  {
    id: 'ramadan_crescent_dome',
    nameAr: 'سماء التهجد وقباب المآذن',
    nameEn: 'Midnight Domes & Crescent',
    descAr: 'سماء ليلية مرصعة بالنجوم وهلال مضيء فوق قباب ومآذن ذهبية',
    descEn: 'Starry celestial night with glowing crescent and mosque dome silhouettes',
    previewColors: ['#09122C', '#14B8A6', '#FCD34D'],
    isDark: true,
  },
  {
    id: 'ottoman_iznik',
    nameAr: 'خزف إزنيق الملكي',
    nameEn: 'Ottoman Iznik Ceramic',
    descAr: 'خزف بحري وفيروزي مصقول مزين بأزهار التوليب الإمبراطورية والمرجان',
    descEn: 'Glazed Aegean navy & turquoise ceramic with coral tulip arabesques',
    previewColors: ['#082032', '#06B6D4', '#FB7185'],
    isDark: true,
  },
  {
    id: 'andalusian_zellige',
    nameAr: 'فسيفساء الحمراء والزليج',
    nameEn: 'Alhambra Zellige Mosaic',
    descAr: 'بلاط الزليج المغربي البارز مع عقد أندلسي حدوي وخشب أرز مذهب',
    descEn: 'Bold Nasrid zellige star mosaic with carved horseshoe archway',
    previewColors: ['#071E3D', '#0F766E', '#FBBF24'],
    isDark: true,
  },
  {
    id: 'damascene_abjad',
    nameAr: 'الخشب الدمشقي والصدف',
    nameEn: 'Damascene Walnut & Pearl',
    descAr: 'خشب جوز دمشقي دافئ معشّق بالصدف المتلألئ والمشربية الذهبية',
    descEn: 'Carved Damascene walnut planks inlaid with iridescent mother-of-pearl',
    previewColors: ['#24120B', '#B45309', '#FDE68A'],
    isDark: true,
  },
  {
    id: 'kiswa_calligraphy',
    nameAr: 'كسوة الكعبة المطرزة بالذهب',
    nameEn: 'Kaaba Kiswa Gold Brocade',
    descAr: 'نسج حريري أسود بنقش شيفرون الكسوة وحزام ذهبي مطرّز عيار ٢٤',
    descEn: 'Woven black Kiswa chevron silk with 24k embroidered gold belt',
    previewColors: ['#09090B', '#D97706', '#FDE047'],
    isDark: true,
  },
];

export function isExtraShareDesignId(id: string): id is ExtraShareDesignId {
  return EXTRA_SHARE_CARD_DESIGNS.some((d) => d.id === id);
}

export function getExtraDesignTypographyTheme(
  designId: ExtraShareDesignId
): DesignTypographyTheme {
  switch (designId) {
    case 'kiswa_calligraphy':
      return {
        bismillahColor: '#FDE047',
        bismillahShadow: 'rgba(234, 179, 8, 0.45)',
        badgeBgStops: ['#18140C', '#2E2311', '#141008'],
        badgeBorder: '#EAB308',
        badgeInnerLine: 'rgba(254, 240, 138, 0.5)',
        badgeStarColor: '#FACC15',
        badgeTextColor: '#FEF9C3',
        titleColor: '#FDE047',
        titleShadow: 'rgba(234, 179, 8, 0.35)',
        bodyColor: '#FFFBEB',
        highlightColor: '#FDE047',
        highlightShadow: 'rgba(234, 179, 8, 0.35)',
        bulletColor: '#FEF08A',
        bodyShadow: 'rgba(0, 0, 0, 0.78)',
        sourceDividerColor: 'rgba(234, 179, 8, 0.65)',
        sourceColor: '#FDE68A',
        footerLineColor: '#EAB308',
        footerStarFill: '#FACC15',
        footerStarStroke: '#713F12',
        brandColor: '#FFFFFF',
        brandShadow: 'rgba(0, 0, 0, 0.85)',
        subtitleColor: '#E7D59C',
      };

    case 'andalusian_zellige':
      return {
        bismillahColor: '#FCD34D',
        bismillahShadow: 'rgba(20, 184, 166, 0.4)',
        badgeBgStops: ['#0B253C', '#113A58', '#091E32'],
        badgeBorder: '#14B8A6',
        badgeInnerLine: 'rgba(252, 211, 77, 0.5)',
        badgeStarColor: '#FBBF24',
        badgeTextColor: '#E6FFFA',
        titleColor: '#5EEAD4',
        titleShadow: 'rgba(0, 0, 0, 0.5)',
        bodyColor: '#F8FAFC',
        highlightColor: '#FCD34D',
        highlightShadow: 'rgba(251, 191, 36, 0.3)',
        bulletColor: '#99F6E4',
        bodyShadow: 'rgba(4, 16, 30, 0.75)',
        sourceDividerColor: 'rgba(45, 212, 191, 0.6)',
        sourceColor: '#FDE68A',
        footerLineColor: '#14B8A6',
        footerStarFill: '#FBBF24',
        footerStarStroke: '#0F766E',
        brandColor: '#99F6E4',
        brandShadow: 'rgba(0, 0, 0, 0.75)',
        subtitleColor: '#BAE6FD',
      };

    case 'ottoman_iznik':
      return {
        bismillahColor: '#BAE6FD',
        bismillahShadow: 'rgba(6, 182, 212, 0.4)',
        badgeBgStops: ['#0A2538', '#0E3750', '#081D2D'],
        badgeBorder: '#F43F5E',
        badgeInnerLine: 'rgba(56, 189, 248, 0.5)',
        badgeStarColor: '#FDA4AF',
        badgeTextColor: '#E0F2FE',
        titleColor: '#FDA4AF',
        titleShadow: 'rgba(244, 63, 94, 0.35)',
        bodyColor: '#F8FAFC',
        highlightColor: '#67E8F9',
        highlightShadow: 'rgba(6, 182, 212, 0.3)',
        bulletColor: '#FECDD3',
        bodyShadow: 'rgba(4, 18, 30, 0.72)',
        sourceDividerColor: 'rgba(251, 113, 133, 0.6)',
        sourceColor: '#BAE6FD',
        footerLineColor: '#22D3EE',
        footerStarFill: '#FB7185',
        footerStarStroke: '#0E7490',
        brandColor: '#FDE68A',
        brandShadow: 'rgba(0, 0, 0, 0.65)',
        subtitleColor: '#A5F3FC',
      };

    case 'ramadan_crescent_dome':
      return {
        bismillahColor: '#FDE68A',
        bismillahShadow: 'rgba(251, 191, 36, 0.45)',
        badgeBgStops: ['#0C1C3E', '#14305E', '#0A1733'],
        badgeBorder: '#FBBF24',
        badgeInnerLine: 'rgba(45, 212, 191, 0.45)',
        badgeStarColor: '#5EEAD4',
        badgeTextColor: '#FEF3C7',
        titleColor: '#FCD34D',
        titleShadow: 'rgba(245, 158, 11, 0.35)',
        bodyColor: '#F8FAFC',
        highlightColor: '#5EEAD4',
        highlightShadow: 'rgba(45, 212, 191, 0.3)',
        bulletColor: '#FDE68A',
        bodyShadow: 'rgba(3, 8, 24, 0.8)',
        sourceDividerColor: 'rgba(251, 191, 36, 0.58)',
        sourceColor: '#99F6E4',
        footerLineColor: '#F59E0B',
        footerStarFill: '#FCD34D',
        footerStarStroke: '#14B8A6',
        brandColor: '#99F6E4',
        brandShadow: 'rgba(0, 0, 0, 0.85)',
        subtitleColor: '#CBD5E1',
      };

    case 'damascene_abjad':
      return {
        bismillahColor: '#FEF3C7',
        bismillahShadow: 'rgba(217, 119, 6, 0.4)',
        badgeBgStops: ['#2E170E', '#462415', '#24120B'],
        badgeBorder: '#E5C384',
        badgeInnerLine: 'rgba(226, 232, 240, 0.45)',
        badgeStarColor: '#F8FAFC',
        badgeTextColor: '#FFFBEB',
        titleColor: '#FDE68A',
        titleShadow: 'rgba(0, 0, 0, 0.5)',
        bodyColor: '#FFFDF9',
        highlightColor: '#FCD34D',
        highlightShadow: 'rgba(217, 119, 6, 0.3)',
        bulletColor: '#F5E6C8',
        bodyShadow: 'rgba(18, 8, 4, 0.78)',
        sourceDividerColor: 'rgba(229, 195, 132, 0.6)',
        sourceColor: '#FDE68A',
        footerLineColor: '#D6B172',
        footerStarFill: '#F8FAFC',
        footerStarStroke: '#92400E',
        brandColor: '#FFFFFF',
        brandShadow: 'rgba(0, 0, 0, 0.8)',
        subtitleColor: '#E7D1AA',
      };

    case 'mamluk_marble':
      return {
        bismillahColor: '#7C2D12',
        bismillahShadow: 'rgba(180, 83, 9, 0.25)',
        badgeBgStops: ['#FFFBF2', '#FFFFFF', '#F7ECDA'],
        badgeBorder: '#9A3412',
        badgeInnerLine: 'rgba(180, 83, 9, 0.4)',
        badgeStarColor: '#B45309',
        badgeTextColor: '#431407',
        titleColor: '#7C2D12',
        titleShadow: 'rgba(180, 83, 9, 0.2)',
        bodyColor: '#27120A',
        highlightColor: '#9A3412',
        highlightShadow: 'rgba(154, 52, 18, 0.16)',
        bulletColor: '#572414',
        bodyShadow: 'rgba(255, 255, 255, 0.5)',
        sourceDividerColor: 'rgba(154, 52, 18, 0.55)',
        sourceColor: '#7C2D12',
        footerLineColor: '#B45309',
        footerStarFill: '#D97706',
        footerStarStroke: '#7C2D12',
        brandColor: '#7C2D12',
        brandShadow: 'rgba(217, 119, 6, 0.2)',
        subtitleColor: '#92400E',
      };

    case 'aqsa_golden_sand':
      return {
        bismillahColor: '#713F12',
        bismillahShadow: 'rgba(202, 138, 4, 0.3)',
        badgeBgStops: ['#FEFCE8', '#FFFFFF', '#F5F0D6'],
        badgeBorder: '#A16207',
        badgeInnerLine: 'rgba(63, 98, 18, 0.42)',
        badgeStarColor: '#4D7C0F',
        badgeTextColor: '#422006',
        titleColor: '#3F6212',
        titleShadow: 'rgba(63, 98, 18, 0.18)',
        bodyColor: '#1E1B0D',
        highlightColor: '#3F6212',
        highlightShadow: 'rgba(63, 98, 18, 0.16)',
        bulletColor: '#365314',
        bodyShadow: 'rgba(255, 255, 255, 0.45)',
        sourceDividerColor: 'rgba(161, 98, 7, 0.52)',
        sourceColor: '#3F6212',
        footerLineColor: '#A16207',
        footerStarFill: '#CA8A04',
        footerStarStroke: '#3F6212',
        brandColor: '#713F12',
        brandShadow: 'rgba(202, 138, 4, 0.25)',
        subtitleColor: '#3F6212',
      };

    case 'madinah_courtyard':
      return {
        bismillahColor: '#065F46',
        bismillahShadow: 'rgba(180, 83, 9, 0.22)',
        badgeBgStops: ['#ECFDF5', '#FFFFFF', '#DDF7EB'],
        badgeBorder: '#047857',
        badgeInnerLine: 'rgba(180, 83, 9, 0.4)',
        badgeStarColor: '#D97706',
        badgeTextColor: '#064E3B',
        titleColor: '#047857',
        titleShadow: 'rgba(4, 120, 87, 0.18)',
        bodyColor: '#06281E',
        highlightColor: '#047857',
        highlightShadow: 'rgba(4, 120, 87, 0.16)',
        bulletColor: '#065F46',
        bodyShadow: 'rgba(255, 255, 255, 0.45)',
        sourceDividerColor: 'rgba(4, 120, 87, 0.48)',
        sourceColor: '#92400E',
        footerLineColor: '#047857',
        footerStarFill: '#D97706',
        footerStarStroke: '#064E3B',
        brandColor: '#92400E',
        brandShadow: 'rgba(180, 83, 9, 0.18)',
        subtitleColor: '#047857',
      };

    case 'isfahan_turquoise_silk':
      return {
        bismillahColor: '#0C4A6E',
        bismillahShadow: 'rgba(2, 132, 199, 0.24)',
        badgeBgStops: ['#F0F9FF', '#FFFFFF', '#E0F2FE'],
        badgeBorder: '#0284C7',
        badgeInnerLine: 'rgba(217, 119, 6, 0.45)',
        badgeStarColor: '#D97706',
        badgeTextColor: '#082F49',
        titleColor: '#0369A1',
        titleShadow: 'rgba(2, 132, 199, 0.18)',
        bodyColor: '#08263C',
        highlightColor: '#0284C7',
        highlightShadow: 'rgba(2, 132, 199, 0.18)',
        bulletColor: '#075985',
        bodyShadow: 'rgba(255, 255, 255, 0.5)',
        sourceDividerColor: 'rgba(2, 132, 199, 0.48)',
        sourceColor: '#B45309',
        footerLineColor: '#0284C7',
        footerStarFill: '#F59E0B',
        footerStarStroke: '#0C4A6E',
        brandColor: '#0C4A6E',
        brandShadow: 'rgba(56, 189, 248, 0.22)',
        subtitleColor: '#B45309',
      };

    case 'desert_sunrise_oasis':
    default:
      return {
        bismillahColor: '#9A3412',
        bismillahShadow: 'rgba(234, 88, 12, 0.25)',
        badgeBgStops: ['#FFF7ED', '#FFFFFF', '#FFEDD5'],
        badgeBorder: '#C2410C',
        badgeInnerLine: 'rgba(124, 45, 18, 0.36)',
        badgeStarColor: '#EA580C',
        badgeTextColor: '#7C2D12',
        titleColor: '#9A3412',
        titleShadow: 'rgba(234, 88, 12, 0.2)',
        bodyColor: '#3B1206',
        highlightColor: '#C2410C',
        highlightShadow: 'rgba(194, 65, 12, 0.16)',
        bulletColor: '#6C220C',
        bodyShadow: 'rgba(255, 255, 255, 0.45)',
        sourceDividerColor: 'rgba(194, 65, 12, 0.52)',
        sourceColor: '#7C2D12',
        footerLineColor: '#C2410C',
        footerStarFill: '#F59E0B',
        footerStarStroke: '#7C2D12',
        brandColor: '#7C2D12',
        brandShadow: 'rgba(255, 247, 237, 0.65)',
        subtitleColor: '#9A3412',
      };
  }
}

// ============================================================================
// EXTRA HELPER PRIMITIVES
// ============================================================================

function drawDiamondShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill?: string,
  stroke?: string,
  lineWidth = 1.4
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

function drawScallopedHorseshoeArch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  archWidth: number,
  archHeight: number,
  lobes = 9
) {
  const rx = archWidth * 0.5;
  ctx.beginPath();
  const baseLeftX = cx - rx * 0.86;
  const baseRightX = cx + rx * 0.86;
  const springY = topY + archHeight;
  ctx.moveTo(baseLeftX, springY);
  for (let i = 0; i <= lobes; i++) {
    const t0 = i / (lobes + 1);
    const t1 = (i + 1) / (lobes + 1);
    const a0 = Math.PI * 1.1 - t0 * Math.PI * 1.2;
    const a1 = Math.PI * 1.1 - t1 * Math.PI * 1.2;
    const am = (a0 + a1) * 0.5;
    const x1 = cx + Math.cos(a1) * rx;
    const y1 = topY + archHeight * 0.62 - Math.sin(a1) * (archHeight * 0.62);
    const ctrlX = cx + Math.cos(am) * (rx * 1.07);
    const ctrlY = topY + archHeight * 0.62 - Math.sin(am) * (archHeight * 0.72);
    ctx.quadraticCurveTo(ctrlX, ctrlY, x1, y1);
  }
  ctx.lineTo(baseRightX, springY);
}

// ============================================================================
// 11. KISWA CALLIGRAPHY (كسوة الكعبة المطرزة بالذهب) - DARK PROMINENT
// ============================================================================

export function drawKiswaBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#070709');
  bg.addColorStop(0.5, '#111116');
  bg.addColorStop(1, '#060608');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Prominent Kaaba Silk Chevron Damask Weave across entire backdrop
  ctx.save();
  ctx.lineWidth = 2.4;
  const zigW = 72;
  const rowStep = 44;
  for (let y = -rowStep; y < height + rowStep; y += rowStep) {
    ctx.strokeStyle = y % (rowStep * 2) === 0 ? 'rgba(234, 179, 8, 0.11)' : 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    for (let x = 0; x <= width + zigW; x += zigW) {
      const px = x;
      const py = (x / zigW) % 2 === 0 ? y : y + 22;
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();

  const sheen = ctx.createRadialGradient(width / 2, height * 0.48, 40, width / 2, height * 0.48, width * 0.68);
  sheen.addColorStop(0, 'rgba(30, 24, 12, 0.72)');
  sheen.addColorStop(0.65, 'rgba(12, 10, 7, 0.55)');
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, width, height);

  // Wide Embroidered Gold Kiswa Belt top & bottom horizontal bands
  const beltH = 54;
  const beltTopY = outerMargin + 14;
  const beltBotY = height - outerMargin - 14 - beltH;
  [beltTopY, beltBotY].forEach((by) => {
    const beltGrad = ctx.createLinearGradient(outerMargin, by, width - outerMargin, by + beltH);
    beltGrad.addColorStop(0, '#78350F');
    beltGrad.addColorStop(0.25, '#D97706');
    beltGrad.addColorStop(0.5, '#FDE047');
    beltGrad.addColorStop(0.75, '#D97706');
    beltGrad.addColorStop(1, '#78350F');

    ctx.fillStyle = 'rgba(24, 18, 6, 0.92)';
    drawRoundRectPath(ctx, outerMargin, by, width - outerMargin * 2, beltH, 14);
    ctx.fill();
    ctx.strokeStyle = beltGrad;
    ctx.lineWidth = 4;
    ctx.stroke();

    for (let x = outerMargin + 44; x < width - outerMargin - 30; x += 56) {
      drawDiamondShape(ctx, x, by + beltH / 2, 12, 10, 'rgba(250, 204, 21, 0.28)', '#FACC15', 1.4);
    }
    drawIslamicStar(ctx, width / 2, by + beltH / 2, 20, 10, 8, '#FDE047', '#713F12', 2);
  });

  // Prominent Gold Brocade Side Ribbons & Medallions
  const sideXLeft = outerMargin + 22;
  const sideXRight = width - outerMargin - 22;
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sideXLeft, beltTopY + beltH);
  ctx.lineTo(sideXLeft, beltBotY);
  ctx.moveTo(sideXRight, beltTopY + beltH);
  ctx.lineTo(sideXRight, beltBotY);
  ctx.stroke();

  const spanH = beltBotY - (beltTopY + beltH);
  for (let i = 1; i <= 5; i++) {
    const my = beltTopY + beltH + (spanH * i) / 6;
    drawIslamicStar(ctx, sideXLeft, my, 18, 9, 8, '#1C1507', '#FACC15', 2);
    drawIslamicStar(ctx, sideXRight, my, 18, 9, 8, '#1C1507', '#FACC15', 2);
  }

  ctx.strokeStyle = 'rgba(250, 204, 21, 0.42)';
  ctx.lineWidth = 1.6;
  drawRoundRectPath(
    ctx,
    innerMargin + 10,
    beltTopY + beltH + 14,
    width - (innerMargin + 10) * 2,
    beltBotY - (beltTopY + beltH) - 28,
    24
  );
  ctx.stroke();
}

export function drawKiswaUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const w = isSpacious ? 240 : 170;
  const r = isSpacious ? 36 : 22;

  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - w, cy);
  ctx.lineTo(cx - r - 18, cy);
  ctx.moveTo(cx + r + 18, cy);
  ctx.lineTo(cx + w, cy);
  ctx.stroke();

  const medGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, r);
  medGrad.addColorStop(0, '#FEF08A');
  medGrad.addColorStop(0.55, '#D97706');
  medGrad.addColorStop(1, '#451A03');
  ctx.fillStyle = medGrad;
  ctx.strokeStyle = '#FDE047';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 1.45, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r * 0.62, r * 0.3, 8, '#18140C', '#FDE047', 1.6);
  drawDiamondShape(ctx, cx - r * 1.8, cy, 8, 8, '#FACC15', '#78350F', 1.2);
  drawDiamondShape(ctx, cx + r * 1.8, cy, 8, 8, '#FACC15', '#78350F', 1.2);
  ctx.restore();
}

export function drawKiswaLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const r = isLarge ? 42 : 24;
  const span = isLarge ? 260 : 180;

  ctx.strokeStyle = '#EAB308';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r - 14, cy);
  ctx.moveTo(cx + r + 14, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r, r * 0.52, 16, '#CA8A04', '#FEF08A', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.55, r * 0.28, 8, '#09090B', '#FDE047', 1.6);
  ctx.restore();
}

// ============================================================================
// 12. ANDALUSIAN ZELLIGE MOSAIC (فسيفساء الحمراء والزليج) - DARK PROMINENT
// ============================================================================

export function drawAndalusianZelligeBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#071B34');
  bg.addColorStop(0.5, '#0A2E38');
  bg.addColorStop(1, '#061529');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  const step = 108;
  for (let y = 54; y < height; y += step) {
    for (let x = 54; x < width; x += step) {
      drawIslamicStar(ctx, x, y, 42, 22, 8, 'rgba(15, 118, 110, 0.28)', 'rgba(251, 191, 36, 0.25)', 1.5);
      drawDiamondShape(ctx, x + step * 0.5, y, 16, 16, 'rgba(30, 58, 138, 0.35)', 'rgba(94, 234, 212, 0.24)', 1.2);
      drawDiamondShape(ctx, x, y + step * 0.5, 16, 16, 'rgba(180, 83, 9, 0.28)', 'rgba(252, 211, 77, 0.25)', 1.2);
    }
  }
  ctx.restore();

  const innerX = innerMargin + 12;
  const innerY = innerMargin + 22;
  const innerW = width - innerX * 2;
  const innerH = height - innerMargin * 2 - 36;

  ctx.fillStyle = 'rgba(7, 23, 41, 0.84)';
  drawRoundRectPath(ctx, innerX, innerY, innerW, innerH, 32);
  ctx.fill();
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.save();
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 4;
  drawScallopedHorseshoeArch(ctx, width / 2, innerY + 10, innerW * 0.74, 82, 11);
  ctx.stroke();

  ctx.strokeStyle = '#2DD4BF';
  ctx.lineWidth = 2;
  drawScallopedHorseshoeArch(ctx, width / 2, innerY + 22, innerW * 0.67, 68, 11);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = '#14B8A6';
  ctx.lineWidth = 3.5;
  drawRoundRectPath(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 34);
  ctx.stroke();

  [
    [outerMargin + 28, outerMargin + 28],
    [width - outerMargin - 28, outerMargin + 28],
    [outerMargin + 28, height - outerMargin - 28],
    [width - outerMargin - 28, height - outerMargin - 28],
  ].forEach(([cx, cy]) => {
    drawIslamicStar(ctx, cx, cy, 22, 10, 8, '#0F766E', '#FCD34D', 2);
  });
}

export function drawAndalusianZelligeUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const span = isSpacious ? 240 : 170;
  const h = isSpacious ? 58 : 34;

  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 2.4;
  [-span * 0.45, 0, span * 0.45].forEach((offset, idx) => {
    const aw = idx === 1 ? span * 0.46 : span * 0.34;
    const ah = idx === 1 ? h : h * 0.78;
    drawScallopedHorseshoeArch(ctx, cx + offset, cy - ah * 0.5, aw, ah, 5);
    ctx.stroke();
  });

  drawIslamicStar(ctx, cx, cy + 4, isSpacious ? 14 : 9, isSpacious ? 7 : 4.5, 8, '#14B8A6', '#FDE68A', 1.6);
  ctx.restore();
}

export function drawAndalusianZelligeLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const r = isLarge ? 38 : 22;
  const span = isLarge ? 260 : 180;

  ctx.strokeStyle = '#2DD4BF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r - 12, cy);
  ctx.moveTo(cx + r + 12, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r, r * 0.55, 8, '#0F766E', '#FBBF24', 2.2);
  drawIslamicStar(ctx, cx, cy, r * 0.5, r * 0.25, 8, '#F59E0B', '#FEF3C7', 1.5);
  ctx.restore();
}

// ============================================================================
// 13. OTTOMAN IZNIK CERAMIC (خزف إزنيق الملكي) - DARK PROMINENT
// ============================================================================

export function drawOttomanIznikBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const bg = ctx.createRadialGradient(width / 2, height * 0.45, 60, width / 2, height * 0.45, height * 0.72);
  bg.addColorStop(0, '#0D334C');
  bg.addColorStop(0.55, '#082032');
  bg.addColorStop(1, '#041320');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.fillStyle = 'rgba(6, 182, 212, 0.14)';
  drawRoundRectPath(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 34);
  ctx.fill();
  ctx.strokeStyle = '#22D3EE';
  ctx.lineWidth = 4;
  ctx.stroke();

  const bandStep = 95;
  for (let x = outerMargin + 70; x < width - outerMargin - 50; x += bandStep) {
    drawIslamicStar(ctx, x, outerMargin + 18, 12, 5.5, 6, '#F43F5E', '#BAE6FD', 1.4);
    drawIslamicStar(ctx, x, height - outerMargin - 18, 12, 5.5, 6, '#F43F5E', '#BAE6FD', 1.4);
  }
  for (let y = outerMargin + 95; y < height - outerMargin - 70; y += bandStep) {
    drawIslamicStar(ctx, outerMargin + 18, y, 12, 5.5, 6, '#06B6D4', '#FECDD3', 1.4);
    drawIslamicStar(ctx, width - outerMargin - 18, y, 12, 5.5, 6, '#06B6D4', '#FECDD3', 1.4);
  }
  ctx.restore();

  const spandrelR = 135;
  [
    [innerMargin, innerMargin, 1, 1],
    [width - innerMargin, innerMargin, -1, 1],
    [innerMargin, height - innerMargin, 1, -1],
    [width - innerMargin, height - innerMargin, -1, -1],
  ].forEach(([cx, cy, sx, sy]) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sx, sy);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.24)';
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(spandrelR, 0);
    ctx.quadraticCurveTo(spandrelR * 0.5, spandrelR * 0.5, 0, spandrelR);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawIslamicStar(ctx, spandrelR * 0.28, spandrelR * 0.28, 18, 8, 8, '#FB7185', '#E0F2FE', 1.5);
    ctx.restore();
  });

  ctx.strokeStyle = 'rgba(251, 113, 133, 0.72)';
  ctx.lineWidth = 2.4;
  drawRoundRectPath(ctx, innerMargin + 8, innerMargin + 8, width - (innerMargin + 8) * 2, height - (innerMargin + 8) * 2, 26);
  ctx.stroke();
}

export function drawOttomanIznikUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const r = isSpacious ? 30 : 18;
  const span = isSpacious ? 240 : 170;

  ctx.strokeStyle = '#22D3EE';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy + 8);
  ctx.bezierCurveTo(cx - span * 0.55, cy - 26, cx - r * 1.4, cy + 20, cx - r, cy);
  ctx.moveTo(cx + span, cy + 8);
  ctx.bezierCurveTo(cx + span * 0.55, cy - 26, cx + r * 1.4, cy + 20, cx + r, cy);
  ctx.stroke();

  ctx.fillStyle = '#E11D48';
  ctx.strokeStyle = '#BAE6FD';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.85);
  ctx.quadraticCurveTo(cx - r * 1.1, cy + r * 0.2, cx - r * 0.65, cy - r * 0.9);
  ctx.lineTo(cx - r * 0.2, cy - r * 0.35);
  ctx.lineTo(cx, cy - r * 1.15);
  ctx.lineTo(cx + r * 0.2, cy - r * 0.35);
  ctx.lineTo(cx + r * 0.65, cy - r * 0.9);
  ctx.quadraticCurveTo(cx + r * 1.1, cy + r * 0.2, cx, cy + r * 0.85);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawOttomanIznikLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const r = isLarge ? 38 : 22;
  const span = isLarge ? 260 : 180;

  ctx.strokeStyle = '#FB7185';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r - 12, cy);
  ctx.moveTo(cx + r + 12, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r, r * 0.56, 12, '#06B6D4', '#E0F2FE', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.5, r * 0.26, 8, '#F43F5E', '#FEF3C7', 1.6);
  ctx.restore();
}

// ============================================================================
// 14. RAMADAN CRESCENT & DOMES (سماء التهجد وقباب المآذن) - DARK PROMINENT
// ============================================================================

export function drawRamadanDomeBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#050B20');
  sky.addColorStop(0.45, '#0B1E44');
  sky.addColorStop(0.8, '#0D384F');
  sky.addColorStop(1, '#092435');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const aurora = ctx.createRadialGradient(width / 2, height * 0.25, 30, width / 2, height * 0.25, width * 0.72);
  aurora.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
  aurora.addColorStop(0.5, 'rgba(20, 184, 166, 0.12)');
  aurora.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aurora;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  for (let i = 0; i < 48; i++) {
    const sx = ((i * 197 + 41) % (width - 100)) + 50;
    const sy = ((i * 313 + 73) % (height - 260)) + 60;
    const sr = i % 5 === 0 ? 7 : i % 3 === 0 ? 4 : 2.2;
    if (i % 4 === 0) {
      drawIslamicStar(ctx, sx, sy, sr * 1.4, sr * 0.45, 4, i % 8 === 0 ? '#FDE68A' : '#99F6E4');
    } else {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(253, 230, 138, 0.65)' : 'rgba(153, 246, 228, 0.55)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.save();
  const horizonY = height - outerMargin - 20;
  ctx.fillStyle = 'rgba(4, 14, 34, 0.82)';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
  ctx.lineWidth = 2.0;

  // Low central mosque dome silhouette kept cleanly below the footer safe zone (<= 84px above horizon)
  ctx.beginPath();
  ctx.moveTo(width * 0.30, horizonY);
  ctx.bezierCurveTo(width * 0.34, horizonY - 52, width * 0.44, horizonY - 74, width * 0.5, horizonY - 84);
  ctx.bezierCurveTo(width * 0.56, horizonY - 74, width * 0.66, horizonY - 52, width * 0.70, horizonY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Subtle low flanking side domes
  [
    [width * 0.21, width * 0.32],
    [width * 0.68, width * 0.79],
  ].forEach(([x0, x1]) => {
    const mid = (x0 + x1) * 0.5;
    ctx.beginPath();
    ctx.moveTo(x0, horizonY);
    ctx.quadraticCurveTo(mid, horizonY - 46, x1, horizonY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  [outerMargin + 56, width - outerMargin - 56].forEach((mx) => {
    ctx.fillStyle = 'rgba(6, 20, 44, 0.92)';
    ctx.fillRect(mx - 12, horizonY - 195, 24, 195);
    ctx.strokeRect(mx - 12, horizonY - 195, 24, 195);
    ctx.fillRect(mx - 19, horizonY - 148, 38, 10);
    ctx.beginPath();
    ctx.moveTo(mx - 12, horizonY - 195);
    ctx.lineTo(mx, horizonY - 240);
    ctx.lineTo(mx + 12, horizonY - 195);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawIslamicStar(ctx, mx, horizonY - 252, 8, 4, 6, '#FCD34D');
  });
  ctx.restore();

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3.5;
  drawRoundRectPath(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 34);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(94, 234, 212, 0.45)';
  ctx.lineWidth = 1.6;
  drawRoundRectPath(ctx, innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, 26);
  ctx.stroke();
}

export function drawRamadanDomeUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const r = isSpacious ? 36 : 22;
  const span = isSpacious ? 240 : 170;

  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r * 1.9, cy);
  ctx.moveTo(cx + r * 1.9, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0B1E44';
  ctx.beginPath();
  ctx.arc(cx + r * 0.38, cy - r * 0.18, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  drawIslamicStar(ctx, cx + r * 0.48, cy - r * 0.14, r * 0.38, r * 0.17, 8, '#5EEAD4', '#FEF3C7', 1.2);
  ctx.restore();
}

export function drawRamadanDomeLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const span = isLarge ? 250 : 170;
  const r = isLarge ? 30 : 19;

  ctx.strokeStyle = '#5EEAD4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r * 2.2, cy);
  ctx.moveTo(cx + r * 2.2, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawIslamicStar(ctx, cx - r * 1.5, cy, r * 0.45, r * 0.2, 8, '#5EEAD4', '#FDE68A', 1.2);
  drawIslamicStar(ctx, cx + r * 1.5, cy, r * 0.45, r * 0.2, 8, '#5EEAD4', '#FDE68A', 1.2);
  drawIslamicStar(ctx, cx, cy, r, r * 0.48, 8, '#FBBF24', '#FFFBEB', 1.8);
  ctx.restore();
}

// ============================================================================
// 15. DAMASCENE WALNUT & MOTHER OF PEARL (الخشب الدمشقي والصدف) - DARK
// ============================================================================

export function drawDamasceneBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const wood = ctx.createLinearGradient(0, 0, width, height);
  wood.addColorStop(0, '#231109');
  wood.addColorStop(0.5, '#361B0E');
  wood.addColorStop(1, '#1B0C06');
  ctx.fillStyle = wood;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 224, 178, 0.05)';
  ctx.lineWidth = 2;
  for (let x = 36; x < width; x += 54) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.restore();

  const glow = ctx.createRadialGradient(width / 2, height * 0.48, 40, width / 2, height * 0.48, width * 0.65);
  glow.addColorStop(0, 'rgba(217, 119, 6, 0.16)');
  glow.addColorStop(0.65, 'rgba(42, 20, 10, 0.45)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  const pearlStep = 48;
  for (let x = outerMargin + 40; x < width - outerMargin - 20; x += pearlStep) {
    const isPearl = ((x - outerMargin) / pearlStep) % 2 === 0;
    drawDiamondShape(ctx, x, outerMargin + 14, 11, 9, isPearl ? '#F8FAFC' : '#D97706', '#78350F', 1.3);
    drawDiamondShape(ctx, x, height - outerMargin - 14, 11, 9, isPearl ? '#F8FAFC' : '#D97706', '#78350F', 1.3);
  }
  for (let y = outerMargin + 50; y < height - outerMargin - 30; y += pearlStep) {
    const isPearl = ((y - outerMargin) / pearlStep) % 2 === 0;
    drawDiamondShape(ctx, outerMargin + 14, y, 9, 11, isPearl ? '#E2E8F0' : '#D97706', '#78350F', 1.3);
    drawDiamondShape(ctx, width - outerMargin - 14, y, 9, 11, isPearl ? '#E2E8F0' : '#D97706', '#78350F', 1.3);
  }
  ctx.restore();

  ctx.strokeStyle = '#E5C384';
  ctx.lineWidth = 3.2;
  drawRoundRectPath(ctx, innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, 24);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';
  ctx.lineWidth = 1.4;
  drawRoundRectPath(
    ctx,
    innerMargin + 8,
    innerMargin + 8,
    width - (innerMargin + 8) * 2,
    height - (innerMargin + 8) * 2,
    18
  );
  ctx.stroke();
}

export function drawDamasceneUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const r = isSpacious ? 30 : 19;
  const span = isSpacious ? 240 : 170;

  ctx.strokeStyle = '#E5C384';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r * 2, cy);
  ctx.moveTo(cx + r * 2, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r, r * 0.56, 6, '#F1F5F9', '#D97706', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.5, r * 0.25, 6, '#B45309', '#FFFBEB', 1.4);
  drawDiamondShape(ctx, cx - r * 1.65, cy, 10, 7, '#F8FAFC', '#B45309', 1.2);
  drawDiamondShape(ctx, cx + r * 1.65, cy, 10, 7, '#F8FAFC', '#B45309', 1.2);
  ctx.restore();
}

export function drawDamasceneLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const r = isLarge ? 36 : 22;
  const span = isLarge ? 250 : 175;

  ctx.strokeStyle = '#D6B172';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r - 18, cy);
  ctx.moveTo(cx + r + 18, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawDiamondShape(ctx, cx, cy, r * 1.6, r * 0.85, '#3D1E10', '#E5C384', 2.4);
  drawIslamicStar(ctx, cx, cy, r * 0.72, r * 0.36, 8, '#F8FAFC', '#B45309', 1.5);
  ctx.restore();
}

// ============================================================================
// 16. CAIRO MAMLUK ABLAQQ MARBLE (الرخام المملوكي الأبلق) - LIGHT PROMINENT
// ============================================================================

export function drawMamlukMarbleBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _outerMargin: number,
  innerMargin: number
) {
  const stone = ctx.createLinearGradient(0, 0, width, height);
  stone.addColorStop(0, '#FBF7EE');
  stone.addColorStop(0.5, '#F3E8D3');
  stone.addColorStop(1, '#E9D6B6');
  ctx.fillStyle = stone;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  const courseH = 74;
  for (let y = 0; y < height; y += courseH * 2) {
    ctx.fillStyle = 'rgba(180, 83, 9, 0.13)';
    ctx.fillRect(0, y, width, courseH);
  }
  ctx.restore();

  const panelX = innerMargin + 10;
  const panelY = innerMargin + 14;
  const panelW = width - panelX * 2;
  const panelH = height - panelY * 2;

  ctx.fillStyle = 'rgba(255, 252, 245, 0.88)';
  drawRoundRectPath(ctx, panelX, panelY, panelW, panelH, 28);
  ctx.fill();

  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 4.5;
  ctx.stroke();

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2;
  drawRoundRectPath(ctx, panelX + 10, panelY + 10, panelW - 20, panelH - 20, 22);
  ctx.stroke();

  ctx.save();
  ctx.fillStyle = '#7C2D12';
  const stepW = 180;
  ctx.fillRect(width / 2 - stepW, panelY - 8, stepW * 2, 18);
  ctx.fillStyle = '#D97706';
  ctx.fillRect(width / 2 - stepW * 0.65, panelY + 10, stepW * 1.3, 10);
  ctx.restore();

  [
    [panelX + 34, panelY + 38],
    [panelX + panelW - 34, panelY + 38],
    [panelX + 34, panelY + panelH - 34],
    [panelX + panelW - 34, panelY + panelH - 34],
  ].forEach(([cx, cy]) => {
    drawIslamicStar(ctx, cx, cy, 18, 9, 10, '#7C2D12', '#F59E0B', 1.8);
  });
}

export function drawMamlukMarbleUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const w = isSpacious ? 240 : 170;
  const r = isSpacious ? 28 : 18;

  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - w, cy);
  ctx.lineTo(cx - r * 1.8, cy);
  ctx.moveTo(cx + r * 1.8, cy);
  ctx.lineTo(cx + w, cy);
  ctx.stroke();

  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = '#431407';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 1.35, cy + r * 0.35);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 1.35, cy + r * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawIslamicStar(ctx, cx, cy + r * 0.15, r * 0.45, r * 0.22, 8, '#FFFBEB', '#7C2D12', 1.3);
  ctx.restore();
}

export function drawMamlukMarbleLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const r = isLarge ? 38 : 22;
  const span = isLarge ? 250 : 175;

  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r - 12, cy);
  ctx.moveTo(cx + r + 12, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r, r * 0.54, 10, '#7C2D12', '#F59E0B', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.46, r * 0.22, 10, '#F59E0B', '#FFFBEB', 1.4);
  ctx.restore();
}

// ============================================================================
// 17. JERUSALEM STONE & OLIVE GOLD (حجر القدس وقبة الصخرة) - LIGHT PROMINENT
// ============================================================================

export function drawAqsaStoneBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const limestone = ctx.createLinearGradient(0, 0, width, height);
  limestone.addColorStop(0, '#FDFBF4');
  limestone.addColorStop(0.55, '#F5ECD8');
  limestone.addColorStop(1, '#EADAB7');
  ctx.fillStyle = limestone;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = 'rgba(161, 98, 7, 0.12)';
  ctx.lineWidth = 1.5;
  const rowH = 68;
  for (let y = rowH; y < height; y += rowH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    const offset = (Math.floor(y / rowH) % 2) * 70;
    for (let x = offset; x < width; x += 140) {
      ctx.beginPath();
      ctx.moveTo(x, y - rowH);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
  ctx.restore();

  const sun = ctx.createRadialGradient(width / 2, height * 0.34, 30, width / 2, height * 0.34, width * 0.65);
  sun.addColorStop(0, 'rgba(255, 255, 255, 0.94)');
  sun.addColorStop(0.45, 'rgba(250, 204, 21, 0.18)');
  sun.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, width, height);

  const colW = 24;
  [outerMargin + 12, width - outerMargin - 12 - colW].forEach((cx) => {
    const colGrad = ctx.createLinearGradient(cx, 0, cx + colW, 0);
    colGrad.addColorStop(0, '#A16207');
    colGrad.addColorStop(0.5, '#FDE047');
    colGrad.addColorStop(1, '#854D0E');
    ctx.fillStyle = colGrad;
    drawRoundRectPath(ctx, cx, outerMargin + 30, colW, height - (outerMargin + 30) * 2, 10);
    ctx.fill();
    ctx.strokeStyle = '#3F6212';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  ctx.fillStyle = 'rgba(255, 253, 246, 0.72)';
  drawRoundRectPath(ctx, innerMargin + 10, innerMargin, width - (innerMargin + 10) * 2, height - innerMargin * 2, 28);
  ctx.fill();
  ctx.strokeStyle = '#3F6212';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 1.6;
  drawRoundRectPath(
    ctx,
    innerMargin + 18,
    innerMargin + 8,
    width - (innerMargin + 18) * 2,
    height - (innerMargin + 8) * 2,
    22
  );
  ctx.stroke();
}

export function drawAqsaStoneUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const r = isSpacious ? 44 : 26;
  const baseY = cy + r * 0.45;

  ctx.strokeStyle = '#3F6212';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - r * 4.5, baseY);
  ctx.quadraticCurveTo(cx - r * 2.5, baseY - 22, cx - r * 1.15, baseY);
  ctx.moveTo(cx + r * 4.5, baseY);
  ctx.quadraticCurveTo(cx + r * 2.5, baseY - 22, cx + r * 1.15, baseY);
  ctx.stroke();

  const domeGrad = ctx.createLinearGradient(cx - r, baseY - r, cx + r, baseY);
  domeGrad.addColorStop(0, '#FEF08A');
  domeGrad.addColorStop(0.5, '#EAB308');
  domeGrad.addColorStop(1, '#A16207');
  ctx.fillStyle = domeGrad;
  ctx.strokeStyle = '#713F12';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - r, baseY);
  ctx.bezierCurveTo(cx - r * 1.05, baseY - r * 1.15, cx - r * 0.25, baseY - r * 1.35, cx, baseY - r * 1.45);
  ctx.bezierCurveTo(cx + r * 0.25, baseY - r * 1.35, cx + r * 1.05, baseY - r * 1.15, cx + r, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#3F6212';
  ctx.fillRect(cx - r * 0.92, baseY, r * 1.84, 10);
  drawIslamicStar(ctx, cx, baseY - r * 1.56, isSpacious ? 9 : 6, isSpacious ? 4.5 : 3, 6, '#CA8A04', '#713F12', 1.2);
  ctx.restore();
}

export function drawAqsaStoneLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const r = isLarge ? 36 : 22;
  const span = isLarge ? 250 : 175;

  ctx.strokeStyle = '#3F6212';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r - 14, cy);
  ctx.moveTo(cx + r + 14, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r, r * 0.56, 8, '#CA8A04', '#3F6212', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.48, r * 0.22, 8, '#3F6212', '#FEF08A', 1.4);
  ctx.restore();
}

// ============================================================================
// 18. MADINAH COURTYARD (أروقة المدينة وظلال الحرم) - LIGHT PROMINENT
// ============================================================================

export function drawMadinahCourtyardBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const floor = ctx.createLinearGradient(0, 0, 0, height);
  floor.addColorStop(0, '#ECFDF5');
  floor.addColorStop(0.4, '#FFFFFF');
  floor.addColorStop(1, '#E6F5EC');
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = 'rgba(4, 120, 87, 0.14)';
  ctx.lineWidth = 2.2;
  for (let i = 1; i <= 7; i++) {
    const angle = (i / 8) * (Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * 320, Math.sin(angle) * 320);
    ctx.moveTo(width, 0);
    ctx.lineTo(width - Math.cos(angle) * 320, Math.sin(angle) * 320);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 6;
  drawRoundRectPath(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 34);
  ctx.stroke();

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.2;
  drawRoundRectPath(
    ctx,
    outerMargin + 10,
    outerMargin + 10,
    width - (outerMargin + 10) * 2,
    height - (outerMargin + 10) * 2,
    26
  );
  ctx.stroke();

  [innerMargin, height - innerMargin - 30].forEach((ry) => {
    ctx.fillStyle = 'rgba(4, 120, 87, 0.12)';
    drawRoundRectPath(ctx, innerMargin, ry, width - innerMargin * 2, 30, 15);
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  });

  [innerMargin + 10, width - innerMargin - 10].forEach((sx) => {
    for (let y = height * 0.25; y <= height * 0.75; y += height * 0.25) {
      drawIslamicStar(ctx, sx, y, 16, 8, 8, '#047857', '#F59E0B', 1.8);
    }
  });
}

export function drawMadinahCourtyardUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const w = isSpacious ? 240 : 170;
  const r = isSpacious ? 30 : 19;

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - w, cy + 6);
  ctx.quadraticCurveTo(cx - w * 0.5, cy - 28, cx, cy - r * 1.15);
  ctx.quadraticCurveTo(cx + w * 0.5, cy - 28, cx + w, cy + 6);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy + 2, r, r * 0.5, 8, '#047857', '#FDE68A', 2);
  ctx.restore();
}

export function drawMadinahCourtyardLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const r = isLarge ? 36 : 22;
  const span = isLarge ? 250 : 175;

  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r - 12, cy);
  ctx.moveTo(cx + r + 12, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  ctx.fillStyle = '#065F46';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawIslamicStar(ctx, cx, cy, r * 0.72, r * 0.36, 12, '#F59E0B', '#ECFDF5', 1.4);
  ctx.restore();
}

// ============================================================================
// 19. HAFT-RANGI TURQUOISE & IVORY (القاشاني الفيروزي والعاجي) - LIGHT
// ============================================================================

export function drawIsfahanBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const ivory = ctx.createLinearGradient(0, 0, width, height);
  ivory.addColorStop(0, '#FFFFFF');
  ivory.addColorStop(0.5, '#F4F9FD');
  ivory.addColorStop(1, '#E6F4FA');
  ctx.fillStyle = ivory;
  ctx.fillRect(0, 0, width, height);

  const archW = 210;
  const archH = 220;
  [
    [outerMargin, outerMargin, 1, 1],
    [width - outerMargin, outerMargin, -1, 1],
    [outerMargin, height - outerMargin, 1, -1],
    [width - outerMargin, height - outerMargin, -1, -1],
  ].forEach(([cx, cy, sx, sy]) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sx, sy);
    const spandrel = ctx.createLinearGradient(0, 0, archW, archH);
    spandrel.addColorStop(0, '#0C4A6E');
    spandrel.addColorStop(0.6, '#0284C7');
    spandrel.addColorStop(1, '#38BDF8');
    ctx.fillStyle = spandrel;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(archW, 0);
    ctx.bezierCurveTo(archW * 0.45, archH * 0.15, archW * 0.15, archH * 0.45, 0, archH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.stroke();

    drawIslamicStar(ctx, 42, 42, 20, 9, 8, '#F59E0B', '#FFFFFF', 1.6);
    ctx.restore();
  });

  const stripXLeft = outerMargin + 6;
  const stripXRight = width - outerMargin - 28;
  [stripXLeft, stripXRight].forEach((sx) => {
    ctx.fillStyle = 'rgba(2, 132, 199, 0.14)';
    drawRoundRectPath(ctx, sx, innerMargin + 170, 22, height - (innerMargin + 170) * 2, 11);
    ctx.fill();
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    for (let y = innerMargin + 210; y < height - innerMargin - 190; y += 72) {
      drawDiamondShape(ctx, sx + 11, y, 7, 10, '#F59E0B', '#0C4A6E', 1.2);
    }
  });

  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2.8;
  drawRoundRectPath(ctx, innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, 26);
  ctx.stroke();
}

export function drawIsfahanUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const r = isSpacious ? 34 : 21;
  const span = isSpacious ? 245 : 175;

  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r * 1.9, cy);
  ctx.moveTo(cx + r * 1.9, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawIslamicStar(ctx, cx, cy, r, r * 0.56, 12, '#0284C7', '#F59E0B', 2.2);
  drawIslamicStar(ctx, cx, cy, r * 0.54, r * 0.28, 8, '#F59E0B', '#FFFFFF', 1.4);
  ctx.restore();
}

export function drawIsfahanLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const r = isLarge ? 32 : 20;
  const span = isLarge ? 250 : 175;

  ctx.strokeStyle = '#0C4A6E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.bezierCurveTo(cx - span * 0.55, cy - 20, cx - r * 1.8, cy + 20, cx - r * 1.3, cy);
  ctx.moveTo(cx + span, cy);
  ctx.bezierCurveTo(cx + span * 0.55, cy - 20, cx + r * 1.8, cy + 20, cx + r * 1.3, cy);
  ctx.stroke();

  drawDiamondShape(ctx, cx, cy, r * 1.45, r * 0.85, '#0284C7', '#F59E0B', 2.2);
  drawIslamicStar(ctx, cx, cy, r * 0.52, r * 0.25, 8, '#FFFFFF', '#0C4A6E', 1.4);
  ctx.restore();
}

// ============================================================================
// 20. DESERT SUNRISE OASIS & SADU (واحة الفجر ونسيج السدو) - LIGHT PROMINENT
// ============================================================================

export function drawDesertOasisBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#FFF8F0');
  sky.addColorStop(0.55, '#FDE8CE');
  sky.addColorStop(1, '#F8CFA2');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const sun = ctx.createRadialGradient(width / 2, height * 0.24, 30, width / 2, height * 0.24, width * 0.65);
  sun.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
  sun.addColorStop(0.35, 'rgba(251, 146, 60, 0.22)');
  sun.addColorStop(1, 'rgba(251, 146, 60, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.fillStyle = 'rgba(234, 88, 12, 0.16)';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height - 190);
  ctx.quadraticCurveTo(width * 0.28, height - 260, width * 0.56, height - 175);
  ctx.quadraticCurveTo(width * 0.82, height - 110, width, height - 210);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(154, 52, 18, 0.14)';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height - 110);
  ctx.quadraticCurveTo(width * 0.35, height - 165, width * 0.72, height - 95);
  ctx.quadraticCurveTo(width * 0.9, height - 70, width, height - 125);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const saduLeft = outerMargin + 16;
  const saduRight = width - outerMargin - 16;
  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 3.2;
  drawRoundRectPath(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 34);
  ctx.stroke();

  for (let y = innerMargin + 40; y < height - innerMargin - 30; y += 44) {
    drawDiamondShape(ctx, saduLeft, y, 10, 14, '#C2410C', '#FFF7ED', 1.4);
    drawDiamondShape(ctx, saduRight, y, 10, 14, '#C2410C', '#FFF7ED', 1.4);
  }

  [
    [innerMargin + 10, innerMargin + 10, 1],
    [width - innerMargin - 10, innerMargin + 10, -1],
  ].forEach(([px, py, sx]) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(sx, 1);
    ctx.strokeStyle = 'rgba(124, 45, 18, 0.55)';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(45 + i * 16, 10 + i * 14, 72 + i * 22, 48 + i * 18);
      ctx.stroke();
    }
    ctx.restore();
  });

  ctx.fillStyle = 'rgba(255, 250, 244, 0.62)';
  drawRoundRectPath(
    ctx,
    innerMargin + 14,
    innerMargin + 12,
    width - (innerMargin + 14) * 2,
    height - (innerMargin + 12) * 2,
    24
  );
  ctx.fill();
  ctx.strokeStyle = '#EA580C';
  ctx.lineWidth = 1.8;
  ctx.stroke();
}

export function drawDesertOasisUpperMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isSpacious = availableHeight >= 110;
  const span = isSpacious ? 245 : 175;
  const r = isSpacious ? 30 : 19;

  ctx.strokeStyle = '#C2410C';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy + 4);
  ctx.lineTo(cx - r * 2, cy + 4);
  ctx.moveTo(cx + r * 2, cy + 4);
  ctx.lineTo(cx + span, cy + 4);
  ctx.stroke();

  const sunGrad = ctx.createRadialGradient(cx, cy + 4, 2, cx, cy + 4, r);
  sunGrad.addColorStop(0, '#FFFBEB');
  sunGrad.addColorStop(0.5, '#F97316');
  sunGrad.addColorStop(1, '#9A3412');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(cx, cy + 4, r, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  drawDiamondShape(ctx, cx - r * 1.45, cy + 4, 11, 8, '#EA580C', '#7C2D12', 1.4);
  drawDiamondShape(ctx, cx + r * 1.45, cy + 4, 11, 8, '#EA580C', '#7C2D12', 1.4);
  ctx.restore();
}

export function drawDesertOasisLowerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  availableHeight: number
) {
  ctx.save();
  const isLarge = availableHeight >= 110;
  const span = isLarge ? 250 : 175;
  const r = isLarge ? 32 : 20;

  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - span, cy);
  ctx.lineTo(cx - r * 1.8, cy);
  ctx.moveTo(cx + r * 1.8, cy);
  ctx.lineTo(cx + span, cy);
  ctx.stroke();

  drawDiamondShape(ctx, cx - r * 1.2, cy, r * 0.45, r * 0.35, '#F59E0B', '#7C2D12', 1.4);
  drawDiamondShape(ctx, cx + r * 1.2, cy, r * 0.45, r * 0.35, '#F59E0B', '#7C2D12', 1.4);
  drawDiamondShape(ctx, cx, cy, r * 0.9, r * 0.72, '#C2410C', '#FFF7ED', 2);
  drawIslamicStar(ctx, cx, cy, r * 0.36, r * 0.18, 8, '#FFFBEB', '#7C2D12', 1.2);
  ctx.restore();
}

// ============================================================================
// DISPATCH HELPERS FOR ALL 10 EXTRA DESIGNS
// ============================================================================

export function drawExtraDesignBackdropAndFrame(
  ctx: CanvasRenderingContext2D,
  designId: ShareDesignId,
  width: number,
  height: number,
  outerMargin: number,
  innerMargin: number
): boolean {
  switch (designId) {
    case 'kiswa_calligraphy':
      drawKiswaBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    case 'andalusian_zellige':
      drawAndalusianZelligeBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    case 'ottoman_iznik':
      drawOttomanIznikBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    case 'ramadan_crescent_dome':
      drawRamadanDomeBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    case 'damascene_abjad':
      drawDamasceneBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    case 'mamluk_marble':
      drawMamlukMarbleBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    case 'aqsa_golden_sand':
      drawAqsaStoneBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    case 'madinah_courtyard':
      drawMadinahCourtyardBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    case 'isfahan_turquoise_silk':
      drawIsfahanBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    case 'desert_sunrise_oasis':
      drawDesertOasisBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
      return true;
    default:
      return false;
  }
}

export function drawExtraDesignUpperMotif(
  ctx: CanvasRenderingContext2D,
  designId: ShareDesignId,
  cx: number,
  cy: number,
  availableHeight: number
): boolean {
  switch (designId) {
    case 'kiswa_calligraphy':
      drawKiswaUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'andalusian_zellige':
      drawAndalusianZelligeUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'ottoman_iznik':
      drawOttomanIznikUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'ramadan_crescent_dome':
      drawRamadanDomeUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'damascene_abjad':
      drawDamasceneUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'mamluk_marble':
      drawMamlukMarbleUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'aqsa_golden_sand':
      drawAqsaStoneUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'madinah_courtyard':
      drawMadinahCourtyardUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'isfahan_turquoise_silk':
      drawIsfahanUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'desert_sunrise_oasis':
      drawDesertOasisUpperMotif(ctx, cx, cy, availableHeight);
      return true;
    default:
      return false;
  }
}

export function drawExtraDesignLowerMotif(
  ctx: CanvasRenderingContext2D,
  designId: ShareDesignId,
  cx: number,
  cy: number,
  availableHeight: number
): boolean {
  switch (designId) {
    case 'kiswa_calligraphy':
      drawKiswaLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'andalusian_zellige':
      drawAndalusianZelligeLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'ottoman_iznik':
      drawOttomanIznikLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'ramadan_crescent_dome':
      drawRamadanDomeLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'damascene_abjad':
      drawDamasceneLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'mamluk_marble':
      drawMamlukMarbleLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'aqsa_golden_sand':
      drawAqsaStoneLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'madinah_courtyard':
      drawMadinahCourtyardLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'isfahan_turquoise_silk':
      drawIsfahanLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    case 'desert_sunrise_oasis':
      drawDesertOasisLowerMotif(ctx, cx, cy, availableHeight);
      return true;
    default:
      return false;
  }
}
