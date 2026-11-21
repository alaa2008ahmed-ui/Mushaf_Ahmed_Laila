import React, { useState, useEffect } from "react";
import {
  getAppNotificationSettings,
  saveAppNotificationSettings,
  APP_NOTIFICATION_CHANGE_EVENT,
  AppNotificationSettings,
} from "../../utils/appNotificationSettings";
import {
  Smartphone,
  AppWindow,
  VolumeX,
  Search,
  Book,
  FileText,
  Languages,
  Globe,
  Compass,
  Bookmark,
  BookText,
  Settings,
  X,
  Info,
  Type,
  Bell,
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
} from "./constants";
import { usePrayerTimes } from "../../context/PrayerTimesContext";
import { useLanguage } from "../../context/LanguageContext";
import { setupNotifications } from "../../utils/notifications";
import { QuranSpotlightGuide, getQuranGuideSeen } from "./QuranSpotlightGuide";
import { QURAN_SIDEBAR_STEPS } from "./quranGuideSteps";
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
  readingMode: "mushaf" | "tafseer" | "meanings" | "translation" | "bilingual";
  setReadingMode: (
    mode: "mushaf" | "tafseer" | "meanings" | "translation" | "bilingual",
  ) => void;
  showToast: (msg: string) => void;
  isWirdMode?: boolean;
  isMemorizationMode?: boolean;
  settings: any;
  updateSetting: (key: string, value: any) => void;
  bookmarks?: any[];
  deleteBookmark?: (id: number) => void;
  jumpToAyah?: (s: number, a: number, closeMenu?: boolean) => void;
  initialView?: string;
  onOpenMainGuide?: () => void;
}

const ALL_SHORTCUTS = [
  { id: "font-type", label: "نوع الخط", icon: <Type size={18} /> },
  { id: "notification-settings", label: "الإشعارات", icon: <Bell size={18} /> },
  { id: "sajdah-list", label: "آيات السجدة", icon: <Compass size={18} /> },
  { id: "thematic-encyclopedia", label: "الموسوعة الموضوعية", icon: <BookOpen size={18} /> },
  { id: "waqf-guide", label: "علامات الوقف", icon: <Compass size={18} /> },
  { id: "mutashabihat", label: "المتشابهات اللفظية", icon: <GitCompare size={18} /> },
  { id: "asbab-nuzul", label: "أسباب النزول", icon: <Info size={18} /> },
  { id: "irab", label: "إعراب القرآن", icon: <BookText size={18} /> },
];

