import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowRight, Play, Pause, RotateCcw, Volume2, Mic, MicOff, Eye, EyeOff, 
  HelpCircle, BookOpen, Brain, CheckCircle2, ChevronRight, ChevronLeft, 
  FastForward, Settings2, Sparkles, BookMarked, Trophy, X, AlertCircle, RefreshCw, Gauge, Zap, Infinity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAyahsInRange, AyahPointer, normalizeForSpeechMatch, calculateAyahMatchScore } from '../utils/quranMemorizationUtils';
import { SURAH_NAMES_AR, MEMORIZATION_READERS } from '../components/QuranReader/constants';
import { SURAH_NAMES_EN } from './Memorization';
import { registerBackInterceptor } from '../hooks/useBackButton';
import MemorizationQuizModal from '../components/Memorization/MemorizationQuizModal';
import MemorizationPreviewModal from '../components/Memorization/MemorizationPreviewModal';
import { memorizationService, MasteryLevel } from '../services/memorizationService';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { acquireListenInterruption, releaseListenInterruption } from '../utils/listenAudioCoordinator';

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
  const { theme, themeKey } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Determine if active theme is a dark variant
  const isDark = Boolean(theme.isDark || (theme.bgColor && [
    '#000000', '#090D16', '#0B0F19', '#111827', '#0F172A', '#1C1917', '#1E1B4B', '#191D3A', '#0C0A09'
  ].includes(theme.bgColor.toUpperCase())));

  const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.accent || '#10B981');
  const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';

  // Dynamic colors derived from active theme with pure white page background
  const pageBg = '#FFFFFF';
  const pageTextColor = '#0F172A';
  const headerBg = theme.topBarBg || theme.barBg || (isBlackTheme ? '#F8FAFC' : (theme.accent ? `${theme.accent}25` : '#FEF3C7'));
  const footerBg = theme.barBg || (isBlackTheme ? '#F8FAFC' : (theme.accent ? `${theme.accent}30` : '#FDE047'));

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
  const [currentRangeRepeat, setCurrentRangeRepeat] = useState(1);
  const [isPauseActive, setIsPauseActive] = useState(false);
  const [pauseCountdown, setPauseCountdown] = useState(0);

  // Masking level: 0=visible, 1=hide endings, 2=hide half, 3=hide all
  const [maskLevel, setMaskLevel] = useState<MaskLevel>(0);
  const [peekedWordIndex, setPeekedWordIndex] = useState<{ ayahIdx: number; wordIdx: number } | null>(null);

  // Available playback speeds: numbers only [0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x]
  const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Word-by-word tracking during recitation
  const [isWordTrackingEnabled, setIsWordTrackingEnabled] = useState(true);
  const [audioProgress, setAudioProgress] = useState<{ currentTime: number; duration: number } | null>(null);

  // Self Voice Recording & Speech Verification Engine
  const [isRecordingSelf, setIsRecordingSelf] = useState(false);
  const [selfAudioUrl, setSelfAudioUrl] = useState<string | null>(null);
  const [isPlayingSelf, setIsPlayingSelf] = useState(false);
  const [isPlayingReciterComparison, setIsPlayingReciterComparison] = useState(false);
  const comparisonAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Speech Recognition & Evaluation Engine state
  const [speechVerificationResult, setSpeechVerificationResult] = useState<{
    score: number;
    passed: boolean;
    spokenText: string;
    ayahText: string;
    matchedWords: boolean[];
    ayahWords: string[];
    ayahNumber: number;
    surahNumber: number;
  } | null>(null);
  const [isEvaluatingSpeech, setIsEvaluatingSpeech] = useState(false);
  const [showSpeechResultModal, setShowSpeechResultModal] = useState(false);
  const recognitionInstanceRef = useRef<any>(null);
  const recognizedSpokenTextRef = useRef<string>('');

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
    if (comparisonAudioRef.current) {
      comparisonAudioRef.current.pause();
      comparisonAudioRef.current.src = '';
    }
    if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);

    // Stop active speech recognition if active
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.stop();
      } catch (e) {}
    }

    releaseListenInterruption('mem-session-audio');
    releaseListenInterruption('mem-session-compare');
    releaseListenInterruption('mem-session-self');
    releaseListenInterruption('mem-session-mic');
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
      if (showSpeedMenu) {
        setShowSpeedMenu(false);
        return true;
      }
      if (showSpeechResultModal) {
        setShowSpeechResultModal(false);
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
  }, [showSpeedMenu, showSpeechResultModal, showQuizModal, showTafseerModal, showCompletionModal, handleExit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (comparisonAudioRef.current) {
        comparisonAudioRef.current.pause();
        comparisonAudioRef.current.src = '';
      }
      if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
      if (recognitionInstanceRef.current) {
        try { recognitionInstanceRef.current.stop?.(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      releaseListenInterruption('mem-session-audio');
      releaseListenInterruption('mem-session-compare');
      releaseListenInterruption('mem-session-self');
      releaseListenInterruption('mem-session-mic');
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
      setCurrentRangeRepeat(nextRangeRepeat);

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
    setCurrentRangeRepeat(1);
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

  // Safe sound feedback helper
  const playSoundFeedback = (type: 'correct' | 'wrong') => {
    try {
      if (type === 'correct') {
        acquireListenInterruption('mem-session-chime');
        const audio = new Audio('/assets/audio/chime.mp3');
        audio.volume = 0.5;
        audio.onended = () => releaseListenInterruption('mem-session-chime');
        audio.onerror = () => releaseListenInterruption('mem-session-chime');
        audio.play().catch(() => releaseListenInterruption('mem-session-chime'));
        Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      } else {
        Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
      }
    } catch (e) {
      releaseListenInterruption('mem-session-chime');
    }
  };

  // Play reciter audio for comparison inside verification modal
  const playReciterComparison = (surahNum: number, ayahNum: number) => {
    if (comparisonAudioRef.current) {
      comparisonAudioRef.current.pause();
    }
    acquireListenInterruption('mem-session-compare');
    const url = getAyahAudioUrl(surahNum, ayahNum);
    const aud = new Audio(url);
    comparisonAudioRef.current = aud;
    aud.playbackRate = playbackSpeed;
    aud.defaultPlaybackRate = playbackSpeed;
    setIsPlayingReciterComparison(true);
    aud.onended = () => {
      setIsPlayingReciterComparison(false);
      releaseListenInterruption('mem-session-compare');
    };
    aud.onerror = () => {
      setIsPlayingReciterComparison(false);
      releaseListenInterruption('mem-session-compare');
    };
    aud.play().catch(() => {
      setIsPlayingReciterComparison(false);
      releaseListenInterruption('mem-session-compare');
    });
  };

  // Retry recording from modal
  const handleRetryRecording = () => {
    setShowSpeechResultModal(false);
    if (comparisonAudioRef.current) {
      comparisonAudioRef.current.pause();
      setIsPlayingReciterComparison(false);
    }
    setTimeout(() => {
      toggleSelfRecording();
    }, 250);
  };

  // Evaluate transcribed text against the active verse
  const evaluateRecordedRecitation = (transcript: string) => {
    const activeA = ayahs[currentIndexRef.current];
    if (!activeA) return;

    setIsEvaluatingSpeech(true);
    const cleanAyahText = stripTajweed(activeA.text);
    const match = calculateAyahMatchScore(cleanAyahText, transcript);

    const passed = match.score >= 65; // Threshold for spoken Quran match
    const resultObj = {
      score: match.score,
      passed,
      spokenText: transcript || (isEn ? '(No clear speech detected)' : '(لم يتم التقاط صوت واضح، يُرجى التحدث بصوت أوضح قرب المايكروفون)'),
      ayahText: cleanAyahText,
      matchedWords: match.matchedWords,
      ayahWords: match.ayahWords,
      ayahNumber: activeA.ayahNumber,
      surahNumber: activeA.surahNumber
    };

    setSpeechVerificationResult(resultObj);
    setIsEvaluatingSpeech(false);
    setShowSpeechResultModal(true);

    if (passed) {
      playSoundFeedback('correct');
    } else {
      playSoundFeedback('wrong');
    }
  };

  // Self Voice Recording & Speech Recognition Engine
  const toggleSelfRecording = async () => {
    if (isRecordingSelf) {
      // 1. Stop Recording & Trigger Speech Verification
      setIsRecordingSelf(false);

      // Stop native or web audio recorder
      try {
        if (Capacitor.isNativePlatform()) {
          const res = await VoiceRecorder.stopRecording().catch(() => null);
          if (res?.value?.recordDataBase64) {
            setSelfAudioUrl(`data:audio/aac;base64,${res.value.recordDataBase64}`);
          }
        } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.warn('Audio recorder stop error', e);
      }

      // Stop speech recognition and evaluate transcript
      if (recognitionInstanceRef.current) {
        try {
          if (Capacitor.isNativePlatform()) {
            const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
            await SpeechRecognition.stop().catch(() => {});
            await SpeechRecognition.removeAllListeners().catch(() => {});
          } else {
            recognitionInstanceRef.current.stop();
          }
        } catch (e) {}
      }

      // Small delay to ensure final transcript chunk arrived
      releaseListenInterruption('mem-session-mic');
      setTimeout(() => {
        const transcript = recognizedSpokenTextRef.current.trim();
        evaluateRecordedRecitation(transcript);
      }, 350);

    } else {
      // 2. Start Recording & Listening
      // Pause playback if reciting so mic hears the user clearly
      if (isPlaying) {
        if (audioRef.current) audioRef.current.pause();
        if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
        setIsPlaying(false);
        setIsPauseActive(false);
        releaseListenInterruption('mem-session-audio');
      }
      acquireListenInterruption('mem-session-mic');

      setSelfAudioUrl(null);
      setSpeechVerificationResult(null);
      recognizedSpokenTextRef.current = '';

      try {
        // A) Start Speech Recognition Engine
        if (Capacitor.isNativePlatform()) {
          const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
          const perm = await SpeechRecognition.checkPermissions();
          if (perm.speechRecognition !== 'granted') {
            const req = await SpeechRecognition.requestPermissions();
            if (req.speechRecognition !== 'granted') {
              releaseListenInterruption('mem-session-mic');
              alert(isEn ? 'Speech recognition permission needed' : 'يلزم إذن التعرف على الصوت لمقارنة القراءة');
              return;
            }
          }

          SpeechRecognition.addListener('partialResults', (data: any) => {
            if (data?.matches && data.matches.length > 0) {
              recognizedSpokenTextRef.current = data.matches[0];
            }
          });

          await SpeechRecognition.start({
            language: 'ar-SA',
            maxResults: 5,
            prompt: isEn ? 'Recite the verse now' : 'اقرأ الآية بصوتك الآن للمقارنة والتحقق',
            partialResults: true,
            popup: false
          });
          recognitionInstanceRef.current = SpeechRecognition;
        } else {
          // Web Speech Recognition
          const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRec) {
            const recognition = new SpeechRec();
            recognition.lang = 'ar-SA';
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
              let currentTranscript = '';
              for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript + ' ';
              }
              recognizedSpokenTextRef.current = currentTranscript.trim();
            };

            recognition.onerror = (err: any) => {
              console.warn('Speech recognition error:', err);
            };

            recognition.start();
            recognitionInstanceRef.current = recognition;
          }
        }

        // B) Start Audio Recording for Playback
        if (Capacitor.isNativePlatform()) {
          const perm = await VoiceRecorder.hasAudioRecordingPermission();
          if (!perm.value) {
            await VoiceRecorder.requestAudioRecordingPermission();
          }
          await VoiceRecorder.startRecording();
        } else {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mr = new MediaRecorder(stream);
          audioChunksRef.current = [];
          mr.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mr.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setSelfAudioUrl(URL.createObjectURL(blob));
            stream.getTracks().forEach(t => t.stop());
          };
          mr.start();
          mediaRecorderRef.current = mr;
        }

        setIsRecordingSelf(true);
      } catch (e) {
        console.warn('Start recording/speech error', e);
        setIsRecordingSelf(false);
        releaseListenInterruption('mem-session-mic');
        alert(isEn ? 'Microphone permission needed to verify recitation' : 'يلزم إذن المايكروفون للتحقق من قراءتك ومقارنتها');
      }
    }
  };

  const playSelfAudio = () => {
    if (!selfAudioUrl) return;
    acquireListenInterruption('mem-session-self');
    const aud = new Audio(selfAudioUrl);
    setIsPlayingSelf(true);
    aud.onended = () => {
      setIsPlayingSelf(false);
      releaseListenInterruption('mem-session-self');
    };
    aud.onerror = () => {
      setIsPlayingSelf(false);
      releaseListenInterruption('mem-session-self');
    };
    aud.play().catch(() => {
      setIsPlayingSelf(false);
      releaseListenInterruption('mem-session-self');
    });
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
      {/* Studio Top Bar - Theme matched, no dark overlay */}
      <header 
        className="shrink-0 px-4 pb-2.5 z-20 flex items-center justify-between transition-colors"
        style={{ 
          backgroundColor: headerBg,
          borderBottom: theme.barBorder || (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)'),
          paddingTop: 'calc(var(--app-safe-top) + 0.75rem)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExit}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-0 active:scale-90"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: pageTextColor
            }}
            title={isEn ? 'Exit Studio' : 'الخروج والعودة للتحفيظ'}
          >
            <ArrowRight size={20} className={isEn ? 'rotate-180' : ''} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide" style={{ color: pageTextColor }}>
                {activeSurahName}
              </span>
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
              >
                {isEn ? `Ayah ${activeAyah?.ayahNumber}` : `الآية ${activeAyah?.ayahNumber}`}
              </span>
            </div>
            <div className="text-[10px] opacity-65 font-medium" style={{ color: pageTextColor }}>
              {isEn ? `Page ${activeAyah?.page} • Juz ${activeAyah?.juz}` : `صفحة ${activeAyah?.page} • الجزء ${activeAyah?.juz}`}
            </div>
          </div>
        </div>

        {/* Right Tools: Word-by-Word Toggle, Tafseer, Quiz */}
        <div className="flex items-center gap-1.5">
          {/* Word-by-Word Recitation Tracking Toggle */}
          <button
            onClick={() => setIsWordTrackingEnabled(!isWordTrackingEnabled)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border active:scale-95 text-xs font-black"
            style={{ 
              backgroundColor: isWordTrackingEnabled 
                ? (isBlackTheme ? '#FFFFFF' : `${primaryColor}22`) 
                : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
              borderColor: isWordTrackingEnabled 
                ? (isBlackTheme ? '#FFFFFF' : `${primaryColor}60`) 
                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'),
              color: isWordTrackingEnabled ? (isBlackTheme ? '#000000' : primaryColor) : pageTextColor
            }}
            title={isEn 
              ? (isWordTrackingEnabled ? 'Word-by-word tracking: Enabled (1)' : 'Word-by-word tracking: Disabled (∞)') 
              : (isWordTrackingEnabled ? 'تحديد كلمة بكلمة: مفعل (1)' : 'تحديد كلمة بكلمة: معطل (∞)')}
          >
            {isWordTrackingEnabled ? (
              <span className="text-sm font-black leading-none">1</span>
            ) : (
              <Infinity size={18} />
            )}
          </button>

          <button
            onClick={() => setShowTafseerModal(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border-0 active:scale-95"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: pageTextColor
            }}
            title={isEn ? 'Quick Tafseer' : 'التفسير الميسر للآيات'}
          >
            <BookMarked size={17} />
          </button>

          <button
            onClick={() => setShowQuizModal(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border-0 active:scale-95"
            style={{ 
              backgroundColor: `${primaryColor}20`, 
              color: primaryColor 
            }}
            title={isEn ? 'Test Now' : 'اختبار وتثبيت الحفظ'}
          >
            <Brain size={18} />
          </button>
        </div>
      </header>

      {/* Mask Level Toggle Ribbon - Clean light style on white background */}
      <div 
        className="shrink-0 px-4 py-2 flex items-center justify-between text-xs transition-colors"
        style={{ 
          backgroundColor: '#FFFDF5',
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}
      >
        <div className="flex items-center gap-1.5 font-bold text-[11px]" style={{ color: pageTextColor }}>
          <Eye size={14} style={{ color: primaryColor }} />
          <span>{isEn ? 'Visual Masking:' : 'نمط الإخفاء البصري:'}</span>
        </div>
        <div 
          className="flex p-0.5 rounded-xl gap-1 text-[10px] font-bold transition-colors"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}
        >
          <button
            onClick={() => setMaskLevel(0)}
            className="px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer"
            style={{
              backgroundColor: maskLevel === 0 ? primaryColor : 'transparent',
              color: maskLevel === 0 ? btnTextColor : pageTextColor,
              opacity: maskLevel === 0 ? 1 : 0.65,
              fontWeight: maskLevel === 0 ? 'bold' : 'normal'
            }}
          >
            {isEn ? 'Visible' : 'ظاهر'}
          </button>
          <button
            onClick={() => setMaskLevel(1)}
            className="px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer"
            style={{
              backgroundColor: maskLevel === 1 ? primaryColor : 'transparent',
              color: maskLevel === 1 ? btnTextColor : pageTextColor,
              opacity: maskLevel === 1 ? 1 : 0.65,
              fontWeight: maskLevel === 1 ? 'bold' : 'normal'
            }}
          >
            {isEn ? 'Endings' : 'الأواخر'}
          </button>
          <button
            onClick={() => setMaskLevel(2)}
            className="px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer"
            style={{
              backgroundColor: maskLevel === 2 ? primaryColor : 'transparent',
              color: maskLevel === 2 ? btnTextColor : pageTextColor,
              opacity: maskLevel === 2 ? 1 : 0.65,
              fontWeight: maskLevel === 2 ? 'bold' : 'normal'
            }}
          >
            {isEn ? '50% Mask' : 'نصف'}
          </button>
          <button
            onClick={() => setMaskLevel(3)}
            className="px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer"
            style={{
              backgroundColor: maskLevel === 3 ? primaryColor : 'transparent',
              color: maskLevel === 3 ? btnTextColor : pageTextColor,
              opacity: maskLevel === 3 ? 1 : 0.65,
              fontWeight: maskLevel === 3 ? 'bold' : 'normal'
            }}
          >
            {isEn ? 'Hidden' : 'مخفي'}
          </button>
        </div>
      </div>

      {/* Recitation Pause Indicator - Floating Floating Banner / Card Overlay */}
      {isPauseActive && !isRecordingSelf && (
        <div 
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] max-w-sm px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-center gap-2.5 animate-bounce border"
          style={{ 
            backgroundColor: isDark ? 'rgba(24, 24, 27, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: `${primaryColor}40`,
            color: primaryColor,
            boxShadow: `0 10px 25px -5px ${primaryColor}35`
          }}
        >
          <div 
            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
          >
            <Volume2 size={16} />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight">
            {isEn ? `Your turn to recite! (${pauseCountdown}s)` : `حان دورك للترديد بصوتك! (${pauseCountdown} ثوانٍ)`}
          </span>
        </div>
      )}

      {/* Live Recording Indicator - Prominent floating feedback */}
      {isRecordingSelf && (
        <div 
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 border animate-pulse"
          style={{ 
            backgroundColor: isDark ? 'rgba(24, 24, 27, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            borderColor: '#EF4444',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
              <Mic size={18} className="animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-600 dark:text-red-400">
                {isEn ? 'Listening to your recitation...' : '🎙️ جارٍ الاستماع لتلاوتك...'}
              </div>
              <div className="text-[10px] opacity-75 font-medium" style={{ color: pageTextColor }}>
                {isEn ? 'Recite clearly, tap mic to evaluate' : 'اقرأ الآية بوضوح ثم اضغط المايك للمقارنة والتقييم'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleSelfRecording}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer border-0 active:scale-95 shrink-0 shadow"
          >
            {isEn ? 'Evaluate' : 'إنهاء وتقييم'}
          </button>
        </div>
      )}

      {/* Evaluating Audio Spinner Toast */}
      {isEvaluatingSpeech && (
        <div 
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-center gap-2.5 border"
          style={{ 
            backgroundColor: isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            borderColor: `${primaryColor}40`,
            color: primaryColor
          }}
        >
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-xs font-bold">
            {isEn ? 'Comparing your recitation to Quranic text...' : 'جارٍ مقارنة تلاوتك بالنص وتدقيق الكلمات...'}
          </span>
        </div>
      )}

      {/* Verified Recitation Floating Toast (when modal is closed or for quick glance) */}
      {speechVerificationResult && !showSpeechResultModal && (
        <div 
          onClick={() => setShowSpeechResultModal(true)}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[92%] px-3.5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 border cursor-pointer animate-fadeIn"
          style={{
            backgroundColor: speechVerificationResult.passed 
              ? (isDark ? 'rgba(6, 78, 59, 0.95)' : 'rgba(236, 253, 245, 0.98)')
              : (isDark ? 'rgba(127, 29, 29, 0.95)' : 'rgba(254, 242, 242, 0.98)'),
            borderColor: speechVerificationResult.passed ? '#10B981' : '#EF4444',
            color: speechVerificationResult.passed ? (isDark ? '#A7F3D0' : '#065F46') : (isDark ? '#FECACA' : '#991B1B')
          }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs text-white shadow-sm"
              style={{ backgroundColor: speechVerificationResult.passed ? '#10B981' : '#EF4444' }}
            >
              {speechVerificationResult.score}%
            </div>
            <div>
              <div className="font-bold text-xs">
                {speechVerificationResult.passed 
                  ? (isEn ? 'Recitation Verified: Excellent!' : 'تقييم التلاوة: قراءة صحيحة ومتقنة! ✨') 
                  : (isEn ? 'Recitation needs practice' : 'تقييم التلاوة: بحاجة لمزيد من الترديد ⚠️')}
              </div>
              <div className="text-[10px] opacity-80">
                {isEn ? 'Tap to view word comparison & listen' : 'انقر لعرض مقارنة الكلمات والاستماع لتسجيلك'}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSpeechVerificationResult(null);
            }}
            className="p-1 rounded-lg opacity-60 hover:opacity-100 border-0 bg-transparent cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Quran Verse Canvas */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-4 space-y-4 max-w-xl mx-auto w-full hide-scrollbar">
        {ayahs.map((ayah, aIdx) => {
          const isActive = aIdx === currentIndex;
          const cleanText = stripTajweed(ayah.text);
          const words = cleanText.split(' ').filter(Boolean);

          return (
            <div
              key={`${ayah.surahNumber}:${ayah.ayahNumber}`}
              id={`session-ayah-${aIdx}`}
              onClick={() => {
                setCurrentIndex(aIdx);
                setCurrentAyahRepeat(1);
                if (isPlaying) playAyah(aIdx);
              }}
              className={`p-5 rounded-3xl transition-all duration-300 relative border cursor-pointer ${
                isActive ? 'shadow-md scale-[1.01]' : 'shadow-none opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isActive 
                  ? (theme.cardBg || '#FEF08A')
                  : '#FFFDF5',
                borderColor: isActive ? primaryColor : (theme.cardBorder || `${primaryColor}60` || 'rgba(0,0,0,0.12)'),
                borderWidth: isActive ? '2px' : '1px',
                color: pageTextColor
              }}
            >
              {/* Header inside verse card */}
              <div className="flex items-center justify-between mb-3 text-xs opacity-70">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold">
                    {isEn ? SURAH_NAMES_EN[ayah.surahNumber - 1] : SURAH_NAMES_AR[ayah.surahNumber - 1]} - {isEn ? `Ayah ${ayah.ayahNumber}` : `الآية ${ayah.ayahNumber}`}
                  </span>
                  {isActive && currentStep?.modeBadge && (
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    >
                      {currentStep.modeBadge}
                    </span>
                  )}
                </div>
                {isActive && (
                  <span 
                    className="font-bold text-[11px] px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
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

                  // Speech verification highlight if this ayah was evaluated
                  const isThisAyahEvaluated = speechVerificationResult && 
                    speechVerificationResult.ayahNumber === ayah.ayahNumber && 
                    speechVerificationResult.surahNumber === ayah.surahNumber;

                  const isWordMatched = isThisAyahEvaluated && 
                    speechVerificationResult.matchedWords && 
                    Boolean(speechVerificationResult.matchedWords[wIdx]);

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
                        isThisAyahEvaluated
                          ? isWordMatched
                            ? 'text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/15 px-1 py-0.5 rounded-lg border border-emerald-500/30 inline-block mx-0.5'
                            : 'text-rose-700 dark:text-rose-300 font-bold bg-rose-500/15 px-1 py-0.5 rounded-lg border border-rose-500/30 underline decoration-rose-500 decoration-wavy inline-block mx-0.5'
                          : isPeeked 
                            ? 'text-amber-500 font-bold underline decoration-amber-500' 
                            : ''
                      }`}
                      style={{
                        fontWeight: 700,
                        color: isThisAyahEvaluated 
                          ? undefined 
                          : (isCurrentRecitedWord ? wordHighlightColor : (isPeeked ? '#F59E0B' : pageTextColor)),
                        backgroundColor: isThisAyahEvaluated ? undefined : 'transparent'
                      }}
                    >
                      {word}{' '}
                    </span>
                  );
                })}

                {/* Ayah End Symbol */}
                <span 
                  className="inline-flex items-center justify-center w-7 h-7 mx-1.5 rounded-full text-xs font-bold align-middle shadow-inner"
                  style={{ 
                    backgroundColor: isActive ? primaryColor : `${primaryColor}25`, 
                    color: isActive ? btnTextColor : primaryColor,
                    fontFamily: "'Cairo', sans-serif"
                  }}
                >
                  {ayah.ayahNumber}
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating Bottom Control Dock - Theme matched, no dark overlay */}
      <footer 
        className="shrink-0 px-3 pt-3 sm:px-4 sm:pt-4 modal-sheet-safe-bottom z-20 transition-colors"
        style={{ 
          backgroundColor: footerBg,
          borderTop: theme.barBorder || (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)')
        }}
      >
        <div className="max-w-md mx-auto space-y-3">
          {/* Progress Counters & Self Audio Player */}
          <div className="flex items-center justify-between text-xs px-2 font-bold opacity-80" style={{ color: pageTextColor }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                {isEn ? `Range Repeat: ${currentRangeRepeat}/${rangeRepeatTarget}` : `تكرار النطاق: ${currentRangeRepeat} من ${rangeRepeatTarget}`}
              </span>
              {currentStep && playbackSteps.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-bold">
                  {isEn ? `Step ${currentStepIndex + 1}/${playbackSteps.length}` : `الخطوة ${currentStepIndex + 1} من ${playbackSteps.length}`}
                </span>
              )}
            </div>

            {selfAudioUrl && (
              <button
                onClick={playSelfAudio}
                className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer border-0"
              >
                <Volume2 size={13} />
                <span>{isPlayingSelf ? (isEn ? 'Playing...' : 'جارٍ السماع...') : (isEn ? 'Listen to You' : 'اسمع صوتك')}</span>
              </button>
            )}
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Self Recording Button - Clean Icon Only */}
            <button
              onClick={toggleSelfRecording}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer border ${
                isRecordingSelf ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-400 border-red-500' : ''
              }`}
              style={{
                backgroundColor: isRecordingSelf ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                color: isRecordingSelf ? '#FFFFFF' : pageTextColor
              }}
              title={isEn ? 'Record & Check Your Recitation' : 'سجل صوتك وقارنه بالقارئ والنص القرآني'}
            >
              {isRecordingSelf ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Prev Ayah */}
            <button
              onClick={handlePrevAyah}
              disabled={currentIndex <= 0}
              className="w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer border"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                color: pageTextColor
              }}
              title={isEn ? 'Previous Ayah' : 'الآية السابقة'}
            >
              <ChevronRight size={22} className={isEn ? 'rotate-180' : ''} />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer border-0"
              style={{ 
                backgroundColor: primaryColor, 
                color: btnTextColor,
                boxShadow: `0 8px 24px ${primaryColor}40`
              }}
              title={isPlaying ? (isEn ? 'Pause' : 'إيقاف مؤقت') : (isEn ? 'Play' : 'تشغيل')}
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Next Ayah */}
            <button
              onClick={handleNextAyah}
              disabled={currentIndex >= ayahs.length - 1}
              className="w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer border"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                color: pageTextColor
              }}
              title={isEn ? 'Next Ayah' : 'الآية التالية'}
            >
              <ChevronLeft size={22} className={isEn ? 'rotate-180' : ''} />
            </button>

            {/* Speed Button with Popover - Numbers Only */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-all cursor-pointer border text-xs font-black"
                style={{
                  backgroundColor: showSpeedMenu 
                    ? primaryColor 
                    : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                  borderColor: showSpeedMenu 
                    ? primaryColor 
                    : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                  color: showSpeedMenu ? btnTextColor : pageTextColor
                }}
                title={isEn ? 'Playback Speed' : 'سرعة الصوت'}
              >
                <span>{playbackSpeed}x</span>
              </button>

              {/* Speed Selection Popover Menu - Clean Numbers Only */}
              {showSpeedMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" 
                    onClick={() => setShowSpeedMenu(false)}
                  />
                  <div 
                    className="absolute bottom-14 left-0 sm:left-auto sm:right-0 z-50 w-36 rounded-2xl p-2.5 shadow-2xl border animate-fadeIn space-y-1.5"
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                      color: pageTextColor
                    }}
                    dir={isEn ? 'ltr' : 'rtl'}
                  >
                    <div 
                      className="px-2 py-1 text-xs font-black opacity-70 flex items-center justify-between border-b pb-1"
                      style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                    >
                      <span>{playbackSpeed}x</span>
                      <button 
                        onClick={() => setShowSpeedMenu(false)}
                        className="p-0.5 border-0 bg-transparent opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className="space-y-1 pt-0.5 max-h-56 overflow-y-auto hide-scrollbar">
                      {SPEED_OPTIONS.map(speedVal => {
                        const isSelected = playbackSpeed === speedVal;
                        return (
                          <button
                            key={speedVal}
                            onClick={() => handleSelectSpeed(speedVal)}
                            className="w-full py-1.5 px-3 rounded-xl font-bold text-xs text-center transition-all cursor-pointer border-0 active:scale-95"
                            style={{
                              backgroundColor: isSelected ? primaryColor : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                              color: isSelected ? btnTextColor : pageTextColor
                            }}
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

      {/* Completion Modal: Sound stops completely, options to Replay or Return to Memorization */}
      {showCompletionModal && (
        <div 
          className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
          dir={isEn ? 'ltr' : 'rtl'}
          onClick={() => {}}
        >
          <div 
            className="w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center space-y-4 border"
            style={{
              backgroundColor: theme.modalBg || (isDark ? '#18181B' : '#FFFFFF'),
              color: pageTextColor,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Celebration Icon */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md"
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
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

            {/* The Two Main Action Buttons as requested */}
            <div className="space-y-2.5 pt-2">
              {/* Option 1: Replay verses from start */}
              <button
                onClick={handleReplaySession}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                style={{ backgroundColor: primaryColor, color: btnTextColor }}
              >
                <RotateCcw size={17} />
                <span>{isEn ? 'Replay Verses (Start Over)' : 'إعادة القراءة (من البداية)'}</span>
              </button>

              {/* Option 2: Return to memorization page */}
              <button
                onClick={handleExit}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs border transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                  color: pageTextColor
                }}
              >
                <ArrowRight size={16} className={isEn ? 'rotate-180' : ''} />
                <span>{isEn ? 'Back to Memorization' : 'العودة لصفحة التحفيظ'}</span>
              </button>

              {/* Optional Quick Test Button */}
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setShowQuizModal(true);
                }}
                className="w-full py-2 px-4 rounded-xl font-bold text-[11px] border-0 bg-transparent opacity-75 hover:opacity-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                style={{ color: primaryColor }}
              >
                <Brain size={14} />
                <span>{isEn ? 'Test Your Memorization Now' : 'اختبار وتثبيت الحفظ الآن'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Speech Verification & Evaluation Modal */}
      {showSpeechResultModal && speechVerificationResult && (
        <div 
          className="fixed inset-0 z-[1600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
          dir={isEn ? 'ltr' : 'rtl'}
          onClick={() => setShowSpeechResultModal(false)}
        >
          <div 
            className="w-full max-w-md max-h-[88dvh] overflow-y-auto rounded-[2rem] p-5 sm:p-6 shadow-2xl space-y-4 border text-right hide-scrollbar"
            style={{
              backgroundColor: theme.modalBg || (isDark ? '#18181B' : '#FFFFFF'),
              color: pageTextColor,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: speechVerificationResult.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: speechVerificationResult.passed ? '#10B981' : '#EF4444'
                  }}
                >
                  {speechVerificationResult.passed ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {isEn ? 'Recitation Evaluation' : 'نتيجة تقييم ومطابقة القراءة'}
                  </h3>
                  <div className="text-[11px] opacity-70">
                    {activeSurahName} - {isEn ? `Ayah ${speechVerificationResult.ayahNumber}` : `الآية ${speechVerificationResult.ayahNumber}`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSpeechResultModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center opacity-70 hover:opacity-100 border-0 bg-black/5 dark:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Score Ring / Status Banner */}
            <div 
              className="p-4 rounded-2xl flex items-center gap-3.5 border shadow-sm"
              style={{
                backgroundColor: speechVerificationResult.passed 
                  ? (isDark ? 'rgba(6, 78, 59, 0.25)' : 'rgba(236, 253, 245, 0.85)')
                  : (isDark ? 'rgba(127, 29, 29, 0.25)' : 'rgba(254, 242, 242, 0.85)'),
                borderColor: speechVerificationResult.passed ? '#10B981' : '#EF4444'
              }}
            >
              <div 
                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black shadow text-white"
                style={{ backgroundColor: speechVerificationResult.passed ? '#10B981' : '#EF4444' }}
              >
                <span className="text-lg leading-none font-black">{speechVerificationResult.score}%</span>
                <span className="text-[9px] opacity-90 mt-0.5">{isEn ? 'Match' : 'تطابق'}</span>
              </div>
              <div className="space-y-1">
                <div 
                  className="font-black text-sm"
                  style={{ color: speechVerificationResult.passed ? '#10B981' : '#EF4444' }}
                >
                  {speechVerificationResult.passed 
                    ? (isEn ? 'Excellent! Accurate Recitation 🎉' : 'ما شاء الله! قراءة صحيحة ومتقنة 🎉') 
                    : (isEn ? 'Needs Practice! Check words ⚠️' : 'بحاجة لتكرار وتدريب! ينقص بعض الألفاظ ⚠️')}
                </div>
                <div className="text-xs opacity-75 font-medium leading-relaxed">
                  {speechVerificationResult.passed 
                    ? (isEn ? 'Your pronunciation matched the Quranic verse text.' : 'تلاوتك مطابقة لألفاظ الآية الكريمة، استمر في ترسيخ الحفظ.')
                    : (isEn ? 'Review the highlighted words below and listen to the reciter.' : 'راجع الكلمات المحددة باللون الأحمر أدناه ثم اسمع الشيخ وأعد الترديد.')}
                </div>
              </div>
            </div>

            {/* Word-by-Word Analysis */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold opacity-75 flex items-center justify-between">
                <span>{isEn ? 'Target Verse (Words match):' : 'نص الآية الكريمة (فحص الكلمات):'}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {isEn ? 'Green = Correct • Red = Missed' : 'الأخضر = صحيح • الأحمر = يحتاج تثبيت'}
                </span>
              </div>
              <div 
                className="p-3.5 rounded-2xl border text-lg sm:text-xl font-serif leading-loose"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFDF5',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  fontFamily: "'Amiri', 'Amiri Quran', serif"
                }}
              >
                {speechVerificationResult.ayahWords.map((word, wIdx) => {
                  const isMatched = speechVerificationResult.matchedWords[wIdx];
                  return (
                    <span 
                      key={wIdx}
                      className={`inline-block mx-1 px-2 py-0.5 rounded-lg border text-sm sm:text-base font-bold ${
                        isMatched 
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30 underline decoration-rose-500'
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Spoken Text Transcribed */}
            <div className="space-y-1">
              <div className="text-xs font-bold opacity-75">
                {isEn ? 'What was captured from your voice:' : 'ما التقطه المايكروفون من قراءتك:'}
              </div>
              <div 
                className="p-3 rounded-xl border text-xs sm:text-sm font-medium leading-relaxed"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'
                }}
              >
                «{speechVerificationResult.spokenText}»
              </div>
            </div>

            {/* Dual Audio Listeners */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Listen to User Recording */}
              <button
                onClick={playSelfAudio}
                disabled={!selfAudioUrl}
                className="p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-40"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                  color: pageTextColor
                }}
              >
                <Volume2 size={15} />
                <span>{isPlayingSelf ? (isEn ? 'Playing...' : 'جارٍ السماع...') : (isEn ? 'Your Voice' : 'اسمع صوتك')}</span>
              </button>

              {/* Listen to Reciter */}
              <button
                onClick={() => playReciterComparison(speechVerificationResult.surahNumber, speechVerificationResult.ayahNumber)}
                className="p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}30`,
                  color: primaryColor
                }}
              >
                <Volume2 size={15} />
                <span>{isPlayingReciterComparison ? (isEn ? 'Playing...' : 'جارٍ السماع...') : (isEn ? 'Reciter' : 'اسمع الشيخ')}</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
              {/* Retry Recording Button */}
              <button
                onClick={handleRetryRecording}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                style={{ backgroundColor: primaryColor, color: btnTextColor }}
              >
                <Mic size={16} />
                <span>{isEn ? 'Recite & Test Again' : 'أعد الترديد والتسجيل الصوتي 🎤'}</span>
              </button>

              {/* Continue Session Button */}
              <button
                onClick={() => setShowSpeechResultModal(false)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs border transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  color: pageTextColor
                }}
              >
                <Play size={14} fill="currentColor" />
                <span>{isEn ? 'Continue Memorization' : 'متابعة جلسة الحفظ'}</span>
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
