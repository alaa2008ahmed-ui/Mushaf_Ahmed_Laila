import React from 'react';
import { VolumeX, Check, X } from 'lucide-react';
import { stopNotificationSound } from '../../utils/prayerTimesUtils';
import { useLanguage } from '../../context/LanguageContext';
import { tPrayer, getPrayerDisplayName } from '../../utils/prayerTimesTranslations';

interface AdhanAlertModalProps {
    alert: {
        prayerKey: string;
        prayerName: string;
        timeStr: string;
        soundFileName?: string;
    } | null;
    onDismiss: () => void;
}

export const AdhanAlertModal: React.FC<AdhanAlertModalProps> = ({ alert, onDismiss }) => {
    const { language, isRTL, dir } = useLanguage();

    if (!alert) return null;

    const handleStopSound = () => {
        stopNotificationSound();
    };

    const handleClose = () => {
        stopNotificationSound();
        onDismiss();
    };

    const localizedPrayerName = getPrayerDisplayName(alert.prayerKey, language);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fadeIn"
            onClick={handleClose}
            dir={dir}
        >
            <div 
                className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-900 border-2 border-emerald-500 shadow-2xl overflow-hidden p-6 relative flex flex-col items-center text-center animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close X button */}
                <button 
                    onClick={handleClose}
                    className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors cursor-pointer`}
                    title={tPrayer('close', language)}
                    aria-label={tPrayer('close', language)}
                >
                    <X size={18} />
                </button>

                {/* Animated Mosque & Pulse Icon */}
                <div className="relative mb-4 mt-1">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-4xl shadow-inner animate-pulse">
                        🕌
                    </div>
                    <span className={`absolute -bottom-1 ${isRTL ? '-right-1' : '-left-1'} w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md animate-bounce`}>
                        <i className="fa-solid fa-volume-high"></i>
                    </span>
                </div>

                {/* Badge */}
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 mb-2">
                    {tPrayer('adhanModalBadge', language)}
                </span>

                {/* Title */}
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                    {tPrayer('adhanModalTitle', language, { p: localizedPrayerName })}
                </h3>

                {/* Time info */}
                <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-3 en-digits">
                    {tPrayer('timeInfo', language)} <span className="text-emerald-600 dark:text-emerald-400 font-black">{alert.timeStr}</span>
                </div>

                {/* Prophetic Reminder */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3 mb-5 w-full">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        {tPrayer('adhanPropheticReminder', language)}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleStopSound}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title={tPrayer('stopSound', language)}
                    >
                        <VolumeX size={15} />
                        <span>{tPrayer('stopSound', language)}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-[1.5] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                    >
                        <Check size={16} />
                        <span>{tPrayer('doneClose', language)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdhanAlertModal;
