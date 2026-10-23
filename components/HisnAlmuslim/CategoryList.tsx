import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { HISN_ALMUSLIM_CATEGORIES, HISN_ALMUSLIM_DATA } from '../../data/hisnAlmuslimData';
import { HISN_CATEGORIES_EN, HISN_ITEMS_EN } from '../../data/hisnAlmuslimTranslationsEn';
import { motion } from 'motion/react';

interface CategoryListProps {
    onSelectCategory: (category: any) => void;
    activeTab: 'grid' | 'list';
    searchQuery: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory, activeTab, searchQuery }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name === 'الافتراضي' || !!theme.isOriginal || !themeKey;
    const cardBorderColor = isBlackTheme ? '#222222' : (theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)');

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
            <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
                <i className="fa-solid fa-search text-4xl mb-3"></i>
                <p className="font-bold">
                    {isEn ? 'No categories found matching your search' : 'لا توجد أبواب تطابق بحثك'}
                </p>
            </div>
        );
    }

    return (
        <div className={activeTab === 'grid' ? "grid grid-cols-2 gap-3 p-2" : "space-y-3 p-2"} dir={isEn ? 'ltr' : 'rtl'}>
            {filteredCategories.map((category, index) => {
                const color = theme.palette[index % theme.palette.length];
                const enInfo = HISN_CATEGORIES_EN[category.id];
                const categoryTitle = isEn ? (enInfo?.title || category.title) : category.title;
                const categorySubtitle = isEn ? (enInfo?.subtitle || '') : '';
                
                return (
                    <div 
                        key={category.id} 
                        onClick={() => onSelectCategory({ ...category, title: categoryTitle, titleAr: category.title })}
                        className="relative group cursor-pointer active:scale-95 transition-transform"
                    >
                        <div 
                            className={`h-full p-3.5 rounded-2xl themed-card border shadow-sm hover:shadow-md transition-all flex ${activeTab === 'grid' ? 'flex-col items-center text-center gap-2' : 'items-center justify-between gap-4'} overflow-hidden`} 
                            style={{ 
                                borderColor: cardBorderColor, 
                                borderWidth: '1.5px', 
                                borderStyle: 'solid', 
                                color: 'var(--text-color)',
                                ...(activeTab === 'grid' ? {} : (isEn ? {
                                    borderLeftWidth: '4px',
                                    borderLeftColor: isDefaultTheme ? '#000000' : color
                                } : {
                                    borderRightWidth: '4px',
                                    borderRightColor: isDefaultTheme ? '#000000' : color
                                }))
                            }}
                        >
                            {/* Background hint */}
                            {themeKey !== 'default' && activeTab === 'grid' && (
                                <div 
                                    className={`absolute ${isEn ? '-left-4' : '-right-4'} -top-4 w-16 h-16 rounded-full opacity-10 blur-xl pointer-events-none`}
                                    style={{ backgroundColor: color }}
                                />
                            )}
                            
                            <div className={`flex ${activeTab === 'grid' ? 'flex-col items-center gap-2' : 'items-center gap-3.5'}`}>
                                <div 
                                    className={`${activeTab === 'grid' ? 'w-14 h-14 rounded-2xl' : 'w-12 h-12 rounded-xl'} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner`}
                                    style={{ 
                                        backgroundColor: themeKey === 'default' ? '#FFFFFF' : (color + '15'),
                                        color: themeKey === 'default' ? '#000000' : color,
                                        border: themeKey === 'default' ? '1px solid rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    <i className={`fa-solid ${category.icon || 'fa-book-open'} ${activeTab === 'grid' ? 'text-2xl' : 'text-xl'}`}></i>
                                </div>
                                
                                <div className={activeTab === 'grid' ? '' : (isEn ? 'text-left' : 'text-right')}>
                                    <h2 
                                        className={`font-bold text-sm sm:text-base leading-tight ${activeTab === 'grid' ? 'line-clamp-2' : ''} ${isEn ? 'font-sans' : ''}`} 
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        {categoryTitle}
                                    </h2>
                                    {activeTab === 'list' && categorySubtitle && (
                                        <p className="text-xs opacity-70 line-clamp-1 mt-0.5">
                                            {categorySubtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default CategoryList;
