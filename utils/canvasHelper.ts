import html2canvas, { Options } from 'html2canvas';
import { QuranVerseAttachment } from '../services/communityService';

// Helper function to sanitize any CSS string from modern unsupported functions like oklab, oklch, color-mix
function sanitizeCssString(css: string): string {
  if (!css) return css;
  return css
    .replace(/oklab\([^)]+\)/gi, 'rgba(16, 185, 129, 0.9)')
    .replace(/oklch\([^)]+\)/gi, 'rgba(16, 185, 129, 0.9)')
    .replace(/color-mix\([^)]+\)/gi, 'rgba(16, 185, 129, 0.9)')
    .replace(/color\(display-p3[^)]+\)/gi, 'rgba(16, 185, 129, 0.9)')
    .replace(/color\([^)]+\)/gi, 'rgba(16, 185, 129, 0.9)');
}

export const safeHtml2Canvas = async (element: HTMLElement, options: Partial<Options> = {}): Promise<HTMLCanvasElement> => {
  const customOnClone = options.onclone;

  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    ...options,
    onclone: (clonedDoc, clonedEl) => {
      // 1. Sanitize all <style> tags in cloned document
      try {
        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((style) => {
          if (style.textContent) {
            style.textContent = sanitizeCssString(style.textContent);
          }
        });
      } catch (e) {}

      // 2. Inject override stylesheet to prevent letter-spacing on Arabic texts
      try {
        const overrideStyle = clonedDoc.createElement('style');
        overrideStyle.textContent = `
          * {
            letter-spacing: 0px !important;
            word-spacing: normal !important;
            font-feature-settings: "kern" 1, "liga" 1, "clig" 1, "calt" 1 !important;
            -webkit-font-smoothing: antialiased !important;
            text-rendering: optimizeLegibility !important;
          }
          .share-preview-text, p, span, div {
            letter-spacing: 0px !important;
          }
        `;
        clonedDoc.head.appendChild(overrideStyle);
      } catch (e) {}

      // 3. Sanitize all inline styles on all elements in cloned document
      try {
        const allEls = clonedDoc.getElementsByTagName('*');
        const colorProps = [
          'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
          'borderBottomColor', 'borderLeftColor', 'borderRightColor', 
          'outlineColor', 'fill', 'stroke', 'textDecorationColor', 'accentColor'
        ];

        for (let i = 0; i < allEls.length; i++) {
          const el = allEls[i] as HTMLElement;
          if (el.style) {
            // Fix letter spacing on cloned elements
            el.style.letterSpacing = '0px';
            el.style.wordSpacing = 'normal';

            colorProps.forEach((prop) => {
              const val = (el.style as any)[prop];
              if (val && typeof val === 'string') {
                if (val.includes('oklab') || val.includes('oklch') || val.includes('color-mix') || val.includes('color(')) {
                  (el.style as any)[prop] = sanitizeCssString(val);
                }
              }
            });

            // Also check background property if it has gradients with oklab/oklch
            if (el.style.backgroundImage && (el.style.backgroundImage.includes('oklab') || el.style.backgroundImage.includes('oklch'))) {
              el.style.backgroundImage = sanitizeCssString(el.style.backgroundImage);
            }
            if (el.style.background && (el.style.background.includes('oklab') || el.style.background.includes('oklch'))) {
              el.style.background = sanitizeCssString(el.style.background);
            }
          }
        }
      } catch (e) {}

      if (customOnClone) {
        customOnClone(clonedDoc, clonedEl);
      }
    }
  });
};

