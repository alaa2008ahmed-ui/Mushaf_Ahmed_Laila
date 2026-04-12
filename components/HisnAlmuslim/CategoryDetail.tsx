import React from 'react';
import { HISN_ALMUSLIM_DATA } from '../../data/hisnAlmuslimData';

interface CategoryDetailProps {
    selectedCategory: any;
    onZoom: (item: any) => void;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({ selectedCategory, onZoom }) => {
    if (!selectedCategory) return null;
    const items = HISN_ALMUSLIM_DATA[selectedCategory.id] || [];

    return (
        <div className="space-y-4 fade-in">
            {items.map((item: any, index: number) => (
                <div key={index} className="themed-card p-5 pb-2 rounded-2xl border relative overflow-hidden group mb-4 transition-all duration-300">
                    <div className="flex justify-between items-center mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold`} style={{ 
                            backgroundColor: item.type === 'ayah' ? '#dbeafe' : item.type === 'hadith' ? '#fef3c7' : '#dcfce7',
                            color: item.type === 'ayah' ? '#1e40af' : item.type === 'hadith' ? '#92400e' : '#166534'
                        }}>
                            {item.type === 'ayah' ? 'آية كريمة' : item.type === 'hadith' ? 'حديث نبوي' : 'دعاء / ذكر'}
                        </span>
                        {item.title && <h3 className="text-sm font-bold opacity-80">{item.title}</h3>}
                    </div>
                    <p className="text-xl leading-relaxed text-center font-amiri select-none">{item.text}</p>
                    {item.source && <p className="text-xs mt-3 text-center themed-text-muted opacity-80">المصدر: {item.source}</p>}
                    <div className="flex justify-center mt-3">
                        <button onClick={() => onZoom(item)} className="p-2 rounded-full hover:bg-card-bg-hover transition-colors">
                            <i className="fa-solid fa-magnifying-glass-plus text-lg"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CategoryDetail;
