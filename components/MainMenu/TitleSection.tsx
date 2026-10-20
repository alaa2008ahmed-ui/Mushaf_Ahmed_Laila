import React from 'react';
import FloatingNeonTicker from '../FloatingNeonTicker';
import { useLanguage } from '../../context/LanguageContext';

interface TitleSectionProps {
    isEditMode: boolean;
    setIsEditMode: (isEditMode: boolean) => void;
    handleSaveLayout: () => void;
    handleResetLayout: () => void;
    handleCancelEdit: () => void;
    theme: any;
    themeKey: string;
    onOpenSideMenu: () => void;
    hideTitle?: boolean;
    isSticky?: boolean;
    quickMenuButton?: React.ReactNode;
    isQuickMenuOpen?: boolean;
    onCloseQuickMenu?: () => void;
}

const TitleSection: React.FC<TitleSectionProps> = ({
    isEditMode,
    setIsEditMode,
    handleSaveLayout,
    handleResetLayout,
    handleCancelEdit,
    theme,
    themeKey,
    onOpenSideMenu,
    hideTitle = false,
    isSticky = false,
    quickMenuButton,
    isQuickMenuOpen = false,
    onCloseQuickMenu
}) => {
    const isBlackTheme = theme.bgColor === '#000000';
    const { t, dir } = useLanguage();

    const stickyBgColor = isSticky 
        ? (theme.bgColor || (theme.isDark ? '#000000' : '#ffffff')) 
        : 'transparent';

    return (
        <>
            {/* عنوان التطبيق: يثبت بأول الصفحة عند وصوله لمكان الآية، وتمر باقي الصفحة من تحته مباشرة تحت شريط الهاتف العلوي */}
            <div 
                id="sticky-title-wrapper"
                dir={dir}
                onClick={() => {
                    if (isQuickMenuOpen && onCloseQuickMenu) {
                        onCloseQuickMenu();
                    }
                }}
                className={`sticky top-[env(safe-area-inset-top,0px)] ${isQuickMenuOpen ? 'z-[1150]' : 'z-30'} -mx-4 px-4 text-center select-none pt-1 pb-1 transition-colors duration-150 relative ${
                    isSticky ? 'shadow-sm backdrop-blur-md' : ''
                }`}
                style={{
                    top: 'env(safe-area-inset-top, 0px)',
                    backgroundColor: stickyBgColor,
                }}
            >
                {/* تغطية شريط الحالة العلوية للهاتف عندما يكون العنوان مثبتاً بحيث يبقى شريط الهاتف نظيفاً */}
                <div 
                    aria-hidden="true"
                    className="absolute bottom-full left-0 right-0 pointer-events-none transition-colors duration-150"
                    style={{
                        height: 'calc(env(safe-area-inset-top, 0px) + 2px)',
                        backgroundColor: stickyBgColor,
                    }}
                />
                {!hideTitle && (
                    <h1 
                        id="app-title" 
                        className={`text-3xl sm:text-4xl font-black tracking-tight transition-transform ${isEditMode ? 'scale-110 text-yellow-400' : ''}`} 
                        style={{ color: isEditMode ? undefined : (isBlackTheme ? '#FFFFFF' : theme.textColor) }}
                    >
                        {t('app.name', 'مُصْحَفُ أَحْمَدَ وَلَيْلَى')}
                    </h1>
                )}
                {!isEditMode && quickMenuButton && (
                    <div className={`absolute ${dir === 'ltr' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 flex items-center z-40 transition-all duration-300`}>
                        {quickMenuButton}
                    </div>
                )}
            </div>
            
            {/* الحاوية التي يظهر عليها نص الدعاء أو الشريط الإعلاني المتحرك (تختفي وتمر تحت اسم التطبيق عند التمرير) */}
            <div className="relative z-10 text-center select-none">
                <div className="relative mt-1 min-h-[32px] max-w-sm mx-auto flex items-center justify-center px-4">
                    <p className="text-[15px] font-black" style={{ color: isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#a855f7' : (themeKey === 'olive_grove' ? '#4D7C0F' : theme.textColor)) }}>
                        {isEditMode ? t('common.drag_to_reorder', 'اسحب الأزرار لترتيبها') : t('app.subtitle', 'نرجوا الدعاء لهم بالرحمة والمغفرة')}
                    </p>

                    {/* الشريط المتحرك فوق/على نص الدعاء مباشرة عند تشغيله */}
                    <FloatingNeonTicker />
                </div>
                
                {isEditMode && (
                    <div className="flex justify-center gap-2 mt-4 mb-2">
                        <button 
                            onClick={handleSaveLayout}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition-transform"
                        >
                            {t('common.save', 'حفظ')}
                        </button>
                        <button 
                            onClick={handleResetLayout}
                            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition-transform"
                        >
                            {t('common.reset', 'الافتراضي')}
                        </button>
                        <button 
                            onClick={handleCancelEdit}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition-transform"
                        >
                            {t('common.cancel', 'إلغاء')}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default TitleSection;
