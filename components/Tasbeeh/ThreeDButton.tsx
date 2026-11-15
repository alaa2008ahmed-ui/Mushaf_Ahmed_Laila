import React from 'react';
import type { Theme } from '../../context/themes';

interface ThreeDButtonProps {
    label: string;
    onClick: () => void;
    color?: string;
    padding?: string;
    children?: React.ReactNode;
    theme: Theme;
    cardBorderColor?: string;
}

const ThreeDButton: React.FC<ThreeDButtonProps> = ({ 
    label, 
    onClick, 
    padding = "py-3 px-4 text-base", 
    children = null, 
    theme,
    color 
}) => {
    const isBlackTheme = theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || theme?.accent || '#2E7D5E');
    const buttonTextColor = color || (isBlackTheme ? '#FFFFFF' : primaryColor);

    return (
        <button
            type="button"
            onClick={onClick}
            className={`app-page-card border-0 w-full rounded-2xl font-bold cursor-pointer focus:outline-none bg-white dark:bg-[#1E293B] transition-all ${padding}`}
            style={{
                color: buttonTextColor
            }}
        >
            <div className="flex items-center justify-center relative z-10 h-full w-full gap-2 font-bold">
                {children}{label}
            </div>
        </button>
    );
};

export default ThreeDButton;
