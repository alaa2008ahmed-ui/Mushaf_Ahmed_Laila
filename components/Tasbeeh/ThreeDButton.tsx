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
}

const ThreeDButton: React.FC<ThreeDButtonProps> = ({ label, onClick, padding = "py-3 px-4 text-base", children = null, theme }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`w-full rounded-2xl font-bold cursor-pointer focus:outline-none overflow-hidden themed-card shadow-md transition-shadow hover:shadow-lg border border-black/5 ${padding}`}
        style={{
            color: 'var(--text-color, #000000)'
        }}
    >
        <div className="flex items-center justify-center relative z-10 h-full w-full gap-2">
            {children}{label}
        </div>
    </motion.button>
);

export default ThreeDButton;
