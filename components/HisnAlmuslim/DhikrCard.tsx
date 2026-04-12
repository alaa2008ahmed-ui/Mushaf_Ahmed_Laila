import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface DhikrCardProps {
    dhikr: {
        text: string;
        count: number;
        source?: string;
    };
    currentCount: number;
    isFinished: boolean;
    onDecrement: () => void;
    onZoom: () => void;
}

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const DhikrCard: React.FC<DhikrCardProps> = ({ dhikr, currentCount, isFinished, onDecrement, onZoom }) => {
    const { theme } = useTheme();

    return (
        <div 
            className={`themed-card p-5 pb-0 rounded-2xl border relative overflow-hidden group transition-all duration-300 ${isFinished ? 'opacity-60' : 'cursor-pointer'}`} 
            onClick={onDecrement}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold shadow-sm" style={{backgroundColor: theme.palette[1]+'30', color: theme.palette[1]}}>
                    {dhikr.count > 1 ? `يُقرأ ${toArabicNumerals(dhikr.count)} مرات` : 'يُقرأ مرة واحدة'}
                </span>
                <div className={`count-badge w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md transform transition-transform`} style={isFinished ? {backgroundColor: 'var(--badge-finished-bg)', color: 'var(--badge-finished-text)'} : {backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.textColor}}>
                    {isFinished ? <i className="fa-solid fa-check"></i> : toArabicNumerals(currentCount)}
                </div>
            </div>

            <p className="text-lg leading-relaxed text-center font-amiri select-none">
                {dhikr.text}
            </p>
            
            {dhikr.source && <p className="text-xs mt-2 text-center themed-text-muted opacity-80 font-cairo">{dhikr.source}</p>}
            <div className="flex justify-center">
                <button onClick={(e) => { e.stopPropagation(); onZoom(); }} className="p-1 rounded-full hover:bg-card-bg-hover transition-colors">
                    <i className="fa-solid fa-magnifying-glass-plus text-lg"></i>
                </button>
            </div>
            
            {!isFinished && <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition pointer-events-none" style={{backgroundColor: theme.palette[0]+'15'}}></div>}
        </div>
    );
};

export default DhikrCard;
