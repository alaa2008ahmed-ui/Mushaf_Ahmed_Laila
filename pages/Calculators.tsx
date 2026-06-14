import React, { useState } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import ZakatCalculator from '../components/Calculators/ZakatCalculator';
import MawarithCalculator from '../components/Calculators/MawarithCalculator';
import KaffaratCalculator from '../components/Calculators/KaffaratCalculator';

interface CalculatorsProps {
    onBack: () => void; onNavigate: (id: string, params?: any) => void; 
}

const Calculators: React.FC<CalculatorsProps> = ({ onBack , onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const [activeTab, setActiveTab] = useState<'zakat' | 'mawarith' | 'kaffarat'>('zakat');

    return (
        <div className="h-screen flex flex-col bg-transparent">
            {/* Header */}
            <header className="app-top-bar shadow-sm z-10">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">الحاسبة الشاملة</h1>
                    </div>
                    <p className="app-top-bar__subtitle">زكاة، مواريث، كفارات</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex px-4 pt-4 gap-2 font-cairo z-10">
                {[
                    { id: 'zakat', label: 'الزكاة', icon: 'fa-coins' },
                    { id: 'mawarith', label: 'المواريث', icon: 'fa-scale-balanced' },
                    { id: 'kaffarat', label: 'الكفارات', icon: 'fa-hand-holding-heart' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 px-2 rounded-t-xl font-bold transition-all duration-300 flex flex-col items-center gap-1
                            ${activeTab === tab.id 
                                ? (themeKey === 'default' 
                                    ? 'bg-black text-white scale-105 origin-bottom shadow-lg' 
                                    : 'bg-primary text-white shadow-[0_-4px_10px_rgba(16,185,129,0.2)] scale-105 origin-bottom'
                                  ) 
                                : (themeKey === 'default' 
                                    ? 'bg-white text-black border border-gray-100 shadow-sm opacity-80 hover:opacity-100' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  )}`}
                    >
                        <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'text-lg' : 'text-base'}`}></i>
                        <span className="text-sm">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 pb-4 hide-scrollbar font-cairo bg-gray-50/50 dark:bg-black/20">
                <div className="max-w-3xl mx-auto">
                    {activeTab === 'zakat' && <ZakatCalculator />}
                    {activeTab === 'mawarith' && <MawarithCalculator />}
                    {activeTab === 'kaffarat' && <KaffaratCalculator />}
                </div>
                <div className="shrink-0 w-full h-32"></div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default Calculators;
