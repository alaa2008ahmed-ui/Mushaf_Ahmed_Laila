import React from 'react';

interface HisnHeaderProps {
    title: string;
    subtitle: string;
}

const HisnHeader: React.FC<HisnHeaderProps> = ({ title, subtitle }) => {
    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center">
                    <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi flex items-center gap-2 justify-center">
                        {title}
                    </h1>
                </div>
                <p className="app-top-bar__subtitle">
                    {subtitle}
                </p>
            </div>
        </header>
    );
};

export default HisnHeader;
