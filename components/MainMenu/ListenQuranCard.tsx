import React, { useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { RECITERS } from '../../data/listenQuranData';
import { getReciterDisplayName, getSurahDisplayName, formatListenTime } from '../../utils/listenQuranTranslations';
import { estimateCurrentAyahAndJuz } from '../../utils/listenQuranUtils';
import { SURAH_INFO } from '../QuranReader/constants';
import { useListenQuranStore } from '../../hooks/useListenQuranStore';

interface ListenQuranCardProps {
  onNavigate: (pageId: string, params?: any) => void;
}

export const ListenQuranCard: React.FC<ListenQuranCardProps> = ({ onNavigate }) => {
  const { language, isRTL, dir, formatNumber } = useLanguage();
  const { theme, themeKey, isNightMode } = useTheme();
  const isEn = language === 'en';

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const isDark = isNightMode || isBlackTheme;
  const primaryColor = isDark ? '#10b981' : (theme.palette?.[0] || '#059669');

  const {
    reciterId,
    surahNumber,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    initAudio,
    fetchReciterSurahs,
    togglePlay,
    nextSurah,
    prevSurah,
  } = useListenQuranStore();

  useEffect(() => {
    initAudio();
    fetchReciterSurahs();
  }, [initAudio, fetchReciterSurahs]);

  const currentReciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
  const reciterName = getReciterDisplayName(currentReciter.id, currentReciter.name, language);
  const surahName = getSurahDisplayName(surahNumber, language);
  const surahMeta = SURAH_INFO[surahNumber] || { ayahs: 7, type: 'مكية' };
  const totalAyahs = surahMeta.ayahs;
  const revelationType = isEn
    ? (surahMeta.type === 'مدنية' ? 'Medinan' : 'Meccan')
    : surahMeta.type;

  const displayFullSurahName = isEn
    ? (surahName.toLowerCase().startsWith('surah') ? surahName : `Surah ${surahName}`)
    : (surahName.startsWith('سورة') ? surahName : `سورة ${surahName}`);

  const { ayahNumber: currentAyah, juzNumber: currentJuz } = useMemo(
    () => estimateCurrentAyahAndJuz(surahNumber, currentTime, duration),
    [surahNumber, currentTime, duration]
  );

  // Subtitle: الآية الحالية، رقم السورة، عدد الآيات، الجزء الحالي قبل مكية/مدنية
  const surahSubtitle = (isPlaying || currentTime > 0)
    ? (isEn
        ? `Ayah ${formatNumber(currentAyah)}/${formatNumber(totalAyahs)} • No. ${formatNumber(surahNumber)} • Juz ${formatNumber(currentJuz)} • ${revelationType}`
        : `الآية (${formatNumber(currentAyah)}) • سورة رقم ${formatNumber(surahNumber)} • ${formatNumber(totalAyahs)} ${totalAyahs <= 10 ? 'آيات' : 'آية'} • الجزء ${formatNumber(currentJuz)} • ${revelationType}`)
    : (isEn
        ? `Surah No. ${formatNumber(surahNumber)} • ${formatNumber(totalAyahs)} Verses • Juz ${formatNumber(currentJuz)} • ${revelationType}`
        : `سورة رقم ${formatNumber(surahNumber)} • ${formatNumber(totalAyahs)} ${totalAyahs <= 10 ? 'آيات' : 'آية'} • الجزء ${formatNumber(currentJuz)} • ${revelationType}`);

  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  const handleNextSurah = (e: React.MouseEvent) => {
    e.stopPropagation();
    nextSurah();
  };

  const handlePrevSurah = (e: React.MouseEvent) => {
    e.stopPropagation();
    prevSurah();
  };

  const handleOpenPlayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate('listen', { reciterId, surahNumber });
  };

  const showProgressRow = isPlaying || currentTime > 0 || duration > 0 || progress > 0;

  return (
    <div
      id="listen-quran-card"
      dir={dir}
      className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all duration-300 relative"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between w-full mb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex flex-col text-start min-w-0">
            <span className="card-header-title text-xs sm:text-sm font-black truncate font-cairo" style={{ color: (isDark) ? '#FFFFFF' : '#451A03' }}>
              {isEn ? 'Audio Quran Recitation' : 'الاستماع للقرآن'}
            </span>
            <span className="text-xs font-bold leading-tight mt-0.5 truncate" style={{ color: (isDark) ? '#FDE68A' : '#5B2605' }}>
              {reciterName}
            </span>
          </div>
        </div>

        {/* Action Controls: Play/Pause Button + Open Player Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1. Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-none border-none cursor-pointer ${
              isDark ? 'night-white-surface bg-white text-black font-extrabold' : 'bg-[#c25e00] text-white hover:bg-[#a85200]'
            }`}
            style={{
              color: isDark ? '#000000' : '#ffffff',
              WebkitTextFillColor: isDark ? '#000000' : '#ffffff',
              backgroundColor: isDark ? '#ffffff' : '#c25e00'
            }}
            title={isPlaying ? (isEn ? 'Pause' : 'إيقاف مؤقت') : (isEn ? 'Play' : 'تشغيل التلاوة')}
          >
            <span
              className={`text-[11px] font-extrabold ${isDark ? 'text-black' : 'text-white'}`}
              style={{ color: isDark ? '#000000' : '#ffffff', WebkitTextFillColor: isDark ? '#000000' : '#ffffff' }}
            >
              {isPlaying
                ? (isEn ? 'Pause' : 'إيقاف مؤقت')
                : (isLoading && !isPlaying ? (isEn ? 'Loading...' : 'جاري التحميل...') : (isEn ? 'Play' : 'تشغيل'))}
            </span>
          </button>

          {/* 2. Open Player Button */}
          <button
            type="button"
            onClick={handleOpenPlayer}
            className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs flex items-center justify-center gap-1 shrink-0 active:scale-95 transition-all shadow-none border-none cursor-pointer ${
              isDark ? 'night-white-surface bg-white text-black font-extrabold' : 'bg-[#c25e00] text-white hover:bg-[#a85200]'
            }`}
            style={{
              color: isDark ? '#000000' : '#ffffff',
              WebkitTextFillColor: isDark ? '#000000' : '#ffffff',
              backgroundColor: isDark ? '#ffffff' : '#c25e00'
            }}
            title={isEn ? 'Listen to Quran' : 'الاستماع للقرآن'}
          >
            <span
              className={`text-[11px] font-extrabold ${isDark ? 'text-black' : 'text-white'}`}
              style={{ color: isDark ? '#000000' : '#ffffff', WebkitTextFillColor: isDark ? '#000000' : '#ffffff' }}
            >
              {isEn ? 'Listen to Quran' : 'الاستماع للقرآن'}
            </span>
            {isRTL ? (
              <ChevronLeft
                className="w-3.5 h-3.5 stroke-[2.5]"
                style={{ color: isDark ? '#000000' : '#ffffff', stroke: isDark ? '#000000' : '#ffffff' }}
              />
            ) : (
              <ChevronRight
                className="w-3.5 h-3.5 stroke-[2.5]"
                style={{ color: isDark ? '#000000' : '#ffffff', stroke: isDark ? '#000000' : '#ffffff' }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Surah Details Banner & Inner Controls (Flex layout without overlapping absolute elements) */}
      <div className={`p-3 rounded-xl flex items-center justify-between gap-3 border min-h-[58px] ${
        isDark ? 'bg-zinc-800/80 border-zinc-700/80' : 'bg-white/60 border-amber-200/60'
      }`}>
        {/* Right side (RTL): Surah Name & Dynamic Ayah / Juz / Surah metadata */}
        <div className="flex flex-col text-start min-w-0 flex-1">
          <span className="text-xs sm:text-[13px] font-bold leading-snug truncate" style={{ color: (isDark) ? '#FFFFFF' : '#451A03' }}>
            {displayFullSurahName}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold leading-snug break-words" style={{ color: (isDark) ? '#A1A1AA' : '#78350F' }}>
            {surahSubtitle}
          </span>
        </div>

        {/* Left side (RTL): Navigation Buttons (Left = Next Surah |◀, Right = Previous Surah ▶|) */}
        <div
          dir="ltr"
          className="surah-nav-buttons flex items-center gap-1.5 sm:gap-2 shrink-0 border-0 border-none outline-none ring-0 shadow-none bg-transparent p-0 m-0"
          style={{ border: 'none', outline: 'none', boxShadow: 'none', background: 'transparent' }}
        >
          {/* 1. Next Surah Button on the LEFT (Points LEFT |◀) */}
          <button
            type="button"
            onClick={handleNextSurah}
            className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all border-0 border-none outline-none focus:outline-none focus:ring-0 shadow-none cursor-pointer ${
              isDark ? 'night-white-surface bg-white text-black' : 'bg-[#c25e00] text-white hover:bg-[#a85200]'
            }`}
            style={{
              color: isDark ? '#000000' : '#ffffff',
              WebkitTextFillColor: isDark ? '#000000' : '#ffffff',
              backgroundColor: isDark ? '#ffffff' : '#c25e00',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
            title={isEn ? 'Next Surah' : 'السورة التالية'}
            aria-label={isEn ? 'Next Surah' : 'السورة التالية'}
          >
            <SkipBack
              className="w-3.5 h-3.5 stroke-[2.2]"
              style={{
                color: isDark ? '#000000' : '#ffffff',
                fill: isDark ? '#000000' : '#ffffff',
                stroke: isDark ? '#000000' : '#ffffff'
              }}
            />
          </button>

          {/* 2. Previous Surah Button on the RIGHT (Points RIGHT ▶|) */}
          <button
            type="button"
            onClick={handlePrevSurah}
            className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all border-0 border-none outline-none focus:outline-none focus:ring-0 shadow-none cursor-pointer ${
              isDark ? 'night-white-surface bg-white text-black' : 'bg-[#c25e00] text-white hover:bg-[#a85200]'
            }`}
            style={{
              color: isDark ? '#000000' : '#ffffff',
              WebkitTextFillColor: isDark ? '#000000' : '#ffffff',
              backgroundColor: isDark ? '#ffffff' : '#c25e00',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
            title={isEn ? 'Previous Surah' : 'السورة السابقة'}
            aria-label={isEn ? 'Previous Surah' : 'السورة السابقة'}
          >
            <SkipForward
              className="w-3.5 h-3.5 stroke-[2.2]"
              style={{
                color: isDark ? '#000000' : '#ffffff',
                fill: isDark ? '#000000' : '#ffffff',
                stroke: isDark ? '#000000' : '#ffffff'
              }}
            />
          </button>
        </div>
      </div>

      {/* Progress Bar & Time Counter Row (cleanly separated, never overlaps text) */}
      {showProgressRow && (
        <div className="w-full mt-2.5 flex items-center gap-2.5">
          <div className="flex-1 min-w-0 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: primaryColor }}
            />
          </div>
          <div
            className="flex items-center justify-center text-[11px] sm:text-xs font-mono font-black px-2.5 py-0.5 rounded-lg dir-ltr shrink-0 shadow-2xs"
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : `${primaryColor}15`,
              color: primaryColor
            }}
          >
            <span className="tracking-tight whitespace-nowrap">
              {formatListenTime(currentTime, language)} / {formatListenTime(duration, language)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenQuranCard;
