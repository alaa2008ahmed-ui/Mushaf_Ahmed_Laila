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
    ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
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

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentIndex < items.length - 1) setCurrentIndex(i => i + 1);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
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
                                className="flex flex-col gap-4 p-5 rounded-[16px] relative min-h-[160px] justify-center items-center text-center border-0" 
                                style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}
                            >
                                <span className={`absolute top-3 ${isRTL ? 'right-4' : 'left-4'} text-xs font-bold opacity-60 font-mono`} style={{ color: tokens.textColor }}>
                                    {currentIndex + 1} / {items.length}
                                </span>
                                <button 
                                    type="button"
                                    onClick={handleZoomClick} 
                                    className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} p-2 shrink-0 opacity-80 hover:opacity-100 hover:bg-black/5 transition-opacity rounded-full dark:hover:bg-zinc-700 cursor-pointer border-0`} 
                                    title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                    style={{ color: tokens.textColor }}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                
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
                                        onClick={handleNext}
                                        disabled={currentIndex === items.length - 1}
                                        className="p-2 px-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm border-0"
                                        style={{ color: tokens.textColor }}
                                    >
                                        {!isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                        <span>{tHajj('nextDuaa', language)}</span>
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        onClick={handlePrev}
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
                        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-zinc-800">
                            <h3 className="font-bold text-base text-start" style={{ color: tokens.primaryColor, fontSize: `${15 * cardTextScale}px` }}>
                                {cat.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => onZoom({
                                    title: cat.title,
                                    points: cat.items.map(item => isEn ? (CHECKLIST_ITEMS_EN[item.id] || item.ar) : item.ar)
                                })}
                                className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer border-0"
                                title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                style={{ color: tokens.textColor }}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
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
                    className="rounded-[18px] p-5 text-start relative border-0" 
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                 >
                    <div className="flex items-center justify-between mb-2 gap-2">
                        <h3 className="font-bold text-base leading-snug" style={{ color: tokens.primaryColor, fontSize: `${15 * cardTextScale}px` }}>
                            <span>{item.title}</span>
                        </h3>
                        {/* Magnifying Glass to zoom card text */}
                        <button
                            type="button"
                            onClick={() => onZoom({
                                title: item.title,
                                points: item.content,
                                text: item.type === 'hadith' ? item.content[0] : undefined
                            })}
                            className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer shrink-0 border-0"
                            title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                            style={{ color: tokens.textColor }}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
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
                className="col-span-1 md:col-span-2 rounded-[18px] p-5 text-start relative border-0" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="flex items-center justify-between mb-1.5 gap-2">
                    <h3 className="font-bold text-orange-600 dark:text-orange-400 text-base" style={{ fontSize: `${15 * cardTextScale}px` }}>
                        <span>{isEn ? 'Important Warning' : 'تنبيه هام'}</span>
                    </h3>
                    <button
                        type="button"
                        onClick={() => onZoom({
                            title: isEn ? 'Important Warning' : 'تنبيه هام',
                            text: isEn 
                                ? 'Omitting a pillar invalidates the ritual, whereas omitting an obligation requires a sacrificial penalty (dam), and committing prohibitions incurs an expiation (fidyah).' 
                                : 'ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية.'
                        })}
                        className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer shrink-0 text-orange-600 dark:text-orange-400 border-0"
                        title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
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

const UmrahScreen = ({ tokens, onSelectDetail, cardTextScale, onZoom }: { tokens: any, onSelectDetail: any, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [showVirtues, setShowVirtues] = useState(false);

    const virtuesList = isEn ? umrahVirtuesEn : umrahVirtues;
    const generalInfo = isEn ? umrahGeneralInfoEn : umrahGeneralInfo;
    const stepsList = isEn ? umrahStepsEn : umrahSteps;

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
            <p className="text-xs opacity-75 mt-1 px-4" style={{ color: tokens.textColor, fontSize: `${12 * cardTextScale}px` }}>
                {tHajj('umrahIntroDesc', language)}
            </p>
        </div>

        {/* Card: Virtues */}
        <div 
            className="rounded-[18px] overflow-hidden border-0" 
            style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
        >
            <button 
                type="button"
                onClick={() => setShowVirtues(!showVirtues)}
                className="w-full p-4.5 flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-start cursor-pointer border-0"
            >
                <div>
                    <h3 className="font-bold text-sm" style={{ color: tokens.textColor, fontSize: `${14.5 * cardTextScale}px` }}>
                        {tHajj('umrahVirtuesTitle', language)}
                    </h3>
                    <p className="text-[11px] opacity-70" style={{ color: tokens.subtextColor, fontSize: `${11 * cardTextScale}px` }}>
                        {tHajj('umrahVirtuesSubtitle', language)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onZoom({
                                title: tHajj('umrahVirtuesTitle', language),
                                subtitle: tHajj('umrahVirtuesSubtitle', language),
                                points: virtuesList.map(v => `<b>${v.title}</b> (${v.source}):<br/>${v.text}<br/><span style="opacity:0.8">${v.explanation}</span>`)
                            });
                        }}
                        className="p-1.5 opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition cursor-pointer border-0"
                        title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                        style={{ color: tokens.textColor }}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    {showVirtues ? <ChevronUp size={18} style={{ color: tokens.textColor }} /> : <ChevronDown size={18} style={{ color: tokens.textColor }} />}
                </div>
            </button>

            {showVirtues && (
                <div className="p-4 border-t border-slate-100 dark:border-zinc-800 space-y-3 text-start">
                    {virtuesList.map((v, i) => (
                        <div key={i} className="p-3.5 rounded-xl border-0 space-y-1.5" style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold" style={{ color: tokens.primaryColor, fontSize: `${13 * cardTextScale}px` }}>{v.title}</span>
                                <span className="text-[10px] opacity-60 font-mono">{v.source}</span>
                            </div>
                            <p className={`text-sm font-semibold text-amber-700 dark:text-amber-300 ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ fontSize: `${14 * cardTextScale}px` }}>{v.text}</p>
                            <p className="text-xs opacity-80 leading-relaxed" style={{ color: tokens.textColor, fontSize: `${12 * cardTextScale}px` }}>{v.explanation}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* General Info Grid: Arkan, Wajibat, Sunan, Mufsidat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
                type="button"
                onClick={() => onSelectDetail({
                    title: isEn ? 'The Three Pillars of Umrah' : 'أركان العمرة الثلاثة',
                    subtitle: isEn ? 'Umrah is invalid without them and cannot be compensated by animal sacrifice' : 'لا تصح العمرة إلا بها ولا تُجبر بدم بإجماع العلماء',
                    points: generalInfo.arkan,
                    quranAyah: isEn ? '﴿ And complete the Hajj and \'Umrah for Allah ﴾ [Al-Baqarah: 196]' : '﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾ [البقرة: 196]، وقوله تعالى: ﴿ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ ﴾ [الحج: 29]',
                    hadith: isEn ? 'The Prophet ﷺ said: «Actions are judged by intentions», and: «Perform Sa\'i, for Allah has prescribed Sa\'i upon you»' : 'قال رسول الله ﷺ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» وقال: «اسْعَوْا فَإِنَّ اللهَ كَتَبَ عَلَيْكُمُ السَّعْيَ»'
                })}
                className="rounded-[18px] p-4 text-start hover:scale-[1.02] transition-all group cursor-pointer border-0" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: tokens.primaryColor, fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('pillarsLabel', language)} (3)
                    </span>
                    <ZoomIn size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] opacity-75 line-clamp-2" style={{ color: tokens.subtextColor, fontSize: `${11 * cardTextScale}px` }}>
                    {isEn ? 'Ihram, Tawaf (7 circuits), Sa\'i (7 laps)' : 'الإحرام، الطواف 7 أشواط، السعي 7 أشواط'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    title: isEn ? 'Obligations of Umrah (Wajibat)' : 'واجبات العمرة',
                    subtitle: isEn ? 'Omitting an obligation requires a sacrificial penalty (dam) and Umrah remains valid' : 'من ترك واجباً لزمه دم (شاة) وعمرته صحيحة',
                    points: generalInfo.wajibat,
                    hadith: isEn ? 'The Prophet ﷺ said: «These boundaries are for their people and whoever passes them...» and: «O Allah, have mercy on those who shave their heads»' : 'قال رسول الله ﷺ: «هُنَّ لَهُنَّ، وَلِمَنْ أَتَى عَلَيْهِنَّ...» وقال: «اللَّهُمَّ ارْحَمِ المُحَلِّقِينَ»'
                })}
                className="rounded-[18px] p-4 text-start hover:scale-[1.02] transition-all group cursor-pointer border-0" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: tokens.primaryColor, fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('obligationsLabel', language)} (2)
                    </span>
                    <ZoomIn size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] opacity-75 line-clamp-2" style={{ color: tokens.subtextColor, fontSize: `${11 * cardTextScale}px` }}>
                    {isEn ? 'Ihram from the Miqat, Shaving or Trimming hair' : 'الإحرام من الميقات، الحلق أو التقصير'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    title: isEn ? 'Prophetic Sunnahs of Umrah' : 'سنن وآداب العمرة النبوية',
                    subtitle: isEn ? 'Recommended acts that multiply rewards in following the Prophet ﷺ' : 'أعمال مستحبة تزيد في الأجر والاقتداء بالنبي ﷺ',
                    points: generalInfo.sunan,
                    hadith: isEn ? 'The Messenger of Allah ﷺ frequently chanted the Talbiyah, uncovered his right shoulder, and quickened his pace in the first three circuits of Tawaf.' : 'كان رسول الله ﷺ يكثر من التلبية ويضطبع ويرمل في الثلاثة أشواط الأولى في طواف العمرة'
                })}
                className="rounded-[18px] p-4 text-start hover:scale-[1.02] transition-all group cursor-pointer border-0" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: tokens.primaryColor, fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('sunnahsLabel', language)} (8)
                    </span>
                    <ZoomIn size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] opacity-75 line-clamp-2" style={{ color: tokens.subtextColor, fontSize: `${11 * cardTextScale}px` }}>
                    {isEn ? 'Ghusl, Perfume, Talbiyah, Ramal, Idtiba\'...' : 'الغسل، الطيب، التلبية، الرمل، الاضطباع...'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    title: isEn ? 'Prohibitions & Nullifiers of Umrah' : 'مفسدات ومحظورات العمرة',
                    subtitle: isEn ? 'Acts that invalidate Umrah or incur an expiation' : 'أعمال تبطل العمرة أو توجب الفدية',
                    points: generalInfo.mufsidat,
                    quranAyah: isEn ? '﴿ So whoever has made Hajj obligatory upon himself therein, there is [to be for him] no sexual relations and no disobedience and no disputing during Hajj ﴾ [Al-Baqarah: 197]' : '﴿ فَمَن فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ ﴾ [البقرة: 197]'
                })}
                className="rounded-[18px] p-4 text-start hover:scale-[1.02] transition-all group cursor-pointer border-0" 
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-orange-600 dark:text-orange-400" style={{ fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('prohibitionsLabel', language)} (3)
                    </span>
                    <ZoomIn size={14} className="text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] opacity-75 line-clamp-2 text-orange-950 dark:text-orange-200" style={{ fontSize: `${11 * cardTextScale}px` }}>
                    {isEn ? 'Marital relations before Tahallul, missing a pillar...' : 'الجماع قبل التحلل، ترك ركن، ارتكاب المحظورات'}
                </p>
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
                    className="w-full text-start rounded-[18px] p-4.5 flex items-center justify-between gap-3.5 hover:shadow-md transition-all group border-0"
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                >
                    <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onSelectDetail(step)}
                    >
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

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => onZoom({
                                title: step.title,
                                subtitle: step.subtitle,
                                points: step.points,
                                quranAyah: step.quranAyah,
                                hadith: step.hadith
                            })}
                            className="p-2 rounded-xl opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer border-0"
                            title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                            style={{ color: tokens.textColor }}
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onSelectDetail(step)}
                            className="p-1 cursor-pointer border-0"
                        >
                            <ChevronRight size={18} className="opacity-40 group-hover:opacity-75 transition-opacity rtl:rotate-180" style={{ color: tokens.textColor }} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </section>
    );
};

