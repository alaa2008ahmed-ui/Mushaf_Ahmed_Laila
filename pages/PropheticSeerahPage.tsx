import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { 
    PROPHETIC_SEERAH_DATA, 
    PROPHETIC_STANCES_DATA, 
    PROPHETIC_LINEAGE_DATA,
    SeerahMilestone, 
    PropheticStance 
} from '../data/propheticSeerahData';
import { 
    SEERAH_UI_TEXTS, 
    ERA_FILTERS_EN, 
    STANCE_CATEGORIES_EN, 
    getTranslatedMilestone, 
    getTranslatedStance, 
    getTranslatedLineage 
} from '../data/propheticSeerahTranslations';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { sharePropheticLineageImage } from '../utils/lineageShareHelper';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { markPageAsSeen } from '../utils/badgeManager';
import { ZoomIn, HelpCircle } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { PROPHETIC_SEERAH_PAGE_STEPS } from '../components/Community/communityTourSteps';

interface PropheticSeerahPageProps {
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

const PropheticSeerahPage: React.FC<PropheticSeerahPageProps> = ({ onBack, onNavigate, onOpenThemes }) => {
    const { theme, themeKey } = useTheme();
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const ui = SEERAH_UI_TEXTS[isEn ? 'en' : 'ar'];

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

    // Zoom Modal State for Cards
    const [zoomedCard, setZoomedCard] = useState<ZoomedCardData | null>(null);
    const [zoomFontSize, setZoomFontSize] = useState<number>(24);

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
    
    // Search Query
    const [searchQuery, setSearchQuery] = useState('');

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

    // Ensure the page always opens from the very top on any card/tab selection instantly
    useLayoutEffect(() => {
        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTop = 0;
        }
    }, [selectedMilestone?.id, selectedStance?.id, activeTab, lineageTab]);

    useLayoutEffect(() => {
        if (zoomedCard && zoomScrollRef.current) {
            zoomScrollRef.current.scrollTop = 0;
        }
    }, [zoomedCard]);

    const handleSelectMilestone = (m: SeerahMilestone) => {
        setSelectedMilestone(m);
        scrollToTop();
    };

    const handleSelectStance = (s: PropheticStance) => {
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
        setActiveTab(tab);
        setSearchQuery('');
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
            text += `مشارك من تطبيق مصحف أحمد وليلى`;
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
            text += `مشارك من تطبيق مصحف أحمد وليلى`;
        }

