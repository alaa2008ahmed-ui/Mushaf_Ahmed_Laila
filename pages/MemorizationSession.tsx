import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Eye,
  EyeOff,
  Brain,
  ChevronRight,
  ChevronLeft,
  BookMarked,
  Trophy,
  X,
  Infinity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAyahsInRange } from '../utils/quranMemorizationUtils';
import { SURAH_NAMES_AR, toArabic } from '../components/QuranReader/constants';
import { SURAH_NAMES_EN } from './Memorization';
import { registerBackInterceptor } from '../hooks/useBackButton';
import MemorizationQuizModal from '../components/Memorization/MemorizationQuizModal';
import MemorizationPreviewModal from '../components/Memorization/MemorizationPreviewModal';
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

  const isSkyTheme = !isBlackTheme && (homeThemeVariant === 'sky' || themeKey === 'sky_mode');
  const isEmeraldTheme = !isBlackTheme && (homeThemeVariant === 'emerald' || themeKey === 'emerald_mode');
  const isBurgundyTheme = !isBlackTheme && (homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode');

  const unifiedBarStyle: React.CSSProperties = isBlackTheme
    ? { backgroundColor: '#18181b', color: '#FFFFFF' }
    : isSkyTheme
      ? { background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#FFFFFF' }
      : isEmeraldTheme
        ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#FFFFFF' }
        : isBurgundyTheme
          ? { background: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)', color: '#FFFFFF' }
          : { backgroundColor: theme.topBarBg || '#FDE047', color: theme.topBarText || '#000000' };

  const barPrimaryBtnStyle: React.CSSProperties = isBlackTheme
    ? { backgroundColor: '#D97706', color: '#FFFFFF' }
    : isSkyTheme
      ? { backgroundColor: '#0369a1', color: '#FFFFFF' }
      : isEmeraldTheme
        ? { backgroundColor: '#047857', color: '#FFFFFF' }
        : isBurgundyTheme
          ? { backgroundColor: '#881337', color: '#FFFFFF' }
          : { backgroundColor: primaryColor, color: btnTextColor };

  const barSecondaryBtnStyle: React.CSSProperties = isBlackTheme
    ? { backgroundColor: '#27272a', color: '#FFFFFF' }
    : isSkyTheme
      ? { backgroundColor: '#FFFFFF', color: '#0284c7' }
      : isEmeraldTheme
        ? { backgroundColor: '#FFFFFF', color: '#059669' }
        : isBurgundyTheme
          ? { backgroundColor: '#FFFFFF', color: '#9f1239' }
          : { backgroundColor: '#FFFFFF', color: '#0F172A' };

  // Session settings from params or default
  const settings = params?.memorizationSettings || params || {};
  const fromSurah = settings.fromSurah || 1;
  const fromAyah = settings.fromAyah || 1;
  const toSurah = settings.toSurah || 1;
  const toAyah = settings.toAyah || 7;
  const selectedReader = settings.reader || 'Abdul_Basit_Murattal_192kbps';
  const ayahRepeatTarget = settings.ayahRepeat || 3;
  const rangeRepeatTarget = settings.rangeRepeat || 1;
  const rawPauseLength = settings.pauseLength ?? 2;
  const isAutoPause = rawPauseLength === 'auto';
  const pauseSeconds = isAutoPause
    ? 0
    : (Number.isFinite(Number(rawPauseLength)) ? Math.max(0, Number(rawPauseLength)) : 2);
  const isPauseEnabled = isAutoPause || pauseSeconds > 0;
  const linkedRepeat = Boolean(settings.linkedRepeat);
  const isCumulative = Boolean(settings.isCumulative); // Full-range cumulative loop
  const isShanqiti3x3 = Boolean(settings.isShanqiti3x3); // Shanqiti 3x3 chunked cumulative loop
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
  const [pauseStartIndex, setPauseStartIndex] = useState<number | null>(null);

  // Masking level: 0=visible, 1=hide endings, 2=hide half, 3=hide all
  const [maskLevel, setMaskLevel] = useState<MaskLevel>(0);
  const [showMaskMenu, setShowMaskMenu] = useState(false);
  const [peekedWordIndex, setPeekedWordIndex] = useState<{ ayahIdx: number; wordIdx: number } | null>(null);

  // Available playback speeds: numbers only [0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x]
  const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const maskBtnRef = useRef<HTMLButtonElement | null>(null);
  const [maskMenuTop, setMaskMenuTop] = useState<number>(64);
  const speedBtnRef = useRef<HTMLButtonElement | null>(null);
  const [speedMenuBottom, setSpeedMenuBottom] = useState<number>(76);

  // Word-by-word tracking during recitation
  const [isWordTrackingEnabled, setIsWordTrackingEnabled] = useState(true);
  const [audioProgress, setAudioProgress] = useState<{ currentTime: number; duration: number } | null>(null);

  // Modals
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showTafseerModal, setShowTafseerModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Audio elements & preloading caches for gapless ayah transitions
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedAudioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedAudioRef = useRef<Record<string, HTMLAudioElement>>({});
  const blobUrlCacheRef = useRef<Record<string, string>>({});
  const preloadInFlightRef = useRef<Record<string, Promise<void>>>({});
  const isUnmountedRef = useRef<boolean>(false);
  const pauseTimerRef = useRef<any>(null);
  const peekTimerRef = useRef<any>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const ayahDurationsRef = useRef<Record<number, number>>({});
  const playbackSpeedRef = useRef<number>(1.0);

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

  // Auto-scroll to active ayah (or jump back to first ayah of linked/cumulative passage on recitation pause)
  useEffect(() => {
    const targetIdx = (isPauseActive && pauseStartIndex !== null) ? pauseStartIndex : currentIndex;
    const el = document.getElementById(`session-ayah-${targetIdx}`);
    if (!el) return;

    if (mainRef.current) {
      const container = mainRef.current;
      if (targetIdx === 0) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (isPauseActive && pauseStartIndex !== null) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetTop = container.scrollTop + (elRect.top - containerRect.top) - 68;
        container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      } else {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const centeredTop = container.scrollTop + (elRect.top - containerRect.top) - (container.clientHeight / 2) + (elRect.height / 2);
        container.scrollTo({ top: Math.max(0, centeredTop), behavior: 'smooth' });
      }
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, isPauseActive, pauseStartIndex]);

  const handleExit = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onplay = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onloadedmetadata = null;
        audioRef.current.onplay = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (unlockedAudioRef.current) {
        unlockedAudioRef.current.pause();
        unlockedAudioRef.current.src = '';
      }
      Object.values(preloadedAudioRef.current).forEach((el) => {
        try {
          el.onended = null;
          el.ontimeupdate = null;
          el.onloadedmetadata = null;
          el.onplay = null;
          el.onerror = null;
          el.pause();
          el.src = '';
        } catch (e) {}
      });
      preloadedAudioRef.current = {};
      Object.values(blobUrlCacheRef.current).forEach((blobUrl) => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (e) {}
      });
      blobUrlCacheRef.current = {};
      preloadInFlightRef.current = {};
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

  // Preload an ayah into memory (Blob URL + buffered HTMLAudioElement) for instant, gapless transitions
  const preloadAyahAtIndex = useCallback((idx: number) => {
    if (isUnmountedRef.current || idx < 0 || idx >= ayahs.length) return;
    const ayah = ayahs[idx];
    const remoteUrl = getAyahAudioUrl(ayah.surahNumber, ayah.ayahNumber);

    if (preloadedAudioRef.current[remoteUrl] || preloadInFlightRef.current[remoteUrl]) {
      return;
    }

    preloadInFlightRef.current[remoteUrl] = (async () => {
      try {
        let resolvedUrl = blobUrlCacheRef.current[remoteUrl];

        if (!resolvedUrl) {
          // 1. Check offline Cache API if user downloaded audio
          if ('caches' in window) {
            try {
              const cache = await caches.open('quran-audio-cache');
              const cachedRes = await cache.match(remoteUrl);
              if (cachedRes) {
                const blob = await cachedRes.blob();
                if (!isUnmountedRef.current && blob.size > 0) {
                  resolvedUrl = URL.createObjectURL(blob);
                  blobUrlCacheRef.current[remoteUrl] = resolvedUrl;
                }
              }
            } catch (e) {}
          }
        }

        // 2. Fetch into in-memory Blob URL to eliminate network/revalidation latency between ayahs
        if (!resolvedUrl) {
          try {
            const res = await fetch(remoteUrl, { mode: 'cors' });
            if (res.ok) {
              const blob = await res.blob();
              if (!isUnmountedRef.current && blob.size > 0) {
                resolvedUrl = URL.createObjectURL(blob);
                blobUrlCacheRef.current[remoteUrl] = resolvedUrl;
              }
            }
          } catch (e) {}
        }

        if (isUnmountedRef.current) return;

        const finalSrc = resolvedUrl || remoteUrl;
        if (!preloadedAudioRef.current[remoteUrl]) {
          const el = new Audio();
          el.preload = 'auto';
          el.src = finalSrc;
          el.onloadedmetadata = () => {
            if (Number.isFinite(el.duration) && el.duration > 0) {
              ayahDurationsRef.current[idx] = el.duration;
            }
          };
          el.load();
          preloadedAudioRef.current[remoteUrl] = el;
        }
      } finally {
        delete preloadInFlightRef.current[remoteUrl];
      }
    })();
  }, [ayahs, getAyahAudioUrl]);

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

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  // Definition of a playback step in the memorization session
  interface PlaybackStep {
    ayahIndex: number;
    stepRepeatIndex: number; // 1-based index within the repetition of this step
    stepRepeatTotal: number; // Total repeats for this step
    descriptionAr: string;
    descriptionEn: string;
    modeBadge?: string;
    pauseAfter: boolean; // Only pause after single verses or at the end of a linked segment
    segmentAyahIndices: number[]; // Verse indices recited together in this step/segment
  }

  // Generate sequence of steps based on chosen mode:
  // 1. Shanqiti (Cumulative 3x3):
  //    - Ayah 1 x N
  //    - Ayah 2 x N, then Link (Ayah 1..2) x N
  //    - Ayah 3 x N, then Link (Ayah 1..3) x N
  //    - ...
  //    - Ayah i x N, then Link (Ayah 1..i) x N (always starting from startAyah)
  //    - End of session: Full consolidation (Ayah 1..end)
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
      // Shanquiti Cumulative method (always anchored to the first ayah of the selected range)
      const startA = ayahs[0].ayahNumber;

      for (let i = 0; i < total; i++) {
        const ayahNum = ayahs[i].ayahNumber;

        // Step 1: Repeat current verse N times (1x pauseDuration after each repeat)
        for (let r = 1; r <= N; r++) {
          steps.push({
            ayahIndex: i,
            stepRepeatIndex: r,
            stepRepeatTotal: N,
            descriptionAr: `تكرار الآية ${ayahNum} (${r}/${N})`,
            descriptionEn: `Verse ${ayahNum} repeat (${r}/${N})`,
            modeBadge: 'الشنقيطي: حفظ الآية',
            pauseAfter: true,
            segmentAyahIndices: [i]
          });
        }

        // Step 2: Cumulative link always from startAyah (index 0) up to current verse (index i)
        if (i > 0) {
          const linkedIndices = Array.from({ length: i + 1 }, (_, idx) => idx);
          for (let r = 1; r <= N; r++) {
            for (let k = 0; k <= i; k++) {
              steps.push({
                ayahIndex: k,
                stepRepeatIndex: r,
                stepRepeatTotal: N,
                descriptionAr: `ربط تراكمي (${startA} - ${ayahNum}) [${r}/${N}]`,
                descriptionEn: `Cumulative Link (${startA} - ${ayahNum}) [${r}/${N}]`,
                modeBadge: 'الشنقيطي: ربط تراكمي',
                pauseAfter: k === i,
                segmentAyahIndices: linkedIndices
              });
            }
          }
        }
      }

      // End of session: Full consolidation of the entire selected range [startAyah ... endAyah]
      if (total > 1) {
        const consolidationIndices = Array.from({ length: total }, (_, idx) => idx);
        const endA = ayahs[total - 1].ayahNumber;
        const consolidationRepeats = Math.min(2, N);
        for (let r = 1; r <= consolidationRepeats; r++) {
          for (let k = 0; k < total; k++) {
            steps.push({
              ayahIndex: k,
              stepRepeatIndex: r,
              stepRepeatTotal: consolidationRepeats,
              descriptionAr: `تثبيت شامل (${startA} - ${endA}) [${r}/${consolidationRepeats}]`,
              descriptionEn: `Full consolidation (${startA} - ${endA}) [${r}/${consolidationRepeats}]`,
              modeBadge: 'الشنقيطي: تثبيت شامل',
              pauseAfter: k === total - 1,
              segmentAyahIndices: consolidationIndices
            });
          }
        }
      }
    } else if (isShanqiti3x3) {
      // Shanqiti Cumulative (3x3):
      // 1. Split range into consecutive groups of 3 ayahs (last group holds remaining 1 or 2 ayahs)
      // 2. Cumulative link starts from the first ayah of the current group only
      // 3. Full consolidation of the entire selected range at the end
      const startA = ayahs[0].ayahNumber;

      for (let chunkStart = 0; chunkStart < total; chunkStart += 3) {
        const chunkEnd = Math.min(chunkStart + 3, total) - 1;
        const chunkFirstAyahNum = ayahs[chunkStart].ayahNumber;

        for (let i = chunkStart; i <= chunkEnd; i++) {
          const ayahNum = ayahs[i].ayahNumber;

          // Step 1: Repeat current verse N times (1x pauseDuration after each repeat)
          for (let r = 1; r <= N; r++) {
            steps.push({
              ayahIndex: i,
              stepRepeatIndex: r,
              stepRepeatTotal: N,
              descriptionAr: `تكرار الآية ${ayahNum} (${r}/${N})`,
              descriptionEn: `Verse ${ayahNum} repeat (${r}/${N})`,
              modeBadge: 'الشنقيطي (3×3): حفظ الآية',
              pauseAfter: true,
              segmentAyahIndices: [i]
            });
          }

          // Step 2: Cumulative link within current group starting from chunkStart up to current verse i
          if (i > chunkStart) {
            const linkedIndices = Array.from({ length: i - chunkStart + 1 }, (_, idx) => chunkStart + idx);
            for (let r = 1; r <= N; r++) {
              for (let k = chunkStart; k <= i; k++) {
                steps.push({
                  ayahIndex: k,
                  stepRepeatIndex: r,
                  stepRepeatTotal: N,
                  descriptionAr: `ربط المجموعة (${chunkFirstAyahNum} - ${ayahNum}) [${r}/${N}]`,
                  descriptionEn: `Group Link (${chunkFirstAyahNum} - ${ayahNum}) [${r}/${N}]`,
                  modeBadge: 'الشنقيطي (3×3): ربط تراكمي',
                  pauseAfter: k === i,
                  segmentAyahIndices: linkedIndices
                });
              }
            }
          }
        }
      }

      // Step 3: End of session full consolidation of the entire selected range [startAyah ... endAyah]
      if (total > 1) {
        const consolidationIndices = Array.from({ length: total }, (_, idx) => idx);
        const endA = ayahs[total - 1].ayahNumber;
        const consolidationRepeats = Math.min(2, N);
        for (let r = 1; r <= consolidationRepeats; r++) {
          for (let k = 0; k < total; k++) {
            steps.push({
              ayahIndex: k,
              stepRepeatIndex: r,
              stepRepeatTotal: consolidationRepeats,
              descriptionAr: `تثبيت شامل (${startA} - ${endA}) [${r}/${consolidationRepeats}]`,
              descriptionEn: `Full consolidation (${startA} - ${endA}) [${r}/${consolidationRepeats}]`,
              modeBadge: 'الشنقيطي (3×3): تثبيت شامل',
              pauseAfter: k === total - 1,
              segmentAyahIndices: consolidationIndices
            });
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
            modeBadge: 'تكرار الآية',
            pauseAfter: true,
            segmentAyahIndices: [i]
          });
        }

        // If there is a previous verse, immediately recite (Previous + Current) once to cement the sequence link
        if (i > 0) {
          const prevAyahNum = ayahs[i - 1].ayahNumber;
          const pairIndices = [i - 1, i];
          // Play previous verse (no pause after; continue straight into current verse)
          steps.push({
            ayahIndex: i - 1,
            stepRepeatIndex: 1,
            stepRepeatTotal: 1,
            descriptionAr: `ربط بالسابقة: آية ${prevAyahNum} ثم ${ayahNum}`,
            descriptionEn: `Link: Verse ${prevAyahNum} then ${ayahNum}`,
            modeBadge: 'الربط بالسابقة',
            pauseAfter: false,
            segmentAyahIndices: pairIndices
          });
          // Play current verse (pause once after both linked verses finish)
          steps.push({
            ayahIndex: i,
            stepRepeatIndex: 1,
            stepRepeatTotal: 1,
            descriptionAr: `ربط بالسابقة: إتمام الآية ${ayahNum}`,
            descriptionEn: `Link: Complete Verse ${ayahNum}`,
            modeBadge: 'الربط بالسابقة',
            pauseAfter: true,
            segmentAyahIndices: pairIndices
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
            modeBadge: 'تكرار الآية',
            pauseAfter: true,
            segmentAyahIndices: [i]
          });
        }
      }
    }

    return steps;
  }, [ayahs, ayahRepeatTarget, linkedRepeat, isCumulative, isShanqiti3x3]);

  // Current step index in the playback sequence
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStepIndexRef = useRef(0);
  const playbackStepsRef = useRef<PlaybackStep[]>(playbackSteps);
  playbackStepsRef.current = playbackSteps;

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
      // ENTIRE SESSION FINISHED: Stop audio completely, return to first ayah, and show completion modal!
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
      setIsPlaying(false);
      setIsPauseActive(false);
      setPauseStartIndex(null);
      currentStepIndexRef.current = 0;
      setCurrentStepIndex(0);
      currentIndexRef.current = 0;
      setCurrentIndex(0);
      currentAyahRepeatRef.current = steps[0]?.stepRepeatIndex || 1;
      setCurrentAyahRepeat(steps[0]?.stepRepeatIndex || 1);
      currentRangeRepeatRef.current = 1;
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

  // Preload upcoming ayahs whenever the session starts or step advances
  useEffect(() => {
    if (ayahs.length === 0) return;
    // Keep up to 12 upcoming distinct ayahs from current position & start of range buffered
    const preloadCount = Math.min(ayahs.length, 12);
    for (let j = 0; j < preloadCount; j++) {
      preloadAyahAtIndex(j);
    }
    const steps = playbackStepsRef.current;
    const seen = new Set<number>();
    for (let sIdx = currentStepIndex; sIdx < steps.length && seen.size < 8; sIdx++) {
      const aIdx = steps[sIdx].ayahIndex;
      if (!seen.has(aIdx)) {
        seen.add(aIdx);
        preloadAyahAtIndex(aIdx);
      }
    }
  }, [ayahs, currentStepIndex, preloadAyahAtIndex]);

  // Core Playback Logic: plays the ayah at a specific index
  const playAyahAtIndex = useCallback((index: number) => {
    if (index < 0 || index >= ayahs.length) return;
    if (pauseTimerRef.current) {
      clearInterval(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    setIsPauseActive(false);
    setPauseStartIndex(null);

    currentIndexRef.current = index;
    setCurrentIndex(index);
    const ayah = ayahs[index];
    const remoteUrl = getAyahAudioUrl(ayah.surahNumber, ayah.ayahNumber);
    const resolvedUrl = blobUrlCacheRef.current[remoteUrl] || remoteUrl;

    // Trigger preloading for current and upcoming ayahs
    preloadAyahAtIndex(index);
    preloadAyahAtIndex(index + 1);
    const nextStep = playbackStepsRef.current[currentStepIndexRef.current + 1];
    if (nextStep) {
      preloadAyahAtIndex(nextStep.ayahIndex);
    }

    if (!unlockedAudioRef.current) {
      unlockedAudioRef.current = new Audio();
    }

    const preloaded = preloadedAudioRef.current[remoteUrl];
    const canUsePreloaded = Boolean(preloaded && !preloaded.error && preloaded.readyState >= 2);
    const audio = canUsePreloaded ? preloaded! : unlockedAudioRef.current;

    // Detach handlers and pause previous audio if switching elements
    const prevAudio = audioRef.current;
    if (prevAudio && prevAudio !== audio) {
      prevAudio.onloadedmetadata = null;
      prevAudio.onplay = null;
      prevAudio.ontimeupdate = null;
      prevAudio.onended = null;
      prevAudio.onerror = null;
      if (!prevAudio.paused) {
        prevAudio.pause();
      }
    }
    audioRef.current = audio;

    if (audio === unlockedAudioRef.current) {
      if (audio.src !== resolvedUrl) {
        audio.src = resolvedUrl;
      } else {
        audio.currentTime = 0;
      }
    } else {
      audio.currentTime = 0;
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        ayahDurationsRef.current[index] = audio.duration;
      }
    }

    const attachHandlersAndPlay = (targetAudio: HTMLAudioElement, allowFallback: boolean) => {
      targetAudio.defaultPlaybackRate = playbackSpeedRef.current;
      targetAudio.playbackRate = playbackSpeedRef.current;
      targetAudio.onloadedmetadata = () => {
        if (Number.isFinite(targetAudio.duration) && targetAudio.duration > 0) {
          ayahDurationsRef.current[index] = targetAudio.duration;
        }
      };
      targetAudio.onplay = () => {
        if (audioRef.current === targetAudio) {
          targetAudio.playbackRate = playbackSpeedRef.current;
        }
      };

      targetAudio.ontimeupdate = () => {
        if (audioRef.current !== targetAudio) return;
        if (targetAudio.duration && targetAudio.duration > 0) {
          ayahDurationsRef.current[index] = targetAudio.duration;
          setAudioProgress({ currentTime: targetAudio.currentTime, duration: targetAudio.duration });
        }
      };

      targetAudio.onended = () => {
        if (audioRef.current !== targetAudio) return;
        if (Number.isFinite(targetAudio.duration) && targetAudio.duration > 0) {
          ayahDurationsRef.current[index] = targetAudio.duration;
        }
        setAudioProgress(null);

        // Determine whether this step ends a single verse or the final verse of a linked segment
        const activeStep = playbackStepsRef.current[currentStepIndexRef.current];
        const shouldPause = isPauseEnabled && (activeStep ? activeStep.pauseAfter : true);

        if (shouldPause) {
          const segmentIndices = activeStep?.segmentAyahIndices?.length
            ? activeStep.segmentAyahIndices
            : [index];

          let computedPauseSeconds = 0;
          if (isAutoPause) {
            const speed = Math.max(0.25, playbackSpeedRef.current || 1.0);
            const totalRawDuration = segmentIndices.reduce((sum, aIdx) => {
              const knownDur = ayahDurationsRef.current[aIdx];
              if (Number.isFinite(knownDur) && knownDur > 0) {
                return sum + knownDur;
              }
              const wordCount = stripTajweed(ayahs[aIdx]?.text || '').split(' ').filter(Boolean).length;
              return sum + Math.max(2, wordCount * 0.65);
            }, 0);
            computedPauseSeconds = Math.max(1, Math.round(totalRawDuration / speed));
          } else {
            computedPauseSeconds = segmentIndices.length * pauseSeconds;
          }

          if (computedPauseSeconds > 0) {
            setPauseStartIndex(segmentIndices.length > 1 ? segmentIndices[0] : null);
            setIsPauseActive(true);
            setPauseCountdown(computedPauseSeconds);

            let remaining = computedPauseSeconds;
            if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);

            pauseTimerRef.current = setInterval(() => {
              remaining -= 1;
              setPauseCountdown(remaining);
              if (remaining <= 0) {
                clearInterval(pauseTimerRef.current);
                pauseTimerRef.current = null;
                setIsPauseActive(false);
                setPauseStartIndex(null);
                if (handleAdvanceAfterAudioRef.current) {
                  handleAdvanceAfterAudioRef.current();
                }
              }
            }, 1000);
          } else if (handleAdvanceAfterAudioRef.current) {
            handleAdvanceAfterAudioRef.current();
          }
        } else {
          if (handleAdvanceAfterAudioRef.current) {
            handleAdvanceAfterAudioRef.current();
          }
        }
      };

      targetAudio.onerror = (e) => {
        if (audioRef.current !== targetAudio) return;
        console.warn('Audio playback error', e);
        setIsPlaying(false);
        setAudioProgress(null);
        releaseListenInterruption('mem-session-audio');
      };

      acquireListenInterruption('mem-session-audio');
      targetAudio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          if (err?.name === 'AbortError') return;
          if (allowFallback && err?.name === 'NotAllowedError' && unlockedAudioRef.current && targetAudio !== unlockedAudioRef.current) {
            targetAudio.onloadedmetadata = null;
            targetAudio.onplay = null;
            targetAudio.ontimeupdate = null;
            targetAudio.onended = null;
            targetAudio.onerror = null;
            const fallbackAudio = unlockedAudioRef.current;
            audioRef.current = fallbackAudio;
            if (fallbackAudio.src !== resolvedUrl) {
              fallbackAudio.src = resolvedUrl;
            } else {
              fallbackAudio.currentTime = 0;
            }
            attachHandlersAndPlay(fallbackAudio, false);
            return;
          }
          console.warn('Autoplay prevented or failed', err);
          setIsPlaying(false);
          releaseListenInterruption('mem-session-audio');
        });
    };

    attachHandlersAndPlay(audio, true);
  }, [ayahs, getAyahAudioUrl, isAutoPause, isPauseEnabled, pauseSeconds, preloadAyahAtIndex]);

  // Manual ayah selection (works seamlessly whether currently playing or paused)
  const handleSelectAyah = useCallback((index: number, forcePlay = false) => {
    if (index < 0 || index >= ayahs.length) return;
    if (pauseTimerRef.current) {
      clearInterval(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    setIsPauseActive(false);
    setPauseStartIndex(null);
    setAudioProgress(null);

    const steps = playbackStepsRef.current;
    const targetStepIdx = steps.findIndex(s => s.ayahIndex === index);
    if (targetStepIdx !== -1) {
      currentStepIndexRef.current = targetStepIdx;
      setCurrentStepIndex(targetStepIdx);
      const step = steps[targetStepIdx];
      currentAyahRepeatRef.current = step.stepRepeatIndex;
      setCurrentAyahRepeat(step.stepRepeatIndex);
    } else {
      currentStepIndexRef.current = 0;
      setCurrentStepIndex(0);
      currentAyahRepeatRef.current = 1;
      setCurrentAyahRepeat(1);
    }

    currentIndexRef.current = index;
    setCurrentIndex(index);

    if (isPlaying || forcePlay) {
      playAyahAtIndex(index);
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [ayahs.length, isPlaying, playAyahAtIndex]);

  const togglePlayPause = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (pauseTimerRef.current) {
        clearInterval(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      setIsPlaying(false);
      setIsPauseActive(false);
      setPauseStartIndex(null);
      setAudioProgress(null);
      releaseListenInterruption('mem-session-audio');
    } else {
      if (pauseTimerRef.current) {
        clearInterval(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      setIsPauseActive(false);
      setPauseStartIndex(null);

      const steps = playbackStepsRef.current;
      const targetAyahIdx = currentIndexRef.current;
      const cStep = steps[currentStepIndexRef.current];
      if (!cStep || cStep.ayahIndex !== targetAyahIdx) {
        const syncedStepIdx = steps.findIndex(s => s.ayahIndex === targetAyahIdx);
        if (syncedStepIdx !== -1) {
          currentStepIndexRef.current = syncedStepIdx;
          setCurrentStepIndex(syncedStepIdx);
          const syncedStep = steps[syncedStepIdx];
          currentAyahRepeatRef.current = syncedStep.stepRepeatIndex;
          setCurrentAyahRepeat(syncedStep.stepRepeatIndex);
        }
      }
      playAyahAtIndex(targetAyahIdx);
    }
  };

  const handleNextAyah = () => {
    const currentA = currentIndexRef.current;
    if (currentA < ayahs.length - 1) {
      handleSelectAyah(currentA + 1, isPlaying);
    }
  };

  const handlePrevAyah = () => {
    const currentA = currentIndexRef.current;
    if (currentA > 0) {
      handleSelectAyah(currentA - 1, isPlaying);
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

  const visualActiveIndex = (isPauseActive && pauseStartIndex !== null) ? pauseStartIndex : currentIndex;
  const activeAyah = ayahs[visualActiveIndex] || ayahs[0];
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
      {/* Floating 3D Top Bar matching Bottom Bar & active theme top-bar colors */}
      <header
        className="share-studio-header shrink-0 px-3 pb-1.5 sm:px-4 sm:pb-1.5 z-20 overflow-visible"
        dir={isEn ? 'ltr' : 'rtl'}
        style={{
          backgroundColor: pageBg,
          paddingTop: 'calc(var(--app-safe-top, 0px) + 8px)'
        }}
      >
        <div
          className="app-page-card hover:!transform-none border-0 max-w-xl mx-auto rounded-[22px] px-3 py-2 overflow-visible"
          style={unifiedBarStyle}
        >
          <div className="flex items-center justify-between w-full min-h-[42px] gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <button
                onClick={handleExit}
                className="app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                style={barPrimaryBtnStyle}
                title={isEn ? 'Exit Studio' : 'الخروج والعودة للتحفيظ'}
                aria-label={isEn ? 'Exit Studio' : 'الخروج والعودة للتحفيظ'}
              >
                <ArrowRight size={18} className={isEn ? 'rotate-180' : ''} />
              </button>
              <div className="min-w-0 flex-1 flex flex-col items-center justify-center gap-1 py-0.5 overflow-hidden text-center">
                <span
                  className="font-bold text-sm sm:text-base tracking-wide truncate font-cairo max-w-full text-center leading-tight"
                  style={{ fontFamily: "'Cairo', sans-serif", color: unifiedBarStyle.color }}
                >
                  {activeSurahName
                    ? (isEn
                        ? (activeSurahName.startsWith('Surah ') ? activeSurahName : `Surah ${activeSurahName}`)
                        : (activeSurahName.startsWith('سورة ') ? activeSurahName : `سورة ${activeSurahName}`))
                    : ''}
                </span>
                <div className="flex items-center justify-center flex-wrap gap-1 min-w-0 max-w-full pb-0.5">
                  <span
                    className="app-3d-badge border-0 text-[9.5px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                    style={barPrimaryBtnStyle}
                  >
                    {isEn ? `Ayah ${activeAyah?.ayahNumber}` : `الآية ${activeAyah?.ayahNumber}`}
                  </span>
                  <span
                    className="app-3d-badge border-0 text-[9.5px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                    style={barPrimaryBtnStyle}
                  >
                    {isEn ? `Page ${activeAyah?.page}` : `صفحة ${activeAyah?.page}`}
                  </span>
                  <span
                    className="app-3d-badge border-0 text-[9.5px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                    style={barPrimaryBtnStyle}
                  >
                    {isEn ? `Juz ${activeAyah?.juz}` : `الجزء ${activeAyah?.juz}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Tools: Mask Mode, Tafseer, Quiz */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                ref={maskBtnRef}
                type="button"
                onClick={() => {
                  setShowSpeedMenu(false);
                  if (!showMaskMenu && maskBtnRef.current) {
                    const rect = maskBtnRef.current.getBoundingClientRect();
                    setMaskMenuTop(Math.round(rect.bottom + 8));
                  }
                  setShowMaskMenu(prev => !prev);
                }}
                className="app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                style={barPrimaryBtnStyle}
                title={isEn ? 'Display / Mask Mode' : 'وضع الإظهار والإخفاء'}
                aria-label={isEn ? 'Display / Mask Mode' : 'وضع الإظهار والإخفاء'}
                aria-expanded={showMaskMenu}
              >
                {maskLevel === 0 ? <Eye size={17} /> : <EyeOff size={17} />}
              </button>

              <button
                onClick={() => setShowTafseerModal(true)}
                className="app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                style={barPrimaryBtnStyle}
                title={isEn ? 'Quick Tafseer' : 'التفسير الميسر للآيات'}
                aria-label={isEn ? 'Quick Tafseer' : 'التفسير الميسر للآيات'}
              >
                <BookMarked size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Recitation Pause Indicator - Floating 3D Banner */}
      {isPauseActive && pauseCountdown > 0 && (
        <div 
          className={`app-page-card border-0 fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none w-fit max-w-[90vw] px-3 py-1.5 rounded-xl flex items-center justify-center gap-2 animate-bounce ${s3d.surfaceCardClass}`}
          style={{
            color: s3d.noticeAccent,
            top: 'calc(var(--app-safe-top, 0px) + 76px)'
          }}
        >
          <div 
            className="app-3d-badge border-0 w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }}
          >
            <Volume2 size={13} />
          </div>
          <span className="text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap">
            {isEn
              ? `Your turn to recite! (${pauseCountdown})`
              : `حان دورك للترديد بصوتك! (${toArabic(pauseCountdown)})`}
          </span>
        </div>
      )}

      {/* Main Quran Verse Canvas */}
      <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-4 space-y-4 max-w-xl mx-auto w-full hide-scrollbar">
        {ayahs.map((ayah, aIdx) => {
          const isActive = aIdx === visualActiveIndex;
          const cleanText = stripTajweed(ayah.text);
          const words = cleanText.split(' ').filter(Boolean);

          return (
            <div
              key={`${ayah.surahNumber}:${ayah.ayahNumber}`}
              id={`session-ayah-${aIdx}`}
              data-card-item="true"
              onClick={() => handleSelectAyah(aIdx)}
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
              <div className="flex items-start justify-between gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                  <span className="font-bold opacity-75 leading-snug">
                    {isEn ? SURAH_NAMES_EN[ayah.surahNumber - 1] : SURAH_NAMES_AR[ayah.surahNumber - 1]} - {isEn ? `Ayah ${ayah.ayahNumber}` : `الآية ${ayah.ayahNumber}`}
                  </span>
                  {isActive && currentStep?.modeBadge && (
                    <span 
                      className="app-3d-badge border-0 text-[10px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap"
                      style={{ backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }}
                    >
                      {currentStep.modeBadge}
                    </span>
                  )}
                </div>
                {isActive && (
                  <span 
                    className="app-3d-badge border-0 font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0"
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

              {/* Words with Masking Logic — Naskh Script */}
              <div 
                className="memorization-quran-text text-[22px] sm:text-[26px] leading-[2.5] text-right font-serif select-none font-bold" 
                style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif", fontWeight: 700 }}
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
                  className="ayah-end-badge app-3d-badge border-0 inline-flex items-center justify-center w-7 h-7 mx-1.5 rounded-full text-xs font-bold align-middle"
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

      {/* Floating 3D Bottom Control Dock matching Top Bar & active theme top-bar colors */}
      <footer 
        className="shrink-0 px-3 pt-1.5 sm:px-4 sm:pt-1.5 modal-sheet-safe-bottom z-20 overflow-visible"
        style={{ backgroundColor: pageBg }}
      >
        <div
          className="app-page-card hover:!transform-none border-0 max-w-xl mx-auto rounded-[22px] px-3.5 py-2.5 overflow-visible"
          style={unifiedBarStyle}
        >
          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-2.5 overflow-visible">
            {/* Word-by-Word Recitation Tracking Toggle */}
            <button
              type="button"
              onClick={() => setIsWordTrackingEnabled(!isWordTrackingEnabled)}
              className="app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer text-[11px] font-black"
              style={isWordTrackingEnabled ? barPrimaryBtnStyle : barSecondaryBtnStyle}
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
              className="app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-35 transition-all cursor-pointer"
              style={barSecondaryBtnStyle}
              title={isEn ? 'Previous Ayah' : 'الآية السابقة'}
            >
              <ChevronRight size={17} className={isEn ? 'rotate-180' : ''} />
            </button>

            {/* Play / Pause Primary 3D Button */}
            <button
              onClick={togglePlayPause}
              className="app-page-card border-0 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={barPrimaryBtnStyle}
              title={isPlaying ? (isEn ? 'Pause' : 'إيقاف مؤقت') : (isEn ? 'Play' : 'تشغيل')}
            >
              {isPlaying ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Next Ayah */}
            <button
              onClick={handleNextAyah}
              disabled={currentIndex >= ayahs.length - 1}
              className="app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-35 transition-all cursor-pointer"
              style={barSecondaryBtnStyle}
              title={isEn ? 'Next Ayah' : 'الآية التالية'}
            >
              <ChevronLeft size={17} className={isEn ? 'rotate-180' : ''} />
            </button>

            {/* Speed Button with 3D Popover */}
            <div className="relative overflow-visible">
              <button
                ref={speedBtnRef}
                type="button"
                onClick={() => {
                  setShowMaskMenu(false);
                  if (!showSpeedMenu && speedBtnRef.current) {
                    const rect = speedBtnRef.current.getBoundingClientRect();
                    setSpeedMenuBottom(Math.round(window.innerHeight - rect.top + 8));
                  }
                  setShowSpeedMenu(prev => !prev);
                }}
                className="app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer text-[10px] font-black"
                style={barPrimaryBtnStyle}
                title={isEn ? 'Playback Speed' : 'سرعة الصوت'}
                aria-expanded={showSpeedMenu}
              >
                <span>{playbackSpeed}x</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Speed Selection Popover Menu (Outside <footer> & .app-page-card to eliminate transform flicker and block background clicks) */}
      {showSpeedMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/35 touch-none"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setShowSpeedMenu(false);
            }}
          />
          <div
            className="fixed inset-x-0 z-50 pointer-events-none px-3 sm:px-4"
            style={{ bottom: `${speedMenuBottom}px` }}
          >
            <div className="max-w-xl mx-auto relative">
              <div
                className={`app-page-card hover:!transform-none border-0 pointer-events-auto absolute bottom-0 ${isEn ? 'right-0' : 'left-0'} w-36 rounded-2xl p-2.5 space-y-1.5 ${s3d.surfaceCardClass}`}
                dir={isEn ? 'ltr' : 'rtl'}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`px-2 py-1 text-xs font-black opacity-75 flex items-center justify-between border-b pb-1 ${s3d.dividerClass}`}>
                  <span>{playbackSpeed}x</span>
                  <button
                    type="button"
                    onClick={() => setShowSpeedMenu(false)}
                    className={`app-inner-3d-box unified-3d-btn border-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${s3d.isBlackTheme ? 'bg-zinc-800' : 'bg-slate-100 dark:bg-white/10'}`}
                    aria-label={isEn ? 'Close' : 'إغلاق'}
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="space-y-1.5 pt-0.5 pb-1 px-0.5 max-h-56 overflow-y-auto hide-scrollbar">
                  {SPEED_OPTIONS.map(speedVal => {
                    const isSelected = playbackSpeed === speedVal;
                    return (
                      <button
                        key={speedVal}
                        type="button"
                        onClick={() => handleSelectSpeed(speedVal)}
                        className={`app-page-card hover:!transform-none border-0 w-full py-1.5 px-3 rounded-xl font-bold text-xs text-center transition-all cursor-pointer ${
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
            </div>
          </div>
        </>
      )}

      {/* Mask Mode Selection Dropdown Menu (Outside <header> for clean theme styling) */}
      {showMaskMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent touch-none"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setShowMaskMenu(false);
            }}
          />
          <div
            className="fixed inset-x-0 z-50 pointer-events-none px-3 sm:px-4"
            style={{ top: `${maskMenuTop}px` }}
          >
            <div className="max-w-xl mx-auto relative">
              <div
                className={`app-page-card hover:!transform-none border-0 pointer-events-auto absolute top-0 ${isEn ? 'right-0' : 'left-0'} w-44 rounded-2xl p-2.5 space-y-1.5 ${s3d.surfaceCardClass}`}
                dir={isEn ? 'ltr' : 'rtl'}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`px-2 py-1 text-xs font-black opacity-80 flex items-center justify-between border-b pb-1.5 ${s3d.dividerClass}`}>
                  <span className="flex items-center gap-1.5">
                    <Eye size={13} style={{ color: s3d.noticeAccent }} />
                    <span>{isEn ? 'Display Mode' : 'وضع الإظهار'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMaskMenu(false)}
                    className={`app-inner-3d-box unified-3d-btn border-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${s3d.isBlackTheme ? 'bg-zinc-800' : 'bg-slate-100 dark:bg-white/10'}`}
                    aria-label={isEn ? 'Close' : 'إغلاق'}
                  >
                    <X size={12} />
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
          className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/65"
          dir={isEn ? 'ltr' : 'rtl'}
          onClick={() => {}}
        >
          <div 
            className={`app-page-card border-0 w-full max-w-sm rounded-[2rem] p-6 text-center space-y-4 ${s3d.surfaceCardClass}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Celebration Icon */}
            <div 
              className="app-3d-badge border-0 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
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
                className="app-inner-3d-box unified-3d-btn border-0 w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }}
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
