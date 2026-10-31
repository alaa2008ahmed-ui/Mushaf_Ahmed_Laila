import React, { useState, useEffect, useMemo } from 'react';
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
  CalendarDays
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSeenPages, markPageAsSeen } from '../../utils/badgeManager';
import { usePrayerTimes, computeTimesSync } from '../../context/PrayerTimesContext';
import { useVoiceControl } from '../../context/VoiceControlContext';
import { useHabitTracker } from '../../hooks/useHabitTracker';
import { prayerNamesAr } from '../../data/prayerTimesData';
import { PRAYER_NAMES_EN, getLocalizedLocationName } from '../../utils/prayerTimesTranslations';
import { checkSupportsDST, applyOffset } from '../../utils/prayerTimesUtils';
import { SURAH_NAMES_AR, toArabic, JUZ_MAP } from '../QuranReader/constants';
import { quranData as quranJsonData } from '../../utils/quranData';
import ShareAppQrModal from './ShareAppQrModal';
import TawafCounterCard from './TawafCounterCard';
import UnifiedEventZoomModal from './UnifiedEventZoomModal';
import { ISLAMIC_WISDOMS, getWisdomOfTheDay } from '../../data/wisdomData';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { useFavoriteApps, recordAppVisit } from '../../utils/favoriteAppsManager';
import { Capacitor } from '@capacitor/core';
import { Share as CapacitorShare } from '@capacitor/share';
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
  shareTextEn
}) => {
  const { language, isRTL, dir, t, formatNumber } = useLanguage();
  const { isNightMode } = useTheme();
  const isEn = language === 'en';
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

  // Active category tab for "درج الخدمات الذكي" (الافتراضي هو 'all' تلبية لطلب المستخدم)
  const [activeTab, setActiveTab] = useState<'all' | 'library' | 'worship' | 'tools'>('all');
  // بطاقة التطبيقات مقفلة افتراضياً ويتم فتحها بالضغط عليها
  const [isAppsExpanded, setIsAppsExpanded] = useState(false);

  // Active tab for "إشراقات وذاكرة اليوم"
  // 'event' | 'memory' | 'occasions' | 'wisdom'
  const [activeEventTab, setActiveEventTab] = useState<'event' | 'memory' | 'occasions' | 'wisdom'>('occasions');

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
  const [activeBottomCardTab, setActiveBottomCardTab] = useState<'share' | 'browse' | 'support'>('share');

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

  // Last read Quran info (مع رقم السورة والآية، ورقم الصفحة، ورقم الجزء)
  const [lastReadQuran, setLastReadQuran] = useState<{ surah: number; surahName: string; ayah: number; page: number; juz: number }>({
    surah: 1,
    surahName: 'سورة الفاتحة',
    ayah: 1,
    page: 1,
    juz: 1
  });

  useEffect(() => {
    const loadLastRead = () => {
      try {
        const savedGlobal = localStorage.getItem('last_read_ayah_global') || localStorage.getItem('last_read_pos_mushaf');
        if (savedGlobal) {
          const parsed = JSON.parse(savedGlobal);
          if (parsed && parsed.s && parsed.a) {
            const s = Number(parsed.s);
            const a = Number(parsed.a);
            const sName = SURAH_NAMES_AR[s - 1] ? `سورة ${SURAH_NAMES_AR[s - 1]}` : 'سورة الفاتحة';
            
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
  }, []);

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
      category: 'library',
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

  return (
    <div data-layout="modern" className="flex flex-col gap-3.5 w-full max-w-md mx-auto pt-0 pb-1.5 modern-home-layout font-cairo" style={{ fontFamily: "'Cairo', sans-serif" }} dir={dir}>
      {/* 1. بطاقة الصلاة القادمة والختمة القرآنية (Prayer Times & Quran Card) */}
      <div 
        className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all"
      >
        {/* قسم تابع تلاوة المصحف (في أعلى البطاقة تماماً تلبية لطلب المستخدم) */}
        <div className="w-full mb-3.5">
          <div className="w-full rounded-2xl p-3 sm:p-3.5 white-3d-container-card flex items-center justify-between gap-2 sm:gap-3 border border-amber-300/50 shadow-md transition-all hover:scale-[1.01]">
            <div 
              onClick={() => onNavigate('quran', { from: 'modern_home', surah: lastReadQuran.surah, ayah: lastReadQuran.ayah, page: lastReadQuran.page })}
              className="flex flex-col min-w-0 flex-1 text-start cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-300/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <BookOpen className="w-4 h-4 text-amber-800" />
                </div>
                <span className="text-xs sm:text-sm font-black truncate group-hover:text-amber-900 transition-colors font-cairo" style={{ color: isNightMode ? '#F59E0B' : '#451A03' }}>
                  {isEn ? 'Continue Quran Recitation' : 'تابع تلاوة المصحف'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap text-[10.5px] sm:text-xs text-amber-900/90 font-medium mt-1.5 min-w-0">
                <span className="font-bold truncate" style={{ color: isNightMode ? '#F59E0B' : '#451A03' }}>{lastReadQuran.surahName}</span>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0 text-[#5B2605] font-bold bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                  <span>{isEn ? `Ayah ${lastReadQuran.ayah}` : `آية ${formatNumber(lastReadQuran.ayah)}`}</span>
                  <span>{isEn ? `Page ${lastReadQuran.page}` : `صفحة ${formatNumber(lastReadQuran.page)}`}</span>
                  <span>{isEn ? `Juz ${lastReadQuran.juz}` : `الجزء ${formatNumber(lastReadQuran.juz)}`}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('quran-landscape', { from: 'modern_home', surah: lastReadQuran.surah, ayah: lastReadQuran.ayah, page: lastReadQuran.page })}
              className="px-3.5 py-1.5 rounded-xl golden-3d-pill-btn font-bold text-xs flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-md cursor-pointer text-white"
              title={isEn ? 'Landscape Reading' : 'تلاوة عرضية للمصحف'}
            >
              <span className="text-xs text-white font-bold">{isEn ? 'Landscape' : 'عرضي'}</span>
            </button>
          </div>
        </div>

        {/* فاصل وقسم مواقيت الصلاة والعد التنازلي */}
        <div className="pt-3.5 border-t border-amber-300/60">
          {/* صف الموقع وزر القبلة الذكي */}
          <div className="flex items-center justify-between w-full mb-3">
            <button
              type="button"
              onClick={handleRefreshLocation}
              disabled={isRefreshingLocation}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-950 hover:text-amber-800 active:scale-95 transition-all cursor-pointer bg-transparent border-none p-0 outline-none max-w-[80%]"
              title={isEn ? 'Click to refresh location automatically' : 'انقر لتحديث الموقع تلقائياً'}
            >
              <span className="truncate">{prayerData.cityName}</span>
              <MapPin className={`w-3.5 h-3.5 text-amber-800 shrink-0 ${isRefreshingLocation ? 'animate-bounce' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('qibla')}
              className="w-8 h-8 rounded-full golden-3d-inset border border-amber-300/80 flex items-center justify-center shadow-2xs shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all text-amber-800"
              title={isEn ? 'Qibla Direction' : 'اتجاه القبلة'}
              aria-label={isEn ? 'Qibla Direction' : 'اتجاه القبلة'}
            >
              <Compass className="w-4.5 h-4.5 text-amber-800 stroke-[2.2]" />
            </button>
          </div>

          {/* العد التنازلي وموعد الأذان المتغير لونه حسب الصلاة */}
          <div 
            onClick={() => onNavigate('prayer-times')}
            className="flex items-end justify-between cursor-pointer py-1"
            title={isEn ? 'Click to open full Prayer Times' : 'انقر لعرض مواقيت الصلاة'}
          >
            <div className="flex flex-col text-start">
              <span className="text-[11px] font-semibold text-amber-900/85">
                {isEn ? 'Time Remaining' : 'الوقت المتبقي حتى الأذان'}
              </span>
              <span className="text-3xl sm:text-4xl font-cairo font-black tracking-tight text-[#451A03] tabular-nums" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.8)' }}>
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
            <div className="w-full h-2.5 rounded-full bg-black/[0.08] p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 shadow-sm transition-all duration-1000 ease-out" 
                style={{ width: `${prayerData.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold text-amber-900/95 mt-1.5 px-0.5 whitespace-nowrap">
              <span className="tabular-nums">{prayerData.prevName} {prayerData.prevTimeStr}</span>
              <span className="text-amber-950 font-extrabold tabular-nums">{prayerData.progressPercent}%</span>
              <span className="tabular-nums">{prayerData.nextName} {prayerData.nextTimeStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. بطاقة الأذكار اليومية مع قسم التطبيقات السريعة */}
      <div 
        className="w-full golden-3d-card p-3.5 sm:p-4 select-none transition-all duration-300"
      >
        <div className="flex flex-col gap-2.5">
          {/* شريط الذكر الذكي (الأذكار اليومية) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex flex-col min-w-0 text-start">
                <span className="text-xs sm:text-sm font-black truncate font-cairo text-[#451A03]">
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
          <div className="w-full h-px bg-amber-300/60 my-0.5" />

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

      {/* 3. بطاقة البحث وقسم التطبيقات المفضلة وزر التحكم الصوتي */}
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
            className="flex-1 min-w-0 cursor-pointer flex items-center gap-2.5 sm:gap-3 p-2 px-3 rounded-2xl sm:rounded-3xl white-3d-card-btn hover:brightness-[1.02] transition-all"
          >
            <div className="flex flex-col min-w-0 flex-1 text-start">
              <span className="text-[11px] min-[380px]:text-xs sm:text-sm font-bold text-[#451A03] font-cairo whitespace-normal leading-snug">
                {isEn ? 'Search Quran, Adhkar, Hadith...' : 'ابحث في القرآن، الأذكار، الأحاديث...'}
              </span>
              <span className="text-[9.5px] min-[380px]:text-[10px] sm:text-[11px] text-amber-900/80 font-medium mt-0.5">
                {isEn ? 'Instant search across entire app content' : 'بحث فوري في كامل محتويات التطبيق'}
              </span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-100/90 text-amber-900 border border-amber-300/80 flex items-center justify-center shrink-0 shadow-2xs">
              <Search className="w-5 h-5 text-amber-800" strokeWidth={2.4} />
            </div>
          </div>

          {/* أيقونة التحكم الصوتي بجوار قسم البحث */}
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
            className={`shrink-0 w-12 sm:w-13 rounded-2xl sm:rounded-3xl flex items-center justify-center cursor-pointer select-none transition-all duration-200 active:scale-95 group golden-3d-pill-btn ${
              isEnabled 
                ? 'ring-2 ring-white/90 shadow-md' 
                : ''
            }`}
            title={
              isEnabled 
                ? (isEn ? 'Voice control is active (Tap to disable)' : 'التحكم الصوتي مفعّل (انقر للتعطيل)') 
                : (isEn ? 'Voice control is disabled (Tap to enable)' : 'التحكم الصوتي معطّل (انقر للتفعيل)')
            }
          >
            <div className="w-8 h-8 rounded-lg relative flex items-center justify-center shrink-0 transition-all">
              {isEnabled ? (
                <div className="relative flex items-center justify-center">
                  <Mic className="w-4.5 h-4.5 text-white" strokeWidth={2.4} />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <MicOff className="w-4.5 h-4.5 text-white/80" strokeWidth={2.4} />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* قسم التطبيقات المفضلة المنقول داخل بطاقة البحث مع تصغير الخط لعرض العناوين كاملة بدون تقطيع */}
        <div className="mt-2.5 pt-2 border-t border-amber-300/60 w-full">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shadow-2xs border border-amber-300/80">
                <Star className="w-3 h-3 fill-amber-600 text-amber-600" />
              </div>
              <span className="text-xs sm:text-[13px] font-black text-[#451A03] font-cairo">
                {isEn ? 'Your Daily Apps' : 'تطبيقاتك اليومية'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-900/75">
              {isEn ? 'Most used • Scroll' : 'الأكثر استخداماً • اسحب للتمرير'}
            </span>
          </div>

          {/* الحاوية الرخامية المجسمة للأزرار المفضلة البارزة ثلاثية الأبعاد داخل البطاقة الذهبية */}
          <div className="w-full white-3d-container-card p-1 sm:p-2">
            <div 
              className="flex items-start gap-1.5 sm:gap-2.5 overflow-x-auto pb-1 pt-0.5 px-1 scrollbar-none snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                      onNavigate(service.id, (service.id === 'quran' || service.id === 'quran-landscape') ? { from: 'modern_home' } : undefined);
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

      {/* 4. قسم التطبيقات والخدمات (Applications & Services) */}
      <div 
        id="modern-islamic-apps-card"
        className="w-full golden-3d-card select-none transition-all duration-300 overflow-hidden"
      >
        {/* الترويسة وعدد التطبيقات مع زر الفتح/الإغلاق */}
        <div 
          onClick={() => setIsAppsExpanded(!isAppsExpanded)}
          className="w-full p-4 sm:p-5 pb-3 flex items-center justify-between cursor-pointer transition-colors duration-150 hover:bg-black/[0.02]"
          role="button"
          tabIndex={0}
          aria-expanded={isAppsExpanded}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-300/80 flex items-center justify-center shrink-0 shadow-2xs">
              <LayoutGrid className="w-4.5 h-4.5 text-amber-800" />
            </div>
            <div className="flex flex-col text-start">
              <span className="text-sm sm:text-base font-bold text-[#451A03] font-cairo leading-tight">
                {isEn ? 'Islamic Apps' : 'التطبيقات الإسلامية'}
              </span>
              <span className="text-[11px] text-amber-900/85 font-medium mt-0.5">
                {isAppsExpanded 
                  ? (isEn ? 'Tap to collapse' : 'انقر لإغلاق الدرج') 
                  : (isEn ? 'Tap tabs to view apps' : 'انقر على أي تبويب لعرض التطبيقات')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full golden-3d-inset text-[#451A03]">
              {isEn 
                ? `${displayedServices.length} Apps`
                : `${formatNumber(displayedServices.length)} تطبيق`}
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 golden-3d-btn-light ${
              isAppsExpanded ? 'rotate-180' : ''
            }`}>
              <ChevronDown className="w-5 h-5 text-amber-900 stroke-[2.8]" />
            </div>
          </div>
        </div>

        {/* التبويبات تظهر دائماً في البطاقة بدون ظهور الصفحات افتراضياً */}
        <div className="px-4 sm:px-5 pb-3.5">
          <div className="w-full p-1 rounded-2xl golden-3d-inset flex items-center justify-between gap-1 text-xs font-bold">
            {/* 1. الكل */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveTab('all'); 
                setIsAppsExpanded(true); 
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                activeTab === 'all' && isAppsExpanded
                  ? 'golden-3d-btn font-extrabold'
                  : 'text-amber-950/80 hover:text-amber-950'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isEn ? 'All' : 'الكل'}</span>
            </button>

            {/* 2. المكتبة */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveTab('library'); 
                setIsAppsExpanded(true); 
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                activeTab === 'library' && isAppsExpanded
                  ? 'golden-3d-btn font-extrabold'
                  : 'text-amber-950/80 hover:text-amber-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isEn ? 'Library' : 'المكتبة'}</span>
            </button>

            {/* 3. العبادات */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveTab('worship'); 
                setIsAppsExpanded(true); 
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                activeTab === 'worship' && isAppsExpanded
                  ? 'golden-3d-btn font-extrabold'
                  : 'text-amber-950/80 hover:text-amber-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? 'Worship' : 'العبادات'}</span>
            </button>

            {/* 4. الأدوات والخدمات */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveTab('tools'); 
                setIsAppsExpanded(true); 
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                activeTab === 'tools' && isAppsExpanded
                  ? 'golden-3d-btn font-extrabold'
                  : 'text-amber-950/80 hover:text-amber-950'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isEn ? 'Other' : 'أخرى'}</span>
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
                        onNavigate(service.id, (service.id === 'quran' || service.id === 'quran-landscape') ? { from: 'modern_home' } : undefined);
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
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-600 text-white font-black text-[9px] shadow-sm leading-none z-10">
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

      {/* 5. بطاقة مربي الصلوات الخمس (Habit Tracker Card) */}
      <div 
        className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all"
      >
        {/* الترويسة */}
        <div className="flex items-center justify-between w-full mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-300/80 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-700" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col text-start">
              <span className="text-xs sm:text-sm font-bold text-[#451A03] font-cairo">
                {isEn ? 'Five Daily Prayers Tracker' : 'مربي الصلوات الخمس'}
              </span>
              <span className="text-[11px] text-amber-900/85 font-medium">
                {isEn 
                  ? `Completed ${completedPrayersCount} of 5 (${prayersPercentage}%)`
                  : `أنجزت ${formatNumber(completedPrayersCount)} من ٥ صلوات (${formatNumber(prayersPercentage)}%)`}
              </span>
            </div>
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
                    ? 'ring-2 ring-emerald-500/80 shadow-md'
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
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border-1.5 border-white animate-in zoom-in-75 duration-150">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span 
                  className="app-name-label text-[11px] sm:text-xs font-black tracking-tight font-cairo select-none mt-0.5"
                  style={{ 
                    color: isNightMode ? '#F59E0B' : '#1C1917',
                    textShadow: isNightMode ? 'none' : '0 1px 1px rgba(255,255,255,0.8)' 
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* الإنجاز اليومي والورد القرآني */}
        <div className="flex items-center justify-between text-xs font-semibold pt-2.5 mt-2 border-t border-amber-300/60">
          <span className="text-amber-950 font-bold">
            {isEn ? `Daily Progress: ${totalDailyProgress}%` : `الإنجاز اليومي: ${formatNumber(totalDailyProgress)}%`}
          </span>
          <button
            type="button"
            onClick={() => onNavigate('daily-wird')}
            className="px-3.5 py-1.5 rounded-full golden-3d-pill-btn font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
            title={isEn ? 'Daily Quran Wird' : 'متابعة الورد القرآني'}
          >
            <span>{isEn ? 'Daily Wird' : 'متابعة الورد القرآني'}</span>
            <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* بطاقة عداد الأشواط (طواف وسعي) في الحج والعمرة - تظهر تحت بطاقة التطبيقات الإسلامية عند تفعيلها */}
      <TawafCounterCard 
        theme={theme}
        isGolden={true}
        onNavigate={onNavigate}
      />

      {/* 6. بطاقة إشراقات وذاكرة اليوم (Reflections & Today's Memory Card) */}
      <div 
        className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all"
      >
        {/* الترويسة وأزرار التبديل الأربعة */}
        <div className="flex flex-col w-full mb-3 gap-2.5">
          <div className="flex items-center gap-2 justify-start w-full">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-sm font-bold text-[#451A03] font-cairo text-start">
              {isEn ? 'Reflections & Memory of the Day' : 'إشراقات وذاكرة اليوم'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs font-bold overflow-x-auto scrollbar-none max-w-full py-0.5">
            <button
              type="button"
              onClick={() => setActiveEventTab('occasions')}
              className={`px-2.5 min-[380px]:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] min-[380px]:text-xs flex items-center justify-center shrink-0 ${
                activeEventTab === 'occasions' 
                  ? 'bg-[#c25e00] font-extrabold text-white shadow-none' 
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              {isEn ? 'Occasions' : 'المناسبات'}
            </button>
            <button
              type="button"
              onClick={() => setActiveEventTab('wisdom')}
              className={`px-2.5 min-[380px]:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] min-[380px]:text-xs flex items-center justify-center shrink-0 ${
                activeEventTab === 'wisdom' 
                  ? 'bg-[#c25e00] font-extrabold text-white shadow-none' 
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              {isEn ? 'Wisdom' : 'حكمة اليوم'}
            </button>
            <button
              type="button"
              onClick={() => setActiveEventTab('memory')}
              className={`px-2.5 min-[380px]:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] min-[380px]:text-xs flex items-center justify-center shrink-0 ${
                activeEventTab === 'memory' 
                  ? 'bg-[#c25e00] font-extrabold text-white shadow-none' 
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              {isEn ? 'Islamic Memory' : 'ذاكرة الإسلام'}
            </button>
            <button
              type="button"
              onClick={() => setActiveEventTab('event')}
              className={`px-2.5 min-[380px]:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] min-[380px]:text-xs flex items-center justify-center shrink-0 ${
                activeEventTab === 'event' 
                  ? 'bg-[#c25e00] font-extrabold text-white shadow-none' 
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              {isEn ? 'Event of the Day' : 'حدث اليوم'}
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
              <span className="text-xs sm:text-sm font-bold text-[#451A03] font-cairo">
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
              <span className="text-xs sm:text-sm font-bold text-[#451A03] font-cairo">
                {isEn ? currentHistoryMemoryEvent.titleEn : currentHistoryMemoryEvent.titleAr}
              </span>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-[#3B1703] line-clamp-3">
                {isEn ? currentHistoryMemoryEvent.descriptionEn : currentHistoryMemoryEvent.descriptionAr}
              </p>
            </div>
          )}

          {activeEventTab === 'occasions' && currentOccasion && (
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-bold text-[#451A03] font-cairo">
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
            className="flex items-center gap-1.5 text-xs font-bold text-[#78350F] hover:text-[#451A03] active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
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

      {/* 7 & 8. بطاقة مدمجة: شارك التطبيق | تصفح التطبيق | الدعم الفني */}
      <div className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all">
        {/* شريط التبويبات الثلاثة السفلية */}
        <div className="grid grid-cols-3 gap-1 mb-4 py-0.5">
          <button
            type="button"
            onClick={() => setActiveBottomCardTab('share')}
            className={`py-1.5 px-1 rounded-full text-[11px] sm:text-xs font-bold font-cairo flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeBottomCardTab === 'share'
                ? 'bg-[#c25e00] text-white font-extrabold shadow-none'
                : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
            }`}
          >
            <span>{isEn ? 'Share App' : 'شارك التطبيق'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomCardTab('browse')}
            className={`py-1.5 px-1 rounded-full text-[11px] sm:text-xs font-bold font-cairo flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeBottomCardTab === 'browse'
                ? 'bg-[#c25e00] text-white font-extrabold shadow-none'
                : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
            }`}
          >
            <span>{isEn ? 'Browse App' : 'تصفح التطبيق'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomCardTab('support')}
            className={`py-1.5 px-1 rounded-full text-[11px] sm:text-xs font-bold font-cairo flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeBottomCardTab === 'support'
                ? 'bg-[#c25e00] text-white font-extrabold shadow-none'
                : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
            }`}
          >
            <span>{isEn ? 'Tech Support' : 'الدعم الفني'}</span>
          </button>
        </div>

        {/* محتوى التبويب الأول: شارك التطبيق */}
        {activeBottomCardTab === 'share' && (
          <div className="space-y-3 animate-fadeIn">
            {/* المربع القرآني */}
            <div className="w-full p-3.5 rounded-2xl golden-3d-inset text-center flex flex-col items-center gap-1">
              <p className="font-cairo text-sm sm:text-base font-bold text-[#451A03]">
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
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-1 text-emerald-700 dark:text-emerald-400">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h4 className="font-cairo text-sm sm:text-base font-bold text-[#451A03]">
                {isEn ? 'Direct Support & Suggestions' : 'للتواصل المباشر والاقتراحات'}
              </h4>
              <p className="text-xs font-bold text-amber-900 font-cairo">
                {isEn ? 'Alaa Ahmed' : 'علاء أحمد'}
              </p>
              <p className="text-[11px] font-mono font-bold text-amber-800/80 dir-ltr">
                +966 59 216 6023
              </p>
            </div>

            {/* زر فتح تطبيق الواتساب وبدء المحادثة مباشرة باللون الذهبي */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  window.open('https://wa.me/966592166023', '_blank');
                }}
                className="w-full py-3 px-4 rounded-2xl golden-3d-btn font-extrabold text-xs sm:text-sm text-white flex items-center justify-center gap-2 active:scale-98 transition-all font-cairo cursor-pointer shadow-none"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0 text-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>{isEn ? 'Start WhatsApp Chat' : 'محادثة عبر الواتساب'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* الدعاء في الأسفل */}
      <div className="flex items-center justify-center gap-2 mt-1 mb-0.5 px-4" dir={dir}>
        <p 
          className="text-sm font-black font-cairo leading-tight text-center relative z-10" 
          style={{ 
            color: '#78350F',
            fontFamily: "'Cairo', sans-serif",
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(180, 83, 9, 0.15)'
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

export default ModernHomeView;
