import React, { useState } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import ZakatCalculator from '../components/Calculators/ZakatCalculator';
import MawarithCalculator from '../components/Calculators/MawarithCalculator';
import KaffaratCalculator from '../components/Calculators/KaffaratCalculator';

interface CalculatorsProps {
    onBack: () => void;
}

const Calculators: React.FC<CalculatorsProps> = ({ onBack }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'zakat' | 'mawarith' | 'kaffarat'>('zakat');

    return (
        <div className="h-screen flex flex-col bg-transparent">
            {/* Header */}
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <h1 className="app-top-bar__title text-2xl font-kufi text-center">الحاسبة الشرعية</h1>
                    <p className="app-top-bar__subtitle text-center">زكاة، ميراث، كفارات</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex px-4 pt-4 gap-2 font-cairo">
                <button 
                    onClick={() => setActiveTab('zakat')}
                    className={`flex-1 py-2 rounded-t-xl font-bold transition-colors ${activeTab === 'zakat' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    الزكاة
                </button>
                <button 
                    onClick={() => setActiveTab('mawarith')}
                    className={`flex-1 py-2 rounded-t-xl font-bold transition-colors ${activeTab === 'mawarith' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    الميراث
                </button>
                <button 
                    onClick={() => setActiveTab('kaffarat')}
                    className={`flex-1 py-2 rounded-t-xl font-bold transition-colors ${activeTab === 'kaffarat' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    الكفارات
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-24 hide-scrollbar font-cairo">
                {activeTab === 'zakat' && <ZakatCalculator />}
                {activeTab === 'mawarith' && <MawarithCalculator />}
                {activeTab === 'kaffarat' && <KaffaratCalculator />}
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default Calculators;
