
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
                    <p className="app-top-bar__subtitle text-xs">٩٩ اسمًا من أحصاها دخل الجنة</p>
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
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-hidden relative border border-white/20 text-right"
                            onClick={(e) => e.stopPropagation()}
                            dir="rtl"
                        >
                            <button 
                                onClick={() => setSelectedName(null)}
                                className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <X className="w-5 h-5 opacity-60" />
                            </button>

                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
                                    <span className="text-amber-500 font-bold text-lg">#{selectedName.id}</span>
                                </div>
                                <h2 className="text-4xl font-bold font-quran mb-1" style={{ color: 'var(--color-brand-purple)' }}>
                                    {selectedName.name}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold opacity-60">
                                        <Info className="w-4 h-4" />
                                        <span>المعنى والدلالة</span>
                                    </div>
                                    <p className="text-base leading-relaxed font-cairo">
                                        {selectedName.meaning}
                                    </p>
                                </div>

                                {selectedName.evidence && (
                                    <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                                            <Book className="w-4 h-4" />
                                            <span>الدليل من القرآن والسنة</span>
                                        </div>
                                        <p className="text-sm font-amiri leading-loose">
                                            {renderEvidence(selectedName.evidence)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedName(null)}
                                className="w-full mt-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                                إغلاق
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default AsmaulHusna;
