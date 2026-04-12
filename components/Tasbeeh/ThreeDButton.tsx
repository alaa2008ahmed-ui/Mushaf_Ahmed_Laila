import React from 'react';
import type { Theme } from '../../context/themes';

interface ThreeDButtonProps {
    label: string;
    onClick: () => void;
    color: string;
    padding?: string;
    children?: React.ReactNode;
    theme: Theme;
}

const ThreeDButton: React.FC<ThreeDButtonProps> = ({ label, onClick, color, padding = "py-3 px-4 text-base", children = null, theme }) => (
    <button
        onClick={onClick}
        className={`w-full rounded-full font-extrabold cursor-pointer transform active:translate-y-1 active:shadow-none focus:outline-none overflow-hidden btn-3d-effect ${padding}`}
        style={{
            background: color,
            color: '#FFFFFF',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            boxShadow: `0 4px 0 0 ${theme.palette[0]}99, 0 6px 12px rgba(0,0,0,0.25)`
        }}
    >
        <div className="flex items-center justify-center relative z-10 h-full w-full gap-2">
            {children}{label}
        </div>
    </button>
);

export default ThreeDButton;
