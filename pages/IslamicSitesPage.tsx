import React, { useState, useEffect } from 'react';
import { ISLAMIC_SITES_DATA, IslamicSite } from '../data/islamicSitesData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { markPageAsSeen } from '../utils/badgeManager';
import { Search, Copy, Share2, ExternalLink, Check, ZoomIn, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ISLAMIC_SITES_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';
import { getToast3DStyles } from '../utils/toast3DStyles';

interface IslamicSitesPageProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

const IslamicSitesPage: React.FC<IslamicSitesPageProps> = ({ onBack, onNavigate }) => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const { language } = useLanguage();
    const isEn = language === 'en';
    const innerSubBoxClass = `app-inner-3d-box border-0 ${tokens.isDeepBlack ? 'bg-[#18181b]' : 'bg-white dark:bg-[#0F172A]/85'}`;

    const [zoomedSite, setZoomedSite] = useState<IslamicSite | null>(null);
    const [zoomFontSize, setZoomFontSize] = useState<number>(20);
    const [copiedInZoom, setCopiedInZoom] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);
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
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    useEffect(() => {
        if (zoomedSite) {
            document.body.classList.add('zoom-modal-active');
            document.body.setAttribute('data-zoom-modal', 'true');
            window.dispatchEvent(new CustomEvent('modal-state-changed', { detail: { isOpen: true, type: 'zoom' } }));
        } else {
            document.body.classList.remove('zoom-modal-active');
            document.body.removeAttribute('data-zoom-modal');
            window.dispatchEvent(new CustomEvent('modal-state-changed', { detail: { isOpen: false, type: 'zoom' } }));
            stopTTS();
            setCopiedInZoom(false);
        }
        return () => {
            document.body.classList.remove('zoom-modal-active');
            document.body.removeAttribute('data-zoom-modal');
        };
    }, [zoomedSite]);

    useEffect(() => {
        const interceptor = () => {
            if (zoomedSite) {
                setZoomedSite(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedSite]);

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
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage: showToast
        });
    };

    const handleOpenZoom = (site: IslamicSite, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setZoomFontSize(20);
        setZoomedSite(site);
    };

    const handleHomeClick = () => {
        if (zoomedSite) {
            setZoomedSite(null);
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

    const zoomPlainAudioText = zoomedSite
        ? `${getSiteName(zoomedSite)}. ${getSiteDescription(zoomedSite)}`
        : '';
    const isZoomAudioPlaying = Boolean(zoomedSite && playingText === zoomPlainAudioText);

    return (
        <div 
            className="h-[100dvh] flex flex-col overflow-hidden" 
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
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-bold truncate font-cairo">
                                {isEn ? 'Islamic Websites' : 'مواقع إسلامية'}
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
                                <i className="fa-solid fa-circle-question text-lg"></i>
                            </button>
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
            <main className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-4 pt-3 app-scroll-safe">
                {/* 25 Islamic Sites Cards Grid - Embossed 3D Cards */}
                <div
                    key="sites-list"
                    className="space-y-4 max-w-4xl mx-auto pb-2"
                >
                    {/* Modern 3D Search Bar matching Adia */}
                    <div className="mb-6 max-w-4xl mx-auto flex items-center gap-2.5 w-full" dir={isEn ? 'ltr' : 'rtl'}>
                        <div
                            className={`app-page-card border-0 relative flex-1 rounded-2xl ${tokens.isDeepBlack ? 'bg-[#18181b]' : 'bg-white dark:bg-[#1E293B]'} transition-all focus-within:ring-2 focus-within:ring-opacity-40 flex items-center overflow-visible`}
                            style={{ '--tw-ring-color': tokens.primaryColor } as any}
                        >
                            <span
                                className={`app-3d-badge border-0 absolute ${isEn ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none`}
                                style={{
                                    backgroundColor: tokens.isDeepBlack ? 'rgba(255, 255, 255, 0.1)' : hexToRgba(tokens.primaryColor, 0.12),
                                    color: tokens.isDeepBlack ? '#FFFFFF' : tokens.primaryColor,
                                }}
                                aria-hidden="true"
                            >
                                <i className="fa-solid fa-magnifying-glass text-xs"></i>
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isEn ? 'Search Islamic websites...' : 'بحث في المواقع الإسلامية...'}
                                className={`w-full bg-transparent py-3 text-sm sm:text-base border-0 outline-none ${
                                    isEn ? 'pl-12 pr-12 text-left font-sans' : 'pr-12 pl-12 text-right font-cairo'
                                } placeholder-gray-400 dark:placeholder-gray-500`}
                                style={{ color: 'var(--text-color)' }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className={`app-page-card unified-3d-btn border-0 absolute ${isEn ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1E293B] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer`}
                                    aria-label={isEn ? 'Clear search' : 'مسح البحث'}
                                >
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 25 Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-2">
                        {filteredSites.map((site) => (
                            <div
                                key={site.id}
                                onClick={() => handleOpenZoom(site)}
                                className="app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] h-full p-4.5 rounded-[18px] transition-all flex flex-col justify-between gap-3 relative overflow-visible cursor-pointer group"
                            >
                                {/* Top row: Category tag & Actions */}
                                <div className="flex items-center justify-between gap-2 overflow-visible">
                                    <span 
                                        className="app-3d-badge text-[11px] font-bold px-3 py-1 rounded-full border-0 truncate max-w-[150px] sm:max-w-none"
                                        style={{
                                            backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                            color: tokens.primaryColor
                                        }}
                                    >
                                        {getSiteCategory(site)}
                                    </span>

                                    <div className="flex items-center gap-2 shrink-0 overflow-visible">
                                        <button
                                            type="button"
                                            onClick={(e) => handleOpenZoom(site, e)}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isEn ? 'Zoom' : 'تكبير'}
                                            aria-label={isEn ? 'Zoom' : 'تكبير'}
                                        >
                                            <ZoomIn className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => handleShareSite(site, e)}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isEn ? 'Share' : 'مشاركة'}
                                            aria-label={isEn ? 'Share' : 'مشاركة'}
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => handleCopyUrl(site.url, e)}
                                            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                            style={{ color: 'var(--text-color)' }}
                                            title={isEn ? 'Copy Link' : 'نسخ الرابط'}
                                            aria-label={isEn ? 'Copy Link' : 'نسخ الرابط'}
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Middle: Name & Description */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <h3 className={`font-bold text-sm sm:text-base leading-snug line-clamp-1 ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: 'var(--text-color)' }}>
                                        {getSiteName(site)}
                                    </h3>
                                    <p className={`text-xs opacity-75 line-clamp-2 leading-relaxed ${isEn ? 'font-sans' : 'font-cairo'}`} style={{ color: tokens.subtextColor }}>
                                        {getSiteDescription(site)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredSites.length === 0 && (
                        <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] text-center py-12 px-6 opacity-80">
                            <Search className="w-10 h-10 mb-3 mx-auto opacity-40" />
                            <p className="text-sm font-bold font-cairo">
                                {isEn ? 'No websites match your search' : 'لا توجد مواقع تطابق بحثك'}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Zoom Sheet Modal - Cairo Font & Bottom Action Buttons matching Adia/Adhkar */}
            {zoomedSite && (
                <div
                    className="fixed inset-0 bg-black/65 z-[120] flex flex-col justify-end select-none"
                    onClick={() => setZoomedSite(null)}
                    dir={isEn ? 'ltr' : 'rtl'}
                >
                    <div
                        className="app-page-card border-0 w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[88dvh] overflow-hidden relative bg-white dark:bg-[#1E293B]"
                        style={{
                            color: 'var(--text-color)',
                            fontFamily: isEn ? 'sans-serif' : "'Cairo', sans-serif",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Drag Handle & Category Badge */}
                        <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                            <div className="app-3d-drag-handle w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 mb-2" />
                            <div className="w-full flex items-center justify-center">
                                <span
                                    className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold font-cairo"
                                    style={{
                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                        color: tokens.primaryColor,
                                    }}
                                >
                                    {getSiteCategory(zoomedSite)}
                                </span>
                            </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-4 space-y-4">
                            <h2
                                className={`font-bold text-center leading-snug ${isEn ? 'font-sans' : 'font-cairo'}`}
                                style={{
                                    color: tokens.primaryColor,
                                    fontSize: `${zoomFontSize + 4}px`,
                                }}
                            >
                                {getSiteName(zoomedSite)}
                            </h2>

                            <p
                                className={`leading-loose font-medium text-center whitespace-pre-line ${isEn ? 'font-sans' : 'font-cairo'}`}
                                style={{
                                    color: 'var(--text-color)',
                                    fontSize: `${zoomFontSize}px`,
                                }}
                            >
                                {getSiteDescription(zoomedSite)}
                            </p>

                            {/* Features */}
                            {getSiteFeatures(zoomedSite) && getSiteFeatures(zoomedSite).length > 0 && (
                                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                    {getSiteFeatures(zoomedSite).map((feature, fIdx) => (
                                        <span
                                            key={fIdx}
                                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl ${innerSubBoxClass} ${isEn ? 'font-sans' : 'font-cairo'}`}
                                            style={{ color: 'var(--text-color)' }}
                                        >
                                            <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                                            <span>{feature}</span>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Direct Website URL Link */}
                            <div className="flex justify-center pt-1">
                                <a
                                    href={zoomedSite.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`app-3d-badge inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${innerSubBoxClass}`}
                                    style={{ color: tokens.primaryColor }}
                                    dir="ltr"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate max-w-[260px] sm:max-w-sm">{zoomedSite.url}</span>
                                </a>
                            </div>
                        </div>

                        {/* Bottom Action Bar (Audio, Share, Copy URL, Zoom, ChevronDown) */}
                        <div
                            className="px-4 pt-3 pb-2 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 dark:border-white/5 overflow-visible"
                        >
                            {/* Audio Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isZoomAudioPlaying) {
                                        stopTTS();
                                    } else {
                                        playTTS(zoomPlainAudioText, {
                                            isEn,
                                            onToast: (msg) => showToast(msg),
                                        });
                                    }
                                }}
                                className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                style={{
                                    backgroundColor: isZoomAudioPlaying ? hexToRgba(tokens.primaryColor, 0.15) : undefined,
                                    color: isZoomAudioPlaying ? '#EF4444' : tokens.textColor,
                                }}
                                title={isEn ? (isZoomAudioPlaying ? 'Stop audio' : 'Play audio') : (isZoomAudioPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
                            >
                                {isZoomAudioPlaying ? <VolumeX className="w-5 h-5 text-red-500 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
                            </button>

                            {/* Share Button */}
                            <button
                                type="button"
                                onClick={(e) => handleShareSite(zoomedSite, e)}
                                className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                style={{ color: tokens.textColor }}
                                title={isEn ? 'Share Image' : 'مشاركة كصورة'}
                            >
                                <Share2 className="w-5 h-5" />
                            </button>

                            {/* Copy URL Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(zoomedSite.url).then(() => {
                                        setCopiedInZoom(true);
                                        setTimeout(() => setCopiedInZoom(false), 2000);
                                        showToast(isEn ? 'Website link copied successfully' : 'تم نسخ رابط الموقع بنجاح');
                                    }).catch(() => {
                                        showToast(isEn ? 'Failed to copy, please copy manually' : 'تعذر النسخ، يرجى نسخ الرابط يدوياً');
                                    });
                                }}
                                className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                style={{
                                    backgroundColor: copiedInZoom ? '#10B981' : undefined,
                                    color: copiedInZoom ? '#FFFFFF' : tokens.textColor,
                                }}
                                title={isEn ? 'Copy Link' : 'نسخ الرابط'}
                            >
                                {copiedInZoom ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
                            </button>

                            {/* Zoom Font Size Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomFontSize((prev) => (prev >= 32 ? 18 : prev + 4));
                                }}
                                className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                style={{ color: tokens.textColor }}
                                title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>

                            {/* Hide Modal Button */}
                            <button
                                type="button"
                                onClick={() => setZoomedSite(null)}
                                className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                                style={{ color: tokens.textColor }}
                                title={isEn ? 'Hide list' : 'إخفاء القائمة'}
                            >
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
            {toastMessage && (
                <div 
                    className="app-3d-toast fixed left-1/2 -translate-x-1/2 z-[200] max-w-[85vw] w-max px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-center leading-normal break-words border-0 flex items-center justify-center gap-2.5 pointer-events-none"
                    style={{
                        bottom: 'calc(var(--app-bottom-clearance) + 1rem)',
                        ...toast3D.style,
                    }}
                >
                    <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={toast3D.iconStyle}
                    >
                        <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
};

export default IslamicSitesPage;
