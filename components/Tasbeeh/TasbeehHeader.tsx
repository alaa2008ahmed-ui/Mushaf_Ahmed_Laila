import React from 'react';
import ThemePageLock from '../ThemePageLock';

interface TasbeehHeaderProps {
    title: string;
    subtitle: string;
}

const TasbeehHeader: React.FC<TasbeehHeaderProps> = ({ title, subtitle }) => {
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
                </div>
                <p className="app-top-bar__subtitle">{subtitle}</p>
            </div>
        </header>
    );
};

export default TasbeehHeader;
