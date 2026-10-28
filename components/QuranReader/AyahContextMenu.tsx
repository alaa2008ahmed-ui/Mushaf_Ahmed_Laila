import React from 'react';
import { Type, Palette, Highlighter, X, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AyahContextMenuProps {
    isOpen: boolean;
    tempSettings: any;
    ayahContextColorField: 'textColor' | 'bgColor' | 'highlightTextColor' | null;
    setAyahContextColorField: (field: 'textColor' | 'bgColor' | 'highlightTextColor' | null) => void;
    setAyahContextMenu: React.Dispatch<React.SetStateAction<any>>;
    onTempSettingsChange?: (newSettings: any) => void;
    renderCheckerboard: (color: string) => React.CSSProperties;
    PREDEFINED_COLORS: string[];
    currentTheme: any;
    isLandscape?: boolean;
}

const extractColor = (val?: string, fallback = '#000000'): string => {
    if (!val) return fallback;
    if (val.includes('#')) {
        const match = val.match(/#[0-9a-fA-F]{3,8}/);
        if (match) return match[0];
    }
    return val;
};

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

    // Dynamically derive the frame and border color from the active theme
    const themeBorderColor = extractColor(
        currentTheme?.barBorder || currentTheme?.cardBorder || currentTheme?.accent,
        '#000000'
    );

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/25 backdrop-blur-[2px] flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'} animate-fadeIn`} onClick={() => {
            setAyahContextMenu((p: any) => ({...p, isOpen: false}));
        }}>
            <div 
                dir={dir}
                className={`ayah-context-menu w-full ${isLandscape ? 'max-w-[300px] max-h-[90vh]' : 'max-w-[320px] max-h-[70vh]'} rounded-3xl shadow-2xl transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden animate-modal-enter border-0`} 
                style={{ 
                    fontFamily: currentTheme?.font,
                    backgroundColor: currentTheme?.modalBg || '#ffffff',
                    color: currentTheme?.modalText || currentTheme?.text || '#000000',
                    border: 'none',
                    outline: 'none',
                    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.28), 0 8px 16px -2px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.85)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-4">
                    {/* Header Bar */}
                    <div 
                        className="py-2 px-3 rounded-2xl flex items-center justify-between transition-colors quran-raised-card border-0"
                        style={{
                            backgroundColor: `${themeBorderColor}12`,
                        }}
                    >
                        <button 
                            onClick={() => {
                                setAyahContextMenu((p: any) => ({...p, isOpen: false}));
                            }} 
                            className="p-1.5 quran-raised-btn rounded-full transition-all active:scale-90 flex items-center justify-center border-0"
                            style={{ color: themeBorderColor }}
                        >
                            <X size={16} />
                        </button>
                        <span className="text-xs font-black tracking-wide" style={{ color: themeBorderColor }}>
                            {isEn ? "Colors & Customization" : "الألوان والتخصيص"}
                        </span>
                    </div>

                    {/* Colors Section */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { id: 'textColor', label: isEn ? 'Text' : 'النص', icon: <Type size={14} /> },
                                { id: 'bgColor', label: isEn ? 'Background' : 'الخلفية', icon: <Palette size={14} /> },
                                { id: 'highlightTextColor', label: isEn ? 'Highlight' : 'التحديد', icon: <Highlighter size={14} /> }
                            ].map(field => {
                                const isFieldActive = ayahContextColorField === field.id;
                                const fieldColorValue = tempSettings[field.id] || (
                                    field.id === 'highlightTextColor' 
                                        ? (currentTheme?.highlightText || currentTheme?.accent || '#10b981') 
                                        : ''
                                );

                                return (
                                    <div 
                                        key={field.id} 
                                        className={`flex flex-col gap-1.5 p-2 rounded-2xl transition-all duration-300 border-0 ${isFieldActive ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-card'}`}
                                        style={{
                                            backgroundColor: isFieldActive ? `${themeBorderColor}18` : undefined
                                        }}
                                    >
                                        <button 
                                            onClick={() => setAyahContextColorField(isFieldActive ? null : field.id as any)}
                                            className="h-12 w-full rounded-xl transition-all relative overflow-hidden flex items-center justify-center active:scale-95 cursor-pointer quran-raised-btn border-0"
                                            style={{
                                                ...renderCheckerboard(fieldColorValue),
                                                boxShadow: isFieldActive 
                                                    ? `0 0 0 2px ${themeBorderColor}, 0 4px 12px ${themeBorderColor}40` 
                                                    : undefined
                                            }}
                                            title={field.label}
                                        >
                                            {isFieldActive && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/15 backdrop-blur-[0.5px]">
                                                    <div 
                                                        className="w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform scale-100"
                                                        style={{ 
                                                            backgroundColor: themeBorderColor, 
                                                            color: currentTheme?.accentText || '#ffffff' 
                                                        }}
                                                    >
                                                        <Check size={14} className="stroke-[3]" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                        <span 
                                            className="text-[10px] font-bold text-center transition-colors select-none"
                                            style={{ 
                                                color: isFieldActive 
                                                    ? themeBorderColor 
                                                    : (currentTheme?.modalText ? `${currentTheme.modalText}90` : '#4b5563') 
                                            }}
                                        >
                                            {field.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {ayahContextColorField && (
                            <div 
                                className="p-3.5 rounded-2xl border-0 quran-raised-card animate-fadeIn transition-colors"
                                style={{
                                    backgroundColor: `${themeBorderColor}0d`,
                                }}
                            >
                                <div className="flex justify-between items-center mb-2.5">
                                    <span className="text-[11px] font-bold" style={{ color: themeBorderColor }}>
                                        {isEn 
                                            ? `Select ${ayahContextColorField === 'bgColor' ? 'background' : ayahContextColorField === 'textColor' ? 'text' : 'highlight'} color`
                                            : `اختر لون ${ayahContextColorField === 'bgColor' ? 'الخلفية' : ayahContextColorField === 'textColor' ? 'النص' : 'التحديد'}`}
                                    </span>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    {PREDEFINED_COLORS.map(c => {
                                        const isSelected = tempSettings[ayahContextColorField!] === c;
                                        return (
                                            <button
                                                key={c}
                                                onClick={() => {
                                                    const newTempSettings = { ...tempSettings, [ayahContextColorField!]: c };
                                                    setAyahContextMenu((prev: any) => ({
                                                        ...prev,
                                                        tempSettings: newTempSettings
                                                    }));
                                                    if (onTempSettingsChange) {
                                                        onTempSettingsChange(newTempSettings);
                                                    }
                                                }}
                                                className={`h-8 rounded-xl transition-all hover:scale-110 active:scale-95 relative flex items-center justify-center border-0 quran-raised-btn ${isSelected ? 'scale-105 shadow-md' : ''}`}
                                                style={{
                                                    ...renderCheckerboard(c),
                                                    boxShadow: isSelected ? `0 0 0 2.5px ${themeBorderColor}, 0 4px 10px rgba(0,0,0,0.2)` : undefined
                                                }}
                                            >
                                                {isSelected && (
                                                    <div 
                                                        className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                                                        style={{ 
                                                            backgroundColor: themeBorderColor, 
                                                            color: currentTheme?.accentText || '#ffffff' 
                                                        }}
                                                    >
                                                        <Check size={10} className="stroke-[3]" />
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
