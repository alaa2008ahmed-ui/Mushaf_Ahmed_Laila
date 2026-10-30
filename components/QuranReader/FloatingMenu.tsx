import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import {
  Monitor,
  Smartphone,
  AppWindow,
  VolumeX,
  ChevronDown,
  List,
  Search,
  Brain,
  Calendar,
  Book,
  FileText,
  Headphones,
  Languages,
  Globe,
  Clock,
  Sun,
  Compass,
  Mic,
  Bookmark,
  BookText,
  Settings,
  Palette,
  Plus,
  Save,
  X,
  Heart,
  Calculator,
  Info,
  Download,
  Type,
  Shield,
  Bell,
  Check,
  Loader2,
  ChevronLeft,
  Grid,
  BookOpen,
  Menu,
} from "lucide-react";
import {
  THEMES,
  LIGHT_THEME_IDS,
  DARK_THEME_IDS,
  THEME_NAMES_EN,
  DEFAULT_SETTINGS,
  READERS,
  MEMORIZATION_READERS,
  getReadersForMode,
  isEnglishReader,
  BILINGUAL_READER_ID,
  TRANSLATION_READER_ID,
  FONTS,
  ENGLISH_FONTS,
  getFontsForMode,
  FONT_NAMES_EN,
  TAFSEERS,
  JUZ_MAP,
  SURAH_NAMES_AR,
  getCurrentLayoutContext,
  getQuranThemeForLayout,
  saveQuranThemeForLayout,
  syncQuranThemeToStorage,
  SURAH_NAMES_EN,
  SAJDAH_LOCATIONS,
  toArabic,
  isDarkQuranTheme,
} from "./constants";
import { quranData } from "../../utils/quranData";
import { usePrayerTimes } from "../../context/PrayerTimesContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { RECITERS as LISTEN_RECITERS } from "../../data/listenQuranData";
import { 
  getAvailableSurahsForReader, 
  getSurahsForJuz, 
  normalizeUrl, 
  simplifyName 
} from "../../utils/listenQuranUtils";
import { getReciterDisplayName } from "../../utils/listenQuranTranslations";
import { normalizeArabic } from "../../utils/voiceParser";
import { setupNotifications } from "../../utils/notifications";
import { QuranSpotlightGuide, getQuranGuideSeen } from "./QuranSpotlightGuide";
import { QURAN_SIDEBAR_STEPS } from "./quranGuideSteps";

interface FloatingMenuProps {
  page: string;
  isFloatingMenuOpen: boolean;
  floatingMenuRef: React.RefObject<HTMLDivElement>;
  openModal: (modalId: string, params?: any) => void;
  setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getToolbarStyle: (
    id: string,
    bg: string,
    text: string,
    border: string,
  ) => React.CSSProperties;
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
  isHideToolbarsEnabled: boolean;
  setIsHideToolbarsEnabled: (value: boolean) => void;
  isTransparentMode: boolean;
  setIsTransparentMode: (value: boolean) => void;
  bookmarks?: any[];
  deleteBookmark?: (id: number) => void;
  jumpToAyah?: (s: number, a: number, closeMenu?: boolean) => void;
  handleMushafTypeSelect: (type: string) => void;
  initialView?: string;
  onOpenMainGuide?: () => void;
}

const ALL_SHORTCUTS = [
  {
    id: "quran-download-parent",
    label: "تحميل القرآن",
    icon: <Download size={18} />,
  },
  {
    id: "tafseer-download",
    label: "تحميل التفسير",
    icon: <Download size={18} />,
  },
  {
    id: "interface-customization",
    label: "تخصيص الواجهة",
    icon: <Palette size={18} />,
  },
  { id: "audio", label: "القراء", icon: <Headphones size={18} /> },
  { id: "font-type", label: "نوع الخط", icon: <Type size={18} /> },
  { id: "notification-settings", label: "الإشعارات", icon: <Bell size={18} /> },
  { id: "sajdah-list", label: "آيات السجدة", icon: <Compass size={18} /> },
];

