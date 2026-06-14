import React from 'react';
import { THEMES } from './constants';
import { Type, Palette, Highlighter, X, Check } from 'lucide-react';

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
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[1200] bg-transparent flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'} animate-fadeIn`} onClick={() => {
            setAyahContextMenu((p: any) => ({...p, isOpen: false}));
        }}>
            <div 
                className={`ayah-context-menu w-full ${isLandscape ? 'max-w-[300px] max-h-[90vh]' : 'max-w-[320px] max-h-[70vh]'} bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden animate-modal-enter`} 
                style={{ 
                    fontFamily: currentTheme.font,
                    border: `2px solid ${currentTheme.barBorder || currentTheme.accent || '#000000'}`
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-5">
                    {/* Colors Section */}
                    <div className="space-y-3">
                        <div className="bg-blue-50/50 py-1.5 px-3 rounded-md flex items-center justify-between">
                            <button onClick={() => {
                                setAyahContextMenu((p: any) => ({...p, isOpen: false}));
                            }} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={18} className="text-gray-500" />
                            </button>
                            <span className="text-xs font-bold text-gray-700">الألوان</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'textColor', label: 'النص', icon: <Type size={14} /> },
                                { id: 'bgColor', label: 'الخلفية', icon: <Palette size={14} /> },
                                { id: 'highlightTextColor', label: 'التحديد', icon: <Highlighter size={14} /> }
                            ].map(field => (
                                <div key={field.id} className="flex flex-col gap-1.5">
                                    <button 
                                        onClick={() => setAyahContextColorField(ayahContextColorField === field.id ? null : field.id as any)}
                                        className={`h-12 w-full rounded-xl border-2 shadow-sm transition-all relative overflow-hidden flex items-center justify-center ${ayahContextColorField === field.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'}`}
                                        style={renderCheckerboard(tempSettings[field.id] || (field.id === 'highlightTextColor' ? THEMES['olive'].highlightText : ''))}
                                    >
                                        {ayahContextColorField === field.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                                <Check size={16} className="text-white drop-shadow-md" />
                                            </div>
                                        )}
                                    </button>
                                    <span className="text-[10px] font-bold text-gray-500 text-center">{field.label}</span>
                                </div>
                            ))}
                        </div>

                        {ayahContextColorField && (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 animate-fadeIn">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-gray-600">
                                        اختر لون {ayahContextColorField === 'bgColor' ? 'الخلفية' : ayahContextColorField === 'textColor' ? 'النص' : 'التحديد'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {PREDEFINED_COLORS.map(c => (
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
                                            className={`h-7 rounded-lg border transition-all hover:scale-110 relative ${tempSettings[ayahContextColorField!] === c ? 'ring-2 ring-emerald-500 ring-offset-1' : 'border-gray-200'}`}
                                            style={renderCheckerboard(c)}
                                        >
                                            {tempSettings[ayahContextColorField!] === c && <Check size={10} className="absolute inset-0 m-auto text-white drop-shadow-sm" />}
                                        </button>
                                    ))}
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
