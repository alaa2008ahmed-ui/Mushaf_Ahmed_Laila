import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Smartphone, AppWindow, VolumeX, Shuffle, LayoutGrid, BellRing, Bell, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { toArabic } from './constants';
import { IslamicTimePickerModal } from '../Common/IslamicTimePickerModal';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { setupNotifications } from '../../utils/notifications';
import { useNotificationSettings, PhoneNotificationSettings } from '../../hooks/useNotificationSettings';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { syncWidgetThemeColors } from '../../utils/widgetUtils';
import { WidgetDesignPreview } from '../PrayerTimes/WidgetDesignPreview';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import NotificationToneSelector, { NotificationToneState } from '../PrayerTimes/NotificationToneSelector';
import { getActiveNotificationTone, setActiveNotificationTone } from '../../utils/prayerTimesUtils';
import {
    setNativePersistentNotificationEnabled,
    checkNativeBatteryOptimization,
    requestNativeBatteryOptimization,
    openNativeNotificationSettings
} from '../../utils/silentMode';

const toEnglishDigits = (val: string | number): string =>
    String(val ?? '')
        .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632))
        .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));

const formatMuteDate = (timestamp: number, isEn: boolean): string => {
    try {
        return new Intl.DateTimeFormat(isEn ? 'en-US-u-nu-latn' : 'ar-EG-u-nu-arab', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(timestamp));
    } catch {
        const d = new Date(timestamp);
        const raw = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
        return isEn ? toEnglishDigits(raw) : toArabic(raw);
    }
};

interface ClickableTimeValueProps {
    value: string;
    onChange: (newTime: string) => void;
    isEn: boolean;
    className?: string;
    accentColor?: boolean;
    title?: string;
}

const ClickableTimeValue: React.FC<ClickableTimeValueProps> = ({
    value,
    onChange,
    isEn,
    className = '',
    accentColor = true,
    title
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const cleaned = toEnglishDigits(value || '07:00').trim();
    const parts = cleaned.split(':');
    const parsedH = parseInt(parts[0], 10);
    const parsedM = parseInt(parts[1] ?? '0', 10);
    const h24 = isNaN(parsedH) ? 7 : parsedH;
    const m = isNaN(parsedM) ? 0 : parsedM;
    const isPM = h24 >= 12;
    const h12 = h24 % 12 || 12;
    const hhStr = String(h12).padStart(2, '0');
    const mmStr = String(m).padStart(2, '0');
    const normalizedInputValue = `${String(h24).padStart(2, '0')}:${mmStr}`;

    return (
        <>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsPickerOpen(true);
                }}
                role="button"
                tabIndex={0}
                className={`relative inline-flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform ${className}`}
                title={isEn ? 'Click to change time' : 'انقر لتعديل الوقت'}
            >
                {isEn ? (
                    <span
                        dir="ltr"
                        className="inline-flex items-center gap-1 font-bold tabular-nums"
                        style={{
                            color: accentColor ? 'var(--qr-accent)' : undefined,
                            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Cairo", sans-serif'
                        }}
                    >
                        <span>{hhStr}:{mmStr}</span>
                        <span>{isPM ? 'PM' : 'AM'}</span>
                    </span>
                ) : (
                    <span
                        dir="rtl"
                        className="inline-flex items-center gap-1 font-bold tabular-nums"
                        style={{ color: accentColor ? 'var(--qr-accent)' : undefined }}
                    >
                        <span dir="ltr">{toArabic(hhStr)}:{toArabic(mmStr)}</span>
                        <span>{isPM ? 'م' : 'ص'}</span>
                    </span>
                )}
            </div>

            {isPickerOpen && (
                <IslamicTimePickerModal
                    isOpen={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    initialTime={normalizedInputValue}
                    onSave={(newTime24) => {
                        onChange(newTime24);
                    }}
                    title={title}
                    accentColor={typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--qr-accent').trim() : undefined}
                />
            )}
        </>
    );
};

interface NotificationSettingsModalProps {
    onClose: () => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
    modeSuffix: string;
    initialTab?: 'app' | 'phone';
    hideAppTab?: boolean;
    phoneTabTitle?: string;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ 
    onClose, 
    showToast, 
    isLandscape, 
    modeSuffix, 
    initialTab,
    hideAppTab = false,
    phoneTabTitle
}) => {
    const { language, dir, isRTL } = useLanguage();
    const isEn = language === 'en';
    const { config, updateConfig } = usePrayerTimes();
    const { phoneSettings, updateSpecificSetting, updateRandomSettings } = useNotificationSettings();
    const [activeTab, setActiveTab] = useState<'app' | 'phone'>(hideAppTab ? 'phone' : (initialTab || 'app'));

    const [appSettings, setAppSettings] = useState(() => {
        const saved = localStorage.getItem('notification_settings' + modeSuffix);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing notification settings', e);
            }
        }
        return {
            quarter: true,
            sajda: true,
            themes: true,
            downloads: true,
            bookmarks: true,
            juz: true,
            general: true
        };
    });

    const { theme, themeKey, homeThemeVariant } = useTheme();
    const isBlackTheme = themeKey === 'deep_black' || theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';

    const themeStyles = (() => {
        if (isBlackTheme || themeKey === 'deep_black') {
            return {
                modalBg: '#121214',
                modalText: '#ffffff',
                cardBg: '#1e1e24',
                cardBorder: 'rgba(255, 255, 255, 0.15)',
                text: '#ffffff',
                subtext: '#a1a1aa',
                accent: '#ffffff',
                btnBg: '#ffffff',
                btnText: '#000000'
            };
        }
        if (themeKey === 'shiny_gold' || themeKey === 'gold' || homeThemeVariant === 'gold') {
            return {
                modalBg: '#ffffff',
                modalText: '#1f2937',
                cardBg: '#fef08a', // vibrant golden yellow card
                cardBorder: '#eab308',
                text: '#713f12', // deep golden text
                subtext: '#854d0e',
                accent: '#ca8a04',
                btnBg: '#ca8a04',
                btnText: '#ffffff'
            };
        }
        if (themeKey === 'sky_mode' || homeThemeVariant === 'sky') {
            return {
                modalBg: '#ffffff',
                modalText: '#1f2937',
                cardBg: '#e0f2fe', // sky blue card
                cardBorder: '#7dd3fc',
                text: '#0c4a6e', // deep sky blue text
                subtext: '#0369a1',
                accent: '#0284c7',
                btnBg: '#0284c7',
                btnText: '#ffffff'
            };
        }
        if (themeKey === 'burgundy_mode' || homeThemeVariant === 'burgundy') {
            return {
                modalBg: '#ffffff',
                modalText: '#1f2937',
                cardBg: '#ffe4e6', // burgundy card
                cardBorder: '#fda4af',
                text: '#4c0519', // deep burgundy text
                subtext: '#881337',
                accent: '#be123c',
                btnBg: '#be123c',
                btnText: '#ffffff'
            };
        }
        // Emerald / Default Green
        return {
            modalBg: '#ffffff',
            modalText: '#1f2937',
            cardBg: '#dcfce7', // emerald green card
            cardBorder: '#86efac',
            text: '#064e3b', // deep emerald text
            subtext: '#047857',
            accent: '#059669',
            btnBg: '#059669',
            btnText: '#ffffff'
        };
    })();

    // Persistent Prayer Times Notification State
    const [isPersistentNotificationEnabled, setIsPersistentNotificationEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('persistent_prayer_notification');
        return saved !== 'false';
    });
    const [isBatteryIgnored, setIsBatteryIgnored] = useState<boolean>(true);

    useEffect(() => {
        if (Capacitor.getPlatform() === 'android') {
            checkNativeBatteryOptimization().then(setIsBatteryIgnored).catch(() => {});
        }
    }, []);

    // Notification Tone state for general reminders & athkar
    const [activeNotificationTone, setActiveNotificationToneState] = useState<NotificationToneState>(() => getActiveNotificationTone());

    const handleNotificationToneChange = (tone: NotificationToneState) => {
        setActiveNotificationToneState(tone);
        setActiveNotificationTone(tone);
        setTimeout(() => {
            setupNotifications(phoneSettings, isEn ? 'en' : 'ar');
        }, 50);
        showToast(isEn ? `Notification tone updated: ${tone.name}` : `تم تحديث نغمة الإشعارات: ${tone.name}`);
    };

    const togglePersistentNotification = async () => {
        const nextState = !isPersistentNotificationEnabled;
        setIsPersistentNotificationEnabled(nextState);
        localStorage.setItem('persistent_prayer_notification', nextState ? 'true' : 'false');
        await setNativePersistentNotificationEnabled(nextState);
        showToast(nextState
            ? (isEn ? 'Persistent prayer notification enabled' : 'تم تفعيل إشعار الصلاة المستمر')
            : (isEn ? 'Persistent prayer notification disabled' : 'تم تعطيل إشعار الصلاة المستمر')
        );
    };

    const handleRequestBatteryOptimization = async () => {
        await requestNativeBatteryOptimization();
        setTimeout(async () => {
            const ignored = await checkNativeBatteryOptimization();
            setIsBatteryIgnored(ignored);
        }, 2000);
    };

    // Widget language lock: 'ar' | 'en' | null (both disabled by default)
    const [widgetLockLang, setWidgetLockLang] = useState<'ar' | 'en' | null>(() => {
        const saved = localStorage.getItem('widget_lock_lang');
        return (saved === 'ar' || saved === 'en') ? saved : null;
    });

    // Widget theme lock: boolean (disabled / false by default)
    const [widgetLockTheme, setWidgetLockTheme] = useState<boolean>(() => {
        return localStorage.getItem('widget_lock_theme') === 'true';
    });
    const [showWidgetsGuide, setShowWidgetsGuide] = useState<boolean>(false);
    const [showWidgetDesignModal, setShowWidgetDesignModal] = useState<boolean>(false);

    const handleToggleWidgetArabic = async () => {
        const next = widgetLockLang === 'ar' ? null : 'ar';
        setWidgetLockLang(next);
        if (next) {
            localStorage.setItem('widget_lock_lang', next);
            await Preferences.set({ key: 'widget_lock_lang', value: next }).catch(() => {});
            showToast(isEn ? 'Widgets locked to Arabic' : 'تم تثبيت لغة الودجت: العربية');
        } else {
            localStorage.removeItem('widget_lock_lang');
            await Preferences.remove({ key: 'widget_lock_lang' }).catch(() => {});
            showToast(isEn ? 'Widgets follow app language' : 'لغة الودجت تتبع لغة التطبيق');
        }
        window.dispatchEvent(new CustomEvent('widget-settings-changed'));
    };

    const handleToggleWidgetEnglish = async () => {
        const next = widgetLockLang === 'en' ? null : 'en';
        setWidgetLockLang(next);
        if (next) {
            localStorage.setItem('widget_lock_lang', next);
            await Preferences.set({ key: 'widget_lock_lang', value: next }).catch(() => {});
            showToast(isEn ? 'Widgets locked to English' : 'تم تثبيت لغة الودجت: الإنجليزية');
        } else {
            localStorage.removeItem('widget_lock_lang');
            await Preferences.remove({ key: 'widget_lock_lang' }).catch(() => {});
            showToast(isEn ? 'Widgets follow app language' : 'لغة الودجت تتبع لغة التطبيق');
        }
        window.dispatchEvent(new CustomEvent('widget-settings-changed'));
    };

    const handleToggleWidgetTheme = async () => {
        const next = !widgetLockTheme;
        setWidgetLockTheme(next);
        localStorage.setItem('widget_lock_theme', next ? 'true' : 'false');
        await Preferences.set({ key: 'widget_lock_theme', value: next ? 'true' : 'false' }).catch(() => {});
        if (!next) {
            await syncWidgetThemeColors(themeKey, theme).catch(() => {});
            showToast(isEn ? 'Widget theme follows app' : 'الودجت يتبع ثيم التطبيق');
        } else {
            showToast(isEn ? 'Widget theme locked' : 'تم تثبيت ثيم الودجت الحالي');
        }
        window.dispatchEvent(new CustomEvent('widget-settings-changed'));
    };

    const toggleAppSetting = (key: string) => {
        const newSettings = { ...appSettings, [key]: !appSettings[key] };
        setAppSettings(newSettings);
        localStorage.setItem('notification_settings' + modeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('notification-settings-change'));
        
        const labelsAr: Record<string, string> = {
            quarter: 'تنبيهات الأحزاب والأرباع',
            sajda: 'تنبيهات السجدات',
            themes: 'تنبيهات تغيير الثيمات',
            downloads: 'تنبيهات التحميل',
            bookmarks: 'تنبيهات الإشارات المرجعية',
            juz: 'تنبيهات بداية الأجزاء',
            general: 'التنبيهات العامة'
        };

        const labelsEn: Record<string, string> = {
            quarter: 'Hizb & Quarter Alerts',
            sajda: 'Sajdah Alerts',
            themes: 'Theme Change Alerts',
            downloads: 'Download Alerts',
            bookmarks: 'Bookmark Alerts',
            juz: 'Juz Alerts',
            general: 'General Alerts'
        };

        const label = isEn ? labelsEn[key] : labelsAr[key];
        const status = newSettings[key] 
            ? (isEn ? 'Enabled' : 'تم تفعيل') 
            : (isEn ? 'Disabled' : 'تم تعطيل');
        
        showToast(isEn ? `${label} ${status.toLowerCase()}` : `${status} ${label}`);
    };

    const togglePhoneSetting = (key: keyof Omit<PhoneNotificationSettings, 'randomAthkar'>) => {
        const isEnabled = !phoneSettings[key].enabled;
        const newSettings = {
            ...phoneSettings,
            [key]: { ...phoneSettings[key], enabled: isEnabled }
        };
        updateSpecificSetting(key, { enabled: isEnabled });
        
        setTimeout(() => {
            setupNotifications(newSettings, isEn ? 'en' : 'ar');
        }, 100);

        const labelsAr: Record<string, string> = {
            sabah: 'أذكار الصباح',
            masaa: 'أذكار المساء',
            dua: 'وقت الدعاء',
            tasbeehMorning: 'التسبيح (صباحاً)',
            tasbeehEvening: 'التسبيح (مساءً)',
            kahf: 'سورة الكهف',
        };

        const labelsEn: Record<string, string> = {
            sabah: 'Morning Athkar',
            masaa: 'Evening Athkar',
            dua: 'Dua Time',
            tasbeehMorning: 'Morning Tasbeeh',
            tasbeehEvening: 'Evening Tasbeeh',
            kahf: 'Surah Al-Kahf',
        };

        const label = isEn ? labelsEn[key] : labelsAr[key];
        const status = isEnabled 
            ? (isEn ? 'Enabled' : 'تم تفعيل') 
            : (isEn ? 'Disabled' : 'تم تعطيل');
        
        showToast(isEn ? `${label} ${status.toLowerCase()}` : `${status} ${label}`);
    };

    const handleTimeChange = (key: keyof Omit<PhoneNotificationSettings, 'randomAthkar'>, time: string) => {
        const newSettings = {
            ...phoneSettings,
            [key]: { ...phoneSettings[key], time }
        };
        updateSpecificSetting(key, { time });
        setTimeout(() => {
            setupNotifications(newSettings, isEn ? 'en' : 'ar');
        }, 100);
    };

    const handleRandomSettingChange = (value: Partial<PhoneNotificationSettings['randomAthkar']>) => {
        const newSettings = {
            ...phoneSettings,
            randomAthkar: { ...phoneSettings.randomAthkar, ...value }
        };
        updateRandomSettings(value);
        setTimeout(() => {
            setupNotifications(newSettings, isEn ? 'en' : 'ar');
        }, 100);
    };

    const toggleRandomAthkar = () => {
        const isEnabled = !phoneSettings.randomAthkar.enabled;
        handleRandomSettingChange({ enabled: isEnabled });
        showToast(isEn 
            ? `Random Athkar ${isEnabled ? 'enabled' : 'disabled'}` 
            : `${isEnabled ? 'تم تفعيل' : 'تم تعطيل'} الأذكار العشوائية`
        );
    };

    const toggleNightNotification = (key: 'firstThird' | 'midnight' | 'lastThird') => {
        const currentNightNotifs = config.nightNotifications || { firstThird: true, midnight: true, lastThird: true };
        const newNightNotifs = { ...currentNightNotifs, [key]: !currentNightNotifs[key] };
        updateConfig({ nightNotifications: newNightNotifs });
        
        const labelsAr: Record<string, string> = {
            firstThird: 'أول الليل',
            midnight: 'منتصف الليل',
            lastThird: 'الثلث الأخير'
        };

        const labelsEn: Record<string, string> = {
            firstThird: 'First Third of Night',
            midnight: 'Midnight',
            lastThird: 'Last Third of Night'
        };

        const label = isEn ? labelsEn[key] : labelsAr[key];
        const status = newNightNotifs[key] 
            ? (isEn ? 'Enabled' : 'تم تفعيل') 
            : (isEn ? 'Disabled' : 'تم تعطيل');
        
        showToast(isEn ? `${label} notification ${status.toLowerCase()}` : `${status} إشعار ${label}`);
    };

    const muteAudioForDuration = (durationDays: number) => {
        const muteUntil = Date.now() + durationDays * 24 * 60 * 60 * 1000;
        updateConfig({ audioMutedUntil: muteUntil });
        showToast(isEn 
            ? `Prayer audio alerts paused for ${toEnglishDigits(durationDays)} day(s)` 
            : `تم تعطيل التنبيهات الصوتية للصلاة لمدة ${toArabic(durationDays)} يوم`
        );
    };

    const unmuteAudio = () => {
        updateConfig({ audioMutedUntil: undefined });
        showToast(isEn ? 'Prayer audio alerts activated' : 'تم تفعيل التنبيهات الصوتية للصلاة');
    };

    const isAudioMuted = config.audioMutedUntil && Date.now() < config.audioMutedUntil;

    return (
        <div dir={dir} lang={isEn ? 'en' : 'ar'} className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div 
                className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter border-0`} 
                style={{ backgroundColor: themeStyles.modalBg, color: themeStyles.modalText, border: 'none', outline: 'none' }} 
                onClick={e => e.stopPropagation()}
            >

                {hideAppTab ? (
                    <div className="flex items-center justify-between p-3.5 sm:p-4 border-b" style={{ borderColor: `${themeStyles.accent}20` }}>
                        <div className="flex items-center gap-2 font-black text-sm sm:text-base" style={{ color: themeStyles.accent }}>
                            <Smartphone className="w-5 h-5 shrink-0 quran-3d-icon" />
                            <span>{phoneTabTitle || (isEn ? 'Prayer Settings & Notifications' : 'إعدادات الصلاة والإشعارات')}</span>
                        </div>
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                            style={{ backgroundColor: `${themeStyles.accent}18`, color: themeStyles.accent }}
                            title={isEn ? "Close" : "إغلاق"}
                        >
                            <X className="w-5 h-5 quran-3d-icon" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 p-3 border-b" style={{ borderColor: `${themeStyles.accent}20` }}>
                        <button 
                            className="flex-1 py-2.5 px-3 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xl border-0 shadow-xs"
                            style={{ 
                                backgroundColor: activeTab === 'app' ? themeStyles.accent : themeStyles.cardBg,
                                color: activeTab === 'app' ? themeStyles.btnText : themeStyles.text,
                                border: 'none'
                            }}
                            onClick={() => setActiveTab('app')}
                        >
                            <AppWindow className="w-4 h-4 quran-3d-icon" />
                            {isEn ? 'App Notifications' : 'إشعارات التطبيق'}
                        </button>
                        <button 
                            className="flex-1 py-2.5 px-3 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xl border-0 shadow-xs"
                            style={{ 
                                backgroundColor: activeTab === 'phone' ? themeStyles.accent : themeStyles.cardBg,
                                color: activeTab === 'phone' ? themeStyles.btnText : themeStyles.text,
                                border: 'none'
                            }}
                            onClick={() => setActiveTab('phone')}
                        >
                            <Smartphone className="w-4 h-4 quran-3d-icon" />
                            {phoneTabTitle || (isEn ? 'Phone Notifications' : 'إشعارات الهاتف')}
                        </button>
                    </div>
                )}

                <div className="px-4 py-2.5 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'app' ? (
                        <div className="space-y-2 animate-fadeIn">
                            {[
                                { id: 'quarter', label: isEn ? 'Hizbs & Quarters' : 'الأحزاب والأرباع' },
                                { id: 'juz', label: isEn ? 'Juz Beginnings' : 'بداية الأجزاء' },
                                { id: 'sajda', label: isEn ? 'Sajdah Places' : 'مواضع السجدات' },
                                { id: 'themes', label: isEn ? 'Theme Changes' : 'تغيير الثيمات' },
                                { id: 'downloads', label: isEn ? 'Downloads' : 'التحميلات' },
                                { id: 'bookmarks', label: isEn ? 'Bookmarks' : 'الإشارات المرجعية' },
                                { id: 'general', label: isEn ? 'General Alerts' : 'تنبيهات عامة' }
                            ].map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => toggleAppSetting(item.id)}
                                    className="flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border-0 shadow-2xs"
                                    style={{ 
                                        backgroundColor: themeStyles.cardBg, 
                                        color: themeStyles.text,
                                        border: `1px solid ${themeStyles.cardBorder}`
                                    }}
                                >
                                    <span className="font-bold text-sm">{item.label}</span>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center transition-colors shadow-inner shrink-0" style={{ backgroundColor: appSettings[item.id] ? themeStyles.accent : 'rgba(0,0,0,0.1)', color: appSettings[item.id] ? '#ffffff' : 'transparent' }}>
                                        {appSettings[item.id] && <Check className="w-3 h-3 stroke-[3] quran-3d-icon" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3 animate-fadeIn pb-4">
                            {/* Persistent Prayer Times Notification Card */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-xs sm:text-sm opacity-90 flex items-center gap-2" style={{ color: themeStyles.accent }}>
                                    <BellRing className="w-4 h-4 quran-3d-icon shrink-0" />
                                    <span>{isEn ? 'Ongoing Prayer Notification' : 'الإشعار المستمر لمواقيت الصلاة'}</span>
                                </h4>

                                <div 
                                    onClick={togglePersistentNotification}
                                    className="flex items-center justify-between gap-2 py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border-0 shadow-2xs"
                                    style={{ 
                                        backgroundColor: themeStyles.cardBg, 
                                        color: themeStyles.text,
                                        border: `1px solid ${themeStyles.cardBorder}`
                                    }}
                                >
                                    <span className="font-bold text-xs sm:text-sm">
                                        {isEn ? 'Persistent Prayer Notification (Status Bar)' : 'إشعار الصلاة المستمر (الشريط العلوي بجوار الساعة)'}
                                    </span>
                                    <div 
                                        className="w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-inner" 
                                        style={{ 
                                            backgroundColor: isPersistentNotificationEnabled ? themeStyles.accent : 'rgba(0,0,0,0.12)', 
                                            color: isPersistentNotificationEnabled ? '#ffffff' : 'transparent' 
                                        }}
                                    >
                                        {isPersistentNotificationEnabled && <Check className="w-3 h-3 stroke-[3] quran-3d-icon" />}
                                    </div>
                                </div>

                                 {/* Battery Optimization Status (Android only) */}
                                {Capacitor.getPlatform() === 'android' && isPersistentNotificationEnabled && (
                                    <div 
                                        className="py-2.5 px-3.5 rounded-xl flex items-center justify-between gap-2 text-xs border-0 shadow-2xs" 
                                        style={{ 
                                            backgroundColor: themeStyles.cardBg, 
                                            color: themeStyles.text,
                                            border: `1px solid ${themeStyles.cardBorder}`
                                        }}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {isBatteryIgnored ? (
                                                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 quran-3d-icon" />
                                            ) : (
                                                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 quran-3d-icon" />
                                            )}
                                            <span className="font-bold text-xs truncate">
                                                {isBatteryIgnored 
                                                    ? (isEn ? 'Background: Unrestricted' : 'حالة البطارية: غير مقيد') 
                                                    : (isEn ? 'Battery Optimization Active' : 'استثناء من توفير البطارية')}
                                            </span>
                                        </div>

                                        {!isBatteryIgnored && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRequestBatteryOptimization();
                                                }}
                                                className="px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-md flex-shrink-0 transition-all border-0 cursor-pointer"
                                                style={{ backgroundColor: themeStyles.accent, color: themeStyles.btnText }}
                                            >
                                                {isEn ? 'Allow' : 'استثناء'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Home Screen Widgets Section */}
                            <div className="space-y-2 pt-1">
                                <h4 className="font-bold text-xs sm:text-sm opacity-90 flex items-center gap-2" style={{ color: themeStyles.accent }}>
                                    <LayoutGrid className="w-4 h-4 quran-3d-icon shrink-0" />
                                    <span>{isEn ? 'Home Screen Widgets' : 'التطبيقات المصغرة (الودجت)'}</span>
                                </h4>

                                <div className="grid grid-cols-2 gap-2">
                                    <div
                                        onClick={handleToggleWidgetArabic}
                                        className="py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 border-0 shadow-2xs"
                                        style={{ 
                                            backgroundColor: themeStyles.cardBg, 
                                            color: themeStyles.text,
                                            border: `1px solid ${themeStyles.cardBorder}`
                                        }}
                                    >
                                        <span className="font-bold text-xs">{isEn ? 'Lock Arabic' : 'تثبيت العربية'}</span>
                                        <div 
                                            className="w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-inner"
                                            style={{
                                                backgroundColor: widgetLockLang === 'ar' ? themeStyles.accent : 'rgba(0,0,0,0.12)',
                                                color: widgetLockLang === 'ar' ? '#ffffff' : 'transparent'
                                            }}
                                        >
                                            {widgetLockLang === 'ar' && <Check className="w-3 h-3 stroke-[3] quran-3d-icon" />}
                                        </div>
                                    </div>

                                    <div
                                        onClick={handleToggleWidgetEnglish}
                                        className="py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 border-0 shadow-2xs"
                                        style={{ 
                                            backgroundColor: themeStyles.cardBg, 
                                            color: themeStyles.text,
                                            border: `1px solid ${themeStyles.cardBorder}`
                                        }}
                                    >
                                        <span className="font-bold text-xs">{isEn ? 'Lock English' : 'تثبيت الإنجليزية'}</span>
                                        <div 
                                            className="w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-inner"
                                            style={{
                                                backgroundColor: widgetLockLang === 'en' ? themeStyles.accent : 'rgba(0,0,0,0.12)',
                                                color: widgetLockLang === 'en' ? '#ffffff' : 'transparent'
                                            }}
                                        >
                                            {widgetLockLang === 'en' && <Check className="w-3 h-3 stroke-[3] quran-3d-icon" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Night Times Section */}
                            <div className="space-y-2 pt-1">
                                <h4 className="font-bold text-xs sm:text-sm opacity-90" style={{ color: themeStyles.accent }}>{isEn ? 'Night Times' : 'أوقات الليل'}</h4>
                                {[
                                    { id: 'firstThird', label: isEn ? 'First Third of Night' : 'أول الليل' },
                                    { id: 'midnight', label: isEn ? 'Midnight' : 'منتصف الليل' },
                                    { id: 'lastThird', label: isEn ? 'Last Third of Night' : 'الثلث الأخير' }
                                ].map((item) => {
                                    const isEnabled = config.nightNotifications?.[item.id as keyof typeof config.nightNotifications] ?? true;
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => toggleNightNotification(item.id as 'firstThird' | 'midnight' | 'lastThird')}
                                            className="flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border-0 shadow-2xs"
                                            style={{ 
                                                backgroundColor: themeStyles.cardBg, 
                                                color: themeStyles.text,
                                                border: `1px solid ${themeStyles.cardBorder}`
                                            }}
                                        >
                                            <span className="font-bold text-xs sm:text-sm">{item.label}</span>
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center transition-colors shadow-inner shrink-0" style={{ backgroundColor: isEnabled ? themeStyles.accent : 'rgba(0,0,0,0.12)', color: isEnabled ? '#ffffff' : 'transparent' }}>
                                                {isEnabled && <Check className="w-3 h-3 stroke-[3] quran-3d-icon" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* نغمة إشعارات الأذكار والتنبيهات */}
                            <div className="space-y-2 pt-1" id="settings-notification-tone-section">
                                <div className="flex flex-col text-right">
                                    <h4 className="font-bold text-xs sm:text-sm opacity-90 flex items-center gap-2" style={{ color: themeStyles.accent }}>
                                        <Bell className="w-4 h-4 quran-3d-icon shrink-0" />
                                        <span>{isEn ? 'Notification Tone (Athkar & Reminders)' : 'نغمة إشعارات الأذكار والتنبيهات'}</span>
                                    </h4>
                                    <p className="text-[11px] opacity-70 mt-0.5 leading-relaxed">
                                        {isEn 
                                            ? 'Tone for athkar, supplications, and general reminders only. Does not affect Adhan prayer alerts.' 
                                            : 'خاصة بنغمة الأذكار والأدعية والتنبيهات العامة فقط، ولا تؤثر نهائياً على أصوات وتنبيهات الأذان.'}
                                    </p>
                                </div>
                                <div 
                                    className="p-2.5 rounded-2xl border-0 shadow-2xs"
                                    style={{ 
                                        backgroundColor: themeStyles.cardBg, 
                                        color: themeStyles.text,
                                        border: `1px solid ${themeStyles.cardBorder}`
                                    }}
                                >
                                    <NotificationToneSelector 
                                        currentTone={activeNotificationTone}
                                        onToneChange={handleNotificationToneChange}
                                        secondaryColor={themeStyles.subtext}
                                        primaryColor={themeStyles.accent}
                                        cardBorderColor={themeStyles.cardBorder}
                                        isDefaultTheme={true}
                                        isBlackTheme={isBlackTheme}
                                        hideLabel={true}
                                    />
                                </div>
                            </div>

                            {/* Athkar & Tasbeeh Section */}
                            <div className="space-y-2 pt-1">
                                <h4 className="font-bold text-xs sm:text-sm opacity-90" style={{ color: themeStyles.accent }}>{isEn ? 'Athkar & Tasbeeh' : 'الأذكار والتسبيح'}</h4>
                                {[
                                    { id: 'sabah', label: isEn ? 'Morning Athkar' : 'أذكار الصباح' },
                                    { id: 'masaa', label: isEn ? 'Evening Athkar' : 'أذكار المساء' },
                                    { id: 'dua', label: isEn ? 'Dua Time' : 'وقت الدعاء' },
                                    { id: 'tasbeehMorning', label: isEn ? 'Morning Tasbeeh' : 'التسبيح (صباحاً)' },
                                    { id: 'tasbeehEvening', label: isEn ? 'Evening Tasbeeh' : 'التسبيح (مساءً)' },
                                    { id: 'kahf', label: isEn ? 'Surah Al-Kahf' : 'سورة الكهف' }
                                ].map((item) => {
                                    const settingKey = item.id as keyof Omit<PhoneNotificationSettings, 'randomAthkar'>;
                                    const setting = phoneSettings[settingKey];
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => togglePhoneSetting(settingKey)}
                                            className="flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border-0 shadow-2xs"
                                            style={{ 
                                                backgroundColor: themeStyles.cardBg, 
                                                color: themeStyles.text,
                                                border: `1px solid ${themeStyles.cardBorder}`
                                            }}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-5 h-5 rounded-full flex items-center justify-center transition-colors shadow-inner shrink-0" style={{ backgroundColor: setting.enabled ? themeStyles.accent : 'rgba(0,0,0,0.12)', color: setting.enabled ? '#ffffff' : 'transparent' }}>
                                                    {setting.enabled && <Check className="w-3 h-3 stroke-[3] quran-3d-icon" />}
                                                </div>
                                                <span className="font-bold text-xs sm:text-sm truncate">{item.label}</span>
                                            </div>
                                            
                                            {setting.enabled && (
                                                <ClickableTimeValue
                                                    value={setting.time}
                                                    onChange={(newTime) => handleTimeChange(settingKey, newTime)}
                                                    isEn={isEn}
                                                    title={item.label}
                                                    className="text-xs px-2 py-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Random Athkar Section */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-xs sm:text-sm opacity-90 flex items-center gap-2" style={{ color: themeStyles.accent }}>
                                        <Shuffle className="w-4 h-4 quran-3d-icon shrink-0" />
                                        {isEn ? 'Random Athkar' : 'أذكار عشوائية'}
                                    </h4>
                                    <div 
                                        onClick={toggleRandomAthkar}
                                        className="w-[35px] h-[19px] rounded-full relative transition-all cursor-pointer shadow-inner shrink-0"
                                        style={{ backgroundColor: phoneSettings.randomAthkar.enabled ? themeStyles.accent : 'rgba(0,0,0,0.2)' }}
                                    >
                                        <div className={`absolute top-[2.5px] w-[14px] h-[14px] rounded-full bg-white shadow-md transition-all ${
                                            phoneSettings.randomAthkar.enabled 
                                                ? (isRTL ? 'right-[18px]' : 'left-[18px]') 
                                                : (isRTL ? 'right-[3px]' : 'left-[3px]')
                                        }`} />
                                    </div>
                                </div>

                                {phoneSettings.randomAthkar.enabled && (
                                    <div 
                                        className="p-3 rounded-2xl space-y-2.5 animate-fadeIn border-0 shadow-2xs"
                                        style={{ 
                                            backgroundColor: themeStyles.cardBg, 
                                            color: themeStyles.text,
                                            border: `1px solid ${themeStyles.cardBorder}`
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold">{isEn ? 'Daily Frequency:' : 'عدد المرات يومياً:'}</span>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleRandomSettingChange({ frequency: Math.max(1, phoneSettings.randomAthkar.frequency - 1) })}
                                                    className="w-7 h-7 rounded-xl flex items-center justify-center font-bold cursor-pointer border-0 shadow-xs"
                                                    style={{ backgroundColor: `${themeStyles.accent}20`, color: themeStyles.accent }}
                                                >
                                                    -
                                                </button>
                                                <span
                                                    dir="ltr"
                                                    className="text-sm font-bold tabular-nums"
                                                    style={{ color: themeStyles.accent }}
                                                >
                                                    {isEn ? toEnglishDigits(phoneSettings.randomAthkar.frequency) : toArabic(phoneSettings.randomAthkar.frequency)}
                                                </span>
                                                <button 
                                                    onClick={() => handleRandomSettingChange({ frequency: Math.min(20, phoneSettings.randomAthkar.frequency + 1) })}
                                                    className="w-7 h-7 rounded-xl flex items-center justify-center font-bold cursor-pointer border-0 shadow-xs"
                                                    style={{ backgroundColor: `${themeStyles.accent}20`, color: themeStyles.accent }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="space-y-1">
                                                <span className="text-[10px] opacity-80 block">{isEn ? 'Start Time:' : 'وقت البدء:'}</span>
                                                <ClickableTimeValue
                                                    value={phoneSettings.randomAthkar.startTime}
                                                    onChange={(newTime) => handleRandomSettingChange({ startTime: newTime })}
                                                    isEn={isEn}
                                                    title={isEn ? 'Start Time' : 'وقت البدء'}
                                                    accentColor={false}
                                                    className="w-full text-xs text-inherit py-2 px-2.5 rounded-xl border border-black/10 dark:border-white/10"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] opacity-80 block">{isEn ? 'End Time:' : 'وقت الانتهاء:'}</span>
                                                <ClickableTimeValue
                                                    value={phoneSettings.randomAthkar.endTime}
                                                    onChange={(newTime) => handleRandomSettingChange({ endTime: newTime })}
                                                    isEn={isEn}
                                                    title={isEn ? 'End Time' : 'وقت الانتهاء'}
                                                    accentColor={false}
                                                    className="w-full text-xs text-inherit py-2 px-2.5 rounded-xl border border-black/10 dark:border-white/10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pause Prayer Audio Alerts Section */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-xs sm:text-sm opacity-90 flex items-center gap-2" style={{ color: themeStyles.accent }}>
                                        <VolumeX className="w-4 h-4 quran-3d-icon shrink-0" />
                                        {isEn ? 'Pause Prayer Audio Alerts' : 'إيقاف التنبيهات الصوتية للصلاة'}
                                    </h4>
                                    {isAudioMuted && (
                                        <button onClick={unmuteAudio} className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-xl font-bold cursor-pointer border-0">
                                            {isEn ? 'Unmute Audio' : 'تفعيل الصوت'}
                                        </button>
                                    )}
                                </div>
                                {isAudioMuted && config.audioMutedUntil && (
                                    <p className="text-xs text-red-500">
                                        {isEn 
                                            ? `Audio alerts paused until: ${formatMuteDate(config.audioMutedUntil, true)}` 
                                            : `التنبيهات الصوتية متوقفة حتى: ${formatMuteDate(config.audioMutedUntil, false)}`}
                                    </p>
                                )}
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { labelAr: 'اليوم', labelEn: 'Today', days: 1 },
                                        { labelAr: 'غداً', labelEn: 'Tomorrow', days: 2 },
                                        { labelAr: 'يومان', labelEn: '2 Days', days: 2 },
                                        { labelAr: `${toArabic(3)} أيام`, labelEn: '3 Days', days: 3 },
                                        { labelAr: `${toArabic(4)} أيام`, labelEn: '4 Days', days: 4 },
                                        { labelAr: 'أسبوع', labelEn: '1 Week', days: 7 },
                                        { labelAr: 'أسبوعين', labelEn: '2 Weeks', days: 14 },
                                        { labelAr: 'شهر', labelEn: '1 Month', days: 30 }
                                    ].map((opt) => (
                                        <button
                                            key={opt.labelEn}
                                            onClick={() => muteAudioForDuration(opt.days)}
                                            className="py-2 px-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-0 shadow-2xs hover:scale-105 active:scale-95"
                                            style={{ 
                                                backgroundColor: themeStyles.cardBg, 
                                                color: themeStyles.text,
                                                border: `1px solid ${themeStyles.cardBorder}`
                                            }}
                                        >
                                            {isEn ? opt.labelEn : opt.labelAr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3.5 flex justify-center border-t" style={{ borderColor: `${themeStyles.accent}20` }}>
                    <button 
                        onClick={() => {
                            setupNotifications();
                            onClose();
                        }}
                        className="w-full font-bold py-3 sm:py-3.5 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer border-0 text-sm"
                        style={{ backgroundColor: themeStyles.btnBg, color: themeStyles.btnText, border: 'none' }}
                    >
                        {isEn ? 'Save & Close' : 'حفظ وإغلاق'}
                    </button>
                </div>
            </div>

            {showWidgetDesignModal && (
                <WidgetDesignPreview onClose={() => setShowWidgetDesignModal(false)} />
            )}
        </div>
    );
};

export default NotificationSettingsModal;
