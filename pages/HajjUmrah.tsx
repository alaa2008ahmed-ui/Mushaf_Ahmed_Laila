
import React, { useState, useEffect, FC } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { umrahSteps, hajjTypes, hajjTamattuPlan, hajjIfradPlan, hajjQiranPlan, hajjGeneralInfo, allDuaas, homeScreenAdditions } from '../data/hajjUmrahData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronLeft, ChevronRight, ChevronDown, Map, Heart, Compass, 
    BookOpen, Info, ShieldAlert, ListChecks, Plus, Minus, RotateCcw, Tent,
    ZoomIn, CheckCircle2, Circle, ArrowLeft, Footprints,
    Ban, HelpCircle, MapPin
} from 'lucide-react';

interface DuaaSectionProps {
    id: number;
    title: string;
    items: string[];
    isOpen: boolean;
    onToggle: () => void;
    onZoom: (item: string) => void;
}

const DuaaSection: FC<DuaaSectionProps> = ({ id, title, items, isOpen, onToggle, onZoom }) => {
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
        <div id={`duaa-section-${id}`} className="themed-card rounded-2xl overflow-hidden mb-3 backdrop-blur-sm">
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
                            <div className="flex flex-col gap-4 p-5 rounded-xl bg-white/10 dark:bg-gray-800/40 shadow-sm relative min-h-[160px] justify-center items-center text-center">
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

const ChecklistScreen = ({ theme }) => {
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
            <div className="rounded-2xl p-4 text-center backdrop-blur-sm border" style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, borderColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${theme.palette[0]}30` }}>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}20` }}>
                    <ListChecks className="w-6 h-6" style={{ color: isBlackTheme ? '#000000' : theme.palette[0] }} />
                </div>
                <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>حدد الأشياء التي قمت بتجهيزها لرحلتك.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                    <div key={i} className="themed-card backdrop-blur-md rounded-xl p-3">
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

