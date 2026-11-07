import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { RECITERS, SURAH_LIST } from '../../data/listenQuranData';
import { getReciterDisplayName, getSurahDisplayName, formatListenTime } from '../../utils/listenQuranTranslations';
import { SURAH_INFO } from '../QuranReader/constants';

interface ListenQuranCardProps {
  onNavigate: (pageId: string, params?: any) => void;
}

const STORAGE_KEY = 'listen_quran_state_v7';

export const ListenQuranCard: React.FC<ListenQuranCardProps> = ({ onNavigate }) => {
  const { language, isRTL, dir, formatNumber } = useLanguage();
  const { theme, themeKey } = useTheme();
  const isEn = language === 'en';

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const primaryColor = isBlackTheme ? '#10b981' : (theme.palette?.[0] || '#059669');

  const [reciterId, setReciterId] = useState<string>(RECITERS[0].id);
  const [surahNumber, setSurahNumber] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved reciter and surah from localStorage
  useEffect(() => {
    const loadState = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.savedReciterId) setReciterId(parsed.savedReciterId);
          if (parsed.savedSurahNumber) setSurahNumber(parsed.savedSurahNumber);
        }
      } catch (e) {}
    };

    loadState();
    window.addEventListener('storage', loadState);
    return () => window.removeEventListener('storage', loadState);
  }, []);

  // Save current selection to localStorage
  const saveState = (newSurahNumber: number) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.savedReciterId = reciterId;
      parsed.savedSurahNumber = newSurahNumber;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {}
  };

  // Compute Audio URL
  const currentReciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
  const reciterName = getReciterDisplayName(currentReciter.id, currentReciter.name, language);
  const surahName = getSurahDisplayName(surahNumber, language);
  const totalAyahs = SURAH_INFO[surahNumber]?.ayahs || 7;

  // Calculate current Ayah dynamically based on playback time/progress
  const currentAyah = duration > 0 && currentTime > 0
    ? Math.min(totalAyahs, Math.max(1, Math.ceil((currentTime / duration) * totalAyahs)))
    : 1;

  const surahFormatted = String(surahNumber).padStart(3, '0');
  const baseUrl = reciterId.endsWith('/') ? reciterId.slice(0, -1) : reciterId;
  const audioUrl = `${baseUrl}/${surahFormatted}.mp3`;

  // Attach audio handlers
  const setupAudio = (url: string, autoPlay: boolean = false) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    audio.onloadedmetadata = () => {
      if (audio.duration) setDuration(audio.duration);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    if (autoPlay) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Audio autoPlay error in card:', err);
        setIsPlaying(false);
      });
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current || audioRef.current.src !== audioUrl) {
      setupAudio(audioUrl, true);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Audio play error in card:', err);
      });
    }
  };

  const handleNextSurah = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSurah = surahNumber >= 114 ? 1 : surahNumber + 1;
    setSurahNumber(nextSurah);
    saveState(nextSurah);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    const nextFormatted = String(nextSurah).padStart(3, '0');
    const nextUrl = `${baseUrl}/${nextFormatted}.mp3`;
    setupAudio(nextUrl, isPlaying);
  };

  const handlePrevSurah = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevSurah = surahNumber <= 1 ? 114 : surahNumber - 1;
    setSurahNumber(prevSurah);
    saveState(prevSurah);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    const prevFormatted = String(prevSurah).padStart(3, '0');
    const prevUrl = `${baseUrl}/${prevFormatted}.mp3`;
    setupAudio(prevUrl, isPlaying);
  };

  const handleOpenPlayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate('listen', { reciterId, surahNumber });
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="listen-quran-card"
      dir={dir}
      className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all duration-300 relative"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex flex-col text-start min-w-0">
            <span className="card-header-title text-xs sm:text-sm font-black truncate font-cairo" style={{ color: (isBlackTheme) ? '#FFFFFF' : '#451A03' }}>
              {isEn ? 'Audio Quran Recitation' : 'الاستماع للقرآن الكريم'}
            </span>
            <span className="text-xs font-medium leading-tight opacity-80 mt-0.5 truncate" style={{ color: (isBlackTheme) ? '#FDE68A' : '#5B2605' }}>
              {reciterName}
            </span>
          </div>
        </div>

        {/* Action Controls: Play/Pause Button + Open Player Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1. Play/Pause Button (Flat solid orange #c25e00 with text only) */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="px-3.5 py-1.5 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 active:scale-95 transition-all bg-[#c25e00] text-white shadow-none border-none cursor-pointer hover:bg-[#a85200]"
            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', backgroundColor: '#c25e00' }}
            title={isPlaying ? (isEn ? 'Pause' : 'إيقاف مؤقت') : (isEn ? 'Play' : 'تشغيل التلاوة')}
          >
            <span className="text-[11px] text-white font-extrabold" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
              {isPlaying ? (isEn ? 'Pause' : 'إيقاف مؤقت') : (isEn ? 'Play' : 'تشغيل')}
            </span>
          </button>

          {/* 2. Open Player Button */}
          <button
            type="button"
            onClick={handleOpenPlayer}
            className="px-3.5 py-1.5 rounded-full font-extrabold text-xs flex items-center justify-center gap-1 shrink-0 active:scale-95 transition-all bg-[#c25e00] text-white shadow-none border-none cursor-pointer hover:bg-[#a85200]"
            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', backgroundColor: '#c25e00' }}
            title={isEn ? 'Open Player' : 'فتح المشغل'}
          >
            <span className="text-[11px] text-white font-extrabold" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
              {isEn ? 'Open Player' : 'فتح المشغل'}
            </span>
            {isRTL ? (
              <ChevronLeft className="w-3.5 h-3.5 text-white stroke-[2.5]" style={{ color: '#ffffff', stroke: '#ffffff' }} />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-white stroke-[2.5]" style={{ color: '#ffffff', stroke: '#ffffff' }} />
            )}
          </button>
        </div>
      </div>

      {/* Surah Details Banner & Inner Controls (Time in Center when playing, Prev/Next buttons pinned to Left) */}
      <div className={`p-3 rounded-xl flex items-center justify-between border relative min-h-[58px] ${
        isBlackTheme ? 'bg-zinc-800/80 border-zinc-700/80' : 'bg-white/60 border-amber-200/60'
      }`}>
        {/* Right side (RTL): Surah Name & Dynamic Ayah / Surah number */}
        <div className="flex items-center gap-2 min-w-0 z-10">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-start min-w-0">
            <span className="text-xs font-bold leading-snug truncate" style={{ color: (isBlackTheme) ? '#FFFFFF' : '#451A03' }}>
              {surahName}
            </span>
            <span className="text-[10px] opacity-80 font-medium truncate" style={{ color: (isBlackTheme) ? '#A1A1AA' : '#78350F' }}>
              {(isPlaying || currentTime > 0) ? (
                isEn ? `الآية رقم (${formatNumber(currentAyah)})` : `الآية رقم (${formatNumber(currentAyah)})`
              ) : (
                isEn ? `Surah No. ${formatNumber(surahNumber)}` : `سورة رقم ${formatNumber(surahNumber)}`
              )}
            </span>
          </div>
        </div>

        {/* Center: Enlarged Time Counter when playing or paused */}
        {(isPlaying || currentTime > 0 || duration > 0) && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none">
            <div 
              className="flex items-center justify-center text-xs sm:text-[13px] font-mono font-black px-2.5 py-1 rounded-lg dir-ltr shrink-0 shadow-2xs"
              style={{
                backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.2)' : `${primaryColor}15`,
                color: primaryColor
              }}
            >
              <span className="tracking-tight">
                {formatListenTime(currentTime, language)} / {formatListenTime(duration, language)}
              </span>
            </div>
          </div>
        )}

        {/* Left side (RTL): Previous & Next Surah Buttons permanently fixed on the left */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ms-auto z-10">
          {/* Next Surah Button (In RTL, clicking next advances to the next surah) */}
          <button
            type="button"
            onClick={handleNextSurah}
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all bg-[#c25e00] text-white shadow-none border-none cursor-pointer hover:bg-[#a85200]"
            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', backgroundColor: '#c25e00' }}
            title={isEn ? 'Next Surah' : 'السورة التالية'}
            aria-label={isEn ? 'Next Surah' : 'السورة التالية'}
          >
            {isRTL ? (
              <SkipBack className="w-3.5 h-3.5 text-white fill-white" />
            ) : (
              <SkipForward className="w-3.5 h-3.5 text-white fill-white" />
            )}
          </button>

          {/* Previous Surah Button */}
          <button
            type="button"
            onClick={handlePrevSurah}
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all bg-[#c25e00] text-white shadow-none border-none cursor-pointer hover:bg-[#a85200]"
            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', backgroundColor: '#c25e00' }}
            title={isEn ? 'Previous Surah' : 'السورة السابقة'}
            aria-label={isEn ? 'Previous Surah' : 'السورة السابقة'}
          >
            {isRTL ? (
              <SkipForward className="w-3.5 h-3.5 text-white fill-white" />
            ) : (
              <SkipBack className="w-3.5 h-3.5 text-white fill-white" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar (when playing or paused with progress) */}
      {(isPlaying || progress > 0) && (
        <div className="w-full mt-2.5">
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: primaryColor }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenQuranCard;

