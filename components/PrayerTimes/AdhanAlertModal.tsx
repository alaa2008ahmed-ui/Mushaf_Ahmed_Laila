import React, { useEffect } from 'react';
import { VolumeX, Check, X } from 'lucide-react';
import { stopNotificationSound } from '../../utils/prayerTimesUtils';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { tPrayer, getPrayerDisplayName } from '../../utils/prayerTimesTranslations';
import { triggerAlertVibration } from '../../utils/vibrationHelper';

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
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();

    useEffect(() => {
        if (!alert) return;
        triggerAlertVibration('adhan');
    }, [alert?.prayerKey, alert?.timeStr]);

    if (!alert) return null;

    const isDark = Boolean(theme.isDark) || Boolean(isNightMode) || themeKey === 'black_gold' || theme.bgColor === '#000000';

    const accent = isDark
        ? {
            circleBg: 'radial-gradient(circle at 35% 30%, rgba(245, 158, 11, 0.25) 0%, #18181b 75%)',
            badgeCircleBg: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
            badgeCircleShadow: '0 3px 0 #92400e, 0 6px 12px rgba(217, 119, 6, 0.38), inset 0 1.5px 1px rgba(255,255,255,0.4)',
            pillBg: 'rgba(245, 158, 11, 0.16)',
            pillText: '#fbbf24',
            timeText: '#fbbf24',
            boxBg: 'rgba(245, 158, 11, 0.12)',
            boxText: '#fde68a',
            primaryBtnBg: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
            primaryBtnShadow: '0 4.5px 0 #78350f, 0 10px 20px -4px rgba(217, 119, 6, 0.4), inset 0 1.5px 1px rgba(255, 255, 255, 0.35)',
        }
        : homeThemeVariant === 'sky'
            ? {
                circleBg: 'radial-gradient(circle at 35% 30%, #f0f9ff 0%, #bae6fd 100%)',
                badgeCircleBg: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                badgeCircleShadow: '0 3px 0 #0369a1, 0 6px 12px rgba(2, 132, 199, 0.36), inset 0 1.5px 1px rgba(255,255,255,0.45)',
                pillBg: '#e0f2fe',
                pillText: '#0369a1',
                timeText: '#0284c7',
                boxBg: '#f0f9ff',
                boxText: '#0c4a6e',
                primaryBtnBg: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
                primaryBtnShadow: '0 4.5px 0 #0369a1, 0 10px 20px -4px rgba(2, 132, 199, 0.42), inset 0 1.5px 1px rgba(255, 255, 255, 0.4)',
            }
            : homeThemeVariant === 'emerald'
                ? {
                    circleBg: 'radial-gradient(circle at 35% 30%, #ecfdf5 0%, #d1fae5 100%)',
                    badgeCircleBg: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                    badgeCircleShadow: '0 3px 0 #047857, 0 6px 12px rgba(5, 150, 105, 0.38), inset 0 1.5px 1px rgba(255,255,255,0.45)',
                    pillBg: '#d1fae5',
                    pillText: '#047857',
                    timeText: '#059669',
                    boxBg: '#ecfdf5',
                    boxText: '#064e3b',
                    primaryBtnBg: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                    primaryBtnShadow: '0 4.5px 0 #047857, 0 10px 20px -4px rgba(5, 150, 105, 0.42), inset 0 1.5px 1px rgba(255, 255, 255, 0.4)',
                }
                : homeThemeVariant === 'burgundy'
                    ? {
                        circleBg: 'radial-gradient(circle at 35% 30%, #fff1f2 0%, #fecdd3 100%)',
                        badgeCircleBg: 'linear-gradient(180deg, #fb7185 0%, #e11d48 100%)',
                        badgeCircleShadow: '0 3px 0 #9f1239, 0 6px 12px rgba(225, 29, 72, 0.36), inset 0 1.5px 1px rgba(255,255,255,0.45)',
                        pillBg: '#ffe4e6',
                        pillText: '#9f1239',
                        timeText: '#be123c',
                        boxBg: '#fff1f2',
                        boxText: '#881337',
                        primaryBtnBg: 'linear-gradient(180deg, #e11d48 0%, #9f1239 100%)',
                        primaryBtnShadow: '0 4.5px 0 #881337, 0 10px 20px -4px rgba(159, 18, 57, 0.42), inset 0 1.5px 1px rgba(255, 255, 255, 0.38)',
                    }
                    : {
                        circleBg: 'radial-gradient(circle at 35% 30%, #fffbeb 0%, #fde68a 100%)',
                        badgeCircleBg: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
                        badgeCircleShadow: '0 3px 0 #b45309, 0 6px 12px rgba(217, 119, 6, 0.38), inset 0 1.5px 1px rgba(255,255,255,0.5)',
                        pillBg: '#fef3c7',
                        pillText: '#92400e',
                        timeText: '#b45309',
                        boxBg: '#fffbeb',
                        boxText: '#78350f',
                        primaryBtnBg: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
                        primaryBtnShadow: '0 4.5px 0 #92400e, 0 10px 20px -4px rgba(180, 83, 9, 0.42), inset 0 1.5px 1px rgba(255, 255, 255, 0.4)',
                    };

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
            className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
            onClick={handleClose}
            dir={dir}
        >
            <div 
                className={`settings-3d-adia-scope ${isDark ? 'settings-3d-dark' : ''} w-full max-w-sm rounded-3xl overflow-hidden p-6 relative flex flex-col items-center text-center`}
                style={{
                    background: isDark
                        ? 'linear-gradient(180deg, #1b1b22 0%, #101015 100%)'
                        : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                    color: isDark ? '#ffffff' : '#0f172a',
                    border: 'none',
                    boxShadow: isDark
                        ? '0 8px 0 #09090b, 0 24px 50px rgba(0, 0, 0, 0.88), inset 0 2px 2px rgba(255, 255, 255, 0.16)'
                        : '0 8px 0 rgba(0, 0, 0, 0.14), 0 24px 48px rgba(0, 0, 0, 0.28), inset 0 2px 2px rgba(255, 255, 255, 0.96)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close X button */}
                <button 
                    type="button"
                    onClick={handleClose}
                    className={`unified-3d-btn absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:text-red-500`}
                    style={{
                        background: isDark
                            ? 'linear-gradient(180deg, #32323e 0%, #24242e 100%)'
                            : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
                        color: isDark ? '#e4e4e7' : '#475569',
                        boxShadow: isDark
                            ? '0 3px 0 #09090b, 0 5px 10px rgba(0,0,0,0.45), inset 0 1.5px 1px rgba(255,255,255,0.16)'
                            : '0 3px 0 rgba(0,0,0,0.12), 0 5px 10px rgba(0,0,0,0.08), inset 0 1.5px 1px rgba(255,255,255,0.95)'
                    }}
                    title={tPrayer('close', language)}
                    aria-label={tPrayer('close', language)}
                >
                    <X size={16} strokeWidth={2.5} />
                </button>

                {/* Animated Mosque & Pulse Icon */}
                <div className="relative mb-4 mt-1">
                    <div 
                        className="app-inner-3d-box w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-pulse"
                        style={{ background: accent.circleBg }}
                    >
                        🕌
                    </div>
                    <span 
                        className={`app-3d-badge absolute -bottom-1 ${isRTL ? '-right-1' : '-left-1'} w-7.5 h-7.5 rounded-full text-white flex items-center justify-center text-xs animate-bounce`}
                        style={{
                            background: accent.badgeCircleBg,
                            boxShadow: accent.badgeCircleShadow
                        }}
                    >
                        <i className="fa-solid fa-volume-high"></i>
                    </span>
                </div>

                {/* Badge */}
                <span
                    className="app-3d-badge text-xs font-black px-3.5 py-1 rounded-full mb-2"
                    style={{ backgroundColor: accent.pillBg, color: accent.pillText }}
                >
                    {tPrayer('adhanModalBadge', language)}
                </span>

                {/* Title */}
                <h3 className={`text-lg font-black mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {tPrayer('adhanModalTitle', language, { p: localizedPrayerName })}
                </h3>

                {/* Time info */}
                <div className={`text-xs font-bold mb-3 en-digits ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {tPrayer('timeInfo', language)} <span className="font-black" style={{ color: accent.timeText }}>{alert.timeStr}</span>
                </div>

                {/* Prophetic Reminder */}
                <div
                    className="app-inner-3d-box border-0 rounded-2xl p-3.5 mb-5 w-full"
                    style={{ backgroundColor: accent.boxBg }}
                >
                    <p className="text-xs font-bold leading-relaxed" style={{ color: accent.boxText }}>
                        {tPrayer('adhanPropheticReminder', language)}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex items-center gap-2.5 overflow-visible">
                    <button
                        type="button"
                        onClick={handleStopSound}
                        className="unified-3d-btn flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border-0"
                        style={{
                            background: isDark
                                ? 'linear-gradient(180deg, #32323e 0%, #24242e 100%)'
                                : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
                            color: isDark ? '#e4e4e7' : '#334155',
                            boxShadow: isDark
                                ? '0 4px 0 #09090b, 0 8px 16px rgba(0,0,0,0.45), inset 0 1.5px 1px rgba(255,255,255,0.16)'
                                : '0 4px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.08), inset 0 1.5px 1px rgba(255,255,255,0.95)'
                        }}
                        title={tPrayer('stopSound', language)}
                    >
                        <VolumeX size={15} />
                        <span>{tPrayer('stopSound', language)}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="unified-3d-btn flex-[1.5] py-2.5 px-3 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer border-0"
                        style={{
                            background: accent.primaryBtnBg,
                            boxShadow: accent.primaryBtnShadow
                        }}
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
