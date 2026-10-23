import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { baseAthkar, specialZikr, prayerOptions, fajrDhikr, fajrMaghribDhikr, SalahDhikrItem } from '../data/athkarAlSalahData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { useLanguage } from '../context/LanguageContext';
import { BottomSalahGuides } from '../components/AthkarAlSalah/BottomSalahGuides';
import { LayoutGrid, ListFilter, Search, HelpCircle } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ATHKAR_SALAH_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const SalahZikrCard = ({ 
    zikr, 
    theme, 
    themeKey, 
    prayerTitle,
    prayerTitleEn,
    onDecrement, 
    onZoom, 
    setToastMessage 
}: { 
    zikr: any; 
    theme: any; 
    themeKey?: string; 
    prayerTitle?: string;
    prayerTitleEn?: string;
    onDecrement: () => void; 
    onZoom: () => void; 
    setToastMessage: (msg: string) => void;
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name === 'الافتراضي' || !!theme.isOriginal || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? 'rgba(255, 255, 255, 0.2)' 
            : (theme.palette?.[0] + '33' || 'rgba(0, 0, 0, 0.08)'));
    const [isFav, setIsFav] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);
    const isFinished = zikr.currentCount === 0;
    const textClass = zikr.isQuran ? 'font-amiri text-2xl text-center leading-relaxed' : 'text-lg leading-loose font-medium text-center';

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
        setIsFav(favs.includes(zikr.text));
    }, [zikr.text]);

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const currentText = isEn ? (zikr.textEn || zikr.text) : zikr.text;
    const isPlaying = playingText === currentText || playingText === zikr.text;

    const toggleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
        let newFavs;
        if (isFav) {
            newFavs = favs.filter((t: string) => t !== zikr.text);
        } else {
            newFavs = [...favs, zikr.text];
        }
        localStorage.setItem('favorite_dhikr', JSON.stringify(newFavs));
        setIsFav(!isFav);
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        const textToPlay = isEn ? (zikr.textEn || zikr.text) : zikr.text;
        playTTS(textToPlay, { 
            onToast: (msg) => {
                if (isEn) {
                    if (msg.includes('جاري تشغيل')) setToastMessage('Playing audio...');
                    else if (msg.includes('تم إيقاف')) setToastMessage('Audio stopped');
                    else setToastMessage(msg);
                } else {
                    setToastMessage(msg);
                }
            }, 
            categoryId: isEn ? undefined : 'hisn_25' 
        });
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        let textToCopy = '';
        if (isEn) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = zikr.textEn || zikr.text;
            textToCopy = tempDiv.textContent || tempDiv.innerText || "";
        } else {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = zikr.text;
            textToCopy = tempDiv.textContent || tempDiv.innerText || "";
        }
        navigator.clipboard.writeText(textToCopy);
        setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const fallbackTitle = isEn ? 'Prayer Remembrance' : 'أذكار ما بعد الصلاة';
        const itemTitle = isEn 
            ? (zikr.titleEn || (prayerTitleEn ? `${prayerTitleEn} Adhkar` : fallbackTitle)) 
            : (zikr.title || (prayerTitle ? `أذكار صلاة ${prayerTitle}` : fallbackTitle));
        const itemCategory = isEn 
            ? (prayerTitleEn ? `${prayerTitleEn} Adhkar` : 'Prayer Remembrances') 
            : (prayerTitle ? `أذكار صلاة ${prayerTitle}` : 'أذكار الصلاة');
        const itemNote = isEn ? (zikr.noteEn || zikr.note) : zikr.note;

        await shareAsImage({
            text: isEn ? (zikr.textEn || zikr.text) : zikr.text,
            title: itemTitle,
            source: itemNote,
            category: itemCategory,
            theme,
            isEn: isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage
        });
    };

    const displayTitle = isEn ? (zikr.titleEn || '') : zikr.title;
    const displayNote = isEn ? (zikr.noteEn || zikr.note) : zikr.note;

    return (
        <div 
            className={`themed-card p-5 pb-2 rounded-2xl border relative overflow-hidden group mb-4 transition-all duration-300 ${isFinished ? 'opacity-60' : 'cursor-pointer'}`} 
            onClick={onDecrement}
            style={{
                borderColor: cardBorderColor,
                borderWidth: '1.5px',
                borderStyle: 'solid'
            }}
        >
            <div className={`flex justify-between items-start mb-2 ${isEn ? 'flex-row' : ''}`}>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold shadow-sm" style={{backgroundColor: theme.palette[1]+'30', color: theme.palette[1]}}>
                    {displayNote}
                </span>
                <div 
                    className={`count-badge w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md transform transition-transform`} 
                    style={
                        isFinished 
                        ? { backgroundColor: 'var(--badge-finished-bg)', color: 'var(--badge-finished-text)' } 
                        : (isDefaultTheme 
                            ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' } 
                            : { backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.name === 'اسود' ? '#000000' : '#ffffff' }
                        )
                    }
                >
                    {isFinished ? <i className="fa-solid fa-check"></i> : zikr.currentCount}
                </div>
            </div>

            {displayTitle && (
                <h3 className="text-center font-bold mb-2 text-sm" style={{color: theme.palette[1]}}>
                    {displayTitle}
                </h3>
            )}

            {/* When in English mode, display ONLY the English text. Never display Arabic text. */}
            {isEn ? (
                <div 
                    className="text-base sm:text-lg leading-relaxed text-center font-medium font-sans select-none my-3 text-balance" 
                    dir="ltr" 
                    dangerouslySetInnerHTML={{ __html: zikr.textEn || zikr.text }}
                ></div>
            ) : (
                <div className={`${textClass} select-none`} dangerouslySetInnerHTML={{ __html: zikr.text }}></div>
            )}
            
            <div className={`flex justify-between items-center mt-4 mb-3 pt-3 border-t border-black/5 dark:border-white/5 ${isEn ? 'flex-row' : ''}`}>
                <button 
                    onClick={toggleFav} 
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                    title={isEn ? (isFav ? 'Remove from favorites' : 'Add to favorites') : (isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة')}
                    aria-label={isEn ? 'Favorite' : 'المفضلة'}
                >
                    <i className={`fa-heart ${isFav ? 'fa-solid text-red-500' : 'fa-regular text-gray-500 dark:text-gray-400'}`}></i>
                </button>
                <div className="flex gap-2">
                   <button 
                       onClick={(e) => { e.stopPropagation(); onZoom(); }} 
                       className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" 
                       title={isEn ? "Zoom" : "تكبير"}
                       aria-label={isEn ? "Zoom" : "تكبير"}
                   >
                       <i className="fa-solid fa-magnifying-glass-plus"></i>
                   </button>
                   <button 
                       onClick={handleCopy} 
                       className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" 
                       title={isEn ? "Copy" : "نسخ"}
                       aria-label={isEn ? "Copy" : "نسخ"}
                   >
                       <i className="fa-regular fa-copy"></i>
                   </button>
                   <button 
                       onClick={handleShare} 
                       className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" 
                       title={isEn ? "Share" : "مشاركة"}
                       aria-label={isEn ? "Share" : "مشاركة"}
                   >
                       <i className="fa-solid fa-share-nodes"></i>
                   </button>
                   <button 
                       onClick={handlePlayAudio} 
                       className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" 
                       style={{ color: isPlaying ? '#ef4444' : 'inherit' }}
                       title={isEn ? (isPlaying ? "Stop listening" : "Listen audio") : (isPlaying ? "إيقاف الاستماع" : "استماع صوتي")}
                       aria-label={isEn ? "Listen audio" : "استماع صوتي"}
                   >
                       <i className={`fa-solid ${isPlaying ? 'fa-circle-pause text-red-500 animate-pulse' : 'fa-volume-high'}`}></i>
                   </button>
                </div>
            </div>

            {!isFinished && <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition pointer-events-none" style={{backgroundColor: theme.palette[0]+'15'}}></div>}
        </div>
    );
};

interface AthkarAlSalahProps {
    onBack: () => void;
    onNavigate: (page: string, params?: any) => void;
}

function AthkarAlSalah({ onBack, onNavigate }: AthkarAlSalahProps) {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name === 'الافتراضي' || !!theme.isOriginal || !themeKey;
    const cardBorderColor = isBlackTheme ? '#222222' : (theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)');
    const [currentPrayer, setCurrentPrayer] = useState<{ id: string; title: string; titleEn?: string } | null>(null);
    const [athkarList, setAthkarList] = useState<any[]>([]);
    const [zoomedZikr, setZoomedZikr] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isFavoritesView, setIsFavoritesView] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('athkar_salah');
        if (!getGuideSeen('athkar_salah_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);
    const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');
    const [activeTab, setActiveTab] = useState<'grid' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const fabRef = useRef<HTMLButtonElement>(null);
    const fabContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadFavs = () => {
            const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
            setFavorites(favs);
        };
        loadFavs();
        window.addEventListener('storage', loadFavs);
        return () => window.removeEventListener('storage', loadFavs);
    }, []);

    useEffect(() => {
        const interceptor = () => {
            if (zoomedZikr) {
                setZoomedZikr(null);
                return true;
            }
            if (isMenuOpen) {
                setIsMenuOpen(false);
                return true;
            }
            if (isFavoritesView) {
                setIsFavoritesView(false);
                return true;
            }
            if (currentPrayer) {
                setCurrentPrayer(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedZikr, currentPrayer, isFavoritesView, isMenuOpen]);

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

    const openPrayer = (prayerId: string, titleText: string, titleEnText?: string) => {
        setSearchQuery('');
        let currentAthkarData: SalahDhikrItem[] = JSON.parse(JSON.stringify(baseAthkar));

        // Handle common Fajr/Maghrib changes
        if (prayerId === 'fajr' || prayerId === 'maghrib') {
            // Change Mu'awwidhat count to 3
            currentAthkarData.forEach(z => {
                if (['ikhlas', 'falaq', 'naas'].includes(z.id)) {
                    z.count = 3;
                    z.note = "3 مرات";
                    z.noteEn = "3 times";
                }
            });
            
            // Add 10x Tahleel before tasbeeh
            const tasbeehIndex = currentAthkarData.findIndex(z => z.id === 'tasbeeh');
            if (tasbeehIndex !== -1) {
                currentAthkarData.splice(tasbeehIndex, 0, specialZikr);
            }
        }
        
        // Find index to insert prayer-specific athkar
        const afterEveryPrayerIndex = currentAthkarData.findIndex(z => z.id === 'after_every_prayer');

        if (afterEveryPrayerIndex !== -1) {
            if (prayerId === 'fajr') {
                // Insert for Fajr prayer. Splicing in reverse order of appearance to maintain order.
                currentAthkarData.splice(afterEveryPrayerIndex + 1, 0, fajrMaghribDhikr);
                currentAthkarData.splice(afterEveryPrayerIndex + 1, 0, fajrDhikr);
            } else if (prayerId === 'maghrib') {
                // Insert for Maghrib prayer
                currentAthkarData.splice(afterEveryPrayerIndex + 1, 0, fajrMaghribDhikr);
            }
        }

        const listWithCounts = currentAthkarData.map(z => ({ ...z, currentCount: z.count }));
        setAthkarList(listWithCounts);
        setCurrentPrayer({ id: prayerId, title: titleText, titleEn: titleEnText });
        useHabitTracker.getState().recordAdhkarRead('salah');
    };

    const handleDecrement = (zikrId: string) => {
        useHabitTracker.getState().recordAdhkarRead('salah');
        setAthkarList(prevList =>
            prevList.map(zikr =>
                zikr.id === zikrId && zikr.currentCount > 0
                    ? { ...zikr, currentCount: zikr.currentCount - 1 }
                    : zikr
            )
        );
    };

    const handleBack = () => {
        setSearchQuery('');
        if (zoomedZikr) {
            setZoomedZikr(null);
        } else if (isFavoritesView) {
            setIsFavoritesView(false);
        } else if (currentPrayer) {
            setCurrentPrayer(null);
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        setSearchQuery('');
        if (zoomedZikr) setZoomedZikr(null);
        if (isFavoritesView) setIsFavoritesView(false);
        if (currentPrayer) setCurrentPrayer(null);
        onNavigate('home');
    };

    const allPossibleAthkar = [
        ...baseAthkar,
        specialZikr,
        fajrDhikr,
        fajrMaghribDhikr
    ];
    const favoriteAthkar = allPossibleAthkar
        .filter(z => favorites.includes(z.text))
        .map(z => ({ ...z, currentCount: z.count }));

    const filteredPrayerOptions = prayerOptions.filter(prayer =>
        !searchQuery ||
        prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prayer.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAthkarList = athkarList.filter(zikr =>
        !searchQuery ||
        zikr.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (zikr.title && zikr.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (zikr.note && zikr.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (zikr.textEn && zikr.textEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (zikr.titleEn && zikr.titleEn.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredFavoriteAthkar = favoriteAthkar.filter(zikr =>
        !searchQuery ||
        zikr.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (zikr.title && zikr.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (zikr.note && zikr.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (zikr.textEn && zikr.textEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (zikr.titleEn && zikr.titleEn.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const pageTitle = currentPrayer 
        ? (isEn ? (currentPrayer.titleEn || currentPrayer.title) : currentPrayer.title) 
        : (isFavoritesView 
            ? (isEn ? "Favorite Adhkar" : "الأذكار المفضلة") 
            : (isEn ? "Prayer Adhkar" : "أذكار الصلوات"));

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-transparent" dir={isEn ? 'ltr' : 'rtl'}>
            <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* زر الرجوع للخلف: على اليمين في العربي، وعلى اليسار في الإنجليزي مع سهم متوافق */}
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

                        {/* زر الهوم: على اليسار في العربي، وعلى اليمين في الإنجليزي */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Athkar Guide" : "دليل أذكار الصلاة"}
                                aria-label={isEn ? "Athkar Guide" : "دليل أذكار الصلاة"}
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

            <main className="flex-1 overflow-y-auto hide-scrollbar relative max-w-3xl mx-auto w-full px-4 pt-2 pb-4 flex flex-col">
                {/* Controls Bar: Search and View Mode Switch - Matches Adia/OthersPage */}
                <div className="mb-6 max-w-3xl mx-auto w-full flex items-center gap-2 z-10 shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
                    {/* Search Input */}
                    <div 
                        className="relative flex-1 border-2 rounded-2xl overflow-hidden focus-within:ring-2 transition-all shadow-sm" 
                        style={{ borderColor: cardBorderColor, ...(isDefaultTheme ? { focusRingColor: '#000'} : { focusRingColor: theme.palette[0]}) }}
                    >
                        <input 
                            type="text" 
                            placeholder={isEn ? "Search prayer remembrances..." : "ابحث في أذكار الصلاة..."} 
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

                {isFavoritesView ? (
                    <div className={activeTab === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
                        {filteredFavoriteAthkar.length > 0 ? (
                            <>
                                {filteredFavoriteAthkar.map(zikr => (
                                    <SalahZikrCard 
                                        key={zikr.id} 
                                        zikr={zikr} 
                                        theme={theme} 
                                        themeKey={themeKey}
                                        onDecrement={() => {
                                            useHabitTracker.getState().recordAdhkarRead('salah');
                                        }} 
                                        onZoom={() => setZoomedZikr(zikr)} 
                                        setToastMessage={setToastMessage}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center col-span-full">
                                <i className="fa-solid fa-heart text-5xl mb-4"></i>
                                <p className="font-bold">
                                    {isEn ? 'No favorite adhkar to display currently' : 'لا توجد أذكار مفضلة لعرضها حالياً'}
                                </p>
                            </div>
                        )}
                    </div>
                ) : !currentPrayer ? (
                    <>
                        <div id="prayersMenu" className={activeTab === 'grid' ? "grid grid-cols-2 gap-3.5" : "space-y-4"}>
                            {filteredPrayerOptions.map(prayer => (
                                 <div 
                                      key={prayer.id} 
                                      onClick={() => openPrayer(
                                          prayer.id, 
                                          `أذكار ${prayer.title}`, 
                                          `${prayer.titleEn} Adhkar`
                                      )} 
                                      className={`themed-card p-4 rounded-xl shadow-sm border flex ${activeTab === 'grid' ? 'flex-col items-center text-center justify-center py-6 gap-3' : 'items-center justify-between'} cursor-pointer active:scale-95 transition`}
                                      style={{ 
                                          borderColor: cardBorderColor,
                                          borderWidth: '1.5px',
                                          borderStyle: 'solid',
                                          ...(activeTab === 'grid' ? {} : (isEn ? {
                                              borderLeftWidth: '4px',
                                              borderLeftColor: prayer.color === 'primary' ? (isDefaultTheme ? '#000000' : theme.palette[0]) : theme.palette[1]
                                          } : {
                                              borderRightWidth: '4px',
                                              borderRightColor: prayer.color === 'primary' ? (isDefaultTheme ? '#000000' : theme.palette[0]) : theme.palette[1]
                                          }))
                                      }}
                                 >
                                    <div className={`flex ${activeTab === 'grid' ? 'flex-col items-center gap-3' : 'items-center gap-4'}`}>
                                        <div 
                                             className={`w-12 h-12 rounded-full flex items-center justify-center ${themeKey === 'default' ? 'shadow-inner border border-black/5' : ''}`} 
                                             style={{
                                                 backgroundColor: themeKey === 'default' ? '#FFFFFF' : (prayer.color === 'primary' ? theme.palette[0]+'20' : theme.palette[1]+'20'), 
                                                 color: themeKey === 'default' ? '#000000' : (prayer.color === 'primary' ? theme.palette[0] : theme.palette[1])
                                             }}
                                        >
                                            <i className={`fa-solid ${prayer.icon} text-xl`}></i>
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-base sm:text-lg">
                                                {isEn ? prayer.titleEn : prayer.title}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <BottomSalahGuides 
                            theme={theme}
                            themeKey={themeKey}
                            cardBorderColor={cardBorderColor}
                            isBlackTheme={isBlackTheme}
                            isEn={isEn}
                            onZoom={setZoomedZikr}
                            setToastMessage={setToastMessage}
                        />
                    </>
                ) : (
                    <div id="athkarDetails" className={activeTab === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
                        {filteredAthkarList.map(zikr => (
                            <SalahZikrCard 
                                key={zikr.id} 
                                zikr={zikr} 
                                theme={theme} 
                                themeKey={themeKey}
                                prayerTitle={currentPrayer?.title}
                                prayerTitleEn={currentPrayer?.titleEn}
                                onDecrement={() => handleDecrement(zikr.id)} 
                                onZoom={() => setZoomedZikr(zikr)} 
                                setToastMessage={setToastMessage}
                            />
                        ))}
                        <div className="col-span-full">
                            <BottomSalahGuides 
                                theme={theme}
                                themeKey={themeKey}
                                cardBorderColor={cardBorderColor}
                                isBlackTheme={isBlackTheme}
                                isEn={isEn}
                                onZoom={setZoomedZikr}
                                setToastMessage={setToastMessage}
                            />
                        </div>
                    </div>
                )}
                <div className="shrink-0 w-full h-32"></div>
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
            <div ref={fabContainerRef} className={`fixed bottom-3 ${isEn ? 'left-4' : 'right-4'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col ${isEn ? 'items-start' : 'items-end'}`}>
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-4' : 'top-full mt-4'} themed-card rounded-2xl shadow-xl border p-2 flex flex-col gap-1 overflow-hidden w-52 z-0`}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => { setIsFavoritesView(true); setCurrentPrayer(null); setIsMenuOpen(false); }}
                                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${isFavoritesView ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                                style={isFavoritesView ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                <span>{isEn ? 'Favorites' : 'المفضلة'}</span>
                                <i className="fa-solid fa-heart text-xs opacity-70"></i>
                            </button>
                            <div className="h-px bg-black/5 dark:bg-white/10 my-1 mx-2" />
                            {prayerOptions.map(prayer => (
                                <button 
                                    key={prayer.id}
                                    onClick={() => { 
                                        openPrayer(
                                            prayer.id, 
                                            `أذكار ${prayer.title}`, 
                                            `${prayer.titleEn} Adhkar`
                                        ); 
                                        setIsMenuOpen(false); 
                                    }}
                                    className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${currentPrayer?.id === prayer.id ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                                    style={currentPrayer?.id === prayer.id ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                                >
                                    {isEn ? prayer.titleEn : prayer.title}
                                </button>
                            ))}
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
                    title={isEn ? "Prayer Menu" : "قائمة الصلوات"}
                    aria-label={isEn ? "Prayer Menu" : "قائمة الصلوات"}
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            {/* Zoom Modal */}
            {zoomedZikr && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => setZoomedZikr(null)}>
                    <div className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" style={{ fontFamily: isEn ? 'sans-serif' : theme.font }} onClick={e => e.stopPropagation()}>
                        <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                            {(isEn ? (zoomedZikr.titleEn || '') : zoomedZikr.title) && (
                                <h3 className="text-xl font-bold mb-4" style={{ color: theme.palette[1] }}>
                                    {isEn ? (zoomedZikr.titleEn || '') : zoomedZikr.title}
                                </h3>
                            )}
                            
                            {/* When in English mode, render ONLY the English text. Never show Arabic. */}
                            {isEn ? (
                                <div 
                                    className="text-xl md:text-2xl leading-relaxed text-center font-sans my-4" 
                                    dir="ltr" 
                                    dangerouslySetInnerHTML={{ __html: zoomedZikr.textEn || zoomedZikr.text }}
                                ></div>
                            ) : (
                                <div 
                                    className="text-2xl md:text-3xl leading-relaxed font-amiri text-center"
                                    dangerouslySetInnerHTML={{ __html: zoomedZikr.text }}
                                ></div>
                            )}

                            {zoomedZikr.note && (
                                <p className="text-lg mt-6 font-bold" style={{ color: theme.palette[0] }}>
                                    {zoomedZikr.count !== undefined 
                                        ? (isEn ? `Required repetitions: ${zoomedZikr.noteEn || zoomedZikr.note}` : `التكرار المطلوب: ${zoomedZikr.note}`)
                                        : (isEn ? (zoomedZikr.noteEn || zoomedZikr.note) : zoomedZikr.note)}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 shrink-0 flex items-center gap-3">
                            <button 
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!zoomedZikr) return;
                                    const fallbackTitle = isEn ? 'Prayer Remembrance' : 'أذكار ما بعد الصلاة';
                                    const itemTitle = isEn 
                                        ? (zoomedZikr.titleEn || (currentPrayer ? `${currentPrayer.titleEn} Adhkar` : fallbackTitle)) 
                                        : (zoomedZikr.title || (currentPrayer ? `أذكار صلاة ${currentPrayer.title}` : fallbackTitle));
                                    const itemCategory = isEn 
                                        ? (currentPrayer ? `${currentPrayer.titleEn} Adhkar` : 'Prayer Remembrances') 
                                        : (currentPrayer ? `أذكار صلاة ${currentPrayer.title}` : 'أذكار الصلاة');
                                    const itemNote = isEn ? (zoomedZikr.noteEn || zoomedZikr.note) : zoomedZikr.note;

                                    await shareAsImage({
                                        text: isEn ? (zoomedZikr.textEn || zoomedZikr.text) : zoomedZikr.text,
                                        title: itemTitle,
                                        source: itemNote,
                                        category: itemCategory,
                                        theme,
                                        isEn: isEn,
                                        language: isEn ? 'en' : 'ar',
                                        setToastMessage
                                    });
                                }} 
                                className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md"
                                style={{ backgroundColor: theme.palette[0] }}
                                title={isEn ? "Share Image" : "مشاركة كصورة"}
                            >
                                <i className="fa-solid fa-share-nodes"></i>
                                <span>{isEn ? 'Share Image' : 'مشاركة كصورة'}</span>
                            </button>
                            <button 
                                onClick={() => setZoomedZikr(null)} 
                                className="flex-1 py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity"
                            >
                                {isEn ? 'Close' : 'إغلاق'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[101] bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 whitespace-nowrap border border-white/10"
                    >
                        <i className="fa-solid fa-spinner fa-spin text-primary" style={{ color: theme.palette[0] }}></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
            <CommunitySpotlightGuide
                isOpen={showGuide}
                onClose={() => {
                    setShowGuide(false);
                    markPageAsSeen('athkar_salah');
                }}
                steps={ATHKAR_SALAH_PAGE_STEPS}
                guideKey="athkar_salah_page_spotlight"
                isEn={isEn}
            />
        </div>
    );
}

export default AthkarAlSalah;
