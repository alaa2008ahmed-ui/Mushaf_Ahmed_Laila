import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { ALL_DUAA, DUAA_CATEGORIES } from '../data/adiaData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { useHabitTracker } from '../hooks/useHabitTracker';

const ADIA_STATUS_KEY = 'adia_status_v1';
const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

interface AdiaProps {
    onBack: () => void;
    onNavigate: (page: string, params?: any) => void;
}

function Adia({ onBack, onNavigate }: AdiaProps) {
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
    const [zoomedDuaa, setZoomedDuaa] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');
    const [playingText, setPlayingText] = useState<string | null>(null);
    const fabRef = useRef<HTMLButtonElement>(null);
    const mainRef = useRef<HTMLElement>(null);

    const [adiaCounts, setAdiaCounts] = useState<{ [id: string]: number }>(() => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const stored = localStorage.getItem(ADIA_STATUS_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.date === today && data.counts) {
                    return data.counts;
                }
            }
        } catch (e) {}
        return {};
    });

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        try {
            localStorage.setItem(ADIA_STATUS_KEY, JSON.stringify({ date: today, counts: adiaCounts }));
        } catch (e) {
            console.error("Failed to save adia status", e);
        }
    }, [adiaCounts]);

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const handlePlayAudio = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        playTTS(text, (msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(''), 2500);
        });
    };

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [activeCategory]);

    useEffect(() => {
        try {
            const savedFavorites = localStorage.getItem('adia_favorites');
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        } catch (e) {
            console.error("Failed to load favorites", e);
        }
    }, []);

    useEffect(() => {
        const interceptor = () => {
            if (zoomedDuaa) {
                setZoomedDuaa(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedDuaa]);

    const openZoomModal = (duaa: any) => {
        setZoomedDuaa(duaa);
    };

    const closeZoomModal = () => {
        setZoomedDuaa(null);
    };

    const handleBack = () => {
        if (zoomedDuaa) {
            setZoomedDuaa(null);
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (zoomedDuaa) {
            setZoomedDuaa(null);
        }
        onNavigate('home');
    };

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev => {
            const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            try {
                localStorage.setItem('adia_favorites', JSON.stringify(newFavs));
            } catch (err) {}
            return newFavs;
        });
    };

    const handleCopy = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setToastMessage('تم النسخ إلى الحافظة');
            setTimeout(() => setToastMessage(''), 2000);
        });
    };

    const handleShare = async (duaa: any, e: React.MouseEvent) => {
        e.stopPropagation();
        await shareAsImage({
            text: duaa.text,
            source: duaa.source,
            category: categoryForDuaa(duaa.categoryId)?.title,
            theme,
            setToastMessage
        });
    };

    const handleDecrement = (id: string, current: number) => {
        useHabitTracker.getState().recordAdhkarRead('adia');
        if (zoomedDuaa) return;
        if (current <= 0) return;
        setAdiaCounts(prev => ({
            ...prev,
            [id]: current - 1
        }));
    };

    const handleReset = (id: string, initCount: number) => {
        setAdiaCounts(prev => ({
            ...prev,
            [id]: initCount
        }));
    };

    const handleResetAll = () => {
        setAdiaCounts({});
        setIsMenuOpen(false);
        setToastMessage('تمت إعادة ضبط جميع العدادات');
        setTimeout(() => setToastMessage(''), 2000);
    };

    const handleFabClick = () => {
        if (!isMenuOpen && fabRef.current) {
            const rect = fabRef.current.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2) {
                setMenuOpenDirection('down');
            } else {
                setMenuOpenDirection('up');
            }
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const filteredDuaa = ALL_DUAA.filter(duaa => {
        let matchesCategory = false;
        if (activeCategory === 'all') matchesCategory = true;
        else if (activeCategory === 'favorites') matchesCategory = favorites.includes(duaa.id);
        else matchesCategory = duaa.categoryId === activeCategory;

        if (!matchesCategory) return false;

        if (!searchQuery.trim()) return true;

        const textMatch = duaa.text.includes(searchQuery);
        const sourceMatch = duaa.source.includes(searchQuery);
        const categoryMatch = (categoryForDuaa(duaa.categoryId)?.title || '').includes(searchQuery);
        
        return textMatch || sourceMatch || categoryMatch;
    });

    return (
        <div className="h-screen flex flex-col bg-transparent relative">
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* سهم الرجوع للخلف على يمين النص */}
                        <div className="absolute right-0 flex items-center">
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="رجوع للخلف"
                                aria-label="رجوع للخلف"
                            >
                                <i className="fa-solid fa-arrow-right text-xl"></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                الأدعية المأثورة
                            </h1>
                        </div>

                        {/* أيقونة المنزل على يسار النص للعودة إلى الصفحة الرئيسية */}
                        <div className="absolute left-0 flex items-center gap-1">
                            <ThemePageLock />
                            <button
                                onClick={handleGoHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="الصفحة الرئيسية"
                                aria-label="الصفحة الرئيسية"
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main ref={mainRef} className="w-full flex-1 overflow-y-auto px-4 pt-0 pb-4">
                <div className="mb-6">
                    <div className="relative max-w-2xl mx-auto border-2 rounded-2xl overflow-hidden focus-within:ring-2 transition-all shadow-sm" style={{ borderColor: cardBorderColor, ...(themeKey === 'default' ? { focusRingColor: '#000'} : { focusRingColor: theme.palette[0]}) }}>
                        <input 
                            type="text" 
                            placeholder="ابحث في الأدعية..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 py-3 pr-12 pl-4 text-right focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 font-kufi"
                            style={{ color: 'var(--text-color)' }}
                        />
                        <i className="fa-solid fa-search absolute right-4 top-1/2 transform -translate-y-1/2 opacity-50" style={{ color: 'var(--text-color)' }}></i>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDuaa.length > 0 ? (
                        filteredDuaa.map((duaa) => {
                            const initialCount = duaa.count || 1;
                            const currentCount = adiaCounts[duaa.id] !== undefined ? adiaCounts[duaa.id] : initialCount;
                            const isFinished = currentCount === 0;

                            const repetitionText = initialCount > 1 
                                ? (initialCount === 2 ? 'يُقرأ مرتين' : `يُقرأ ${toArabicNumerals(initialCount)} مرات`) 
                                : 'يُقرأ مرة واحدة';

                            const badgeStyle = isFinished 
                                ? { backgroundColor: 'var(--badge-finished-bg)', color: 'var(--badge-finished-text)' } 
                                : (themeKey === 'default' 
                                    ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' } 
                                    : { backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.name === 'اسود' ? '#000000' : '#ffffff' }
                                );

                            return (
                                <div 
                                    key={duaa.id} 
                                    className={`p-5 pb-3 rounded-3xl relative transition-all overflow-hidden themed-card group shadow-sm border flex flex-col justify-between ${isFinished ? 'opacity-60 cursor-pointer' : 'cursor-pointer hover:shadow-md'}`} 
                                    onClick={() => handleDecrement(duaa.id, currentCount)}
                                    style={{ 
                                        fontFamily: theme.font,
                                        borderColor: cardBorderColor,
                                        borderWidth: '1.5px',
                                        borderStyle: 'solid'
                                    }}
                                >
                                    {/* Top Bar with repetition note and count badge */}
                                    <div className="flex justify-between items-start mb-3">
                                        <span 
                                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold shadow-sm select-none" 
                                            style={{ backgroundColor: theme.palette[1] + '30', color: theme.palette[1] }}
                                        >
                                            {repetitionText}
                                        </span>
                                        <div 
                                            className="count-badge w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md transform transition-transform shrink-0 select-none cursor-pointer" 
                                            style={badgeStyle}
                                            onClick={(e) => {
                                                if (isFinished) {
                                                    e.stopPropagation();
                                                    handleReset(duaa.id, initialCount);
                                                }
                                            }}
                                            title={isFinished ? 'اضغط لإعادة التكرار' : 'العدد المتبقي'}
                                        >
                                            {isFinished ? <i className="fa-solid fa-check"></i> : toArabicNumerals(currentCount)}
                                        </div>
                                    </div>

                                    <p className="text-xl md:text-2xl leading-relaxed text-center font-amiri mb-6 select-none" style={{ color: 'var(--text-color)' }}>
                                        {duaa.text}
                                    </p>

                                    <div className="mt-auto pt-4 border-t space-y-4" style={{borderColor: 'var(--card-border)'}}>
                                        <div className="flex justify-center">
                                            <span className="text-xs sm:text-sm text-center opacity-70 font-bold bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full" style={{ color: 'var(--text-color)' }}>
                                                {categoryForDuaa(duaa.categoryId)?.title || ''} • {duaa.source}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <button onClick={(e) => toggleFavorite(duaa.id, e)} className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors">
                                                <i className={`fa-heart ${favorites.includes(duaa.id) ? 'fa-solid text-red-500' : 'fa-regular opacity-70'}`} style={favorites.includes(duaa.id) ? {} : { color: 'var(--text-color)' }}></i>
                                            </button>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openZoomModal(duaa);
                                                    }} 
                                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
                                                    style={{ color: 'var(--text-color)' }}
                                                    title="تكبير"
                                                >
                                                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                </button>
                                                <button onClick={(e) => handleCopy(duaa.text, e)} className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" style={{ color: 'var(--text-color)' }} title="نسخ">
                                                    <i className="fa-regular fa-copy"></i>
                                                </button>
                                                <button onClick={(e) => handleShare(duaa, e)} className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" style={{ color: 'var(--text-color)' }} title="مشاركة">
                                                    <i className="fa-solid fa-share-nodes"></i>
                                                </button>
                                                <button 
                                                    onClick={(e) => handlePlayAudio(duaa.text, e)} 
                                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                                                    style={{ color: playingText === duaa.text ? '#ef4444' : 'var(--text-color)' }}
                                                    title={playingText === duaa.text ? "إيقاف الاستماع" : "استماع صوتي"}
                                                >
                                                    <i className={`fa-solid ${playingText === duaa.text ? 'fa-circle-pause text-red-500 animate-pulse' : 'fa-volume-high'}`}></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {!isFinished && <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition pointer-events-none" style={{ backgroundColor: theme.palette[0] + '15' }}></div>}
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 font-bold">
                            <i className="fa-solid fa-search text-4xl mb-4 opacity-50"></i>
                            <p>لا توجد نتائج مطابقة لبحثك.</p>
                        </div>
                    )}
                    <div className="shrink-0 w-full h-32 col-span-full"></div>
                </div>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap flex items-center gap-2"
                    >
                        <i className="fa-solid fa-check text-green-400"></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Menu & FAB */}
            <div className="fixed bottom-6 right-4 z-[90] flex flex-col items-end">
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute right-0 ${menuOpenDirection === 'up' ? 'bottom-full mb-4 origin-bottom-right' : 'top-full mt-4 origin-top-right'} themed-card rounded-2xl shadow-xl border p-2 flex flex-col gap-1 overflow-hidden w-48 z-0`}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                        >
                            <button 
                                onClick={() => { setActiveCategory('all'); setIsMenuOpen(false); }}
                                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeCategory === 'all' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={activeCategory === 'all' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                الكل
                            </button>
                            <button 
                                onClick={() => { setActiveCategory('favorites'); setIsMenuOpen(false); }}
                                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${activeCategory === 'favorites' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={activeCategory === 'favorites' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                المفضلة
                                <i className="fa-solid fa-heart text-xs opacity-70"></i>
                            </button>
                            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
                            {DUAA_CATEGORIES.map(category => (
                                <button 
                                    key={category.id}
                                    onClick={() => { setActiveCategory(category.id); setIsMenuOpen(false); }}
                                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${activeCategory === category.id ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    style={activeCategory === category.id ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                                >
                                    {category.title}
                                    <i className={`fa-solid ${category.icon} text-xs opacity-70`}></i>
                                </button>
                            ))}
                            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
                            <button 
                                onClick={handleResetAll}
                                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                <span>إعادة ضبط العدادات</span>
                                <i className="fa-solid fa-rotate-left text-xs opacity-70"></i>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button 
                    ref={fabRef}
                    onClick={handleFabClick}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10 ${themeKey === 'default' ? 'text-black' : (isBlackTheme ? 'text-black' : 'text-white')}`}
                    style={
                        themeKey === 'default'
                        ? { backgroundColor: '#ffffff', border: '1px solid #000000' }
                        : { backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }
                    }
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            {zoomedDuaa && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={closeZoomModal}>
                    <div className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" style={{ fontFamily: theme.font }} onClick={e => e.stopPropagation()}>
                        <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                            <div 
                                className="text-3xl md:text-4xl leading-relaxed font-amiri"
                            >
                                {zoomedDuaa.text}
                            </div>
                            <p className="text-lg mt-6 font-bold" style={{ color: theme.palette[0] }}>
                                من {categoryForDuaa(zoomedDuaa.categoryId)?.title || ''}
                            </p>
                        </div>

                        <div className="mt-6 shrink-0">
                            <button onClick={closeZoomModal} className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity">إغلاق</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function categoryForDuaa(categoryId: string) {
    return DUAA_CATEGORIES.find(c => c.id === categoryId);
}

export default Adia;
