import React from 'react';
import ThemePageLock from '../ThemePageLock';

interface TasbeehHeaderProps {
    title: string;
    subtitle: string;
    onOpenStats?: () => void;
}

const TasbeehHeader: React.FC<TasbeehHeaderProps> = ({ title, subtitle, onOpenStats }) => {
    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center w-full">
                    <div className="absolute left-0">
                        <ThemePageLock />
                    </div>
                    <h1 className="app-top-bar__title text-2xl font-kufi">
                        {title}
                    </h1>
                    {onOpenStats && (
                        <button
                            type="button"
                            onClick={onOpenStats}
                            className="absolute right-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors"
                            title="الرسم البياني وتطور التسبيح"
                        >
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </button>
                    )}
                </div>
                <p className="app-top-bar__subtitle">{subtitle}</p>
            </div>
        </header>
    );
};

export default TasbeehHeader;
