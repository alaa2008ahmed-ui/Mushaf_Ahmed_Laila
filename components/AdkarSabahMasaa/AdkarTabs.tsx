import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AdkarTabsProps {
    adhkarTab: string;
    setAdhkarTab: (tab: string) => void;
}

const AdkarTabs: React.FC<AdkarTabsProps> = ({ adhkarTab, setAdhkarTab }) => {
    const { theme } = useTheme();

    return (
        <div className="w-full max-w-lg flex p-1 rounded-xl themed-bg-alt mb-0 text-sm shadow-inner">
            <button 
                onClick={() => setAdhkarTab('morning')} 
                className={`flex-1 py-2 sm:py-3 px-1 text-center rounded-lg font-bold transition-all ${adhkarTab === 'morning' ? `shadow-md text-white` : 'themed-text-muted'}`} 
                style={{backgroundColor: adhkarTab === 'morning' ? theme.palette[0] : ''}}
            >
                أذكار الصباح
            </button>
            <button 
                onClick={() => setAdhkarTab('evening')} 
                className={`flex-1 py-2 sm:py-3 px-1 text-center rounded-lg font-bold transition-all ${adhkarTab === 'evening' ? `shadow-md text-white` : 'themed-text-muted'}`} 
                style={{backgroundColor: adhkarTab === 'evening' ? theme.palette[0] : ''}}
            >
                أذكار المساء
            </button>
        </div>
    );
};

export default AdkarTabs;
