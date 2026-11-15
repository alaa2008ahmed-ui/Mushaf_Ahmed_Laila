import { create } from 'zustand';
import { App as CapacitorApp } from '@capacitor/app';
import { RECITERS, SURAH_LIST } from '../data/listenQuranData';
import { ARABIC_READERS } from '../components/QuranReader/constants';
import {
  CACHE_KEY,
  normalizeUrl,
  simplifyName,
  getAvailableSurahsForReader,
} from '../utils/listenQuranUtils';
import { useAudioStore } from './useAudioStore';
import {
  registerListenInterruptionHandlers,
  clearAllListenInterruptions,
  acquireListenInterruption,
  releaseListenInterruption,
} from '../utils/listenAudioCoordinator';
import {
  setNativeQuranPlaybackActive,
  addNativeQuranStopListener,
  addNativeAdhanStateListener,
} from '../utils/silentMode';

export const LISTEN_STORAGE_KEY = 'listen_quran_state_v7';
export const FLOATING_LISTEN_BTN_ENABLED_KEY = 'listen_floating_btn_enabled';
export const FLOATING_LISTEN_BTN_VISIBILITY_EVENT = 'listen-floating-btn-visibility-changed';

export const isFloatingListenButtonEnabled = (): boolean => {
  try {
    return localStorage.getItem(FLOATING_LISTEN_BTN_ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
};

export const setFloatingListenButtonEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(FLOATING_LISTEN_BTN_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(FLOATING_LISTEN_BTN_VISIBILITY_EVENT, { detail: { enabled } })
    );
  }
};

export type SleepTimerMode = 'off' | '15' | '30' | '60' | 'custom' | 'end_of_surah';

export const ALLOWED_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const;

const normalizePlaybackRate = (rate?: number): number => {
  if (typeof rate !== 'number' || !Number.isFinite(rate)) return 1;
  const match = ALLOWED_PLAYBACK_RATES.find(r => Math.abs(r - rate) < 0.001);
  return match ?? 1;
};

interface PersistedListenState {
  savedReciterId?: string;
  savedSurahNumber?: number;
  savedContinuousPlay?: boolean;
  savedRepeatSurah?: boolean;
  savedCurrentTime?: number;
  savedDuration?: number;
  savedTimeKey?: string;
  savedPlaybackRate?: number;
}

const resolveReciterId = (rawId?: string): string => {
  if (!rawId) return RECITERS[0].id;
  const exact = RECITERS.find(r => r.id === rawId);
  if (exact) return exact.id;
  const eaReader = ARABIC_READERS.find(r => r.id === rawId);
  const targetName = eaReader?.name;
  const matchedByName = targetName
    ? RECITERS.find(r => r.name.includes(targetName) || targetName.includes(r.name))
    : null;
  return matchedByName ? matchedByName.id : RECITERS[0].id;
};

const readPersistedState = () => {
  try {
    const raw = localStorage.getItem(LISTEN_STORAGE_KEY);
    if (raw) {
      const parsed: PersistedListenState = JSON.parse(raw);
      const reciterId = resolveReciterId(parsed.savedReciterId);
      const surahNumber =
        typeof parsed.savedSurahNumber === 'number' &&
        SURAH_LIST.some(s => s.number === parsed.savedSurahNumber)
          ? parsed.savedSurahNumber
          : 1;
      const isRepeatSurah =
        typeof parsed.savedRepeatSurah === 'boolean' ? parsed.savedRepeatSurah : false;
      const isContinuousPlay = isRepeatSurah
        ? false
        : typeof parsed.savedContinuousPlay === 'boolean'
        ? parsed.savedContinuousPlay
        : true;
      const currentKey = `${reciterId}|${surahNumber}`;
      const isSameTrack = parsed.savedTimeKey === currentKey;
      const currentTime =
        isSameTrack &&
        typeof parsed.savedCurrentTime === 'number' &&
        parsed.savedCurrentTime > 0
          ? parsed.savedCurrentTime
          : 0;
      const duration =
        isSameTrack &&
        typeof parsed.savedDuration === 'number' &&
        parsed.savedDuration > 0
          ? parsed.savedDuration
          : 0;

      const playbackRate = normalizePlaybackRate(parsed.savedPlaybackRate);

      return {
        reciterId,
        surahNumber,
        isContinuousPlay,
        isRepeatSurah,
        currentTime,
        duration,
        playbackRate,
      };
    }
  } catch (e) {}
  return {
    reciterId: RECITERS[0].id,
    surahNumber: 1,
    isContinuousPlay: true,
    isRepeatSurah: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
  };
};

const writePersistedState = (state: {
  reciterId: string;
  surahNumber: number;
  isContinuousPlay: boolean;
  isRepeatSurah: boolean;
  currentTime?: number;
  duration?: number;
  playbackRate?: number;
}) => {
  try {
    const raw = localStorage.getItem(LISTEN_STORAGE_KEY);
    const parsed: PersistedListenState = raw ? JSON.parse(raw) : {};
    parsed.savedReciterId = state.reciterId;
    parsed.savedSurahNumber = state.surahNumber;
    parsed.savedContinuousPlay = state.isContinuousPlay;
    parsed.savedRepeatSurah = state.isRepeatSurah;
    if (typeof state.currentTime === 'number' && Number.isFinite(state.currentTime)) {
      parsed.savedCurrentTime = state.currentTime;
      parsed.savedTimeKey = `${state.reciterId}|${state.surahNumber}`;
    }
    if (typeof state.duration === 'number' && Number.isFinite(state.duration) && state.duration > 0) {
      parsed.savedDuration = state.duration;
      parsed.savedTimeKey = `${state.reciterId}|${state.surahNumber}`;
    } else if (typeof state.currentTime === 'number' && state.currentTime === 0) {
      parsed.savedDuration = 0;
    }
    if (typeof state.playbackRate === 'number') {
      parsed.savedPlaybackRate = normalizePlaybackRate(state.playbackRate);
    }
    localStorage.setItem(LISTEN_STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {}
};

const readCachedReciterSurahs = (): Record<string, number[]> => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.data && typeof parsed.data === 'object') {
        return parsed.data;
      }
    }
  } catch (e) {}
  return {};
};

