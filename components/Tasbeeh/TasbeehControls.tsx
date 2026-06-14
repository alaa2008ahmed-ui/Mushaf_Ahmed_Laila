import React from 'react';
import { Theme } from '../../context/themes';
import { motion } from 'motion/react';

interface TasbeehControlsProps {
    isBlackAndWhite: boolean;
    theme: Theme;
    secondaryTextColor: string;
    activePhrase: string;
    setModals: React.Dispatch<React.SetStateAction<any>>;
}

const TasbeehControls: React.FC<TasbeehControlsProps> = ({ isBlackAndWhite, theme, secondaryTextColor, activePhrase, setModals }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mt-2 space-y-2 mb-2 z-10 relative"
        >
            <motion.div whileTap={{ scale: 0.98 }} className="rounded-2xl themed-card shadow-lg border border-black/5 backdrop-blur-md bg-opacity-90">
                <button onClick={() => setModals((p: any) => ({...p, phrase: true}))} className="w-full py-3 px-4 rounded-2xl flex justify-between items-center text-lg font-bold transition-all duration-300 themed-bg-alt hover:opacity-80 active:scale-[0.98]">
                    <div className="flex flex-col items-start min-w-0 pr-2">
                        <div className="flex-grow flex justify-start w-full relative overflow-visible">
                            <span 
                                className="text-lg md:text-xl font-extrabold text-right font-amiri leading-normal w-full whitespace-normal break-words line-clamp-1" 
                                style={{color: isBlackAndWhite ? '#FFFFFF' : undefined}}
                            >
                                {activePhrase}
                            </span>
                        </div>
                    </div>
                </button>
            </motion.div>
            <div className="grid grid-cols-4 gap-2 h-16">
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => setModals((p: any) => ({...p, add: true}))} 
                    className="flex flex-col items-center justify-center py-1 px-1 font-bold rounded-xl themed-card text-[10px] sm:text-xs shadow-md transition-shadow hover:shadow-lg border border-black/5 h-full" 
                    style={{color: isBlackAndWhite ? '#FFF' : undefined, border: isBlackAndWhite ? '1px solid #FFF' : undefined}}
                 >
                     <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                     إضافة
                 </motion.button>
                 
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => setModals((p: any) => ({...p, delete: true}))} 
                    className="flex flex-col items-center justify-center py-1 px-1 font-bold rounded-xl themed-card text-[10px] sm:text-xs shadow-md transition-shadow hover:shadow-lg border border-black/5 h-full" 
                    style={{color: isBlackAndWhite ? '#FFF' : undefined, border: isBlackAndWhite ? '1px solid #FFF' : undefined}}
                 >
                     <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     حذف
                 </motion.button>
                 
                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => setModals((p: any) => ({...p, color: true}))} 
                    className="flex flex-col items-center justify-center py-1 px-1 font-bold rounded-xl themed-card text-[10px] sm:text-xs shadow-md transition-shadow hover:shadow-lg border border-black/5 h-full" 
                    style={{color: isBlackAndWhite ? '#FFF' : undefined, border: isBlackAndWhite ? '1px solid #FFF' : undefined}}
                 >
                     <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                     لون العداد
                 </motion.button>

                 <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => setModals((p: any) => ({...p, skins: true}))} 
                    className="flex flex-col items-center justify-center py-1 px-1 font-bold rounded-xl themed-card text-[10px] sm:text-xs shadow-md transition-shadow hover:shadow-lg border border-black/5 h-full" 
                    style={{color: isBlackAndWhite ? '#FFF' : undefined, border: isBlackAndWhite ? '1px solid #FFF' : undefined}}
                 >
                     <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                     شكل العداد
                 </motion.button>

            </div>
         </motion.div>
    );
};

export default TasbeehControls;
