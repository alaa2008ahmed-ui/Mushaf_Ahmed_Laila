import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Smartphone, AppWindow, VolumeX, Clock, Shuffle, ShieldCheck, Zap, BellRing } from 'lucide-react';
import { toArabic } from './constants';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { setupNotifications } from '../../utils/notifications';
import { useNotificationSettings, PhoneNotificationSettings } from '../../hooks/useNotificationSettings';
import { useLanguage } from '../../context/LanguageContext';
import { 
    setNativePersistentNotificationEnabled, 
    updateNativePersistentNotification, 
    checkNativeBatteryOptimization, 
    requestNativeBatteryOptimization 
} from '../../utils/silentMode';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

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

    const [isPersistentNotificationEnabled, setIsPersistentNotificationEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('persistent_prayer_notification_enabled');
        if (saved !== null) {
            return saved !== 'false';
        }
        return true; // Enabled by default as requested
    });

    const [isBatteryIgnored, setIsBatteryIgnored] = useState<boolean>(true);

    useEffect(() => {
        if (Capacitor.getPlatform() === 'android') {
            checkNativeBatteryOptimization().then(isIgnored => {
                setIsBatteryIgnored(isIgnored);
            });
        }
    }, []);

    const togglePersistentNotification = async () => {
        const newState = !isPersistentNotificationEnabled;
        
        // If enabling, ensure notification permissions are granted
        if (newState && Capacitor.isNativePlatform()) {
            try {
                const perm = await LocalNotifications.checkPermissions();
                if (perm.display !== 'granted') {
                    const req = await LocalNotifications.requestPermissions();
                    if (req.display !== 'granted') {
                        showToast(isEn ? 'Notification permission is required' : 'إذن الإشعارات مطلوب لتشغيل الإشعار المستمر');
                        return;
                    }
                }
            } catch (e) {
                console.warn('Notification permission check failed:', e);
            }
        }

        setIsPersistentNotificationEnabled(newState);
        localStorage.setItem('persistent_prayer_notification_enabled', newState ? 'true' : 'false');
        try {
            await Preferences.set({
                key: 'persistent_prayer_notification_enabled',
                value: newState ? 'true' : 'false'
            });
        } catch (e) {
            console.warn('Preferences set error:', e);
        }

        await setNativePersistentNotificationEnabled(newState);
        if (newState) {
            await updateNativePersistentNotification();
        }

        showToast(newState 
            ? (isEn ? 'Persistent prayer notification enabled' : 'تم تفعيل الإشعار المستمر لمواقيت الصلاة') 
            : (isEn ? 'Persistent prayer notification disabled' : 'تم تعطيل الإشعار المستمر لمواقيت الصلاة')
        );
    };

    const handleRequestBatteryOptimization = async () => {
        await requestNativeBatteryOptimization();
        setTimeout(async () => {
            const isIgnored = await checkNativeBatteryOptimization();
            setIsBatteryIgnored(isIgnored);
        }, 1500);
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
            ? `Prayer audio alerts paused for ${durationDays} day(s)` 
            : `تم تعطيل التنبيهات الصوتية للصلاة لمدة ${durationDays} يوم`
        );
    };

    const unmuteAudio = () => {
        updateConfig({ audioMutedUntil: undefined });
        showToast(isEn ? 'Prayer audio alerts activated' : 'تم تفعيل التنبيهات الصوتية للصلاة');
    };

    const isAudioMuted = config.audioMutedUntil && Date.now() < config.audioMutedUntil;

    return (
        <div dir={dir} className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>

                {hideAppTab ? (
                    <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-2 font-black text-sm sm:text-base" style={{ color: 'var(--qr-accent)' }}>
                            <Smartphone className="w-5 h-5 shrink-0" />
                            <span>{phoneTabTitle || (isEn ? 'Prayer Settings & Notifications' : 'إعدادات الصلاة والإشعارات')}</span>
                        </div>
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer opacity-70 hover:opacity-100"
                            title={isEn ? "Close" : "إغلاق"}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex border-b border-black/10 dark:border-white/10">
                        <button 
                            className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            style={{ 
                                color: activeTab === 'app' ? 'var(--qr-accent)' : 'inherit', 
                                borderBottom: activeTab === 'app' ? '2px solid var(--qr-accent)' : 'none',
                                opacity: activeTab === 'app' ? 1 : 0.6
                            }}
                            onClick={() => setActiveTab('app')}
                        >
                            <AppWindow className="w-4 h-4" />
                            {isEn ? 'App Notifications' : 'إشعارات التطبيق'}
                        </button>
                        <button 
                            className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            style={{ 
                                color: activeTab === 'phone' ? 'var(--qr-accent)' : 'inherit', 
                                borderBottom: activeTab === 'phone' ? '2px solid var(--qr-accent)' : 'none',
                                opacity: activeTab === 'phone' ? 1 : 0.6
                            }}
                            onClick={() => setActiveTab('phone')}
                        >
                            <Smartphone className="w-4 h-4" />
                            {phoneTabTitle || (isEn ? 'Phone Notifications' : 'إشعارات الهاتف')}
                        </button>
                    </div>
                )}

                <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'app' ? (
                        <div className="space-y-2 animate-fadeIn">
                            <p className="text-[11px] opacity-80 text-center mb-4">
                                {isEn ? 'Notifications displayed inside the app during use' : 'إشعارات تظهر داخل التطبيق أثناء الاستخدام'}
                            </p>
                            {[
                                { 
                                    id: 'quarter', 
                                    label: isEn ? 'Hizbs & Quarters' : 'الأحزاب والأرباع', 
                                    desc: isEn ? 'Alert when reaching a new Hizb or Quarter' : 'تنبيه عند الوصول لبداية حزب أو ربع جديد' 
                                },
                                { 
                                    id: 'juz', 
                                    label: isEn ? 'Juz Beginnings' : 'بداية الأجزاء', 
                                    desc: isEn ? 'Alert when transitioning to a new Juz' : 'تنبيه عند الانتقال لجزء جديد' 
                                },
                                { 
                                    id: 'sajda', 
                                    label: isEn ? 'Sajdah Places' : 'مواضع السجدات', 
                                    desc: isEn ? 'Alert when reaching a verse with prostration' : 'تنبيه عند الوصول لآية بها سجدة تلاوة' 
                                },
                                { 
                                    id: 'themes', 
                                    label: isEn ? 'Theme Changes' : 'تغيير الثيمات', 
                                    desc: isEn ? 'Alert when applying a new theme or color' : 'تنبيه عند تطبيق لون أو ثيم جديد' 
                                },
                                { 
                                    id: 'downloads', 
                                    label: isEn ? 'Downloads' : 'التحميلات', 
                                    desc: isEn ? 'Alerts for Surah or Tafseer download progress' : 'تنبيهات حالة تحميل السور أو التفاسير' 
                                },
                                { 
                                    id: 'bookmarks', 
                                    label: isEn ? 'Bookmarks' : 'الإشارات المرجعية', 
                                    desc: isEn ? 'Alert when saving or deleting a bookmark' : 'تنبيه عند حفظ أو حذف إشارة مرجعية' 
                                },
                                { 
                                    id: 'general', 
                                    label: isEn ? 'General Alerts' : 'تنبيهات عامة', 
                                    desc: isEn ? 'Alerts for saving, quizzes, and other actions' : 'تنبيهات الحفظ، الاختبارات، والعمليات الأخرى' 
                                }
                            ].map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => toggleAppSetting(item.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                        appSettings[item.id] 
                                        ? 'themed-card-bg shadow-sm' 
                                        : 'bg-black/5 dark:bg-white/10 border-transparent opacity-70'
                                    }`}
                                    style={{ borderColor: appSettings[item.id] ? 'var(--qr-accent)' : undefined }}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-sm">{item.label}</span>
                                        <span className="text-[10px] opacity-80">{item.desc}</span>
                                    </div>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: appSettings[item.id] ? 'var(--qr-accent)' : 'rgba(0,0,0,0.1)', color: appSettings[item.id] ? 'var(--qr-accent-text, #fff)' : 'transparent' }}>
                                        {appSettings[item.id] && <Check className="w-3 h-3" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fadeIn pb-16">
                            <p className="text-[11px] opacity-80 text-center mb-2">
                                {isEn ? 'Notifications shown on device screen even when app is closed' : 'إشعارات تظهر على شاشة الهاتف حتى لو كان التطبيق مغلقاً'}
                            </p>

                            {/* Persistent Prayer Times Notification Card */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-sm mb-1 opacity-90 flex items-center gap-2">
                                    <BellRing className="w-4 h-4 text-emerald-500" />
                                    <span>{isEn ? 'Ongoing Prayer Notification' : 'الإشعار المستمر لمواقيت الصلاة'}</span>
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-normal px-2 py-0.5 rounded-full">
                                        {isEn ? 'Live Countdown' : 'عد تنازلي لحظي'}
                                    </span>
                                </h4>

                                <div 
                                    onClick={togglePersistentNotification}
                                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                                        isPersistentNotificationEnabled 
                                        ? 'themed-card-bg shadow-sm' 
                                        : 'bg-black/5 dark:bg-white/10 border-transparent opacity-70'
                                    }`}
                                    style={{ borderColor: isPersistentNotificationEnabled ? 'var(--qr-accent)' : undefined }}
                                >
                                    <div className="flex flex-col gap-1 pr-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">
                                                {isEn ? 'Persistent Lock Screen & Status Bar Alert' : 'تثبيت إشعار الصلاة بشريط الحالة وشاشة القفل'}
                                            </span>
                                        </div>
                                        <span className="text-[11px] opacity-80 leading-relaxed">
                                            {isEn 
                                                ? 'Displays next prayer & live countdown without battery drain' 
                                                : 'إشعار دائم يوضح الصلاة القادمة والوقت المتبقي بدقة حتى عند إغلاق التطبيق وقفل الشاشة'}
                                        </span>
                                    </div>
                                    <div 
                                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0" 
                                        style={{ 
                                            backgroundColor: isPersistentNotificationEnabled ? 'var(--qr-accent)' : 'rgba(0,0,0,0.1)', 
                                            color: isPersistentNotificationEnabled ? 'var(--qr-accent-text, #fff)' : 'transparent' 
                                        }}
                                    >
                                        {isPersistentNotificationEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                </div>

                                {/* Battery Optimization Advice (Android only) */}
                                {Capacitor.getPlatform() === 'android' && isPersistentNotificationEnabled && (
                                    <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                                        isBatteryIgnored 
                                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                                        : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                    }`}>
                                        <div className="flex items-start gap-2 flex-1">
                                            {isBatteryIgnored ? (
                                                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                            ) : (
                                                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                            )}
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold">
                                                    {isBatteryIgnored 
                                                        ? (isEn ? 'Background execution: Unrestricted' : 'حالة البطارية: غير مقيد (مثالي)') 
                                                        : (isEn ? 'Battery optimization active' : 'استثناء من توفير البطارية')}
                                                </span>
                                                <span className="text-[10px] opacity-90">
                                                    {isBatteryIgnored
                                                        ? (isEn ? 'App is allowed to update prayer countdown smoothly in background' : 'التطبيق مستثنى ويعمل بسلاسة في الخلفية دون أن يوقفه نظام أندرويد')
                                                        : (isEn ? 'Recommended to allow background running so notification never stops' : 'اضغط لمنح إذن العمل في الخلفية لضمان عدم توقف الإشعار أو مواقيت الصلاة')}
                                                </span>
                                            </div>
                                        </div>

                                        {!isBatteryIgnored && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRequestBatteryOptimization();
                                                }}
                                                className="px-2.5 py-1.5 rounded-lg font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex-shrink-0 transition-colors"
                                            >
                                                {isEn ? 'Allow' : 'استثناء'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                                <h4 className="font-bold text-sm mb-2 opacity-90">{isEn ? 'Night Times' : 'أوقات الليل'}</h4>
                                {[
                                    { 
                                        id: 'firstThird', 
                                        label: isEn ? 'First Third of Night' : 'أول الليل', 
                                        desc: isEn ? 'Alert for the start of the first third of the night' : 'تنبيه بدخول وقت أول الليل' 
                                    },
                                    { 
                                        id: 'midnight', 
                                        label: isEn ? 'Midnight' : 'منتصف الليل', 
                                        desc: isEn ? 'Alert for Islamic midnight' : 'تنبيه بدخول منتصف الليل الشرعي' 
                                    },
                                    { 
                                        id: 'lastThird', 
                                        label: isEn ? 'Last Third of Night' : 'الثلث الأخير', 
                                        desc: isEn ? 'Alert for the last third of the night' : 'تنبيه بدخول الثلث الأخير من الليل' 
                                    }
                                ].map((item) => {
                                    const isEnabled = config.nightNotifications?.[item.id as keyof typeof config.nightNotifications] ?? true;
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => toggleNightNotification(item.id as 'firstThird' | 'midnight' | 'lastThird')}
                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                                isEnabled 
                                                ? 'themed-card-bg shadow-sm' 
                                                : 'bg-black/5 dark:bg-white/10 border-transparent opacity-70'
                                            }`}
                                            style={{ borderColor: isEnabled ? 'var(--qr-accent)' : undefined }}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-sm">{item.label}</span>
                                                <span className="text-[10px] opacity-80">{item.desc}</span>
                                            </div>
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: isEnabled ? 'var(--qr-accent)' : 'rgba(0,0,0,0.1)', color: isEnabled ? 'var(--qr-accent-text, #fff)' : 'transparent' }}>
                                                {isEnabled && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                                <h4 className="font-bold text-sm mb-2 opacity-90">{isEn ? 'Athkar & Tasbeeh' : 'الأذكار والتسبيح'}</h4>
                                {[
                                    { id: 'sabah', label: isEn ? 'Morning Athkar' : 'أذكار الصباح' },
                                    { id: 'masaa', label: isEn ? 'Evening Athkar' : 'أذكار المساء' },
                                    { id: 'dua', label: isEn ? 'Dua Time' : 'وقت الدعاء' },
                                    { id: 'tasbeehMorning', label: isEn ? 'Morning Tasbeeh' : 'التسبيح (صباحاً)' },
                                    { id: 'tasbeehEvening', label: isEn ? 'Evening Tasbeeh' : 'التسبيح (مساءً)' },
                                    { id: 'kahf', label: isEn ? 'Surah Al-Kahf' : 'سورة الكهف' }
                                ].map((item) => {
                                    const setting = phoneSettings[item.id as keyof Omit<PhoneNotificationSettings, 'randomAthkar'>];
                                    return (
                                        <div 
                                            key={item.id}
                                            className={`p-3 rounded-xl border-2 transition-all ${
                                                setting.enabled 
                                                ? 'themed-card-bg shadow-sm' 
                                                : 'bg-black/5 dark:bg-white/10 border-transparent opacity-70'
                                            }`}
                                            style={{ borderColor: setting.enabled ? 'var(--qr-accent)' : undefined }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div 
                                                    className="flex items-center gap-2 cursor-pointer"
                                                    onClick={() => togglePhoneSetting(item.id as keyof Omit<PhoneNotificationSettings, 'randomAthkar'>)}
                                                >
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: setting.enabled ? 'var(--qr-accent)' : 'rgba(0,0,0,0.1)', color: setting.enabled ? 'var(--qr-accent-text, #fff)' : 'transparent' }}>
                                                        {setting.enabled && <Check className="w-3 h-3" />}
                                                    </div>
                                                    <span className="font-bold text-sm">{item.label}</span>
                                                </div>
                                                
                                                {setting.enabled && (
                                                    <div className="flex items-center gap-2 text-xs opacity-90">
                                                        <Clock className="w-3 h-3" />
                                                        <input 
                                                            type="time" 
                                                            value={setting.time}
                                                            onChange={(e) => handleTimeChange(item.id as keyof Omit<PhoneNotificationSettings, 'randomAthkar'>, e.target.value)}
                                                            className="bg-transparent border-none outline-none font-bold dark:[color-scheme:dark]"
                                                            style={{ color: 'var(--qr-accent)' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] opacity-80">
                                                {item.id === 'kahf' 
                                                    ? (isEn ? 'Weekly notification on Friday' : 'تنبيه أسبوعي يوم الجمعة') 
                                                    : (isEn ? 'Daily notification at specified time' : 'تنبيه يومي في الوقت المحدد')}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-sm opacity-90 flex items-center gap-2">
                                        <Shuffle className="w-4 h-4" />
                                        {isEn ? 'Random Athkar' : 'أذكار عشوائية'}
                                    </h4>
                                    <div 
                                        onClick={toggleRandomAthkar}
                                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${phoneSettings.randomAthkar.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${
                                            phoneSettings.randomAthkar.enabled 
                                                ? (isRTL ? 'right-6' : 'left-6') 
                                                : (isRTL ? 'right-1' : 'left-1')
                                        }`} />
                                    </div>
                                </div>
                                <p className="text-[10px] opacity-80 -mt-2">
                                    {isEn ? 'Receive random reminders throughout the day to remember Allah' : 'تلقي أذكار وتنبيهات عشوائية خلال اليوم لتذكيرك بذكر الله'}
                                </p>

                                {phoneSettings.randomAthkar.enabled && (
                                    <div className="themed-card-bg p-3 rounded-xl border border-emerald-500/30 space-y-3 animate-fadeIn">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold">{isEn ? 'Daily Frequency:' : 'عدد المرات يومياً:'}</span>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleRandomSettingChange({ frequency: Math.max(1, phoneSettings.randomAthkar.frequency - 1) })}
                                                    className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold cursor-pointer"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-bold text-emerald-600">
                                                    {isEn ? phoneSettings.randomAthkar.frequency : toArabic(phoneSettings.randomAthkar.frequency)}
                                                </span>
                                                <button 
                                                    onClick={() => handleRandomSettingChange({ frequency: Math.min(20, phoneSettings.randomAthkar.frequency + 1) })}
                                                    className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] opacity-80">{isEn ? 'Start Time:' : 'وقت البدء:'}</span>
                                                <input 
                                                    type="time" 
                                                    value={phoneSettings.randomAthkar.startTime}
                                                    onChange={(e) => handleRandomSettingChange({ startTime: e.target.value })}
                                                    className="w-full text-xs bg-black/5 dark:bg-white/10 text-inherit border border-transparent p-2 rounded-lg font-bold dark:[color-scheme:dark]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] opacity-80">{isEn ? 'End Time:' : 'وقت الانتهاء:'}</span>
                                                <input 
                                                    type="time" 
                                                    value={phoneSettings.randomAthkar.endTime}
                                                    onChange={(e) => handleRandomSettingChange({ endTime: e.target.value })}
                                                    className="w-full text-xs bg-black/5 dark:bg-white/10 text-inherit border border-transparent p-2 rounded-lg font-bold dark:[color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-sm opacity-90 flex items-center gap-2">
                                        <VolumeX className="w-4 h-4" />
                                        {isEn ? 'Pause Prayer Audio Alerts' : 'إيقاف التنبيهات الصوتية للصلاة'}
                                    </h4>
                                    {isAudioMuted && (
                                        <button onClick={unmuteAudio} className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-md font-bold cursor-pointer">
                                            {isEn ? 'Unmute Audio' : 'تفعيل الصوت'}
                                        </button>
                                    )}
                                </div>
                                {isAudioMuted && config.audioMutedUntil && (
                                    <p className="text-xs text-red-500 mb-2">
                                        {isEn 
                                            ? `Audio alerts paused until: ${new Date(config.audioMutedUntil).toLocaleDateString('en-US')}` 
                                            : `التنبيهات الصوتية متوقفة حتى: ${new Date(config.audioMutedUntil).toLocaleDateString('ar-SA')}`}
                                    </p>
                                )}
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {[
                                        { labelAr: 'اليوم', labelEn: 'Today', days: 1 },
                                        { labelAr: 'غداً', labelEn: 'Tomorrow', days: 2 },
                                        { labelAr: 'يومان', labelEn: '2 Days', days: 2 },
                                        { labelAr: '3 أيام', labelEn: '3 Days', days: 3 },
                                        { labelAr: '4 أيام', labelEn: '4 Days', days: 4 },
                                        { labelAr: 'أسبوع', labelEn: '1 Week', days: 7 },
                                        { labelAr: 'أسبوعين', labelEn: '2 Weeks', days: 14 },
                                        { labelAr: 'شهر', labelEn: '1 Month', days: 30 }
                                    ].map((opt) => (
                                        <button
                                            key={opt.labelAr}
                                            onClick={() => muteAudioForDuration(opt.days)}
                                            className="py-2 px-1 text-xs font-bold rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            {isEn ? opt.labelEn : opt.labelAr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 themed-card-bg border-t border-black/10 dark:border-white/10">
                    <button 
                        onClick={() => {
                            setupNotifications();
                            onClose();
                        }}
                        className="theme-accent-btn w-full font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                    >
                        {isEn ? 'Save & Close' : 'حفظ وإغلاق'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
