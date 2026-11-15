import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getTawafCounterState, saveTawafCounterState, subscribeTawafCounter, TawafCounterState } from '../../utils/tawafCounterStorage';
import NotificationSettingsModal from '../QuranReader/NotificationSettingsModal';
import SettingsModal from '../QuranReader/SettingsModal';
import FontSelectModal from '../QuranReader/FontSelectModal';
import ReciterSelectModal from '../QuranReader/ReciterSelectModal';
import TafseerSelectionModal from '../QuranReader/TafseerSelectionModal';
import SurahDesignPickerModal from '../QuranReader/SurahDesignPickerModal';
import ApprovedSourcesModal from './ApprovedSourcesModal';
import { READERS, ARABIC_READERS, MEMORIZATION_READERS, SURAH_INFO, THEMES, DEFAULT_SETTINGS, getValidReaderForMode } from '../QuranReader/constants';
import { QuranDownloadModal, TafsirDownloadModal } from '../QuranReader/DownloadModals';
import { quranData as rawQuranData } from '../../utils/quranData';
import { RECITERS, SURAH_LIST } from '../../data/listenQuranData';
import { getQuranThemeIdForLayout } from '../../utils/quranThemeHelper';
import { getShowPageGuides, setShowPageGuides } from '../../utils/guideManager';
import { showGlobalAppToast } from '../../utils/appNotificationSettings';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import {
  useListenQuranStore,
  isFloatingListenButtonEnabled,
  setFloatingListenButtonEnabled,
  FLOATING_LISTEN_BTN_VISIBILITY_EVENT,
} from '../../hooks/useListenQuranStore';

