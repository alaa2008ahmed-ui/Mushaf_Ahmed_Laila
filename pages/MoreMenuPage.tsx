import React, { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import InteractiveBackground from '../components/InteractiveBackground';
import NavButton from '../components/MainMenu/NavButton';
import { motion } from 'motion/react';

const ALL_MENU_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-14", colorIndex: 0 },
    { id: 'community', label: "💬 مجتمع المصحف والتواصل", className: "col-span-2 h-14", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-1 h-14", colorIndex: 0 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "col-span-1 h-14", colorIndex: 0 },
    { id: 'adia', label: "🤲 الأدعية", className: "col-span-1 h-14", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "col-span-1 h-14", colorIndex: 1 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "col-span-1 h-14", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "col-span-1 h-14", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "col-span-1 h-14", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "col-span-1 h-14", colorIndex: 1 },
    { id: 'qibla', label: "🧭 القبلة", className: "col-span-1 h-14", colorIndex: 1 },
    { id: 'nawawi', label: "📚 الأربعون النووية", className: "col-span-1 h-14", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "col-span-1 h-14", colorIndex: 1 },
    { id: 'calculators', label: "🧮 الحاسبة الشرعية", className: "col-span-1 h-14", colorIndex: 1 },
    // الصفحات الجديدة في نهاية القائمة
    { id: 'daily-wird', label: "📅 الورد اليومي", className: "col-span-1 h-14", colorIndex: 0 },
    { id: 'habit-tracker', label: "🎯 مربّي العبادات", className: "col-span-1 h-14", colorIndex: 0 },
    { id: 'memorization', label: "🧠 التحفيظ", className: "col-span-1 h-14", colorIndex: 0 },
    { id: 'voice-control', label: "🎙️ التحكم الصوتي", className: "col-span-1 h-14", colorIndex: 0 },
    { id: 'asmaul-husna', label: "✨ أسماء الله الحسنى", className: "col-span-2 h-14", colorIndex: 0 },
];

interface MoreMenuPageProps {
    onNavigate: (pageId: string, params?: any) => void;
    onBack: () => void;
}
import ThemePageLock from '../components/ThemePageLock';

const MoreMenuPage: React.FC<MoreMenuPageProps> = ({ onNavigate, onBack }) => {
    const { theme, themeKey, togglePageLock, isPageLocked } = useTheme();
    const [showNewBadges, setShowNewBadges] = useState(false);
    const [visibleItems, setVisibleItems] = useState<string[]>(() => {
        const savedVisible = localStorage.getItem('visibleMenuItems');
        return savedVisible ? JSON.parse(savedVisible) : ALL_MENU_ITEMS.map(i => i.id);
    });

    useEffect(() => {
        const currentOpens = parseInt(localStorage.getItem('app_opens_count_new') || '1');
        if (currentOpens <= 5) {
            setShowNewBadges(true);
        }
    }, []);

    const getPrimaryColor = (itemId: string, index: number) => {
        // تخصيص اللون البنفسجي للأزرار المطلوبة
        if (['quran', 'listen', 'prayer-times'].includes(itemId)) {
            return '#8B5CF6'; // اللون البنفسجي
        }

        if (themeKey === 'olive_grove') {
            return ['daily-wird', 'memorization', 'voice-control'].includes(itemId) 
                ? '#4D7C0F' : '#65A30D';
        }
        return theme.palette[index] || theme.palette[0];
    };

    return (
        <div id="more-menu-container">
            <InteractiveBackground />
            <div className="h-screen w-full flex flex-col overflow-hidden">
                <header className="app-top-bar">
                    <div className="app-top-bar__inner">
                        <div className="relative flex items-center justify-center w-full">
                            <div className="absolute left-0">
                                <ThemePageLock />
                            </div>
                            <h1 className="app-top-bar__title text-2xl font-kufi">قائمة التطبيقات</h1>
                        </div>
                        <p className="app-top-bar__subtitle">تصفح جميع أقسام التطبيق</p>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
                    <div className="main-layout px-4 flex flex-col" style={{ fontFamily: theme.font }}>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-5 w-full max-w-sm mx-auto mt-6">
                            {ALL_MENU_ITEMS.map((item, idx) => {
                                const isVisible = visibleItems.includes(item.id) || ['daily-wird', 'memorization', 'voice-control', 'habit-tracker', 'asmaul-husna', 'community'].includes(item.id);
                                const isDefault = themeKey === 'default';
                                const isBlackTheme = theme.bgColor === '#000000';
                                const primaryColor = isBlackTheme ? '#000000' : (isDefault ? '#FFFFFF' : getPrimaryColor(item.id, item.colorIndex));
                                const textColor = isBlackTheme ? '#FFFFFF' : (isDefault ? '#000000' : theme.btnText);
                                const isNew = showNewBadges && ['daily-wird', 'memorization', 'voice-control', 'asmaul-husna', 'habit-tracker'].includes(item.id);
                                
                                return (
                                    <div
                                        key={item.id}
                                        className={`${item.className} relative`}
                                        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
                                    >
                                        <NavButton
                                            label={item.label}
                                            onClick={() => onNavigate(item.id, { from: 'more-menu' })}
                                            className="w-full h-full"
                                            color={primaryColor}
                                            showNewBadge={isNew}
                                            badgeText="جديد"
                                            isGlass={isBlackTheme ? false : (isDefault ? false : theme.isGlass)}
                                            btnText={textColor}
                                            border={isBlackTheme ? '1px solid #333333' : (isDefault ? '2px solid #000000' : undefined)}
                                        />
                                        {item.id === 'quran' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onNavigate('quran-landscape');
                                                }}
                                                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full w-9 h-9 flex items-center justify-center z-[20] transition-all shadow-xl border"
                                                style={{ 
                                                    backgroundColor: isBlackTheme ? '#000000' : (themeKey === 'default' ? '#ffffff' : (theme.isGlass ? 'rgba(255, 255, 255, 0.2)' : (theme.palette[1] || '#8B5CF6'))),
                                                    color: isBlackTheme ? '#ffffff' : (themeKey === 'default' ? '#000000' : '#ffffff'),
                                                    borderColor: isBlackTheme ? '#333333' : (themeKey === 'default' ? '#000000' : (theme.isGlass ? 'rgba(255, 255, 255, 0.3)' : 'transparent')),
                                                    backdropFilter: theme.isGlass ? 'blur(4px)' : 'none',
                                                    WebkitBackdropFilter: theme.isGlass ? 'blur(4px)' : 'none',
                                                    borderWidth: (isBlackTheme || themeKey === 'default') ? '2px' : '1px'
                                                }}
                                                title="وضع العرض"
                                            >
                                                <i className="fa-solid fa-arrows-rotate text-lg"></i>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <BottomBar onHomeClick={() => onNavigate('home')} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default MoreMenuPage;
