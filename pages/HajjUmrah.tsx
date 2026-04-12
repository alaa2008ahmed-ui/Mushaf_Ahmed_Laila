
import React, { useState, useEffect, FC } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { umrahSteps, hajjTypes, hajjTamattuPlan, hajjGeneralInfo, allDuaas, homeScreenAdditions } from '../data/hajjUmrahData';
import { registerBackInterceptor } from '../hooks/useBackButton';

interface DuaaSectionProps {
    title: string;
    items: string[];
    isOpen: boolean;
    onToggle: () => void;
    onZoom: (item: string) => void;
}

const DuaaSection: FC<DuaaSectionProps> = ({ title, items, isOpen, onToggle, onZoom }) => (
    <div>
        <h4 onClick={onToggle} className="font-bold themed-text mb-1 cursor-pointer flex justify-between items-center text-base">
            <span>{title}</span>
            <span className={`transform transition-transform themed-text-muted ${isOpen ? '' : 'rotate-[-90deg]'}`}>▼</span>
        </h4>
        {isOpen && (
             <ul className="list-disc pr-4 space-y-1.5 mt-2 themed-text text-sm md:text-base">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center justify-between">
                        <span dangerouslySetInnerHTML={{ __html: item }}></span>
                        <button onClick={() => onZoom(item)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <i className="fa-solid fa-magnifying-glass-plus text-lg"></i>
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

function HajjUmrah({ onBack }) {
    const { theme } = useTheme();
    const [screen, setScreen] = useState('home');
    const [hajjType, setHajjType] = useState('tamattu');
    const [openDuaaId, setOpenDuaaId] = useState<number | null>(null);
    const [zoomedDuaa, setZoomedDuaa] = useState(null);

    const handleDuaaToggle = (id: number) => {
        setOpenDuaaId(prevId => (prevId === id ? null : id));
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
            case 'umrah': return <UmrahScreen theme={theme} />;
            case 'hajj': return <HajjScreen hajjType={hajjType} setHajjType={setHajjType} theme={theme} />;
            case 'duaa': return <DuaaScreen openDuaaId={openDuaaId} onToggle={handleDuaaToggle} onZoom={openZoomModal} />;
            default: return <HomeScreen setScreen={setScreen} theme={theme} />;
        }
    };

    const handleHomeClick = () => {
        if (screen !== 'home') {
            setScreen('home');
        } else {
            onBack();
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent">
            <header className="app-top-bar">
                <div className="app-top-bar__inner gap-2">
                    <div className="relative flex items-center justify-center">

                        <h1 className="app-top-bar__title text-2xl md:text-3xl font-kufi tracking-wide">الحج والعمرة</h1>
                    </div>
                    <p className="app-top-bar__subtitle">دليل مبسّط لمناسك الحج والعمرة مع خطوات وأذكار واضحة</p>
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto px-4 pt-4 flex-grow overflow-y-auto pb-24">
                {renderScreen()}
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            {zoomedDuaa && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={closeZoomModal}>
                    <div className="themed-card p-8 rounded-3xl w-full max-w-2xl text-center relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={closeZoomModal} 
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors z-10"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>

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

const HomeScreen = ({ setScreen, theme }) => (
     <section id="home-screen" className="space-y-4">
        <div className="themed-card rounded-2xl p-4 mb-3">
            <p className="text-xl md:text-2xl mb-1 text-center font-amiri" style={{color: theme.name === 'أبيض وأسود' ? theme.textColor : theme.palette[1]}}>
                ﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾
            </p>
            <p className="text-xs md:text-sm text-center themed-text-muted">البقرة: 196</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => setScreen('umrah')} className="themed-card rounded-2xl px-4 py-5 text-right flex flex-col gap-2">
                <h2 className="text-lg md:text-xl font-bold mb-1" style={{color: theme.palette[0]}}>أداء العمرة</h2>
                <p className="text-sm themed-text-muted">خطوات عملية من الإحرام حتى الحلق أو التقصير مع الأركان والأدعية.</p>
            </button>
            <button onClick={() => setScreen('hajj')} className="themed-card rounded-2xl px-4 py-5 text-right flex flex-col gap-2">
                <h2 className="text-lg md:text-xl font-bold mb-1" style={{color: theme.palette[0]}}>أداء الحج</h2>
                <p className="text-sm themed-text-muted">تعرّف على أنواع الحج (التمتع، الإفراد، القران)، مع مخطط الأيام.</p>
            </button>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
             <div className="themed-card rounded-2xl p-3 cursor-pointer" onClick={() => setScreen('duaa')}>
                <h3 className="font-bold mb-1 text-sm">أدعية وأذكار الحج والعمرة</h3>
                <p className="leading-relaxed text-xs mb-2 themed-text-muted">مجموعة منتقاة وشاملة من الأدعية التي يناسب قولها في الطواف والسعي والوقوف بعرفة وسائر المناسك.</p>
            </div>
             <div className="themed-card rounded-2xl p-3">
                <h3 className="font-bold text-sm mb-1">قاعدة مهمة</h3>
                <p className="leading-relaxed text-xs themed-text-muted">ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية وقد يفسد النسك.</p>
            </div>
            {homeScreenAdditions.map((item, index) => (
                 <div key={index} className="themed-card rounded-2xl p-3">
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <i className={`fa-solid ${item.icon}`} style={{color: theme.name === 'أبيض وأسود' ? theme.textColor : theme.palette[index % 2]}}></i>
                        <span>{item.title}</span>
                    </h3>
                    {item.type === 'hadith' ? 
                        <p className="text-xs themed-text-muted leading-relaxed pr-2">{item.content[0]}<br/><span className="opacity-70 text-left block mt-1">{item.content[1]}</span></p> :
                        <ul className="list-disc pr-6 space-y-1 text-xs themed-text-muted">
                            {item.content.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    }
                </div>
            ))}
        </div>
    </section>
);

const UmrahScreen = ({ theme }) => (
     <section id="umrah-screen" className="space-y-4">
        <div className="themed-card rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-1">أداء العمرة</h2>
            <p className="text-sm themed-text-muted">العمرة زيارة لبيت الله الحرام على وجهٍ مخصوص مع الإحرام والطواف والسعي والحلق أو التقصير.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="themed-card rounded-2xl p-3">
                <h3 className="font-bold mb-1">أركان العمرة</h3>
                <ul className="list-disc pr-4 space-y-0.5 themed-text-muted">
                    <li>الإحرام (النية).</li>
                    <li>الطواف بالبيت.</li>
                    <li>السعي بين الصفا والمروة.</li>
                </ul>
            </div>
            <div className="themed-card rounded-2xl p-3">
                <h3 className="font-bold mb-1">واجبات العمرة</h3>
                <ul className="list-disc pr-4 space-y-0.5 themed-text-muted">
                    <li>الإحرام من الميقات.</li>
                    <li>الحلق أو التقصير.</li>
                </ul>
            </div>
            <div className="themed-card rounded-2xl p-3">
                <h3 className="font-bold mb-1">ما يفسد العمرة</h3>
                 <ul className="list-disc pr-4 space-y-0.5 themed-text-muted">
                    <li>الجماع قبل التحلّل.</li>
                    <li>ترك ركن من الأركان.</li>
                </ul>
            </div>
        </div>
         <h3 className="text-sm md:text-base font-bold themed-text mt-3 mb-1">📌 خطوات أداء العمرة</h3>
        <div className="space-y-3 text-sm">
            {umrahSteps.map((step) => {
                return (
                    <div key={step.title} className={`themed-card rounded-2xl p-3 flex gap-3`}>
                        <div className="text-2xl">{step.icon}</div>
                        <div>
                            <h4 className="font-bold mb-0.5">{step.title}</h4>
                            {step.points ? (
                                <ul className="list-disc pr-4 text-xs themed-text-muted space-y-1">
                                    {step.points.map((p, i) => <li key={i} dangerouslySetInnerHTML={{ __html: p }}></li>)}
                                </ul>
                            ) : (
                                <p className="text-xs themed-text-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: step.text.replace('{{THEME_PALETTE_0}}', theme.name === 'أبيض وأسود' ? theme.textColor : theme.palette[0]) }}></p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </section>
);

const HajjScreen = ({ hajjType, setHajjType, theme }) => (
     <section id="hajj-screen" className="space-y-4">
        <div className="themed-card rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-1">أداء الحج</h2>
            <p className="text-sm themed-text-muted">أنواع الحج: <span className="font-semibold">التمتع، الإفراد، القران</span>.</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 mb-1 text-xs">
            {Object.keys(hajjTypes).map(key => (
                 <button key={key} onClick={() => setHajjType(key)} className={`px-3 py-1 rounded-full font-semibold shadow-md transition-colors ${hajjType === key ? 'text-white' : 'themed-card'}`} style={{backgroundColor: hajjType === key ? theme.palette[1] : ''}}>
                    🕋 {hajjTypes[key].name}
                 </button>
            ))}
        </div>
        <div className="themed-card rounded-2xl p-3 text-xs themed-text-muted">
            <b>{hajjTypes[hajjType].name}:</b> {hajjTypes[hajjType].description}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-2">
            <div className="themed-card rounded-2xl p-3"><h3 className="font-bold mb-1">أركان الحج</h3><ul className="list-disc pr-4 space-y-0.5 themed-text-muted">{hajjGeneralInfo.arkan.map((item, i)=><li key={i}>{item}</li>)}</ul></div>
            <div className="themed-card rounded-2xl p-3"><h3 className="font-bold mb-1">واجبات الحج</h3><ul className="list-disc pr-4 space-y-0.5 themed-text-muted">{hajjGeneralInfo.wajibat.map((item, i)=><li key={i}>{item}</li>)}</ul></div>
            <div className="themed-card rounded-2xl p-3"><h3 className="font-bold mb-1">ما يفسد الحج</h3><ul className="list-disc pr-4 space-y-0.5 themed-text-muted">{hajjGeneralInfo.mufsidat.map((item, i)=><li key={i}>{item}</li>)}</ul></div>
        </div>

        {hajjType === 'tamattu' && (
             <>
                <h4 className="text-sm font-bold themed-text pt-3 flex items-center gap-2">📅 مخطط الأيام (حج التمتع)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {hajjTamattuPlan.map((day, i) => (
                        <div key={i} className="themed-card rounded-2xl p-3">
                            <h5 className="font-bold mb-1">{day.day}</h5>
                            <ul className="list-disc pr-4 space-y-1 themed-text-muted">{day.actions.map((action, j)=><li key={j} dangerouslySetInnerHTML={{__html: action}}></li>)}</ul>
                        </div>
                    ))}
                </div>
            </>
        )}
    </section>
);

const DuaaScreen = ({ openDuaaId, onToggle, onZoom }) => {
    return (
        <section id="duaa-screen" className="space-y-4">
             <div className="themed-card rounded-2xl p-4 leading-relaxed space-y-3">
                {allDuaas.map(section => (
                    <DuaaSection 
                        key={section.id}
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
