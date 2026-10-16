
import React, { useState, useEffect, useRef } from 'react';
import ThemesSidebar from '../components/MainMenu/ThemesSidebar';
import { useTheme } from '../context/ThemeContext';
import WhatsAppButton from '../components/WhatsAppButton';
import InteractiveBackground from '../components/InteractiveBackground';
import { verses } from '../data/mainMenuData';
import MenuCustomizationModal from '../components/MenuCustomizationModal';
import PasscodeModal from '../components/PasscodeModal';
import { registerBackInterceptor } from '../hooks/useBackButton';
import VerseSection from '../components/MainMenu/VerseSection';
import TitleSection from '../components/MainMenu/TitleSection';
import GridSection from '../components/MainMenu/GridSection';
import VerseContextMenu from '../components/MainMenu/VerseContextMenu';
import { Palette } from 'lucide-react';
import { useVoiceControl } from '../context/VoiceControlContext';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { prayerNamesAr } from '../data/prayerTimesData';
import { quranData as rawQuranData } from '../utils/quranData';
import { SURAH_NAMES_AR, toArabic } from '../components/QuranReader/constants';
import { ON_THIS_DAY_EVENTS } from '../data/onThisDayEvents';
import { shareAsImage } from '../utils/shareAsImage';
import { motion, AnimatePresence } from 'framer-motion';
import { Share as CapacitorShare } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import moment from 'moment-hijri';
import TopLeadersCard from '../components/MainMenu/TopLeadersCard';
import HabitTrackerCard from '../components/MainMenu/HabitTrackerCard';
import TawafCounterCard from '../components/MainMenu/TawafCounterCard';

const ISLAMIC_EVENTS = [
    { day: 1, month: 1, name: "رأس السنة الهجرية" },
    { day: 10, month: 1, name: "يوم عاشوراء" },
    { day: 12, month: 3, name: "المولد النبوي الشريف" },
    { day: 27, month: 7, name: "الإسراء والمعراج" },
    { day: 15, month: 8, name: "النصف من شعبان" },
    { day: 1, month: 9, name: "أول أيام شهر رمضان" },
    { day: 27, month: 9, name: "ليلة القدر" },
    { day: 1, month: 10, name: "عيد الفطر المبارك" },
    { day: 9, month: 12, name: "يوم عرفة" },
    { day: 10, month: 12, name: "عيد الأضحى المبارك" }
];

const HIJRI_MONTHS = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
const GREGORIAN_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const APP_SHARE_TEXT = `🕋✨ التحديث الأكبر لتطبيق "مصحف أحمد وليلى"! ✨🕋
(تطبيقك الإسلامي الشامل — يعمل بدون إنترنت وبدون إعلانات)

نسعد بأن نضع بين أيديكم إصداراً جديداً كلياً يجمع بين روعة التلاوة وروح التنافس في الخيرات، مع صفحات وميزات حصرية أُضيفت خصيصاً لترافق يومك الإيماني:

🚀 أبرز ما تم إضافته في هذا التحديث:
🏆 صفحة أهل القرآن: لوحة المتصدرين وترتيب القرّاء؛ لمتابعة إحصائيات تلاوتك وتنافس إيماني مبارك في قراءة وختم القرآن الكريم شهرياً وتراكمياً.
💬 صفحة مجتمع التواصل: ملتقى إيماني للتواصل الأخوي ومجموعات النقاش الهادف والتواصي بالحق.
🛡️ صفحة الرقية الشرعية: رقية شرعية كاملة وشاملة من القرآن الكريم والسنة النبوية للتحصين والشفاء.
🌐 صفحة مواقع إسلامية: دليل متكامل لأوثق المواقع والمنصات الإسلامية للفتوى والبحث الشرعي.

🌟 بجانب ميزاتك المفضلة:
(المصحف الشريف كاملاً • حصن المسلم والأذكار • مواقيت الصلاة والقبلة • الورد اليومي والتحفيظ • التحكم الصوتي • مربي العبادات • الحاسبة الشرعية • الأربعون النووية).

📥 حمّل التطبيق الآن أو حدّثه عبر متجر Google Play:
👉 https://play.google.com/store/apps/details?id=com.AhmedLaila.Quran

🤍 شاركه مع أهلك وأصحابك.. فالدال على الخير كفاعله، واجعله صدقة جارية لك ولوالديك. 🤲🌱`;

const CURRENT_LAYOUT_VERSION = 'v2026_row8_seerah_bar_v4';

const ALL_POSSIBLE_ITEMS = [
    // الصف الاول : بطاقه القران الكريم + بطاقه الاستماع للقران باللون الاخضر
    { id: 'quran', label: "القرآن الكريم", className: "col-span-3 h-11", colorIndex: 0 },
    { id: 'listen', label: "الاستماع للقرآن", className: "col-span-3 h-11", colorIndex: 0 },
    // الصف الثانى : بطاقه مواقيت الصلاه + القبله + اذكار الصلاه باللون الاخضر
    { id: 'prayer-times', label: "مواقيت الصلاة", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'qibla', label: "القبلة", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'salah-adhkar', label: "أذكار الصلاة", className: "col-span-2 h-11", colorIndex: 0 },
    // الصف الثالث : بطاقه الادعيه + حصن المسلم + الاذكار باللون البنفسجى
    { id: 'adia', label: "الأدعية", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'hisn-muslim', label: "حصن المسلم", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'sabah-masaa', label: "الأذكار", className: "col-span-2 h-11", colorIndex: 1 },
    // الصف الرابع : بطاقه التقويم + الحج والعمرة + السبحه باللون البنفسجى
    { id: 'calendar', label: "التقويم", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'hajj-umrah', label: "الحج والعمرة", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'tasbeeh', label: "السبحة", className: "col-span-2 h-11", colorIndex: 1 },
    // الصف الخامس : مجتمع التواصل + اهل القران باللون الاخضر
    { id: 'community', label: "مجتمع التواصل", className: "col-span-3 h-11", colorIndex: 0 },
    { id: 'ahl-al-quran', label: "أهل القرآن", className: "col-span-3 h-11", colorIndex: 0 },
    // الصف السادس : الورد اليومى + التحفيظ + مربى العبادات باللون البنفسجى
    { id: 'daily-wird', label: "الورد اليومي", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'memorization', label: "التحفيظ", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'habit-tracker', label: "مربّي العبادات", className: "col-span-2 h-11", colorIndex: 1 },
    // الصف السابع : الرقيه الشرعيه + مواقع اسلاميه + الحاسبه الشرعيه باللون البنفسجى
    { id: 'others', label: "الرقية الشرعية", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'islamic-sites', label: "مواقع إسلامية", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'calculators', label: "الحاسبة الشرعية", className: "col-span-2 h-11", colorIndex: 1 },
    // الصف الثامن : الاربعون النوويه + التحكم الصوتى + اسماء الله الحسنى باللون الأخضر
    { id: 'nawawi', label: "الأربعون النووية", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'voice-control', label: "التحكم الصوتي", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'asmaul-husna', label: "أسماء الله الحسنى", className: "col-span-2 h-11", colorIndex: 0 },
    // صف السيرة والخط الزمني مع أيقونات مجتمع التواصل وأهل القرآن والواتساب والتحكم الصوتي
    { id: 'prophetic-seerah', label: "السيرة والخط الزمني", className: "col-span-6 h-10 flex justify-center", colorIndex: 0 },
];

