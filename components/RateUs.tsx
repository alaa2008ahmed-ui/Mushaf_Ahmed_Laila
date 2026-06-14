import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const RateUs: React.FC = () => {
    const { theme } = useTheme();
    const [showRateIcon, setShowRateIcon] = useState(false);

    useEffect(() => {
        const hasRated = localStorage.getItem('has_rated') === 'true';
        let appOpenCount = parseInt(localStorage.getItem('app_open_count') || '0', 10);

        const sessionFlag = sessionStorage.getItem('app_opened_this_session');
        if (!sessionFlag) {
            appOpenCount += 1;
            localStorage.setItem('app_open_count', appOpenCount.toString());
            sessionStorage.setItem('app_opened_this_session', 'true');
        }

        if (!hasRated && appOpenCount > 0 && appOpenCount % 5 === 0) {
            setShowRateIcon(true);
        }
    }, []);

    const handleRateClick = () => {
        localStorage.setItem('has_rated', 'true');
        setShowRateIcon(false);
        window.location.href = 'market://details?id=com.AhmedLaila.Quran';
    };

    if (!showRateIcon) return null;

    const primaryColor = theme.palette[0] || '#10b981';

    return (
        <div 
            className="fixed bottom-28 right-6 z-[100] cursor-pointer animate-bounce"
            onClick={handleRateClick}
            style={{ animationDuration: '2s' }}
        >
            <div 
                className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl border-2 border-white"
                style={{ backgroundColor: primaryColor }}
            >
                <i className="fa-solid fa-star text-white text-2xl drop-shadow-md"></i>
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white">
                قيّمنا
            </div>
        </div>
    );
};

export default RateUs;
