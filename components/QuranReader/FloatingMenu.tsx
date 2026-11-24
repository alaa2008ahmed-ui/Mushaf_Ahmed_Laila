import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Search,
  Globe,
  Compass,
  Bookmark,
  BookText,
  Settings,
  X,
  Info,
  Type,
  Check,
  ChevronLeft,
  BookOpen,
  Menu,
  GitCompare,
} from "lucide-react";
import {
  FONTS,
  ENGLISH_FONTS,
  FONT_NAMES_EN,
  JUZ_MAP,
  SURAH_NAMES_AR,
  SURAH_NAMES_EN,
  SAJDAH_LOCATIONS,
  toArabic,
  isDarkQuranTheme,
  ReadingMode,
} from "./constants";
import { useLanguage } from "../../context/LanguageContext";
import { QuranSpotlightGuide, getQuranGuideSeen } from "./QuranSpotlightGuide";
import { QURAN_SIDEBAR_STEPS, MADINAH_SIDEBAR_STEPS } from "./quranGuideSteps";
import { useShowPageGuides } from "../../utils/guideManager";

interface FloatingMenuProps {
  page: string;
  isFloatingMenuOpen: boolean;
  floatingMenuRef: React.RefObject<HTMLDivElement>;
  openModal: (modalId: string, params?: any) => void;
  setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentTheme: any;
  isLandscape: boolean;
  onNavigate: (pageId: string, params?: any) => void;
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  showToast: (msg: string) => void;
  isWirdMode?: boolean;
  isMemorizationMode?: boolean;
  settings: any;
  updateSetting: (key: string, value: any) => void;
  bookmarks?: any[];
  deleteBookmark?: (id: number) => void;
  onSaveBookmark?: () => void;
  jumpToAyah?: (s: number, a: number, closeMenu?: boolean) => void;
  initialView?: string;
  onOpenMainGuide?: () => void;
}

const ALL_SHORTCUTS = [
  { id: "font-type", label: "نوع الخط", icon: <Type size={18} /> },
  { id: "sajdah-list", label: "آيات السجدة", icon: <Compass size={18} /> },
  { id: "thematic-encyclopedia", label: "الموسوعة الموضوعية", icon: <BookOpen size={18} /> },
  { id: "waqf-guide", label: "علامات الوقف", icon: <Compass size={18} /> },
  { id: "mutashabihat", label: "المتشابهات اللفظية", icon: <GitCompare size={18} /> },
  { id: "asbab-nuzul", label: "أسباب النزول", icon: <Info size={18} /> },
  { id: "irab", label: "إعراب القرآن", icon: <BookText size={18} /> },
];

const DEFAULT_SHORTCUTS = [
  "font-type",
  "sajdah-list",
];

