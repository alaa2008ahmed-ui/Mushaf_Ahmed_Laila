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

interface CalculatorsProps {
    onBack: () => void;
    onNavigate: (id: string, params?: any) => void; 
}

const Calculators: React.FC<CalculatorsProps> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
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
            className="h-screen flex flex-col bg-transparent"
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ fontFamily: theme.font }}
        >
            {/* Header */}
            <header className="app-top-bar shadow-sm z-10 shrink-0">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* زر الرجوع للخلف */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {isEn ? 'Islamic Legal Calculators' : t('page.calculators_title', 'الحاسبة الشرعية')}
                            </h1>
                        </div>

                        {/* أيقونة الدليل والمنزل على يسار/يمين النص للعودة إلى الصفحة الرئيسية */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                id="btn-calc-help"
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Calculator Guide" : "دليل وشرح الحاسبة الشرعية"}
                                aria-label={isEn ? "Calculator Guide" : "دليل وشرح الحاسبة الشرعية"}
                            >
                                <HelpCircle size={19} />
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Home Page" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home Page" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div id="calc-tabs-bar" className="flex px-1.5 sm:px-4 pt-2.5 sm:pt-3 gap-1 sm:gap-2 font-cairo z-10 shrink-0">
                {[
                    { id: 'zakat', label: isEn ? 'Zakat' : 'الزكاة' },
                    { id: 'mawarith', label: isEn ? 'Inheritance' : 'المواريث' },
                    { id: 'kaffarat', label: isEn ? 'Expiations' : 'الكفارات' },
                    { id: 'fitr-udhiyah', label: isEn ? 'Fitr & Udhiyah' : 'فطر وأضحية' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as any)}
                        className={`flex-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-t-xl font-bold transition-all duration-300 flex items-center justify-center cursor-pointer text-center
                            ${activeTab === tab.id 
                                ? (isDefaultTheme 
                                    ? 'bg-black text-white scale-105 origin-bottom shadow-md' 
                                    : (isBlackTheme ? 'bg-white text-black scale-105 origin-bottom shadow-md' : 'bg-primary text-white shadow-[0_-4px_10px_rgba(16,185,129,0.2)] scale-105 origin-bottom')
                                  ) 
                                : (isDefaultTheme 
                                    ? 'bg-white text-black shadow-sm opacity-80 hover:opacity-100' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  )}`}
                        style={{
                            borderColor: cardBorderColor,
                            borderWidth: '1.5px',
                            borderStyle: 'solid',
                        }}
                    >
                        <span className={`${isEn ? 'text-[11px] sm:text-xs md:text-sm tracking-tight' : 'text-xs sm:text-sm'} whitespace-nowrap`}>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <main id="calc-scroll-container" className="flex-1 overflow-y-auto px-4 pb-4 hide-scrollbar font-cairo bg-gray-50/50 dark:bg-black/20">
                <div className="max-w-3xl mx-auto pt-2">
                    {activeTab === 'zakat' && <ZakatCalculator cardBorderColor={cardBorderColor} />}
                    {activeTab === 'mawarith' && <MawarithCalculator cardBorderColor={cardBorderColor} />}
                    {activeTab === 'kaffarat' && <KaffaratCalculator cardBorderColor={cardBorderColor} />}
                    {activeTab === 'fitr-udhiyah' && (
                        <FitrAndUdhiyahCalculator 
                            cardBorderColor={cardBorderColor}
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

