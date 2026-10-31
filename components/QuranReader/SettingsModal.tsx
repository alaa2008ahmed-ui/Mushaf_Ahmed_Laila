import React, { useState, useEffect, useRef } from 'react';
import { READERS, TAFSEERS, THEMES, DEFAULT_SETTINGS, toArabic, isDarkQuranTheme, ReadingMode, getReadersForMode, getValidReaderForMode, ENGLISH_FONTS, getTafseerDisplayName } from './constants';
import { getQuranThemeIdForLayout } from '../../utils/quranThemeHelper';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getReciterDisplayName } from '../../utils/listenQuranTranslations';

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

    const activeThemeId = getQuranThemeIdForLayout(modeSuffix) || settings.theme || 'black';
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

    const currentTheme = THEMES[settings.theme] || Object.values(THEMES)[0];
    const isDarkTheme = isDarkQuranTheme(currentTheme);

    return (
        <div className="fixed z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden" style={{ top: 0, bottom: 0, left: 0, right: 0 }} dir={isEn ? "ltr" : "rtl"} onClick={handleClose}>
            <div className="w-full h-full flex flex-col overflow-hidden shadow-2xl border-0" style={{ backgroundColor: currentTheme.bg || '#ffffff', border: 'none', outline: 'none' }} onClick={e => e.stopPropagation()}>
                <div className="flex-1 w-full flex flex-col overflow-hidden" style={{ color: currentTheme.text || '#000000' }}>
                    <div 
                        className={`p-3 overflow-y-auto text-center flex-1 scrollbar-hide ${isLandscape ? 'grid grid-cols-2 gap-x-6 gap-y-3' : 'space-y-3'}`}
                        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
                    >
                    {/* حجم الخط: صف كامل مستقل */}
                    <div id="font-size-row" className={`${isLandscape ? 'col-span-2' : ''} p-3 rounded-2xl quran-raised-card border-0`} style={{ backgroundColor: isDarkTheme ? (currentTheme?.cardBg || 'rgba(255,255,255,0.05)') : '#ffffff' }}>
                        <div id="font-size-section" className="w-full flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold opacity-80">{isEn ? "Font Size" : "حجم الخط"}</label>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-lg quran-raised-card font-bold" style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', border: 'none' }}>{formatFontSize(settings.fontSize)}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.5" 
                                max="4.5" 
                                step="0.05" 
                                value={parseFloat(formatFontSize(settings.fontSize))} 
                                onChange={(e) => updateSetting('fontSize', parseFloat(parseFloat(e.target.value).toFixed(2)))} 
                                className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" 
                                style={{ accentColor: currentTheme?.accent || 'var(--qr-accent)' }} 
                            />
                        </div>
                    </div>

                    {/* تخصيص الخط: صف كامل مستقل أسفل حجم الخط */}
                    <div id="font-family-row" className={`${isLandscape ? 'col-span-2' : ''} p-3 rounded-2xl quran-raised-card border-0`} style={{ backgroundColor: isDarkTheme ? (currentTheme?.cardBg || 'rgba(255,255,255,0.05)') : '#ffffff' }}>
                        <div id="font-family-section" className="w-full flex flex-col justify-center">
                            <label className="text-xs font-bold block opacity-80 mb-2">
                                {readingMode === 'translation' ? (isEn ? "English Font" : "الخط الإنجليزي") : (isEn ? "Font Customization" : "تخصيص الخط")}
                            </label>
                            <div className="grid grid-cols-12 gap-2 items-center">
                                <button 
                                    id="font-weight-btn" 
                                    onClick={() => updateSetting('isBold', !settings.isBold)} 
                                    className={`col-span-4 p-1.5 text-xs h-9 rounded-xl flex justify-center items-center font-bold transition-all border-0 cursor-pointer ${settings.isBold ? 'quran-raised-btn-selected text-white' : 'quran-raised-btn'}`} 
                                    style={{ 
                                        backgroundColor: settings.isBold ? (currentTheme?.accent || '#10b981') : (isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.08)') : '#ffffff'),
                                        border: 'none',
                                    }}
                                    title={isEn ? "Toggle bold font weight" : "تفعيل/إلغاء سماكة الخط (Bold)"}
                                >
                                    <span className={`${settings.isBold ? 'font-black' : ''}`}>{isEn ? "Bold" : "سماكة"}</span>
                                </button>
                                <button 
                                    id="font-family-btn" 
                                    onClick={() => onOpenModal('font-modal')} 
                                    className="col-span-8 p-1.5 text-xs h-9 rounded-xl quran-raised-btn flex justify-between items-center px-3 font-bold border-0 cursor-pointer"
                                    style={{ 
                                        backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.08)') : '#ffffff',
                                        color: currentTheme?.text,
                                        border: 'none',
                                    }}
                                >
                                    <span className="truncate">{getFontName(settings.fontFamily)}</span>
                                    <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[10px] quran-3d-icon"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ثانيا: بطاقة الألوان الثلاثة في صف واحد مدمج */}
                    <div id="colors-section" className={`${isLandscape ? 'col-span-2' : ''} p-3 rounded-2xl quran-raised-card border-0`} style={{ backgroundColor: isDarkTheme ? (currentTheme?.cardBg || 'rgba(255,255,255,0.05)') : '#ffffff' }}>
                        <div className="grid grid-cols-3 gap-2">
                            {/* لون النص */}
                            <div className="flex flex-col items-center">
                                <label className="text-[11px] font-bold opacity-80 mb-1.5 truncate w-full text-center">
                                    {isEn ? "Text Color" : "لون النص"}
                                </label>
                                <div 
                                    className={`h-8 w-full rounded-xl quran-raised-btn cursor-pointer transition-all border-0 ${activeColorField === 'textColor' ? 'ring-2 ring-emerald-500 scale-105' : ''}`}
                                    style={{ ...renderCheckerboard(settings.textColor), border: 'none' }}
                                    onClick={() => setActiveColorField(activeColorField === 'textColor' ? null : 'textColor')}
                                    title={isEn ? "Text Color" : "لون النص"}
                                ></div>
                            </div>

                            {/* لون الخلفية */}
                            <div className="flex flex-col items-center">
                                <label className="text-[11px] font-bold opacity-80 mb-1.5 truncate w-full text-center">
                                    {isEn ? "Background" : "لون الخلفية"}
                                </label>
                                <div 
                                    className={`h-8 w-full rounded-xl quran-raised-btn cursor-pointer transition-all border-0 ${activeColorField === 'bgColor' ? 'ring-2 ring-emerald-500 scale-105' : ''}`}
                                    style={{ ...renderCheckerboard(settings.bgColor), border: 'none' }}
                                    onClick={() => setActiveColorField(activeColorField === 'bgColor' ? null : 'bgColor')}
                                    title={isEn ? "Background Color" : "لون الخلفية"}
                                ></div>
                            </div>

                            {/* لون التحديد */}
                            <div className="flex flex-col items-center">
                                <label className="text-[11px] font-bold opacity-80 mb-1.5 truncate w-full text-center">
                                    {isEn ? "Highlight" : "لون التحديد"}
                                </label>
                                <div 
                                    className={`h-8 w-full rounded-xl quran-raised-btn cursor-pointer transition-all border-0 ${activeColorField === 'highlightTextColor' ? 'ring-2 ring-emerald-500 scale-105' : ''}`}
                                    style={{ ...renderCheckerboard(settings.highlightTextColor || THEMES['olive'].highlightText), border: 'none' }}
                                    onClick={() => setActiveColorField(activeColorField === 'highlightTextColor' ? null : 'highlightTextColor')}
                                    title={isEn ? "Highlight Color" : "لون التحديد"}
                                ></div>
                            </div>
                        </div>
                        
                        {activeColorField && (
                            <div className="p-3 rounded-2xl quran-raised-card mt-3 animate-fadeIn border-0" style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)' }}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold" style={{ color: currentTheme?.text }}>
                                        {isEn 
                                            ? `Select ${activeColorField === 'bgColor' ? 'Background' : activeColorField === 'textColor' ? 'Text' : 'Highlight'} Color` 
                                            : `اختر لون ${activeColorField === 'bgColor' ? 'الخلفية' : activeColorField === 'textColor' ? 'النص' : 'التحديد'}`
                                        }
                                    </span>
                                    <button onClick={() => setActiveColorField(null)} className="opacity-50 hover:opacity-100 p-1">
                                        <i className="fa-solid fa-times text-xs quran-3d-icon"></i>
                                    </button>
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                    {PREDEFINED_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateSetting(activeColorField, c)}
                                            className={`h-7 rounded-xl quran-raised-btn border-0 transition-transform ${settings[activeColorField] === c ? 'ring-2 ring-emerald-500 scale-110' : ''}`}
                                            style={{ ...renderCheckerboard(c), border: 'none' }}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* أولاً: بطاقة القارئ وبطاقة التفسير في صف واحد */}
                    <div id="reciter-tafseer-row" className="grid grid-cols-2 gap-2.5 py-0.5">
                        <div id="reciter-section" className={`flex flex-col ${isEn ? 'text-left' : 'text-right'}`}>
                            <label className="text-xs font-bold block opacity-80 mb-1.5">{isEn ? "Reciter" : "القارئ"}</label>
                            <button 
                                onClick={() => onOpenModal('reciter-modal')} 
                                className="w-full p-2.5 text-xs h-9 rounded-xl quran-raised-btn flex justify-between items-center px-3 font-bold border-0"
                                style={{ 
                                    backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.08)') : '#ffffff', 
                                    color: isDarkTheme ? (currentTheme?.btnText || currentTheme?.text || '#ffffff') : currentTheme?.text, 
                                    border: isDarkTheme ? '1px solid rgba(255,255,255,0.12)' : 'none' 
                                }}
                            >
                                <span className="truncate">{getReaderName(settings.reader)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[10px] quran-3d-icon"></i>
                            </button>
                        </div>
                        <div id="tafseer-section" className={`flex flex-col ${isEn ? 'text-left' : 'text-right'}`}>
                            <label className="text-xs font-bold block opacity-80 mb-1.5">{isEn ? "Tafseer" : "التفسير"}</label>
                            <button 
                                onClick={() => onOpenModal('tafseer-selection-modal')} 
                                className="w-full p-2.5 text-xs h-9 rounded-xl quran-raised-btn flex justify-between items-center px-3 font-bold border-0"
                                style={{ 
                                    backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.08)') : '#ffffff', 
                                    color: isDarkTheme ? (currentTheme?.btnText || currentTheme?.text || '#ffffff') : currentTheme?.text, 
                                    border: isDarkTheme ? '1px solid rgba(255,255,255,0.12)' : 'none' 
                                }}
                            >
                                <span className="truncate">{getTafseerName(settings.tafseer)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[10px] quran-3d-icon"></i>
                            </button>
                        </div>
                    </div>

                    {/* وضع بطاقتي تكرار الآية والإشعارات في صف واحد */}
                    <div id="repeat-and-notifications-row" className="grid grid-cols-2 gap-2.5 py-0.5">
                        {/* تكرار الآية */}
                        <div id="ayah-repeat-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold opacity-80 mb-1.5 truncate">{isEn ? "Ayah Repeat" : "تكرار الآية"}</label>
                            <div className="h-9 flex items-center justify-around px-2 rounded-xl quran-raised-card border-0" style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', border: 'none' }}>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => updateSetting('ayahRepeatCount', num)}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-0 ${
                                            settings.ayahRepeatCount === num 
                                            ? 'quran-raised-btn-selected text-white font-black' 
                                            : 'quran-raised-btn opacity-70 hover:opacity-100'
                                        }`}
                                        style={settings.ayahRepeatCount === num ? { backgroundColor: currentTheme?.accent || '#10b981', color: '#ffffff', border: 'none' } : { border: 'none' }}
                                        title={`${isEn ? "Repeat" : "تكرار"} ${num}`}
                                    >
                                        {isEn ? num : toArabic(num)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* الإشعارات */}
                        <div id="notifications-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold opacity-80 mb-1.5 truncate">{isEn ? "Notifications" : "الإشعارات"}</label>
                            <button 
                                onClick={() => onOpenModal('notification-settings-modal')} 
                                className="w-full p-2.5 text-xs h-9 rounded-xl quran-raised-btn flex justify-between items-center px-3 font-bold border-0"
                                style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', color: currentTheme?.text, border: 'none' }}
                            >
                                <span className="flex items-center gap-1.5 truncate">
                                    <i className="fa-solid fa-bell text-[11px] quran-3d-icon" style={{ color: currentTheme?.accent || '#10b981' }}></i>
                                    <span className="truncate">{isEn ? "Settings" : "إعدادات التنبيه"}</span>
                                </span>
                                <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[10px] quran-3d-icon"></i>
                            </button>
                        </div>
                    </div>

                    {/* تصميم رأس السورة */}
                    <div id="surah-header-design-section" className="py-1">
                        <label className="text-xs font-bold block opacity-80 mb-1.5 text-right">
                            {isEn ? "Surah Header Design" : "تصميم رأس السورة"}
                        </label>
                        <div>
                            <button 
                                type="button"
                                onClick={() => onOpenModal('surah-design-picker')} 
                                className="w-full rounded-2xl p-2 transition-all relative overflow-hidden quran-raised-btn border-0 flex items-center justify-center"
                                style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', border: 'none' }}
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
                    <div id="scroll-speed-and-hide-toolbars-row" className="grid grid-cols-2 gap-2.5 py-0.5">
                        {/* سرعة التمرير */}
                        <div id="scroll-speed-section" className="flex flex-col text-right">
                            <label className="text-xs font-bold opacity-80 mb-1.5">{isEn ? "Scroll Speed" : "سرعة التمرير"}</label>
                            <button 
                                onClick={() => onOpenModal('scroll-speed-modal')} 
                                className="w-full p-2.5 text-xs h-9 rounded-xl quran-raised-btn flex justify-between items-center px-3 font-bold border-0"
                                style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', color: currentTheme?.text, border: 'none' }}
                            >
                                <span>{settings.scrollMinutes} {isEn ? "min" : "دقيقة"}</span>
                                <i className="fa-solid fa-chevron-left opacity-50 shrink-0 text-[10px] quran-3d-icon"></i>
                            </button>
                        </div>

                        {/* إخفاء الأشرطة */}
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
                            {/* بطاقتي إظهار بطاقة السجدة وإظهار الإطار الخارجي في صف واحد */}
                            <div id="sajdah-and-page-border-row" className="grid grid-cols-2 gap-2.5 py-0.5">
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

                                {/* الإطار الخارجي */}
                                <div id="page-border-section" className="flex flex-col text-right">
                                    <label className="text-xs font-bold opacity-80 mb-1.5 truncate">{isEn ? "Show Page Border" : "إظهار الإطار الخارجي"}</label>
                                    <div className="h-9 flex items-center justify-between px-3 rounded-xl quran-raised-card border-0" style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', border: 'none' }}>
                                        <span className="text-[11px] opacity-70 font-bold">{settings.showPageBorder !== false ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
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
                                                style={{ backgroundColor: settings.showPageBorder !== false ? (currentTheme?.accent || 'var(--qr-accent)') : '#d1d5db' }}
                                            ></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="downloads-section" className="space-y-2 py-0.5">
                        <div>
                            <button id="interface-customization-btn" onClick={() => onOpenModal('toolbar-color-picker-modal')} className="text-xs h-9 w-full text-right px-3 flex items-center justify-between rounded-xl quran-raised-btn font-bold border-0" style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', color: currentTheme?.text, border: 'none' }}>
                                <span>{isEn ? "Customize Interface" : "تخصيص الواجهة"}</span>
                                <i className="fa-solid fa-chevron-left opacity-50 text-xs quran-3d-icon"></i>
                            </button>
                        </div>
                        
                        {/* ثالثا: وضع بطاقة تحميل القرآن الكريم وبطاقة تحميل التفسير في صف واحد */}
                        <div id="downloads-only-section">
                            <div className="grid grid-cols-2 gap-2.5">
                                <button 
                                    id="quran-download-btn" 
                                    onClick={() => { onOpenModal('quran-download-modal'); }} 
                                    className="text-xs h-9 w-full text-right px-3 flex items-center justify-between rounded-xl quran-raised-btn font-bold border-0"
                                    style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', color: currentTheme?.text, border: 'none' }}
                                >
                                    <span className="truncate">{isEn ? "Download Quran" : "تحميل القرآن الكريم"}</span>
                                    <i className="fa-solid fa-chevron-left opacity-50 text-xs shrink-0 quran-3d-icon"></i>
                                </button>
                                
                                <button 
                                    id="tafseer-download-btn" 
                                    onClick={() => { onOpenModal('tafsir-download-modal'); }} 
                                    className="text-xs h-9 w-full text-right px-3 flex items-center justify-between rounded-xl quran-raised-btn font-bold border-0"
                                    style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', color: currentTheme?.text, border: 'none' }}
                                >
                                    <span className="truncate">{isEn ? "Download Tafseer" : "تحميل التفسير"}</span>
                                    <i className="fa-solid fa-chevron-left opacity-50 text-xs shrink-0 quran-3d-icon"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                <div 
                    className="p-3.5 flex gap-2 shrink-0 z-10" 
                    style={{ 
                        backgroundColor: currentTheme.bg,
                        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 56px) + 0.75rem)'
                    }}
                >
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3.5 rounded-2xl text-xs font-bold w-full transition-all quran-raised-btn border-0"
                        style={{ backgroundColor: currentTheme.btnBg || (currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.08)' : '#ffffff'), color: currentTheme.btnText || currentTheme.text, border: 'none' }}
                    >
                        {isEn ? "Back" : "رجوع"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;