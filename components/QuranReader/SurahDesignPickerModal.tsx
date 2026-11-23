import React, { useEffect, useRef, FC } from 'react';
import { X } from 'lucide-react';
import SurahHeader from './SurahHeader';
import { useLanguage } from '../../context/LanguageContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { resolveQuranModalPalette } from './modalThemeUtils';

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

    useEffect(() => {
        if (!isOpen) return;
        const interceptor = () => {
            onClose();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const p = resolveQuranModalPalette(currentTheme);

    return (
        <div 
            className={`fixed inset-0 z-[1300] bg-black/60 flex items-center justify-center ${isLandscape ? 'p-1.5' : 'p-2 sm:p-3'}`}
            onClick={onClose}
        >
            <div 
                dir={dir}
                className={`modal-skinned ${isLandscape ? 'w-[76%] max-w-[476px] max-h-[95dvh]' : 'w-[95%] max-w-[462px] max-h-[95dvh]'} rounded-3xl flex flex-col overflow-hidden border-0 ${p.isDark ? 'quran-3d-dark' : ''}`}
                style={{ 
                    fontFamily: p.fontFamily,
                    backgroundColor: p.modalBg,
                    color: p.modalText,
                    border: 'none',
                    outline: 'none'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Canonical Raised Header */}
                <div className={isLandscape ? "p-3 pb-2 shrink-0" : "p-4 pb-2.5 shrink-0"}>
                    <div 
                        className={`${isLandscape ? 'py-2 px-3.5 rounded-xl' : 'py-3 px-4 rounded-2xl'} flex items-center justify-between quran-raised-card border-0`}
                        style={{ backgroundColor: p.headerBg }}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className={`${isLandscape ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-black tracking-wide`} style={{ color: p.headerAccent }}>
                                {isEn ? "Surah Header Design" : "تصميم رأس السورة"}
                            </span>
                            <span 
                                className="text-[11px] px-2.5 py-0.5 rounded-full font-bold"
                                style={{ 
                                    backgroundColor: p.isDark ? 'rgba(255,255,255,0.14)' : `${p.headerAccent}22`,
                                    color: p.headerAccent
                                }}
                            >
                                {isEn ? `${designs.length}` : `${designs.length}`}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${isLandscape ? 'w-8 h-8' : 'w-9 h-9'} rounded-full flex items-center justify-center quran-raised-btn border-0 cursor-pointer`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={isLandscape ? 16 : 18} />
                        </button>
                    </div>
                </div>

                {/* Modal Body: Scrollable list of designs */}
                <div 
                    ref={scrollContainerRef}
                    className={`flex-1 min-h-0 overflow-y-auto ${isLandscape ? 'p-3 pt-2 pb-3.5 space-y-2.5' : 'p-4 pt-2 pb-5 space-y-3.5'} scroll-smooth scrollbar-hide`}
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
                                className={`relative w-full ${isLandscape ? 'rounded-xl p-2' : 'rounded-2xl p-2.5'} text-right block overflow-hidden cursor-pointer border-0 ${
                                    isSelected 
                                        ? 'quran-raised-card-selected scale-[1.01]' 
                                        : 'quran-raised-btn'
                                }`}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: isSelected ? p.headerBg : p.cardBg
                                }}
                            >
                                {/* Clean header preview */}
                                <div className="pointer-events-none w-full">
                                    <SurahHeader
                                        surahNumber={1}
                                        surahName="الفاتحة"
                                        surahType="مكية"
                                        ayahCount={7}
                                        currentTheme={currentTheme}
                                        design={d}
                                        compact={false}
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
