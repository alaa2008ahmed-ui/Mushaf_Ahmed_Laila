import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { ALL_DUAA, DUAA_CATEGORIES, DuaaItem } from '../data/adiaData';
import { getRepetitionText } from '../data/adiaTranslationsEn';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { useLanguage } from '../context/LanguageContext';
import { LayoutGrid, ListFilter, HelpCircle } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ADIA_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const ADIA_STATUS_KEY = 'adia_status_v1';
const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

interface AdiaProps {
    onBack: () => void;
    onNavigate: (page: string, params?: any) => void;
}

function Adia({ onBack, onNavigate }: AdiaProps) {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name === 'الافتراضي' || !!theme.isOriginal || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? 'rgba(255, 255, 255, 0.2)' 
            : (theme.palette?.[0] + '33' || 'rgba(0, 0, 0, 0.08)'));
    const [zoomedDuaa, setZoomedDuaa] = useState<DuaaItem | null>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
    const [toastMessage, setToastMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    
    useEffect(() => {
        markPageAsSeen('adia');
        if (!getGuideSeen('adia_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);
    const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');
    const [playingText, setPlayingText] = useState<string | null>(null);
    const fabRef = useRef<HTMLButtonElement>(null);
    const fabContainerRef = useRef<HTMLDivElement>(null);
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

    const handlePlayAudio = (duaa: DuaaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const textToPlay = isEn ? (duaa.textEn || duaa.text) : duaa.text;
        playTTS(textToPlay, {
            onToast: (msg) => {
                if (isEn) {
                    if (msg.includes('جاري تشغيل')) setToastMessage('Playing audio...');
                    else if (msg.includes('تم إيقاف')) setToastMessage('Audio stopped');
                    else setToastMessage(msg);
                } else {
                    setToastMessage(msg);
                }
                setTimeout(() => setToastMessage(''), 2500);
            }
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
            if (isMenuOpen) {
                setIsMenuOpen(false);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedDuaa, isMenuOpen]);

    const openZoomModal = (duaa: DuaaItem) => {
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

    const handleCopy = (duaa: DuaaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const textToCopy = isEn ? (duaa.textEn || duaa.text) : duaa.text;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
            setTimeout(() => setToastMessage(''), 2000);
        });
    };

    const handleShare = async (duaa: DuaaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const cat = categoryForDuaa(duaa.categoryId);
        const itemCategory = isEn ? (cat?.titleEn || 'Supplications') : (cat?.title || 'الأدعية المأثورة');
        const itemSource = isEn ? (duaa.sourceEn || duaa.source) : duaa.source;
        const itemTitle = isEn ? (cat?.titleEn || 'Supplication') : (cat?.title || 'دعاء مأثور');

        await shareAsImage({
            text: isEn ? (duaa.textEn || duaa.text) : duaa.text,
            title: itemTitle,
            source: itemSource,
            category: itemCategory,
            theme,
            isEn: isEn,
            language: isEn ? 'en' : 'ar',
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
        setToastMessage(isEn ? 'All counters have been reset' : 'تمت إعادة ضبط جميع العدادات');
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

        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;

        const textMatch = duaa.text.toLowerCase().includes(query);
        const textEnMatch = (duaa.textEn || '').toLowerCase().includes(query);
        const sourceMatch = duaa.source.toLowerCase().includes(query);
        const sourceEnMatch = (duaa.sourceEn || '').toLowerCase().includes(query);
        const cat = categoryForDuaa(duaa.categoryId);
        const categoryMatch = (cat?.title || '').toLowerCase().includes(query) || (cat?.titleEn || '').toLowerCase().includes(query);
        
        return textMatch || textEnMatch || sourceMatch || sourceEnMatch || categoryMatch;
    });

    const pageTitle = isEn ? 'Prophetic & Quranic Supplications' : 'الأدعية المأثورة';

    return (
        <div className="h-screen flex flex-col bg-transparent relative" dir={isEn ? 'ltr' : 'rtl'}>
            <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* زر الرجوع للخلف: على اليمين في العربي، وعلى اليسار في الإنجليزي */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Go Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {pageTitle}
                            </h1>
                        </div>

                        {/* أيقونة المنزل: على اليسار في العربي، وعلى اليمين في الإنجليزي */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Adia Guide" : "دليل الأدعية"}
                                aria-label={isEn ? "Adia Guide" : "دليل الأدعية"}
                            >
                                <HelpCircle size={19} />
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={handleGoHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Home" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main ref={mainRef} className="w-full flex-1 overflow-y-auto px-4 pt-2 pb-4">
                <div className="mb-6 max-w-3xl mx-auto flex items-center gap-2 w-full" dir={isEn ? 'ltr' : 'rtl'}>
                    <div 
                        className="relative flex-1 border-2 rounded-2xl overflow-hidden focus-within:ring-2 transition-all shadow-sm" 
                        style={{ borderColor: cardBorderColor, ...(isDefaultTheme ? { focusRingColor: '#000'} : { focusRingColor: theme.palette[0]}) }}
                    >
                        <input 
                            type="text" 
                            placeholder={isEn ? "Search supplications..." : "ابحث في الأدعية..."} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-black/5 dark:bg-white/5 py-3 ${isEn ? 'pl-12 pr-10 text-left font-sans' : 'pr-12 pl-10 text-right font-kufi'} focus:outline-none placeholder-gray-500 dark:placeholder-gray-400`}
                            style={{ color: 'var(--text-color)' }}
                        />
                        <i 
                            className={`fa-solid fa-search absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-50`} 
                            style={{ color: 'var(--text-color)' }}
                        ></i>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className={`absolute inset-y-0 ${isEn ? 'right-4' : 'left-4'} flex items-center text-gray-400 hover:text-gray-600`}
                            >
                                <i className="fa-solid fa-times text-xs"></i>
                            </button>
                        )}
                    </div>

                    {/* View Mode Switch */}
                    <div 
                        className="flex items-center p-1 rounded-2xl border shrink-0 shadow-sm"
                        style={{
                            backgroundColor: isBlackTheme ? '#111111' : (theme.isDark ? '#1e293b' : '#ffffff'),
                            borderColor: cardBorderColor
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveTab('grid')}
                            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'grid' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                            style={activeTab === 'grid' ? {
                                backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]),
                                color: isBlackTheme ? '#000000' : '#ffffff'
                            } : { color: 'var(--text-color)' }}
                            title={isEn ? "Grid View" : "عرض شبكي"}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('list')}
                            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'list' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                            style={activeTab === 'list' ? {
                                backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]),
                                color: isBlackTheme ? '#000000' : '#ffffff'
                            } : { color: 'var(--text-color)' }}
                            title={isEn ? "List View" : "عرض القوائم"}
                        >
                            <ListFilter size={16} />
                        </button>
                    </div>
                </div>

                <div className={activeTab === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4 max-w-3xl mx-auto"}>
                    {filteredDuaa.length > 0 ? (
                        filteredDuaa.map((duaa) => {
                            const initialCount = duaa.count || 1;
                            const currentCount = adiaCounts[duaa.id] !== undefined ? adiaCounts[duaa.id] : initialCount;
                            const isFinished = currentCount === 0;

                            const repetitionText = getRepetitionText(initialCount, isEn);

                            const badgeStyle = isFinished 
                                ? { backgroundColor: 'var(--badge-finished-bg)', color: 'var(--badge-finished-text)' } 
                                : (themeKey === 'default' 
                                    ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' } 
                                    : { backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.name === 'اسود' ? '#000000' : '#ffffff' }
                                );

                            const displayText = isEn ? (duaa.textEn || duaa.text) : duaa.text;
                            const displaySource = isEn ? (duaa.sourceEn || duaa.source) : duaa.source;
                            const cat = categoryForDuaa(duaa.categoryId);
                            const categoryTitle = isEn ? (cat?.titleEn || '') : (cat?.title || '');
                            const isCurrentlyPlaying = playingText === displayText || playingText === duaa.text;

                            return (
                                <div 
                                    key={duaa.id} 
                                    className={`p-5 pb-3 rounded-3xl relative transition-all overflow-hidden themed-card group shadow-sm border flex flex-col justify-between ${isFinished ? 'opacity-60 cursor-pointer' : 'cursor-pointer hover:shadow-md'}`} 
                                    onClick={() => handleDecrement(duaa.id, currentCount)}
                                    style={{ 
                                        fontFamily: isEn ? 'sans-serif' : theme.font,
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
                                            title={isFinished ? (isEn ? 'Click to reset' : 'اضغط لإعادة التكرار') : (isEn ? 'Remaining count' : 'العدد المتبقي')}
                                        >
                                            {isFinished ? <i className="fa-solid fa-check"></i> : (isEn ? currentCount : toArabicNumerals(currentCount))}
                                        </div>
                                    </div>

                                    {/* Duaa Text: When English, render ONLY English. When Arabic, render Arabic. */}
                                    {isEn ? (
                                        <p 
                                            className="text-base sm:text-lg leading-relaxed text-center font-sans font-medium mb-6 select-none text-balance" 
                                            dir="ltr" 
                                            style={{ color: 'var(--text-color)' }}
                                        >
                                            {displayText}
                                        </p>
                                    ) : (
                                        <p 
                                            className="text-xl md:text-2xl leading-relaxed text-center font-amiri mb-6 select-none" 
                                            style={{ color: 'var(--text-color)' }}
                                        >
                                            {displayText}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4 border-t space-y-4" style={{borderColor: 'var(--card-border)'}}>
                                        <div className="flex justify-center">
                                            <span 
                                                className="text-xs sm:text-sm text-center opacity-70 font-bold bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full" 
                                                dir={isEn ? 'ltr' : 'rtl'}
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                {categoryTitle} • {displaySource}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <button 
                                                onClick={(e) => toggleFavorite(duaa.id, e)} 
                                                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                                title={isEn ? (favorites.includes(duaa.id) ? 'Remove from favorites' : 'Add to favorites') : (favorites.includes(duaa.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة')}
                                                aria-label={isEn ? 'Favorite' : 'المفضلة'}
                                            >
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
                                                    title={isEn ? "Zoom" : "تكبير"}
                                                    aria-label={isEn ? "Zoom" : "تكبير"}
                                                >
                                                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                </button>
                                                <button 
                                                    onClick={(e) => handleCopy(duaa, e)} 
                                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                                                    style={{ color: 'var(--text-color)' }} 
                                                    title={isEn ? "Copy" : "نسخ"}
                                                    aria-label={isEn ? "Copy" : "نسخ"}
                                                >
                                                    <i className="fa-regular fa-copy"></i>
                                                </button>
                                                <button 
                                                    onClick={(e) => handleShare(duaa, e)} 
                                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                                                    style={{ color: 'var(--text-color)' }} 
                                                    title={isEn ? "Share" : "مشاركة"}
                                                    aria-label={isEn ? "Share" : "مشاركة"}
                                                >
                                                    <i className="fa-solid fa-share-nodes"></i>
                                                </button>
                                                <button 
                                                    onClick={(e) => handlePlayAudio(duaa, e)} 
                                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                                                    style={{ color: isCurrentlyPlaying ? '#ef4444' : 'var(--text-color)' }}
                                                    title={isEn ? (isCurrentlyPlaying ? "Stop listening" : "Listen audio") : (isCurrentlyPlaying ? "إيقاف الاستماع" : "استماع صوتي")}
                                                    aria-label={isEn ? "Listen audio" : "استماع صوتي"}
                                                >
                                                    <i className={`fa-solid ${isCurrentlyPlaying ? 'fa-circle-pause text-red-500 animate-pulse' : 'fa-volume-high'}`}></i>
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
                            <p>{isEn ? "No supplications match your search." : "لا توجد نتائج مطابقة لبحثك."}</p>
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
                        className="fixed bottom-8 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap flex items-center gap-2 border border-white/10"
                    >
                        <i className="fa-solid fa-check text-green-400"></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop to close floating menu when clicking anywhere, absorbing the click */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 z-[1200] bg-transparent cursor-pointer"
                    style={{ position: 'fixed' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                    }}
                />
            )}

            {/* Floating Menu & FAB */}
            <div ref={fabContainerRef} className={`fixed bottom-3 ${isEn ? 'left-4 items-start' : 'right-4 items-end'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col`}>
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-4' : 'top-full mt-4'} themed-card rounded-2xl shadow-xl border p-2 flex flex-col gap-1 overflow-hidden w-56 z-0`}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => { setActiveCategory('all'); setIsMenuOpen(false); }}
                                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeCategory === 'all' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={activeCategory === 'all' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                {isEn ? 'All Supplications' : 'الكل'}
                            </button>
                            <button 
                                onClick={() => { setActiveCategory('favorites'); setIsMenuOpen(false); }}
                                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${activeCategory === 'favorites' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={activeCategory === 'favorites' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                <span>{isEn ? 'Favorites' : 'المفضلة'}</span>
                                <i className="fa-solid fa-heart text-xs opacity-70"></i>
                            </button>
                            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
                            {DUAA_CATEGORIES.map(category => (
                                <button 
                                    key={category.id}
                                    onClick={() => { setActiveCategory(category.id); setIsMenuOpen(false); }}
                                    className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${activeCategory === category.id ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    style={activeCategory === category.id ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                                >
                                    <span>{isEn ? (category.titleEn || category.title) : category.title}</span>
                                    <i className={`fa-solid ${category.icon} text-xs opacity-70`}></i>
                                </button>
                            ))}
                            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
                            <button 
                                onClick={handleResetAll}
                                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5`}
                            >
                                <span>{isEn ? 'Reset All Counters' : 'إعادة ضبط العدادات'}</span>
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
                    title={isEn ? "Categories Menu" : "قائمة التصنيفات"}
                    aria-label={isEn ? "Categories Menu" : "قائمة التصنيفات"}
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            {/* Zoom Modal */}
            {zoomedDuaa && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={closeZoomModal}>
                    <div 
                        className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" 
                        style={{ fontFamily: isEn ? 'sans-serif' : theme.font }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                            {/* When English, show ONLY English text. Zero Arabic. */}
                            {isEn ? (
                                <div 
                                    className="text-xl md:text-2xl leading-relaxed font-sans font-medium text-center my-4 select-none text-balance"
                                    dir="ltr"
                                >
                                    {zoomedDuaa.textEn || zoomedDuaa.text}
                                </div>
                            ) : (
                                <div 
                                    className="text-3xl md:text-4xl leading-relaxed font-amiri text-center select-none"
                                >
                                    {zoomedDuaa.text}
                                </div>
                            )}

                            <p className="text-base sm:text-lg mt-6 font-bold" style={{ color: theme.palette[0] }} dir={isEn ? 'ltr' : 'rtl'}>
                                {isEn 
                                    ? `${categoryForDuaa(zoomedDuaa.categoryId)?.titleEn || ''} • ${zoomedDuaa.sourceEn || zoomedDuaa.source}`
                                    : `من ${categoryForDuaa(zoomedDuaa.categoryId)?.title || ''} (${zoomedDuaa.source})`}
                            </p>

                            {zoomedDuaa.count > 1 && (
                                <p className="text-sm mt-2 font-semibold opacity-75">
                                    {isEn ? `Required repetitions: ${zoomedDuaa.count} times` : `التكرار المطلوب: ${toArabicNumerals(zoomedDuaa.count)} مرات`}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 shrink-0 flex items-center gap-3">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (zoomedDuaa) {
                                        handleShare(zoomedDuaa, e);
                                    }
                                }} 
                                className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md"
                                style={{ backgroundColor: theme.palette[0] }}
                                title={isEn ? "Share Image" : "مشاركة كصورة"}
                            >
                                <i className="fa-solid fa-share-nodes"></i>
                                <span>{isEn ? 'Share Image' : 'مشاركة كصورة'}</span>
                            </button>
                            <button 
                                onClick={closeZoomModal} 
                                className="flex-1 py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity"
                            >
                                {isEn ? 'Close' : 'إغلاق'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <CommunitySpotlightGuide
                isOpen={showGuide}
                onClose={() => {
                    setShowGuide(false);
                    markPageAsSeen('adia');
                }}
                steps={ADIA_PAGE_STEPS}
                guideKey="adia_page_spotlight"
                isEn={isEn}
            />
        </div>
    );
}

function categoryForDuaa(categoryId: string) {
    return DUAA_CATEGORIES.find(c => c.id === categoryId);
}

export default Adia;
