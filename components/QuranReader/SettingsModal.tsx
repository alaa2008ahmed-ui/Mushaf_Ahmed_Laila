import React, { useState, useEffect, useRef } from 'react';
import { READERS, THEMES, DEFAULT_SETTINGS, toArabic, isDarkQuranTheme, ReadingMode, getReadersForMode, getValidReaderForMode, ENGLISH_FONTS, getTafseerDisplayName, WORD_HIGHLIGHT_COLOR_OPTIONS, getEffectiveWordHighlightColor } from './constants';
import { getQuranThemeIdForLayout } from '../../utils/quranThemeHelper';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getReciterDisplayName } from '../../utils/listenQuranTranslations';

import SurahHeader from './SurahHeader';
import { getMadinahThemePalette } from './MadinahFrameSVG';
import {
    MADINAH_FRAME_DESIGNS,
    MadinahFrameMiniPreview,
    normalizeMadinahFrameDesign,
} from './madinahFrameDesigns';
import { getClusterForLanguage, syncClusterSettings, getMadinahSettings, saveMadinahSettings, getClusterSettings } from '../../utils/quranClusterSync';
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
    const isMadinahMode = readingMode === 'madinah';
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

    const readSettingsForMode = () => {
        if (isMadinahMode) {
            const madinahSaved = getMadinahSettings(isLandscape);
            if (madinahSaved) return madinahSaved;
            const savedMadinah = modeSuffix ? localStorage.getItem('quran_settings' + modeSuffix) : null;
            return savedMadinah ? JSON.parse(savedMadinah) : {};
        }
        const saved = localStorage.getItem('quran_settings' + modeSuffix);
        if (saved) return JSON.parse(saved);
        return getClusterSettings(getClusterForLanguage(language), readingMode as ReadingMode, isLandscape) || {};
    };

    const [settings, setSettings] = useState(() => {
        const baseSettings = readSettingsForMode();
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
            const baseSettings = readSettingsForMode();
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
    }, [modeSuffix, isMadinahMode, isLandscape, language, readingMode]);

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
    const [isFrameMenuOpen, setIsFrameMenuOpen] = useState(false);
    const frameSectionRef = useRef<HTMLDivElement>(null);

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
        if (isMadinahMode) {
            saveMadinahSettings(newSettings, {
                markCustomColors: ['textColor', 'bgColor', 'highlightTextColor', 'theme'].includes(key),
            });
            return;
        }
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

    const isHexDark = (color?: string): boolean => {
        if (!color || typeof color !== 'string') return false;
        const c = color.trim().toLowerCase();
        if (c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return false;
        const hex = c.startsWith('#') ? c.slice(1) : '';
        if (!hex) return false;
        let r = 0, g = 0, b = 0;
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else {
            return false;
        }
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
    };

    const currentTheme = modalTheme || THEMES[settings.theme as keyof typeof THEMES] || Object.values(THEMES)[0];
    const ornamentPalette = getMadinahThemePalette(currentTheme);
    const isThemeDark = isDarkQuranTheme(currentTheme);
    const rawBgColor = (settings.bgColor || '').trim();
    const normRawBg = rawBgColor.toLowerCase();
    const normThemeBg = (currentTheme?.bg || '#ffffff').trim().toLowerCase();
    const hasCustomPageBg =
        Boolean(normRawBg) &&
        normRawBg !== 'transparent' &&
        normRawBg !== 'rgba(0, 0, 0, 0)' &&
        normRawBg !== normThemeBg;

    const resolvedPageBg = hasCustomPageBg ? rawBgColor : ornamentPalette.frameBg;
    const isDarkTheme = isThemeDark || isHexDark(resolvedPageBg);
    const isDeepBlack = currentTheme?.id === 'deep_black';

    const topBarBg = ornamentPalette.frameBg;
    const topBarText = isThemeDark ? '#f8fafc' : ornamentPalette.bannerText;
    const bodyTextColor = isDarkTheme ? '#f8fafc' : ornamentPalette.bannerText;

    const accentColor = isDeepBlack
        ? '#e4e4e7'
        : (ornamentPalette.primary || currentTheme?.accent || '#b45309');
    const accentTextColor = isHexDark(accentColor) ? '#ffffff' : '#09090b';
    const selectedControlBg = isDeepBlack ? '#3f3f46' : accentColor;
    const selectedControlText = isHexDark(selectedControlBg) ? '#ffffff' : '#09090b';

    const borderSubtle = isDarkTheme
        ? 'rgba(255, 255, 255, 0.16)'
        : `${accentColor}44`;
    const borderStrong = isDarkTheme
        ? 'rgba(255, 255, 255, 0.28)'
        : `${accentColor}99`;

    const cardSurfaceBg = isDarkTheme
        ? (currentTheme?.cardBg && !currentTheme.cardBg.startsWith('rgba') ? currentTheme.cardBg : '#141418')
        : (ornamentPalette.cartoucheFill || '#ffffff');
    const btnSurfaceBg = isDarkTheme
        ? (currentTheme?.btnBg && !currentTheme.btnBg.startsWith('rgba') ? currentTheme.btnBg : '#18181b')
        : (ornamentPalette.cartoucheFill || '#ffffff');

    const modalThemeVars = {
        '--qr-bg': resolvedPageBg,
        '--qr-modal-bg': topBarBg,
        '--qr-modal-text': topBarText,
        '--qr-header-bg': topBarBg,
        '--qr-header-text': topBarText,
        '--qr-text': bodyTextColor,
        '--qr-card-bg': cardSurfaceBg,
        '--qr-card-text': bodyTextColor,
        '--qr-accent': accentColor,
        '--qr-accent-text': accentTextColor,
        '--qr-flat-accent': accentColor,
        '--qr-flat-surface': cardSurfaceBg,
        '--qr-flat-border-strong': borderStrong,
        '--qr-flat-border-subtle': borderSubtle,
        '--madinah-menu-bg': resolvedPageBg,
        '--madinah-topbar-bg': topBarBg,
        '--madinah-menu-surface': cardSurfaceBg,
        '--madinah-menu-text': topBarText,
        '--madinah-menu-border': accentColor,
        '--madinah-menu-border-strong': borderStrong,
        '--madinah-menu-border-subtle': borderSubtle,
        '--madinah-menu-accent': accentColor,
    } as React.CSSProperties;

    return (
        <div 
            className={isLandscape
                ? `fixed inset-0 z-[1200] bg-black/55 flex items-center justify-center p-2.5 font-cairo select-none overflow-hidden animate-fadeIn settings-3d-adia-scope ${isDarkTheme ? 'settings-3d-dark' : ''}`
                : `quran-fullscreen-modal-backdrop fixed inset-0 z-[1200] flex flex-col font-cairo select-none overflow-hidden animate-fadeIn settings-3d-adia-scope ${isDarkTheme ? 'settings-3d-dark' : ''}`
            }
            dir={isEn ? "ltr" : "rtl"} 
            style={isLandscape ? modalThemeVars : { ...modalThemeVars, backgroundColor: resolvedPageBg }}
            onClick={isLandscape ? handleClose : undefined}
        >
            <div
                className={isLandscape
                    ? `modal-skinned compact-landscape-modal madinah-settings-modal-panel ${isDarkTheme ? 'quran-3d-dark' : ''} w-[64%] max-w-[450px] h-[86%] max-h-[86%] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0`
                    : "quran-fullscreen-modal-panel madinah-settings-modal-panel flex-1 min-h-0 w-full flex flex-col overflow-hidden"
                }
                style={{ backgroundColor: resolvedPageBg, border: 'none', outline: 'none' }}
                onClick={isLandscape ? e => e.stopPropagation() : undefined}
            >
            {isLandscape ? (
                <div className="pt-2.5 px-3 pb-1.5 shrink-0">
                    <div
                        className="py-1.5 px-3 rounded-xl flex items-center justify-between gap-2 quran-raised-card border-0"
                        style={{ backgroundColor: topBarBg, color: topBarText }}
                    >
                        <h1 className="text-xs font-extrabold truncate font-cairo" style={{ fontFamily: "'Cairo', sans-serif" }}>
                            {isEn ? 'Quran Page Settings' : 'إعدادات صفحة القرآن'}
                        </h1>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-7 h-7 rounded-full quran-raised-btn flex items-center justify-center border-0 shrink-0 cursor-pointer"
                            style={{ backgroundColor: btnSurfaceBg, color: topBarText }}
                            title={isEn ? "Close" : "إغلاق"}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                    </div>
                </div>
            ) : (
            /* Standard Page Header - Identical to Adia and all pages */
            <header className="app-top-bar settings-top-bar quran-context shrink-0 w-full" dir={isEn ? 'ltr' : 'rtl'} style={{ display: 'block', backgroundColor: topBarBg, color: topBarText }}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back button */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: topBarText }}
                                title={isEn ? "Go Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Title in center */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate" style={{ color: topBarText, fontFamily: "'Cairo', sans-serif" }}>
                                {isEn ? 'Quran Page Settings' : 'إعدادات صفحة القرآن'}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>
            )}

            <div className={`flex-1 min-h-0 w-full flex flex-col overflow-hidden ${isLandscape ? '' : 'max-w-2xl mx-auto'}`} style={{ color: bodyTextColor }}>
                <div 
                    className={`${isLandscape ? 'p-3 pt-1.5 pb-3.5 space-y-2.5' : 'p-3.5 sm:p-4 space-y-4 app-scroll-safe'} overflow-y-auto text-center flex-1 min-h-0 scrollbar-hide`}
                >
                    {/* حجم الخط: صف كامل مستقل */}
                    {!isMadinahMode && (
                    <div id="font-size-row" className={`${isLandscape ? 'p-2.5 rounded-xl' : 'p-3.5 rounded-2xl'} app-page-card border-0 overflow-visible`} style={{ backgroundColor: cardSurfaceBg }}>
                        <div id="font-size-section" className="w-full flex flex-col justify-center overflow-visible">
                            <div className="flex items-center justify-between mb-2.5 overflow-visible">
                                <label className="text-xs font-bold opacity-85">{isEn ? "Font Size" : "حجم الخط"}</label>
                                <span className="text-[11px] px-3 py-1 rounded-xl app-page-card border-0 font-bold" style={{ backgroundColor: btnSurfaceBg }}>
                                    {formatFontSize(settings.fontSize)}
                                </span>
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
                                className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" 
                                style={{ accentColor: accentColor }} 
                            />
                        </div>
                    </div>
                    )}

                    {/* تخصيص الخط: صف كامل مستقل أسفل حجم الخط */}
                    {!isMadinahMode && (
                    <div id="font-family-row" className={`${isLandscape ? 'p-2.5 pb-3 rounded-xl' : 'p-3.5 pb-4 rounded-2xl'} app-page-card border-0 overflow-visible`} style={{ backgroundColor: cardSurfaceBg }}>
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
                                    className={`col-span-4 p-1.5 text-xs h-10 rounded-xl app-page-card border-0 flex justify-center items-center font-bold transition-all cursor-pointer ${settings.isBold ? 'quran-raised-btn-selected' : ''}`} 
                                    style={{ 
                                        backgroundColor: settings.isBold ? selectedControlBg : btnSurfaceBg,
                                        color: settings.isBold ? selectedControlText : bodyTextColor,
                                    }}
                                    title={isEn ? "Toggle bold font weight" : "تفعيل/إلاء سماكة الخط (Bold)"}
                                >
                                    <span className={`${settings.isBold ? 'font-black' : ''}`}>{isEn ? "Bold" : "سماكة"}</span>
                                </button>
                                <button 
                                    type="button"
                                    id="font-family-btn" 
                                    onClick={() => onOpenModal('font-modal')} 
                                    className="col-span-8 p-1.5 text-xs h-10 rounded-xl app-page-card border-0 flex justify-center items-center px-3 font-bold cursor-pointer"
                                    style={{ 
                                        backgroundColor: btnSurfaceBg,
                                        color: bodyTextColor,
                                    }}
                                >
                                    <span className="truncate text-center">{getFontName(settings.fontFamily)}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* ثانيا: بطاقة الألوان الثلاثة في صف واحد مدمج */}
                    <div id="colors-section" className={`${isLandscape ? 'p-2.5 pb-3 rounded-xl' : 'p-3.5 pb-4 rounded-2xl'} app-page-card border-0 overflow-visible`} style={{ backgroundColor: cardSurfaceBg }}>
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
                                    style={{ ...renderCheckerboard(settings.highlightTextColor || THEMES['green'].highlightText) }}
                                    onClick={() => setActiveColorField(activeColorField === 'highlightTextColor' ? null : 'highlightTextColor')}
                                    title={isEn ? "Highlight Color" : "لون التحديد"}
                                ></div>
                            </div>
                        </div>
                        
                        {activeColorField && (
                            <div className="p-3.5 pb-4 rounded-2xl app-page-card border-0 mt-4 animate-fadeIn overflow-visible" style={{ backgroundColor: cardSurfaceBg }}>
                                <div className="flex justify-between items-center mb-2.5 overflow-visible">
                                    <span className="text-xs font-bold" style={{ color: bodyTextColor }}>
                                        {isEn 
                                            ? `Select ${activeColorField === 'bgColor' ? 'Background' : activeColorField === 'textColor' ? 'Text' : 'Highlight'} Color` 
                                            : `اختر لون ${activeColorField === 'bgColor' ? 'الخلفية' : activeColorField === 'textColor' ? 'النص' : 'التحديد'}`
                                        }
                                    </span>
                                    <button type="button" onClick={() => setActiveColorField(null)} className="app-page-card border-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ backgroundColor: btnSurfaceBg, color: bodyTextColor }}>
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
                                            className={`h-8 rounded-xl app-page-card border-0 transition-transform cursor-pointer ${settings[activeColorField] === c ? 'ring-2 scale-110' : ''}`}
                                            style={{ ...renderCheckerboard(c), ...(settings[activeColorField] === c ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}) }}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* أولاً: بطاقة القارئ وبطاقة التفسير في صف واحد */}
                    <div id="reciter-tafseer-row" className={`grid grid-cols-2 ${isLandscape ? 'gap-2.5' : 'gap-3'} py-0.5 overflow-visible`}>
                        <div id="reciter-section" className={`flex flex-col ${isEn ? 'text-left' : 'text-right'} overflow-visible`}>
                            <label className="text-xs font-bold block opacity-85 mb-1.5">{isEn ? "Reciter" : "القارئ"}</label>
                            <button 
                                type="button"
                                onClick={() => onOpenModal('reciter-modal')} 
                                className={`w-full ${isLandscape ? 'min-h-[40px] py-1.5 px-2.5 text-[11.5px] leading-tight' : 'p-2.5 text-xs h-10 px-3'} rounded-2xl app-page-card border-0 flex justify-center items-center font-bold cursor-pointer`}
                                style={{ 
                                    backgroundColor: btnSurfaceBg, 
                                    color: bodyTextColor, 
                                }}
                            >
                                <span className={`${isLandscape ? 'text-center leading-tight' : 'truncate text-center'}`}>{getReaderName(settings.reader)}</span>
                            </button>
                        </div>
                        <div id="tafseer-section" className={`flex flex-col ${isEn ? 'text-left' : 'text-right'} overflow-visible`}>
                            <label className="text-xs font-bold block opacity-85 mb-1.5">{isEn ? "Tafseer" : "التفسير"}</label>
                            <button 
                                type="button"
                                onClick={() => onOpenModal('tafseer-selection-modal')} 
                                className={`w-full ${isLandscape ? 'min-h-[40px] py-1.5 px-2.5 text-[11.5px] leading-tight' : 'p-2.5 text-xs h-10 px-3'} rounded-2xl app-page-card border-0 flex justify-center items-center font-bold cursor-pointer`}
                                style={{ 
                                    backgroundColor: btnSurfaceBg, 
                                    color: bodyTextColor, 
                                }}
                            >
                                <span className={`${isLandscape ? 'text-center leading-tight' : 'truncate text-center'}`}>{getTafseerName(settings.tafseer)}</span>
                            </button>
                        </div>
                    </div>

                    {/* بطاقة تكرار الآية بعرض كامل الصف */}
                    <div id="repeat-and-notifications-row" className="py-0.5 overflow-visible">
                        {/* تكرار الآية */}
                        <div id="ayah-repeat-section" className={`flex flex-col ${isEn ? 'text-left' : 'text-right'} w-full overflow-visible`}>
                            <label className="text-xs font-bold opacity-85 mb-1.5 truncate">{isEn ? "Ayah Repeat" : "تكرار الآية"}</label>
                            <div className="py-2.5 pb-3 flex items-center justify-around px-3 rounded-2xl app-page-card border-0 w-full overflow-visible" style={{ backgroundColor: cardSurfaceBg }}>
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
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all app-page-card border-0 cursor-pointer ${
                                            settings.ayahRepeatCount === num 
                                            ? 'quran-raised-btn-selected font-black' 
                                            : 'opacity-90 hover:opacity-100'
                                        }`}
                                        style={settings.ayahRepeatCount === num ? { backgroundColor: selectedControlBg, color: selectedControlText } : { backgroundColor: btnSurfaceBg, color: bodyTextColor }}
                                        title={`${isEn ? "Repeat" : "تكرار"} ${num}`}
                                    >
                                        {isEn ? num : toArabic(num)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* تصميم رأس السورة */}
                    {!isMadinahMode && (
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
                    )}

                    {/* رابعا: وضع إخفاء الأشرطة بنفس صف بطاقة سرعة التمرير */}
                    {!isMadinahMode && (
                    <div id="scroll-speed-and-hide-toolbars-row" className={`grid grid-cols-2 ${isLandscape ? 'gap-2.5' : 'gap-3'} py-0.5 overflow-visible`}>
                        {/* سرعة التمرير */}
                        <div id="scroll-speed-section" className="flex flex-col text-right overflow-visible">
                            <label className="text-xs font-bold opacity-85 mb-1.5">{isEn ? "Scroll Speed" : "سرعة التمرير"}</label>
                            <button 
                                type="button"
                                onClick={() => onOpenModal('scroll-speed-modal')} 
                                className="w-full p-2.5 text-xs h-10 rounded-2xl app-page-card border-0 flex justify-center items-center px-3 font-bold cursor-pointer"
                                style={{ backgroundColor: btnSurfaceBg, color: bodyTextColor }}
                            >
                                <span className={`${isLandscape ? 'text-center' : 'truncate text-center'}`}>{settings.scrollMinutes} {isEn ? "min" : "دقيقة"}</span>
                            </button>
                        </div>

                        {/* إخفاء الأشرطة */}
                        <div id="hide-toolbars-section" className="flex flex-col text-right overflow-visible">
                            <label className="text-xs font-bold opacity-85 mb-1.5">{isEn ? "Hide Toolbars" : "إخفاء الأشرطة"}</label>
                            <div
                                role="switch"
                                aria-checked={isHideToolbarsEnabled}
                                tabIndex={0}
                                onClick={() => handleHideToolbarsToggle(!isHideToolbarsEnabled)}
                                className="h-10 flex items-center justify-between gap-2 px-3.5 rounded-2xl app-page-card tasbeeh-pressable border-0 cursor-pointer overflow-visible"
                                style={{ backgroundColor: cardSurfaceBg }}
                            >
                                <span className="text-[11px] opacity-80 font-bold whitespace-nowrap">{isHideToolbarsEnabled ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
                                <input 
                                    type="checkbox" 
                                    id="hide-toolbars" 
                                    checked={isHideToolbarsEnabled} 
                                    onChange={(e) => handleHideToolbarsToggle(e.target.checked)} 
                                    className="sr-only"
                                />
                                <div
                                    className="app-3d-switch-track border-0 relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 p-0.5"
                                    style={{ backgroundColor: isHideToolbarsEnabled ? selectedControlBg : (isDarkTheme ? '#3f3f46' : '#d1d5db') }}
                                >
                                    <div
                                        className={`app-3d-switch-thumb w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                            isHideToolbarsEnabled ? (isEn ? 'translate-x-5' : '-translate-x-5') : 'translate-x-0'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {isMadinahMode && (
                    <div id="madinah-reading-direction-section" className="py-0.5 overflow-visible">
                        <div className={`flex flex-col ${isEn ? 'text-left' : 'text-right'} w-full overflow-visible`}>
                            <label className="text-xs font-bold opacity-85 mb-1.5 truncate">
                                {isEn ? "Reading Mode" : "وضع القراءة"}
                            </label>
                            <div className={`grid grid-cols-2 ${isLandscape ? 'gap-2.5' : 'gap-3'} overflow-visible`}>
                                <button
                                    type="button"
                                    id="madinah-mode-horizontal-btn"
                                    onClick={() => {
                                        if ((settings.madinahReadingDirection || 'horizontal') !== 'horizontal') {
                                            updateSetting('madinahReadingDirection', 'horizontal');
                                            showToast(isEn ? 'Horizontal reading mode enabled' : 'تم التبديل إلى الوضع الأفقي');
                                        }
                                    }}
                                    className={`h-10 px-3 rounded-2xl app-page-card border-0 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                                        (settings.madinahReadingDirection || 'horizontal') === 'horizontal'
                                            ? 'quran-raised-btn-selected font-black'
                                            : 'opacity-90 hover:opacity-100'
                                    }`}
                                    style={(settings.madinahReadingDirection || 'horizontal') === 'horizontal'
                                        ? { backgroundColor: selectedControlBg, color: selectedControlText }
                                        : { backgroundColor: btnSurfaceBg, color: bodyTextColor }}
                                >
                                    <i className="fa-solid fa-arrows-left-right text-xs"></i>
                                    <span>{isEn ? "Horizontal" : "الوضع الأفقي"}</span>
                                </button>
                                <button
                                    type="button"
                                    id="madinah-mode-vertical-btn"
                                    onClick={() => {
                                        if (settings.madinahReadingDirection !== 'vertical') {
                                            updateSetting('madinahReadingDirection', 'vertical');
                                            showToast(isEn ? 'Vertical reading mode enabled' : 'تم التبديل إلى الوضع الرأسي');
                                        }
                                    }}
                                    className={`h-10 px-3 rounded-2xl app-page-card border-0 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                                        settings.madinahReadingDirection === 'vertical'
                                            ? 'quran-raised-btn-selected font-black'
                                            : 'opacity-90 hover:opacity-100'
                                    }`}
                                    style={settings.madinahReadingDirection === 'vertical'
                                        ? { backgroundColor: selectedControlBg, color: selectedControlText }
                                        : { backgroundColor: btnSurfaceBg, color: bodyTextColor }}
                                >
                                    <i className="fa-solid fa-arrows-up-down text-xs"></i>
                                    <span>{isEn ? "Vertical" : "الوضع الرأسي"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    )}

                    <div className="space-y-3 overflow-visible">
                        <div id="toggles-section" className="overflow-visible">
                            <div id="sajdah-row" className={`grid ${isMadinahMode ? 'grid-cols-1' : 'grid-cols-2'} ${isLandscape ? 'gap-2.5' : 'gap-3'} py-0.5 overflow-visible`}>
                                {/* بطاقة السجدة */}
                                {!isMadinahMode && (
                                <div id="sajdah-section" className="flex flex-col text-right overflow-visible">
                                    <label className={`text-xs font-bold opacity-85 mb-1.5 ${isLandscape ? '' : 'truncate'}`}>{isEn ? "Show Sajdah Card" : "إظهار بطاقة السجدة"}</label>
                                    <div
                                        role="switch"
                                        aria-checked={showSajdahCard}
                                        tabIndex={0}
                                        onClick={() => handleSajdahCardToggle(!showSajdahCard)}
                                        className="h-10 flex items-center justify-between gap-2 px-3.5 rounded-2xl app-page-card tasbeeh-pressable border-0 cursor-pointer overflow-visible"
                                        style={{ backgroundColor: cardSurfaceBg }}
                                    >
                                        <span className="text-[11px] opacity-80 font-bold whitespace-nowrap">{showSajdahCard ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
                                        <input 
                                            type="checkbox" 
                                            id="show-sajdah-card" 
                                            checked={showSajdahCard} 
                                            onChange={(e) => handleSajdahCardToggle(e.target.checked)} 
                                            className="sr-only"
                                        />
                                        <div
                                            className="app-3d-switch-track border-0 relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 p-0.5"
                                            style={{ backgroundColor: showSajdahCard ? selectedControlBg : (isDarkTheme ? '#3f3f46' : '#d1d5db') }}
                                        >
                                            <div
                                                className={`app-3d-switch-thumb w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                                    showSajdahCard ? (isEn ? 'translate-x-5' : '-translate-x-5') : 'translate-x-0'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                                )}

                                {/* تظليل كلمة بكلمة */}
                                <div id="word-highlight-section" className="flex flex-col text-right overflow-visible">
                                    <label className={`text-xs font-bold opacity-85 mb-1.5 ${isLandscape ? '' : 'truncate'}`}>{isEn ? "Word Sync Audio" : "تظليل كلمة بكلمة"}</label>
                                    <div
                                        role="switch"
                                        aria-checked={!!settings.wordHighlightEnabled}
                                        tabIndex={0}
                                        onClick={() => {
                                            const checked = !settings.wordHighlightEnabled;
                                            updateSetting('wordHighlightEnabled', checked);
                                            showToast(checked ? (isEn ? 'Word highlight enabled' : 'تم تفعيل تظليل كلمة بكلمة') : (isEn ? 'Word highlight disabled' : 'تم تعطيل تظليل كلمة بكلمة'));
                                        }}
                                        className="h-10 flex items-center justify-between gap-2 px-3.5 rounded-2xl app-page-card tasbeeh-pressable border-0 cursor-pointer overflow-visible"
                                        style={{ backgroundColor: cardSurfaceBg }}
                                    >
                                        <span className="text-[11px] opacity-80 font-bold whitespace-nowrap">{settings.wordHighlightEnabled ? (isEn ? "Enabled" : "مفعّل") : (isEn ? "Disabled" : "معطّل")}</span>
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
                                            className="app-3d-switch-track border-0 relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 p-0.5"
                                            style={{ backgroundColor: settings.wordHighlightEnabled ? selectedControlBg : (isDarkTheme ? '#3f3f46' : '#d1d5db') }}
                                        >
                                            <div
                                                className={`app-3d-switch-thumb w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                                    settings.wordHighlightEnabled ? (isEn ? 'translate-x-5' : '-translate-x-5') : 'translate-x-0'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* اختيار لون تظليل الكلمة المستقل مع المعاينة الحية */}
                                {settings.wordHighlightEnabled && (
                                    <div className={`${isMadinahMode ? 'col-span-1' : 'col-span-2'} mt-2 p-3.5 pb-4 rounded-2xl space-y-3 app-page-card border-0 transition-all overflow-visible`} style={{ backgroundColor: cardSurfaceBg }}>
                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <span style={{ color: bodyTextColor }}>{isEn ? "Spoken Word Color" : "لون الكلمة المنطوقة"}</span>
                                                <span className="text-[10px] opacity-80" style={{ color: accentColor }}>
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

                    {(() => {
                        const activeFrameDesign = normalizeMadinahFrameDesign(settings.madinahFrameDesign);
                        const activeFrameMeta = MADINAH_FRAME_DESIGNS.find((d) => d.id === activeFrameDesign) || MADINAH_FRAME_DESIGNS[0];
                        const activeFrameName = activeFrameMeta?.[isEn ? 'nameEn' : 'nameAr'];
                        const framePalette = getMadinahThemePalette(currentTheme);
                        const isMushafMode = readingMode === 'mushaf';
                        const showMushafFrame = settings.showMushafFrame !== false;
                        const handleToggleMushafFrame = (checked: boolean) => {
                            updateSetting('showMushafFrame', checked);
                            showToast(
                                checked
                                    ? (isEn ? 'Page frame enabled' : 'تم إظهار إطار الصفحة')
                                    : (isEn ? 'Page frame hidden' : 'تم إخفاء إطار الصفحة')
                            );
                        };
                        return (
                            <div
                                ref={frameSectionRef}
                                id="madinah-frame-design-section"
                                className={`${isLandscape ? 'p-2.5 pb-3 rounded-xl' : 'p-3.5 pb-4 rounded-2xl'} app-page-card border-0 overflow-visible`}
                                style={{ backgroundColor: cardSurfaceBg }}
                            >
                                <div className="flex items-center justify-between mb-2.5 overflow-visible">
                                    <label className="text-xs font-bold opacity-85">
                                        {isEn ? 'Page Frame & Ornament' : 'إطارات وزخارف الصفحة'}
                                    </label>
                                    <span
                                        className="text-[11px] font-bold opacity-80"
                                        style={{ color: accentColor }}
                                    >
                                        {activeFrameName}
                                    </span>
                                </div>
                                {isMushafMode && (
                                    <div
                                        id="mushaf-frame-visibility-toggle"
                                        role="switch"
                                        aria-checked={showMushafFrame}
                                        tabIndex={0}
                                        onClick={() => handleToggleMushafFrame(!showMushafFrame)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleToggleMushafFrame(!showMushafFrame);
                                            }
                                        }}
                                        className="h-10 mb-2.5 flex items-center justify-between gap-2 px-3.5 rounded-2xl app-page-card tasbeeh-pressable border-0 cursor-pointer overflow-visible"
                                        style={{ backgroundColor: btnSurfaceBg, color: bodyTextColor }}
                                    >
                                        <span className="text-xs font-bold">
                                            {isEn ? 'Show Page Frame' : 'إظهار إطار الصفحة'}
                                        </span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[11px] opacity-80 font-bold whitespace-nowrap">
                                                {showMushafFrame ? (isEn ? 'Enabled' : 'مفعّل') : (isEn ? 'Disabled' : 'معطّل')}
                                            </span>
                                            <div
                                                className="app-3d-switch-track border-0 relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 p-0.5"
                                                style={{ backgroundColor: showMushafFrame ? selectedControlBg : (isDarkTheme ? '#3f3f46' : '#d1d5db') }}
                                            >
                                                <div
                                                    className={`app-3d-switch-thumb w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                                        showMushafFrame ? (isEn ? 'translate-x-5' : '-translate-x-5') : 'translate-x-0'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    id="madinah-frame-dropdown-trigger"
                                    type="button"
                                    aria-expanded={isFrameMenuOpen}
                                    onClick={() => {
                                        const next = !isFrameMenuOpen;
                                        setIsFrameMenuOpen(next);
                                        if (next) {
                                            setTimeout(() => {
                                                frameSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                            }, 60);
                                        }
                                    }}
                                    className={`w-full h-10 px-3.5 rounded-2xl app-page-card border-0 flex items-center justify-between gap-2 text-xs font-bold transition-all cursor-pointer ${isMushafMode && !showMushafFrame ? 'opacity-65' : ''}`}
                                    style={{ backgroundColor: btnSurfaceBg, color: bodyTextColor }}
                                >
                                    <span className="flex items-center gap-2 min-w-0 truncate">
                                        <i className="fa-solid fa-swatchbook text-xs shrink-0" style={{ color: accentColor }}></i>
                                        <span className="truncate">{activeFrameName}</span>
                                    </span>
                                    <i
                                        className={`fa-solid fa-chevron-down text-[11px] shrink-0 opacity-75 transition-transform duration-200 ${isFrameMenuOpen ? 'rotate-180' : ''}`}
                                    ></i>
                                </button>
                                {isFrameMenuOpen && (
                                    <div
                                        id="madinah-frame-dropdown-list"
                                        className={`mt-2.5 p-2.5 rounded-2xl app-page-card border-0 animate-fadeIn overflow-visible ${isMushafMode && !showMushafFrame ? 'opacity-65' : ''}`}
                                        style={{ backgroundColor: resolvedPageBg }}
                                    >
                                        <div className={`grid ${isLandscape ? 'grid-cols-3 gap-2' : 'grid-cols-2 gap-2.5'} overflow-visible`}>
                                            {MADINAH_FRAME_DESIGNS.map((designMeta) => {
                                                const isSelected = activeFrameDesign === designMeta.id;
                                                return (
                                                    <button
                                                        key={designMeta.id}
                                                        type="button"
                                                        onClick={() => {
                                                            updateSetting('madinahFrameDesign', designMeta.id);
                                                            setIsFrameMenuOpen(false);
                                                            showToast(
                                                                isEn
                                                                    ? `Frame changed to ${designMeta.nameEn}`
                                                                    : `تم اختيار إطار: ${designMeta.nameAr}`
                                                            );
                                                        }}
                                                        className={`relative rounded-xl p-1.5 flex flex-col items-center gap-1.5 transition-all app-page-card border-0 cursor-pointer ${
                                                            isSelected
                                                                ? 'quran-raised-btn-selected ring-2 scale-[1.02]'
                                                                : 'opacity-90 hover:opacity-100'
                                                        }`}
                                                        style={{
                                                            backgroundColor: btnSurfaceBg,
                                                            color: bodyTextColor,
                                                            ...(isSelected ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}),
                                                        }}
                                                        title={isEn ? designMeta.nameEn : designMeta.nameAr}
                                                    >
                                                        <div className="w-full relative pointer-events-none">
                                                            <MadinahFrameMiniPreview
                                                                design={designMeta.id}
                                                                palette={framePalette}
                                                            />
                                                            {isSelected && (
                                                                <span
                                                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow"
                                                                    style={{ backgroundColor: selectedControlBg, color: selectedControlText }}
                                                                >
                                                                    <i className="fa-solid fa-check"></i>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] font-bold leading-tight truncate w-full text-center">
                                                            {isEn ? designMeta.nameEn : designMeta.nameAr}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <div id="downloads-section" className="space-y-2 py-0.5 overflow-visible">
                        {/* وضع بطاقة تحميل القرآن الكريم وبطاقة تحميل التفسير في صف واحد */}
                        <div id="downloads-only-section" className="overflow-visible">
                            <div className={`grid grid-cols-2 ${isLandscape ? 'gap-2.5' : 'gap-3'} overflow-visible`}>
                                <button 
                                    type="button"
                                    id="quran-download-btn" 
                                    onClick={() => onOpenModal('quran-download-modal')} 
                                    className={`text-xs ${isLandscape ? 'min-h-[40px] py-1.5 px-2.5 text-[11.5px]' : 'h-10 px-3'} w-full text-center flex items-center justify-center rounded-2xl app-page-card border-0 font-bold cursor-pointer`}
                                    style={{ backgroundColor: btnSurfaceBg, color: bodyTextColor }}
                                >
                                    <span className={`${isLandscape ? 'text-center leading-tight' : 'truncate text-center'}`}>{isEn ? "Download Quran" : "تحميل القرآن الكريم"}</span>
                                </button>
                                
                                <button 
                                    type="button"
                                    id="tafseer-download-btn" 
                                    onClick={() => onOpenModal('tafsir-download-modal')} 
                                    className={`text-xs ${isLandscape ? 'min-h-[40px] py-1.5 px-2.5 text-[11.5px]' : 'h-10 px-3'} w-full text-center flex items-center justify-center rounded-2xl app-page-card border-0 font-bold cursor-pointer`}
                                    style={{ backgroundColor: btnSurfaceBg, color: bodyTextColor }}
                                >
                                    <span className={`${isLandscape ? 'text-center leading-tight' : 'truncate text-center'}`}>{isEn ? "Download Tafseer" : "تحميل التفسير"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default SettingsModal;