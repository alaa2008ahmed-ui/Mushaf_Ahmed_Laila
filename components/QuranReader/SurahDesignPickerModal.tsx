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
            className="fixed inset-0 z-[1300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                dir={dir}
                className={`modal-skinned w-full ${isLandscape ? 'max-w-xl max-h-[90vh]' : 'max-w-md sm:max-w-lg max-h-[82vh]'} rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-enter border-0`}
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
                    className="p-3.5 px-4 flex items-center justify-between shrink-0"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold" style={{ color: currentTheme?.text || '#1f2937' }}>
                            {isEn ? "Surah Header Design" : "تصميم رأس السورة"}
                        </span>
                        <span 
                            className="text-[11px] px-2.5 py-0.5 rounded-full font-bold quran-raised-btn"
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
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all quran-raised-btn"
                        style={{ color: currentTheme?.text || '#1f2937' }}
                        title={isEn ? "Close" : "إغلاق"}
                    >
                        <X size={18} className="quran-3d-icon" />
                    </button>
                </div>

                {/* Modal Body: Scrollable list of designs (without any name or model text) */}
                <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scroll-smooth scrollbar-hide"
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
                                className={`relative w-full rounded-2xl transition-all duration-200 p-2 text-right block overflow-hidden cursor-pointer ${
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
                                        className="absolute top-3 start-3 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md text-white animate-scaleIn quran-raised-btn-selected"
                                        style={{ backgroundColor: currentTheme?.accent || 'var(--qr-accent, #10b981)' }}
                                    >
                                        <Check size={14} className="stroke-[3] quran-3d-icon" />
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
