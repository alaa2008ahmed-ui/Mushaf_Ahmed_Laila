import React from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';
import { tTasbeeh } from '../../utils/tasbeehTranslations';
import { HelpCircle } from 'lucide-react';

interface TasbeehHeaderProps {
    title?: string;
    subtitle?: string;
    onBack?: () => void;
    onHome?: () => void;
    onOpenGuide?: () => void;
}

const TasbeehHeader: React.FC<TasbeehHeaderProps> = ({ onBack, onHome, onOpenGuide }) => {
    const { language, isRTL } = useLanguage();
    const localizedTitle = tTasbeeh('title', language);

    return (
        <header className="app-top-bar shrink-0">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center w-full min-h-[44px]">
                    {/* Back button */}
                    <div className="absolute right-0 flex items-center rtl:right-0 rtl:left-auto ltr:right-auto ltr:left-0">
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
                    </div>

                    {/* Page title in center */}
                    <div className="text-center px-12 min-w-0">
                        <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
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
                                <HelpCircle size={19} />
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
