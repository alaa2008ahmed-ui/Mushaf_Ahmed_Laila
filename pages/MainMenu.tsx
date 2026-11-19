
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/ThemeContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { getThemeEditModeStyles } from '../utils/themeEditStyles';
import FloatingNeonTicker from '../components/FloatingNeonTicker';
import { Palette, Check, HelpCircle, RotateCcw, Settings } from 'lucide-react';
import ModernHomeView from '../components/MainMenu/ModernHomeView';
import HomeScreenSettingsModal from '../components/MainMenu/HomeScreenSettingsModal';
import WhatsNewModal, { WHATS_NEW_RELEASE_KEY, hasSeenWhatsNew, markWhatsNewAsSeen } from '../components/MainMenu/WhatsNewModal';
import { prewarmShareDesignThumbs } from '../components/MainMenu/ShareDesignSelectorSection';
import { CommunitySpotlightGuide } from '../components/Community/CommunitySpotlightGuide';
import { getDynamicSmartHomeSteps } from '../components/Community/communityTourSteps';
import { useShowPageGuides } from '../utils/guideManager';
import { useVoiceControl } from '../context/VoiceControlContext';
import { quranData as rawQuranData } from '../utils/quranData';
import { SURAH_NAMES_AR, toArabic } from '../components/QuranReader/constants';
import { ON_THIS_DAY_EVENTS } from '../data/onThisDayEvents';
import { shareAsImage } from '../utils/shareAsImage';
import { Preferences } from '@capacitor/preferences';
import moment from 'moment-hijri';
import UnifiedEventZoomModal from '../components/MainMenu/UnifiedEventZoomModal';
import { HISTORICAL_EVENTS_TRANSLATED, formatCalendarNumber } from '../utils/calendarTranslations';
import { useLanguage } from '../context/LanguageContext';
import { loadDayEvents, getTranslatedEventText, OnThisDayItem } from '../utils/onThisDayService';
import { islamicEvents as ISLAMIC_EVENTS } from '../data/calendarData';
import { showGlobalAppToast } from '../utils/appNotificationSettings';
import { getToast3DStyles } from '../utils/toast3DStyles';

const HIJRI_MONTHS = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
const GREGORIAN_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export const APP_SHARE_TEXT_EN = `🕋✨ Major Update: "Mushaf Ahmed & Laila"! ✨🕋
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

export const APP_SHARE_TEXT = `🕋✨ التحديث الأكبر لتطبيق "مصحف أحمد و ليلى"! ✨🕋
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

