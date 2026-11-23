import React, { useId } from 'react';
import { MadinahThemePalette } from './MadinahFrameSVG';

export type IslamicSurahDesignId = 1 | 2 | 3 | 4 | 7 | 9 | 10 | 11 | 14 | 15 | 16 | 19 | 20;

const VALID_DESIGNS: ReadonlySet<number> = new Set([1, 2, 3, 4, 7, 9, 10, 11, 14, 15, 16, 19, 20]);

export const normalizeIslamicSurahDesign = (design?: number): IslamicSurahDesignId => {
    const num = Number(design);
    return (VALID_DESIGNS.has(num) ? num : 1) as IslamicSurahDesignId;
};

/* ============================================================================
   1. ISLAMIC REPEATING BACKGROUND PATTERNS (Unique per design)
   ============================================================================ */

const SurahPatternContent: React.FC<{
    design: IslamicSurahDesignId;
    palette: MadinahThemePalette;
    isRichBand?: boolean;
}> = ({ design, palette, isRichBand = false }) => {
    const strokeMain = isRichBand ? palette.gold : palette.primary;
    const fillMain = isRichBand ? palette.cartoucheFill : palette.secondary;
    const dotColor = palette.gold;
    const strokeOpacity = isRichBand ? 0.34 : 0.22;
    const fillOpacity = isRichBand ? 0.14 : 0.16;

    switch (design) {
        case 2: // Andalusian Scalloped Arch Lattice
            return (
                <>
                    <path
                        d="M0 24 Q12 4 24 24 Q36 4 48 24"
                        fill={fillMain}
                        fillOpacity={fillOpacity}
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.85"
                    />
                    <path
                        d="M0 12 Q12 -6 24 12 Q36 -6 48 12"
                        fill="none"
                        stroke={dotColor}
                        strokeOpacity={0.32}
                        strokeWidth="0.65"
                    />
                    <circle cx="12" cy="14" r="1.4" fill={dotColor} fillOpacity="0.45" />
                    <circle cx="36" cy="14" r="1.4" fill={dotColor} fillOpacity="0.45" />
                </>
            );
        case 3: // Moroccan Rub el Hizb Eight-Pointed Star Grid
            return (
                <>
                    <rect x="6" y="6" width="12" height="12" fill={fillMain} fillOpacity={fillOpacity} stroke={strokeMain} strokeOpacity={strokeOpacity} strokeWidth="0.7" />
                    <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" fill="none" stroke={dotColor} strokeOpacity={0.35} strokeWidth="0.7" />
                    <rect x="30" y="6" width="12" height="12" fill={fillMain} fillOpacity={fillOpacity} stroke={strokeMain} strokeOpacity={strokeOpacity} strokeWidth="0.7" />
                    <rect x="30" y="6" width="12" height="12" transform="rotate(45 36 12)" fill="none" stroke={dotColor} strokeOpacity={0.35} strokeWidth="0.7" />
                    <circle cx="12" cy="12" r="1.3" fill={dotColor} fillOpacity="0.5" />
                    <circle cx="36" cy="12" r="1.3" fill={dotColor} fillOpacity="0.5" />
                </>
            );
        case 4: // Mamluk Trefoil Arcade
            return (
                <>
                    <path
                        d="M2 22 V10 Q12 2 22 10 V22 M26 22 V10 Q36 2 46 10 V22"
                        fill={fillMain}
                        fillOpacity={fillOpacity}
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.8"
                    />
                    <circle cx="12" cy="13" r="2.2" fill="none" stroke={dotColor} strokeOpacity="0.38" strokeWidth="0.7" />
                    <circle cx="36" cy="13" r="2.2" fill="none" stroke={dotColor} strokeOpacity="0.38" strokeWidth="0.7" />
                    <circle cx="12" cy="13" r="0.9" fill={dotColor} fillOpacity="0.5" />
                    <circle cx="36" cy="13" r="0.9" fill={dotColor} fillOpacity="0.5" />
                </>
            );
        case 7: // Ottoman Shamsa & Concentric Rings
            return (
                <>
                    <circle cx="12" cy="12" r="7.5" fill="none" stroke={strokeMain} strokeOpacity={strokeOpacity} strokeWidth="0.7" />
                    <circle cx="12" cy="12" r="4.2" fill={fillMain} fillOpacity={fillOpacity} stroke={dotColor} strokeOpacity={0.35} strokeWidth="0.65" />
                    <circle cx="36" cy="12" r="7.5" fill="none" stroke={strokeMain} strokeOpacity={strokeOpacity} strokeWidth="0.7" />
                    <circle cx="36" cy="12" r="4.2" fill={fillMain} fillOpacity={fillOpacity} stroke={dotColor} strokeOpacity={0.35} strokeWidth="0.65" />
                    <circle cx="24" cy="12" r="1.3" fill={dotColor} fillOpacity="0.45" />
                    <circle cx="0" cy="12" r="1.3" fill={dotColor} fillOpacity="0.45" />
                    <circle cx="48" cy="12" r="1.3" fill={dotColor} fillOpacity="0.45" />
                </>
            );
        case 9: // Kufic Stepped Meander Lattice
            return (
                <>
                    <path
                        d="M3 4 H21 V20 H9 V9 H15 V15 M27 20 H45 V4 H33 V15 H39 V9"
                        fill="none"
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.85"
                        strokeLinejoin="miter"
                    />
                    <rect x="22.5" y="10.5" width="3" height="3" fill={dotColor} fillOpacity="0.45" />
                </>
            );
        case 10: // Seljuk Girih Hexagonal Honeycomb
            return (
                <>
                    <polygon
                        points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5"
                        fill={fillMain}
                        fillOpacity={fillOpacity}
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.75"
                    />
                    <polygon
                        points="36,3 44,7.5 44,16.5 36,21 28,16.5 28,7.5"
                        fill={fillMain}
                        fillOpacity={fillOpacity}
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.75"
                    />
                    <circle cx="12" cy="12" r="1.4" fill={dotColor} fillOpacity="0.45" />
                    <circle cx="36" cy="12" r="1.4" fill={dotColor} fillOpacity="0.45" />
                </>
            );
        case 11: // Almond Lozenge & Pearl Chain
            return (
                <>
                    <path
                        d="M0 12 Q12 3 24 12 Q12 21 0 12 Z M24 12 Q36 3 48 12 Q36 21 24 12 Z"
                        fill={fillMain}
                        fillOpacity={fillOpacity}
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.75"
                    />
                    <circle cx="12" cy="12" r="1.5" fill={dotColor} fillOpacity="0.5" />
                    <circle cx="36" cy="12" r="1.5" fill={dotColor} fillOpacity="0.5" />
                    <circle cx="24" cy="12" r="1.1" fill={dotColor} fillOpacity="0.4" />
                </>
            );
        case 14: // Damascene Diagonal Braided Strapwork
            return (
                <>
                    <path
                        d="M0 0 L24 24 M24 0 L0 24 M24 0 L48 24 M48 0 L24 24"
                        fill="none"
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.8"
                    />
                    <polygon points="12,8 16,12 12,16 8,12" fill={fillMain} fillOpacity={fillOpacity} stroke={dotColor} strokeOpacity="0.4" strokeWidth="0.65" />
                    <polygon points="36,8 40,12 36,16 32,12" fill={fillMain} fillOpacity={fillOpacity} stroke={dotColor} strokeOpacity="0.4" strokeWidth="0.65" />
                </>
            );
        case 15: // Abbasid Arabesque Vine Scrolls
            return (
                <>
                    <path
                        d="M0 12 C6 4 12 4 18 12 C24 20 30 20 36 12 C42 4 46 6 48 12"
                        fill="none"
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.85"
                    />
                    <path
                        d="M0 12 C6 20 12 20 18 12 C24 4 30 4 36 12 C42 20 46 18 48 12"
                        fill="none"
                        stroke={dotColor}
                        strokeOpacity="0.32"
                        strokeWidth="0.75"
                    />
                    <circle cx="9" cy="12" r="1.3" fill={dotColor} fillOpacity="0.45" />
                    <circle cx="27" cy="12" r="1.3" fill={dotColor} fillOpacity="0.45" />
                </>
            );
        case 16: // Octagonal Dome Rosette Tile
            return (
                <>
                    <polygon
                        points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8"
                        fill={fillMain}
                        fillOpacity={fillOpacity}
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.75"
                    />
                    <polygon
                        points="32,3 40,3 45,8 45,16 40,21 32,21 27,16 27,8"
                        fill={fillMain}
                        fillOpacity={fillOpacity}
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.75"
                    />
                    <polygon points="12,8 16,12 12,16 8,12" fill={dotColor} fillOpacity="0.32" />
                    <polygon points="36,8 40,12 36,16 32,12" fill={dotColor} fillOpacity="0.32" />
                </>
            );
        case 19: // Grand Illuminated Mushaf Floral Filigree
            return (
                <>
                    <path
                        d="M2 12 C8 5 16 5 24 12 C16 19 8 19 2 12 Z M24 12 C32 5 40 5 46 12 C40 19 32 19 24 12 Z"
                        fill={fillMain}
                        fillOpacity={fillOpacity}
                        stroke={dotColor}
                        strokeOpacity="0.42"
                        strokeWidth="0.75"
                    />
                    <circle cx="13" cy="12" r="1.8" fill={dotColor} fillOpacity="0.48" />
                    <circle cx="35" cy="12" r="1.8" fill={dotColor} fillOpacity="0.48" />
                </>
            );
        case 20: // Fatimid Radiating Sunburst Rosette
            return (
                <>
                    {[0, 45, 90, 135].map((deg) => (
                        <ellipse
                            key={deg}
                            cx="12"
                            cy="12"
                            rx="7"
                            ry="2.2"
                            transform={`rotate(${deg} 12 12)`}
                            fill={fillMain}
                            fillOpacity={fillOpacity}
                            stroke={strokeMain}
                            strokeOpacity={strokeOpacity}
                            strokeWidth="0.6"
                        />
                    ))}
                    {[0, 45, 90, 135].map((deg) => (
                        <ellipse
                            key={`b-${deg}`}
                            cx="36"
                            cy="12"
                            rx="7"
                            ry="2.2"
                            transform={`rotate(${deg} 36 12)`}
                            fill={fillMain}
                            fillOpacity={fillOpacity}
                            stroke={strokeMain}
                            strokeOpacity={strokeOpacity}
                            strokeWidth="0.6"
                        />
                    ))}
                    <circle cx="12" cy="12" r="1.5" fill={dotColor} fillOpacity="0.55" />
                    <circle cx="36" cy="12" r="1.5" fill={dotColor} fillOpacity="0.55" />
                </>
            );
        case 1:
        default: // Royal Classic Leaf-Lattice Pattern
            return (
                <>
                    <path
                        d="M3 12 C9 6 15 6 24 12 C15 18 9 18 3 12 Z M24 12 C33 6 39 6 45 12 C39 18 33 18 24 12 Z"
                        fill={fillMain}
                        fillOpacity={fillOpacity}
                        stroke={strokeMain}
                        strokeOpacity={strokeOpacity}
                        strokeWidth="0.7"
                    />
                    <circle cx="24" cy="12" r="1.6" fill={dotColor} fillOpacity="0.42" />
                    <circle cx="13.5" cy="12" r="0.9" fill={dotColor} fillOpacity="0.35" />
                    <circle cx="34.5" cy="12" r="0.9" fill={dotColor} fillOpacity="0.35" />
                </>
            );
    }
};

