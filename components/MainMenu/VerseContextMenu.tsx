import React, { useState, useEffect } from 'react';
import { FONTS } from '../QuranReader/constants';

interface VerseContextMenuProps {
    isOpen: boolean;
    onClose: () => void;
    settings: {
        fontFamily: string;
        bgColor: string;
        textColor: string;
    };
    onSave: (newSettings: any) => void;
    currentTheme: any;
    renderCheckerboard: (color: string) => React.CSSProperties;
    PREDEFINED_COLORS: string[];
    isLandscape?: boolean;
}

const VerseContextMenu: React.FC<VerseContextMenuProps> = ({
    isOpen,
    onClose,
    settings,
    onSave,
    currentTheme,
    renderCheckerboard,
    PREDEFINED_COLORS,
    isLandscape
}) => {
    const [tempSettings, setTempSettings] = useState(settings);
    const [activeColorField, setActiveColorField] = useState<'bgColor' | 'textColor' | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTempSettings(settings);
            setActiveColorField(null);
        }
    }, [isOpen, settings]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(tempSettings);
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div 
                className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none' : 'max-w-sm rounded-3xl max-h-[85vh]'} shadow-2xl flex flex-col animate-modal-enter overflow-hidden`} 
                style={{ backgroundColor: currentTheme?.modalBg || '#ffffff', color: currentTheme?.modalText || '#000000', fontFamily: currentTheme?.font }}
                onClick={e => e.stopPropagation()}
            >
                <div className={`p-6 overflow-y-auto flex-1 space-y-6 ${isLandscape ? 'max-w-sm mx-auto w-full' : ''}`}>
                    <h3 className="text-xl font-bold text-center mb-2">تخصيص مظهر الآية</h3>
                    
                    {/* Colors Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-bold opacity-70 mb-2 text-center">لون النص</label>
                            <div 
                                className={`h-12 w-full rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center ${activeColorField === 'textColor' ? 'border-emerald-500 shadow-md scale-105' : 'border-gray-200 dark:border-gray-700'}`}
                                style={renderCheckerboard(tempSettings.textColor)}
                                onClick={() => setActiveColorField(activeColorField === 'textColor' ? null : 'textColor')}
                            >
                                {activeColorField === 'textColor' && <i className="fa-solid fa-eye text-emerald-500"></i>}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-bold opacity-70 mb-2 text-center">لون الخلفية</label>
                            <div 
                                className={`h-12 w-full rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center ${activeColorField === 'bgColor' ? 'border-emerald-500 shadow-md scale-105' : 'border-gray-200 dark:border-gray-700'}`}
                                style={renderCheckerboard(tempSettings.bgColor)}
                                onClick={() => setActiveColorField(activeColorField === 'bgColor' ? null : 'bgColor')}
                            >
                                {activeColorField === 'bgColor' && <i className="fa-solid fa-eye text-emerald-500"></i>}
                            </div>
                        </div>
                    </div>

                    {activeColorField && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold opacity-70">
                                    اختر لون {activeColorField === 'bgColor' ? 'الخلفية' : 'النص'}
                                </span>
                                <button onClick={() => setActiveColorField(null)} className="opacity-50 hover:opacity-100">
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                                {PREDEFINED_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setTempSettings(prev => ({ ...prev, [activeColorField]: c }))}
                                        className={`h-8 rounded-lg border shadow-sm transition-all hover:scale-110 ${tempSettings[activeColorField] === c ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900 border-transparent' : 'border-gray-200 dark:border-gray-600'}`}
                                        style={renderCheckerboard(c)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fonts Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold opacity-70 block">نوع الخط</label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                            {FONTS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setTempSettings(prev => ({ ...prev, fontFamily: f.id }))}
                                    className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${tempSettings.fontFamily === f.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
                                    style={{ fontFamily: f.id }}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 font-bold transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-check"></i>
                            حفظ التغييرات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerseContextMenu;