const CountersScreen = ({ theme }) => {
    const isBlackTheme = theme.bgColor === '#000000';
    const [tawaf, setTawaf] = useState(0);
    const [sai, setSai] = useState(0);
    const [activeTab, setActiveTab] = useState<'tawaf'|'sai'>('tawaf');

    const increment = () => {
        if (activeTab === 'tawaf') {
            if (tawaf < 7) setTawaf(tawaf + 1);
        } else {
            if (sai < 7) setSai(sai + 1);
        }
    };

    const reset = () => {
        if (activeTab === 'tawaf') setTawaf(0);
        else setSai(0);
    };

    const currentCount = activeTab === 'tawaf' ? tawaf : sai;

    return (
        <section className="space-y-4">
            <div className="backdrop-blur-md rounded-2xl p-4 text-center border" style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, borderColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${theme.palette[0]}20` }}>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}20` }}>
                    <RotateCcw className="w-6 h-6" style={{ color: isBlackTheme ? '#000000' : theme.palette[0] }} />
                </div>
                <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>أداة مساعدة لعد أشواط الطواف والسعي.</p>
            </div>

            <div className="flex bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl p-1 rounded-2xl border border-white/20">
                <button 
                    onClick={() => setActiveTab('tawaf')} 
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${activeTab === 'tawaf' ? (isBlackTheme ? 'text-black shadow-lg' : 'text-white shadow-lg') : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: activeTab === 'tawaf' ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent',
                        color: activeTab === 'tawaf' ? (isBlackTheme ? 'black' : 'white') : 'var(--text-color)' 
                    }}
                >
                    الطواف
                </button>
                <button 
                    onClick={() => setActiveTab('sai')} 
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${activeTab === 'sai' ? (isBlackTheme ? 'text-black shadow-lg' : 'text-white shadow-lg') : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: activeTab === 'sai' ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent',
                        color: activeTab === 'sai' ? (isBlackTheme ? 'black' : 'white') : 'var(--text-color)' 
                    }}
                >
                    السعي
                </button>
            </div>

            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-5 flex flex-col items-center justify-center shadow-xl border border-white/20 min-h-[220px]">
                <div className="relative mb-5">
                     <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="5" fill="none" className="text-white/10 dark:text-gray-700" />
                        <circle cx="64" cy="64" r="58" stroke={isBlackTheme ? '#FFFFFF' : theme.palette[0]} strokeWidth="5" fill="none" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * currentCount) / 7} style={{ transition: 'stroke-dashoffset 0.5s ease' }} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-bold font-mono" style={{ color: theme.isDark ? '#ffffff' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]), textShadow: isBlackTheme ? '0 0 20px rgba(255,255,255,0.3)' : `0 0 20px ${theme.palette[0]}4D` }}>{currentCount}</span>
                         <span className="text-[10px] font-bold mt-0.5 opacity-50" style={{ color: 'var(--text-color)' }}>من 7</span>
                    </div>
                </div>

                <div className="flex gap-2.5 w-full max-w-xs">
                    <button onClick={reset} className="p-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center">
                        <RotateCcw size={18} style={{ color: 'var(--text-color)' }} />
                    </button>
                    <button onClick={increment} disabled={currentCount >= 7} 
                            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base shadow-lg ${currentCount >= 7 ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'active:scale-95 text-white'}`}
                            style={{ backgroundColor: currentCount >= 7 ? '#9ca3af' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]), color: (currentCount < 7 && isBlackTheme) ? '#000000' : 'white' }}>
                        {currentCount >= 7 ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                        <span>{currentCount >= 7 ? 'اكتمل' : 'شوط جديد'}</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

function HajjUmrah({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');
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
            case 'umrah': return <UmrahScreen key="umrah" theme={theme} onSelectDetail={setSelectedDetail} />;
            case 'hajj': return <HajjScreen key="hajj" hajjType={hajjType} setHajjType={setHajjType} theme={theme} onSelectDetail={setSelectedDetail} />;
            case 'duaa': return <DuaaScreen key="duaa" theme={theme} openDuaaId={openDuaaId} onToggle={handleDuaaToggle} onZoom={openZoomModal} />;
            case 'checklist': return <ChecklistScreen key="checklist" theme={theme} />;
            case 'counters': return <CountersScreen key="counters" theme={theme} />;
            default: return <HomeScreen key="home" setScreen={setScreen} theme={theme} />;
        }
    };

    const handleHomeClick = () => {
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
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            {screen === 'home' && <ThemePageLock />}
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            {getScreenTitle()}
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle">
                        {getScreenSubtitle()}
                    </p>
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto px-4 pt-0 flex-1 overflow-y-auto pb-2">
                {renderScreen()}
                <div className="w-full h-24 shrink-0"></div>
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            {selectedDetail && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-hidden" onClick={() => setSelectedDetail(null)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="themed-card w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl border border-white/20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15` }}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : `${theme.palette[0]}30`), color: isBlackTheme ? '#000000' : (isDefaultTheme ? '#FFFFFF' : theme.palette[0]) }}>
                                    {selectedDetail.icon || <Info />}
                                </div>
                                <h3 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-color)' }}>{selectedDetail.title}</h3>
                            </div>
                            <button onClick={() => setSelectedDetail(null)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition">
                                <RotateCcw size={20} className="rotate-45" style={{ color: 'var(--text-color)' }} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {selectedDetail.text && (
                                <div className="text-lg leading-relaxed text-right font-medium" 
                                     style={{ color: 'var(--text-color)' }} 
                                     dangerouslySetInnerHTML={{ __html: selectedDetail.text.replaceAll('{{THEME_PALETTE_0}}', theme.palette[0]) }}>
                                </div>
                            )}

                            {selectedDetail.points && (
                                <ul className="space-y-3">
                                    {selectedDetail.points.map((point, i) => (
                                        <li key={i} className="flex gap-3 p-4 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10">
                                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), color: isBlackTheme ? '#000000' : '#FFFFFF' }}>
                                                {i + 1}
                                            </div>
                                            <p className="flex-1 text-base leading-relaxed" style={{ color: 'var(--text-color)' }} dangerouslySetInnerHTML={{ __html: point }}></p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

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
                    <div className="themed-card p-8 rounded-3xl w-full max-w-2xl text-center relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
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

const HomeScreen = ({ setScreen, theme }) => {
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
                    className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg hover:bg-white/20 transition-all duration-300"
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
                className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg hover:bg-white/20 transition-all duration-300 col-span-2"
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
                 <div key={index} className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 dark:border-white/5 shadow-lg">
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
             <div className="col-span-1 md:col-span-2 bg-orange-500/5 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-500/20 backdrop-blur-md">
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

const UmrahScreen = ({ theme, onSelectDetail }) => {
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');
    
    return (
     <section id="umrah-screen" className="space-y-4">
        <div className="rounded-xl p-3 text-center border backdrop-blur-sm" 
             style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : (isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15`), borderColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : (isDefaultTheme ? '#00000020' : `${theme.palette[0]}20`) }}>
            <p className="text-sm opacity-70">زيارة مخصوصة لبيت الله الحرام بأركان محددة.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-2" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]) }}>
                    <CheckCircle2 size={16} /> الأركان
                </h3>
                <ul className="space-y-1 text-[10px] opacity-80" style={{ color: 'var(--text-color)' }}>
                    <li className="flex gap-1 items-center"><Circle size={3} className="fill-current" /> النية</li>
                    <li className="flex gap-1 items-center"><Circle size={3} className="fill-current" /> الطواف</li>
                    <li className="flex gap-1 items-center"><Circle size={3} className="fill-current" /> السعي</li>
                </ul>
            </div>
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-2" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]) }}>
                    <ListChecks size={16} /> الواجبات
                </h3>
                <ul className="space-y-1 text-[10px] opacity-80" style={{ color: 'var(--text-color)' }}>
                    <li className="flex gap-1 items-center"><Circle size={3} className="fill-current" /> الميقات</li>
                    <li className="flex gap-1 items-center"><Circle size={3} className="fill-current" /> الحلق</li>
                </ul>
            </div>
            <div className="bg-orange-500/5 dark:bg-orange-900/20 backdrop-blur-md rounded-xl p-3 border border-orange-500/10 col-span-2 md:col-span-1">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-2" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : '#f97316') }}>
                    <ShieldAlert size={16} /> المفسدات
                </h3>
                 <ul className="space-y-1 text-[10px] opacity-80" style={{ color: 'var(--text-color)' }}>
                    <li className="flex gap-1 items-center"><Circle size={3} className="fill-current" /> ترك ركن</li>
                    <li className="flex gap-1 items-center"><Circle size={3} className="fill-current" /> الجماع</li>
                </ul>
            </div>
        </div>

         <div className="space-y-3">
            {umrahSteps.map((step, index) => (
                <button 
                    key={step.title} 
                    onClick={() => onSelectDetail(step)}
                    className="w-full text-right themed-card backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all active:scale-[0.982] group"
                >
                    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner" 
                         style={{ 
                            backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : `${theme.palette[0]}20`), 
                            color: isBlackTheme ? '#000000' : (isDefaultTheme ? '#FFFFFF' : theme.palette[0]) 
                         }}>
                        {step.icon}
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-base" style={{ color: 'var(--text-color)' }}>{step.title}</h4>
                    </div>

                    <ChevronLeft size={18} className="opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-color)' }} />
                </button>
            ))}
        </div>
    </section>
    );
};

const HajjScreen = ({ hajjType, setHajjType, theme, onSelectDetail }) => {
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');

    return (
     <section id="hajj-screen" className="space-y-4">
        <div className="rounded-xl p-3 text-center border backdrop-blur-sm"
             style={{ backgroundColor: isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15`, borderColor: isDefaultTheme ? '#00000020' : `${theme.palette[0]}20` }}>
            <p className="text-sm opacity-70">المخطط الزمني للأيام المخصصة لأداء المناسك.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
            {Object.keys(hajjTypes).map(key => (
                <button key={key} onClick={() => setHajjType(key)} 
                    className={`px-2 py-2 rounded-lg font-bold transition-all border text-xs ${hajjType === key ? 'shadow-md' : 'bg-white/10 text-gray-400 border-white/20'}`}
                    style={{ 
                        backgroundColor: hajjType === key ? (isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0])) : 'transparent',
                        borderColor: hajjType === key ? (isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0])) : 'var(--white-20)',
                        color: hajjType === key ? (isBlackTheme ? '#000000' : '#FFFFFF') : 'var(--text-color)', 
                        opacity: hajjType === key ? 1 : 0.6 
                    }}
                >
                    {hajjTypes[key].name}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
                { title: 'الأركان', items: hajjGeneralInfo.arkan, color: isDefaultTheme ? '#000000' : theme.palette[0], icon: <CheckCircle2 size={14}/> },
                { title: 'الواجبات', items: hajjGeneralInfo.wajibat, color: isDefaultTheme ? '#000000' : theme.palette[0], icon: <ListChecks size={14}/> },
                { title: 'المفسدات', items: hajjGeneralInfo.mufsidat, color: isDefaultTheme ? '#000000' : '#f97316', icon: <ShieldAlert size={14}/> }
            ].map((section, idx) => (
                <div key={idx} className="themed-card backdrop-blur-md rounded-xl p-3">
                    <h3 className="font-bold text-xs mb-1.5 flex items-center gap-2" style={{ color: section.color }}>
                        {section.icon} {section.title}
                    </h3>
                    <ul className="space-y-0.5 text-[10px] opacity-80" style={{ color: 'var(--text-color)' }}>
                        {section.items.slice(0, 4).map((item, i) => (
                            <li key={i} className="flex gap-1 items-center"><Circle size={3} className="fill-current opacity-30" />{item}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

        <div className="mt-4">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Map className="w-5 h-5" /> الجدول الزمني
            </h3>
            <div className="space-y-3">
                {(hajjType === 'tamattu' ? hajjTamattuPlan : hajjType === 'ifrad' ? hajjIfradPlan : hajjQiranPlan).map((day, i) => (
                    <button 
                        key={i} 
                        onClick={() => onSelectDetail({ title: day.day, points: day.actions, icon: <div className="text-2xl">{day.icon}</div> })}
                        className="w-full text-right themed-card backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all active:scale-[0.982] group"
                    >
                        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner" 
                             style={{ 
                                backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : `${theme.palette[0]}20`), 
                                color: isBlackTheme ? '#000000' : (isDefaultTheme ? '#FFFFFF' : theme.palette[0]) 
                             }}>
                            {day.icon}
                        </div>

                        <div className="flex-1">
                            <h5 className="font-bold text-base" style={{ color: 'var(--text-color)' }}>{i+1}. {day.day}</h5>
                        </div>

                        <ChevronLeft size={18} className="opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-color)' }} />
                    </button>
                ))}
            </div>
        </div>
    </section>
    );
};

const DuaaScreen = ({ theme, openDuaaId, onToggle, onZoom }) => {
    const isBlackTheme = theme.bgColor === '#000000';
    return (
        <section id="duaa-screen" className="space-y-4">
             <div className="rounded-xl p-3 text-center mb-3 border backdrop-blur-sm"
                  style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, borderColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${theme.palette[0]}20` }}>
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
                    />
                ))}
            </div>
        </section>
    );
};


export default HajjUmrah;
