import React from 'react';
import { Theme } from '../../context/themes';
import { useLanguage } from '../../context/LanguageContext';
import { tTasbeeh, getPhraseDisplay } from '../../utils/tasbeehTranslations';
import { motion } from 'motion/react';

interface TasbeehControlsProps {
    isBlackAndWhite: boolean;
    theme: Theme;
    secondaryTextColor: string;
    activePhrase: string;
    setModals: React.Dispatch<React.SetStateAction<any>>;
    cardBorderColor?: string;
}

const TasbeehControls: React.FC<TasbeehControlsProps> = ({ 
    theme, 
    activePhrase, 
    setModals
}) => {
    const { language } = useLanguage();
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const textColor = isBlackTheme ? '#FFFFFF' : '#334155';
    const displayPhrase = getPhraseDisplay(activePhrase, language);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-lg mt-2 space-y-3 mb-3 z-10 relative"
        >
            {/* Active Dhikr Card - Elevated 3D Card matching AthkarAlSalah */}
            <button 
                type="button"
                onClick={() => setModals((p: any) => ({...p, phrase: true}))} 
                className="app-page-card border-0 w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-[#1E293B] flex justify-between items-center text-lg font-bold transition-all cursor-pointer"
                title={language === 'ar' ? 'انقر لتغيير الذكر' : 'Tap to change dhikr'}
            >
<<<<<<< HEAD
                <div className="flex items-center justify-between min-w-0 w-full gap-3">
                    <div className="flex-grow flex flex-col justify-start text-start min-w-0">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-400 mb-0.5">
                            {language === 'ar' ? 'الذكر الحالي' : 'Current Dhikr'}
                        </span>
                        <span 
                            className="text-base sm:text-lg md:text-xl font-black text-start leading-snug w-full truncate" 
                            style={{ color: primaryColor }}
                        >
                            {displayPhrase || (language === 'ar' ? 'سبحان الله' : 'Subhan Allah')}
                        </span>
=======
                <button 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, phrase: true}))} 
                    className="w-full py-3.5 px-4 rounded-2xl flex justify-between items-center text-lg font-bold transition-all duration-300 hover:opacity-90 active:scale-[0.99] cursor-pointer"
                    title={language === 'ar' ? 'انقر لتغيير الذكر' : 'Tap to change dhikr'}
                >
                    <div className="flex items-center justify-between min-w-0 w-full gap-3">
                        <div className="flex-grow flex flex-col justify-start text-start min-w-0">
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-400 mb-0.5">
                                {language === 'ar' ? 'الذكر الحالي' : 'Current Dhikr'}
                            </span>
                            <span 
                                className="text-base sm:text-lg md:text-xl font-black text-start leading-snug w-full truncate" 
                                style={{ color: primaryColor }}
                            >
                                {displayPhrase || (language === 'ar' ? 'سبحان الله' : 'Subhan Allah')}
                            </span>
                        </div>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    </div>
                </div>
            </button>

<<<<<<< HEAD
            {/* Quick Action Buttons Grid - Elevated 3D Cards matching AthkarAlSalah */}
=======
            {/* Quick Action Buttons Grid - Pure White Cards with Soft Drop Shadow & Zero Hard Borders */}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
            <div className="grid grid-cols-4 gap-2.5 h-12">
                 {/* 1. Add Dhikr */}
                 <button 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, add: true}))} 
<<<<<<< HEAD
                    className="app-page-card border-0 flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm h-full transition-all cursor-pointer group" 
=======
                    className="flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    style={{ color: textColor }}
                 >
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('addBtn', language)}
                     </span>
                 </button>
                 
                 {/* 2. Delete Dhikr */}
                 <button 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, delete: true}))} 
<<<<<<< HEAD
                    className="app-page-card border-0 flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm h-full transition-all cursor-pointer group" 
=======
                    className="flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    style={{ color: textColor }}
                 >
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('deleteBtn', language)}
                     </span>
                 </button>
                 
                 {/* 3. Color Picker */}
                 <button 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, color: true}))} 
<<<<<<< HEAD
                    className="app-page-card border-0 flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm h-full transition-all cursor-pointer group" 
=======
                    className="flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    style={{ color: textColor }}
                 >
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('colorBtn', language)}
                     </span>
                 </button>

                 {/* 4. Skin / Style Picker */}
                 <button 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, skins: true}))} 
<<<<<<< HEAD
                    className="app-page-card border-0 flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm h-full transition-all cursor-pointer group" 
=======
                    className="flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    style={{ color: textColor }}
                 >
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('skinBtn', language)}
                     </span>
<<<<<<< HEAD
                 </button>
=======
                 </motion.button>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
            </div>
         </motion.div>
    );
};

export default TasbeehControls;