const buildSurahAudioUrl = (reciterId: string, surahNumber: number): string => {
  const surahFormatted = String(surahNumber).padStart(3, '0');
  const baseUrl = reciterId.endsWith('/') ? reciterId.slice(0, -1) : reciterId;
  return `${baseUrl}/${surahFormatted}.mp3`;
};

const getAppLanguageIsArabic = (): boolean => {
  try {
    return localStorage.getItem('app_language') !== 'en';
  } catch (e) {
    return true;
  }
};

// --- Singleton module-level audio & timer instances (survive route transitions) ---
let sharedAudio: HTMLAudioElement | null = null;
let loadedTrackKey = '';
let inFlightTrackKey = '';
let activeObjectUrl: string | null = null;
let loadRequestId = 0;
let pendingInitialSeekTime = 0;
let lastTimeSaveMs = 0;
let sleepTimerInterval: ReturnType<typeof setInterval> | null = null;
let reciterSurahsFetched = false;
let activeSwitchCount = 0;
let suppressPauseUntilMs = 0;
let wantsToPlay = false;
let globalLifecycleInitialized = false;

const initial = readPersistedState();
pendingInitialSeekTime = initial.currentTime;

export interface ListenQuranStoreState {
  reciterId: string;
  surahNumber: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  isContinuousPlay: boolean;
  isRepeatSurah: boolean;
  playbackRate: number;
  error: string;
  reciterSurahs: Record<string, number[]>;

  // Floating & Cross-Page Session
  hasFloatingSession: boolean;
  isPausedByInterruption: boolean;
  currentPage: string;

  // Sleep timer
  sleepTimerMode: SleepTimerMode;
  isSleepTimerActive: boolean;
  sleepTimerRemainingSeconds: number | null;
  customTimerMinutes: number;

  // Actions
  initAudio: () => void;
  setAppPage: (page: string) => void;
  stopFromFloating: () => void;
  endSessionOnAppClose: () => void;
  persistProgressNow: () => void;
  fetchReciterSurahs: () => Promise<void>;
  getAvailableSurahs: (id?: string) => number[];
  setReciterId: (reciterId: string) => void;
  setSurahNumber: (surahNumber: number) => void;
  setReciterAndSurah: (reciterId: string, surahNumber: number, autoPlay?: boolean) => void;
  togglePlay: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  nextSurah: (forceAutoPlay?: boolean) => void;
  prevSurah: (forceAutoPlay?: boolean) => void;
  toggleContinuousPlay: () => void;
  toggleRepeatSurah: () => void;
  setPresetTimer: (minutes: number) => void;
  setEndOfSurahTimer: () => void;
  startCustomTimer: () => void;
  cancelSleepTimer: () => void;
  incrementTimer: () => void;
  decrementTimer: () => void;
}

const syncMediaSessionAndNativeService = (
  getState: () => ListenQuranStoreState,
  activePlaying: boolean
) => {
  const st = getState();
  const surahName =
    SURAH_LIST.find(s => s.number === st.surahNumber)?.name || `سورة ${st.surahNumber}`;
  const reciterName =
    RECITERS.find(r => r.id === st.reciterId)?.name || RECITERS[0].name;
  const isArabic = getAppLanguageIsArabic();

  // 1. Update Web/WebView MediaSession API (keeps audio alive on lockscreen/background)
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      const ms = navigator.mediaSession;
      if (typeof MediaMetadata !== 'undefined') {
        ms.metadata = new MediaMetadata({
          title: surahName,
          artist: reciterName,
          album: isArabic ? 'القرآن الكريم' : 'Holy Quran',
        });
      }
      ms.playbackState = activePlaying
        ? 'playing'
        : st.hasFloatingSession
        ? 'paused'
        : 'none';
    } catch (e) {}
  }

  // 2. Sync Android native MediaPlayback Foreground Service so minimizing keeps playing
  setNativeQuranPlaybackActive(activePlaying, surahName, reciterName, isArabic).catch(
    () => {}
  );
};

const stopSleepInterval = () => {
  if (sleepTimerInterval !== null) {
    clearInterval(sleepTimerInterval);
    sleepTimerInterval = null;
  }
};

const ensureSleepInterval = (
  getState: () => ListenQuranStoreState,
  setState: (partial: Partial<ListenQuranStoreState>) => void
) => {
  stopSleepInterval();
  sleepTimerInterval = setInterval(() => {
    const state = getState();
    if (!state.isSleepTimerActive || state.sleepTimerRemainingSeconds === null) {
      stopSleepInterval();
      return;
    }
    const nextSec = Math.max(0, state.sleepTimerRemainingSeconds - 1);
    if (nextSec <= 0) {
      wantsToPlay = false;
      loadRequestId++;
      suppressPauseUntilMs = Date.now() + 800;
      if (sharedAudio) {
        try {
          sharedAudio.pause();
        } catch (e) {}
      }
      clearAllListenInterruptions();
      setState({
        isPlaying: false,
        isLoading: false,
        hasFloatingSession: false,
        isPausedByInterruption: false,
        isSleepTimerActive: false,
        sleepTimerMode: 'off',
        sleepTimerRemainingSeconds: null,
      });
      stopSleepInterval();
      state.persistProgressNow();
      syncMediaSessionAndNativeService(getState, false);
    } else {
      setState({ sleepTimerRemainingSeconds: nextSec });
    }
  }, 1000);
};

