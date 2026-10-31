import React from 'react';
import { motion } from 'framer-motion';
import { 
    BookOpen,
    Headphones,
    BookmarkCheck,
    Brain,
    Clock,
    Compass,
    Sparkles,
    Sun,
    HeartHandshake,
    CircleDot,
    ScrollText,
    Award,
    BookMarked,
    Star,
    CalendarDays,
    Tent,
    ShieldCheck,
    CheckSquare,
    Globe,
    Calculator,
    Mic
} from 'lucide-react';
import NavButton from './NavButton';
import WhatsAppButton from '../WhatsAppButton';
import VoiceControlToggle from '../VoiceControlToggle';
import { useVoiceControl } from '../../context/VoiceControlContext';
import { useShowNewBadge, useSeenPages, markPageAsSeen } from '../../utils/badgeManager';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

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

// Categorical color constants for the 4 sections (Vivid, Luminous 3D)
const SECTION_1_PURPLE = '#6A588C';
const SECTION_1_GRADIENT = 'linear-gradient(155deg, #7C68A0 0%, #5E4C7E 100%)';

const SECTION_2_GREEN = '#2E7D5E';
const SECTION_2_GRADIENT = 'linear-gradient(155deg, #35936E 0%, #246B50 100%)';

const SECTION_3_TEAL = '#3B7A82';
const SECTION_3_GRADIENT = 'linear-gradient(155deg, #46919B 0%, #2E6B73 100%)';

const SECTION_4_TERRACOTTA = '#A26743';
const SECTION_4_GRADIENT = 'linear-gradient(155deg, #BD7A4F 0%, #915A36 100%)';

