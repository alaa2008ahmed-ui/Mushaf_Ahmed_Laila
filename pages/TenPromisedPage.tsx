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
    ZoomIn, ArrowLeft, ArrowRight, Share2, Copy, 
    Check, Compass, ChevronDown 
} from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { TEN_PROMISED_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';

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

interface AutoFitSingleLineProps {
    as?: 'h2' | 'h3' | 'h4' | 'span';
    text: string;
    baseFontSize: number;
    smFontSize?: number;
    minFontSize?: number;
    textScale?: number;
    className?: string;
    style?: React.CSSProperties;
}

const AutoFitSingleLine: React.FC<AutoFitSingleLineProps> = ({
    as: Tag = 'h3',
    text,
    baseFontSize,
    smFontSize,
    minFontSize = 8.5,
    textScale = 1,
    className = '',
    style,
}) => {
    const elRef = useRef<HTMLElement | null>(null);

    const fitText = useCallback(() => {
        const el = elRef.current;
        if (!el) return;

        const effectiveBase =
            smFontSize && typeof window !== 'undefined' && window.innerWidth >= 640
                ? smFontSize
                : baseFontSize;
        const targetSize = effectiveBase * textScale;
        el.style.fontSize = `${targetSize}px`;

        const availableWidth = el.clientWidth;
        if (availableWidth <= 0) return;

        const floor = Math.min(minFontSize, 8.5);
        if (el.scrollWidth > availableWidth) {
            const ratio = availableWidth / el.scrollWidth;
            let currentSize = Math.max(floor, Math.floor(targetSize * ratio * 2) / 2);
            el.style.fontSize = `${currentSize}px`;

            while (el.scrollWidth > el.clientWidth && currentSize > floor) {
                currentSize = Math.max(floor, currentSize - 0.5);
                el.style.fontSize = `${currentSize}px`;
            }
        }
    }, [text, baseFontSize, smFontSize, minFontSize, textScale]);

    useLayoutEffect(() => {
        fitText();
    }, [fitText]);

    useEffect(() => {
        const el = elRef.current;
        if (!el) return;
        let rafId: number | null = null;
        const scheduleFit = () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                fitText();
            });
        };
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleFit) : null;
        if (ro) ro.observe(el);
        if (typeof document !== 'undefined' && document.fonts?.ready) {
            document.fonts.ready.then(scheduleFit).catch(() => {});
        }
        return () => {
            if (ro) ro.disconnect();
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [fitText]);

    return (
        <Tag
            ref={elRef as any}
            className={`seerah-autofit-heading block whitespace-nowrap overflow-hidden text-ellipsis ${className}`}
            style={style}
        >
            {text}
        </Tag>
    );
};

