import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    SAJDAH_LOCATIONS,
    SURAH_INFO,
    SURAH_NAMES_AR,
    getAyahCountText,
    getEffectiveWordHighlightColor,
    isDarkQuranTheme,
} from './constants';
import { getMadinahThemePalette } from './MadinahFrameSVG';
import {
    MadinahFrameDesignId,
    normalizeMadinahFrameDesign,
    MadinahSurahBannerPatternContent,
    MadinahSurahBannerCornerSVG,
    MadinahSurahBannerCartoucheSVG,
    MadinahOpeningTazhibPatternContent,
    MadinahOpeningTazhibCornerSVG,
    MadinahOpeningTazhibCrestSVG,
    MadinahOpeningTazhibCenterpieceSVG,
} from './madinahFrameDesigns';
import {
    QpcLineLayout,
    QpcMadinahStore,
    QpcWordEntry,
    getAyahWordCount,
    getMadinahPageFontFamily,
    getQpcMadinahDataSync,
    isMadinahPageFontLoadedSync,
    loadMadinahPageFont,
    loadQpcMadinahData,
    preloadAdjacentMadinahFonts,
} from '../../utils/qpcMadinahData';

export interface MadinahPageContentProps {
    pageNum: number;
    pageData: any[];
    isActiveSlide: boolean;
    highlightedAyahId: string | null;
    onAyahClick: (surah: number, ayah: number) => void;
    onVerseClick: (surah: number, ayah: number, event: React.MouseEvent) => void;
    onVerseLongPress?: (surah: number, ayah: number) => void;
    onAyahLongPress?: (surah: number, ayah: number, x: number, y: number) => void;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
    onSurahHeaderLongPress?: () => void;
    settings?: {
        textColor: string;
        theme: string;
        surahHeaderDesign?: number;
        madinahFrameDesign?: number;
        isBold?: boolean;
        highlightTextColor?: string;
        wordHighlightEnabled?: boolean;
        wordHighlightColor?: string;
    };
    currentTheme?: any;
    hideVerses?: boolean;
    memorizationSettings?: any;
    isPlaying?: boolean;
    isRecording?: boolean;
    revealedAyahs?: string[];
    tempRevealedAyah?: string | null;
    audioProgress?: { currentTime: number; duration: number } | null;
}

const ARABIC_DISPLAY_FONT = `var(--font-amiri-quran), 'Amiri Quran', 'Scheherazade New', 'Amiri', serif`;
const ARABIC_TITLE_FONT = `var(--font-amiri), 'Amiri', 'Amiri Quran', serif`;

const SAJDAH_SET = new Set(SAJDAH_LOCATIONS.map((sl) => `${sl.s}:${sl.a}`));

const stripArabicTashkeel = (text: string): string =>
    text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

