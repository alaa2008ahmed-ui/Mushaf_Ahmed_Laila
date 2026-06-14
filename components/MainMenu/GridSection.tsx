import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NavButton from './NavButton';
import WhatsAppButton from '../WhatsAppButton';
import VoiceControlToggle from '../VoiceControlToggle';
import { useVoiceControl } from '../../context/VoiceControlContext';

interface GridSectionProps {
    menuItems: any[];
    setMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
    visibleItems: string[];
    isEditMode: boolean;
    onNavigate: (id: string) => void;
    theme: any;
    themeKey: string;
    DEFAULT_MENU_ITEMS: any[];
}

const GridSection: React.FC<GridSectionProps> = ({
    menuItems,
    setMenuItems,
    visibleItems,
    isEditMode,
    onNavigate,
    theme,
    themeKey,
    DEFAULT_MENU_ITEMS
}) => {
    const { showVoiceIcon } = useVoiceControl();
    const [showNewBadges, setShowNewBadges] = useState(false);

    useEffect(() => {
        const opens = parseInt(localStorage.getItem('app_opens_count_new') || '0');
        if (!sessionStorage.getItem('app_opened_this_session')) {
            localStorage.setItem('app_opens_count_new', (opens + 1).toString());
            sessionStorage.setItem('app_opened_this_session', 'true');
        }
        
        const currentOpens = parseInt(localStorage.getItem('app_opens_count_new') || '1');
        if (currentOpens <= 5) {
            setShowNewBadges(true);
        }
    }, []);

    const handleResize = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuItems(prev => prev.map(item => {
            if (item.id === id) {
                const isLarge = item.className.includes('col-span-2');
                const newClass = isLarge 
                    ? item.className.replace('col-span-2', '').trim() 
                    : `${item.className} col-span-2`.trim();
                return { ...item, className: newClass };
            }
            return item;
        }));
    };

    const handleDragStart = () => {
        if (navigator.vibrate) navigator.vibrate(20);
    };

    const handleDragEnd = (event: any, info: any, draggedId: string) => {
        const point = info.point;
        const items = document.querySelectorAll('[data-item-id]');
        let targetId: string | null = null;

        for (let i = 0; i < items.length; i++) {
            const el = items[i];
            const id = el.getAttribute('data-item-id');
            if (id === draggedId) continue;

            const rect = el.getBoundingClientRect();
            if (
                point.x >= rect.left &&
                point.x <= rect.right &&
                point.y >= rect.top &&
                point.y <= rect.bottom
            ) {
                targetId = id;
                break;
            }
        }

        if (targetId) {
            const fromIndex = menuItems.findIndex(i => i.id === draggedId);
            const toIndex = menuItems.findIndex(i => i.id === targetId);
            
            if (fromIndex !== -1 && toIndex !== -1) {
                const newItems = [...menuItems];
                const [movedItem] = newItems.splice(fromIndex, 1);
                newItems.splice(toIndex, 0, movedItem);
                setMenuItems(newItems);
                if (navigator.vibrate) navigator.vibrate(20);
            }
        }
    };

    const isBlackTheme = theme.bgColor === '#000000';

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full max-w-sm mx-auto flex-grow content-center relative mt-6 pb-4">
            {menuItems.map(item => {
                const isVisible = visibleItems.includes(item.id);
                const buttonColor = isBlackTheme 
                    ? '#000000' 
                    : (themeKey === 'olive_grove' ? (['quran', 'listen', 'prayer-times'].includes(item.id) ? '#4D7C0F' : '#65A30D') : (item.customColor || theme.palette[DEFAULT_MENU_ITEMS.find(d => d.id === item.id)?.colorIndex ?? item.colorIndex]));
                const textColor = isBlackTheme ? '#FFFFFF' : theme.btnText;
                const buttonBorder = isBlackTheme ? '1px solid #333333' : theme.btnBorder;

                return (
                    <motion.div
                        key={item.id}
                        id={`menu-item-${item.id}`}
                        data-item-id={item.id}
                        className={`${item.className} relative ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} ${item.id === 'more' ? 'mt-1' : ''}`}
                        style={{ 
                            visibility: isVisible ? 'visible' : 'hidden',
                        }}
                        drag={isEditMode}
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={1}
                        whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing', opacity: 0.8 }}
                        onDragStart={handleDragStart}
                        onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
                    >
                        {item.id === 'more' ? (
                            <div className="flex items-center justify-center gap-2 w-full h-full px-2">
                                {showVoiceIcon && <WhatsAppButton />}
                                <div className="w-36 h-full">
                                    <NavButton 
                                        label={item.label} 
                                        onClick={() => !isEditMode && onNavigate(item.id)} 
                                        className="w-full h-full shadow-lg"
                                        color={buttonColor} 
                                        border={buttonBorder || (theme.isGlass ? undefined : (theme.palette[0] ? `2px solid ${theme.palette[0]}` : undefined))} 
                                        isEditMode={isEditMode}
                                        onResize={(e) => handleResize(item.id, e)}
                                        isGlass={theme.isGlass}
                                        btnText={textColor}
                                        showNewBadge={showNewBadges && ['daily-wird', 'memorization', 'voice-control', 'habit-tracker'].includes(item.id)}
                                        badgeText="جديد"
                                    />
                                </div>
                                <VoiceControlToggle />
                            </div>
                        ) : (
                            <NavButton 
                                label={item.label} 
                                onClick={() => !isEditMode && onNavigate(item.id)} 
                                className="w-full h-full"
                                color={buttonColor} 
                                border={buttonBorder} 
                                isEditMode={isEditMode}
                                onResize={(e) => handleResize(item.id, e)}
                                isGlass={theme.isGlass}
                                btnText={textColor}
                                showNewBadge={showNewBadges && ['daily-wird', 'memorization', 'voice-control', 'habit-tracker'].includes(item.id)}
                                badgeText="جديد"
                            />
                        )}
                        {item.id === 'quran' && !isEditMode && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate('quran-landscape');
                                }}
                                className={`absolute top-1/2 left-1.5 -translate-y-1/2 rounded-full w-7 h-7 flex items-center justify-center z-10 transition-colors shadow-lg border border-white/20`}
                                style={{ 
                                    backgroundColor: isBlackTheme ? '#FFFFFF' : (theme.isGlass ? 'rgba(255, 255, 255, 0.2)' : (theme.palette[1] || '#9333ea')),
                                    color: isBlackTheme ? '#000000' : '#ffffff',
                                    backdropFilter: theme.isGlass ? 'blur(4px)' : 'none',
                                    WebkitBackdropFilter: theme.isGlass ? 'blur(4px)' : 'none'
                                }}
                                title="وضع العرض"
                            >
                                <i className="fa-solid fa-arrows-rotate text-sm"></i>
                            </button>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

export default GridSection;
