
import React, { useState, useCallback, useEffect } from 'react';
import ThemeSelector from './components/ThemesModal';
import ExitConfirmModal from './components/ExitConfirmModal';
import AppRouter from './router/AppRouter';
import WelcomeSplash from './components/WelcomeSplash';
import VideoSplash from './components/VideoSplash';
import { useLanguage } from './context/LanguageContext';
import RateUs from './components/RateUs';
import { useWakeLock } from './hooks/useWakeLock';
import { useBackButton } from './hooks/useBackButton';
import { App as CapacitorApp } from '@capacitor/app';
import { PrayerTimesProvider } from './context/PrayerTimesContext';
import { VoiceControlProvider, useVoiceControl } from './context/VoiceControlContext';
import { TutorialProvider } from './context/TutorialContext';
import SideMenu from './components/SideMenu';
import MawlidNotification from './components/MawlidNotification';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './context/ThemeContext';
import { normalizeArabic } from './utils/voiceParser';
import { usePrayerTimes } from './context/PrayerTimesContext';
import { setupNotifications } from './utils/notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { clearSearchCache } from './pages/GlobalSearch';
import IqamaAlertModal from './components/PrayerTimes/IqamaAlertModal';
import AdhanAlertModal from './components/PrayerTimes/AdhanAlertModal';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { APP_VERSION, REMOTE_VERSION_URL, GOOGLE_PLAY_URL } from './constants';
import UpdateNotificationModal from './components/UpdateNotificationModal';
import { recordAppLaunch, markPageAsSeen } from './utils/badgeManager';
import { recordAppVisit } from './utils/favoriteAppsManager';
import WirdAlertModal from './components/DailyWird/WirdAlertModal';
import { 
  WirdAlertData, 
  getActiveWirdProfile, 
  calculateWirdStatus, 
  getWirdDayRange, 
  getWirdTotalDays, 
  buildWirdNotificationContent, 
  checkWirdAlertOnAppResume, 
  markWirdAlertShownToday 
} from './utils/dailyWirdNotificationService';
import { getPendingShortcutInfo, markNativeShortcutConsumed, updateNativeAlertsGroupSummary } from './utils/silentMode';
import ScrollToTopFAB from './components/ScrollToTopFAB';

