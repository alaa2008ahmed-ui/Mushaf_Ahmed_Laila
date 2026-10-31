import React from 'react';
import FloatingNeonTicker from '../FloatingNeonTicker';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

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
    const { isNightMode } = useTheme();
    const { t, dir } = useLanguage();

    const stickyBgColor = isSticky 
        ? (theme.bgColor || (theme.isDark ? '#000000' : '#ffffff')) 
        : 'transparent';

    return (
        <>
            {!hideTitle ? (
                <>
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
                        <div className="w-full flex items-center justify-between relative px-2 min-h-[40px]">
                            {/* زر القائمة السريعة إن وجد على الطرف */}
                            <div className="flex items-center shrink-0 z-20">
                                {!isEditMode && quickMenuButton && (
                                    <div className="flex items-center shrink-0 transition-all duration-300">
                                        {quickMenuButton}
                                    </div>
                                )}
                            </div>

                            {/* اسم التطبيق في منتصف الشريط تماماً */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-center z-10 max-w-[calc(100%-120px)] pointer-events-none">
                                <h1 
                                    id="app-title" 
                                    className={`pointer-events-auto text-[21px] sm:text-[25px] md:text-[28px] font-black font-kufi tracking-tight select-none text-center truncate transition-transform leading-tight ${isEditMode ? 'scale-110 text-yellow-400' : ''}`} 
                                    style={{ 
                                        color: isEditMode ? undefined : (isNightMode ? '#F59E0B' : (isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#4C1D95' : theme.textColor))),
                                        textShadow: isNightMode
                                            ? 'none'
                                            : (isBlackTheme 
                                                ? '0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.8)' 
                                                : '0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 0 rgba(0, 0, 0, 0.15), 0 3px 2px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.25)'),
                                        textRendering: 'optimizeLegibility',
                                        WebkitFontSmoothing: 'antialiased'
                                    }}
                                >
                                    {t('app.name', 'مُصْحَفُ أَحْمَدَ وَلَيْلَى')}
                                </h1>
                            </div>

                            <div className="w-6 h-6 shrink-0 z-20" />
                        </div>
                    </div>

                    <div className="relative z-10 text-center select-none mb-2 px-3">
                        <div className="relative h-[27.5px] max-w-sm mx-auto flex items-center justify-center px-2">
                            <p 
                                className={`text-[12.5px] sm:text-[13.5px] font-bold font-kufi leading-tight tracking-normal text-center ${isNightMode ? '' : 'drop-shadow-sm'}`}
                                style={{ 
                                    color: isNightMode ? '#F59E0B' : (isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#7e22ce' : (themeKey === 'olive_grove' ? '#4D7C0F' : theme.textColor))),
                                    textShadow: isNightMode
                                        ? 'none'
                                        : (isBlackTheme 
                                            ? '0 1px 2px rgba(255,255,255,0.25), 0 3px 6px rgba(0,0,0,0.8)' 
                                            : '0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 0 rgba(0, 0, 0, 0.12), 0 3px 2px rgba(0, 0, 0, 0.18), 0 4px 5px rgba(0, 0, 0, 0.2)'),
                                    textRendering: 'optimizeLegibility',
                                    WebkitFontSmoothing: 'antialiased'
                                }}
                            >
                                {isEditMode ? t('common.drag_to_reorder', 'اسحب الأزرار لترتيبها') : t('app.subtitle', 'نرجوا الدعاء لهم بالرحمة والمغفرة')}
                            </p>
                            <FloatingNeonTicker />
                        </div>
                    </div>
                </>
            ) : null}
            
            {/* أزرار الحفظ والإلغاء عند نمط تعديل الترتيب */}
            {isEditMode && (
                <div className="relative z-10 flex justify-center gap-2 mb-3">
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
        </>
    );
};

export default TitleSection;