const applyAudioPlaybackRate = (audio: HTMLAudioElement, rate: number) => {
  const safeRate = normalizePlaybackRate(rate);
  try {
    audio.defaultPlaybackRate = safeRate;
    audio.playbackRate = safeRate;
  } catch (e) {}
};

const ensureGlobalLifecycleAndCoordinators = (
  getState: () => ListenQuranStoreState,
  setState: (partial: Partial<ListenQuranStoreState>) => void
) => {
  if (globalLifecycleInitialized) return;
  globalLifecycleInitialized = true;

  // Register MediaSession controls
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      const ms = navigator.mediaSession;
      ms.setActionHandler('play', () => {
        const st = getState();
        if (!st.isPlaying) {
          st.togglePlay().catch(() => {});
        }
      });
      ms.setActionHandler('pause', () => {
        const st = getState();
        if (st.isPlaying || wantsToPlay) {
          st.pause();
        }
      });
      ms.setActionHandler('stop', () => {
        getState().stopFromFloating();
      });
      ms.setActionHandler('nexttrack', () => {
        getState().nextSurah(true);
      });
      ms.setActionHandler('previoustrack', () => {
        getState().prevSurah(true);
      });
    } catch (e) {}
  }

  // Register Audio & Mic interruption handlers (Requirement 2)
  registerListenInterruptionHandlers({
    onInterrupt: () => {
      const st = getState();
      if (
        wantsToPlay ||
        st.isPlaying ||
        (sharedAudio && !sharedAudio.paused && !sharedAudio.ended) ||
        (st.hasFloatingSession && st.isLoading)
      ) {
        suppressPauseUntilMs = Date.now() + 800;
        if (sharedAudio) {
          try {
            sharedAudio.pause();
          } catch (e) {}
        }
        setState({
          isPlaying: false,
          isLoading: false,
          isPausedByInterruption: true,
        });
        st.persistProgressNow();
        syncMediaSessionAndNativeService(getState, false);
      }
    },
    onResume: () => {
      const st = getState();
      if (!st.isPausedByInterruption) return;
      // Only resume if session is still active (either floating on another page or on listen page)
      if (!wantsToPlay && !st.hasFloatingSession && st.currentPage !== 'listen') {
        setState({ isPausedByInterruption: false });
        return;
      }

      wantsToPlay = true;
      setState({
        isPlaying: true,
        isPausedByInterruption: false,
        hasFloatingSession: true,
      });
      const audio = sharedAudio;
      if (audio && audio.src) {
        applyAudioPlaybackRate(audio, st.playbackRate);
        audio
          .play()
          .then(() => {
            if (!wantsToPlay) {
              if (!audio.paused) {
                suppressPauseUntilMs = Date.now() + 600;
                audio.pause();
              }
              return;
            }
            setState({
              isPlaying: true,
              isLoading: false,
              hasFloatingSession: true,
              isPausedByInterruption: false,
              error: '',
            });
            syncMediaSessionAndNativeService(getState, true);
          })
          .catch(err => {
            console.warn('Auto-resume after interruption failed:', err);
          });
      }
    },
  });

  // Save current ayah/progress on backgrounding without stopping playback (Requirement 5),
  // and end floating session + save last ayah when closing the app (Requirement 4).
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      getState().endSessionOnAppClose();
    });

    window.addEventListener('pagehide', () => {
      getState().persistProgressNow();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        getState().persistProgressNow();
      }
    });
  }

  CapacitorApp.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      getState().persistProgressNow();
    }
  }).catch(() => {});

  // Listen to native Stop button from background notification
  addNativeQuranStopListener(() => {
    getState().stopFromFloating();
  }).catch(() => {});

  // Listen to native Adhan alarm service so ListenQuran yields while Adhan plays
  addNativeAdhanStateListener(({ isPlaying }) => {
    if (isPlaying) {
      acquireListenInterruption('native-adhan-service');
    } else {
      releaseListenInterruption('native-adhan-service');
    }
  }).catch(() => {});
};

