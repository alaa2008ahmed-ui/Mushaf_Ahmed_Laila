import React from 'react';

interface VerseSectionProps {
    currentVerse: { text: string; surah: string; number: string | number };
    verseFontSize: number;
    theme: any;
    verseSettings: {
        fontFamily: string;
        bgColor: string;
        textColor: string;
    };
}

const VerseSection: React.FC<VerseSectionProps> = ({
    currentVerse,
    verseFontSize,
    theme,
    verseSettings
}) => {
    const isBlackTheme = theme.bgColor === '#000000';
    const isDarkTheme = theme.isDark;
    const isLightTheme = !isDarkTheme;

    let finalTextColor = verseSettings.textColor;
    if (isDarkTheme) {
        finalTextColor = '#FFFFFF';
    } else if (isLightTheme) {
        finalTextColor = theme.palette?.[0] || theme.textColor;
    }

    const surahTextColor = isBlackTheme 
        ? '#9ca3af' 
        : (theme.palette?.[1] || theme.palette?.[0] || '#8b5cf6');

    return (
        <div 
            className="w-full flex flex-col items-center justify-center select-none touch-manipulation px-0 pt-1"
            dir="rtl"
            style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none',
                backgroundColor: verseSettings.bgColor,
                fontFamily: verseSettings.fontFamily
            }}
        >
            <p className="font-bold leading-normal mb-1 pointer-events-none transition-all duration-75 px-1 text-center" style={{ color: finalTextColor, fontSize: `${verseFontSize}rem` }}>
                {currentVerse.text}
            </p>
            <div className="w-full flex justify-end px-4">
                <p className="font-bold pointer-events-none transition-all duration-75" style={{ color: surahTextColor, fontSize: `${Math.max(0.65, verseFontSize * 0.42)}rem` }}>
                    {`(${currentVerse.surah}: ${currentVerse.number})`}
                </p>
            </div>
        </div>
    );
};

export default VerseSection;
