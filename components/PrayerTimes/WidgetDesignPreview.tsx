import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { usePrayerTimes, usePrayerCountdown } from '../../context/PrayerTimesContext';
import { useTheme } from '../../context/ThemeContext';
import {
    WidgetStyleType,
    SingleWidgetSettings,
    DEFAULT_WIDGET_SETTINGS_BY_STYLE,
    getWidgetStyle,
    setWidgetStyle,
    getSingleWidgetSettings,
    saveSingleWidgetSettings,
    updateAndroidWidget,
    syncWidgetThemeColors,
    getWidgetThemePalette
} from '../../utils/widgetUtils';
import { Check, Sparkles, Smartphone, Layers, Moon, Clock, RefreshCw, ZoomIn, Info, Sliders, Palette, Eye, X } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';

interface WidgetDesignPreviewProps {
    onClose?: () => void;
}

export const WidgetDesignPreview: React.FC<WidgetDesignPreviewProps> = ({ onClose }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const { times, dates, nextPrayer } = usePrayerTimes();
    const countdown = usePrayerCountdown();
    const { theme, themeKey } = useTheme();

    const [selectedStyle, setSelectedStyle] = useState<WidgetStyleType>('classic');
    const [savedStyle, setSavedStyle] = useState<WidgetStyleType>('classic');
    const [previewScale, setPreviewScale] = useState<number>(1);
    const [showGuide, setShowGuide] = useState<boolean>(false);
    const [isSavedToast, setIsSavedToast] = useState<boolean>(false);

    // Per-Widget Customization & Settings States: Each design has its OWN separate settings!
    const [settingsByStyle, setSettingsByStyle] = useState<Record<WidgetStyleType, SingleWidgetSettings>>(() => ({
        classic: getSingleWidgetSettings('classic'),
        compact: getSingleWidgetSettings('compact'),
        single: getSingleWidgetSettings('single'),
    }));

    useEffect(() => {
        getWidgetStyle().then(style => {
            const validStyle = (style === 'compact' || style === 'single') ? style : 'classic';
            setSavedStyle(validStyle);
            setSelectedStyle(validStyle);
        });
        // Refresh all styles from storage
        setSettingsByStyle({
            classic: getSingleWidgetSettings('classic'),
            compact: getSingleWidgetSettings('compact'),
            single: getSingleWidgetSettings('single'),
        });
    }, []);

    // Currently active settings for the chosen widget design
    const currentSettings = useMemo(() => {
        return settingsByStyle[selectedStyle] || DEFAULT_WIDGET_SETTINGS_BY_STYLE[selectedStyle] || DEFAULT_WIDGET_SETTINGS_BY_STYLE.classic;
    }, [settingsByStyle, selectedStyle]);

    // Update settings strictly for the currently selected widget design
    const updateCurrentSetting = <K extends keyof SingleWidgetSettings>(key: K, value: SingleWidgetSettings[K]) => {
        setSettingsByStyle(prev => {
            const updated = {
                ...prev,
                [selectedStyle]: {
                    ...prev[selectedStyle],
                    [key]: value
                }
            };
            saveSingleWidgetSettings(selectedStyle, updated[selectedStyle]);
            return updated;
        });
    };

    const handleSaveAllSettings = async (styleToSave?: WidgetStyleType) => {
        const activeStyle = styleToSave || selectedStyle;
        setSelectedStyle(activeStyle);
        await setWidgetStyle(activeStyle);
        setSavedStyle(activeStyle);

        // Save each style's separate settings to localStorage & Preferences
        for (const style of ['classic', 'compact', 'single'] as WidgetStyleType[]) {
            const st = settingsByStyle[style] || DEFAULT_WIDGET_SETTINGS_BY_STYLE[style];
            await saveSingleWidgetSettings(style, st);
        }

        // Trigger native Android widget update
        try {
            const rawTimes = times || {
                fajr: '04:30',
                sunrise: '05:50',
                dhuhr: '11:45',
                asr: '02:55',
                maghrib: '05:40',
                isha: '07:10'
            };
            await updateAndroidWidget({
                hijri: dates?.hijri || '',
                gregorian: dates?.gregorian || '',
                day: '',
                city: '',
                next_prayer_name: nextPrayer?.name || 'الفجر',
                next_prayer_id: nextPrayer?.key?.toLowerCase() || 'fajr',
                remaining_time: countdown || '00:00:00',
                midnight: '11:45',
                last_third: '02:30',
                times: {
                    fajr: rawTimes.Fajr || rawTimes.fajr || '04:30',
                    sunrise: rawTimes.Sunrise || rawTimes.sunrise || '05:50',
                    dhuhr: rawTimes.Dhuhr || rawTimes.dhuhr || '11:45',
                    asr: rawTimes.Asr || rawTimes.asr || '02:55',
                    maghrib: rawTimes.Maghrib || rawTimes.maghrib || '05:40',
                    isha: rawTimes.Isha || rawTimes.isha || '07:10'
                }
            });
            const activeThemeChoice = settingsByStyle[activeStyle]?.themeChoice || 'golden_trio';
            await syncWidgetThemeColors(activeThemeChoice === 'app_theme' ? themeKey : activeThemeChoice, theme);
        } catch (e) {}

        setIsSavedToast(true);
        setTimeout(() => setIsSavedToast(false), 2800);
        window.dispatchEvent(new CustomEvent('widget-settings-changed'));
    };

    // Calculate previous prayer from sequence
    const previousPrayer = useMemo(() => {
        const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const currentKey = nextPrayer?.key || 'Fajr';
        const currentIdx = order.indexOf(currentKey);
        const prevIdx = (currentIdx - 1 + order.length) % order.length;
        const prevKey = order[prevIdx];

        const namesAr: Record<string, string> = {
            Fajr: 'الفجر',
            Sunrise: 'الشروق',
            Dhuhr: 'الظهر',
            Asr: 'العصر',
            Maghrib: 'المغرب',
            Isha: 'العشاء'
        };
        const namesEn: Record<string, string> = {
            Fajr: 'Fajr',
            Sunrise: 'Sunrise',
            Dhuhr: 'Dhuhr',
            Asr: 'Asr',
            Maghrib: 'Maghrib',
            Isha: 'Isha'
        };

        return {
            key: prevKey,
            name: isEn ? namesEn[prevKey] : namesAr[prevKey],
            time: times?.[prevKey] || '--:--'
        };
    }, [nextPrayer, isEn, times]);

    const activeNextName = useMemo(() => {
        if (!nextPrayer) return isEn ? 'Fajr' : 'الفجر';
        const namesEn: Record<string, string> = {
            Fajr: 'Fajr',
            Sunrise: 'Sunrise',
            Dhuhr: 'Dhuhr',
            Asr: 'Asr',
            Maghrib: 'Maghrib',
            Isha: 'Isha'
        };
        return isEn ? (namesEn[nextPrayer.key] || nextPrayer.name) : nextPrayer.name;
    }, [nextPrayer, isEn]);

    const activeNextTime = useMemo(() => {
        if (!nextPrayer) return '--:--';
        return times?.[nextPrayer.key] || '--:--';
    }, [nextPrayer, times]);

    const stylesMeta = [
        {
            id: 'classic' as WidgetStyleType,
            titleAr: '١. مواقيت الصلاة - كلاسيكي شامل (٤×١)',
            titleEn: '1. Classic Full Prayer Matrix (4x1)',
            badgeAr: 'التصميم الشامل المعتمد',
            badgeEn: 'Original Full Matrix',
            descAr: 'الجدول الشامل لمواقيت الصلوات الست مع التاريخ وشريط الألوان وأوقات قيام الليل بالزمردي والذهبي الملكي.',
            descEn: 'Full 6-prayer matrix with Hijri/Gregorian date, four-color divider, and night milestones.',
            icon: Clock
        },
        {
            id: 'compact' as WidgetStyleType,
            titleAr: '٢. مواقيت الصلاة - مصغر (السابقة والقادمة)',
            titleEn: '2. Compact Focus (Prev & Next)',
            badgeAr: 'حجم مدمج • كروت مجسمة',
            badgeEn: 'Ultra-Compact • 3D Cards',
            descAr: 'يحتوي فقط على التاريخ والصلاة السابقة والصلاة القادمة والوقت المتبقي في بطاقات مجسمة بارزة وساطعة.',
            descEn: 'Strictly displays Date, Previous Prayer, Next Prayer, and remaining countdown in 3D tactile cards.',
            icon: Sparkles
        },
        {
            id: 'single' as WidgetStyleType,
            titleAr: '٣. مواقيت الصلاة - الصلاة القادمة فقط (٢×١)',
            titleEn: '3. Next Prayer Only (2x1)',
            badgeAr: 'حجم مصغر ٢×١ • الصلاة القادمة فقط',
            badgeEn: 'Ultra-Minimal 2x1 • Next Prayer Only',
            descAr: 'تطبيق مصغر بحجم ٢×١ خفيف وأنيق، يعرض اسم الصلاة القادمة والوقت المتبقي فقط مع إمكانية تكبيره.',
            descEn: 'Ultra-minimal 2x1 widget displaying only the next prayer and countdown with resize capability.',
            icon: Layers
        }
    ];

    // Compute dynamic live preview background color based on currently selected widget's theme & opacity
    const previewBgStyle = useMemo(() => {
        const choice = currentSettings.themeChoice;
        const op = currentSettings.opacity;

        if (choice === 'royal_gold_3d') return `rgba(45, 22, 0, ${op})`;
        if (choice === 'emerald_prism_3d') return `rgba(2, 44, 34, ${op})`;
        if (choice === 'ruby_gem_3d') return `rgba(76, 5, 25, ${op})`;
        if (choice === 'antique_bronze_3d') return `rgba(38, 26, 18, ${op})`;
        if (choice === 'royal_marble_3d') return `rgba(248, 250, 252, ${op})`;
        if (choice === 'pearl_white_3d') return `rgba(241, 245, 249, ${op})`;
        if (choice === 'golden_trio') return `rgba(248, 222, 138, ${op})`;
        if (choice === 'violet_green_light') return `rgba(243, 232, 255, ${op})`;
        if (choice === 'sky_blue_light') return `rgba(224, 242, 254, ${op})`;
        if (choice === 'rose_peach_light') return `rgba(255, 241, 242, ${op})`;
        if (choice === 'emerald_mint_light') return `rgba(236, 253, 245, ${op})`;
        if (choice === 'deep_black') return `rgba(0, 0, 0, ${op})`;
        if (choice === 'shiny_gold') return `rgba(234, 179, 8, ${op})`;
        if (choice === 'emerald_night') return `rgba(4, 54, 40, ${op})`;
        if (choice === 'royal_navy') return `rgba(15, 23, 42, ${op})`;
        if (choice === 'royal_purple') return `rgba(46, 16, 101, ${op})`;
        if (choice === 'deep_forest') return `rgba(2, 44, 34, ${op})`;
        if (choice === 'golden_sand') return `rgba(69, 26, 3, ${op})`;
        if (choice === 'fajr_light') return `rgba(2, 132, 199, ${op})`;
        if (choice === 'neon_cyber') return `rgba(9, 13, 22, ${op})`;
        if (choice === 'sunset_amber') return `rgba(124, 45, 18, ${op})`;
        if (choice === 'rose_velvet') return `rgba(136, 19, 55, ${op})`;
        if (choice === 'midnight_sapphire') return `rgba(30, 27, 75, ${op})`;
        if (choice === 'mint_fresh') return `rgba(6, 95, 70, ${op})`;
        if (choice === 'bronze_copper') return `rgba(120, 53, 15, ${op})`;
        if (choice === 'amethyst_purple') return `rgba(88, 28, 135, ${op})`;
        if (choice === 'clean_paper') return `rgba(248, 250, 252, ${op})`;
        // Modern Vivid Themes
        if (choice === 'titanium_3d') return `rgba(24, 30, 36, ${op})`;
        if (choice === 'emerald_3d') return `rgba(2, 44, 34, ${op})`;
        if (choice === 'sapphire_3d') return `rgba(9, 21, 40, ${op})`;
        if (choice === 'gold_ingot_3d') return `rgba(20, 14, 3, ${op})`;
        if (choice === 'ruby_velvet_3d') return `rgba(51, 5, 14, ${op})`;
        if (choice === 'cyber_neon_3d') return `rgba(4, 7, 10, ${op})`;
        if (choice === 'violet_amethyst_3d') return `rgba(32, 5, 56, ${op})`;
        if (choice === 'copper_bronze_3d') return `rgba(38, 15, 4, ${op})`;
        if (choice === 'azure_crystal_3d') return `rgba(5, 34, 51, ${op})`;
        if (choice === 'desert_amber_3d') return `rgba(51, 22, 6, ${op})`;
        if (choice === 'mint_frost_3d') return `rgba(3, 33, 27, ${op})`;
        if (choice === 'app_theme') {
            return theme.isDark ? `rgba(24, 24, 27, ${op})` : `rgba(255, 255, 255, ${op})`;
        }
        // Default: Amber (عنبري)
        return `rgba(248, 222, 138, ${op})`;
    }, [currentSettings.themeChoice, currentSettings.opacity, theme.isDark]);

    // Compute dynamic text color based on currently selected widget's text color
    const previewTextColorStyle = useMemo(() => {
        if (currentSettings.textColor === 'white') return '#FFFFFF';
        if (currentSettings.textColor === 'emerald') return '#34D399';
        if (currentSettings.textColor === 'amber') return '#D97706';
        return '#FBBF24'; // Radiant Gold
    }, [currentSettings.textColor]);

    // Active color palette according to the widget's selected theme
    const activePalette = useMemo(() => {
        return getWidgetThemePalette(currentSettings.themeChoice || 'golden_trio');
    }, [currentSettings.themeChoice]);

    const activeMeta = stylesMeta.find(s => s.id === selectedStyle) || stylesMeta[0];

    const content = (
        <div className="space-y-4 max-w-2xl mx-auto w-full font-cairo" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 border-b pb-3 border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                        <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-base truncate">
                            {isEn ? 'Widget Designs & Customization' : 'تصاميم وإعدادات التطبيقات المصغرة (الودجت)'}
                        </h3>
                        <p className="text-[11px] opacity-70 truncate">
                            {isEn ? 'Each widget has completely separate settings, transparency & colors' : 'لكل تصميم مصغر إعداداته المستقلة تماماً في الألوان والشفافية'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowGuide(prev => !prev)}
                        className="px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        <Info className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{isEn ? 'How to Add' : 'طريقة الإضافة'}</span>
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            title={isEn ? "Close" : "إغلاق"}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Guide Collapse */}
            {showGuide && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs leading-relaxed space-y-2">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">
                        {isEn ? 'How to add widgets to your Android phone:' : 'خطوات إضافة الودجت على شاشة هاتفك الأندرويد:'}
                    </p>
                    <ol className="list-decimal ps-4 space-y-1.5 opacity-90 text-[11px] sm:text-xs">
                        <li>{isEn ? 'Go to your phone’s Home Screen and long-press on any empty area.' : 'انتقل للشاشة الرئيسية للهاتف واضغط مطولاً في أي مكان فارغ.'}</li>
                        <li>{isEn ? 'Tap "Widgets" (التطبيقات المصغرة).' : 'اختر «التطبيقات المصغرة / Widgets» من القائمة.'}</li>
                        <li>{isEn ? 'Scroll to "Mushaf Ahmed & Layla" to see all 4 distinct widgets ready to drag!' : 'ابحث عن تطبيق «مصحف أحمد وليلى»؛ ستجد التصاميم الأربعة متاحة باسمائها وصورها لسحبها فوراً!'}</li>
                        <li>{isEn ? 'Drag your chosen widget to the screen. You can resize it freely — text scales automatically!' : 'اسحب الودجت المطلوب إلى شاشتك، ويمكنك تكبيره وتصغيره وستتكيف النصوص تلقائياً!'}</li>
                    </ol>
                </div>
            )}

            {/* Style Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {stylesMeta.map((s) => {
                    const isSelected = selectedStyle === s.id;
                    const isDefault = savedStyle === s.id;
                    const Icon = s.icon;

                    return (
                        <div
                            key={s.id}
                            onClick={() => {
                                setSelectedStyle(s.id);
                                handleSaveAllSettings(s.id);
                            }}
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                isSelected
                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-md scale-[1.01]'
                                    : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20'
                            }`}
                        >
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-500' : 'opacity-60'}`} />
                                        <span className="font-bold text-xs sm:text-[13px] truncate">
                                            {isEn ? s.titleEn : s.titleAr}
                                        </span>
                                    </div>
                                    {isDefault && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                                            {isEn ? 'Active' : 'المعتمد'}
                                        </span>
                                    )}
                                </div>
                                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                    {isEn ? s.badgeEn : s.badgeAr}
                                </span>
                                <p className="text-[10.5px] opacity-75 line-clamp-2 leading-relaxed">
                                    {isEn ? s.descEn : s.descAr}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveAllSettings(s.id);
                                }}
                                className={`mt-2.5 w-full py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    isDefault
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-black/10 dark:bg-white/15 hover:bg-emerald-600 hover:text-white'
                                }`}
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isDefault ? (isEn ? 'Current Default' : 'التصميم المعتمد حالياً') : (isEn ? 'Set as Default' : 'اعتماد كتصميم رئيسي')}</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Widget Customization Controls strictly for currently selected style */}
            <div className="p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3.5">
                <div className="flex items-center justify-between border-b pb-2.5 border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-500" />
                        <h4 className="font-bold text-xs sm:text-sm">
                            {isEn ? 'Widget Customization & Settings' : 'تخصيص وإعدادات التصميم المحدد'}
                        </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-[11px] shadow-sm">
                        {isEn ? activeMeta.titleEn : activeMeta.titleAr}
                    </span>
                </div>

                {/* Scope Notice */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>
                        {isEn 
                            ? `Note: Transparency and theme changes below apply EXCLUSIVELY to "${activeMeta.titleEn}" without affecting the other 3 widgets.`
                            : `ملاحظة: تعديل الشفافية والألوان أدناه يتم تطبيقه حصرياً على "${activeMeta.titleAr}" دون التأثير على بقية الودجت الثلاثة.`}
                    </span>
                </div>

                {/* 1. Transparency / Opacity Slider for Selected Style */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 opacity-90">
                            <Eye className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{isEn ? `Opacity for ${activeMeta.titleEn}:` : `درجة الشفافية لتصميم (${activeMeta.titleAr}) فقط:`}</span>
                        </span>
                        <span className="text-amber-500 font-mono text-sm" dir="ltr">{Math.round(currentSettings.opacity * 100)}%</span>
                    </div>

                    <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={currentSettings.opacity}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateCurrentSetting('opacity', val);
                        }}
                        className="w-full accent-emerald-500 cursor-pointer h-2 bg-black/10 dark:bg-white/15 rounded-lg"
                    />

                    <div className="flex items-center justify-between gap-1 pt-1">
                        {[
                            { labelAr: '100% معتم', labelEn: 'Solid', val: 1.0 },
                            { labelAr: '95% مشرق', labelEn: 'Vibrant', val: 0.95 },
                            { labelAr: '80% زجاجي', labelEn: 'Glass', val: 0.80 },
                            { labelAr: '60% متوازن', labelEn: 'Semi', val: 0.60 }
                        ].map((btn) => (
                            <button
                                key={btn.val}
                                type="button"
                                onClick={() => updateCurrentSetting('opacity', btn.val)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    Math.abs(currentSettings.opacity - btn.val) < 0.05
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-black/5 dark:bg-white/10 opacity-75 hover:opacity-100'
                                }`}
                            >
                                {isEn ? btn.labelEn : btn.labelAr}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Color Scheme / Theme Selector for Selected Style (18 Vibrant Presets) */}
                <div className="space-y-1.5 pt-1">
                    <span className="block text-xs font-bold opacity-90 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isEn ? 'Color Palette Theme for this Widget:' : 'قائمة الثيمات الجديدة المتاحة لهذا الودجت:'}</span>
                    </span>

                    <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {[
                            { id: 'golden_trio', labelAr: 'عنبري', labelEn: 'Amber', bgHex: '#F8DE8A' },
                            { id: 'royal_gold_3d', labelAr: 'ذهبي', labelEn: 'Gold', bgHex: '#5E2E00' },
                            { id: 'antique_bronze_3d', labelAr: 'برونزي', labelEn: 'Bronze', bgHex: '#8C531B' },
                            { id: 'royal_marble_3d', labelAr: 'رخامي', labelEn: 'Marble', bgHex: '#FEF3C7' },
                            { id: 'pearl_white_3d', labelAr: 'لؤلؤي', labelEn: 'Pearl', bgHex: '#F1F5F9' },
                            { id: 'violet_green_light', labelAr: 'ليلكي', labelEn: 'Lilac', bgHex: '#F3E8FF' },
                            { id: 'sky_blue_light', labelAr: 'سماوي', labelEn: 'Sky', bgHex: '#E0F2FE' },
                            { id: 'rose_peach_light', labelAr: 'وردي', labelEn: 'Rose', bgHex: '#FFF1F2' },
                            { id: 'emerald_mint_light', labelAr: 'نعناعي', labelEn: 'Mint', bgHex: '#ECFDF5' },
                            { id: 'emerald_3d', labelAr: 'زمردي', labelEn: 'Emerald', bgHex: '#064E3B' },
                            { id: 'cyber_neon_3d', labelAr: 'نيون', labelEn: 'Neon', bgHex: '#0A121A' },
                            { id: 'violet_amethyst_3d', labelAr: 'بنفسجي', labelEn: 'Violet', bgHex: '#350A5C' },
                            { id: 'azure_crystal_3d', labelAr: 'لازوردي', labelEn: 'Azure', bgHex: '#083754' },
                            { id: 'default', labelAr: 'أخضر', labelEn: 'Green', bgHex: '#064E3B' },
                            { id: 'royal_navy', labelAr: 'كحلي', labelEn: 'Navy', bgHex: '#0F172A' },
                            { id: 'deep_black', labelAr: 'أسود', labelEn: 'Black', bgHex: '#000000' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => updateCurrentSetting('themeChoice', t.id)}
                                className={`p-2 rounded-xl text-[10.5px] font-bold text-center transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                                    currentSettings.themeChoice === t.id
                                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                                        : 'bg-black/5 dark:bg-white/10 opacity-80 hover:opacity-100'
                                }`}
                            >
                                <span className="truncate">{isEn ? t.labelEn : t.labelAr}</span>
                                <span 
                                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/40 shadow-xs" 
                                    style={{ backgroundColor: t.bgHex }} 
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Text & Highlighting Color for Selected Style */}
                <div className="space-y-1.5 pt-1">
                    <span className="block text-xs font-bold opacity-90">
                        {isEn ? 'Highlight & Countdown Color:' : 'لون الإبراز والعداد التنازلي:'}
                    </span>
                    <div className="flex items-center gap-2">
                        {[
                            { id: 'gold', labelAr: 'ذهبي ساطع', labelEn: 'Radiant Gold', hex: '#FBBF24' },
                            { id: 'emerald', labelAr: 'زمردي مشرق', labelEn: 'Bright Emerald', hex: '#34D399' },
                            { id: 'white', labelAr: 'أبيض ناصع', labelEn: 'Pure White', hex: '#FFFFFF' },
                            { id: 'amber', labelAr: 'كهرماني دافئ', labelEn: 'Warm Amber', hex: '#F59E0B' }
                        ].map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => updateCurrentSetting('textColor', c.id)}
                                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    currentSettings.textColor === c.id
                                        ? 'ring-2 ring-emerald-500 shadow-xs bg-emerald-500/15'
                                        : 'opacity-70 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: c.hex }}
                            >
                                <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                                <span>{isEn ? c.labelEn : c.labelAr}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Content Visibility Toggles */}
                {selectedStyle !== 'single' ? (
                    <div className="space-y-2 pt-1 border-t border-black/10 dark:border-white/10">
                        <span className="block text-xs font-bold opacity-90">
                            {isEn ? 'Show / Hide Widget Elements:' : 'خيارات إظهار وإخفاء المحتوى:'}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => updateCurrentSetting('showDate', !currentSettings.showDate)}
                                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                    currentSettings.showDate ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-black/5 dark:bg-white/5 opacity-60'
                                }`}
                            >
                                <span>{isEn ? 'Show Date' : 'إظهار التاريخ'}</span>
                                <Check className={`w-3.5 h-3.5 ${currentSettings.showDate ? 'opacity-100' : 'opacity-0'}`} />
                            </button>

                            <button
                                type="button"
                                onClick={() => updateCurrentSetting('showNight', !currentSettings.showNight)}
                                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                    currentSettings.showNight ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-black/5 dark:bg-white/5 opacity-60'
                                }`}
                            >
                                <span>{isEn ? 'Show Night Times' : 'أوقات قيام الليل'}</span>
                                <Check className={`w-3.5 h-3.5 ${currentSettings.showNight ? 'opacity-100' : 'opacity-0'}`} />
                            </button>

                            <button
                                type="button"
                                onClick={() => updateCurrentSetting('showCountdown', !currentSettings.showCountdown)}
                                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                    currentSettings.showCountdown ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-black/5 dark:bg-white/5 opacity-60'
                                }`}
                            >
                                <span>{isEn ? 'Show Countdown' : 'العد التنازلي'}</span>
                                <Check className={`w-3.5 h-3.5 ${currentSettings.showCountdown ? 'opacity-100' : 'opacity-0'}`} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span>
                            {isEn 
                                ? 'This 2x1 widget is exclusively dedicated to displaying the next prayer and remaining time without any other elements.' 
                                : 'هذا التطبيق المصغر (٢×١) مخصص حصرياً لعرض اسم الصلاة القادمة والوقت المتبقي فقط بتصميم فائق الخفة والتركيز.'}
                        </span>
                    </div>
                )}

                {/* Save All Customization Button */}
                <button
                    type="button"
                    onClick={() => handleSaveAllSettings()}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer mt-2"
                >
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Save & Apply Customization to Phone Widgets' : 'اعتماد وحفظ إعدادات هذا التصميم للتطبيق المصغر'}</span>
                </button>
            </div>

            {/* Resize Simulation Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                    <ZoomIn className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold">
                        {isEn ? 'Simulate Widget Resizing (Auto Text Scaling):' : 'معاينة تكبير وتصغير الودجت (تكبير النصوص تلقائياً):'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                        { label: isEn ? 'Squished' : 'مُصغّر رأسياً', scale: 0.72 },
                        { label: isEn ? 'Normal' : 'عادي', scale: 1 },
                        { label: isEn ? 'Medium' : 'متوسط', scale: 1.15 },
                        { label: isEn ? 'Large' : 'مكبر', scale: 1.3 }
                    ].map(btn => (
                        <button
                            key={btn.scale}
                            type="button"
                            onClick={() => setPreviewScale(btn.scale)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                previewScale === btn.scale
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-black/5 dark:bg-white/10 opacity-80'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Live Interactive 3D Mockup Container */}
            <div className="p-4 sm:p-6 rounded-3xl bg-radial from-slate-900 to-black border-2 border-emerald-500/30 shadow-2xl overflow-hidden relative">
                <div className="absolute top-2 start-3 flex items-center gap-1 text-[10px] font-mono text-slate-300">
                    <span>LIVE WIDGET PREVIEW</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{selectedStyle.toUpperCase()}</span>
                </div>

                <div 
                    className="mt-4 mx-auto transition-transform duration-300 origin-top flex justify-center"
                    style={{ transform: `scale(${previewScale})` }}
                >
                    {/* DESIGN 1: CLASSIC COMPREHENSIVE WIDGET (COMPACTED HEIGHT TO MATCH COMPACT WIDGET) */}
                    {selectedStyle === 'classic' && (
                        <div 
                            className="w-full max-w-sm rounded-[16px] shadow-xl overflow-hidden select-none transition-all duration-300"
                            style={{
                                background: previewBgStyle,
                                border: `2px solid ${activePalette.highlightPrayerColor || '#C86400'}`,
                                color: activePalette.textColor || '#000000'
                            }}
                        >
                            {/* Top Strip */}
                            <div 
                                className="flex items-center justify-between py-1 px-2.5 border-b"
                                style={{
                                    backgroundColor: activePalette.section1Bg || '#C86400',
                                    borderColor: `${activePalette.highlightPrayerColor || '#C86400'}40`
                                }}
                            >
                                {currentSettings.showCountdown && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-[11px] font-bold" style={{ color: activePalette.nextPrayerColor || '#FFFFFF' }}>
                                            {activeNextName} {isEn ? 'in' : 'بعد'}
                                        </span>
                                        <span className="text-xs font-mono font-bold" style={{ color: activePalette.themeKey === 'golden_trio' ? '#FFFFFF' : previewTextColorStyle }}>
                                            {countdown || '01:25:40'}
                                        </span>
                                    </div>
                                )}
                                {currentSettings.showDate && (
                                    <span className="text-[10.5px] font-bold ms-auto" style={{ color: activePalette.section1Text || '#FFFFFF' }}>
                                        {dates?.hijri || '10 رمضان 1445'}
                                    </span>
                                )}
                            </div>

                            {/* 4-Color Accent Strip */}
                            <div className="flex h-1 w-full">
                                <div className="flex-1" style={{ backgroundColor: activePalette.stripColor1 || '#C86400' }} />
                                <div className="flex-1" style={{ backgroundColor: activePalette.stripColor2 || '#F8DE8A' }} />
                                <div className="flex-1" style={{ backgroundColor: activePalette.stripColor3 || '#D97706' }} />
                                <div className="flex-1" style={{ backgroundColor: activePalette.stripColor4 || '#B45309' }} />
                            </div>

                            {/* 6 Prayers Row */}
                            <div 
                                className="grid grid-cols-6 divide-x divide-x-reverse py-1 text-center"
                                style={{
                                    backgroundColor: activePalette.cardBg || '#FFFFFF',
                                    borderColor: activePalette.sepColor || '#E5D07B'
                                }}
                            >
                                {[
                                    { key: 'Fajr', ar: 'الفجر', en: 'Fajr' },
                                    { key: 'Sunrise', ar: 'الشروق', en: 'Sunrise' },
                                    { key: 'Dhuhr', ar: 'الظهر', en: 'Dhuhr' },
                                    { key: 'Asr', ar: 'العصر', en: 'Asr' },
                                    { key: 'Maghrib', ar: 'المغرب', en: 'Maghrib' },
                                    { key: 'Isha', ar: 'العشاء', en: 'Isha' }
                                ].map(p => {
                                    const isNext = nextPrayer?.key === p.key;
                                    const isLightTheme = !activePalette.isDark;
                                    const normalNameColor = isLightTheme ? '#334155' : (activePalette.section1Text || '#FDE68A');
                                    const normalTimeColor = activePalette.textColor || (isLightTheme ? '#000000' : '#FFFFFF');
                                    const nextNameColor = isLightTheme ? (activePalette.highlightPrayerColor || '#C86400') : (activePalette.nextPrayerColor || '#FBBF24');
                                    const nextTimeColor = isLightTheme ? (activePalette.highlightPrayerColor || '#C86400') : previewTextColorStyle;

                                    return (
                                        <div 
                                            key={p.key} 
                                            className="px-0.5 py-0.5 rounded-lg transition-colors"
                                            style={isNext ? { backgroundColor: isLightTheme ? 'rgba(200, 100, 0, 0.12)' : `${activePalette.section1Bg || '#5E2E00'}90` } : undefined}
                                        >
                                            <span 
                                                className="block text-[10px] font-bold"
                                                style={{ color: isNext ? nextNameColor : normalNameColor }}
                                            >
                                                {isEn ? p.en : p.ar}
                                            </span>
                                            <span 
                                                className={`block text-[11px] font-mono font-bold mt-0.5 ${isNext ? 'font-black scale-105' : ''}`}
                                                style={{ color: isNext ? nextTimeColor : normalTimeColor }}
                                            >
                                                {times?.[p.key] || '--:--'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom Night Strip */}
                            {currentSettings.showNight && (
                                <div 
                                    className="flex items-center justify-around py-0.5 px-1.5 border-t text-[9px] font-bold"
                                    style={{
                                        backgroundColor: activePalette.section2Bg || '#F8DE8A',
                                        borderColor: `${activePalette.highlightPrayerColor || '#C86400'}40`,
                                        color: activePalette.section2Text || '#000000'
                                    }}
                                >
                                    <span>{isEn ? 'First: 08:30' : 'أول الليل: 08:30'}</span>
                                    <span>{isEn ? 'Midnight: 11:45' : 'منتصف الليل: 11:45'}</span>
                                    <span>{isEn ? 'Last Third: 02:30' : 'الثلث الأخير: 02:30'}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* DESIGN 2: COMPACT PREVIOUS & NEXT WIDGET */}
                    {selectedStyle === 'compact' && (
                        <div 
                            className="w-full max-w-sm rounded-[22px] p-3.5 shadow-xl space-y-2 select-none transition-all duration-300"
                            style={{
                                background: previewBgStyle,
                                border: `2px solid ${activePalette.section1Bg || '#C86400'}`,
                                color: activePalette.textColor || '#000000',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)'
                            }}
                        >
                            {/* Header */}
                            {currentSettings.showDate && (
                                <div className="flex items-center justify-between text-xs px-1">
                                    <div className="flex items-center gap-1.5">
                                        <div 
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                                            style={{ backgroundColor: activePalette.section1Bg || '#C86400' }}
                                        >
                                            ☪
                                        </div>
                                        <span className="font-bold text-[11px]" style={{ color: !activePalette.isDark ? (activePalette.cardDateColor || '#000000') : (activePalette.section1Text || '#FDE68A') }}>
                                            {dates?.hijri}
                                        </span>
                                        <span className="text-[10px]" style={{ color: !activePalette.isDark ? '#B45309' : '#FBBF24' }}>•</span>
                                        <span className="text-[10px]" style={{ color: !activePalette.isDark ? '#334155' : '#FDE68A' }}>{dates?.gregorian}</span>
                                    </div>
                                    <RefreshCw 
                                        className="w-3.5 h-3.5 cursor-pointer active:rotate-180 transition-transform" 
                                        style={{ color: !activePalette.isDark ? (activePalette.highlightPrayerColor || '#C86400') : (activePalette.section1Text || '#FDE68A') }}
                                    />
                                </div>
                            )}

                            {/* Dual 3D Embossed Cards: Previous & Next */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Previous Prayer */}
                                <div 
                                    className="p-3 rounded-xl border flex flex-col items-center justify-center text-center"
                                    style={{
                                        background: activePalette.cardBg || '#FFFFFF',
                                        borderColor: `${activePalette.section1Bg || '#C86400'}80`,
                                        boxShadow: !activePalette.isDark
                                            ? '0 2px 6px rgba(0,0,0,0.08)'
                                            : 'inset 0 1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <span className="text-[10.5px] font-bold" style={{ color: !activePalette.isDark ? '#334155' : (activePalette.section1Text || '#FDE68A') }}>
                                        {isEn ? 'Previous' : 'الصلاة السابقة'}
                                    </span>
                                    <span className="text-base font-bold mt-0.5" style={{ color: activePalette.textColor || '#000000' }}>
                                        {previousPrayer.name}
                                    </span>
                                    <span className="text-xs font-mono font-bold mt-0.5" style={{ color: activePalette.textColor || (activePalette.section1Text || '#FDE68A') }}>
                                        {previousPrayer.time}
                                    </span>
                                </div>

                                {/* Next Prayer (Elevated 3D Glowing Card) */}
                                <div 
                                    className="p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center relative overflow-hidden"
                                    style={{
                                        background: activePalette.themeKey === 'golden_trio'
                                            ? 'linear-gradient(135deg, #B45309 0%, #C86400 100%)'
                                            : `linear-gradient(135deg, ${activePalette.section2Bg || '#451A03'} 0%, ${activePalette.section1Bg || '#5E2E00'} 100%)`,
                                        borderColor: activePalette.themeKey === 'golden_trio' ? '#F59E0B' : (activePalette.highlightPrayerColor || '#F59E0B'),
                                        boxShadow: '0 6px 14px rgba(94,46,0,0.35), inset 0 1px 1px rgba(245,158,11,0.4)'
                                    }}
                                >
                                    <div className="absolute top-0 end-0 w-8 h-8 bg-amber-400/20 rounded-full blur-xs" />
                                    <span className="text-[10.5px] font-bold" style={{ color: activePalette.themeKey === 'golden_trio' ? '#FEF08A' : (activePalette.nextPrayerColor || '#FBBF24') }}>
                                        {isEn ? 'Next Prayer' : 'الصلاة القادمة'}
                                    </span>
                                    <span className="text-base font-bold mt-0.5" style={{ color: activePalette.heroPrayerName || '#FFFFFF' }}>
                                        {activeNextName}
                                    </span>
                                    <span className="text-sm font-mono font-bold mt-0.5" style={{ color: activePalette.themeKey === 'golden_trio' ? '#FFFFFF' : previewTextColorStyle }}>
                                        {activeNextTime}
                                    </span>
                                </div>
                            </div>

                            {/* Remaining Ribbon */}
                            {currentSettings.showCountdown && (
                                <div 
                                    className="py-1.5 px-3 rounded-xl border flex items-center justify-center gap-2"
                                    style={{
                                        background: activePalette.themeKey === 'golden_trio' ? '#FFFFFF' : (activePalette.section2Bg || '#451A03'),
                                        borderColor: `${activePalette.highlightPrayerColor || '#C86400'}70`,
                                        boxShadow: 'inset 0 1px 1px rgba(245,158,11,0.25)'
                                    }}
                                >
                                    <span className="text-[11px] font-bold" style={{ color: activePalette.themeKey === 'golden_trio' ? '#000000' : (activePalette.section2Text || '#FEF08A') }}>
                                        {isEn ? 'Remaining:' : 'متبقي على الأذان:'}
                                    </span>
                                    <span className="text-sm font-mono font-bold tracking-wider" style={{ color: activePalette.themeKey === 'golden_trio' ? '#C86400' : previewTextColorStyle }}>
                                        {countdown || '01:25:40'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Single Next Prayer Widget (1x1) */}
                    {selectedStyle === 'single' && (
                        <div className="flex flex-col items-center justify-center py-4">
                            <div 
                                className="w-36 h-36 rounded-2xl border-2 flex flex-col items-center justify-center p-3 text-center transition-all relative overflow-hidden shadow-xl"
                                style={{
                                    background: previewBgStyle,
                                    borderColor: activePalette.highlightPrayerColor ? `${activePalette.highlightPrayerColor}80` : '#F59E0B80',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: !activePalette.isDark
                                        ? '0 6px 18px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.6)'
                                        : '0 8px 20px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                                }}
                            >
                                <div className="flex flex-col items-center justify-center text-center gap-1.5 w-full">
                                    <span 
                                        className="text-xs sm:text-sm font-bold tracking-tight leading-tight select-none"
                                        style={{ 
                                            color: activePalette.heroPrayerName || (activePalette.isDark ? '#F1F5F9' : '#0F172A')
                                        }}
                                    >
                                        {isEn ? `${activeNextName} in` : `صلاة ${activeNextName} بعد`}
                                    </span>
                                    <span 
                                        className="text-xl sm:text-2xl font-black font-mono tracking-wider select-none"
                                        style={{ 
                                            color: activePalette.highlightPrayerColor || previewTextColorStyle || '#F59E0B'
                                        }}
                                    >
                                        {countdown || '00:24:15'}
                                    </span>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold mt-2.5 opacity-60">
                                {isEn ? '1x1 Ultra-Minimal • Resizable' : 'مقاس ١×١ مصغر وخفيف • قابل للتكبير بحرية'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast feedback */}
            {isSavedToast && (
                <div className="fixed bottom-[calc(5.75rem+var(--app-safe-bottom,0px))] start-1/2 -translate-x-1/2 z-[99999999] px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Widget settings & customization saved & synchronized!' : 'تم حفظ إعدادات التصميم بنجاح ومزامنته مع هاتفك! ✨'}</span>
                </div>
            )}
        </div>
    );

    if (onClose) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1300] flex items-center justify-center p-3 sm:p-5 animate-fadeIn" onClick={onClose}>
                <div 
                    className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-100 rounded-3xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-black/10 dark:border-white/10"
                    onClick={e => e.stopPropagation()}
                >
                    {content}
                </div>
            </div>
        );
    }

    return content;
};
