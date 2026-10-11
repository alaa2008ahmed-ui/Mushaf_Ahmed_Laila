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

const ThreeDButton: React.FC<ThreeDButtonProps> = ({ label, onClick, padding = "py-3 px-4 text-base", children = null, theme, cardBorderColor }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`w-full rounded-2xl font-bold cursor-pointer focus:outline-none overflow-hidden themed-card shadow-md transition-all hover:shadow-lg ${padding}`}
        style={{
            color: 'var(--text-color, #000000)',
            borderColor: cardBorderColor || (theme?.bgColor === '#000000' ? '#FFFFFF' : (theme?.palette?.[0] || '#000000')),
            borderWidth: '1.5px',
            borderStyle: 'solid'
        }}
    >
        <div className="flex items-center justify-center relative z-10 h-full w-full gap-2">
            {children}{label}
        </div>
    </motion.button>
);

export default ThreeDButton;