const TenPromisedPage: React.FC<TenPromisedPageProps> = ({ onBack, onNavigate, navParams, onOpenThemes }) => {
    const { theme, themeKey, isNightMode } = useTheme();
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const ui = TEN_PROMISED_UI_TEXTS[isEn ? 'en' : 'ar'];

    // Modern Flat Design System
    const tokens = useMemo(() => getModernFlatTokens(theme, themeKey), [theme, themeKey]);
    const isEffectiveDark = isNightMode || tokens.isDark || themeKey === 'black_gold' || themeKey === 'deep_black' || theme.bgColor === '#000000';
    const { 
        primaryColor, 
        themeActiveTextColor, 
        pageBgColor
    } = tokens;
    const themeHeadingColor = (tokens.isDeepBlack || isEffectiveDark && (themeKey === 'deep_black' || theme.bgColor === '#000000')) ? '#FFFFFF' : primaryColor;
    const innerSubBoxClass = `app-inner-3d-box border-0 ${tokens.isDeepBlack ? 'bg-[#18181b]' : 'bg-white dark:bg-[#0F172A]/85'}`;
    const primaryBadge3DStyle: React.CSSProperties = {
        backgroundColor: tokens.isDeepBlack ? '#27272A' : primaryColor,
        color: themeActiveTextColor,
        boxShadow: isEffectiveDark
            ? '0 3.5px 0 #09090b, 0 6px 12px rgba(0, 0, 0, 0.55), inset 0 1.5px 1px rgba(255, 255, 255, 0.32), inset 0 -1.5px 2px rgba(0, 0, 0, 0.35)'
            : '0 3.5px 0 rgba(0, 0, 0, 0.22), 0 6px 12px -2px rgba(0, 0, 0, 0.16), inset 0 1.5px 1px rgba(255, 255, 255, 0.42), inset 0 -1.5px 2px rgba(0, 0, 0, 0.12)',
    };
    const itemBadge3DStyle: React.CSSProperties = {
        backgroundColor: isEffectiveDark ? (tokens.isDeepBlack ? '#27272A' : '#1E293B') : '#FFFFFF',
        color: themeHeadingColor,
        boxShadow: isEffectiveDark
            ? '0 2.5px 0 #09090b, 0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.35)'
            : '0 2.5px 0 rgba(0, 0, 0, 0.11), 0 4px 8px -1px rgba(0, 0, 0, 0.08), inset 0 1.5px 1px rgba(255, 255, 255, 0.98), inset 0 -1px 2px rgba(0, 0, 0, 0.05)',
    };

    // Scroll container refs
    const mainScrollRef = useRef<HTMLElement | null>(null);
    const zoomScrollRef = useRef<HTMLDivElement | null>(null);
    const savedListScrollTopRef = useRef<number>(0);
    const restoreScrollTargetRef = useRef<number | null>(null);

    // Filter state
    const [activeFilter, setActiveFilter] = useState<'all' | 'caliphs' | 'early' | 'commanders'>('all');

    // Selected Companion for detailed profile view
    const [selectedCompanion, setSelectedCompanion] = useState<CompanionInfo | null>(null);

    useEffect(() => {
        if (navParams?.companionId || navParams?.highlightId) {
            const targetId = navParams.companionId || navParams.highlightId;
            const found = TEN_PROMISED_COMPANIONS.find(c => c.id === targetId);
            if (found) {
                setSelectedCompanion(found);
            }
        }
    }, [navParams]);

    // Sub-tab within companion detail view
    const [detailTab, setDetailTab] = useState<'profile' | 'stances' | 'traits' | 'virtues' | 'sayings' | 'preIslam' | 'conversion' | 'legacy' | 'lessons'>('profile');

    // Zoom Modal State for Cards
    const [zoomedCard, setZoomedCard] = useState<ZoomedCardData | null>(null);
    const [zoomFontSize, setZoomFontSize] = useState<number>(24);
    const [copiedModal, setCopiedModal] = useState(false);

    // Global in-page card font scaling with persistence (matches Hajj & Umrah page behavior)
    const [cardTextScale, setCardTextScale] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('tenPromisedCardTextScale');
            return saved ? parseFloat(saved) : 1;
        } catch {
            return 1;
        }
    });

    const toggleCardTextScale = () => {
        setCardTextScale(prev => {
            const next = prev >= 1.45 ? 1 : Number((prev + 0.15).toFixed(2));
            try {
                localStorage.setItem('tenPromisedCardTextScale', String(next));
            } catch {}
            return next;
        });
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
        const el = mainScrollRef.current;
        if (!el) return;
        if (!selectedCompanion && restoreScrollTargetRef.current !== null) {
            const targetScroll = restoreScrollTargetRef.current;
            restoreScrollTargetRef.current = null;
            el.scrollTop = targetScroll;
            requestAnimationFrame(() => {
                if (mainScrollRef.current) {
                    mainScrollRef.current.scrollTop = targetScroll;
                }
            });
            return;
        }
        el.scrollTop = 0;
    }, [selectedCompanion?.id, detailTab]);

    useLayoutEffect(() => {
        if (zoomedCard && zoomScrollRef.current) {
            zoomScrollRef.current.scrollTop = 0;
        }
    }, [zoomedCard]);

    const handleSelectCompanion = (c: CompanionInfo) => {
        if (!selectedCompanion && mainScrollRef.current) {
            savedListScrollTopRef.current = mainScrollRef.current.scrollTop;
        }
        restoreScrollTargetRef.current = null;
        setSelectedCompanion(c);
        setDetailTab('profile');
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

    // Filtered Companions based on category filter
    const filteredCompanions = useMemo(() => {
        let list = [...TEN_PROMISED_COMPANIONS];

        if (activeFilter === 'caliphs') {
            list = list.filter(c => ['abu-bakr', 'umar-ibn-khattab', 'uthman-ibn-affan', 'ali-ibn-abi-talib'].includes(c.id));
        } else if (activeFilter === 'early') {
            list = list.filter(c => ['abu-bakr', 'ali-ibn-abi-talib', 'saeed-ibn-zayd', 'uthman-ibn-affan', 'abdur-rahman-ibn-awf', 'sad-ibn-abi-waqqas', 'talha-ibn-ubaydillah', 'az-zubayr-ibn-al-awwam'].includes(c.id));
        } else if (activeFilter === 'commanders') {
            list = list.filter(c => ['sad-ibn-abi-waqqas', 'abu-ubaydah-ibn-al-jarrah', 'az-zubayr-ibn-al-awwam', 'ali-ibn-abi-talib'].includes(c.id));
        }

        return list;
    }, [activeFilter]);

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
            restoreScrollTargetRef.current = savedListScrollTopRef.current;
            setSelectedCompanion(null);
            return;
        }
        if (onBack) {
            onBack();
        } else {
            onNavigate('home');
        }
    }, [zoomedCard, selectedCompanion, onBack, onNavigate]);

    // Handle Phone / Hardware / Gesture Back Button
    useEffect(() => {
        const interceptor = () => {
            if (zoomedCard) {
                setZoomedCard(null);
                return true;
            }
            if (selectedCompanion) {
                restoreScrollTargetRef.current = savedListScrollTopRef.current;
                setSelectedCompanion(null);
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedCard, selectedCompanion]);

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
        text += isEn ? 'Shared from Mushaf Ahmed & Laila App' : 'مشارك من تطبيق مصحف أحمد و ليلى';

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
            className={`flex flex-col h-[100dvh] overflow-hidden select-none ${isEn ? 'text-left font-sans' : 'text-right'}`}
            style={{ 
                backgroundColor: pageBgColor, 
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
                        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-[18px] text-xs sm:text-sm font-bold shadow-xl border-0 flex items-center gap-2"
                        style={{ backgroundColor: primaryColor, color: themeActiveTextColor }}
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
                            
                            {/* Magnifying Glass to scale text of cards (always accessible) */}
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
                        </div>

                        {/* Title in center */}
                        <div className={`text-center ${selectedCompanion ? 'px-20 sm:px-24' : 'px-14'}`}>
                            <h1 className={`app-top-bar__title ${isEn ? 'font-bold' : 'font-kufi'} ${
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
                                    <i className="fa-solid fa-circle-question text-lg"></i>
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
                    className="shrink-0 z-20 px-3 sm:px-4 pt-1.5 pb-3 border-0"
                    style={{ 
                        backgroundColor: pageBgColor
                    }}
                >
                    <div className="max-w-3xl mx-auto">
                        <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-2xl p-1 overflow-visible">
                            <div 
                                className="companion-tabs-nav flex items-center gap-1.5 overflow-x-auto p-0.5 hide-scrollbar"
                            >
                                {[
                                    { id: 'profile', label: ui.tabProfile },
                                    { id: 'stances', label: ui.tabStances },
                                    { id: 'traits', label: ui.tabTraits },
                                    { id: 'sayings', label: ui.tabSayings },
                                    { id: 'virtues', label: ui.tabVirtues },
                                    { id: 'conversion', label: ui.tabConversion },
                                    { id: 'preIslam', label: ui.tabPreIslam },
                                    { id: 'legacy', label: ui.tabLegacy },
                                    { id: 'lessons', label: ui.tabLessons }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            setDetailTab(tab.id as any);
                                            scrollToTop();
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-0 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                                            detailTab === tab.id ? 'active:translate-y-[1px]' : 'wird-inner-raised hover:opacity-100 opacity-85'
                                        } ${isEn ? 'font-sans' : 'font-kufi'}`}
                                        style={{
                                            backgroundColor: detailTab === tab.id ? primaryColor : undefined,
                                            color: detailTab === tab.id ? themeActiveTextColor : (tokens.isDark ? '#CBD5E1' : '#475569'),
                                            boxShadow: detailTab === tab.id
                                                ? '0 4px 0 rgba(0, 0, 0, 0.2), 0 7px 14px -2px rgba(0, 0, 0, 0.14), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.35)'
                                                : undefined
                                        }}
                                    >
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Scoped CSS for scaling text across cards when cardTextScale > 1, ensuring tabs and chips NEVER scale */}
            {cardTextScale > 1 && (
                <style>{`
                    .promised-scalable-content p,
                    .promised-scalable-content li,
                    .promised-scalable-content blockquote,
                    .promised-scalable-content .leading-relaxed {
                        font-size: calc(0.925rem * ${cardTextScale}) !important;
                        line-height: ${cardTextScale >= 1.3 ? '1.9' : '1.75'} !important;
                    }
                    .promised-scalable-content h2:not(.seerah-autofit-heading) {
                        font-size: calc(1.35rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content h3:not(.seerah-autofit-heading) {
                        font-size: calc(1.15rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content h4:not(.seerah-autofit-heading),
                    .promised-scalable-content h5:not(.seerah-autofit-heading) {
                        font-size: calc(1.05rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-xs:not(button):not(.seerah-autofit-heading),
                    .promised-scalable-content .text-\\[11px\\]:not(button):not(.seerah-autofit-heading),
                    .promised-scalable-content .text-\\[10px\\]:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(0.775rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-sm:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(0.875rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-base:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(1rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-lg:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(1.125rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-xl:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(1.25rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .line-clamp-2 {
                        -webkit-line-clamp: 4 !important;
                    }
                    .promised-scalable-content .line-clamp-3 {
                        -webkit-line-clamp: 5 !important;
                    }
                    /* Ensure tab bar, top tabs, and filter chips NEVER scale */
                    .no-scale,
                    .no-scale *,
                    .companion-tabs-nav,
                    .companion-tabs-nav *,
                    .filter-chips-nav,
                    .filter-chips-nav * {
                        font-size: 0.75rem !important;
                        line-height: 1rem !important;
                    }
                `}</style>
            )}

            {/* Main Content Area */}
            <main 
                ref={mainScrollRef} 
                className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 pt-3 sm:pt-4 app-scroll-safe hide-scrollbar relative promised-scalable-content"
            >
                {/* 1. LIST VIEW OF THE 10 COMPANIONS */}
                {!selectedCompanion ? (
                    <div className="max-w-3xl mx-auto space-y-4">
                        {/* Quick Filters Header */}
                        <div className="space-y-2.5">
                            {/* Quick Filter Chips */}
                            <div className="filter-chips-nav no-scale flex items-center gap-2 overflow-x-auto py-2 px-1 hide-scrollbar">
                                {[
                                    { id: 'all', label: ui.filterAll },
                                    { id: 'caliphs', label: ui.filterCaliphs },
                                    { id: 'early', label: ui.filterEarly },
                                    { id: 'commanders', label: ui.filterCommanders }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setActiveFilter(f.id as any)}
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                                        style={activeFilter === f.id ? {
                                            backgroundColor: primaryColor,
                                            color: themeActiveTextColor
                                        } : {
                                            color: 'var(--text-color)'
                                        }}
                                    >
                                        <span>{f.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Companions Grid / List */}
                        {filteredCompanions.length === 0 ? (
                            <div 
                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-8 text-center rounded-[18px] space-y-3"
                            >
                                <Compass className="w-10 h-10 mx-auto opacity-50 text-amber-500" />
                                <p className="text-sm font-bold opacity-80">{ui.noResults}</p>
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className="px-4 py-2 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all active:translate-y-[2px]"
                                    style={{
                                        backgroundColor: primaryColor,
                                        color: themeActiveTextColor,
                                        boxShadow: '0 4px 0 rgba(0, 0, 0, 0.2), 0 8px 16px -2px rgba(0, 0, 0, 0.14), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.35)'
                                    }}
                                >
                                    {ui.clearSearch}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                                {filteredCompanions.map((companion) => {
                                    const name = isEn ? companion.nameEn : companion.nameAr;
                                    const title = isEn ? companion.titleBadgeEn : companion.titleBadgeAr;

                                    return (
                                        <div
                                            key={companion.id}
                                            id={`ten-promised-card-${companion.order}`}
                                            onClick={() => handleSelectCompanion(companion)}
                                            className="app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] cursor-pointer flex flex-col justify-between group relative overflow-visible space-y-3"
                                        >
                                            <div className="space-y-2">
                                                {/* Order Circle */}
                                                <div className="flex items-center justify-between">
                                                    <span 
                                                        className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center border-0"
                                                        style={primaryBadge3DStyle}
                                                    >
                                                        {companion.order}
                                                    </span>
                                                </div>

                                                {/* Name */}
                                                <AutoFitSingleLine
                                                    as="h3"
                                                    text={name}
                                                    baseFontSize={16}
                                                    smFontSize={18}
                                                    minFontSize={9}
                                                    textScale={cardTextScale}
                                                    className={`font-bold ${isEn ? 'font-sans' : 'font-kufi'}`}
                                                    style={{ color: themeHeadingColor }}
                                                />

                                                {/* Title Badge / Subtitle */}
                                                <p className="text-xs sm:text-sm font-medium opacity-85 leading-relaxed line-clamp-2">
                                                    {title}
                                                </p>
                                            </div>
                                        </div>
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
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 sm:p-7 rounded-[18px] relative overflow-visible space-y-4"
                                >
                                    {/* Top row: Order badge, Share & Copy buttons */}
                                    <div className="flex items-center justify-between overflow-visible">
                                        <span 
                                            className="w-8 h-8 rounded-full text-sm font-black flex items-center justify-center border-0"
                                            style={primaryBadge3DStyle}
                                        >
                                            {selectedCompanion.order}
                                        </span>

                                        <div className="flex items-center gap-2 overflow-visible">
                                            <button
                                                type="button"
                                                onClick={() => handleShareCompanionImage(selectedCompanion)}
                                                disabled={isSharing}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                                title={ui.shareImage}
                                                aria-label={ui.shareImage}
                                            >
                                                {isSharing ? <i className="fa-solid fa-circle-notch fa-spin text-xs"></i> : <Share2 className="w-3.5 h-3.5" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyFullBio(selectedCompanion)}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                                title={ui.copyBiography}
                                                aria-label={ui.copyBiography}
                                            >
                                                <i className="fa-regular fa-copy text-xs"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Name & Lineage */}
                                    <div className="space-y-1">
                                        <AutoFitSingleLine
                                            as="h2"
                                            text={isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr}
                                            baseFontSize={22}
                                            smFontSize={28}
                                            minFontSize={11}
                                            textScale={cardTextScale}
                                            className={`font-black ${isEn ? 'font-sans' : 'font-kufi'}`}
                                            style={{ color: themeHeadingColor }}
                                        />
                                        <p className="text-xs sm:text-sm font-semibold opacity-85 leading-relaxed">
                                            {isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}
                                        </p>
                                    </div>

                                    {/* Key Quote Box */}
                                    <div 
                                        className={`p-3.5 sm:p-4 rounded-[16px] relative ${innerSubBoxClass}`}
                                    >
                                        <div className="text-[11px] font-bold mb-1" style={{ color: themeHeadingColor }}>
                                            <span>{ui.quoteTitle}</span>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-bold italic ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}
                                        </p>
                                    </div>

                                    {/* Glad Tidings Hadith Card with Card Zoom */}
                                    <div 
                                        className={`p-4 rounded-[16px] relative ${innerSubBoxClass}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-bold" style={{ color: themeHeadingColor }}>
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
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                            <div 
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all" 
                                            >
                                        <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={ui.tabProfile} baseFontSize={14} minFontSize={9.5} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: ui.tabProfile,
                                                    badge: isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr,
                                                    content: `${ui.fullNameLabel} ${isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}\n\n${ui.kunyaLabel} ${isEn ? selectedCompanion.kunyaEn : selectedCompanion.kunyaAr}\n\n${ui.birthLabel} ${isEn ? selectedCompanion.birthYearEn : selectedCompanion.birthYearAr}\n\n${ui.deathLabel} ${isEn ? selectedCompanion.deathYearEn : selectedCompanion.deathYearAr}\n\n${ui.burialLabel} ${isEn ? selectedCompanion.burialPlaceEn : selectedCompanion.burialPlaceAr}\n\n${ui.kinshipLabel} ${isEn ? selectedCompanion.kinshipEn : selectedCompanion.kinshipAr}`
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                                            <div className={`p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.fullNameLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}</span>
                                            </div>
                                            <div className={`p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.kunyaLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.kunyaEn : selectedCompanion.kunyaAr}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                <div className={`p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                    <span className="font-bold opacity-70 block mb-0.5">{ui.birthLabel}</span>
                                                    <span className="font-semibold">{isEn ? selectedCompanion.birthYearEn : selectedCompanion.birthYearAr}</span>
                                                </div>
                                                <div className={`p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                    <span className="font-bold opacity-70 block mb-0.5">{ui.deathLabel}</span>
                                                    <span className="font-semibold">{isEn ? selectedCompanion.deathYearEn : selectedCompanion.deathYearAr}</span>
                                                </div>
                                            </div>
                                            <div className={`p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.burialLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.burialPlaceEn : selectedCompanion.burialPlaceAr}</span>
                                            </div>
                                            <div className={`p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.kinshipLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.kinshipEn : selectedCompanion.kinshipAr}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lineage & Kinship Card */}
                                    {extraSections && (
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Lineage, Clan & Prophetic Kinship' : 'شجرة النسب والمكانة والقرابة النبوية'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Key Geographical Stations & Milestones' : 'المحطات الجغرافية ومسار الدعوة والفتوحات'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {extraSections.geographicalStations.map((station, sIdx) => (
                                                    <div key={sIdx} className={`p-3 rounded-[14px] space-y-1 ${innerSubBoxClass}`}>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <AutoFitSingleLine
                                                                as="span"
                                                                text={isEn ? station.placeEn : station.placeAr}
                                                                baseFontSize={12}
                                                                minFontSize={8.5}
                                                                textScale={cardTextScale}
                                                                className="font-bold min-w-0 flex-1"
                                                                style={{ color: themeHeadingColor }}
                                                            />
                                                            <span className="text-[10px] font-bold opacity-65 shrink-0">
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-[16px] flex items-center justify-between gap-2 overflow-visible"
                                        >
                                            <AutoFitSingleLine
                                                as="span"
                                                text={isEn ? `${stances.length} Documented Heroic Stances` : `${stances.length} مواقف بطولية وخالدة موثقة في السيرة`}
                                                baseFontSize={13}
                                                minFontSize={9}
                                                textScale={cardTextScale}
                                                className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`}
                                                style={{ color: themeHeadingColor }}
                                            />
                                        </div>

                                        {stances.map((stance, idx) => (
                                            <div 
                                                key={stance.id || idx}
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible group transition-all"
                                            >
                                                {/* Stance Header: Period text + Zoom button */}
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                    <span className="text-xs font-bold opacity-70 truncate">
                                                        {isEn ? stance.periodEn : stance.periodAr}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => setZoomedCard({
                                                            title: isEn ? stance.titleEn : stance.titleAr,
                                                            subtitle: `${isEn ? stance.periodEn : stance.periodAr} • ${isEn ? stance.categoryEn : stance.categoryAr}`,
                                                            badge: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            icon: 'fa-solid fa-fire-flame-curved',
                                                            content: `${isEn ? stance.storyEn : stance.storyAr}${stance.quoteAr ? `\n\n«${isEn ? (stance.quoteEn || stance.quoteAr) : stance.quoteAr}»` : ''}\n\n🌟 ${ui.impactLabel}\n${isEn ? stance.impactEn : stance.impactAr}`
                                                        })}
                                                        className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                        title={ui.zoom}
                                                    >
                                                        <ZoomIn size={14} />
                                                    </button>
                                                </div>

                                                {/* Stance Title */}
                                                <AutoFitSingleLine
                                                    as="h4"
                                                    text={isEn ? stance.titleEn : stance.titleAr}
                                                    baseFontSize={15}
                                                    smFontSize={16}
                                                    minFontSize={9}
                                                    textScale={cardTextScale}
                                                    className={`font-bold ${isEn ? 'font-sans' : 'font-kufi'}`}
                                                    style={{ color: themeHeadingColor }}
                                                />

                                                {/* Stance Story */}
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {isEn ? stance.storyEn : stance.storyAr}
                                                </p>

                                                {/* Quote box if present */}
                                                {(stance.quoteAr || stance.quoteEn) && (
                                                    <div 
                                                        className={`p-3 rounded-[14px] text-center ${innerSubBoxClass}`}
                                                    >
                                                        <p className={`text-xs sm:text-sm font-bold italic ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ color: themeHeadingColor }}>
                                                            «{isEn ? (stance.quoteEn || stance.quoteAr) : stance.quoteAr}»
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Stance Impact & Enduring Lesson */}
                                                <div 
                                                    className={`p-3 rounded-[14px] space-y-1 ${innerSubBoxClass}`}
                                                >
                                                    <span className="text-[10px] sm:text-[11px] font-bold block" style={{ color: themeHeadingColor }}>
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={ui.physicalAppearanceLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={ui.worshipLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={ui.familyLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                        >
                                            <h4 className={`font-bold mb-1 flex items-center min-w-0 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={ui.specialSkillsLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="w-full" />
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {(isEn ? traits.specialSkillsEn : traits.specialSkillsAr).map((skill, idx) => (
                                                    <div key={idx} className={`p-3 rounded-[14px] flex items-center gap-2 text-xs sm:text-sm font-semibold ${innerSubBoxClass}`}>
                                                        <span>{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Daily Routine & Devotion in His Day */}
                                        {extraSections && (
                                            <div 
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                            >
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'A Day in His Life & Prayer Sanctuary' : 'يوم في حياة الصحابي ومحراب عبادته'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                        className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                            <div 
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                            >
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Unique Distinctions & Special Merits' : 'فرائد ومناقب انفرد بها في تاريخ الإسلام'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                        className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                        title={ui.zoom}
                                                    >
                                                        <ZoomIn size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-2.5">
                                                    {(isEn ? extraSections.uniqueDistinctionsEn : extraSections.uniqueDistinctionsAr).map((dist, idx) => (
                                                        <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                            <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 border-0" style={itemBadge3DStyle}>
                                                                {idx + 1}
                                                            </span>
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-[18px] text-center space-y-1 overflow-visible"
                                        >
                                            <span className="text-[11px] font-bold block" style={{ color: themeHeadingColor }}>
                                                {ui.quoteTitle}
                                            </span>
                                            <p className={`text-sm sm:text-base font-bold italic leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ color: themeHeadingColor }}>
                                                «{isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}»
                                            </p>
                                        </div>

                                        {quotes.map((q, idx) => (
                                            <div 
                                                key={idx}
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                            >
                                                <div className="flex items-center justify-between pb-2.5 app-3d-divider">
                                                    <span 
                                                        className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-0"
                                                        style={itemBadge3DStyle}
                                                    >
                                                        {idx + 1}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`${isEn ? q.quoteEn : q.quoteAr}\n- ${isEn ? q.contextEn : q.contextAr}`);
                                                                showToast(ui.toastCopiedText);
                                                            }}
                                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                            title={ui.zoom}
                                                        >
                                                            <ZoomIn size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className={`text-xs sm:text-sm font-bold leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {isEn ? q.quoteEn : q.quoteAr}
                                                </p>

                                                <div className={`p-3 rounded-[14px] text-[11px] sm:text-xs leading-relaxed ${innerSubBoxClass}`}>
                                                    <span className="font-bold opacity-90 block mb-0.5">{ui.wisdomContextLabel}</span>
                                                    <span className="opacity-85">{isEn ? q.contextEn : q.contextAr}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Soul Purification & Heart Reform Methodology */}
                                        {extraSections && (
                                            <div 
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                            >
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Spiritual Discipline & Heart Reform' : 'منهج الصحابي في تزكية النفس وإصلاح القلوب'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    <div className="flex items-center gap-2 overflow-visible">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(isEn ? extraSections.eternalAdviceEn : extraSections.eternalAdviceAr);
                                                                showToast(ui.toastCopiedText);
                                                            }}
                                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={isEn ? 'Status & Lineage in Quraysh' : 'مكانته ونشأته في قريش'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Status in Quraysh' : 'مكانته في قريش',
                                                    badge: isEn ? 'Before Islam' : 'قبل الإسلام',
                                                    content: isEn ? selectedCompanion.preIslamicLife.statusInQurayshEn : selectedCompanion.preIslamicLife.statusInQurayshAr
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={isEn ? 'Pure Nature & Morals' : 'أخلاقه وطهارة فطرته'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Morals & Nature' : 'أخلاقه وفطرته',
                                                    badge: isEn ? 'Before Islam' : 'قبل الإسلام',
                                                    content: isEn ? selectedCompanion.preIslamicLife.moralsAndNatureEn : selectedCompanion.preIslamicLife.moralsAndNatureAr
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Rejection of Pre-Islamic Idolatry' : 'موقفه الحاسم من وثنية الجاهلية وأصنامها'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={isEn ? 'Trade, Wisdom & Acumen' : 'تجارته وحكمته وخبرته'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Trade & Knowledge' : 'تجارته وخبرته',
                                                    badge: isEn ? 'Before Islam' : 'قبل الإسلام',
                                                    content: isEn ? selectedCompanion.preIslamicLife.tradeAndKnowledgeEn : selectedCompanion.preIslamicLife.tradeAndKnowledgeAr
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Wisdom & Standing Among Arab Nobles' : 'مكانته وفراسته وحكمته بين عقلاء العرب'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={isEn ? 'Story of Embracing Islam' : 'قصة دخوله في الإسلام'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Embracing Islam' : 'قصة إسلامه',
                                                    badge: isEn ? 'Faith & Conversion' : 'قصة الإسلام',
                                                    content: isEn ? selectedCompanion.embracingIslam.storyEn : selectedCompanion.embracingIslam.storyAr
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={isEn ? 'Early Precedence & Sacrifices' : 'فضله وسَبقه وما لاقاه من أذى'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Precedence & Sacrifices' : 'سبقه وتضحياته',
                                                    content: `${isEn ? selectedCompanion.embracingIslam.earlyPrecedenceEn : selectedCompanion.embracingIslam.earlyPrecedenceAr}\n\n${isEn ? selectedCompanion.embracingIslam.advocacyAndSacrificesEn : selectedCompanion.embracingIslam.advocacyAndSacrificesAr}`
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={ui.majorBattlesLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: ui.majorBattlesLabel,
                                                    content: isEn ? selectedCompanion.migrationAndJihad.majorBattlesEn : selectedCompanion.migrationAndJihad.majorBattlesAr
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2.5">
                                            {(isEn ? selectedCompanion.migrationAndJihad.majorBattlesEn : selectedCompanion.migrationAndJihad.majorBattlesAr).map((battle, idx) => (
                                                <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                    <span 
                                                        className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border-0"
                                                        style={itemBadge3DStyle}
                                                    >
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Hijrah & Brotherhood in Madinah' : 'الهجرة النبوية والمؤاخاة المباركة بالمدينة'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Sacrifice & Defense of the Prophet ﷺ' : 'الفداء والذود المستميت عن رسول الله ﷺ'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={ui.hadithsAndQuotesLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: ui.hadithsAndQuotesLabel,
                                                    content: (isEn ? selectedCompanion.virtuesAndMerits.hadithsAndQuotesEn : selectedCompanion.virtuesAndMerits.hadithsAndQuotesAr).map(h => `${h.hadith}\n[${h.source}]`),
                                                    isVerseOrProof: true
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2.5">
                                            {(isEn ? selectedCompanion.virtuesAndMerits.hadithsAndQuotesEn : selectedCompanion.virtuesAndMerits.hadithsAndQuotesAr).map((item, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={`p-3.5 rounded-[14px] space-y-1.5 ${innerSubBoxClass}`}
                                                >
                                                    <p 
                                                        className={`text-xs sm:text-sm font-bold leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`}
                                                        style={{ color: tokens.isDark ? '#F1F5F9' : '#0F172A' }}
                                                    >
                                                        {item.hadith}
                                                    </p>
                                                    <AutoFitSingleLine
                                                        as="span"
                                                        text={item.source}
                                                        baseFontSize={11}
                                                        minFontSize={7.5}
                                                        textScale={cardTextScale}
                                                        className="opacity-70 font-sans w-full"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Titles & Honors */}
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={ui.titlesAndHonorsLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                        </div>
                                        <ul className="space-y-2.5 pt-1">
                                            {(isEn ? selectedCompanion.virtuesAndMerits.titlesAndHonorsEn : selectedCompanion.virtuesAndMerits.titlesAndHonorsAr).map((titleItem, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold opacity-95">
                                                    <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 border-0" style={itemBadge3DStyle}>
                                                        {idx + 1}
                                                    </span>
                                                    <span className="pt-0.5">{titleItem}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Testimonies of Companions */}
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={ui.testimoniesLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                        </div>
                                        <div className="space-y-2.5 pt-1">
                                            {(isEn ? selectedCompanion.virtuesAndMerits.testimoniesEn : selectedCompanion.virtuesAndMerits.testimoniesAr).map((testimony, idx) => (
                                                <div key={idx} className={`p-3 rounded-[14px] text-xs sm:text-sm font-medium leading-relaxed italic ${innerSubBoxClass}`}>
                                                    {testimony}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quranic Verses Associated with Him Card */}
                                    {extraSections && extraSections.quranicVerses && extraSections.quranicVerses.length > 0 && (
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Noble Quranic Verses in His Honor & Context' : 'آيات قرآنية كريمة نزلت فيه أو ارتبطت بسيرته'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {extraSections.quranicVerses.map((verseItem, vIdx) => (
                                                    <div 
                                                        key={vIdx} 
                                                        className={`p-3.5 rounded-[14px] space-y-2 ${innerSubBoxClass}`}
                                                    >
                                                        <span className="text-[11px] font-bold block opacity-75" style={{ color: themeHeadingColor }}>
                                                            {isEn ? verseItem.surahEn : verseItem.surahAr}
                                                        </span>
                                                        <p 
                                                            className={`text-xs sm:text-sm font-bold text-center leading-loose ${isEn ? 'font-sans' : 'font-amiri'}`}
                                                            style={{ color: themeHeadingColor }}
                                                        >
                                                            «{isEn ? verseItem.verseEn : verseItem.verseAr}»
                                                        </p>
                                                        <p className={`text-[11px] sm:text-xs leading-relaxed opacity-85 font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            <span className="font-bold block mb-0.5" style={{ color: themeHeadingColor }}>
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Testimonies of Companions & Mothers of Believers' : 'شهادات كبار الصحابة وأمهات المؤمنين في حقه'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {extraSections.extraTestimonies.map((testItem, tIdx) => (
                                                    <div key={tIdx} className={`p-3 rounded-[14px] space-y-1.5 ${innerSubBoxClass}`}>
                                                        <div className="text-xs font-bold" style={{ color: themeHeadingColor }}>
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={isEn ? 'Stance at the Prophet\'s Demise' : 'موقفه عند وفاة النبي ﷺ ودوره'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Stance at Prophet\'s Passing' : 'موقفه بعد وفاة النبي',
                                                    content: `${isEn ? selectedCompanion.postProphetEraAndLegacy.stanceAtProphetsDeathEn : selectedCompanion.postProphetEraAndLegacy.stanceAtProphetsDeathAr}\n\n${isEn ? selectedCompanion.postProphetEraAndLegacy.roleOrCaliphateEn : selectedCompanion.postProphetEraAndLegacy.roleOrCaliphateAr}`
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={ui.majorAchievementsLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                        </div>
                                        <div className="space-y-2.5 pt-1">
                                            {(isEn ? selectedCompanion.postProphetEraAndLegacy.majorAchievementsEn : selectedCompanion.postProphetEraAndLegacy.majorAchievementsAr).map((achieve, idx) => (
                                                <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                    <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 border-0" style={itemBadge3DStyle}>
                                                        {idx + 1}
                                                    </span>
                                                    <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {achieve}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Passing & Final Testament */}
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={isEn ? 'Passing & Final Will' : 'وفاته واستشهاده ووصيته'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Passing & Will' : 'وفاته ووصيته الأخيرة',
                                                    content: `${isEn ? selectedCompanion.passingAndTributes.deathDetailsEn : selectedCompanion.passingAndTributes.deathDetailsAr}\n\n• ${ui.lastWordsLabel}\n"${isEn ? selectedCompanion.passingAndTributes.lastWordsEn : selectedCompanion.passingAndTributes.lastWordsAr}"\n\n• ${ui.burialLabel}\n${isEn ? selectedCompanion.passingAndTributes.restingPlaceEn : selectedCompanion.passingAndTributes.restingPlaceAr}`
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.passingAndTributes.deathDetailsEn : selectedCompanion.passingAndTributes.deathDetailsAr}
                                        </p>
                                        <div 
                                            className={`p-3 rounded-[14px] ${innerSubBoxClass}`}
                                        >
                                            <span className="text-[11px] font-bold block mb-1" style={{ color: themeHeadingColor }}>
                                                {ui.lastWordsLabel}
                                            </span>
                                            <p className={`text-xs sm:text-sm font-bold italic ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {isEn ? selectedCompanion.passingAndTributes.lastWordsEn : selectedCompanion.passingAndTributes.lastWordsAr}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Civilizational & Institutional Impact Card */}
                                    {extraSections && extraSections.civilizationalImpactAr && extraSections.civilizationalImpactAr.length > 0 && (
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Civilizational & Institutional Legacy' : 'الأثر الحضاري والتأسيسي الممتد للأمة'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(isEn ? extraSections.civilizationalImpactEn : extraSections.civilizationalImpactAr).map((impact, idx) => (
                                                    <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                        <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 border-0" style={itemBadge3DStyle}>
                                                            {idx + 1}
                                                        </span>
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Spiritual & Faith Lessons' : 'الدروس الإيمانية والروحية العميقة'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(isEn ? extraSections.spiritualLessonsEn : extraSections.spiritualLessonsAr).map((lesson, idx) => (
                                                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                        <span 
                                                            className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border-0"
                                                            style={itemBadge3DStyle}
                                                        >
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Leadership, Management & Character' : 'الدروس القيادية والإدارية وبناء الشخصية'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(isEn ? extraSections.leadershipLessonsEn : extraSections.leadershipLessonsAr).map((lesson, idx) => (
                                                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                        <span 
                                                            className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border-0"
                                                            style={itemBadge3DStyle}
                                                        >
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
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={ui.tabLessons} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: ui.tabLessons,
                                                    content: isEn ? selectedCompanion.inspirationalLessonsEn : selectedCompanion.inspirationalLessonsAr
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2.5">
                                            {(isEn ? selectedCompanion.inspirationalLessonsEn : selectedCompanion.inspirationalLessonsAr).map((lesson, idx) => (
                                                <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-[14px] ${innerSubBoxClass}`}>
                                                    <span 
                                                        className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border-0"
                                                        style={itemBadge3DStyle}
                                                    >
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
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={isEn ? 'Modern Action Plan: Emulating Him Today' : 'خطة عمل وتطبيق معاصر: كيف نقتدي به اليوم في حياتنا؟'} baseFontSize={14} minFontSize={8.5} textScale={cardTextScale} className="min-w-0 flex-1" />
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
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(isEn ? extraSections.modernApplicationEn : extraSections.modernApplicationAr).map((app, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`flex items-start gap-2.5 p-3 rounded-[14px] ${innerSubBoxClass}`}
                                                    >
                                                        <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 border-0" style={itemBadge3DStyle}>
                                                            {idx + 1}
                                                        </span>
                                                        <p 
                                                            className={`text-xs sm:text-sm leading-relaxed font-semibold ${isEn ? 'font-sans' : 'font-amiri'}`}
                                                            style={{ color: tokens.isDark ? '#F1F5F9' : '#0F172A' }}
                                                        >
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
                        <div className="pt-4 pb-2 grid grid-cols-2 gap-3">
                            {prevCompanion ? (
                                <button
                                    onClick={() => handleSelectCompanion(prevCompanion)}
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-[16px] flex items-center justify-center text-center transition-all cursor-pointer"
                                    style={{ 
                                        color: themeHeadingColor
                                    }}
                                >
                                    <span className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'}`}>{isEn ? 'Previous Companion' : 'الصحابي السابق'}</span>
                                </button>
                            ) : <div />}

                            {nextCompanion ? (
                                <button
                                    onClick={() => handleSelectCompanion(nextCompanion)}
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-[16px] flex items-center justify-center text-center transition-all cursor-pointer"
                                    style={{ 
                                        color: themeHeadingColor
                                    }}
                                >
                                    <span className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'}`}>{isEn ? 'Next Companion' : 'الصحابي التالي'}</span>
                                </button>
                            ) : <div />}
                        </div>
                    </div>
                </div>
            )}
        </main>

            {/* Zoom Modal - Matches identical style & behavior of Adia & Adkar */}
            <AnimatePresence>
                {zoomedCard && (
                    <div 
                        className="fixed inset-0 bg-black/60 z-[120] flex flex-col justify-end backdrop-blur-xs select-none"
                        onClick={() => setZoomedCard(null)}
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <motion.div 
                            initial={{ y: '100%', opacity: 0.6 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className="app-page-card border-0 w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[88dvh] overflow-hidden relative bg-white dark:bg-[#1E293B]"
                            style={{ 
                                fontFamily: isEn ? 'sans-serif' : theme.font,
                                color: 'var(--text-color)',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Top Drag Handle without X button */}
                            <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 mb-2" />
                                <div className="w-full flex items-center justify-center">
                                    <span 
                                        className="px-3.5 py-1 rounded-full text-xs font-bold"
                                        style={{
                                            backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                            color: tokens.primaryColor
                                        }}
                                    >
                                        {zoomedCard.subtitle || (isEn ? "Ten Promised Paradise" : "العشرة المبشرون بالجنة")}
                                    </span>
                                </div>
                            </div>

                            {/* Content Container */}
                            <div ref={zoomScrollRef} className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-4 space-y-4">
                                {zoomedCard.title && (
                                    <h3 
                                        className={`text-base sm:text-lg font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-center leading-snug`}
                                        style={{ color: tokens.primaryColor }}
                                    >
                                        {zoomedCard.title}
                                    </h3>
                                )}

                                {Array.isArray(zoomedCard.content) ? (
                                    <div className="space-y-3">
                                        {zoomedCard.content.map((item, idx) => (
                                            <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-[14px] ${innerSubBoxClass}`}>
                                                <span 
                                                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 border-0"
                                                    style={itemBadge3DStyle}
                                                >
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
                                        className={`leading-loose font-medium select-text whitespace-pre-line text-center py-2 ${
                                            isEn ? 'font-sans' : (zoomedCard.isVerseOrProof ? 'font-quran' : 'font-amiri')
                                        }`}
                                        style={{ fontSize: `${zoomFontSize}px` }}
                                    >
                                        {zoomedCard.content}
                                    </p>
                                )}
                            </div>

                            {/* Action Bar (Share, Copy, Zoom, ChevronDown to hide) without Audio button & with safe-area bottom elevation */}
                            <div 
                                className="px-4 pt-3 pb-2 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 dark:border-white/5 overflow-visible" 
                            >
                                {/* Share Button */}
                                <button 
                                    type="button"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (!zoomedCard) return;
                                        const textToShare = Array.isArray(zoomedCard.content)
                                            ? zoomedCard.content.map((item, i) => `${i + 1}. ${item}`).join('\n\n')
                                            : zoomedCard.content;
                                        await shareAsImage({
                                            title: zoomedCard.title,
                                            text: textToShare,
                                            category: zoomedCard.subtitle || (isEn ? 'Ten Promised' : 'العشرة المبشرون'),
                                            source: zoomedCard.badge || '',
                                            theme,
                                            isEn,
                                            language: isEn ? 'en' : 'ar',
                                            setToastMessage
                                        });
                                    }} 
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                    style={{
                                        color: tokens.textColor
                                    }}
                                    title={isEn ? "Share Image" : "مشاركة كصورة"}
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>

                                {/* Copy Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!zoomedCard) return;
                                        const textToCopy = Array.isArray(zoomedCard.content) 
                                            ? zoomedCard.content.map((item, i) => `${i + 1}. ${item}`).join('\n')
                                            : zoomedCard.content;
                                        navigator.clipboard.writeText(textToCopy).then(() => {
                                            setCopiedModal(true);
                                            setTimeout(() => setCopiedModal(false), 2000);
                                            showToast(ui.toastCopiedText);
                                        });
                                    }}
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                    style={{
                                        backgroundColor: copiedModal ? '#10B981' : undefined,
                                        color: copiedModal ? '#FFFFFF' : tokens.textColor
                                    }}
                                    title={isEn ? 'Copy text' : 'نسخ النص'}
                                >
                                    {copiedModal ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
                                </button>

                                {/* Zoom Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setZoomFontSize(prev => (prev >= 36 ? 20 : prev + 4));
                                    }}
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                    style={{
                                        color: tokens.textColor
                                    }}
                                    title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>

                                {/* Chevron Down / Hide Modal Button */}
                                <button 
                                    type="button"
                                    onClick={() => setZoomedCard(null)} 
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                    style={{
                                        color: tokens.textColor
                                    }}
                                    title={isEn ? 'Hide list' : 'إخفاء القائمة'}
                                >
                                    <ChevronDown className="w-5 h-5" />
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
