import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { baseAthkar, specialZikr, prayerOptions, fajrDhikr, fajrMaghribDhikr, SalahDhikrItem } from '../data/athkarAlSalahData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { useLanguage } from '../context/LanguageContext';
import { BottomSalahGuides } from '../components/AthkarAlSalah/BottomSalahGuides';
import { LayoutGrid, ListFilter, Search, Check } from 'lucide-react';
import ZoomModal from '../components/AthkarAlSalah/ZoomModal';
import { scrollToNextCard } from '../utils/cardScrollHelper';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ATHKAR_SALAH_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { useShowPageGuides } from '../utils/guideManager';
import { getToast3DStyles } from '../utils/toast3DStyles';
import QuranFormattedText, { getThemeQuranAccentColor, isQuranicContent } from '../components/Common/QuranFormattedText';
import OtherPrayersView, { OtherPrayerDetailView, getCategoryLabel } from '../components/AthkarAlSalah/OtherPrayersView';
import { OTHER_PRAYERS_DATA, OtherPrayerCategory, OtherPrayerItem } from '../data/otherPrayersData';

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
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || theme.name === 'اسود';
    const primaryColor = isBlackTheme ? 'rgba(255, 255, 255, 0.22)' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const [isFav, setIsFav] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);
    const isFinished = zikr.currentCount === 0;
    const textClass = 'text-lg leading-loose font-medium font-cairo text-center';

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
            isEn,
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

    const accentHex = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const quranAccentColor = getThemeQuranAccentColor(theme, themeKey);
    const isQuranItem = isQuranicContent(currentText, displayNote, displayTitle, zikr.isQuran);

    return (
        <div 
            data-card-item="true"
            className={`app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-5 pb-4 rounded-2xl relative overflow-visible group mb-4 transition-all duration-300 ${isFinished ? 'opacity-60 cursor-pointer' : 'cursor-pointer'}`} 
            onClick={(e) => {
                onDecrement();
                if (zikr.currentCount <= 1 || isFinished) {
                    const cardEl = e.currentTarget as HTMLElement;
                    setTimeout(() => scrollToNextCard(cardEl), 60);
                }
            }}
        >
            <div className={`flex justify-between items-start mb-2 ${isEn ? 'flex-row' : ''}`}>
                <span className="app-3d-badge inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: `${primaryColor}14`, color: accentHex }}>
                    {displayNote}
                </span>
                <div 
                    className="app-page-card tasbeeh-inner-pressable border-0 count-badge w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-white dark:bg-[#1E293B] transition-all shrink-0" 
                    style={
                        isFinished 
                        ? { backgroundColor: '#10B981', color: '#ffffff' } 
                        : { color: accentHex }
                    }
                >
                    {isFinished ? <i className="fa-solid fa-check text-sm"></i> : zikr.currentCount}
                </div>
            </div>

            {!isQuranItem && displayTitle && (
                <h3 className="text-center font-bold mb-2 text-sm" style={{color: theme.palette[1]}}>
                    {displayTitle}
                </h3>
            )}

            {/* When in English mode, display ONLY the English text. Never display Arabic text. */}
            {isQuranItem ? (
                <QuranFormattedText
                    text={currentText}
                    title={displayTitle}
                    source={displayNote}
                    isEn={isEn}
                    isQuran={true}
                    accentColor={quranAccentColor}
                    className={isEn ? 'text-base sm:text-lg leading-relaxed font-medium font-sans my-3' : 'text-lg leading-loose font-medium font-cairo my-2'}
                />
            ) : isEn ? (
                <div 
                    className="text-base sm:text-lg leading-relaxed text-center font-medium font-sans select-none my-3 text-balance" 
                    dir="ltr" 
                    dangerouslySetInnerHTML={{ __html: zikr.textEn || zikr.text }}
                ></div>
            ) : (
                <div className={`${textClass} select-none`} dangerouslySetInnerHTML={{ __html: zikr.text }}></div>
            )}
            
            <div className={`flex justify-between items-center mt-4 pt-3 pb-1 border-t border-black/5 dark:border-white/5 overflow-visible ${isEn ? 'flex-row' : ''}`}>
                <button 
                    type="button"
                    onClick={toggleFav} 
                    className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer"
                    title={isEn ? (isFav ? 'Remove from favorites' : 'Add to favorites') : (isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة')}
                    aria-label={isEn ? 'Favorite' : 'المفضلة'}
                >
                    <i className={`fa-heart ${isFav ? 'fa-solid text-red-500' : 'fa-regular text-gray-500 dark:text-gray-400'}`}></i>
                </button>
                <div className="flex gap-2.5 overflow-visible">
                   <button 
                       type="button"
                       onClick={(e) => { e.stopPropagation(); onZoom(); }} 
                       className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all text-gray-600 dark:text-gray-300 cursor-pointer" 
                       title={isEn ? "Zoom" : "تكبير"}
                       aria-label={isEn ? "Zoom" : "تكبير"}
                   >
                       <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                   </button>
                   <button 
                       type="button"
                       onClick={handleCopy} 
                       className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all text-gray-600 dark:text-gray-300 cursor-pointer" 
                       title={isEn ? "Copy" : "نسخ"}
                       aria-label={isEn ? "Copy" : "نسخ"}
                   >
                       <i className="fa-regular fa-copy text-xs"></i>
                   </button>
                   <button 
                       type="button"
                       onClick={handleShare} 
                       className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all text-gray-600 dark:text-gray-300 cursor-pointer" 
                       title={isEn ? "Share" : "مشاركة"}
                       aria-label={isEn ? "Share" : "مشاركة"}
                   >
                       <i className="fa-solid fa-share-nodes text-xs"></i>
                   </button>
                   <button 
                       type="button"
                       onClick={handlePlayAudio} 
                       className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all text-gray-600 dark:text-gray-300 cursor-pointer" 
                       style={{ color: isPlaying ? '#ef4444' : 'inherit' }}
                       title={isEn ? (isPlaying ? "Stop listening" : "Listen audio") : (isPlaying ? "إيقاف الاستماع" : "استماع صوتي")}
                       aria-label={isEn ? "Listen audio" : "استماع صوتي"}
                   >
                       <i className={`fa-solid ${isPlaying ? 'fa-circle-pause text-red-500 animate-pulse text-sm' : 'fa-volume-high text-xs'}`}></i>
                   </button>
                </div>
            </div>

            {!isFinished && <div className="absolute inset-0 rounded-2xl opacity-0 group-active:opacity-100 transition pointer-events-none" style={{backgroundColor: theme.palette[0]+'15'}}></div>}
        </div>
    );
};

interface AthkarAlSalahProps {
    onBack: () => void;
    onNavigate: (page: string, params?: any) => void;
    navParams?: any;
}

function AthkarAlSalah({ onBack, onNavigate, navParams }: AthkarAlSalahProps) {
    const showPageGuides = useShowPageGuides();
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || theme.name === 'اسود';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const isDefaultTheme = themeKey === 'default' || theme.name === 'الافتراضي' || !!theme.isOriginal || !themeKey;
    const cardBorderColor = isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
    const [currentPrayer, setCurrentPrayer] = useState<{ id: string; title: string; titleEn?: string } | null>(null);
    const [athkarList, setAthkarList] = useState<any[]>([]);
    const [zoomedZikr, setZoomedZikr] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isFavoritesView, setIsFavoritesView] = useState(false);
    const [isOtherPrayersView, setIsOtherPrayersView] = useState(false);
    const [selectedOtherPrayer, setSelectedOtherPrayer] = useState<OtherPrayerItem | null>(null);
    const [selectedOtherCategory, setSelectedOtherCategory] = useState<OtherPrayerCategory | 'all'>('all');
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
    const mainRef = useRef<HTMLElement>(null);
    const mainScrollPosRef = useRef<number>(0);
    const wasOtherPrayersViewRef = useRef<boolean>(false);
    const lastSelectedOtherPrayerIdRef = useRef<string | null>(null);
    const wasOtherPrayerDetailRef = useRef<boolean>(false);

    useEffect(() => {
        if (isOtherPrayersView && selectedOtherPrayer) {
            requestAnimationFrame(() => {
                if (mainRef.current) {
                    mainRef.current.scrollTop = 0;
                }
            });
        } else if (isOtherPrayersView && !selectedOtherPrayer) {
            if (wasOtherPrayerDetailRef.current && lastSelectedOtherPrayerIdRef.current) {
                const targetId = lastSelectedOtherPrayerIdRef.current;
                requestAnimationFrame(() => {
                    const cardEl = document.getElementById(`other-prayer-card-${targetId}`);
                    if (cardEl) {
                        cardEl.scrollIntoView({ behavior: 'auto', block: 'center' });
                    }
                });
            } else if (!wasOtherPrayersViewRef.current) {
                requestAnimationFrame(() => {
                    if (mainRef.current) {
                        mainRef.current.scrollTop = 0;
                    }
                });
            }
        } else if (wasOtherPrayersViewRef.current && !isOtherPrayersView && !currentPrayer && !isFavoritesView) {
            requestAnimationFrame(() => {
                const entryEl = document.getElementById('compendium-prayers-entry');
                if (entryEl) {
                    entryEl.scrollIntoView({ behavior: 'auto', block: 'center' });
                } else if (mainRef.current) {
                    mainRef.current.scrollTop = mainScrollPosRef.current;
                }
            });
        }
        wasOtherPrayersViewRef.current = isOtherPrayersView;
        wasOtherPrayerDetailRef.current = Boolean(selectedOtherPrayer);
    }, [isOtherPrayersView, selectedOtherPrayer, currentPrayer, isFavoritesView]);

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
        if (navParams?.id !== undefined || navParams?.title || navParams?.highlightId !== undefined) {
            if (!currentPrayer) {
                openPrayer('fajr', isEn ? 'After Prayer Dhikr' : 'أذكار بعد الصلاة', 'After Prayer Dhikr');
            }
            const targetId = navParams.id ?? navParams.highlightId;
            if (targetId) {
                setTimeout(() => {
                    const el = document.getElementById(`salah-athkar-${targetId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2');
                        setTimeout(() => {
                            el.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2');
                        }, 2500);
                    }
                }, 150);
            }
        }
    }, [navParams, isEn]);

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
            if (selectedOtherPrayer) {
                setSelectedOtherPrayer(null);
                return true;
            }
            if (isOtherPrayersView) {
                setIsOtherPrayersView(false);
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
    }, [zoomedZikr, currentPrayer, isFavoritesView, isOtherPrayersView, selectedOtherPrayer, isMenuOpen]);

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
        setSelectedOtherPrayer(null);
        setIsOtherPrayersView(false);
        setIsFavoritesView(false);
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
        requestAnimationFrame(() => {
            if (mainRef.current) {
                mainRef.current.scrollTop = 0;
            }
        });
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

    const openOtherPrayers = () => {
        if (!isOtherPrayersView && mainRef.current) {
            mainScrollPosRef.current = mainRef.current.scrollTop;
        }
        setSearchQuery('');
        setCurrentPrayer(null);
        setIsFavoritesView(false);
        setSelectedOtherPrayer(null);
        setIsOtherPrayersView(true);
        setIsMenuOpen(false);
    };

    const openOtherPrayerDetail = (prayer: OtherPrayerItem) => {
        lastSelectedOtherPrayerIdRef.current = prayer.id;
        setCurrentPrayer(null);
        setIsFavoritesView(false);
        setIsOtherPrayersView(true);
        setSelectedOtherPrayer(prayer);
        setIsMenuOpen(false);
    };

    const handleBack = () => {
        if (zoomedZikr) {
            setZoomedZikr(null);
        } else if (selectedOtherPrayer) {
            setSelectedOtherPrayer(null);
        } else if (isOtherPrayersView) {
            setSearchQuery('');
            setIsOtherPrayersView(false);
        } else if (isFavoritesView) {
            setSearchQuery('');
            setIsFavoritesView(false);
        } else if (currentPrayer) {
            setSearchQuery('');
            setCurrentPrayer(null);
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        setSearchQuery('');
        if (zoomedZikr) setZoomedZikr(null);
        if (selectedOtherPrayer) setSelectedOtherPrayer(null);
        if (isOtherPrayersView) setIsOtherPrayersView(false);
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

    const matchingOtherPrayersOnMain = searchQuery.trim()
        ? OTHER_PRAYERS_DATA.filter((p) => {
              const q = searchQuery.trim().toLowerCase();
              return (
                  p.title.toLowerCase().includes(q) ||
                  p.titleEn.toLowerCase().includes(q) ||
                  p.summary.toLowerCase().includes(q) ||
                  p.summaryEn.toLowerCase().includes(q)
              );
          })
        : [];

    const pageTitle = currentPrayer 
        ? (isEn ? (currentPrayer.titleEn || currentPrayer.title) : currentPrayer.title) 
        : isOtherPrayersView
            ? (selectedOtherPrayer
                ? (isEn ? selectedOtherPrayer.titleEn : selectedOtherPrayer.title)
                : (isEn ? "Compendium of Prayers" : "جوامع الصلوات"))
            : (isFavoritesView 
                ? (isEn ? "Favorite Adhkar" : "الأذكار المفضلة") 
                : (isEn ? "Prayer Adhkar" : "أذكار الصلوات"));

    const isLongTitle = pageTitle.length > 24;
    const isVeryLongTitle = pageTitle.length > 36;
    const titleSizeClass = isVeryLongTitle 
        ? 'text-sm sm:text-base' 
        : isLongTitle 
            ? 'text-base sm:text-lg' 
            : 'text-lg sm:text-xl';

    return (
        <div 
            className="h-[100dvh] flex flex-col overflow-hidden transition-colors" 
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ backgroundColor: isBlackTheme ? '#000000' : (theme.bgColor || (theme.isDark ? '#0F172A' : '#F5F7FA')) }}
        >
            <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="flex items-center justify-between w-full min-h-[44px] gap-1 px-1">
                        {/* زر الرجوع للخلف: على اليمين في العربي، وعلى اليسار في الإنجليزي مع سهم متوافق */}
                        <div className="flex items-center shrink-0 min-w-[40px]">
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Go Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط - يشغل كامل المساحة بين الأيقونات دون تداخل */}
                        <div className="flex-1 min-w-0 text-center px-1">
                            <h1 className={`app-top-bar__title ${titleSizeClass} font-cairo font-bold truncate leading-tight`}>
                                {pageTitle}
                            </h1>
                        </div>

                        {/* زر الهوم والدليل: يظهر الدليل فقط في الصفحة الأولى */}
                        <div className="flex items-center gap-1 shrink-0 justify-end min-w-[40px]">
                            {!currentPrayer && !isFavoritesView && !isOtherPrayersView && showPageGuides && (
                                <button
                                    type="button"
                                    onClick={() => setShowGuide(true)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    style={{ color: 'var(--top-bar-text, inherit)' }}
                                    title={isEn ? "Athkar Guide" : "دليل أذكار الصلاة"}
                                    aria-label={isEn ? "Athkar Guide" : "دليل أذكار الصلاة"}
                                >
                                    <i className="fa-solid fa-circle-question text-lg"></i>
                                </button>
                            )}
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

            <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto hide-scrollbar relative max-w-3xl mx-auto w-full px-4 pt-2 app-scroll-safe-fab">
                {/* Controls Bar: Search and View Mode Switch - Matches Tasbeeh 3D (hidden inside single prayer detail page) */}
                {!(isOtherPrayersView && selectedOtherPrayer) && (
                <div className="mb-6 max-w-3xl mx-auto w-full flex items-center gap-2.5 z-10 shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
                    {/* Search Input */}
                    <div 
                        className={`app-page-card border-0 relative flex-1 rounded-2xl ${isBlackTheme ? 'bg-[#18181b]' : 'bg-white dark:bg-[#1E293B]'} overflow-visible focus-within:ring-2 transition-all`} 
                        style={{ 
                            '--tw-ring-color': primaryColor,
                        } as any}
                    >
                        <input 
                            type="text" 
                            placeholder={
                                isOtherPrayersView
                                    ? (isEn ? "Search prayers..." : "ابحث عن صلاة...")
                                    : (isEn ? "Search prayer remembrances..." : "ابحث في أذكار الصلاة...")
                            } 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-transparent py-3 ${isEn ? 'pl-12 pr-12 text-left font-sans' : 'pr-12 pl-12 text-right font-cairo'} focus:outline-none placeholder-gray-500 dark:placeholder-gray-400`}
                            style={{ color: 'var(--text-color)' }}
                        />
                        <span
                            className={`app-3d-badge border-0 absolute ${isEn ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none`}
                            style={{
                                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : `${primaryColor}1A`,
                                color: primaryColor,
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
                            className={`app-page-card border-0 bg-white dark:bg-[#1E293B] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'list' ? '' : 'opacity-70 hover:opacity-100'}`}
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
                ) : isOtherPrayersView ? (
                    selectedOtherPrayer ? (
                        <OtherPrayerDetailView
                            prayer={selectedOtherPrayer}
                            theme={theme}
                            isBlackTheme={isBlackTheme}
                            isEn={isEn}
                            onZoom={setZoomedZikr}
                            setToastMessage={setToastMessage}
                        />
                    ) : (
                        <OtherPrayersView
                            theme={theme}
                            themeKey={themeKey}
                            isBlackTheme={isBlackTheme}
                            isDefaultTheme={isDefaultTheme}
                            isEn={isEn}
                            activeTab={activeTab}
                            searchQuery={searchQuery}
                            selectedCategory={selectedOtherCategory}
                            onSelectCategory={setSelectedOtherCategory}
                            onSelectPrayer={openOtherPrayerDetail}
                        />
                    )
                ) : !currentPrayer ? (
                    <>
                        <div id="prayersMenu" className={activeTab === 'grid' ? "grid grid-cols-2 gap-3.5" : "space-y-3.5"}>
                            {filteredPrayerOptions.map(prayer => (
                                 <div 
                                      key={prayer.id} 
                                      onClick={() => openPrayer(
                                          prayer.id, 
                                          `أذكار ${prayer.title}`, 
                                          `${prayer.titleEn} Adhkar`
                                      )} 
                                      className={`app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-2xl flex ${activeTab === 'grid' ? 'flex-col items-center text-center justify-center py-6 gap-3' : 'items-center justify-between'} cursor-pointer transition-all group overflow-visible`}
                                 >
                                    <div className={`flex ${activeTab === 'grid' ? 'flex-col items-center gap-3' : 'items-center gap-4'}`}>
                                        <div 
                                             className="app-3d-badge w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0" 
                                             style={{
                                                 backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : `${primaryColor}14`, 
                                                 color: primaryColor
                                             }}
                                        >
                                            <i className={`fa-solid ${prayer.icon} text-xl`}></i>
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white">
                                                {isEn ? prayer.titleEn : prayer.title}
                                            </h2>
                                        </div>
                                    </div>
                                    {activeTab === 'list' && (
                                        <div
                                            className="app-3d-badge border-0 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{
                                                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.12)' : `${primaryColor}14`,
                                                color: primaryColor
                                            }}
                                        >
                                            <i className={`fa-solid ${isEn ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {(!searchQuery ||
                                'جوامع الصلوات'.includes(searchQuery.trim()) ||
                                'compendium of prayers'.includes(searchQuery.trim().toLowerCase())) && (
                                <div
                                    id="compendium-prayers-entry"
                                    onClick={openOtherPrayers}
                                    className={`app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-2xl flex ${activeTab === 'grid' ? 'flex-col items-center text-center justify-center py-6 gap-3' : 'items-center justify-between'} cursor-pointer transition-all group overflow-visible`}
                                >
                                    <div className={`flex ${activeTab === 'grid' ? 'flex-col items-center gap-3' : 'items-center gap-4'}`}>
                                        <div
                                            className="app-3d-badge w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                                            style={{
                                                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : `${primaryColor}14`,
                                                color: primaryColor
                                            }}
                                        >
                                            <i className="fa-solid fa-person-praying text-xl"></i>
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white">
                                                {isEn ? 'Compendium of Prayers' : 'جوامع الصلوات'}
                                            </h2>
                                        </div>
                                    </div>
                                    {activeTab === 'list' && (
                                        <div
                                            className="app-3d-badge border-0 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{
                                                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.12)' : `${primaryColor}14`,
                                                color: primaryColor
                                            }}
                                        >
                                            <i className={`fa-solid ${isEn ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {matchingOtherPrayersOnMain.length > 0 && (
                            <div className="mt-5 space-y-2.5">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                                        {isEn ? 'Compendium of Prayers' : 'جوامع الصلوات'}
                                    </span>
                                    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                                </div>
                                <div className={activeTab === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-2.5"}>
                                    {matchingOtherPrayersOnMain.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => openOtherPrayerDetail(item)}
                                            className="app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className="app-3d-badge w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                    style={{
                                                        backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${primaryColor}14`,
                                                        color: primaryColor
                                                    }}
                                                >
                                                    <i className={`fa-solid ${item.icon} text-sm`}></i>
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-bold opacity-65 block">
                                                        {getCategoryLabel(item.category, isEn)}
                                                    </span>
                                                    <h3 className="font-bold text-sm truncate" style={{ color: primaryColor }}>
                                                        {isEn ? item.titleEn : item.title}
                                                    </h3>
                                                </div>
                                            </div>
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs opacity-70" style={{ color: primaryColor }}></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                            <div id={`salah-athkar-${zikr.id}`} key={zikr.id} className="transition-all rounded-3xl">
                                <SalahZikrCard 
                                    zikr={zikr} 
                                    theme={theme} 
                                    themeKey={themeKey}
                                    prayerTitle={currentPrayer?.title}
                                    prayerTitleEn={currentPrayer?.titleEn}
                                    onDecrement={() => handleDecrement(zikr.id)} 
                                    onZoom={() => setZoomedZikr(zikr)} 
                                    setToastMessage={setToastMessage}
                                />
                            </div>
                        ))}
                    </div>
                )}
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
                className={`fixed app-fab-bottom ${isEn ? 'left-4 items-start' : 'right-4 items-end'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col`}
            >
                {isMenuOpen && (
                    <div
                        className={`app-page-card border-0 absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-4' : 'top-full mt-4'} bg-white dark:bg-[#1E293B] rounded-2xl p-2.5 pb-3 flex flex-col gap-2 overflow-visible w-52 z-0`}
                        style={{ color: 'var(--text-color)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                            <button 
                                type="button"
                                onClick={() => { setIsFavoritesView(true); setSelectedOtherPrayer(null); setIsOtherPrayersView(false); setCurrentPrayer(null); setIsMenuOpen(false); }}
                                className={`app-page-card border-0 w-full ${isEn ? 'text-left' : 'text-right'} px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center justify-between cursor-pointer`}
                                style={isFavoritesView ? { backgroundColor: primaryColor, color: isBlackTheme ? '#000000' : '#FFFFFF' } : undefined}
                            >
                                <span>{isEn ? 'Favorites' : 'المفضلة'}</span>
                                <i className="fa-solid fa-heart text-xs opacity-75"></i>
                            </button>
                            <div className="app-3d-divider my-0.5 mx-1" />
                            {prayerOptions.map(prayer => (
                                <button 
                                    type="button"
                                    key={prayer.id}
                                    onClick={() => { 
                                        openPrayer(
                                            prayer.id, 
                                            `أذكار ${prayer.title}`, 
                                            `${prayer.titleEn} Adhkar`
                                        ); 
                                        setIsMenuOpen(false); 
                                    }}
                                    className={`app-page-card border-0 w-full ${isEn ? 'text-left' : 'text-right'} px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all cursor-pointer`}
                                    style={currentPrayer?.id === prayer.id ? { backgroundColor: primaryColor, color: isBlackTheme ? '#000000' : '#FFFFFF' } : undefined}
                                >
                            {isEn ? prayer.titleEn : prayer.title}
                        </button>
                    ))}
                            <div className="app-3d-divider my-0.5 mx-1" />
                            <button
                                type="button"
                                onClick={openOtherPrayers}
                                className={`app-page-card border-0 w-full ${isEn ? 'text-left' : 'text-right'} px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center justify-between cursor-pointer`}
                                style={isOtherPrayersView ? { backgroundColor: primaryColor, color: isBlackTheme ? '#000000' : '#FFFFFF' } : undefined}
                            >
                                <span>{isEn ? 'Compendium of Prayers' : 'جوامع الصلوات'}</span>
                                <i className="fa-solid fa-person-praying text-xs opacity-75"></i>
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
                    title={isEn ? "Prayer Menu" : "قائمة الصلوات"}
                    aria-label={isEn ? "Prayer Menu" : "قائمة الصلوات"}
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            {/* Zoom Modal */}
            <ZoomModal 
                zoomedZikr={zoomedZikr} 
                currentPrayer={currentPrayer} 
                onClose={() => setZoomedZikr(null)} 
                setToastMessage={setToastMessage} 
            />

            {toastMessage && (
                <div 
                    className="app-3d-toast fixed bottom-[calc(var(--app-bottom-clearance,0px)+1rem)] left-1/2 -translate-x-1/2 z-[101] max-w-[85vw] w-max px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-center leading-normal break-words pointer-events-none flex items-center justify-center gap-2.5"
                    style={toast3D.style}
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
