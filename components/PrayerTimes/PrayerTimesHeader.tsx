import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';
import { tPrayer, getLocalizedLocationName } from '../../utils/prayerTimesTranslations';

interface PrayerTimesHeaderProps {
    handleRefreshLocation: () => void;
    onOpenNotifications: () => void;
    cityGov: string;
    fullCountry: string;
    combinedCode?: string;
    topBarTextColor: string;
    onBack?: () => void;
    onHome?: () => void;
}

// Helper to calculate initial font size based on text length to prevent flicker
const getInitialTitleSize = (text: string, isMobile: boolean): number => {
    const len = (text || '').length;
    if (isMobile) {
        if (len <= 12) return 17;
        if (len <= 18) return 15;
        if (len <= 26) return 13.5;
        if (len <= 36) return 12;
        if (len <= 48) return 10.5;
        return 9.5;
    } else {
        if (len <= 14) return 20;
        if (len <= 22) return 18;
        if (len <= 32) return 16;
        if (len <= 44) return 14;
        return 12;
    }
};

const getInitialSubtitleSize = (text: string, isMobile: boolean): number => {
    const len = (text || '').length;
    if (isMobile) {
        if (len <= 14) return 12.5;
        if (len <= 24) return 11;
        if (len <= 36) return 10;
        return 9;
    } else {
        if (len <= 16) return 14;
        if (len <= 28) return 12.5;
        return 11;
    }
};

