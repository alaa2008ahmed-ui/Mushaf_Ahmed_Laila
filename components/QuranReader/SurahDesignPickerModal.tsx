import React, { useEffect, useRef, FC } from 'react';
import { X, Check } from 'lucide-react';
import SurahHeader from './SurahHeader';
import { useLanguage } from '../../context/LanguageContext';

interface SurahDesignPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDesign: number;
    onSelectDesign: (design: number) => void;
    currentTheme: any;
    isLandscape?: boolean;
}

const SurahDesignPickerModal: FC<SurahDesignPickerModalProps> = ({
    isOpen,
    onClose,
    currentDesign,
    onSelectDesign,
    currentTheme,
    isLandscape = false
}) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    const designs = [1, 2, 3, 4, 7, 9, 10, 11, 14, 15, 16, 19, 20];
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeDesignRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                activeDesignRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[1300] bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                dir={dir}
                className={`modal-skinned w-[86%] max-w-[320px] ${isLandscape ? 'max-h-[70vh]' : 'max-h-[50vh]'} rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-enter border-0`}
                style={{ 
                    backgroundColor: currentTheme?.modalBg || currentTheme?.bg || '#ffffff',
                    color: currentTheme?.modalText || currentTheme?.text || '#1f2937',
                    border: 'none',
                    outline: 'none'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div 
                    className="p-2.5 px-3.5 flex items-center justify-between shrink-0 border-b border-black/5 dark:border-white/5"
                >
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold" style={{ color: currentTheme?.text || '#1f2937' }}>
                            {isEn ? "Surah Header Design" : "تصميم رأس السورة"}
                        </span>
                        <span 
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold quran-raised-btn"
                            style={{ 
                                color: currentTheme?.accent || '#10b981'
                            }}
                        >
                            {isEn ? `${designs.length} designs` : `${designs.length} تصميماً`}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all quran-raised-btn"
                        style={{ color: currentTheme?.text || '#1f2937' }}
                        title={isEn ? "Close" : "إغلاق"}
                    >
                        <X size={15} className="quran-3d-icon" />
                    </button>
                </div>

                {/* Modal Body: Scrollable list of designs (without any name or model text) */}
                <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scroll-smooth scrollbar-hide"
                >
                    {designs.map((d) => {
                        const isSelected = currentDesign === d;
                        return (
                            <button
                                key={d}
                                ref={isSelected ? activeDesignRef : null}
                                type="button"
                                onClick={() => {
                                    onSelectDesign(d);
                                    onClose();
                                }}
                                className={`relative w-full rounded-2xl transition-all duration-200 p-1.5 text-right block overflow-hidden cursor-pointer ${
                                    isSelected 
                                        ? 'quran-raised-btn-selected shadow-lg scale-[1.01]' 
                                        : 'quran-raised-card hover:scale-[1.01]'
                                }`}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: isSelected 
                                        ? 'color-mix(in srgb, var(--qr-accent, #10b981) 15%, transparent)' 
                                        : (currentTheme?.cardBg || 'rgba(255,255,255,0.03)')
                                }}
                            >
                                {/* Selected Active Badge */}
                                {isSelected && (
                                    <div 
                                        className="absolute top-2 start-2 z-20 w-5 h-5 rounded-full flex items-center justify-center shadow-md text-white animate-scaleIn quran-raised-btn-selected"
                                        style={{ backgroundColor: currentTheme?.accent || 'var(--qr-accent, #10b981)' }}
                                    >
                                        <Check size={12} className="stroke-[3] quran-3d-icon" />
                                    </div>
                                )}

                                {/* Clean header preview with NO model name / number text */}
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
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SurahDesignPickerModal;
