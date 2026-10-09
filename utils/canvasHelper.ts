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

// High-reliability Pure Canvas Renderer for Quran Verse & Page Cards
export function renderQuranCardToCanvas(verseData: QuranVerseAttachment): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const isPage = verseData.shareType === 'page';
  const minHeight = isPage ? 800 : 650;
  canvas.width = width;
  canvas.height = minHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  if (isPage) {
    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(0, 0, width, canvas.height);
  } else {
    const bgVal = verseData.bgValue || '#ffffff';
    if (bgVal.startsWith('linear-gradient') || bgVal.startsWith('radial-gradient')) {
      // Draw rich gradient
      const grad = ctx.createLinearGradient(0, 0, width, canvas.height);
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
    ctx.fillRect(0, 0, width, canvas.height);
  }

  // Border & Frame
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';

  if (isPage) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, width - 40, canvas.height - 40);
  } else if (verseData.frameType && verseData.frameType !== 'none') {
    ctx.strokeStyle = verseData.frameColor || '#FFD700';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, width - 60, canvas.height - 60);
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, width - 90, canvas.height - 90);
  }

  // Draw Header
  let currentY = 90;
  if (isPage) {
    ctx.fillStyle = '#9A3412';
    ctx.font = 'bold 26px "Noto Naskh Arabic", "Traditional Arabic", Arial, sans-serif';
    const surahTitle = `صفحة مصحف - سورة ${verseData.surahName} (${verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${verseData.fromAyah} إلى ${verseData.toAyah}` : `آية ${verseData.ayahNumber}`})`;
    ctx.fillText(surahTitle, width / 2, currentY);

    currentY += 25;
    ctx.strokeStyle = '#E7E5E4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, currentY);
    ctx.lineTo(width - 100, currentY);
    ctx.stroke();
    currentY += 50;
  } else {
    ctx.fillStyle = verseData.textColor || '#000000';
    ctx.font = 'bold 30px "Amiri", "Amiri Quran", "Noto Naskh Arabic", serif';
    ctx.fillText('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', width / 2, currentY);
    currentY += 60;
  }

  // Draw Verse Text with Word Wrap
  const textColor = isPage ? '#1C1917' : (verseData.textColor || '#000000');
  ctx.fillStyle = textColor;
  ctx.font = 'bold 36px "Amiri", "Amiri Quran", "Noto Naskh Arabic", serif';

  const verseText = `﴿ ${verseData.text} ﴾`;
  const words = verseText.split(' ');
  let line = '';
  const lines: string[] = [];
  const maxWidth = width - 180;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // If text is tall, resize canvas if needed
  const lineHeight = 65;
  const neededHeight = currentY + (lines.length * lineHeight) + 160;
  if (neededHeight > canvas.height) {
    // Redraw on larger canvas
    canvas.height = neededHeight;
    return renderQuranCardToCanvas(verseData);
  }

  for (let k = 0; k < lines.length; k++) {
    ctx.fillText(lines[k], width / 2, currentY);
    currentY += lineHeight;
  }

  // Draw Footer
  currentY += 30;
  ctx.strokeStyle = isPage ? '#E7E5E4' : 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, currentY);
  ctx.lineTo(width - 150, currentY);
  ctx.stroke();
  currentY += 45;

  ctx.fillStyle = isPage ? '#78716C' : textColor;
  ctx.font = 'bold 24px "Noto Naskh Arabic", "Traditional Arabic", Arial, sans-serif';
  const footerText = isPage
    ? 'مصحف احمد وليلي • صفحة قراءة'
    : `سورة ${verseData.surahName} (${verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${verseData.fromAyah} إلى ${verseData.toAyah}` : `آية ${verseData.ayahNumber}`}) • مصحف احمد وليلي`;
  ctx.fillText(footerText, width / 2, currentY);

  return canvas;
}