const MadinahSurahBanner: React.FC<{
    surahNumber: number;
    currentTheme?: any;
    rowHeightPx: number;
    frameDesign?: number;
}> = React.memo(({ surahNumber, currentTheme, rowHeightPx, frameDesign }) => {
    const uid = useId().replace(/:/g, '');
    const themePalette = getMadinahThemePalette(currentTheme);
    const design = normalizeMadinahFrameDesign(frameDesign);

    const palette = {
        bg: themePalette.frameBg,
        border: themePalette.primary,
        secondary: themePalette.secondary,
        deep: themePalette.deep,
        gold: themePalette.gold,
        cartoucheBg: themePalette.cartoucheFill,
        text: themePalette.bannerText,
        metaText: themePalette.metaText,
    };

    const rawName = SURAH_NAMES_AR[surahNumber - 1] || '';
    const cleanName = stripArabicTashkeel(rawName.replace(/سورة|سُورَةُ|سُورَة/g, '')).trim();
    const surahTitle = `سورة ${cleanName}`;
    const info = SURAH_INFO[surahNumber];
    const surahType = info?.type || 'مكية';
    const ayahCountText = getAyahCountText(info?.ayahs || 7);

    const bannerFontSize = Math.max(8, Math.min(26, rowHeightPx * 0.42));
    const metaFontSize = Math.max(6.5, Math.min(16, rowHeightPx * 0.27));
    const bgPatternId = `madinah-surah-pat-${uid}`;

    const renderCornerOrnament = (posClass: string) => (
        <MadinahSurahBannerCornerSVG design={design} palette={themePalette} posClass={posClass} />
    );

    const renderWingFiligree = (side: 'right' | 'left') => (
        <div
            className={`madinah-surah-wing-filigree madinah-surah-wing-${side} pointer-events-none`}
            aria-hidden="true"
        >
            <svg viewBox="0 0 60 16" className="w-full h-[14px]" preserveAspectRatio="none">
                <line
                    x1="2"
                    y1="8"
                    x2="58"
                    y2="8"
                    stroke={palette.gold}
                    strokeWidth="0.9"
                    vectorEffect="non-scaling-stroke"
                />
                <line
                    x1="6"
                    y1="5"
                    x2="54"
                    y2="5"
                    stroke={palette.border}
                    strokeOpacity="0.35"
                    strokeWidth="0.6"
                    vectorEffect="non-scaling-stroke"
                />
                <line
                    x1="6"
                    y1="11"
                    x2="54"
                    y2="11"
                    stroke={palette.border}
                    strokeOpacity="0.35"
                    strokeWidth="0.6"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            <svg
                viewBox="0 0 22 14"
                className="madinah-surah-wing-medallion shrink-0"
                aria-hidden="true"
            >
                <path
                    d="M1 7 C5.5 2.5 16.5 2.5 21 7 C16.5 11.5 5.5 11.5 1 7 Z"
                    fill={palette.secondary}
                    fillOpacity="0.38"
                    stroke={palette.border}
                    strokeWidth="0.9"
                />
                <polygon
                    points="11,3.2 14.4,7 11,10.8 7.6,7"
                    fill={palette.gold}
                    stroke={palette.border}
                    strokeWidth="0.55"
                />
                <circle cx="11" cy="7" r="1.2" fill={palette.cartoucheBg} />
            </svg>
        </div>
    );

    return (
        <div
            dir="rtl"
            className="madinah-qpc-surah-banner select-none"
            style={{
                backgroundColor: palette.bg,
                borderColor: palette.border,
            }}
        >
            {/* Subtle Islamic Ornamental Background Pattern Matching Page Border */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
            >
                <defs>
                    <pattern
                        id={bgPatternId}
                        width="32"
                        height="16"
                        patternUnits="userSpaceOnUse"
                    >
                        <MadinahSurahBannerPatternContent design={design} palette={themePalette} />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${bgPatternId})`} />
            </svg>

            {/* Inner Gold Frame */}
            <div
                className="madinah-qpc-surah-inner-frame pointer-events-none"
                style={{ borderColor: palette.gold }}
                aria-hidden="true"
            />

            {/* 4 Corner Islamic Rosettes */}
            {renderCornerOrnament('is-tr')}
            {renderCornerOrnament('is-tl')}
            {renderCornerOrnament('is-br')}
            {renderCornerOrnament('is-bl')}

            {/* Symmetric 3-Column Layout: Right Meta | Dead-Center Cartouche | Left Meta */}
            <div className="madinah-qpc-surah-grid">
                {/* Right Side (Ayah Count) */}
                <div className="madinah-qpc-surah-side madinah-qpc-surah-side-right">
                    <span
                        className="madinah-qpc-surah-meta"
                        style={{ color: palette.metaText, fontSize: `${metaFontSize}px` }}
                    >
                        {ayahCountText}
                    </span>
                    {renderWingFiligree('right')}
                </div>

                {/* Center Ornamental Islamic Cartouche */}
                <div className="madinah-qpc-surah-cartouche">
                    <MadinahSurahBannerCartoucheSVG design={design} palette={themePalette} />

                    <span
                        className="madinah-qpc-surah-title"
                        style={{
                            color: palette.text,
                            fontFamily: ARABIC_TITLE_FONT,
                            fontSize: `${bannerFontSize}px`,
                        }}
                    >
                        {surahTitle}
                    </span>
                </div>

                {/* Left Side (Makki / Madani) */}
                <div className="madinah-qpc-surah-side madinah-qpc-surah-side-left">
                    {renderWingFiligree('left')}
                    <span
                        className="madinah-qpc-surah-meta"
                        style={{ color: palette.metaText, fontSize: `${metaFontSize}px` }}
                    >
                        {surahType}
                    </span>
                </div>
            </div>
        </div>
    );
});

interface OpeningTazhibBounds {
    w: number;
    h: number;
    yTopStart: number;
    yTopCutout: number;
    yTopHornEnd: number;
    topP1x: number;
    topP1y: number;
    topP2x: number;
    yBotHornStart: number;
    yBotCutout: number;
    botP1x: number;
    botP1y: number;
    botP2x: number;
}

const solveCrescentArch = (
    w: number,
    cx: number,
    yEdgeHorn: number,
    yCutout: number,
    xNearL: number,
    xFarL: number,
    mNearEdgeY: number,
    mFarEdgeY: number,
    direction: 'bottom' | 'top'
): { p1x: number; p1y: number; p2x: number } => {
    const xL = 2;
    const spanX = Math.max(20, cx - xL);
    const spanY = Math.max(20, Math.abs(yCutout - yEdgeHorn));
    const yDir = direction === 'bottom' ? 1 : -1;

    // Candidate parameter pairs ordered from gentlest circular arc to fuller clearance
    const candidates: Array<[number, number, number]> = [
        [0.24, 0.66, 0.56],
        [0.21, 0.70, 0.60],
        [0.18, 0.74, 0.64],
        [0.14, 0.78, 0.68],
        [0.10, 0.82, 0.74],
        [0.07, 0.86, 0.80],
        [0.04, 0.90, 0.86],
    ];

    for (const [rx1, ry1, rx2] of candidates) {
        const p1x = xL + spanX * rx1;
        const p1y = yEdgeHorn + yDir * spanY * ry1;
        const p2x = cx - spanX * rx2;

        let ok = true;
        for (let i = 1; i < 40; i++) {
            const t = i / 40;
            const u = 1 - t;
            const bx =
                u * u * u * xL +
                3 * u * u * t * p1x +
                3 * u * t * t * p2x +
                t * t * t * cx;
            const by =
                u * u * u * yEdgeHorn +
                3 * u * u * t * p1y +
                3 * u * t * t * yCutout +
                t * t * t * yCutout;

            if (direction === 'bottom') {
                if (by <= mNearEdgeY + 5 && bx > xNearL) {
                    ok = false;
                    break;
                }
                if (by <= mFarEdgeY + 10 && bx > xFarL) {
                    ok = false;
                    break;
                }
            } else {
                if (by >= mNearEdgeY - 5 && bx > xNearL) {
                    ok = false;
                    break;
                }
                if (by >= mFarEdgeY - 10 && bx > xFarL) {
                    ok = false;
                    break;
                }
            }
        }
        if (ok) {
            return {
                p1x: Number(p1x.toFixed(2)),
                p1y: Number(p1y.toFixed(2)),
                p2x: Number(p2x.toFixed(2)),
            };
        }
    }

    return {
        p1x: Number((xL + spanX * 0.04).toFixed(2)),
        p1y: Number((yEdgeHorn + yDir * spanY * 0.9).toFixed(2)),
        p2x: Number((cx - spanX * 0.88).toFixed(2)),
    };
};

const buildOuterCornerSegment = (
    design: MadinahFrameDesignId,
    xL: number,
    xR: number,
    yEdge: number,
    rOut: number,
    edgeSide: 'bottom' | 'top'
): string[] => {
    const dir = edgeSide === 'bottom' ? -1 : 1; // step toward interior
    if (design === 6) {
        // Kufic crisp 90-degree architectural mitered corners
        return edgeSide === 'bottom'
            ? [`L ${xR} ${yEdge}`, `L ${xL} ${yEdge}`]
            : [`M ${xL} ${yEdge}`, `L ${xR} ${yEdge}`];
    }
    if (design === 3) {
        // Eight-point star 45-degree diagonal bevel corners
        const ch = Math.max(4, Math.min(12, rOut * 1.1));
        return edgeSide === 'bottom'
            ? [
                  `L ${xR} ${yEdge + dir * ch}`,
                  `L ${xR - ch} ${yEdge}`,
                  `L ${xL + ch} ${yEdge}`,
                  `L ${xL} ${yEdge + dir * ch}`,
              ]
            : [
                  `M ${xL} ${yEdge + dir * ch}`,
                  `L ${xL + ch} ${yEdge}`,
                  `L ${xR - ch} ${yEdge}`,
                  `L ${xR} ${yEdge + dir * ch}`,
              ];
    }
    if (design === 4) {
        // Mamluk stepped notched corner
        const s1 = Math.max(3, Math.min(7, rOut * 0.65));
        const s2 = Math.max(5, Math.min(11, rOut * 1.1));
        return edgeSide === 'bottom'
            ? [
                  `L ${xR} ${yEdge + dir * s2}`,
                  `L ${xR - s1} ${yEdge + dir * s1}`,
                  `L ${xR - s2} ${yEdge}`,
                  `L ${xL + s2} ${yEdge}`,
                  `L ${xL + s1} ${yEdge + dir * s1}`,
                  `L ${xL} ${yEdge + dir * s2}`,
              ]
            : [
                  `M ${xL} ${yEdge + dir * s2}`,
                  `L ${xL + s1} ${yEdge + dir * s1}`,
                  `L ${xL + s2} ${yEdge}`,
                  `L ${xR - s2} ${yEdge}`,
                  `L ${xR - s1} ${yEdge + dir * s1}`,
                  `L ${xR} ${yEdge + dir * s2}`,
              ];
    }
    // Classic Royal (1), Andalusian (2), Ottoman (5) rounded corners
    const rad = design === 5 ? rOut * 1.35 : design === 2 ? rOut * 1.15 : rOut;
    return edgeSide === 'bottom'
        ? [
              `L ${xR} ${yEdge + dir * rad}`,
              `Q ${xR} ${yEdge} ${xR - rad} ${yEdge}`,
              `L ${xL + rad} ${yEdge}`,
              `Q ${xL} ${yEdge} ${xL} ${yEdge + dir * rad}`,
          ]
        : [
              `M ${xL} ${yEdge + dir * rad}`,
              `Q ${xL} ${yEdge} ${xL + rad} ${yEdge}`,
              `L ${xR - rad} ${yEdge}`,
              `Q ${xR} ${yEdge} ${xR} ${yEdge + dir * rad}`,
          ];
};

const buildBottomCrescentArchPath = (
    b: OpeningTazhibBounds,
    inset: number,
    design: MadinahFrameDesignId
): string => {
    const marginSide = 2;
    const xL0 = marginSide;
    const xR0 = b.w - marginSide;
    const cx = b.w / 2;
    const yBot = b.h - 2 - inset;
    const yCut = Math.min(yBot - 8, b.yBotCutout + inset);
    const rOut = Math.max(4, Math.min(14 - inset * 0.5, (xR0 - xL0) * 0.08, (yBot - b.yBotHornStart) * 0.08));

    const dx0 = Math.max(1, b.botP1x - xL0);
    const dy0 = Math.max(1, b.botP1y - b.yBotHornStart);
    const len0 = Math.hypot(dx0, dy0);
    const sinT = Math.max(0.16, dx0 / len0);
    const cosT = dy0 / len0;

    // Exact miter vertex so sharp pointed horn tips remain cleanly parallel for all 3 borders
    const xL = xL0 + inset;
    const xR = xR0 - inset;
    const yTip = Math.min(yCut - 8, b.yBotHornStart + inset * ((1 + cosT) / sinT));

    const p1xL = Math.max(xL, b.botP1x - inset * cosT);
    const p1y = Math.min(yCut, b.botP1y + inset * sinT);
    const p2xL = Math.max(xL, b.botP2x - inset * 0.65);

    const p1xR = b.w - p1xL;
    const p2xR = b.w - p2xL;

    return [
        `M ${xL} ${yTip}`,
        `C ${p1xL} ${p1y} ${p2xL} ${yCut} ${cx} ${yCut}`,
        `C ${p2xR} ${yCut} ${p1xR} ${p1y} ${xR} ${yTip}`,
        ...buildOuterCornerSegment(design, xL, xR, yBot, rOut, 'bottom'),
        'Z',
    ].join(' ');
};

const buildTopCrescentArchPath = (
    b: OpeningTazhibBounds,
    inset: number,
    design: MadinahFrameDesignId
): string => {
    const marginSide = 2;
    const xL0 = marginSide;
    const xR0 = b.w - marginSide;
    const cx = b.w / 2;
    const yTop = b.yTopStart + inset;
    const yCut = Math.max(yTop + 8, b.yTopCutout - inset);
    const rOut = Math.max(4, Math.min(14 - inset * 0.5, (xR0 - xL0) * 0.08, (b.yTopHornEnd - yTop) * 0.08));

    const dx0 = Math.max(1, b.topP1x - xL0);
    const dy0 = Math.max(1, b.yTopHornEnd - b.topP1y);
    const len0 = Math.hypot(dx0, dy0);
    const sinT = Math.max(0.16, dx0 / len0);
    const cosT = dy0 / len0;

    const xL = xL0 + inset;
    const xR = xR0 - inset;
    const yTip = Math.max(yCut + 8, b.yTopHornEnd - inset * ((1 + cosT) / sinT));

    const p1xL = Math.max(xL, b.topP1x - inset * cosT);
    const p1y = Math.max(yCut, b.topP1y - inset * sinT);
    const p2xL = Math.max(xL, b.topP2x - inset * 0.65);

    const p1xR = b.w - p1xL;
    const p2xR = b.w - p2xL;

    return [
        ...buildOuterCornerSegment(design, xL, xR, yTop, rOut, 'top'),
        `L ${xR} ${yTip}`,
        `C ${p1xR} ${p1y} ${p2xR} ${yCut} ${cx} ${yCut}`,
        `C ${p2xL} ${yCut} ${p1xL} ${p1y} ${xL} ${yTip}`,
        'Z',
    ].join(' ');
};

const MadinahOpeningTazhib: React.FC<{
    pageNum: number;
    bounds: OpeningTazhibBounds | null;
    currentTheme?: any;
    frameDesign?: number;
}> = React.memo(({ pageNum, bounds, currentTheme, frameDesign }) => {
    const uid = useId().replace(/:/g, '');
    if (!bounds || bounds.w < 80 || bounds.h - bounds.yBotCutout < 26) {
        return null;
    }

    const palette = getMadinahThemePalette(currentTheme);
    const design = normalizeMadinahFrameDesign(frameDesign);
    const botClipId = `madinah-tazhib-bot-clip-${uid}`;
    const topClipId = `madinah-tazhib-top-clip-${uid}`;
    const patId = `madinah-tazhib-pat-${uid}`;
    const isFatihah = pageNum === 1;

    const botOuterPath = buildBottomCrescentArchPath(bounds, 0, design);
    const botMidGoldPath = buildBottomCrescentArchPath(bounds, 3.5, design);
    const botInnerFinePath = buildBottomCrescentArchPath(bounds, 6.5, design);

    const hasTopTazhib = bounds.yTopCutout - bounds.yTopStart >= 22;
    const topOuterPath = hasTopTazhib ? buildTopCrescentArchPath(bounds, 0, design) : '';
    const topMidGoldPath = hasTopTazhib ? buildTopCrescentArchPath(bounds, 3.5, design) : '';
    const topInnerFinePath = hasTopTazhib ? buildTopCrescentArchPath(bounds, 6.5, design) : '';

    const cx = bounds.w / 2;
    const availW = bounds.w - 36;
    const maxOrnamentScale = Math.min(1.35, 0.72 * Math.max(1, bounds.w / 480));

    const lowerTop = bounds.yBotCutout + 10;
    const lowerBot = bounds.h - 10;
    const lowerH = Math.max(0, lowerBot - lowerTop);
    const lowerCy = lowerTop + lowerH * 0.54;
    const lowerScale = Math.max(0.28, Math.min(maxOrnamentScale, (lowerH - 16) / 92, availW / 310));

    const upperTop = bounds.yTopStart + 8;
    const upperBot = bounds.yTopCutout - 8;
    const upperH = Math.max(0, upperBot - upperTop);
    const upperCy = upperTop + upperH * 0.46;
    const upperScale = Math.max(0.24, Math.min(maxOrnamentScale, (upperH - 12) / 92, availW / 310));

    const innerLineOpacity = design === 5 ? 0.24 : 0.38;

    return (
        <div
            className="madinah-opening-tazhib-layer select-none pointer-events-none"
            aria-hidden="true"
        >
            <svg
                width={bounds.w}
                height={bounds.h}
                viewBox={`0 0 ${bounds.w} ${bounds.h}`}
                className="w-full h-full block"
            >
                <defs>
                    <clipPath id={botClipId}>
                        <path d={botOuterPath} />
                    </clipPath>
                    {hasTopTazhib && (
                        <clipPath id={topClipId}>
                            <path d={topOuterPath} />
                        </clipPath>
                    )}
                    <pattern id={patId} width="36" height="36" patternUnits="userSpaceOnUse">
                        <MadinahOpeningTazhibPatternContent design={design} palette={palette} />
                    </pattern>
                </defs>

                {/* Upper Mirrored Illuminated Carpet (Between Surah Banner and Basmalah) */}
                {hasTopTazhib && (
                    <>
                        <g clipPath={`url(#${topClipId})`}>
                            <rect x="0" y="0" width={bounds.w} height={bounds.h} fill={`url(#${patId})`} />

                            {[
                                { x: 8.5, y: bounds.yTopStart + 6.5, sx: 1, sy: 1 },
                                { x: bounds.w - 8.5, y: bounds.yTopStart + 6.5, sx: -1, sy: 1 },
                            ].map((corner, idx) => (
                                <g
                                    key={`top-c-${idx}`}
                                    transform={`translate(${corner.x}, ${corner.y}) scale(${corner.sx}, ${corner.sy})`}
                                >
                                    <MadinahOpeningTazhibCornerSVG design={design} palette={palette} />
                                </g>
                            ))}

                            {upperH >= 28 && (
                                <MadinahOpeningTazhibCenterpieceSVG
                                    design={design}
                                    cx={cx}
                                    cy={upperCy}
                                    scale={upperScale}
                                    isFatihah={isFatihah}
                                    palette={palette}
                                />
                            )}
                        </g>

                        <path d={topOuterPath} fill="none" stroke={palette.primary} strokeWidth="1.4" strokeLinejoin="miter" strokeMiterlimit={8} />
                        <path d={topMidGoldPath} fill="none" stroke={palette.gold} strokeWidth="1" strokeLinejoin="miter" strokeMiterlimit={8} />
                        <path d={topInnerFinePath} fill="none" stroke={palette.primary} strokeOpacity={innerLineOpacity} strokeWidth="0.7" strokeLinejoin="miter" strokeMiterlimit={8} />
                        <MadinahOpeningTazhibCrestSVG
                            design={design}
                            palette={palette}
                            cx={cx}
                            yCut={bounds.yTopCutout}
                            direction="top"
                        />
                    </>
                )}

                {/* Lower Illuminated Carpet (Below Last Ayah) */}
                <g clipPath={`url(#${botClipId})`}>
                    <rect x="0" y="0" width={bounds.w} height={bounds.h} fill={`url(#${patId})`} />

                    {[
                        { x: 8.5, y: bounds.h - 8.5, sx: 1, sy: -1 },
                        { x: bounds.w - 8.5, y: bounds.h - 8.5, sx: -1, sy: -1 },
                    ].map((corner, idx) => (
                        <g
                            key={`bot-c-${idx}`}
                            transform={`translate(${corner.x}, ${corner.y}) scale(${corner.sx}, ${corner.sy})`}
                        >
                            <MadinahOpeningTazhibCornerSVG design={design} palette={palette} />
                        </g>
                    ))}

                    {lowerH >= 28 && (
                        <MadinahOpeningTazhibCenterpieceSVG
                            design={design}
                            cx={cx}
                            cy={lowerCy}
                            scale={lowerScale}
                            isFatihah={isFatihah}
                            palette={palette}
                        />
                    )}
                </g>

                {/* Crisp Triple Contour Frame Following the Lower Text Alcove & Outer Edges */}
                <path d={botOuterPath} fill="none" stroke={palette.primary} strokeWidth="1.4" strokeLinejoin="miter" strokeMiterlimit={8} />
                <path d={botMidGoldPath} fill="none" stroke={palette.gold} strokeWidth="1" strokeLinejoin="miter" strokeMiterlimit={8} />
                <path d={botInnerFinePath} fill="none" stroke={palette.primary} strokeOpacity={innerLineOpacity} strokeWidth="0.7" strokeLinejoin="miter" strokeMiterlimit={8} />
                <MadinahOpeningTazhibCrestSVG
                    design={design}
                    palette={palette}
                    cx={cx}
                    yCut={bounds.yBotCutout}
                    direction="bottom"
                />
            </svg>
        </div>
    );
});

