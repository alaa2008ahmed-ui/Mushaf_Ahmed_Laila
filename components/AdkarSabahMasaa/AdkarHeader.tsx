import React from 'react';

interface AdkarHeaderProps {
    title: string;
    subtitle: string;
}

const AdkarHeader: React.FC<AdkarHeaderProps> = ({ title, subtitle }) => {
    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <h1 className="app-top-bar__title text-2xl font-kufi">{title}</h1>
                <p className="app-top-bar__subtitle">{subtitle}</p>
            </div>
        </header>
    );
};

export default AdkarHeader;
