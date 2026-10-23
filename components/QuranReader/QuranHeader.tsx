import React from 'react';
import { toArabic, SURAH_NAMES_EN } from './constants';
import { Menu } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
    readingMode: 'mushaf' | 'tafseer' | 'meanings' | 'translation' | 'bilingual';
    setReadingMode: (mode: 'mushaf' | 'tafseer' | 'meanings' | 'translation' | 'bilingual') => void;
    isWirdMode?: boolean;
    isMemorizationMode?: boolean;
    memorizationSettings?: any;
    handleMushafTypeSelect: (type: string) => void;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isFloatingMenuOpen: boolean;
    isAnyMenuOpen: boolean;
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

        let observer: ResizeObserver | null = null;
        if (containerRef.current && typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(debouncedAdjust);
            observer.observe(containerRef.current);
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(debouncedAdjust).catch(() => {});
        }

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', debouncedAdjust);
            if (observer) {
                observer.disconnect();
            }
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
    readingMode,
    setReadingMode,
    isWirdMode = false,
    isMemorizationMode = false,
    memorizationSettings,
    setIsFloatingMenuOpen,
    isFloatingMenuOpen,
    isAnyMenuOpen
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const enSurahName = SURAH_NAMES_EN[currentAyah.s - 1] || surahName;

    return (
        <header id="header" className={`header-default flex-none z-50 flex items-center justify-between border shadow-xl w-full gap-1 ${isAnyMenuOpen ? 'pointer-events-none opacity-50' : ''}`} style={getToolbarStyle('top-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
            <div className="flex items-center">
                <button 
                    id="btn-menu-header" 
                    onClick={() => (setIsFloatingMenuOpen as any)()}
                    className={`top-bar-text-button !rounded-full !w-10 !h-10 !p-0 flex items-center justify-center flex-shrink-0 aspect-square ${isFloatingMenuOpen ? 'pointer-events-auto opacity-100' : (isAnyMenuOpen ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100')}`} 
                    style={getToolbarStyle('btn-menu', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBorder || currentTheme.btnBg)}
                    title={isEn ? "Menu" : "القائمة"}
                >
                    <Menu size={20} />
                </button>
                <div className="mr-1">
                </div>
            </div>
            <button 
                id="surah-name-header" 
                onClick={() => openModal('surah-modal')}
                className="top-bar-text-button flex items-center justify-center leading-none !pt-0 flex-1 min-w-0 mx-0.5 !px-1" 
                style={getToolbarStyle('surah', currentTheme.barBg, currentTheme.barText, currentTheme.btnBorder || currentTheme.barBorder)}
            >
                <AutoFitText>
                    {readingMode === 'bilingual' || readingMode === 'translation' ? (
                        isMemorizationMode && memorizationSettings ? (
                            <>{currentAyah.s} - Surah {enSurahName} - Ayahs {memorizationSettings.fromAyah}-{memorizationSettings.toAyah} - Juz {juz}</>
                        ) : (
                            <>{currentAyah.s} - Surah {enSurahName} - Ayah {currentAyah.a} - Juz {juz}</>
                        )
                    ) : isEn ? (
                        isMemorizationMode && memorizationSettings ? (
                            <>{currentAyah.s} - Surah {enSurahName} - Ayahs {memorizationSettings.fromAyah}-{memorizationSettings.toAyah} - Juz {juz}</>
                        ) : (
                            <>{currentAyah.s} - Surah {enSurahName} - Ayah {currentAyah.a} - Juz {juz}</>
                        )
                    ) : (
                        isMemorizationMode && memorizationSettings ? (
                            <>{toArabic(currentAyah.s)} - سورة {surahName} - الآيات {toArabic(memorizationSettings.fromAyah)} - {toArabic(memorizationSettings.toAyah)} - جزء {toArabic(juz)}</>
                        ) : (
                            <>{toArabic(currentAyah.s)} - سورة {surahName} - ايه {toArabic(currentAyah.a)} - جزء {toArabic(juz)}</>
                        )
                    )}
                </AutoFitText>
            </button>
            {isPageInputActive ? (
                <input
                    ref={pageInputRef}
                    id="header-page"
                    type="tel"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    onKeyDown={handlePageInputKeyDown}
                    className="top-bar-text-button !rounded-lg !min-w-[46px] !w-[46px] !h-[36px] !pt-0 !pb-[3px] !px-0 text-center flex-shrink-0 !font-black !text-lg flex items-center justify-center leading-none"
                    style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.btnBorder || currentTheme.barBorder)}
                    placeholder={isEn ? `${page}` : `${toArabic(page)}`}
                />
            ) : (
                <button 
                    id="header-page" 
                    onClick={handlePageButtonClick}
                    className="top-bar-text-button !rounded-lg !min-w-[46px] !w-[46px] !h-[36px] !pt-0 !pb-[3px] !px-0 flex-shrink-0 !font-black !text-lg flex items-center justify-center leading-none" 
                    style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.btnBorder || currentTheme.barBorder)}
                >
                    {isEn ? page : toArabic(page)}
                </button>
            )}
            
            <div className="relative flex-shrink-0">
                <button 
                    id="btn-play" 
                    onPointerDown={handlePlayButtonPointerDown}
                    onPointerUp={handlePlayButtonPointerUp}
                    onPointerLeave={handlePlayButtonPointerLeave}
                    className="top-bar-text-button !rounded-full !w-10 !h-10 !p-0 flex items-center justify-center flex-shrink-0 aspect-square" 
                    style={{...getToolbarStyle('audio', currentTheme.barBg, currentTheme.barText, currentTheme.btnBorder || currentTheme.barBorder), touchAction: 'none'}}
                >
                    {renderPlayButtonIcon()}
                </button>
                {reciterToast.show && (
                    <div className={`absolute top-full ${isEn ? 'right-0' : 'left-0'} ltr:right-0 rtl:left-0 mt-2 px-3 py-1 text-xs rounded-lg shadow-lg whitespace-nowrap z-[100] animate-fadeIn font-bold pointer-events-none modal-skinned toast-element max-w-[calc(100vw-32px)] truncate`}>
                        {reciterToast.name}
                    </div>
                )}
            </div>
        </header>
    );
});

export default QuranHeader;
