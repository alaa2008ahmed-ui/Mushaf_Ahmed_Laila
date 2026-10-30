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
    const { theme } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    if (!isOpen) {
        return null;
    }

    const isModernActive = typeof document !== 'undefined' && (
      document.documentElement.classList.contains('modern-home-active') ||
      document.body.classList.contains('modern-home-active')
    );

    const isBlackTheme = theme.name === 'اسود' || theme.bgColor === '#000000' || theme.name === 'black';
    const isDark = !isModernActive && (isBlackTheme || theme.isDark);

    const isGlass = !isModernActive && theme.isGlass;
    const isGolden = !isModernActive && (theme.name.includes('ذهب') || theme.name.includes('Golden'));
    const isEmerald = !isModernActive && (theme.name.includes('زمرد') || theme.name.includes('Emerald'));

    const modalBg = isModernActive
        ? '#FFFFFF'
        : (isGlass 
            ? (isGolden ? '#451a03' : isEmerald ? '#064E3B' : '#1e293b')
            : (theme.bgColor || (theme.isOriginal ? '#ffffff' : '#1e293b')));
    
    const modalTextColor = isModernActive
        ? '#0F172A'
        : (isGlass ? '#FFFFFF' : theme.textColor);

    const confirmBg = isModernActive
        ? '#D97706'
        : (isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || '#1B7A53'));

    const confirmTextColor = isModernActive
        ? '#FFFFFF'
        : (isBlackTheme ? '#000000' : '#FFFFFF');

    return (
        <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} fade-in select-none`} 
            onClick={onClose} 
            dir={isEn ? 'ltr' : 'rtl'}
        >
            <div 
                className={`rounded-2xl p-6 ${isLandscape ? 'max-w-md h-auto' : 'max-w-sm w-full'} shadow-2xl border flex flex-col justify-center transition-all`} 
                style={{ 
                    backgroundColor: modalBg, 
                    borderColor: isModernActive ? '#E2E8F0' : (theme.cardBorder || theme.palette?.[0] || '#E2E8F0'),
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)'
                }} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full">
                    <h3 
                        className="text-lg font-black text-center mb-2" 
                        style={{ 
                            color: modalTextColor,
                            fontFamily: "'Cairo', sans-serif"
                        }}
                    >
                        {isEn ? "Confirm Exit" : "تأكيد الخروج"}
                    </h3>
                    <p 
                        className="text-center mb-6 font-bold text-sm leading-relaxed" 
                        style={{ 
                            color: isModernActive ? '#475569' : modalTextColor, 
                            opacity: isModernActive ? 1 : 0.9,
                            fontFamily: "'Cairo', sans-serif"
                        }}
                    >
                        {isEn ? "Are you sure you want to exit Mushaf Ahmed & Laila?" : "هل تريد الخروج من مصحف أحمد و ليلى؟"}
                    </p>
                    <div className="flex justify-center gap-3">
                        <button 
                            type="button"
                            onClick={onConfirm} 
                            className="flex-1 py-2.5 px-5 rounded-xl font-black text-sm transition active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
                            style={{
                                backgroundColor: confirmBg,
                                color: confirmTextColor,
                                fontFamily: "'Cairo', sans-serif",
                                boxShadow: isModernActive ? '0 4px 12px rgba(6, 92, 31, 0.35)' : `0 4px 10px -2px ${theme.palette?.[0] || '#1B7A53'}50`
                            }}
                        >
                            {isEn ? "Yes" : "نعم"}
                        </button>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="flex-1 py-2.5 px-5 rounded-xl font-bold text-sm transition active:scale-95 flex items-center justify-center cursor-pointer"
                            style={{
                                backgroundColor: isModernActive ? '#F1F5F9' : (isGlass ? 'rgba(255, 255, 255, 0.15)' : (theme.isOriginal ? '#f3f4f6' : 'rgba(255, 255, 255, 0.1)')),
                                color: isModernActive ? '#334155' : modalTextColor,
                                border: `1px solid ${isModernActive ? '#CBD5E1' : (isGlass ? 'rgba(255, 255, 255, 0.3)' : (theme.palette?.[1] || '#d1d5db'))}`,
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
