import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowRight, Play, Pause, RotateCcw, Volume2, Eye, EyeOff, 
  HelpCircle, BookOpen, Brain, ChevronRight, ChevronLeft, 
  FastForward, Settings2, Sparkles, BookMarked, Trophy, X, Gauge, Zap, Infinity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAyahsInRange, AyahPointer } from '../utils/quranMemorizationUtils';
import { SURAH_NAMES_AR, MEMORIZATION_READERS } from '../components/QuranReader/constants';
import { SURAH_NAMES_EN } from './Memorization';
import { registerBackInterceptor } from '../hooks/useBackButton';
import MemorizationQuizModal from '../components/Memorization/MemorizationQuizModal';
import MemorizationPreviewModal from '../components/Memorization/MemorizationPreviewModal';
import { memorizationService, MasteryLevel } from '../services/memorizationService';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { acquireListenInterruption, releaseListenInterruption } from '../utils/listenAudioCoordinator';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';
import { hexToRgba } from '../utils/flatDesignTokens';

interface MemorizationSessionProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
  params?: any;
}

export type MaskLevel = 0 | 1 | 2 | 3; // 0=full, 1=endings, 2=half, 3=hidden

const stripTajweed = (text: string) => {
  if (!text) return '';
  return text.replace(/\[([a-z])(?::\d+)?\[/g, '').replace(/\]/g, '').trim();
};

const MemorizationSession: React.FC<MemorizationSessionProps> = ({ onBack, onNavigate, params }) => {
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);

  const isDark = s3d.isDark;
  const isBlackTheme = s3d.isBlackTheme;
  const primaryColor = s3d.primaryColor;
  const btnTextColor = s3d.btnTextColor;
  const pageBg = s3d.pageBgColor;
  const pageTextColor = s3d.textColor;

  // Session settings from params or default
  const settings = params?.memorizationSettings || params || {};
  const fromSurah = settings.fromSurah || 1;
  const fromAyah = settings.fromAyah || 1;
  const toSurah = settings.toSurah || 1;
  const toAyah = settings.toAyah || 7;
  const selectedReader = settings.reader || 'Abdul_Basit_Murattal_192kbps';
  const ayahRepeatTarget = settings.ayahRepeat || 3;
  const rangeRepeatTarget = settings.rangeRepeat || 1;
  const pauseSeconds = settings.pauseLength || 2;
  const linkedRepeat = Boolean(settings.linkedRepeat);
  const isCumulative = Boolean(settings.isCumulative); // 3x3 loop
  const rangeId = settings.rangeId;

  // Ayahs list for this session
  const ayahs = React.useMemo(() => {
    return getAyahsInRange(fromSurah, fromAyah, toSurah, toAyah);
  }, [fromSurah, fromAyah, toSurah, toAyah]);

  // Player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentAyahRepeat, setCurrentAyahRepeat] = useState(1);
  const [isPauseActive, setIsPauseActive] = useState(false);
  const [pauseCountdown, setPauseCountdown] = useState(0);

  // Masking level: 0=visible, 1=hide endings, 2=hide half, 3=hide all
  const [maskLevel, setMaskLevel] = useState<MaskLevel>(0);
  const [showMaskMenu, setShowMaskMenu] = useState(false);
  const [peekedWordIndex, setPeekedWordIndex] = useState<{ ayahIdx: number; wordIdx: number } | null>(null);

  // Available playback speeds: numbers only [0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x]
  const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const maskBtnRef = useRef<HTMLButtonElement | null>(null);
  const [maskMenuTop, setMaskMenuTop] = useState<number>(64);

  // Word-by-word tracking during recitation
  const [isWordTrackingEnabled, setIsWordTrackingEnabled] = useState(true);
  const [audioProgress, setAudioProgress] = useState<{ currentTime: number; duration: number } | null>(null);

  // Modals
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showTafseerModal, setShowTafseerModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Audio elements
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<any>(null);
  const peekTimerRef = useRef<any>(null);

  // Keep screen awake logic (Screen Wake Lock API) during reading/memorization
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        // Ignore wake lock error
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // Auto-scroll to active ayah
  useEffect(() => {
    const el = document.getElementById(`session-ayah-${currentIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex]);

  const handleExit = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);

    releaseListenInterruption('mem-session-audio');
    releaseListenInterruption('mem-session-chime');

    // Save last session position
    if (ayahs[currentIndex]) {
      const cur = ayahs[currentIndex];
      localStorage.setItem('memorization_session_v1', JSON.stringify({
        settings,
        currentAyah: { s: cur.surahNumber, a: cur.ayahNumber },
        timestamp: Date.now()
      }));
    }
    onBack();
  }, [ayahs, currentIndex, settings, onBack]);

  // Back button interceptor
  useEffect(() => {
    const interceptor = () => {
      if (showMaskMenu) {
        setShowMaskMenu(false);
        return true;
      }
      if (showSpeedMenu) {
        setShowSpeedMenu(false);
        return true;
      }
      if (showCompletionModal) {
        setShowCompletionModal(false);
        handleExit();
        return true;
      }
      if (showQuizModal) { setShowQuizModal(false); return true; }
      if (showTafseerModal) { setShowTafseerModal(false); return true; }
      handleExit();
      return true;
    };
    return registerBackInterceptor(interceptor);
  }, [showMaskMenu, showSpeedMenu, showQuizModal, showTafseerModal, showCompletionModal, handleExit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
      releaseListenInterruption('mem-session-audio');
      releaseListenInterruption('mem-session-chime');
    };
  }, []);

  // Build audio URL for an ayah
  const getAyahAudioUrl = useCallback((surahNum: number, ayahNum: number): string => {
    const sStr = String(surahNum).padStart(3, '0');
    const aStr = String(ayahNum).padStart(3, '0');
    return `https://everyayah.com/data/${selectedReader}/${sStr}${aStr}.mp3`;
  }, [selectedReader]);

  // Track refs for audio playback callbacks to prevent stale closure issues
  const currentIndexRef = useRef(0);
  const currentAyahRepeatRef = useRef(1);
  const currentRangeRepeatRef = useRef(1);
  const handleAdvanceAfterAudioRef = useRef<() => void>(() => {});

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    currentAyahRepeatRef.current = currentAyahRepeat;
  }, [currentAyahRepeat]);

  // Definition of a playback step in the memorization session
  interface PlaybackStep {
    ayahIndex: number;
    stepRepeatIndex: number; // 1-based index within the repetition of this step
    stepRepeatTotal: number; // Total repeats for this step
    descriptionAr: string;
    descriptionEn: string;
    modeBadge?: string;
  }

  // Generate sequence of steps based on chosen mode:
  // 1. Shanqiti (Cumulative 3x3):
  //    - Ayah 1 x ayahRepeatTarget
  //    - Ayah 2 x ayahRepeatTarget
  //    - Link (Ayah 1 + 2) x ayahRepeatTarget
  //    - Ayah 3 x ayahRepeatTarget
  //    - Link (Ayah 1 + 2 + 3) x ayahRepeatTarget
  //    - Next 3-verse block: Ayah 4 x N, Ayah 5 x N, Link (4+5) x N, Ayah 6 x N, Link (4+5+6) x N
  //    - Consolidation link of whole group (1..6) x N, etc.
  // 2. Linked Repeat (الربط بالسابقة):
  //    - Ayah 1 x ayahRepeatTarget
  //    - Ayah 2 x ayahRepeatTarget, then Link (Ayah 1 + 2) x 1
  //    - Ayah 3 x ayahRepeatTarget, then Link (Ayah 2 + 3) x 1
  //    - Ayah i x ayahRepeatTarget, then Link (Ayah i-1 + i) x 1
  // 3. Normal mode:
  //    - Each verse x ayahRepeatTarget sequentially
  const playbackSteps = React.useMemo<PlaybackStep[]>(() => {
    const total = ayahs.length;
    if (total === 0) return [];
    const steps: PlaybackStep[] = [];
    const N = Math.max(1, ayahRepeatTarget);

    if (isCumulative) {
      // Shanquiti Cumulative method (3x3 loop)
      const groupSize = 3;
      const numGroups = Math.ceil(total / groupSize);

      for (let g = 0; g < numGroups; g++) {
        const groupStart = g * groupSize;
        const groupEnd = Math.min(groupStart + groupSize, total);

        for (let i = groupStart; i < groupEnd; i++) {
          const ayahNum = ayahs[i].ayahNumber;
          // Step 1: Repeat current verse N times
          for (let r = 1; r <= N; r++) {
            steps.push({
              ayahIndex: i,
              stepRepeatIndex: r,
              stepRepeatTotal: N,
              descriptionAr: `تكرار الآية ${ayahNum} (${r}/${N})`,
              descriptionEn: `Verse ${ayahNum} repeat (${r}/${N})`,
              modeBadge: 'الشنقيطي: حفظ الآية'
            });
          }

          // Step 2: Cumulative link from start of group up to current verse
          if (i > groupStart) {
            for (let r = 1; r <= N; r++) {
              for (let k = groupStart; k <= i; k++) {
                const startA = ayahs[groupStart].ayahNumber;
                const currA = ayahs[i].ayahNumber;
                steps.push({
                  ayahIndex: k,
                  stepRepeatIndex: r,
                  stepRepeatTotal: N,
                  descriptionAr: `ربط تراكمي (${startA} - ${currA}) [${r}/${N}]`,
                  descriptionEn: `Cumulative Link (${startA} - ${currA}) [${r}/${N}]`,
                  modeBadge: 'الشنقيطي: ربط تراكمي'
                });
              }
            }
          }
        }

        // Consolidation link of all verses from 0 up to end of this group if more than 1 group
        if (g > 0 && groupEnd > groupStart) {
          for (let r = 1; r <= Math.min(2, N); r++) {
            for (let k = 0; k < groupEnd; k++) {
              const startA = ayahs[0].ayahNumber;
              const endA = ayahs[groupEnd - 1].ayahNumber;
              steps.push({
                ayahIndex: k,
                stepRepeatIndex: r,
                stepRepeatTotal: Math.min(2, N),
                descriptionAr: `تثبيت شامل (${startA} - ${endA}) [${r}/${Math.min(2, N)}]`,
                descriptionEn: `Full consolidation (${startA} - ${endA}) [${r}/${Math.min(2, N)}]`,
                modeBadge: 'الشنقيطي: تثبيت شامل'
              });
            }
          }
        }
      }
    } else if (linkedRepeat) {
      // Linked Repeat mode (الربط بالسابقة)
      for (let i = 0; i < total; i++) {
        const ayahNum = ayahs[i].ayahNumber;

        // Repeat current verse N times
        for (let r = 1; r <= N; r++) {
          steps.push({
            ayahIndex: i,
            stepRepeatIndex: r,
            stepRepeatTotal: N,
            descriptionAr: `تكرار الآية ${ayahNum} (${r}/${N})`,
            descriptionEn: `Verse ${ayahNum} repeat (${r}/${N})`,
            modeBadge: 'تكرار الآية'
          });
        }

        // If there is a previous verse, immediately recite (Previous + Current) once to cement the sequence link
        if (i > 0) {
          const prevAyahNum = ayahs[i - 1].ayahNumber;
          // Play previous verse
          steps.push({
            ayahIndex: i - 1,
            stepRepeatIndex: 1,
            stepRepeatTotal: 1,
            descriptionAr: `ربط بالسابقة: آية ${prevAyahNum} ثم ${ayahNum}`,
            descriptionEn: `Link: Verse ${prevAyahNum} then ${ayahNum}`,
            modeBadge: 'الربط بالسابقة'
          });
          // Play current verse
          steps.push({
            ayahIndex: i,
            stepRepeatIndex: 1,
            stepRepeatTotal: 1,
            descriptionAr: `ربط بالسابقة: إتمام الآية ${ayahNum}`,
            descriptionEn: `Link: Complete Verse ${ayahNum}`,
            modeBadge: 'الربط بالسابقة'
          });
        }
      }
    } else {
      // Standard sequential mode: each verse x N
      for (let i = 0; i < total; i++) {
        const ayahNum = ayahs[i].ayahNumber;
        for (let r = 1; r <= N; r++) {
          steps.push({
            ayahIndex: i,
            stepRepeatIndex: r,
            stepRepeatTotal: N,
            descriptionAr: `تكرار الآية ${ayahNum} (${r}/${N})`,
            descriptionEn: `Verse ${ayahNum} repeat (${r}/${N})`,
            modeBadge: 'تكرار الآية'
          });
        }
      }
    }

    return steps;
  }, [ayahs, ayahRepeatTarget, linkedRepeat, isCumulative]);

  // Current step index in the playback sequence
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStepIndexRef = useRef(0);
  const playbackStepsRef = useRef<PlaybackStep[]>([]);

  useEffect(() => {
    playbackStepsRef.current = playbackSteps;
  }, [playbackSteps]);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);



  // Current active step info for display in the UI
  const currentStep = playbackSteps[currentStepIndex] || null;

  // Audio progression logic using the generated sequence
  const handleAdvanceAfterAudio = useCallback(() => {
    const steps = playbackStepsRef.current;
    const cStepIdx = currentStepIndexRef.current;
    const cRangeRepeat = currentRangeRepeatRef.current;

    // Check if there are more steps in the current range iteration
    if (cStepIdx < steps.length - 1) {
      const nextStepIdx = cStepIdx + 1;
      currentStepIndexRef.current = nextStepIdx;
      setCurrentStepIndex(nextStepIdx);

      const nextStep = steps[nextStepIdx];
      currentIndexRef.current = nextStep.ayahIndex;
      setCurrentIndex(nextStep.ayahIndex);
      currentAyahRepeatRef.current = nextStep.stepRepeatIndex;
      setCurrentAyahRepeat(nextStep.stepRepeatIndex);

      playAyahAtIndex(nextStep.ayahIndex);
      return;
    }

    // Finished one complete range iteration!
    if (cRangeRepeat < rangeRepeatTarget) {
      const nextRangeRepeat = cRangeRepeat + 1;
      currentRangeRepeatRef.current = nextRangeRepeat;

      currentStepIndexRef.current = 0;
      setCurrentStepIndex(0);

      const firstStep = steps[0];
      if (firstStep) {
        currentIndexRef.current = firstStep.ayahIndex;
        setCurrentIndex(firstStep.ayahIndex);
        currentAyahRepeatRef.current = firstStep.stepRepeatIndex;
        setCurrentAyahRepeat(firstStep.stepRepeatIndex);
        playAyahAtIndex(firstStep.ayahIndex);
      }
    } else {
      // ENTIRE SESSION FINISHED: Stop audio completely and show completion modal!
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
      setIsPlaying(false);
      setIsPauseActive(false);
      releaseListenInterruption('mem-session-audio');

      // Trigger completion modal and celebration chime
      setShowCompletionModal(true);
      try {
        acquireListenInterruption('mem-session-chime');
        const audio = new Audio('/assets/audio/chime.mp3');
        audio.volume = 0.5;
        audio.onended = () => releaseListenInterruption('mem-session-chime');
        audio.onerror = () => releaseListenInterruption('mem-session-chime');
        audio.play().catch(() => releaseListenInterruption('mem-session-chime'));
        Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      } catch (e) {
        releaseListenInterruption('mem-session-chime');
      }
    }
  }, [rangeRepeatTarget]);

  useEffect(() => {
    handleAdvanceAfterAudioRef.current = handleAdvanceAfterAudio;
  }, [handleAdvanceAfterAudio]);

  // Core Playback Logic: plays the ayah at a specific index
  const playAyahAtIndex = useCallback((index: number) => {
    if (index < 0 || index >= ayahs.length) return;
    currentIndexRef.current = index;
    setCurrentIndex(index);
    const ayah = ayahs[index];
    const url = getAyahAudioUrl(ayah.surahNumber, ayah.ayahNumber);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = url;
    audio.defaultPlaybackRate = playbackSpeed;
    audio.playbackRate = playbackSpeed;
    audio.onplay = () => {
      if (audioRef.current) {
        audioRef.current.playbackRate = playbackSpeed;
      }
    };

    audio.ontimeupdate = () => {
      if (audio.duration && audio.duration > 0) {
        setAudioProgress({ currentTime: audio.currentTime, duration: audio.duration });
      }
    };

    audio.onended = () => {
      setAudioProgress(null);
      // Verse ended -> trigger recitation pause period if configured
      if (pauseSeconds > 0) {
        setIsPauseActive(true);
        setPauseCountdown(pauseSeconds);

        let remaining = pauseSeconds;
        if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);

        pauseTimerRef.current = setInterval(() => {
          remaining -= 1;
          setPauseCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(pauseTimerRef.current);
            setIsPauseActive(false);
            if (handleAdvanceAfterAudioRef.current) {
              handleAdvanceAfterAudioRef.current();
            }
          }
        }, 1000);
      } else {
        if (handleAdvanceAfterAudioRef.current) {
          handleAdvanceAfterAudioRef.current();
        }
      }
    };

    audio.onerror = (e) => {
      console.warn('Audio playback error', e);
      setIsPlaying(false);
      setAudioProgress(null);
      releaseListenInterruption('mem-session-audio');
    };

    acquireListenInterruption('mem-session-audio');
    audio.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Autoplay prevented or failed', err);
        setIsPlaying(false);
        releaseListenInterruption('mem-session-audio');
      });
  }, [ayahs, getAyahAudioUrl, playbackSpeed, pauseSeconds]);

  // Legacy wrapper for direct ayah tap
  const playAyah = useCallback((index: number) => {
    // When user manually taps an ayah, find the first step for this ayah or jump to it
    const steps = playbackStepsRef.current;
    const targetStepIdx = steps.findIndex(s => s.ayahIndex === index);
    if (targetStepIdx !== -1) {
      currentStepIndexRef.current = targetStepIdx;
      setCurrentStepIndex(targetStepIdx);
      const step = steps[targetStepIdx];
      currentAyahRepeatRef.current = step.stepRepeatIndex;
      setCurrentAyahRepeat(step.stepRepeatIndex);
    } else {
      currentAyahRepeatRef.current = 1;
      setCurrentAyahRepeat(1);
    }
    playAyahAtIndex(index);
  }, [playAyahAtIndex]);

  const togglePlayPause = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
      setIsPlaying(false);
      setIsPauseActive(false);
      setAudioProgress(null);
      releaseListenInterruption('mem-session-audio');
    } else {
      const steps = playbackStepsRef.current;
      const cStep = steps[currentStepIndexRef.current];
      const targetAyahIdx = cStep ? cStep.ayahIndex : currentIndexRef.current;
      playAyahAtIndex(targetAyahIdx);
    }
  };

  const handleNextAyah = () => {
    const steps = playbackStepsRef.current;
    // Find next step with a different ayah index, or advance step
    const currentA = currentIndexRef.current;
    const nextStepIdx = steps.findIndex((s, idx) => idx > currentStepIndexRef.current && s.ayahIndex !== currentA);
    if (nextStepIdx !== -1) {
      currentStepIndexRef.current = nextStepIdx;
      setCurrentStepIndex(nextStepIdx);
      const step = steps[nextStepIdx];
      currentAyahRepeatRef.current = step.stepRepeatIndex;
      setCurrentAyahRepeat(step.stepRepeatIndex);
      if (isPlaying) playAyahAtIndex(step.ayahIndex);
      else {
        currentIndexRef.current = step.ayahIndex;
        setCurrentIndex(step.ayahIndex);
      }
    } else if (currentA < ayahs.length - 1) {
      const nextA = currentA + 1;
      currentIndexRef.current = nextA;
      setCurrentIndex(nextA);
      currentAyahRepeatRef.current = 1;
      setCurrentAyahRepeat(1);
      if (isPlaying) playAyahAtIndex(nextA);
    }
  };

  const handlePrevAyah = () => {
    const steps = playbackStepsRef.current;
    const currentA = currentIndexRef.current;
    // Find previous step with a different ayah index
    let prevStepIdx = -1;
    for (let i = currentStepIndexRef.current - 1; i >= 0; i--) {
      if (steps[i].ayahIndex !== currentA) {
        prevStepIdx = i;
        break;
      }
    }
    if (prevStepIdx !== -1) {
      // Find the first occurrence of this previous ayah
      const targetAyah = steps[prevStepIdx].ayahIndex;
      const firstOccur = steps.findIndex(s => s.ayahIndex === targetAyah);
      const chosenStep = firstOccur !== -1 ? firstOccur : prevStepIdx;

      currentStepIndexRef.current = chosenStep;
      setCurrentStepIndex(chosenStep);
      const step = steps[chosenStep];
      currentAyahRepeatRef.current = step.stepRepeatIndex;
      setCurrentAyahRepeat(step.stepRepeatIndex);
      if (isPlaying) playAyahAtIndex(step.ayahIndex);
      else {
        currentIndexRef.current = step.ayahIndex;
        setCurrentIndex(step.ayahIndex);
      }
    } else if (currentA > 0) {
      const prevA = currentA - 1;
      currentIndexRef.current = prevA;
      setCurrentIndex(prevA);
      currentAyahRepeatRef.current = 1;
      setCurrentAyahRepeat(1);
      if (isPlaying) playAyahAtIndex(prevA);
    }
  };

  // Replay verses from the start
  const handleReplaySession = () => {
    setShowCompletionModal(false);
    currentStepIndexRef.current = 0;
    setCurrentStepIndex(0);
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    const firstStep = playbackStepsRef.current[0];
    currentAyahRepeatRef.current = firstStep?.stepRepeatIndex || 1;
    setCurrentAyahRepeat(firstStep?.stepRepeatIndex || 1);
    currentRangeRepeatRef.current = 1;
    setIsPauseActive(false);
    setTimeout(() => {
      playAyahAtIndex(0);
    }, 150);
  };

  // Playback Speed Handlers: supports all 7 speeds with instant update to active audio
  const handleSelectSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.defaultPlaybackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const handleCycleSpeed = () => {
    const currentIdx = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIdx = currentIdx === -1 || currentIdx === SPEED_OPTIONS.length - 1 ? 0 : currentIdx + 1;
    const nextSpeed = SPEED_OPTIONS[nextIdx];
    handleSelectSpeed(nextSpeed);
  };

  // Word tap to peek when masked
  const handleWordPeek = (ayahIdx: number, wordIdx: number) => {
    if (maskLevel === 0) return;
    setPeekedWordIndex({ ayahIdx, wordIdx });
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    peekTimerRef.current = setTimeout(() => {
      setPeekedWordIndex(null);
    }, 2500);
  };

  const activeAyah = ayahs[currentIndex] || ayahs[0];
  const activeSurahName = activeAyah ? (isEn ? SURAH_NAMES_EN[activeAyah.surahNumber - 1] : SURAH_NAMES_AR[activeAyah.surahNumber - 1]) : '';

  return (
    <div 
      className="h-[100dvh] flex flex-col select-none overflow-hidden" 
      dir={isEn ? 'ltr' : 'rtl'}
      style={{ 
        backgroundColor: pageBg, 
        color: pageTextColor,
        fontFamily: theme.font || "'Cairo', sans-serif"
      }}
    >
      {/* Studio Top Bar matching unified app-top-bar */}
      <header className="app-top-bar shrink-0 z-20" dir={isEn ? 'ltr' : 'rtl'}>
        <div className="app-top-bar__inner">
          <div className="flex items-center justify-between w-full min-h-[44px] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={handleExit}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer border-0 shrink-0"
                title={isEn ? 'Exit Studio' : 'الخروج والعودة للتحفيظ'}
                aria-label={isEn ? 'Exit Studio' : 'الخروج والعودة للتحفيظ'}
              >
                <ArrowRight size={20} className={isEn ? 'rotate-180' : ''} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-sm sm:text-base tracking-wide truncate font-kufi">
                    {activeSurahName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/15 shrink-0">
                    {isEn ? `Ayah ${activeAyah?.ayahNumber}` : `الآية ${activeAyah?.ayahNumber}`}
                  </span>
                </div>
                <div className="text-[10px] opacity-75 font-medium truncate">
                  {isEn ? `Page ${activeAyah?.page} • Juz ${activeAyah?.juz}` : `صفحة ${activeAyah?.page} • الجزء ${activeAyah?.juz}`}
                </div>
              </div>
            </div>

            {/* Right Tools: Mask Mode, Tafseer, Quiz */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                ref={maskBtnRef}
                type="button"
                onClick={() => {
                  if (!showMaskMenu && maskBtnRef.current) {
                    const rect = maskBtnRef.current.getBoundingClientRect();
                    setMaskMenuTop(Math.round(rect.bottom + 8));
                  }
                  setShowMaskMenu(prev => !prev);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer border-0"
                title={isEn ? 'Display / Mask Mode' : 'وضع الإظهار والإخفاء'}
                aria-label={isEn ? 'Display / Mask Mode' : 'وضع الإظهار والإخفاء'}
                aria-expanded={showMaskMenu}
              >
                {maskLevel === 0 ? <Eye size={19} /> : <EyeOff size={19} />}
              </button>

              <button
                onClick={() => setShowTafseerModal(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer border-0"
                title={isEn ? 'Quick Tafseer' : 'التفسير الميسر للآيات'}
                aria-label={isEn ? 'Quick Tafseer' : 'التفسير الميسر للآيات'}
              >
                <BookMarked size={18} />
              </button>

              <button
                onClick={() => setShowQuizModal(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer border-0"
                title={isEn ? 'Test Now' : 'اختبار وتثبيت الحفظ'}
                aria-label={isEn ? 'Test Now' : 'اختبار وتثبيت الحفظ'}
              >
                <Brain size={19} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Recitation Pause Indicator - Floating 3D Banner */}
      {isPauseActive && (
        <div 
          className={`app-page-card border-0 fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] max-w-sm px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2.5 animate-bounce ${s3d.surfaceCardClass}`}
          style={{ color: s3d.noticeAccent }}
        >
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }}
          >
            <Volume2 size={16} />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight">
            {isEn ? `Your turn to recite! (${pauseCountdown}s)` : `حان دورك للترديد بصوتك! (${pauseCountdown} ثوانٍ)`}
          </span>
        </div>
      )}

      {/* Main Quran Verse Canvas */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-4 space-y-4 max-w-xl mx-auto w-full hide-scrollbar">
        {ayahs.map((ayah, aIdx) => {
          const isActive = aIdx === currentIndex;
          const cleanText = stripTajweed(ayah.text);
          const words = cleanText.split(' ').filter(Boolean);

          return (
            <div
              key={`${ayah.surahNumber}:${ayah.ayahNumber}`}
              id={`session-ayah-${aIdx}`}
              data-card-item="true"
              onClick={() => {
                setCurrentIndex(aIdx);
                setCurrentAyahRepeat(1);
                if (isPlaying) playAyah(aIdx);
              }}
              className={`app-page-card tasbeeh-pressable border-0 p-5 rounded-3xl relative cursor-pointer ${s3d.surfaceCardClass} ${
                isActive ? 'ring-2 scale-[1.01]' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isActive ? s3d.activeTintBg : undefined,
                '--tw-ring-color': primaryColor,
                color: s3d.textColor
              } as React.CSSProperties}
            >
              {/* Header inside verse card */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold opacity-75">
                    {isEn ? SURAH_NAMES_EN[ayah.surahNumber - 1] : SURAH_NAMES_AR[ayah.surahNumber - 1]} - {isEn ? `Ayah ${ayah.ayahNumber}` : `الآية ${ayah.ayahNumber}`}
                  </span>
                  {isActive && currentStep?.modeBadge && (
                    <span 
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg"
                      style={{ backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }}
                    >
                      {currentStep.modeBadge}
                    </span>
                  )}
                </div>
                {isActive && (
                  <span 
                    className="font-bold text-[11px] px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.2 : 0.12),
                      color: primaryColor
                    }}
                  >
                    {isEn 
                      ? (currentStep ? currentStep.descriptionEn : `Repeat ${currentAyahRepeat}/${ayahRepeatTarget}`)
                      : (currentStep ? currentStep.descriptionAr : `تكرار ${currentAyahRepeat} من ${ayahRepeatTarget}`)}
                  </span>
                )}
              </div>

              {/* Words with Masking Logic */}
              <div 
                className="text-xl sm:text-2xl leading-[2.5] text-right font-serif select-none font-bold" 
                style={{ fontFamily: "'Amiri', 'Amiri Quran', serif", fontWeight: 700 }}
                dir="rtl"
              >
                {words.map((word, wIdx) => {
                  let isMasked = false;
                  if (maskLevel === 1) {
                    isMasked = wIdx >= words.length - 2;
                  } else if (maskLevel === 2) {
                    isMasked = wIdx % 2 === 1;
                  } else if (maskLevel === 3) {
                    isMasked = wIdx > 0;
                  }

                  const isPeeked = peekedWordIndex?.ayahIdx === aIdx && peekedWordIndex?.wordIdx === wIdx;

                  if (isMasked && !isPeeked) {
                    return (
                      <span
                        key={wIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWordPeek(aIdx, wIdx);
                        }}
                        className="inline-block mx-1 px-3 py-0.5 rounded-lg select-none cursor-pointer transition-all filter blur-[4px] hover:blur-none font-bold"
                        style={{
                          fontWeight: 700,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                          border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
                          color: 'transparent'
                        }}
                        title={isEn ? 'Tap to peek word' : 'انقر لكشف الكلمة'}
                      >
                        {word}
                      </span>
                    );
                  }

                  // Real-time word-by-word tracking during reciter playback
                  const isWordTrackingActive = isWordTrackingEnabled && isPlaying && isActive && !isPauseActive && Boolean(audioProgress && audioProgress.duration > 0);
                  let isCurrentRecitedWord = false;
                  if (isWordTrackingActive && words.length > 0 && audioProgress) {
                    const ratio = Math.min(1, Math.max(0, audioProgress.currentTime / audioProgress.duration));
                    const activeWIdx = Math.min(words.length - 1, Math.floor(ratio * words.length));
                    isCurrentRecitedWord = wIdx === activeWIdx;
                  }

                  // Highlight color according to chosen theme (text color only, NOT background shading, natural size)
                  const wordHighlightColor = isBlackTheme 
                    ? '#F59E0B' 
                    : (theme.highlightText || theme.accent || primaryColor || '#D97706');

                  return (
                    <span 
                      key={wIdx} 
                      className={`inline transition-colors duration-100 select-none font-bold ${
                        isPeeked ? 'text-amber-500 font-bold underline decoration-amber-500' : ''
                      }`}
                      style={{
                        fontWeight: 700,
                        color: isCurrentRecitedWord ? wordHighlightColor : (isPeeked ? '#F59E0B' : pageTextColor),
                        backgroundColor: 'transparent'
                      }}
                    >
                      {word}{' '}
                    </span>
                  );
                })}

                {/* Ayah End Symbol */}
                <span 
                  className="inline-flex items-center justify-center w-7 h-7 mx-1.5 rounded-full text-xs font-bold align-middle"
                  style={
                    isActive
                      ? { backgroundColor: primaryColor, color: btnTextColor, fontFamily: "'Cairo', sans-serif" }
                      : { backgroundColor: s3d.softResultBg, color: s3d.noticeAccent, fontFamily: "'Cairo', sans-serif" }
                  }
                >
                  {ayah.ayahNumber}
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating 3D Bottom Control Dock (Compact -25% vertical height & scaled icons) */}
      <footer 
        className="shrink-0 px-3 pt-1.5 sm:px-4 sm:pt-1.5 modal-sheet-safe-bottom z-20 overflow-visible"
        style={{ backgroundColor: s3d.pageBgColor }}
      >
        <div className={`app-page-card border-0 max-w-md mx-auto rounded-[22px] px-3.5 py-2.5 overflow-visible ${s3d.surfaceCardClass}`}>
          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-2.5 overflow-visible">
            {/* Word-by-Word Recitation Tracking Toggle */}
            <button
              type="button"
              onClick={() => setIsWordTrackingEnabled(!isWordTrackingEnabled)}
              className={`app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer text-[11px] font-black ${
                isWordTrackingEnabled ? '' : s3d.surfaceCardClass
              }`}
              style={isWordTrackingEnabled ? { backgroundColor: primaryColor, color: btnTextColor } : { color: s3d.textColor }}
              title={isEn 
                ? (isWordTrackingEnabled ? 'Word-by-word tracking: Enabled (1)' : 'Word-by-word tracking: Disabled (∞)') 
                : (isWordTrackingEnabled ? 'تحديد كلمة بكلمة: مفعل (1)' : 'تحديد كلمة بكلمة: معطل (∞)')}
            >
              {isWordTrackingEnabled ? (
                <span className="text-sm font-black leading-none">1</span>
              ) : (
                <Infinity size={15} />
              )}
            </button>

            {/* Prev Ayah */}
            <button
              onClick={handlePrevAyah}
              disabled={currentIndex <= 0}
              className={`app-page-card border-0 w-[34px] h-[34px] rounded-xl flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer ${s3d.surfaceCardClass}`}
              style={{ color: s3d.textColor }}
              title={isEn ? 'Previous Ayah' : 'الآية السابقة'}
            >
              <ChevronRight size={17} className={isEn ? 'rotate-180' : ''} />
            </button>

            {/* Play / Pause Primary 3D Button */}
            <button
              onClick={togglePlayPause}
              className="app-page-card border-0 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor, color: btnTextColor }}
              title={isPlaying ? (isEn ? 'Pause' : 'إيقاف مؤقت') : (isEn ? 'Play' : 'تشغيل')}
            >
              {isPlaying ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Next Ayah */}
            <button
              onClick={handleNextAyah}
              disabled={currentIndex >= ayahs.length - 1}
              className={`app-page-card border-0 w-[34px] h-[34px] rounded-xl flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer ${s3d.surfaceCardClass}`}
              style={{ color: s3d.textColor }}
              title={isEn ? 'Next Ayah' : 'الآية التالية'}
            >
              <ChevronLeft size={17} className={isEn ? 'rotate-180' : ''} />
            </button>

            {/* Speed Button with 3D Popover */}
            <div className="relative overflow-visible">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer text-[10px] font-black"
                style={{ backgroundColor: primaryColor, color: btnTextColor }}
                title={isEn ? 'Playback Speed' : 'سرعة الصوت'}
              >
                <span>{playbackSpeed}x</span>
              </button>

              {/* Speed Selection Popover Menu */}
              {showSpeedMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" 
                    onClick={() => setShowSpeedMenu(false)}
                  />
                  <div 
                    className={`app-page-card border-0 absolute bottom-11 left-0 sm:left-auto sm:right-0 z-50 w-36 rounded-2xl p-2.5 animate-fadeIn space-y-1.5 ${s3d.surfaceCardClass}`}
                    dir={isEn ? 'ltr' : 'rtl'}
                  >
                    <div className={`px-2 py-1 text-xs font-black opacity-75 flex items-center justify-between border-b pb-1 ${s3d.dividerClass}`}>
                      <span>{playbackSpeed}x</span>
                      <button 
                        onClick={() => setShowSpeedMenu(false)}
                        className="p-0.5 border-0 bg-transparent opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-0.5 pb-1 px-0.5 max-h-56 overflow-y-auto hide-scrollbar">
                      {SPEED_OPTIONS.map(speedVal => {
                        const isSelected = playbackSpeed === speedVal;
                        return (
                          <button
                            key={speedVal}
                            onClick={() => handleSelectSpeed(speedVal)}
                            className={`app-page-card border-0 w-full py-1.5 px-3 rounded-xl font-bold text-xs text-center transition-all cursor-pointer ${
                              isSelected ? '' : s3d.surfaceCardClass
                            }`}
                            style={isSelected ? { backgroundColor: primaryColor, color: btnTextColor } : undefined}
                          >
                            {speedVal}x
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Mask Mode Selection Dropdown Menu (Outside <header> for clean theme styling) */}
      {showMaskMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setShowMaskMenu(false)}
          />
          <div
            className="fixed inset-x-0 z-50 pointer-events-none px-3"
            style={{ top: `${maskMenuTop}px` }}
          >
            <div className="max-w-[900px] mx-auto relative">
              <div
                className={`app-page-card border-0 pointer-events-auto absolute top-0 ${isEn ? 'right-0' : 'left-0'} w-44 rounded-2xl p-2.5 space-y-1.5 ${s3d.surfaceCardClass}`}
                dir={isEn ? 'ltr' : 'rtl'}
              >
                <div className={`px-2 py-1 text-xs font-black opacity-80 flex items-center justify-between border-b pb-1.5 ${s3d.dividerClass}`}>
                  <span className="flex items-center gap-1.5">
                    <Eye size={13} style={{ color: s3d.noticeAccent }} />
                    <span>{isEn ? 'Display Mode' : 'وضع الإظهار'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMaskMenu(false)}
                    className="p-0.5 border-0 bg-transparent opacity-60 hover:opacity-100 cursor-pointer"
                    aria-label={isEn ? 'Close' : 'إغلاق'}
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="space-y-1.5 pt-0.5 pb-0.5 px-0.5">
                  {([
                    { lvl: 0 as MaskLevel, labelAr: 'ظاهر', labelEn: 'Visible' },
                    { lvl: 1 as MaskLevel, labelAr: 'الأواخر', labelEn: 'Endings' },
                    { lvl: 2 as MaskLevel, labelAr: 'نصف', labelEn: '50% Mask' },
                    { lvl: 3 as MaskLevel, labelAr: 'مخفي', labelEn: 'Hidden' },
                  ]).map((m) => {
                    const isSelected = maskLevel === m.lvl;
                    return (
                      <button
                        key={m.lvl}
                        type="button"
                        onClick={() => {
                          setMaskLevel(m.lvl);
                          setShowMaskMenu(false);
                        }}
                        className={`app-page-card border-0 w-full py-1.5 px-3 rounded-xl font-bold text-xs text-center transition-all cursor-pointer ${
                          isSelected ? '' : s3d.surfaceCardClass
                        }`}
                        style={isSelected ? { backgroundColor: primaryColor, color: btnTextColor } : undefined}
                      >
                        {isEn ? m.labelEn : m.labelAr}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div 
          className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
          dir={isEn ? 'ltr' : 'rtl'}
          onClick={() => {}}
        >
          <div 
            className={`app-page-card border-0 w-full max-w-sm rounded-[2rem] p-6 text-center space-y-4 ${s3d.surfaceCardClass}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Celebration Icon */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }}
            >
              <Trophy size={36} />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-base sm:text-lg">
                {isEn ? 'Range Recitation Completed!' : 'تم الانتهاء من تلاوة الآيات بنجاح 🎉'}
              </h3>
              <p className="text-xs opacity-75 leading-relaxed max-w-xs mx-auto font-medium">
                {isEn 
                  ? `Recitation and repetition of ${activeSurahName} (Verses ${fromAyah} to ${toAyah}) has completed.`
                  : `أتممت الاستماع والتكرار لآيات ${activeSurahName} (من الآية ${fromAyah} إلى ${toAyah}) بالكامل.`}
              </p>
            </div>

            {/* The Two Main Action Buttons */}
            <div className="space-y-2.5 pt-2 pb-1 overflow-visible">
              <button
                onClick={handleReplaySession}
                className="app-page-card border-0 w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: primaryColor, color: btnTextColor }}
              >
                <RotateCcw size={17} />
                <span>{isEn ? 'Replay Verses (Start Over)' : 'إعادة القراءة (من البداية)'}</span>
              </button>

              <button
                onClick={handleExit}
                className={`app-page-card border-0 w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${s3d.surfaceCardClass}`}
              >
                <ArrowRight size={16} className={isEn ? 'rotate-180' : ''} />
                <span>{isEn ? 'Back to Memorization' : 'العودة لصفحة التحفيظ'}</span>
              </button>

              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setShowQuizModal(true);
                }}
                className="w-full py-2 px-4 rounded-xl font-bold text-[11px] border-0 bg-transparent opacity-80 hover:opacity-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                style={{ color: s3d.noticeAccent }}
              >
                <Brain size={14} />
                <span>{isEn ? 'Test Your Memorization Now' : 'اختبار وتثبيت الحفظ الآن'}</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Quiz Modal */}
      {showQuizModal && (
        <MemorizationQuizModal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          fromSurah={fromSurah}
          fromAyah={fromAyah}
          toSurah={toSurah}
          toAyah={toAyah}
          rangeId={rangeId}
          primaryColor={primaryColor}
          btnTextColor={btnTextColor}
          isEn={isEn}
          onComplete={(mastery) => {
            setShowQuizModal(false);
          }}
        />
      )}

      {/* Quick Tafseer Modal */}
      {showTafseerModal && (
        <MemorizationPreviewModal
          isOpen={showTafseerModal}
          onClose={() => setShowTafseerModal(false)}
          onStartSession={() => setShowTafseerModal(false)}
          fromSurah={fromSurah}
          fromAyah={fromAyah}
          toSurah={toSurah}
          toAyah={toAyah}
          primaryColor={primaryColor}
          btnTextColor={btnTextColor}
          isEn={isEn}
        />
      )}
    </div>
  );
};

export default MemorizationSession;
