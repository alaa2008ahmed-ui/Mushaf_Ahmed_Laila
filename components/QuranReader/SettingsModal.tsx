import React, { useState, useEffect, useRef } from 'react';
import { READERS, TAFSEERS, THEMES, DEFAULT_SETTINGS, toArabic, isDarkQuranTheme, ReadingMode, getReadersForMode, getValidReaderForMode, ENGLISH_FONTS, getTafseerDisplayName, WORD_HIGHLIGHT_COLOR_OPTIONS, getEffectiveWordHighlightColor } from './constants';
import { getQuranThemeIdForLayout } from '../../utils/quranThemeHelper';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getReciterDisplayName } from '../../utils/listenQuranTranslations';

import SurahHeader from './SurahHeader';
import { getClusterForLanguage, syncClusterSettings } from '../../utils/quranClusterSync';
import { registerBackInterceptor } from '../../hooks/useBackButton';

interface SettingsModalProps {
    onClose: () => void;
    onOpenModal?: (modalName: string, params?: any) => void;
    showToast?: (msg: string) => void;
    isLandscape?: boolean;
    readingMode?: string;
    modeSuffix?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    onClose, 
    onOpenModal = () => {}, 
    showToast = () => {}, 
    isLandscape = false, 
    readingMode = 'mushaf', 
    modeSuffix = '' 
}) => {
    const { language } = useLanguage();
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const isEn = language === 'en';
    const [isClosing, setIsClosing] = useState(false);

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    const handleClose = () => {
        onCloseRef.current();
    };

    useEffect(() => {
        const interceptor = () => {
            onCloseRef.current();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, []);

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
        const resolved = { ...DEFAULT_SETTINGS, ...baseSettings };
        if (resolved.theme === 'deep_black' && resolved.textColor?.toLowerCase() === '#f59e0b') {
            resolved.textColor = '#ffffff';
        }
        return resolved;
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

    const activeThemeId = getQuranThemeIdForLayout(modeSuffix, undefined, readingMode) || settings.theme || 'black';
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

    const cluster = getClusterForLanguage(language);

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
        syncClusterSettings(cluster, newSettings, isLandscape);
    };

    const handleSajdahCardToggle = (checked: boolean) => {
        setShowSajdahCard(checked);
        localStorage.setItem('show_sajdah_card' + modeSuffix, String(checked));
        window.dispatchEvent(new Event('settings-change'));
        showToast(checked ? (isEn ? 'Sajdah card enabled' : 'تم تفعيل بطاقة السجدة الكبرى') : (isEn ? 'Sajdah card disabled' : 'تم إيقاف بطاقة السجدة الكبرى'));
    };

    const handleHideToolbarsToggle = (checked: boolean) => {
        setIsHideToolbarsEnabled(checked);
        localStorage.setItem('hide_toolbars_enabled' + modeSuffix, String(checked));
        window.dispatchEvent(new Event('settings-change'));
        showToast(checked ? (isEn ? 'Hide toolbars enabled' : 'تم تفعيل إخفاء الأشرطة') : (isEn ? 'Hide toolbars disabled' : 'تم تعطيل إخفاء الأشرطة'));
    };




    const effectiveReaderId = getValidReaderForMode(readingMode as ReadingMode, settings.reader);
    const getReaderName = (id: string) => {
        const validId = getValidReaderForMode(readingMode as ReadingMode, id);
        const modeList = getReadersForMode(readingMode as ReadingMode);
        const readerObj = modeList.find(r => r.id === validId) || READERS.find(r => r.id === validId);
        if (isEn) {
            return getReciterDisplayName(validId, 'en', readerObj?.name || validId);
        }
        return readerObj?.name || validId;
    };
    const getTafseerName = (id: string) => getTafseerDisplayName(id, isEn ? 'en' : 'ar');
    const getFontName = (val: string) => {
        if (readingMode === 'translation') {
            const found = ENGLISH_FONTS.find(f => f.id === val);
            if (found) return found.nameEn || found.name;
            return "EB Garamond (Sacred)";
        }
        const fontMap: Record<string, string> = {
            "var(--font-amiri-quran)": isEn ? "Hafs" : "حفص", "var(--font-amiri)": isEn ? "Naskh" : "نسخ", "var(--font-scheherazade)": isEn ? "Mujawwad" : "مجود",
            "var(--font-lateef)": isEn ? "Traditional" : "تراثي", "var(--font-harmattan)": isEn ? "Warsh" : "ورش", "var(--font-aref)": isEn ? "Ruq'ah" : "رقعة",
            "var(--font-gulzar)": isEn ? "Nasta'liq" : "نستعليق", "var(--font-kufi)": isEn ? "Kufi" : "كوفي", "var(--font-kufam)": isEn ? "Modern Kufi" : "كوفي حديث",
            "var(--font-noto)": isEn ? "Modern Naskh" : "نسخ حديث", "var(--font-cairo)": isEn ? "Cairo" : "القاهرة", "var(--font-messiri)": isEn ? "El Messiri" : "المسيري",
            "var(--font-rakkas)": isEn ? "Rakkas" : "رقاص", "var(--font-lalezar)": isEn ? "Lalezar" : "لالزار", "var(--font-katibeh)": isEn ? "Katibeh" : "قطيبة",
            "var(--font-tajawal)": isEn ? "Tajawal" : "تجوّل", "var(--font-changa)": isEn ? "Changa" : "شنقة", "var(--font-mirza)": isEn ? "Mirza" : "ميرزا",
            "var(--font-qalam)": isEn ? "Qalam" : "قلم", "var(--font-thuluth)": isEn ? "Thuluth" : "ثلوث", "var(--font-digital)": isEn ? "Digital" : "رقمي",
            "'KFGQPC Uthman Taha Naskh'": isEn ? "King Fahd Complex" : "مجمع الملك فهد", "'Me Quran'": isEn ? "Mushaf Font" : "خط المصحف"
        };
        return fontMap[val] || (isEn ? "Default" : "افتراضي");
    };

    const currentTheme = modalTheme || THEMES[settings.theme as keyof typeof THEMES] || Object.values(THEMES)[0];
    const isBlackTheme = isNightMode || themeKey === 'deep_black' || theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';
    const isDarkTheme = isDarkQuranTheme(currentTheme) || isBlackTheme;

    const pageBgColor = isBlackTheme
        ? '#000000'
        : (theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff'
            ? theme.bgColor
            : (homeThemeVariant === 'sky'
                ? '#F0F9FF'
                : (homeThemeVariant === 'emerald'
                    ? '#F0FDF4'
                    : (homeThemeVariant === 'burgundy'
                        ? '#FFF1F2'
                        : '#FEF9C3'))));

    const resolvedPageBg = (!modeSuffix || !currentTheme.bg || currentTheme.bg.toLowerCase() === '#ffffff')
        ? pageBgColor
        : currentTheme.bg;
<<<<<<< HEAD

    const cardSurfaceBg = isDarkTheme
        ? (currentTheme?.cardBg && !currentTheme.cardBg.startsWith('rgba') ? currentTheme.cardBg : '#1E293B')
        : '#ffffff';
    const btnSurfaceBg = isDarkTheme
        ? (currentTheme?.btnBg && !currentTheme.btnBg.startsWith('rgba') ? currentTheme.btnBg : '#1E293B')
        : '#ffffff';
    const toggleKnobShadow = '0 2px 4px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.95)';

    return (
        <div 
            className={`fixed inset-0 z-[1200] flex flex-col font-cairo select-none overflow-hidden animate-fadeIn settings-3d-adia-scope ${isDarkTheme ? 'settings-3d-dark' : ''}`} 
=======

    return (
        <div 
            className="fixed inset-0 z-[1200] flex flex-col font-cairo select-none overflow-hidden animate-fadeIn" 
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
            dir={isEn ? "ltr" : "rtl"} 
            style={{ backgroundColor: resolvedPageBg }}
        >
            {/* Standard Page Header - Identical to Adia and all pages */}
            <header className="app-top-bar settings-top-bar shrink-0 w-full" dir={isEn ? 'ltr' : 'rtl'} style={{ display: 'block' }}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back button */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Go Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Title in center */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {isEn ? 'Quran Page Settings' : 'إعدادات صفحة القرآن'}
                            </h1>
                        </div>

                        {/* Home button */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Home" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden max-w-2xl mx-auto" style={{ color: isBlackTheme ? '#ffffff' : (currentTheme.text || '#000000') }}>
                <div 
<<<<<<< HEAD
                    className={`p-3.5 sm:p-4 overflow-y-auto text-center flex-1 min-h-0 app-scroll-safe scrollbar-hide ${isLandscape ? 'grid grid-cols-2 gap-x-6 gap-y-4' : 'space-y-4'}`}
=======
                    className={`p-3 sm:p-4 overflow-y-auto text-center flex-1 min-h-0 app-scroll-safe scrollbar-hide ${isLandscape ? 'grid grid-cols-2 gap-x-6 gap-y-3' : 'space-y-3'}`}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                >
                    {/* حجم الخط: صف كامل مستقل */}
                    <div id="font-size-row" className={`${isLandscape ? 'col-span-2' : ''} p-3.5 rounded-2xl app-page-card border-0 overflow-visible`} style={{ backgroundColor: cardSurfaceBg }}>
                        <div id="font-size-section" className="w-full flex flex-col justify-center overflow-visible">
                            <div className="flex items-center justify-between mb-2.5 overflow-visible">
                                <label className="text-xs font-bold opacity-85">{isEn ? "Font Size" : "حجم الخط"}</label>
                                <span className="text-[11px] px-3 py-1 rounded-xl app-page-card border-0 font-bold" style={{ backgroundColor: btnSurfaceBg }}>{formatFontSize(settings.fontSize)}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.5" 
                                max="4.5" 
                                step="0.05" 
                                value={parseFloat(formatFontSize(settings.fontSize))} 
                                onChange={(e) => {
                                    const val = parseFloat(parseFloat(e.target.value).toFixed(2));
                                    updateSetting('fontSize', val);
                                    showToast(isEn ? `Font size: ${val}` : `حجم الخط: ${val}`);
                                }} 
<<<<<<< HEAD
                                className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" 
=======
                                className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" 
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                style={{ accentColor: currentTheme?.id === 'deep_black' ? '#ffffff' : (currentTheme?.accent || 'var(--qr-accent)') }} 
                            />
                        </div>
                    </div>

                    {/* تخصيص الخط: صف كامل مستقل أسفل حجم الخط */}
                    <div id="font-family-row" className={`${isLandscape ? 'col-span-2' : ''} p-3.5 pb-4 rounded-2xl app-page-card border-0 overflow-visible`} style={{ backgroundColor: cardSurfaceBg }}>
                        <div id="font-family-section" className="w-full flex flex-col justify-center overflow-visible">
                            <label className="text-xs font-bold block opacity-85 mb-2.5">
                                {readingMode === 'translation' ? (isEn ? "English Font" : "الخط الإنجليزي") : (isEn ? "Font Customization" : "تخصيص الخط")}
                            </label>
                            <div className="grid grid-cols-12 gap-2.5 items-center overflow-visible">
                                <button 
                                    type="button"
                                    id="font-weight-btn" 
                                    onClick={() => {
                                        const nextBold = !settings.isBold;
                                        updateSetting('isBold', nextBold);
                                        showToast(nextBold ? (isEn ? 'Bold font enabled' : 'تم تفعيل سماكة الخط') : (isEn ? 'Bold font disabled' : 'تم إيقاف سماكة الخط'));
                                    }} 
<<<<<<< HEAD
                                    className={`col-span-4 p-1.5 text-xs h-10 rounded-xl app-page-card border-0 flex justify-center items-center font-bold transition-all cursor-pointer ${settings.isBold ? 'text-white' : ''}`} 
=======
                                    className={`col-span-4 p-1.5 text-xs h-9 rounded-xl flex justify-center items-center font-bold transition-all border-0 cursor-pointer ${settings.isBold ? 'quran-raised-btn-selected text-white' : 'quran-raised-btn'}`} 
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    style={{ 
                                        backgroundColor: settings.isBold ? (currentTheme?.accent || '#10b981') : btnSurfaceBg,
                                        color: settings.isBold ? '#ffffff' : (isDarkTheme ? '#ffffff' : currentTheme?.text),
                                    }}
                                    title={isEn ? "Toggle bold font weight" : "تفعيل/إلغاء سماكة الخط (Bold)"}
                                >
                                    <span className={`${settings.isBold ? 'font-black' : ''}`}>{isEn ? "Bold" : "سماكة"}</span>
                                </button>
                                <button 
                                    type="button"
                                    id="font-family-btn" 
                                    onClick={() => onOpenModal('font-modal')} 
<<<<<<< HEAD
                                    className="col-span-8 p-1.5 text-xs h-10 rounded-xl app-page-card border-0 flex justify-center items-center px-3 font-bold cursor-pointer"
=======
                                    className="col-span-8 p-1.5 text-xs h-9 rounded-xl quran-raised-btn flex justify-center items-center px-3 font-bold border-0 cursor-pointer"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    style={{ 
                                        backgroundColor: btnSurfaceBg,
                                        color: isDarkTheme ? '#ffffff' : currentTheme?.text,
                                    }}
                                >
                                    <span className="truncate text-center">{getFontName(settings.fontFamily)}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ثانيا: بطاقة الألوان الثلاثة في صف واحد مدمج */}
                    <div id="colors-section" className={`${isLandscape ? 'col-span-2' : ''} p-3.5 pb-4 rounded-2xl app-page-card border-0 overflow-visible`} style={{ backgroundColor: cardSurfaceBg }}>
                        <div className="grid grid-cols-3 gap-2.5 overflow-visible">
                            {/* لون النص */}
                            <div className="flex flex-col items-center overflow-visible">
                                <label className="text-[11px] font-bold opacity-85 mb-1.5 truncate w-full text-center">
                                    {isEn ? "Text Color" : "لون النص"}
                                </label>
                                <div 
                                    role="button"
                                    tabIndex={0}
                                    className={`h-9 w-full rounded-xl app-page-card tasbeeh-inner-pressable border-0 cursor-pointer transition-all ${activeColorField === 'textColor' ? 'ring-2 ring-emerald-500 scale-105' : ''}`}
                                    style={{ ...renderCheckerboard(settings.textColor) }}
                                    onClick={() => setActiveColorField(activeColorField === 'textColor' ? null : 'textColor')}
                                    title={isEn ? "Text Color" : "لون النص"}
                                ></div>
                            </div>

                            {/* لون الخلفية */}
                            <div className="flex flex-col items-center overflow-visible">
                                <label className="text-[11px] font-bold opacity-85 mb-1.5 truncate w-full text-center">
                                    {isEn ? "Background" : "لون الخلفية"}
                                </label>
                                <div 
                                    role="button"
                                    tabIndex={0}
                                    className={`h-9 w-full rounded-xl app-page-card tasbeeh-inner-pressable border-0 cursor-pointer transition-all ${activeColorField === 'bgColor' ? 'ring-2 ring-emerald-500 scale-105' : ''}`}
                                    style={{ ...renderCheckerboard(settings.bgColor) }}
                                    onClick={() => setActiveColorField(activeColorField === 'bgColor' ? null : 'bgColor')}
                                    title={isEn ? "Background Color" : "لون الخلفية"}
                                ></div>
                            </div>

                            {/* لون التحديد */}
                            <div className="flex flex-col items-center overflow-visible">
                                <label className="text-[11px] font-bold opacity-85 mb-1.5 truncate w-full text-center">
                                    {isEn ? "Highlight" : "لون التحديد"}
                                </label>
                                <div 
                                    role="button"
                                    tabIndex={0}
                                    className={`h-9 w-full rounded-xl app-page-card tasbeeh-inner-pressable border-0 cursor-pointer transition-all ${activeColorField === 'highlightTextColor' ? 'ring-2 ring-emerald-500 scale-105' : ''}`}
                                    style={{ ...renderCheckerboard(settings.highlightTextColor || THEMES['olive'].highlightText) }}
                                    onClick={() => setActiveColorField(activeColorField === 'highlightTextColor' ? null : 'highlightTextColor')}
                                    title={isEn ? "Highlight Color" : "لون التحديد"}
                                ></div>
                            </div>
                        </div>
                        
                        {activeColorField && (
                            <div className="p-3.5 pb-4 rounded-2xl app-page-card border-0 mt-4 animate-fadeIn overflow-visible" style={{ backgroundColor: cardSurfaceBg }}>
                                <div className="flex justify-between items-center mb-2.5 overflow-visible">
                                    <span className="text-xs font-bold" style={{ color: isDarkTheme ? '#ffffff' : currentTheme?.text }}>
                                        {isEn 
                                            ? `Select ${activeColorField === 'bgColor' ? 'Background' : activeColorField === 'textColor' ? 'Text' : 'Highlight'} Color` 
                                            : `اختر لون ${activeColorField === 'bgColor' ? 'الخلفية' : activeColorField === 'textColor' ? 'النص' : 'التحديد'}`
                                        }
                                    </span>
                                    <button type="button" onClick={() => setActiveColorField(null)} className="app-page-card border-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ backgroundColor: btnSurfaceBg }}>
                                        <i className="fa-solid fa-times text-xs quran-3d-icon"></i>
                                    </button>
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5 overflow-visible">
                                    {PREDEFINED_COLORS.map(c => (
                                        <button
                                            type="button"
                                            key={c}
                                            onClick={() => {
                                                updateSetting(activeColorField, c);
                                                const fieldAr: Record<string, string> = { textColor: 'لون النص', bgColor: 'لون الخلفية', highlightTextColor: 'لون التحديد' };
                                                const fieldEn: Record<string, string> = { textColor: 'Text Color', bgColor: 'Background Color', highlightTextColor: 'Highlight Color' };
                                                const fieldName = isEn ? fieldEn[activeColorField] : fieldAr[activeColorField];
                                                showToast(isEn ? `${fieldName} updated` : `تم تغيير ${fieldName}`);
                                            }}
<<<<<<< HEAD
                                            className={`h-8 rounded-xl app-page-card border-0 transition-transform cursor-pointer ${settings[activeColorField] === c ? 'ring-2 ring-emerald-500 scale-110' : ''}`}
                                            style={{ ...renderCheckerboard(c) }}
=======
                                            className={`h-7 rounded-xl quran-raised-btn border-0 transition-transform ${settings[activeColorField] === c ? 'ring-2 ring-emerald-500 scale-110' : ''}`}
                                            style={{ ...renderCheckerboard(c), border: 'none' }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* أولاً: بطاقة القارئ وبطاقة التفسير في صف واحد */}
                    <div id="reciter-tafseer-row" className="grid grid-cols-2 gap-3 py-0.5 overflow-visible">
                        <div id="reciter-section" className={`flex flex-col ${isEn ? 'text-left' : 'text-right'} overflow-visible`}>
                            <label className="text-xs font-bold block opacity-85 mb-1.5">{isEn ? "Reciter" : "القارئ"}</label>
                            <button 
                                type="button"
                                onClick={() => onOpenModal('reciter-modal')} 
<<<<<<< HEAD
                                className="w-full p-2.5 text-xs h-10 rounded-2xl app-page-card border-0 flex justify-center items-center px-3 font-bold cursor-pointer"
=======
                                className="w-full p-2.5 text-xs h-9 rounded-xl quran-raised-btn flex justify-center items-center px-3 font-bold border-0"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                style={{ 
                                    backgroundColor: btnSurfaceBg, 
                                    color: isDarkTheme ? (currentTheme?.btnText || currentTheme?.text || '#ffffff') : currentTheme?.text, 
                                }}
                            >
                                <span className="truncate text-center">{getReaderName(settings.reader)}</span>
                            </button>
                        </div>
                        <div id="tafseer-section" className={`flex flex-col ${isEn ? 'text-left' : 'text-right'} overflow-visible`}>
                            <label className="text-xs font-bold block opacity-85 mb-1.5">{isEn ? "Tafseer" : "التفسير"}</label>
                            <button 
                                type="button"
                                onClick={() => onOpenModal('tafseer-selection-modal')} 
<<<<<<< HEAD
                                className="w-full p-2.5 text-xs h-10 rounded-2xl app-page-card border-0 flex justify-center items-center px-3 font-bold cursor-pointer"
=======
                                className="w-full p-2.5 text-xs h-9 rounded-xl quran-raised-btn flex justify-center items-center px-3 font-bold border-0"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                style={{ 
                                    backgroundColor: btnSurfaceBg, 
                                    color: isDarkTheme ? (currentTheme?.btnText || currentTheme?.text || '#ffffff') : currentTheme?.text, 
                                }}
                            >
                                <span className="truncate text-center">{getTafseerName(settings.tafseer)}</span>
                            </button>
                        </div>
                    </div>

                    {/* بطاقة تكرار الآية بعرض كامل الصف */}
<<<<<<< HEAD
                    <div id="repeat-and-notifications-row" className={`${isLandscape ? 'col-span-2' : ''} py-0.5 overflow-visible`}>
                        {/* تكرار الآية */}
                        <div id="ayah-repeat-section" className={`flex flex-col ${isEn ? 'text-left' : 'text-right'} w-full overflow-visible`}>
                            <label className="text-xs font-bold opacity-85 mb-1.5 truncate">{isEn ? "Ayah Repeat" : "تكرار الآية"}</label>
                            <div className="py-2.5 pb-3 flex items-center justify-around px-3 rounded-2xl app-page-card border-0 w-full overflow-visible" style={{ backgroundColor: cardSurfaceBg }}>
=======
                    <div id="repeat-and-notifications-row" className={`${isLandscape ? 'col-span-2' : ''} py-0.5`}>
                        {/* تكرار الآية */}
                        <div id="ayah-repeat-section" className={`flex flex-col ${isEn ? 'text-left' : 'text-right'} w-full`}>
                            <label className="text-xs font-bold opacity-80 mb-1.5 truncate">{isEn ? "Ayah Repeat" : "تكرار الآية"}</label>
                            <div className="h-10 flex items-center justify-around px-3 rounded-xl quran-raised-card border-0 w-full" style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', border: 'none' }}>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            updateSetting('ayahRepeatCount', num);
                                            showToast(isEn ? `Ayah repeat: ${num}` : `تكرار الآية: ${toArabic(num)} ${num === 1 ? 'مرة' : 'مرات'}`);
                                        }}
<<<<<<< HEAD
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all app-page-card border-0 cursor-pointer ${
=======
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border-0 ${
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                            settings.ayahRepeatCount === num 
                                            ? 'text-white font-black' 
                                            : 'opacity-90 hover:opacity-100'
                                        }`}
                                        style={settings.ayahRepeatCount === num ? { backgroundColor: currentTheme?.accent || '#10b981', color: '#ffffff' } : { backgroundColor: btnSurfaceBg, color: isDarkTheme ? '#ffffff' : (currentTheme?.text || '#0f172a') }}
                                        title={`${isEn ? "Repeat" : "تكرار"} ${num}`}
                                    >
                                        {isEn ? num : toArabic(num)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* تصميم رأس السورة */}
                    <div id="surah-header-design-section" className="py-0.5 overflow-visible">
                        <label className="text-xs font-bold block opacity-85 mb-1.5 text-right">
                            {isEn ? "Surah Header Design" : "تصميم رأس السورة"}
                        </label>
                        <div className="overflow-visible">
                            <button 
                                type="button"
                                onClick={() => onOpenModal('surah-design-picker')} 
                                className="w-full rounded-2xl p-2.5 transition-all relative overflow-visible app-page-card border-0 flex items-center justify-center cursor-pointer"
                                style={{ backgroundColor: cardSurfaceBg }}
                                title={isEn ? "Choose Surah Header Design" : "اختيار تصميم رأس السورة"}
                            >
                                <div className="pointer-events-none w-full rounded-xl overflow-hidden">
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
                    <div id="scroll-speed-and-hide-toolbars-row" className="grid grid-cols-2 gap-3 py-0.5 overflow-visible">
                        {/* سرعة التمرير */}
                        <div id="scroll-speed-section" className="flex flex-col text-right overflow-visible">
                            <label className="text-xs font-bold opacity-85 mb-1.5">{isEn ? "Scroll Speed" : "سرعة التمرير"}</label>
                            <button 
                                type="button"
                                onClick={() => onOpenModal('scroll-speed-modal')} 
<<<<<<< HEAD
                                className="w-full p-2.5 text-xs h-10 rounded-2xl app-page-card border-0 flex justify-center items-center px-3 font-bold cursor-pointer"
                                style={{ backgroundColor: btnSurfaceBg, color: isDarkTheme ? '#ffffff' : currentTheme?.text }}
=======
                                className="w-full p-2.5 text-xs h-9 rounded-xl quran-raised-btn flex justify-center items-center px-3 font-bold border-0"
                                style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', color: currentTheme?.text, border: 'none' }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            >
                                <span className="truncate text-center">{settings.scrollMinutes} {isEn ? "min" : "دقيقة"}</span>
                            </button>
                        </div>

                        {/* إخفاء الأشرطة */}
<<<<<<< HEAD
                        <div id="hide-toolbars-section" className="flex flex-col text-right overflow-visible">
                            <label className="text-xs font-bold opacity-85 mb-1.5">{isEn ? "Hide Toolbars" : "إخفاء الأشرطة"}</label>
                            <div
                                role="switch"
                                aria-checked={isHideToolbarsEnabled}
                                tabIndex={0}
                                onClick={() => handleHideToolbarsToggle(!isHideToolbarsEnabled)}
                                className="h-10 flex items-center justify-between px-3.5 rounded-2xl app-page-card tasbeeh-pressable border-0 cursor-pointer overflow-visible"
                                style={{ backgroundColor: cardSurfaceBg }}
                            >
                                <span className="text-[11px] opacity-80 font-bold">{isHideToolbarsEnabled ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
                                <input 
                                    type="checkbox" 
                                    id="hide-toolbars" 
                                    checked={isHideToolbarsEnabled} 
                                    onChange={(e) => handleHideToolbarsToggle(e.target.checked)} 
                                    className="sr-only"
                                />
                                <div
                                    className="relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 p-0.5 shadow-inner"
                                    style={{ backgroundColor: isHideToolbarsEnabled ? (currentTheme?.accent || 'var(--qr-accent)') : (isDarkTheme ? '#3f3f46' : '#d1d5db') }}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                            isHideToolbarsEnabled ? (isEn ? 'translate-x-5' : '-translate-x-5') : 'translate-x-0'
                                        }`}
                                        style={{ boxShadow: toggleKnobShadow }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 overflow-visible">
                        <div id="toggles-section" className="overflow-visible">
                            <div id="sajdah-row" className="grid grid-cols-2 gap-3 py-0.5 overflow-visible">
                                {/* بطاقة السجدة */}
                                <div id="sajdah-section" className="flex flex-col text-right overflow-visible">
                                    <label className="text-xs font-bold opacity-85 mb-1.5 truncate">{isEn ? "Show Sajdah Card" : "إظهار بطاقة السجدة"}</label>
                                    <div
                                        role="switch"
                                        aria-checked={showSajdahCard}
                                        tabIndex={0}
                                        onClick={() => handleSajdahCardToggle(!showSajdahCard)}
                                        className="h-10 flex items-center justify-between px-3.5 rounded-2xl app-page-card tasbeeh-pressable border-0 cursor-pointer overflow-visible"
                                        style={{ backgroundColor: cardSurfaceBg }}
                                    >
                                        <span className="text-[11px] opacity-80 font-bold">{showSajdahCard ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
                                        <input 
                                            type="checkbox" 
                                            id="show-sajdah-card" 
                                            checked={showSajdahCard} 
                                            onChange={(e) => handleSajdahCardToggle(e.target.checked)} 
                                            className="sr-only"
                                        />
                                        <div
                                            className="relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 p-0.5 shadow-inner"
                                            style={{ backgroundColor: showSajdahCard ? (currentTheme?.accent || 'var(--qr-accent)') : (isDarkTheme ? '#3f3f46' : '#d1d5db') }}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                                    showSajdahCard ? (isEn ? 'translate-x-5' : '-translate-x-5') : 'translate-x-0'
                                                }`}
                                                style={{ boxShadow: toggleKnobShadow }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* تظليل كلمة بكلمة */}
                                <div id="word-highlight-section" className="flex flex-col text-right overflow-visible">
                                    <label className="text-xs font-bold opacity-85 mb-1.5 truncate">{isEn ? "Word Sync Audio" : "تظليل كلمة بكلمة"}</label>
                                    <div
                                        role="switch"
                                        aria-checked={!!settings.wordHighlightEnabled}
                                        tabIndex={0}
                                        onClick={() => {
                                            const checked = !settings.wordHighlightEnabled;
                                            updateSetting('wordHighlightEnabled', checked);
                                            showToast(checked ? (isEn ? 'Word highlight enabled' : 'تم تفعيل تظليل كلمة بكلمة') : (isEn ? 'Word highlight disabled' : 'تم تعطيل تظليل كلمة بكلمة'));
                                        }}
                                        className="h-10 flex items-center justify-between px-3.5 rounded-2xl app-page-card tasbeeh-pressable border-0 cursor-pointer overflow-visible"
                                        style={{ backgroundColor: cardSurfaceBg }}
                                    >
                                        <span className="text-[11px] opacity-80 font-bold">{settings.wordHighlightEnabled ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
                                        <input 
                                            type="checkbox" 
                                            id="word-highlight-toggle" 
                                            checked={!!settings.wordHighlightEnabled} 
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                updateSetting('wordHighlightEnabled', checked);
                                                showToast(checked ? (isEn ? 'Word highlight enabled' : 'تم تفعيل تظليل كلمة بكلمة') : (isEn ? 'Word highlight disabled' : 'تم تعطيل تظليل كلمة بكلمة'));
                                            }} 
                                            className="sr-only"
                                        />
                                        <div
                                            className="relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 p-0.5 shadow-inner"
                                            style={{ backgroundColor: settings.wordHighlightEnabled ? (currentTheme?.accent || 'var(--qr-accent)') : (isDarkTheme ? '#3f3f46' : '#d1d5db') }}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                                    settings.wordHighlightEnabled ? (isEn ? 'translate-x-5' : '-translate-x-5') : 'translate-x-0'
                                                }`}
                                                style={{ boxShadow: toggleKnobShadow }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* اختيار لون تظليل الكلمة المستقل مع المعاينة الحية */}
                                {settings.wordHighlightEnabled && (
                                    <div className="col-span-2 mt-2 p-3.5 pb-4 rounded-2xl space-y-3 app-page-card border-0 transition-all overflow-visible" style={{ backgroundColor: cardSurfaceBg }}>
                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <span style={{ color: isDarkTheme ? '#ffffff' : currentTheme?.text }}>{isEn ? "Spoken Word Color" : "لون الكلمة المنطوقة"}</span>
                                                <span className="text-[10px] opacity-80" style={{ color: currentTheme?.accent || 'var(--qr-accent)' }}>
                                                    {WORD_HIGHLIGHT_COLOR_OPTIONS.find(o => o.id === (settings.wordHighlightColor || 'auto'))?.[isEn ? 'nameEn' : 'nameAr'] || (isEn ? "Custom" : "مخصص")}
                                                </span>
                                            </div>

                                            {/* دوائر الألوان المتباينة */}
                                            <div className="flex items-center justify-between gap-2 flex-wrap overflow-visible py-0.5">
                                                {WORD_HIGHLIGHT_COLOR_OPTIONS.map((opt) => {
                                                    const isSelected = (settings.wordHighlightColor || 'auto') === opt.id;
                                                    const displayColor = opt.id === 'auto' 
                                                        ? getEffectiveWordHighlightColor(settings.highlightTextColor || currentTheme?.highlightText || currentTheme?.accent, 'auto', currentTheme?.id).bg 
                                                        : opt.color;

                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                updateSetting('wordHighlightColor', opt.id);
                                                                showToast(isEn ? 'Spoken word color updated' : 'تم تغيير لون الكلمة المنطوقة');
                                                            }}
                                                            className={`w-7 h-7 rounded-full app-page-card border-0 flex items-center justify-center transition-all cursor-pointer ${
                                                                isSelected ? 'scale-110 ring-2 ring-offset-2 ring-emerald-500' : 'opacity-90 hover:opacity-100 hover:scale-105'
                                                            }`}
                                                            style={{
                                                                backgroundColor: displayColor,
                                                            }}
                                                            title={isEn ? opt.nameEn : opt.nameAr}
                                                        >
                                                            {isSelected && (
                                                                <i className="fa-solid fa-check text-[10px] text-white drop-shadow-xs"></i>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* بطاقة المعاينة البصرية لمظهر تظليل الآية مع الكلمة المستقلة */}
                                            {(() => {
                                                const ayahColor = settings.highlightTextColor || currentTheme?.highlightText || currentTheme?.accent || '#d97706';
                                                const wordCol = getEffectiveWordHighlightColor(ayahColor, settings.wordHighlightColor, currentTheme?.id);

                                                return (
                                                    <div 
                                                        className="p-2.5 rounded-xl app-page-card border-0 text-center text-sm font-bold leading-relaxed"
                                                        style={{ 
                                                            backgroundColor: isDarkTheme ? '#141414' : '#ffffff',
                                                            fontFamily: settings.fontFamily || 'var(--font-amiri)'
                                                        }}
                                                    >
                                                        <span style={{ color: ayahColor, opacity: 0.9 }}>
                                                            بِسْمِ اللَّهِ{' '}
                                                        </span>
                                                        <span 
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                color: wordCol.bg || '#dc2626',
                                                                borderRadius: '0',
                                                                padding: '0',
                                                                margin: '0',
                                                                display: 'inline'
                                                            }}
                                                        >
                                                            الرَّحْمَٰنِ
                                                        </span>
                                                        <span style={{ color: ayahColor, opacity: 0.9 }}>
                                                            {' '}الرَّحِيمِ
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    <div id="downloads-section" className="space-y-2 py-0.5 overflow-visible">
                        {/* وضع بطاقة تحميل القرآن الكريم وبطاقة تحميل التفسير في صف واحد */}
                        <div id="downloads-only-section" className="overflow-visible">
                            <div className="grid grid-cols-2 gap-3 overflow-visible">
                                <button 
                                    type="button"
                                    id="quran-download-btn" 
                                    onClick={() => onOpenModal('quran-download-modal')} 
                                    className="text-xs h-10 w-full text-center px-3 flex items-center justify-center rounded-2xl app-page-card border-0 font-bold cursor-pointer"
                                    style={{ backgroundColor: btnSurfaceBg, color: isDarkTheme ? '#ffffff' : currentTheme?.text }}
                                >
=======
                        <div id="hide-toolbars-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold opacity-80 mb-1.5">{isEn ? "Hide Toolbars" : "إخفاء الأشرطة"}</label>
                            <div className="h-9 flex items-center justify-between px-3 rounded-xl quran-raised-card border-0" style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', border: 'none' }}>
                                <span className="text-[11px] opacity-70 font-bold">{isHideToolbarsEnabled ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
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
                                        style={{ backgroundColor: isHideToolbarsEnabled ? (currentTheme?.accent || 'var(--qr-accent)') : '#d1d5db' }}
                                    ></label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div id="toggles-section">
                            <div id="sajdah-row" className="grid grid-cols-2 gap-2.5 py-0.5">
                                {/* بطاقة السجدة */}
                                <div id="sajdah-section" className="flex flex-col text-right">
                                    <label className="text-xs font-bold opacity-80 mb-1.5 truncate">{isEn ? "Show Sajdah Card" : "إظهار بطاقة السجدة"}</label>
                                    <div className="h-9 flex items-center justify-between px-3 rounded-xl quran-raised-card border-0" style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', border: 'none' }}>
                                        <span className="text-[11px] opacity-70 font-bold">{showSajdahCard ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
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
                                                style={{ backgroundColor: showSajdahCard ? (currentTheme?.accent || 'var(--qr-accent)') : '#d1d5db' }}
                                            ></label>
                                        </div>
                                    </div>
                                </div>

                                {/* تظليل كلمة بكلمة */}
                                <div id="word-highlight-section" className="flex flex-col text-right">
                                    <label className="text-xs font-bold opacity-80 mb-1.5 truncate">{isEn ? "Word Sync Audio" : "تظليل كلمة بكلمة"}</label>
                                    <div className="h-9 flex items-center justify-between px-3 rounded-xl quran-raised-card border-0" style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', border: 'none' }}>
                                        <span className="text-[11px] opacity-70 font-bold">{settings.wordHighlightEnabled ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
                                        <div className="relative inline-block w-8 align-middle select-none">
                                            <input 
                                                type="checkbox" 
                                                id="word-highlight-toggle" 
                                                checked={!!settings.wordHighlightEnabled} 
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    updateSetting('wordHighlightEnabled', checked);
                                                    showToast(checked ? (isEn ? 'Word highlight enabled' : 'تم تفعيل تظليل كلمة بكلمة') : (isEn ? 'Word highlight disabled' : 'تم تعطيل تظليل كلمة بكلمة'));
                                                }} 
                                                className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                                            />
                                            <label 
                                                htmlFor="word-highlight-toggle" 
                                                className="toggle-label block overflow-hidden h-4 rounded-full cursor-pointer" 
                                                style={{ backgroundColor: settings.wordHighlightEnabled ? (currentTheme?.accent || 'var(--qr-accent)') : '#d1d5db' }}
                                            ></label>
                                        </div>
                                    </div>
                                </div>

                                {/* اختيار لون تظليل الكلمة المستقل مع المعاينة الحية */}
                                {settings.wordHighlightEnabled && (
                                    <div className="col-span-2 mt-1 p-2.5 rounded-xl space-y-2 border transition-all" style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <span style={{ color: currentTheme?.text }}>{isEn ? "Spoken Word Color" : "لون الكلمة المنطوقة"}</span>
                                                <span className="text-[10px] opacity-70" style={{ color: currentTheme?.accent || 'var(--qr-accent)' }}>
                                                    {WORD_HIGHLIGHT_COLOR_OPTIONS.find(o => o.id === (settings.wordHighlightColor || 'auto'))?.[isEn ? 'nameEn' : 'nameAr'] || (isEn ? "Custom" : "مخصص")}
                                                </span>
                                            </div>

                                            {/* دوائر الألوان المتباينة */}
                                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                                {WORD_HIGHLIGHT_COLOR_OPTIONS.map((opt) => {
                                                    const isSelected = (settings.wordHighlightColor || 'auto') === opt.id;
                                                    const displayColor = opt.id === 'auto' 
                                                        ? getEffectiveWordHighlightColor(settings.highlightTextColor || currentTheme?.highlightText || currentTheme?.accent, 'auto', currentTheme?.id).bg 
                                                        : opt.color;

                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                updateSetting('wordHighlightColor', opt.id);
                                                                showToast(isEn ? 'Spoken word color updated' : 'تم تغيير لون الكلمة المنطوقة');
                                                            }}
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                                                isSelected ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-emerald-500' : 'opacity-85 hover:opacity-100 hover:scale-105'
                                                            }`}
                                                            style={{
                                                                backgroundColor: displayColor,
                                                                border: opt.id === 'auto' ? '2px dashed #ffffff' : '1px solid rgba(0,0,0,0.15)'
                                                            }}
                                                            title={isEn ? opt.nameEn : opt.nameAr}
                                                        >
                                                            {isSelected && (
                                                                <i className="fa-solid fa-check text-[10px] text-white drop-shadow-xs"></i>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* بطاقة المعاينة البصرية لمظهر تظليل الآية مع الكلمة المستقلة */}
                                            {(() => {
                                                const ayahColor = settings.highlightTextColor || currentTheme?.highlightText || currentTheme?.accent || '#d97706';
                                                const wordCol = getEffectiveWordHighlightColor(ayahColor, settings.wordHighlightColor, currentTheme?.id);

                                                return (
                                                    <div 
                                                        className="p-2 rounded-lg text-center text-xs font-bold leading-relaxed border"
                                                        style={{ 
                                                            backgroundColor: isDarkTheme ? '#141414' : '#f9fafb',
                                                            borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                                            fontFamily: settings.fontFamily || 'var(--font-amiri)'
                                                        }}
                                                    >
                                                        <span style={{ color: ayahColor, opacity: 0.9 }}>
                                                            بِسْمِ اللَّهِ{' '}
                                                        </span>
                                                        <span 
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                color: wordCol.bg || '#dc2626',
                                                                borderRadius: '0',
                                                                padding: '0',
                                                                margin: '0',
                                                                display: 'inline'
                                                            }}
                                                        >
                                                            الرَّحْمَٰنِ
                                                        </span>
                                                        <span style={{ color: ayahColor, opacity: 0.9 }}>
                                                            {' '}الرَّحِيمِ
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    <div id="downloads-section" className="space-y-2 py-0.5">
                        {/* وضع بطاقة تحميل القرآن الكريم وبطاقة تحميل التفسير في صف واحد */}
                        <div id="downloads-only-section">
                            <div className="grid grid-cols-2 gap-2.5">
                                <button 
                                    id="quran-download-btn" 
                                    onClick={() => { 
                                        onOpenModal('quran-download-modal'); 
                                        showToast(isEn ? 'Quran downloads page' : 'تحميل القرآن الكريم');
                                    }} 
                                    className="text-xs h-9 w-full text-center px-3 flex items-center justify-center rounded-xl quran-raised-btn font-bold border-0"
                                    style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', color: currentTheme?.text, border: 'none' }}
                                >
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    <span className="truncate text-center">{isEn ? "Download Quran" : "تحميل القرآن الكريم"}</span>
                                </button>
                                
                                <button 
                                    type="button"
                                    id="tafseer-download-btn" 
<<<<<<< HEAD
                                    onClick={() => onOpenModal('tafsir-download-modal')} 
                                    className="text-xs h-10 w-full text-center px-3 flex items-center justify-center rounded-2xl app-page-card border-0 font-bold cursor-pointer"
                                    style={{ backgroundColor: btnSurfaceBg, color: isDarkTheme ? '#ffffff' : currentTheme?.text }}
=======
                                    onClick={() => { 
                                        onOpenModal('tafsir-download-modal'); 
                                        showToast(isEn ? 'Tafseer downloads page' : 'تحميل التفسير');
                                    }} 
                                    className="text-xs h-9 w-full text-center px-3 flex items-center justify-center rounded-xl quran-raised-btn font-bold border-0"
                                    style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', color: currentTheme?.text, border: 'none' }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                >
                                    <span className="truncate text-center">{isEn ? "Download Tafseer" : "تحميل التفسير"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;