const ensureSharedAudio = (
  getState: () => ListenQuranStoreState,
  setState: (partial: Partial<ListenQuranStoreState>) => void
): HTMLAudioElement => {
  ensureGlobalLifecycleAndCoordinators(getState, setState);

  if (sharedAudio) {
    applyAudioPlaybackRate(sharedAudio, getState().playbackRate);
    return sharedAudio;
  }

  const audio = new Audio();
  sharedAudio = audio;
  applyAudioPlaybackRate(audio, getState().playbackRate);

  audio.addEventListener('timeupdate', () => {
    if (pendingInitialSeekTime > 0) return;
    const time = audio.currentTime || 0;
    const dur = isFinite(audio.duration) ? audio.duration : 0;
    const st = getState();

    const patch: Partial<ListenQuranStoreState> = {
      currentTime: time,
      ...(dur > 0 ? { duration: dur } : {}),
    };

    // Self-heal store state whenever the audio element is genuinely advancing
    if (!audio.paused && !audio.ended && !st.isPausedByInterruption) {
      wantsToPlay = true;
      if (!st.isPlaying) patch.isPlaying = true;
      if (st.isLoading) patch.isLoading = false;
      if (!st.hasFloatingSession) patch.hasFloatingSession = true;
      if (st.error) patch.error = '';
    }

    setState(patch);

    const now = Date.now();
    if (now - lastTimeSaveMs > 1500) {
      lastTimeSaveMs = now;
      writePersistedState({
        reciterId: st.reciterId,
        surahNumber: st.surahNumber,
        isContinuousPlay: st.isContinuousPlay,
        isRepeatSurah: st.isRepeatSurah,
        currentTime: time,
        duration: dur > 0 ? dur : st.duration,
      });
    }
  });

  audio.addEventListener('durationchange', () => {
    if (isFinite(audio.duration) && audio.duration > 0) {
      setState({ duration: audio.duration });
      if (pendingInitialSeekTime > 0 && pendingInitialSeekTime < audio.duration) {
        const seekTo = pendingInitialSeekTime;
        pendingInitialSeekTime = 0;
        audio.currentTime = seekTo;
        setState({ currentTime: seekTo });
      }
      const st = getState();
      writePersistedState({
        reciterId: st.reciterId,
        surahNumber: st.surahNumber,
        isContinuousPlay: st.isContinuousPlay,
        isRepeatSurah: st.isRepeatSurah,
        currentTime: audio.currentTime || st.currentTime,
        duration: audio.duration,
      });
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    applyAudioPlaybackRate(audio, getState().playbackRate);
    if (isFinite(audio.duration) && audio.duration > 0) {
      setState({ duration: audio.duration });
      if (pendingInitialSeekTime > 0 && pendingInitialSeekTime < audio.duration) {
        const seekTo = pendingInitialSeekTime;
        pendingInitialSeekTime = 0;
        audio.currentTime = seekTo;
        setState({ currentTime: seekTo });
      }
    }
  });

  audio.addEventListener('play', () => {
    if (!wantsToPlay) {
      suppressPauseUntilMs = Date.now() + 600;
      try {
        audio.pause();
      } catch (e) {}
      return;
    }
    suppressPauseUntilMs = 0;
    applyAudioPlaybackRate(audio, getState().playbackRate);
    setState({
      isPlaying: true,
      hasFloatingSession: true,
      isPausedByInterruption: false,
      error: '',
    });
    syncMediaSessionAndNativeService(getState, true);
  });

  audio.addEventListener('playing', () => {
    if (!wantsToPlay) {
      suppressPauseUntilMs = Date.now() + 600;
      try {
        audio.pause();
      } catch (e) {}
      return;
    }
    suppressPauseUntilMs = 0;
    applyAudioPlaybackRate(audio, getState().playbackRate);
    setState({
      isPlaying: true,
      isLoading: false,
      hasFloatingSession: true,
      isPausedByInterruption: false,
      error: '',
    });
    syncMediaSessionAndNativeService(getState, true);
  });

  audio.addEventListener('pause', () => {
    // Ignore stale async pause events when audio is actually playing, ended,
    // mid-track-switch, or paused programmatically by interruption/stop.
    if (
      !audio.paused ||
      audio.ended ||
      activeSwitchCount > 0 ||
      Date.now() < suppressPauseUntilMs
    ) {
      return;
    }

    const st = getState();
    const dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : st.duration;

    // If an interruption pause is active, keep session alive without wiping floating state
    if (st.isPausedByInterruption) {
      setState({ isPlaying: false });
      return;
    }

    // If user explicitly intends playback to continue (e.g. during track switch or transient WebView pause),
    // do not drop the button out of playing state unless user explicitly stopped.
    if (wantsToPlay) {
      return;
    }

    setState({ isPlaying: false });
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: st.surahNumber,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      currentTime: audio.currentTime || 0,
      duration: dur,
    });
    syncMediaSessionAndNativeService(getState, false);
  });

  audio.addEventListener('waiting', () => {
    if (wantsToPlay) {
      setState({ isLoading: true });
    }
  });

  audio.addEventListener('canplay', () => {
    applyAudioPlaybackRate(audio, getState().playbackRate);
    if (pendingInitialSeekTime > 0 && isFinite(audio.duration) && audio.duration > 0) {
      const seekTo = Math.min(pendingInitialSeekTime, Math.max(0, audio.duration - 0.5));
      pendingInitialSeekTime = 0;
      audio.currentTime = seekTo;
      setState({ currentTime: seekTo, duration: audio.duration });
    }
    setState({ isLoading: false });

    const st = getState();
    if (
      wantsToPlay &&
      activeSwitchCount === 0 &&
      !st.isPausedByInterruption &&
      audio.paused &&
      !audio.ended
    ) {
      audio.play().catch(() => {});
    }
  });

  audio.addEventListener('error', () => {
    // Ignore stale errors during track transitions or if playback is actually active
    if (activeSwitchCount > 0 || !audio.paused) return;

    const st = getState();
    if (!wantsToPlay && !st.hasFloatingSession) {
      setState({
        isLoading: false,
        isPlaying: false,
        error: 'خطأ في تحميل المقطع الصوتي. قد يكون غير متوفر حاليًا.',
      });
      return;
    }

    wantsToPlay = false;
    setState({
      isLoading: false,
      isPlaying: false,
      hasFloatingSession: false,
      isPausedByInterruption: false,
      error: 'خطأ في تحميل المقطع الصوتي. قد يكون غير متوفر حاليًا.',
    });
    syncMediaSessionAndNativeService(getState, false);
  });

  audio.addEventListener('ended', () => {
    const st = getState();
    const dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : st.duration;

    // 1. Sleep timer: end of surah
    if (st.isSleepTimerActive && st.sleepTimerMode === 'end_of_surah') {
      wantsToPlay = false;
      clearAllListenInterruptions();
      setState({
        isPlaying: false,
        isLoading: false,
        hasFloatingSession: false,
        isPausedByInterruption: false,
        currentTime: 0,
        isSleepTimerActive: false,
        sleepTimerMode: 'off',
        sleepTimerRemainingSeconds: null,
      });
      stopSleepInterval();
      writePersistedState({
        reciterId: st.reciterId,
        surahNumber: st.surahNumber,
        isContinuousPlay: st.isContinuousPlay,
        isRepeatSurah: st.isRepeatSurah,
        currentTime: 0,
        duration: dur,
      });
      syncMediaSessionAndNativeService(getState, false);
      return;
    }

    // 2. Repeat current surah
    if (st.isRepeatSurah) {
      wantsToPlay = true;
      audio.currentTime = 0;
      setState({
        currentTime: 0,
        isPlaying: true,
        hasFloatingSession: true,
        isPausedByInterruption: false,
      });
      writePersistedState({
        reciterId: st.reciterId,
        surahNumber: st.surahNumber,
        isContinuousPlay: st.isContinuousPlay,
        isRepeatSurah: st.isRepeatSurah,
        currentTime: 0,
        duration: dur,
      });
      audio.play().catch(err => {
        if ((err as any)?.name === 'AbortError' || !audio.paused) return;
        console.error('Failed to repeat surah:', err);
        wantsToPlay = false;
        setState({ isPlaying: false, isLoading: false, hasFloatingSession: false });
        syncMediaSessionAndNativeService(getState, false);
      });
      return;
    }

    // 3. Continuous play (default)
    if (st.isContinuousPlay) {
      wantsToPlay = true;
      setState({
        isPlaying: true,
        hasFloatingSession: true,
        isPausedByInterruption: false,
      });
      st.nextSurah(true);
      return;
    }

    // 4. Stop when both repeat & continuous are disabled
    wantsToPlay = false;
    clearAllListenInterruptions();
    setState({
      isPlaying: false,
      isLoading: false,
      hasFloatingSession: false,
      isPausedByInterruption: false,
      currentTime: 0,
    });
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: st.surahNumber,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      currentTime: 0,
      duration: dur,
    });
    syncMediaSessionAndNativeService(getState, false);
  });

  return audio;
};

