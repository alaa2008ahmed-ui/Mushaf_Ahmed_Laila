import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { 
    DIVINE_MIRACLES_DATA, 
    DIVINE_MIRACLES_CATEGORIES, 
    DivineMiracleItem 
} from '../data/divineMiraclesData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { shareAsImage } from '../utils/shareAsImage';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { markPageAsSeen } from '../utils/badgeManager';
import { 
    ZoomIn, 
    ArrowLeft, 
    ArrowRight, 
    Share2, 
    Copy, 
    Check, 
    ChevronDown
} from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { DIVINE_MIRACLES_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';
import { getToast3DStyles } from '../utils/toast3DStyles';

interface DivineMiraclesProps {
    onBack?: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
}

interface ZoomedCardData {
    title: string;
    subtitle?: string;
    badge?: string;
    content: string;
    quranEvidence?: {
        ayah: string;
        surah: string;
        number: string | number;
    };
    hadithEvidence?: {
        matn: string;
        narrator: string;
        source: string;
    };
    fact?: string;
    sources?: string[];
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

const DivineMiracles: React.FC<DivineMiraclesProps> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';

    // Modern Flat Design Tokens
    const tokens = useMemo(() => getModernFlatTokens(theme, themeKey), [theme, themeKey]);
    const isEffectiveDark = isNightMode || tokens.isDark || themeKey === 'black_gold' || themeKey === 'deep_black' || theme.bgColor === '#000000';
    const { 
        primaryColor, 
        themeActiveTextColor, 
        pageBgColor
    } = tokens;
    const themeHeadingColor = (tokens.isDeepBlack || (isEffectiveDark && (themeKey === 'deep_black' || theme.bgColor === '#000000'))) ? '#FFFFFF' : primaryColor;
    const innerSubBoxClass = `app-inner-3d-box border-0 ${tokens.isDeepBlack ? 'bg-[#18181b]' : 'bg-white dark:bg-[#0F172A]/85'}`;
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
    const [activeTab, setActiveTab] = useState<string>('all');
    const [selectedItem, setSelectedItem] = useState<DivineMiracleItem | null>(null);

    // Zoom modal state for focused reading
    const [zoomedCard, setZoomedCard] = useState<ZoomedCardData | null>(null);
    const [copiedModal, setCopiedModal] = useState(false);
    const [zoomFontSize, setZoomFontSize] = useState<number>(20);
    const [toastMessage, setToastMessage] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    // Text scaling for cards ONLY without scaling tabs or buttons
    const [cardTextScale, setCardTextScale] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('divineMiraclesTextScale');
            return saved ? parseFloat(saved) : 1;
        } catch {
            return 1;
        }
    });

    const toggleCardTextScale = () => {
        setCardTextScale(prev => {
            const next = prev >= 1.45 ? 1 : Number((prev + 0.15).toFixed(2));
            try {
                localStorage.setItem('divineMiraclesTextScale', String(next));
            } catch {}
            return next;
        });
    };

    // Spotlight Guide state (opens once on first app usage or when clicked)
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('divine-miracles');
        if (!getGuideSeen('divine_miracles_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);

    // Check nav params
    useEffect(() => {
        if (navParams?.itemId || navParams?.highlightId) {
            const targetId = navParams.itemId || navParams.highlightId;
            const found = DIVINE_MIRACLES_DATA.find(i => i.id === targetId);
            if (found) {
                setSelectedItem(found);
            }
        }
    }, [navParams]);

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
        if (!selectedItem && restoreScrollTargetRef.current !== null) {
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
    }, [selectedItem?.id, activeTab]);

    useLayoutEffect(() => {
        if (zoomedCard && zoomScrollRef.current) {
            zoomScrollRef.current.scrollTop = 0;
        }
    }, [zoomedCard]);

    const handleSelectItem = useCallback((item: DivineMiracleItem) => {
        if (!selectedItem && mainScrollRef.current) {
            savedListScrollTopRef.current = mainScrollRef.current.scrollTop;
        }
        restoreScrollTargetRef.current = null;
        setSelectedItem(item);
    }, [selectedItem]);

    // Prev / Next Miracle Navigation
    const currentIndex = useMemo(() => {
        if (!selectedItem) return -1;
        return DIVINE_MIRACLES_DATA.findIndex(i => i.id === selectedItem.id);
    }, [selectedItem?.id]);

    const prevItem = currentIndex > 0 ? DIVINE_MIRACLES_DATA[currentIndex - 1] : null;
    const nextItem = currentIndex >= 0 && currentIndex < DIVINE_MIRACLES_DATA.length - 1
        ? DIVINE_MIRACLES_DATA[currentIndex + 1]
        : null;

    // Handle back button clicks
    const handleBackClick = useCallback(() => {
        if (zoomedCard) {
            setZoomedCard(null);
            return;
        }
        if (selectedItem) {
            restoreScrollTargetRef.current = savedListScrollTopRef.current;
            setSelectedItem(null);
            return;
        }
        if (activeTab !== 'all') {
            restoreScrollTargetRef.current = null;
            setActiveTab('all');
            scrollToTop();
            return;
        }
        if (onBack) {
            onBack();
        } else {
            onNavigate('home');
        }
    }, [zoomedCard, selectedItem, activeTab, onBack, onNavigate, scrollToTop]);

    // Intercept hardware/gesture back button
    useEffect(() => {
        const interceptor = () => {
            if (zoomedCard) {
                setZoomedCard(null);
                return true;
            }
            if (selectedItem) {
                restoreScrollTargetRef.current = savedListScrollTopRef.current;
                setSelectedItem(null);
                return true;
            }
            if (activeTab !== 'all') {
                restoreScrollTargetRef.current = null;
                setActiveTab('all');
                scrollToTop();
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedCard, selectedItem, activeTab, scrollToTop]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (zoomedCard) setZoomedCard(null);
                else if (selectedItem) {
                    restoreScrollTargetRef.current = savedListScrollTopRef.current;
                    setSelectedItem(null);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomedCard, selectedItem]);

    // Filter items
    const filteredItems = useMemo(() => {
        if (activeTab === 'all') {
            return [...DIVINE_MIRACLES_DATA];
        }
        return DIVINE_MIRACLES_DATA.filter(item => item.category === activeTab);
    }, [activeTab]);

    // Copy Item
    const handleCopyItem = (item: DivineMiracleItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const title = isEn ? item.titleEn : item.titleAr;
        const summary = isEn ? item.summaryEn : item.summaryAr;
        const desc = isEn ? item.descriptionEn : item.descriptionAr;
        const fact = isEn ? item.scientificOrHistoricalFactEn : item.scientificOrHistoricalFactAr;

        let text = `✨ *${title}*\n\n`;
        text += `📌 ${summary}\n\n`;
        text += `📖 *${isEn ? 'Detailed Explanation' : 'الشرح والبيان'}:*\n${desc}\n\n`;

        if (item.quranEvidence) {
            const q = item.quranEvidence;
            text += `📜 *${isEn ? 'Quranic Evidence' : 'الدليل من القرآن الكريم'}:*\n`;
            text += isEn ? `"${q.ayahEn}"\n[${q.surahEn}: ${q.ayahNumber}]\n\n` : `﴿${q.ayahAr}﴾\n[${q.surahAr}: ${q.ayahNumber}]\n\n`;
        }

        if (item.hadithEvidence) {
            const h = item.hadithEvidence;
            text += `🌟 *${isEn ? 'Prophetic Hadith' : 'الدليل من السنة النبوية'}:*\n`;
            text += isEn ? `"${h.matnEn}"\nNarrator: ${h.narratorEn} (${h.sourceEn})\n\n` : `«${h.matnAr}»\nرواه: ${h.narratorAr} (${h.sourceAr})\n\n`;
        }

        if (fact) {
            text += `🔬 *${isEn ? 'Scientific / Historical Fact' : 'الحقيقة العلمية / التاريخية'}:*\n${fact}\n\n`;
        }

        text += isEn ? 'Shared from Mushaf Ahmed & Laila App' : 'مشارك من تطبيق مصحف أحمد و ليلى';

        navigator.clipboard.writeText(text).then(() => {
            showToast(isEn ? 'Copied to clipboard ✨' : 'تم النسخ بنجاح ✨');
        }).catch(() => {
            showToast(isEn ? 'Failed to copy' : 'تعذر النسخ');
        });
    };

    // Share Item as Image Card
    const handleShareItemImage = async (item: DivineMiracleItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isSharing) return;
        setIsSharing(true);

        try {
            const title = isEn ? item.titleEn : item.titleAr;
            const desc = isEn ? item.descriptionEn : item.descriptionAr;
            let body = isEn ? `${item.summaryEn}\n\n${desc}` : `${item.summaryAr}\n\n${desc}`;
            
            if (item.quranEvidence) {
                body += isEn 
                    ? `\n\n📖 Quran: "${item.quranEvidence.ayahEn}" [${item.quranEvidence.surahEn}: ${item.quranEvidence.ayahNumber}]`
                    : `\n\n📖 قال تعالى: ﴿${item.quranEvidence.ayahAr}﴾ [${item.quranEvidence.surahAr}: ${item.quranEvidence.ayahNumber}]`;
            }

            if (item.scientificOrHistoricalFactAr && !isEn) {
                body += `\n\n🔬 الحقيقة العلمية: ${item.scientificOrHistoricalFactAr}`;
            } else if (item.scientificOrHistoricalFactEn && isEn) {
                body += `\n\n🔬 Scientific Fact: ${item.scientificOrHistoricalFactEn}`;
            }

            const category = isEn ? 'Divine Miracles' : 'المعجزات الإلهية';
            const source = item.quranEvidence 
                ? (isEn ? `${item.quranEvidence.surahEn}: ${item.quranEvidence.ayahNumber}` : `${item.quranEvidence.surahAr}: ${item.quranEvidence.ayahNumber}`)
                : (item.hadithEvidence ? (isEn ? item.hadithEvidence.sourceEn : item.hadithEvidence.sourceAr) : undefined);

            await shareAsImage({
                title,
                text: body,
                category,
                source,
                theme,
                isEn,
                language: isEn ? 'en' : 'ar',
                setToastMessage: (msg: string) => showToast(msg)
            });
        } catch (error) {
            console.error('Error sharing miracle card:', error);
            showToast(isEn ? 'Failed to share card' : 'تعذر مشاركة البطاقة');
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopySection = (text: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            showToast(isEn ? 'Copied to clipboard ✨' : 'تم النسخ بنجاح ✨');
        }).catch(() => {
            showToast(isEn ? 'Failed to copy' : 'تعذر النسخ');
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
                category: opts.category || (isEn ? 'Divine Miracles' : 'المعجزات الإلهية'),
                source: opts.source,
                theme,
                isEn,
                language: isEn ? 'en' : 'ar',
                setToastMessage: (msg: string) => showToast(msg)
            });
        } catch (error) {
            console.error('Error sharing section card:', error);
            showToast(isEn ? 'Failed to share card' : 'تعذر مشاركة البطاقة');
        } finally {
            setIsSharing(false);
        }
    };

    const buildItemZoomData = (item: DivineMiracleItem): ZoomedCardData => ({
        title: isEn ? item.titleEn : item.titleAr,
        subtitle: isEn ? item.badgeEn : item.badgeAr,
        content: isEn ? item.descriptionEn : item.descriptionAr,
        quranEvidence: item.quranEvidence ? {
            ayah: isEn ? item.quranEvidence.ayahEn : item.quranEvidence.ayahAr,
            surah: isEn ? item.quranEvidence.surahEn : item.quranEvidence.surahAr,
            number: item.quranEvidence.ayahNumber
        } : undefined,
        hadithEvidence: item.hadithEvidence ? {
            matn: isEn ? item.hadithEvidence.matnEn : item.hadithEvidence.matnAr,
            narrator: isEn ? item.hadithEvidence.narratorEn : item.hadithEvidence.narratorAr,
            source: isEn ? item.hadithEvidence.sourceEn : item.hadithEvidence.sourceAr
        } : undefined,
        fact: isEn ? item.scientificOrHistoricalFactEn : item.scientificOrHistoricalFactAr,
        sources: isEn ? item.sourcesEn : item.sourcesAr
    });

    const renderActionButtons = (
        onShare: (e: React.MouseEvent) => void,
        onCopy: (e: React.MouseEvent) => void,
        onZoom: (e: React.MouseEvent) => void
    ) => (
        <div className="flex items-center gap-2 shrink-0 overflow-visible">
            <button
                type="button"
                onClick={onShare}
                disabled={isSharing}
                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                style={{ color: 'var(--text-color)' }}
                title={isEn ? "Share as image" : "مشاركة كبطاقة"}
                aria-label={isEn ? "Share as image" : "مشاركة كبطاقة"}
            >
                {isSharing ? <i className="fa-solid fa-circle-notch fa-spin text-xs"></i> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
                type="button"
                onClick={onCopy}
                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                style={{ color: 'var(--text-color)' }}
                title={isEn ? "Copy" : "نسخ"}
                aria-label={isEn ? "Copy" : "نسخ"}
            >
                <i className="fa-regular fa-copy text-xs"></i>
            </button>
            <button
                type="button"
                onClick={onZoom}
                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                style={{ color: 'var(--text-color)' }}
                title={isEn ? "Open card modal" : "تكبير وقراءة البطاقة"}
                aria-label={isEn ? "Open card modal" : "تكبير وقراءة البطاقة"}
            >
                <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
            </button>
        </div>
    );

    // Calculate concise dynamic page title to prevent any overlap with top bar buttons
    const shortHeaderTitle = useMemo(() => {
        if (!selectedItem) {
            return isEn ? 'Divine Miracles' : 'المعجزات الإلهية';
        }
        const shortMapAr: Record<string, string> = {
            'cosmological_causality': 'برهان السببية والنشأة',
            'fine_tuning_universe': 'برهان الضبط الدقيق',
            'biological_dna_design': 'برهان الشيفرة الوراثية',
            'fitrah_moral_consciousness': 'برهان الفطرة والوعي',
            'cosmological_infinite_regress': 'استحالة تسلسل الفاعلين',
            'mathematical_teleology_laws': 'الاتساق الرياضي للكون',
            'abiogenesis_life_origin': 'سر الحياة والخلية',

            'illiterate_prophet_environment': 'أميّة النبي ﷺ وبيئته',
            'historical_hieroglyphs_egypt': 'تاريخ مصر وهامان',
            'quranic_preservation_challenge': 'إعجاز القرآن والعتاب',
            'pharaoh_body_preservation': 'نجاة بدن فرعون',
            'egypt_ruler_king_vs_pharaoh': 'ملك يوسف وفرعون موسى',
            'incoherence_absence_challenge': 'تماسك النص وعدم الاختلاف',
            'universal_literary_challenge': 'تحدي أقصر سورة',

            'expanding_universe': 'اتساع وتمدد الكون',
            'iron_sent_down_space': 'إنزال الحديد من السماء',
            'embryology_stages': 'أطوار الجنين البشري',
            'mountains_pegs_roots': 'أوتاد الجبال ورسوها',
            'ocean_barriers_deep_darkness': 'برزخ البحار والأمواج',
            'frontal_lobe_nasiyah': 'الناصية ومركز التحكم',
            'scientific-fire-tornado': 'إعصار فيه نار',
            'big_bang_ratq_fatq': 'الرتق والفتق الكوني',
            'atmosphere_safe_roof_raj': 'السقف المحفوظ والرَّجْع',
            'high_altitude_hypoxia': 'ضيق الصدر عند الصعود',
            'fingerprints_dermatoglyphics': 'تسوية بصمات البنان',
            'winds_fecundating_clouds': 'رياح اللواقح والمطر',
            'space_darkness_rotation': 'ظلمات الفضاء والتكوير',

            'prophecy_romans_victory': 'غلبة الروم في أدنى الأرض',
            'prophecy_tall_buildings_arabia': 'تطاول الرعاة في البنيان',
            'prophecy_arabia_green_rivers': 'جزيرة العرب مروجاً',
            'prophecy_smart_devices_communication': 'نبوءة نطق الجماد والفخذ',
            'prophecy_constantinople_rome': 'فتح القدس والقسطنطينية',
            'prophecy_euphrates_drying': 'انحسار نهر الفرات',
            'prophecy_spread_usury_commerce': 'فشو التجارة وغبار الربا',
            'prophecy_chariots_iron_mounts': 'مراكب الحديد وتقارب الأسواق',
            'prophecy_fall_persia_rome': 'سقوط كسرى وقيصر',

            'quran_neurology_peace': 'أثر القرآن على الدماغ',
            'quran_textual_preservation_memory': 'حفظ القرآن في الصدور',
            'islamic_preventive_health_hygiene': 'التشريع الوقائي والصيام',
            'economic_justice_wealth_distribution': 'منع احتكار الثروة والمواريث',
            'psychological_cure_heart_peace': 'الشفاء النفسي والسكينة',
            'universal_human_equality': 'المساواة ودحر العنصرية'
        };

        const shortMapEn: Record<string, string> = {
            'cosmological_causality': 'Cosmic Causality',
            'fine_tuning_universe': 'Fine-Tuning Proof',
            'biological_dna_design': 'DNA Genetic Code',
            'fitrah_moral_consciousness': 'Inborn Fitrah Proof',
            'cosmological_infinite_regress': 'Infinite Regress',
            'mathematical_teleology_laws': 'Mathematical Order',
            'abiogenesis_life_origin': 'Origin of Life',

            'illiterate_prophet_environment': 'Unlettered Prophet',
            'historical_hieroglyphs_egypt': 'Ancient Egypt & Haman',
            'quranic_preservation_challenge': 'Inimitability & Proofs',
            'pharaoh_body_preservation': 'Pharaoh\'s Body Saved',
            'egypt_ruler_king_vs_pharaoh': 'King vs. Pharaoh',
            'incoherence_absence_challenge': 'Textual Coherence',
            'universal_literary_challenge': 'Shortest Surah Challenge',

            'expanding_universe': 'Cosmic Expansion',
            'iron_sent_down_space': 'Iron Sent Down',
            'embryology_stages': 'Embryology Stages',
            'mountains_pegs_roots': 'Mountains as Pegs',
            'ocean_barriers_deep_darkness': 'Deep Ocean Waves',
            'frontal_lobe_nasiyah': 'Frontal Lobe Control',
            'scientific-fire-tornado': 'Fire Whirl & Tornado',
            'big_bang_ratq_fatq': 'Cosmic Singularity & Water',
            'atmosphere_safe_roof_raj': 'Protected Atmosphere',
            'high_altitude_hypoxia': 'High Altitude Hypoxia',
            'fingerprints_dermatoglyphics': 'Fingertip Biometrics',
            'winds_fecundating_clouds': 'Fecundating Winds',
            'space_darkness_rotation': 'Space Darkness & Orbit',

            'prophecy_romans_victory': 'Byzantine Victory',
            'prophecy_tall_buildings_arabia': 'Bedouins & Towers',
            'prophecy_arabia_green_rivers': 'Green Arabia Rivers',
            'prophecy_smart_devices_communication': 'Smart Devices Prophecy',
            'prophecy_constantinople_rome': 'Jerusalem & Constantinople',
            'prophecy_euphrates_drying': 'Euphrates Desiccation',
            'prophecy_spread_usury_commerce': 'Global Usury & Commerce',
            'prophecy_chariots_iron_mounts': 'Iron Mounts & Markets',
            'prophecy_fall_persia_rome': 'Fall of Persia & Rome',

            'quran_neurology_peace': 'Neurological Healing',
            'quran_textual_preservation_memory': 'Quran Memorization',
            'islamic_preventive_health_hygiene': 'Preventive Health',
            'economic_justice_wealth_distribution': 'Quranic Economics',
            'psychological_cure_heart_peace': 'Psychological Peace',
            'universal_human_equality': 'Universal Human Equality'
        };

        if (isEn) {
            return shortMapEn[selectedItem.id] || selectedItem.badgeEn || selectedItem.titleEn;
        }
        return shortMapAr[selectedItem.id] || selectedItem.badgeAr || selectedItem.titleAr;
    }, [selectedItem, isEn]);

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

            {/* Standard Top Header Bar - Structured with bounded flexbox so title never collides with side controls */}
            <header className="app-top-bar z-20 shrink-0">
                <div className="app-top-bar__inner !px-2.5 sm:!px-4">
                    <div className="flex items-center justify-between gap-1 w-full min-h-[44px]">
                        {/* Start Controls: Back & Magnifier Zoom Button */}
                        <div className="flex items-center gap-0.5 shrink-0">
                            <button
                                type="button"
                                onClick={handleBackClick}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Go Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                            >
                                {isEn ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                            </button>
                            
                            {/* Magnifying Glass to scale text of cards without scaling tabs */}
                            <button
                                id="divine-miracles-zoom-toggle-btn"
                                type="button"
                                onClick={toggleCardTextScale}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer relative"
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

                        {/* Title in center - strictly bounded between buttons, zero overlap */}
                        <div className="flex-1 min-w-0 flex items-center justify-center px-1 text-center overflow-hidden">
                            <h1 
                                className={`app-top-bar__title ${isEn ? 'font-bold' : 'font-cairo'} truncate leading-snug`}
                                style={{
                                    fontSize: selectedItem 
                                        ? 'clamp(0.78rem, 2.9vw, 0.95rem)' 
                                        : 'clamp(0.95rem, 3.8vw, 1.2rem)'
                                }}
                            >
                                {shortHeaderTitle}
                            </h1>
                        </div>

                        {/* End Controls: Guide (shown ONLY on first page when !selectedItem) + Home */}
                        <div className="flex items-center gap-0.5 shrink-0">
                            {!selectedItem && (
                                <button
                                    type="button"
                                    onClick={() => setShowGuide(true)}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    style={{ color: 'var(--top-bar-text, inherit)' }}
                                    title={isEn ? "Page Guide" : "دليل المعجزات الإلهية"}
                                    aria-label={isEn ? "Page Guide" : "دليل المعجزات الإلهية"}
                                >
                                    <i className="fa-solid fa-circle-question text-lg"></i>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => onNavigate('home')}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Home" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Specialized Unscaled Tabs Nav - Mounted outside <main> directly beneath top bar */}
            {!selectedItem && (
                <div 
                    id="divine-miracles-tabs-nav"
                    className="shrink-0 z-10 px-3 sm:px-4 pt-2.5 pb-3 border-0"
                    style={{ backgroundColor: pageBgColor }}
                >
                    <div className="max-w-3xl mx-auto">
                        <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-2xl p-1 overflow-visible">
                            <div className="flex items-center gap-1.5 overflow-x-auto p-0.5 hide-scrollbar">
                                {DIVINE_MIRACLES_CATEGORIES.map((cat) => {
                                    const isSelected = activeTab === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                restoreScrollTargetRef.current = null;
                                                setActiveTab(cat.id);
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-0 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                                                isSelected ? 'active:translate-y-[1px]' : 'wird-inner-raised opacity-85 hover:opacity-100'
                                            } ${isEn ? 'font-sans' : 'font-cairo'}`}
                                            style={{
                                                backgroundColor: isSelected ? primaryColor : undefined,
                                                color: isSelected ? themeActiveTextColor : (tokens.isDark ? '#CBD5E1' : '#475569'),
                                                boxShadow: isSelected
                                                    ? '0 4px 0 rgba(0, 0, 0, 0.2), 0 7px 14px -2px rgba(0, 0, 0, 0.14), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.35)'
                                                    : undefined
                                            }}
                                        >
                                            <span>{isEn ? cat.titleEn : cat.titleAr}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main 
                ref={mainScrollRef} 
                className="flex-1 min-h-0 overflow-y-auto hide-scrollbar relative max-w-3xl mx-auto w-full px-3.5 sm:px-4 app-scroll-safe pt-1"
            >
                {/* VIEW 1: Detailed Item View */}
                {selectedItem ? (
                    <div className="space-y-4">
                        {/* Header Banner Card */}
                        <div 
                            className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] p-5 sm:p-6 text-start relative overflow-visible"
                        >
                            <div className="flex items-center justify-end gap-2 mb-3 overflow-visible">
                                {renderActionButtons(
                                    (e) => handleShareItemImage(selectedItem, e),
                                    (e) => handleCopyItem(selectedItem, e),
                                    (e) => {
                                        e.stopPropagation();
                                        setZoomedCard(buildItemZoomData(selectedItem));
                                    }
                                )}
                            </div>

                            <AutoFitSingleLine
                                as="h2"
                                text={isEn ? selectedItem.titleEn : selectedItem.titleAr}
                                baseFontSize={20}
                                smFontSize={22}
                                minFontSize={11}
                                textScale={cardTextScale}
                                className={`font-extrabold mb-3 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                style={{ color: themeHeadingColor }}
                            />

                            <p 
                                className="leading-relaxed opacity-90 font-medium"
                                style={{ 
                                    color: tokens.textColor, 
                                    fontSize: `${14.5 * cardTextScale}px` 
                                }}
                            >
                                {isEn ? selectedItem.summaryEn : selectedItem.summaryAr}
                            </p>
                        </div>

                        {/* Quran Evidence Card */}
                        {selectedItem.quranEvidence && (() => {
                            const q = selectedItem.quranEvidence!;
                            const sectionTitle = isEn ? 'Holy Quran Evidence' : 'الدليل والبرهان من القرآن الكريم';
                            const qText = isEn ? `"${q.ayahEn}"\n[${q.surahEn}: ${q.ayahNumber}]` : `﴿${q.ayahAr}﴾\n[${q.surahAr}: الآية ${q.ayahNumber}]`;
                            const qSource = isEn ? `${q.surahEn}: ${q.ayahNumber}` : `${q.surahAr}: الآية ${q.ayahNumber}`;
                            return (
                                <div 
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] p-5 text-start relative overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2.5 overflow-visible">
                                        <AutoFitSingleLine
                                            as="h3"
                                            text={sectionTitle}
                                            baseFontSize={13}
                                            minFontSize={9.5}
                                            textScale={cardTextScale}
                                            className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                            style={{ color: themeHeadingColor }}
                                        />
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                text: isEn ? `"${q.ayahEn}"` : `﴿${q.ayahAr}﴾`,
                                                category: sectionTitle,
                                                source: qSource
                                            }, e),
                                            (e) => handleCopySection(`${sectionTitle}\n${qText}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                    subtitle: sectionTitle,
                                                    badge: qSource,
                                                    content: '',
                                                    quranEvidence: {
                                                        ayah: isEn ? q.ayahEn : q.ayahAr,
                                                        surah: isEn ? q.surahEn : q.surahAr,
                                                        number: q.ayahNumber
                                                    }
                                                });
                                            }
                                        )}
                                    </div>

                                    <p 
                                        className={`leading-loose font-bold ${isEn ? 'font-sans' : 'font-amiri'}`}
                                        style={{ fontSize: `${18 * cardTextScale}px`, color: tokens.textColor }}
                                    >
                                        {isEn ? `"${q.ayahEn}"` : `﴿${q.ayahAr}﴾`}
                                    </p>

                                    <div className="mt-3 opacity-70 font-bold">
                                        <AutoFitSingleLine
                                            as="span"
                                            text={`[${qSource}]`}
                                            baseFontSize={12}
                                            minFontSize={7.5}
                                            textScale={cardTextScale}
                                            className="w-full"
                                            style={{ color: tokens.textColor }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Hadith Evidence Card */}
                        {selectedItem.hadithEvidence && (() => {
                            const h = selectedItem.hadithEvidence!;
                            const sectionTitle = isEn ? 'Prophetic Sunnah Evidence' : 'الدليل والبرهان من السنة النبوية';
                            const hText = isEn
                                ? `"${h.matnEn}"\nNarrated by: ${h.narratorEn} (${h.sourceEn})`
                                : `«${h.matnAr}»\nرواه: ${h.narratorAr} (${h.sourceAr})`;
                            const hSource = isEn ? `${h.narratorEn} • ${h.sourceEn}` : `${h.narratorAr} • ${h.sourceAr}`;
                            return (
                                <div 
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] p-5 text-start relative overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2.5 overflow-visible">
                                        <AutoFitSingleLine
                                            as="h3"
                                            text={sectionTitle}
                                            baseFontSize={13}
                                            minFontSize={9.5}
                                            textScale={cardTextScale}
                                            className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                            style={{ color: themeHeadingColor }}
                                        />
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                text: isEn ? `"${h.matnEn}"` : `«${h.matnAr}»`,
                                                category: sectionTitle,
                                                source: hSource
                                            }, e),
                                            (e) => handleCopySection(`${sectionTitle}\n${hText}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                    subtitle: sectionTitle,
                                                    badge: isEn ? h.sourceEn : h.sourceAr,
                                                    content: '',
                                                    hadithEvidence: {
                                                        matn: isEn ? h.matnEn : h.matnAr,
                                                        narrator: isEn ? h.narratorEn : h.narratorAr,
                                                        source: isEn ? h.sourceEn : h.sourceAr
                                                    }
                                                });
                                            }
                                        )}
                                    </div>

                                    <p 
                                        className="leading-relaxed font-semibold"
                                        style={{ fontSize: `${16 * cardTextScale}px`, color: tokens.textColor }}
                                    >
                                        {isEn ? `"${h.matnEn}"` : `«${h.matnAr}»`}
                                    </p>

                                    <div className="mt-2.5 opacity-70 font-medium">
                                        <AutoFitSingleLine
                                            as="span"
                                            text={isEn ? `Narrated by: ${hSource}` : `رواه: ${hSource}`}
                                            baseFontSize={12}
                                            minFontSize={7.5}
                                            textScale={cardTextScale}
                                            className="w-full"
                                            style={{ color: tokens.textColor }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Detailed Explanation */}
                        {(() => {
                            const sectionTitle = isEn ? 'Comprehensive Detailed Explanation' : 'الشرح والبيان المفصل';
                            const desc = isEn ? selectedItem.descriptionEn : selectedItem.descriptionAr;
                            return (
                                <div 
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] p-5 sm:p-6 text-start relative overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-3 overflow-visible">
                                        <AutoFitSingleLine
                                            as="h3"
                                            text={sectionTitle}
                                            baseFontSize={15}
                                            minFontSize={10}
                                            textScale={cardTextScale}
                                            className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                            style={{ color: themeHeadingColor }}
                                        />
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                text: desc,
                                                category: sectionTitle,
                                                source: isEn ? selectedItem.badgeEn : selectedItem.badgeAr
                                            }, e),
                                            (e) => handleCopySection(`${sectionTitle}\n\n${desc}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                    subtitle: sectionTitle,
                                                    badge: isEn ? selectedItem.badgeEn : selectedItem.badgeAr,
                                                    content: desc
                                                });
                                            }
                                        )}
                                    </div>

                                    <div 
                                        className="space-y-3 leading-relaxed whitespace-pre-line opacity-95"
                                        style={{ 
                                            color: tokens.textColor, 
                                            fontSize: `${14.5 * cardTextScale}px` 
                                        }}
                                    >
                                        {desc}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Scientific / Historical Fact Card */}
                        {(selectedItem.scientificOrHistoricalFactAr || selectedItem.scientificOrHistoricalFactEn) && (() => {
                            const sectionTitle = isEn ? 'Scientific / Historical Documentation' : 'التوثيق العلمي والتاريخي الحديث';
                            const factText = (isEn ? selectedItem.scientificOrHistoricalFactEn : selectedItem.scientificOrHistoricalFactAr) || '';
                            return (
                                <div 
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] p-5 text-start relative overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2.5 overflow-visible">
                                        <AutoFitSingleLine
                                            as="h3"
                                            text={sectionTitle}
                                            baseFontSize={13}
                                            minFontSize={9.5}
                                            textScale={cardTextScale}
                                            className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                            style={{ color: themeHeadingColor }}
                                        />
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                text: factText,
                                                category: sectionTitle,
                                                source: isEn ? selectedItem.badgeEn : selectedItem.badgeAr
                                            }, e),
                                            (e) => handleCopySection(`${sectionTitle}\n\n${factText}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                    subtitle: sectionTitle,
                                                    badge: isEn ? selectedItem.badgeEn : selectedItem.badgeAr,
                                                    content: factText
                                                });
                                            }
                                        )}
                                    </div>

                                    <p 
                                        className="leading-relaxed font-semibold"
                                        style={{ fontSize: `${14 * cardTextScale}px`, color: tokens.textColor }}
                                    >
                                        {factText}
                                    </p>
                                </div>
                            );
                        })()}

                        {/* Faith Reflections */}
                        {((isEn ? selectedItem.reflectionsEn : selectedItem.reflectionsAr) || []).length > 0 && (() => {
                            const sectionTitle = isEn ? 'Faith Lessons & Reflections' : 'دروس وإشراقات إيمانية';
                            const reflectionsList = (isEn ? selectedItem.reflectionsEn : selectedItem.reflectionsAr) || [];
                            const formattedReflections = reflectionsList.map((r, i) => `${i + 1}. ${r}`).join('\n');
                            return (
                                <div 
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] p-5 text-start relative overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-3 overflow-visible">
                                        <AutoFitSingleLine
                                            as="h4"
                                            text={sectionTitle}
                                            baseFontSize={14}
                                            minFontSize={9.5}
                                            textScale={cardTextScale}
                                            className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                            style={{ color: themeHeadingColor }}
                                        />
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                text: formattedReflections,
                                                category: sectionTitle,
                                                source: isEn ? selectedItem.badgeEn : selectedItem.badgeAr
                                            }, e),
                                            (e) => handleCopySection(`${sectionTitle}\n\n${formattedReflections}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                    subtitle: sectionTitle,
                                                    badge: isEn ? selectedItem.badgeEn : selectedItem.badgeAr,
                                                    content: formattedReflections
                                                });
                                            }
                                        )}
                                    </div>

                                    <ul className="space-y-2.5">
                                        {reflectionsList.map((r, i) => (
                                            <li 
                                                key={i} 
                                                className="flex items-start gap-2.5"
                                                style={{ fontSize: `${13.5 * cardTextScale}px`, color: tokens.textColor }}
                                            >
                                                <span 
                                                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5"
                                                    style={itemBadge3DStyle}
                                                >
                                                    {i + 1}
                                                </span>
                                                <span className="leading-relaxed opacity-90">{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })()}

                        {/* Sources & Citations */}
                        {(() => {
                            const sectionTitle = isEn ? 'Documented Sources & References:' : 'المصادر والمراجع الموثقة:';
                            const sourcesList = isEn ? selectedItem.sourcesEn : selectedItem.sourcesAr;
                            const formattedSources = sourcesList.map((s, i) => `${i + 1}. ${s}`).join('\n');
                            return (
                                <div 
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] p-4 sm:p-5 text-start relative overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2.5 overflow-visible">
                                        <AutoFitSingleLine
                                            as="h4"
                                            text={sectionTitle}
                                            baseFontSize={13}
                                            minFontSize={9}
                                            textScale={cardTextScale}
                                            className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                            style={{ color: themeHeadingColor }}
                                        />
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                text: formattedSources,
                                                category: isEn ? 'Documented Sources & References' : 'المصادر والمراجع الموثقة',
                                                source: isEn ? selectedItem.badgeEn : selectedItem.badgeAr
                                            }, e),
                                            (e) => handleCopySection(`${sectionTitle}\n${formattedSources}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: isEn ? selectedItem.titleEn : selectedItem.titleAr,
                                                    subtitle: isEn ? 'Documented Sources & References' : 'المصادر والمراجع الموثقة',
                                                    badge: isEn ? selectedItem.badgeEn : selectedItem.badgeAr,
                                                    content: '',
                                                    sources: sourcesList
                                                });
                                            }
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 overflow-visible pb-1">
                                        {sourcesList.map((s, idx) => (
                                            <span 
                                                key={idx}
                                                className={`text-[11px] px-2.5 py-1 rounded-lg font-mono ${innerSubBoxClass}`}
                                                style={{ color: tokens.textColor }}
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Bottom Prev / Next Miracle Navigation */}
                        <div className="grid grid-cols-2 gap-3 pt-2 pb-2">
                            {prevItem ? (
                                <button
                                    type="button"
                                    onClick={() => handleSelectItem(prevItem)}
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-[16px] flex items-center justify-center text-center transition-all cursor-pointer"
                                >
                                    <span className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                        {isEn ? 'Previous Miracle' : 'المعجزة السابقة'}
                                    </span>
                                </button>
                            ) : (
                                <div />
                            )}

                            {nextItem ? (
                                <button
                                    type="button"
                                    onClick={() => handleSelectItem(nextItem)}
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-[16px] flex items-center justify-center text-center transition-all cursor-pointer"
                                >
                                    <span className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                        {isEn ? 'Next Miracle' : 'المعجزة التالية'}
                                    </span>
                                </button>
                            ) : (
                                <div />
                            )}
                        </div>
                    </div>
                ) : (
                    /* VIEW 2: Grid / List of All Miracles */
                    <div className="space-y-4 pb-2">
                        {filteredItems.length === 0 ? (
                            <div 
                                className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] p-8 text-center"
                            >
                                <p className="text-sm font-bold opacity-75" style={{ color: tokens.textColor }}>
                                    {isEn ? 'No miracles found matching your search.' : 'لم يتم العثور على نتائج تطابق بحثك.'}
                                </p>
                            </div>
                        ) : (
                            filteredItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    id={`divine-miracle-card-${idx + 1}`}
                                    onClick={() => handleSelectItem(item)}
                                    className="app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] rounded-[18px] p-4 sm:p-5 text-start relative cursor-pointer overflow-visible group"
                                >
                                    {/* Action tools */}
                                    <div className="flex items-center justify-end gap-2 mb-2.5 overflow-visible">
                                        <button
                                            type="button"
                                            onClick={(e) => handleCopyItem(item, e)}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isEn ? "Copy" : "نسخ"}
                                            aria-label={isEn ? "Copy" : "نسخ"}
                                        >
                                            <i className="fa-regular fa-copy"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: isEn ? item.titleEn : item.titleAr,
                                                    subtitle: isEn ? item.badgeEn : item.badgeAr,
                                                    content: isEn ? item.descriptionEn : item.descriptionAr,
                                                    quranEvidence: item.quranEvidence ? {
                                                        ayah: isEn ? item.quranEvidence.ayahEn : item.quranEvidence.ayahAr,
                                                        surah: isEn ? item.quranEvidence.surahEn : item.quranEvidence.surahAr,
                                                        number: item.quranEvidence.ayahNumber
                                                    } : undefined,
                                                    hadithEvidence: item.hadithEvidence ? {
                                                        matn: isEn ? item.hadithEvidence.matnEn : item.hadithEvidence.matnAr,
                                                        narrator: isEn ? item.hadithEvidence.narratorEn : item.hadithEvidence.narratorAr,
                                                        source: isEn ? item.hadithEvidence.sourceEn : item.hadithEvidence.sourceAr
                                                    } : undefined,
                                                    fact: isEn ? item.scientificOrHistoricalFactEn : item.scientificOrHistoricalFactAr,
                                                    sources: isEn ? item.sourcesEn : item.sourcesAr
                                                });
                                            }}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isEn ? "Open card modal" : "تكبير وقراءة البطاقة"}
                                            aria-label={isEn ? "Open card modal" : "تكبير وقراءة البطاقة"}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleShareItemImage(item, e)}
                                            disabled={isSharing}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isEn ? "Share as image" : "مشاركة كبطاقة"}
                                            aria-label={isEn ? "Share as image" : "مشاركة كبطاقة"}
                                        >
                                            {isSharing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <Share2 className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>

                                    {/* Card Title */}
                                    <AutoFitSingleLine
                                        as="h3"
                                        text={isEn ? item.titleEn : item.titleAr}
                                        baseFontSize={16}
                                        smFontSize={18}
                                        minFontSize={9}
                                        textScale={cardTextScale}
                                        className={`font-bold mb-2 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                        style={{ color: themeHeadingColor }}
                                    />

                                    {/* Card Summary */}
                                    <p 
                                        className="leading-relaxed opacity-85 line-clamp-3 mb-3 font-medium"
                                        style={{ 
                                            color: tokens.textColor, 
                                            fontSize: `${13.5 * cardTextScale}px` 
                                        }}
                                    >
                                        {isEn ? item.summaryEn : item.summaryAr}
                                    </p>

                                    {/* Quran preview snippet */}
                                    {item.quranEvidence && (
                                        <div 
                                            className={`p-3 rounded-xl mb-2.5 text-center ${innerSubBoxClass}`}
                                            style={{ fontSize: `${13 * cardTextScale}px` }}
                                        >
                                            <p 
                                                className={`line-clamp-2 ${isEn ? 'font-sans font-semibold' : 'font-amiri font-bold'}`}
                                                style={{ color: themeHeadingColor }}
                                            >
                                                {isEn ? `"${item.quranEvidence.ayahEn}"` : `﴿${item.quranEvidence.ayahAr}﴾`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Footer source line */}
                                    <div className="pt-2 app-3d-divider-top opacity-75">
                                        <AutoFitSingleLine
                                            as="span"
                                            text={isEn ? (item.sourcesEn[0] || '') : (item.sourcesAr[0] || '')}
                                            baseFontSize={11}
                                            minFontSize={7.5}
                                            textScale={cardTextScale}
                                            className="font-mono w-full"
                                            style={{ color: tokens.textColor }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Focused Reading Modal (Zoomed Card - Bottom Sheet sliding up from bottom like Adia & Adhkar) */}
                {zoomedCard && (
                    <div 
                        className="fixed inset-0 z-[120] bg-black/65 flex flex-col justify-end select-none"
                        onClick={() => setZoomedCard(null)}
                        dir={isEn ? 'ltr' : 'rtl'}
                    >
                        <div 
                            className="app-page-card border-0 w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[88dvh] overflow-hidden relative bg-white dark:bg-[#1E293B]"
                            style={{ 
                                color: 'var(--text-color)',
                                fontFamily: isEn ? 'sans-serif' : theme.font 
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Top Drag Handle */}
                            <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                                <div className="app-3d-drag-handle w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 mb-2" />
                                <div className="w-full flex items-center justify-center">
                                    <span 
                                        className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold"
                                        style={{
                                            backgroundColor: hexToRgba(themeHeadingColor, 0.1),
                                            color: themeHeadingColor
                                        }}
                                    >
                                        {zoomedCard.subtitle || (isEn ? "Divine Miracles" : "المعجزات الإلهية")}
                                    </span>
                                </div>
                            </div>

                            {/* Centered Title */}
                            {zoomedCard.title && (
                                <h3 
                                    className={`text-base sm:text-lg font-bold ${isEn ? 'font-sans' : 'font-cairo'} text-center leading-snug px-6 pb-2`} 
                                    style={{ color: themeHeadingColor }}
                                >
                                    {zoomedCard.title}
                                </h3>
                            )}

                            {/* Modal Scrollable Body */}
                            <div ref={zoomScrollRef} className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-4 space-y-4">
                                {zoomedCard.quranEvidence && (
                                    <div 
                                        className={`p-4 rounded-xl ${innerSubBoxClass}`}
                                    >
                                        <span className="text-xs font-bold block mb-1" style={{ color: themeHeadingColor }}>
                                            {isEn ? 'Holy Quran' : 'القرآن الكريم'}:
                                        </span>
                                        <p 
                                            className={`leading-relaxed ${isEn ? 'font-sans' : 'font-amiri font-bold'}`}
                                            style={{ fontSize: `${zoomFontSize + 4}px`, color: tokens.textColor }}
                                        >
                                            {isEn ? `"${zoomedCard.quranEvidence.ayah}"` : `﴿${zoomedCard.quranEvidence.ayah}﴾`}
                                        </p>
                                        <span className="text-[11px] font-bold opacity-70 block mt-2" style={{ color: tokens.textColor }}>
                                            [{zoomedCard.quranEvidence.surah}: {zoomedCard.quranEvidence.number}]
                                        </span>
                                    </div>
                                )}

                                {zoomedCard.hadithEvidence && (
                                    <div 
                                        className={`p-4 rounded-xl ${innerSubBoxClass}`}
                                    >
                                        <span className="text-xs font-bold block mb-1" style={{ color: themeHeadingColor }}>
                                            {isEn ? 'Prophetic Hadith' : 'الحديث النبوي الشريف'}:
                                        </span>
                                        <p 
                                            className="leading-relaxed font-semibold"
                                            style={{ fontSize: `${zoomFontSize + 1}px`, color: tokens.textColor }}
                                        >
                                            {isEn ? `"${zoomedCard.hadithEvidence.matn}"` : `«${zoomedCard.hadithEvidence.matn}»`}
                                        </p>
                                        <span className="text-[11px] font-medium opacity-70 block mt-1.5" style={{ color: tokens.textColor }}>
                                            {isEn ? `Narrated by: ${zoomedCard.hadithEvidence.narrator} (${zoomedCard.hadithEvidence.source})` : `رواه: ${zoomedCard.hadithEvidence.narrator} (${zoomedCard.hadithEvidence.source})`}
                                        </span>
                                    </div>
                                )}

                                {zoomedCard.content && (
                                    <div 
                                        className="leading-relaxed whitespace-pre-line opacity-95"
                                        style={{ fontSize: `${zoomFontSize}px` }}
                                    >
                                        {zoomedCard.content}
                                    </div>
                                )}

                                {zoomedCard.fact && (
                                    <div 
                                        className={`p-3.5 rounded-xl ${innerSubBoxClass}`}
                                    >
                                        <span className="text-xs font-bold block mb-1" style={{ color: themeHeadingColor }}>
                                            {isEn ? 'Scientific Fact' : 'الحقيقة العلمية'}:
                                        </span>
                                        <p 
                                            className="font-medium"
                                            style={{ fontSize: `${Math.max(13, zoomFontSize - 2)}px`, color: tokens.textColor }}
                                        >
                                            {zoomedCard.fact}
                                        </p>
                                    </div>
                                )}

                                {zoomedCard.sources && zoomedCard.sources.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold block" style={{ color: themeHeadingColor }}>
                                            {isEn ? 'Documented Sources & References:' : 'المصادر والمراجع الموثقة:'}
                                        </span>
                                        <div className="space-y-2">
                                            {zoomedCard.sources.map((src, sIdx) => (
                                                <div key={sIdx} className={`flex items-start gap-2.5 p-3 rounded-xl ${innerSubBoxClass}`}>
                                                    <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs" style={itemBadge3DStyle}>
                                                        {sIdx + 1}
                                                    </span>
                                                    <span className="font-mono leading-relaxed" style={{ fontSize: `${Math.max(12, zoomFontSize - 4)}px`, color: tokens.textColor }}>
                                                        {src}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Bar (Share, Copy, Zoom, ChevronDown to close) - Identical to PropheticSeerahPage */}
                            <div 
                                className="px-4 pt-3 pb-2 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 app-3d-divider-top overflow-visible" 
                            >
                                {/* Share Button */}
                                <button 
                                    type="button"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (!zoomedCard) return;
                                        let textToShare = `${zoomedCard.title}${zoomedCard.content ? `\n\n${zoomedCard.content}` : ''}`;
                                        if (zoomedCard.quranEvidence) {
                                            textToShare += isEn 
                                                ? `\n\nQur'an: "${zoomedCard.quranEvidence.ayah}" [${zoomedCard.quranEvidence.surah}: ${zoomedCard.quranEvidence.number}]`
                                                : `\n\nالقرآن الكريم: ﴿${zoomedCard.quranEvidence.ayah}﴾ [${zoomedCard.quranEvidence.surah}: ${zoomedCard.quranEvidence.number}]`;
                                        }
                                        if (zoomedCard.hadithEvidence) {
                                            textToShare += isEn 
                                                ? `\n\nHadith: "${zoomedCard.hadithEvidence.matn}" (${zoomedCard.hadithEvidence.source})`
                                                : `\n\nالحديث الشريف: «${zoomedCard.hadithEvidence.matn}» (${zoomedCard.hadithEvidence.source})`;
                                        }
                                        if (zoomedCard.fact) {
                                            textToShare += isEn 
                                                ? `\n\nScientific Fact: ${zoomedCard.fact}`
                                                : `\n\nالحقيقة العلمية: ${zoomedCard.fact}`;
                                        }
                                        if (!zoomedCard.content && zoomedCard.sources && zoomedCard.sources.length > 0) {
                                            textToShare += `\n\n${zoomedCard.sources.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
                                        }
                                        await shareAsImage({
                                            title: zoomedCard.title,
                                            text: textToShare,
                                            category: zoomedCard.subtitle || (isEn ? 'Divine Miracles' : 'المعجزات الإلهية'),
                                            source: zoomedCard.badge || (isEn ? 'Divine Miracles' : 'المعجزات الإلهية'),
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
                                        let textToCopy = `${zoomedCard.title}${zoomedCard.content ? `\n\n${zoomedCard.content}` : ''}`;
                                        if (zoomedCard.quranEvidence) {
                                            textToCopy += isEn 
                                                ? `\n\n"${zoomedCard.quranEvidence.ayah}"\n[${zoomedCard.quranEvidence.surah}: ${zoomedCard.quranEvidence.number}]`
                                                : `\n\n﴿${zoomedCard.quranEvidence.ayah}﴾\n[${zoomedCard.quranEvidence.surah}: ${zoomedCard.quranEvidence.number}]`;
                                        }
                                        if (zoomedCard.hadithEvidence) {
                                            textToCopy += isEn 
                                                ? `\n\n"${zoomedCard.hadithEvidence.matn}"\n(${zoomedCard.hadithEvidence.source})`
                                                : `\n\n«${zoomedCard.hadithEvidence.matn}»\n(${zoomedCard.hadithEvidence.source})`;
                                        }
                                        if (zoomedCard.fact) {
                                            textToCopy += `\n\n${zoomedCard.fact}`;
                                        }
                                        if (zoomedCard.sources && zoomedCard.sources.length > 0) {
                                            textToCopy += `\n\n${zoomedCard.sources.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
                                        }
                                        navigator.clipboard.writeText(textToCopy).then(() => {
                                            setCopiedModal(true);
                                            setTimeout(() => setCopiedModal(false), 2000);
                                            showToast(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
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
                                        setZoomFontSize(prev => (prev >= 36 ? 18 : prev + 4));
                                    }}
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                    style={{
                                        color: tokens.textColor
                                    }}
                                    title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>

                                {/* Chevron Down / Close Button */}
                                <button 
                                    type="button"
                                    onClick={() => setZoomedCard(null)} 
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                    style={{
                                        color: tokens.textColor
                                    }}
                                    title={isEn ? "Close" : "إغلاق"}
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Spotlight Interactive Guide */}
            <CommunitySpotlightGuide 
                isOpen={showGuide}
                guideKey="divine_miracles_page_spotlight"
                steps={DIVINE_MIRACLES_PAGE_STEPS}
                onClose={() => setShowGuide(false)}
                isEn={isEn}
            />
        </div>
    );
};

export default DivineMiracles;
