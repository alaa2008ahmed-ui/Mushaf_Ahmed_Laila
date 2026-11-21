import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { 
    TEN_PROMISED_COMPANIONS, 
    TEN_PROMISED_UI_TEXTS, 
    CompanionInfo 
} from '../data/tenPromisedData';
import {
  getCompanionTraits,
  getCompanionHeroicStances,
  getCompanionWisdomQuotes
} from '../data/tenPromisedExtendedData';
import { getCompanionExtraSections } from '../data/tenPromisedCardsData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
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
import { getToast3DStyles } from '../utils/toast3DStyles';

interface TenPromisedPageProps {
    onBack?: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
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

const TenPromisedPage: React.FC<TenPromisedPageProps> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
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

    const handleCopySectionText = (text: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            showToast(ui.toastCopiedText);
        }).catch(() => {
            showToast(ui.toastCopyFailed);
        });
    };

    const handleShareSectionImage = async (
        opts: { title: string; text: string; category?: string; source?: string },
        e?: React.MouseEvent
    ) => {
        if (e) e.stopPropagation();
        if (isSharing) return;
        setIsSharing(true);
        try {
            await shareAsImage({
                title: opts.title,
                text: opts.text,
                category: opts.category || (isEn ? 'The Ten Promised Paradise' : 'العشرة المبشرون بالجنة'),
                source: opts.source || '',
                theme,
                isEn,
                language: isEn ? 'en' : 'ar',
                setToastMessage: (msg: string) => showToast(msg)
            });
        } catch (error) {
            console.error('Error sharing section card:', error);
            showToast(ui.toastShareFailed);
        } finally {
            setIsSharing(false);
        }
    };

    const renderCardActions = (
        onShare: (e: React.MouseEvent) => void,
        onCopy: (e: React.MouseEvent) => void,
        onZoom: (e: React.MouseEvent) => void
    ) => (
        <div className="flex items-center gap-2 shrink-0 overflow-visible">
            <button
                type="button"
                onClick={onShare}
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
                onClick={onCopy}
                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                style={{ color: 'var(--text-color)' }}
                title={ui.copyText}
                aria-label={ui.copyText}
            >
                <Copy size={13} />
            </button>
            <button
                type="button"
                onClick={onZoom}
                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                style={{ color: 'var(--text-color)' }}
                title={ui.zoom}
                aria-label={ui.zoom}
            >
                <ZoomIn size={14} />
            </button>
        </div>
    );

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
                {toastMessage && (
                    <div
                        className="app-3d-toast fixed left-1/2 -translate-x-1/2 z-[200] max-w-[90vw] w-max px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border-0 flex items-center justify-center gap-2.5 pointer-events-none leading-normal break-words"
                        style={{
                            ...toast3D.style,
                            bottom: 'calc(var(--app-bottom-clearance, 0px) + clamp(1.25rem, 3dvh, 2rem))'
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

            {/* Top Header Bar */}
            <header className="app-top-bar z-20 shrink-0">
                <div className="app-top-bar__inner">
                    <div className="flex items-center justify-between gap-1 w-full min-h-[44px]">
                        {/* Left/Right Back & Zoom Controls */}
                        <div className="flex items-center gap-0.5 shrink-0">
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
                                    <span className="app-3d-badge absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full bg-emerald-600 text-white leading-tight" dir="ltr">
                                        +{Math.round((cardTextScale - 1) * 100)}%
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Title in center */}
                        <div className="flex-1 min-w-0 flex items-center justify-center px-1 text-center overflow-hidden">
                            <h1 className={`app-top-bar__title ${isEn ? 'font-bold' : 'font-cairo'} ${
                                selectedCompanion 
                                    ? 'text-sm sm:text-base leading-tight font-bold truncate' 
                                    : 'text-base sm:text-xl leading-tight font-black truncate'
                            }`}>
                                {selectedCompanion 
                                    ? (isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr)
                                    : ui.pageTitle}
                            </h1>
                        </div>

                        {/* Right/Left Tools: Guide (shown ONLY in list view) + ThemeLock + Home */}
                        <div className="flex items-center gap-0.5 shrink-0">
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
                                        } ${isEn ? 'font-sans' : 'font-cairo'}`}
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
                                                {/* Order Circle & Action Buttons */}
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <span 
                                                        className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center border-0 shrink-0"
                                                        style={primaryBadge3DStyle}
                                                    >
                                                        {companion.order}
                                                    </span>
                                                    {renderCardActions(
                                                        (e) => {
                                                            e.stopPropagation();
                                                            handleShareCompanionImage(companion);
                                                        },
                                                        (e) => {
                                                            e.stopPropagation();
                                                            handleCopyFullBio(companion);
                                                        },
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: name,
                                                                subtitle: title,
                                                                badge: isEn ? companion.kunyaEn : companion.kunyaAr,
                                                                content: `${isEn ? companion.fullNameEn : companion.fullNameAr}\n\n✨ «${isEn ? companion.keyQuoteEn : companion.keyQuoteAr}»\n\n📜 ${ui.hadithProofLabel}\n${isEn ? companion.gladTidingsHadithEn : companion.gladTidingsHadithAr}`
                                                            });
                                                        }
                                                    )}
                                                </div>

                                                {/* Name */}
                                                <AutoFitSingleLine
                                                    as="h3"
                                                    text={name}
                                                    baseFontSize={16}
                                                    smFontSize={18}
                                                    minFontSize={9}
                                                    textScale={cardTextScale}
                                                    className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'}`}
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
                                    {/* Top row: Order badge, Share, Copy & Zoom buttons */}
                                    <div className="flex items-center justify-between overflow-visible">
                                        <span 
                                            className="w-8 h-8 rounded-full text-sm font-black flex items-center justify-center border-0"
                                            style={primaryBadge3DStyle}
                                        >
                                            {selectedCompanion.order}
                                        </span>

                                        {renderCardActions(
                                            (e) => {
                                                e.stopPropagation();
                                                handleShareCompanionImage(selectedCompanion);
                                            },
                                            (e) => {
                                                e.stopPropagation();
                                                handleCopyFullBio(selectedCompanion);
                                            },
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    subtitle: isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr,
                                                    badge: isEn ? selectedCompanion.kunyaEn : selectedCompanion.kunyaAr,
                                                    content: `${isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}\n\n⭐ ${isEn ? selectedCompanion.kunyaEn : selectedCompanion.kunyaAr}\n⏳ ${isEn ? selectedCompanion.birthYearEn : selectedCompanion.birthYearAr} - ${isEn ? selectedCompanion.deathYearEn : selectedCompanion.deathYearAr}\n📍 ${isEn ? selectedCompanion.burialPlaceEn : selectedCompanion.burialPlaceAr}\n\n🌟 «${isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}»`
                                                });
                                            }
                                        )}
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
                                            className={`font-black ${isEn ? 'font-sans' : 'font-cairo'}`}
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
                                        <div className="flex items-center justify-between gap-2 mb-1.5 overflow-visible">
                                            <span className="text-[11px] font-bold" style={{ color: themeHeadingColor }}>
                                                {ui.quoteTitle}
                                            </span>
                                            {renderCardActions(
                                                (e) => handleShareSectionImage({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    text: `«${isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}»`,
                                                    category: ui.quoteTitle,
                                                    source: isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr
                                                }, e),
                                                (e) => handleCopySectionText(`${ui.quoteTitle}\n«${isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}»`, e),
                                                (e) => {
                                                    e.stopPropagation();
                                                    setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: ui.quoteTitle,
                                                        badge: isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr,
                                                        content: `«${isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}»`
                                                    });
                                                }
                                            )}
                                        </div>
                                        <p className={`text-xs sm:text-sm leading-relaxed font-bold italic ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr}
                                        </p>
                                    </div>

                                    {/* Glad Tidings Hadith Card with 3 buttons */}
                                    <div 
                                        className={`p-4 rounded-[16px] relative ${innerSubBoxClass}`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1.5 overflow-visible">
                                            <span className="text-[11px] font-bold" style={{ color: themeHeadingColor }}>
                                                {ui.hadithProofLabel}
                                            </span>
                                            {renderCardActions(
                                                (e) => handleShareSectionImage({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    text: isEn ? selectedCompanion.gladTidingsHadithEn : selectedCompanion.gladTidingsHadithAr,
                                                    category: ui.hadithProofLabel,
                                                    source: isEn ? 'Glad Tidings of Paradise' : 'بشارة الجنة'
                                                }, e),
                                                (e) => handleCopySectionText(`${ui.hadithProofLabel}\n${isEn ? selectedCompanion.gladTidingsHadithEn : selectedCompanion.gladTidingsHadithAr}`, e),
                                                (e) => {
                                                    e.stopPropagation();
                                                    setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: ui.hadithProofLabel,
                                                        badge: isEn ? 'Glad Tidings' : 'بشارة الجنة',
                                                        icon: 'fa-solid fa-crown',
                                                        content: isEn ? selectedCompanion.gladTidingsHadithEn : selectedCompanion.gladTidingsHadithAr,
                                                        isVerseOrProof: true
                                                    });
                                                }
                                            )}
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
                            {detailTab === 'profile' && (() => {
                                const profileContent = `${ui.fullNameLabel} ${isEn ? selectedCompanion.fullNameEn : selectedCompanion.fullNameAr}\n\n${ui.kunyaLabel} ${isEn ? selectedCompanion.kunyaEn : selectedCompanion.kunyaAr}\n\n${ui.birthLabel} ${isEn ? selectedCompanion.birthYearEn : selectedCompanion.birthYearAr}\n\n${ui.deathLabel} ${isEn ? selectedCompanion.deathYearEn : selectedCompanion.deathYearAr}\n\n${ui.burialLabel} ${isEn ? selectedCompanion.burialPlaceEn : selectedCompanion.burialPlaceAr}\n\n${ui.kinshipLabel} ${isEn ? selectedCompanion.kinshipEn : selectedCompanion.kinshipAr}`;
                                return (
                                <div className="space-y-3">
                                    <div 
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all" 
                                    >
                                        <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                            <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                <AutoFitSingleLine as="span" text={ui.tabProfile} baseFontSize={14} minFontSize={9.5} textScale={cardTextScale} className="min-w-0 flex-1" />
                                            </h4>
                                            {renderCardActions(
                                                (e) => handleShareSectionImage({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    text: profileContent,
                                                    category: ui.tabProfile,
                                                    source: isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr
                                                }, e),
                                                (e) => handleCopySectionText(`${isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr} - ${ui.tabProfile}\n\n${profileContent}`, e),
                                                (e) => {
                                                    e.stopPropagation();
                                                    setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: ui.tabProfile,
                                                        badge: isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr,
                                                        content: profileContent
                                                    });
                                                }
                                            )}
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
                                    {extraSections && (() => {
                                        const lineageText = isEn ? extraSections.lineageDetailsEn : extraSections.lineageDetailsAr;
                                        const lineageSub = isEn ? 'Lineage & Kinship' : 'شجرة النسب والقرابة';
                                        return (
                                            <div 
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                            >
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Lineage, Clan & Prophetic Kinship' : 'شجرة النسب والمكانة والقرابة النبوية'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            text: lineageText,
                                                            category: lineageSub,
                                                            source: isEn ? 'Lineage' : 'النسب الشريف'
                                                        }, e),
                                                        (e) => handleCopySectionText(`${lineageSub}\n\n${lineageText}`, e),
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                subtitle: lineageSub,
                                                                badge: isEn ? 'Lineage' : 'النسب الشريف',
                                                                icon: 'fa-solid fa-sitemap',
                                                                content: lineageText
                                                            });
                                                        }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {lineageText}
                                                </p>
                                            </div>
                                        );
                                    })()}

                                    {/* Geographical Stations & Milestones */}
                                    {extraSections && extraSections.geographicalStations && extraSections.geographicalStations.length > 0 && (() => {
                                        const stationsArr = extraSections.geographicalStations.map(s => `📍 ${isEn ? s.placeEn : s.placeAr} (${isEn ? s.periodEn : s.periodAr})\n${isEn ? s.detailsEn : s.detailsAr}`);
                                        const stationsText = stationsArr.join('\n\n');
                                        const stationsSub = isEn ? 'Geographical Stations' : 'المحطات الجغرافية والمسار';
                                        return (
                                            <div 
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                            >
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Key Geographical Stations & Milestones' : 'المحطات الجغرافية ومسار الدعوة والفتوحات'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            text: stationsText,
                                                            category: stationsSub,
                                                            source: isEn ? 'Stations' : 'المحطات التاريخية'
                                                        }, e),
                                                        (e) => handleCopySectionText(`${stationsSub}\n\n${stationsText}`, e),
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                subtitle: stationsSub,
                                                                badge: isEn ? 'Stations' : 'المحطات التاريخية',
                                                                icon: 'fa-solid fa-map-location-dot',
                                                                content: stationsArr
                                                            });
                                                        }
                                                    )}
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
                                        );
                                    })()}
                                </div>
                                );
                            })()}

                            {/* TAB 2: HEROIC STANCES (مواقف وبطولات) */}
                            {detailTab === 'stances' && (() => {
                                const stances = getCompanionHeroicStances(selectedCompanion.id);
                                const stancesHeaderTitle = isEn ? `${stances.length} Documented Heroic Stances` : `${stances.length} مواقف بطولية وخالدة موثقة في السيرة`;
                                const stancesOverviewList = stances.map(s => `${isEn ? s.titleEn : s.titleAr} (${isEn ? s.periodEn : s.periodAr})\n${isEn ? s.storyEn : s.storyAr}`);
                                return (
                                    <div className="space-y-3.5">
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-[16px] flex items-center justify-between gap-2 overflow-visible"
                                        >
                                            <AutoFitSingleLine
                                                as="span"
                                                text={stancesHeaderTitle}
                                                baseFontSize={13}
                                                minFontSize={9}
                                                textScale={cardTextScale}
                                                className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                                style={{ color: themeHeadingColor }}
                                            />
                                            {renderCardActions(
                                                (e) => handleShareSectionImage({
                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                    text: stances.map((s, i) => `${i + 1}. ${isEn ? s.titleEn : s.titleAr}`).join('\n'),
                                                    category: ui.tabStances,
                                                    source: stancesHeaderTitle
                                                }, e),
                                                (e) => handleCopySectionText(`${stancesHeaderTitle}\n\n${stancesOverviewList.join('\n\n')}`, e),
                                                (e) => {
                                                    e.stopPropagation();
                                                    setZoomedCard({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        subtitle: stancesHeaderTitle,
                                                        badge: ui.tabStances,
                                                        content: stancesOverviewList
                                                    });
                                                }
                                            )}
                                        </div>

                                        {stances.map((stance, idx) => {
                                            const stanceTitle = isEn ? stance.titleEn : stance.titleAr;
                                            const stanceStory = isEn ? stance.storyEn : stance.storyAr;
                                            const stanceQuote = stance.quoteAr ? (isEn ? (stance.quoteEn || stance.quoteAr) : stance.quoteAr) : '';
                                            const stanceImpact = isEn ? stance.impactEn : stance.impactAr;
                                            const stanceFullContent = `${stanceStory}${stanceQuote ? `\n\n«${stanceQuote}»` : ''}\n\n🌟 ${ui.impactLabel}\n${stanceImpact}`;
                                            return (
                                            <div 
                                                key={stance.id || idx}
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible group transition-all"
                                            >
                                                {/* Stance Header: Period text + Share, Copy & Zoom buttons */}
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <span className="text-xs font-bold opacity-70 truncate">
                                                        {isEn ? stance.periodEn : stance.periodAr}
                                                    </span>

                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({
                                                            title: stanceTitle,
                                                            text: stanceFullContent,
                                                            category: `${isEn ? stance.periodEn : stance.periodAr} • ${isEn ? stance.categoryEn : stance.categoryAr}`,
                                                            source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr
                                                        }, e),
                                                        (e) => handleCopySectionText(`${stanceTitle}\n(${isEn ? stance.periodEn : stance.periodAr})\n\n${stanceFullContent}`, e),
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: stanceTitle,
                                                                subtitle: `${isEn ? stance.periodEn : stance.periodAr} • ${isEn ? stance.categoryEn : stance.categoryAr}`,
                                                                badge: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                icon: 'fa-solid fa-fire-flame-curved',
                                                                content: stanceFullContent
                                                            });
                                                        }
                                                    )}
                                                </div>

                                                {/* Stance Title */}
                                                <AutoFitSingleLine
                                                    as="h4"
                                                    text={stanceTitle}
                                                    baseFontSize={15}
                                                    smFontSize={16}
                                                    minFontSize={9}
                                                    textScale={cardTextScale}
                                                    className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'}`}
                                                    style={{ color: themeHeadingColor }}
                                                />

                                                {/* Stance Story */}
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {stanceStory}
                                                </p>

                                                {/* Quote box if present */}
                                                {(stance.quoteAr || stance.quoteEn) && (
                                                    <div 
                                                        className={`p-3 rounded-[14px] text-center ${innerSubBoxClass}`}
                                                    >
                                                        <p className={`text-xs sm:text-sm font-bold italic ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ color: themeHeadingColor }}>
                                                            «{stanceQuote}»
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
                                                        {stanceImpact}
                                                    </p>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            {/* TAB 3: TRAITS & FAMILY (شمائله وأسرته) */}
                            {detailTab === 'traits' && (() => {
                                const traits = getCompanionTraits(selectedCompanion.id);
                                if (!traits) return null;
                                const physText = isEn ? traits.physicalAppearanceEn : traits.physicalAppearanceAr;
                                const worshipText = isEn ? traits.worshipAndDevotionEn : traits.worshipAndDevotionAr;
                                const familyText = isEn ? traits.familyAndLineageEn : traits.familyAndLineageAr;
                                const skillsList = isEn ? traits.specialSkillsEn : traits.specialSkillsAr;
                                return (
                                    <div className="space-y-3.5">
                                        {/* Physical Appearance Card */}
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={ui.physicalAppearanceLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                </h4>
                                                {renderCardActions(
                                                    (e) => handleShareSectionImage({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        text: physText,
                                                        category: ui.physicalAppearanceLabel,
                                                        source: isEn ? 'Physical Traits' : 'الصفة الخَلقية'
                                                    }, e),
                                                    (e) => handleCopySectionText(`${ui.physicalAppearanceLabel}\n\n${physText}`, e),
                                                    (e) => {
                                                        e.stopPropagation();
                                                        setZoomedCard({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            subtitle: ui.physicalAppearanceLabel,
                                                            badge: isEn ? 'Physical Traits' : 'الصفة الخَلقية',
                                                            icon: 'fa-solid fa-user-check',
                                                            content: physText
                                                        });
                                                    }
                                                )}
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {physText}
                                            </p>
                                        </div>

                                        {/* Worship & Devotion Card */}
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={ui.worshipLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                </h4>
                                                {renderCardActions(
                                                    (e) => handleShareSectionImage({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        text: worshipText,
                                                        category: ui.worshipLabel,
                                                        source: isEn ? 'Worship & Devotion' : 'العبادة والزهد'
                                                    }, e),
                                                    (e) => handleCopySectionText(`${ui.worshipLabel}\n\n${worshipText}`, e),
                                                    (e) => {
                                                        e.stopPropagation();
                                                        setZoomedCard({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            subtitle: ui.worshipLabel,
                                                            badge: isEn ? 'Worship & Devotion' : 'العبادة والزهد',
                                                            icon: 'fa-solid fa-heart',
                                                            content: worshipText
                                                        });
                                                    }
                                                )}
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {worshipText}
                                            </p>
                                        </div>

                                        {/* Family, Lineage & Descendants */}
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={ui.familyLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                </h4>
                                                {renderCardActions(
                                                    (e) => handleShareSectionImage({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        text: familyText,
                                                        category: ui.familyLabel,
                                                        source: isEn ? 'Family & Kinship' : 'الأسرة والذرية'
                                                    }, e),
                                                    (e) => handleCopySectionText(`${ui.familyLabel}\n\n${familyText}`, e),
                                                    (e) => {
                                                        e.stopPropagation();
                                                        setZoomedCard({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            subtitle: ui.familyLabel,
                                                            badge: isEn ? 'Family & Kinship' : 'الأسرة والذرية',
                                                            icon: 'fa-solid fa-people-roof',
                                                            content: familyText
                                                        });
                                                    }
                                                )}
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                {familyText}
                                            </p>
                                        </div>

                                        {/* Special Attributes & Talents */}
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                    <AutoFitSingleLine as="span" text={ui.specialSkillsLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                </h4>
                                                {renderCardActions(
                                                    (e) => handleShareSectionImage({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        text: skillsList.map((s, i) => `${i + 1}. ${s}`).join('\n'),
                                                        category: ui.specialSkillsLabel,
                                                        source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr
                                                    }, e),
                                                    (e) => handleCopySectionText(`${ui.specialSkillsLabel}\n\n${skillsList.map((s, i) => `${i + 1}. ${s}`).join('\n')}`, e),
                                                    (e) => {
                                                        e.stopPropagation();
                                                        setZoomedCard({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            subtitle: ui.specialSkillsLabel,
                                                            badge: isEn ? 'Talents & Attributes' : 'ملكات وخصائص',
                                                            content: skillsList
                                                        });
                                                    }
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {skillsList.map((skill, idx) => (
                                                    <div key={idx} className={`p-3 rounded-[14px] flex items-center gap-2 text-xs sm:text-sm font-semibold ${innerSubBoxClass}`}>
                                                        <span>{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Daily Routine & Devotion in His Day */}
                                        {extraSections && (() => {
                                            const routineText = isEn ? extraSections.dailyRoutineEn : extraSections.dailyRoutineAr;
                                            const routineSub = isEn ? 'A Day in His Life' : 'يوم في حياته وعبادته';
                                            return (
                                                <div 
                                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                                >
                                                    <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                        <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                            <AutoFitSingleLine as="span" text={isEn ? 'A Day in His Life & Prayer Sanctuary' : 'يوم في حياة الصحابي ومحراب عبادته'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                        </h4>
                                                        {renderCardActions(
                                                            (e) => handleShareSectionImage({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                text: routineText,
                                                                category: routineSub,
                                                                source: isEn ? 'Daily Devotion' : 'محراب العبادة'
                                                            }, e),
                                                            (e) => handleCopySectionText(`${routineSub}\n\n${routineText}`, e),
                                                            (e) => {
                                                                e.stopPropagation();
                                                                setZoomedCard({
                                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                    subtitle: routineSub,
                                                                    badge: isEn ? 'Daily Devotion' : 'محراب العبادة',
                                                                    icon: 'fa-solid fa-sun',
                                                                    content: routineText
                                                                });
                                                            }
                                                        )}
                                                    </div>
                                                    <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {routineText}
                                                    </p>
                                                </div>
                                            );
                                        })()}

                                        {/* Unique Distinctions & Merits */}
                                        {extraSections && extraSections.uniqueDistinctionsAr && extraSections.uniqueDistinctionsAr.length > 0 && (() => {
                                            const distList = isEn ? extraSections.uniqueDistinctionsEn : extraSections.uniqueDistinctionsAr;
                                            const distSub = isEn ? 'Unique Distinctions' : 'فرائد وخصائص';
                                            return (
                                                <div 
                                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                                >
                                                    <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                        <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                            <AutoFitSingleLine as="span" text={isEn ? 'Unique Distinctions & Special Merits' : 'فرائد ومناقب انفرد بها في تاريخ الإسلام'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                        </h4>
                                                        {renderCardActions(
                                                            (e) => handleShareSectionImage({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                text: distList.map((u, i) => `${i + 1}. ${u}`).join('\n\n'),
                                                                category: distSub,
                                                                source: isEn ? 'Excellence' : 'أوليات ومفاخر'
                                                            }, e),
                                                            (e) => handleCopySectionText(`${distSub}\n\n${distList.map((u, i) => `${i + 1}. ${u}`).join('\n')}`, e),
                                                            (e) => {
                                                                e.stopPropagation();
                                                                setZoomedCard({
                                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                    subtitle: distSub,
                                                                    badge: isEn ? 'Excellence' : 'أوليات ومفاخر',
                                                                    icon: 'fa-solid fa-award',
                                                                    content: distList.map((u, i) => `⭐ ${i + 1}. ${u}`)
                                                                });
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        {distList.map((dist, idx) => (
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
                                            );
                                        })()}
                                    </div>
                                );
                            })()}

                            {/* TAB 4: WISDOM & QUOTES (حكم وأقوال مأثورة) */}
                            {detailTab === 'sayings' && (() => {
                                const quotes = getCompanionWisdomQuotes(selectedCompanion.id);
                                const heroQuote = isEn ? selectedCompanion.keyQuoteEn : selectedCompanion.keyQuoteAr;
                                return (
                                    <div className="space-y-3.5">
                                        <div 
                                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-[18px] text-center space-y-2 overflow-visible"
                                        >
                                            <div className="flex items-center justify-between gap-2 pb-2 app-3d-divider overflow-visible">
                                                <span className="text-[11px] font-bold" style={{ color: themeHeadingColor }}>
                                                    {ui.quoteTitle}
                                                </span>
                                                {renderCardActions(
                                                    (e) => handleShareSectionImage({
                                                        title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                        text: `«${heroQuote}»`,
                                                        category: ui.quoteTitle,
                                                        source: isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr
                                                    }, e),
                                                    (e) => handleCopySectionText(`${ui.quoteTitle}\n«${heroQuote}»`, e),
                                                    (e) => {
                                                        e.stopPropagation();
                                                        setZoomedCard({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            subtitle: ui.quoteTitle,
                                                            badge: isEn ? selectedCompanion.titleBadgeEn : selectedCompanion.titleBadgeAr,
                                                            content: `«${heroQuote}»`
                                                        });
                                                    }
                                                )}
                                            </div>
                                            <p className={`text-sm sm:text-base font-bold italic leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ color: themeHeadingColor }}>
                                                «{heroQuote}»
                                            </p>
                                        </div>

                                        {quotes.map((q, idx) => {
                                            const qQuote = isEn ? q.quoteEn : q.quoteAr;
                                            const qContext = isEn ? q.contextEn : q.contextAr;
                                            return (
                                            <div 
                                                key={idx}
                                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all"
                                            >
                                                <div className="flex items-center justify-between pb-2.5 app-3d-divider overflow-visible">
                                                    <span 
                                                        className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-0"
                                                        style={itemBadge3DStyle}
                                                    >
                                                        {idx + 1}
                                                    </span>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({
                                                            title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                            text: `${qQuote}\n\n📜 ${ui.wisdomContextLabel}\n${qContext}`,
                                                            category: qContext,
                                                            source: isEn ? `Wisdom #${idx + 1}` : `درة وحكمة #${idx + 1}`
                                                        }, e),
                                                        (e) => handleCopySectionText(`${qQuote}\n- ${qContext}`, e),
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                subtitle: qContext,
                                                                badge: isEn ? `Wisdom #${idx + 1}` : `درة وحكمة #${idx + 1}`,
                                                                icon: 'fa-solid fa-quote-left',
                                                                content: `${qQuote}\n\n📜 ${ui.wisdomContextLabel}\n${qContext}`
                                                            });
                                                        }
                                                    )}
                                                </div>

                                                <p className={`text-xs sm:text-sm font-bold leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                    {qQuote}
                                                </p>

                                                <div className={`p-3 rounded-[14px] text-[11px] sm:text-xs leading-relaxed ${innerSubBoxClass}`}>
                                                    <span className="font-bold opacity-90 block mb-0.5">{ui.wisdomContextLabel}</span>
                                                    <span className="opacity-85">{qContext}</span>
                                                </div>
                                            </div>
                                            );
                                        })}

                                        {/* Soul Purification & Heart Reform Methodology */}
                                        {extraSections && (() => {
                                            const adviceText = isEn ? extraSections.eternalAdviceEn : extraSections.eternalAdviceAr;
                                            const adviceSub = isEn ? 'Spiritual Discipline' : 'تزكية النفس وإصلاح القلوب';
                                            return (
                                                <div 
                                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all"
                                                >
                                                    <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                        <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                            <AutoFitSingleLine as="span" text={isEn ? 'Spiritual Discipline & Heart Reform' : 'منهج الصحابي في تزكية النفس وإصلاح القلوب'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                        </h4>
                                                        {renderCardActions(
                                                            (e) => handleShareSectionImage({
                                                                title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                text: adviceText,
                                                                category: adviceSub,
                                                                source: isEn ? 'Spiritual Core' : 'منهج التزكية'
                                                            }, e),
                                                            (e) => handleCopySectionText(`${adviceSub}\n\n${adviceText}`, e),
                                                            (e) => {
                                                                e.stopPropagation();
                                                                setZoomedCard({
                                                                    title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr,
                                                                    subtitle: adviceSub,
                                                                    badge: isEn ? 'Spiritual Core' : 'منهج التزكية',
                                                                    icon: 'fa-solid fa-seedling',
                                                                    content: adviceText
                                                                });
                                                            }
                                                        )}
                                                    </div>
                                                    <p className={`text-xs sm:text-sm leading-relaxed font-semibold opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                                        {adviceText}
                                                    </p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            })()}

                            {/* TAB 5: PRE-ISLAM */}
                            {detailTab === 'preIslam' && (
                                <div className="space-y-3">
                                    {/* Card 1: Status in Quraysh */}
                                    {(() => {
                                        const cardTitle = isEn ? 'Status & Lineage in Quraysh' : 'مكانته ونشأته في قريش';
                                        const sub = isEn ? 'Status in Quraysh' : 'مكانته في قريش';
                                        const text = isEn ? selectedCompanion.preIslamicLife.statusInQurayshEn : selectedCompanion.preIslamicLife.statusInQurayshAr;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text, category: sub, source: isEn ? 'Before Islam' : 'قبل الإسلام' }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${text}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Before Islam' : 'قبل الإسلام', content: text }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{text}</p>
                                            </div>
                                        );
                                    })()}

                                    {/* Card 2: Morals & Pure Nature */}
                                    {(() => {
                                        const cardTitle = isEn ? 'Pure Nature & Morals' : 'أخلاقه وطهارة فطرته';
                                        const sub = isEn ? 'Morals & Nature' : 'أخلاقه وفطرته';
                                        const text = isEn ? selectedCompanion.preIslamicLife.moralsAndNatureEn : selectedCompanion.preIslamicLife.moralsAndNatureAr;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text, category: sub, source: isEn ? 'Before Islam' : 'قبل الإسلام' }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${text}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Before Islam' : 'قبل الإسلام', content: text }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{text}</p>
                                            </div>
                                        );
                                    })()}

                                    {/* Card 3: Rejection of Idolatry */}
                                    {extraSections && (() => {
                                        const cardTitle = isEn ? 'Rejection of Pre-Islamic Idolatry' : 'موقفه الحاسم من وثنية الجاهلية وأصنامها';
                                        const sub = isEn ? 'Rejection of Idolatry' : 'البراءة من الأصنام والجاهلية';
                                        const text = isEn ? extraSections.idolatryStanceEn : extraSections.idolatryStanceAr;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text, category: sub, source: isEn ? 'Monotheistic Inclination' : 'طهارة العقيدة' }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${text}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Monotheistic Inclination' : 'طهارة العقيدة', icon: 'fa-solid fa-shield-halved', content: text }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{text}</p>
                                            </div>
                                        );
                                    })()}

                                    {/* Card 4: Trade, Wisdom & Knowledge */}
                                    {(() => {
                                        const cardTitle = isEn ? 'Trade, Wisdom & Acumen' : 'تجارته وحكمته وخبرته';
                                        const sub = isEn ? 'Trade & Knowledge' : 'تجارته وخبرته';
                                        const text = isEn ? selectedCompanion.preIslamicLife.tradeAndKnowledgeEn : selectedCompanion.preIslamicLife.tradeAndKnowledgeAr;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text, category: sub, source: isEn ? 'Before Islam' : 'قبل الإسلام' }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${text}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Before Islam' : 'قبل الإسلام', content: text }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{text}</p>
                                            </div>
                                        );
                                    })()}

                                    {/* Card 5: Pre-Islam Role & Arab Wisdom */}
                                    {extraSections && (() => {
                                        const cardTitle = isEn ? 'Wisdom & Standing Among Arab Nobles' : 'مكانته وفراسته وحكمته بين عقلاء العرب';
                                        const sub = isEn ? 'Wisdom & Status' : 'الحكمة والريادة في الجاهلية';
                                        const text = isEn ? extraSections.wisdomAndPreIslamRoleEn : extraSections.wisdomAndPreIslamRoleAr;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text, category: sub, source: isEn ? 'Pre-Islam Eminence' : 'ريادة وحكمة' }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${text}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Pre-Islam Eminence' : 'ريادة وحكمة', icon: 'fa-solid fa-scale-balanced', content: text }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{text}</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* TAB 3: CONVERSION & JIHAD */}
                            {detailTab === 'conversion' && (
                                <div className="space-y-3">
                                    {/* Story of Embracing Islam */}
                                    {(() => {
                                        const cardTitle = isEn ? 'Story of Embracing Islam' : 'قصة دخوله في الإسلام';
                                        const sub = isEn ? 'Embracing Islam' : 'قصة إسلامه';
                                        const text = isEn ? selectedCompanion.embracingIslam.storyEn : selectedCompanion.embracingIslam.storyAr;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text, category: sub, source: isEn ? 'Faith & Conversion' : 'قصة الإسلام' }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${text}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Faith & Conversion' : 'قصة الإسلام', content: text }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{text}</p>
                                            </div>
                                        );
                                    })()}

                                    {/* Precedence and Advocacy */}
                                    {(() => {
                                        const cardTitle = isEn ? 'Early Precedence & Sacrifices' : 'فضله وسَبقه وما لاقاه من أذى';
                                        const sub = isEn ? 'Precedence & Sacrifices' : 'سبقه وتضحياته';
                                        const p1 = isEn ? selectedCompanion.embracingIslam.earlyPrecedenceEn : selectedCompanion.embracingIslam.earlyPrecedenceAr;
                                        const p2 = isEn ? selectedCompanion.embracingIslam.advocacyAndSacrificesEn : selectedCompanion.embracingIslam.advocacyAndSacrificesAr;
                                        const full = `${p1}\n\n${p2}`;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: full, category: sub, source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${full}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, content: full }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 mb-2 ${isEn ? 'font-sans' : 'font-amiri'}`}>{p1}</p>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{p2}</p>
                                            </div>
                                        );
                                    })()}

                                    {/* Major Battles List */}
                                    {(() => {
                                        const battles = isEn ? selectedCompanion.migrationAndJihad.majorBattlesEn : selectedCompanion.migrationAndJihad.majorBattlesAr;
                                        const formattedBattles = battles.map((b, i) => `${i + 1}. ${b}`).join('\n');
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={ui.majorBattlesLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: formattedBattles, category: ui.majorBattlesLabel, source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr }, e),
                                                        (e) => handleCopySectionText(`${ui.majorBattlesLabel}\n\n${formattedBattles}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: ui.majorBattlesLabel, content: battles }); }
                                                    )}
                                                </div>
                                                <div className="space-y-2.5">
                                                    {battles.map((battle, idx) => (
                                                        <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                            <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border-0" style={itemBadge3DStyle}>
                                                                {idx + 1}
                                                            </span>
                                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>{battle}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Hijrah & Brotherhood Card */}
                                    {extraSections && (() => {
                                        const cardTitle = isEn ? 'Hijrah & Brotherhood in Madinah' : 'الهجرة النبوية والمؤاخاة المباركة بالمدينة';
                                        const sub = isEn ? 'Hijrah & Brotherhood' : 'الهجرة والمؤاخاة';
                                        const text = isEn ? extraSections.hijrahAndBrotherhoodEn : extraSections.hijrahAndBrotherhoodAr;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text, category: sub, source: isEn ? 'Hijrah' : 'الهجرة المباركة' }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${text}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Hijrah' : 'الهجرة المباركة', icon: 'fa-solid fa-compass', content: text }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{text}</p>
                                            </div>
                                        );
                                    })()}

                                    {/* Defense and Sacrifice for the Prophet Card */}
                                    {extraSections && (() => {
                                        const cardTitle = isEn ? 'Sacrifice & Defense of the Prophet ﷺ' : 'الفداء والذود المستميت عن رسول الله ﷺ';
                                        const sub = isEn ? 'Sacrifice & Defense' : 'الفداء والدفاع النبوي';
                                        const text = isEn ? extraSections.prophetSacrificeEn : extraSections.prophetSacrificeAr;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text, category: sub, source: isEn ? 'Devoted Shield' : 'الفداء والوفاء' }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${text}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Devoted Shield' : 'الفداء والوفاء', icon: 'fa-solid fa-shield-halved', content: text }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{text}</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* TAB 4: VIRTUES & GLAD TIDINGS */}
                            {detailTab === 'virtues' && (
                                <div className="space-y-3">
                                    {/* Prophetic Hadiths in his Virtues */}
                                    {(() => {
                                        const hadithsList = isEn ? selectedCompanion.virtuesAndMerits.hadithsAndQuotesEn : selectedCompanion.virtuesAndMerits.hadithsAndQuotesAr;
                                        const mapped = hadithsList.map(h => `${h.hadith}\n[${h.source}]`);
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={ui.hadithsAndQuotesLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: mapped.join('\n\n'), category: ui.hadithsAndQuotesLabel, source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr }, e),
                                                        (e) => handleCopySectionText(`${ui.hadithsAndQuotesLabel}\n\n${mapped.join('\n\n')}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: ui.hadithsAndQuotesLabel, content: mapped, isVerseOrProof: true }); }
                                                    )}
                                                </div>
                                                <div className="space-y-2.5">
                                                    {hadithsList.map((item, idx) => (
                                                        <div key={idx} className={`p-3.5 rounded-[14px] space-y-1.5 ${innerSubBoxClass}`}>
                                                            <p className={`text-xs sm:text-sm font-bold leading-relaxed ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ color: tokens.isDark ? '#F1F5F9' : '#0F172A' }}>
                                                                {item.hadith}
                                                            </p>
                                                            <AutoFitSingleLine as="span" text={item.source} baseFontSize={11} minFontSize={7.5} textScale={cardTextScale} className="opacity-70 font-sans w-full" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Titles & Honors */}
                                    {(() => {
                                        const titlesList = isEn ? selectedCompanion.virtuesAndMerits.titlesAndHonorsEn : selectedCompanion.virtuesAndMerits.titlesAndHonorsAr;
                                        const formattedTitles = titlesList.map((t, i) => `${i + 1}. ${t}`).join('\n');
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={ui.titlesAndHonorsLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: formattedTitles, category: ui.titlesAndHonorsLabel, source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr }, e),
                                                        (e) => handleCopySectionText(`${ui.titlesAndHonorsLabel}\n\n${formattedTitles}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: ui.titlesAndHonorsLabel, badge: isEn ? 'Honors' : 'ألقاب ومناقب', content: titlesList }); }
                                                    )}
                                                </div>
                                                <ul className="space-y-2.5 pt-1">
                                                    {titlesList.map((titleItem, idx) => (
                                                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold opacity-95">
                                                            <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 border-0" style={itemBadge3DStyle}>
                                                                {idx + 1}
                                                            </span>
                                                            <span className="pt-0.5">{titleItem}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })()}

                                    {/* Testimonies of Companions */}
                                    {(() => {
                                        const testimonies = isEn ? selectedCompanion.virtuesAndMerits.testimoniesEn : selectedCompanion.virtuesAndMerits.testimoniesAr;
                                        const formatted = testimonies.map((t, i) => `${i + 1}. ${t}`).join('\n\n');
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={ui.testimoniesLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: formatted, category: ui.testimoniesLabel, source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr }, e),
                                                        (e) => handleCopySectionText(`${ui.testimoniesLabel}\n\n${formatted}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: ui.testimoniesLabel, badge: isEn ? 'Testimonies' : 'شهادات الصحابة', content: testimonies }); }
                                                    )}
                                                </div>
                                                <div className="space-y-2.5 pt-1">
                                                    {testimonies.map((testimony, idx) => (
                                                        <div key={idx} className={`p-3 rounded-[14px] text-xs sm:text-sm font-medium leading-relaxed italic ${innerSubBoxClass}`}>
                                                            {testimony}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Quranic Verses Associated with Him Card */}
                                    {extraSections && extraSections.quranicVerses && extraSections.quranicVerses.length > 0 && (() => {
                                        const versesArr = extraSections.quranicVerses.map(v => `📖 ${isEn ? v.surahEn : v.surahAr}\n«${isEn ? v.verseEn : v.verseAr}»\n\n📜 ${isEn ? v.contextEn : v.contextAr}`);
                                        const sub = isEn ? 'Quranic Verses' : 'آيات قرآنية في سيرته';
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Noble Quranic Verses in His Honor & Context' : 'آيات قرآنية كريمة نزلت فيه أو ارتبطت بسيرته'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: versesArr.join('\n\n'), category: sub, source: isEn ? 'Quran' : 'القرآن الكريم' }, e),
                                                        (e) => handleCopySectionText(`${sub}\n\n${versesArr.join('\n\n')}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Quran' : 'القرآن الكريم', icon: 'fa-solid fa-quran', content: versesArr, isVerseOrProof: true }); }
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    {extraSections.quranicVerses.map((verseItem, vIdx) => (
                                                        <div key={vIdx} className={`p-3.5 rounded-[14px] space-y-2 ${innerSubBoxClass}`}>
                                                            <span className="text-[11px] font-bold block opacity-75" style={{ color: themeHeadingColor }}>
                                                                {isEn ? verseItem.surahEn : verseItem.surahAr}
                                                            </span>
                                                            <p className={`text-xs sm:text-sm font-bold text-center leading-loose ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ color: themeHeadingColor }}>
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
                                        );
                                    })()}

                                    {/* Additional Testimonies of Companions & Mothers of Believers */}
                                    {extraSections && extraSections.extraTestimonies && extraSections.extraTestimonies.length > 0 && (() => {
                                        const extArr = extraSections.extraTestimonies.map(t => `💬 ${isEn ? t.speakerEn : t.speakerAr}:\n«${isEn ? t.quoteEn : t.quoteAr}»`);
                                        const sub = isEn ? 'Testimonies' : 'شهادات الصحابة وأمهات المؤمنين';
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Testimonies of Companions & Mothers of Believers' : 'شهادات كبار الصحابة وأمهات المؤمنين في حقه'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: extArr.join('\n\n'), category: sub, source: isEn ? 'Praise' : 'شهادات حق' }, e),
                                                        (e) => handleCopySectionText(`${sub}\n\n${extArr.join('\n\n')}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Praise' : 'شهادات حق', icon: 'fa-solid fa-comments', content: extArr }); }
                                                    )}
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
                                        );
                                    })()}
                                </div>
                            )}

                            {/* TAB 5: LEGACY & PASSING */}
                            {detailTab === 'legacy' && (
                                <div className="space-y-3">
                                    {/* Stance at Prophet's Death & Post-Prophet Role */}
                                    {(() => {
                                        const cardTitle = isEn ? 'Stance at the Prophet\'s Demise' : 'موقفه عند وفاة النبي ﷺ ودوره';
                                        const sub = isEn ? 'Stance at Prophet\'s Passing' : 'موقفه بعد وفاة النبي';
                                        const p1 = isEn ? selectedCompanion.postProphetEraAndLegacy.stanceAtProphetsDeathEn : selectedCompanion.postProphetEraAndLegacy.stanceAtProphetsDeathAr;
                                        const p2 = isEn ? selectedCompanion.postProphetEraAndLegacy.roleOrCaliphateEn : selectedCompanion.postProphetEraAndLegacy.roleOrCaliphateAr;
                                        const full = `${p1}\n\n${p2}`;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: full, category: sub, source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${full}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, content: full }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 mb-2 ${isEn ? 'font-sans' : 'font-amiri'}`}>{p1}</p>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{p2}</p>
                                            </div>
                                        );
                                    })()}

                                    {/* Major Achievements */}
                                    {(() => {
                                        const achievements = isEn ? selectedCompanion.postProphetEraAndLegacy.majorAchievementsEn : selectedCompanion.postProphetEraAndLegacy.majorAchievementsAr;
                                        const formatted = achievements.map((a, i) => `${i + 1}. ${a}`).join('\n');
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={ui.majorAchievementsLabel} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: formatted, category: ui.majorAchievementsLabel, source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr }, e),
                                                        (e) => handleCopySectionText(`${ui.majorAchievementsLabel}\n\n${formatted}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: ui.majorAchievementsLabel, badge: isEn ? 'Achievements' : 'أبرز الإنجازات', content: achievements }); }
                                                    )}
                                                </div>
                                                <div className="space-y-2.5 pt-1">
                                                    {achievements.map((achieve, idx) => (
                                                        <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                            <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 border-0" style={itemBadge3DStyle}>
                                                                {idx + 1}
                                                            </span>
                                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>{achieve}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Passing & Final Testament */}
                                    {(() => {
                                        const cardTitle = isEn ? 'Passing & Final Will' : 'وفاته واستشهاده ووصيته';
                                        const sub = isEn ? 'Passing & Will' : 'وفاته ووصيته الأخيرة';
                                        const deathText = isEn ? selectedCompanion.passingAndTributes.deathDetailsEn : selectedCompanion.passingAndTributes.deathDetailsAr;
                                        const lastWords = isEn ? selectedCompanion.passingAndTributes.lastWordsEn : selectedCompanion.passingAndTributes.lastWordsAr;
                                        const resting = isEn ? selectedCompanion.passingAndTributes.restingPlaceEn : selectedCompanion.passingAndTributes.restingPlaceAr;
                                        const full = `${deathText}\n\n• ${ui.lastWordsLabel}\n"${lastWords}"\n\n• ${ui.burialLabel}\n${resting}`;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2.5 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={cardTitle} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: full, category: sub, source: resting }, e),
                                                        (e) => handleCopySectionText(`${cardTitle}\n\n${full}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, content: full }); }
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 ${isEn ? 'font-sans' : 'font-amiri'}`}>{deathText}</p>
                                                <div className={`p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                    <span className="text-[11px] font-bold block mb-1" style={{ color: themeHeadingColor }}>{ui.lastWordsLabel}</span>
                                                    <p className={`text-xs sm:text-sm font-bold italic ${isEn ? 'font-sans' : 'font-amiri'}`}>{lastWords}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Civilizational & Institutional Impact Card */}
                                    {extraSections && extraSections.civilizationalImpactAr && extraSections.civilizationalImpactAr.length > 0 && (() => {
                                        const list = isEn ? extraSections.civilizationalImpactEn : extraSections.civilizationalImpactAr;
                                        const sub = isEn ? 'Civilizational Impact' : 'الأثر الحضاري والمؤسسي';
                                        const formatted = list.map((c, i) => `🏛️ ${i + 1}. ${c}`);
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Civilizational & Institutional Legacy' : 'الأثر الحضاري والتأسيسي الممتد للأمة'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: list.map((c, i) => `${i + 1}. ${c}`).join('\n\n'), category: sub, source: isEn ? 'Enduring Legacy' : 'أثر حضاري' }, e),
                                                        (e) => handleCopySectionText(`${sub}\n\n${list.map((c, i) => `${i + 1}. ${c}`).join('\n')}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Enduring Legacy' : 'أثر حضاري', icon: 'fa-solid fa-landmark', content: formatted }); }
                                                    )}
                                                </div>
                                                <div className="space-y-2.5">
                                                    {list.map((impact, idx) => (
                                                        <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                            <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 border-0" style={itemBadge3DStyle}>
                                                                {idx + 1}
                                                            </span>
                                                            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isEn ? 'font-sans' : 'font-amiri'}`}>{impact}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* TAB 6: FAITH LESSONS */}
                            {detailTab === 'lessons' && (
                                <div className="space-y-3">
                                    {/* Spiritual & Faith Lessons Card */}
                                    {extraSections && extraSections.spiritualLessonsAr && extraSections.spiritualLessonsAr.length > 0 && (() => {
                                        const list = isEn ? extraSections.spiritualLessonsEn : extraSections.spiritualLessonsAr;
                                        const sub = isEn ? 'Spiritual Lessons' : 'الدروس الروحية والإيمانية';
                                        const formatted = list.map((l, i) => `✨ ${i + 1}. ${l}`);
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Spiritual & Faith Lessons' : 'الدروس الإيمانية والروحية العميقة'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: list.map((l, i) => `${i + 1}. ${l}`).join('\n\n'), category: sub, source: isEn ? 'Faith & Spirit' : 'إيمانيات' }, e),
                                                        (e) => handleCopySectionText(`${sub}\n\n${list.map((l, i) => `${i + 1}. ${l}`).join('\n')}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Faith & Spirit' : 'إيمانيات', icon: 'fa-solid fa-heart', content: formatted }); }
                                                    )}
                                                </div>
                                                <div className="space-y-2.5">
                                                    {list.map((lesson, idx) => (
                                                        <div key={idx} className={`flex items-start gap-3 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                            <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border-0" style={itemBadge3DStyle}>
                                                                {idx + 1}
                                                            </span>
                                                            <p className={`text-xs sm:text-sm leading-relaxed font-semibold ${isEn ? 'font-sans' : 'font-amiri'}`}>{lesson}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Leadership & Character Lessons Card */}
                                    {extraSections && extraSections.leadershipLessonsAr && extraSections.leadershipLessonsAr.length > 0 && (() => {
                                        const list = isEn ? extraSections.leadershipLessonsEn : extraSections.leadershipLessonsAr;
                                        const sub = isEn ? 'Leadership Lessons' : 'الدروس القيادية والإدارية';
                                        const formatted = list.map((l, i) => `🛡️ ${i + 1}. ${l}`);
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Leadership, Management & Character' : 'الدروس القيادية والإدارية وبناء الشخصية'} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: list.map((l, i) => `${i + 1}. ${l}`).join('\n\n'), category: sub, source: isEn ? 'Leadership' : 'القيادة الراشدة' }, e),
                                                        (e) => handleCopySectionText(`${sub}\n\n${list.map((l, i) => `${i + 1}. ${l}`).join('\n')}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Leadership' : 'القيادة الراشدة', icon: 'fa-solid fa-chess-knight', content: formatted }); }
                                                    )}
                                                </div>
                                                <div className="space-y-2.5">
                                                    {list.map((lesson, idx) => (
                                                        <div key={idx} className={`flex items-start gap-3 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                            <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border-0" style={itemBadge3DStyle}>
                                                                {idx + 1}
                                                            </span>
                                                            <p className={`text-xs sm:text-sm leading-relaxed font-semibold ${isEn ? 'font-sans' : 'font-amiri'}`}>{lesson}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* General Inspirational Lessons */}
                                    {(() => {
                                        const list = isEn ? selectedCompanion.inspirationalLessonsEn : selectedCompanion.inspirationalLessonsAr;
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={ui.tabLessons} baseFontSize={14} minFontSize={9} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: list.map((l, i) => `${i + 1}. ${l}`).join('\n\n'), category: ui.tabLessons, source: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr }, e),
                                                        (e) => handleCopySectionText(`${ui.tabLessons}\n\n${list.map((l, i) => `${i + 1}. ${l}`).join('\n')}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: ui.tabLessons, content: list }); }
                                                    )}
                                                </div>
                                                <div className="space-y-2.5">
                                                    {list.map((lesson, idx) => (
                                                        <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-[14px] ${innerSubBoxClass}`}>
                                                            <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border-0" style={itemBadge3DStyle}>
                                                                {idx + 1}
                                                            </span>
                                                            <p className={`text-xs sm:text-sm leading-relaxed font-semibold ${isEn ? 'font-sans' : 'font-amiri'}`}>{lesson}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Modern Application & Daily Emulation Plan Card */}
                                    {extraSections && extraSections.modernApplicationAr && extraSections.modernApplicationAr.length > 0 && (() => {
                                        const list = isEn ? extraSections.modernApplicationEn : extraSections.modernApplicationAr;
                                        const sub = isEn ? 'Modern Application' : 'كيف نقتدي به اليوم';
                                        const formatted = list.map((m, i) => `🎯 ${i + 1}. ${m}`);
                                        return (
                                            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 relative overflow-visible transition-all">
                                                <div className="flex items-center justify-between gap-2 pb-2.5 app-3d-divider overflow-visible">
                                                    <h4 className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                        <AutoFitSingleLine as="span" text={isEn ? 'Modern Action Plan: Emulating Him Today' : 'خطة عمل وتطبيق معاصر: كيف نقتدي به اليوم في حياتنا؟'} baseFontSize={14} minFontSize={8.5} textScale={cardTextScale} className="min-w-0 flex-1" />
                                                    </h4>
                                                    {renderCardActions(
                                                        (e) => handleShareSectionImage({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, text: list.map((m, i) => `${i + 1}. ${m}`).join('\n\n'), category: sub, source: isEn ? 'Action Plan' : 'خطة عمل معاصرة' }, e),
                                                        (e) => handleCopySectionText(`${sub}\n\n${list.map((m, i) => `${i + 1}. ${m}`).join('\n')}`, e),
                                                        (e) => { e.stopPropagation(); setZoomedCard({ title: isEn ? selectedCompanion.nameEn : selectedCompanion.nameAr, subtitle: sub, badge: isEn ? 'Action Plan' : 'خطة عمل معاصرة', icon: 'fa-solid fa-sparkles', content: formatted }); }
                                                    )}
                                                </div>
                                                <div className="space-y-2.5">
                                                    {list.map((app, idx) => (
                                                        <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-[14px] ${innerSubBoxClass}`}>
                                                            <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 border-0" style={itemBadge3DStyle}>
                                                                {idx + 1}
                                                            </span>
                                                            <p className={`text-xs sm:text-sm leading-relaxed font-semibold ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ color: tokens.isDark ? '#F1F5F9' : '#0F172A' }}>
                                                                {app}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
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
                                    <span className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'}`}>{isEn ? 'Previous Companion' : 'الصحابي السابق'}</span>
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
                                    <span className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'}`}>{isEn ? 'Next Companion' : 'الصحابي التالي'}</span>
                                </button>
                            ) : <div />}
                        </div>
                    </div>
                </div>
            )}
        </main>

            {/* Zoom Modal - Matches identical style & behavior of Adia & Adkar */}
                {zoomedCard && (
                    <div 
                        className="fixed inset-0 bg-black/65 z-[120] flex flex-col justify-end select-none"
                        onClick={() => setZoomedCard(null)}
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <div 
                            className="app-page-card border-0 w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[88dvh] overflow-hidden relative bg-white dark:bg-[#1E293B]"
                            style={{ 
                                fontFamily: isEn ? 'sans-serif' : theme.font,
                                color: 'var(--text-color)',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Top Drag Handle without X button */}
                            <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                                <div className="app-3d-drag-handle w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 mb-2" />
                                <div className="w-full flex items-center justify-center">
                                    <span 
                                        className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold"
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
                                        className={`text-base sm:text-lg font-bold ${isEn ? 'font-sans' : 'font-cairo'} text-center leading-snug`}
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
                        </div>
                    </div>
                )}

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
