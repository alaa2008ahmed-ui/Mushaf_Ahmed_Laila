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
            className={`fixed inset-0 z-[1300] bg-black/60 flex items-center justify-center ${isLandscape ? 'p-2' : 'p-3 sm:p-4'}`}
            onClick={onClose}
        >
            <div 
                dir={dir}
                className={`modal-skinned ${isLandscape ? 'w-[54%] max-w-[340px] max-h-[84%]' : 'w-[88%] max-w-[330px] max-h-[68dvh]'} rounded-3xl flex flex-col overflow-hidden border-0 ${p.isDark ? 'quran-3d-dark' : ''}`}
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
                <div className={isLandscape ? "p-2.5 pb-1.5 shrink-0" : "p-3.5 pb-2 shrink-0"}>
                    <div 
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between quran-raised-card border-0`}
                        style={{ backgroundColor: p.headerBg }}
                    >
                        <div className="flex items-center gap-2">
                            <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide`} style={{ color: p.headerAccent }}>
                                {isEn ? "Surah Header Design" : "تصميم رأس السورة"}
                            </span>
                            <span 
                                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
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
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} rounded-full flex items-center justify-center quran-raised-btn border-0 cursor-pointer`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>
                </div>

                {/* Modal Body: Scrollable list of designs */}
                <div 
                    ref={scrollContainerRef}
                    className={`flex-1 min-h-0 overflow-y-auto ${isLandscape ? 'p-2.5 pt-1.5 pb-3 space-y-2' : 'p-3.5 pt-2 pb-4 space-y-3'} scroll-smooth scrollbar-hide`}
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
                                className={`relative w-full ${isLandscape ? 'rounded-xl p-1.5' : 'rounded-2xl p-2'} text-right block overflow-hidden cursor-pointer border-0 ${
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
