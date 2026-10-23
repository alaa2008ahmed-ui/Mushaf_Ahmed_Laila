import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { getAvailableSurahsForReader } from '../utils/listenQuranUtils';
import './QuranReader.css';
import { HelpCircle } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { LISTEN_QURAN_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const STORAGE_KEY = 'listen_quran_state_v7';

const mockQuranData = {
    surahs: SURAH_LIST.map(s => ({
        number: s.number,
        name: s.name,
        revelationType: SURAH_INFO[s.number]?.type === 'مكية' ? 'Meccan' : 'Medinan',
        ayahs: new Array(SURAH_INFO[s.number]?.ayahs || 0)
    }))
};

// Normalize URL for consistent mapping
const normalizeUrl = (url: string) => {
    if (!url) return '';
    return url.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/www\./, '')
        .replace(/\/+/g, '/') // Group multiple slashes into one
        .replace(/\/$/, '')
        .trim();
};

// Simplify Arabic names for better matching
const simplifyName = (name: string) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/^(ال)/, '') // Remove prefix Al
        .replace(/\s(ال)/g, ' ') // Remove Al after space
        .replace(/[أإآا]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ئ/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/[\u064B-\u065F]/g, '') // Remove harakat
        .replace(/[^ا-ي0-9]/g, '') // Keep only Arabic letters and numbers
        .trim();
};

interface ListenFavorite {
    id: string;
    reciterId: string;
    reciterName: string;
    surahNumber: number;
    surahName: string;
    createdAt: number;
}

