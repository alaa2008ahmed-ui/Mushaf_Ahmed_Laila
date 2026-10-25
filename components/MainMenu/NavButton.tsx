import React from 'react';
import { motion } from 'motion/react';

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
    showNewBadge?: boolean;
    badgeText?: string;
    unreadBadgeCount?: number;
    dataId?: string;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
    onBadgeClick?: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ 
    label, 
    onClick, 
    className, 
    color = '#8B5CF6', 
    border, 
    isEditMode, 
    onResize, 
    isGlass, 
    btnText,
    showNewBadge,
    badgeText = 'جديد',
    unreadBadgeCount,
    dataId,
    leftAction,
    rightAction,
    onBadgeClick
}) => {
    const isBlackButton = color === '#000000' || color?.toLowerCase() === '#000000' || color === '#111111' || color === '#0a0a0a' || color === '#121212';

    return (
        <div className={`h-full ${className} relative group`} data-id={dataId}>
            <motion.button 
                whileHover={!isEditMode ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isEditMode ? { scale: 0.98, y: 2 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={onClick} 
                className={`w-full rounded-2xl p-1 sm:p-1.5 font-bold relative text-[10px] min-[360px]:text-[10.5px] min-[400px]:text-[11px] min-[430px]:text-[11.5px] h-full flex items-center justify-center text-center ${isEditMode ? 'cursor-move animate-pulse opacity-80' : ''}`}
                style={{ 
                    backgroundColor: isGlass ? (color ? `${color}55` : 'rgba(255, 255, 255, 0.25)') : color, 
                    backdropFilter: isGlass ? 'blur(12px) saturate(180%)' : 'none',
                    WebkitBackdropFilter: isGlass ? 'blur(12px) saturate(180%)' : 'none',
                    color: isBlackButton ? '#FFFFFF' : (btnText || '#FFFFFF'),
                    border: border || (isBlackButton ? '1px solid rgba(255, 255, 255, 0.25)' : (isGlass ? (color ? `1px solid ${color}80` : '1px solid rgba(255, 255, 255, 0.4)') : '1px solid rgba(255,255,255,0.1)')),
                    boxShadow: isGlass 
                        ? (color ? `0 6px 0 ${color}40, 0 8px 24px 0 rgba(0,0,0,0.1)` : '0 8px 32px 0 rgba(31, 38, 135, 0.07)') 
                        : (isBlackButton ? '0 5px 0 #2a2a2a, 0 8px 16px rgba(0,0,0,0.5)' : `0 6px 0 ${color}90, 0 10px 15px rgba(0,0,0,0.15)`),
                    textShadow: isGlass ? 'none' : (isBlackButton ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 2px rgba(0,0,0,0.1)'),
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased'
                }}
                disabled={isEditMode}
            >
                {/* Inner highlight for 3D look */}
                {!isGlass && (
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-t-2xl"></div>
                )}
                
                <span className={`relative z-10 font-kufi whitespace-nowrap overflow-hidden text-ellipsis max-w-full ${rightAction ? 'pr-8 pl-2' : (leftAction ? 'pl-8 pr-2' : 'px-0.5')}`}>
                    {label}
                </span>

                {/* Active mask */}
                {!isEditMode && (
                    <div className={`absolute inset-0 rounded-2xl ${isBlackButton ? 'bg-white' : 'bg-black'} opacity-0 group-active:opacity-10 transition-opacity`}></div>
                )}
            </motion.button>
            
            {rightAction && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-auto">
                    {rightAction}
                </div>
            )}
            
            {leftAction && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-auto">
                    {leftAction}
                </div>
            )}
            

            {/* شارة الرسائل غير المقروءة لمجتمع التواصل */}
            {unreadBadgeCount !== undefined && unreadBadgeCount > 0 && (
                <div 
                    className={`absolute -top-2 ${showNewBadge ? '-left-1' : '-right-1'} bg-red-600 text-white text-[10px] sm:text-xs font-black min-w-[20px] h-5 px-1.5 rounded-full z-20 shadow-lg border-2 border-white flex items-center justify-center animate-pulse pointer-events-none`}
                    style={{ backgroundColor: '#DC2626' }}
                >
                    {unreadBadgeCount > 99 ? '+99' : unreadBadgeCount}
                </div>
            )}

            {/* شارة جديد */}
            {showNewBadge && (
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onBadgeClick) {
                            onBadgeClick();
                        } else {
                            onClick();
                        }
                    }}
                    className="absolute -top-2 -right-1 bg-yellow-400 text-black text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full z-20 shadow-lg border border-white animate-bounce cursor-pointer select-none scale-75 origin-top-right"
                    title={badgeText}
                >
                    {badgeText}
                </div>
            )}
            
            {isEditMode && (
                <button 
                    onClick={onResize}
                    className="absolute top-1 left-1 bg-white/40 hover:bg-white/60 rounded-full p-1.5 z-30 transition-colors shadow-sm"
                    title="تغيير الحجم"
                >
                    <i className="fa-solid fa-expand text-white text-xs"></i>
                </button>
            )}
        </div>
    );
};

export default NavButton;
