export interface AchievementCardPalette {
  bgGradient: string;
  sanctuaryBg: string;
  archBg: string;
  goldAccent: string;
  activeChipText: string;
  primaryText: string;
  bodyText: string;
  softTintText: string;
  mutedText: string;
  sunnahActiveText: string;
  sunnahInactiveText: string;
  progressStroke: string;
  ringTrackStroke: string;
  patternColor: string;
  patternOpacity: number;
  frameBorder: string;
  innerFrameBorder: string;
  panelBg: string;
  tileBg: string;
  activeTileBg: string;
  emptyTileBg: string;
  emptyTileBorder: string;
  medallionBg: string;
  medallionText: string;
  medallionShadow: string;
  ringWellBg: string;
  ringWellShadow: string;
  outerShadow: string;
  panelShadow: string;
  tileShadow: string;
}

export interface AchievementCardRenderData {
  viewRange: 'today' | 'weekly' | 'monthly';
  palette: AchievementCardPalette;
  isDarkSurface: boolean;
  periodMeta: {
    cardSubtitle: string;
    dateRangeStr: string;
    ringSubtitle: string;
    trackerTitle: string;
  };
  stats: {
    averageProgress: number;
    prayersCount: number;
    quranPages: number;
    adhkarCount: number;
    goodDeedsTotal: number;
    fardDone: number;
    sunnahDone: number;
    activeDaysCount: number;
    totalDays: number;
    daysWith100: number;
    medal: {
      title: string;
      badge: string;
      desc: string;
    };
    dailyPrayersList: {
      id: string;
      label: string;
      fard: boolean;
      sunnah: boolean;
    }[];
    dailyAdhkarChips: {
      label: string;
      done: boolean;
    }[];
    daysStats: {
      dayNum: number;
      dayName: string;
      progress: number;
    }[];
  };
}

type CornerRadii = number | [number, number, number, number];

function normalizeRadii(r: CornerRadii, w: number, h: number): [number, number, number, number] {
  const maxR = Math.min(w, h) / 2;
  if (typeof r === 'number') {
    const cr = Math.min(r, maxR);
    return [cr, cr, cr, cr];
  }
  return [
    Math.min(r[0], maxR),
    Math.min(r[1], maxR),
    Math.min(r[2], maxR),
    Math.min(r[3], maxR),
  ];
}

function addRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii
) {
  const [tl, tr, br, bl] = normalizeRadii(radii, w, h);
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  if (tr > 0) ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  else ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - br);
  if (br > 0) ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  else ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + bl, y + h);
  if (bl > 0) ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  else ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + tl);
  if (tl > 0) ctx.quadraticCurveTo(x, y, x + tl, y);
  else ctx.lineTo(x, y);
  ctx.closePath();
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii
) {
  ctx.beginPath();
  addRoundedRectPath(ctx, x, y, w, h, radii);
}

function splitTopLevelCommas(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function resolveCssFill(
  ctx: CanvasRenderingContext2D,
  cssValue: string,
  x: number,
  y: number,
  w: number,
  h: number
): string | CanvasGradient {
  const trimmed = (cssValue || '').trim();
  if (!trimmed.startsWith('linear-gradient(')) {
    return trimmed;
  }

  const inner = trimmed.slice('linear-gradient('.length, -1);
  const parts = splitTopLevelCommas(inner);
  if (parts.length < 2) return trimmed;

  let angleDeg = 180;
  let stopStartIdx = 0;
  const first = parts[0].trim();
  const degMatch = first.match(/^(-?\d+(?:\.\d+)?)deg$/i);
  if (degMatch) {
    angleDeg = parseFloat(degMatch[1]);
    stopStartIdx = 1;
  }

  // CSS linear-gradient angle: 0deg = up (0,-1), 90deg = right (1,0), 180deg = down (0,1)
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const halfLen = (Math.abs(dx * w) + Math.abs(dy * h)) / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const grad = ctx.createLinearGradient(
    cx - dx * halfLen,
    cy - dy * halfLen,
    cx + dx * halfLen,
    cy + dy * halfLen
  );

  const stops = parts.slice(stopStartIdx);
  stops.forEach((stop, idx) => {
    const m = stop.match(/^(.+?)\s+(\d+(?:\.\d+)?)%$/);
    if (m) {
      const color = m[1].trim();
      const offset = Math.max(0, Math.min(1, parseFloat(m[2]) / 100));
      grad.addColorStop(offset, color);
    } else {
      const offset = stops.length === 1 ? 0 : idx / (stops.length - 1);
      grad.addColorStop(offset, stop.trim());
    }
  });

  return grad;
}

interface ParsedBoxShadow {
  inset: boolean;
  ox: number;
  oy: number;
  blur: number;
  color: string;
}

function parseCssBoxShadows(shadowStr: string): ParsedBoxShadow[] {
  if (!shadowStr) return [];
  const items = splitTopLevelCommas(shadowStr);
  const parsed: ParsedBoxShadow[] = [];

  for (const raw of items) {
    let s = raw.trim();
    if (!s) continue;
    let inset = false;
    if (/^inset\b/i.test(s)) {
      inset = true;
      s = s.replace(/^inset\b\s*/i, '');
    }

    const colorMatch = s.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})\s*$/);
    if (!colorMatch) continue;
    const color = colorMatch[1];
    const dimsStr = s.slice(0, colorMatch.index).trim();
    const nums = dimsStr
      .split(/\s+/)
      .map((token) => parseFloat(token))
      .filter((n) => !Number.isNaN(n));

    const ox = nums[0] || 0;
    const oy = nums[1] || 0;
    const blur = nums[2] || 0;
    parsed.push({ inset, ox, oy, blur, color });
  }

  return parsed;
}

function drawStyledBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii,
  options: {
    background?: string;
    borderColor?: string;
    borderWidth?: number;
    boxShadow?: string;
    drawContentBehindBorder?: () => void;
  }
) {
  const shadows = options.boxShadow ? parseCssBoxShadows(options.boxShadow) : [];
  const outerShadows = shadows.filter((s) => !s.inset);
  const insetShadows = shadows.filter((s) => s.inset);

  // 1. Render outer drop shadows strictly OUTSIDE the box (evenodd clip prevents bleeding under translucent fills)
  if (outerShadows.length > 0) {
    // Draw furthest/softest first (reverse CSS list order)
    for (let i = outerShadows.length - 1; i >= 0; i--) {
      const sh = outerShadows[i];
      ctx.save();
      const pad = Math.max(80, Math.abs(sh.ox) + Math.abs(sh.oy) + sh.blur * 2 + 24);
      ctx.beginPath();
      ctx.rect(x - pad, y - pad, w + pad * 2, h + pad * 2);
      addRoundedRectPath(ctx, x, y, w, h, radii);
      ctx.clip('evenodd');

      if (sh.blur === 0) {
        roundedRectPath(ctx, x + sh.ox, y + sh.oy, w, h, radii);
        ctx.fillStyle = sh.color;
        ctx.fill();
      } else {
        // Offset shape far away? No, draw at box position with shadowColor; interior is clipped out by evenodd!
        ctx.shadowColor = sh.color;
        ctx.shadowOffsetX = sh.ox;
        ctx.shadowOffsetY = sh.oy;
        ctx.shadowBlur = sh.blur;
        ctx.fillStyle = '#000000';
        roundedRectPath(ctx, x, y, w, h, radii);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // 2. Fill box background
  if (options.background) {
    ctx.save();
    roundedRectPath(ctx, x, y, w, h, radii);
    ctx.fillStyle = resolveCssFill(ctx, options.background, x, y, w, h);
    ctx.fill();
    ctx.restore();
  }

  // Optional clipped interior content (e.g., lattice pattern)
  if (options.drawContentBehindBorder) {
    ctx.save();
    roundedRectPath(ctx, x, y, w, h, radii);
    ctx.clip();
    options.drawContentBehindBorder();
    ctx.restore();
  }

  // 3. Render subtle inset specular top highlight & bottom shade inside clip
  if (insetShadows.length > 0) {
    ctx.save();
    roundedRectPath(ctx, x, y, w, h, radii);
    ctx.clip();

    for (const sh of insetShadows) {
      if (sh.oy > 0) {
        // Top inner specular edge highlight
        const hlGrad = ctx.createLinearGradient(0, y, 0, y + Math.max(4, sh.oy + sh.blur + 1));
        hlGrad.addColorStop(0, sh.color);
        hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hlGrad;
        ctx.fillRect(x, y, w, Math.max(4, sh.oy + sh.blur + 1));
      } else if (sh.oy < 0) {
        // Bottom inner shade
        const shH = Math.max(6, Math.abs(sh.oy) + sh.blur + 2);
        const shGrad = ctx.createLinearGradient(0, y + h - shH, 0, y + h);
        shGrad.addColorStop(0, 'rgba(0,0,0,0)');
        shGrad.addColorStop(1, sh.color);
        ctx.fillStyle = shGrad;
        ctx.fillRect(x, y + h - shH, w, shH);
      }
    }
    ctx.restore();
  }

  // 4. Crisp border stroke
  if (options.borderColor && (options.borderWidth || 0) > 0) {
    ctx.save();
    const bw = options.borderWidth!;
    roundedRectPath(ctx, x + bw / 2, y + bw / 2, w - bw, h - bw, radii);
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = bw;
    ctx.stroke();
    ctx.restore();
  }
}

function drawIslamicLatticePattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  strokeColor: string,
  opacity: number
) {
  const tileSize = 64;
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = tileSize * 2;
  tileCanvas.height = tileSize * 2;
  const tCtx = tileCanvas.getContext('2d');
  if (!tCtx) return;

  tCtx.scale((tileSize * 2) / 80, (tileSize * 2) / 80);
  tCtx.strokeStyle = strokeColor;
  tCtx.lineWidth = 1;
  tCtx.lineJoin = 'round';

  const starPts: [number, number][] = [
    [40, 6], [49, 21], [66, 14], [59, 31],
    [74, 40], [59, 49], [66, 66], [49, 59],
    [40, 74], [31, 59], [14, 66], [21, 49],
    [6, 40], [21, 31], [14, 14], [31, 21],
  ];

  tCtx.save();
  tCtx.globalAlpha = 0.45;
  tCtx.beginPath();
  starPts.forEach(([px, py], i) => {
    if (i === 0) tCtx.moveTo(px, py);
    else tCtx.lineTo(px, py);
  });
  tCtx.closePath();
  tCtx.stroke();
  tCtx.restore();

  tCtx.save();
  tCtx.globalAlpha = 0.35;
  tCtx.beginPath();
  tCtx.arc(40, 40, 10, 0, Math.PI * 2);
  tCtx.stroke();
  tCtx.restore();

  tCtx.save();
  tCtx.globalAlpha = 0.28;
  tCtx.beginPath();
  tCtx.moveTo(0, 0); tCtx.lineTo(14, 14);
  tCtx.moveTo(80, 0); tCtx.lineTo(66, 14);
  tCtx.moveTo(0, 80); tCtx.lineTo(14, 66);
  tCtx.moveTo(80, 80); tCtx.lineTo(66, 66);
  tCtx.stroke();
  tCtx.restore();

  const pattern = ctx.createPattern(tileCanvas, 'repeat');
  if (!pattern) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  const scaleFactor = 0.5;
  ctx.scale(scaleFactor, scaleFactor);
  ctx.fillStyle = pattern;
  ctx.fillRect(x / scaleFactor, y / scaleFactor, w / scaleFactor, h / scaleFactor);
  ctx.restore();
}

function drawCrescentStarMedallionIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;

  const star = new Path2D('M12 2l2.2 4.8L19 7l-3.4 3.6L16.5 16 12 13.4 7.5 16l.9-5.4L5 7l4.8-.2L12 2z');
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fill(star);
  ctx.restore();

  const crescent = new Path2D('M14.5 3.5A8.5 8.5 0 1 0 20.5 15.8 7 7 0 0 1 14.5 3.5z');
  ctx.fill(crescent);
  ctx.restore();
}

function drawLucideIcon(
  ctx: CanvasRenderingContext2D,
  type: 'clock' | 'book' | 'heart' | 'star',
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'clock') {
    ctx.beginPath();
    ctx.arc(12, 12, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.lineTo(12, 12);
    ctx.lineTo(16, 14);
    ctx.stroke();
  } else if (type === 'book') {
    ctx.stroke(new Path2D('M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z'));
    ctx.stroke(new Path2D('M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'));
  } else if (type === 'heart') {
    ctx.stroke(new Path2D('M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'));
  } else if (type === 'star') {
    ctx.stroke(new Path2D('M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'));
  }
  ctx.restore();
}

function wrapRtlLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = (text || '').trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

interface InlineRun {
  text: string;
  font: string;
  color: string;
}

function drawRtlInlineRuns(
  ctx: CanvasRenderingContext2D,
  runs: InlineRun[],
  rightX: number,
  y: number
) {
  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  let curX = rightX;
  for (const run of runs) {
    ctx.font = run.font;
    ctx.fillStyle = run.color;
    ctx.fillText(run.text, curX, y);
    curX -= ctx.measureText(run.text).width;
  }
  ctx.restore();
}

export async function renderAchievementCardToDataUrl(
  data: AchievementCardRenderData,
  preferredCardWidth?: number
): Promise<string> {
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 1800)),
    ]);
  } catch {}

  const { viewRange, palette, isDarkSurface, periodMeta, stats } = data;

  const SCALE = 3;
  const CARD_W = Math.max(360, Math.min(410, Math.round(preferredCardWidth || 380)));
  const MARGIN_X = 14;
  const MARGIN_TOP = 14;
  const MARGIN_BOTTOM = 26;

  const OUTER_PAD = 14;
  const INNER_PAD = 14;
  const SECTION_GAP = 12;

  const innerFrameW = CARD_W - OUTER_PAD * 2;
  const contentW = innerFrameW - INNER_PAD * 2;

  const uiFont = `'Cairo', sans-serif`;
  const amiriFont = `'Amiri', serif`;

  // Measurement scratch canvas
  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d')!;

  // 1) Measure Arch Header height
  const archTopPad = 12;
  const medallionSize = 40;
  const medallionMb = 6;
  const titleH = 22;
  const subH = 16;
  const divH = 16;
  mCtx.font = `500 11px ${uiFont}`;
  const dateLines = wrapRtlLines(mCtx, periodMeta.dateRangeStr, contentW - 24);
  const dateH = Math.max(1, dateLines.length) * 16;
  const archH = archTopPad + medallionSize + medallionMb + titleH + 2 + subH + divH + dateH + 12;

  // 2) Measure Hero Panel height
  const heroPad = 13;
  const gaugeSize = 72;
  const heroGap = 12;
  const heroTextW = contentW - heroPad * 2 - gaugeSize - heroGap;

  mCtx.font = `900 14px ${uiFont}`;
  const medalTitleFull = `${stats.medal.title} ${stats.medal.badge}`;
  const medalTitleLines = wrapRtlLines(mCtx, medalTitleFull, heroTextW);
  const medalTitleH = Math.max(1, medalTitleLines.length) * 19;

  mCtx.font = `500 10.5px ${uiFont}`;
  const medalDescLines = wrapRtlLines(mCtx, stats.medal.desc, heroTextW);
  const medalDescH = Math.max(1, medalDescLines.length) * 16.5;

  const heroSubLineH = 16;
  const heroTextBlockH = medalTitleH + 4 + medalDescH + 6 + heroSubLineH;
  const heroH = Math.max(gaugeSize, heroTextBlockH) + heroPad * 2;

  // 3) Stat Grid (2x2)
  const statGap = 10;
  const statTileW = (contentW - statGap) / 2;
  const statTileH = 62;
  const statGridH = statTileH * 2 + statGap;

  // 4) Detailed Breakdown Panel
  const breakPad = 12;
  const breakHeaderH = 18;
  let breakBodyH = 0;

  let chipRows: { label: string; done: boolean; width: number }[][] = [];
  if (viewRange === 'today') {
    const prayerCardH = 58;
    mCtx.font = `700 9.5px ${uiFont}`;
    const chipObjs = stats.dailyAdhkarChips.map((c) => {
      const txt = `${c.done ? '✓ ' : ''}${c.label}`;
      const w = mCtx.measureText(txt).width + 18;
      return { ...c, width: w };
    });
    const maxChipsRowW = contentW - breakPad * 2;
    let currentRow: typeof chipObjs = [];
    let currentRowW = 0;
    const chipGap = 6;
    for (const chip of chipObjs) {
      const needed = currentRow.length === 0 ? chip.width : currentRowW + chipGap + chip.width;
      if (needed > maxChipsRowW && currentRow.length > 0) {
        chipRows.push(currentRow);
        currentRow = [chip];
        currentRowW = chip.width;
      } else {
        currentRow.push(chip);
        currentRowW = needed;
      }
    }
    if (currentRow.length > 0) chipRows.push(currentRow);
    const chipH = 21;
    const chipsTotalH = chipRows.length * chipH + Math.max(0, chipRows.length - 1) * 6;
    breakBodyH = prayerCardH + 10 + chipsTotalH;
  } else if (viewRange === 'weekly') {
    const cols = 4;
    const rows = Math.ceil(stats.daysStats.length / cols);
    const dayH = 62;
    breakBodyH = rows * dayH + Math.max(0, rows - 1) * 6;
  } else {
    const cols = 7;
    const rows = Math.ceil(stats.daysStats.length / cols);
    const cellH = 30;
    breakBodyH = rows * cellH + Math.max(0, rows - 1) * 4;
  }
  const breakPanelH = breakPad * 2 + breakHeaderH + 8 + breakBodyH;

  // 5) Footer
  const footerH = 44;

  const innerFrameH =
    INNER_PAD * 2 +
    archH +
    SECTION_GAP +
    heroH +
    SECTION_GAP +
    statGridH +
    SECTION_GAP +
    breakPanelH +
    SECTION_GAP +
    footerH;

  const CARD_H = OUTER_PAD * 2 + innerFrameH;
  const TOTAL_W = CARD_W + MARGIN_X * 2;
  const TOTAL_H = CARD_H + MARGIN_TOP + MARGIN_BOTTOM;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(TOTAL_W * SCALE);
  canvas.height = Math.round(TOTAL_H * SCALE);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(SCALE, SCALE);

  // Outer modal surface background (matches surrounding modal surface in preview)
  ctx.fillStyle = isDarkSurface ? '#0A0A0D' : '#FFFFFF';
  ctx.fillRect(0, 0, TOTAL_W, TOTAL_H);

  const cardX = MARGIN_X;
  const cardY = MARGIN_TOP;

  // --- OUTER 3D SCULPTED CARD ---
  drawStyledBox(ctx, cardX, cardY, CARD_W, CARD_H, 24, {
    background: palette.bgGradient,
    borderColor: palette.frameBorder,
    borderWidth: 2,
    boxShadow: palette.outerShadow,
    drawContentBehindBorder: () => {
      drawIslamicLatticePattern(
        ctx,
        cardX,
        cardY,
        CARD_W,
        CARD_H,
        palette.patternColor,
        palette.patternOpacity
      );
    },
  });

  // --- INNER SANCTUARY FRAME ---
  const innerX = cardX + OUTER_PAD;
  const innerY = cardY + OUTER_PAD;
  drawStyledBox(ctx, innerX, innerY, innerFrameW, innerFrameH, 16, {
    background: palette.sanctuaryBg,
    borderColor: palette.innerFrameBorder,
    borderWidth: 1.5,
  });

  const cx = innerX + INNER_PAD;
  let curY = innerY + INNER_PAD;

  // --- 1. ORNATE ISLAMIC ARCH CREST HEADER ---
  drawStyledBox(ctx, cx, curY, contentW, archH, [72, 72, 18, 18], {
    background: palette.archBg,
    borderColor: palette.innerFrameBorder,
    borderWidth: 1.5,
    boxShadow: palette.panelShadow,
  });

  // 3D Medallion circle
  const medX = cx + contentW / 2 - medallionSize / 2;
  const medY = curY + archTopPad;
  drawStyledBox(ctx, medX, medY, medallionSize, medallionSize, medallionSize / 2, {
    background: palette.medallionBg,
    boxShadow: palette.medallionShadow,
  });
  drawCrescentStarMedallionIcon(
    ctx,
    medX + medallionSize / 2,
    medY + medallionSize / 2,
    20,
    palette.medallionText
  );

  // Title: مربّي العبادات
  let archTextY = medY + medallionSize + medallionMb + 11;
  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 17px ${uiFont}`;
  ctx.fillStyle = palette.primaryText;
  ctx.fillText('مربّي العبادات', cx + contentW / 2, archTextY);

  // Subtitle
  archTextY += 18;
  ctx.font = `700 11px ${uiFont}`;
  ctx.fillStyle = palette.goldAccent;
  ctx.fillText(`${periodMeta.cardSubtitle} • مصحف أحمد و ليلى`, cx + contentW / 2, archTextY);

  // Ornamental divider
  archTextY += 15;
  ctx.font = `600 12px ${uiFont}`;
  ctx.fillStyle = palette.goldAccent;
  ctx.fillText('۞', cx + contentW / 2, archTextY);

  ctx.fillStyle = palette.innerFrameBorder;
  ctx.fillRect(cx + contentW / 2 - 14 - 48, archTextY - 0.5, 48, 1);
  ctx.fillRect(cx + contentW / 2 + 14, archTextY - 0.5, 48, 1);

  // Date range string
  archTextY += 15;
  ctx.font = `500 11px ${uiFont}`;
  ctx.fillStyle = palette.softTintText;
  dateLines.forEach((line, idx) => {
    ctx.fillText(line, cx + contentW / 2, archTextY + idx * 16);
  });
  ctx.restore();

  curY += archH + SECTION_GAP;

  // --- 2. HERO MEDAL & 3D CIRCULAR GAUGE PANEL ---
  drawStyledBox(ctx, cx, curY, contentW, heroH, 16, {
    background: palette.panelBg,
    borderColor: palette.frameBorder,
    borderWidth: 1.5,
    boxShadow: palette.panelShadow,
  });

  // Left side in RTL: Circular Gauge
  const gaugeX = cx + heroPad;
  const gaugeY = curY + (heroH - gaugeSize) / 2;
  drawStyledBox(ctx, gaugeX, gaugeY, gaugeSize, gaugeSize, gaugeSize / 2, {
    background: palette.ringWellBg,
    borderColor: palette.frameBorder,
    borderWidth: 2,
    boxShadow: palette.ringWellShadow,
  });

  const gCx = gaugeX + gaugeSize / 2;
  const gCy = gaugeY + gaugeSize / 2;
  const ringScale = 62 / 64;
  const ringR = 26 * ringScale;
  const ringStroke = 5.5 * ringScale;

  // Track ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(gCx, gCy, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = palette.ringTrackStroke;
  ctx.lineWidth = ringStroke;
  ctx.stroke();

  // Active arc
  if (stats.averageProgress > 0) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.min(100, stats.averageProgress) / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(gCx, gCy, ringR, startAngle, endAngle);
    ctx.strokeStyle = palette.progressStroke;
    ctx.lineWidth = ringStroke;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Gauge percentage & subtitle
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 15.5px sans-serif`;
  ctx.fillStyle = palette.primaryText;
  ctx.fillText(`${stats.averageProgress}%`, gCx, gCy - 4.5);

  ctx.direction = 'rtl';
  ctx.font = `700 8.5px ${uiFont}`;
  ctx.fillStyle = palette.goldAccent;
  ctx.fillText(periodMeta.ringSubtitle, gCx, gCy + 9.5);
  ctx.restore();

  // Right side in RTL: Medal title, desc, stats line
  const textRightX = cx + contentW - heroPad;
  let heroTY = curY + (heroH - heroTextBlockH) / 2 + 9;
  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  ctx.font = `900 14px ${uiFont}`;
  ctx.fillStyle = palette.goldAccent;
  medalTitleLines.forEach((line, idx) => {
    ctx.fillText(line, textRightX, heroTY + idx * 19);
  });
  heroTY += medalTitleH + 4;

  ctx.font = `500 10.5px ${uiFont}`;
  ctx.fillStyle = palette.bodyText;
  medalDescLines.forEach((line, idx) => {
    ctx.fillText(line, textRightX, heroTY + idx * 16.5);
  });
  heroTY += medalDescH + 6;
  ctx.restore();

  const regularRunFont = `700 10.5px ${uiFont}`;
  const boldRunFont = `800 10.5px ${uiFont}`;
  const heroRuns: InlineRun[] =
    viewRange === 'today'
      ? [
          { text: 'الفرائض: ', font: regularRunFont, color: palette.softTintText },
          { text: `${stats.fardDone} من 5`, font: boldRunFont, color: palette.primaryText },
          { text: '  •  ', font: regularRunFont, color: palette.softTintText },
          { text: 'السنن: ', font: regularRunFont, color: palette.softTintText },
          { text: `${stats.sunnahDone} من 5`, font: boldRunFont, color: palette.primaryText },
        ]
      : [
          { text: 'أيام النشاط: ', font: regularRunFont, color: palette.softTintText },
          { text: `${stats.activeDaysCount} من ${stats.totalDays}`, font: boldRunFont, color: palette.primaryText },
          { text: '  •  ', font: regularRunFont, color: palette.softTintText },
          { text: 'الإتمام الكامل: ', font: regularRunFont, color: palette.softTintText },
          { text: `${stats.daysWith100}`, font: boldRunFont, color: palette.primaryText },
        ];
  drawRtlInlineRuns(ctx, heroRuns, textRightX, heroTY);

  curY += heroH + SECTION_GAP;

  // --- 3. 4 3D SCULPTED STATS GRID (RTL: col 0 is right, col 1 is left) ---
  const statTiles: {
    icon: 'clock' | 'book' | 'heart' | 'star';
    label: string;
    value: string;
    unit: string;
  }[] = [
    { icon: 'clock', label: 'الصلوات والسنن', value: `${stats.prayersCount}`, unit: 'صلاة وسنة' },
    { icon: 'book', label: 'الورد القرآني', value: `${stats.quranPages}`, unit: 'صفحة مقروءة' },
    {
      icon: 'heart',
      label: 'الأذكار والأوراد',
      value: `${stats.adhkarCount}`,
      unit: viewRange === 'today' ? 'من 5 أوراد' : 'ورد منجز',
    },
    { icon: 'star', label: 'البر والعادات', value: `${stats.goodDeedsTotal}`, unit: 'طاعة' },
  ];

  statTiles.forEach((tile, idx) => {
    const row = Math.floor(idx / 2);
    const colRtl = idx % 2; // 0 = right column, 1 = left column
    const tx = colRtl === 0 ? cx + statTileW + statGap : cx;
    const ty = curY + row * (statTileH + statGap);

    drawStyledBox(ctx, tx, ty, statTileW, statTileH, 12, {
      background: palette.tileBg,
      borderColor: palette.innerFrameBorder,
      borderWidth: 1,
      boxShadow: palette.tileShadow,
    });

    const tRightX = tx + statTileW - 11;
    const labelY = ty + 18;
    drawLucideIcon(ctx, tile.icon, tRightX - 7, labelY, 13.5, palette.goldAccent);

    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `700 11px ${uiFont}`;
    ctx.fillStyle = palette.goldAccent;
    ctx.fillText(tile.label, tRightX - 18, labelY);
    ctx.restore();

    drawRtlInlineRuns(
      ctx,
      [
        { text: `${tile.value} `, font: `900 17px ${uiFont}`, color: palette.primaryText },
        { text: tile.unit, font: `500 11px ${uiFont}`, color: palette.softTintText },
      ],
      tRightX,
      ty + 43
    );
  });

  curY += statGridH + SECTION_GAP;

  // --- 4. TAB-SPECIFIC DETAILED BREAKDOWN PANEL ---
  drawStyledBox(ctx, cx, curY, contentW, breakPanelH, 16, {
    background: palette.panelBg,
    borderColor: palette.innerFrameBorder,
    borderWidth: 1,
    boxShadow: palette.panelShadow,
  });

  const bRightX = cx + contentW - breakPad;
  const bHeaderY = curY + breakPad + 8;
  drawRtlInlineRuns(
    ctx,
    [
      { text: '۞  ', font: `800 11px ${uiFont}`, color: palette.goldAccent },
      { text: periodMeta.trackerTitle, font: `800 11px ${uiFont}`, color: palette.goldAccent },
    ],
    bRightX,
    bHeaderY
  );

  const bInnerW = contentW - breakPad * 2;
  let bCurY = curY + breakPad + breakHeaderH + 8;

  if (viewRange === 'today') {
    const pGap = 6;
    const pW = (bInnerW - pGap * 4) / 5;
    const pH = 58;

    // RTL order: index 0 (الفجر) on far right -> index 4 (العشاء) on far left
    stats.dailyPrayersList.forEach((p, idx) => {
      const px = cx + breakPad + (4 - idx) * (pW + pGap);
      drawStyledBox(ctx, px, bCurY, pW, pH, 12, {
        background: p.fard ? palette.activeTileBg : palette.tileBg,
        borderColor: p.fard ? palette.goldAccent : palette.innerFrameBorder,
        borderWidth: 1,
        boxShadow: palette.tileShadow,
      });

      ctx.save();
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const pCx = px + pW / 2;

      ctx.font = `800 10.5px ${uiFont}`;
      ctx.fillStyle = palette.primaryText;
      ctx.fillText(p.label, pCx, bCurY + 14);

      ctx.font = `700 9px ${uiFont}`;
      ctx.fillStyle = p.fard ? palette.goldAccent : palette.mutedText;
      ctx.fillText(p.fard ? 'فرض ✓' : 'فرض —', pCx, bCurY + 31);

      ctx.font = `700 8.8px ${uiFont}`;
      ctx.fillStyle = p.sunnah ? palette.sunnahActiveText : palette.sunnahInactiveText;
      ctx.fillText(p.sunnah ? 'سنة ★' : 'سنة —', pCx, bCurY + 45.5);
      ctx.restore();
    });

    bCurY += pH + 10;

    // Wrapped Adhkar chips (centered, RTL right-to-left)
    const chipH = 21;
    const chipGap = 6;
    chipRows.forEach((row) => {
      const rowTotalW = row.reduce((acc, c) => acc + c.width, 0) + (row.length - 1) * chipGap;
      // In RTL flex-wrap justify-center, first item sits on the right side of the centered row
      let chipRightX = cx + contentW / 2 + rowTotalW / 2;

      row.forEach((chip) => {
        const chipX = chipRightX - chip.width;
        drawStyledBox(ctx, chipX, bCurY, chip.width, chipH, 999, {
          background: chip.done ? palette.activeTileBg : palette.emptyTileBg,
          borderColor: chip.done ? palette.goldAccent : palette.emptyTileBorder,
          borderWidth: 1,
          boxShadow: palette.tileShadow,
        });

        ctx.save();
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 9.5px ${uiFont}`;
        ctx.fillStyle = chip.done ? palette.activeChipText : palette.mutedText;
        ctx.fillText(`${chip.done ? '✓ ' : ''}${chip.label}`, chipX + chip.width / 2, bCurY + chipH / 2 + 0.5);
        ctx.restore();

        chipRightX = chipX - chipGap;
      });

      bCurY += chipH + 6;
    });
  } else if (viewRange === 'weekly') {
    const cols = 4;
    const dGap = 6;
    const dW = (bInnerW - dGap * (cols - 1)) / cols;
    const dH = 62;

    stats.daysStats.forEach((d, idx) => {
      const row = Math.floor(idx / cols);
      const colRtl = idx % cols;
      const dx = cx + breakPad + (cols - 1 - colRtl) * (dW + dGap);
      const dy = bCurY + row * (dH + dGap);

      drawStyledBox(ctx, dx, dy, dW, dH, 12, {
        background: d.progress >= 80 ? palette.activeTileBg : palette.tileBg,
        borderColor:
          d.progress === 100
            ? palette.goldAccent
            : d.progress >= 50
              ? palette.frameBorder
              : palette.innerFrameBorder,
        borderWidth: 1,
        boxShadow: palette.tileShadow,
      });

      ctx.save();
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const dCx = dx + dW / 2;

      ctx.font = `700 9.5px ${uiFont}`;
      ctx.fillStyle = palette.primaryText;
      ctx.fillText(d.dayName, dCx, dy + 13);

      ctx.globalAlpha = 0.85;
      ctx.font = `600 8.5px sans-serif`;
      ctx.fillStyle = palette.softTintText;
      ctx.fillText(`${d.dayNum}`, dCx, dy + 26);
      ctx.globalAlpha = 1;

      ctx.font = `900 11px sans-serif`;
      ctx.fillStyle = d.progress >= 80 ? palette.goldAccent : palette.primaryText;
      ctx.fillText(`${d.progress}%`, dCx, dy + 39);

      ctx.font = `700 9.5px ${uiFont}`;
      ctx.fillStyle = palette.primaryText;
      ctx.fillText(d.progress === 100 ? '⭐' : d.progress >= 50 ? '✓' : '•', dCx, dy + 52);
      ctx.restore();
    });
  } else {
    const cols = 7;
    const mGap = 4;
    const mW = (bInnerW - mGap * (cols - 1)) / cols;
    const mH = 30;

    stats.daysStats.forEach((d, idx) => {
      const row = Math.floor(idx / cols);
      const colRtl = idx % cols;
      const mx = cx + breakPad + (cols - 1 - colRtl) * (mW + mGap);
      const my = bCurY + row * (mH + mGap);

      drawStyledBox(ctx, mx, my, mW, mH, 8, {
        background:
          d.progress >= 80
            ? palette.activeTileBg
            : d.progress > 0
              ? palette.tileBg
              : palette.emptyTileBg,
        borderColor:
          d.progress === 100
            ? palette.goldAccent
            : d.progress > 0
              ? palette.frameBorder
              : palette.emptyTileBorder,
        borderWidth: 1,
        boxShadow: palette.tileShadow,
      });

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const mCx = mx + mW / 2;

      ctx.font = `700 9px sans-serif`;
      ctx.fillStyle = palette.mutedText;
      ctx.fillText(`${d.dayNum}`, mCx, my + 10);

      ctx.font = `900 8.5px sans-serif`;
      ctx.fillStyle = d.progress >= 80 ? palette.goldAccent : palette.primaryText;
      ctx.fillText(`${d.progress}%`, mCx, my + 21);
      ctx.restore();
    });
  }

  curY += breakPanelH + SECTION_GAP;

  // --- 5. HADITH & DEDICATION FOOTER ---
  ctx.save();
  ctx.fillStyle = palette.innerFrameBorder;
  ctx.fillRect(cx, curY, contentW, 1);

  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `700 12.5px ${amiriFont}`;
  ctx.fillStyle = palette.goldAccent;
  ctx.fillText('«أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»', cx + contentW / 2, curY + 17);

  ctx.font = `500 10.5px ${amiriFont}`;
  ctx.fillStyle = palette.softTintText;
  ctx.fillText('صدقة جارية عن أرواح أحمد وليلى 🤍', cx + contentW / 2, curY + 34);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.95);
}
