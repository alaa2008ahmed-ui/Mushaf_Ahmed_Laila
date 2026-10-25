import html2canvas, { Options } from 'html2canvas';

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

