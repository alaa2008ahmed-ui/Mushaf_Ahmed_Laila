
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
import { VoiceControlProvider } from './context/VoiceControlContext';
import { TutorialProvider } from './context/TutorialContext';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './context/ThemeContext';
import { normalizeArabic } from './utils/voiceParser';
import { usePrayerTimes } from './context/PrayerTimesContext';
// --- Main App Component ---
function App() {
  const { theme, applyPresetTheme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [history, setHistory] = useState(['home']);
  const [navParams, setNavParams] = useState<any>(null);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleNavigate = useCallback((pageId: string, params?: any) => {
    const validPages = [
      'home', 'quran', 'quran-landscape', 'quran-download', 'salah-adhkar', 'calendar', 'listen', 'tasbeeh', 
      'hajj-umrah', 'hisn-muslim', 'prayer-times', 'monthly-prayer-times', 'qibla', 
      'sabah-masaa', 'adia', 'nawawi', 'calculators', 'voice-control', 'more-menu', 'daily-wird', 'memorization'
    ];

    if (pageId === 'home') {
      // If we are in the Mushaf and it's a practical application from Tajweed,
      // the Home button should take us back to Tajweed.
      if (history[history.length - 1] === 'quran') {
        setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
        return;
      }

      const quranIndex = history.lastIndexOf('quran');
      const quranLandscapeIndex = history.lastIndexOf('quran-landscape');
      const targetIndex = Math.max(quranIndex, quranLandscapeIndex);
      
      if (targetIndex !== -1 && targetIndex < history.length - 1) {
        setHistory(prev => prev.slice(0, targetIndex + 1));
        return;
      }

      setHistory(['home']);
      setNavParams(null);
      return;
    }

    if (validPages.includes(pageId)) {
      setNavParams(params || null);
      setHistory(prev => {
        if (prev[prev.length - 1] !== pageId) {
          return [...prev, pageId];
        }
        return prev;
      });
    } else {
      alert(`التنقل إلى قسم "${pageId}" قيد الإنشاء.`);
    }
  }, []);

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
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

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
    else if (action === 'open_quran' || (action === 'ui_click' && params?.label?.includes('مصحف'))) handleNavigate('quran');
    else if (action === 'open_voice_control' || (action === 'ui_click' && params?.label?.includes('تحكم صوتي'))) handleNavigate('voice-control');
    else if (action === 'open_more' || (action === 'ui_click' && params?.label?.includes('مزيد'))) handleNavigate('more-menu');
    else if (action === 'set_orientation_horizontal' || action === 'set_orientation_vertical') {
      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
    }
    else if (action === 'open_search' || (action === 'ui_click' && params?.label?.includes('بحث'))) {
      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_search', params } }));
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
            handleNavigate={handleNavigate}
            navigateBack={navigateBack}
            setIsThemeSelectorOpen={setIsThemeSelectorOpen}
            setShowExitConfirm={setShowExitConfirm}
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
  handleNavigate, 
  navigateBack, 
  setIsThemeSelectorOpen, 
  setShowExitConfirm 
}: any) {
  const { setCurrentPage } = useVoiceControl();

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

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
  
  const toggleThemeSelector = () => setIsThemeSelectorOpen(prev => !prev);
  const closeThemeSelector = () => setIsThemeSelectorOpen(false);

  return (
    <div className="relative min-h-screen">
      <AppRouter 
        page={page} 
        onBack={navigateBack} 
        onNavigate={handleNavigate} 
        onOpenThemes={toggleThemeSelector}
        navParams={navParams}
      />

      {/* Global Voice Control Toggle */}
      {page === 'home' && <VoiceControlToggle />}

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
      
      <RateUs />
    </div>
  );
}

import { useVoiceControl } from './context/VoiceControlContext';
import { useTutorial } from './context/TutorialContext';

const VoiceControlToggle = () => {
  const { isEnabled, toggleEnabled, isListening, showVoiceIcon } = useVoiceControl();
  const { shouldShowTutorial } = useTutorial();

  if (!showVoiceIcon) return null;

  return (
    <motion.button
      id="voice-control-btn"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleEnabled}
      className={`fixed left-4 z-[10005] w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white ${
        isEnabled 
          ? (isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500') 
          : 'bg-gray-400'
      }`}
      style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
      title={isEnabled ? 'تعطيل التحكم الصوتي' : 'تفعيل التحكم الصوتي'}
    >
      {isEnabled ? <Mic className="text-white w-5 h-5" /> : <MicOff className="text-white w-5 h-5" />}
      
      {isEnabled && isListening && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-red-500 -z-10"
        />
      )}
    </motion.button>
  );
};

export default App;