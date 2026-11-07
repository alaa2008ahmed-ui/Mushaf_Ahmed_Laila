import React from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';
import { tTasbeeh } from '../../utils/tasbeehTranslations';
import { Check } from 'lucide-react';

interface TasbeehHeaderProps {
    title?: string;
    subtitle?: string;
    onBack?: () => void;
    onHome?: () => void;
    onOpenGuide?: () => void;
    showQuickTasbeehOnHome?: boolean;
    onToggleQuickTasbeehOnHome?: () => void;
}

const TasbeehHeader: React.FC<TasbeehHeaderProps> = ({ 
    onBack, 
    onHome, 
    onOpenGuide,
    showQuickTasbeehOnHome = false,
    onToggleQuickTasbeehOnHome
}) => {
    const { language, isRTL } = useLanguage();
    const localizedTitle = tTasbeeh('title', language);
    const isEn = language === 'en';

    return (
        <header className="app-top-bar shrink-0">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center w-full min-h-[44px]">
                    {/* Back button & Quick Tasbeeh on Home toggle */}
                    <div className="absolute right-0 flex items-center gap-1.5 rtl:right-0 rtl:left-auto ltr:right-auto ltr:left-0 z-10 px-1">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tTasbeeh('back', language)}
                                aria-label={tTasbeeh('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-xl`}></i>
                            </button>
                        )}

                        {onToggleQuickTasbeehOnHome && (
                            <button
                                type="button"
                                onClick={onToggleQuickTasbeehOnHome}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer shrink-0"
                                title={
                                    isEn 
                                        ? (showQuickTasbeehOnHome ? 'Quick Tasbeeh on Home: Enabled (Click to disable)' : 'Quick Tasbeeh on Home: Disabled (Click to enable)') 
                                        : (showQuickTasbeehOnHome ? 'ظهور التسبيح السريع في الرئيسية: مفعّل (اضغط للتعطيل)' : 'ظهور التسبيح السريع في الرئيسية: معطّل (اضغط للتفعيل)')
                                }
                            >
                                <div className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full border-[1.5px] border-white/90 shadow-xs transition-all flex items-center justify-center ${
                                    showQuickTasbeehOnHome ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                    {showQuickTasbeehOnHome ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" /> : <span className="w-1.5 h-0.5 bg-white rounded-full" />}
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Page title in center */}
                    <div className="text-center px-24 sm:px-28 min-w-0 max-w-full">
                        <h1 className="app-top-bar__title text-base sm:text-xl font-bold font-kufi truncate">
                            {localizedTitle}
                        </h1>
                    </div>

                    {/* Guide, Home icon & Theme Lock on left/right */}
                    <div className="absolute left-0 flex items-center gap-1 rtl:left-0 rtl:right-auto ltr:left-auto ltr:right-0">
                        {onOpenGuide && (
                            <button
                                type="button"
                                onClick={onOpenGuide}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={language === 'en' ? "Tasbeeh Guide" : "دليل السبحة"}
                                aria-label={language === 'en' ? "Tasbeeh Guide" : "دليل السبحة"}
                            >
                                <i className="fa-solid fa-circle-question text-lg"></i>
                            </button>
                        )}
                        <ThemePageLock />
                        {onHome && (
                            <button
                                onClick={onHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tTasbeeh('home', language)}
                                aria-label={tTasbeeh('home', language)}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TasbeehHeader;