interface FitMetrics {
    fontSizePx: number;
    rowHeightPx: number;
    bannerHeightPx: number;
    lineScaleX: Record<number, number>;
}

const fitMetricsCache = new Map<string, FitMetrics>();
const tazhibBoundsCache = new Map<string, OpeningTazhibBounds>();
let lastKnownStageSize = { w: 0, h: 0 };

const areFitMetricsClose = (a: FitMetrics, b: FitMetrics): boolean => {
    if (
        Math.abs(a.fontSizePx - b.fontSizePx) > 0.05 ||
        Math.abs(a.rowHeightPx - b.rowHeightPx) > 0.2 ||
        Math.abs(a.bannerHeightPx - b.bannerHeightPx) > 0.2
    ) {
        return false;
    }
    const aKeys = Object.keys(a.lineScaleX);
    const bKeys = Object.keys(b.lineScaleX);
    if (aKeys.length !== bKeys.length) return false;
    for (let i = 0; i < aKeys.length; i++) {
        const k = Number(aKeys[i]);
        if (Math.abs((a.lineScaleX[k] ?? 1) - (b.lineScaleX[k] ?? 1)) > 0.002) {
            return false;
        }
    }
    return true;
};

const makeFitCacheKey = (
    pageNum: number,
    w: number,
    h: number,
    isBold: boolean,
    fontReady: boolean
): string => `v2:${pageNum}:${w}x${h}:${isBold ? 1 : 0}:${fontReady ? 1 : 0}`;

