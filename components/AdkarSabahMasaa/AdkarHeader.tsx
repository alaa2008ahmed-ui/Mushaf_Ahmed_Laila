import React from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';

interface AdkarHeaderProps {
    title: string;
    subtitle: string;
    onBack?: () => void;
    onHome?: () => void;
}

const AdkarHeader: React.FC<AdkarHeaderProps> = ({ title, subtitle, onBack, onHome }) => {
    const { t } = useLanguage();
    const localizedTitle = (title.includes('الصباح والمساء') || title.includes('الأذكار')) ? t('page.sabah_masaa_title', title) : title;
    const localizedSubtitle = subtitle.includes('حصنك اليومي') ? t('page.sabah_masaa_subtitle', subtitle) : subtitle;

    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center w-full min-h-[44px]">
                    {/* زر الرجوع للخلف على يمين النص بالشريط العلوي */}
                    {onBack && (
                        <div className="absolute right-0 flex items-center">
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="رجوع للخلف"
                                aria-label="رجوع للخلف"
                            >
                                <i className="fa-solid fa-arrow-right text-xl"></i>
                            </button>
                        </div>
                    )}

                    {/* عنوان الصفحة في الوسط */}
                    <div className="text-center px-12 min-w-0">
                        <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                            {localizedTitle}
                        </h1>
                    </div>

                    {/* زر الهوم على يسار النص بالشريط العلوي */}
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

export default AdkarHeader;
