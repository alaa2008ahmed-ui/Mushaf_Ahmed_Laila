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
import { LayoutGrid, ListFilter } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ADKAR_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const ADHKAR_STATUS_KEY = 'sabah_masaa_status_v1';

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

interface AdkarSabahMasaaProps {
    onBack: () => void;
    onNavigate: (page: string, params?: any) => void;
    navParams?: any;
}

function AdkarSabahMasaa({ onBack, onNavigate, navParams }: AdkarSabahMasaaProps) {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000' || themeKey === 'deep_black' || theme.name === 'اسود' || theme.name === 'أبيض وأسود';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';

    const [adhkarTab, setAdhkarTab] = useState<'morning' | 'evening' | 'favorites'>(() => {
        try {
            const pref = localStorage.getItem('adhkar_preferred_tab');
            if (pref === 'morning' || pref === 'evening') {
                localStorage.removeItem('adhkar_preferred_tab');
                return pref;
            }
        } catch {}
        const hour = new Date().getHours();
        return (hour >= 3 && hour < 15) ? 'morning' : 'evening';
    });
    const [activeTabMode, setActiveTabMode] = useState<'grid' | 'list'>('list');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    
    useEffect(() => {
        markPageAsSeen('adkar_sabah_masaa');
        if (!getGuideSeen('adkar_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);
    
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
        <div 
            className="h-screen flex flex-col relative transition-colors" 
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ 
                backgroundColor: isBlackTheme ? '#000000' : (theme.bgColor || (theme.isDark ? '#0F172A' : '#F5F7FA')) 
            }}
        >
            <AdkarHeader 
                title={pageTitle} 
                subtitle={pageSubtitle} 
                onBack={handleBack}
                onHome={handleGoHome}
                onOpenGuide={() => setShowGuide(true)}
            />

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
                            placeholder={isEn ? "Search remembrances..." : "ابحث في الأذكار..."} 
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
                            onClick={() => setActiveTabMode('grid')}
                            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer ${
                                activeTabMode === 'grid' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                            }`}
                            style={activeTabMode === 'grid' ? {
                                backgroundColor: primaryColor,
                                color: btnTextColor
                            } : { color: 'var(--text-color)' }}
                            title={isEn ? "Grid View" : "عرض شبكي"}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTabMode('list')}
                            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer ${
                                activeTabMode === 'list' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                            }`}
                            style={activeTabMode === 'list' ? {
                                backgroundColor: primaryColor,
                                color: btnTextColor
                            } : { color: 'var(--text-color)' }}
                            title={isEn ? "List View" : "عرض القوائم"}
                        >
                            <ListFilter size={16} />
                        </button>
                    </div>
                </div>

                <div className={activeTabMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto pb-4" : "space-y-4 max-w-3xl mx-auto pb-4"}>
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
                        <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center col-span-full">
                            <i className={`fa-solid ${searchQuery ? 'fa-search' : (adhkarTab === 'favorites' ? 'fa-heart' : 'fa-moon')} text-5xl mb-4`}></i>
                            <p className="font-bold">
                                {searchQuery 
                                    ? (isEn ? "No remembrances match your search" : "لا توجد نتائج مطابقة لبحثك")
                                    : (isEn ? "No remembrances to display currently" : "لا توجد أذكار لعرضها حالياً")}
                            </p>
                        </div>
                    )}
                    <div className="shrink-0 w-full h-28 col-span-full"></div>
                </div>
            </main>
            
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
                            initial={{ opacity: 0, scale: 0.9, y: menuOpenDirection === 'up' ? 10 : -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: menuOpenDirection === 'up' ? 10 : -10 }}
                            className={`absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex flex-col gap-1 w-52 z-0 border border-slate-100/80 dark:border-white/10`}
                            style={{ color: 'var(--text-color)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => { setAdhkarTab('morning'); setIsMenuOpen(false); }}
                                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between cursor-pointer"
                                style={adhkarTab === 'morning' ? { 
                                    backgroundColor: hexToRgba(primaryColor, 0.12), 
                                    color: primaryColor 
                                } : {}}
                            >
                                <span>{isEn ? 'Morning Remembrances' : 'أذكار الصباح'}</span>
                                <i className="fa-solid fa-sun text-xs opacity-70"></i>
                            </button>
                            <button 
                                onClick={() => { setAdhkarTab('evening'); setIsMenuOpen(false); }}
                                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between cursor-pointer"
                                style={adhkarTab === 'evening' ? { 
                                    backgroundColor: hexToRgba(primaryColor, 0.12), 
                                    color: primaryColor 
                                } : {}}
                            >
                                <span>{isEn ? 'Evening Remembrances' : 'أذكار المساء'}</span>
                                <i className="fa-solid fa-moon text-xs opacity-70"></i>
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />
                            <button 
                                onClick={() => { 
                                    const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
                                    setFavorites(favs);
                                    setAdhkarTab('favorites'); 
                                    setIsMenuOpen(false); 
                                }}
                                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between cursor-pointer"
                                style={adhkarTab === 'favorites' ? { 
                                    backgroundColor: hexToRgba(primaryColor, 0.12), 
                                    color: primaryColor 
                                } : {}}
                            >
                                <span>{isEn ? 'Favorites' : 'المفضلة'}</span>
                                <i className="fa-solid fa-heart text-xs opacity-70"></i>
                            </button>
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
                        className="fixed bottom-8 left-1/2 z-[101] bg-gray-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 whitespace-nowrap border border-white/10 text-sm"
                    >
                        <i className="fa-solid fa-check text-green-400"></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
            <CommunitySpotlightGuide
                isOpen={showGuide}
                onClose={() => {
                    setShowGuide(false);
                    markPageAsSeen('adkar_sabah_masaa');
                }}
                steps={ADKAR_PAGE_STEPS}
                guideKey="adkar_page_spotlight"
                isEn={isEn}
            />
        </div>
    );
}

export default AdkarSabahMasaa;