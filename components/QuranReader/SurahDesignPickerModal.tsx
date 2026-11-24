import React, { useEffect, useRef, FC } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { resolveQuranModalPalette } from './modalThemeUtils';
import { getMadinahThemePalette } from './MadinahFrameSVG';
import {
    MADINAH_FRAME_DESIGNS,
    MadinahFrameMiniPreview,
    normalizeMadinahFrameDesign,
} from './madinahFrameDesigns';

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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeDesignRef = useRef<HTMLButtonElement>(null);
    const activeFrameId = normalizeMadinahFrameDesign(currentDesign);

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
    const framePalette = getMadinahThemePalette(currentTheme);

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
                                {isEn ? "Page Frame & Header Design" : "إطارات وزخارف ورأس الصفحة"}
                            </span>
                            <span 
                                className="text-[11px] px-2.5 py-0.5 rounded-full font-bold"
                                style={{ 
                                    backgroundColor: p.isDark ? 'rgba(255,255,255,0.14)' : `${p.headerAccent}22`,
                                    color: p.headerAccent
                                }}
                            >
                                {MADINAH_FRAME_DESIGNS.length}
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

                {/* Modal Body: Grid of unified frame & header designs */}
                <div 
                    ref={scrollContainerRef}
                    className={`flex-1 min-h-0 overflow-y-auto ${isLandscape ? 'p-3 pt-2 pb-3.5' : 'p-4 pt-2 pb-5'} scroll-smooth scrollbar-hide`}
                >
                    <div className={`grid ${isLandscape ? 'grid-cols-3 gap-2.5' : 'grid-cols-2 gap-3'}`}>
                        {MADINAH_FRAME_DESIGNS.map((designMeta) => {
                            const isSelected = activeFrameId === designMeta.id;
                            return (
                                <button
                                    key={designMeta.id}
                                    ref={isSelected ? activeDesignRef : null}
                                    type="button"
                                    onClick={() => {
                                        onSelectDesign(designMeta.id);
                                        onClose();
                                    }}
                                    className={`relative rounded-2xl p-2 flex flex-col items-center gap-2 transition-all cursor-pointer border-0 ${
                                        isSelected 
                                            ? 'quran-raised-card-selected ring-2 scale-[1.02]' 
                                            : 'quran-raised-btn opacity-90 hover:opacity-100'
                                    }`}
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        backgroundColor: isSelected ? p.headerBg : p.cardBg,
                                        ...(isSelected ? { '--tw-ring-color': p.headerAccent } as React.CSSProperties : {}),
                                    }}
                                    title={isEn ? designMeta.nameEn : designMeta.nameAr}
                                >
                                    <div className="pointer-events-none w-full relative">
                                        <MadinahFrameMiniPreview
                                            design={designMeta.id}
                                            palette={framePalette}
                                        />
                                        {isSelected && (
                                            <span
                                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow"
                                                style={{ backgroundColor: p.headerAccent, color: '#ffffff' }}
                                            >
                                                <i className="fa-solid fa-check"></i>
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold leading-tight truncate w-full text-center">
                                        {isEn ? designMeta.nameEn : designMeta.nameAr}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurahDesignPickerModal;
