import React from 'react';
import { toArabicNumerals } from '../../utils/tasbeehUtils';

interface TasbeehCounterProps {
    isCountingStopped: boolean;
    target: number;
    secondaryTextColor: string;
    primaryTextColor: string;
    counterColor: string;
    count: number;
    handleIncrement: () => void;
}

const TasbeehCounter: React.FC<TasbeehCounterProps> = ({ isCountingStopped, target, secondaryTextColor, primaryTextColor, counterColor, count, handleIncrement }) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center w-full max-w-lg space-y-4 py-2">
            <div className="text-center px-6 py-3 rounded-2xl themed-card w-full max-w-xs">
                <span className="block text-sm font-bold mb-1" style={{color: secondaryTextColor}}>{isCountingStopped && target > 0 ? 'تم الوصول للهدف! 🎉' : 'الهدف:'}</span>
                <span className="text-3xl font-extrabold font-amiri" style={{color: primaryTextColor}}>{toArabicNumerals(target > 0 ? target : 'مفتوح')}</span>
            </div>
            {/* FIX: Applied the selected background color to the counter button and set text color to white for contrast. */}
            <button onClick={handleIncrement} className={`tasbeeh-counter w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none relative z-10`} style={{ backgroundColor: counterColor }}>
                <span className="text-9xl font-mono font-black" style={{ fontFamily: 'Amiri', textShadow: '0 4px 8px rgba(0,0,0,0.2)', color: 'white' }}>
                    {toArabicNumerals(count)}
                </span>
                <span className="text-lg font-bold mt-2" style={{color: 'white', opacity: 0.8}}>
                    {isCountingStopped ? 'قم بالتصفير للبدء' : 'اضغط للعد'}
                </span>
            </button>
        </div>
    );
};

export default TasbeehCounter;
