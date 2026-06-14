
import React, { useState, useEffect } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import { asmaulHusna, AsmaulHusnaItem } from '../data/asmaulHusnaData';
import { X, Info, Book } from 'lucide-react';

const AsmaulHusna: React.FC<{ onBack: () => void, onNavigate: (id: string, params?: any) => void; }> = ({ onBack, onNavigate }) => {
    const [selectedName, setSelectedName] = useState<AsmaulHusnaItem | null>(null);

    const handleHomeClick = () => {
        if (selectedName) {
            setSelectedName(null);
        } else {
            onBack();
        }
    };

    useEffect(() => {
        const interceptor = () => {
            if (selectedName) {
                setSelectedName(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedName]);

    const renderEvidence = (evidence: string) => {
        const match = evidence.match(/(.*)(\(.*\))/);
        if (match) {
            const text = match[1];
            const ref = match[2];
            return (
                <>
                    {text}
                    <span className="text-secondary font-bold mr-2 inline-block" style={{ color: 'var(--color-brand-purple)' }}>
                        {ref}
                    </span>
                </>
            );
        }
        return evidence;
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden relative bg-transparent">
            <header className="app-top-bar z-20">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            أسماء الله الحسنى
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle text-xs">٩٩ اسماً من أحصاها دخل الجنة</p>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col px-4 z-10">
                <div className="flex-1 overflow-y-auto hide-scrollbar pt-0 pb-48">
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2.5 max-w-5xl mx-auto">
                        {asmaulHusna.map((item) => (
                            <motion.button
                                key={item.id}
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedName(item)}
                                className="relative themed-card rounded-xl sm:rounded-2xl p-1.5 sm:p-3 flex flex-col items-center justify-center text-center aspect-square group border border-black/5 shadow-sm transition-all duration-300 overflow-hidden"
                            >
                                {/* ID Badge */}
                                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-4 sm:w-6 h-4 sm:h-6 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[8px] font-bold opacity-60">
                                    {item.id}
                                </div>
                                
                                <div className="flex flex-col items-center justify-center flex-1 w-full">
                                    <h3 className="text-lg sm:text-2xl font-bold font-quran leading-none group-hover:scale-110 transition-transform duration-300" style={{ color: 'var(--text-color)' }}>
                                        {item.name}
                                    </h3>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {selectedName && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setSelectedName(null)}
                    >
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="themed-card w-[92vw] sm:w-[450px] p-6 sm:p-8 overflow-hidden relative rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 flex flex-col gap-6 sm:gap-7 max-h-[85vh]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="flex justify-end items-start w-full relative z-10" dir="ltr">
                                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary font-bold text-sm sm:text-base border border-primary/20">
                                        {selectedName.id}
                                    </div>
                                </div>

                                {/* Title Section */}
                                <div className="flex flex-col items-center justify-center text-center mt-[-45px] sm:mt-[-55px] relative z-10">
                                    <h2 className="text-4xl sm:text-5xl font-bold font-quran text-primary drop-shadow-sm">
                                        {selectedName.name}
                                    </h2>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-6 sm:gap-7 overflow-y-auto hide-scrollbar pb-2 relative z-10" dir="rtl">
                                    {/* Meaning */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 opacity-80 text-primary">
                                            <div className="p-1.5 rounded-lg bg-primary/10"><Info className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                                            <span className="text-sm sm:text-base font-bold font-kufi">شرح الاسم ومعناه</span>
                                        </div>
                                        <div className="bg-black/5 dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-black/5 dark:border-white/5">
                                            <p className="text-[17px] sm:text-[19px] leading-[1.8] font-hafs text-justify opacity-90 text-primary">
                                                {selectedName.meaning}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Evidence */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 opacity-80 text-primary">
                                            <div className="p-1.5 rounded-lg bg-primary/10"><Book className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                                            <span className="text-sm sm:text-base font-bold font-kufi">الدليل الشرعي</span>
                                        </div>
                                        <div className="relative bg-primary/5 p-4 sm:p-5 rounded-2xl border border-primary/10">
                                            <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-primary/40 rounded-r-2xl" />
                                            <p className="text-[16px] sm:text-[18px] leading-[1.8] font-hafs text-justify opacity-80 pr-2 text-primary">
                                                {renderEvidence(selectedName.evidence)}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setSelectedName(null)}
                                        className="w-full py-4 rounded-2xl bg-primary text-white text-lg sm:text-xl font-bold font-kufi shadow-xl shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all mt-2"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default AsmaulHusna;
