import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface PropheticLineageShareOptions {
    fullName: string;
    shortChain: string;
    fullText: string;
    motherFullName?: string;
    motherDetails?: string;
    hadithQuote?: string;
    hadithSource?: string;
    setToastMessage?: (msg: string) => void;
}

// Draw rounded rectangle
function drawRoundedRect(
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

// Draw an 8-pointed Islamic Star at (cx, cy)
function drawIslamicStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number) {
    const points = 16;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / 8 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}

// Wrap Arabic text cleanly into lines
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = (text || '').trim().split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

/**
 * Creates an exquisite, museum-grade royal Islamic artwork exclusively for the Noble Prophetic Lineage Card ﷺ.
 */
export async function renderPropheticLineagePoster(options: PropheticLineageShareOptions): Promise<HTMLCanvasElement> {
    try {
        await Promise.race([
            document.fonts.ready,
            new Promise(resolve => setTimeout(resolve, 350))
        ]);
    } catch (e) {
        // proceed
    }

    const width = 1080;
    const height = 1920; // Exact 9:16 vertical smartphone screen resolution
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.direction = 'rtl';

    // 1. Base Gradient Background (Deep Royal Velvet Emerald & Midnight Obsidian)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#021811');
    bgGrad.addColorStop(0.25, '#042e22');
    bgGrad.addColorStop(0.5, '#063b2c');
    bgGrad.addColorStop(0.8, '#03261c');
    bgGrad.addColorStop(1, '#01120d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Heavenly Golden Radial Glow behind the Holy Name
    const haloGrad = ctx.createRadialGradient(width / 2, 280, 20, width / 2, 280, 520);
    haloGrad.addColorStop(0, 'rgba(255, 223, 115, 0.26)');
    haloGrad.addColorStop(0.35, 'rgba(212, 175, 55, 0.12)');
    haloGrad.addColorStop(0.7, 'rgba(6, 66, 50, 0.05)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle Islamic Geometric Lattice Pattern (translucent gold rosettes)
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
    ctx.lineWidth = 1;
    const latticeStep = 60;
    for (let x = 0; x < width + latticeStep; x += latticeStep) {
        for (let y = 0; y < height + latticeStep; y += latticeStep) {
            ctx.strokeRect(x - 25, y - 25, 50, 50);
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 223, 115, 0.06)';
            ctx.fill();
        }
    }
    ctx.restore();

    // 4. Gold Gradient Helper
    const goldGrad = ctx.createLinearGradient(0, 0, width, 0);
    goldGrad.addColorStop(0, '#C59A3F');
    goldGrad.addColorStop(0.2, '#E2C275');
    goldGrad.addColorStop(0.5, '#FFF2BF');
    goldGrad.addColorStop(0.8, '#E2C275');
    goldGrad.addColorStop(1, '#C59A3F');

    // 5. Dual Royal Islamic Arabesque Frames
    const outerMargin = 32;
    const innerMargin = 48;

    // Outer solid gold frame
    ctx.save();
    ctx.strokeStyle = 'rgba(226, 194, 117, 0.85)';
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 32);
    ctx.stroke();

    // Inner thin dashed/ornate frame
    ctx.strokeStyle = 'rgba(255, 241, 184, 0.5)';
    ctx.lineWidth = 1.4;
    drawRoundedRect(ctx, innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, 24);
    ctx.stroke();

    // Corner Ornaments: 8-Point Stars & Floral Accents
    const cornerStars = [
        { x: innerMargin + 6, y: innerMargin + 6 },
        { x: width - innerMargin - 6, y: innerMargin + 6 },
        { x: innerMargin + 6, y: height - innerMargin - 6 },
        { x: width - innerMargin - 6, y: height - innerMargin - 6 }
    ];
    for (const c of cornerStars) {
        ctx.fillStyle = goldGrad;
        drawIslamicStar(ctx, c.x, c.y, 18, 8);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }
    ctx.restore();

    // 6. Header: Bismillah in Calligraphic Gold
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "600 34px 'Amiri', 'Amiri Quran', 'Traditional Arabic', serif";
    ctx.fillStyle = goldGrad;
    ctx.shadowColor = 'rgba(255, 223, 115, 0.6)';
    ctx.shadowBlur = 14;
    ctx.fillText('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', width / 2, 98);
    ctx.restore();

    // 7. Decorative Crown Medallion Banner (مطابق لنص بطاقة النسب: النسب الشريف المصطفى وخاتم الأنبياء)
    ctx.save();
    const ribbonW = 560;
    const ribbonH = 48;
    const ribbonX = (width - ribbonW) / 2;
    const ribbonY = 142;

    ctx.fillStyle = 'rgba(4, 34, 25, 0.92)';
    drawRoundedRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(226, 194, 117, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "bold 19px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = '#FFECA0';
    ctx.fillText('👑  النَّسَبُ الشَّرِيفُ المُصْطَفَى وَخَاتَمُ الأَنْبِيَاءِ ﷺ  👑', width / 2, ribbonY + ribbonH / 2);
    ctx.restore();

    // 8. Main Focal Title: «سَيِّدُنَا وَمَوْلَانَا مُحَمَّدٌ رَسُولُ اللهِ ﷺ»
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "bold 46px 'Amiri', 'Amiri Quran', serif";
    ctx.fillStyle = goldGrad;
    ctx.shadowColor = 'rgba(255, 241, 184, 0.8)';
    ctx.shadowBlur = 22;
    ctx.fillText(options.fullName ? `سَيِّدُنَا ${options.fullName}` : 'سَيِّدُنَا وَمَوْلَانَا مُحَمَّدٌ رَسُولُ اللهِ ﷺ', width / 2, 246);

    // Subtitle Pill
    ctx.shadowBlur = 0;
    ctx.font = "bold 19px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = '#A7F3D0'; // soft mint emerald
    ctx.fillText('خَاتَمُ الأَنْبِيَاءِ وَالمُرْسَلِينَ • سَيِّدُ وَلَدِ آدَمَ • خِيَارٌ مِنْ خِيَارٍ', width / 2, 300);
    ctx.restore();

    // Decorative divider under title
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 220, 335);
    ctx.lineTo(width / 2 + 220, 335);
    ctx.stroke();

    ctx.fillStyle = goldGrad;
    drawIslamicStar(ctx, width / 2, 335, 10, 4.5);
    ctx.fill();
    ctx.restore();

    // Common container style helper
    const drawCard = (x: number, y: number, w: number, h: number, borderAlpha = 0.7) => {
        ctx.save();
        ctx.fillStyle = 'rgba(3, 26, 19, 0.82)';
        drawRoundedRect(ctx, x, y, w, h, 24);
        ctx.fill();

        ctx.strokeStyle = `rgba(226, 194, 117, ${borderAlpha})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Inner soft highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, x + 4, y + 4, w - 8, h - 8, 20);
        ctx.stroke();
        ctx.restore();
    };

    const contentWidth = 920;
    const contentX = (width - contentWidth) / 2;

    // 9. Card 1: عَمُودُ النَّسَبِ الشَّرِيفِ الأَقْرَبُ
    let currentY = 375;
    const card1H = 460;
    drawCard(contentX, currentY, contentWidth, card1H, 0.85);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Header badge inside Card 1
    const badgeW = 460;
    const badgeH = 42;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
    drawRoundedRect(ctx, (width - badgeW) / 2, currentY + 22, badgeW, badgeH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(226, 194, 117, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = "bold 20px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = '#FFE680';
    ctx.fillText('✨  عَمُودُ النَّسَبِ الشَّرِيفِ الأَقْرَبُ إِلَى عَدْنَان  ✨', width / 2, currentY + 31);

    // Short chain lines - large, elegant, and readable
    ctx.font = "bold 28px 'Amiri', 'Amiri Quran', serif";
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 10;
    const shortChainLines = wrapText(ctx, options.shortChain, contentWidth - 70);
    let scY = currentY + 90;
    for (const line of shortChainLines) {
        ctx.fillText(line, width / 2, scY);
        scY += 50;
    }
    ctx.restore();

    // 10. Card 2: سِلْسِلَةُ الأَجْدَادِ المُتَّصِلَةِ وُصُولاً إِلَى إِسْمَاعِيلَ وَإِبْرَاهِيمَ عَلَيْهِمَا السَّلَام
    currentY += card1H + 34;
    const card2H = 760;
    drawCard(contentX, currentY, contentWidth, card2H, 0.8);

    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    // Header Badge inside Card 2
    ctx.font = "bold 23px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = '#34D399'; // Emerald mint
    ctx.fillText('📌 سِلْسِلَةُ الأَجْدَادِ المُتَّصِلَةِ وُصُولاً إِلَى إِسْمَاعِيلَ وَإِبْرَاهِيمَ عَلَيْهِمَا السَّلَام:', contentX + contentWidth - 34, currentY + 28);

    // Full text lines
    ctx.font = "500 27px 'Amiri', 'Cairo', serif";
    ctx.fillStyle = '#E6F4EA';
    const fullChainLines = wrapText(ctx, options.fullText, contentWidth - 68);
    let fcY = currentY + 84;
    for (const line of fullChainLines) {
        ctx.fillText(line, contentX + contentWidth - 34, fcY);
        fcY += 50;
    }

    // Ibrahim & Ismail highlight pill
    const ibrahimY = currentY + card2H - 96;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
    drawRoundedRect(ctx, contentX + 24, ibrahimY, contentWidth - 48, 64, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = "bold 20px 'Cairo', 'Amiri', sans-serif";
    ctx.fillStyle = '#FDE68A';
    ctx.fillText('🌱  مِنْ وُلْدِ إِسْمَاعِيلَ (ذَبِيحِ الله) بْنِ إِبْرَاهِيمَ (خَلِيلِ الرَّحْمَن) عَلَيْهِمَا أَزْكَى الصَّلَاةِ وَالسَّلَام  🌱', width / 2, ibrahimY + 32);
    ctx.restore();

    // 11. Footer: Salawat & App Seal
    const footerY = height - 128;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = "bold 28px 'Amiri', 'Amiri Quran', serif";
    ctx.fillStyle = goldGrad;
    ctx.shadowColor = 'rgba(255, 241, 184, 0.65)';
    ctx.shadowBlur = 12;
    ctx.fillText('صَلَّى اللهُ عَلَيْهِ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيماً كَثِيراً', width / 2, footerY);

    ctx.shadowBlur = 0;
    ctx.font = "bold 18px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('مُصْحَفُ أَحْمَدَ وَلَيْلَى  •  صَدَقَةٌ جَارِيَةٌ لِأُمَّتِنَا الإِسْلَامِيَّة', width / 2, footerY + 44);
    ctx.restore();

    return canvas;
}

/**
 * Universal Native & Web sharing engine for the Noble Prophetic Lineage Image
 */
export async function sharePropheticLineageImage(options: PropheticLineageShareOptions): Promise<void> {
    if (options.setToastMessage) {
        options.setToastMessage('جاري إعداد اللوحة الشريفة للنسب النبوي بدقة فائقة...');
    }

    try {
        const canvas = await renderPropheticLineagePoster(options);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.96);

        if (!dataUrl || dataUrl === 'data:,') {
            throw new Error('Canvas toDataURL returned empty data');
        }

        const shareTitle = 'النسب النبوي الشريف لسيدنا ومولانا رسول الله ﷺ';

        if (Capacitor.isNativePlatform()) {
            const fileName = `prophetic_lineage_${Date.now()}.jpg`;
            const base64Data = dataUrl.split(',')[1];

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache
            });

            await Share.share({
                title: shareTitle,
                text: `${options.fullName}\n${options.shortChain}\n\nمشارك من تطبيق مصحف أحمد وليلى`,
                url: savedFile.uri,
                dialogTitle: 'مشاركة لوحة النسب النبوي الشريف عبر'
            });
        } else if (navigator.share) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'prophetic_lineage.jpg', { type: 'image/jpeg' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: shareTitle,
                        text: `${options.fullName}\n${options.shortChain}`
                    });
                } else {
                    downloadPoster(dataUrl, options.setToastMessage);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.warn('Navigator share file failed, falling back to download', err);
                    downloadPoster(dataUrl, options.setToastMessage);
                }
            }
        } else {
            downloadPoster(dataUrl, options.setToastMessage);
        }

        if (options.setToastMessage) {
            options.setToastMessage('تمت مشاركة لوحة النسب الشريف بنجاح');
        }
    } catch (error) {
        console.error('Error sharing prophetic lineage poster:', error);
        if (options.setToastMessage) {
            options.setToastMessage('تعذر إعداد ومشاركة لوحة النسب الشريف');
        }
    } finally {
        setTimeout(() => {
            if (options.setToastMessage) options.setToastMessage('');
        }, 2800);
    }
}

function downloadPoster(dataUrl: string, setToastMessage?: (msg: string) => void) {
    try {
        const link = document.createElement('a');
        link.download = `prophetic_lineage_${Date.now()}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (setToastMessage) setToastMessage('تم تنزيل لوحة النسب الشريف بدقة عالية بنجاح');
    } catch (e) {
        console.error('Download failed', e);
        if (setToastMessage) setToastMessage('فشل تنزيل الصورة');
    }
}
