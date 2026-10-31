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
import ZoomModal from '../components/Adia/ZoomModal';
import { scrollToNextCard } from '../utils/cardScrollHelper';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ADIA_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const ADIA_STATUS_KEY = 'adia_status_v1';
const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

function hexToRgba(hex?: string, alpha: number = 1): string {
    if (!hex) return `rgba(46, 125, 94, ${alpha})`;
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return `rgba(46, 125, 94, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface AdiaProps {
    onBack: () => void;
    onNavigate: (page: string, params?: any) => void;
    navParams?: any;
}

function Adia({ onBack, onNavigate, navParams }: AdiaProps) {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    
    // Dynamic theme colors
    const isBlackTheme = theme.bgColor === '#000000' || themeKey === 'deep_black' || theme.name === 'اسود' || theme.name === 'أبيض وأسود';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';

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
            isEn,
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
        <div 
            className="h-screen flex flex-col relative transition-colors" 
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ 
                backgroundColor: isBlackTheme ? '#000000' : (theme.bgColor || (theme.isDark ? '#0F172A' : '#F5F7FA')) 
            }}
        >
            <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back button */}
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

                        {/* Title in center */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {pageTitle}
                            </h1>
                        </div>

                        {/* Guide, ThemeLock and Home buttons */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Adia Guide" : "دليل الأدعية"}
                                aria-label={isEn ? "Adia Guide" : "دليل الأدعية"}
                            >
                                <i className="fa-solid fa-circle-question text-lg"></i>
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

            <main ref={mainRef} className="w-full flex-1 overflow-y-auto px-4 pt-3 pb-6">
                {/* Modern Borderless Search bar and View Mode Switch */}
                <div className="mb-6 max-w-3xl mx-auto flex items-center gap-2.5 w-full" dir={isEn ? 'ltr' : 'rtl'}>
                    <div className="relative flex-1 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-opacity-40 flex items-center overflow-hidden"
                         style={{ 
                             '--tw-ring-color': primaryColor,
                             backgroundColor: isBlackTheme ? '#18181b' : (theme.isDark ? 'rgba(39, 39, 42, 0.7)' : '#FFFFFF'),
                             boxShadow: theme.isDark ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.04)'
                         } as any}
                    >
                        <i 
                            className={`fa-solid fa-search absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-45 pointer-events-none text-sm`} 
                            style={{ color: 'var(--text-color)' }}
                        ></i>
                        <input 
                            type="text" 
                            placeholder={isEn ? "Search supplications..." : "ابحث في الأدعية..."} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-transparent py-3 text-sm sm:text-base border-0 outline-none ${
                                isEn ? 'pl-11 pr-10 text-left font-sans' : 'pr-11 pl-10 text-right font-kufi'
                            } placeholder-gray-400 dark:placeholder-gray-500`}
                            style={{ color: 'var(--text-color)' }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className={`absolute inset-y-0 ${isEn ? 'right-4' : 'left-4'} flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer`}
                            >
                                <i className="fa-solid fa-times text-xs"></i>
                            </button>
                        )}
                    </div>

                    {/* View Mode Switch Chips */}
                    <div 
                        className="flex items-center p-1 rounded-2xl shrink-0 gap-1"
                        style={{
                            backgroundColor: isBlackTheme ? '#18181b' : (theme.isDark ? 'rgba(39, 39, 42, 0.7)' : '#FFFFFF'),
                            boxShadow: theme.isDark ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.04)'
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveTab('grid')}
                            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer ${
                                activeTab === 'grid' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                            }`}
                            style={activeTab === 'grid' ? {
                                backgroundColor: primaryColor,
                                color: btnTextColor
                            } : { color: 'var(--text-color)' }}
                            title={isEn ? "Grid View" : "عرض شبكي"}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('list')}
                            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer ${
                                activeTab === 'list' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                            }`}
                            style={activeTab === 'list' ? {
                                backgroundColor: primaryColor,
                                color: btnTextColor
                            } : { color: 'var(--text-color)' }}
                            title={isEn ? "List View" : "عرض القوائم"}
                        >
                            <ListFilter size={16} />
                        </button>
                    </div>
                </div>

                {/* Supplications Cards Grid/List */}
                <div className={activeTab === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto pb-4" : "space-y-4 max-w-3xl mx-auto pb-4"}>
                    {filteredDuaa.length > 0 ? (
                        filteredDuaa.map((duaa) => {
                            const initialCount = duaa.count || 1;
                            const currentCount = adiaCounts[duaa.id] !== undefined ? adiaCounts[duaa.id] : initialCount;
                            const isFinished = currentCount === 0;

                            const repetitionText = getRepetitionText(initialCount, isEn);

                            const displayText = isEn ? (duaa.textEn || duaa.text) : duaa.text;
                            const displaySource = isEn ? (duaa.sourceEn || duaa.source) : duaa.source;
                            const cat = categoryForDuaa(duaa.categoryId);
                            const categoryTitle = isEn ? (cat?.titleEn || '') : (cat?.title || '');
                            const isCurrentlyPlaying = playingText === displayText || playingText === duaa.text;

                            return (
                                <div 
                                    key={duaa.id} 
                                    data-card-item="true"
                                    className={`p-5 pb-3 rounded-[18px] relative transition-all duration-300 overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_6px_25px_rgba(0,0,0,0.06)] border border-slate-100/80 dark:border-white/5 flex flex-col justify-between ${
                                        isFinished ? 'opacity-65 cursor-pointer' : 'cursor-pointer'
                                    }`} 
                                    onClick={(e) => {
                                        handleDecrement(duaa.id, currentCount);
                                        if (currentCount <= 1) {
                                            const cardEl = e.currentTarget as HTMLElement;
                                            setTimeout(() => scrollToNextCard(cardEl), 60);
                                        }
                                    }}
                                    style={{ 
                                        fontFamily: isEn ? 'sans-serif' : theme.font,
                                        backgroundColor: isBlackTheme ? '#18181b' : (theme.isDark ? (theme.cardBg || '#18181B') : '#FFFFFF'),
                                        color: 'var(--text-color)'
                                    }}
                                >
                                    {/* Top Bar with repetition badge and count badge */}
                                    <div className="flex justify-between items-center mb-3">
                                        <span 
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold select-none transition-colors" 
                                            style={{ 
                                                backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.2 : 0.1), 
                                                color: isBlackTheme ? '#FFFFFF' : primaryColor 
                                            }}
                                        >
                                            {repetitionText}
                                        </span>

                                        {/* Repetition Counter Badge */}
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg select-none cursor-pointer transition-all active:scale-90 hover:scale-105 shrink-0" 
                                            style={
                                                isFinished 
                                                ? { backgroundColor: '#10B981', color: '#FFFFFF', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)' } 
                                                : { 
                                                    backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.25 : 0.12), 
                                                    color: isBlackTheme ? '#FFFFFF' : primaryColor 
                                                }
                                            }
                                            onClick={(e) => {
                                                if (isFinished) {
                                                    e.stopPropagation();
                                                    handleReset(duaa.id, initialCount);
                                                }
                                            }}
                                            title={isFinished ? (isEn ? 'Click to reset' : 'اضغط لإعادة التكرار') : (isEn ? 'Remaining count' : 'العدد المتبقي')}
                                        >
                                            {isFinished ? <i className="fa-solid fa-check text-sm"></i> : (isEn ? currentCount : toArabicNumerals(currentCount))}
                                        </div>
                                    </div>

                                    {/* Duaa Text with generous line height */}
                                    {isEn ? (
                                        <p 
                                            className="text-base sm:text-lg leading-relaxed text-center font-sans font-medium mb-4 select-none text-balance" 
                                            dir="ltr" 
                                            style={{ color: 'var(--text-color)' }}
                                        >
                                            {displayText}
                                        </p>
                                    ) : (
                                        <p 
                                            className="text-xl md:text-2xl leading-[2.3] text-center font-amiri mb-4 select-none text-balance" 
                                            style={{ color: 'var(--text-color)' }}
                                        >
                                            {displayText}
                                        </p>
                                    )}

                                    {/* Source and Category */}
                                    {(categoryTitle || displaySource) && (
                                        <div className="flex justify-center mb-3">
                                            <span 
                                                className="text-xs sm:text-sm text-center opacity-70 font-bold bg-slate-100 dark:bg-zinc-800/60 px-3.5 py-1 rounded-full" 
                                                dir={isEn ? 'ltr' : 'rtl'}
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                {categoryTitle ? `${categoryTitle} • ` : ''}{displaySource}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Action Buttons Row */}
                                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100/90 dark:border-white/5">
                                        <button 
                                            onClick={(e) => toggleFavorite(duaa.id, e)} 
                                            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
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
                                                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer"
                                                style={{ color: 'var(--text-color)' }} 
                                                title={isEn ? "Zoom" : "تكبير"}
                                                aria-label={isEn ? "Zoom" : "تكبير"}
                                            >
                                                <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                            </button>
                                            <button 
                                                onClick={(e) => handleCopy(duaa, e)} 
                                                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
                                                style={{ color: 'var(--text-color)' }} 
                                                title={isEn ? "Copy" : "نسخ"}
                                                aria-label={isEn ? "Copy" : "نسخ"}
                                            >
                                                <i className="fa-regular fa-copy text-xs"></i>
                                            </button>
                                            <button 
                                                onClick={(e) => handleShare(duaa, e)} 
                                                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
                                                style={{ color: 'var(--text-color)' }} 
                                                title={isEn ? "Share" : "مشاركة"}
                                                aria-label={isEn ? "Share" : "مشاركة"}
                                            >
                                                <i className="fa-solid fa-share-nodes text-xs"></i>
                                            </button>
                                            <button 
                                                onClick={(e) => handlePlayAudio(duaa, e)} 
                                                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
                                                style={{ color: isCurrentlyPlaying ? '#ef4444' : 'var(--text-color)' }}
                                                title={isEn ? (isCurrentlyPlaying ? "Stop listening" : "Listen audio") : (isCurrentlyPlaying ? "إيقاف الاستماع" : "استماع صوتي")}
                                                aria-label={isEn ? "Listen audio" : "استماع صوتي"}
                                            >
                                                <i className={`fa-solid ${isCurrentlyPlaying ? 'fa-circle-pause text-red-500 animate-pulse text-sm' : 'fa-volume-high text-xs'}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {!isFinished && (
                                        <div 
                                            className="absolute inset-0 opacity-0 group-active:opacity-100 transition pointer-events-none" 
                                            style={{ backgroundColor: hexToRgba(primaryColor, 0.08) }}
                                        ></div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 text-center text-gray-500 dark:text-gray-400 font-bold">
                            <i className="fa-solid fa-search text-4xl mb-4 opacity-40"></i>
                            <p>{isEn ? "No supplications match your search." : "لا توجد نتائج مطابقة لبحثك."}</p>
                        </div>
                    )}
                    <div className="shrink-0 w-full h-28 col-span-full"></div>
                </div>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 z-[200] bg-gray-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm text-center whitespace-nowrap flex items-center gap-2 border border-white/10"
                    >
                        <i className="fa-solid fa-check text-green-400"></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop to close floating menu when clicking anywhere */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 z-[1200] bg-transparent cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                    }}
                />
            )}

            {/* Floating Menu & Modern FAB */}
            <div 
                ref={fabContainerRef} 
                className={`fixed ${isEn ? 'left-5 items-start' : 'right-5 items-end'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col`}
                style={{ bottom: 'calc(env(safe-area-inset-bottom, 24px) + 32px)' }}
            >
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden w-56 z-0 border border-slate-100/80 dark:border-white/10`}
                            style={{ color: 'var(--text-color)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => { setActiveCategory('all'); setIsMenuOpen(false); }}
                                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                                style={activeCategory === 'all' ? { 
                                    backgroundColor: hexToRgba(primaryColor, 0.12), 
                                    color: primaryColor 
                                } : {}}
                            >
                                {isEn ? 'All Supplications' : 'الكل'}
                            </button>
                            <button 
                                onClick={() => { setActiveCategory('favorites'); setIsMenuOpen(false); }}
                                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between cursor-pointer"
                                style={activeCategory === 'favorites' ? { 
                                    backgroundColor: hexToRgba(primaryColor, 0.12), 
                                    color: primaryColor 
                                } : {}}
                            >
                                <span>{isEn ? 'Favorites' : 'المفضلة'}</span>
                                <i className="fa-solid fa-heart text-xs opacity-70"></i>
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />
                            {DUAA_CATEGORIES.map(category => (
                                <button 
                                    key={category.id}
                                    onClick={() => { setActiveCategory(category.id); setIsMenuOpen(false); }}
                                    className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between cursor-pointer"
                                    style={activeCategory === category.id ? { 
                                        backgroundColor: hexToRgba(primaryColor, 0.12), 
                                        color: primaryColor 
                                    } : {}}
                                >
                                    <span>{isEn ? (category.titleEn || category.title) : category.title}</span>
                                    <i className={`fa-solid ${category.icon} text-xs opacity-70`}></i>
                                </button>
                            ))}
                            <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />
                            <button 
                                onClick={handleResetAll}
                                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                            >
                                <span>{isEn ? 'Reset All Counters' : 'إعادة ضبط العدادات'}</span>
                                <i className="fa-solid fa-rotate-left text-xs opacity-70"></i>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FAB: Clean circle filled with primaryColor and elevated soft drop shadow */}
                <button 
                    ref={fabRef}
                    onClick={handleFabClick}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10 border-0"
                    style={{
                        backgroundColor: primaryColor,
                        color: btnTextColor,
                        boxShadow: `0 8px 25px ${hexToRgba(primaryColor, isBlackTheme ? 0.2 : 0.35)}`
                    }}
                    title={isEn ? "Categories Menu" : "قائمة التصنيفات"}
                    aria-label={isEn ? "Categories Menu" : "قائمة التصنيفات"}
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            {/* Zoom Modal */}
            <ZoomModal 
                zoomedDuaa={zoomedDuaa} 
                onClose={closeZoomModal} 
                setToastMessage={setToastMessage} 
            />
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
