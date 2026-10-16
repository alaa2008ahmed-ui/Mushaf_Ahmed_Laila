// HisnAlmuslim component
import React, { useState, useEffect, useRef } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import HisnHeader from '../components/HisnAlmuslim/HisnHeader';
import CategoryList from '../components/HisnAlmuslim/CategoryList';
import CategoryDetail from '../components/HisnAlmuslim/CategoryDetail';
import ZoomModal from '../components/HisnAlmuslim/ZoomModal';
import { useTheme } from '../context/ThemeContext';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { motion, AnimatePresence } from 'motion/react';

const HISN_STATUS_KEY = 'hisn_almuslim_counts_v1';

function HisnAlmuslim({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [zoomedItem, setZoomedItem] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');
    const fabRef = useRef<HTMLButtonElement>(null);

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
            const t = selectedCategory.title;
            if (t.includes('صباح')) useHabitTracker.getState().recordAdhkarRead('sabah');
            if (t.includes('مساء')) useHabitTracker.getState().recordAdhkarRead('masaa');
            if (t.includes('صلاة')) useHabitTracker.getState().recordAdhkarRead('salah');
            if (t.includes('استغفار') || t.includes('دعاء') || t.includes('أدعية')) useHabitTracker.getState().recordAdhkarRead('adia');
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
            } else if (selectedCategory) {
                setSelectedCategory(null);
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedCategory, zoomedItem]);

    const handleBack = () => {
        if (zoomedItem) {
            setZoomedItem(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (zoomedItem) {
            setZoomedItem(null);
        }
        if (selectedCategory) {
            setSelectedCategory(null);
        }
        onNavigate('home');
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: theme.bgColor }}>
            <HisnHeader 
                title={selectedCategory ? selectedCategory.title : 'حصن المسلم'} 
                subtitle={selectedCategory ? `أذكار ${selectedCategory.title}` : 'استعرض أبواب وأذكار حصن المسلم بسهولة.'} 
                showThemePageLock={!selectedCategory}
                onBack={handleBack}
                onHome={handleGoHome}
            />

            <main className="flex-1 overflow-y-auto hide-scrollbar relative mx-auto w-full max-w-lg px-4 pb-6">
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
                            onSelectCategory={setSelectedCategory} 
                        />
                    )}
                </div>
                <div className="shrink-0 w-full h-8"></div>
            </main>

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
                                onClick={() => { setSelectedCategory(null); setIsMenuOpen(false); }}
                                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${!selectedCategory ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={!selectedCategory ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                كل الأبواب
                            </button>
                            <button 
                                onClick={() => { setSelectedCategory({ id: 'favorites', title: 'المفضلة' }); setIsMenuOpen(false); }}
                                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${selectedCategory?.id === 'favorites' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={selectedCategory?.id === 'favorites' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                <span>المفضلة</span>
                                <i className="fa-solid fa-heart text-red-500"></i>
                            </button>
                            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
                            <button 
                                onClick={handleResetAllHisn}
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

            <ZoomModal zoomedItem={zoomedItem} onClose={closeZoomModal} />

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
        </div>
    );
}

export default HisnAlmuslim;