// --- Main App Component ---
function App() {
  const { theme, applyPresetTheme, setCurrentPage } = useTheme();
  const { setLanguage } = useLanguage();

  // Helper to normalize shortcut targets to application page IDs
  const normalizeShortcutTarget = useCallback((target: string): string => {
    if (!target) return 'home';
    let clean = target.toLowerCase().trim();
    if (clean.includes('quran')) return 'quran';
    if (clean.includes('prayer') || clean.includes('salah') || clean.includes('times')) return 'prayer-times';
    if (clean.includes('qibla')) return 'qibla';
    if (clean.includes('seerah')) return 'prophetic-seerah';
    if (clean.includes('hisn') || clean.includes('azkar') || clean.includes('athkar')) return 'hisn-muslim';
    if (clean.includes('tasbeeh')) return 'tasbeeh';
    if (clean.includes('calendar')) return 'calendar';
    return clean;
  }, []);

  const lastHandledShortcutSeqRef = React.useRef<number>(0);

  // Synchronously check if launched directly from a launcher shortcut or deep link
  const initialShortcut = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('pending_shortcut_target');
      const storedSeqStr = localStorage.getItem('pending_shortcut_seq');
      localStorage.removeItem('pending_shortcut_target');
      localStorage.removeItem('pending_shortcut_seq');
      const storedSeq = storedSeqStr ? parseInt(storedSeqStr, 10) : 0;
      if (storedSeq > 0) {
        lastHandledShortcutSeqRef.current = storedSeq;
      }
      if (typeof window !== 'undefined' && (window as any).__pendingShortcut) {
        const rawPending = (window as any).__pendingShortcut;
        delete (window as any).__pendingShortcut;
        if (typeof rawPending === 'object' && rawPending !== null) {
          if (typeof rawPending.seq === 'number' && rawPending.seq > 0) {
            lastHandledShortcutSeqRef.current = rawPending.seq;
          }
          if (rawPending.target) {
            return normalizeShortcutTarget(String(rawPending.target));
          }
        } else if (typeof rawPending === 'string' && rawPending.trim()) {
          return normalizeShortcutTarget(rawPending);
        }
      }
      if (stored && stored.trim()) {
        return normalizeShortcutTarget(stored);
      }
    } catch (e) {}
    return null;
  }, [normalizeShortcutTarget]);

  const launchUrlHandledRef = React.useRef<boolean>(Boolean(initialShortcut));
  const currentOrientationRef = React.useRef<'portrait' | 'landscape'>('portrait');

  const [splashStage, setSplashStage] = useState<'video' | 'welcome' | 'app'>(() => {
    if (initialShortcut) return 'app';
    return 'video';
  });

  // Track app launch count for "جديد" badge and sync first-time preferences
  useEffect(() => {
    recordAppLaunch();
    try {
      Preferences.get({ key: 'has_selected_initial_language' }).then(({ value }) => {
        if (value === 'true') {
          try {
            localStorage.setItem('has_selected_initial_language', 'true');
          } catch (e) {}
        }
      }).catch(() => {});
      Preferences.get({ key: 'home_layout_system' }).then(({ value }) => {
        if (value === 'classic' || value === 'modern') {
          try {
            localStorage.setItem('home_layout_system', value);
          } catch (e) {}
        }
      }).catch(() => {});
    } catch (e) {}
  }, []);

  const [history, setHistory] = useState<string[]>(() => {
    // Clear any previous saved history/page so fresh app launch from icon always opens directly on the home page
    try {
      localStorage.removeItem('last_active_history');
      localStorage.removeItem('last_active_page');
    } catch (e) {}

    if (initialShortcut && initialShortcut !== 'home') {
      return ['home', initialShortcut];
    }
    return ['home'];
  });
  const [navParams, setNavParams] = useState<any>(null);
  const [lastMenuPage, setLastMenuPage] = useState('home');
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  
  // --- Update Notification Logic ---
  const [updateInfo, setUpdateInfo] = useState<{ show: boolean; newVersion: string }>({ show: false, newVersion: '' });

  useEffect(() => {
    const checkUpdate = async () => {
      if (!REMOTE_VERSION_URL || REMOTE_VERSION_URL.includes('your-server.com')) return;

      try {
        // إضافة timestamp للرابط لمنع التخزين المؤقت (Cache Busting)
        const cacheBuster = `t=${new Date().getTime()}`;
        const fullUrl = REMOTE_VERSION_URL.includes('?') 
          ? `${REMOTE_VERSION_URL}&${cacheBuster}` 
          : `${REMOTE_VERSION_URL}?${cacheBuster}`;

        const response = await fetch(fullUrl, { cache: 'no-store' });
        
        if (!response.ok) {
          console.warn('Update check: Server returned error', response.status);
          return;
        }
        
        const data = await response.json();
        const localVersion = APP_VERSION.trim();
        const remoteVersion = (data?.version || '').toString().trim();

        console.log(`Update check: Local [${localVersion}] Remote [${remoteVersion}]`);

        if (remoteVersion && remoteVersion !== localVersion) {
            console.log('Update found! Showing modal...');
            setUpdateInfo({ show: true, newVersion: remoteVersion });
        }
      } catch (error) {
        console.warn('Update check failed:', error);
      }
    };

    // فحص التحديث بعد ثانية واحدة من التشغيل
    const timeout = setTimeout(checkUpdate, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const currentPage = history[history.length - 1];
    const prevInHistory = history.length >= 2 ? history[history.length - 2] : undefined;
    if (
      currentPage === 'search' &&
      (prevInHistory === 'quran' ||
        prevInHistory === 'quran-landscape' ||
        navParams?.from === 'quran' ||
        navParams?.from === 'quran-landscape' ||
        navParams?.fromSidebar)
    ) {
      const isLandscapeOrigin = prevInHistory === 'quran-landscape' || navParams?.from === 'quran-landscape';
      setCurrentPage(isLandscapeOrigin ? 'quran_search_landscape' : 'quran_search');
    } else {
      setCurrentPage(currentPage);
    }
    if (currentPage && currentPage !== 'home') {
      markPageAsSeen(currentPage);
    }
  }, [history, navParams, setCurrentPage]);

  useEffect(() => {
    if (!history.includes('search')) {
      clearSearchCache();
    }
    const currentPage = history[history.length - 1];
    if (currentPage === 'home') {
      setLastMenuPage(currentPage);
    }

    // --- Orientation Management (سلاسة وسرعة لحظية بدون تكرار أو تعليق) ---
    if (Capacitor.isNativePlatform()) {
      const targetOrientation = currentPage === 'quran-landscape' ? 'landscape' : 'portrait';
      if (currentOrientationRef.current !== targetOrientation) {
        currentOrientationRef.current = targetOrientation;
        ScreenOrientation.lock({ orientation: targetOrientation }).catch((e) => {
          console.warn('Orientation management failed:', e);
        });
      }
    }
  }, [history]);

  const handleNavigate = useCallback((pageId: string, params?: any) => {
    setIsSideMenuOpen(false);

    const rawPageId = pageId;
    // Normalize any legacy/alternative aliases to canonical page IDs
    const pageAliasMap: Record<string, string> = {
      'quran-search': 'search',
      'global-search': 'search',
      'athkar-salah': 'salah-adhkar',
      'adhkar': 'sabah-masaa',
      'athkar-sabah-massa': 'sabah-masaa',
      'roqya': 'others',
      'ruqyah': 'others',
      'asma-allah': 'asmaul-husna',
      'asmaa-allah': 'asmaul-husna',
      'seerah': 'prophetic-seerah',
      'hadith': 'nawawi',
      'misbaha': 'tasbeeh',
      'sebha': 'tasbeeh',
    };
    pageId = pageAliasMap[pageId] || pageId;
    if (rawPageId === 'quran-search') {
      params = { ...(params || {}), from: params?.from || 'quran' };
    }

    const validPages = [
      'home', 'quran', 'quran-landscape', 'quran-download', 'salah-adhkar', 'calendar', 'listen', 'tasbeeh', 
      'hajj-umrah', 'hisn-muslim', 'prayer-times', 'monthly-prayer-times', 'qibla', 
      'sabah-masaa', 'adia', 'nawawi', 'calculators', 'voice-control', 'daily-wird', 'memorization',
      'phone-notifications', 'search', 'asmaul-husna', 'habit-tracker', 'others', 'islamic-sites',
      'prophetic-seerah', 'ten-promised'
    ];

    if (pageId === 'phone-notifications') {
      setNavParams({ openModal: 'notification-settings-modal' });
      setHistory(['home', 'quran']);
      return;
    }

    if (pageId === 'settings') {
      setNavParams({ openModal: 'settings-modal' });
      setHistory(['home', 'quran']);
      return;
    }

    if (pageId === 'home') {
      setHistory(['home']);
      setNavParams(null);
      return;
    }

    if (validPages.includes(pageId)) {
      if (pageId !== 'home') {
        markPageAsSeen(pageId);
        recordAppVisit(pageId);
      }
      setNavParams(params || null);
      setHistory(prev => {
        const current = prev[prev.length - 1];
        if (current === pageId) return prev;


        // 2. Monthly Prayer Times inside Prayer Times
        if (pageId === 'monthly-prayer-times') {
          const prayerIdx = prev.lastIndexOf('prayer-times');
          if (prayerIdx !== -1) {
            return [...prev.slice(0, prayerIdx + 1), pageId];
          }
          return ['home', 'prayer-times', pageId];
        }

        // 3. Quran Landscape
        if (pageId === 'quran-landscape') {
          const quranIdx = prev.lastIndexOf('quran');
          if (quranIdx !== -1) {
            return [...prev.slice(0, quranIdx + 1), pageId];
          }
          if (params?.isWird) {
            const wirdIdx = prev.lastIndexOf('daily-wird');
            if (wirdIdx !== -1) {
              return [...prev.slice(0, wirdIdx + 1), pageId];
            }
            return ['home', 'daily-wird', pageId];
          }
          if (params?.isMemorization || params?.isMemorizationMode || params?.memorizationSettings) {
            const memIdx = prev.lastIndexOf('memorization');
            if (memIdx !== -1) {
              return [...prev.slice(0, memIdx + 1), pageId];
            }
            return ['home', 'memorization', pageId];
          }
          return ['home', pageId];
        }

        // 4. Quran from Daily Wird or Memorization
        if (pageId === 'quran') {
          if (params?.isWird) {
            const wirdIdx = prev.lastIndexOf('daily-wird');
            if (wirdIdx !== -1) {
              return [...prev.slice(0, wirdIdx + 1), pageId];
            }
            return ['home', 'daily-wird', pageId];
          }
          if (params?.isMemorization || params?.isMemorizationMode || params?.memorizationSettings) {
            const memIdx = prev.lastIndexOf('memorization');
            if (memIdx !== -1) {
              return [...prev.slice(0, memIdx + 1), pageId];
            }
            return ['home', 'memorization', pageId];
          }
          return ['home', pageId];
        }

        // 5. Daily Wird
        if (pageId === 'daily-wird') {
          return ['home', 'daily-wird'];
        }

        // 6. Search (Advanced Search) - Preserve origin page (Quran, etc.) so back button returns properly
        if (pageId === 'search') {
          const quranLandscapeIdx = prev.lastIndexOf('quran-landscape');
          if (quranLandscapeIdx !== -1 && (current === 'quran-landscape' || params?.from === 'quran-landscape')) {
            return [...prev.slice(0, quranLandscapeIdx + 1), pageId];
          }
          const quranIdx = prev.lastIndexOf('quran');
          if (quranIdx !== -1 && (current === 'quran' || params?.from === 'quran')) {
            return [...prev.slice(0, quranIdx + 1), pageId];
          }
          if (params?.from === 'quran-landscape') {
            return ['home', 'quran-landscape', pageId];
          }
          if (params?.from === 'quran') {
            return ['home', 'quran', pageId];
          }
          if (current && current !== 'home') {
            return [...prev, pageId];
          }
          return ['home', pageId];
        }

        return ['home', pageId];
      });
    } else {
      alert(`التنقل إلى قسم "${pageId}" قيد الإنشاء.`);
    }
  }, []);

  useEffect(() => {
    setupNotifications();

    let actionListener: any = null;
    let receivedListener: any = null;
    if (Capacitor.isNativePlatform()) {
      // On native APK, notifications & alerts appear ONLY in the phone's top status bar.
      // Tapping a notification in the status bar navigates directly without opening any in-app alert modal.
      actionListener = LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        updateNativeAlertsGroupSummary();
        const extra = notificationAction.notification.extra;
        const page = extra?.page;
        const params = extra?.params;
        const type = extra?.type;
        if (type === 'daily-wird' || page === 'daily-wird') {
          handleNavigate('daily-wird');
        } else if (page) {
          handleNavigate(page, params);
        } else if (type === 'iqama') {
          handleNavigate('prayer-times');
        }
      });

      receivedListener = LocalNotifications.addListener('localNotificationReceived', () => {
        updateNativeAlertsGroupSummary();
      });
    }

    return () => {
      if (actionListener) {
        actionListener.then((l: any) => l.remove());
      }
      if (receivedListener) {
        receivedListener.then((l: any) => l.remove());
      }
    };
  }, [handleNavigate]);

  const performUiClick = useCallback((label: string) => {
    const normalizedLabel = normalizeArabic(label);
    const elements = document.querySelectorAll('button, [role="button"], a, .clickable, .voice-target');
    for (const el of Array.from(elements)) {
      const htmlEl = el as HTMLElement;
      const text = normalizeArabic(htmlEl.innerText || htmlEl.getAttribute('aria-label') || htmlEl.title || '');
      if (text && text.includes(normalizedLabel)) {
        console.log('Voice Control - Simulating click on:', text);
        htmlEl.click();
        return true;
      }
    }
    return false;
  }, []);

  const navigateBack = useCallback(() => {
    setHistory(prev => {
      const current = prev[prev.length - 1];
      if (current === 'search') {
        const fromTarget = navParams?.from;
        const returnSidebar = navParams?.fromSidebar;
        if (returnSidebar) {
          setNavParams({ openSidebar: true, isWird: navParams?.isWird });
        } else {
          setNavParams(null);
        }
        if ((fromTarget === 'quran' || fromTarget === 'quran-landscape') && !prev.includes(fromTarget)) {
          return ['home', fromTarget];
        }
      } else {
        setNavParams(null);
      }
      return (prev.length > 1 ? prev.slice(0, -1) : prev);
    });
  }, [navParams]);

  // --- Deep Linking from Android Widgets, Notifications & App Shortcuts ---
  useEffect(() => {
    let isMounted = true;

    const consumeAndNavigate = (target: string, seq?: number) => {
      if (!target) return;
      if (typeof seq === 'number' && seq > 0) {
        if (seq <= lastHandledShortcutSeqRef.current) {
          try {
            localStorage.removeItem('pending_shortcut_target');
            localStorage.removeItem('pending_shortcut_seq');
            delete (window as any).__pendingShortcut;
          } catch (e) {}
          return;
        }
        lastHandledShortcutSeqRef.current = seq;
      }
      try {
        localStorage.removeItem('pending_shortcut_target');
        localStorage.removeItem('pending_shortcut_seq');
        delete (window as any).__pendingShortcut;
        if (typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch (e) {}

      // Notify native Android that shortcut has been consumed so any pending runnables cancel
      markNativeShortcutConsumed(seq);

      const cleanTarget = normalizeShortcutTarget(target);
      console.log('[Shortcut] Navigating directly to target:', cleanTarget, 'seq:', seq);
      setIsThemeSelectorOpen(false);
      setShowExitConfirm(false);
      setIsSideMenuOpen(false);
      setSplashStage('app');
      handleNavigate(cleanTarget);
    };

    // Attach global handler directly to window for immediate execution from Android native code (onCreate / onNewIntent)
    (window as any).handleNativeShortcut = (target: string, seq?: number) => {
      if (isMounted && target) {
        consumeAndNavigate(target, seq);
        return 'handled';
      }
      return '';
    };

    const checkImmediateMemory = () => {
      try {
        const stored = localStorage.getItem('pending_shortcut_target');
        const storedSeqStr = localStorage.getItem('pending_shortcut_seq');
        const storedSeq = storedSeqStr ? parseInt(storedSeqStr, 10) : 0;
        localStorage.removeItem('pending_shortcut_target');
        localStorage.removeItem('pending_shortcut_seq');
        if (stored && stored.trim()) {
          consumeAndNavigate(stored.trim(), storedSeq > 0 ? storedSeq : undefined);
        }
        const rawPending = (window as any).__pendingShortcut;
        if (rawPending) {
          delete (window as any).__pendingShortcut;
          if (typeof rawPending === 'object' && rawPending !== null && rawPending.target) {
            consumeAndNavigate(String(rawPending.target), typeof rawPending.seq === 'number' ? rawPending.seq : undefined);
          } else if (typeof rawPending === 'string' && rawPending.trim()) {
            consumeAndNavigate(rawPending);
          }
        }
      } catch (e) {}
    };

    const checkNativePendingShortcut = async () => {
      checkImmediateMemory();

      // Only check getLaunchUrl once during initial cold boot if not yet handled
      if (Capacitor.isNativePlatform() && !launchUrlHandledRef.current) {
        try {
          const launch = await CapacitorApp.getLaunchUrl();
          if (isMounted && launch && launch.url && !launchUrlHandledRef.current) {
            launchUrlHandledRef.current = true;
            consumeAndNavigate(launch.url);
          }
        } catch (e) {}
      }

      try {
        const info = await getPendingShortcutInfo();
        if (isMounted && info && info.target) {
          consumeAndNavigate(info.target, info.seq);
        }
      } catch (e) {}

      try {
        const { value } = await Preferences.get({ key: 'pending_shortcut_target' });
        if (isMounted && value && value.trim()) {
          await Preferences.remove({ key: 'pending_shortcut_target' }).catch(() => {});
          await Preferences.remove({ key: 'pending_shortcut_seq' }).catch(() => {});
          consumeAndNavigate(value.trim());
        }
      } catch (e) {}
    };

    // 1. Initial check on mount
    checkNativePendingShortcut();
    const t1 = setTimeout(checkNativePendingShortcut, 150);

    // 2. Listen for fresh native shortcut events dispatched on cold start or onNewIntent
    const onNativeShortcut = (e: any) => {
      const target = e?.detail?.target;
      const seq = e?.detail?.seq;
      if (target) {
        consumeAndNavigate(target, typeof seq === 'number' ? seq : undefined);
      }
    };
    window.addEventListener('nativeShortcutTriggered', onNativeShortcut);

    // 3. Listen to appUrlOpen when a widget or deep link is tapped while app is running in background.
    // NOTE: We deliberately do NOT listen to appStateChange to trigger shortcuts.
    // Resuming from background (e.g. after minimizing the app to show phone screen) must always keep the user on their last opened page!
    let urlSub: any = null;
    if (Capacitor.isNativePlatform()) {
      urlSub = CapacitorApp.addListener('appUrlOpen', (data: any) => {
        if (data && data.url) {
          consumeAndNavigate(data.url);
        }
      });
    }

    return () => {
      isMounted = false;
      delete (window as any).handleNativeShortcut;
      clearTimeout(t1);
      window.removeEventListener('nativeShortcutTriggered', onNativeShortcut);
      if (urlSub) {
        urlSub.then((listener: any) => listener.remove()).catch(() => {});
      }
    };
  }, [handleNavigate, normalizeShortcutTarget]);

  const handleVoiceAction = useCallback((action: string, text: string, params?: any) => {
    console.log('Voice Action:', action, text, params);
    
    // 1. Handle Theme Change
    if (action === 'set_theme' && params?.theme) {
      if (page === 'quran') {
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
        return;
      } else {
        applyPresetTheme(params.theme);
        return;
      }
    }

    // 2. Handle UI Click
    if (action === 'ui_click' && params?.label) {
      if (performUiClick(params.label)) return;
    }

    // 3. Global Navigation Actions
    if (action === 'go_home') setHistory(['home']);
    else if (action === 'open_athkar' || (action === 'ui_click' && params?.label?.includes('اذكار'))) handleNavigate('sabah-masaa');
    else if (action === 'open_prayer' || (action === 'ui_click' && params?.label?.includes('صلاه'))) handleNavigate('prayer-times');
    else if (action === 'open_qibla' || (action === 'ui_click' && params?.label?.includes('قبله'))) handleNavigate('qibla');
    else if (action === 'open_tasbeeh' || (action === 'ui_click' && params?.label?.includes('مسبحه'))) handleNavigate('tasbeeh');
    else if (action === 'open_nawawi' || (action === 'ui_click' && params?.label?.includes('اربعون'))) handleNavigate('nawawi');
    else if (action === 'open_calculators' || (action === 'ui_click' && params?.label?.includes('حاسبه'))) handleNavigate('calculators');
    else if (action === 'open_listen' || (action === 'ui_click' && params?.label?.includes('استماع'))) handleNavigate('listen');
    else if (action === 'open_adia' || (action === 'ui_click' && params?.label?.includes('ادعيه'))) handleNavigate('adia');
    else if (action === 'open_salah_adhkar' || (action === 'ui_click' && params?.label?.includes('اذكار الصلاه'))) handleNavigate('salah-adhkar');
    else if (action === 'open_hisn_muslim' || (action === 'ui_click' && (params?.label?.includes('حصن') || params?.label?.includes('حسن')))) handleNavigate('hisn-muslim');
    else if (action === 'open_calendar' || (action === 'ui_click' && params?.label?.includes('تقويم'))) handleNavigate('calendar');
    else if (action === 'open_hajj_umrah' || (action === 'ui_click' && params?.label?.includes('حج'))) handleNavigate('hajj-umrah');
    else if (action === 'open_asmaul_husna' || (action === 'ui_click' && params?.label?.includes('اسماء الله'))) handleNavigate('asmaul-husna');
    else if (action === 'open_islamic_sites' || (action === 'ui_click' && params?.label?.includes('مواقع'))) handleNavigate('islamic-sites');
    else if (action === 'open_seerah' || (action === 'ui_click' && params?.label?.includes('سيره'))) handleNavigate('prophetic-seerah');
    else if (action === 'open_daily_wird' || (action === 'ui_click' && params?.label?.includes('ورد'))) handleNavigate('daily-wird');
    else if (action === 'open_memorization' || (action === 'ui_click' && params?.label?.includes('تحفيظ'))) handleNavigate('memorization');
    else if (action === 'open_quran' || (action === 'ui_click' && params?.label?.includes('مصحف'))) handleNavigate('quran');
    else if (action === 'open_voice_control' || (action === 'ui_click' && params?.label?.includes('تحكم صوتي'))) handleNavigate('voice-control');
    else if (action === 'set_orientation_horizontal' || action === 'set_orientation_vertical') {
      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
    }
    else if (action === 'open_search' || (action === 'ui_click' && params?.label?.includes('بحث'))) {
      const currentActive = history[history.length - 1];
      handleNavigate('search', (currentActive === 'quran' || currentActive === 'quran-landscape') ? { from: currentActive } : undefined);
    }
    else if (action === 'open_themes' || (action === 'ui_click' && params?.label?.includes('ثيم'))) {
      if (page === 'quran') {
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_themes' } }));
      } else {
        setIsThemeSelectorOpen(true);
      }
    }
    else if (action === 'open_settings' || (action === 'ui_click' && params?.label?.includes('اعدادات'))) window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_settings' } }));
    else if (action === 'exit_app') setShowExitConfirm(true);
    else if (action === 'go_back') navigateBack();
    
    // 4. Quran Specific Actions (Forwarded to QuranReader via Event)
    else if (['next_page', 'prev_page', 'play_audio', 'stop_audio', 'quran_navigation', 'increase_font', 'decrease_font', 'change_theme', 'download_quran', 'download_tafsir', 'show_tafsir', 'open_bookmarks', 'go_to_page', 'go_to_juz', 'go_to_surah', 'go_to_ayah', 'set_font_size', 'contextual_number', 'download', 'cancel', 'ui_discovery', 'toggle_auto_scroll', 'pause_auto_scroll', 'stop_auto_scroll', 'close_modal', 'save_bookmark'].includes(action)) {
      setHistory(prev => {
        if (prev[prev.length - 1] === 'quran') {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
          return prev;
        } else {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
          }, 500);
          return [...prev, 'quran'];
        }
      });
    }
  }, [handleNavigate, applyPresetTheme, performUiClick, navigateBack, history]);

  const page = history[history.length - 1];

  const hasChosenInitialLanguage = (() => {
    try {
      return localStorage.getItem('has_selected_initial_language') === 'true';
    } catch (e) {
      return false;
    }
  })();

  return (
    <TutorialProvider>
      <PrayerTimesProvider>
        <VoiceControlProvider onAction={handleVoiceAction}>
          {splashStage === 'welcome' ? (
            <WelcomeSplash
              onSelectLanguage={(lang) => {
                try {
                  localStorage.setItem('has_selected_initial_language', 'true');
                  localStorage.setItem('home_layout_system', 'modern');
                  Preferences.set({ key: 'has_selected_initial_language', value: 'true' }).catch(() => {});
                  Preferences.set({ key: 'home_layout_system', value: 'modern' }).catch(() => {});
                } catch (e) {}
                setLanguage(lang);
                setSplashStage('app');
              }}
            />
          ) : (
            <>
              {(splashStage === 'app' || (splashStage === 'video' && hasChosenInitialLanguage)) && (
                <AppContent 
                  page={page} 
                  history={history}
                  navParams={navParams}
                  isThemeSelectorOpen={isThemeSelectorOpen}
                  showExitConfirm={showExitConfirm}
                  isSideMenuOpen={isSideMenuOpen}
                  setIsSideMenuOpen={setIsSideMenuOpen}
                  handleNavigate={handleNavigate}
                  navigateBack={navigateBack}
                  setIsThemeSelectorOpen={setIsThemeSelectorOpen}
                  setShowExitConfirm={setShowExitConfirm}
                  updateInfo={updateInfo}
                  setUpdateInfo={setUpdateInfo}
                />
              )}
              {splashStage === 'video' && (
                <VideoSplash
                  onEnded={() => {
                    let hasChosenLanguage = false;
                    try {
                      hasChosenLanguage = localStorage.getItem('has_selected_initial_language') === 'true';
                    } catch (e) {
                      hasChosenLanguage = false;
                    }
                    if (hasChosenLanguage) {
                      setSplashStage('app');
                    } else {
                      setSplashStage('welcome');
                    }
                  }}
                />
              )}
            </>
          )}
        </VoiceControlProvider>
      </PrayerTimesProvider>
    </TutorialProvider>
  );
}


