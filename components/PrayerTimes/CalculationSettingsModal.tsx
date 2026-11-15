import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { usePrayerTimes, getCalculationParams } from '../../context/PrayerTimesContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { 
    CALCULATION_METHOD_OPTIONS, 
    ASR_MADHAB_OPTIONS, 
    HIGH_LATITUDE_RULE_OPTIONS
} from '../../data/prayerTimesData';

interface CalculationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast?: (msg: string) => void;
}

export const CalculationSettingsModal: React.FC<CalculationSettingsModalProps> = ({
    isOpen,
    onClose,
    showToast
}) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    const { theme, themeKey, homeThemeVariant } = useTheme();
    const { config, updateConfig, times } = usePrayerTimes();

    const [activeTab, setActiveTab] = useState<'method' | 'madhab' | 'highlat'>('method');

    // Local state for pending choices
    const [selectedMethod, setSelectedMethod] = useState<string>(() => config.calculationMethod || 'auto');
    const [selectedMadhab, setSelectedMadhab] = useState<'shafi' | 'hanafi'>(() => config.asrMadhab || 'shafi');
    const [selectedHighLat, setSelectedHighLat] = useState<string>(() => config.highLatitudeRule || 'auto');

    // Handle hardware back button
    useEffect(() => {
        if (!isOpen) return;
        const interceptor = () => {
            onClose();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isOpen, onClose]);

    // Sync when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedMethod(config.calculationMethod || 'auto');
            setSelectedMadhab(config.asrMadhab || 'shafi');
            setSelectedHighLat(config.highLatitudeRule || 'auto');
        }
    }, [isOpen, config.calculationMethod, config.asrMadhab, config.highLatitudeRule]);

    if (!isOpen) return null;

    const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'أبيض وأسود';

    const themeStyles = (() => {
        if (isBlackTheme) {
            return {
                modalBg: '#121214',
                modalText: '#ffffff',
                cardBg: '#1e1e24',
                cardActiveBg: '#27272a',
                cardBorder: 'rgba(255, 255, 255, 0.15)',
                text: '#ffffff',
                subtext: '#a1a1aa',
                accent: '#ffffff',
                btnBg: '#ffffff',
                btnText: '#000000'
            };
        }
        if (themeKey === 'sky_mode' || homeThemeVariant === 'sky') {
            return {
                modalBg: '#ffffff',
                modalText: '#1f2937',
                cardBg: '#f0f9ff',
                cardActiveBg: '#e0f2fe',
                cardBorder: '#7dd3fc',
                text: '#0c4a6e',
                subtext: '#0369a1',
                accent: '#0284c7',
                btnBg: '#0284c7',
                btnText: '#ffffff'
            };
        }
        if (themeKey === 'emerald_mode' || homeThemeVariant === 'emerald') {
            return {
                modalBg: '#ffffff',
                modalText: '#1f2937',
                cardBg: '#f0fdf4',
                cardActiveBg: '#dcfce7',
                cardBorder: '#86efac',
                text: '#064e3b',
                subtext: '#047857',
                accent: '#059669',
                btnBg: '#059669',
                btnText: '#ffffff'
            };
        }
        if (themeKey === 'burgundy_mode' || homeThemeVariant === 'burgundy') {
            return {
                modalBg: '#ffffff',
                modalText: '#1f2937',
                cardBg: '#fff1f2',
                cardActiveBg: '#ffe4e6',
                cardBorder: '#fda4af',
                text: '#4c0519',
                subtext: '#881337',
                accent: '#be123c',
                btnBg: '#be123c',
                btnText: '#ffffff'
            };
        }
        // Golden / Default
        return {
            modalBg: '#ffffff',
            modalText: '#1f2937',
            cardBg: '#fefce8',
            cardActiveBg: '#fef08a',
            cardBorder: '#facc15',
            text: '#713f12',
            subtext: '#854d0e',
            accent: theme.palette?.[0] || '#ca8a04',
            btnBg: theme.palette?.[0] || '#ca8a04',
            btnText: '#ffffff'
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
        if (showToast) {
            showToast(isEn ? 'Prayer calculation settings saved' : 'تم حفظ إعدادات الحساب الفلكي والمذاهب');
        }
        onClose();
    };

    return (
        <div 
            dir={dir}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div 
                className="rounded-3xl w-full max-w-md max-h-[90dvh] flex flex-col p-3.5 sm:p-4.5 shadow-2xl relative overflow-hidden" 
                style={{ 
                    backgroundColor: themeStyles.modalBg, 
                    color: themeStyles.modalText,
                    border: `2px solid ${themeStyles.cardBorder}`
                }}
            >
                {/* Header (Without X button and without icons) */}
                <div className="pb-2.5 border-b shrink-0" style={{ borderColor: themeStyles.cardBorder }}>
                    <h3 className="font-extrabold text-sm sm:text-base leading-tight" style={{ color: themeStyles.accent }}>
                        {isEn ? 'Calculation & Fiqh Settings' : 'إعدادات الحساب والمذاهب الفقهية'}
                    </h3>
                    <p className="text-[11px] opacity-75 font-medium leading-tight mt-1">
                        {isEn ? 'Methods, Asr Juristic School & High Latitudes' : 'طريقة الحساب، مذهب العصر، وخطوط العرض العليا'}
                    </p>
                </div>

                {/* 3 Segmented Navigation Tabs (Clean text without icons) */}
                <div className="flex p-1 rounded-2xl my-2.5 gap-1 shrink-0" style={{ backgroundColor: isBlackTheme ? '#1e1e24' : 'rgba(0,0,0,0.05)' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('method')}
                        className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                            activeTab === 'method' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={activeTab === 'method' ? {
                            backgroundColor: themeStyles.btnBg,
                            color: themeStyles.btnText
                        } : {
                            color: themeStyles.modalText
                        }}
                    >
                        <span className="truncate">{isEn ? 'Method' : 'الهيئة الفلكية'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('madhab')}
                        className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                            activeTab === 'madhab' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={activeTab === 'madhab' ? {
                            backgroundColor: themeStyles.btnBg,
                            color: themeStyles.btnText
                        } : {
                            color: themeStyles.modalText
                        }}
                    >
                        <span className="truncate">{isEn ? 'Asr Madhab' : 'مذهب العصر'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('highlat')}
                        className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                            activeTab === 'highlat' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={activeTab === 'highlat' ? {
                            backgroundColor: themeStyles.btnBg,
                            color: themeStyles.btnText
                        } : {
                            color: themeStyles.modalText
                        }}
                    >
                        <span className="truncate">{isEn ? 'High Latitudes' : 'المناطق الشمالية'}</span>
                    </button>
                </div>

                {/* Tab Content Container */}
                <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2 px-1.5 sm:px-2 py-1">
                    {/* TAB 1: Calculation Method */}
                    {activeTab === 'method' && (
                        <div className="space-y-2">
                            <div className="p-2 sm:p-2.5 rounded-2xl text-[11px] font-medium leading-relaxed" style={{ backgroundColor: isBlackTheme ? '#1e1e24' : 'rgba(0,0,0,0.03)', color: themeStyles.subtext }}>
                                <span>
                                    {isEn 
                                        ? 'Select the astronomical calculation authority for Fajr and Isha prayer angles. Setting to "Automatic" chooses the approved official standard for your country.' 
                                        : 'اختر الهيئة أو المنظمة الإسلامية المعتمدة لحساب زاويتي الفجر والعشاء. خيار "تلقائي" يحدد الهيئة الرسمية المعتمدة لبلدك تلقائياً.'}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {CALCULATION_METHOD_OPTIONS.map((opt) => {
                                    const isSelected = selectedMethod === opt.id;
                                    const isAuto = opt.id === 'auto';
                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => setSelectedMethod(opt.id)}
                                            className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                                isSelected 
                                                    ? 'shadow-xs' 
                                                    : 'hover:opacity-90'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected ? themeStyles.cardActiveBg : themeStyles.cardBg,
                                                borderColor: isSelected ? themeStyles.accent : 'transparent',
                                                borderWidth: isSelected ? '1.5px' : '1px'
                                            }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h4 className="font-bold text-xs sm:text-sm leading-tight" style={{ color: isSelected ? themeStyles.text : themeStyles.modalText }}>
                                                        {isEn ? opt.nameEn : opt.nameAr}
                                                    </h4>
                                                    {isAuto && (
                                                        <span 
                                                            className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold shrink-0"
                                                            style={{ 
                                                                backgroundColor: `${themeStyles.accent}25`, 
                                                                color: themeStyles.accent 
                                                            }}
                                                        >
                                                            {isEn ? 'Recommended' : 'موصى به'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] mt-0.5 leading-snug line-clamp-1" style={{ color: themeStyles.subtext }}>
                                                    {isAuto ? (
                                                        isEn 
                                                            ? `Current country standard: ${detectedMethodName}` 
                                                            : `المعتمد لموقعك حالياً: ${detectedMethodName}`
                                                    ) : (
                                                        isEn ? opt.descEn : opt.descAr
                                                    )}
                                                </p>
                                                {!isAuto && (
                                                    <span className="text-[10px] font-semibold opacity-80 mt-0.5 block" style={{ color: themeStyles.accent }}>
                                                        {isEn ? opt.regionEn : opt.regionAr}
                                                    </span>
                                                )}
                                            </div>

                                            <div 
                                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ms-1"
                                                style={{ 
                                                    borderColor: isSelected ? themeStyles.accent : themeStyles.subtext,
                                                    backgroundColor: isSelected ? `${themeStyles.accent}15` : 'transparent',
                                                    borderWidth: isSelected ? '1.5px' : '1px'
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
                            <div className="p-2 sm:p-2.5 rounded-2xl text-[11px] font-medium leading-relaxed" style={{ backgroundColor: isBlackTheme ? '#1e1e24' : 'rgba(0,0,0,0.03)', color: themeStyles.subtext }}>
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
                                            className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                                                isSelected 
                                                    ? 'shadow-xs' 
                                                    : 'hover:opacity-90'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected ? themeStyles.cardActiveBg : themeStyles.cardBg,
                                                borderColor: isSelected ? themeStyles.accent : 'transparent',
                                                borderWidth: isSelected ? '1.5px' : '1px'
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div 
                                                        className="w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0"
                                                        style={{ 
                                                            backgroundColor: isSelected ? themeStyles.accent : `${themeStyles.accent}20`,
                                                            color: isSelected ? themeStyles.btnText : themeStyles.accent
                                                        }}
                                                    >
                                                        {opt.shadowRatio}x
                                                    </div>
                                                    <h4 className="font-extrabold text-xs sm:text-sm leading-tight" style={{ color: isSelected ? themeStyles.text : themeStyles.modalText }}>
                                                        {isEn ? opt.nameEn : opt.nameAr}
                                                    </h4>
                                                </div>

                                                <div 
                                                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ms-1"
                                                    style={{ 
                                                        borderColor: isSelected ? themeStyles.accent : themeStyles.subtext,
                                                        backgroundColor: isSelected ? `${themeStyles.accent}15` : 'transparent',
                                                        borderWidth: isSelected ? '1.5px' : '1px'
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

                                            <p className="text-[11px] leading-relaxed" style={{ color: themeStyles.subtext }}>
                                                {isEn ? opt.descEn : opt.descAr}
                                            </p>

                                            <div 
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-xl self-start flex items-center gap-1"
                                                style={{ 
                                                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
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
                            <div className="p-2 sm:p-2.5 rounded-2xl text-[11px] font-medium leading-relaxed" style={{ backgroundColor: isBlackTheme ? '#1e1e24' : 'rgba(0,0,0,0.03)', color: themeStyles.subtext }}>
                                <span>
                                    {isEn 
                                        ? 'In high-latitude regions (such as northern UK, Scandinavia, and Canada), astronomical twilight can persist through the night in summer. These scientific rules adjust Fajr and Isha to prevent abnormal times.' 
                                        : 'في الدول الواقعة في خطوط العرض العليا (مثل بريطانيا والدول الإسكندنافية وشمال أوروبا وكندا) يستمر الشفق ليلاً خلال الصيف. تطبق هذه القواعد الفلكية لتحديد وقتي الفجر والعشاء بصورة منضبطة.'}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {HIGH_LATITUDE_RULE_OPTIONS.map((opt) => {
                                    const isSelected = selectedHighLat === opt.id;
                                    const isAuto = opt.id === 'auto';
                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => setSelectedHighLat(opt.id)}
                                            className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                                isSelected 
                                                    ? 'shadow-xs' 
                                                    : 'hover:opacity-90'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected ? themeStyles.cardActiveBg : themeStyles.cardBg,
                                                borderColor: isSelected ? themeStyles.accent : 'transparent',
                                                borderWidth: isSelected ? '1.5px' : '1px'
                                            }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h4 className="font-bold text-xs sm:text-sm leading-tight" style={{ color: isSelected ? themeStyles.text : themeStyles.modalText }}>
                                                        {isEn ? opt.nameEn : opt.nameAr}
                                                    </h4>
                                                    {isAuto && (
                                                        <span 
                                                            className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold shrink-0"
                                                            style={{ 
                                                                backgroundColor: `${themeStyles.accent}25`, 
                                                                color: themeStyles.accent 
                                                            }}
                                                        >
                                                            {isEn ? 'Smart' : 'ذكي'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] mt-0.5 leading-snug" style={{ color: themeStyles.subtext }}>
                                                    {isEn ? opt.descEn : opt.descAr}
                                                </p>
                                            </div>

                                            <div 
                                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ms-1"
                                                style={{ 
                                                    borderColor: isSelected ? themeStyles.accent : themeStyles.subtext,
                                                    backgroundColor: isSelected ? `${themeStyles.accent}15` : 'transparent',
                                                    borderWidth: isSelected ? '1.5px' : '1px'
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

                {/* Footer Buttons - Save Button Only */}
                <div className="pt-3 border-t shrink-0 flex" style={{ borderColor: themeStyles.cardBorder }}>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="w-full py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: themeStyles.btnBg, color: themeStyles.btnText }}
                    >
                        <span>{isEn ? 'Save Settings' : 'حفظ الإعدادات'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculationSettingsModal;