const FloatingMenu: React.FC<FloatingMenuProps> = ({
  page,
  isFloatingMenuOpen,
  floatingMenuRef,
  openModal,
  setIsFloatingMenuOpen,
  currentTheme,
  isLandscape,
  onNavigate,
  readingMode,
  setReadingMode,
  showToast,
  isWirdMode = false,
  isMemorizationMode = false,
  settings,
  updateSetting,
  bookmarks = [],
  deleteBookmark,
  onSaveBookmark,
  jumpToAyah,
  initialView = "main",
  onOpenMainGuide,
}) => {
  const { translateMenuItem, language, isRTL } = useLanguage();
  const isEn = language === 'en';
  const showPageGuides = useShowPageGuides();
  const isDarkTheme = isDarkQuranTheme(currentTheme);
  const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>([]);

  type MenuView =
    | "main"
    | "font"
    | "bookmarks"
    | "sajdah_list";
  const [currentView, setCurrentView] = useState<MenuView>("main");

  const [isSidebarGuideOpen, setIsSidebarGuideOpen] = useState(false);
  const menuBoxRef = useRef<HTMLDivElement>(null);
  const [madinahMainSizes, setMadinahMainSizes] = useState<Record<string, { width: number; height: number }>>({});
  const madinahSizeKey = `${isLandscape ? "land" : "port"}-${language}-${readingMode === "madinah" ? "m" : "q"}`;
  const madinahLockedSize = madinahMainSizes[madinahSizeKey];

  useLayoutEffect(() => {
    if (!isFloatingMenuOpen || currentView !== "main" || isSidebarGuideOpen) {
      return;
    }
    const el = menuBoxRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 0 && h > 0) {
        setMadinahMainSizes((prev) => {
          const existing = prev[madinahSizeKey];
          if (existing && existing.width === w && existing.height === h) return prev;
          return { ...prev, [madinahSizeKey]: { width: w, height: h } };
        });
      }
    };

    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(el);
    return () => {
      if (ro) ro.disconnect();
    };
  }, [readingMode, isFloatingMenuOpen, currentView, madinahSizeKey, isSidebarGuideOpen, selectedShortcuts.length]);

  useEffect(() => {
    if (isFloatingMenuOpen) {
      const nextView =
        (readingMode === "madinah" && initialView === "font") ||
        initialView === "notifications"
          ? "main"
          : initialView;
      setCurrentView(nextView as MenuView);

      if (isLandscape) {
        setIsSidebarGuideOpen(false);
        return;
      }

      const sidebarGuideKey = readingMode === "madinah" ? "madinah_sidebar_menu_v2" : "sidebar_menu_v2";
      if (!getQuranGuideSeen(sidebarGuideKey)) {
        const timer = setTimeout(() => {
          setIsSidebarGuideOpen(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    } else {
      setIsSidebarGuideOpen(false);
      setCurrentView("main");
    }
  }, [isFloatingMenuOpen, initialView, isLandscape, readingMode]);

  useEffect(() => {
    if (readingMode === "madinah" && currentView === "font") {
      setCurrentView("main");
    }
  }, [readingMode, currentView]);

  useEffect(() => {
    if (currentView !== "main" || isLandscape || !showPageGuides) {
      setIsSidebarGuideOpen(false);
    }
  }, [currentView, isLandscape, showPageGuides]);

  useEffect(() => {
    const saved = localStorage.getItem("quran_menu_shortcuts");
    if (saved) {
      const parsed = JSON.parse(saved);
      const validShortcuts = parsed.filter((id: string) =>
        ALL_SHORTCUTS.some((s) => s.id === id),
      );

      // If all saved shortcuts were removed or if we want to ensure the new ones are there
      if (validShortcuts.length === 0) {
        setSelectedShortcuts(DEFAULT_SHORTCUTS);
        localStorage.setItem(
          "quran_menu_shortcuts",
          JSON.stringify(DEFAULT_SHORTCUTS),
        );
      } else {
        setSelectedShortcuts(validShortcuts);
      }
    } else {
      setSelectedShortcuts(DEFAULT_SHORTCUTS);
    }
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsFloatingMenuOpen(false);
  };

  const isDeepBlack = currentTheme?.id === "deep_black";
  const themeDarkColor = (currentTheme?.headerText && currentTheme?.headerText !== "#000000")
    ? currentTheme.headerText
    : (currentTheme?.barText && currentTheme?.barText !== "#000000")
      ? currentTheme.barText
      : (currentTheme?.accent || currentTheme?.text || "#000000");
  const sidebarIconColor = isDarkTheme ? "#ffffff" : themeDarkColor;
  const iconColor = isDarkTheme ? "#ffffff" : themeDarkColor;

  return (
    <>
      {/* Backdrop to block interaction with background and close menu on click */}
      {isFloatingMenuOpen && !isSidebarGuideOpen && (
        <div
          className="fixed inset-0 z-[1050] bg-black/[0.02] pointer-events-auto select-none"
          style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFloatingMenuOpen(false);
          }}
          onTouchStart={(e) => {
            // Absorb touchstart so it doesn't propagate down to Quran text or anything below
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            // Tap finished on backdrop: prevent synthetic clicks and close menu
            e.preventDefault();
            e.stopPropagation();
            setIsFloatingMenuOpen(false);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
        />
      )}
      <div
        ref={floatingMenuRef}
        className={`fixed ${isLandscape ? "top-[calc(0.5rem+var(--logical-safe-top))] bottom-[calc(1rem+var(--logical-safe-bottom))]" : readingMode === "madinah" ? "top-[calc(3.5rem+var(--logical-safe-top))] bottom-[calc(1.15rem+var(--logical-safe-bottom))]" : "top-[calc(3.5rem+var(--logical-safe-top))] bottom-[calc(3.5rem+var(--logical-safe-bottom))]"} ${isRTL ? (isLandscape ? "right-[calc(1rem+var(--logical-safe-right))]" : "right-0") : (isLandscape ? "left-[calc(1rem+var(--logical-safe-left))]" : "left-0")} z-[1060] flex items-start gap-4 pointer-events-none`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* The Main Menu Container */}
        <div
          id="floating-menu"
          ref={menuBoxRef}
          data-view={currentView}
          className={`${
            isLandscape
              ? "w-max min-w-[235px] max-w-[295px] rounded-2xl"
              : `w-max max-w-[85vw] ${isRTL ? "rounded-l-2xl" : "rounded-r-2xl"}`
          } ${readingMode === "madinah" ? "madinah-flat-floating-menu" : "quran-flat-floating-menu"} ${currentView !== "main" && madinahLockedSize ? "madinah-submenu-locked" : ""} ${isRTL ? "origin-top-right" : "origin-top-left"} flex flex-col pointer-events-auto h-full overflow-hidden ${isFloatingMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none hidden"}`}
          style={{
            fontFamily: "'Cairo', sans-serif",
            backgroundColor: currentTheme.bg || "#ffffff",
            color: currentTheme.text || "#000000",
            borderTop: "none",
            borderBottom: "none",
            borderLeft: "none",
            borderRight: "none",
            boxShadow: "none",
            ...(currentView !== "main" && madinahLockedSize
              ? ({
                  "--madinah-locked-width": `${madinahLockedSize.width}px`,
                  "--madinah-locked-height": `${madinahLockedSize.height}px`,
                } as React.CSSProperties)
              : {}),
          }}
        >
          {currentView === "font" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3.5 flex items-center justify-between shrink-0"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Type size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="floating-menu-subview-title font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {readingMode === "translation" 
                      ? (isEn ? "English Translation Fonts" : "خطوط الترجمة الإنجليزية")
                      : (isEn ? "Font Style" : "نوع الخط")}
                  </h3>
                </div>
              </div>
              <div className="flex-grow min-h-0 overflow-y-auto p-3 custom-scrollbar flex flex-col justify-between">
                <div className="grid grid-cols-1 gap-2.5">
                  {(readingMode === "translation" ? ENGLISH_FONTS : FONTS).map((f) => {
                    const isTranslationMode = readingMode === "translation";
                    const fontDisplayName = isTranslationMode 
                      ? (f.nameEn || f.name) 
                      : (isEn ? (FONT_NAMES_EN[f.name] || f.name) : f.name);
                    const isSelected = isTranslationMode
                      ? (settings.fontFamily === f.id || ((!settings.fontFamily || settings.fontFamily.startsWith('var(--font-')) && f.id === ENGLISH_FONTS[0].id))
                      : settings.fontFamily === f.id;
                    const previewText = isTranslationMode
                      ? (f.previewEn || "In the name of Allah, the Entirely Merciful")
                      : "﴿بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ﴾";
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          updateSetting("fontFamily", f.id);
                          setCurrentView("main");
                          setIsFloatingMenuOpen(false);
                          showToast(isEn ? `Font changed to: ${fontDisplayName}` : `تم تغيير الخط إلى: ${fontDisplayName}`);
                        }}
                        className={`flex flex-col p-3.5 rounded-2xl border-0 transition-all text-start cursor-pointer ${isSelected ? "quran-raised-card-selected" : "quran-raised-card"}`}
                        style={{
                          backgroundColor:
                            isSelected
                              ? (isDarkTheme ? "rgba(255,255,255,0.12)" : `${currentTheme.accent}18`)
                              : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                          color: currentTheme.text,
                          border: "none",
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span
                            className="floating-menu-subview-item-title text-xs font-bold"
                            style={{
                              color: isSelected ? (isDeepBlack ? "#ffffff" : (currentTheme.accent || "#10b981")) : currentTheme.text,
                            }}
                          >
                            {fontDisplayName}
                          </span>
                          {isSelected && (
                            <Check size={16} style={{ color: isDeepBlack ? "#ffffff" : (currentTheme.accent || "#10b981") }} />
                          )}
                        </div>
                      <span
                        className={`opacity-85 ${isTranslationMode ? "text-xs text-left italic font-normal" : "text-lg text-center w-full"}`}
                        style={{ fontFamily: f.id }}
                      >
                        {previewText}
                      </span>
                    </button>
                  );
                })}
                </div>
              </div>
              <div
                className="p-3 shrink-0"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="floating-menu-subview-btn-text w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0"
                  style={{
                    backgroundColor: isDarkTheme ? (currentTheme?.btnBg || "rgba(255,255,255,0.08)") : "#ffffff",
                    color: currentTheme.text,
                    border: "none",
                  }}
                >
                  {isEn ? "Back" : "رجوع"}
                </button>
              </div>
            </div>
          ) : currentView === "bookmarks" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3.5 flex items-center justify-between shrink-0"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Bookmark size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="floating-menu-subview-title font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {isEn ? "Bookmarks" : "العلامات المرجعية"}
                  </h3>
                </div>
              </div>
              <div className="flex-grow min-h-0 overflow-y-auto p-3 custom-scrollbar">
                {bookmarks.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-full gap-2 text-center"
                    style={{ color: `${currentTheme.text}40` }}
                  >
                    <Bookmark size={40} className="opacity-20 quran-3d-icon" />
                    <span className="floating-menu-subview-item-title text-xs font-bold">
                      {isEn ? "No bookmarks found" : "لا توجد علامات مرجعية"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map((b: any) => {
                      const rawSurahName = SURAH_NAMES_AR[b.s - 1] || '';
                      const cleanEnName = (SURAH_NAMES_EN[b.s - 1] || rawSurahName).replace(/^Al-/, '');
                      return (
                        <div
                          key={b.id}
                          className="p-3.5 min-h-[68px] rounded-2xl quran-raised-card flex items-center justify-between group transition-all cursor-pointer border-0"
                          style={{
                            backgroundColor: isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff",
                            color: currentTheme.text,
                            border: "none",
                          }}
                          onClick={() => {
                            if (jumpToAyah) {
                              jumpToAyah(b.s, b.a, true);
                              setIsFloatingMenuOpen(false);
                            }
                          }}
                        >
                          <div className={`flex flex-col gap-1 flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
                            <span className="floating-menu-subview-item-title font-extrabold text-sm leading-tight">
                              {isEn ? `Surah-${cleanEnName} - ${b.a}` : `سورة ${rawSurahName} - آية ${toArabic(b.a)}`}
                            </span>
                            <span className="floating-menu-subview-item-meta text-[10px] opacity-60 font-semibold">
                              {b.date} • {b.time || ''}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (deleteBookmark) deleteBookmark(b.id);
                            }}
                            className="w-7 h-7 rounded-xl quran-raised-btn flex items-center justify-center transition-all border-0 shrink-0"
                            style={{ color: `${currentTheme.text}60`, border: "none" }}
                          >
                            <X size={15} className="quran-3d-icon" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div
                className="p-3 flex flex-col gap-2 shrink-0"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                {readingMode === "madinah" && onSaveBookmark && (
                  <button
                    onClick={() => onSaveBookmark()}
                    className="floating-menu-subview-btn-text w-full py-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 quran-raised-btn border-0 cursor-pointer"
                    style={{
                      backgroundColor: currentTheme?.accent || "#10b981",
                      color: currentTheme?.accentText || "#ffffff",
                      border: "none",
                    }}
                  >
                    <Bookmark size={14} />
                    <span>{isEn ? "Bookmark Current Ayah" : "حفظ الآية الحالية"}</span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentView("main")}
                  className="floating-menu-subview-btn-text w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0"
                  style={{
                    backgroundColor: isDarkTheme ? (currentTheme?.btnBg || "rgba(255,255,255,0.08)") : "#ffffff",
                    color: currentTheme.text,
                    border: "none",
                  }}
                >
                  {isEn ? "Back" : "رجوع"}
                </button>
              </div>
            </div>
          ) : currentView === "sajdah_list" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-2.5 flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <button
                  onClick={() => handleAction(() => openModal("sajdah-card"))}
                  className="p-2 rounded-xl transition-all flex items-center gap-2 w-full justify-center quran-raised-btn border-0"
                  style={{
                    backgroundColor: currentTheme?.accent || "#10b981",
                    color: "#ffffff",
                    border: "none",
                  }}
                >
                  <span className="floating-menu-subview-title text-[10px] font-bold">{isEn ? "Sajdah Info" : "معلومات السجدة"}</span>
                </button>
              </div>
              <div className="flex-grow min-h-0 overflow-y-auto p-2.5 custom-scrollbar">
                <div className="space-y-2">
                  {SAJDAH_LOCATIONS.map((loc, idx) => {
                    const juzNum = (() => {
                      for (let i = JUZ_MAP.length - 1; i >= 0; i--) {
                        const juz = JUZ_MAP[i];
                        if (
                          loc.s > juz.s ||
                          (loc.s === juz.s && loc.a >= juz.a)
                        )
                          return juz.j;
                      }
                      return 1;
                    })();
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl quran-raised-card flex flex-col items-center gap-1 transition-all cursor-pointer border-0"
                        style={{
                          backgroundColor: isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff",
                          color: currentTheme.text,
                          border: "none",
                        }}
                        onClick={() => {
                          if (jumpToAyah) {
                            jumpToAyah(loc.s, loc.a, true);
                            setIsFloatingMenuOpen(false);
                          }
                        }}
                      >
                        <div
                          className="floating-menu-subview-item-title font-bold text-[11px] text-center"
                          style={{ fontFamily: "inherit" }}
                        >
                          {isEn ? `${idx + 1} - Surah ${SURAH_NAMES_EN[loc.s - 1] || SURAH_NAMES_AR[loc.s - 1]}` : `${toArabic(idx + 1)} - سورة ${SURAH_NAMES_AR[loc.s - 1]}`}
                        </div>
                        <div className="floating-menu-subview-item-meta flex items-center gap-2 text-[9px] opacity-70 font-bold">
                          <span className="flex items-center gap-1">
                            <i className="fa-regular fa-file-lines text-[8px] quran-3d-icon"></i>
                            {isEn ? `Ayah ${loc.a}` : `آية ${toArabic(loc.a)}`}
                          </span>
                          <span className="w-px h-2.5 bg-current opacity-20"></span>
                          <span className="flex items-center gap-1">
                            <i className="fa-solid fa-book-open text-[8px] quran-3d-icon"></i>
                            {isEn ? `Juz ${juzNum}` : `الجزء ${toArabic(juzNum)}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div
                className="p-3 shrink-0"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="floating-menu-subview-btn-text w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0"
                  style={{
                    backgroundColor: isDarkTheme ? (currentTheme?.btnBg || "rgba(255,255,255,0.08)") : "#ffffff",
                    color: currentTheme.text,
                    border: "none",
                  }}
                >
                  {isEn ? "Back" : "رجوع"}
                </button>
              </div>
            </div>
          ) : (
            /* Main Menu Content */
            <div
              id="floating-menu-scroll-container"
              className="p-2 flex flex-col justify-between overflow-y-auto flex-grow custom-scrollbar min-h-0"
            >
              {/* خيارات القراءة */}
              <MenuSection
                title={isEn ? "Reading Options" : "خيارات القراءة"}
                iconColor={sidebarIconColor}
                titleColor="#2563eb"
                currentTheme={currentTheme}
                isRTL={isRTL}
              >
                {!isEn ? (
                  <>
                    <MenuItem
                      data-id="menu-item-mushaf"
                      icon={<BookText size={18} />}
                      label="المصحف"
                      onClick={() =>
                        handleAction(() => {
                          setReadingMode("mushaf");
                        })
                      }
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "mushaf"}
                      currentTheme={currentTheme}
                      isRTL={isRTL}
                    />
                    {!isLandscape && (
                      <MenuItem
                        data-id="menu-item-madinah"
                        icon={<BookOpen size={18} />}
                        label="مصحف المدينة"
                        onClick={() =>
                          handleAction(() => {
                            setReadingMode("madinah");
                          })
                        }
                        iconColor={sidebarIconColor}
                        isActive={readingMode === "madinah"}
                        currentTheme={currentTheme}
                        isRTL={isRTL}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <MenuItem
                      data-id="menu-item-translation"
                      icon={<BookText size={18} />}
                      label="English Translation"
                      onClick={() =>
                        handleAction(() => setReadingMode("translation"))
                      }
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "translation"}
                      currentTheme={currentTheme}
                      isRTL={isRTL}
                    />
                    <MenuItem
                      data-id="menu-item-bilingual"
                      icon={<Globe size={18} />}
                      label="Recitation & Translation"
                      onClick={() =>
                        handleAction(() => setReadingMode("bilingual"))
                      }
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "bilingual"}
                      currentTheme={currentTheme}
                      isRTL={isRTL}
                    />
                  </>
                )}
              </MenuSection>

              {/* الإعدادات والبحث */}
              <MenuSection
                title={isEn ? "Settings & Search" : "الإعدادات والبحث"}
                iconColor={sidebarIconColor}
                titleColor="#16a34a"
                currentTheme={currentTheme}
                isRTL={isRTL}
              >
                <MenuItem
                  data-id="menu-item-global-search"
                  icon={<Search size={18} />}
                  label={isEn ? "Advanced Search" : "البحث المتقدم"}
                  onClick={() => handleAction(() => onNavigate('search', { from: isLandscape ? 'quran-landscape' : (page || 'quran'), readingMode, isWird: isWirdMode, fromSidebar: true }))}
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
                <MenuItem
                  data-id="menu-item-settings"
                  icon={<Settings size={18} />}
                  label={isEn ? "Settings" : "الإعدادات"}
                  onClick={() =>
                    handleAction(() => openModal("settings-modal"))
                  }
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
                <MenuItem
                  data-id="menu-item-bookmarks"
                  icon={<Bookmark size={18} />}
                  label={isEn ? "Bookmarks" : "العلامات المرجعية"}
                  onClick={() => setCurrentView("bookmarks")}
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
              </MenuSection>

              {/* علوم القرآن والتدبر والسكينة */}
              <MenuSection
                dataId="menu-section-quran-sciences"
                title={isEn ? "Quranic Sciences & Serenity" : "علوم القرآن والتدبر والسكينة"}
                iconColor={sidebarIconColor}
                titleColor="#8b5cf6"
                currentTheme={currentTheme}
                isRTL={isRTL}
              >
                <MenuItem
                  data-id="menu-item-thematic-encyclopedia"
                  icon={<BookOpen size={18} />}
                  label={isEn ? "Thematic Encyclopedia" : "الموسوعة الموضوعية"}
                  onClick={() =>
                    handleAction(() => openModal("thematic-encyclopedia-modal"))
                  }
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />

                <MenuItem
                  data-id="menu-item-waqf-guide"
                  icon={<Compass size={18} />}
                  label={isEn ? "Waqf & Stopping Signs" : "دليل علامات الوقف"}
                  onClick={() =>
                    handleAction(() => openModal("waqf-guide-modal"))
                  }
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
                <MenuItem
                  data-id="menu-item-mutashabihat"
                  icon={<GitCompare size={18} />}
                  label={isEn ? "Mutashabihat Concordance" : "المتشابهات اللفظية"}
                  onClick={() =>
                    handleAction(() => openModal("mutashabihat-modal"))
                  }
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
                <MenuItem
                  data-id="menu-item-asbab-nuzul"
                  icon={<Info size={18} />}
                  label={isEn ? "Asbab Al-Nuzul" : "أسباب النزول المباشرة"}
                  onClick={() =>
                    handleAction(() => openModal("asbab-nuzul-modal"))
                  }
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
                <MenuItem
                  data-id="menu-item-irab"
                  icon={<BookText size={18} />}
                  label={isEn ? "Quran Syntax & I'rab" : "إعراب القرآن وبيانه"}
                  onClick={() =>
                    handleAction(() => openModal("irab-modal"))
                  }
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
              </MenuSection>

              {/* اختصارات أخرى */}
              <MenuSection
                title={isEn ? "Other Shortcuts" : "اختصارات أخرى"}
                iconColor={sidebarIconColor}
                titleColor="#d97706"
                currentTheme={currentTheme}
                isRTL={isRTL}
              >
                {ALL_SHORTCUTS.filter((s) =>
                  selectedShortcuts.includes(s.id) &&
                  !(readingMode === "madinah" && s.id === "font-type"),
                ).map((shortcut) => (
                  <React.Fragment key={shortcut.id}>
                    <MenuItem
                      data-id={`menu-item-${shortcut.id}`}
                      icon={React.cloneElement(
                        shortcut.icon as React.ReactElement<any>,
                        { size: 18 },
                      )}
                      label={translateMenuItem(shortcut.id, shortcut.label)}
                      onClick={() => {
                        if (shortcut.id === "font-type") {
                          setCurrentView("font");
                        } else if (shortcut.id === "sajdah-list") {
                          setCurrentView("sajdah_list");
                        } else if (shortcut.id === "thematic-encyclopedia") {
                          handleAction(() => openModal("thematic-encyclopedia-modal"));
                        } else if (shortcut.id === "waqf-guide") {
                          handleAction(() => openModal("waqf-guide-modal"));
                        } else if (shortcut.id === "mutashabihat") {
                          handleAction(() => openModal("mutashabihat-modal"));
                        } else if (shortcut.id === "asbab-nuzul") {
                          handleAction(() => openModal("asbab-nuzul-modal"));
                        } else if (shortcut.id === "irab") {
                          handleAction(() => openModal("irab-modal"));
                        } else {
                          handleAction(() => onNavigate(shortcut.id));
                        }
                      }}
                      iconColor={sidebarIconColor}
                      showChevron={false}
                      isActive={page === shortcut.id}
                      currentTheme={currentTheme}
                      isRTL={isRTL}
                    />
                  </React.Fragment>
                ))}
              </MenuSection>
              {!isLandscape && showPageGuides && (
                <div className="pt-2 pb-1 px-1 flex items-center justify-around gap-2.5">
                  {onOpenMainGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsFloatingMenuOpen(false);
                        onOpenMainGuide();
                      }}
                      className="flex-1 py-2.5 px-2.5 border-0 quran-raised-btn rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                      style={{
                        backgroundColor: isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.08)") : "#ffffff",
                        color: sidebarIconColor,
                        border: "none",
                      }}
                      title={isEn ? "Quran Guide" : "دليل المصحف"}
                      aria-label={isEn ? "Quran Guide" : "دليل المصحف"}
                    >
                      <BookOpen size={22} className="shrink-0 transition-transform quran-3d-icon" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSidebarGuideOpen(true)}
                    className={`${onOpenMainGuide ? 'flex-1' : 'w-full'} py-2.5 px-2.5 border-0 quran-raised-btn rounded-2xl flex items-center justify-center transition-all cursor-pointer`}
                    style={{
                      backgroundColor: isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.08)") : "#ffffff",
                      color: sidebarIconColor,
                      border: "none",
                    }}
                    title={isEn ? "Sidebar Guide" : "دليل القائمة"}
                    aria-label={isEn ? "Sidebar Guide" : "دليل القائمة"}
                  >
                    <Menu size={22} className="shrink-0 transition-transform quran-3d-icon" />
                  </button>
                </div>
              )}
              {/* Bottom Spacer only active during sidebar guide */}
              {isSidebarGuideOpen && (
                <div
                  className="shrink-0 pointer-events-none transition-all duration-300"
                  style={{ height: "45dvh" }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <QuranSpotlightGuide
        guideKey={readingMode === "madinah" ? "madinah_sidebar_menu_v2" : "sidebar_menu_v2"}
        steps={readingMode === "madinah" ? MADINAH_SIDEBAR_STEPS : QURAN_SIDEBAR_STEPS}
        isOpen={isSidebarGuideOpen && !isLandscape && showPageGuides}
        onClose={() => setIsSidebarGuideOpen(false)}
        isEn={isEn}
        currentTheme={currentTheme}
        isMadinahMode={readingMode === "madinah"}
      />
    </>
  );
};

const MenuSection: React.FC<{
  dataId?: string;
  title: string;
  children: React.ReactNode;
  iconColor: string;
  titleColor?: string;
  currentTheme?: any;
  isRTL?: boolean;
}> = ({ dataId, title, children, iconColor, titleColor = "#000000", currentTheme, isRTL = true }) => (
  <div data-id={dataId} className="flex flex-col flex-grow mb-1">
    <div
      className={`py-1 px-2.5 rounded-xl mb-1 ${isRTL ? "text-right" : "text-left"} whitespace-nowrap quran-raised-card border-0`}
      style={{
        backgroundColor: currentTheme
          ? `${currentTheme.accent}15`
          : "rgba(37, 99, 235, 0.1)",
        border: "none",
      }}
    >
      <span
        className="floating-menu-section-title text-[10.5px] font-extrabold whitespace-nowrap tracking-wide truncate block"
        style={{ color: currentTheme ? (currentTheme.id === "deep_black" ? "#ffffff" : currentTheme.accent) : titleColor }}
      >
        {title}
      </span>
    </div>
    <div className="flex flex-col px-0.5 gap-1 justify-evenly flex-grow">
      {children}
    </div>
  </div>
);

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  iconColor: string;
  showChevron?: boolean;
  isExpanded?: boolean;
  isSubItem?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  currentTheme?: any;
  "data-id"?: string;
  isRTL?: boolean;
}> = ({
  icon,
  label,
  onClick,
  iconColor,
  showChevron,
  isExpanded,
  isSubItem,
  isActive,
  isDisabled,
  currentTheme,
  "data-id": dataId,
  isRTL = true,
}) => (
  <button
    onClick={onClick}
    data-id={dataId}
    aria-disabled={isDisabled || undefined}
    className={`floating-menu-item-btn flex items-center gap-2 py-2 px-2.5 my-0.5 rounded-2xl border-0 transition-all ${isRTL ? "text-right" : "text-left"} w-full whitespace-nowrap ${isSubItem ? "px-2 py-1.5" : ""} ${isActive ? "quran-raised-btn-selected" : "quran-raised-btn"} ${isDisabled ? "opacity-45 cursor-not-allowed" : ""}`}
    style={{
      backgroundColor: isActive
        ? (currentTheme?.accent || "#10b981")
        : (currentTheme?.btnBg || (currentTheme?.text === "#ffffff" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)")),
      color: isActive ? (currentTheme?.accentText || "#ffffff") : (currentTheme?.text || "#000000"),
      border: "none",
      outline: "none",
    }}
  >
    <div style={{ color: isActive ? (currentTheme?.accentText || "#ffffff") : iconColor }} className="shrink-0 flex items-center justify-center">{icon}</div>
    <span
      className={`${isSubItem ? "floating-menu-subitem-label text-[10.5px]" : "floating-menu-item-label text-[11.5px]"} font-bold truncate flex-1 min-w-0`}
      style={{
        color: isActive
          ? (currentTheme?.accentText || "#ffffff")
          : currentTheme
            ? currentTheme.text
            : "#000000",
      }}
    >
      {label}
    </span>
    {showChevron && (
      <ChevronLeft size={14} className={`shrink-0 transition-transform ${isExpanded ? "-rotate-90" : ""}`} style={{ color: isActive ? "#ffffff" : iconColor }} />
    )}
  </button>
);

export default FloatingMenu;