const loadAudioTrack = async (
  reciterId: string,
  surahNumber: number,
  autoPlay: boolean,
  getState: () => ListenQuranStoreState,
  setState: (partial: Partial<ListenQuranStoreState>) => void
) => {
  const audio = ensureSharedAudio(getState, setState);
  const trackKey = `${reciterId}|${surahNumber}`;
  const remoteUrl = buildSurahAudioUrl(reciterId, surahNumber);
  const myRequestId = ++loadRequestId;

  activeSwitchCount++;
  inFlightTrackKey = trackKey;
  loadedTrackKey = '';

  if (autoPlay) {
    wantsToPlay = true;
    try {
      useAudioStore.getState().stopAudio();
    } catch (e) {}
    setState({
      isPlaying: true,
      isLoading: true,
      hasFloatingSession: true,
      isPausedByInterruption: false,
      error: '',
    });
  } else {
    setState({ error: '' });
  }

  suppressPauseUntilMs = Date.now() + 900;
  try {
    if (!audio.paused) {
      audio.pause();
    }
  } catch (e) {}

  let createdObjectUrl: string | null = null;
  try {
    let resolvedSrc = remoteUrl;
    if (typeof caches !== 'undefined') {
      try {
        const cache = await caches.open('quran-audio-cache');
        const match = await cache.match(remoteUrl);
        if (match) {
          const blob = await match.blob();
          createdObjectUrl = URL.createObjectURL(blob);
          resolvedSrc = createdObjectUrl;
        }
      } catch (e) {}
    }

    if (myRequestId !== loadRequestId) {
      if (createdObjectUrl) {
        try {
          URL.revokeObjectURL(createdObjectUrl);
        } catch (e) {}
      }
      return;
    }

    const prevObjectUrl = activeObjectUrl;
    activeObjectUrl = createdObjectUrl;
    loadedTrackKey = trackKey;
    audio.src = resolvedSrc;
    applyAudioPlaybackRate(audio, getState().playbackRate);

    // Revoke previous blob URL only AFTER audio.src has been reassigned
    if (prevObjectUrl && prevObjectUrl !== createdObjectUrl) {
      try {
        URL.revokeObjectURL(prevObjectUrl);
      } catch (e) {}
    }

    if (autoPlay && wantsToPlay && !getState().isPausedByInterruption) {
      try {
        applyAudioPlaybackRate(audio, getState().playbackRate);
        await audio.play();
        applyAudioPlaybackRate(audio, getState().playbackRate);
        if (myRequestId === loadRequestId && wantsToPlay) {
          setState({
            isPlaying: true,
            isLoading: false,
            hasFloatingSession: true,
            isPausedByInterruption: false,
            error: '',
          });
          syncMediaSessionAndNativeService(getState, true);
        } else if (!wantsToPlay && !audio.paused) {
          suppressPauseUntilMs = Date.now() + 600;
          audio.pause();
        }
      } catch (err: any) {
        if (myRequestId !== loadRequestId || !wantsToPlay) return;
        // AbortError during quick switching or pending load: keep session alive for canplay retry
        if (err?.name === 'AbortError') {
          if (!audio.paused) {
            setState({
              isPlaying: true,
              isLoading: false,
              hasFloatingSession: true,
              isPausedByInterruption: false,
            });
          }
          return;
        }
        console.warn('Audio autoplay failed:', err);
        wantsToPlay = false;
        setState({
          isPlaying: false,
          isLoading: false,
          hasFloatingSession: false,
        });
        syncMediaSessionAndNativeService(getState, false);
      }
    } else {
      setState({ isLoading: false });
    }
  } catch (err) {
    if (myRequestId !== loadRequestId) {
      if (createdObjectUrl) {
        try {
          URL.revokeObjectURL(createdObjectUrl);
        } catch (e) {}
      }
      return;
    }
    const prevObjectUrl = activeObjectUrl;
    activeObjectUrl = null;
    loadedTrackKey = trackKey;
    audio.src = remoteUrl;
    applyAudioPlaybackRate(audio, getState().playbackRate);
    if (prevObjectUrl) {
      try {
        URL.revokeObjectURL(prevObjectUrl);
      } catch (e) {}
    }
    setState({ isLoading: false });
  } finally {
    activeSwitchCount = Math.max(0, activeSwitchCount - 1);
    if (inFlightTrackKey === trackKey && myRequestId === loadRequestId) {
      inFlightTrackKey = '';
    }
  }
};

