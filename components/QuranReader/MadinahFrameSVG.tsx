import React, { useId } from 'react';
import { ChevronDown, Pause } from 'lucide-react';
import { isDarkQuranTheme, toArabic } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import {
    normalizeMadinahFrameDesign,
    MadinahVerticalPatternContent,
    MadinahHorizontalPatternContent,
    MadinahCornerRosetteSVG,
    MadinahBottomBadgeSVG,
    MadinahHeaderCircleSVG,
} from './madinahFrameDesigns';

export interface MadinahThemePalette {
    frameBg: string;
    primary: string;
    secondary: string;
    deep: string;
    gold: string;
    cartoucheFill: string;
    bannerText: string;
    metaText: string;
}

const parseHex = (hex: string): [number, number, number] | null => {
    if (typeof hex !== 'string') return null;
    const clean = hex.trim().replace(/^#/, '');
    if (clean.length === 3) {
        const r = parseInt(clean[0] + clean[0], 16);
        const g = parseInt(clean[1] + clean[1], 16);
        const b = parseInt(clean[2] + clean[2], 16);
        return [r, g, b];
    }
    if (clean.length === 6) {
        const r = parseInt(clean.slice(0, 2), 16);
        const g = parseInt(clean.slice(2, 4), 16);
        const b = parseInt(clean.slice(4, 6), 16);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
        return [r, g, b];
    }
    return null;
};

const mixHex = (hexA: string, hexB: string, weightB: number): string => {
    const a = parseHex(hexA);
    const b = parseHex(hexB);
    if (!a || !b) return hexA;
    const w = Math.max(0, Math.min(1, weightB));
    const r = Math.round(a[0] * (1 - w) + b[0] * w);
    const g = Math.round(a[1] * (1 - w) + b[1] * w);
    const bl = Math.round(a[2] * (1 - w) + b[2] * w);
    return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

export const getMadinahThemePalette = (currentTheme?: any): MadinahThemePalette => {
    const isDark = isDarkQuranTheme(currentTheme);
    const themeId = currentTheme?.id || '';

    if (isDark || themeId === 'deep_black') {
        const gold = currentTheme?.verseBracket || currentTheme?.sajdah || '#fbbf24';
        const hasColoredAccent =
            typeof currentTheme?.accent === 'string' &&
            currentTheme.accent.toLowerCase() !== '#27272a' &&
            currentTheme.accent.toLowerCase() !== '#000000';
        const baseAccent = hasColoredAccent ? currentTheme.accent : '#71717a';
        return {
            frameBg: '#121316',
            primary: hasColoredAccent ? baseAccent : '#8b8d98',
            secondary: hasColoredAccent ? mixHex(baseAccent, '#ffffff', 0.25) : '#52525b',
            deep: '#27272a',
            gold,
            cartoucheFill: '#0a0a0c',
            bannerText: '#f8fafc',
            metaText: gold,
        };
    }

    switch (themeId) {
        case 'gold':
            return {
                frameBg: '#fdf8ea',
                primary: '#b45309',
                secondary: '#e5b842',
                deep: '#78350f',
                gold: '#d4af37',
                cartoucheFill: '#ffffff',
                bannerText: '#78350f',
                metaText: '#92400e',
            };
        case 'green':
            return {
                frameBg: '#eefaf2',
                primary: '#15803d',
                secondary: '#4ade80',
                deep: '#14532d',
                gold: '#c89b45',
                cartoucheFill: '#ffffff',
                bannerText: '#14532d',
                metaText: '#166534',
            };
        case 'maroon':
            return {
                frameBg: '#fdf2f6',
                primary: '#831843',
                secondary: '#d4739a',
                deep: '#500724',
                gold: '#c89b45',
                cartoucheFill: '#ffffff',
                bannerText: '#500724',
                metaText: '#831843',
            };
        case 'black':
            return {
                frameBg: '#f3f4f6',
                primary: '#1f2937',
                secondary: '#9ca3af',
                deep: '#111827',
                gold: '#d97706',
                cartoucheFill: '#ffffff',
                bannerText: '#111827',
                metaText: '#374151',
            };
        case 'night_sky':
            return {
                frameBg: '#eff6fc',
                primary: '#3573a8',
                secondary: '#6ba3d4',
                deep: '#1f4f7a',
                gold: '#c89b45',
                cartoucheFill: '#ffffff',
                bannerText: '#133a5e',
                metaText: '#1f4f7a',
            };
        default: {
            const primary = currentTheme?.barBorder || currentTheme?.barText || currentTheme?.accent || '#3573a8';
            const gold = currentTheme?.verseBracket || currentTheme?.sajdah || '#c89b45';
            return {
                frameBg: mixHex(primary, '#ffffff', 0.9),
                primary,
                secondary: mixHex(primary, '#ffffff', 0.38),
                deep: mixHex(primary, '#000000', 0.35),
                gold,
                cartoucheFill: '#ffffff',
                bannerText: mixHex(primary, '#000000', 0.45),
                metaText: mixHex(primary, '#000000', 0.25),
            };
        }
    }
};

export const MadinahShellSideFrames: React.FC<{ currentTheme?: any; frameDesign?: number }> = ({ currentTheme, frameDesign }) => {
    const uid = useId().replace(/:/g, '');
    const palette = getMadinahThemePalette(currentTheme);
    const design = normalizeMadinahFrameDesign(frameDesign);
    const vPatternId = `madinah-shell-v-pat-${uid}`;
    const topHPatternId = `madinah-shell-top-h-pat-${uid}`;

    const renderCornerRosette = (posClass: string, keyPrefix: string) => (
        <div key={keyPrefix} className={`madinah-corner ${posClass} pointer-events-none`} aria-hidden="true">
            <MadinahCornerRosetteSVG design={design} palette={palette} />
        </div>
    );

    const renderSideColumn = (side: 'left' | 'right', definePattern: boolean) => (
        <div
            className={`madinah-shell-side madinah-shell-side-${side} pointer-events-none`}
            aria-hidden="true"
        >
            <div className="madinah-shell-safe-top" style={{ backgroundColor: palette.frameBg }} />
            <div className="madinah-shell-side-viewport">
                <div className="madinah-shell-side-inner">
                    <svg
                        className="w-full h-full block"
                        preserveAspectRatio="none"
                        style={side === 'right' ? { transform: 'scaleX(-1)' } : undefined}
                    >
                        {definePattern && (
                            <defs>
                                <pattern id={vPatternId} width="16" height="36" patternUnits="userSpaceOnUse">
                                    <MadinahVerticalPatternContent design={design} palette={palette} />
                                </pattern>
                            </defs>
                        )}
                        <rect width="100%" height="100%" fill={`url(#${vPatternId})`} />
                    </svg>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div
                className="madinah-shell-top-safe-cover pointer-events-none"
                style={{ backgroundColor: palette.frameBg }}
                aria-hidden="true"
            />
            <div className="madinah-shell-edge-top pointer-events-none" aria-hidden="true">
                <div className="madinah-shell-edge-top-inner">
                    <svg className="w-full h-full block" preserveAspectRatio="none">
                        <defs>
                            <pattern id={topHPatternId} width="36" height="16" patternUnits="userSpaceOnUse">
                                <MadinahHorizontalPatternContent design={design} palette={palette} />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#${topHPatternId})`} />
                    </svg>
                </div>
            </div>
            {renderSideColumn('left', true)}
            {renderSideColumn('right', false)}
            {renderCornerRosette('madinah-corner-tl', 'tl')}
            {renderCornerRosette('madinah-corner-tr', 'tr')}
            {renderCornerRosette('madinah-corner-bl', 'bl')}
            {renderCornerRosette('madinah-corner-br', 'br')}
        </>
    );
};

export const MushafPageFrameOverlay: React.FC<{ currentTheme?: any; frameDesign?: number }> = ({
    currentTheme,
    frameDesign,
}) => {
    const uid = useId().replace(/:/g, '');
    const palette = getMadinahThemePalette(currentTheme);
    const design = normalizeMadinahFrameDesign(frameDesign);
    const vPatternId = `mushaf-frame-v-pat-${uid}`;
    const hPatternId = `mushaf-frame-h-pat-${uid}`;

    return (
        <>
            <div
                className="mushaf-frame-safe-cover mushaf-frame-safe-top pointer-events-none"
                style={{ backgroundColor: palette.frameBg }}
                aria-hidden="true"
            />
            <div
                className="mushaf-frame-safe-cover mushaf-frame-safe-bottom pointer-events-none"
                style={{ backgroundColor: palette.frameBg }}
                aria-hidden="true"
            />
            <div
                className="mushaf-frame-safe-cover mushaf-frame-safe-left pointer-events-none"
                style={{ backgroundColor: palette.frameBg }}
                aria-hidden="true"
            />
            <div
                className="mushaf-frame-safe-cover mushaf-frame-safe-right pointer-events-none"
                style={{ backgroundColor: palette.frameBg }}
                aria-hidden="true"
            />

            {/* Top Ornamental SVG Edge */}
            <div className="mushaf-frame-edge mushaf-frame-edge-top pointer-events-none" aria-hidden="true">
                <div className="mushaf-frame-edge-h-inner">
                    <svg className="w-full h-full block" preserveAspectRatio="none">
                        <defs>
                            <pattern id={hPatternId} width="36" height="16" patternUnits="userSpaceOnUse">
                                <MadinahHorizontalPatternContent design={design} palette={palette} />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#${hPatternId})`} />
                    </svg>
                </div>
            </div>

            {/* Bottom Ornamental SVG Edge */}
            <div className="mushaf-frame-edge mushaf-frame-edge-bottom pointer-events-none" aria-hidden="true">
                <div className="mushaf-frame-edge-h-inner">
                    <svg
                        className="w-full h-full block"
                        preserveAspectRatio="none"
                        style={{ transform: 'scaleY(-1)' }}
                    >
                        <rect width="100%" height="100%" fill={`url(#${hPatternId})`} />
                    </svg>
                </div>
            </div>

            {/* Left Ornamental SVG Edge */}
            <div className="mushaf-frame-side mushaf-frame-side-left pointer-events-none" aria-hidden="true">
                <div className="mushaf-frame-side-inner">
                    <svg className="w-full h-full block" preserveAspectRatio="none">
                        <defs>
                            <pattern id={vPatternId} width="16" height="36" patternUnits="userSpaceOnUse">
                                <MadinahVerticalPatternContent design={design} palette={palette} />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#${vPatternId})`} />
                    </svg>
                </div>
            </div>

            {/* Right Ornamental SVG Edge */}
            <div className="mushaf-frame-side mushaf-frame-side-right pointer-events-none" aria-hidden="true">
                <div className="mushaf-frame-side-inner">
                    <svg
                        className="w-full h-full block"
                        preserveAspectRatio="none"
                        style={{ transform: 'scaleX(-1)' }}
                    >
                        <rect width="100%" height="100%" fill={`url(#${vPatternId})`} />
                    </svg>
                </div>
            </div>

            {/* 4 Corner Rosettes */}
            <div className="mushaf-frame-corner mushaf-frame-corner-tl pointer-events-none" aria-hidden="true">
                <MadinahCornerRosetteSVG design={design} palette={palette} />
            </div>
            <div className="mushaf-frame-corner mushaf-frame-corner-tr pointer-events-none" aria-hidden="true">
                <MadinahCornerRosetteSVG design={design} palette={palette} />
            </div>
            <div className="mushaf-frame-corner mushaf-frame-corner-bl pointer-events-none" aria-hidden="true">
                <MadinahCornerRosetteSVG design={design} palette={palette} />
            </div>
            <div className="mushaf-frame-corner mushaf-frame-corner-br pointer-events-none" aria-hidden="true">
                <MadinahCornerRosetteSVG design={design} palette={palette} />
            </div>
        </>
    );
};

interface MadinahFrameSVGProps {
    currentTheme?: any;
    bgColor?: string;
    frameDesign?: number;
    pageNum?: number;
    isCurrent?: boolean;
    isLandscape?: boolean;
    isPageInputActive?: boolean;
    pageInputRef?: React.RefObject<HTMLInputElement>;
    pageInput?: string;
    onPageButtonClick?: () => void;
    onPageInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPageInputBlur?: () => void;
    onPageInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    showAutoScrollButton?: boolean;
    autoScrollState?: { isActive: boolean; isPaused: boolean; elapsedTime: number };
    onAutoScrollButtonPointerDown?: (e: React.SyntheticEvent) => void;
    onAutoScrollButtonPointerUp?: (e: React.PointerEvent | React.TouchEvent) => void;
    onAutoScrollButtonPointerLeave?: () => void;
    innerStageClassName?: string;
    children: React.ReactNode;
}

const MadinahFrameSVG: React.FC<MadinahFrameSVGProps> = ({
    currentTheme,
    bgColor,
    frameDesign,
    pageNum,
    isCurrent = true,
    isLandscape = false,
    isPageInputActive = false,
    pageInputRef,
    pageInput = '',
    onPageButtonClick,
    onPageInputChange,
    onPageInputBlur,
    onPageInputKeyDown,
    showAutoScrollButton = false,
    autoScrollState,
    onAutoScrollButtonPointerDown,
    onAutoScrollButtonPointerUp,
    onAutoScrollButtonPointerLeave,
    innerStageClassName = '',
    children,
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const uid = useId().replace(/:/g, '');
    const isDark = isDarkQuranTheme(currentTheme);

    const isBgLight = (() => {
        if (!bgColor || typeof bgColor !== 'string') return false;
        const rgb = parseHex(bgColor);
        if (!rgb) return false;
        return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255 >= 0.45;
    })();
    const pageBg = isDark
        ? (!bgColor || isBgLight ? (currentTheme?.bg || '#000000') : bgColor)
        : (bgColor || currentTheme?.bg || '#ffffff');
    const palette = getMadinahThemePalette(currentTheme);
    const design = normalizeMadinahFrameDesign(frameDesign);

    const hPatternId = `madinah-h-pat-${uid}`;

    return (
        <div
            className="madinah-frame-root"
            style={{ backgroundColor: pageBg }}
            dir="rtl"
        >
            {/* Bottom Ornamental SVG Border */}
            <div className="madinah-edge madinah-edge-bottom pointer-events-none" aria-hidden="true">
                <svg className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <pattern id={hPatternId} width="36" height="16" patternUnits="userSpaceOnUse">
                            <MadinahHorizontalPatternContent design={design} palette={palette} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${hPatternId})`} />
                </svg>
            </div>

            {/* Centered Interactive Page Number Medallion on Bottom Frame */}
            {pageNum !== undefined && (
                <div
                    className={`madinah-bottom-page-badge pointer-events-auto ${isPageInputActive ? '' : 'select-none'}`}
                    dir="ltr"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MadinahBottomBadgeSVG design={design} palette={palette} />
                    {isPageInputActive ? (
                        <input
                            ref={pageInputRef}
                            id={isCurrent ? "madinah-bottom-page-input" : undefined}
                            type="tel"
                            inputMode="numeric"
                            value={pageInput}
                            onChange={onPageInputChange}
                            onBlur={onPageInputBlur}
                            onKeyDown={onPageInputKeyDown}
                            placeholder={isEn ? `${pageNum}` : `${toArabic(pageNum)}`}
                            autoFocus
                            onFocus={() => {
                                if (typeof window !== 'undefined' && (window.scrollY !== 0 || window.scrollX !== 0)) {
                                    window.scrollTo(0, 0);
                                }
                            }}
                            className="madinah-bottom-page-number madinah-bottom-page-control"
                            style={{ color: palette.bannerText }}
                            aria-label={isEn ? 'Jump to page' : 'الانتقال إلى صفحة'}
                        />
                    ) : (
                        <button
                            id={isCurrent ? "madinah-bottom-page-btn" : undefined}
                            type="button"
                            onClick={onPageButtonClick}
                            className="madinah-bottom-page-number madinah-bottom-page-control"
                            style={{ color: palette.bannerText }}
                            title={isEn ? 'Go to page' : 'الانتقال إلى صفحة'}
                            aria-label={isEn ? `Page ${pageNum}` : `صفحة ${toArabic(pageNum)}`}
                        >
                            <span
                                id={isCurrent ? "madinah-bottom-page-number-text" : undefined}
                                className="inline-flex items-center justify-center leading-none"
                            >
                                {isEn ? pageNum : toArabic(pageNum)}
                            </span>
                        </button>
                    )}
                </div>
            )}

            {/* Small Auto-Scroll Button Next to Bottom Page Badge (Vertical Madinah Mode Only) */}
            {isCurrent && showAutoScrollButton && (
                <button
                    id="madinah-bottom-autoscroll-btn"
                    type="button"
                    onPointerDown={onAutoScrollButtonPointerDown}
                    onPointerUp={onAutoScrollButtonPointerUp}
                    onPointerLeave={onAutoScrollButtonPointerLeave}
                    onPointerCancel={onAutoScrollButtonPointerLeave}
                    onTouchStart={onAutoScrollButtonPointerDown}
                    onTouchEnd={onAutoScrollButtonPointerUp}
                    onTouchCancel={onAutoScrollButtonPointerLeave}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className={`madinah-bottom-autoscroll-btn pointer-events-auto select-none ${
                        autoScrollState?.isActive ? 'is-active' : ''
                    }`}
                    style={{
                        color: autoScrollState?.isActive ? palette.primary : palette.bannerText,
                        touchAction: 'none',
                    }}
                    title={isEn ? 'Auto-scroll (hold for speed)' : 'التمرير التلقائي (اضغط مطولاً لاختيار السرعة)'}
                    aria-label={isEn ? 'Auto-scroll' : 'التمرير التلقائي'}
                >
                    <MadinahHeaderCircleSVG design={design} palette={palette} />
                    {autoScrollState?.isActive ? (
                        <Pause size={isLandscape ? 10 : 12} className="relative z-10" strokeWidth={2.5} />
                    ) : (
                        <ChevronDown size={isLandscape ? 10 : 12} className="relative z-10" strokeWidth={2.5} />
                    )}
                </button>
            )}

            {/* Inner Safe Reading Area — fixed frame height, open at top under header */}
            <div
                className={`madinah-inner-stage ${innerStageClassName}`.trim()}
                style={{
                    backgroundColor: pageBg,
                    borderColor: palette.gold,
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default MadinahFrameSVG;
