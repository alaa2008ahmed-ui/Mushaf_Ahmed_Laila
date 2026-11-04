import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Search, 
  Zap, 
  MapPin, 
  Sun, 
  Moon, 
  CloudSun, 
  Sunset, 
  Clock, 
  BookOpen, 
  RotateCcw, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  LayoutGrid, 
  Compass, 
  Heart, 
  ShieldCheck, 
  BookMarked, 
  Calendar, 
  Share2, 
  Copy, 
  Maximize2, 
  ZoomIn,
  Globe, 
  ExternalLink, 
  QrCode, 
  Check, 
  Library, 
  Wrench,
  HeartHandshake,
  ScrollText,
  Mic,
  MicOff,
  Headphones,
  Brain,
  BookmarkCheck,
  CircleDot,
  Award,
  Tent,
  Star,
  CheckSquare,
  Calculator,
  CalendarDays,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
  HelpCircle,
  Lightbulb,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeEditModeStyles } from '../../utils/themeEditStyles';
import { useSeenPages, markPageAsSeen } from '../../utils/badgeManager';
import { usePrayerTimes, computeTimesSync } from '../../context/PrayerTimesContext';
import { useVoiceControl } from '../../context/VoiceControlContext';
import { useHabitTracker } from '../../hooks/useHabitTracker';
import { prayerNamesAr } from '../../data/prayerTimesData';
import { PRAYER_NAMES_EN, getLocalizedLocationName } from '../../utils/prayerTimesTranslations';
import { checkSupportsDST, applyOffset } from '../../utils/prayerTimesUtils';
import { SURAH_NAMES_AR, SURAH_NAMES_EN, toArabic, JUZ_MAP } from '../QuranReader/constants';
import { quranData as quranJsonData } from '../../utils/quranData';
import { loadQuranEnglishTranslation, getCachedQuranEnglishTranslation, QuranEnglishSurah } from '../../utils/quranTranslationHelper';
import ShareAppQrModal from './ShareAppQrModal';
import TawafCounterCard from './TawafCounterCard';
import { getTawafCounterState, subscribeTawafCounter, TawafCounterState } from '../../utils/tawafCounterStorage';
import SmartSeasonalStrip from './SmartSeasonalStrip';
import UnifiedEventZoomModal from './UnifiedEventZoomModal';
import { ISLAMIC_WISDOMS, getWisdomOfTheDay } from '../../data/wisdomData';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { useFavoriteApps, recordAppVisit } from '../../utils/favoriteAppsManager';
import { getActiveWirdProfile, getWirdDayRange, getWirdTotalDays, WirdProfile } from '../../utils/dailyWirdNotificationService';
import { getAccurateHijriDate, HIJRI_MONTHS_AR, HIJRI_MONTHS_EN } from '../../utils/islamicOccasionsEngine';
import { Capacitor } from '@capacitor/core';
import { Share as CapacitorShare } from '@capacitor/share';
import { Preferences } from '@capacitor/preferences';
import moment from 'moment-hijri';

const getJuzForAyah = (s: number, a: number): number => {
  for (let i = JUZ_MAP.length - 1; i >= 0; i--) {
    const j = JUZ_MAP[i];
    if (s > j.s || (s === j.s && a >= j.a)) {
      return j.j;
    }
  }
  return 1;
};

export type ModernCardId = 
  | 'quran'
  | 'prayer'
  | 'seasonal'
  | 'adhkar'
  | 'search'
  | 'apps'
  | 'tracker'
  | 'tawaf'
  | 'reflections'
  | 'share';

export const DEFAULT_MODERN_CARD_ORDER: ModernCardId[] = [
  'quran',
  'seasonal',
  'prayer',
  'adhkar',
  'search',
  'apps',
  'tracker',
  'tawaf',
  'reflections',
  'share'
];

export const MODERN_CARD_TITLES: Record<ModernCardId, { ar: string; en: string }> = {
  quran: { ar: 'متابعة تلاوة المصحف', en: 'Quran Recitation' },
  prayer: { ar: 'مواقيت الصلاة والقبلة', en: 'Prayer Times & Qibla' },
  seasonal: { ar: 'الشريط الموسمي الذكي', en: 'Seasonal Strip' },
  adhkar: { ar: 'الأذكار اليومية والوصول السريع', en: 'Daily Adhkar & Quick Apps' },
  search: { ar: 'البحث والتطبيقات المفضلة', en: 'Search & Favorite Apps' },
  apps: { ar: 'التطبيقات والخدمات الإسلامية', en: 'Islamic Apps Drawer' },
  tracker: { ar: 'مربي الصلوات الخمس والورد', en: 'Prayers & Wird Tracker' },
  tawaf: { ar: 'عداد الطواف والسعي', en: 'Tawaf & Sa\'i Counter' },
  reflections: { ar: 'إشراقات وذاكرة اليوم', en: 'Reflections & Daily Memory' },
  share: { ar: 'مشاركة التطبيق والدعم الفني', en: 'Share & Tech Support' },
};

interface ModernHomeViewProps {
  onNavigate: (pageId: string, params?: any) => void;
  theme: any;
  themeKey: string;
  isBlackTheme: boolean;
  setToastMessage: (msg: string) => void;
  onThisDayEvent: any;
  handleNextEvent?: (e?: any) => void;
  handleShareHighlight?: (e?: any) => void | Promise<void>;
  handleCopyHighlight?: (e?: any) => void | Promise<void>;
  setShowExpandedEventsModal: (show: boolean) => void;
  currentHistoryMemoryEvent: any;
  handleNextHistoryMemoryEvent?: (e?: any) => void | Promise<void>;
  handleShareHistoryMemory?: (e?: any) => void | Promise<void>;
  handleCopyHistoryMemory?: (e?: any) => void | Promise<void>;
  setShowExpandedHistoryMemoryModal: (show: boolean) => void;
  upcomingEvents: any[];
  eventIndex: number;
  setEventIndex: React.Dispatch<React.SetStateAction<number>>;
  handleShareUpcomingEvent?: (e?: any) => void | Promise<void>;
  handleCopyUpcomingEvent?: (e?: any) => void | Promise<void>;
  setShowExpandedUpcomingEventModal: (show: boolean) => void;
  shareTextAr?: string;
  shareTextEn?: string;
  isEditMode?: boolean;
  setIsEditMode?: (mode: boolean) => void;
  onOpenGuide?: () => void;
  onToggleNightMode?: () => void;
}

const WEB_APP_URL = 'https://mushaf-ahmed-laila.vercel.app/';

const get3DIconForService = (id: string): string => {
  switch (id) {
    case 'quran':
      return '/assets/3d_icons/icon_quran.png';
    case 'quran-landscape':
      return '/assets/3d_icons/icon_quran_landscape.png';
    case 'listen':
      return '/assets/3d_icons/icon_listen.png';
    case 'memorization':
      return '/assets/3d_icons/icon_memorization.png';
    case 'daily-wird':
      return '/assets/3d_icons/icon_daily_wird.png';
    case 'prayer-times':
      return '/assets/3d_icons/icon_prayer_times.png';
    case 'salah-adhkar':
      return '/assets/3d_icons/icon_salah_adhkar.png';
    case 'qibla':
      return '/assets/3d_icons/icon_qibla.png';
    case 'sabah-masaa':
      return '/assets/3d_icons/icon_sabah_masaa.png';
    case 'adia':
      return '/assets/3d_icons/icon_adia.png';
    case 'tasbeeh':
      return '/assets/3d_icons/icon_tasbeeh.png';
    case 'others':
      return '/assets/3d_icons/icon_ruqyah.png';
    case 'prophetic-seerah':
      return '/assets/3d_icons/icon_seerah.png';
    case 'ten-promised':
      return '/assets/3d_icons/icon_ten_promised.png';
    case 'divine-miracles':
      return '/assets/3d_icons/icon_tajweed.png';
    case 'hisn-muslim':
      return '/assets/3d_icons/icon_hisn.png';
    case 'hajj-umrah':
      return '/assets/3d_icons/icon_hajj_umrah.png';
    case 'asmaul-husna':
      return '/assets/3d_icons/icon_asmaul_husna.png';
    case 'habit-tracker':
      return '/assets/3d_icons/icon_habit_tracker.png';
    case 'calculators':
      return '/assets/3d_icons/icon_calculators.png';
    case 'nawawi':
      return '/assets/3d_icons/icon_nawawi.png';
    case 'calendar':
      return '/assets/3d_icons/icon_calendar.png';
    case 'islamic-sites':
      return '/assets/3d_icons/icon_islamic_sites.png';
    case 'voice-control':
      return '/assets/3d_icons/icon_voice_control.png';
    case 'tajweed':
      return '/assets/3d_icons/icon_tajweed.png';
    default:
      return '/assets/3d_icons/icon_more.png';
  }
};

interface AyahTickerBarProps {
  text: string;
  ayahNum: number;
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  formatNumber: (n: number | string) => string;
  onNavigate?: () => void;
}

