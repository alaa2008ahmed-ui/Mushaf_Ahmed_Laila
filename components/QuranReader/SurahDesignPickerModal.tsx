import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import SurahHeader from './SurahHeader';

interface SurahDesignPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDesign: number;
    onSelectDesign: (design: number) => void;
    currentTheme: any;
    isLandscape?: boolean;
}

const SurahDesignPickerModal: React.FC<SurahDesignPickerModalProps> = ({
    isOpen,
    onClose,
    currentDesign,
    onSelectDesign,
    currentTheme,
    isLandscape
}) => {
    const designs = [1, 2, 3, 4, 7, 9, 10, 11, 14, 15, 16, 19, 20];
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeDesignRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && activeDesignRef.current) {
            // Small delay to ensure modal animation is underway
            setTimeout(() => {
                activeDesignRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={`fixed inset-0 z-[1200] flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'}`}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`relative w-full ${isLandscape ? 'max-w-2xl max-h-[90vh] rounded-2xl' : 'max-w-2xl max-h-[80vh] rounded-2xl'} overflow-hidden shadow-2xl flex flex-col`}
                        style={{ backgroundColor: currentTheme.bg, border: `1px solid ${currentTheme.barBorder}` }}
                    >
                        <div 
                            ref={scrollContainerRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                        >
                            {designs.map((d, index) => (
                                <div
                                    key={d}
                                    ref={currentDesign === d ? activeDesignRef : null}
                                    onClick={() => {
                                        onSelectDesign(d);
                                        onClose();
                                    }}
                                    className={`cursor-pointer rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] ${
                                        currentDesign === d ? 'ring-4 ring-offset-2' : ''
                                    }`}
                                    style={{ 
                                        ringColor: currentTheme.accent,
                                        backgroundColor: currentTheme.cardBg,
                                        borderColor: currentTheme.barBorder,
                                        borderWidth: '1px'
                                    }}
                                >
                                    <div className="pointer-events-none w-full">
                                        <SurahHeader
                                            surahNumber={1}
                                            surahName="الفاتحة"
                                            surahType="مكية"
                                            ayahCount={7}
                                            currentTheme={currentTheme}
                                            design={d}
                                            compact={true}
                                        />
                                    </div>
                                    <div className="text-center pb-2 font-bold opacity-60" style={{ color: currentTheme.text }}>
                                        تصميم {index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SurahDesignPickerModal;
