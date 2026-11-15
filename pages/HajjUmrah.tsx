import React, { useState, useEffect, FC } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ThemePageLock from '../components/ThemePageLock';
import { 
    umrahVirtues, umrahGeneralInfo, umrahSteps, hajjTypes, 
    hajjTamattuPlan, hajjIfradPlan, hajjQiranPlan, hajjGeneralInfo, 
    allDuaas, homeScreenAdditions 
} from '../data/hajjUmrahData';
import { 
    umrahVirtuesEn, umrahGeneralInfoEn, umrahStepsEn, 
    hajjGeneralInfoEn, hajjTypesEn, 
    hajjTamattuPlanEn, hajjIfradPlanEn, hajjQiranPlanEn 
} from '../data/hajjUmrahDataEn';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronLeft, ChevronRight, ChevronDown,
    Plus, Minus, RotateCcw,
    ZoomIn, ZoomOut,
    Copy, Check, HelpCircle, X, Share2
} from 'lucide-react';
import { shareAsImage } from '../utils/shareAsImage';
import { getTawafCounterState, saveTawafCounterState, subscribeTawafCounter } from '../utils/tawafCounterStorage';
import { 
    tHajj, getDuaaEnglish, CHECKLIST_ITEMS_EN, 
    DUAA_CATEGORY_TITLES_EN, HOME_ADDITIONS_EN 
} from '../utils/hajjUmrahTranslations';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { HAJJ_UMRAH_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { hexToRgba } from '../utils/flatDesignTokens';
import { getCalculator3DStyles, Calculator3DStyles } from '../utils/calculator3DStyles';

export interface CardZoomData {
    title: string;
    subtitle?: string;
    category?: string;
    text?: string;
    points?: string[];
    evidence?: string;
    quranAyah?: string;
    hadith?: string;
    quranEvidence?: string[];
    sunnahEvidence?: string[];
    actions?: string[];
    detailedSteps?: string[];
    definition?: string;
    description?: string;
    hadyRuling?: string;
    whoIsItFor?: string;
    comparison?: any;
    mistakes?: string[];
    sunan?: string[];
    items?: string[];
    duaaItems?: string[];
    duaaIndex?: number;
    onIndexChange?: (newIndex: number) => void;
    virtues?: { title: string; source: string; text: string; explanation: string }[];
    sections?: { tabLabel: string; title: string; subtitle?: string; quranAyah?: string; hadith?: string; points: string[] }[];
}

interface DuaaSectionProps {
    id: number;
    title: string;
    items: string[];
    isOpen: boolean;
    onToggle: () => void;
    onZoom: (data: CardZoomData) => void;
    cardTextScale: number;
    s3d: Calculator3DStyles;
}

const DuaaSection: FC<DuaaSectionProps> = ({ id, title, items, isOpen, onToggle, onZoom, cardTextScale, s3d }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
        }
    }, [isOpen]);

    const handleNext = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (currentIndex < items.length - 1) setCurrentIndex(i => i + 1);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (currentIndex > 0) setCurrentIndex(i => i - 1);
    };

    const displayTitle = isEn ? (DUAA_CATEGORY_TITLES_EN[id] || title) : title;
    const currentArabicItem = items[currentIndex] || '';
    const currentEnglishTranslation = getDuaaEnglish(currentArabicItem);

    const handleZoomClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onZoom({
            title: displayTitle,
            subtitle: `${currentIndex + 1} / ${items.length}`,
            duaaItems: items,
            duaaIndex: currentIndex,
            onIndexChange: (newIndex: number) => {
                setCurrentIndex(newIndex);
            }
        });
    };

    return (
        <div 
            id={`duaa-section-${id}`} 
            className={`app-page-card border-0 rounded-3xl overflow-hidden mb-3.5 transition-all ${s3d.surfaceCardClass}`}
        >
            <button 
                type="button"
                onClick={onToggle} 
                className="w-full flex justify-between items-center p-4.5 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-0"
            >
                <span className={`font-extrabold text-base md:text-lg ${isEn ? 'text-left' : 'text-right'}`} style={{ color: s3d.textColor, fontSize: `${16 * cardTextScale}px` }}>
                    {displayTitle}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`border-0 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                >
                    <ChevronDown className="w-4 h-4 opacity-80" style={{ color: s3d.textColor }} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-1">
                            <div 
                                onClick={handleZoomClick}
                                className={`border-0 flex flex-col gap-4 p-5 rounded-2xl relative min-h-[160px] justify-center items-center text-center cursor-pointer ${s3d.recessedInputClass}`}
                            >
                                <span className={`border-0 absolute top-3 ${isRTL ? 'right-4' : 'left-4'} text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-200/70 dark:bg-white/10'}`} style={{ color: s3d.subtextColor }}>
                                    {currentIndex + 1} / {items.length}
                                </span>
                                
                                <div className="mt-7 mb-2 space-y-3 w-full">
                                    {isEn ? (
                                        <p className="border-0 text-sm md:text-base leading-[2.2] text-emerald-800 dark:text-emerald-300 font-medium px-4 py-2.5 rounded-2xl bg-emerald-500/10 text-start"
                                           style={{ fontSize: `${14 * cardTextScale}px` }}>
                                            {currentEnglishTranslation}
                                        </p>
                                    ) : (
                                        <p className="text-lg md:text-xl leading-[2.3] font-amiri font-bold px-2" style={{ color: s3d.textColor, fontSize: `${18 * cardTextScale}px` }}>
                                            {currentArabicItem}
                                        </p>
                                    )}
                                </div>
                                
                                <div className={`flex w-full justify-between items-center mt-2 border-t ${s3d.dividerClass} pt-3.5 pb-1 overflow-visible`}>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                        disabled={currentIndex === items.length - 1}
                                        className={`app-page-card border-0 p-2 px-3.5 rounded-xl disabled:opacity-35 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm ${s3d.surfaceCardClass}`}
                                    >
                                        {!isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                        <span>{tHajj('nextDuaa', language)}</span>
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                        disabled={currentIndex === 0}
                                        className={`app-page-card border-0 p-2 px-3.5 rounded-xl disabled:opacity-35 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm ${s3d.surfaceCardClass}`}
                                    >
                                        <span>{tHajj('prevDuaa', language)}</span>
                                        {!isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ChecklistScreen = ({ s3d, cardTextScale, onZoom }: { s3d: Calculator3DStyles, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const saved = localStorage.getItem('hajjUmrahChecklist');
        if (saved) {
            try { setCheckedItems(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    const toggleItem = (id: string) => {
        const newItems = { ...checkedItems, [id]: !checkedItems[id] };
        setCheckedItems(newItems);
        localStorage.setItem('hajjUmrahChecklist', JSON.stringify(newItems));
    };

    const categories = [
        {
            title: tHajj('checklistCatEssentials', language),
            items: [
                { id: '1', ar: "ملابس الإحرام (إزار ورداء / ملابس واسعة)" },
                { id: '2', ar: "حذاء خفيف ومريح" },
                { id: '3', ar: "حقيبة صغيرة لحفظ الأوراق والمال" },
                { id: '4', ar: "مقص صغير / ماكينة حلاقة" },
                { id: '5', ar: "أدوية شخصية ومسكنات" },
                { id: '6', ar: "مظلة شمسية" }
            ]
        },
        {
            title: tHajj('checklistCatGeneral', language),
            items: [
                { id: '7', ar: "كتيب أذكار / مصحف جيب / سبحة" },
                { id: '8', ar: "ملابس قطنية مريحة" },
                { id: '9', ar: "مناديل مبللة وجافة (بدون عطر)" },
                { id: '10', ar: "شاحن هاتف ومخزن طاقة" },
                { id: '11', ar: "نظارة شمسية" },
                { id: '12', ar: "سجادة صلاة خفيفة" }
            ]
        }
    ];

    return (
        <section className="space-y-4">
            <div 
                className={`app-page-card border-0 rounded-3xl p-4.5 text-center relative ${s3d.surfaceCardClass}`}
            >
                <p className="text-sm font-extrabold px-4" style={{ color: s3d.primaryColor, fontSize: `${14 * cardTextScale}px` }}>
                    {tHajj('checklistHeader', language)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                    <div 
                        key={i} 
                        className={`app-page-card border-0 rounded-3xl p-4.5 relative ${s3d.surfaceCardClass}`}
                    >
                        <div 
                            onClick={() => onZoom({
                                title: cat.title,
                                points: cat.items.map(item => isEn ? (CHECKLIST_ITEMS_EN[item.id] || item.ar) : item.ar)
                            })}
                            className={`pb-2.5 mb-3 border-b ${s3d.dividerClass} cursor-pointer`}
                        >
                            <h3 className="font-extrabold text-base text-start" style={{ color: s3d.primaryColor, fontSize: `${15 * cardTextScale}px` }}>
                                {cat.title}
                            </h3>
                        </div>
                        <div className="space-y-2.5 overflow-visible pb-1">
                            {cat.items.map(item => {
                                const itemText = isEn ? (CHECKLIST_ITEMS_EN[item.id] || item.ar) : item.ar;
                                const isChecked = !!checkedItems[item.id];
                                return (
                                    <button 
                                        key={item.id} 
                                        type="button"
                                        onClick={() => toggleItem(item.id)}
                                        className={`app-page-card border-0 w-full flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                                        style={isChecked ? { backgroundColor: s3d.activeTintBg } : undefined}
                                    >
                                        <div 
                                            className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isChecked ? '' : (s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10')}`}
                                            style={isChecked ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                                        >
                                            {isChecked && <Check size={13} className="stroke-[3]" style={{ color: s3d.btnTextColor }} />}
                                        </div>
                                        <span className={`text-sm text-start leading-relaxed font-semibold transition-opacity flex-1 ${isChecked ? 'opacity-45 line-through' : ''}`} style={{ color: s3d.textColor, fontSize: `${13.5 * cardTextScale}px` }}>
                                            {itemText}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const CountersScreen = ({ s3d, cardTextScale, onZoom: _onZoom }: { s3d: Calculator3DStyles, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language } = useLanguage();
    const [state, setState] = useState(getTawafCounterState());

    useEffect(() => {
        return subscribeTawafCounter((updated) => {
            setState(updated);
        });
    }, []);

    const currentCount = state.activeTab === 'tawaf' ? state.tawafCount : state.saiCount;
    const isComplete = currentCount >= 7;

    const increment = () => {
        if (currentCount >= 7) return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(40); } catch {}
        }
        saveTawafCounterState(prev => {
            if (prev.activeTab === 'tawaf') {
                return { ...prev, tawafCount: Math.min(7, prev.tawafCount + 1) };
            } else {
                return { ...prev, saiCount: Math.min(7, prev.saiCount + 1) };
            }
        });
    };

    const decrement = () => {
        if (currentCount <= 0) return;
        saveTawafCounterState(prev => {
            if (prev.activeTab === 'tawaf') {
                return { ...prev, tawafCount: Math.max(0, prev.tawafCount - 1) };
            } else {
                return { ...prev, saiCount: Math.max(0, prev.saiCount - 1) };
            }
        });
    };

    const reset = () => {
        saveTawafCounterState(prev => {
            if (prev.activeTab === 'tawaf') {
                return { ...prev, tawafCount: 0 };
            } else {
                return { ...prev, saiCount: 0 };
            }
        });
    };

    const switchTab = (tab: 'tawaf' | 'sai') => {
        saveTawafCounterState({ activeTab: tab });
    };

    return (
        <section className="space-y-4">
            {/* Header info */}
            <div 
                className={`app-page-card border-0 rounded-3xl p-4.5 text-center relative ${s3d.surfaceCardClass}`}
            >
                <h3 className="font-extrabold text-base mb-1" style={{ color: s3d.primaryColor, fontSize: `${16 * cardTextScale}px` }}>
                    {tHajj('counterHeaderTitle', language)}
                </h3>
                <p className="text-xs font-medium px-6" style={{ color: s3d.subtextColor, fontSize: `${13 * cardTextScale}px` }}>
                    {tHajj('counterHeaderDesc', language)}
                </p>
            </div>

            {/* Tawaf vs Sa'i 3D Segmented Switch */}
            <div 
                className={`app-page-card border-0 flex p-2 pb-2.5 rounded-2xl gap-2 overflow-visible ${s3d.surfaceCardClass}`}
            >
                <button 
                    type="button"
                    onClick={() => switchTab('tawaf')} 
                    className={`app-page-card border-0 flex-1 py-2.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm ${
                      state.activeTab === 'tawaf'
                        ? 'font-black'
                        : `font-bold opacity-85 ${s3d.surfaceCardClass}`
                    }`}
                    style={state.activeTab === 'tawaf' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor, fontSize: `${13 * cardTextScale}px` } : { fontSize: `${13 * cardTextScale}px` }}
                >
                    {tHajj('tabTawaf', language)} ({state.tawafCount}/7)
                </button>
                <button 
                    type="button"
                    onClick={() => switchTab('sai')} 
                    className={`app-page-card border-0 flex-1 py-2.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm ${
                      state.activeTab === 'sai'
                        ? 'font-black'
                        : `font-bold opacity-85 ${s3d.surfaceCardClass}`
                    }`}
                    style={state.activeTab === 'sai' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor, fontSize: `${13 * cardTextScale}px` } : { fontSize: `${13 * cardTextScale}px` }}
                >
                    {tHajj('tabSai', language)} ({state.saiCount}/7)
                </button>
            </div>

            {/* Circular 3D Counter Box matching Tasbeeh depth */}
            <div 
                className={`app-page-card border-0 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[260px] ${s3d.surfaceCardClass}`}
            >
                {/* 7 Laps progress bar */}
                <div className="w-full max-w-xs flex items-center justify-between gap-2 mb-6 px-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((lap) => {
                        const isPassed = lap <= currentCount;
                        return (
                            <div key={lap} className="flex-1 flex flex-col items-center gap-1.5">
                                <div 
                                    className={`w-full h-2.5 rounded-full transition-all duration-300 ${isPassed ? '' : s3d.recessedInputClass}`}
                                    style={isPassed ? {
                                      backgroundColor: s3d.primaryColor,
                                    } : undefined}
                                />
                                <span className="text-[10px] font-extrabold" style={{ color: isPassed ? s3d.primaryColor : s3d.subtextColor }}>
                                    {lap}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Big 3D Circular Counter Button */}
                <div className="flex items-center justify-center gap-6 my-2 overflow-visible pb-2">
                    <button
                        type="button"
                        onClick={decrement}
                        disabled={currentCount === 0}
                        className={`app-page-card border-0 w-12 h-12 rounded-full disabled:opacity-35 transition-all flex items-center justify-center cursor-pointer ${s3d.surfaceCardClass}`}
                        title="Decrement"
                    >
                        <Minus className="w-5 h-5" style={{ color: s3d.textColor }} />
                    </button>

                    <button
                        type="button"
                        onClick={increment}
                        disabled={isComplete}
                        className="app-page-card border-0 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer"
                        style={{ 
                            backgroundColor: isComplete ? '#10b981' : s3d.primaryColor,
                            color: isComplete ? '#FFFFFF' : s3d.btnTextColor,
                        }}
                    >
                        <span className="text-4xl font-black leading-none">{currentCount}</span>
                        <span className="text-xs font-extrabold mt-1.5 opacity-90">/ 7</span>
                    </button>

                    <button
                        type="button"
                        onClick={reset}
                        className={`app-page-card border-0 w-12 h-12 rounded-full transition-all flex items-center justify-center cursor-pointer ${s3d.surfaceCardClass}`}
                        title="Reset"
                    >
                        <RotateCcw className="w-5 h-5" style={{ color: s3d.textColor }} />
                    </button>
                </div>

                {isComplete && (
                    <div className="border-0 mt-5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        {language === 'en' ? 'Completed 7 circuits successfully!' : 'تم إتمام ٧ أشواط بحمد الله!'}
                    </div>
                )}
            </div>
        </section>
    );
};

const HomeScreen = ({ setScreen, s3d, cardTextScale, onZoom }: { setScreen: any, s3d: Calculator3DStyles, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';

    const additions = isEn ? HOME_ADDITIONS_EN : homeScreenAdditions;

    return (
     <section id="home-screen" className="space-y-4">
        {/* Navigation Category Cards - 3D Sculpted Tasbeeh Surface */}
        <div className="grid grid-cols-2 gap-3.5">
            {[
                { id: 'umrah', label: tHajj('cardUmrah', language) },
                { id: 'hajj', label: tHajj('cardHajj', language) },
                { id: 'counters', label: tHajj('cardCounters', language) },
                { id: 'duaa', label: tHajj('cardDuaa', language) }
            ].map(item => (
                <button 
                    key={item.id}
                    type="button"
                    onClick={() => setScreen(item.id)} 
                    className={`app-page-card border-0 relative flex flex-col items-center justify-center p-5 rounded-3xl transition-all cursor-pointer min-h-[92px] ${s3d.surfaceCardClass}`}
                >
                    <h2 className="relative z-10 font-extrabold text-center leading-snug" style={{ color: s3d.textColor, fontSize: `${15.5 * cardTextScale}px` }}>
                        {item.label}
                    </h2>
                </button>
            ))}
            
            <button 
                type="button"
                onClick={() => setScreen('checklist')} 
                className={`app-page-card border-0 relative flex flex-col items-center justify-center p-4.5 rounded-3xl transition-all col-span-2 cursor-pointer ${s3d.surfaceCardClass}`}
            >
                <h2 className="relative z-10 font-extrabold text-center" style={{ color: s3d.textColor, fontSize: `${15.5 * cardTextScale}px` }}>
                    {tHajj('cardChecklist', language)}
                </h2>
            </button>
        </div>

        {/* Content Cards - 3D Sculpted Tasbeeh Surface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
            {additions.map((item, index) => (
                 <div 
                    key={index} 
                    onClick={() => onZoom({
                        title: item.title,
                        points: item.content,
                        text: item.type === 'hadith' ? item.content[0] : undefined
                    })}
                    className={`app-page-card tasbeeh-pressable border-0 rounded-3xl p-5 text-start relative cursor-pointer transition-all ${s3d.surfaceCardClass}`}
                 >
                    <div className="mb-2.5">
                        <h3 className="font-extrabold text-base leading-snug" style={{ color: s3d.primaryColor, fontSize: `${15 * cardTextScale}px` }}>
                            <span>{item.title}</span>
                        </h3>
                    </div>

                    {item.type === 'hadith' ? (
                        <p className={`border-0 text-xs leading-[2.1] font-medium p-3.5 rounded-2xl ${s3d.recessedInputClass}`} style={{ color: s3d.textColor, fontSize: `${13 * cardTextScale}px` }}>
                            {item.content[0]}
                        </p>
                    ) : (
                        <ul className="space-y-1.5 mt-2">
                            {item.content.map((point, pi) => (
                                <li key={pi} className="flex gap-2 items-start text-xs font-medium" style={{ color: s3d.textColor, fontSize: `${12.5 * cardTextScale}px` }}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: s3d.primaryColor }}></div>
                                    <span className="flex-1 leading-relaxed opacity-90">{point}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                 </div>
            ))}

            {/* Warning Card */}
            <div 
                onClick={() => onZoom({
                    title: isEn ? 'Important Warning' : 'تنبيه هام',
                    text: isEn 
                        ? 'Omitting a pillar invalidates the ritual, whereas omitting an obligation requires a sacrificial penalty (dam), and committing prohibitions incurs an expiation (fidyah).' 
                        : 'ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية.'
                })}
                className={`app-page-card tasbeeh-pressable border-0 col-span-1 md:col-span-2 rounded-3xl p-5 text-start relative cursor-pointer transition-all ${s3d.surfaceCardClass}`}
            >
                <div className="mb-1.5">
                    <h3 className="font-extrabold text-orange-600 dark:text-orange-400 text-base" style={{ fontSize: `${15 * cardTextScale}px` }}>
                        <span>{isEn ? 'Important Warning' : 'تنبيه هام'}</span>
                    </h3>
                </div>
                <p className="leading-[2.1] text-xs font-medium text-orange-950 dark:text-orange-200" style={{ fontSize: `${12.5 * cardTextScale}px` }}>
                    {isEn 
                        ? 'Omitting a pillar invalidates the ritual, whereas omitting an obligation requires a sacrificial penalty (dam), and committing prohibitions incurs an expiation (fidyah).' 
                        : 'ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية.'}
                </p>
            </div>
        </div>
    </section>
    );
};

const UmrahScreen = ({ s3d, onSelectDetail, cardTextScale, onZoom }: { s3d: Calculator3DStyles, onSelectDetail: (data: CardZoomData) => void, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';

    const virtuesList = isEn ? umrahVirtuesEn : umrahVirtues;
    const generalInfo = isEn ? umrahGeneralInfoEn : umrahGeneralInfo;
    const stepsList = isEn ? umrahStepsEn : umrahSteps;
    const umrahCategory = tHajj('screenUmrahTitle', language);

    const openStepZoom = (step: any) => {
        onZoom({
            category: umrahCategory,
            title: step.title,
            subtitle: step.subtitle,
            quranAyah: step.quranAyah,
            hadith: step.hadith,
            points: step.points,
            sunan: step.sunan,
            mistakes: step.mistakes
        });
    };

    return (
     <section id="umrah-screen" className="space-y-4">
        {/* Intro Banner */}
        <div 
            className={`app-page-card border-0 rounded-3xl p-5 text-center ${s3d.surfaceCardClass}`}
        >
            <p className="font-amiri text-base font-bold text-amber-800 dark:text-amber-300 px-4" style={{ fontSize: `${16 * cardTextScale}px` }}>
                {tHajj('umrahIntroVerse', language)}
            </p>
        </div>

        {/* Summary Cards: Virtues + 2 Condensed Single-Row Cards */}
        <div className="space-y-3">
            {/* Card: Virtues (opens bottom-sheet zoom modal) */}
            <button
                id="hajj-umrah-virtues-card"
                type="button"
                onClick={() => onZoom({
                    category: umrahCategory,
                    title: tHajj('umrahVirtuesTitle', language),
                    subtitle: tHajj('umrahVirtuesSubtitle', language),
                    virtues: virtuesList
                })}
                className={`app-page-card border-0 w-full text-start rounded-3xl p-4.5 flex items-center justify-between gap-3.5 transition-all group cursor-pointer ${s3d.surfaceCardClass}`}
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm md:text-base leading-snug" style={{ color: s3d.textColor, fontSize: `${15 * cardTextScale}px` }}>
                        {tHajj('umrahVirtuesTitle', language)}
                    </h3>
                    <p className="text-xs font-medium mt-0.5 truncate" style={{ color: s3d.subtextColor, fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('umrahVirtuesSubtitle', language)}
                    </p>
                </div>
            </button>

            {/* Card 1: Pillars & Obligations (single row) */}
            <button 
                type="button"
                onClick={() => onSelectDetail({
                    category: umrahCategory,
                    title: '',
                    sections: [
                        {
                            tabLabel: isEn ? 'Pillars' : 'الأركان',
                            title: isEn ? 'Pillars of Umrah' : 'أركان العمرة',
                            subtitle: isEn ? 'Umrah is invalid without them and cannot be compensated by animal sacrifice' : 'لا تصح العمرة إلا بها ولا تُجبر بدم بإجماع العلماء',
                            quranAyah: isEn ? '﴿ And complete the Hajj and \'Umrah for Allah ﴾ [Al-Baqarah: 196]' : '﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾ [البقرة: 196]، وقوله تعالى: ﴿ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ ﴾ [الحج: 29]',
                            hadith: isEn ? 'The Prophet ﷺ said: «Actions are judged by intentions», and: «Perform Sa\'i, for Allah has prescribed Sa\'i upon you»' : 'قال رسول الله ﷺ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» وقال: «اسْعَوْا فَإِنَّ اللهَ كَتَبَ عَلَيْكُمُ السَّعْيَ»',
                            points: generalInfo.arkan
                        },
                        {
                            tabLabel: isEn ? 'Obligations' : 'الواجبات',
                            title: isEn ? 'Obligations of Umrah (Wajibat)' : 'واجبات العمرة',
                            subtitle: isEn ? 'Omitting an obligation requires a sacrificial penalty (dam) and Umrah remains valid' : 'من ترك واجباً لزمه دم (شاة) وعمرته صحيحة',
                            hadith: isEn ? 'The Prophet ﷺ said: «These boundaries are for their people and whoever passes them...» and: «O Allah, have mercy on those who shave their heads»' : 'قال رسول الله ﷺ: «هُنَّ لَهُنَّ، وَلِمَنْ أَتَى عَلَيْهِنَّ...» وقال: «اللَّهُمَّ ارْحَمِ المُحَلِّقِينَ»',
                            points: generalInfo.wajibat
                        }
                    ]
                })}
                className={`app-page-card border-0 w-full text-start rounded-3xl p-4.5 flex items-center justify-between gap-3.5 transition-all group cursor-pointer ${s3d.surfaceCardClass}`}
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm md:text-base leading-snug truncate" style={{ color: s3d.textColor, fontSize: `${15 * cardTextScale}px` }}>
                        {isEn ? `${tHajj('pillarsLabel', language)} & ${tHajj('obligationsLabel', language)}` : `${tHajj('pillarsLabel', language)} والواجبات`}
                    </h3>
                    <p className="text-xs font-medium mt-0.5 truncate" style={{ color: s3d.subtextColor, fontSize: `${12 * cardTextScale}px` }}>
                        {isEn ? 'Ihram, Tawaf, Sa\'i • Miqat, Shaving or Trimming' : 'الإحرام، الطواف، السعي • الميقات، الحلق أو التقصير'}
                    </p>
                </div>
            </button>

            {/* Card 2: Sunnahs & Prohibitions (single row) */}
            <button 
                type="button"
                onClick={() => onSelectDetail({
                    category: umrahCategory,
                    title: '',
                    sections: [
                        {
                            tabLabel: isEn ? 'Sunnahs & Etiquette' : 'السنن والآداب',
                            title: isEn ? 'Prophetic Sunnahs of Umrah' : 'سنن وآداب العمرة النبوية',
                            subtitle: isEn ? 'Recommended acts that multiply rewards in following the Prophet ﷺ' : 'أعمال مستحبة تزيد في الأجر والاقتداء بالنبي ﷺ',
                            hadith: isEn ? 'The Messenger of Allah ﷺ frequently chanted the Talbiyah, uncovered his right shoulder, and quickened his pace in the first three circuits of Tawaf.' : 'كان رسول الله ﷺ يكثر من التلبية ويضطبع ويرمل في الثلاثة أشواط الأولى في طواف العمرة',
                            points: generalInfo.sunan
                        },
                        {
                            tabLabel: isEn ? 'Prohibitions' : 'المحظورات',
                            title: isEn ? 'Prohibitions & Nullifiers of Umrah' : 'مفسدات ومحظورات العمرة',
                            subtitle: isEn ? 'Acts that invalidate Umrah or incur an expiation' : 'أعمال تبطل العمرة أو توجب الفدية',
                            quranAyah: isEn ? '﴿ So whoever has made Hajj obligatory upon himself therein, there is [to be for him] no sexual relations and no disobedience and no disputing during Hajj ﴾ [Al-Baqarah: 197]' : '﴿ فَمَن فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ ﴾ [البقرة: 197]',
                            points: generalInfo.mufsidat
                        }
                    ]
                })}
                className={`app-page-card border-0 w-full text-start rounded-3xl p-4.5 flex items-center justify-between gap-3.5 transition-all group cursor-pointer ${s3d.surfaceCardClass}`}
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm md:text-base leading-snug truncate" style={{ color: s3d.textColor, fontSize: `${15 * cardTextScale}px` }}>
                        {isEn ? `${tHajj('sunnahsLabel', language)} & ${tHajj('prohibitionsLabel', language)}` : `${tHajj('sunnahsLabel', language)} والمفسدات`}
                    </h3>
                    <p className="text-xs font-medium mt-0.5 truncate" style={{ color: s3d.subtextColor, fontSize: `${12 * cardTextScale}px` }}>
                        {isEn ? 'Ghusl, Talbiyah, Idtiba\' • Intercourse, omitting pillars, violations' : 'الغسل، الطيب، التلبية، الرمل • الجماع، ترك ركن، المحظورات'}
                    </p>
                </div>
            </button>
        </div>

        {/* 9 Steps */}
        <div className="space-y-3">
            <h3 className="text-base font-extrabold text-start px-1" style={{ color: s3d.textColor, fontSize: `${16 * cardTextScale}px` }}>
                <span>{tHajj('umrahStepsSectionTitle', language)}</span>
            </h3>
            {stepsList.map((step) => (
                <div 
                    key={step.title}
                    onClick={() => openStepZoom(step)}
                    className={`app-page-card tasbeeh-pressable border-0 w-full text-start rounded-3xl p-4.5 flex items-center justify-between gap-3.5 transition-all group cursor-pointer ${s3d.surfaceCardClass}`}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm md:text-base leading-snug" style={{ color: s3d.textColor, fontSize: `${15 * cardTextScale}px` }}>
                                {step.title}
                            </h4>
                        </div>
                        {step.subtitle && (
                            <p className="text-xs font-medium mt-0.5 truncate" style={{ color: s3d.subtextColor, fontSize: `${12 * cardTextScale}px` }}>
                                {step.subtitle}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </section>
    );
};

const HajjScreen = ({ hajjType, setHajjType, onSelectDetail, cardTextScale, onZoom: _onZoom, s3d }: { hajjType: any, setHajjType: any, onSelectDetail: (data: CardZoomData) => void, cardTextScale: number, onZoom: (data: CardZoomData) => void, s3d: Calculator3DStyles }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';

    const rawTypes = isEn ? hajjTypesEn : hajjTypes;
    const typesList = Object.entries(rawTypes).map(([id, val]) => ({ id, ...(val as any) }));
    const tamattuPlan = isEn ? hajjTamattuPlanEn : hajjTamattuPlan;
    const ifradPlan = isEn ? hajjIfradPlanEn : hajjIfradPlan;
    const qiranPlan = isEn ? hajjQiranPlanEn : hajjQiranPlan;
    const hajjCategory = tHajj('screenHajjTitle', language);

    const currentType = typesList.find((t: any) => t.id === hajjType) || typesList[0];

    const openTimelineDayZoom = (day: any) => {
        onSelectDetail({
            category: hajjCategory,
            title: day.day,
            subtitle: day.summary,
            evidence: day.evidence,
            points: day.actions
        });
    };

    return (
    <section id="hajj-screen" className="space-y-4">
        {/* Intro */}
        <div 
            className={`app-page-card border-0 rounded-3xl p-5 text-center ${s3d.surfaceCardClass}`}
        >
            <p className="font-amiri text-base font-bold text-amber-800 dark:text-amber-300 px-4" style={{ fontSize: `${16 * cardTextScale}px` }}>
                {tHajj('hajjIntroVerse', language)}
            </p>
        </div>

        {/* 3 Types Segmented Selection */}
        <div className="space-y-3">
            <div 
                className={`app-page-card border-0 grid grid-cols-3 gap-2 p-2 pb-2.5 rounded-2xl overflow-visible ${s3d.surfaceCardClass}`}
            >
                {typesList.map((t: any) => {
                    const isSelected = hajjType === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setHajjType(t.id)}
                            className={`app-page-card border-0 py-3 px-2 rounded-xl text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'font-black'
                                : `font-bold opacity-85 ${s3d.surfaceCardClass}`
                            }`}
                            style={isSelected ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                        >
                            <span className="block text-xs sm:text-sm">{t.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Selected type card */}
            {currentType && (
                <div className="space-y-3">
                    {/* Section 1: Badge & Centered Definition */}
                    <div 
                        className={`app-page-card border-0 rounded-3xl p-5 text-center relative ${s3d.surfaceCardClass}`}
                    >
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            <span className="border-0 px-3.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                {currentType.badge}
                            </span>
                        </div>
                        <p className="text-xs font-medium mt-3 leading-relaxed text-center" style={{ color: s3d.textColor, fontSize: `${12.5 * cardTextScale}px` }}>
                            {currentType.definition}
                        </p>
                    </div>

                    {/* 2 Stacked Title-Only Cards matching Dhul Hijjah day cards */}
                    {[
                        {
                            key: 'quran',
                            title: tHajj('quranEvidenceTitle', language),
                            payload: {
                                category: currentType.name,
                                title: tHajj('quranEvidenceTitle', language),
                                subtitle: currentType.badge,
                                quranEvidence: currentType.quranEvidence
                            }
                        },
                        {
                            key: 'sunnah',
                            title: tHajj('sunnahEvidenceTitle', language),
                            payload: {
                                category: currentType.name,
                                title: tHajj('sunnahEvidenceTitle', language),
                                subtitle: currentType.badge,
                                sunnahEvidence: currentType.sunnahEvidence
                            }
                        }
                    ].map((card) => (
                        <div
                            key={card.key}
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelectDetail(card.payload)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelectDetail(card.payload);
                                }
                            }}
                            className={`app-page-card tasbeeh-pressable border-0 w-full text-start rounded-3xl p-4.5 flex items-center justify-between gap-3.5 transition-all group cursor-pointer ${s3d.surfaceCardClass}`}
                        >
                            <div className="flex-1 min-w-0">
                                <h5 className="font-extrabold text-sm md:text-base" style={{ color: s3d.textColor, fontSize: `${15 * cardTextScale}px` }}>
                                    {card.title}
                                </h5>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Timeline */}
        <div className="pt-2">
            <h3 className="text-base font-extrabold mb-3 text-center" style={{ color: s3d.textColor, fontSize: `${16 * cardTextScale}px` }}>
                <span>{tHajj('hajjTimelineSectionTitle', language)}</span>
            </h3>
            <div className="space-y-3">
                {(hajjType === 'tamattu' ? tamattuPlan : hajjType === 'ifrad' ? ifradPlan : qiranPlan).map((day: any, i: number) => (
                    <div 
                        key={i} 
                        onClick={() => openTimelineDayZoom(day)}
                        className={`app-page-card tasbeeh-pressable border-0 w-full text-start rounded-3xl p-4.5 flex items-center justify-between gap-3.5 transition-all group cursor-pointer ${s3d.surfaceCardClass}`}
                    >
                        <div className="flex-1 min-w-0">
                            <h5 className="font-extrabold text-sm md:text-base" style={{ color: s3d.textColor, fontSize: `${15 * cardTextScale}px` }}>{day.day}</h5>
                            <p className="text-xs font-medium mt-0.5 truncate" style={{ color: s3d.subtextColor, fontSize: `${12 * cardTextScale}px` }}>{day.summary}</p>
                            {day.evidence && (
                                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-1 truncate" style={{ fontSize: `${11 * cardTextScale}px` }}>
                                    {day.evidence}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

const DuaaScreen = ({ openDuaaId, onToggle, onZoom, cardTextScale, s3d }: { openDuaaId: any, onToggle: any, onZoom: any, cardTextScale: number, s3d: Calculator3DStyles }) => {
    const { language } = useLanguage();
    return (
        <section id="duaa-screen" className="space-y-4">
             <div 
                className={`app-page-card border-0 rounded-3xl p-4.5 text-center mb-3 ${s3d.surfaceCardClass}`}
             >
                <p className="text-xs sm:text-sm font-extrabold px-4" style={{ color: s3d.primaryColor, fontSize: `${13 * cardTextScale}px` }}>
                    {tHajj('duaaScreenHeader', language)}
                </p>
            </div>

            <div className="space-y-3">
                {allDuaas.map(section => (
                    <DuaaSection 
                        key={section.id}
                        id={section.id}
                        title={section.title} 
                        items={section.items} 
                        isOpen={openDuaaId === section.id}
                        onToggle={() => onToggle(section.id)}
                        onZoom={onZoom}
                        cardTextScale={cardTextScale}
                        s3d={s3d}
                    />
                ))}
            </div>
        </section>
    );
};

const HajjUmrah: FC<{ onBack: () => void, onNavigate: (page: string) => void, navParams?: any }> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const dir = isRTL ? 'rtl' : 'ltr';

    const [screen, setScreen] = useState<'home' | 'umrah' | 'hajj' | 'duaa' | 'checklist' | 'counters'>(() => {
        const target = navParams?.screen || navParams?.tab || navParams?.initialScreen;
        if (target && ['home', 'umrah', 'hajj', 'duaa', 'checklist', 'counters'].includes(target)) {
            return target;
        }
        return 'home';
    });
    const [hajjType, setHajjType] = useState<'tamattu' | 'ifrad' | 'qiran'>('tamattu');
    const [openDuaaId, setOpenDuaaId] = useState<number | null>(1);
    const [tawafState, setTawafState] = useState(getTawafCounterState());

    useEffect(() => {
        const target = navParams?.screen || navParams?.tab || navParams?.initialScreen;
        if (target && ['home', 'umrah', 'hajj', 'duaa', 'checklist', 'counters'].includes(target)) {
            setScreen(target);
        } else if (navParams?.id || navParams?.highlightId) {
            setScreen('umrah');
        }
        if (navParams?.id || navParams?.highlightId) {
            const targetId = navParams.id || navParams.highlightId;
            setTimeout(() => {
                const el = document.getElementById(`hajj-umrah-item-${targetId}`) || document.getElementById(`hajj-umrah-step-${targetId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2');
                    setTimeout(() => {
                        el.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2');
                    }, 2500);
                }
            }, 150);
        }
    }, [navParams]);

    useEffect(() => {
        return subscribeTawafCounter((updated) => {
            setTawafState(updated);
        });
    }, []);

    const toggleTawafHomeVisibility = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(30); } catch {}
        }
        saveTawafCounterState(prev => ({
            ...prev,
            showOnHome: !prev.showOnHome
        }));
    };
    
    const [zoomedCard, setZoomedCard] = useState<CardZoomData | null>(null);
    const [currentDuaaIdx, setCurrentDuaaIdx] = useState<number>(0);
    const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
    const zoomScrollRef = React.useRef<HTMLDivElement | null>(null);
    const [zoomFontSize, setZoomFontSize] = useState<number>(24);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('hajj_umrah');
        if (!getGuideSeen('hajj_umrah_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);

    const [cardTextScale, setCardTextScale] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('hajjUmrahCardTextScale');
            return saved ? parseFloat(saved) : 1;
        } catch {
            return 1;
        }
    });

    const toggleCardTextScale = () => {
        setCardTextScale(prev => {
            const next = prev >= 1.45 ? 1 : Number((prev + 0.15).toFixed(2));
            try {
                localStorage.setItem('hajjUmrahCardTextScale', String(next));
            } catch {}
            return next;
        });
    };

    const handleDuaaToggle = (id: number) => {
        setOpenDuaaId(prevId => prevId === id ? null : id);
    };

    const openZoomModal = (data: CardZoomData) => {
        setZoomedCard(data);
        setCurrentDuaaIdx(data.duaaIndex ?? 0);
        setActiveSectionIdx(0);
        const hasLongList = Boolean(
            !data.duaaItems?.length &&
            (data.points?.length || data.actions?.length || data.detailedSteps?.length || data.quranEvidence?.length || data.virtues?.length || data.sections?.length)
        );
        setZoomFontSize(hasLongList ? 20 : 26);
        setCopySuccess(false);
    };

    const closeZoomModal = () => {
        setZoomedCard(null);
        setCopySuccess(false);
    };

    const handleNextDuaa = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (zoomedCard?.duaaItems && currentDuaaIdx < zoomedCard.duaaItems.length - 1) {
            const nextIdx = currentDuaaIdx + 1;
            setCurrentDuaaIdx(nextIdx);
            zoomedCard.onIndexChange?.(nextIdx);
        }
    };

    const handlePrevDuaa = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (zoomedCard?.duaaItems && currentDuaaIdx > 0) {
            const prevIdx = currentDuaaIdx - 1;
            setCurrentDuaaIdx(prevIdx);
            zoomedCard.onIndexChange?.(prevIdx);
        }
    };

    const handleCopyZoomText = () => {
        if (!zoomedCard) return;
        if (zoomedCard.duaaItems && zoomedCard.duaaItems.length > 0) {
            const currentItem = zoomedCard.duaaItems[currentDuaaIdx];
            const textToCopy = isEn ? getDuaaEnglish(currentItem) : currentItem;
            navigator.clipboard.writeText(textToCopy);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            return;
        }

        const parts: string[] = [];
        if (zoomedCard.title) parts.push(zoomedCard.title);
        if (zoomedCard.subtitle) parts.push(zoomedCard.subtitle);
        if (zoomedCard.quranAyah) parts.push(zoomedCard.quranAyah);
        if (zoomedCard.evidence) parts.push(zoomedCard.evidence);
        if (zoomedCard.quranEvidence) parts.push(...zoomedCard.quranEvidence);
        if (zoomedCard.hadith) parts.push(zoomedCard.hadith);
        if (zoomedCard.sunnahEvidence) parts.push(...zoomedCard.sunnahEvidence);
        if (zoomedCard.text) parts.push(zoomedCard.text.replace(/<[^>]*>/g, ''));
        if (zoomedCard.definition) parts.push(zoomedCard.definition);
        if (zoomedCard.description) parts.push(zoomedCard.description);
        if (zoomedCard.hadyRuling) parts.push(zoomedCard.hadyRuling);
        if (zoomedCard.whoIsItFor) parts.push(zoomedCard.whoIsItFor);
        if (zoomedCard.points) parts.push(...zoomedCard.points.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
        if (zoomedCard.actions) parts.push(...zoomedCard.actions.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
        if (zoomedCard.detailedSteps) parts.push(...zoomedCard.detailedSteps.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
        if (zoomedCard.virtues) {
            zoomedCard.virtues.forEach(v => {
                parts.push(`${v.title} (${v.source})\n${v.text}\n${v.explanation}`);
            });
        }
        if (zoomedCard.sections && zoomedCard.sections.length > 0) {
            const activeSec = zoomedCard.sections[activeSectionIdx] || zoomedCard.sections[0];
            if (activeSec) {
                parts.push(activeSec.title);
                if (activeSec.subtitle) parts.push(activeSec.subtitle);
                if (activeSec.quranAyah) parts.push(activeSec.quranAyah);
                if (activeSec.hadith) parts.push(activeSec.hadith);
                if (activeSec.points) parts.push(...activeSec.points.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
            }
        }
        if (zoomedCard.sunan) parts.push(...zoomedCard.sunan.map(s => `• ${s}`));
        if (zoomedCard.mistakes) parts.push(...zoomedCard.mistakes.map(m => `• ${m}`));

        const fullText = parts.join('\n\n');
        navigator.clipboard.writeText(fullText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleShareZoomText = async () => {
        if (!zoomedCard) return;
        let textToShare = '';
        if (zoomedCard.duaaItems && zoomedCard.duaaItems.length > 0) {
            const currentItem = zoomedCard.duaaItems[currentDuaaIdx];
            textToShare = isEn ? getDuaaEnglish(currentItem) : currentItem;
        } else {
            const parts: string[] = [];
            if (zoomedCard.quranAyah) parts.push(zoomedCard.quranAyah);
            if (zoomedCard.evidence) parts.push(zoomedCard.evidence);
            if (zoomedCard.quranEvidence) parts.push(...zoomedCard.quranEvidence);
            if (zoomedCard.hadith) parts.push(zoomedCard.hadith);
            if (zoomedCard.sunnahEvidence) parts.push(...zoomedCard.sunnahEvidence);
            if (zoomedCard.text) parts.push(zoomedCard.text.replace(/<[^>]*>/g, ''));
            if (zoomedCard.definition) parts.push(zoomedCard.definition);
            if (zoomedCard.description) parts.push(zoomedCard.description);
            if (zoomedCard.hadyRuling) parts.push(zoomedCard.hadyRuling);
            if (zoomedCard.whoIsItFor) parts.push(zoomedCard.whoIsItFor);
            if (zoomedCard.points) parts.push(...zoomedCard.points.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
            if (zoomedCard.actions) parts.push(...zoomedCard.actions.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
            if (zoomedCard.detailedSteps) parts.push(...zoomedCard.detailedSteps.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
            if (zoomedCard.virtues) {
                zoomedCard.virtues.forEach(v => {
                    parts.push(`${v.title} (${v.source})\n${v.text}\n${v.explanation}`);
                });
            }
            if (zoomedCard.sections && zoomedCard.sections.length > 0) {
                const activeSec = zoomedCard.sections[activeSectionIdx] || zoomedCard.sections[0];
                if (activeSec) {
                    parts.push(activeSec.title);
                    if (activeSec.subtitle) parts.push(activeSec.subtitle);
                    if (activeSec.quranAyah) parts.push(activeSec.quranAyah);
                    if (activeSec.hadith) parts.push(activeSec.hadith);
                    if (activeSec.points) parts.push(...activeSec.points.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
                }
            }
            textToShare = parts.join('\n\n');
        }
        await shareAsImage({
            title: zoomedCard.title || zoomedCard.sections?.[activeSectionIdx]?.title || '',
            text: textToShare,
            category: zoomedCard.category || (isEn ? "Hajj & Umrah Guide" : "دليل الحج والعمرة"),
            theme,
            isEn,
            language: isEn ? 'en' : 'ar'
        });
    };

    const handleToggleZoomFontSize = () => {
        setZoomFontSize(prev => (prev >= 34 ? 18 : prev + 4));
    };

    useEffect(() => {
        const interceptor = () => {
            if (zoomedCard) {
                closeZoomModal();
                return true;
            }
            if (screen !== 'home') {
                setScreen('home');
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [screen, zoomedCard]);

    const handleBack = () => {
        if (zoomedCard) {
            closeZoomModal();
        } else if (screen !== 'home') {
            setScreen('home');
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (zoomedCard) closeZoomModal();
        if (screen !== 'home') setScreen('home');
        onNavigate('home');
    };

    const getScreenTitle = () => {
        switch (screen) {
            case 'umrah': return tHajj('screenUmrahTitle', language);
            case 'hajj': return tHajj('screenHajjTitle', language);
            case 'duaa': return tHajj('screenDuaaTitle', language);
            case 'checklist': return tHajj('screenChecklistTitle', language);
            case 'counters': return tHajj('screenCountersTitle', language);
            default: return tHajj('appTitle', language);
        }
    };

    const renderScreen = () => {
        switch (screen) {
            case 'umrah': 
                return <UmrahScreen key="umrah" s3d={s3d} onSelectDetail={openZoomModal} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'hajj': 
                return <HajjScreen key="hajj" hajjType={hajjType} setHajjType={setHajjType} s3d={s3d} onSelectDetail={openZoomModal} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'duaa': 
                return <DuaaScreen key="duaa" s3d={s3d} openDuaaId={openDuaaId} onToggle={handleDuaaToggle} onZoom={openZoomModal} cardTextScale={cardTextScale} />;
            case 'checklist': 
                return <ChecklistScreen key="checklist" s3d={s3d} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'counters': 
                return <CountersScreen key="counters" s3d={s3d} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            default: 
                return <HomeScreen key="home" setScreen={setScreen} s3d={s3d} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
        }
    };

    return (
        <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ backgroundColor: s3d.pageBgColor, color: s3d.textColor, fontFamily: theme.font }} dir={dir}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} flex items-center gap-0.5 sm:gap-1 z-10`}>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer shrink-0"
                                title={tHajj('back', language)}
                                aria-label={tHajj('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-lg`}></i>
                            </button>

                            <button
                                type="button"
                                onClick={toggleCardTextScale}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer relative shrink-0"
                                title={isEn ? `Enlarge card text (${Math.round(cardTextScale * 100)}%)` : `تكبير نص البطاقات (${Math.round(cardTextScale * 100)}%)`}
                                aria-label={isEn ? 'Enlarge card text' : 'تكبير نص البطاقات'}
                            >
                                <ZoomIn className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                                {cardTextScale > 1 && (
                                    <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 py-0.2 rounded-full bg-emerald-600 text-white leading-tight shadow">
                                        +{Math.round((cardTextScale - 1) * 100)}%
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Screen Title */}
                        <div className={`text-center ${screen === 'counters' ? 'px-28 sm:px-32' : 'px-20'} min-w-0 max-w-full`}>
                            <h1 className="app-top-bar__title text-base sm:text-xl font-bold truncate">
                                {getScreenTitle()}
                            </h1>
                        </div>

                        {/* Right Tools: Guide & Home Button */}
                        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} flex items-center gap-0.5 sm:gap-1 z-10`}>
                            {screen === 'home' && !zoomedCard && (
                                <button
                                    type="button"
                                    onClick={() => setShowGuide(true)}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer shrink-0"
                                    style={{ color: 'var(--top-bar-text, inherit)' }}
                                    title={isEn ? "Hajj & Umrah Guide" : "دليل الحج والعمرة"}
                                    aria-label={isEn ? "Hajj & Umrah Guide" : "دليل الحج والعمرة"}
                                >
                                    <i className="fa-solid fa-circle-question text-base sm:text-lg"></i>
                                </button>
                            )}

                            {screen === 'home' && <ThemePageLock />}
                            <button
                                type="button"
                                onClick={handleGoHome}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer shrink-0"
                                title={tHajj('home', language)}
                                aria-label={tHajj('home', language)}
                            >
                                <i className="fa-solid fa-house text-base sm:text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto px-4 pt-3 flex-1 min-h-0 overflow-y-auto app-scroll-safe hide-scrollbar">
                {renderScreen()}
            </main>

            {/* Magnifier / Zoom Modal - Unified 3D Sculpted Bottom Sheet Style */}
            <AnimatePresence>
                {zoomedCard && (
                    <div 
                        className="fixed inset-0 bg-black/60 z-[120] flex flex-col justify-end backdrop-blur-xs select-none" 
                        onClick={closeZoomModal}
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <motion.div 
                            initial={{ y: '100%', opacity: 0.6 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className={`app-page-card border-0 w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[88dvh] overflow-hidden relative ${s3d.surfaceCardClass}`} 
                            style={{ fontFamily: isEn ? 'sans-serif' : theme.font }} 
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Top Drag Handle & Category Badge */}
                            <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600 mb-2.5" />
                                <div className="w-full flex items-center justify-center">
                                    <span 
                                        className="border-0 px-3.5 py-1 rounded-full text-xs font-extrabold text-center"
                                        style={{
                                            backgroundColor: hexToRgba(s3d.primaryColor, s3d.isBlackTheme ? 0.2 : 0.1),
                                            color: s3d.isBlackTheme ? '#FFFFFF' : s3d.primaryColor
                                        }}
                                    >
                                        {zoomedCard.category || zoomedCard.subtitle || (isEn ? "Hajj & Umrah Guide" : "دليل الحج والعمرة")}
                                    </span>
                                </div>
                                {/* Segmented Tabs for 2-Tab Lists (Pillars/Obligations & Sunnahs/Prohibitions) */}
                                {zoomedCard.sections && zoomedCard.sections.length > 1 && (
                                    <div
                                        className={`border-0 w-full flex p-2 pb-2.5 rounded-2xl gap-2 mt-3 overflow-visible ${s3d.recessedInputClass}`}
                                    >
                                        {zoomedCard.sections.map((sec, idx) => {
                                            const isActive = activeSectionIdx === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveSectionIdx(idx);
                                                        if (zoomScrollRef.current) zoomScrollRef.current.scrollTop = 0;
                                                    }}
                                                    className={`app-page-card border-0 flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-xs sm:text-sm ${
                                                      isActive
                                                        ? 'font-black'
                                                        : `font-bold opacity-85 ${s3d.surfaceCardClass}`
                                                    }`}
                                                    style={isActive ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                                                >
                                                    {sec.tabLabel}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Content Area */}
                            <div ref={zoomScrollRef} className="overflow-y-auto flex-1 min-h-0 px-6 py-3 space-y-4 hide-scrollbar">
                                {zoomedCard.title && !(zoomedCard.sections && zoomedCard.sections.length > 0) && (
                                    <div className="text-center space-y-1">
                                        <h3 className="text-base sm:text-lg font-extrabold" style={{ color: s3d.primaryColor }}>
                                            {zoomedCard.title}
                                        </h3>
                                        {zoomedCard.subtitle && zoomedCard.category && (
                                            <p className="text-xs sm:text-sm font-medium" style={{ color: s3d.subtextColor }}>
                                                {zoomedCard.subtitle}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Special Duaa / Dhikr Mode with Next/Prev */}
                                {zoomedCard.duaaItems && zoomedCard.duaaItems.length > 0 ? (
                                    <div className="space-y-4">
                                        {isEn ? (
                                            <div 
                                                className="leading-relaxed font-sans font-medium text-center my-4 select-none text-balance"
                                                style={{ fontSize: `${zoomFontSize}px`, color: s3d.textColor }}
                                                dir="ltr"
                                            >
                                                {getDuaaEnglish(zoomedCard.duaaItems[currentDuaaIdx])}
                                            </div>
                                        ) : (
                                            <div 
                                                className="leading-[2.4] font-amiri text-center select-none py-2"
                                                style={{ fontSize: `${zoomFontSize + 4}px`, color: s3d.textColor }}
                                                dir="rtl"
                                            >
                                                {zoomedCard.duaaItems[currentDuaaIdx]}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Quranic Verse Callout */}
                                        {(zoomedCard.quranAyah || zoomedCard.evidence || (zoomedCard.quranEvidence && zoomedCard.quranEvidence.length > 0)) && (
                                            <div className="py-2 space-y-2 text-center">
                                                {zoomedCard.title !== tHajj('quranEvidenceTitle', language) && (
                                                    <div className="font-extrabold text-xs" style={{ color: s3d.primaryColor }}>
                                                        <span>{tHajj('quranEvidenceSection', language)}</span>
                                                    </div>
                                                )}
                                                {zoomedCard.quranAyah && (
                                                    <p className={`leading-[2.2] ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ color: s3d.textColor, fontSize: `${zoomFontSize}px` }}>
                                                        {zoomedCard.quranAyah}
                                                    </p>
                                                )}
                                                {zoomedCard.evidence && !zoomedCard.quranAyah && (
                                                    <p className={`leading-[2.2] ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ color: s3d.textColor, fontSize: `${zoomFontSize}px` }}>
                                                        {zoomedCard.evidence}
                                                    </p>
                                                )}
                                                {zoomedCard.quranEvidence && zoomedCard.quranEvidence.map((ev: string, idx: number) => (
                                                    <p key={idx} className={`leading-[2.2] mt-2 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ color: s3d.textColor, fontSize: `${zoomFontSize}px` }}>
                                                        {ev}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Hadith Callout */}
                                        {(zoomedCard.hadith || (zoomedCard.sunnahEvidence && zoomedCard.sunnahEvidence.length > 0)) && (
                                            <div className="py-2 space-y-2 text-center">
                                                {zoomedCard.title !== tHajj('sunnahEvidenceTitle', language) && (
                                                    <div className="font-extrabold text-xs" style={{ color: s3d.primaryColor }}>
                                                        <span>{tHajj('sunnahEvidenceSection', language)}</span>
                                                    </div>
                                                )}
                                                {zoomedCard.hadith && (
                                                    <p className={`leading-[2.2] ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ color: s3d.textColor, fontSize: `${Math.max(15, zoomFontSize - 1)}px` }}>
                                                        {zoomedCard.hadith}
                                                    </p>
                                                )}
                                                {zoomedCard.sunnahEvidence && zoomedCard.sunnahEvidence.map((ev: string, idx: number) => (
                                                    <p key={idx} className={`leading-[2.2] mt-2 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ color: s3d.textColor, fontSize: `${Math.max(15, zoomFontSize - 1)}px` }}>
                                                        {ev}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Fiqh Definition / Summary / Hady Ruling / Who Is It For */}
                                        {(zoomedCard.definition || zoomedCard.description) && (
                                            <div className="py-2 space-y-1.5 text-center">
                                                <div className="font-extrabold text-xs" style={{ color: s3d.primaryColor }}>
                                                    <span>{tHajj('fiqhDefSection', language)}</span>
                                                </div>
                                                <p className="leading-relaxed font-medium" style={{ color: s3d.textColor, fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
                                                    {zoomedCard.definition || zoomedCard.description}
                                                </p>
                                            </div>
                                        )}

                                        {zoomedCard.hadyRuling && (
                                            <div className="py-2 space-y-1.5 text-center">
                                                <div className="font-extrabold text-xs" style={{ color: s3d.primaryColor }}>
                                                    <span>{isEn ? 'Hady (Sacrifice) Ruling' : 'حكم الهدي'}</span>
                                                </div>
                                                <p className="leading-relaxed font-medium" style={{ color: s3d.textColor, fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
                                                    {zoomedCard.hadyRuling}
                                                </p>
                                            </div>
                                        )}

                                        {zoomedCard.whoIsItFor && (
                                            <div className="py-2 space-y-1.5 text-center">
                                                <div className="font-extrabold text-xs" style={{ color: s3d.primaryColor }}>
                                                    <span>{isEn ? 'Who Is It Recommended For?' : 'لمن يُشرع ويفضل؟'}</span>
                                                </div>
                                                <p className="leading-relaxed font-medium" style={{ color: s3d.textColor, fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
                                                    {zoomedCard.whoIsItFor}
                                                </p>
                                            </div>
                                        )}

                                        {/* Primary Text */}
                                        {zoomedCard.text && (
                                            <div 
                                                className="leading-[2.2] font-medium select-text text-center" 
                                                style={{ fontSize: `${zoomFontSize}px`, color: s3d.textColor }}
                                                dangerouslySetInnerHTML={{ __html: zoomedCard.text.replaceAll('{{THEME_PALETTE_0}}', s3d.primaryColor) }}
                                            />
                                        )}

                                        {/* Points / Steps */}
                                        {(zoomedCard.points || zoomedCard.actions || zoomedCard.detailedSteps) && (
                                            <div className="space-y-3 text-center">
                                                {(zoomedCard.quranAyah || zoomedCard.hadith || zoomedCard.evidence || zoomedCard.definition || zoomedCard.quranEvidence?.length) && (
                                                    <h4 className="font-extrabold text-xs mb-1.5" style={{ color: s3d.primaryColor }}>
                                                        {tHajj('practicalStepsSection', language)}
                                                    </h4>
                                                )}
                                                <ul className="space-y-3">
                                                    {(zoomedCard.points || zoomedCard.actions || zoomedCard.detailedSteps)!.map((point, i) => (
                                                        <li key={i} className="py-1.5 text-center space-y-1">
                                                            <div className="leading-relaxed font-medium" style={{ fontSize: `${zoomFontSize}px`, color: s3d.textColor }} dangerouslySetInnerHTML={{ __html: point }} />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Sunan (if present) */}
                                        {zoomedCard.sunan && zoomedCard.sunan.length > 0 && (
                                            <div className="py-2 space-y-2 text-center">
                                                <div className="font-extrabold text-xs" style={{ color: s3d.primaryColor }}>
                                                    <span>{isEn ? 'Recommended Sunnahs' : 'السنن والآداب المستحبة'}</span>
                                                </div>
                                                <ul className="space-y-2">
                                                    {zoomedCard.sunan.map((s, idx) => (
                                                        <li key={idx} className="leading-relaxed font-medium text-center" style={{ color: s3d.textColor, fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Common Mistakes (if present) */}
                                        {zoomedCard.mistakes && zoomedCard.mistakes.length > 0 && (
                                            <div className="py-2 space-y-2 text-center">
                                                <div className="font-extrabold text-xs" style={{ color: s3d.primaryColor }}>
                                                    <span>{isEn ? 'Common Mistakes to Avoid' : 'أخطاء شائعة يُنبغي تجنبها'}</span>
                                                </div>
                                                <ul className="space-y-2">
                                                    {zoomedCard.mistakes.map((m, idx) => (
                                                        <li key={idx} className="leading-relaxed font-medium text-center" style={{ color: s3d.textColor, fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
                                                            {m}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Virtues List (if present) */}
                                        {zoomedCard.virtues && zoomedCard.virtues.length > 0 && (
                                            <div className="space-y-4">
                                                {zoomedCard.virtues.map((v, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`text-center space-y-2 ${idx > 0 ? `pt-4 border-t ${s3d.dividerClass}` : ''}`}
                                                    >
                                                        <div className="space-y-0.5">
                                                            <h4 className="font-extrabold text-sm sm:text-base" style={{ color: s3d.primaryColor }}>
                                                                {v.title}
                                                            </h4>
                                                            <p className="text-[11px] font-mono" style={{ color: s3d.subtextColor }}>
                                                                {v.source}
                                                            </p>
                                                        </div>
                                                        <p
                                                            className={`leading-[2.1] font-bold text-amber-800 dark:text-amber-300 ${isEn ? 'font-sans' : 'font-amiri'}`}
                                                            style={{ fontSize: `${zoomFontSize}px` }}
                                                        >
                                                            {v.text}
                                                        </p>
                                                        <p
                                                            className="leading-relaxed font-medium opacity-90"
                                                            style={{ color: s3d.textColor, fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}
                                                        >
                                                            {v.explanation}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Tabbed Active Section (Pillars & Obligations / Sunnahs & Prohibitions) */}
                                        {zoomedCard.sections && zoomedCard.sections.length > 0 && (() => {
                                            const activeSec = zoomedCard.sections[activeSectionIdx] || zoomedCard.sections[0];
                                            if (!activeSec) return null;
                                            return (
                                                <div className="space-y-3 text-center">
                                                    <div className="space-y-1">
                                                        <h4 className="font-extrabold text-sm sm:text-base" style={{ color: s3d.primaryColor }}>
                                                            {activeSec.title}
                                                        </h4>
                                                        {activeSec.subtitle && (
                                                            <p className="text-xs font-medium" style={{ color: s3d.subtextColor }}>
                                                                {activeSec.subtitle}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {activeSec.quranAyah && (
                                                        <div className="py-1 space-y-1">
                                                            <div className="font-extrabold text-xs" style={{ color: s3d.primaryColor }}>
                                                                <span>{tHajj('quranEvidenceSection', language)}</span>
                                                            </div>
                                                            <p className={`leading-[2.1] ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ color: s3d.textColor, fontSize: `${Math.max(16, zoomFontSize - 1)}px` }}>
                                                                {activeSec.quranAyah}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {activeSec.hadith && (
                                                        <div className="py-1 space-y-1">
                                                            <div className="font-extrabold text-xs" style={{ color: s3d.primaryColor }}>
                                                                <span>{tHajj('sunnahEvidenceSection', language)}</span>
                                                            </div>
                                                            <p className={`leading-[2.1] ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ color: s3d.textColor, fontSize: `${Math.max(15, zoomFontSize - 2)}px` }}>
                                                                {activeSec.hadith}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <ul className="space-y-2.5">
                                                        {activeSec.points.map((point, pi) => (
                                                            <li key={pi} className="py-1 text-center">
                                                                <div
                                                                    className="leading-relaxed font-medium"
                                                                    style={{ fontSize: `${zoomFontSize}px`, color: s3d.textColor }}
                                                                    dangerouslySetInnerHTML={{ __html: point }}
                                                                />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}

                                {copySuccess && (
                                    <p className="text-xs font-bold text-emerald-500 animate-pulse text-center">
                                        {tHajj('copiedSuccess', language)}
                                    </p>
                                )}
                            </div>

                            {/* Action Bar (Share, Copy, Zoom, ChevronDown to hide — without Audio button) */}
                            <div 
                                className={`p-4 pt-3 modal-sheet-safe-bottom shrink-0 flex flex-col gap-3 border-t overflow-visible ${s3d.dividerClass} ${s3d.surfaceCardClass}`}
                            >
                                {zoomedCard.duaaItems && zoomedCard.duaaItems.length > 1 && (
                                    <div className="flex w-full justify-between items-center gap-2 overflow-visible pb-1">
                                        <button 
                                            type="button"
                                            onClick={handleNextDuaa}
                                            disabled={currentDuaaIdx === zoomedCard.duaaItems.length - 1}
                                            className={`app-page-card border-0 flex-1 p-2.5 px-4 rounded-xl disabled:opacity-35 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm ${s3d.surfaceCardClass}`}
                                        >
                                            {!isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                            <span>{tHajj('nextDuaa', language)}</span>
                                        </button>

                                        <span className={`border-0 text-xs font-mono font-bold px-3 py-1.5 rounded-xl ${s3d.recessedInputClass}`} style={{ color: s3d.textColor }}>
                                            {currentDuaaIdx + 1} / {zoomedCard.duaaItems.length}
                                        </span>
                                        
                                        <button 
                                            type="button"
                                            onClick={handlePrevDuaa}
                                            disabled={currentDuaaIdx === 0}
                                            className={`app-page-card border-0 flex-1 p-2.5 px-4 rounded-xl disabled:opacity-35 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm ${s3d.surfaceCardClass}`}
                                        >
                                            <span>{tHajj('prevDuaa', language)}</span>
                                            {!isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                                        </button>
                                    </div>
                                )}

                                {/* Action buttons row: Share, Copy, Zoom, ChevronDown to hide */}
                                <div className="flex justify-center items-center gap-3 sm:gap-4 overflow-visible pb-1">
                                    {/* Share Button */}
                                    <button
                                        type="button"
                                        onClick={handleShareZoomText}
                                        className={`app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${s3d.surfaceCardClass}`}
                                        title={isEn ? "Share Image" : "مشاركة كصورة"}
                                    >
                                        <Share2 className="w-5 h-5" style={{ color: s3d.textColor }} />
                                    </button>

                                    {/* Copy Button */}
                                    <button
                                        type="button"
                                        onClick={handleCopyZoomText}
                                        className={`app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                          copySuccess ? '' : s3d.surfaceCardClass
                                        }`}
                                        style={copySuccess ? {
                                            backgroundColor: '#10B981',
                                            color: '#FFFFFF',
                                        } : undefined}
                                        title={isEn ? "Copy text" : "نسخ النص"}
                                    >
                                        {copySuccess ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" style={{ color: s3d.textColor }} />}
                                    </button>

                                    {/* Zoom Button */}
                                    <button
                                        type="button"
                                        onClick={handleToggleZoomFontSize}
                                        className={`app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${s3d.surfaceCardClass}`}
                                        title={isEn ? "Enlarge font size" : "تكبير حجم الخط"}
                                    >
                                        <ZoomIn className="w-5 h-5" style={{ color: s3d.textColor }} />
                                    </button>

                                    {/* ChevronDown / Hide Modal Button */}
                                    <button
                                        type="button"
                                        onClick={closeZoomModal}
                                        className={`app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${s3d.surfaceCardClass}`}
                                        title={isEn ? "Hide list" : "إخفاء القائمة"}
                                    >
                                        <ChevronDown className="w-5 h-5" style={{ color: s3d.textColor }} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Spotlight Guide */}
            <CommunitySpotlightGuide 
                guideKey="hajj_umrah_page_spotlight"
                steps={HAJJ_UMRAH_PAGE_STEPS}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={isEn}
            />
        </div>
    );
};

export default HajjUmrah;
