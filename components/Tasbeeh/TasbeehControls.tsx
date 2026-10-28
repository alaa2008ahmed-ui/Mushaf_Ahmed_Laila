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
                        <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-transform group-hover:scale-105"
                            style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                        >
                            <i className="fa-solid fa-repeat"></i>
                        </div>
                    </div>
                </button>
            </motion.div>

            {/* Quick Action Buttons Grid - Pure White Cards with Soft Drop Shadow & Zero Hard Borders */}
            <div className="grid grid-cols-5 gap-2 h-16">
                 {/* 1. Add Dhikr */}
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, add: true}))} 
                    className="flex flex-col items-center justify-center py-1.5 px-1 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-[10px] sm:text-xs shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
                    style={{ color: textColor }}
                 >
                     <div 
                         className="w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-transform group-hover:scale-110"
                         style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                     >
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M12 4v16m8-8H4" />
                         </svg>
                     </div>
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('addBtn', language)}
                     </span>
                 </motion.button>
                 
                 {/* 2. Delete Dhikr */}
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, delete: true}))} 
                    className="flex flex-col items-center justify-center py-1.5 px-1 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-[10px] sm:text-xs shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
                    style={{ color: textColor }}
                 >
                     <div 
                         className="w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-transform group-hover:scale-110"
                         style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                     >
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                     </div>
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('deleteBtn', language)}
                     </span>
                 </motion.button>
                 
                 {/* 3. Color Picker */}
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, color: true}))} 
                    className="flex flex-col items-center justify-center py-1.5 px-1 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-[10px] sm:text-xs shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
                    style={{ color: textColor }}
                 >
                     <div 
                         className="w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-transform group-hover:scale-110"
                         style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                     >
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                         </svg>
                     </div>
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('colorBtn', language)}
                     </span>
                 </motion.button>

                 {/* 4. Skin / Style Picker */}
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, skins: true}))} 
                    className="flex flex-col items-center justify-center py-1.5 px-1 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-[10px] sm:text-xs shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
                    style={{ color: textColor }}
                 >
                     <div 
                         className="w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-transform group-hover:scale-110"
                         style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                     >
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                         </svg>
                     </div>
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('skinBtn', language)}
                     </span>
                 </motion.button>

                 {/* 5. Chart Modal Trigger */}
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={() => setModals((p: any) => ({...p, stats: true}))} 
                    className="flex flex-col items-center justify-center py-1.5 px-1 font-bold rounded-2xl bg-white dark:bg-[#1E293B] text-[10px] sm:text-xs shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-md border border-slate-100/80 dark:border-white/5 h-full transition-all cursor-pointer group active:scale-95" 
                    style={{ color: textColor }}
                    title={tTasbeeh('chartCardTitle', language)}
                 >
                     <div 
                         className="w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-transform group-hover:scale-110"
                         style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                     >
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                         </svg>
                     </div>
                     <span className="truncate max-w-full font-bold">
                         {tTasbeeh('chartBtn', language)}
                     </span>
                 </motion.button>
            </div>
         </motion.div>
    );
};

export default TasbeehControls;
