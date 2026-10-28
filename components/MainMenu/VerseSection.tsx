import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';

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

const VERSE_TRANSLATIONS: Record<string, { enText: string; enSurah: string; enNumber: string }> = {
  "وَقُلْ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا": {
    enText: "And say: 'My Lord, have mercy upon them as they brought me up when I was small.'",
    enSurah: "Surah Al-Isra",
    enNumber: "24"
  },
  "وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ": {
    enText: "And lower to them the wing of humility out of mercy.",
    enSurah: "Surah Al-Isra",
    enNumber: "24"
  },
  "وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ إِحْسَانًا": {
    enText: "And We have enjoined upon man kindness to his parents.",
    enSurah: "Surah Al-Ahqaf",
    enNumber: "15"
  },
  "أَنِ اشْكُرْ لِي وَلِوَالِدَيْكَ إِلَيَّ الْمَصِيرُ": {
    enText: "Be grateful to Me and to your parents; unto Me is the final destination.",
    enSurah: "Surah Luqman",
    enNumber: "14"
  },
  "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا": {
    enText: "And your Lord has decreed that you not worship except Him, and to parents, good treatment.",
    enSurah: "Surah Al-Isra",
    enNumber: "23"
  },
  "إِمَّا يَبْلُغَنَّ عِنْدَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُلْ لَهُمَا أُفٍّ": {
    enText: "Whether one or both of them reach old age with you, say not to them so much as 'uff'.",
    enSurah: "Surah Al-Isra",
    enNumber: "23"
  },
  "وَلَا تَنْهَرْهُمَا وَقُلْ لَهُمَا قَوْلًا كَرِيمًا": {
    enText: "And do not repel them, but speak to them a noble word.",
    enSurah: "Surah Al-Isra",
    enNumber: "23"
  },
  "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ": {
    enText: "Our Lord, forgive me and my parents and the believers the Day the account is established.",
    enSurah: "Surah Ibrahim",
    enNumber: "41"
  }
};

const VerseSection: React.FC<VerseSectionProps> = ({
    currentVerse,
    verseFontSize,
    theme,
    verseSettings
}) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const [enFontSizePx, setEnFontSizePx] = useState<number>(11);

    const isBlackTheme = theme.bgColor === '#000000';
    const isDarkTheme = theme.isDark;
    const isLightTheme = !isDarkTheme;

    const isCustomTextColor = verseSettings.textColor && verseSettings.textColor !== 'transparent' && verseSettings.textColor !== theme.textColor;
    let finalTextColor = isCustomTextColor 
        ? verseSettings.textColor 
        : (isDarkTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.textColor));

    const surahTextColor = isBlackTheme 
        ? '#9ca3af' 
        : (theme.palette?.[1] || theme.palette?.[0] || '#8b5cf6');

    const enData = VERSE_TRANSLATIONS[currentVerse.text];
    const displayText = (isEn && enData) ? enData.enText : currentVerse.text;
    const displayRef = (isEn && enData) 
        ? `(${enData.enSurah}: ${enData.enNumber})` 
        : `(${currentVerse.surah}: ${currentVerse.number})`;

    // Dynamic auto-scaling algorithm to ensure English verse is always in a single line on mobile phones
    const fitEnglishVerseToSingleLine = useCallback(() => {
        if (!isEn || !textRef.current) return;
        const container = containerRef.current;
        const availableWidth = container ? (container.clientWidth - 16) : (window.innerWidth - 32);
        if (availableWidth <= 0) return;

        const el = textRef.current;
        el.style.whiteSpace = 'nowrap';

        // Calculate initial guess based on character length and available width
        const charCount = Math.max(1, displayText.length);
        const approxCharWidthRatio = 0.52;
        let initialSize = (availableWidth / (charCount * approxCharWidthRatio));
        // Cap within reasonable bounds: max 13px down to 6.5px
        let size = Math.min(13, Math.max(6.5, initialSize));
        el.style.fontSize = `${size}px`;

        // Refine down if font metrics cause slight overflow
        while (el.scrollWidth > availableWidth && size > 6) {
            size -= 0.25;
            el.style.fontSize = `${size}px`;
        }

        setEnFontSizePx(size);
    }, [isEn, displayText]);

    useLayoutEffect(() => {
        if (isEn) {
            fitEnglishVerseToSingleLine();
            window.addEventListener('resize', fitEnglishVerseToSingleLine);
            return () => window.removeEventListener('resize', fitEnglishVerseToSingleLine);
        }
    }, [isEn, fitEnglishVerseToSingleLine]);

    return (
        <div 
            ref={containerRef}
            className="w-full flex flex-col items-center justify-center select-none touch-manipulation px-2 pt-1 overflow-hidden"
            dir={dir}
            style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none',
                backgroundColor: verseSettings.bgColor,
                fontFamily: isEn ? 'system-ui, -apple-system, sans-serif' : verseSettings.fontFamily
            }}
        >
            <p 
                ref={textRef}
                className={`font-bold leading-normal mb-0.5 pointer-events-none transition-all duration-75 px-1 text-center w-full ${isEn ? 'whitespace-nowrap overflow-hidden text-ellipsis' : ''}`}
                style={{ 
                    color: finalTextColor, 
                    fontSize: isEn ? `${enFontSizePx}px` : `${verseFontSize}rem`,
                    whiteSpace: isEn ? 'nowrap' : 'normal'
                }}
            >
                {displayText}
            </p>
            <div className={`w-full flex ${isEn ? 'justify-center' : (dir === 'rtl' ? 'justify-end' : 'justify-start')} px-4`}>
                <p 
                    className="font-bold pointer-events-none transition-all duration-75 whitespace-nowrap" 
                    style={{ 
                        color: surahTextColor, 
                        fontSize: isEn ? `${Math.min(10, Math.max(7, enFontSizePx * 0.85))}px` : `${Math.max(0.65, verseFontSize * 0.42)}rem` 
                    }}
                >
                    {displayRef}
                </p>
            </div>
        </div>
    );
};

export default VerseSection;
