import React from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';

interface HisnHeaderProps {
    title: string;
    subtitle: string;
    showThemePageLock?: boolean;
    onBack?: () => void;
    onHome?: () => void;
    onOpenGuide?: () => void;
}

const HisnHeader: React.FC<HisnHeaderProps> = ({ title, subtitle, showThemePageLock = true, onBack, onHome, onOpenGuide }) => {
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    const localizedTitle = (title === 'حصن المسلم' || title === 'أذكار المسلم') ? t('page.hisn_muslim_title', title) : title;

    // Dynamically adjust font size slightly for long titles so they fit comfortably without colliding with icons
    const isLongTitle = localizedTitle.length > 24;
    const isVeryLongTitle = localizedTitle.length > 36;
    const titleSizeClass = isVeryLongTitle 
        ? 'text-sm sm:text-base' 
        : isLongTitle 
            ? 'text-base sm:text-lg' 
            : 'text-lg sm:text-xl';

    return (
        <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
            <div className="app-top-bar__inner">
                <div className="flex items-center justify-between w-full min-h-[44px] gap-1 px-1">
                    {/* Navigation Back button */}
                    <div className="flex items-center shrink-0 min-w-[40px]">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Go back" : "رجوع للخلف"}
                                aria-label={isEn ? "Go back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        )}
                    </div>

                    {/* Page Title in center - takes the entire remaining space between left and right icons without overlapping */}
                    <div className="flex-1 min-w-0 text-center px-1">
                        <h1 className={`app-top-bar__title ${titleSizeClass} ${isEn ? 'font-sans font-bold' : 'font-kufi font-bold'} truncate leading-tight`}>
                            {localizedTitle}
                        </h1>
                    </div>

                    {/* Home, Guide, and Theme Lock */}
                    <div className="flex items-center gap-1 shrink-0 justify-end min-w-[40px]">
                        {onOpenGuide && (
                            <button
                                type="button"
                                onClick={onOpenGuide}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer text-[var(--top-bar-text,inherit)]"
                                title={isEn ? "Hisn Guide" : "دليل حصن المسلم"}
                                aria-label={isEn ? "Hisn Guide" : "دليل حصن المسلم"}
                            >
                                <i className="fa-solid fa-circle-question text-lg"></i>
                            </button>
                        )}
                        {showThemePageLock && <ThemePageLock />}
                        {onHome && (
                            <button
                                onClick={onHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer text-[var(--top-bar-text,inherit)]"
                                title={isEn ? "Home" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
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

export default HisnHeader;
