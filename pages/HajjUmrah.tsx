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
    Copy, Check, HelpCircle
} from 'lucide-react';
import { getTawafCounterState, saveTawafCounterState, subscribeTawafCounter } from '../utils/tawafCounterStorage';
import { 
    tHajj, getDuaaEnglish, CHECKLIST_ITEMS_EN, 
    DUAA_CATEGORY_TITLES_EN, HOME_ADDITIONS_EN 
} from '../utils/hajjUmrahTranslations';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { HAJJ_UMRAH_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

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
    cardBorderColor?: string;
    cardTextScale: number;
}

const DuaaSection: FC<DuaaSectionProps> = ({ id, title, items, isOpen, onToggle, onZoom, cardBorderColor, cardTextScale }) => {
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
        <div id={`duaa-section-${id}`} className="themed-card rounded-2xl overflow-hidden mb-3 backdrop-blur-sm" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <button 
                type="button"
                onClick={onToggle} 
                className="w-full flex justify-between items-center p-4 bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
                <span className={`font-bold text-base md:text-lg ${isEn ? 'text-left' : 'text-right'}`} style={{ color: 'var(--text-color)', fontSize: `${16 * cardTextScale}px` }}>
                    {displayTitle}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 opacity-70" style={{ color: 'var(--text-color)' }} />
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
                        <div className="p-4 bg-white/10 dark:bg-gray-900/20">
                            <div className="flex flex-col gap-4 p-5 rounded-xl bg-white/10 dark:bg-gray-800/40 shadow-sm relative min-h-[160px] justify-center items-center text-center" style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}>
                                <span className={`absolute top-3 ${isRTL ? 'right-4' : 'left-4'} text-xs font-bold opacity-60 font-mono`} style={{ color: 'var(--text-color)' }}>
                                    {currentIndex + 1} / {items.length}
                                </span>
                                <button 
                                    type="button"
                                    onClick={handleZoomClick} 
                                    className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} p-2 shrink-0 opacity-80 hover:opacity-100 hover:bg-black/10 transition-opacity rounded-full dark:hover:bg-gray-700 cursor-pointer`} 
                                    title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                
                                <div className="mt-6 mb-2 space-y-3 w-full">
                                    {isEn ? (
                                        <p className="text-sm md:text-base leading-relaxed text-emerald-800 dark:text-emerald-300 font-medium px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-start"
                                           style={{ fontSize: `${14 * cardTextScale}px` }}>
                                            {currentEnglishTranslation}
                                        </p>
                                    ) : (
                                        <p className="text-lg md:text-xl leading-loose font-amiri font-bold" style={{ color: 'var(--text-color)', fontSize: `${18 * cardTextScale}px` }}>
                                            {currentArabicItem}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex w-full justify-between items-center mt-2 border-t border-black/10 dark:border-white/10 pt-3">
                                    <button 
                                        type="button"
                                        onClick={handleNext}
                                        disabled={currentIndex === items.length - 1}
                                        className="p-2 px-3 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm"
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        {!isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                        <span>{tHajj('nextDuaa', language)}</span>
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className="p-2 px-3 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm"
                                        style={{ color: 'var(--text-color)' }}
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

const ChecklistScreen = ({ theme, cardBorderColor, cardTextScale, onZoom }: { theme: any, cardBorderColor?: string, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';
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
            <div className="rounded-2xl p-4 text-center backdrop-blur-sm relative" style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <p className="text-sm opacity-90 font-bold px-4" style={{ color: 'var(--text-color)', fontSize: `${14 * cardTextScale}px` }}>
                    {tHajj('checklistHeader', language)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                    <div key={i} className="themed-card backdrop-blur-md rounded-xl p-3 relative" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <div className="flex items-center justify-between border-b pb-1 mb-2" style={{ borderColor: isBlackTheme ? 'rgba(255,255,255,0.2)' : `${theme.palette[0]}20` }}>
                            <h3 className="font-bold text-base text-start" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0], fontSize: `${15 * cardTextScale}px` }}>
                                {cat.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => onZoom({
                                    title: cat.title,
                                    points: cat.items.map(item => isEn ? (CHECKLIST_ITEMS_EN[item.id] || item.ar) : item.ar)
                                })}
                                className="p-1 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
                                title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                style={{ color: 'var(--text-color)' }}
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
                                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-700 transition-all border border-transparent cursor-pointer"
                                        style={{ borderColor: checkedItems[item.id] ? (isBlackTheme ? 'rgba(255,255,255,0.3)' : `${theme.palette[0]}20`) : 'transparent' }}
                                    >
                                        <div className={`shrink-0 w-4 h-4 rounded-md flex items-center justify-center transition-colors ${checkedItems[item.id] ? '' : 'border-2 border-gray-300/50 dark:border-gray-600'}`}
                                             style={{ backgroundColor: checkedItems[item.id] ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent' }}>
                                            {checkedItems[item.id] && <Check size={10} className={isBlackTheme ? "text-black" : "text-white"} />}
                                        </div>
                                        <span className={`text-sm text-start leading-relaxed font-medium transition-opacity flex-1 ${checkedItems[item.id] ? 'opacity-40 line-through' : ''}`} style={{ color: 'var(--text-color)', fontSize: `${13.5 * cardTextScale}px` }}>
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

const CountersScreen = ({ theme, cardBorderColor, cardTextScale, onZoom }: { theme: any, cardBorderColor?: string, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language } = useLanguage();
    const isBlackTheme = theme.bgColor === '#000000';
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
                className="backdrop-blur-md rounded-2xl p-4 text-center transition-all relative" 
                style={{ 
                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, 
                    borderColor: cardBorderColor, 
                    borderWidth: '1.5px', 
                    borderStyle: 'solid' 
                }}
            >

                <h3 className="font-bold text-base mb-1" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0], fontSize: `${16 * cardTextScale}px` }}>
                    {tHajj('counterHeaderTitle', language)}
                </h3>
                <p className="text-xs opacity-80 px-6" style={{ color: 'var(--text-color)', fontSize: `${13 * cardTextScale}px` }}>
                    {tHajj('counterHeaderDesc', language)}
                </p>
            </div>

            {/* Tawaf vs Sa'i switch */}
            <div className="flex bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl p-1 rounded-2xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <button 
                    type="button"
                    onClick={() => switchTab('tawaf')} 
                    className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-sm ${state.activeTab === 'tawaf' ? (isBlackTheme ? 'text-black shadow-lg' : 'text-white shadow-lg') : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: state.activeTab === 'tawaf' ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent',
                        color: state.activeTab === 'tawaf' ? (isBlackTheme ? 'black' : 'white') : 'var(--text-color)',
                        fontSize: `${13 * cardTextScale}px`
                    }}
                >
                    {tHajj('tabTawaf', language)} ({state.tawafCount}/7)
                </button>
                <button 
                    type="button"
                    onClick={() => switchTab('sai')} 
                    className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-sm ${state.activeTab === 'sai' ? (isBlackTheme ? 'text-black shadow-lg' : 'text-white shadow-lg') : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: state.activeTab === 'sai' ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent',
                        color: state.activeTab === 'sai' ? (isBlackTheme ? 'black' : 'white') : 'var(--text-color)',
                        fontSize: `${13 * cardTextScale}px`
                    }}
                >
                    {tHajj('tabSai', language)} ({state.saiCount}/7)
                </button>
            </div>

            {/* Circular Counter Box */}
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-5 flex flex-col items-center justify-center shadow-xl min-h-[240px]" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                {/* 7 Laps progress bar */}
                <div className="w-full max-w-xs flex items-center justify-between gap-1.5 mb-4 px-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((lap) => {
                        const isPassed = lap <= currentCount;
                        const isCurrent = lap === currentCount + 1 && !isComplete;
                        return (
                            <div key={lap} className="flex-1 flex flex-col items-center gap-1">
                                <div 
                                    className={`w-full h-3.5 rounded-full transition-all duration-300 ${
                                        isPassed 
                                            ? 'shadow-sm' 
                                            : isCurrent 
                                            ? 'ring-2 ring-amber-400 ring-offset-1 animate-pulse shadow-sm' 
                                            : 'bg-black/10 dark:bg-white/10 opacity-30'
                                    }`}
                                    style={{
                                        backgroundColor: isPassed 
                                            ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) 
                                            : isCurrent 
                                            ? '#f59e0b' 
                                            : undefined
                                    }}
                                />
                                <span className={`text-[10px] font-mono font-bold ${isPassed || isCurrent ? 'opacity-90' : 'opacity-40'}`} style={{ color: 'var(--text-color)' }}>
                                    {lap}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* SVG Progress Circle */}
                <div className="relative mb-5">
                     <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="5" fill="none" className="text-white/10 dark:text-gray-700" />
                        <circle cx="64" cy="64" r="58" stroke={isBlackTheme ? '#FFFFFF' : theme.palette[0]} strokeWidth="5" fill="none" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * currentCount) / 7} style={{ transition: 'stroke-dashoffset 0.5s ease' }} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-bold font-mono" style={{ color: theme.isDark ? '#ffffff' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]), textShadow: isBlackTheme ? '0 0 20px rgba(255,255,255,0.3)' : `0 0 20px ${theme.palette[0]}4D` }}>
                             {currentCount}
                         </span>
                         <span className="text-[10px] font-bold mt-0.5 opacity-60" style={{ color: 'var(--text-color)' }}>
                             {tHajj('ofSevenLaps', language)}
                         </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 w-full max-w-xs">
                    <button 
                        type="button"
                        onClick={reset} 
                        title={tHajj('resetCounterTooltip', language)} 
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center active:scale-95 cursor-pointer"
                    >
                        <RotateCcw size={18} style={{ color: 'var(--text-color)' }} />
                    </button>

                    <button 
                        type="button"
                        onClick={decrement}
                        disabled={currentCount <= 0}
                        title={tHajj('decreaseCounterTooltip', language)} 
                        className={`p-3 bg-white/10 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center active:scale-95 cursor-pointer ${currentCount <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'}`}
                    >
                        <Minus size={18} style={{ color: 'var(--text-color)' }} />
                    </button>

                    <button 
                        type="button"
                        onClick={increment} 
                        disabled={isComplete} 
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base shadow-lg cursor-pointer ${
                            isComplete 
                                ? 'bg-emerald-600 text-white cursor-default' 
                                : 'active:scale-95 text-white'
                        }`}
                        style={{ 
                            backgroundColor: isComplete ? '#16a34a' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]), 
                            color: (isComplete ? '#FFFFFF' : (isBlackTheme ? '#000000' : 'white')) 
                        }}
                    >
                        {isComplete ? <Check size={20} /> : <Plus size={20} />}
                        <span className="text-sm font-bold">
                            {isComplete ? tHajj('sevenLapsCompleted', language) : tHajj('nextLapBtn', language)}
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export function HajjUmrah({ onBack, onNavigate }: { onBack: () => void; onNavigate: (pageId: string) => void }) {
    const { theme, themeKey } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const isEn = language === 'en';

    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));

    const [screen, setScreen] = useState<'home' | 'umrah' | 'hajj' | 'duaa' | 'checklist' | 'counters'>('home');
    const [hajjType, setHajjType] = useState<'tamattu' | 'ifrad' | 'qiran'>('tamattu');
    const [selectedDetail, setSelectedDetail] = useState<any>(null);
    const [openDuaaId, setOpenDuaaId] = useState<number | null>(1);
    
    // Tawaf counter on home screen state
    const [tawafState, setTawafState] = useState(getTawafCounterState());

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
    
    // Zoom Modal State for any card in the page
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

    // Global in-page card font scaling
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
        setZoomFontSize(28);
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
                return <UmrahScreen key="umrah" theme={theme} onSelectDetail={setSelectedDetail} cardBorderColor={cardBorderColor} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'hajj': 
                return <HajjScreen key="hajj" hajjType={hajjType} setHajjType={setHajjType} theme={theme} onSelectDetail={setSelectedDetail} cardBorderColor={cardBorderColor} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'duaa': 
                return <DuaaScreen key="duaa" theme={theme} openDuaaId={openDuaaId} onToggle={handleDuaaToggle} onZoom={openZoomModal} cardBorderColor={cardBorderColor} cardTextScale={cardTextScale} />;
            case 'checklist': 
                return <ChecklistScreen key="checklist" theme={theme} cardBorderColor={cardBorderColor} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            case 'counters': 
                return <CountersScreen key="counters" theme={theme} cardBorderColor={cardBorderColor} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
            default: 
                return <HomeScreen key="home" setScreen={setScreen} theme={theme} cardBorderColor={cardBorderColor} cardTextScale={cardTextScale} onZoom={openZoomModal} />;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent" dir={dir}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back Arrow, Tawaf Home Toggle Indicator & Magnifying Glass */}
                        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} flex items-center gap-1.5`}>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tHajj('back', language)}
                                aria-label={tHajj('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-xl`}></i>
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
                                    <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full bg-emerald-600 text-white leading-tight shadow">
                                        +{Math.round((cardTextScale - 1) * 100)}%
                                    </span>
                                )}
                            </button>

                            {screen === 'counters' && (
                                <button
                                    type="button"
                                    onClick={toggleTawafHomeVisibility}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    title={
                                        isEn 
                                            ? (tawafState.showOnHome ? 'Tawaf Counter on Home: Enabled (Click to disable)' : 'Tawaf Counter on Home: Disabled (Click to enable)') 
                                            : (tawafState.showOnHome ? 'ظهور عداد الطواف في الرئيسية: مفعّل (اضغط للتعطيل)' : 'ظهور عداد الطواف في الرئيسية: معطّل (اضغط للتفعيل)')
                                    }
                                    aria-label={
                                        isEn 
                                            ? (tawafState.showOnHome ? 'Tawaf Counter on Home: Enabled' : 'Tawaf Counter on Home: Disabled') 
                                            : (tawafState.showOnHome ? 'ظهور عداد الطواف في الرئيسية: مفعّل' : 'ظهور عداد الطواف في الرئيسية: معطّل')
                                    }
                                >
                                    <div className={`w-[19px] h-[19px] rounded-full border-[1.5px] border-white/90 dark:border-white/80 shadow-xs transition-all duration-300 flex items-center justify-center ${
                                        tawafState.showOnHome 
                                            ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 text-white shadow-emerald-500/30 ring-1.5 ring-emerald-500/25' 
                                            : 'bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 text-white shadow-red-500/30 ring-1.5 ring-red-500/25'
                                    }`}>
                                        {tawafState.showOnHome ? (
                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        ) : (
                                            <span className="w-1.5 h-0.5 bg-white/95 rounded-full" />
                                        )}
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Screen Title */}
                        <div className="text-center px-16 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {getScreenTitle()}
                            </h1>
                        </div>

                        {/* Right Tools: Guide & Home Button */}
                        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Hajj & Umrah Guide" : "دليل الحج والعمرة"}
                                aria-label={isEn ? "Hajj & Umrah Guide" : "دليل الحج والعمرة"}
                            >
                                <HelpCircle size={19} />
                            </button>

                            {screen === 'home' && <ThemePageLock />}
                            <button
                                type="button"
                                onClick={handleGoHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tHajj('home', language)}
                                aria-label={tHajj('home', language)}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto px-4 pt-2 flex-1 overflow-y-auto pb-6">
                {renderScreen()}
                <div className="w-full h-6 shrink-0"></div>
            </main>

            {/* Selected Detail Modal */}
            {selectedDetail && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-3 md:p-4 overflow-hidden" onClick={() => setSelectedDetail(null)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="themed-card w-full max-w-xl rounded-3xl overflow-hidden flex flex-col max-h-[88vh] shadow-2xl"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15` }}>
                            <div className="text-start pr-2">
                                <h3 className="text-lg md:text-xl font-bold leading-tight" style={{ color: 'var(--text-color)', fontSize: `${18 * cardTextScale}px` }}>
                                    {selectedDetail.title}
                                </h3>
                                {selectedDetail.subtitle && (
                                    <p className="text-xs opacity-75 mt-0.5" style={{ color: 'var(--text-color)', fontSize: `${12 * cardTextScale}px` }}>
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
                                    className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
                                    title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setSelectedDetail(null)} 
                                    className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
                                >
                                    <RotateCcw size={18} className="rotate-45" style={{ color: 'var(--text-color)' }} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-start">
                            {/* Quranic Verse Callout */}
                            {(selectedDetail.quranAyah || selectedDetail.evidence || (selectedDetail.quranEvidence && selectedDetail.quranEvidence.length > 0)) && (
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20">
                                    <div className="mb-2 text-amber-600 dark:text-amber-400 font-bold text-xs" style={{ fontSize: `${12 * cardTextScale}px` }}>
                                        <span>{tHajj('quranEvidenceSection', language)}</span>
                                    </div>
                                    {selectedDetail.quranAyah && (
                                        <p className={`text-base md:text-lg leading-relaxed text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ fontSize: `${16 * cardTextScale}px` }}>
                                            {selectedDetail.quranAyah}
                                        </p>
                                    )}
                                    {selectedDetail.evidence && !selectedDetail.quranAyah && (
                                        <p className={`text-sm md:text-base leading-relaxed text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ fontSize: `${14 * cardTextScale}px` }}>
                                            {selectedDetail.evidence}
                                        </p>
                                    )}
                                    {selectedDetail.quranEvidence && selectedDetail.quranEvidence.map((ev: string, idx: number) => (
                                        <p key={idx} className={`text-base leading-relaxed text-amber-900 dark:text-amber-200 mt-1 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`} style={{ fontSize: `${15 * cardTextScale}px` }}>
                                            {ev}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Hadith Callout */}
                            {(selectedDetail.hadith || (selectedDetail.sunnahEvidence && selectedDetail.sunnahEvidence.length > 0)) && (
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/20">
                                    <div className="mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs" style={{ fontSize: `${12 * cardTextScale}px` }}>
                                        <span>{tHajj('sunnahEvidenceSection', language)}</span>
                                    </div>
                                    {selectedDetail.hadith && (
                                        <p className={`text-sm md:text-base leading-relaxed text-emerald-950 dark:text-emerald-200 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ fontSize: `${14 * cardTextScale}px` }}>
                                            {selectedDetail.hadith}
                                        </p>
                                    )}
                                    {selectedDetail.sunnahEvidence && selectedDetail.sunnahEvidence.map((ev: string, idx: number) => (
                                        <p key={idx} className={`text-sm md:text-base leading-relaxed text-emerald-950 dark:text-emerald-200 mt-2 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ fontSize: `${14 * cardTextScale}px` }}>
                                            {ev}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Fiqhi Definition or Summary */}
                            {(selectedDetail.definition || selectedDetail.description) && (
                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 dark:bg-blue-950/20">
                                    <div className="mb-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs" style={{ fontSize: `${12 * cardTextScale}px` }}>
                                        <span>{tHajj('fiqhDefSection', language)}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', fontSize: `${13.5 * cardTextScale}px` }}>
                                        {selectedDetail.definition || selectedDetail.description}
                                    </p>
                                </div>
                            )}

                            {/* Hady ruling */}
                            {selectedDetail.hadyRuling && (
                                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 dark:bg-purple-950/20">
                                    <div className="mb-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs" style={{ fontSize: `${12 * cardTextScale}px` }}>
                                        <span>{tHajj('hadyRulingSection', language)}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', fontSize: `${13.5 * cardTextScale}px` }}>
                                        {selectedDetail.hadyRuling}
                                    </p>
                                </div>
                            )}

                            {/* Who is it for */}
                            {selectedDetail.whoIsItFor && (
                                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 dark:bg-teal-950/20">
                                    <div className="mb-1.5 text-teal-600 dark:text-teal-400 font-bold text-xs" style={{ fontSize: `${12 * cardTextScale}px` }}>
                                        <span>{tHajj('whoIsItForSection', language)}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', fontSize: `${13.5 * cardTextScale}px` }}>
                                        {selectedDetail.whoIsItFor}
                                    </p>
                                </div>
                            )}

                            {/* Fiqh Comparison */}
                            {selectedDetail.comparison && (
                                <div className="p-4 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/10 space-y-2">
                                    <h4 className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0], fontSize: `${12 * cardTextScale}px` }}>
                                        {tHajj('comparisonSummarySection', language)}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2 text-xs" style={{ fontSize: `${12 * cardTextScale}px` }}>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compIhram', language)}: </span>{selectedDetail.comparison.ihram}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compTahallul', language)}: </span>{selectedDetail.comparison.tahallul}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compTawaf', language)}: </span>{selectedDetail.comparison.tawaf}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compSai', language)}: </span>{selectedDetail.comparison.sai}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compHady', language)}: </span>{selectedDetail.comparison.hady}</div>
                                    </div>
                                </div>
                            )}

                            {/* Raw HTML text */}
                            {selectedDetail.text && (
                                <div className="text-base leading-relaxed font-medium" 
                                     style={{ color: 'var(--text-color)', fontSize: `${15 * cardTextScale}px` }} 
                                     dangerouslySetInnerHTML={{ __html: selectedDetail.text.replaceAll('{{THEME_PALETTE_0}}', theme.palette[0]) }}>
                                </div>
                            )}

                            {/* Step points / Actions */}
                            {(selectedDetail.points || selectedDetail.actions || selectedDetail.detailedSteps) && (
                                <div className="space-y-2">
                                    <h4 className="font-bold text-xs mb-2" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0], fontSize: `${13 * cardTextScale}px` }}>
                                        {tHajj('practicalStepsSection', language)}
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {(selectedDetail.points || selectedDetail.actions || selectedDetail.detailedSteps).map((point: string, i: number) => (
                                            <li key={i} className="flex gap-3 p-3.5 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10">
                                                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), color: isBlackTheme ? '#000000' : '#FFFFFF' }}>
                                                    {i + 1}
                                                </div>
                                                <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-color)', fontSize: `${13.5 * cardTextScale}px` }} dangerouslySetInnerHTML={{ __html: point }}></p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sunan */}
                            {selectedDetail.sunan && selectedDetail.sunan.length > 0 && (
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 dark:bg-emerald-950/10 space-y-2">
                                    <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400" style={{ fontSize: `${13 * cardTextScale}px` }}>
                                        {tHajj('sunnahEtiquetteSection', language)}
                                    </h4>
                                    <ul className="space-y-1.5 text-xs">
                                        {selectedDetail.sunan.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start" style={{ color: 'var(--text-color)', fontSize: `${12.5 * cardTextScale}px` }}>
                                                <span className="font-bold text-emerald-500">•</span>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Mistakes to avoid */}
                            {selectedDetail.mistakes && selectedDetail.mistakes.length > 0 && (
                                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 dark:bg-orange-950/20 space-y-2">
                                    <h4 className="font-bold text-xs text-orange-600 dark:text-orange-400" style={{ fontSize: `${13 * cardTextScale}px` }}>
                                        {tHajj('commonMistakesSection', language)}
                                    </h4>
                                    <ul className="space-y-1.5 text-xs">
                                        {selectedDetail.mistakes.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start" style={{ color: 'var(--text-color)', fontSize: `${12.5 * cardTextScale}px` }}>
                                                <span className="font-bold text-orange-500">•</span>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer Button */}
                        <div className="p-4 bg-white/5 border-t border-white/10">
                            <button 
                                type="button"
                                onClick={() => setSelectedDetail(null)} 
                                className="w-full py-3.5 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                                style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), color: isBlackTheme ? '#000000' : '#FFFFFF' }}
                            >
                                {tHajj('understoodBtn', language)}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Magnifier / Zoom Modal for Cards Text */}
            {zoomedCard && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex justify-center items-center p-3 md:p-4 overflow-hidden" onClick={closeZoomModal}>
                    <div 
                        className="themed-card p-5 sm:p-7 rounded-3xl w-full max-w-2xl text-start relative flex flex-col max-h-[90vh] shadow-2xl" 
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Content Area */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 py-2 sm:py-4 px-2 space-y-4">
                            {/* Special Duaa / Dhikr Mode with Next/Prev */}
                            {zoomedCard.duaaItems && zoomedCard.duaaItems.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Title & Counter */}
                                    <div className="pb-2 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
                                        <h3 className="font-bold leading-snug" style={{ fontSize: `${Math.max(18, zoomFontSize)}px`, color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                            {zoomedCard.title}
                                        </h3>
                                        <span className="text-xs font-mono font-bold opacity-75 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10" style={{ color: 'var(--text-color)' }}>
                                            {currentDuaaIdx + 1} / {zoomedCard.duaaItems.length}
                                        </span>
                                    </div>

                                    {/* Duaa Content */}
                                    {isEn ? (
                                        <div className="p-4 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-start space-y-3">
                                            <p 
                                                className="leading-relaxed font-medium select-text text-emerald-950 dark:text-emerald-100" 
                                                style={{ fontSize: `${zoomFontSize}px` }}
                                            >
                                                {getDuaaEnglish(zoomedCard.duaaItems[currentDuaaIdx])}
                                            </p>
                                            <div className="pt-3 border-t border-emerald-500/20 text-start">
                                                <p className="font-amiri text-base opacity-75 leading-loose" style={{ color: 'var(--text-color)' }}>
                                                    {zoomedCard.duaaItems[currentDuaaIdx]}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-5 sm:p-8 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 text-center min-h-[140px] flex items-center justify-center">
                                            <p 
                                                className="leading-loose font-amiri font-bold select-text" 
                                                style={{ fontSize: `${zoomFontSize}px`, color: 'var(--text-color)' }}
                                            >
                                                {zoomedCard.duaaItems[currentDuaaIdx]}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Title */}
                                    {zoomedCard.title && (
                                        <div className="pb-2 border-b border-white/10">
                                            <h3 className="font-bold leading-snug" style={{ fontSize: `${Math.max(18, zoomFontSize + 2)}px`, color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                                {zoomedCard.title}
                                            </h3>
                                            {zoomedCard.subtitle && (
                                                <p className="text-xs opacity-75 mt-1" style={{ color: 'var(--text-color)', fontSize: `${Math.max(12, zoomFontSize - 8)}px` }}>
                                                    {zoomedCard.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Quranic Ayah */}
                                    {zoomedCard.quranAyah && (
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                                            <p className={`leading-relaxed text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans' : 'font-amiri font-bold'}`} style={{ fontSize: `${zoomFontSize}px` }}>
                                                {zoomedCard.quranAyah}
                                            </p>
                                        </div>
                                    )}

                                    {/* Hadith */}
                                    {zoomedCard.hadith && (
                                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                                            <p className={`leading-relaxed text-emerald-950 dark:text-emerald-200 ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ fontSize: `${zoomFontSize}px` }}>
                                                {zoomedCard.hadith}
                                            </p>
                                        </div>
                                    )}

                                    {/* Primary Text */}
                                    {zoomedCard.text && (
                                        <div 
                                            className="leading-relaxed font-medium select-text" 
                                            style={{ fontSize: `${zoomFontSize}px`, color: 'var(--text-color)' }}
                                            dangerouslySetInnerHTML={{ __html: zoomedCard.text.replaceAll('{{THEME_PALETTE_0}}', theme.palette[0]) }}
                                        />
                                    )}

                                    {/* Definition or Description */}
                                    {(zoomedCard.definition || zoomedCard.description) && (
                                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                            <p className="leading-relaxed font-medium" style={{ fontSize: `${zoomFontSize}px`, color: 'var(--text-color)' }}>
                                                {zoomedCard.definition || zoomedCard.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Evidence */}
                                    {zoomedCard.evidence && (
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                                            <p className="leading-relaxed font-medium text-amber-900 dark:text-amber-200" style={{ fontSize: `${zoomFontSize}px` }}>
                                                {zoomedCard.evidence}
                                            </p>
                                        </div>
                                    )}

                                    {/* Points / Steps */}
                                    {(zoomedCard.points || zoomedCard.actions || zoomedCard.detailedSteps) && (
                                        <ul className="space-y-3">
                                            {(zoomedCard.points || zoomedCard.actions || zoomedCard.detailedSteps)!.map((point, i) => (
                                                <li key={i} className="flex gap-3 p-3.5 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/10">
                                                    <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" 
                                                          style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0], color: isBlackTheme ? '#000000' : '#FFFFFF' }}>
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex-1 leading-relaxed font-medium" style={{ fontSize: `${zoomFontSize}px`, color: 'var(--text-color)' }} dangerouslySetInnerHTML={{ __html: point }} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Sunan */}
                                    {zoomedCard.sunan && zoomedCard.sunan.length > 0 && (
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                                            <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                                                {tHajj('sunnahEtiquetteSection', language)}
                                            </h4>
                                            <ul className="space-y-2">
                                                {zoomedCard.sunan.map((item, i) => (
                                                    <li key={i} className="flex gap-2 items-start" style={{ color: 'var(--text-color)', fontSize: `${zoomFontSize - 2}px` }}>
                                                        <span className="font-bold text-emerald-500">•</span>
                                                        <span className="leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Mistakes */}
                                    {zoomedCard.mistakes && zoomedCard.mistakes.length > 0 && (
                                        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-2">
                                            <h4 className="font-bold text-sm text-orange-600 dark:text-orange-400">
                                                {tHajj('commonMistakesSection', language)}
                                            </h4>
                                            <ul className="space-y-2">
                                                {zoomedCard.mistakes.map((item, i) => (
                                                    <li key={i} className="flex gap-2 items-start" style={{ color: 'var(--text-color)', fontSize: `${zoomFontSize - 2}px` }}>
                                                        <span className="font-bold text-orange-500">•</span>
                                                        <span className="leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}

                            {copySuccess && (
                                <p className="text-xs font-bold text-emerald-500 animate-pulse text-center">
                                    {tHajj('copiedSuccess', language)}
                                </p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-4 shrink-0 pt-2 border-t border-white/10 space-y-3">
                            {/* Next / Previous navigation for Adhkar & Duaa */}
                            {zoomedCard.duaaItems && zoomedCard.duaaItems.length > 1 && (
                                <div className="flex w-full justify-between items-center gap-2">
                                    <button 
                                        type="button"
                                        onClick={handleNextDuaa}
                                        disabled={currentDuaaIdx === zoomedCard.duaaItems.length - 1}
                                        className="flex-1 p-2.5 px-4 rounded-xl bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm shadow-sm"
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        {!isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                        <span>{tHajj('nextDuaa', language)}</span>
                                    </button>

                                    <span className="text-xs font-mono font-bold opacity-75 px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5" style={{ color: 'var(--text-color)' }}>
                                        {currentDuaaIdx + 1} / {zoomedCard.duaaItems.length}
                                    </span>
                                    
                                    <button 
                                        type="button"
                                        onClick={handlePrevDuaa}
                                        disabled={currentDuaaIdx === 0}
                                        className="flex-1 p-2.5 px-4 rounded-xl bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm shadow-sm"
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        <span>{tHajj('prevDuaa', language)}</span>
                                        {!isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                                    </button>
                                </div>
                            )}

                            <button 
                                type="button"
                                onClick={closeZoomModal} 
                                className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                {tHajj('closeBtn', language)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
}

const HomeScreen = ({ setScreen, theme, cardBorderColor, cardTextScale, onZoom }: { setScreen: any, theme: any, cardBorderColor?: string, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';

    const additions = isEn ? HOME_ADDITIONS_EN : homeScreenAdditions;

    return (
     <section id="home-screen" className="space-y-4">
        {/* Navigation Category Cards - Clean, no icons */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
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
                    className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:bg-white/20 transition-all duration-300 cursor-pointer min-h-[90px]"
                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                >
                    <h2 className="relative z-10 font-bold text-center leading-snug" style={{ color: 'var(--text-color)', fontSize: `${15.5 * cardTextScale}px` }}>
                        {item.label}
                    </h2>
                </button>
            ))}
            
            <button 
                type="button"
                onClick={() => setScreen('checklist')} 
                className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:bg-white/20 transition-all duration-300 col-span-2 cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <h2 className="relative z-10 font-bold text-center" style={{ color: 'var(--text-color)', fontSize: `${15.5 * cardTextScale}px` }}>
                    {tHajj('cardChecklist', language)}
                </h2>
            </button>
        </div>

        {/* Content Cards - Icons removed, magnifying glass icon added for zooming */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {additions.map((item, index) => {
                const cardTitleColor = isBlackTheme ? '#FFFFFF' : (theme.name === 'أبيض وأسود' ? theme.textColor : theme.palette[index % theme.palette.length]);

                return (
                 <div key={index} className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 shadow-lg text-start relative" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <div className="flex items-center justify-between mb-2 gap-2">
                        <h3 className="font-bold text-base leading-snug" style={{ color: cardTitleColor, fontSize: `${15 * cardTextScale}px` }}>
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
                            className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer shrink-0"
                            title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                            style={{ color: 'var(--text-color)' }}
                        >
                            <ZoomIn className="w-4.5 h-4.5" />
                        </button>
                    </div>

                    {item.type === 'hadith' ? (
                        <p className={`text-xs leading-relaxed ${isRTL ? 'pr-3 border-r-2' : 'pl-3 border-l-2'} font-medium`} style={{ color: 'var(--text-color)', borderColor: isBlackTheme ? '#FFFFFF' : theme.palette[0], fontSize: `${13 * cardTextScale}px` }}>
                            {item.content[0]}
                        </p>
                    ) : (
                        <ul className="space-y-1.5 opacity-90 mt-2">
                            {item.content.map((point, pi) => (
                                <li key={pi} className="flex gap-2 items-start text-xs font-medium" style={{ color: 'var(--text-color)', fontSize: `${12.5 * cardTextScale}px` }}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 opacity-60" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}></div>
                                    <span className="flex-1 leading-relaxed opacity-85">{point}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                 </div>
                );
            })}

            {/* Warning Card */}
            <div className="col-span-1 md:col-span-2 bg-orange-500/5 dark:bg-orange-900/10 rounded-2xl p-4 backdrop-blur-md text-start relative" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <div className="flex items-center justify-between mb-1 gap-2">
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
                        className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer shrink-0 text-orange-600 dark:text-orange-400"
                        title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                    >
                        <ZoomIn className="w-4.5 h-4.5" />
                    </button>
                </div>
                <p className="leading-relaxed text-xs" style={{ color: 'var(--text-color)', fontSize: `${12.5 * cardTextScale}px` }}>
                    {isEn 
                        ? 'Omitting a pillar invalidates the ritual, whereas omitting an obligation requires a sacrificial penalty (dam), and committing prohibitions incurs an expiation (fidyah).' 
                        : 'ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية.'}
                </p>
            </div>
        </div>
    </section>
    );
};

const UmrahScreen = ({ theme, onSelectDetail, cardBorderColor, cardTextScale, onZoom }: { theme: any, onSelectDetail: any, cardBorderColor?: string, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');
    const [showVirtues, setShowVirtues] = useState(false);

    const virtuesList = isEn ? umrahVirtuesEn : umrahVirtues;
    const generalInfo = isEn ? umrahGeneralInfoEn : umrahGeneralInfo;
    const stepsList = isEn ? umrahStepsEn : umrahSteps;

    return (
     <section id="umrah-screen" className="space-y-4">
        {/* Intro Banner */}
        <div className="rounded-2xl p-4 text-center backdrop-blur-sm shadow-md" 
             style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : (isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15`), borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <p className="font-amiri text-base font-bold text-amber-700 dark:text-amber-300 px-4" style={{ fontSize: `${16 * cardTextScale}px` }}>
                {tHajj('umrahIntroVerse', language)}
            </p>
            <p className="text-xs opacity-75 mt-1 px-4" style={{ color: 'var(--text-color)', fontSize: `${12 * cardTextScale}px` }}>
                {tHajj('umrahIntroDesc', language)}
            </p>
        </div>

        {/* Card: Virtues */}
        <div className="themed-card rounded-2xl overflow-hidden backdrop-blur-md shadow-md" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <button 
                type="button"
                onClick={() => setShowVirtues(!showVirtues)}
                className="w-full p-3.5 flex items-center justify-between transition-colors bg-white/5 hover:bg-white/10 text-start cursor-pointer"
            >
                <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-color)', fontSize: `${14.5 * cardTextScale}px` }}>
                        {tHajj('umrahVirtuesTitle', language)}
                    </h3>
                    <p className="text-[11px] opacity-70" style={{ fontSize: `${11 * cardTextScale}px` }}>
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
                        className="p-1.5 opacity-75 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition cursor-pointer"
                        title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                        style={{ color: 'var(--text-color)' }}
                    >
                        <ZoomIn className="w-4.5 h-4.5" />
                    </button>
                    {showVirtues ? <ChevronUp size={18} style={{ color: 'var(--text-color)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-color)' }} />}
                </div>
            </button>

            {showVirtues && (
                <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/10 text-start">
                    {virtuesList.map((v, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0], fontSize: `${13 * cardTextScale}px` }}>{v.title}</span>
                                <span className="text-[10px] opacity-60 font-mono">{v.source}</span>
                            </div>
                            <p className={`text-sm font-semibold text-amber-600 dark:text-amber-300 ${isEn ? 'font-sans' : 'font-amiri'}`} style={{ fontSize: `${14 * cardTextScale}px` }}>{v.text}</p>
                            <p className="text-xs opacity-80 leading-relaxed" style={{ color: 'var(--text-color)', fontSize: `${12 * cardTextScale}px` }}>{v.explanation}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* General Info Grid: Arkan, Wajibat, Sunan, Mufsidat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button 
                type="button"
                onClick={() => onSelectDetail({
                    title: isEn ? 'The Three Pillars of Umrah' : 'أركان العمرة الثلاثة',
                    subtitle: isEn ? 'Umrah is invalid without them and cannot be compensated by animal sacrifice' : 'لا تصح العمرة إلا بها ولا تُجبر بدم بإجماع العلماء',
                    points: generalInfo.arkan,
                    quranAyah: isEn ? '﴿ And complete the Hajj and \'Umrah for Allah ﴾ [Al-Baqarah: 196]' : '﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾ [البقرة: 196]، وقوله تعالى: ﴿ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ ﴾ [الحج: 29]',
                    hadith: isEn ? 'The Prophet ﷺ said: «Actions are judged by intentions», and: «Perform Sa\'i, for Allah has prescribed Sa\'i upon you»' : 'قال رسول الله ﷺ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» وقال: «اسْعَوْا فَإِنَّ اللهَ كَتَبَ عَلَيْكُمُ السَّعْيَ»'
                })}
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('pillarsLabel', language)} (3)
                    </span>
                    <ZoomIn size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)', fontSize: `${11 * cardTextScale}px` }}>
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
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('obligationsLabel', language)} (2)
                    </span>
                    <ZoomIn size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)', fontSize: `${11 * cardTextScale}px` }}>
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
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('sunnahsLabel', language)} (8)
                    </span>
                    <ZoomIn size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)', fontSize: `${11 * cardTextScale}px` }}>
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
                className="bg-orange-500/10 dark:bg-orange-950/30 backdrop-blur-md rounded-xl p-3 text-start hover:bg-orange-500/20 transition-all group cursor-pointer" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-orange-600 dark:text-orange-400" style={{ fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('prohibitionsLabel', language)} (3)
                    </span>
                    <ZoomIn size={14} className="text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)', fontSize: `${11 * cardTextScale}px` }}>
                    {isEn ? 'Marital relations before Tahallul, missing a pillar...' : 'الجماع قبل التحلل، ترك ركن، ارتكاب المحظورات'}
                </p>
            </button>
        </div>

        {/* 9 Steps */}
        <div className="space-y-3">
            <h3 className="text-base font-bold text-start" style={{ color: 'var(--text-color)', fontSize: `${16 * cardTextScale}px` }}>
                <span>{tHajj('umrahStepsSectionTitle', language)}</span>
            </h3>
            {stepsList.map((step) => (
                <div 
                    key={step.title}
                    className="w-full text-start themed-card backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-3.5 hover:shadow-lg transition-all group"
                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                >
                    <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onSelectDetail(step)}
                    >
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm md:text-base leading-snug" style={{ color: 'var(--text-color)', fontSize: `${15 * cardTextScale}px` }}>
                                {step.title}
                            </h4>
                        </div>
                        {step.subtitle && (
                            <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: 'var(--text-color)', fontSize: `${12 * cardTextScale}px` }}>
                                {step.subtitle}
                            </p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap text-[10px]">
                            {step.quranAyah && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
                                    {tHajj('quranProofBadge', language)}
                                </span>
                            )}
                            {step.hadith && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">
                                    {tHajj('sunnahProofBadge', language)}
                                </span>
                            )}
                            {step.points && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium">
                                    {step.points.length} {tHajj('fiqhPointsBadge', language)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Magnifying Glass to zoom card text */}
                        <button
                            type="button"
                            onClick={() => onZoom(step)}
                            className="p-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
                            title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                            style={{ color: 'var(--text-color)' }}
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onSelectDetail(step)}
                            className="p-1 cursor-pointer"
                            title={isEn ? "View details" : "عرض التفاصيل"}
                        >
                            {!isRTL ? (
                                <ChevronRight size={18} className="opacity-40 group-hover:opacity-75 transition-opacity" style={{ color: 'var(--text-color)' }} />
                            ) : (
                                <ChevronLeft size={18} className="opacity-40 group-hover:opacity-75 transition-opacity" style={{ color: 'var(--text-color)' }} />
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </section>
    );
};

const HajjScreen = ({ hajjType, setHajjType, theme, onSelectDetail, cardBorderColor, cardTextScale, onZoom }: { hajjType: any, setHajjType: any, theme: any, onSelectDetail: any, cardBorderColor?: string, cardTextScale: number, onZoom: (data: CardZoomData) => void }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');

    const typesMap = isEn ? hajjTypesEn : hajjTypes;
    const currentType = typesMap[hajjType];
    const generalInfo = isEn ? hajjGeneralInfoEn : hajjGeneralInfo;
    const tamattuPlan = isEn ? hajjTamattuPlanEn : hajjTamattuPlan;
    const ifradPlan = isEn ? hajjIfradPlanEn : hajjIfradPlan;
    const qiranPlan = isEn ? hajjQiranPlanEn : hajjQiranPlan;

    return (
     <section id="hajj-screen" className="space-y-4">
        {/* Quran Intro Banner */}
        <div className="rounded-2xl p-4 text-center backdrop-blur-sm shadow-md"
             style={{ backgroundColor: isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15`, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <p className="font-amiri text-base font-bold text-amber-700 dark:text-amber-300 px-4" style={{ fontSize: `${16 * cardTextScale}px` }}>
                {tHajj('hajjIntroVerse', language)}
            </p>
            <p className="text-xs opacity-75 mt-1 px-4" style={{ color: 'var(--text-color)', fontSize: `${12 * cardTextScale}px` }}>
                {tHajj('hajjIntroHadith', language)}
            </p>
        </div>

        {/* General Info Grid: Arkan, Wajibat, Sunan, Mufsidat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button 
                type="button"
                onClick={() => onSelectDetail({
                    title: isEn ? 'The Four Pillars of Hajj' : 'أركان الحج الأربعة',
                    subtitle: isEn ? 'Hajj is invalid without them and missing one cannot be compensated by animal sacrifice' : 'لا يصح الحج إلا بها جميعاً، وفوات واحد منها يبطل الحج ولا يُجبر بدم',
                    points: generalInfo.arkan,
                    quranAyah: isEn ? '﴿ And let them circumambulate the Ancient House ﴾ [Al-Hajj: 29]' : '﴿ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ ﴾ [الحج: 29]',
                    hadith: isEn ? 'The Messenger of Allah ﷺ said: «Hajj is Arafat», and: «Perform Sa\'i, for Allah has prescribed Sa\'i upon you»' : 'قال رسول الله ﷺ: «الحَجُّ عَرَفَةُ» وقال: «اسْعَوْا فَإِنَّ اللهَ كَتَبَ عَلَيْكُمُ السَّعْيَ»'
                })}
                className="themed-card backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isDefaultTheme ? '#000000' : theme.palette[0], fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('pillarsLabel', language)} (4)
                    </span>
                    <ZoomIn size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)', fontSize: `${11 * cardTextScale}px` }}>
                    {isEn ? 'Ihram, Arafat, Tawaf Al-Ifadah, Sa\'i' : 'الإحرام، عرفة، طواف الإفاضة، السعي'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    title: isEn ? 'The Seven Obligations of Hajj' : 'واجبات الحج السبعة',
                    subtitle: isEn ? 'Omitting one requires an animal sacrifice (dam) slaughtered in Mecca' : 'من ترك واجباً منها لزمه دم (شاة) يذبحها في مكة ويوزعها على فقرائها وحجه صحيح',
                    points: generalInfo.wajibat,
                    hadith: isEn ? 'Ibn Abbas (may Allah be pleased with him) said: «Whoever forgets a rite of his rituals or leaves it must offer a sacrificial blood offering.» [Muwatta Malik]' : 'عن ابن عباس رضي الله عنهما: «مَنْ نَسِيَ مِنْ نُسُكِهِ شَيْئًا أَوْ تَرَكَهُ فَلْيُهْرِقْ دَمًا» [موطأ مالك]'
                })}
                className="themed-card backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isDefaultTheme ? '#000000' : theme.palette[0], fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('obligationsLabel', language)} (7)
                    </span>
                    <ZoomIn size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)', fontSize: `${11 * cardTextScale}px` }}>
                    {isEn ? 'Miqat, Arafat until sunset, Muzdalifah, Mina, Jamarat, Shaving, Farewell Tawaf' : 'الميقات، الوقوف للمغرب، مزدلفة، منى، الجمار، الحلق، الوداع'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    title: isEn ? 'Prophetic Sunnahs of Hajj' : 'سنن الحج وآدابه النبوية',
                    subtitle: isEn ? 'Recommended acts that raise status following the Prophet ﷺ' : 'أعمال مستحبة ترفع الدرجات وتكمل الأجر اقتداءً بالنبي ﷺ',
                    points: generalInfo.sunan,
                    hadith: isEn ? 'The Prophet ﷺ said during the Farewell Pilgrimage: «Take your rituals from me, for I do not know if I will perform Hajj after this Hajj of mine.» [Sahih Muslim]' : 'قال رسول الله ﷺ في حجة الوداع: «لِتَأْخُذُوا مَنَاسِكَكُمْ، فَإِنِّي لَا أَدْرِي لَعَلِّي لَا أَحُجُّ بَعْدَ حَجَّتِي هَذِهِ» [صحيح مسلم]'
                })}
                className="themed-card backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isDefaultTheme ? '#000000' : theme.palette[0], fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('sunnahsLabel', language)} (8)
                    </span>
                    <ZoomIn size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)', fontSize: `${11 * cardTextScale}px` }}>
                    {isEn ? 'Mina overnight on Tarwiyah, Tawaf Al-Qudum, Combining prayers, Talbiyah...' : 'المبيت بمنى ليلة عرفة، طواف القدوم، الجمع بنمرة، التلبية...'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    title: isEn ? 'Prohibitions & Nullifiers of Hajj' : 'مفسدات الحج ومحظوراته',
                    subtitle: isEn ? 'Acts that invalidate Hajj or incur a sacrificial penalty' : 'ما يبطل الحج بالكلية أو يوجب الفدية والدم',
                    points: generalInfo.mufsidat,
                    quranAyah: isEn ? '﴿ Hajj is [during] well-known months, so whoever has made Hajj obligatory upon himself therein, there is [to be for him] no sexual relations and no disobedience and no disputing during Hajj ﴾ [Al-Baqarah: 197]' : '﴿ الْحَجُّ أَشْهُرٌ مَّعْلُومَاتٌ فَمَن فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ ﴾ [البقرة: 197]'
                })}
                className="bg-orange-500/10 dark:bg-orange-950/30 backdrop-blur-md rounded-xl p-3 text-start hover:bg-orange-500/20 transition-all group cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-orange-600 dark:text-orange-400" style={{ fontSize: `${12 * cardTextScale}px` }}>
                        {tHajj('prohibitionsLabel', language)} (3)
                    </span>
                    <ZoomIn size={14} className="text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)', fontSize: `${11 * cardTextScale}px` }}>
                    {isEn ? 'Intercourse before Tahallul, missing Arafah, omitting a pillar' : 'الجماع قبل التحلل، فوات عرفة، ترك ركن'}
                </p>
            </button>
        </div>

        {/* Three Types of Hajj */}
        <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-start" style={{ color: 'var(--text-color)', fontSize: `${16 * cardTextScale}px` }}>
                <span>{tHajj('hajjTypesSectionTitle', language)}</span>
            </h3>

            {/* Selector buttons */}
            <div className="grid grid-cols-3 gap-2">
                {Object.keys(typesMap).map(key => {
                    const isSelected = hajjType === key;
                    const typeName = typesMap[key].name;
                    return (
                        <button key={key} type="button" onClick={() => setHajjType(key)} 
                            className={`px-3 py-2.5 rounded-xl font-bold transition-all text-xs md:text-sm flex flex-col items-center gap-1 cursor-pointer ${isSelected ? 'shadow-md scale-[1.02]' : 'bg-white/5 hover:bg-white/10'}`}
                            style={{ 
                                backgroundColor: isSelected ? (isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0])) : 'transparent',
                                borderColor: isSelected ? (isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0])) : cardBorderColor,
                                borderWidth: '1.5px',
                                borderStyle: 'solid',
                                color: isSelected ? (isBlackTheme ? '#000000' : '#FFFFFF') : 'var(--text-color)', 
                                opacity: isSelected ? 1 : 0.75,
                                fontSize: `${13 * cardTextScale}px`
                            }}
                        >
                            <span>{typeName}</span>
                        </button>
                    );
                })}
            </div>

            {/* Selected type card */}
            {currentType && (
                <div className="themed-card rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-xl border space-y-4 text-start relative" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-lg md:text-xl font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0], fontSize: `${18 * cardTextScale}px` }}>
                                    {currentType.name}
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    {currentType.badge}
                                </span>
                            </div>
                            <p className="text-xs opacity-80 mt-1 leading-relaxed" style={{ color: 'var(--text-color)', fontSize: `${12.5 * cardTextScale}px` }}>
                                {currentType.definition}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Magnifying Glass to zoom type card text */}
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
                                className="p-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
                                title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                style={{ color: 'var(--text-color)' }}
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
                                className="px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer"
                                style={{ 
                                    backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), 
                                    color: isBlackTheme ? '#000000' : '#FFFFFF' 
                                }}
                            >
                                <span>{tHajj('viewFullEvidenceBtn', language)}</span>
                            </button>
                        </div>
                    </div>

                    {/* Evidences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20 space-y-1.5">
                            <span className="font-bold text-xs flex items-center gap-1.5 text-amber-700 dark:text-amber-300" style={{ fontSize: `${12.5 * cardTextScale}px` }}>
                                {tHajj('quranEvidenceTitle', language)}
                            </span>
                            {currentType.quranEvidence.map((ev: string, idx: number) => (
                                <p key={idx} className={`text-xs md:text-sm leading-relaxed text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`} style={{ fontSize: `${13 * cardTextScale}px` }}>
                                    {ev}
                                </p>
                            ))}
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/20 space-y-1.5">
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

                    {/* Hady Ruling */}
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 dark:bg-purple-950/20 space-y-1">
                        <span className="font-bold text-xs text-purple-700 dark:text-purple-300" style={{ fontSize: `${12.5 * cardTextScale}px` }}>
                            {tHajj('hadyRulingTitle', language)}
                        </span>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-color)', fontSize: `${12.5 * cardTextScale}px` }}>
                            {currentType.hadyRuling}
                        </p>
                    </div>

                    {/* Fiqh Comparison */}
                    <div className="p-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 space-y-2">
                        <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0], fontSize: `${12.5 * cardTextScale}px` }}>
                            {tHajj('comparisonTitle', language)} ({currentType.name})
                        </span>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]" style={{ fontSize: `${11 * cardTextScale}px` }}>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compIhram', language)}</span>
                                <span className="leading-tight">{currentType.comparison.ihram}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compTahallul', language)}</span>
                                <span className="leading-tight">{currentType.comparison.tahallul}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compTawaf', language)}</span>
                                <span className="leading-tight">{currentType.comparison.tawaf}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compSai', language)}</span>
                                <span className="leading-tight">{currentType.comparison.sai}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center col-span-2 md:col-span-1">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compHady', language)}</span>
                                <span className="leading-tight">{currentType.comparison.hady}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Timeline */}
        <div className="pt-2">
            <h3 className="text-base font-bold mb-3 text-start" style={{ color: 'var(--text-color)', fontSize: `${16 * cardTextScale}px` }}>
                <span>{tHajj('hajjTimelineSectionTitle', language)}</span>
            </h3>
            <div className="space-y-2.5">
                {(hajjType === 'tamattu' ? tamattuPlan : hajjType === 'ifrad' ? ifradPlan : qiranPlan).map((day, i) => (
                    <div 
                        key={i} 
                        className="w-full text-start themed-card backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-3.5 hover:shadow-lg transition-all group"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
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
                            <h5 className="font-bold text-sm md:text-base" style={{ color: 'var(--text-color)', fontSize: `${15 * cardTextScale}px` }}>{day.day}</h5>
                            <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: 'var(--text-color)', fontSize: `${12 * cardTextScale}px` }}>{day.summary}</p>
                            {day.evidence && (
                                <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium mt-1 truncate" style={{ fontSize: `${11 * cardTextScale}px` }}>
                                    {day.evidence}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {/* Magnifying Glass to zoom card text */}
                            <button
                                type="button"
                                onClick={() => onZoom({
                                    title: day.day,
                                    subtitle: day.summary,
                                    evidence: day.evidence,
                                    points: day.actions
                                })}
                                className="p-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
                                title={isEn ? "Enlarge card text" : "تكبير نص البطاقة"}
                                style={{ color: 'var(--text-color)' }}
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
                                className="p-1 cursor-pointer"
                            >
                                {!isRTL ? (
                                    <ChevronRight size={18} className="opacity-40 group-hover:opacity-75 transition-opacity" style={{ color: 'var(--text-color)' }} />
                                ) : (
                                    <ChevronLeft size={18} className="opacity-40 group-hover:opacity-75 transition-opacity" style={{ color: 'var(--text-color)' }} />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

const DuaaScreen = ({ theme, openDuaaId, onToggle, onZoom, cardBorderColor, cardTextScale }: { theme: any, openDuaaId: any, onToggle: any, onZoom: any, cardBorderColor?: string, cardTextScale: number }) => {
    const { language } = useLanguage();
    const isBlackTheme = theme.bgColor === '#000000';
    return (
        <section id="duaa-screen" className="space-y-4">
             <div className="rounded-2xl p-4 text-center mb-3 backdrop-blur-sm"
                  style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <p className="text-xs sm:text-sm opacity-90 font-bold px-4" style={{ fontSize: `${13 * cardTextScale}px` }}>
                    {tHajj('duaaScreenHeader', language)}
                </p>
            </div>

            <div className="space-y-2">
                {allDuaas.map(section => (
                    <DuaaSection 
                        key={section.id}
                        id={section.id}
                        title={section.title} 
                        items={section.items} 
                        isOpen={openDuaaId === section.id}
                        onToggle={() => onToggle(section.id)}
                        onZoom={onZoom}
                        cardBorderColor={cardBorderColor}
                        cardTextScale={cardTextScale}
                    />
                ))}
            </div>
        </section>
    );
};

export default HajjUmrah;