const AyahTickerBar: React.FC<AyahTickerBarProps> = ({
  text,
  ayahNum,
  isEn,
  isNightMode,
  isBlackTheme,
  formatNumber,
  onNavigate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const singleItemRef = useRef<HTMLSpanElement>(null);
  const [singleWidth, setSingleWidth] = useState(0);

  const ayahLabel = isEn
    ? `(Verse ${ayahNum})`
    : `(آية ${formatNumber(ayahNum)})`;

  const displayText = `${ayahLabel} ${text}`;

  useEffect(() => {
    const measure = () => {
      if (singleItemRef.current) {
        const w = singleItemRef.current.getBoundingClientRect().width;
        if (w > 0) {
          setSingleWidth(w);
        }
      }
    };

    measure();
    const handleResize = () => measure();
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => measure());
    if (singleItemRef.current) resizeObserver.observe(singleItemRef.current);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [displayText, isEn]);

  // Gap between repetitions: 28px (~ 1-2 words space)
  const GAP_PX = 28;
  const stepWidth = singleWidth > 0 ? singleWidth + GAP_PX : 400;

  // Reading speed: 28 pixels per second for smooth, legible Quranic reading
  const SPEED_PX_PER_SEC = 28;
  const duration = Math.max(3, stepWidth / SPEED_PX_PER_SEC);

  // Arabic text moves Left -> Right, English text moves Right -> Left
  const xAnimation = !isEn ? [-stepWidth, 0] : [0, -stepWidth];

  return (
    <div
      ref={containerRef}
      onClick={onNavigate}
      className="w-full overflow-hidden relative py-1.5 px-2.5 rounded-xl mt-2.5 flex items-center cursor-pointer select-none group"
      style={{
        background: (isNightMode || isBlackTheme)
          ? 'linear-gradient(180deg, #1c1a24 0%, #131218 100%)'
          : 'linear-gradient(180deg, rgba(254, 249, 195, 0.7) 0%, rgba(253, 230, 138, 0.85) 100%)',
        border: (isNightMode || isBlackTheme)
          ? '1px solid rgba(245, 158, 11, 0.35)'
          : '1px solid rgba(217, 119, 6, 0.35)',
        boxShadow: (isNightMode || isBlackTheme)
          ? 'inset 0 1px 2px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.4)'
          : 'inset 0 1px 2px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(180, 115, 20, 0.1)',
      }}
      dir="ltr"
    >
      <motion.div
        key={`ayah-ticker-loop-${displayText}-${isEn}-${stepWidth}`}
        className="flex items-center whitespace-nowrap shrink-0"
        style={{ gap: `${GAP_PX}px` }}
        animate={{ x: xAnimation }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        {/* Render 4 copies to ensure a seamless continuous stream without empty gaps */}
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            ref={idx === 0 ? singleItemRef : undefined}
            className="whitespace-nowrap font-bold text-xs sm:text-sm tracking-wide inline-flex items-center shrink-0"
            style={{
              color: (isNightMode || isBlackTheme) ? '#FBBF24' : '#451A03',
              fontFamily: isEn ? "'Cairo', sans-serif" : "'Amiri', 'Cairo', serif",
              textShadow: (isNightMode || isBlackTheme)
                ? '0 1px 3px rgba(0,0,0,0.9)'
                : '0 1px 1px rgba(255, 255, 255, 0.8)',
            }}
          >
            {displayText}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export const ModernHomeView: React.FC<ModernHomeViewProps> = ({
  onNavigate,
  theme,
  themeKey,
  isBlackTheme,
  setToastMessage,
  onThisDayEvent,
  handleNextEvent,
  handleShareHighlight,
  handleCopyHighlight,
  setShowExpandedEventsModal,
  currentHistoryMemoryEvent,
  handleNextHistoryMemoryEvent,
  handleShareHistoryMemory,
  handleCopyHistoryMemory,
  setShowExpandedHistoryMemoryModal,
  upcomingEvents,
  eventIndex,
  setEventIndex,
  handleShareUpcomingEvent,
  handleCopyUpcomingEvent,
  setShowExpandedUpcomingEventModal,
  shareTextAr,
  shareTextEn,
  isEditMode = false,
  setIsEditMode,
  onOpenGuide,
  onToggleNightMode
}) => {
  const { language, isRTL, dir, t, formatNumber } = useLanguage();
  const { isNightMode, toggleNightMode, homeThemeVariant } = useTheme();
  const isEn = language === 'en';

  const isSkyTheme = !isNightMode && homeThemeVariant === 'sky';
  const isEmeraldTheme = !isNightMode && homeThemeVariant === 'emerald';
  const isBurgundyTheme = !isNightMode && homeThemeVariant === 'burgundy';

  const voiceIconColor = isNightMode 
    ? '#F59E0B' 
    : (isBurgundyTheme
        ? '#9f1239'
        : (isSkyTheme 
            ? '#0369a1' 
            : (isEmeraldTheme 
                ? '#047857' 
                : '#C25E00')));

  const voicePingColor = isNightMode 
    ? '#FBBF24' 
    : (isBurgundyTheme
        ? '#fb7185'
        : (isSkyTheme 
            ? '#38BDF8' 
            : (isEmeraldTheme 
                ? '#34D399' 
                : '#F59E0B')));

  // حالة عداد الطواف والسعي للتأكد من ظهوره أو إخفائه بدقة في الصفحة والترتيب
  const [tawafState, setTawafState] = useState<TawafCounterState>(() => getTawafCounterState());
  useEffect(() => {
    return subscribeTawafCounter((updated) => {
      setTawafState(updated);
    });
  }, []);

  const [cardsOrder, setCardsOrder] = useState<ModernCardId[]>(() => {
    try {
      const savedVersion = localStorage.getItem('modern_cards_order_version_v2');
      if (savedVersion !== 'v2026_seasonal_after_quran') {
        localStorage.setItem('modern_cards_order_version_v2', 'v2026_seasonal_after_quran');
        localStorage.setItem('modern_home_cards_order_v1', JSON.stringify(DEFAULT_MODERN_CARD_ORDER));
        Preferences.set({ key: 'modern_home_cards_order_v1', value: JSON.stringify(DEFAULT_MODERN_CARD_ORDER) }).catch(() => {});
        return DEFAULT_MODERN_CARD_ORDER;
      }
      const saved = localStorage.getItem('modern_home_cards_order_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = DEFAULT_MODERN_CARD_ORDER.filter(id => parsed.includes(id));
          const missing = DEFAULT_MODERN_CARD_ORDER.filter(id => !parsed.includes(id));
          return [...valid, ...missing];
        }
      }
    } catch {}
    return DEFAULT_MODERN_CARD_ORDER;
  });

  const saveCardsOrder = useCallback((orderToSave?: ModernCardId[]) => {
    const target = orderToSave || cardsOrder;
    try {
      localStorage.setItem('modern_home_cards_order_v1', JSON.stringify(target));
    } catch {}
    Preferences.set({ key: 'modern_home_cards_order_v1', value: JSON.stringify(target) }).catch(() => {});
  }, [cardsOrder]);

  const handleResetCardsOrder = useCallback(() => {
    setCardsOrder(DEFAULT_MODERN_CARD_ORDER);
    saveCardsOrder(DEFAULT_MODERN_CARD_ORDER);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(40); } catch {}
    }
    setToastMessage?.(isEn ? 'Restored default card order ✓' : 'تمت استعادة الترتيب الافتراضي للبطاقات ✓');
  }, [saveCardsOrder, isEn, setToastMessage]);

  const handleMoveCard = useCallback((cardId: ModernCardId, direction: 'up' | 'down') => {
    setCardsOrder(prevOrder => {
      const index = prevOrder.indexOf(cardId);
      if (index === -1) return prevOrder;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prevOrder.length) return prevOrder;

      const newOrder = [...prevOrder];
      const [moved] = newOrder.splice(index, 1);
      newOrder.splice(targetIndex, 0, moved);

      saveCardsOrder(newOrder);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(25); } catch {}
      }

      return newOrder;
    });
  }, [saveCardsOrder]);

  useEffect(() => {
    const handleSaveLayoutEvent = () => {
      saveCardsOrder();
    };
    const handleResetLayoutEvent = () => {
      handleResetCardsOrder();
    };
    window.addEventListener('save-home-cards-layout', handleSaveLayoutEvent);
    window.addEventListener('reset-home-cards-layout', handleResetLayoutEvent);
    return () => {
      window.removeEventListener('save-home-cards-layout', handleSaveLayoutEvent);
      window.removeEventListener('reset-home-cards-layout', handleResetLayoutEvent);
    };
  }, [saveCardsOrder, handleResetCardsOrder]);
  const { times, config, refreshLocation } = usePrayerTimes();
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  const handleRefreshLocation = async (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (isRefreshingLocation) return;
    setIsRefreshingLocation(true);
    setToastMessage?.(isEn ? 'Updating location... 📍' : 'جاري تحديث الموقع تلقائياً... 📍');
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(30); } catch {}
      }
      await refreshLocation?.(true);
      setToastMessage?.(isEn ? 'Location updated successfully 📍' : 'تم تحديث الموقع بنجاح 📍');
    } catch {
      setToastMessage?.(isEn ? 'Failed to update location' : 'تعذر تحديث الموقع');
    } finally {
      setIsRefreshingLocation(false);
    }
  };
  const { records, toggleHabit, getDailyProgress } = useHabitTracker();
  const { isEnabled, toggleEnabled } = useVoiceControl();
  const { isPageSeen } = useSeenPages();

  // Active category tab for "درج الخدمات الذكي"
  const [activeTab, setActiveTabState] = useState<'all' | 'library' | 'worship' | 'tools'>(() => {
    try {
      const saved = localStorage.getItem('modern_home_active_apps_tab');
      if (saved && ['all', 'library', 'worship', 'tools'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'library';
  });

  const setActiveTab = useCallback((tab: 'all' | 'library' | 'worship' | 'tools') => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('modern_home_active_apps_tab', tab);
    } catch {}
  }, []);

  const [isAppsExpanded, setIsAppsExpandedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('modern_home_apps_expanded');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const setIsAppsExpanded = useCallback((expanded: boolean | ((prev: boolean) => boolean)) => {
    setIsAppsExpandedState(prev => {
      const nextVal = typeof expanded === 'function' ? expanded(prev) : expanded;
      try {
        localStorage.setItem('modern_home_apps_expanded', String(nextVal));
      } catch {}
      return nextVal;
    });
  }, []);

  // Active tab for "إشراقات وذاكرة اليوم"
  // 'event' | 'memory' | 'occasions' | 'wisdom'
  const [activeEventTab, setActiveEventTabState] = useState<'event' | 'memory' | 'occasions' | 'wisdom'>(() => {
    try {
      const saved = localStorage.getItem('modern_home_active_event_tab');
      if (saved && ['event', 'memory', 'occasions', 'wisdom'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'occasions';
  });

  const setActiveEventTab = useCallback((tab: 'event' | 'memory' | 'occasions' | 'wisdom') => {
    setActiveEventTabState(tab);
    try {
      localStorage.setItem('modern_home_active_event_tab', tab);
    } catch {}
  }, []);

  // Wisdom of the Day state
  const [wisdomIndex, setWisdomIndex] = useState<number>(() => {
    const todayWisdom = getWisdomOfTheDay();
    const idx = ISLAMIC_WISDOMS.findIndex(w => w.id === todayWisdom.id);
    return idx >= 0 ? idx : 0;
  });
  const [showWisdomZoomModal, setShowWisdomZoomModal] = useState<boolean>(false);
  const currentWisdom = ISLAMIC_WISDOMS[wisdomIndex] || ISLAMIC_WISDOMS[0];

  // QR Modal for App Share
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedWebLink, setCopiedWebLink] = useState(false);

  const [activeBottomCardTab, setActiveBottomCardTabState] = useState<'share' | 'browse' | 'support'>(() => {
    try {
      const saved = localStorage.getItem('modern_home_active_bottom_card_tab');
      if (saved && ['share', 'browse', 'support'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'share';
  });

  const setActiveBottomCardTab = useCallback((tab: 'share' | 'browse' | 'support') => {
    setActiveBottomCardTabState(tab);
    try {
      localStorage.setItem('modern_home_active_bottom_card_tab', tab);
    } catch {}
  }, []);

  useEffect(() => {
    if (!showQrModal) return;
    const unregister = registerBackInterceptor(() => {
      setShowQrModal(false);
      return true;
    });
    return unregister;
  }, [showQrModal]);

  // Live timer for countdown
  const [nowDate, setNowDate] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      const cityTimezone = typeof localStorage !== 'undefined' ? localStorage.getItem('grandLocationTimezone') : null;
      let current = new Date();
      if (cityTimezone) {
        try {
          const cityTimeStr = current.toLocaleString('en-US', { timeZone: cityTimezone });
          current = new Date(cityTimeStr);
        } catch {}
      }
      setNowDate(current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Today string for habits
  const todayStr = useMemo(() => moment().format('YYYY-MM-DD'), []);
  const todayHabits = records[todayStr] || {
    prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
  };

  const completedPrayersCount = [
    todayHabits.prayers?.fajr,
    todayHabits.prayers?.dhuhr,
    todayHabits.prayers?.asr,
    todayHabits.prayers?.maghrib,
    todayHabits.prayers?.isha
  ].filter(Boolean).length;

  const prayersPercentage = Math.round((completedPrayersCount / 5) * 100);
  const totalDailyProgress = getDailyProgress ? getDailyProgress(todayStr) : prayersPercentage;

  // التاريخ الهجري لليوم (عربي / إنجليزي) للبطاقة الأولى عبر محرك أم القرى الموحّد
  const todayHijriDisplay = useMemo(() => {
    const { day, month, year } = getAccurateHijriDate(nowDate);
    return isEn
      ? `${day} ${HIJRI_MONTHS_EN[month - 1] || ''} ${year} AH`
      : `${formatNumber(day)} ${HIJRI_MONTHS_AR[month - 1] || ''} ${formatNumber(year)} هـ`;
  }, [nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), isEn, formatNumber]);

  // حالة تقدم الورد القرآني اليومي لبطاقة مربي الصلوات الخمس
  const [activeWird, setActiveWird] = useState<WirdProfile | null>(() => getActiveWirdProfile());

  useEffect(() => {
    const syncWird = () => {
      setActiveWird(getActiveWirdProfile());
    };
    syncWird();
    window.addEventListener('storage', syncWird);
    window.addEventListener('focus', syncWird);
    return () => {
      window.removeEventListener('storage', syncWird);
      window.removeEventListener('focus', syncWird);
    };
  }, []);

  const dailyWirdStatus = useMemo(() => {
    if (!activeWird) {
      return {
        isDone: false,
        hasPlan: false,
        prefix: isEn ? "Today's Wird:" : 'ورد اليوم:',
        highlight: isEn ? 'Start plan' : 'ابدأ ختمتك'
      };
    }

    const totalDays = getWirdTotalDays(activeWird);
    const todayIsoLocal = moment(nowDate).format('YYYY-MM-DD');
    const todayIsoUtc = new Date().toISOString().split('T')[0];
    const isKhatmaCompleted = (activeWird.completedDays?.length || 0) >= totalDays;
    const isTodayCompleted =
      isKhatmaCompleted ||
      Boolean(activeWird.completedDays?.includes(activeWird.currentDay)) ||
      Boolean(
        activeWird.lastCompletedDate &&
          (activeWird.lastCompletedDate.startsWith(todayIsoLocal) ||
            activeWird.lastCompletedDate.startsWith(todayIsoUtc))
      );

    if (isTodayCompleted) {
      return {
        isDone: true,
        hasPlan: true,
        prefix: '',
        highlight: isEn ? "Today's Wird completed ✓" : 'تم إنجاز ورد اليوم ✓'
      };
    }

    const range = getWirdDayRange(activeWird.currentDay || 1, activeWird);
    const totalDayPages = Math.max(1, range.end - range.start + 1);
    let remainingPages = totalDayPages;

    if (activeWird.lastPage && activeWird.lastPage > range.start && activeWird.lastPage <= range.end) {
      remainingPages = Math.max(1, range.end - activeWird.lastPage + 1);
    } else if (activeWird.lastPage && activeWird.lastPage > range.end) {
      remainingPages = 1;
    }

    let arPagesText = '';
    if (remainingPages === 1) {
      arPagesText = 'متبقي صفحة واحدة';
    } else if (remainingPages === 2) {
      arPagesText = 'متبقي صفحتان';
    } else if (remainingPages >= 3 && remainingPages <= 10) {
      arPagesText = `متبقي ${formatNumber(remainingPages)} صفحات`;
    } else {
      arPagesText = `متبقي ${formatNumber(remainingPages)} صفحة`;
    }

    return {
      isDone: false,
      hasPlan: true,
      prefix: isEn ? "Today's Wird:" : 'ورد اليوم:',
      highlight: isEn
        ? `${remainingPages} ${remainingPages === 1 ? 'page' : 'pages'} left`
        : arPagesText
    };
  }, [activeWird, nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), isEn, formatNumber]);

  // English Quran Translation Data State
  const [enQuranData, setEnQuranData] = useState<QuranEnglishSurah[] | null>(() => getCachedQuranEnglishTranslation());

  useEffect(() => {
    if (isEn && !enQuranData) {
      loadQuranEnglishTranslation().then(data => {
        if (data && data.length > 0) {
          setEnQuranData(data);
        }
      });
    }
  }, [isEn, enQuranData]);

  // Last read Quran info (مع مراعاة الموضع المستقل لصفحة الترجمة بالإنجليزية)
  const [lastReadQuran, setLastReadQuran] = useState<{ surah: number; surahName: string; ayah: number; page: number; juz: number }>({
    surah: 1,
    surahName: isEn ? 'Surah Al-Fatihah' : 'سورة الفاتحة',
    ayah: 1,
    page: 1,
    juz: 1
  });

  useEffect(() => {
    const loadLastRead = () => {
      try {
        let savedGlobal: string | null = null;
        if (isEn) {
          // Reading position from Translation mode
          savedGlobal = localStorage.getItem('last_read_pos_translation') 
                     || localStorage.getItem('last_pos_translation_v') 
                     || localStorage.getItem('last_pos_translation_h')
                     || localStorage.getItem('last_read_ayah_global') 
                     || localStorage.getItem('last_read_pos_mushaf');
        } else {
          // Reading position from Arabic Mushaf mode
          savedGlobal = localStorage.getItem('last_read_pos_mushaf') 
                     || localStorage.getItem('last_read_ayah_global') 
                     || localStorage.getItem('last_pos_mushaf_v') 
                     || localStorage.getItem('last_pos_mushaf_h');
        }

        if (savedGlobal) {
          const parsed = JSON.parse(savedGlobal);
          if (parsed && parsed.s && parsed.a) {
            const s = Number(parsed.s);
            const a = Number(parsed.a);
            const sName = isEn 
              ? (SURAH_NAMES_EN[s - 1] ? `Surah ${SURAH_NAMES_EN[s - 1]}` : `Surah ${s}`)
              : (SURAH_NAMES_AR[s - 1] ? `سورة ${SURAH_NAMES_AR[s - 1]}` : 'سورة الفاتحة');
            
            let pageNum = parsed.page;
            let juzNum = parsed.juz;
            if (!pageNum || !juzNum || (pageNum === 1 && s > 1)) {
              const surah = quranJsonData?.surahs?.[s - 1];
              const ayahObj = surah?.ayahs?.[a - 1];
              if (ayahObj) {
                pageNum = ayahObj.page;
                juzNum = ayahObj.juz;
              }
            }
            if (!juzNum) {
              juzNum = getJuzForAyah(s, a);
            }

            setLastReadQuran({
              surah: s,
              surahName: sName,
              ayah: a,
              page: pageNum || 1,
              juz: juzNum || 1
            });
          }
        } else {
          setLastReadQuran({
            surah: 1,
            surahName: isEn ? 'Surah Al-Fatihah' : 'سورة الفاتحة',
            ayah: 1,
            page: 1,
            juz: 1
          });
        }
      } catch {}
    };

    loadLastRead();
    window.addEventListener('storage', loadLastRead);
    window.addEventListener('last_read_update', loadLastRead);
    return () => {
      window.removeEventListener('storage', loadLastRead);
      window.removeEventListener('last_read_update', loadLastRead);
    };
  }, [isEn]);

  // Ayah Text for the ticker bar in Holy Quran card (الترجمة الإنجليزية عند وضع اللغة الإنجليزية)
  const currentAyahText = useMemo(() => {
    if (!lastReadQuran.surah || !lastReadQuran.ayah) {
      return isEn 
        ? 'In the name of Allah, the Entirely Merciful, the Especially Merciful' 
        : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    }

    if (isEn) {
      if (enQuranData && enQuranData.length >= lastReadQuran.surah) {
        const enSurah = enQuranData[lastReadQuran.surah - 1];
        const enVerse = enSurah?.verses?.[lastReadQuran.ayah - 1];
        if (enVerse?.translation) {
          return enVerse.translation;
        }
      }
    }

    const surahObj = quranJsonData?.surahs?.[lastReadQuran.surah - 1];
    const ayahObj = surahObj?.ayahs?.[lastReadQuran.ayah - 1];
    return ayahObj?.text || (isEn ? 'In the name of Allah, the Entirely Merciful, the Especially Merciful' : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
  }, [lastReadQuran.surah, lastReadQuran.ayah, isEn, enQuranData]);

  // Prayer Calculation logic
  const getPrayerDateTime = (key: string, baseDate: Date) => {
    let rawTime = times?.[key];
    if (!rawTime || rawTime.includes('--')) {
      const fallbackComputed = computeTimesSync(config.location, baseDate, isEn);
      if (fallbackComputed?.timings && (fallbackComputed.timings as any)[key]) {
        rawTime = (fallbackComputed.timings as any)[key];
      }
    }
    if (!rawTime || rawTime.includes('--')) return null;

    const supportsDST = checkSupportsDST(config.location?.combinedCode, config.location?.fullCountry);
    const isSummerTimeActive = config.isSummerTime && supportsDST;
    const totalOffset = (config.prayerOffsets?.[key] || 0) + (isSummerTimeActive ? 60 : 0);
    const adjustedTime = applyOffset(rawTime, totalOffset);
    if (!adjustedTime || adjustedTime.includes('--')) return null;
    const [hours, minutes] = adjustedTime.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime12 = (date: Date | null) => {
    if (!date) return '--:--';
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const isPM = h >= 12;
    h = h % 12 || 12;
    const hStr = h.toString().padStart(2, '0');
    if (isEn) {
      return `${hStr}:${m} ${isPM ? 'PM' : 'AM'}`;
    }
    return `${hStr}:${m} ${isPM ? 'م' : 'ص'}`;
  };

  const prayerCalc = () => {
    const today = new Date(nowDate);
    let fajrToday = getPrayerDateTime('Fajr', today);
    let dhuhrToday = getPrayerDateTime('Dhuhr', today);
    let asrToday = getPrayerDateTime('Asr', today);
    let maghribToday = getPrayerDateTime('Maghrib', today);
    let ishaToday = getPrayerDateTime('Isha', today);

    // If any prayer is still null, calculate immediately from coordinates using computeTimesSync
    if (!fajrToday || !dhuhrToday || !asrToday || !maghribToday || !ishaToday) {
      const fallbackLoc = config.location?.lat ? config.location : { lat: 21.4225, lng: 39.8262, city: 'Makkah', cityNameAr: 'مكة المكرمة' };
      const computed = computeTimesSync(fallbackLoc, today, isEn);
      if (computed?.timings) {
        const parsePrayerTime = (timeStr: string) => {
          const [h, m] = timeStr.split(':').map(Number);
          const d = new Date(today);
          d.setHours(h, m, 0, 0);
          return d;
        };
        fajrToday = parsePrayerTime(computed.timings.Fajr);
        dhuhrToday = parsePrayerTime(computed.timings.Dhuhr);
        asrToday = parsePrayerTime(computed.timings.Asr);
        maghribToday = parsePrayerTime(computed.timings.Maghrib);
        ishaToday = parsePrayerTime(computed.timings.Isha);
      }
    }

    const rawCityName = isEn 
      ? ((config.location as any)?.cityGovEn || (config.location as any)?.city || config.location?.cityGov || 'Current Location') 
      : ((config.location as any)?.cityGovAr || (config.location as any)?.cityNameAr || (config.location as any)?.city || config.location?.cityGov || 'موقعي الحالي');
    const cityName = getLocalizedLocationName(rawCityName, isEn ? 'en' : 'ar');

    if (!fajrToday || !dhuhrToday || !asrToday || !maghribToday || !ishaToday) {
      return {
        nextKey: 'dhuhr' as const,
        nextName: isEn ? 'Dhuhr' : 'الظهر',
        nextTimeStr: '--:--',
        prevName: isEn ? 'Fajr' : 'الفجر',
        prevTimeStr: '--:--',
        countdownStr: '--:--:--',
        progressPercent: 0,
        cityName
      };
    }

    let prevName = 'الفجر';
    let prevDate = fajrToday;
    let nextName = 'الظهر';
    let nextDate = dhuhrToday;
    let nextKey: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' = 'dhuhr';

    if (nowDate < fajrToday) {
      const ishaYesterday = new Date(ishaToday);
      ishaYesterday.setDate(ishaYesterday.getDate() - 1);
      prevName = isEn ? 'Isha' : 'العشاء';
      prevDate = ishaYesterday;
      nextName = isEn ? 'Fajr' : 'الفجر';
      nextDate = fajrToday;
      nextKey = 'fajr';
    } else if (nowDate >= fajrToday && nowDate < dhuhrToday) {
      prevName = isEn ? 'Fajr' : 'الفجر';
      prevDate = fajrToday;
      nextName = isEn ? 'Dhuhr' : 'الظهر';
      nextDate = dhuhrToday;
      nextKey = 'dhuhr';
    } else if (nowDate >= dhuhrToday && nowDate < asrToday) {
      prevName = isEn ? 'Dhuhr' : 'الظهر';
      prevDate = dhuhrToday;
      nextName = isEn ? 'Asr' : 'العصر';
      nextDate = asrToday;
      nextKey = 'asr';
    } else if (nowDate >= asrToday && nowDate < maghribToday) {
      prevName = isEn ? 'Asr' : 'العصر';
      prevDate = asrToday;
      nextName = isEn ? 'Maghrib' : 'المغرب';
      nextDate = maghribToday;
      nextKey = 'maghrib';
    } else if (nowDate >= maghribToday && nowDate < ishaToday) {
      prevName = isEn ? 'Maghrib' : 'المغرب';
      prevDate = maghribToday;
      nextName = isEn ? 'Isha' : 'العشاء';
      nextDate = ishaToday;
      nextKey = 'isha';
    } else {
      const fajrTomorrow = new Date(fajrToday);
      fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
      prevName = isEn ? 'Isha' : 'العشاء';
      prevDate = ishaToday;
      nextName = isEn ? 'Fajr' : 'الفجر';
      nextDate = fajrTomorrow;
      nextKey = 'fajr';
    }

    const totalDuration = nextDate.getTime() - prevDate.getTime();
    const elapsed = Math.max(0, nowDate.getTime() - prevDate.getTime());
    const progressPercent = totalDuration > 0
      ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
      : 0;

    const diffMs = Math.max(0, nextDate.getTime() - nowDate.getTime());
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    const s = Math.floor((diffMs % 60000) / 1000);
    const countdownStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    return {
      nextKey,
      nextName,
      nextTimeStr: formatTime12(nextDate),
      prevName,
      prevTimeStr: formatTime12(prevDate),
      countdownStr,
      progressPercent: Math.round(progressPercent),
      cityName
    };
  };

  const prayerData = prayerCalc();

  // Dynamic prayer themes for "الصلاة القادمة"
  const prayerVisual = useMemo(() => {
    switch (prayerData.nextKey) {
      case 'fajr':
        return {
          icon: Moon,
          badgeBg: 'golden-3d-inset text-amber-950 font-bold border-amber-300/80',
          textColor: 'text-[#451A03]',
          progressBar: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500',
          pinColor: 'text-amber-800',
        };
      case 'dhuhr':
        return {
          icon: Sun,
          badgeBg: 'golden-3d-inset text-amber-950 font-bold border-amber-300/80',
          textColor: 'text-[#451A03]',
          progressBar: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600',
          pinColor: 'text-amber-800',
        };
      case 'asr':
        return {
          icon: CloudSun,
          badgeBg: 'golden-3d-inset text-amber-950 font-bold border-amber-300/80',
          textColor: 'text-[#451A03]',
          progressBar: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600',
          pinColor: 'text-amber-800',
        };
      case 'maghrib':
        return {
          icon: Sunset,
          badgeBg: 'golden-3d-inset text-amber-950 font-bold border-amber-300/80',
          textColor: 'text-[#451A03]',
          progressBar: 'bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500',
          pinColor: 'text-amber-800',
        };
      case 'isha':
      default:
        return {
          icon: Moon,
          badgeBg: 'golden-3d-inset text-amber-950 font-bold border-amber-300/80',
          textColor: 'text-[#451A03]',
          progressBar: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600',
          pinColor: 'text-amber-800',
        };
    }
  }, [prayerData.nextKey]);
  const PrayerIcon = prayerVisual.icon;

  // Morning / Evening Athkar logic: morning/daytime is from 03:00 to 15:00, evening is from 15:00 onwards
  const currentHour = nowDate.getHours();
  const isMorning = currentHour >= 3 && currentHour < 15;

  // Toggle habit directly from the 5 prayers row
  const handleTogglePrayer = (e: React.MouseEvent, key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    e.stopPropagation();
    toggleHabit(todayStr, 'prayers', key);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // بطاقات التطبيقات مرتبة تماماً كما في التصميم الكلاسيكي (DEFAULT_MENU_ITEMS)
  const allServices = useMemo(() => [
    // --- القسم الأول: القرآن الكريم ---
    {
      id: 'quran',
      title: isEn ? 'Holy Quran' : 'القرآن الكريم',
      category: 'library',
      icon: BookOpen,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: false
    },
    {
      id: 'quran-landscape',
      title: isEn ? 'Landscape Reading' : 'القراءة العرضية',
      category: 'library',
      icon: Maximize2,
      circleBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800/40',
      isNew: false
    },
    {
      id: 'listen',
      title: isEn ? 'Listen to Quran' : 'الاستماع للقرآن',
      category: 'library',
      icon: Headphones,
      circleBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800/40',
      isNew: false
    },
    {
      id: 'memorization',
      title: isEn ? 'Quran Memorization' : 'التحفيظ',
      category: 'worship',
      icon: Brain,
      circleBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/40',
      isNew: false
    },
    {
      id: 'daily-wird',
      title: isEn ? 'Daily Quran Wird' : 'الورد اليومي',
      category: 'worship',
      icon: BookmarkCheck,
      circleBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
      isNew: false
    },

    // --- القسم الثاني: العبادات اليومية ---
    {
      id: 'prayer-times',
      title: isEn ? 'Prayer Times' : 'مواقيت الصلاة',
      category: 'worship',
      icon: Clock,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: false
    },
    {
      id: 'salah-adhkar',
      title: isEn ? 'Prayer Dhikr' : 'أذكار الصلاة',
      category: 'worship',
      icon: Sparkles,
      circleBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800/40',
      isNew: false
    },
    {
      id: 'qibla',
      title: isEn ? 'Compass' : 'البوصلة',
      category: 'worship',
      icon: Compass,
      circleBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/40',
      isNew: false
    },
    {
      id: 'sabah-masaa',
      title: isEn ? 'Adhkar' : 'الأذكار',
      category: 'worship',
      icon: Sun,
      circleBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
      isNew: false
    },
    {
      id: 'adia',
      title: isEn ? 'Supplications' : 'الأدعية',
      category: 'worship',
      icon: HeartHandshake,
      circleBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-800/40',
      isNew: false
    },
    {
      id: 'tasbeeh',
      title: isEn ? 'Tasbeeh' : 'التسبيح',
      category: 'worship',
      icon: CircleDot,
      circleBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800/40',
      isNew: false
    },
    {
      id: 'others',
      title: isEn ? 'Ruqyah Shariah' : 'الرقية الشرعية',
      category: 'worship',
      icon: ShieldCheck,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: !isPageSeen('others')
    },

    // --- القسم الثالث: المكتبة الإسلامية ---
    {
      id: 'prophetic-seerah',
      title: isEn ? 'Prophetic Seerah' : 'السيرة النبوية',
      category: 'library',
      icon: ScrollText,
      circleBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
      isNew: !isPageSeen('prophetic-seerah')
    },
    {
      id: 'ten-promised',
      title: isEn ? 'Ten Promised Paradise' : 'العشرة المبشرون',
      category: 'library',
      icon: Award,
      circleBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800/40',
      isNew: !isPageSeen('ten-promised')
    },
    {
      id: 'divine-miracles',
      title: isEn ? 'Divine Miracles' : 'المعجزات الإلهية',
      category: 'library',
      icon: Sparkles,
      circleBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
      isNew: !isPageSeen('divine-miracles')
    },
    {
      id: 'hisn-muslim',
      title: isEn ? 'Hisn Al-Muslim' : 'حصن المسلم',
      category: 'worship',
      icon: ShieldCheck,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: false
    },
    {
      id: 'hajj-umrah',
      title: isEn ? 'Hajj & Umrah' : 'الحج والعمرة',
      category: 'worship',
      icon: Tent,
      circleBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/40',
      isNew: false
    },
    {
      id: 'asmaul-husna',
      title: isEn ? 'Names of Allah' : 'أسماء الله الحسنى',
      category: 'library',
      icon: Star,
      circleBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/40',
      isNew: false
    },

    // --- القسم الرابع: خدمات إضافية وأدوات ---
    {
      id: 'habit-tracker',
      title: isEn ? 'Habit Tracker' : 'مربّي العبادات',
      category: 'worship',
      icon: CheckSquare,
      circleBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800/40',
      isNew: false
    },
    {
      id: 'calculators',
      title: isEn ? 'Islamic Calculators' : 'الحاسبة الشرعية',
      category: 'tools',
      icon: Calculator,
      circleBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      isNew: false
    },
    {
      id: 'nawawi',
      title: isEn ? 'An-Nawawi 40' : 'الأربعون النووية',
      category: 'library',
      icon: BookMarked,
      circleBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/40',
      isNew: false
    },
    {
      id: 'calendar',
      title: isEn ? 'Hijri Calendar' : 'التقويم',
      category: 'tools',
      icon: CalendarDays,
      circleBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800/40',
      isNew: false
    },
    {
      id: 'islamic-sites',
      title: isEn ? 'Islamic Sites' : 'مواقع إسلامية',
      category: 'tools',
      icon: Globe,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: !isPageSeen('islamic-sites')
    },

    // --- القسم الخامس: التحكم الصوتي ---
    {
      id: 'voice-control',
      title: isEn ? 'Voice Control' : 'التحكم الصوتي',
      category: 'tools',
      icon: Mic,
      circleBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/40',
      isNew: false
    }
  ], [isEn, isPageSeen]);

  // Filtered services according to tab
  const displayedServices = useMemo(() => {
    if (activeTab === 'all') return allServices;
    return allServices.filter(s => s.category === activeTab);
  }, [allServices, activeTab]);

  // أهم 10 تطبيقات يتم فتحها باستمرار: أول تطبيقين الأكثر استخداماً، ومن الثالث للعاشر أحدث التطبيقات المفتوحة
  const favoriteAppIds = useFavoriteApps(10);
  const favoriteServices = useMemo(() => {
    return favoriteAppIds
      .map(id => allServices.find(s => s.id === id))
      .filter((s): s is typeof allServices[0] => Boolean(s));
  }, [favoriteAppIds, allServices]);

  // تدرج التلاشي الجانبي الناعم لشريط «تطبيقاتك اليومية»
  const favScrollRef = useRef<HTMLDivElement | null>(null);
  const [favFadeState, setFavFadeState] = useState<{ left: boolean; right: boolean }>(() => ({
    left: isRTL,
    right: !isRTL
  }));

  const updateFavScrollFade = useCallback(() => {
    const el = favScrollRef.current;
    if (!el || el.children.length === 0) return;
    const cRect = el.getBoundingClientRect();
    const firstRect = el.firstElementChild?.getBoundingClientRect();
    const lastRect = el.lastElementChild?.getBoundingClientRect();
    if (!firstRect || !lastRect) return;

    const overflowLeft = firstRect.left < cRect.left - 4 || lastRect.left < cRect.left - 4;
    const overflowRight = firstRect.right > cRect.right + 4 || lastRect.right > cRect.right + 4;

    setFavFadeState(prev =>
      prev.left === overflowLeft && prev.right === overflowRight
        ? prev
        : { left: overflowLeft, right: overflowRight }
    );
  }, []);

  useEffect(() => {
    setFavFadeState({ left: isRTL, right: !isRTL });
    const raf = requestAnimationFrame(updateFavScrollFade);
    window.addEventListener('resize', updateFavScrollFade);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateFavScrollFade);
    };
  }, [isRTL, favoriteServices.length, updateFavScrollFade]);

  const favScrollMask = useMemo(() => {
    if (favFadeState.left && favFadeState.right) {
      return 'linear-gradient(to right, transparent 0px, black 28px, black calc(100% - 28px), transparent 100%)';
    }
    if (favFadeState.left) {
      return 'linear-gradient(to right, transparent 0px, black 32px, black 100%)';
    }
    if (favFadeState.right) {
      return 'linear-gradient(to left, transparent 0px, black 32px, black 100%)';
    }
    return 'none';
  }, [favFadeState.left, favFadeState.right]);

  // Web App Share and Copy handlers
  const handleCopyWebUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(WEB_APP_URL);
      setCopiedWebLink(true);
      setToastMessage(isEn ? 'Link copied to clipboard 📋' : 'تم نسخ الرابط بنجاح 📋');
      setTimeout(() => setCopiedWebLink(false), 2000);
    } catch {}
  };

  const handleShareWebUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: isEn ? 'Mushaf Ahmed & Laila Web App' : 'تطبيق مصحف أحمد و ليلى',
      text: isEn
        ? `To open the app on your browser or iPhone, tap the link:\n${WEB_APP_URL}`
        : `لمشاهدة التطبيق على المتصفح أو الآيفون اضغط على الرابط التالي:\n${WEB_APP_URL}`,
    };
    if (Capacitor.isNativePlatform()) {
      try {
        await CapacitorShare.share(shareData);
      } catch {
        handleCopyWebUrl(e);
      }
    } else if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyWebUrl(e);
      }
    } else {
      handleCopyWebUrl(e);
    }
  };

  // النص الأصلي للمشاركة والنسخ المطابق للبطاقة الأصلية في التصميم الكلاسيكي
  const textToShare = isEn 
    ? (shareTextEn || `Noble Quran Ahmed & Laila - Ad-free Islamic Application: ${WEB_APP_URL}`)
    : (shareTextAr || `تطبيق مصحف أحمد وليلى - صدقة جارية، شامل وخالٍ تماماً من الإعلانات:\n${WEB_APP_URL}`);

  const handleShareAppGeneral = async () => {
    const shareData = {
      title: isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد وليلى',
      text: textToShare,
    };
    if (Capacitor.isNativePlatform()) {
      try {
        await CapacitorShare.share(shareData);
      } catch {
        try {
          await navigator.clipboard.writeText(textToShare);
          setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة بنجاح'));
        } catch {}
      }
    } else if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(textToShare);
            setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة بنجاح'));
          } catch {}
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة بنجاح'));
      } catch {}
    }
  };

  const handleCopyShareAppText = async () => {
    try {
      await navigator.clipboard.writeText(textToShare);
      setCopiedShare(true);
      setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة بنجاح 📋'));
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      setToastMessage(t('common.failed_copy', 'فشل في النسخ'));
    }
  };

  // Current event display in "إشراقات وذاكرة اليوم"
  const currentOccasion = upcomingEvents?.[eventIndex] || null;

  const renderQuranCard = () => (
      /* 1. بطاقة القرآن الكريم ومتابعة التلاوة (Standalone Golden Quran Card) */
      <div 
        className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all flex flex-col gap-2.5"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
          <div 
            onClick={() => onNavigate('quran', { from: 'modern_home', surah: lastReadQuran.surah, ayah: lastReadQuran.ayah, page: lastReadQuran.page, ...(isEn ? { readingMode: 'translation' } : {}) })}
            className="flex flex-col justify-center min-w-0 flex-1 text-start cursor-pointer group"
          >
            <div className="flex items-center">
              <span className="card-header-title text-xs sm:text-sm font-black truncate group-hover:text-amber-900 transition-colors font-cairo" style={{ color: (isNightMode || isBlackTheme) ? '#F59E0B' : '#451A03' }}>
                {isEn ? 'Continue Quran Recitation' : 'تابع تلاوة المصحف'}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap whitespace-nowrap text-[11px] sm:text-xs font-black mt-1 min-w-0 font-cairo">
              <span className="truncate" style={{ color: (isNightMode || isBlackTheme) ? '#FFFFFF' : '#451A03' }}>
                {lastReadQuran.surahName} :
              </span>
              <span className="shrink-0" style={{ color: (isNightMode || isBlackTheme) ? '#FDE68A' : '#5B2605' }}>
                {isEn 
                  ? `( Ayah ${lastReadQuran.ayah} Juz ${lastReadQuran.juz} Page ${lastReadQuran.page} )`
                  : `( الآية ${formatNumber(lastReadQuran.ayah)} الجزء ${formatNumber(lastReadQuran.juz)} الصفحة ${formatNumber(lastReadQuran.page)} )`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('quran-landscape', { from: 'modern_home', surah: lastReadQuran.surah, ayah: lastReadQuran.ayah, page: lastReadQuran.page, ...(isEn ? { readingMode: 'translation' } : {}) })}
            className="px-6 py-1.5 rounded-full font-bold text-xs flex items-center justify-center shrink-0 active:scale-95 transition-all golden-3d-pill-btn cursor-pointer"
            title={isEn ? 'Landscape Reading' : 'تلاوة عرضية للمصحف'}
          >
            <span>{isEn ? 'Landscape' : 'عرضي'}</span>
          </button>
        </div>

        {/* الشريط المتحرك لعرض نص الآية الكريمة */}
        <AyahTickerBar
          text={currentAyahText}
          ayahNum={lastReadQuran.ayah}
          isEn={isEn}
          isNightMode={isNightMode}
          isBlackTheme={isBlackTheme}
          formatNumber={formatNumber}
          onNavigate={() => onNavigate('quran', { from: 'modern_home', surah: lastReadQuran.surah, ayah: lastReadQuran.ayah, page: lastReadQuran.page, ...(isEn ? { readingMode: 'translation' } : {}) })}
        />
      </div>
  );

  const renderPrayerCard = () => (
      /* 2. بطاقة مواقيت الصلاة والعد التنازلي والقبلة (Standalone Prayer Times Card) */
      <div 
        className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all"
      >
        {/* صف الموقع والتاريخ الهجري وزر القبلة الذكي */}
        <div className="flex items-center justify-between gap-2 w-full mb-3">
          <div className="flex items-start gap-1.5 min-w-0 max-w-[85%] text-start">
            <button
              type="button"
              onClick={handleRefreshLocation}
              disabled={isRefreshingLocation}
              className="gold-accent-icon inline-flex items-center justify-center shrink-0 mt-[1.5px] cursor-pointer bg-transparent border-none p-0 outline-none active:scale-95 transition-transform"
              title={isEn ? 'Click to refresh location automatically' : 'انقر لتحديث الموقع تلقائياً'}
              aria-label={isEn ? 'Refresh location' : 'تحديث الموقع'}
            >
              <MapPin className={`w-3.5 h-3.5 text-amber-800 shrink-0 ${isRefreshingLocation ? 'animate-bounce' : ''}`} />
            </button>

            <div className="flex flex-col items-start min-w-0">
              <button
                type="button"
                onClick={handleRefreshLocation}
                disabled={isRefreshingLocation}
                className="inline-flex items-center text-xs font-bold text-amber-950 hover:text-amber-800 active:scale-95 transition-all cursor-pointer bg-transparent border-none p-0 outline-none max-w-full leading-snug text-start"
                title={isEn ? 'Click to refresh location automatically' : 'انقر لتحديث الموقع تلقائياً'}
              >
                <span className="truncate">{prayerData.cityName}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="inline-flex items-center text-xs font-bold text-amber-900 hover:text-amber-950 active:scale-95 transition-all cursor-pointer bg-transparent border-none p-0 outline-none whitespace-nowrap leading-snug mt-3.5 gold-accent-text text-start"
                title={isEn ? 'Open Hijri Calendar' : 'فتح التقويم الهجري'}
              >
                {todayHijriDisplay}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('qibla')}
            className="p-1 sm:p-1.5 flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 active:scale-90 transition-all bg-transparent border-none outline-none"
            title={isEn ? 'Qibla Direction' : 'تحديد اتجاه القبلة'}
            aria-label={isEn ? 'Qibla Direction' : 'تحديد اتجاه القبلة'}
          >
            <Compass className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 text-amber-800 dark:text-amber-400 hover:text-amber-950 active:text-amber-700 transition-colors drop-shadow-[0_1px_2px_rgba(180,83,9,0.25)] stroke-[2.3]" />
          </button>
        </div>

        {/* العد التنازلي وموعد الأذان مع ذكر اسم الصلاة القادمة صراحةً */}
        <div 
          onClick={() => onNavigate('prayer-times')}
          className="flex items-end justify-between cursor-pointer py-1"
          title={isEn ? 'Click to open full Prayer Times' : 'انقر لعرض مواقيت الصلاة'}
        >
          <div className="flex flex-col text-start">
            <span className="text-[11px] font-semibold text-amber-900/85">
              {isEn ? (
                <>
                  Time to <span className="gold-accent-text font-extrabold">{prayerData.nextName}</span> Adhan
                </>
              ) : (
                <>
                  الوقت المتبقي لأذان <span className="gold-accent-text font-extrabold">{prayerData.nextName}</span>
                </>
              )}
            </span>
            <span className="text-3xl sm:text-4xl font-cairo font-black tracking-tight text-[#451A03] tabular-nums" style={{ textShadow: (isNightMode || isBlackTheme) ? 'none' : '0 1px 1px rgba(255,255,255,0.8)' }}>
              {prayerData.countdownStr}
            </span>
          </div>
          <div className="flex flex-col text-end">
            <span className="text-[11px] font-semibold text-amber-900/85">
              {isEn ? 'Adhan Time' : 'موعد الأذان'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#5B2605] tabular-nums">
              {prayerData.nextTimeStr}
            </span>
          </div>
        </div>

        {/* شريط التقدم */}
        <div 
          onClick={() => onNavigate('prayer-times')}
          className="w-full mt-3 cursor-pointer"
        >
          <div className={`w-full h-2.5 rounded-full p-0.5 overflow-hidden ${(isNightMode || isBlackTheme) ? 'bg-[#0e0e13] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.08)]' : 'bg-black/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]'}`}>
            <div 
              className={`h-full rounded-full shadow-sm transition-all duration-1000 ease-out ${
                isBurgundyTheme
                  ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950'
                  : isSkyTheme 
                    ? 'bg-gradient-to-r from-sky-800 via-sky-700 to-sky-900' 
                    : isEmeraldTheme 
                      ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900' 
                      : 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500'
              }`}
              style={{ width: `${prayerData.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold text-amber-900/95 mt-1.5 px-0.5 whitespace-nowrap">
            <span className="tabular-nums">{prayerData.prevName} {prayerData.prevTimeStr}</span>
            <span className="text-amber-950 font-extrabold tabular-nums gold-accent-text">{prayerData.progressPercent}%</span>
            <span className="tabular-nums">{prayerData.nextName} {prayerData.nextTimeStr}</span>
          </div>
        </div>
      </div>
  );

  const renderSeasonalCard = () => (
      <SmartSeasonalStrip
        layoutMode="modern"
        onNavigate={onNavigate}
      />
  );

  const renderAdhkarCard = () => (
      /* 2. بطاقة الأذكار اليومية مع قسم التطبيقات السريعة */
      <div 
        className="w-full golden-3d-card p-3.5 sm:p-4 select-none transition-all duration-300"
      >
        <div className="flex flex-col gap-2.5">
          {/* شريط الذكر الذكي (الأذكار اليومية) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex flex-col min-w-0 text-start">
                <span className="card-header-title text-xs sm:text-sm font-black truncate font-cairo text-[#451A03]">
                  {isEn ? 'Daily Adhkar' : 'الأذكار اليومية'}
                </span>
                <span className="text-[11px] font-medium truncate text-amber-900/85">
                  {isMorning 
                    ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح')
                    : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}
                </span>
              </div>
            </div>

            {/* زر الوصول المباشر: أذكار الصباح / المساء */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('adhkar_preferred_tab', isMorning ? 'morning' : 'evening');
                  } catch {}
                  recordAppVisit('sabah-masaa');
                  onNavigate('sabah-masaa');
                }}
                className="px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all golden-3d-pill-btn cursor-pointer"
                title={isMorning ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح') : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}
              >
                <span>{isMorning ? (isEn ? 'Morning' : 'أذكار الصباح') : (isEn ? 'Evening' : 'أذكار المساء')}</span>
                <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? '' : 'rotate-180'}`} />
              </button>
            </div>
          </div>

          {/* فاصل رفيع أنيق */}
          <div className={`w-full h-px my-0.5 ${(isNightMode || isBlackTheme) ? 'bg-white/[0.07]' : 'bg-amber-300/60'}`} />

          {/* أزرار الصفحات الخمس السريعة المنقولة من بطاقة البحث */}
          <div className="w-full white-3d-container-card p-1 sm:p-2">
            <div 
              className="grid grid-cols-5 gap-0.5 min-[360px]:gap-1 sm:gap-1.5 w-full items-start px-0.5"
              dir={dir}
            >
              {[
                {
                  id: 'salah-adhkar',
                  label: isEn ? 'Prayer Dhikr' : 'أذكار الصلاة',
                  img: '/assets/3d_icons/icon_salah_adhkar.png',
                  action: () => {
                    markPageAsSeen('salah-adhkar');
                    recordAppVisit('salah-adhkar');
                    onNavigate('salah-adhkar');
                  }
                },
                {
                  id: 'sabah-masaa',
                  label: isEn ? 'Adhkar' : 'الأذكار',
                  img: '/assets/3d_icons/icon_sabah_masaa.png',
                  action: () => {
                    markPageAsSeen('sabah-masaa');
                    recordAppVisit('sabah-masaa');
                    onNavigate('sabah-masaa');
                  }
                },
                {
                  id: 'adia',
                  label: isEn ? 'Supplications' : 'الأدعية',
                  img: '/assets/3d_icons/icon_adia.png',
                  action: () => {
                    markPageAsSeen('adia');
                    recordAppVisit('adia');
                    onNavigate('adia');
                  }
                },
                {
                  id: 'hisn-muslim',
                  label: isEn ? 'Hisn Al-Muslim' : 'حصن المسلم',
                  img: '/assets/3d_icons/icon_hisn.png',
                  action: () => {
                    markPageAsSeen('hisn-muslim');
                    recordAppVisit('hisn-muslim');
                    onNavigate('hisn-muslim');
                  }
                },
                {
                  id: 'others',
                  label: isEn ? 'Ruqyah Shariah' : 'الرقية الشرعية',
                  img: '/assets/3d_icons/icon_ruqyah.png',
                  action: () => {
                    markPageAsSeen('others');
                    recordAppVisit('others');
                    onNavigate('others');
                  }
                }
              ].map(btn => (
                <button
                  key={`adhkar-3d-btn-${btn.id}`}
                  type="button"
                  onClick={btn.action}
                  className="flex flex-col items-center justify-start p-0.5 group cursor-pointer active:scale-90 hover:scale-105 transition-all duration-200 w-full min-h-[64px] sm:min-h-[72px] select-none focus:outline-none"
                >
                  <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-12 sm:h-12 flex items-center justify-center relative shrink-0">
                    <img
                      src={btn.img}
                      alt={btn.label}
                      className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_3px_5px_rgba(0,0,0,0.12)]"
                      loading="lazy"
                    />
                  </div>
                  <span 
                    className="app-name-label text-[8px] min-[340px]:text-[8.5px] min-[370px]:text-[9px] min-[410px]:text-[10px] sm:text-[11px] font-black font-cairo text-center mt-1 leading-none tracking-tighter select-none whitespace-nowrap w-full"
                    style={{ 
                      color: isNightMode ? '#F59E0B' : '#1C1917',
                      textShadow: isNightMode ? 'none' : '0 1px 1px rgba(255,255,255,0.9)' 
                    }}
                    title={btn.label}
                  >
                    {btn.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  );

  const renderSearchCard = () => (
      /* 3. بطاقة البحث وقسم التطبيقات المفضلة وزر التحكم الصوتي */
      <div 
        className="w-full golden-3d-card p-3.5 sm:p-4 select-none transition-all duration-200"
      >
        {/* الصف العلوي: قسم البحث وبجواره زر التحكم الصوتي */}
        <div className="flex items-stretch gap-2 sm:gap-2.5">
          <div 
            onClick={() => {
              recordAppVisit('search');
              onNavigate('search');
            }}
            className="flex-1 min-w-0 cursor-pointer flex items-center py-2.5 px-3.5 rounded-2xl sm:rounded-3xl white-3d-card-btn hover:brightness-[1.02] transition-all"
          >
            <div className="flex flex-col min-w-0 flex-1 text-start">
              <span className="text-[11px] min-[380px]:text-xs sm:text-sm font-bold text-[#451A03] font-cairo whitespace-normal leading-snug">
                {isEn ? 'Search Quran, all Adhkar & pages' : 'ابحث في القرآن وجميع الأذكار والصفحات'}
              </span>
              <span className="white-card-subtext text-[9.5px] min-[380px]:text-[10px] sm:text-[11px] text-amber-900/80 font-medium mt-0.5">
                {isEn ? 'Instant search across entire app content' : 'بحث فوري في كامل محتويات التطبيق'}
              </span>
            </div>
          </div>

          {/* أيقونة التحكم الصوتي فقط باللون الذهبي بدون أي بطاقة خلفية */}
          <button
            id="modern-voice-control-btn"
            type="button"
            onClick={() => {
              toggleEnabled();
              if (!isEnabled) {
                setToastMessage(isEn ? 'Voice control activated 🎙️' : 'تم تفعيل التحكم الصوتي 🎙️');
              } else {
                setToastMessage(isEn ? 'Voice control disabled' : 'تم تعطيل التحكم الصوتي');
              }
            }}
            className="shrink-0 p-2 sm:p-2.5 flex items-center justify-center cursor-pointer select-none transition-all duration-200 active:scale-90 hover:scale-110 bg-transparent border-none outline-none"
            title={
              isEnabled 
                ? (isEn ? 'Voice control is active (Tap to disable)' : 'التحكم الصوتي مفعّل (انقر للتعطيل)') 
                : (isEn ? 'Voice control is disabled (Tap to enable)' : 'التحكم الصوتي معطّل (انقر للتفعيل)')
            }
          >
            {isEnabled ? (
              <div className="relative flex items-center justify-center">
                <Mic className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md voice-control-icon-svg" color={voiceIconColor} style={{ color: voiceIconColor, stroke: voiceIconColor }} strokeWidth={2.4} />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: voicePingColor }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: voiceIconColor }}></span>
                </span>
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <MicOff className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md voice-control-icon-svg" color={voiceIconColor} style={{ color: voiceIconColor, stroke: voiceIconColor }} strokeWidth={2.4} />
              </div>
            )}
          </button>
        </div>

        {/* قسم التطبيقات المفضلة المنقول داخل بطاقة البحث مع تصغير الخط لعرض العناوين كاملة بدون تقطيع */}
        <div className="mt-2.5 pt-2 border-t border-amber-300/60 w-full">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <div className="flex items-center">
              <span className="card-header-title text-xs sm:text-[13px] font-black text-[#451A03] font-cairo">
                {isEn ? 'Your Daily Apps' : 'تطبيقاتك اليومية'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-900/75">
              {isEn ? 'Most used • Scroll' : 'الأكثر استخداماً • اسحب للتمرير'}
            </span>
          </div>

          {/* الحاوية الرخامية المجسمة للأزرار المفضلة البارزة ثلاثية الأبعاد داخل البطاقة الذهبية مع تلاشي جانبي ناعم */}
          <div className="w-full white-3d-container-card p-1 sm:p-2">
            <div 
              ref={favScrollRef}
              onScroll={updateFavScrollFade}
              className="flex items-start gap-1.5 sm:gap-2.5 overflow-x-auto pb-1 pt-0.5 px-1 scrollbar-none snap-x"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                maskImage: favScrollMask,
                WebkitMaskImage: favScrollMask
              }}
              dir={dir}
            >
              {favoriteServices.map((service) => {
                const iconSrc = get3DIconForService(service.id);
                return (
                  <button
                    key={`fav-search-card-${service.id}`}
                    type="button"
                    onClick={() => {
                      markPageAsSeen(service.id);
                      recordAppVisit(service.id);
                      onNavigate(service.id, (service.id === 'quran' || service.id === 'quran-landscape') ? { from: 'modern_home', ...(isEn ? { readingMode: 'translation' } : {}) } : undefined);
                    }}
                    className="snap-start shrink-0 flex flex-col items-center justify-start p-0.5 group cursor-pointer active:scale-90 hover:scale-105 transition-all duration-200 w-[66px] sm:w-[74px] min-h-[66px] sm:min-h-[74px] select-none focus:outline-none"
                  >
                    <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-12 sm:h-12 flex items-center justify-center relative shrink-0">
                      <img
                        src={iconSrc}
                        alt={service.title}
                        className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_3px_5px_rgba(0,0,0,0.12)]"
                        loading="lazy"
                      />
                      {service.isNew && (
                        <span 
                          className={`new-app-badge absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-white font-black text-[8px] shadow-sm leading-none z-10 ${
                            isBurgundyTheme
                              ? 'bg-rose-900'
                              : isSkyTheme 
                                ? 'bg-sky-800' 
                                : isEmeraldTheme 
                                  ? 'bg-emerald-800' 
                                  : 'bg-amber-600'
                          }`}
                          style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                        >
                          {isEn ? 'NEW' : 'جديد'}
                        </span>
                      )}
                    </div>
                    <span 
                      className="app-name-label text-[7.5px] min-[340px]:text-[8px] min-[370px]:text-[8.5px] min-[410px]:text-[9.5px] sm:text-[10.5px] font-black font-cairo text-center mt-1 leading-[1.15] tracking-tight select-none whitespace-normal break-words w-full px-0.5"
                      style={{ 
                        color: isNightMode ? '#F59E0B' : '#1C1917',
                        textShadow: isNightMode ? 'none' : '0 1px 1px rgba(255,255,255,0.9)' 
                      }}
                      title={service.title}
                    >
                      {service.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );

  const renderAppsCard = () => (
      /* 4. قسم التطبيقات والخدمات (Applications & Services) */
      <div 
        id="modern-islamic-apps-card"
        className="w-full golden-3d-card select-none transition-all duration-300"
      >
        {/* الترويسة وعدد التطبيقات مع زر الفتح/الإغلاق */}
        <div 
          onClick={() => setIsAppsExpanded(!isAppsExpanded)}
          className="w-full p-4 sm:p-5 pb-3 flex items-center justify-between cursor-pointer transition-colors duration-150 hover:bg-black/[0.02]"
          role="button"
          tabIndex={0}
          aria-expanded={isAppsExpanded}
        >
          <div className="flex flex-col text-start">
            <span className="card-header-title text-sm sm:text-base font-bold text-[#451A03] font-cairo leading-tight">
              {isEn ? 'Islamic Apps' : 'التطبيقات الإسلامية'}
            </span>
            <span className="text-[11px] text-amber-900/85 font-medium mt-0.5">
              {isAppsExpanded 
                ? (isEn ? 'Tap to collapse' : 'انقر لإغلاق الدرج') 
                : (isEn ? 'Tap tabs to view apps' : 'انقر على أي تبويب لعرض التطبيقات')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 golden-3d-btn-light ${
              isAppsExpanded ? 'rotate-180' : ''
            }`}>
              <ChevronDown className="w-5 h-5 text-amber-900 stroke-[2.8]" />
            </div>
          </div>
        </div>

        {/* التبويبات تظهر دائماً في البطاقة مطابقة تماماً لتبويب بطاقة إشراقات وذاكرة اليوم */}
        <div className="px-4 sm:px-5 pb-3.5">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs font-bold overflow-x-auto scrollbar-none max-w-full pt-1 pb-2">
            {/* 1. الكل */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveTab('all'); 
                setIsAppsExpanded(true); 
              }}
              className={`px-2.5 min-[380px]:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] min-[380px]:text-xs flex items-center justify-center shrink-0 ${
                activeTab === 'all' && isAppsExpanded
                  ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none')
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              <span style={activeTab === 'all' && isAppsExpanded && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
                {isEn ? 'All' : 'الكل'}
              </span>
            </button>

            {/* 2. المكتبة */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveTab('library'); 
                setIsAppsExpanded(true); 
              }}
              className={`px-2.5 min-[380px]:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] min-[380px]:text-xs flex items-center justify-center shrink-0 ${
                activeTab === 'library' && isAppsExpanded
                  ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none')
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              <span style={activeTab === 'library' && isAppsExpanded && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
                {isEn ? 'Library' : 'المكتبة'}
              </span>
            </button>

            {/* 3. العبادات */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveTab('worship'); 
                setIsAppsExpanded(true); 
              }}
              className={`px-2.5 min-[380px]:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] min-[380px]:text-xs flex items-center justify-center shrink-0 ${
                activeTab === 'worship' && isAppsExpanded
                  ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none')
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              <span style={activeTab === 'worship' && isAppsExpanded && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
                {isEn ? 'Worship' : 'العبادات'}
              </span>
            </button>

            {/* 4. أخرى */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveTab('tools'); 
                setIsAppsExpanded(true); 
              }}
              className={`px-2.5 min-[380px]:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] min-[380px]:text-xs flex items-center justify-center shrink-0 ${
                activeTab === 'tools' && isAppsExpanded
                  ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none')
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              <span style={activeTab === 'tools' && isAppsExpanded && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
                {isEn ? 'Other' : 'أخرى'}
              </span>
            </button>
          </div>
        </div>

        {/* شبكة التطبيقات المجسمة ثلاثية الأبعاد (تظهر عند فتح الدرج لجميع التبويبات) */}
        {isAppsExpanded && (
          <div className="px-3.5 sm:px-5 pb-4 pt-1 border-t border-amber-300/60 animate-fadeIn">
            <div className="w-full white-3d-container-card p-3 sm:p-4 mt-2">
              <div className="grid grid-cols-4 gap-y-3.5 sm:gap-y-4 gap-x-2 sm:gap-x-3 items-start justify-items-center" dir={dir}>
                {displayedServices.map((service) => {
                  const iconSrc = get3DIconForService(service.id);
                  return (
                    <button
                      key={`apps-drawer-item-${service.id}`}
                      type="button"
                      onClick={() => {
                        markPageAsSeen(service.id);
                        recordAppVisit(service.id);
                        onNavigate(service.id, (service.id === 'quran' || service.id === 'quran-landscape') ? { from: 'modern_home', ...(isEn ? { readingMode: 'translation' } : {}) } : undefined);
                      }}
                      className="flex flex-col items-center justify-between p-1.5 sm:p-2 group cursor-pointer active:scale-90 hover:scale-105 transition-all duration-200 w-full min-h-[92px] select-none focus:outline-none"
                    >
                      <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center relative">
                        <img
                          src={iconSrc}
                          alt={service.title}
                          className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)]"
                          loading="lazy"
                        />
                        {service.isNew && (
                          <span 
                            className={`new-app-badge absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-white font-black text-[9px] shadow-sm leading-none z-10 ${
                              isBurgundyTheme
                                ? 'bg-rose-900'
                                : isSkyTheme 
                                  ? 'bg-sky-800' 
                                  : isEmeraldTheme 
                                    ? 'bg-emerald-800' 
                                    : 'bg-amber-600'
                            }`}
                            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                          >
                            {isEn ? 'NEW' : 'جديد'}
                          </span>
                        )}
                      </div>
                      <span 
                        className="app-name-label text-[11px] sm:text-[12px] font-black text-center leading-tight whitespace-pre-line w-full font-cairo select-none mt-1"
                        style={{ 
                          color: isNightMode ? '#F59E0B' : '#1C1917',
                          textShadow: isNightMode ? 'none' : '0 1px 1px rgba(255,255,255,0.9)' 
                        }}
                      >
                        {(() => {
                          const parts = service.title.trim().split(/\s+/);
                          if (parts.length >= 2) {
                            return `${parts[0]}\n${parts.slice(1).join(' ')}`;
                          }
                          return service.title;
                        })()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
  );

  const renderTrackerCard = () => (
      /* 5. بطاقة مربي الصلوات الخمس (Habit Tracker Card) */
      <div 
        className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all"
      >
        {/* الترويسة */}
        <div className="flex items-center justify-between w-full mb-3.5">
          <div className="flex flex-col text-start">
            <span className="card-header-title text-xs sm:text-sm font-bold text-[#451A03] font-cairo">
              {isEn ? 'Five Daily Prayers Tracker' : 'مربي الصلوات الخمس'}
            </span>
            <span className="text-[11px] text-amber-900/85 font-medium">
              {isEn 
                ? `Completed ${completedPrayersCount} of 5 (${prayersPercentage}%)`
                : `أنجزت ${formatNumber(completedPrayersCount)} من ٥ صلوات (${formatNumber(prayersPercentage)}%)`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('habit-tracker')}
            className="px-3.5 py-1.5 rounded-full golden-3d-pill-btn font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <span>{isEn ? 'Habit Tracker' : 'مربي العبادات'}</span>
            <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* أزرار الصلوات الخمس التفاعلية بالأيقونات المجسمة */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 my-2">
          {[
            { key: 'fajr', label: isEn ? 'Fajr' : 'الفجر', iconSrc: '/assets/3d_icons/icon_prayer_fajr.png' },
            { key: 'dhuhr', label: isEn ? 'Dhuhr' : 'الظهر', iconSrc: '/assets/3d_icons/icon_prayer_dhuhr.png' },
            { key: 'asr', label: isEn ? 'Asr' : 'العصر', iconSrc: '/assets/3d_icons/icon_prayer_asr.png' },
            { key: 'maghrib', label: isEn ? 'Maghrib' : 'المغرب', iconSrc: '/assets/3d_icons/icon_prayer_maghrib.png' },
            { key: 'isha', label: isEn ? 'Isha' : 'العشاء', iconSrc: '/assets/3d_icons/icon_prayer_isha.png' },
          ].map((item) => {
            const isDone = !!todayHabits.prayers?.[item.key as keyof typeof todayHabits.prayers];
            return (
              <button
                key={item.key}
                type="button"
                onClick={(e) => handleTogglePrayer(e, item.key as any)}
                className={`group flex flex-col items-center justify-between p-1.5 sm:p-2.5 rounded-2xl transition-all duration-150 active:scale-90 cursor-pointer relative white-3d-card-btn min-h-[88px] sm:min-h-[96px] ${
                  isDone
                    ? ((isNightMode || isBlackTheme) ? 'prayer-card-done' : 'ring-2 ring-emerald-500/80 shadow-md')
                    : ''
                }`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center my-auto">
                  <img
                    src={item.iconSrc}
                    alt={item.label}
                    className={`w-full h-full object-contain pointer-events-none transition-transform duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)] ${
                      isDone ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                    loading="lazy"
                  />
                  {isDone && (
                    <div className="prayer-done-badge absolute -top-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border-1.5 border-white animate-in zoom-in-75 duration-150">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span 
                  className="prayer-name-label text-[11px] sm:text-xs font-black tracking-tight font-cairo select-none mt-0.5"
                  style={{ 
                    color: (isNightMode || isBlackTheme) ? '#000000' : '#1C1917',
                    WebkitTextFillColor: (isNightMode || isBlackTheme) ? '#000000' : '#1C1917',
                    textShadow: (isNightMode || isBlackTheme) ? 'none' : '0 1px 1px rgba(255,255,255,0.8)' 
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* الإنجاز اليومي وحالة تقدم الورد القرآني */}
        <div className="flex items-center justify-between gap-2 text-xs font-semibold pt-2.5 mt-2 border-t border-amber-300/60">
          <div className="flex flex-col items-start gap-0.5 min-w-0 text-start">
            <span className="text-amber-950 font-bold leading-snug">
              {isEn ? `Daily Progress: ` : `الإنجاز اليومي: `}
              <span className="gold-accent-text font-extrabold">{isEn ? `${totalDailyProgress}%` : `${formatNumber(totalDailyProgress)}%`}</span>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('daily-wird')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900/85 hover:text-amber-950 transition-colors bg-transparent border-none p-0 outline-none cursor-pointer truncate max-w-full"
              title={isEn ? 'Open Daily Quran Wird' : 'فتح الورد القرآني اليومي'}
            >
              {dailyWirdStatus.prefix && (
                <span>{dailyWirdStatus.prefix}</span>
              )}
              <span className={`font-extrabold gold-accent-text ${dailyWirdStatus.isDone ? 'text-emerald-700' : 'text-amber-950'}`}>
                {dailyWirdStatus.highlight}
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('daily-wird')}
            className="px-3.5 py-1.5 rounded-full golden-3d-pill-btn font-bold text-xs flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer shadow-xs"
            title={isEn ? 'Daily Quran Wird' : 'متابعة الورد القرآني'}
          >
            <span>{isEn ? 'Daily Wird' : 'متابعة الورد القرآني'}</span>
            <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>
  );

  const renderTawafCard = () => {
    if (!tawafState.showOnHome) return null;
    return (
      <TawafCounterCard 
        theme={theme}
        isGolden={true}
        onNavigate={onNavigate}
      />
    );
  };

  const renderReflectionsCard = () => (
    <>
      {/* 6. بطاقة إشراقات وذاكرة اليوم (Reflections & Today's Memory Card) */}
      <div 
        className="w-full golden-3d-card p-3.5 sm:p-5 select-none transition-all"
      >
        {/* الترويسة وأزرار التبديل الأربعة */}
        <div className="flex flex-col w-full mb-3 gap-2.5">
          <div className="flex items-center justify-start w-full">
            <span className="card-header-title text-sm font-bold text-[#451A03] font-cairo text-start">
              {isEn ? 'Reflections & Memory of the Day' : 'إشراقات وذاكرة اليوم'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-0.5 min-[360px]:gap-1 text-xs font-bold overflow-x-auto scrollbar-none max-w-full pt-1 pb-2 px-1">
            <button
              type="button"
              onClick={() => setActiveEventTab('occasions')}
              className={`px-2 min-[360px]:px-2.5 py-1 rounded-full transition-all cursor-pointer text-[10.5px] min-[360px]:text-[11px] min-[400px]:text-xs flex items-center justify-center shrink-0 ${
                activeEventTab === 'occasions' 
                  ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none') 
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              <span style={activeEventTab === 'occasions' && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
                {isEn ? 'Occasions' : 'المناسبات'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEventTab('wisdom')}
              className={`px-2 min-[360px]:px-2.5 py-1 rounded-full transition-all cursor-pointer text-[10.5px] min-[360px]:text-[11px] min-[400px]:text-xs flex items-center justify-center shrink-0 ${
                activeEventTab === 'wisdom' 
                  ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none') 
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              <span style={activeEventTab === 'wisdom' && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
                {isEn ? 'Wisdom' : 'حكمة اليوم'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEventTab('memory')}
              className={`px-2 min-[360px]:px-2.5 py-1 rounded-full transition-all cursor-pointer text-[10.5px] min-[360px]:text-[11px] min-[400px]:text-xs flex items-center justify-center shrink-0 ${
                activeEventTab === 'memory' 
                  ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none') 
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              <span style={activeEventTab === 'memory' && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
                {isEn ? 'Islamic Memory' : 'ذاكرة الإسلام'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEventTab('event')}
              className={`px-2 min-[360px]:px-2.5 py-1 rounded-full transition-all cursor-pointer text-[10.5px] min-[360px]:text-[11px] min-[400px]:text-xs flex items-center justify-center shrink-0 ${
                activeEventTab === 'event' 
                  ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none') 
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              <span style={activeEventTab === 'event' && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
                {isEn ? 'Event of the Day' : 'حدث اليوم'}
              </span>
            </button>
          </div>
        </div>

        {/* شارة التاريخ والعام أو الحكمة ديناميكياً بحسب التبويب النشط */}
        <div className="flex items-center justify-center gap-2 mb-2.5 flex-wrap">
          {activeEventTab === 'wisdom' && currentWisdom && (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg golden-3d-inset text-[#451A03] font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                <span>{isEn ? currentWisdom.categoryEn : currentWisdom.categoryAr}</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg golden-3d-inset text-amber-950 font-extrabold text-xs">
                {isEn ? currentWisdom.authorEn : currentWisdom.authorAr}
              </span>
            </>
          )}

          {activeEventTab === 'event' && (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg golden-3d-inset text-[#451A03] font-bold text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-800" />
                <span>{onThisDayEvent?.dateStr || moment().format(isEn ? 'dddd, D MMMM' : 'dddd، D MMMM')}</span>
              </div>
              {onThisDayEvent?.year ? (
                <span className="px-2 py-0.5 rounded-lg golden-3d-inset text-amber-950 font-extrabold text-xs">
                  {isEn ? `Year ${onThisDayEvent.year} AD` : `عام ${toArabic(onThisDayEvent.year)} م`}
                </span>
              ) : null}
            </>
          )}

          {activeEventTab === 'memory' && (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg golden-3d-inset text-[#451A03] font-bold text-xs">
                <ScrollText className="w-3.5 h-3.5 text-amber-800" />
                <span>{isEn ? 'Islamic History' : 'ذاكرة التاريخ الإسلامي'}</span>
              </div>
              {(currentHistoryMemoryEvent?.hijriYearAr || currentHistoryMemoryEvent?.gregorianYearAr) && (
                <span className="px-2 py-0.5 rounded-lg golden-3d-inset text-amber-950 font-extrabold text-xs">
                  {isEn 
                    ? `${currentHistoryMemoryEvent.hijriYearEn} • ${currentHistoryMemoryEvent.gregorianYearEn}`
                    : `${currentHistoryMemoryEvent.hijriYearAr} • ${currentHistoryMemoryEvent.gregorianYearAr}`}
                </span>
              )}
            </>
          )}

          {activeEventTab === 'occasions' && (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg golden-3d-inset text-[#451A03] font-bold text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-800" />
                <span>{currentOccasion?.dateStr || moment().format(isEn ? 'dddd, D MMMM' : 'dddd، D MMMM')}</span>
              </div>
              {currentOccasion && (
                <span className="px-2 py-0.5 rounded-lg golden-3d-inset text-[#451A03] font-extrabold text-xs">
                  {currentOccasion.isToday
                    ? (isEn ? 'Today' : 'اليوم')
                    : (currentOccasion.daysRemaining > 0
                        ? (isEn ? `Remaining: ${formatNumber(currentOccasion.daysRemaining)} days` : `المتبقي: ${toArabic(currentOccasion.daysRemaining)} يوم`)
                        : (isEn ? `Passed: ${formatNumber(Math.abs(currentOccasion.daysRemaining))} days` : `مرت: ${toArabic(Math.abs(currentOccasion.daysRemaining))} يوم`))}
                </span>
              )}
            </>
          )}
        </div>

        {/* محتوى الحكمة أو الحدث أو الذكرى أو المناسبة بدقة وجمالية */}
        <div className="min-h-[64px] flex flex-col justify-center my-2 text-start">
          {activeEventTab === 'wisdom' && currentWisdom && (
            <div className="flex flex-col gap-1">
              <span className="gold-accent-text text-xs sm:text-sm font-bold text-[#451A03] font-cairo">
                {isEn ? currentWisdom.titleEn : currentWisdom.titleAr}
              </span>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-[#3B1703] line-clamp-3">
                "{isEn ? currentWisdom.textEn : currentWisdom.textAr}"
              </p>
            </div>
          )}

          {activeEventTab === 'event' && (
            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-[#3B1703] line-clamp-4">
              {isEn ? (onThisDayEvent?.textEn || onThisDayEvent?.text) : onThisDayEvent?.text || (isEn ? 'Events on this day in history' : 'حدث في مثل هذا اليوم من التاريخ الإسلامي والعالمي')}
            </p>
          )}

          {activeEventTab === 'memory' && currentHistoryMemoryEvent && (
            <div className="flex flex-col gap-1">
              <span className="gold-accent-text text-xs sm:text-sm font-bold text-[#451A03] font-cairo">
                {isEn ? currentHistoryMemoryEvent.titleEn : currentHistoryMemoryEvent.titleAr}
              </span>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-[#3B1703] line-clamp-3">
                {isEn ? currentHistoryMemoryEvent.descriptionEn : currentHistoryMemoryEvent.descriptionAr}
              </p>
            </div>
          )}

          {activeEventTab === 'occasions' && currentOccasion && (
            <div className="flex flex-col gap-1">
              <span className="gold-accent-text text-xs sm:text-sm font-bold text-[#451A03] font-cairo">
                {currentOccasion.name}
              </span>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-amber-900/90">
                {currentOccasion.dateStr} • {currentOccasion.gregorianDateStr}
              </p>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات السفلية */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-amber-300/60">
          <button
            type="button"
            onClick={(e) => {
              if (activeEventTab === 'wisdom') {
                setWisdomIndex(prev => (prev + 1) % ISLAMIC_WISDOMS.length);
              } else if (activeEventTab === 'event') {
                handleNextEvent?.(e);
              } else if (activeEventTab === 'memory') {
                handleNextHistoryMemoryEvent?.(e);
              } else {
                setEventIndex(prev => (prev + 1) % (upcomingEvents.length || 1));
              }
            }}
            className="gold-accent-text flex items-center gap-1.5 text-xs font-bold text-[#78350F] hover:text-[#451A03] active:scale-95 transition-all cursor-pointer"
          >
            <span className="gold-accent-icon inline-flex items-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </span>
            <span className="gold-accent-text">
              {activeEventTab === 'wisdom'
                ? (isEn ? 'Another Wisdom' : 'حكمة أخرى')
                : (activeEventTab === 'event' 
                    ? (isEn ? 'Another Event' : 'حدث آخر')
                    : (activeEventTab === 'memory' 
                        ? (isEn ? 'Another Memory' : 'ذكرى أخرى') 
                        : (isEn ? 'Another Occasion' : 'مناسبة أخرى')))}
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (typeof document !== 'undefined') {
                  document.body.classList.add('zoom-modal-active');
                  document.body.setAttribute('data-zoom-modal', 'true');
                  window.dispatchEvent(new CustomEvent('modal-state-changed', { detail: { isOpen: true, type: 'zoom' } }));
                }
                if (activeEventTab === 'wisdom') setShowWisdomZoomModal(true);
                else if (activeEventTab === 'event') setShowExpandedEventsModal(true);
                else if (activeEventTab === 'memory') setShowExpandedHistoryMemoryModal(true);
                else setShowExpandedUpcomingEventModal(true);
              }}
              className="w-8 h-8 rounded-full golden-3d-btn-light text-amber-950 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title={isEn ? 'Zoom' : 'تكبير'}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                if (activeEventTab === 'wisdom' && currentWisdom) {
                  const shareText = `💡 ${currentWisdom.titleAr}\n\n"${currentWisdom.textAr}"\n\n— ${currentWisdom.authorAr}\n\nتطبيق مصحف أحمد وليلى\n${shareTextAr || 'https://mushaf-ahmed-laila.vercel.app/'}`;
                  if (navigator.share) {
                    navigator.share({ title: currentWisdom.titleAr, text: shareText }).catch(() => {});
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareText);
                    setToastMessage?.(isEn ? 'Wisdom copied to clipboard!' : 'تم نسخ الحكمة إلى الحافظة!');
                  }
                } else if (activeEventTab === 'event') handleShareHighlight?.(e);
                else if (activeEventTab === 'memory') handleShareHistoryMemory?.(e);
                else handleShareUpcomingEvent?.(e);
              }}
              className="w-8 h-8 rounded-full golden-3d-btn-light text-amber-950 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title={isEn ? 'Share' : 'مشاركة'}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                if (activeEventTab === 'wisdom' && currentWisdom) {
                  const copyText = `💡 ${currentWisdom.titleAr}\n\n"${currentWisdom.textAr}"\n\n— ${currentWisdom.authorAr}`;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(copyText);
                    setToastMessage?.(isEn ? 'Wisdom copied to clipboard!' : 'تم نسخ الحكمة بنجاح!');
                  }
                } else if (activeEventTab === 'event') handleCopyHighlight?.(e);
                else if (activeEventTab === 'memory') handleCopyHistoryMemory?.(e);
                else handleCopyUpcomingEvent?.(e);
              }}
              className="w-8 h-8 rounded-full golden-3d-btn-light text-amber-950 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title={isEn ? 'Copy' : 'نسخ'}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Modal: حكمة اليوم */}
      {currentWisdom && (
        <UnifiedEventZoomModal
          isOpen={showWisdomZoomModal}
          onClose={() => setShowWisdomZoomModal(false)}
          categoryTitle={isEn ? 'Wisdom of the Day' : 'حكمة اليوم'}
          text={isEn ? currentWisdom.textEn : currentWisdom.textAr}
          subtitle={isEn ? currentWisdom.titleEn : currentWisdom.titleAr}
          source={isEn ? currentWisdom.authorEn : currentWisdom.authorAr}
          setToastMessage={setToastMessage}
          isGolden={true}
        />
      )}
    </>
  );

  const renderShareCard = () => (
      /* 7 & 8. بطاقة مدمجة: شارك التطبيق | تصفح التطبيق | الدعم الفني */
      <div className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all">
        {/* شريط التبويبات الثلاثة السفلية */}
        <div className="grid grid-cols-3 gap-1.5 mb-4 pt-1 pb-2">
          <button
            type="button"
            onClick={() => setActiveBottomCardTab('share')}
            className={`py-1.5 px-1 rounded-full text-[11px] sm:text-xs font-bold font-cairo flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeBottomCardTab === 'share'
                ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] text-white font-extrabold shadow-none')
                : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
            }`}
          >
            <span style={activeBottomCardTab === 'share' && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
              {isEn ? 'Share App' : 'شارك التطبيق'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomCardTab('browse')}
            className={`py-1.5 px-1 rounded-full text-[11px] sm:text-xs font-bold font-cairo flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeBottomCardTab === 'browse'
                ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] text-white font-extrabold shadow-none')
                : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
            }`}
          >
            <span style={activeBottomCardTab === 'browse' && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
              {isEn ? 'Browse App' : 'تصفح التطبيق'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomCardTab('support')}
            className={`py-1.5 px-1 rounded-full text-[11px] sm:text-xs font-bold font-cairo flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeBottomCardTab === 'support'
                ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] text-white font-extrabold shadow-none')
                : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
            }`}
          >
            <span style={activeBottomCardTab === 'support' && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
              {isEn ? 'Tech Support' : 'الدعم الفني'}
            </span>
          </button>
        </div>

        {/* محتوى التبويب الأول: شارك التطبيق */}
        {activeBottomCardTab === 'share' && (
          <div className="space-y-3 animate-fadeIn">
            {/* المربع القرآني */}
            <div className="w-full p-3.5 rounded-2xl golden-3d-inset text-center flex flex-col items-center gap-1">
              <p className="gold-accent-text font-cairo text-sm sm:text-base font-bold text-[#451A03]">
                {t('app_share.ayah', 'قال تعالى: ( وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ )')}
              </p>
              <p className="text-xs font-semibold text-amber-950 font-cairo">
                {t('app_share.hadith', '« مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ »')}
              </p>
            </div>

            <p className="text-xs text-amber-900/90 font-medium leading-relaxed text-center px-2 font-cairo">
              {t('app_share.desc', 'اذا اعجبك التطبيق قم بنشره على وسائل التواصل ليكون لك الاجر ولمن تحب ان شاء الله .')}
            </p>

            {/* الأزرار الثلاثة: مشاركة، الكيوار، نسخ */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareAppGeneral}
                className="py-2.5 px-3 rounded-2xl golden-3d-btn font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all font-cairo cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Share' : 'مشاركة'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="py-2.5 px-3 rounded-2xl golden-3d-btn font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all font-cairo cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{isEn ? 'QR Code' : 'الكيو ار'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareAppText}
                className="py-2.5 px-3 rounded-2xl golden-3d-btn font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all font-cairo cursor-pointer"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-900" />
                    <span>{isEn ? 'Copied' : 'تم'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Copy' : 'نسخ'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* محتوى التبويب الثاني: تصفح التطبيق */}
        {activeBottomCardTab === 'browse' && (
          <div className="space-y-3 animate-fadeIn">
            <p className="text-xs sm:text-sm text-amber-900/90 font-medium leading-relaxed text-center py-2 px-2 font-cairo">
              {isEn ? 'To open the app on your browser or iPhone, tap the link' : 'لمشاهدة التطبيق على المتصفح او الايفون اضغط على الرابط'}
            </p>

            <div className="flex items-center justify-between gap-2.5 pt-1">
              <a
                href={WEB_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-2xl golden-3d-btn font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>{isEn ? 'Open Link' : 'فتح الرابط'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleCopyWebUrl}
                className="w-10 h-10 rounded-2xl golden-3d-btn-light flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                title={isEn ? 'Copy Link' : 'نسخ الرابط'}
              >
                {copiedWebLink ? <Check className="w-4 h-4 text-amber-800" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleShareWebUrl}
                className="w-10 h-10 rounded-2xl golden-3d-btn-light flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                title={isEn ? 'Share Link' : 'مشاركة الرابط'}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* محتوى التبويب الثالث: الدعم الفني (الواتساب) */}
        {activeBottomCardTab === 'support' && (
          <div className="space-y-3 animate-fadeIn">
            {/* بطاقة معلومات التواصل مع علاء أحمد */}
            <div className="w-full p-3.5 rounded-2xl golden-3d-inset text-center flex flex-col items-center gap-1">
              <div className={`modern-gold-icon-box w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center mb-1 text-emerald-700 dark:text-emerald-400 ${(isNightMode || isBlackTheme) ? '' : 'border border-emerald-500/30'}`}>
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h4 className="gold-accent-text font-cairo text-sm sm:text-base font-bold text-[#451A03]">
                {isEn ? 'Direct Support & Suggestions' : 'للتواصل المباشر والاقتراحات'}
              </h4>
              <p className="text-xs font-bold text-amber-900 font-cairo">
                {isEn ? 'Alaa Ahmed' : 'علاء أحمد'}
              </p>
              <p className="gold-accent-text text-[11px] font-mono font-bold text-amber-800/80 dir-ltr">
                +966 59 216 6023
              </p>
            </div>

            {/* زر فتح تطبيق الواتساب وبدء المحادثة مباشرة */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  window.open('https://wa.me/966592166023', '_blank');
                }}
                className="w-full py-3 px-4 rounded-2xl golden-3d-btn font-extrabold text-xs sm:text-sm text-white flex items-center justify-center gap-2 active:scale-98 transition-all font-cairo cursor-pointer shadow-none"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>{isEn ? 'Start WhatsApp Chat' : 'محادثة عبر الواتساب'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
  );

  const renderCardContent = (cardId: ModernCardId) => {
    switch (cardId) {
      case 'quran': return renderQuranCard();
      case 'prayer': return renderPrayerCard();
      case 'seasonal': return renderSeasonalCard();
      case 'adhkar': return renderAdhkarCard();
      case 'search': return renderSearchCard();
      case 'apps': return renderAppsCard();
      case 'tracker': return renderTrackerCard();
      case 'tawaf': return renderTawafCard();
      case 'reflections': return renderReflectionsCard();
      case 'share': return renderShareCard();
      default: return null;
    }
  };

  return (
    <div data-layout="modern" className="flex flex-col gap-3 w-full max-w-md mx-auto pt-0 pb-1.5 modern-home-layout font-cairo" style={{ fontFamily: "'Cairo', sans-serif" }} dir={dir}>
      {/* عرض البطاقات بسحب وإفلات الأصبع أو عبر أزرار النقل السريع للأعلى والأسفل بسلاسة فائقة */}
      {isEditMode ? (
        <Reorder.Group 
          axis="y" 
          values={cardsOrder.filter(id => id !== 'seasonal' && (id !== 'tawaf' || tawafState.showOnHome))} 
          onReorder={(newOrderActive) => {
            // الحفاظ على موقع بطاقة المناسبات والأعياد (seasonal) وبطاقة الطواف غير المفعلة في الترتيب المحفوظ عند انتهاء السحب
            const fullOrder: ModernCardId[] = [];
            for (const id of newOrderActive) {
              fullOrder.push(id);
              if (id === 'quran') {
                fullOrder.push('seasonal');
              }
              if (id === 'tracker' && !tawafState.showOnHome) {
                fullOrder.push('tawaf');
              }
            }
            if (!fullOrder.includes('seasonal')) {
              fullOrder.unshift('seasonal');
            }
            if (!tawafState.showOnHome && !fullOrder.includes('tawaf')) {
              fullOrder.push('tawaf');
            }

            setCardsOrder(fullOrder);
            saveCardsOrder(fullOrder);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try { navigator.vibrate(20); } catch {}
            }
          }}
          className="flex flex-col gap-3 w-full"
        >
          {cardsOrder
            .filter(id => id !== 'seasonal' && (id !== 'tawaf' || tawafState.showOnHome))
            .map((cardId) => {
              const content = renderCardContent(cardId);
              if (!content) return null;

              return (
                <ReorderableCardItem
                  key={`modern-card-reorder-${cardId}`}
                  cardId={cardId}
                  isEn={isEn}
                  isNightMode={isNightMode}
                  isBlackTheme={isBlackTheme}
                >
                  {content}
                </ReorderableCardItem>
              );
            })}
        </Reorder.Group>
      ) : (
        /* العرض العادي للبطاقات بدون وضع التعديل */
        cardsOrder.map((cardId) => {
          if (cardId === 'seasonal') {
            return (
              <SmartSeasonalStrip
                key={`modern-card-container-seasonal`}
                layoutMode="modern"
                onNavigate={onNavigate}
              />
            );
          }
          if (cardId === 'tawaf' && !tawafState.showOnHome) {
            return null;
          }
          const content = renderCardContent(cardId);
          if (!content) return null;

          return (
            <div 
              key={`modern-card-container-${cardId}`}
              id={`modern-card-container-${cardId}`}
              className="w-full transition-all duration-200"
            >
              {content}
            </div>
          );
        })
      )}

      {/* الدعاء في الأسفل */}
      <div className="flex items-center justify-center gap-2 mt-1 mb-0.5 px-4" dir={dir}>
        <p 
          className="gold-accent-text text-sm font-black font-cairo leading-tight text-center relative z-10" 
          style={{ 
            color: (isNightMode || isBlackTheme) ? '#F59E0B' : '#78350F',
            fontFamily: "'Cairo', sans-serif",
            textShadow: (isNightMode || isBlackTheme) ? 'none' : '0 1px 2px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(180, 83, 9, 0.15)'
          }}
        >
          {t('app.dua_bottom', 'اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة')}
        </p>
      </div>

      {/* نافذة رمز الاستجابة السريعة (QR) */}
      <ShareAppQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
    </div>
  );
};

// Simple target bead icon for Tasbeeh
function TargetCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

interface ReorderableCardItemProps {
  cardId: ModernCardId;
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  children: React.ReactNode;
}

const ReorderableCardItem: React.FC<ReorderableCardItemProps> = ({
  cardId,
  isEn,
  isNightMode,
  isBlackTheme,
  children
}) => {
  const dragControls = useDragControls();
  const { homeThemeVariant } = useTheme();

  const editStyles = useMemo(() => {
    return getThemeEditModeStyles(isNightMode, homeThemeVariant, isBlackTheme);
  }, [isNightMode, homeThemeVariant, isBlackTheme]);

  if (!children) return null;

  return (
    <Reorder.Item
      value={cardId}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0, top: 0.1, bottom: 0.1 }}
      layout
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      whileDrag={{
        scale: 1,
        x: 0,
        zIndex: 50,
        boxShadow: isNightMode
          ? '0 12px 32px rgba(0,0,0,0.85), 0 0 12px rgba(245,158,11,0.3)'
          : '0 12px 32px rgba(180,83,9,0.25)',
      }}
      className="w-full relative select-none rounded-3xl"
      style={{ x: 0 }}
    >
      {/* Floating Drag Button Overlay - Strictly "زر السحب" only, without arrows, without shrinking or modifying card layout */}
      {cardId !== 'seasonal' && (
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="absolute top-2.5 start-2.5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl shadow-lg cursor-grab active:cursor-grabbing touch-none select-none active:scale-95 transition-transform"
          style={editStyles.dragBadge}
          title={isEn ? 'Hold and drag to reorder' : 'اضغط واسحب لإعادة الترتيب'}
        >
          <GripVertical className="w-4 h-4" />
          <span className="text-xs font-black font-cairo">
            {isEn ? 'Drag' : 'اسحب'}
          </span>
        </div>
      )}

      {/* Card Content - 100% full original size, shape, width and height */}
      <div className="w-full">
        {children}
      </div>
    </Reorder.Item>
  );
};

export default ModernHomeView;
