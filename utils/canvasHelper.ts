import html2canvas, { Options } from 'html2canvas';

export const safeHtml2Canvas = async (element: HTMLElement, options: Partial<Options> = {}): Promise<HTMLCanvasElement> => {
  const customOnClone = options.onclone;

  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    ...options,
    onclone: (clonedDoc, clonedEl) => {
      // Sanitize all <style> tags in cloned document to remove unsupported oklch color functions from Tailwind v4
      const styleElements = clonedDoc.querySelectorAll('style');
      styleElements.forEach((style) => {
        if (style.textContent && style.textContent.includes('oklch')) {
          style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, 'rgba(0,0,0,0.1)');
        }
      });

      // Sanitize any remaining inline styles on cloned elements
      const allEls = clonedDoc.getElementsByTagName('*');
      for (let i = 0; i < allEls.length; i++) {
        const el = allEls[i] as HTMLElement;
        if (el.style) {
          ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'].forEach((prop) => {
            const val = (el.style as any)[prop];
            if (val && typeof val === 'string' && val.includes('oklch')) {
              (el.style as any)[prop] = '#10b981';
            }
          });
        }
      }

      if (customOnClone) {
        customOnClone(clonedDoc, clonedEl);
      }
    }
  });
};
