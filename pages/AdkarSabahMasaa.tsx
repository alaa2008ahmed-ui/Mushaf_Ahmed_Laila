import React, { useState, useEffect, useRef } from 'react';
import { BASE_ADHKAR_MORNING, BASE_ADHKAR_EVENING } from '../data/adkarSabahMasaaData';
import { getAdhkarTranslation } from '../data/adkarTranslationsEn';
import { registerBackInterceptor } from '../hooks/useBackButton';
import AdkarHeader from '../components/AdkarSabahMasaa/AdkarHeader';
import DhikrCard from '../components/HisnAlmuslim/DhikrCard';
import ZoomModal from '../components/AdkarSabahMasaa/ZoomModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { motion, AnimatePresence } from 'framer-motion';

const ADHKAR_STATUS_KEY = 'sabah_masaa_status_v1';

interface AdkarSabahMasaaProps {
    onBack: () => void;
    onNavigate: (page: string, params?: any) => void;
}

function AdkarSabahMasaa({ onBack, onNavigate }: AdkarSabahMasaaProps) {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));

    const [adhkarTab, setAdhkarTab] = useState<'morning' | 'evening' | 'favorites'>('morning');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');
    const fabRef = useRef<HTMLButtonElement>(null);
    const fabContainerRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);

    const morningWithIndex = BASE_ADHKAR_MORNING.map((d, i) => ({ 
        ...d, 
        globalIndex: i, 
        category: 'أذكار الصباح',
        categoryEn: 'Morning Remembrances' 
    }));
    const eveningWithIndex = BASE_ADHKAR_EVENING.map((d, i) => ({ 
        ...d, 
        globalIndex: i + BASE_ADHKAR_MORNING.length, 
        category: 'أذكار المساء',
        categoryEn: 'Evening Remembrances' 
    }));
    const mergedAdhkar = [...morningWithIndex, ...eveningWithIndex];

    const [adhkarCounts, setAdhkarCounts] = useState(() => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const stored = localStorage.getItem(ADHKAR_STATUS_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.date === today && data.counts) {
                    return data.counts;
                }
            }
        } catch (e) {}
        
        return Object.fromEntries(mergedAdhkar.map((dhikr) => [dhikr.globalIndex, dhikr.count]));
    });

    const [zoomedDhikr, setZoomedDhikr] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const loadFavs = () => {
            try {
                const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
                setFavorites(favs);
            } catch (e) {}
        };
        loadFavs();
        
        window.addEventListener('storage', loadFavs);
        return () => window.removeEventListener('storage', loadFavs);
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        try {
            localStorage.setItem(ADHKAR_STATUS_KEY, JSON.stringify({ date: today, counts: adhkarCounts }));
        } catch (e) {
            console.error("Failed to save adhkar status", e);
        }
    }, [adhkarCounts]);

    useEffect(() => {
        const interceptor = () => {
            if (zoomedDhikr) {
                setZoomedDhikr(null);
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
    }, [zoomedDhikr, isMenuOpen]);


    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [adhkarTab]);

    const handleDecrement = (globalIndex: number) => {
        if (zoomedDhikr) return;
        
        const dhikr = mergedAdhkar[globalIndex];
        if (dhikr) {
            if (dhikr.category === 'أذكار الصباح' || adhkarTab === 'morning') {
                useHabitTracker.getState().recordAdhkarRead('sabah');
            } else if (dhikr.category === 'أذكار المساء' || adhkarTab === 'evening') {
                useHabitTracker.getState().recordAdhkarRead('masaa');
            }
        }

        if (adhkarCounts[globalIndex] === 0) return;

        setAdhkarCounts(prev => ({
            ...prev,
            [globalIndex]: prev[globalIndex] - 1
        }));
    };

    const handleReset = (globalIndex: number, initCount: number) => {
        setAdhkarCounts(prev => ({
            ...prev,
            [globalIndex]: initCount
        }));
    };

    const handleResetAll = () => {
        const resetMap = Object.fromEntries(mergedAdhkar.map((d) => [d.globalIndex, d.count]));
        setAdhkarCounts(resetMap);
        setIsMenuOpen(false);
        setToastMessage(isEn ? 'All counters have been reset' : 'تمت إعادة ضبط جميع العدادات');
        setTimeout(() => setToastMessage(''), 2000);
    };
    
    const openZoomModal = (dhikr: any) => {
        setZoomedDhikr(dhikr);
    };

    const closeZoomModal = () => {
        setZoomedDhikr(null);
    };

    const handleBack = () => {
        if (zoomedDhikr) {
            setZoomedDhikr(null);
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (zoomedDhikr) {
            setZoomedDhikr(null);
        }
        onNavigate('home');
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

    const filteredAdhkar = mergedAdhkar.filter(dhikr => {
        let matchesTab = false;
        if (adhkarTab === 'morning') matchesTab = dhikr.category === 'أذكار الصباح';
        else if (adhkarTab === 'evening') matchesTab = dhikr.category === 'أذكار المساء';
        else if (adhkarTab === 'favorites') matchesTab = favorites.includes(dhikr.text);

        if (!matchesTab) return false;

        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;

        const trans = getAdhkarTranslation(dhikr.text);
        const textEn = (trans?.text || '').toLowerCase();
        const sourceEn = (trans?.source || '').toLowerCase();
        const textAr = dhikr.text.toLowerCase();
        const sourceAr = (dhikr.source || '').toLowerCase();

        return textAr.includes(query) || textEn.includes(query) || sourceAr.includes(query) || sourceEn.includes(query);
    });

    const pageTitle = adhkarTab === 'morning' 
        ? (isEn ? "Morning Remembrances" : "أذكار الصباح")
        : adhkarTab === 'evening' 
            ? (isEn ? "Evening Remembrances" : "أذكار المساء")
            : (isEn ? "Favorite Remembrances" : "الأذكار المفضلة");

    const pageSubtitle = adhkarTab === 'favorites' 
        ? (isEn ? "Your selected remembrances for quick access" : "أذكارك التي اخترتها للوصول السريع")
        : (isEn ? "Track your daily remembrances with an interactive counter" : "تابع أذكـارك اليومية مع عداد تفاعلي وواجهة سهلة");

    return (
        <div className="h-screen flex flex-col bg-transparent relative" dir={isEn ? 'ltr' : 'rtl'}>
            <AdkarHeader 
                title={pageTitle} 
                subtitle={pageSubtitle} 
                onBack={handleBack}
                onHome={handleGoHome}
            />

            <main ref={mainRef} className="w-full flex-1 flex flex-col items-center overflow-hidden px-4 pt-2 pb-4 relative">
                {/* Search bar */}
                <div className="w-full max-w-lg mb-3">
                    <div 
                        className="relative w-full border-2 rounded-2xl overflow-hidden focus-within:ring-2 transition-all shadow-sm" 
                        style={{ borderColor: cardBorderColor, ...(themeKey === 'default' ? { focusRingColor: '#000'} : { focusRingColor: theme.palette[0]}) }}
                    >
                        <input 
                            type="text" 
                            placeholder={isEn ? "Search remembrances..." : "ابحث في الأذكار..."} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-black/5 dark:bg-white/5 py-2.5 ${isEn ? 'pl-11 pr-4 text-left font-sans' : 'pr-11 pl-4 text-right font-kufi'} focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-sm`}
                            style={{ color: 'var(--text-color)' }}
                        />
                        <i 
                            className={`fa-solid fa-search absolute ${isEn ? 'left-3.5' : 'right-3.5'} top-1/2 transform -translate-y-1/2 opacity-50 text-sm`} 
                            style={{ color: 'var(--text-color)' }}
                        ></i>
                    </div>
                </div>

                <div className="w-full max-w-lg flex-1 overflow-y-auto hide-scrollbar mt-0 space-y-3 pb-4">
                    {filteredAdhkar.length > 0 ? (
                        filteredAdhkar.map((dhikr) => {
                            const currentCount = adhkarCounts[dhikr.globalIndex] ?? dhikr.count;
                            const isFinished = currentCount === 0;

                            return (
                                <DhikrCard
                                    key={dhikr.globalIndex}
                                    dhikr={dhikr}
                                    currentCount={currentCount}
                                    isFinished={isFinished}
                                    onDecrement={() => !isFinished && handleDecrement(dhikr.globalIndex)}
                                    onReset={() => handleReset(dhikr.globalIndex, dhikr.count)}
                                    onZoom={() => openZoomModal(dhikr)}
                                    setToastMessage={setToastMessage}
                                />
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
                            <i className={`fa-solid ${searchQuery ? 'fa-search' : (adhkarTab === 'favorites' ? 'fa-heart' : 'fa-moon')} text-5xl mb-4`}></i>
                            <p className="font-bold">
                                {searchQuery 
                                    ? (isEn ? "No remembrances match your search" : "لا توجد نتائج مطابقة لبحثك")
                                    : (isEn ? "No remembrances to display currently" : "لا توجد أذكار لعرضها حالياً")}
                            </p>
                        </div>
                    )}
                    <div className="shrink-0 w-full h-32"></div>
                </div>
            </main>
            
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
                            initial={{ opacity: 0, scale: 0.9, y: menuOpenDirection === 'up' ? 10 : -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: menuOpenDirection === 'up' ? 10 : -10 }}
                            className={`absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-4' : 'top-full mt-4'} themed-card rounded-2xl shadow-2xl border p-2 flex flex-col gap-1 w-52 z-0`}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => { setAdhkarTab('morning'); setIsMenuOpen(false); }}
                                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${adhkarTab === 'morning' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={adhkarTab === 'morning' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                <span>{isEn ? 'Morning Remembrances' : 'أذكار الصباح'}</span>
                                <i className="fa-solid fa-sun text-xs opacity-70"></i>
                            </button>
                            <button 
                                onClick={() => { setAdhkarTab('evening'); setIsMenuOpen(false); }}
                                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${adhkarTab === 'evening' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={adhkarTab === 'evening' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                <span>{isEn ? 'Evening Remembrances' : 'أذكار المساء'}</span>
                                <i className="fa-solid fa-moon text-xs opacity-70"></i>
                            </button>
                            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
                            <button 
                                onClick={() => { 
                                    const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
                                    setFavorites(favs);
                                    setAdhkarTab('favorites'); 
                                    setIsMenuOpen(false); 
                                }}
                                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${adhkarTab === 'favorites' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={adhkarTab === 'favorites' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                <span>{isEn ? 'Favorites' : 'المفضلة'}</span>
                                <i className="fa-solid fa-heart text-xs opacity-70"></i>
                            </button>
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
                    title={isEn ? "Remembrances Menu" : "قائمة الأذكار"}
                    aria-label={isEn ? "Remembrances Menu" : "قائمة الأذكار"}
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            <ZoomModal zoomedDhikr={zoomedDhikr} onClose={closeZoomModal} setToastMessage={setToastMessage} />

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 z-[101] bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 whitespace-nowrap border border-white/10"
                    >
                        <i className="fa-solid fa-check text-green-400"></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdkarSabahMasaa;