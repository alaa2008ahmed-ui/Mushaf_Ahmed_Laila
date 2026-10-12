import React from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';

interface HisnHeaderProps {
    title: string;
    subtitle: string;
    showThemePageLock?: boolean;
}

const HisnHeader: React.FC<HisnHeaderProps> = ({ title, subtitle, showThemePageLock = true }) => {
    const { t } = useLanguage();
    const localizedTitle = (title === 'حصن المسلم' || title === 'أذكار المسلم') ? t('page.hisn_muslim_title', title) : title;
    const localizedSubtitle = subtitle.includes('الكتاب والسنة') ? t('page.hisn_muslim_subtitle', subtitle) : subtitle;

    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center w-full">
                    <div className="absolute left-0">
                        {showThemePageLock && <ThemePageLock />}
                    </div>
                    <h1 className="app-top-bar__title text-2xl font-kufi">
                        {localizedTitle}
                    </h1>
                </div>
                <p className="app-top-bar__subtitle">
                    {localizedSubtitle}
                </p>
            </div>
        </header>
    );
};

export default HisnHeader;
