import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface ShareOptions {
    text: string;
    title?: string;
    source?: string;
    category?: string;
    theme?: any;
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
function wrapArabicText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
): { text: string; isHighlight?: boolean; isBullet?: boolean }[] {
    const rawParagraphs = (text || '').split('\n');
    const result: { text: string; isHighlight?: boolean; isBullet?: boolean }[] = [];

    for (const rawParagraph of rawParagraphs) {
        const paragraph = rawParagraph.trim();
        if (!paragraph) {
            result.push({ text: '' }); // Empty spacing line
            continue;
        }

        const isHighlight = paragraph.startsWith('💡') || paragraph.startsWith('📜') || paragraph.startsWith('📖');
        const isBullet = paragraph.startsWith('•') || /^[0-9]+[.-]/.test(paragraph);

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
 * Pure Canvas 2D card renderer that completely eliminates Arabic text-overlap / scrambling bugs.
 * Renders at 1080px width (high definition), with native Arabic font ligatures,
 * golden ornamental frames, Islamic motifs, and immaculate typography.
 */
export async function renderCardToPureCanvas(options: ShareOptions): Promise<HTMLCanvasElement> {
    const { text, title, source, category, theme } = options;

    // Ensure fonts are ready
    try {
        await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 300))
        ]);
    } catch (e) {
        // Proceed with fallbacks
    }

    const width = 1080;
    const horizontalPadding = 75;
    const innerWidth = width - horizontalPadding * 2;

    // Typography sizing based on text volume
    const textLen = (text || '').length;
    let bodyFontSize = 28;
    let lineHeight = 48;

    if (textLen > 450) {
        bodyFontSize = 23;
        lineHeight = 39;
    } else if (textLen > 300) {
        bodyFontSize = 25;
        lineHeight = 43;
    } else if (textLen > 150) {
        bodyFontSize = 28;
        lineHeight = 48;
    } else {
        bodyFontSize = 32;
        lineHeight = 54;
    }

    // Temporary measurement context
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = 100;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.direction = 'rtl';
    tempCtx.font = `500 ${bodyFontSize}px 'Cairo', 'Amiri', 'Traditional Arabic', sans-serif`;

    const lines = wrapArabicText(tempCtx, text, innerWidth - 50);

    // Height calculations
    let calculatedHeight = 110; // Top margin & outer frame

    if (category) {
        calculatedHeight += 50;
    }

    if (title) {
        calculatedHeight += 85; // Title + divider
    }

    // Body lines
    for (const l of lines) {
        if (!l.text) {
            calculatedHeight += lineHeight * 0.45; // paragraph space
        } else {
            calculatedHeight += lineHeight;
        }
    }

    if (source) {
        calculatedHeight += 65; // Source pill / divider
    }

    calculatedHeight += 110; // Footer brand + bottom padding
    const finalHeight = Math.max(calculatedHeight, 680);

    // Create target canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = finalHeight;
    const ctx = canvas.getContext('2d')!;

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.direction = 'rtl';

    // Theme colors
    const primaryColor = theme?.palette?.[0] || '#064e3b';
    const secondaryColor = theme?.palette?.[1] || '#0f766e';

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, finalHeight);
    bgGrad.addColorStop(0, primaryColor);
    bgGrad.addColorStop(0.5, secondaryColor);
    bgGrad.addColorStop(1, '#062621'); // Deep rich bottom
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, finalHeight);

    // 2. Subtle Radial Glow in Center
    const glow = ctx.createRadialGradient(width / 2, finalHeight * 0.45, 50, width / 2, finalHeight * 0.45, width * 0.65);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glow.addColorStop(0.6, 'rgba(255, 255, 255, 0.03)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, finalHeight);

    // 3. Subtle Islamic Geometric Star Pattern Overlay
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const step = 42;
    for (let x = 20; x < width; x += step) {
        for (let y = 20; y < finalHeight; y += step) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();

    // 4. Outer & Inner Luxury Frames
    const outerMargin = 28;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    drawRoundRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, finalHeight - outerMargin * 2, 28);
    ctx.stroke();

    const innerMargin = 44;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)'; // Golden border
    ctx.lineWidth = 1.8;
    drawRoundRect(ctx, innerMargin, innerMargin, width - innerMargin * 2, finalHeight - innerMargin * 2, 22);
    ctx.fill();
    ctx.stroke();

    // Corner Ornaments
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.lineWidth = 2.5;
    const cornerSize = 22;
    const corners = [
        [innerMargin + 8, innerMargin + 8, 1, 1],
        [width - innerMargin - 8, innerMargin + 8, -1, 1],
        [innerMargin + 8, finalHeight - innerMargin - 8, 1, -1],
        [width - innerMargin - 8, finalHeight - innerMargin - 8, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * cornerSize);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * cornerSize, cy);
        ctx.stroke();
    }

    let currentY = innerMargin + 38;

    // 5. Category Badge (if provided)
    if (category) {
        ctx.font = "bold 17px 'Cairo', 'Amiri', sans-serif";
        const catMetrics = ctx.measureText(category);
        const pillW = catMetrics.width + 44;
        const pillH = 34;
        const pillX = (width - pillW) / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
        ctx.lineWidth = 1.2;
        drawRoundRect(ctx, pillX, currentY, pillW, pillH, 17);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText(category, width / 2, currentY + 23);
        currentY += 46;
    }

    // 6. Title (if provided)
    if (title) {
        ctx.save();
        ctx.font = "bold 34px 'Cairo', 'Amiri', sans-serif";
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillText(title, width / 2, currentY + 28);
        ctx.restore();

        currentY += 46;

        // Elegant Golden Divider with Center Diamond
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 180, currentY);
        ctx.lineTo(width / 2 - 16, currentY);
        ctx.moveTo(width / 2 + 16, currentY);
        ctx.lineTo(width / 2 + 180, currentY);
        ctx.stroke();

        // Diamond
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(width / 2, currentY - 6);
        ctx.lineTo(width / 2 + 6, currentY);
        ctx.lineTo(width / 2, currentY + 6);
        ctx.lineTo(width / 2 - 6, currentY);
        ctx.closePath();
        ctx.fill();

        currentY += 26;
    }

    // 7. Body Text (Clean Line by Line with Native Arabic Shaping)
    const textStartX = width - horizontalPadding - 25;
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';

    for (const lineObj of lines) {
        if (!lineObj.text) {
            currentY += lineHeight * 0.45;
            continue;
        }

        ctx.save();
        if (lineObj.isHighlight) {
            ctx.font = `bold ${bodyFontSize + 1}px 'Cairo', 'Amiri', sans-serif`;
            ctx.fillStyle = '#fef08a'; // Golden highlight for title-like headings (e.g. 💡 من أبرز الدروس)
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 4;
        } else if (lineObj.isBullet) {
            ctx.font = `500 ${bodyFontSize}px 'Cairo', 'Amiri', sans-serif`;
            ctx.fillStyle = '#f1f5f9';
        } else {
            ctx.font = `normal ${bodyFontSize}px 'Cairo', 'Amiri', sans-serif`;
            ctx.fillStyle = '#ffffff';
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.fillText(lineObj.text, textStartX, currentY + bodyFontSize * 0.85);
        ctx.restore();

        currentY += lineHeight;
    }

    currentY += 15;

    // 8. Source & Metadata
    if (source) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(horizontalPadding + 40, currentY);
        ctx.lineTo(width - horizontalPadding - 40, currentY);
        ctx.stroke();
        currentY += 24;

        ctx.font = "bold 18px 'Cairo', 'Amiri', sans-serif";
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.textAlign = 'center';
        ctx.fillText(source, width / 2, currentY);
        currentY += 22;
    }

    // 9. Footer Brand "مصحف أحمد وليلى"
    ctx.font = "bold 21px 'Cairo', 'Amiri', sans-serif";
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('مصحف أحمد وليلى • تلاوة وتدبر وسيرة نبوية', width / 2, finalHeight - innerMargin - 18);

    return canvas;
}

