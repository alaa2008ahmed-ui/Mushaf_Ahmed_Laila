import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowRight, Play, Pause, RotateCcw, Volume2, Mic, MicOff, Eye, EyeOff, 
  HelpCircle, BookOpen, Brain, CheckCircle2, ChevronRight, ChevronLeft, 
  FastForward, Settings2, Sparkles, BookMarked, Trophy
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAyahsInRange, AyahPointer, normalizeForSpeechMatch } from '../utils/quranMemorizationUtils';
import { SURAH_NAMES_AR, MEMORIZATION_READERS } from '../components/QuranReader/constants';
import { SURAH_NAMES_EN } from './Memorization';
import { registerBackInterceptor } from '../hooks/useBackButton';
import MemorizationQuizModal from '../components/Memorization/MemorizationQuizModal';
import MemorizationPreviewModal from '../components/Memorization/MemorizationPreviewModal';
import { memorizationService, MasteryLevel } from '../services/memorizationService';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Haptics, NotificationType } from '@capacitor/haptics';

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

  // Self Voice Recording
  const [isRecordingSelf, setIsRecordingSelf] = useState(false);
  const [selfAudioUrl, setSelfAudioUrl] = useState<string | null>(null);
  const [isPlayingSelf, setIsPlayingSelf] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Modals
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showTafseerModal, setShowTafseerModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Audio elements
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<any>(null);
  const peekTimerRef = useRef<any>(null);

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
  }, [showQuizModal, showTafseerModal, showCompletionModal, handleExit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
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

  useEffect(() => {
    currentRangeRepeatRef.current = currentRangeRepeat;
  }, [currentRangeRepeat]);

  // Audio progression logic (with ayah repeat, range repeat, and completion modal)
  const handleAdvanceAfterAudio = useCallback(() => {
    const cAyahRepeat = currentAyahRepeatRef.current;
    const cIndex = currentIndexRef.current;
    const cRangeRepeat = currentRangeRepeatRef.current;
    const totalAyahs = ayahs.length;

    // 1. Ayah Repeat Check
    if (cAyahRepeat < ayahRepeatTarget) {
      const nextAyahRepeat = cAyahRepeat + 1;
      currentAyahRepeatRef.current = nextAyahRepeat;
      setCurrentAyahRepeat(nextAyahRepeat);
      playAyah(cIndex);
      return;
    }

    // Reset ayah repeat for next ayah
    currentAyahRepeatRef.current = 1;
    setCurrentAyahRepeat(1);

    // 2. Next Ayah or Range Loop
    if (cIndex < totalAyahs - 1) {
      const nextIndex = cIndex + 1;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      playAyah(nextIndex);
    } else {
      // Completed full range
      if (cRangeRepeat < rangeRepeatTarget) {
        const nextRangeRepeat = cRangeRepeat + 1;
        currentRangeRepeatRef.current = nextRangeRepeat;
        setCurrentRangeRepeat(nextRangeRepeat);
        currentIndexRef.current = 0;
        setCurrentIndex(0);
        playAyah(0);
      } else {
        // ENTIRE SESSION FINISHED: Stop audio completely and show completion modal!
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
        setIsPlaying(false);
        setIsPauseActive(false);

        // Trigger completion modal and celebration chime
        setShowCompletionModal(true);
        try {
          const audio = new Audio('/assets/audio/chime.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
          Haptics.notification({ type: NotificationType.Success }).catch(() => {});
        } catch (e) {}
      }
    }
  }, [ayahRepeatTarget, ayahs.length, rangeRepeatTarget]);

  useEffect(() => {
    handleAdvanceAfterAudioRef.current = handleAdvanceAfterAudio;
  }, [handleAdvanceAfterAudio]);

  // Core Playback Logic
  const playAyah = useCallback((index: number) => {
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
    audio.playbackRate = playbackSpeed;

    audio.onended = () => {
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
    };

    audio.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Autoplay prevented or failed', err);
        setIsPlaying(false);
      });
  }, [ayahs, getAyahAudioUrl, playbackSpeed, pauseSeconds]);

  const togglePlayPause = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
      setIsPlaying(false);
      setIsPauseActive(false);
    } else {
      playAyah(currentIndexRef.current);
    }
  };

  const handleNextAyah = () => {
    if (currentIndexRef.current < ayahs.length - 1) {
      const next = currentIndexRef.current + 1;
      currentIndexRef.current = next;
      setCurrentIndex(next);
      currentAyahRepeatRef.current = 1;
      setCurrentAyahRepeat(1);
      if (isPlaying) playAyah(next);
    }
  };

  const handlePrevAyah = () => {
    if (currentIndexRef.current > 0) {
      const prev = currentIndexRef.current - 1;
      currentIndexRef.current = prev;
      setCurrentIndex(prev);
      currentAyahRepeatRef.current = 1;
      setCurrentAyahRepeat(1);
      if (isPlaying) playAyah(prev);
    }
  };

  // Replay verses from the start
  const handleReplaySession = () => {
    setShowCompletionModal(false);
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    currentAyahRepeatRef.current = 1;
    setCurrentAyahRepeat(1);
    currentRangeRepeatRef.current = 1;
    setCurrentRangeRepeat(1);
    setIsPauseActive(false);
    setTimeout(() => {
      playAyah(0);
    }, 150);
  };

  // Self Voice Recording Toggle
  const toggleSelfRecording = async () => {
    if (isRecordingSelf) {
      // Stop recording
      try {
        if (Capacitor.isNativePlatform()) {
          const res = await VoiceRecorder.stopRecording();
          if (res.value && res.value.recordDataBase64) {
            const url = `data:audio/aac;base64,${res.value.recordDataBase64}`;
            setSelfAudioUrl(url);
          }
        } else if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.warn('Stop recording failed', e);
      }
      setIsRecordingSelf(false);
    } else {
      // Start recording
      setSelfAudioUrl(null);
      try {
        if (Capacitor.isNativePlatform()) {
          const perm = await VoiceRecorder.hasAudioRecordingPermission();
          if (!perm.value) {
            await VoiceRecorder.requestAudioRecordingPermission();
          }
          await VoiceRecorder.startRecording();
          setIsRecordingSelf(true);
        } else {
          // Browser MediaRecorder
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mr = new MediaRecorder(stream);
          audioChunksRef.current = [];
          mr.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mr.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setSelfAudioUrl(url);
            stream.getTracks().forEach(t => t.stop());
          };
          mr.start();
          mediaRecorderRef.current = mr;
          setIsRecordingSelf(true);
        }
      } catch (e) {
        console.warn('Start recording failed', e);
        alert(isEn ? 'Microphone permission needed to record' : 'يلزم إذن المايكروفون للتسجيل الذاتي');
      }
    }
  };

  const playSelfAudio = () => {
    if (!selfAudioUrl) return;
    const aud = new Audio(selfAudioUrl);
    setIsPlayingSelf(true);
    aud.onended = () => setIsPlayingSelf(false);
    aud.play();
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
      className="h-screen flex flex-col select-none overflow-hidden" 
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
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)'
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

        {/* Right Tools: Quiz, Tafseer */}
        <div className="flex items-center gap-1.5">
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

      {/* Recitation Pause Indicator */}
      {isPauseActive && (
        <div 
          className="shrink-0 py-2 px-4 flex items-center justify-center gap-2 animate-pulse text-xs font-bold"
          style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
        >
          <Volume2 size={16} />
          <span>
            {isEn ? `Your turn to recite! (${pauseCountdown}s)` : `حان دورك للترديد بصوتك! (${pauseCountdown} ثوانٍ)`}
          </span>
        </div>
      )}

      {/* Main Quran Verse Canvas */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-xl mx-auto w-full hide-scrollbar">
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
                <span className="font-bold">
                  {isEn ? SURAH_NAMES_EN[ayah.surahNumber - 1] : SURAH_NAMES_AR[ayah.surahNumber - 1]} - {isEn ? `Ayah ${ayah.ayahNumber}` : `الآية ${ayah.ayahNumber}`}
                </span>
                {isActive && (
                  <span 
                    className="font-bold text-[11px] px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    {isEn ? `Repeat ${currentAyahRepeat}/${ayahRepeatTarget}` : `تكرار ${currentAyahRepeat} من ${ayahRepeatTarget}`}
                  </span>
                )}
              </div>

              {/* Words with Masking Logic */}
              <div 
                className="text-xl sm:text-2xl leading-[2.5] text-right font-serif select-none" 
                style={{ fontFamily: "'Amiri', 'Amiri Quran', serif" }}
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
                        className="inline-block mx-1 px-3 py-0.5 rounded-lg select-none cursor-pointer transition-all filter blur-[4px] hover:blur-none"
                        style={{
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

                  return (
                    <span 
                      key={wIdx} 
                      className={`inline ${isPeeked ? 'text-amber-500 font-bold underline decoration-amber-500' : ''}`}
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

        <div className="h-28 shrink-0"></div>
      </main>

      {/* Floating Bottom Control Dock - Theme matched, no dark overlay */}
      <footer 
        className="shrink-0 px-3 pt-3 sm:px-4 sm:pt-4 z-20 transition-colors"
        style={{ 
          backgroundColor: footerBg,
          borderTop: theme.barBorder || (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)'),
          paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 12px) + 0.75rem)'
        }}
      >
        <div className="max-w-md mx-auto space-y-3">
          {/* Progress Counters & Self Audio Player */}
          <div className="flex items-center justify-between text-xs px-2 font-bold opacity-80" style={{ color: pageTextColor }}>
            <div className="flex items-center gap-2">
              <span>
                {isEn ? `Range Repeat: ${currentRangeRepeat}/${rangeRepeatTarget}` : `تكرار النطاق: ${currentRangeRepeat} من ${rangeRepeatTarget}`}
              </span>
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
            {/* Self Recording Button */}
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
              title={isEn ? 'Record Your Voice' : 'سجل صوتك وقارنه بالقارئ'}
            >
              {isRecordingSelf ? <MicOff size={20} /> : <Mic size={20} />}
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

            {/* Speed Toggle */}
            <button
              onClick={() => {
                const nextSpeed = playbackSpeed === 1.0 ? 1.25 : playbackSpeed === 1.25 ? 0.75 : 1.0;
                setPlaybackSpeed(nextSpeed);
                if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
              }}
              className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer border text-[11px] font-black"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                color: pageTextColor
              }}
              title={isEn ? 'Playback Speed' : 'سرعة الصوت'}
            >
              <span>{playbackSpeed}x</span>
            </button>
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
