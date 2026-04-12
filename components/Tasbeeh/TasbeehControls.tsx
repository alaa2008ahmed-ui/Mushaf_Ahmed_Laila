import React from 'react';
import { Theme } from '../../context/themes';

interface TasbeehControlsProps {
    isBlackAndWhite: boolean;
    theme: Theme;
    secondaryTextColor: string;
    activePhrase: string;
    setModals: React.Dispatch<React.SetStateAction<any>>;
}

const TasbeehControls: React.FC<TasbeehControlsProps> = ({ isBlackAndWhite, theme, secondaryTextColor, activePhrase, setModals }) => {
    return (
        <div className="w-full max-w-lg mt-2 space-y-3 mb-2">
            <div className="rounded-xl themed-card p-2">
                <button onClick={() => setModals((p: any) => ({...p, phrase: true}))} className="w-full py-3 px-4 rounded-xl flex justify-between items-center text-lg font-bold transition themed-bg-alt hover:opacity-80">
                    <span className="text-sm flex-shrink-0 ml-2" style={{color: secondaryTextColor}}>الذكر الحالي:</span>
                    <span className="flex-grow text-xl font-extrabold text-center font-amiri truncate" style={{color: isBlackAndWhite ? '#FFFFFF' : undefined}}>{activePhrase}</span>
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{color: secondaryTextColor}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>
            {/* FIX: Changed grid to 3 columns and added a button to open the color picker modal. */}
            <div className="grid grid-cols-3 gap-3">
                 <button onClick={() => setModals((p: any) => ({...p, add: true}))} className="py-2.5 px-2 font-bold rounded-full text-white text-xs sm:text-sm" style={{backgroundColor: isBlackAndWhite ? '#333' : theme.palette[0], color: '#FFF', border: isBlackAndWhite ? '1px solid #FFF' : 'none'}}>إضافة ذكر</button>
                 <button onClick={() => setModals((p: any) => ({...p, delete: true}))} className="py-2.5 px-2 font-bold rounded-full themed-card text-xs sm:text-sm" style={{color: isBlackAndWhite ? '#FFF' : undefined, border: isBlackAndWhite ? '1px solid #FFF' : 'none'}}>حذف ذكر</button>
                 <button onClick={() => setModals((p: any) => ({...p, color: true}))} className="py-2.5 px-2 font-bold rounded-full text-white text-xs sm:text-sm" style={{backgroundColor: isBlackAndWhite ? '#333' : (theme.palette[1] || theme.palette[0]), color: '#FFF', border: isBlackAndWhite ? '1px solid #FFF' : 'none'}}>لون العداد</button>
            </div>
         </div>
    );
};

export default TasbeehControls;