const DEFAULT_MENU_ITEMS = [
    // الصف الاول : بطاقه القران الكريم + بطاقه الاستماع للقران باللون الاخضر
    { id: 'quran', label: "القرآن الكريم", className: "col-span-3 h-11", colorIndex: 0 },
    { id: 'listen', label: "الاستماع للقرآن", className: "col-span-3 h-11", colorIndex: 0 },
    // الصف الثانى : بطاقه مواقيت الصلاه + القبله + اذكار الصلاه باللون الاخضر
    { id: 'prayer-times', label: "مواقيت الصلاة", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'qibla', label: "القبلة", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'salah-adhkar', label: "أذكار الصلاة", className: "col-span-2 h-11", colorIndex: 0 },
    // الصف الثالث : بطاقه الادعيه + حصن المسلم + الاذكار باللون البنفسجى
    { id: 'adia', label: "الأدعية", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'hisn-muslim', label: "حصن المسلم", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'sabah-masaa', label: "الأذكار", className: "col-span-2 h-11", colorIndex: 1 },
    // الصف الرابع : بطاقه التقويم + الحج والعمرة + السبحه باللون البنفسجى
    { id: 'calendar', label: "التقويم", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'hajj-umrah', label: "الحج والعمرة", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'tasbeeh', label: "السبحة", className: "col-span-2 h-11", colorIndex: 1 },
    // الصف الخامس : مجتمع التواصل + اهل القران باللون الاخضر
    { id: 'community', label: "مجتمع التواصل", className: "col-span-3 h-11", colorIndex: 0 },
    { id: 'ahl-al-quran', label: "أهل القرآن", className: "col-span-3 h-11", colorIndex: 0 },
    // الصف السادس : الورد اليومى + التحفيظ + مربى العبادات باللون البنفسجى
    { id: 'daily-wird', label: "الورد اليومي", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'memorization', label: "التحفيظ", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'habit-tracker', label: "مربّي العبادات", className: "col-span-2 h-11", colorIndex: 1 },
    // الصف السابع : الرقيه الشرعيه + مواقع اسلاميه + الحاسبه الشرعيه باللون البنفسجى
    { id: 'others', label: "الرقية الشرعية", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'islamic-sites', label: "مواقع إسلامية", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'calculators', label: "الحاسبة الشرعية", className: "col-span-2 h-11", colorIndex: 1 },
    // الصف الثامن : الاربعون النوويه + التحكم الصوتى + اسماء الله الحسنى باللون الأخضر
    { id: 'nawawi', label: "الأربعون النووية", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'voice-control', label: "التحكم الصوتي", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'asmaul-husna', label: "أسماء الله الحسنى", className: "col-span-2 h-11", colorIndex: 0 },
    // صف السيرة والخط الزمني مع أيقونات مجتمع التواصل وأهل القرآن والواتساب والتحكم الصوتي باللون الأخضر
    { id: 'prophetic-seerah', label: "السيرة والخط الزمني", className: "col-span-6 h-10 flex justify-center", colorIndex: 0 },
];

