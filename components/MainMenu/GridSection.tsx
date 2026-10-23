import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Trophy } from 'lucide-react';
import NavButton from './NavButton';
import WhatsAppButton from '../WhatsAppButton';
import VoiceControlToggle from '../VoiceControlToggle';
import { useVoiceControl } from '../../context/VoiceControlContext';
import { useShowNewBadge, useSeenPages, markPageAsSeen } from '../../utils/badgeManager';
import { communityService } from '../../services/communityService';
import { ahlAlQuranService, getAhlAlQuranRankColor } from '../../services/ahlAlQuranService';
import { useLanguage } from '../../context/LanguageContext';

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
    const { isPageSeen } = useSeenPages();
    const { t, translateMenuItem, dir, language } = useLanguage();
    const isEn = language === "en";
    const [unreadCommunityCount, setUnreadCommunityCount] = useState<number>(() => {
        return communityService.getTotalCombinedUnreadCount();
    });
    const [userRank, setUserRank] = useState<number | null>(() => {
        return ahlAlQuranService.getCurrentUserRank()?.rank ?? null;
    });

    useEffect(() => {
        const updateUnread = () => {
            setUnreadCommunityCount(communityService.getTotalCombinedUnreadCount());
        };

        // Fetch latest messages from server in background to keep counter in sync
        communityService.fetchLatestMessages().then(() => {
            updateUnread();
        });

        window.addEventListener('community_messages_updated', updateUnread);
        window.addEventListener('community_user_updated', updateUnread);
        window.addEventListener('community_groups_updated', updateUnread);
        window.addEventListener('community_group_read_updated', updateUnread);
        window.addEventListener('community_group_messages_updated', updateUnread);
        window.addEventListener('storage', updateUnread);

        return () => {
            window.removeEventListener('community_messages_updated', updateUnread);
            window.removeEventListener('community_user_updated', updateUnread);
            window.removeEventListener('community_groups_updated', updateUnread);
            window.removeEventListener('community_group_read_updated', updateUnread);
            window.removeEventListener('community_group_messages_updated', updateUnread);
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
                let newClass = item.className;
                if (item.className.includes('col-span-6')) {
                    newClass = item.className.replace('col-span-6', 'col-span-2').trim();
                } else if (item.className.includes('col-span-3')) {
                    newClass = item.className.replace('col-span-3', 'col-span-6').trim();
                } else if (item.className.includes('col-span-2')) {
                    newClass = item.className.replace('col-span-2', 'col-span-3').trim();
                }
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

    const isBlackTheme = theme.bgColor === '#000000' || themeKey === 'deep_black' || theme.name === 'اسود' || theme.name === 'black';

    // Dynamic colors for community and ahl-al-quran round icons based on current theme
    const communityBg = isBlackTheme 
        ? '#374151' 
        : (theme.isGlass 
            ? `${theme.palette[1] || '#8B5CF6'}55` 
            : (themeKey === 'default' 
                ? '#8B5CF6' 
                : (theme.palette[1] || theme.palette[0] || '#8B5CF6')));

    const ahlQuranBg = isBlackTheme 
        ? '#374151' 
        : (theme.isGlass 
            ? `${theme.palette[1] || '#8B5CF6'}55` 
            : (themeKey === 'default' 
                ? '#8B5CF6' 
                : (theme.palette[1] || theme.palette[0] || '#8B5CF6')));

    const iconTextColor = isBlackTheme 
        ? '#FFFFFF' 
        : (theme.isGlass ? (theme.btnText || '#FFFFFF') : '#FFFFFF');

    const iconBorderColor = isBlackTheme 
        ? '#FFFFFF' 
        : (theme.isGlass ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF');

    const stripIcons = (str: string) => {
        if (!str) return '';
        return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').replace(/^[\s✨📖🎧⏱️🧭🕌🤲🛡️☀️📅🕋📿💬🏆🧠🎯🌐🧮📚📜🎙️🔍📥]+/gu, '').trim();
    };

    // Exact green items: Row 1, Row 2, Row 5, Row 8, and 'prophetic-seerah' / 'more' button
    const GREEN_ITEMS = [
        'quran', 'listen', 
        'prayer-times', 'qibla', 'salah-adhkar', 
        'community', 'ahl-al-quran', 
        'nawawi', 'voice-control', 'asmaul-husna',
        'prophetic-seerah', 'more'
    ];

    // Items that display the "جديد" (New) badge based on app launch tracking
    const NEW_BADGE_ITEMS = ['community', 'ahl-al-quran', 'islamic-sites', 'others', 'prophetic-seerah'];

    return (
        <div className="grid grid-cols-6 gap-x-2 sm:gap-x-2.5 gap-y-2.5 w-full max-w-sm mx-auto flex-grow content-center relative mt-0 pb-3" dir={dir}>
            {menuItems.map(item => {
                const isBottomBar = item.id === 'prophetic-seerah' || item.id === 'more';
                const isVisible = isBottomBar ? true : visibleItems.includes(item.id);
                const isGreen = GREEN_ITEMS.includes(item.id);
                const buttonColor = isBlackTheme
                    ? '#000000'
                    : (themeKey === 'default'
                        ? (isGreen ? '#059669' : '#8B5CF6')
                        : (isGreen ? theme.palette[0] : (theme.palette[1] || theme.palette[0] || '#8B5CF6')));
                const textColor = '#FFFFFF';
                const buttonBorder = isBlackTheme ? '1px solid rgba(255, 255, 255, 0.25)' : theme.btnBorder;

                return (
                    <motion.div
                        key={item.id}
                        id={item.id === 'community' ? 'home-community-btn' : (item.id === 'ahl-al-quran' ? 'home-ahl-al-quran-btn' : `menu-item-${item.id}`)}
                        data-item-id={item.id}
                        className={`${item.className} relative ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} ${isBottomBar ? 'mt-1' : ''}`}
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
                        {isBottomBar ? (
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full h-full px-1">
                                <div className="relative shrink-0">
                                    <motion.button
                                        type="button"
                                        id="home-community-btn-round"
                                        onClick={() => {
                                            if (!isEditMode) {
                                                markPageAsSeen('community');
                                                onNavigate('community');
                                            }
                                        }}
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
                                        label={stripIcons(translateMenuItem(item.id, item.label)) || "السيرة النبوية"} 
                                        onClick={() => {
                                            if (!isEditMode) {
                                                markPageAsSeen('prophetic-seerah');
                                                onNavigate('prophetic-seerah');
                                            }
                                        }} 
                                        className="w-full h-full shadow-lg"
                                        color={buttonColor} 
                                        border={buttonBorder || (theme.isGlass ? undefined : (theme.palette[0] ? `2px solid ${theme.palette[0]}` : undefined))} 
                                        isEditMode={isEditMode}
                                        onResize={(e) => handleResize(item.id, e)}
                                        isGlass={theme.isGlass}
                                        btnText={textColor}
                                        showNewBadge={showNewBadges && !isPageSeen('prophetic-seerah')}
                                        badgeText={t('common.new', 'جديد')}
                                    />
                                </div>
                                <VoiceControlToggle />
                                <div className="relative shrink-0">
                                    <motion.button
                                        type="button"
                                        id="home-ahl-al-quran-btn-round"
                                        onClick={() => {
                                            if (!isEditMode) {
                                                markPageAsSeen('ahl-al-quran');
                                                onNavigate('ahl-al-quran');
                                            }
                                        }}
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
                                        {userRank !== null && userRank !== undefined ? (
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
                                        ) : (showNewBadges && !isPageSeen('ahl-al-quran') && (
                                            <span 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markPageAsSeen('ahl-al-quran');
                                                }}
                                                className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[9px] font-bold px-1 rounded-full shadow-xs border border-white dark:border-slate-800 animate-bounce cursor-pointer select-none z-30 scale-75 origin-top-right"
                                                title={t('common.new', 'جديد')}
                                            >
                                                {t('common.new', 'جديد')}
                                            </span>
                                        ))}
                                    </motion.button>
                                </div>
                            </div>
                        ) : (
                            <NavButton 
                                label={stripIcons(translateMenuItem(item.id, item.label))} 
                                onClick={() => {
                                    if (!isEditMode) {
                                        markPageAsSeen(item.id);
                                        onNavigate(item.id);
                                    }
                                }} 
                                className="w-full h-full"
                                color={buttonColor} 
                                border={buttonBorder} 
                                isEditMode={isEditMode}
                                onResize={(e) => handleResize(item.id, e)}
                                isGlass={theme.isGlass}
                                btnText={textColor}
                                showNewBadge={showNewBadges && NEW_BADGE_ITEMS.includes(item.id) && !isPageSeen(item.id)}
                                badgeText={t('common.new', 'جديد')}
                                onBadgeClick={() => {
                                    markPageAsSeen(item.id);
                                }}
                                rightAction={!isEn && item.id === 'quran' && !isEditMode ? (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigate('quran-landscape');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.stopPropagation();
                                                onNavigate('quran-landscape');
                                            }
                                        }}
                                        className="rounded-full w-[26px] h-[26px] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-md border border-white/30 select-none"
                                        style={{ 
                                            backgroundColor: isBlackTheme ? '#1F2937' : (theme.isGlass ? 'rgba(255, 255, 255, 0.25)' : (theme.palette[1] || '#9333ea')),
                                            color: isBlackTheme ? '#FFFFFF' : '#ffffff',
                                            backdropFilter: theme.isGlass ? 'blur(4px)' : 'none',
                                            WebkitBackdropFilter: theme.isGlass ? 'blur(4px)' : 'none'
                                        }}
                                        title={t('common.landscape_mode', 'وضع العرض')}
                                        aria-label={t('common.landscape_mode', 'وضع العرض')}
                                    >
                                        <i className="fa-solid fa-arrows-rotate text-[12px] pointer-events-none"></i>
                                    </div>
                                ) : undefined}
                                 leftAction={isEn && item.id === 'quran' && !isEditMode ? (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigate('quran-landscape');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.stopPropagation();
                                                onNavigate('quran-landscape');
                                            }
                                        }}
                                        className="rounded-full w-[26px] h-[26px] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-md border border-white/30 select-none"
                                        style={{ 
                                            backgroundColor: isBlackTheme ? '#1F2937' : (theme.isGlass ? 'rgba(255, 255, 255, 0.25)' : (theme.palette[1] || '#9333ea')),
                                            color: isBlackTheme ? '#FFFFFF' : '#ffffff',
                                            backdropFilter: theme.isGlass ? 'blur(4px)' : 'none',
                                            WebkitBackdropFilter: theme.isGlass ? 'blur(4px)' : 'none'
                                        }}
                                        title={t('common.landscape_mode', 'وضع العرض')}
                                        aria-label={t('common.landscape_mode', 'وضع العرض')}
                                    >
                                        <i className="fa-solid fa-arrows-rotate text-[12px] pointer-events-none"></i>
                                    </div>
                                ) : undefined}
                                dataId={item.id === 'community' ? 'home-community-btn' : (item.id === 'ahl-al-quran' ? 'home-ahl-al-quran-btn' : undefined)}
                            />
                        )}
                    </motion.div>
                );
            })}

            {/* Fallback to guarantee the prophetic-seerah bar is ALWAYS present even if localStorage was corrupted */}
            {!menuItems.some(i => i.id === 'prophetic-seerah' || i.id === 'more') && (
                <div key="fallback-seerah-bar" className="col-span-6 h-10 relative mt-1 flex justify-center">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full h-full px-1">
                        <div className="relative shrink-0">
                            <motion.button
                                type="button"
                                id="home-community-btn-round"
                                onClick={() => {
                                    if (!isEditMode) {
                                        markPageAsSeen('community');
                                        onNavigate('community');
                                    }
                                }}
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
                                label="السيرة النبوية" 
                                onClick={() => {
                                    if (!isEditMode) {
                                        markPageAsSeen('prophetic-seerah');
                                        onNavigate('prophetic-seerah');
                                    }
                                }} 
                                className="w-full h-full shadow-lg"
                                color={isBlackTheme ? '#000000' : (themeKey === 'default' ? '#059669' : (theme.palette[0] || '#059669'))} 
                                border={isBlackTheme ? '1px solid rgba(255, 255, 255, 0.25)' : theme.btnBorder} 
                                isEditMode={false}
                                isGlass={theme.isGlass}
                                btnText={isBlackTheme ? '#FFFFFF' : (theme.btnText || '#FFFFFF')}
                                showNewBadge={showNewBadges && !isPageSeen('prophetic-seerah')}
                                badgeText={t('common.new', 'جديد')}
                            />
                        </div>
                        <VoiceControlToggle />
                        <div className="relative shrink-0">
                            <motion.button
                                type="button"
                                id="home-ahl-al-quran-btn-round"
                                onClick={() => {
                                    if (!isEditMode) {
                                        markPageAsSeen('ahl-al-quran');
                                        onNavigate('ahl-al-quran');
                                    }
                                }}
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
                                {userRank !== null && userRank !== undefined ? (
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
                                ) : (showNewBadges && !isPageSeen('ahl-al-quran') && (
                                    <span 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markPageAsSeen('ahl-al-quran');
                                        }}
                                        className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[9px] font-bold px-1 rounded-full shadow-xs border border-white dark:border-slate-800 animate-bounce cursor-pointer select-none z-30 scale-75 origin-top-right"
                                        title={t('common.new', 'جديد')}
                                    >
                                        {t('common.new', 'جديد')}
                                    </span>
                                ))}
                            </motion.button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GridSection;
