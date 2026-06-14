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

    return (
        <div 
            className="text-center select-none touch-manipulation mx-4 p-2 pt-2 rounded-3xl"
            dir="rtl"
            style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none',
                backgroundColor: verseSettings.bgColor,
                fontFamily: verseSettings.fontFamily
            }}
        >
            <p className="font-bold leading-tight mb-1 pointer-events-none transition-all duration-75" style={{ color: finalTextColor, fontSize: `${verseFontSize}rem` }}>
                {currentVerse.text}
            </p>
            <p className="text-[12px] font-bold text-left pl-8 pointer-events-none transition-all duration-75 opacity-70" style={{ color: finalTextColor, fontSize: `${Math.max(0.75, verseFontSize * 0.6)}rem` }}>
                {`(${currentVerse.surah}: ${currentVerse.number})`}
            </p>
        </div>
    );
};

export default VerseSection;