const DEFAULT_SHORTCUTS = [
  "quran-download-parent",
  "tafseer-download",
  "interface-customization",
  "audio",
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
  getToolbarStyle,
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
  isHideToolbarsEnabled,
  setIsHideToolbarsEnabled,
  isTransparentMode,
  setIsTransparentMode,
  bookmarks = [],
  deleteBookmark,
  jumpToAyah,
  initialView = "main",
  onOpenMainGuide,
}) => {
  const { applyPresetTheme: applyGlobalTheme } = useTheme();
  const { t, translateMenuItem, language, isRTL, formatNumber } = useLanguage();
  const isEn = language === 'en';
  const isDarkTheme = isDarkQuranTheme(currentTheme);
  const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tempShortcuts, setTempShortcuts] = useState<string[]>([]);

  //Selection State for Downloads
  const [selectedReader, setSelectedReader] = useState("");
  const [readerSearch, setReaderSearch] = useState("");
  const [selectedTafsir, setSelectedTafsir] = useState(
    settings.tafseer || TAFSEERS[0].id,
  );
  const [selectedSurahs, setSelectedSurahs] = useState<string[]>([]);
  const [selectedJuzs, setSelectedJuzs] = useState<string[]>([]);
  const [downloadedSurahs, setDownloadedSurahs] = useState<string[]>([]);
  const [downloadedJuzs, setDownloadedJuzs] = useState<string[]>([]);
  const [downloadedTafseers, setDownloadedTafseers] = useState<string[]>([]);
  const [dynamicMapping, setDynamicMapping] = useState<Record<string, number[]> | null>(null);

  // Background fetch of reciter surahs availability if not cached
  useEffect(() => {
    try {
      const CACHE_KEY = "mp3quran_surahs_cache_v6";
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.data) setDynamicMapping(parsed.data);
      } else {
        fetch("https://mp3quran.net/api/v3/reciters?language=ar")
          .then((res) => res.json())
          .then((data) => {
            const mapping: Record<string, number[]> = {};
            if (data.reciters && Array.isArray(data.reciters)) {
              data.reciters.forEach((r: any) => {
                const nameKey = `name:${simplifyName(r.name)}`;
                if (r.moshaf && Array.isArray(r.moshaf)) {
                  r.moshaf.forEach((m: any) => {
                    const rawSuras = m.suras || m.surah_list;
                    if (m.server && rawSuras) {
                      const surasArray =
                        typeof rawSuras === "string"
                          ? rawSuras.split(",").map(Number)
                          : Array.isArray(rawSuras)
                            ? rawSuras
                            : [];
                      const urlKey = normalizeUrl(m.server);
                      if (urlKey) mapping[urlKey] = surasArray;
                      if (!mapping[nameKey]) {
                        mapping[nameKey] = surasArray;
                      } else {
                        mapping[nameKey] = Array.from(
                          new Set([...mapping[nameKey], ...surasArray]),
                        );
                      }
                    }
                  });
                }
              });
              localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({
                  data: mapping,
                  timestamp: Date.now(),
                }),
              );
              setDynamicMapping(mapping);
            }
          })
          .catch((e) =>
            console.warn("Could not fetch reciter surahs in background:", e),
          );
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Download Status State
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  type MenuView =
    | "main"
    | "themes"
    | "download_quran_menu"
    | "download_tafseer"
    | "audio"
    | "interface"
    | "font"
    | "notifications"
    | "download_quran"
    | "download_listening"
    | "download_memorization"
    | "bookmarks"
    | "sajdah_list"
    | "sajdah_info";
  const [currentView, setCurrentView] = useState<MenuView>("main");
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const [mainSidebarWidth, setMainSidebarWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (currentView !== "main" || isAddModalOpen) return;
    const measureMainWidth = () => {
      const el = menuContainerRef.current;
      if (el && el.offsetWidth > 0) {
        setMainSidebarWidth((prev) => (prev === el.offsetWidth ? prev : el.offsetWidth));
      }
    };
    measureMainWidth();
    window.addEventListener("resize", measureMainWidth);
    return () => window.removeEventListener("resize", measureMainWidth);
  }, [currentView, isAddModalOpen, isFloatingMenuOpen, language, isLandscape, readingMode, selectedShortcuts]);

  // Initialize selectedReader based on view
  useEffect(() => {
    if (!selectedReader) {
      if (currentView === "download_quran") {
        setSelectedReader(READERS[0].id);
      } else if (currentView === "download_memorization") {
        setSelectedReader(MEMORIZATION_READERS[0].id);
      } else if (currentView === "download_listening") {
        setSelectedReader(LISTEN_RECITERS[0].id);
      }
    }
  }, [currentView, selectedReader]);

  // Sync selectedReader when view changes to ensure it's valid for the current list
  useEffect(() => {
    if (currentView === "download_quran") {
      if (selectedReader && !READERS.some((r) => r.id === selectedReader)) {
        setSelectedReader(READERS[0].id);
        setSelectedSurahs([]);
        setSelectedJuzs([]);
      }
    } else if (currentView === "download_memorization") {
      if (
        selectedReader &&
        !MEMORIZATION_READERS.some((r) => r.id === selectedReader)
      ) {
        setSelectedReader(MEMORIZATION_READERS[0].id);
        setSelectedSurahs([]);
        setSelectedJuzs([]);
      }
    } else if (currentView === "download_listening") {
      if (selectedReader && !LISTEN_RECITERS.some((r) => r.id === selectedReader)) {
        setSelectedReader(LISTEN_RECITERS[0].id);
        setSelectedSurahs([]);
        setSelectedJuzs([]);
      }
    }
  }, [currentView, selectedReader]);

  const currentReadersList = useMemo(() => {
    if (currentView === "download_memorization") return MEMORIZATION_READERS;
    if (currentView === "download_listening") return LISTEN_RECITERS;
    return READERS;
  }, [currentView]);

  const filteredCurrentReaders = useMemo(() => {
    if (!readerSearch.trim()) return currentReadersList;
    const q = readerSearch.trim().toLowerCase();
    const norm = normalizeArabic(q);
    return currentReadersList.filter((r) => {
      const ar = normalizeArabic(r.name.toLowerCase());
      const en = getReciterDisplayName(r.name, 'en').toLowerCase();
      return ar.includes(norm) || en.includes(q);
    });
  }, [currentReadersList, readerSearch]);

  const selectedReaderObj = useMemo(() => {
    return currentReadersList.find((r) => r.id === selectedReader);
  }, [currentReadersList, selectedReader]);

  // Available surahs for current reader when in download_listening mode
  const availableSurahNumbers = useMemo(() => {
    if (currentView !== "download_listening") {
      return Array.from({ length: 114 }, (_, i) => i + 1);
    }
    if (!selectedReader) return Array.from({ length: 114 }, (_, i) => i + 1);
    const rObj = LISTEN_RECITERS.find((r) => r.id === selectedReader);
    return getAvailableSurahsForReader(selectedReader, rObj?.name, dynamicMapping || undefined);
  }, [currentView, selectedReader, dynamicMapping]);

  // List of surahs filtered for current reader
  const availableSurahsList = useMemo(() => {
    const fullSurahs = Array.from({ length: 114 }, (_, i) => ({
      number: i + 1,
      name: SURAH_NAMES_AR[i] || `سورة ${i + 1}`,
    }));
    if (currentView !== "download_listening") {
      return fullSurahs;
    }
    return fullSurahs.filter((s) => availableSurahNumbers.includes(s.number));
  }, [currentView, availableSurahNumbers]);

  // --- Download Logic Helpers ---
  const getSanitizedReaderId = useCallback((readerId: string) => {
    return readerId.replace(/[^a-zA-Z0-9_-]/g, "_");
  }, []);

  const getLegacySanitizedReaderId = useCallback((readerId: string) => {
    if (readerId.startsWith("http")) {
      return readerId
        .replace(/https?:\/\//, "")
        .replace(/\//g, "_")
        .replace(/\./g, "_");
    }
    return readerId;
  }, []);

  // Check downloaded items for current selection
  const checkDownloads = useCallback(() => {
    if (currentView === "download_tafseer") {
      if (!selectedTafsir) {
        setDownloadedTafseers([]);
        return;
      }
      try {
        const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_tafsir_files') || '[]');
        const downloadedSet = new Set(downloadedFiles.map((f: any) => f.fileName));
        const dSurahs: string[] = [];
        for (let s = 1; s <= 114; s++) {
          if (downloadedSet.has(`${selectedTafsir}_${s}_tafsir.json`)) {
            dSurahs.push(s.toString());
          }
        }
        setDownloadedTafseers(dSurahs);

        const dJuzs: string[] = [];
        for (let j = 1; j <= 30; j++) {
          const ayahs = getAyahsForJuz(j);
          const surahsInJuz = new Set(ayahs.map(a => a.surah));
          let allSurahsDownloaded = true;
          for (const s of surahsInJuz) {
            if (!downloadedSet.has(`${selectedTafsir}_${s}_tafsir.json`)) {
              allSurahsDownloaded = false;
              break;
            }
          }
          if (allSurahsDownloaded) dJuzs.push(j.toString());
        }
        setDownloadedJuzs(dJuzs);
      } catch (e) {
        console.error('Error checking tafsir downloads:', e);
      }
      return;
    }

    if (!selectedReader) {
      setDownloadedSurahs([]);
      setDownloadedJuzs([]);
      return;
    }

    try {
      const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
      const downloadedSet = new Set(downloadedFiles.filter((f: any) => (f.size || 0) > 1000).map((f: any) => f.fileName));
      const sanitizedId = getSanitizedReaderId(selectedReader);
      const legacySanitizedId = getLegacySanitizedReaderId(selectedReader);
      const isSurahMode = currentView === "download_listening";

      const isAudioFileDownloaded = (suffix: string) => {
        return (
          downloadedSet.has(`${sanitizedId}_${suffix}`) ||
          downloadedSet.has(`${legacySanitizedId}_${suffix}`)
        );
      };

      const dSurahs: string[] = [];
      const surahsToCheck = currentView === "download_listening"
        ? availableSurahNumbers
        : Array.from({ length: 114 }, (_, i) => i + 1);

      for (const s of surahsToCheck) {
        let allItemsDownloaded = true;
        if (isSurahMode) {
          const sNumStr = String(s).padStart(3, "0");
          if (!isAudioFileDownloaded(`${sNumStr}.mp3`)) allItemsDownloaded = false;
        } else {
          const surahData = quranData.surahs.find((sd: any) => sd.number === s);
          if (!surahData) {
            allItemsDownloaded = false;
          } else {
            for (let i = 1; i <= surahData.ayahs.length; i++) {
              if (!isAudioFileDownloaded(`${s}_${i}.mp3`)) {
                allItemsDownloaded = false;
                break;
              }
            }
          }
        }
        if (allItemsDownloaded) dSurahs.push(s.toString());
      }

      const dJuzs: string[] = [];
      for (let j = 1; j <= 30; j++) {
        if (isSurahMode) {
          const surahsInJuz = getSurahsForJuz(j).filter((sNum) => availableSurahNumbers.includes(sNum));
          if (surahsInJuz.length > 0) {
            let allItemsDownloaded = true;
            for (const sNum of surahsInJuz) {
              const sNumStr = String(sNum).padStart(3, "0");
              if (!isAudioFileDownloaded(`${sNumStr}.mp3`)) {
                allItemsDownloaded = false;
                break;
              }
            }
            if (allItemsDownloaded) dJuzs.push(j.toString());
          }
        } else {
          const ayahs = getAyahsForJuz(j);
          let allItemsDownloaded = true;
          for (const a of ayahs) {
            if (!isAudioFileDownloaded(`${a.surah}_${a.ayah}.mp3`)) {
              allItemsDownloaded = false;
              break;
            }
          }
          if (allItemsDownloaded) dJuzs.push(j.toString());
        }
      }
      setDownloadedSurahs(dSurahs);
      setDownloadedJuzs(dJuzs);
    } catch (e) {
      console.error('Error checking downloads:', e);
    }
  }, [selectedReader, selectedTafsir, currentView, availableSurahNumbers, getSanitizedReaderId, getLegacySanitizedReaderId]);

  useEffect(() => {
    checkDownloads();
    // Re-check on local storage changes (from other tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'downloaded_audio_files' || e.key === 'downloaded_tafsir_files') {
        checkDownloads();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [checkDownloads]);

  // Check if all selected items are already downloaded
  const isAllSelectedDownloaded = () => {
    if (selectedSurahs.length === 0 && selectedJuzs.length === 0) return false;
    
    if (currentView === "download_tafseer") {
      if (selectedSurahs.includes("all")) return downloadedTafseers.length === 114;
      for (const s of selectedSurahs) {
        if (!downloadedTafseers.includes(s)) return false;
      }
      for (const j of selectedJuzs) {
        if (!downloadedJuzs.includes(j)) return false;
      }
      return true;
    } else {
      if (selectedSurahs.includes("all")) {
        return (
          availableSurahsList.length > 0 &&
          availableSurahsList.every((s) => downloadedSurahs.includes(s.number.toString()))
        );
      }
      for (const s of selectedSurahs) {
        if (!downloadedSurahs.includes(s)) return false;
      }
      for (const j of selectedJuzs) {
        if (!downloadedJuzs.includes(j)) return false;
      }
      return true;
    }
  };

  const [isSidebarGuideOpen, setIsSidebarGuideOpen] = useState(false);

  useEffect(() => {
    if (isFloatingMenuOpen) {
      setCurrentView(initialView as MenuView);
      setIsAddModalOpen(false);

      if (!getQuranGuideSeen("sidebar_menu_v2")) {
        const timer = setTimeout(() => {
          setIsSidebarGuideOpen(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    } else {
      setIsSidebarGuideOpen(false);
    }
  }, [isFloatingMenuOpen, initialView]);

  useEffect(() => {
    if (currentView !== "main") {
      setIsSidebarGuideOpen(false);
    }
  }, [currentView]);

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

  const saveShortcuts = () => {
    setSelectedShortcuts(tempShortcuts);
    localStorage.setItem("quran_menu_shortcuts", JSON.stringify(tempShortcuts));
    setIsAddModalOpen(false);
  };

  // --- Download Storage and Execution ---
  const storeAudioOffline = (fileName: string, blob: Blob) => {
    try {
      const downloadedFiles = JSON.parse(
        localStorage.getItem("downloaded_audio_files") || "[]",
      );
      const fileRecord = { fileName, timestamp: Date.now(), size: blob.size };
      const existingIndex = downloadedFiles.findIndex(
        (file: any) => file.fileName === fileName,
      );
      if (existingIndex !== -1) downloadedFiles[existingIndex] = fileRecord;
      else downloadedFiles.push(fileRecord);
      localStorage.setItem(
        "downloaded_audio_files",
        JSON.stringify(downloadedFiles),
      );
    } catch (e) {
      console.error("Error storing audio offline:", e);
    }
  };

  const storeTafsirOffline = (fileName: string, data: any) => {
    try {
      const downloadedTafsir = JSON.parse(
        localStorage.getItem("downloaded_tafsir_files") || "[]",
      );
      const fileRecord = { fileName, data, timestamp: Date.now() };
      const existingIndex = downloadedTafsir.findIndex(
        (file: any) => file.fileName === fileName,
      );
      if (existingIndex !== -1) downloadedTafsir[existingIndex] = fileRecord;
      else downloadedTafsir.push(fileRecord);
      localStorage.setItem(
        "downloaded_tafsir_files",
        JSON.stringify(downloadedTafsir),
      );
      localStorage.setItem(`tafsir_content_${fileName}`, JSON.stringify(data));
    } catch (e) {
      console.error("Error storing tafsir offline:", e);
    }
  };

  const downloadAyah = async (
    readerId: string,
    surah: number,
    ayah: number,
  ) => {
    if (!readerId) return;
    if (readerId.startsWith("http")) {
      // Cannot download individual ayahs from full URL servers
      return;
    }

    const surahStr = String(surah).padStart(3, "0");
    const ayahStr = String(ayah).padStart(3, "0");
    const url = `https://everyayah.com/data/${readerId}/${surahStr}${ayahStr}.mp3`;
    const sanitizedId = getSanitizedReaderId(readerId);
    const fileName = `${sanitizedId}_${surah}_${ayah}.mp3`;

    try {
      if ("caches" in window) {
        const cache = await caches.open("quran-audio-cache");
        const match = await cache.match(url);
        if (match) {
          const blob = await match.blob();
          storeAudioOffline(fileName, blob);
          return;
        }

        const response = await fetch(url, {
          signal: abortControllerRef.current?.signal,
        });
        if (!response.ok) throw new Error(`فشل التحميل: ${response.status}`);

        const blob = await response.blob();
        // Check if it's a valid mp3 (not an error page)
        if (blob.size < 1000) return;

        await cache.put(
          url,
          new Response(blob, {
            headers: { "Content-Type": "audio/mpeg" },
          }),
        );
        storeAudioOffline(fileName, blob);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("Download Ayah Error:", e);
        throw e;
      }
    }
  };

  const downloadSurahFile = async (readerId: string, surah: number) => {
    if (!readerId) return;
    const surahStr = String(surah).padStart(3, "0");
    let url = "";
    if (readerId.startsWith("http")) {
      const baseUrl = readerId.endsWith("/") ? readerId.slice(0, -1) : readerId;
      url = `${baseUrl}/${surahStr}.mp3`;
    } else {
      url = `https://everyayah.com/data/${readerId}/${surahStr}.mp3`;
    }
    const sanitizedId = getSanitizedReaderId(readerId);
    const fileName = `${sanitizedId}_${surahStr}.mp3`;

    try {
      if ("caches" in window) {
        const cache = await caches.open("quran-audio-cache");
        const match = await cache.match(url);
        if (match) {
          const blob = await match.blob();
          storeAudioOffline(fileName, blob);
          return;
        }

        const response = await fetch(url, {
          signal: abortControllerRef.current?.signal,
        });
        if (!response.ok) throw new Error(`فشل التحميل: ${response.status} ${response.statusText}`);

        const blob = await response.blob();
        if (blob.size < 1000) return;

        await cache.put(
          url,
          new Response(blob, {
            headers: { "Content-Type": "audio/mpeg" },
          }),
        );
        storeAudioOffline(fileName, blob);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("Download Surah Error:", e);
        throw e;
      }
    }
  };

  const downloadSpecificTafsir = async (
    tafsirId: string,
    surahNumber: number,
  ) => {
    const fileName = `${tafsirId}_${surahNumber}_tafsir.json`;
    // Check if already downloaded
    if (localStorage.getItem(`tafsir_content_${fileName}`)) {
      return;
    }
    const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/${tafsirId}`;
    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current?.signal,
      });
      if (!response.ok)
        throw new Error(`فشل تحميل التفسير: ${response.status}`);
      const data = await response.json();
      storeTafsirOffline(fileName, data.data);
      checkDownloads(); // Refresh status
    } catch (e) {
      if ((e as Error).name !== "AbortError") throw e;
    }
  };

  const getAyahsForJuz = (juzNumber: number) => {
    const ayahsToDownload: { surah: number; ayah: number }[] = [];
    const startJuz = JUZ_MAP[juzNumber - 1];
    const endJuz = juzNumber < 30 ? JUZ_MAP[juzNumber] : null;
    let currentSurah = startJuz.s;
    let currentAyah = startJuz.a;
    while (true) {
      if (endJuz && currentSurah === endJuz.s && currentAyah === endJuz.a)
        break;
      ayahsToDownload.push({ surah: currentSurah, ayah: currentAyah });
      const surahData = quranData.surahs.find(
        (s: any) => s.number === currentSurah,
      );
      if (!surahData) break;
      if (currentAyah < surahData.ayahs.length) currentAyah++;
      else {
        currentSurah++;
        currentAyah = 1;
        if (currentSurah > 114) break;
      }
    }
    return ayahsToDownload;
  };

  const startDownload = async (
    type: "quran" | "tafseer",
    mode: "ayah" | "surah" = "ayah",
  ) => {
    if (isDownloading) {
      abortControllerRef.current?.abort();
      setIsDownloading(false);
      setStatus("تم إيقاف التحميل");
      return;
    }

    if (selectedSurahs.length === 0 && selectedJuzs.length === 0) {
      showToast("الرجاء اختيار السور أو الأجزاء أولاً");
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setStatus("جاري التحضير...");
    abortControllerRef.current = new AbortController();

    try {
      if (type === "quran") {
        const itemsToDownload = new Set<string>();

        if (selectedSurahs.includes("all")) {
          const surahsToAdd = currentView === "download_listening"
            ? availableSurahNumbers
            : Array.from({ length: 114 }, (_, i) => i + 1);

          for (const s of surahsToAdd) {
            if (mode === "surah") {
              itemsToDownload.add(`${s}_0`);
            } else {
              const surahData = quranData.surahs.find((sd: any) => sd.number === s);
              if (surahData) {
                for (let a = 1; a <= surahData.ayahs.length; a++) {
                  itemsToDownload.add(`${s}_${a}`);
                }
              }
            }
          }
        } else {
          // Add selected surahs
          for (const sStr of selectedSurahs) {
            const s = parseInt(sStr);
            if (currentView === "download_listening" && !availableSurahNumbers.includes(s)) {
              continue;
            }
            if (mode === "surah") {
              itemsToDownload.add(`${s}_0`);
            } else {
              const surahData = quranData.surahs.find((sd: any) => sd.number === s);
              if (surahData) {
                for (let a = 1; a <= surahData.ayahs.length; a++) {
                  itemsToDownload.add(`${s}_${a}`);
                }
              }
            }
          }
          // Add selected juzs
          for (const jStr of selectedJuzs) {
            const jNum = parseInt(jStr);
            if (mode === "surah") {
              const surahsInJuz = getSurahsForJuz(jNum).filter((sNum) =>
                currentView === "download_listening" ? availableSurahNumbers.includes(sNum) : true
              );
              for (const s of surahsInJuz) {
                itemsToDownload.add(`${s}_0`);
              }
            } else {
              const juzAyahs = getAyahsForJuz(jNum);
              for (const item of juzAyahs) {
                itemsToDownload.add(`${item.surah}_${item.ayah}`);
              }
            }
          }
        }

        // Filter out already downloaded items
        const downloadedAudio = JSON.parse(
          localStorage.getItem("downloaded_audio_files") || "[]",
        );
        const downloadedAudioSet = new Set(
          downloadedAudio.map((f: any) => f.fileName),
        );
        const sanitizedId = getSanitizedReaderId(selectedReader);
        const legacySanitizedId = getLegacySanitizedReaderId(selectedReader);

        const parsedItems: { s: number; a: number }[] = [];
        let alreadyDownloadedCount = 0;

        itemsToDownload.forEach((key) => {
          const [s, a] = key.split("_").map(Number);
          let isAlreadyDownloaded = false;
          if (a === 0) {
            const sStr = String(s).padStart(3, "0");
            const file1 = `${sanitizedId}_${sStr}.mp3`;
            const file2 = `${legacySanitizedId}_${sStr}.mp3`;
            if (downloadedAudioSet.has(file1) || downloadedAudioSet.has(file2)) {
              isAlreadyDownloaded = true;
            }
          } else {
            const file1 = `${sanitizedId}_${s}_${a}.mp3`;
            const file2 = `${legacySanitizedId}_${s}_${a}.mp3`;
            if (downloadedAudioSet.has(file1) || downloadedAudioSet.has(file2)) {
              isAlreadyDownloaded = true;
            }
          }

          if (isAlreadyDownloaded) {
            alreadyDownloadedCount++;
          } else {
            parsedItems.push({ s, a });
          }
        });

        if (parsedItems.length === 0 && itemsToDownload.size > 0) {
          setStatus("جميع العناصر المحددة محملة مسبقاً");
          showToast("جميع العناصر المحددة محملة مسبقاً");
          setIsDownloading(false);
          return;
        }

        if (alreadyDownloadedCount > 0) {
          showToast(`تم تخطي ${alreadyDownloadedCount} ${mode === "surah" ? "سورة" : "آية"} محملة مسبقاً`);
        }

        parsedItems.sort((a, b) => {
          if (a.s !== b.s) return a.s - b.s;
          return a.a - b.a;
        });

        const total = parsedItems.length;
        let downloaded = 0;
        let failedCount = 0;

        for (let i = 0; i < total; i++) {
          if (abortControllerRef.current?.signal.aborted) break;
          const item = parsedItems[i];
          const surahName = SURAH_NAMES_AR[item.s - 1] || `سورة ${item.s}`;

          if (item.a === 0) {
            setStatus(
              `جاري تحميل ${surahName} (${downloaded + 1}/${total}) - ${Math.round(((downloaded + failedCount) / total) * 100)}%`
            );
            try {
              await downloadSurahFile(selectedReader, item.s);
              downloaded++;
            } catch (err: any) {
              if (err.name === "AbortError" || err.message === "Aborted") throw err;
              console.warn(`Surah download error ${item.s}:`, err);
              failedCount++;
            }
          } else {
            setStatus(
              `جاري تحميل آية ${item.a} من ${surahName} (${downloaded + 1}/${total}) - ${Math.round(((downloaded + failedCount) / total) * 100)}%`
            );
            try {
              await downloadAyah(selectedReader, item.s, item.a);
              downloaded++;
            } catch (err: any) {
              if (err.name === "AbortError" || err.message === "Aborted") throw err;
              console.warn(`Ayah download error ${item.s}:${item.a}:`, err);
              failedCount++;
            }
          }

          setProgress(((downloaded + failedCount) / total) * 100);
        }

        checkDownloads();

        if (!abortControllerRef.current?.signal.aborted) {
          setProgress(100);
          if (failedCount === 0) {
            setStatus(isEn ? "Download completed successfully!" : "تم التحميل بنجاح!");
            showToast(isEn ? "Download completed successfully!" : "تم التحميل بنجاح!");
          } else if (downloaded > 0) {
            setStatus(isEn ? `Downloaded ${downloaded} items (failed ${failedCount})` : `تم تحميل ${downloaded} عنصر (تعذر ${failedCount})`);
            showToast(isEn ? `Downloaded ${downloaded} items (failed ${failedCount})` : `تم تحميل ${downloaded} عنصر (تعذر ${failedCount})`);
          } else {
            setStatus(isEn ? "Failed to download items" : "تعذر تحميل العناصر");
            showToast(isEn ? "Failed to download items" : "تعذر تحميل العناصر");
          }
        }
      } else {
        // Tafseer download
        const surahsToDownload = new Set<number>();
        if (selectedSurahs.includes("all")) {
          for (let s = 1; s <= 114; s++) surahsToDownload.add(s);
        } else {
          selectedSurahs.forEach((s) => surahsToDownload.add(parseInt(s)));
          selectedJuzs.forEach((j) => {
            const juzAyahs = getAyahsForJuz(parseInt(j));
            juzAyahs.forEach((a) => surahsToDownload.add(a.surah));
          });
        }

        const itemsList = Array.from(surahsToDownload).sort((a, b) => a - b);

        // Filter out already downloaded tafseers
        const downloadedTafseer = JSON.parse(
          localStorage.getItem("downloaded_tafsir_files") || "[]",
        );
        const downloadedTafseerSet = new Set(
          downloadedTafseer.map((f: any) => f.fileName),
        );

        const finalTafseersToDownload = itemsList.filter((s) => {
          const fileName = `${selectedTafsir}_${s}_tafsir.json`;
          return !downloadedTafseerSet.has(fileName);
        });

        const total = finalTafseersToDownload.length;
        if (total === 0 && itemsList.length > 0) {
          setStatus(isEn ? "All selected tafseers are already downloaded" : "جميع التفاسير المحددة محملة مسبقاً");
          showToast(isEn ? "All selected tafseers are already downloaded" : "جميع التفاسير المحددة محملة مسبقاً");
          setIsDownloading(false);
          return;
        }

        const skippedCount = itemsList.length - total;
        if (skippedCount > 0) {
          showToast(isEn ? `Skipped ${skippedCount} already downloaded tafseers` : `تم تخطي ${skippedCount} تفسير محمل مسبقاً`);
        }

        for (let i = 0; i < total; i++) {
          if (abortControllerRef.current?.signal.aborted) break;
          const s = finalTafseersToDownload[i];
          const sName = isEn ? (SURAH_NAMES_EN[s - 1] || SURAH_NAMES_AR[s - 1]) : SURAH_NAMES_AR[s - 1];
          setStatus(isEn ? `Downloading Tafseer for Surah ${sName}...` : `جاري تحميل تفسير سورة ${SURAH_NAMES_AR[s - 1]}...`);
          await downloadSpecificTafsir(selectedTafsir, s);
          setProgress(((i + 1) / total) * 100);
        }

        checkDownloads();

        if (!abortControllerRef.current?.signal.aborted) {
          setStatus("تم التحميل بنجاح");
          showToast("تم التحميل بنجاح");
        }
      }
    } catch (e: any) {
      console.error("Download Error:", e);
      setStatus(`خطأ: ${e.message || "حدث خطأ أثناء التحميل"}`);
      showToast("خطأ في التحميل");
    } finally {
      setIsDownloading(false);
      abortControllerRef.current = null;
    }
  };

  const toggleSelection = (id: string, type: "surah" | "juz") => {
    if (type === "surah") {
      if (id === "all") {
        setSelectedSurahs((prev) => (prev.includes("all") ? [] : ["all"]));
        setSelectedJuzs([]);
      } else {
        setSelectedSurahs((prev) => {
          const filtered = prev.filter((s) => s !== "all");
          return filtered.includes(id)
            ? filtered.filter((s) => s !== id)
            : [...filtered, id];
        });
      }
    } else {
      const jNum = parseInt(id);
      if (currentView === "download_listening") {
        const surahsInJuz = getSurahsForJuz(jNum).filter((s) => availableSurahNumbers.includes(s));
        if (surahsInJuz.length === 0) {
          showToast("لا توجد سور مسجلة لهذا القارئ في هذا الجزء");
          return;
        }
      }

      setSelectedJuzs((prev) => {
        const filteredSurahs = selectedSurahs.filter((s) => s !== "all");
        if (filteredSurahs.length !== selectedSurahs.length)
          setSelectedSurahs(filteredSurahs);
        return prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id];
      });
    }
  };

  const iconColor = currentTheme.accent || "#000000";
  const sidebarIconColor = currentTheme.id === 'black' ? '#14b8a6' : iconColor;
  const [, setThemeChangeTick] = useState(0);

  const applyTheme = (themeId: string) => {
    const theme = THEMES[themeId as keyof typeof THEMES];
    if (!theme) return;

    const posSuffix = isMemorizationMode
      ? `_memorization_${isLandscape ? "h" : "v"}`
      : isWirdMode
        ? `_wird_${isLandscape ? "h" : "v"}`
        : readingMode === "mushaf"
          ? isLandscape
            ? "_h"
            : "_v"
          : `_${readingMode}_${isLandscape ? "h" : "v"}`;

    const modeSuffix = posSuffix;
    const layout = getCurrentLayoutContext();
    saveQuranThemeForLayout(themeId, layout, modeSuffix);
    syncQuranThemeToStorage(theme, modeSuffix);

    setThemeChangeTick((prev) => prev + 1);
    window.dispatchEvent(new Event("theme-change"));
    showToast(isEn ? `Theme applied: ${THEME_NAMES_EN[themeId] || t(`theme.${themeId}`, theme.name)}` : `تم تطبيق ثيم: ${theme.name}`);
  };

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
        className={`fixed ${isLandscape ? "top-0 bottom-0" : "top-[calc(3.5rem+var(--logical-safe-top))] bottom-[calc(3.5rem+var(--logical-safe-bottom))]"} ${isRTL ? "right-0" : "left-0"} z-[1060] flex items-start gap-4 pointer-events-none`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* The Main Menu Container */}
        <div
          id="floating-menu"
          ref={menuContainerRef}
          className={`${
            currentView === "main" && !isAddModalOpen
              ? "w-max max-w-[85vw]"
              : currentView === "themes"
                ? mainSidebarWidth
                  ? "max-w-[85vw]"
                  : "w-[155px] max-w-[85vw]"
                : "w-[200px] max-w-[85vw]"
          } ${isLandscape ? "rounded-none" : isRTL ? "rounded-l-2xl" : "rounded-r-2xl"} shadow-2xl transition-all duration-300 ${isRTL ? "origin-top-right" : "origin-top-left"} flex flex-col pointer-events-auto h-full ${isFloatingMenuOpen ? "opacity-100 visible scale-100 translate-y-0" : "opacity-0 invisible scale-95 -translate-y-4"}`}
          style={{
            ...(currentView === "themes" && mainSidebarWidth
              ? {
                  width: `${mainSidebarWidth}px`,
                  minWidth: `${mainSidebarWidth}px`,
                  maxWidth: `${mainSidebarWidth}px`,
                }
              : {}),
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
          {isAddModalOpen ? (
            /* Customization Content (Replacing Main Menu) */
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg quran-raised-card flex items-center justify-center border-0">
                    <Plus size={16} className="quran-3d-icon" style={{ color: iconColor }} />
                  </div>
                  <h3
                    className="font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {isEn ? "Customize Shortcuts" : "تخصيص الاختصارات"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-7 h-7 rounded-lg quran-raised-btn flex items-center justify-center transition-colors border-0"
                  style={{ color: currentTheme.text }}
                >
                  <X size={15} className="quran-3d-icon" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-3 custom-scrollbar">
                <div className="flex flex-col gap-1.5">
                  {ALL_SHORTCUTS.map((shortcut) => {
                    const isSelected = tempShortcuts.includes(shortcut.id);
                    return (
                      <button
                        key={shortcut.id}
                        onClick={() => {
                          if (isSelected) {
                            setTempShortcuts(
                              tempShortcuts.filter((id) => id !== shortcut.id),
                            );
                          } else {
                            setTempShortcuts([...tempShortcuts, shortcut.id]);
                          }
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${isRTL ? "text-right" : "text-left"} w-full border-0 ${isSelected ? "quran-raised-btn-selected text-white" : "quran-raised-btn"}`}
                        style={{
                          backgroundColor: isSelected
                            ? (currentTheme.accent || "#10b981")
                            : (isDarkTheme ? (currentTheme?.btnBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                          border: isDarkTheme && !isSelected ? "1px solid rgba(255,255,255,0.1)" : "none",
                        }}
                      >
                        <div
                          style={{ color: isSelected ? "#ffffff" : iconColor }}
                          className="quran-3d-icon shrink-0"
                        >
                          {shortcut.icon}
                        </div>
                        <span
                          className={`text-xs flex-1 truncate transition-all font-bold`}
                          style={{ color: isSelected ? "#ffffff" : (isDarkTheme ? (currentTheme?.btnText || currentTheme.text || "#ffffff") : currentTheme.text) }}
                        >
                          {translateMenuItem(shortcut.id, shortcut.label)}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${isSelected ? "bg-white/20 text-white" : "opacity-40"}`}
                        >
                          {isSelected && <Check size={12} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 flex gap-2">
                <button
                  onClick={saveShortcuts}
                  className="flex-1 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn-selected border-0"
                  style={{ backgroundColor: iconColor, border: "none" }}
                >
                  <Save size={15} className="quran-3d-icon" />
                  {isEn ? "Save" : "حفظ"}
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs quran-raised-btn border-0"
                  style={{
                    backgroundColor: isDarkTheme ? (currentTheme?.btnBg || "rgba(255,255,255,0.08)") : "#ffffff",
                    color: isDarkTheme ? (currentTheme?.btnText || currentTheme.text || "#ffffff") : currentTheme.text,
                    border: isDarkTheme ? "1px solid rgba(255,255,255,0.15)" : "none",
                  }}
                >
                  {isEn ? "Cancel" : "إلغاء"}
                </button>
              </div>
            </div>
          ) : currentView === "themes" ? (
            /* Themes View */
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3 flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Palette size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {isEn ? "Appearance" : "المظهر"}
                  </h3>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto overflow-x-hidden p-2.5 custom-scrollbar flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Toggles Section */}
                  <div
                    className="space-y-3 p-3 rounded-2xl quran-raised-card border-0"
                    style={{
                      backgroundColor: isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff",
                      border: isDarkTheme ? "1px solid rgba(255,255,255,0.12)" : "none",
                    }}
                  >
                    {/* قفل لون التحديد */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const newVal = !settings?.lockHighlightColor;
                        updateSetting("lockHighlightColor", newVal);
                        showToast(
                          newVal
                            ? (isEn ? "Highlight color locked" : "تم قفل لون التحديد")
                            : (isEn ? "Highlight color unlocked" : "تم إلغاء قفل لون التحديد")
                        );
                      }}
                      className="flex items-center justify-between gap-2 cursor-pointer select-none group"
                    >
                      <span
                        className="text-xs font-bold leading-tight min-w-0 truncate"
                        style={{ color: isDarkTheme ? (currentTheme?.cardText || currentTheme?.text || "#ffffff") : currentTheme.text }}
                      >
                        {isEn ? "Lock Highlight Color" : "قفل لون التحديد"}
                      </span>
                      {/* زر مجسم وبارز 3D */}
                      <div
                        dir="ltr"
                        className="relative w-[35px] h-[19px] rounded-full p-0.5 shrink-0 transition-colors duration-300 flex items-center"
                        style={{
                          background: settings?.lockHighlightColor
                            ? "linear-gradient(180deg, #10b981 0%, #059669 100%)"
                            : "linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)",
                          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35), inset 0 1px 1px rgba(0,0,0,0.2), 0 1px 1px rgba(255,255,255,0.8)",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 ease-out"
                          style={{
                            transform: settings?.lockHighlightColor ? "translateX(16px)" : "translateX(0px)",
                            background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.35), 0 1px 1px rgba(0,0,0,0.2), inset 0 1px 1px #ffffff",
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                            style={{
                              backgroundColor: settings?.lockHighlightColor ? "#10b981" : "#cbd5e1",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* إخفاء الأشرطة */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const newVal = !isTransparentMode;
                        setIsTransparentMode(newVal);
                        const modeSuffix =
                          readingMode === "mushaf"
                            ? isLandscape
                              ? "_h"
                              : "_v"
                            : `_${readingMode}_${isLandscape ? "h" : "v"}`;
                        localStorage.setItem(
                          "transparent_mode" + modeSuffix,
                          String(newVal),
                        );
                        window.dispatchEvent(new Event("settings-change"));
                        showToast(
                          newVal
                            ? (isEn ? "Hide toolbars enabled" : "تم تفعيل إخفاء الأشرطة")
                            : (isEn ? "Hide toolbars disabled" : "تم تعطيل إخفاء الأشرطة"),
                        );
                      }}
                      className="flex items-center justify-between gap-2 cursor-pointer select-none group"
                    >
                      <span
                        className="text-xs font-bold leading-tight min-w-0 truncate"
                        style={{ color: isDarkTheme ? (currentTheme?.cardText || currentTheme?.text || "#ffffff") : currentTheme.text }}
                      >
                        {isEn ? "Hide Toolbars" : "إخفاء الأشرطة"}
                      </span>
                      {/* زر مجسم وبارز 3D */}
                      <div
                        dir="ltr"
                        className="relative w-[35px] h-[19px] rounded-full p-0.5 shrink-0 transition-colors duration-300 flex items-center"
                        style={{
                          background: isTransparentMode
                            ? "linear-gradient(180deg, #10b981 0%, #059669 100%)"
                            : "linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)",
                          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35), inset 0 1px 1px rgba(0,0,0,0.2), 0 1px 1px rgba(255,255,255,0.8)",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 ease-out"
                          style={{
                            transform: isTransparentMode ? "translateX(16px)" : "translateX(0px)",
                            background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.35), 0 1px 1px rgba(0,0,0,0.2), inset 0 1px 1px #ffffff",
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                            style={{
                              backgroundColor: isTransparentMode ? "#10b981" : "#cbd5e1",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Themes Grid - بدون إطارات بيضاء حول الدوائر (مصغرة بنسبة 15% وألوان مميزة غير متشابهة) */}
                  {(() => {
                    // دالة لتحديد لون الدائرة المميز لكل ثيم في الشريط الجانبي وتفادي تشابه الألوان
                    const getSidebarCircleColor = (tId: string, tObj: any): string => {
                      const distinctColors: Record<string, string> = {
                        // الثيمات الفاتحة:
                        // ثيم الافتراضي: كان يعرض سابقاً اللون الأخضر (#10b981) فيتشابه مع الأخضر والزمرد والغابة
                        black: "#1e293b",
                        // ثيم زيتوني: لتمييزه بوضوح عن الليموني
                        olive: "#4d7c0f",

                        // الثيمات الداكنة:
                        // ثيم ملك الغروب: كان متطابقاً تماماً مع ثيم ذهبي (#fbbf24)
                        i_sunset_royal: "#e11d48", // قرمزي غروبي ملكي
                        // ثيم إستبرق: كان أصفر مكرراً أيضاً (#eab308)
                        i_brocade: "#6366f1", // نيلي ملكي بنفسجي فاخر
                        // ثيم الغابة: كان متطابقاً تماماً مع ثيم زمرد (#10b981)
                        i_forest: "#15803d", // أخضر غابات غني مميز
                        // ثيم عنبر: كان مطابقاً تقريباً للذهبي
                        i_amber: "#d97706", // كهرماني عسلي دافئ
                        // ثيم ملك الأعماق: كان مطابقاً للأزرق السماوي
                        i_deep_ocean: "#0284c7", // أزرق محيطي عميق
                        // ثيم فيروزي داكن: تمييزه بلون فيروزي بحري غني
                        i_turquoise: "#0d9488", // فيروزي غني
                        // ثيم ذهبي ملكي: ذهبي أندلسي عتيق مميز عن الذهبي المشع
                        i_royal_gold: "#c59b27",
                      };

                      if (distinctColors[tId]) {
                        return distinctColors[tId];
                      }
                      if (tId === "deep_black") {
                        return "#000000";
                      }
                      return tObj?.accent || (tObj as any)?.palette?.[0] || tObj?.bg || "#ffffff";
                    };

                    return (
                      <div className="grid grid-cols-3 gap-y-3 gap-x-2 justify-items-center items-center py-1">
                        {/* المجموعة الأولى: الثيمات الفاتحة */}
                        {LIGHT_THEME_IDS.map((id) => {
                          const theme = THEMES[id as keyof typeof THEMES];
                          if (!theme) return null;
                          const activeModeSuffix = isMemorizationMode
                            ? `_memorization_${isLandscape ? "h" : "v"}`
                            : isWirdMode
                              ? `_wird_${isLandscape ? "h" : "v"}`
                              : readingMode === "mushaf"
                                ? isLandscape
                                  ? "_h"
                                  : "_v"
                                : `_${readingMode}_${isLandscape ? "h" : "v"}`;
                          const isActiveTheme = currentTheme?.id === id;
                          const themeCircleColor = getSidebarCircleColor(id, theme);
                          const displayName = isEn ? (THEME_NAMES_EN[id] || t(`theme.${id}`, theme.name)) : theme.name;

                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                applyTheme(id);
                              }}
                              className="flex items-center justify-center p-1 cursor-pointer bg-transparent border-0 shadow-none outline-none group transition-transform active:scale-95"
                              style={{
                                background: "transparent",
                                border: "none",
                                boxShadow: "none",
                              }}
                              title={displayName}
                              aria-label={displayName}
                            >
                              <div
                                className={`w-[24.65px] h-[24.65px] rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                                  isActiveTheme ? "scale-110" : "group-hover:scale-108"
                                }`}
                                style={{
                                  width: "24.65px",
                                  height: "24.65px",
                                  backgroundColor: themeCircleColor,
                                  boxShadow: isActiveTheme
                                    ? `0 0 0 2px #ffffff, 0 0 0 3.5px ${themeCircleColor === "#ffffff" ? "#d4af37" : themeCircleColor}, 0 2.5px 6px rgba(0,0,0,0.3)`
                                    : id === "deep_black"
                                      ? "0 2px 4px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.25)"
                                      : "0 2px 4px rgba(0,0,0,0.22), inset 0 1px 1.2px rgba(255,255,255,0.6), inset 0 -1.2px 1.5px rgba(0,0,0,0.2)",
                                }}
                              >
                                {isActiveTheme && (
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${id === "deep_black" ? "bg-emerald-500" : "bg-white"} shadow-xs`}
                                  ></div>
                                )}
                              </div>
                            </button>
                          );
                        })}

                        {/* فاصل صغير بين المجموعتين */}
                        <div className="col-span-3 w-full py-1.5 flex items-center justify-center">
                          <div 
                            className="w-4/5 h-[1.5px] rounded-full opacity-20"
                            style={{ backgroundColor: currentTheme?.text || "#94a3b8" }}
                          />
                        </div>

                        {/* المجموعة الثانية: الثيمات الداكنة */}
                        {DARK_THEME_IDS.map((id) => {
                          const theme = THEMES[id as keyof typeof THEMES];
                          if (!theme) return null;
                          const activeModeSuffix = isMemorizationMode
                            ? `_memorization_${isLandscape ? "h" : "v"}`
                            : isWirdMode
                              ? `_wird_${isLandscape ? "h" : "v"}`
                              : readingMode === "mushaf"
                                ? isLandscape
                                  ? "_h"
                                  : "_v"
                                : `_${readingMode}_${isLandscape ? "h" : "v"}`;
                          const isActiveTheme = currentTheme?.id === id;
                          const themeCircleColor = getSidebarCircleColor(id, theme);
                          const displayName = isEn ? (THEME_NAMES_EN[id] || t(`theme.${id}`, theme.name)) : theme.name;

                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                applyTheme(id);
                              }}
                              className="flex items-center justify-center p-1 cursor-pointer bg-transparent border-0 shadow-none outline-none group transition-transform active:scale-95"
                              style={{
                                background: "transparent",
                                border: "none",
                                boxShadow: "none",
                              }}
                              title={displayName}
                              aria-label={displayName}
                            >
                              <div
                                className={`w-[24.65px] h-[24.65px] rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                                  isActiveTheme ? "scale-110" : "group-hover:scale-108"
                                }`}
                                style={{
                                  width: "24.65px",
                                  height: "24.65px",
                                  backgroundColor: themeCircleColor,
                                  boxShadow: isActiveTheme
                                    ? `0 0 0 2px #ffffff, 0 0 0 3.5px ${themeCircleColor === "#ffffff" ? "#d4af37" : themeCircleColor}, 0 2.5px 6px rgba(0,0,0,0.3)`
                                    : id === "deep_black"
                                      ? "0 2px 4px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.25)"
                                      : "0 2px 4px rgba(0,0,0,0.22), inset 0 1px 1.2px rgba(255,255,255,0.6), inset 0 -1.2px 1.5px rgba(0,0,0,0.2)",
                                }}
                              >
                                {isActiveTheme && (
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${id === "deep_black" ? "bg-emerald-500" : "bg-white"} shadow-xs`}
                                  ></div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div
                className="p-2.5"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0"
                  style={{
                    backgroundColor: isDarkTheme ? (currentTheme?.btnBg || "rgba(255,255,255,0.08)") : "#ffffff",
                    color: isDarkTheme ? (currentTheme?.btnText || currentTheme.text || "#ffffff") : currentTheme.text,
                    border: isDarkTheme ? "1px solid rgba(255,255,255,0.15)" : "none",
                  }}
                >
                  {isEn ? "Back" : "رجوع"}
                </button>
              </div>
            </div>
          ) : currentView === "download_quran_menu" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3.5 flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Download size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {isEn ? "Download Qur'an" : "تحميل القرآن"}
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-3 custom-scrollbar flex flex-col gap-2">
                <MenuItem
                  icon={<Download size={18} />}
                  label={isEn ? "Download Mushaf" : "تحميل المصحف"}
                  onClick={() => setCurrentView("download_quran")}
                  iconColor={iconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
                <MenuItem
                  icon={<Headphones size={18} />}
                  label={isEn ? "Download Listening" : "تحميل الاستماع"}
                  onClick={() => setCurrentView("download_listening")}
                  iconColor={iconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
                <MenuItem
                  icon={<Brain size={18} />}
                  label={isEn ? "Download Memorization" : "تحميل التحفيظ"}
                  onClick={() => setCurrentView("download_memorization")}
                  iconColor={iconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
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
          ) : currentView === "audio" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3.5 flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Headphones size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {isEn ? "Reciters" : "القراء"}
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-3 custom-scrollbar flex flex-col justify-between">
                <div className="flex flex-col gap-2.5">
                  {/* Reciters view strictly filtered by readingMode */}
                  {(() => {
                    const modeReaders = getReadersForMode(readingMode, READERS);
                    const isBilingualMode = readingMode === 'bilingual';
                    const isTranslationMode = readingMode === 'translation';

                    if (isBilingualMode || isTranslationMode) {
                      const singleReader = modeReaders[0];
                      if (!singleReader) return null;
                      const isSelected = settings.reader === singleReader.id;
                      const displayName = isEn ? getReciterDisplayName(singleReader.name, 'en') : singleReader.name;
                      return (
                        <div className="w-full">
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm animate-pulse"></span>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                              {isBilingualMode 
                                ? (isEn ? "Recitation & Translation Reciter" : "قارئ التلاوة والترجمة الإنجليزية")
                                : (isEn ? "English Translation Audio" : "قارئ الترجمة الإنجليزية (صحيح إنترناشونال)")}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 font-bold">
                              {isBilingualMode ? 'AR+EN' : 'EN'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 w-full">
                            <button
                              key={singleReader.id}
                              onClick={() => {
                                updateSetting("reader", singleReader.id);
                                setCurrentView("main");
                                setIsFloatingMenuOpen(false);
                                showToast(isEn ? `Selected reciter: ${displayName}` : `تم اختيار القارئ: ${singleReader.name}`);
                              }}
                              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-0 transition-all font-bold text-start cursor-pointer ${
                                isSelected
                                  ? "quran-raised-btn-selected bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                                  : "quran-raised-btn bg-indigo-500/10 text-indigo-700 dark:text-indigo-200"
                              }`}
                              style={{ border: "none" }}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'}`}>
                                  <Globe size={16} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold truncate">
                                    {displayName}
                                  </span>
                                  <span className={`text-[10px] truncate ${isSelected ? 'text-indigo-100 opacity-90' : 'opacity-75 text-indigo-900 dark:text-indigo-200'}`}>
                                    {isEn ? (singleReader.subTitleEn || singleReader.subTitle) : singleReader.subTitle}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2 mr-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  isSelected 
                                    ? 'bg-white/25 text-white' 
                                    : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                }`}>
                                  {isBilingualMode ? 'AR+EN' : 'EN'}
                                </span>
                                {isSelected && <Check size={16} className="text-white shrink-0" />}
                              </div>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Mushaf, Tafseer, Meanings: ONLY Arabic reciters!
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: currentTheme.text }}></span>
                          <h4 className="text-xs font-bold opacity-70" style={{ color: currentTheme.text }}>
                            {isEn ? "Arabic Reciters" : "القراء باللغة العربية"}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 gap-2 w-full">
                          {modeReaders.map((r) => {
                            const displayName = isEn ? getReciterDisplayName(r.name, 'en') : r.name;
                            const isSelected = settings.reader === r.id;
                            return (
                              <button
                                key={r.id}
                                onClick={() => {
                                  updateSetting("reader", r.id);
                                  setCurrentView("main");
                                  setIsFloatingMenuOpen(false);
                                  showToast(isEn ? `Selected reciter: ${displayName}` : `تم اختيار القارئ: ${r.name}`);
                                }}
                                className={`flex items-center justify-between p-3.5 rounded-2xl border-0 transition-all ${
                                  isSelected ? "quran-raised-btn-selected" : "quran-raised-btn"
                                }`}
                                style={{
                                  backgroundColor:
                                    isSelected
                                      ? (currentTheme?.accent || "#10b981")
                                      : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                                  color: isSelected ? "#ffffff" : currentTheme.text,
                                  border: "none",
                                }}
                              >
                                <span
                                  className="text-xs font-bold truncate"
                                  style={{
                                    color: isSelected ? "#ffffff" : currentTheme.text,
                                  }}
                                >
                                  {displayName}
                                </span>
                                {isSelected && (
                                  <Check
                                    size={16}
                                    className="text-white shrink-0"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
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
          ) : currentView === "font" ? (
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
              <div className="flex-grow overflow-y-auto p-3 custom-scrollbar flex flex-col justify-between">
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
                              color: isSelected ? (currentTheme.accent || "#10b981") : currentTheme.text,
                            }}
                          >
                            {fontDisplayName}
                          </span>
                          {isSelected && (
                            <Check size={16} style={{ color: currentTheme.accent || "#10b981" }} />
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
              <div className="flex-grow overflow-y-auto p-3 custom-scrollbar flex flex-col justify-between">
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
          ) : currentView === "download_tafseer" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3.5 flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Download size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {isEn ? "Download Tafseer" : "تحميل التفسير"}
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-3.5 custom-scrollbar">
                <div className="space-y-5">
                  {/* Tafsir Selection */}
                  <div className="space-y-2">
                    <label
                      className={`text-xs font-bold opacity-75 block ${isRTL ? "text-right" : "text-left"}`}
                      style={{ color: currentTheme.text }}
                    >
                      {isEn ? "Select Tafseer" : "اختر التفسير"}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {TAFSEERS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTafsir(t.id)}
                          className={`p-3 text-xs font-bold rounded-2xl border-0 transition-all ${isRTL ? "text-right" : "text-left"} flex justify-between items-center ${selectedTafsir === t.id ? "quran-raised-btn-selected text-white" : "quran-raised-btn"}`}
                          style={{
                            backgroundColor:
                              selectedTafsir === t.id
                                ? (currentTheme.accent || "#10b981")
                                : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                            color:
                              selectedTafsir === t.id
                                ? "#ffffff"
                                : currentTheme.text,
                            border: "none",
                          }}
                        >
                          <span>{isEn ? (t.englishName || t.name) : t.name}</span>
                          {selectedTafsir === t.id && (
                            <Check size={14} className="text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Surah Selection */}
                  <div className="space-y-2">
                    <label
                      className={`text-xs font-bold opacity-75 block ${isRTL ? "text-right" : "text-left"}`}
                      style={{ color: currentTheme.text }}
                    >
                      {isEn ? "Select Surahs" : "اختر السور"}
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                      <button
                        onClick={() => toggleSelection("all", "surah")}
                        className={`p-2 text-[10px] font-bold rounded-xl border-0 transition-all ${selectedSurahs.includes("all") ? "quran-raised-btn-selected bg-emerald-500 text-white" : "quran-raised-btn"}`}
                        style={{
                          backgroundColor: selectedSurahs.includes("all")
                            ? (currentTheme.accent || "#10b981")
                            : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                          color: selectedSurahs.includes("all") ? "#ffffff" : currentTheme.text,
                          border: "none",
                        }}
                      >
                        {isEn ? "All" : "الكل"}
                      </button>
                      {SURAH_NAMES_AR.map((name, i) => {
                        const isDownloaded = downloadedTafseers.includes((i + 1).toString());
                        const isSelected = selectedSurahs.includes((i + 1).toString());
                        const surahDisplayName = isEn ? (SURAH_NAMES_EN[i] || name) : name;
                        return (
                          <button
                            key={i}
                            onClick={() =>
                              toggleSelection((i + 1).toString(), "surah")
                            }
                            className={`p-2 text-[10px] font-bold rounded-xl border-0 transition-all ${isSelected ? "quran-raised-btn-selected" : "quran-raised-btn"}`}
                            style={{
                              backgroundColor: isSelected
                                ? (currentTheme.accent || "#10b981")
                                : isDownloaded
                                  ? (isDarkTheme ? "rgba(16,185,129,0.2)" : "#d1fae5")
                                  : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                              color: isSelected
                                ? "#ffffff"
                                : isDownloaded
                                  ? "#059669"
                                  : currentTheme.text,
                              border: "none",
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isDownloaded && <Check size={10} />}
                              <span className="truncate">{surahDisplayName}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Juz Selection */}
                  <div className="space-y-2">
                    <label
                      className={`text-xs font-bold opacity-75 block ${isRTL ? "text-right" : "text-left"}`}
                      style={{ color: currentTheme.text }}
                    >
                      {isEn ? "Select Juzs" : "اختر الأجزاء"}
                    </label>
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 custom-scrollbar">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
                        const isDownloaded = downloadedJuzs.includes(j.toString());
                        const isSelected = selectedJuzs.includes(j.toString());
                        return (
                          <button
                            key={j}
                            onClick={() => toggleSelection(j.toString(), "juz")}
                            className={`p-2 text-[10px] font-bold rounded-xl border-0 transition-all ${isSelected ? "quran-raised-btn-selected" : "quran-raised-btn"}`}
                            style={{
                              backgroundColor: isSelected
                                ? (currentTheme.accent || "#10b981")
                                : isDownloaded
                                  ? (isDarkTheme ? "rgba(16,185,129,0.2)" : "#d1fae5")
                                  : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                              color: isSelected
                                ? "#ffffff"
                                : isDownloaded
                                  ? "#059669"
                                  : currentTheme.text,
                              border: "none",
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isDownloaded && <Check size={10} />}
                              <span>{isEn ? `Juz ${j}` : `ج ${toArabic(j)}`}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="p-3 space-y-2"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                {isDownloading && (
                  <div className="space-y-1">
                    <div
                      className="flex justify-between text-[10px] font-bold opacity-60"
                      style={{ color: currentTheme.text }}
                    >
                      <span>{status}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div
                      className="w-full rounded-full h-1.5 overflow-hidden"
                      style={{ backgroundColor: `${currentTheme.text}10` }}
                    >
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => startDownload("tafseer")}
                    disabled={!isDownloading && isAllSelectedDownloaded()}
                    className={`flex-1 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0 transition-all ${isDownloading ? "bg-red-500 text-white" : "text-white"} ${!isDownloading && isAllSelectedDownloaded() ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                    style={!isDownloading ? { backgroundColor: iconColor, border: "none" } : { border: "none" }}
                  >
                    {isDownloading ? <X size={16} /> : <Download size={16} />}
                    {isDownloading ? (isEn ? "Stop" : "إيقاف") : isAllSelectedDownloaded() ? (isEn ? "Downloaded" : "محمل") : (isEn ? "Download" : "تحميل")}
                  </button>
                  <button
                    onClick={() => setCurrentView("main")}
                    className="px-4 py-2.5 rounded-2xl font-bold text-xs quran-raised-btn border-0 transition-all"
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
            </div>
          ) : currentView === "interface" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3.5 flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Palette size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {isEn ? "Interface Customization" : "تخصيص الواجهة"}
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-3 custom-scrollbar">
                <ToolbarColorPickerContent
                  currentTheme={currentTheme}
                  isLandscape={isLandscape}
                  readingMode={readingMode}
                  isWirdMode={isWirdMode}
                  isMemorizationMode={isMemorizationMode}
                  showToast={showToast}
                  isEn={isEn}
                  isRTL={isRTL}
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
          ) : currentView === "download_quran" ||
            currentView === "download_listening" ||
            currentView === "download_memorization" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-3.5 flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Download size={20} className="quran-3d-icon" style={{ color: iconColor }} />
                  <h3
                    className="font-extrabold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    {currentView === "download_quran"
                      ? (isEn ? "Download Mushaf" : "تحميل المصحف")
                      : currentView === "download_listening"
                        ? (isEn ? "Download Listening" : "تحميل الاستماع")
                        : (isEn ? "Download Memorization" : "تحميل التحفيظ")}
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-3.5 custom-scrollbar">
                <div className="space-y-5">
                  {/* Reciter Selection */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center" dir={isRTL ? "rtl" : "ltr"}>
                      <label
                        className="text-xs font-bold opacity-75 block"
                        style={{ color: currentTheme.text }}
                      >
                        {isEn ? "Select Reciter" : "اختر القارئ"}
                      </label>
                      {currentView === "download_listening" && selectedReaderObj && (
                        <span className="text-[10px] font-bold text-emerald-500">
                          {availableSurahsList.length < 114
                            ? (isEn ? `(Available: ${availableSurahsList.length} surahs)` : `(متوفر: ${availableSurahsList.length} سورة)`)
                            : (isEn ? "(Complete Qur'an)" : "(المصحف كامل)")}
                        </span>
                      )}
                    </div>

                    {/* Search box if in download_listening */}
                    {currentView === "download_listening" && (
                      <div className="relative mb-2">
                        <input
                          type="text"
                          value={readerSearch}
                          onChange={(e) => setReaderSearch(e.target.value)}
                          placeholder={isEn ? "Search reciter..." : "ابحث عن قارئ..."}
                          className={`w-full py-2 ${isRTL ? "pr-8 pl-3" : "pl-8 pr-3"} text-xs rounded-xl border-0 outline-none quran-raised-card`}
                          style={{
                            backgroundColor: isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff",
                            color: currentTheme.text,
                            border: "none",
                          }}
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                        <Search
                          size={13}
                          className={`absolute ${isRTL ? "right-2.5" : "left-2.5"} top-2.5 opacity-40`}
                          style={{ color: currentTheme.text }}
                        />
                        {readerSearch && (
                          <button
                            onClick={() => setReaderSearch("")}
                            className={`absolute ${isRTL ? "left-2.5" : "right-2.5"} top-2 text-xs opacity-40 hover:opacity-100`}
                            style={{ color: currentTheme.text }}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar" dir={isRTL ? "rtl" : "ltr"}>
                      {filteredCurrentReaders.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            if (selectedReader !== r.id) {
                              setSelectedReader(r.id);
                              setSelectedSurahs([]);
                              setSelectedJuzs([]);
                            }
                          }}
                          className={`p-2 text-[10px] font-bold rounded-xl border-0 transition-all ${selectedReader === r.id ? "quran-raised-btn-selected text-white" : "quran-raised-btn"}`}
                          style={{
                            backgroundColor:
                              selectedReader === r.id
                                ? (currentTheme.accent || "#10b981")
                                : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                            color:
                              selectedReader === r.id
                                ? "#ffffff"
                                : currentTheme.text,
                            border: "none",
                          }}
                        >
                          <span className="truncate block">{isEn ? getReciterDisplayName(r.name, 'en') : r.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Warning banner when reader has partial Quran */}
                    {currentView === "download_listening" && selectedReaderObj && availableSurahsList.length < 114 && (
                      <div
                        className={`flex items-start gap-2 p-2 rounded-xl text-[11px] ${isRTL ? "text-right" : "text-left"} mt-1 animate-fadeIn quran-raised-card border-0`}
                        style={{
                          backgroundColor: `${currentTheme.accent}10`,
                          color: currentTheme.text,
                          border: "none",
                        }}
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        <Info size={14} className="shrink-0 text-amber-500 mt-0.5" />
                        <div>
                          <span className="font-bold">{isEn ? `Notice for reciter (${getReciterDisplayName(selectedReaderObj.name, 'en')}): ` : `تنبيه للقارئ (${selectedReaderObj.name}): `}</span>
                          <span>{isEn ? `Only ${availableSurahsList.length} surahs recorded out of 114. Surahs and Juzs adjusted to available only to prevent stoppage.` : `مسجل له ${availableSurahsList.length} سورة فقط من أصل 114 سورة. تم ضبط قائمة السور والأجزاء لتشمل فقط ما هو متوفر له تفادياً لتوقف التحميل.`}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Surah Selection */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center" dir={isRTL ? "rtl" : "ltr"}>
                      <label
                        className="text-xs font-bold opacity-75 block"
                        style={{ color: currentTheme.text }}
                      >
                        {currentView === "download_listening" && availableSurahsList.length < 114
                          ? (isEn ? `Select Surahs (${availableSurahsList.length} available)` : `اختر السور (المتاح للقارئ: ${availableSurahsList.length} سورة فقط)`)
                          : (isEn ? "Select Surahs" : "اختر السور")}
                      </label>
                      {selectedSurahs.length > 0 && !selectedSurahs.includes("all") && (
                        <span className="text-[10px] opacity-70 font-bold">
                          {isEn ? `Selected: ${selectedSurahs.length} surahs` : `محدد: ${selectedSurahs.length} سورة`}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar" dir={isRTL ? "rtl" : "ltr"}>
                      <button
                        onClick={() => toggleSelection("all", "surah")}
                        className={`p-2 text-[10px] font-bold rounded-xl border-0 transition-all ${selectedSurahs.includes("all") ? "quran-raised-btn-selected bg-emerald-500 text-white" : "quran-raised-btn"}`}
                        style={{
                          backgroundColor: selectedSurahs.includes("all")
                            ? (currentTheme.accent || "#10b981")
                            : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                          color: selectedSurahs.includes("all") ? "#ffffff" : currentTheme.text,
                          border: "none",
                        }}
                      >
                        {currentView === "download_listening" && availableSurahsList.length < 114
                          ? (isEn ? `Available (${availableSurahsList.length})` : `المتاح (${availableSurahsList.length})`)
                          : (isEn ? "All" : "الكل")}
                      </button>
                      {availableSurahsList.map((surah) => {
                        const isDownloaded = downloadedSurahs.includes(surah.number.toString());
                        const isSelected = selectedSurahs.includes(surah.number.toString());
                        const surahDisplayName = isEn ? (SURAH_NAMES_EN[surah.number - 1] || surah.name) : surah.name;
                        return (
                          <button
                            key={surah.number}
                            onClick={() =>
                              toggleSelection(surah.number.toString(), "surah")
                            }
                            className={`p-2 text-[10px] font-bold rounded-xl border-0 transition-all ${isSelected ? "quran-raised-btn-selected" : "quran-raised-btn"}`}
                            style={{
                              backgroundColor: isSelected
                                ? (currentTheme.accent || "#10b981")
                                : isDownloaded
                                  ? (isDarkTheme ? "rgba(16,185,129,0.2)" : "#d1fae5")
                                  : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                              color: isSelected
                                ? "#ffffff"
                                : isDownloaded
                                  ? "#059669"
                                  : currentTheme.text,
                              border: "none",
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isDownloaded && <Check size={10} />}
                              <span className="truncate">{surahDisplayName}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Juz Selection */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center" dir={isRTL ? "rtl" : "ltr"}>
                      <label
                        className="text-xs font-bold opacity-75 block"
                        style={{ color: currentTheme.text }}
                      >
                        {currentView === "download_listening" && availableSurahsList.length < 114
                          ? (isEn ? "Select Juzs (Available only)" : "اختر الأجزاء (تعديل تلقائي للمتوفر فقط)")
                          : (isEn ? "Select Juzs" : "اختر الأجزاء")}
                      </label>
                      {selectedJuzs.length > 0 && (
                        <span className="text-[10px] opacity-70 font-bold">
                          {isEn ? `Selected: ${selectedJuzs.length} juzs` : `محدد: ${selectedJuzs.length} جزء`}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 custom-scrollbar" dir={isRTL ? "rtl" : "ltr"}>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
                        const isDownloaded = downloadedJuzs.includes(j.toString());
                        const isSelected = selectedJuzs.includes(j.toString());
                        const allSurahsInThisJuz = getSurahsForJuz(j);
                        const availableInThisJuz = allSurahsInThisJuz.filter((s) =>
                          availableSurahNumbers.includes(s)
                        );
                        const isUnavailable =
                          currentView === "download_listening" && availableInThisJuz.length === 0;
                        const isPartialJuz =
                          currentView === "download_listening" &&
                          availableInThisJuz.length > 0 &&
                          availableInThisJuz.length < allSurahsInThisJuz.length;

                        return (
                          <button
                            key={j}
                            disabled={isUnavailable}
                            onClick={() => {
                              if (isUnavailable) return;
                              toggleSelection(j.toString(), "juz");
                              if (isPartialJuz && !isSelected) {
                                showToast(
                                  isEn
                                    ? `Juz ${j} adjusted to include only ${availableInThisJuz.length} available surahs`
                                    : `تم تعديل الجزء ${j} ليشمل ${availableInThisJuz.length} سورة متوفرة فقط لهذا القارئ`,
                                );
                              }
                            }}
                            className={`p-2 text-[10px] font-bold rounded-xl border-0 transition-all flex flex-col items-center justify-center gap-0.5 ${isSelected ? "quran-raised-btn-selected" : "quran-raised-btn"} ${isUnavailable ? "opacity-40 cursor-not-allowed" : ""}`}
                            style={{
                              backgroundColor: isSelected
                                ? (currentTheme.accent || "#10b981")
                                : isDownloaded
                                  ? (isDarkTheme ? "rgba(16,185,129,0.2)" : "#d1fae5")
                                  : (isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff"),
                              color: isSelected
                                ? "#ffffff"
                                : isDownloaded
                                  ? "#059669"
                                  : currentTheme.text,
                              border: "none",
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isDownloaded && <Check size={10} />}
                              <span>{isEn ? `Juz ${j}` : `ج ${toArabic(j)}`}</span>
                            </div>
                            {isUnavailable ? (
                              <span className="text-[8px] text-red-500 opacity-80">{isEn ? "Unavailable" : "غير متوفر"}</span>
                            ) : isPartialJuz ? (
                              <span className="text-[8px] text-amber-500">({availableInThisJuz.length} {isEn ? "surahs" : "سورة"})</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="p-3 space-y-2"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                }}
              >
                {isDownloading && (
                  <div className="space-y-1">
                    <div
                      className="flex justify-between text-[10px] font-bold opacity-60"
                      style={{ color: currentTheme.text }}
                    >
                      <span className="truncate max-w-[200px]">{status}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div
                      className="w-full rounded-full h-1.5 overflow-hidden"
                      style={{ backgroundColor: `${currentTheme.text}10` }}
                    >
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {currentView === "download_listening" && availableSurahsList.length < 114 && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 text-center font-bold">
                        {isEn ? "Downloading available surahs for this reciter only" : "جاري تحميل السور المتوفرة للقارئ فقط"}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      startDownload(
                        "quran",
                        currentView === "download_listening" ? "surah" : "ayah",
                      )
                    }
                    disabled={!isDownloading && isAllSelectedDownloaded()}
                    className={`flex-1 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 quran-raised-btn border-0 transition-all ${isDownloading ? "bg-red-500 text-white" : "text-white"} ${!isDownloading && isAllSelectedDownloaded() ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                    style={!isDownloading ? { backgroundColor: iconColor, border: "none" } : { border: "none" }}
                  >
                    {isDownloading ? <X size={16} /> : <Download size={16} />}
                    {isDownloading ? (isEn ? "Stop" : "إيقاف") : isAllSelectedDownloaded() ? (isEn ? "Downloaded" : "محمل") : (isEn ? "Download" : "تحميل")}
                  </button>
                  <button
                    onClick={() => setCurrentView("download_quran_menu")}
                    className="px-4 py-2.5 rounded-2xl font-bold text-xs quran-raised-btn border-0 transition-all"
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
              <div className="flex-grow overflow-y-auto p-3 custom-scrollbar">
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
                    {bookmarks.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-2xl quran-raised-card flex items-center justify-between group transition-all cursor-pointer border-0"
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
                        <div className={`flex flex-col gap-0.5 ${isRTL ? "text-right" : "text-left"}`}>
                          <span className="font-bold text-sm">
                            {isEn ? `Surah ${SURAH_NAMES_EN[b.s - 1] || SURAH_NAMES_AR[b.s - 1]}` : `سورة ${SURAH_NAMES_AR[b.s - 1]}`}
                          </span>
                          <span className="text-[10px] opacity-60 font-bold">
                            {isEn ? `Ayah ${b.a} • ${b.date}` : `آية ${toArabic(b.a)} • ${b.date}`}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (deleteBookmark) deleteBookmark(b.id);
                          }}
                          className="w-7 h-7 rounded-xl quran-raised-btn flex items-center justify-center transition-all border-0"
                          style={{ color: `${currentTheme.text}60`, border: "none" }}
                        >
                          <X size={15} className="quran-3d-icon" />
                        </button>
                      </div>
                    ))}
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
              <div className="flex-grow overflow-y-auto p-2.5 custom-scrollbar">
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
                {isLandscape ? (
                  isEn ? (
                    <>
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
                  ) : (
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
                  )
                ) : (
                  isEn ? (
                    <>
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
                  ) : (
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
                  )
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
                  data-id="menu-item-themes"
                  icon={<Palette size={18} />}
                  label={isEn ? "Themes" : "المظهر"}
                  onClick={() => {
                    if (menuContainerRef.current && menuContainerRef.current.offsetWidth > 0) {
                      setMainSidebarWidth(menuContainerRef.current.offsetWidth);
                    }
                    setCurrentView("themes");
                  }}
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                  isRTL={isRTL}
                />
                <MenuItem
                  data-id="menu-item-global-search"
                  icon={<Search size={18} />}
                  label={isEn ? "Advanced Search" : "البحث المتقدم"}
                  onClick={() => handleAction(() => onNavigate('search', { from: page || (isLandscape ? 'quran-landscape' : 'quran'), isWird: isWirdMode, fromSidebar: true }))}
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
                        if (shortcut.id === "quran-download-parent") {
                          setCurrentView("download_quran_menu");
                        } else if (shortcut.id === "tafseer-download") {
                          setCurrentView("download_tafseer");
                        } else if (shortcut.id === "audio") {
                          setCurrentView("audio");
                        } else if (shortcut.id === "interface-customization") {
                          setCurrentView("interface");
                        } else if (shortcut.id === "font-type") {
                          setCurrentView("font");
                        } else if (shortcut.id === "notification-settings") {
                          setCurrentView("notifications");
                        } else if (shortcut.id === "sajdah-list") {
                          setCurrentView("sajdah_list");
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
              <div className="pt-2 pb-0.5 px-0.5 flex items-center gap-2">
                {onOpenMainGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsFloatingMenuOpen(false);
                      onOpenMainGuide();
                    }}
                    className="flex-1 py-2 px-2.5 rounded-2xl border-0 quran-raised-btn flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    style={{
                      backgroundColor: currentTheme?.btnBg || (currentTheme?.text === "#ffffff" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)"),
                      color: currentTheme?.text || '#000000',
                      border: "none",
                      outline: "none",
                    }}
                    title={isEn ? "Quran Guide" : "دليل المصحف"}
                    aria-label={isEn ? "Quran Guide" : "دليل المصحف"}
                  >
                    <div style={{ color: sidebarIconColor }} className="quran-3d-icon shrink-0 flex items-center justify-center">
                      <BookOpen size={18} />
                    </div>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSidebarGuideOpen(true)}
                  className={`${onOpenMainGuide ? 'flex-1' : 'w-full'} py-2 px-2.5 rounded-2xl border-0 quran-raised-btn flex items-center justify-center transition-all cursor-pointer active:scale-95`}
                  style={{
                    backgroundColor: currentTheme?.btnBg || (currentTheme?.text === "#ffffff" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)"),
                    color: currentTheme?.text || '#000000',
                    border: "none",
                    outline: "none",
                  }}
                  title={isEn ? "Sidebar Guide" : "دليل القائمة"}
                  aria-label={isEn ? "Sidebar Guide" : "دليل القائمة"}
                >
                  <div style={{ color: sidebarIconColor }} className="quran-3d-icon shrink-0 flex items-center justify-center">
                    <Menu size={18} />
                  </div>
                </button>
              </div>
              {/* Bottom Spacer only active during sidebar guide */}
              {isSidebarGuideOpen && (
                <div
                  className="shrink-0 pointer-events-none transition-all duration-300"
                  style={{ height: "45vh" }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <QuranSpotlightGuide
        guideKey="sidebar_menu_v2"
        steps={QURAN_SIDEBAR_STEPS}
        isOpen={isSidebarGuideOpen}
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

  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem("notification_settings" + modeSuffix);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing notification settings", e);
      }
    }
    return {
      quarter: true,
      juz: true,
      sajda: true,
      themes: true,
      downloads: true,
      bookmarks: true,
      general: true,
    };
  });

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

  const toggleAppSetting = (key: string) => {
    const newSettings = { ...appSettings, [key]: !appSettings[key] };
    setAppSettings(newSettings);
    localStorage.setItem(
      "notification_settings" + modeSuffix,
      JSON.stringify(newSettings),
    );
    window.dispatchEvent(new Event("notification-settings-change"));

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

      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 pb-4">
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
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => toggleAppSetting(item.id)}
                className={`flex items-center justify-between p-2.5 rounded-2xl quran-raised-card transition-all cursor-pointer border-0 ${appSettings[item.id] ? "shadow-sm" : "opacity-75"}`}
                style={{
                  backgroundColor: appSettings[item.id]
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
                    backgroundColor: appSettings[item.id]
                      ? currentTheme.accent
                      : `${currentTheme.text}20`,
                    color: appSettings[item.id] ? "#ffffff" : currentTheme.text,
                    border: "none",
                  }}
                >
                  {appSettings[item.id] && <Check className="w-2.5 h-2.5" />}
                </div>
              </div>
            ))}
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
                  desc: isEn ? "Daily at 10:00 AM" : "تنبيه يومي الساعة 10:00 صباحاً",
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
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors flex-shrink-0`}
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
                      <Check className="w-2.5 h-2.5" />
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
                    className="text-[8px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded font-bold"
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

const PRESET_COLORS = [
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#000000",
  "#4b5563",
  "#9ca3af",
  "#f3f4f6",
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#06b6d4",
  "#14b8a6",
  "#10b981",
  "#22c55e",
  "#84cc16",
  "transparent",
  "#44403c",
  "#78716c",
  "#f43f5e",
  "#ec4899",
  "#d946ef",
  "#a855f7",
  "#8b5cf6",
];

const ToolbarColorPickerContent: React.FC<{
  currentTheme: any;
  isLandscape: boolean;
  readingMode: string;
  isWirdMode: boolean;
  isMemorizationMode: boolean;
  showToast: (msg: string) => void;
  isEn?: boolean;
  isRTL?: boolean;
}> = ({
  currentTheme,
  isLandscape,
  readingMode,
  isWirdMode,
  isMemorizationMode,
  showToast,
  isEn = false,
  isRTL = true,
}) => {
  const isDarkTheme = isDarkQuranTheme(currentTheme);
  const modeSuffix = isMemorizationMode
    ? `_memorization_${isLandscape ? "h" : "v"}`
    : isWirdMode
      ? `_wird_${isLandscape ? "h" : "v"}`
      : readingMode === "mushaf"
        ? isLandscape
          ? "_h"
          : "_v"
        : `_${readingMode}_${isLandscape ? "h" : "v"}`;

  const [toolbarColors, setToolbarColors] = useState<any>(() => {
    const saved = localStorage.getItem("toolbar_colors_v2" + modeSuffix);
    if (saved) return JSON.parse(saved);
    return {};
  });

  const [activePicker, setActivePicker] = useState<{
    sectionId: string;
    type: "bg" | "text" | "border";
  } | null>(null);

  const updateColor = (
    key: string,
    type: "bg" | "text" | "border",
    color: string,
  ) => {
    const newColors = {
      ...toolbarColors,
      [key]: {
        ...(toolbarColors[key] || {}),
        [type]: color,
      },
    };
    setToolbarColors(newColors);
    localStorage.setItem(
      "toolbar_colors_v2" + modeSuffix,
      JSON.stringify(newColors),
    );
    window.dispatchEvent(new Event("theme-change"));
    setActivePicker(null);
  };

  const resetColors = () => {
    localStorage.removeItem("toolbar_colors_v2" + modeSuffix);
    setToolbarColors({});
    window.dispatchEvent(new Event("theme-change"));
    showToast(isEn ? "Default colors restored" : "تم استعادة الألوان الافتراضية");
  };

  const sections = [
    { id: "top-toolbar", label: isEn ? "Top Toolbar" : "الشريط العلوي" },
    { id: "bottom-toolbar", label: isEn ? "Bottom Toolbar" : "الشريط السفلي" },
    { id: "surah", label: isEn ? "Surah Button" : "زر السورة" },
    { id: "page", label: isEn ? "Page Button" : "زر الصفحة" },
    { id: "audio", label: isEn ? "Audio Controls" : "أزرار الصوت" },
    { id: "btn-menu", label: isEn ? "Menu Button" : "زر القائمة" },
    { id: "btn-home", label: isEn ? "Home Button" : "زر الرئيسية" },
    { id: "btn-autoscroll", label: isEn ? "Scroll Button" : "زر التمرير" },
    { id: "btn-share", label: isEn ? "Share Button" : "زر المشاركة" },
    { id: "btn-bookmark", label: isEn ? "Bookmark Button" : "زر حفظ الإشارة" },
  ];

  return (
    <div className="space-y-3.5" dir={isRTL ? "rtl" : "ltr"}>
      <button
        onClick={resetColors}
        className="w-full py-2.5 rounded-2xl text-xs font-bold quran-raised-btn border-0 transition-all"
        style={{
          backgroundColor: isDarkTheme ? (currentTheme?.btnBg || "rgba(255,255,255,0.08)") : "#ffffff",
          color: currentTheme.text,
          border: "none",
        }}
      >
        {isEn ? "Restore Default Colors" : "استعادة الألوان الافتراضية"}
      </button>

      {sections.map((section) => (
        <div
          key={section.id}
          className="p-3.5 rounded-2xl quran-raised-card border-0 space-y-3"
          style={{
            backgroundColor: isDarkTheme ? (currentTheme?.cardBg || "rgba(255,255,255,0.06)") : "#ffffff",
            border: "none",
          }}
        >
          <h4
            className={`text-xs font-bold opacity-75 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: currentTheme.text }}
          >
            {section.label}
          </h4>

          {activePicker?.sectionId === section.id && (
            <div
              className="p-2.5 rounded-2xl quran-raised-card border-0 animate-fadeIn"
              style={{
                backgroundColor: currentTheme.bg,
                border: "none",
              }}
            >
              <div className="grid grid-cols-5 gap-2.5 px-0.5">
                {PRESET_COLORS.map((color, i) => {
                  const currentValue =
                    toolbarColors[activePicker.sectionId]?.[
                      activePicker.type
                    ] ||
                    (activePicker.type === "bg"
                      ? currentTheme.barBg
                      : activePicker.type === "text"
                        ? currentTheme.barText
                        : currentTheme.barBorder);
                  const isSelected = currentValue === color;

                  return (
                    <button
                      key={i}
                      onClick={() =>
                        updateColor(
                          activePicker.sectionId,
                          activePicker.type,
                          color,
                        )
                      }
                      className={`w-full aspect-square rounded-full border-0 quran-raised-btn transition-all flex items-center justify-center relative overflow-hidden ${isSelected ? "quran-raised-btn-selected scale-110 z-10" : ""}`}
                      style={{
                        backgroundColor:
                          color === "transparent" ? "white" : color,
                        backgroundImage:
                          color === "transparent"
                            ? "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)"
                            : "none",
                        backgroundSize:
                          color === "transparent" ? "8px 8px" : "auto",
                        border: "none",
                      }}
                    >
                      {isSelected && (
                        <Check
                          size={12}
                          className={
                            color === "#ffffff" || color === "transparent"
                              ? "text-emerald-600"
                              : "text-white"
                          }
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {[
              {
                type: "bg" as const,
                label: isEn ? "Background" : "الخلفية",
                defaultValue: currentTheme.barBg || "#ffffff",
              },
              {
                type: "text" as const,
                label: isEn ? "Text" : "النص",
                defaultValue: currentTheme.barText || "#000000",
              },
              {
                type: "border" as const,
                label: isEn ? "Border" : "الحدود",
                defaultValue: currentTheme.barBorder || "#e5e7eb",
              },
            ].map((field) => {
              const value =
                toolbarColors[section.id]?.[field.type] || field.defaultValue;
              const isActive =
                activePicker?.sectionId === section.id &&
                activePicker?.type === field.type;

              return (
                <div key={field.type} className="flex-1 space-y-1">
                  <span
                    className="text-[10px] opacity-60 block text-center font-bold"
                    style={{ color: currentTheme.text }}
                  >
                    {field.label}
                  </span>
                  <button
                    onClick={() =>
                      setActivePicker({
                        sectionId: section.id,
                        type: field.type,
                      })
                    }
                    className={`w-full h-8 rounded-xl border-0 quran-raised-btn transition-all relative overflow-hidden ${isActive ? "quran-raised-btn-selected" : ""}`}
                    style={{
                      backgroundColor:
                        value === "transparent" ? "white" : value,
                      backgroundImage:
                        value === "transparent"
                          ? "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)"
                          : "none",
                      backgroundSize:
                        value === "transparent" ? "8px 8px" : "auto",
                      border: "none",
                    }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Check
                          size={14}
                          className={
                            value === "#ffffff" || value === "transparent"
                              ? "text-emerald-600"
                              : "text-white"
                          }
                        />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
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
      className={`py-1.5 px-3 rounded-xl mb-1.5 ${isRTL ? "text-right" : "text-left"} whitespace-nowrap quran-raised-card border-0`}
      style={{
        backgroundColor: currentTheme
          ? `${currentTheme.accent}15`
          : "rgba(37, 99, 235, 0.1)",
        border: "none",
      }}
    >
      <span
        className="text-[11px] font-extrabold whitespace-nowrap tracking-wide"
        style={{ color: currentTheme ? currentTheme.accent : titleColor }}
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
    className={`flex items-center gap-2.5 py-2.5 px-3 my-0.5 rounded-2xl border-0 transition-all ${isRTL ? "text-right" : "text-left"} w-full whitespace-nowrap ${isSubItem ? "px-2.5 py-2" : ""} ${isActive ? "quran-raised-btn-selected" : "quran-raised-btn"}`}
    style={{
      backgroundColor: isActive
        ? (currentTheme?.accent || "#10b981")
        : (currentTheme?.btnBg || (currentTheme?.text === "#ffffff" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)")),
      color: isActive ? "#ffffff" : (currentTheme?.text || "#000000"),
      border: "none",
      outline: "none",
    }}
  >
    <div style={{ color: isActive ? "#ffffff" : iconColor }} className="quran-3d-icon shrink-0 flex items-center justify-center">{icon}</div>
    <span
      className={`${isSubItem ? "text-[11px]" : "text-[12px]"} font-bold whitespace-nowrap flex-1`}
      style={{
        color: isActive
          ? "#ffffff"
          : currentTheme
            ? currentTheme.text
            : "#000000",
      }}
    >
      {label}
    </span>
    {showChevron && (
      <ChevronLeft size={14} className={`shrink-0 transition-transform ${isExpanded ? "-rotate-90" : ""} ${isActive ? "text-white" : "opacity-40"}`} />
    )}
  </button>
);

export default FloatingMenu;