// High-reliability Pure Canvas Renderer for Quran Verse & Page Cards (Fixed 1080x1920 Story Resolution)
export function renderQuranCardToCanvas(verseData: QuranVerseAttachment): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1920; // Fixed 9:16 mobile story aspect ratio
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const isPage = verseData.shareType === 'page';

  // 1. Background
  if (isPage) {
    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(0, 0, width, height);
  } else {
    const bgVal = verseData.bgValue || '#ffffff';
    if (bgVal.startsWith('linear-gradient') || bgVal.startsWith('radial-gradient')) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (bgVal.includes('#064e3b') || bgVal.includes('#0f766e')) {
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(1, '#0f766e');
      } else if (bgVal.includes('#1e1b4b') || bgVal.includes('#312e81')) {
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(1, '#312e81');
      } else if (bgVal.includes('#fef3c7') || bgVal.includes('#fde68a')) {
        grad.addColorStop(0, '#fef3c7');
        grad.addColorStop(1, '#fde68a');
      } else if (bgVal.includes('#0f172a')) {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      } else {
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(1, '#047857');
      }
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgVal;
    }
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Borders & Ornate Frame
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';

  if (isPage) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, width - 60, height - 60);
  } else if (verseData.frameType && verseData.frameType !== 'none') {
    ctx.strokeStyle = verseData.frameColor || '#FFD700';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, width - 72, height - 72);
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, width - 104, height - 104);
  }

  // 3. Top Section Header
  let currentY = 140;
  if (isPage) {
    ctx.fillStyle = '#9A3412';
    ctx.font = 'bold 32px "Noto Naskh Arabic", "Traditional Arabic", Arial, sans-serif';
    const surahTitle = `صفحة مصحف - سورة ${verseData.surahName} (${verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${verseData.fromAyah} إلى ${verseData.toAyah}` : `آية ${verseData.ayahNumber}`})`;
    ctx.fillText(surahTitle, width / 2, currentY);

    currentY += 30;
    ctx.strokeStyle = '#E7E5E4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, currentY);
    ctx.lineTo(width - 120, currentY);
    ctx.stroke();
    currentY += 60;
  } else {
    ctx.fillStyle = verseData.textColor || '#000000';
    ctx.font = 'bold 36px "Amiri", "Amiri Quran", "Noto Naskh Arabic", serif';
    ctx.fillText('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', width / 2, currentY);
    currentY += 80;
  }

  const topHeaderEndY = currentY;
  const footerStartY = height - 140;
  const availableMiddleHeight = footerStartY - topHeaderEndY - 40; // ~1500px

  // 4. Dynamic Auto-Fit Typography for Verse Text
  const maxWidth = width - 180;
  const verseText = `﴿ ${verseData.text} ﴾`;
  const cleanLen = verseData.text.length;

  let fontSize = 64;
  if (cleanLen > 800) fontSize = 24;
  else if (cleanLen > 450) fontSize = 32;
  else if (cleanLen > 220) fontSize = 42;
  else if (cleanLen > 90) fontSize = 52;
  else fontSize = 66;

  let lineHeight = Math.round(fontSize * 1.85);

  const wrapWithFs = (fs: number) => {
    ctx.font = `bold ${fs}px "Amiri", "Amiri Quran", "Noto Naskh Arabic", serif`;
    const words = verseText.split(/\s+/);
    let curLine = '';
    const resultLines: string[] = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = curLine ? `${curLine} ${words[n]}` : words[n];
      if (ctx.measureText(testLine).width > maxWidth && curLine) {
        resultLines.push(curLine);
        curLine = words[n];
      } else {
        curLine = testLine;
      }
    }
    if (curLine) resultLines.push(curLine);
    return resultLines;
  };

  let lines = wrapWithFs(fontSize);
  while (lines.length * lineHeight > availableMiddleHeight && fontSize > 18) {
    fontSize -= 2;
    lineHeight = Math.round(fontSize * 1.75);
    lines = wrapWithFs(fontSize);
  }

  // Vertically center middle lines in available height
  const totalTextHeight = lines.length * lineHeight;
  currentY = topHeaderEndY + Math.max(20, Math.round((availableMiddleHeight - totalTextHeight) / 2));

  const textColor = isPage ? '#1C1917' : (verseData.textColor || '#000000');
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px "Amiri", "Amiri Quran", "Noto Naskh Arabic", serif`;

  for (let k = 0; k < lines.length; k++) {
    ctx.fillText(lines[k], width / 2, currentY + fontSize * 0.85);
    currentY += lineHeight;
  }

  // 5. Footer (Grounded at the bottom of 1080x1920)
  ctx.strokeStyle = isPage ? '#E7E5E4' : 'rgba(254, 240, 138, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(180, footerStartY);
  ctx.lineTo(width - 180, footerStartY);
  ctx.stroke();

  ctx.fillStyle = isPage ? '#78716C' : textColor;
  ctx.font = 'bold 28px "Noto Naskh Arabic", "Traditional Arabic", Arial, sans-serif';
  const footerText = isPage
    ? 'مصحف أحمد وليلى • صفحة قراءة'
    : `سورة ${verseData.surahName} (${verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${verseData.fromAyah} إلى ${verseData.toAyah}` : `آية ${verseData.ayahNumber}`}) • مصحف أحمد وليلى`;
  ctx.fillText(footerText, width / 2, footerStartY + 45);

  return canvas;
}
