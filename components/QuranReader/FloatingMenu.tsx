import React, { useState, useEffect, useRef, useCallback } from "react";
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
  BookOpen,
  Book,
  FileText,
  Headphones,
  Languages,
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
  HelpCircle,
  Download,
  Type,
  Shield,
  Bell,
  Check,
  Loader2,
  ChevronLeft,
  Grid,
} from "lucide-react";
import {
  THEMES,
  DEFAULT_SETTINGS,
  READERS,
  MEMORIZATION_READERS,
  FONTS,
  TAFSEERS,
  JUZ_MAP,
  SURAH_NAMES_AR,
  SAJDAH_LOCATIONS,
  toArabic,
} from "./constants";
import { quranData } from "../../utils/quranData";
import { usePrayerTimes } from "../../context/PrayerTimesContext";
import { useTheme } from "../../context/ThemeContext";
import { RECITERS as LISTEN_RECITERS } from "../../data/listenQuranData";
import { setupNotifications } from "../../utils/notifications";
import TutorialOverlay, { TutorialStep } from "../Tutorial/TutorialOverlay";

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
  onNavigate: (pageId: string) => void;
  readingMode: "mushaf" | "tafseer" | "meanings" | "translation";
  setReadingMode: (
    mode: "mushaf" | "tafseer" | "meanings" | "translation",
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
}