export const useListenQuranStore = create<ListenQuranStoreState>((set, get) => ({
  reciterId: initial.reciterId,
  surahNumber: initial.surahNumber,
  isPlaying: false,
  isLoading: false,
  currentTime: initial.currentTime,
  duration: initial.duration,
  isContinuousPlay: initial.isContinuousPlay,
  isRepeatSurah: initial.isRepeatSurah,
  playbackRate: initial.playbackRate,
  error: '',
  reciterSurahs: readCachedReciterSurahs(),

  hasFloatingSession: false,
  isPausedByInterruption: false,
  currentPage: 'home',

  sleepTimerMode: 'off',
  isSleepTimerActive: false,
  sleepTimerRemainingSeconds: null,
  customTimerMinutes: 15,

  initAudio: () => {
    const st = get();
    const trackKey = `${st.reciterId}|${st.surahNumber}`;
    const audio = ensureSharedAudio(get, set);
    if (inFlightTrackKey === trackKey) return;
    if (loadedTrackKey === trackKey && audio.src && !audio.error) return;
    if (wantsToPlay && !audio.paused) return;
    loadAudioTrack(st.reciterId, st.surahNumber, false, get, set);
  },

  setAppPage: (page: string) => {
    ensureGlobalLifecycleAndCoordinators(get, set);
    const prevPage = get().currentPage;
    if (prevPage !== page) {
      set({ currentPage: page });
      if (prevPage === 'listen' && page !== 'listen' && !isFloatingListenButtonEnabled()) {
        const st = get();
        if (
          st.isPlaying ||
          wantsToPlay ||
          st.isLoading ||
          st.hasFloatingSession ||
          st.isPausedByInterruption ||
          (sharedAudio && !sharedAudio.paused && !sharedAudio.ended)
        ) {
          get().stopFromFloating();
        }
      }
    }
  },

  persistProgressNow: () => {
    const st = get();
    const time =
      sharedAudio && pendingInitialSeekTime <= 0 && Number.isFinite(sharedAudio.currentTime)
        ? sharedAudio.currentTime
        : st.currentTime;
    const dur =
      sharedAudio && Number.isFinite(sharedAudio.duration) && sharedAudio.duration > 0
        ? sharedAudio.duration
        : st.duration;
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: st.surahNumber,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      currentTime: time,
      duration: dur,
      playbackRate: st.playbackRate,
    });
  },

  stopFromFloating: () => {
    const st = get();
    wantsToPlay = false;
    loadRequestId++;
    suppressPauseUntilMs = Date.now() + 800;
    st.persistProgressNow();
    clearAllListenInterruptions();
    if (sharedAudio) {
      try {
        sharedAudio.pause();
      } catch (e) {}
    }
    set({
      isPlaying: false,
      isLoading: false,
      hasFloatingSession: false,
      isPausedByInterruption: false,
    });
    syncMediaSessionAndNativeService(get, false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voice-control-resume'));
    }
  },

  endSessionOnAppClose: () => {
    const st = get();
    wantsToPlay = false;
    loadRequestId++;
    suppressPauseUntilMs = Date.now() + 800;
    st.persistProgressNow();
    clearAllListenInterruptions();
    stopSleepInterval();
    if (sharedAudio) {
      try {
        sharedAudio.pause();
      } catch (e) {}
    }
    set({
      isPlaying: false,
      isLoading: false,
      hasFloatingSession: false,
      isPausedByInterruption: false,
    });
    syncMediaSessionAndNativeService(get, false);
  },

  fetchReciterSurahs: async () => {
    if (reciterSurahsFetched) return;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (data && Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          reciterSurahsFetched = true;
          set({ reciterSurahs: data });
          return;
        }
      }

      const res = await fetch('https://mp3quran.net/api/v3/reciters?language=ar');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const mapping: Record<string, number[]> = {};

      if (data.reciters && Array.isArray(data.reciters)) {
        data.reciters.forEach((r: any) => {
          const nameKey = `name:${simplifyName(r.name)}`;
          if (r.moshaf && Array.isArray(r.moshaf)) {
            r.moshaf.forEach((m: any) => {
              const rawSuras = m.suras || m.surah_list;
              if (m.server && rawSuras) {
                const surasArray =
                  typeof rawSuras === 'string'
                    ? rawSuras.split(',').map(Number)
                    : Array.isArray(rawSuras)
                    ? rawSuras
                    : [];
                const urlKey = normalizeUrl(m.server);
                if (urlKey) mapping[urlKey] = surasArray;
                if (!mapping[nameKey]) {
                  mapping[nameKey] = surasArray;
                } else {
                  mapping[nameKey] = Array.from(new Set([...mapping[nameKey], ...surasArray]));
                }
              }
            });
          }
        });
      }

      reciterSurahsFetched = true;
      set({ reciterSurahs: mapping });
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: mapping,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.error('Failed to fetch surahs mapping', e);
    }
  },

  getAvailableSurahs: (id?: string) => {
    const targetId = id || get().reciterId;
    const rName = RECITERS.find(r => r.id === targetId)?.name;
    return getAvailableSurahsForReader(targetId, rName, get().reciterSurahs);
  },

  setReciterId: (newReciterId: string) => {
    const resolved = resolveReciterId(newReciterId);
    const st = get();
    if (resolved === st.reciterId) return;

    const available = st.getAvailableSurahs(resolved);
    const nextSurah = available.includes(st.surahNumber) ? st.surahNumber : available[0] || 1;
    const wasPlaying =
      st.isPlaying || wantsToPlay || Boolean(sharedAudio && !sharedAudio.paused && !sharedAudio.ended);

    pendingInitialSeekTime = 0;
    set({
      reciterId: resolved,
      surahNumber: nextSurah,
      currentTime: 0,
      duration: 0,
      error: '',
      ...(wasPlaying ? { isPlaying: true, hasFloatingSession: true, isPausedByInterruption: false } : {}),
    });
    writePersistedState({
      reciterId: resolved,
      surahNumber: nextSurah,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      currentTime: 0,
      duration: 0,
    });
    loadAudioTrack(resolved, nextSurah, wasPlaying, get, set);
  },

  setSurahNumber: (newSurah: number) => {
    const st = get();
    if (newSurah === st.surahNumber && loadedTrackKey === `${st.reciterId}|${newSurah}`) return;
    const wasPlaying =
      st.isPlaying || wantsToPlay || Boolean(sharedAudio && !sharedAudio.paused && !sharedAudio.ended);

    pendingInitialSeekTime = 0;
    set({
      surahNumber: newSurah,
      currentTime: 0,
      duration: 0,
      error: '',
      ...(wasPlaying ? { isPlaying: true, hasFloatingSession: true, isPausedByInterruption: false } : {}),
    });
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: newSurah,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      currentTime: 0,
      duration: 0,
    });
    loadAudioTrack(st.reciterId, newSurah, wasPlaying, get, set);
  },

  setReciterAndSurah: (newReciterId: string, newSurah: number, autoPlay?: boolean) => {
    const resolved = resolveReciterId(newReciterId);
    const st = get();
    const shouldPlay =
      typeof autoPlay === 'boolean'
        ? autoPlay
        : st.isPlaying || wantsToPlay || Boolean(sharedAudio && !sharedAudio.paused && !sharedAudio.ended);
    if (
      resolved === st.reciterId &&
      newSurah === st.surahNumber &&
      loadedTrackKey === `${resolved}|${newSurah}`
    ) {
      return;
    }

    pendingInitialSeekTime = 0;
    set({
      reciterId: resolved,
      surahNumber: newSurah,
      currentTime: 0,
      duration: 0,
      error: '',
      ...(shouldPlay ? { isPlaying: true, hasFloatingSession: true, isPausedByInterruption: false } : {}),
    });
    writePersistedState({
      reciterId: resolved,
      surahNumber: newSurah,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      currentTime: 0,
      duration: 0,
    });
    loadAudioTrack(resolved, newSurah, shouldPlay, get, set);
  },

  togglePlay: async () => {
    const st = get();
    const audio = ensureSharedAudio(get, set);
    const trackKey = `${st.reciterId}|${st.surahNumber}`;
    set({ error: '' });

    const isCurrentlyActive =
      (st.isPlaying || wantsToPlay || (Boolean(audio.src) && !audio.paused && !audio.ended)) &&
      !st.isPausedByInterruption;

    if (isCurrentlyActive) {
      wantsToPlay = false;
      loadRequestId++;
      suppressPauseUntilMs = Date.now() + 800;
      try {
        audio.pause();
      } catch (e) {}
      clearAllListenInterruptions();
      set({
        isPlaying: false,
        isLoading: false,
        hasFloatingSession: false,
        isPausedByInterruption: false,
      });
      st.persistProgressNow();
      syncMediaSessionAndNativeService(get, false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('voice-control-resume'));
      }
      return;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voice-control-pause'));
    }

    try {
      useAudioStore.getState().stopAudio();
    } catch (e) {}

    clearAllListenInterruptions();
    wantsToPlay = true;
    set({
      isPlaying: true,
      hasFloatingSession: true,
      isPausedByInterruption: false,
      error: '',
    });
    syncMediaSessionAndNativeService(get, true);

    if (loadedTrackKey !== trackKey || !audio.src || audio.error) {
      await loadAudioTrack(st.reciterId, st.surahNumber, true, get, set);
      return;
    }

    const myPlayRequestId = ++loadRequestId;
    try {
      set({ isLoading: true });
      applyAudioPlaybackRate(audio, st.playbackRate);
      await audio.play();
      if (myPlayRequestId !== loadRequestId || !wantsToPlay) {
        if (!wantsToPlay && !audio.paused) {
          suppressPauseUntilMs = Date.now() + 600;
          audio.pause();
        }
        return;
      }
      set({
        isPlaying: true,
        isLoading: false,
        hasFloatingSession: true,
        isPausedByInterruption: false,
        error: '',
      });
      syncMediaSessionAndNativeService(get, true);
    } catch (err: any) {
      if (myPlayRequestId !== loadRequestId || !wantsToPlay) return;
      if (err?.name === 'AbortError' && !audio.paused) {
        set({
          isPlaying: true,
          isLoading: false,
          hasFloatingSession: true,
          isPausedByInterruption: false,
        });
        return;
      }
      console.warn('Playback error:', err);
      wantsToPlay = false;
      set({
        isPlaying: false,
        isLoading: false,
        hasFloatingSession: false,
      });
      syncMediaSessionAndNativeService(get, false);
    }
  },

  pause: () => {
    const st = get();
    wantsToPlay = false;
    loadRequestId++;
    suppressPauseUntilMs = Date.now() + 800;
    if (sharedAudio) {
      try {
        sharedAudio.pause();
      } catch (e) {}
    }
    clearAllListenInterruptions();
    set({
      isPlaying: false,
      isLoading: false,
      hasFloatingSession: false,
      isPausedByInterruption: false,
    });
    st.persistProgressNow();
    syncMediaSessionAndNativeService(get, false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voice-control-resume'));
    }
  },

  seek: (time: number) => {
    const audio = ensureSharedAudio(get, set);
    const st = get();
    const clamped = Math.max(0, time);
    pendingInitialSeekTime = 0;
    if (audio.src && isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.min(clamped, audio.duration);
    } else {
      pendingInitialSeekTime = clamped;
    }
    set({ currentTime: clamped });
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: st.surahNumber,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      currentTime: clamped,
      duration: isFinite(audio.duration) && audio.duration > 0 ? audio.duration : st.duration,
    });
  },

  setPlaybackRate: (rate: number) => {
    const safeRate = normalizePlaybackRate(rate);
    const st = get();
    const audio = ensureSharedAudio(get, set);
    applyAudioPlaybackRate(audio, safeRate);
    set({ playbackRate: safeRate });
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: st.surahNumber,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      playbackRate: safeRate,
    });
  },

  nextSurah: (forceAutoPlay?: boolean) => {
    const st = get();
    const available = st.getAvailableSurahs(st.reciterId);
    const currentIndex = available.indexOf(st.surahNumber);
    const nextNum =
      currentIndex !== -1 && currentIndex < available.length - 1
        ? available[currentIndex + 1]
        : available[0] || 1;
    const shouldPlay =
      typeof forceAutoPlay === 'boolean'
        ? forceAutoPlay
        : st.isPlaying || wantsToPlay || Boolean(sharedAudio && !sharedAudio.paused && !sharedAudio.ended);

    pendingInitialSeekTime = 0;
    set({
      surahNumber: nextNum,
      currentTime: 0,
      duration: 0,
      error: '',
      ...(shouldPlay ? { isPlaying: true, hasFloatingSession: true, isPausedByInterruption: false } : {}),
    });
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: nextNum,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      currentTime: 0,
      duration: 0,
    });
    loadAudioTrack(st.reciterId, nextNum, shouldPlay, get, set);
  },

  prevSurah: (forceAutoPlay?: boolean) => {
    const st = get();
    const available = st.getAvailableSurahs(st.reciterId);
    const currentIndex = available.indexOf(st.surahNumber);
    const prevNum =
      currentIndex !== -1 && currentIndex > 0
        ? available[currentIndex - 1]
        : available[available.length - 1] || 114;
    const shouldPlay =
      typeof forceAutoPlay === 'boolean'
        ? forceAutoPlay
        : st.isPlaying || wantsToPlay || Boolean(sharedAudio && !sharedAudio.paused && !sharedAudio.ended);

    pendingInitialSeekTime = 0;
    set({
      surahNumber: prevNum,
      currentTime: 0,
      duration: 0,
      error: '',
      ...(shouldPlay ? { isPlaying: true, hasFloatingSession: true, isPausedByInterruption: false } : {}),
    });
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: prevNum,
      isContinuousPlay: st.isContinuousPlay,
      isRepeatSurah: st.isRepeatSurah,
      currentTime: 0,
      duration: 0,
    });
    loadAudioTrack(st.reciterId, prevNum, shouldPlay, get, set);
  },

  toggleContinuousPlay: () => {
    const st = get();
    const nextContinuous = !st.isContinuousPlay;
    const nextRepeat = nextContinuous ? false : st.isRepeatSurah;
    set({ isContinuousPlay: nextContinuous, isRepeatSurah: nextRepeat });
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: st.surahNumber,
      isContinuousPlay: nextContinuous,
      isRepeatSurah: nextRepeat,
      currentTime: st.currentTime,
      duration: st.duration,
    });
  },

  toggleRepeatSurah: () => {
    const st = get();
    const nextRepeat = !st.isRepeatSurah;
    const nextContinuous = nextRepeat ? false : st.isContinuousPlay;
    set({ isRepeatSurah: nextRepeat, isContinuousPlay: nextContinuous });
    writePersistedState({
      reciterId: st.reciterId,
      surahNumber: st.surahNumber,
      isContinuousPlay: nextContinuous,
      isRepeatSurah: nextRepeat,
      currentTime: st.currentTime,
      duration: st.duration,
    });
  },

  setPresetTimer: (minutes: number) => {
    set({
      customTimerMinutes: minutes,
      sleepTimerMode: String(minutes) as SleepTimerMode,
      sleepTimerRemainingSeconds: minutes * 60,
      isSleepTimerActive: true,
    });
    ensureSleepInterval(get, set);
  },

  setEndOfSurahTimer: () => {
    stopSleepInterval();
    set({
      sleepTimerMode: 'end_of_surah',
      sleepTimerRemainingSeconds: null,
      isSleepTimerActive: true,
    });
  },

  startCustomTimer: () => {
    const mins = get().customTimerMinutes;
    set({
      sleepTimerMode: 'custom',
      sleepTimerRemainingSeconds: mins * 60,
      isSleepTimerActive: true,
    });
    ensureSleepInterval(get, set);
  },

  cancelSleepTimer: () => {
    stopSleepInterval();
    set({
      isSleepTimerActive: false,
      sleepTimerMode: 'off',
      sleepTimerRemainingSeconds: null,
    });
  },

  incrementTimer: () => {
    const st = get();
    if (st.isSleepTimerActive && st.sleepTimerRemainingSeconds !== null) {
      set({ sleepTimerRemainingSeconds: st.sleepTimerRemainingSeconds + 300 });
    } else {
      set({ customTimerMinutes: Math.min(180, st.customTimerMinutes + 5) });
    }
  },

  decrementTimer: () => {
    const st = get();
    if (st.isSleepTimerActive && st.sleepTimerRemainingSeconds !== null) {
      if (st.sleepTimerRemainingSeconds > 300) {
        set({ sleepTimerRemainingSeconds: Math.max(60, st.sleepTimerRemainingSeconds - 300) });
      } else if (st.sleepTimerRemainingSeconds > 60) {
        set({ sleepTimerRemainingSeconds: 60 });
      }
    } else {
      set({ customTimerMinutes: Math.max(5, st.customTimerMinutes - 5) });
    }
  },
}));