function MainMenu({ onNavigate }: { onNavigate: (pageId: string, params?: any) => void }) {
  const showPageGuides = useShowPageGuides();
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
  const { 
    theme, 
    themeKey, 
    isNightMode, 
    toggleNightMode, 
    homeThemeVariant, 
    setHomeThemeVariant, 
    setNightModeActive 
  } = useTheme();
  const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number; left: number } | null>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const handleToggleThemeMenu = (e?: React.SyntheticEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!showThemeMenu) {
      if (themeMenuRef.current) {
        const rect = themeMenuRef.current.getBoundingClientRect();
        setMenuPos({
          top: rect.bottom + 6,
          right: Math.max(8, window.innerWidth - rect.right),
          left: Math.max(8, rect.left),
        });
      }
      setShowThemeMenu(true);
    } else {
      setShowThemeMenu(false);
    }
  };

  useEffect(() => {
    if (!showThemeMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowThemeMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showThemeMenu]);

  const isSkyTheme = !isNightMode && homeThemeVariant === 'sky';
  const isEmeraldTheme = !isNightMode && homeThemeVariant === 'emerald';
  const isBurgundyTheme = !isNightMode && homeThemeVariant === 'burgundy';

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const isDarkTheme = isBlackTheme || theme.isDark || theme.bgColor === '#000000' || (theme.textColor && theme.textColor.toLowerCase() === '#ffffff');

  const editStyles = getThemeEditModeStyles(isNightMode, homeThemeVariant, isBlackTheme);

  // لون أيقونات الهيدر
  const headerIconColor = isBlackTheme || isNightMode
    ? '#F59E0B'
    : (isSkyTheme
        ? '#0369a1'
        : (isEmeraldTheme
            ? '#047857'
            : (isBurgundyTheme
                ? '#9f1239'
                : '#B45309')));

  const cardHeaderColor = isBlackTheme ? '#FFFFFF' : theme.palette[0];
  const cardBorderColor = isBlackTheme ? '#FFFFFF' : theme.palette[0];
  const cardButtonColor = isBlackTheme ? '#000000' : theme.palette[0];
  const cardButtonTextColor = isBlackTheme ? '#FFFFFF' : '#FFFFFF';

  // التأكد من حفظ وضع التصميم الحديث دائماً في التخزين
  useEffect(() => {
    try {
      localStorage.setItem('home_layout_system', 'modern');
    } catch {}
    Preferences.set({ key: 'home_layout_system', value: 'modern' }).catch(() => {});
  }, []);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('home-edit-mode-changed', { detail: { isEditMode } }));
  }, [isEditMode]);
  const [showSmartHomeGuide, setShowSmartHomeGuide] = useState(false);
  const [smartHomeSteps, setSmartHomeSteps] = useState(() => getDynamicSmartHomeSteps());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenSmartHomeGuide = useCallback(() => {
    // Generate fresh steps ordered exactly according to current cards on screen
    const dynamicSteps = getDynamicSmartHomeSteps();
    setSmartHomeSteps(dynamicSteps);
    setShowSmartHomeGuide(true);
  }, []);
  const prayerCardRef = useRef<HTMLDivElement>(null);



  const titleLongPressTimerRef = useRef<any>(null);
  const titleStartCoordRef = useRef<{ x: number; y: number } | null>(null);

  const handleToggleEditMode = useCallback(() => {
    if (isEditMode) {
      // إنهاء وضع التعديل وحفظ ترتيب البطاقات
      window.dispatchEvent(new CustomEvent('save-home-cards-layout'));
      setIsEditMode(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([40, 60, 40]); } catch {}
      }
      setToastMessage(language === 'en' ? 'Arrangement saved ✓' : 'تم حفظ الترتيب ✓');
    } else {
      // تفعيل وضع التعديل لتبديل البطاقات
      setIsEditMode(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(80); } catch {}
      }
      setToastMessage(language === 'en' ? 'Edit mode: Drag cards to reorder' : 'وضع التعديل: اسحب البطاقات لترتيبها');
    }
  }, [isEditMode, language]);

  const startTitleLongPress = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    titleStartCoordRef.current = { x: e.clientX, y: e.clientY };
    if (titleLongPressTimerRef.current) {
      clearTimeout(titleLongPressTimerRef.current);
    }
    titleLongPressTimerRef.current = setTimeout(() => {
      titleLongPressTimerRef.current = null;
      handleToggleEditMode();
    }, 600);
  };

  const cancelTitleLongPress = () => {
    if (titleLongPressTimerRef.current) {
      clearTimeout(titleLongPressTimerRef.current);
      titleLongPressTimerRef.current = null;
    }
    titleStartCoordRef.current = null;
  };

  const handleTitlePointerMove = (e: React.PointerEvent) => {
    if (!titleStartCoordRef.current) return;
    const dx = Math.abs(e.clientX - titleStartCoordRef.current.x);
    const dy = Math.abs(e.clientY - titleStartCoordRef.current.y);
    if (dx > 10 || dy > 10) {
      cancelTitleLongPress();
    }
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

  useLayoutEffect(() => {
    try {
      const focusCard = sessionStorage.getItem('main_menu_focus_card');
      if (focusCard !== 'tawaf') return;

      const centerTawafCard = () => {
        const container = scrollContainerRef.current;
        if (!container) return false;
        const cardEl =
          document.getElementById('modern-card-container-tawaf') ||
          document.getElementById('modern-tawaf-counter-card');
        if (!cardEl) return false;

        const containerRect = container.getBoundingClientRect();
        const cardRect = cardEl.getBoundingClientRect();
        const cardCenterInContent = (cardRect.top - containerRect.top) + container.scrollTop + (cardRect.height / 2);
        const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
        const targetScroll = Math.min(maxScroll, Math.max(0, Math.round(cardCenterInContent - (containerRect.height / 2))));
        container.scrollTop = targetScroll;
        sessionStorage.setItem('main_menu_scroll_top', String(targetScroll));
        return true;
      };

      centerTawafCard();
      const rafId = requestAnimationFrame(() => {
        centerTawafCard();
      });
      const timerId = window.setTimeout(() => {
        centerTawafCard();
        try {
          sessionStorage.removeItem('main_menu_focus_card');
        } catch {}
      }, 80);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
      };
    } catch {}
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Restore saved scroll position when returning to main menu
    try {
      const focusCard = sessionStorage.getItem('main_menu_focus_card');
      const savedScrollTop = sessionStorage.getItem('main_menu_scroll_top');
      if (!focusCard && savedScrollTop && scrollContainerRef.current) {
        const targetScroll = parseInt(savedScrollTop, 10);
        if (!isNaN(targetScroll) && targetScroll > 0) {
          requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = targetScroll;
            }
          });
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = targetScroll;
            }
          }, 80);
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = targetScroll;
            }
          }, 200);
        }
      }
    } catch {}

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pre-warm share design thumbnails in background during idle time for instant display in Settings
  useEffect(() => {
    const isEn = language === 'en';
    const win = window as any;
    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(() => {
        prewarmShareDesignThumbs(isEn);
      }, { timeout: 1500 });
      return () => {
        if (typeof win.cancelIdleCallback === 'function') {
          win.cancelIdleCallback(idleId);
        }
      };
    }
    const timer = setTimeout(() => {
      prewarmShareDesignThumbs(isEn);
    }, 650);
    return () => clearTimeout(timer);
  }, [language]);

  useEffect(() => {
    const handleScrollToTop = () => {
      if (scrollContainerRef.current) {
        try {
          sessionStorage.setItem('main_menu_scroll_top', '0');
        } catch {}
        try {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
          scrollContainerRef.current.scrollTop = 0;
        }
      }
    };
    window.addEventListener('scroll-to-top', handleScrollToTop);
    return () => window.removeEventListener('scroll-to-top', handleScrollToTop);
  }, []);

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

  const [upcomingEvents, setUpcomingEvents] = useState<{name: string, dateStr: string, gregorianDateStr: string, historicalYearAr?: string, historicalYearEn?: string, daysRemaining: number, isToday: boolean}[]>([]);
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
              historicalYearAr: ev.historicalYearAr,
              historicalYearEn: ev.historicalYearEn,
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
          let items = await loadDayEvents(mm, dd, language);
          if (!isMounted) return;

          // ضمان وجود قائمة وفيرة من الأحداث للتنقل السلس عند النقر على "حدث آخر"
          if (items.length < 10) {
              const allKeys = Object.keys(ON_THIS_DAY_EVENTS);
              for (const k of allKeys) {
                  if (k !== key && ON_THIS_DAY_EVENTS[k]) {
                      for (const extraEv of ON_THIS_DAY_EVENTS[k]) {
                          items.push({
                              year: extraEv.year,
                              text: extraEv.text,
                              textEn: getTranslatedEventText(extraEv.text, extraEv.year)
                          });
                          if (items.length >= 15) break;
                      }
                  }
                  if (items.length >= 15) break;
              }
          }

          let stored = null;
          try { stored = JSON.parse(localStorage.getItem('on_this_day_state') || 'null'); } catch(e){}

          let startIndex = 0;
          if (stored && stored.key === key && typeof stored.index === 'number') {
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
          try {
              localStorage.setItem('on_this_day_state', JSON.stringify({ key: `${mm}-${dd}`, index: startIndex }));
          } catch {}
      };

      fetchAndSetEvents();

      return () => { isMounted = false; };
  }, [language]);

  const handleNextEvent = (e?: React.MouseEvent | any) => {
      e?.stopPropagation?.();
      if (!onThisDayList || onThisDayList.length === 0) return;
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const formatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      const dateStr = formatter.format(today);

      const nextIndex = (onThisDayIndex + 1) % onThisDayList.length;
      setOnThisDayIndex(nextIndex);
      const ev = onThisDayList[nextIndex];
      if (ev) {
          const eventText = language === 'en' ? (ev.textEn || getTranslatedEventText(ev.text, ev.year)) : ev.text;
          setOnThisDayEvent({ year: ev.year, text: eventText, textEn: ev.textEn, dateStr });
          try {
              localStorage.setItem('on_this_day_state', JSON.stringify({ key: `${mm}-${dd}`, index: nextIndex }));
          } catch {}
      }
  };

  const handleShareHighlight = async (e?: React.MouseEvent | any) => {
    e?.stopPropagation?.();
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

  const handleCopyHighlight = async (e?: React.MouseEvent | any) => {
    e?.stopPropagation?.();
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

  const handleShareUpcomingEvent = async (e?: React.MouseEvent | any) => {
    e?.stopPropagation?.();
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

  const handleCopyUpcomingEvent = async (e?: React.MouseEvent | any) => {
    e?.stopPropagation?.();
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

  const handleNextHistoryMemoryEvent = (e?: React.MouseEvent | any) => {
    e?.stopPropagation?.();
    const total = HISTORICAL_EVENTS_TRANSLATED.length;
    if (total <= 1) return;
    setHistoryMemoryIndex(prev => (prev + 1) % total);
  };

  const handleShareHistoryMemory = async (e?: React.MouseEvent | any) => {
    e?.stopPropagation?.();
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

  const handleCopyHistoryMemory = async (e?: React.MouseEvent | any) => {
    e?.stopPropagation?.();
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
          console.warn("Error loading last read ayah", e);
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


  const handleCancelEdit = useCallback(() => {
      window.dispatchEvent(new CustomEvent('save-home-cards-layout'));
      setIsEditMode(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(50); } catch {}
      }
  }, []);

  const mainMenuBackStateRef = useRef({
      showSettingsModal,
      showWhatsNewModal,
      showSmartHomeGuide,
      showExpandedHistoryMemoryModal,
      showExpandedEventsModal,
      showExpandedUpcomingEventModal,
      isEditMode,
      handleCancelEdit,
  });
  mainMenuBackStateRef.current = {
      showSettingsModal,
      showWhatsNewModal,
      showSmartHomeGuide,
      showExpandedHistoryMemoryModal,
      showExpandedEventsModal,
      showExpandedUpcomingEventModal,
      isEditMode,
      handleCancelEdit,
  };

  // Show the compact What's New guide automatically once on first run or after an update
  useEffect(() => {
      let cancelled = false;
      let timerId: number | undefined;

      try {
          if (localStorage.getItem(WHATS_NEW_RELEASE_KEY) === 'true') {
              return;
          }
      } catch {}

      hasSeenWhatsNew().then((seen) => {
          if (cancelled || seen) return;
          timerId = window.setTimeout(() => {
              if (cancelled) return;
              if (!mainMenuBackStateRef.current.showSettingsModal) {
                  markWhatsNewAsSeen();
                  setShowWhatsNewModal(true);
              }
          }, 550);
      });

      return () => {
          cancelled = true;
          if (timerId !== undefined) {
              window.clearTimeout(timerId);
          }
      };
  }, []);

  useEffect(() => {
      const interceptor = () => {
          const s = mainMenuBackStateRef.current;
          if (s.showWhatsNewModal) {
              markWhatsNewAsSeen();
              setShowWhatsNewModal(false);
              return true;
          }
          if (s.showSettingsModal) {
              setShowSettingsModal(false);
              return true;
          }
          if (s.showSmartHomeGuide) {
              setShowSmartHomeGuide(false);
              return true;
          }
          if (s.showExpandedHistoryMemoryModal) {
              setShowExpandedHistoryMemoryModal(false);
              return true;
          }
          if (s.showExpandedEventsModal) {
              setShowExpandedEventsModal(false);
              return true;
          }
          if (s.showExpandedUpcomingEventModal) {
              setShowExpandedUpcomingEventModal(false);
              return true;
          }
          if (s.isEditMode) {
              s.handleCancelEdit();
              return true;
          }
          return false;
      };
      const unregister = registerBackInterceptor(interceptor);
      return unregister;
  }, []);

  return (
    <div 
      data-layout="modern"
      className="relative min-h-[100dvh] modern-home-layout font-cairo"
      style={{ 
        backgroundColor: isNightMode ? '#000000' : '#FFFFFF',
        fontFamily: "'Cairo', sans-serif"
      }}
    >
      <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
        {/* صف اسم التطبيق وأيقونة الوضع الليلي وأيقونة اللغة: مثبت بأول الصفحة ولا يتحرك مع التمرير */}
        <header 
          id="sticky-title-wrapper"
          dir="rtl"
          className={`shrink-0 ${showThemeMenu ? 'z-[99991]' : 'z-40'} relative select-none border-b ${
            isNightMode 
              ? 'border-amber-500/30 shadow-[0_2px_12px_rgba(0,0,0,0.8)]' 
              : isSkyTheme 
                ? 'border-sky-200/90 shadow-[0_2px_12px_rgba(2,132,199,0.08)]' 
                : isEmeraldTheme 
                  ? 'border-emerald-200/90 shadow-[0_2px_12px_rgba(5,150,105,0.08)]' 
                  : isBurgundyTheme
                    ? 'border-rose-200/90 shadow-[0_2px_12px_rgba(159,18,57,0.08)]'
                    : 'border-amber-200/80 shadow-[0_2px_12px_rgba(217,119,6,0.08)]'
          }`}
          style={{
            backgroundColor: isNightMode ? '#000000' : '#FFFFFF',
            paddingTop: 'var(--app-safe-top, 0px)',
            paddingBottom: 0,
            height: '46px',
            minHeight: '46px',
            boxSizing: 'content-box',
            contain: 'layout style',
            fontFamily: "'Cairo', sans-serif"
          }}
        >
          <div className="w-full h-[46px] flex items-center justify-between px-3 sm:px-4 relative" dir="rtl">
            {/* الطرف الأيمن: زر قائمة أوضاع الصفحة الرئيسية وزر الإرشادات */}
            <div className="flex items-center gap-1 shrink-0 z-20">
              <div className="relative" ref={themeMenuRef}>
                <button
                  id="night-mode-toggle-btn"
                  type="button"
                  onClick={handleToggleThemeMenu}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="p-1 sm:p-1.5 flex items-center justify-center transition-transform duration-150 active:scale-90 hover:scale-110 cursor-pointer select-none shrink-0 bg-transparent border-none outline-none relative z-30"
                  title={
                    language === 'en'
                      ? (isNightMode ? 'Night Mode' : (isSkyTheme ? 'Sky Mode' : (isEmeraldTheme ? 'Emerald Mode' : (isBurgundyTheme ? 'Burgundy Mode' : 'Gold Mode'))))
                      : (isNightMode ? 'الوضع الليلى' : (isSkyTheme ? 'الوضع السماوى' : (isEmeraldTheme ? 'الوضع الزمردى' : (isBurgundyTheme ? 'الوضع العنابي' : 'الوضع الذهبي'))))
                  }
                  aria-label={language === 'en' ? 'Home page themes menu' : 'قائمة أوضاع الصفحة الرئيسية'}
                  aria-expanded={showThemeMenu}
                >
                  {isNightMode ? (
                    <Palette className="w-[21px] h-[21px] sm:w-[23px] sm:h-[23px] text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] pointer-events-none" />
                  ) : isSkyTheme ? (
                    <Palette className="w-[21px] h-[21px] sm:w-[23px] sm:h-[23px] text-sky-600 drop-shadow-[0_1px_2px_rgba(2,132,199,0.25)] pointer-events-none" />
                  ) : isEmeraldTheme ? (
                    <Palette className="w-[21px] h-[21px] sm:w-[23px] sm:h-[23px] text-emerald-700 drop-shadow-[0_1px_2px_rgba(5,150,105,0.25)] pointer-events-none" />
                  ) : isBurgundyTheme ? (
                    <Palette className="w-[21px] h-[21px] sm:w-[23px] sm:h-[23px] text-rose-800 drop-shadow-[0_1px_2px_rgba(159,18,57,0.25)] pointer-events-none" />
                  ) : (
                    <Palette className="w-[21px] h-[21px] sm:w-[23px] sm:h-[23px] text-amber-700 hover:text-amber-900 drop-shadow-[0_1px_2px_rgba(180,83,9,0.25)] pointer-events-none" />
                  )}
                </button>
              </div>

              {/* بورتال موحد على مستوى document.body يحتوي على خلفية الإغلاق وقائمة الخيارات لحرية النقر التامة دون تداخل CSS */}
              {showThemeMenu && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[999990] pointer-events-auto select-none" dir={language === 'en' ? 'ltr' : 'rtl'}>
                  {/* 1. خلفية عازلة شفافة لامتصاص النقر خارج القائمة واغلاقها (z-[999991]) */}
                  <div
                    id="theme-menu-backdrop-shield"
                    className="fixed inset-0 bg-transparent cursor-default z-[999991]"
                    aria-hidden="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowThemeMenu(false);
                    }}
                  />

                  {/* 2. قائمة الخيارات المنبثقة: متطابقة الخلفية مع الثيم الحالي ومجسمة ثلاثية الأبعاد (z-[999995]) */}
                  {(() => {
                    const activeThemeDark = isNightMode || isBlackTheme;
                    const menuContainerStyle: React.CSSProperties = activeThemeDark
                      ? {
                          background: 'linear-gradient(168deg, #282832 0%, #1b1b23 52%, #131319 100%)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          boxShadow: '0 6px 0 #09090d, 0 18px 34px rgba(0, 0, 0, 0.9), inset 0 2px 1.5px rgba(255, 255, 255, 0.2), inset 0 -2.5px 5px rgba(0, 0, 0, 0.7)',
                        }
                      : isSkyTheme
                        ? {
                            background: 'linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 28%, #BAE6FD 72%, #7DD3FC 100%)',
                            color: '#0F172A',
                            border: '1.5px solid rgba(14, 165, 233, 0.45)',
                            boxShadow: '0 6px 0 rgba(2, 132, 199, 0.28), 0 16px 32px rgba(2, 132, 199, 0.25), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2.5px 5px rgba(3, 105, 161, 0.14)',
                          }
                        : isEmeraldTheme
                          ? {
                              background: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 28%, #A7F3D0 72%, #6EE7B7 100%)',
                              color: '#0F172A',
                              border: '1.5px solid rgba(16, 185, 129, 0.45)',
                              boxShadow: '0 6px 0 rgba(5, 150, 105, 0.28), 0 16px 32px rgba(5, 150, 105, 0.25), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2.5px 5px rgba(4, 120, 87, 0.14)',
                            }
                          : isBurgundyTheme
                            ? {
                                background: 'linear-gradient(145deg, #FFF1F2 0%, #FFE4E6 28%, #FECDD3 72%, #FDA4AF 100%)',
                                color: '#0F172A',
                                border: '1.5px solid rgba(225, 29, 72, 0.45)',
                                boxShadow: '0 6px 0 rgba(159, 18, 57, 0.28), 0 16px 32px rgba(159, 18, 57, 0.25), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2.5px 5px rgba(136, 19, 55, 0.14)',
                              }
                            : {
                                background: 'linear-gradient(145deg, #FFFDF2 0%, #FEF9C3 28%, #FDE68A 72%, #FCD34D 100%)',
                                color: '#0F172A',
                                border: '1.5px solid rgba(217, 119, 6, 0.45)',
                                boxShadow: '0 6px 0 rgba(180, 115, 20, 0.28), 0 16px 32px rgba(180, 115, 20, 0.24), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2.5px 5px rgba(146, 64, 14, 0.14)',
                              };

                    const itemButtonStyle: React.CSSProperties = activeThemeDark
                      ? {
                          background: 'linear-gradient(180deg, #2b2b36 0%, #1f1f28 100%)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 3.5px 0 #0a0a0f, 0 6px 12px rgba(0, 0, 0, 0.5), inset 0 1.5px 1px rgba(255, 255, 255, 0.16), inset 0 -1.5px 2px rgba(0, 0, 0, 0.4)',
                        }
                      : isSkyTheme
                        ? {
                            background: 'linear-gradient(180deg, #f5faff 0%, #ebf5fd 65%, #e1f1fb 100%)',
                            color: '#0F172A',
                            border: '1px solid rgba(186, 230, 253, 0.95)',
                            boxShadow: '0 3.5px 0 rgba(14, 165, 233, 0.22), 0 6px 12px rgba(2, 132, 199, 0.14), inset 0 1.5px 1px rgba(255, 255, 255, 0.95), inset 0 -1.5px 2px rgba(14, 165, 233, 0.06)',
                          }
                        : isEmeraldTheme
                          ? {
                              background: 'linear-gradient(180deg, #f4fbf7 0%, #eaf8f0 65%, #e0f4e8 100%)',
                              color: '#0F172A',
                              border: '1px solid rgba(167, 243, 208, 0.95)',
                              boxShadow: '0 3.5px 0 rgba(16, 185, 129, 0.22), 0 6px 12px rgba(5, 150, 105, 0.14), inset 0 1.5px 1px rgba(255, 255, 255, 0.95), inset 0 -1.5px 2px rgba(16, 185, 129, 0.06)',
                            }
                          : isBurgundyTheme
                            ? {
                                background: 'linear-gradient(180deg, #fef4f6 0%, #fde9ec 65%, #fce1e6 100%)',
                                color: '#0F172A',
                                border: '1px solid rgba(254, 205, 211, 0.95)',
                                boxShadow: '0 3.5px 0 rgba(225, 29, 72, 0.22), 0 6px 12px rgba(159, 18, 57, 0.14), inset 0 1.5px 1px rgba(255, 255, 255, 0.95), inset 0 -1.5px 2px rgba(225, 29, 72, 0.06)',
                              }
                            : {
                                background: 'linear-gradient(180deg, #fffef9 0%, #fef9ed 65%, #fdf4df 100%)',
                                color: '#0F172A',
                                border: '1px solid rgba(254, 240, 199, 0.95)',
                                boxShadow: '0 3.5px 0 rgba(217, 119, 6, 0.22), 0 6px 12px rgba(180, 115, 20, 0.14), inset 0 1.5px 1px rgba(255, 255, 255, 0.95), inset 0 -1.5px 2px rgba(217, 119, 6, 0.06)',
                              };

                    return (
                      <div
                        id="theme-dropdown-menu-container"
                        className="fixed z-[999995] rounded-2xl p-2.5 flex flex-col gap-2 transition-all duration-150 animate-in fade-in zoom-in-95 font-cairo select-none min-w-[164px]"
                        style={{
                          ...menuContainerStyle,
                          top: menuPos ? `${menuPos.top}px` : '48px',
                          right: menuPos ? `${menuPos.right}px` : '12px',
                          left: 'auto',
                          direction: language === 'en' ? 'ltr' : 'rtl'
                        }}
                      >
                        {/* 1. الوضع الذهبي */}
                        {(isNightMode || homeThemeVariant !== 'gold') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isNightMode) {
                                setNightModeActive(false);
                              }
                              setHomeThemeVariant('gold');
                              setShowThemeMenu(false);
                              showGlobalAppToast(language === 'en' ? 'Theme: Gold Mode' : 'ثيم: الوضع الذهبي');
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 whitespace-nowrap transition-all duration-150 cursor-pointer hover:-translate-y-[1px] active:translate-y-[2px]"
                            style={itemButtonStyle}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{
                                background: 'radial-gradient(circle at 32% 30%, #fde047 0%, #f59e0b 58%, #b45309 100%)',
                                boxShadow: '0 2px 4px rgba(180, 83, 9, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.75)',
                              }}
                            />
                            <span className={activeThemeDark ? 'text-zinc-100 font-black' : 'text-slate-900 font-black'}>
                              {language === 'en' ? 'Gold Mode' : 'الوضع الذهبي'}
                            </span>
                          </button>
                        )}

                        {/* 2. الوضع الليلى */}
                        {!isNightMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setNightModeActive(true);
                              setShowThemeMenu(false);
                              showGlobalAppToast(language === 'en' ? 'Theme: Night Mode' : 'ثيم: الوضع الليلي');
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 whitespace-nowrap transition-all duration-150 cursor-pointer hover:-translate-y-[1px] active:translate-y-[2px]"
                            style={itemButtonStyle}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{
                                background: 'radial-gradient(circle at 32% 30%, #94a3b8 0%, #475569 58%, #1e293b 100%)',
                                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.65)',
                              }}
                            />
                            <span className="text-slate-900 font-black">
                              {language === 'en' ? 'Night Mode' : 'الوضع الليلى'}
                            </span>
                          </button>
                        )}

                        {/* 3. الوضع السماوى */}
                        {(isNightMode || homeThemeVariant !== 'sky') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isNightMode) {
                                setNightModeActive(false);
                              }
                              setHomeThemeVariant('sky');
                              setShowThemeMenu(false);
                              showGlobalAppToast(language === 'en' ? 'Theme: Sky Mode' : 'ثيم: الوضع السماوي');
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 whitespace-nowrap transition-all duration-150 cursor-pointer hover:-translate-y-[1px] active:translate-y-[2px]"
                            style={itemButtonStyle}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{
                                background: 'radial-gradient(circle at 32% 30%, #7dd3fc 0%, #0ea5e9 58%, #0369a1 100%)',
                                boxShadow: '0 2px 4px rgba(3, 105, 161, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.75)',
                              }}
                            />
                            <span className={activeThemeDark ? 'text-zinc-100 font-black' : 'text-slate-900 font-black'}>
                              {language === 'en' ? 'Sky Mode' : 'الوضع السماوى'}
                            </span>
                          </button>
                        )}

                        {/* 4. الوضع الزمردى */}
                        {(isNightMode || homeThemeVariant !== 'emerald') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isNightMode) {
                                setNightModeActive(false);
                              }
                              setHomeThemeVariant('emerald');
                              setShowThemeMenu(false);
                              showGlobalAppToast(language === 'en' ? 'Theme: Emerald Mode' : 'ثيم: الوضع الزمردي');
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 whitespace-nowrap transition-all duration-150 cursor-pointer hover:-translate-y-[1px] active:translate-y-[2px]"
                            style={itemButtonStyle}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{
                                background: 'radial-gradient(circle at 32% 30%, #6ee7b7 0%, #10b981 58%, #047857 100%)',
                                boxShadow: '0 2px 4px rgba(4, 120, 87, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.75)',
                              }}
                            />
                            <span className={activeThemeDark ? 'text-zinc-100 font-black' : 'text-slate-900 font-black'}>
                              {language === 'en' ? 'Emerald Mode' : 'الوضع الزمردى'}
                            </span>
                          </button>
                        )}

                        {/* 5. الوضع العنابي */}
                        {(isNightMode || homeThemeVariant !== 'burgundy') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isNightMode) {
                                setNightModeActive(false);
                              }
                              setHomeThemeVariant('burgundy');
                              setShowThemeMenu(false);
                              showGlobalAppToast(language === 'en' ? 'Theme: Burgundy Mode' : 'ثيم: الوضع العنابي');
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 whitespace-nowrap transition-all duration-150 cursor-pointer hover:-translate-y-[1px] active:translate-y-[2px]"
                            style={itemButtonStyle}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{
                                background: 'radial-gradient(circle at 32% 30%, #fb7185 0%, #be123c 58%, #881337 100%)',
                                boxShadow: '0 2px 4px rgba(136, 19, 55, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.7)',
                              }}
                            />
                            <span className={activeThemeDark ? 'text-zinc-100 font-black' : 'text-slate-900 font-black'}>
                              {language === 'en' ? 'Burgundy Mode' : 'الوضع العنابي'}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>,
                document.body
              )}

              {!isEditMode && showPageGuides && (
                <button
                  id="smart-home-guide-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenSmartHomeGuide();
                  }}
                  className={`p-1 sm:p-1.5 flex items-center justify-center transition-transform duration-150 active:scale-90 hover:scale-110 cursor-pointer select-none shrink-0 bg-transparent border-none outline-none ${
                    isNightMode
                      ? 'text-amber-400 hover:text-amber-300'
                      : isSkyTheme
                        ? 'text-sky-700 hover:text-sky-900'
                        : isEmeraldTheme
                          ? 'text-emerald-700 hover:text-emerald-900'
                          : 'text-amber-700 hover:text-amber-900'
                  }`}
                  title={language === 'en' ? 'Home Guide (Night mode & Cards reordering)' : 'إرشادات الوضع الليلي وترتيب البطاقات'}
                  aria-label="Home Guide"
                >
                  <HelpCircle className="w-[19px] h-[19px] sm:w-[21px] sm:h-[21px] drop-shadow-[0_1px_2px_rgba(180,83,9,0.2)] pointer-events-none stroke-[2.3]" />
                </button>
              )}
            </div>

            {/* اسم التطبيق في منتصف الشريط تماماً / أو الزران مُمَركَزان في المنتصف عند وضع التعديل */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-center z-30 px-0.5 max-w-[calc(100%-80px)]">
              {isEditMode ? (
                /* في وضع التعديل: إخفاء اسم التطبيق والاكتفاء بالزرين فقط مع توسيطهما في المنتصف تماماً */
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={handleToggleEditMode}
                    className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 shadow-md transition-transform duration-150 cursor-pointer font-cairo whitespace-nowrap"
                    style={editStyles.saveBtn}
                    title={language === 'en' ? 'Save Cards Layout' : 'حفظ ترتيب البطاقات'}
                  >
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                    <span>{language === 'en' ? 'Save' : 'حفظ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('reset-home-cards-layout'));
                      if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        try { navigator.vibrate(50); } catch {}
                      }
                      setToastMessage(language === 'en' ? 'Restored default layout ✓' : 'تمت استعادة الترتيب الافتراضي ✓');
                    }}
                    className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 shadow-md transition-transform duration-150 cursor-pointer font-cairo whitespace-nowrap"
                    style={editStyles.resetBtn}
                    title={language === 'en' ? 'Restore Default Layout' : 'استعادة الترتيب الافتراضي'}
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{language === 'en' ? 'Reset' : 'استعادة'}</span>
                  </button>
                </div>
              ) : (
                <h1 
                  id="app-title" 
                  onPointerDown={startTitleLongPress}
                  onPointerUp={cancelTitleLongPress}
                  onPointerLeave={cancelTitleLongPress}
                  onPointerCancel={cancelTitleLongPress}
                  onPointerMove={handleTitlePointerMove}
                  onContextMenu={(e) => e.preventDefault()}
                  className="pointer-events-auto cursor-pointer select-none text-[19px] sm:text-[22px] md:text-[24px] font-black tracking-tight text-center truncate transition-opacity duration-150 leading-tight font-cairo active:opacity-85" 
                  style={{
                    color: isNightMode 
                      ? '#F59E0B' 
                      : isSkyTheme 
                        ? '#0369a1' 
                        : isEmeraldTheme 
                          ? '#047857' 
                          : isBurgundyTheme
                            ? '#881337'
                            : '#78350F',
                    fontFamily: "'Cairo', sans-serif",
                    textShadow: isNightMode 
                      ? '0 0 10px rgba(245,158,11,0.5), 0 2px 4px rgba(0,0,0,0.8)' 
                      : isSkyTheme 
                        ? '0 1px 2px rgba(2, 132, 199, 0.15)' 
                        : isEmeraldTheme 
                          ? '0 1px 2px rgba(5, 150, 105, 0.15)' 
                          : isBurgundyTheme
                            ? '0 1px 2px rgba(136, 19, 55, 0.15)'
                            : '0 1px 1px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(180, 83, 9, 0.18)',
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                  title={language === 'en' ? 'Long press to edit & reorder cards' : 'اضغط مطولاً لتعديل وترتيب البطاقات'}
                >
                  {t('app.name', 'مُصْحَفُ أَحْمَدَ وَلَيْلَى')}
                </h1>
              )}
            </div>

            {/* الطرف الأيسر: أيقونة الإعدادات وزر اللغة بالوضع العادي */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 z-20">
              {!isEditMode && (
                <>
                  <button
                    id="home-settings-toggle-btn"
                    type="button"
                    onClick={() => setShowSettingsModal(true)}
                    className="p-1 sm:p-1.5 flex items-center justify-center transition-transform duration-150 active:scale-90 hover:scale-110 cursor-pointer select-none shrink-0 bg-transparent border-none outline-none"
                    title={language === 'en' ? 'App & Home Settings' : 'إعدادات التطبيق والرئيسية'}
                    aria-label={language === 'en' ? 'App & Home Settings' : 'إعدادات التطبيق والرئيسية'}
                  >
                    <Settings 
                      className="w-[19px] h-[19px] sm:w-[21px] sm:h-[21px] pointer-events-none stroke-[2.3]"
                      style={{
                        color: headerIconColor,
                        filter: isNightMode ? 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' : 'drop-shadow(0 1px 2px rgba(180,83,9,0.2))'
                      }} 
                    />
                  </button>

                  <button
                    id="language-btn"
                    data-id="language-button"
                    type="button"
                    onClick={() => {
                      const nextLang = language === 'ar' ? 'en' : 'ar';
                      toggleLanguage();
                      showGlobalAppToast(nextLang === 'en' ? 'Language: English' : 'اللغة: العربية');
                    }}
                    className="p-1 sm:p-1.5 flex items-center justify-center transition-transform duration-150 active:scale-90 hover:scale-110 cursor-pointer select-none shrink-0 bg-transparent border-none outline-none"
                    title={language === 'ar' ? 'English' : 'اللغة العربية'}
                    aria-label={language === 'ar' ? 'English' : 'اللغة العربية'}
                  >
                    <span 
                      className="text-[17px] sm:text-[18px] font-black font-cairo tracking-tight pointer-events-none leading-none"
                      style={{
                        color: headerIconColor,
                        textShadow: isNightMode 
                          ? '0 0 8px rgba(245,158,11,0.6)' 
                          : isSkyTheme 
                            ? '0 1px 2px rgba(2, 132, 199, 0.25)' 
                            : isEmeraldTheme 
                              ? '0 1px 2px rgba(5, 150, 105, 0.25)' 
                              : isBurgundyTheme
                                ? '0 1px 2px rgba(159, 18, 57, 0.25)'
                                : '0 1px 2px rgba(180, 83, 9, 0.25)'
                      }}
                    >
                      {language === 'ar' ? 'Ar' : 'En'}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* الحاوية القابلة للتمرير لباقي محتوى الصفحة */}
        <div 
          ref={scrollContainerRef}
          id="main-menu-scroll-container"
          onScroll={(e) => {
            const st = e.currentTarget.scrollTop;
            try {
              sessionStorage.setItem('main_menu_scroll_top', String(st));
            } catch {}
            window.dispatchEvent(new CustomEvent('app-scroll', { detail: { scrollTop: st } }));
          }}
          className="flex-1 min-h-0 overflow-y-auto app-scroll-safe no-scrollbar"
        >
          {/* نص الدعاء بأول الصفحة والشريط الإعلاني - في بداية الصفحة كما كان */}
          <div className="w-full max-w-lg mx-auto text-center select-none pt-2 px-3 pb-0">
            <div className="relative h-[27.5px] max-w-sm mx-auto flex items-center justify-center px-2 overflow-hidden" style={{ contain: 'layout paint' }}>
              <p 
                className={`text-[12.5px] sm:text-[13.5px] font-bold leading-tight tracking-normal text-center font-cairo ${isNightMode ? '' : 'drop-shadow-sm'}`}
                style={{ 
                  color: isNightMode 
                    ? '#FFFFFF' 
                    : isSkyTheme 
                      ? '#0284C7' 
                      : isEmeraldTheme 
                        ? '#059669' 
                        : isBurgundyTheme 
                          ? '#9F1239' 
                          : (theme.palette?.[0] || '#854D0E'),
                  fontFamily: "'Cairo', sans-serif",
                  textShadow: isNightMode ? 'none' : '0 1px 1px rgba(255, 255, 255, 0.8)',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased'
                }}
              >
                {t('app.subtitle', 'نرجوا الدعاء لهم بالرحمة والمغفرة')}
              </p>

              {/* الشريط الإعلاني المتحرك إذا تم تفعيله */}
              <FloatingNeonTicker layoutMode="modern" />
            </div>
          </div>

          <div className="pt-1 px-3 sm:px-4">
            <ModernHomeView
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              onNavigate={onNavigate}
              theme={theme}
              themeKey={themeKey}
              isBlackTheme={false}
              setToastMessage={setToastMessage}
              onThisDayEvent={onThisDayEvent}
              handleNextEvent={handleNextEvent}
              handleShareHighlight={handleShareHighlight}
              handleCopyHighlight={handleCopyHighlight}
              setShowExpandedEventsModal={setShowExpandedEventsModal}
              currentHistoryMemoryEvent={currentHistoryMemoryEvent}
              handleNextHistoryMemoryEvent={handleNextHistoryMemoryEvent}
              handleShareHistoryMemory={handleShareHistoryMemory}
              handleCopyHistoryMemory={handleCopyHistoryMemory}
              setShowExpandedHistoryMemoryModal={setShowExpandedHistoryMemoryModal}
              upcomingEvents={upcomingEvents}
              eventIndex={eventIndex}
              setEventIndex={setEventIndex}
              handleShareUpcomingEvent={handleShareUpcomingEvent}
              handleCopyUpcomingEvent={handleCopyUpcomingEvent}
              setShowExpandedUpcomingEventModal={setShowExpandedUpcomingEventModal}
              shareTextAr={APP_SHARE_TEXT}
              shareTextEn={APP_SHARE_TEXT_EN}
              onOpenGuide={handleOpenSmartHomeGuide}
              onToggleNightMode={toggleNightMode}
            />
          </div>
        </div>
      </div>

      {/* Zoom Modal: ذاكرة التاريخ الإسلامي (مطابق لصفحة الأدعية والأذكار) */}
      {currentHistoryMemoryEvent && (
        <UnifiedEventZoomModal
          isOpen={showExpandedHistoryMemoryModal}
          onClose={() => setShowExpandedHistoryMemoryModal(false)}
          categoryTitle={language === 'en' ? 'Islamic History Memory' : 'ذاكرة التاريخ الإسلامي'}
          text={language === 'en' 
            ? `${currentHistoryMemoryEvent.titleEn || ''}\n\n${currentHistoryMemoryEvent.descriptionEn || ''}`.trim()
            : `${currentHistoryMemoryEvent.titleAr || ''}\n\n${currentHistoryMemoryEvent.descriptionAr || ''}`.trim()}
          subtitle={language === 'en'
            ? `${currentHistoryMemoryEvent.hijriYearEn} • ${currentHistoryMemoryEvent.gregorianYearEn}`
            : `${currentHistoryMemoryEvent.hijriYearAr} • ${currentHistoryMemoryEvent.gregorianYearAr}`}
          setToastMessage={setToastMessage}
          isGolden={true}
          onNextEvent={handleNextHistoryMemoryEvent}
        />
      )}

      {/* Zoom Modal: حدث في مثل هذا اليوم (مطابق لصفحة الأدعية والأذكار) */}
      {onThisDayEvent && (
        <UnifiedEventZoomModal
          isOpen={showExpandedEventsModal}
          onClose={() => setShowExpandedEventsModal(false)}
          categoryTitle={t('on_this_day.title', 'حدث في مثل هذا اليوم')}
          text={language === 'en'
            ? (onThisDayEvent.textEn || getTranslatedEventText(onThisDayEvent.text, onThisDayEvent.year))
            : onThisDayEvent.text}
          subtitle={language === 'en'
            ? `${onThisDayEvent.dateStr} • Year ${onThisDayEvent.year} AD`
            : `${onThisDayEvent.dateStr} • عام ${formatNumber(onThisDayEvent.year)} م`}
          setToastMessage={setToastMessage}
          isGolden={true}
          onNextEvent={handleNextEvent}
        />
      )}

      {/* Zoom Modal: المناسبات الإسلامية (مطابق لصفحة الأدعية والأذكار) */}
      {upcomingEvents.length > 0 && (
        <UnifiedEventZoomModal
          isOpen={showExpandedUpcomingEventModal}
          onClose={() => setShowExpandedUpcomingEventModal(false)}
          categoryTitle={t('islamic_events.title', 'المناسبات الإسلامية')}
          text={translateEventName(upcomingEvents[eventIndex]?.name || '')}
          subtitle={(() => {
            const ev = upcomingEvents[eventIndex];
            if (!ev) return '';
            const status = ev.isToday
              ? (language === 'en' ? 'Today' : 'اليوم')
              : (ev.daysRemaining > 0
                  ? (language === 'en' ? `${formatNumber(ev.daysRemaining)} days remaining` : `المتبقي ${formatNumber(ev.daysRemaining)} يوم`)
                  : (language === 'en' ? `Passed ${formatNumber(Math.abs(ev.daysRemaining))} days ago` : `مرت منذ ${formatNumber(Math.abs(ev.daysRemaining))} يوم`));
            const hist = language === 'en'
              ? (ev.historicalYearEn ? `Historical Date: ${ev.historicalYearEn} • ` : '')
              : (ev.historicalYearAr ? `تاريخ الحدث الأصلي: ${ev.historicalYearAr} • ` : '');
            return `${hist}${ev.dateStr} • ${ev.gregorianDateStr} (${status})`;
          })()}
          setToastMessage={setToastMessage}
          isGolden={true}
          onNextEvent={() => setEventIndex(prev => (prev + 1) % (upcomingEvents.length || 1))}
        />
      )}

      <CommunitySpotlightGuide
        guideKey="smart_home_page_spotlight"
        steps={smartHomeSteps}
        isOpen={showSmartHomeGuide}
        onClose={() => setShowSmartHomeGuide(false)}
        isEn={language === 'en'}
      />

      <HomeScreenSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onNavigate={onNavigate}
      />

      <WhatsNewModal
        isOpen={showWhatsNewModal}
        onClose={() => setShowWhatsNewModal(false)}
      />

      {toastMessage && (
        <div 
            className="app-3d-toast fixed bottom-[calc(var(--app-bottom-clearance,5.25rem)+1rem)] left-1/2 -translate-x-1/2 z-[200] max-w-[85vw] w-max px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-center leading-normal break-words pointer-events-none flex items-center justify-center gap-2.5"
            style={toast3D.style}
        >
            <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={toast3D.iconStyle}
            >
                <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default MainMenu;
