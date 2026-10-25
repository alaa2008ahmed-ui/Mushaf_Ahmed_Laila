import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { 
    TEN_PROMISED_COMPANIONS, 
    TEN_PROMISED_UI_TEXTS, 
    CompanionInfo 
} from '../data/tenPromisedData';
import {
    getCompanionTraits,
    getCompanionHeroicStances,
    getCompanionWisdomQuotes,
    HeroicStance,
    CompanionTraits,
    WisdomQuote
} from '../data/tenPromisedExtendedData';
import { getCompanionExtraSections } from '../data/tenPromisedCardsData';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { markPageAsSeen } from '../utils/badgeManager';
import { 
    ZoomIn, HelpCircle, ArrowLeft, ArrowRight, Share2, Copy, Award, 
    BookOpen, Shield, Heart, Sparkles, Check, Search, X, Flame, 
    MessageSquareQuote, UserCheck, Compass 
} from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { TEN_PROMISED_PAGE_STEPS } from '../components/Community/communityTourSteps';

interface TenPromisedPageProps {
    onBack?: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
    onOpenThemes?: () => void;
}

interface ZoomedCardData {
    title: string;
    subtitle?: string;
    badge?: string;
    icon?: string;
    content: string | string[];
    isVerseOrProof?: boolean;
}

