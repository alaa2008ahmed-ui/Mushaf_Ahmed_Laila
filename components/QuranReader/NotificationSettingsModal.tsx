import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Smartphone, AppWindow, VolumeX, Clock, Shuffle } from 'lucide-react';
import { toArabic } from './constants';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { setupNotifications } from '../../utils/notifications';
import { useNotificationSettings, PhoneNotificationSettings } from '../../hooks/useNotificationSettings';

interface NotificationSettingsModalProps {
    onClose: () => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
    modeSuffix: string;
    initialTab?: 'app' | 'phone';
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ onClose, showToast, isLandscape, modeSuffix, initialTab }) => {
    const { config, updateConfig } = usePrayerTimes();
    const { phoneSettings, updateSpecificSetting, updateRandomSettings } = useNotificationSettings();
    const [activeTab, setActiveTab] = useState<'app' | 'phone'>(initialTab || 'app');

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

    const toggleAppSetting = (key: string) => {
        const newSettings = { ...appSettings, [key]: !appSettings[key] };
        setAppSettings(newSettings);
        localStorage.setItem('notification_settings' + modeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('notification-settings-change'));
        
        const labels: Record<string, string> = {
            quarter: 'تنبيهات الأحزاب والأرباع',
            sajda: 'تنبيهات السجدات',
            themes: 'تنبيهات تغيير الثيمات',
            downloads: 'تنبيهات التحميل',
            bookmarks: 'تنبيهات الإشارات المرجعية',
            juz: 'تنبيهات بداية الأجزاء',
            general: 'التنبيهات العامة'
        };
        
        showToast(`${newSettings[key] ? 'تم تفعيل' : 'تم تعطيل'} ${labels[key]}`);
    };

    const togglePhoneSetting = (key: keyof Omit<PhoneNotificationSettings, 'randomAthkar'>) => {
        const isEnabled = !phoneSettings[key].enabled;
        const newSettings = {
            ...phoneSettings,
            [key]: { ...phoneSettings[key], enabled: isEnabled }
        };
        updateSpecificSetting(key, { enabled: isEnabled });
        
        setTimeout(() => {
            setupNotifications(newSettings);
        }, 100);

        const labels: Record<string, string> = {
            sabah: 'أذكار الصباح',
            masaa: 'أذكار المساء',
            dua: 'وقت الدعاء',
            tasbeehMorning: 'التسبيح (صباحاً)',
            tasbeehEvening: 'التسبيح (مساءً)',
            kahf: 'سورة الكهف',
        };
        
        showToast(`${isEnabled ? 'تم تفعيل' : 'تم تعطيل'} ${labels[key]}`);
    };

    const handleTimeChange = (key: keyof Omit<PhoneNotificationSettings, 'randomAthkar'>, time: string) => {
        const newSettings = {
            ...phoneSettings,
            [key]: { ...phoneSettings[key], time }
        };
        updateSpecificSetting(key, { time });
        setTimeout(() => {
            setupNotifications(newSettings);
        }, 100);
    };

    const handleRandomSettingChange = (value: Partial<PhoneNotificationSettings['randomAthkar']>) => {
        const newSettings = {
            ...phoneSettings,
            randomAthkar: { ...phoneSettings.randomAthkar, ...value }
        };
        updateRandomSettings(value);
        setTimeout(() => {
            setupNotifications(newSettings);
        }, 100);
    };

    const toggleRandomAthkar = () => {
        const isEnabled = !phoneSettings.randomAthkar.enabled;
        handleRandomSettingChange({ enabled: isEnabled });
        showToast(`${isEnabled ? 'تم تفعيل' : 'تم تعطيل'} الأذكار العشوائية`);
    };

    const toggleNightNotification = (key: 'firstThird' | 'midnight' | 'lastThird') => {
        const currentNightNotifs = config.nightNotifications || { firstThird: true, midnight: true, lastThird: true };
        const newNightNotifs = { ...currentNightNotifs, [key]: !currentNightNotifs[key] };
        updateConfig({ nightNotifications: newNightNotifs });
        
        const labels: Record<string, string> = {
            firstThird: 'أول الليل',
            midnight: 'منتصف الليل',
            lastThird: 'الثلث الأخير'
        };
        
        showToast(`${newNightNotifs[key] ? 'تم تفعيل' : 'تم تعطيل'} إشعار ${labels[key]}`);
    };

    const muteAudioForDuration = (durationDays: number) => {
        const muteUntil = Date.now() + durationDays * 24 * 60 * 60 * 1000;
        updateConfig({ audioMutedUntil: muteUntil });
        showToast(`تم تعطيل التنبيهات الصوتية للصلاة لمدة ${durationDays} يوم`);
    };

    const unmuteAudio = () => {
        updateConfig({ audioMutedUntil: undefined });
        showToast('تم تفعيل التنبيهات الصوتية للصلاة');
    };

    const isAudioMuted = config.audioMutedUntil && Date.now() < config.audioMutedUntil;

    return (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>

                <div className="flex border-b border-black/10 dark:border-white/10">
                    <button 
                        className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                        style={{ 
                            color: activeTab === 'app' ? 'var(--qr-accent)' : 'inherit', 
                            borderBottom: activeTab === 'app' ? '2px solid var(--qr-accent)' : 'none',
                            opacity: activeTab === 'app' ? 1 : 0.6
                        }}
                        onClick={() => setActiveTab('app')}
                    >
                        <AppWindow className="w-4 h-4" />
                        إشعارات التطبيق
                    </button>
                    <button 
                        className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                        style={{ 
                            color: activeTab === 'phone' ? 'var(--qr-accent)' : 'inherit', 
                            borderBottom: activeTab === 'phone' ? '2px solid var(--qr-accent)' : 'none',
                            opacity: activeTab === 'phone' ? 1 : 0.6
                        }}
                        onClick={() => setActiveTab('phone')}
                    >
                        <Smartphone className="w-4 h-4" />
                        إشعارات الهاتف
                    </button>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'app' ? (
                        <div className="space-y-2 animate-fadeIn">
                            <p className="text-[11px] opacity-80 text-center mb-4">
                                إشعارات تظهر داخل التطبيق أثناء الاستخدام
                            </p>
                            {[
                                { id: 'quarter', label: 'الأحزاب والأرباع', desc: 'تنبيه عند الوصول لبداية حزب أو ربع جديد' },
                                { id: 'juz', label: 'بداية الأجزاء', desc: 'تنبيه عند الانتقال لجزء جديد' },
                                { id: 'sajda', label: 'مواضع السجدات', desc: 'تنبيه عند الوصول لآية بها سجدة تلاوة' },
                                { id: 'themes', label: 'تغيير الثيمات', desc: 'تنبيه عند تطبيق لون أو ثيم جديد' },
                                { id: 'downloads', label: 'التحميلات', desc: 'تنبيهات حالة تحميل السور أو التفاسير' },
                                { id: 'bookmarks', label: 'الإشارات المرجعية', desc: 'تنبيه عند حفظ أو حذف إشارة مرجعية' },
                                { id: 'general', label: 'تنبيهات عامة', desc: 'تنبيهات الحفظ، الاختبارات، والعمليات الأخرى' }
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
                                إشعارات تظهر على شاشة الهاتف حتى لو كان التطبيق مغلقاً
                            </p>

                            <div className="space-y-2">
                                <h4 className="font-bold text-sm mb-2 opacity-90">أوقات الليل</h4>
                                {[
                                    { id: 'firstThird', label: 'أول الليل', desc: 'تنبيه بدخول وقت أول الليل' },
                                    { id: 'midnight', label: 'منتصف الليل', desc: 'تنبيه بدخول منتصف الليل الشرعي' },
                                    { id: 'lastThird', label: 'الثلث الأخير', desc: 'تنبيه بدخول الثلث الأخير من الليل' }
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

                            <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10 text-right" dir="rtl">
                                <h4 className="font-bold text-sm mb-2 opacity-90">الأذكار والتسبيح</h4>
                                {[
                                    { id: 'sabah', label: 'أذكار الصباح' },
                                    { id: 'masaa', label: 'أذكار المساء' },
                                    { id: 'dua', label: 'وقت الدعاء' },
                                    { id: 'tasbeehMorning', label: 'التسبيح (صباحاً)' },
                                    { id: 'tasbeehEvening', label: 'التسبيح (مساءً)' },
                                    { id: 'kahf', label: 'سورة الكهف' }
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
                                                {item.id === 'kahf' ? 'تنبيه أسبوعي يوم الجمعة' : 'تنبيه يومي في الوقت المحدد'}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10 text-right" dir="rtl">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-sm opacity-90 flex items-center gap-2">
                                        <Shuffle className="w-4 h-4" />
                                        أذكار عشوائية
                                    </h4>
                                    <div 
                                        onClick={toggleRandomAthkar}
                                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${phoneSettings.randomAthkar.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${phoneSettings.randomAthkar.enabled ? 'right-6' : 'right-1'}`} />
                                    </div>
                                </div>
                                <p className="text-[10px] opacity-80 -mt-2">
                                    تلقي أذكار وتنبيهات عشوائية خلال اليوم لتذكيرك بذكر الله
                                </p>

                                {phoneSettings.randomAthkar.enabled && (
                                    <div className="themed-card-bg p-3 rounded-xl border border-emerald-500/30 space-y-3 animate-fadeIn">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold">عدد المرات يومياً:</span>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleRandomSettingChange({ frequency: Math.max(1, phoneSettings.randomAthkar.frequency - 1) })}
                                                    className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-bold text-emerald-600">{toArabic(phoneSettings.randomAthkar.frequency)}</span>
                                                <button 
                                                    onClick={() => handleRandomSettingChange({ frequency: Math.min(20, phoneSettings.randomAthkar.frequency + 1) })}
                                                    className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] opacity-80">وقت البدء:</span>
                                                <input 
                                                    type="time" 
                                                    value={phoneSettings.randomAthkar.startTime}
                                                    onChange={(e) => handleRandomSettingChange({ startTime: e.target.value })}
                                                    className="w-full text-xs bg-black/5 dark:bg-white/10 text-inherit border border-transparent p-2 rounded-lg font-bold dark:[color-scheme:dark]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] opacity-80">وقت الانتهاء:</span>
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

                            <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10 text-right" dir="rtl">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-sm opacity-90 flex items-center gap-2">
                                        <VolumeX className="w-4 h-4" />
                                        إيقاف التنبيهات الصوتية للصلاة
                                    </h4>
                                    {isAudioMuted && (
                                        <button onClick={unmuteAudio} className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-md font-bold">
                                            تفعيل الصوت
                                        </button>
                                    )}
                                </div>
                                {isAudioMuted && config.audioMutedUntil && (
                                    <p className="text-xs text-red-500 mb-2">
                                        التنبيهات الصوتية متوقفة حتى: {new Date(config.audioMutedUntil).toLocaleDateString('ar-SA')}
                                    </p>
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'اليوم', days: 1 },
                                        { label: 'غداً', days: 2 },
                                        { label: 'يومين', days: 2 },
                                        { label: '3 أيام', days: 3 },
                                        { label: '4 أيام', days: 4 },
                                        { label: 'أسبوع', days: 7 },
                                        { label: 'أسبوعين', days: 14 },
                                        { label: 'شهر', days: 30 }
                                    ].map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => muteAudioForDuration(opt.days)}
                                            className="py-2 px-1 text-xs font-bold rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            {opt.label}
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
                        className="theme-accent-btn w-full font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                        حفظ وإغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
