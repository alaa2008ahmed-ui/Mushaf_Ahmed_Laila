import React from 'react';
import { Menu, Bookmark, ChevronDown, Pause, Home, Share2 } from 'lucide-react';
import FloatingMenu from './FloatingMenu';

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
}

const QuranFooter: React.FC<QuranFooterProps> = React.memo(({
    currentTheme,
    getToolbarStyle,
    setIsFloatingMenuOpen,
    isFloatingMenuOpen,
    isAnyMenuOpen,
    hideShareButton = false,
    hideAutoScrollButton = false,
    openModal,
    menuButtonRef,
    handleBookmarkButtonPointerDown,
    handleBookmarkButtonPointerUp,
    handleBookmarkButtonPointerLeave,
    handleAutoScrollButtonPointerDown,
    handleAutoScrollButtonPointerUp,
    handleAutoScrollButtonPointerLeave,
    autoScrollState,
    onBack
}) => {
    return (
        <footer id="bottom-bar" className={`footer-default flex-none border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-evenly items-center py-1 w-full ${isAnyMenuOpen ? 'pointer-events-none opacity-50' : ''}`} style={getToolbarStyle('bottom-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
            {!hideShareButton && (
                <button 
                    id="btn-share" 
                    onClick={() => openModal('share-ayah')} 
                    className={`bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center mx-1 shadow-sm ${isAnyMenuOpen ? 'pointer-events-none' : 'pointer-events-auto'}`} 
                    style={getToolbarStyle('btn-share', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBorder || currentTheme.btnBg)}
                    title="مشاركة"
                >
                    <Share2 size={24} />
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
                className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center mx-1 shadow-sm" 
                style={{...getToolbarStyle('btn-bookmark', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBorder || currentTheme.btnBg), touchAction: 'none'}}
                title="حفظ العلامة"
            >
                <Bookmark size={24} />
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
                    className="bottom-bar-button btn-purple !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center mx-1 shadow-sm" 
                    style={{...getToolbarStyle('btn-autoscroll', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBorder || currentTheme.btnBg), touchAction: 'none'}}
                    title="التمرير التلقائي"
                >
                    {autoScrollState.isActive ? <Pause size={24} /> : <ChevronDown size={24} />}
                </button>
            )}
            <button 
                id="btn-home" 
                onClick={onBack} 
                className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center mx-1 shadow-sm" 
                style={getToolbarStyle('btn-home', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBorder || currentTheme.btnBg)}
                title="الرئيسية"
            >
                <Home size={24} />
            </button>
        </footer>
    );
});

export default QuranFooter;
