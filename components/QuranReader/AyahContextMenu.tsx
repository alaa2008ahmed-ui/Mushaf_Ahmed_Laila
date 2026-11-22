import React from 'react';
import { Type, Palette, Highlighter, X, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { resolveQuranModalPalette } from './modalThemeUtils';

interface AyahContextMenuProps {
    isOpen: boolean;
    tempSettings: any;
    ayahContextColorField: 'textColor' | 'bgColor' | 'highlightTextColor' | null;
    setAyahContextColorField: (field: 'textColor' | 'bgColor' | 'highlightTextColor' | null) => void;
    setAyahContextMenu: React.Dispatch<React.SetStateAction<any>>;
    onTempSettingsChange?: (newSettings: any, fieldChanged?: 'textColor' | 'bgColor' | 'highlightTextColor') => void;
    renderCheckerboard: (color: string) => React.CSSProperties;
    PREDEFINED_COLORS: string[];
    currentTheme: any;
    isLandscape?: boolean;
}

const AyahContextMenu: React.FC<AyahContextMenuProps> = ({
    isOpen,
    tempSettings,
    ayahContextColorField,
    setAyahContextColorField,
    setAyahContextMenu,
    onTempSettingsChange,
    renderCheckerboard,
    PREDEFINED_COLORS,
    currentTheme,
    isLandscape
}) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    if (!isOpen) return null;

    const p = resolveQuranModalPalette(currentTheme);

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/55 flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'}`} onClick={() => {
            setAyahContextMenu((prev: any) => ({...prev, isOpen: false}));
        }}>
            <div 
                dir={dir}
                className={`ayah-context-menu modal-skinned madinah-enlarged-popup ${isLandscape ? 'w-[54%] max-w-[330px] max-h-[85%]' : 'w-full max-w-[325px] max-h-[78dvh]'} rounded-3xl flex flex-col pointer-events-auto overflow-hidden border-0 ${p.isDark ? 'quran-3d-dark' : ''}`} 
                style={{ 
                    fontFamily: p.fontFamily,
                    backgroundColor: p.modalBg,
                    color: p.modalText,
                    border: 'none',
                    outline: 'none',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Canonical Raised Header */}
                <div className={isLandscape ? "p-2.5 pb-1.5 shrink-0" : "p-3.5 pb-2 shrink-0"}>
                    <div 
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between quran-raised-card border-0`}
                        style={{
                            backgroundColor: p.headerBg,
                        }}
                    >
                        <span className={`ayah-context-title ${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide`} style={{ color: p.headerAccent }}>
                            {isEn ? "Colors & Customization" : "الألوان والتخصيص"}
                        </span>
                        <button 
                            type="button"
                            onClick={() => {
                                setAyahContextMenu((prev: any) => ({...prev, isOpen: false}));
                            }} 
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>
                </div>

                <div className={`${isLandscape ? 'p-2.5 pt-1.5 pb-3 space-y-2.5' : 'p-3.5 pt-2 pb-4 space-y-4'} overflow-y-auto flex-1 min-h-0 custom-scrollbar`}>
                    {/* Colors Section */}
                    <div className={isLandscape ? "space-y-2.5" : "space-y-3"}>
                        <div className={`grid grid-cols-3 ${isLandscape ? 'gap-2' : 'gap-3'}`}>
                            {[
                                { id: 'textColor', label: isEn ? 'Text' : 'النص', icon: <Type size={14} /> },
                                { id: 'bgColor', label: isEn ? 'Background' : 'الخلفية', icon: <Palette size={14} /> },
                                { id: 'highlightTextColor', label: isEn ? 'Highlight' : 'التحديد', icon: <Highlighter size={14} /> }
                            ].map(field => {
                                const isFieldActive = ayahContextColorField === field.id;
                                const fieldColorValue = tempSettings[field.id] || (
                                    field.id === 'highlightTextColor' 
                                        ? (currentTheme?.highlightText || p.accentColor) 
                                        : field.id === 'textColor'
                                            ? (currentTheme?.text || '#000000')
                                            : (currentTheme?.bg || '#ffffff')
                                );

                                return (
                                    <div 
                                        key={field.id} 
                                        className={`flex flex-col ${isLandscape ? 'gap-1' : 'gap-1.5'} items-center`}
                                    >
                                        <span 
                                            className={`ayah-context-field-label ${isLandscape ? 'text-[11px]' : 'text-xs'} font-bold text-center transition-colors select-none`}
                                            style={{ 
                                                color: isFieldActive ? p.headerAccent : p.mutedText
                                            }}
                                        >
                                            {field.label}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => setAyahContextColorField(isFieldActive ? null : field.id as any)}
                                            className={`${isLandscape ? 'h-9 rounded-xl' : 'h-12 rounded-2xl'} w-full relative overflow-hidden flex items-center justify-center cursor-pointer border-0 quran-raised-btn ${isFieldActive ? 'ayah-color-selected scale-[1.03] ring-2 ring-offset-1' : ''}`}
                                            style={{
                                                ...renderCheckerboard(fieldColorValue),
                                                ...(isFieldActive ? { '--tw-ring-color': p.headerAccent, '--ayah-selected-border': p.headerAccent } as React.CSSProperties : {}),
                                            }}
                                            aria-label={field.label}
                                        >
                                            {isFieldActive && (
                                                <div className="relative z-10 flex items-center justify-center">
                                                    <div 
                                                        className={`${isLandscape ? 'w-5 h-5' : 'w-6 h-6'} rounded-full flex items-center justify-center border border-white/80`}
                                                        style={{ 
                                                            backgroundColor: p.selectedBg, 
                                                            color: p.selectedText 
                                                        }}
                                                    >
                                                        <Check size={isLandscape ? 11 : 14} className="stroke-[3]" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {ayahContextColorField && (
                            <div 
                                className={`${isLandscape ? 'p-2.5 rounded-2xl' : 'p-3.5 rounded-2xl'} border-0 quran-raised-card`}
                                style={{
                                    backgroundColor: p.subtleBg,
                                }}
                            >
                                <div className={`flex justify-between items-center ${isLandscape ? 'mb-1.5' : 'mb-2.5'}`}>
                                    <span className={`ayah-context-picker-title ${isLandscape ? 'text-[10px]' : 'text-[11px]'} font-bold`} style={{ color: p.headerAccent }}>
                                        {isEn 
                                            ? `Select ${ayahContextColorField === 'bgColor' ? 'background' : ayahContextColorField === 'textColor' ? 'text' : 'highlight'} color` 
                                            : `اختر لون ${ayahContextColorField === 'bgColor' ? 'الخلفية' : ayahContextColorField === 'textColor' ? 'النص' : 'التحديد'}`}
                                    </span>
                                </div>
                                <div className={`grid ${isLandscape ? 'grid-cols-8 gap-1.5' : 'grid-cols-6 gap-2.5'}`}>
                                    {PREDEFINED_COLORS.map(c => {
                                        const isSelected = tempSettings[ayahContextColorField!] === c;
                                        return (
                                            <button
                                                type="button"
                                                key={c}
                                                onClick={() => {
                                                    const currentField = ayahContextColorField!;
                                                    const newTempSettings = { ...tempSettings, [currentField]: c };
                                                    setAyahContextMenu((prev: any) => ({
                                                        ...prev,
                                                        tempSettings: newTempSettings
                                                    }));
                                                    if (onTempSettingsChange) {
                                                        onTempSettingsChange(newTempSettings, currentField);
                                                    }
                                                }}
                                                className={`${isLandscape ? 'h-6.5 rounded-lg' : 'h-8 rounded-xl'} relative flex items-center justify-center border-0 quran-raised-btn ${isSelected ? 'ayah-color-selected scale-105 ring-2 ring-offset-1' : ''}`}
                                                style={{
                                                    ...renderCheckerboard(c),
                                                    ...(isSelected ? { '--tw-ring-color': p.headerAccent, '--ayah-selected-border': p.headerAccent } as React.CSSProperties : {}),
                                                }}
                                            >
                                                {isSelected && (
                                                    <div 
                                                        className={`${isLandscape ? 'w-3.5 h-3.5' : 'w-4 h-4'} rounded-full flex items-center justify-center border border-white/80`}
                                                        style={{ 
                                                            backgroundColor: p.selectedBg, 
                                                            color: p.selectedText 
                                                        }}
                                                    >
                                                        <Check size={isLandscape ? 9 : 10} className="stroke-[3]" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AyahContextMenu;
