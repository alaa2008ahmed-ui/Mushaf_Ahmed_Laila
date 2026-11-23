import React from 'react';
import { toArabic, SURAH_NAMES_EN } from './constants';
import { Menu, Bookmark } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getMadinahThemePalette } from './MadinahFrameSVG';
import {
    normalizeMadinahFrameDesign,
    MadinahHeaderCircleSVG,
    MadinahHeaderBadgeSVG,
    MadinahHeaderSurahFrameSVG,
} from './madinahFrameDesigns';

interface QuranHeaderProps {
    isPageInputActive: boolean;
    pageInputRef: React.RefObject<HTMLInputElement>;
    pageInput: string;
    handlePageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePageInputBlur: () => void;
    handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handlePageButtonClick: () => void;
    page: number;
    surahName: string;
    currentAyah: { s: number; a: number };
    juz: number;
    openModal: (modalId: string) => void;
    currentTheme: any;
    getToolbarStyle: (id: string, bg: string, text: string, border: string) => React.CSSProperties;
    handlePlayButtonPointerDown: (e: React.PointerEvent) => void;
    handlePlayButtonPointerUp: (e: React.PointerEvent) => void;
    handlePlayButtonPointerLeave: () => void;
    renderPlayButtonIcon: () => React.ReactNode;
    reciterToast: { show: boolean; name: string };
    isWirdMode?: boolean;
    isMemorizationMode?: boolean;
    memorizationSettings?: any;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isFloatingMenuOpen: boolean;
    isAnyMenuOpen: boolean;
    isMadinahMode?: boolean;
    madinahFrameDesign?: number;
    handleBookmarkButtonPointerDown?: (e: React.PointerEvent | React.TouchEvent) => void;
    handleBookmarkButtonPointerUp?: (e: React.PointerEvent | React.TouchEvent) => void;
    handleBookmarkButtonPointerLeave?: () => void;
    isCurrentBookmarked?: boolean;
}

const AutoFitText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const textRef = React.useRef<HTMLSpanElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        let rafId: number;
        const adjustFontSize = () => {
            const textEl = textRef.current;
            const containerEl = containerRef.current;
            if (!textEl || !containerEl) return;

            // Available width inside container with 4px safety buffer
            const availableWidth = containerEl.clientWidth - 4;
            if (availableWidth <= 10) {
                rafId = requestAnimationFrame(adjustFontSize);
                return;
            }

            // Disable transition and reset transforms before measuring
            textEl.style.transition = 'none';
            textEl.style.transform = 'none';
            (textEl.style as any).webkitTransform = 'none';

            let low = 7.0;
            let high = 17.0;
            let best = 7.0;

            // Binary search to find optimal font size that fits without overflow
            while (high - low >= 0.25) {
                const mid = Math.round(((low + high) / 2) * 4) / 4;
                textEl.style.fontSize = `${mid}px`;
                if (textEl.scrollWidth <= availableWidth) {
                    best = mid;
                    low = mid + 0.25;
                } else {
                    high = mid - 0.25;
                }
            }

            textEl.style.fontSize = `${best}px`;

            // If even at minimum font size it still slightly overflows, scale smoothly to ensure zero clipping
            if (textEl.scrollWidth > availableWidth && availableWidth > 0) {
                const scale = availableWidth / textEl.scrollWidth;
                textEl.style.transform = `scale(${scale})`;
                textEl.style.transformOrigin = 'center center';
            } else {
                textEl.style.transform = 'none';
                (textEl.style as any).webkitTransform = 'none';
            }
        };

        const debouncedAdjust = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(adjustFontSize);
        };

        debouncedAdjust();
        window.addEventListener('resize', debouncedAdjust);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(debouncedAdjust).catch(() => {});
        }

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', debouncedAdjust);
        };
    }, [children]);

    return (
        <div ref={containerRef} className="flex items-center justify-center w-full h-full overflow-hidden px-0.5">
            <span 
                ref={textRef} 
                className="whitespace-nowrap font-bold inline-block text-center select-none" 
                style={{ fontSize: '13px', transition: 'none' }}
            >
                {children}
            </span>
        </div>
    );
};

const QuranHeader: React.FC<QuranHeaderProps> = React.memo(({
    isPageInputActive,
    pageInputRef,
    pageInput,
    handlePageInputChange,
    handlePageInputBlur,
    handlePageInputKeyDown,
    handlePageButtonClick,
    page,
    surahName,
    currentAyah,
    juz,
    openModal,
    currentTheme,
    getToolbarStyle,
    handlePlayButtonPointerDown,
    handlePlayButtonPointerUp,
    handlePlayButtonPointerLeave,
    renderPlayButtonIcon,
    reciterToast,
    isWirdMode = false,
    isMemorizationMode = false,
    memorizationSettings,
    setIsFloatingMenuOpen,
    isFloatingMenuOpen,
    isAnyMenuOpen,
    isMadinahMode = false,
    madinahFrameDesign,
    handleBookmarkButtonPointerDown,
    handleBookmarkButtonPointerUp,
    handleBookmarkButtonPointerLeave,
    isCurrentBookmarked = false
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const enSurahName = SURAH_NAMES_EN[currentAyah.s - 1] || surahName;
    const madinahPalette = getMadinahThemePalette(currentTheme);
    const resolvedFrameDesign = normalizeMadinahFrameDesign(madinahFrameDesign);

    const renderMadinahCircleFrame = () => (
        <MadinahHeaderCircleSVG design={resolvedFrameDesign} palette={madinahPalette} />
    );

    const renderMadinahPageFrame = () => (
        <MadinahHeaderBadgeSVG design={resolvedFrameDesign} palette={madinahPalette} />
    );

    const renderMadinahSurahBannerFrame = () => (
        <MadinahHeaderSurahFrameSVG design={resolvedFrameDesign} palette={madinahPalette} />
    );

    const pageElement = isPageInputActive ? (
        <input
            ref={pageInputRef}
            id="header-page"
            type="tel"
            value={pageInput}
            onChange={handlePageInputChange}
            onBlur={handlePageInputBlur}
            onKeyDown={handlePageInputKeyDown}
            className="top-bar-text-button madinah-header-btn madinah-header-page-control relative z-10 w-full h-full !p-0 text-center !font-black !text-sm flex items-center justify-center leading-none"
            style={{ backgroundColor: 'transparent', color: madinahPalette.bannerText, border: 'none', boxShadow: 'none', fontFamily: 'inherit' }}
            placeholder={isEn ? `${page}` : `${toArabic(page)}`}
        />
    ) : (
        <button 
            id="header-page" 
            onClick={handlePageButtonClick}
            className="top-bar-text-button madinah-header-btn madinah-header-page-control relative z-10 w-full h-full !p-0 flex-shrink-0 !font-black !text-sm flex items-center justify-center leading-none"
            style={{ backgroundColor: 'transparent', color: madinahPalette.bannerText, border: 'none', boxShadow: 'none', fontFamily: 'inherit' }}
        >
            {isEn ? page : toArabic(page)}
        </button>
    );

    return (
        <header
            id="header"
            className={`header-default quran-reader-header flex-none z-50 flex items-center justify-between madinah-flat-header w-full gap-1 border-0 ${isAnyMenuOpen ? 'pointer-events-none opacity-50' : ''}`}
            style={{
                backgroundColor: madinahPalette.frameBg,
                color: madinahPalette.bannerText,
                boxShadow: 'none',
                borderBottom: `1.5px solid ${madinahPalette.primary}`,
            }}
        >
            <div className="flex items-center">
                <button 
                    id="btn-menu-header" 
                    onClick={() => (setIsFloatingMenuOpen as any)()}
                    className={`top-bar-text-button madinah-header-btn relative !w-[42px] !h-[42px] !p-0 flex items-center justify-center flex-shrink-0 aspect-square ${isFloatingMenuOpen ? 'pointer-events-auto opacity-100' : (isAnyMenuOpen ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100')}`} 
                    style={{ backgroundColor: 'transparent', color: madinahPalette.bannerText, boxShadow: 'none' }}
                    title={isEn ? "Menu" : "القائمة"}
                >
                    {renderMadinahCircleFrame()}
                    <Menu size={18} className="relative z-10" strokeWidth={2.3} />
                </button>
                <div className="mr-1">
                </div>
            </div>
            <button 
                id="surah-name-header" 
                onClick={() => openModal('surah-modal')}
                className="top-bar-text-button madinah-header-btn madinah-header-surah-btn relative flex items-center justify-center leading-none !pt-0 !pb-0 flex-1 min-w-0 mx-0.5 !px-4 !h-[38px]"
                style={{ backgroundColor: 'transparent', color: madinahPalette.bannerText, boxShadow: 'none' }}
            >
                {renderMadinahSurahBannerFrame()}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <AutoFitText>
                        {isEn ? (
                            isMemorizationMode && memorizationSettings ? (
                                <>{currentAyah.s} - Surah {enSurahName.replace(/^Surah\s+/i, '')} - Ayahs {memorizationSettings.fromAyah}-{memorizationSettings.toAyah} - Juz {juz}</>
                            ) : (
                                <>{currentAyah.s} - Surah {enSurahName.replace(/^Surah\s+/i, '')} - Ayah {currentAyah.a} - Juz {juz}</>
                            )
                        ) : (
                            isMemorizationMode && memorizationSettings ? (
                                <>{toArabic(currentAyah.s)} - سورة {surahName} - الآيات {toArabic(memorizationSettings.fromAyah)} - {toArabic(memorizationSettings.toAyah)} - جزء {toArabic(juz)}</>
                            ) : (
                                <>{toArabic(currentAyah.s)} - سورة {surahName} - ايه {toArabic(currentAyah.a)} - جزء {toArabic(juz)}</>
                            )
                        )}
                    </AutoFitText>
                </div>
            </button>
            {isMadinahMode ? (
                <div className="madinah-header-page-wrap relative flex-shrink-0 w-[50px] h-[38px] flex items-center justify-center">
                    {renderMadinahPageFrame()}
                    <button
                        id="madinah-header-bookmark-btn"
                        type="button"
                        onPointerDown={handleBookmarkButtonPointerDown}
                        onPointerUp={handleBookmarkButtonPointerUp}
                        onPointerLeave={handleBookmarkButtonPointerLeave}
                        onTouchStart={handleBookmarkButtonPointerDown}
                        onTouchEnd={handleBookmarkButtonPointerUp}
                        onTouchCancel={handleBookmarkButtonPointerLeave}
                        onContextMenu={(e) => e.preventDefault()}
                        className="top-bar-text-button madinah-header-btn madinah-header-page-control relative z-10 w-full h-full !p-0 flex-shrink-0 flex items-center justify-center leading-none"
                        style={{
                            backgroundColor: 'transparent',
                            color: isCurrentBookmarked ? madinahPalette.gold : madinahPalette.bannerText,
                            border: 'none',
                            boxShadow: 'none',
                            touchAction: 'none',
                            userSelect: 'none'
                        }}
                        title={isEn ? "Save Bookmark (Long press for saved bookmarks)" : "حفظ المرجع (ضغطة مطولة لقائمة الإشارات المحفوظة)"}
                        aria-label={isEn ? "Save Bookmark" : "حفظ المرجع"}
                    >
                        <Bookmark
                            size={18}
                            strokeWidth={2.2}
                            fill={isCurrentBookmarked ? 'currentColor' : 'none'}
                            className="relative z-10"
                        />
                    </button>
                </div>
            ) : (
                <div className="madinah-header-page-wrap relative flex-shrink-0 w-[50px] h-[38px] flex items-center justify-center">
                    {renderMadinahPageFrame()}
                    {pageElement}
                </div>
            )}
            
            <div className="relative flex-shrink-0">
                <button 
                    id="btn-play" 
                    onPointerDown={handlePlayButtonPointerDown}
                    onPointerUp={handlePlayButtonPointerUp}
                    onPointerLeave={handlePlayButtonPointerLeave}
                    className="top-bar-text-button madinah-header-btn relative !w-[42px] !h-[42px] !p-0 flex items-center justify-center flex-shrink-0 aspect-square" 
                    style={{ backgroundColor: 'transparent', color: madinahPalette.bannerText, boxShadow: 'none', touchAction: 'none' }}
                >
                    {renderMadinahCircleFrame()}
                    <span className="relative z-10 flex items-center justify-center">
                        {renderPlayButtonIcon()}
                    </span>
                </button>
                {reciterToast.show && (
                    <div
                        className={`app-3d-toast absolute top-full ${isEn ? 'right-0' : 'left-0'} ltr:right-0 rtl:left-0 mt-2 px-3.5 py-1.5 text-xs rounded-full whitespace-nowrap z-[100] animate-fadeIn font-bold pointer-events-none toast-element max-w-[calc(100vw-32px)] truncate`}
                        style={{
                            backgroundColor: currentTheme?.id === 'gold' ? '#EAB308' : currentTheme?.id === 'deep_black' ? '#111111' : (currentTheme?.accent || currentTheme?.modalBg || '#1e293b'),
                            color: currentTheme?.id === 'gold' ? '#000000' : currentTheme?.id === 'deep_black' ? '#ffffff' : (currentTheme?.accent ? (currentTheme?.accentText || '#ffffff') : (currentTheme?.modalText || '#ffffff'))
                        }}
                    >
                        {reciterToast.name}
                    </div>
                )}
            </div>
        </header>
    );
});

export default QuranHeader;
