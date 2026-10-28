import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { HISN_ALMUSLIM_CATEGORIES, HISN_ALMUSLIM_DATA } from '../../data/hisnAlmuslimData';
import { HISN_CATEGORIES_EN, HISN_ITEMS_EN } from '../../data/hisnAlmuslimTranslationsEn';
import { getModernFlatTokens, hexToRgba } from '../../utils/flatDesignTokens';

interface CategoryListProps {
    onSelectCategory: (category: any) => void;
    activeTab: 'grid' | 'list';
    searchQuery: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory, activeTab, searchQuery }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const tokens = getModernFlatTokens(theme, themeKey);
    const isEn = language === 'en';

    const filteredCategories = HISN_ALMUSLIM_CATEGORIES.filter(category => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const titleAr = category.title.toLowerCase();
        const enInfo = HISN_CATEGORIES_EN[category.id];
        const titleEn = (enInfo?.title || '').toLowerCase();
        if (titleAr.includes(q) || titleEn.includes(q)) return true;

        const items = HISN_ALMUSLIM_DATA[category.id] || [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemTrans = HISN_ITEMS_EN[`${category.id}_${i}`];
            if (item.text && item.text.toLowerCase().includes(q)) return true;
            if (item.title && item.title.toLowerCase().includes(q)) return true;
            if (itemTrans?.text && itemTrans.text.toLowerCase().includes(q)) return true;
            if (itemTrans?.title && itemTrans.title.toLowerCase().includes(q)) return true;
        }
        return false;
    });

    if (filteredCategories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-60 text-center">
                <i className="fa-solid fa-magnifying-glass text-4xl mb-3 text-slate-400"></i>
                <p className="font-bold text-sm">
                    {isEn ? 'No categories found matching your search' : 'لا توجد أبواب تطابق بحثك'}
                </p>
            </div>
        );
    }

    return (
        <div className={activeTab === 'grid' ? "grid grid-cols-2 gap-3.5 p-1" : "space-y-3 p-1"} dir={isEn ? 'ltr' : 'rtl'}>
            {filteredCategories.map((category, index) => {
                const rawColor = theme.palette[index % theme.palette.length] || tokens.primaryColor;
                const isColorWhite = !rawColor || rawColor.toLowerCase() === '#ffffff' || rawColor.toLowerCase() === '#fff';
                const color = tokens.isDeepBlack && isColorWhite ? '#10b981' : rawColor;
                const enInfo = HISN_CATEGORIES_EN[category.id];
                const categoryTitle = isEn ? (enInfo?.title || category.title) : category.title;
                const categorySubtitle = isEn ? (enInfo?.subtitle || '') : '';
                
                return (
                    <div 
                        key={category.id} 
                        onClick={() => onSelectCategory({ ...category, title: categoryTitle, titleAr: category.title })}
                        className="relative group cursor-pointer active:scale-[0.98] transition-transform duration-200"
                    >
                        <div 
                            className={`h-full p-4 rounded-[18px] transition-all duration-200 flex ${activeTab === 'grid' ? 'flex-col items-center text-center gap-2.5 min-h-[140px] justify-center' : 'items-center justify-between gap-4'} overflow-hidden`} 
                            style={{ 
                                backgroundColor: tokens.cardBgColor,
                                boxShadow: tokens.cardShadow,
                                color: 'var(--text-color)',
                            }}
                        >
                            <div className={`flex ${activeTab === 'grid' ? 'flex-col items-center gap-2.5' : 'items-center gap-3.5'}`}>
                                <div 
                                    className={`${activeTab === 'grid' ? 'w-14 h-14 rounded-2xl' : 'w-12 h-12 rounded-2xl'} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}
                                    style={{ 
                                        backgroundColor: tokens.isDeepBlack ? 'rgba(255, 255, 255, 0.12)' : hexToRgba(color, 0.1),
                                        color: tokens.isDeepBlack ? '#FFFFFF' : color,
                                    }}
                                >
                                    <i className={`fa-solid ${category.icon || 'fa-book-open'} ${activeTab === 'grid' ? 'text-2xl' : 'text-xl'}`}></i>
                                </div>
                                
                                <div className={activeTab === 'grid' ? '' : (isEn ? 'text-left' : 'text-right')}>
                                    <h2 
                                        className={`font-bold text-sm sm:text-base leading-snug font-cairo ${activeTab === 'grid' ? 'line-clamp-2' : ''} ${isEn ? 'font-sans' : ''}`} 
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        {categoryTitle}
                                    </h2>
                                    {activeTab === 'list' && categorySubtitle && (
                                        <p className="text-xs opacity-60 line-clamp-1 mt-0.5">
                                            {categorySubtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {activeTab === 'list' && (
                                <div className="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity">
                                    <i className={`fa-solid ${isEn ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryList;
