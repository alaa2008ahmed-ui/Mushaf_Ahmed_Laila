import React, { useRef } from 'react';
import { getAyahCountText, SURAH_INFO, SURAH_NAMES_EN, SURAH_NAMES_AR, isDarkQuranTheme } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { getMadinahThemePalette } from './MadinahFrameSVG';
import { IslamicSurahHeaderView, normalizeIslamicSurahDesign } from './surahHeaderDesigns';

interface SurahHeaderProps {
    surahNumber: number;
    surahName: string;
    surahType?: string;
    ayahCount?: number;
    currentTheme?: any;
    design?: number;
    onLongPress?: () => void;
    compact?: boolean;
    isTranslationMode?: boolean;
    isBilingualMode?: boolean;
}

const SurahHeader: React.FC<SurahHeaderProps> = ({
    surahNumber,
    surahName,
    surahType,
    ayahCount,
    currentTheme,
    design = 1,
    onLongPress,
    compact = false,
    isTranslationMode = false,
    isBilingualMode = false
}) => {
    const { language } = useLanguage();
    const isEn = (language === 'en' || isTranslationMode) && !isBilingualMode;
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const touchStartPos = useRef<{ x: number; y: number } | null>(null);
    const lastTouchTimeRef = useRef<number>(0);

    const clearLongPressTimer = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        lastTouchTimeRef.current = Date.now();
        clearLongPressTimer();
        if (e.touches && e.touches[0]) {
            touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        if (onLongPress) {
            longPressTimer.current = setTimeout(() => {
                longPressTimer.current = null;
                onLongPress();
            }, 600);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartPos.current || !e.touches || !e.touches[0]) {
            clearLongPressTimer();
            return;
        }
        const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
        const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
        if (dx > 10 || dy > 10) {
            clearLongPressTimer();
        }
    };

    const handleTouchEnd = () => {
        touchStartPos.current = null;
        clearLongPressTimer();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0 || Date.now() - lastTouchTimeRef.current < 800) return;
        clearLongPressTimer();
        if (onLongPress) {
            longPressTimer.current = setTimeout(() => {
                longPressTimer.current = null;
                onLongPress();
            }, 600);
        }
    };

    const handleMouseUp = () => {
        clearLongPressTimer();
    };

    const resolvedDesign = normalizeIslamicSurahDesign(design);
    const palette = getMadinahThemePalette(currentTheme);
    const isDark = isDarkQuranTheme(currentTheme);

    const stripArabicDiacritics = (str: string) =>
        str
            .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
            .replace(/\u0671/g, 'ا')
            .replace(/\s+/g, ' ')
            .trim();

    // Ensure "Surah" is not repeated and remove all diacritics for Arabic display
    const strippedInputName = stripArabicDiacritics((surahName || '').replace(/سورة|سُورَةُ|سُورَة/g, ''));
    const plainFallbackName = surahNumber > 0 ? stripArabicDiacritics(SURAH_NAMES_AR[surahNumber - 1] || '') : '';
    const cleanSurahName = strippedInputName || plainFallbackName;
    const englishSurahName = SURAH_NAMES_EN[surahNumber - 1] || cleanSurahName;

    const fullSurahName = (isEn || isBilingualMode)
        ? `Surah ${englishSurahName}`
        : `سورة ${cleanSurahName}`;

    const safeSurahType = surahType || (surahNumber > 0 && SURAH_INFO[surahNumber]?.type) || 'مكية';
    const rawSurahType = safeSurahType.includes('مدن') || safeSurahType.includes('Medin') ? 'Medinan' : 'Meccan';
    const displaySurahType = (isEn || isBilingualMode)
        ? rawSurahType
        : stripArabicDiacritics(safeSurahType);

    const safeAyahCount = typeof ayahCount === 'number' ? ayahCount : (SURAH_INFO[surahNumber]?.ayahs || 7);
    const displayAyahCount = (isEn || isBilingualMode)
        ? `${safeAyahCount} Verses`
        : getAyahCountText(safeAyahCount);

    const quranFont = isEn ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : "var(--font-cairo, 'Cairo'), sans-serif";
    const hafsFont = isEn ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : "var(--font-cairo, 'Cairo'), sans-serif";

    return (
        <div id="surah-header-container" data-tour="surah-header" className={`surah-header-container surah-header surah-header-container-wrapper w-full block ${compact ? 'px-0 pt-1 pb-0' : 'px-0 pt-2 pb-0'}`}
             onMouseDown={handleMouseDown}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}
             onTouchCancel={handleTouchEnd}
             onContextMenu={(e) => { if (onLongPress) e.preventDefault(); }}>
            <IslamicSurahHeaderView
                design={resolvedDesign}
                palette={palette}
                isDark={isDark}
                fullSurahName={fullSurahName}
                displayAyahCount={displayAyahCount}
                displaySurahType={displaySurahType}
                quranFont={quranFont}
                hafsFont={hafsFont}
                compact={compact}
                isEnglishDisplay={isEn || isBilingualMode}
            />
        </div>
    );
};

export default SurahHeader;
