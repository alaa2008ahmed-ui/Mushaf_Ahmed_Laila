import React, { useState, useEffect, useRef } from 'react';
import { READERS, TAFSEERS, THEMES, DEFAULT_SETTINGS, toArabic } from './constants';
import TutorialOverlay, { TutorialStep } from '../Tutorial/TutorialOverlay';
import { ZoomIn, Palette, Mic, Type, Repeat, Book, MousePointer2, Settings2, Download, ChevronDown, ChevronUp } from 'lucide-react';

import SurahHeader from './SurahHeader';

interface SettingsModalProps {
    onClose: () => void;
    onOpenModal: (modalName: string) => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
    readingMode: string;
    modeSuffix: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onOpenModal, showToast, isLandscape, readingMode, modeSuffix }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        onClose();
    };

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('quran_settings' + modeSuffix);
        const baseSettings = saved ? JSON.parse(saved) : {};
        return { ...DEFAULT_SETTINGS, ...baseSettings };
    });
    
    useEffect(() => {
        const handleSettingsUpdate = () => {
            const saved = localStorage.getItem('quran_settings' + modeSuffix);
            const baseSettings = saved ? JSON.parse(saved) : {};
            setSettings({ ...DEFAULT_SETTINGS, ...baseSettings });
        };
        window.addEventListener('theme-change', handleSettingsUpdate);
        window.addEventListener('settings-change', handleSettingsUpdate);
        return () => {
            window.removeEventListener('theme-change', handleSettingsUpdate);
            window.removeEventListener('settings-change', handleSettingsUpdate);
        };
    }, [modeSuffix]);

    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const saved = localStorage.getItem('show_sajdah_card' + modeSuffix);
        return saved !== null ? saved === 'true' : true;
    });
    const [isHideToolbarsEnabled, setIsHideToolbarsEnabled] = useState(() => {
        const saved = localStorage.getItem('hide_toolbars_enabled' + modeSuffix);
        return saved !== null ? saved === 'true' : false;
    });

    const [isDesignDropdownOpen, setIsDesignDropdownOpen] = useState(false);
    const designDropdownRef = useRef<HTMLDivElement>(null);
    const activeDesignItemRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isDesignDropdownOpen && activeDesignItemRef.current) {
            setTimeout(() => {
                activeDesignItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        }
    }, [isDesignDropdownOpen]);

    const [activeColorField, setActiveColorField] = useState<'textColor' | 'bgColor' | 'highlightTextColor' | null>(null);

    const settingsTutorialSteps: TutorialStep[] = [
        {
            id: 'font-size',
            text: 'حجم الخط: تحكم في حجم الخط بما يتناسب مع راحتك أثناء القراءة.',
            position: { top: '150px' },
            arrow: 'up',
            selector: '#font-size-section',
            icon: <ZoomIn className="w-8 h-8 text-white" />
        },
        {
            id: 'colors',
            text: 'الألوان المخصصة: غير ألوان النص والخلفية والتحديد لتجربة قراءة مريحة لعينيك.',
            position: { top: '250px' },
            arrow: 'up',
            selector: '#colors-section',
            icon: <Palette className="w-8 h-8 text-white" />
        },
        {
            id: 'font-family',
            text: 'نوع الخط: اختر من بين مجموعة متنوعة من الخطوط العربية الأصيلة.',
            position: { top: '350px' },
            arrow: 'up',
            selector: '#font-family-section',
            icon: <Type className="w-8 h-8 text-white" />
        },
        {
            id: 'reciter',
            text: 'القارئ المفضل: اختر قارئك المفضل للاستماع إلى التلاوة العطرة.',
            position: { top: '420px' },
            arrow: 'up',
            selector: '#reciter-section',
            icon: <Mic className="w-8 h-8 text-white" />
        },
        {
            id: 'ayah-repeat',
            text: 'تكرار الآيات: ميزة مفيدة للحفظ، تتيح لك تكرار الآية الواحدة عدة مرات.',
            position: { top: '500px' },
            arrow: 'up',
            selector: '#ayah-repeat-section',
            icon: <Repeat className="w-8 h-8 text-white" />
        },
        {
            id: 'tafseer',
            text: 'اختيار التفسير: حدد كتاب التفسير الذي تود الرجوع إليه لتدبر المعاني.',
            position: { top: '580px' },
            arrow: 'up',
            selector: '#tafseer-section',
            icon: <Book className="w-8 h-8 text-white" />
        },
        {
            id: 'scroll-speed',
            text: 'سرعة التمرير: اضبط سرعة التمرير التلقائي لتناسب سرعة قراءتك.',
            position: { top: '650px' },
            arrow: 'up',
            selector: '#scroll-speed-section',
            icon: <MousePointer2 className="w-8 h-8 text-white" />
        },
        {
            id: 'toggles',
            text: 'خيارات إضافية: تحكم في إظهار بطاقة السجدة وإخفاء الأشرطة أثناء القراءة.',
            position: { top: '750px' },
            arrow: 'up',
            selector: '#toggles-section',
            icon: <Settings2 className="w-8 h-8 text-white" />
        },
        {
            id: 'interface-customization',
            text: 'تخصيص الواجهة: ميزة جديدة تتيح لك تغيير ألوان شريط الأدوات والأزرار بالكامل.',
            position: { bottom: '150px' },
            arrow: 'down',
            selector: '#interface-customization-btn',
            icon: <Palette className="w-8 h-8 text-white" />
        },
        {
            id: 'downloads',
            text: 'التحميل للاستخدام أوفلاين: حمل المصحف والتفسير ليعمل التطبيق بدون إنترنت.',
            position: { bottom: '100px' },
            arrow: 'down',
            selector: '#downloads-only-section',
            icon: <Download className="w-8 h-8 text-white" />
        }
    ];

    const PREDEFINED_COLORS = [
        '#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#000000',
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e', '#78716c', '#57534e', 'transparent'
    ];

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

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
        // Dispatch event for live updates
        window.dispatchEvent(new Event('settings-change'));
    };

    const handleSajdahCardToggle = (checked: boolean) => {
        setShowSajdahCard(checked);
        localStorage.setItem('show_sajdah_card' + modeSuffix, String(checked));
        window.dispatchEvent(new Event('settings-change'));
        showToast(checked ? 'تم تفعيل بطاقة السجدة الكبرى' : 'تم إيقاف بطاقة السجدة الكبرى');
    };

    const handleHideToolbarsToggle = (checked: boolean) => {
        setIsHideToolbarsEnabled(checked);
        localStorage.setItem('hide_toolbars_enabled' + modeSuffix, String(checked));
        window.dispatchEvent(new Event('settings-change'));
        showToast(checked ? 'تم تفعيل إخفاء الأشرطة' : 'تم تعطيل إخفاء الأشرطة');
    };




    const getReaderName = (id: string) => READERS.find(r => r.id === id)?.name || id;
    const getTafseerName = (id: string) => TAFSEERS.find(t => t.id === id)?.name || id;
    const getFontName = (val: string) => {
        const fontMap: Record<string, string> = {
            "var(--font-amiri-quran)": "حفص", "var(--font-amiri)": "نسخ", "var(--font-scheherazade)": "مجود",
            "var(--font-lateef)": "تراثي", "var(--font-harmattan)": "ورش", "var(--font-aref)": "رقعة",
            "var(--font-gulzar)": "نستعليق", "var(--font-kufi)": "كوفي", "var(--font-kufam)": "كوفي حديث",
            "var(--font-noto)": "نسخ حديث", "var(--font-cairo)": "القاهرة", "var(--font-messiri)": "المسيري",
            "var(--font-rakkas)": "رقاص", "var(--font-lalezar)": "لالزار", "var(--font-katibeh)": "قطيبة",
            "var(--font-tajawal)": "تجوّل", "var(--font-changa)": "شنقة", "var(--font-mirza)": "ميرزا",
            "var(--font-qalam)": "قلم", "var(--font-thuluth)": "ثلوث", "var(--font-digital)": "رقمي",
            "'KFGQPC Uthman Taha Naskh'": "مجمع الملك فهد", "'Me Quran'": "خط المصحف"
        };
        return fontMap[val] || "افتراضي";
    };

    return (
        <div className={`fixed inset-0 bg-transparent z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={handleClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md sm:max-w-2xl rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className={`p-3 overflow-y-auto text-center flex-1 ${isLandscape ? 'grid grid-cols-2 gap-x-6 gap-y-2' : 'space-y-2'}`}>
                    <div id="font-size-section" className={`${isLandscape ? 'col-span-2' : ''} border-b pb-2 border-gray-200 dark:border-gray-700 space-y-2`}>
                        <div className="flex items-center justify-between mt-3">
                            <label className="text-sm font-bold opacity-80">حجم الخط</label>
                            <span className="text-xs px-2 rounded themed-card-bg">{settings.fontSize}</span>
                        </div>
                        <input type="range" min="0.5" max="4.5" step="0.1" value={settings.fontSize} onChange={(e) => updateSetting('fontSize', parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    </div>

                    <div id="colors-section" className={`${isLandscape ? 'col-span-2 grid grid-cols-3 gap-3' : 'grid grid-cols-1 gap-3'} border-b pb-2 border-gray-200 dark:border-gray-700`}>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold opacity-80 mb-1">لون النص</label>
                            <div 
                                className={`h-8 w-full rounded border shadow-sm cursor-pointer ${activeColorField === 'textColor' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                style={renderCheckerboard(settings.textColor)}
                                onClick={() => setActiveColorField(activeColorField === 'textColor' ? null : 'textColor')}
                            ></div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold opacity-80 mb-1">لون الخلفية</label>
                            <div 
                                className={`h-8 w-full rounded border shadow-sm cursor-pointer ${activeColorField === 'bgColor' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                style={renderCheckerboard(settings.bgColor)}
                                onClick={() => setActiveColorField(activeColorField === 'bgColor' ? null : 'bgColor')}
                            ></div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold opacity-80">لون التحديد</label>
                            </div>
                            <div 
                                className={`h-8 w-full rounded border shadow-sm cursor-pointer ${activeColorField === 'highlightTextColor' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                style={renderCheckerboard(settings.highlightTextColor || THEMES['olive'].highlightText)}
                                onClick={() => setActiveColorField(activeColorField === 'highlightTextColor' ? null : 'highlightTextColor')}
                            ></div>
                        </div>
                        
                        {activeColorField && (
                            <div className="col-span-full bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200 dark:border-gray-700 mt-2 animate-fadeIn">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        اختر لون {activeColorField === 'bgColor' ? 'الخلفية' : activeColorField === 'textColor' ? 'النص' : 'التحديد'}
                                    </span>
                                    <button onClick={() => setActiveColorField(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                    {PREDEFINED_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateSetting(activeColorField, c)}
                                            className={`h-8 rounded-md border shadow-sm transition-transform hover:scale-110 ${settings[activeColorField] === c ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : 'border-gray-200 dark:border-gray-600'}`}
                                            style={renderCheckerboard(c)}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div id="font-family-section" className="border-b border-gray-200 dark:border-gray-700 py-1">
                        <label className="text-xs font-bold block opacity-80">نوع الخط</label>
                        <div className="mt-1">
                            <button onClick={() => onOpenModal('font-modal')} className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border flex justify-between items-center px-3 font-bold">
                                <span>{getFontName(settings.fontFamily)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50"></i>
                            </button>
                        </div>
                    </div>

                    <div id="reciter-section" className="border-b border-gray-200 dark:border-gray-700 py-1">
                        <label className="text-xs font-bold block opacity-80">القارئ</label>
                        <div className="mt-1">
                            <button onClick={() => onOpenModal('reciter-modal')} className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border flex justify-between items-center px-3 font-bold">
                                <span>{getReaderName(settings.reader)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50"></i>
                            </button>
                        </div>
                    </div>

                    <div id="ayah-repeat-section" className="border-b border-gray-200 dark:border-gray-700 py-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold opacity-80 text-right">تكرار الآية</label>
                            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => updateSetting('ayahRepeatCount', num)}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                            settings.ayahRepeatCount === num 
                                            ? 'theme-accent-btn shadow-md scale-110' 
                                            : 'themed-card-bg border opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        {toArabic(num)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div id="tafseer-section" className="border-b border-gray-200 dark:border-gray-700 py-1">
                        <label className="text-xs font-bold block opacity-80">التفسير</label>
                        <div className="mt-1">
                            <button onClick={() => onOpenModal('tafseer-selection-modal')} className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border flex justify-between items-center px-3 font-bold">
                                <span>{getTafseerName(settings.tafseer)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50"></i>
                            </button>
                        </div>
                    </div>

                    <div id="surah-header-design-section" className="border-b border-gray-200 dark:border-gray-700 py-3">
                        <label className="text-sm font-bold block opacity-80 mb-2 text-right">تصميم رأس السورة</label>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setIsDesignDropdownOpen(!isDesignDropdownOpen)}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 themed-card-bg p-1 flex items-center justify-center relative hover:border-emerald-500 transition-all min-h-[60px]"
                            >
                                <div className="pointer-events-none w-full">
                                    <SurahHeader 
                                        surahNumber={1}
                                        surahName="الفاتحة"
                                        surahType="مكية"
                                        ayahCount={7}
                                        currentTheme={THEMES[settings.theme]}
                                        design={settings.surahHeaderDesign || 1}
                                        compact={true}
                                    />
                                </div>
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-black/80 rounded-full p-1 shadow-sm">
                                    {isDesignDropdownOpen ? <ChevronUp className="w-4 h-4 opacity-70" /> : <ChevronDown className="w-4 h-4 opacity-70" />}
                                </div>
                            </button>

                            {isDesignDropdownOpen && (
                                <div className="absolute z-[200] top-full left-0 right-0 mt-2 themed-card-bg border-2 border-emerald-500 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                                    <div 
                                        ref={designDropdownRef}
                                        className="max-h-80 overflow-y-auto p-2 space-y-2 scrollbar-hide scroll-smooth"
                                    >
                                        {[1, 2, 3, 4, 7, 9, 10, 11, 14, 15, 16, 19, 20].map((design, index) => (
                                            <button
                                                key={design}
                                                ref={(settings.surahHeaderDesign || 1) === design ? activeDesignItemRef : null}
                                                onClick={() => {
                                                    updateSetting('surahHeaderDesign', design);
                                                    setIsDesignDropdownOpen(false);
                                                }}
                                                className={`relative w-full rounded-lg border-2 transition-all overflow-hidden ${
                                                    (settings.surahHeaderDesign || 1) === design 
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                                    : 'border-gray-100 dark:border-gray-800 hover:border-emerald-300'
                                                }`}
                                            >
                                                <div className="pointer-events-none w-full">
                                                    <SurahHeader 
                                                        surahNumber={1}
                                                        surahName="الفاتحة"
                                                        surahType="مكية"
                                                        ayahCount={7}
                                                        currentTheme={THEMES[settings.theme]}
                                                        design={design}
                                                        compact={true}
                                                    />
                                                </div>
                                                <div className="text-center pb-1 text-[10px] font-bold opacity-40">
                                                    تصميم {index + 1}
                                                </div>
                                                {(settings.surahHeaderDesign || 1) === design && (
                                                    <div className="absolute top-1 left-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                                                        <i className="fa-solid fa-check text-[8px]"></i>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div id="scroll-speed-section" className="border-b pb-2 border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex items-center justify-between mt-1">
                            <label className="text-sm font-bold opacity-80">سرعة التمرير</label>
                        </div>
                        <div className="mt-1">
                            <button onClick={() => onOpenModal('scroll-speed-modal')} className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border flex justify-between items-center px-3 font-bold">
                                <span>{settings.scrollMinutes} دقيقة</span>
                                <i className="fa-solid fa-chevron-left opacity-50"></i>
                            </button>
                        </div>
                    </div>

                    <div id="toggles-section" className="space-y-1">
                        <div className="border-b pb-2 border-gray-200 dark:border-gray-700 py-1">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold opacity-80">إظهار بطاقة السجدة</label>
                                <div className="relative inline-block w-10 align-middle select-none">
                                    <input type="checkbox" id="show-sajdah-card" checked={showSajdahCard} onChange={(e) => handleSajdahCardToggle(e.target.checked)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer"/>
                                    <label htmlFor="show-sajdah-card" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${showSajdahCard ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                                </div>
                            </div>
                        </div>
                        <div className="border-b pb-2 border-gray-200 dark:border-gray-700 py-1">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold opacity-80">إخفاء الأشرطة أثناء التمرير</label>
                                <div className="relative inline-block w-10 align-middle select-none">
                                    <input type="checkbox" id="hide-toolbars" checked={isHideToolbarsEnabled} onChange={(e) => handleHideToolbarsToggle(e.target.checked)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer"/>
                                    <label htmlFor="hide-toolbars" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${isHideToolbarsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                                </div>
                            </div>
                        </div>
                        <div className="border-b pb-2 border-gray-200 dark:border-gray-700 py-1">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold opacity-80">إظهار الإطار الخارجي</label>
                                <div className="relative inline-block w-10 align-middle select-none">
                                    <input type="checkbox" id="show-page-border" checked={settings.showPageBorder !== false} onChange={(e) => {
                                        updateSetting('showPageBorder', e.target.checked);
                                        showToast(e.target.checked ? 'تم تفعيل الإطار الخارجي' : 'تم إخفاء الإطار الخارجي');
                                    }} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer"/>
                                    <label htmlFor="show-page-border" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${settings.showPageBorder !== false ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                                </div>
                            </div>
                        </div>
                        <div className="border-b pb-2 border-gray-200 dark:border-gray-700 py-1">
                            <button onClick={() => onOpenModal('notification-settings-modal')} className="w-full flex items-center justify-between py-1">
                                <label className="text-sm font-bold opacity-80 cursor-pointer">الإشعارات</label>
                                <i className="fa-solid fa-bell text-emerald-500"></i>
                            </button>
                        </div>
                    </div>

                    <div id="downloads-section" className="space-y-1">
                        <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                            <div className="custom-select-wrapper">
                                <button id="interface-customization-btn" onClick={() => onOpenModal('toolbar-color-picker-modal')} className="custom-select-display text-xs h-8 w-full text-right px-2 flex items-center justify-between themed-card-bg">
                                    <span>تخصيص الواجهة</span>
                                    <i className="fa-solid fa-chevron-left text-gray-500 text-xs"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div id="downloads-only-section">
                            <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                                <div className="custom-select-wrapper">
                                    <button id="quran-download-btn" onClick={() => { onOpenModal('quran-download-modal'); }} className="custom-select-display text-xs h-8 w-full text-right px-2 flex items-center justify-between themed-card-bg">
                                        <span>تحميل القرآن الكريم</span>
                                        <i className="fa-solid fa-chevron-left text-gray-500 text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                                <div className="custom-select-wrapper">
                                    <button id="tafseer-download-btn" onClick={() => { onOpenModal('tafsir-download-modal'); }} className="custom-select-display text-xs h-8 w-full text-right px-2 flex items-center justify-between themed-card-bg">
                                        <span>تحميل التفسير</span>
                                        <i className="fa-solid fa-chevron-left text-gray-500 text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-3 text-center flex-none themed-card-bg">
                    <button onClick={handleClose} className="theme-accent-btn font-bold py-2 px-8 rounded-lg shadow text-sm w-full">حفظ وإغلاق</button>
                </div>
            </div>
            <TutorialOverlay tutorialId="settings-tutorial" steps={settingsTutorialSteps} />
        </div>
    );
};

export default SettingsModal;