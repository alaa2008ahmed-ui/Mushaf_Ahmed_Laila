import React, { useState, useEffect } from 'react';
import { ISLAMIC_SITES_DATA, IslamicSite } from '../data/islamicSitesData';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { shareAsImage } from '../utils/shareAsImage';
import { motion, AnimatePresence } from 'framer-motion';
import { markPageAsSeen } from '../utils/badgeManager';
import { HelpCircle } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ISLAMIC_SITES_PAGE_STEPS } from '../components/Community/communityTourSteps';

interface IslamicSitesPageProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

const IslamicSitesPage: React.FC<IslamicSitesPageProps> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const [selectedSite, setSelectedSite] = useState<IslamicSite | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('islamic-sites');
        if (!getGuideSeen('islamic_sites_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);

    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));

    // Intercept hardware/device back button (Capacitor/Android and browser back)
    // Closes selected site modal if open, otherwise lets global handler navigate back to origin
    useEffect(() => {
        const interceptor = () => {
            if (selectedSite) {
                setSelectedSite(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedSite]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2500);
    };

    const handleCopyUrl = (url: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(url).then(() => {
            showToast(isEn ? 'Website link copied successfully' : 'تم نسخ رابط الموقع بنجاح');
        }).catch(() => {
            showToast(isEn ? 'Failed to copy, please copy manually' : 'تعذر النسخ، يرجى نسخ الرابط يدوياً');
        });
    };

    const handleOpenUrl = (url: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const cleanSiteName = (name: string) => {
        return name
            .replace(/^موقع\s+/, '')
            .replace(/\s*\([a-zA-Z0-9\.\-_ ]+\)\s*/g, '')
            .replace(/^[a-zA-Z0-9\.\-_ ]+\s*\((.*?)\)$/, '$1')
            .replace(/\s+[a-zA-Z0-9\.\-_]+$/, '')
            .trim();
    };

    const getSiteName = (site: IslamicSite) => {
        if (isEn && site.nameEn) return site.nameEn;
        return cleanSiteName(site.name);
    };

    const getSiteCategory = (site: IslamicSite) => {
        if (isEn && site.categoryEn) return site.categoryEn;
        return site.category;
    };

    const getSiteDescription = (site: IslamicSite) => {
        if (isEn && site.descriptionEn) return site.descriptionEn;
        return site.description;
    };

    const getSiteFeatures = (site: IslamicSite) => {
        if (isEn && site.featuresEn && site.featuresEn.length > 0) return site.featuresEn;
        return site.features;
    };

    const handleShareSite = async (site: IslamicSite, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const formattedName = getSiteName(site);
        const desc = getSiteDescription(site);
        const cat = getSiteCategory(site);
        await shareAsImage({
            text: `${formattedName}\n${site.url}\n\n${desc}`,
            source: site.url,
            category: cat || (isEn ? 'Islamic Websites' : 'مواقع إسلامية'),
            theme,
            setToastMessage: showToast
        });
    };

    const handleHomeClick = () => {
        if (selectedSite) {
            setSelectedSite(null);
        } else {
            onBack();
        }
    };

    const filteredSites = ISLAMIC_SITES_DATA.filter(site => {
        const query = searchQuery.toLowerCase();
        return (
            site.name.toLowerCase().includes(query) ||
            (site.nameEn && site.nameEn.toLowerCase().includes(query)) ||
            site.description.toLowerCase().includes(query) ||
            (site.descriptionEn && site.descriptionEn.toLowerCase().includes(query)) ||
            site.category.toLowerCase().includes(query) ||
            (site.categoryEn && site.categoryEn.toLowerCase().includes(query)) ||
            site.url.toLowerCase().includes(query)
        );
    });

    // Current index for next/previous navigation in detail view
    const currentIndex = selectedSite ? ISLAMIC_SITES_DATA.findIndex(s => s.id === selectedSite.id) : -1;
    const prevSite = currentIndex > 0 ? ISLAMIC_SITES_DATA[currentIndex - 1] : null;
    const nextSite = currentIndex >= 0 && currentIndex < ISLAMIC_SITES_DATA.length - 1 ? ISLAMIC_SITES_DATA[currentIndex + 1] : null;

    return (
        <div 
            className="h-screen flex flex-col overflow-hidden" 
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ backgroundColor: 'transparent', color: theme.textColor, fontFamily: theme.font }}
        >
            {/* Header */}
            <header className="app-top-bar shrink-0">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* زر الرجوع للخلف */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={handleHomeClick}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {selectedSite ? getSiteName(selectedSite) : (isEn ? 'Islamic Websites' : 'مواقع إسلامية')}
                            </h1>
                        </div>

                        {/* أيقونة المنزل وقفل الصفحة */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Islamic Sites Guide" : "دليل المواقع الإسلامية"}
                                aria-label={isEn ? "Islamic Sites Guide" : "دليل المواقع الإسلامية"}
                            >
                                <HelpCircle size={19} />
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Home Page" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home Page" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-2 pb-16">
                <AnimatePresence mode="wait">
                    {selectedSite ? (
                        /* Detail Page View for Selected Website */
                        <motion.div
                            key={`site-detail-${selectedSite.id}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-2xl mx-auto space-y-4"
                        >
                            {/* Category Tag */}
                            <div className={`flex items-center ${isEn ? 'justify-start' : 'justify-end'}`}>
                                <span 
                                    className="text-xs px-2.5 py-1 rounded-full font-bold"
                                    style={{
                                        backgroundColor: themeKey === 'default' ? '#00000015' : `${theme.palette[0]}25`,
                                        color: themeKey === 'default' ? '#000000' : theme.palette[0]
                                    }}
                                >
                                    {getSiteCategory(selectedSite)}
                                </span>
                            </div>

                            {/* Hero Card */}
                            <div 
                                className="p-5 sm:p-6 rounded-3xl themed-card border shadow-lg relative overflow-hidden"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div 
                                    className={`absolute ${isEn ? '-left-12' : '-right-12'} -top-12 w-36 h-36 rounded-full opacity-15 blur-2xl pointer-events-none`}
                                    style={{ backgroundColor: theme.palette[0] }}
                                />

                                <div className={`flex flex-col sm:flex-row items-center ${isEn ? 'sm:items-start text-center sm:text-left' : 'sm:items-start text-center sm:text-right'} gap-4`}>
                                    <div 
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                                        style={{ 
                                            backgroundColor: isDefaultTheme ? '#00000010' : `${theme.palette[selectedSite.id % theme.palette.length]}25`,
                                            color: isDefaultTheme ? '#000000' : theme.palette[selectedSite.id % theme.palette.length]
                                        }}
                                    >
                                        <i className={`${selectedSite.icon} text-3xl sm:text-4xl`}></i>
                                    </div>

                                    <div className="flex-1 space-y-1.5">
                                        <div className={`flex flex-wrap items-center justify-center ${isEn ? 'sm:justify-start' : 'sm:justify-start'} gap-2`}>
                                            <h2 className="text-xl sm:text-2xl font-bold font-kufi">
                                                {getSiteName(selectedSite)}
                                            </h2>
                                            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                                <i className="fa-solid fa-circle-check text-[10px]"></i>
                                                {isEn ? 'Verified Islamic Platform' : 'منصة إسلامية معتمدة'}
                                            </span>
                                        </div>

                                        <p className="text-sm opacity-80 font-medium">
                                            {isEn ? 'Category: ' : 'التصنيف: '}
                                            {getSiteCategory(selectedSite)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* URL & Quick Actions Card */}
                            <div 
                                className="p-5 rounded-3xl themed-card border shadow-md space-y-3"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center justify-between text-xs font-bold opacity-75">
                                    <span className="flex items-center gap-1.5">
                                        <i className="fa-solid fa-link text-indigo-500"></i>
                                        {isEn ? 'Website URL' : 'رابط الموقع الإلكتروني'}
                                    </span>
                                    <span>{isEn ? 'Click to visit directly' : 'انقر للفتح المباشر'}</span>
                                </div>

                                <div 
                                    className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border flex items-center justify-between gap-3 overflow-hidden"
                                    style={{ borderColor: 'var(--card-border)' }}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0" dir="ltr">
                                        <i className="fa-solid fa-lock text-xs text-emerald-500 shrink-0"></i>
                                        <span className="text-xs sm:text-sm font-mono truncate text-left select-all text-blue-600 dark:text-blue-400 font-semibold">
                                            {selectedSite.url}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={(e) => handleCopyUrl(selectedSite.url, e)}
                                            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isEn ? 'Copy Link' : 'نسخ الرابط'}
                                        >
                                            <i className="fa-regular fa-copy"></i>
                                        </button>
                                        <button
                                            onClick={(e) => handleShareSite(selectedSite, e)}
                                            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isEn ? 'Share' : 'مشاركة'}
                                        >
                                            <i className="fa-solid fa-share-nodes"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Primary Open Link Button */}
                                <button
                                    onClick={() => handleOpenUrl(selectedSite.url)}
                                    className="w-full py-3.5 px-4 rounded-2xl font-bold font-kufi text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 text-white cursor-pointer"
                                    style={{
                                        backgroundColor: isDefaultTheme ? '#1e293b' : theme.palette[0],
                                    }}
                                >
                                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                    <span>
                                        {isEn 
                                            ? `Visit ${getSiteName(selectedSite)} Now` 
                                            : `زيارة ${cleanSiteName(selectedSite.name)} الآن`}
                                    </span>
                                </button>
                            </div>

                            {/* Detailed Description / "نبذة عن الموقع" */}
                            <div 
                                className="p-5 sm:p-6 rounded-3xl themed-card border shadow-md space-y-4"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
                                    <div 
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                                        style={{ 
                                            backgroundColor: isDefaultTheme ? '#00000010' : `${theme.palette[0]}20`,
                                            color: isDefaultTheme ? '#000000' : theme.palette[0]
                                        }}
                                    >
                                        <i className="fa-solid fa-circle-info"></i>
                                    </div>
                                    <h3 className="text-lg font-bold font-kufi">
                                        {isEn ? 'About the Website' : 'نبذة عن محتوى الموقع'}
                                    </h3>
                                </div>

                                <div className={`leading-relaxed text-sm sm:text-base opacity-95 ${isEn ? 'text-left' : 'text-justify'} whitespace-pre-line p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]`}>
                                    {getSiteDescription(selectedSite)}
                                </div>

                                {/* Highlights / Features */}
                                {getSiteFeatures(selectedSite) && getSiteFeatures(selectedSite).length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <h4 className="text-xs font-bold opacity-75">
                                            {isEn ? 'Key Sections & Features:' : 'أبرز أقسام وخدمات الموقع:'}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {getSiteFeatures(selectedSite).map((feature, fIdx) => (
                                                <div 
                                                    key={fIdx}
                                                    className="flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border bg-black/[0.02] dark:bg-white/[0.03]"
                                                    style={{ borderColor: 'var(--card-border)' }}
                                                >
                                                    <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Next / Prev Navigation */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {prevSite ? (
                                    <button
                                        onClick={() => setSelectedSite(prevSite)}
                                        className={`p-3 rounded-2xl border ${isEn ? 'text-left' : 'text-right'} transition-all active:scale-95 shadow-sm hover:border-indigo-400 cursor-pointer`}
                                        style={{ 
                                            borderColor: cardBorderColor,
                                            borderWidth: '1.5px',
                                            backgroundColor: 'var(--card-bg, rgba(255,255,255,0.03))'
                                        }}
                                    >
                                        <span className="text-[10px] opacity-60 block">
                                            {isEn ? 'Previous Site' : 'الموقع السابق'}
                                        </span>
                                        <span className="text-xs font-bold block truncate">
                                            {getSiteName(prevSite)}
                                        </span>
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {nextSite ? (
                                    <button
                                        onClick={() => setSelectedSite(nextSite)}
                                        className={`p-3 rounded-2xl border ${isEn ? 'text-right' : 'text-left'} transition-all active:scale-95 shadow-sm hover:border-indigo-400 cursor-pointer`}
                                        style={{ 
                                            borderColor: cardBorderColor,
                                            borderWidth: '1.5px',
                                            backgroundColor: 'var(--card-bg, rgba(255,255,255,0.03))'
                                        }}
                                    >
                                        <span className="text-[10px] opacity-60 block">
                                            {isEn ? 'Next Site' : 'الموقع التالي'}
                                        </span>
                                        <span className="text-xs font-bold block truncate">
                                            {getSiteName(nextSite)}
                                        </span>
                                    </button>
                                ) : (
                                    <div />
                                )}
                            </div>

                            {/* Generous bottom spacing for detail view */}
                            <div className="h-32 sm:h-36 w-full pointer-events-none" aria-hidden="true" />
                        </motion.div>
                    ) : (
                        /* 25 Islamic Sites Cards Grid */
                        <motion.div
                            key="sites-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4 max-w-4xl mx-auto"
                        >
                            {/* Search Bar */}
                            <div 
                                className="p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl themed-card border shadow-sm relative overflow-hidden flex items-center"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={isEn ? 'Search Islamic websites...' : 'بحث في المواقع الإسلامية...'}
                                        className={`w-full ${isEn ? 'pl-9 pr-8 text-left' : 'pl-8 pr-9 text-right'} py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl border bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                                        style={{ borderColor: 'var(--card-border)', color: theme.textColor }}
                                    />
                                    <i className={`fa-solid fa-magnifying-glass absolute ${isEn ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs opacity-50`}></i>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className={`absolute ${isEn ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100 cursor-pointer`}
                                        >
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 25 Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {filteredSites.map((site) => {
                                    const cardColor = isDefaultTheme 
                                        ? '#000000' 
                                        : theme.palette[site.id % theme.palette.length];

                                    return (
                                        <div
                                            key={site.id}
                                            onClick={() => setSelectedSite(site)}
                                            className="relative group cursor-pointer active:scale-[0.98] transition-all"
                                        >
                                            <div 
                                                className="h-full p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl themed-card border shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-2.5 relative overflow-hidden"
                                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                            >
                                                {/* Ambient subtle glow */}
                                                <div 
                                                    className={`absolute ${isEn ? '-left-6' : '-right-6'} -top-6 w-20 h-20 rounded-full opacity-10 blur-xl pointer-events-none group-hover:opacity-20 transition-opacity`}
                                                    style={{ backgroundColor: cardColor }}
                                                />

                                                {/* Top row: Category tag & Actions (زيارة + مشاركة) */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] font-medium opacity-70 px-2.5 py-0.5 rounded-full border bg-black/[0.02] dark:bg-white/[0.02] truncate max-w-[150px] sm:max-w-none" style={{ borderColor: 'var(--card-border)' }}>
                                                        {getSiteCategory(site)}
                                                    </span>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            onClick={(e) => handleOpenUrl(site.url, e)}
                                                            className="px-3 py-1 rounded-full text-[11px] font-bold border transition-all active:scale-95 bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs cursor-pointer"
                                                            title={isEn ? 'Open website directly' : 'فتح الموقع مباشرة'}
                                                        >
                                                            <span>{isEn ? 'Visit' : 'زيارة'}</span>
                                                        </button>

                                                        <button
                                                            onClick={(e) => handleShareSite(site, e)}
                                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            style={{ color: 'var(--text-color)' }}
                                                            title={isEn ? 'Share' : 'مشاركة'}
                                                        >
                                                            <i className="fa-solid fa-share-nodes text-xs"></i>
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedSite(site);
                                                            }}
                                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                                            style={{ color: 'var(--text-color)' }}
                                                            title={isEn ? 'View Details' : 'عرض التفاصيل'}
                                                            aria-label={isEn ? 'View Details' : 'عرض التفاصيل'}
                                                        >
                                                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Middle: Name & Description (Without icon) */}
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <h3 className="font-bold text-sm sm:text-base font-kufi leading-snug line-clamp-1 group-hover:text-indigo-500 transition-colors">
                                                        {getSiteName(site)}
                                                    </h3>
                                                    <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
                                                        {getSiteDescription(site)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredSites.length === 0 && (
                                <div className="text-center py-12 opacity-60">
                                    <i className="fa-solid fa-search text-3xl mb-2"></i>
                                    <p className="text-sm">
                                        {isEn ? 'No websites match your search' : 'لا توجد مواقع تطابق بحثك'}
                                    </p>
                                </div>
                            )}

                            {/* Bottom spacing */}
                            <div className="h-6 w-full pointer-events-none" aria-hidden="true" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <CommunitySpotlightGuide
                isOpen={showGuide}
                onClose={() => {
                    setShowGuide(false);
                    markPageAsSeen('islamic-sites');
                }}
                steps={ISLAMIC_SITES_PAGE_STEPS}
                guideKey="islamic_sites_page_spotlight"
                isEn={isEn}
            />

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 30, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 z-[200] bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs text-center whitespace-nowrap border border-white/10"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IslamicSitesPage;
