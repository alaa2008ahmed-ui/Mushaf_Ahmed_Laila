import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ZakatCalculator from '../components/Calculators/ZakatCalculator';
import MawarithCalculator from '../components/Calculators/MawarithCalculator';
import KaffaratCalculator from '../components/Calculators/KaffaratCalculator';
import FitrAndUdhiyahCalculator from '../components/Calculators/FitrAndUdhiyahCalculator';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { 
    CALCULATOR_ZAKAT_STEPS, 
    CALCULATOR_MAWARITH_STEPS, 
    CALCULATOR_KAFFARAT_STEPS, 
    CALCULATOR_FITR_STEPS,
    CALCULATOR_UDHIYAH_STEPS
} from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';
import { useShowPageGuides } from '../utils/guideManager';

interface CalculatorsProps {
    onBack: () => void;
    onNavigate: (id: string, params?: any) => void; 
}

const Calculators: React.FC<CalculatorsProps> = ({ onBack, onNavigate }) => {
    const showPageGuides = useShowPageGuides();
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const { t, language } = useLanguage();
    const isEn = language === 'en';

    const [activeTab, setActiveTab] = useState<'zakat' | 'mawarith' | 'kaffarat' | 'fitr-udhiyah'>('zakat');
    const [fitrUdhiyahSubTab, setFitrUdhiyahSubTab] = useState<'fitr' | 'udhiyah'>('fitr');
    const [showGuide, setShowGuide] = useState(false);
    const scrollContainerRef = useRef<HTMLElement | null>(null);

    const resetScrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
        try {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        } catch {}
    };

    // Always start from the very top when opening or switching between calculator tabs/sub-tabs
    useLayoutEffect(() => {
        resetScrollToTop();
        const rafId = requestAnimationFrame(() => {
            resetScrollToTop();
        });
        return () => cancelAnimationFrame(rafId);
    }, [activeTab, fitrUdhiyahSubTab]);

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

    const activeDisclaimerKey =
        activeTab === 'zakat'
            ? 'calculators.disclaimer_zakat'
            : activeTab === 'mawarith'
                ? 'calculators.disclaimer_mawarith'
                : activeTab === 'kaffarat'
                    ? 'calculators.disclaimer_kaffarat'
                    : 'calculators.disclaimer_fitr_udhiyah';

    const disclaimerText = t(activeDisclaimerKey);
    const colonIdx = disclaimerText.indexOf(':');
    const disclaimerLabel = colonIdx !== -1 ? disclaimerText.slice(0, colonIdx + 1) : '';
    const disclaimerBody = colonIdx !== -1 ? disclaimerText.slice(colonIdx + 1).trim() : disclaimerText;

    return (
        <div 
            className="h-[100dvh] flex flex-col overflow-hidden"
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ backgroundColor: s3d.pageBgColor, color: s3d.textColor, fontFamily: theme.font }}
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
                            {showPageGuides && (
                                <button
                                    id="btn-calc-help"
                                    type="button"
                                    onClick={() => setShowGuide(true)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                    style={{ color: 'var(--top-bar-text, inherit)' }}
                                    title={isEn ? "Calculator Guide" : "دليل وشرح الحاسبة الشرعية"}
                                    aria-label={isEn ? "Calculator Guide" : "دليل وشرح الحاسبة الشرعية"}
                                >
                                    <i className="fa-solid fa-circle-question text-lg"></i>
                                </button>
                            )}
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

            {/* 3D Sculpted Tabs Bar - Matching Adia */}
            <div className="px-4 pt-3 pb-2 z-10 shrink-0 max-w-3xl mx-auto w-full overflow-visible">
                <div 
                    id="calc-tabs-bar" 
                    className={`app-page-card border-0 flex p-2 pb-2.5 rounded-2xl gap-2 transition-all overflow-visible ${s3d.surfaceCardClass}`}
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
                                className={`app-page-card border-0 flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center cursor-pointer text-center ${
                                    isActive 
                                        ? 'font-black' 
                                        : `font-bold ${s3d.surfaceCardClass}`
                                }`}
                                style={isActive ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
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
            <main ref={scrollContainerRef} id="calc-scroll-container" className="flex-1 min-h-0 overflow-y-auto px-4 pt-2 app-scroll-safe hide-scrollbar">
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

                    {/* Dynamic Tab-Specific 3D Sculpted Sharia Disclaimer Card */}
                    <div
                        id="calc-sharia-disclaimer"
                        role="note"
                        className={`app-page-card border-0 mt-5 mb-2 p-4 rounded-3xl flex items-start gap-3.5 transition-all ${s3d.surfaceCardClass}`}
                    >
                        <div
                            className={`app-3d-badge w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                            style={{ color: s3d.noticeAccent }}
                        >
                            <ShieldAlert size={18} strokeWidth={2.2} />
                        </div>
                        <p
                            className="text-xs sm:text-[13px] leading-relaxed font-semibold m-0"
                            style={{
                                color: s3d.isDark ? 'rgba(255, 255, 255, 0.9)' : s3d.textColor,
                            }}
                        >
                            {disclaimerLabel && (
                                <strong className="font-black" style={{ color: s3d.noticeAccent }}>
                                    {disclaimerLabel}{' '}
                                </strong>
                            )}
                            <span>{disclaimerBody}</span>
                        </p>
                    </div>
                </div>
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
