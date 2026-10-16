import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { 
    PROPHETIC_SEERAH_DATA, 
    PROPHETIC_STANCES_DATA, 
    PROPHETIC_LINEAGE_DATA,
    SeerahMilestone, 
    PropheticStance 
} from '../data/propheticSeerahData';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { registerBackInterceptor } from '../hooks/useBackButton';

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
    const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
    const isDeepBlack = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isDeepBlack 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || theme.accent || '#000000'));
    const primaryColor = isDeepBlack ? '#FFFFFF' : (theme.palette?.[0] || '#059669');

    // Scroll container refs
    const mainScrollRef = useRef<HTMLElement | null>(null);
    const zoomScrollRef = useRef<HTMLDivElement | null>(null);

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
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Ensure the page always opens from the very top on any card/tab selection
    useLayoutEffect(() => {
        scrollToTop();
    }, [selectedMilestone?.id, selectedStance?.id, activeTab, lineageTab, scrollToTop]);

    useEffect(() => {
        scrollToTop();
        const timer = setTimeout(scrollToTop, 30);
        return () => clearTimeout(timer);
    }, [selectedMilestone?.id, selectedStance?.id, activeTab, lineageTab, scrollToTop]);

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
    const handleCopyMilestone = (m: SeerahMilestone) => {
        let text = `📜 *${m.title}*\n`;
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

        navigator.clipboard.writeText(text).then(() => {
            showToast('تم نسخ كامل بيانات وتفاصيل المحطة بنجاح');
        }).catch(() => {
            showToast('تعذر النسخ');
        });
    };

    // Copy Stance with ALL newly added data
    const handleCopyStance = (s: PropheticStance) => {
        let text = `✨ *${s.title}* (${s.categoryBadge})\n`;
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

        navigator.clipboard.writeText(text).then(() => {
            showToast('تم نسخ الموقف الخالد بجميع تفاصيله وعِبره');
        }).catch(() => {
            showToast('تعذر النسخ');
        });
    };

    // Copy Lineage with all deep sections
    const handleCopyLineage = (section?: 'all' | 'tree' | 'mother' | 'names' | 'nurses' | 'characteristics' | 'virtues') => {
        let text = `👑 *النسب النبوي الشريف وسيرته الزكية ﷺ*\n\n`;
        text += `📌 *سلسلة النسب المتصل إلى إبراهيم وإسماعيل عليهما السلام:*\n${PROPHETIC_LINEAGE_DATA.fullText}\n\n`;

        if (!section || section === 'all' || section === 'mother') {
            text += `🌸 *نسب أمه الطاهرة:*\n${PROPHETIC_LINEAGE_DATA.motherLineage.fullName}\nالقبيلة: ${PROPHETIC_LINEAGE_DATA.motherLineage.tribe}\nملتقى النسبين: ${PROPHETIC_LINEAGE_DATA.motherLineage.meetingPoint}\n${PROPHETIC_LINEAGE_DATA.motherLineage.details}\n\n`;
        }

        if (!section || section === 'all' || section === 'names') {
            text += `✨ *أسماؤه الشريفة ومعانيها:*\n${PROPHETIC_LINEAGE_DATA.propheticNames.map(n => `• ${n.name}: ${n.meaning} (${n.source})`).join('\n')}\n\n`;
        }

        if (!section || section === 'all' || section === 'nurses') {
            text += `🍼 *مرضعاته وحاضناته وإخوته في الرضاع:*\n${PROPHETIC_LINEAGE_DATA.nursesAndFosterBrothers.map(nb => `• ${nb.person} (${nb.role}): ${nb.details}`).join('\n')}\n\n`;
        }

        if (!section || section === 'all' || section === 'characteristics') {
            text += `🌿 *الشمائل المحمدية الشريفة:*\n${PROPHETIC_LINEAGE_DATA.nobleCharacteristics.map(c => `• ${c.title} [${c.category}]:\n${c.description}\n(${c.hadithRef})`).join('\n\n')}\n\n`;
        }

        text += `📜 *أحاديث الاصطفاء وطهارة النسب:*\nقال رسول الله ﷺ: «إن الله اصطفى كنانة من ولد إسماعيل، واصطفى قريشاً من كنانة، واصطفى من قريش بني هاشم، واصطفاني من بني هاشم، فأنا خيار من خيار» (صحيح مسلم).\n\nمشارك من تطبيق مصحف أحمد وليلى`;

        navigator.clipboard.writeText(text).then(() => {
            showToast('تم نسخ بيانات النسب والشمائل النبوية الشريفة بنجاح');
        }).catch(() => {
            showToast('تعذر النسخ');
        });
    };

    // Share Milestone as rich image card (Pure Canvas 2D without text collisions)
    const handleShareCardImage = async (m: SeerahMilestone, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isSharing) return;
        setIsSharing(true);
        try {
            const cardTitle = m.title;
            let cardBody = `${m.summary}\n\n`;
            if (m.strategicImpact) {
                cardBody += `🎯 الأثر الاستراتيجي:\n${m.strategicImpact}\n\n`;
            }
            if (m.propheticMiraclesOrDuas) {
                cardBody += `🤲 بركات وأدعية نبوية:\n${m.propheticMiraclesOrDuas}\n\n`;
            }
            const topLessons = m.lessons.slice(0, 3).map((l, i) => `${i + 1}. ${l}`).join('\n');
            cardBody += `💡 من أبرز الدروس والعِبر:\n${topLessons}`;

            const cardCategory = `${m.eraLabel} • ${m.location}`;
            const cardSource = `${m.yearHijri ? `${m.yearHijri} • ` : ''}${m.yearGregorian} | عمر النبي ﷺ: ${m.ageOfProphet}`;

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
            showToast('تعذر مشاركة البطاقة كصورة');
        } finally {
            setIsSharing(false);
        }
    };

    // Share Stance as rich image card
    const handleShareStanceImage = async (s: PropheticStance, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isSharing) return;
        setIsSharing(true);
        try {
            const cardTitle = s.title;
            let cardBody = `${s.situation}\n\n🌟 الكلمة والموقف الخالد:\n«${s.quote}»\n\n`;
            if (s.psychologicalAnalysis) {
                cardBody += `🧠 البعد القيادي والتربوي:\n${s.psychologicalAnalysis}\n\n`;
            }
            cardBody += `💡 العِبرة الإنسانية:\n${s.moralLesson}`;
            const cardCategory = `مواقف خالدة • ${s.categoryBadge}`;
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
            showToast('تعذر مشاركة الموقف كصورة');
        } finally {
            setIsSharing(false);
        }
    };

    // Share Lineage as rich image card
    const handleShareLineageImage = async () => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            const cardTitle = 'النسب النبوي الشريف ﷺ';
            const cardBody = `${PROPHETIC_LINEAGE_DATA.fullText}\n\nأمّه: ${PROPHETIC_LINEAGE_DATA.motherLineage.fullName}\n\nقال رسول الله ﷺ: «إن الله اصطفى كنانة من ولد إسماعيل، واصطفى قريشاً من كنانة، واصطفى من قريش بني هاشم، واصطفاني من بني هاشم، فأنا خيار من خيار» (صحيح مسلم).`;
            const cardCategory = 'شجرة النبوة والاصطفاء الإلهي';
            const cardSource = 'وصولاً إلى ذبيح الله إسماعيل وخليل الرحمن إبراهيم عليهما السلام';

            await shareAsImage({
                title: cardTitle,
                text: cardBody,
                category: cardCategory,
                source: cardSource,
                theme,
                setToastMessage
            });
        } catch (error) {
            console.error('Error sharing lineage image:', error);
            showToast('تعذر مشاركة بطاقة النسب كصورة');
        } finally {
            setIsSharing(false);
        }
    };

    // Filtering Milestones
    const filteredMilestones = PROPHETIC_SEERAH_DATA.filter((m) => {
        const matchesEra = activeEraFilter === 'all' || m.era === activeEraFilter;
        const matchesSearch =
            !searchQuery ||
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.strategicImpact && m.strategicImpact.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.propheticMiraclesOrDuas && m.propheticMiraclesOrDuas.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.historicalSecrets && m.historicalSecrets.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.keyFigures && m.keyFigures.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))) ||
            m.lessons.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesEra && matchesSearch;
    });

    // Filtering Stances
    const filteredStances = PROPHETIC_STANCES_DATA.filter((s) => {
        const matchesCategory = activeStanceCategory === 'all' || s.category === activeStanceCategory;
        const matchesSearch =
            !searchQuery ||
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.moralLesson.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.detailedDialogue && s.detailedDialogue.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (s.psychologicalAnalysis && s.psychologicalAnalysis.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (s.contemporaryReflection && s.contemporaryReflection.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (s.keyFigures && s.keyFigures.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    // Current Index in Milestones for next/prev
    const currentMilestoneIndex = selectedMilestone 
        ? PROPHETIC_SEERAH_DATA.findIndex(m => m.id === selectedMilestone.id) 
        : -1;
    const prevMilestone = currentMilestoneIndex > 0 ? PROPHETIC_SEERAH_DATA[currentMilestoneIndex - 1] : null;
    const nextMilestone = currentMilestoneIndex >= 0 && currentMilestoneIndex < PROPHETIC_SEERAH_DATA.length - 1 
        ? PROPHETIC_SEERAH_DATA[currentMilestoneIndex + 1] 
        : null;

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
            className="flex flex-col h-screen overflow-hidden select-none"
            style={{ 
                backgroundColor: theme.bgColor || '#FFFFFF', 
                color: theme.textColor,
                direction: 'rtl' 
            }}
        >
            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xl border border-emerald-400 flex items-center gap-2"
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
                        {/* سهم الرجوع للخلف على يمين النص */}
                        <div className="absolute right-0 flex items-center">
                            <button
                                onClick={handleBackClick}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="رجوع للخلف"
                                aria-label="رجوع للخلف"
                            >
                                <i className="fa-solid fa-arrow-right text-xl"></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className={`text-center ${selectedMilestone || selectedStance ? 'px-20 sm:px-24' : 'px-12'}`}>
                            <h1 className={`app-top-bar__title font-kufi transition-all ${
                                selectedMilestone || selectedStance 
                                    ? 'text-[11px] sm:text-xs leading-tight font-bold line-clamp-2' 
                                    : 'text-xl sm:text-2xl'
                            }`}>
                                {selectedMilestone
                                    ? selectedMilestone.title
                                    : selectedStance
                                    ? selectedStance.title
                                    : activeTab === 'timeline'
                                    ? 'السيرة والخط الزمني'
                                    : activeTab === 'stances'
                                    ? 'مواقف نبوية خالدة ﷺ'
                                    : 'النسب النبوي الشريف ﷺ'}
                            </h1>
                        </div>

                        {/* أيقونة المنزل على يسار النص للعودة إلى الصفحة الرئيسية */}
                        <div className="absolute left-0 flex items-center gap-1">
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="الصفحة الرئيسية"
                                aria-label="الصفحة الرئيسية"
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
                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold font-kufi transition-all flex items-center justify-center text-center ${
                                activeTab === 'timeline'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            style={{
                                borderColor: activeTab === 'timeline' ? undefined : cardBorderColor,
                                borderWidth: activeTab === 'timeline' ? undefined : '1px',
                                borderStyle: activeTab === 'timeline' ? undefined : 'solid'
                            }}
                        >
                            <span className="text-center block w-full">الخط الزمني</span>
                        </button>

                        <button
                            onClick={() => switchTab('stances')}
                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold font-kufi transition-all flex items-center justify-center text-center ${
                                activeTab === 'stances'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            style={{
                                borderColor: activeTab === 'stances' ? undefined : cardBorderColor,
                                borderWidth: activeTab === 'stances' ? undefined : '1px',
                                borderStyle: activeTab === 'stances' ? undefined : 'solid'
                            }}
                        >
                            <span className="text-center block w-full">مواقف خالدة</span>
                        </button>

                        <button
                            onClick={() => switchTab('lineage')}
                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold font-kufi transition-all flex items-center justify-center text-center ${
                                activeTab === 'lineage'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            style={{
                                borderColor: activeTab === 'lineage' ? undefined : cardBorderColor,
                                borderWidth: activeTab === 'lineage' ? undefined : '1px',
                                borderStyle: activeTab === 'lineage' ? undefined : 'solid'
                            }}
                        >
                            <span className="text-center block w-full">نسبه الشريف ﷺ</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Body */}
            <main ref={mainScrollRef} className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-2 pb-6">
                <AnimatePresence mode="wait">
                    {/* 1. Milestone Detail View */}
                    {selectedMilestone ? (
                        <motion.div
                            key={`detail-milestone-${selectedMilestone.id}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
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
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                                            <i className={selectedMilestone.icon}></i>
                                            {selectedMilestone.badge}
                                        </span>
                                        <span className="text-xs opacity-75 font-bold">
                                            {selectedMilestone.eraLabel}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 text-xs opacity-80">
                                            <i className="fa-solid fa-location-dot text-emerald-500"></i>
                                            <span>{selectedMilestone.location}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: selectedMilestone.title,
                                                subtitle: `${selectedMilestone.eraLabel} • ${selectedMilestone.location}`,
                                                badge: selectedMilestone.badge,
                                                icon: selectedMilestone.icon,
                                                content: `${selectedMilestone.summary}\n\n• التاريخ والزمن: ${selectedMilestone.yearHijri ? `${selectedMilestone.yearHijri} • ` : ''}${selectedMilestone.yearGregorian}\n• عمر النبي ﷺ: ${selectedMilestone.ageOfProphet}`
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold font-kufi">
                                    {selectedMilestone.title}
                                </h2>

                                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t text-xs" style={{ borderColor: 'var(--card-border)' }}>
                                    <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                        <span className="opacity-60 block text-[10px]">التاريخ والزمن:</span>
                                        <span className="font-bold">{selectedMilestone.yearHijri ? `${selectedMilestone.yearHijri} • ` : ''}{selectedMilestone.yearGregorian}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                        <span className="opacity-60 block text-[10px]">عمر النبي ﷺ:</span>
                                        <span className="font-bold">{selectedMilestone.ageOfProphet}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Figures Tags */}
                            {selectedMilestone.keyFigures && selectedMilestone.keyFigures.length > 0 && (
                                <div 
                                    className="p-4 rounded-3xl themed-card border shadow-xs space-y-2"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-xs font-bold font-kufi flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                            <i className="fa-solid fa-users text-xs"></i>
                                            شخصيات وأعلام بارزة في هذه المحطة:
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: 'شخصيات وأعلام بارزة في هذه المحطة',
                                                subtitle: selectedMilestone.title,
                                                badge: selectedMilestone.badge,
                                                icon: 'fa-solid fa-users',
                                                content: selectedMilestone.keyFigures.map(person => `• ${person}`).join('\n')
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {selectedMilestone.keyFigures.map((person, idx) => (
                                            <span 
                                                key={idx} 
                                                className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5"
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
                                    <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <i className="fa-solid fa-book-open"></i>
                                        أحداث المحطة وتفاصيلها الموثقة
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: 'أحداث المحطة وتفاصيلها الموثقة',
                                            subtitle: selectedMilestone.title,
                                            badge: selectedMilestone.badge,
                                            icon: 'fa-solid fa-book-open',
                                            content: selectedMilestone.details
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title="تكبير"
                                        aria-label="تكبير"
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed opacity-90 font-medium whitespace-pre-line">
                                    {selectedMilestone.details}
                                </p>
                            </div>

                            {/* 🎯 NEW: Strategic Impact */}
                            {selectedMilestone.strategicImpact && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-blue-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                            <i className="fa-solid fa-chess"></i>
                                            الأثر الاستراتيجي والتحول التاريخي
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: 'الأثر الاستراتيجي والتحول التاريخي',
                                                subtitle: selectedMilestone.title,
                                                badge: selectedMilestone.badge,
                                                icon: 'fa-solid fa-chess',
                                                content: selectedMilestone.strategicImpact!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-semibold">
                                        {selectedMilestone.strategicImpact}
                                    </p>
                                </div>
                            )}

                            {/* 🤲 NEW: Prophetic Miracles & Duas */}
                            {selectedMilestone.propheticMiraclesOrDuas && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-amber-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                            <i className="fa-solid fa-hand-holding-heart"></i>
                                            معجزات وأدعية وبركات ارتبطت بالمحطة
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: 'معجزات وأدعية وبركات ارتبطت بالمحطة',
                                                subtitle: selectedMilestone.title,
                                                badge: selectedMilestone.badge,
                                                icon: 'fa-solid fa-hand-holding-heart',
                                                content: selectedMilestone.propheticMiraclesOrDuas!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
                                        {selectedMilestone.propheticMiraclesOrDuas}
                                    </p>
                                </div>
                            )}

                            {/* 🔍 NEW: Historical Secrets & Nuances */}
                            {selectedMilestone.historicalSecrets && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-purple-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                            <i className="fa-solid fa-compass"></i>
                                            أسرار ولطائف تاريخية وحكم نبوية خفية
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: 'أسرار ولطائف تاريخية وحكم نبوية خفية',
                                                subtitle: selectedMilestone.title,
                                                badge: selectedMilestone.badge,
                                                icon: 'fa-solid fa-compass',
                                                content: selectedMilestone.historicalSecrets!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
                                        {selectedMilestone.historicalSecrets}
                                    </p>
                                </div>
                            )}

                            {/* Lessons and Moral Values */}
                            <div 
                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-3 bg-emerald-500/5"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <i className="fa-solid fa-lightbulb"></i>
                                        العِبر والدروس الإيمانية والعملية
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: 'العِبر والدروس الإيمانية والعملية',
                                            subtitle: selectedMilestone.title,
                                            badge: selectedMilestone.badge,
                                            icon: 'fa-solid fa-lightbulb',
                                            content: selectedMilestone.lessons
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title="تكبير"
                                        aria-label="تكبير"
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <div className="space-y-2.5">
                                    {selectedMilestone.lessons.map((lesson, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
                                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <p className="flex-1 font-medium">{lesson}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Proof Quote */}
                            {(selectedMilestone.versesOrHadiths || selectedMilestone.proof) && (
                                <div 
                                    className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border text-xs"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="font-bold opacity-75 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-kufi">
                                            <i className="fa-solid fa-quote-right"></i>
                                            شاهد من القرآن الكريم أو السنة الشريفة:
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: 'شاهد من القرآن الكريم أو السنة الشريفة',
                                                subtitle: selectedMilestone.title,
                                                badge: selectedMilestone.badge,
                                                icon: 'fa-solid fa-quote-right',
                                                content: (selectedMilestone.versesOrHadiths || selectedMilestone.proof)!,
                                                isVerseOrProof: true
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="italic opacity-90 leading-relaxed font-semibold">
                                        {selectedMilestone.versesOrHadiths || selectedMilestone.proof}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                <button
                                    onClick={() => handleShareCardImage(selectedMilestone)}
                                    disabled={isSharing}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md"
                                >
                                    {isSharing ? (
                                        <>
                                            <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                                            جاري تجهيز الصورة...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-image text-xs"></i>
                                            مشاركة كبطاقة صورة بدقة عالية
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleCopyMilestone(selectedMilestone)}
                                    className="py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                                    style={{ borderColor: cardBorderColor }}
                                    title="نسخ كامل البيانات"
                                >
                                    <i className="fa-regular fa-copy text-xs"></i>
                                    نسخ كامل البيانات
                                </button>
                            </div>

                            {/* Next / Previous Milestones Navigation */}
                            <div className="grid grid-cols-2 gap-3 pt-3">
                                {prevMilestone ? (
                                    <button
                                        onClick={() => handleSelectMilestone(prevMilestone)}
                                        className="p-3 rounded-2xl border text-right transition-all active:scale-95 shadow-sm hover:border-emerald-500"
                                        style={{ borderColor: cardBorderColor }}
                                    >
                                        <span className="text-[10px] opacity-60 block">المحطة السابقة</span>
                                        <span className="text-xs font-bold block truncate font-kufi">{prevMilestone.title}</span>
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {nextMilestone ? (
                                    <button
                                        onClick={() => handleSelectMilestone(nextMilestone)}
                                        className="p-3 rounded-2xl border text-right transition-all active:scale-95 shadow-sm hover:border-emerald-500"
                                        style={{ borderColor: cardBorderColor }}
                                    >
                                        <span className="text-[10px] opacity-60 block">المحطة التالية</span>
                                        <span className="text-xs font-bold block truncate font-kufi">{nextMilestone.title}</span>
                                    </button>
                                ) : (
                                    <div />
                                )}
                            </div>
                        </motion.div>
                    ) : selectedStance ? (
                        /* 2. Stance Detail View */
                        <motion.div
                            key={`detail-stance-${selectedStance.id}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="max-w-2xl mx-auto space-y-4"
                        >
                            <div 
                                className="p-5 sm:p-6 rounded-3xl themed-card border shadow-lg relative overflow-hidden"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                                        <i className={selectedStance.icon}></i>
                                        {selectedStance.categoryBadge}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {selectedStance.year && (
                                            <span className="text-xs font-bold opacity-75">{selectedStance.year}</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: selectedStance.title,
                                                subtitle: selectedStance.categoryBadge,
                                                badge: selectedStance.categoryBadge,
                                                icon: selectedStance.icon,
                                                content: `«${selectedStance.quote}»\n\n${selectedStance.situation}`
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold font-kufi text-emerald-600 dark:text-emerald-400">
                                    {selectedStance.title}
                                </h2>

                                {/* Prophetic Immortal Quote Callout */}
                                <div 
                                    className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border text-center"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-1">الكلمة والموقف الخالد</span>
                                    <p className="text-base sm:text-lg font-bold font-kufi text-amber-700 dark:text-amber-300 leading-relaxed">
                                        «{selectedStance.quote}»
                                    </p>
                                </div>
                            </div>

                            {/* The Situation Context */}
                            <div 
                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <i className="fa-solid fa-scroll"></i>
                                        السياق وتفاصيل الموقف
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: 'السياق وتفاصيل الموقف',
                                            subtitle: selectedStance.title,
                                            badge: selectedStance.categoryBadge,
                                            icon: 'fa-solid fa-scroll',
                                            content: selectedStance.situation
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title="تكبير"
                                        aria-label="تكبير"
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed opacity-90 font-medium whitespace-pre-line">
                                    {selectedStance.situation}
                                </p>
                            </div>

                            {/* 💬 NEW: Detailed Dialogue */}
                            {selectedStance.detailedDialogue && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-emerald-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                            <i className="fa-solid fa-comments"></i>
                                            نص المحاورة والحوار النبوي الشريف
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: 'نص المحاورة والحوار النبوي الشريف',
                                                subtitle: selectedStance.title,
                                                badge: selectedStance.categoryBadge,
                                                icon: 'fa-solid fa-comments',
                                                content: selectedStance.detailedDialogue!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-semibold whitespace-pre-line">
                                        {selectedStance.detailedDialogue}
                                    </p>
                                </div>
                            )}

                            {/* 🧠 NEW: Psychological & Leadership Analysis */}
                            {selectedStance.psychologicalAnalysis && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-blue-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                            <i className="fa-solid fa-brain"></i>
                                            التحليل النفسي والتربوي والقيادي للموقف
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: 'التحليل النفسي والتربوي والقيادي للموقف',
                                                subtitle: selectedStance.title,
                                                badge: selectedStance.categoryBadge,
                                                icon: 'fa-solid fa-brain',
                                                content: selectedStance.psychologicalAnalysis!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
                                        {selectedStance.psychologicalAnalysis}
                                    </p>
                                </div>
                            )}

                            {/* 🌍 NEW: Contemporary Reflection */}
                            {selectedStance.contemporaryReflection && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-purple-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                            <i className="fa-solid fa-globe"></i>
                                            إسقاط الموقف على واقعنا المعاصر وحياتنا اليومية
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: 'إسقاط الموقف على واقعنا المعاصر وحياتنا اليومية',
                                                subtitle: selectedStance.title,
                                                badge: selectedStance.categoryBadge,
                                                icon: 'fa-solid fa-globe',
                                                content: selectedStance.contemporaryReflection!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
                                        {selectedStance.contemporaryReflection}
                                    </p>
                                </div>
                            )}

                            {/* 🛠️ NEW: Practical Application Steps */}
                            {selectedStance.practicalApplication && (
                                <div 
                                    className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-amber-500/5"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                            <i className="fa-solid fa-check-to-slot"></i>
                                            خطوات وتطبيقات عملية للاقتداء بالخلق النبوي
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setZoomedCard({
                                                title: 'خطوات وتطبيقات عملية للاقتداء بالخلق النبوي',
                                                subtitle: selectedStance.title,
                                                badge: selectedStance.categoryBadge,
                                                icon: 'fa-solid fa-check-to-slot',
                                                content: selectedStance.practicalApplication!
                                            })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title="تكبير"
                                            aria-label="تكبير"
                                        >
                                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium whitespace-pre-line">
                                        {selectedStance.practicalApplication}
                                    </p>
                                </div>
                            )}

                            {/* The Moral Lesson */}
                            <div 
                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5 bg-emerald-500/5"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <i className="fa-solid fa-lightbulb"></i>
                                        القيمة الإنسانية والعِبرة الخالدة
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: 'القيمة الإنسانية والعِبرة الخالدة',
                                            subtitle: selectedStance.title,
                                            badge: selectedStance.categoryBadge,
                                            icon: 'fa-solid fa-lightbulb',
                                            content: selectedStance.moralLesson
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title="تكبير"
                                        aria-label="تكبير"
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed font-semibold">
                                    {selectedStance.moralLesson}
                                </p>
                            </div>

                            {/* Proof Documentation */}
                            <div 
                                className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border text-xs"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-bold opacity-75 text-blue-500 flex items-center gap-1.5 font-kufi">
                                        <i className="fa-solid fa-check-double"></i>
                                        التوثيق والمصدر:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard({
                                            title: 'التوثيق والمصدر',
                                            subtitle: selectedStance.title,
                                            badge: selectedStance.categoryBadge,
                                            icon: 'fa-solid fa-check-double',
                                            content: selectedStance.proof,
                                            isVerseOrProof: true
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                                        style={{ color: 'var(--text-color)' }}
                                        title="تكبير"
                                        aria-label="تكبير"
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    </button>
                                </div>
                                <p className="opacity-90 leading-relaxed font-semibold">
                                    {selectedStance.proof}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                <button
                                    onClick={() => handleShareStanceImage(selectedStance)}
                                    disabled={isSharing}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md"
                                >
                                    <i className="fa-solid fa-image text-xs"></i>
                                    مشاركة الموقف كبطاقة صورة
                                </button>
                                <button
                                    onClick={() => handleCopyStance(selectedStance)}
                                    className="py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                                    style={{ borderColor: cardBorderColor }}
                                    title="نسخ كامل تفاصيل الموقف"
                                >
                                    <i className="fa-regular fa-copy text-xs"></i>
                                    نسخ كامل تفاصيل الموقف
                                </button>
                            </div>
                        </motion.div>
                    ) : activeTab === 'lineage' ? (
                        /* 3. Noble Lineage View (نسب النبي ﷺ كاملاً وصولاً إلى إبراهيم عليه السلام مع أقسام مفصلة) */
                        <motion.div
                            key="lineage-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4 max-w-3xl mx-auto"
                        >
                            {/* Lineage Hero Card */}
                            <div 
                                className="p-5 sm:p-7 rounded-3xl themed-card border shadow-lg relative overflow-hidden text-center space-y-4"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold font-kufi">
                                    <i className="fa-solid fa-crown text-amber-400"></i>
                                    <span>النسب الشريف المصطفى وخاتم الأنبياء</span>
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold font-kufi text-emerald-600 dark:text-emerald-400">
                                    {PROPHETIC_LINEAGE_DATA.fullName}
                                </h2>

                                <div 
                                    className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border text-xs sm:text-sm leading-relaxed font-semibold"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <p className="opacity-90">
                                        {PROPHETIC_LINEAGE_DATA.shortChain}
                                    </p>
                                </div>

                                {/* Full Connected Lineage Paragraph */}
                                <div 
                                    className="p-4 rounded-2xl bg-emerald-500/10 border text-xs sm:text-sm leading-relaxed font-medium text-right"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1 font-kufi">
                                        سلسلة الأجداد المتصلة وصولاً إلى إسماعيل وإبراهيم عليهما السلام:
                                    </span>
                                    <p className="opacity-95 leading-loose">
                                        {PROPHETIC_LINEAGE_DATA.fullText}
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
                                        مشاركة بطاقة النسب كصورة
                                    </button>

                                    <button
                                        onClick={() => handleCopyLineage('all')}
                                        className="py-2.5 px-5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <i className="fa-regular fa-copy text-xs"></i>
                                        نسخ شجرة النسب والشمائل كاملة
                                    </button>
                                </div>
                            </div>

                            {/* Sub-Navigation Tabs within Lineage View */}
                            <div 
                                className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1.5 px-2 rounded-2xl border hide-scrollbar"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                {[
                                    { id: 'tree', label: 'شجرة الأجداد وقصصهم', icon: 'fa-sitemap' },
                                    { id: 'mother', label: 'نسب أمه الطاهرة', icon: 'fa-heart' },
                                    { id: 'names', label: 'أسماؤه الشريفة', icon: 'fa-sparkles' },
                                    { id: 'nurses', label: 'مرضعاته وإخوته في الرضاع', icon: 'fa-baby' },
                                    { id: 'characteristics', label: 'الشمائل المحمدية الشريفة', icon: 'fa-sun' },
                                    { id: 'virtues', label: 'أحاديث طهارة النسب', icon: 'fa-certificate' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setLineageTab(tab.id as any)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 active:scale-95 ${
                                            lineageTab === tab.id
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                        }`}
                                        style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                    >
                                        <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Sub-tab 1: Ancestors with Stories */}
                            {lineageTab === 'tree' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                            <i className="fa-solid fa-users-rays"></i>
                                            سير الأجداد ومآثرهم من عبد الله حتى إبراهيم عليه السلام
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('tree')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            نسخ
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {PROPHETIC_LINEAGE_DATA.ancestors.map((anc, idx) => (
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
                                                        <span className="font-bold text-base font-kufi">
                                                            {anc.name}
                                                        </span>
                                                    </div>
                                                    {anc.title && (
                                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                            {anc.title}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs opacity-85 leading-relaxed font-semibold">
                                                    {anc.significance}
                                                </p>

                                                {anc.story && (
                                                    <div 
                                                        className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border text-xs text-opacity-90 leading-relaxed"
                                                        style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                                    >
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[11px] mb-1 font-kufi">
                                                            مأثرته وقصته في التاريخ:
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
                                        <h3 className="text-base font-bold font-kufi flex items-center gap-2 text-rose-500">
                                            <i className="fa-solid fa-heart"></i>
                                            نسب أمه الطاهرة السيدة آمنة بنت وهب رضي الله عنها
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('mother')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            نسخ
                                        </button>
                                    </div>

                                    <div 
                                        className="p-4 rounded-2xl bg-rose-500/10 border space-y-2"
                                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block font-kufi">
                                            {PROPHETIC_LINEAGE_DATA.motherLineage.fullName}
                                        </span>
                                        <p className="text-xs opacity-90 font-semibold">
                                            {PROPHETIC_LINEAGE_DATA.motherLineage.tribe}
                                        </p>
                                    </div>

                                    <div 
                                        className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border space-y-2 text-xs leading-relaxed"
                                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block font-kufi">
                                            ملتقى النسبين الشريفين:
                                        </span>
                                        <p className="font-semibold opacity-95">
                                            {PROPHETIC_LINEAGE_DATA.motherLineage.meetingPoint}
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-xs sm:text-sm leading-relaxed opacity-90 font-medium">
                                        <p className="whitespace-pre-line">
                                            {PROPHETIC_LINEAGE_DATA.motherLineage.details}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab 3: Prophetic Names */}
                            {lineageTab === 'names' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                            <i className="fa-solid fa-sparkles text-amber-400"></i>
                                            أسماء النبي ﷺ المباركة ومعانيها ودلالاتها
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('names')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            نسخ
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {PROPHETIC_LINEAGE_DATA.propheticNames.map((pn, i) => (
                                            <div 
                                                key={i}
                                                className="p-4 rounded-2xl themed-card border shadow-xs space-y-2"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-bold font-kufi text-emerald-600 dark:text-emerald-400">
                                                        {pn.name}
                                                    </span>
                                                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] flex items-center justify-center font-bold">
                                                        {i + 1}
                                                    </span>
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
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                            <i className="fa-solid fa-baby text-pink-400"></i>
                                            مرضعات النبي ﷺ وحاضناته وإخوته في الرضاع
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('nurses')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            نسخ
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {PROPHETIC_LINEAGE_DATA.nursesAndFosterBrothers.map((nb, i) => (
                                            <div 
                                                key={i}
                                                className="p-4 rounded-2xl themed-card border shadow-xs space-y-1.5"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-sm font-kufi text-emerald-600 dark:text-emerald-400">
                                                        {nb.person}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                                                        {nb.role}
                                                    </span>
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
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                            <i className="fa-solid fa-sun text-amber-400"></i>
                                            الشمائل المحمدية الشريفة (أوصافه الخَلقية والخُلقية)
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('characteristics')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            نسخ
                                        </button>
                                    </div>

                                    <div className="space-y-3.5">
                                        {PROPHETIC_LINEAGE_DATA.nobleCharacteristics.map((c, i) => (
                                            <div 
                                                key={i}
                                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-2.5"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        {c.category}
                                                    </span>
                                                </div>

                                                <h4 className="font-bold text-base font-kufi text-emerald-600 dark:text-emerald-400">
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
                                        <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                            <i className="fa-solid fa-certificate text-amber-400"></i>
                                            أحاديث شريفة في اصطفاء نسبه الشريف وطهارته
                                        </h3>
                                        <button
                                            onClick={() => handleCopyLineage('virtues')}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="fa-regular fa-copy text-[10px]"></i>
                                            نسخ
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {PROPHETIC_LINEAGE_DATA.virtues.map((v, i) => (
                                            <div 
                                                key={i} 
                                                className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border space-y-1.5"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block font-kufi">
                                                    {v.title}
                                                </span>
                                                <p className="text-xs sm:text-sm italic font-semibold leading-relaxed opacity-95">
                                                    {v.hadith}
                                                </p>
                                                <span className="text-[10px] opacity-65 block text-left font-mono">
                                                    {v.source}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : activeTab === 'stances' ? (
                        /* 4. Immortal Stances View (مواقف خالدة للمصطفى ﷺ) */
                        <motion.div
                            key="stances-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
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
                                            placeholder="ابحث في المواقف الخالدة، الكلمات النبوية، الأخلاق والعِبر..."
                                            className="w-full pl-8 pr-9 py-2 text-xs sm:text-sm rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            style={{ borderColor: cardBorderColor, color: theme.textColor }}
                                        />
                                        <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50"></i>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Category Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                    {[
                                        { id: 'all', label: 'جميع المواقف (الكل)' },
                                        { id: 'رحمة وعفو', label: 'الرحمة والعفو' },
                                        { id: 'شجاعة وثبات', label: 'الشجاعة والثبات' },
                                        { id: 'حلم وتواضع', label: 'الحلم والتواضع' },
                                        { id: 'وفاء وأمانة', label: 'الوفاء والمروءة' },
                                        { id: 'شورى وعدالة', label: 'العدالة والنزاهة' },
                                        { id: 'رفق بالخلق', label: 'الرفق بالخلق والحيوان' },
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveStanceCategory(cat.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 active:scale-95 ${
                                                activeStanceCategory === cat.id
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                            }`}
                                            style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
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
                                                <i className={stance.icon}></i>
                                                {stance.categoryBadge}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyStance(stance);
                                                    }}
                                                    title="نسخ الموقف"
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
                                                    title="تكبير"
                                                    aria-label="تكبير"
                                                    className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100"
                                                    style={{ color: 'var(--text-color)' }}
                                                >
                                                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => handleShareStanceImage(stance, e)}
                                                    title="مشاركة الموقف كبطاقة صورة"
                                                    className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center text-xs transition-colors"
                                                >
                                                    <i className="fa-solid fa-image"></i>
                                                </button>
                                                {stance.year && (
                                                    <span className="text-[11px] opacity-65 font-bold">{stance.year}</span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-base sm:text-lg font-kufi group-hover:text-emerald-500 transition-colors">
                                            {stance.title}
                                        </h3>

                                        {/* Immortal Quote Preview */}
                                        <div 
                                            className="p-3 rounded-xl bg-amber-500/10 border text-center"
                                            style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                        >
                                            <p className="text-xs sm:text-sm font-bold font-kufi text-amber-800 dark:text-amber-300 line-clamp-2">
                                                «{stance.quote}»
                                            </p>
                                        </div>

                                        <p className="text-xs opacity-80 leading-relaxed line-clamp-2">
                                            {stance.situation}
                                        </p>

                                        <div className="flex items-center justify-between text-xs pt-1.5 border-t opacity-80" style={{ borderColor: 'var(--card-border)' }}>
                                            <span className="truncate max-w-[200px]">{stance.proof}</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                                                تفاصيل الموقف والعِبرة
                                                <i className="fa-solid fa-arrow-left text-[10px]"></i>
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {filteredStances.length === 0 && (
                                    <div className="text-center py-12 opacity-60">
                                        <i className="fa-solid fa-award text-3xl mb-2"></i>
                                        <p className="text-sm">لا توجد مواقف تطابق بحثك</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* 5. Timeline Interactive List (الخط الزمني الكامل 43 محطة) */
                        <motion.div
                            key="timeline-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
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
                                            placeholder="ابحث في أحداث السيرة، المعارك، الشخصيات، الأماكن والعِبر (43 محطة)..."
                                            className="w-full pl-8 pr-9 py-2 text-xs sm:text-sm rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            style={{ borderColor: cardBorderColor, color: theme.textColor }}
                                        />
                                        <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50"></i>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Era Filter Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                    {[
                                        { id: 'all', label: 'كامل السيرة (43 محطة)' },
                                        { id: 'pre-prophethood', label: 'ما قبل البعثة' },
                                        { id: 'makki', label: 'العهد المكي' },
                                        { id: 'early-madani', label: 'أوائل العهد المدني' },
                                        { id: 'late-madani', label: 'أواخر العهد المدني والوفاة' },
                                    ].map((era) => (
                                        <button
                                            key={era.id}
                                            onClick={() => setActiveEraFilter(era.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 active:scale-95 ${
                                                activeEraFilter === era.id
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                            }`}
                                            style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                        >
                                            {era.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Timeline Milestone Cards */}
                            <div className="space-y-3 relative before:absolute before:right-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-emerald-500/25">
                                {filteredMilestones.map((milestone, idx) => (
                                    <div
                                        key={milestone.id}
                                        onClick={() => handleSelectMilestone(milestone)}
                                        className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl themed-card border shadow-sm hover:shadow-md transition-all space-y-2.5 cursor-pointer relative overflow-hidden group active:scale-99 mr-2"
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
                                                    title="نسخ المحطة"
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
                                                            content: `${milestone.summary}\n\n• التاريخ والزمن: ${milestone.yearHijri ? `${milestone.yearHijri} • ` : ''}${milestone.yearGregorian}\n• عمر النبي ﷺ: ${milestone.ageOfProphet}`
                                                        });
                                                    }}
                                                    title="تكبير"
                                                    aria-label="تكبير"
                                                    className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-xs transition-colors opacity-70 hover:opacity-100"
                                                    style={{ color: 'var(--text-color)' }}
                                                >
                                                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => handleShareCardImage(milestone, e)}
                                                    title="مشاركة المحطة كبطاقة صورة"
                                                    className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center text-xs transition-colors"
                                                >
                                                    <i className="fa-solid fa-image"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-base sm:text-lg font-kufi group-hover:text-emerald-500 transition-colors">
                                            {milestone.title}
                                        </h3>

                                        <p className="text-xs sm:text-sm opacity-85 leading-relaxed line-clamp-2">
                                            {milestone.summary}
                                        </p>

                                        {/* Highlight Strategic Impact or Miracles Preview if available */}
                                        {milestone.strategicImpact && (
                                            <div 
                                                className="p-2.5 rounded-xl bg-blue-500/5 border text-[11px] leading-relaxed text-blue-700 dark:text-blue-300 line-clamp-1"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                                            >
                                                <span className="font-bold">🎯 الأثر الاستراتيجي: </span>
                                                <span>{milestone.strategicImpact}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs pt-2 border-t opacity-75" style={{ borderColor: 'var(--card-border)' }}>
                                            <span className="flex items-center gap-1 font-bold">
                                                <i className="fa-solid fa-location-dot text-emerald-500 text-[10px]"></i>
                                                {milestone.location} • {milestone.yearHijri ? `${milestone.yearHijri} • ` : ''}{milestone.yearGregorian}
                                            </span>

                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                                                التفاصيل والعِبر
                                                <i className="fa-solid fa-arrow-left text-[10px]"></i>
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {filteredMilestones.length === 0 && (
                                    <div className="text-center py-12 opacity-60">
                                        <i className="fa-solid fa-scroll text-3xl mb-2"></i>
                                        <p className="text-sm">لا توجد محطات تطابق بحثك</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Zoom Modal - Matches identical style & behavior of Adhkar & Duas pages */}
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
                            className="p-5 sm:p-7 rounded-3xl w-full max-w-2xl text-center relative shadow-2xl border-2 flex flex-col max-h-[90vh]"
                            style={{ 
                                fontFamily: theme.font,
                                backgroundColor: isDeepBlack ? '#111827' : (theme.cardBg || '#ffffff'),
                                color: theme.textColor || (isDeepBlack ? '#ffffff' : '#1f2937'),
                                borderColor: cardBorderColor
                            }}
                            onClick={e => e.stopPropagation()}
                            dir="rtl"
                        >
                            {/* Header: Title, Subtitle, Font size controls & Close */}
                            <div className="flex items-center justify-between pb-3 border-b shrink-0 gap-2" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="text-right flex items-center gap-2.5 min-w-0">
                                    {zoomedCard.icon && (
                                        <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                            <i className={`${zoomedCard.icon} text-sm`}></i>
                                        </div>
                                    )}
                                    <div className="truncate">
                                        <h3 className="text-base sm:text-lg font-bold font-kufi text-emerald-600 dark:text-emerald-400 truncate">
                                            {zoomedCard.title}
                                        </h3>
                                        {zoomedCard.subtitle && (
                                            <p className="text-[11px] opacity-70 font-sans truncate">
                                                {zoomedCard.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Font Size controls (A- / A+) and Close (X) */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                                        <button 
                                            type="button"
                                            onClick={() => setZoomFontSize(prev => Math.min(prev + 2, 40))}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                            title="تكبير الخط"
                                            aria-label="تكبير الخط"
                                        >
                                            A+
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setZoomFontSize(prev => Math.max(prev - 2, 18))}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                            title="تصغير الخط"
                                            aria-label="تصغير الخط"
                                        >
                                            A-
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setZoomedCard(null)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                        title="إغلاق"
                                        aria-label="إغلاق"
                                    >
                                        <i className="fa-solid fa-xmark text-sm"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Content Container */}
                            <div ref={zoomScrollRef} className="overflow-y-auto hide-scrollbar flex-1 py-4 text-right">
                                {Array.isArray(zoomedCard.content) ? (
                                    <div className="space-y-3">
                                        {zoomedCard.content.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border" style={{ borderColor: 'var(--card-border)' }}>
                                                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <p 
                                                    className="flex-1 font-medium leading-relaxed font-amiri"
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
                                            zoomedCard.isVerseOrProof ? 'font-quran' : 'font-amiri'
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
                                        showToast('تم نسخ النص بنجاح');
                                    }}
                                    className="flex-1 py-3 rounded-xl font-bold border text-sm flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                                    style={{ borderColor: cardBorderColor }}
                                >
                                    <i className="fa-regular fa-copy text-xs"></i>
                                    نسخ النص
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setZoomedCard(null)} 
                                    className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all cursor-pointer text-sm"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PropheticSeerahPage;
