import React, { useState, useEffect } from 'react';
import { ISLAMIC_SITES_DATA, IslamicSite } from '../data/islamicSitesData';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { shareAsImage } from '../utils/shareAsImage';
import { motion, AnimatePresence } from 'framer-motion';
import { markPageAsSeen } from '../utils/badgeManager';
import { HelpCircle, Search, X, Link, Copy, Share2, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ISLAMIC_SITES_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';

interface IslamicSitesPageProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

const IslamicSitesPage: React.FC<IslamicSitesPageProps> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
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

    const currentIndex = selectedSite ? ISLAMIC_SITES_DATA.findIndex(s => s.id === selectedSite.id) : -1;
    const prevSite = currentIndex > 0 ? ISLAMIC_SITES_DATA[currentIndex - 1] : null;
    const nextSite = currentIndex >= 0 && currentIndex < ISLAMIC_SITES_DATA.length - 1 ? ISLAMIC_SITES_DATA[currentIndex + 1] : null;

    return (
        <div 
            className="h-screen flex flex-col overflow-hidden" 
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: theme.font }}
        >
            {/* Header */}
            <header className="app-top-bar shrink-0">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back Button */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={handleHomeClick}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
                                title={isEn ? "Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Title */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-bold truncate">
                                {selectedSite ? getSiteName(selectedSite) : (isEn ? 'Islamic Websites' : 'مواقع إسلامية')}
                            </h1>
                        </div>

                        {/* Guide / Home / Lock */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Islamic Sites Guide" : "دليل المواقع الإسلامية"}
                                aria-label={isEn ? "Islamic Sites Guide" : "دليل المواقع الإسلامية"}
                            >
                                <i className="fa-solid fa-circle-question text-lg text-black"></i>
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
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
            <main className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-3 pb-16">
                <AnimatePresence mode="wait">
                    {selectedSite ? (
                        /* Detail Page View for Selected Website - Modern Flat Surface */
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
                                    className="text-xs px-3.5 py-1 rounded-full font-bold border-0"
                                    style={{
                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                        color: tokens.primaryColor
                                    }}
                                >
                                    {getSiteCategory(selectedSite)}
                                </span>
                            </div>

                            {/* Hero Card */}
                            <div 
                                className="p-5 sm:p-6 rounded-[18px] relative overflow-hidden border-0"
                                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                            >
                                <div className={`flex flex-col sm:flex-row items-center ${isEn ? 'sm:items-start text-center sm:text-left' : 'sm:items-start text-center sm:text-right'} gap-4`}>
                                    <div 
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] flex items-center justify-center shrink-0 border-0"
                                        style={{ 
                                            backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                            color: tokens.primaryColor
                                        }}
                                    >
                                        <i className={`${selectedSite.icon} text-3xl sm:text-4xl`}></i>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className={`flex flex-wrap items-center justify-center ${isEn ? 'sm:justify-start' : 'sm:justify-start'} gap-2`}>
                                            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: tokens.textColor }}>
                                                {getSiteName(selectedSite)}
                                            </h2>
                                            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border-0">
                                                <i className="fa-solid fa-circle-check text-[10px]"></i>
                                                {isEn ? 'Verified Islamic Platform' : 'منصة إسلامية معتمدة'}
                                            </span>
                                        </div>

                                        <p className="text-sm font-medium" style={{ color: tokens.subtextColor }}>
                                            {isEn ? 'Category: ' : 'التصنيف: '}
                                            {getSiteCategory(selectedSite)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* URL & Quick Actions Card */}
                            <div 
                                className="p-5 rounded-[18px] space-y-3.5 border-0"
                                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                            >
                                <div className="flex items-center justify-between text-xs font-bold opacity-75">
                                    <span className="flex items-center gap-1.5" style={{ color: tokens.primaryColor }}>
                                        <Link className="w-3.5 h-3.5" />
                                        {isEn ? 'Website URL' : 'رابط الموقع الإلكتروني'}
                                    </span>
                                    <span style={{ color: tokens.subtextColor }}>{isEn ? 'Click to visit directly' : 'انقر للفتح المباشر'}</span>
                                </div>

                                <div 
                                    className="p-3.5 rounded-[14px] flex items-center justify-between gap-3 overflow-hidden border-0"
                                    style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}
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
                                            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-200/60 dark:bg-zinc-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0"
                                            style={{ color: tokens.textColor }}
                                            title={isEn ? 'Copy Link' : 'نسخ الرابط'}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleShareSite(selectedSite, e)}
                                            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-200/60 dark:bg-zinc-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0"
                                            style={{ color: tokens.textColor }}
                                            title={isEn ? 'Share' : 'مشاركة'}
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Primary Open Link Button */}
                                <button
                                    onClick={() => handleOpenUrl(selectedSite.url)}
                                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 text-white cursor-pointer border-0"
                                    style={{ backgroundColor: tokens.primaryColor }}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>
                                        {isEn 
                                            ? `Visit ${getSiteName(selectedSite)} Now` 
                                            : `زيارة ${cleanSiteName(selectedSite.name)} الآن`}
                                    </span>
                                </button>
                            </div>

                            {/* Detailed Description */}
                            <div 
                                className="p-5 sm:p-6 rounded-[18px] space-y-4 border-0"
                                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                            >
                                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                                    <h3 className="text-lg font-bold" style={{ color: tokens.textColor }}>
                                        {isEn ? 'About the Website' : 'نبذة عن محتوى الموقع'}
                                    </h3>
                                </div>

                                <div 
                                    className={`leading-[2.2] text-sm sm:text-base p-4 rounded-[14px] border-0 ${isEn ? 'text-left' : 'text-justify'} whitespace-pre-line`}
                                    style={{ 
                                        backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA',
                                        color: tokens.textColor
                                    }}
                                >
                                    {getSiteDescription(selectedSite)}
                                </div>

                                {/* Highlights / Features */}
                                {getSiteFeatures(selectedSite) && getSiteFeatures(selectedSite).length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <h4 className="text-xs font-bold" style={{ color: tokens.primaryColor }}>
                                            {isEn ? 'Key Sections & Features:' : 'أبرز أقسام وخدمات الموقع:'}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {getSiteFeatures(selectedSite).map((feature, fIdx) => (
                                                <div 
                                                    key={fIdx}
                                                    className="flex items-center gap-2 text-xs font-semibold p-3 rounded-xl border-0"
                                                    style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}
                                                >
                                                    <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                                                    <span style={{ color: tokens.textColor }}>{feature}</span>
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
                                        className={`p-3.5 rounded-[18px] border-0 ${isEn ? 'text-left' : 'text-right'} transition-all active:scale-95 shadow-sm hover:scale-[1.02] cursor-pointer`}
                                        style={{ 
                                            backgroundColor: tokens.cardBgColor,
                                            boxShadow: tokens.cardShadow
                                        }}
                                    >
                                        <span className="text-[10px] opacity-60 block" style={{ color: tokens.subtextColor }}>
                                            {isEn ? 'Previous Site' : 'الموقع السابق'}
                                        </span>
                                        <span className="text-xs font-bold block truncate" style={{ color: tokens.textColor }}>
                                            {getSiteName(prevSite)}
                                        </span>
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {nextSite ? (
                                    <button
                                        onClick={() => setSelectedSite(nextSite)}
                                        className={`p-3.5 rounded-[18px] border-0 ${isEn ? 'text-right' : 'text-left'} transition-all active:scale-95 shadow-sm hover:scale-[1.02] cursor-pointer`}
                                        style={{ 
                                            backgroundColor: tokens.cardBgColor,
                                            boxShadow: tokens.cardShadow
                                        }}
                                    >
                                        <span className="text-[10px] opacity-60 block" style={{ color: tokens.subtextColor }}>
                                            {isEn ? 'Next Site' : 'الموقع التالي'}
                                        </span>
                                        <span className="text-xs font-bold block truncate" style={{ color: tokens.textColor }}>
                                            {getSiteName(nextSite)}
                                        </span>
                                    </button>
                                ) : (
                                    <div />
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* 25 Islamic Sites Cards Grid - Pure White, Soft Elevation, Zero Border */
                        <motion.div
                            key="sites-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4 max-w-4xl mx-auto"
                        >
                            {/* Search Bar - Flat Surface */}
                            <div 
                                className="relative rounded-[18px] overflow-hidden transition-all shadow-sm border-0" 
                                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                            >
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isEn ? 'Search Islamic websites...' : 'بحث في المواقع الإسلامية...'}
                                    className={`w-full ${isEn ? 'pl-12 pr-10 text-left font-sans' : 'pr-12 pl-10 text-right font-kufi'} py-3.5 bg-transparent focus:outline-none placeholder-gray-400`}
                                    style={{ color: tokens.textColor }}
                                />
                                <Search 
                                    className={`w-4 h-4 absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 opacity-40`} 
                                    style={{ color: tokens.textColor }}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className={`absolute ${isEn ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100 cursor-pointer`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* 25 Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {filteredSites.map((site) => (
                                    <div
                                        key={site.id}
                                        onClick={() => setSelectedSite(site)}
                                        className="relative group cursor-pointer active:scale-[0.98] transition-all"
                                    >
                                        <div 
                                            className="h-full p-4.5 rounded-[18px] transition-all flex flex-col justify-between gap-3 relative overflow-hidden border-0"
                                            style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                                        >
                                            {/* Top row: Category tag & Actions */}
                                            <div className="flex items-center justify-between gap-2">
                                                <span 
                                                    className="text-[11px] font-bold px-3 py-1 rounded-full border-0 truncate max-w-[150px] sm:max-w-none"
                                                    style={{ 
                                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                                        color: tokens.primaryColor
                                                    }}
                                                >
                                                    {getSiteCategory(site)}
                                                </span>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        onClick={(e) => handleOpenUrl(site.url, e)}
                                                        className="px-3.5 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center text-white shadow-xs cursor-pointer border-0"
                                                        style={{ backgroundColor: tokens.primaryColor }}
                                                        title={isEn ? 'Open website directly' : 'فتح الموقع مباشرة'}
                                                    >
                                                        <span>{isEn ? 'Visit' : 'زيارة'}</span>
                                                    </button>

                                                    <button
                                                        onClick={(e) => handleShareSite(site, e)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 transition-transform opacity-70 hover:opacity-100 cursor-pointer border-0"
                                                        style={{ color: tokens.textColor }}
                                                        title={isEn ? 'Share' : 'مشاركة'}
                                                    >
                                                        <Share2 className="w-3.5 h-3.5" />
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedSite(site);
                                                        }}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 transition-transform opacity-70 hover:opacity-100 cursor-pointer border-0"
                                                        style={{ color: tokens.textColor }}
                                                        title={isEn ? 'View Details' : 'عرض التفاصيل'}
                                                        aria-label={isEn ? 'View Details' : 'عرض التفاصيل'}
                                                    >
                                                        {isEn ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Middle: Name & Description */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-1" style={{ color: tokens.textColor }}>
                                                    {getSiteName(site)}
                                                </h3>
                                                <p className="text-xs opacity-75 line-clamp-2 leading-relaxed" style={{ color: tokens.subtextColor }}>
                                                    {getSiteDescription(site)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredSites.length === 0 && (
                                <div className="text-center py-16 opacity-60">
                                    <Search className="w-10 h-10 mb-3 mx-auto opacity-40" />
                                    <p className="text-sm font-bold">
                                        {isEn ? 'No websites match your search' : 'لا توجد مواقع تطابق بحثك'}
                                    </p>
                                </div>
                            )}

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
                        className="fixed bottom-8 left-1/2 z-[200] bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs text-center whitespace-nowrap border-0"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IslamicSitesPage;
