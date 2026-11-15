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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mt-2 space-y-2.5 mb-2 z-10 relative"
        >
            {/* Active Dhikr Card - Borderless Pure White with Soft Drop Shadow */}
            <motion.div 
                whileTap={{ scale: 0.98 }} 
                className="rounded-2xl bg-white dark:bg-[#1E293B] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)] border border-slate-100/80 dark:border-white/5 transition-all overflow-hidden"
            >
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
                    </div>
                </button>
            </motion.div>

            {/* Quick Action Buttons Grid - Pure White Cards with Soft Drop Shadow & Zero Hard Borders */}
            <div className="grid grid-cols-4 gap-2.5 h-12">
                 {/* 1. Add Dhikr */}
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, add: true}))} 
                    className="flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
                    style={{ color: textColor }}
                 >
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('addBtn', language)}
                     </span>
                 </motion.button>
                 
                 {/* 2. Delete Dhikr */}
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, delete: true}))} 
                    className="flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
                    style={{ color: textColor }}
                 >
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('deleteBtn', language)}
                     </span>
                 </motion.button>
                 
                 {/* 3. Color Picker */}
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, color: true}))} 
                    className="flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
                    style={{ color: textColor }}
                 >
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('colorBtn', language)}
                     </span>
                 </motion.button>

                 {/* 4. Skin / Style Picker */}
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, skins: true}))} 
                    className="flex items-center justify-center py-2 px-1.5 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-xs sm:text-sm shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
                    style={{ color: textColor }}
                 >
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('skinBtn', language)}
                     </span>
                 </motion.button>
            </div>
         </motion.div>
    );
};

export default TasbeehControls;
