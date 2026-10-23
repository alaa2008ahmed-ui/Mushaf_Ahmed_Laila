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
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, ListFilter, Search, HelpCircle } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { HISN_ALMUSLIM_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const HISN_STATUS_KEY = 'hisn_almuslim_counts_v1';

function HisnAlmuslim({ onBack, onNavigate }) {
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
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [zoomedItem, setZoomedItem] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
    const [showGuide, setShowGuide] = useState(false);
    const fabRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        markPageAsSeen('hisn_almuslim');
        if (!getGuideSeen('hisn_almuslim_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);
    const fabContainerRef = useRef<HTMLDivElement>(null);

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
            className="h-screen flex flex-col overflow-hidden" 
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ 
                backgroundColor: theme.bgColor,
                fontFamily: isEn ? 'sans-serif' : theme.font
            }}
        >
            <HisnHeader 
                title={getPageTitle()} 
                subtitle={getPageSubtitle()} 
                showThemePageLock={!selectedCategory}
                onBack={handleBack}
                onHome={handleGoHome}
                onOpenGuide={() => setShowGuide(true)}
            />

            <main className="flex-1 overflow-y-auto hide-scrollbar relative mx-auto w-full max-w-3xl px-4 pb-6 flex flex-col">
                {!selectedCategory && (
                    <div className="mb-6 max-w-3xl mx-auto w-full flex items-center gap-2 z-10 shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
                        {/* Search Input */}
                        <div 
                            className="relative flex-1 border-2 rounded-2xl overflow-hidden focus-within:ring-2 transition-all shadow-sm" 
                            style={{ borderColor: cardBorderColor, ...(isDefaultTheme ? { focusRingColor: '#000'} : { focusRingColor: theme.palette[0]}) }}
                        >
                            <input 
                                type="text" 
                                placeholder={isEn ? "Search by name or meaning..." : "ابحث بالاسم أو المعنى..."} 
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
                <div className="shrink-0 w-full h-8"></div>
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
                className={`fixed bottom-3 ${isEn ? 'right-4 items-end' : 'right-4 items-end'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col`}
                dir={isEn ? 'ltr' : 'rtl'}
            >
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute right-0 ${menuOpenDirection === 'up' ? 'bottom-full mb-4 origin-bottom-right' : 'top-full mt-4 origin-top-right'} themed-card rounded-2xl shadow-xl border p-2 flex flex-col gap-1 overflow-hidden w-52 z-0`}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => { setSelectedCategory(null); setIsMenuOpen(false); }}
                                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${!selectedCategory ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={!selectedCategory ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                {isEn ? 'All Chapters' : 'كل الأبواب'}
                            </button>
                            <button 
                                onClick={() => { setSelectedCategory({ id: 'favorites', title: isEn ? 'Favorites' : 'المفضلة', titleAr: 'المفضلة' }); setIsMenuOpen(false); }}
                                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${selectedCategory?.id === 'favorites' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={selectedCategory?.id === 'favorites' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                <span>{isEn ? 'Favorites' : 'المفضلة'}</span>
                                <i className="fa-solid fa-heart text-red-500"></i>
                            </button>
                            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
                            <button 
                                onClick={handleResetAllHisn}
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
                    title={isEn ? "Chapters & options menu" : "قائمة الأبواب والخيارات"}
                    aria-label={isEn ? "Chapters & options menu" : "قائمة الأبواب والخيارات"}
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            <ZoomModal zoomedItem={zoomedItem} onClose={closeZoomModal} setToastMessage={setToastMessage} />

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[101] bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 whitespace-nowrap border border-white/10"
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
