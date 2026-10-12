import React from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';

interface AdkarHeaderProps {
    title: string;
    subtitle: string;
}

const AdkarHeader: React.FC<AdkarHeaderProps> = ({ title, subtitle }) => {
    const { t } = useLanguage();
    const localizedTitle = (title.includes('الصباح والمساء') || title.includes('الأذكار')) ? t('page.sabah_masaa_title', title) : title;
    const localizedSubtitle = subtitle.includes('حصنك اليومي') ? t('page.sabah_masaa_subtitle', subtitle) : subtitle;

    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center w-full">
                    <div className="absolute left-0">
                        <ThemePageLock />
                    </div>
                    <h1 className="app-top-bar__title text-2xl font-kufi">
                        {localizedTitle}
                    </h1>
                </div>
                <p className="app-top-bar__subtitle">{localizedSubtitle}</p>
            </div>
        </header>
    );
};

export default AdkarHeader;
