
import React, { useState, useEffect, useRef } from 'react';
import ThemesSidebar from '../components/MainMenu/ThemesSidebar';
import { useTheme } from '../context/ThemeContext';
import WhatsAppButton from '../components/WhatsAppButton';
import InteractiveBackground from '../components/InteractiveBackground';
import MenuCustomizationModal from '../components/MenuCustomizationModal';
import PasscodeModal from '../components/PasscodeModal';
import { registerBackInterceptor } from '../hooks/useBackButton';
import TitleSection from '../components/MainMenu/TitleSection';
import GridSection from '../components/MainMenu/GridSection';
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
import HabitTrackerCard from '../components/MainMenu/HabitTrackerCard';
import TawafCounterCard from '../components/MainMenu/TawafCounterCard';
import HomePrayerCard from '../components/MainMenu/HomePrayerCard';
import OnThisDayCard from '../components/MainMenu/OnThisDayCard';
import IslamicEventsCard from '../components/MainMenu/IslamicEventsCard';
import WebAppCard from '../components/MainMenu/WebAppCard';
import ShareAppCard from '../components/MainMenu/ShareAppCard';
import IslamicEventsBottomSheet from '../components/MainMenu/IslamicEventsBottomSheet';
import OnThisDayBottomSheet from '../components/MainMenu/OnThisDayBottomSheet';
import IslamicHistoryMemoryCard from '../components/MainMenu/IslamicHistoryMemoryCard';
import IslamicHistoryMemoryBottomSheet from '../components/MainMenu/IslamicHistoryMemoryBottomSheet';
import { HISTORICAL_EVENTS_TRANSLATED, formatCalendarNumber } from '../utils/calendarTranslations';
import { useLanguage } from '../context/LanguageContext';
import { loadDayEvents, getTranslatedEventText, OnThisDayItem } from '../utils/onThisDayService';

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

const APP_SHARE_TEXT_EN = `🕋✨ Major Update: "Mushaf Ahmed & Laila"! ✨🕋
(Your Comprehensive Faith Companion — Offline & 100% Ad-Free)

We are delighted to present an exceptional and brand-new release, completely redesigned across all pages and user interface for smoother, faster, and more beautiful experience, featuring exclusive new faith tools:

🚀 Key Highlights in this Major Update:

🌍 Full Arabic & English Bilingual Support:
A seamless bilingual experience with full Arabic and English language support across all app sections and interfaces.

📜 Prophetic Seerah (New):
An inspiring and interactive journey through the life of the Prophet ﷺ with a detailed timeline of key milestones and events.

💬 Community Hub (New):
Spiritual brotherly connection, sharing wisdom and reflections, and purposeful group discussions.

🛡️ Comprehensive Ruqyah (New):
Complete authentic Ruqyah Shariah from the Holy Quran and Prophetic Sunnah for protection and peace of mind.

🌐 Islamic Platforms & Directory (New):
Integrated interactive guide to trusted Islamic platforms for Fatwa, Quranic studies, and Islamic knowledge.

🎨 Complete Interface & Design Overhaul:
Fresh modern design for all pages to elevate reading experience, typography, themes, and navigation speed.

🌟 Alongside Your Favorite Core Features:
(Complete Holy Quran with multiple recitations & exegesis • Fortress of the Muslim (Hisn Al-Muslim) & Daily Adhkar • Accurate Prayer Times & Qibla • Daily Recitation Wird & Memorization • Smart Voice Control • Habit Tracker • Zakat & Inheritance Calculators • An-Nawawi's Forty Hadiths).

📥 Download or update for free on Google Play:
👉 https://play.google.com/store/apps/details?id=com.AhmedLaila.Quran

🤍 Share with your family and loved ones..
"The one who guides to good is like the one who does it." 🤲🌱`;