const DEFAULT_SHORTCUTS = [
  "font-type",
  "notification-settings",
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
    | "notifications"
    | "bookmarks"
    | "sajdah_list";
  const [currentView, setCurrentView] = useState<MenuView>("main");

  const [isSidebarGuideOpen, setIsSidebarGuideOpen] = useState(false);

  useEffect(() => {
    if (isLandscape) {
      setIsSidebarGuideOpen(false);
      return;
    }
    if (isFloatingMenuOpen) {
      setCurrentView(initialView as MenuView);

      if (!getQuranGuideSeen("sidebar_menu_v2")) {
        const timer = setTimeout(() => {
          setIsSidebarGuideOpen(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    } else {
      setIsSidebarGuideOpen(false);
    }
  }, [isFloatingMenuOpen, initialView, isLandscape]);

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
        className={`fixed ${isLandscape ? "top-[calc(0.5rem+var(--logical-safe-top))] bottom-[calc(0.5rem+var(--logical-safe-bottom))]" : "top-[calc(3.5rem+var(--logical-safe-top))] bottom-[calc(3.5rem+var(--logical-safe-bottom))]"} ${isRTL ? (isLandscape ? "right-[calc(1rem+var(--logical-safe-right))]" : "right-0") : (isLandscape ? "left-[calc(1rem+var(--logical-safe-left))]" : "left-0")} z-[1060] flex items-start gap-4 pointer-events-none`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* The Main Menu Container */}
        <div
          id="floating-menu"
          className={`${
            isLandscape
              ? `${currentView === "main" ? "w-max min-w-[235px] max-w-[295px]" : "w-[250px]"} rounded-2xl`
              : `${currentView === "main" ? "w-max max-w-[85vw]" : "w-[200px] max-w-[85vw]"} ${isRTL ? "rounded-l-2xl" : "rounded-r-2xl"}`
          } shadow-2xl ${isRTL ? "origin-top-right" : "origin-top-left"} flex flex-col pointer-events-auto h-full overflow-hidden ${isFloatingMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none hidden"}`}
          style={{
            fontFamily: currentTheme.font || "var(--font-amiri)",
            backgroundColor: currentTheme.bg || "#ffffff",
            color: currentTheme.text || "#000000",
            border: "none",
            borderTop: "none",
            borderBottom: "none",
            borderLeft: "none",
            borderRight: "none",
            boxShadow: isRTL
              ? "-6px 0 25px -4px rgba(0, 0, 0, 0.22), 0 10px 20px -3px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 1px 0 2px rgba(255, 255, 255, 0.6)"
              : "6px 0 25px -4px rgba(0, 0, 0, 0.22), 0 10px 20px -3px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset -1px 0 2px rgba(255, 255, 255, 0.6)",
          }}
        >
          {currentView === "font" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3.5 flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Type size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="font-extrabold text-xs"
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
                            className="text-xs font-bold"
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
                className="p-3"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0"
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
          ) : currentView === "notifications" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3.5 flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Bell size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {isEn ? "Notifications" : "الإشعارات"}
                  </h3>
                </div>
              </div>
              <div className="flex-grow min-h-0 overflow-y-auto p-3 custom-scrollbar flex flex-col justify-between">
                <NotificationSettingsContent
                  showToast={showToast}
                  currentTheme={currentTheme}
                  isEn={isEn}
                  isRTL={isRTL}
                  modeSuffix={
                    isMemorizationMode
                      ? `_memorization_${isLandscape ? "h" : "v"}`
                      : isWirdMode
                        ? `_wird_${isLandscape ? "h" : "v"}`
                        : readingMode === "mushaf"
                          ? isLandscape
                            ? "_h"
                            : "_v"
                          : `_${readingMode}_${isLandscape ? "h" : "v"}`
                  }
                />
              </div>
              <div
                className="p-3"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0"
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
                className="p-3.5 flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Bookmark size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {isEn ? "Bookmarks" : "العلامات المرجعية"}
                  </h3>
                </div>
              </div>
              <div className="flex-grow min-h-0 overflow-y-auto p-3 custom-scrollbar">
                {bookmarks.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-full gap-2"
                    style={{ color: `${currentTheme.text}40` }}
                  >
                    <Bookmark size={40} className="opacity-20 quran-3d-icon" />
                    <span className="text-xs font-bold">
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
                          <div className={`flex flex-col gap-1 ${isRTL ? "text-right" : "text-left"}`}>
                            <span className="font-extrabold text-sm leading-tight">
                              {isEn ? `Surah-${cleanEnName} - ${b.a}` : `سورة ${rawSurahName} - آية ${toArabic(b.a)}`}
                            </span>
                            <span className="text-[10px] opacity-60 font-semibold">
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
                className="p-3"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0"
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
                className="p-2.5 flex items-center justify-center"
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
                  <span className="text-[10px] font-bold">{isEn ? "Sajdah Info" : "معلومات السجدة"}</span>
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
                          className="font-bold text-[11px] text-center"
                          style={{ fontFamily: "inherit" }}
                        >
                          {isEn ? `${idx + 1} - Surah ${SURAH_NAMES_EN[loc.s - 1] || SURAH_NAMES_AR[loc.s - 1]}` : `${toArabic(idx + 1)} - سورة ${SURAH_NAMES_AR[loc.s - 1]}`}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] opacity-70 font-bold">
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
                className="p-3"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0"
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
                    <MenuItem
                      data-id="menu-item-tafseer"
                      icon={<Book size={18} />}
                      label="التفسير"
                      onClick={() => handleAction(() => setReadingMode("tafseer"))}
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "tafseer"}
                      currentTheme={currentTheme}
                      isRTL={isRTL}
                    />
                    <MenuItem
                      data-id="menu-item-meanings"
                      icon={<FileText size={18} />}
                      label="المعاني"
                      onClick={() => handleAction(() => setReadingMode("meanings"))}
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "meanings"}
                      currentTheme={currentTheme}
                      isRTL={isRTL}
                    />
                    <MenuItem
                      data-id="menu-item-bilingual"
                      icon={<Globe size={18} />}
                      label="التلاوة والترجمة"
                      onClick={() =>
                        handleAction(() => setReadingMode("bilingual"))
                      }
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "bilingual"}
                      currentTheme={currentTheme}
                      isRTL={isRTL}
                    />
                  </>
                ) : (
                  <>
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
                    <MenuItem
                      data-id="menu-item-translation"
                      icon={<Languages size={18} />}
                      label="Translation"
                      onClick={() =>
                        handleAction(() => setReadingMode("translation"))
                      }
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "translation"}
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
                  onClick={() => handleAction(() => onNavigate('search', { from: isLandscape ? 'quran-landscape' : (page || 'quran'), isWird: isWirdMode, fromSidebar: true }))}
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
                title={isEn ? "Quranic Sciences & Serenity" : "علوم القرآن والتدبر والسكينة"}
                iconColor={sidebarIconColor}
                titleColor="#8b5cf6"
                currentTheme={currentTheme}
                isRTL={isRTL}
              >
                <MenuItem
                  data-id="menu-item-thematic-encyclopedia"
                  icon={<BookOpen size={18} />}
                  label={isEn ? "Thematic Encyclopedia" : "الموسوعة الموضوعية للقرآن"}
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
                  label={isEn ? "Mutashabihat Concordance" : "محرك المتشابهات اللفظية"}
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
                  label={isEn ? "Quran Syntax & I'rab" : "إعراب القرآن وبيانه النحوي"}
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
                  selectedShortcuts.includes(s.id),
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
                        } else if (shortcut.id === "notification-settings") {
                          setCurrentView("notifications");
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
        guideKey="sidebar_menu_v2"
        steps={QURAN_SIDEBAR_STEPS}
        isOpen={isSidebarGuideOpen && !isLandscape && showPageGuides}
        onClose={() => setIsSidebarGuideOpen(false)}
        isEn={isEn}
      />
    </>
  );
};

