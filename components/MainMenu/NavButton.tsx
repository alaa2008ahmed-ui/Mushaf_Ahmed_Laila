import React from 'react';
import { motion } from 'motion/react';

interface NavButtonProps {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    className?: string;
    color?: string;
    gradient?: string;
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
    icon,
    onClick, 
    className, 
    color = '#635B7F', 
    gradient,
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
    const backgroundStyle = isGlass
        ? (color ? `${color}55` : 'rgba(255, 255, 255, 0.25)')
        : (gradient || color);

    return (
        <div className={`h-full ${className} relative group`} data-id={dataId}>
            <motion.button 
                whileHover={!isEditMode ? { scale: 1.025, y: -2.5 } : {}}
                whileTap={!isEditMode ? { scale: 0.98, y: 2.5 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={onClick} 
                className={`w-full rounded-2xl p-1 sm:p-1.5 font-black relative text-[10px] min-[360px]:text-[10.5px] min-[400px]:text-[11px] min-[430px]:text-[11.5px] h-full flex items-center justify-center text-center overflow-hidden select-none ${isEditMode ? 'cursor-move animate-pulse opacity-80' : ''}`}
                style={{ 
                    background: backgroundStyle, 
                    backdropFilter: isGlass ? 'blur(12px) saturate(180%)' : 'none',
                    WebkitBackdropFilter: isGlass ? 'blur(12px) saturate(180%)' : 'none',
                    color: btnText || (isBlackButton ? '#FFFFFF' : '#FFFFFF'),
                    border: border !== undefined ? border : (isBlackButton ? '1px solid rgba(255, 255, 255, 0.25)' : (isGlass ? (color ? `1px solid ${color}80` : '1px solid rgba(255, 255, 255, 0.4)') : (btnText === '#000000' ? '1.5px solid #CA8A04' : 'none'))),
                    boxShadow: isGlass 
                        ? (color ? `0 5.5px 0 ${color}40, 0 8px 24px 0 rgba(0,0,0,0.1), inset 0 1.5px 1.5px rgba(255,255,255,0.4)` : '0 8px 32px 0 rgba(31, 38, 135, 0.07)') 
                        : (isBlackButton 
                            ? '0 5.5px 0 #222222, 0 8px 16px rgba(0,0,0,0.6), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.3)' 
                            : (btnText === '#000000'
                                ? '0 5px 0 #92400E, 0 8px 18px -2px rgba(146, 64, 14, 0.35), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(113, 63, 18, 0.25)'
                                : '0 5.5px 0 rgba(0, 0, 0, 0.22), 0 8px 18px -2px rgba(0, 0, 0, 0.16), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.15)')),
                    textShadow: isGlass ? 'none' : (btnText === '#F59E0B' ? 'none' : (isBlackButton ? '0 1px 2px rgba(0,0,0,0.8)' : (btnText === '#000000' || btnText === 'black' ? '0 1px 0 rgba(255, 255, 255, 0.7)' : '0 1.5px 3px rgba(0, 0, 0, 0.35)'))),
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased'
                }}
                disabled={isEditMode}
            >
                {/* 3D Glossy specular sheen across top half */}
                {!isGlass && (
                    <>
                        {/* Upper soft gloss reflection */}
                        <div className="absolute inset-x-1 top-0.5 h-[48%] rounded-t-[14px] bg-gradient-to-b from-white/35 via-white/12 to-transparent pointer-events-none"></div>
                        
                        {/* Specular edge highlight */}
                        <div className="absolute inset-x-3 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none"></div>
                        
                        {/* Subtle bottom bevel rim */}
                        <div className="absolute inset-x-2 bottom-0 h-[2px] bg-black/15 rounded-b-2xl pointer-events-none"></div>
                    </>
                )}
                
                {/* Hover shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className={`relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 max-w-full min-w-0 ${rightAction ? 'pr-8 pl-2' : (leftAction ? 'pl-8 pr-2' : 'px-0.5')}`}>
                    {icon && (
                        <span className={`shrink-0 ${btnText === '#000000' || btnText === 'black' ? 'text-black' : 'text-white/95'} flex items-center justify-center pointer-events-none drop-shadow-sm`}>
                            {icon}
                        </span>
                    )}
                    <span className="font-kufi font-black whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-xs">
                        {label}
                    </span>
                </div>

                {/* Active mask */}
                {!isEditMode && (
                    <div className={`absolute inset-0 rounded-2xl ${isBlackButton ? 'bg-white' : 'bg-black'} opacity-0 group-active:opacity-15 transition-opacity`}></div>
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
