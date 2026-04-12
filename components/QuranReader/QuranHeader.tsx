import React from 'react';
import { toArabic } from './constants';
import { Menu } from 'lucide-react';

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
    readingMode: 'mushaf' | 'tafseer' | 'meanings' | 'translation';
    setReadingMode: (mode: 'mushaf' | 'tafseer' | 'meanings' | 'translation') => void;
    isWirdMode?: boolean;
    isMemorizationMode?: boolean;
    memorizationSettings?: any;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isFloatingMenuOpen: boolean;
    isAnyMenuOpen: boolean;
}

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
    const [isModeMenuOpen, setIsModeMenuOpen] = React.useState(false);

    return (
        <header id="header" className={`header-default flex-none z-50 flex items-center justify-between border shadow-xl w-full gap-1 ${isAnyMenuOpen ? 'pointer-events-none opacity-50' : ''}`} style={getToolbarStyle('top-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
            <button 
                id="btn-menu-header" 
                onClick={() => (setIsFloatingMenuOpen as any)()}
                className={`top-bar-text-button !rounded-full !w-10 !h-10 !p-0 flex items-center justify-center flex-shrink-0 aspect-square ${isFloatingMenuOpen ? 'pointer-events-auto opacity-100' : (isAnyMenuOpen ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100')}`} 
                style={getToolbarStyle('btn-menu', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBorder || currentTheme.btnBg)}
                title="القائمة"
            >
                <Menu size={20} />
            </button>
            <button 
                id="surah-name-header" 
                onClick={() => openModal('surah-modal')}
                className="top-bar-text-button flex items-center justify-center leading-none !pt-0 flex-1 min-w-0 mx-0.5 !px-1" 
                style={getToolbarStyle('surah', currentTheme.barBg, currentTheme.barText, currentTheme.btnBorder || currentTheme.barBorder)}
            >
                <span className="flex items-center justify-center leading-none whitespace-nowrap overflow-hidden w-full font-bold" style={{ fontSize: 'clamp(12px, 4.2vw, 20px)' }}>
                    {isMemorizationMode && memorizationSettings ? (
                        <>{toArabic(currentAyah.s)} - سورة {surahName} - الآيات {toArabic(memorizationSettings.fromAyah)} - {toArabic(memorizationSettings.toAyah)} - جزء {toArabic(juz)}</>
                    ) : (
                        <>{toArabic(currentAyah.s)} - سورة {surahName} - ايه {toArabic(currentAyah.a)} - جزء {toArabic(juz)}</>
                    )}
                </span>
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
                    placeholder={`${toArabic(page)}`}
                />
            ) : (
                <button 
                    id="header-page" 
                    onClick={handlePageButtonClick}
                    className="top-bar-text-button !rounded-lg !min-w-[46px] !w-[46px] !h-[36px] !pt-0 !pb-[3px] !px-0 flex-shrink-0 !font-black !text-lg flex items-center justify-center leading-none" 
                    style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.btnBorder || currentTheme.barBorder)}
                >
                    {toArabic(page)}
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
                    <div className="absolute top-full left-0 mt-2 px-3 py-1 text-xs rounded-lg shadow-lg whitespace-nowrap z-[100] animate-fadeIn font-bold pointer-events-none modal-skinned toast-element">
                        {reciterToast.name}
                    </div>
                )}
            </div>
        </header>
    );
});

export default QuranHeader;
