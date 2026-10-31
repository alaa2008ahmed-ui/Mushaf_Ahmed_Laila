import React, { useState, useEffect, useCallback } from 'react';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { X, Palette, Check, Type, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ToolbarColorPickerModalProps {
    onClose: () => void;
    onOpenModal: (modalName: string) => void;
    showToast: (msg: string) => void;
    currentTheme: any;
    toolbarColors: any;
    isLandscape: boolean;
    modeSuffix: string;
}

const ToolbarColorPickerModal: React.FC<ToolbarColorPickerModalProps> = ({ onClose, onOpenModal, showToast, currentTheme, toolbarColors, isLandscape, modeSuffix }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const [headerSync, setHeaderSync] = useState(false);
    const [footerSync, setFooterSync] = useState(false);
    const [editingType, setEditingType] = useState<string | null>(null);
    
    // State for the edit modal
    const [editConfig, setEditConfig] = useState({ bg: '#ffffff', text: '#000000', border: '#cccccc', font: '' });
    const [activeColorField, setActiveColorField] = useState<'bg' | 'text' | 'border' | null>(null);

    useEffect(() => {
        const interceptor = () => {
            if (editingType) {
                setEditingType(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [editingType]);

    useEffect(() => {
        setActiveColorField(null);
    }, [editingType]);

    const PREDEFINED_COLORS = [
        '#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#000000',
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e', '#78716c', '#57534e', 'transparent'
    ];

    const getStyleForType = useCallback((type: string) => {
        const config = toolbarColors[type];
        
        let defaults = { bg: '#fff', text: '#000', border: '#ccc', font: 'inherit' };
        
        const headerButtons = ['surah', 'juz', 'page', 'audio', 'btn-menu'];
        const footerButtons = ['btn-settings', 'btn-home', 'btn-bookmark', 'btn-autoscroll', 'btn-themes', 'btn-bookmarks-list', 'btn-share'];

        if (type === 'top-toolbar' || type === 'bottom-toolbar') {
            defaults = { bg: currentTheme.barBg, text: currentTheme.barText, border: currentTheme.barBorder, font: currentTheme.font };
        } else if (headerButtons.includes(type)) {
            defaults = { bg: currentTheme.barBg, text: currentTheme.barText, border: currentTheme.btnBorder || currentTheme.barBorder, font: currentTheme.font };
        } else if (footerButtons.includes(type)) {
            defaults = { bg: currentTheme.btnBg, text: currentTheme.btnText, border: currentTheme.btnBorder || currentTheme.btnBg, font: currentTheme.font };
        }

        return {
            bg: config?.bg || defaults.bg,
            text: config?.text || defaults.text,
            border: config?.border || defaults.border,
            font: config?.font || defaults.font
        };
    }, [currentTheme, toolbarColors]);

    const openEditModal = (type: string) => {
        setEditingType(type);
        const style = getStyleForType(type);
        setEditConfig({
            bg: style.bg,
            text: style.text,
            border: style.border,
            font: style.font || ''
        });
    };

    const saveElementChanges = () => {
        if (!editingType) return;
        
        const colors = JSON.parse(localStorage.getItem('toolbar_colors_v2' + modeSuffix) || '{}');
        const newConfig = { ...editConfig };
        
        colors[editingType] = newConfig;
        
        const headerButtons = ['surah', 'juz', 'page', 'audio', 'btn-menu'];
        const footerButtons = ['btn-settings', 'btn-home', 'btn-bookmark', 'btn-bookmarks-list', 'btn-themes', 'btn-autoscroll', 'btn-share'];
        
        if (headerButtons.includes(editingType) && headerSync) {
            headerButtons.forEach(b => colors[b] = { ...newConfig });
        }
        
        if (footerButtons.includes(editingType) && footerSync) {
            footerButtons.forEach(b => colors[b] = { ...newConfig });
        }
        
        if (editingType === 'all') {
            [...headerButtons, ...footerButtons].forEach(k => colors[k] = { ...newConfig });
            colors.unifiedApplied = true;
        } else {
            delete colors.unifiedApplied;
        }
        
        localStorage.setItem('toolbar_colors_v2' + modeSuffix, JSON.stringify(colors));
        window.dispatchEvent(new Event('theme-change'));
        setEditingType(null);
        showToast(isEn ? 'Changes saved successfully' : 'تم حفظ التعديلات');
    };

    const getName = (type: string) => {
        const arMap: Record<string, string> = { 'top-toolbar': 'الشريط العلوى', 'bottom-toolbar': 'الشريط السفلى', 'surah': 'زر السورة', 'juz': 'زر الجزء', 'page': 'زر الصفحة', 'audio': 'زر الصوت', 'btn-settings': 'زر الإعدادات', 'btn-home': 'زر الرئيسية', 'btn-bookmark': 'زر الحفظ', 'btn-bookmarks-list': 'زر القائمة', 'btn-themes': 'زر الثيمات', 'btn-autoscroll': 'زر التمرير', 'btn-menu': 'زر القائمة الجانبية', 'btn-share': 'زر المشاركة', 'all': 'الكل' };
        const enMap: Record<string, string> = { 'top-toolbar': 'Top Bar', 'bottom-toolbar': 'Bottom Bar', 'surah': 'Surah Button', 'juz': 'Juz Button', 'page': 'Page Button', 'audio': 'Audio Button', 'btn-settings': 'Settings Button', 'btn-home': 'Home Button', 'btn-bookmark': 'Bookmark Button', 'btn-bookmarks-list': 'List Button', 'btn-themes': 'Themes Button', 'btn-autoscroll': 'Scroll Button', 'btn-menu': 'Sidebar Button', 'btn-share': 'Share Button', 'all': 'All' };
        return isEn ? (enMap[type] || type) : (arMap[type] || type);
    };

    const renderCheckerboard = (color: string) => {
        if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
            return {
                backgroundColor: '#ffffff',
                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)',
                backgroundSize: '8px 8px'
            };
        }
        return { backgroundColor: color };
    };

    if (editingType) {
        return (
            <div className={`fixed inset-0 z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} dir={isEn ? "ltr" : "rtl"} onClick={() => setEditingType(null)}>
                <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-3xl max-h-[85vh]'} shadow-2xl overflow-hidden animate-modal-enter flex flex-col border-0`} onClick={e => e.stopPropagation()} style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, border: 'none', outline: 'none' }}>
                    <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5 quran-3d-icon" />
                            <h3 className="font-bold text-lg">{isEn ? 'Customize:' : 'تخصيص:'} {getName(editingType)}</h3>
                        </div>
                        <button onClick={() => setEditingType(null)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all quran-raised-btn">
                            <X className="w-5 h-5 quran-3d-icon" />
                        </button>
                    </div>
                    
                    <div className={`p-5 overflow-y-auto flex-1 ${isLandscape ? 'grid grid-cols-2 gap-6 items-start' : 'space-y-6'}`}>
                        {!editingType.includes('toolbar') && (
                            <div className={isLandscape ? 'col-span-1' : ''}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Type className="w-4 h-4 opacity-70" />
                                    <label className="text-sm font-bold opacity-80">{isEn ? 'Font Type' : 'نوع الخط'}</label>
                                </div>
                                <select 
                                    value={editConfig.font} 
                                    onChange={e => setEditConfig({...editConfig, font: e.target.value})} 
                                    className="w-full p-3 rounded-xl quran-raised-card font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all border-0"
                                    style={{ border: 'none', outline: 'none' }}
                                >
                                    <option value="">{isEn ? 'Default' : 'افتراضي'}</option>
                                    <option value="var(--font-amiri-quran)">{isEn ? 'Hafs' : 'حفص'}</option>
                                    <option value="var(--font-amiri)">{isEn ? 'Naskh' : 'نسخ'}</option>
                                    <option value="var(--font-scheherazade)">{isEn ? 'Mujawwad' : 'مجود'}</option>
                                    <option value="var(--font-lateef)">{isEn ? 'Traditional' : 'تراثي'}</option>
                                    <option value="var(--font-harmattan)">{isEn ? 'Warsh' : 'ورش'}</option>
                                    <option value="var(--font-aref)">{isEn ? 'Ruq\'ah' : 'رقعة'}</option>
                                    <option value="var(--font-gulzar)">{isEn ? 'Nasta\'liq' : 'نستعليق'}</option>
                                    <option value="var(--font-kufi)">{isEn ? 'Kufi' : 'كوفي'}</option>
                                    <option value="var(--font-kufam)">{isEn ? 'Modern Kufi' : 'كوفي حديث'}</option>
                                    <option value="var(--font-noto)">{isEn ? 'Modern Naskh' : 'نسخ حديث'}</option>
                                    <option value="var(--font-cairo)">{isEn ? 'Cairo' : 'القاهرة'}</option>
                                    <option value="var(--font-messiri)">{isEn ? 'El Messiri' : 'المسيري'}</option>
                                    <option value="var(--font-rakkas)">{isEn ? 'Rakkas' : 'رقاص'}</option>
                                    <option value="var(--font-lalezar)">{isEn ? 'Lalezar' : 'لالزار'}</option>
                                    <option value="var(--font-katibeh)">{isEn ? 'Katibeh' : 'قطيبة'}</option>
                                    <option value="var(--font-tajawal)">{isEn ? 'Tajawal' : 'تجوّل'}</option>
                                    <option value="var(--font-changa)">{isEn ? 'Changa' : 'شنقة'}</option>
                                    <option value="var(--font-mirza)">{isEn ? 'Mirza' : 'ميرزا'}</option>
                                    <option value="var(--font-qalam)">{isEn ? 'Qalam' : 'قلم'}</option>
                                    <option value="var(--font-thuluth)">{isEn ? 'Thuluth' : 'ثلوث'}</option>
                                    <option value="var(--font-digital)">{isEn ? 'Digital' : 'رقمي'}</option>
                                </select>
                            </div>
                        )}

                        <div className={`grid gap-4 ${isLandscape && editingType.includes('toolbar') ? 'col-span-2 grid-cols-3' : (editingType.includes('toolbar') ? 'grid-cols-2' : 'grid-cols-3')}`}>
                            <div className="space-y-2">
                                <label className="text-xs font-bold opacity-60 px-1">{isEn ? 'Background Color' : 'لون الخلفية'}</label>
                                <button 
                                    className={`h-12 w-full rounded-xl transition-all flex items-center justify-center cursor-pointer ${activeColorField === 'bg' ? 'quran-raised-btn-selected shadow-lg scale-[1.02]' : 'quran-raised-btn'}`}
                                    style={{ border: 'none', ...renderCheckerboard(editConfig.bg) }}
                                    onClick={() => setActiveColorField(activeColorField === 'bg' ? null : 'bg')}
                                >
                                    {activeColorField === 'bg' && <Check className="w-6 h-6 drop-shadow-md quran-3d-icon" style={{ color: 'var(--qr-accent)' }} />}
                                </button>
                            </div>

                            {!editingType.includes('toolbar') && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-60 px-1">{isEn ? 'Text/Icon Color' : 'لون النص/الأيقونة'}</label>
                                    <button 
                                        className={`h-12 w-full rounded-xl transition-all flex items-center justify-center cursor-pointer ${activeColorField === 'text' ? 'quran-raised-btn-selected shadow-lg scale-[1.02]' : 'quran-raised-btn'}`}
                                        style={{ border: 'none', ...renderCheckerboard(editConfig.text) }}
                                        onClick={() => setActiveColorField(activeColorField === 'text' ? null : 'text')}
                                    >
                                        {activeColorField === 'text' && <Check className="w-6 h-6 drop-shadow-md quran-3d-icon" style={{ color: 'var(--qr-accent)' }} />}
                                    </button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold opacity-60 px-1">{isEn ? 'Border Color' : 'لون الحدود'}</label>
                                <button 
                                    className={`h-12 w-full rounded-xl transition-all flex items-center justify-center cursor-pointer ${activeColorField === 'border' ? 'quran-raised-btn-selected shadow-lg scale-[1.02]' : 'quran-raised-btn'}`}
                                    style={{ border: 'none', ...renderCheckerboard(editConfig.border) }}
                                    onClick={() => setActiveColorField(activeColorField === 'border' ? null : 'border')}
                                >
                                    {activeColorField === 'border' && <Check className="w-6 h-6 drop-shadow-md quran-3d-icon" style={{ color: 'var(--qr-accent)' }} />}
                                </button>
                            </div>
                            
                            {activeColorField && (
                                <div className="col-span-full quran-raised-card p-3 rounded-2xl mt-2 animate-fadeIn border-0" style={{ border: 'none' }}>
                                    <div className="grid grid-cols-5 gap-3">
                                        {PREDEFINED_COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setEditConfig({...editConfig, [activeColorField]: c})}
                                                className={`h-12 rounded-xl transition-all flex items-center justify-center cursor-pointer ${editConfig[activeColorField] === c ? 'quran-raised-btn-selected shadow-md z-10' : 'quran-raised-btn'}`}
                                                style={{ border: 'none', ...renderCheckerboard(c) }}
                                            >
                                                {editConfig[activeColorField] === c && <Check className="w-5 h-5 quran-3d-icon" style={{ color: 'var(--qr-accent)' }} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 flex justify-center">
                        <button 
                            onClick={saveElementChanges} 
                            className="w-full quran-raised-btn-selected font-bold py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-0"
                            style={{ backgroundColor: 'var(--qr-accent)', color: 'var(--qr-accent-text, #ffffff)', border: 'none' }}
                        >
                            <Check className="w-5 h-5 quran-3d-icon" />
                            {isEn ? 'Apply Changes' : 'تطبيق التغييرات'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} dir={isEn ? "ltr" : "rtl"} onClick={handleClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-5xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter border-0`} onClick={e => e.stopPropagation()} style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, border: 'none', outline: 'none' }}>
                <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 quran-3d-icon" />
                        <h3 className="font-bold text-lg">{isEn ? 'Customize Interface' : 'تخصيص الواجهة'}</h3>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all quran-raised-btn">
                        <X className="w-5 h-5 quran-3d-icon" />
                    </button>
                </div>

                <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${isLandscape ? 'grid grid-cols-2 gap-6 space-y-0' : ''}`}>
                    {/* Main Toolbars Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold opacity-60 px-2 flex items-center gap-2">
                            <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: 'var(--qr-accent)' }}></div>
                            {isEn ? 'Main Toolbars' : 'الأشرطة الرئيسية'}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => openEditModal('top-toolbar')} className={`quran-raised-card p-4 rounded-2xl shadow-md transition-all group relative overflow-hidden ${isEn ? 'text-left' : 'text-right'} cursor-pointer border-0`} style={{ border: 'none' }}>
                                <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ backgroundColor: 'var(--qr-accent)' }}></div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="font-bold text-sm">{getName('top-toolbar')}</span>
                                    <div className="h-6 w-12 rounded quran-raised-btn" style={{ border: 'none', ...renderCheckerboard(getStyleForType('top-toolbar').bg) }}></div>
                                </div>
                            </button>
                            <button onClick={() => openEditModal('bottom-toolbar')} className={`quran-raised-card p-4 rounded-2xl shadow-md transition-all group relative overflow-hidden ${isEn ? 'text-left' : 'text-right'} cursor-pointer border-0`} style={{ border: 'none' }}>
                                <div className="absolute bottom-0 left-0 w-full h-1 opacity-50" style={{ backgroundColor: 'var(--qr-accent)' }}></div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="font-bold text-sm">{getName('bottom-toolbar')}</span>
                                    <div className="h-6 w-12 rounded quran-raised-btn" style={{ border: 'none', ...renderCheckerboard(getStyleForType('bottom-toolbar').bg) }}></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Header Buttons Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-sm font-bold opacity-60 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                {isEn ? 'Top Bar Buttons' : 'أزرار الشريط العلوى'}
                            </h4>
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl quran-raised-btn">
                                <label className="text-[10px] font-bold text-emerald-600">{isEn ? 'Unify' : 'توحيد'}</label>
                                <input type="checkbox" checked={headerSync} onChange={e => setHeaderSync(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['surah', 'juz', 'page', 'audio', 'btn-menu'].map(type => {
                                const style = getStyleForType(type);
                                return (
                                    <button key={type} onClick={() => openEditModal(type)} className="quran-raised-btn p-3 rounded-xl flex items-center justify-between cursor-pointer border-0" style={{ border: 'none' }}>
                                        <span className="text-xs font-bold">{getName(type)}</span>
                                        <div className="w-6 h-6 rounded-full shadow-inner" style={{ border: 'none', ...renderCheckerboard(style.bg) }}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Buttons Section */}
                    <div className={`space-y-3 ${isLandscape ? 'col-span-2' : ''}`}>
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-sm font-bold opacity-60 flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                {isEn ? 'Bottom Bar Buttons' : 'أزرار الشريط السفلى'}
                            </h4>
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl quran-raised-btn">
                                <label className="text-[10px] font-bold text-emerald-600">{isEn ? 'Unify' : 'توحيد'}</label>
                                <input type="checkbox" checked={footerSync} onChange={e => setFooterSync(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"/>
                            </div>
                        </div>
                        <div className={`grid gap-3 ${isLandscape ? 'grid-cols-4' : 'grid-cols-2'}`}>
                             {['btn-settings', 'btn-home', 'btn-bookmark', 'btn-autoscroll', 'btn-themes', 'btn-bookmarks-list', 'btn-share'].map(type => {
                                const style = getStyleForType(type);
                                return (
                                    <button key={type} onClick={() => openEditModal(type)} className="quran-raised-btn p-3 rounded-xl flex items-center justify-between cursor-pointer border-0" style={{ border: 'none' }}>
                                        <span className="text-xs font-bold">{getName(type)}</span>
                                        <div className="w-6 h-6 rounded-full shadow-inner" style={{ border: 'none', ...renderCheckerboard(style.bg) }}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Unified Color Button */}
                    <div className={`${isLandscape ? 'col-span-2' : ''} pt-2`}>
                         <button 
                            onClick={() => openEditModal('all')} 
                            className="w-full py-3.5 quran-raised-btn rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer border-0"
                            style={{ border: 'none' }}
                        >
                            <Palette className="w-4 h-4 quran-3d-icon" />
                            {isEn ? 'Apply Unified Color to All Buttons' : 'تطبيق لون موحد لجميع الأزرار'}
                        </button>
                    </div>
                </div>

                {/* Sticky/Fixed Bottom Footer - Back to Settings Button */}
                <div className="p-3.5 sm:p-4 shrink-0 border-t border-black/5 dark:border-white/10">
                    <button 
                        onClick={handleClose} 
                        className="quran-raised-btn-selected w-full py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer border-0"
                        style={{ backgroundColor: 'var(--qr-accent)', color: 'var(--qr-accent-text, #ffffff)', border: 'none' }}
                    >
                        <ChevronLeft className={`w-4 h-4 quran-3d-icon ${isEn ? 'rotate-180' : ''}`} />
                        {isEn ? 'Back to Settings' : 'الرجوع للإعدادات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToolbarColorPickerModal;
