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

    return (
        <div 
            className={`marker-notification modal-skinned toast-element ${isVisible ? 'show' : ''}`}
            style={{ fontFamily: currentTheme?.font }}
        >
            <div className="marker-icon theme-header-bg"><i className={`fa-solid ${getIcon()}`}></i></div>
            <div className="marker-text">{text}</div>
        </div>
    );
};

export default MarkerNotification;
