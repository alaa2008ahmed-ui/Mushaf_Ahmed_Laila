import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ScrollToTopFABProps {
  currentPage?: string;
}

export const ScrollToTopFAB: React.FC<ScrollToTopFABProps> = ({ currentPage: propCurrentPage }) => {
  const { 
    isQuranPage, 
    currentPage: ctxCurrentPage, 
    isNightMode, 
    homeLayout: ctxHomeLayout, 
    theme, 
    themeKey 
  } = useTheme();

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Active home layout mode: 'classic' or 'modern'
  const [activeLayout, setActiveLayout] = useState<'classic' | 'modern'>(() => {
    try {
      const saved = localStorage.getItem('home_layout_system');
      if (saved === 'classic' || saved === 'modern') return saved;
      return (ctxHomeLayout === 'classic' ? 'classic' : 'modern');
    } catch {
      return 'modern';
    }
  });

  useEffect(() => {
    if (ctxHomeLayout === 'classic' || ctxHomeLayout === 'modern') {
      setActiveLayout(ctxHomeLayout as 'classic' | 'modern');
    }
  }, [ctxHomeLayout]);

  useEffect(() => {
    const handleLayoutChange = (e: any) => {
      const next = e?.detail;
      if (next === 'classic' || next === 'modern') {
        setActiveLayout(next);
      }
    };
    window.addEventListener('home-layout-changed', handleLayoutChange);
    return () => window.removeEventListener('home-layout-changed', handleLayoutChange);
  }, []);

  useEffect(() => {
    setMounted(true);

    const checkScrollPosition = () => {
      let maxScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // Check all possible scrollable containers in the page
      const scrollables = document.querySelectorAll(
        '.overflow-y-auto, [class*="overflow-y-auto"], .overflow-auto, [class*="overflow-auto"], #main-menu-scroll-container'
      );
      scrollables.forEach(el => {
        if (el.scrollTop > maxScroll) {
          maxScroll = el.scrollTop;
        }
      });

      setVisible(maxScroll > 70);
    };

    // Capture scroll events anywhere in the document
    const handleDocumentScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      let currentScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (target && target !== (document as any) && target.scrollTop !== undefined) {
        currentScroll = Math.max(currentScroll, target.scrollTop);
      }
      if (currentScroll > 70) {
        setVisible(true);
      } else {
        checkScrollPosition();
      }
    };

    // Custom scroll event from internal scroll containers
    const handleAppScroll = (e: any) => {
      const st = e.detail?.scrollTop ?? 0;
      if (st > 70) {
        setVisible(true);
      } else {
        checkScrollPosition();
      }
    };

    window.addEventListener('scroll', handleDocumentScroll, { passive: true });
    document.addEventListener('scroll', handleDocumentScroll, { passive: true, capture: true });
    window.addEventListener('app-scroll', handleAppScroll);

    return () => {
      window.removeEventListener('scroll', handleDocumentScroll);
      document.removeEventListener('scroll', handleDocumentScroll, { capture: true });
      window.removeEventListener('app-scroll', handleAppScroll);
    };
  }, []);

  const scrollToTop = () => {
    // 1. Scroll window and document elements
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }

    // 2. Scroll all scrollable elements in DOM
    const scrollables = document.querySelectorAll(
      '.overflow-y-auto, [class*="overflow-y-auto"], .overflow-auto, [class*="overflow-auto"], #main-menu-scroll-container'
    );
    scrollables.forEach(el => {
      try {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        el.scrollTop = 0;
      }
    });

    // 3. Dispatch custom event for components with direct container refs
    window.dispatchEvent(new CustomEvent('scroll-to-top'));

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }
  };

  if (!mounted || typeof document === 'undefined') return null;

  const effectivePage = propCurrentPage || ctxCurrentPage || 'home';

  // 1. لا يظهر نهائياً بصفحة القرآن الكريم
  const isQuran = 
    isQuranPage ||
    effectivePage === 'quran' || 
    effectivePage === 'quran-landscape' || 
    (typeof effectivePage === 'string' && effectivePage.startsWith('quran')) ||
    (typeof document !== 'undefined' && document.body.classList.contains('quran-context'));

  if (isQuran) {
    return null;
  }

  // 2. يظهر فقط فى التصميم الكلاسيكى والتصميم الذكى فقط (الصفحة الرئيسية لكلا التصميمين)
  if (effectivePage !== 'home') {
    return null;
  }

  // 3. تتغير ألوان وهيئة الزر بشكل منفصل بكل تصميم:
  // - فى التصميم الكلاسيكى: طبقاً للثيم المختار فى التصميم الكلاسيكى
  // - فى التصميم الذكى: طبقاً للوضع الليلى (أسود وذهبى) أو الوضع النهارى (ذهبى دافئ)
  let buttonStyle: React.CSSProperties = {};
  let iconColor = '#FFFFFF';
  let buttonClasses = '';

  if (activeLayout === 'modern') {
    // التصميم الذكي الحديث
    if (isNightMode) {
      // الوضع الليلي: أسود وذهبي غامق وفخم مع توهج ذهبي
      buttonStyle = {
        background: 'linear-gradient(145deg, #18181b 0%, #111111 60%, #09090b 100%)',
        border: '1.5px solid rgba(217, 119, 6, 0.85)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.85), 0 0 14px rgba(245, 158, 11, 0.35)',
      };
      iconColor = '#F59E0B';
      buttonClasses = 'hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]';
    } else {
      // الوضع النهاري: ثيم ذهبي دافئ مجسم يطابق أزرار التصميم الذكي
      buttonStyle = {
        background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
        border: '1.5px solid #F59E0B',
        boxShadow: '0 6px 18px rgba(180, 83, 9, 0.42), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
      };
      iconColor = '#FFFFFF';
      buttonClasses = 'hover:brightness-105';
    }
  } else {
    // التصميم الكلاسيكي: يتغير طبقاً للثيم المختار فى التصميم الكلاسيكى
    const isBlackTheme = themeKey === 'deep_black' || theme?.name === 'اسود' || (theme?.bgColor === '#000000' && !themeKey.includes('gold'));
    const isBlackGoldTheme = themeKey === 'black_gold';
    const isShinyGoldTheme = themeKey === 'shiny_gold';

    if (isBlackGoldTheme) {
      buttonStyle = {
        background: '#141414',
        border: '1.5px solid #D97706',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.8), 0 0 12px rgba(245, 158, 11, 0.3)',
      };
      iconColor = '#F59E0B';
    } else if (isBlackTheme) {
      buttonStyle = {
        background: '#111111',
        border: '1.5px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.7)',
      };
      iconColor = '#FFFFFF';
    } else if (isShinyGoldTheme) {
      buttonStyle = {
        background: 'linear-gradient(135deg, #EAB308 0%, #D97706 100%)',
        border: '1.5px solid #CA8A04',
        boxShadow: '0 6px 18px rgba(217, 119, 6, 0.35)',
      };
      iconColor = '#000000';
    } else {
      // أي ثيم كلاسيكي آخر (الافتراضي الأخضر، نور الفجر الأزرق، الزيتوني، البنفسجي، إلخ)
      const primaryColor = theme?.palette?.[0] || theme?.btnBg || theme?.accent || '#2E7D5E';
      const isDark = theme?.isDark;
      buttonStyle = {
        background: primaryColor,
        border: theme?.btnBorder && theme.btnBorder !== 'none' 
          ? theme.btnBorder 
          : (isDark ? '1.5px solid rgba(255, 255, 255, 0.3)' : '1.5px solid rgba(0, 0, 0, 0.12)'),
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
      };
      iconColor = theme?.btnText || (isDark ? '#FFFFFF' : '#FFFFFF');
    }
    buttonClasses = 'hover:scale-105';
  }

  const buttonElement = (
    <div
      className={`fixed bottom-20 start-5 sm:bottom-24 sm:start-8 z-[9999] transition-all duration-300 ease-out ${
        visible 
          ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' 
          : 'opacity-0 scale-75 pointer-events-none translate-y-3'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="العودة لأعلى الصفحة"
        title="العودة لأعلى الصفحة"
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer select-none outline-none transition-transform duration-150 active:scale-90 ${buttonClasses}`}
        style={buttonStyle}
      >
        <ArrowUp 
          className="w-5 h-5 stroke-[2.8] transition-colors duration-200" 
          style={{ color: iconColor }}
        />
      </button>
    </div>
  );

  return createPortal(buttonElement, document.body);
};

export default ScrollToTopFAB;
