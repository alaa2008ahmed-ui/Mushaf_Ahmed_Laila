import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
    getSurahDisplayName,
    getReciterDisplayName,
    formatListenNumber,
    formatListenTime,
    formatListenTimerCountdown,
    tListen
} from '../utils/listenQuranTranslations';
import { SURAH_LIST, RECITERS } from '../data/listenQuranData';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import ListenSurahSelectModal from '../components/QuranReader/ListenSurahSelectModal';
import { QuranDownloadModal } from '../components/QuranReader/DownloadModals';
import { SURAH_INFO } from '../components/QuranReader/constants';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { estimateCurrentAyahAndJuz } from '../utils/listenQuranUtils';
import { useListenQuranStore } from '../hooks/useListenQuranStore';
import './QuranReader.css';
import { 
    Play, 
    Pause, 
    SkipBack, 
    SkipForward, 
    RotateCw, 
    Moon, 
    Heart, 
    Download, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    Minus, 
    Trash2, 
    Repeat,
    Gauge
} from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { LISTEN_QURAN_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const mockQuranData = {
    surahs: SURAH_LIST.map(s => ({
        number: s.number,
        name: s.name,
        revelationType: SURAH_INFO[s.number]?.type === 'مكية' ? 'Meccan' : 'Medinan',
        ayahs: new Array(SURAH_INFO[s.number]?.ayahs || 0)
    }))
};

interface ListenFavorite {
    id: string;
    reciterId: string;
    reciterName: string;
    surahNumber: number;
    surahName: string;
    createdAt: number;
}

interface ListenQuranProps {
    onBack: () => void;
    onOpenThemes?: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

function ListenQuran({ onBack, onNavigate }: ListenQuranProps) {
    const { theme, themeKey } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const isEn = language === 'en';
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('listen_quran');
        if (!getGuideSeen('listen_quran_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);

    // --- Dynamic Theme Tokens (Matching MainMenu Design System) ---
    const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || theme.btnBg || '#2E7D5E');
    const pageBgColor = isBlackTheme ? '#000000' : (theme.bgColor || '#F8FAFC');

    const {
        reciterId,
        surahNumber,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        isContinuousPlay,
        isRepeatSurah,
        playbackRate,
        reciterSurahs,
        sleepTimerMode,
        isSleepTimerActive,
        sleepTimerRemainingSeconds,
        customTimerMinutes,
        initAudio,
        fetchReciterSurahs,
        getAvailableSurahs,
        setReciterId,
        setSurahNumber,
        setReciterAndSurah,
        togglePlay,
        seek,
        setPlaybackRate,
        nextSurah,
        prevSurah,
        toggleContinuousPlay,
        toggleRepeatSurah,
        setPresetTimer,
        setEndOfSurahTimer,
        startCustomTimer,
        cancelSleepTimer,
        incrementTimer,
        decrementTimer,
    } = useListenQuranStore();

    const [showReciterModal, setShowReciterModal] = useState(false);
    const [showSurahModal, setShowSurahModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    useEffect(() => {
        initAudio();
        fetchReciterSurahs();
    }, [initAudio, fetchReciterSurahs]);

    // قائمة المفضلات المحفوظة (حتى 10 تلاوات)
    const [favorites, setFavorites] = useState<ListenFavorite[]>(() => {
        try {
            const saved = localStorage.getItem('listen_quran_favorites_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed.slice(0, 10);
            }
        } catch (e) {
            console.error('Failed to load favorites', e);
        }
        return [];
    });

    useEffect(() => {
        try {
            localStorage.setItem('listen_quran_favorites_v1', JSON.stringify(favorites));
        } catch (e) {
            console.error('Failed to save favorites', e);
        }
    }, [favorites]);

    const availableSurahIds = useMemo(() => {
        return getAvailableSurahs(reciterId);
    }, [reciterId, reciterSurahs, getAvailableSurahs]);

    // Ensure selected surahNumber is valid for current reciter
    useEffect(() => {
        if (availableSurahIds.length > 0 && !availableSurahIds.includes(surahNumber)) {
            setSurahNumber(availableSurahIds[0]);
        }
    }, [availableSurahIds, surahNumber, setSurahNumber]);

    const handleToggleRepeatSurah = () => {
        toggleRepeatSurah();
    };

    const handleToggleContinuousPlay = () => {
        toggleContinuousPlay();
    };

    const handleBack = useCallback(() => {
        if (showReciterModal) { setShowReciterModal(false); }
        else if (showSurahModal) { setShowSurahModal(false); }
        else if (showDownloadModal) { setShowDownloadModal(false); }
        else { onBack(); }
    }, [showReciterModal, showSurahModal, showDownloadModal, onBack]);

    const handleGoHome = useCallback(() => {
        if (showReciterModal) { setShowReciterModal(false); }
        if (showSurahModal) { setShowSurahModal(false); }
        if (showDownloadModal) { setShowDownloadModal(false); }
        onNavigate('home');
    }, [showReciterModal, showSurahModal, showDownloadModal, onNavigate]);

    useEffect(() => {
        const interceptor = () => {
            if (showReciterModal) { setShowReciterModal(false); return true; }
            if (showSurahModal) { setShowSurahModal(false); return true; }
            if (showDownloadModal) { setShowDownloadModal(false); return true; }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [showReciterModal, showSurahModal, showDownloadModal]);

    const handleNextSurah = useCallback(() => {
        nextSurah();
    }, [nextSurah]);

    const handlePrevSurah = useCallback(() => {
        prevSurah();
    }, [prevSurah]);

    // Apply CSS variables for the dynamic theme
    useEffect(() => {
        const root = document.documentElement;
        const t = theme;
        const isDark = !t.bgColor || 
            ['#191D3A', '#0C0A09', '#000000', '#4C1D95', '#7C2D12', '#1E40AF', '#1E1B4B', '#1C1917', '#0B0F19', '#3E2723', '#450A0A', '#064E3B', '#0F766E', '#155E75', '#581C87', '#0F172A', '#2E1065', '#0B0F19', '#022C22'].includes(t.bgColor.toUpperCase());

        root.style.setProperty('--qr-bg', t.bgColor || '#0D1B2A');
        root.style.setProperty('--qr-text', t.textColor);
        root.style.setProperty('--qr-bar-bg', t.barBg || (isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)'));
        root.style.setProperty('--qr-bar-text', t.textColor);
        root.style.setProperty('--qr-bar-border', t.barBorder || 'transparent');
        root.style.setProperty('--qr-btn-bg', primaryColor);
        root.style.setProperty('--qr-btn-text', isBlackTheme ? '#000000' : '#ffffff');
        root.style.setProperty('--qr-accent', primaryColor);
        root.style.setProperty('--qr-accent-text', isBlackTheme ? '#000000' : '#ffffff');
        root.style.setProperty('--qr-modal-bg', t.bgColor || '#0D1B2A');
        root.style.setProperty('--qr-modal-text', t.textColor);
        root.style.setProperty('--qr-header-bg', primaryColor);
        root.style.setProperty('--qr-header-text', isBlackTheme ? '#000000' : '#ffffff');
        root.style.setProperty('--qr-card-bg', isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff');
        root.style.setProperty('--qr-card-text', t.textColor);
        root.style.setProperty('--qr-card-border', isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)');
        root.style.setProperty('--qr-slider-thumb', primaryColor);
    }, [theme, themeKey, primaryColor, isBlackTheme]);

    const handleSetPresetTimer = (minutes: number) => {
        setPresetTimer(minutes);
    };

    const handleSetEndOfSurahTimer = () => {
        setEndOfSurahTimer();
    };

    const handleStartCustomTimer = () => {
        startCustomTimer();
    };

    const handleCancelSleepTimer = () => {
        cancelSleepTimer();
    };

    const handleIncrementTimer = () => {
        incrementTimer();
    };

    const handleDecrementTimer = () => {
        decrementTimer();
    };

    const isCurrentFavorite = useMemo(() => {
        return favorites.some(f => f.reciterId === reciterId && f.surahNumber === surahNumber);
    }, [favorites, reciterId, surahNumber]);

    const handleToggleFavorite = () => {
        const currentReciter = RECITERS.find(r => r.id === reciterId)?.name || RECITERS[0].name;
        const currentSurah = SURAH_LIST.find(s => s.number === surahNumber)?.name || SURAH_LIST[0].name;

        if (isCurrentFavorite) {
            setFavorites(prev => prev.filter(f => !(f.reciterId === reciterId && f.surahNumber === surahNumber)));
        } else {
            if (favorites.length >= 10) return;
            const newFav: ListenFavorite = {
                id: `${reciterId}_${surahNumber}`,
                reciterId,
                reciterName: currentReciter,
                surahNumber,
                surahName: currentSurah,
                createdAt: Date.now()
            };
            setFavorites(prev => [newFav, ...prev]);
        }
    };

    const handleSelectFavorite = (fav: ListenFavorite) => {
        setReciterAndSurah(fav.reciterId, fav.surahNumber);
    };

    const handleRemoveFavorite = (favId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev => prev.filter(f => f.id !== favId));
    };

    const handlePlayPause = async () => {
        await togglePlay();
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        seek(Number(e.target.value));
    };

    const currentReciter = useMemo(() => {
        return RECITERS.find(r => r.id === reciterId) || RECITERS[0];
    }, [reciterId]);
    const reciterName = currentReciter.name;
    const surahName = SURAH_LIST.find(s => s.number === surahNumber)?.name || SURAH_LIST[0].name;
    const surahMeta = SURAH_INFO[surahNumber] || { ayahs: 7, type: 'مكية' };
    const totalAyahs = surahMeta.ayahs;
    const revelationType = isEn
        ? (surahMeta.type === 'مدنية' ? 'Medinan' : 'Meccan')
        : surahMeta.type;

    const { ayahNumber: currentAyah, juzNumber: currentJuz } = useMemo(
        () => estimateCurrentAyahAndJuz(surahNumber, currentTime, duration),
        [surahNumber, currentTime, duration]
    );

    const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

    return (
        <div 
            dir={dir} 
            className="h-[100dvh] flex flex-col font-cairo overflow-hidden select-none" 
            style={{ 
                backgroundColor: pageBgColor, 
                color: isBlackTheme ? '#FFFFFF' : (theme.textColor || '#1E293B') 
            }}
        >
            <header className="app-top-bar shrink-0 relative z-40" style={{ position: 'relative' }} dir={dir}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-between w-full min-h-[44px]">
                        {/* زر الرجوع للخلف وأيقونة المفضلة وزر التفعيل ملاصقة بدون فجوات فارغة */}
                        <div className="flex items-center gap-0 z-10 shrink-0">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-8 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tListen('back', language)}
                                aria-label={tListen('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-lg`}></i>
                            </button>
                            <button
                                id="btn-listen-toggle-fav"
                                type="button"
                                onClick={handleToggleFavorite}
                                className="w-8 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isCurrentFavorite ? tListen('removeFromFavorites', language) : tListen('addToFavorites', language)}
                                aria-label={tListen('favorites', language)}
                            >
                                <Heart 
                                    className={`w-5 h-5 transition-transform duration-200 ${isCurrentFavorite ? 'scale-110 fill-red-500 text-red-500' : 'opacity-70 hover:opacity-100'}`} 
                                    fill={isCurrentFavorite ? 'currentColor' : 'none'}
                                    strokeWidth={isCurrentFavorite ? 1.5 : 2}
                                />
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط مع تباعُد آمن عن الأزرار الجانبية */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <h1 className="app-top-bar__title text-base sm:text-lg font-kufi font-bold truncate px-24 text-center">
                                {tListen('pageTitle', language)}
                            </h1>
                        </div>

                        {/* قفل الثيم وأيقونة المنزل ودليل الاستخدام */}
                        <div className="flex items-center gap-0 z-10 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-8 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={tListen('guide', language)}
                                aria-label={tListen('guide', language)}
                            >
                                <i className="fa-solid fa-circle-question text-base"></i>
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={handleGoHome}
                                className="w-8 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tListen('home', language)}
                                aria-label={tListen('home', language)}
                            >
                                <i className="fa-solid fa-house text-base"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main 
                id="listen-scroll-container" 
                className="w-full max-w-lg mx-auto flex-1 min-h-0 px-4 sm:px-6 pt-4 app-scroll-safe z-10 overflow-y-auto space-y-4"
            >
                {/* 1. مربعات الاختيار (القارئ والسورة) كبطاقات بيضاء ناعمة بظلال مطابقة للرئيسية */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-shrink-0">
                    {/* بطاقة اختيار القارئ */}
                    <button 
                        id="btn-listen-select-reciter"
                        onClick={() => setShowReciterModal(true)} 
                        className={`w-full p-3.5 sm:p-4 rounded-2xl flex items-center justify-between transition-all duration-300 hover:shadow-md active:scale-[0.985] cursor-pointer text-start ${
                            isBlackTheme 
                                ? 'bg-[#18181b] border border-white/10 text-white' 
                                : 'bg-white text-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)]'
                        }`}
                        style={{ borderRadius: '16px' }}
                    >
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-[11px] font-medium leading-tight ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                                {language === 'en' ? 'Reciter' : 'القارئ'}
                            </span>
                            <span className="text-sm sm:text-base font-bold truncate mt-0.5">
                                {getReciterDisplayName(reciterId, reciterName, language)}
                            </span>
                        </div>
                        <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ms-2"
                            style={{ 
                                backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', 
                                color: isBlackTheme ? '#FFFFFF' : '#64748B' 
                            }}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </button>

                    {/* بطاقة اختيار السورة */}
                    <button 
                        id="btn-listen-select-surah"
                        onClick={() => setShowSurahModal(true)} 
                        className={`w-full p-3.5 sm:p-4 rounded-2xl flex items-center justify-between transition-all duration-300 hover:shadow-md active:scale-[0.985] cursor-pointer text-start ${
                            isBlackTheme 
                                ? 'bg-[#18181b] border border-white/10 text-white' 
                                : 'bg-white text-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)]'
                        }`}
                        style={{ borderRadius: '16px' }}
                    >
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-[11px] font-medium leading-tight ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                                {language === 'en' ? 'Surah' : 'السورة'}
                            </span>
                            <span className="text-sm sm:text-base font-bold truncate mt-0.5">
                                {formatListenNumber(surahNumber, language)} - {getSurahDisplayName(surahNumber, surahName, language)}
                            </span>
                        </div>
                        <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ms-2"
                            style={{ 
                                backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', 
                                color: isBlackTheme ? '#FFFFFF' : '#64748B' 
                            }}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </button>
                </div>

                {/* 2. بطاقة مشغل الصوت الرئيسية (Audio Player Card) بتصميم نقي ودعم كامل للألوان الديناميكية */}
                <div 
                    id="listen-player-card"
                    className={`app-page-card border-0 w-full rounded-3xl p-5 sm:p-7 space-y-6 flex-shrink-0 transition-all duration-300 ${
                        isBlackTheme 
                            ? 'bg-[#18181b] text-white' 
                            : 'bg-white text-slate-800'
                    }`}
                    style={{ borderRadius: '20px', border: 'none' }}
                >
                    {/* معلومات التلاوة الحالية في أعلى بطاقة المشغل */}
                    <div className="text-center space-y-1">
                        <div 
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-1"
                            style={{ 
                                backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${primaryColor}14`, 
                                color: primaryColor 
                            }}
                        >
                            <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ backgroundColor: primaryColor }}></span>
                            <span>{getReciterDisplayName(reciterId, reciterName, language)}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold font-kufi tracking-tight">
                            {tListen('surahPrefix', language)} {getSurahDisplayName(surahNumber, surahName, language)}
                        </h2>
                    </div>

                    {/* شريط التقدم: سميك وواضح وأرقام الوقت مكبرة لتسهيل القراءة */}
                    <div className="w-full space-y-2" dir={dir}>
                        <div className="relative flex items-center w-full">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-2.5 sm:h-3 rounded-full appearance-none cursor-pointer quran-slider"
                                style={{ 
                                    background: `linear-gradient(to ${isRTL ? 'left' : 'right'}, ${primaryColor} ${progressPercent}%, ${isBlackTheme ? 'rgba(255,255,255,0.14)' : '#E2E8F0'} ${progressPercent}%)` 
                                }}
                            />
                        </div>
                        {/* أرقام الوقت بخط مكبر وواضح */}
                        <div className="flex justify-between items-center px-1 text-sm sm:text-base font-bold tabular-nums tracking-wide" style={{ color: isBlackTheme ? '#A1A1AA' : '#64748B' }}>
                            <span>{formatListenTime(currentTime, language)}</span>
                            <span>{formatListenTime(duration, language)}</span>
                        </div>
                    </div>

                    {/* أزرار التحكم بالصوت: أيقونات مسطحة عصرية مع زر Play باللون الأساسي الديناميكي */}
                    <div className="flex items-center justify-between px-3 sm:px-8 pt-1">
                        {/* زر السابق: في العربية يظهر على اليمين وأيقونته تشير لليمين ▶| */}
                        <button 
                            type="button"
                            onClick={handlePrevSurah} 
                            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer shadow-xs ${
                                isBlackTheme 
                                    ? 'bg-white/10 hover:bg-white/15 text-white' 
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                            }`}
                            title={tListen('previous', language)}
                            aria-label={tListen('previous', language)}
                        >
                            {isRTL ? (
                                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.3} />
                            ) : (
                                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.3} />
                            )}
                        </button>

                        {/* زر التشغيل والإيقاف الكبير باللون الأساسي للتطبيق */}
                        <button 
                            type="button"
                            onClick={handlePlayPause} 
                            className="w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center active:scale-95 transition-all duration-300 cursor-pointer" 
                            style={{ 
                                backgroundColor: primaryColor, 
                                color: isBlackTheme ? '#000000' : '#FFFFFF',
                                boxShadow: isBlackTheme 
                                    ? '0 10px 25px -4px rgba(255, 255, 255, 0.25)' 
                                    : `0 12px 28px -6px ${primaryColor}66`
                            }}
                            title={isPlaying ? tListen('pause', language) : tListen('play', language)}
                            aria-label={isPlaying ? tListen('pause', language) : tListen('play', language)}
                        >
                            {isPlaying ? (
                                <Pause className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={2.4} />
                            ) : isLoading ? (
                                <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                            ) : (
                                <Play className={`w-8 h-8 sm:w-9 sm:h-9 ${isRTL ? '-translate-x-0.5' : 'translate-x-0.5'}`} strokeWidth={2.4} fill="currentColor" />
                            )}
                        </button>

                        {/* زر التالي: في العربية يظهر على اليسار وأيقونته تشير لليسار |◀ */}
                        <button 
                            type="button"
                            onClick={handleNextSurah} 
                            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer shadow-xs ${
                                isBlackTheme 
                                    ? 'bg-white/10 hover:bg-white/15 text-white' 
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                            }`}
                            title={tListen('next', language)}
                            aria-label={tListen('next', language)}
                        >
                            {isRTL ? (
                                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.3} />
                            ) : (
                                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.3} />
                            )}
                        </button>
                    </div>

                    {/* معلومات الآية الحالية والجزء ونوع السورة تحت أزرار التحكم */}
                    <div className="text-center pt-1">
                        <p className={`text-xs sm:text-sm font-bold ${isBlackTheme ? 'text-zinc-300' : 'text-slate-600'}`}>
                            {isEn
                                ? `Ayah ${formatListenNumber(currentAyah, language)}/${formatListenNumber(totalAyahs, language)} • Juz ${formatListenNumber(currentJuz, language)} • ${revelationType}`
                                : `الآية (${formatListenNumber(currentAyah, language)}) • الجزء ${formatListenNumber(currentJuz, language)} • ${revelationType}`}
                        </p>
                    </div>

                    {/* زر التحكم في سرعة التلاوة (بطيئة 0.50 و 0.75 / أسرع 1.25 و 1.5) */}
                    <div className="pt-1 flex flex-col items-center">
                        <button
                            id="btn-listen-speed"
                            type="button"
                            onClick={() => setShowSpeedMenu(prev => !prev)}
                            aria-expanded={showSpeedMenu}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                                playbackRate !== 1 || showSpeedMenu
                                    ? 'shadow-sm'
                                    : (isBlackTheme
                                        ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white'
                                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700')
                            }`}
                            style={playbackRate !== 1 || showSpeedMenu ? {
                                backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.16)' : `${primaryColor}18`,
                                color: primaryColor,
                                outline: `1.5px solid ${primaryColor}45`
                            } : undefined}
                        >
                            <Gauge className="w-4 h-4 shrink-0" strokeWidth={2.2} />
                            <span>{tListen('playbackSpeed', language)}</span>
                            <span
                                dir="ltr"
                                className="px-2 py-0.5 rounded-full text-[11px] font-extrabold tabular-nums"
                                style={{
                                    backgroundColor: playbackRate !== 1 ? primaryColor : (isBlackTheme ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.08)'),
                                    color: playbackRate !== 1 ? (isBlackTheme ? '#000000' : '#FFFFFF') : (isBlackTheme ? '#FFFFFF' : '#334155')
                                }}
                            >
                                {playbackRate === 0.5 ? '0.50×' : `${playbackRate}×`}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSpeedMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showSpeedMenu && (
                            <div
                                id="listen-speed-menu"
                                className={`mt-3 w-full rounded-2xl p-3 space-y-2.5 ${
                                    isBlackTheme
                                        ? 'bg-white/[0.05] text-white'
                                        : 'bg-slate-50 text-slate-700'
                                }`}
                            >
                                {/* السرعات البطيئة والأسرع */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    {/* سرعات بطيئة: 0.50 و 0.75 فقط */}
                                    <div className="space-y-1.5">
                                        <span className={`block text-[11px] font-bold text-center ${isBlackTheme ? 'text-zinc-400' : 'text-slate-500'}`}>
                                            {tListen('slowerSpeeds', language)}
                                        </span>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {[
                                                { value: 0.5, label: '0.50×' },
                                                { value: 0.75, label: '0.75×' }
                                            ].map(opt => {
                                                const isActive = Math.abs(playbackRate - opt.value) < 0.001;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        dir="ltr"
                                                        onClick={() => {
                                                            setPlaybackRate(opt.value);
                                                            setShowSpeedMenu(false);
                                                        }}
                                                        className={`py-2 px-1 rounded-xl text-xs font-extrabold tabular-nums transition-all duration-150 active:scale-95 cursor-pointer ${
                                                            isActive
                                                                ? 'shadow-sm'
                                                                : (isBlackTheme
                                                                    ? 'bg-white/[0.07] hover:bg-white/[0.12] text-zinc-200'
                                                                    : 'bg-white hover:bg-slate-100 text-slate-700 shadow-2xs')
                                                        }`}
                                                        style={isActive ? {
                                                            backgroundColor: primaryColor,
                                                            color: isBlackTheme ? '#000000' : '#FFFFFF'
                                                        } : undefined}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* سرعات أسرع: 1.25 و 1.5 فقط */}
                                    <div className="space-y-1.5">
                                        <span className={`block text-[11px] font-bold text-center ${isBlackTheme ? 'text-zinc-400' : 'text-slate-500'}`}>
                                            {tListen('fasterSpeeds', language)}
                                        </span>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {[
                                                { value: 1.25, label: '1.25×' },
                                                { value: 1.5, label: '1.5×' }
                                            ].map(opt => {
                                                const isActive = Math.abs(playbackRate - opt.value) < 0.001;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        dir="ltr"
                                                        onClick={() => {
                                                            setPlaybackRate(opt.value);
                                                            setShowSpeedMenu(false);
                                                        }}
                                                        className={`py-2 px-1 rounded-xl text-xs font-extrabold tabular-nums transition-all duration-150 active:scale-95 cursor-pointer ${
                                                            isActive
                                                                ? 'shadow-sm'
                                                                : (isBlackTheme
                                                                    ? 'bg-white/[0.07] hover:bg-white/[0.12] text-zinc-200'
                                                                    : 'bg-white hover:bg-slate-100 text-slate-700 shadow-2xs')
                                                        }`}
                                                        style={isActive ? {
                                                            backgroundColor: primaryColor,
                                                            color: isBlackTheme ? '#000000' : '#FFFFFF'
                                                        } : undefined}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* زر العودة للسرعة العادية 1× */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPlaybackRate(1);
                                        setShowSpeedMenu(false);
                                    }}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 ${
                                        playbackRate === 1
                                            ? 'shadow-sm'
                                            : (isBlackTheme
                                                ? 'bg-white/[0.07] hover:bg-white/[0.12] text-zinc-200'
                                                : 'bg-white hover:bg-slate-100 text-slate-700 shadow-2xs')
                                    }`}
                                    style={playbackRate === 1 ? {
                                        backgroundColor: primaryColor,
                                        color: isBlackTheme ? '#000000' : '#FFFFFF'
                                    } : undefined}
                                >
                                    <span>{tListen('normalSpeed', language)}</span>
                                    <span dir="ltr">(1×)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. بطاقة مؤقت النوم (Sleep Timer) مع رقاقات الوقت (Chips/Tags) بدون حدود سوداء */}
                <div 
                    id="listen-sleep-timer-card"
                    className={`app-page-card border-0 w-full rounded-2xl p-4 sm:p-5 space-y-4 flex-shrink-0 transition-all duration-300 ${
                        isBlackTheme 
                            ? 'bg-[#18181b] text-white' 
                            : 'bg-white text-slate-800'
                    }`}
                    style={{ borderRadius: '16px', border: 'none' }}
                >
                    {/* عنوان ورأس البطاقة */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{ 
                                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${primaryColor}14`, 
                                    color: primaryColor 
                                }}
                            >
                                <Moon className="w-4 h-4" strokeWidth={2.2} />
                            </div>
                            <span className="font-bold text-sm sm:text-base">
                                {tListen('sleepTimer', language)}
                            </span>
                        </div>
                        
                        {/* شارة حالة المؤقت */}
                        {isSleepTimerActive ? (
                            <div className="flex items-center gap-2">
                                <span 
                                    className="text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"
                                    style={{
                                        backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.15)' : `${primaryColor}15`,
                                        color: primaryColor
                                    }}
                                >
                                    <span className="w-2 h-2 rounded-full inline-block animate-ping" style={{ backgroundColor: primaryColor }}></span>
                                    {sleepTimerMode === 'end_of_surah' ? tListen('atEndOfSurah', language) : `${tListen('remaining', language)} ${formatListenTimerCountdown(sleepTimerRemainingSeconds || 0, language)}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCancelSleepTimer}
                                    className="text-xs px-2 py-0.5 rounded-md hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer font-medium"
                                    title={tListen('cancelTimer', language)}
                                >
                                    {tListen('cancel', language)}
                                </button>
                            </div>
                        ) : (
                            <span className={`text-xs font-medium ${isBlackTheme ? 'text-zinc-500' : 'text-slate-400'}`}>
                                {tListen('timerOff', language)}
                            </span>
                        )}
                    </div>

                    {/* خيارات التحديد السريع على شكل رقاقات (Chips/Tags) بدون حدود سوداء */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                        {[
                            { mode: '15', label: tListen('preset15', language), onClick: () => handleSetPresetTimer(15) },
                            { mode: '30', label: tListen('preset30', language), onClick: () => handleSetPresetTimer(30) },
                            { mode: '60', label: tListen('preset60', language), onClick: () => handleSetPresetTimer(60) },
                            { mode: 'end_of_surah', label: tListen('endOfSurah', language), onClick: handleSetEndOfSurahTimer }
                        ].map(chip => {
                            const isActive = isSleepTimerActive && sleepTimerMode === chip.mode;
                            return (
                                <button
                                    key={chip.mode}
                                    type="button"
                                    onClick={chip.onClick}
                                    className={`py-2.5 px-1.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center text-center ${
                                        isActive 
                                            ? 'shadow-sm scale-[1.02]' 
                                            : (isBlackTheme 
                                                ? 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300' 
                                                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600')
                                    }`}
                                    style={isActive ? {
                                        backgroundColor: primaryColor,
                                        color: isBlackTheme ? '#000000' : '#FFFFFF',
                                        boxShadow: `0 4px 14px -2px ${primaryColor}50`
                                    } : undefined}
                                >
                                    <span className="truncate">{chip.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* صف أزرار زيادة ونقصان الوقت (+) و (-) مع زر بدء المؤقت الملون بلون الثيم */}
                    <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            {/* زر إنقاص الوقت (-) */}
                            <button
                                type="button"
                                onClick={handleDecrementTimer}
                                disabled={isSleepTimerActive && sleepTimerMode === 'end_of_surah'}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                                    isBlackTheme ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                                title={tListen('decreaseTimeTooltip', language)}
                                aria-label={tListen('decreaseTimeAria', language)}
                            >
                                <Minus className="w-4 h-4" />
                            </button>

                            {/* عرض الوقت الحالي المحدد أو المتبقي */}
                            <div 
                                className={`px-3 py-1.5 rounded-xl text-center font-bold text-sm min-w-[95px] tabular-nums ${
                                    isBlackTheme ? 'bg-white/[0.06] text-white' : 'bg-slate-50 text-slate-800'
                                }`}
                            >
                                {isSleepTimerActive && sleepTimerRemainingSeconds !== null ? (
                                    <span>{formatListenTimerCountdown(sleepTimerRemainingSeconds, language)}</span>
                                ) : (
                                    <span>{formatListenNumber(customTimerMinutes, language)} {tListen('minShort', language)}</span>
                                )}
                            </div>

                            {/* زر زيادة الوقت (+) */}
                            <button
                                type="button"
                                onClick={handleIncrementTimer}
                                disabled={isSleepTimerActive && sleepTimerMode === 'end_of_surah'}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                                    isBlackTheme ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                                title={tListen('increaseTimeTooltip', language)}
                                aria-label={tListen('increaseTimeAria', language)}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* زر تفعيل أو إلغاء المؤقت: يستخدم لون الثيم الأساسي */}
                        {!isSleepTimerActive ? (
                            <button
                                type="button"
                                onClick={handleStartCustomTimer}
                                className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shadow-sm hover:shadow-md"
                                style={{
                                    backgroundColor: primaryColor,
                                    color: isBlackTheme ? '#000000' : '#FFFFFF',
                                    boxShadow: `0 4px 12px -2px ${primaryColor}40`
                                }}
                            >
                                {tListen('startTimer', language)}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleCancelSleepTimer}
                                className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-red-500/30 text-red-500 hover:bg-red-500/10"
                            >
                                {tListen('stopTimer', language)}
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. بطاقة خيارات التشغيل (Options Card) بدون إطارات سوداء */}
                <div 
                    id="listen-options-card"
                    className={`app-page-card border-0 w-full rounded-2xl p-4 sm:p-5 space-y-4 flex-shrink-0 transition-all duration-300 ${
                        isBlackTheme 
                            ? 'bg-[#18181b] text-white' 
                            : 'bg-white text-slate-800'
                    }`}
                    style={{ borderRadius: '16px', border: 'none' }}
                >
                    {/* خيار تكرار نفس السورة بعد انتهائها */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="repeat-surah-toggle" className="font-bold text-sm flex items-center gap-2.5 cursor-pointer">
                            <div 
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                style={{ 
                                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.08)' : `${primaryColor}14`, 
                                    color: primaryColor 
                                }}
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                            </div>
                            <span>{tListen('repeatSurahToggle', language)}</span>
                        </label>
                        <button
                            id="repeat-surah-toggle"
                            onClick={handleToggleRepeatSurah}
                            className="relative w-12 h-7 rounded-full transition-colors cursor-pointer"
                            style={{ 
                                backgroundColor: isRepeatSurah 
                                    ? primaryColor 
                                    : (isBlackTheme ? '#27272a' : '#E2E8F0')
                            }}
                            aria-checked={isRepeatSurah}
                            role="switch"
                        >
                            <span 
                                className={`absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-in-out ${isRepeatSurah ? (isRTL ? 'right-6' : 'left-6') : (isRTL ? 'right-1' : 'left-1')}`}
                                style={{
                                    backgroundColor: isBlackTheme && isRepeatSurah ? '#000000' : '#FFFFFF'
                                }}
                            ></span>
                        </button>
                    </div>

                    <div className="h-px w-full bg-slate-100 dark:bg-white/5"></div>

                    {/* خيار تشغيل متواصل */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="continuous-play-toggle" className="font-bold text-sm flex items-center gap-2.5 cursor-pointer">
                            <div 
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                style={{ 
                                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.08)' : `${primaryColor}14`, 
                                    color: primaryColor 
                                }}
                            >
                                <Repeat className="w-3.5 h-3.5" />
                            </div>
                            <span>{tListen('continuousPlayToggle', language)}</span>
                        </label>
                        <button
                            id="continuous-play-toggle"
                            onClick={handleToggleContinuousPlay}
                            className="relative w-12 h-7 rounded-full transition-colors cursor-pointer"
                            style={{ 
                                backgroundColor: isContinuousPlay 
                                    ? primaryColor 
                                    : (isBlackTheme ? '#27272a' : '#E2E8F0')
                            }}
                            aria-checked={isContinuousPlay}
                            role="switch"
                        >
                            <span 
                                className={`absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-in-out ${isContinuousPlay ? (isRTL ? 'right-6' : 'left-6') : (isRTL ? 'right-1' : 'left-1')}`}
                                style={{
                                    backgroundColor: isBlackTheme && isContinuousPlay ? '#000000' : '#FFFFFF'
                                }}
                            ></span>
                        </button>
                    </div>

                    <div className="h-px w-full bg-slate-100 dark:bg-white/5"></div>

                    {/* زر تحميل السور */}
                    <button 
                        id="btn-listen-download"
                        onClick={() => setShowDownloadModal(true)} 
                        className="w-full flex justify-between items-center group cursor-pointer pt-0.5"
                    >
                        <div className="flex items-center gap-2.5">
                            <div 
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                style={{ 
                                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.08)' : `${primaryColor}14`, 
                                    color: primaryColor 
                                }}
                            >
                                <Download className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-sm">{tListen('downloadMushaf', language)}</span>
                        </div>
                        <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors">
                            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                    </button>
                </div>

                {/* 5. قسم المفضلات المحفوظة (Favorites Card) بتصميم بطاقات نقية */}
                <div 
                    id="listen-favorites-card"
                    className={`app-page-card border-0 w-full rounded-2xl p-4 sm:p-5 space-y-3.5 flex-shrink-0 transition-all duration-300 ${
                        isBlackTheme 
                            ? 'bg-[#18181b] text-white' 
                            : 'bg-white text-slate-800'
                    }`}
                    style={{ borderRadius: '16px', border: 'none' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-500/10 text-red-500"
                            >
                                <Heart className="w-4 h-4 fill-red-500" />
                            </div>
                            <span className="font-bold text-sm sm:text-base">
                                {tListen('savedFavorites', language)}
                            </span>
                        </div>
                        <span 
                            className="text-xs px-2.5 py-1 rounded-full font-bold"
                            style={{ 
                                backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${primaryColor}15`,
                                color: primaryColor
                            }}
                        >
                            {formatListenNumber(favorites.length, language)} / {formatListenNumber(10, language)}
                        </span>
                    </div>

                    {favorites.length === 0 ? (
                        <div className={`text-center py-6 px-3 ${isBlackTheme ? 'text-zinc-500' : 'text-slate-400'}`}>
                            <Heart className="w-8 h-8 mx-auto mb-2 opacity-30 stroke-1" />
                            <p 
                                className="text-xs leading-relaxed font-medium"
                                dangerouslySetInnerHTML={{ __html: tListen('noFavoritesDesc', language) }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {favorites.map((fav) => {
                                const isSelected = fav.reciterId === reciterId && fav.surahNumber === surahNumber;
                                return (
                                    <div
                                        key={fav.id}
                                        onClick={() => handleSelectFavorite(fav)}
                                        className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                                            isSelected 
                                                ? 'shadow-xs' 
                                                : (isBlackTheme 
                                                    ? 'bg-white/[0.04] hover:bg-white/[0.08]' 
                                                    : 'bg-slate-50 hover:bg-slate-100/80')
                                        }`}
                                        style={isSelected ? {
                                            backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.12)' : `${primaryColor}12`,
                                            outline: `1.5px solid ${primaryColor}40`
                                        } : undefined}
                                        title={tListen('tapToListen', language)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div 
                                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
                                                style={{
                                                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.12)' : `${primaryColor}15`,
                                                    color: primaryColor
                                                }}
                                            >
                                                {formatListenNumber(fav.surahNumber, language)}
                                            </div>
                                            <div className={`truncate ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <div className="text-xs sm:text-sm font-bold truncate">
                                                    {tListen('surahPrefix', language)} {getSurahDisplayName(fav.surahNumber, fav.surahName, language)}
                                                </div>
                                                <div className={`text-[11px] truncate font-medium mt-0.5 ${isBlackTheme ? 'text-zinc-400' : 'text-slate-500'}`}>
                                                    {tListen('reciterPrefix', language)} {getReciterDisplayName(fav.reciterId, fav.reciterName, language)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-1.5 shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                                            {isSelected && (
                                                <span 
                                                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                                    style={{ 
                                                        backgroundColor: isBlackTheme ? '#FFFFFF' : primaryColor, 
                                                        color: isBlackTheme ? '#000000' : '#FFFFFF' 
                                                    }}
                                                >
                                                    {isPlaying ? tListen('playing', language) : tListen('selected', language)}
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemoveFavorite(fav.id, e)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 hover:text-red-500 transition-all cursor-pointer"
                                                title={tListen('deleteFromFavorites', language)}
                                                aria-label={tListen('delete', language)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ملاحظة الاتصال بالإنترنت */}
                <p className={`text-xs text-center mt-2 mb-0 px-3 leading-relaxed ${isBlackTheme ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {tListen('internetNote', language)}
                </p>
            </main>

            {showReciterModal && (
                <ReciterSelectModal
                    onClose={() => setShowReciterModal(false)}
                    currentReader={reciterId}
                    onSelect={(id) => setReciterId(id)}
                    readersList={RECITERS}
                    hideHeader={true}
                />
            )}
            {showSurahModal && (
                <ListenSurahSelectModal
                    surahsList={SURAH_LIST.filter(s => availableSurahIds.includes(s.number))}
                    onSelect={(surah) => {
                        setSurahNumber(surah);
                        setShowSurahModal(false);
                    }}
                    onClose={() => setShowSurahModal(false)}
                    currentSurah={surahNumber}
                />
            )}
            {showDownloadModal && (
                <QuranDownloadModal
                    onClose={() => setShowDownloadModal(false)}
                    quranData={mockQuranData}
                    initialReaderId={reciterId}
                    getAvailableSurahs={getAvailableSurahs}
                    showToast={() => {}}
                    mode="surah"
                    readersList={RECITERS}
                />
            )}
            <CommunitySpotlightGuide
                isOpen={showGuide}
                onClose={() => {
                    setShowGuide(false);
                    markPageAsSeen('listen_quran');
                }}
                steps={LISTEN_QURAN_PAGE_STEPS}
                guideKey="listen_quran_page_spotlight"
                isEn={isEn}
            />
        </div>
    );
}

export default ListenQuran;