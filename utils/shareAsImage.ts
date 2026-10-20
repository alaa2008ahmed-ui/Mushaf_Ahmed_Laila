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
            result.push({ text: '' }); // Empty spacing line
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

/**
 * Pure Canvas 2D card renderer that supports both Arabic and English seamlessly.
 * Dynamically adapts dimensions and height to content volume:
 * - Short text: Compact card with tight, balanced margins and ZERO empty void at bottom.
 * - Long text: Expands seamlessly to accommodate all paragraphs without truncation.
 * - Proportioned for mobile phones and tablets (1080px crisp high-DPI width).
 * When in English: LTR alignment, Latin typography, English brand name and references.
 * When in Arabic: RTL alignment, Amiri/Cairo font, Arabic brand name and references.
 */
export async function renderCardToPureCanvas(options: ShareOptions): Promise<HTMLCanvasElement> {
    const { text, title, source, category, theme, isEn: explicitIsEn, language } = options;

    const isEn = explicitIsEn ?? (language === 'en' || !(/[\u0600-\u06FF]/.test(text || '')));

    // Ensure fonts are ready
    try {
        await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 300))
        ]);
    } catch (e) {
        // Proceed with fallbacks
    }

    // --- EXACT VERTICAL SMARTPHONE SCREEN DIMENSIONS (9:16 / 1080x1920 for Stories, Status & Mobile Screens) ---
    const width = 1080;
    const height = 1920; // Fixed 9:16 ratio as requested
    const outerMargin = 30;
    const innerMargin = 52;
    // Comfortable reading column width
    const horizontalContentPadding = 120;
    const maxTextWidth = width - (horizontalContentPadding * 2);

    const fontFamily = isEn 
        ? "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        : "'Amiri', 'Cairo', 'Traditional Arabic', sans-serif";

    // Sanitize and ensure pure English when isEn is active
    let cleanCategory = category ? category.trim() : '';
    if (isEn && cleanCategory && /[\u0600-\u06FF]/.test(cleanCategory)) {
        cleanCategory = 'Remembrances & Supplications';
    }

    let cleanTitle = title ? title.trim() : '';
    if (isEn && cleanTitle && /[\u0600-\u06FF]/.test(cleanTitle)) {
        cleanTitle = 'Remembrance (Dhikr)';
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

    // --- MEASURE HEADER & FOOTER TO COMPUTE AVAILABLE MIDDLE VERTICAL SPACE ---
    // 1. Top Section (Bismillah + Category Badge)
    const bismillahText = isEn 
        ? 'In the Name of Allah, the Entirely Merciful, the Especially Merciful' 
        : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    const topSectionStartY = innerMargin + 42;
    let topSectionEndY = topSectionStartY + (isEn ? 28 : 46); // Bismillah height
    if (cleanCategory) {
        topSectionEndY += 20 + 40; // gap + badge height (40px)
    }
    topSectionEndY += 30; // safety margin below top section

    // 2. Bottom Section (Footer Brand)
    const footerStartY = height - innerMargin - 120; // Around y = 1748

    // 3. Available Vertical Space for Middle Section (Title + Body + Source)
    const availableMiddleSpace = footerStartY - topSectionEndY - 40; // ~1400px

    // Temporary measurement canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = 100;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.direction = isEn ? 'ltr' : 'rtl';

    // Helper to measure height of wrapped lines
    const measureLinesHeight = (linesList: { text: string; isHighlight?: boolean; isBullet?: boolean }[], lh: number) => {
        let total = 0;
        for (const l of linesList) {
            total += !l.text ? lh * 0.45 : lh;
        }
        return total;
    };

    // Calculate fixed reserved heights inside middle section (Title + Source)
    let reservedMiddleExtras = 0;
    if (cleanTitle) {
        reservedMiddleExtras += 54 + 20 + 20 + 36; // Title font (38px) + gap + diamond divider + gap
    }
    if (cleanSource) {
        reservedMiddleExtras += 30 + 16 + 32; // divider + gap + source font (22px)
    }

    const maxAllowedTextHeight = Math.max(200, availableMiddleSpace - reservedMiddleExtras - 30);

    // --- DYNAMIC INTELLIGENT AUTO-FIT TYPOGRAPHY ALGORITHM ---
    // Rule:
    // - Short text: enlarge font size (up to 68px in Arabic, 56px in English) with generous line-height
    //   so it comfortably commands the 1080x1920 canvas without leaving huge empty voids.
    // - Long text: scale font size down smoothly (step-by-step) so it fits completely within 1080x1920
    //   without any overflow or truncation.
    const cleanLen = cleanText.replace(/<[^>]+>/g, '').length;
    let initialFontSize: number;

    if (cleanLen < 70) {
        initialFontSize = isEn ? 56 : 66;
    } else if (cleanLen < 150) {
        initialFontSize = isEn ? 48 : 56;
    } else if (cleanLen < 300) {
        initialFontSize = isEn ? 40 : 46;
    } else if (cleanLen < 550) {
        initialFontSize = isEn ? 32 : 36;
    } else if (cleanLen < 900) {
        initialFontSize = isEn ? 26 : 30;
    } else {
        initialFontSize = isEn ? 22 : 25;
    }

    let bodyFontSize = initialFontSize;
    let lineHeight = Math.round(bodyFontSize * (isEn ? 1.7 : 1.9));
    tempCtx.font = `500 ${bodyFontSize}px ${fontFamily}`;
    let lines = wrapText(tempCtx, cleanText, maxTextWidth);
    let textHeight = measureLinesHeight(lines, lineHeight);

    // If text overflows available height, iteratively scale down until it fits
    const minFontSize = isEn ? 17 : 19;
    while (textHeight > maxAllowedTextHeight && bodyFontSize > minFontSize) {
        bodyFontSize -= 1;
        lineHeight = Math.round(bodyFontSize * (isEn ? 1.6 : 1.75));
        tempCtx.font = `500 ${bodyFontSize}px ${fontFamily}`;
        lines = wrapText(tempCtx, cleanText, maxTextWidth);
        textHeight = measureLinesHeight(lines, lineHeight);
    }

    // If text is small and takes up less than 40% of available space, iteratively scale up
    const maxFontSize = isEn ? 58 : 68;
    while (textHeight < maxAllowedTextHeight * 0.45 && bodyFontSize < maxFontSize) {
        const testFs = bodyFontSize + 2;
        const testLh = Math.round(testFs * (isEn ? 1.75 : 1.95));
        tempCtx.font = `500 ${testFs}px ${fontFamily}`;
        const testLines = wrapText(tempCtx, cleanText, maxTextWidth);
        const testHeight = measureLinesHeight(testLines, testLh);
        if (testHeight > maxAllowedTextHeight) break;
        bodyFontSize = testFs;
        lineHeight = testLh;
        lines = testLines;
        textHeight = testHeight;
    }

    // Dynamic title and source sizes proportional to body font size
    const titleFontSize = Math.min(46, Math.max(28, Math.round(bodyFontSize * 0.95)));
    const sourceFontSize = Math.min(24, Math.max(18, Math.round(bodyFontSize * 0.6)));

    // Calculate total middle height
    let totalMiddleHeight = 0;
    if (cleanTitle) {
        totalMiddleHeight += titleFontSize + 22 + 16 + 28;
    }
    totalMiddleHeight += textHeight;
    if (cleanSource) {
        totalMiddleHeight += 24 + 16 + sourceFontSize + 10;
    }

    // Vertically center middle section in available space!
    const middleStartY = topSectionEndY + Math.max(20, Math.round((availableMiddleSpace - totalMiddleHeight) / 2));

    // Create target canvas with EXACT 1080x1920 dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.direction = isEn ? 'ltr' : 'rtl';

    // Theme colors
    const primaryColor = theme?.palette?.[0] || '#064e3b';
    const secondaryColor = theme?.palette?.[1] || '#0f766e';

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, primaryColor);
    bgGrad.addColorStop(0.5, secondaryColor);
    bgGrad.addColorStop(1, '#062621'); // Deep rich bottom
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Radial Glow in Center of Vertical 9:16 Canvas
    const glow = ctx.createRadialGradient(width / 2, height * 0.5, 60, width / 2, height * 0.5, width * 0.85);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    glow.addColorStop(0.55, 'rgba(255, 255, 255, 0.04)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle Geometric Star Pattern Overlay
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    const step = 46;
    for (let x = 20; x < width; x += step) {
        for (let y = 20; y < height; y += step) {
            ctx.beginPath();
            ctx.arc(x, y, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();

    // 4. Outer & Inner Luxury Frames
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 2.4;
    drawRoundRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 36);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)'; // Golden border
    ctx.lineWidth = 2;
    drawRoundRect(ctx, innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, 28);
    ctx.fill();
    ctx.stroke();

    // Corner Ornaments
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = 2.8;
    const cornerSize = 28;
    const corners = [
        [innerMargin + 10, innerMargin + 10, 1, 1],
        [width - innerMargin - 10, innerMargin + 10, -1, 1],
        [innerMargin + 10, height - innerMargin - 10, 1, -1],
        [width - innerMargin - 10, height - innerMargin - 10, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * cornerSize);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * cornerSize, cy);
        ctx.stroke();
    }

    // 5. TOP SECTION: Bismillah & Category Badge
    let currentTopY = topSectionStartY;
    ctx.save();
    ctx.font = isEn ? `bold 18px ${fontFamily}` : `600 34px 'Amiri', 'Traditional Arabic', serif`;
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText(bismillahText, width / 2, currentTopY + (isEn ? 18 : 28));
    ctx.restore();

    currentTopY += isEn ? 32 : 50;

    if (cleanCategory) {
        ctx.font = `bold 19px ${fontFamily}`;
        const catMetrics = ctx.measureText(cleanCategory);
        const pillW = catMetrics.width + 56;
        const pillH = 40;
        const pillX = (width - pillW) / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)';
        ctx.lineWidth = 1.4;
        drawRoundRect(ctx, pillX, currentTopY, pillW, pillH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText(cleanCategory, width / 2, currentTopY + 26);
    }

    // 6. MIDDLE SECTION: Title & Elegant Divider
    let currentMiddleY = middleStartY;
    if (cleanTitle) {
        ctx.save();
        ctx.font = `bold ${titleFontSize}px ${fontFamily}`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;
        ctx.fillText(cleanTitle, width / 2, currentMiddleY + titleFontSize * 0.9);
        ctx.restore();

        currentMiddleY += titleFontSize + 20;

        // Elegant Golden Divider with Center Diamond
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 180, currentMiddleY);
        ctx.lineTo(width / 2 - 20, currentMiddleY);
        ctx.moveTo(width / 2 + 20, currentMiddleY);
        ctx.lineTo(width / 2 + 180, currentMiddleY);
        ctx.stroke();

        // Center Diamond
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(width / 2, currentMiddleY - 7);
        ctx.lineTo(width / 2 + 7, currentMiddleY);
        ctx.lineTo(width / 2, currentMiddleY + 7);
        ctx.lineTo(width / 2 - 7, currentMiddleY);
        ctx.closePath();
        ctx.fill();

        currentMiddleY += 32;
    }

    // 7. MIDDLE SECTION: Body Text (Auto-fitted with high legibility)
    ctx.direction = isEn ? 'ltr' : 'rtl';
    ctx.textAlign = 'center';

    for (const lineObj of lines) {
        if (!lineObj.text) {
            currentMiddleY += lineHeight * 0.45;
            continue;
        }

        ctx.save();
        if (lineObj.isHighlight) {
            ctx.font = `bold ${bodyFontSize + 1}px ${fontFamily}`;
            ctx.fillStyle = '#fef08a';
            ctx.shadowColor = 'rgba(0,0,0,0.45)';
            ctx.shadowBlur = 6;
        } else if (lineObj.isBullet) {
            ctx.font = `500 ${bodyFontSize}px ${fontFamily}`;
            ctx.fillStyle = '#f1f5f9';
        } else {
            ctx.font = `500 ${bodyFontSize}px ${fontFamily}`;
            ctx.fillStyle = '#ffffff';
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 6;
        ctx.fillText(lineObj.text, width / 2, currentMiddleY + bodyFontSize * 0.85);
        ctx.restore();

        currentMiddleY += lineHeight;
    }

    currentMiddleY += 20;

    // 8. MIDDLE SECTION: Source & Metadata (if provided)
    if (cleanSource) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(horizontalContentPadding + 30, currentMiddleY);
        ctx.lineTo(width - horizontalContentPadding - 30, currentMiddleY);
        ctx.stroke();

        ctx.font = `bold ${sourceFontSize}px ${fontFamily}`;
        ctx.fillStyle = 'rgba(254, 240, 138, 0.95)';
        ctx.textAlign = 'center';
        ctx.fillText(cleanSource, width / 2, currentMiddleY + sourceFontSize + 10);
    }

    // 9. BOTTOM SECTION: Footer Brand (Grounded at the bottom of the 1080x1920 canvas)
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 180, footerStartY);
    ctx.lineTo(width / 2 + 180, footerStartY);
    ctx.stroke();

    const brandName = isEn 
        ? 'Mushaf Ahmed & Laila' 
        : 'مصحف أحمد وليلى';

    const brandSubtitle = isEn
        ? 'Holy Quran & Daily Remembrance'
        : 'تلاوة وتدبر وسيرة نبوية';

    ctx.save();
    ctx.font = `bold 28px ${fontFamily}`;
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 8;
    ctx.fillText(brandName, width / 2, footerStartY + 34);

    ctx.font = `500 16px ${fontFamily}`;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.fillText(brandSubtitle, width / 2, footerStartY + 64);
    ctx.restore();

    return canvas;
}

/**
 * Universal high-reliability sharing function for cards and quotes
 */
export const shareAsImage = async ({ text, title, source, category, theme, isEn: explicitIsEn, language, setToastMessage }: ShareOptions) => {
    const isEn = explicitIsEn ?? (language === 'en' || !(/[\u0600-\u06FF]/.test(text || '')));

    if (setToastMessage) {
        setToastMessage(isEn ? 'Preparing high quality image...' : 'جاري تجهيز الصورة بدقة عالية...');
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

        const shareTitle = title || (isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد وليلى');
        const shareDialogTitle = isEn ? 'Share Image via' : 'مشاركة البطاقة كصورة عبر';
        const shareFileName = isEn ? `ahmed_layla_card_${Date.now()}.jpg` : `mus-share_${Date.now()}.jpg`;
        const shareText = isEn 
            ? `${shareTitle}\nMushaf Ahmed & Laila • Holy Quran & Daily Remembrance`
            : `${shareTitle}\nمصحف أحمد وليلى • تلاوة وتدبر وسيرة نبوية`;

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
