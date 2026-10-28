import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface ShareOptions {
    text: string;
    title?: string;
    source?: string;
    category?: string;
    theme?: any;
    isEn?: boolean;
    language?: string;
    setToastMessage?: (msg: string) => void;
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
    const { text, title, source, category, theme, isEn: explicitIsEn, language } = options;

    const isEn = explicitIsEn ?? (language === 'en' || !(/[\u0600-\u06FF]/.test(text || '')));

    // Ensure fonts are ready
    try {
        await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 350))
        ]);
    } catch (e) {
        // Proceed with fallbacks
    }

    // Standard high-DPI 9:16 mobile canvas dimensions
    const width = 1080;
    const height = 1920;
    const outerMargin = 32;
    const innerMargin = 56;
    const horizontalContentPadding = 110;
    const maxTextWidth = width - (horizontalContentPadding * 2);

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

    let cleanText = text ? text.trim() : '';
    if (isEn && cleanText && /[\u0600-\u06FF]/.test(cleanText)) {
        cleanText = cleanText.replace(/[\u0600-\u06FF]/g, '').trim() || text;
    }

    // --- MEASURE TOP & BOTTOM FIXED BOUNDARIES ---
    const topSectionStartY = innerMargin + 50;
    const bismillahText = isEn 
        ? 'In the Name of Allah, the Entirely Merciful, the Especially Merciful' 
        : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

    let topSectionEndY = topSectionStartY + (isEn ? 32 : 56);
    if (cleanCategory) {
        topSectionEndY += 18 + 48; // badge height (48px)
    }
    topSectionEndY += 20;

    const footerStartY = height - innerMargin - 130; // y ~ 1734
    const availableMiddleSpace = footerStartY - topSectionEndY - 40; // ~ 1400px

    // Temporary measurement canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = 100;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.direction = isEn ? 'ltr' : 'rtl';

    const measureLinesHeight = (linesList: { text: string; isHighlight?: boolean; isBullet?: boolean }[], lh: number) => {
        let total = 0;
        for (const l of linesList) {
            total += !l.text ? lh * 0.45 : lh;
        }
        return total;
    };

    // Reserved vertical space for Title, Source, and Islamic Ornaments
    let reservedMiddleExtras = 0;
    if (cleanTitle) {
        reservedMiddleExtras += 56 + 24; // Title font + spacing
    }
    if (cleanSource) {
        reservedMiddleExtras += 36 + 24; // Divider + source
    }
    // Reserve minimum space for upper and lower Islamic motifs (at least 180px combined)
    const baseMotifsHeight = 200;
    reservedMiddleExtras += baseMotifsHeight;

    const maxAllowedTextHeight = Math.max(220, availableMiddleSpace - reservedMiddleExtras);

    // --- SUBSTANTIALLY ENLARGED FONT SIZES TO FILL CANVAS MAJESTICALLY ---
    const cleanLen = cleanText.replace(/<[^>]+>/g, '').length;
    let initialFontSize: number;

    if (cleanLen < 80) {
        initialFontSize = isEn ? 64 : 78;
    } else if (cleanLen < 170) {
        initialFontSize = isEn ? 54 : 66;
    } else if (cleanLen < 320) {
        initialFontSize = isEn ? 44 : 54;
    } else if (cleanLen < 600) {
        initialFontSize = isEn ? 36 : 42;
    } else if (cleanLen < 950) {
        initialFontSize = isEn ? 28 : 34;
    } else {
        initialFontSize = isEn ? 24 : 28;
    }

    let bodyFontSize = initialFontSize;
    let lineHeight = Math.round(bodyFontSize * (isEn ? 1.72 : 1.9));
    tempCtx.font = `600 ${bodyFontSize}px ${fontFamily}`;
    let lines = wrapText(tempCtx, cleanText, maxTextWidth);
    let textHeight = measureLinesHeight(lines, lineHeight);

    // If text overflows available height, iteratively scale down smoothly
    const minFontSize = isEn ? 18 : 20;
    while (textHeight > maxAllowedTextHeight && bodyFontSize > minFontSize) {
        bodyFontSize -= 1;
        lineHeight = Math.round(bodyFontSize * (isEn ? 1.62 : 1.76));
        tempCtx.font = `600 ${bodyFontSize}px ${fontFamily}`;
        lines = wrapText(tempCtx, cleanText, maxTextWidth);
        textHeight = measureLinesHeight(lines, lineHeight);
    }

    // Dynamic title and source sizes proportional to body font size
    const titleFontSize = Math.min(50, Math.max(30, Math.round(bodyFontSize * 0.95)));
    const sourceFontSize = Math.min(26, Math.max(18, Math.round(bodyFontSize * 0.58)));

    // Calculate actual middle text height (without drawings)
    let textAndTitleHeight = textHeight;
    if (cleanTitle) {
        textAndTitleHeight += titleFontSize + 28;
    }
    if (cleanSource) {
        textAndTitleHeight += 36 + sourceFontSize + 14;
    }

    // Calculate dynamic remaining space for Islamic Drawings before and after text!
    const remainingMiddleSpace = Math.max(120, availableMiddleSpace - textAndTitleHeight);
    // Divide remaining space harmoniously between upper motif and lower rosette
    const upperMotifHeight = Math.min(210, Math.max(70, Math.round(remainingMiddleSpace * 0.44)));
    const lowerRosetteHeight = Math.min(230, Math.max(80, Math.round(remainingMiddleSpace * 0.56)));

    const totalCalculatedMiddleHeight = textAndTitleHeight + upperMotifHeight + lowerRosetteHeight;
    const middleStartY = topSectionEndY + Math.max(15, Math.round((availableMiddleSpace - totalCalculatedMiddleHeight) / 2));

    // Create target canvas (Crisp 1080x1920)
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.direction = isEn ? 'ltr' : 'rtl';

    // --- PALETTE & JEWEL COLORS (LUXURIOUS ILLUMINATED ISLAMIC SCHEME) ---
    const goldPrimary = '#C59B27'; // 24k Royal Gold
    const goldBright = '#E6C665'; // Luminous Gold Highlight
    const goldDeep = '#996F16'; // Deep Antique Gold
    const emeraldPrimary = '#064E3B'; // Deep Quranic Emerald
    const emeraldAccent = '#0D5C3A'; // Vivid Islamic Green
    const textObsidian = '#13281E'; // Rich calligraphic kohl / Islamic deep ink

    // 1. Radiant Bright Luminous Islamic Parchment Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#FFFDF8'); // Pristine illuminated ivory top
    bgGrad.addColorStop(0.35, '#FAF4E4'); // Warm golden cream
    bgGrad.addColorStop(0.7, '#F7EDD5'); // Golden parchment
    bgGrad.addColorStop(1, '#F3E3C0'); // Rich luminous bottom
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Center Luminous Golden Sunburst Glow
    const centerGlow = ctx.createRadialGradient(width / 2, height * 0.48, 80, width / 2, height * 0.48, width * 0.78);
    centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    centerGlow.addColorStop(0.45, 'rgba(254, 243, 199, 0.55)');
    centerGlow.addColorStop(0.8, 'rgba(247, 230, 185, 0.25)');
    centerGlow.addColorStop(1, 'rgba(235, 214, 160, 0.05)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle Authentic Islamic Geometric Watermark Pattern (8-point stars tessellation)
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

    // 4. Outer & Inner Royal Gilded Multi-layered Frames
    // Outer golden frame
    ctx.strokeStyle = 'rgba(197, 155, 39, 0.75)';
    ctx.lineWidth = 3.5;
    drawRoundRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 38);
    ctx.stroke();

    // Outer thin pinstripe
    ctx.strokeStyle = 'rgba(230, 198, 101, 0.85)';
    ctx.lineWidth = 1.2;
    drawRoundRect(ctx, outerMargin + 7, outerMargin + 7, width - (outerMargin + 7) * 2, height - (outerMargin + 7) * 2, 32);
    ctx.stroke();

    // Inner card base with subtle silk shadow & gilded border
    ctx.fillStyle = 'rgba(255, 253, 247, 0.65)';
    ctx.strokeStyle = emeraldPrimary;
    ctx.lineWidth = 2.4;
    drawRoundRect(ctx, innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, 28);
    ctx.fill();
    ctx.stroke();

    // Inner thin golden foil
    ctx.strokeStyle = 'rgba(197, 155, 39, 0.65)';
    ctx.lineWidth = 1.4;
    drawRoundRect(ctx, innerMargin + 6, innerMargin + 6, width - (innerMargin + 6) * 2, height - (innerMargin + 6) * 2, 22);
    ctx.stroke();

    // Four Ornate Classical Islamic Corner Arabesques
    const cornerArabesqueSize = 75;
    drawIslamicCornerArabesque(ctx, innerMargin + 10, innerMargin + 10, cornerArabesqueSize, 1, 1, goldPrimary, emeraldPrimary);
    drawIslamicCornerArabesque(ctx, width - innerMargin - 10, innerMargin + 10, cornerArabesqueSize, -1, 1, goldPrimary, emeraldPrimary);
    drawIslamicCornerArabesque(ctx, innerMargin + 10, height - innerMargin - 10, cornerArabesqueSize, 1, -1, goldPrimary, emeraldPrimary);
    drawIslamicCornerArabesque(ctx, width - innerMargin - 10, height - innerMargin - 10, cornerArabesqueSize, -1, -1, goldPrimary, emeraldPrimary);

    // Classical Top Islamic Mihrab Arch crowning the card
    drawTopMihrabArch(ctx, innerMargin + 14, innerMargin + 18, width - (innerMargin + 14) * 2, 70, goldPrimary, emeraldPrimary);

    // 5. TOP SECTION: Bismillah & Category Badge
    let currentTopY = topSectionStartY;
    ctx.save();
    ctx.font = isEn ? `bold 22px ${fontFamily}` : `700 44px 'Amiri', 'Traditional Arabic', serif`;
    ctx.fillStyle = emeraldPrimary;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(197, 155, 39, 0.45)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillText(bismillahText, width / 2, currentTopY + (isEn ? 22 : 38));
    ctx.restore();

    currentTopY += isEn ? 38 : 62;

    // Category Badge (Ornate Illuminated Cartouche)
    if (cleanCategory) {
        ctx.font = `bold 22px ${fontFamily}`;
        const catMetrics = ctx.measureText(cleanCategory);
        const pillW = catMetrics.width + 68;
        const pillH = 46;
        const pillX = (width - pillW) / 2;

        // Cartouche Golden Background with Emerald Border
        const cartoucheGrad = ctx.createLinearGradient(pillX, currentTopY, pillX + pillW, currentTopY + pillH);
        cartoucheGrad.addColorStop(0, '#FDF8E8');
        cartoucheGrad.addColorStop(0.5, '#FFFBF0');
        cartoucheGrad.addColorStop(1, '#F8EFD4');
        ctx.fillStyle = cartoucheGrad;
        ctx.strokeStyle = goldPrimary;
        ctx.lineWidth = 2.2;
        drawRoundRect(ctx, pillX, currentTopY, pillW, pillH, 23);
        ctx.fill();
        ctx.stroke();

        // Inner fine emerald line
        ctx.strokeStyle = 'rgba(6, 78, 59, 0.45)';
        ctx.lineWidth = 1;
        drawRoundRect(ctx, pillX + 3, currentTopY + 3, pillW - 6, pillH - 6, 20);
        ctx.stroke();

        // Flanking mini-stars on badge ends
        drawIslamicStar(ctx, pillX + 16, currentTopY + pillH / 2, 6, 3, 8, goldPrimary);
        drawIslamicStar(ctx, pillX + pillW - 16, currentTopY + pillH / 2, 6, 3, 8, goldPrimary);

        ctx.fillStyle = emeraldPrimary;
        ctx.textAlign = 'center';
        ctx.fillText(cleanCategory, width / 2, currentTopY + 30);
    }

    // 6. MIDDLE SECTION: Layout
    let currentMiddleY = middleStartY;

    // Optional Title (if not identical to Category)
    if (cleanTitle) {
        ctx.save();
        ctx.font = `bold ${titleFontSize}px ${fontFamily}`;
        ctx.fillStyle = emeraldPrimary;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(197, 155, 39, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillText(cleanTitle, width / 2, currentMiddleY + titleFontSize * 0.88);
        ctx.restore();

        currentMiddleY += titleFontSize + 20;
    }

    // UPPER ISLAMIC DRAWING (الرسم والزخرفة الإسلامية العلوية قبل النص لتقليل الفراغ)
    const upperMotifCenterY = currentMiddleY + upperMotifHeight * 0.5;
    drawUpperIslamicMotif(ctx, width / 2, upperMotifCenterY, upperMotifHeight, goldPrimary, emeraldPrimary);
    currentMiddleY += upperMotifHeight;

    // 7. BODY TEXT: Dignified, Calligraphic, Enlarged, Crisp Kohl-Emerald
    ctx.direction = isEn ? 'ltr' : 'rtl';
    ctx.textAlign = 'center';

    for (const lineObj of lines) {
        if (!lineObj.text) {
            currentMiddleY += lineHeight * 0.45;
            continue;
        }

        ctx.save();
        if (lineObj.isHighlight) {
            ctx.font = `700 ${bodyFontSize + 2}px ${fontFamily}`;
            ctx.fillStyle = '#065F46'; // Vibrant Islamic Emerald for highlights
            ctx.shadowColor = 'rgba(6, 95, 70, 0.25)';
            ctx.shadowBlur = 5;
        } else if (lineObj.isBullet) {
            ctx.font = `600 ${bodyFontSize}px ${fontFamily}`;
            ctx.fillStyle = '#1E3A2B';
        } else {
            ctx.font = `600 ${bodyFontSize}px ${fontFamily}`;
            ctx.fillStyle = textObsidian;
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;
        ctx.fillText(lineObj.text, width / 2, currentMiddleY + bodyFontSize * 0.85);
        ctx.restore();

        currentMiddleY += lineHeight;
    }

    currentMiddleY += 16;

    // Source & Metadata (if provided)
    if (cleanSource) {
        // Delicate gilded divider bar
        ctx.strokeStyle = 'rgba(197, 155, 39, 0.55)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(horizontalContentPadding + 60, currentMiddleY);
        ctx.lineTo(width - horizontalContentPadding - 60, currentMiddleY);
        ctx.stroke();

        // Mini diamonds on divider ends
        ctx.fillStyle = goldPrimary;
        ctx.beginPath();
        ctx.arc(horizontalContentPadding + 60, currentMiddleY, 3, 0, Math.PI * 2);
        ctx.arc(width - horizontalContentPadding - 60, currentMiddleY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `bold ${sourceFontSize}px ${fontFamily}`;
        ctx.fillStyle = '#92400E'; // Rich warm antique gold for source
        ctx.textAlign = 'center';
        ctx.fillText(cleanSource, width / 2, currentMiddleY + sourceFontSize + 12);

        currentMiddleY += sourceFontSize + 26;
    }

    // LOWER ISLAMIC DRAWING (الرسم والزخرفة الإسلامية السفلية بعد النص والشمسة المذهبة لملء الفراغ)
    const lowerRosetteCenterY = currentMiddleY + lowerRosetteHeight * 0.5;
    drawLowerIslamicRosette(ctx, width / 2, lowerRosetteCenterY, lowerRosetteHeight, goldPrimary, emeraldPrimary);

    // 8. BOTTOM SECTION: Footer Brand (Grounded with Royal Golden Arch & Emerald Calligraphy)
    ctx.strokeStyle = goldPrimary;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, footerStartY);
    ctx.lineTo(width / 2 - 24, footerStartY);
    ctx.moveTo(width / 2 + 24, footerStartY);
    ctx.lineTo(width / 2 + 200, footerStartY);
    ctx.stroke();

    // Center star between footer lines
    drawIslamicStar(ctx, width / 2, footerStartY, 11, 5.5, 8, goldPrimary, emeraldPrimary, 1);

    const brandName = isEn 
        ? 'Mushaf Ahmed & Laila' 
        : 'مصحف أحمد و ليلى';

    const brandSubtitle = isEn
        ? 'Holy Quran & Daily Remembrance'
        : 'تلاوة وتدبر وسيرة نبوية';

    ctx.save();
    ctx.font = isEn ? `bold 28px ${fontFamily}` : `700 34px 'Amiri', 'Traditional Arabic', serif`;
    ctx.fillStyle = emeraldPrimary;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(197, 155, 39, 0.45)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;
    ctx.fillText(brandName, width / 2, footerStartY + 38);

    ctx.font = `600 18px ${fontFamily}`;
    ctx.fillStyle = '#854D0E'; // Burnished antique gold
    ctx.fillText(brandSubtitle, width / 2, footerStartY + 68);
    ctx.restore();

    return canvas;
}

/**
 * Universal high-reliability sharing function for cards and quotes
 */
export const shareAsImage = async ({ text, title, source, category, theme, isEn: explicitIsEn, language, setToastMessage }: ShareOptions) => {
    const isEn = explicitIsEn ?? (language === 'en' || !(/[\u0600-\u06FF]/.test(text || '')));

    if (setToastMessage) {
        setToastMessage(isEn ? 'Preparing high quality Islamic image...' : 'جاري تجهيز بطاقة إسلامية مذهبة بدقة عالية...');
    }

    try {
        const canvas = await renderCardToPureCanvas({
            text,
            title,
            source,
            category,
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage
        });

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

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
