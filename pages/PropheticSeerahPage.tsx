import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import {
  PROPHETIC_SEERAH_DATA,
  PROPHETIC_STANCES_DATA,
  SeerahMilestone,
  PropheticStance
} from '../data/propheticSeerahData';
import {
  SEERAH_UI_TEXTS,
  getTranslatedMilestone,
  getTranslatedStance,
  getTranslatedLineage,
  getShortSeerahHeaderTitle
} from '../data/propheticSeerahTranslations';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { shareAsImage } from '../utils/shareAsImage';
import { sharePropheticLineageImage } from '../utils/lineageShareHelper';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { markPageAsSeen } from '../utils/badgeManager';
import { ZoomIn, Share2, Copy, Check, ChevronDown } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { PROPHETIC_SEERAH_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { useShowPageGuides } from '../utils/guideManager';

import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';
import { getToast3DStyles } from '../utils/toast3DStyles';

interface PropheticSeerahPageProps {
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

const PropheticSeerahPage: React.FC<PropheticSeerahPageProps> = ({ onBack, onNavigate, navParams }) => {
    const showPageGuides = useShowPageGuides();
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const ui = SEERAH_UI_TEXTS[isEn ? 'en' : 'ar'];

    // Modern Flat Design System
    const tokens = useMemo(() => getModernFlatTokens(theme, themeKey), [theme, themeKey]);
    const isEffectiveDark = tokens.isDark || tokens.isDeepBlack || themeKey === 'black_gold' || themeKey === 'deep_black' || theme.bgColor === '#000000';
    const { 
        primaryColor, 
        themeActiveTextColor, 
        pageBgColor
    } = tokens;
    const themeHeadingColor = tokens.isDeepBlack ? '#FFFFFF' : primaryColor;
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
    const savedListScrollTopRef = useRef<{ timeline: number; stances: number }>({ timeline: 0, stances: 0 });
    const restoreScrollTargetRef = useRef<number | null>(null);

    // Active translated data
    const activeLineageData = useMemo(() => getTranslatedLineage(isEn), [isEn]);
    const allMilestones = useMemo(() => PROPHETIC_SEERAH_DATA.map(m => getTranslatedMilestone(m, isEn)), [isEn]);
    const allStances = useMemo(() => PROPHETIC_STANCES_DATA.map(s => getTranslatedStance(s, isEn)), [isEn]);

    // Tabs: 'timeline' (43 milestones), 'stances' (Immortal Stances), 'lineage' (Noble Lineage)
    const [activeTab, setActiveTab] = useState<'timeline' | 'stances' | 'lineage'>('timeline');
    const [tabHistory, setTabHistory] = useState<Array<'timeline' | 'stances' | 'lineage'>>(['timeline']);

    // Sub-tab for Lineage View
    const [lineageTab, setLineageTab] = useState<'tree' | 'mother' | 'names' | 'nurses' | 'characteristics' | 'virtues'>('tree');

    // Selected Milestone or Stance for Detailed Modal/View
    const [selectedMilestone, setSelectedMilestone] = useState<SeerahMilestone | null>(null);
    const [selectedStance, setSelectedStance] = useState<PropheticStance | null>(null);

    useEffect(() => {
        if (navParams?.eventId || navParams?.highlightId) {
            const targetId = navParams.eventId || navParams.highlightId;
            const foundMilestone = PROPHETIC_SEERAH_DATA.find(m => m.id === targetId);
            if (foundMilestone) {
                setActiveTab('timeline');
                setSelectedMilestone(getTranslatedMilestone(foundMilestone, isEn));
                return;
            }
            const foundStance = PROPHETIC_STANCES_DATA.find(s => s.id === targetId);
            if (foundStance) {
                setActiveTab('stances');
                setSelectedStance(getTranslatedStance(foundStance, isEn));
            }
        }
    }, [navParams, isEn]);

    // Zoom Modal State for Cards
    const [zoomedCard, setZoomedCard] = useState<ZoomedCardData | null>(null);
    const [zoomFontSize, setZoomFontSize] = useState<number>(24);
    const [copiedModal, setCopiedModal] = useState(false);

    // Global in-page card font scaling
    const [cardTextScale, setCardTextScale] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('seerahCardTextScale');
            return saved ? parseFloat(saved) : 1;
        } catch {
            return 1;
        }
    });

    const toggleCardTextScale = () => {
        setCardTextScale(prev => {
            const next = prev >= 1.45 ? 1 : Number((prev + 0.15).toFixed(2));
            try {
                localStorage.setItem('seerahCardTextScale', String(next));
            } catch {}
            return next;
        });
    };

    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('prophetic-seerah');
        if (!getGuideSeen('prophetic_seerah_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);

    // Timeline Filter
    const [activeEraFilter, setActiveEraFilter] = useState<string>('all');
    // Stances Filter
    const [activeStanceCategory, setActiveStanceCategory] = useState<string>('all');

    // Toast & Sharing State
    const [toastMessage, setToastMessage] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    // Show toast helper
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2800);
    };

    // Scroll to top helper
    const scrollToTop = useCallback(() => {
        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTop = 0;
        }
    }, []);

    // Ensure the page opens from the top on selection, or restores prior scroll position when returning to the list
    useLayoutEffect(() => {
        const el = mainScrollRef.current;
        if (!el) return;
        if (!selectedMilestone && !selectedStance && restoreScrollTargetRef.current !== null) {
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
    }, [selectedMilestone?.id, selectedStance?.id, activeTab, lineageTab]);

    useLayoutEffect(() => {
        if (zoomedCard && zoomScrollRef.current) {
            zoomScrollRef.current.scrollTop = 0;
        }
    }, [zoomedCard]);

    const handleSelectMilestone = (m: SeerahMilestone) => {
        if (!selectedMilestone && mainScrollRef.current) {
            savedListScrollTopRef.current.timeline = mainScrollRef.current.scrollTop;
        }
        restoreScrollTargetRef.current = null;
        setSelectedMilestone(m);
        scrollToTop();
    };

    const handleSelectStance = (s: PropheticStance) => {
        if (!selectedStance && mainScrollRef.current) {
            savedListScrollTopRef.current.stances = mainScrollRef.current.scrollTop;
        }
        restoreScrollTargetRef.current = null;
        setSelectedStance(s);
        scrollToTop();
    };

    const handleOpenZoomCard = (card: ZoomedCardData) => {
        setZoomedCard(card);
        setTimeout(() => {
            if (zoomScrollRef.current) {
                zoomScrollRef.current.scrollTop = 0;
            }
        }, 0);
    };

    const switchTab = (tab: 'timeline' | 'stances' | 'lineage') => {
        if (tab === activeTab) return;
        restoreScrollTargetRef.current = null;
        setActiveTab(tab);
        setTabHistory(prev => [...prev.filter(t => t !== tab), tab]);
        scrollToTop();
    };

    // Copy Milestone with ALL newly added data
    const handleCopyMilestone = (rawM: SeerahMilestone) => {
        const m = getTranslatedMilestone(rawM, isEn);
        let text = `📜 *${m.title}*\n`;
        if (isEn) {
            text += `⏱️ *Time & Era:* ${m.yearHijri ? `${m.yearHijri} • ` : ''}${m.yearGregorian} (Prophet's Age ﷺ: ${m.ageOfProphet})\n`;
            text += `📍 *Location:* ${m.location}\n`;
            text += `🏷️ *Era & Badge:* ${m.eraLabel} • ${m.badge}\n\n`;

            if (m.keyFigures && m.keyFigures.length > 0) {
                text += `👥 *Key Figures:* ${m.keyFigures.join(', ')}\n\n`;
            }

            text += `📖 *Summary:*\n${m.summary}\n\n`;
            text += `📝 *Documented Narrative:*\n${m.details}\n\n`;

            if (m.strategicImpact) {
                text += `🎯 *Strategic Impact:*\n${m.strategicImpact}\n\n`;
            }

            if (m.propheticMiraclesOrDuas) {
                text += `🤲 *Prophetic Miracles & Duas:*\n${m.propheticMiraclesOrDuas}\n\n`;
            }

            if (m.historicalSecrets) {
                text += `🔍 *Historical Secrets & Wisdom:*\n${m.historicalSecrets}\n\n`;
            }

            if (m.versesOrHadiths || m.proof) {
                text += `📖 *Evidence from Qur'an or Sunnah:*\n${m.versesOrHadiths || m.proof}\n\n`;
            }

            text += `💡 *Faith & Practical Life Lessons:*\n${m.lessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\n`;
            text += `Shared from Mushaf Ahmed & Laila App`;
        } else {
            text += `⏱️ *الزمن:* ${m.yearHijri ? `${m.yearHijri} • ` : ''}${m.yearGregorian} (عمر النبي ﷺ: ${m.ageOfProphet})\n`;
            text += `📍 *المكان:* ${m.location}\n`;
            text += `🏷️ *العصر والمرحلة:* ${m.eraLabel} • ${m.badge}\n\n`;

            if (m.keyFigures && m.keyFigures.length > 0) {
                text += `👥 *أعلام وشخصيات المحطة:* ${m.keyFigures.join('، ')}\n\n`;
            }

            text += `📖 *الخلاصة:*\n${m.summary}\n\n`;
            text += `📝 *أحداث وتفاصيل المحطة الموثقة:*\n${m.details}\n\n`;

            if (m.strategicImpact) {
                text += `🎯 *الأثر الاستراتيجي والتحول التاريخي:*\n${m.strategicImpact}\n\n`;
            }

            if (m.propheticMiraclesOrDuas) {
                text += `🤲 *معجزات وأدعية وبركات ارتبطت بالحدث:*\n${m.propheticMiraclesOrDuas}\n\n`;
            }

            if (m.historicalSecrets) {
                text += `🔍 *أسرار ولطائف تاريخية وحكم نبوية:*\n${m.historicalSecrets}\n\n`;
            }

            if (m.versesOrHadiths || m.proof) {
                text += `📖 *شواهد من القرآن الكريم أو السنة الشريفة:*\n${m.versesOrHadiths || m.proof}\n\n`;
            }

            text += `💡 *العِبر والدروس الإيمانية والعملية:*\n${m.lessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\n`;
            text += `مشارك من تطبيق مصحف أحمد و ليلى`;
        }

        navigator.clipboard.writeText(text).then(() => {
            showToast(ui.toastCopiedMilestone);
        }).catch(() => {
            showToast(ui.toastCopyFailed);
        });
    };

    // Copy Stance with ALL newly added data
    const handleCopyStance = (rawS: PropheticStance) => {
        const s = getTranslatedStance(rawS, isEn);
        let text = `✨ *${s.title}* (${s.categoryBadge})\n`;
        if (isEn) {
            if (s.year) text += `⏱️ *Year & Context:* ${s.year}\n`;
            if (s.keyFigures && s.keyFigures.length > 0) {
                text += `👥 *Key Figures:* ${s.keyFigures.join(', ')}\n`;
            }
            text += `\n📖 *Context & Narrative:*\n${s.situation}\n\n`;

            if (s.detailedDialogue) {
                text += `💬 *Prophetic Dialogue:*\n${s.detailedDialogue}\n\n`;
            }

            text += `🌟 *Immortal Prophetic Quote:*\n"${s.quote}"\n\n`;

            if (s.psychologicalAnalysis) {
                text += `🧠 *Psychological & Leadership Analysis:*\n${s.psychologicalAnalysis}\n\n`;
            }

            if (s.contemporaryReflection) {
                text += `🌍 *Contemporary Reflection:*\n${s.contemporaryReflection}\n\n`;
            }

            if (s.practicalApplication) {
                text += `🛠️ *Practical Application Steps:*\n${s.practicalApplication}\n\n`;
            }

            text += `💡 *Moral Lesson:*\n${s.moralLesson}\n\n`;
            text += `📜 *Source & Reference:* ${s.proof}\n\n`;
            text += `Shared from Mushaf Ahmed & Laila App`;
        } else {
            if (s.year) text += `⏱️ *الزمن والسياق:* ${s.year}\n`;
            if (s.keyFigures && s.keyFigures.length > 0) {
                text += `👥 *الشخصيات المشاركة:* ${s.keyFigures.join('، ')}\n`;
            }
            text += `\n📖 *الموقف والسياق التفصيلي:*\n${s.situation}\n\n`;

            if (s.detailedDialogue) {
                text += `💬 *الحوار النبوي الشريف:*\n${s.detailedDialogue}\n\n`;
            }

            text += `🌟 *الكلمة النبوية الخالدة:*\n«${s.quote}»\n\n`;

            if (s.psychologicalAnalysis) {
                text += `🧠 *التحليل النفسي والتربوي والقيادي:*\n${s.psychologicalAnalysis}\n\n`;
            }

            if (s.contemporaryReflection) {
                text += `🌍 *إسقاط الموقف على واقعنا المعاصر:*\n${s.contemporaryReflection}\n\n`;
            }

            if (s.practicalApplication) {
                text += `🛠️ *تطبيقات وخطوات عملية:*\n${s.practicalApplication}\n\n`;
            }

            text += `💡 *القيمة الأخلاقية والعِبرة الخالدة:*\n${s.moralLesson}\n\n`;
            text += `📜 *المصدر والتوثيق:* ${s.proof}\n\n`;
            text += `مشارك من تطبيق مصحف أحمد و ليلى`;
        }

        navigator.clipboard.writeText(text).then(() => {
            showToast(ui.toastCopiedStance);
        }).catch(() => {
            showToast(ui.toastCopyFailed);
        });
    };

    // Copy Lineage with section-scoped full page data
    const handleCopyLineage = (section?: 'all' | 'tree' | 'mother' | 'names' | 'nurses' | 'characteristics' | 'virtues') => {
        const footerSignature = isEn ? 'Shared from Mushaf Ahmed & Laila App' : 'مشارك من تطبيق مصحف أحمد و ليلى';
        let text = '';

        if (section === 'tree') {
            text += `👑 *${activeLineageData.fullName}*\n\n`;
            text += `📌 *${ui.fullLineTitle}*\n${activeLineageData.fullText}\n\n`;
            text += `🌳 *${ui.ancestorsTitle}:*\n`;
            text += activeLineageData.ancestors.map((anc, idx) =>
                `${idx + 1}. *${anc.name}*${anc.title ? ` (${anc.title})` : ''}\n${anc.significance}${anc.story ? `\n${ui.ancestorStoryTitle} ${anc.story}` : ''}`
            ).join('\n\n');
            text += `\n\n${footerSignature}`;
        } else if (section === 'mother') {
            text += `🌸 *${ui.motherLineageTitle}*\n\n`;
            text += `👑 *${activeLineageData.motherLineage.fullName}*\n`;
            text += `${activeLineageData.motherLineage.tribe}\n\n`;
            text += `🔗 *${ui.meetingPointTitle}*\n${activeLineageData.motherLineage.meetingPoint}\n\n`;
            text += `📝 ${activeLineageData.motherLineage.details}\n\n`;
            text += footerSignature;
        } else if (section === 'names') {
            text += `✨ *${ui.namesTitle}*\n\n`;
            text += activeLineageData.propheticNames.map((n, idx) => `${idx + 1}. *${n.name}:* ${n.meaning}\n(${n.source})`).join('\n\n');
            text += `\n\n${footerSignature}`;
        } else if (section === 'nurses') {
            text += `🍼 *${ui.nursesTitle}*\n\n`;
            text += activeLineageData.nursesAndFosterBrothers.map((nb, idx) => `${idx + 1}. *${nb.person}* (${nb.role}):\n${nb.details}`).join('\n\n');
            text += `\n\n${footerSignature}`;
        } else if (section === 'characteristics') {
            text += `🌿 *${ui.characteristicsTitle}*\n\n`;
            text += activeLineageData.nobleCharacteristics.map((c, idx) => `${idx + 1}. *${c.title}* [${c.category}]:\n${c.description}\n(${c.hadithRef})`).join('\n\n');
            text += `\n\n${footerSignature}`;
        } else if (section === 'virtues') {
            text += `📜 *${ui.virtuesTitle}*\n\n`;
            text += activeLineageData.virtues.map((v, idx) => `${idx + 1}. *${v.title}*\n«${v.hadith}»\n(${v.source})`).join('\n\n');
            text += `\n\n${footerSignature}`;
        } else {
            text = `👑 *${activeLineageData.fullName}*\n\n`;
            text += `📌 *${ui.fullLineTitle}*\n${activeLineageData.fullText}\n\n`;
            text += `🌸 *${ui.motherLineageTitle}:*\n${activeLineageData.motherLineage.fullName}\n${activeLineageData.motherLineage.tribe}\n${activeLineageData.motherLineage.meetingPoint}\n${activeLineageData.motherLineage.details}\n\n`;
            text += `✨ *${ui.namesTitle}:*\n${activeLineageData.propheticNames.map(n => `• ${n.name}: ${n.meaning} (${n.source})`).join('\n')}\n\n`;
            text += `🍼 *${ui.nursesTitle}:*\n${activeLineageData.nursesAndFosterBrothers.map(nb => `• ${nb.person} (${nb.role}): ${nb.details}`).join('\n')}\n\n`;
            text += `🌿 *${ui.characteristicsTitle}:*\n${activeLineageData.nobleCharacteristics.map(c => `• ${c.title} [${c.category}]:\n${c.description}\n(${c.hadithRef})`).join('\n\n')}\n\n`;
            text += `📜 *${ui.virtuesTitle}:*\n${activeLineageData.virtues.map(v => `• ${v.title}: «${v.hadith}» (${v.source})`).join('\n\n')}\n\n`;
            text += footerSignature;
        }

        navigator.clipboard.writeText(text).then(() => {
            showToast(ui.toastCopiedLineage);
        }).catch(() => {
            showToast(ui.toastCopyFailed);
        });
    };

    // Share Milestone as rich image card (Pure Canvas 2D without text collisions)
    const handleShareCardImage = async (rawM: SeerahMilestone, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isSharing) return;
        setIsSharing(true);
        const m = getTranslatedMilestone(rawM, isEn);
        try {
            const cardTitle = m.title;
            let cardBody = `${m.summary}\n\n`;
            if (m.strategicImpact) {
                cardBody += isEn ? `🎯 Strategic Impact:\n${m.strategicImpact}\n\n` : `🎯 الأثر الاستراتيجي:\n${m.strategicImpact}\n\n`;
            }
            if (m.propheticMiraclesOrDuas) {
                cardBody += isEn ? `🤲 Prophetic Miracles & Duas:\n${m.propheticMiraclesOrDuas}\n\n` : `🤲 بركات وأدعية نبوية:\n${m.propheticMiraclesOrDuas}\n\n`;
            }
            const topLessons = m.lessons.slice(0, 3).map((l, i) => `${i + 1}. ${l}`).join('\n');
            cardBody += isEn ? `💡 Key Lessons & Wisdom:\n${topLessons}` : `💡 من أبرز الدروس والعِبر:\n${topLessons}`;

            const cardCategory = `${m.eraLabel} • ${m.location}`;
            const cardSource = `${m.yearHijri ? `${m.yearHijri} • ` : ''}${m.yearGregorian} | ${isEn ? "Prophet's Age ﷺ:" : 'عمر النبي ﷺ:'} ${m.ageOfProphet}`;

            await shareAsImage({
                title: cardTitle,
                text: cardBody,
                category: cardCategory,
                source: cardSource,
                theme,
                isEn,
                language: isEn ? 'en' : 'ar',
                setToastMessage
            });
        } catch (error) {
            console.error('Error sharing seerah card as image:', error);
            showToast(ui.toastShareFailed);
        } finally {
            setIsSharing(false);
        }
    };

    // Share Stance as rich image card
    const handleShareStanceImage = async (rawS: PropheticStance, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isSharing) return;
        setIsSharing(true);
        const s = getTranslatedStance(rawS, isEn);
        try {
            const cardTitle = s.title;
            let cardBody = isEn 
                ? `${s.situation}\n\n🌟 Immortal Prophetic Quote:\n"${s.quote}"\n\n`
                : `${s.situation}\n\n🌟 الكلمة والموقف الخالد:\n«${s.quote}»\n\n`;
            if (s.psychologicalAnalysis) {
                cardBody += isEn 
                    ? `🧠 Leadership & Psychological Dimension:\n${s.psychologicalAnalysis}\n\n`
                    : `🧠 البعد القيادي والتربوي:\n${s.psychologicalAnalysis}\n\n`;
            }
            cardBody += isEn ? `💡 Moral Lesson:\n${s.moralLesson}` : `💡 العِبرة الإنسانية:\n${s.moralLesson}`;
            const cardCategory = isEn ? `Immortal Stances • ${s.categoryBadge}` : `مواقف خالدة • ${s.categoryBadge}`;
            const cardSource = s.proof;

            await shareAsImage({
                title: cardTitle,
                text: cardBody,
                category: cardCategory,
                source: cardSource,
                theme,
                isEn,
                language: isEn ? 'en' : 'ar',
                setToastMessage
            });
        } catch (error) {
            console.error('Error sharing stance image:', error);
            showToast(ui.toastShareFailed);
        } finally {
            setIsSharing(false);
        }
    };

    // Share Lineage as rich dedicated royal artwork poster
    const handleShareLineageImage = async () => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            await sharePropheticLineageImage({
                fullName: activeLineageData.fullName,
                shortChain: activeLineageData.shortChain,
                fullText: activeLineageData.fullText,
                motherFullName: activeLineageData.motherLineage.fullName,
                motherDetails: activeLineageData.motherLineage.details,
                setToastMessage
            });
        } catch (error) {
            console.error('Error sharing lineage image:', error);
            showToast(ui.toastShareFailed);
        } finally {
            setIsSharing(false);
        }
    };

    // Share Lineage Sub-Tab as high-res Islamic image card
    const handleShareLineageSubTabImage = async (subTab: 'mother' | 'names' | 'nurses' | 'characteristics' | 'virtues') => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            let title = ui.tabLineageFull;
            let category = ui.tabLineageFull;
            let text = '';
            let source = activeLineageData.fullName;

            if (subTab === 'mother') {
                title = activeLineageData.motherLineage.fullName;
                category = ui.motherLineageTitle;
                text = `${activeLineageData.motherLineage.tribe}\n\n• ${ui.meetingPointTitle}\n${activeLineageData.motherLineage.meetingPoint}\n\n${activeLineageData.motherLineage.details}`;
                source = isEn ? "The Prophet's Pure Mother ﷺ" : 'أم النبي الطاهرة ﷺ';
            } else if (subTab === 'names') {
                title = ui.namesTitle;
                category = ui.tabLineageFull;
                text = `${activeLineageData.propheticNames.map((n, idx) => `${idx + 1}. ${n.name}`).join(' • ')}\n\n${activeLineageData.propheticNames.slice(0, 5).map(n => `• ${n.name}: ${n.meaning}`).join('\n')}`;
                source = `${activeLineageData.propheticNames.length} ${isEn ? 'Blessed Names' : 'اسماً مباركاً'}`;
            } else if (subTab === 'nurses') {
                title = ui.nursesTitle;
                category = ui.tabLineageFull;
                text = activeLineageData.nursesAndFosterBrothers.map((nb, idx) => `${idx + 1}. ${nb.person} (${nb.role}):\n${nb.details}`).join('\n\n');
            } else if (subTab === 'characteristics') {
                title = ui.characteristicsTitle;
                category = ui.tabLineageFull;
                text = activeLineageData.nobleCharacteristics.map((c, idx) => `${idx + 1}. ${c.title} (${c.category})`).join('\n');
                source = `${activeLineageData.nobleCharacteristics.length} ${isEn ? 'Sublime Characteristics' : 'شَميلة خَلقية وخُلقية'}`;
            } else if (subTab === 'virtues') {
                title = ui.virtuesTitle;
                category = ui.nobleHadithBadge;
                text = activeLineageData.virtues.map((v, idx) => `${idx + 1}. ${v.title}\n«${v.hadith}»\n(${v.source})`).join('\n\n');
            }

            await shareAsImage({
                title,
                text,
                category,
                source,
                theme,
                isEn,
                language: isEn ? 'en' : 'ar',
                setToastMessage
            });
        } catch (error) {
            console.error('Error sharing lineage sub-tab image:', error);
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
                category: opts.category || (isEn ? 'The Prophetic Seerah' : 'السيرة النبوية'),
                source: opts.source || '',
                theme,
                isEn,
                language: isEn ? 'en' : 'ar',
                setToastMessage: (msg: string) => showToast(msg)
            });
        } catch (error) {
            console.error('Error sharing section image:', error);
            showToast(ui.toastShareFailed);
        } finally {
            setIsSharing(false);
        }
    };

    const renderActionButtons = (
        onShare: (e: React.MouseEvent) => void,
        onCopy: (e: React.MouseEvent) => void,
        onZoom: (e: React.MouseEvent) => void,
        extraNode?: React.ReactNode
    ) => (
        <div className="flex items-center gap-2 shrink-0 overflow-visible">
            <button
                type="button"
                onClick={onShare}
                disabled={isSharing}
                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                style={{ color: 'var(--text-color)' }}
                title={isSharing ? ui.preparingImage : ui.shareImage}
                aria-label={ui.shareImage}
            >
                {isSharing ? <i className="fa-solid fa-circle-notch fa-spin text-xs"></i> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
                type="button"
                onClick={onCopy}
                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                style={{ color: 'var(--text-color)' }}
                title={ui.copyText}
                aria-label={ui.copyText}
            >
                <i className="fa-regular fa-copy text-xs"></i>
            </button>
            <button
                type="button"
                onClick={onZoom}
                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                style={{ color: 'var(--text-color)' }}
                title={ui.zoom}
                aria-label={ui.zoom}
            >
                <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
            </button>
            {extraNode}
        </div>
    );

    // Filtering Milestones by Era
    const filteredMilestones = useMemo(() => {
        if (activeEraFilter === 'all') return allMilestones;
        return allMilestones.filter((m) => m.era === activeEraFilter);
    }, [allMilestones, activeEraFilter]);

    // Filtering Stances by Category
    const filteredStances = useMemo(() => {
        if (activeStanceCategory === 'all') return allStances;
        return allStances.filter((s) => s.category === activeStanceCategory);
    }, [allStances, activeStanceCategory]);

    // Current Index in Milestones for next/prev
    const currentMilestoneIndex = useMemo(() => {
        if (!selectedMilestone) return -1;
        return allMilestones.findIndex(m => m.id === selectedMilestone.id);
    }, [allMilestones, selectedMilestone?.id]);

    const prevMilestone = currentMilestoneIndex > 0 ? allMilestones[currentMilestoneIndex - 1] : null;
    const nextMilestone = currentMilestoneIndex >= 0 && currentMilestoneIndex < allMilestones.length - 1 
        ? allMilestones[currentMilestoneIndex + 1] 
        : null;

    const activeMilestone = useMemo(() => selectedMilestone ? getTranslatedMilestone(selectedMilestone, isEn) : null, [selectedMilestone, isEn]);
    const activeStance = useMemo(() => selectedStance ? getTranslatedStance(selectedStance, isEn) : null, [selectedStance, isEn]);


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
        if (selectedMilestone) {
            restoreScrollTargetRef.current = savedListScrollTopRef.current.timeline;
            setSelectedMilestone(null);
            return;
        }
        if (selectedStance) {
            restoreScrollTargetRef.current = savedListScrollTopRef.current.stances;
            setSelectedStance(null);
            return;
        }
        if (tabHistory.length > 1) {
            const nextHistory = [...tabHistory];
            nextHistory.pop();
            const prevTab = nextHistory[nextHistory.length - 1] || 'timeline';
            restoreScrollTargetRef.current = null;
            setTabHistory(nextHistory);
            setActiveTab(prevTab);
            scrollToTop();
            return;
        }
        if (activeTab !== 'timeline') {
            restoreScrollTargetRef.current = null;
            setActiveTab('timeline');
            setTabHistory(['timeline']);
            scrollToTop();
            return;
        }
        if (onBack) {
            onBack();
        } else {
            onNavigate('home');
        }
    }, [zoomedCard, selectedMilestone, selectedStance, tabHistory, activeTab, onBack, onNavigate, scrollToTop]);

    // Handle Phone / Hardware / Gesture Back Button
    useEffect(() => {
        const interceptor = () => {
            if (zoomedCard) {
                setZoomedCard(null);
                return true;
            }
            if (selectedMilestone) {
                restoreScrollTargetRef.current = savedListScrollTopRef.current.timeline;
                setSelectedMilestone(null);
                return true;
            }
            if (selectedStance) {
                restoreScrollTargetRef.current = savedListScrollTopRef.current.stances;
                setSelectedStance(null);
                return true;
            }
            if (tabHistory.length > 1) {
                const nextHistory = [...tabHistory];
                nextHistory.pop();
                const prevTab = nextHistory[nextHistory.length - 1] || 'timeline';
                restoreScrollTargetRef.current = null;
                setTabHistory(nextHistory);
                setActiveTab(prevTab);
                scrollToTop();
                return true;
            }
            if (activeTab !== 'timeline') {
                restoreScrollTargetRef.current = null;
                setActiveTab('timeline');
                setTabHistory(['timeline']);
                scrollToTop();
                return true;
            }
            // At root of PropheticSeerahPage -> let global back button exit to previous page / home
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedCard, selectedMilestone, selectedStance, tabHistory, activeTab, scrollToTop]);

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

            {/* Top Header */}
            <header className="app-top-bar z-20 shrink-0">
                <div className="app-top-bar__inner !px-2.5 sm:!px-5">
                    <div className="flex items-center justify-between gap-1.5 w-full min-h-[44px]">
                        {/* Start Side: Back button & Magnifying Glass */}
                        <div className="flex items-center gap-0.5 shrink-0">
                            <button
                                onClick={handleBackClick}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={ui.goBack}
                                aria-label={ui.goBack}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-lg sm:text-xl`}></i>
                            </button>
                            
                            {/* Magnifying Glass to scale text of all cards on the page */}
                            <button
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

                        {/* Concise Complete Title in Center (bounded between icon groups, zero overlap) */}
                        {(() => {
                            const topTitle = activeMilestone
                                ? getShortSeerahHeaderTitle(activeMilestone.id, activeMilestone.title, isEn)
                                : activeStance
                                ? getShortSeerahHeaderTitle(activeStance.id, activeStance.title, isEn)
                                : activeTab === 'timeline'
                                ? (isEn ? ui.pageTitle : 'السيرة النبوية')
                                : activeTab === 'stances'
                                ? ui.tabStancesFull
                                : ui.tabLineageFull;

                            return (
                                <div className="flex-1 min-w-0 flex items-center justify-center px-1 text-center">
                                    <h1 
                                        className={`app-top-bar__title ${isEn ? 'font-bold' : 'font-cairo'} transition-all whitespace-nowrap leading-snug`}
                                        style={{
                                            fontSize: isEn
                                                ? 'clamp(0.85rem, 3.6vw, 1.15rem)'
                                                : (selectedMilestone || selectedStance
                                                    ? 'clamp(0.95rem, 4vw, 1.2rem)'
                                                    : undefined)
                                        }}
                                    >
                                        {topTitle}
                                    </h1>
                                </div>
                            );
                        })()}

                        {/* End Side: Guide, ThemeLock & Home Button */}
                        <div className="flex items-center gap-0.5 shrink-0">
                            {!selectedMilestone && !selectedStance && showPageGuides && (
                                <button
                                    type="button"
                                    onClick={() => setShowGuide(true)}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    style={{ color: 'var(--top-bar-text, inherit)' }}
                                    title={isEn ? "Seerah Guide" : "دليل السيرة النبوية"}
                                    aria-label={isEn ? "Seerah Guide" : "دليل السيرة النبوية"}
                                >
                                    <i className="fa-solid fa-circle-question text-lg"></i>
                                </button>
                            )}
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={ui.home}
                                aria-label={ui.home}
                            >
                                <i className="fa-solid fa-house text-lg sm:text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Top Navigation Tabs - Embossed 3D Buttons */}
            {!selectedMilestone && !selectedStance && (
                <div className="seerah-tabs-nav px-4 pt-2 pb-2.5 shrink-0 overflow-visible">
                    <div className="max-w-3xl mx-auto flex items-center justify-center gap-2.5 overflow-visible">
                        {([
                            { id: 'timeline' as const, label: ui.tabTimeline },
                            { id: 'stances' as const, label: ui.tabStances },
                            { id: 'lineage' as const, label: ui.tabLineage },
                        ]).map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => switchTab(tab.id)}
                                    className={`app-page-card border-0 bg-white dark:bg-[#1E293B] flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'} transition-all flex items-center justify-center text-center cursor-pointer`}
                                    style={isActive ? {
                                        backgroundColor: primaryColor,
                                        color: themeActiveTextColor,
                                    } : {
                                        color: 'var(--text-color)',
                                    }}
                                >
                                    <span className="text-center block w-full">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Scoped CSS for scaling text strictly inside .seerah-card elements ONLY (tabs & chips are never touched) */}
            {cardTextScale > 1 && (
                <style>{`
                    .seerah-card p,
                    .seerah-card li,
                    .seerah-card blockquote,
                    .seerah-card .leading-relaxed {
                        font-size: calc(0.925rem * ${cardTextScale}) !important;
                        line-height: ${cardTextScale >= 1.3 ? '1.9' : '1.75'} !important;
                    }
                    .seerah-card h2:not(.seerah-autofit-heading) {
                        font-size: calc(1.35rem * ${cardTextScale}) !important;
                    }
                    .seerah-card h3:not(.seerah-autofit-heading) {
                        font-size: calc(1.15rem * ${cardTextScale}) !important;
                    }
                    .seerah-card h4:not(.seerah-autofit-heading),
                    .seerah-card h5:not(.seerah-autofit-heading) {
                        font-size: calc(1.05rem * ${cardTextScale}) !important;
                    }
                    .seerah-card .text-xs:not(button):not(.seerah-autofit-heading),
                    .seerah-card .text-\\[11px\\]:not(button):not(.seerah-autofit-heading),
                    .seerah-card .text-\\[10px\\]:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(0.775rem * ${cardTextScale}) !important;
                    }
                    .seerah-card .text-sm:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(0.875rem * ${cardTextScale}) !important;
                    }
                    .seerah-card .text-base:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(1rem * ${cardTextScale}) !important;
                    }
                    .seerah-card .text-lg:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(1.125rem * ${cardTextScale}) !important;
                    }
                    .seerah-card .text-xl:not(button):not(.seerah-autofit-heading) {
                        font-size: calc(1.25rem * ${cardTextScale}) !important;
                    }
                    .seerah-card .line-clamp-2 {
                        -webkit-line-clamp: 4 !important;
                    }
                    .seerah-card .line-clamp-3 {
                        -webkit-line-clamp: 5 !important;
                    }
                    .seerah-card button.rounded-full,
                    .seerah-card button.rounded-full i {
                        font-size: 0.75rem !important;
                    }
                `}</style>
            )}

            {/* Main Content Body */}
            <main ref={mainScrollRef} className={`flex-1 min-h-0 overflow-y-auto hide-scrollbar px-4 ${!selectedMilestone && !selectedStance ? 'pt-0' : 'pt-2'} app-scroll-safe`}>
                {/* 1. Milestone Detail View */}
                {selectedMilestone && activeMilestone ? (
                    <div
                        key={`detail-milestone-${activeMilestone.id}`}
                        className="max-w-2xl mx-auto space-y-4"
                    >
                            {/* Hero Card */}
                            <div 
                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-[18px] relative overflow-visible"
                            >
                                <div className="absolute inset-0 rounded-[18px] overflow-hidden pointer-events-none">
                                    <div 
                                        className="absolute -right-16 -top-16 w-44 h-44 rounded-full opacity-15 blur-3xl pointer-events-none"
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-2 mb-3 overflow-visible">
                                    <div className="flex items-center text-xs opacity-80 min-w-0">
                                        <span className="truncate">{activeMilestone.location}</span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 overflow-visible">
                                        <button
                                            type="button"
                                            onClick={() => handleShareCardImage(activeMilestone)}
                                            disabled={isSharing}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isSharing ? ui.preparingImage : ui.shareCardHighRes}
                                            aria-label={ui.shareCardHighRes}
                                        >
                                            {isSharing ? <i className="fa-solid fa-circle-notch fa-spin text-xs"></i> : <Share2 className="w-3.5 h-3.5" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyMilestone(activeMilestone)}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.copyAllData}
                                            aria-label={ui.copyAllData}
                                        >
                                            <i className="fa-regular fa-copy text-xs"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: activeMilestone.title,
                                                subtitle: `${activeMilestone.eraLabel} • ${activeMilestone.location}`,
                                                badge: activeMilestone.badge,
                                                icon: activeMilestone.icon,
                                                content: `${activeMilestone.summary}\n\n• ${ui.dateAndTime} ${activeMilestone.yearHijri ? `${activeMilestone.yearHijri} • ` : ''}${activeMilestone.yearGregorian}\n• ${ui.prophetAge} ${activeMilestone.ageOfProphet}`
                                            })}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                <AutoFitSingleLine
                                    as="h2"
                                    text={activeMilestone.title}
                                    baseFontSize={20}
                                    smFontSize={24}
                                    minFontSize={11}
                                    textScale={cardTextScale}
                                    className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'}`}
                                    style={{ color: themeHeadingColor }}
                                />

                                <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 app-3d-divider-top text-xs overflow-visible">
                                    <div className={`p-2.5 rounded-xl ${innerSubBoxClass}`}>
                                        <span className="opacity-60 block text-[10px]">{ui.dateAndTime}</span>
                                        <span className="font-bold">{activeMilestone.yearHijri ? `${activeMilestone.yearHijri} • ` : ''}{activeMilestone.yearGregorian}</span>
                                    </div>
                                    <div className={`p-2.5 rounded-xl ${innerSubBoxClass}`}>
                                        <span className="opacity-60 block text-[10px]">{ui.prophetAge}</span>
                                        <span className="font-bold">{activeMilestone.ageOfProphet}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Figures Tags */}
                            {activeMilestone.keyFigures && activeMilestone.keyFigures.length > 0 && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-visible">
                                        <h4 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                            <AutoFitSingleLine as="span" text={ui.keyFigures} baseFontSize={12} minFontSize={9.5} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </h4>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.keyFigures,
                                                text: activeMilestone.keyFigures!.map(person => `• ${person}`).join('\n'),
                                                category: activeMilestone.title,
                                                source: activeMilestone.badge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.keyFigures}\n${activeMilestone.keyFigures!.map(person => `• ${person}`).join('\n')}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.keyFigures,
                                                    subtitle: activeMilestone.title,
                                                    badge: activeMilestone.badge,
                                                    icon: 'fa-solid fa-users',
                                                    content: activeMilestone.keyFigures!.map(person => `• ${person}`).join('\n')
                                                });
                                            }
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {activeMilestone.keyFigures.map((person, idx) => (
                                            <span 
                                                key={idx} 
                                                className="app-3d-badge text-[11px] font-bold px-3 py-1 rounded-lg border-0 flex items-center"
                                                style={{ backgroundColor: hexToRgba(themeHeadingColor, 0.08), color: themeHeadingColor }}
                                            >
                                                {person}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Full Narrative Details */}
                            <div 
                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-[18px] space-y-3 overflow-visible"
                            >
                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                    <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                        <AutoFitSingleLine as="span" text={ui.milestoneDetailsTitle} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                    </h3>
                                    {renderActionButtons(
                                        (e) => handleShareSectionImage({
                                            title: ui.milestoneDetailsTitle,
                                            text: activeMilestone.details,
                                            category: activeMilestone.title,
                                            source: activeMilestone.badge
                                        }, e),
                                        (e) => handleCopySectionText(`${ui.milestoneDetailsTitle}\n\n${activeMilestone.details}`, e),
                                        (e) => {
                                            e.stopPropagation();
                                            setZoomedCard({
                                                title: ui.milestoneDetailsTitle,
                                                subtitle: activeMilestone.title,
                                                badge: activeMilestone.badge,
                                                icon: 'fa-solid fa-book-open',
                                                content: activeMilestone.details
                                            });
                                        }
                                    )}
                                </div>
                                <p className="text-sm sm:text-base leading-[1.8] opacity-90 font-medium whitespace-pre-line">
                                    {activeMilestone.details}
                                </p>
                            </div>

                            {/* 🎯 Strategic Impact */}
                            {activeMilestone.strategicImpact && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-visible">
                                        <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                            <AutoFitSingleLine as="span" text={ui.strategicImpact} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </h3>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.strategicImpact,
                                                text: activeMilestone.strategicImpact!,
                                                category: activeMilestone.title,
                                                source: activeMilestone.badge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.strategicImpact}\n\n${activeMilestone.strategicImpact!}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.strategicImpact,
                                                    subtitle: activeMilestone.title,
                                                    badge: activeMilestone.badge,
                                                    icon: 'fa-solid fa-chess',
                                                    content: activeMilestone.strategicImpact!
                                                });
                                            }
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm leading-[1.75] opacity-95 font-semibold">
                                        {activeMilestone.strategicImpact}
                                    </p>
                                </div>
                            )}

                            {/* 🤲 Prophetic Miracles & Duas */}
                            {activeMilestone.propheticMiraclesOrDuas && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-visible">
                                        <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                            <AutoFitSingleLine as="span" text={ui.miraclesAndDuas} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </h3>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.miraclesAndDuas,
                                                text: activeMilestone.propheticMiraclesOrDuas!,
                                                category: activeMilestone.title,
                                                source: activeMilestone.badge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.miraclesAndDuas}\n\n${activeMilestone.propheticMiraclesOrDuas!}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.miraclesAndDuas,
                                                    subtitle: activeMilestone.title,
                                                    badge: activeMilestone.badge,
                                                    icon: 'fa-solid fa-hand-holding-heart',
                                                    content: activeMilestone.propheticMiraclesOrDuas!
                                                });
                                            }
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm leading-[1.75] opacity-95 font-medium">
                                        {activeMilestone.propheticMiraclesOrDuas}
                                    </p>
                                </div>
                            )}

                            {/* 🔍 Historical Secrets */}
                            {activeMilestone.historicalSecrets && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-visible">
                                        <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                            <AutoFitSingleLine as="span" text={ui.historicalSecrets} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </h3>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.historicalSecrets,
                                                text: activeMilestone.historicalSecrets!,
                                                category: activeMilestone.title,
                                                source: activeMilestone.badge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.historicalSecrets}\n\n${activeMilestone.historicalSecrets!}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.historicalSecrets,
                                                    subtitle: activeMilestone.title,
                                                    badge: activeMilestone.badge,
                                                    icon: 'fa-solid fa-compass',
                                                    content: activeMilestone.historicalSecrets!
                                                });
                                            }
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm leading-[1.75] opacity-95 font-medium">
                                        {activeMilestone.historicalSecrets}
                                    </p>
                                </div>
                            )}

                            {/* Lessons and Moral Values */}
                            <div 
                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-3 overflow-visible"
                            >
                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                    <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                        <AutoFitSingleLine as="span" text={ui.lessonsTitle} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                    </h3>
                                    {renderActionButtons(
                                        (e) => handleShareSectionImage({
                                            title: ui.lessonsTitle,
                                            text: activeMilestone.lessons.map((l, idx) => `${idx + 1}. ${l}`).join('\n\n'),
                                            category: activeMilestone.title,
                                            source: activeMilestone.badge
                                        }, e),
                                        (e) => handleCopySectionText(`${ui.lessonsTitle}\n\n${activeMilestone.lessons.map((l, idx) => `${idx + 1}. ${l}`).join('\n')}`, e),
                                        (e) => {
                                            e.stopPropagation();
                                            setZoomedCard({
                                                title: ui.lessonsTitle,
                                                subtitle: activeMilestone.title,
                                                badge: activeMilestone.badge,
                                                icon: 'fa-solid fa-lightbulb',
                                                content: activeMilestone.lessons
                                            });
                                        }
                                    )}
                                </div>
                                <div className="space-y-2.5">
                                    {activeMilestone.lessons.map((lesson, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5" style={itemBadge3DStyle}>
                                                {idx + 1}
                                            </span>
                                            <p className="flex-1 font-medium">{lesson}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Proof Quote */}
                            {(activeMilestone.versesOrHadiths || activeMilestone.proof) && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-[18px] text-xs overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5 overflow-visible">
                                        <span className={`font-bold flex items-center min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                            <AutoFitSingleLine as="span" text={ui.proofTitle} baseFontSize={12} minFontSize={9.5} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </span>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.proofTitle,
                                                text: (activeMilestone.versesOrHadiths || activeMilestone.proof)!,
                                                category: activeMilestone.title,
                                                source: activeMilestone.badge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.proofTitle}\n${(activeMilestone.versesOrHadiths || activeMilestone.proof)!}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.proofTitle,
                                                    subtitle: activeMilestone.title,
                                                    badge: activeMilestone.badge,
                                                    icon: 'fa-solid fa-quote-right',
                                                    content: (activeMilestone.versesOrHadiths || activeMilestone.proof)!,
                                                    isVerseOrProof: true
                                                });
                                            }
                                        )}
                                    </div>
                                    <p className="italic opacity-90 leading-relaxed font-semibold">
                                        {activeMilestone.versesOrHadiths || activeMilestone.proof}
                                    </p>
                                </div>
                            )}

                            {/* Next / Previous Milestones Navigation */}
                            <div className="grid grid-cols-2 gap-3 pt-3 pb-2">
                                {prevMilestone ? (
                                    <button
                                        onClick={() => handleSelectMilestone(prevMilestone)}
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-[16px] flex items-center justify-center text-center transition-all cursor-pointer"
                                    >
                                        <span className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>{ui.prevMilestone}</span>
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {nextMilestone ? (
                                    <button
                                        onClick={() => handleSelectMilestone(nextMilestone)}
                                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-[16px] flex items-center justify-center text-center transition-all cursor-pointer"
                                    >
                                        <span className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>{ui.nextMilestone}</span>
                                    </button>
                                ) : (
                                    <div />
                                )}
                            </div>
                        </div>
                    ) : selectedStance && activeStance ? (
                        /* 2. Stance Detail View */
                        <div
                            key={`detail-stance-${activeStance.id}`}
                            className="max-w-2xl mx-auto space-y-4"
                        >
                            <div 
                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-[18px] relative overflow-visible"
                            >
                                <div className="flex items-center justify-between gap-2 mb-3 overflow-visible">
                                    {activeStance.year ? (
                                        <span className="text-xs font-bold opacity-75 truncate">{activeStance.year}</span>
                                    ) : (
                                        <div />
                                    )}
                                    <div className="flex items-center gap-2 shrink-0 overflow-visible">
                                        <button
                                            type="button"
                                            onClick={() => handleShareStanceImage(activeStance)}
                                            disabled={isSharing}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isSharing ? ui.preparingImage : ui.shareStanceCard}
                                            aria-label={ui.shareStanceCard}
                                        >
                                            {isSharing ? <i className="fa-solid fa-circle-notch fa-spin text-xs"></i> : <Share2 className="w-3.5 h-3.5" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyStance(activeStance)}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.copyStanceDetails}
                                            aria-label={ui.copyStanceDetails}
                                        >
                                            <i className="fa-regular fa-copy text-xs"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: activeStance.title,
                                                subtitle: activeStance.categoryBadge,
                                                badge: activeStance.categoryBadge,
                                                icon: activeStance.icon,
                                                content: `«${activeStance.quote}»\n\n${activeStance.situation}`
                                            })}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                <AutoFitSingleLine
                                    as="h2"
                                    text={activeStance.title}
                                    baseFontSize={20}
                                    smFontSize={24}
                                    minFontSize={11}
                                    textScale={cardTextScale}
                                    className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'}`}
                                    style={{ color: themeHeadingColor }}
                                />

                                {/* Prophetic Immortal Quote Callout */}
                                <div 
                                    className={`mt-4 p-4 rounded-2xl overflow-visible ${innerSubBoxClass}`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5 overflow-visible">
                                        <span className="text-[10px] font-bold" style={{ color: themeHeadingColor }}>
                                            {ui.immortalQuote}
                                        </span>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.immortalQuote,
                                                text: `«${activeStance.quote}»`,
                                                category: activeStance.title,
                                                source: activeStance.categoryBadge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.immortalQuote}\n«${activeStance.quote}»`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.immortalQuote,
                                                    subtitle: activeStance.title,
                                                    badge: activeStance.categoryBadge,
                                                    icon: 'fa-solid fa-quote-right',
                                                    content: `«${activeStance.quote}»`
                                                });
                                            }
                                        )}
                                    </div>
                                    <p className={`text-base sm:text-lg font-bold text-center ${isEn ? 'font-sans' : 'font-cairo'} leading-relaxed`} style={{ color: themeHeadingColor }}>
                                        «{activeStance.quote}»
                                    </p>
                                </div>
                            </div>

                            {/* The Situation Context */}
                            <div 
                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                            >
                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                    <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2 min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                        <i className="fa-solid fa-scroll text-sm shrink-0"></i>
                                        <AutoFitSingleLine as="span" text={ui.situationContext} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                    </h3>
                                    {renderActionButtons(
                                        (e) => handleShareSectionImage({
                                            title: ui.situationContext,
                                            text: activeStance.situation,
                                            category: activeStance.title,
                                            source: activeStance.categoryBadge
                                        }, e),
                                        (e) => handleCopySectionText(`${ui.situationContext}\n\n${activeStance.situation}`, e),
                                        (e) => {
                                            e.stopPropagation();
                                            setZoomedCard({
                                                title: ui.situationContext,
                                                subtitle: activeStance.title,
                                                badge: activeStance.categoryBadge,
                                                icon: 'fa-solid fa-scroll',
                                                content: activeStance.situation
                                            });
                                        }
                                    )}
                                </div>
                                <p className="text-sm sm:text-base leading-[1.8] opacity-90 font-medium whitespace-pre-line">
                                    {activeStance.situation}
                                </p>
                            </div>

                            {/* 💬 Detailed Dialogue */}
                            {activeStance.detailedDialogue && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-visible">
                                        <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2 min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-comments text-sm shrink-0"></i>
                                            <AutoFitSingleLine as="span" text={ui.dialogueTitle} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </h3>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.dialogueTitle,
                                                text: activeStance.detailedDialogue!,
                                                category: activeStance.title,
                                                source: activeStance.categoryBadge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.dialogueTitle}\n\n${activeStance.detailedDialogue!}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.dialogueTitle,
                                                    subtitle: activeStance.title,
                                                    badge: activeStance.categoryBadge,
                                                    icon: 'fa-solid fa-comments',
                                                    content: activeStance.detailedDialogue!
                                                });
                                            }
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm leading-[1.75] opacity-95 font-semibold whitespace-pre-line">
                                        {activeStance.detailedDialogue}
                                    </p>
                                </div>
                            )}

                            {/* 🧠 Psychological & Leadership Analysis */}
                            {activeStance.psychologicalAnalysis && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-visible">
                                        <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2 min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-brain text-sm shrink-0"></i>
                                            <AutoFitSingleLine as="span" text={ui.psychologicalAnalysis} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </h3>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.psychologicalAnalysis,
                                                text: activeStance.psychologicalAnalysis!,
                                                category: activeStance.title,
                                                source: activeStance.categoryBadge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.psychologicalAnalysis}\n\n${activeStance.psychologicalAnalysis!}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.psychologicalAnalysis,
                                                    subtitle: activeStance.title,
                                                    badge: activeStance.categoryBadge,
                                                    icon: 'fa-solid fa-brain',
                                                    content: activeStance.psychologicalAnalysis!
                                                });
                                            }
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm leading-[1.75] opacity-95 font-medium">
                                        {activeStance.psychologicalAnalysis}
                                    </p>
                                </div>
                            )}

                            {/* 🌍 Contemporary Reflection */}
                            {activeStance.contemporaryReflection && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-visible">
                                        <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2 min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-globe text-sm shrink-0"></i>
                                            <AutoFitSingleLine as="span" text={ui.contemporaryReflection} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </h3>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.contemporaryReflection,
                                                text: activeStance.contemporaryReflection!,
                                                category: activeStance.title,
                                                source: activeStance.categoryBadge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.contemporaryReflection}\n\n${activeStance.contemporaryReflection!}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.contemporaryReflection,
                                                    subtitle: activeStance.title,
                                                    badge: activeStance.categoryBadge,
                                                    icon: 'fa-solid fa-globe',
                                                    content: activeStance.contemporaryReflection!
                                                });
                                            }
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm leading-[1.75] opacity-95 font-medium">
                                        {activeStance.contemporaryReflection}
                                    </p>
                                </div>
                            )}

                            {/* 🛠️ Practical Application Steps */}
                            {activeStance.practicalApplication && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-visible">
                                        <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2 min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-check-to-slot text-sm shrink-0"></i>
                                            <AutoFitSingleLine as="span" text={ui.practicalApplication} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </h3>
                                        {renderActionButtons(
                                            (e) => handleShareSectionImage({
                                                title: ui.practicalApplication,
                                                text: activeStance.practicalApplication!,
                                                category: activeStance.title,
                                                source: activeStance.categoryBadge
                                            }, e),
                                            (e) => handleCopySectionText(`${ui.practicalApplication}\n\n${activeStance.practicalApplication!}`, e),
                                            (e) => {
                                                e.stopPropagation();
                                                setZoomedCard({
                                                    title: ui.practicalApplication,
                                                    subtitle: activeStance.title,
                                                    badge: activeStance.categoryBadge,
                                                    icon: 'fa-solid fa-check-to-slot',
                                                    content: activeStance.practicalApplication!
                                                });
                                            }
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm leading-[1.75] opacity-95 font-medium whitespace-pre-line">
                                        {activeStance.practicalApplication}
                                    </p>
                                </div>
                            )}

                            {/* The Moral Lesson */}
                            <div 
                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                            >
                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                    <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2 min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                        <i className="fa-solid fa-lightbulb text-sm shrink-0"></i>
                                        <AutoFitSingleLine as="span" text={ui.moralLesson} baseFontSize={14} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                    </h3>
                                    {renderActionButtons(
                                        (e) => handleShareSectionImage({
                                            title: ui.moralLesson,
                                            text: activeStance.moralLesson,
                                            category: activeStance.title,
                                            source: activeStance.categoryBadge
                                        }, e),
                                        (e) => handleCopySectionText(`${ui.moralLesson}\n\n${activeStance.moralLesson}`, e),
                                        (e) => {
                                            e.stopPropagation();
                                            setZoomedCard({
                                                title: ui.moralLesson,
                                                subtitle: activeStance.title,
                                                badge: activeStance.categoryBadge,
                                                icon: 'fa-solid fa-lightbulb',
                                                content: activeStance.moralLesson
                                            });
                                        }
                                    )}
                                </div>
                                <p className="text-sm sm:text-base leading-[1.75] font-semibold">
                                    {activeStance.moralLesson}
                                </p>
                            </div>

                            {/* Proof Documentation */}
                            <div 
                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-[18px] text-xs overflow-visible"
                            >
                                <div className="flex items-center justify-between gap-2 mb-1 overflow-visible">
                                    <span className={`font-bold flex items-center gap-1.5 min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                        <i className="fa-solid fa-check-double shrink-0"></i>
                                        <AutoFitSingleLine as="span" text={ui.proofSource} baseFontSize={12} minFontSize={9.5} textScale={cardTextScale} className="min-w-0 flex-1" />
                                    </span>
                                    {renderActionButtons(
                                        (e) => handleShareSectionImage({
                                            title: ui.proofSource,
                                            text: activeStance.proof,
                                            category: activeStance.title,
                                            source: activeStance.categoryBadge
                                        }, e),
                                        (e) => handleCopySectionText(`${ui.proofSource}\n${activeStance.proof}`, e),
                                        (e) => {
                                            e.stopPropagation();
                                            setZoomedCard({
                                                title: ui.proofSource,
                                                subtitle: activeStance.title,
                                                badge: activeStance.categoryBadge,
                                                icon: 'fa-solid fa-check-double',
                                                content: activeStance.proof,
                                                isVerseOrProof: true
                                            });
                                        }
                                    )}
                                </div>
                                <p className="opacity-90 leading-relaxed font-semibold">
                                    {activeStance.proof}
                                </p>
                            </div>
                        </div>
                    ) : activeTab === 'lineage' ? (
                        /* 3. Noble Lineage View (نسب النبي ﷺ كاملاً وصولاً إلى إبراهيم عليه السلام مع أقسام مفصلة) */
                        <div
                            key="lineage-view"
                            className="space-y-1 max-w-3xl mx-auto"
                        >
                            {/* Sub-Navigation Tabs within Lineage View */}
                            <div 
                                className="filter-chips-nav flex items-center gap-2 overflow-x-auto pt-1 pb-2.5 px-1 hide-scrollbar"
                            >
                                {[
                                    { id: 'tree', label: ui.lineageTabTree, icon: 'fa-sitemap' },
                                    { id: 'mother', label: ui.lineageTabMother, icon: 'fa-heart' },
                                    { id: 'names', label: ui.lineageTabNames, icon: 'fa-sparkles' },
                                    { id: 'nurses', label: ui.lineageTabNurses, icon: 'fa-baby' },
                                    { id: 'characteristics', label: ui.lineageTabCharacteristics, icon: 'fa-sun' },
                                    { id: 'virtues', label: ui.lineageTabVirtues, icon: 'fa-certificate' },
                                ].map((tab) => {
                                    const isActive = lineageTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setLineageTab(tab.id as any)}
                                            className={`app-page-card border-0 bg-white dark:bg-[#1E293B] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${isEn ? 'font-sans' : 'font-cairo'}`}
                                            style={isActive ? {
                                                backgroundColor: primaryColor,
                                                color: themeActiveTextColor
                                            } : {
                                                color: 'var(--text-color)'
                                            }}
                                        >
                                            <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Lineage Hero Card */}
                            {lineageTab === 'tree' && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 sm:p-7 rounded-[18px] relative overflow-visible text-center space-y-4"
                                >
                                    <div className="flex items-center justify-end gap-2 overflow-visible">
                                        <button
                                            type="button"
                                            onClick={handleShareLineageImage}
                                            disabled={isSharing}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isSharing ? ui.preparingImage : ui.shareLineagePoster}
                                            aria-label={ui.shareLineagePoster}
                                        >
                                            {isSharing ? <i className="fa-solid fa-circle-notch fa-spin text-xs"></i> : <Share2 className="w-3.5 h-3.5" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyLineage('tree')}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.copyLineageAll}
                                            aria-label={ui.copyLineageAll}
                                        >
                                            <i className="fa-regular fa-copy text-xs"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: activeLineageData.fullName,
                                                subtitle: ui.lineageBadge,
                                                badge: isEn ? 'Noble Lineage' : 'النسب الشريف',
                                                icon: 'fa-solid fa-crown',
                                                content: `• ${ui.fullLineTitle}\n${activeLineageData.fullText}`
                                            })}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>

                                    <AutoFitSingleLine
                                        as="h2"
                                        text={activeLineageData.fullName}
                                        baseFontSize={22}
                                        smFontSize={28}
                                        minFontSize={11}
                                        textScale={cardTextScale}
                                        className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'}`}
                                        style={{ color: themeHeadingColor }}
                                    />

                                    {/* Full Connected Lineage Paragraph */}
                                    <div 
                                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-[1.8] font-medium relative overflow-visible ${innerSubBoxClass} ${isEn ? 'text-left' : 'text-right'}`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1.5 overflow-visible">
                                            <span className={`font-bold block min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                {ui.fullLineTitle}
                                            </span>
                                            {renderActionButtons(
                                                (e) => handleShareSectionImage({
                                                    title: ui.fullLineTitle,
                                                    text: activeLineageData.fullText,
                                                    category: activeLineageData.fullName,
                                                    source: isEn ? 'Noble Lineage' : 'النسب الشريف'
                                                }, e),
                                                (e) => handleCopySectionText(`${ui.fullLineTitle}\n${activeLineageData.fullText}`, e),
                                                (e) => {
                                                    e.stopPropagation();
                                                    setZoomedCard({
                                                        title: ui.fullLineTitle,
                                                        subtitle: activeLineageData.fullName,
                                                        badge: isEn ? 'Noble Lineage' : 'النسب الشريف',
                                                        icon: 'fa-solid fa-sitemap',
                                                        content: activeLineageData.fullText
                                                    });
                                                }
                                            )}
                                        </div>
                                        <p className="opacity-95 leading-loose">
                                            {activeLineageData.fullText}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 1: Ancestors with Stories */}
                            {lineageTab === 'tree' && (
                                <div className="space-y-3 mt-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-users-rays"></i>
                                            {ui.ancestorsTitle}
                                        </h3>
                                    </div>

                                    <div className="space-y-3 pb-2">
                                        {activeLineageData.ancestors.map((anc, idx) => (
                                            <div 
                                                key={idx}
                                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 transition-all overflow-visible"
                                            >
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        <span 
                                                            className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                                                            style={itemBadge3DStyle}
                                                        >
                                                            {idx + 1}
                                                        </span>
                                                        <AutoFitSingleLine
                                                            as="span"
                                                            text={anc.name}
                                                            baseFontSize={16}
                                                            minFontSize={10}
                                                            textScale={cardTextScale}
                                                            className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                                            style={{ color: themeHeadingColor }}
                                                        />
                                                    </div>
                                                    {renderActionButtons(
                                                        (e) => handleShareSectionImage({
                                                            title: anc.name,
                                                            text: `${anc.significance}${anc.story ? `\n\n• ${ui.ancestorStoryTitle}\n${anc.story}` : ''}`,
                                                            category: anc.title || (isEn ? 'Noble Forefathers & Ancestors of the Prophet ﷺ' : 'سلسلة آباء وأجداد النبي ﷺ'),
                                                            source: `${isEn ? 'Ancestor' : 'الجد'} ${idx + 1}`
                                                        }, e),
                                                        (e) => handleCopySectionText(`${anc.name}${anc.title ? ` (${anc.title})` : ''}\n${anc.significance}${anc.story ? `\n\n${ui.ancestorStoryTitle}\n${anc.story}` : ''}`, e),
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: anc.name,
                                                                subtitle: anc.title || (isEn ? 'Noble Forefathers & Ancestors of the Prophet ﷺ' : 'سلسلة آباء وأجداد النبي ﷺ'),
                                                                badge: `${isEn ? 'Ancestor' : 'الجد'} ${idx + 1}`,
                                                                icon: 'fa-solid fa-user-shield',
                                                                content: `${anc.significance}${anc.story ? `\n\n• ${ui.ancestorStoryTitle}\n${anc.story}` : ''}`
                                                            });
                                                        }
                                                    )}
                                                </div>

                                                <p className="text-xs opacity-85 leading-[1.75] font-semibold">
                                                    {anc.significance}
                                                </p>

                                                {anc.story && (
                                                    <div 
                                                        className={`p-3 rounded-xl text-xs leading-[1.75] ${innerSubBoxClass}`}
                                                    >
                                                        <span className={`font-bold block text-[11px] mb-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                            {ui.ancestorStoryTitle}
                                                        </span>
                                                        <p className="opacity-90 leading-relaxed font-normal">
                                                            {anc.story}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 2: Mother's Lineage */}
                            {lineageTab === 'mother' && (
                                <div 
                                    className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-[18px] space-y-4 overflow-visible"
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-visible">
                                        <h3 className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2 min-w-0 flex-1`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-heart text-base shrink-0"></i>
                                            <AutoFitSingleLine as="span" text={ui.motherLineageTitle} baseFontSize={16} minFontSize={10} textScale={cardTextScale} className="min-w-0 flex-1" />
                                        </h3>
                                        <div className="flex items-center gap-2 shrink-0 overflow-visible">
                                            <button
                                                type="button"
                                                onClick={() => handleShareLineageSubTabImage('mother')}
                                                disabled={isSharing}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                                title={isSharing ? ui.preparingImage : ui.shareCardHighRes}
                                                aria-label={ui.shareCardHighRes}
                                            >
                                                {isSharing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <Share2 className="w-3.5 h-3.5" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyLineage('mother')}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                                title={ui.copyAllData}
                                                aria-label={ui.copyAllData}
                                            >
                                                <i className="fa-regular fa-copy"></i>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: activeLineageData.motherLineage.fullName,
                                                    subtitle: ui.motherLineageTitle,
                                                    badge: isEn ? "Prophet's Mother ﷺ" : 'أم النبي ﷺ',
                                                    icon: 'fa-solid fa-heart',
                                                    content: `${activeLineageData.motherLineage.tribe}\n\n• ${ui.meetingPointTitle}\n${activeLineageData.motherLineage.meetingPoint}\n\n• ${isEn ? 'Historical Details & Status:' : 'التفاصيل والمكانة:'}\n${activeLineageData.motherLineage.details}`
                                                })}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                                aria-label={ui.zoom}
                                            >
                                                <i className="fa-solid fa-magnifying-glass-plus"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div 
                                        className={`p-4 rounded-xl space-y-2 ${innerSubBoxClass}`}
                                    >
                                        <span className={`text-xs font-bold block ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                            {activeLineageData.motherLineage.fullName}
                                        </span>
                                        <p className="text-xs opacity-90 font-semibold">
                                            {activeLineageData.motherLineage.tribe}
                                        </p>
                                    </div>

                                    <div 
                                        className={`p-4 rounded-xl space-y-2 text-xs leading-[1.75] overflow-visible ${innerSubBoxClass}`}
                                    >
                                        <div className="flex items-center justify-between gap-2 overflow-visible">
                                            <span className={`font-bold block min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: themeHeadingColor }}>
                                                {ui.meetingPointTitle}
                                            </span>
                                            {renderActionButtons(
                                                (e) => handleShareSectionImage({
                                                    title: ui.meetingPointTitle,
                                                    text: `${activeLineageData.motherLineage.meetingPoint}\n\n${activeLineageData.motherLineage.details}`,
                                                    category: activeLineageData.motherLineage.fullName,
                                                    source: isEn ? 'Convergence of Lineages' : 'ملتقى النسبين'
                                                }, e),
                                                (e) => handleCopySectionText(`${ui.meetingPointTitle}\n${activeLineageData.motherLineage.meetingPoint}\n\n${activeLineageData.motherLineage.details}`, e),
                                                (e) => {
                                                    e.stopPropagation();
                                                    setZoomedCard({
                                                        title: ui.meetingPointTitle,
                                                        subtitle: activeLineageData.motherLineage.fullName,
                                                        badge: isEn ? 'Convergence of Lineages' : 'ملتقى النسبين',
                                                        icon: 'fa-solid fa-link',
                                                        content: `${activeLineageData.motherLineage.meetingPoint}\n\n${activeLineageData.motherLineage.details}`
                                                    });
                                                }
                                            )}
                                        </div>
                                        <p className="font-semibold opacity-95">
                                            {activeLineageData.motherLineage.meetingPoint}
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-xs sm:text-sm leading-[1.8] opacity-90 font-medium">
                                        <p className="whitespace-pre-line">
                                            {activeLineageData.motherLineage.details}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 3: Prophetic Names */}
                            {lineageTab === 'names' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-sparkles"></i>
                                            {ui.namesTitle} ({activeLineageData.propheticNames.length} {isEn ? 'blessed names' : 'اسماً مباركاً'})
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                                        {activeLineageData.propheticNames.map((pn, i) => (
                                            <div 
                                                key={i}
                                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 overflow-visible"
                                            >
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <AutoFitSingleLine
                                                        as="span"
                                                        text={pn.name}
                                                        baseFontSize={16}
                                                        minFontSize={10}
                                                        textScale={cardTextScale}
                                                        className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                                        style={{ color: themeHeadingColor }}
                                                    />
                                                    {renderActionButtons(
                                                        (e) => handleShareSectionImage({
                                                            title: pn.name,
                                                            text: `${pn.meaning}\n\n• ${ui.hadithSource}\n${pn.source}`,
                                                            category: ui.namesTitle,
                                                            source: pn.source
                                                        }, e),
                                                        (e) => handleCopySectionText(`${pn.name}\n${pn.meaning}\n(${pn.source})`, e),
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: pn.name,
                                                                subtitle: pn.source,
                                                                badge: `${isEn ? 'Blessed Name' : 'الاسم المبارك'} ${i + 1}`,
                                                                icon: 'fa-solid fa-sparkles',
                                                                content: `${pn.meaning}\n\n• ${ui.hadithSource}\n${pn.source}`
                                                            });
                                                        },
                                                        <span 
                                                            className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0"
                                                            style={itemBadge3DStyle}
                                                        >
                                                            {i + 1}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs leading-[1.75] opacity-90 font-medium">
                                                    {pn.meaning}
                                                </p>
                                                <div className="opacity-60 app-3d-divider-top pt-1.5 font-mono">
                                                    <AutoFitSingleLine
                                                        as="span"
                                                        text={pn.source}
                                                        baseFontSize={10}
                                                        minFontSize={7.5}
                                                        textScale={cardTextScale}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 4: Nurses and Foster Brothers */}
                            {lineageTab === 'nurses' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-baby"></i>
                                            {ui.nursesTitle}
                                        </h3>
                                    </div>

                                    <div className="space-y-3 pb-2">
                                        {activeLineageData.nursesAndFosterBrothers.map((nb, i) => (
                                            <div 
                                                key={i}
                                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 overflow-visible"
                                            >
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <AutoFitSingleLine
                                                        as="span"
                                                        text={nb.person}
                                                        baseFontSize={15}
                                                        minFontSize={10}
                                                        textScale={cardTextScale}
                                                        className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                                        style={{ color: themeHeadingColor }}
                                                    />
                                                    {renderActionButtons(
                                                        (e) => handleShareSectionImage({
                                                            title: nb.person,
                                                            text: nb.details,
                                                            category: ui.nursesTitle,
                                                            source: nb.role
                                                        }, e),
                                                        (e) => handleCopySectionText(`${nb.person} (${nb.role})\n${nb.details}`, e),
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: nb.person,
                                                                subtitle: nb.role,
                                                                badge: nb.role,
                                                                icon: 'fa-solid fa-baby',
                                                                content: nb.details
                                                            });
                                                        }
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-bold opacity-70 truncate">
                                                    {nb.role}
                                                </p>
                                                <p className="text-xs opacity-90 leading-[1.75] font-medium">
                                                    {nb.details}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 5: Noble Characteristics (الشمائل المحمدية الشريفة) */}
                            {lineageTab === 'characteristics' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-sun"></i>
                                            {ui.characteristicsTitle} ({activeLineageData.nobleCharacteristics.length} {isEn ? 'sublime characteristics' : 'شَميلة خَلقية وخُلقية'})
                                        </h3>
                                    </div>

                                    <div className="space-y-3.5 pb-2">
                                        {activeLineageData.nobleCharacteristics.map((c, i) => (
                                            <div 
                                                key={i}
                                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-2.5 overflow-visible"
                                            >
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <AutoFitSingleLine
                                                        as="h4"
                                                        text={c.title}
                                                        baseFontSize={16}
                                                        minFontSize={10}
                                                        textScale={cardTextScale}
                                                        className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                                        style={{ color: themeHeadingColor }}
                                                    />
                                                    {renderActionButtons(
                                                        (e) => handleShareSectionImage({
                                                            title: c.title,
                                                            text: `${c.description}\n\n• ${ui.hadithSource}\n${c.hadithRef}`,
                                                            category: c.category,
                                                            source: c.hadithRef
                                                        }, e),
                                                        (e) => handleCopySectionText(`${c.title} [${c.category}]\n${c.description}\n(${c.hadithRef})`, e),
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: c.title,
                                                                subtitle: c.hadithRef,
                                                                badge: c.category,
                                                                icon: 'fa-solid fa-sun',
                                                                content: `${c.description}\n\n• ${ui.hadithSource}\n${c.hadithRef}`
                                                            });
                                                        },
                                                        <span 
                                                            className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0"
                                                            style={itemBadge3DStyle}
                                                        >
                                                            {i + 1}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs sm:text-sm leading-[1.8] opacity-95 font-medium whitespace-pre-line">
                                                    {c.description}
                                                </p>

                                                <div className="opacity-60 pt-1.5 app-3d-divider-top font-mono">
                                                    <AutoFitSingleLine
                                                        as="span"
                                                        text={c.hadithRef}
                                                        baseFontSize={10}
                                                        minFontSize={7.5}
                                                        textScale={cardTextScale}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 6: Virtues and Hadiths of Selection */}
                            {lineageTab === 'virtues' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'} flex items-center gap-2`} style={{ color: themeHeadingColor }}>
                                            <i className="fa-solid fa-certificate"></i>
                                            {ui.virtuesTitle}
                                        </h3>
                                    </div>

                                    <div className="space-y-3 pb-2">
                                        {activeLineageData.virtues.map((v, i) => (
                                            <div 
                                                key={i} 
                                                className="seerah-card app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-2 overflow-visible"
                                            >
                                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                                    <AutoFitSingleLine
                                                        as="span"
                                                        text={v.title}
                                                        baseFontSize={13}
                                                        minFontSize={9.5}
                                                        textScale={cardTextScale}
                                                        className={`font-bold min-w-0 flex-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                                        style={{ color: themeHeadingColor }}
                                                    />
                                                    {renderActionButtons(
                                                        (e) => handleShareSectionImage({
                                                            title: v.title,
                                                            text: `«${v.hadith}»`,
                                                            category: ui.nobleHadithBadge,
                                                            source: v.source
                                                        }, e),
                                                        (e) => handleCopySectionText(`${v.title}\n«${v.hadith}»\n(${v.source})`, e),
                                                        (e) => {
                                                            e.stopPropagation();
                                                            setZoomedCard({
                                                                title: v.title,
                                                                subtitle: v.source,
                                                                badge: ui.nobleHadithBadge,
                                                                icon: 'fa-solid fa-certificate',
                                                                content: `«${v.hadith}»\n\n[ ${v.source} ]`,
                                                                isVerseOrProof: true
                                                            });
                                                        }
                                                    )}
                                                </div>
                                                <p className="text-xs sm:text-sm italic font-semibold leading-[1.8] opacity-95">
                                                    {v.hadith}
                                                </p>
                                                <AutoFitSingleLine
                                                    as="span"
                                                    text={v.source}
                                                    baseFontSize={10}
                                                    minFontSize={7.5}
                                                    textScale={cardTextScale}
                                                    className={`opacity-65 font-mono w-full ${isEn ? 'text-right' : 'text-left'}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'stances' ? (
                        /* 4. Immortal Stances View (مواقف خالدة للمصطفى ﷺ) */
                        <div
                            key="stances-view"
                            className="space-y-1 max-w-3xl mx-auto"
                        >
                            {/* Category Filter */}
                            <div className="space-y-2.5">
                                {/* Category Chips */}
                                <div className="filter-chips-nav flex items-center gap-2 overflow-x-auto pt-1 pb-2.5 px-1 hide-scrollbar">
                                    {[
                                        { id: 'all', label: isEn ? 'All' : 'الكل' },
                                        { id: 'رحمة وعفو', label: isEn ? 'Mercy' : 'الرحمة' },
                                        { id: 'شجاعة وثبات', label: isEn ? 'Courage' : 'الشجاعة' },
                                        { id: 'حلم وتواضع', label: isEn ? 'Humility' : 'الحلم' },
                                        { id: 'وفاء وأمانة', label: isEn ? 'Loyalty' : 'الوفاء' },
                                        { id: 'شورى وعدالة', label: isEn ? 'Justice' : 'العدالة' },
                                        { id: 'رفق بالخلق', label: isEn ? 'Kindness' : 'الرفق' },
                                    ].map((cat) => {
                                        const isActive = activeStanceCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveStanceCategory(cat.id)}
                                                className={`app-page-card border-0 bg-white dark:bg-[#1E293B] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${isEn ? 'font-sans' : 'font-cairo'}`}
                                                style={isActive ? {
                                                    backgroundColor: primaryColor,
                                                    color: themeActiveTextColor
                                                } : {
                                                    color: 'var(--text-color)'
                                                }}
                                            >
                                                <span>{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Stances Cards Grid */}
                            <div className="space-y-4 pb-2">
                                {filteredStances.map((stance) => (
                                    <div
                                        key={stance.id}
                                        onClick={() => handleSelectStance(stance)}
                                        className="seerah-card app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 cursor-pointer relative overflow-visible group"
                                    >
                                        <div className="flex items-center justify-between gap-2 overflow-visible">
                                            {stance.year ? (
                                                <span className="text-[11px] opacity-65 font-bold truncate">{stance.year}</span>
                                            ) : (
                                                <div />
                                            )}
                                            <div className="flex items-center gap-2 shrink-0 overflow-visible">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyStance(stance);
                                                    }}
                                                    title={ui.copyStanceDetails}
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                    style={{ color: 'var(--text-color)' }}
                                                >
                                                    <i className="fa-regular fa-copy"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setZoomedCard({
                                                            title: stance.title,
                                                            subtitle: stance.categoryBadge,
                                                            badge: stance.categoryBadge,
                                                            icon: stance.icon,
                                                            content: `«${stance.quote}»\n\n${stance.situation}`
                                                        });
                                                    }}
                                                    title={ui.zoom}
                                                    aria-label={ui.zoom}
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                    style={{ color: 'var(--text-color)' }}
                                                >
                                                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => handleShareStanceImage(stance, e)}
                                                    title={ui.shareStanceCard}
                                                    className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                    style={{ color: 'var(--text-color)' }}
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <AutoFitSingleLine
                                            as="h3"
                                            text={stance.title}
                                            baseFontSize={16}
                                            smFontSize={18}
                                            minFontSize={10}
                                            textScale={cardTextScale}
                                            className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} transition-colors`}
                                            style={{ color: themeHeadingColor }}
                                        />

                                        {/* Immortal Quote Preview */}
                                        <div 
                                            className={`p-3.5 rounded-xl text-center ${innerSubBoxClass}`}
                                        >
                                            <p className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-cairo'} line-clamp-2`} style={{ color: themeHeadingColor }}>
                                                «{stance.quote}»
                                            </p>
                                        </div>

                                        <p className="text-xs sm:text-sm opacity-85 leading-[1.75] line-clamp-2">
                                            {stance.situation}
                                        </p>

                                        <div className="flex items-center pt-2.5 app-3d-divider-top opacity-85">
                                            <AutoFitSingleLine
                                                as="span"
                                                text={stance.proof}
                                                baseFontSize={12}
                                                minFontSize={7.5}
                                                textScale={cardTextScale}
                                                className="text-slate-500 dark:text-slate-400 w-full"
                                            />
                                        </div>
                                    </div>
                                ))}

                                {filteredStances.length === 0 && (
                                    <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] text-center py-12 px-6 opacity-75">
                                        <i className="fa-solid fa-award text-3xl mb-2"></i>
                                        <p className="text-sm font-medium">{ui.noStances}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* 5. Timeline Interactive List */
                        <div
                            key="timeline-list"
                            className="space-y-1 max-w-3xl mx-auto"
                        >
                            {/* Era Filters */}
                            <div className="space-y-2.5">
                                {/* Era Filter Chips */}
                                <div className="filter-chips-nav flex items-center gap-2 overflow-x-auto pt-1 pb-2.5 px-1 hide-scrollbar">
                                    {[
                                        { id: 'all', label: isEn ? 'All' : 'كامل السيرة' },
                                        { id: 'pre-prophethood', label: isEn ? 'Pre-Prophethood' : 'قبل البعثة' },
                                        { id: 'makki', label: isEn ? 'Meccan' : 'العهد المكي' },
                                        { id: 'early-madani', label: isEn ? 'Early Medinan' : 'أوائل المدني' },
                                        { id: 'late-madani', label: isEn ? 'Late Medinan' : 'أواخر المدني' },
                                    ].map((era) => {
                                        const isActive = activeEraFilter === era.id;
                                        return (
                                            <button
                                                key={era.id}
                                                onClick={() => setActiveEraFilter(era.id)}
                                                className={`app-page-card border-0 bg-white dark:bg-[#1E293B] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${isEn ? 'font-sans' : 'font-cairo'}`}
                                                style={isActive ? {
                                                    backgroundColor: primaryColor,
                                                    color: themeActiveTextColor
                                                } : {
                                                    color: 'var(--text-color)'
                                                }}
                                            >
                                                {era.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Timeline Milestone Cards */}
                            <div className={`space-y-4 pb-2 relative before:absolute ${isEn ? 'before:left-6' : 'before:right-6'} before:top-4 before:bottom-4 before:w-[2px] ${tokens.isDark ? 'before:bg-slate-700/60' : 'before:bg-slate-200'}`}>
                                {filteredMilestones.map((milestone) => (
                                    <div
                                        key={milestone.id}
                                        onClick={() => handleSelectMilestone(milestone)}
                                        className={`seerah-card app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-[18px] space-y-3 cursor-pointer relative overflow-visible group ${isEn ? 'ml-2' : 'mr-2'}`}
                                    >
                                        <div className="flex items-center justify-end gap-2 overflow-visible">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyMilestone(milestone);
                                                }}
                                                title={ui.copyMilestone}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                <i className="fa-regular fa-copy"></i>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setZoomedCard({
                                                        title: milestone.title,
                                                        subtitle: `${milestone.eraLabel} • ${milestone.location}`,
                                                        badge: milestone.badge,
                                                        icon: milestone.icon,
                                                        content: `${milestone.summary}\n\n• ${ui.dateAndTime} ${milestone.yearHijri ? `${milestone.yearHijri} • ` : ''}${milestone.yearGregorian}\n• ${ui.prophetAge} ${milestone.ageOfProphet}`
                                                    });
                                                }}
                                                title={ui.zoom}
                                                aria-label={ui.zoom}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                <i className="fa-solid fa-magnifying-glass-plus"></i>
                                            </button>
                                            <button
                                                onClick={(e) => handleShareCardImage(milestone, e)}
                                                title={ui.shareImage}
                                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <AutoFitSingleLine
                                            as="h3"
                                            text={milestone.title}
                                            baseFontSize={16}
                                            smFontSize={18}
                                            minFontSize={10}
                                            textScale={cardTextScale}
                                            className={`font-bold ${isEn ? 'font-sans' : 'font-cairo'} transition-colors`}
                                            style={{ color: themeHeadingColor }}
                                        />

                                        <p className="text-xs sm:text-sm opacity-85 leading-[1.75] line-clamp-2">
                                            {milestone.summary}
                                        </p>

                                        <div className="flex items-center pt-2.5 app-3d-divider-top opacity-80">
                                            <AutoFitSingleLine
                                                as="span"
                                                text={`${milestone.location} • ${milestone.yearHijri ? `${milestone.yearHijri} • ` : ''}${milestone.yearGregorian}`}
                                                baseFontSize={12}
                                                minFontSize={7.5}
                                                textScale={cardTextScale}
                                                className="font-bold text-slate-500 dark:text-slate-400 w-full"
                                            />
                                        </div>
                                    </div>
                                ))}

                                {filteredMilestones.length === 0 && (
                                    <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] text-center py-12 px-6 opacity-75">
                                        <i className="fa-solid fa-scroll text-3xl mb-2"></i>
                                        <p className="text-sm font-medium">{ui.noMilestones}</p>
                                    </div>
                                )}
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
                                            backgroundColor: hexToRgba(themeHeadingColor, 0.1),
                                            color: themeHeadingColor
                                        }}
                                    >
                                        {zoomedCard.subtitle || (isEn ? "Prophetic Seerah" : "السيرة النبوية")}
                                    </span>
                                </div>
                            </div>

                            {/* Content Container */}
                            <div ref={zoomScrollRef} className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-4 space-y-4">
                                {zoomedCard.title && (
                                    <h3 
                                        className={`text-base sm:text-lg font-bold ${isEn ? 'font-sans' : 'font-cairo'} text-center leading-snug`} 
                                        style={{ color: themeHeadingColor }}
                                    >
                                        {zoomedCard.title}
                                    </h3>
                                )}

                                {Array.isArray(zoomedCard.content) ? (
                                    <div className="space-y-3">
                                        {zoomedCard.content.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`flex items-start gap-3 p-3.5 rounded-2xl ${innerSubBoxClass}`}
                                            >
                                                <span 
                                                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5"
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
                                className="px-4 pt-3 pb-2 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 app-3d-divider-top overflow-visible" 
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
                                            category: zoomedCard.subtitle || (isEn ? 'Prophetic Seerah' : 'السيرة النبوية'),
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
            {/* Interactive Spotlight Guide */}
            <CommunitySpotlightGuide
                guideKey="prophetic_seerah_page_spotlight"
                steps={PROPHETIC_SEERAH_PAGE_STEPS}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={isEn}
            />
        </div>
    );
};

export default PropheticSeerahPage;