const ALL_SHORTCUTS = [
  {
    id: "more-menu",
    label: "قائمة التطبيقات",
    icon: <Grid size={18} />,
  },
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
  "more-menu",
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
}) => {
  const { applyPresetTheme: applyGlobalTheme } = useTheme();
  const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tempShortcuts, setTempShortcuts] = useState<string[]>([]);

  //Selection State for Downloads
  const [selectedReader, setSelectedReader] = useState("");
  const [selectedTafsir, setSelectedTafsir] = useState(
    settings.tafseer || TAFSEERS[0].id,
  );
  const [selectedSurahs, setSelectedSurahs] = useState<string[]>([]);
  const [selectedJuzs, setSelectedJuzs] = useState<string[]>([]);
  const [downloadedSurahs, setDownloadedSurahs] = useState<string[]>([]);
  const [downloadedJuzs, setDownloadedJuzs] = useState<string[]>([]);
  const [downloadedTafseers, setDownloadedTafseers] = useState<string[]>([]);

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

  const floatingMenuTutorialSteps: TutorialStep[] = [
    {
      id: "floating-menu-mushaf",
      title: "المصحف",
      text: "عرض صفحات المصحف الشريف بالرسم العثماني.",
      selector: '[data-id="menu-item-mushaf"]',
      icon: <BookText className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-tafseer",
      title: "التفسير",
      text: "قراءة تفسير الآيات مع إمكانية اختيار كتاب التفسير المفضل.",
      selector: '[data-id="menu-item-tafseer"]',
      icon: <Book className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-meanings",
      title: "المعاني",
      text: "التعرف على معاني مفردات القرآن الكريم.",
      selector: '[data-id="menu-item-meanings"]',
      icon: <FileText className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-translation",
      title: "الترجمة",
      text: "يقوم بعرض النص القرانى والترجمه باللغه الانجليزيه",
      selector: '[data-id="menu-item-translation"]',
      icon: <Languages className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-themes",
      title: "المظهر",
      text: "تخصيص ألوان التطبيق واختيار الثيم المناسب لك.",
      selector: '[data-id="menu-item-themes"]',
      icon: <Palette className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-global-search",
      title: "البحث المتقدم",
      text: "البحث الشامل في القرآن الكريم والأدعية والأذكار.",
      selector: '[data-id="menu-item-global-search"]',
      icon: <Search className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-settings",
      title: "الإعدادات",
      text: "التحكم الكامل بالتطبيق من داخل هذا الزر",
      selector: '[data-id="menu-item-settings"]',
      icon: <Settings className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-bookmarks",
      title: "العلامات المرجعية",
      text: "الوصول السريع للآيات التي قمت بحفظها.",
      selector: '[data-id="menu-item-bookmarks"]',
      icon: <Bookmark className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-more-menu",
      title: "قائمة التطبيقات",
      text: "يمكنك الانتقال مباشرة الى قائمة التطبيقات والاختيار منها",
      selector: '[data-id="menu-item-more-menu"]',
      icon: <Grid className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-quran-download",
      title: "تحميل القرآن",
      text: "تحميل صفحات المصحف والتلاوات للاستخدام بدون إنترنت.",
      selector: '[data-id="menu-item-quran-download-parent"]',
      icon: <Download className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-tafseer-download",
      title: "تحميل التفسير",
      text: "تحميل كتب التفسير للقراءة في أي وقت بدون إنترنت.",
      selector: '[data-id="menu-item-tafseer-download"]',
      icon: <Download className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-interface-customization",
      title: "تخصيص الواجهة",
      text: "تخصيص أزرار الاختصارات التي تظهر في القائمة الجانبية.",
      selector: '[data-id="menu-item-interface-customization"]',
      icon: <Palette className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-readers",
      title: "القراء",
      text: "اختر قارئك المفضل للاستماع إلى التلاوة العطرة.",
      selector: '[data-id="menu-item-audio"]',
      icon: <Headphones className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-font",
      title: "نوع الخط",
      text: "تغيير نوع الخط بما يناسب راحتك في القراءة.",
      selector: '[data-id="menu-item-font-type"]',
      icon: <Type className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-notifications",
      title: "الإشعارات",
      text: "يمكنك الوصول الى اشعارات التطبيق واشعارات الهاتف والتعديل عليها بما يناسبك",
      selector: '[data-id="menu-item-notification-settings"]',
      icon: <Bell className="w-8 h-8 text-white" />,
    },
    {
      id: "floating-menu-sajdah",
      title: "آيات السجدة",
      text: "قائمة بجميع مواضع السجدات في القرآن الكريم للوصول السريع.",
      selector: '[data-id="menu-item-sajdah-list"]',
      icon: <Compass className="w-8 h-8 text-white" />,
    },
  ];

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
      }
    } else if (currentView === "download_memorization") {
      if (
        selectedReader &&
        !MEMORIZATION_READERS.some((r) => r.id === selectedReader)
      ) {
        setSelectedReader(MEMORIZATION_READERS[0].id);
      }
    } else if (currentView === "download_listening") {
      if (selectedReader && !LISTEN_RECITERS.some((r) => r.id === selectedReader)) {
        setSelectedReader(LISTEN_RECITERS[0].id);
      }
    }
  }, [currentView, selectedReader]);

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
      const isSurahMode = currentView === "download_listening";

      const dSurahs: string[] = [];
      for (let s = 1; s <= 114; s++) {
        let allItemsDownloaded = true;
        if (isSurahMode) {
          const fileName = `${sanitizedId}_${String(s).padStart(3, "0")}.mp3`;
          if (!downloadedSet.has(fileName)) allItemsDownloaded = false;
        } else {
          const surahData = quranData.surahs.find((sd: any) => sd.number === s);
          if (!surahData) {
            allItemsDownloaded = false;
          } else {
            for (let i = 1; i <= surahData.ayahs.length; i++) {
              if (!downloadedSet.has(`${sanitizedId}_${s}_${i}.mp3`)) {
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
        const ayahs = getAyahsForJuz(j);
        let allItemsDownloaded = true;
        if (isSurahMode) {
          const surahsInJuz = Array.from(new Set(ayahs.map(a => a.surah)));
          for (const sNum of surahsInJuz) {
            const fileName = `${sanitizedId}_${String(sNum).padStart(3, "0")}.mp3`;
            if (!downloadedSet.has(fileName)) {
              allItemsDownloaded = false;
              break;
            }
          }
        } else {
          for (const a of ayahs) {
            if (!downloadedSet.has(`${sanitizedId}_${a.surah}_${a.ayah}.mp3`)) {
              allItemsDownloaded = false;
              break;
            }
          }
        }
        if (allItemsDownloaded) dJuzs.push(j.toString());
      }
      setDownloadedSurahs(dSurahs);
      setDownloadedJuzs(dJuzs);
    } catch (e) {
      console.error('Error checking downloads:', e);
    }
  }, [selectedReader, selectedTafsir, currentView]);

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
      if (selectedSurahs.includes("all")) return downloadedSurahs.length === 114;
      for (const s of selectedSurahs) {
        if (!downloadedSurahs.includes(s)) return false;
      }
      for (const j of selectedJuzs) {
        if (!downloadedJuzs.includes(j)) return false;
      }
      return true;
    }
  };

  useEffect(() => {
    if (isFloatingMenuOpen) {
      setCurrentView(initialView as MenuView);
      setIsAddModalOpen(false);
    }
  }, [isFloatingMenuOpen, initialView]);

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

  // --- Download Logic ---
  const getSanitizedReaderId = (readerId: string) => {
    if (readerId.startsWith("http")) {
      return readerId
        .replace(/https?:\/\//, "")
        .replace(/\//g, "_")
        .replace(/\./g, "_");
    }
    return readerId;
  };

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
          checkDownloads(); // Refresh status
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
        checkDownloads(); // Refresh status
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
          checkDownloads(); // Refresh status
          return;
        }

        const response = await fetch(url, {
          signal: abortControllerRef.current?.signal,
        });
        if (!response.ok) throw new Error(`فشل التحميل: ${response.status}`);

        const blob = await response.blob();
        if (blob.size < 1000) return;

        await cache.put(
          url,
          new Response(blob, {
            headers: { "Content-Type": "audio/mpeg" },
          }),
        );
        storeAudioOffline(fileName, blob);
        checkDownloads(); // Refresh status
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
        const itemsToDownload: { s: number; a: number }[] = [];

        if (selectedSurahs.includes("all")) {
          for (let s = 1; s <= 114; s++) {
            const surahData = quranData.surahs.find(
              (sd: any) => sd.number === s,
            );
            if (surahData) {
              if (mode === "surah") {
                itemsToDownload.push({ s, a: 0 });
              } else {
                for (let a = 1; a <= surahData.ayahs.length; a++) {
                  itemsToDownload.push({ s, a });
                }
              }
            }
          }
        } else {
          // Add selected surahs
          for (const sStr of selectedSurahs) {
            const s = parseInt(sStr);
            const surahData = quranData.surahs.find(
              (sd: any) => sd.number === s,
            );
            if (surahData) {
              if (mode === "surah") {
                itemsToDownload.push({ s, a: 0 });
              } else {
                for (let a = 1; a <= surahData.ayahs.length; a++) {
                  itemsToDownload.push({ s, a });
                }
              }
            }
          }
          // Add selected juzs
          for (const jStr of selectedJuzs) {
            const juzAyahs = getAyahsForJuz(parseInt(jStr));
            if (mode === "surah") {
              const surahsInJuz = Array.from(
                new Set(juzAyahs.map((a) => a.surah)),
              );
              for (const s of surahsInJuz) {
                if (
                  !itemsToDownload.some((item) => item.s === s && item.a === 0)
                ) {
                  itemsToDownload.push({ s, a: 0 });
                }
              }
            } else {
              for (const item of juzAyahs) {
                if (
                  !itemsToDownload.some(
                    (existing) =>
                      existing.s === item.surah && existing.a === item.ayah,
                  )
                ) {
                  itemsToDownload.push({ s: item.surah, a: item.ayah });
                }
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

        const finalItemsToDownload = itemsToDownload.filter((item) => {
          let fileName = "";
          if (item.a === 0) {
            fileName = `${sanitizedId}_${String(item.s).padStart(3, "0")}.mp3`;
          } else {
            fileName = `${sanitizedId}_${item.s}_${item.a}.mp3`;
          }
          return !downloadedAudioSet.has(fileName);
        });

        const total = finalItemsToDownload.length;
        if (total === 0 && itemsToDownload.length > 0) {
          setStatus("جميع العناصر المحددة محملة مسبقاً");
          showToast("جميع العناصر المحددة محملة مسبقاً");
          setIsDownloading(false);
          return;
        }

        const skippedCount = itemsToDownload.length - total;
        if (skippedCount > 0) {
          showToast(`تم تخطي ${skippedCount} عنصر محمل مسبقاً`);
        }

        for (let i = 0; i < total; i++) {
          if (abortControllerRef.current?.signal.aborted) break;
          const item = finalItemsToDownload[i];

          if (item.a === 0) {
            setStatus(`جاري تحميل سورة ${SURAH_NAMES_AR[item.s - 1]}...`);
            await downloadSurahFile(selectedReader, item.s);
          } else {
            setStatus(
              `جاري تحميل سورة ${SURAH_NAMES_AR[item.s - 1]} آية ${item.a}...`,
            );
            await downloadAyah(selectedReader, item.s, item.a);
          }

          setProgress(((i + 1) / total) * 100);
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
          setStatus("جميع التفاسير المحددة محملة مسبقاً");
          showToast("جميع التفاسير المحددة محملة مسبقاً");
          setIsDownloading(false);
          return;
        }

        const skippedCount = itemsList.length - total;
        if (skippedCount > 0) {
          showToast(`تم تخطي ${skippedCount} تفسير محمل مسبقاً`);
        }

        for (let i = 0; i < total; i++) {
          if (abortControllerRef.current?.signal.aborted) break;
          const s = finalTafseersToDownload[i];
          setStatus(`جاري تحميل تفسير سورة ${SURAH_NAMES_AR[s - 1]}...`);
          await downloadSpecificTafsir(selectedTafsir, s);
          setProgress(((i + 1) / total) * 100);
        }
      }

      if (!abortControllerRef.current?.signal.aborted) {
        setStatus("تم التحميل بنجاح");
        showToast("تم التحميل بنجاح");
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

    localStorage.setItem("current_theme_id" + modeSuffix, themeId);

    const themeColors = {
      "top-toolbar": { bg: theme.barBg, border: theme.barBorder },
      "bottom-toolbar": { bg: theme.barBg, border: theme.barBorder },
      surah: {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
        font: theme.font,
      },
      juz: {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
        font: theme.font,
      },
      page: {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
        font: theme.font,
      },
      audio: {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
      "btn-settings": {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
      "btn-home": {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
      "btn-bookmark": {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
      "btn-bookmarks-list": {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
      "btn-themes": {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
      "btn-autoscroll": {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
      "btn-menu": {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
      "btn-search": {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
      "btn-share": {
        bg: theme.btnBg,
        text: theme.btnText,
        border: (theme as any).btnBorder || theme.barBorder,
      },
    };

    localStorage.setItem(
      "toolbar_colors_v2" + modeSuffix,
      JSON.stringify(themeColors),
    );

    const savedSettings = JSON.parse(
      localStorage.getItem("quran_settings" + modeSuffix) || "{}",
    );
    const baseSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
    const updatedSettings = {
      ...baseSettings,
      bgColor: theme.bg || "#ffffff",
      textColor: theme.text || "#000000",
      fontFamily: theme.font,
      ...(baseSettings.lockHighlightColor
        ? {}
        : { highlightTextColor: theme.highlightText || theme.accent || (theme as any).palette?.[0] }),
      theme: themeId,
    };
    localStorage.setItem(
      "quran_settings" + modeSuffix,
      JSON.stringify(updatedSettings),
    );

    window.dispatchEvent(new Event("theme-change"));
    showToast(`تم تطبيق ثيم: ${theme.name}`);
  };

  return (
    <>
      {/* Backdrop to block interaction with background and close menu on click */}
      <div
        className={`fixed inset-0 z-[999] transition-opacity duration-300 ${isFloatingMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsFloatingMenuOpen(false)}
        style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      />
      <div
        ref={floatingMenuRef}
        className={`fixed ${isLandscape ? "top-0 bottom-0" : "top-[calc(3.5rem+var(--logical-safe-top))] bottom-[calc(3.5rem+var(--logical-safe-bottom))]"} right-0 z-[1000] flex items-start gap-4 pointer-events-none`}
        dir="rtl"
      >
        {/* The Main Menu Container */}
        <div
          id="floating-menu"
          className={`w-[190px] max-w-[85vw] ${isLandscape ? "rounded-none" : "rounded-l-2xl"} shadow-2xl transition-all duration-300 origin-top-right flex flex-col pointer-events-auto h-full ${isFloatingMenuOpen ? "opacity-100 visible scale-100 translate-y-0" : "opacity-0 invisible scale-95 -translate-y-4"}`}
          style={{
            fontFamily: currentTheme.font || "var(--font-amiri)",
            backgroundColor: currentTheme.bg || "#ffffff",
            color: currentTheme.text || "#000000",
            borderTop: isLandscape
              ? "0px none"
              : `2px solid ${currentTheme.barBorder || currentTheme.accent || "#000000"}`,
            borderBottom: isLandscape
              ? "0px none"
              : `2px solid ${currentTheme.barBorder || currentTheme.accent || "#000000"}`,
            borderLeft: `2px solid ${currentTheme.barBorder || currentTheme.accent || "#000000"}`,
            borderRight: `0px solid transparent`,
          }}
        >
          {isAddModalOpen ? (
            /* Customization Content (Replacing Main Menu) */
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Plus size={20} style={{ color: "#000000" }} />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: "#000000" }}
                  >
                    تخصيص الاختصارات
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                <div className="flex flex-col gap-1">
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
                        className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-right w-full group"
                      >
                        <div
                          style={{ color: isSelected ? "#000000" : "#9ca3af" }}
                          className="transition-colors"
                        >
                          {shortcut.icon}
                        </div>
                        <span
                          className={`text-sm flex-1 transition-all ${isSelected ? "text-gray-900 font-bold" : "text-gray-500"}`}
                        >
                          {shortcut.label}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-black border-black text-white" : "border-gray-300 group-hover:border-gray-400"}`}
                        >
                          {isSelected && <Save size={12} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 border-t bg-gray-50/80 flex gap-2">
                <button
                  onClick={saveShortcuts}
                  className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  style={{ backgroundColor: iconColor }}
                >
                  <Save size={16} />
                  حفظ
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-200 text-gray-600 rounded-xl font-bold text-sm active:scale-95 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : currentView === "themes" ? (
            /* Themes View */
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-2.5 border-b flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Palette size={18} style={{ color: iconColor }} />
                  <h3
                    className="font-bold text-xs"
                    style={{ color: currentTheme.text }}
                  >
                    المظهر
                  </h3>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-3 custom-scrollbar flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Toggles Section */}
                  <div
                    className="space-y-3 p-3 rounded-xl border"
                    style={{
                      backgroundColor: `${currentTheme.text}05`,
                      borderColor: `${currentTheme.text}10`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <label
                        className="text-[11px] font-bold opacity-80"
                        style={{ color: currentTheme.text }}
                      >
                        قفل لون التحديد
                      </label>
                      <div className="relative inline-block w-8 align-middle select-none">
                        <input
                          type="checkbox"
                          id="menu-lock-highlight"
                          checked={settings?.lockHighlightColor || false}
                          onChange={(e) =>
                            updateSetting(
                              "lockHighlightColor",
                              e.target.checked,
                            )
                          }
                          className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="menu-lock-highlight"
                          className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${settings?.lockHighlightColor ? "bg-emerald-500" : "bg-gray-300"}`}
                        ></label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label
                        className="text-[11px] font-bold opacity-80"
                        style={{ color: currentTheme.text }}
                      >
                        إخفاء الأشرطة
                      </label>
                      <div className="relative inline-block w-8 align-middle select-none">
                        <input
                          type="checkbox"
                          id="menu-hide-toolbars"
                          checked={isTransparentMode}
                          onChange={(e) => {
                            setIsTransparentMode(e.target.checked);
                            const modeSuffix =
                              readingMode === "mushaf"
                                ? isLandscape
                                  ? "_h"
                                  : "_v"
                                : `_${readingMode}_${isLandscape ? "h" : "v"}`;
                            localStorage.setItem(
                              "transparent_mode" + modeSuffix,
                              String(e.target.checked),
                            );
                            window.dispatchEvent(new Event("settings-change"));
                            showToast(
                              e.target.checked
                                ? "تم تفعيل إخفاء الأشرطة"
                                : "تم تعطيل إخفاء الأشرطة",
                            );
                          }}
                          className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="menu-hide-toolbars"
                          className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${isTransparentMode ? "bg-emerald-500" : "bg-gray-300"}`}
                        ></label>
                      </div>
                    </div>
                  </div>


                  {/* Themes Grid */}
                  <div className="grid grid-cols-4 gap-y-5 gap-x-2">
                    {Object.entries(THEMES).map(
                      ([id, theme]: [string, any]) => (
                        <React.Fragment key={id}>
                          <button
                            onClick={() => {
                              applyTheme(id);
                              setIsFloatingMenuOpen(false);
                            }}
                            className="flex flex-col items-center gap-1.5 group"
                          >
                            <div
                              className={`w-[20px] h-[20px] rounded-full border-2 transition-all flex items-center justify-center ${localStorage.getItem("current_theme_id" + (isMemorizationMode ? `_memorization_${isLandscape ? "h" : "v"}` : isWirdMode ? `_wird_${isLandscape ? "h" : "v"}` : readingMode === "mushaf" ? (isLandscape ? "_h" : "_v") : `_${readingMode}_${isLandscape ? "h" : "v"}`)) === id ? "scale-110 border-gray-400 shadow-md" : "border-transparent hover:scale-105"}`}
                              style={{
                                backgroundColor:
                                  id === "black"
                                    ? "#000000"
                                    : id === "deep_black"
                                      ? "#000000"
                                      : theme.accent ||
                                        theme.palette?.[0] ||
                                        theme.barText ||
                                        "#000000",
                              }}
                            >
                              {localStorage.getItem(
                                "current_theme_id" +
                                  (isMemorizationMode
                                    ? `_memorization_${isLandscape ? "h" : "v"}`
                                    : isWirdMode
                                      ? `_wird_${isLandscape ? "h" : "v"}`
                                      : readingMode === "mushaf"
                                        ? isLandscape
                                          ? "_h"
                                          : "_v"
                                        : `_${readingMode}_${isLandscape ? "h" : "v"}`),
                              ) === id && (
                                <div
                                  className={`w-1.5 h-1.5 rounded-full shadow-sm ${id === "deep_black" ? "bg-emerald-500" : "bg-white"}`}
                                ></div>
                              )}
                            </div>
                            <span
                              className="text-[7px] font-bold opacity-80 truncate w-full text-center leading-tight"
                              style={{ color: currentTheme.text }}
                            >
                              {theme.name}
                            </span>
                          </button>
                          {id === "lime" && (
                            <div
                              className="col-span-4 h-px my-1"
                              style={{
                                backgroundColor: `${currentTheme.text}15`,
                              }}
                            ></div>
                          )}
                        </React.Fragment>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div
                className="p-2 border-t"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    backgroundColor: `${currentTheme.text}15`,
                    color: currentTheme.text,
                  }}
                >
                  رجوع
                </button>
              </div>
            </div>
          ) : currentView === "download_quran_menu" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Download size={20} style={{ color: iconColor }} />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: currentTheme.text }}
                  >
                    تحميل القرآن
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2">
                <MenuItem
                  icon={<Download size={18} />}
                  label="تحميل المصحف"
                  onClick={() => setCurrentView("download_quran")}
                  iconColor={iconColor}
                  currentTheme={currentTheme}
                />
                <MenuItem
                  icon={<Headphones size={18} />}
                  label="تحميل الاستماع"
                  onClick={() => setCurrentView("download_listening")}
                  iconColor={iconColor}
                  currentTheme={currentTheme}
                />
                <MenuItem
                  icon={<Brain size={18} />}
                  label="تحميل التحفيظ"
                  onClick={() => setCurrentView("download_memorization")}
                  iconColor={iconColor}
                  currentTheme={currentTheme}
                />
              </div>
              <div
                className="p-3 border-t"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    backgroundColor: `${currentTheme.text}15`,
                    color: currentTheme.text,
                  }}
                >
                  رجوع
                </button>
              </div>
            </div>
          ) : currentView === "audio" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Headphones size={20} style={{ color: iconColor }} />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: currentTheme.text }}
                  >
                    القراء
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar flex flex-col justify-between">
                <div className="grid grid-cols-1 gap-3">
                  {READERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        updateSetting("reader", r.id);
                        setCurrentView("main");
                        setIsFloatingMenuOpen(false);
                        showToast(`تم اختيار القارئ: ${r.name}`);
                      }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${settings.reader === r.id ? "border-emerald-500" : ""}`}
                      style={{
                        backgroundColor:
                          settings.reader === r.id
                            ? `${currentTheme.accent}15`
                            : `${currentTheme.text}05`,
                        borderColor:
                          settings.reader === r.id
                            ? currentTheme.accent
                            : `${currentTheme.text}10`,
                        color: currentTheme.text,
                      }}
                    >
                      <span
                        className={`text-sm font-bold ${settings.reader === r.id ? "text-emerald-500" : ""}`}
                      >
                        {r.name}
                      </span>
                      {settings.reader === r.id && (
                        <Check size={16} className="text-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="p-3 border-t"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    backgroundColor: `${currentTheme.text}15`,
                    color: currentTheme.text,
                  }}
                >
                  رجوع
                </button>
              </div>
            </div>
          ) : currentView === "font" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Type size={20} style={{ color: iconColor }} />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: currentTheme.text }}
                  >
                    نوع الخط
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar flex flex-col justify-between">
                <div className="grid grid-cols-1 gap-3">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        updateSetting("fontFamily", f.id);
                        setCurrentView("main");
                        setIsFloatingMenuOpen(false);
                        showToast(`تم تغيير الخط إلى: ${f.name}`);
                      }}
                      className={`flex flex-col p-4 rounded-xl border transition-all ${settings.fontFamily === f.id ? "border-emerald-500" : ""}`}
                      style={{
                        backgroundColor:
                          settings.fontFamily === f.id
                            ? `${currentTheme.accent}15`
                            : `${currentTheme.text}05`,
                        borderColor:
                          settings.fontFamily === f.id
                            ? currentTheme.accent
                            : `${currentTheme.text}10`,
                        color: currentTheme.text,
                      }}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span
                          className={`text-sm font-bold ${settings.fontFamily === f.id ? "text-emerald-500" : ""}`}
                        >
                          {f.name}
                        </span>
                        {settings.fontFamily === f.id && (
                          <Check size={16} className="text-emerald-500" />
                        )}
                      </div>
                      <span
                        className="text-xl text-center opacity-70"
                        style={{ fontFamily: f.id }}
                      >
                        ﴿بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ﴾
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="p-3 border-t"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    backgroundColor: `${currentTheme.text}15`,
                    color: currentTheme.text,
                  }}
                >
                  رجوع
                </button>
              </div>
            </div>
          ) : currentView === "notifications" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Bell size={20} style={{ color: iconColor }} />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: currentTheme.text }}
                  >
                    الإشعارات
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar flex flex-col justify-between">
                <NotificationSettingsContent
                  showToast={showToast}
                  currentTheme={currentTheme}
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
                className="p-3 border-t"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    backgroundColor: `${currentTheme.text}15`,
                    color: currentTheme.text,
                  }}
                >
                  رجوع
                </button>
              </div>
            </div>
          ) : currentView === "download_tafseer" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Download size={20} style={{ color: iconColor }} />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: currentTheme.text }}
                  >
                    تحميل التفسير
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-6">
                  {/* Tafsir Selection */}
                  <div className="space-y-2">
                    <label
                      className="text-xs font-bold opacity-50 block"
                      style={{ color: currentTheme.text }}
                    >
                      اختر التفسير
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {TAFSEERS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTafsir(t.id)}
                          className={`p-3 text-xs font-bold rounded-xl border transition-all text-right flex justify-between items-center ${selectedTafsir === t.id ? "border-emerald-500" : ""}`}
                          style={{
                            backgroundColor:
                              selectedTafsir === t.id
                                ? `${currentTheme.accent}15`
                                : `${currentTheme.text}05`,
                            borderColor:
                              selectedTafsir === t.id
                                ? currentTheme.accent
                                : `${currentTheme.text}10`,
                            color:
                              selectedTafsir === t.id
                                ? "text-emerald-500"
                                : currentTheme.text,
                          }}
                        >
                          <span>{t.name}</span>
                          {selectedTafsir === t.id && (
                            <Check size={14} className="text-emerald-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Surah Selection */}
                  <div className="space-y-2">
                    <label
                      className="text-xs font-bold opacity-50 block"
                      style={{ color: currentTheme.text }}
                    >
                      اختر السور
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                      <button
                        onClick={() => toggleSelection("all", "surah")}
                        className={`p-2 text-[10px] font-bold rounded-lg border transition-all ${selectedSurahs.includes("all") ? "bg-emerald-500 border-emerald-500 text-white" : ""}`}
                        style={
                          !selectedSurahs.includes("all")
                            ? {
                                backgroundColor: `${currentTheme.text}05`,
                                borderColor: `${currentTheme.text}10`,
                                color: currentTheme.text,
                              }
                            : {}
                        }
                      >
                        الكل
                      </button>
                      {SURAH_NAMES_AR.map((name, i) => {
                        const isDownloaded = downloadedTafseers.includes((i + 1).toString());
                        const isSelected = selectedSurahs.includes((i + 1).toString());
                        return (
                          <button
                            key={i}
                            onClick={() =>
                              toggleSelection((i + 1).toString(), "surah")
                            }
                            className={`p-2 text-[10px] font-bold rounded-lg border transition-all ${isSelected ? "border-emerald-500" : isDownloaded ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400" : ""}`}
                            style={{
                              backgroundColor: isSelected
                                ? `${currentTheme.accent}15`
                                : isDownloaded ? undefined : `${currentTheme.text}05`,
                              borderColor: isSelected
                                ? currentTheme.accent
                                : isDownloaded ? undefined : `${currentTheme.text}10`,
                              color: isSelected
                                ? "text-emerald-500"
                                : isDownloaded ? undefined : currentTheme.text,
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isDownloaded && <Check size={10} />}
                              <span>{name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Juz Selection */}
                  <div className="space-y-2">
                    <label
                      className="text-xs font-bold opacity-50 block"
                      style={{ color: currentTheme.text }}
                    >
                      اختر الأجزاء
                    </label>
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 custom-scrollbar">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
                        const isDownloaded = downloadedJuzs.includes(j.toString());
                        const isSelected = selectedJuzs.includes(j.toString());
                        return (
                          <button
                            key={j}
                            onClick={() => toggleSelection(j.toString(), "juz")}
                            className={`p-2 text-[10px] font-bold rounded-lg border transition-all ${isSelected ? "border-emerald-500" : isDownloaded ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400" : ""}`}
                            style={{
                              backgroundColor: isSelected
                                ? `${currentTheme.accent}15`
                                : isDownloaded ? undefined : `${currentTheme.text}05`,
                              borderColor: isSelected
                                ? currentTheme.accent
                                : isDownloaded ? undefined : `${currentTheme.text}10`,
                              color: isSelected
                                ? "text-emerald-500"
                                : isDownloaded ? undefined : currentTheme.text,
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isDownloaded && <Check size={10} />}
                              <span>ج {j}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="p-3 border-t space-y-2"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
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
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${isDownloading ? "bg-red-500 text-white" : "text-white shadow-md active:scale-95"} ${!isDownloading && isAllSelectedDownloaded() ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                    style={!isDownloading ? { backgroundColor: iconColor } : {}}
                  >
                    {isDownloading ? <X size={16} /> : <Download size={16} />}
                    {isDownloading ? "إيقاف" : isAllSelectedDownloaded() ? "محمل" : "تحميل"}
                  </button>
                  <button
                    onClick={() => setCurrentView("main")}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-all"
                    style={{
                      backgroundColor: `${currentTheme.text}15`,
                      color: currentTheme.text,
                    }}
                  >
                    رجوع
                  </button>
                </div>
              </div>
            </div>
          ) : currentView === "interface" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Palette size={20} style={{ color: iconColor }} />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: currentTheme.text }}
                  >
                    تخصيص الواجهة
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                <ToolbarColorPickerContent
                  currentTheme={currentTheme}
                  isLandscape={isLandscape}
                  readingMode={readingMode}
                  isWirdMode={isWirdMode}
                  isMemorizationMode={isMemorizationMode}
                  showToast={showToast}
                />
              </div>
              <div
                className="p-3 border-t"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    backgroundColor: `${currentTheme.text}15`,
                    color: currentTheme.text,
                  }}
                >
                  رجوع
                </button>
              </div>
            </div>
          ) : currentView === "download_quran" ||
            currentView === "download_listening" ||
            currentView === "download_memorization" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Download size={20} style={{ color: iconColor }} />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: currentTheme.text }}
                  >
                    {currentView === "download_quran"
                      ? "تحميل المصحف"
                      : currentView === "download_listening"
                        ? "تحميل الاستماع"
                        : "تحميل التحفيظ"}
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-6">
                  {/* Reciter Selection */}
                  <div className="space-y-2">
                    <label
                      className="text-xs font-bold opacity-50 block"
                      style={{ color: currentTheme.text }}
                    >
                      اختر القارئ
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(currentView === "download_memorization"
                        ? MEMORIZATION_READERS
                        : currentView === "download_quran"
                          ? READERS
                          : LISTEN_RECITERS
                      ).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedReader(r.id)}
                          className={`p-2 text-[10px] font-bold rounded-lg border transition-all ${selectedReader === r.id ? "border-emerald-500" : ""}`}
                          style={{
                            backgroundColor:
                              selectedReader === r.id
                                ? `${currentTheme.accent}15`
                                : `${currentTheme.text}05`,
                            borderColor:
                              selectedReader === r.id
                                ? currentTheme.accent
                                : `${currentTheme.text}10`,
                            color:
                              selectedReader === r.id
                                ? "text-emerald-500"
                                : currentTheme.text,
                          }}
                        >
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Surah Selection */}
                  <div className="space-y-2">
                    <label
                      className="text-xs font-bold opacity-50 block"
                      style={{ color: currentTheme.text }}
                    >
                      اختر السور
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                      <button
                        onClick={() => toggleSelection("all", "surah")}
                        className={`p-2 text-[10px] font-bold rounded-lg border transition-all ${selectedSurahs.includes("all") ? "bg-emerald-500 border-emerald-500 text-white" : ""}`}
                        style={
                          !selectedSurahs.includes("all")
                            ? {
                                backgroundColor: `${currentTheme.text}05`,
                                borderColor: `${currentTheme.text}10`,
                                color: currentTheme.text,
                              }
                            : {}
                        }
                      >
                        الكل
                      </button>
                      {SURAH_NAMES_AR.map((name, i) => {
                        const isDownloaded = downloadedSurahs.includes((i + 1).toString());
                        const isSelected = selectedSurahs.includes((i + 1).toString());
                        return (
                          <button
                            key={i}
                            onClick={() =>
                              toggleSelection((i + 1).toString(), "surah")
                            }
                            className={`p-2 text-[10px] font-bold rounded-lg border transition-all ${isSelected ? "border-emerald-500" : isDownloaded ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400" : ""}`}
                            style={{
                              backgroundColor: isSelected
                                ? `${currentTheme.accent}15`
                                : isDownloaded ? undefined : `${currentTheme.text}05`,
                              borderColor: isSelected
                                ? currentTheme.accent
                                : isDownloaded ? undefined : `${currentTheme.text}10`,
                              color: isSelected
                                ? "text-emerald-500"
                                : isDownloaded ? undefined : currentTheme.text,
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isDownloaded && <Check size={10} />}
                              <span>{name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Juz Selection */}
                  <div className="space-y-2">
                    <label
                      className="text-xs font-bold opacity-50 block"
                      style={{ color: currentTheme.text }}
                    >
                      اختر الأجزاء
                    </label>
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 custom-scrollbar">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
                        const isDownloaded = downloadedJuzs.includes(j.toString());
                        const isSelected = selectedJuzs.includes(j.toString());
                        return (
                          <button
                            key={j}
                            onClick={() => toggleSelection(j.toString(), "juz")}
                            className={`p-2 text-[10px] font-bold rounded-lg border transition-all ${isSelected ? "border-emerald-500" : isDownloaded ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400" : ""}`}
                            style={{
                              backgroundColor: isSelected
                                ? `${currentTheme.accent}15`
                                : isDownloaded ? undefined : `${currentTheme.text}05`,
                              borderColor: isSelected
                                ? currentTheme.accent
                                : isDownloaded ? undefined : `${currentTheme.text}10`,
                              color: isSelected
                                ? "text-emerald-500"
                                : isDownloaded ? undefined : currentTheme.text,
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isDownloaded && <Check size={10} />}
                              <span>ج {j}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="p-3 border-t space-y-2"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
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
                    onClick={() =>
                      startDownload(
                        "quran",
                        currentView === "download_listening" ? "surah" : "ayah",
                      )
                    }
                    disabled={!isDownloading && isAllSelectedDownloaded()}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${isDownloading ? "bg-red-500 text-white" : "text-white shadow-md active:scale-95"} ${!isDownloading && isAllSelectedDownloaded() ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                    style={!isDownloading ? { backgroundColor: iconColor } : {}}
                  >
                    {isDownloading ? <X size={16} /> : <Download size={16} />}
                    {isDownloading ? "إيقاف" : isAllSelectedDownloaded() ? "محمل" : "تحميل"}
                  </button>
                  <button
                    onClick={() => setCurrentView("download_quran_menu")}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-all"
                    style={{
                      backgroundColor: `${currentTheme.text}15`,
                      color: currentTheme.text,
                    }}
                  >
                    رجوع
                  </button>
                </div>
              </div>
            </div>
          ) : currentView === "bookmarks" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Bookmark size={20} style={{ color: iconColor }} />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: currentTheme.text }}
                  >
                    العلامات المرجعية
                  </h3>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                {bookmarks.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-full gap-2"
                    style={{ color: `${currentTheme.text}40` }}
                  >
                    <Bookmark size={40} className="opacity-20" />
                    <span className="text-xs font-bold">
                      لا توجد علامات مرجعية
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl border flex items-center justify-between group transition-all cursor-pointer"
                        style={{
                          backgroundColor: `${currentTheme.text}05`,
                          borderColor: `${currentTheme.text}10`,
                          color: currentTheme.text,
                        }}
                        onClick={() => {
                          if (jumpToAyah) {
                            jumpToAyah(b.s, b.a, true);
                            setIsFloatingMenuOpen(false);
                          }
                        }}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm">
                            سورة {SURAH_NAMES_AR[b.s - 1]}
                          </span>
                          <span className="text-[10px] opacity-60">
                            آية {b.a} • {b.date}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (deleteBookmark) deleteBookmark(b.id);
                          }}
                          className="p-2 rounded-full transition-all"
                          style={{ color: `${currentTheme.text}40` }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="p-3 border-t"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    backgroundColor: `${currentTheme.text}15`,
                    color: currentTheme.text,
                  }}
                >
                  رجوع
                </button>
              </div>
            </div>
          ) : currentView === "sajdah_list" ? (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div
                className="p-2 border-b flex items-center justify-center"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderBottomColor: `${currentTheme.text}20`,
                }}
              >
                <button
                  onClick={() => handleAction(() => openModal("sajdah-card"))}
                  className="p-1.5 rounded-lg transition-all flex items-center gap-2 w-full justify-center shadow-sm active:scale-95"
                  style={{
                    backgroundColor: `${currentTheme.accent}20`,
                    color: currentTheme.accent,
                    border: `1px solid ${currentTheme.accent}40`,
                  }}
                >
                  <span className="text-[10px] font-bold">معلومات السجدة</span>
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-2.5 custom-scrollbar">
                <div className="space-y-1.5">
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
                        className="p-2 rounded-lg border flex flex-col items-center gap-0.5 transition-all cursor-pointer hover:shadow-sm active:scale-[0.98]"
                        style={{
                          backgroundColor: `${currentTheme.text}05`,
                          borderColor: `${currentTheme.text}10`,
                          color: currentTheme.text,
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
                          {toArabic(idx + 1)} - سورة {SURAH_NAMES_AR[loc.s - 1]}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] opacity-70 font-bold">
                          <span className="flex items-center gap-1">
                            <i className="fa-regular fa-file-lines text-[8px]"></i>
                            آية {toArabic(loc.a)}
                          </span>
                          <span className="w-px h-2.5 bg-current opacity-20"></span>
                          <span className="flex items-center gap-1">
                            <i className="fa-solid fa-book-open text-[8px]"></i>
                            الجزء {toArabic(juzNum)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div
                className="p-3 border-t"
                style={{
                  backgroundColor: `${currentTheme.accent}10`,
                  borderTopColor: `${currentTheme.text}20`,
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    backgroundColor: `${currentTheme.text}15`,
                    color: currentTheme.text,
                  }}
                >
                  رجوع
                </button>
              </div>
            </div>
          ) : (
            /* Main Menu Content */
            <div className="p-2 flex flex-col justify-between overflow-y-auto flex-grow custom-scrollbar min-h-0">
              {/* خيارات القراءة */}
              <MenuSection
                title="خيارات القراءة"
                iconColor={sidebarIconColor}
                titleColor="#2563eb"
                currentTheme={currentTheme}
              >
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
                />
                {!isLandscape && (
                  <>
                    <MenuItem
                      data-id="menu-item-tafseer"
                      icon={<Book size={18} />}
                      label="التفسير"
                      onClick={() => handleAction(() => setReadingMode("tafseer"))}
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "tafseer"}
                      currentTheme={currentTheme}
                    />
                    <MenuItem
                      data-id="menu-item-meanings"
                      icon={<FileText size={18} />}
                      label="المعاني"
                      onClick={() => handleAction(() => setReadingMode("meanings"))}
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "meanings"}
                      currentTheme={currentTheme}
                    />
                    <MenuItem
                      data-id="menu-item-translation"
                      icon={<Languages size={18} />}
                      label="الترجمة"
                      onClick={() =>
                        handleAction(() => setReadingMode("translation"))
                      }
                      iconColor={sidebarIconColor}
                      isActive={readingMode === "translation"}
                      currentTheme={currentTheme}
                    />
                  </>
                )}
              </MenuSection>

              {/* الإعدادات والبحث */}
              <MenuSection
                title="الإعدادات والبحث"
                iconColor={sidebarIconColor}
                titleColor="#16a34a"
                currentTheme={currentTheme}
              >
                <MenuItem
                  data-id="menu-item-themes"
                  icon={<Palette size={18} />}
                  label="المظهر"
                  onClick={() => setCurrentView("themes")}
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                />
                <MenuItem
                  data-id="menu-item-global-search"
                  icon={<Search size={18} />}
                  label="البحث المتقدم"
                  onClick={() => handleAction(() => onNavigate('search'))}
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                />
                <MenuItem
                  data-id="menu-item-settings"
                  icon={<Settings size={18} />}
                  label="الإعدادات"
                  onClick={() =>
                    handleAction(() => openModal("settings-modal"))
                  }
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                />
                <MenuItem
                  data-id="menu-item-bookmarks"
                  icon={<Bookmark size={18} />}
                  label="العلامات المرجعية"
                  onClick={() => setCurrentView("bookmarks")}
                  iconColor={sidebarIconColor}
                  currentTheme={currentTheme}
                />
              </MenuSection>

              {/* اختصارات أخرى */}
              <MenuSection
                title="اختصارات أخرى"
                iconColor={sidebarIconColor}
                titleColor="#d97706"
                currentTheme={currentTheme}
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
                      label={shortcut.label}
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
                    />
                  </React.Fragment>
                ))}
              </MenuSection>
            </div>
          )}
        </div>
      </div>
      {isFloatingMenuOpen && !isLandscape && (
        <TutorialOverlay
          tutorialId="floating-menu-tutorial"
          steps={floatingMenuTutorialSteps}
        />
      )}
    </>
  );
};

