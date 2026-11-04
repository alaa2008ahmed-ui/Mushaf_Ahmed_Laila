import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Move } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Preferences } from '@capacitor/preferences';

interface ScrollToTopFABProps {
  currentPage?: string;
  isEditMode?: boolean;
  isSplashActive?: boolean;
}

export const ScrollToTopFAB: React.FC<ScrollToTopFABProps> = ({ 
  currentPage: propCurrentPage,
  isEditMode: propIsEditMode,
  isSplashActive = false
}) => {
  const { 
    isQuranPage, 
    currentPage: ctxCurrentPage, 
    isNightMode, 
    homeLayout: ctxHomeLayout, 
    homeThemeVariant,
    theme, 
    themeKey 
  } = useTheme();

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);

  // Edit Mode state
  const [editMode, setEditMode] = useState<boolean>(propIsEditMode ?? false);

  // Custom position state in pixels { x, y }
  const [customPos, setCustomPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('fab_custom_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const customPosRef = useRef<{ x: number; y: number } | null>(customPos);
  useEffect(() => {
    customPosRef.current = customPos;
  }, [customPos]);

  // Load position from Capacitor Preferences on mount
  useEffect(() => {
    Preferences.get({ key: 'fab_custom_position' }).then(res => {
      if (res.value) {
        try {
          const parsed = JSON.parse(res.value);
          if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
            setCustomPos(parsed);
            try { localStorage.setItem('fab_custom_position', res.value); } catch {}
          }
        } catch {}
      }
    }).catch(() => {});
  }, []);

  // Sync propIsEditMode
  useEffect(() => {
    if (propIsEditMode !== undefined) {
      setEditMode(propIsEditMode);
    }
  }, [propIsEditMode]);

  // Listen to home-edit-mode-changed custom event
  useEffect(() => {
    const handleEditModeChange = (e: any) => {
      if (typeof e?.detail?.isEditMode === 'boolean') {
        setEditMode(e.detail.isEditMode);
      }
    };
    window.addEventListener('home-edit-mode-changed', handleEditModeChange);
    return () => window.removeEventListener('home-edit-mode-changed', handleEditModeChange);
  }, []);

  // Helper to persist position
  const savePosition = useCallback((pos: { x: number; y: number } | null) => {
    if (pos) {
      const str = JSON.stringify(pos);
      try { localStorage.setItem('fab_custom_position', str); } catch {}
      Preferences.set({ key: 'fab_custom_position', value: str }).catch(() => {});
    }
  }, []);

  // Listen to save-home-cards-layout event
  useEffect(() => {
    const handleSaveLayout = () => {
      if (customPosRef.current) {
        savePosition(customPosRef.current);
      }
    };
    window.addEventListener('save-home-cards-layout', handleSaveLayout);
    return () => window.removeEventListener('save-home-cards-layout', handleSaveLayout);
  }, [savePosition]);

  // Listen to reset-home-cards-layout event
  useEffect(() => {
    const handleResetLayout = () => {
      setCustomPos(null);
      try { localStorage.removeItem('fab_custom_position'); } catch {}
      Preferences.remove({ key: 'fab_custom_position' }).catch(() => {});
    };
    window.addEventListener('reset-home-cards-layout', handleResetLayout);
    return () => window.removeEventListener('reset-home-cards-layout', handleResetLayout);
  }, []);

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
    const checkModalState = () => {
      if (typeof document === 'undefined') return;
      const isOpen = Boolean(
        document.body.classList.contains('qr-modal-active') ||
        document.body.classList.contains('zoom-modal-active') ||
        document.body.classList.contains('modal-open') ||
        document.getElementById('share-app-qr-modal') ||
        document.getElementById('unified-event-zoom-modal-backdrop') ||
        document.querySelector('.fixed.inset-0.bg-black\\/65') ||
        document.querySelector('.fixed.inset-0.bg-black\\/60') ||
        document.querySelector('[class*="z-[140]"]') ||
        document.querySelector('[class*="z-[150]"]') ||
        document.querySelector('[class*="z-[200]"]')
      );
      setIsModalActive(isOpen);
    };

    checkModalState();

    const handleModalEvent = () => checkModalState();
    window.addEventListener('modal-state-changed', handleModalEvent);

    const observer = new MutationObserver(() => {
      checkModalState();
    });

    if (typeof document !== 'undefined') {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'id']
      });
    }

    return () => {
      window.removeEventListener('modal-state-changed', handleModalEvent);
      observer.disconnect();
    };
  }, []);

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

  // Dragging logic for Edit Mode
  const fabRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; fabX: number; fabY: number }>({ pointerX: 0, pointerY: 0, fabX: 0, fabY: 0 });
  const hasDraggedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();

    let initialX = customPos?.x;
    let initialY = customPos?.y;

    if (initialX === undefined || initialY === undefined) {
      if (fabRef.current) {
        const rect = fabRef.current.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
      } else {
        initialX = 20;
        initialY = window.innerHeight - 100;
      }
    }

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      fabX: initialX,
      fabY: initialY
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !editMode) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedRef.current = true;
    }

    const fabWidth = fabRef.current?.offsetWidth || 48;
    const fabHeight = fabRef.current?.offsetHeight || 48;

    const nextX = Math.max(10, Math.min(window.innerWidth - fabWidth - 10, dragStartRef.current.fabX + dx));
    const nextY = Math.max(10, Math.min(window.innerHeight - fabHeight - 10, dragStartRef.current.fabY + dy));

    const newPos = { x: nextX, y: nextY };
    setCustomPos(newPos);
    customPosRef.current = newPos;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (hasDraggedRef.current && customPosRef.current) {
      savePosition(customPosRef.current);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(20); } catch {}
      }
    }
  };

  const scrollToTop = () => {
    if (editMode && hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

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

  if (isSplashActive) {
    return null;
  }

  // 0. لا يظهر نهائياً إذا كانت شاشة البداية/الفيديو أو إحدى النوافذ المنبثقة مفتوحة
  const isCurrentlyModalOpen = isModalActive || (typeof document !== 'undefined' && (
    Boolean(document.getElementById('app-video-splash')) ||
    Boolean(document.getElementById('app-welcome-splash')) ||
    Boolean(document.querySelector('video[src*="splash"]')) ||
    document.body.classList.contains('qr-modal-active') ||
    document.body.classList.contains('zoom-modal-active') ||
    document.body.classList.contains('modal-open') ||
    Boolean(document.getElementById('share-app-qr-modal')) ||
    Boolean(document.getElementById('unified-event-zoom-modal-backdrop')) ||
    Boolean(document.querySelector('.fixed.inset-0.bg-black\\/65')) ||
    Boolean(document.querySelector('.fixed.inset-0.bg-black\\/60')) ||
    Boolean(document.querySelector('[class*="z-[140]"]')) ||
    Boolean(document.querySelector('[class*="z-[150]"]')) ||
    Boolean(document.querySelector('[class*="z-[200]"]'))
  ));

  if (isCurrentlyModalOpen) {
    return null;
  }

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
  let buttonStyle: React.CSSProperties = {};
  let iconColor = '#FFFFFF';
  let buttonClasses = '';

  if (activeLayout === 'modern') {
    // التصميم الذكي الحديث
    if (isNightMode) {
      // فى الثيم الاسود قم بتغيير لون الاطار والسهم الى اللون الابيض
      buttonStyle = {
        background: 'linear-gradient(145deg, #18181b 0%, #111111 60%, #09090b 100%)',
        border: '1.5px solid #FFFFFF',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.85), 0 0 14px rgba(255, 255, 255, 0.3)',
      };
      iconColor = '#FFFFFF';
      buttonClasses = 'hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]';
    } else {
      if (homeThemeVariant === 'sky') {
        buttonStyle = {
          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
          border: '1.5px solid #38BDF8',
          boxShadow: '0 6px 18px rgba(3, 105, 161, 0.42), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        };
        iconColor = '#FFFFFF';
        buttonClasses = 'hover:brightness-105';
      } else if (homeThemeVariant === 'emerald') {
        buttonStyle = {
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          border: '1.5px solid #34D399',
          boxShadow: '0 6px 18px rgba(4, 120, 87, 0.42), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        };
        iconColor = '#FFFFFF';
        buttonClasses = 'hover:brightness-105';
      } else if (homeThemeVariant === 'burgundy') {
        // فى الثيم العنابى قم بتغير لون الزر الى العنابى الغامق والسهم باللون الابيض
        buttonStyle = {
          background: 'linear-gradient(135deg, #881337 0%, #701a75 100%)',
          border: '1.5px solid #9f1239',
          boxShadow: '0 6px 18px rgba(136, 19, 55, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
        };
        iconColor = '#FFFFFF';
        buttonClasses = 'hover:brightness-105';
      } else {
        buttonStyle = {
          background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
          border: '1.5px solid #F59E0B',
          boxShadow: '0 6px 18px rgba(180, 83, 9, 0.42), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        };
        iconColor = '#FFFFFF';
        buttonClasses = 'hover:brightness-105';
      }
    }
  } else {
    // التصميم الكلاسيكي
    const isBlackTheme = isNightMode || themeKey === 'deep_black' || theme?.name === 'اسود' || (theme?.bgColor === '#000000' && !themeKey.includes('gold'));
    const isBlackGoldTheme = themeKey === 'black_gold';
    const isShinyGoldTheme = themeKey === 'shiny_gold';
    const isSkyTheme = themeKey === 'sky_mode';
    const isEmeraldTheme = themeKey === 'emerald_mode';
    const isBurgundyTheme = themeKey === 'burgundy_mode' || themeKey === 'burgundy' || theme?.name === 'العنابي';

    if (isBlackGoldTheme || isBlackTheme) {
      buttonStyle = {
        background: '#111111',
        border: '1.5px solid #FFFFFF',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.8), 0 0 12px rgba(255, 255, 255, 0.25)',
      };
      iconColor = '#FFFFFF';
    } else if (isShinyGoldTheme) {
      buttonStyle = {
        background: 'linear-gradient(135deg, #EAB308 0%, #D97706 100%)',
        border: '1.5px solid #CA8A04',
        boxShadow: '0 6px 18px rgba(217, 119, 6, 0.35)',
      };
      iconColor = '#FFFFFF';
    } else if (isSkyTheme) {
      buttonStyle = {
        background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        border: '1.5px solid #38BDF8',
        boxShadow: '0 6px 18px rgba(3, 105, 161, 0.42)',
      };
      iconColor = '#FFFFFF';
    } else if (isEmeraldTheme) {
      buttonStyle = {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        border: '1.5px solid #34D399',
        boxShadow: '0 6px 18px rgba(4, 120, 87, 0.42)',
      };
      iconColor = '#FFFFFF';
    } else if (isBurgundyTheme) {
      buttonStyle = {
        background: 'linear-gradient(135deg, #881337 0%, #701a75 100%)',
        border: '1.5px solid #9f1239',
        boxShadow: '0 6px 18px rgba(136, 19, 55, 0.45)',
      };
      iconColor = '#FFFFFF';
    } else {
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

  // In Edit Mode, force visibility so user can drag it easily anywhere
  const isVisibleInDOM = editMode || visible;

  // Custom positioning style if user moved it, otherwise default fixed CSS classes
  const containerStyle: React.CSSProperties = customPos ? {
    position: 'fixed',
    left: `${customPos.x}px`,
    top: `${customPos.y}px`,
    right: 'auto',
    bottom: 'auto',
    touchAction: editMode ? 'none' : 'auto',
  } : {
    touchAction: editMode ? 'none' : 'auto',
  };

  const positionClasses = customPos 
    ? '' 
    : 'fixed bottom-20 start-5 sm:bottom-24 sm:start-8';

  const buttonElement = (
    <div
      ref={fabRef}
      id="scroll-to-top-fab"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={containerStyle}
      className={`${positionClasses} z-[9999] transition-opacity duration-300 ease-out ${
        editMode ? 'cursor-grab active:cursor-grabbing select-none' : ''
      } ${
        isVisibleInDOM 
          ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' 
          : 'opacity-0 scale-75 pointer-events-none translate-y-3'
      }`}
    >
      <div className="relative group">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="العودة لأعلى الصفحة"
          title={editMode ? 'اسحب لتحريك الزر العائم' : 'العودة لأعلى الصفحة'}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center select-none outline-none transition-transform duration-150 active:scale-95 relative ${buttonClasses} ${
            editMode ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black/20 animate-pulse' : ''
          }`}
          style={buttonStyle}
        >
          {editMode ? (
            <Move 
              className="w-5 h-5 transition-colors duration-200 animate-bounce" 
              style={{ color: iconColor, stroke: iconColor }}
              color={iconColor}
            />
          ) : (
            <ArrowUp 
              className="w-5 h-5 stroke-[2.8] transition-colors duration-200" 
              style={{ color: iconColor, stroke: iconColor }}
              color={iconColor}
            />
          )}
        </button>

        {/* Drag handle tooltip in edit mode */}
        {editMode && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none flex items-center gap-1 font-cairo">
            <span>اسحب</span>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(buttonElement, document.body);
};

export default ScrollToTopFAB;

