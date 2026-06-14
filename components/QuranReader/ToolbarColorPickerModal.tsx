import React, { useState, useEffect, useCallback } from 'react';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { X, Palette, Check, Type, ChevronLeft } from 'lucide-react';

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
        showToast('تم حفظ التعديلات');
    };

    const getName = (type: string) => {
        const map: Record<string, string> = { 'top-toolbar': 'الشريط العلوى', 'bottom-toolbar': 'الشريط السفلى', 'surah': 'زر السورة', 'juz': 'زر الجزء', 'page': 'زر الصفحة', 'audio': 'زر الصوت', 'btn-settings': 'زر الإعدادات', 'btn-home': 'زر الرئيسية', 'btn-bookmark': 'زر الحفظ', 'btn-bookmarks-list': 'زر القائمة', 'btn-themes': 'زر الثيمات', 'btn-autoscroll': 'زر التمرير', 'btn-menu': 'زر القائمة الجانبية', 'btn-share': 'زر المشاركة', 'all': 'الكل' };
        return map[type] || type;
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
            <div className={`fixed inset-0 z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={() => setEditingType(null)}>
                <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-3xl max-h-[85vh]'} shadow-2xl overflow-hidden animate-modal-enter flex flex-col`} onClick={e => e.stopPropagation()} style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="theme-header-bg p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            <h3 className="font-bold text-lg">تخصيص: {getName(editingType)}</h3>
                        </div>
                        <button onClick={() => setEditingType(null)} className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-1 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className={`p-5 overflow-y-auto flex-1 ${isLandscape ? 'grid grid-cols-2 gap-6 items-start' : 'space-y-6'}`}>
                        {!editingType.includes('toolbar') && (
                            <div className={isLandscape ? 'col-span-1' : ''}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Type className="w-4 h-4 opacity-70" />
                                    <label className="text-sm font-bold opacity-80">نوع الخط</label>
                                </div>
                                <select 
                                    value={editConfig.font} 
                                    onChange={e => setEditConfig({...editConfig, font: e.target.value})} 
                                    className="w-full p-3 rounded-xl themed-card-bg border border-gray-200 dark:border-gray-700 font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                >
                                    <option value="">افتراضي</option>
                                    <option value="var(--font-amiri-quran)">حفص</option>
                                    <option value="var(--font-amiri)">نسخ</option>
                                    <option value="var(--font-scheherazade)">مجود</option>
                                    <option value="var(--font-lateef)">تراثي</option>
                                    <option value="var(--font-harmattan)">ورش</option>
                                    <option value="var(--font-aref)">رقعة</option>
                                    <option value="var(--font-gulzar)">نستعليق</option>
                                    <option value="var(--font-kufi)">كوفي</option>
                                    <option value="var(--font-kufam)">كوفي حديث</option>
                                    <option value="var(--font-noto)">نسخ حديث</option>
                                    <option value="var(--font-cairo)">القاهرة</option>
                                    <option value="var(--font-messiri)">المسيري</option>
                                    <option value="var(--font-rakkas)">رقاص</option>
                                    <option value="var(--font-lalezar)">لالزار</option>
                                    <option value="var(--font-katibeh)">قطيبة</option>
                                    <option value="var(--font-tajawal)">تجوّل</option>
                                    <option value="var(--font-changa)">شنقة</option>
                                    <option value="var(--font-mirza)">ميرزا</option>
                                    <option value="var(--font-qalam)">قلم</option>
                                    <option value="var(--font-thuluth)">ثلوث</option>
                                    <option value="var(--font-digital)">رقمي</option>
                                </select>
                            </div>
                        )}

                        <div className={`grid gap-4 ${isLandscape && editingType.includes('toolbar') ? 'col-span-2 grid-cols-3' : (editingType.includes('toolbar') ? 'grid-cols-2' : 'grid-cols-3')}`}>
                            <div className="space-y-2">
                                <label className="text-xs font-bold opacity-60 px-1">لون الخلفية</label>
                                <button 
                                    className={`h-12 w-full rounded-xl border-2 transition-all flex items-center justify-center ${activeColorField === 'bg' ? 'scale-[1.02] shadow-lg' : 'border-gray-200 dark:border-gray-700'}`}
                                    style={{ borderColor: activeColorField === 'bg' ? 'var(--qr-accent)' : 'var(--qr-card-border)', ...renderCheckerboard(editConfig.bg) }}
                                    onClick={() => setActiveColorField(activeColorField === 'bg' ? null : 'bg')}
                                >
                                    {activeColorField === 'bg' && <Check className="w-6 h-6 drop-shadow-md" style={{ color: 'var(--qr-accent)' }} />}
                                </button>
                            </div>

                            {!editingType.includes('toolbar') && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-60 px-1">لون النص/الأيقونة</label>
                                    <button 
                                        className={`h-12 w-full rounded-xl border-2 transition-all flex items-center justify-center ${activeColorField === 'text' ? 'scale-[1.02] shadow-lg' : 'border-gray-200 dark:border-gray-700'}`}
                                        style={{ borderColor: activeColorField === 'text' ? 'var(--qr-accent)' : 'var(--qr-card-border)', ...renderCheckerboard(editConfig.text) }}
                                        onClick={() => setActiveColorField(activeColorField === 'text' ? null : 'text')}
                                    >
                                        {activeColorField === 'text' && <Check className="w-6 h-6 drop-shadow-md" style={{ color: 'var(--qr-accent)' }} />}
                                    </button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold opacity-60 px-1">لون الحدود</label>
                                <button 
                                    className={`h-12 w-full rounded-xl border-2 transition-all flex items-center justify-center ${activeColorField === 'border' ? 'scale-[1.02] shadow-lg' : 'border-gray-200 dark:border-gray-700'}`}
                                    style={{ borderColor: activeColorField === 'border' ? 'var(--qr-accent)' : 'var(--qr-card-border)', ...renderCheckerboard(editConfig.border) }}
                                    onClick={() => setActiveColorField(activeColorField === 'border' ? null : 'border')}
                                >
                                    {activeColorField === 'border' && <Check className="w-6 h-6 drop-shadow-md" style={{ color: 'var(--qr-accent)' }} />}
                                </button>
                            </div>
                            
                            {activeColorField && (
                                <div className="col-span-full themed-card-bg p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 mt-2 animate-fadeIn shadow-inner">
                                    <div className="grid grid-cols-5 gap-3">
                                        {PREDEFINED_COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setEditConfig({...editConfig, [activeColorField]: c})}
                                                className={`h-12 rounded-lg border-2 transition-all hover:scale-110 active:scale-90 flex items-center justify-center ${editConfig[activeColorField] === c ? 'shadow-md z-10' : 'border-transparent'}`}
                                                style={{ borderColor: editConfig[activeColorField] === c ? 'var(--qr-accent)' : 'transparent', ...renderCheckerboard(c) }}
                                            >
                                                {editConfig[activeColorField] === c && <Check className="w-5 h-5" style={{ color: 'var(--qr-accent)' }} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 themed-card-bg border-t border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={saveElementChanges} 
                            className="w-full theme-accent-btn font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            تطبيق التغييرات
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={handleClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-5xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()} style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <div className="theme-header-bg p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        <h3 className="font-bold text-lg">تخصيص الواجهة</h3>
                    </div>
                    <button onClick={handleClose} className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-1 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${isLandscape ? 'grid grid-cols-2 gap-6 space-y-0' : ''}`}>
                    {/* Main Toolbars Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold opacity-60 px-2 flex items-center gap-2">
                            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--qr-accent)' }}></div>
                            الأشرطة الرئيسية
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => openEditModal('top-toolbar')} className="themed-card-bg p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ backgroundColor: 'var(--qr-accent)' }}></div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="font-bold text-sm">الشريط العلوى</span>
                                    <div className="h-6 w-12 rounded border border-gray-300 dark:border-gray-600" style={renderCheckerboard(getStyleForType('top-toolbar').bg)}></div>
                                </div>
                            </button>
                            <button onClick={() => openEditModal('bottom-toolbar')} className="themed-card-bg p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-full h-1 opacity-50" style={{ backgroundColor: 'var(--qr-accent)' }}></div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="font-bold text-sm">الشريط السفلى</span>
                                    <div className="h-6 w-12 rounded border border-gray-300 dark:border-gray-600" style={renderCheckerboard(getStyleForType('bottom-toolbar').bg)}></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Header Buttons Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-sm font-bold opacity-60 flex items-center gap-2">
                                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                أزرار الشريط العلوى
                            </h4>
                            <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                <label className="text-[10px] font-bold text-emerald-600">توحيد</label>
                                <input type="checkbox" checked={headerSync} onChange={e => setHeaderSync(e.target.checked)} className="w-3 h-3 accent-emerald-500"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['surah', 'juz', 'page', 'audio', 'btn-menu'].map(type => {
                                const style = getStyleForType(type);
                                return (
                                    <button key={type} onClick={() => openEditModal(type)} className="themed-card-bg p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:border-emerald-500 transition-colors">
                                        <span className="text-xs font-bold">{getName(type)}</span>
                                        <div className="w-6 h-6 rounded-full border border-gray-300" style={renderCheckerboard(style.bg)}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Buttons Section */}
                    <div className={`space-y-3 ${isLandscape ? 'col-span-2' : ''}`}>
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-sm font-bold opacity-60 flex items-center gap-2">
                                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                أزرار الشريط السفلى
                            </h4>
                            <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                <label className="text-[10px] font-bold text-emerald-600">توحيد</label>
                                <input type="checkbox" checked={footerSync} onChange={e => setFooterSync(e.target.checked)} className="w-3 h-3 accent-emerald-500"/>
                            </div>
                        </div>
                        <div className={`grid gap-3 ${isLandscape ? 'grid-cols-4' : 'grid-cols-2'}`}>
                             {['btn-settings', 'btn-home', 'btn-bookmark', 'btn-autoscroll', 'btn-themes', 'btn-bookmarks-list', 'btn-share'].map(type => {
                                const style = getStyleForType(type);
                                return (
                                    <button key={type} onClick={() => openEditModal(type)} className="themed-card-bg p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:border-emerald-500 transition-colors">
                                        <span className="text-xs font-bold">{getName(type)}</span>
                                        <div className="w-6 h-6 rounded-full border border-gray-300" style={renderCheckerboard(style.bg)}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Unified Color Button */}
                    <div className={`${isLandscape ? 'col-span-2' : ''} pt-2`}>
                         <button 
                            onClick={() => openEditModal('all')} 
                            className="w-full py-4 bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Palette className="w-4 h-4" />
                            تطبيق لون موحد لجميع الأزرار
                        </button>
                    </div>
                </div>

                <div className="p-4 themed-card-bg border-t border-gray-200 dark:border-gray-700 flex justify-center">
                    <button 
                        onClick={handleClose} 
                        className="theme-accent-btn w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        الرجوع للإعدادات
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToolbarColorPickerModal;
