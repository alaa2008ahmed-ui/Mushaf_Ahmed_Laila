import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
    ShareDesignId,
    SHARE_CARD_DESIGNS,
    getSelectedShareDesign,
    setSelectedShareDesign,
    getShareDesignMeta,
    getDesignTypographyTheme,
    drawSanaaniBackdropAndFrame,
    drawSanaaniUpperQamariya,
    drawSanaaniLowerMotif,
    drawLapisBackdropAndFrame,
    drawLapisUpperMotif,
    drawLapisLowerMotif,
    drawRasulidBackdropAndFrame,
    drawRasulidUpperMotif,
    drawRasulidLowerMotif,
    drawHadramiBackdropAndFrame,
    drawHadramiUpperMotif,
    drawHadramiLowerMotif,
    drawObsidianGoldBackdropAndFrame,
    drawObsidianGoldUpperMotif,
    drawObsidianGoldLowerMotif,
    drawSkyAzureBackdropAndFrame,
    drawSkyAzureUpperMotif,
    drawSkyAzureLowerMotif,
    drawEmeraldSanctuaryBackdropAndFrame,
    drawEmeraldSanctuaryUpperMotif,
    drawEmeraldSanctuaryLowerMotif,
    drawRoyalAmethystBackdropAndFrame,
    drawRoyalAmethystUpperMotif,
    drawRoyalAmethystLowerMotif,
    drawSunsetSaffronBackdropAndFrame,
    drawSunsetSaffronUpperMotif,
    drawSunsetSaffronLowerMotif,
} from './shareCardDesigns';
import {
    drawExtraDesignBackdropAndFrame,
    drawExtraDesignUpperMotif,
    drawExtraDesignLowerMotif,
} from './shareCardDesignsExtra';

export type { ShareDesignId };
export {
    SHARE_CARD_DESIGNS,
    getSelectedShareDesign,
    setSelectedShareDesign,
    getShareDesignMeta,
    getDesignTypographyTheme,
};

export interface ShareOptions {
    text: string;
    title?: string;
    source?: string;
    category?: string;
    theme?: any;
    isEn?: boolean;
    language?: string;
    setToastMessage?: (msg: string) => void;
    designId?: ShareDesignId;
    renderScale?: number;
}

// Helper to draw rounded rectangle with cross-browser canvas support
function drawRoundRect(
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

// Wrap text into clean lines respecting maximum width and paragraph breaks
function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
): { text: string; isHighlight?: boolean; isBullet?: boolean }[] {
    const clean = (text || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');

    const rawParagraphs = clean.split('\n');
    const result: { text: string; isHighlight?: boolean; isBullet?: boolean }[] = [];

    for (const rawParagraph of rawParagraphs) {
        const paragraph = rawParagraph.trim();
        if (!paragraph) {
            result.push({ text: '' }); // Spacing line
            continue;
        }

        const isHighlight = paragraph.startsWith('💡') || paragraph.startsWith('📜') || paragraph.startsWith('📖');
        const isBullet = paragraph.startsWith('•') || paragraph.startsWith('-') || /^[0-9]+[.-]/.test(paragraph);

        const words = paragraph.split(/\s+/);
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                result.push({ text: currentLine, isHighlight, isBullet });
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            result.push({ text: currentLine, isHighlight, isBullet });
        }
    }
    return result;
}

// --- ISLAMIC GEOMETRIC & ARABESQUE VECTOR GRAPHICS DRAWING FUNCTIONS ---

/**
 * Draws a classical Islamic 8-Pointed Star (النجمة الثمانية الإسلامية / خاتم سليمان الزخرفي)
 */
function drawIslamicStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    points = 8,
    fillColor?: string,
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

/**
 * Draws an ornate Islamic corner arabesque ornament with delicate leaves and spirals
 */