/* ============================================================================
   2. FOUR CORNER ROSETTE / SEAL ORNAMENTS
   ============================================================================ */

const SurahCornerOrnamentSVG: React.FC<{
    design: IslamicSurahDesignId;
    palette: MadinahThemePalette;
    posClass: string;
}> = ({ design, palette, posClass }) => {
    switch (design) {
        case 2:
        case 7:
            return (
                <svg viewBox="0 0 14 14" className={`absolute ${posClass} w-[11px] h-[11px] pointer-events-none z-20`} aria-hidden="true">
                    <circle cx="7" cy="7" r="5.5" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1" />
                    <circle cx="7" cy="7" r="2.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
        case 3:
        case 10:
            return (
                <svg viewBox="0 0 14 14" className={`absolute ${posClass} w-[11px] h-[11px] pointer-events-none z-20`} aria-hidden="true">
                    <rect x="2.5" y="2.5" width="9" height="9" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.95" />
                    <rect x="2.5" y="2.5" width="9" height="9" transform="rotate(45 7 7)" fill={palette.gold} fillOpacity="0.65" stroke={palette.primary} strokeWidth="0.65" />
                    <circle cx="7" cy="7" r="1.3" fill={palette.cartoucheFill} />
                </svg>
            );
        case 9:
            return (
                <svg viewBox="0 0 14 14" className={`absolute ${posClass} w-[11px] h-[11px] pointer-events-none z-20`} aria-hidden="true">
                    <rect x="1.5" y="1.5" width="11" height="11" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.05" />
                    <rect x="4" y="4" width="6" height="6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                </svg>
            );
        case 4:
        case 16:
        case 19:
            return (
                <svg viewBox="0 0 14 14" className={`absolute ${posClass} w-[11px] h-[11px] pointer-events-none z-20`} aria-hidden="true">
                    <polygon points="4,1.5 10,1.5 12.5,4 12.5,10 10,12.5 4,12.5 1.5,10 1.5,4" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.95" />
                    <circle cx="7" cy="7" r="2.3" fill={palette.gold} stroke={palette.primary} strokeWidth="0.45" />
                </svg>
            );
        case 11:
        case 14:
        case 15:
        case 20:
            return (
                <svg viewBox="0 0 14 14" className={`absolute ${posClass} w-[11px] h-[11px] pointer-events-none z-20`} aria-hidden="true">
                    <path d="M7 1.2 L8.7 5.3 L12.8 7 L8.7 8.7 L7 12.8 L5.3 8.7 L1.2 7 L5.3 5.3 Z" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                    <circle cx="7" cy="7" r="1.4" fill={palette.cartoucheFill} />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 14 14" className={`absolute ${posClass} w-[11px] h-[11px] pointer-events-none z-20`} aria-hidden="true">
                    <rect x="1.5" y="1.5" width="11" height="11" rx="2" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.95" />
                    <path d="M7 2.5 L8.3 5.7 L11.5 7 L8.3 8.3 L7 11.5 L5.7 8.3 L2.5 7 L5.7 5.7 Z" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="7" cy="7" r="1.1" fill={palette.cartoucheFill} />
                </svg>
            );
    }
};

/* ============================================================================
   3. STRETCHABLE 3-PART ISLAMIC CENTER CARTOUCHE (No distortion at any width)
   ============================================================================ */

const IslamicCenterCartoucheSVG: React.FC<{
    design: IslamicSurahDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    const fill = palette.cartoucheFill;
    const pStroke = palette.primary;
    const gStroke = palette.gold;

    switch (design) {
        case 2: // Andalusian Pointed Moorish Arch
            return (
                <div className="absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M20 1.5 L12 1.5 C5 5.5 1.5 13 1.5 20 C1.5 27 5 34.5 12 38.5 L20 38.5 Z" fill={fill} />
                        <path d="M20 1.5 L12 1.5 C5 5.5 1.5 13 1.5 20 C1.5 27 5 34.5 12 38.5 L20 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M20 4.2 L13 4.2 C7.5 7.5 4.5 13.8 4.5 20 C4.5 26.2 7.5 32.5 13 35.8 L20 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="9.2" cy="20" r="2.2" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={fill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L8 1.5 C15 5.5 18.5 13 18.5 20 C18.5 27 15 34.5 8 38.5 L0 38.5 Z" fill={fill} />
                        <path d="M0 1.5 L8 1.5 C15 5.5 18.5 13 18.5 20 C18.5 27 15 34.5 8 38.5 L0 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L7 4.2 C12.5 7.5 15.5 13.8 15.5 20 C15.5 26.2 12.5 32.5 7 35.8 L0 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="10.8" cy="20" r="2.2" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                </div>
            );

        case 3: // Eight-Pointed Star Faceted Chevron Cartouche
            return (
                <div className="absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M20 1.5 L12 1.5 L7.5 8 L1.5 20 L7.5 32 L12 38.5 L20 38.5 Z" fill={fill} />
                        <path d="M20 1.5 L12 1.5 L7.5 8 L1.5 20 L7.5 32 L12 38.5 L20 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M20 4.2 L13.5 4.2 L9.5 10 L4.5 20 L9.5 30 L13.5 35.8 L20 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <polygon points="10.5,16.8 13.2,20 10.5,23.2 7.8,20" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={fill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L8 1.5 L12.5 8 L18.5 20 L12.5 32 L8 38.5 L0 38.5 Z" fill={fill} />
                        <path d="M0 1.5 L8 1.5 L12.5 8 L18.5 20 L12.5 32 L8 38.5 L0 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L6.5 4.2 L10.5 10 L15.5 20 L10.5 30 L6.5 35.8 L0 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <polygon points="9.5,16.8 12.2,20 9.5,23.2 6.8,20" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                </div>
            );

        case 4: // Mamluk Trefoil Lobed Mihrab Cartouche
        case 14: // Damascene Quatrefoil Cartouche
            return (
                <div className="absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M20 1.5 L13 1.5 Q8 1.5 6.8 9 Q1.5 13.5 1.5 20 Q1.5 26.5 6.8 31 Q8 38.5 13 38.5 L20 38.5 Z" fill={fill} />
                        <path d="M20 1.5 L13 1.5 Q8 1.5 6.8 9 Q1.5 13.5 1.5 20 Q1.5 26.5 6.8 31 Q8 38.5 13 38.5 L20 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M20 4.2 L13.5 4.2 Q9.8 4.2 9 10.5 Q4.5 14.5 4.5 20 Q4.5 25.5 9 29.5 Q9.8 35.8 13.5 35.8 L20 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="9.6" cy="20" r="2.1" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={fill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L7 1.5 Q12 1.5 13.2 9 Q18.5 13.5 18.5 20 Q18.5 26.5 13.2 31 Q12 38.5 7 38.5 L0 38.5 Z" fill={fill} />
                        <path d="M0 1.5 L7 1.5 Q12 1.5 13.2 9 Q18.5 13.5 18.5 20 Q18.5 26.5 13.2 31 Q12 38.5 7 38.5 L0 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L6.5 4.2 Q10.2 4.2 11 10.5 Q15.5 14.5 15.5 20 Q15.5 25.5 11 29.5 Q10.2 35.8 6.5 35.8 L0 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="10.4" cy="20" r="2.1" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                </div>
            );

        case 7: // Ottoman Smooth Triple-Line Medallion
            return (
                <div className="absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M20 2 L15 2 A13.5 18 0 0 0 15 38 L20 38 Z" fill={fill} />
                        <path d="M20 2 L15 2 A13.5 18 0 0 0 15 38 L20 38" fill="none" stroke={pStroke} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M20 4.8 L15.5 4.8 A10.8 15.2 0 0 0 15.5 35.2 L20 35.2" fill="none" stroke={gStroke} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <circle cx="7.5" cy="20" r="1.9" fill={gStroke} />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="2" width="102" height="36" fill={fill} />
                        <line x1="-1" y1="2" x2="101" y2="2" stroke={pStroke} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38" x2="101" y2="38" stroke={pStroke} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.8" x2="101" y2="4.8" stroke={gStroke} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.2" x2="101" y2="35.2" stroke={gStroke} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 2 L5 2 A13.5 18 0 0 1 5 38 L0 38 Z" fill={fill} />
                        <path d="M0 2 L5 2 A13.5 18 0 0 1 5 38 L0 38" fill="none" stroke={pStroke} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.8 L4.5 4.8 A10.8 15.2 0 0 1 4.5 35.2 L0 35.2" fill="none" stroke={gStroke} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <circle cx="12.5" cy="20" r="1.9" fill={gStroke} />
                    </svg>
                </div>
            );

        case 9: // Kufic Stepped Architectural Ziggurat
            return (
                <div className="absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M20 1.5 L9 1.5 L9 7.5 L2 7.5 L2 32.5 L9 32.5 L9 38.5 L20 38.5 Z" fill={fill} />
                        <path d="M20 1.5 L9 1.5 L9 7.5 L2 7.5 L2 32.5 L9 32.5 L9 38.5 L20 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <path d="M20 4.2 L11.5 4.2 L11.5 10 L4.8 10 L4.8 30 L11.5 30 L11.5 35.8 L20 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <rect x="7" y="18" width="4" height="4" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={fill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 20 40" className="w-[16px] sm:w-[20px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L11 1.5 L11 7.5 L18 7.5 L18 32.5 L11 32.5 L11 38.5 L0 38.5 Z" fill={fill} />
                        <path d="M0 1.5 L11 1.5 L11 7.5 L18 7.5 L18 32.5 L11 32.5 L11 38.5 L0 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L8.5 4.2 L8.5 10 L15.2 10 L15.2 30 L8.5 30 L8.5 35.8 L0 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <rect x="9" y="18" width="4" height="4" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                </div>
            );

        case 11: // Pointed Almond Lawzah Cartouche
        case 15: // Winged Arabesque Scroll Cartouche
            return (
                <div className="absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 22 40" className="w-[18px] sm:w-[22px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M22 1.5 L15 1.5 Q9 6 1.5 20 Q9 34 15 38.5 L22 38.5 Z" fill={fill} />
                        <path d="M22 1.5 L15 1.5 Q9 6 1.5 20 Q9 34 15 38.5 L22 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M22 4.2 L16 4.2 Q11 8 4.8 20 Q11 32 16 35.8 L22 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="9.5" cy="20" r="2" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={fill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 22 40" className="w-[18px] sm:w-[22px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L7 1.5 Q13 6 20.5 20 Q13 34 7 38.5 L0 38.5 Z" fill={fill} />
                        <path d="M0 1.5 L7 1.5 Q13 6 20.5 20 Q13 34 7 38.5 L0 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L6 4.2 Q11 8 17.2 20 Q11 32 6 35.8 L0 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="12.5" cy="20" r="2" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                </div>
            );

        case 10: // Seljuk Hexagonal Pointed Cartouche
        case 16: // Octagonal Dome Cartouche
        case 19: // Grand Illuminated Cartouche
        case 20: // Fatimid Fluted Cartouche
        case 1:
        default: // Classic Chamfered Octagonal Cartouche
            return (
                <div className="absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[15px] sm:w-[18px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 1.5 L9 1.5 L1.5 10 L1.5 30 L9 38.5 L18 38.5 Z" fill={fill} />
                        <path d="M18 1.5 L9 1.5 L1.5 10 L1.5 30 L9 38.5 L18 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.2 L10.5 4.2 L4.4 11.2 L4.4 28.8 L10.5 35.8 L18 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <polygon points="8.5,17 11.4,20 8.5,23 5.6,20" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={fill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={pStroke} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={gStroke} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[15px] sm:w-[18px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L9 1.5 L16.5 10 L16.5 30 L9 38.5 L0 38.5 Z" fill={fill} />
                        <path d="M0 1.5 L9 1.5 L16.5 10 L16.5 30 L9 38.5 L0 38.5" fill="none" stroke={pStroke} strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L7.5 4.2 L13.6 11.2 L13.6 28.8 L7.5 35.8 L0 35.8" fill="none" stroke={gStroke} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <polygon points="9.5,17 12.4,20 9.5,23 6.6,20" fill={gStroke} stroke={pStroke} strokeWidth="0.6" />
                    </svg>
                </div>
            );
    }
};

/* ============================================================================
   4. FLANKING SIDE MEDALLION FRAMES (Ayah Count & Revelation Type)
   ============================================================================ */

const IslamicSideMedallionSVG: React.FC<{
    design: IslamicSurahDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    const fill = palette.cartoucheFill;
    const pStroke = palette.primary;
    const gStroke = palette.gold;

    switch (design) {
        case 2: // Andalusian Scalloped Arch Badge
            return (
                <svg viewBox="0 0 80 34" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M16 1.5 L64 1.5 C74 4 78.5 10.5 78.5 17 C78.5 23.5 74 30 64 32.5 L16 32.5 C6 30 1.5 23.5 1.5 17 C1.5 10.5 6 4 16 1.5 Z" fill={fill} stroke={pStroke} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                    <path d="M17.5 4 L62.5 4 C70.5 6 74.5 11.2 74.5 17 C74.5 22.8 70.5 28 62.5 30 L17.5 30 C9.5 28 5.5 22.8 5.5 17 C5.5 11.2 9.5 6 17.5 4 Z" fill="none" stroke={gStroke} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                </svg>
            );
        case 3: // Star Chevron Diamond Medallion
        case 11: // Pointed Almond Medallion
            return (
                <svg viewBox="0 0 80 34" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <polygon points="14,1.5 66,1.5 78.5,17 66,32.5 14,32.5 1.5,17" fill={fill} stroke={pStroke} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                    <polygon points="15.5,4 64.5,4 74.5,17 64.5,30 15.5,30 5.5,17" fill="none" stroke={gStroke} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                </svg>
            );
        case 4: // Mamluk Trefoil Badge
        case 14: // Damascene Quatrefoil Badge
        case 20: // Fatimid Scalloped Badge
            return (
                <svg viewBox="0 0 80 34" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M14 1.5 L66 1.5 Q71 1.5 72.5 8 Q78.5 12 78.5 17 Q78.5 22 72.5 26 Q71 32.5 66 32.5 L14 32.5 Q9 32.5 7.5 26 Q1.5 22 1.5 17 Q1.5 12 7.5 8 Q9 1.5 14 1.5 Z" fill={fill} stroke={pStroke} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                    <path d="M15.5 4 L64.5 4 Q68.5 4 69.8 9.2 Q74.5 12.6 74.5 17 Q74.5 21.4 69.8 24.8 Q68.5 30 64.5 30 L15.5 30 Q11.5 30 10.2 24.8 Q5.5 21.4 5.5 17 Q5.5 12.6 10.2 9.2 Q11.5 4 15.5 4 Z" fill="none" stroke={gStroke} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                </svg>
            );
        case 7: // Ottoman Pill / Roundel Medallion
        case 19:
            return (
                <svg viewBox="0 0 80 34" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <rect x="2" y="2" width="76" height="30" rx="15" fill={fill} stroke={pStroke} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                    <rect x="5" y="4.5" width="70" height="25" rx="12.5" fill="none" stroke={gStroke} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                </svg>
            );
        case 9: // Kufic Stepped Plaque
            return (
                <svg viewBox="0 0 80 34" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <polygon points="10,1.5 70,1.5 70,6.5 78,6.5 78,27.5 70,27.5 70,32.5 10,32.5 10,27.5 2,27.5 2,6.5 10,6.5" fill={fill} stroke={pStroke} strokeWidth="1.25" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                    <rect x="7.5" y="4.5" width="65" height="25" fill="none" stroke={gStroke} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                </svg>
            );
        case 10: // Seljuk Hexagonal Badge
        case 15: // Abbasid Winged Badge
        case 16: // Octagonal Seal Badge
        case 1:
        default:
            return (
                <svg viewBox="0 0 80 34" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <polygon points="10,1.5 70,1.5 78.5,9.5 78.5,24.5 70,32.5 10,32.5 1.5,24.5 1.5,9.5" fill={fill} stroke={pStroke} strokeWidth="1.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    <polygon points="12,4 68,4 74.8,10.5 74.8,23.5 68,30 12,30 5.2,23.5 5.2,10.5" fill="none" stroke={gStroke} strokeWidth="0.9" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
            );
    }
};

/* ============================================================================
   5. COMPLETE ISLAMIC SURAH HEADER COMPONENT
   ============================================================================ */

interface IslamicSurahHeaderViewProps {
    design: IslamicSurahDesignId;
    palette: MadinahThemePalette;
    isDark: boolean;
    fullSurahName: string;
    displayAyahCount: string;
    displaySurahType: string;
    quranFont: string;
    hafsFont: string;
    compact: boolean;
    isEnglishDisplay: boolean;
}

export const IslamicSurahHeaderView: React.FC<IslamicSurahHeaderViewProps> = ({
    design,
    palette,
    isDark,
    fullSurahName,
    displayAyahCount,
    displaySurahType,
    quranFont,
    hafsFont,
    compact,
    isEnglishDisplay,
}) => {
    const uid = useId().replace(/:/g, '');
    const patId = `surah-islamic-pat-${design}-${uid}`;
    const isRichBand = design === 19;
    const outerBg = isRichBand ? (isDark ? palette.deep : palette.primary) : palette.frameBg;
    const outerBorder = isRichBand ? palette.gold : palette.primary;
    const innerHairline = isRichBand ? palette.cartoucheFill : palette.gold;

    const sidePlaqueSizeClass = compact
        ? isEnglishDisplay
            ? 'w-[68px] h-[29px] px-2'
            : 'w-[62px] h-[29px] px-2'
        : isEnglishDisplay
        ? 'w-[76px] sm:w-[92px] h-[30px] sm:h-[34px] px-2 sm:px-3'
        : 'w-[68px] sm:w-[86px] h-[30px] sm:h-[34px] px-2 sm:px-3';

    return (
        <div
            className="surah-header-visual relative h-14 w-full flex items-center justify-between rounded-lg overflow-hidden select-none"
            style={{
                backgroundColor: outerBg,
                border: `1.5px solid ${outerBorder}`,
                boxShadow: 'none',
            }}
        >
            {/* Inner Gold / Manuscript Double-Border Hairline */}
            <div
                className="absolute inset-[2.5px] rounded-[5px] pointer-events-none z-10"
                style={{
                    border: `1px solid ${innerHairline}`,
                    opacity: isRichBand ? 0.55 : 0.72,
                }}
            />

            {/* Repeating Islamic Geometric / Arabesque Pattern */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
            >
                <defs>
                    <pattern
                        id={patId}
                        width="48"
                        height="24"
                        patternUnits="userSpaceOnUse"
                    >
                        <SurahPatternContent
                            design={design}
                            palette={palette}
                            isRichBand={isRichBand}
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patId})`} />
            </svg>

            {/* 4 Ornamental Corner Rosettes */}
            <SurahCornerOrnamentSVG design={design} palette={palette} posClass="top-0.5 left-0.5" />
            <SurahCornerOrnamentSVG design={design} palette={palette} posClass="top-0.5 right-0.5" />
            <SurahCornerOrnamentSVG design={design} palette={palette} posClass="bottom-0.5 left-0.5" />
            <SurahCornerOrnamentSVG design={design} palette={palette} posClass="bottom-0.5 right-0.5" />

            {/* 3-Zone Responsive Flex Content (Never overlaps side plaques or center cartouche) */}
            <div
                className={`relative z-20 w-full h-full flex items-center justify-between ${
                    compact ? 'px-2 gap-1.5' : 'px-2.5 sm:px-5 gap-2 sm:gap-3'
                }`}
            >
                {/* Right Plaque (RTL: Ayah Count | LTR: Verses Count) */}
                <div
                    className={`relative shrink-0 flex items-center justify-center ${sidePlaqueSizeClass}`}
                >
                    <IslamicSideMedallionSVG design={design} palette={palette} />
                    <span
                        className={`relative z-10 w-full h-full flex items-center justify-center text-center font-bold whitespace-nowrap leading-none ${
                            compact
                                ? 'text-[10px] sm:text-xs'
                                : 'text-[11px] sm:text-[13px]'
                        }`}
                        style={{
                            color: palette.metaText,
                            fontFamily: hafsFont,
                            textShadow: 'none',
                        }}
                    >
                        {displayAyahCount}
                    </span>
                </div>

                {/* Center Illuminated Surah Name Cartouche */}
                <div className="flex-1 min-w-0 flex items-center justify-center">
                    <div
                        className={`relative w-full flex items-center justify-center ${
                            compact
                                ? 'max-w-[195px] sm:max-w-[235px] h-[36px] px-5'
                                : 'max-w-[240px] sm:max-w-[310px] h-[38px] sm:h-[42px] px-6 sm:px-8'
                        }`}
                    >
                        <IslamicCenterCartoucheSVG design={design} palette={palette} />
                        <h2
                            className={`relative z-10 w-full h-full flex items-center justify-center text-center font-bold whitespace-nowrap overflow-x-hidden overflow-y-visible mb-0 leading-none ${
                                isEnglishDisplay
                                    ? compact
                                        ? 'text-xs sm:text-sm'
                                        : 'text-xs sm:text-base'
                                    : compact
                                    ? 'text-[13px] sm:text-[15px]'
                                    : 'text-[15px] sm:text-lg'
                            }`}
                            style={{
                                color: palette.bannerText,
                                fontFamily: quranFont,
                                textShadow: 'none',
                            }}
                        >
                            {fullSurahName}
                        </h2>
                    </div>
                </div>

                {/* Left Plaque (RTL: Meccan/Medinan | LTR: Revelation Type) */}
                <div
                    className={`relative shrink-0 flex items-center justify-center ${sidePlaqueSizeClass}`}
                >
                    <IslamicSideMedallionSVG design={design} palette={palette} />
                    <span
                        className={`relative z-10 w-full h-full flex items-center justify-center text-center font-bold whitespace-nowrap leading-none ${
                            compact
                                ? 'text-[10px] sm:text-xs'
                                : 'text-[11px] sm:text-[13px]'
                        }`}
                        style={{
                            color: palette.metaText,
                            fontFamily: hafsFont,
                            textShadow: 'none',
                        }}
                    >
                        {displaySurahType}
                    </span>
                </div>
            </div>
        </div>
    );
};
