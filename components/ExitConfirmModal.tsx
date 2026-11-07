import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ExitConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLandscape?: boolean;
}

const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({ isOpen, onClose, onConfirm, isLandscape }) => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    if (!isOpen) {
        return null;
    }

    const isModernActive = typeof document !== 'undefined' && (
      document.documentElement.classList.contains('modern-home-active') ||
      document.body.classList.contains('modern-home-active')
    );

    const isBlackTheme = theme.name === 'اسود' || theme.bgColor === '#000000' || theme.name === 'black' || themeKey === 'deep_black';
    const isNight = isNightMode || isBlackTheme || themeKey === 'black_gold';

    const isSky = !isNight && (homeThemeVariant === 'sky' || themeKey === 'sky_mode');
    const isEmerald = !isNight && (homeThemeVariant === 'emerald' || themeKey === 'emerald_mode');
    const isBurgundy = !isNight && (homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode');
    const isGold = !isNight && (homeThemeVariant === 'gold' || themeKey === 'shiny_gold' || (isModernActive && !isSky && !isEmerald && !isBurgundy));

    // Dynamic color resolution based on active theme
    const colors = (() => {
        if (isNight) {
            return {
                cardBg: '#16161e',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                iconBg: 'rgba(245, 158, 11, 0.15)',
                iconColor: '#fbbf24',
                titleColor: '#ffffff',
                descColor: '#cbd5e1',
                confirmBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                confirmText: '#000000',
                confirmBorder: '#fbbf24',
                confirmShadow: '0 6px 18px rgba(245, 158, 11, 0.35)',
                cancelBg: '#23232d',
                cancelText: '#e2e8f0',
                cancelBorder: '#3f3f4e'
            };
        }
        if (isSky) {
            return {
                cardBg: '#ffffff',
                borderColor: '#7dd3fc',
                iconBg: '#e0f2fe',
                iconColor: '#0284c7',
                titleColor: '#0369a1',
                descColor: '#334155',
                confirmBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                confirmText: '#ffffff',
                confirmBorder: '#0284c7',
                confirmShadow: '0 6px 18px rgba(2, 132, 199, 0.35)',
                cancelBg: '#f0f9ff',
                cancelText: '#0369a1',
                cancelBorder: '#bae6fd'
            };
        }
        if (isEmerald) {
            return {
                cardBg: '#ffffff',
                borderColor: '#6ee7b7',
                iconBg: '#dcfce7',
                iconColor: '#047857',
                titleColor: '#047857',
                descColor: '#334155',
                confirmBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                confirmText: '#ffffff',
                confirmBorder: '#047857',
                confirmShadow: '0 6px 18px rgba(4, 120, 87, 0.35)',
                cancelBg: '#f0fdf4',
                cancelText: '#047857',
                cancelBorder: '#a7f3d0'
            };
        }
        if (isBurgundy) {
            return {
                cardBg: '#ffffff',
                borderColor: '#fda4af',
                iconBg: '#ffe4e6',
                iconColor: '#881337',
                titleColor: '#881337',
                descColor: '#334155',
                confirmBg: 'linear-gradient(135deg, #9f1239 0%, #881337 100%)',
                confirmText: '#ffffff',
                confirmBorder: '#881337',
                confirmShadow: '0 6px 18px rgba(159, 18, 57, 0.35)',
                cancelBg: '#fff1f2',
                cancelText: '#881337',
                cancelBorder: '#fecdd3'
            };
        }
        if (isGold) {
            return {
                cardBg: '#ffffff',
                borderColor: '#fde047',
                iconBg: '#fef9c3',
                iconColor: '#b45309',
                titleColor: '#78350f',
                descColor: '#451a03',
                confirmBg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                confirmText: '#ffffff',
                confirmBorder: '#b45309',
                confirmShadow: '0 6px 18px rgba(217, 119, 6, 0.35)',
                cancelBg: '#fefce8',
                cancelText: '#78350f',
                cancelBorder: '#fde68a'
            };
        }

        // Custom theme fallback
        const primaryAccent = theme.palette?.[0] || theme.accent || '#1B7A53';
        const isDarkTheme = theme.isDark;
        return {
            cardBg: theme.cardBg || (isDarkTheme ? '#1e293b' : '#ffffff'),
            borderColor: theme.cardBorder || primaryAccent,
            iconBg: `${primaryAccent}20`,
            iconColor: primaryAccent,
            titleColor: theme.textColor || (isDarkTheme ? '#ffffff' : '#0f172a'),
            descColor: isDarkTheme ? '#94a3b8' : '#475569',
            confirmBg: primaryAccent,
            confirmText: theme.accentText || '#ffffff',
            confirmBorder: primaryAccent,
            confirmShadow: `0 4px 14px ${primaryAccent}50`,
            cancelBg: isDarkTheme ? '#27272a' : '#f1f5f9',
            cancelText: theme.textColor || '#334155',
            cancelBorder: theme.cardBorder || '#cbd5e1'
        };
    })();

    return (
        <div 
            className={`fixed inset-0 bg-black/65 backdrop-blur-sm z-[99999] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} fade-in select-none`} 
            onClick={onClose} 
            dir={isEn ? 'ltr' : 'rtl'}
        >
            <div 
                className={`rounded-3xl p-6 ${isLandscape ? 'max-w-md h-auto' : 'max-w-sm w-full'} shadow-2xl border-2 flex flex-col justify-center transition-all animate-in zoom-in-95`} 
                style={{ 
                    backgroundColor: colors.cardBg, 
                    borderColor: colors.borderColor,
                    boxShadow: isNight 
                      ? '0 20px 35px -5px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.15)' 
                      : '0 20px 30px -5px rgba(0, 0, 0, 0.15), 0 8px 12px -6px rgba(0, 0, 0, 0.1)'
                }} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full text-center">
                    <h3 
                        className="text-lg sm:text-xl font-black mb-2" 
                        style={{ 
                            color: colors.titleColor,
                            fontFamily: "'Cairo', sans-serif"
                        }}
                    >
                        {isEn ? "Confirm Exit" : "تأكيد الخروج"}
                    </h3>
                    <p 
                        className="text-center mb-6 font-bold text-sm leading-relaxed" 
                        style={{ 
                            color: colors.descColor, 
                            fontFamily: "'Cairo', sans-serif"
                        }}
                    >
                        {isEn ? "Are you sure you want to exit Mushaf Ahmed & Laila?" : "هل تريد الخروج من مصحف أحمد و ليلى؟"}
                    </p>
                    <div className="flex justify-center gap-3">
                        <button 
                            type="button"
                            onClick={onConfirm} 
                            className="flex-1 py-3 px-5 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer border"
                            style={{
                                background: colors.confirmBg,
                                color: colors.confirmText,
                                borderColor: colors.confirmBorder,
                                fontFamily: "'Cairo', sans-serif",
                                boxShadow: colors.confirmShadow
                            }}
                        >
                            {isEn ? "Yes" : "نعم"}
                        </button>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="flex-1 py-3 px-5 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer border"
                            style={{
                                backgroundColor: colors.cancelBg,
                                color: colors.cancelText,
                                borderColor: colors.cancelBorder,
                                fontFamily: "'Cairo', sans-serif"
                            }}
                        >
                            {isEn ? "No" : "لا"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExitConfirmModal;