/**
 * Universal high-reliability sharing function for cards and quotes
 */
export const shareAsImage = async ({ text, title, source, category, theme, setToastMessage }: ShareOptions) => {
    if (setToastMessage) setToastMessage('جاري تجهيز الصورة بدقة عالية...');

    try {
        const canvas = await renderCardToPureCanvas({
            text,
            title,
            source,
            category,
            theme,
            setToastMessage
        });

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        if (!dataUrl || dataUrl === 'data:,') {
            throw new Error('Failed to generate image data');
        }

        // Share via Native Device Sheet or Web Share
        if (Capacitor.isNativePlatform()) {
            const fileName = `mus-share_${Date.now()}.jpg`;
            const base64Data = dataUrl.split(',')[1];

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache
            });

            await Share.share({
                title: title || 'مشاركة من تطبيق مصحف أحمد وليلى',
                url: savedFile.uri,
                dialogTitle: 'مشاركة البطاقة كصورة عبر'
            });
        } else if (navigator.share) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'mushaf_card.jpg', { type: 'image/jpeg' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: title || 'مصحف أحمد وليلى'
                    });
                } else {
                    await downloadFile(dataUrl, setToastMessage);
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.warn('Navigator share file failed, falling back to download', e);
                    await downloadFile(dataUrl, setToastMessage);
                }
            }
        } else {
            await downloadFile(dataUrl, setToastMessage);
        }

        if (setToastMessage) setToastMessage('تمت المشاركة بنجاح');
    } catch (err) {
        console.error('Share Error:', err);
        if (setToastMessage) {
            setToastMessage('فشلت المشاركة كصورة');
        }
    } finally {
        setTimeout(() => {
            if (setToastMessage) setToastMessage('');
        }, 2500);
    }
};

const downloadFile = async (dataUrl: string, setToastMessage?: (msg: string) => void) => {
    try {
        const link = document.createElement('a');
        link.download = `mushaf_share_${Date.now()}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (setToastMessage) setToastMessage('تم تنزيل الصورة بنجاح');
    } catch (e) {
        console.error('Download failed', e);
        if (setToastMessage) setToastMessage('فشل تنزيل الصورة');
    }
};