function AppContent({ 
  page, 
  history, 
  navParams,
  isThemeSelectorOpen, 
  showExitConfirm, 
  isSideMenuOpen,
  setIsSideMenuOpen,
  handleNavigate, 
  navigateBack, 
  setIsThemeSelectorOpen, 
  setShowExitConfirm,
  updateInfo,
  setUpdateInfo
}: any) {
  const { setCurrentPage: setVoicePage } = useVoiceControl();
  const { theme, themeKey, applyPresetTheme, setCurrentPage: setThemePage } = useTheme();
  const { activeIqamaAlert, dismissIqamaAlert, activeAdhanAlert, dismissAdhanAlert } = usePrayerTimes();
  const [activeWirdAlert, setActiveWirdAlert] = useState<WirdAlertData | null>(null);

  useEffect(() => {
    // Only listen for in-app modal alert on web/browser (never in native APK)
    if (Capacitor.isNativePlatform()) return;

    const handleWirdAlertEvent = (e: any) => {
      const detail = e.detail;
      if (detail) {
        if (detail.title && detail.startPage !== undefined) {
          setActiveWirdAlert(detail);
          return;
        }
        const profile = getActiveWirdProfile();
        if (profile) {
          const status = calculateWirdStatus(profile);
          const dayNum = detail.dayNumber || status.targetDayNumber;
          const range = getWirdDayRange(dayNum, profile);
          const missed = detail.missedCount !== undefined ? detail.missedCount : status.missedDaysCount;
          const content = buildWirdNotificationContent(profile, dayNum, missed);
          setActiveWirdAlert({
            profileId: profile.id,
            profileName: profile.name,
            currentDay: dayNum,
            totalDays: getWirdTotalDays(profile),
            startPage: range.start,
            endPage: range.end,
            missedDaysCount: missed,
            title: detail.title || content.title,
            message: detail.message || detail.body || content.body,
            soundFileName: 'chime.mp3'
          });
        }
      }
    };

    window.addEventListener('show-wird-alert', handleWirdAlertEvent);
    return () => window.removeEventListener('show-wird-alert', handleWirdAlertEvent);
  }, []);

  // Check on app launch/resume for uncompleted wird alert (browser/web only, never in native APK)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const timer = setTimeout(() => {
      const alertData = checkWirdAlertOnAppResume();
      if (alertData) {
        setActiveWirdAlert(alertData);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setVoicePage(page);
    setThemePage(page);
  }, [page, setVoicePage, setThemePage]);

  useWakeLock();

  useBackButton({
    history,
    isThemeSelectorOpen,
    showExitConfirm,
    isSideMenuOpen,
    navigateBack,
    setIsThemeSelectorOpen,
    setShowExitConfirm,
    setIsSideMenuOpen
  });

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);


  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleConfirmExit = () => {
    CapacitorApp.exitApp();
  };
  
  const handleOpenThemes = useCallback(() => {
    if (page === 'quran' || page === 'quran-landscape') {
      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_themes' } }));
    } else {
      setIsThemeSelectorOpen(prev => !prev);
    }
  }, [page]);

  const closeThemeSelector = () => setIsThemeSelectorOpen(false);

  return (
    <div className="relative min-h-screen">
      <AppRouter 
        page={page} 
        onBack={navigateBack} 
        onNavigate={handleNavigate} 
        onOpenThemes={handleOpenThemes}
        onOpenSideMenu={() => {
          setIsSideMenuOpen(true);
          window.dispatchEvent(new CustomEvent('quran-stop-audio'));
        }}
        navParams={
          page === 'search' &&
          history.length >= 2 &&
          (history[history.length - 2] === 'quran' || history[history.length - 2] === 'quran-landscape') &&
          !navParams?.from
            ? { ...(navParams || {}), from: history[history.length - 2] }
            : navParams
        }
      />

      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
        onNavigate={handleNavigate}
        onOpenThemes={handleOpenThemes}
        currentTheme={theme}
        currentPage={page}
      />

      {/* Global Voice Control Toggle - Removed from here, moved to MainMenu */}
      {/* {page === 'home' && <VoiceControlToggle />} */}

      {isThemeSelectorOpen && (
        <ThemeSelector 
          onClose={closeThemeSelector} 
          isLandscape={isLandscape}
        />
      )}

      {showExitConfirm && (
          <ExitConfirmModal
              isOpen={showExitConfirm}
              onConfirm={handleConfirmExit}
              onClose={() => setShowExitConfirm(false)}
              isLandscape={isLandscape}
          />
      )}

      {updateInfo?.show && (
          <UpdateNotificationModal 
              isOpen={updateInfo.show}
              onClose={() => setUpdateInfo({ ...updateInfo, show: false })}
              newVersion={updateInfo.newVersion}
              updateUrl={GOOGLE_PLAY_URL}
              isLandscape={isLandscape}
          />
      )}
      
      <RateUs />
      {!Capacitor.isNativePlatform() && <MawlidNotification />}

      {!Capacitor.isNativePlatform() && activeAdhanAlert && (
        <AdhanAlertModal
          alert={activeAdhanAlert}
          onDismiss={dismissAdhanAlert}
        />
      )}

      {!Capacitor.isNativePlatform() && activeIqamaAlert && (
        <IqamaAlertModal
          alert={activeIqamaAlert}
          onDismiss={dismissIqamaAlert}
        />
      )}

      {!Capacitor.isNativePlatform() && activeWirdAlert && (
        <WirdAlertModal
          alert={activeWirdAlert}
          onDismiss={() => {
            if (activeWirdAlert?.profileId) {
              markWirdAlertShownToday(activeWirdAlert.profileId);
            }
            setActiveWirdAlert(null);
          }}
          onStartReading={(startPage, mode = 'mushaf') => {
            if (activeWirdAlert?.profileId) {
              markWirdAlertShownToday(activeWirdAlert.profileId);
            }
            setActiveWirdAlert(null);
            handleNavigate('quran', { page: startPage, isWird: true, readingMode: mode });
          }}
          onOpenDailyWird={() => {
            if (activeWirdAlert?.profileId) {
              markWirdAlertShownToday(activeWirdAlert.profileId);
            }
            setActiveWirdAlert(null);
            handleNavigate('daily-wird');
          }}
        />
      )}

      <ScrollToTopFAB currentPage={history[history.length - 1]} />
    </div>
  );
}

export default App;
