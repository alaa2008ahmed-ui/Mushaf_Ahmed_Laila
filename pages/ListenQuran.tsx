import React, { useState, useEffect, useRef, useCallback } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { RECITERS } from '../components/QuranReader/constants';
import { SURAH_LIST } from '../data/listenQuranData';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import ListenSurahSelectModal from '../components/QuranReader/ListenSurahSelectModal';
import { QuranDownloadModal } from '../components/QuranReader/DownloadModals';
import Toast from '../components/QuranReader/Toast';
import { SURAH_INFO } from '../components/QuranReader/constants';
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

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return toArabicNumerals('00:00');
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return toArabicNumerals(`${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
}

function ListenQuran({ onBack, onOpenThemes }) {
    const { theme, themeKey } = useTheme();
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
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const autoPlayNextRef = useRef(false);
    const objectUrlRef = useRef<string | null>(null);

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

    const handleNextSurah = useCallback(() => setSurahNumber(s => s === 114 ? 1 : s + 1), []);
    const handlePrevSurah = useCallback(() => setSurahNumber(s => s === 1 ? 114 : s - 1), []);

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
        root.style.setProperty('--qr-accent', t.palette[1] || t.palette[0]);
        root.style.setProperty('--qr-accent-text', '#ffffff');
        root.style.setProperty('--qr-modal-bg', t.bgColor || '#0D1B2A');
        root.style.setProperty('--qr-modal-text', t.textColor);
        root.style.setProperty('--qr-header-bg', t.palette[0]);
        root.style.setProperty('--qr-header-text', '#ffffff');
        root.style.setProperty('--qr-card-bg', isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)');
        root.style.setProperty('--qr-card-text', t.textColor);
        root.style.setProperty('--qr-card-border', isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)');
    }, [theme]);

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
                <div className="app-top-bar__inner">
                    <h1 className="app-top-bar__title text-2xl font-kufi">الاستماع للقرآن</h1>
                    <p className="app-top-bar__subtitle">تلاوات عطرة من أشهر القراء</p>
                </div>
            </header>

            <main className="w-full max-w-md mx-auto flex-1 flex flex-col p-4 z-10">

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
                    <div className="w-full space-y-1.5" dir="ltr">
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, ${theme.palette[0]} ${duration > 0 ? (currentTime / duration) * 100 : 0}%, ${theme.cardBorder} ${duration > 0 ? (currentTime / duration) * 100 : 0}%)` }}
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
                        <button onClick={handlePlayPause} disabled={isLoading && !isPlaying} className="bg-white text-slate-900 rounded-full w-20 h-20 flex items-center justify-center shadow-lg active:scale-95 transition disabled:opacity-70" style={{ backgroundColor: theme.palette[0], color: themeKey === 'black_and_white' ? '#FFFFFF' : theme.btnText }}>
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
                                <i className="fa-solid fa-repeat" style={{ color: theme.palette[0] }}></i>
                                <span>تشغيل متواصل</span>
                            </label>
                            <button
                                id="continuous-play-toggle"
                                onClick={() => setIsContinuousPlay(prev => !prev)}
                                className={`relative w-12 h-7 rounded-full transition-colors`}
                                style={{ backgroundColor: isContinuousPlay ? theme.palette[0] : theme.cardBorder }}
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
                                <i className="fa-solid fa-download" style={{ color: theme.palette[0] }}></i>
                                <span className="font-bold text-sm">تحميل المصحف</span>
                            </div>
                            <i className="fa-solid fa-chevron-left opacity-30 group-hover:opacity-100 transition-opacity"></i>
                        </button>
                    </div>
                    <p className="text-xs text-center mt-2" style={{ color: theme.textColor, opacity: 0.6 }}>ملاحظة: لا تعمل هذه الصفحة إلا إذا كنت متصلاً بالإنترنت، ويفضل الواي فاي.</p>
                </div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={onOpenThemes} showThemes={false} />

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
                    surahsList={SURAH_LIST}
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