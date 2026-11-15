import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { APP_GLOBAL_TOAST_EVENT } from '../../utils/appNotificationSettings';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

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

  // Dynamic Theme Colors
  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود';
  const isDark = isNightMode || theme.isDark || isBlackTheme;

  let bg = isNightMode
    ? '#18181b'
    : isBlackTheme
    ? '#111111'
    : (theme.btnBg || theme.accent || theme.barBg || '#1e293b');

  let text = isNightMode
    ? '#f4f4f5'
    : isBlackTheme
    ? '#ffffff'
    : (theme.btnText || theme.accentText || '#ffffff');

  let border = isNightMode
    ? '1px solid rgba(255, 255, 255, 0.15)'
    : isBlackTheme
    ? '1px solid rgba(255, 255, 255, 0.25)'
    : (theme.btnBorder && theme.btnBorder !== 'none' ? theme.btnBorder : '1px solid rgba(255, 255, 255, 0.25)');

  // Fallback for white/transparent button backgrounds to preserve contrast with theme accent colors
  if (bg === '#FFFFFF' || bg === '#ffffff' || bg === 'transparent') {
    if (homeThemeVariant === 'sky' || themeKey === 'sky_mode') {
      bg = '#0284c7';
      text = '#ffffff';
      border = '1px solid #38bdf8';
    } else if (homeThemeVariant === 'emerald' || themeKey === 'emerald_mode') {
      bg = '#047857';
      text = '#ffffff';
      border = '1px solid #34d399';
    } else if (homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode') {
      bg = '#881337';
      text = '#ffffff';
      border = '1px solid #fb7185';
    } else if (homeThemeVariant === 'gold' || themeKey === 'shiny_gold') {
      bg = '#d97706';
      text = '#ffffff';
      border = '1px solid #f59e0b';
    } else {
      bg = '#1e293b';
      text = '#ffffff';
      border = '1px solid rgba(255, 255, 255, 0.2)';
    }
  }

  const resolvedBottom = bottomOffsetPx !== null
    ? `${bottomOffsetPx}px`
    : isElevatedToastPage
    ? 'calc(var(--app-safe-bottom) + clamp(4.5rem, 9dvh, 5.75rem))'
    : 'calc(var(--app-bottom-clearance) + clamp(1.25rem, 3dvh, 2rem))';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed left-1/2 -translate-x-1/2 z-[99999999] pointer-events-none px-3 flex justify-center animate-fadeIn max-w-[90vw]"
      style={{ bottom: resolvedBottom }}
    >
      <div 
        className="backdrop-blur-md rounded-full shadow-2xl px-4.5 py-2 flex items-center justify-center text-center text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300"
        style={{
          backgroundColor: bg,
          color: text,
          border: border
        }}
      >
        <span>{message}</span>
      </div>
    </div>
  );
};

export default GlobalAppToast;