const APP_SHARE_TEXT = `🕋✨ التحديث الأكبر لتطبيق "مصحف أحمد و ليلى"! ✨🕋
(رفيقك الإيماني الشامل — يعمل بدون إنترنت وبدون إعلانات)

نسعد بأن نضع بين أيديكم إصداراً استثنائياً وجديداً كلياً، خضع لتطوير شامل وتحديث جذري لجميع صفحات التطبيق وواجهته لتكون أكثر سلاسة، وجمالاً، وسرعة في الاستخدام، مع باقة حصرية من الصفحات والميزات الإيمانية الجديدة:

🚀 أبرز ما تم إضافته وتطويره في هذا التحديث:

🌍 دعم اللغتين العربية والإنجليزية بالكامل:
تجربة متكاملة تدعم اللغتين العربية والإنجليزية بشكل كامل لكافة أقسام وواجهات التطبيق ومحتواه.

📜 صفحة السيرة النبوية (جديد):
رحلة ملهمة وتفاعلية في سيرة خير الأنام ﷺ عبر خط زمني مفصل يوثق أهم المحطات والغزوات والأحداث النبوية الشريفة بأسلوب عصري وميسر.

🛡️ صفحة الرقية الشرعية (جديد):
رقية شرعية كاملة وشاملة وميسرة من القرآن الكريم والسنة النبوية للتحصين والشفاء والسكينة.

🌐 صفحة مواقع ومنصات إسلامية (جديد):
دليل تفاعلي متكامل لأوثق المواقع الإسلامية للفتوى والبحث الشرعي وعلوم القرآن.

🕌 صفحة العشرة المبشرون (جديد):
تعرف على سير العظماء من أصحاب رسول الله ﷺ الذين بشرهم بالجنة، في صفحة تفاعلية ميسرة.

🎨 تحديث شامل للواجهة ولكافة الصفحات:
إعادة تصميم وتحديث لجميع صفحات التطبيق دون استثناء؛ لتحسين تجربة القراءة، والخطوط، والسمات المتعددة، وسرعة التصفح والتنقل.

🌟 بجانب ميزاتك المفضلة:
(المصحف الشريف كاملاً بأكثر من رواية وتفسير • حصن المسلم وأذكار اليوم والليلة • مواقيت الصلاة والقبلة • الورد اليومي والتحفيظ • التحكم الصوتي الذكي • مربي العبادات • الحاسبة الشرعية والمواريث • الأربعون النووية).

📥 حمّل التطبيق الآن أو حدّثه مجاناً عبر متجر Google Play:
👉 https://play.google.com/store/apps/details?id=com.AhmedLaila.Quran

🤍 شاركه مع أهلك وأحبابك..
فالدال على الخير كفاعله، واجعله صدقة جارية لك ولوالديك. 🤲🌱`;

const CURRENT_LAYOUT_VERSION = 'v2026_sections_layout_v10';

const ALL_POSSIBLE_ITEMS = [
    // القسم الأول: القرآن الكريم (التركيز الرئيسي للتطبيق)
    { id: 'quran', label: "القرآن الكريم", className: "col-span-6 h-14", colorIndex: 0 },
    { id: 'listen', label: "الاستماع للقرآن", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'memorization', label: "التحفيظ", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'daily-wird', label: "الورد اليومي", className: "col-span-2 h-11", colorIndex: 1 },

    // القسم الثاني: العبادات اليومية
    { id: 'prayer-times', label: "مواقيت الصلاة", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'salah-adhkar', label: "أذكار الصلاة", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'qibla', label: "البوصلة", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'sabah-masaa', label: "الأذكار", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'adia', label: "الأدعية", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'tasbeeh', label: "التسبيح", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'others', label: "الرقية الشرعية", className: "col-span-2 h-11", colorIndex: 0 },

    // القسم الثالث: المكتبة الإسلامية
    { id: 'prophetic-seerah', label: "السيرة النبوية", className: "col-span-3 h-11", colorIndex: 1 },
    { id: 'ten-promised', label: "العشرة المبشرون", className: "col-span-3 h-11", colorIndex: 0 },
    { id: 'hisn-muslim', label: "حصن المسلم", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'hajj-umrah', label: "الحج والعمرة", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'asmaul-husna', label: "أسماء الله", className: "col-span-2 h-11", colorIndex: 0 },

    // القسم الرابع: خدمات إضافية
    { id: 'habit-tracker', label: "مربّي العبادات", className: "col-span-3 h-11", colorIndex: 0 },
    { id: 'calculators', label: "الحاسبة الشرعية", className: "col-span-3 h-11", colorIndex: 1 },
    { id: 'nawawi', label: "الأربعون النووية", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'calendar', label: "التقويم", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'islamic-sites', label: "مواقع إسلامية", className: "col-span-2 h-11", colorIndex: 1 },

    // شريط التحكم السفلي
    { id: 'voice-control', label: "التحكم الصوتي", className: "col-span-6 h-10 flex justify-center", colorIndex: 0 },
];