        navigator.clipboard.writeText(text).then(() => {
            showToast(ui.toastCopiedStance);
        }).catch(() => {
            showToast(ui.toastCopyFailed);
        });
    };

    // Copy Lineage with all deep sections
    const handleCopyLineage = (section?: 'all' | 'tree' | 'mother' | 'names' | 'nurses' | 'characteristics' | 'virtues') => {
        let text = `👑 *${activeLineageData.fullName}*\n\n`;
        text += `📌 *${ui.fullLineTitle}*\n${activeLineageData.fullText}\n\n`;

        if (!section || section === 'all' || section === 'mother') {
            text += `🌸 *${ui.motherLineageTitle}:*\n${activeLineageData.motherLineage.fullName}\n${activeLineageData.motherLineage.tribe}\n${activeLineageData.motherLineage.meetingPoint}\n${activeLineageData.motherLineage.details}\n\n`;
        }

        if (!section || section === 'all' || section === 'names') {
            text += `✨ *${ui.namesTitle}:*\n${activeLineageData.propheticNames.map(n => `• ${n.name}: ${n.meaning} (${n.source})`).join('\n')}\n\n`;
        }

        if (!section || section === 'all' || section === 'nurses') {
            text += `🍼 *${ui.nursesTitle}:*\n${activeLineageData.nursesAndFosterBrothers.map(nb => `• ${nb.person} (${nb.role}): ${nb.details}`).join('\n')}\n\n`;
        }

        if (!section || section === 'all' || section === 'characteristics') {
            text += `🌿 *${ui.characteristicsTitle}:*\n${activeLineageData.nobleCharacteristics.map(c => `• ${c.title} [${c.category}]:\n${c.description}\n(${c.hadithRef})`).join('\n\n')}\n\n`;
        }

        if (isEn) {
            text += `📜 *Virtues of Lineage:*\nThe Messenger of Allah ﷺ said: "Indeed Allah chose Kinanah from the offspring of Ismail, and He chose Quraysh from Kinanah, and He chose Banu Hashim from Quraysh, and He chose me from Banu Hashim. So I am the best of the best" (Sahih Muslim).\n\nShared from Mushaf Ahmed & Laila App`;
        } else {
            text += `📜 *أحاديث الاصطفاء وطهارة النسب:*\nقال رسول الله ﷺ: «إن الله اصطفى كنانة من ولد إسماعيل، واصطفى قريشاً من كنانة، واصطفى من قريش بني هاشم، واصطفاني من بني هاشم، فأنا خيار من خيار» (صحيح مسلم).\n\nمشارك من تطبيق مصحف أحمد وليلى`;
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

    // Filtering Milestones with useMemo for instantaneous tab switching
    const filteredMilestones = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return allMilestones.filter((m) => {
            const matchesEra = activeEraFilter === 'all' || m.era === activeEraFilter;
            if (!matchesEra) return false;
            if (!q) return true;
            return (
                m.title.toLowerCase().includes(q) ||
                m.summary.toLowerCase().includes(q) ||
                m.details.toLowerCase().includes(q) ||
                m.location.toLowerCase().includes(q) ||
                (m.strategicImpact && m.strategicImpact.toLowerCase().includes(q)) ||
                (m.propheticMiraclesOrDuas && m.propheticMiraclesOrDuas.toLowerCase().includes(q)) ||
                (m.historicalSecrets && m.historicalSecrets.toLowerCase().includes(q)) ||
                (m.keyFigures && m.keyFigures.some(f => f.toLowerCase().includes(q))) ||
                m.lessons.some(l => l.toLowerCase().includes(q))
            );
        });
    }, [allMilestones, activeEraFilter, searchQuery]);

    // Filtering Stances with useMemo for instantaneous tab switching
    const filteredStances = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return allStances.filter((s) => {
            const matchesCategory = activeStanceCategory === 'all' || s.category === activeStanceCategory;
            if (!matchesCategory) return false;
            if (!q) return true;
            return (
                s.title.toLowerCase().includes(q) ||
                s.situation.toLowerCase().includes(q) ||
                s.quote.toLowerCase().includes(q) ||
                s.moralLesson.toLowerCase().includes(q) ||
                (s.detailedDialogue && s.detailedDialogue.toLowerCase().includes(q)) ||
                (s.psychologicalAnalysis && s.psychologicalAnalysis.toLowerCase().includes(q)) ||
                (s.contemporaryReflection && s.contemporaryReflection.toLowerCase().includes(q)) ||
                (s.keyFigures && s.keyFigures.some(f => f.toLowerCase().includes(q)))
            );
        });
    }, [allStances, activeStanceCategory, searchQuery]);

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
            setSelectedMilestone(null);
            scrollToTop();
            return;
        }
        if (selectedStance) {
            setSelectedStance(null);
            scrollToTop();
            return;
        }
        if (tabHistory.length > 1) {
            const nextHistory = [...tabHistory];
            nextHistory.pop();
            const prevTab = nextHistory[nextHistory.length - 1] || 'timeline';
            setTabHistory(nextHistory);
            setActiveTab(prevTab);
            scrollToTop();
            return;
        }
        if (activeTab !== 'timeline') {
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
                setSelectedMilestone(null);
                scrollToTop();
                return true;
            }
            if (selectedStance) {
                setSelectedStance(null);
                scrollToTop();
                return true;
            }
            if (tabHistory.length > 1) {
                const nextHistory = [...tabHistory];
                nextHistory.pop();
                const prevTab = nextHistory[nextHistory.length - 1] || 'timeline';
                setTabHistory(nextHistory);
                setActiveTab(prevTab);
                scrollToTop();
                return true;
            }
            if (activeTab !== 'timeline') {
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
                        <i className="fa-solid fa-circle-check text-amber-300"></i>
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Header */}
            <header className="app-top-bar z-20 shrink-0">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back button, Magnifying Glass */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center gap-1`}>
                            <button
                                onClick={handleBackClick}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={ui.goBack}
                                aria-label={ui.goBack}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                            
                            {/* Magnifying Glass to scale text of all cards on the page */}
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
                        <div className={`text-center ${selectedMilestone || selectedStance ? 'px-20 sm:px-24' : 'px-12'}`}>
                            <h1 className={`app-top-bar__title ${isEn ? 'font-bold' : 'font-kufi'} transition-all ${
                                selectedMilestone || selectedStance 
                                    ? 'text-[11px] sm:text-xs leading-tight font-bold line-clamp-2' 
                                    : 'text-xl sm:text-2xl'
                            }`}>
                                {activeMilestone
                                    ? activeMilestone.title
                                    : activeStance
                                    ? activeStance.title
                                    : activeTab === 'timeline'
                                    ? (isEn ? ui.pageTitle : 'السيرة النبوية')
                                    : activeTab === 'stances'
                                    ? ui.tabStancesFull
                                    : ui.tabLineageFull}
                            </h1>
                        </div>

                        {/* Right Tools: Guide, ThemeLock & Home Button */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Seerah Guide" : "دليل السيرة النبوية"}
                                aria-label={isEn ? "Seerah Guide" : "دليل السيرة النبوية"}
                            >
                                <HelpCircle size={19} />
                            </button>
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

            {/* Top Navigation Tabs */}
            {!selectedMilestone && !selectedStance && (
                <div className="px-4 pt-1 pb-2 shrink-0">
                    <div 
                        className="max-w-3xl mx-auto flex items-center justify-center p-1 rounded-2xl bg-black/5 dark:bg-white/5 border gap-1 shadow-xs"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        <button
                            onClick={() => switchTab('timeline')}
                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} transition-all flex items-center justify-center text-center ${
                                activeTab === 'timeline'
                                    ? 'shadow-sm'
                                    : 'opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'timeline' ? primaryColor : undefined,
                                color: activeTab === 'timeline' ? themeActiveTextColor : 'inherit',
                                borderColor: activeTab === 'timeline' ? primaryColor : cardBorderColor,
                                borderWidth: '1px',
                                borderStyle: 'solid'
                            }}
                        >
                            <span className="text-center block w-full">{ui.tabTimeline}</span>
                        </button>

                        <button
                            onClick={() => switchTab('stances')}
                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} transition-all flex items-center justify-center text-center ${
                                activeTab === 'stances'
                                    ? 'shadow-sm'
                                    : 'opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'stances' ? primaryColor : undefined,
                                color: activeTab === 'stances' ? themeActiveTextColor : 'inherit',
                                borderColor: activeTab === 'stances' ? primaryColor : cardBorderColor,
                                borderWidth: '1px',
                                borderStyle: 'solid'
                            }}
                        >
                            <span className="text-center block w-full">{ui.tabStances}</span>
                        </button>

                        <button
                            onClick={() => switchTab('lineage')}
                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} transition-all flex items-center justify-center text-center ${
                                activeTab === 'lineage'
                                    ? 'shadow-sm'
                                    : 'opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'lineage' ? primaryColor : undefined,
                                color: activeTab === 'lineage' ? themeActiveTextColor : 'inherit',
                                borderColor: activeTab === 'lineage' ? primaryColor : cardBorderColor,
                                borderWidth: '1px',
                                borderStyle: 'solid'
                            }}
                        >
                            <span className="text-center block w-full">{ui.tabLineage}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Scoped CSS for scaling text across all cards when cardTextScale > 1 */}
            {cardTextScale > 1 && (
                <style>{`
                    .seerah-scalable-content .themed-card p,
                    .seerah-scalable-content .rounded-2xl.border p,
                    .seerah-scalable-content .rounded-3xl.border p,
                    .seerah-scalable-content .themed-card li,
                    .seerah-scalable-content .rounded-2xl.border li,
                    .seerah-scalable-content .themed-card .leading-relaxed,
                    .seerah-scalable-content .rounded-2xl.border .leading-relaxed {
                        font-size: calc(0.925rem * ${cardTextScale}) !important;
                        line-height: ${cardTextScale >= 1.3 ? '1.85' : '1.7'} !important;
                    }
                    .seerah-scalable-content .themed-card h2,
                    .seerah-scalable-content .rounded-2xl.border h2,
                    .seerah-scalable-content .rounded-3xl.border h2 {
                        font-size: calc(1.5rem * ${cardTextScale}) !important;
                    }
                    .seerah-scalable-content .themed-card h3,
                    .seerah-scalable-content .rounded-2xl.border h3,
                    .seerah-scalable-content .rounded-3xl.border h3 {
                        font-size: calc(1.15rem * ${cardTextScale}) !important;
                    }
                    .seerah-scalable-content .themed-card h4,
                    .seerah-scalable-content .themed-card h5,
                    .seerah-scalable-content .rounded-2xl.border h4,
                    .seerah-scalable-content .rounded-2xl.border h5 {
                        font-size: calc(1.05rem * ${cardTextScale}) !important;
                    }
                    .seerah-scalable-content .themed-card .text-xs,
                    .seerah-scalable-content .themed-card .text-\\[11px\\],
                    .seerah-scalable-content .themed-card .text-\\[10px\\],
                    .seerah-scalable-content .rounded-2xl.border .text-xs,
                    .seerah-scalable-content .rounded-2xl.border .text-\\[11px\\] {
                        font-size: calc(0.775rem * ${cardTextScale}) !important;
                    }
                    .seerah-scalable-content .themed-card .text-sm,
                    .seerah-scalable-content .rounded-2xl.border .text-sm {
                        font-size: calc(0.875rem * ${cardTextScale}) !important;
                    }
                    .seerah-scalable-content .themed-card .text-base,
                    .seerah-scalable-content .rounded-2xl.border .text-base {
                        font-size: calc(1rem * ${cardTextScale}) !important;
                    }
                    .seerah-scalable-content .themed-card .text-lg,
                    .seerah-scalable-content .rounded-2xl.border .text-lg {
                        font-size: calc(1.125rem * ${cardTextScale}) !important;
                    }
                    .seerah-scalable-content .themed-card .text-xl,
                    .seerah-scalable-content .rounded-2xl.border .text-xl {
                        font-size: calc(1.25rem * ${cardTextScale}) !important;
                    }
                    .seerah-scalable-content .themed-card .text-2xl,
                    .seerah-scalable-content .rounded-2xl.border .text-2xl {
                        font-size: calc(1.5rem * ${cardTextScale}) !important;
                    }
                    .seerah-scalable-content .line-clamp-2 {
                        -webkit-line-clamp: 4 !important;
                    }
                    .seerah-scalable-content .line-clamp-3 {
                        -webkit-line-clamp: 5 !important;
                    }
                `}</style>
            )}

            {/* Main Content Body */}
            <main ref={mainScrollRef} className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-2 pb-6 seerah-scalable-content">
                {/* 1. Milestone Detail View */}
                {selectedMilestone && activeMilestone ? (
                    <div
                        key={`detail-milestone-${activeMilestone.id}`}
                        className="max-w-2xl mx-auto space-y-4"
                    >
                            {/* Hero Card */}
                            <div 
                                className="p-5 sm:p-6 rounded-3xl themed-card border shadow-lg relative overflow-hidden"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div 
                                    className="absolute -right-16 -top-16 w-44 h-44 rounded-full opacity-15 blur-3xl pointer-events-none"
                                    style={{ backgroundColor: primaryColor }}
                                />

                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5"
                                            style={{ backgroundColor: `${primaryColor}18`, color: primaryColor, borderColor: `${primaryColor}38` }}
                                        >
                                            <i className={activeMilestone.icon}></i>
                                            {activeMilestone.badge}
                                        </span>
                                        <span className="text-xs opacity-75 font-bold">
                                            {activeMilestone.eraLabel}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 text-xs opacity-80">
                                            <i className="fa-solid fa-location-dot" style={{ color: primaryColor }}></i>
                                            <span>{activeMilestone.location}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: activeMilestone.title,
                                                subtitle: `${activeMilestone.eraLabel} • ${activeMilestone.location}`,
                                                badge: activeMilestone.badge,
                                                icon: activeMilestone.icon,
                                                content: `${activeMilestone.summary}\n\n• ${ui.dateAndTime} ${activeMilestone.yearHijri ? `${activeMilestone.yearHijri} • ` : ''}${activeMilestone.yearGregorian}\n• ${ui.prophetAge} ${activeMilestone.ageOfProphet}`
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                <h2 className={`text-xl sm:text-2xl font-bold ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                    {activeMilestone.title}
                                </h2>

                                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t text-xs" style={{ borderColor: 'var(--card-border)' }}>
                                    <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                        <span className="opacity-60 block text-[10px]">{ui.dateAndTime}</span>
                                        <span className="font-bold">{activeMilestone.yearHijri ? `${activeMilestone.yearHijri} • ` : ''}{activeMilestone.yearGregorian}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                        <span className="opacity-60 block text-[10px]">{ui.prophetAge}</span>
                                        <span className="font-bold">{activeMilestone.ageOfProphet}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Figures Tags */}
                            {activeMilestone.keyFigures && activeMilestone.keyFigures.length > 0 && (
                                <div 
                                    className="p-4 rounded-3xl themed-card border shadow-xs space-y-2"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className={`text-xs font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-1.5`} style={{ color: primaryColor }}>
                                            <i className="fa-solid fa-users text-xs"></i>
                                            {ui.keyFigures}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: ui.keyFigures,
                                                subtitle: activeMilestone.title,
                                                badge: activeMilestone.badge,
                                                icon: 'fa-solid fa-users',
                                                content: activeMilestone.keyFigures!.map(person => `• ${person}`).join('\n')
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {activeMilestone.keyFigures.map((person, idx) => (
                                            <span 
                                                key={idx} 
                                                className="text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5"
                                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
                                            >
                                                <i className="fa-solid fa-user text-[9px] opacity-60"></i>
                                                {person}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Full Narrative Details */}
                            <div 
                                className="p-5 sm:p-6 rounded-3xl themed-card border shadow-sm space-y-3"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2`} style={{ color: primaryColor }}>
                                        <i className="fa-solid fa-book-open"></i>
                                        {ui.milestoneDetailsTitle}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: ui.milestoneDetailsTitle,
                                            subtitle: activeMilestone.title,
                                            badge: activeMilestone.badge,
                                            icon: 'fa-solid fa-book-open',
                                            content: activeMilestone.details
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title={ui.zoom}
                                        aria-label={ui.zoom}
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed opacity-90 font-medium whitespace-pre-line">
                                    {activeMilestone.details}
                                </p>
                            </div>

                            {/* 🎯 Strategic Impact */}
                            {activeMilestone.strategicImpact && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-blue-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-blue-600 dark:text-blue-400`}>
                                            <i className="fa-solid fa-chess"></i>
                                            {ui.strategicImpact}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: ui.strategicImpact,
                                                subtitle: activeMilestone.title,
                                                badge: activeMilestone.badge,
                                                icon: 'fa-solid fa-chess',
                                                content: activeMilestone.strategicImpact!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-semibold">
                                        {activeMilestone.strategicImpact}
                                    </p>
                                </div>
                            )}

                            {/* 🤲 Prophetic Miracles & Duas */}
                            {activeMilestone.propheticMiraclesOrDuas && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-amber-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-amber-600 dark:text-amber-400`}>
                                            <i className="fa-solid fa-hand-holding-heart"></i>
                                            {ui.miraclesAndDuas}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: ui.miraclesAndDuas,
                                                subtitle: activeMilestone.title,
                                                badge: activeMilestone.badge,
                                                icon: 'fa-solid fa-hand-holding-heart',
                                                content: activeMilestone.propheticMiraclesOrDuas!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
                                        {activeMilestone.propheticMiraclesOrDuas}
                                    </p>
                                </div>
                            )}

                            {/* 🔍 Historical Secrets */}
                            {activeMilestone.historicalSecrets && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-purple-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-purple-600 dark:text-purple-400`}>
                                            <i className="fa-solid fa-compass"></i>
                                            {ui.historicalSecrets}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: ui.historicalSecrets,
                                                subtitle: activeMilestone.title,
                                                badge: activeMilestone.badge,
                                                icon: 'fa-solid fa-compass',
                                                content: activeMilestone.historicalSecrets!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
                                        {activeMilestone.historicalSecrets}
                                    </p>
                                </div>
                            )}

                            {/* Lessons and Moral Values */}
                            <div 
                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-3"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid', backgroundColor: `${primaryColor}0D` }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2`} style={{ color: primaryColor }}>
                                        <i className="fa-solid fa-lightbulb"></i>
                                        {ui.lessonsTitle}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: ui.lessonsTitle,
                                            subtitle: activeMilestone.title,
                                            badge: activeMilestone.badge,
                                            icon: 'fa-solid fa-lightbulb',
                                            content: activeMilestone.lessons
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title={ui.zoom}
                                        aria-label={ui.zoom}
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <div className="space-y-2.5">
                                    {activeMilestone.lessons.map((lesson, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
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
                                    className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border text-xs"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className={`font-bold opacity-75 flex items-center gap-1.5 ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                            <i className="fa-solid fa-quote-right"></i>
                                            {ui.proofTitle}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: ui.proofTitle,
                                                subtitle: activeMilestone.title,
                                                badge: activeMilestone.badge,
                                                icon: 'fa-solid fa-quote-right',
                                                content: (activeMilestone.versesOrHadiths || activeMilestone.proof)!,
                                                isVerseOrProof: true
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="italic opacity-90 leading-relaxed font-semibold">
                                        {activeMilestone.versesOrHadiths || activeMilestone.proof}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                <button
                                    onClick={() => handleShareCardImage(activeMilestone)}
                                    disabled={isSharing}
                                    className="flex-1 py-3 px-4 rounded-2xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: themeActiveTextColor }}
                                >
                                    {isSharing ? (
                                        <>
                                            <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                                            {ui.preparingImage}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-image text-xs"></i>
                                            {ui.shareCardHighRes}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleCopyMilestone(activeMilestone)}
                                    className="py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                                    style={{ borderColor: cardBorderColor }}
                                    title={ui.copyAllData}
                                >
                                    <i className="fa-regular fa-copy text-xs"></i>
                                    {ui.copyAllData}
                                </button>
                            </div>

                            {/* Next / Previous Milestones Navigation */}
                            <div className="grid grid-cols-2 gap-3 pt-3">
                                {prevMilestone ? (
                                    <button
                                        onClick={() => handleSelectMilestone(prevMilestone)}
                                        className={`p-3 rounded-2xl border ${isEn ? 'text-left' : 'text-right'} transition-all active:scale-95 shadow-sm hover:opacity-90`}
                                        style={{ borderColor: cardBorderColor }}
                                    >
                                        <span className="text-[10px] opacity-60 block">{ui.prevMilestone}</span>
                                        <span className={`text-xs font-bold block truncate ${isEn ? 'font-sans' : 'font-kufi'}`}>{prevMilestone.title}</span>
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {nextMilestone ? (
                                    <button
                                        onClick={() => handleSelectMilestone(nextMilestone)}
                                        className={`p-3 rounded-2xl border ${isEn ? 'text-left' : 'text-right'} transition-all active:scale-95 shadow-sm hover:opacity-90`}
                                        style={{ borderColor: cardBorderColor }}
                                    >
                                        <span className="text-[10px] opacity-60 block">{ui.nextMilestone}</span>
                                        <span className={`text-xs font-bold block truncate ${isEn ? 'font-sans' : 'font-kufi'}`}>{nextMilestone.title}</span>
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
                                className="p-5 sm:p-6 rounded-3xl themed-card border shadow-lg relative overflow-hidden"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                                        {activeStance.icon && (activeStance.icon.startsWith('fa') ? <i className={activeStance.icon}></i> : <span>{activeStance.icon}</span>)}
                                        {activeStance.categoryBadge}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {activeStance.year && (
                                            <span className="text-xs font-bold opacity-75">{activeStance.year}</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: activeStance.title,
                                                subtitle: activeStance.categoryBadge,
                                                badge: activeStance.categoryBadge,
                                                icon: activeStance.icon,
                                                content: `«${activeStance.quote}»\n\n${activeStance.situation}`
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                <h2 className={`text-xl sm:text-2xl font-bold ${isEn ? 'font-sans' : 'font-kufi'}`} style={{ color: primaryColor }}>
                                    {activeStance.title}
                                </h2>

                                {/* Prophetic Immortal Quote Callout */}
                                <div 
                                    className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border text-center"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-1">
                                        {ui.immortalQuote}
                                    </span>
                                    <p className={`text-base sm:text-lg font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-amber-700 dark:text-amber-300 leading-relaxed`}>
                                        «{activeStance.quote}»
                                    </p>
                                </div>
                            </div>

                            {/* The Situation Context */}
                            <div 
                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2`} style={{ color: primaryColor }}>
                                        <i className="fa-solid fa-scroll"></i>
                                        {ui.situationContext}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: ui.situationContext,
                                            subtitle: activeStance.title,
                                            badge: activeStance.categoryBadge,
                                            icon: 'fa-solid fa-scroll',
                                            content: activeStance.situation
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title={ui.zoom}
                                        aria-label={ui.zoom}
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed opacity-90 font-medium whitespace-pre-line">
                                    {activeStance.situation}
                                </p>
                            </div>

                            {/* 💬 Detailed Dialogue */}
                            {activeStance.detailedDialogue && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid', backgroundColor: `${primaryColor}0D` }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2`} style={{ color: primaryColor }}>
                                            <i className="fa-solid fa-comments"></i>
                                            {ui.dialogueTitle}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: ui.dialogueTitle,
                                                subtitle: activeStance.title,
                                                badge: activeStance.categoryBadge,
                                                icon: 'fa-solid fa-comments',
                                                content: activeStance.detailedDialogue!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-semibold whitespace-pre-line">
                                        {activeStance.detailedDialogue}
                                    </p>
                                </div>
                            )}

                            {/* 🧠 Psychological & Leadership Analysis */}
                            {activeStance.psychologicalAnalysis && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-blue-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-blue-600 dark:text-blue-400`}>
                                            <i className="fa-solid fa-brain"></i>
                                            {ui.psychologicalAnalysis}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: ui.psychologicalAnalysis,
                                                subtitle: activeStance.title,
                                                badge: activeStance.categoryBadge,
                                                icon: 'fa-solid fa-brain',
                                                content: activeStance.psychologicalAnalysis!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
                                        {activeStance.psychologicalAnalysis}
                                    </p>
                                </div>
                            )}

                            {/* 🌍 Contemporary Reflection */}
                            {activeStance.contemporaryReflection && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-purple-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-purple-600 dark:text-purple-400`}>
                                            <i className="fa-solid fa-globe"></i>
                                            {ui.contemporaryReflection}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: ui.contemporaryReflection,
                                                subtitle: activeStance.title,
                                                badge: activeStance.categoryBadge,
                                                icon: 'fa-solid fa-globe',
                                                content: activeStance.contemporaryReflection!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
                                        {activeStance.contemporaryReflection}
                                    </p>
                                </div>
                            )}

                            {/* 🛠️ Practical Application Steps */}
                            {activeStance.practicalApplication && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-amber-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-amber-600 dark:text-amber-400`}>
                                            <i className="fa-solid fa-check-to-slot"></i>
                                            {ui.practicalApplication}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: ui.practicalApplication,
                                                subtitle: activeStance.title,
                                                badge: activeStance.categoryBadge,
                                                icon: 'fa-solid fa-check-to-slot',
                                                content: activeStance.practicalApplication!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium whitespace-pre-line">
                                        {activeStance.practicalApplication}
                                    </p>
                                </div>
                            )}

                            {/* The Moral Lesson */}
                            <div 
                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid', backgroundColor: `${primaryColor}0D` }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2`} style={{ color: primaryColor }}>
                                        <i className="fa-solid fa-lightbulb"></i>
                                        {ui.moralLesson}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: ui.moralLesson,
                                            subtitle: activeStance.title,
                                            badge: activeStance.categoryBadge,
                                            icon: 'fa-solid fa-lightbulb',
                                            content: activeStance.moralLesson
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title={ui.zoom}
                                        aria-label={ui.zoom}
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed font-semibold">
                                    {activeStance.moralLesson}
                                </p>
                            </div>

                            {/* Proof Documentation */}
                            <div 
                                className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border text-xs"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className={`font-bold opacity-75 text-blue-500 flex items-center gap-1.5 ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                        <i className="fa-solid fa-check-double"></i>
                                        {ui.proofSource}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: ui.proofSource,
                                            subtitle: activeStance.title,
                                            badge: activeStance.categoryBadge,
                                            icon: 'fa-solid fa-check-double',
                                            content: activeStance.proof,
                                            isVerseOrProof: true
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title={ui.zoom}
                                        aria-label={ui.zoom}
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <p className="opacity-90 leading-relaxed font-semibold">
                                    {activeStance.proof}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                <button
                                    onClick={() => handleShareStanceImage(activeStance)}
                                    disabled={isSharing}
                                    className="flex-1 py-3 px-4 rounded-2xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: themeActiveTextColor }}
                                >
                                    {isSharing ? (
                                        <>
                                            <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                                            {ui.preparingImage}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-image text-xs"></i>
                                            {ui.shareStanceCard}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleCopyStance(activeStance)}
                                    className="py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                                    style={{ borderColor: cardBorderColor }}
                                    title={ui.copyStanceDetails}
                                >
                                    <i className="fa-regular fa-copy text-xs"></i>
                                    {ui.copyStanceDetails}
                                </button>
                            </div>
                        </div>
                    ) : activeTab === 'lineage' ? (
                        /* 3. Noble Lineage View (نسب النبي ﷺ كاملاً وصولاً إلى إبراهيم عليه السلام مع أقسام مفصلة) */
                        <div
                            key="lineage-view"
                            className="space-y-4 max-w-3xl mx-auto"
                        >
                            {/* Sub-Navigation Tabs within Lineage View */}
                            <div 
                                className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1.5 px-2 rounded-2xl border hide-scrollbar"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                {[
                                    { id: 'tree', label: ui.lineageTabTree, icon: 'fa-sitemap' },
                                    { id: 'mother', label: ui.lineageTabMother, icon: 'fa-heart' },
                                    { id: 'names', label: ui.lineageTabNames, icon: 'fa-sparkles' },
                                    { id: 'nurses', label: ui.lineageTabNurses, icon: 'fa-baby' },
                                    { id: 'characteristics', label: ui.lineageTabCharacteristics, icon: 'fa-sun' },
                                    { id: 'virtues', label: ui.lineageTabVirtues, icon: 'fa-certificate' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setLineageTab(tab.id as any)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 active:scale-95 ${
                                            lineageTab === tab.id
                                                ? 'shadow-sm'
                                                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                        } ${isEn ? 'font-sans' : 'font-kufi'}`}
                                        style={{
                                            backgroundColor: lineageTab === tab.id ? primaryColor : undefined,
                                            color: lineageTab === tab.id ? themeActiveTextColor : 'inherit',
                                            borderColor: lineageTab === tab.id ? primaryColor : cardBorderColor,
                                            borderWidth: '1px',
                                            borderStyle: 'solid'
                                        }}
                                    >
                                        <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Lineage Hero Card */}
                            {lineageTab === 'tree' && (
                                <div 
                                    className="p-5 sm:p-7 rounded-3xl themed-card border shadow-lg relative overflow-hidden text-center space-y-4"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-8 h-8 opacity-0 pointer-events-none" />
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                            <i className="fa-solid fa-crown text-amber-400"></i>
                                            <span>{ui.lineageBadge}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: activeLineageData.fullName,
                                                subtitle: ui.lineageBadge,
                                                badge: isEn ? 'Noble Lineage' : 'النسب الشريف',
                                                icon: 'fa-solid fa-crown',
                                                content: `${activeLineageData.shortChain}\n\n• ${ui.fullLineTitle}\n${activeLineageData.fullText}`
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={ui.zoom}
                                            aria-label={ui.zoom}
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>

                                    <h2 className={`text-2xl sm:text-3xl font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-emerald-600 dark:text-emerald-400`}>
                                        {activeLineageData.fullName}
                                    </h2>

                                    <div 
                                        className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 border text-xs sm:text-sm leading-relaxed font-semibold relative ${isEn ? 'text-left' : 'text-right'}`}
                                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <span className={`text-[11px] font-bold text-amber-600 dark:text-amber-400 ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                                {ui.directLineTitle}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: ui.directLineTitle,
                                                    subtitle: activeLineageData.fullName,
                                                    badge: isEn ? 'Prophetic Lineage' : 'النسب النبوي',
                                                    icon: 'fa-solid fa-crown',
                                                    content: activeLineageData.shortChain
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                                aria-label={ui.zoom}
                                            >
                                                <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                            </button>
                                        </div>
                                        <p className="opacity-90">
                                            {activeLineageData.shortChain}
                                        </p>
                                    </div>

                                    {/* Full Connected Lineage Paragraph */}
                                    <div 
                                        className={`p-4 rounded-2xl bg-emerald-500/10 border text-xs sm:text-sm leading-relaxed font-medium relative ${isEn ? 'text-left' : 'text-right'}`}
                                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <span className={`font-bold text-emerald-700 dark:text-emerald-300 block ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                                {ui.fullLineTitle}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: ui.fullLineTitle,
                                                    subtitle: activeLineageData.fullName,
                                                    badge: isEn ? 'Noble Lineage' : 'النسب الشريف',
                                                    icon: 'fa-solid fa-sitemap',
                                                    content: activeLineageData.fullText
                                                })}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                                style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                                aria-label={ui.zoom}
                                            >
                                                <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                            </button>
                                        </div>
                                        <p className="opacity-95 leading-loose">
                                            {activeLineageData.fullText}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                        <button
                                            onClick={handleShareLineageImage}
                                            disabled={isSharing}
                                            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md"
                                        >
                                            <i className="fa-solid fa-image text-xs"></i>
                                            {ui.shareLineagePoster}
                                        </button>

                                        <button
                                            onClick={() => handleCopyLineage('all')}
                                            className="py-2.5 px-5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                                            style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                        >
                                            <i className="fa-regular fa-copy text-xs"></i>
                                            {ui.copyLineageAll}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 1: Ancestors with Stories */}
                            {lineageTab === 'tree' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-emerald-600 dark:text-emerald-400`}>
                                            <i className="fa-solid fa-users-rays"></i>
                                            {ui.ancestorsTitle}
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('tree')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            {ui.copy}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {activeLineageData.ancestors.map((anc, idx) => (
                                            <div 
                                                key={idx}
                                                className="p-4 rounded-2xl themed-card border shadow-xs space-y-2 hover:border-emerald-500/50 transition-colors"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                                                            {idx + 1}
                                                        </span>
                                                        <span className={`font-bold text-base ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                                            {anc.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setZoomedCard({
                                                                title: anc.name,
                                                                subtitle: anc.title || (isEn ? 'Noble Forefathers & Ancestors of the Prophet ﷺ' : 'سلسلة آباء وأجداد النبي ﷺ'),
                                                                badge: `${isEn ? 'Ancestor' : 'الجد'} ${idx + 1}`,
                                                                icon: 'fa-solid fa-user-shield',
                                                                content: `${anc.significance}${anc.story ? `\n\n• ${ui.ancestorStoryTitle}\n${anc.story}` : ''}`
                                                            })}
                                                            className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            style={{ color: 'var(--text-color)' }}
                                                            title={ui.zoom}
                                                            aria-label={ui.zoom}
                                                        >
                                                            <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                        </button>
                                                        {anc.title && (
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                                {anc.title}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-xs opacity-85 leading-relaxed font-semibold">
                                                    {anc.significance}
                                                </p>

                                                {anc.story && (
                                                    <div 
                                                        className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border text-xs text-opacity-90 leading-relaxed"
                                                        style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                                    >
                                                        <span className={`font-bold text-emerald-600 dark:text-emerald-400 block text-[11px] mb-1 ${isEn ? 'font-sans' : 'font-kufi'}`}>
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
                                    className="p-5 sm:p-6 rounded-3xl themed-card border shadow-sm space-y-4"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-base font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-rose-500`}>
                                            <i className="fa-solid fa-heart"></i>
                                            {ui.motherLineageTitle}
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: activeLineageData.motherLineage.fullName,
                                                    subtitle: ui.motherLineageTitle,
                                                    badge: isEn ? "Prophet's Mother ﷺ" : 'أم النبي ﷺ',
                                                    icon: 'fa-solid fa-heart',
                                                    content: `${activeLineageData.motherLineage.tribe}\n\n• ${ui.meetingPointTitle}\n${activeLineageData.motherLineage.meetingPoint}\n\n• ${isEn ? 'Historical Details & Status:' : 'التفاصيل والمكانة:'}\n${activeLineageData.motherLineage.details}`
                                                })}
                                                className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                                aria-label={ui.zoom}
                                            >
                                                <i className="fa-solid fa-magnifying-glass-plus"></i>
                                            </button>
                                            <button
                                                onClick={() => handleCopyLineage('mother')}
                                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                            >
                                                <i className="fa-regular fa-copy text-[10px]"></i>
                                                {ui.copy}
                                            </button>
                                        </div>
                                    </div>

                                    <div 
                                        className="p-4 rounded-2xl bg-rose-500/10 border space-y-2"
                                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <span className={`text-xs font-bold text-rose-600 dark:text-rose-400 block ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                            {activeLineageData.motherLineage.fullName}
                                        </span>
                                        <p className="text-xs opacity-90 font-semibold">
                                            {activeLineageData.motherLineage.tribe}
                                        </p>
                                    </div>

                                    <div 
                                        className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border space-y-2 text-xs leading-relaxed"
                                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`font-bold text-emerald-600 dark:text-emerald-400 block ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                                {ui.meetingPointTitle}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setZoomedCard({
                                                    title: ui.meetingPointTitle,
                                                    subtitle: activeLineageData.motherLineage.fullName,
                                                    badge: isEn ? 'Convergence of Lineages' : 'ملتقى النسبين',
                                                    icon: 'fa-solid fa-link',
                                                    content: `${activeLineageData.motherLineage.meetingPoint}\n\n${activeLineageData.motherLineage.details}`
                                                })}
                                                className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-[10px] transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                style={{ color: 'var(--text-color)' }}
                                                title={ui.zoom}
                                                aria-label={ui.zoom}
                                            >
                                                <i className="fa-solid fa-magnifying-glass-plus"></i>
                                            </button>
                                        </div>
                                        <p className="font-semibold opacity-95">
                                            {activeLineageData.motherLineage.meetingPoint}
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-xs sm:text-sm leading-relaxed opacity-90 font-medium">
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
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-emerald-600 dark:text-emerald-400`}>
                                            <i className="fa-solid fa-sparkles text-amber-400"></i>
                                            {ui.namesTitle} ({activeLineageData.propheticNames.length} {isEn ? 'blessed names' : 'اسماً مباركاً'})
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('names')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            {ui.copy}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {activeLineageData.propheticNames.map((pn, i) => (
                                            <div 
                                                key={i}
                                                className="p-4 rounded-2xl themed-card border shadow-xs space-y-2"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-base font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-emerald-600 dark:text-emerald-400`}>
                                                        {pn.name}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setZoomedCard({
                                                                title: pn.name,
                                                                subtitle: pn.source,
                                                                badge: `${isEn ? 'Blessed Name' : 'الاسم المبارك'} ${i + 1}`,
                                                                icon: 'fa-solid fa-sparkles',
                                                                content: `${pn.meaning}\n\n• ${ui.hadithSource}\n${pn.source}`
                                                            })}
                                                            className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            style={{ color: 'var(--text-color)' }}
                                                            title={ui.zoom}
                                                            aria-label={ui.zoom}
                                                        >
                                                            <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                        </button>
                                                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] flex items-center justify-center font-bold">
                                                            {i + 1}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs leading-relaxed opacity-90 font-medium">
                                                    {pn.meaning}
                                                </p>
                                                <span className="text-[10px] opacity-60 block border-t pt-1 font-mono" style={{ borderColor: 'var(--card-border)' }}>
                                                    {pn.source}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 4: Nurses and Foster Brothers */}
                            {lineageTab === 'nurses' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-emerald-600 dark:text-emerald-400`}>
                                            <i className="fa-solid fa-baby text-pink-400"></i>
                                            {ui.nursesTitle}
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('nurses')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            {ui.copy}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {activeLineageData.nursesAndFosterBrothers.map((nb, i) => (
                                            <div 
                                                key={i}
                                                className="p-4 rounded-2xl themed-card border shadow-xs space-y-1.5"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`font-bold text-sm ${isEn ? 'font-sans' : 'font-kufi'} text-emerald-600 dark:text-emerald-400`}>
                                                        {nb.person}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setZoomedCard({
                                                                title: nb.person,
                                                                subtitle: nb.role,
                                                                badge: nb.role,
                                                                icon: 'fa-solid fa-baby',
                                                                content: nb.details
                                                            })}
                                                            className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            style={{ color: 'var(--text-color)' }}
                                                            title={ui.zoom}
                                                            aria-label={ui.zoom}
                                                        >
                                                            <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                        </button>
                                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                                                            {nb.role}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs opacity-90 leading-relaxed font-medium">
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
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-emerald-600 dark:text-emerald-400`}>
                                            <i className="fa-solid fa-sun text-amber-400"></i>
                                            {ui.characteristicsTitle} ({activeLineageData.nobleCharacteristics.length} {isEn ? 'sublime characteristics' : 'شَميلة خَلقية وخُلقية'})
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('characteristics')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            {ui.copy}
                                        </button>
                                    </div>

                                    <div className="space-y-3.5">
                                        {activeLineageData.nobleCharacteristics.map((c, i) => (
                                            <div 
                                                key={i}
                                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        {c.category}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setZoomedCard({
                                                                title: c.title,
                                                                subtitle: c.hadithRef,
                                                                badge: c.category,
                                                                icon: 'fa-solid fa-sun',
                                                                content: `${c.description}\n\n• ${ui.hadithSource}\n${c.hadithRef}`
                                                            })}
                                                            className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            style={{ color: 'var(--text-color)' }}
                                                            title={ui.zoom}
                                                            aria-label={ui.zoom}
                                                        >
                                                            <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                        </button>
                                                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] flex items-center justify-center font-bold shrink-0">
                                                            {i + 1}
                                                        </span>
                                                    </div>
                                                </div>

                                                <h4 className={`font-bold text-base ${isEn ? 'font-sans' : 'font-kufi'} text-emerald-600 dark:text-emerald-400`}>
                                                    {c.title}
                                                </h4>

                                                <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium whitespace-pre-line">
                                                    {c.description}
                                                </p>

                                                <span className="text-[10px] opacity-60 block pt-1 border-t" style={{ borderColor: 'var(--card-border)' }}>
                                                    {c.hadithRef}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 6: Virtues and Hadiths of Selection */}
                            {lineageTab === 'virtues' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} flex items-center gap-2 text-emerald-600 dark:text-emerald-400`}>
                                            <i className="fa-solid fa-certificate text-amber-400"></i>
                                            {ui.virtuesTitle}
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('virtues')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            {ui.copy}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {activeLineageData.virtues.map((v, i) => (
                                            <div 
                                                key={i} 
                                                className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border space-y-1.5"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-xs font-bold text-amber-600 dark:text-amber-400 block ${isEn ? 'font-sans' : 'font-kufi'}`}>
                                                        {v.title}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setZoomedCard({
                                                            title: v.title,
                                                            subtitle: v.source,
                                                            badge: ui.nobleHadithBadge,
                                                            icon: 'fa-solid fa-certificate',
                                                            content: `«${v.hadith}»\n\n[ ${v.source} ]`,
                                                            isVerseOrProof: true
                                                        })}
                                                        className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                                        style={{ color: 'var(--text-color)' }}
                                                        title={ui.zoom}
                                                        aria-label={ui.zoom}
                                                    >
                                                        <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                    </button>
                                                </div>
                                                <p className="text-xs sm:text-sm italic font-semibold leading-relaxed opacity-95">
                                                    {v.hadith}
                                                </p>
                                                <span className={`text-[10px] opacity-65 block font-mono ${isEn ? 'text-right' : 'text-left'}`}>
                                                    {v.source}
                                                </span>
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
                            className="space-y-4 max-w-3xl mx-auto"
                        >
                            {/* Search and Category Filter */}
                            <div className="space-y-2.5">
                                <div 
                                    className="p-2 sm:p-2.5 rounded-2xl themed-card border shadow-sm relative overflow-hidden flex items-center"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={ui.searchStancesPlaceholder}
                                            className={`w-full ${isEn ? 'pl-9 pr-8 text-left' : 'pl-8 pr-9 text-right'} py-2 text-xs sm:text-sm rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                                            style={{ borderColor: cardBorderColor, color: theme.textColor }}
                                        />
                                        <i className={`fa-solid fa-magnifying-glass absolute ${isEn ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs opacity-50`}></i>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className={`absolute ${isEn ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100`}
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Category Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                    {[
                                        { id: 'all', label: isEn ? 'All' : 'الكل' },
                                        { id: 'رحمة وعفو', label: isEn ? 'Mercy' : 'الرحمة' },
                                        { id: 'شجاعة وثبات', label: isEn ? 'Courage' : 'الشجاعة' },
                                        { id: 'حلم وتواضع', label: isEn ? 'Humility' : 'الحلم' },
                                        { id: 'وفاء وأمانة', label: isEn ? 'Loyalty' : 'الوفاء' },
                                        { id: 'شورى وعدالة', label: isEn ? 'Justice' : 'العدالة' },
                                        { id: 'رفق بالخلق', label: isEn ? 'Kindness' : 'الرفق' },
                                    ].map((cat) => {
                                        const count = cat.id === 'all' 
                                            ? allStances.length 
                                            : allStances.filter(s => s.category === cat.id).length;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveStanceCategory(cat.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 active:scale-95 flex items-center gap-1.5 ${
                                                    activeStanceCategory === cat.id
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                                } ${isEn ? 'font-sans' : 'font-kufi'}`}
                                                style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                            >
                                                <span>{cat.label}</span>
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                                    activeStanceCategory === cat.id 
                                                        ? 'bg-white/20 text-white' 
                                                        : 'bg-black/10 dark:bg-white/10 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Stances Cards Grid */}
                            <div className="space-y-3.5">
                                {filteredStances.map((stance) => (
                                    <div
                                        key={stance.id}
                                        onClick={() => handleSelectStance(stance)}
                                        className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl themed-card border shadow-sm hover:shadow-md transition-all space-y-2.5 cursor-pointer relative overflow-hidden group active:scale-99"
                                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                                {stance.icon && (stance.icon.startsWith('fa') ? <i className={stance.icon}></i> : <span>{stance.icon}</span>)}
                                                {stance.categoryBadge}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyStance(stance);
                                                    }}
                                                    title={ui.copyStanceDetails}
                                                    className="w-7 h-7 rounded-full border flex items-center justify-center text-xs hover:bg-black/10 transition-colors"
                                                    style={{ borderColor: cardBorderColor }}
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
                                                    className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100"
                                                    style={{ color: 'var(--text-color)' }}
                                                >
                                                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => handleShareStanceImage(stance, e)}
                                                    title={ui.shareStanceCard}
                                                    className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center text-xs transition-colors"
                                                >
                                                    <i className="fa-solid fa-image"></i>
                                                </button>
                                                {stance.year && (
                                                    <span className="text-[11px] opacity-65 font-bold">{stance.year}</span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className={`font-bold text-base sm:text-lg ${isEn ? 'font-sans' : 'font-kufi'} group-hover:text-emerald-500 transition-colors`}>
                                            {stance.title}
                                        </h3>

                                        {/* Immortal Quote Preview */}
                                        <div 
                                            className="p-3 rounded-xl bg-amber-500/10 border text-center"
                                            style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                        >
                                            <p className={`text-xs sm:text-sm font-bold ${isEn ? 'font-sans' : 'font-kufi'} text-amber-800 dark:text-amber-300 line-clamp-2`}>
                                                «{stance.quote}»
                                            </p>
                                        </div>

                                        <p className="text-xs opacity-80 leading-relaxed line-clamp-2">
                                            {stance.situation}
                                        </p>

                                        <div className="flex items-center justify-between text-xs pt-1.5 border-t opacity-80" style={{ borderColor: 'var(--card-border)' }}>
                                            <span className="truncate max-w-[200px]">{stance.proof}</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                                                {ui.stanceDetails}
                                                <i className={`fa-solid ${isEn ? 'fa-arrow-right' : 'fa-arrow-left'} text-[10px]`}></i>
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {filteredStances.length === 0 && (
                                    <div className="text-center py-12 opacity-60">
                                        <i className="fa-solid fa-award text-3xl mb-2"></i>
                                        <p className="text-sm">{ui.noStances}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* 5. Timeline Interactive List */
                        <div
                            key="timeline-list"
                            className="space-y-4 max-w-3xl mx-auto"
                        >
                            {/* Search and Era Filters */}
                            <div className="space-y-2.5">
                                <div 
                                    className="p-2 sm:p-2.5 rounded-2xl themed-card border shadow-sm relative overflow-hidden flex items-center"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={isEn ? `Search Seerah events, expeditions, figures, places & lessons (${allMilestones.length} milestones)...` : `ابحث في أحداث السيرة، المعارك، الشخصيات، الأماكن والعِبر (${allMilestones.length} محطة)...`}
                                            className={`w-full ${isEn ? 'pl-9 pr-8 text-left' : 'pl-8 pr-9 text-right'} py-2 text-xs sm:text-sm rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                                            style={{ borderColor: cardBorderColor, color: theme.textColor }}
                                        />
                                        <i className={`fa-solid fa-magnifying-glass absolute ${isEn ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs opacity-50`}></i>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className={`absolute ${isEn ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100`}
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Era Filter Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                    {[
                                        { id: 'all', label: isEn ? `All (${allMilestones.length})` : `كامل السيرة (${allMilestones.length})` },
                                        { id: 'pre-prophethood', label: isEn ? 'Pre-Prophethood' : 'قبل البعثة' },
                                        { id: 'makki', label: isEn ? 'Meccan' : 'العهد المكي' },
                                        { id: 'early-madani', label: isEn ? 'Early Medinan' : 'أوائل المدني' },
                                        { id: 'late-madani', label: isEn ? 'Late Medinan' : 'أواخر المدني' },
                                    ].map((era) => (
                                        <button
                                            key={era.id}
                                            onClick={() => setActiveEraFilter(era.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 active:scale-95 ${
                                                activeEraFilter === era.id
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                            } ${isEn ? 'font-sans' : 'font-kufi'}`}
                                            style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                        >
                                            {era.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Timeline Milestone Cards */}
                            <div className={`space-y-3 relative before:absolute ${isEn ? 'before:left-6' : 'before:right-6'} before:top-4 before:bottom-4 before:w-0.5 before:bg-emerald-500/25`}>
                                {filteredMilestones.map((milestone) => (
                                    <div
                                        key={milestone.id}
                                        onClick={() => handleSelectMilestone(milestone)}
                                        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl themed-card border shadow-sm hover:shadow-md transition-all space-y-2.5 cursor-pointer relative overflow-hidden group active:scale-99 ${isEn ? 'ml-2' : 'mr-2'}`}
                                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                    <i className={milestone.icon}></i>
                                                    {milestone.badge}
                                                </span>
                                                <span className="text-[11px] opacity-65 font-bold">
                                                    {milestone.eraLabel}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyMilestone(milestone);
                                                    }}
                                                    title={ui.copyMilestone}
                                                    className="w-7 h-7 rounded-full border flex items-center justify-center text-xs hover:bg-black/10 transition-colors"
                                                    style={{ borderColor: cardBorderColor }}
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
                                                    className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100"
                                                    style={{ color: 'var(--text-color)' }}
                                                >
                                                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => handleShareCardImage(milestone, e)}
                                                    title={ui.shareImage}
                                                    className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center text-xs transition-colors"
                                                >
                                                    <i className="fa-solid fa-image"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className={`font-bold text-base sm:text-lg ${isEn ? 'font-sans' : 'font-kufi'} group-hover:text-emerald-500 transition-colors`}>
                                            {milestone.title}
                                        </h3>

                                        <p className="text-xs sm:text-sm opacity-85 leading-relaxed line-clamp-2">
                                            {milestone.summary}
                                        </p>

                                        <div className="flex items-center justify-between text-xs pt-2 border-t opacity-75" style={{ borderColor: 'var(--card-border)' }}>
                                            <span className="flex items-center gap-1 font-bold">
                                                <i className="fa-solid fa-location-dot text-emerald-500 text-[10px]"></i>
                                                {milestone.location} • {milestone.yearHijri ? `${milestone.yearHijri} • ` : ''}{milestone.yearGregorian}
                                            </span>

                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                                                {ui.detailsAndLessons}
                                                <i className={`fa-solid ${isEn ? 'fa-arrow-right' : 'fa-arrow-left'} text-[10px]`}></i>
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {filteredMilestones.length === 0 && (
                                    <div className="text-center py-12 opacity-60">
                                        <i className="fa-solid fa-scroll text-3xl mb-2"></i>
                                        <p className="text-sm">{ui.noMilestones}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
            </main>

            {/* Zoom Modal - Matches identical style & behavior of Adhkar & Duas pages with left alignment for English */}
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
                                    <i className="fa-regular fa-copy text-xs"></i>
                                    {ui.copyText}
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