function ListenQuran({ onBack, onOpenThemes, onNavigate }) {
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

    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
    const [reciterId, setReciterId] = useState(RECITERS[0].id);
    const [surahNumber, setSurahNumber] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isContinuousPlay, setIsContinuousPlay] = useState(true);
    const [isRepeatSurah, setIsRepeatSurah] = useState(false);
    const isRepeatSurahRef = useRef(isRepeatSurah);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showReciterModal, setShowReciterModal] = useState(false);
    const [showSurahModal, setShowSurahModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [reciterSurahs, setReciterSurahs] = useState<Record<string, number[]>>({});

    // مؤقت النوم (Sleep Timer)
    const [sleepTimerMode, setSleepTimerMode] = useState<'off' | '15' | '30' | '60' | 'custom' | 'end_of_surah'>('off');
    const [isSleepTimerActive, setIsSleepTimerActive] = useState(false);
    const [sleepTimerRemainingSeconds, setSleepTimerRemainingSeconds] = useState<number | null>(null);
    const [customTimerMinutes, setCustomTimerMinutes] = useState(15);

    const sleepTimerModeRef = useRef(sleepTimerMode);
    const isSleepTimerActiveRef = useRef(isSleepTimerActive);

    useEffect(() => {
        isRepeatSurahRef.current = isRepeatSurah;
    }, [isRepeatSurah]);

    useEffect(() => {
        sleepTimerModeRef.current = sleepTimerMode;
        isSleepTimerActiveRef.current = isSleepTimerActive;
    }, [sleepTimerMode, isSleepTimerActive]);

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

    const getAvailableSurahs = useCallback((id: string) => {
        const rName = RECITERS.find(r => r.id === id)?.name;
        return getAvailableSurahsForReader(id, rName, reciterSurahs);
    }, [reciterSurahs]);

    const availableSurahIds = useMemo(() => {
        return getAvailableSurahs(reciterId);
    }, [reciterId, getAvailableSurahs]);

    // Ensure selected surahNumber is valid for current reciter
    useEffect(() => {
        if (availableSurahIds.length > 0 && !availableSurahIds.includes(surahNumber)) {
            setSurahNumber(availableSurahIds[0]);
        }
    }, [availableSurahIds, surahNumber]);

    const filteredQuranData = useMemo(() => {
        return {
            surahs: mockQuranData.surahs.filter(s => availableSurahIds.includes(s.number))
        };
    }, [availableSurahIds]);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const autoPlayNextRef = useRef(false);
    const objectUrlRef = useRef<string | null>(null);

    // Fetch reciter availability mapping
    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const CACHE_KEY = 'mp3quran_surahs_cache_v6';
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                        setReciterSurahs(data);
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
                                    const surasArray = typeof rawSuras === 'string' ? rawSuras.split(',').map(Number) : (Array.isArray(rawSuras) ? rawSuras : []);
                                    const urlKey = normalizeUrl(m.server);
                                    if (urlKey) mapping[urlKey] = surasArray;
                                    
                                    // Merge surahs for the same name to show all available across different moshafs
                                    if (!mapping[nameKey]) {
                                        mapping[nameKey] = surasArray;
                                    } else {
                                        const merged = Array.from(new Set([...mapping[nameKey], ...surasArray]));
                                        mapping[nameKey] = merged;
                                    }
                                }
                            });
                        }
                    });
                }
                
                setReciterSurahs(mapping);
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: mapping,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.error("Failed to fetch surahs mapping", e);
            }
        };
        fetchSurahs();
    }, []);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const { savedReciterId, savedSurahNumber, savedContinuousPlay, savedRepeatSurah } = JSON.parse(savedState);
                if (RECITERS.some(r => r.id === savedReciterId)) setReciterId(savedReciterId);
                if (SURAH_LIST.some(s => s.number === savedSurahNumber)) setSurahNumber(savedSurahNumber);
                if (typeof savedRepeatSurah === 'boolean') {
                    setIsRepeatSurah(savedRepeatSurah);
                    if (savedRepeatSurah) setIsContinuousPlay(false);
                }
                if (typeof savedContinuousPlay === 'boolean' && !savedRepeatSurah) {
                    setIsContinuousPlay(savedContinuousPlay);
                }
            }
        } catch (e) {
            console.error("Failed to load state from localStorage", e);
        }
    }, []);

    const handleToggleRepeatSurah = () => {
        const next = !isRepeatSurah;
        setIsRepeatSurah(next);
        if (next) {
            setIsContinuousPlay(false);
        }
    };

    const handleToggleContinuousPlay = () => {
        const next = !isContinuousPlay;
        setIsContinuousPlay(next);
        if (next) {
            setIsRepeatSurah(false);
        }
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
        const available = getAvailableSurahs(reciterId);
        const currentIndex = available.indexOf(surahNumber);
        if (currentIndex !== -1 && currentIndex < available.length - 1) {
            setSurahNumber(available[currentIndex + 1]);
        } else {
            setSurahNumber(available[0] || 1);
        }
    }, [getAvailableSurahs, reciterId, surahNumber]);

    const handlePrevSurah = useCallback(() => {
        const available = getAvailableSurahs(reciterId);
        const currentIndex = available.indexOf(surahNumber);
        if (currentIndex !== -1 && currentIndex > 0) {
            setSurahNumber(available[currentIndex - 1]);
        } else {
            setSurahNumber(available[available.length - 1] || 1);
        }
    }, [getAvailableSurahs, reciterId, surahNumber]);

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
        root.style.setProperty('--qr-btn-bg', t.palette[0]);
        root.style.setProperty('--qr-btn-text', '#ffffff');
        root.style.setProperty('--qr-accent', themeKey === 'default' ? '#000000' : (t.palette[1] || t.palette[0]));
        root.style.setProperty('--qr-accent-text', '#ffffff');
        root.style.setProperty('--qr-modal-bg', t.bgColor || '#0D1B2A');
        root.style.setProperty('--qr-modal-text', t.textColor);
        root.style.setProperty('--qr-header-bg', t.palette[0]);
        root.style.setProperty('--qr-header-text', '#ffffff');
        root.style.setProperty('--qr-card-bg', isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)');
        root.style.setProperty('--qr-card-text', t.textColor);
        root.style.setProperty('--qr-card-border', isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)');
        root.style.setProperty('--qr-slider-thumb', themeKey === 'default' ? '#000000' : t.palette[0]);
    }, [theme, themeKey]);

    useEffect(() => {
        audioRef.current = new Audio();
        const audio = audioRef.current;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);
        const handleError = () => {
            setError('خطأ في تحميل المقطع الصوتي. قد يكون غير متوفر حاليًا.');
            setIsLoading(false);
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);

        return () => {
            audio.pause();
            audio.src = '';
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
        };
    }, []);

    // دالة فارغة لإلغاء ظهور أي إشعارات بالصفحة نهائياً ومنع أي خطأ برمجي
    const showToast = useCallback((_msg?: string) => {}, []);

    // تأثير العد التنازلي لمؤقت النوم
    useEffect(() => {
        if (!isSleepTimerActive || sleepTimerRemainingSeconds === null) return;

        if (sleepTimerRemainingSeconds <= 0) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlaying(false);
            setIsSleepTimerActive(false);
            setSleepTimerMode('off');
            setSleepTimerRemainingSeconds(null);
            showToast(tListen('sleepTimerEndedToast', language));
            return;
        }

        const interval = setInterval(() => {
            setSleepTimerRemainingSeconds(prev => {
                if (prev === null) return null;
                return Math.max(0, prev - 1);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isSleepTimerActive, sleepTimerRemainingSeconds, showToast]);

    // معالجة انتهاء السورة الصوتية مع دعم مؤقت النوم
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
             // التحقق إذا كان مؤقت النوم مضبوط على آخر السورة
             if (isSleepTimerActiveRef.current && sleepTimerModeRef.current === 'end_of_surah') {
                 setIsPlaying(false);
                 setCurrentTime(0);
                 setIsSleepTimerActive(false);
                 setSleepTimerMode('off');
                 setSleepTimerRemainingSeconds(null);
                 return;
             }
             // خاصية تكرار نفس السورة بعد انتهائها
             if (isRepeatSurahRef.current) {
                 if (audioRef.current) {
                     audioRef.current.currentTime = 0;
                     audioRef.current.play().then(() => {
                         setIsPlaying(true);
                     }).catch(err => {
                         console.error("Failed to repeat surah:", err);
                         setIsPlaying(false);
                     });
                 }
                 return;
             }
             if (isContinuousPlay) {
                autoPlayNextRef.current = true;
                handleNextSurah();
             } else {
                setIsPlaying(false);
                setCurrentTime(0);
             }
        };

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [isContinuousPlay, isRepeatSurah, handleNextSurah, surahNumber]);

    // دوال التحكم بمؤقت النوم
    const handleSetPresetTimer = (minutes: number) => {
        const secs = minutes * 60;
        setCustomTimerMinutes(minutes);
        setSleepTimerMode(String(minutes) as any);
        setSleepTimerRemainingSeconds(secs);
        setIsSleepTimerActive(true);
        showToast(
            language === 'en'
                ? `Sleep timer set: ${formatListenNumber(minutes, language)} min`
                : `تم تفعيل مؤقت النوم: ${formatListenNumber(minutes, language)} دقيقة`
        );
    };

    const handleSetEndOfSurahTimer = () => {
        setSleepTimerMode('end_of_surah');
        setSleepTimerRemainingSeconds(null);
        setIsSleepTimerActive(true);
        const sName = getSurahDisplayName(surahNumber, language);
        showToast(
            language === 'en'
                ? `Sleep timer set to end of Surah ${sName}`
                : `تم تفعيل مؤقت النوم عند نهاية سورة ${sName}`
        );
    };

    const handleStartCustomTimer = () => {
        const secs = customTimerMinutes * 60;
        setSleepTimerMode('custom');
        setSleepTimerRemainingSeconds(secs);
        setIsSleepTimerActive(true);
        showToast(
            language === 'en'
                ? `Sleep timer set: ${formatListenNumber(customTimerMinutes, language)} min`
                : `تم تفعيل مؤقت النوم: ${formatListenNumber(customTimerMinutes, language)} دقيقة`
        );
    };

    const handleCancelSleepTimer = () => {
        setIsSleepTimerActive(false);
        setSleepTimerMode('off');
        setSleepTimerRemainingSeconds(null);
        showToast(language === 'en' ? 'Sleep timer cancelled' : 'تم إيقاف مؤقت النوم');
    };

    const handleIncrementTimer = () => {
        if (isSleepTimerActive && sleepTimerRemainingSeconds !== null) {
            setSleepTimerRemainingSeconds(prev => (prev || 0) + 300);
            showToast(language === 'en' ? 'Added 5 minutes to sleep timer' : 'تمت زيادة ٥ دقائق لمؤقت النوم');
        } else {
            setCustomTimerMinutes(prev => Math.min(180, prev + 5));
        }
    };

    const handleDecrementTimer = () => {
        if (isSleepTimerActive && sleepTimerRemainingSeconds !== null) {
            if (sleepTimerRemainingSeconds > 300) {
                setSleepTimerRemainingSeconds(prev => Math.max(60, (prev || 0) - 300));
                showToast(language === 'en' ? 'Reduced 5 minutes from sleep timer' : 'تم إنقاص ٥ دقائق من مؤقت النوم');
            } else if (sleepTimerRemainingSeconds > 60) {
                setSleepTimerRemainingSeconds(60);
                showToast(language === 'en' ? 'Timer set to 1 minute' : 'تم تعيين المؤقت إلى دقيقة واحدة');
            } else {
                showToast(language === 'en' ? 'Minimum duration is 1 minute' : 'الحد الأدنى دقيقة واحدة');
            }
        } else {
            setCustomTimerMinutes(prev => Math.max(5, prev - 5));
        }
    };

    const isCurrentFavorite = useMemo(() => {
        return favorites.some(f => f.reciterId === reciterId && f.surahNumber === surahNumber);
    }, [favorites, reciterId, surahNumber]);

    const handleToggleFavorite = () => {
        const currentReciter = RECITERS.find(r => r.id === reciterId)?.name || 'غير معروف';
        const currentSurah = SURAH_LIST.find(s => s.number === surahNumber)?.name || 'غير معروفة';

        if (isCurrentFavorite) {
            setFavorites(prev => prev.filter(f => !(f.reciterId === reciterId && f.surahNumber === surahNumber)));
        } else {
            if (favorites.length >= 10) {
                return;
            }
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
        setReciterId(fav.reciterId);
        setSurahNumber(fav.surahNumber);
    };

    const handleRemoveFavorite = (favId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev => prev.filter(f => f.id !== favId));
    };

    useEffect(() => {
        if (Object.keys(reciterSurahs).length > 0) {
            const available = getAvailableSurahs(reciterId);
            if (!available.includes(surahNumber)) {
                setSurahNumber(available[0] || 1);
            }
        }
    }, [reciterId, reciterSurahs, getAvailableSurahs, surahNumber]);

    useEffect(() => {
        if (!reciterId || !surahNumber) return;

        const audio = audioRef.current;
        if (!audio) return;
        
        const wasPlaying = !audio.paused;
        audio.pause();
        
        setIsLoading(true);
        setError('');

        const surahFormatted = String(surahNumber).padStart(3, '0');
        const baseUrl = reciterId.endsWith('/') ? reciterId.slice(0, -1) : reciterId;
        const audioUrl = `${baseUrl}/${surahFormatted}.mp3`;

        const loadAudio = async () => {
            try {
                if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                    objectUrlRef.current = null;
                }

                const cache = await caches.open('quran-audio-cache');
                const match = await cache.match(audioUrl);
                
                if (match) {
                    const blob = await match.blob();
                    const url = URL.createObjectURL(blob);
                    objectUrlRef.current = url;
                    audio.src = url;
                } else {
                    audio.src = audioUrl;
                }
                
                audio.load();

                if (wasPlaying || autoPlayNextRef.current) {
                    audio.play().catch(err => {
                        console.error("Failed to autoplay:", err);
                        setError(tListen('autoPlayError', language));
                        setIsLoading(false);
                    });
                    if (autoPlayNextRef.current) {
                        autoPlayNextRef.current = false;
                    }
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Error loading audio:", err);
                audio.src = audioUrl;
                audio.load();
                setIsLoading(false);
            }
        };

        loadAudio();
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
            savedReciterId: reciterId, 
            savedSurahNumber: surahNumber,
            savedContinuousPlay: isContinuousPlay,
            savedRepeatSurah: isRepeatSurah,
        }));

    }, [reciterId, surahNumber]);
    
     useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
             savedReciterId: reciterId, 
             savedSurahNumber: surahNumber,
             savedContinuousPlay: isContinuousPlay,
             savedRepeatSurah: isRepeatSurah
        }));
    }, [isContinuousPlay, isRepeatSurah]);
    
    const handlePlayPause = async () => {
        const audio = audioRef.current;
        if (!audio || !audio.src) return;
        setError('');
        if (isPlaying) {
            audio.pause();
        } else {
            try {
                await audio.play();
            } catch (err) {
                setError(tListen('browserPlayError', language));
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = Number(e.target.value);
            setCurrentTime(audio.currentTime);
        }
    };
    
    const reciterName = RECITERS.find(r => r.id === reciterId)?.name || (language === 'en' ? 'Unknown' : 'غير معروف');
    const surahName = SURAH_LIST.find(s => s.number === surahNumber)?.name || (language === 'en' ? 'Unknown' : 'غير معروفة');

    return (
        <div dir={dir} className="h-screen flex flex-col font-cairo overflow-hidden" style={{ backgroundColor: 'transparent', color: theme.textColor }}>
            <header className="app-top-bar" dir={dir}>
                <style>{`
                    .quran-slider::-webkit-slider-thumb {
                        appearance: none;
                        width: 16px;
                        height: 16px;
                        background: var(--qr-slider-thumb);
                        border-radius: 50%;
                        cursor: pointer;
                        border: 2px solid #FFFFFF;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    }
                    .quran-slider::-moz-range-thumb {
                        width: 16px;
                        height: 16px;
                        background: var(--qr-slider-thumb);
                        border-radius: 50%;
                        cursor: pointer;
                        border: 2px solid #FFFFFF;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    }
                `}</style>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* زر الرجوع للخلف وأيقونة المفضلة */}
                        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tListen('back', language)}
                                aria-label={tListen('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-xl`}></i>
                            </button>
                            <button
                                type="button"
                                onClick={handleToggleFavorite}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isCurrentFavorite ? tListen('removeFromFavorites', language) : tListen('addToFavorites', language)}
                                aria-label={tListen('favorites', language)}
                            >
                                <i className={`text-xl transition-all ${isCurrentFavorite ? 'fa-solid fa-heart text-red-500 scale-110' : 'fa-regular fa-heart opacity-75 hover:opacity-100 hover:text-red-500'}`} style={isCurrentFavorite ? {} : { color: theme.textColor }}></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-16 sm:px-20 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {tListen('pageTitle', language)}
                            </h1>
                        </div>

                        {/* قفل الثيم وأيقونة المنزل */}
                        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={tListen('guide', language)}
                                aria-label={tListen('guide', language)}
                            >
                                <HelpCircle size={19} />
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={handleGoHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tListen('home', language)}
                                aria-label={tListen('home', language)}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-md mx-auto flex-1 flex flex-col px-4 pb-4 z-10 overflow-y-auto">

                <div className="space-y-3 flex-shrink-0 py-4">
                    <button 
                        onClick={() => setShowReciterModal(true)} 
                        className="w-full p-3 text-center rounded-xl font-bold themed-card flex justify-between items-center transition-all cursor-pointer"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        <span className="truncate">{getReciterDisplayName(reciterId, reciterName, language)}</span>
                        <i className="fa-solid fa-chevron-down opacity-50 shrink-0"></i>
                    </button>
                    <button 
                        onClick={() => setShowSurahModal(true)} 
                        className="w-full p-3 text-center rounded-xl font-bold themed-card flex justify-between items-center transition-all cursor-pointer"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        <span className="truncate">{formatListenNumber(surahNumber, language)} - {getSurahDisplayName(surahNumber, surahName, language)}</span>
                        <i className="fa-solid fa-chevron-down opacity-50 shrink-0"></i>
                    </button>
                </div>

                <div 
                    className="themed-card rounded-3xl p-6 space-y-5 flex-shrink-0 transition-all"
                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                >
                    <div className="w-full space-y-1.5" dir={dir}>
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer quran-slider"
                            style={{ background: `linear-gradient(to ${isRTL ? 'left' : 'right'}, ${theme.palette[0]} ${duration > 0 ? (currentTime / duration) * 100 : 0}%, ${theme.cardBorder} ${duration > 0 ? (currentTime / duration) * 100 : 0}%)` }}
                        />
                        <div className="flex justify-between text-xs font-mono" style={{ color: theme.textColor, opacity: 0.7 }}>
                            <span>{formatListenTime(currentTime, language)}</span>
                            <span>{formatListenTime(duration, language)}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button onClick={handlePrevSurah} className="w-24 text-center hover:opacity-80 transition-opacity font-bold cursor-pointer" style={{ color: theme.textColor }}>
                            {tListen('previous', language)}
                        </button>
                        <button onClick={handlePlayPause} disabled={isLoading && !isPlaying} className="rounded-full w-20 h-20 flex items-center justify-center shadow-lg active:scale-95 transition disabled:opacity-70 cursor-pointer" style={{ backgroundColor: themeKey === 'default' ? '#000000' : (themeKey === 'deep_black' || isBlackTheme ? '#FFFFFF' : theme.palette[0]), color: (themeKey === 'deep_black' || isBlackTheme) ? '#000000' : '#FFFFFF' }}>
                            {isLoading && !isPlaying ? <i className="fa-solid fa-spinner fa-spin fa-2x"></i> : <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} fa-2x ${isRTL ? 'pl-1' : 'pr-1'}`}></i>}
                        </button>
                        <button onClick={handleNextSurah} className="w-24 text-center hover:opacity-80 transition-opacity font-bold cursor-pointer" style={{ color: theme.textColor }}>
                            {tListen('next', language)}
                        </button>
                    </div>

                </div>

                {/* بطاقة مؤقت النوم (Sleep Timer) */}
                <div className="pt-4 pb-1 flex-shrink-0 space-y-3">
                    <div 
                        className="themed-card rounded-2xl p-4 space-y-3.5 transition-all"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        {/* عنوان ورأس البطاقة */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-moon text-amber-500 text-base"></i>
                                <span className="font-bold text-sm" style={{ color: theme.textColor }}>
                                    {tListen('sleepTimer', language)}
                                </span>
                            </div>
                            
                            {/* شارة حالة المؤقت */}
                            {isSleepTimerActive ? (
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs"
                                        style={{
                                            backgroundColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF25' : '#00000015') : `${theme.palette[0]}25`,
                                            color: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0]
                                        }}
                                    >
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
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
                                <span className="text-xs opacity-60 font-medium">
                                    {tListen('timerOff', language)}
                                </span>
                            )}
                        </div>

                        {/* خيارات التحديد السريع (15 أو 30 أو 60 دقيقة أو آخر السورة) */}
                        <div className="grid grid-cols-4 gap-2 text-xs">
                            {/* 15 دقيقة */}
                            <button
                                type="button"
                                onClick={() => handleSetPresetTimer(15)}
                                className={`py-2 px-1 rounded-xl font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${isSleepTimerActive && sleepTimerMode === '15' ? 'shadow-xs scale-[1.02]' : 'hover:opacity-85'}`}
                                style={{
                                    backgroundColor: isSleepTimerActive && sleepTimerMode === '15'
                                        ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF25' : '#00000015') : `${theme.palette[0]}25`)
                                        : 'transparent',
                                    borderColor: isSleepTimerActive && sleepTimerMode === '15'
                                        ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0])
                                        : 'rgba(150, 150, 150, 0.25)',
                                    color: theme.textColor
                                }}
                            >
                                <span>{tListen('preset15', language)}</span>
                            </button>

                            {/* 30 دقيقة */}
                            <button
                                type="button"
                                onClick={() => handleSetPresetTimer(30)}
                                className={`py-2 px-1 rounded-xl font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${isSleepTimerActive && sleepTimerMode === '30' ? 'shadow-xs scale-[1.02]' : 'hover:opacity-85'}`}
                                style={{
                                    backgroundColor: isSleepTimerActive && sleepTimerMode === '30'
                                        ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF25' : '#00000015') : `${theme.palette[0]}25`)
                                        : 'transparent',
                                    borderColor: isSleepTimerActive && sleepTimerMode === '30'
                                        ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0])
                                        : 'rgba(150, 150, 150, 0.25)',
                                    color: theme.textColor
                                }}
                            >
                                <span>{tListen('preset30', language)}</span>
                            </button>

                            {/* 60 دقيقة */}
                            <button
                                type="button"
                                onClick={() => handleSetPresetTimer(60)}
                                className={`py-2 px-1 rounded-xl font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${isSleepTimerActive && sleepTimerMode === '60' ? 'shadow-xs scale-[1.02]' : 'hover:opacity-85'}`}
                                style={{
                                    backgroundColor: isSleepTimerActive && sleepTimerMode === '60'
                                        ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF25' : '#00000015') : `${theme.palette[0]}25`)
                                        : 'transparent',
                                    borderColor: isSleepTimerActive && sleepTimerMode === '60'
                                        ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0])
                                        : 'rgba(150, 150, 150, 0.25)',
                                    color: theme.textColor
                                }}
                            >
                                <span>{tListen('preset60', language)}</span>
                            </button>

                            {/* آخر السورة */}
                            <button
                                type="button"
                                onClick={handleSetEndOfSurahTimer}
                                className={`py-2 px-1 rounded-xl font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${isSleepTimerActive && sleepTimerMode === 'end_of_surah' ? 'shadow-xs scale-[1.02]' : 'hover:opacity-85'}`}
                                style={{
                                    backgroundColor: isSleepTimerActive && sleepTimerMode === 'end_of_surah'
                                        ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF25' : '#00000015') : `${theme.palette[0]}25`)
                                        : 'transparent',
                                    borderColor: isSleepTimerActive && sleepTimerMode === 'end_of_surah'
                                        ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0])
                                        : 'rgba(150, 150, 150, 0.25)',
                                    color: theme.textColor
                                }}
                            >
                                <span>{tListen('endOfSurah', language)}</span>
                            </button>
                        </div>

                        {/* صف أزرار زيادة ونقصان الوقت (+) و (-) مع عرض الوقت وزر التفعيل */}
                        <div className="pt-1 flex items-center justify-between gap-3 border-t border-gray-200/20 dark:border-gray-700/20">
                            <div className="flex items-center gap-2">
                                {/* زر إنقاص الوقت (-) */}
                                <button
                                    type="button"
                                    onClick={handleDecrementTimer}
                                    disabled={isSleepTimerActive && sleepTimerMode === 'end_of_surah'}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-base transition-all hover:opacity-80 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    style={{
                                        borderColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF40' : '#00000030') : `${theme.palette[0]}50`,
                                        backgroundColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF10' : '#00000008') : `${theme.palette[0]}10`,
                                        color: theme.textColor
                                    }}
                                    title={tListen('decreaseTimeTooltip', language)}
                                    aria-label={tListen('decreaseTimeAria', language)}
                                >
                                    <i className="fa-solid fa-minus text-xs"></i>
                                </button>

                                {/* عرض الوقت الحالي المحدد أو المتبقي */}
                                <div 
                                    className="px-3 py-1.5 rounded-xl border text-center font-bold text-sm min-w-[95px]"
                                    style={{
                                        borderColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF30' : '#00000020') : `${theme.palette[0]}30`,
                                        backgroundColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF08' : '#00000005') : `${theme.palette[0]}08`,
                                        color: theme.textColor
                                    }}
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
                                    className="w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-base transition-all hover:opacity-80 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    style={{
                                        borderColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF40' : '#00000030') : `${theme.palette[0]}50`,
                                        backgroundColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF10' : '#00000008') : `${theme.palette[0]}10`,
                                        color: theme.textColor
                                    }}
                                    title={tListen('increaseTimeTooltip', language)}
                                    aria-label={tListen('increaseTimeAria', language)}
                                >
                                    <i className="fa-solid fa-plus text-xs"></i>
                                </button>
                            </div>

                            {/* زر تفعيل أو إلغاء المؤقت */}
                            {!isSleepTimerActive ? (
                                <button
                                    type="button"
                                    onClick={handleStartCustomTimer}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                                    style={{
                                        backgroundColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0],
                                        color: (themeKey === 'deep_black' || isBlackTheme) ? '#000000' : '#FFFFFF'
                                    }}
                                >
                                    {tListen('startTimer', language)}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleCancelSleepTimer}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-red-500/40 text-red-500 hover:bg-red-500/10"
                                >
                                    {tListen('stopTimer', language)}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-6 pb-2 flex-shrink-0 space-y-3">
                    <div 
                        className="themed-card rounded-2xl p-4 space-y-4 transition-all"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        {/* خيار تكرار نفس السورة بعد انتهائها */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="repeat-surah-toggle" className="font-bold text-sm flex items-center gap-2 cursor-pointer" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                                <i className="fa-solid fa-arrow-rotate-right" style={{ color: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0] }}></i>
                                <span>{tListen('repeatSurahToggle', language)}</span>
                            </label>
                            <button
                                id="repeat-surah-toggle"
                                onClick={handleToggleRepeatSurah}
                                className="relative w-12 h-7 rounded-full transition-colors cursor-pointer"
                                style={{ 
                                    backgroundColor: isRepeatSurah 
                                        ? (isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#000000' : theme.palette[0])) 
                                        : (isBlackTheme ? '#222222' : (theme.cardBorder || '#d1d5db')),
                                    border: isBlackTheme ? '1.5px solid #FFFFFF' : 'none'
                                }}
                                aria-checked={isRepeatSurah}
                                role="switch"
                            >
                                <span 
                                    className={`absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-in-out ${isRepeatSurah ? 'left-6' : 'left-1'}`}
                                    style={{
                                        backgroundColor: isBlackTheme 
                                            ? (isRepeatSurah ? '#000000' : '#FFFFFF') 
                                            : '#FFFFFF'
                                    }}
                                ></span>
                            </button>
                        </div>

                        <div className="h-px w-full bg-gray-200 dark:bg-gray-700 opacity-30"></div>

                        {/* خيار تشغيل متواصل */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="continuous-play-toggle" className="font-bold text-sm flex items-center gap-2 cursor-pointer" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                                <i className="fa-solid fa-repeat" style={{ color: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0] }}></i>
                                <span>{tListen('continuousPlayToggle', language)}</span>
                            </label>
                            <button
                                id="continuous-play-toggle"
                                onClick={handleToggleContinuousPlay}
                                className="relative w-12 h-7 rounded-full transition-colors cursor-pointer"
                                style={{ 
                                    backgroundColor: isContinuousPlay 
                                        ? (isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#000000' : theme.palette[0])) 
                                        : (isBlackTheme ? '#222222' : (theme.cardBorder || '#d1d5db')),
                                    border: isBlackTheme ? '1.5px solid #FFFFFF' : 'none'
                                }}
                                aria-checked={isContinuousPlay}
                                role="switch"
                            >
                                <span 
                                    className={`absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-in-out ${isContinuousPlay ? 'left-6' : 'left-1'}`}
                                    style={{
                                        backgroundColor: isBlackTheme 
                                            ? (isContinuousPlay ? '#000000' : '#FFFFFF') 
                                            : '#FFFFFF'
                                    }}
                                ></span>
                            </button>
                        </div>

                        <div className="h-px w-full bg-gray-200 dark:bg-gray-700 opacity-30"></div>

                        <button 
                            onClick={() => setShowDownloadModal(true)} 
                            className="w-full flex justify-between items-center group cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-download" style={{ color: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0] }}></i>
                                <span className="font-bold text-sm">{tListen('downloadMushaf', language)}</span>
                            </div>
                            <i className={`fa-solid ${isRTL ? 'fa-chevron-left' : 'fa-chevron-right'} opacity-30 group-hover:opacity-100 transition-opacity`}></i>
                        </button>
                    </div>
                </div>

                {/* قسم المفضلات المحفوظة (حتى 10 سور وقراء) */}
                <div className="pt-2 pb-2 flex-shrink-0 space-y-3">
                    <div 
                        className="themed-card rounded-2xl p-4 space-y-3 transition-all"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-heart text-red-500 text-sm"></i>
                                <span className="font-bold text-sm" style={{ color: theme.textColor }}>
                                    {tListen('savedFavorites', language)}
                                </span>
                            </div>
                            <span 
                                className="text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs"
                                style={{ 
                                    backgroundColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF20' : '#00000015') : `${theme.palette[0]}20`,
                                    color: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0]
                                }}
                            >
                                {formatListenNumber(favorites.length, language)} / {formatListenNumber(10, language)}
                            </span>
                        </div>

                        {favorites.length === 0 ? (
                            <div className="text-center py-5 px-3 opacity-60">
                                <i className="fa-regular fa-heart text-3xl mb-2.5 block opacity-40"></i>
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
                                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${isSelected ? 'shadow-xs' : 'hover:opacity-90'}`}
                                            style={{
                                                backgroundColor: isSelected 
                                                    ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF15' : '#0000000c') : `${theme.palette[0]}15`)
                                                    : 'transparent',
                                                borderColor: isSelected 
                                                    ? ((themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0])
                                                    : 'rgba(150, 150, 150, 0.2)',
                                                borderWidth: isSelected ? '1.5px' : '1px'
                                            }}
                                            title={tListen('tapToListen', language)}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <div 
                                                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
                                                    style={{
                                                        backgroundColor: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF20' : '#00000010') : `${theme.palette[0]}20`,
                                                        color: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0]
                                                    }}
                                                >
                                                    {formatListenNumber(fav.surahNumber, language)}
                                                </div>
                                                <div className={`truncate ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    <div className="text-xs font-bold truncate" style={{ color: theme.textColor }}>
                                                        {tListen('surahPrefix', language)} {getSurahDisplayName(fav.surahNumber, fav.surahName, language)}
                                                    </div>
                                                    <div className="text-[11px] opacity-65 truncate font-medium">
                                                        {tListen('reciterPrefix', language)} {getReciterDisplayName(fav.reciterId, fav.reciterName, language)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`flex items-center gap-1.5 shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                                                {isSelected && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                                        {isPlaying ? tListen('playing', language) : tListen('selected', language)}
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleRemoveFavorite(fav.id, e)}
                                                    className="w-8 h-8 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:text-red-500 transition-all cursor-pointer"
                                                    title={tListen('deleteFromFavorites', language)}
                                                    aria-label={tListen('delete', language)}
                                                >
                                                    <i className="fa-regular fa-trash-can text-xs"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ملاحظة الصفحة في آخر الصفحة بعد بطاقة المفضلة */}
                <p className="text-xs text-center mt-3 mb-1 px-3" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor, opacity: 0.65 }}>
                    {tListen('internetNote', language)}
                </p>

                <div className="w-full h-6 shrink-0"></div>
            </main>

            {showReciterModal && (
                <ReciterSelectModal
                    onClose={() => setShowReciterModal(false)}
                    currentReader={reciterId}
                    onSelect={(id) => setReciterId(id)}
                    readersList={RECITERS}
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