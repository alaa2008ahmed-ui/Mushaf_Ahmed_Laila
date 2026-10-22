
import React, { useState, useCallback, useEffect } from 'react';
import ThemeSelector from './components/ThemesModal';
import ExitConfirmModal from './components/ExitConfirmModal';
import AppRouter from './router/AppRouter';
import VideoSplash from './components/VideoSplash';
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
import { Capacitor } from '@capacitor/core';
import { clearSearchCache } from './pages/GlobalSearch';
import { playNotificationSound } from './utils/prayerTimesUtils';
import IqamaAlertModal from './components/PrayerTimes/IqamaAlertModal';
import AdhanAlertModal from './components/PrayerTimes/AdhanAlertModal';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { APP_VERSION, REMOTE_VERSION_URL, GOOGLE_PLAY_URL } from './constants';
import UpdateNotificationModal from './components/UpdateNotificationModal';
import { InAppChatNotification } from './components/InAppChatNotification';
import { recordAppLaunch, markPageAsSeen } from './utils/badgeManager';
import InitialOnboardingModal from './components/Community/InitialOnboardingModal';

// --- Main App Component ---
function App() {
  const { theme, applyPresetTheme, setCurrentPage } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  // Track app launch count for "جديد" badge (1 count per launch, max 10 times)
  useEffect(() => {
    recordAppLaunch();
  }, []);
  const [history, setHistory] = useState(['home']);
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
    setCurrentPage(currentPage);
    if (currentPage && currentPage !== 'home') {
      markPageAsSeen(currentPage);
    }
  }, [history, setCurrentPage]);

  useEffect(() => {
    if (!history.includes('search')) {
      clearSearchCache();
    }
    const currentPage = history[history.length - 1];
    if (currentPage === 'home') {
      setLastMenuPage(currentPage);
    }

    // --- Orientation Management ---
    const handleOrientation = async () => {
      if (!Capacitor.isNativePlatform()) return;
      
      try {
        if (currentPage === 'quran-landscape') {
          await ScreenOrientation.lock({ orientation: 'landscape' });
        } else {
          // If we are not in a landscape page, and we were previously in one (or just to be safe)
          // we ensure portrait mode. 
          // Note: ScreenOrientation.unlock() allows normal rotation, 
          // but usually the main UI is better off in portrait.
          await ScreenOrientation.lock({ orientation: 'portrait' });
        }
      } catch (e) {
        console.error('Orientation management failed:', e);
      }
    };
    handleOrientation();
  }, [history]);

  const handleNavigate = useCallback((pageId: string, params?: any) => {
    setIsSideMenuOpen(false);
    const validPages = [
      'home', 'quran', 'quran-landscape', 'quran-download', 'salah-adhkar', 'calendar', 'listen', 'tasbeeh', 
      'hajj-umrah', 'hisn-muslim', 'prayer-times', 'monthly-prayer-times', 'qibla', 
      'sabah-masaa', 'adia', 'nawawi', 'calculators', 'voice-control', 'daily-wird', 'memorization',
      'phone-notifications', 'search', 'asmaul-husna', 'habit-tracker', 'community', 'direct-chat', 'group-chat', 'ahl-al-quran', 'others', 'islamic-sites',
      'prophetic-seerah'
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
      }
      setNavParams(params || null);
      setHistory(prev => {
        const current = prev[prev.length - 1];
        if (current === pageId) return prev;

        // 1. Direct or Group Chat inside Community
        if (pageId === 'direct-chat' || pageId === 'group-chat') {
          const communityIdx = prev.lastIndexOf('community');
          if (communityIdx !== -1) {
            return [...prev.slice(0, communityIdx + 1), pageId];
          }
          return ['home', 'community', pageId];
        }

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

    let listener: any = null;
    let receivedListener: any = null;
    if (Capacitor.isNativePlatform()) {
      listener = LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const extra = notificationAction.notification.extra;
        const page = extra?.page;
        const params = extra?.params;
        const type = extra?.type;
        const occasionId = extra?.occasionId;
        if (occasionId) {
          window.dispatchEvent(new CustomEvent('show-islamic-occasion-alert', { detail: { occasionId } }));
        } else if (page) {
          handleNavigate(page, params);
        } else if (type === 'iqama') {
          handleNavigate('prayer-times');
        }
      });

      receivedListener = LocalNotifications.addListener('localNotificationReceived', (notification) => {
        const extra = notification.extra;
        if (extra?.type === 'iqama') {
          playNotificationSound('/assets/audio/chime.mp3', true);
        } else if (extra?.playSound && extra?.soundFile) {
          playNotificationSound(extra.soundFile, true);
        }
        if (extra?.occasionId) {
          window.dispatchEvent(new CustomEvent('show-islamic-occasion-alert', { detail: { occasionId: extra.occasionId } }));
        }
        console.log('[Notification] Received notification natively:', notification.id, notification.title);
      });
    }

    return () => {
      if (listener) {
        listener.then((l: any) => l.remove());
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
    else if (action === 'open_ahl_al_quran' || (action === 'ui_click' && params?.label?.includes('اهل القران'))) handleNavigate('ahl-al-quran');
    else if (action === 'set_orientation_horizontal' || action === 'set_orientation_vertical') {
      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
    }
    else if (action === 'open_search' || (action === 'ui_click' && params?.label?.includes('بحث'))) {
      handleNavigate('search');
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
  }, [handleNavigate, applyPresetTheme, performUiClick, navigateBack]);

  const page = history[history.length - 1];

  if (showSplash) {
    return <VideoSplash onEnded={() => setShowSplash(false)} />;
  }

  return (
    <TutorialProvider>
      <PrayerTimesProvider>
        <VoiceControlProvider onAction={handleVoiceAction}>
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

  useEffect(() => {
    setVoicePage(page);
    setThemePage(page);
  }, [page, setVoicePage, setThemePage]);

  useWakeLock();

  useBackButton({
    history,
    isThemeSelectorOpen,
    showExitConfirm,
    navigateBack,
    setIsThemeSelectorOpen,
    setShowExitConfirm
  });

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  const [showInitialOnboarding, setShowInitialOnboarding] = useState(() => {
    try {
      // 1. If user already registered in Community (has a valid username), NEVER show again
      const savedUserV9 = localStorage.getItem('mushaf_community_current_user_v9');
      if (savedUserV9) {
        const parsed = JSON.parse(savedUserV9);
        if (parsed?.username && parsed.username.trim().length >= 2) {
          return false;
        }
      }
      const savedUserLegacy = localStorage.getItem('mushaf_community_user');
      if (savedUserLegacy) {
        const parsed = JSON.parse(savedUserLegacy);
        if (parsed?.username && parsed.username.trim().length >= 2) {
          return false;
        }
      }

      // 2. If already marked completed, do not show
      const completed = localStorage.getItem('initial_community_onboarding_completed');
      if (completed === 'true') return false;

      // 3. Cancel count check:
      // If cancelled once before, it appears again "مرة أخرى فقط" (cancelCount === 1).
      // If cancelled >= 2 times, do not show again.
      const cancelCount = parseInt(localStorage.getItem('initial_onboarding_cancel_count') || '0', 10);
      if (cancelCount >= 2) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handleOpen = () => setShowInitialOnboarding(true);
    window.addEventListener('open-initial-onboarding', handleOpen);
    return () => window.removeEventListener('open-initial-onboarding', handleOpen);
  }, []);

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
        navParams={navParams}
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
      <MawlidNotification />
      <InAppChatNotification currentPage={page} navParams={navParams} onNavigate={handleNavigate} />

      {activeAdhanAlert && (
        <AdhanAlertModal
          alert={activeAdhanAlert}
          onDismiss={dismissAdhanAlert}
        />
      )}

      {activeIqamaAlert && (
        <IqamaAlertModal
          alert={activeIqamaAlert}
          onDismiss={dismissIqamaAlert}
        />
      )}

      {showInitialOnboarding && (
        <InitialOnboardingModal 
          isOpen={showInitialOnboarding}
          onClose={() => setShowInitialOnboarding(false)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default App;