function drawIslamicCornerArabesque(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    dx: 1 | -1,
    dy: 1 | -1,
    goldColor: string,
    accentColor: string
) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dx, dy);

    // Double corner border line
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(8, size - 12);
    ctx.lineTo(8, 8);
    ctx.lineTo(size - 12, 8);
    ctx.stroke();

    // Corner decorative quarter-arc
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.72, 0, Math.PI / 2);
    ctx.stroke();

    // Inner petal / leaf
    ctx.fillStyle = goldColor;
    ctx.beginPath();
    ctx.moveTo(12, 12);
    ctx.quadraticCurveTo(size * 0.45, 14, size * 0.48, size * 0.48);
    ctx.quadraticCurveTo(14, size * 0.45, 12, 12);
    ctx.fill();

    // Accent mini-diamond
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    const dX = size * 0.28;
    const dY = size * 0.28;
    ctx.moveTo(dX, dY - 6);
    ctx.lineTo(dX + 6, dY);
    ctx.lineTo(dX, dY + 6);
    ctx.lineTo(dX - 6, dY);
    ctx.closePath();
    ctx.fill();

    // Small finial dots
    ctx.fillStyle = goldColor;
    ctx.beginPath();
    ctx.arc(size - 6, 0, 3.2, 0, Math.PI * 2);
    ctx.arc(0, size - 6, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Draws a magnificent Islamic hanging lantern (قنديل إسلامي مذهب)
 */
function drawIslamicLantern(
    ctx: CanvasRenderingContext2D,
    cx: number,
    topY: number,
    lanternH: number,
    goldColor: string,
    accentColor: string
) {
    ctx.save();
    const bodyW = lanternH * 0.42;
    const chainH = Math.max(16, lanternH * 0.22);
    const domeH = lanternH * 0.22;
    const glassH = lanternH * 0.38;
    const baseH = lanternH * 0.18;

    const lanternTopY = topY + chainH;
    const glassTopY = lanternTopY + domeH;
    const baseTopY = glassTopY + glassH;

    // 1. Hanging Chain with links
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, lanternTopY);
    ctx.stroke();

    // Chain links dots
    ctx.fillStyle = goldColor;
    for (let y = topY + 6; y < lanternTopY; y += 10) {
        ctx.beginPath();
        ctx.arc(cx, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 2. Crescent & Finial at Dome Top
    ctx.fillStyle = goldColor;
    ctx.beginPath();
    ctx.arc(cx, lanternTopY - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Ornate Dome Cap (قبة القنديل)
    const domeGrad = ctx.createLinearGradient(cx - bodyW / 2, lanternTopY, cx + bodyW / 2, glassTopY);
    domeGrad.addColorStop(0, goldColor);
    domeGrad.addColorStop(0.5, '#FFF2B2');
    domeGrad.addColorStop(1, '#B8860B');
    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(cx, lanternTopY - 2);
    ctx.quadraticCurveTo(cx + bodyW * 0.45, lanternTopY + domeH * 0.5, cx + bodyW * 0.52, glassTopY);
    ctx.lineTo(cx - bodyW * 0.52, glassTopY);
    ctx.quadraticCurveTo(cx - bodyW * 0.45, lanternTopY + domeH * 0.5, cx, lanternTopY - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Luminous Glass Body with Radiant Light Glow (جسم القنديل المشع بالنور)
    const glassGrad = ctx.createRadialGradient(cx, glassTopY + glassH * 0.48, 4, cx, glassTopY + glassH * 0.48, bodyW * 0.7);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    glassGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.95)');
    glassGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.55)');
    glassGrad.addColorStop(1, 'rgba(180, 83, 9, 0.25)');

    ctx.fillStyle = glassGrad;
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(cx - bodyW * 0.52, glassTopY);
    ctx.quadraticCurveTo(cx - bodyW * 0.65, glassTopY + glassH * 0.45, cx - bodyW * 0.32, baseTopY);
    ctx.lineTo(cx + bodyW * 0.32, baseTopY);
    ctx.quadraticCurveTo(cx + bodyW * 0.65, glassTopY + glassH * 0.45, cx + bodyW * 0.52, glassTopY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vertical Golden Ribs on Glass
    ctx.strokeStyle = 'rgba(184, 134, 11, 0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, glassTopY);
    ctx.lineTo(cx, baseTopY);
    ctx.moveTo(cx - bodyW * 0.24, glassTopY + 2);
    ctx.quadraticCurveTo(cx - bodyW * 0.28, glassTopY + glassH * 0.5, cx - bodyW * 0.15, baseTopY);
    ctx.moveTo(cx + bodyW * 0.24, glassTopY + 2);
    ctx.quadraticCurveTo(cx + bodyW * 0.28, glassTopY + glassH * 0.5, cx + bodyW * 0.15, baseTopY);
    ctx.stroke();

    // 5. Ornate Base and Pendant Droplet (قاعدة القنديل ودلاية الزينة)
    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(cx - bodyW * 0.34, baseTopY);
    ctx.lineTo(cx + bodyW * 0.34, baseTopY);
    ctx.quadraticCurveTo(cx + bodyW * 0.22, baseTopY + baseH * 0.65, cx, baseTopY + baseH * 0.75);
    ctx.quadraticCurveTo(cx - bodyW * 0.22, baseTopY + baseH * 0.65, cx - bodyW * 0.34, baseTopY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pendant finial droplet
    ctx.fillStyle = goldColor;
    ctx.beginPath();
    ctx.arc(cx, baseTopY + baseH * 0.9, 4.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Draws an ornate Islamic Arabesque Motif / Centerpiece before text
 * to gracefully fill vertical void with authentic Islamic art
 */
function drawUpperIslamicMotif(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    availableHeight: number,
    goldColor: string,
    accentColor: string
) {
    ctx.save();
    const isSpacious = availableHeight >= 110;

    if (isSpacious) {
        // Draw elegant hanging lantern + symmetrical arabesque wings
        const lanternH = Math.min(130, Math.max(80, availableHeight * 0.72));
        const lanternTop = cy - lanternH * 0.5;
        drawIslamicLantern(ctx, cx, lanternTop, lanternH, goldColor, accentColor);

        // Flanking Arabesque floral vines
        const wingWidth = Math.min(260, 220);
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Left wing
        ctx.beginPath();
        ctx.moveTo(cx - 36, cy + 10);
        ctx.bezierCurveTo(cx - 90, cy - 25, cx - 160, cy + 30, cx - wingWidth, cy - 10);
        ctx.stroke();

        ctx.fillStyle = goldColor;
        ctx.beginPath();
        ctx.arc(cx - wingWidth, cy - 10, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(cx + 36, cy + 10);
        ctx.bezierCurveTo(cx + 90, cy - 25, cx + 160, cy + 30, cx + wingWidth, cy - 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + wingWidth, cy - 10, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Side mini-stars
        drawIslamicStar(ctx, cx - wingWidth * 0.55, cy + 5, 8, 4, 8, goldColor, accentColor, 1);
        drawIslamicStar(ctx, cx + wingWidth * 0.55, cy + 5, 8, 4, 8, goldColor, accentColor, 1);
    } else {
        // Compact ornate illuminated divider with central 8-pointed star & arabesque curls
        const span = 280;
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - span, cy);
        ctx.lineTo(cx - 30, cy);
        ctx.moveTo(cx + 30, cy);
        ctx.lineTo(cx + span, cy);
        ctx.stroke();

        // Central 8-pointed star
        drawIslamicStar(ctx, cx, cy, 14, 7, 8, goldColor, accentColor, 1.4);

        // Side diamond accents
        ctx.fillStyle = accentColor;
        for (const offset of [-90, -180, 90, 180]) {
            ctx.beginPath();
            ctx.arc(cx + offset, cy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}

/**
 * Draws a magnificent Islamic Illuminated Rosette Medallion (شمسة إسلامية مذهبة كبرى)
 * after text to gracefully fill space with breathtaking spiritual beauty
 */
function drawLowerIslamicRosette(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    availableHeight: number,
    goldColor: string,
    accentColor: string
) {
    ctx.save();
    const isLarge = availableHeight >= 120;
    const baseRadius = isLarge ? Math.min(52, Math.max(34, availableHeight * 0.28)) : 22;

    // 1. Symmetrical Horizontal Arabesque Scroll Arms
    const armSpan = isLarge ? 300 : 200;
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    // Left scroll
    ctx.beginPath();
    ctx.moveTo(cx - baseRadius - 10, cy);
    ctx.bezierCurveTo(cx - baseRadius - 50, cy - 18, cx - armSpan * 0.65, cy + 18, cx - armSpan, cy);
    ctx.stroke();

    // Right scroll
    ctx.beginPath();
    ctx.moveTo(cx + baseRadius + 10, cy);
    ctx.bezierCurveTo(cx + baseRadius + 50, cy - 18, cx + armSpan * 0.65, cy + 18, cx + armSpan, cy);
    ctx.stroke();

    // Arm tips & pearls
    ctx.fillStyle = goldColor;
    ctx.beginPath();
    ctx.arc(cx - armSpan, cy, 4.2, 0, Math.PI * 2);
    ctx.arc(cx + armSpan, cy, 4.2, 0, Math.PI * 2);
    ctx.fill();

    if (isLarge) {
        // Secondary delicate curls
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx - baseRadius - 30, cy);
        ctx.quadraticCurveTo(cx - armSpan * 0.45, cy - 24, cx - armSpan * 0.6, cy);
        ctx.moveTo(cx + baseRadius + 30, cy);
        ctx.quadraticCurveTo(cx + armSpan * 0.45, cy - 24, cx + armSpan * 0.6, cy);
        ctx.stroke();
    }

    // 2. Rosette Outer Petal Ring (حلقة بتلات الشمسة الإسلامية)
    const petals = 16;
    const petalR = baseRadius * 1.15;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.4;

    for (let i = 0; i < petals; i++) {
        const angle = (i * Math.PI * 2) / petals;
        const px = cx + Math.cos(angle) * (baseRadius * 0.78);
        const py = cy + Math.sin(angle) * (baseRadius * 0.78);
        ctx.beginPath();
        ctx.arc(px, py, baseRadius * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // 3. Central Concentric 8-Pointed Star (نجمة الشمسة المركزية)
    drawIslamicStar(ctx, cx, cy, baseRadius * 0.85, baseRadius * 0.45, 8, goldColor, accentColor, 1.8);

    // 4. Center Emerald/Gold Gem Core (فص الوسط الزمردي المذهب)
    const gemGrad = ctx.createRadialGradient(cx - 2, cy - 2, 2, cx, cy, baseRadius * 0.35);
    gemGrad.addColorStop(0, '#FFFFFF');
    gemGrad.addColorStop(0.3, '#E6C665');
    gemGrad.addColorStop(0.7, accentColor);
    gemGrad.addColorStop(1, '#063726');

    ctx.fillStyle = gemGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 0.36, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.restore();
}

/**
 * Draws an authentic Andalusian/Mamluk Islamic Mihrab Arch at top of card
 */
function drawTopMihrabArch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    archH: number,
    goldColor: string,
    accentColor: string
) {
    ctx.save();
    const cx = x + w / 2;
    const topY = y;
    const baseY = y + archH;

    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x + 20, baseY);
    ctx.lineTo(x + 20, baseY - archH * 0.4);
    // Left arch curve
    ctx.bezierCurveTo(x + 20, topY + archH * 0.2, cx - w * 0.2, topY, cx, topY - 14);
    // Right arch curve
    ctx.bezierCurveTo(cx + w * 0.2, topY, x + w - 20, topY + archH * 0.2, x + w - 20, baseY - archH * 0.4);
    ctx.lineTo(x + w - 20, baseY);
    ctx.stroke();

    // Trefoil / Scallop decorative peaks along the arch
    ctx.fillStyle = goldColor;
    const scallopCount = 11;
    for (let i = 1; i < scallopCount; i++) {
        const t = i / scallopCount;
        // Parameterized point along the arch
        let px: number, py: number;
        if (t <= 0.5) {
            const u = t * 2;
            px = x + 20 + (cx - (x + 20)) * u;
            py = baseY - archH * 0.4 + (topY - 14 - (baseY - archH * 0.4)) * Math.sin((u * Math.PI) / 2);
        } else {
            const u = (t - 0.5) * 2;
            px = cx + (x + w - 20 - cx) * u;
            py = topY - 14 + (baseY - archH * 0.4 - (topY - 14)) * (1 - Math.cos((u * Math.PI) / 2));
        }
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fill();
    }

    // Top Crest Finial (رأس قمة المحراب)
    drawIslamicStar(ctx, cx, topY - 18, 9, 4.5, 8, goldColor, accentColor, 1.2);

    ctx.restore();
}

/**
 * Pure Canvas 2D card renderer that creates a luminous, radiant, authentic Islamic masterpiece.
 * Solves:
 * 1. Background: Radiant, warm illuminated parchment / golden cream with subtle Islamic star tessellation.
 * 2. Space filling: Exquisite Islamic drawings (hanging lantern, symmetrical arabesques, illuminated rosette medallion).
 * 3. Typography: Enlarged, dignified font sizing for commanding presence and effortless readability.
 */
export async function renderCardToPureCanvas(options: ShareOptions): Promise<HTMLCanvasElement> {
    const { text, title, source, category, theme, isEn: explicitIsEn, language, designId, renderScale } = options;

    const activeDesignId: ShareDesignId = designId || getSelectedShareDesign();
    const typoTheme = getDesignTypographyTheme(activeDesignId);

    const isEn = explicitIsEn ?? (language === 'en' || !(/[\u0600-\u06FF]/.test(text || '')));

    // Ensure fonts are ready (fast-path immediately if already loaded)
    if (typeof document !== 'undefined' && document.fonts && document.fonts.status !== 'loaded') {
        try {
            await Promise.race([
                document.fonts.ready,
                new Promise((resolve) => setTimeout(resolve, 350))
            ]);
        } catch (e) {
            // Proceed with fallbacks
        }
    }

    // Standard high-DPI 9:16 mobile canvas dimensions
    const width = 1080;
    const height = 1920;
    const outerMargin = 32;
    const innerMargin = 56;
    const baseHorizontalPadding = activeDesignId === 'classic_gold' ? 96 : 104;

    const fontFamily = isEn 
        ? "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        : "'Amiri', 'Cairo', 'Traditional Arabic', sans-serif";

    // Clean and normalize strings
    let cleanCategory = category ? category.trim() : '';
    if (isEn && cleanCategory && /[\u0600-\u06FF]/.test(cleanCategory)) {
        cleanCategory = 'Remembrances & Supplications';
    }

    let cleanTitle = title ? title.trim() : '';
    if (isEn && cleanTitle && /[\u0600-\u06FF]/.test(cleanTitle)) {
        cleanTitle = 'Remembrance (Dhikr)';
    }

    // Prevent redundant identical title and category repeating right next to each other
    if (cleanTitle && cleanCategory && cleanTitle.toLowerCase() === cleanCategory.toLowerCase()) {
        cleanTitle = '';
    }

    let cleanSource = source ? source.trim() : '';
    if (isEn && cleanSource && /[\u0600-\u06FF]/.test(cleanSource)) {
        cleanSource = cleanSource
            .replace(/مرة واحدة/g, 'Once')
            .replace(/مرات/g, 'times')
            .replace(/مرة/g, 'times')
            .replace(/البداية/g, 'Start')
            .replace(/تمام المائة/g, 'Completion of 100')
            .replace(/صحيح البخاري/g, 'Sahih Al-Bukhari')
            .replace(/صحيح مسلم/g, 'Sahih Muslim')
            .replace(/سنن أبي داود/g, 'Sunan Abi Dawud')
            .replace(/سنن الترمذي/g, 'Sunan At-Tirmidhi')
            .replace(/سنن النسائي/g, "Sunan An-Nasa'i")
            .replace(/سنن ابن ماجه/g, 'Sunan Ibn Majah')
            .replace(/سورة/g, 'Surah')
            .replace(/آية/g, 'Ayah');
        if (/[\u0600-\u06FF]/.test(cleanSource)) {
            cleanSource = '';
        }
    }

    // Prevent duplicate Surah / Ayah citations from appearing both at top (Title) and bottom (Source)
    if (cleanTitle && cleanSource) {
        const normalizeRef = (str: string) =>
            str
                .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
                .replace(/[أإآ]/g, 'ا')
                .replace(/ة/g, 'ه')
                .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
                .replace(/[^\p{L}\p{N}\s]/gu, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();

        const genericRefWords = new Set([
            'سوره',
            'الايات',
            'ايات',
            'الايه',
            'ايه',
            'من',
            'surah',
            'ayat',
            'ayah',
            'verses',
            'verse',
            'from',
        ]);

        const normTitle = normalizeRef(cleanTitle);
        const titleCoreSet = new Set(
            normTitle.split(' ').filter((w) => w && !genericRefWords.has(w))
        );

        const isSegmentRedundant = (seg: string): boolean => {
            const normSeg = normalizeRef(seg);
            if (!normSeg) return true;
            if (normTitle.includes(normSeg)) return true;

            const segTokens = normSeg.split(' ').filter((w) => w && !genericRefWords.has(w));
            if (segTokens.length === 0) return false;
            const hasDigit = segTokens.some((t) => /\d/.test(t));
            if (!hasDigit && segTokens.length < 2) return false;
            return segTokens.every((t) => titleCoreSet.has(t));
        };

        const segments = cleanSource.split(/\s*[•|]\s*/).filter(Boolean);
        const remainingSegments = segments.filter((seg) => !isSegmentRedundant(seg));
        cleanSource = remainingSegments.join(' • ');
    }

    let cleanText = text ? text.trim() : '';
    if (isEn && cleanText && /[\u0600-\u06FF]/.test(cleanText)) {
        cleanText = cleanText.replace(/[\u0600-\u06FF]/g, '').trim() || text;
    }

    // Temporary measurement canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = 100;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.direction = isEn ? 'ltr' : 'rtl';

    // --- 1. FIXED TOP HEADER (Bismillah + Category Cartouche + Anchored Title) ---
    const topSectionStartY = innerMargin + 82; // 138px — safely below all 20 frame arches/belts
    const bismillahText = isEn 
        ? 'In the Name of Allah, the Entirely Merciful, the Especially Merciful' 
        : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

    let headerEndY = topSectionStartY + (isEn ? 34 : 56);
    if (cleanCategory) {
        headerEndY += 12 + 46; // badge height (46px)
    }

    // Anchor Title cleanly under Header (never stranded mid-canvas) and wrap if wide
    const defaultMaxWidth = width - baseHorizontalPadding * 2;
    let titleFontSize = isEn ? 32 : 40;
    let titleLineHeight = Math.round(titleFontSize * 1.38);
    let titleLines: { text: string }[] = [];
    if (cleanTitle) {
        if (cleanTitle.length > 48) titleFontSize = isEn ? 26 : 33;
        else if (cleanTitle.length > 28) titleFontSize = isEn ? 29 : 36;
        titleLineHeight = Math.round(titleFontSize * 1.36);
        tempCtx.font = `bold ${titleFontSize}px ${fontFamily}`;
        titleLines = wrapText(tempCtx, cleanTitle, defaultMaxWidth - 24);
        headerEndY += 18 + titleLines.length * titleLineHeight;
    } else {
        headerEndY += 14;
    }

    // --- 2. FIXED FOOTER ANCHOR ---
    const footerStartY = height - innerMargin - 160; // y = 1704 — safely above all 20 frame belts/domes
    const contentZoneBottomY = footerStartY - 16;    // y = 1688
    const totalMiddleZoneH = Math.max(400, contentZoneBottomY - headerEndY); // ~1360-1500px full card body zone

    const getLineHeightForSize = (fs: number): number => {
        const ratio =
            fs >= 64 ? (isEn ? 1.56 : 1.72) :
            fs >= 48 ? (isEn ? 1.50 : 1.64) :
            fs >= 34 ? (isEn ? 1.44 : 1.54) :
            fs >= 24 ? (isEn ? 1.38 : 1.48) :
                       (isEn ? 1.32 : 1.42);
        return Math.round(fs * ratio);
    };

    const measureBodyHeight = (
        linesList: { text: string; isHighlight?: boolean; isBullet?: boolean }[],
        lh: number,
        isDense: boolean
    ) => {
        let total = 0;
        const emptyGap = Math.round(lh * (isDense ? 0.30 : 0.44));
        for (const l of linesList) {
            total += !l.text ? emptyGap : lh;
        }
        return total;
    };

    // --- 3. INTELLIGENT ADAPTIVE TYPOGRAPHY & FULL-CARD AUTO-FIT ENGINE ---
    const plainStripped = cleanText
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    // Strip Arabic diacritics/Tashkeel so heavy vocalization does not artificially cap font size
    const visualLen = plainStripped.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').length;

    // Upper aesthetic caps by visual character count while binary search maximizes canvas fill
    const maxFontCap =
        visualLen <= 50 ? (isEn ? 66 : 84) :
        visualLen <= 110 ? (isEn ? 62 : 82) :
        visualLen <= 220 ? (isEn ? 54 : 74) :
        visualLen <= 460 ? (isEn ? 46 : 64) :
                           (isEn ? 40 : 54);

    const standardMinFont = isEn ? 18 : 22;

    // Minimum compact ornament reservation so long text claims up to 88%+ of the canvas
    const minReservedMotifs = 180; // 70px upper + 78px lower + 32px cushion
    const computeLayoutForFont = (fs: number, padX: number) => {
        const wLimit = width - padX * 2;
        const lh = getLineHeightForSize(fs);
        tempCtx.font = `600 ${fs}px ${fontFamily}`;
        const wrapped = wrapText(tempCtx, cleanText, wLimit);
        const isDense = wrapped.length >= 12 || fs <= 34;
        const bodyH = measureBodyHeight(wrapped, lh, isDense);

        let srcFontSize = 0;
        let srcLines: { text: string }[] = [];
        let srcBlockH = 0;
        if (cleanSource) {
            srcFontSize = Math.min(32, Math.max(20, Math.round(fs * 0.58)));
            tempCtx.font = `bold ${srcFontSize}px ${fontFamily}`;
            srcLines = wrapText(tempCtx, cleanSource, wLimit - 40);
            srcBlockH = 28 + srcLines.length * Math.round(srcFontSize * 1.35) + 12;
        }

        return { fs, padX, wLimit, lh, wrapped, isDense, bodyH, srcFontSize, srcLines, srcBlockH };
    };

    // Binary search for the largest readable font size that comfortably fits with ornaments
    let low = standardMinFont;
    let high = maxFontCap;
    let bestLayout = computeLayoutForFont(standardMinFont, baseHorizontalPadding);

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const candidate = computeLayoutForFont(mid, baseHorizontalPadding);
        // For short/medium text, require enough breathing room (~280px) so motifs look majestic;
        // for dense text, allow filling up to minReservedMotifs cleanly.
        const requiredExtras = candidate.wrapped.length <= 6 ? 340 : candidate.wrapped.length <= 12 ? 250 : minReservedMotifs;
        if (candidate.bodyH + candidate.srcBlockH + requiredExtras <= totalMiddleZoneH) {
            bestLayout = candidate;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    // Safeguard for ultra-massive texts (e.g., 2,500+ chars): widen text box slightly & scale down smoothly
    if (bestLayout.bodyH + bestLayout.srcBlockH + 140 > totalMiddleZoneH) {
        const widePad = activeDesignId === 'classic_gold' ? 76 : 84;
        let fallbackSize = standardMinFont;
        bestLayout = computeLayoutForFont(fallbackSize, widePad);
        while (
            bestLayout.bodyH + bestLayout.srcBlockH + 140 > totalMiddleZoneH &&
            fallbackSize > 14
        ) {
            fallbackSize -= 1;
            bestLayout = computeLayoutForFont(fallbackSize, widePad);
        }
    }

    const {
        fs: bodyFontSize,
        padX: horizontalContentPadding,
        lh: baseLineHeight,
        wrapped: lines,
        isDense,
        bodyH: baseTextHeight,
        srcFontSize: sourceFontSize,
        srcLines,
        srcBlockH: sourceBlockHeight,
    } = bestLayout;

    // Gentle vertical breathing expansion when multi-line texts still leave plenty of blank canvas height
    let lineHeight = baseLineHeight;
    let textHeight = baseTextHeight;
    const nonEmptyLineCount = lines.filter((l) => Boolean(l.text)).length;
    const minNeededForMotifsAndMargins = nonEmptyLineCount <= 5 ? 360 : 280;
    const expandableSlack =
        totalMiddleZoneH - (baseTextHeight + sourceBlockHeight + minNeededForMotifsAndMargins);
    if (nonEmptyLineCount >= 3 && expandableSlack > 40) {
        const maxPerLineBoost = Math.max(4, Math.round(bodyFontSize * 0.24));
        const boostPerLine = Math.min(
            maxPerLineBoost,
            Math.floor(expandableSlack / nonEmptyLineCount)
        );
        if (boostPerLine >= 2) {
            lineHeight = baseLineHeight + boostPerLine;
            textHeight = measureBodyHeight(lines, lineHeight, isDense);
        }
    }

    // --- 4. BALANCED FULL-CANVAS VERTICAL DISTRIBUTION (NO EMPTY VOIDS) ---
    const contentBlockH = textHeight + sourceBlockHeight;
    const remainingMiddleSpace = Math.max(96, totalMiddleZoneH - contentBlockH);

    // Dynamically size upper and lower Islamic motifs based on available space
    const upperMotifHeight =
        remainingMiddleSpace >= 420
            ? Math.min(185, Math.round(remainingMiddleSpace * 0.24))
            : remainingMiddleSpace >= 220
            ? Math.round(remainingMiddleSpace * 0.34)
            : Math.max(58, Math.round(remainingMiddleSpace * 0.40));

    const lowerRosetteHeight =
        remainingMiddleSpace >= 420
            ? Math.min(195, Math.round(remainingMiddleSpace * 0.26))
            : remainingMiddleSpace >= 220
            ? Math.round(remainingMiddleSpace * 0.36)
            : Math.max(64, Math.round(remainingMiddleSpace * 0.44));

    const cushionPool = Math.max(8, remainingMiddleSpace - upperMotifHeight - lowerRosetteHeight);
    // Distribute cushion across top-to-upper, upper-to-text, text-to-lower, and lower-to-footer
    // so content and ornaments span harmoniously from top to bottom of the entire card
    const gapBeforeUpper = Math.round(cushionPool * 0.16);
    const gapAfterUpper = Math.round(cushionPool * 0.34);
    const gapBeforeLower = Math.round(cushionPool * 0.34);

    const upperMotifTopY = headerEndY + gapBeforeUpper;
    const bodyStartY = upperMotifTopY + upperMotifHeight + gapAfterUpper;
    const lowerMotifTopY = bodyStartY + contentBlockH + gapBeforeLower;

    // Create target canvas (Supports up to 2.5x Ultra-HD high-DPI resolution)
    const scale = renderScale && renderScale > 0 && renderScale <= 2.5 ? renderScale : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d')!;

    if (scale !== 1) {
        ctx.scale(scale, scale);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.direction = isEn ? 'ltr' : 'rtl';

    // --- PALETTE & BACKDROP BY SELECTED DESIGN ---
    drawBackdropForDesign(ctx, activeDesignId, width, height, outerMargin, innerMargin);

    // 5. TOP SECTION: Bismillah, Category Badge, and Top-Anchored Title
    let currentTopY = topSectionStartY;
    ctx.save();
    ctx.font = isEn ? `bold 22px ${fontFamily}` : `700 44px 'Amiri', 'Traditional Arabic', serif`;
    ctx.fillStyle = typoTheme.bismillahColor;
    ctx.textAlign = 'center';
    ctx.shadowColor = typoTheme.bismillahShadow;
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillText(bismillahText, width / 2, currentTopY + (isEn ? 22 : 38));
    ctx.restore();

    currentTopY += isEn ? 36 : 58;

    // Category Badge (Ornate Illuminated Cartouche)
    if (cleanCategory) {
        ctx.save();
        ctx.font = `bold 22px ${fontFamily}`;
        const maxPillWidth = defaultMaxWidth - 20;
        const catMetrics = ctx.measureText(cleanCategory);
        const pillW = Math.min(maxPillWidth, catMetrics.width + 68);
        const pillH = 46;
        const pillX = (width - pillW) / 2;

        const cartoucheGrad = ctx.createLinearGradient(pillX, currentTopY, pillX + pillW, currentTopY + pillH);
        cartoucheGrad.addColorStop(0, typoTheme.badgeBgStops[0]);
        cartoucheGrad.addColorStop(0.5, typoTheme.badgeBgStops[1]);
        cartoucheGrad.addColorStop(1, typoTheme.badgeBgStops[2]);
        ctx.fillStyle = cartoucheGrad;
        ctx.strokeStyle = typoTheme.badgeBorder;
        ctx.lineWidth = 2.2;
        drawRoundRect(ctx, pillX, currentTopY, pillW, pillH, 23);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = typoTheme.badgeInnerLine;
        ctx.lineWidth = 1;
        drawRoundRect(ctx, pillX + 3, currentTopY + 3, pillW - 6, pillH - 6, 20);
        ctx.stroke();

        drawIslamicStar(ctx, pillX + 16, currentTopY + pillH / 2, 6, 3, 8, typoTheme.badgeStarColor);
        drawIslamicStar(ctx, pillX + pillW - 16, currentTopY + pillH / 2, 6, 3, 8, typoTheme.badgeStarColor);

        ctx.fillStyle = typoTheme.badgeTextColor;
        ctx.textAlign = 'center';
        ctx.fillText(cleanCategory, width / 2, currentTopY + 30, pillW - 44);
        ctx.restore();

        currentTopY += pillH + 16;
    }

    // Anchored Wrapped Title right beneath Category
    if (titleLines.length > 0) {
        ctx.save();
        ctx.font = `bold ${titleFontSize}px ${fontFamily}`;
        ctx.fillStyle = typoTheme.titleColor;
        ctx.textAlign = 'center';
        ctx.shadowColor = typoTheme.titleShadow;
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        for (const tLine of titleLines) {
            if (tLine.text) {
                ctx.fillText(tLine.text, width / 2, currentTopY + titleFontSize * 0.85, defaultMaxWidth);
                currentTopY += titleLineHeight;
            }
        }
        ctx.restore();
    }

    // 6. UPPER ISLAMIC DRAWING (Positioned cleanly under Header)
    const goldPrimary = '#C59B27';
    const emeraldPrimary = '#064E3B';
    const upperMotifCenterY = upperMotifTopY + upperMotifHeight * 0.5;
    if (drawExtraDesignUpperMotif(ctx, activeDesignId, width / 2, upperMotifCenterY, upperMotifHeight)) {
        // Rendered by extra design renderer
    } else if (activeDesignId === 'sanaani_qamariya') {
        drawSanaaniUpperQamariya(ctx, width / 2, upperMotifCenterY, upperMotifHeight);
    } else if (activeDesignId === 'lapis_turquoise') {
        drawLapisUpperMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight);
    } else if (activeDesignId === 'rasulid_garnet') {
        drawRasulidUpperMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight);
    } else if (activeDesignId === 'hadrami_jade') {
        drawHadramiUpperMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight);
    } else if (activeDesignId === 'obsidian_gold') {
        drawObsidianGoldUpperMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight);
    } else if (activeDesignId === 'sky_azure') {
        drawSkyAzureUpperMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight);
    } else if (activeDesignId === 'emerald_sanctuary') {
        drawEmeraldSanctuaryUpperMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight);
    } else if (activeDesignId === 'royal_amethyst') {
        drawRoyalAmethystUpperMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight);
    } else if (activeDesignId === 'sunset_saffron') {
        drawSunsetSaffronUpperMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight);
    } else {
        drawUpperIslamicMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight, goldPrimary, emeraldPrimary);
    }

    // 7. BODY TEXT: Auto-Fitted, Full-Canvas Distributed, Calligraphic & Crisp
    let currentMiddleY = bodyStartY;
    const emptyLineGap = Math.round(lineHeight * (isDense ? 0.30 : 0.44));
    ctx.direction = isEn ? 'ltr' : 'rtl';
    ctx.textAlign = 'center';

    for (const lineObj of lines) {
        if (!lineObj.text) {
            currentMiddleY += emptyLineGap;
            continue;
        }

        ctx.save();
        if (lineObj.isHighlight) {
            ctx.font = `700 ${bodyFontSize + 2}px ${fontFamily}`;
            ctx.fillStyle = typoTheme.highlightColor;
            ctx.shadowColor = typoTheme.highlightShadow;
            ctx.shadowBlur = 5;
        } else if (lineObj.isBullet) {
            ctx.font = `600 ${bodyFontSize}px ${fontFamily}`;
            ctx.fillStyle = typoTheme.bulletColor;
        } else {
            ctx.font = `600 ${bodyFontSize}px ${fontFamily}`;
            ctx.fillStyle = typoTheme.bodyColor;
        }

        ctx.shadowColor = typoTheme.bodyShadow;
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;
        ctx.fillText(lineObj.text, width / 2, currentMiddleY + bodyFontSize * 0.85);
        ctx.restore();

        currentMiddleY += lineHeight;
    }

    // Source & Metadata (Wrapped cleanly if long)
    if (srcLines.length > 0) {
        currentMiddleY += 12;
        ctx.strokeStyle = typoTheme.sourceDividerColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(horizontalContentPadding + 60, currentMiddleY);
        ctx.lineTo(width - horizontalContentPadding - 60, currentMiddleY);
        ctx.stroke();

        ctx.fillStyle = typoTheme.footerStarFill;
        ctx.beginPath();
        ctx.arc(horizontalContentPadding + 60, currentMiddleY, 3, 0, Math.PI * 2);
        ctx.arc(width - horizontalContentPadding - 60, currentMiddleY, 3, 0, Math.PI * 2);
        ctx.fill();

        const srcLineHeight = Math.round(sourceFontSize * 1.35);
        currentMiddleY += 16;
        ctx.save();
        ctx.font = `bold ${sourceFontSize}px ${fontFamily}`;
        ctx.fillStyle = typoTheme.sourceColor;
        ctx.textAlign = 'center';
        for (const sLine of srcLines) {
            if (sLine.text) {
                ctx.fillText(sLine.text, width / 2, currentMiddleY + sourceFontSize * 0.88);
                currentMiddleY += srcLineHeight;
            }
        }
        ctx.restore();
    }

    // LOWER ISLAMIC DRAWING (Anchored cleanly toward Footer)
    const lowerRosetteCenterY = lowerMotifTopY + lowerRosetteHeight * 0.5;
    if (drawExtraDesignLowerMotif(ctx, activeDesignId, width / 2, lowerRosetteCenterY, lowerRosetteHeight)) {
        // Rendered by extra design renderer
    } else if (activeDesignId === 'sanaani_qamariya') {
        drawSanaaniLowerMotif(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight);
    } else if (activeDesignId === 'lapis_turquoise') {
        drawLapisLowerMotif(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight);
    } else if (activeDesignId === 'rasulid_garnet') {
        drawRasulidLowerMotif(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight);
    } else if (activeDesignId === 'hadrami_jade') {
        drawHadramiLowerMotif(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight);
    } else if (activeDesignId === 'obsidian_gold') {
        drawObsidianGoldLowerMotif(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight);
    } else if (activeDesignId === 'sky_azure') {
        drawSkyAzureLowerMotif(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight);
    } else if (activeDesignId === 'emerald_sanctuary') {
        drawEmeraldSanctuaryLowerMotif(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight);
    } else if (activeDesignId === 'royal_amethyst') {
        drawRoyalAmethystLowerMotif(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight);
    } else if (activeDesignId === 'sunset_saffron') {
        drawSunsetSaffronLowerMotif(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight);
    } else {
        drawLowerIslamicRosette(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight, goldPrimary, emeraldPrimary);
    }

    // 8. BOTTOM SECTION: Footer Brand
    ctx.strokeStyle = typoTheme.footerLineColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, footerStartY);
    ctx.lineTo(width / 2 - 24, footerStartY);
    ctx.moveTo(width / 2 + 24, footerStartY);
    ctx.lineTo(width / 2 + 200, footerStartY);
    ctx.stroke();

    drawIslamicStar(ctx, width / 2, footerStartY, 11, 5.5, 8, typoTheme.footerStarFill, typoTheme.footerStarStroke, 1);

    const brandName = isEn 
        ? 'Mushaf Ahmed & Laila' 
        : 'مصحف أحمد و ليلى';

    const brandSubtitle = isEn
        ? 'Holy Quran & Daily Remembrance'
        : 'تلاوة وتدبر وسيرة نبوية';

    ctx.save();
    ctx.font = isEn ? `bold 32px ${fontFamily}` : `700 40px 'Amiri', 'Traditional Arabic', serif`;
    ctx.fillStyle = typoTheme.brandColor;
    ctx.textAlign = 'center';
    ctx.shadowColor = typoTheme.brandShadow;
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;
    ctx.fillText(brandName, width / 2, footerStartY + 42);

    ctx.font = `600 18px ${fontFamily}`;
    ctx.fillStyle = typoTheme.subtitleColor;
    ctx.fillText(brandSubtitle, width / 2, footerStartY + 72);
    ctx.restore();

    return canvas;
}

/**
 * Encodes a high-DPI canvas into a crisp JPEG while automatically tuning quality
 * so the final file remains compact and fast to share across messaging apps.
 */
export function encodeHighResCompactImage(
    canvas: HTMLCanvasElement,
    targetMaxBytes = 380 * 1024,
    initialQuality = 0.88,
    minQuality = 0.68
): string {
    const estimateBytes = (url: string) => {
        const commaIdx = url.indexOf(',');
        const payloadLen = commaIdx === -1 ? url.length : url.length - commaIdx - 1;
        return Math.floor(payloadLen * 0.75);
    };

    let quality = initialQuality;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    while (estimateBytes(dataUrl) > targetMaxBytes && quality > minQuality) {
        quality = Math.max(minQuality, Number((quality - 0.04).toFixed(2)));
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (quality === minQuality) break;
    }
    return dataUrl;
}

/**
 * Universal high-reliability sharing function for cards and quotes
 */
export const shareAsImage = async ({ text, title, source, category, theme, isEn: explicitIsEn, language, setToastMessage, designId }: ShareOptions) => {
    const isEn = explicitIsEn ?? (language === 'en' || !(/[\u0600-\u06FF]/.test(text || '')));

    if (setToastMessage) {
        setToastMessage(isEn ? 'Preparing high quality Islamic image...' : 'جاري تجهيز بطاقة مشاركة إسلامية بدقة عالية...');
    }

    try {
        // Render at 2x Ultra-HD (2160x3840) for razor-sharp Arabic calligraphy & fine ornaments
        const canvas = await renderCardToPureCanvas({
            text,
            title,
            source,
            category,
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage,
            designId,
            renderScale: 2,
        });

        const dataUrl = encodeHighResCompactImage(canvas, 380 * 1024, 0.88, 0.68);

        if (!dataUrl || dataUrl === 'data:,') {
            throw new Error('Failed to generate image data');
        }

        const shareTitle = title || (isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد و ليلى');
        const shareDialogTitle = isEn ? 'Share Image via' : 'مشاركة البطاقة كصورة عبر';
        const shareFileName = isEn ? `ahmed_layla_card_${Date.now()}.jpg` : `mus-share_${Date.now()}.jpg`;
        const shareText = isEn 
            ? `${shareTitle}\nMushaf Ahmed & Laila • Holy Quran & Daily Remembrance`
            : `${shareTitle}\nمصحف أحمد و ليلى • تلاوة وتدبر وسيرة نبوية`;

        // Share via Native Device Sheet or Web Share
        if (Capacitor.isNativePlatform()) {
            const base64Data = dataUrl.split(',')[1];

            const savedFile = await Filesystem.writeFile({
                path: shareFileName,
                data: base64Data,
                directory: Directory.Cache
            });

            await Share.share({
                title: shareTitle,
                text: shareText,
                url: savedFile.uri,
                dialogTitle: shareDialogTitle
            });
        } else if (navigator.share) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], shareFileName, { type: 'image/jpeg' });

                const sharePayload: ShareData = {
                    files: [file],
                    title: shareTitle,
                    text: shareText
                };

                if (navigator.canShare && navigator.canShare(sharePayload)) {
                    await navigator.share(sharePayload);
                } else if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: shareTitle
                    });
                } else {
                    await downloadFile(dataUrl, isEn, setToastMessage);
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.warn('Navigator share file failed, falling back to download', e);
                    await downloadFile(dataUrl, isEn, setToastMessage);
                }
            }
        } else {
            await downloadFile(dataUrl, isEn, setToastMessage);
        }

        if (setToastMessage) {
            setToastMessage(isEn ? 'Shared successfully' : 'تمت المشاركة بنجاح');
        }
    } catch (err) {
        console.error('Share Error:', err);
        if (setToastMessage) {
            setToastMessage(isEn ? 'Failed to share image' : 'فشلت المشاركة كصورة');
        }
    } finally {
        setTimeout(() => {
            if (setToastMessage) setToastMessage('');
        }, 2500);
    }
};

