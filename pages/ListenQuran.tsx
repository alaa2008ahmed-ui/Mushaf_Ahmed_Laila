import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { SURAH_LIST, RECITERS } from '../data/listenQuranData';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import ListenSurahSelectModal from '../components/QuranReader/ListenSurahSelectModal';
import { QuranDownloadModal } from '../components/QuranReader/DownloadModals';
import Toast from '../components/QuranReader/Toast';
import { SURAH_INFO } from '../components/QuranReader/constants';
import { registerBackInterceptor } from '../hooks/useBackButton';
import './QuranReader.css';

const STORAGE_KEY = 'listen_quran_state_v7';

const mockQuranData = {
    surahs: SURAH_LIST.map(s => ({
        number: s.number,
        name: s.name,
        revelationType: SURAH_INFO[s.number]?.type === 'مكية' ? 'Meccan' : 'Medinan',
        ayahs: new Array(SURAH_INFO[s.number]?.ayahs || 0)
    }))
};

// FIX: Correctly convert digits to numbers for array indexing.
const toArabicNumerals = (numStr) => String(numStr).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

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

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return toArabicNumerals('00:00');
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return toArabicNumerals(`${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
}

function ListenQuran({ onBack, onOpenThemes, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const [reciterId, setReciterId] = useState(RECITERS[0].id);
    const [surahNumber, setSurahNumber] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isContinuousPlay, setIsContinuousPlay] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showReciterModal, setShowReciterModal] = useState(false);
    const [showSurahModal, setShowSurahModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [reciterSurahs, setReciterSurahs] = useState<Record<string, number[]>>({});

    const getAvailableSurahs = useCallback((id: string) => {
        const fullList = Array.from({ length: 114 }, (_, i) => i + 1);
        if (!Object.keys(reciterSurahs).length) {
            return fullList;
        }

        // 1. Try URL exact match
        const currentUrlKey = normalizeUrl(id);
        if (reciterSurahs[currentUrlKey]) return reciterSurahs[currentUrlKey];

        // 2. Try Name match
        const rName = RECITERS.find(r => r.id === id)?.name;
        if (rName) {
            const currentNameKey = `name:${simplifyName(rName)}`;
            if (reciterSurahs[currentNameKey]) return reciterSurahs[currentNameKey];
            
            // Loose name match
            const simplifiedNameCurrent = simplifyName(rName);
            const matchedNameKey = Object.keys(reciterSurahs).find(key => 
                key.startsWith('name:') && (key.includes(simplifiedNameCurrent) || simplifiedNameCurrent.includes(key.replace('name:', '')))
            );
            if (matchedNameKey) return reciterSurahs[matchedNameKey];
        }

        // 3. Try URL loose match
        const matchedUrlKey = Object.keys(reciterSurahs).find(key => 
            !key.startsWith('name:') && (currentUrlKey.includes(key) || key.includes(currentUrlKey))
        );
        if (matchedUrlKey) return reciterSurahs[matchedUrlKey];
        
        return fullList;
    }, [reciterSurahs]);

    const availableSurahIds = useMemo(() => {
        return getAvailableSurahs(reciterId);
    }, [reciterId, getAvailableSurahs]);

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
                const { savedReciterId, savedSurahNumber, savedContinuousPlay } = JSON.parse(savedState);
                if (RECITERS.some(r => r.id === savedReciterId)) setReciterId(savedReciterId);
                if (SURAH_LIST.some(s => s.number === savedSurahNumber)) setSurahNumber(savedSurahNumber);
                if (typeof savedContinuousPlay === 'boolean') setIsContinuousPlay(savedContinuousPlay);
            }
        } catch (e) {
            console.error("Failed to load state from localStorage", e);
        }
    }, []);

    const handleHomeClick = useCallback(() => {
        if (showReciterModal) { setShowReciterModal(false); }
        else if (showSurahModal) { setShowSurahModal(false); }
        else if (showDownloadModal) { setShowDownloadModal(false); }
        else { onBack(); }
    }, [showReciterModal, showSurahModal, showDownloadModal, onBack]);

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

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
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
    }, [isContinuousPlay, handleNextSurah]);

    const showToast = (message: string) => {
        setToast({ show: true, message });
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
                        setError('فشل التشغيل التلقائي.');
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
        }));

    }, [reciterId, surahNumber]);
    
     useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
             savedReciterId: reciterId, 
             savedSurahNumber: surahNumber,
             savedContinuousPlay: isContinuousPlay 
        }));
    }, [isContinuousPlay]);
    
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
                setError("لم يتمكن المتصفح من تشغيل الصوت تلقائيًا.");
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
    
    const reciterName = RECITERS.find(r => r.id === reciterId)?.name || 'غير معروف';
    const surahName = SURAH_LIST.find(s => s.number === surahNumber)?.name || 'غير معروفة';

    return (
        <div className="h-screen flex flex-col font-cairo overflow-hidden" style={{ backgroundColor: 'transparent', color: theme.textColor }}>
            <header className="app-top-bar">
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
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            الاستماع للقرآن
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle">تلاوات عطرة من أشهر القراء</p>
                </div>
            </header>

            <main className="w-full max-w-md mx-auto flex-1 flex flex-col px-4 pb-4 z-10 overflow-y-auto">

                <div className="space-y-3 flex-shrink-0 py-4">
                    <button 
                        onClick={() => setShowReciterModal(true)} 
                        className="w-full p-3 text-center rounded-xl border font-bold themed-card flex justify-between items-center"
                    >
                        <span>{reciterName}</span>
                        <i className="fa-solid fa-chevron-down opacity-50"></i>
                    </button>
                    <button 
                        onClick={() => setShowSurahModal(true)} 
                        className="w-full p-3 text-center rounded-xl border font-bold themed-card flex justify-between items-center"
                    >
                        <span>{surahNumber} - {surahName}</span>
                        <i className="fa-solid fa-chevron-down opacity-50"></i>
                    </button>
                </div>



                <div className="themed-card rounded-3xl p-6 space-y-5 flex-shrink-0">
                    <div className="w-full space-y-1.5" dir="rtl">
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer quran-slider"
                            style={{ background: `linear-gradient(to left, ${theme.palette[0]} ${duration > 0 ? (currentTime / duration) * 100 : 0}%, ${theme.cardBorder} ${duration > 0 ? (currentTime / duration) * 100 : 0}%)` }}
                        />
                        <div className="flex justify-between text-xs font-mono" style={{ color: theme.textColor, opacity: 0.7 }}>
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button onClick={handlePrevSurah} className="w-24 text-center hover:opacity-80 transition-opacity font-bold" style={{ color: theme.textColor }}>
                            السابق
                        </button>
                        <button onClick={handlePlayPause} disabled={isLoading && !isPlaying} className="rounded-full w-20 h-20 flex items-center justify-center shadow-lg active:scale-95 transition disabled:opacity-70" style={{ backgroundColor: themeKey === 'default' ? '#000000' : (themeKey === 'deep_black' || isBlackTheme ? '#FFFFFF' : theme.palette[0]), color: (themeKey === 'deep_black' || isBlackTheme) ? '#000000' : '#FFFFFF' }}>
                            {isLoading && !isPlaying ? <i className="fa-solid fa-spinner fa-spin fa-2x"></i> : <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} fa-2x pl-1`}></i>}
                        </button>
                        <button onClick={handleNextSurah} className="w-24 text-center hover:opacity-80 transition-opacity font-bold" style={{ color: theme.textColor }}>
                            التالى
                        </button>
                    </div>

                </div>

                <div className="pt-6 pb-2 flex-shrink-0 space-y-3">
                    <div className="themed-card rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="continuous-play-toggle" className="font-bold text-sm flex items-center gap-2" style={{ color: theme.textColor }}>
                                <i className="fa-solid fa-repeat" style={{ color: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0] }}></i>
                                <span>تشغيل متواصل</span>
                            </label>
                            <button
                                id="continuous-play-toggle"
                                onClick={() => setIsContinuousPlay(prev => !prev)}
                                className={`relative w-12 h-7 rounded-full transition-colors`}
                                style={{ backgroundColor: isContinuousPlay ? (themeKey === 'default' ? '#000000' : (isBlackTheme ? '#FFFFFF' : theme.palette[0])) : theme.cardBorder }}
                                aria-checked={isContinuousPlay}
                                role="switch"
                            >
                                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${isContinuousPlay ? 'left-6' : 'left-1'}`}></span>
                            </button>
                        </div>

                        <div className="h-px w-full bg-gray-200 dark:bg-gray-700 opacity-30"></div>

                        <button 
                            onClick={() => setShowDownloadModal(true)} 
                            className="w-full flex justify-between items-center group"
                        >
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-download" style={{ color: (themeKey === 'default' || isBlackTheme) ? (isBlackTheme ? '#FFFFFF' : '#000000') : theme.palette[0] }}></i>
                                <span className="font-bold text-sm">تحميل المصحف</span>
                            </div>
                            <i className="fa-solid fa-chevron-left opacity-30 group-hover:opacity-100 transition-opacity"></i>
                        </button>
                    </div>
                    <p className="text-xs text-center mt-2" style={{ color: theme.textColor, opacity: 0.6 }}>ملاحظة: لا تعمل هذه الصفحة إلا إذا كنت متصلاً بالإنترنت، ويفضل الواي فاي.</p>
                </div>
                <div className="w-full h-24 shrink-0"></div>
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={onOpenThemes} showThemes={false} />

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
                    quranData={filteredQuranData}
                    showToast={showToast}
                    mode="surah"
                    readersList={RECITERS}
                />
            )}
            <Toast 
                show={toast.show} 
                message={toast.message} 
                onClose={() => setToast({ ...toast, show: false })} 
            />
        </div>
    );
}

export default ListenQuran;