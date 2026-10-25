import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';
import { tPrayer, getLocalizedLocationName } from '../../utils/prayerTimesTranslations';
import { HelpCircle } from 'lucide-react';

interface PrayerTimesHeaderProps {
    handleRefreshLocation: () => void;
    onOpenNotifications: () => void;
    cityGov: string;
    fullCountry: string;
    combinedCode?: string;
    topBarTextColor: string;
    onBack?: () => void;
    onHome?: () => void;
    onOpenGuide?: () => void;
}

// Helper to calculate initial font size based on text length to prevent flicker
const getInitialTitleSize = (text: string, isMobile: boolean): number => {
    const len = (text || '').length;
    if (isMobile) {
        if (len <= 10) return 16.5;
        if (len <= 16) return 14.5;
        if (len <= 22) return 13;
        if (len <= 30) return 11.5;
        if (len <= 40) return 10.5;
        return 9.5;
    } else {
        if (len <= 14) return 19;
        if (len <= 22) return 17;
        if (len <= 32) return 15;
        if (len <= 44) return 13.5;
        return 12;
    }
};

const getInitialSubtitleSize = (text: string, isMobile: boolean): number => {
    const len = (text || '').length;
    if (isMobile) {
        if (len <= 14) return 12;
        if (len <= 24) return 10.5;
        if (len <= 36) return 9.5;
        return 8.5;
    } else {
        if (len <= 16) return 13.5;
        if (len <= 28) return 12;
        return 10.5;
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
    onHome,
    onOpenGuide
}) => {
    const { language, isRTL, dir } = useLanguage();
    const centerContainerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);
    const lastWidthRef = useRef<number>(0);

    const displayCityGov = getLocalizedLocationName(cityGov, language);
    const displayFullCountry = getLocalizedLocationName(fullCountry, language);

    const [titleFontSize, setTitleFontSize] = useState<number>(() => 
        getInitialTitleSize(displayCityGov, typeof window !== 'undefined' ? window.innerWidth < 640 : true)
    );
    const [subtitleFontSize, setSubtitleFontSize] = useState<number>(() => 
        getInitialSubtitleSize(displayFullCountry, typeof window !== 'undefined' ? window.innerWidth < 640 : true)
    );

    // Auto-fit text resizing logic - stable calculation with zero animation jitter
    const fitTexts = useCallback(() => {
        const container = centerContainerRef.current;
        if (!container) return;

        const containerWidth = container.clientWidth;
        // 12px safe padding buffer to prevent border oscillation at ellipsis threshold
        const availableWidth = Math.max(0, containerWidth - 12);
        if (availableWidth <= 0) return;

        const mobile = window.innerWidth < 640;

        // 1. Fit Title (displayCityGov)
        if (titleRef.current) {
            const el = titleRef.current;
            const minTitleSize = 9.0;

            let targetSize = getInitialTitleSize(displayCityGov, mobile);
            el.style.fontSize = `${targetSize}px`;

            if (el.scrollWidth > availableWidth) {
                const ratio = (availableWidth / el.scrollWidth) * 0.96;
                targetSize = Math.max(minTitleSize, Math.floor(targetSize * ratio * 10) / 10);
                el.style.fontSize = `${targetSize}px`;

                // Safe check if still slightly overflowing
                if (el.scrollWidth > availableWidth && targetSize > minTitleSize) {
                    targetSize = Math.max(minTitleSize, targetSize - 0.5);
                    el.style.fontSize = `${targetSize}px`;
                }
            }

            setTitleFontSize(prev => (Math.abs(prev - targetSize) >= 0.4 ? targetSize : prev));
        }

        // 2. Fit Subtitle (displayFullCountry)
        if (subtitleRef.current) {
            const el = subtitleRef.current;
            const minSubSize = 8.0;

            let targetSubSize = getInitialSubtitleSize(displayFullCountry, mobile);
            el.style.fontSize = `${targetSubSize}px`;

            if (el.scrollWidth > availableWidth) {
                const ratio = (availableWidth / el.scrollWidth) * 0.96;
                targetSubSize = Math.max(minSubSize, Math.floor(targetSubSize * ratio * 10) / 10);
                el.style.fontSize = `${targetSubSize}px`;

                if (el.scrollWidth > availableWidth && targetSubSize > minSubSize) {
                    targetSubSize = Math.max(minSubSize, targetSubSize - 0.5);
                    el.style.fontSize = `${targetSubSize}px`;
                }
            }

            setSubtitleFontSize(prev => (Math.abs(prev - targetSubSize) >= 0.4 ? targetSubSize : prev));
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
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const width = entry.contentRect.width;
                    // Only re-run if width genuinely changed by at least 2px to avoid oscillation
                    if (Math.abs(width - lastWidthRef.current) >= 2) {
                        lastWidthRef.current = width;
                        fitTexts();
                    }
                }
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
                <div className="flex items-center justify-between w-full min-h-[44px] gap-0.5 sm:gap-1.5">
                    {/* زر الرجوع للخلف وزر تحديث الموقع - مدمجة بحجم مريح لإفساح أكبر مساحة للنص */}
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 z-10" style={{ color: topBarTextColor || undefined }}>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: topBarTextColor || undefined }}
                                title={tPrayer('back', language)}
                                aria-label={tPrayer('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-base sm:text-lg`}></i>
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

                    {/* منطقة النصوص التلقائية الحجم في الوسط - محصورة بدقة وثبات بدون رعشة نهائياً */}
                    <div 
                        ref={centerContainerRef}
                        className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1 sm:px-2 overflow-hidden select-none"
                    >
                        {/* عنوان المدينة/المحافظة بخط تلقائي الحجم وثابت */}
                        <h1 
                            ref={titleRef}
                            className="app-top-bar__title font-kufi font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full leading-tight"
                            style={{ 
                                fontSize: `${titleFontSize}px`,
                                color: topBarTextColor || undefined 
                            }}
                            title={displayCityGov}
                        >
                            {displayCityGov}
                        </h1>

                        {/* الدولة بخط تلقائي الحجم وثابت */}
                        <div 
                            ref={subtitleRef}
                            className="app-top-bar__subtitle flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full leading-normal mt-0.5" 
                            dir={dir}
                            style={{ 
                                fontSize: `${subtitleFontSize}px`,
                                color: topBarTextColor || undefined 
                            }}
                            title={displayFullCountry}
                        >
                            <span className="font-bold truncate max-w-full">{displayFullCountry}</span>
                        </div>
                    </div>

                    {/* أيقونات الدليل والإعدادات والصفحة الرئيسية - مدمجة بحجم متناسق */}
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 z-10" style={{ color: topBarTextColor || undefined }}>
                        {onOpenGuide && (
                            <button
                                type="button"
                                onClick={onOpenGuide}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: topBarTextColor || undefined }}
                                title={language === 'en' ? "Prayer Times Guide" : "دليل وشرح مواقيت الصلاة"}
                                aria-label={language === 'en' ? "Prayer Times Guide" : "دليل وشرح مواقيت الصلاة"}
                            >
                                <HelpCircle size={18} />
                            </button>
                        )}
                        <ThemePageLock />
                        <button
                            id="prayer-top-bar-settings-btn"
                            onClick={onOpenNotifications}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                            style={{ color: topBarTextColor || undefined }}
                            title={language === 'en' ? "Prayer Settings & Notifications" : "إعدادات الصلاة والإشعارات"}
                            aria-label={language === 'en' ? "Prayer Settings & Notifications" : "إعدادات الصلاة والإشعارات"}
                        >
                            <i className="text-base sm:text-lg fa-solid fa-gear"></i>
                        </button>
                        {onHome && (
                            <button
                                onClick={onHome}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: topBarTextColor || undefined }}
                                title={tPrayer('home', language)}
                                aria-label={tPrayer('home', language)}
                            >
                                <i className="fa-solid fa-house text-base sm:text-lg"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PrayerTimesHeader;