const downloadFile = async (dataUrl: string, isEn: boolean, setToastMessage?: (msg: string) => void) => {
    try {
        const link = document.createElement('a');
        link.download = isEn ? `ahmed_layla_card_${Date.now()}.jpg` : `mushaf_share_${Date.now()}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (setToastMessage) {
            setToastMessage(isEn ? 'Image downloaded successfully' : 'تم تنزيل الصورة بنجاح');
        }
    } catch (e) {
        console.error('Download failed', e);
        if (setToastMessage) {
            setToastMessage(isEn ? 'Failed to download image' : 'فشل تنزيل الصورة');
        }
    }
};

function drawClassicGoldBackdropAndFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    outerMargin: number,
    innerMargin: number
) {
    const goldPrimary = '#C59B27';
    const emeraldPrimary = '#064E3B';

    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#FFFDF8');
    bgGrad.addColorStop(0.35, '#FAF4E4');
    bgGrad.addColorStop(0.7, '#F7EDD5');
    bgGrad.addColorStop(1, '#F3E3C0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const centerGlow = ctx.createRadialGradient(width / 2, height * 0.48, 80, width / 2, height * 0.48, width * 0.78);
    centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    centerGlow.addColorStop(0.45, 'rgba(254, 243, 199, 0.55)');
    centerGlow.addColorStop(0.8, 'rgba(247, 230, 185, 0.25)');
    centerGlow.addColorStop(1, 'rgba(235, 214, 160, 0.05)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = 'rgba(197, 155, 39, 0.085)';
    ctx.lineWidth = 1.2;
    const starGridStep = 90;
    for (let x = 45; x < width; x += starGridStep) {
        for (let y = 45; y < height; y += starGridStep) {
            drawIslamicStar(ctx, x, y, 16, 8, 8, undefined, 'rgba(197, 155, 39, 0.075)', 1);
        }
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(197, 155, 39, 0.75)';
    ctx.lineWidth = 3.5;
    drawRoundRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 38);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(230, 198, 101, 0.85)';
    ctx.lineWidth = 1.2;
    drawRoundRect(ctx, outerMargin + 7, outerMargin + 7, width - (outerMargin + 7) * 2, height - (outerMargin + 7) * 2, 32);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 253, 247, 0.65)';
    ctx.strokeStyle = emeraldPrimary;
    ctx.lineWidth = 2.4;
    drawRoundRect(ctx, innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, 28);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(197, 155, 39, 0.65)';
    ctx.lineWidth = 1.4;
    drawRoundRect(ctx, innerMargin + 6, innerMargin + 6, width - (innerMargin + 6) * 2, height - (innerMargin + 6) * 2, 22);
    ctx.stroke();

    const cornerArabesqueSize = 75;
    drawIslamicCornerArabesque(ctx, innerMargin + 10, innerMargin + 10, cornerArabesqueSize, 1, 1, goldPrimary, emeraldPrimary);
    drawIslamicCornerArabesque(ctx, width - innerMargin - 10, innerMargin + 10, cornerArabesqueSize, -1, 1, goldPrimary, emeraldPrimary);
    drawIslamicCornerArabesque(ctx, innerMargin + 10, height - innerMargin - 10, cornerArabesqueSize, 1, -1, goldPrimary, emeraldPrimary);
    drawIslamicCornerArabesque(ctx, width - innerMargin - 10, height - innerMargin - 10, cornerArabesqueSize, -1, -1, goldPrimary, emeraldPrimary);

    drawTopMihrabArch(ctx, innerMargin + 14, innerMargin + 18, width - (innerMargin + 14) * 2, 70, goldPrimary, emeraldPrimary);
}

function drawBackdropForDesign(
    ctx: CanvasRenderingContext2D,
    designId: ShareDesignId,
    width: number,
    height: number,
    outerMargin: number,
    innerMargin: number
) {
    if (drawExtraDesignBackdropAndFrame(ctx, designId, width, height, outerMargin, innerMargin)) {
        return;
    } else if (designId === 'sanaani_qamariya') {
        drawSanaaniBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    } else if (designId === 'lapis_turquoise') {
        drawLapisBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    } else if (designId === 'rasulid_garnet') {
        drawRasulidBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    } else if (designId === 'hadrami_jade') {
        drawHadramiBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    } else if (designId === 'obsidian_gold') {
        drawObsidianGoldBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    } else if (designId === 'sky_azure') {
        drawSkyAzureBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    } else if (designId === 'emerald_sanctuary') {
        drawEmeraldSanctuaryBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    } else if (designId === 'royal_amethyst') {
        drawRoyalAmethystBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    } else if (designId === 'sunset_saffron') {
        drawSunsetSaffronBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    } else {
        drawClassicGoldBackdropAndFrame(ctx, width, height, outerMargin, innerMargin);
    }
}

const designBackdropCache = new Map<string, string>();
const designMotifCache = new Map<string, string>();

/**
 * Renders the ornate vector backdrop & architectural frame for any of the 10 Share Card Designs
 * at canonical 1080px width and returns a cached JPEG data URL.
 */
export function renderDesignBackdropToDataUrl(designId: ShareDesignId, height = 1920): string {
    const safeHeight = Math.max(720, Math.round(height));
    const cacheKey = `${designId}_${safeHeight}`;
    const cached = designBackdropCache.get(cacheKey);
    if (cached) return cached;

    if (typeof document === 'undefined') return '';

    const width = 1080;
    const outerMargin = 32;
    const innerMargin = 56;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = safeHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawBackdropForDesign(ctx, designId, width, safeHeight, outerMargin, innerMargin);

    const url = canvas.toDataURL('image/jpeg', 0.92);
    designBackdropCache.set(cacheKey, url);
    return url;
}

/**
 * Renders the upper or lower signature vector motif for a Share Card Design
 * on a transparent 720x160 PNG canvas and returns a cached data URL.
 */
export function renderDesignMotifDataUrl(designId: ShareDesignId, position: 'upper' | 'lower'): string {
    const cacheKey = `${designId}_${position}`;
    const cached = designMotifCache.get(cacheKey);
    if (cached) return cached;

    if (typeof document === 'undefined') return '';

    const width = 720;
    const height = 160;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const cx = width / 2;
    const cy = height / 2;
    const availableHeight = 120;
    const goldPrimary = '#C59B27';
    const emeraldPrimary = '#064E3B';

    if (position === 'upper') {
        if (drawExtraDesignUpperMotif(ctx, designId, cx, cy, availableHeight)) {
            // Rendered by extra design renderer
        } else if (designId === 'sanaani_qamariya') {
            drawSanaaniUpperQamariya(ctx, cx, cy, availableHeight);
        } else if (designId === 'lapis_turquoise') {
            drawLapisUpperMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'rasulid_garnet') {
            drawRasulidUpperMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'hadrami_jade') {
            drawHadramiUpperMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'obsidian_gold') {
            drawObsidianGoldUpperMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'sky_azure') {
            drawSkyAzureUpperMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'emerald_sanctuary') {
            drawEmeraldSanctuaryUpperMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'royal_amethyst') {
            drawRoyalAmethystUpperMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'sunset_saffron') {
            drawSunsetSaffronUpperMotif(ctx, cx, cy, availableHeight);
        } else {
            drawUpperIslamicMotif(ctx, cx, cy, availableHeight, goldPrimary, emeraldPrimary);
        }
    } else {
        if (drawExtraDesignLowerMotif(ctx, designId, cx, cy, availableHeight)) {
            // Rendered by extra design renderer
        } else if (designId === 'sanaani_qamariya') {
            drawSanaaniLowerMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'lapis_turquoise') {
            drawLapisLowerMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'rasulid_garnet') {
            drawRasulidLowerMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'hadrami_jade') {
            drawHadramiLowerMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'obsidian_gold') {
            drawObsidianGoldLowerMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'sky_azure') {
            drawSkyAzureLowerMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'emerald_sanctuary') {
            drawEmeraldSanctuaryLowerMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'royal_amethyst') {
            drawRoyalAmethystLowerMotif(ctx, cx, cy, availableHeight);
        } else if (designId === 'sunset_saffron') {
            drawSunsetSaffronLowerMotif(ctx, cx, cy, availableHeight);
        } else {
            drawLowerIslamicRosette(ctx, cx, cy, availableHeight, goldPrimary, emeraldPrimary);
        }
    }

    const url = canvas.toDataURL('image/png');
    designMotifCache.set(cacheKey, url);
    return url;
}
