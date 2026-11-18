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
    homeThemeVariant
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

  useEffect(() => {
    const checkModalState = () => {
      if (typeof document === 'undefined') return;
      const isOpen = Boolean(
        document.body.classList.contains('qr-modal-active') ||
        document.body.classList.contains('zoom-modal-active') ||
        document.body.classList.contains('modal-open') ||
        document.body.classList.contains('settings-modal-open') ||
        document.getElementById('home-screen-settings-modal') ||
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
    Boolean(document.getElementById('initial-boot-splash')) ||
    Boolean(document.getElementById('app-image-splash')) ||
    Boolean(document.getElementById('app-welcome-splash')) ||
    document.body.classList.contains('qr-modal-active') ||
    document.body.classList.contains('zoom-modal-active') ||
    document.body.classList.contains('modal-open') ||
    document.body.classList.contains('settings-modal-open') ||
    Boolean(document.getElementById('home-screen-settings-modal')) ||
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

  // 2. يظهر فقط فى الصفحة الرئيسية للتصميم الذكي
  if (effectivePage !== 'home') {
    return null;
  }

  // 3. تتغير ألوان وهيئة الزر حسب السمة النشطة في التصميم الذكي
  let buttonStyle: React.CSSProperties = {};
  let iconColor = '#FFFFFF';
  let buttonClasses = '';

  if (isNightMode) {
    buttonStyle = {
      background: 'linear-gradient(160deg, #27272a 0%, #18181b 55%, #09090b 100%)',
      border: 'none',
      boxShadow: '0 5px 0 #3f3f46, 0 12px 24px rgba(0, 0, 0, 0.85), 0 0 12px rgba(255, 255, 255, 0.2), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.38), inset 0 -2px 4px rgba(0, 0, 0, 0.65)',
    };
    iconColor = '#FFFFFF';
    buttonClasses = 'unified-3d-fab';
  } else {
    if (homeThemeVariant === 'sky') {
      buttonStyle = {
        background: 'linear-gradient(160deg, #0ea5e9 0%, #0284c7 55%, #0369a1 100%)',
        border: 'none',
        boxShadow: '0 5px 0 #075985, 0 12px 22px -2px rgba(2, 132, 199, 0.45), inset 0 2px 1.5px rgba(255, 255, 255, 0.5), inset 0 -2px 4px rgba(0, 0, 0, 0.18)',
      };
      iconColor = '#FFFFFF';
      buttonClasses = 'unified-3d-fab hover:brightness-105';
    } else if (homeThemeVariant === 'emerald') {
      buttonStyle = {
        background: 'linear-gradient(160deg, #10b981 0%, #059669 55%, #047857 100%)',
        border: 'none',
        boxShadow: '0 5px 0 #065f46, 0 12px 22px -2px rgba(5, 150, 105, 0.45), inset 0 2px 1.5px rgba(255, 255, 255, 0.5), inset 0 -2px 4px rgba(0, 0, 0, 0.18)',
      };
      iconColor = '#FFFFFF';
      buttonClasses = 'unified-3d-fab hover:brightness-105';
    } else if (homeThemeVariant === 'burgundy') {
      buttonStyle = {
        background: 'linear-gradient(160deg, #be123c 0%, #9f1239 55%, #881337 100%)',
        border: 'none',
        boxShadow: '0 5px 0 #4c0519, 0 12px 22px -2px rgba(136, 19, 55, 0.48), inset 0 2px 1.5px rgba(255, 255, 255, 0.45), inset 0 -2px 4px rgba(0, 0, 0, 0.22)',
      };
      iconColor = '#FFFFFF';
      buttonClasses = 'unified-3d-fab hover:brightness-105';
    } else {
      buttonStyle = {
        background: 'linear-gradient(160deg, #fbbf24 0%, #f59e0b 55%, #e08b08 100%)',
        border: 'none',
        boxShadow: '0 5px 0 #b45309, 0 12px 22px -2px rgba(217, 119, 6, 0.34), inset 0 2px 1.5px rgba(255, 255, 255, 0.62), inset 0 -2px 4px rgba(146, 64, 14, 0.14)',
      };
      iconColor = '#FFFFFF';
      buttonClasses = 'unified-3d-fab hover:brightness-105';
    }
  }

  // In Edit Mode, force visibility so user can drag it easily anywhere
  const isVisibleInDOM = editMode || visible;

  // Custom positioning style if user moved it, otherwise default dynamic safe-area bottom offset
  const containerStyle: React.CSSProperties = customPos ? {
    position: 'fixed',
    left: `${customPos.x}px`,
    top: `${customPos.y}px`,
    right: 'auto',
    bottom: 'auto',
    touchAction: editMode ? 'none' : 'auto',
  } : {
    bottom: 'calc(var(--app-bottom-clearance) + clamp(1rem, 2.5dvh, 1.5rem))',
    touchAction: editMode ? 'none' : 'auto',
  };

  const positionClasses = customPos 
    ? '' 
    : 'fixed start-5 sm:start-8';

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
          <div
            className="app-3d-badge border-0 absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full whitespace-nowrap pointer-events-none flex items-center gap-1 font-cairo"
            style={{
              boxShadow: '0 3px 0 #b45309, 0 6px 12px rgba(0, 0, 0, 0.35), inset 0 1.5px 1px rgba(255, 255, 255, 0.72)',
            }}
          >
            <span>اسحب</span>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(buttonElement, document.body);
};

export default ScrollToTopFAB;

