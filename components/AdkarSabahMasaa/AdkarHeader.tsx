import React from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';

interface AdkarHeaderProps {
    title: string;
    subtitle: string;
    onBack?: () => void;
    onHome?: () => void;
    onOpenGuide?: () => void;
}

const AdkarHeader: React.FC<AdkarHeaderProps> = ({ title, subtitle, onBack, onHome, onOpenGuide }) => {
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    
    // Localize title and subtitle if Arabic strings were passed
    let localizedTitle = title;
    if (isEn) {
        if (title.includes('الصباح') && title.includes('المساء')) localizedTitle = 'Morning & Evening Remembrances';
        else if (title.includes('الصباح')) localizedTitle = 'Morning Remembrances';
        else if (title.includes('المساء')) localizedTitle = 'Evening Remembrances';
        else if (title.includes('المفضلة') || title.includes('المفضله')) localizedTitle = 'Favorite Remembrances';
        else if (title.includes('الأذكار')) localizedTitle = 'Daily Remembrances';
    }

    let localizedSubtitle = subtitle;
    if (isEn) {
        if (subtitle.includes('المفضلة') || subtitle.includes('المفضله') || subtitle.includes('للوصول السريع')) {
            localizedSubtitle = 'Your selected remembrances for quick access';
        } else if (subtitle.includes('عداد تفاعلي') || subtitle.includes('اليومية') || subtitle.includes('حصنك')) {
            localizedSubtitle = 'Track your daily remembrances with an interactive counter';
        }
    }

    return (
        <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-between w-full min-h-[44px]">
                    {/* Back button: Left in LTR, Right in RTL */}
                    <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Go Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        )}
                    </div>

                    {/* Page title in center */}
                    <div className="text-center px-12 w-full min-w-0">
                        <h1 className={`app-top-bar__title text-lg sm:text-xl truncate ${isEn ? 'font-sans font-bold' : 'font-kufi'}`}>
                            {localizedTitle}
                        </h1>
                    </div>

                    {/* Home, Guide, and Theme lock: Right in LTR, Left in RTL */}
                    <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                        {onOpenGuide && (
                            <button
                                type="button"
                                onClick={onOpenGuide}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer text-black"
                                title={isEn ? "Athkar Guide" : "دليل أذكار الصباح والمساء"}
                                aria-label={isEn ? "Athkar Guide" : "دليل أذكار الصباح والمساء"}
                            >
                                <i className="fa-solid fa-circle-question text-lg text-black"></i>
                            </button>
                        )}
                        <ThemePageLock />
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

export default AdkarHeader;
