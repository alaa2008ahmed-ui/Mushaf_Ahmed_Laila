import React from 'react';
import type { Theme } from '../../context/themes';
import { motion } from 'framer-motion';

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
        <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onClick}
            className={`w-full rounded-2xl font-bold cursor-pointer focus:outline-none overflow-hidden bg-white dark:bg-[#1E293B] shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 transition-all ${padding}`}
            style={{
                color: buttonTextColor
            }}
        >
            <div className="flex items-center justify-center relative z-10 h-full w-full gap-2 font-bold">
                {children}{label}
            </div>
        </motion.button>
    );
};

export default ThreeDButton;
