import React from 'react';
import { Bookmark, ChevronDown, Pause, Home, Share2 } from 'lucide-react';
import { getMadinahThemePalette } from './MadinahFrameSVG';
import {
    normalizeMadinahFrameDesign,
    MadinahHeaderCircleSVG,
} from './madinahFrameDesigns';

interface QuranFooterProps {
    currentTheme: any;
    getToolbarStyle: (id: string, bg: string, text: string, border: string) => React.CSSProperties;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isFloatingMenuOpen: boolean;
    isAnyMenuOpen: boolean;
    hideShareButton?: boolean;
    hideAutoScrollButton?: boolean;
    openModal: (modalId: string) => void;
    menuButtonRef: React.RefObject<HTMLButtonElement>;
    handleBookmarkButtonPointerDown: (e: React.PointerEvent | React.TouchEvent) => void;
    handleBookmarkButtonPointerUp: (e: React.PointerEvent | React.TouchEvent) => void;
    handleBookmarkButtonPointerLeave: () => void;
    handleAutoScrollButtonPointerDown: (e: React.PointerEvent | React.TouchEvent) => void;
    handleAutoScrollButtonPointerUp: (e: React.PointerEvent | React.TouchEvent) => void;
    handleAutoScrollButtonPointerLeave: () => void;
    autoScrollState: { isActive: boolean; isPaused: boolean; elapsedTime: number };
    onBack: () => void;
    isEn?: boolean;
    madinahFrameDesign?: number;
    isCurrentBookmarked?: boolean;
}

const QuranFooter: React.FC<QuranFooterProps> = React.memo(({
    currentTheme,
    getToolbarStyle: _getToolbarStyle,
    setIsFloatingMenuOpen: _setIsFloatingMenuOpen,
    isFloatingMenuOpen: _isFloatingMenuOpen,
    isAnyMenuOpen,
    hideShareButton = false,
    hideAutoScrollButton = false,
    openModal,
    menuButtonRef: _menuButtonRef,
    handleBookmarkButtonPointerDown,
    handleBookmarkButtonPointerUp,
    handleBookmarkButtonPointerLeave,
    handleAutoScrollButtonPointerDown,
    handleAutoScrollButtonPointerUp,
    handleAutoScrollButtonPointerLeave,
    autoScrollState,
    onBack,
    isEn = false,
    madinahFrameDesign,
    isCurrentBookmarked = false
}) => {
    const madinahPalette = getMadinahThemePalette(currentTheme);
    const resolvedFrameDesign = normalizeMadinahFrameDesign(madinahFrameDesign);

    const renderCircleFrame = () => (
        <MadinahHeaderCircleSVG design={resolvedFrameDesign} palette={madinahPalette} />
    );

    return (
        <footer
            id="bottom-bar"
            className={`footer-default flex-none border-0 quran-flat-footer madinah-flat-footer z-50 flex justify-evenly items-center w-full gap-1 ${isAnyMenuOpen ? 'pointer-events-none opacity-50' : ''}`}
            style={{
                backgroundColor: madinahPalette.frameBg,
                color: madinahPalette.bannerText,
                boxShadow: 'none',
                borderTop: `1.5px solid ${madinahPalette.primary}`,
            }}
        >
            {!hideShareButton && (
                <button 
                    id="btn-share" 
                    onClick={() => openModal('share-ayah')} 
                    className={`bottom-bar-button madinah-footer-btn madinah-header-btn relative !w-[42px] !h-[42px] !p-0 flex items-center justify-center flex-shrink-0 aspect-square ${isAnyMenuOpen ? 'pointer-events-none' : 'pointer-events-auto'}`} 
                    style={{ backgroundColor: 'transparent', color: madinahPalette.bannerText, boxShadow: 'none', border: 'none' }}
                    title={isEn ? "Share" : "مشاركة"}
                >
                    {renderCircleFrame()}
                    <Share2 size={18} className="relative z-10" strokeWidth={2.3} />
                </button>
            )}
            <button 
                id="btn-bookmark" 
                onPointerDown={handleBookmarkButtonPointerDown}
                onPointerUp={handleBookmarkButtonPointerUp}
                onPointerLeave={handleBookmarkButtonPointerLeave}
                onTouchStart={handleBookmarkButtonPointerDown}
                onTouchEnd={handleBookmarkButtonPointerUp}
                onTouchCancel={handleBookmarkButtonPointerLeave}
                className="bottom-bar-button madinah-footer-btn madinah-header-btn relative !w-[42px] !h-[42px] !p-0 flex items-center justify-center flex-shrink-0 aspect-square" 
                style={{
                    backgroundColor: 'transparent',
                    color: isCurrentBookmarked ? madinahPalette.gold : madinahPalette.bannerText,
                    boxShadow: 'none',
                    border: 'none',
                    touchAction: 'none'
                }}
                title={isEn ? "Save Bookmark" : "حفظ العلامة"}
            >
                {renderCircleFrame()}
                <Bookmark
                    size={18}
                    strokeWidth={2.2}
                    fill={isCurrentBookmarked ? 'currentColor' : 'none'}
                    className="relative z-10"
                />
            </button>
            {!hideAutoScrollButton && (
                <button 
                    id="btn-autoscroll" 
                    onPointerDown={handleAutoScrollButtonPointerDown}
                    onPointerUp={handleAutoScrollButtonPointerUp}
                    onPointerLeave={handleAutoScrollButtonPointerLeave}
                    onTouchStart={handleAutoScrollButtonPointerDown}
                    onTouchEnd={handleAutoScrollButtonPointerUp}
                    onTouchCancel={handleAutoScrollButtonPointerLeave}
                    className="bottom-bar-button madinah-footer-btn madinah-header-btn relative !w-[42px] !h-[42px] !p-0 flex items-center justify-center flex-shrink-0 aspect-square" 
                    style={{ backgroundColor: 'transparent', color: madinahPalette.bannerText, boxShadow: 'none', border: 'none', touchAction: 'none' }}
                    title={isEn ? "Auto-scroll" : "التمرير التلقائي"}
                >
                    {renderCircleFrame()}
                    {autoScrollState.isActive ? (
                        <Pause size={18} className="relative z-10" strokeWidth={2.3} />
                    ) : (
                        <ChevronDown size={18} className="relative z-10" strokeWidth={2.3} />
                    )}
                </button>
            )}
            <button 
                id="btn-home" 
                onClick={onBack} 
                className="bottom-bar-button madinah-footer-btn madinah-header-btn relative !w-[42px] !h-[42px] !p-0 flex items-center justify-center flex-shrink-0 aspect-square" 
                style={{ backgroundColor: 'transparent', color: madinahPalette.bannerText, boxShadow: 'none', border: 'none' }}
                title={isEn ? "Home" : "الرئيسية"}
            >
                {renderCircleFrame()}
                <Home size={18} className="relative z-10" strokeWidth={2.3} />
            </button>
        </footer>
    );
});

export default QuranFooter;
