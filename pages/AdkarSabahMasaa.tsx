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
import { Check } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ADKAR_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getToast3DStyles } from '../utils/toast3DStyles';

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
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000' || themeKey === 'deep_black' || theme.name === 'اسود' || theme.name === 'أبيض وأسود';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';

    const [adhkarTab, setAdhkarTab] = useState<'morning' | 'evening' | 'favorites'>(() => {
        if (navParams?.kind === 'morning' || navParams?.kind === 'evening') {
            return navParams.kind;
        }
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

    useEffect(() => {
        if (navParams?.kind === 'morning' || navParams?.kind === 'evening') {
            setAdhkarTab(navParams.kind);
        }
        if (navParams?.id !== undefined || navParams?.highlightId !== undefined) {
            const targetId = navParams.id ?? navParams.highlightId;
            setTimeout(() => {
                const el = document.getElementById(`dhikr-card-${targetId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2');
                    setTimeout(() => {
                        el.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2');
                    }, 2500);
                }
            }, 150);
        }
    }, [navParams]);
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
            className="h-[100dvh] flex flex-col relative overflow-hidden transition-colors" 
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

            <main ref={mainRef} className="w-full flex-1 min-h-0 overflow-y-auto px-4 pt-3 app-scroll-safe-fab">
                {/* Modern 3D Search bar */}
                <div className="mb-6 max-w-3xl mx-auto flex items-center gap-2.5 w-full" dir={isEn ? 'ltr' : 'rtl'}>
                    <div className={`app-page-card border-0 relative flex-1 rounded-2xl ${isBlackTheme ? 'bg-[#18181b]' : 'bg-white dark:bg-[#1E293B]'} transition-all focus-within:ring-2 focus-within:ring-opacity-40 flex items-center overflow-visible`}
                         style={{ 
                             '--tw-ring-color': primaryColor,
                         } as any}
                    >
                        <span
                            className={`app-3d-badge border-0 absolute ${isEn ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none`}
                            style={{
                                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : hexToRgba(primaryColor, 0.12),
                                color: isBlackTheme ? '#FFFFFF' : primaryColor,
                            }}
                            aria-hidden="true"
                        >
                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input 
                            type="text" 
                            placeholder={isEn ? "Search remembrances..." : "ابحث في الأذكار..."} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-transparent py-3 text-sm sm:text-base border-0 outline-none ${
                                isEn ? 'pl-12 pr-12 text-left font-sans' : 'pr-12 pl-12 text-right font-cairo'
                            } placeholder-gray-400 dark:placeholder-gray-500`}
                            style={{ color: 'var(--text-color)' }}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className={`app-page-card unified-3d-btn border-0 absolute ${isEn ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1E293B] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer`}
                                aria-label={isEn ? 'Clear search' : 'مسح البحث'}
                            >
                                <i className="fa-solid fa-times text-xs"></i>
                            </button>
                        )}
                    </div>
                </div>

                <div className={activeTabMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto" : "space-y-4 max-w-3xl mx-auto"}>
                    {filteredAdhkar.length > 0 ? (
                        filteredAdhkar.map((dhikr) => {
                            const currentCount = adhkarCounts[dhikr.globalIndex] ?? dhikr.count;
                            const isFinished = currentCount === 0;

                            return (
                                <div id={`dhikr-card-${dhikr.id ?? dhikr.globalIndex}`} key={dhikr.globalIndex} className="transition-all rounded-3xl">
                                    <DhikrCard
                                        dhikr={dhikr}
                                        currentCount={currentCount}
                                        isFinished={isFinished}
                                        onDecrement={() => !isFinished && handleDecrement(dhikr.globalIndex)}
                                        onReset={() => handleReset(dhikr.globalIndex, dhikr.count)}
                                        onZoom={() => openZoomModal(dhikr)}
                                        setToastMessage={setToastMessage}
                                    />
                                </div>
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
                className={`fixed app-fab-bottom ${isEn ? 'left-5 items-start' : 'right-5 items-end'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col`}
            >
                {isMenuOpen && (
                    <div
                        className={`app-page-card border-0 absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} bg-white dark:bg-[#1E293B] rounded-2xl p-2.5 pb-3 flex flex-col gap-2 overflow-visible w-52 z-0`}
                        style={{ color: 'var(--text-color)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                            <button 
                                type="button"
                                onClick={() => { setAdhkarTab('morning'); setIsMenuOpen(false); }}
                                className="app-page-card border-0 w-full text-start px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center justify-between cursor-pointer"
                                style={adhkarTab === 'morning' ? { 
                                    backgroundColor: primaryColor, 
                                    color: btnTextColor 
                                } : undefined}
                            >
                                <span>{isEn ? 'Morning Remembrances' : 'أذكار الصباح'}</span>
                                <i className="fa-solid fa-sun text-xs opacity-75"></i>
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setAdhkarTab('evening'); setIsMenuOpen(false); }}
                                className="app-page-card border-0 w-full text-start px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center justify-between cursor-pointer"
                                style={adhkarTab === 'evening' ? { 
                                    backgroundColor: primaryColor, 
                                    color: btnTextColor 
                                } : undefined}
                            >
                                <span>{isEn ? 'Evening Remembrances' : 'أذكار المساء'}</span>
                                <i className="fa-solid fa-moon text-xs opacity-75"></i>
                            </button>
                            <div className="app-3d-divider my-0.5 mx-1" />
                            <button 
                                type="button"
                                onClick={() => { 
                                    const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
                                    setFavorites(favs);
                                    setAdhkarTab('favorites'); 
                                    setIsMenuOpen(false); 
                                }}
                                className="app-page-card border-0 w-full text-start px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center justify-between cursor-pointer"
                                style={adhkarTab === 'favorites' ? { 
                                    backgroundColor: primaryColor, 
                                    color: btnTextColor 
                                } : undefined}
                            >
                                <span>{isEn ? 'Favorites' : 'المفضلة'}</span>
                                <i className="fa-solid fa-heart text-xs opacity-75"></i>
                            </button>
                            <div className="app-3d-divider my-0.5 mx-1" />
                            <button 
                                type="button"
                                onClick={handleResetAll}
                                className="app-page-card border-0 w-full text-start px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center justify-between cursor-pointer"
                            >
                                <span>{isEn ? 'Reset All Counters' : 'إعادة ضبط العدادات'}</span>
                            <i className="fa-solid fa-rotate-left text-xs opacity-75"></i>
                        </button>
                    </div>
                )}

                {/* FAB: 3D embossed circle filled with primaryColor */}
                <button 
                    type="button"
                    ref={fabRef}
                    onClick={handleFabClick}
                    className="app-page-card border-0 w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer relative z-10"
                    style={{
                        backgroundColor: primaryColor,
                        color: btnTextColor
                    }}
                    title={isEn ? "Remembrances Menu" : "قائمة الأذكار"}
                    aria-label={isEn ? "Remembrances Menu" : "قائمة الأذكار"}
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            <ZoomModal zoomedDhikr={zoomedDhikr} onClose={closeZoomModal} setToastMessage={setToastMessage} />

            {toastMessage && (
                <div 
                    className="app-3d-toast fixed left-1/2 -translate-x-1/2 z-[101] max-w-[85vw] w-max px-4 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2.5 text-xs sm:text-sm text-center leading-normal break-words pointer-events-none"
                    style={{
                        bottom: 'calc(var(--app-safe-bottom) + 1.25rem)',
                        ...toast3D.style,
                    }}
                >
                    <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={toast3D.iconStyle}
                    >
                        <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>{toastMessage}</span>
                </div>
            )}
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