interface HomeScreenSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export const HomeScreenSettingsModal: React.FC<HomeScreenSettingsModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { language, t } = useLanguage();
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const isEn = language === 'en';

  // Active theme accent color for toggle switches
  const isSkyTheme = homeThemeVariant === 'sky';
  const isEmeraldTheme = homeThemeVariant === 'emerald';
  const isBurgundyTheme = homeThemeVariant === 'burgundy';

  const isBlackTheme = isNightMode || themeKey === 'deep_black' || theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';

  // Theme-matched background color identical to PrayerTimes & other pages
  const pageBgColor = isBlackTheme 
    ? '#000000' 
    : (theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff'
        ? theme.bgColor 
        : (isSkyTheme 
            ? '#F0F9FF' 
            : (isEmeraldTheme 
                ? '#F0FDF4' 
                : (isBurgundyTheme 
                    ? '#FFF1F2' 
                    : '#FEF9C3'))));

  const themeAccentColor = isNightMode 
    ? '#f59e0b' 
    : (isSkyTheme 
        ? '#0284c7' 
        : (isEmeraldTheme 
            ? '#047857' 
            : (isBurgundyTheme 
                ? '#881337' 
                : (theme.palette?.[0] || '#ca8a04'))));

  // Hide floating action button across entire settings page
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('settings-modal-open');
    } else {
      document.body.classList.remove('settings-modal-open');
    }
    return () => {
      document.body.classList.remove('settings-modal-open');
    };
  }, [isOpen]);

  // Sub-dialog states for full-screen pages
  const [showAppNotificationModal, setShowAppNotificationModal] = useState<boolean>(false);
  const [showPhoneNotificationModal, setShowPhoneNotificationModal] = useState<boolean>(false);
  const [showQuranSettingsModal, setShowQuranSettingsModal] = useState<boolean>(false);
  const [showQuranDownloadMenu, setShowQuranDownloadMenu] = useState<boolean>(false);
  const [showTafsirDownloadModal, setShowTafsirDownloadModal] = useState<boolean>(false);
  const [showApprovedSourcesModal, setShowApprovedSourcesModal] = useState<boolean>(false);
  const [activeDownloadType, setActiveDownloadType] = useState<'mushaf' | 'listen' | 'memorization' | null>(null);
  const [activeQuranSubModal, setActiveQuranSubModal] = useState<string | null>(null);

  const listenMockQuranData = React.useMemo(() => ({
    surahs: SURAH_LIST.map((s) => ({
      number: s.number,
      name: s.name,
      revelationType: SURAH_INFO[s.number]?.type === 'مكية' ? 'Meccan' : 'Medinan',
      ayahs: new Array(SURAH_INFO[s.number]?.ayahs || 0),
    })),
  }), []);

  // 1. Tawaf Counter Card state
  const [tawafState, setTawafState] = useState<TawafCounterState>(() => getTawafCounterState());

  // 2. Tasbeeh Card state
  const [showTasbeehCard, setShowTasbeehCard] = useState<boolean>(() => {
    try {
      return localStorage.getItem('show_quick_tasbeeh_home') === 'true';
    } catch {
      return false;
    }
  });

  // 3. Listen Quran Card state
  const [showListenCard, setShowListenCard] = useState<boolean>(() => {
    try {
      return localStorage.getItem('show_listen_quran_home') === 'true';
    } catch {
      return false;
    }
  });

  // 4. Floating Listen Button state (enabled by default)
  const [showFloatingListenBtn, setShowFloatingListenBtn] = useState<boolean>(() => isFloatingListenButtonEnabled());

  // 5. Show Page Guides button state
  const [showPageGuides, setShowPageGuidesState] = useState<boolean>(() => getShowPageGuides());

  // Keep state synced with external events and storage changes
  useEffect(() => {
    if (!isOpen) return;

    setTawafState(getTawafCounterState());
    try {
      setShowTasbeehCard(localStorage.getItem('show_quick_tasbeeh_home') === 'true');
      setShowListenCard(localStorage.getItem('show_listen_quran_home') === 'true');
      setShowFloatingListenBtn(isFloatingListenButtonEnabled());
      setShowPageGuidesState(getShowPageGuides());
    } catch {}

    const unsubscribeTawaf = subscribeTawafCounter((updated) => {
      setTawafState(updated);
    });

    const handleTasbeehChange = (e: any) => {
      if (typeof e?.detail?.enabled === 'boolean') {
        setShowTasbeehCard(e.detail.enabled);
      } else {
        try {
          setShowTasbeehCard(localStorage.getItem('show_quick_tasbeeh_home') === 'true');
        } catch {}
      }
    };

    const handleListenChange = (e: any) => {
      if (typeof e?.detail?.enabled === 'boolean') {
        setShowListenCard(e.detail.enabled);
      } else {
        try {
          setShowListenCard(localStorage.getItem('show_listen_quran_home') === 'true');
        } catch {}
      }
    };

    const handleFloatingListenBtnChange = (e: any) => {
      if (typeof e?.detail?.enabled === 'boolean') {
        setShowFloatingListenBtn(e.detail.enabled);
      } else {
        setShowFloatingListenBtn(isFloatingListenButtonEnabled());
      }
    };

    const handleStorageChange = () => {
      setTawafState(getTawafCounterState());
      try {
        setShowTasbeehCard(localStorage.getItem('show_quick_tasbeeh_home') === 'true');
        setShowListenCard(localStorage.getItem('show_listen_quran_home') === 'true');
        setShowFloatingListenBtn(isFloatingListenButtonEnabled());
      } catch {}
    };

    window.addEventListener('quick-tasbeeh-visibility-changed', handleTasbeehChange);
    window.addEventListener('quick_tasbeeh_visibility_changed', handleTasbeehChange);
    window.addEventListener('listen-card-visibility-changed', handleListenChange);
    window.addEventListener('listen_quran_visibility_changed', handleListenChange);
    window.addEventListener(FLOATING_LISTEN_BTN_VISIBILITY_EVENT, handleFloatingListenBtnChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribeTawaf();
      window.removeEventListener('quick-tasbeeh-visibility-changed', handleTasbeehChange);
      window.removeEventListener('quick_tasbeeh_visibility_changed', handleTasbeehChange);
      window.removeEventListener('listen-card-visibility-changed', handleListenChange);
      window.removeEventListener('listen_quran_visibility_changed', handleListenChange);
      window.removeEventListener(FLOATING_LISTEN_BTN_VISIBILITY_EVENT, handleFloatingListenBtnChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isOpen]);

  // Handlers for Toggles
  const handleToggleTawaf = () => {
    const nextVal = !tawafState.showOnHome;
    saveTawafCounterState({ showOnHome: nextVal });
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }
  };

  const handleToggleTasbeeh = () => {
    const nextVal = !showTasbeehCard;
    setShowTasbeehCard(nextVal);
    try {
      localStorage.setItem('show_quick_tasbeeh_home', nextVal ? 'true' : 'false');
    } catch {}
    window.dispatchEvent(new CustomEvent('quick-tasbeeh-visibility-changed', { detail: { enabled: nextVal } }));
    window.dispatchEvent(new CustomEvent('quick_tasbeeh_visibility_changed', { detail: { enabled: nextVal } }));
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }
  };

  const handleToggleListen = () => {
    const nextVal = !showListenCard;
    setShowListenCard(nextVal);
    try {
      localStorage.setItem('show_listen_quran_home', nextVal ? 'true' : 'false');
    } catch {}
    window.dispatchEvent(new CustomEvent('listen-card-visibility-changed', { detail: { enabled: nextVal } }));
    window.dispatchEvent(new CustomEvent('listen_quran_visibility_changed', { detail: { enabled: nextVal } }));
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }
  };

  const handleToggleFloatingListenBtn = () => {
    const nextVal = !showFloatingListenBtn;
    setShowFloatingListenBtn(nextVal);
    setFloatingListenButtonEnabled(nextVal);
    if (!nextVal) {
      const listenState = useListenQuranStore.getState();
      if (listenState.currentPage !== 'listen' && listenState.hasFloatingSession && !showListenCard) {
        listenState.stopFromFloating();
      }
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }
  };

  const handleTogglePageGuides = () => {
    const nextVal = !showPageGuides;
    setShowPageGuidesState(nextVal);
    setShowPageGuides(nextVal);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }
  };

  // Helper for Quran settings
  const getQuranCurrentSettings = () => {
    try {
      const saved = localStorage.getItem('quran_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  };

  const activeQuranThemeId = getQuranThemeIdForLayout('', undefined, 'mushaf') || 'black';
  const activeQuranTheme = THEMES[activeQuranThemeId as keyof typeof THEMES] || THEMES.black;

  const handleSelectFont = (fontId: string) => {
    try {
      const saved = localStorage.getItem('quran_settings');
      const cur = saved ? JSON.parse(saved) : {};
      const next = { ...cur, fontFamily: fontId };
      localStorage.setItem('quran_settings', JSON.stringify(next));
      window.dispatchEvent(new Event('settings-change'));
    } catch {}
    setActiveQuranSubModal(null);
  };

  const handleSelectReciter = (readerId: string) => {
    try {
      const saved = localStorage.getItem('quran_settings');
      const cur = saved ? JSON.parse(saved) : {};
      const next = { ...cur, reader: readerId };
      localStorage.setItem('quran_settings', JSON.stringify(next));
      window.dispatchEvent(new Event('settings-change'));
    } catch {}
    setActiveQuranSubModal(null);
  };

  const handleSelectTafseer = (tafseerId: string) => {
    try {
      const saved = localStorage.getItem('quran_settings');
      const cur = saved ? JSON.parse(saved) : {};
      const next = { ...cur, tafseer: tafseerId };
      localStorage.setItem('quran_settings', JSON.stringify(next));
      window.dispatchEvent(new Event('settings-change'));
    } catch {}
    setActiveQuranSubModal(null);
  };

  const handleSelectSurahDesign = (designNum: number) => {
    try {
      const saved = localStorage.getItem('quran_settings');
      const cur = saved ? JSON.parse(saved) : {};
      const next = { ...cur, surahHeaderDesign: designNum };
      localStorage.setItem('quran_settings', JSON.stringify(next));
      window.dispatchEvent(new Event('settings-change'));
    } catch {}
    setActiveQuranSubModal(null);
  };

  // Hardware/System Back Button Interceptor for Settings Page & All its Sub-views
  const backStateRef = useRef({
    activeQuranSubModal,
    activeDownloadType,
    showTafsirDownloadModal,
    showQuranDownloadMenu,
    showQuranSettingsModal,
    showAppNotificationModal,
    showPhoneNotificationModal,
    showApprovedSourcesModal,
    onClose
  });
  backStateRef.current = {
    activeQuranSubModal,
    activeDownloadType,
    showTafsirDownloadModal,
    showQuranDownloadMenu,
    showQuranSettingsModal,
    showAppNotificationModal,
    showPhoneNotificationModal,
    showApprovedSourcesModal,
    onClose
  };

  useEffect(() => {
    if (!isOpen) return;

    const interceptor = () => {
      const s = backStateRef.current;
      // 1. If any sub-modal in Quran Settings is open (font, reciter, tafseer, design picker)
      if (s.activeQuranSubModal) {
        setActiveQuranSubModal(null);
        return true;
      }
      // 2. If any download modal is open (Mushaf, Listen, Memorization)
      if (s.activeDownloadType) {
        setActiveDownloadType(null);
        return true;
      }
      // 3. If Tafsir download modal is open
      if (s.showTafsirDownloadModal) {
        setShowTafsirDownloadModal(false);
        return true;
      }
      // 4. If Download Quran Menu (the 3 cards) is open
      if (s.showQuranDownloadMenu) {
        setShowQuranDownloadMenu(false);
        return true;
      }
      // 5. If Quran Settings modal is open
      if (s.showQuranSettingsModal) {
        setShowQuranSettingsModal(false);
        return true;
      }
      // 6. If App notifications modal is open
      if (s.showAppNotificationModal) {
        setShowAppNotificationModal(false);
        return true;
      }
      // 7. If Phone notifications modal is open
      if (s.showPhoneNotificationModal) {
        setShowPhoneNotificationModal(false);
        return true;
      }
      // 8. If Approved Sources & References modal is open
      if (s.showApprovedSourcesModal) {
        setShowApprovedSourcesModal(false);
        return true;
      }
      // 9. If on the main settings screen, close settings modal
      s.onClose();
      return true;
    };

    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="home-screen-settings-modal"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-0 z-[999999] flex flex-col font-cairo select-none overflow-hidden"
        style={{ 
          backgroundColor: pageBgColor
        }}
        dir={isEn ? 'ltr' : 'rtl'}
      >
        {/* Standard Page Header - Identical to Adia.tsx */}
        <header className="app-top-bar settings-top-bar shrink-0 w-full" dir={isEn ? 'ltr' : 'rtl'} style={{ display: 'block' }}>
          <div className="app-top-bar__inner">
            <div className="relative flex items-center justify-center w-full min-h-[44px]">
              {/* Back button */}
              <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  title={isEn ? "Go Back" : "رجوع للخلف"}
                  aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                >
                  <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                </button>
              </div>

              {/* Title in center */}
              <div className="text-center px-12 min-w-0">
                <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                  {isEn ? 'Settings' : 'الإعدادات'}
                </h1>
              </div>

              {/* Home button */}
              <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  title={isEn ? "Home" : "الصفحة الرئيسية"}
                  aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
                >
                  <i className="fa-solid fa-house text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Settings Content with dynamic safe area */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pt-5 app-scroll-safe space-y-4 no-scrollbar max-w-2xl mx-auto w-full"
        >
          
          {/* SECTION 1: Action Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Grouped Large Card: Notifications */}
            <div className="p-4 sm:p-5 rounded-3xl transition-all white-3d-container-card space-y-3">
              <div className="pb-2 border-b border-amber-500/20 dark:border-zinc-800">
                <h3
                  className="text-sm sm:text-base font-black tracking-wide"
                  style={{ color: themeAccentColor }}
                >
                  {isEn ? 'Notifications' : 'الإشعارات'}
                </h3>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Card 1: App Notifications */}
                <button
                  type="button"
                  onClick={() => setShowAppNotificationModal(true)}
                  className="w-full text-start p-3.5 sm:p-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between white-3d-card-btn shadow-xs border-0"
                >
                  <h4 className="text-base sm:text-lg font-black truncate">
                    {isEn ? 'App Notifications' : 'إشعارات التطبيق'}
                  </h4>
                </button>

                {/* Card 2: Phone Notifications */}
                <button
                  type="button"
                  onClick={() => setShowPhoneNotificationModal(true)}
                  className="w-full text-start p-3.5 sm:p-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between white-3d-card-btn shadow-xs border-0"
                >
                  <h4 className="text-base sm:text-lg font-black truncate">
                    {isEn ? 'Phone Notifications' : 'إشعارات الهاتف'}
                  </h4>
                </button>
              </div>
            </div>

            {/* Card 3: Quran Settings */}
            <button
              type="button"
              onClick={() => setShowQuranSettingsModal(true)}
              className="w-full text-start p-4 sm:p-5 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between white-3d-card-btn"
            >
              <h4 className="text-base sm:text-lg font-black truncate">
                {isEn ? 'Quran Page Settings' : 'إعدادات صفحة القرآن'}
              </h4>
            </button>

            {/* Grouped Large Card: Downloads */}
            <div className="p-4 sm:p-5 rounded-3xl transition-all white-3d-container-card space-y-3">
              <div className="pb-2 border-b border-amber-500/20 dark:border-zinc-800">
                <h3
                  className="text-sm sm:text-base font-black tracking-wide"
                  style={{ color: themeAccentColor }}
                >
                  {isEn ? 'Downloads' : 'التحميلات'}
                </h3>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Download Holy Quran */}
                <button
                  type="button"
                  onClick={() => setShowQuranDownloadMenu(true)}
                  className="w-full text-start p-3.5 sm:p-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between white-3d-card-btn shadow-xs border-0"
                >
                  <h4 className="text-base sm:text-lg font-black truncate">
                    {isEn ? 'Download Holy Quran' : 'تحميل القرآن الكريم'}
                  </h4>
                </button>

                {/* Download Tafseers */}
                <button
                  type="button"
                  onClick={() => setShowTafsirDownloadModal(true)}
                  className="w-full text-start p-3.5 sm:p-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between white-3d-card-btn shadow-xs border-0"
                >
                  <h4 className="text-base sm:text-lg font-black truncate">
                    {isEn ? 'Download Tafseers' : 'تحميل التفاسير'}
                  </h4>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Single-Tap Toggles (Only Main Large Titles, No Small Subtitles) */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {/* Grouped Large Card: Show on Home Screen */}
            <div className="p-4 sm:p-5 rounded-3xl transition-all white-3d-container-card space-y-3">
              <div className="pb-2 border-b border-amber-500/20 dark:border-zinc-800">
                <h3
                  className="text-sm sm:text-base font-black tracking-wide"
                  style={{ color: themeAccentColor }}
                >
                  {isEn ? 'Show on Home Screen' : 'الظهور بالصفحة الرئيسية'}
                </h3>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Toggle 1: Listen to Quran Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl transition-all flex items-center justify-between gap-4 white-3d-card-btn shadow-xs border-0">
                  <h4 className="text-base sm:text-lg font-black truncate min-w-0 flex-1">
                    {isEn ? 'Show Listen to Quran Card' : 'بطاقة الاستماع للقرآن'}
                  </h4>

                  <button
                    type="button"
                    onClick={handleToggleListen}
                    className={`relative w-13 h-7 rounded-full transition-colors duration-200 ease-in-out shrink-0 p-0.5 cursor-pointer border-none outline-none ${
                      !showListenCard ? (isNightMode ? 'bg-zinc-700' : 'bg-slate-300') : ''
                    }`}
                    style={{
                      backgroundColor: showListenCard ? themeAccentColor : undefined
                    }}
                    role="switch"
                    aria-checked={showListenCard}
                    title={showListenCard ? (isEn ? 'Disable' : 'تعطيل') : (isEn ? 'Enable' : 'تفعيل')}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform ${
                        showListenCard ? (isEn ? 'translate-x-6' : '-translate-x-6') : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Tasbeeh Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl transition-all flex items-center justify-between gap-4 white-3d-card-btn shadow-xs border-0">
                  <h4 className="text-base sm:text-lg font-black truncate min-w-0 flex-1">
                    {isEn ? 'Tasbeeh Card' : 'بطاقة التسبيح'}
                  </h4>

                  <button
                    type="button"
                    onClick={handleToggleTasbeeh}
                    className={`relative w-13 h-7 rounded-full transition-colors duration-200 ease-in-out shrink-0 p-0.5 cursor-pointer border-none outline-none ${
                      !showTasbeehCard ? (isNightMode ? 'bg-zinc-700' : 'bg-slate-300') : ''
                    }`}
                    style={{
                      backgroundColor: showTasbeehCard ? themeAccentColor : undefined
                    }}
                    role="switch"
                    aria-checked={showTasbeehCard}
                    title={showTasbeehCard ? (isEn ? 'Disable' : 'تعطيل') : (isEn ? 'Enable' : 'تفعيل')}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform ${
                        showTasbeehCard ? (isEn ? 'translate-x-6' : '-translate-x-6') : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3: Tawaf Counter Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl transition-all flex items-center justify-between gap-4 white-3d-card-btn shadow-xs border-0">
                  <h4 className="text-base sm:text-lg font-black truncate min-w-0 flex-1">
                    {isEn ? 'Tawaf & Sa\'i Counter Card' : 'بطاقة عداد الأشواط'}
                  </h4>

                  <button
                    type="button"
                    onClick={handleToggleTawaf}
                    className={`relative w-13 h-7 rounded-full transition-colors duration-200 ease-in-out shrink-0 p-0.5 cursor-pointer border-none outline-none ${
                      !tawafState.showOnHome ? (isNightMode ? 'bg-zinc-700' : 'bg-slate-300') : ''
                    }`}
                    style={{
                      backgroundColor: tawafState.showOnHome ? themeAccentColor : undefined
                    }}
                    role="switch"
                    aria-checked={tawafState.showOnHome}
                    title={tawafState.showOnHome ? (isEn ? 'Disable' : 'تعطيل') : (isEn ? 'Enable' : 'تفعيل')}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform ${
                        tawafState.showOnHome ? (isEn ? 'translate-x-6' : '-translate-x-6') : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 4: Floating Audio Button */}
                <div className="p-3.5 sm:p-4 rounded-2xl transition-all flex items-center justify-between gap-4 white-3d-card-btn shadow-xs border-0">
                  <h4 className="text-base sm:text-lg font-black truncate min-w-0 flex-1">
                    {isEn ? 'Floating Audio Button' : 'زر الصوت العائم'}
                  </h4>

                  <button
                    type="button"
                    onClick={handleToggleFloatingListenBtn}
                    className={`relative w-13 h-7 rounded-full transition-colors duration-200 ease-in-out shrink-0 p-0.5 cursor-pointer border-none outline-none ${
                      !showFloatingListenBtn ? (isNightMode ? 'bg-zinc-700' : 'bg-slate-300') : ''
                    }`}
                    style={{
                      backgroundColor: showFloatingListenBtn ? themeAccentColor : undefined
                    }}
                    role="switch"
                    aria-checked={showFloatingListenBtn}
                    title={showFloatingListenBtn ? (isEn ? 'Disable' : 'تعطيل') : (isEn ? 'Enable' : 'تفعيل')}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform ${
                        showFloatingListenBtn ? (isEn ? 'translate-x-6' : '-translate-x-6') : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle 4: Show Page Guides Button */}
            <div className="p-4 sm:p-5 rounded-2xl transition-all flex items-center justify-between gap-4 white-3d-card-btn">
              <h4 className="text-base sm:text-lg font-black truncate min-w-0 flex-1">
                {isEn ? 'Guides Button' : 'زر الإرشادات'}
              </h4>

              <button
                type="button"
                onClick={handleTogglePageGuides}
                className={`relative w-13 h-7 rounded-full transition-colors duration-200 ease-in-out shrink-0 p-0.5 cursor-pointer border-none outline-none ${
                  !showPageGuides ? (isNightMode ? 'bg-zinc-700' : 'bg-slate-300') : ''
                }`}
                style={{
                  backgroundColor: showPageGuides ? themeAccentColor : undefined
                }}
                role="switch"
                aria-checked={showPageGuides}
                title={showPageGuides ? (isEn ? 'Disable' : 'تعطيل') : (isEn ? 'Enable' : 'تفعيل')}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform ${
                    showPageGuides ? (isEn ? 'translate-x-6' : '-translate-x-6') : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Approved Sources & References Button */}
            <button
              type="button"
              id="btn-approved-sources"
              onClick={() => setShowApprovedSourcesModal(true)}
              className="w-full text-start p-4 sm:p-5 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3 white-3d-card-btn"
            >
              <div className="flex items-center gap-3 min-w-0">
                <BookCheck
                  size={20}
                  strokeWidth={2.2}
                  className="shrink-0"
                  style={{ color: isBlackTheme ? '#000000' : themeAccentColor }}
                />
                <h4 className="text-base sm:text-lg font-black truncate">
                  {t('settings.approved_sources')}
                </h4>
              </div>
            </button>
          </div>
        </div>

        {/* Full-Screen Child Page 1: App Notifications */}
        {showAppNotificationModal && (
          <NotificationSettingsModal
            onClose={() => setShowAppNotificationModal(false)}
            showToast={showGlobalAppToast}
            isLandscape={false}
            modeSuffix=""
            initialTab="app"
            hidePhoneTab={true}
          />
        )}

        {/* Full-Screen Child Page 2: Phone Notifications for System */}
        {showPhoneNotificationModal && (
          <NotificationSettingsModal
            onClose={() => setShowPhoneNotificationModal(false)}
            showToast={showGlobalAppToast}
            isLandscape={false}
            modeSuffix=""
            initialTab="phone"
            hideAppTab={true}
            phoneTabTitle={isEn ? 'Phone Notifications' : 'إشعارات الهاتف'}
          />
        )}

        {/* Full-Screen Child Page 3: Quran Settings */}
        {showQuranSettingsModal && (
          <SettingsModal
            onClose={() => setShowQuranSettingsModal(false)}
            onOpenModal={(modalName) => {
              if (modalName === 'notification-settings-modal') {
                setShowPhoneNotificationModal(true);
              } else {
                setActiveQuranSubModal(modalName);
              }
            }}
            showToast={showGlobalAppToast}
            isLandscape={false}
            readingMode="mushaf"
            modeSuffix=""
          />
        )}

        {/* Sub-modals triggered from Quran Settings */}
        {activeQuranSubModal === 'font-modal' && (
          <FontSelectModal
            isOpen={true}
            onClose={() => setActiveQuranSubModal(null)}
            currentFontId={getQuranCurrentSettings().fontFamily}
            onSelect={handleSelectFont}
            isLandscape={false}
            readingMode="mushaf"
          />
        )}

        {activeQuranSubModal === 'reciter-modal' && (
          <ReciterSelectModal
            onClose={() => setActiveQuranSubModal(null)}
            currentReader={getValidReaderForMode('mushaf', getQuranCurrentSettings().reader)}
            isLandscape={false}
            readersList={READERS}
            readingMode="mushaf"
            hideHeader={true}
            onSelect={handleSelectReciter}
          />
        )}

        {activeQuranSubModal === 'tafseer-selection-modal' && (
          <TafseerSelectionModal
            isOpen={true}
            onClose={() => setActiveQuranSubModal(null)}
            currentTafseerId={getQuranCurrentSettings().tafseer}
            onSelect={handleSelectTafseer}
            isLandscape={false}
            currentTheme={activeQuranTheme}
          />
        )}

        {activeQuranSubModal === 'surah-design-picker' && (
          <SurahDesignPickerModal
            isOpen={true}
            onClose={() => setActiveQuranSubModal(null)}
            currentDesign={Number(getQuranCurrentSettings().surahHeaderDesign) || 1}
            onSelectDesign={handleSelectSurahDesign}
            currentTheme={activeQuranTheme}
            isLandscape={false}
          />
        )}

        {/* Full-Screen Child Page 4: Download Holy Quran (3 Options) */}
        {showQuranDownloadMenu && (
          <div
            className="fixed inset-0 z-[9999999] flex flex-col font-cairo select-none overflow-hidden animate-fadeIn"
            style={{ backgroundColor: pageBgColor }}
            dir={isEn ? 'ltr' : 'rtl'}
          >
            <header className="app-top-bar settings-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
              <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center w-full min-h-[44px]">
                  <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                    <button
                      type="button"
                      onClick={() => setShowQuranDownloadMenu(false)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                      title={isEn ? 'Go Back' : 'رجوع للخلف'}
                      aria-label={isEn ? 'Go Back' : 'رجوع للخلف'}
                    >
                      <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                    </button>
                  </div>

                  <div className="text-center px-12 min-w-0">
                    <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                      {isEn ? 'Download Holy Quran' : 'تحميل القرآن الكريم'}
                    </h1>
                  </div>

                  <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuranDownloadMenu(false);
                        onClose();
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                      title={isEn ? 'Home' : 'الصفحة الرئيسية'}
                      aria-label={isEn ? 'Home' : 'الصفحة الرئيسية'}
                    >
                      <i className="fa-solid fa-house text-xl"></i>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div 
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pt-5 app-scroll-safe space-y-3 no-scrollbar max-w-2xl mx-auto w-full"
            >
              {/* 1. Download Mushaf */}
              <button
                type="button"
                onClick={() => setActiveDownloadType('mushaf')}
                className="w-full text-start p-4 sm:p-5 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between white-3d-card-btn"
              >
                <h4 className="text-base sm:text-lg font-black truncate">
                  {isEn ? 'Download Mushaf' : 'تحميل المصحف'}
                </h4>
              </button>

              {/* 2. Download Listen to Quran */}
              <button
                type="button"
                onClick={() => setActiveDownloadType('listen')}
                className="w-full text-start p-4 sm:p-5 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between white-3d-card-btn"
              >
                <h4 className="text-base sm:text-lg font-black truncate">
                  {isEn ? 'Download Listen to Quran' : 'تحميل الاستماع للقرآن'}
                </h4>
              </button>

              {/* 3. Download Memorization */}
              <button
                type="button"
                onClick={() => setActiveDownloadType('memorization')}
                className="w-full text-start p-4 sm:p-5 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between white-3d-card-btn"
              >
                <h4 className="text-base sm:text-lg font-black truncate">
                  {isEn ? 'Download Memorization' : 'تحميل التحفيظ'}
                </h4>
              </button>
            </div>
          </div>
        )}

        {/* Active Download Modal (Mushaf / Listen / Memorization) */}
        {activeDownloadType === 'mushaf' && (
          <QuranDownloadModal
            onClose={() => setActiveDownloadType(null)}
            quranData={rawQuranData}
            showToast={showGlobalAppToast}
            isLandscape={false}
            mode="ayah"
            readersList={ARABIC_READERS}
            zIndexClass="z-[99999999]"
            title={isEn ? 'Download Mushaf' : 'تحميل المصحف'}
            isFromHomeScreenSettings={true}
          />
        )}

        {activeDownloadType === 'listen' && (
          <QuranDownloadModal
            onClose={() => setActiveDownloadType(null)}
            quranData={listenMockQuranData}
            showToast={showGlobalAppToast}
            isLandscape={false}
            mode="surah"
            readersList={RECITERS}
            zIndexClass="z-[99999999]"
            title={isEn ? 'Download Listen to Quran' : 'تحميل الاستماع للقرآن'}
            isFromHomeScreenSettings={true}
          />
        )}

        {activeDownloadType === 'memorization' && (
          <QuranDownloadModal
            onClose={() => setActiveDownloadType(null)}
            quranData={rawQuranData}
            showToast={showGlobalAppToast}
            isLandscape={false}
            mode="ayah"
            readersList={MEMORIZATION_READERS}
            zIndexClass="z-[99999999]"
            title={isEn ? 'Download Memorization' : 'تحميل التحفيظ'}
            isFromHomeScreenSettings={true}
          />
        )}

        {showTafsirDownloadModal && (
          <TafsirDownloadModal
            onClose={() => setShowTafsirDownloadModal(false)}
            quranData={rawQuranData}
            showToast={showGlobalAppToast}
            isLandscape={false}
            zIndexClass="z-[99999999]"
            title={isEn ? 'Download Tafseers' : 'تحميل التفاسير'}
            isFromHomeScreenSettings={true}
          />
        )}

        {/* Full-Screen Child Page 5: Approved Sources & References */}
        <ApprovedSourcesModal
          isOpen={showApprovedSourcesModal}
          onClose={() => setShowApprovedSourcesModal(false)}
          onHome={() => {
            setShowApprovedSourcesModal(false);
            onClose();
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default HomeScreenSettingsModal;
