import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';
import { APP_GLOBAL_TOAST_EVENT } from '../../utils/appNotificationSettings';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getToast3DStyles } from '../../utils/toast3DStyles';

export const GlobalAppToast: React.FC = () => {
  const { isRTL } = useLanguage();
  const { theme, themeKey, isNightMode, homeThemeVariant, isQuranPage, currentPage } = useTheme();
  const isElevatedToastPage =
    isQuranPage ||
    currentPage === 'prayer-times' ||
    currentPage === 'monthly-prayer-times' ||
    currentPage === 'prayer-calculation-settings' ||
    currentPage === 'prayer-calculation';
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [bottomOffsetPx, setBottomOffsetPx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeToastBottomOffset = useCallback((): number | null => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return null;

    const measureBar = (el: Element | null): number | null => {
      if (!el) return null;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') < 0.1) {
        return null;
      }
      const rect = el.getBoundingClientRect();
      if (rect.height <= 0 || rect.width <= rect.height) return null;
      if (rect.bottom < window.innerHeight - 40 || rect.top < window.innerHeight * 0.45) {
        return null;
      }
      if (rect.top >= window.innerHeight - 4) return null;

      const distFromBottom = window.innerHeight - rect.top;
      return Math.max(88, Math.round(distFromBottom + 14));
    };

    const modalBars = Array.from(document.querySelectorAll('[data-toast-bottom-bar="true"]'));
    for (let i = modalBars.length - 1; i >= 0; i--) {
      const offset = measureBar(modalBars[i]);
      if (offset !== null) return offset;
    }

    const bottomBar = document.getElementById('bottom-bar');
    const barOffset = measureBar(bottomBar);
    if (barOffset !== null) return barOffset;

    return null;
  }, []);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const msg = customEvent.detail?.message;
      if (!msg) return;

      // Format theme message: convert "تم تطبيق ثيم: X" -> "ثيم: X", "Theme applied: X" -> "Theme: X"
      const formatted = msg
        .replace(/^تم تطبيق ثيم:\s*/, 'ثيم: ')
        .replace(/^Theme applied:\s*/, 'Theme: ');

      setBottomOffsetPx(computeToastBottomOffset());
      setMessage(formatted);
      setVisible(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, 2500);
    };

    window.addEventListener(APP_GLOBAL_TOAST_EVENT, handleToast);
    return () => {
      window.removeEventListener(APP_GLOBAL_TOAST_EVENT, handleToast);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [computeToastBottomOffset]);

  useLayoutEffect(() => {
    if (!visible) return;
    const updateOffset = () => {
      setBottomOffsetPx(computeToastBottomOffset());
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, [visible, message, isElevatedToastPage, computeToastBottomOffset]);

  if (!visible || !message) return null;

  const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);

  const resolvedBottom = bottomOffsetPx !== null
    ? `${bottomOffsetPx}px`
    : isElevatedToastPage
    ? 'calc(var(--app-safe-bottom) + clamp(4.5rem, 9dvh, 5.75rem))'
    : 'calc(var(--app-bottom-clearance) + clamp(1.25rem, 3dvh, 2rem))';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed left-1/2 -translate-x-1/2 z-[99999999] pointer-events-none px-3 flex justify-center max-w-[92vw]"
      style={{ bottom: resolvedBottom }}
    >
      <div 
        className="app-3d-toast border-0 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-center text-xs sm:text-sm font-bold leading-normal break-words max-w-[88vw] w-max"
        style={toast3D.style}
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={toast3D.iconStyle}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default GlobalAppToast;