const NotificationSettingsContent: React.FC<{
  showToast: (msg: string) => void;
  modeSuffix: string;
  currentTheme: any;
  isEn?: boolean;
  isRTL?: boolean;
}> = ({ showToast, modeSuffix, currentTheme, isEn = false, isRTL = true }) => {
  const isDarkTheme = isDarkQuranTheme(currentTheme);
  const { config, updateConfig } = usePrayerTimes();
  const [activeTab, setActiveTab] = useState<"app" | "phone">("app");

  const [appSettings, setAppSettings] = useState<AppNotificationSettings>(() =>
    getAppNotificationSettings()
  );

  useEffect(() => {
    const syncAppSettings = () => setAppSettings(getAppNotificationSettings());
    window.addEventListener(APP_NOTIFICATION_CHANGE_EVENT, syncAppSettings);
    return () => window.removeEventListener(APP_NOTIFICATION_CHANGE_EVENT, syncAppSettings);
  }, []);

  const [phoneSettings, setPhoneSettings] = useState(() => {
    const saved = localStorage.getItem("phone_notifications_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing phone notification settings", e);
      }
    }
    return {
      sabah: true,
      masaa: true,
      dua: true,
      tasbeehMorning: true,
      tasbeehEvening: true,
      kahf: true,
    };
  });

  const toggleAppSetting = (key: keyof AppNotificationSettings) => {
    const newSettings = { ...appSettings, [key]: !appSettings[key] };
    setAppSettings(newSettings);
    saveAppNotificationSettings(newSettings);

    const labels: Record<string, string> = {
      quarter: isEn ? "Hizbs & Quarters Alerts" : "تنبيهات الأحزاب والأرباع",
      juz: isEn ? "Juz Transitions Alerts" : "تنبيهات بداية الأجزاء",
      sajda: isEn ? "Sajdah Verses Alerts" : "تنبيهات السجدات",
      themes: isEn ? "Theme Changes Alerts" : "تنبيهات تغيير الثيمات",
      downloads: isEn ? "Downloads Alerts" : "تنبيهات التحميل",
      bookmarks: isEn ? "Bookmarks Alerts" : "تنبيهات الإشارات المرجعية",
      general: isEn ? "General Alerts" : "التنبيهات العامة",
    };

    showToast(isEn ? `${labels[key]} ${newSettings[key] ? "enabled" : "disabled"}` : `${newSettings[key] ? "تم تفعيل" : "تم تعطيل"} ${labels[key]}`);
  };

  const togglePhoneSetting = (key: string) => {
    const newSettings = { ...phoneSettings, [key]: !phoneSettings[key] };
    setPhoneSettings(newSettings);
    localStorage.setItem(
      "phone_notifications_settings",
      JSON.stringify(newSettings),
    );
    setupNotifications(newSettings);

    const labels: Record<string, string> = {
      sabah: isEn ? "Morning Adhkar" : "أذكار الصباح",
      masaa: isEn ? "Evening Adhkar" : "أذكار المساء",
      dua: isEn ? "Dua Time" : "وقت الدعاء",
      tasbeehMorning: isEn ? "Morning Tasbeeh" : "التسبيح (صباحاً)",
      tasbeehEvening: isEn ? "Evening Tasbeeh" : "التسبيح (مساءً)",
      kahf: isEn ? "Surah Al-Kahf" : "سورة الكهف",
    };

    showToast(isEn ? `${labels[key]} ${newSettings[key] ? "enabled" : "disabled"}` : `${newSettings[key] ? "تم تفعيل" : "تم تعطيل"} ${labels[key]}`);
  };

  const toggleNightNotification = (
    key: "firstThird" | "midnight" | "lastThird",
  ) => {
    const currentNightNotifs = config.nightNotifications || {
      firstThird: true,
      midnight: true,
      lastThird: true,
    };
    const newNightNotifs = {
      ...currentNightNotifs,
      [key]: !currentNightNotifs[key],
    };
    updateConfig({ nightNotifications: newNightNotifs });

    const labels: Record<string, string> = {
      firstThird: isEn ? "First Third of Night" : "أول الليل",
      midnight: isEn ? "Midnight" : "منتصف الليل",
      lastThird: isEn ? "Last Third of Night" : "الثلث الأخير",
    };

    showToast(
      isEn
        ? `${labels[key]} alert ${newNightNotifs[key] ? "enabled" : "disabled"}`
        : `${newNightNotifs[key] ? "تم تفعيل" : "تم تعطيل"} إشعار ${labels[key]}`,
    );
  };

  const muteAudioForDuration = (durationDays: number) => {
    const muteUntil = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    updateConfig({ audioMutedUntil: muteUntil });
    showToast(
      isEn
        ? `Prayer audio alerts muted for ${durationDays} day(s)`
        : `تم تعطيل التنبيهات الصوتية للصلاة لمدة ${durationDays} يوم`,
    );
  };

  const unmuteAudio = () => {
    updateConfig({ audioMutedUntil: undefined });
    showToast(isEn ? "Prayer audio alerts enabled" : "تم تفعيل التنبيهات الصوتية للصلاة");
  };

  const isAudioMuted =
    config.audioMutedUntil && Date.now() < config.audioMutedUntil;

  return (
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: currentTheme.font }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className="flex gap-2 mb-3 px-1"
      >
        <button
          className={`flex-1 py-2 text-[10px] font-bold flex items-center justify-center gap-1.5 rounded-xl transition-all border-0 ${activeTab === "app" ? "quran-raised-btn-selected text-white" : "quran-raised-btn"}`}
          style={{
            backgroundColor:
              activeTab === "app" ? (currentTheme.accent || "#10b981") : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
            color: activeTab === "app" ? "#ffffff" : currentTheme.text,
            border: "none",
          }}
          onClick={() => setActiveTab("app")}
        >
          <AppWindow size={14} className="quran-3d-icon" />
          <span>{isEn ? "App Alerts" : "إشعارات التطبيق"}</span>
        </button>
        <button
          className={`flex-1 py-2 text-[10px] font-bold flex items-center justify-center gap-1.5 rounded-xl transition-all border-0 ${activeTab === "phone" ? "quran-raised-btn-selected text-white" : "quran-raised-btn"}`}
          style={{
            backgroundColor:
              activeTab === "phone" ? (currentTheme.accent || "#10b981") : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
            color: activeTab === "phone" ? "#ffffff" : currentTheme.text,
            border: "none",
          }}
          onClick={() => setActiveTab("phone")}
        >
          <Smartphone size={14} className="quran-3d-icon" />
          <span>{isEn ? "Phone Alerts" : "إشعارات الهاتف"}</span>
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 pb-1">
        {activeTab === "app" ? (
          <div className="space-y-2">
            {[
              {
                id: "quarter",
                label: isEn ? "Hizbs & Quarters" : "الأحزاب والأرباع",
                desc: isEn ? "Alert when reaching a new Hizb or Quarter" : "تنبيه عند الوصول لبداية حزب أو ربع جديد",
              },
              {
                id: "juz",
                label: isEn ? "Juz Transitions" : "بداية الأجزاء",
                desc: isEn ? "Alert when moving to a new Juz" : "تنبيه عند الانتقال لجزء جديد",
              },
              {
                id: "sajda",
                label: isEn ? "Sajdah Verses" : "مواضع السجدات",
                desc: isEn ? "Alert when reaching a prostration verse" : "تنبيه عند الوصول لآية بها سجدة تلاوة",
              },
              {
                id: "themes",
                label: isEn ? "Theme Changes" : "تغيير الثيمات",
                desc: isEn ? "Alert when applying a new theme" : "تنبيه عند تطبيق لون أو ثيم جديد",
              },
              {
                id: "downloads",
                label: isEn ? "Downloads" : "التحميلات",
                desc: isEn ? "Alerts for download status" : "تنبيهات حالة تحميل السور أو التفاسير",
              },
              {
                id: "bookmarks",
                label: isEn ? "Bookmarks" : "الإشارات المرجعية",
                desc: isEn ? "Alert when saving or deleting a bookmark" : "تنبيه عند حفظ أو حذف إشارة مرجعية",
              },
              {
                id: "general",
                label: isEn ? "General Alerts" : "تنبيهات عامة",
                desc: isEn ? "Alerts for memorization, tests, and operations" : "تنبيهات الحفظ، الاختبارات، والعمليات الأخرى",
              },
            ].map((item) => {
              const settingKey = item.id as keyof AppNotificationSettings;
              return (
              <div
                key={item.id}
                onClick={() => toggleAppSetting(settingKey)}
                className={`flex items-center justify-between p-2.5 rounded-2xl quran-raised-card transition-all cursor-pointer border-0 ${appSettings[settingKey] ? "shadow-sm" : "opacity-75"}`}
                style={{
                  backgroundColor: appSettings[settingKey]
                    ? `${currentTheme.accent}15`
                    : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                  color: currentTheme.text,
                  border: "none",
                }}
              >
                <div className={`flex flex-col gap-0.5 ${isRTL ? "text-right" : "text-left"}`}>
                  <span className="font-bold text-[11px]">{item.label}</span>
                  <span className="text-[9px] opacity-60 font-bold">{item.desc}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors flex-shrink-0 quran-raised-card`}
                  style={{
                    backgroundColor: appSettings[settingKey]
                      ? currentTheme.accent
                      : `${currentTheme.text}20`,
                    color: appSettings[settingKey] ? "#ffffff" : currentTheme.text,
                    border: "none",
                  }}
                >
                  {appSettings[settingKey] && <Check className="w-2.5 h-2.5" />}
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className={`font-extrabold text-[10px] opacity-80 px-1 ${isRTL ? "text-right" : "text-left"}`}>
                {isEn ? "Night Times" : "أوقات الليل"}
              </h4>
              {[
                {
                  id: "firstThird",
                  label: isEn ? "First Third" : "أول الليل",
                  desc: isEn ? "Alert when first third of night begins" : "تنبيه بدخول وقت أول الليل",
                },
                {
                  id: "midnight",
                  label: isEn ? "Midnight" : "منتصف الليل",
                  desc: isEn ? "Alert when Islamic midnight begins" : "تنبيه بدخول منتصف الليل الشرعي",
                },
                {
                  id: "lastThird",
                  label: isEn ? "Last Third" : "الثلث الأخير",
                  desc: isEn ? "Alert when last third of night begins" : "تنبيه بدخول الثلث الأخير من الليل",
                },
              ].map((item) => {
                const isEnabled =
                  config.nightNotifications?.[
                    item.id as keyof typeof config.nightNotifications
                  ] ?? true;
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      toggleNightNotification(
                        item.id as "firstThird" | "midnight" | "lastThird",
                      )
                    }
                    className={`flex items-center justify-between p-2.5 rounded-2xl quran-raised-card transition-all cursor-pointer border-0 ${isEnabled ? "shadow-sm" : "opacity-75"}`}
                    style={{
                      backgroundColor: isEnabled
                        ? `${currentTheme.accent}15`
                        : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                      color: currentTheme.text,
                      border: "none",
                    }}
                  >
                    <div className={`flex flex-col gap-0.5 ${isRTL ? "text-right" : "text-left"}`}>
                      <span className="font-bold text-[11px]">
                        {item.label}
                      </span>
                      <span className="text-[9px] opacity-60 font-bold">{item.desc}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors flex-shrink-0 quran-raised-card`}
                      style={{
                        backgroundColor: isEnabled
                          ? currentTheme.accent
                          : `${currentTheme.text}20`,
                        color: isEnabled ? "#ffffff" : currentTheme.text,
                        border: "none",
                      }}
                    >
                      {isEnabled && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="space-y-2 pt-2"
            >
              <h4 className={`font-extrabold text-[10px] opacity-80 px-1 ${isRTL ? "text-right" : "text-left"}`}>
                {isEn ? "Adhkar & Tasbeeh" : "الأذكار والتسبيح"}
              </h4>
              {[
                {
                  id: "sabah",
                  label: isEn ? "Morning Adhkar" : "أذكار الصباح",
                  desc: isEn ? "Daily at 7:00 AM" : "تنبيه يومي الساعة 7:00 صباحاً",
                },
                {
                  id: "masaa",
                  label: isEn ? "Evening Adhkar" : "أذكار المساء",
                  desc: isEn ? "Daily at 4:30 PM" : "تنبيه يومي الساعة 4:30 عصراً",
                },
                {
                  id: "dua",
                  label: isEn ? "Dua Time" : "وقت الدعاء",
                  desc: isEn ? "Daily at 2:00 PM" : "تنبيه يومي الساعة 2:00 ظهراً",
                },
                {
                  id: "tasbeehMorning",
                  label: isEn ? "Morning Tasbeeh" : "التسبيح (صباحاً)",
                  desc: isEn ? "Daily at 10:30 AM" : "تنبيه يومي الساعة 10:30 صباحاً",
                },
                {
                  id: "tasbeehEvening",
                  label: isEn ? "Evening Tasbeeh" : "التسبيح (مساءً)",
                  desc: isEn ? "Daily at 8:00 PM" : "تنبيه يومي الساعة 8:00 مساءً",
                },
                {
                  id: "kahf",
                  label: isEn ? "Surah Al-Kahf" : "سورة الكهف",
                  desc: isEn ? "Weekly on Friday at 9:00 AM" : "تنبيه أسبوعي يوم الجمعة الساعة 9:00 صباحاً",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePhoneSetting(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl quran-raised-card transition-all cursor-pointer border-0 ${phoneSettings[item.id as keyof typeof phoneSettings] ? "shadow-sm" : "opacity-75"}`}
                  style={{
                    backgroundColor: phoneSettings[
                      item.id as keyof typeof phoneSettings
                    ]
                      ? `${currentTheme.accent}15`
                      : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                    color: currentTheme.text,
                    border: "none",
                  }}
                >
                  <div className={`flex flex-col gap-0.5 ${isRTL ? "text-right" : "text-left"}`}>
                    <span className="font-bold text-[11px]">{item.label}</span>
                    <span className="text-[9px] opacity-60">{item.desc}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors flex-shrink-0 app-3d-checkbox ${
                      phoneSettings[item.id as keyof typeof phoneSettings] ? "app-3d-checkbox-checked" : ""
                    }`}
                    style={{
                      backgroundColor: phoneSettings[
                        item.id as keyof typeof phoneSettings
                      ]
                        ? currentTheme.accent
                        : `${currentTheme.text}20`,
                      color: phoneSettings[
                        item.id as keyof typeof phoneSettings
                      ]
                        ? "#ffffff"
                        : currentTheme.text,
                    }}
                  >
                    {phoneSettings[item.id as keyof typeof phoneSettings] && (
                      <Check className="w-2.5 h-2.5 quran-3d-icon" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="space-y-2 pt-2"
              style={{ borderTop: `1px solid ${currentTheme.text}10` }}
            >
              <div className="flex items-center justify-between mb-1 px-1">
                <h4 className="font-bold text-[10px] opacity-80 flex items-center gap-1">
                  <VolumeX size={12} />
                  {isEn ? "Mute Prayer Audio Alerts" : "إيقاف التنبيهات الصوتية"}
                </h4>
                {isAudioMuted && (
                  <button
                    onClick={unmuteAudio}
                    className="text-[9px] quran-raised-btn border-0 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 rounded-lg font-bold cursor-pointer"
                  >
                    {isEn ? "Enable" : "تفعيل"}
                  </button>
                )}
              </div>
              {isAudioMuted && config.audioMutedUntil && (
                <p className="text-[9px] text-red-500 px-1">
                  {isEn ? "Muted until: " : "متوقفة حتى: "}
                  {new Date(config.audioMutedUntil).toLocaleDateString(isEn ? "en-US" : "ar-SA")}
                </p>
              )}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: isEn ? "Today" : "اليوم", days: 1 },
                  { label: isEn ? "2 Days" : "يومين", days: 2 },
                  { label: isEn ? "3 Days" : "3 أيام", days: 3 },
                  { label: isEn ? "1 Week" : "أسبوع", days: 7 },
                  { label: isEn ? "1 Month" : "شهر", days: 30 },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => muteAudioForDuration(opt.days)}
                    className="py-1.5 px-1 text-[9px] font-bold rounded-xl quran-raised-btn border-0 transition-all"
                    style={{
                      color: currentTheme.text,
                      backgroundColor: isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff",
                      border: "none",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MenuSection: React.FC<{
  title: string;
  children: React.ReactNode;
  iconColor: string;
  titleColor?: string;
  currentTheme?: any;
  isRTL?: boolean;
}> = ({ title, children, iconColor, titleColor = "#000000", currentTheme, isRTL = true }) => (
  <div className="flex flex-col flex-grow mb-1">
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
        className="text-[10.5px] font-extrabold whitespace-nowrap tracking-wide truncate block"
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
  currentTheme,
  "data-id": dataId,
  isRTL = true,
}) => (
  <button
    onClick={onClick}
    data-id={dataId}
    className={`flex items-center gap-2 py-2 px-2.5 my-0.5 rounded-2xl border-0 transition-all ${isRTL ? "text-right" : "text-left"} w-full whitespace-nowrap ${isSubItem ? "px-2 py-1.5" : ""} ${isActive ? "quran-raised-btn-selected" : "quran-raised-btn"}`}
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
      className={`${isSubItem ? "text-[10.5px]" : "text-[11.5px]"} font-bold truncate flex-1 min-w-0`}
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