const makeTazhibCacheKey = (
    pageNum: number,
    w: number,
    h: number,
    isBold: boolean,
    fontReady: boolean,
    fontSizePx: number,
    rowHeightPx: number,
    bannerHeightPx: number
): string => `v2:${pageNum}:${w}x${h}:${isBold ? 1 : 0}:${fontReady ? 1 : 0}:${fontSizePx.toFixed(2)}:${rowHeightPx.toFixed(2)}:${bannerHeightPx.toFixed(2)}`;

const MadinahPageContent: React.FC<MadinahPageContentProps> = React.memo(
    ({
        pageNum,
        isActiveSlide,
        highlightedAyahId,
        onAyahClick,
        onVerseClick,
        onVerseLongPress,
        onAyahLongPress,
        onInteractionStart,
        onInteractionEnd,
        settings,
        currentTheme,
        hideVerses,
        memorizationSettings,
        isPlaying,
        isRecording,
        revealedAyahs = [],
        tempRevealedAyah,
        audioProgress,
    }) => {
        const containerRef = useRef<HTMLDivElement | null>(null);
        const contentRef = useRef<HTMLDivElement | null>(null);
        const longPressTimer = useRef<number | null>(null);
        const isLongPressTriggered = useRef(false);
        const touchStartPos = useRef<{ x: number; y: number } | null>(null);

        const [qpcStore, setQpcStore] = useState<QpcMadinahStore | null>(() => getQpcMadinahDataSync());
        const pageLines: QpcLineLayout[] = useMemo(() => {
            if (!qpcStore) return [];
            return qpcStore.pages[pageNum - 1] || [];
        }, [qpcStore, pageNum]);

        const hasBasmallahLine = useMemo(
            () => pageLines.some((line) => line.t === 'b'),
            [pageLines]
        );

        const basmallahWords: QpcWordEntry[] = useMemo(() => {
            if (!qpcStore) return [];
            return [1, 2, 3, 4]
                .map((id) => qpcStore.wordsById[id])
                .filter((w): w is QpcWordEntry => Boolean(w));
        }, [qpcStore]);

        const fontReadySync =
            isMadinahPageFontLoadedSync(pageNum) &&
            (!hasBasmallahLine || isMadinahPageFontLoadedSync(1));
        const [fontLoaded, setFontLoaded] = useState<boolean>(fontReadySync);
        const isFontReady = fontLoaded || fontReadySync;
        const [layoutTick, setLayoutTick] = useState(0);
        const lastObservedSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

        const isOpeningPage = pageNum === 1 || pageNum === 2;
        const pageFontFamily = getMadinahPageFontFamily(pageNum);
        const basmallahFontFamily = getMadinahPageFontFamily(1);
        const isBoldStroke = Boolean(settings?.isBold);

        const [fitMetrics, setFitMetrics] = useState<FitMetrics>(() => {
            if (lastKnownStageSize.w > 40 && lastKnownStageSize.h > 40) {
                const cached = fitMetricsCache.get(
                    makeFitCacheKey(pageNum, lastKnownStageSize.w, lastKnownStageSize.h, isBoldStroke, fontReadySync)
                );
                if (cached) return cached;
            }
            return {
                fontSizePx: isOpeningPage ? 20 : 20,
                rowHeightPx: isOpeningPage ? 32 : 36,
                bannerHeightPx: isOpeningPage ? 40 : 36,
                lineScaleX: {},
            };
        });
        const [tazhibBounds, setTazhibBounds] = useState<OpeningTazhibBounds | null>(() => {
            if (isOpeningPage && lastKnownStageSize.w > 40 && lastKnownStageSize.h > 40) {
                const cachedFit = fitMetricsCache.get(
                    makeFitCacheKey(pageNum, lastKnownStageSize.w, lastKnownStageSize.h, isBoldStroke, fontReadySync)
                );
                if (cachedFit) {
                    return (
                        tazhibBoundsCache.get(
                            makeTazhibCacheKey(
                                pageNum,
                                lastKnownStageSize.w,
                                lastKnownStageSize.h,
                                isBoldStroke,
                                fontReadySync,
                                cachedFit.fontSizePx,
                                cachedFit.rowHeightPx,
                                cachedFit.bannerHeightPx
                            )
                        ) || null
                    );
                }
            }
            return null;
        });

        useEffect(() => {
            let cancelled = false;

            if (!qpcStore) {
                loadQpcMadinahData()
                    .then((store) => {
                        if (!cancelled) setQpcStore(store);
                    })
                    .catch((err) => {
                        console.error('Failed to load QPC Madinah data:', err);
                    });
            }

            const readyNow =
                isMadinahPageFontLoadedSync(pageNum) &&
                (!hasBasmallahLine || isMadinahPageFontLoadedSync(1));

            if (readyNow) {
                setFontLoaded((prev) => (prev ? prev : true));
            } else {
                setFontLoaded(false);
                Promise.all([
                    loadMadinahPageFont(pageNum),
                    hasBasmallahLine ? loadMadinahPageFont(1) : Promise.resolve(),
                ]).then(() => {
                    if (!cancelled) {
                        setFontLoaded(true);
                        setLayoutTick((t) => t + 1);
                    }
                });
            }

            if (isActiveSlide) {
                preloadAdjacentMadinahFonts(pageNum);
            }

            return () => {
                cancelled = true;
            };
        }, [pageNum, isActiveSlide, qpcStore, hasBasmallahLine]);

        useLayoutEffect(() => {
            const container = containerRef.current;
            if (!container) return;

            lastObservedSizeRef.current = {
                w: Math.round(container.clientWidth),
                h: Math.round(container.clientHeight),
            };

            const ro = new ResizeObserver(() => {
                if (typeof document !== 'undefined') {
                    const activeEl = document.activeElement as HTMLElement | null;
                    if (
                        activeEl?.id === 'madinah-bottom-page-input' ||
                        activeEl?.id === 'madinah-top-page-input' ||
                        document.getElementById('madinah-bottom-page-input')
                    ) {
                        return;
                    }
                }
                const w = Math.round(container.clientWidth);
                const h = Math.round(container.clientHeight);
                if (w === lastObservedSizeRef.current.w && h === lastObservedSizeRef.current.h) {
                    return;
                }
                lastObservedSizeRef.current = { w, h };
                setLayoutTick((t) => t + 1);
            });
            ro.observe(container);

            return () => {
                ro.disconnect();
            };
        }, []);

        // Measure optimal uniform font size for this page so all 15 lines fit width & height perfectly
        useLayoutEffect(() => {
            if (typeof document !== 'undefined' && document.getElementById('madinah-bottom-page-input')) {
                return;
            }
            const container = containerRef.current;
            const inner = contentRef.current;
            if (!container || !inner || !qpcStore || pageLines.length === 0) return;

            const availH = container.clientHeight;
            const availW = container.clientWidth;
            if (availH < 40 || availW < 40) return;

            lastKnownStageSize = { w: availW, h: availH };
            lastObservedSizeRef.current = { w: Math.round(availW), h: Math.round(availH) };

            const cacheKey = makeFitCacheKey(pageNum, availW, availH, isBoldStroke, isFontReady);
            const cached = fitMetricsCache.get(cacheKey);
            if (cached) {
                setFitMetrics((prev) => (areFitMetricsClose(prev, cached) ? prev : cached));
                return;
            }

            let rafId: number | null = null;
            const measureAndCommit = () => {
                const c = containerRef.current;
                const el = contentRef.current;
                if (!c || !el) return;

                const curH = c.clientHeight;
                const curW = c.clientWidth;
                if (curH < 40 || curW < 40) return;

                const totalLines = pageLines.length;
                const textLinesCount = Math.max(1, pageLines.filter((l) => l.t !== 's').length);
                const estimatedGapPx = Math.max(2, Math.min(8, curH * 0.0055));
                const openingBannerH = Math.max(18, Math.min(44, curH * 0.068));
                const openingTextBudgetH = Math.max(
                    60,
                    curH * 0.44 - Math.max(0, textLinesCount - 1) * estimatedGapPx
                );
                const rowH = isOpeningPage
                    ? Math.min(84, openingTextBudgetH / textLinesCount)
                    : Math.max(8, (curH - 4) / totalLines);
                const bannerH = isOpeningPage ? openingBannerH : rowH;

                const verticalCap = isOpeningPage
                    ? Math.min(76, rowH * 0.84)
                    : Math.min(96, rowH * 0.84);

                const lineLimitW = isOpeningPage ? Math.max(40, curW - 8) : curW;

                const ayahLines = Array.from(
                    el.querySelectorAll<HTMLElement>('.madinah-qpc-line-ayah')
                );

                // Temporarily switch ayah lines to max-content width measurement
                for (let i = 0; i < ayahLines.length; i++) {
                    ayahLines[i].dataset.prevJustify = ayahLines[i].style.justifyContent || '';
                    ayahLines[i].dataset.prevTransform = ayahLines[i].style.transform || '';
                    ayahLines[i].style.justifyContent = 'flex-start';
                    ayahLines[i].style.width = 'max-content';
                    ayahLines[i].style.maxWidth = 'none';
                    ayahLines[i].style.transform = 'none';
                }

                const fitsAt = (sizePx: number): boolean => {
                    el.style.fontSize = `${sizePx.toFixed(2)}px`;
                    for (let i = 0; i < ayahLines.length; i++) {
                        if (ayahLines[i].scrollWidth > lineLimitW) {
                            return false;
                        }
                    }
                    return true;
                };

                let bestFont = verticalCap;
                if (!fitsAt(verticalCap)) {
                    let low = Math.min(6, verticalCap * 0.5);
                    let high = Math.max(low, verticalCap);
                    bestFont = low;

                    for (let step = 0; step < 14; step++) {
                        const mid = (low + high) / 2;
                        if (fitsAt(mid)) {
                            bestFont = mid;
                            low = mid;
                        } else {
                            high = mid;
                        }
                    }
                }

                // Safety guard measured while max-content is still active (never compare against width:100%)
                el.style.fontSize = `${bestFont.toFixed(2)}px`;
                let guard = 0;
                while (guard < 16) {
                    let overflowed = false;
                    for (let i = 0; i < ayahLines.length; i++) {
                        if (ayahLines[i].scrollWidth > lineLimitW) {
                            overflowed = true;
                            break;
                        }
                    }
                    if (!overflowed) break;
                    bestFont = Math.max(5.5, bestFont - 0.15);
                    el.style.fontSize = `${bestFont.toFixed(2)}px`;
                    guard++;
                }

                // Micro-fit justified lines flush to both frame edges without adding inter-word gaps
                const lineScaleX: Record<number, number> = {};
                if (!isOpeningPage) {
                    for (let i = 0; i < ayahLines.length; i++) {
                        const lineEl = ayahLines[i];
                        if (!lineEl.classList.contains('is-justified')) continue;
                        const lineNum = Number(lineEl.dataset.lineNum);
                        if (!lineNum) continue;
                        const w = lineEl.scrollWidth;
                        if (w >= lineLimitW * 0.88 && w < lineLimitW) {
                            const scale = Math.min(1.06, lineLimitW / w);
                            if (scale > 1.001) {
                                lineScaleX[lineNum] = Number(scale.toFixed(4));
                            }
                        }
                    }
                }

                // Restore flex layout
                for (let i = 0; i < ayahLines.length; i++) {
                    const lineEl = ayahLines[i];
                    const lineNum = Number(lineEl.dataset.lineNum);
                    const s = lineNum ? lineScaleX[lineNum] : undefined;
                    lineEl.style.justifyContent = lineEl.dataset.prevJustify || '';
                    lineEl.style.width = '100%';
                    lineEl.style.maxWidth = '';
                    lineEl.style.transform = s ? `scaleX(${s})` : '';
                    lineEl.style.transformOrigin = s ? 'center center' : '';
                }

                const finalMetrics: FitMetrics = {
                    fontSizePx: Number(bestFont.toFixed(2)),
                    rowHeightPx: Number(rowH.toFixed(2)),
                    bannerHeightPx: Number(bannerH.toFixed(2)),
                    lineScaleX,
                };
                fitMetricsCache.set(makeFitCacheKey(pageNum, curW, curH, isBoldStroke, isFontReady), finalMetrics);

                setFitMetrics((prev) => (areFitMetricsClose(prev, finalMetrics) ? prev : finalMetrics));
            };

            if (!isActiveSlide) {
                rafId = window.requestAnimationFrame(measureAndCommit);
                return () => {
                    if (rafId !== null) window.cancelAnimationFrame(rafId);
                };
            }

            measureAndCommit();
        }, [pageNum, qpcStore, pageLines, isFontReady, layoutTick, isOpeningPage, isBoldStroke, isActiveSlide]);

        // Measure the exact bounds of both top (Basmalah) and bottom (last ayah) lines on Pages 1 & 2
        // so the Quran text sits dead-center and top & bottom Tazhib zones match identically
        useLayoutEffect(() => {
            if (!isOpeningPage) {
                setTazhibBounds((prev) => (prev !== null ? null : prev));
                return;
            }
            const container = containerRef.current;
            const inner = contentRef.current;
            if (!container || !inner || !qpcStore || pageLines.length === 0) return;

            const availW = container.clientWidth;
            const availH = container.clientHeight;
            const tazhibKey = makeTazhibCacheKey(
                pageNum,
                availW,
                availH,
                isBoldStroke,
                isFontReady,
                fitMetrics.fontSizePx,
                fitMetrics.rowHeightPx,
                fitMetrics.bannerHeightPx
            );

            if (availW >= 40 && availH >= 40) {
                const cached = tazhibBoundsCache.get(tazhibKey);
                if (cached) {
                    setTazhibBounds((prev) => {
                        if (
                            prev &&
                            Math.abs(prev.w - cached.w) < 0.6 &&
                            Math.abs(prev.h - cached.h) < 0.6 &&
                            Math.abs(prev.yTopStart - cached.yTopStart) < 0.6 &&
                            Math.abs(prev.yTopCutout - cached.yTopCutout) < 0.6 &&
                            Math.abs(prev.yTopHornEnd - cached.yTopHornEnd) < 0.6 &&
                            Math.abs(prev.yBotHornStart - cached.yBotHornStart) < 0.6 &&
                            Math.abs(prev.yBotCutout - cached.yBotCutout) < 0.6
                        ) {
                            return prev;
                        }
                        return cached;
                    });
                    return;
                }
            }

            const textLineEls = Array.from(
                inner.querySelectorAll<HTMLElement>('.madinah-opening-text-center-stage .madinah-qpc-line')
            );
            if (textLineEls.length < 2) return;

            const innerRect = inner.getBoundingClientRect();
            if (innerRect.width < 40 || innerRect.height < 40) return;

            const w = inner.clientWidth;
            const h = inner.clientHeight;
            const scaleX = w / innerRect.width;
            const scaleY = h / innerRect.height;

            const measureLineSpan = (lineEl: HTMLElement) => {
                const lineRect = lineEl.getBoundingClientRect();
                const words = Array.from(
                    lineEl.querySelectorAll<HTMLElement>('.madinah-qpc-word, .madinah-qpc-basmallah-word')
                );
                let minL = lineRect.left;
                let maxR = lineRect.right;
                let minT = lineRect.top;
                let maxB = lineRect.bottom;
                if (words.length > 0) {
                    minL = Infinity;
                    maxR = -Infinity;
                    minT = Infinity;
                    maxB = -Infinity;
                    for (let i = 0; i < words.length; i++) {
                        const wr = words[i].getBoundingClientRect();
                        if (wr.left < minL) minL = wr.left;
                        if (wr.right > maxR) maxR = wr.right;
                        if (wr.top < minT) minT = wr.top;
                        if (wr.bottom > maxB) maxB = wr.bottom;
                    }
                }
                return {
                    top: (minT - innerRect.top) * scaleY,
                    bottom: (maxB - innerRect.top) * scaleY,
                    left: (minL - innerRect.left) * scaleX,
                    right: (maxR - innerRect.left) * scaleX,
                };
            };

            const surahEl = inner.querySelector<HTMLElement>('.madinah-qpc-line-surah');
            const bannerBottom = surahEl
                ? (surahEl.getBoundingClientRect().bottom - innerRect.top) * scaleY
                : fitMetrics.bannerHeightPx + 4;

            const mFirst = measureLineSpan(textLineEls[0]);
            const mSecond = measureLineSpan(textLineEls[1]);
            const mPenult = measureLineSpan(textLineEls[textLineEls.length - 2]);
            const mLast = measureLineSpan(textLineEls[textLineEls.length - 1]);

            const cx = w / 2;
            const marginSide = 2;
            const padX = Math.max(16, fitMetrics.fontSizePx * 0.72);
            const clearance = Math.max(12, fitMetrics.fontSizePx * 0.5);

            // Top Tazhib geometry (between Surah banner and Basmalah)
            const halfFirst = Math.max(40, Math.max(cx - mFirst.left, mFirst.right - cx) + padX);
            const halfSecond = Math.max(halfFirst, Math.max(cx - mSecond.left, mSecond.right - cx) + padX);
            const x1L = Math.max(marginSide, cx - halfFirst);
            const x2L = Math.max(marginSide, cx - halfSecond);

            const yTopStart = Math.max(16, bannerBottom + 2);
            const yTopCutout = Math.max(yTopStart + 18, mFirst.top - clearance);
            const yTopHornEnd = Math.min(
                h - 32,
                Math.max(yTopCutout + 16, mSecond.top - Math.max(2, fitMetrics.fontSizePx * 0.08))
            );
            const topSolved = solveCrescentArch(
                w,
                cx,
                yTopHornEnd,
                yTopCutout,
                x1L,
                x2L,
                mFirst.top,
                mSecond.top,
                'top'
            );

            // Bottom Tazhib geometry (below last Ayah) — symmetric height to Top Zone (0 .. yTopCutout)
            const halfLast = Math.max(40, Math.max(cx - mLast.left, mLast.right - cx) + padX);
            const halfPenult = Math.max(halfLast, Math.max(cx - mPenult.left, mPenult.right - cx) + padX);
            const xPenultL = Math.max(marginSide, cx - halfPenult);
            const xLastL = Math.max(marginSide, cx - halfLast);

            const yBotHornStart = Math.max(
                0,
                Math.min(h - 32, mPenult.bottom + Math.max(2, fitMetrics.fontSizePx * 0.08))
            );
            const yBotCutout = Math.max(yBotHornStart + 18, mLast.bottom + clearance);
            const botSolved = solveCrescentArch(
                w,
                cx,
                yBotHornStart,
                yBotCutout,
                xPenultL,
                xLastL,
                mPenult.bottom,
                mLast.bottom,
                'bottom'
            );

            const next: OpeningTazhibBounds = {
                w: Math.round(w * 10) / 10,
                h: Math.round(h * 10) / 10,
                yTopStart: Math.round(yTopStart * 10) / 10,
                yTopCutout: Math.round(yTopCutout * 10) / 10,
                yTopHornEnd: Math.round(yTopHornEnd * 10) / 10,
                topP1x: topSolved.p1x,
                topP1y: topSolved.p1y,
                topP2x: topSolved.p2x,
                yBotHornStart: Math.round(yBotHornStart * 10) / 10,
                yBotCutout: Math.round(yBotCutout * 10) / 10,
                botP1x: botSolved.p1x,
                botP1y: botSolved.p1y,
                botP2x: botSolved.p2x,
            };

            if (availW >= 40 && availH >= 40) {
                tazhibBoundsCache.set(tazhibKey, next);
            }

            setTazhibBounds((prev) => {
                if (
                    prev &&
                    Math.abs(prev.w - next.w) < 0.6 &&
                    Math.abs(prev.h - next.h) < 0.6 &&
                    Math.abs(prev.yTopStart - next.yTopStart) < 0.6 &&
                    Math.abs(prev.yTopCutout - next.yTopCutout) < 0.6 &&
                    Math.abs(prev.yTopHornEnd - next.yTopHornEnd) < 0.6 &&
                    Math.abs(prev.yBotHornStart - next.yBotHornStart) < 0.6 &&
                    Math.abs(prev.yBotCutout - next.yBotCutout) < 0.6
                ) {
                    return prev;
                }
                return next;
            });
        }, [isOpeningPage, pageNum, qpcStore, pageLines, isFontReady, layoutTick, fitMetrics, isBoldStroke]);

        const handlePointerDown = (s: number, a: number, e: React.PointerEvent, isVerseEnd: boolean) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            if (onInteractionStart) onInteractionStart();

            isLongPressTriggered.current = false;
            touchStartPos.current = { x: e.clientX, y: e.clientY };

            if (longPressTimer.current) {
                window.clearTimeout(longPressTimer.current);
            }

            const clientX = e.clientX;
            const clientY = e.clientY;

            longPressTimer.current = window.setTimeout(() => {
                if (isVerseEnd) {
                    if (onVerseLongPress) {
                        onVerseLongPress(s, a);
                        isLongPressTriggered.current = true;
                    }
                } else {
                    if (onAyahLongPress) {
                        onAyahLongPress(s, a, clientX, clientY);
                        isLongPressTriggered.current = true;
                    }
                }
                longPressTimer.current = null;
            }, 600);
        };

        const handlePointerMove = (e: React.PointerEvent) => {
            if (!touchStartPos.current || !longPressTimer.current) return;
            if (
                Math.abs(e.clientX - touchStartPos.current.x) > 10 ||
                Math.abs(e.clientY - touchStartPos.current.y) > 10
            ) {
                window.clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        };

        const handlePointerUp = () => {
            if (onInteractionEnd) onInteractionEnd();
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        };

        const handlePointerLeave = () => {
            if (onInteractionEnd) onInteractionEnd();
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        };

        const isDark = isDarkQuranTheme(currentTheme);
        const madinahPalette = getMadinahThemePalette(currentTheme);
        const textColor = settings?.textColor || currentTheme?.text || (isDark ? '#f8fafc' : '#000000');
        const bismillahColor = isDark ? '#f8fafc' : madinahPalette.deep;

        const ayahHighlightColor =
            settings?.highlightTextColor ||
            currentTheme?.highlightText ||
            (currentTheme?.id === 'deep_black' ? '#f59e0b' : currentTheme?.accent || '#d97706');

        const wordColors = getEffectiveWordHighlightColor(
            ayahHighlightColor,
            settings?.wordHighlightColor,
            currentTheme?.id
        );

        const ayahEndColors = useMemo(() => {
            const themeId = currentTheme?.id;
            const defaultColor =
                isDark || themeId === 'deep_black' || themeId === 'black'
                    ? madinahPalette.gold
                    : madinahPalette.primary;

            const isSameOrTooClose = (candidate: string, against: string): boolean => {
                const c = candidate.trim().toLowerCase();
                const a = against.trim().toLowerCase();
                if (c === a) return true;
                const isRed = (h: string) => /#(dc2626|b91c1c|ef4444|e11d48|f43f5e|991b1b|831843)/.test(h);
                const isGreen = (h: string) => /#(15803d|16a34a|10b981|059669|047857|34d399)/.test(h);
                const isBlue = (h: string) => /#(3573a8|3b82f6|2563eb|0284c7|38bdf8|1d4ed8)/.test(h);
                const isAmberGold = (h: string) => /#(b45309|d4af37|d97706|f59e0b|fbbf24|c89b45)/.test(h);
                return (
                    (isRed(c) && isRed(a)) ||
                    (isGreen(c) && isGreen(a)) ||
                    (isBlue(c) && isBlue(a)) ||
                    (isAmberGold(c) && isAmberGold(a))
                );
            };

            const candidates =
                isDark || themeId === 'deep_black'
                    ? ['#38bdf8', '#f43f5e', '#34d399', '#fbbf24']
                    : themeId === 'maroon'
                        ? ['#059669', '#d97706', '#2563eb', '#dc2626']
                        : ['#dc2626', '#2563eb', '#059669', '#9333ea'];

            const selectedColor =
                candidates.find(
                    (cand) =>
                        !isSameOrTooClose(cand, defaultColor) &&
                        !isSameOrTooClose(cand, ayahHighlightColor)
                ) || candidates[0];

            return { defaultColor, selectedColor };
        }, [currentTheme?.id, isDark, madinahPalette.gold, madinahPalette.primary, ayahHighlightColor]);

        const isAyahHidden = (s: number, a: number, isHighlighted: boolean): boolean => {
            let shouldHide = Boolean(hideVerses && !isHighlighted);
            if (memorizationSettings?.isReviewMode) {
                const { fromSurah, fromAyah, toSurah, toAyah } = memorizationSettings;
                const isBefore = s < fromSurah || (s === fromSurah && a < fromAyah);
                const isAfter = s > toSurah || (s === toSurah && a > toAyah);
                const isInRange = !isBefore && !isAfter;
                const ayahKey = `${s}-${a}`;
                const isRevealed = revealedAyahs.includes(ayahKey) || tempRevealedAyah === ayahKey;
                if (isInRange) {
                    if (isRevealed) shouldHide = false;
                    else if (isRecording && tempRevealedAyah !== ayahKey) shouldHide = true;
                    else if (isPlaying && isHighlighted) shouldHide = false;
                    else shouldHide = true;
                } else {
                    shouldHide = false;
                }
            } else if (shouldHide && memorizationSettings) {
                const { fromSurah, fromAyah, toSurah, toAyah } = memorizationSettings;
                const isBefore = s < fromSurah || (s === fromSurah && a < fromAyah);
                const isAfter = s > toSurah || (s === toSurah && a > toAyah);
                if (isBefore || isAfter) shouldHide = false;
            }
            return shouldHide;
        };

        if (!qpcStore || pageLines.length === 0) {
            return (
                <div
                    ref={containerRef}
                    data-madinah-page={pageNum}
                    className="madinah-page-viewport flex items-center justify-center"
                >
                    <div
                        className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin opacity-40"
                        style={{ borderColor: `${textColor}40`, borderTopColor: 'transparent' }}
                    />
                </div>
            );
        }

        const basmallahFontSize = isOpeningPage
            ? Math.max(10, Math.min(fitMetrics.fontSizePx * 1.22, fitMetrics.rowHeightPx * 0.95))
            : Math.max(9, Math.min(fitMetrics.fontSizePx * 1.52, fitMetrics.rowHeightPx * 1.05));

        const seenAyahFirstWord = new Set<string>();

        const renderPageLine = (line: QpcLineLayout) => {
            const lineKey = `p${pageNum}-l${line.l}`;

            if (line.t === 's' && line.s) {
                const surahRowH = isOpeningPage ? fitMetrics.bannerHeightPx : fitMetrics.rowHeightPx;
                return (
                    <div
                        key={lineKey}
                        className="madinah-qpc-line madinah-qpc-line-surah"
                        style={
                            isOpeningPage
                                ? { height: `${Math.max(18, surahRowH)}px` }
                                : undefined
                        }
                    >
                        <MadinahSurahBanner
                            surahNumber={line.s}
                            currentTheme={currentTheme}
                            rowHeightPx={surahRowH}
                            frameDesign={settings?.madinahFrameDesign}
                        />
                    </div>
                );
            }

            if (line.t === 'b') {
                return (
                    <div
                        key={lineKey}
                        dir="rtl"
                        className="madinah-qpc-line madinah-qpc-line-basmallah"
                        style={
                            isOpeningPage
                                ? { height: `${Math.max(13, fitMetrics.rowHeightPx * 0.85)}px` }
                                : undefined
                        }
                    >
                        <div
                            dir="rtl"
                            className="madinah-qpc-basmallah-qpc"
                            style={{
                                fontFamily: `"${basmallahFontFamily}", ${ARABIC_DISPLAY_FONT}`,
                                fontSize: `${basmallahFontSize}px`,
                                color: bismillahColor,
                                WebkitTextStroke: settings?.isBold ? '0.32px currentColor' : '0px',
                            }}
                            aria-label="بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
                        >
                            {basmallahWords.map((bw) => (
                                <span key={`basmallah-${bw.id}`} className="madinah-qpc-basmallah-word">
                                    {bw.text}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            }

            // line.t === 'a' (15-line QPC V1 ayah words)
            const words: QpcWordEntry[] = [];
            if (line.fw !== undefined && line.lw !== undefined) {
                for (let wid = line.fw; wid <= line.lw; wid++) {
                    const w = qpcStore.wordsById[wid];
                    if (w) words.push(w);
                }
            }

            const isCenteredLine = line.c === 1;
            const lineScale = !isCenteredLine ? fitMetrics.lineScaleX[line.l] : undefined;
            const lineStyle: React.CSSProperties | undefined =
                isOpeningPage || lineScale
                    ? {
                          ...(isOpeningPage
                              ? { minHeight: `${Math.max(13, fitMetrics.rowHeightPx * 0.85)}px` }
                              : {}),
                          ...(lineScale
                              ? {
                                    transform: `scaleX(${lineScale})`,
                                    transformOrigin: 'center center',
                                }
                              : {}),
                      }
                    : undefined;

            return (
                <div
                    key={lineKey}
                    dir="rtl"
                    data-line-num={line.l}
                    className={`madinah-qpc-line madinah-qpc-line-ayah ${
                        isCenteredLine ? 'is-centered' : 'is-justified'
                    }`}
                    style={lineStyle}
                >
                    {words.map((w) => {
                        const ayahId = `ayah-${w.surah}-${w.ayah}`;
                        const isHighlighted = highlightedAyahId === ayahId;
                        const shouldHide = isAyahHidden(w.surah, w.ayah, isHighlighted);
                        const isSajdah = SAJDAH_SET.has(`${w.surah}:${w.ayah}`);

                        const isFirstOnPage =
                            isActiveSlide && !seenAyahFirstWord.has(ayahId);
                        if (isFirstOnPage) seenAyahFirstWord.add(ayahId);

                        const isWordHighlightActive =
                            isHighlighted &&
                            isPlaying &&
                            settings?.wordHighlightEnabled &&
                            audioProgress &&
                            audioProgress.duration > 0;

                        let isCurrentWord = false;
                        if (isWordHighlightActive && !w.isEnd && audioProgress) {
                            const totalWords = getAyahWordCount(qpcStore, w.surah, w.ayah);
                            const ratio = Math.min(
                                1,
                                Math.max(0, audioProgress.currentTime / audioProgress.duration)
                            );
                            const activeIdx = Math.min(
                                totalWords - 1,
                                Math.floor(ratio * totalWords)
                            );
                            isCurrentWord = w.word - 1 === activeIdx;
                        }

                        let wordColor: string | undefined;
                        if (w.isEnd) {
                            wordColor = isHighlighted
                                ? ayahEndColors.selectedColor
                                : ayahEndColors.defaultColor;
                        } else if (shouldHide) {
                            wordColor = 'transparent';
                        } else if (isWordHighlightActive) {
                            wordColor = isCurrentWord
                                ? wordColors.bg || '#dc2626'
                                : ayahHighlightColor;
                        } else if (isHighlighted) {
                            wordColor = ayahHighlightColor;
                        } else if (isSajdah) {
                            wordColor = undefined;
                        }

                        return (
                            <span
                                key={w.id}
                                id={isFirstOnPage ? ayahId : undefined}
                                data-word-id={w.id}
                                data-ayah-key={ayahId}
                                data-snum={w.surah}
                                data-ayah={w.ayah}
                                data-word={w.word}
                                data-sajdah={isSajdah || undefined}
                                className={`madinah-qpc-word ${
                                    w.isEnd ? 'madinah-qpc-word-end' : ''
                                } ${isHighlighted ? 'is-highlighted' : ''} ${
                                    shouldHide && !w.isEnd ? 'is-hidden-word' : ''
                                }`}
                                style={{
                                    color: wordColor,
                                    transition: isWordHighlightActive
                                        ? 'color 0.1s ease-in-out'
                                        : 'color 0.16s ease',
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isLongPressTriggered.current) {
                                        if (w.isEnd) {
                                            onVerseClick(w.surah, w.ayah, e);
                                        } else {
                                            onAyahClick(w.surah, w.ayah);
                                        }
                                    }
                                }}
                                onPointerDown={(e) =>
                                    handlePointerDown(w.surah, w.ayah, e, w.isEnd)
                                }
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                onPointerLeave={handlePointerLeave}
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                {w.text}
                            </span>
                        );
                    })}
                </div>
            );
        };

        const openingSurahLines = isOpeningPage ? pageLines.filter((l) => l.t === 's') : [];
        const openingTextLines = isOpeningPage ? pageLines.filter((l) => l.t !== 's') : [];

        return (
            <div
                ref={containerRef}
                data-madinah-page={pageNum}
                className={`madinah-page-viewport ${isOpeningPage ? 'madinah-opening-page' : ''}`}
            >
                <div
                    ref={contentRef}
                    dir="rtl"
                    className={`madinah-qpc-page ${isOpeningPage ? 'madinah-qpc-opening' : 'madinah-qpc-standard'}`}
                    style={{
                        fontFamily: `"${pageFontFamily}", ${ARABIC_DISPLAY_FONT}`,
                        fontSize: `${fitMetrics.fontSizePx}px`,
                        color: textColor,
                        WebkitTextStroke: settings?.isBold ? '0.32px currentColor' : '0px',
                        opacity: isFontReady ? 1 : 0,
                    }}
                >
                    {isOpeningPage && (
                        <MadinahOpeningTazhib
                            pageNum={pageNum}
                            bounds={tazhibBounds}
                            currentTheme={currentTheme}
                            frameDesign={settings?.madinahFrameDesign}
                        />
                    )}
                    {isOpeningPage ? (
                        <>
                            {openingSurahLines.map(renderPageLine)}
                            <div className="madinah-opening-text-center-stage">
                                {openingTextLines.map(renderPageLine)}
                            </div>
                        </>
                    ) : (
                        pageLines.map(renderPageLine)
                    )}
                </div>
            </div>
        );
    }
);

export default MadinahPageContent;
