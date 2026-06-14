import React from 'react';

interface TitleSectionProps {
    isEditMode: boolean;
    setIsEditMode: (isEditMode: boolean) => void;
    handleSaveLayout: () => void;
    handleResetLayout: () => void;
    handleCancelEdit: () => void;
    theme: any;
    themeKey: string;
    onOpenSideMenu: () => void;
}

const TitleSection: React.FC<TitleSectionProps> = ({
    isEditMode,
    setIsEditMode,
    handleSaveLayout,
    handleResetLayout,
    handleCancelEdit,
    theme,
    themeKey,
    onOpenSideMenu
}) => {
    const isBlackTheme = theme.bgColor === '#000000';

    return (
        <div className="relative">
            <div className="text-center mt-2 select-none relative">
                <h1 id="app-title" className={`text-4xl font-black tracking-tight transition-transform ${isEditMode ? 'scale-110 text-yellow-400' : ''}`} style={{ color: isEditMode ? undefined : (isBlackTheme ? '#FFFFFF' : theme.textColor) }}>
                    مُصْحَفُ أَحْمَدَ وَلَيْلَى
                </h1>
                <p className="text-[16px] font-black mt-3" style={{ color: isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#a855f7' : (themeKey === 'olive_grove' ? '#4D7C0F' : theme.textColor)) }}>
                    {isEditMode ? 'اسحب الأزرار لترتيبها' : 'نرجوا الدعاء لهم بالرحمة والمغفرة'}
                </p>
                
                {isEditMode && (
                    <div className="flex justify-center gap-2 mt-4 mb-2">
                        <button 
                            onClick={handleSaveLayout}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition-transform"
                        >
                            حفظ
                        </button>
                        <button 
                            onClick={handleResetLayout}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition-transform"
                        >
                            الافتراضي
                        </button>
                        <button 
                            onClick={handleCancelEdit}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition-transform"
                        >
                            إلغاء
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TitleSection;
