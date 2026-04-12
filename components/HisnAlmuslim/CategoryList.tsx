import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { HISN_ALMUSLIM_CATEGORIES } from '../../data/hisnAlmuslimData';

interface CategoryListProps {
    onSelectCategory: (category: any) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
    const { theme } = useTheme();

    return (
        <div className="p-4 space-y-3">
            {HISN_ALMUSLIM_CATEGORIES.map((category, index) => {
                const colorType = index % 2 === 0 ? 'primary' : 'secondary';
                return (
                    <div key={category.id} onClick={() => onSelectCategory(category)}
                          className={`themed-card p-4 rounded-xl shadow-sm border-r-4 flex items-center justify-between cursor-pointer active:scale-95 transition`}
                          style={{ borderRightColor: colorType === 'primary' ? theme.palette[0] : theme.palette[1] }}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{backgroundColor: colorType === 'primary' ? theme.palette[0]+'20' : theme.palette[1]+'20', color: colorType === 'primary' ? theme.palette[0] : theme.palette[1]}}>
                                <i className={`fa-solid ${category.icon} text-xl`}></i>
                            </div>
                            <div>
                                <h2 className="font-bold text-base">{category.title}</h2>
                            </div>
                        </div>
                        <i className="fa-solid fa-angle-left themed-text-muted"></i>
                    </div>
                )
            })}
        </div>
    );
};

export default CategoryList;
