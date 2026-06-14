import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemePageLock: React.FC = () => {
    const { isPageLocked, togglePageLock, isQuranPage, currentPage } = useTheme();

    // Only show on Quran page
    if (!isQuranPage) return null;

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                togglePageLock();
            }}
            className="inline-flex items-center justify-center p-1.5 rounded-full transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-90"
            title={isPageLocked ? "الثيم مثبت لهذه الصفحة" : "تثبيت الثيم لهذه الصفحة"}
            style={{ verticalAlign: 'middle' }}
        >
            <div 
                className={`w-3 h-3 rounded-full shadow-sm transition-all duration-500 ${isPageLocked ? 'bg-red-500 scale-110' : 'bg-green-500'}`}
                style={{ 
                    boxShadow: isPageLocked ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 0 8px rgba(34, 197, 94, 0.6)',
                    border: '1.5px solid rgba(255, 255, 255, 0.8)'
                }}
            />
        </button>
    );
};

export default ThemePageLock;
