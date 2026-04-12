import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { toArabic } from './constants';

interface NotificationSettingsModalProps {
    onClose: () => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
    modeSuffix: string;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ onClose, showToast, isLandscape, modeSuffix }) => {
    const [settings, setSettings] = useState(() => {
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

    const toggleSetting = (key: string) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
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

    return (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="theme-header-bg p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        <h3 className="font-bold text-lg">الإشعارات</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto">
                    <p className="text-xs opacity-70 text-center mb-2">
                        اختر أنواع التنبيهات التي تود ظهورها في التطبيق
                    </p>

                    <div className="space-y-2">
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
                                onClick={() => toggleSetting(item.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                    settings[item.id] 
                                    ? 'themed-card-bg border-emerald-500 shadow-sm' 
                                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                                }`}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-sm">{item.label}</span>
                                    <span className="text-[10px] opacity-60">{item.desc}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                    settings[item.id] ? 'bg-emerald-500 text-white' : 'bg-gray-300 dark:bg-gray-600'
                                }`}>
                                    {settings[item.id] && <Check className="w-3 h-3" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 themed-card-bg border-t border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={onClose}
                        className="theme-accent-btn w-full font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                        تم
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
