import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';

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

    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const fontFamily = isEn ? 'sans-serif' : "'Cairo', sans-serif";

    return (
        <div
            className={`fixed inset-0 bg-black/65 z-[99999] flex items-center justify-center ${isLandscape ? 'p-3' : 'p-4'} select-none settings-3d-adia-scope ${s3d.isDark ? 'settings-3d-dark' : ''}`}
            onClick={onClose}
            dir={isEn ? 'ltr' : 'rtl'}
        >
            <div
                className={`app-page-card border-0 rounded-[28px] p-6 sm:p-7 ${isLandscape ? 'max-w-md w-full' : 'max-w-sm w-full'} flex flex-col justify-center overflow-visible ${s3d.surfaceCardClass}`}
                style={{ fontFamily }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full text-center overflow-visible">

                    <h3
                        className={`text-lg sm:text-xl font-black mb-2 ${isEn ? 'font-sans' : 'font-cairo'}`}
                        style={{ color: s3d.textColor }}
                    >
                        {isEn ? 'Confirm Exit' : 'تأكيد الخروج'}
                    </h3>

                    <p
                        className="text-center font-bold text-sm leading-relaxed"
                        style={{ color: s3d.subtextColor }}
                    >
                        {isEn
                            ? 'Are you sure you want to exit Mushaf Ahmed & Laila?'
                            : 'هل تريد الخروج من مصحف أحمد و ليلى؟'}
                    </p>

                    <div className="app-3d-divider-top mt-5 pt-4 flex justify-center gap-3 overflow-visible">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="app-page-card quran-raised-btn-selected border-0 flex-1 py-3.5 px-5 rounded-2xl font-black text-sm flex items-center justify-center cursor-pointer transition-all"
                            style={{
                                backgroundColor: s3d.primaryColor,
                                color: s3d.btnTextColor,
                            }}
                        >
                            {isEn ? 'Yes' : 'نعم'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`app-page-card border-0 flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center cursor-pointer transition-all ${s3d.innerCardClass}`}
                            style={{ color: s3d.textColor }}
                        >
                            {isEn ? 'No' : 'لا'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExitConfirmModal;