const HajjScreen = ({ hajjType, setHajjType, onSelectDetail, cardTextScale, onZoom, tokens }: { hajjType: any, setHajjType: any, onSelectDetail: any, cardTextScale: number, onZoom: (data: CardZoomData) => void, tokens: any }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';

    const rawTypes = isEn ? hajjTypesEn : hajjTypes;
    const typesList = Object.entries(rawTypes).map(([id, val]) => ({ id, ...(val as any) }));
    const tamattuPlan = isEn ? hajjTamattuPlanEn : hajjTamattuPlan;
    const ifradPlan = isEn ? hajjIfradPlanEn : hajjIfradPlan;
    const qiranPlan = isEn ? hajjQiranPlanEn : hajjQiranPlan;
    const generalInfo = isEn ? hajjGeneralInfoEn : hajjGeneralInfo;

    const currentType = typesList.find((t: any) => t.id === hajjType) || typesList[0];

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
            <p className="text-xs opacity-75 mt-1 px-4" style={{ color: tokens.textColor, fontSize: `${12 * cardTextScale}px` }}>
                {tHajj('hajjIntroDesc', language)}
            </p>
        </div>

        {/* 3 Types Segmented Selection */}
        <div className="space-y-3">
            <h3 className="text-base font-bold text-start" style={{ color: tokens.textColor, fontSize: `${16 * cardTextScale}px` }}>
                <span>{tHajj('hajjTypesSectionTitle', language)}</span>
            </h3>

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
                            <span className="block text-[10px] opacity-80 mt-0.5 truncate">{t.badge}</span>
                        </button>
                    );
                })}
            </div>

            {/* Selected type card */}
            {currentType && (
                <div 
                    className="rounded-[18px] p-5 space-y-4 text-start relative border-0" 
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                        <div className="pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-lg md:text-xl font-bold" style={{ color: tokens.primaryColor, fontSize: `${18 * cardTextScale}px` }}>
                                    {currentType.name}
                                </h4>
                                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-0">
                                    {currentType.badge}
                                </span>
                            </div>
                            <p className="text-xs opacity-80 mt-1 leading-relaxed" style={{ color: tokens.subtextColor, fontSize: `${12.5 * cardTextScale}px` }}>
                                {currentType.definition}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => onZoom({
                                    title: currentType.name,
                                    subtitle: currentType.badge,
                                    definition: currentType.definition,
                                    quranEvidence: currentType.quranEvidence,
                                    sunnahEvidence: currentType.sunnahEvidence,
                                    hadyRuling: currentType.hadyRuling,
                                    points: currentType.detailedSteps
                                })}
                                className="p-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer border-0"
                                title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                style={{ color: tokens.textColor }}
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>

                            <button 
                                type="button"
                                onClick={() => onSelectDetail({
                                    title: `${currentType.name} - ${isEn ? 'Complete Proof & Steps' : 'الدليل والأحكام الكاملة'}`,
                                    subtitle: currentType.badge,
                                    definition: currentType.definition,
                                    quranEvidence: currentType.quranEvidence,
                                    sunnahEvidence: currentType.sunnahEvidence,
                                    hadyRuling: currentType.hadyRuling,
                                    whoIsItFor: currentType.whoIsItFor,
                                    detailedSteps: currentType.detailedSteps,
                                    comparison: currentType.comparison
                                })}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer border-0"
                                style={{ 
                                    backgroundColor: tokens.primaryColor, 
                                    color: '#FFFFFF' 
                                }}
                            >
                                <span>{tHajj('viewFullEvidenceBtn', language)}</span>
                            </button>
                        </div>
                    </div>

                    {/* Evidences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border-0 space-y-1.5">
                            <span className="font-bold text-xs flex items-center gap-1.5 text-amber-700 dark:text-amber-300" style={{ fontSize: `${12.5 * cardTextScale}px` }}>
                                {tHajj('quranEvidenceTitle', language)}
                            </span>
                            {currentType.quranEvidence.map((ev: string, idx: number) => (
                                <p key={idx} className={`text-xs md:text-sm leading-relaxed text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ fontSize: `${13 * cardTextScale}px` }}>
                                    {ev}
                                </p>
                            ))}
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border-0 space-y-1.5">
                            <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300" style={{ fontSize: `${12.5 * cardTextScale}px` }}>
                                {tHajj('sunnahEvidenceTitle', language)}
                            </span>
                            {currentType.sunnahEvidence.slice(0, 2).map((ev: string, idx: number) => (
                                <p key={idx} className={`text-xs leading-relaxed text-emerald-950 dark:text-emerald-200 ${isEn ? 'font-sans' : ''}`} style={{ fontSize: `${13 * cardTextScale}px` }}>
                                    {ev}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Timeline */}
        <div className="pt-2">
            <h3 className="text-base font-bold mb-3 text-start" style={{ color: tokens.textColor, fontSize: `${16 * cardTextScale}px` }}>
                <span>{tHajj('hajjTimelineSectionTitle', language)}</span>
            </h3>
            <div className="space-y-3">
                {(hajjType === 'tamattu' ? tamattuPlan : hajjType === 'ifrad' ? ifradPlan : qiranPlan).map((day: any, i: number) => (
                    <div 
                        key={i} 
                        className="w-full text-start rounded-[18px] p-4.5 flex items-center justify-between gap-3.5 hover:shadow-md transition-all group border-0"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => onSelectDetail({ 
                                title: day.day, 
                                subtitle: day.summary,
                                evidence: day.evidence,
                                points: day.actions
                            })}
                        >
                            <h5 className="font-bold text-sm md:text-base" style={{ color: tokens.textColor, fontSize: `${15 * cardTextScale}px` }}>{day.day}</h5>
                            <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: tokens.subtextColor, fontSize: `${12 * cardTextScale}px` }}>{day.summary}</p>
                            {day.evidence && (
                                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-1 truncate" style={{ fontSize: `${11 * cardTextScale}px` }}>
                                    {day.evidence}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => onZoom({
                                    title: day.day,
                                    subtitle: day.summary,
                                    evidence: day.evidence,
                                    points: day.actions
                                })}
                                className="p-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer border-0"
                                title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                style={{ color: tokens.textColor }}
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onSelectDetail({ 
                                    title: day.day, 
                                    subtitle: day.summary,
                                    evidence: day.evidence,
                                    points: day.actions
                                })}
                                className="p-1 cursor-pointer border-0"
                            >
                                <ChevronRight size={18} className="opacity-40 group-hover:opacity-75 transition-opacity rtl:rotate-180" style={{ color: tokens.textColor }} />
                            </button>
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
    const [selectedDetail, setSelectedDetail] = useState<any>(null);
    const [openDuaaId, setOpenDuaaId] = useState<number | null>(1);
    const [tawafState, setTawafState] = useState(getTawafCounterState());

    useEffect(() => {
        const target = navParams?.screen || navParams?.tab || navParams?.initialScreen;
        if (target && ['home', 'umrah', 'hajj', 'duaa', 'checklist', 'counters'].includes(target)) {
            setScreen(target);
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
        setZoomFontSize(26);
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
        if (zoomedCard.hadith) parts.push(zoomedCard.hadith);
        if (zoomedCard.text) parts.push(zoomedCard.text.replace(/<[^>]*>/g, ''));
        if (zoomedCard.definition) parts.push(zoomedCard.definition);
        if (zoomedCard.description) parts.push(zoomedCard.description);
        if (zoomedCard.evidence) parts.push(zoomedCard.evidence);
        if (zoomedCard.hadyRuling) parts.push(zoomedCard.hadyRuling);
        if (zoomedCard.whoIsItFor) parts.push(zoomedCard.whoIsItFor);
        if (zoomedCard.points) parts.push(...zoomedCard.points.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
        if (zoomedCard.detailedSteps) parts.push(...zoomedCard.detailedSteps.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
        if (zoomedCard.quranEvidence) parts.push(...zoomedCard.quranEvidence);
        if (zoomedCard.sunnahEvidence) parts.push(...zoomedCard.sunnahEvidence);
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
            if (zoomedCard.hadith) parts.push(zoomedCard.hadith);
            if (zoomedCard.text) parts.push(zoomedCard.text.replace(/<[^>]*>/g, ''));
            if (zoomedCard.definition) parts.push(zoomedCard.definition);
            if (zoomedCard.description) parts.push(zoomedCard.description);
            if (zoomedCard.evidence) parts.push(zoomedCard.evidence);
            if (zoomedCard.points) parts.push(...zoomedCard.points.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
            if (zoomedCard.detailedSteps) parts.push(...zoomedCard.detailedSteps.map(p => `• ${p.replace(/<[^>]*>/g, '')}`));
            textToShare = parts.join('\n\n');
        }
        await shareAsImage({
            title: zoomedCard.title,
            text: textToShare,
            category: isEn ? "Hajj & Umrah Guide" : "دليل الحج والعمرة",
            theme,
            isEn,
            language: isEn ? 'en' : 'ar'
        });
    };

    const handleToggleZoomFontSize = () => {
        setZoomFontSize(prev => (prev >= 30 ? 17 : prev + 3));
    };

    useEffect(() => {
        const interceptor = () => {
            if (zoomedCard) {
                closeZoomModal();
                return true;
            }
            if (selectedDetail) {
                setSelectedDetail(null);
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
    }, [screen, zoomedCard, selectedDetail]);

    const handleBack = () => {
        if (zoomedCard) {
            closeZoomModal();
        } else if (selectedDetail) {
            setSelectedDetail(null);
        } else if (screen !== 'home') {
            setScreen('home');
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (zoomedCard) closeZoomModal();
        if (selectedDetail) setSelectedDetail(null);
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
                return <UmrahScreen key="umrah" tokens={tokens} onSelectDetail={setSelectedDetail} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'hajj': 
                return <HajjScreen key="hajj" hajjType={hajjType} setHajjType={setHajjType} tokens={tokens} onSelectDetail={setSelectedDetail} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
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
        <div className="h-screen flex flex-col" style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: theme.font }} dir={dir}>
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

                            {screen === 'counters' && (
                                <button
                                    type="button"
                                    onClick={toggleTawafHomeVisibility}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer shrink-0"
                                    title={
                                        isEn 
                                            ? (tawafState.showOnHome ? 'Tawaf Counter on Home: Enabled (Click to disable)' : 'Tawaf Counter on Home: Disabled (Click to enable)') 
                                            : (tawafState.showOnHome ? 'ظهور عداد الطواف في الرئيسية: مفعّل (اضغط للتعطيل)' : 'ظهور عداد الطواف في الرئيسية: معطّل (اضغط للتفعيل)')
                                    }
                                >
                                    <div className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full border-[1.5px] border-white/90 shadow-xs transition-all flex items-center justify-center ${
                                        tawafState.showOnHome ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                        {tawafState.showOnHome ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" /> : <span className="w-1.5 h-0.5 bg-white rounded-full" />}
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Screen Title */}
                        <div className={`text-center ${screen === 'counters' ? 'px-28 sm:px-32' : 'px-20'} min-w-0 max-w-full`}>
                            <h1 className="app-top-bar__title text-base sm:text-xl font-bold truncate">
                                {getScreenTitle()}
                            </h1>
                        </div>

                        {/* Right Tools: Guide & Home Button */}
                        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} flex items-center gap-0.5 sm:gap-1 z-10`}>
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

            <main className="w-full max-w-4xl mx-auto px-4 pt-3 flex-1 overflow-y-auto pb-6 hide-scrollbar">
                {renderScreen()}
                <div className="w-full h-6 shrink-0"></div>
            </main>

            {/* Selected Detail Modal - Sliding Modal Bottom Sheet */}
            <AnimatePresence>
                {selectedDetail && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden" 
                        onClick={() => setSelectedDetail(null)}
                    >
                        <motion.div 
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            className="w-full max-w-xl rounded-t-[28px] sm:rounded-[24px] overflow-hidden flex flex-col max-h-[88vh] shadow-2xl border-0"
                            style={{ backgroundColor: tokens.cardBgColor, color: tokens.textColor }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Drag handle */}
                            <div className="pt-3 pb-1 flex justify-center sm:hidden">
                                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                            </div>

                            {/* Header */}
                            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="text-start pr-2">
                                    <h3 className="text-lg md:text-xl font-bold leading-tight" style={{ color: tokens.textColor, fontSize: `${18 * cardTextScale}px` }}>
                                        {selectedDetail.title}
                                    </h3>
                                    {selectedDetail.subtitle && (
                                        <p className="text-xs opacity-75 mt-0.5" style={{ color: tokens.subtextColor, fontSize: `${12 * cardTextScale}px` }}>
                                            {selectedDetail.subtitle}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const detailCopy = { ...selectedDetail };
                                            setSelectedDetail(null);
                                            openZoomModal(detailCopy);
                                        }}
                                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer border-0"
                                        title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                        style={{ color: tokens.textColor }}
                                    >
                                        <ZoomIn className="w-5 h-5" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedDetail(null)} 
                                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer border-0"
                                    >
                                        <X size={20} style={{ color: tokens.textColor }} />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-start hide-scrollbar">
                                {/* Quranic Verse Callout */}
                                {(selectedDetail.quranAyah || selectedDetail.evidence || (selectedDetail.quranEvidence && selectedDetail.quranEvidence.length > 0)) && (
                                    <div className="p-4 rounded-[16px] bg-amber-500/10 border-0">
                                        <div className="mb-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs" style={{ fontSize: `${12 * cardTextScale}px` }}>
                                            <span>{tHajj('quranEvidenceSection', language)}</span>
                                        </div>
                                        {selectedDetail.quranAyah && (
                                            <p className={`text-base md:text-lg leading-[2.2] text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ fontSize: `${16 * cardTextScale}px` }}>
                                                {selectedDetail.quranAyah}
                                            </p>
                                        )}
                                        {selectedDetail.evidence && !selectedDetail.quranAyah && (
                                            <p className={`text-sm md:text-base leading-[2.2] text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ fontSize: `${14 * cardTextScale}px` }}>
                                                {selectedDetail.evidence}
                                            </p>
                                        )}
                                        {selectedDetail.quranEvidence && selectedDetail.quranEvidence.map((ev: string, idx: number) => (
                                            <p key={idx} className={`text-base leading-[2.2] text-amber-900 dark:text-amber-200 mt-1 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ fontSize: `${15 * cardTextScale}px` }}>
                                                {ev}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {/* Hadith Callout */}
                                {(selectedDetail.hadith || (selectedDetail.sunnahEvidence && selectedDetail.sunnahEvidence.length > 0)) && (
                                    <div className="p-4 rounded-[16px] bg-emerald-500/10 border-0">
                                        <div className="mb-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs" style={{ fontSize: `${12 * cardTextScale}px` }}>
                                            <span>{tHajj('sunnahEvidenceSection', language)}</span>
                                        </div>
                                        {selectedDetail.hadith && (
                                            <p className={`text-sm md:text-base leading-[2.2] text-emerald-950 dark:text-emerald-200 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ fontSize: `${14 * cardTextScale}px` }}>
                                                {selectedDetail.hadith}
                                            </p>
                                        )}
                                        {selectedDetail.sunnahEvidence && selectedDetail.sunnahEvidence.map((ev: string, idx: number) => (
                                            <p key={idx} className={`text-sm md:text-base leading-[2.2] text-emerald-950 dark:text-emerald-200 mt-2 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ fontSize: `${14 * cardTextScale}px` }}>
                                                {ev}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {/* Fiqhi Definition or Summary */}
                                {(selectedDetail.definition || selectedDetail.description) && (
                                    <div className="p-4 rounded-[16px] bg-blue-500/10 border-0">
                                        <div className="mb-1 text-blue-700 dark:text-blue-400 font-bold text-xs" style={{ fontSize: `${12 * cardTextScale}px` }}>
                                            <span>{tHajj('fiqhDefSection', language)}</span>
                                        </div>
                                        <p className="text-sm leading-relaxed" style={{ color: tokens.textColor, fontSize: `${13.5 * cardTextScale}px` }}>
                                            {selectedDetail.definition || selectedDetail.description}
                                        </p>
                                    </div>
                                )}

                                {/* Step points / Actions */}
                                {(selectedDetail.points || selectedDetail.actions || selectedDetail.detailedSteps) && (
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-xs mb-2" style={{ color: tokens.primaryColor, fontSize: `${13 * cardTextScale}px` }}>
                                            {tHajj('practicalStepsSection', language)}
                                        </h4>
                                        <ul className="space-y-2.5">
                                            {(selectedDetail.points || selectedDetail.actions || selectedDetail.detailedSteps).map((point: string, i: number) => (
                                                <li key={i} className="flex gap-3 p-3.5 rounded-[14px] border-0" style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}>
                                                    <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm" style={{ backgroundColor: tokens.primaryColor, color: '#FFFFFF' }}>
                                                        {i + 1}
                                                    </div>
                                                    <p className="flex-1 text-sm leading-relaxed" style={{ color: tokens.textColor, fontSize: `${13.5 * cardTextScale}px` }} dangerouslySetInnerHTML={{ __html: point }}></p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Footer Button */}
                            <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
                                <button 
                                    type="button"
                                    onClick={() => setSelectedDetail(null)} 
                                    className="w-full py-3.5 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer border-0"
                                    style={{ backgroundColor: tokens.primaryColor, color: '#FFFFFF' }}
                                >
                                    {tHajj('understoodBtn', language)}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Magnifier / Zoom Modal for Cards Text - Sliding Modal Bottom Sheet */}
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
                            className="w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[85vh] overflow-hidden relative shadow-2xl" 
                            style={{ backgroundColor: tokens.cardBgColor, color: tokens.textColor }} 
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
                                        {zoomedCard.subtitle || (isEn ? "Hajj & Umrah" : "الحج والعمرة")}
                                    </span>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="overflow-y-auto flex-1 py-3 px-6 space-y-4 hide-scrollbar">
                                {zoomedCard.title && (
                                    <h3 className="text-base sm:text-lg font-bold mb-1 text-center" style={{ color: tokens.primaryColor }}>
                                        {zoomedCard.title}
                                    </h3>
                                )}
                                {/* Special Duaa / Dhikr Mode with Next/Prev */}
                                {zoomedCard.duaaItems && zoomedCard.duaaItems.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="p-5 rounded-[18px] bg-emerald-500/10 border-0 text-start space-y-3">
                                            {isEn ? (
                                                <p className="leading-[2.2] font-medium text-emerald-950 dark:text-emerald-100" style={{ fontSize: `${zoomFontSize}px` }}>
                                                    {getDuaaEnglish(zoomedCard.duaaItems[currentDuaaIdx])}
                                                </p>
                                            ) : (
                                                <p className="leading-[2.3] font-amiri font-bold text-emerald-950 dark:text-emerald-100 text-center" style={{ fontSize: `${zoomFontSize + 4}px` }}>
                                                    {zoomedCard.duaaItems[currentDuaaIdx]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Primary Text */}
                                        {zoomedCard.text && (
                                            <div 
                                                className="leading-[2.2] font-medium select-text" 
                                                style={{ fontSize: `${zoomFontSize}px`, color: tokens.textColor }}
                                                dangerouslySetInnerHTML={{ __html: zoomedCard.text.replaceAll('{{THEME_PALETTE_0}}', tokens.primaryColor) }}
                                            />
                                        )}

                                        {/* Points / Steps */}
                                        {(zoomedCard.points || zoomedCard.actions || zoomedCard.detailedSteps) && (
                                            <ul className="space-y-2.5">
                                                {(zoomedCard.points || zoomedCard.actions || zoomedCard.detailedSteps)!.map((point, i) => (
                                                    <li key={i} className="flex gap-3 p-3.5 rounded-[14px] border-0" style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}>
                                                        <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs" 
                                                              style={{ backgroundColor: tokens.primaryColor, color: '#FFFFFF' }}>
                                                            {i + 1}
                                                        </span>
                                                        <div className="flex-1 leading-relaxed font-medium" style={{ fontSize: `${zoomFontSize}px`, color: tokens.textColor }} dangerouslySetInnerHTML={{ __html: point }} />
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                )}

                                {copySuccess && (
                                    <p className="text-xs font-bold text-emerald-500 animate-pulse text-center">
                                        {tHajj('copiedSuccess', language)}
                                    </p>
                                )}
                            </div>

                            {/* Modal Footer with safe-area padding to avoid phone buttons */}
                            <div 
                                className="mt-3 shrink-0 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3"
                                style={{
                                    paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'
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
                                    {/* Share */}
                                    <button
                                        type="button"
                                        onClick={handleShareZoomText}
                                        className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0"
                                        style={{ color: tokens.textColor }}
                                        title={isEn ? "Share as Image" : "مشاركة كصورة"}
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>

                                    {/* Copy */}
                                    <button
                                        type="button"
                                        onClick={handleCopyZoomText}
                                        className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0"
                                        style={{ color: copySuccess ? '#10B981' : tokens.textColor }}
                                        title={isEn ? "Copy text" : "نسخ النص"}
                                    >
                                        {copySuccess ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                    </button>

                                    {/* Zoom */}
                                    <button
                                        type="button"
                                        onClick={handleToggleZoomFontSize}
                                        className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0"
                                        style={{ color: tokens.textColor }}
                                        title={isEn ? "Enlarge font" : "تكبير الخط"}
                                    >
                                        <ZoomIn className="w-5 h-5" />
                                    </button>

                                    {/* ChevronDown to hide modal */}
                                    <button
                                        type="button"
                                        onClick={closeZoomModal}
                                        className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0"
                                        style={{ color: tokens.textColor }}
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
