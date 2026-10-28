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

    return (
        <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-between w-full min-h-[44px]">
                    {/* Navigation Back button */}
                    <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
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

                    {/* Page Title in center */}
                    <div className="text-center px-12 w-full min-w-0">
                        <h1 className={`app-top-bar__title text-lg sm:text-xl ${isEn ? 'font-sans font-bold' : 'font-kufi'} truncate`}>
                            {localizedTitle}
                        </h1>
                    </div>

                    {/* Home, Guide, and Theme Lock */}
                    <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                        {onOpenGuide && (
                            <button
                                type="button"
                                onClick={onOpenGuide}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer text-black"
                                title={isEn ? "Hisn Guide" : "دليل حصن المسلم"}
                                aria-label={isEn ? "Hisn Guide" : "دليل حصن المسلم"}
                            >
                                <i className="fa-solid fa-circle-question text-lg text-black"></i>
                            </button>
                        )}
                        {showThemePageLock && <ThemePageLock />}
                        {onHome && (
                            <button
                                onClick={onHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer text-black"
                                title={isEn ? "Home" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-xl text-black"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HisnHeader;
