import React, { useState, useEffect, useRef } from 'react';
import BottomBar from '../components/BottomBar';
import { BASE_ADHKAR_MORNING, BASE_ADHKAR_EVENING } from '../data/adkarSabahMasaaData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import AdkarHeader from '../components/AdkarSabahMasaa/AdkarHeader';
import DhikrCard from '../components/HisnAlmuslim/DhikrCard';
import ZoomModal from '../components/AdkarSabahMasaa/ZoomModal';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

const ADHKAR_STATUS_KEY = 'sabah_masaa_status_v1';

function AdkarSabahMasaa({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const [adhkarTab, setAdhkarTab] = useState<'morning' | 'evening' | 'favorites'>('morning');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');
    const fabRef = useRef<HTMLButtonElement>(null);

    const morningWithIndex = BASE_ADHKAR_MORNING.map((d, i) => ({ ...d, globalIndex: i, category: 'أذكار الصباح' }));
    const eveningWithIndex = BASE_ADHKAR_EVENING.map((d, i) => ({ ...d, globalIndex: i + BASE_ADHKAR_MORNING.length, category: 'أذكار المساء' }));
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

    const [zoomedDhikr, setZoomedDhikr] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const loadFavs = () => {
            try {
                const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
                setFavorites(favs);
            } catch (e) {}
        };
        loadFavs();
        
        // Listen for storage changes if other components update favorites
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

    const handleDecrement = (globalIndex) => {
        if (zoomedDhikr) return;
        if (adhkarCounts[globalIndex] === 0) return;

        setAdhkarCounts(prev => ({
            ...prev,
            [globalIndex]: prev[globalIndex] - 1
        }));
    };
    
    const openZoomModal = (dhikr) => {
        setZoomedDhikr(dhikr);
    };

    const closeZoomModal = () => {
        setZoomedDhikr(null);
    };

    const handleHomeClick = () => {
        if (zoomedDhikr) {
            setZoomedDhikr(null);
        } else {
            onBack();
        }
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
        if (adhkarTab === 'morning') return dhikr.category === 'أذكار الصباح';
        if (adhkarTab === 'evening') return dhikr.category === 'أذكار المساء';
        if (adhkarTab === 'favorites') return favorites.includes(dhikr.text);
        return true;
    });

    return (
        <div className="h-screen flex flex-col bg-transparent relative">
            <AdkarHeader 
                title={adhkarTab === 'morning' ? "أذكار الصباح" : adhkarTab === 'evening' ? "أذكار المساء" : "الأذكار المفضلة"} 
                subtitle={adhkarTab === 'favorites' ? "أذكارك التي اخترتها للوصول السريع" : "تابع أذكـارك اليومية مع عداد تفاعلي وواجهة سهلة"} 
            />

            <main className="w-full flex-1 flex flex-col items-center overflow-hidden px-4 pt-0 pb-4 relative">
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
                                    onZoom={() => openZoomModal(dhikr)}
                                    setToastMessage={setToastMessage}
                                />
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
                            <i className={`fa-solid ${adhkarTab === 'favorites' ? 'fa-heart' : 'fa-moon'} text-5xl mb-4`}></i>
                            <p className="font-bold">لا توجد أذكار لعرضها حالياً</p>
                        </div>
                    )}
                    <div className="shrink-0 w-full h-32"></div>
                </div>
            </main>
            
            {/* Floating Menu & FAB */}
            <div className="fixed bottom-20 right-4 z-[90] flex flex-col items-end">
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: menuOpenDirection === 'up' ? 10 : -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: menuOpenDirection === 'up' ? 10 : -10 }}
                            className={`absolute right-0 ${menuOpenDirection === 'up' ? 'bottom-full mb-4 origin-bottom-right' : 'top-full mt-4 origin-top-right'} themed-card rounded-2xl shadow-2xl border p-2 flex flex-col gap-1 w-48 z-0`}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                        >
                            <button 
                                onClick={() => { setAdhkarTab('morning'); setIsMenuOpen(false); }}
                                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${adhkarTab === 'morning' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={adhkarTab === 'morning' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                أذكار الصباح
                                <i className="fa-solid fa-sun text-xs opacity-70"></i>
                            </button>
                            <button 
                                onClick={() => { setAdhkarTab('evening'); setIsMenuOpen(false); }}
                                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${adhkarTab === 'evening' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={adhkarTab === 'evening' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                أذكار المساء
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
                                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${adhkarTab === 'favorites' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={adhkarTab === 'favorites' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                المفضلة
                                <i className="fa-solid fa-heart text-xs opacity-70"></i>
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

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            <ZoomModal zoomedDhikr={zoomedDhikr} onClose={closeZoomModal} />

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-24 left-1/2 z-[101] bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 whitespace-nowrap border border-white/10"
                    >
                        <i className="fa-solid fa-spinner fa-spin text-primary" style={{ color: theme.palette[0] }}></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdkarSabahMasaa;