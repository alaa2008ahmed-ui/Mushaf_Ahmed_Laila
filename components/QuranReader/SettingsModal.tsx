import React, { useState, useEffect, useRef } from 'react';
import { READERS, TAFSEERS, THEMES, DEFAULT_SETTINGS, toArabic, ReadingMode, getReadersForMode, getValidReaderForMode, ENGLISH_FONTS } from './constants';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

import SurahHeader from './SurahHeader';

interface SettingsModalProps {
    onClose: () => void;
    onOpenModal: (modalName: string, params?: any) => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
    readingMode: string;
    modeSuffix: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onOpenModal, showToast, isLandscape, readingMode, modeSuffix }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        onClose();
    };

    const formatFontSize = (val: any) => {
        const num = parseFloat(val);
        if (isNaN(num)) return "1.00";
        return num.toFixed(2);
    };

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('quran_settings' + modeSuffix);
        const baseSettings = saved ? JSON.parse(saved) : {};
        if (baseSettings.fontSize !== undefined) {
            baseSettings.fontSize = parseFloat(Number(baseSettings.fontSize).toFixed(2));
        }
        return { ...DEFAULT_SETTINGS, ...baseSettings };
    });
    
    useEffect(() => {
        const handleSettingsUpdate = () => {
            const saved = localStorage.getItem('quran_settings' + modeSuffix);
            const baseSettings = saved ? JSON.parse(saved) : {};
            if (baseSettings.fontSize !== undefined) {
                baseSettings.fontSize = parseFloat(Number(baseSettings.fontSize).toFixed(2));
            }
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

    const activeThemeId = localStorage.getItem('current_theme_id' + modeSuffix) || settings.theme || 'black';
    const modalTheme = THEMES[activeThemeId as keyof typeof THEMES] || THEMES.black;
    const currentDesign = Number(settings.surahHeaderDesign) || 1;

    const [activeColorField, setActiveColorField] = useState<'textColor' | 'bgColor' | 'highlightTextColor' | null>(null);

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




    const effectiveReaderId = getValidReaderForMode(readingMode as ReadingMode, settings.reader);
    const getReaderName = (id: string) => {
        const validId = getValidReaderForMode(readingMode as ReadingMode, id);
        const modeList = getReadersForMode(readingMode as ReadingMode);
        return modeList.find(r => r.id === validId)?.name || READERS.find(r => r.id === validId)?.name || validId;
    };
    const getTafseerName = (id: string) => TAFSEERS.find(t => t.id === id)?.name || id;
    const getFontName = (val: string) => {
        if (readingMode === 'translation') {
            const found = ENGLISH_FONTS.find(f => f.id === val);
            if (found) return found.nameEn || found.name;
            return "EB Garamond (Sacred)";
        }
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
        return fontMap[val] || (isEn ? "Default" : "افتراضي");
    };

    const currentTheme = THEMES[settings.theme] || Object.values(THEMES)[0];

    return (
        <div className="fixed z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden" style={{ top: 0, bottom: 0, left: 0, right: 0 }} dir="rtl" onClick={handleClose}>
            <div className="w-full h-full flex flex-col overflow-hidden shadow-none border-[4px]" style={{ backgroundColor: currentTheme.bg || '#ffffff', borderColor: currentTheme.accent || '#3b82f6' }} onClick={e => e.stopPropagation()}>
                <div className="flex-1 w-full flex flex-col overflow-hidden" style={{ color: currentTheme.text || '#000000' }}>
                    
                    {/* Full Screen Modal Header */}
                    <div className="p-3 border-b flex items-center justify-center shrink-0" style={{ backgroundColor: currentTheme.bg || '#ffffff', borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
                        <h3 
                            className="text-sm font-extrabold px-6 py-1.5 rounded-xl border-2 border-gray-800 dark:border-gray-200 themed-card-bg shadow-sm inline-flex items-center justify-center tracking-wide" 
                            style={{ color: currentTheme.text }}
                        >
                            {isEn ? "Settings" : "الإعدادات"}
                        </h3>
                    </div>

                    <div className={`p-3 overflow-y-auto text-center flex-1 scrollbar-hide ${isLandscape ? 'grid grid-cols-2 gap-x-6 gap-y-2' : 'space-y-2'}`}>
                    {/* خامسا: صف موحد يجمع حجم الخط مع سماكة الخط وتخصيص الخط */}
                    <div id="font-controls-row" className={`${isLandscape ? 'col-span-2' : ''} p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 themed-card-bg space-y-2`}>
                        <div className="grid grid-cols-12 gap-2 items-center">
                            {/* حجم الخط: يأخذ النصف الأول من الصف */}
                            <div id="font-size-section" className="col-span-6 flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold opacity-80">{isEn ? "Font Size" : "حجم الخط"}</label>
                                    <span className="text-[11px] px-1.5 py-0.2 rounded border border-gray-200 dark:border-gray-600 font-bold bg-white/50 dark:bg-gray-800/50">{formatFontSize(settings.fontSize)}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="4.5" 
                                    step="0.05" 
                                    value={parseFloat(formatFontSize(settings.fontSize))} 
                                    onChange={(e) => updateSetting('fontSize', parseFloat(parseFloat(e.target.value).toFixed(2)))} 
                                    className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" 
                                    style={{ accentColor: 'var(--qr-accent)' }} 
                                />
                            </div>

                            {/* سماكة الخط وتخصيص الخط: تأخذ النصف الثاني من الصف */}
                            <div id="font-family-section" className="col-span-6 flex flex-col justify-center">
                                <label className="text-xs font-bold block opacity-80 mb-1 text-right">
                                    {readingMode === 'translation' ? (isEn ? "English Font" : "الخط الإنجليزي") : (isEn ? "Font" : "تخصيص الخط")}
                                </label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    <button 
                                        id="font-weight-btn" 
                                        onClick={() => updateSetting('isBold', !settings.isBold)} 
                                        className={`col-span-2 p-1 text-[11px] h-7 rounded-lg border border-gray-400 dark:border-gray-500 flex justify-center items-center font-bold transition-all ${settings.isBold ? 'bg-indigo-50 text-indigo-700 border-indigo-400 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-600' : 'themed-card-bg'}`} 
                                        title={isEn ? "Toggle bold font weight" : "تفعيل/إلغاء سماكة الخط (Bold)"}
                                    >
                                        <span className={`${settings.isBold ? 'font-black' : ''}`}>{isEn ? "Bold (B)" : "سماكة (B)"}</span>
                                    </button>
                                    <button 
                                        id="font-family-btn" 
                                        onClick={() => onOpenModal('font-modal')} 
                                        className="col-span-3 p-1 text-[11px] h-7 themed-card-bg rounded-lg border border-gray-400 dark:border-gray-500 flex justify-between items-center px-2 font-bold"
                                    >
                                        <span className="truncate">{getFontName(settings.fontFamily)}</span>
                                        <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[9px]"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ثانيا: بطاقة الألوان الثلاثة في صف واحد مدمج مع إطار كامل حول كل لون */}
                    <div id="colors-section" className={`${isLandscape ? 'col-span-2' : ''} p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 themed-card-bg`}>
                        <div className="grid grid-cols-3 gap-2">
                            {/* لون النص */}
                            <div className="flex flex-col items-center">
                                <label className="text-[11px] font-bold opacity-80 mb-1 truncate w-full text-center">
                                    {isEn ? "Text Color" : "لون النص"}
                                </label>
                                <div 
                                    className={`h-7 sm:h-8 w-full rounded-lg border-[1.5px] shadow-sm cursor-pointer transition-all active:scale-95 ${activeColorField === 'textColor' ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-800 dark:border-gray-200'}`}
                                    style={renderCheckerboard(settings.textColor)}
                                    onClick={() => setActiveColorField(activeColorField === 'textColor' ? null : 'textColor')}
                                    title={isEn ? "Text Color" : "لون النص"}
                                ></div>
                            </div>

                            {/* لون الخلفية */}
                            <div className="flex flex-col items-center">
                                <label className="text-[11px] font-bold opacity-80 mb-1 truncate w-full text-center">
                                    {isEn ? "Background" : "لون الخلفية"}
                                </label>
                                <div 
                                    className={`h-7 sm:h-8 w-full rounded-lg border-[1.5px] shadow-sm cursor-pointer transition-all active:scale-95 ${activeColorField === 'bgColor' ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-800 dark:border-gray-200'}`}
                                    style={renderCheckerboard(settings.bgColor)}
                                    onClick={() => setActiveColorField(activeColorField === 'bgColor' ? null : 'bgColor')}
                                    title={isEn ? "Background Color" : "لون الخلفية"}
                                ></div>
                            </div>

                            {/* لون التحديد */}
                            <div className="flex flex-col items-center">
                                <label className="text-[11px] font-bold opacity-80 mb-1 truncate w-full text-center">
                                    {isEn ? "Highlight" : "لون التحديد"}
                                </label>
                                <div 
                                    className={`h-7 sm:h-8 w-full rounded-lg border-[1.5px] shadow-sm cursor-pointer transition-all active:scale-95 ${activeColorField === 'highlightTextColor' ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-800 dark:border-gray-200'}`}
                                    style={renderCheckerboard(settings.highlightTextColor || THEMES['olive'].highlightText)}
                                    onClick={() => setActiveColorField(activeColorField === 'highlightTextColor' ? null : 'highlightTextColor')}
                                    title={isEn ? "Highlight Color" : "لون التحديد"}
                                ></div>
                            </div>
                        </div>
                        
                        {activeColorField && (
                            <div className="bg-gray-50 dark:bg-gray-800/90 p-3 rounded-xl border border-gray-200 dark:border-gray-700 mt-2.5 animate-fadeIn">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {isEn 
                                            ? `Select ${activeColorField === 'bgColor' ? 'Background' : activeColorField === 'textColor' ? 'Text' : 'Highlight'} Color` 
                                            : `اختر لون ${activeColorField === 'bgColor' ? 'الخلفية' : activeColorField === 'textColor' ? 'النص' : 'التحديد'}`
                                        }
                                    </span>
                                    <button onClick={() => setActiveColorField(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                        <i className="fa-solid fa-times text-xs"></i>
                                    </button>
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                    {PREDEFINED_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateSetting(activeColorField, c)}
                                            className={`h-7 rounded-md border shadow-sm transition-transform hover:scale-110 ${settings[activeColorField] === c ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : 'border-gray-200 dark:border-gray-600'}`}
                                            style={renderCheckerboard(c)}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* أولاً: بطاقة القارئ وبطاقة التفسير في صف واحد فقط */}
                    <div id="reciter-tafseer-row" className="grid grid-cols-2 gap-2 border-b border-gray-200 dark:border-gray-700 py-1">
                        <div id="reciter-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold block opacity-80 mb-1">{isEn ? "Reciter" : "القارئ"}</label>
                            <button 
                                onClick={() => onOpenModal('reciter-modal')} 
                                className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600 flex justify-between items-center px-2.5 font-bold"
                            >
                                <span className="truncate">{getReaderName(settings.reader)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[10px]"></i>
                            </button>
                        </div>
                        <div id="tafseer-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold block opacity-80 mb-1">{isEn ? "Tafseer" : "التفسير"}</label>
                            <button 
                                onClick={() => onOpenModal('tafseer-selection-modal')} 
                                className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600 flex justify-between items-center px-2.5 font-bold"
                            >
                                <span className="truncate">{getTafseerName(settings.tafseer)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[10px]"></i>
                            </button>
                        </div>
                    </div>

                    {/* وضع بطاقتي تكرار الآية والإشعارات في صف واحد مع إحاطة كل منهما بإطار */}
                    <div id="repeat-and-notifications-row" className="grid grid-cols-2 gap-2 border-b border-gray-200 dark:border-gray-700 py-1 pb-2">
                        {/* تكرار الآية */}
                        <div id="ayah-repeat-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold opacity-80 mb-1 truncate">{isEn ? "Ayah Repeat" : "تكرار الآية"}</label>
                            <div className="h-8 flex items-center justify-around px-1.5 themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => updateSetting('ayahRepeatCount', num)}
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                            settings.ayahRepeatCount === num 
                                            ? 'theme-accent-btn shadow-sm scale-110 font-black' 
                                            : 'opacity-60 hover:opacity-100'
                                        }`}
                                        title={`${isEn ? "Repeat" : "تكرار"} ${num}`}
                                    >
                                        {toArabic(num)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* الإشعارات */}
                        <div id="notifications-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold opacity-80 mb-1 truncate">{isEn ? "Notifications" : "الإشعارات"}</label>
                            <button 
                                onClick={() => onOpenModal('notification-settings-modal')} 
                                className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600 flex justify-between items-center px-2.5 font-bold"
                            >
                                <span className="flex items-center gap-1.5 truncate">
                                    <i className="fa-solid fa-bell text-[11px]" style={{ color: 'var(--qr-accent)' }}></i>
                                    <span className="truncate">{isEn ? "Settings" : "إعدادات التنبيه"}</span>
                                </span>
                                <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[10px]"></i>
                            </button>
                        </div>
                    </div>

                    {/* تصميم رأس السورة */}
                    <div id="surah-header-design-section" className="border-b border-gray-200 dark:border-gray-700 py-2">
                        <label className="text-xs font-bold block opacity-80 mb-1 text-right">
                            {isEn ? "Surah Header Design" : "تصميم رأس السورة"}
                        </label>
                        <div className="mt-1">
                            <button 
                                type="button"
                                onClick={() => onOpenModal('surah-design-picker')} 
                                className="w-full themed-card-bg rounded-xl border-2 p-1.5 transition-all relative overflow-hidden active:scale-[0.98] hover:border-indigo-400 group flex items-center justify-center"
                                style={{ borderColor: 'var(--qr-accent)' }}
                                title={isEn ? "Choose Surah Header Design" : "اختيار تصميم رأس السورة"}
                            >
                                <div className="pointer-events-none w-full">
                                    <SurahHeader 
                                        surahNumber={1}
                                        surahName="الفاتحة"
                                        surahType="مكية"
                                        ayahCount={7}
                                        currentTheme={modalTheme}
                                        design={currentDesign}
                                        compact={true}
                                    />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* رابعا: وضع إخفاء الأشرطة بنفس صف بطاقة سرعة التمرير */}
                    <div id="scroll-speed-and-hide-toolbars-row" className="grid grid-cols-2 gap-2 border-b pb-2 border-gray-200 dark:border-gray-700 py-1">
                        {/* سرعة التمرير */}
                        <div id="scroll-speed-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold opacity-80 mb-1">{isEn ? "Scroll Speed" : "سرعة التمرير"}</label>
                            <button 
                                onClick={() => onOpenModal('scroll-speed-modal')} 
                                className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600 flex justify-between items-center px-2.5 font-bold"
                            >
                                <span>{settings.scrollMinutes} {isEn ? "min" : "دقيقة"}</span>
                                <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[10px]"></i>
                            </button>
                        </div>

                        {/* إخفاء الأشرطة */}
                        <div id="hide-toolbars-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold opacity-80 mb-1">{isEn ? "Hide Toolbars" : "إخفاء الأشرطة"}</label>
                            <div className="h-8 flex items-center justify-between px-2.5 themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600">
                                <span className="text-[11px] opacity-70 font-semibold">{isHideToolbarsEnabled ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
                                <div className="relative inline-block w-8 align-middle select-none">
                                    <input 
                                        type="checkbox" 
                                        id="hide-toolbars" 
                                        checked={isHideToolbarsEnabled} 
                                        onChange={(e) => handleHideToolbarsToggle(e.target.checked)} 
                                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                                    />
                                    <label 
                                        htmlFor="hide-toolbars" 
                                        className="toggle-label block overflow-hidden h-4 rounded-full cursor-pointer" 
                                        style={{ backgroundColor: isHideToolbarsEnabled ? 'var(--qr-accent)' : '#d1d5db' }}
                                    ></label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div id="toggles-section">
                            {/* بطاقتي إظهار بطاقة السجدة وإظهار الإطار الخارجي في صف واحد بإطار لكل بطاقة */}
                            <div id="sajdah-and-page-border-row" className="grid grid-cols-2 gap-2 border-b pb-2 border-gray-200 dark:border-gray-700 py-1">
                                {/* بطاقة السجدة */}
                                <div id="sajdah-section" className="flex flex-col text-right">
                                    <label className="text-xs font-bold opacity-80 mb-1 truncate">{isEn ? "Show Sajdah Card" : "إظهار بطاقة السجدة"}</label>
                                    <div className="h-8 flex items-center justify-between px-2.5 themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600">
                                        <span className="text-[11px] opacity-70 font-semibold">{showSajdahCard ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
                                        <div className="relative inline-block w-8 align-middle select-none">
                                            <input 
                                                type="checkbox" 
                                                id="show-sajdah-card" 
                                                checked={showSajdahCard} 
                                                onChange={(e) => handleSajdahCardToggle(e.target.checked)} 
                                                className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                                            />
                                            <label 
                                                htmlFor="show-sajdah-card" 
                                                className="toggle-label block overflow-hidden h-4 rounded-full cursor-pointer" 
                                                style={{ backgroundColor: showSajdahCard ? 'var(--qr-accent)' : '#d1d5db' }}
                                            ></label>
                                        </div>
                                    </div>
                                </div>

                                {/* الإطار الخارجي */}
                                <div id="page-border-section" className="flex flex-col text-right">
                                    <label className="text-xs font-bold opacity-80 mb-1 truncate">{isEn ? "Show Page Border" : "إظهار الإطار الخارجي"}</label>
                                    <div className="h-8 flex items-center justify-between px-2.5 themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600">
                                        <span className="text-[11px] opacity-70 font-semibold">{settings.showPageBorder !== false ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
                                        <div className="relative inline-block w-8 align-middle select-none">
                                            <input 
                                                type="checkbox" 
                                                id="show-page-border" 
                                                checked={settings.showPageBorder !== false} 
                                                onChange={(e) => {
                                                    updateSetting('showPageBorder', e.target.checked);
                                                    showToast(e.target.checked ? (isEn ? 'Page border enabled' : 'تم تفعيل الإطار الخارجي') : (isEn ? 'Page border hidden' : 'تم إخفاء الإطار الخارجي'));
                                                }} 
                                                className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                                            />
                                            <label 
                                                htmlFor="show-page-border" 
                                                className="toggle-label block overflow-hidden h-4 rounded-full cursor-pointer" 
                                                style={{ backgroundColor: settings.showPageBorder !== false ? 'var(--qr-accent)' : '#d1d5db' }}
                                            ></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="downloads-section" className="space-y-1">
                        <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                            <div className="custom-select-wrapper">
                                <button id="interface-customization-btn" onClick={() => onOpenModal('toolbar-color-picker-modal')} className="custom-select-display text-xs h-8 w-full text-right px-2 flex items-center justify-between themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600 font-bold">
                                    <span>{isEn ? "Customize Interface" : "تخصيص الواجهة"}</span>
                                    <i className="fa-solid fa-chevron-left text-gray-500 text-xs"></i>
                                </button>
                            </div>
                        </div>
                        
                        {/* ثالثا: وضع بطاقة تحميل القرآن الكريم وبطاقة تحميل التفسير في صف واحد */}
                        <div id="downloads-only-section" className="border-b border-gray-200 dark:border-gray-700 py-1">
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    id="quran-download-btn" 
                                    onClick={() => { onOpenModal('quran-download-modal'); }} 
                                    className="custom-select-display text-xs h-8 w-full text-right px-2.5 flex items-center justify-between themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600 font-bold"
                                >
                                    <span className="truncate">{isEn ? "Download Quran" : "تحميل القرآن الكريم"}</span>
                                    <i className="fa-solid fa-chevron-left text-gray-500 text-xs shrink-0"></i>
                                </button>
                                
                                <button 
                                    id="tafseer-download-btn" 
                                    onClick={() => { onOpenModal('tafsir-download-modal'); }} 
                                    className="custom-select-display text-xs h-8 w-full text-right px-2.5 flex items-center justify-between themed-card-bg rounded-lg border border-gray-300 dark:border-gray-600 font-bold"
                                >
                                    <span className="truncate">{isEn ? "Download Tafseer" : "تحميل التفسير"}</span>
                                    <i className="fa-solid fa-chevron-left text-gray-500 text-xs shrink-0"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                <div className="p-3 border-t flex gap-2 shrink-0 z-10" style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={handleClose}
                        className="flex-1 py-4 rounded-xl text-xs font-bold w-full transition-all shadow-md active:scale-95 border-[2px]"
                        style={{ backgroundColor: currentTheme.btnBg || (currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : '#ffffff'), color: currentTheme.btnText || currentTheme.text, borderColor: currentTheme.accent || '#3b82f6' }}
                    >
                        رجوع
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;