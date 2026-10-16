
import React, { useState, useEffect, FC } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { umrahVirtues, umrahGeneralInfo, umrahSteps, hajjTypes, hajjTamattuPlan, hajjIfradPlan, hajjQiranPlan, hajjGeneralInfo, allDuaas, homeScreenAdditions } from '../data/hajjUmrahData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Map, Heart, Compass, 
    BookOpen, Info, ShieldAlert, ListChecks, Plus, Minus, RotateCcw, Tent,
    ZoomIn, CheckCircle2, Circle, ArrowLeft, Footprints,
    Ban, HelpCircle, MapPin, Sparkles, Scale, AlertTriangle, ScrollText, Home
} from 'lucide-react';
import { getTawafCounterState, saveTawafCounterState, subscribeTawafCounter } from '../utils/tawafCounterStorage';

interface DuaaSectionProps {
    id: number;
    title: string;
    items: string[];
    isOpen: boolean;
    onToggle: () => void;
    onZoom: (item: string) => void;
    cardBorderColor?: string;
}

const DuaaSection: FC<DuaaSectionProps> = ({ id, title, items, isOpen, onToggle, onZoom, cardBorderColor }) => {
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

    return (
        <div id={`duaa-section-${id}`} className="themed-card rounded-2xl overflow-hidden mb-3 backdrop-blur-sm" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <button 
                onClick={onToggle} 
                className="w-full flex justify-between items-center p-4 bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-800 transition-colors"
            >
                <span className="font-bold text-base md:text-lg text-right" style={{ color: 'var(--text-color)' }}>{title}</span>
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
                                <span className="absolute top-3 right-4 text-xs font-bold opacity-50" style={{ color: 'var(--text-color)' }}>
                                    {currentIndex + 1} / {items.length}
                                </span>
                                <button onClick={() => onZoom(items[currentIndex])} className="absolute top-2 left-2 p-2 shrink-0 opacity-60 hover:opacity-100 transition-opacity rounded-full dark:hover:bg-gray-700" style={{ color: 'var(--text-color)' }}>
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                
                                <span className="text-lg md:text-xl leading-loose font-amiri mt-6 mb-2" style={{ color: 'var(--text-color)' }} dangerouslySetInnerHTML={{ __html: items[currentIndex] }}></span>
                                
                                <div className="flex w-full justify-between items-center mt-2 border-t border-black/10 dark:border-white/10 pt-3">
                                    <button 
                                        onClick={handleNext}
                                        disabled={currentIndex === items.length - 1}
                                        className="p-2 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1"
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        <ChevronRight size={18} />
                                        <span className="text-sm font-bold">التالي</span>
                                    </button>
                                    
                                    <button 
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className="p-2 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1"
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        <span className="text-sm font-bold">السابق</span>
                                        <ChevronLeft size={18} />
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

const ChecklistScreen = ({ theme, cardBorderColor }: { theme: any, cardBorderColor?: string }) => {
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
            title: "للحج والعمرة (أساسيات)",
            items: [
                { id: '1', text: "ملابس الإحرام (إزار ورداء / ملابس واسعة)" },
                { id: '2', text: "حذاء خفيف ومريح" },
                { id: '3', text: "حقيبة صغيرة لحفظ الأوراق والمال" },
                { id: '4', text: "مقص صغير / ماكينة حلاقة" },
                { id: '5', text: "أدوية شخصية ومسكنات" },
                { id: '6', text: "مظلة شمسية" }
            ]
        },
        {
            title: "مستلزمات عامة",
            items: [
                { id: '7', text: "كتيب أذكار / مصحف جيب / سبحة" },
                { id: '8', text: "ملابس قطنية مريحة" },
                { id: '9', text: "مناديل مبللة وجافة (بدون عطر)" },
                { id: '10', text: "شاحن هاتف ومخزن طاقة" },
                { id: '11', text: "نظارة شمسية" },
                { id: '12', text: "سجادة صلاة خفيفة" }
            ]
        }
    ];

    return (
        <section className="space-y-4">
            <div className="rounded-2xl p-4 text-center backdrop-blur-sm" style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}20` }}>
                    <ListChecks className="w-6 h-6" style={{ color: isBlackTheme ? '#000000' : theme.palette[0] }} />
                </div>
                <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>حدد الأشياء التي قمت بتجهيزها لرحلتك.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                    <div key={i} className="themed-card backdrop-blur-md rounded-xl p-3" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <h3 className="font-bold text-base mb-2 border-b pb-1" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0], borderColor: isBlackTheme ? 'rgba(255,255,255,0.2)' : `${theme.palette[0]}20` }}>{cat.title}</h3>
                        <div className="space-y-1.5">
                            {cat.items.map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => toggleItem(item.id)}
                                    className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-gray-700 transition-all border border-transparent"
                                    style={{ borderColor: checkedItems[item.id] ? (isBlackTheme ? 'rgba(255,255,255,0.3)' : `${theme.palette[0]}20`) : 'transparent' }}
                                >
                                    <div className={`shrink-0 w-4 h-4 rounded-md flex items-center justify-center transition-colors ${checkedItems[item.id] ? '' : 'border-2 border-gray-300/50 dark:border-gray-600'}`}
                                         style={{ backgroundColor: checkedItems[item.id] ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent' }}>
                                        {checkedItems[item.id] && <CheckCircle2 size={10} className={isBlackTheme ? "text-black" : "text-white"} />}
                                    </div>
                                    <span className={`text-sm text-right leading-relaxed font-medium transition-opacity ${checkedItems[item.id] ? 'opacity-40 line-through' : ''}`} style={{ color: 'var(--text-color)' }}>
                                        {item.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const CountersScreen = ({ theme, cardBorderColor }: { theme: any, cardBorderColor?: string }) => {
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

    const toggleHomeVisibility = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(30); } catch {}
        }
        saveTawafCounterState(prev => ({
            ...prev,
            showOnHome: !prev.showOnHome
        }));
    };

    const switchTab = (tab: 'tawaf' | 'sai') => {
        saveTawafCounterState({ activeTab: tab });
    };

    return (
        <section className="space-y-4">
            {/* بطاقة تعريفية وزر تثبيت العداد في الصفحة الرئيسية */}
            <div 
                className="backdrop-blur-md rounded-2xl p-4 text-center transition-all" 
                style={{ 
                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, 
                    borderColor: cardBorderColor, 
                    borderWidth: '1.5px', 
                    borderStyle: 'solid' 
                }}
            >
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}20` }}>
                    <RotateCcw className="w-6 h-6" style={{ color: isBlackTheme ? '#000000' : theme.palette[0] }} />
                </div>
                <h3 className="font-bold text-base mb-1" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                    عداد أشواط الطواف والسعي
                </h3>
                <p className="text-xs opacity-70 mb-3" style={{ color: 'var(--text-color)' }}>
                    أداة ذكية لمتابعة وإحصاء أشواط الطواف حول الكعبة والسعي بين الصفا والمروة بسهولة.
                </p>

                {/* زر التفعيل/التعطيل للظهور في الصفحة الرئيسية */}
                <button
                    onClick={toggleHomeVisibility}
                    className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all active:scale-[0.98] ${
                        state.showOnHome 
                            ? (isBlackTheme ? 'bg-white/10 border-white' : 'border-emerald-500 bg-emerald-500/10') 
                            : 'bg-black/5 dark:bg-white/5 border-dashed border-gray-400/40 hover:border-gray-400'
                    }`}
                >
                    <div className="flex items-center gap-2.5 text-right">
                        <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                                backgroundColor: state.showOnHome 
                                    ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) 
                                    : 'rgba(150,150,150,0.15)',
                                color: state.showOnHome 
                                    ? (isBlackTheme ? '#000000' : '#FFFFFF') 
                                    : 'var(--text-color)'
                            }}
                        >
                            <Home size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs md:text-sm" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                                    ظهور العداد في الصفحة الرئيسية
                                </span>
                                {state.showOnHome ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500 text-white shadow-sm">
                                        مُفعّل ✓
                                    </span>
                                ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-400/20 text-gray-500 dark:text-gray-400">
                                        معطّل
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] opacity-70 block text-right mt-0.5" style={{ color: 'var(--text-color)' }}>
                                {state.showOnHome 
                                    ? 'يظهر الآن تحت بطاقة الصلاة مباشرة في الصفحة الرئيسية' 
                                    : 'اضغط لتفعيل ظهوره تحت بطاقة الصلاة في الرئيسية'}
                            </span>
                        </div>
                    </div>

                    {/* المفتاح التفاعلي Toggle Knob */}
                    <div 
                        className={`w-12 h-6.5 rounded-full p-1 transition-all flex items-center shrink-0 ${
                            state.showOnHome 
                                ? 'justify-end' 
                                : 'justify-start bg-gray-300 dark:bg-gray-700'
                        }`}
                        style={{
                            backgroundColor: state.showOnHome ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : undefined
                        }}
                    >
                        <div 
                            className="w-4.5 h-4.5 rounded-full transition-all shadow-md"
                            style={{
                                backgroundColor: state.showOnHome && isBlackTheme ? '#000000' : '#FFFFFF'
                            }}
                        />
                    </div>
                </button>
            </div>

            {/* التبديل بين الطواف والسعي */}
            <div className="flex bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl p-1 rounded-2xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <button 
                    onClick={() => switchTab('tawaf')} 
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${state.activeTab === 'tawaf' ? (isBlackTheme ? 'text-black shadow-lg' : 'text-white shadow-lg') : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: state.activeTab === 'tawaf' ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent',
                        color: state.activeTab === 'tawaf' ? (isBlackTheme ? 'black' : 'white') : 'var(--text-color)' 
                    }}
                >
                    أشواط الطواف ({state.tawafCount}/7)
                </button>
                <button 
                    onClick={() => switchTab('sai')} 
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${state.activeTab === 'sai' ? (isBlackTheme ? 'text-black shadow-lg' : 'text-white shadow-lg') : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: state.activeTab === 'sai' ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent',
                        color: state.activeTab === 'sai' ? (isBlackTheme ? 'black' : 'white') : 'var(--text-color)' 
                    }}
                >
                    أشواط السعي ({state.saiCount}/7)
                </button>
            </div>

            {/* بطاقة العداد الرئيسية */}
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-5 flex flex-col items-center justify-center shadow-xl min-h-[240px]" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                {/* مؤشر الأشواط السبعة (7 Laps Bar) */}
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

                {/* الدائرة الدوارة للأشواط */}
                <div className="relative mb-5">
                     <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="5" fill="none" className="text-white/10 dark:text-gray-700" />
                        <circle cx="64" cy="64" r="58" stroke={isBlackTheme ? '#FFFFFF' : theme.palette[0]} strokeWidth="5" fill="none" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * currentCount) / 7} style={{ transition: 'stroke-dashoffset 0.5s ease' }} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-bold font-mono" style={{ color: theme.isDark ? '#ffffff' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]), textShadow: isBlackTheme ? '0 0 20px rgba(255,255,255,0.3)' : `0 0 20px ${theme.palette[0]}4D` }}>{currentCount}</span>
                         <span className="text-[10px] font-bold mt-0.5 opacity-50" style={{ color: 'var(--text-color)' }}>من 7 أشواط</span>
                    </div>
                </div>

                {/* أزرار التحكم: إنقاص، شوط جديد، وإعادة ضبط */}
                <div className="flex gap-2.5 w-full max-w-xs">
                    <button 
                        onClick={reset} 
                        title="إعادة الضبط للصفر" 
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center active:scale-95"
                    >
                        <RotateCcw size={18} style={{ color: 'var(--text-color)' }} />
                    </button>

                    <button 
                        onClick={decrement}
                        disabled={currentCount <= 0}
                        title="إنقاص شوط واحد"
                        className={`p-3 bg-white/10 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center active:scale-95 ${currentCount <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'}`}
                    >
                        <Minus size={18} style={{ color: 'var(--text-color)' }} />
                    </button>

                    <button 
                        onClick={increment} 
                        disabled={isComplete} 
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base shadow-lg ${
                            isComplete 
                                ? 'bg-emerald-600 text-white cursor-default' 
                                : 'active:scale-95 text-white'
                        }`}
                        style={{ 
                            backgroundColor: isComplete ? '#16a34a' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]), 
                            color: (isComplete ? '#FFFFFF' : (isBlackTheme ? '#000000' : 'white')) 
                        }}
                    >
                        {isComplete ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                        <span>{isComplete ? 'اكتملت 7 أشواط' : 'شوط جديد (+1)'}</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

function HajjUmrah({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
    const [screen, setScreen] = useState('home');
    const [hajjType, setHajjType] = useState('tamattu');
    const [openDuaaId, setOpenDuaaId] = useState<number | null>(null);
    const [zoomedDuaa, setZoomedDuaa] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);

    const handleDuaaToggle = (id: number) => {
        setOpenDuaaId(prevId => {
            const nextId = prevId === id ? null : id;
            if (nextId !== null) {
                setTimeout(() => {
                    const el = document.getElementById(`duaa-section-${id}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 400);
            }
            return nextId;
        });
    };

    const openZoomModal = (item) => {
        setZoomedDuaa({ text: item });
    };

    const closeZoomModal = () => {
        setZoomedDuaa(null);
    };
    
    useEffect(() => {
        if(screen === 'duaa') {
            setOpenDuaaId(1);
        }
    }, [screen]);

    useEffect(() => {
        const interceptor = () => {
            if (zoomedDuaa) {
                setZoomedDuaa(null);
                return true; // handled
            } else if (screen !== 'home') {
                setScreen('home');
                return true; // handled
            }
            return false; // let the global handler process it (will call onBack)
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [screen, zoomedDuaa]);

    const renderScreen = () => {
        switch (screen) {
            case 'umrah': return <UmrahScreen key="umrah" theme={theme} onSelectDetail={setSelectedDetail} cardBorderColor={cardBorderColor} />;
            case 'hajj': return <HajjScreen key="hajj" hajjType={hajjType} setHajjType={setHajjType} theme={theme} onSelectDetail={setSelectedDetail} cardBorderColor={cardBorderColor} />;
            case 'duaa': return <DuaaScreen key="duaa" theme={theme} openDuaaId={openDuaaId} onToggle={handleDuaaToggle} onZoom={openZoomModal} cardBorderColor={cardBorderColor} />;
            case 'checklist': return <ChecklistScreen key="checklist" theme={theme} cardBorderColor={cardBorderColor} />;
            case 'counters': return <CountersScreen key="counters" theme={theme} cardBorderColor={cardBorderColor} />;
            default: return <HomeScreen key="home" setScreen={setScreen} theme={theme} cardBorderColor={cardBorderColor} />;
        }
    };

    const handleBack = () => {
        if (selectedDetail) {
            setSelectedDetail(null);
        } else if (zoomedDuaa) {
            setZoomedDuaa(null);
        } else if (screen !== 'home') {
            setScreen('home');
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (selectedDetail) {
            setSelectedDetail(null);
        }
        if (zoomedDuaa) {
            setZoomedDuaa(null);
        }
        if (screen !== 'home') {
            setScreen('home');
        }
        onNavigate('home');
    };

    const getScreenTitle = () => {
        switch (screen) {
            case 'umrah': return 'دليل العمرة';
            case 'hajj': return 'دليل الحج';
            case 'duaa': return 'أدعية وأذكار';
            case 'checklist': return 'قائمة التجهيزات';
            case 'counters': return 'عداد الأشواط';
            default: return 'الحج والعمرة';
        }
    };

    const getScreenSubtitle = () => {
        switch (screen) {
            case 'umrah': return 'دليل أداء مناسك العمرة خطوة بخطوة';
            case 'hajj': return 'دليل أداء مناسك الحج وأنواعه المختلفة';
            case 'duaa': return 'أدعية وأذكار الطواف والسعي والمناسك';
            case 'checklist': return 'قائمة احتياجات الحاج والمعتمر الضرورية';
            case 'counters': return 'متابعة عدد الأشواط أثناء الطواف والسعي';
            default: return '﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾ (سورة البقرة - آية 196)';
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent">
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* سهم الرجوع للخلف على يمين النص */}
                        <div className="absolute right-0 flex items-center">
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="رجوع للخلف"
                                aria-label="رجوع للخلف"
                            >
                                <i className="fa-solid fa-arrow-right text-xl"></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {getScreenTitle()}
                            </h1>
                        </div>

                        {/* أيقونة المنزل على يسار النص للعودة إلى الصفحة الرئيسية */}
                        <div className="absolute left-0 flex items-center gap-1">
                            {screen === 'home' && <ThemePageLock />}
                            <button
                                onClick={handleGoHome}
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

            <main className="w-full max-w-4xl mx-auto px-4 pt-0 flex-1 overflow-y-auto pb-6">
                {renderScreen()}
                <div className="w-full h-6 shrink-0"></div>
            </main>

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
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : `${theme.palette[0]}30`), color: isBlackTheme ? '#000000' : (isDefaultTheme ? '#FFFFFF' : theme.palette[0]) }}>
                                    {selectedDetail.icon || <Info />}
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold leading-tight" style={{ color: 'var(--text-color)' }}>{selectedDetail.title}</h3>
                                    {selectedDetail.subtitle && (
                                        <p className="text-xs opacity-75 mt-0.5" style={{ color: 'var(--text-color)' }}>{selectedDetail.subtitle}</p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedDetail(null)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition">
                                <RotateCcw size={18} className="rotate-45" style={{ color: 'var(--text-color)' }} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Quranic Verse Callout */}
                            {(selectedDetail.quranAyah || selectedDetail.evidence || (selectedDetail.quranEvidence && selectedDetail.quranEvidence.length > 0)) && (
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20">
                                    <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                                        <BookOpen size={16} />
                                        <span>الدليل من القرآن الكريم</span>
                                    </div>
                                    {selectedDetail.quranAyah && (
                                        <p className="text-base md:text-lg font-amiri leading-relaxed text-amber-900 dark:text-amber-200">
                                            {selectedDetail.quranAyah}
                                        </p>
                                    )}
                                    {selectedDetail.evidence && !selectedDetail.quranAyah && (
                                        <p className="text-sm md:text-base font-amiri leading-relaxed text-amber-900 dark:text-amber-200">
                                            {selectedDetail.evidence}
                                        </p>
                                    )}
                                    {selectedDetail.quranEvidence && selectedDetail.quranEvidence.map((ev: string, idx: number) => (
                                        <p key={idx} className="text-base font-amiri leading-relaxed text-amber-900 dark:text-amber-200 mt-1">
                                            {ev}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Hadith Callout */}
                            {(selectedDetail.hadith || (selectedDetail.sunnahEvidence && selectedDetail.sunnahEvidence.length > 0)) && (
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/20">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                        <ScrollText size={16} />
                                        <span>من السنة النبوية المطهرة</span>
                                    </div>
                                    {selectedDetail.hadith && (
                                        <p className="text-sm md:text-base font-amiri leading-relaxed text-emerald-950 dark:text-emerald-200">
                                            {selectedDetail.hadith}
                                        </p>
                                    )}
                                    {selectedDetail.sunnahEvidence && selectedDetail.sunnahEvidence.map((ev: string, idx: number) => (
                                        <p key={idx} className="text-sm md:text-base font-amiri leading-relaxed text-emerald-950 dark:text-emerald-200 mt-2">
                                            {ev}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Fiqhi Definition or Summary */}
                            {(selectedDetail.definition || selectedDetail.description) && (
                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 dark:bg-blue-950/20">
                                    <div className="flex items-center gap-2 mb-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                                        <Info size={16} />
                                        <span>البيان والتعريف الفقهي</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                        {selectedDetail.definition || selectedDetail.description}
                                    </p>
                                </div>
                            )}

                            {/* Hady ruling */}
                            {selectedDetail.hadyRuling && (
                                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 dark:bg-purple-950/20">
                                    <div className="flex items-center gap-2 mb-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs">
                                        <Scale size={16} />
                                        <span>حكم الهدي والبديل عنه في الشرع</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                        {selectedDetail.hadyRuling}
                                    </p>
                                </div>
                            )}

                            {/* Who is it for */}
                            {selectedDetail.whoIsItFor && (
                                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 dark:bg-teal-950/20">
                                    <div className="flex items-center gap-2 mb-1.5 text-teal-600 dark:text-teal-400 font-bold text-xs">
                                        <MapPin size={16} />
                                        <span>لمن يُشرع هذا النسك ومميزاته</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                        {selectedDetail.whoIsItFor}
                                    </p>
                                </div>
                            )}

                            {/* Comparison */}
                            {selectedDetail.comparison && (
                                <div className="p-4 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/10 space-y-2">
                                    <h4 className="font-bold text-xs flex items-center gap-2" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                        <Scale size={16} /> خلاصة المقارنة الفقهية
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2 text-xs">
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">الإحرام: </span>{selectedDetail.comparison.ihram}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">التحلل: </span>{selectedDetail.comparison.tahallul}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">الطواف: </span>{selectedDetail.comparison.tawaf}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">السعي: </span>{selectedDetail.comparison.sai}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">الهدي: </span>{selectedDetail.comparison.hady}</div>
                                    </div>
                                </div>
                            )}

                            {/* Raw HTML text */}
                            {selectedDetail.text && (
                                <div className="text-base leading-relaxed text-right font-medium" 
                                     style={{ color: 'var(--text-color)' }} 
                                     dangerouslySetInnerHTML={{ __html: selectedDetail.text.replaceAll('{{THEME_PALETTE_0}}', theme.palette[0]) }}>
                                </div>
                            )}

                            {/* Step points / Actions */}
                            {(selectedDetail.points || selectedDetail.actions || selectedDetail.detailedSteps) && (
                                <div className="space-y-2">
                                    <h4 className="font-bold text-xs flex items-center gap-2 mb-2" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                        <ListChecks size={16} /> الخطوات والأحكام العملية:
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {(selectedDetail.points || selectedDetail.actions || selectedDetail.detailedSteps).map((point: string, i: number) => (
                                            <li key={i} className="flex gap-3 p-3.5 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10">
                                                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), color: isBlackTheme ? '#000000' : '#FFFFFF' }}>
                                                    {i + 1}
                                                </div>
                                                <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-color)' }} dangerouslySetInnerHTML={{ __html: point }}></p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sunan */}
                            {selectedDetail.sunan && selectedDetail.sunan.length > 0 && (
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 dark:bg-emerald-950/10 space-y-2">
                                    <h4 className="font-bold text-xs flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <Sparkles size={16} /> سنن وآداب نبوية مستحبة
                                    </h4>
                                    <ul className="space-y-1.5 text-xs">
                                        {selectedDetail.sunan.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start" style={{ color: 'var(--text-color)' }}>
                                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Mistakes to avoid */}
                            {selectedDetail.mistakes && selectedDetail.mistakes.length > 0 && (
                                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 dark:bg-orange-950/20 space-y-2">
                                    <h4 className="font-bold text-xs flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                        <AlertTriangle size={16} /> أخطاء ومحاذير شائعة احذر منها
                                    </h4>
                                    <ul className="space-y-1.5 text-xs">
                                        {selectedDetail.mistakes.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start" style={{ color: 'var(--text-color)' }}>
                                                <ShieldAlert size={14} className="text-orange-500 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white/5 border-t border-white/10">
                            <button 
                                onClick={() => setSelectedDetail(null)} 
                                className="w-full py-3.5 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all"
                                style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), color: isBlackTheme ? '#000000' : '#FFFFFF' }}
                            >
                                فهمت، جزاكم الله خيراً
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {zoomedDuaa && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={closeZoomModal}>
                    <div className="themed-card p-8 rounded-3xl w-full max-w-2xl text-center relative flex flex-col max-h-[90vh]" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }} onClick={e => e.stopPropagation()}>
                        <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                            <p className="text-3xl md:text-4xl leading-relaxed font-amiri" dangerouslySetInnerHTML={{ __html: zoomedDuaa.text }}></p>
                        </div>

                        <div className="mt-6 shrink-0">
                            <button onClick={closeZoomModal} className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity">إغلاق</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const HomeScreen = ({ setScreen, theme, cardBorderColor }: { setScreen: any, theme: any, cardBorderColor?: string }) => {
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');
    return (
     <section id="home-screen" className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
                { id: 'umrah', icon: <Compass size={20} />, label: 'دليل العمرة' },
                { id: 'hajj', icon: <Tent size={20} />, label: 'دليل الحج' },
                { id: 'counters', icon: <RotateCcw size={20} />, label: 'عَدّاد الطواف' },
                { id: 'duaa', icon: <BookOpen size={20} />, label: 'أدعية وأذكار' }
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => setScreen(item.id)} 
                    className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:bg-white/20 transition-all duration-300"
                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                >
                    <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-inner border border-black/5" 
                         style={{ 
                            backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#FFFFFF' : `${theme.palette[0]}20`), 
                            color: isBlackTheme ? '#000000' : (isDefaultTheme ? '#000000' : theme.palette[0]) 
                         }}>
                        {item.icon}
                    </div>
                    <h2 className="relative z-10 font-bold text-sm mt-2" style={{ color: 'var(--text-color)' }}>{item.label}</h2>
                </button>
            ))}
            
            <button 
                onClick={() => setScreen('checklist')} 
                className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:bg-white/20 transition-all duration-300 col-span-2"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-inner border border-black/5" 
                     style={{ 
                        backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#FFFFFF' : `${theme.palette[0]}20`), 
                        color: isBlackTheme ? '#000000' : (isDefaultTheme ? '#000000' : theme.palette[0]) 
                     }}>
                    <ListChecks size={20} />
                </div>
                <h2 className="relative z-10 font-bold text-sm mt-2" style={{ color: 'var(--text-color)' }}>قائمة التجهيزات والأمتعة</h2>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {homeScreenAdditions.map((item, index) => {
                let IconComponent = Info;
                if (item.icon === 'fa-gem') IconComponent = BookOpen;
                if (item.icon === 'fa-ban') IconComponent = Ban;
                if (item.icon === 'fa-map-location-dot') IconComponent = MapPin;
                if (item.icon === 'fa-circle-question') IconComponent = HelpCircle;

                return (
                 <div key={index} className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-lg" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="font-bold text-base mb-2 flex items-center gap-2" style={{color: (isBlackTheme ? '#FFFFFF' : (theme.name === 'أبيض وأسود' ? theme.textColor : theme.palette[index % theme.palette.length]))}}>
                        <IconComponent size={16} />
                        <span>{item.title}</span>
                    </h3>
                    {item.type === 'hadith' ? (
                        <p className="text-xs leading-relaxed pr-3 border-r-2 font-medium" style={{ color: 'var(--text-color)', borderColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>{item.content[0]}</p>
                    ) : (
                        <ul className="space-y-1.5 opacity-90 mt-2">
                            {item.content.map((point, pi) => (
                                <li key={pi} className="flex gap-2 items-start text-xs font-medium" style={{ color: 'var(--text-color)' }}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 opacity-60" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}></div>
                                    <span className="flex-1 leading-relaxed opacity-80">{point}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                );
            })}
             <div className="col-span-1 md:col-span-2 bg-orange-500/5 dark:bg-orange-900/10 rounded-xl p-4 backdrop-blur-md" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-2 text-base">
                    <ShieldAlert size={16} />
                    <span>تنبيه هام</span>
                </h3>
                <p className="leading-relaxed text-xs" style={{ color: 'var(--text-color)' }}>ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية.</p>
            </div>
        </div>
    </section>
    );
};

const UmrahScreen = ({ theme, onSelectDetail, cardBorderColor }: { theme: any, onSelectDetail: any, cardBorderColor?: string }) => {
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');
    const [showVirtues, setShowVirtues] = useState(false);

    return (
     <section id="umrah-screen" className="space-y-4">
        {/* Intro Banner */}
        <div className="rounded-2xl p-4 text-center backdrop-blur-sm shadow-md" 
             style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : (isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15`), borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <p className="font-amiri text-base font-bold text-amber-700 dark:text-amber-300">﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾ [البقرة: 196]</p>
            <p className="text-xs opacity-75 mt-1" style={{ color: 'var(--text-color)' }}>دليل مناسك العمرة خطوة بخطوة موثقة بالقرآن الكريم وصحيح السنة النبوية</p>
        </div>

        {/* Card: فضائل العمرة من الكتاب والسنة */}
        <div className="themed-card rounded-2xl overflow-hidden backdrop-blur-md shadow-md" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <button 
                onClick={() => setShowVirtues(!showVirtues)}
                className="w-full p-3.5 flex items-center justify-between transition-colors bg-white/5 hover:bg-white/10 text-right"
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}25`, color: isBlackTheme ? '#000000' : theme.palette[0] }}>
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>فضائل العمرة في القرآن والسنة</h3>
                        <p className="text-[11px] opacity-70">تكفير الذنوب، نفي الفقر، ومضاعفة الأجر كأجر حجة</p>
                    </div>
                </div>
                {showVirtues ? <ChevronUp size={18} style={{ color: 'var(--text-color)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-color)' }} />}
            </button>

            {showVirtues && (
                <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/10">
                    {umrahVirtues.map((v, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>{v.title}</span>
                                <span className="text-[10px] opacity-60 font-mono">{v.source}</span>
                            </div>
                            <p className="text-sm font-amiri text-amber-600 dark:text-amber-300 font-semibold">{v.text}</p>
                            <p className="text-xs opacity-80 leading-relaxed" style={{ color: 'var(--text-color)' }}>{v.explanation}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* General Info Grid: الأركان، الواجبات، السنن، المفسدات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button 
                onClick={() => onSelectDetail({
                    icon: '🕌',
                    title: 'أركان العمرة الثلاثة',
                    subtitle: 'لا تصح العمرة إلا بها ولا تُجبر بدم بإجماع العلماء',
                    points: umrahGeneralInfo.arkan,
                    quranAyah: '﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾ [البقرة: 196]، وقوله تعالى: ﴿ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ ﴾ [الحج: 29]',
                    hadith: 'قال رسول الله ﷺ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» وقال: «اسْعَوْا فَإِنَّ اللهَ كَتَبَ عَلَيْكُمُ السَّعْيَ»'
                })}
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 text-right hover:bg-white/20 transition-all group" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]) }}>الأركان (3)</span>
                    <CheckCircle2 size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>الإحرام، الطواف 7 أشواط، السعي 7 أشواط</p>
            </button>

            <button 
                onClick={() => onSelectDetail({
                    icon: '📜',
                    title: 'واجبات العمرة',
                    subtitle: 'من ترك واجباً لزمه دم (شاة) وعمرته صحيحة',
                    points: umrahGeneralInfo.wajibat,
                    hadith: 'قال رسول الله ﷺ: «هُنَّ لَهُنَّ، وَلِمَنْ أَتَى عَلَيْهِنَّ...» وقال: «اللَّهُمَّ ارْحَمِ المُحَلِّقِينَ»'
                })}
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 text-right hover:bg-white/20 transition-all group" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]) }}>الواجبات (2)</span>
                    <ListChecks size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>الإحرام من الميقات، الحلق أو التقصير</p>
            </button>

            <button 
                onClick={() => onSelectDetail({
                    icon: '✨',
                    title: 'سنن وآداب العمرة النبوية',
                    subtitle: 'أعمال مستحبة تزيد في الأجر والاقتداء بالنبي ﷺ',
                    points: umrahGeneralInfo.sunan,
                    hadith: 'كان رسول الله ﷺ يكثر من التلبية ويضطبع ويرمل في الثلاثة أشواط الأولى في طواف العمرة'
                })}
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 text-right hover:bg-white/20 transition-all group" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]) }}>السنن (8)</span>
                    <Sparkles size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>الغسل، الطيب، التلبية، الرمل، الاضطباع...</p>
            </button>

            <button 
                onClick={() => onSelectDetail({
                    icon: '⚠️',
                    title: 'مفسدات ومحظورات العمرة',
                    subtitle: 'أعمال تبطل العمرة أو توجب الفدية',
                    points: umrahGeneralInfo.mufsidat,
                    quranAyah: '﴿ فَمَن فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ ﴾ [البقرة: 197]'
                })}
                className="bg-orange-500/10 dark:bg-orange-950/30 backdrop-blur-md rounded-xl p-3 text-right hover:bg-orange-500/20 transition-all group" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-orange-600 dark:text-orange-400">المفسدات (3)</span>
                    <ShieldAlert size={14} className="text-orange-500" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>الجماع قبل التحلل، ترك ركن، ارتكاب المحظورات</p>
            </button>
        </div>

        {/* الخطوات التسع التفصيلية */}
        <div className="space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <Compass className="w-5 h-5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }} />
                <span>خطوات مناسك العمرة بالدليل من الكتاب والسنة</span>
            </h3>
            {umrahSteps.map((step, index) => (
                <button 
                    key={step.title} 
                    onClick={() => onSelectDetail(step)}
                    className="w-full text-right themed-card backdrop-blur-md rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-lg transition-all active:scale-[0.982] group"
                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm md:text-base leading-snug" style={{ color: 'var(--text-color)' }}>{step.title}</h4>
                        </div>
                        {step.subtitle && (
                            <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: 'var(--text-color)' }}>{step.subtitle}</p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap text-[10px]">
                            {step.quranAyah && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">دليل قرآني 📖</span>
                            )}
                            {step.hadith && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">سنة نبوية 📜</span>
                            )}
                            {step.points && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium">{step.points.length} نقاط فقهية</span>
                            )}
                        </div>
                    </div>

                    <ChevronLeft size={18} className="opacity-30 group-hover:opacity-60 transition-opacity shrink-0" style={{ color: 'var(--text-color)' }} />
                </button>
            ))}
        </div>
    </section>
    );
};

const HajjScreen = ({ hajjType, setHajjType, theme, onSelectDetail, cardBorderColor }: { hajjType: any, setHajjType: any, theme: any, onSelectDetail: any, cardBorderColor?: string }) => {
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');

    const currentType = hajjTypes[hajjType];

    return (
     <section id="hajj-screen" className="space-y-4">
        {/* Quran Intro Banner */}
        <div className="rounded-2xl p-4 text-center backdrop-blur-sm shadow-md"
             style={{ backgroundColor: isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15`, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <p className="font-amiri text-base font-bold text-amber-700 dark:text-amber-300">﴿ وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا ﴾ [آل عمران: 97]</p>
            <p className="text-xs opacity-75 mt-1" style={{ color: 'var(--text-color)' }}>«العُمْرَةُ إِلَى العُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا، وَالحَجُّ المَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الجَنَّةُ» [متفق عليه]</p>
        </div>

        {/* General Info Grid: الأركان (4)، الواجبات (7)، السنن (8)، المفسدات (3) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button 
                onClick={() => onSelectDetail({
                    icon: '🕋',
                    title: 'أركان الحج الأربعة',
                    subtitle: 'لا يصح الحج إلا بها جميعاً، وفوات واحد منها يبطل الحج ولا يُجبر بدم',
                    points: hajjGeneralInfo.arkan,
                    quranAyah: '﴿ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ ﴾ [الحج: 29]',
                    hadith: 'قال رسول الله ﷺ: «الحَجُّ عَرَفَةُ» وقال: «اسْعَوْا فَإِنَّ اللهَ كَتَبَ عَلَيْكُمُ السَّعْيَ»'
                })}
                className="themed-card backdrop-blur-md rounded-xl p-3 text-right hover:bg-white/20 transition-all group"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isDefaultTheme ? '#000000' : theme.palette[0] }}>الأركان (4)</span>
                    <CheckCircle2 size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>الإحرام، عرفة، طواف الإفاضة، السعي</p>
            </button>

            <button 
                onClick={() => onSelectDetail({
                    icon: '📜',
                    title: 'واجبات الحج السبعة',
                    subtitle: 'من ترك واجباً منها لزمه دم (شاة) يذبحها في مكة ويوزعها على فقرائها وحجه صحيح',
                    points: hajjGeneralInfo.wajibat,
                    hadith: 'عن ابن عباس رضي الله عنهما: «مَنْ نَسِيَ مِنْ نُسُكِهِ شَيْئًا أَوْ تَرَكَهُ فَلْيُهْرِقْ دَمًا» [موطأ مالك]'
                })}
                className="themed-card backdrop-blur-md rounded-xl p-3 text-right hover:bg-white/20 transition-all group"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isDefaultTheme ? '#000000' : theme.palette[0] }}>الواجبات (7)</span>
                    <ListChecks size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>الميقات، الوقوف للمغرب، مزدلفة، منى، الجمار، الحلق، الوداع</p>
            </button>

            <button 
                onClick={() => onSelectDetail({
                    icon: '✨',
                    title: 'سنن الحج وآدابه النبوية',
                    subtitle: 'أعمال مستحبة ترفع الدرجات وتكمل الأجر اقتداءً بالنبي ﷺ',
                    points: hajjGeneralInfo.sunan,
                    hadith: 'قال رسول الله ﷺ في حجة الوداع: «لِتَأْخُذُوا مَنَاسِكَكُمْ، فَإِنِّي لَا أَدْرِي لَعَلِّي لَا أَحُجُّ بَعْدَ حَجَّتِي هَذِهِ» [صحيح مسلم]'
                })}
                className="themed-card backdrop-blur-md rounded-xl p-3 text-right hover:bg-white/20 transition-all group"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isDefaultTheme ? '#000000' : theme.palette[0] }}>السنن (8)</span>
                    <Sparkles size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>المبيت بمنى ليلة عرفة، طواف القدوم، الجمع بنمرة، التلبية...</p>
            </button>

            <button 
                onClick={() => onSelectDetail({
                    icon: '⚠️',
                    title: 'مفسدات الحج ومحظوراته',
                    subtitle: 'ما يبطل الحج بالكلية أو يوجب الفدية والدم',
                    points: hajjGeneralInfo.mufsidat,
                    quranAyah: '﴿ الْحَجُّ أَشْهُرٌ مَّعْلُومَاتٌ فَمَن فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ ﴾ [البقرة: 197]'
                })}
                className="bg-orange-500/10 dark:bg-orange-950/30 backdrop-blur-md rounded-xl p-3 text-right hover:bg-orange-500/20 transition-all group"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-orange-600 dark:text-orange-400">المفسدات (3)</span>
                    <ShieldAlert size={14} className="text-orange-500" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>الجماع قبل التحلل، فوات عرفة، ترك ركن</p>
            </button>
        </div>

        {/* القسم الرئيسي: أنواع الحج الثلاثة بشرح عميق ومفصل من الكتاب والسنة */}
        <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <Scale className="w-5 h-5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }} />
                    <span>أنواع الحج الثلاثة وأحكامها من الكتاب والسنة</span>
                </h3>
            </div>

            {/* أزرار اختيار نوع الحج الثلاثة */}
            <div className="grid grid-cols-3 gap-2">
                {Object.keys(hajjTypes).map(key => {
                    const isSelected = hajjType === key;
                    return (
                        <button key={key} onClick={() => setHajjType(key)} 
                            className={`px-3 py-2.5 rounded-xl font-bold transition-all text-xs md:text-sm flex flex-col items-center gap-1 ${isSelected ? 'shadow-md scale-[1.02]' : 'bg-white/5 hover:bg-white/10'}`}
                            style={{ 
                                backgroundColor: isSelected ? (isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0])) : 'transparent',
                                borderColor: isSelected ? (isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0])) : cardBorderColor,
                                borderWidth: '1.5px',
                                borderStyle: 'solid',
                                color: isSelected ? (isBlackTheme ? '#000000' : '#FFFFFF') : 'var(--text-color)', 
                                opacity: isSelected ? 1 : 0.75 
                            }}
                        >
                            <span>{hajjTypes[key].name}</span>
                        </button>
                    );
                })}
            </div>

            {/* بطاقة الشرح التفصيلي للنوع المختار */}
            {currentType && (
                <div className="themed-card rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-xl border space-y-4" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    {/* Header + Badge */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-lg md:text-xl font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                    {currentType.name}
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    {currentType.badge}
                                </span>
                            </div>
                            <p className="text-xs opacity-80 mt-1 leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                {currentType.definition}
                            </p>
                        </div>

                        <button 
                            onClick={() => onSelectDetail({
                                icon: '📖',
                                title: `${currentType.name} - الدليل والأحكام الكاملة`,
                                subtitle: currentType.badge,
                                definition: currentType.definition,
                                quranEvidence: currentType.quranEvidence,
                                sunnahEvidence: currentType.sunnahEvidence,
                                hadyRuling: currentType.hadyRuling,
                                whoIsItFor: currentType.whoIsItFor,
                                detailedSteps: currentType.detailedSteps,
                                comparison: currentType.comparison
                            })}
                            className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                            style={{ 
                                backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), 
                                color: isBlackTheme ? '#000000' : '#FFFFFF' 
                            }}
                        >
                            <ScrollText size={14} />
                            <span>عرض الدليل والخطوات كاملة</span>
                        </button>
                    </div>

                    {/* الأدلة من القرآن والسنة */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* الدليل القرآني */}
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20 space-y-1.5">
                            <span className="font-bold text-xs flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                                <BookOpen size={14} /> الدليل من القرآن الكريم
                            </span>
                            {currentType.quranEvidence.map((ev: string, idx: number) => (
                                <p key={idx} className="text-xs md:text-sm font-amiri leading-relaxed text-amber-900 dark:text-amber-200">
                                    {ev}
                                </p>
                            ))}
                        </div>

                        {/* الدليل من السنة النبوية */}
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/20 space-y-1.5">
                            <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                                <ScrollText size={14} /> الدليل من السنة النبوية
                            </span>
                            {currentType.sunnahEvidence.slice(0, 2).map((ev: string, idx: number) => (
                                <p key={idx} className="text-xs leading-relaxed text-emerald-950 dark:text-emerald-200">
                                    {ev}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* حكم الهدي والفدية */}
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 dark:bg-purple-950/20 space-y-1">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                            <Scale size={14} /> حكم الهدي وصيام الأيام العشرة البديلة
                        </span>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-color)' }}>
                            {currentType.hadyRuling}
                        </p>
                    </div>

                    {/* المقارنة الفقهية السريعة */}
                    <div className="p-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 space-y-2">
                        <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                            <ListChecks size={14} /> الفروق الفقهية الجوهرية لـ ({currentType.name})
                        </span>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">الإحرام</span>
                                <span className="leading-tight">{currentType.comparison.ihram}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">التحلل</span>
                                <span className="leading-tight">{currentType.comparison.tahallul}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">الطواف</span>
                                <span className="leading-tight">{currentType.comparison.tawaf}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">السعي</span>
                                <span className="leading-tight">{currentType.comparison.sai}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center col-span-2 md:col-span-1">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">الهدي</span>
                                <span className="leading-tight">{currentType.comparison.hady}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* الجدول الزمني والمحطات العملية */}
        <div className="pt-2">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <Map className="w-5 h-5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }} /> 
                <span>المخطط الزمني لمحطات النسك يوماً بيوم ({currentType?.name || ''})</span>
            </h3>
            <div className="space-y-2.5">
                {(hajjType === 'tamattu' ? hajjTamattuPlan : hajjType === 'ifrad' ? hajjIfradPlan : hajjQiranPlan).map((day, i) => (
                    <button 
                        key={i} 
                        onClick={() => onSelectDetail({ 
                            title: day.day, 
                            subtitle: day.summary,
                            evidence: day.evidence,
                            points: day.actions, 
                            icon: <div className="text-2xl">{day.icon}</div> 
                        })}
                        className="w-full text-right themed-card backdrop-blur-md rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-lg transition-all active:scale-[0.982] group"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm md:text-base" style={{ color: 'var(--text-color)' }}>{day.day}</h5>
                            <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: 'var(--text-color)' }}>{day.summary}</p>
                            {day.evidence && (
                                <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium mt-1 truncate">
                                    📜 {day.evidence}
                                </p>
                            )}
                        </div>

                        <ChevronLeft size={18} className="opacity-30 group-hover:opacity-60 transition-opacity shrink-0" style={{ color: 'var(--text-color)' }} />
                    </button>
                ))}
            </div>
        </div>
    </section>
    );
};

const DuaaScreen = ({ theme, openDuaaId, onToggle, onZoom, cardBorderColor }: { theme: any, openDuaaId: any, onToggle: any, onZoom: any, cardBorderColor?: string }) => {
    const isBlackTheme = theme.bgColor === '#000000';
    return (
        <section id="duaa-screen" className="space-y-4">
             <div className="rounded-xl p-3 text-center mb-3 backdrop-blur-sm"
                  style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1.5" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}20` }}>
                    <BookOpen className="w-5 h-5" style={{ color: isBlackTheme ? '#000000' : theme.palette[0] }} />
                </div>
                <p className="text-xs opacity-70">أدعية مختارة لمناسك الحج والعمرة.</p>
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
                    />
                ))}
            </div>
        </section>
    );
};


export default HajjUmrah;
