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
    cardBorderColor 
}) => {
    const isBlackTheme = theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';
    const textColor = isBlackTheme ? '#FFFFFF' : (theme?.textColor || '#111827');
    const borderColor = cardBorderColor || (isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || '#000000'));

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onClick}
            className={`w-full rounded-2xl font-bold cursor-pointer focus:outline-none overflow-hidden themed-card shadow-md transition-all hover:shadow-lg ${padding}`}
            style={{
                color: textColor,
                borderColor: borderColor,
                borderWidth: '1.5px',
                borderStyle: 'solid'
            }}
        >
            <div className="flex items-center justify-center relative z-10 h-full w-full gap-2 font-bold">
                {children}{label}
            </div>
        </motion.button>
    );
};

export default ThreeDButton;
