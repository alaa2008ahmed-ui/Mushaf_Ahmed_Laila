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
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';

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
    tokens: any;
}

const DuaaSection: FC<DuaaSectionProps> = ({ id, title, items, isOpen, onToggle, onZoom, cardTextScale, tokens }) => {
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
            className="rounded-[18px] overflow-hidden mb-3 border-0 transition-all" 
            style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
        >
            <button 
                type="button"
                onClick={onToggle} 
                className="w-full flex justify-between items-center p-4.5 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
                <span className={`font-bold text-base md:text-lg ${isEn ? 'text-left' : 'text-right'}`} style={{ color: tokens.textColor, fontSize: `${16 * cardTextScale}px` }}>
                    {displayTitle}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 opacity-60" style={{ color: tokens.textColor }} />
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
                                className="flex flex-col gap-4 p-5 rounded-[16px] relative min-h-[160px] justify-center items-center text-center border-0 cursor-pointer" 
                                style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}
                            >
                                <span className={`absolute top-3 ${isRTL ? 'right-4' : 'left-4'} text-xs font-bold opacity-60 font-mono`} style={{ color: tokens.textColor }}>
                                    {currentIndex + 1} / {items.length}
                                </span>
                                
                                <div className="mt-6 mb-2 space-y-3 w-full">
                                    {isEn ? (
                                        <p className="text-sm md:text-base leading-[2.2] text-emerald-800 dark:text-emerald-300 font-medium px-4 py-2.5 rounded-xl bg-emerald-500/10 text-start border-0"
                                           style={{ fontSize: `${14 * cardTextScale}px` }}>
                                            {currentEnglishTranslation}
                                        </p>
                                    ) : (
                                        <p className="text-lg md:text-xl leading-[2.3] font-amiri font-bold px-2" style={{ color: tokens.textColor, fontSize: `${18 * cardTextScale}px` }}>
                                            {currentArabicItem}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex w-full justify-between items-center mt-2 border-t border-slate-100 dark:border-zinc-800 pt-3">
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                        disabled={currentIndex === items.length - 1}
                                        className="p-2 px-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm border-0"
                                        style={{ color: tokens.textColor }}
                                    >
                                        {!isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                        <span>{tHajj('nextDuaa', language)}</span>
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                        disabled={currentIndex === 0}
                                        className="p-2 px-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm border-0"
                                        style={{ color: tokens.textColor }}
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

const ChecklistScreen = ({ tokens, cardTextScale, onZoom }: { tokens: any, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
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
                className="rounded-[18px] p-4.5 text-center relative border-0" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <p className="text-sm font-bold px-4" style={{ color: tokens.primaryColor, fontSize: `${14 * cardTextScale}px` }}>
                    {tHajj('checklistHeader', language)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                    <div 
                        key={i} 
                        className="rounded-[18px] p-4.5 relative border-0" 
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <div 
                            onClick={() => onZoom({
                                title: cat.title,
                                points: cat.items.map(item => isEn ? (CHECKLIST_ITEMS_EN[item.id] || item.ar) : item.ar)
                            })}
                            className="pb-2.5 mb-3 border-b border-slate-100 dark:border-zinc-800 cursor-pointer"
                        >
                            <h3 className="font-bold text-base text-start" style={{ color: tokens.primaryColor, fontSize: `${15 * cardTextScale}px` }}>
                                {cat.title}
                            </h3>
                        </div>
                        <div className="space-y-1.5">
                            {cat.items.map(item => {
                                const itemText = isEn ? (CHECKLIST_ITEMS_EN[item.id] || item.ar) : item.ar;
                                return (
                                    <button 
                                        key={item.id} 
                                        type="button"
                                        onClick={() => toggleItem(item.id)}
                                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all border-0 cursor-pointer"
                                        style={{ backgroundColor: checkedItems[item.id] ? hexToRgba(tokens.primaryColor, 0.06) : 'transparent' }}
                                    >
                                        <div 
                                            className={`shrink-0 w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${checkedItems[item.id] ? '' : 'bg-slate-200 dark:bg-zinc-700'}`}
                                            style={{ backgroundColor: checkedItems[item.id] ? tokens.primaryColor : undefined }}
                                        >
                                            {checkedItems[item.id] && <Check size={12} className="text-white stroke-[3]" />}
                                        </div>
                                        <span className={`text-sm text-start leading-relaxed font-medium transition-opacity flex-1 ${checkedItems[item.id] ? 'opacity-40 line-through' : ''}`} style={{ color: tokens.textColor, fontSize: `${13.5 * cardTextScale}px` }}>
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

const CountersScreen = ({ tokens, cardTextScale, onZoom }: { tokens: any, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
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
                className="rounded-[18px] p-4.5 text-center relative border-0" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <h3 className="font-bold text-base mb-1" style={{ color: tokens.primaryColor, fontSize: `${16 * cardTextScale}px` }}>
                    {tHajj('counterHeaderTitle', language)}
                </h3>
                <p className="text-xs opacity-80 px-6" style={{ color: tokens.textColor, fontSize: `${13 * cardTextScale}px` }}>
                    {tHajj('counterHeaderDesc', language)}
                </p>
            </div>

            {/* Tawaf vs Sa'i switch - Zero Border */}
            <div 
                className="flex p-1.5 rounded-2xl gap-1.5 border-0"
                style={{ backgroundColor: tokens.capsuleBg, boxShadow: tokens.cardShadow }}
            >
                <button 
                    type="button"
                    onClick={() => switchTab('tawaf')} 
                    className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-sm border-0 ${state.activeTab === 'tawaf' ? 'shadow-sm' : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: state.activeTab === 'tawaf' ? tokens.primaryColor : 'transparent',
                        color: state.activeTab === 'tawaf' ? '#FFFFFF' : tokens.textColor,
                        fontSize: `${13 * cardTextScale}px`
                    }}
                >
                    {tHajj('tabTawaf', language)} ({state.tawafCount}/7)
                </button>
                <button 
                    type="button"
                    onClick={() => switchTab('sai')} 
                    className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-sm border-0 ${state.activeTab === 'sai' ? 'shadow-sm' : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: state.activeTab === 'sai' ? tokens.primaryColor : 'transparent',
                        color: state.activeTab === 'sai' ? '#FFFFFF' : tokens.textColor,
                        fontSize: `${13 * cardTextScale}px`
                    }}
                >
                    {tHajj('tabSai', language)} ({state.saiCount}/7)
                </button>
            </div>

            {/* Circular Counter Box - Pure White, Zero Border */}
            <div 
                className="rounded-[22px] p-6 flex flex-col items-center justify-center min-h-[250px] border-0" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                {/* 7 Laps progress bar */}
                <div className="w-full max-w-xs flex items-center justify-between gap-2 mb-6 px-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((lap) => {
                        const isPassed = lap <= currentCount;
                        return (
                            <div key={lap} className="flex-1 flex flex-col items-center gap-1.5">
                                <div 
                                    className={`w-full h-2 rounded-full transition-all duration-300 ${isPassed ? '' : 'bg-slate-200 dark:bg-zinc-700'}`}
                                    style={{ backgroundColor: isPassed ? tokens.primaryColor : undefined }}
                                />
                                <span className="text-[10px] font-bold opacity-60" style={{ color: isPassed ? tokens.primaryColor : tokens.subtextColor }}>
                                    {lap}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Big Circular Counter Button */}
                <div className="flex items-center justify-center gap-6 my-2">
                    <button
                        type="button"
                        onClick={decrement}
                        disabled={currentCount === 0}
                        className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-0"
                        style={{ color: tokens.textColor }}
                        title="Decrement"
                    >
                        <Minus className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={increment}
                        disabled={isComplete}
                        className="w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer border-0"
                        style={{ 
                            backgroundColor: isComplete ? '#10b981' : tokens.primaryColor,
                            color: '#FFFFFF'
                        }}
                    >
                        <span className="text-4xl font-extrabold leading-none">{currentCount}</span>
                        <span className="text-xs font-bold mt-1 opacity-90">/ 7</span>
                    </button>

                    <button
                        type="button"
                        onClick={reset}
                        className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-0"
                        style={{ color: tokens.textColor }}
                        title="Reset"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>

                {isComplete && (
                    <div className="mt-4 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {language === 'en' ? 'Completed 7 circuits successfully!' : 'تم إتمام ٧ أشواط بحمد الله!'}
                    </div>
                )}
            </div>
        </section>
    );
};

const HomeScreen = ({ setScreen, tokens, cardTextScale, onZoom }: { setScreen: any, tokens: any, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';

    const additions = isEn ? HOME_ADDITIONS_EN : homeScreenAdditions;

    return (
     <section id="home-screen" className="space-y-4">
        {/* Navigation Category Cards - Clean Modern Surfaces, Zero Border */}
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
                    className="relative flex flex-col items-center justify-center p-5 rounded-[18px] transition-all duration-300 cursor-pointer min-h-[92px] border-0 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ 
                        backgroundColor: tokens.cardBgColor, 
                        boxShadow: tokens.cardShadow 
                    }}
                >
                    <h2 className="relative z-10 font-bold text-center leading-snug" style={{ color: tokens.textColor, fontSize: `${15.5 * cardTextScale}px` }}>
                        {item.label}
                    </h2>
                </button>
            ))}
            
            <button 
                type="button"
                onClick={() => setScreen('checklist')} 
                className="relative flex flex-col items-center justify-center p-4.5 rounded-[18px] transition-all duration-300 col-span-2 cursor-pointer border-0 hover:scale-[1.01] active:scale-[0.99]"
                style={{ 
                    backgroundColor: tokens.cardBgColor, 
                    boxShadow: tokens.cardShadow 
                }}
            >
                <h2 className="relative z-10 font-bold text-center" style={{ color: tokens.textColor, fontSize: `${15.5 * cardTextScale}px` }}>
                    {tHajj('cardChecklist', language)}
                </h2>
            </button>
        </div>

        {/* Content Cards - Pure White, Soft Shadow, Zero Border */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
            {additions.map((item, index) => (
                 <div 
                    key={index} 
                    onClick={() => onZoom({
                        title: item.title,
                        points: item.content,
                        text: item.type === 'hadith' ? item.content[0] : undefined
                    })}
                    className="rounded-[18px] p-5 text-start relative border-0 cursor-pointer hover:shadow-md transition-all" 
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                 >
                    <div className="mb-2">
                        <h3 className="font-bold text-base leading-snug" style={{ color: tokens.primaryColor, fontSize: `${15 * cardTextScale}px` }}>
                            <span>{item.title}</span>
                        </h3>
                    </div>

                    {item.type === 'hadith' ? (
                        <p className={`text-xs leading-[2.1] font-medium opacity-90 p-3 rounded-xl`} style={{ backgroundColor: hexToRgba(tokens.primaryColor, 0.05), color: tokens.textColor, fontSize: `${13 * cardTextScale}px` }}>
                            {item.content[0]}
                        </p>
                    ) : (
                        <ul className="space-y-1.5 opacity-90 mt-2">
                            {item.content.map((point, pi) => (
                                <li key={pi} className="flex gap-2 items-start text-xs font-medium" style={{ color: tokens.textColor, fontSize: `${12.5 * cardTextScale}px` }}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: tokens.primaryColor }}></div>
                                    <span className="flex-1 leading-relaxed opacity-85">{point}</span>
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
                className="col-span-1 md:col-span-2 rounded-[18px] p-5 text-start relative border-0 cursor-pointer hover:shadow-md transition-all" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="mb-1.5">
                    <h3 className="font-bold text-orange-600 dark:text-orange-400 text-base" style={{ fontSize: `${15 * cardTextScale}px` }}>
                        <span>{isEn ? 'Important Warning' : 'تنبيه هام'}</span>
                    </h3>
                </div>
                <p className="leading-[2.1] text-xs text-orange-950 dark:text-orange-200" style={{ fontSize: `${12.5 * cardTextScale}px` }}>
                    {isEn 
                        ? 'Omitting a pillar invalidates the ritual, whereas omitting an obligation requires a sacrificial penalty (dam), and committing prohibitions incurs an expiation (fidyah).' 
                        : 'ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية.'}
                </p>
            </div>
        </div>
    </section>
    );
};

const UmrahScreen = ({ tokens, onSelectDetail, cardTextScale, onZoom }: { tokens: any, onSelectDetail: (data: CardZoomData) => void, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
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
            className="rounded-[18px] p-5 text-center border-0" 
            style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
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
                className="w-full text-start rounded-[18px] p-4.5 flex items-center justify-between gap-3.5 hover:shadow-md transition-all group border-0 cursor-pointer"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-base leading-snug" style={{ color: tokens.textColor, fontSize: `${15 * cardTextScale}px` }}>
                        {tHajj('umrahVirtuesTitle', language)}
                    </h3>
                    <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: tokens.subtextColor, fontSize: `${12 * cardTextScale}px` }}>
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
                className="w-full text-start rounded-[18px] p-4.5 flex items-center justify-between gap-3.5 hover:shadow-md transition-all group border-0 cursor-pointer" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-base leading-snug truncate" style={{ color: tokens.textColor, fontSize: `${15 * cardTextScale}px` }}>
                        {isEn ? `${tHajj('pillarsLabel', language)} & ${tHajj('obligationsLabel', language)}` : `${tHajj('pillarsLabel', language)} والواجبات`}
                    </h3>
                    <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: tokens.subtextColor, fontSize: `${12 * cardTextScale}px` }}>
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
                className="w-full text-start rounded-[18px] p-4.5 flex items-center justify-between gap-3.5 hover:shadow-md transition-all group border-0 cursor-pointer" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-base leading-snug truncate" style={{ color: tokens.textColor, fontSize: `${15 * cardTextScale}px` }}>
                        {isEn ? `${tHajj('sunnahsLabel', language)} & ${tHajj('prohibitionsLabel', language)}` : `${tHajj('sunnahsLabel', language)} والمفسدات`}
                    </h3>
                    <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: tokens.subtextColor, fontSize: `${12 * cardTextScale}px` }}>
                        {isEn ? 'Ghusl, Talbiyah, Idtiba\' • Intercourse, omitting pillars, violations' : 'الغسل، الطيب، التلبية، الرمل • الجماع، ترك ركن، المحظورات'}
                    </p>
                </div>
            </button>
        </div>

        {/* 9 Steps */}
        <div className="space-y-3">
            <h3 className="text-base font-bold text-start" style={{ color: tokens.textColor, fontSize: `${16 * cardTextScale}px` }}>
                <span>{tHajj('umrahStepsSectionTitle', language)}</span>
            </h3>
            {stepsList.map((step) => (
                <div 
                    key={step.title}
                    onClick={() => openStepZoom(step)}
                    className="w-full text-start rounded-[18px] p-4.5 flex items-center justify-between gap-3.5 hover:shadow-md transition-all group border-0 cursor-pointer"
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm md:text-base leading-snug" style={{ color: tokens.textColor, fontSize: `${15 * cardTextScale}px` }}>
                                {step.title}
                            </h4>
                        </div>
                        {step.subtitle && (
                            <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: tokens.subtextColor, fontSize: `${12 * cardTextScale}px` }}>
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

const HajjScreen = ({ hajjType, setHajjType, onSelectDetail, cardTextScale, onZoom, tokens }: { hajjType: any, setHajjType: any, onSelectDetail: (data: CardZoomData) => void, cardTextScale: number, onZoom: (data: CardZoomData) => void, tokens: any }) => {
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
            className="rounded-[18px] p-5 text-center border-0" 
            style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
        >
            <p className="font-amiri text-base font-bold text-amber-800 dark:text-amber-300 px-4" style={{ fontSize: `${16 * cardTextScale}px` }}>
                {tHajj('hajjIntroVerse', language)}
            </p>
        </div>

        {/* 3 Types Segmented Selection */}
        <div className="space-y-3">
            <div 
                className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl border-0"
                style={{ backgroundColor: tokens.capsuleBg, boxShadow: tokens.cardShadow }}
            >
                {typesList.map((t: any) => {
                    const isSelected = hajjType === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setHajjType(t.id)}
                            className={`py-3 px-2 rounded-xl text-center transition-all cursor-pointer border-0 ${isSelected ? 'shadow-sm' : 'opacity-60'}`}
                            style={{
                                backgroundColor: isSelected ? tokens.primaryColor : 'transparent',
                                color: isSelected ? '#FFFFFF' : tokens.textColor
                            }}
                        >
                            <span className="block font-bold text-xs sm:text-sm">{t.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Selected type card */}
            {currentType && (
                <div className="space-y-3">
                    {/* Section 1: Badge & Centered Definition */}
                    <div 
                        className="rounded-[18px] p-5 text-center relative border-0" 
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-0">
                                {currentType.badge}
                            </span>
                        </div>
                        <p className="text-xs font-medium mt-2.5 leading-relaxed text-center" style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${12.5 * cardTextScale}px` }}>
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
                            className="w-full text-start rounded-[18px] p-4.5 flex items-center justify-between gap-3.5 hover:shadow-md transition-all group border-0 cursor-pointer"
                            style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                        >
                            <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-sm md:text-base" style={{ color: tokens.textColor, fontSize: `${15 * cardTextScale}px` }}>
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
            <h3 className="text-base font-bold mb-3 text-center" style={{ color: tokens.textColor, fontSize: `${16 * cardTextScale}px` }}>
                <span>{tHajj('hajjTimelineSectionTitle', language)}</span>
            </h3>
            <div className="space-y-3">
                {(hajjType === 'tamattu' ? tamattuPlan : hajjType === 'ifrad' ? ifradPlan : qiranPlan).map((day: any, i: number) => (
                    <div 
                        key={i} 
                        onClick={() => openTimelineDayZoom(day)}
                        className="w-full text-start rounded-[18px] p-4.5 flex items-center justify-between gap-3.5 hover:shadow-md transition-all group border-0 cursor-pointer"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm md:text-base" style={{ color: tokens.textColor, fontSize: `${15 * cardTextScale}px` }}>{day.day}</h5>
                            <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: tokens.subtextColor, fontSize: `${12 * cardTextScale}px` }}>{day.summary}</p>
                            {day.evidence && (
                                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-1 truncate" style={{ fontSize: `${11 * cardTextScale}px` }}>
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

const DuaaScreen = ({ openDuaaId, onToggle, onZoom, cardTextScale, tokens }: { openDuaaId: any, onToggle: any, onZoom: any, cardTextScale: number, tokens: any }) => {
    const { language } = useLanguage();
    return (
        <section id="duaa-screen" className="space-y-4">
             <div 
                className="rounded-[18px] p-4.5 text-center mb-3 border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
             >
                <p className="text-xs sm:text-sm font-bold px-4" style={{ color: tokens.primaryColor, fontSize: `${13 * cardTextScale}px` }}>
                    {tHajj('duaaScreenHeader', language)}
                </p>
            </div>

            <div className="space-y-2.5">
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
                        tokens={tokens}
                    />
                ))}
            </div>
        </section>
    );
};

const HajjUmrah: FC<{ onBack: () => void, onNavigate: (page: string) => void, navParams?: any }> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
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
                return <UmrahScreen key="umrah" tokens={tokens} onSelectDetail={openZoomModal} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'hajj': 
                return <HajjScreen key="hajj" hajjType={hajjType} setHajjType={setHajjType} tokens={tokens} onSelectDetail={openZoomModal} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'duaa': 
                return <DuaaScreen key="duaa" tokens={tokens} openDuaaId={openDuaaId} onToggle={handleDuaaToggle} onZoom={openZoomModal} cardTextScale={cardTextScale} />;
            case 'checklist': 
                return <ChecklistScreen key="checklist" tokens={tokens} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'counters': 
                return <CountersScreen key="counters" tokens={tokens} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            default: 
                return <HomeScreen key="home" setScreen={setScreen} tokens={tokens} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
        }
    };

    return (
        <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: theme.font }} dir={dir}>
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

            {/* Magnifier / Zoom Modal - Unified Duas & Adhkar Bottom Sheet Style (without audio button) */}
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
                            className="w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[88dvh] overflow-hidden relative shadow-2xl" 
                            style={{ 
                                backgroundColor: tokens.isDark ? tokens.cardBgColor : '#FFFFFF', 
                                color: tokens.isDark ? tokens.textColor : '#000000',
                                fontFamily: isEn ? 'sans-serif' : theme.font
                            }} 
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Top Drag Handle & Category Pill without X or top ZoomIn buttons */}
                            <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 mb-2" />
                                <div className="w-full flex items-center justify-center">
                                    <span 
                                        className="px-3.5 py-1 rounded-full text-xs font-bold text-center"
                                        style={{
                                            backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                            color: tokens.primaryColor
                                        }}
                                    >
                                        {zoomedCard.category || zoomedCard.subtitle || (isEn ? "Hajj & Umrah Guide" : "دليل الحج والعمرة")}
                                    </span>
                                </div>
                                {/* Segmented Tabs for 2-Tab Lists (Pillars/Obligations & Sunnahs/Prohibitions) */}
                                {zoomedCard.sections && zoomedCard.sections.length > 1 && (
                                    <div
                                        className="w-full flex p-1.5 rounded-2xl gap-1.5 mt-3 border-0"
                                        style={{
                                            backgroundColor: tokens.capsuleBg,
                                            boxShadow: tokens.cardShadow
                                        }}
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
                                                    className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-sm border-0 ${isActive ? 'shadow-sm' : 'opacity-60'}`}
                                                    style={{
                                                        backgroundColor: isActive ? tokens.primaryColor : 'transparent',
                                                        color: isActive ? '#FFFFFF' : tokens.textColor
                                                    }}
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
                                        <h3 className="text-base sm:text-lg font-bold" style={{ color: tokens.primaryColor }}>
                                            {zoomedCard.title}
                                        </h3>
                                        {zoomedCard.subtitle && zoomedCard.category && (
                                            <p className="text-xs sm:text-sm opacity-75 font-medium" style={{ color: tokens.subtextColor }}>
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
                                                style={{ fontSize: `${zoomFontSize}px` }}
                                                dir="ltr"
                                            >
                                                {getDuaaEnglish(zoomedCard.duaaItems[currentDuaaIdx])}
                                            </div>
                                        ) : (
                                            <div 
                                                className="leading-[2.4] font-amiri text-center select-none py-2"
                                                style={{ fontSize: `${zoomFontSize + 4}px` }}
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
                                                    <div className="font-bold text-xs" style={{ color: tokens.primaryColor }}>
                                                        <span>{tHajj('quranEvidenceSection', language)}</span>
                                                    </div>
                                                )}
                                                {zoomedCard.quranAyah && (
                                                    <p className={`leading-[2.2] ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${zoomFontSize}px` }}>
                                                        {zoomedCard.quranAyah}
                                                    </p>
                                                )}
                                                {zoomedCard.evidence && !zoomedCard.quranAyah && (
                                                    <p className={`leading-[2.2] ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${zoomFontSize}px` }}>
                                                        {zoomedCard.evidence}
                                                    </p>
                                                )}
                                                {zoomedCard.quranEvidence && zoomedCard.quranEvidence.map((ev: string, idx: number) => (
                                                    <p key={idx} className={`leading-[2.2] mt-2 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${zoomFontSize}px` }}>
                                                        {ev}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Hadith Callout */}
                                        {(zoomedCard.hadith || (zoomedCard.sunnahEvidence && zoomedCard.sunnahEvidence.length > 0)) && (
                                            <div className="py-2 space-y-2 text-center">
                                                {zoomedCard.title !== tHajj('sunnahEvidenceTitle', language) && (
                                                    <div className="font-bold text-xs" style={{ color: tokens.primaryColor }}>
                                                        <span>{tHajj('sunnahEvidenceSection', language)}</span>
                                                    </div>
                                                )}
                                                {zoomedCard.hadith && (
                                                    <p className={`leading-[2.2] ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(15, zoomFontSize - 1)}px` }}>
                                                        {zoomedCard.hadith}
                                                    </p>
                                                )}
                                                {zoomedCard.sunnahEvidence && zoomedCard.sunnahEvidence.map((ev: string, idx: number) => (
                                                    <p key={idx} className={`leading-[2.2] mt-2 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(15, zoomFontSize - 1)}px` }}>
                                                        {ev}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Fiqh Definition / Summary / Hady Ruling / Who Is It For */}
                                        {(zoomedCard.definition || zoomedCard.description) && (
                                            <div className="py-2 space-y-1.5 text-center">
                                                <div className="font-bold text-xs" style={{ color: tokens.primaryColor }}>
                                                    <span>{tHajj('fiqhDefSection', language)}</span>
                                                </div>
                                                <p className="leading-relaxed font-medium" style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
                                                    {zoomedCard.definition || zoomedCard.description}
                                                </p>
                                            </div>
                                        )}

                                        {zoomedCard.hadyRuling && (
                                            <div className="py-2 space-y-1.5 text-center">
                                                <div className="font-bold text-xs" style={{ color: tokens.primaryColor }}>
                                                    <span>{isEn ? 'Hady (Sacrifice) Ruling' : 'حكم الهدي'}</span>
                                                </div>
                                                <p className="leading-relaxed font-medium" style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
                                                    {zoomedCard.hadyRuling}
                                                </p>
                                            </div>
                                        )}

                                        {zoomedCard.whoIsItFor && (
                                            <div className="py-2 space-y-1.5 text-center">
                                                <div className="font-bold text-xs" style={{ color: tokens.primaryColor }}>
                                                    <span>{isEn ? 'Who Is It Recommended For?' : 'لمن يُشرع ويفضل؟'}</span>
                                                </div>
                                                <p className="leading-relaxed font-medium" style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
                                                    {zoomedCard.whoIsItFor}
                                                </p>
                                            </div>
                                        )}

                                        {/* Primary Text */}
                                        {zoomedCard.text && (
                                            <div 
                                                className="leading-[2.2] font-medium select-text text-center" 
                                                style={{ fontSize: `${zoomFontSize}px`, color: tokens.isDark ? tokens.textColor : '#000000' }}
                                                dangerouslySetInnerHTML={{ __html: zoomedCard.text.replaceAll('{{THEME_PALETTE_0}}', tokens.primaryColor) }}
                                            />
                                        )}

                                        {/* Points / Steps */}
                                        {(zoomedCard.points || zoomedCard.actions || zoomedCard.detailedSteps) && (
                                            <div className="space-y-3 text-center">
                                                {(zoomedCard.quranAyah || zoomedCard.hadith || zoomedCard.evidence || zoomedCard.definition || zoomedCard.quranEvidence?.length) && (
                                                    <h4 className="font-bold text-xs mb-1.5" style={{ color: tokens.primaryColor }}>
                                                        {tHajj('practicalStepsSection', language)}
                                                    </h4>
                                                )}
                                                <ul className="space-y-3">
                                                    {(zoomedCard.points || zoomedCard.actions || zoomedCard.detailedSteps)!.map((point, i) => (
                                                        <li key={i} className="py-1.5 text-center space-y-1">
                                                            <div className="leading-relaxed font-medium" style={{ fontSize: `${zoomFontSize}px`, color: tokens.isDark ? tokens.textColor : '#000000' }} dangerouslySetInnerHTML={{ __html: point }} />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Sunan (if present) */}
                                        {zoomedCard.sunan && zoomedCard.sunan.length > 0 && (
                                            <div className="py-2 space-y-2 text-center">
                                                <div className="font-bold text-xs" style={{ color: tokens.primaryColor }}>
                                                    <span>{isEn ? 'Recommended Sunnahs' : 'السنن والآداب المستحبة'}</span>
                                                </div>
                                                <ul className="space-y-2">
                                                    {zoomedCard.sunan.map((s, idx) => (
                                                        <li key={idx} className="leading-relaxed font-medium text-center" style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Common Mistakes (if present) */}
                                        {zoomedCard.mistakes && zoomedCard.mistakes.length > 0 && (
                                            <div className="py-2 space-y-2 text-center">
                                                <div className="font-bold text-xs" style={{ color: tokens.primaryColor }}>
                                                    <span>{isEn ? 'Common Mistakes to Avoid' : 'أخطاء شائعة يُنبغي تجنبها'}</span>
                                                </div>
                                                <ul className="space-y-2">
                                                    {zoomedCard.mistakes.map((m, idx) => (
                                                        <li key={idx} className="leading-relaxed font-medium text-center" style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}>
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
                                                        className={`text-center space-y-2 ${idx > 0 ? 'pt-4 border-t border-slate-100 dark:border-zinc-800' : ''}`}
                                                    >
                                                        <div className="space-y-0.5">
                                                            <h4 className="font-bold text-sm sm:text-base" style={{ color: tokens.primaryColor }}>
                                                                {v.title}
                                                            </h4>
                                                            <p className="text-[11px] opacity-65 font-mono" style={{ color: tokens.subtextColor }}>
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
                                                            style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(14, zoomFontSize - 2)}px` }}
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
                                                        <h4 className="font-bold text-sm sm:text-base" style={{ color: tokens.primaryColor }}>
                                                            {activeSec.title}
                                                        </h4>
                                                        {activeSec.subtitle && (
                                                            <p className="text-xs opacity-75 font-medium" style={{ color: tokens.subtextColor }}>
                                                                {activeSec.subtitle}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {activeSec.quranAyah && (
                                                        <div className="py-1 space-y-1">
                                                            <div className="font-bold text-xs" style={{ color: tokens.primaryColor }}>
                                                                <span>{tHajj('quranEvidenceSection', language)}</span>
                                                            </div>
                                                            <p className={`leading-[2.1] ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(16, zoomFontSize - 1)}px` }}>
                                                                {activeSec.quranAyah}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {activeSec.hadith && (
                                                        <div className="py-1 space-y-1">
                                                            <div className="font-bold text-xs" style={{ color: tokens.primaryColor }}>
                                                                <span>{tHajj('sunnahEvidenceSection', language)}</span>
                                                            </div>
                                                            <p className={`leading-[2.1] ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ color: tokens.isDark ? tokens.textColor : '#000000', fontSize: `${Math.max(15, zoomFontSize - 2)}px` }}>
                                                                {activeSec.hadith}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <ul className="space-y-2.5">
                                                        {activeSec.points.map((point, pi) => (
                                                            <li key={pi} className="py-1 text-center">
                                                                <div
                                                                    className="leading-relaxed font-medium"
                                                                    style={{ fontSize: `${zoomFontSize}px`, color: tokens.isDark ? tokens.textColor : '#000000' }}
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

                            {/* Action Bar (Share, Copy, Zoom, ChevronDown to hide — without Audio button) matching Duas & Adhkar ZoomModal */}
                            <div 
                                className="p-4 pt-3 modal-sheet-safe-bottom shrink-0 flex flex-col gap-3 border-t border-slate-100 dark:border-white/5"
                                style={{
                                    backgroundColor: tokens.isDark ? tokens.cardBgColor : '#FFFFFF'
                                }}
                            >
                                {zoomedCard.duaaItems && zoomedCard.duaaItems.length > 1 && (
                                    <div className="flex w-full justify-between items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={handleNextDuaa}
                                            disabled={currentDuaaIdx === zoomedCard.duaaItems.length - 1}
                                            className="flex-1 p-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 disabled:opacity-30 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm border-0"
                                            style={{ color: tokens.textColor }}
                                        >
                                            {!isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                            <span>{tHajj('nextDuaa', language)}</span>
                                        </button>

                                        <span className="text-xs font-mono font-bold opacity-75 px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800" style={{ color: tokens.textColor }}>
                                            {currentDuaaIdx + 1} / {zoomedCard.duaaItems.length}
                                        </span>
                                        
                                        <button 
                                            type="button"
                                            onClick={handlePrevDuaa}
                                            disabled={currentDuaaIdx === 0}
                                            className="flex-1 p-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 disabled:opacity-30 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm border-0"
                                            style={{ color: tokens.textColor }}
                                        >
                                            <span>{tHajj('prevDuaa', language)}</span>
                                            {!isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                                        </button>
                                    </div>
                                )}

                                {/* Action buttons row: Share, Copy, Zoom, ChevronDown to hide */}
                                <div className="flex justify-center items-center gap-3 sm:gap-4">
                                    {/* Share Button */}
                                    <button
                                        type="button"
                                        onClick={handleShareZoomText}
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
                                        onClick={handleCopyZoomText}
                                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                                        style={{
                                            backgroundColor: copySuccess ? '#10B981' : (tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
                                            color: copySuccess ? '#FFFFFF' : tokens.textColor
                                        }}
                                        title={isEn ? "Copy text" : "نسخ النص"}
                                    >
                                        {copySuccess ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
                                    </button>

                                    {/* Zoom Button */}
                                    <button
                                        type="button"
                                        onClick={handleToggleZoomFontSize}
                                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                                        style={{
                                            backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                                            color: tokens.textColor
                                        }}
                                        title={isEn ? "Enlarge font size" : "تكبير حجم الخط"}
                                    >
                                        <ZoomIn className="w-5 h-5" />
                                    </button>

                                    {/* ChevronDown / Hide Modal Button */}
                                    <button
                                        type="button"
                                        onClick={closeZoomModal}
                                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                                        style={{
                                            backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                                            color: tokens.textColor
                                        }}
                                        title={isEn ? "Hide list" : "إخفاء القائمة"}
                                    >
                                        <ChevronDown className="w-5 h-5" />
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
