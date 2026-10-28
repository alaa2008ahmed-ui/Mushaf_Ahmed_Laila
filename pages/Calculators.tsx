import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import ZakatCalculator from '../components/Calculators/ZakatCalculator';
import MawarithCalculator from '../components/Calculators/MawarithCalculator';
import KaffaratCalculator from '../components/Calculators/KaffaratCalculator';
import FitrAndUdhiyahCalculator from '../components/Calculators/FitrAndUdhiyahCalculator';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { 
    CALCULATOR_ZAKAT_STEPS, 
    CALCULATOR_MAWARITH_STEPS, 
    CALCULATOR_KAFFARAT_STEPS, 
    CALCULATOR_FITR_STEPS,
    CALCULATOR_UDHIYAH_STEPS
} from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';

interface CalculatorsProps {
    onBack: () => void;
    onNavigate: (id: string, params?: any) => void; 
}

const Calculators: React.FC<CalculatorsProps> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
    const { t, language } = useLanguage();
    const isEn = language === 'en';

    const [activeTab, setActiveTab] = useState<'zakat' | 'mawarith' | 'kaffarat' | 'fitr-udhiyah'>('zakat');
    const [fitrUdhiyahSubTab, setFitrUdhiyahSubTab] = useState<'fitr' | 'udhiyah'>('fitr');
    const [showGuide, setShowGuide] = useState(false);

    // Initial check for Zakat guide on first entry
    useEffect(() => {
        markPageAsSeen('calculators');
        if (!getGuideSeen('calc_tab_zakat_spotlight')) {
            const timer = setTimeout(() => {
                setShowGuide(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);

    const getGuideKeyForTab = (tabId: 'zakat' | 'mawarith' | 'kaffarat' | 'fitr-udhiyah', subTab: 'fitr' | 'udhiyah') => {
        if (tabId === 'fitr-udhiyah') {
            return subTab === 'udhiyah' ? 'calc_subtab_udhiyah_spotlight' : 'calc_subtab_fitr_spotlight';
        }
        return `calc_tab_${tabId}_spotlight`;
    };

    const handleTabChange = (tabId: 'zakat' | 'mawarith' | 'kaffarat' | 'fitr-udhiyah') => {
        if (activeTab === tabId) return;
        setShowGuide(false);
        setActiveTab(tabId);
        
        const guideKey = getGuideKeyForTab(tabId, fitrUdhiyahSubTab);
        if (!getGuideSeen(guideKey)) {
            setTimeout(() => {
                setShowGuide(true);
            }, 250);
        }
    };

    const handleFitrUdhiyahSubTabChange = (sub: 'fitr' | 'udhiyah') => {
        if (fitrUdhiyahSubTab === sub) return;
        setShowGuide(false);
        setFitrUdhiyahSubTab(sub);
        
        const guideKey = sub === 'udhiyah' ? 'calc_subtab_udhiyah_spotlight' : 'calc_subtab_fitr_spotlight';
        if (!getGuideSeen(guideKey)) {
            setTimeout(() => {
                setShowGuide(true);
            }, 250);
        }
    };

    const getActiveGuideConfig = () => {
        switch (activeTab) {
            case 'zakat':
                return {
                    key: 'calc_tab_zakat_spotlight',
                    steps: CALCULATOR_ZAKAT_STEPS,
                };
            case 'mawarith':
                return {
                    key: 'calc_tab_mawarith_spotlight',
                    steps: CALCULATOR_MAWARITH_STEPS,
                };
            case 'kaffarat':
                return {
                    key: 'calc_tab_kaffarat_spotlight',
                    steps: CALCULATOR_KAFFARAT_STEPS,
                };
            case 'fitr-udhiyah':
                if (fitrUdhiyahSubTab === 'udhiyah') {
                    return {
                        key: 'calc_subtab_udhiyah_spotlight',
                        steps: CALCULATOR_UDHIYAH_STEPS,
                    };
                }
                return {
                    key: 'calc_subtab_fitr_spotlight',
                    steps: CALCULATOR_FITR_STEPS,
                };
        }
    };

    const activeGuide = getActiveGuideConfig();

    return (
        <div 
            className="h-screen flex flex-col"
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: theme.font }}
        >
            {/* Header */}
            <header className="app-top-bar z-10 shrink-0">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                title={isEn ? "Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Title */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-bold truncate">
                                {isEn ? 'Islamic Legal Calculators' : t('page.calculators_title', 'الحاسبة الشرعية')}
                            </h1>
                        </div>

                        {/* Guide / Home / Lock */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                id="btn-calc-help"
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Calculator Guide" : "دليل وشرح الحاسبة الشرعية"}
                                aria-label={isEn ? "Calculator Guide" : "دليل وشرح الحاسبة الشرعية"}
                            >
                                <i className="fa-solid fa-circle-question text-lg text-black"></i>
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                title={isEn ? "Home Page" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home Page" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Modern Segmented Pill Tabs - Zero Border Policy */}
            <div className="px-4 pt-3 pb-1 z-10 shrink-0 max-w-3xl mx-auto w-full">
                <div 
                    id="calc-tabs-bar" 
                    className="flex p-1.5 rounded-2xl bg-slate-200/70 dark:bg-zinc-800 gap-1.5 border-0 shadow-sm"
                >
                    {[
                        { id: 'zakat', label: isEn ? 'Zakat' : 'الزكاة' },
                        { id: 'mawarith', label: isEn ? 'Inheritance' : 'المواريث' },
                        { id: 'kaffarat', label: isEn ? 'Expiations' : 'الكفارات' },
                        { id: 'fitr-udhiyah', label: isEn ? 'Fitr & Udhiyah' : 'فطر وأضحية' }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as any)}
                                className={`flex-1 py-2.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer text-center border-0 ${
                                    isActive 
                                        ? 'shadow-sm' 
                                        : 'opacity-60 hover:opacity-100'
                                }`}
                                style={{
                                    backgroundColor: isActive ? tokens.primaryColor : 'transparent',
                                    color: isActive ? '#FFFFFF' : tokens.textColor
                                }}
                            >
                                <span className={`${isEn ? 'text-[11px] sm:text-xs md:text-sm tracking-tight' : 'text-xs sm:text-sm'} whitespace-nowrap`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <main id="calc-scroll-container" className="flex-1 overflow-y-auto px-4 pb-6 pt-2 hide-scrollbar">
                <div className="max-w-3xl mx-auto">
                    {activeTab === 'zakat' && <ZakatCalculator />}
                    {activeTab === 'mawarith' && <MawarithCalculator />}
                    {activeTab === 'kaffarat' && <KaffaratCalculator />}
                    {activeTab === 'fitr-udhiyah' && (
                        <FitrAndUdhiyahCalculator 
                            subTab={fitrUdhiyahSubTab}
                            onSubTabChange={handleFitrUdhiyahSubTabChange}
                        />
                    )}
                </div>
                <div className="shrink-0 w-full h-6"></div>
            </main>

            {/* Interactive Spotlight Guide */}
            <CommunitySpotlightGuide
                guideKey={activeGuide.key}
                steps={activeGuide.steps}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={isEn}
            />
        </div>
    );
};

export default Calculators;
