import React, { useState, useEffect } from 'react';
import { NAWAWI_DATA } from '../data/nawawiData';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';

const HadithModal = ({ hadith, onClose, favorites, toggleFavorite, handleCopy, handleShare }) => {
    const { theme, themeKey } = useTheme();
    const [fontSize, setFontSize] = useState(18);
    const [playingText, setPlayingText] = useState<string | null>(null);
    const isBlackAndWhite = themeKey === 'deep_black';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const isPlaying = playingText === hadith.hadith;

    const increaseFontSize = () => {
        setFontSize(prev => (prev >= 32 ? 18 : prev + 4));
    };

    const toArabicDigits = (num: number) => {
        return num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    };

    const cleanTitle = (title: string) => {
        if (title.includes(': ')) {
            return title.split(': ')[1];
        }
        return title;
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        playTTS(hadith.hadith, { hadithId: hadith.id });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-100 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col scale-in" style={{ backgroundColor: 'var(--modal-bg)', color: 'var(--modal-text)', fontFamily: theme.font }} onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="w-10"></div>
                    <h3 className="text-xl font-bold text-center flex-1" style={{ color: 'var(--modal-text)', fontFamily: theme.font }}>{cleanTitle(hadith.title)}</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto leading-loose text-center flex-1" style={{ fontSize: `${fontSize}px`, color: 'var(--modal-text)', fontFamily: theme.font }}>
                    <p className="whitespace-pre-line">{hadith.hadith}</p>
                </div>

                <div className="p-5 border-t space-y-4" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex justify-between items-center">
                        <button onClick={(e) => toggleFavorite(hadith.id, e)} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors">
                            <i className={`fa-heart ${favorites.includes(hadith.id) ? 'fa-solid text-red-500' : 'fa-regular text-gray-500'}`}></i>
                        </button>
                        <div className="flex gap-3">
                            <button 
                                onClick={increaseFontSize}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition bg-black/5 dark:bg-white/5 hover:bg-black/10"
                                style={{ color: 'var(--modal-text)' }}
                                title="تكبير النص"
                            >
                                <i className="fas fa-search-plus text-lg"></i>
                            </button>
                            <button onClick={(e) => handleCopy(hadith.hadith, e)} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" title="نسخ">
                                <i className="fa-regular fa-copy text-lg"></i>
                            </button>
                            <button onClick={(e) => handleShare(hadith, e)} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" title="مشاركة">
                                <i className="fa-solid fa-share-nodes text-lg"></i>
                            </button>
                            <button 
                                onClick={handlePlayAudio} 
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" 
                                style={{ color: isPlaying ? '#ef4444' : 'inherit' }}
                                title={isPlaying ? "إيقاف الاستماع" : "استماع صوتي"}
                            >
                                <i className={`fa-solid ${isPlaying ? 'fa-circle-pause text-red-500 animate-pulse' : 'fa-volume-high'} text-lg`}></i>
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-full py-3 rounded-xl font-bold transition hover:opacity-90 bg-gray-200 dark:bg-gray-700" style={{ color: 'var(--modal-text)' }}>
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

const Nawawi = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const [selectedHadith, setSelectedHadith] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const isBlackAndWhite = themeKey === 'deep_black';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];

    useEffect(() => {
        try {
            const savedFavorites = localStorage.getItem('nawawi_favorites');
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        } catch (e) {}
    }, []);

    useEffect(() => {
        const interceptor = () => {
            if (selectedHadith) {
                setSelectedHadith(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedHadith]);

    const toggleFavorite = (id, e) => {
        e.stopPropagation();
        setFavorites(prev => {
            const isFav = prev.includes(id);
            const newFavs = isFav ? prev.filter(f => f !== id) : [...prev, id];
            try {
                localStorage.setItem('nawawi_favorites', JSON.stringify(newFavs));
            } catch (err) {}
            return newFavs;
        });
    };

    const handleCopy = (text, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setToastMessage('تم النسخ إلى الحافظة');
            setTimeout(() => setToastMessage(''), 2000);
        });
    };

    const handleShare = async (hadith, e) => {
        e.stopPropagation();
        await shareAsImage({
            text: hadith.hadith,
            source: 'الأربعون النووية',
            category: hadith.title,
            theme,
            setToastMessage
        });
    };

    const handleHomeClick = () => {
        if (selectedHadith) {
            setSelectedHadith(null);
        } else {
            onBack();
        }
    };

    const toArabicDigits = (num: number) => {
        return num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    };

    const cleanTitle = (title: string) => {
        if (title.includes(': ')) {
            return title.split(': ')[1];
        }
        return title;
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'transparent', color: theme.textColor, fontFamily: theme.font }}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            الأربعون النووية
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle">متن الأربعين حديثًا في مباني الإسلام وقواعد الأحكام</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                    {NAWAWI_DATA.map((hadith, index) => {
                        const color = theme.palette[index % theme.palette.length];
                        return (
                            <div 
                                key={hadith.id} 
                                onClick={() => setSelectedHadith(hadith)} 
                                className="relative group cursor-pointer active:scale-95 transition-all"
                            >
                                <div className="h-full p-4 rounded-3xl themed-card border shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-3 overflow-hidden min-h-[160px]" style={{ borderColor: 'var(--card-border)' }}>
                                    {/* Background hint */}
                                    <div 
                                        className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 blur-xl pointer-events-none"
                                        style={{ backgroundColor: themeKey === 'default' ? '#000000' : color }}
                                    />
                                    
                                    <div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300 shadow-inner"
                                        style={{ 
                                            backgroundColor: themeKey === 'default' ? 'rgba(0,0,0,0.05)' : color + '20',
                                            color: themeKey === 'default' ? '#000000' : color
                                        }}
                                    >
                                        <span className="text-2xl font-bold" style={{ fontFamily: theme.font }}>
                                            {toArabicDigits(hadith.id)}
                                        </span>
                                    </div>
                                    
                                    <h2 className="font-bold text-sm leading-tight text-gray-800 dark:text-gray-100 line-clamp-3" style={{ fontFamily: theme.font }}>
                                        {cleanTitle(hadith.title)}
                                    </h2>

                                    <div className="mt-auto pt-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fa-solid fa-arrow-left-long text-xs" style={{ color: themeKey === 'default' ? '#000000' : color }}></i>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="shrink-0 w-full h-32"></div>
            </main>

            {selectedHadith && (
                <HadithModal 
                    hadith={selectedHadith} 
                    onClose={() => setSelectedHadith(null)} 
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    handleCopy={handleCopy}
                    handleShare={handleShare}
                />
            )}

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-24 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};


export default Nawawi;