const PrayerTimesHeader: React.FC<PrayerTimesHeaderProps> = ({
    handleRefreshLocation,
    onOpenNotifications,
    cityGov = '',
    fullCountry = '',
    combinedCode,
    topBarTextColor,
    onBack,
    onHome
}) => {
    const { language, isRTL, dir } = useLanguage();
    const centerContainerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);

    const displayCityGov = getLocalizedLocationName(cityGov, language);
    const displayFullCountry = getLocalizedLocationName(fullCountry, language);

    const [titleFontSize, setTitleFontSize] = useState<number>(() => 
        getInitialTitleSize(displayCityGov, typeof window !== 'undefined' ? window.innerWidth < 640 : true)
    );
    const [subtitleFontSize, setSubtitleFontSize] = useState<number>(() => 
        getInitialSubtitleSize(displayFullCountry, typeof window !== 'undefined' ? window.innerWidth < 640 : true)
    );

    // Auto-fit text resizing logic
    const fitTexts = useCallback(() => {
        const container = centerContainerRef.current;
        if (!container) return;

        const availableWidth = container.clientWidth - 8; // 8px buffer
        if (availableWidth <= 0) return;

        const mobile = window.innerWidth < 640;

        // 1. Fit Title (displayCityGov)
        if (titleRef.current) {
            const el = titleRef.current;
            const minTitleSize = 9.5;

            let targetSize = getInitialTitleSize(displayCityGov, mobile);
            el.style.fontSize = `${targetSize}px`;

            if (el.scrollWidth > availableWidth) {
                const ratio = availableWidth / el.scrollWidth;
                targetSize = Math.max(minTitleSize, Math.floor(targetSize * ratio * 0.96 * 10) / 10);
                el.style.fontSize = `${targetSize}px`;

                // Fine step adjustment if still slightly overflowing
                while (el.scrollWidth > availableWidth && targetSize > minTitleSize) {
                    targetSize = Math.max(minTitleSize, targetSize - 0.5);
                    el.style.fontSize = `${targetSize}px`;
                }
            }
            setTitleFontSize(targetSize);
        }

        // 2. Fit Subtitle (displayFullCountry + combinedCode)
        if (subtitleRef.current) {
            const el = subtitleRef.current;
            const minSubSize = 8.5;

            let targetSubSize = getInitialSubtitleSize(displayFullCountry, mobile);
            el.style.fontSize = `${targetSubSize}px`;

            if (el.scrollWidth > availableWidth) {
                const ratio = availableWidth / el.scrollWidth;
                targetSubSize = Math.max(minSubSize, Math.floor(targetSubSize * ratio * 0.96 * 10) / 10);
                el.style.fontSize = `${targetSubSize}px`;

                while (el.scrollWidth > availableWidth && targetSubSize > minSubSize) {
                    targetSubSize = Math.max(minSubSize, targetSubSize - 0.5);
                    el.style.fontSize = `${targetSubSize}px`;
                }
            }
            setSubtitleFontSize(targetSubSize);
        }
    }, [displayCityGov, displayFullCountry]);

    // Recalculate on mount and when texts change
    useLayoutEffect(() => {
        fitTexts();
    }, [fitTexts]);

    useEffect(() => {
        const container = centerContainerRef.current;
        if (!container) return;

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                fitTexts();
            });
            resizeObserver.observe(container);
        }

        const handleResize = () => fitTexts();
        window.addEventListener('resize', handleResize);

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [fitTexts]);

    return (
        <header className="app-top-bar app-top-bar--prayer" dir={dir}>
            <div className="app-top-bar__inner">
                <div className="flex items-center justify-between w-full min-h-[44px] gap-1 sm:gap-2">
                    {/* زر الرجوع للخلف وزر تحديث الموقع */}
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 z-10" style={{ color: topBarTextColor || undefined }}>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: topBarTextColor || undefined }}
                                title={tPrayer('back', language)}
                                aria-label={tPrayer('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-lg sm:text-xl`}></i>
                            </button>
                        )}
                        <button
                            id="location-refresh-btn"
                            onClick={handleRefreshLocation}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                            style={{ color: topBarTextColor || undefined }}
                            title={tPrayer('refreshLocation', language)}
                            aria-label={tPrayer('refreshLocation', language)}
                        >
                            <i className="text-base sm:text-lg active:rotate-180 duration-700 fa-solid fa-location-crosshairs"></i>
                        </button>
                    </div>

                    {/* منطقة النصوص التلقائية الحجم في الوسط - محصورة بدقة بين الأيقونات لمنع أي تداخل نهائياً */}
                    <div 
                        ref={centerContainerRef}
                        className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1 sm:px-2 overflow-hidden"
                    >
                        {/* عنوان المدينة/المحافظة بخط تلقائي الحجم */}
                        <h1 
                            ref={titleRef}
                            className="app-top-bar__title font-kufi font-bold whitespace-nowrap truncate max-w-full leading-tight transition-[font-size] duration-150"
                            style={{ 
                                fontSize: `${titleFontSize}px`,
                                color: topBarTextColor || undefined 
                            }}
                            title={displayCityGov}
                        >
                            {displayCityGov}
                        </h1>

                        {/* الدولة والكود بخط تلقائي الحجم */}
                        <div 
                            ref={subtitleRef}
                            className="app-top-bar__subtitle flex items-center justify-center gap-1.5 whitespace-nowrap truncate max-w-full leading-normal transition-[font-size] duration-150 mt-0.5" 
                            dir={dir}
                            style={{ 
                                fontSize: `${subtitleFontSize}px`,
                                color: topBarTextColor || undefined 
                            }}
                            title={displayFullCountry}
                        >
                            <span className="font-bold truncate max-w-full">{displayFullCountry}</span>
                            {combinedCode && (
                                <span 
                                    className="text-[9px] sm:text-[10px] font-black text-white bg-black/20 px-1.5 py-0 rounded border border-white/20 shrink-0" 
                                    dir="ltr"
                                >
                                    {combinedCode}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* أيقونات قفل الثيم والإعدادات والصفحة الرئيسية */}
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 z-10" style={{ color: topBarTextColor || undefined }}>
                        <ThemePageLock />
                        <button
                            onClick={onOpenNotifications}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                            style={{ color: topBarTextColor || undefined }}
                            title={tPrayer('settings', language)}
                            aria-label={tPrayer('settings', language)}
                        >
                            <i className="text-base sm:text-lg fa-solid fa-gear"></i>
                        </button>
                        {onHome && (
                            <button
                                onClick={onHome}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: topBarTextColor || undefined }}
                                title={tPrayer('home', language)}
                                aria-label={tPrayer('home', language)}
                            >
                                <i className="fa-solid fa-house text-lg sm:text-xl"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PrayerTimesHeader;
