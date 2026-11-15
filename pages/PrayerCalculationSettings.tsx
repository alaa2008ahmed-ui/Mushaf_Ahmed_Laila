import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { usePrayerTimes, getCalculationParams } from '../context/PrayerTimesContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { showGlobalAppToast } from '../utils/appNotificationSettings';
import ThemePageLock from '../components/ThemePageLock';
import { 
    CALCULATION_METHOD_OPTIONS, 
    ASR_MADHAB_OPTIONS, 
    HIGH_LATITUDE_RULE_OPTIONS
} from '../data/prayerTimesData';

interface PrayerCalculationSettingsProps {
    onBack: () => void;
    onNavigate: (id: string, params?: any) => void;
}

export const PrayerCalculationSettings: React.FC<PrayerCalculationSettingsProps> = ({
    onBack,
    onNavigate
}) => {
    const { language, dir, isRTL } = useLanguage();
    const isEn = language === 'en';
    const { theme, themeKey, homeThemeVariant, isNightMode } = useTheme();
    const { config, updateConfig, times } = usePrayerTimes();

    const [activeTab, setActiveTab] = useState<'method' | 'madhab' | 'highlat'>('method');

    // Local state for pending choices
    const [selectedMethod, setSelectedMethod] = useState<string>(() => config.calculationMethod || 'auto');
    const [selectedMadhab, setSelectedMadhab] = useState<'shafi' | 'hanafi'>(() => config.asrMadhab || 'shafi');
    const [selectedHighLat, setSelectedHighLat] = useState<string>(() => config.highLatitudeRule || 'auto');

    // Hardware back button support for Android
    useEffect(() => {
        const interceptor = () => {
            onBack();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [onBack]);

    const isGoldenTheme = !isNightMode && (
        homeThemeVariant === 'gold' ||
        themeKey === 'shiny_gold' ||
        themeKey === 'gold' ||
        theme.name === 'الذهبي اللامع' ||
        theme.name === 'الذهبي' ||
        theme.cardBg === '#FDE047'
    );

    const headerTextColor = isGoldenTheme ? '#000000' : '#FFFFFF';

    const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'أبيض وأسود';

    const themeStyles = (() => {
        if (isBlackTheme) {
            return {
                pageBg: '#09090b',
                headerBg: '#121214',
                cardBg: '#18181b',
                cardActiveBg: '#27272a',
                cardBorder: 'rgba(255, 255, 255, 0.12)',
                text: '#ffffff',
                subtext: '#a1a1aa',
                accent: '#ffffff',
                btnBg: '#ffffff',
                btnText: '#000000',
                tabBg: '#18181b',
                infoBoxBg: '#141416',
                footerBg: '#121214'
            };
        }
        if (themeKey === 'sky_mode' || homeThemeVariant === 'sky') {
            return {
                pageBg: '#f8fafc',
                headerBg: '#ffffff',
                cardBg: '#ffffff',
                cardActiveBg: '#f0f9ff',
                cardBorder: '#bae6fd',
                text: '#0c4a6e',
                subtext: '#0369a1',
                accent: '#0284c7',
                btnBg: '#0284c7',
                btnText: '#ffffff',
                tabBg: 'rgba(2, 132, 199, 0.08)',
                infoBoxBg: '#f0f9ff',
                footerBg: '#ffffff'
            };
        }
        if (themeKey === 'emerald_mode' || homeThemeVariant === 'emerald') {
            return {
                pageBg: '#f8fafc',
                headerBg: '#ffffff',
                cardBg: '#ffffff',
                cardActiveBg: '#f0fdf4',
                cardBorder: '#bbf7d0',
                text: '#064e3b',
                subtext: '#047857',
                accent: '#059669',
                btnBg: '#059669',
                btnText: '#ffffff',
                tabBg: 'rgba(5, 150, 105, 0.08)',
                infoBoxBg: '#f0fdf4',
                footerBg: '#ffffff'
            };
        }
        if (themeKey === 'burgundy_mode' || homeThemeVariant === 'burgundy') {
            return {
                pageBg: '#faf5f5',
                headerBg: '#ffffff',
                cardBg: '#ffffff',
                cardActiveBg: '#fff1f2',
                cardBorder: '#fecdd3',
                text: '#4c0519',
                subtext: '#881337',
                accent: '#be123c',
                btnBg: '#be123c',
                btnText: '#ffffff',
                tabBg: 'rgba(190, 18, 60, 0.08)',
                infoBoxBg: '#fff1f2',
                footerBg: '#ffffff'
            };
        }
        // Golden / Default
        const primaryAcc = theme.palette?.[0] || '#d97706';
        return {
            pageBg: '#fdfbf7',
            headerBg: '#ffffff',
            cardBg: '#ffffff',
            cardActiveBg: '#fffbeb',
            cardBorder: isGoldenTheme ? '#fde047' : 'rgba(0,0,0,0.08)',
            text: '#1f2937',
            subtext: '#6b7280',
            accent: primaryAcc,
            btnBg: primaryAcc,
            btnText: isGoldenTheme ? '#000000' : '#ffffff',
            tabBg: 'rgba(0,0,0,0.05)',
            infoBoxBg: isGoldenTheme ? '#fffbeb' : 'rgba(0,0,0,0.03)',
            footerBg: '#ffffff'
        };
    })();

    // Compute detected method for location to show in Auto card
    const detectedParams = getCalculationParams(new Date(), config.location, { calculationMethod: 'auto' });
    const detectedMethodName = isEn ? detectedParams.detectedNameEn : detectedParams.detectedNameAr;

    const handleSave = () => {
        updateConfig({
            calculationMethod: selectedMethod,
            asrMadhab: selectedMadhab,
            highLatitudeRule: selectedHighLat as any
        });
        showGlobalAppToast(isEn ? 'Prayer calculation settings saved' : 'تم حفظ إعدادات الحساب الفلكي والمذاهب');
        onBack();
    };

    return (
        <div 
            dir={dir}
            className="h-[100dvh] w-full flex flex-col themed-bg overflow-hidden"
            style={{ backgroundColor: themeStyles.pageBg }}
        >
            {/* Top Bar matching Prayer Times and App Top Bar */}
            <header className="app-top-bar app-top-bar--prayer z-20 shrink-0" dir={dir}>
                <div className="app-top-bar__inner">
                    <div className="flex items-center justify-between w-full min-h-[44px] gap-1">
                        {/* Leading: Back Button */}
                        <div className="flex items-center shrink-0 z-10" style={{ color: headerTextColor }}>
                            <button
                                onClick={onBack}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: headerTextColor }}
                                title={isEn ? "Back" : "رجوع"}
                                aria-label={isEn ? "Back" : "رجوع"}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-base sm:text-lg`}></i>
                            </button>
                        </div>

                        {/* Center: Title only (subtitle removed, title shortened to fit fully) */}
                        <div className="text-center px-2 min-w-0 flex-1 flex items-center justify-center">
                            <h1 
                                className={`app-top-bar__title ${isEn ? 'font-sans font-bold' : 'font-kufi font-bold'} text-base sm:text-lg whitespace-nowrap overflow-hidden text-ellipsis max-w-full leading-tight`}
                                style={{ color: headerTextColor }}
                            >
                                {isEn ? 'Calculation & Fiqh' : 'إعدادات الحساب والمذاهب'}
                            </h1>
                        </div>

                        {/* Trailing: ThemeLock & Home Button */}
                        <div className="flex items-center gap-1 shrink-0 z-10" style={{ color: headerTextColor }}>
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: headerTextColor }}
                                title={isEn ? "Home" : "الرئيسية"}
                                aria-label={isEn ? "Home" : "الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-base sm:text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Fixed 3 Segmented Navigation Tabs Bar (Pinned outside scrollable main) */}
            <div 
                className="w-full px-3 sm:px-4 pt-3 pb-2 shrink-0 z-10 flex justify-center border-b"
                style={{ 
                    backgroundColor: themeStyles.pageBg,
                    borderColor: themeStyles.cardBorder 
                }}
            >
                <div 
                    className="max-w-md w-full flex p-1.5 rounded-2xl gap-1" 
                    style={{ backgroundColor: themeStyles.tabBg }}
                >
                    <button
                        type="button"
                        onClick={() => setActiveTab('method')}
                        className={`flex-1 py-2 px-1 rounded-xl text-xs sm:text-[13px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                            activeTab === 'method' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={activeTab === 'method' ? {
                            backgroundColor: themeStyles.btnBg,
                            color: themeStyles.btnText
                        } : {
                            color: isBlackTheme ? '#FFFFFF' : '#1f2937'
                        }}
                    >
                        <span className="truncate">{isEn ? 'Method' : 'الهيئة الفلكية'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('madhab')}
                        className={`flex-1 py-2 px-1 rounded-xl text-xs sm:text-[13px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                            activeTab === 'madhab' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={activeTab === 'madhab' ? {
                            backgroundColor: themeStyles.btnBg,
                            color: themeStyles.btnText
                        } : {
                            color: isBlackTheme ? '#FFFFFF' : '#1f2937'
                        }}
                    >
                        <span className="truncate">{isEn ? 'Asr Madhab' : 'مذهب العصر'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('highlat')}
                        className={`flex-1 py-2 px-1 rounded-xl text-xs sm:text-[13px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                            activeTab === 'highlat' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={activeTab === 'highlat' ? {
                            backgroundColor: themeStyles.btnBg,
                            color: themeStyles.btnText
                        } : {
                            color: isBlackTheme ? '#FFFFFF' : '#1f2937'
                        }}
                    >
                        <span className="truncate">{isEn ? 'High Latitudes' : 'المناطق الشمالية'}</span>
                    </button>
                </div>
            </div>

            {/* Main Scrollable Content */}
            <main id="calc-scroll-container" className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-3 sm:px-4 pt-3 pb-4">
                <div className="max-w-md w-full mx-auto flex flex-col space-y-3">

                    {/* TAB 1: Calculation Method */}
                    {activeTab === 'method' && (
                        <div className="space-y-2.5">
                            <div 
                                className="p-3 rounded-2xl text-xs font-medium leading-relaxed" 
                                style={{ backgroundColor: themeStyles.infoBoxBg, color: themeStyles.subtext }}
                            >
                                <span>
                                    {isEn 
                                        ? 'Select the astronomical calculation authority for Fajr and Isha prayer angles. Setting to "Automatic" chooses the approved official standard for your country.' 
                                        : 'اختر الهيئة أو المنظمة الإسلامية المعتمدة لحساب زاويتي الفجر والعشاء. خيار "تلقائي" يحدد الهيئة الرسمية المعتمدة لبلدك تلقائياً.'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {CALCULATION_METHOD_OPTIONS.map((opt) => {
                                    const isSelected = selectedMethod === opt.id;
                                    const isAuto = opt.id === 'auto';
                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => setSelectedMethod(opt.id)}
                                            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                isSelected 
                                                    ? 'shadow-sm' 
                                                    : 'hover:opacity-90'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected ? themeStyles.cardActiveBg : themeStyles.cardBg,
                                                borderColor: isSelected ? themeStyles.accent : themeStyles.cardBorder,
                                                borderWidth: isSelected ? '2px' : '1px'
                                            }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-xs sm:text-sm leading-tight" style={{ color: isSelected ? themeStyles.text : (isBlackTheme ? '#FFFFFF' : '#1f2937') }}>
                                                        {isEn ? opt.nameEn : opt.nameAr}
                                                    </h4>
                                                    {isAuto && (
                                                        <span 
                                                            className="text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0"
                                                            style={{ 
                                                                backgroundColor: `${themeStyles.accent}25`, 
                                                                color: themeStyles.accent 
                                                            }}
                                                        >
                                                            {isEn ? 'Recommended' : 'موصى به'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11.5px] mt-1 leading-snug" style={{ color: themeStyles.subtext }}>
                                                    {isAuto ? (
                                                        isEn 
                                                            ? `Current country standard: ${detectedMethodName}` 
                                                            : `المعتمد لموقعك حالياً: ${detectedMethodName}`
                                                    ) : (
                                                        isEn ? opt.descEn : opt.descAr
                                                    )}
                                                </p>
                                                {!isAuto && (
                                                    <span className="text-[10.5px] font-semibold opacity-90 mt-1 block" style={{ color: themeStyles.accent }}>
                                                        {isEn ? opt.regionEn : opt.regionAr}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Radio circle */}
                                            <div 
                                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ms-1"
                                                style={{ 
                                                    borderColor: isSelected ? themeStyles.accent : themeStyles.subtext,
                                                    backgroundColor: isSelected ? `${themeStyles.accent}15` : 'transparent',
                                                    borderWidth: isSelected ? '2px' : '1px'
                                                }}
                                            >
                                                {isSelected && (
                                                    <div 
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{ backgroundColor: themeStyles.accent }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Asr Madhab */}
                    {activeTab === 'madhab' && (
                        <div className="space-y-2.5">
                            <div 
                                className="p-3 rounded-2xl text-xs font-medium leading-relaxed" 
                                style={{ backgroundColor: themeStyles.infoBoxBg, color: themeStyles.subtext }}
                            >
                                <span>
                                    {isEn 
                                        ? 'Determines when Asr prayer begins based on the length of an object\'s shadow. Standard / Majority uses shadow ratio 1, while Hanafi uses shadow ratio 2.' 
                                        : 'تحديد وقت دخول صلاة العصر بحسب طول ظل الشاخص. مذهب الجمهور (ظل مثل واحد) هو المعتمد في معظم البلدان، بينما مذهب الحنفية (ظلان) معتمد في شبه القارة الهندية وتركيا.'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {ASR_MADHAB_OPTIONS.map((opt) => {
                                    const isSelected = selectedMadhab === opt.id;
                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => setSelectedMadhab(opt.id)}
                                            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                                                isSelected 
                                                    ? 'shadow-sm' 
                                                    : 'hover:opacity-90'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected ? themeStyles.cardActiveBg : themeStyles.cardBg,
                                                borderColor: isSelected ? themeStyles.accent : themeStyles.cardBorder,
                                                borderWidth: isSelected ? '2px' : '1px'
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div 
                                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                                        style={{ 
                                                            backgroundColor: isSelected ? themeStyles.accent : `${themeStyles.accent}20`,
                                                            color: isSelected ? themeStyles.btnText : themeStyles.accent
                                                        }}
                                                    >
                                                        {opt.shadowRatio}x
                                                    </div>
                                                    <h4 className="font-extrabold text-xs sm:text-sm leading-tight" style={{ color: isSelected ? themeStyles.text : (isBlackTheme ? '#FFFFFF' : '#1f2937') }}>
                                                        {isEn ? opt.nameEn : opt.nameAr}
                                                    </h4>
                                                </div>

                                                <div 
                                                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ms-1"
                                                    style={{ 
                                                        borderColor: isSelected ? themeStyles.accent : themeStyles.subtext,
                                                        backgroundColor: isSelected ? `${themeStyles.accent}15` : 'transparent',
                                                        borderWidth: isSelected ? '2px' : '1px'
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <div 
                                                            className="w-2.5 h-2.5 rounded-full"
                                                            style={{ backgroundColor: themeStyles.accent }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-[11.5px] leading-relaxed" style={{ color: themeStyles.subtext }}>
                                                {isEn ? opt.descEn : opt.descAr}
                                            </p>

                                            <div 
                                                className="text-[10.5px] font-bold px-2.5 py-1 rounded-xl self-start flex items-center gap-1.5"
                                                style={{ 
                                                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                                    color: themeStyles.accent
                                                }}
                                            >
                                                <span>{isEn ? 'Current Asr in app:' : 'وقت العصر حالياً:'}</span>
                                                <span className="font-mono font-black">{times?.Asr || '--:--'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: High Latitude Rule */}
                    {activeTab === 'highlat' && (
                        <div className="space-y-2.5">
                            <div 
                                className="p-3 rounded-2xl text-xs font-medium leading-relaxed" 
                                style={{ backgroundColor: themeStyles.infoBoxBg, color: themeStyles.subtext }}
                            >
                                <span>
                                    {isEn 
                                        ? 'In high-latitude regions (such as northern UK, Scandinavia, and Canada), astronomical twilight can persist through the night in summer. These scientific rules adjust Fajr and Isha to prevent abnormal times.' 
                                        : 'في الدول الواقعة في خطوط العرض العليا (مثل بريطانيا والدول الإسكندنافية وشمال أوروبا وكندا) يستمر الشفق ليلاً خلال الصيف. تطبق هذه القواعد الفلكية لتحديد وقتي الفجر والعشاء بصورة منضبطة.'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {HIGH_LATITUDE_RULE_OPTIONS.map((opt) => {
                                    const isSelected = selectedHighLat === opt.id;
                                    const isAuto = opt.id === 'auto';
                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => setSelectedHighLat(opt.id)}
                                            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                isSelected 
                                                    ? 'shadow-sm' 
                                                    : 'hover:opacity-90'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected ? themeStyles.cardActiveBg : themeStyles.cardBg,
                                                borderColor: isSelected ? themeStyles.accent : themeStyles.cardBorder,
                                                borderWidth: isSelected ? '2px' : '1px'
                                            }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-xs sm:text-sm leading-tight" style={{ color: isSelected ? themeStyles.text : (isBlackTheme ? '#FFFFFF' : '#1f2937') }}>
                                                        {isEn ? opt.nameEn : opt.nameAr}
                                                    </h4>
                                                    {isAuto && (
                                                        <span 
                                                            className="text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0"
                                                            style={{ 
                                                                backgroundColor: `${themeStyles.accent}25`, 
                                                                color: themeStyles.accent 
                                                            }}
                                                        >
                                                            {isEn ? 'Smart' : 'ذكي'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11.5px] mt-1 leading-snug" style={{ color: themeStyles.subtext }}>
                                                    {isEn ? opt.descEn : opt.descAr}
                                                </p>
                                            </div>

                                            <div 
                                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ms-1"
                                                style={{ 
                                                    borderColor: isSelected ? themeStyles.accent : themeStyles.subtext,
                                                    backgroundColor: isSelected ? `${themeStyles.accent}15` : 'transparent',
                                                    borderWidth: isSelected ? '2px' : '1px'
                                                }}
                                            >
                                                {isSelected && (
                                                    <div 
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{ backgroundColor: themeStyles.accent }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Bar: Save Button Only */}
            <footer 
                data-toast-bottom-bar="true"
                className="p-3 sm:p-4 modal-sheet-safe-bottom border-t shrink-0 z-20"
                style={{ 
                    backgroundColor: themeStyles.footerBg, 
                    borderColor: themeStyles.cardBorder 
                }}
            >
                <div className="max-w-md mx-auto w-full">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: themeStyles.btnBg, color: themeStyles.btnText }}
                    >
                        <span>{isEn ? 'Save Settings' : 'حفظ الإعدادات'}</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default PrayerCalculationSettings;
