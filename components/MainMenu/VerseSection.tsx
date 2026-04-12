import React, { useRef } from 'react';

interface VerseSectionProps {
    currentVerse: { text: string; surah: string; number: number };
    verseFontSize: number;
    setVerseFontSize: (size: number) => void;
    setIsCustomizationOpen: (isOpen: boolean) => void;
    theme: any;
    themeKey: string;
    verseSettings: {
        fontFamily: string;
        bgColor: string;
        textColor: string;
    };
}

const VerseSection: React.FC<VerseSectionProps> = ({
    currentVerse,
    verseFontSize,
    setVerseFontSize,
    setIsCustomizationOpen,
    theme,
    themeKey,
    verseSettings
}) => {
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = useRef(false);
    const initialDistanceRef = useRef<number | null>(null);
    const initialFontSizeRef = useRef<number>(1.25);

    const startPress = (e: React.SyntheticEvent) => {
        isLongPressRef.current = false;
        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            setIsCustomizationOpen(true);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    };

    const cancelPress = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            cancelPress();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            initialDistanceRef.current = dist;
            initialFontSizeRef.current = verseFontSize;
        } else if (e.touches.length === 1) {
            startPress(e);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialDistanceRef.current !== null) {
            cancelPress();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            
            const scale = dist / initialDistanceRef.current;
            let newSize = initialFontSizeRef.current * scale;
            
            newSize = Math.max(0.8, Math.min(newSize, 3.0));
            setVerseFontSize(newSize);
        } else {
            cancelPress();
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length < 2) {
            if (initialDistanceRef.current !== null) {
                localStorage.setItem('mainMenuVerseFontSize', verseFontSize.toString());
                initialDistanceRef.current = null;
            }
        }
        cancelPress();
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isLongPressRef.current) {
            setIsCustomizationOpen(true);
        }
    };

    return (
        <div 
            className="text-center pt-12 select-none cursor-pointer active:scale-95 transition-all touch-manipulation mx-4 p-4 rounded-3xl"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onContextMenu={handleContextMenu}
            style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none',
                backgroundColor: verseSettings.bgColor,
                fontFamily: verseSettings.fontFamily
            }}
        >
            <p className="font-bold leading-tight mb-1 pointer-events-none transition-all duration-75" style={{ color: verseSettings.textColor === theme.textColor && theme.textColor === '#000000' ? theme.palette[0] : verseSettings.textColor, fontSize: `${verseFontSize}rem` }}>
                {currentVerse.text}
            </p>
            <p className="text-[12px] font-bold text-left pl-8 pointer-events-none transition-all duration-75 opacity-70" style={{ color: verseSettings.textColor === theme.textColor && theme.textColor === '#000000' ? theme.palette[1] : verseSettings.textColor, fontSize: `${Math.max(0.75, verseFontSize * 0.6)}rem` }}>
                {`(${currentVerse.surah}: ${currentVerse.number})`}
            </p>
        </div>
    );
};

export default VerseSection;
