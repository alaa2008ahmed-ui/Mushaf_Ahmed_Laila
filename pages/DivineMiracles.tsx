import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { 
    DIVINE_MIRACLES_DATA, 
    DIVINE_MIRACLES_CATEGORIES, 
    DivineMiracleItem 
} from '../data/divineMiraclesData';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
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
    Search, 
    X, 
    Sparkles, 
    BookOpen, 
    Compass, 
    Atom, 
    ScrollText, 
    HeartHandshake,
    Quote,
    ExternalLink,
    ChevronDown
} from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { DIVINE_MIRACLES_PAGE_STEPS } from '../components/Community/communityTourSteps';
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

interface DivineMiraclesProps {
    onBack?: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
    onOpenThemes?: () => void;
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

const DivineMiracles: React.FC<DivineMiraclesProps> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey } = useTheme();
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';

    // Modern Flat Design Tokens
    const tokens = useMemo(() => getModernFlatTokens(theme, themeKey), [theme, themeKey]);
    const { 
        primaryColor, 
        themeActiveTextColor, 
        pageBgColor, 
        cardBgColor, 
        cardShadow, 
        capsuleBg, 
        filledInputBg
    } = tokens;

    // Scroll container refs
    const mainScrollRef = useRef<HTMLElement | null>(null);
    const zoomScrollRef = useRef<HTMLDivElement | null>(null);

    // Filter & Search states
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
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
        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTop = 0;
        }
    }, [selectedItem?.id, activeTab]);

    useLayoutEffect(() => {
        if (zoomedCard && zoomScrollRef.current) {
            zoomScrollRef.current.scrollTop = 0;
        }
    }, [zoomedCard]);

    // Handle back button clicks
    const handleBackClick = useCallback(() => {
        if (zoomedCard) {
            setZoomedCard(null);
            return;
        }
        if (selectedItem) {
            setSelectedItem(null);
            scrollToTop();
            return;
        }
        if (activeTab !== 'all') {
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
                setSelectedItem(null);
                scrollToTop();
                return true;
            }
            if (activeTab !== 'all') {
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
                else if (selectedItem) setSelectedItem(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomedCard, selectedItem]);

    // Filter items
    const filteredItems = useMemo(() => {
        let list = [...DIVINE_MIRACLES_DATA];

        if (activeTab !== 'all') {
            list = list.filter(item => item.category === activeTab);
        }

        const query = searchQuery.trim();
        if (query) {
            list = list.filter(item => {
                const searchable = [
                    item.titleAr,
                    item.titleEn,
                    item.badgeAr,
                    item.badgeEn,
                    item.summaryAr,
                    item.summaryEn,
                    item.descriptionAr,
                    item.descriptionEn,
                    item.scientificOrHistoricalFactAr || '',
                    item.scientificOrHistoricalFactEn || '',
                    item.quranEvidence?.ayahAr || '',
                    item.quranEvidence?.surahAr || '',
                    item.hadithEvidence?.matnAr || '',
                    ...(item.reflectionsAr || []),
                    ...(item.sourcesAr || [])
                ].join(' ');

                return matchesArabicSearch(searchable, query);
            });
        }

        return list;
    }, [activeTab, searchQuery]);

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

    const getCategoryIcon = (catId: string) => {
        const cls = "w-4 h-4";
        switch (catId) {
            case 'existence': return <Compass className={cls} />;
            case 'divine_origin': return <BookOpen className={cls} />;
            case 'scientific': return <Atom className={cls} />;
            case 'prophecies': return <ScrollText className={cls} />;
            case 'daily_life': return <HeartHandshake className={cls} />;
            default: return <Sparkles className={cls} />;
        }
    };

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
                                    <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full bg-emerald-600 text-white leading-tight shadow" dir="ltr">
                                        +{Math.round((cardTextScale - 1) * 100)}%
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Title in center - strictly bounded between buttons, zero overlap */}
                        <div className="flex-1 min-w-0 flex items-center justify-center px-1 text-center overflow-hidden">
                            <h1 
                                className={`app-top-bar__title ${isEn ? 'font-bold' : 'font-kufi'} transition-all truncate leading-snug`}
                                style={{
                                    fontSize: selectedItem 
                                        ? 'clamp(0.78rem, 2.9vw, 0.95rem)' 
                                        : 'clamp(0.95rem, 3.8vw, 1.2rem)'
                                }}
                            >
                                {shortHeaderTitle}
                            </h1>
                        </div>

                        {/* End Controls: Guide (shown ONLY on first page when !selectedItem) + ThemePageLock + Home */}
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
                            <ThemePageLock />
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
                    className="shrink-0 z-10 px-3 sm:px-4 pt-2.5 pb-2 transition-colors border-0"
                    style={{ backgroundColor: pageBgColor }}
                >
                    <div className="max-w-3xl mx-auto">
                        <div 
                            className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl border-0 shadow-xs hide-scrollbar"
                            style={{ backgroundColor: capsuleBg }}
                        >
                            {DIVINE_MIRACLES_CATEGORIES.map((cat) => {
                                const isSelected = activeTab === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveTab(cat.id);
                                            scrollToTop();
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-0 shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                                            isSelected ? 'shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                                        } ${isEn ? 'font-sans' : 'font-kufi'}`}
                                        style={{
                                            backgroundColor: isSelected ? primaryColor : 'transparent',
                                            color: isSelected ? themeActiveTextColor : (tokens.isDark ? '#CBD5E1' : '#475569')
                                        }}
                                    >
                                        {getCategoryIcon(cat.id)}
                                        <span>{isEn ? cat.titleEn : cat.titleAr}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main 
                ref={mainScrollRef} 
                className="flex-1 overflow-y-auto hide-scrollbar relative max-w-3xl mx-auto w-full px-3.5 sm:px-4 pb-8 flex flex-col pt-1"
            >
                {/* Search Bar - only shown in main list view */}
                {!selectedItem && (
                    <div className="mb-4 w-full flex items-center gap-2 z-10 shrink-0">
                        <div 
                            className="relative flex-1 rounded-[18px] overflow-hidden transition-all shadow-xs" 
                            style={{ 
                                backgroundColor: filledInputBg,
                                boxShadow: cardShadow
                            }}
                        >
                            <input 
                                type="text" 
                                placeholder={isEn ? "Search miracles, verses, or prophecies..." : "ابحث في المعجزات، الآيات، النبوءات، أو الحقائق..."} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full bg-transparent py-3 text-sm ${isEn ? 'pl-11 pr-10 text-left font-sans' : 'pr-11 pl-10 text-right font-cairo'} focus:outline-none placeholder-gray-400 dark:placeholder-gray-500`}
                                style={{ color: 'var(--text-color)' }}
                            />
                            <Search 
                                className={`w-4 h-4 absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-40`} 
                                style={{ color: 'var(--text-color)' }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className={`absolute ${isEn ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition cursor-pointer`}
                                    style={{ color: 'var(--text-color)' }}
                                    title={isEn ? "Clear search" : "مسح البحث"}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW 1: Detailed Item View */}
                {selectedItem ? (
                    <div className="space-y-4">
                        {/* Header Banner Card */}
                        <div 
                            className="rounded-[22px] p-5 sm:p-6 text-start relative border-0 shadow-sm"
                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                        >
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                <span 
                                    className="px-3 py-1 rounded-full text-xs font-bold border-0"
                                    style={{ 
                                        backgroundColor: hexToRgba(primaryColor, 0.12),
                                        color: primaryColor
                                    }}
                                >
                                    {isEn ? selectedItem.badgeEn : selectedItem.badgeAr}
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={(e) => handleCopyItem(selectedItem, e)}
                                        className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition cursor-pointer"
                                        title={isEn ? "Copy complete text" : "نسخ النص كاملاً"}
                                        style={{ color: tokens.textColor }}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleShareItemImage(selectedItem, e)}
                                        className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition cursor-pointer"
                                        title={isEn ? "Share as image card" : "مشاركة كبطاقة صورة"}
                                        style={{ color: tokens.textColor }}
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h2 
                                className="font-extrabold leading-snug mb-3"
                                style={{ 
                                    color: primaryColor, 
                                    fontSize: `${20 * cardTextScale}px` 
                                }}
                            >
                                {isEn ? selectedItem.titleEn : selectedItem.titleAr}
                            </h2>

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
                        {selectedItem.quranEvidence && (
                            <div 
                                className="rounded-[20px] p-5 text-start relative border-0 shadow-sm"
                                style={{ 
                                    backgroundColor: tokens.isDark ? 'rgba(217, 119, 6, 0.08)' : '#FEF3C7',
                                    boxShadow: cardShadow
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-300">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="font-bold text-xs uppercase tracking-wide">
                                        {isEn ? 'Holy Quran Evidence' : 'الدليل والبرهان من القرآن الكريم'}
                                    </span>
                                </div>

                                <p 
                                    className={`leading-loose font-bold text-amber-950 dark:text-amber-100 ${isEn ? 'font-sans' : 'font-amiri'}`}
                                    style={{ fontSize: `${18 * cardTextScale}px` }}
                                >
                                    {isEn ? `"${selectedItem.quranEvidence.ayahEn}"` : `﴿${selectedItem.quranEvidence.ayahAr}﴾`}
                                </p>

                                <div className="mt-3 text-xs font-bold text-amber-800/80 dark:text-amber-400">
                                    {isEn 
                                        ? `[${selectedItem.quranEvidence.surahEn}: ${selectedItem.quranEvidence.ayahNumber}]`
                                        : `[${selectedItem.quranEvidence.surahAr}: الآية ${selectedItem.quranEvidence.ayahNumber}]`}
                                </div>
                            </div>
                        )}

                        {/* Hadith Evidence Card */}
                        {selectedItem.hadithEvidence && (
                            <div 
                                className="rounded-[20px] p-5 text-start relative border-0 shadow-sm"
                                style={{ 
                                    backgroundColor: tokens.isDark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
                                    boxShadow: cardShadow
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-300">
                                    <ScrollText className="w-4 h-4" />
                                    <span className="font-bold text-xs uppercase tracking-wide">
                                        {isEn ? 'Prophetic Sunnah Evidence' : 'الدليل والبرهان من السنة النبوية'}
                                    </span>
                                </div>

                                <p 
                                    className="leading-relaxed font-semibold text-emerald-950 dark:text-emerald-100"
                                    style={{ fontSize: `${16 * cardTextScale}px` }}
                                >
                                    {isEn ? `"${selectedItem.hadithEvidence.matnEn}"` : `«${selectedItem.hadithEvidence.matnAr}»`}
                                </p>

                                <div className="mt-2.5 text-xs font-medium text-emerald-800/80 dark:text-emerald-400">
                                    {isEn 
                                        ? `Narrated by: ${selectedItem.hadithEvidence.narratorEn} • ${selectedItem.hadithEvidence.sourceEn}`
                                        : `رواه: ${selectedItem.hadithEvidence.narratorAr} • ${selectedItem.hadithEvidence.sourceAr}`}
                                </div>
                            </div>
                        )}

                        {/* Detailed Explanation */}
                        <div 
                            className="rounded-[22px] p-5 sm:p-6 text-start relative border-0 shadow-sm"
                            style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                        >
                            <h3 
                                className="font-bold mb-3 flex items-center gap-2"
                                style={{ color: primaryColor, fontSize: `${16 * cardTextScale}px` }}
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>{isEn ? 'Comprehensive Detailed Explanation' : 'الشرح والبيان المفصل'}</span>
                            </h3>

                            <div 
                                className="space-y-3 leading-relaxed whitespace-pre-line opacity-95"
                                style={{ 
                                    color: tokens.textColor, 
                                    fontSize: `${14.5 * cardTextScale}px` 
                                }}
                            >
                                {isEn ? selectedItem.descriptionEn : selectedItem.descriptionAr}
                            </div>
                        </div>

                        {/* Scientific / Historical Fact Card */}
                        {(selectedItem.scientificOrHistoricalFactAr || selectedItem.scientificOrHistoricalFactEn) && (
                            <div 
                                className="rounded-[20px] p-5 text-start relative border-0 shadow-sm"
                                style={{ 
                                    backgroundColor: tokens.isDark ? 'rgba(59, 130, 246, 0.08)' : '#EFF6FF',
                                    boxShadow: cardShadow
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-300">
                                    <Atom className="w-4 h-4" />
                                    <span className="font-bold text-xs uppercase tracking-wide">
                                        {isEn ? 'Scientific / Historical Documentation' : 'التوثيق العلمي والتاريخي الحديث'}
                                    </span>
                                </div>

                                <p 
                                    className="leading-relaxed font-semibold text-blue-950 dark:text-blue-100"
                                    style={{ fontSize: `${14 * cardTextScale}px` }}
                                >
                                    {isEn ? selectedItem.scientificOrHistoricalFactEn : selectedItem.scientificOrHistoricalFactAr}
                                </p>
                            </div>
                        )}

                        {/* Faith Reflections */}
                        {((isEn ? selectedItem.reflectionsEn : selectedItem.reflectionsAr) || []).length > 0 && (
                            <div 
                                className="rounded-[20px] p-5 text-start relative border-0 shadow-sm"
                                style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
                            >
                                <h4 
                                    className="font-bold mb-3 text-xs uppercase tracking-wide flex items-center gap-2"
                                    style={{ color: primaryColor }}
                                >
                                    <Quote className="w-3.5 h-3.5" />
                                    <span>{isEn ? 'Faith Lessons & Reflections' : 'دروس وإشراقات إيمانية'}</span>
                                </h4>

                                <ul className="space-y-2">
                                    {(isEn ? selectedItem.reflectionsEn : selectedItem.reflectionsAr)?.map((r, i) => (
                                        <li 
                                            key={i} 
                                            className="flex items-start gap-2.5"
                                            style={{ fontSize: `${13.5 * cardTextScale}px`, color: tokens.textColor }}
                                        >
                                            <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: primaryColor }} />
                                            <span className="leading-relaxed opacity-90">{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Sources & Citations */}
                        <div 
                            className="rounded-[18px] p-4 text-start relative border-0 opacity-80"
                            style={{ backgroundColor: tokens.isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}
                        >
                            <span className="text-[11px] font-bold block mb-1 opacity-70" style={{ color: tokens.textColor }}>
                                {isEn ? 'Documented Sources & References:' : 'المصادر والمراجع الموثقة:'}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {(isEn ? selectedItem.sourcesEn : selectedItem.sourcesAr).map((s, idx) => (
                                    <span 
                                        key={idx}
                                        className="text-[11px] px-2 py-0.5 rounded-md font-mono"
                                        style={{ 
                                            backgroundColor: hexToRgba(primaryColor, 0.08),
                                            color: tokens.textColor 
                                        }}
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Return to list button */}
                        <div className="pt-2 flex justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedItem(null);
                                    scrollToTop();
                                }}
                                className="px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                                style={{ 
                                    backgroundColor: primaryColor, 
                                    color: themeActiveTextColor 
                                }}
                            >
                                {isEn ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                <span>{isEn ? 'Back to All Miracles' : 'العودة لقائمة المعجزات'}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* VIEW 2: Grid / List of All Miracles */
                    <div className="space-y-3.5">
                        {filteredItems.length === 0 ? (
                            <div 
                                className="rounded-[22px] p-8 text-center border-0 shadow-xs"
                                style={{ backgroundColor: cardBgColor, boxShadow: cardShadow }}
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
                                    onClick={() => {
                                        setSelectedItem(item);
                                        scrollToTop();
                                    }}
                                    className="rounded-[20px] p-4.5 sm:p-5 text-start relative border-0 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group"
                                    style={{ 
                                        backgroundColor: cardBgColor, 
                                        boxShadow: cardShadow 
                                    }}
                                >
                                    {/* Badge and action tools */}
                                    <div className="flex items-center justify-between gap-2 mb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span 
                                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border-0"
                                                style={{ 
                                                    backgroundColor: hexToRgba(primaryColor, 0.1),
                                                    color: primaryColor
                                                }}
                                            >
                                                {isEn ? item.badgeEn : item.badgeAr}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Magnifying Glass to open individual card modal */}
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
                                                className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                                                title={isEn ? "Open card modal" : "تكبير وقراءة البطاقة"}
                                                style={{ color: tokens.textColor }}
                                            >
                                                <ZoomIn className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleCopyItem(item, e)}
                                                className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                                                title={isEn ? "Copy" : "نسخ"}
                                                style={{ color: tokens.textColor }}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleShareItemImage(item, e)}
                                                className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                                                title={isEn ? "Share as image" : "مشاركة كبطاقة"}
                                                style={{ color: tokens.textColor }}
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Title */}
                                    <h3 
                                        className="font-bold leading-snug mb-2 group-hover:opacity-90 transition-opacity"
                                        style={{ 
                                            color: primaryColor, 
                                            fontSize: `${16.5 * cardTextScale}px` 
                                        }}
                                    >
                                        {isEn ? item.titleEn : item.titleAr}
                                    </h3>

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

                                    {/* Quran or Hadith preview snippet */}
                                    {item.quranEvidence && (
                                        <div 
                                            className="p-2.5 rounded-xl bg-amber-500/10 mb-2 border-0"
                                            style={{ fontSize: `${13 * cardTextScale}px` }}
                                        >
                                            <p className={`text-amber-950 dark:text-amber-200 line-clamp-2 ${isEn ? 'font-sans' : 'font-amiri font-bold'}`}>
                                                {isEn ? `"${item.quranEvidence.ayahEn}"` : `﴿${item.quranEvidence.ayahAr}﴾`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Read more indicator */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800/80 text-xs font-bold">
                                        <span style={{ color: primaryColor }}>
                                            {isEn ? 'Read complete documentation →' : 'اضغط لقراءة التوثيق والشرح كاملاً ←'}
                                        </span>
                                        <span className="text-[10px] opacity-50 font-mono" style={{ color: tokens.textColor }}>
                                            {item.sourcesAr[0]}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Focused Reading Modal (Zoomed Card - Bottom Sheet sliding up from bottom like Adia & Adhkar) */}
            <AnimatePresence>
                {zoomedCard && (
                    <div 
                        className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex flex-col justify-end select-none"
                        onClick={() => setZoomedCard(null)}
                        dir={isEn ? 'ltr' : 'rtl'}
                    >
                        <motion.div 
                            initial={{ y: '100%', opacity: 0.6 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className="w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[85vh] overflow-hidden relative shadow-2xl border-t border-slate-100/40 dark:border-white/10"
                            style={{ 
                                backgroundColor: cardBgColor, 
                                color: tokens.textColor,
                                fontFamily: isEn ? 'sans-serif' : theme.font 
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Top Drag Handle & Category pill */}
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
                                        {zoomedCard.subtitle || (isEn ? "Divine Miracles" : "المعجزات الإلهية")}
                                    </span>
                                </div>
                            </div>

                            {/* Centered Title */}
                            {zoomedCard.title && (
                                <h3 
                                    className={`text-base sm:text-lg font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-center leading-snug px-6 pb-2`} 
                                    style={{ color: tokens.primaryColor }}
                                >
                                    {zoomedCard.title}
                                </h3>
                            )}

                            {/* Modal Scrollable Body */}
                            <div ref={zoomScrollRef} className="overflow-y-auto hide-scrollbar flex-1 px-6 py-4 space-y-4">
                                {zoomedCard.quranEvidence && (
                                    <div className="p-4 rounded-xl bg-amber-500/10 border-0">
                                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1">
                                            {isEn ? 'Holy Quran' : 'القرآن الكريم'}:
                                        </span>
                                        <p 
                                            className={`leading-relaxed text-amber-950 dark:text-amber-100 ${isEn ? 'font-sans' : 'font-amiri font-bold'}`}
                                            style={{ fontSize: `${zoomFontSize + 4}px` }}
                                        >
                                            {isEn ? `"${zoomedCard.quranEvidence.ayah}"` : `﴿${zoomedCard.quranEvidence.ayah}﴾`}
                                        </p>
                                        <span className="text-[11px] font-bold text-amber-700/80 dark:text-amber-400 block mt-2">
                                            [{zoomedCard.quranEvidence.surah}: {zoomedCard.quranEvidence.number}]
                                        </span>
                                    </div>
                                )}

                                {zoomedCard.hadithEvidence && (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border-0">
                                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                                            {isEn ? 'Prophetic Hadith' : 'الحديث النبوي الشريف'}:
                                        </span>
                                        <p 
                                            className="leading-relaxed font-semibold text-emerald-950 dark:text-emerald-100"
                                            style={{ fontSize: `${zoomFontSize + 1}px` }}
                                        >
                                            {isEn ? `"${zoomedCard.hadithEvidence.matn}"` : `«${zoomedCard.hadithEvidence.matn}»`}
                                        </p>
                                        <span className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400 block mt-1.5">
                                            {isEn ? `Narrated by: ${zoomedCard.hadithEvidence.narrator} (${zoomedCard.hadithEvidence.source})` : `رواه: ${zoomedCard.hadithEvidence.narrator} (${zoomedCard.hadithEvidence.source})`}
                                        </span>
                                    </div>
                                )}

                                <div 
                                    className="leading-relaxed whitespace-pre-line opacity-95"
                                    style={{ fontSize: `${zoomFontSize}px` }}
                                >
                                    {zoomedCard.content}
                                </div>

                                {zoomedCard.fact && (
                                    <div className="p-3.5 rounded-xl bg-blue-500/10 border-0">
                                        <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block mb-1">
                                            {isEn ? 'Scientific Fact' : 'الحقيقة العلمية'}:
                                        </span>
                                        <p 
                                            className="font-medium text-blue-950 dark:text-blue-100"
                                            style={{ fontSize: `${Math.max(13, zoomFontSize - 2)}px` }}
                                        >
                                            {zoomedCard.fact}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Bar (Share, Copy, Zoom, ChevronDown to close) - Identical to PropheticSeerahPage */}
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
                                        let textToShare = `${zoomedCard.title}\n\n${zoomedCard.content}`;
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
                                        let textToCopy = `${zoomedCard.title}\n\n${zoomedCard.content}`;
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
                                        navigator.clipboard.writeText(textToCopy).then(() => {
                                            setCopiedModal(true);
                                            setTimeout(() => setCopiedModal(false), 2000);
                                            showToast(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
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
                                        setZoomFontSize(prev => (prev >= 36 ? 18 : prev + 4));
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

                                {/* Chevron Down / Close Button */}
                                <button 
                                    type="button"
                                    onClick={() => setZoomedCard(null)} 
                                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                                    style={{
                                        backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                                        color: tokens.textColor
                                    }}
                                    title={isEn ? "Close" : "إغلاق"}
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
