
import React, { useState, useEffect, useRef } from 'react';
import BottomBar from '../components/BottomBar';
import { registerBackInterceptor } from '../hooks/useBackButton';
import HisnHeader from '../components/HisnAlmuslim/HisnHeader';
import CategoryList from '../components/HisnAlmuslim/CategoryList';
import CategoryDetail from '../components/HisnAlmuslim/CategoryDetail';
import ZoomModal from '../components/HisnAlmuslim/ZoomModal';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

function HisnAlmuslim({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [zoomedItem, setZoomedItem] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuOpenDirection, setMenuOpenDirection] = useState('up');
    const fabRef = useRef(null);

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

    const openZoomModal = (item) => {
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

    const handleHomeClick = () => {
        if (zoomedItem) {
            setZoomedItem(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            onBack();
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: theme.bgColor }}>
            <HisnHeader 
                title={selectedCategory ? selectedCategory.title : 'حصن المسلم'} 
                subtitle={selectedCategory ? `أذكار ${selectedCategory.title}` : 'استعرض أبواب وأذكار حصن المسلم بسهولة.'} 
                showThemePageLock={!selectedCategory}
            />

            <main className="flex-1 overflow-y-auto hide-scrollbar relative mx-auto w-full max-w-lg px-4 pb-4">
                <div>
                    {selectedCategory ? (
                        <CategoryDetail 
                            selectedCategory={selectedCategory} 
                            onZoom={openZoomModal} 
                            setToastMessage={setToastMessage} 
                        />
                    ) : (
                        <CategoryList 
                            onSelectCategory={setSelectedCategory} 
                        />
                    )}
                </div>
                <div className="shrink-0 w-full h-32"></div>
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            {/* Floating Menu & FAB */}
            <div className="fixed bottom-20 right-4 z-[90] flex flex-col items-end">
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
                        <i className="fa-solid fa-spinner fa-spin text-primary" style={{ color: theme.palette[0] }}></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default HisnAlmuslim;
