import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Smartphone, AppWindow, VolumeX, Shuffle, LayoutGrid, Palette, HelpCircle, BellRing, Bell, ShieldCheck, Zap } from 'lucide-react';
import { toArabic } from './constants';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { setupNotifications } from '../../utils/notifications';
import { useNotificationSettings, PhoneNotificationSettings } from '../../hooks/useNotificationSettings';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { syncWidgetThemeColors } from '../../utils/widgetUtils';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
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
}

const ClickableTimeValue: React.FC<ClickableTimeValueProps> = ({
    value,
    onChange,
    isEn,
    className = '',
    accentColor = true
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
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

    const triggerPicker = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (inputRef.current) {
            try {
                if (typeof (inputRef.current as any).showPicker === 'function') {
                    (inputRef.current as any).showPicker();
                } else {
                    inputRef.current.focus();
                    inputRef.current.click();
                }
            } catch {
                // Native Android WebView opens the time picker directly on input touch
            }
        }
    };

    return (
        <div
            onClick={triggerPicker}
            className={`relative inline-flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform ${className}`}
        >
            {isEn ? (
                <span
                    dir="ltr"
                    className="inline-flex items-center gap-1 font-bold tabular-nums pointer-events-none"
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
                    className="inline-flex items-center gap-1 font-bold tabular-nums pointer-events-none"
                    style={{ color: accentColor ? 'var(--qr-accent)' : undefined }}
                >
                    <span dir="ltr">{toArabic(hhStr)}:{toArabic(mmStr)}</span>
                    <span>{isPM ? 'م' : 'ص'}</span>
                </span>
            )}
            <input
                ref={inputRef}
                type="time"
                lang={isEn ? 'en-US' : 'ar'}
                value={normalizedInputValue}
                onChange={(e) => {
                    if (e.target.value) {
                        onChange(toEnglishDigits(e.target.value));
                    }
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    try {
                        (e.currentTarget as any).showPicker?.();
                    } catch {
                        // Handled natively by WebView / browser
                    }
                }}
                className="no-time-picker-icon absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
        </div>
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

    const { theme, themeKey } = useTheme();
    const isShinyGold = themeKey === 'shiny_gold';

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
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter border-0`} style={{ border: 'none', outline: 'none' }} onClick={e => e.stopPropagation()}>

                {hideAppTab ? (
                    <div className="flex items-center justify-between p-3.5 sm:p-4">
                        <div className="flex items-center gap-2 font-black text-sm sm:text-base" style={{ color: 'var(--qr-accent)' }}>
                            <Smartphone className="w-5 h-5 shrink-0 quran-3d-icon" />
                            <span>{phoneTabTitle || (isEn ? 'Prayer Settings & Notifications' : 'إعدادات الصلاة والإشعارات')}</span>
                        </div>
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center quran-raised-btn active:scale-95 transition-all cursor-pointer"
                            title={isEn ? "Close" : "إغلاق"}
                        >
                            <X className="w-5 h-5 quran-3d-icon" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 p-3">
                        <button 
                            className={`flex-1 py-2.5 px-3 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xl border-0 ${
                                activeTab === 'app' ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'
                            }`}
                            style={{ 
                                backgroundColor: activeTab === 'app' ? 'var(--qr-accent)' : undefined,
                                color: activeTab === 'app' ? 'var(--qr-accent-text, #fff)' : 'inherit',
                                border: 'none'
                            }}
                            onClick={() => setActiveTab('app')}
                        >
                            <AppWindow className="w-4 h-4 quran-3d-icon" />
                            {isEn ? 'App Notifications' : 'إشعارات التطبيق'}
                        </button>
                        <button 
                            className={`flex-1 py-2.5 px-3 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xl border-0 ${
                                activeTab === 'phone' ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'
                            }`}
                            style={{ 
                                backgroundColor: activeTab === 'phone' ? 'var(--qr-accent)' : undefined,
                                color: activeTab === 'phone' ? 'var(--qr-accent-text, #fff)' : 'inherit',
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
                                    className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border-0 ${
                                        isShinyGold
                                            ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40 hover:bg-amber-50/40'
                                            : (appSettings[item.id] ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn opacity-80')
                                    }`}
                                    style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}
                                >
                                    <span className="font-bold text-sm">{item.label}</span>
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center transition-colors shadow-inner shrink-0" style={{ backgroundColor: appSettings[item.id] ? 'var(--qr-accent)' : (isShinyGold ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)'), color: appSettings[item.id] ? 'var(--qr-accent-text, #fff)' : 'transparent' }}>
                                        {appSettings[item.id] && <Check className="w-2.5 h-2.5 quran-3d-icon" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3 animate-fadeIn pb-4">
                            {/* Persistent Prayer Times Notification Card */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-xs sm:text-sm opacity-90 flex items-center gap-2">
                                    <BellRing className="w-4 h-4 text-emerald-500 quran-3d-icon shrink-0" />
                                    <span>{isEn ? 'Ongoing Prayer Notification' : 'الإشعار المستمر لمواقيت الصلاة'}</span>
                                </h4>

                                <div 
                                    onClick={togglePersistentNotification}
                                    className={`flex items-center justify-between gap-2 py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border-0 ${
                                        isShinyGold
                                            ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40 hover:bg-amber-50/40'
                                            : (isPersistentNotificationEnabled ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn opacity-80')
                                    }`}
                                    style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}
                                >
                                    <span className="font-bold text-xs sm:text-sm">
                                        {isEn ? 'Persistent Prayer Notification (Status Bar)' : 'إشعار الصلاة المستمر (الشريط العلوي بجوار الساعة)'}
                                    </span>
                                    <div 
                                        className="w-4 h-4 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-inner" 
                                        style={{ 
                                            backgroundColor: isPersistentNotificationEnabled ? 'var(--qr-accent)' : (isShinyGold ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)'), 
                                            color: isPersistentNotificationEnabled ? 'var(--qr-accent-text, #fff)' : 'transparent' 
                                        }}
                                    >
                                        {isPersistentNotificationEnabled && <Check className="w-2.5 h-2.5 stroke-[3] quran-3d-icon" />}
                                    </div>
                                </div>

                                 {/* Battery Optimization Status (Android only) */}
                                {Capacitor.getPlatform() === 'android' && isPersistentNotificationEnabled && (
                                    <div className={`py-2.5 px-3.5 rounded-xl flex items-center justify-between gap-2 text-xs border-0 ${
                                        isShinyGold
                                            ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40'
                                            : (isBatteryIgnored 
                                                ? 'quran-raised-card text-emerald-800 dark:text-emerald-300' 
                                                : 'quran-raised-card text-amber-800 dark:text-amber-300')
                                    }`} style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}>
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
                                                className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-amber-600 hover:bg-amber-700 text-white shadow-md flex-shrink-0 transition-all quran-raised-btn border-0 cursor-pointer"
                                                style={{ border: 'none' }}
                                            >
                                                {isEn ? 'Allow' : 'استثناء'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Home Screen Widgets Section */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-bold text-xs sm:text-sm opacity-90 flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4 text-emerald-500 quran-3d-icon shrink-0" />
                                        <span>{isEn ? 'Home Screen Widgets' : 'التطبيقات المصغرة (الودجت)'}</span>
                                    </h4>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setShowWidgetsGuide(prev => !prev)}
                                            className="w-6 h-6 rounded-full quran-raised-btn flex items-center justify-center text-emerald-600 dark:text-emerald-400 active:scale-90 transition-all cursor-pointer border-0"
                                            style={{ border: 'none' }}
                                            title={isEn ? 'Widgets Guide & Details' : 'شرح وإرشاد التطبيقات المصغرة'}
                                            aria-label={isEn ? 'Widgets Guide & Details' : 'شرح وإرشاد التطبيقات المصغرة'}
                                        >
                                            <HelpCircle className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {showWidgetsGuide && (
                                    <div className={`p-3 rounded-xl text-[11px] sm:text-xs leading-relaxed space-y-2 border-0 ${
                                        isShinyGold ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40' : 'quran-raised-card'
                                    }`} style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-400">
                                            {isEn
                                                ? '3 Home Screen Widgets Available:'
                                                : 'التطبيقات المصغرة الثلاثة لشاشة الهاتف:'}
                                        </p>
                                        <ul className="space-y-1 opacity-90 list-disc ps-4">
                                            <li>
                                                <strong>{isEn ? 'Full Comprehensive Widget:' : 'الودجت الشامل (الكبير):'}</strong>{' '}
                                                {isEn
                                                    ? 'Shows all 6 prayer times, next prayer live countdown, Hijri & Gregorian dates, Midnight, and Last Third.'
                                                    : 'يعرض مواقيت الصلوات الست، الصلاة القادمة بالعد التنازلي الحي، التاريخ الهجري والميلادي، ومنتصف الليل والثلث الأخير.'}
                                            </li>
                                            <li>
                                                <strong>{isEn ? 'Medium Card Widget:' : 'ودجت البطاقة المتوسطة:'}</strong>{' '}
                                                {isEn
                                                    ? 'Displays city, date, highlighted next prayer with countdown, and daily prayer strip.'
                                                    : 'يعرض المدينة والتاريخ مع إبراز الصلاة القادمة والعد التنازلي وشريط مواقيت الصلوات.'}
                                            </li>
                                            <li>
                                                <strong>{isEn ? 'Compact Mini Widget:' : 'الودجت المدمج (الصغير):'}</strong>{' '}
                                                {isEn
                                                    ? 'Space-saving design showing city, next prayer, and its time.'
                                                    : 'تصميم مختصر يعرض المدينة والصلاة القادمة وموعدها في مساحة صغيرة.'}
                                            </li>
                                        </ul>
                                        <p className="opacity-90">
                                            <strong>{isEn ? 'Dynamic Theme & Locking:' : 'تغيير الثيم وتثبيت اللون أو اللغة:'}</strong>{' '}
                                            {isEn
                                                ? 'All 3 widgets automatically change colors to match your selected app theme. Use "Lock Widget Theme" below to freeze the current widget color so it stays unchanged when switching themes, or use "Lock Arabic / Lock English" to pin the widget language independently of the app language.'
                                                : 'تتغير ألوان وتصاميم الودجت الثلاثة تلقائياً مع تغير ثيم التطبيق. يمكنك تفعيل «تثبيت ثيم الودجت» بالأسفل للاحتفاظ بلون الودجت الحالي ثابتاً دون تأثر بتغيير الثيم، أو تفعيل «تثبيت العربية / تثبيت الإنجليزية» لتثبيت لغة الودجت بشكل مستقل عن لغة التطبيق.'}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <div
                                        onClick={handleToggleWidgetArabic}
                                        className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 border-0 ${
                                            isShinyGold
                                                ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40 hover:bg-amber-50/40'
                                                : (widgetLockLang === 'ar' ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn opacity-80')
                                        }`}
                                        style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}
                                    >
                                        <span className="font-bold text-xs">{isEn ? 'Lock Arabic' : 'تثبيت العربية'}</span>
                                        <div 
                                            className="w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-inner"
                                            style={{
                                                backgroundColor: widgetLockLang === 'ar' ? 'var(--qr-accent)' : (isShinyGold ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)'),
                                                color: widgetLockLang === 'ar' ? 'var(--qr-accent-text, #fff)' : 'transparent'
                                            }}
                                        >
                                            {widgetLockLang === 'ar' && <Check className="w-2.5 h-2.5 stroke-[3] quran-3d-icon" />}
                                        </div>
                                    </div>

                                    <div
                                        onClick={handleToggleWidgetEnglish}
                                        className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 border-0 ${
                                            isShinyGold
                                                ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40 hover:bg-amber-50/40'
                                                : (widgetLockLang === 'en' ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn opacity-80')
                                        }`}
                                        style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}
                                    >
                                        <span className="font-bold text-xs">{isEn ? 'Lock English' : 'تثبيت الإنجليزية'}</span>
                                        <div 
                                            className="w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-inner"
                                            style={{
                                                backgroundColor: widgetLockLang === 'en' ? 'var(--qr-accent)' : (isShinyGold ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)'),
                                                color: widgetLockLang === 'en' ? 'var(--qr-accent-text, #fff)' : 'transparent'
                                            }}
                                        >
                                            {widgetLockLang === 'en' && <Check className="w-2.5 h-2.5 stroke-[3] quran-3d-icon" />}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={handleToggleWidgetTheme}
                                    className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border-0 ${
                                        isShinyGold
                                            ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40 hover:bg-amber-50/40'
                                            : (widgetLockTheme ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn opacity-80')
                                    }`}
                                    style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}
                                >
                                    <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                                        <Palette className="w-3.5 h-3.5 opacity-80 quran-3d-icon shrink-0" />
                                        <span>{isEn ? 'Lock Widget Theme' : 'تثبيت ثيم الودجت'}</span>
                                    </span>
                                    <div 
                                        className="w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-inner"
                                        style={{
                                            backgroundColor: widgetLockTheme ? 'var(--qr-accent)' : (isShinyGold ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)'),
                                            color: widgetLockTheme ? 'var(--qr-accent-text, #fff)' : 'transparent'
                                        }}
                                    >
                                        {widgetLockTheme && <Check className="w-2.5 h-2.5 stroke-[3] quran-3d-icon" />}
                                    </div>
                                </div>
                            </div>

                            {/* Night Times Section */}
                            <div className="space-y-2 pt-1">
                                <h4 className="font-bold text-xs sm:text-sm opacity-90">{isEn ? 'Night Times' : 'أوقات الليل'}</h4>
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
                                            className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border-0 ${
                                                isShinyGold
                                                    ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40 hover:bg-amber-50/40'
                                                    : (isEnabled ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn opacity-80')
                                            }`}
                                            style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}
                                        >
                                            <span className="font-bold text-xs sm:text-sm">{item.label}</span>
                                            <div className="w-4 h-4 rounded-full flex items-center justify-center transition-colors shadow-inner shrink-0" style={{ backgroundColor: isEnabled ? 'var(--qr-accent)' : (isShinyGold ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)'), color: isEnabled ? 'var(--qr-accent-text, #fff)' : 'transparent' }}>
                                                {isEnabled && <Check className="w-2.5 h-2.5 quran-3d-icon" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Athkar & Tasbeeh Section */}
                            <div className="space-y-2 pt-1">
                                <h4 className="font-bold text-xs sm:text-sm opacity-90">{isEn ? 'Athkar & Tasbeeh' : 'الأذكار والتسبيح'}</h4>
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
                                            className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border-0 ${
                                                isShinyGold
                                                    ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40 hover:bg-amber-50/40'
                                                    : (setting.enabled ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn opacity-80')
                                            }`}
                                            style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center transition-colors shadow-inner shrink-0" style={{ backgroundColor: setting.enabled ? 'var(--qr-accent)' : (isShinyGold ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)'), color: setting.enabled ? 'var(--qr-accent-text, #fff)' : 'transparent' }}>
                                                    {setting.enabled && <Check className="w-2.5 h-2.5 quran-3d-icon" />}
                                                </div>
                                                <span className="font-bold text-xs sm:text-sm truncate">{item.label}</span>
                                            </div>
                                            
                                            {setting.enabled && (
                                                <ClickableTimeValue
                                                    value={setting.time}
                                                    onChange={(newTime) => handleTimeChange(settingKey, newTime)}
                                                    isEn={isEn}
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
                                    <h4 className="font-bold text-xs sm:text-sm opacity-90 flex items-center gap-2">
                                        <Shuffle className="w-4 h-4 quran-3d-icon shrink-0" />
                                        {isEn ? 'Random Athkar' : 'أذكار عشوائية'}
                                    </h4>
                                    <div 
                                        onClick={toggleRandomAthkar}
                                        className={`w-[35px] h-[19px] rounded-full relative transition-all cursor-pointer shadow-inner shrink-0 ${phoneSettings.randomAthkar.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-[2.5px] w-[14px] h-[14px] rounded-full bg-white shadow-md transition-all ${
                                            phoneSettings.randomAthkar.enabled 
                                                ? (isRTL ? 'right-[18px]' : 'left-[18px]') 
                                                : (isRTL ? 'right-[3px]' : 'left-[3px]')
                                        }`} />
                                    </div>
                                </div>

                                {phoneSettings.randomAthkar.enabled && (
                                    <div className={`p-3 rounded-2xl space-y-2.5 animate-fadeIn border-0 ${
                                        isShinyGold ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40' : 'quran-raised-card'
                                    }`} style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : { border: 'none' }}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold">{isEn ? 'Daily Frequency:' : 'عدد المرات يومياً:'}</span>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleRandomSettingChange({ frequency: Math.max(1, phoneSettings.randomAthkar.frequency - 1) })}
                                                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold cursor-pointer border-0 ${
                                                        isShinyGold ? 'bg-amber-50 hover:bg-amber-100 text-gray-900 shadow-xs border border-amber-200' : 'quran-raised-btn'
                                                    }`}
                                                    style={isShinyGold ? { backgroundColor: '#FFFBEB', color: '#1F2937' } : { border: 'none' }}
                                                >
                                                    -
                                                </button>
                                                <span
                                                    dir="ltr"
                                                    className="text-sm font-bold text-emerald-600 tabular-nums"
                                                    style={isEn ? { fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Cairo", sans-serif' } : undefined}
                                                >
                                                    {isEn ? toEnglishDigits(phoneSettings.randomAthkar.frequency) : toArabic(phoneSettings.randomAthkar.frequency)}
                                                </span>
                                                <button 
                                                    onClick={() => handleRandomSettingChange({ frequency: Math.min(20, phoneSettings.randomAthkar.frequency + 1) })}
                                                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold cursor-pointer border-0 ${
                                                        isShinyGold ? 'bg-amber-50 hover:bg-amber-100 text-gray-900 shadow-xs border border-amber-200' : 'quran-raised-btn'
                                                    }`}
                                                    style={isShinyGold ? { backgroundColor: '#FFFBEB', color: '#1F2937' } : { border: 'none' }}
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
                                                    accentColor={false}
                                                    className={`w-full text-xs text-inherit py-2 px-2.5 rounded-xl ${
                                                        isShinyGold ? 'bg-amber-50/60 border border-amber-200 text-gray-900' : 'quran-raised-btn'
                                                    }`}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] opacity-80 block">{isEn ? 'End Time:' : 'وقت الانتهاء:'}</span>
                                                <ClickableTimeValue
                                                    value={phoneSettings.randomAthkar.endTime}
                                                    onChange={(newTime) => handleRandomSettingChange({ endTime: newTime })}
                                                    isEn={isEn}
                                                    accentColor={false}
                                                    className={`w-full text-xs text-inherit py-2 px-2.5 rounded-xl ${
                                                        isShinyGold ? 'bg-amber-50/60 border border-amber-200 text-gray-900' : 'quran-raised-btn'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pause Prayer Audio Alerts Section */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-xs sm:text-sm opacity-90 flex items-center gap-2">
                                        <VolumeX className="w-4 h-4 quran-3d-icon shrink-0" />
                                        {isEn ? 'Pause Prayer Audio Alerts' : 'إيقاف التنبيهات الصوتية للصلاة'}
                                    </h4>
                                    {isAudioMuted && (
                                        <button onClick={unmuteAudio} className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-xl font-bold cursor-pointer quran-raised-btn border-0">
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
                                            className={`py-2 px-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-0 ${
                                                isShinyGold
                                                    ? 'bg-white text-gray-900 shadow-xs border border-amber-300/40 hover:bg-amber-50/50'
                                                    : 'quran-raised-btn'
                                            }`}
                                            style={isShinyGold ? { backgroundColor: '#FFFFFF', color: '#1F2937' } : (isEn ? { border: 'none', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Cairo", sans-serif' } : { border: 'none' })}
                                        >
                                            {isEn ? opt.labelEn : opt.labelAr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3.5 flex justify-center">
                    <button 
                        onClick={() => {
                            setupNotifications();
                            onClose();
                        }}
                        className="quran-raised-btn-selected w-full font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer border-0"
                        style={{ backgroundColor: 'var(--qr-accent)', color: 'var(--qr-accent-text, #fff)', border: 'none' }}
                    >
                        {isEn ? 'Save & Close' : 'حفظ وإغلاق'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
