import React from 'react';

interface NavButtonProps {
    label: string;
    onClick: () => void;
    className?: string;
    color?: string;
    border?: string;
    isEditMode?: boolean;
    onResize?: (e: React.MouseEvent) => void;
    isGlass?: boolean;
    btnText?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ 
    label, 
    onClick, 
    className, 
    color, 
    border, 
    isEditMode, 
    onResize, 
    isGlass, 
    btnText 
}) => (
    <div className={`h-full ${className} relative group`}>
        <button 
            onClick={onClick} 
            className={`btn-3d-effect w-full rounded-2xl py-3 px-1 font-bold relative text-sm h-full flex items-center justify-center ${isEditMode ? 'cursor-move animate-pulse' : ''}`}
            style={{ 
                background: isGlass ? 'transparent' : color, 
                color: btnText || '#FFFFFF',
                border: border || (isGlass ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'),
                boxShadow: isGlass ? '0 2px 10px rgba(0,0,0,0.1)' : undefined,
                textShadow: isGlass ? '0 2px 4px rgba(0,0,0,0.8)' : undefined
            }}
            disabled={isEditMode}
        >
            {label}
        </button>
        {isEditMode && (
            <button 
                onClick={onResize}
                className="absolute top-1 left-1 bg-white/20 hover:bg-white/40 rounded-full p-1.5 z-20 transition-colors"
                title="تغيير الحجم"
            >
                <i className="fa-solid fa-expand text-white text-xs"></i>
            </button>
        )}
    </div>
);

export default NavButton;
