import React from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';

interface TasbeehHeaderProps {
    title: string;
    subtitle: string;
    onBack?: () => void;
    onHome?: () => void;
}

const TasbeehHeader: React.FC<TasbeehHeaderProps> = ({ title, subtitle, onBack, onHome }) => {
    const { t } = useLanguage();
    const localizedTitle = (title === 'السبحة الإلكترونية' || title === 'السبحة') ? t('page.tasbeeh_title', title) : title;
    const localizedSubtitle = subtitle.includes('أضف أذكارك') ? t('page.tasbeeh_subtitle', subtitle) : subtitle;

    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center w-full min-h-[44px]">
                    {/* سهم الرجوع للخلف على يمين النص */}
                    <div className="absolute right-0 flex items-center">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="رجوع للخلف"
                                aria-label="رجوع للخلف"
                            >
                                <i className="fa-solid fa-arrow-right text-xl"></i>
                            </button>
                        )}
                    </div>

                    {/* عنوان الصفحة في الوسط */}
                    <div className="text-center px-12 min-w-0">
                        <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                            {localizedTitle}
                        </h1>
                    </div>

                    {/* أيقونة المنزل على يسار النص للعودة إلى الصفحة الرئيسية */}
                    <div className="absolute left-0 flex items-center gap-1">
                        <ThemePageLock />
                        {onHome && (
                            <button
                                onClick={onHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="الصفحة الرئيسية"
                                aria-label="الصفحة الرئيسية"
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
