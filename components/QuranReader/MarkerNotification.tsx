import React, { FC } from 'react';

const MarkerNotification: FC<{isVisible: boolean, type: string, text: string, currentTheme?: any}> = ({isVisible, type, text, currentTheme}) => {
    if (!isVisible) return null;
    const getIcon = () => {
        switch(type) {
            case 'juz': return 'fa-book-open';
            case 'quarter': return 'fa-star';
            case 'sajda': return 'fa-mosque';
            case 'surah': return 'fa-scroll';
            default: return 'fa-info-circle';
        }
    };

    const isGoldTheme = currentTheme?.id === 'gold';
    const isDeepBlack = currentTheme?.id === 'deep_black';
    const bg = currentTheme?.modalBg || undefined;
    const color = currentTheme?.modalText || undefined;
    const iconBg = isGoldTheme ? '#B45309' : isDeepBlack ? '#ffffff' : (currentTheme?.accent || currentTheme?.headerBg || '#10b981');
    const iconColor = isDeepBlack ? '#000000' : (currentTheme?.accentText || '#ffffff');

    return (
        <div 
            className={`marker-notification app-3d-toast toast-element ${isVisible ? 'show' : ''}`}
            style={{ fontFamily: currentTheme?.font, backgroundColor: bg, color }}
        >
            <div
                className="marker-icon"
                style={{ backgroundColor: iconBg, color: iconColor }}
            >
                <i className={`fa-solid ${getIcon()}`}></i>
            </div>
            <div className="marker-text">{text}</div>
        </div>
    );
};

export default MarkerNotification;
