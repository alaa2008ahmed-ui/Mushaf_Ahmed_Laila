import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
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

    const isDarkTheme = theme.bgColor === '#000000' || theme.bgColor === '#111827';

    return (
        <div 
            className="fixed bottom-[calc(var(--app-bottom-clearance,5.25rem)+1rem)] right-6 z-[100] cursor-pointer animate-bounce"
            onClick={handleRateClick}
            style={{ animationDuration: '2s' }}
        >
            <button
                type="button"
                aria-label="قيّم التطبيق"
                className="unified-3d-fab flex items-center justify-center w-14 h-14 rounded-full relative overflow-hidden cursor-pointer"
                style={{
                    background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}ee 65%, ${primaryColor}cc 100%)`,
                    border: '1px solid rgba(255, 255, 255, 0.78)',
                    boxShadow: isDarkTheme
                        ? '0 5px 0 #09090d, 0 12px 24px rgba(0, 0, 0, 0.7), inset 0 2px 2px rgba(255, 255, 255, 0.5), inset 0 -3px 5px rgba(0, 0, 0, 0.28)'
                        : '0 5px 0 rgba(0, 0, 0, 0.28), 0 12px 24px -2px rgba(0, 0, 0, 0.28), inset 0 2px 2px rgba(255, 255, 255, 0.65), inset 0 -3px 5px rgba(0, 0, 0, 0.2)'
                }}
            >
                {/* 3D Glossy specular sheen */}
                <div className="absolute inset-x-1.5 top-1 h-[45%] rounded-t-full bg-gradient-to-b from-white/45 via-white/15 to-transparent pointer-events-none" />
                <Star className="w-7 h-7 text-white fill-white drop-shadow-md relative z-10" />
            </button>
            <div
                className="absolute -top-2 -right-2 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full pointer-events-none"
                style={{
                    background: 'linear-gradient(180deg, #f87171 0%, #ef4444 55%, #dc2626 100%)',
                    border: '1px solid rgba(255,255,255,0.85)',
                    boxShadow: '0 2.5px 0 #991b1b, 0 4px 8px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.5)'
                }}
            >
                قيّمنا
            </div>
        </div>
    );
};

export default RateUs;
