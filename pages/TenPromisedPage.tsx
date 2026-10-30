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
    MessageSquareQuote, UserCheck, Compass, ChevronDown 
} from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { TEN_PROMISED_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';

const normalizeArabicSearch = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/ء/g, '')
        .replace(/ـ+/g, '')
        .replace(/[«»""''.,;:!?()\[\]{}\\/—–-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

const matchesArabicSearch = (content: string, rawQuery: string): boolean => {
    const cleanQuery = normalizeArabicSearch(rawQuery);
    if (!cleanQuery) return true;
    const tokens = cleanQuery.split(' ').filter(Boolean);
    if (tokens.length === 0) return true;
    const cleanContent = normalizeArabicSearch(content);
    return tokens.every(token => cleanContent.includes(token));
};

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

const TenPromisedPage: React.FC<TenPromisedPageProps> = ({ onBack, onNavigate, navParams, onOpenThemes }) => {
    const { theme, themeKey } = useTheme();
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const ui = TEN_PROMISED_UI_TEXTS[isEn ? 'en' : 'ar'];

    // Modern Flat Design System
    const tokens = useMemo(() => getModernFlatTokens(theme, themeKey), [theme, themeKey]);
    const { 
        primaryColor, 
        secondaryColor, 
        themeActiveTextColor, 
        pageBgColor, 
        cardBgColor, 
        cardShadow, 
        capsuleBg, 
        filledInputBg, 
        chipInactiveBg, 
        actionBtnBg 
    } = tokens;

    // Scroll container refs
    const mainScrollRef = useRef<HTMLElement | null>(null);
    const zoomScrollRef = useRef<HTMLDivElement | null>(null);

    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState('');
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

    // Filtered Companions based on category filter and comprehensive Arabic search query
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

        // 2. Comprehensive Search query filter
        const query = searchQuery.trim();
        if (query) {
            list = list.filter(c => {
                const stances = getCompanionHeroicStances(c.id);
                const sayings = getCompanionWisdomQuotes(c.id);
                const extras = getCompanionExtraSections(c.id);

                const searchableFields = [
                    c.nameAr,
                    c.fullNameAr,
                    c.nameEn,
                    c.fullNameEn,
                    c.titleBadgeAr,
                    c.titleBadgeEn,
                    c.kunyaAr,
                    c.kunyaEn,
                    c.burialPlaceAr,
                    c.burialPlaceEn,
                    c.kinshipAr,
                    c.kinshipEn,
                    c.gladTidingsHadithAr,
                    c.gladTidingsHadithEn,
                    c.keyQuoteAr,
                    c.keyQuoteEn,
                    c.preIslamicLife.titleAr,
                    c.preIslamicLife.statusInQurayshAr,
                    c.preIslamicLife.moralsAndNatureAr,
                    c.preIslamicLife.tradeAndKnowledgeAr,
                    c.embracingIslam.titleAr,
                    c.embracingIslam.storyAr,
                    c.embracingIslam.earlyPrecedenceAr,
                    c.embracingIslam.advocacyAndSacrificesAr,
                    c.migrationAndJihad.titleAr,
                    c.migrationAndJihad.migrationStoryAr,
                    c.migrationAndJihad.unmatchedSacrificesAr,
                    ...(c.migrationAndJihad.majorBattlesAr || []),
                    c.virtuesAndMerits.titleAr,
                    ...(c.virtuesAndMerits.titlesAndHonorsAr || []),
                    ...(c.virtuesAndMerits.testimoniesAr || []),
                    ...(c.virtuesAndMerits.hadithsAndQuotesAr?.map(h => `${h.hadith} ${h.source}`) || []),
                    c.postProphetEraAndLegacy.titleAr,
                    c.postProphetEraAndLegacy.roleOrCaliphateAr,
                    ...(c.postProphetEraAndLegacy.majorAchievementsAr || []),
                    c.passingAndTributes.titleAr,
                    c.passingAndTributes.deathDetailsAr,
                    c.passingAndTributes.lastWordsAr,
                    c.passingAndTributes.restingPlaceAr,
                    ...(c.inspirationalLessonsAr || []),
                    ...stances.flatMap(s => [s.titleAr, s.titleEn, s.storyAr, s.storyEn, s.categoryAr, s.categoryEn, s.periodAr, s.impactAr, s.quoteAr || '']),
                    ...sayings.flatMap(w => [w.quoteAr, w.quoteEn, w.contextAr, w.contextEn]),
                    extras?.lineageDetailsAr || '',
                    extras?.dailyRoutineAr || '',
                    extras?.idolatryStanceAr || '',
                    extras?.wisdomAndPreIslamRoleAr || '',
                    extras?.hijrahAndBrotherhoodAr || '',
                    extras?.prophetSacrificeAr || '',
                    extras?.eternalAdviceAr || '',
                    ...(extras?.uniqueDistinctionsAr || []),
                    ...(extras?.civilizationalImpactAr || []),
                    ...(extras?.spiritualLessonsAr || []),
                    ...(extras?.leadershipLessonsAr || []),
                    ...(extras?.modernApplicationAr || []),
                    ...(extras?.geographicalStations?.map(g => `${g.placeAr} ${g.detailsAr}`) || []),
                    ...(extras?.quranicVerses?.map(v => `${v.verseAr} ${v.surahAr} ${v.contextAr}`) || []),
                    ...(extras?.extraTestimonies?.map(t => `${t.speakerAr} ${t.quoteAr}`) || [])
                ].join(' ');

                return matchesArabicSearch(searchableFields, query);
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
            className={`flex flex-col h-screen overflow-hidden select-none ${isEn ? 'text-left font-sans' : 'text-right'}`}
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
                    className="shrink-0 z-20 px-3 sm:px-4 pt-1.5 pb-2 transition-colors border-0"
                    style={{ 
                        backgroundColor: pageBgColor
                    }}
                >
                    <div className="max-w-3xl mx-auto">
                        <div 
                            className="companion-tabs-nav flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl border-0 shadow-xs hide-scrollbar"
                            style={{ 
                                backgroundColor: capsuleBg
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
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-0 shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                                        detailTab === tab.id ? 'shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/5'
                                    } ${isEn ? 'font-sans' : 'font-kufi'}`}
                                    style={{
                                        backgroundColor: detailTab === tab.id ? primaryColor : 'transparent',
                                        color: detailTab === tab.id ? themeActiveTextColor : (tokens.isDark ? '#94A3B8' : '#64748B')
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
                    .promised-scalable-content h2 {
                        font-size: calc(1.35rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content h3 {
                        font-size: calc(1.15rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content h4,
                    .promised-scalable-content h5 {
                        font-size: calc(1.05rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-xs,
                    .promised-scalable-content .text-\\[11px\\],
                    .promised-scalable-content .text-\\[10px\\] {
                        font-size: calc(0.775rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-sm {
                        font-size: calc(0.875rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-base {
                        font-size: calc(1rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-lg {
                        font-size: calc(1.125rem * ${cardTextScale}) !important;
                    }
                    .promised-scalable-content .text-xl {
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
                    .companion-tabs-nav i {
                        font-size: 10px !important;
                    }
                `}</style>
            )}

            {/* Main Content Area */}
            <main 
                ref={mainScrollRef} 
                className="flex-1 overflow-y-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-7 sm:pb-8 pb-[calc(env(safe-area-inset-bottom,0px)+1.75rem)] hide-scrollbar relative promised-scalable-content"
            >
                {/* 1. LIST VIEW OF THE 10 COMPANIONS */}
                {!selectedCompanion ? (
                    <div className="max-w-3xl mx-auto space-y-4">
                        {/* Authentic Hadith Banner */}
                        <div 
                            className="p-4 sm:p-5 rounded-[18px] border-0 relative overflow-hidden text-center transition-all"
                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Award className="w-5 h-5 text-amber-400" />
                                <h2 className={`text-sm sm:text-base font-bold ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                <div className={`absolute inset-y-0 ${isEn ? 'left-3.5' : 'right-3.5'} flex items-center pointer-events-none opacity-60`}>
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={ui.searchPlaceholder}
                                    className={`w-full py-2.5 sm:py-3 ${isEn ? 'pl-10 pr-10' : 'pr-10 pl-10'} rounded-[14px] border-0 text-xs sm:text-sm font-medium focus:outline-hidden transition-all`}
                                    style={{ 
                                        backgroundColor: filledInputBg,
                                        color: tokens.isDark ? '#F1F5F9' : '#1E293B'
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className={`absolute inset-y-0 ${isEn ? 'right-3.5' : 'left-3.5'} flex items-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer`}
                                        title={ui.clearSearch}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Quick Filter Chips */}
                            <div className="filter-chips-nav no-scale flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                {[
                                    { id: 'all', label: ui.filterAll, icon: 'fa-users' },
                                    { id: 'caliphs', label: ui.filterCaliphs, icon: 'fa-crown' },
                                    { id: 'early', label: ui.filterEarly, icon: 'fa-star' },
                                    { id: 'commanders', label: ui.filterCommanders, icon: 'fa-shield-halved' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setActiveFilter(f.id as any)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-0 shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                            activeFilter === f.id ? 'shadow-xs' : 'hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: activeFilter === f.id ? primaryColor : chipInactiveBg,
                                            color: activeFilter === f.id ? themeActiveTextColor : (tokens.isDark ? '#94A3B8' : '#475569')
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
                            <div 
                                className="p-8 text-center rounded-[18px] border-0 space-y-3"
                                style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                            >
                                <Compass className="w-10 h-10 mx-auto opacity-50 text-amber-500" />
                                <p className="text-sm font-bold opacity-80">{ui.noResults}</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                                    className="px-4 py-2 rounded-xl text-xs font-bold border-0 cursor-pointer transition-colors"
                                    style={{ backgroundColor: primaryColor, color: themeActiveTextColor }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden space-y-3"
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
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
                                                    <span 
                                                        className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border-0"
                                                        style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                                                    >
                                                        {isEn ? `Honored #${companion.order}` : `المبشر بالجنة #${companion.order}`}
                                                    </span>
                                                </div>

                                                {/* Name */}
                                                <h3 
                                                    className={`text-base sm:text-lg font-bold ${isEn ? 'font-sans' : 'font-kufi'} transition-colors`}
                                                    style={{ color: primaryColor }}
                                                >
                                                    {name}
                                                </h3>

                                                {/* Title Badge / Subtitle */}
                                                <p className="text-xs sm:text-sm font-medium opacity-85 leading-relaxed line-clamp-2">
                                                    {title}
                                                </p>
                                            </div>

                                            {/* Action Link Footer */}
                                            <div className="pt-2 flex items-center justify-between text-xs font-bold" style={{ color: primaryColor }}>
                                                <span className="flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    <span>{isEn ? 'View Profile & Stances' : 'عرض السيرة والمواقف'}</span>
                                                    <i className={`fa-solid ${isEn ? 'fa-arrow-right' : 'fa-arrow-left'} text-[10px]`}></i>
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                        {/* Bottom Spacer for Mobile Phone Navigation Bar */}
                        <div className="w-full h-10 sm:h-14 shrink-0 pointer-events-none" />
                    </div>
                ) : (
                    /* 2. COMPANION DETAILED PROFILE VIEW */
                    <div className="max-w-3xl mx-auto companion-profile-scalable relative">
                        {/* Content Cards Container (Text zoom scaling applies strictly within this wrapper) */}
                        <div className="companion-cards-content space-y-4">
                            {/* Hero Card (shown ONLY in the first tab: 'profile' as requested) */}
                            {detailTab === 'profile' && (
                                <div 
                                    className="p-5 sm:p-7 rounded-[18px] border-0 relative overflow-hidden space-y-4"
                                    style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
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
                                            <span 
                                                className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border-0"
                                                style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>{isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr}</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleCopyFullBio(selectedCompanion)}
                                                className="w-8 h-8 rounded-full border-0 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                title={ui.copyBiography}
                                                aria-label={ui.copyBiography}
                                            >
                                                <Copy size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleShareCompanionImage(selectedCompanion)}
                                                className="w-8 h-8 rounded-full border-0 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                title={ui.shareImage}
                                                aria-label={ui.shareImage}
                                            >
                                                <Share2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Name & Lineage */}
                                    <div className="space-y-1">
                                        <h2 
                                            className={`text-2xl sm:text-3xl font-black ${isEn ? 'font-sans' : 'font-kufi'}`}
                                            style={{ color: primaryColor }}
                                        >
                                            {isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr}
                                        </h2>
                                        <p className="text-xs sm:text-sm font-semibold opacity-85 leading-relaxed">
                                            {isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}
                                        </p>
                                    </div>

                                    {/* Key Quote Box */}
                                    <div className="p-3.5 sm:p-4 rounded-[16px] bg-amber-500/10 border-0 relative">
                                        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                                            <Award size={14} />
                                            <span>{ui.quoteTitle}</span>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-bold italic ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}
                                        </p>
                                    </div>

                                    {/* Glad Tidings Hadith Card with Card Zoom */}
                                    <div className="p-4 rounded-[16px] bg-emerald-500/10 border-0 relative">
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 transition-all" 
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                                            <div className="p-2.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.fullNameLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}</span>
                                            </div>
                                            <div className="p-2.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.kunyaLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.kunyaEn : selectedCompanion.kunyaAr}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                <div className="p-2.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                    <span className="font-bold opacity-70 block mb-0.5">{ui.birthLabel}</span>
                                                    <span className="font-semibold">{isEn ? selectedCompanion.birthYearEn : selectedCompanion.birthYearAr}</span>
                                                </div>
                                                <div className="p-2.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                    <span className="font-bold opacity-70 block mb-0.5">{ui.deathLabel}</span>
                                                    <span className="font-semibold">{isEn ? selectedCompanion.deathYearEn : selectedCompanion.deathYearAr}</span>
                                                </div>
                                            </div>
                                            <div className="p-2.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.burialLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.burialPlaceEn : selectedCompanion.burialPlaceAr}</span>
                                            </div>
                                            <div className="p-2.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                <span className="font-bold opacity-70 block mb-0.5">{ui.kinshipLabel}</span>
                                                <span className="font-semibold">{isEn ? selectedCompanion.kinshipEn : selectedCompanion.kinshipAr}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lineage & Kinship Card */}
                                    {extraSections && (
                                        <div 
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                    <i className="fa-solid fa-sitemap" style={{ color: primaryColor }}></i>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                    <i className="fa-solid fa-map-location-dot" style={{ color: primaryColor }}></i>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {extraSections.geographicalStations.map((station, sIdx) => (
                                                    <div key={sIdx} className="p-3 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0 space-y-1">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: primaryColor }}>
                                                                <i className="fa-solid fa-location-dot text-amber-500 text-xs"></i>
                                                                <span>{isEn ? station.placeEn : station.placeAr}</span>
                                                            </span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 font-medium opacity-80 border-0">
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
                                        <div className="p-3.5 rounded-[16px] bg-amber-500/10 border-0 flex items-center justify-between">
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
                                                className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative group transition-all"
                                                style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                            >
                                                {/* Stance Header: Category & Period + Zoom button */}
                                                <div className={`flex items-center justify-between flex-wrap gap-2 pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                    <div className="flex items-center flex-wrap gap-1.5">
                                                        <span 
                                                            className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border-0"
                                                            style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                                                        >
                                                            {isEn ? stance.categoryEn : stance.categoryAr}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-500/10 dark:bg-slate-800/50 text-[10px] sm:text-xs font-medium opacity-80 border-0">
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
                                                        className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                        style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                        title={ui.zoom}
                                                    >
                                                        <ZoomIn size={14} />
                                                    </button>
                                                </div>

                                                {/* Stance Title */}
                                                <h4 className={`text-sm sm:text-base font-bold ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                    {isEn ? stance.titleEn : stance.titleAr}
                                                </h4>

                                                {/* Stance Story */}
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {isEn ? stance.storyEn : stance.storyAr}
                                                </p>

                                                {/* Quote box if present */}
                                                {(stance.quoteAr || stance.quoteEn) && (
                                                    <div className="p-3 rounded-[14px] bg-amber-500/10 border-0 flex items-start gap-2">
                                                        <MessageSquareQuote size={15} className="text-amber-500 shrink-0 mt-0.5" />
                                                        <p className={`text-xs sm:text-sm font-bold italic text-amber-800 dark:text-amber-200 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            {isEn ? (stance.quoteEn || stance.quoteAr) : stance.quoteAr}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Stance Impact & Enduring Lesson */}
                                                <div 
                                                    className="p-3 rounded-[14px] border-0 space-y-1"
                                                    style={{ backgroundColor: `${primaryColor}10` }}
                                                >
                                                    <span className="text-[10px] sm:text-[11px] font-bold block" style={{ color: primaryColor }}>
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                    <i className="fa-solid fa-people-roof" style={{ color: primaryColor }}></i>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <h4 className={`text-sm font-bold flex items-center gap-2 mb-1 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                <Sparkles className="w-4 h-4 text-amber-500" />
                                                <span>{ui.specialSkillsLabel}</span>
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {(isEn ? traits.specialSkillsEn : traits.specialSkillsAr).map((skill, idx) => (
                                                    <div key={idx} className="p-3 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0 flex items-center gap-2 text-xs sm:text-sm font-semibold">
                                                        <i className="fa-solid fa-star text-amber-500 text-xs shrink-0"></i>
                                                        <span>{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Daily Routine & Devotion in His Day */}
                                        {extraSections && (
                                            <div 
                                                className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all" 
                                                style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                            >
                                                <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                    <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                        className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                        style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                                className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all" 
                                                style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                            >
                                                <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                    <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                        className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                        style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                        title={ui.zoom}
                                                    >
                                                        <ZoomIn size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {(isEn ? extraSections.uniqueDistinctionsEn : extraSections.uniqueDistinctionsAr).map((dist, idx) => (
                                                        <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
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
                                        <div className="p-4 rounded-[16px] bg-amber-500/10 border-0 text-center space-y-1">
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
                                                className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all"
                                                style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                            >
                                                <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                    <span 
                                                        className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border-0"
                                                        style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                                                    >
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
                                                            className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                            style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                                            className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                            style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                            title={ui.zoom}
                                                        >
                                                            <ZoomIn size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className={`text-xs sm:text-sm font-bold leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {isEn ? q.quoteEn : q.quoteAr}
                                                </p>

                                                <div className="p-2.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0 text-[11px] sm:text-xs opacity-80 leading-relaxed">
                                                    <span className="font-bold opacity-90 block mb-0.5">{ui.wisdomContextLabel}</span>
                                                    <span>{isEn ? q.contextEn : q.contextAr}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Soul Purification & Heart Reform Methodology */}
                                        {extraSections && (
                                            <div 
                                                className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all" 
                                                style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                            >
                                                <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                    <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                        <i className="fa-solid fa-seedling" style={{ color: primaryColor }}></i>
                                                        <span>{isEn ? 'Spiritual Discipline & Heart Reform' : 'منهج الصحابي في تزكية النفس وإصلاح القلوب'}</span>
                                                    </h4>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(isEn ? extraSections.eternalAdviceEn : extraSections.eternalAdviceAr);
                                                                showToast(ui.toastCopiedText);
                                                            }}
                                                            className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                            style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                                            className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                            style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all" 
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                <i className="fa-solid fa-users" style={{ color: primaryColor }}></i>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all" 
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all" 
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                    <i className="fa-solid fa-scale-balanced" style={{ color: primaryColor }}></i>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all" 
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                <i className="fa-solid fa-star-and-crescent" style={{ color: primaryColor }}></i>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all" 
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all" 
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(isEn ? selectedCompanion.migrationAndJihad.majorBattlesEn : selectedCompanion.migrationAndJihad.majorBattlesAr).map((battle, idx) => (
                                                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                    <span 
                                                        className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                                                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                                    <Compass className="w-4 h-4" style={{ color: primaryColor }} />
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all" 
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all"
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2.5">
                                            {(isEn ? selectedCompanion.virtuesAndMerits.hadithsAndQuotesEn : selectedCompanion.virtuesAndMerits.hadithsAndQuotesAr).map((item, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="p-3.5 rounded-[14px] border-0 space-y-1"
                                                    style={{ backgroundColor: `${primaryColor}14` }}
                                                >
                                                    <p 
                                                        className={`text-xs sm:text-sm font-bold leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`}
                                                        style={{ color: tokens.isDark ? '#F1F5F9' : '#0F172A' }}
                                                    >
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
                                    <div 
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all"
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
                                                <Sparkles className="w-4 h-4 text-amber-400" />
                                                <span>{ui.titlesAndHonorsLabel}</span>
                                            </h4>
                                        </div>
                                        <ul className="space-y-2 pt-1">
                                            {(isEn ? selectedCompanion.virtuesAndMerits.titlesAndHonorsEn : selectedCompanion.virtuesAndMerits.titlesAndHonorsAr).map((titleItem, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-semibold opacity-90">
                                                    <i className="fa-solid fa-crown text-amber-500 text-xs mt-1 shrink-0"></i>
                                                    <span>{titleItem}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Testimonies of Companions */}
                                    <div 
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all"
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
                                                <i className="fa-solid fa-quote-right opacity-80"></i>
                                                <span>{ui.testimoniesLabel}</span>
                                            </h4>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            {(isEn ? selectedCompanion.virtuesAndMerits.testimoniesEn : selectedCompanion.virtuesAndMerits.testimoniesAr).map((testimony, idx) => (
                                                <div key={idx} className="p-3 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0 text-xs sm:text-sm font-medium leading-relaxed italic">
                                                    {testimony}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quranic Verses Associated with Him Card */}
                                    {extraSections && extraSections.quranicVerses && extraSections.quranicVerses.length > 0 && (
                                        <div 
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all"
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {extraSections.quranicVerses.map((verseItem, vIdx) => (
                                                    <div 
                                                        key={vIdx} 
                                                        className="p-3.5 rounded-[14px] border-0 space-y-2"
                                                        style={{ backgroundColor: `${primaryColor}14` }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span 
                                                                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border-0"
                                                                style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
                                                            >
                                                                {isEn ? verseItem.surahEn : verseItem.surahAr}
                                                            </span>
                                                        </div>
                                                        <p 
                                                            className={`text-xs sm:text-sm font-bold text-center leading-loose ${isEn ? 'font-sans' : 'font-amiri'}`}
                                                            style={{ color: primaryColor }}
                                                        >
                                                            «{isEn ? verseItem.verseEn : verseItem.verseAr}»
                                                        </p>
                                                        <p className={`text-[11px] sm:text-xs leading-relaxed opacity-85 font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                            <span className="font-bold block mb-0.5" style={{ color: primaryColor }}>
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all"
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
                                                    <i className="fa-solid fa-comments opacity-80"></i>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {extraSections.extraTestimonies.map((testItem, tIdx) => (
                                                    <div key={tIdx} className="p-3 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0 space-y-1.5">
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
                                    <div 
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2 relative transition-all"
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all"
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
                                                <Award className="w-4 h-4 text-amber-500" />
                                                <span>{ui.majorAchievementsLabel}</span>
                                            </h4>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            {(isEn ? selectedCompanion.postProphetEraAndLegacy.majorAchievementsEn : selectedCompanion.postProphetEraAndLegacy.majorAchievementsAr).map((achieve, idx) => (
                                                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                    <i className="fa-solid fa-check-circle text-xs mt-1 shrink-0" style={{ color: primaryColor }}></i>
                                                    <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {achieve}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Passing & Final Testament */}
                                    <div 
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-2.5 relative transition-all"
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
                                                <i className="fa-solid fa-tombstone opacity-80"></i>
                                                <span>{isEn ? 'Passing & Final Will' : 'وفاته واستشهاده ووصيته'}</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? 'Passing & Will' : 'وفاته ووصيته الأخيرة',
                                                    content: `${isEn ? selectedCompanion.passingAndTributes.deathDetailsEn : selectedCompanion.passingAndTributes.deathDetailsAr}\n\n• ${ui.lastWordsLabel}\n"${isEn ? selectedCompanion.passingAndTributes.lastWordsEn : selectedCompanion.passingAndTributes.lastWordsAr}"\n\n• ${ui.burialLabel}\n${isEn ? selectedCompanion.passingAndTributes.restingPlaceEn : selectedCompanion.passingAndTributes.restingPlaceAr}`
                                                })}
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.passingAndTributes.deathDetailsEn : selectedCompanion.passingAndTributes.deathDetailsAr}
                                        </p>
                                        <div 
                                            className="p-3 rounded-[14px] border-0"
                                            style={{ backgroundColor: `${primaryColor}14` }}
                                        >
                                            <span className="text-[11px] font-bold block mb-1" style={{ color: primaryColor }}>
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all"
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(isEn ? extraSections.civilizationalImpactEn : extraSections.civilizationalImpactAr).map((impact, idx) => (
                                                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                        <i className="fa-solid fa-building-columns text-xs mt-1 shrink-0" style={{ color: primaryColor }}></i>
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all"
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(isEn ? extraSections.spiritualLessonsEn : extraSections.spiritualLessonsAr).map((lesson, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                        <span 
                                                            className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border-0"
                                                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all"
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(isEn ? extraSections.leadershipLessonsEn : extraSections.leadershipLessonsAr).map((lesson, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                        <span 
                                                            className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border-0"
                                                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
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
                                        className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all"
                                        style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                    >
                                        <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
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
                                                className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                title={ui.zoom}
                                            >
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2.5">
                                            {(isEn ? selectedCompanion.inspirationalLessonsEn : selectedCompanion.inspirationalLessonsAr).map((lesson, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                    <span 
                                                        className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border-0"
                                                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
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
                                            className="p-4 sm:p-5 rounded-[18px] border-0 space-y-3 relative transition-all"
                                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                                        >
                                            <div className={`flex items-center justify-between pb-2 border-b ${tokens.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
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
                                                    className="w-7 h-7 rounded-full border-0 flex items-center justify-center transition-colors cursor-pointer"
                                                    style={{ backgroundColor: actionBtnBg, color: tokens.isDark ? '#E2E8F0' : '#475569' }}
                                                    title={ui.zoom}
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(isEn ? extraSections.modernApplicationEn : extraSections.modernApplicationAr).map((app, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="flex items-start gap-2.5 p-3 rounded-[14px] border-0"
                                                        style={{ backgroundColor: `${primaryColor}14` }}
                                                    >
                                                        <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
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
                        <div className="pt-4 pb-6 flex items-center justify-between gap-3">
                            {prevCompanion ? (
                                <button
                                    onClick={() => handleSelectCompanion(prevCompanion)}
                                    className="flex-1 py-3 px-3 rounded-[16px] border-0 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
                                    style={{ 
                                        backgroundColor: cardBgColor, 
                                        boxShadow: cardShadow,
                                        color: tokens.isDark ? '#E2E8F0' : '#334155'
                                    }}
                                >
                                    <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xs`}></i>
                                    <span className="truncate">{isEn ? prevCompanion.nameEn : prevCompanion.nameAr}</span>
                                </button>
                            ) : <div className="flex-1" />}

                            {nextCompanion ? (
                                <button
                                    onClick={() => handleSelectCompanion(nextCompanion)}
                                    className="flex-1 py-3 px-3 rounded-[16px] border-0 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
                                    style={{ 
                                        backgroundColor: cardBgColor, 
                                        boxShadow: cardShadow,
                                        color: tokens.isDark ? '#E2E8F0' : '#334155'
                                    }}
                                >
                                    <span className="truncate">{isEn ? nextCompanion.nameEn : nextCompanion.nameAr}</span>
                                    <i className={`fa-solid ${isEn ? 'fa-arrow-right' : 'fa-arrow-left'} text-xs`}></i>
                                </button>
                            ) : <div className="flex-1" />}
                        </div>
                        {/* Bottom Spacer for Mobile Phone Navigation Bar */}
                        <div className="w-full h-10 sm:h-14 shrink-0 pointer-events-none" />
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
                            className="w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[85vh] overflow-hidden relative shadow-2xl"
                            style={{ 
                                fontFamily: isEn ? 'sans-serif' : theme.font,
                                backgroundColor: cardBgColor,
                                color: tokens.isDark ? '#FFFFFF' : '#1E293B',
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
                            <div ref={zoomScrollRef} className="overflow-y-auto hide-scrollbar flex-1 px-6 py-4 space-y-4">
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
                                            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-[14px] bg-slate-500/5 dark:bg-slate-800/40 border-0">
                                                <span 
                                                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 border-0"
                                                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
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
                                className="p-4 pt-3 shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 dark:border-white/5" 
                                style={{ 
                                    backgroundColor: cardBgColor,
                                    paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'
                                }}
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
                                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                                    style={{
                                        backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
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
                                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                                    style={{
                                        backgroundColor: copiedModal ? '#10B981' : (tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
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
                                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                                    style={{
                                        backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
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
                                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                                    style={{
                                        backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
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