const DEFAULT_MENU_ITEMS = [
    // القسم الأول: القرآن الكريم (التركيز الرئيسي للتطبيق)
    { id: 'quran', label: "القرآن الكريم", className: "col-span-6 h-14", colorIndex: 0 },
    { id: 'listen', label: "الاستماع للقرآن", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'memorization', label: "التحفيظ", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'daily-wird', label: "الورد اليومي", className: "col-span-2 h-11", colorIndex: 1 },

    // القسم الثاني: العبادات اليومية
    { id: 'prayer-times', label: "مواقيت الصلاة", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'salah-adhkar', label: "أذكار الصلاة", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'qibla', label: "البوصلة", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'sabah-masaa', label: "الأذكار", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'adia', label: "الأدعية", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'tasbeeh', label: "التسبيح", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'others', label: "الرقية الشرعية", className: "col-span-2 h-11", colorIndex: 0 },

    // القسم الثالث: المكتبة الإسلامية
    { id: 'prophetic-seerah', label: "السيرة النبوية", className: "col-span-3 h-11", colorIndex: 1 },
    { id: 'ten-promised', label: "العشرة المبشرون", className: "col-span-3 h-11", colorIndex: 0 },
    { id: 'hisn-muslim', label: "حصن المسلم", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'hajj-umrah', label: "الحج والعمرة", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'asmaul-husna', label: "أسماء الله", className: "col-span-2 h-11", colorIndex: 0 },

    // القسم الرابع: خدمات إضافية
    { id: 'habit-tracker', label: "مربّي العبادات", className: "col-span-3 h-11", colorIndex: 0 },
    { id: 'calculators', label: "الحاسبة الشرعية", className: "col-span-3 h-11", colorIndex: 1 },
    { id: 'nawawi', label: "الأربعون النووية", className: "col-span-2 h-11", colorIndex: 0 },
    { id: 'calendar', label: "التقويم", className: "col-span-2 h-11", colorIndex: 1 },
    { id: 'islamic-sites', label: "مواقع إسلامية", className: "col-span-2 h-11", colorIndex: 1 },

    // شريط التحكم السفلي
    { id: 'voice-control', label: "التحكم الصوتي", className: "col-span-6 h-10 flex justify-center", colorIndex: 0 },
];


