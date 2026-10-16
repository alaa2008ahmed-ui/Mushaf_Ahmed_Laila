import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import ZakatCalculator from '../components/Calculators/ZakatCalculator';
import MawarithCalculator from '../components/Calculators/MawarithCalculator';
import KaffaratCalculator from '../components/Calculators/KaffaratCalculator';
import FitrAndUdhiyahCalculator from '../components/Calculators/FitrAndUdhiyahCalculator';
import { useLanguage } from '../context/LanguageContext';

interface CalculatorsProps {
    onBack: () => void; onNavigate: (id: string, params?: any) => void; 
}

const Calculators: React.FC<CalculatorsProps> = ({ onBack , onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { t, language } = useLanguage();
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
    const [activeTab, setActiveTab] = useState<'zakat' | 'mawarith' | 'kaffarat' | 'fitr-udhiyah'>('zakat');

    return (
        <div className="h-screen flex flex-col bg-transparent">
            {/* Header */}
            <header className="app-top-bar shadow-sm z-10">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* سهم الرجوع للخلف على يمين النص */}
                        <div className="absolute right-0 flex items-center">
                            <button
                                onClick={onBack}
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
                                {t('page.calculators_title', 'الحاسبة الشاملة')}
                            </h1>
                        </div>

                        {/* أيقونة المنزل على يسار النص للعودة إلى الصفحة الرئيسية */}
                        <div className="absolute left-0 flex items-center gap-1">
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
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

            {/* Tabs */}
            <div className="flex px-2 sm:px-4 pt-2.5 sm:pt-3 gap-1.5 sm:gap-2 font-cairo z-10">
                {[
                    { id: 'zakat', label: language === 'en' ? 'Zakat' : 'الزكاة' },
                    { id: 'mawarith', label: language === 'en' ? 'Mawarith' : 'المواريث' },
                    { id: 'kaffarat', label: language === 'en' ? 'Kaffarat' : 'الكفارات' },
                    { id: 'fitr-udhiyah', label: language === 'en' ? 'Fitr & Udhiyah' : 'فطر وأضحية' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-t-xl font-bold transition-all duration-300 flex items-center justify-center cursor-pointer
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
                        <span className="text-xs sm:text-sm whitespace-nowrap">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 pb-4 hide-scrollbar font-cairo bg-gray-50/50 dark:bg-black/20">
                <div className="max-w-3xl mx-auto pt-2">
                    {activeTab === 'zakat' && <ZakatCalculator cardBorderColor={cardBorderColor} />}
                    {activeTab === 'mawarith' && <MawarithCalculator cardBorderColor={cardBorderColor} />}
                    {activeTab === 'kaffarat' && <KaffaratCalculator cardBorderColor={cardBorderColor} />}
                    {activeTab === 'fitr-udhiyah' && <FitrAndUdhiyahCalculator cardBorderColor={cardBorderColor} />}
                </div>
                <div className="shrink-0 w-full h-6"></div>
            </main>
        </div>
    );
};

export default Calculators;
