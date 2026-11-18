// HisnAlmuslim component
import React, { useState, useEffect, useRef } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import HisnHeader from '../components/HisnAlmuslim/HisnHeader';
import CategoryList from '../components/HisnAlmuslim/CategoryList';
import CategoryDetail from '../components/HisnAlmuslim/CategoryDetail';
import ZoomModal from '../components/HisnAlmuslim/ZoomModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { HISN_CATEGORIES_EN } from '../data/hisnAlmuslimTranslationsEn';
import { LayoutGrid, ListFilter, Search, Check } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { HISN_ALMUSLIM_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';
import { getToast3DStyles } from '../utils/toast3DStyles';

import { HISN_ALMUSLIM_CATEGORIES, HISN_ALMUSLIM_DATA } from '../data/hisnAlmuslimData';

const HISN_STATUS_KEY = 'hisn_almuslim_counts_v1';

interface HisnAlmuslimProps {
    onBack: () => void;
    onNavigate: (page: string, params?: any) => void;
    navParams?: any;
}

function HisnAlmuslim({ onBack, onNavigate, navParams }: HisnAlmuslimProps) {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const { language } = useLanguage();
    const tokens = getModernFlatTokens(theme, themeKey);
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const isEn = language === 'en';
    const isBlackTheme = tokens.isDeepBlack;
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [zoomedItem, setZoomedItem] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
    const [showGuide, setShowGuide] = useState(false);
    const fabRef = useRef<HTMLButtonElement>(null);
    const fabContainerRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const scrollToTop = () => {
            if (mainRef.current) {
                try { mainRef.current.scrollTop = 0; } catch {}
                try { mainRef.current.scrollTo({ top: 0, behavior: 'instant' }); } catch {}
            }
            try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch {}
            try { document.documentElement.scrollTop = 0; } catch {}
            try { document.body.scrollTop = 0; } catch {}
            const scrollables = document.querySelectorAll('.overflow-y-auto, [class*="overflow-y-auto"]');
            scrollables.forEach(el => {
                try { el.scrollTop = 0; } catch {}
            });
        };

        scrollToTop();
        const t1 = setTimeout(scrollToTop, 20);
        const t2 = setTimeout(scrollToTop, 100);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [selectedCategory]);
    
    useEffect(() => {
        markPageAsSeen('hisn_almuslim');
        if (!getGuideSeen('hisn_almuslim_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);

    useEffect(() => {
        if (navParams?.categoryId || navParams?.itemId || navParams?.highlightId || navParams?.id || navParams?.text) {
            const catId = navParams.categoryId || navParams.highlightId;
            let found = HISN_ALMUSLIM_CATEGORIES.find(c => String(c.id) === String(catId));
            if (!found) {
                const targetText = navParams.text;
                const targetId = navParams.itemId || navParams.id;
                for (const [cId, items] of Object.entries(HISN_ALMUSLIM_DATA)) {
                    const match = (items as any[]).find((it: any, idx: number) => 
                        (targetId && (String(it.id) === String(targetId) || `${cId}_${idx}` === String(targetId))) ||
                        (targetText && it.text && (it.text.includes(targetText) || targetText.includes(it.text)))
                    );
                    if (match) {
                        found = HISN_ALMUSLIM_CATEGORIES.find(c => c.id === cId);
                        break;
                    }
                }
            }
            if (found) {
                setSelectedCategory(found);
                setZoomedItem(null);
            }
        }
    }, [navParams]);

    const [hisnCounts, setHisnCounts] = useState<{ [key: string]: number }>(() => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const stored = localStorage.getItem(HISN_STATUS_KEY);
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
            localStorage.setItem(HISN_STATUS_KEY, JSON.stringify({ date: today, counts: hisnCounts }));
        } catch (e) {
            console.error("Failed to save hisn status", e);
        }
    }, [hisnCounts]);

    const handleDecrementHisn = (itemKey: string, current: number) => {
        if (selectedCategory?.title) {
            const t = (selectedCategory.titleAr || selectedCategory.title || '').toLowerCase();
            if (t.includes('صباح') || t.includes('morning')) useHabitTracker.getState().recordAdhkarRead('sabah');
            if (t.includes('مساء') || t.includes('evening')) useHabitTracker.getState().recordAdhkarRead('masaa');
            if (t.includes('صلاة') || t.includes('prayer') || t.includes('salah')) useHabitTracker.getState().recordAdhkarRead('salah');
            if (t.includes('استغفار') || t.includes('دعاء') || t.includes('أدعية') || t.includes('supplication') || t.includes('forgiveness')) useHabitTracker.getState().recordAdhkarRead('adia');
        }
        if (current <= 0) return;
        setHisnCounts(prev => ({
            ...prev,
            [itemKey]: current - 1
        }));
    };

    const handleResetHisn = (itemKey: string, initCount: number) => {
        setHisnCounts(prev => ({
            ...prev,
            [itemKey]: initCount
        }));
    };

    const handleResetAllHisn = () => {
        setHisnCounts({});
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

    const openZoomModal = (item: any) => {
        setZoomedItem(item);
    };

    const closeZoomModal = () => {
        setZoomedItem(null);
    };

    useEffect(() => {
        const interceptor = () => {
            if (zoomedItem) {
                setZoomedItem(null);
                return true;
            } else if (isMenuOpen) {
                setIsMenuOpen(false);
                return true;
            } else if (selectedCategory) {
                setSelectedCategory(null);
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedCategory, zoomedItem, isMenuOpen]);

    const handleBack = () => {
        setSearchQuery('');
        if (zoomedItem) {
            setZoomedItem(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        setSearchQuery('');
        if (zoomedItem) {
            setZoomedItem(null);
        }
        if (selectedCategory) {
            setSelectedCategory(null);
        }
        onNavigate('home');
    };

    // Calculate dynamic header title and subtitle based on active language
    const getPageTitle = () => {
        if (!selectedCategory) {
            return isEn ? 'Fortress of the Muslim' : 'حصن المسلم';
        }
        if (selectedCategory.id === 'favorites') {
            return isEn ? 'Favorites' : 'المفضلة';
        }
        if (isEn) {
            return HISN_CATEGORIES_EN[selectedCategory.id]?.title || selectedCategory.title;
        }
        return selectedCategory.titleAr || selectedCategory.title;
    };

    const getPageSubtitle = () => {
        if (!selectedCategory) {
            return isEn ? 'Explore chapters and supplications of Fortress of the Muslim' : 'استعرض أبواب وأذكار حصن المسلم بسهولة.';
        }
        if (selectedCategory.id === 'favorites') {
            return isEn ? 'Your saved favorite supplications' : 'أذكار المفضلة';
        }
        if (isEn) {
            return HISN_CATEGORIES_EN[selectedCategory.id]?.subtitle || `Supplications of ${getPageTitle()}`;
        }
        return `أذكار ${selectedCategory.titleAr || selectedCategory.title} من حصن المسلم`;
    };

    return (
        <div 
            className="h-[100dvh] flex flex-col overflow-hidden" 
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ 
                backgroundColor: tokens.pageBgColor,
                fontFamily: isEn ? 'sans-serif' : "'Cairo', sans-serif"
            }}
        >
            <HisnHeader 
                title={getPageTitle()} 
                subtitle={getPageSubtitle()} 
                onBack={handleBack}
                onHome={handleGoHome}
                onOpenGuide={!selectedCategory ? () => setShowGuide(true) : undefined}
            />

            <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto hide-scrollbar relative mx-auto w-full max-w-3xl px-4 app-scroll-safe-fab pt-3">
                {!selectedCategory && (
                    <div className="mb-4 max-w-3xl mx-auto w-full flex items-center gap-2.5 z-10 shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
                        {/* Search Input */}
                        <div 
                            className={`app-page-card border-0 relative flex-1 rounded-2xl ${isBlackTheme ? 'bg-[#18181b]' : 'bg-white dark:bg-[#1E293B]'} overflow-visible transition-all focus-within:ring-2`} 
                            style={{ '--tw-ring-color': tokens.primaryColor } as any}
                        >
                            <input 
                                type="text" 
                                placeholder={isEn ? "Search by name or meaning..." : "ابحث بالاسم أو المعنى..."} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full bg-transparent py-3 text-sm ${isEn ? 'pl-12 pr-12 text-left font-sans' : 'pr-12 pl-12 text-right font-cairo'} focus:outline-none placeholder-gray-400 dark:placeholder-gray-500`}
                                style={{ color: 'var(--text-color)' }}
                            />
                            <span
                                className={`app-3d-badge border-0 absolute ${isEn ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none`}
                                style={{
                                    backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : hexToRgba(tokens.primaryColor, 0.12),
                                    color: isBlackTheme ? '#FFFFFF' : tokens.primaryColor,
                                }}
                                aria-hidden="true"
                            >
                                <i className="fa-solid fa-magnifying-glass text-xs"></i>
                            </span>
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

                        {/* View Mode Switch */}
                        <div 
                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] flex items-center p-1.5 rounded-2xl gap-1.5 shrink-0 overflow-visible"
                        >
                            <button
                                type="button"
                                onClick={() => setActiveTab('grid')}
                                className={`app-page-card border-0 bg-white dark:bg-[#1E293B] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'grid' ? '' : 'opacity-70 hover:opacity-100'}`}
                                style={activeTab === 'grid' ? {
                                    backgroundColor: tokens.primaryColor,
                                    color: isBlackTheme ? '#000000' : '#FFFFFF'
                                } : { color: 'var(--text-color)' }}
                                title={isEn ? "Grid View" : "عرض شبكي"}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('list')}
                                className={`app-page-card border-0 bg-white dark:bg-[#1E293B] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'list' ? '' : 'opacity-70 hover:opacity-100'}`}
                                style={activeTab === 'list' ? {
                                    backgroundColor: tokens.primaryColor,
                                    color: isBlackTheme ? '#000000' : '#FFFFFF'
                                } : { color: 'var(--text-color)' }}
                                title={isEn ? "List View" : "عرض القوائم"}
                            >
                                <ListFilter size={16} />
                            </button>
                        </div>
                    </div>
                )}

                <div>
                    {selectedCategory ? (
                        <CategoryDetail 
                            selectedCategory={selectedCategory} 
                            onZoom={openZoomModal} 
                            setToastMessage={setToastMessage}
                            counts={hisnCounts}
                            onDecrement={handleDecrementHisn}
                            onReset={handleResetHisn}
                            highlightIndex={navParams?.itemIndex}
                            highlightId={navParams?.id || navParams?.itemId}
                            highlightText={navParams?.text}
                        />
                    ) : (
                        <CategoryList 
                            onSelectCategory={(cat) => {
                                setSearchQuery('');
                                setSelectedCategory(cat);
                            }}
                            activeTab={activeTab}
                            searchQuery={searchQuery}
                        />
                    )}
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
            <div 
                ref={fabContainerRef} 
                className={`fixed app-fab-bottom ${isEn ? 'right-4 items-end' : 'right-4 items-end'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col`}
                dir={isEn ? 'ltr' : 'rtl'}
            >
                {isMenuOpen && (
                    <div
                        className={`app-page-card border-0 absolute right-0 ${menuOpenDirection === 'up' ? 'bottom-full mb-4 origin-bottom-right' : 'top-full mt-4 origin-top-right'} bg-white dark:bg-[#1E293B] rounded-2xl p-2.5 pb-3 flex flex-col gap-2 overflow-visible w-52 z-0`}
                        style={{ color: 'var(--text-color)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                            <button 
                                type="button"
                                onClick={() => { setSelectedCategory(null); setIsMenuOpen(false); }}
                                className={`app-page-card border-0 w-full ${isEn ? 'text-left' : 'text-right'} px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all cursor-pointer`}
                                style={!selectedCategory ? { backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0], color: isBlackTheme ? '#000000' : '#FFFFFF' } : undefined}
                            >
                                {isEn ? 'All Chapters' : 'كل الأبواب'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setSelectedCategory({ id: 'favorites', title: isEn ? 'Favorites' : 'المفضلة', titleAr: 'المفضلة' }); setIsMenuOpen(false); }}
                                className={`app-page-card border-0 w-full ${isEn ? 'text-left' : 'text-right'} px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center justify-between cursor-pointer`}
                                style={selectedCategory?.id === 'favorites' ? { backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0], color: isBlackTheme ? '#000000' : '#FFFFFF' } : undefined}
                            >
                                <span>{isEn ? 'Favorites' : 'المفضلة'}</span>
                                <i className={`fa-solid fa-heart ${selectedCategory?.id === 'favorites' ? '' : 'text-red-500'}`}></i>
                            </button>
                            <div className="app-3d-divider my-0.5 mx-1" />
                            <button 
                                type="button"
                                onClick={handleResetAllHisn}
                                className={`app-page-card border-0 w-full ${isEn ? 'text-left' : 'text-right'} px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center justify-between cursor-pointer`}
                            >
                                <span>{isEn ? 'Reset All Counters' : 'إعادة ضبط العدادات'}</span>
                            <i className="fa-solid fa-rotate-left text-xs opacity-75"></i>
                        </button>
                    </div>
                )}

                <button 
                    type="button"
                    ref={fabRef}
                    onClick={handleFabClick}
                    className={`app-page-card border-0 w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer relative z-10 ${themeKey === 'default' ? 'text-black' : (isBlackTheme ? 'text-black' : 'text-white')}`}
                    style={
                        themeKey === 'default'
                        ? { backgroundColor: '#ffffff' }
                        : { backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }
                    }
                    title={isEn ? "Chapters & options menu" : "قائمة الأبواب والخيارات"}
                    aria-label={isEn ? "Chapters & options menu" : "قائمة الأبواب والخيارات"}
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            <ZoomModal zoomedItem={zoomedItem} onClose={closeZoomModal} setToastMessage={setToastMessage} />

            {toastMessage && (
                <div 
                    className="app-3d-toast fixed left-1/2 -translate-x-1/2 z-[101] max-w-[85vw] w-max px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-center leading-normal break-words pointer-events-none flex items-center justify-center gap-2.5"
                    style={{
                        bottom: 'calc(var(--app-safe-bottom) + 5.25rem)',
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
                    markPageAsSeen('hisn_almuslim');
                }}
                steps={HISN_ALMUSLIM_PAGE_STEPS}
                guideKey="hisn_almuslim_page_spotlight"
                isEn={isEn}
            />
        </div>
    );
}

export default HisnAlmuslim;