function MainMenu({ onNavigate, onOpenThemes, onOpenSideMenu }) {
  const { showVoiceIcon } = useVoiceControl();
  const { 
    language, 
    isRTL, 
    dir, 
    toggleLanguage, 
    t, 
    translatePrayerName, 
    translateEventName, 
    translateHijriMonth, 
    translateGregorianMonth, 
    formatNumber 
  } = useLanguage();
  const { theme, themeKey } = useTheme();
  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const isDarkTheme = isBlackTheme || theme.isDark || theme.bgColor === '#000000' || (theme.textColor && theme.textColor.toLowerCase() === '#ffffff');
  // لون أيقونات الهيدر: يطابق الثيم الافتراضي (#2E7D5E)، ويتغير مع الثيمات الأخرى ومع الوضع الداكن/الأسود
  const headerIconColor = isBlackTheme 
    ? '#FFFFFF' 
    : (themeKey === 'default' 
        ? '#2E7D5E' 
        : (theme.isDark ? (theme.accent || '#FFFFFF') : (theme.palette?.[0] || theme.accent || '#2E7D5E')));
  const cardHeaderColor = isBlackTheme ? '#FFFFFF' : theme.palette[0];
  const cardBorderColor = isBlackTheme ? '#FFFFFF' : theme.palette[0];
  const cardButtonColor = isBlackTheme ? '#000000' : theme.palette[0];
  const cardButtonTextColor = isBlackTheme ? '#FFFFFF' : '#FFFFFF';
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
        try {
            const seen = JSON.parse(localStorage.getItem('app_seen_pages_badge_v1') || '[]');
            const updatedSeen = Array.isArray(seen) ? seen.filter((id: string) => id !== 'others' && id !== 'islamic-sites') : [];
            localStorage.setItem('app_seen_pages_badge_v1', JSON.stringify(updatedSeen));
        } catch {}
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prayerCardRef = useRef<HTMLDivElement>(null);

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
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { times, nextPrayer, countdown } = usePrayerTimes();
  
  const [lastReadAyah, setLastReadAyah] = useState<{ s: number, a: number, text: string, surahName: string } | null>(null);

  const [onThisDayEvent, setOnThisDayEvent] = useState<{ text: string, textEn?: string, year: number, dateStr: string } | null>(null);
  const [onThisDayIndex, setOnThisDayIndex] = useState(0);
  const [onThisDayList, setOnThisDayList] = useState<OnThisDayItem[]>([]);
  const [showExpandedEventsModal, setShowExpandedEventsModal] = useState(false);
  const [showExpandedUpcomingEventModal, setShowExpandedUpcomingEventModal] = useState(false);
  const [showExpandedHistoryMemoryModal, setShowExpandedHistoryMemoryModal] = useState(false);

  const historyDeckRef = useRef<number[]>([]);
  const [historyMemoryIndex, setHistoryMemoryIndex] = useState<number>(() => {
    const total = HISTORICAL_EVENTS_TRANSLATED.length;
    if (total === 0) return 0;
    return Math.floor(Math.random() * total);
  });

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

      const formattedEvents = allCycleEvents.map(ev => {
          const hijriDateAr = `${toArabic(ev.date.iDate())} ${HIJRI_MONTHS[ev.date.iMonth()]} ${toArabic(ev.date.iYear())} هـ`;
          const hijriDateEn = `${ev.date.iDate()} ${translateHijriMonth(ev.date.iMonth())} ${ev.date.iYear()} AH`;
          const gregDateAr = `${toArabic(ev.date.date())} ${GREGORIAN_MONTHS[ev.date.month()]} ${toArabic(ev.date.year())} م`;
          const gregDateEn = `${ev.date.date()} ${translateGregorianMonth(ev.date.month())} ${ev.date.year()} AD`;

          return {
              name: ev.name,
              dateStr: language === 'en' ? hijriDateEn : hijriDateAr,
              gregorianDateStr: language === 'en' ? gregDateEn : gregDateAr,
              daysRemaining: ev.diff,
              isToday: ev.diff === 0
          };
      });

      setUpcomingEvents(formattedEvents);

      // Find the first event that is today or in the future
      let initialIndex = formattedEvents.findIndex(ev => ev.daysRemaining >= 0);
      if (initialIndex === -1) initialIndex = 0; // If all passed, start at 0
      setEventIndex(initialIndex);
  }, [language]);

  useEffect(() => {
      let isMounted = true;
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const key = `${mm}-${dd}`;
      const formatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      const dateStr = formatter.format(today);

      const fetchAndSetEvents = async () => {
          const items = await loadDayEvents(mm, dd, language);
          if (!isMounted) return;

          let stored = null;
          try { stored = JSON.parse(localStorage.getItem('on_this_day_state') || 'null'); } catch(e){}

          let startIndex = 0;
          if (stored && stored.key === key) {
              startIndex = stored.index % Math.max(1, items.length);
          } else if (items.length > 0) {
              startIndex = Math.floor(Math.random() * items.length);
          }

          if (items.length > 0) {
              setOnThisDayList(items);
              setOnThisDayIndex(startIndex);
              const ev = items[startIndex];
              const eventText = language === 'en' ? (ev.textEn || getTranslatedEventText(ev.text, ev.year)) : ev.text;
              setOnThisDayEvent({ 
                year: ev.year, 
                text: eventText, 
                textEn: ev.textEn || getTranslatedEventText(ev.text, ev.year),
                dateStr 
              });
          }
          localStorage.setItem('on_this_day_state', JSON.stringify({ key, index: startIndex }));
      };

      fetchAndSetEvents();

      return () => { isMounted = false; };
  }, [language]);

  const handleNextEvent = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const formatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      const dateStr = formatter.format(today);

      if (navigator.onLine && onThisDayIndex >= onThisDayList.length - 1) {
          try {
              const fetchUrl = language === 'en'
                ? `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`
                : `https://api.wikimedia.org/feed/v1/wikipedia/ar/onthisday/events/${mm}/${dd}`;
              const res = await fetch(fetchUrl);
              const data = await res.json();
              if (data && data.events && data.events.length > onThisDayList.length) {
                  const newEvents: OnThisDayItem[] = data.events.map((e: any) => ({
                    year: e.year || 0,
                    text: e.text || '',
                    textEn: language === 'en' ? (e.text || '') : getTranslatedEventText(e.text || '', e.year || 0)
                  }));
                  setOnThisDayList(newEvents);
                  const newIndex = onThisDayList.length;
                  setOnThisDayIndex(newIndex);
                  const ev = newEvents[newIndex];
                  const eventText = language === 'en' ? (ev.textEn || ev.text) : ev.text;
                  setOnThisDayEvent({ year: ev.year, text: eventText, textEn: ev.textEn, dateStr });
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
          const ev = onThisDayList[nextIndex];
          const eventText = language === 'en' ? (ev.textEn || getTranslatedEventText(ev.text, ev.year)) : ev.text;
          setOnThisDayEvent({ year: ev.year, text: eventText, textEn: ev.textEn, dateStr });
          localStorage.setItem('on_this_day_state', JSON.stringify({ key: `${mm}-${dd}`, index: nextIndex }));
      }
  };

  const handleShareHighlight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onThisDayEvent) return;

    const sourceText = language === 'en'
      ? `On This Day - ${onThisDayEvent.year} AD`
      : `حدث في مثل هذا اليوم - ${onThisDayEvent.year}م`;

    const activeText = language === 'en'
      ? (onThisDayEvent.textEn || getTranslatedEventText(onThisDayEvent.text, onThisDayEvent.year))
      : onThisDayEvent.text;

    await shareAsImage({ 
      text: activeText, 
      source: sourceText, 
      category: onThisDayEvent.dateStr, 
      theme, 
      setToastMessage 
    });
  };

  const handleCopyHighlight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onThisDayEvent) return;
    const activeText = language === 'en'
      ? (onThisDayEvent.textEn || getTranslatedEventText(onThisDayEvent.text, onThisDayEvent.year))
      : onThisDayEvent.text;

    const textToCopy = language === 'en'
      ? `${onThisDayEvent.dateStr}\nIn the year ${onThisDayEvent.year} AD\n${activeText}`
      : `${onThisDayEvent.dateStr}\nفي عام ${onThisDayEvent.year} ميلادي\n${activeText}`;
    try {
        await navigator.clipboard.writeText(textToCopy);
        setToastMessage(t('on_this_day.copied', 'تم النسخ إلى الحافظة'));
        setTimeout(() => setToastMessage(''), 2000);
    } catch (err) {
        console.error('Clipboard error:', err);
        setToastMessage(t('common.failed_copy', 'فشل في النسخ'));
        setTimeout(() => setToastMessage(''), 2000);
    }
  };

  const handleShareUpcomingEvent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (upcomingEvents.length === 0) return;

    const event = upcomingEvents[eventIndex];
    let diffText = '';
    if (event.isToday) {
        diffText = t('islamic_events.today', 'اليوم');
    } else if (event.daysRemaining > 0) {
        diffText = language === 'en'
          ? `Remaining: ${formatNumber(event.daysRemaining)} days`
          : `المتبقي: ${toArabic(event.daysRemaining)} يوم`;
    } else {
        diffText = language === 'en'
          ? `Passed: ${formatNumber(Math.abs(event.daysRemaining))} days`
          : `مر عليها: ${toArabic(Math.abs(event.daysRemaining))} يوم`;
    }

    const eventName = translateEventName(event.name);
    const labelTitle = t('islamic_events.title', 'المناسبة');

    await shareAsImage({ 
      text: `${labelTitle}: ${eventName}\n${diffText}`, 
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
        diffText = t('islamic_events.today', 'اليوم');
    } else if (event.daysRemaining > 0) {
        diffText = language === 'en'
          ? `Remaining: ${formatNumber(event.daysRemaining)} days`
          : `المتبقي: ${toArabic(event.daysRemaining)} يوم`;
    } else {
        diffText = language === 'en'
          ? `Passed: ${formatNumber(Math.abs(event.daysRemaining))} days`
          : `مر عليها: ${toArabic(Math.abs(event.daysRemaining))} يوم`;
    }

    const eventName = translateEventName(event.name);
    const textToCopy = language === 'en'
      ? `Islamic Occasion: ${eventName}\nHijri Date: ${event.dateStr}\nGregorian Date: ${event.gregorianDateStr}\n${diffText}`
      : `المناسبة الإسلامية: ${event.name}\nالتاريخ الهجري: ${event.dateStr}\nالتاريخ الميلادي: ${event.gregorianDateStr}\n${diffText}`;
    try {
        await navigator.clipboard.writeText(textToCopy);
        setToastMessage(t('on_this_day.copied', 'تم النسخ إلى الحافظة'));
        setTimeout(() => setToastMessage(''), 2000);
    } catch (err) {
        console.error('Clipboard error:', err);
        setToastMessage(t('common.failed_copy', 'فشل في النسخ'));
        setTimeout(() => setToastMessage(''), 2000);
    }
  };

  const currentHistoryMemoryEvent = HISTORICAL_EVENTS_TRANSLATED[historyMemoryIndex] || HISTORICAL_EVENTS_TRANSLATED[0] || null;

  const handleNextHistoryMemoryEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    const total = HISTORICAL_EVENTS_TRANSLATED.length;
    if (total <= 1) return;

    if (historyDeckRef.current.length === 0) {
      const indices = Array.from({ length: total }, (_, idx) => idx).filter(idx => idx !== historyMemoryIndex);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      historyDeckRef.current = indices;
    }

    const nextIdx = historyDeckRef.current.pop();
    if (typeof nextIdx === 'number') {
      setHistoryMemoryIndex(nextIdx);
    }
  };

  const handleShareHistoryMemory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentHistoryMemoryEvent) return;

    const title = language === 'en' ? currentHistoryMemoryEvent.titleEn : currentHistoryMemoryEvent.titleAr;
    const desc = language === 'en' ? currentHistoryMemoryEvent.descriptionEn : currentHistoryMemoryEvent.descriptionAr;
    const hijriY = language === 'en'
      ? currentHistoryMemoryEvent.hijriYearEn
      : formatCalendarNumber(currentHistoryMemoryEvent.hijriYearAr, 'ar');
    const gregY = language === 'en'
      ? currentHistoryMemoryEvent.gregorianYearEn
      : formatCalendarNumber(currentHistoryMemoryEvent.gregorianYearAr, 'ar');
    const categoryLabel = language === 'en' ? 'Islamic History Memory' : 'ذاكرة التاريخ الإسلامي';

    await shareAsImage({
      text: desc,
      source: `${title} (${hijriY} • ${gregY})`,
      category: categoryLabel,
      theme,
      setToastMessage,
    });
  };

  const handleCopyHistoryMemory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentHistoryMemoryEvent) return;

    const title = language === 'en' ? currentHistoryMemoryEvent.titleEn : currentHistoryMemoryEvent.titleAr;
    const desc = language === 'en' ? currentHistoryMemoryEvent.descriptionEn : currentHistoryMemoryEvent.descriptionAr;
    const hijriY = language === 'en'
      ? currentHistoryMemoryEvent.hijriYearEn
      : formatCalendarNumber(currentHistoryMemoryEvent.hijriYearAr, 'ar');
    const gregY = language === 'en'
      ? currentHistoryMemoryEvent.gregorianYearEn
      : formatCalendarNumber(currentHistoryMemoryEvent.gregorianYearAr, 'ar');

    const textToCopy = language === 'en'
      ? `Islamic History Memory — ${title}\n(${hijriY} • ${gregY})\n${desc}`
      : `ذاكرة التاريخ الإسلامي — ${title}\n(${hijriY} • ${gregY})\n${desc}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setToastMessage(t('on_this_day.copied', 'تم النسخ إلى الحافظة'));
      setTimeout(() => setToastMessage(''), 2000);
    } catch (err) {
      console.error('Clipboard error:', err);
      setToastMessage(t('common.failed_copy', 'فشل في النسخ'));
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
          if (showExpandedHistoryMemoryModal) {
              setShowExpandedHistoryMemoryModal(false);
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
  }, [isThemesSidebarOpen, isCustomizationOpen, isEditMode, showExpandedHistoryMemoryModal, showExpandedEventsModal, showExpandedUpcomingEventModal, isPasscodeOpen]);

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
    <div 
      className="relative min-h-screen"
      style={{ backgroundColor: isBlackTheme ? '#000000' : (theme.bgColor || '#DFE5EC') }}
    >
      <InteractiveBackground />

      <div className="h-screen w-full flex flex-col overflow-hidden">
        {/* صف اسم التطبيق وأيقونة الثيمات وأيقونة اللغة: مثبت بأول الصفحة ولا يتحرك مع التمرير */}
        <header 
          id="sticky-title-wrapper"
          dir={dir}
          className="shrink-0 z-40 relative select-none transition-colors duration-150"
          style={{
            backgroundColor: isBlackTheme
              ? '#000000'
              : (theme.bgColor || '#DFE5EC'),
            borderBottom: 'none',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            fontFamily: theme.font
          }}
        >
          <div className="w-full max-w-md mx-auto px-2 pt-1 pb-1 relative flex items-center justify-center gap-2.5 sm:gap-4" dir={dir}>
            {/* أيقونة الثيمات: بدون دائرة، قريبة من العنوان، مع إبراز وتجسيم الأيقونة نفسها */}
            {!isEditMode ? (
              <button
                id="themes-btn"
                data-id="themes-button"
                type="button"
                onClick={() => setIsThemesSidebarOpen(true)}
                className="p-1.5 flex items-center justify-center transition-all duration-150 active:scale-90 hover:scale-110 cursor-pointer select-none shrink-0 bg-transparent border-none outline-none"
                title={language === 'en' ? 'Themes' : 'الثيمات والمظهر'}
                aria-label={language === 'en' ? 'Themes' : 'الثيمات والمظهر'}
              >
                <Palette 
                  className="w-[22px] h-[22px] sm:w-[25px] sm:h-[25px] pointer-events-none transition-transform" 
                  style={{
                    color: isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E'),
                    filter: isBlackTheme 
                      ? 'drop-shadow(0 2px 3px rgba(255,255,255,0.4)) drop-shadow(0 4px 6px rgba(0,0,0,0.9))' 
                      : 'drop-shadow(0 1px 0 rgba(255,255,255,0.9)) drop-shadow(0 2px 3px rgba(0,0,0,0.3)) drop-shadow(0 4px 5px rgba(0,0,0,0.2))'
                  }}
                />
              </button>
            ) : <div className="w-9 h-9 shrink-0" />}

            {/* اسم التطبيق في المنتصف - مجسم وثلاثي الأبعاد للنص */}
            <div className="flex items-center justify-center min-w-0 px-1">
              <h1 
                id="app-title" 
                className={`text-xl sm:text-2xl md:text-3xl font-black font-kufi tracking-tight select-none text-center truncate transition-transform ${isEditMode ? 'scale-105 text-yellow-400' : ''}`} 
                style={{ 
                  color: isEditMode 
                    ? undefined 
                    : (isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#4C1D95' : theme.textColor)),
                  textShadow: isBlackTheme 
                    ? '0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.8)' 
                    : '0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 0 rgba(0, 0, 0, 0.15), 0 3px 2px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.25)',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased'
                }}
              >
                {t('app.name', 'مُصْحَفُ أَحْمَدَ وَلَيْلَى')}
              </h1>
            </div>

            {/* أيقونة اللغة: بدون دائرة، قريبة من العنوان، مع إبراز وتجسيم النص نفسه */}
            {!isEditMode ? (
              <button
                id="language-btn"
                data-id="language-button"
                type="button"
                onClick={toggleLanguage}
                className="p-1.5 flex items-center justify-center transition-all duration-150 active:scale-90 hover:scale-110 cursor-pointer select-none shrink-0 bg-transparent border-none outline-none"
                title={language === 'ar' ? 'English' : 'اللغة العربية'}
                aria-label={language === 'ar' ? 'English' : 'اللغة العربية'}
              >
                <span 
                  className="text-[17px] sm:text-[19px] font-black font-sans tracking-tight pointer-events-none leading-none"
                  style={{
                    color: isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E'),
                    textShadow: isBlackTheme 
                      ? '0 2px 3px rgba(255,255,255,0.4), 0 4px 6px rgba(0,0,0,0.9)' 
                      : '0 1px 0 rgba(255,255,255,0.9), 0 2px 3px rgba(0,0,0,0.3), 0 4px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  {language === 'ar' ? 'Ar' : 'En'}
                </span>
              </button>
            ) : <div className="w-9 h-9 shrink-0" />}
          </div>
        </header>

        {/* الحاوية القابلة للتمرير لباقي محتوى الصفحة */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pb-6 no-scrollbar"
        >
          <div className="main-layout px-4 flex flex-col pt-0" style={{ fontFamily: theme.font, paddingTop: 0 }}>
              
              <TitleSection 
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                  handleSaveLayout={handleSaveLayout}
                  handleResetLayout={handleResetLayout}
                  handleCancelEdit={handleCancelEdit}
                  theme={theme}
                  themeKey={themeKey}
                  onOpenSideMenu={onOpenSideMenu}
                  hideTitle={true}
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
                      {/* Modern Prayer Status Card */}
                      <HomePrayerCard 
                          onNavigate={onNavigate}
                          cardRef={prayerCardRef}
                      />

                      {/* بطاقة ذاكرة التاريخ الإسلامي - أسفل بطاقة الصلاة مباشرة */}
                      {currentHistoryMemoryEvent && (
                          <IslamicHistoryMemoryCard
                              event={currentHistoryMemoryEvent}
                              onNextEvent={handleNextHistoryMemoryEvent}
                              onCopy={handleCopyHistoryMemory}
                              onShare={handleShareHistoryMemory}
                              onOpenModal={() => setShowExpandedHistoryMemoryModal(true)}
                          />
                      )}

                      {/* بطاقة عداد الطواف والسعي - تظهر تحت بطاقة الصلاة مباشرة عند تفعيلها */}
                      <TawafCounterCard 
                          theme={theme}
                          onNavigate={onNavigate}
                      />


                      {/* بطاقة مربي العبادات (إنجاز اليوم وملخص الأيام السابقة بالنسبة المئوية) */}
                      <HabitTrackerCard
                          theme={theme}
                          onNavigate={onNavigate}
                      />

                      {/* On This Day Card */}
                      {onThisDayEvent && (
                          <OnThisDayCard 
                              event={onThisDayEvent}
                              onNextEvent={handleNextEvent}
                              onCopy={handleCopyHighlight}
                              onShare={handleShareHighlight}
                              onOpenModal={() => setShowExpandedEventsModal(true)}
                          />
                      )}

                      {/* Upcoming Islamic Event Card */}
                      {upcomingEvents.length > 0 && (
                          <IslamicEventsCard
                              events={upcomingEvents}
                              currentIndex={eventIndex}
                              onPrevEvent={(e) => {
                                  e.stopPropagation();
                                  setEventIndex(prev => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
                              }}
                              onNextEvent={(e) => {
                                  e.stopPropagation();
                                  setEventIndex(prev => (prev + 1) % upcomingEvents.length);
                              }}
                              onCopy={handleCopyUpcomingEvent}
                              onShare={handleShareUpcomingEvent}
                              onOpenModal={() => setShowExpandedUpcomingEventModal(true)}
                          />
                      )}

                      {/* Web App Link Card */}
                      <WebAppCard setToastMessage={setToastMessage} />

                      {/* App Share Card */}
                      <ShareAppCard
                          shareTextAr={APP_SHARE_TEXT}
                          shareTextEn={APP_SHARE_TEXT_EN}
                          setToastMessage={setToastMessage}
                      />

                      {/* Dua - بارز وبدون بطاقة أو زر محيط */}
                      <div className="flex items-center justify-center gap-2 min-h-11 mt-1.5 px-4" dir={dir}>
                          <p 
                              className="text-sm font-black font-kufi leading-tight text-center relative z-10" 
                              style={{ 
                                  color: isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#7e22ce' : (themeKey === 'olive_grove' ? '#65A30D' : theme.textColor)),
                                  textShadow: isBlackTheme 
                                      ? '0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.8)' 
                                      : '0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 0 rgba(0, 0, 0, 0.15), 0 3px 2px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.25)'
                              }}
                          >
                              {t('app.dua_bottom', 'اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة')}
                          </p>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>

      {/* Modal Bottom Sheet: ذاكرة التاريخ الإسلامي */}
      <IslamicHistoryMemoryBottomSheet
        isOpen={showExpandedHistoryMemoryModal && !!currentHistoryMemoryEvent}
        onClose={() => setShowExpandedHistoryMemoryModal(false)}
        event={currentHistoryMemoryEvent}
        onNextEvent={handleNextHistoryMemoryEvent}
        onShare={handleShareHistoryMemory}
        onCopy={handleCopyHistoryMemory}
      />

      {/* Modal Bottom Sheet: حدث في مثل هذا اليوم (كبار السن وضعاف البصر) */}
      <OnThisDayBottomSheet
        isOpen={showExpandedEventsModal && !!onThisDayEvent}
        onClose={() => setShowExpandedEventsModal(false)}
        event={onThisDayEvent!}
        onNextEvent={handleNextEvent}
        onShare={handleShareHighlight}
        onCopy={handleCopyHighlight}
      />

      {/* Modal Bottom Sheet: المناسبات الإسلامية (كبار السن وضعاف البصر) */}
      <IslamicEventsBottomSheet
        isOpen={showExpandedUpcomingEventModal && upcomingEvents.length > 0}
        onClose={() => setShowExpandedUpcomingEventModal(false)}
        events={upcomingEvents}
        currentIndex={eventIndex}
        onSelectIndex={(idx) => setEventIndex(idx)}
        onShare={handleShareUpcomingEvent}
        onCopy={handleCopyUpcomingEvent}
      />

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