function MainMenu({ onNavigate, onOpenThemes, onOpenSideMenu }) {
  const { showVoiceIcon } = useVoiceControl();
  const [currentVerse] = useState(() => {
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
  });
  const { theme, themeKey } = useTheme();
  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const cardHeaderColor = isBlackTheme ? '#FFFFFF' : theme.palette[0];
  const cardBorderColor = isBlackTheme ? '#FFFFFF' : theme.palette[0];
  const cardButtonColor = isBlackTheme ? '#FFFFFF' : theme.palette[0];
  const cardButtonTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
  const [visibleItems, setVisibleItems] = useState<string[]>(() => {
    const savedVersion = localStorage.getItem('menu_layout_version_v2');
    if (savedVersion !== CURRENT_LAYOUT_VERSION) {
        return DEFAULT_MENU_ITEMS.map(i => i.id);
    }
    const savedVisible = localStorage.getItem('visibleMenuItems');
    if (savedVisible) {
        try {
            return JSON.parse(savedVisible);
        } catch (e) {
            return DEFAULT_MENU_ITEMS.map(i => i.id);
        }
    }
    return DEFAULT_MENU_ITEMS.map(i => i.id);
  });
  const [menuItems, setMenuItems] = useState(() => {
    const savedVersion = localStorage.getItem('menu_layout_version_v2');
    if (savedVersion !== CURRENT_LAYOUT_VERSION) {
        localStorage.setItem('menu_layout_version_v2', CURRENT_LAYOUT_VERSION);
        localStorage.setItem('menuLayout', JSON.stringify(DEFAULT_MENU_ITEMS));
        localStorage.setItem('visibleMenuItems', JSON.stringify(DEFAULT_MENU_ITEMS.map(i => i.id)));
        return DEFAULT_MENU_ITEMS;
    }
    const savedLayout = localStorage.getItem('menuLayout');
    if (savedLayout) {
        try {
            return JSON.parse(savedLayout);
        } catch (e) {
            return DEFAULT_MENU_ITEMS;
        }
    }
    return DEFAULT_MENU_ITEMS;
  });
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isThemesSidebarOpen, setIsThemesSidebarOpen] = useState(false);
  const [verseFontSize, setVerseFontSize] = useState(() => {
      const saved = localStorage.getItem('mainMenuVerseFontSize');
      return saved ? parseFloat(saved) : 1.15;
  });
  const [verseSettings, setVerseSettings] = useState(() => {
      const saved = localStorage.getItem('mainMenuVerseSettings');
      return saved ? JSON.parse(saved) : {
          fontFamily: theme.font,
          bgColor: 'transparent',
          textColor: theme.textColor
      };
  });
  const [isVerseMenuOpen, setIsVerseMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isTitleSticky, setIsTitleSticky] = useState(false);
  const verseSectionRef = useRef<HTMLDivElement>(null);
  const prayerCardRef = useRef<HTMLDivElement>(null);
  const [hideIconsOnScroll, setHideIconsOnScroll] = useState(false);
  const buttonThresholdRef = useRef<number | null>(null);

  const PREDEFINED_COLORS = [
      '#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#000000',
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f43f5e', '#78716c', '#57534e', 'transparent'
  ];

  const renderCheckerboard = (color: string) => {
      if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
          return {
              backgroundColor: '#ffffff',
              backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)',
              backgroundSize: '8px 8px'
          };
      }
      return { backgroundColor: color };
  };

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage('');
    }, 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      const guideBtn = document.getElementById('guide-help-btn');
      const themesBtn = document.getElementById('themes-btn');
      if (guideBtn) {
        const gRect = guideBtn.getBoundingClientRect();
        if (gRect.height > 0) buttonThresholdRef.current = gRect.bottom + 6;
      } else if (themesBtn) {
        const tRect = themesBtn.getBoundingClientRect();
        if (tRect.height > 0) buttonThresholdRef.current = tRect.bottom + 48;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveVerseSettings = (newSettings: any) => {
      setVerseSettings(newSettings);
      localStorage.setItem('mainMenuVerseSettings', JSON.stringify(newSettings));
  };

  const { times, nextPrayer, countdown } = usePrayerTimes();
  
  const [lastReadAyah, setLastReadAyah] = useState<{ s: number, a: number, text: string, surahName: string } | null>(null);

  const [onThisDayEvent, setOnThisDayEvent] = useState<{ text: string, year: number, dateStr: string } | null>(null);
  const [onThisDayIndex, setOnThisDayIndex] = useState(0);
  const [onThisDayList, setOnThisDayList] = useState<{ text: string, year: number }[]>([]);
  const [showExpandedEventsModal, setShowExpandedEventsModal] = useState(false);
  const [showExpandedUpcomingEventModal, setShowExpandedUpcomingEventModal] = useState(false);

  const [upcomingEvents, setUpcomingEvents] = useState<{name: string, dateStr: string, gregorianDateStr: string, daysRemaining: number, isToday: boolean}[]>([]);
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
      // calculate Islamic events for the current Hijri year cycle
      const today = moment().startOf('day');
      const currentHijriYear = today.iYear();
      
      let allCycleEvents: any[] = [];
      
      // We want to show events in a way that includes some past and mostly future
      // Actually, let's just take all 10 events for the current Hijri year
      ISLAMIC_EVENTS.forEach(event => {
          const eventDate = moment(`${currentHijriYear}-${event.month}-${event.day}`, 'iYYYY-iM-iD').startOf('day');
          const diff = eventDate.diff(today, 'days');
          allCycleEvents.push({ ...event, date: eventDate, diff });
      });

      // Sort by Hijri date (month then day)
      allCycleEvents.sort((a, b) => {
          if (a.month !== b.month) return a.month - b.month;
          return a.day - b.day;
      });

      const formattedEvents = allCycleEvents.map(ev => ({
          name: ev.name,
          dateStr: `${toArabic(ev.date.iDate())} ${HIJRI_MONTHS[ev.date.iMonth()]} ${toArabic(ev.date.iYear())} هـ`,
          gregorianDateStr: `${toArabic(ev.date.date())} ${GREGORIAN_MONTHS[ev.date.month()]} ${toArabic(ev.date.year())} م`,
          daysRemaining: ev.diff,
          isToday: ev.diff === 0
      }));

      setUpcomingEvents(formattedEvents);

      // Find the first event that is today or in the future
      let initialIndex = formattedEvents.findIndex(ev => ev.daysRemaining >= 0);
      if (initialIndex === -1) initialIndex = 0; // If all passed, start at 0
      setEventIndex(initialIndex);
  }, []);

  useEffect(() => {
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const key = `${mm}-${dd}`;
      const formatter = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      const dateStr = formatter.format(today);

      let events = ON_THIS_DAY_EVENTS[key] || [];

      let stored = null;
      try { stored = JSON.parse(localStorage.getItem('on_this_day_state') || 'null'); } catch(e){}

      let startIndex = 0;
      if (stored && stored.key === key) {
          startIndex = (stored.index + 1) % Math.max(1, events.length);
      } else if (events.length > 0) {
          startIndex = Math.floor(Math.random() * events.length);
      }

      if (events.length > 0) {
          setOnThisDayList(events);
          setOnThisDayIndex(startIndex);
          setOnThisDayEvent({ ...events[startIndex], dateStr });
      }
      localStorage.setItem('on_this_day_state', JSON.stringify({ key, index: startIndex }));
  }, []);

  const handleNextEvent = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const formatter = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      const dateStr = formatter.format(today);

      if (navigator.onLine && onThisDayIndex >= onThisDayList.length - 1) {
          try {
              const res = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/ar/onthisday/events/${mm}/${dd}`);
              const data = await res.json();
              if (data && data.events && data.events.length > onThisDayList.length) {
                  const newEvents = data.events.map((e: any) => ({ year: e.year || 0, text: e.text }));
                  setOnThisDayList(newEvents);
                  const newIndex = onThisDayList.length;
                  setOnThisDayIndex(newIndex);
                  setOnThisDayEvent({ ...newEvents[newIndex], dateStr });
                  localStorage.setItem('on_this_day_state', JSON.stringify({ key: `${mm}-${dd}`, index: newIndex }));
                  return;
              }
          } catch (e) {
              console.error(e);
          }
      }

      const nextIndex = (onThisDayIndex + 1) % Math.max(1, onThisDayList.length);
      setOnThisDayIndex(nextIndex);
      if (onThisDayList[nextIndex]) {
          setOnThisDayEvent({ ...onThisDayList[nextIndex], dateStr });
          localStorage.setItem('on_this_day_state', JSON.stringify({ key: `${mm}-${dd}`, index: nextIndex }));
      }
  };

  const handleShareHighlight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onThisDayEvent) return;

    await shareAsImage({ 
      text: onThisDayEvent.text, 
      source: `حدث في مثل هذا اليوم - ${onThisDayEvent.year}م`, 
      category: onThisDayEvent.dateStr, 
      theme, 
      setToastMessage 
    });
  };

  const handleCopyHighlight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onThisDayEvent) return;
    const textToCopy = `${onThisDayEvent.dateStr}\nفي عام ${onThisDayEvent.year} ميلادي\n${onThisDayEvent.text}`;
    try {
        await navigator.clipboard.writeText(textToCopy);
        setToastMessage('تم النسخ إلى الحافظة');
        setTimeout(() => setToastMessage(''), 2000);
    } catch (err) {
        console.error('Clipboard error:', err);
        setToastMessage('فشل في النسخ');
        setTimeout(() => setToastMessage(''), 2000);
    }
  };

  const handleShareUpcomingEvent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (upcomingEvents.length === 0) return;

    const event = upcomingEvents[eventIndex];
    let diffText = '';
    if (event.isToday) {
        diffText = 'اليوم';
    } else if (event.daysRemaining > 0) {
        diffText = `المتبقي: ${toArabic(event.daysRemaining)} يوم`;
    } else {
        diffText = `مر عليها: ${toArabic(Math.abs(event.daysRemaining))} يوم`;
    }

    await shareAsImage({ 
      text: `المناسبة: ${event.name}\n${diffText}`, 
      source: event.gregorianDateStr, 
      category: event.dateStr, 
      theme, 
      setToastMessage 
    });
  };

  const handleCopyUpcomingEvent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (upcomingEvents.length === 0) return;
    const event = upcomingEvents[eventIndex];
    let diffText = '';
    if (event.isToday) {
        diffText = 'اليوم';
    } else if (event.daysRemaining > 0) {
        diffText = `المتبقي: ${toArabic(event.daysRemaining)} يوم`;
    } else {
        diffText = `مر عليها: ${toArabic(Math.abs(event.daysRemaining))} يوم`;
    }

    const textToCopy = `المناسبة الإسلامية: ${event.name}\nالتاريخ الهجري: ${event.dateStr}\nالتاريخ الميلادي: ${event.gregorianDateStr}\n${diffText}`;
    try {
        await navigator.clipboard.writeText(textToCopy);
        setToastMessage('تم النسخ إلى الحافظة');
        setTimeout(() => setToastMessage(''), 2000);
    } catch (err) {
        console.error('Clipboard error:', err);
        setToastMessage('فشل في النسخ');
        setTimeout(() => setToastMessage(''), 2000);
    }
  };

  useEffect(() => {
    const updateLastRead = () => {
      try {
          const globalStr = localStorage.getItem('last_read_ayah_global');
          const vStr = localStorage.getItem('last_pos_v');
          const hStr = localStorage.getItem('last_pos_h');
          
          let target = null;
          if (globalStr) {
              target = JSON.parse(globalStr);
          } else {
              const v = vStr ? JSON.parse(vStr) : null;
              const h = hStr ? JSON.parse(hStr) : null;
              target = v || h;
          }

          if (target && target.s && target.a) {
              const { s, a } = target;
              const surah = rawQuranData.surahs[s - 1];
              if (surah) {
                  const ayah = surah.ayahs.find((ay: any) => ay.numberInSurah === a);
                  if (ayah) {
                      let text = ayah.text.replace(/۞/g, '');
                      if (s !== 1 && s !== 9 && a === 1) {
                          text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
                      }
                      setLastReadAyah({ s, a, text, surahName: SURAH_NAMES_AR[s - 1] });
                  }
              }
          }
      } catch (e) {
          console.error("Error loading last read ayah", e);
      }
    };

    updateLastRead();
    window.addEventListener('storage', updateLastRead);
    window.addEventListener('last_read_update', updateLastRead);
    return () => {
      window.removeEventListener('storage', updateLastRead);
      window.removeEventListener('last_read_update', updateLastRead);
    };
  }, []);

  // --- Logic to determine Previous and Next "Salah" (excluding Sunrise) ---
  const getSalahStats = () => {
    if (!nextPrayer || !times || Object.keys(times).length === 0) {
      return { prev: '-', next: '-', remaining: '--:--:--' };
    }

    const salahKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let nextIndex = salahKeys.indexOf(nextPrayer.key);
    
    // If nextPrayer is Sunrise, the next ACTUAL salah is Dhuhr (index 1)
    if (nextPrayer.key === 'Sunrise') {
      nextIndex = 1; 
    }

    const prevIndex = (nextIndex - 1 + salahKeys.length) % salahKeys.length;
    const actualNextIndex = nextIndex % salahKeys.length;

    return {
      prev: prayerNamesAr[salahKeys[prevIndex] as keyof typeof prayerNamesAr],
      next: prayerNamesAr[salahKeys[actualNextIndex] as keyof typeof prayerNamesAr],
      remaining: countdown
    };
  };

  const { prev: prevSalah, next: nextSalah, remaining: prayerCountdown } = getSalahStats();

  useEffect(() => {
    const savedVersion = localStorage.getItem('menu_layout_version_v2');
    if (savedVersion !== CURRENT_LAYOUT_VERSION) {
        localStorage.setItem('menu_layout_version_v2', CURRENT_LAYOUT_VERSION);
        localStorage.setItem('menuLayout', JSON.stringify(DEFAULT_MENU_ITEMS));
        localStorage.setItem('visibleMenuItems', JSON.stringify(DEFAULT_MENU_ITEMS.map(i => i.id)));
        setMenuItems(DEFAULT_MENU_ITEMS);
        setVisibleItems(DEFAULT_MENU_ITEMS.map(i => i.id));
    }
  }, []);

  const handleCancelEdit = () => {
      const savedLayout = localStorage.getItem('menuLayout');
      if (savedLayout) {
          setMenuItems(JSON.parse(savedLayout));
      } else {
          setMenuItems(DEFAULT_MENU_ITEMS);
      }
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  useEffect(() => {
      const interceptor = () => {
          if (isThemesSidebarOpen) {
              setIsThemesSidebarOpen(false);
              return true;
          }
          if (showExpandedEventsModal) {
              setShowExpandedEventsModal(false);
              return true;
          }
          if (showExpandedUpcomingEventModal) {
              setShowExpandedUpcomingEventModal(false);
              return true;
          }
          if (isVerseMenuOpen) {
              setIsVerseMenuOpen(false);
              return true;
          }
          if (isPasscodeOpen) {
              setIsPasscodeOpen(false);
              return true;
          }
          if (isCustomizationOpen) {
              setIsCustomizationOpen(false);
              return true;
          }
          if (isEditMode) {
              handleCancelEdit();
              return true;
          }
          return false;
      };
      const unregister = registerBackInterceptor(interceptor);
      return unregister;
  }, [isThemesSidebarOpen, isCustomizationOpen, isEditMode, showExpandedEventsModal, showExpandedUpcomingEventModal, isPasscodeOpen, isVerseMenuOpen]);

  const handleSaveCustomization = (selectedIds: string[]) => {
      setVisibleItems(selectedIds);
      localStorage.setItem('visibleMenuItems', JSON.stringify(selectedIds));
  };

  const handleSaveLayout = () => {
      localStorage.setItem('menuLayout', JSON.stringify(menuItems));
      setIsEditMode(false);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleResetLayout = () => {
      setMenuItems(DEFAULT_MENU_ITEMS);
      localStorage.setItem('menu_layout_version_v2', CURRENT_LAYOUT_VERSION);
      localStorage.setItem('menuLayout', JSON.stringify(DEFAULT_MENU_ITEMS));
      localStorage.setItem('visibleMenuItems', JSON.stringify(DEFAULT_MENU_ITEMS.map(i => i.id)));
      setVisibleItems(DEFAULT_MENU_ITEMS.map(i => i.id));
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div className="relative">
      <InteractiveBackground />

      {/* زر الثيمات العائم الدائري بوضع التباين العالي (mix-blend-mode) لضمان ظهوره دائماً */}
      {/* زر الثيمات العائم الشفاف - يختفي تماماً عند فتح قائمة الثيمات أو عند وصول بطاقة الصلوات بمحاذاته */}
      <button 
        id="themes-btn"
        data-id="theme-toggle-button"
        type="button"
        onClick={() => setIsThemesSidebarOpen(prev => !prev)}
        className={`fixed top-[calc(env(safe-area-inset-top,20px)+44px)] right-3 z-[1260] w-[35px] h-[35px] flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-110 bg-transparent cursor-pointer group ${
          (isThemesSidebarOpen || hideIconsOnScroll) ? 'opacity-0 pointer-events-none scale-0 invisible' : 'opacity-100 scale-100 visible'
        }`}
        style={{
          color: isBlackTheme
            ? '#FFFFFF'
            : (theme.palette?.[2] && theme.palette[2] !== theme.palette[0] && theme.palette[2] !== theme.palette[1]) 
              ? theme.palette[2] 
              : (theme.accent && theme.accent !== theme.palette[0] && theme.accent !== theme.palette[1]) 
                ? theme.accent 
                : (theme.isDark ? '#FFFFFF' : '#000000')
        }}
        title="الثيمات والمظهر"
        aria-label="الثيمات والمظهر"
      >
        <Palette className="w-[21px] h-[21px] transition-transform group-hover:rotate-12" />
      </button>

      <div className="h-screen w-full flex flex-col overflow-hidden">
        {/* شريط تغطية منطقة شريط الحالة العلوية للهاتف عند تثبيت اسم التطبيق */}
        <div 
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-35 pointer-events-none transition-colors duration-150"
          style={{
            height: 'env(safe-area-inset-top, 0px)',
            backgroundColor: isTitleSticky ? (theme.bgColor || (theme.isDark ? '#000000' : '#ffffff')) : 'transparent'
          }}
        />
        <div 
          ref={scrollContainerRef}
          onScroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            const verseHeight = verseSectionRef.current ? verseSectionRef.current.offsetHeight : 65;
            const sticky = scrollTop >= (verseHeight - 2);
            if (sticky !== isTitleSticky) {
              setIsTitleSticky(sticky);
            }

            // إخفاء وإعادة إظهار أزرار الثيمات ودليل الصفحات عند محاذاة صف زر القرآن الكريم
            const quranRowEl = document.getElementById('menu-item-quran') || document.querySelector('[data-item-id="quran"]') || document.getElementById('grid-section');
            if (quranRowEl) {
              const rect = quranRowEl.getBoundingClientRect();
              const guideBtn = document.getElementById('guide-help-btn');
              const themesBtn = document.getElementById('themes-btn');

              // حفظ موقع الأزرار قبل الاختفاء لتفادي تأثر القياس بالتصغير scale-0
              if (!hideIconsOnScroll) {
                if (guideBtn) {
                  const gRect = guideBtn.getBoundingClientRect();
                  if (gRect.height > 0) {
                    buttonThresholdRef.current = gRect.bottom + 6;
                  }
                } else if (themesBtn) {
                  const tRect = themesBtn.getBoundingClientRect();
                  if (tRect.height > 0) {
                    buttonThresholdRef.current = tRect.bottom + 48;
                  }
                }
              }

              const threshold = buttonThresholdRef.current ?? 135;
              const shouldHide = rect.top <= threshold;
              if (shouldHide !== hideIconsOnScroll) {
                setHideIconsOnScroll(shouldHide);
                window.dispatchEvent(new CustomEvent('header_icons_visibility', { detail: { hide: shouldHide } }));
              }
            }
          }}
          className="flex-1 overflow-y-auto pb-6 no-scrollbar"
        >
          <div className="main-layout px-4 flex flex-col" style={{ fontFamily: theme.font }}>
              
              <div id="verse-section" ref={verseSectionRef}>
                <VerseSection 
                    currentVerse={currentVerse}
                    verseFontSize={verseFontSize}
                    theme={theme}
                    verseSettings={verseSettings}
                />
              </div>

              <TitleSection 
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                  handleSaveLayout={handleSaveLayout}
                  handleResetLayout={handleResetLayout}
                  handleCancelEdit={handleCancelEdit}
                  theme={theme}
                  themeKey={themeKey}
                  onOpenSideMenu={onOpenSideMenu}
                  isSticky={isTitleSticky}
              />

              <div id="grid-section">
                <GridSection 
                    menuItems={menuItems}
                    setMenuItems={setMenuItems}
                    visibleItems={visibleItems}
                    isEditMode={isEditMode}
                    onNavigate={(id) => {
                        onNavigate(id, { from: 'home' });
                    }}
                    theme={theme}
                    themeKey={themeKey}
                    DEFAULT_MENU_ITEMS={DEFAULT_MENU_ITEMS}
                />
              </div>

              {/* Footer/Save Button */}
              {!isEditMode && (
                  <div className="flex flex-col gap-2 w-full max-w-sm mx-auto mt-1 mb-4">
                      {/* Prayer Status Cards */}
                      <div 
                          ref={prayerCardRef}
                          id="main-prayer-status-card"
                          className="p-2 rounded-2xl shadow-lg border-2 transition-all duration-300" 
                          style={{ borderColor: cardBorderColor, backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)' }}
                      >
                          <div className="grid grid-cols-3 gap-2">
                           {/* Right Card: Previous Prayer */}
                           <div className="themed-card py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-sm border-2 transition-all" 
                                style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.3)' : `${theme.palette[0]}33` }}>
                               <span className="text-[10px] opacity-70 font-bold mb-0.5">السابقة</span>
                               <span className="text-base font-black truncate w-full" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>{prevSalah}</span>
                           </div>

                           {/* Middle Card: Remaining Time */}
                           <div className="themed-card py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-md border-2 relative overflow-hidden" 
                                style={{ borderColor: cardBorderColor }}>
                               <span className="text-[10px] opacity-70 font-bold mb-0.5">متبقي</span>
                               <span className="text-base font-mono font-black tracking-wider" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>{prayerCountdown}</span>
                           </div>

                           {/* Left Card: Next Prayer */}
                           <div className="themed-card py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-sm border-2 transition-all"
                                style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.3)' : `${theme.palette[0]}33` }}>
                               <span className="text-[10px] opacity-70 font-bold mb-0.5">القادمة</span>
                               <span className="text-base font-black truncate w-full" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>{nextSalah}</span>
                           </div>
                          </div>
                      </div>

                      {/* بطاقة عداد الطواف والسعي - تظهر تحت بطاقة الصلاة مباشرة عند تفعيلها */}
                      <TawafCounterCard 
                          theme={theme}
                          onNavigate={onNavigate}
                      />

                      {/* بطاقة متصدري أهل القرآن (المراكز الثلاثة الأولى) */}
                      <TopLeadersCard 
                          theme={theme}
                          onNavigate={onNavigate}
                          setToastMessage={setToastMessage}
                      />

                      {/* بطاقة مربي العبادات (إنجاز اليوم وملخص الأيام السابقة بالنسبة المئوية) */}
                      <HabitTrackerCard
                          theme={theme}
                          onNavigate={onNavigate}
                      />

                      {/* On This Day Card */}
                      {onThisDayEvent && (
                          <div 
                              className="w-full mt-1 py-4 px-5 rounded-2xl shadow-lg border-2 relative overflow-hidden flex flex-col gap-3 cursor-pointer"
                              style={{ borderColor: cardBorderColor, backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)' }}
                              dir="rtl"
                              onClick={() => setShowExpandedEventsModal(true)}
                          >
                              <div className="flex items-center justify-between z-10 w-full relative">
                                  <div className="flex items-center gap-2" style={{ color: cardHeaderColor }}>
                                      <i className="fa-solid fa-calendar-day text-base"></i>
                                      <span className="text-[11px] font-bold font-kufi">حدث في مثل هذا اليوم</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <button 
                                          onClick={handleNextEvent}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="حدث آخر"
                                          style={{ color: cardHeaderColor }}
                                      >
                                          <i className="fa-solid fa-rotate-right text-xs"></i>
                                      </button>
                                      <button 
                                          onClick={handleCopyHighlight}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="نسخ"
                                          style={{ color: cardHeaderColor }}
                                      >
                                          <i className="fa-regular fa-copy text-xs"></i>
                                      </button>
                                      <button 
                                          onClick={handleShareHighlight}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="مشاركة"
                                          style={{ color: cardHeaderColor }}
                                      >
                                          <i className="fa-solid fa-share-nodes text-xs"></i>
                                      </button>
                                  </div>
                              </div>
                              <div className="flex flex-col gap-3 w-full relative z-10">
                                  <div className="flex flex-row items-center justify-center gap-3 w-full py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                                      <span className="text-[10px] font-bold opacity-80" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }}>{onThisDayEvent.dateStr}</span>
                                      <div className="w-[1px] h-4 bg-black/20 dark:bg-white/20"></div>
                                      <span className="text-base font-black font-kufi leading-none" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }}>{toArabic(onThisDayEvent.year)}</span>
                                      <div className="w-[1px] h-4 bg-black/20 dark:bg-white/20"></div>
                                      <span className="text-[10px] font-bold opacity-80" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }}>ميلادي</span>
                                  </div>
                                  <p className="text-sm text-justify leading-relaxed break-words font-hafs font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                                      {onThisDayEvent.text}
                                  </p>
                              </div>
                          </div>
                      )}

                      {/* Upcoming Islamic Event Card */}
                      {upcomingEvents.length > 0 && (
                          <div 
                              className="w-full mt-2 py-4 px-5 rounded-2xl shadow-lg border-2 relative overflow-hidden flex flex-col gap-3 cursor-pointer"
                              style={{ borderColor: cardBorderColor, backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)' }}
                              dir="rtl"
                              onClick={() => setShowExpandedUpcomingEventModal(true)}
                          >
                              <div className="flex items-center justify-between z-10 w-full relative mb-1.5">
                                  <div className="flex items-center gap-2" style={{ color: cardHeaderColor }}>
                                      <i className="fa-solid fa-moon text-base"></i>
                                      <span className="text-[11px] font-bold font-kufi">
                                          المناسبات الإسلامية
                                      </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              setEventIndex(prev => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
                                          }}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="المناسبة السابقة"
                                          style={{ color: cardHeaderColor }}
                                      >
                                          <i className="fa-solid fa-chevron-right text-xs"></i>
                                      </button>
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              setEventIndex(prev => (prev + 1) % upcomingEvents.length);
                                          }}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="المناسبة التالية"
                                          style={{ color: cardHeaderColor }}
                                      >
                                          <i className="fa-solid fa-chevron-left text-xs"></i>
                                      </button>
                                      <button 
                                          onClick={handleCopyUpcomingEvent}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="نسخ"
                                          style={{ color: cardHeaderColor }}
                                      >
                                          <i className="fa-regular fa-copy text-xs"></i>
                                      </button>
                                      <button 
                                          onClick={handleShareUpcomingEvent}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="مشاركة"
                                          style={{ color: cardHeaderColor }}
                                      >
                                          <i className="fa-solid fa-share-nodes text-xs"></i>
                                      </button>
                                  </div>
                              </div>
                              
                              <div className="flex flex-col gap-3 w-full relative z-10">
                                  {upcomingEvents[eventIndex] && (
                                      <div className="flex flex-col gap-2 w-full">
                                          <div className="flex flex-row items-center justify-center gap-2.5 w-full py-1.5 px-2 rounded-xl bg-black/5 dark:bg-white/5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                                              {upcomingEvents[eventIndex].isToday ? (
                                                  <span className="text-base font-black font-kufi leading-none" style={{ color: cardHeaderColor }}>اليوم</span>
                                              ) : (
                                                  <>
                                                      <span className="text-xs font-bold opacity-80" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }}>{upcomingEvents[eventIndex].daysRemaining > 0 ? 'باقي' : 'مر عليها'}</span>
                                                      <div className="w-[1px] h-3 bg-black/20 dark:bg-white/20"></div>
                                                      <span className="text-base font-black font-kufi leading-none" style={{ color: cardHeaderColor }}>
                                                          {toArabic(Math.abs(upcomingEvents[eventIndex].daysRemaining))}
                                                      </span>
                                                      <div className="w-[1px] h-3 bg-black/20 dark:bg-white/20"></div>
                                                      <span className="text-xs font-bold opacity-80" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }}>يوم</span>
                                                  </>
                                              )}
                                          </div>
                                          <div className="flex flex-col text-center gap-1" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                                              <p className="text-sm leading-tight break-words font-kufi font-bold">
                                                  {upcomingEvents[eventIndex].name}
                                              </p>
                                              <div className="flex flex-row items-center justify-center gap-2 opacity-60 text-[10px] font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }}>
                                                  <span>{upcomingEvents[eventIndex].dateStr}</span>
                                                  <span className="opacity-40">•</span>
                                                  <span>{upcomingEvents[eventIndex].gregorianDateStr}</span>
                                              </div>
                                          </div>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}

                      {/* Web App Link Card */}
                      <div 
                          className="w-full mt-3 py-2 px-3 rounded-2xl shadow-lg border-2 relative flex flex-col gap-1"
                          style={{ borderColor: cardBorderColor, backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)' }}
                          dir="rtl"
                      >
                          <div className="flex items-center gap-2 z-10 w-full relative" style={{ color: cardHeaderColor }}>
                              <i className="fa-solid fa-globe text-xs"></i>
                              <span className="text-[11px] font-bold font-kufi">تصفح التطبيق</span>
                          </div>
                          
                          <p className="text-sm font-bold opacity-80 leading-relaxed" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                              لمشاهدة التطبيق على المتصفح او الايفون اضغط على الرابط
                          </p>

                          <div className="flex items-center justify-center gap-3 mt-0.5">
                              <button 
                                  onClick={() => window.open('https://mushaf-ahmed-laila.vercel.app/', '_blank')}
                                  className="py-1.5 px-3 rounded-xl font-bold text-[10px] text-center flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                                  style={{ 
                                      backgroundColor: cardButtonColor, 
                                      color: cardButtonTextColor 
                                  }}
                              >
                                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                  <span>فتح الرابط</span>
                              </button>
                              
                              <button 
                                  onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                          await navigator.clipboard.writeText('https://mushaf-ahmed-laila.vercel.app/');
                                          setToastMessage('تم نسخ الرابط');
                                          setTimeout(() => setToastMessage(''), 2000);
                                      } catch (err) {
                                          setToastMessage('فشل في النسخ');
                                          setTimeout(() => setToastMessage(''), 2000);
                                      }
                                  }}
                                  className="w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm active:scale-95"
                                  title="نسخ الرابط"
                                  style={{ color: cardHeaderColor }}
                              >
                                  <i className="fa-regular fa-copy text-sm"></i>
                              </button>

                              <button 
                                  onClick={async (e) => {
                                      e.stopPropagation();
                                      const shareData = {
                                          title: 'تطبيق القرآن الكريم',
                                          text: 'لمشاهدة التطبيق على المتصفح او الايفون اضغط على الرابط\nhttps://mushaf-ahmed-laila.vercel.app/',
                                      };

                                      if (Capacitor.isNativePlatform()) {
                                          try {
                                              await CapacitorShare.share(shareData);
                                          } catch (err: any) {
                                              try {
                                                  await navigator.clipboard.writeText(shareData.text);
                                                  setToastMessage('تم نسخ الرابط');
                                                  setTimeout(() => setToastMessage(''), 2000);
                                              } catch (copyErr) {}
                                          }
                                      } else if (navigator.share) {
                                          try {
                                              await navigator.share(shareData);
                                          } catch (err: any) {
                                              if (err.name !== 'AbortError') {
                                                  try {
                                                      await navigator.clipboard.writeText(shareData.text);
                                                      setToastMessage('تم نسخ الرابط');
                                                      setTimeout(() => setToastMessage(''), 2000);
                                                  } catch (copyErr) {}
                                              }
                                          }
                                      } else {
                                          try {
                                              await navigator.clipboard.writeText(shareData.text);
                                              setToastMessage('تم نسخ الرابط');
                                              setTimeout(() => setToastMessage(''), 2000);
                                          } catch (copyErr) {}
                                      }
                                  }}
                                  className="w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm active:scale-95"
                                  title="مشاركة الرابط"
                                  style={{ color: cardHeaderColor }}
                              >
                                  <i className="fa-solid fa-share-nodes text-sm"></i>
                              </button>
                          </div>
                      </div>

                      {/* App Share Card */}
                      <div 
                          className="w-full mt-2 py-1.5 px-4 rounded-2xl shadow-lg border-2 relative flex flex-col gap-0.5 overflow-hidden"
                          style={{ borderColor: cardBorderColor, backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)' }}
                          dir="rtl"
                      >
                          <div className="flex items-center gap-2 z-10 w-full relative" style={{ color: cardHeaderColor }}>
                              <i className="fa-solid fa-share-nodes text-xs"></i>
                              <span className="text-[11px] font-bold font-kufi">شارك التطبيق</span>
                          </div>
                          
                          <p className="text-sm font-bold opacity-80 leading-tight" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                              اذا اعجبك التطبيق قم بنشره على وسائل التواصل ليكون لك الاجر ولمن تحب ان شاء الله .
                          </p>

                          <div className="flex items-center justify-center gap-6">
                              {[
                                  { icon: 'fa-regular fa-copy', label: 'نسخ', color: cardHeaderColor, action: 'copy' },
                                  { icon: 'fa-solid fa-share-nodes', label: 'مشاركة', color: cardHeaderColor, action: 'share' }
                              ].map((item, index) => (
                                  <button 
                                      key={index}
                                      onClick={async (e) => {
                                          e.stopPropagation();
                                          
                                          if (item.action === 'copy') {
                                              try {
                                                  await navigator.clipboard.writeText(APP_SHARE_TEXT);
                                                  setToastMessage('تم نسخ نص المشاركة');
                                                  setTimeout(() => setToastMessage(''), 2000);
                                              } catch (err) {
                                                  setToastMessage('فشل في النسخ');
                                                  setTimeout(() => setToastMessage(''), 2000);
                                              }
                                          } else if (item.action === 'share') {
                                              const shareData = {
                                                  title: 'مصحف أحمد وليلى',
                                                  text: APP_SHARE_TEXT,
                                              };

                                              if (Capacitor.isNativePlatform()) {
                                                  try {
                                                      await CapacitorShare.share(shareData);
                                                  } catch (error: any) {
                                                      try {
                                                          await navigator.clipboard.writeText(APP_SHARE_TEXT);
                                                          setToastMessage('تم نسخ نص المشاركة');
                                                          setTimeout(() => setToastMessage(''), 2000);
                                                      } catch (copyErr) {}
                                                  }
                                              } else if (navigator.share) {
                                                  try {
                                                      await navigator.share(shareData);
                                                  } catch (error: any) {
                                                      if (error.name !== 'AbortError') {
                                                          try {
                                                              await navigator.clipboard.writeText(APP_SHARE_TEXT);
                                                              setToastMessage('تم نسخ نص المشاركة');
                                                              setTimeout(() => setToastMessage(''), 2000);
                                                          } catch (copyErr) {}
                                                      }
                                                  }
                                              } else {
                                                  try {
                                                      await navigator.clipboard.writeText(APP_SHARE_TEXT);
                                                      setToastMessage('تم نسخ نص المشاركة');
                                                      setTimeout(() => setToastMessage(''), 2000);
                                                  } catch (copyErr) {}
                                              }
                                          }
                                      }}
                                      className="flex items-center justify-center p-1 rounded-xl transition-all active:scale-90 hover:bg-black/5 dark:hover:bg-white/5"
                                      title={item.label}
                                  >
                                      <div 
                                          className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shadow-sm"
                                          style={{ backgroundColor: item.color + '20', color: item.color }}
                                      >
                                          <i className={item.icon}></i>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Dua Card */}
                      <div className="flex items-center justify-center gap-2 h-10 mt-3">
                          <div className="themed-card p-1 rounded-2xl text-center flex-1 relative h-full flex flex-col justify-center overflow-hidden">
                              <p className="text-sm font-bold leading-tight" style={{ color: theme.bgColor === '#000000' ? '#FFFFFF' : (themeKey === 'default' ? '#a855f7' : (themeKey === 'olive_grove' ? '#65A30D' : theme.textColor)) }}>
                                  اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة
                              </p>
                          </div>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>

      {showExpandedEventsModal && onThisDayEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" onClick={() => setShowExpandedEventsModal(false)}>
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-6" onClick={e => e.stopPropagation()} style={{ backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.95)' }}>
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="text-center font-bold text-2xl font-kufi" style={{ color: theme.palette[0] }}>
                        {onThisDayEvent.dateStr} {toArabic(onThisDayEvent.year)} ميلادي
                    </div>
                </div>
                
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 w-full">
                        <p className="text-[32px] sm:text-[38px] leading-[1.6] font-hafs font-bold text-center w-full" style={{ color: theme.textColor }}>
                            {onThisDayEvent.text}
                        </p>
                    </div>

                    <button 
                        onClick={() => setShowExpandedEventsModal(false)}
                        className="w-full py-4 rounded-2xl font-bold text-xl transition-all shadow-md active:scale-95"
                        style={{ 
                            backgroundColor: theme.palette[0],
                            color: '#fff'
                        }}
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
      )}

      {showExpandedUpcomingEventModal && upcomingEvents.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" onClick={() => setShowExpandedUpcomingEventModal(false)}>
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-6" onClick={e => e.stopPropagation()} style={{ backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.95)' }}>
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="text-center font-bold text-2xl font-kufi flex items-center gap-2" style={{ color: theme.palette[0] }}>
                        <i className="fa-solid fa-moon"></i>
                        المناسبة الإسلامية
                    </div>
                </div>
                
                <div className="flex flex-col gap-6 w-full">
                    {upcomingEvents[eventIndex] && (
                        <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 w-full text-center">
                            <p className="text-[32px] sm:text-[38px] leading-[1.6] font-kufi font-bold w-full" style={{ color: theme.textColor }}>
                                {upcomingEvents[eventIndex].name}
                            </p>
                            <hr className="w-1/2 opacity-20 border-current" style={{ color: theme.textColor }} />
                            <div className="flex flex-col gap-2">
                                <p className="text-xl font-bold opacity-80" style={{ color: theme.textColor }}>
                                    {upcomingEvents[eventIndex].dateStr}
                                </p>
                                <p className="text-xl font-bold opacity-80" style={{ color: theme.textColor }}>
                                    {upcomingEvents[eventIndex].gregorianDateStr}
                                </p>
                            </div>
                            <div className="w-full p-4 rounded-xl mt-2 flex flex-col items-center" style={{ backgroundColor: theme.palette[0] + '20', color: theme.palette[0] }}>
                               <span className="text-lg font-bold mb-1 opacity-80">
                                   {upcomingEvents[eventIndex].isToday ? 'توافق' : (upcomingEvents[eventIndex].daysRemaining > 0 ? 'يتبقى عليها' : 'مر عليها')}
                               </span>
                               <span className="text-5xl font-black font-kufi my-2">
                                   {upcomingEvents[eventIndex].isToday ? 'اليوم' : toArabic(Math.abs(upcomingEvents[eventIndex].daysRemaining))}
                               </span>
                               {!upcomingEvents[eventIndex].isToday && (
                                   <span className="text-lg font-bold opacity-80">يوم</span>
                               )}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => setShowExpandedUpcomingEventModal(false)}
                        className="w-full py-4 rounded-2xl font-bold text-xl transition-all shadow-md active:scale-95"
                        style={{ 
                            backgroundColor: theme.palette[0],
                            color: '#fff'
                        }}
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
      )}

      <ThemesSidebar 
        isOpen={isThemesSidebarOpen}
        onClose={() => setIsThemesSidebarOpen(false)}
      />
      
      <PasscodeModal 
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onSuccess={() => setIsCustomizationOpen(true)}
        isLandscape={isLandscape}
      />

      <MenuCustomizationModal 
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        allItems={ALL_POSSIBLE_ITEMS}
        visibleIds={visibleItems}
        onSave={handleSaveCustomization}
        isLandscape={isLandscape}
      />

      <VerseContextMenu 
        isOpen={isVerseMenuOpen}
        onClose={() => setIsVerseMenuOpen(false)}
        settings={verseSettings}
        onSave={handleSaveVerseSettings}
        currentTheme={theme}
        renderCheckerboard={renderCheckerboard}
        PREDEFINED_COLORS={PREDEFINED_COLORS}
        isLandscape={isLandscape}
      />

      <AnimatePresence>
        {toastMessage && (
            <motion.div 
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 50, x: '-50%' }}
                className="fixed bottom-24 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
            >
                {toastMessage}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainMenu;