// Distinctive, dignified calm slate-violet gradient for Holy Quran hero card
const QURAN_HERO_VIOLET = '#544670';
const QURAN_HERO_GRADIENT = 'linear-gradient(150deg, #6C5A8E 0%, #4E3F6D 55%, #3E3059 100%)';

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
    const { isNightMode } = useTheme();
    const isEn = language === "en";

    const getButtonIcon = (id: string) => {
        const iconClass = "w-3 h-3 min-[380px]:w-3.5 min-[380px]:h-3.5";
        switch (id) {
            case 'quran':
                return <BookOpen className={iconClass} />;
            case 'listen':
                return <Headphones className={iconClass} />;
            case 'daily-wird':
                return <BookmarkCheck className={iconClass} />;
            case 'memorization':
                return <Brain className={iconClass} />;
            case 'prayer-times':
                return <Clock className={iconClass} />;
            case 'qibla':
                return <Compass className={iconClass} />;
            case 'salah-adhkar':
                return <Sparkles className={iconClass} />;
            case 'sabah-masaa':
                return <Sun className={iconClass} />;
            case 'adia':
                return <HeartHandshake className={iconClass} />;
            case 'tasbeeh':
                return <CircleDot className={iconClass} />;
            case 'hisn-muslim':
                return <BookOpen className={iconClass} />;
            case 'prophetic-seerah':
                return <ScrollText className={iconClass} />;
            case 'ten-promised':
                return <Award className={iconClass} />;
            case 'nawawi':
                return <BookMarked className={iconClass} />;
            case 'asmaul-husna':
                return <Star className={iconClass} />;
            case 'calendar':
                return <CalendarDays className={iconClass} />;
            case 'hajj-umrah':
                return <Tent className={iconClass} />;
            case 'others':
                return <ShieldCheck className={iconClass} />;
            case 'habit-tracker':
                return <CheckSquare className={iconClass} />;
            case 'islamic-sites':
                return <Globe className={iconClass} />;
            case 'calculators':
                return <Calculator className={iconClass} />;
            case 'voice-control':
                return <Mic className={iconClass} />;
            default:
                return null;
        }
    };

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
    const buttonBorder = isBlackTheme 
        ? '1px solid rgba(255, 255, 255, 0.25)' 
        : (theme.btnBorder && !theme.btnBorder.includes('#000000') && !theme.btnBorder.includes('black') ? theme.btnBorder : 'none');

    const stripIcons = (str: string) => {
        if (!str) return '';
        return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').replace(/^[\s✨📖🎧⏱️🧭🕌🤲🛡️☀️📅🕋📿💬🏆🧠🎯🌐🧮📚📜🎙️🔍📥]+/gu, '').trim();
    };

    // Items that display the "جديد" (New) badge
    const NEW_BADGE_ITEMS = ['others', 'islamic-sites', 'prophetic-seerah', 'ten-promised'];

    const getItem = (id: string) => {
        return menuItems.find(i => i.id === id) || DEFAULT_MENU_ITEMS.find(i => i.id === id) || { id, label: id, className: 'col-span-2 h-11' };
    };

    const getCategoryColor = (id: string) => {
        if (isBlackTheme) return { color: '#000000', gradient: undefined };
        if (themeKey === 'shiny_gold') {
            return { 
                color: '#EAB308', 
                gradient: 'linear-gradient(155deg, #FFFDEB 0%, #FEF08A 25%, #FACC15 65%, #EAB308 100%)' 
            };
        }
        
        if (['listen', 'daily-wird', 'memorization'].includes(id)) {
            return { 
                color: themeKey === 'default' ? SECTION_1_PURPLE : (theme.palette[1] || theme.palette[0] || SECTION_1_PURPLE),
                gradient: themeKey === 'default' ? SECTION_1_GRADIENT : undefined
            };
        }
        if (['prayer-times', 'salah-adhkar', 'qibla', 'sabah-masaa', 'adia', 'tasbeeh', 'others'].includes(id)) {
            return { 
                color: themeKey === 'default' ? SECTION_2_GREEN : (theme.palette[0] || SECTION_2_GREEN),
                gradient: themeKey === 'default' ? SECTION_2_GRADIENT : undefined
            };
        }
        if (['hisn-muslim', 'prophetic-seerah', 'ten-promised', 'hajj-umrah', 'asmaul-husna'].includes(id)) {
            return { 
                color: themeKey === 'default' ? SECTION_3_TEAL : (theme.palette[2] || theme.palette[0] || SECTION_3_TEAL),
                gradient: themeKey === 'default' ? SECTION_3_GRADIENT : undefined
            };
        }
        if (['calendar', 'nawawi', 'calculators', 'habit-tracker', 'islamic-sites'].includes(id)) {
            return { 
                color: themeKey === 'default' ? SECTION_4_TERRACOTTA : (theme.palette[3] || theme.palette[0] || SECTION_4_TERRACOTTA),
                gradient: themeKey === 'default' ? SECTION_4_GRADIENT : undefined
            };
        }
        return { 
            color: themeKey === 'default' ? SECTION_2_GREEN : (theme.palette[0] || SECTION_2_GREEN),
            gradient: themeKey === 'default' ? SECTION_2_GRADIENT : undefined
        };
    };

    const renderNavButtonItem = (id: string, customClassName?: string) => {
        const item = getItem(id);
        const isVisible = visibleItems.includes(item.id);
        if (!isVisible && !isEditMode) return null;

        const { color: buttonColor, gradient: buttonGradient } = getCategoryColor(item.id);
        const textColor = isNightMode ? '#F59E0B' : (themeKey === 'shiny_gold' ? '#000000' : '#FFFFFF');

        const isForcedNew = item.id === 'others' || item.id === 'islamic-sites' || item.id === 'prophetic-seerah' || item.id === 'ten-promised';
        const showBadge = (isForcedNew || showNewBadges) && NEW_BADGE_ITEMS.includes(item.id) && !isPageSeen(item.id);

        return (
            <motion.div
                key={item.id}
                id={`menu-item-${item.id}`}
                data-item-id={item.id}
                className={`${customClassName || 'h-11'} relative ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                style={{ visibility: isVisible ? 'visible' : 'hidden' }}
                drag={isEditMode}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={1}
                whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing', opacity: 0.8 }}
                onDragStart={handleDragStart}
                onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
            >
                <NavButton 
                    label={stripIcons(translateMenuItem(item.id, item.label))} 
                    icon={item.id === 'quran' ? getButtonIcon(item.id) : undefined}
                    onClick={() => {
                        if (!isEditMode) {
                            markPageAsSeen(item.id);
                            onNavigate(item.id);
                        }
                    }} 
                    className="w-full h-full"
                    color={buttonColor} 
                    gradient={buttonGradient}
                    border={buttonBorder} 
                    isEditMode={isEditMode}
                    onResize={(e) => handleResize(item.id, e)}
                    isGlass={theme.isGlass}
                    btnText={textColor}
                    showNewBadge={showBadge}
                    badgeText={t('common.new', 'جديد')}
                    onBadgeClick={() => {
                        markPageAsSeen(item.id);
                    }}
                />
            </motion.div>
        );
    };

    // Prominent Hero Card for Quran (Distinctive dignified visual hierarchy)
    const renderQuranHeroCard = () => {
        const item = getItem('quran');
        const isVisible = visibleItems.includes('quran');
        if (!isVisible && !isEditMode) return null;

        // Distinguished dignified slate-violet gradient for Quran hero card
        const buttonColor = isBlackTheme
            ? '#000000'
            : (themeKey === 'shiny_gold'
                ? '#EAB308'
                : (themeKey === 'default'
                    ? QURAN_HERO_VIOLET
                    : (theme.palette[1] || theme.palette[0] || QURAN_HERO_VIOLET)));

        const buttonGradient = isBlackTheme
            ? undefined
            : (themeKey === 'shiny_gold'
                ? 'linear-gradient(155deg, #FFFDEB 0%, #FEF08A 25%, #FACC15 65%, #EAB308 100%)'
                : (themeKey === 'default'
                    ? QURAN_HERO_GRADIENT
                    : undefined));

        return (
            <motion.div
                key="quran-hero"
                id="menu-item-quran"
                data-item-id="quran"
                className="w-full relative"
                drag={isEditMode}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={1}
                whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing', opacity: 0.8 }}
                onDragStart={handleDragStart}
                onDragEnd={(e, info) => handleDragEnd(e, info, 'quran')}
            >
                <motion.div
                    whileHover={!isEditMode ? { scale: 1.018, y: -2.5 } : {}}
                    whileTap={!isEditMode ? { scale: 0.985, y: 2 } : {}}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => {
                        if (!isEditMode) {
                            markPageAsSeen('quran');
                            onNavigate('quran');
                        }
                    }}
                    className={`w-full rounded-2xl p-3 sm:p-3.5 relative flex items-center justify-between cursor-pointer select-none group transition-all overflow-hidden ${isEditMode ? 'cursor-move animate-pulse opacity-80' : ''}`}
                    style={{
                        background: theme.isGlass ? (buttonColor ? `${buttonColor}60` : 'rgba(255, 255, 255, 0.25)') : (buttonGradient || buttonColor),
                        border: themeKey === 'shiny_gold' ? '1.5px solid #CA8A04' : buttonBorder,
                        color: themeKey === 'shiny_gold' ? '#000000' : '#FFFFFF',
                        backdropFilter: theme.isGlass ? 'blur(12px)' : 'none',
                        WebkitBackdropFilter: theme.isGlass ? 'blur(12px)' : 'none',
                        boxShadow: themeKey === 'shiny_gold'
                            ? '0 6px 0 #92400E, 0 12px 28px -2px rgba(146, 64, 14, 0.35), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2.5px 4px rgba(113, 63, 18, 0.25)'
                            : (isBlackTheme
                                ? '0 5.5px 0 #222222, 0 8px 16px rgba(0,0,0,0.6), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.3)'
                                : (theme.isGlass
                                    ? `0 6px 0 ${buttonColor}40, 0 8px 24px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.4)`
                                    : '0 6px 0 rgba(0, 0, 0, 0.25), 0 12px 28px -2px rgba(60, 48, 88, 0.35), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2.5px 5px rgba(0, 0, 0, 0.18)')),
                    }}
                >
                    {/* Inner 3D gloss & specular sheen for Quran hero card */}
                    {!theme.isGlass && (
                        <>
                            {/* Upper soft gloss reflection */}
                            <div className="absolute inset-x-2 top-0.5 h-[48%] rounded-t-[14px] bg-gradient-to-b from-white/32 via-white/10 to-transparent pointer-events-none"></div>
                            
                            {/* Specular top highlight */}
                            <div className="absolute inset-x-5 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none"></div>
                            
                            {/* Bottom inner rim */}
                            <div className="absolute inset-x-3 bottom-0 h-[2px] bg-black/20 rounded-b-2xl pointer-events-none"></div>
                        </>
                    )}

                    {/* Hover shine effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    <div className="flex items-center gap-2.5 min-w-0 flex-1 px-1 relative z-10">
                        {/* أيقونة المصحف الشريف المسطحة */}
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 ${themeKey === 'shiny_gold' ? 'text-black' : 'text-white'}`}>
                            <BookOpen className={`w-6 h-6 sm:w-7 sm:h-7 ${themeKey === 'shiny_gold' ? 'text-black' : 'text-white'} drop-shadow-sm`} strokeWidth={2.3} />
                        </div>

                        <div className="flex flex-col min-w-0 text-start">
                            <span className={`${isEn ? 'font-sans tracking-tight' : 'font-kufi'} font-black text-base sm:text-lg ${isNightMode ? 'text-amber-500' : (themeKey === 'shiny_gold' ? 'text-black' : 'text-white')} leading-tight truncate drop-shadow-sm`}>
                                {isEn ? "The Noble Qur'an" : "القرآن الكريم"}
                            </span>
                            <span className={`text-[11px] sm:text-xs ${isNightMode ? 'text-amber-400' : (themeKey === 'shiny_gold' ? 'text-black/85' : 'text-white/95')} font-medium leading-normal truncate drop-shadow-xs`}>
                                {isEn ? 'Recitation, Exegesis & Reflection' : 'قراءة وتدبر المصحف الشريف'}
                            </span>
                        </div>
                    </div>

                    {/* Landscape Rotate Button */}
                    {!isEditMode && (
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
                            className={`rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${themeKey === 'shiny_gold' ? 'text-black' : 'text-white'} relative z-20 flex-shrink-0 ms-2 overflow-hidden select-none`}
                            style={{ 
                                backgroundColor: isBlackTheme ? '#1F2937' : (themeKey === 'shiny_gold' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.32)'),
                                border: themeKey === 'shiny_gold' ? '1px solid rgba(146, 64, 14, 0.35)' : '1px solid rgba(255, 255, 255, 0.45)',
                                color: themeKey === 'shiny_gold' ? '#000000' : '#FFFFFF',
                                boxShadow: themeKey === 'shiny_gold'
                                    ? '0 3px 0 #B45309, 0 4px 8px rgba(180, 83, 9, 0.2), inset 0 1px 1px #FFFFFF'
                                    : '0 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                            }}
                            title={t('common.landscape_mode', 'وضع العرض')}
                            aria-label={t('common.landscape_mode', 'وضع العرض')}
                        >
                            {/* Top gloss for landscape button */}
                            <div className="absolute inset-x-1 top-0 h-1/2 rounded-t-lg bg-gradient-to-b from-white/35 to-transparent pointer-events-none"></div>
                            <i className={`fa-solid fa-arrows-rotate text-xs ${themeKey === 'shiny_gold' ? 'text-black' : 'text-white'} pointer-events-none drop-shadow-xs`}></i>
                            <span className={`text-[11px] font-black ${isEn ? 'font-sans' : 'font-kufi'} ${themeKey === 'shiny_gold' ? 'text-black' : 'text-white'} inline drop-shadow-xs`}>
                                {isEn ? 'Landscape' : 'عرضي'}
                            </span>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        );
    };

    // Dynamic 3D elevated container cards: adapts dynamically to every theme
    // with a lighter/clearer shade than the theme background, 3D bottom bevel, specular gloss & depth
    const sectionCardStyle = React.useMemo(() => {
        const isGlass = Boolean(theme.isGlass);
        const isDark = Boolean(theme.isDark) || isBlackTheme;

        if (isBlackTheme) {
            return {
                backgroundColor: '#18181C',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '22px',
                boxShadow: '0 6px 0 #0d0d10, 0 10px 24px -2px rgba(0, 0, 0, 0.7), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.22), inset 0 -2px 4px rgba(0, 0, 0, 0.45)',
            } as React.CSSProperties;
        }

        if (themeKey === 'shiny_gold') {
            return {
                background: 'linear-gradient(145deg, #FFFDEB 0%, #FEF08A 25%, #FACC15 58%, #EAB308 85%, #CA8A04 100%)',
                border: '1.5px solid rgba(202, 138, 4, 0.7)',
                borderRadius: '22px',
                boxShadow: '0 6.5px 0 #92400E, 0 14px 28px -2px rgba(146, 64, 14, 0.35), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2.5px 4px rgba(113, 63, 18, 0.25)',
                color: '#000000',
            } as React.CSSProperties;
        }

        if (isGlass) {
            return {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                borderRadius: '22px',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                boxShadow: isDark
                    ? '0 6px 0 rgba(0, 0, 0, 0.35), 0 12px 28px rgba(0, 0, 0, 0.3), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.35), inset 0 -2px 4px rgba(0, 0, 0, 0.2)'
                    : '0 6px 0 rgba(255, 255, 255, 0.25), 0 12px 26px rgba(0, 0, 0, 0.08), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.75), inset 0 -2px 4px rgba(0, 0, 0, 0.04)',
            } as React.CSSProperties;
        }

        // Parse theme background color
        const rawBg = theme.bgColor || (isDark ? '#0F172A' : '#DFE5EC');
        let r = 223, g = 229, b = 236; // fallback
        if (typeof rawBg === 'string' && rawBg.startsWith('#')) {
            let clean = rawBg.replace('#', '').trim();
            if (clean.length === 3) {
                clean = clean.split('').map((c: string) => c + c).join('');
            }
            if (clean.length === 6) {
                const parsedR = parseInt(clean.substring(0, 2), 16);
                const parsedG = parseInt(clean.substring(2, 4), 16);
                const parsedB = parseInt(clean.substring(4, 6), 16);
                if (!isNaN(parsedR) && !isNaN(parsedG) && !isNaN(parsedB)) {
                    r = parsedR;
                    g = parsedG;
                    b = parsedB;
                }
            }
        }

        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const isDarkBg = isDark || lum < 0.45;

        if (isDarkBg) {
            // Dark theme: Elevate by lightening the dark hue (+24% towards lighter)
            let lightR: number;
            let lightG: number;
            let lightB: number;

            if (lum < 0.08) {
                lightR = Math.min(255, r + 28);
                lightG = Math.min(255, g + 32);
                lightB = Math.min(255, b + 42);
            } else {
                lightR = Math.min(255, Math.round(r + (255 - r) * 0.24));
                lightG = Math.min(255, Math.round(g + (255 - g) * 0.24));
                lightB = Math.min(255, Math.round(b + (255 - b) * 0.24));
            }

            const toH = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
            const cardBg = `#${toH(lightR)}${toH(lightG)}${toH(lightB)}`;

            return {
                backgroundColor: cardBg,
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '22px',
                boxShadow: '0 6px 0 rgba(0, 0, 0, 0.45), 0 10px 24px -2px rgba(0, 0, 0, 0.55), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.22), inset 0 -2px 4px rgba(0, 0, 0, 0.35)',
            } as React.CSSProperties;
        } else {
            // Light theme: Generate a tone visibly lighter and brighter than the background
            // by blending with white, while preserving the theme's subtle hue tint!
            const blendFactor = lum > 0.94 ? 0.75 : 0.62;
            const lightR = Math.min(255, Math.round(r + (255 - r) * blendFactor));
            const lightG = Math.min(255, Math.round(g + (255 - g) * blendFactor));
            const lightB = Math.min(255, Math.round(b + (255 - b) * blendFactor));

            const toH = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
            const cardBg = `#${toH(lightR)}${toH(lightG)}${toH(lightB)}`;

            return {
                backgroundColor: cardBg,
                border: '1px solid rgba(255, 255, 255, 0.92)',
                borderRadius: '22px',
                boxShadow: '0 6px 0 rgba(0, 0, 0, 0.08), 0 10px 22px -3px rgba(0, 0, 0, 0.08), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(0, 0, 0, 0.04)',
            } as React.CSSProperties;
        }
    }, [theme, themeKey, isBlackTheme]);

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto flex-grow content-center relative mt-0 pb-3" dir={dir}>
            
            {/* القسم الأول: القرآن الكريم (التركيز الرئيسي للتطبيق) */}
            <div className="w-full rounded-[22px] p-2.5 sm:p-3 relative overflow-hidden flex flex-col gap-2.5 transition-all" style={sectionCardStyle}>
                {/* 3D Glossy specular sheen across upper card section */}
                {!theme.isGlass && (
                    <>
                        <div className="absolute inset-x-2 top-0.5 h-[36%] rounded-t-[20px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none z-0" />
                        <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none z-0" />
                        <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/8 dark:bg-black/25 rounded-b-[22px] pointer-events-none z-0" />
                    </>
                )}

                <div className="relative z-10 flex flex-col gap-2.5 w-full">
                    {/* القرآن الكريم: بطاقة كبيرة ومميزة تتصدر الشاشة */}
                    {renderQuranHeroCard()}

                    {/* بقية أزرار القرآن: الاستماع للقرآن، التحفيظ، الورد اليومي */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
                        {renderNavButtonItem('listen')}
                        {renderNavButtonItem('memorization')}
                        {renderNavButtonItem('daily-wird')}
                    </div>
                </div>
            </div>

            {/* القسم الثاني: العبادات اليومية */}
            <div className="w-full rounded-[22px] p-2.5 sm:p-3 relative overflow-hidden flex flex-col gap-2 sm:gap-2.5 transition-all" style={sectionCardStyle}>
                {/* 3D Glossy specular sheen across upper card section */}
                {!theme.isGlass && (
                    <>
                        <div className="absolute inset-x-2 top-0.5 h-[36%] rounded-t-[20px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none z-0" />
                        <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none z-0" />
                        <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/8 dark:bg-black/25 rounded-b-[22px] pointer-events-none z-0" />
                    </>
                )}

                <div className="relative z-10 flex flex-col gap-2 sm:gap-2.5 w-full">
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
                        {renderNavButtonItem('prayer-times')}
                        {renderNavButtonItem('salah-adhkar')}
                        {renderNavButtonItem('qibla')}
                    </div>
                    <div className={`grid ${isEn ? 'grid-cols-4' : 'grid-cols-[0.9fr_0.9fr_0.95fr_1.35fr]'} gap-1.5 sm:gap-2.5 w-full`}>
                        {renderNavButtonItem('sabah-masaa')}
                        {renderNavButtonItem('adia')}
                        {renderNavButtonItem('tasbeeh')}
                        {renderNavButtonItem('others')}
                    </div>
                </div>
            </div>

            {/* القسم الثالث: المكتبة الإسلامية */}
            <div className="w-full rounded-[22px] p-2.5 sm:p-3 relative overflow-hidden flex flex-col gap-2.5 transition-all" style={sectionCardStyle}>
                {/* 3D Glossy specular sheen across upper card section */}
                {!theme.isGlass && (
                    <>
                        <div className="absolute inset-x-2 top-0.5 h-[36%] rounded-t-[20px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none z-0" />
                        <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none z-0" />
                        <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/8 dark:bg-black/25 rounded-b-[22px] pointer-events-none z-0" />
                    </>
                )}

                <div className="relative z-10 w-full">
                    <div className="grid grid-cols-6 gap-2 sm:gap-2.5 w-full">
                        {renderNavButtonItem('prophetic-seerah', 'col-span-3 h-11')}
                        {renderNavButtonItem('ten-promised', 'col-span-3 h-11')}
                        {renderNavButtonItem('hisn-muslim', 'col-span-2 h-11')}
                        {renderNavButtonItem('hajj-umrah', 'col-span-2 h-11')}
                        {renderNavButtonItem('asmaul-husna', 'col-span-2 h-11')}
                    </div>
                </div>
            </div>

            {/* القسم الرابع: خدمات إضافية */}
            <div className="w-full rounded-[22px] p-2.5 sm:p-3 relative overflow-hidden flex flex-col gap-2.5 transition-all" style={sectionCardStyle}>
                {/* 3D Glossy specular sheen across upper card section */}
                {!theme.isGlass && (
                    <>
                        <div className="absolute inset-x-2 top-0.5 h-[36%] rounded-t-[20px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none z-0" />
                        <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none z-0" />
                        <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/8 dark:bg-black/25 rounded-b-[22px] pointer-events-none z-0" />
                    </>
                )}

                <div className="relative z-10 w-full">
                    <div className="grid grid-cols-6 gap-2 sm:gap-2.5 w-full">
                        {renderNavButtonItem('habit-tracker', 'col-span-3 h-11')}
                        {renderNavButtonItem('calculators', 'col-span-3 h-11')}
                        {renderNavButtonItem('nawawi', 'col-span-2 h-11')}
                        {renderNavButtonItem('calendar', 'col-span-2 h-11')}
                        {renderNavButtonItem('islamic-sites', 'col-span-2 h-11')}
                    </div>
                </div>
            </div>

            {/* الصف السفلي: أيقونة الواتساب - زر التحكم الصوتي - أيقونة التفعيل */}
            <div key="bottom-voice-bar" className="w-full h-10 relative mt-1 flex justify-center">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full h-full px-1">
                    <WhatsAppButton />
                    <div className="flex-1 min-w-[130px] max-w-[210px] h-full">
                        <NavButton 
                            label={stripIcons(translateMenuItem('voice-control', 'التحكم الصوتي')) || "التحكم الصوتي"} 
                            icon={<Mic className="w-3.5 h-3.5" />}
                            onClick={() => {
                                if (!isEditMode) {
                                    markPageAsSeen('voice-control');
                                    onNavigate('voice-control');
                                }
                            }} 
                            className="w-full h-full shadow-lg"
                            color={isBlackTheme ? '#000000' : (themeKey === 'shiny_gold' ? '#EAB308' : (themeKey === 'default' ? SECTION_2_GREEN : (theme.palette[0] || SECTION_2_GREEN)))} 
                            gradient={!isBlackTheme && (themeKey === 'shiny_gold' ? 'linear-gradient(155deg, #FFFDEB 0%, #FEF08A 25%, #FACC15 65%, #EAB308 100%)' : (themeKey === 'default' ? SECTION_2_GRADIENT : undefined))}
                            border={themeKey === 'shiny_gold' ? '1.5px solid #CA8A04' : buttonBorder} 
                            isEditMode={isEditMode}
                            isGlass={theme.isGlass}
                            btnText={themeKey === 'shiny_gold' ? '#000000' : '#FFFFFF'}
                        />
                    </div>
                    <VoiceControlToggle />
                </div>
            </div>
        </div>
    );
};

export default GridSection;