const TenPromisedPage: React.FC<TenPromisedPageProps> = ({ onBack, onNavigate, onOpenThemes }) => {
    const { theme, themeKey } = useTheme();
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const ui = TEN_PROMISED_UI_TEXTS[isEn ? 'en' : 'ar'];

    const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
    const isDeepBlack = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
    const primaryColor = isDeepBlack ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#059669');
    const secondaryColor = isDeepBlack ? '#E2E8F0' : (theme.palette?.[1] || theme.palette?.[0] || primaryColor);
    const themeActiveTextColor = isDeepBlack ? '#000000' : (theme.accentText || '#FFFFFF');
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isDeepBlack 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || theme.accent || '#000000'));

    // Scroll container refs
    const mainScrollRef = useRef<HTMLElement | null>(null);
    const zoomScrollRef = useRef<HTMLDivElement | null>(null);

    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'caliphs' | 'early' | 'commanders'>('all');

    // Selected Companion for detailed profile view
    const [selectedCompanion, setSelectedCompanion] = useState<CompanionInfo | null>(null);

    // Sub-tab within companion detail view
    const [detailTab, setDetailTab] = useState<'profile' | 'stances' | 'traits' | 'virtues' | 'sayings' | 'preIslam' | 'conversion' | 'legacy' | 'lessons'>('profile');

    // Zoom Modal State for Cards
    const [zoomedCard, setZoomedCard] = useState<ZoomedCardData | null>(null);
    const [zoomFontSize, setZoomFontSize] = useState<number>(24);

    // In-page card font scaling (Active only within individual companion profiles)
    const [cardTextScale, setCardTextScale] = useState<number>(1);

    const toggleCardTextScale = () => {
        setCardTextScale(prev => (prev >= 1.45 ? 1 : Number((prev + 0.15).toFixed(2))));
    };

    // Spotlight Guide state
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('ten-promised');
        if (!getGuideSeen('ten_promised_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);



    // Toast & Sharing State
    const [toastMessage, setToastMessage] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2800);
    };

    const scrollToTop = useCallback(() => {
        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTop = 0;
        }
    }, []);

    useLayoutEffect(() => {
        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTop = 0;
        }
    }, [selectedCompanion?.id, detailTab]);

    useLayoutEffect(() => {
        if (zoomedCard && zoomScrollRef.current) {
            zoomScrollRef.current.scrollTop = 0;
        }
    }, [zoomedCard]);

    const handleSelectCompanion = (c: CompanionInfo) => {
        setSelectedCompanion(c);
        setDetailTab('profile');
        setCardTextScale(1);
        scrollToTop();
    };



    // Current Index for Next / Prev
    const currentIndex = useMemo(() => {
        if (!selectedCompanion) return -1;
        return TEN_PROMISED_COMPANIONS.findIndex(c => c.id === selectedCompanion.id);
    }, [selectedCompanion?.id]);

    const prevCompanion = currentIndex > 0 ? TEN_PROMISED_COMPANIONS[currentIndex - 1] : null;
    const nextCompanion = currentIndex >= 0 && currentIndex < TEN_PROMISED_COMPANIONS.length - 1 
        ? TEN_PROMISED_COMPANIONS[currentIndex + 1] 
        : null;

    const extraSections = useMemo(() => {
        if (!selectedCompanion) return undefined;
        return getCompanionExtraSections(selectedCompanion.id);
    }, [selectedCompanion?.id]);

    // Filtered Companions based on category filter and search query
    const filteredCompanions = useMemo(() => {
        let list = [...TEN_PROMISED_COMPANIONS];

        // 1. Category Filter
        if (activeFilter === 'caliphs') {
            list = list.filter(c => ['abu-bakr', 'umar-ibn-khattab', 'uthman-ibn-affan', 'ali-ibn-abi-talib'].includes(c.id));
        } else if (activeFilter === 'early') {
            list = list.filter(c => ['abu-bakr', 'ali-ibn-abi-talib', 'saeed-ibn-zayd', 'uthman-ibn-affan', 'abdur-rahman-ibn-awf', 'sad-ibn-abi-waqqas', 'talha-ibn-ubaydillah', 'az-zubayr-ibn-al-awwam'].includes(c.id));
        } else if (activeFilter === 'commanders') {
            list = list.filter(c => ['sad-ibn-abi-waqqas', 'abu-ubaydah-ibn-al-jarrah', 'az-zubayr-ibn-al-awwam', 'ali-ibn-abi-talib'].includes(c.id));
        }

        // 2. Search query filter
        const query = searchQuery.trim().toLowerCase();
        if (query) {
            list = list.filter(c => {
                const stances = getCompanionHeroicStances(c.id);
                const sayings = getCompanionWisdomQuotes(c.id);
                const matchNameAr = c.nameAr.toLowerCase().includes(query) || c.fullNameAr.toLowerCase().includes(query);
                const matchNameEn = c.nameEn.toLowerCase().includes(query) || c.fullNameEn.toLowerCase().includes(query);
                const matchTitle = c.titleBadgeAr.toLowerCase().includes(query) || c.titleBadgeEn.toLowerCase().includes(query);
                const matchKunya = c.kunyaAr.toLowerCase().includes(query) || c.kunyaEn.toLowerCase().includes(query);
                const matchStances = stances.some(s => s.titleAr.includes(query) || s.storyAr.includes(query) || s.categoryAr.includes(query));
                const matchSayings = sayings.some(w => w.quoteAr.includes(query) || w.contextAr.includes(query));
                return matchNameAr || matchNameEn || matchTitle || matchKunya || matchStances || matchSayings;
            });
        }

        return list;
    }, [activeFilter, searchQuery]);

    // Close zoom modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && zoomedCard) {
                setZoomedCard(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomedCard]);

    const handleBackClick = useCallback(() => {
        if (zoomedCard) {
            setZoomedCard(null);
            return;
        }
        if (selectedCompanion) {
            setSelectedCompanion(null);
            setCardTextScale(1);
            scrollToTop();
            return;
        }
        if (onBack) {
            onBack();
        } else {
            onNavigate('home');
        }
    }, [zoomedCard, selectedCompanion, onBack, onNavigate, scrollToTop]);

    // Handle Phone / Hardware / Gesture Back Button
    useEffect(() => {
        const interceptor = () => {
            if (zoomedCard) {
                setZoomedCard(null);
                return true;
            }
            if (selectedCompanion) {
                setSelectedCompanion(null);
                setCardTextScale(1);
                scrollToTop();
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedCard, selectedCompanion, scrollToTop]);

    // Copy entire companion biography
    const handleCopyFullBio = (c: CompanionInfo) => {
        const name = isEn ? c.nameEn : c.nameAr;
        const fullName = isEn ? c.fullNameEn : c.fullNameAr;
        const title = isEn ? c.titleBadgeEn : c.titleBadgeAr;
        const kunya = isEn ? c.kunyaEn : c.kunyaAr;
        const birth = isEn ? c.birthYearEn : c.birthYearAr;
        const death = isEn ? c.deathYearEn : c.deathYearAr;
        const burial = isEn ? c.burialPlaceEn : c.burialPlaceAr;
        const kinship = isEn ? c.kinshipEn : c.kinshipAr;
        const hadith = isEn ? c.gladTidingsHadithEn : c.gladTidingsHadithAr;
        const preIslam = isEn ? c.preIslamicLife.statusInQurayshEn + '\n' + c.preIslamicLife.moralsAndNatureEn : c.preIslamicLife.statusInQurayshAr + '\n' + c.preIslamicLife.moralsAndNatureAr;
        const conversion = isEn ? c.embracingIslam.storyEn : c.embracingIslam.storyAr;
        const lessons = (isEn ? c.inspirationalLessonsEn : c.inspirationalLessonsAr).map((l, i) => `${i + 1}. ${l}`).join('\n');

        let text = `🌟 *${name}* (${title})\n`;
        text += `📜 ${fullName}\n`;
        text += `🏷️ ${kunya}\n`;
        text += `⏳ ${birth} - ${death}\n`;
        text += `📍 ${burial}\n`;
        text += `🤝 ${kinship}\n\n`;
        text += `✨ ${ui.hadithProofLabel}\n${hadith}\n\n`;
        text += `📖 ${ui.tabPreIslam}:\n${preIslam}\n\n`;
        text += `🕌 ${ui.tabConversion}:\n${conversion}\n\n`;
        text += `💡 ${ui.tabLessons}:\n${lessons}\n\n`;
        text += isEn ? 'Shared from Mushaf Ahmed & Laila App' : 'مشارك من تطبيق مصحف أحمد وليلى';

        navigator.clipboard.writeText(text).then(() => {
            showToast(ui.toastCopiedBio);
        }).catch(() => {
            showToast(ui.toastCopyFailed);
        });
    };

    // Share companion profile as beautiful image
    const handleShareCompanionImage = async (c: CompanionInfo) => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            const title = isEn ? c.nameEn : c.nameAr;
            const subtitle = isEn ? c.titleBadgeEn : c.titleBadgeAr;
            const quote = isEn ? c.keyQuoteEn : c.keyQuoteAr;
            const body = isEn 
                ? `${c.fullNameEn}\n\n⭐ ${c.kunyaEn}\n\n📜 Glad Tidings:\n${c.gladTidingsHadithEn}\n\n🌟 Immortal Quote:\n"${quote}"\n\n💡 Core Virtue:\n${c.embracingIslam.earlyPrecedenceEn}`
                : `${c.fullNameAr}\n\n⭐ ${c.kunyaAr}\n\n📜 حديث البشارة بالجنة:\n${c.gladTidingsHadithAr}\n\n🌟 كلمة خالدة:\n«${quote}»\n\n💡 من فضائله وسوابقه:\n${c.embracingIslam.earlyPrecedenceAr}`;
            const category = isEn ? 'The Ten Promised Paradise' : 'العشرة المبشرون بالجنة';
            const source = isEn ? c.gladTidingsHadithEn : c.gladTidingsHadithAr;

            await shareAsImage({
                title,
                text: body,
                category,
                source,
                theme,
                setToastMessage
            });
        } catch (error) {
            console.error('Error sharing companion image:', error);
            showToast(ui.toastShareFailed);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div 
            className={`flex flex-col h-screen overflow-hidden select-none ${isEn ? 'text-left font-sans' : 'text-right'}`}
            style={{ 
                backgroundColor: theme.bgColor || '#FFFFFF', 
                color: theme.textColor,
                direction: isEn ? 'ltr' : 'rtl' 
            }}
            dir={isEn ? 'ltr' : 'rtl'}
        >
            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xl border flex items-center gap-2"
                        style={{ backgroundColor: primaryColor, color: themeActiveTextColor, borderColor: isDeepBlack ? '#FFFFFF' : `${primaryColor}88` }}
                    >
                        <Check className="w-4 h-4 text-amber-300" />
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Header Bar */}
            <header className="app-top-bar z-20 shrink-0">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Left/Right Back & Zoom Controls */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center gap-1`}>
                            <button
                                onClick={handleBackClick}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={ui.goBack}
                                aria-label={ui.goBack}
                            >
                                {isEn ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                            </button>
                            
                            {/* Magnifying Glass to scale text of cards (always accessible in detail view) */}
                            {selectedCompanion && (
                                <button
                                    type="button"
                                    onClick={toggleCardTextScale}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer relative"
                                    title={isEn ? `Enlarge card text (${Math.round(cardTextScale * 100)}%)` : `تكبير نص البطاقات (${Math.round(cardTextScale * 100)}%)`}
                                    aria-label={isEn ? 'Enlarge card text' : 'تكبير نص البطاقات'}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                    {cardTextScale > 1 && (
                                        <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full bg-emerald-600 text-white leading-tight shadow" dir="ltr">
                                            +{Math.round((cardTextScale - 1) * 100)}%
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Title in center */}
                        <div className={`text-center ${selectedCompanion ? 'px-20 sm:px-24' : 'px-14'}`}>
                            <h1 className={`app-top-bar__title ${isEn ? 'font-bold' : 'font-kufi'} transition-all ${
                                selectedCompanion 
                                    ? 'text-sm sm:text-base leading-tight font-bold truncate max-w-[220px] sm:max-w-md' 
                                    : 'text-lg sm:text-2xl'
                            }`}>
                                {selectedCompanion 
                                    ? (isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr)
                                    : ui.pageTitle}
                            </h1>
                        </div>

                        {/* Right/Left Tools: Guide (shown ONLY in list view) + ThemeLock + Home */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            {/* ايقونة الارشاد بالشريط العلوى بجوار زر الهوم وتظهر ايقونه الارشاد فقط فى صفحه اسماء العشرة المبشرين بالجنه */}
                            {!selectedCompanion && (
                                <button
                                    type="button"
                                    onClick={() => setShowGuide(true)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    style={{ color: 'var(--top-bar-text, inherit)' }}
                                    title={ui.guideTooltip}
                                    aria-label={ui.guideTooltip}
                                >
                                    <HelpCircle size={19} />
                                </button>
                            )}
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={ui.home}
                                aria-label={ui.home}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Top Fixed Tabs Bar - Mounted outside <main> directly beneath top bar, completely blocking any scrolling cards from appearing above or behind */}
            {selectedCompanion && (
                <div 
                    className="shrink-0 z-20 px-3 sm:px-4 pt-1 pb-2 transition-colors border-b"
                    style={{ 
                        backgroundColor: isDeepBlack ? '#000000' : (theme.bgColor || '#FFFFFF'),
                        borderColor: cardBorderColor 
                    }}
                >
                    <div className="max-w-3xl mx-auto">
                        <div 
                            className="companion-tabs-nav flex items-center gap-1.5 overflow-x-auto py-1.5 px-2.5 rounded-2xl border shadow-xs hide-scrollbar"
                            style={{ 
                                backgroundColor: isDeepBlack ? '#111827' : (theme.cardBg || '#FFFFFF'),
                                borderColor: cardBorderColor, 
                                borderWidth: '1.5px', 
                                borderStyle: 'solid' 
                            }}
                        >
                            {[
                                { id: 'profile', label: ui.tabProfile, icon: 'fa-id-card' },
                                { id: 'stances', label: ui.tabStances, icon: 'fa-fire-flame-curved' },
                                { id: 'traits', label: ui.tabTraits, icon: 'fa-user-check' },
                                { id: 'sayings', label: ui.tabSayings, icon: 'fa-quote-left' },
                                { id: 'virtues', label: ui.tabVirtues, icon: 'fa-award' },
                                { id: 'conversion', label: ui.tabConversion, icon: 'fa-shield-halved' },
                                { id: 'preIslam', label: ui.tabPreIslam, icon: 'fa-clock-rotate-left' },
                                { id: 'legacy', label: ui.tabLegacy, icon: 'fa-landmark' },
                                { id: 'lessons', label: ui.tabLessons, icon: 'fa-lightbulb' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setDetailTab(tab.id as any);
                                        scrollToTop();
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                                        detailTab === tab.id ? 'shadow-sm' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                    } ${isEn ? 'font-sans' : 'font-kufi'}`}
                                    style={{
                                        backgroundColor: detailTab === tab.id ? primaryColor : undefined,
                                        color: detailTab === tab.id ? themeActiveTextColor : 'inherit',
                                        borderColor: detailTab === tab.id ? primaryColor : cardBorderColor,
                                        borderWidth: '1px',
                                        borderStyle: 'solid'
                                    }}
                                >
                                    <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Scoped CSS for scaling text exclusively inside the companion's content cards (NEVER the tab bar) */}
            {selectedCompanion && cardTextScale > 1 && (
                <style>{`
                    .companion-cards-content .themed-card p,
                    .companion-cards-content .rounded-2xl p,
                    .companion-cards-content .rounded-3xl p,
                    .companion-cards-content .themed-card li,
                    .companion-cards-content .rounded-2xl li,
                    .companion-cards-content .themed-card .leading-relaxed,
                    .companion-cards-content .rounded-2xl .leading-relaxed {
                        font-size: calc(0.925rem * ${cardTextScale}) !important;
                        line-height: ${cardTextScale >= 1.3 ? '1.85' : '1.7'} !important;
                    }
                    .companion-cards-content .themed-card h2,
                    .companion-cards-content .rounded-2xl h2,
                    .companion-cards-content .rounded-3xl h2 {
                        font-size: calc(1.4rem * ${cardTextScale}) !important;
                    }
                    .companion-cards-content .themed-card h3,
                    .companion-cards-content .rounded-2xl h3,
                    .companion-cards-content .rounded-3xl h3 {
                        font-size: calc(1.15rem * ${cardTextScale}) !important;
                    }
                    .companion-cards-content .themed-card h4,
                    .companion-cards-content .themed-card h5,
                    .companion-cards-content .rounded-2xl h4,
                    .companion-cards-content .rounded-2xl h5 {
                        font-size: calc(1.05rem * ${cardTextScale}) !important;
                    }
                    .companion-cards-content .themed-card .text-xs,
                    .companion-cards-content .themed-card .text-\\[11px\\],
                    .companion-cards-content .themed-card .text-\\[10px\\],
                    .companion-cards-content .rounded-2xl .text-xs,
                    .companion-cards-content .rounded-2xl .text-\\[11px\\] {
                        font-size: calc(0.775rem * ${cardTextScale}) !important;
                    }
                    .companion-cards-content .themed-card .text-sm,
                    .companion-cards-content .rounded-2xl .text-sm {
                        font-size: calc(0.875rem * ${cardTextScale}) !important;
                    }
                    .companion-cards-content .themed-card .text-base,
                    .companion-cards-content .rounded-2xl .text-base {
                        font-size: calc(1rem * ${cardTextScale}) !important;
                    }
                    .companion-cards-content .themed-card .text-lg,
                    .companion-cards-content .rounded-2xl .text-lg {
                        font-size: calc(1.125rem * ${cardTextScale}) !important;
                    }
                    /* Ensure tab bar and all tab buttons NEVER scale */
                    .companion-tabs-nav,
                    .companion-tabs-nav *,
                    .companion-tabs-nav button,
                    .companion-tabs-nav span {
                        font-size: 0.75rem !important;
                        line-height: 1rem !important;
                    }
                    .companion-tabs-nav i {
                        font-size: 10px !important;
                    }
                `}</style>
            )}

            {/* Main Content Area */}
            <main 
                ref={mainScrollRef} 
                className={`flex-1 overflow-y-auto px-3 sm:px-4 ${selectedCompanion ? 'py-3 sm:py-4' : 'py-3 sm:py-5'} hide-scrollbar relative`}
            >
                {/* 1. LIST VIEW OF THE 10 COMPANIONS */}
                {!selectedCompanion ? (
                    <div className="max-w-3xl mx-auto space-y-4">
                        {/* Authentic Hadith Banner */}
                        <div 
                            className="p-4 sm:p-5 rounded-3xl themed-card border-2 shadow-lg relative overflow-hidden text-center"
                            style={{ borderColor: cardBorderColor }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Award className="w-5 h-5 text-amber-400" />
                                <h2 className={`text-sm sm:text-base font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-emerald-600 dark:text-emerald-400`}>
                                    {ui.hadithBannerTitle}
                                </h2>
                            </div>
                            <p className={`text-xs sm:text-sm leading-relaxed font-semibold opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                {isEn 
                                    ? '"Abu Bakr is in Paradise, Umar is in Paradise, Uthman is in Paradise, Ali is in Paradise, Talha is in Paradise, Az-Zubayr is in Paradise, Abdur-Rahman ibn Awf is in Paradise, Sa\'d is in Paradise, Saeed is in Paradise, and Abu Ubaydah ibn Al-Jarrah is in Paradise."'
                                    : '«أَبُو بَكْرٍ فِي الْجَنَّةِ، وَعُمَرُ فِي الْجَنَّةِ، وَعُثْمَانُ فِي الْجَنَّةِ، وَعَلِيٌّ فِي الْجَنَّةِ، وَطَلْحَةُ فِي الْجَنَّةِ، وَالزُّبَيْرُ فِي الْجَنَّةِ، وَعَبْدُ الرَّحْمَنِ بْنُ عَوْفٍ فِي الْجَنَّةِ، وَسَعْدٌ فِي الْجَنَّةِ، وَسَعِيدٌ فِي الْجَنَّةِ، وَأَبُو عُبَيْدَةَ بْنُ الْجَرَّاحِ فِي الْجَنَّةِ»'}
                            </p>
                            <div className="mt-2 text-[11px] opacity-70 font-sans">
                                {isEn ? 'Jami` at-Tirmidhi (3747) • Sunan Abi Dawud • Sahih' : 'رواه الترمذي (٣٧٤٧) وأحمد وأبو داود بإسناد صحيح'}
                            </div>
                        </div>

                        {/* Search and Quick Filters Header */}
                        <div className="space-y-2.5">
                            {/* Search Input Bar */}
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isEn ? 'left-3' : 'right-3'} flex items-center pointer-events-none opacity-60`}>
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={ui.searchPlaceholder}
                                    className={`w-full py-2.5 sm:py-3 ${isEn ? 'pl-9 pr-9' : 'pr-9 pl-9'} rounded-2xl themed-card border-2 text-xs sm:text-sm font-medium focus:outline-hidden transition-all shadow-xs`}
                                    style={{ borderColor: cardBorderColor }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className={`absolute inset-y-0 ${isEn ? 'right-3' : 'left-3'} flex items-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer`}
                                        title={ui.clearSearch}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Quick Filter Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                {[
                                    { id: 'all', label: ui.filterAll, icon: 'fa-users' },
                                    { id: 'caliphs', label: ui.filterCaliphs, icon: 'fa-crown' },
                                    { id: 'early', label: ui.filterEarly, icon: 'fa-star' },
                                    { id: 'commanders', label: ui.filterCommanders, icon: 'fa-shield-halved' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setActiveFilter(f.id as any)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                            activeFilter === f.id ? 'shadow-xs' : 'bg-black/5 dark:bg-white/5 opacity-80 hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: activeFilter === f.id ? primaryColor : undefined,
                                            color: activeFilter === f.id ? themeActiveTextColor : 'inherit',
                                            borderColor: activeFilter === f.id ? primaryColor : cardBorderColor
                                        }}
                                    >
                                        <i className={`fa-solid ${f.icon} text-[10px]`}></i>
                                        <span>{f.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Companions Grid / List */}
                        {filteredCompanions.length === 0 ? (
                            <div className="p-8 text-center rounded-2xl themed-card border space-y-3" style={{ borderColor: cardBorderColor }}>
                                <Compass className="w-10 h-10 mx-auto opacity-50 text-amber-500" />
                                <p className="text-sm font-bold opacity-80">{ui.noResults}</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 transition-colors"
                                >
                                    {ui.clearSearch}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {filteredCompanions.map((companion) => {
                                    const name = isEn ? companion.nameEn : companion.nameAr;
                                    const title = isEn ? companion.titleBadgeEn : companion.titleBadgeAr;

                                    return (
                                        <motion.div
                                            key={companion.id}
                                            id={`ten-promised-card-${companion.order}`}
                                            layout
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelectCompanion(companion)}
                                            className="p-4 sm:p-5 rounded-2xl themed-card border-2 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden space-y-3"
                                            style={{ borderColor: cardBorderColor }}
                                        >
                                            <div className="space-y-2">
                                                {/* Order Badge and Tag */}
                                                <div className="flex items-center justify-between">
                                                    <span 
                                                        className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shadow-xs"
                                                        style={{ backgroundColor: primaryColor, color: themeActiveTextColor }}
                                                    >
                                                        {companion.order}
                                                    </span>
                                                    <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                                        {isEn ? `Honored #${companion.order}` : `المبشر بالجنة #${companion.order}`}
                                                    </span>
                                                </div>

                                                {/* Name */}
                                                <h3 className={`text-base sm:text-lg font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors`}>
                                                    {name}
                                                </h3>

                                                {/* Title Badge / Subtitle */}
                                                <p className="text-xs sm:text-sm font-medium opacity-85 leading-relaxed line-clamp-2">
                                                    {title}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* 2. COMPANION DETAILED PROFILE VIEW */
                    <div className="max-w-3xl mx-auto companion-profile-scalable relative">
                        {/* Content Cards Container (Text zoom scaling applies strictly within this wrapper) */}
                        <div className="companion-cards-content space-y-4">
                            {/* Hero Card (shown ONLY in the first tab: 'profile' as requested) */}
                            {detailTab === 'profile' && (
                                <div 
                                    className="p-5 sm:p-7 rounded-3xl themed-card border-2 shadow-xl relative overflow-hidden space-y-4"
                                    style={{ borderColor: cardBorderColor }}
                                >
                                    {/* Top row: Order badge, Crown, Share & Copy buttons */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                    <span 
                                        className="w-8 h-8 rounded-full text-sm font-black flex items-center justify-center shadow-md"
                                        style={{ backgroundColor: primaryColor, color: themeActiveTextColor }}
                                    >
                                        {selectedCompanion.order}
                                    </span>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>{isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr}</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleCopyFullBio(selectedCompanion)}
                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 active:scale-90 transition-all cursor-pointer"
                                        title={ui.copyBiography}
                                        aria-label={ui.copyBiography}
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleShareCompanionImage(selectedCompanion)}
                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 active:scale-90 transition-all cursor-pointer"
                                        title={ui.shareImage}
                                        aria-label={ui.shareImage}
                                    >
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Name & Lineage */}
                            <div className="space-y-1">
                                <h2 className={`text-2xl sm:text-3xl font-black ${isEn ? 'font-sans' : 'font-kufi'} text-emerald-600 dark:text-emerald-400`}>
                                    {isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr}
                                </h2>
                                <p className="text-xs sm:text-sm font-semibold opacity-85 leading-relaxed">
                                    {isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}
                                </p>
                            </div>

                            {/* Key Quote Box */}
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 relative">
                                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                                    <Award size={14} />
                                    <span>{ui.quoteTitle}</span>
                                </div>
                                <p className={`text-xs sm:text-sm leading-relaxed font-bold italic ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                    {isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}
                                </p>
                            </div>

                            {/* Glad Tidings Hadith Card with Card Zoom */}
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 relative">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                        {ui.hadithProofLabel}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                            subtitle: ui.hadithProofLabel,
                                            badge: isEn ? 'Glad Tidings' : 'بشارة الجنة',
                                            icon: 'fa-solid fa-crown',
                                            content: isEn ? selectedCompanion.gladTidingsHadithEn : selectedCompanion.gladTidingsHadithAr,
                                            isVerseOrProof: true
                                        })}
                                        className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                        title={ui.zoom}
                                        aria-label={ui.zoom}
                                    >
                                        <ZoomIn size={14} />
                                    </button>
                                </div>
                                <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                    {isEn ? selectedCompanion.gladTidingsHadithEn : selectedCompanion.gladTidingsHadithAr}
                                </p>
                            </div>
                        </div>
                            )}

                        {/* Tab Content Panels */}
                        <div className="space-y-3.5">
                            {/* TAB 1: PROFILE */}
                            {detailTab === 'profile' && (
                                <div className="space-y-3">
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <i className="fa-solid fa-address-card"></i>
                                                <span>{ui.tabProfile}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: ui.tabProfile,
                                                    badge: isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr,
                                                    content: `${ui.fullNameLabel} ${isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}\n\n${ui.kunyaLabel} ${isEn ? selectedCompanion.kunyaEn : selectedCompanion.kunyaAr}\n\n${ui.birthLabel} ${isEn ? selectedCompanion.birthYearEn : selectedCompanion.birthYearAr}\n\n${ui.deathLabel} ${isEn ? selectedCompanion.deathYearEn : selectedCompanion.deathYearAr}\n\n${ui.burialLabel} ${isEn ? selectedCompanion.burialPlaceEn : selectedCompanion.burialPlaceAr}\n\n${ui.kinshipLabel} ${isEn ? selectedCompanion.kinshipEn : selectedCompanion.kinshipAr}`
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                                            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.fullNameLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.kunyaLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.kunyaEn : selectedCompanion.kunyaAr}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                                    <span className="font-bold opacity-70 block mb-0.5">{ui.birthLabel}</span>
                                                    <span className="font-semibold">{isEn ? selectedCompanion.birthYearEn : selectedCompanion.birthYearAr}</span>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                                    <span className="font-bold opacity-70 block mb-0.5">{ui.deathLabel}</span>
                                                    <span className="font-semibold">{isEn ? selectedCompanion.deathYearEn : selectedCompanion.deathYearAr}</span>
                                                </div>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.burialLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.burialPlaceEn : selectedCompanion.burialPlaceAr}</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.kinshipLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.kinshipEn : selectedCompanion.kinshipAr}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lineage & Kinship Card */}
                                    {extraSections && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <i className="fa-solid fa-sitemap text-emerald-500"></i>
                                                    <span>{isEn ? 'Lineage, Clan & Prophetic Kinship' : 'شجرة النسب والمكانة والقرابة النبوية'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Lineage & Kinship' : 'شجرة النسب والقرابة',
                                                        badge: isEn ? 'Lineage' : 'النسب الشريف',
                                                        icon: 'fa-solid fa-sitemap',
                                                        content: isEn ? extraSections.lineageDetailsEn : extraSections.lineageDetailsAr
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {isEn ? extraSections.lineageDetailsEn : extraSections.lineageDetailsAr}
                                            </p>
                                        </div>
                                    )}

                                    {/* Geographical Stations & Milestones */}
                                    {extraSections && extraSections.geographicalStations && extraSections.geographicalStations.length > 0 && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <i className="fa-solid fa-map-location-dot text-emerald-500"></i>
                                                    <span>{isEn ? 'Key Geographical Stations & Milestones' : 'المحطات الجغرافية ومسار الدعوة والفتوحات'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Geographical Stations' : 'المحطات الجغرافية والمسار',
                                                        badge: isEn ? 'Stations' : 'المحطات التاريخية',
                                                        icon: 'fa-solid fa-map-location-dot',
                                                        content: extraSections.geographicalStations.map(s => `📍 ${isEn ? s.placeEn : s.placeAr} (${isEn ? s.periodEn : s.periodAr})\n${isEn ? s.detailsEn : s.detailsAr}`)
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {extraSections.geographicalStations.map((station, sIdx) => (
                                                    <div key={sIdx} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/20 space-y-1">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                                                <i className="fa-solid fa-location-dot text-amber-500 text-xs"></i>
                                                                <span>{isEn ? station.placeEn : station.placeAr}</span>
                                                            </span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 font-medium opacity-80">
                                                                {isEn ? station.periodEn : station.periodAr}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[11px] sm:text-xs leading-relaxed font-medium opacity-85 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            {isEn ? station.detailsEn : station.detailsAr}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 2: HEROIC STANCES (مواقف وبطولات) */}
                            {detailTab === 'stances' && (() => {
                                const stances = getCompanionHeroicStances(selectedCompanion.id);
                                return (
                                    <div className="space-y-3.5">
                                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Flame className="w-5 h-5 text-amber-500" />
                                                <span className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-amber-700 dark:text-amber-300`}>
                                                    {isEn ? `${stances.length} Documented Heroic Stances` : `${stances.length} مواقف بطولية وخالدة موثقة في السيرة`}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-semibold opacity-75">
                                                {isEn ? 'Click card to zoom' : 'انقر للتكبير والمطالعة'}
                                            </span>
                                        </div>

                                        {stances.map((stance, idx) => (
                                            <div 
                                                key={stance.id || idx}
                                                className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative group"
                                                style={{ borderColor: cardBorderColor }}
                                            >
                                                {/* Stance Header: Category & Period + Zoom button */}
                                                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                    <div className="flex items-center flex-wrap gap-1.5">
                                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-bold border border-emerald-500/30">
                                                            {isEn ? stance.categoryEn : stance.categoryAr}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[10px] sm:text-xs font-medium opacity-80">
                                                            {isEn ? stance.periodEn : stance.periodAr}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setZoomedCard({
                                                            title: isEn ? stance.titleEn : stance.titleAr,
                                                            subtitle: `${isEn ? stance.periodEn : stance.periodAr} • ${isEn ? stance.categoryEn : stance.categoryAr}`,
                                                            badge: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            icon: 'fa-solid fa-fire-flame-curved',
                                                            content: `${isEn ? stance.storyEn : stance.storyAr}${stance.quoteAr ? `\n\n«${isEn ? (stance.quoteEn || stance.quoteAr) : stance.quoteAr}»` : ''}\n\n🌟 ${ui.impactLabel}\n${isEn ? stance.impactEn : stance.impactAr}`
                                                        })}
                                                        className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                        title={ui.zoom}
                                                    >
                                                        <ZoomIn size={14} />
                                                    </button>
                                                </div>

                                                {/* Stance Title */}
                                                <h4 className={`text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                                    {isEn ? stance.titleEn : stance.titleAr}
                                                </h4>

                                                {/* Stance Story */}
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {isEn ? stance.storyEn : stance.storyAr}
                                                </p>

                                                {/* Quote box if present */}
                                                {(stance.quoteAr || stance.quoteEn) && (
                                                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2">
                                                        <MessageSquareQuote size={15} className="text-amber-500 shrink-0 mt-0.5" />
                                                        <p className={`text-xs sm:text-sm font-bold italic text-amber-800 dark:text-amber-200 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            {isEn ? (stance.quoteEn || stance.quoteAr) : stance.quoteAr}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Stance Impact & Enduring Lesson */}
                                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                                                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
                                                        {ui.impactLabel}
                                                    </span>
                                                    <p className={`text-xs sm:text-sm font-semibold opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {isEn ? stance.impactEn : stance.impactAr}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}

                            {/* TAB 3: TRAITS & FAMILY (شمائله وأسرته) */}
                            {detailTab === 'traits' && (() => {
                                const traits = getCompanionTraits(selectedCompanion.id);
                                if (!traits) return null;
                                return (
                                    <div className="space-y-3.5">
                                        {/* Physical Appearance Card */}
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <UserCheck className="w-4 h-4 text-emerald-500" />
                                                    <span>{ui.physicalAppearanceLabel}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: ui.physicalAppearanceLabel,
                                                        badge: isEn ? 'Physical Traits' : 'الصفة الخَلقية',
                                                        icon: 'fa-solid fa-user-check',
                                                        content: isEn ? traits.physicalAppearanceEn : traits.physicalAppearanceAr
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {isEn ? traits.physicalAppearanceEn : traits.physicalAppearanceAr}
                                            </p>
                                        </div>

                                        {/* Worship & Devotion Card */}
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <Heart className="w-4 h-4 text-rose-500" />
                                                    <span>{ui.worshipLabel}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: ui.worshipLabel,
                                                        badge: isEn ? 'Worship & Devotion' : 'العبادة والزهد',
                                                        icon: 'fa-solid fa-heart',
                                                        content: isEn ? traits.worshipAndDevotionEn : traits.worshipAndDevotionAr
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {isEn ? traits.worshipAndDevotionEn : traits.worshipAndDevotionAr}
                                            </p>
                                        </div>

                                        {/* Family, Lineage & Descendants */}
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <i className="fa-solid fa-people-roof text-emerald-500"></i>
                                                    <span>{ui.familyLabel}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: ui.familyLabel,
                                                        badge: isEn ? 'Family & Kinship' : 'الأسرة والذرية',
                                                        icon: 'fa-solid fa-people-roof',
                                                        content: isEn ? traits.familyAndLineageEn : traits.familyAndLineageAr
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {isEn ? traits.familyAndLineageEn : traits.familyAndLineageAr}
                                            </p>
                                        </div>

                                        {/* Special Attributes & Talents */}
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1">
                                                <Sparkles className="w-4 h-4 text-amber-500" />
                                                <span>{ui.specialSkillsLabel}</span>
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {(isEn ? traits.specialSkillsEn : traits.specialSkillsAr).map((skill, idx) => (
                                                    <div key={idx} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/20 flex items-center gap-2 text-xs sm:text-sm font-semibold">
                                                        <i className="fa-solid fa-star text-amber-500 text-xs shrink-0"></i>
                                                        <span>{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Daily Routine & Devotion in His Day */}
                                        {extraSections && (
                                            <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                        <i className="fa-solid fa-sun text-amber-500"></i>
                                                        <span>{isEn ? 'A Day in His Life & Prayer Sanctuary' : 'يوم في حياة الصحابي ومحراب عبادته'}</span>
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setZoomedCard({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            subtitle: isEn ? 'A Day in His Life' : 'يوم في حياته وعبادته',
                                                            badge: isEn ? 'Daily Devotion' : 'محراب العبادة',
                                                            icon: 'fa-solid fa-sun',
                                                            content: isEn ? extraSections.dailyRoutineEn : extraSections.dailyRoutineAr
                                                        })}
                                                        className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                        title={ui.zoom}
                                                    >
                                                        <ZoomIn size={14} />
                                                    </button>
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {isEn ? extraSections.dailyRoutineEn : extraSections.dailyRoutineAr}
                                                </p>
                                            </div>
                                        )}

                                        {/* Unique Distinctions & Merits */}
                                        {extraSections && extraSections.uniqueDistinctionsAr && extraSections.uniqueDistinctionsAr.length > 0 && (
                                            <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                        <Award className="w-4 h-4 text-amber-500" />
                                                        <span>{isEn ? 'Unique Distinctions & Special Merits' : 'فرائد ومناقب انفرد بها في تاريخ الإسلام'}</span>
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setZoomedCard({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            subtitle: isEn ? 'Unique Distinctions' : 'فرائد وخصائص',
                                                            badge: isEn ? 'Excellence' : 'أوليات ومفاخر',
                                                            icon: 'fa-solid fa-award',
                                                            content: (isEn ? extraSections.uniqueDistinctionsEn : extraSections.uniqueDistinctionsAr).map((u, i) => `⭐ ${i + 1}. ${u}`)
                                                        })}
                                                        className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                        title={ui.zoom}
                                                    >
                                                        <ZoomIn size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {(isEn ? extraSections.uniqueDistinctionsEn : extraSections.uniqueDistinctionsAr).map((dist, idx) => (
                                                        <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-amber-500/20">
                                                            <i className="fa-solid fa-star-of-life text-amber-500 text-xs mt-1 shrink-0"></i>
                                                            <p className={`text-xs sm:text-sm leading-relaxed font-semibold ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                                {dist}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* TAB 4: WISDOM & QUOTES (حكم وأقوال مأثورة) */}
                            {detailTab === 'sayings' && (() => {
                                const quotes = getCompanionWisdomQuotes(selectedCompanion.id);
                                return (
                                    <div className="space-y-3.5">
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                                                {ui.quoteTitle}
                                            </span>
                                            <p className={`text-sm sm:text-base font-bold italic leading-relaxed text-emerald-700 dark:text-emerald-300 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                «{isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}»
                                            </p>
                                        </div>

                                        {quotes.map((q, idx) => (
                                            <div 
                                                key={idx}
                                                className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative"
                                                style={{ borderColor: cardBorderColor }}
                                            >
                                                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                                        <MessageSquareQuote size={13} />
                                                        <span>{isEn ? `Wisdom #${idx + 1}` : `درة وحكمة #${idx + 1}`}</span>
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`${isEn ? q.quoteEn : q.quoteAr}\n- ${isEn ? q.contextEn : q.contextAr}`);
                                                                showToast(ui.toastCopiedText);
                                                            }}
                                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            title={ui.copyText}
                                                        >
                                                            <Copy size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setZoomedCard({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                subtitle: isEn ? q.contextEn : q.contextAr,
                                                                badge: isEn ? `Wisdom #${idx + 1}` : `درة وحكمة #${idx + 1}`,
                                                                icon: 'fa-solid fa-quote-left',
                                                                content: `${isEn ? q.quoteEn : q.quoteAr}\n\n📜 ${ui.wisdomContextLabel}\n${isEn ? q.contextEn : q.contextAr}`
                                                            })}
                                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            title={ui.zoom}
                                                        >
                                                            <ZoomIn size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className={`text-xs sm:text-sm font-bold leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {isEn ? q.quoteEn : q.quoteAr}
                                                </p>

                                                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] sm:text-xs opacity-80 leading-relaxed">
                                                    <span className="font-bold opacity-90 block mb-0.5">{ui.wisdomContextLabel}</span>
                                                    <span>{isEn ? q.contextEn : q.contextAr}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Soul Purification & Heart Reform Methodology */}
                                        {extraSections && (
                                            <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                        <i className="fa-solid fa-seedling text-emerald-500"></i>
                                                        <span>{isEn ? 'Spiritual Discipline & Heart Reform' : 'منهج الصحابي في تزكية النفس وإصلاح القلوب'}</span>
                                                    </h4>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(isEn ? extraSections.eternalAdviceEn : extraSections.eternalAdviceAr);
                                                                showToast(ui.toastCopiedText);
                                                            }}
                                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            title={ui.copyText}
                                                        >
                                                            <Copy size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setZoomedCard({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                subtitle: isEn ? 'Spiritual Discipline' : 'تزكية النفس وإصلاح القلوب',
                                                                badge: isEn ? 'Spiritual Core' : 'منهج التزكية',
                                                                icon: 'fa-solid fa-seedling',
                                                                content: isEn ? extraSections.eternalAdviceEn : extraSections.eternalAdviceAr
                                                            })}
                                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            title={ui.zoom}
                                                        >
                                                            <ZoomIn size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-semibold opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {isEn ? extraSections.eternalAdviceEn : extraSections.eternalAdviceAr}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* TAB 5: PRE-ISLAM */}
                            {detailTab === 'preIslam' && (
                                <div className="space-y-3">
                                    {/* Card 1: Status in Quraysh */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <i className="fa-solid fa-users"></i>
                                                <span>{isEn ? 'Status & Lineage in Quraysh' : 'مكانته ونشأته في قريش'}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Status in Quraysh' : 'مكانته في قريش',
                                                    badge: isEn ? 'Before Islam' : 'قبل الإسلام',
                                                    content: isEn ? selectedCompanion.preIslamicLife.statusInQurayshEn : selectedCompanion.preIslamicLife.statusInQurayshAr
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.preIslamicLife.statusInQurayshEn : selectedCompanion.preIslamicLife.statusInQurayshAr}
                                        </p>
                                    </div>

                                    {/* Card 2: Morals & Pure Nature */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <Heart className="w-4 h-4 text-rose-500" />
                                                <span>{isEn ? 'Pure Nature & Morals' : 'أخلاقه وطهارة فطرته'}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Morals & Nature' : 'أخلاقه وفطرته',
                                                    badge: isEn ? 'Before Islam' : 'قبل الإسلام',
                                                    content: isEn ? selectedCompanion.preIslamicLife.moralsAndNatureEn : selectedCompanion.preIslamicLife.moralsAndNatureAr
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.preIslamicLife.moralsAndNatureEn : selectedCompanion.preIslamicLife.moralsAndNatureAr}
                                        </p>
                                    </div>

                                    {/* Card 3: Rejection of Idolatry */}
                                    {extraSections && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-amber-500" />
                                                    <span>{isEn ? 'Rejection of Pre-Islamic Idolatry' : 'موقفه الحاسم من وثنية الجاهلية وأصنامها'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Rejection of Idolatry' : 'البراءة من الأصنام والجاهلية',
                                                        badge: isEn ? 'Monotheistic Inclination' : 'طهارة العقيدة',
                                                        icon: 'fa-solid fa-shield-halved',
                                                        content: isEn ? extraSections.idolatryStanceEn : extraSections.idolatryStanceAr
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {isEn ? extraSections.idolatryStanceEn : extraSections.idolatryStanceAr}
                                            </p>
                                        </div>
                                    )}

                                    {/* Card 4: Trade, Wisdom & Knowledge */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-amber-500" />
                                                <span>{isEn ? 'Trade, Wisdom & Acumen' : 'تجارته وحكمته وخبرته'}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Trade & Knowledge' : 'تجارته وخبرته',
                                                    badge: isEn ? 'Before Islam' : 'قبل الإسلام',
                                                    content: isEn ? selectedCompanion.preIslamicLife.tradeAndKnowledgeEn : selectedCompanion.preIslamicLife.tradeAndKnowledgeAr
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.preIslamicLife.tradeAndKnowledgeEn : selectedCompanion.preIslamicLife.tradeAndKnowledgeAr}
                                        </p>
                                    </div>

                                    {/* Card 5: Pre-Islam Role & Arab Wisdom */}
                                    {extraSections && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <i className="fa-solid fa-scale-balanced text-emerald-500"></i>
                                                    <span>{isEn ? 'Wisdom & Standing Among Arab Nobles' : 'مكانته وفراسته وحكمته بين عقلاء العرب'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Wisdom & Status' : 'الحكمة والريادة في الجاهلية',
                                                        badge: isEn ? 'Pre-Islam Eminence' : 'ريادة وحكمة',
                                                        icon: 'fa-solid fa-scale-balanced',
                                                        content: isEn ? extraSections.wisdomAndPreIslamRoleEn : extraSections.wisdomAndPreIslamRoleAr
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {isEn ? extraSections.wisdomAndPreIslamRoleEn : extraSections.wisdomAndPreIslamRoleAr}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 3: CONVERSION & JIHAD */}
                            {detailTab === 'conversion' && (
                                <div className="space-y-3">
                                    {/* Story of Embracing Islam */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <i className="fa-solid fa-star-and-crescent"></i>
                                                <span>{isEn ? 'Story of Embracing Islam' : 'قصة دخوله في الإسلام'}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Embracing Islam' : 'قصة إسلامه',
                                                    badge: isEn ? 'Faith & Conversion' : 'قصة الإسلام',
                                                    content: isEn ? selectedCompanion.embracingIslam.storyEn : selectedCompanion.embracingIslam.storyAr
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.embracingIslam.storyEn : selectedCompanion.embracingIslam.storyAr}
                                        </p>
                                    </div>

                                    {/* Precedence and Advocacy */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-amber-500" />
                                                <span>{isEn ? 'Early Precedence & Sacrifices' : 'فضله وسَبقه وما لاقاه من أذى'}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Precedence & Sacrifices' : 'سبقه وتضحياته',
                                                    content: `${isEn ? selectedCompanion.embracingIslam.earlyPrecedenceEn : selectedCompanion.embracingIslam.earlyPrecedenceAr}\n\n${isEn ? selectedCompanion.embracingIslam.advocacyAndSacrificesEn : selectedCompanion.embracingIslam.advocacyAndSacrificesAr}`
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 mb-2 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.embracingIslam.earlyPrecedenceEn : selectedCompanion.embracingIslam.earlyPrecedenceAr}
                                        </p>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.embracingIslam.advocacyAndSacrificesEn : selectedCompanion.embracingIslam.advocacyAndSacrificesAr}
                                        </p>
                                    </div>

                                    {/* Major Battles List */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-blue-500" />
                                                <span>{ui.majorBattlesLabel}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: ui.majorBattlesLabel,
                                                    content: isEn ? selectedCompanion.migrationAndJihad.majorBattlesEn : selectedCompanion.migrationAndJihad.majorBattlesAr
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                                <div className="space-y-2">
                                                    {(isEn ? selectedCompanion.migrationAndJihad.majorBattlesEn : selectedCompanion.migrationAndJihad.majorBattlesAr).map((battle, idx) => (
                                                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/20">
                                                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                                {idx + 1}
                                                            </span>
                                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                                {battle}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Hijrah & Brotherhood Card */}
                                            {extraSections && (
                                                <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                            <Compass className="w-4 h-4 text-emerald-500" />
                                                            <span>{isEn ? 'Hijrah & Brotherhood in Madinah' : 'الهجرة النبوية والمؤاخاة المباركة بالمدينة'}</span>
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => setZoomedCard({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                subtitle: isEn ? 'Hijrah & Brotherhood' : 'الهجرة والمؤاخاة',
                                                                badge: isEn ? 'Hijrah' : 'الهجرة المباركة',
                                                                icon: 'fa-solid fa-compass',
                                                                content: isEn ? extraSections.hijrahAndBrotherhoodEn : extraSections.hijrahAndBrotherhoodAr
                                                            })}
                                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            title={ui.zoom}
                                                        >
                                                            <ZoomIn size={14} />
                                                        </button>
                                                    </div>
                                                    <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {isEn ? extraSections.hijrahAndBrotherhoodEn : extraSections.hijrahAndBrotherhoodAr}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Defense and Sacrifice for the Prophet Card */}
                                            {extraSections && (
                                                <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                            <Shield className="w-4 h-4 text-rose-500" />
                                                            <span>{isEn ? 'Sacrifice & Defense of the Prophet ﷺ' : 'الفداء والذود المستميت عن رسول الله ﷺ'}</span>
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => setZoomedCard({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                subtitle: isEn ? 'Sacrifice & Defense' : 'الفداء والدفاع النبوي',
                                                                badge: isEn ? 'Devoted Shield' : 'الفداء والوفاء',
                                                                icon: 'fa-solid fa-shield-halved',
                                                                content: isEn ? extraSections.prophetSacrificeEn : extraSections.prophetSacrificeAr
                                                            })}
                                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            title={ui.zoom}
                                                        >
                                                            <ZoomIn size={14} />
                                                        </button>
                                                    </div>
                                                    <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {isEn ? extraSections.prophetSacrificeEn : extraSections.prophetSacrificeAr}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                            {/* TAB 4: VIRTUES & GLAD TIDINGS */}
                            {detailTab === 'virtues' && (
                                <div className="space-y-3">
                                    {/* Prophetic Hadiths in his Virtues */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <Award className="w-4 h-4 text-amber-500" />
                                                <span>{ui.hadithsAndQuotesLabel}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: ui.hadithsAndQuotesLabel,
                                                    content: (isEn ? selectedCompanion.virtuesAndMerits.hadithsAndQuotesEn : selectedCompanion.virtuesAndMerits.hadithsAndQuotesAr).map(h => `${h.hadith}\n[${h.source}]`),
                                                    isVerseOrProof: true
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2.5">
                                            {(isEn ? selectedCompanion.virtuesAndMerits.hadithsAndQuotesEn : selectedCompanion.virtuesAndMerits.hadithsAndQuotesAr).map((item, idx) => (
                                                <div key={idx} className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                                                    <p className={`text-xs sm:text-sm font-bold leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {item.hadith}
                                                    </p>
                                                    <span className="text-[11px] opacity-70 block font-sans">
                                                        {item.source}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Titles & Honors */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-amber-400" />
                                            <span>{ui.titlesAndHonorsLabel}</span>
                                        </h4>
                                        <ul className="space-y-2">
                                            {(isEn ? selectedCompanion.virtuesAndMerits.titlesAndHonorsEn : selectedCompanion.virtuesAndMerits.titlesAndHonorsAr).map((titleItem, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-semibold opacity-90">
                                                    <i className="fa-solid fa-crown text-amber-500 text-xs mt-1 shrink-0"></i>
                                                    <span>{titleItem}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Testimonies of Companions */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
                                            <i className="fa-solid fa-quote-right text-emerald-500"></i>
                                            <span>{ui.testimoniesLabel}</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {(isEn ? selectedCompanion.virtuesAndMerits.testimoniesEn : selectedCompanion.virtuesAndMerits.testimoniesAr).map((testimony, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-emerald-500/25 text-xs sm:text-sm font-medium leading-relaxed italic">
                                                    {testimony}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quranic Verses Associated with Him Card */}
                                    {extraSections && extraSections.quranicVerses && extraSections.quranicVerses.length > 0 && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <i className="fa-solid fa-quran text-amber-500"></i>
                                                    <span>{isEn ? 'Noble Quranic Verses in His Honor & Context' : 'آيات قرآنية كريمة نزلت فيه أو ارتبطت بسيرته'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Quranic Verses' : 'آيات قرآنية في سيرته',
                                                        badge: isEn ? 'Quran' : 'القرآن الكريم',
                                                        icon: 'fa-solid fa-quran',
                                                        content: extraSections.quranicVerses.map(v => `📖 ${isEn ? v.surahEn : v.surahAr}\n«${isEn ? v.verseEn : v.verseAr}»\n\n📜 ${isEn ? v.contextEn : v.contextAr}`),
                                                        isVerseOrProof: true
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {extraSections.quranicVerses.map((verseItem, vIdx) => (
                                                    <div key={vIdx} className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/15">
                                                                {isEn ? verseItem.surahEn : verseItem.surahAr}
                                                            </span>
                                                        </div>
                                                        <p className={`text-xs sm:text-sm font-bold text-center leading-loose text-emerald-800 dark:text-emerald-200 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            «{isEn ? verseItem.verseEn : verseItem.verseAr}»
                                                        </p>
                                                        <p className={`text-[11px] sm:text-xs leading-relaxed opacity-85 font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
                                                                {isEn ? 'Context of Revelation:' : 'مناسبة النزول والسياق:'}
                                                            </span>
                                                            {isEn ? verseItem.contextEn : verseItem.contextAr}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Testimonies of Companions & Mothers of Believers */}
                                    {extraSections && extraSections.extraTestimonies && extraSections.extraTestimonies.length > 0 && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <i className="fa-solid fa-comments text-emerald-500"></i>
                                                    <span>{isEn ? 'Testimonies of Companions & Mothers of Believers' : 'شهادات كبار الصحابة وأمهات المؤمنين في حقه'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Testimonies' : 'شهادات الصحابة وأمهات المؤمنين',
                                                        badge: isEn ? 'Praise' : 'شهادات حق',
                                                        icon: 'fa-solid fa-comments',
                                                        content: extraSections.extraTestimonies.map(t => `💬 ${isEn ? t.speakerEn : t.speakerAr}:\n«${isEn ? t.quoteEn : t.quoteAr}»`)
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {extraSections.extraTestimonies.map((testItem, tIdx) => (
                                                    <div key={tIdx} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-emerald-500/25 space-y-1.5">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                                            <i className="fa-solid fa-user-tag text-[10px]"></i>
                                                            <span>{isEn ? testItem.speakerEn : testItem.speakerAr}</span>
                                                        </div>
                                                        <p className={`text-xs sm:text-sm font-medium leading-relaxed italic ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            «{isEn ? testItem.quoteEn : testItem.quoteAr}»
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 5: LEGACY & PASSING */}
                            {detailTab === 'legacy' && (
                                <div className="space-y-3">
                                    {/* Stance at Prophet's Death & Post-Prophet Role */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <i className="fa-solid fa-landmark"></i>
                                                <span>{isEn ? 'Stance at the Prophet\'s Demise' : 'موقفه عند وفاة النبي ﷺ ودوره'}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Stance at Prophet\'s Passing' : 'موقفه بعد وفاة النبي',
                                                    content: `${isEn ? selectedCompanion.postProphetEraAndLegacy.stanceAtProphetsDeathEn : selectedCompanion.postProphetEraAndLegacy.stanceAtProphetsDeathAr}\n\n${isEn ? selectedCompanion.postProphetEraAndLegacy.roleOrCaliphateEn : selectedCompanion.postProphetEraAndLegacy.roleOrCaliphateAr}`
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 mb-2 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.postProphetEraAndLegacy.stanceAtProphetsDeathEn : selectedCompanion.postProphetEraAndLegacy.stanceAtProphetsDeathAr}
                                        </p>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.postProphetEraAndLegacy.roleOrCaliphateEn : selectedCompanion.postProphetEraAndLegacy.roleOrCaliphateAr}
                                        </p>
                                    </div>

                                    {/* Major Achievements */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-emerald-500" />
                                            <span>{ui.majorAchievementsLabel}</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {(isEn ? selectedCompanion.postProphetEraAndLegacy.majorAchievementsEn : selectedCompanion.postProphetEraAndLegacy.majorAchievementsAr).map((achieve, idx) => (
                                                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/20">
                                                    <i className="fa-solid fa-check-circle text-emerald-600 dark:text-emerald-400 text-xs mt-1 shrink-0"></i>
                                                    <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {achieve}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Passing & Final Testament */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-2.5 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <i className="fa-solid fa-tombstone"></i>
                                                <span>{isEn ? 'Passing & Final Will' : 'وفاته واستشهاده ووصيته'}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Passing & Will' : 'وفاته ووصيته الأخيرة',
                                                    content: `${isEn ? selectedCompanion.passingAndTributes.deathDetailsEn : selectedCompanion.passingAndTributes.deathDetailsAr}\n\n• ${ui.lastWordsLabel}\n"${isEn ? selectedCompanion.passingAndTributes.lastWordsEn : selectedCompanion.passingAndTributes.lastWordsAr}"\n\n• ${ui.burialLabel}\n${isEn ? selectedCompanion.passingAndTributes.restingPlaceEn : selectedCompanion.passingAndTributes.restingPlaceAr}`
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.passingAndTributes.deathDetailsEn : selectedCompanion.passingAndTributes.deathDetailsAr}
                                        </p>
                                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                                                {ui.lastWordsLabel}
                                            </span>
                                            <p className={`text-xs sm:text-sm font-bold italic ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {isEn ? selectedCompanion.passingAndTributes.lastWordsEn : selectedCompanion.passingAndTributes.lastWordsAr}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Civilizational & Institutional Impact Card */}
                                    {extraSections && extraSections.civilizationalImpactAr && extraSections.civilizationalImpactAr.length > 0 && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <i className="fa-solid fa-landmark text-amber-500"></i>
                                                    <span>{isEn ? 'Civilizational & Institutional Legacy' : 'الأثر الحضاري والتأسيسي الممتد للأمة'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Civilizational Impact' : 'الأثر الحضاري والمؤسسي',
                                                        badge: isEn ? 'Enduring Legacy' : 'أثر حضاري',
                                                        icon: 'fa-solid fa-landmark',
                                                        content: (isEn ? extraSections.civilizationalImpactEn : extraSections.civilizationalImpactAr).map((c, i) => `🏛️ ${i + 1}. ${c}`)
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(isEn ? extraSections.civilizationalImpactEn : extraSections.civilizationalImpactAr).map((impact, idx) => (
                                                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/20">
                                                        <i className="fa-solid fa-building-columns text-emerald-600 dark:text-emerald-400 text-xs mt-1 shrink-0"></i>
                                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            {impact}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 6: FAITH LESSONS */}
                            {detailTab === 'lessons' && (
                                <div className="space-y-3">
                                    {/* Spiritual & Faith Lessons Card */}
                                    {extraSections && extraSections.spiritualLessonsAr && extraSections.spiritualLessonsAr.length > 0 && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <Heart className="w-4 h-4 text-rose-500" />
                                                    <span>{isEn ? 'Spiritual & Faith Lessons' : 'الدروس الإيمانية والروحية العميقة'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Spiritual Lessons' : 'الدروس الروحية والإيمانية',
                                                        badge: isEn ? 'Faith & Spirit' : 'إيمانيات',
                                                        icon: 'fa-solid fa-heart',
                                                        content: (isEn ? extraSections.spiritualLessonsEn : extraSections.spiritualLessonsAr).map((l, i) => `✨ ${i + 1}. ${l}`)
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(isEn ? extraSections.spiritualLessonsEn : extraSections.spiritualLessonsAr).map((lesson, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-rose-500/20">
                                                        <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                                                            {idx + 1}
                                                        </span>
                                                        <p className={`text-xs sm:text-sm leading-relaxed font-semibold ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            {lesson}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Leadership & Character Lessons Card */}
                                    {extraSections && extraSections.leadershipLessonsAr && extraSections.leadershipLessonsAr.length > 0 && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <i className="fa-solid fa-chess-knight text-amber-500"></i>
                                                    <span>{isEn ? 'Leadership, Management & Character' : 'الدروس القيادية والإدارية وبناء الشخصية'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Leadership Lessons' : 'الدروس القيادية والإدارية',
                                                        badge: isEn ? 'Leadership' : 'القيادة الراشدة',
                                                        icon: 'fa-solid fa-chess-knight',
                                                        content: (isEn ? extraSections.leadershipLessonsEn : extraSections.leadershipLessonsAr).map((l, i) => `🛡️ ${i + 1}. ${l}`)
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(isEn ? extraSections.leadershipLessonsEn : extraSections.leadershipLessonsAr).map((lesson, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-amber-500/20">
                                                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                                                            {idx + 1}
                                                        </span>
                                                        <p className={`text-xs sm:text-sm leading-relaxed font-semibold ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            {lesson}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* General Inspirational Lessons */}
                                    <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <i className="fa-solid fa-lightbulb text-amber-500"></i>
                                                <span>{ui.tabLessons}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: ui.tabLessons,
                                                    content: isEn ? selectedCompanion.inspirationalLessonsEn : selectedCompanion.inspirationalLessonsAr
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2.5">
                                            {(isEn ? selectedCompanion.inspirationalLessonsEn : selectedCompanion.inspirationalLessonsAr).map((lesson, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-emerald-500/20">
                                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <p className={`text-xs sm:text-sm leading-relaxed font-semibold ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {lesson}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Modern Application & Daily Emulation Plan Card */}
                                    {extraSections && extraSections.modernApplicationAr && extraSections.modernApplicationAr.length > 0 && (
                                        <div className="p-4 sm:p-5 rounded-2xl themed-card border shadow-sm space-y-3 relative" style={{ borderColor: cardBorderColor }}>
                                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                                    <span>{isEn ? 'Modern Action Plan: Emulating Him Today' : 'خطة عمل وتطبيق معاصر: كيف نقتدي به اليوم في حياتنا؟'}</span>
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: isEn ? 'Modern Application' : 'كيف نقتدي به اليوم',
                                                        badge: isEn ? 'Action Plan' : 'خطة عمل معاصرة',
                                                        icon: 'fa-solid fa-sparkles',
                                                        content: (isEn ? extraSections.modernApplicationEn : extraSections.modernApplicationAr).map((m, i) => `🎯 ${i + 1}. ${m}`)
                                                    })}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(isEn ? extraSections.modernApplicationEn : extraSections.modernApplicationAr).map((app, idx) => (
                                                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                        <p className={`text-xs sm:text-sm leading-relaxed font-semibold text-emerald-950 dark:text-emerald-100 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            {app}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bottom Pagination & Navigation (Next / Prev Companion) */}
                        <div className="pt-4 pb-6 flex items-center justify-between gap-3">
                            {prevCompanion ? (
                                <button
                                    onClick={() => handleSelectCompanion(prevCompanion)}
                                    className="flex-1 py-3 px-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                                    style={{ borderColor: cardBorderColor }}
                                >
                                    <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xs`}></i>
                                    <span className="truncate">{isEn ? prevCompanion.nameEn : prevCompanion.nameAr}</span>
                                </button>
                            ) : <div className="flex-1" />}

                            {nextCompanion ? (
                                <button
                                    onClick={() => handleSelectCompanion(nextCompanion)}
                                    className="flex-1 py-3 px-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                                    style={{ borderColor: cardBorderColor }}
                                >
                                    <span className="truncate">{isEn ? nextCompanion.nameEn : nextCompanion.nameAr}</span>
                                    <i className={`fa-solid ${isEn ? 'fa-arrow-right' : 'fa-arrow-left'} text-xs`}></i>
                                </button>
                            ) : <div className="flex-1" />}
                        </div>
                    </div>
                </div>
            )}
        </main>

            {/* Zoom Modal - Matches PropheticSeerahPage and Daily Adhkar Pages */}
            <AnimatePresence>
                {zoomedCard && (
                    <div 
                        className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-3 sm:p-4 backdrop-blur-sm"
                        onClick={() => setZoomedCard(null)}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-5 sm:p-7 rounded-3xl w-full max-w-2xl relative shadow-2xl border-2 flex flex-col max-h-[90vh] ${isEn ? 'text-left font-sans' : 'text-center'}`}
                            style={{ 
                                fontFamily: isEn ? 'inherit' : theme.font,
                                backgroundColor: isDeepBlack ? '#111827' : (theme.cardBg || '#ffffff'),
                                color: theme.textColor || (isDeepBlack ? '#ffffff' : '#1f2937'),
                                borderColor: cardBorderColor,
                                direction: isEn ? 'ltr' : 'rtl'
                            }}
                            onClick={e => e.stopPropagation()}
                            dir={isEn ? 'ltr' : 'rtl'}
                        >
                            {/* Header: Title & Subtitle */}
                            <div className="flex items-center pb-3 border-b shrink-0 gap-2.5" style={{ borderColor: 'var(--card-border)' }}>
                                {zoomedCard.icon && (
                                    <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                        <i className={`${zoomedCard.icon} text-sm`}></i>
                                    </div>
                                )}
                                <div className={`min-w-0 flex-1 ${isEn ? 'text-left' : 'text-right'}`}>
                                    <h3 className={`text-base sm:text-lg font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-emerald-600 dark:text-emerald-400 leading-snug`}>
                                        {zoomedCard.title}
                                    </h3>
                                    {zoomedCard.subtitle && (
                                        <p className="text-xs opacity-70 font-sans mt-0.5">
                                            {zoomedCard.subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Content Container */}
                            <div ref={zoomScrollRef} className={`overflow-y-auto hide-scrollbar flex-1 py-4 ${isEn ? 'text-left' : 'text-right'}`}>
                                {Array.isArray(zoomedCard.content) ? (
                                    <div className="space-y-3">
                                        {zoomedCard.content.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border" style={{ borderColor: 'var(--card-border)' }}>
                                                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <p 
                                                    className={`flex-1 font-medium leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`}
                                                    style={{ fontSize: `${zoomFontSize}px` }}
                                                >
                                                    {item}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p 
                                        className={`leading-loose font-medium select-text whitespace-pre-line ${
                                            isEn ? 'font-sans' : (zoomedCard.isVerseOrProof ? 'font-quran' : 'font-amiri')
                                        }`}
                                        style={{ fontSize: `${zoomFontSize}px` }}
                                    >
                                        {zoomedCard.content}
                                    </p>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-3 border-t flex items-center gap-2 shrink-0" style={{ borderColor: 'var(--card-border)' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const textToCopy = Array.isArray(zoomedCard.content) 
                                            ? zoomedCard.content.map((item, i) => `${i + 1}. ${item}`).join('\n')
                                            : zoomedCard.content;
                                        navigator.clipboard.writeText(textToCopy);
                                        showToast(ui.toastCopiedText);
                                    }}
                                    className="flex-1 py-3 rounded-xl font-bold border text-sm flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                                    style={{ borderColor: cardBorderColor }}
                                >
                                    <Copy size={15} />
                                    <span>{ui.copyText}</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setZoomedCard(null)} 
                                    className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all cursor-pointer text-sm"
                                >
                                    {ui.close}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Interactive Spotlight Guide for Ten Promised Page */}
            <CommunitySpotlightGuide
                guideKey="ten_promised_page_spotlight"
                steps={TEN_PROMISED_PAGE_STEPS}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={isEn}
            />
        </div>
    );
};

export default TenPromisedPage;
