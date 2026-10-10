import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Trophy } from 'lucide-react';
import NavButton from './NavButton';
import WhatsAppButton from '../WhatsAppButton';
import VoiceControlToggle from '../VoiceControlToggle';
import { useVoiceControl } from '../../context/VoiceControlContext';
import { useShowNewBadge } from '../../utils/badgeManager';
import { communityService } from '../../services/communityService';
import { ahlAlQuranService, getAhlAlQuranRankColor } from '../../services/ahlAlQuranService';

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
    const showNewBadges = useShowNewBadge();
    const [unreadCommunityCount, setUnreadCommunityCount] = useState<number>(() => {
        return communityService.getTotalUnreadCount();
    });
    const [userRank, setUserRank] = useState<number | null>(() => {
        return ahlAlQuranService.getCurrentUserRank()?.rank ?? null;
    });

    useEffect(() => {
        const updateUnread = () => {
            setUnreadCommunityCount(communityService.getTotalUnreadCount());
        };

        // Fetch latest messages from server in background to keep counter in sync
        communityService.fetchLatestMessages().then(() => {
            updateUnread();
        });

        window.addEventListener('community_messages_updated', updateUnread);
        window.addEventListener('community_user_updated', updateUnread);
        window.addEventListener('community_groups_updated', updateUnread);
        window.addEventListener('storage', updateUnread);

        return () => {
            window.removeEventListener('community_messages_updated', updateUnread);
            window.removeEventListener('community_user_updated', updateUnread);
            window.removeEventListener('community_groups_updated', updateUnread);
            window.removeEventListener('storage', updateUnread);
        };
    }, []);

    useEffect(() => {
        const updateRank = () => {
            const info = ahlAlQuranService.getCurrentUserRank();
            setUserRank(info ? info.rank : null);
        };

        updateRank();

        const unsub = ahlAlQuranService.subscribe(() => {
            updateRank();
        });

        window.addEventListener('ahl_al_quran_updated', updateRank);
        window.addEventListener('ahl_al_quran_page_recorded', updateRank);
        window.addEventListener('community_user_updated', updateRank);
        window.addEventListener('community_user_deleted', updateRank);
        window.addEventListener('storage', updateRank);
        window.addEventListener('focus', updateRank);

        return () => {
            unsub();
            window.removeEventListener('ahl_al_quran_updated', updateRank);
            window.removeEventListener('ahl_al_quran_page_recorded', updateRank);
            window.removeEventListener('community_user_updated', updateRank);
            window.removeEventListener('community_user_deleted', updateRank);
            window.removeEventListener('storage', updateRank);
            window.removeEventListener('focus', updateRank);
        };
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

    // Dynamic colors for community and ahl-al-quran icons based on current theme
    const communityBg = isBlackTheme 
        ? '#000000' 
        : (theme.isGlass 
            ? 'rgba(255, 255, 255, 0.25)' 
            : (themeKey === 'default' 
                ? '#8B5CF6' 
                : (theme.palette[1] || theme.palette[0] || '#8B5CF6')));

    const ahlQuranBg = isBlackTheme 
        ? '#000000' 
        : (theme.isGlass 
            ? 'rgba(255, 255, 255, 0.25)' 
            : (themeKey === 'default' 
                ? '#8B5CF6' 
                : (theme.palette[1] || theme.palette[0] || '#8B5CF6')));

    const iconTextColor = isBlackTheme 
        ? '#FFFFFF' 
        : (theme.isGlass ? (theme.btnText || '#FFFFFF') : '#FFFFFF');

    const iconBorderColor = isBlackTheme 
        ? '#FFFFFF' 
        : (theme.isGlass ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF');

    const GREEN_ITEMS = ['quran', 'listen', 'prayer-times', 'more'];

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full max-w-sm mx-auto flex-grow content-center relative mt-6 pb-4">
            {menuItems.map(item => {
                const isVisible = visibleItems.includes(item.id);
                const isGreen = GREEN_ITEMS.includes(item.id);
                const buttonColor = isBlackTheme 
                    ? '#000000' 
                    : (themeKey === 'olive_grove' 
                        ? (isGreen ? '#4D7C0F' : '#65A30D') 
                        : (themeKey === 'default'
                            ? (isGreen ? '#059669' : '#8B5CF6')
                            : (isGreen ? theme.palette[0] : (theme.palette[1] || theme.palette[0] || '#8B5CF6'))));
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
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full h-full px-1">
                                <div className="relative shrink-0">
                                    <motion.button
                                        type="button"
                                        id="home-community-btn"
                                        onClick={() => !isEditMode && onNavigate('community')}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform border-2 shrink-0 active:scale-95 relative"
                                        style={{
                                            backgroundColor: communityBg,
                                            borderColor: iconBorderColor,
                                            backdropFilter: theme.isGlass ? 'blur(8px)' : 'none',
                                            WebkitBackdropFilter: theme.isGlass ? 'blur(8px)' : 'none'
                                        }}
                                        title="مجتمع التواصل"
                                        aria-label="مجتمع التواصل"
                                    >
                                        <MessageCircle className="w-5 h-5" style={{ color: iconTextColor }} />
                                        {unreadCommunityCount > 0 && (
                                            <span 
                                                className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md animate-pulse leading-none pointer-events-none z-30"
                                                style={{ backgroundColor: '#DC2626' }}
                                            >
                                                {unreadCommunityCount > 99 ? '+99' : unreadCommunityCount}
                                            </span>
                                        )}
                                    </motion.button>
                                </div>
                                <WhatsAppButton />
                                <div className="flex-1 min-w-[130px] max-w-[210px] h-full">
                                    <NavButton 
                                        label={item.label.replace(/^[✨\s]+/, '')} 
                                        onClick={() => !isEditMode && onNavigate(item.id)} 
                                        className="w-full h-full shadow-lg"
                                        color={buttonColor} 
                                        border={buttonBorder || (theme.isGlass ? undefined : (theme.palette[0] ? `2px solid ${theme.palette[0]}` : undefined))} 
                                        isEditMode={isEditMode}
                                        onResize={(e) => handleResize(item.id, e)}
                                        isGlass={theme.isGlass}
                                        btnText={textColor}
                                        showNewBadge={showNewBadges && ['memorization', 'community', 'ahl-al-quran', 'others', 'islamic-sites'].includes(item.id)}
                                        badgeText="جديد"
                                    />
                                </div>
                                <VoiceControlToggle />
                                <div className="relative shrink-0">
                                    <motion.button
                                        type="button"
                                        id="home-ahl-al-quran-btn"
                                        onClick={() => !isEditMode && onNavigate('ahl-al-quran')}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform border-2 shrink-0 active:scale-95 relative"
                                        style={{
                                            backgroundColor: ahlQuranBg,
                                            borderColor: iconBorderColor,
                                            backdropFilter: theme.isGlass ? 'blur(8px)' : 'none',
                                            WebkitBackdropFilter: theme.isGlass ? 'blur(8px)' : 'none'
                                        }}
                                        title="أهل القرآن"
                                        aria-label="أهل القرآن"
                                    >
                                        <Trophy className="w-5 h-5" style={{ color: iconTextColor }} />
                                        {userRank !== null && userRank !== undefined && (
                                            <span 
                                                className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-white text-[11px] font-black flex items-center justify-center border-2 shadow-md leading-none pointer-events-none z-30"
                                                style={{ 
                                                    color: getAhlAlQuranRankColor(userRank).textColor,
                                                    borderColor: getAhlAlQuranRankColor(userRank).borderColor,
                                                    backgroundColor: getAhlAlQuranRankColor(userRank).bg,
                                                    boxShadow: `0 2px 5px ${getAhlAlQuranRankColor(userRank).shadowColor}`
                                                }}
                                            >
                                                {userRank}
                                            </span>
                                        )}
                                    </motion.button>
                                </div>
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
                                showNewBadge={showNewBadges && ['memorization', 'ahl-al-quran', 'others', 'islamic-sites'].includes(item.id)}
                                badgeText="جديد"
                                unreadBadgeCount={item.id === 'community' ? unreadCommunityCount : undefined}
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