const NotificationSettingsContent: React.FC<{
  showToast: (msg: string) => void;
  modeSuffix: string;
  currentTheme: any;
}> = ({ showToast, modeSuffix, currentTheme }) => {
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
      sajda: true,
      themes: true,
      downloads: true,
      bookmarks: true,
      juz: true,
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
      quarter: "تنبيهات الأحزاب والأرباع",
      sajda: "تنبيهات السجدات",
      themes: "تنبيهات تغيير الثيمات",
      downloads: "تنبيهات التحميل",
      bookmarks: "تنبيهات الإشارات المرجعية",
      juz: "تنبيهات بداية الأجزاء",
      general: "التنبيهات العامة",
    };

    showToast(`${newSettings[key] ? "تم تفعيل" : "تم تعطيل"} ${labels[key]}`);
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
      sabah: "أذكار الصباح",
      masaa: "أذكار المساء",
      dua: "وقت الدعاء",
      tasbeehMorning: "التسبيح (صباحاً)",
      tasbeehEvening: "التسبيح (مساءً)",
      kahf: "سورة الكهف",
    };

    showToast(`${newSettings[key] ? "تم تفعيل" : "تم تعطيل"} ${labels[key]}`);
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
      firstThird: "أول الليل",
      midnight: "منتصف الليل",
      lastThird: "الثلث الأخير",
    };

    showToast(
      `${newNightNotifs[key] ? "تم تفعيل" : "تم تعطيل"} إشعار ${labels[key]}`,
    );
  };

  const muteAudioForDuration = (durationDays: number) => {
    const muteUntil = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    updateConfig({ audioMutedUntil: muteUntil });
    showToast(`تم تعطيل التنبيهات الصوتية للصلاة لمدة ${durationDays} يوم`);
  };

  const unmuteAudio = () => {
    updateConfig({ audioMutedUntil: undefined });
    showToast("تم تفعيل التنبيهات الصوتية للصلاة");
  };

  const isAudioMuted =
    config.audioMutedUntil && Date.now() < config.audioMutedUntil;

  return (
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: currentTheme.font }}
    >
      <div
        className="flex border-b mb-3"
        style={{ borderColor: `${currentTheme.text}10` }}
      >
        <button
          className={`flex-1 py-2 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${activeTab === "app" ? "border-b-2" : "opacity-60"}`}
          style={{
            color:
              activeTab === "app" ? currentTheme.accent : currentTheme.text,
            borderBottomColor:
              activeTab === "app" ? currentTheme.accent : "transparent",
          }}
          onClick={() => setActiveTab("app")}
        >
          <AppWindow size={14} />
          إشعارات التطبيق
        </button>
        <button
          className={`flex-1 py-2 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${activeTab === "phone" ? "border-b-2" : "opacity-60"}`}
          style={{
            color:
              activeTab === "phone" ? currentTheme.accent : currentTheme.text,
            borderBottomColor:
              activeTab === "phone" ? currentTheme.accent : "transparent",
          }}
          onClick={() => setActiveTab("phone")}
        >
          <Smartphone size={14} />
          إشعارات الهاتف
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 pb-4">
        {activeTab === "app" ? (
          <div className="space-y-2">
            {[
              {
                id: "quarter",
                label: "الأحزاب والأرباع",
                desc: "تنبيه عند الوصول لبداية حزب أو ربع جديد",
              },
              {
                id: "juz",
                label: "بداية الأجزاء",
                desc: "تنبيه عند الانتقال لجزء جديد",
              },
              {
                id: "sajda",
                label: "مواضع السجدات",
                desc: "تنبيه عند الوصول لآية بها سجدة تلاوة",
              },
              {
                id: "themes",
                label: "تغيير الثيمات",
                desc: "تنبيه عند تطبيق لون أو ثيم جديد",
              },
              {
                id: "downloads",
                label: "التحميلات",
                desc: "تنبيهات حالة تحميل السور أو التفاسير",
              },
              {
                id: "bookmarks",
                label: "الإشارات المرجعية",
                desc: "تنبيه عند حفظ أو حذف إشارة مرجعية",
              },
              {
                id: "general",
                label: "تنبيهات عامة",
                desc: "تنبيهات الحفظ، الاختبارات، والعمليات الأخرى",
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => toggleAppSetting(item.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${appSettings[item.id] ? "shadow-sm" : "opacity-60"}`}
                style={{
                  backgroundColor: appSettings[item.id]
                    ? `${currentTheme.accent}15`
                    : `${currentTheme.text}05`,
                  borderColor: appSettings[item.id]
                    ? currentTheme.accent
                    : `${currentTheme.text}10`,
                  color: currentTheme.text,
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[11px]">{item.label}</span>
                  <span className="text-[9px] opacity-60">{item.desc}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors`}
                  style={{
                    backgroundColor: appSettings[item.id]
                      ? currentTheme.accent
                      : `${currentTheme.text}20`,
                    color: appSettings[item.id] ? "#ffffff" : currentTheme.text,
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
              <h4 className="font-bold text-[10px] opacity-80 px-1">
                أوقات الليل
              </h4>
              {[
                {
                  id: "firstThird",
                  label: "أول الليل",
                  desc: "تنبيه بدخول وقت أول الليل",
                },
                {
                  id: "midnight",
                  label: "منتصف الليل",
                  desc: "تنبيه بدخول منتصف الليل الشرعي",
                },
                {
                  id: "lastThird",
                  label: "الثلث الأخير",
                  desc: "تنبيه بدخول الثلث الأخير من الليل",
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
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${isEnabled ? "shadow-sm" : "opacity-60"}`}
                    style={{
                      backgroundColor: isEnabled
                        ? `${currentTheme.accent}15`
                        : `${currentTheme.text}05`,
                      borderColor: isEnabled
                        ? currentTheme.accent
                        : `${currentTheme.text}10`,
                      color: currentTheme.text,
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[11px]">
                        {item.label}
                      </span>
                      <span className="text-[9px] opacity-60">{item.desc}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors`}
                      style={{
                        backgroundColor: isEnabled
                          ? currentTheme.accent
                          : `${currentTheme.text}20`,
                        color: isEnabled ? "#ffffff" : currentTheme.text,
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
              style={{ borderTop: `1px solid ${currentTheme.text}10` }}
            >
              <h4 className="font-bold text-[10px] opacity-80 px-1">
                الأذكار والتسبيح
              </h4>
              {[
                {
                  id: "sabah",
                  label: "أذكار الصباح",
                  desc: "تنبيه يومي الساعة 7:00 صباحاً",
                },
                {
                  id: "masaa",
                  label: "أذكار المساء",
                  desc: "تنبيه يومي الساعة 4:30 عصراً",
                },
                {
                  id: "dua",
                  label: "وقت الدعاء",
                  desc: "تنبيه يومي الساعة 2:00 ظهراً",
                },
                {
                  id: "tasbeehMorning",
                  label: "التسبيح (صباحاً)",
                  desc: "تنبيه يومي الساعة 10:00 صباحاً",
                },
                {
                  id: "tasbeehEvening",
                  label: "التسبيح (مساءً)",
                  desc: "تنبيه يومي الساعة 8:00 مساءً",
                },
                {
                  id: "kahf",
                  label: "سورة الكهف",
                  desc: "تنبيه أسبوعي يوم الجمعة الساعة 9:00 صباحاً",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePhoneSetting(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${phoneSettings[item.id as keyof typeof phoneSettings] ? "shadow-sm" : "opacity-60"}`}
                  style={{
                    backgroundColor: phoneSettings[
                      item.id as keyof typeof phoneSettings
                    ]
                      ? `${currentTheme.accent}15`
                      : `${currentTheme.text}05`,
                    borderColor: phoneSettings[
                      item.id as keyof typeof phoneSettings
                    ]
                      ? currentTheme.accent
                      : `${currentTheme.text}10`,
                    color: currentTheme.text,
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[11px]">{item.label}</span>
                    <span className="text-[9px] opacity-60">{item.desc}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors`}
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
                  إيقاف التنبيهات الصوتية
                </h4>
                {isAudioMuted && (
                  <button
                    onClick={unmuteAudio}
                    className="text-[8px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded font-bold"
                  >
                    تفعيل
                  </button>
                )}
              </div>
              {isAudioMuted && config.audioMutedUntil && (
                <p className="text-[9px] text-red-500 px-1">
                  متوقفة حتى:{" "}
                  {new Date(config.audioMutedUntil).toLocaleDateString("ar-SA")}
                </p>
              )}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "اليوم", days: 1 },
                  { label: "يومين", days: 2 },
                  { label: "3 أيام", days: 3 },
                  { label: "أسبوع", days: 7 },
                  { label: "شهر", days: 30 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => muteAudioForDuration(opt.days)}
                    className="py-1.5 px-1 text-[9px] font-bold rounded-lg border transition-colors"
                    style={{
                      borderColor: `${currentTheme.text}20`,
                      color: currentTheme.text,
                      backgroundColor: `${currentTheme.text}05`,
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
}> = ({
  currentTheme,
  isLandscape,
  readingMode,
  isWirdMode,
  isMemorizationMode,
  showToast,
}) => {
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
    showToast("تم استعادة الألوان الافتراضية");
  };

  const sections = [
    { id: "top-toolbar", label: "الشريط العلوي" },
    { id: "bottom-toolbar", label: "الشريط السفلي" },
    { id: "surah", label: "زر السورة" },
    { id: "page", label: "زر الصفحة" },
    { id: "audio", label: "أزرار الصوت" },
    { id: "btn-menu", label: "زر القائمة" },
    { id: "btn-home", label: "زر الرئيسية" },
    { id: "btn-autoscroll", label: "زر التمرير" },
    { id: "btn-share", label: "زر المشاركة" },
    { id: "btn-bookmark", label: "زر حفظ الإشارة" },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={resetColors}
        className="w-full py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
        style={{
          backgroundColor: `${currentTheme.text}15`,
          color: currentTheme.text,
        }}
      >
        استعادة الألوان الافتراضية
      </button>

      {sections.map((section) => (
        <div
          key={section.id}
          className="p-3 rounded-xl border space-y-3"
          style={{
            backgroundColor: `${currentTheme.text}05`,
            borderColor: `${currentTheme.text}10`,
          }}
        >
          <h4
            className="text-xs font-bold opacity-70"
            style={{ color: currentTheme.text }}
          >
            {section.label}
          </h4>

          {activePicker?.sectionId === section.id && (
            <div
              className="p-1.5 rounded-xl border-2 shadow-sm animate-fadeIn"
              style={{
                backgroundColor: currentTheme.bg,
                borderColor: `${currentTheme.accent}40`,
              }}
            >
              <div className="grid grid-cols-5 gap-3 px-0.5">
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
                      className={`w-full aspect-square rounded-full border transition-all flex items-center justify-center relative overflow-hidden ${isSelected ? "scale-110 z-10 shadow-sm" : "hover:scale-105"}`}
                      style={{
                        backgroundColor:
                          color === "transparent" ? "white" : color,
                        backgroundImage:
                          color === "transparent"
                            ? "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)"
                            : "none",
                        backgroundSize:
                          color === "transparent" ? "8px 8px" : "auto",
                        borderColor: isSelected
                          ? currentTheme.accent
                          : `${currentTheme.text}10`,
                      }}
                    >
                      {isSelected && (
                        <Check
                          size={10}
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

          <div className="flex gap-4">
            {[
              {
                type: "bg" as const,
                label: "الخلفية",
                defaultValue: currentTheme.barBg || "#ffffff",
              },
              {
                type: "text" as const,
                label: "النص",
                defaultValue: currentTheme.barText || "#000000",
              },
              {
                type: "border" as const,
                label: "الحدود",
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
                    className="text-[10px] opacity-50 block text-center"
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
                    className={`w-full h-8 rounded-lg border-2 transition-all relative overflow-hidden ${isActive ? "ring-2 ring-emerald-100" : "shadow-sm"}`}
                    style={{
                      backgroundColor:
                        value === "transparent" ? "white" : value,
                      backgroundImage:
                        value === "transparent"
                          ? "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)"
                          : "none",
                      backgroundSize:
                        value === "transparent" ? "8px 8px" : "auto",
                      borderColor: isActive
                        ? currentTheme.accent
                        : `${currentTheme.text}10`,
                    }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                        <Check
                          size={12}
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
}> = ({ title, children, iconColor, titleColor = "#000000", currentTheme }) => (
  <div className="flex flex-col flex-grow">
    <div
      className="py-1.5 px-3 rounded-md mb-1.5 text-right"
      style={{
        backgroundColor: currentTheme
          ? `${currentTheme.accent}15`
          : "rgba(37, 99, 235, 0.1)",
      }}
    >
      <span
        className="text-[11px] font-bold"
        style={{ color: currentTheme ? currentTheme.accent : titleColor }}
      >
        {title}
      </span>
    </div>
    <div className="flex flex-col px-1.5 justify-evenly flex-grow">
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
}) => (
  <button
    onClick={onClick}
    data-id={dataId}
    className={`flex items-center gap-3 py-2.5 border-b last:border-0 hover:bg-black/5 transition-colors text-right w-full ${isSubItem ? "px-2 py-1.5 border-0" : ""}`}
    style={{
      borderBottomColor: currentTheme ? `${currentTheme.text}10` : "#f3f4f6",
    }}
  >
    <div style={{ color: iconColor }}>{icon}</div>
    <span
      className={`${isSubItem ? "text-[11px]" : "text-[12px]"} font-bold flex-1`}
      style={{
        color: isActive
          ? iconColor
          : currentTheme
            ? currentTheme.text
            : "#000000",
      }}
    >
      {label}
    </span>
  </button>
);

export default FloatingMenu;
