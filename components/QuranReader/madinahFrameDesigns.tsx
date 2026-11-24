import React, { useId } from 'react';
import type { MadinahThemePalette } from './MadinahFrameSVG';

export type MadinahFrameDesignId = 1 | 2 | 3 | 4 | 5 | 6;

export interface MadinahFrameDesignMeta {
    id: MadinahFrameDesignId;
    nameAr: string;
    nameEn: string;
}

export const MADINAH_FRAME_DESIGNS: MadinahFrameDesignMeta[] = [
    { id: 1, nameAr: 'المصحف الملكي', nameEn: 'Royal Madinah' },
    { id: 2, nameAr: 'الأندلسي المقوّس', nameEn: 'Andalusian Arch' },
    { id: 3, nameAr: 'النجمة الثمانية', nameEn: 'Eight-Point Star' },
    { id: 4, nameAr: 'المملوكي المزخرف', nameEn: 'Mamluk Mihrab' },
    { id: 5, nameAr: 'العثماني الهادئ', nameEn: 'Ottoman Rumi' },
    { id: 6, nameAr: 'الكوفي المعماري', nameEn: 'Kufic Geometric' },
];

export const normalizeMadinahFrameDesign = (raw?: number | string): MadinahFrameDesignId => {
    const num = Number(raw);
    if (num >= 1 && num <= 6) return Math.round(num) as MadinahFrameDesignId;
    return 1;
};

export const FRAME_TO_SURAH_HEADER_DESIGN: Record<MadinahFrameDesignId, number> = {
    1: 1, // Royal Madinah
    2: 2, // Andalusian Arch
    3: 3, // Eight-Point Star
    4: 4, // Mamluk Mihrab
    5: 7, // Ottoman Rumi
    6: 9, // Kufic Geometric
};

export const getSurahHeaderDesignForFrame = (raw?: number | string): number => {
    const id = normalizeMadinahFrameDesign(raw);
    return FRAME_TO_SURAH_HEADER_DESIGN[id] ?? 1;
};

/* ============================================================================
   1. OUTER PAGE FRAME: Side Patterns, Top Caps, Corners, Bottom Edge & Medallion
   ============================================================================ */

export const MadinahVerticalPatternContent: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Arch Wave & Pearls
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.3" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M3.5 0 Q12.5 9 3.5 18 Q12.5 27 3.5 36"
                        fill="none"
                        stroke={palette.primary}
                        strokeWidth="1.0"
                    />
                    <path
                        d="M12.5 0 Q3.5 9 12.5 18 Q3.5 27 12.5 36"
                        fill={palette.secondary}
                        fillOpacity="0.22"
                        stroke={palette.gold}
                        strokeWidth="0.85"
                    />
                    <circle cx="8" cy="9" r="1.7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="8" cy="27" r="1.7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="8" cy="18" r="1.2" fill={palette.deep} />
                </>
            );
        case 3: // Eight-Point Star / Geometric Rub el Hizb Lattice
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.3" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <polygon
                        points="8,2 13,9 8,16 3,9"
                        fill={palette.secondary}
                        fillOpacity="0.34"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <polygon
                        points="8,20 13,27 8,34 3,27"
                        fill={palette.secondary}
                        fillOpacity="0.34"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <rect x="5.5" y="6.5" width="5" height="5" fill={palette.gold} fillOpacity="0.7" stroke={palette.deep} strokeWidth="0.5" />
                    <rect x="5.5" y="24.5" width="5" height="5" fill={palette.gold} fillOpacity="0.7" stroke={palette.deep} strokeWidth="0.5" />
                    <polygon points="8,15.5 10.5,18 8,20.5 5.5,18" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </>
            );
        case 4: // Mamluk Mihrab Trefoil Arcade
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.4" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M3 2 L12.5 2 L12.5 16 L3 16 Z"
                        fill={palette.secondary}
                        fillOpacity="0.2"
                        stroke={palette.primary}
                        strokeWidth="0.7"
                    />
                    <path
                        d="M3.5 9 Q7.5 4.5 12 9 Q7.5 13.5 3.5 9 Z"
                        fill={palette.gold}
                        fillOpacity="0.6"
                        stroke={palette.primary}
                        strokeWidth="0.75"
                    />
                    <path
                        d="M3 20 L12.5 20 L12.5 34 L3 34 Z"
                        fill={palette.secondary}
                        fillOpacity="0.2"
                        stroke={palette.primary}
                        strokeWidth="0.7"
                    />
                    <path
                        d="M3.5 27 Q7.5 22.5 12 27 Q7.5 31.5 3.5 27 Z"
                        fill={palette.gold}
                        fillOpacity="0.6"
                        stroke={palette.primary}
                        strokeWidth="0.75"
                    />
                    <circle cx="8" cy="18" r="1.5" fill={palette.deep} />
                </>
            );
        case 5: // Ottoman Rumi Minimalist Knots
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1.2" y1="0" x2="1.2" y2="36" stroke={palette.primary} strokeWidth="1.1" />
                    <line x1="3.6" y1="0" x2="3.6" y2="36" stroke={palette.gold} strokeWidth="0.65" strokeOpacity="0.75" />
                    <line x1="14.8" y1="0" x2="14.8" y2="36" stroke={palette.gold} strokeWidth="1.0" />
                    <line x1="9" y1="0" x2="9" y2="36" stroke={palette.primary} strokeWidth="0.55" strokeOpacity="0.35" />
                    <circle cx="9" cy="18" r="3.4" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.85" />
                    <circle cx="9" cy="18" r="1.5" fill={palette.gold} />
                    <circle cx="9" cy="6" r="1.1" fill={palette.gold} fillOpacity="0.8" />
                    <circle cx="9" cy="30" r="1.1" fill={palette.gold} fillOpacity="0.8" />
                </>
            );
        case 6: // Kufic Geometric Fretwork
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.3" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M4 2 H12 V14 H6 V8 H10 V11 M12 18 H4 V34 H12 V22 H6 V28 H10 V25"
                        fill="none"
                        stroke={palette.primary}
                        strokeWidth="1.0"
                        strokeLinejoin="miter"
                    />
                    <rect x="6.5" y="15" width="3" height="3" fill={palette.gold} stroke={palette.deep} strokeWidth="0.5" />
                    <rect x="6.5" y="34.5" width="3" height="1.5" fill={palette.gold} />
                </>
            );
        case 1:
        default: // Royal Madinah Classic
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.3" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M8 2 C12 7 12 13 8 18 C4 13 4 7 8 2 Z M8 18 C12 23 12 29 8 34 C4 29 4 23 8 18 Z"
                        fill={palette.secondary}
                        fillOpacity="0.45"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <circle cx="8" cy="18" r="2.2" fill={palette.gold} />
                    <circle cx="8" cy="0" r="1.4" fill={palette.deep} />
                    <circle cx="8" cy="36" r="1.4" fill={palette.deep} />
                </>
            );
    }
};

export const MadinahHorizontalPatternContent: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M0 3.5 Q9 12.5 18 3.5 Q27 12.5 36 3.5"
                        fill="none"
                        stroke={palette.primary}
                        strokeWidth="1.0"
                    />
                    <path
                        d="M0 12.5 Q9 3.5 18 12.5 Q27 3.5 36 12.5"
                        fill={palette.secondary}
                        fillOpacity="0.22"
                        stroke={palette.gold}
                        strokeWidth="0.85"
                    />
                    <circle cx="9" cy="8" r="1.7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="27" cy="8" r="1.7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="18" cy="8" r="1.2" fill={palette.deep} />
                </>
            );
        case 3:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <polygon
                        points="2,8 9,3 16,8 9,13"
                        fill={palette.secondary}
                        fillOpacity="0.34"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <polygon
                        points="20,8 27,3 34,8 27,13"
                        fill={palette.secondary}
                        fillOpacity="0.34"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <rect x="6.5" y="5.5" width="5" height="5" fill={palette.gold} fillOpacity="0.7" stroke={palette.deep} strokeWidth="0.5" />
                    <rect x="24.5" y="5.5" width="5" height="5" fill={palette.gold} fillOpacity="0.7" stroke={palette.deep} strokeWidth="0.5" />
                    <polygon points="15.5,8 18,5.5 20.5,8 18,10.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </>
            );
        case 4:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <rect x="2" y="3" width="14" height="9.5" fill={palette.secondary} fillOpacity="0.2" stroke={palette.primary} strokeWidth="0.7" />
                    <path d="M9 3.5 Q13.5 7.5 9 12 Q4.5 7.5 9 3.5 Z" fill={palette.gold} fillOpacity="0.6" stroke={palette.primary} strokeWidth="0.75" />
                    <rect x="20" y="3" width="14" height="9.5" fill={palette.secondary} fillOpacity="0.2" stroke={palette.primary} strokeWidth="0.7" />
                    <path d="M27 3.5 Q31.5 7.5 27 12 Q22.5 7.5 27 3.5 Z" fill={palette.gold} fillOpacity="0.6" stroke={palette.primary} strokeWidth="0.75" />
                    <circle cx="18" cy="8" r="1.5" fill={palette.deep} />
                </>
            );
        case 5:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1.2" x2="36" y2="1.2" stroke={palette.primary} strokeWidth="1.1" />
                    <line x1="0" y1="3.6" x2="36" y2="3.6" stroke={palette.gold} strokeWidth="0.65" strokeOpacity="0.75" />
                    <line x1="0" y1="14.8" x2="36" y2="14.8" stroke={palette.gold} strokeWidth="1.0" />
                    <line x1="0" y1="9" x2="36" y2="9" stroke={palette.primary} strokeWidth="0.55" strokeOpacity="0.35" />
                    <circle cx="18" cy="9" r="3.4" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.85" />
                    <circle cx="18" cy="9" r="1.5" fill={palette.gold} />
                    <circle cx="6" cy="9" r="1.1" fill={palette.gold} fillOpacity="0.8" />
                    <circle cx="30" cy="9" r="1.1" fill={palette.gold} fillOpacity="0.8" />
                </>
            );
        case 6:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M2 4 V12 H14 V6 H8 V10 H11 M18 12 V4 H34 V12 H22 V6 H28 V10 H25"
                        fill="none"
                        stroke={palette.primary}
                        strokeWidth="1.0"
                        strokeLinejoin="miter"
                    />
                    <rect x="15" y="6.5" width="3" height="3" fill={palette.gold} stroke={palette.deep} strokeWidth="0.5" />
                    <rect x="34.5" y="6.5" width="1.5" height="3" fill={palette.gold} />
                </>
            );
        case 1:
        default:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M2 8 C7 4 13 4 18 8 C13 12 7 12 2 8 Z M18 8 C23 4 29 4 34 8 C29 12 23 12 18 8 Z"
                        fill={palette.secondary}
                        fillOpacity="0.45"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <circle cx="18" cy="8" r="2" fill={palette.gold} />
                    <circle cx="0" cy="8" r="1.3" fill={palette.deep} />
                    <circle cx="36" cy="8" r="1.3" fill={palette.deep} />
                </>
            );
    }
};

export const MadinahCornerRosetteSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Scalloped Arch Medallion
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="6" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.2" />
                    <circle cx="14" cy="14" r="9.2" fill={palette.secondary} fillOpacity="0.22" stroke={palette.gold} strokeWidth="1.0" />
                    <path
                        d="M14 5.5 C16.5 8.5 19.5 11.5 22.5 14 C19.5 16.5 16.5 19.5 14 22.5 C11.5 19.5 8.5 16.5 5.5 14 C8.5 11.5 11.5 8.5 14 5.5 Z"
                        fill={palette.gold}
                        fillOpacity="0.85"
                        stroke={palette.primary}
                        strokeWidth="0.7"
                    />
                    <circle cx="14" cy="14" r="3" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.9" />
                </svg>
            );
        case 3: // Rub el Hizb Crisp Octagonal Star
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="1" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.2" />
                    <rect x="5" y="5" width="18" height="18" fill={palette.secondary} fillOpacity="0.24" stroke={palette.primary} strokeWidth="0.9" />
                    <rect x="5" y="5" width="18" height="18" transform="rotate(45 14 14)" fill={palette.gold} fillOpacity="0.4" stroke={palette.gold} strokeWidth="0.95" />
                    <polygon points="14,7.5 19.5,14 14,20.5 8.5,14" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.9" />
                    <circle cx="14" cy="14" r="2" fill={palette.gold} />
                </svg>
            );
        case 4: // Mamluk Stepped Trefoil Corner
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <polygon
                        points="5,1 23,1 27,5 27,23 23,27 5,27 1,23 1,5"
                        fill={palette.frameBg}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                    />
                    <polygon
                        points="7,4 21,4 24,7 24,21 21,24 7,24 4,21 4,7"
                        fill={palette.secondary}
                        fillOpacity="0.22"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                    />
                    <circle cx="14" cy="14" r="4.5" fill={palette.gold} stroke={palette.deep} strokeWidth="0.7" />
                    <circle cx="14" cy="14" r="1.8" fill={palette.cartoucheFill} />
                </svg>
            );
        case 5: // Ottoman Minimalist Floral Dot
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="1" y="1" width="26" height="26" rx="13" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.15" />
                    <circle cx="14" cy="14" r="9.5" fill="none" stroke={palette.gold} strokeWidth="0.85" />
                    <circle cx="14" cy="14" r="4.8" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.9" />
                    <circle cx="14" cy="14" r="2" fill={palette.gold} />
                </svg>
            );
        case 6: // Kufic Architectural Square Tile
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="0.75" y="0.75" width="26.5" height="26.5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.25" />
                    <rect x="4" y="4" width="20" height="20" fill="none" stroke={palette.gold} strokeWidth="0.95" />
                    <rect x="7.5" y="7.5" width="13" height="13" fill={palette.secondary} fillOpacity="0.28" stroke={palette.primary} strokeWidth="0.9" />
                    <rect x="11" y="11" width="6" height="6" fill={palette.gold} stroke={palette.deep} strokeWidth="0.7" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="2.5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.2" />
                    <rect x="3.5" y="3.5" width="21" height="21" rx="1.5" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                    <circle cx="14" cy="14" r="6.8" fill={palette.primary} opacity="0.22" stroke={palette.primary} strokeWidth="1" />
                    <path
                        d="M14 5.5 L16.2 11.8 L22.5 14 L16.2 16.2 L14 22.5 L11.8 16.2 L5.5 14 L11.8 11.8 Z"
                        fill={palette.gold}
                        stroke={palette.deep}
                        strokeWidth="0.6"
                    />
                    <circle cx="14" cy="14" r="2.2" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.8" />
                </svg>
            );
    }
};

export const MadinahBottomBadgeSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Pointed Arch Badge
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <path
                        d="M12,1.5 L56,1.5 C64,1.5 66.5,7.5 66.5,11 C66.5,14.5 64,20.5 56,20.5 L12,20.5 C4,20.5 1.5,14.5 1.5,11 C1.5,7.5 4,1.5 12,1.5 Z"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        vectorEffect="non-scaling-stroke"
                    />
                    <path
                        d="M13.5,3.8 L54.5,3.8 C60.5,3.8 63.2,8 63.2,11 C63.2,14 60.5,18.2 54.5,18.2 L13.5,18.2 C7.5,18.2 4.8,14 4.8,11 C4.8,8 7.5,3.8 13.5,3.8 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                        vectorEffect="non-scaling-stroke"
                    />
                    <circle cx="9.5" cy="11" r="1.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="58.5" cy="11" r="1.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
        case 3: // Eight-Pointed Geometric Diamond Medallion
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <polygon
                        points="11,1.5 57,1.5 62,5.5 66.5,11 62,16.5 57,20.5 11,20.5 6,16.5 1.5,11 6,5.5"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        strokeLinejoin="miter"
                        vectorEffect="non-scaling-stroke"
                    />
                    <polygon
                        points="12.5,3.8 55.5,3.8 59.5,7 63,11 59.5,15 55.5,18.2 12.5,18.2 8.5,15 5,11 8.5,7"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                        vectorEffect="non-scaling-stroke"
                    />
                    <polygon points="9.5,9.2 11.3,11 9.5,12.8 7.7,11" fill={palette.gold} />
                    <polygon points="58.5,9.2 60.3,11 58.5,12.8 56.7,11" fill={palette.gold} />
                </svg>
            );
        case 4: // Mamluk Trefoil Medallion
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <path
                        d="M11,2 L57,2 Q61,2 62,6 Q66.5,8.5 66.5,11 Q66.5,13.5 62,16 Q61,20 57,20 L11,20 Q7,20 6,16 Q1.5,13.5 1.5,11 Q1.5,8.5 6,6 Q7,2 11,2 Z"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        vectorEffect="non-scaling-stroke"
                    />
                    <path
                        d="M12.5,4.2 L55.5,4.2 Q58.5,4.2 59.5,7.2 Q63,9 63,11 Q63,13 59.5,14.8 Q58.5,17.8 55.5,17.8 L12.5,17.8 Q9.5,17.8 8.5,14.8 Q5,13 5,11 Q5,9 8.5,7.2 Q9.5,4.2 12.5,4.2 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                        vectorEffect="non-scaling-stroke"
                    />
                    <circle cx="9.5" cy="11" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="58.5" cy="11" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
        case 5: // Ottoman Smooth Pill Medallion
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <rect
                        x="2"
                        y="2"
                        width="64"
                        height="18"
                        rx="9"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.2"
                        vectorEffect="non-scaling-stroke"
                    />
                    <rect
                        x="4.5"
                        y="4.2"
                        width="59"
                        height="13.6"
                        rx="6.8"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.85"
                        vectorEffect="non-scaling-stroke"
                    />
                    <circle cx="9.5" cy="11" r="1.3" fill={palette.gold} />
                    <circle cx="58.5" cy="11" r="1.3" fill={palette.gold} />
                </svg>
            );
        case 6: // Kufic Stepped Architectural Plaque
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <polygon
                        points="8,1.5 60,1.5 60,4.5 66,4.5 66,17.5 60,17.5 60,20.5 8,20.5 8,17.5 2,17.5 2,4.5 8,4.5"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        strokeLinejoin="miter"
                        vectorEffect="non-scaling-stroke"
                    />
                    <rect x="6" y="4" width="56" height="14" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    <rect x="8.5" y="9.5" width="3" height="3" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <rect x="56.5" y="9.5" width="3" height="3" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <polygon
                        points="9,1.5 59,1.5 66.5,11 59,20.5 9,20.5 1.5,11"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                    <polygon
                        points="11,3.8 57,3.8 63.2,11 57,18.2 11,18.2 4.8,11"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                    <circle cx="8.5" cy="11" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="59.5" cy="11" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
    }
};

/* ============================================================================
   2. SURAH BANNER DESIGNS (Background Pattern, Corner, Wing, Center Cartouche)
   ============================================================================ */

export const MadinahSurahBannerPatternContent: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2:
            return (
                <>
                    <path
                        d="M0 16 Q8 3 16 16 Q24 3 32 16"
                        fill={palette.secondary}
                        fillOpacity="0.16"
                        stroke={palette.primary}
                        strokeOpacity="0.22"
                        strokeWidth="0.7"
                    />
                    <circle cx="8" cy="10" r="1.2" fill={palette.gold} fillOpacity="0.4" />
                    <circle cx="24" cy="10" r="1.2" fill={palette.gold} fillOpacity="0.4" />
                </>
            );
        case 3:
            return (
                <>
                    <polygon
                        points="8,2 14,8 8,14 2,8"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.65"
                    />
                    <polygon
                        points="24,2 30,8 24,14 18,8"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.65"
                    />
                    <circle cx="16" cy="8" r="1.1" fill={palette.gold} fillOpacity="0.4" />
                </>
            );
        case 4:
            return (
                <>
                    <path
                        d="M2 14 V6 Q8 1.5 14 6 V14 M18 14 V6 Q24 1.5 30 6 V14"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.65"
                    />
                    <circle cx="8" cy="8" r="1.2" fill={palette.gold} fillOpacity="0.38" />
                    <circle cx="24" cy="8" r="1.2" fill={palette.gold} fillOpacity="0.38" />
                </>
            );
        case 5:
            return (
                <>
                    <circle cx="16" cy="8" r="4.5" fill="none" stroke={palette.primary} strokeOpacity="0.16" strokeWidth="0.65" />
                    <circle cx="16" cy="8" r="1.3" fill={palette.gold} fillOpacity="0.38" />
                    <circle cx="0" cy="8" r="1.1" fill={palette.gold} fillOpacity="0.3" />
                    <circle cx="32" cy="8" r="1.1" fill={palette.gold} fillOpacity="0.3" />
                </>
            );
        case 6:
            return (
                <>
                    <path
                        d="M2 3 H14 V13 H6 V7 H10 M18 13 H30 V3 H22 V9 H26"
                        fill="none"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.7"
                    />
                    <rect x="14.8" y="6.8" width="2.4" height="2.4" fill={palette.gold} fillOpacity="0.35" />
                </>
            );
        case 1:
        default:
            return (
                <>
                    <path
                        d="M2 8 C7 4.2 11 4.2 16 8 C11 11.8 7 11.8 2 8 Z M16 8 C21 4.2 25 4.2 30 8 C25 11.8 21 11.8 16 8 Z"
                        fill={palette.secondary}
                        fillOpacity="0.16"
                        stroke={palette.primary}
                        strokeOpacity="0.18"
                        strokeWidth="0.65"
                    />
                    <circle cx="16" cy="8" r="1.3" fill={palette.gold} fillOpacity="0.35" />
                </>
            );
    }
};

export const MadinahSurahBannerCornerSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
    posClass: string;
}> = ({ design, palette, posClass }) => {
    switch (design) {
        case 2:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <circle cx="6" cy="6" r="5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.9" />
                    <circle cx="6" cy="6" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.45" />
                </svg>
            );
        case 3:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <rect x="2" y="2" width="8" height="8" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.85" />
                    <rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" fill={palette.gold} fillOpacity="0.7" stroke={palette.primary} strokeWidth="0.6" />
                    <circle cx="6" cy="6" r="1.2" fill={palette.cartoucheFill} />
                </svg>
            );
        case 4:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <polygon points="3.5,1 8.5,1 11,3.5 11,8.5 8.5,11 3.5,11 1,8.5 1,3.5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.9" />
                    <circle cx="6" cy="6" r="2.2" fill={palette.gold} />
                </svg>
            );
        case 5:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <circle cx="6" cy="6" r="4.5" fill={palette.cartoucheFill} stroke={palette.gold} strokeWidth="0.9" />
                    <circle cx="6" cy="6" r="1.6" fill={palette.primary} />
                </svg>
            );
        case 6:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <rect x="1" y="1" width="10" height="10" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.95" />
                    <rect x="3.5" y="3.5" width="5" height="5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <rect x="1" y="1" width="10" height="10" rx="1.5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.9" />
                    <path d="M6 2.2 L7.1 4.9 L9.8 6 L7.1 7.1 L6 9.8 L4.9 7.1 L2.2 6 L4.9 4.9 Z" fill={palette.gold} stroke={palette.primary} strokeWidth="0.45" />
                    <circle cx="6" cy="6" r="1" fill={palette.cartoucheFill} />
                </svg>
            );
    }
};

export const MadinahSurahBannerCartoucheSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Pointed Arch Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 1.5 L11 1.5 C4.5 5.5 1.5 13 1.5 20 C1.5 27 4.5 34.5 11 38.5 L18 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M18 1.5 L11 1.5 C4.5 5.5 1.5 13 1.5 20 C1.5 27 4.5 34.5 11 38.5 L18 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.2 L12 4.2 C6.8 7.6 4.2 13.8 4.2 20 C4.2 26.2 6.8 32.4 12 35.8 L18 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="8.2" cy="20" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L7 1.5 C13.5 5.5 16.5 13 16.5 20 C16.5 27 13.5 34.5 7 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L7 1.5 C13.5 5.5 16.5 13 16.5 20 C16.5 27 13.5 34.5 7 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L6 4.2 C11.2 7.6 13.8 13.8 13.8 20 C13.8 26.2 11.2 32.4 6 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="9.8" cy="20" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
        case 3: // Eight-Pointed Star Chevron Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 1.5 L11 1.5 L7 8 L1.5 20 L7 32 L11 38.5 L18 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M18 1.5 L11 1.5 L7 8 L1.5 20 L7 32 L11 38.5 L18 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.2 L12.5 4.2 L9 10 L4.2 20 L9 30 L12.5 35.8 L18 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <polygon points="9.5,16.8 12.2,20 9.5,23.2 6.8,20" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L7 1.5 L11 8 L16.5 20 L11 32 L7 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L7 1.5 L11 8 L16.5 20 L11 32 L7 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L5.5 4.2 L9 10 L13.8 20 L9 30 L5.5 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <polygon points="8.5,16.8 11.2,20 8.5,23.2 5.8,20" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
        case 4: // Mamluk Trefoil Mihrab Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 1.5 L12 1.5 Q7 1.5 6 9 Q1.5 14 1.5 20 Q1.5 26 6 31 Q7 38.5 12 38.5 L18 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M18 1.5 L12 1.5 Q7 1.5 6 9 Q1.5 14 1.5 20 Q1.5 26 6 31 Q7 38.5 12 38.5 L18 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.2 L12.5 4.2 Q9 4.2 8.2 10.5 Q4.2 14.8 4.2 20 Q4.2 25.2 8.2 29.5 Q9 35.8 12.5 35.8 L18 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="8.5" cy="20" r="2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L6 1.5 Q11 1.5 12 9 Q16.5 14 16.5 20 Q16.5 26 12 31 Q11 38.5 6 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L6 1.5 Q11 1.5 12 9 Q16.5 14 16.5 20 Q16.5 26 12 31 Q11 38.5 6 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L5.5 4.2 Q9 4.2 9.8 10.5 Q13.8 14.8 13.8 20 Q13.8 25.2 9.8 29.5 Q9 35.8 5.5 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="9.5" cy="20" r="2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
        case 5: // Ottoman Curved Oval Pill Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 2 L14 2 A12 18 0 0 0 14 38 L18 38 Z" fill={palette.cartoucheFill} />
                        <path d="M18 2 L14 2 A12 18 0 0 0 14 38 L18 38" fill="none" stroke={palette.primary} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.6 L14.5 4.6 A9.5 15.4 0 0 0 14.5 35.4 L18 35.4" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <circle cx="7" cy="20" r="1.8" fill={palette.gold} />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="2" width="102" height="36" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="2" x2="101" y2="2" stroke={palette.primary} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38" x2="101" y2="38" stroke={palette.primary} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.6" x2="101" y2="4.6" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.4" x2="101" y2="35.4" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 2 L4 2 A12 18 0 0 1 4 38 L0 38 Z" fill={palette.cartoucheFill} />
                        <path d="M0 2 L4 2 A12 18 0 0 1 4 38 L0 38" fill="none" stroke={palette.primary} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.6 L3.5 4.6 A9.5 15.4 0 0 1 3.5 35.4 L0 35.4" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <circle cx="11" cy="20" r="1.8" fill={palette.gold} />
                    </svg>
                </div>
            );
        case 6: // Kufic Stepped Ziggurat Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 1.5 L8 1.5 L8 7.5 L2 7.5 L2 32.5 L8 32.5 L8 38.5 L18 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M18 1.5 L8 1.5 L8 7.5 L2 7.5 L2 32.5 L8 32.5 L8 38.5 L18 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.2 L10.5 4.2 L10.5 10 L4.5 10 L4.5 30 L10.5 30 L10.5 35.8 L18 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <rect x="6.5" y="18.2" width="3.6" height="3.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L10 1.5 L10 7.5 L16 7.5 L16 32.5 L10 32.5 L10 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L10 1.5 L10 7.5 L16 7.5 L16 32.5 L10 32.5 L10 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L7.5 4.2 L7.5 10 L13.5 10 L13.5 30 L7.5 30 L7.5 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <rect x="7.9" y="18.2" width="3.6" height="3.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
        case 1:
        default: // Classic Chamfered Octagonal Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[14px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L8 1.5 L1.5 9 L1.5 31 L8 38.5 L16 38.5 Z" fill={palette.cartoucheFill} stroke="none" />
                        <path d="M16 1.5 L8 1.5 L1.5 9 L1.5 31 L8 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4.2 L9.5 4.2 L4.2 10.5 L4.2 29.5 L9.5 35.8 L16 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <polygon points="7.5,17.2 10.2,20 7.5,22.8 4.8,20" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[14px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L8 1.5 L14.5 9 L14.5 31 L8 38.5 L0 38.5 Z" fill={palette.cartoucheFill} stroke="none" />
                        <path d="M0 1.5 L8 1.5 L14.5 9 L14.5 31 L8 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L6.5 4.2 L11.8 10.5 L11.8 29.5 L6.5 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <polygon points="8.5,17.2 11.2,20 8.5,22.8 5.8,20" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
    }
};

/* ============================================================================
   3. TOP BAR (#header) DESIGNS: Circular Icon Frame, Bookmark Badge, Surah Pill
   ============================================================================ */

export const MadinahHeaderCircleSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Scalloped Floral Rosette
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <circle cx="22" cy="22" r="20" fill={palette.secondary} fillOpacity="0.18" stroke={palette.primary} strokeWidth="1.1" strokeDasharray="3.2 2.1" />
                    <circle cx="22" cy="22" r="17" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                    <circle cx="22" cy="22" r="14.2" fill="none" stroke={palette.gold} strokeWidth="0.95" />
                    <circle cx="22" cy="3.8" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                    <circle cx="22" cy="40.2" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                    <circle cx="3.8" cy="22" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                    <circle cx="40.2" cy="22" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                </svg>
            );
        case 3: // Eight-Pointed Rub el Hizb Crisp Star
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <rect x="6" y="6" width="32" height="32" fill={palette.secondary} fillOpacity="0.22" stroke={palette.primary} strokeWidth="1.2" />
                    <rect x="6" y="6" width="32" height="32" transform="rotate(45 22 22)" fill={palette.gold} fillOpacity="0.22" stroke={palette.gold} strokeWidth="1.2" />
                    <polygon
                        points="22,6.5 33,11 37.5,22 33,33 22,37.5 11,33 6.5,22 11,11"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.2"
                    />
                    <circle cx="22" cy="22" r="12.8" fill="none" stroke={palette.gold} strokeWidth="0.85" />
                </svg>
            );
        case 4: // Mamluk Fluted Sunburst Medallion
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <polygon
                        points="22,1.5 26.5,6.5 33.5,4.5 34.5,11.5 41,13.5 37.5,19.5 42.5,22 37.5,24.5 41,30.5 34.5,32.5 33.5,39.5 26.5,37.5 22,42.5 17.5,37.5 10.5,39.5 9.5,32.5 3,30.5 6.5,24.5 1.5,22 6.5,19.5 3,13.5 9.5,11.5 10.5,4.5 17.5,6.5"
                        fill={palette.secondary}
                        fillOpacity="0.24"
                        stroke={palette.primary}
                        strokeWidth="1.05"
                    />
                    <circle cx="22" cy="22" r="15" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.2" />
                    <circle cx="22" cy="22" r="12.6" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                </svg>
            );
        case 5: // Ottoman Sleek Triple Ring
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <circle cx="22" cy="22" r="19" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                    <circle cx="22" cy="22" r="16" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                    <circle cx="22" cy="22" r="13.5" fill="none" stroke={palette.primary} strokeOpacity="0.35" strokeWidth="0.6" />
                    <circle cx="22" cy="3" r="1.3" fill={palette.gold} />
                    <circle cx="22" cy="41" r="1.3" fill={palette.gold} />
                </svg>
            );
        case 6: // Kufic Architectural Octagon-in-Square
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <rect x="3" y="3" width="38" height="38" rx="3" fill={palette.secondary} fillOpacity="0.16" stroke={palette.primary} strokeWidth="1.25" />
                    <rect x="6" y="6" width="32" height="32" rx="2" fill={palette.cartoucheFill} stroke={palette.gold} strokeWidth="1.0" />
                    <polygon points="14,7.5 30,7.5 36.5,14 36.5,30 30,36.5 14,36.5 7.5,30 7.5,14" fill="none" stroke={palette.primary} strokeWidth="1.0" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <rect x="7" y="7" width="30" height="30" rx="3" fill={palette.secondary} fillOpacity="0.22" stroke={palette.primary} strokeWidth="1.2" />
                    <rect x="7" y="7" width="30" height="30" rx="3" transform="rotate(45 22 22)" fill={palette.secondary} fillOpacity="0.18" stroke={palette.primary} strokeWidth="1.2" />
                    <circle cx="22" cy="22" r="15.5" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.2" />
                    <circle cx="22" cy="22" r="13.2" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                    <circle cx="22" cy="4.2" r="1.25" fill={palette.gold} />
                    <circle cx="22" cy="39.8" r="1.25" fill={palette.gold} />
                    <circle cx="4.2" cy="22" r="1.25" fill={palette.gold} />
                    <circle cx="39.8" cy="22" r="1.25" fill={palette.gold} />
                </svg>
            );
    }
};

export const MadinahHeaderBadgeSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Arched Badge
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <path
                        d="M12,1.5 L42,1.5 C49.5,1.5 52.5,10 52.5,20 C52.5,30 49.5,38.5 42,38.5 L12,38.5 C4.5,38.5 1.5,30 1.5,20 C1.5,10 4.5,1.5 12,1.5 Z"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.3"
                    />
                    <path
                        d="M13.5,4.2 L40.5,4.2 C46.5,4.2 49.5,11.2 49.5,20 C49.5,28.8 46.5,35.8 40.5,35.8 L13.5,35.8 C7.5,35.8 4.5,28.8 4.5,20 C4.5,11.2 7.5,4.2 13.5,4.2 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.95"
                    />
                    <circle cx="27" cy="2.8" r="1.4" fill={palette.gold} />
                    <circle cx="27" cy="37.2" r="1.4" fill={palette.gold} />
                </svg>
            );
        case 3: // Eight-Point Star Geometric Badge
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <polygon
                        points="10,1.5 44,1.5 48,7 52.5,20 48,33 44,38.5 10,38.5 6,33 1.5,20 6,7"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.3"
                    />
                    <polygon
                        points="11.5,4.2 42.5,4.2 45.8,8.5 49.5,20 45.8,31.5 42.5,35.8 11.5,35.8 8.2,31.5 4.5,20 8.2,8.5"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.95"
                    />
                </svg>
            );
        case 4: // Mamluk Trefoil Badge
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <path
                        d="M11,1.5 L43,1.5 Q47,1.5 48,9.5 Q52.5,14 52.5,20 Q52.5,26 48,30.5 Q47,38.5 43,38.5 L11,38.5 Q7,38.5 6,30.5 Q1.5,26 1.5,20 Q1.5,14 6,9.5 Q7,1.5 11,1.5 Z"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.3"
                    />
                    <path
                        d="M12.5,4.2 L41.5,4.2 Q44.5,4.2 45.5,10.8 Q49.5,14.8 49.5,20 Q49.5,25.2 45.5,29.2 Q44.5,35.8 41.5,35.8 L12.5,35.8 Q9.5,35.8 8.5,29.2 Q4.5,25.2 4.5,20 Q4.5,14.8 8.5,10.8 Q9.5,4.2 12.5,4.2 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.95"
                    />
                </svg>
            );
        case 5: // Ottoman Smooth Pill Badge
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <rect x="2" y="2" width="50" height="36" rx="18" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                    <rect x="4.8" y="4.8" width="44.4" height="30.4" rx="15.2" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                </svg>
            );
        case 6: // Kufic Stepped Architectural Plaque
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <polygon
                        points="8,1.5 46,1.5 46,7.5 52,7.5 52,32.5 46,32.5 46,38.5 8,38.5 8,32.5 2,32.5 2,7.5 8,7.5"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.3"
                    />
                    <rect x="6" y="5" width="42" height="30" fill="none" stroke={palette.gold} strokeWidth="0.95" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <polygon points="8,1.5 46,1.5 52.5,8 52.5,32 46,38.5 8,38.5 1.5,32 1.5,8" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.3" />
                    <polygon points="9.5,4 44.5,4 50,9.5 50,30.5 44.5,36 9.5,36 4,30.5 4,9.5" fill="none" stroke={palette.gold} strokeWidth="0.95" />
                    <polygon points="27,0.5 29.2,2.8 27,5.1 24.8,2.8" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    <polygon points="27,34.9 29.2,37.2 27,39.5 24.8,37.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                </svg>
            );
    }
};

export const MadinahHeaderSurahFrameSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Arched Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L10 1.5 C4 5.5 1.5 13 1.5 20 C1.5 27 4 34.5 10 38.5 L16 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M16 1.5 L10 1.5 C4 5.5 1.5 13 1.5 20 C1.5 27 4 34.5 10 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4 L11 4 C6 7.5 4 13.8 4 20 C4 26.2 6 32.5 11 36 L16 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L6 1.5 C12 5.5 14.5 13 14.5 20 C14.5 27 12 34.5 6 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L6 1.5 C12 5.5 14.5 13 14.5 20 C14.5 27 12 34.5 6 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L5 4 C10 7.5 12 13.8 12 20 C12 26.2 10 32.5 5 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 3: // Eight-Pointed Star Chevron Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L10 1.5 L6.5 8 L1.5 20 L6.5 32 L10 38.5 L16 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M16 1.5 L10 1.5 L6.5 8 L1.5 20 L6.5 32 L10 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4 L11 4 L8.5 9.5 L4.2 20 L8.5 30.5 L11 36 L16 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L6 1.5 L9.5 8 L14.5 20 L9.5 32 L6 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L6 1.5 L9.5 8 L14.5 20 L9.5 32 L6 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L5 4 L7.5 9.5 L11.8 20 L7.5 30.5 L5 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 4: // Mamluk Trefoil Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L10.5 1.5 Q6.5 1.5 5.5 9.5 Q1.5 14 1.5 20 Q1.5 26 5.5 30.5 Q6.5 38.5 10.5 38.5 L16 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M16 1.5 L10.5 1.5 Q6.5 1.5 5.5 9.5 Q1.5 14 1.5 20 Q1.5 26 5.5 30.5 Q6.5 38.5 10.5 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4 L11 4 Q8 4 7.5 10.8 Q4 14.8 4 20 Q4 25.2 7.5 29.2 Q8 36 11 36 L16 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L5.5 1.5 Q9.5 1.5 10.5 9.5 Q14.5 14 14.5 20 Q14.5 26 10.5 30.5 Q9.5 38.5 5.5 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L5.5 1.5 Q9.5 1.5 10.5 9.5 Q14.5 14 14.5 20 Q14.5 26 10.5 30.5 Q9.5 38.5 5.5 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L5 4 Q8 4 8.5 10.8 Q12 14.8 12 20 Q12 25.2 8.5 29.2 Q8 36 5 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 5: // Ottoman Smooth Pill Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 2 L14 2 A12 18 0 0 0 14 38 L16 38 Z" fill={palette.cartoucheFill} />
                        <path d="M16 2 L14 2 A12 18 0 0 0 14 38 L16 38" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4.6 L14.2 4.6 A9.5 15.4 0 0 0 14.2 35.4 L16 35.4" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="2" width="102" height="36" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="2" x2="101" y2="2" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38" x2="101" y2="38" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.6" x2="101" y2="4.6" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.4" x2="101" y2="35.4" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 2 L2 2 A12 18 0 0 1 2 38 L0 38 Z" fill={palette.cartoucheFill} />
                        <path d="M0 2 L2 2 A12 18 0 0 1 2 38 L0 38" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.6 L1.8 4.6 A9.5 15.4 0 0 1 1.8 35.4 L0 35.4" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 6: // Kufic Stepped Architectural Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L7.5 1.5 L7.5 7.5 L2 7.5 L2 32.5 L7.5 32.5 L7.5 38.5 L16 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M16 1.5 L7.5 1.5 L7.5 7.5 L2 7.5 L2 32.5 L7.5 32.5 L7.5 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4 L10 4 L10 10 L4.5 10 L4.5 30 L10 30 L10 36 L16 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L8.5 1.5 L8.5 7.5 L14 7.5 L14 32.5 L8.5 32.5 L8.5 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L8.5 1.5 L8.5 7.5 L14 7.5 L14 32.5 L8.5 32.5 L8.5 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L6 4 L6 10 L11.5 10 L11.5 30 L6 30 L6 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 1:
        default:
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 14 40" className="w-[14px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M14 1.5 L8 1.5 L1.5 8 L1.5 32 L8 38.5 L14 38.5 Z" fill={palette.cartoucheFill} stroke="none" />
                        <path d="M14 1.5 L8 1.5 L1.5 8 L1.5 32 L8 38.5 L14 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M14 4 L9.5 4 L4 9.5 L4 30.5 L9.5 36 L14 36" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 14 40" className="w-[14px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L6 1.5 L12.5 8 L12.5 32 L6 38.5 L0 38.5 Z" fill={palette.cartoucheFill} stroke="none" />
                        <path d="M0 1.5 L6 1.5 L12.5 8 L12.5 32 L6 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L4.5 4 L10 9.5 L10 30.5 L4.5 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
    }
};

/* ============================================================================
   4. LIVE MINIATURE FRAME PREVIEW FOR MADINAH SETTINGS MODAL
   ============================================================================ */

export const MadinahFrameMiniPreview: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    const uid = useId().replace(/:/g, '');
    const hPatId = `mf-prev-h-${uid}`;
    const vPatId = `mf-prev-v-${uid}`;
    const bPatId = `mf-prev-b-${uid}`;

    return (
        <div
            className="w-full h-[64px] rounded-xl overflow-hidden relative flex flex-col border"
            style={{
                backgroundColor: palette.frameBg,
                borderColor: palette.primary,
            }}
        >
            {/* Top Bar Mini Preview */}
            <div
                className="h-[19px] px-1.5 flex items-center justify-between gap-1 border-b shrink-0"
                style={{
                    backgroundColor: palette.frameBg,
                    borderBottomColor: palette.primary,
                }}
            >
                <div className="relative w-[13px] h-[13px] shrink-0">
                    <MadinahHeaderCircleSVG design={design} palette={palette} />
                </div>
                <div className="relative flex-1 h-[12px] min-w-0">
                    <MadinahHeaderSurahFrameSVG design={design} palette={palette} />
                </div>
                <div className="relative w-[16px] h-[12px] shrink-0">
                    <MadinahHeaderBadgeSVG design={design} palette={palette} />
                </div>
                <div className="relative w-[13px] h-[13px] shrink-0">
                    <MadinahHeaderCircleSVG design={design} palette={palette} />
                </div>
            </div>

            {/* Outer Frame & Inner Surah Cartouche Mini Preview */}
            <div className="flex-1 min-h-0 relative flex items-stretch px-[8px] pb-[8px]">
                {/* Left Side Frame */}
                <svg className="absolute left-0 top-0 bottom-[8px] w-[8px] h-[calc(100%-8px)]" preserveAspectRatio="none">
                    <defs>
                        <pattern id={vPatId} width="16" height="36" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                            <MadinahVerticalPatternContent design={design} palette={palette} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${vPatId})`} />
                </svg>

                {/* Right Side Frame */}
                <svg className="absolute right-0 top-0 bottom-[8px] w-[8px] h-[calc(100%-8px)]" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)' }}>
                    <rect width="100%" height="100%" fill={`url(#${vPatId})`} />
                </svg>

                {/* Bottom Frame */}
                <svg className="absolute left-[8px] right-[8px] bottom-0 h-[8px] w-[calc(100%-16px)]" preserveAspectRatio="none">
                    <defs>
                        <pattern id={hPatId} width="36" height="16" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                            <MadinahHorizontalPatternContent design={design} palette={palette} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${hPatId})`} />
                </svg>

                {/* Corners */}
                <div className="absolute left-0 bottom-0 w-[9px] h-[9px]">
                    <MadinahCornerRosetteSVG design={design} palette={palette} />
                </div>
                <div className="absolute right-0 bottom-0 w-[9px] h-[9px]">
                    <MadinahCornerRosetteSVG design={design} palette={palette} />
                </div>

                {/* Inner Stage + Miniature Surah Banner */}
                <div
                    className="flex-1 min-w-0 flex flex-col items-center justify-center px-1.5 py-1 border-x border-b"
                    style={{
                        backgroundColor: palette.cartoucheFill,
                        borderColor: palette.gold,
                    }}
                >
                    <div
                        className="w-full h-[18px] rounded-[4px] relative flex items-center justify-center border overflow-hidden"
                        style={{
                            backgroundColor: palette.frameBg,
                            borderColor: palette.primary,
                        }}
                    >
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <defs>
                                <pattern id={bPatId} width="32" height="16" patternUnits="userSpaceOnUse">
                                    <MadinahSurahBannerPatternContent design={design} palette={palette} />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill={`url(#${bPatId})`} />
                        </svg>
                        <div className="relative w-[56%] h-[14px] flex items-center justify-center">
                            <MadinahSurahBannerCartoucheSVG design={design} palette={palette} />
                            <span
                                className="relative z-10 text-[7.5px] font-bold leading-none truncate px-1"
                                style={{ color: palette.bannerText }}
                            >
                                الفاتحة
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Center Page Medallion */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[26px] h-[10px]">
                    <MadinahBottomBadgeSVG design={design} palette={palette} />
                </div>
            </div>
        </div>
    );
};

/* ============================================================================
   5. OPENING PAGES (1 & 2) INNER TAZHIB CARPET, CORNERS, CREST & CENTERPIECE
   ============================================================================ */

export const MadinahOpeningTazhibPatternContent: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Interlaced Ogee Arches & Pearls
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <path
                        d="M0 18 Q9 4 18 18 Q27 32 36 18 M0 18 Q9 32 18 18 Q27 4 36 18"
                        fill={palette.secondary}
                        fillOpacity="0.16"
                        stroke={palette.primary}
                        strokeOpacity="0.26"
                        strokeWidth="0.7"
                    />
                    <path
                        d="M18 0 Q4 9 18 18 Q32 27 18 36 M18 0 Q32 9 18 18 Q4 27 18 36"
                        fill="none"
                        stroke={palette.gold}
                        strokeOpacity="0.45"
                        strokeWidth="0.7"
                    />
                    <circle cx="9" cy="18" r="2.2" fill={palette.cartoucheFill} stroke={palette.primary} strokeOpacity="0.3" strokeWidth="0.6" />
                    <circle cx="27" cy="18" r="2.2" fill={palette.cartoucheFill} stroke={palette.primary} strokeOpacity="0.3" strokeWidth="0.6" />
                    <circle cx="18" cy="9" r="1.5" fill={palette.gold} fillOpacity="0.65" />
                    <circle cx="18" cy="27" r="1.5" fill={palette.gold} fillOpacity="0.65" />
                    <circle cx="18" cy="18" r="1.4" fill={palette.primary} fillOpacity="0.4" />
                </>
            );
        case 3: // Eight-Point Star / Rub el Hizb Mosaic Lattice
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <rect
                        x="7"
                        y="7"
                        width="22"
                        height="22"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.24"
                        strokeWidth="0.65"
                    />
                    <rect
                        x="7"
                        y="7"
                        width="22"
                        height="22"
                        transform="rotate(45 18 18)"
                        fill={palette.gold}
                        fillOpacity="0.12"
                        stroke={palette.gold}
                        strokeOpacity="0.45"
                        strokeWidth="0.65"
                    />
                    <polygon
                        points="18,10.5 25.5,18 18,25.5 10.5,18"
                        fill={palette.cartoucheFill}
                        fillOpacity="0.65"
                        stroke={palette.primary}
                        strokeOpacity="0.28"
                        strokeWidth="0.6"
                    />
                    <polygon points="18,15.2 20.8,18 18,20.8 15.2,18" fill={palette.gold} fillOpacity="0.72" />
                    <polygon points="0,15.5 2.5,18 0,20.5 -2.5,18" fill={palette.primary} fillOpacity="0.25" />
                    <polygon points="36,15.5 38.5,18 36,20.5 33.5,18" fill={palette.primary} fillOpacity="0.25" />
                    <polygon points="15.5,0 18,2.5 20.5,0 18,-2.5" fill={palette.primary} fillOpacity="0.25" />
                    <polygon points="15.5,36 18,38.5 20.5,36 18,33.5" fill={palette.primary} fillOpacity="0.25" />
                </>
            );
        case 4: // Mamluk Honeycomb Mihrab Arcade & Trefoils
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <path
                        d="M3 32 V14 Q18 3 33 14 V32 Z"
                        fill={palette.secondary}
                        fillOpacity="0.15"
                        stroke={palette.primary}
                        strokeOpacity="0.24"
                        strokeWidth="0.68"
                    />
                    <path
                        d="M9 28 V17 Q18 9 27 17 V28 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeOpacity="0.44"
                        strokeWidth="0.65"
                    />
                    <path
                        d="M18 13 Q23 19 18 25 Q13 19 18 13 Z"
                        fill={palette.gold}
                        fillOpacity="0.24"
                        stroke={palette.primary}
                        strokeOpacity="0.28"
                        strokeWidth="0.6"
                    />
                    <circle cx="18" cy="19" r="1.5" fill={palette.gold} fillOpacity="0.7" />
                    <circle cx="0" cy="0" r="1.8" fill={palette.primary} fillOpacity="0.24" />
                    <circle cx="36" cy="0" r="1.8" fill={palette.primary} fillOpacity="0.24" />
                    <circle cx="0" cy="36" r="1.8" fill={palette.primary} fillOpacity="0.24" />
                    <circle cx="36" cy="36" r="1.8" fill={palette.primary} fillOpacity="0.24" />
                </>
            );
        case 5: // Ottoman Rumi Calm Rings & Delicate Pearls
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <circle cx="18" cy="18" r="11" fill="none" stroke={palette.primary} strokeOpacity="0.18" strokeWidth="0.6" />
                    <circle cx="18" cy="18" r="6.5" fill={palette.secondary} fillOpacity="0.1" stroke={palette.gold} strokeOpacity="0.4" strokeWidth="0.6" />
                    <circle cx="18" cy="18" r="1.8" fill={palette.gold} fillOpacity="0.65" />
                    <circle cx="0" cy="0" r="6.5" fill="none" stroke={palette.gold} strokeOpacity="0.3" strokeWidth="0.55" />
                    <circle cx="36" cy="0" r="6.5" fill="none" stroke={palette.gold} strokeOpacity="0.3" strokeWidth="0.55" />
                    <circle cx="0" cy="36" r="6.5" fill="none" stroke={palette.gold} strokeOpacity="0.3" strokeWidth="0.55" />
                    <circle cx="36" cy="36" r="6.5" fill="none" stroke={palette.gold} strokeOpacity="0.3" strokeWidth="0.55" />
                </>
            );
        case 6: // Kufic Geometric Interlocking Fretwork Grid
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <path
                        d="M3 3 H33 V33 H3 Z"
                        fill="none"
                        stroke={palette.primary}
                        strokeOpacity="0.18"
                        strokeWidth="0.65"
                    />
                    <path
                        d="M8 8 H28 V24 H13 V14 H22 V19"
                        fill="none"
                        stroke={palette.gold}
                        strokeOpacity="0.45"
                        strokeWidth="0.7"
                        strokeLinejoin="miter"
                    />
                    <rect x="15.5" y="15.5" width="5" height="5" fill={palette.secondary} fillOpacity="0.22" stroke={palette.primary} strokeOpacity="0.28" strokeWidth="0.6" />
                    <rect x="0" y="0" width="3" height="3" fill={palette.gold} fillOpacity="0.35" />
                    <rect x="33" y="0" width="3" height="3" fill={palette.gold} fillOpacity="0.35" />
                    <rect x="0" y="33" width="3" height="3" fill={palette.gold} fillOpacity="0.35" />
                    <rect x="33" y="33" width="3" height="3" fill={palette.gold} fillOpacity="0.35" />
                </>
            );
        case 1:
        default: // Royal Madinah 8-Fold Rosette & Petal Girih Lattice
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <path
                        d="M18 2 L22.5 13.5 L34 18 L22.5 22.5 L18 34 L13.5 22.5 L2 18 L13.5 13.5 Z"
                        fill={palette.secondary}
                        fillOpacity="0.18"
                        stroke={palette.gold}
                        strokeOpacity="0.42"
                        strokeWidth="0.65"
                    />
                    <path
                        d="M0 0 C6 4 12 4 18 0 M18 0 C24 4 30 4 36 0 M0 36 C6 32 12 32 18 36 M18 36 C24 32 30 32 36 36 M0 0 C4 6 4 12 0 18 M0 18 C4 24 4 30 0 36 M36 0 C32 6 32 12 36 18 M36 18 C32 24 32 30 36 36"
                        fill="none"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.65"
                    />
                    <circle cx="18" cy="18" r="4.2" fill={palette.cartoucheFill} fillOpacity="0.55" stroke={palette.primary} strokeOpacity="0.28" strokeWidth="0.6" />
                    <circle cx="18" cy="18" r="1.4" fill={palette.gold} fillOpacity="0.65" />
                    <circle cx="0" cy="0" r="1.5" fill={palette.gold} fillOpacity="0.45" />
                    <circle cx="36" cy="0" r="1.5" fill={palette.gold} fillOpacity="0.45" />
                    <circle cx="0" cy="36" r="1.5" fill={palette.gold} fillOpacity="0.45" />
                    <circle cx="36" cy="36" r="1.5" fill={palette.gold} fillOpacity="0.45" />
                </>
            );
    }
};

export const MadinahOpeningTazhibCornerSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Scalloped Arch Quarter-Rosette
            return (
                <>
                    <path
                        d="M0 0 L23 0 Q17 8 18 14 Q8 17 0 23 Z"
                        fill={palette.secondary}
                        fillOpacity="0.22"
                        stroke={palette.primary}
                        strokeOpacity="0.5"
                        strokeWidth="0.8"
                    />
                    <path
                        d="M0 0 L15 0 Q11 7 11 11 Q7 11 0 15 Z"
                        fill={palette.cartoucheFill}
                        fillOpacity="0.65"
                        stroke={palette.gold}
                        strokeWidth="0.75"
                    />
                    <circle cx="5.5" cy="5.5" r="1.8" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                    <circle cx="14.5" cy="4.5" r="1.1" fill={palette.gold} />
                    <circle cx="4.5" cy="14.5" r="1.1" fill={palette.gold} />
                </>
            );
        case 3: // Eight-Point Star Geometric Diagonal Bevel
            return (
                <>
                    <polygon
                        points="0,0 22,0 13,13 0,22"
                        fill={palette.secondary}
                        fillOpacity="0.25"
                        stroke={palette.primary}
                        strokeOpacity="0.52"
                        strokeWidth="0.8"
                    />
                    <polygon
                        points="0,0 15,0 9,9 0,15"
                        fill={palette.cartoucheFill}
                        fillOpacity="0.7"
                        stroke={palette.gold}
                        strokeWidth="0.75"
                    />
                    <polygon points="5.5,2.5 8.5,5.5 5.5,8.5 2.5,5.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.45" />
                </>
            );
        case 4: // Mamluk Stepped Corner Niche
            return (
                <>
                    <polygon
                        points="0,0 22,0 22,6 15,6 15,15 6,15 6,22 0,22"
                        fill={palette.secondary}
                        fillOpacity="0.24"
                        stroke={palette.primary}
                        strokeOpacity="0.5"
                        strokeWidth="0.8"
                    />
                    <rect x="0" y="0" width="12" height="12" fill={palette.cartoucheFill} fillOpacity="0.65" stroke={palette.gold} strokeWidth="0.75" />
                    <circle cx="6" cy="6" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.45" />
                </>
            );
        case 5: // Ottoman Minimalist Smooth Pearl Arc
            return (
                <>
                    <path
                        d="M0 0 L20 0 A20 20 0 0 1 0 20 Z"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.38"
                        strokeWidth="0.7"
                    />
                    <path
                        d="M0 0 L13.5 0 A13.5 13.5 0 0 1 0 13.5"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.7"
                    />
                    <circle cx="5.2" cy="5.2" r="1.5" fill={palette.gold} />
                </>
            );
        case 6: // Kufic Sharp Stepped Square Corner Tile
            return (
                <>
                    <rect x="0" y="0" width="20" height="20" fill={palette.secondary} fillOpacity="0.2" stroke={palette.primary} strokeOpacity="0.48" strokeWidth="0.8" />
                    <path d="M0 14 H14 V0" fill="none" stroke={palette.gold} strokeWidth="0.85" />
                    <rect x="2.5" y="2.5" width="8.5" height="8.5" fill={palette.cartoucheFill} fillOpacity="0.75" stroke={palette.primary} strokeWidth="0.7" />
                    <rect x="4.8" y="4.8" width="4" height="4" fill={palette.gold} />
                </>
            );
        case 1:
        default: // Royal Madinah Quarter-Rosette
            return (
                <>
                    <path
                        d="M0 0 L22 0 C22 12.1 12.1 22 0 22 Z"
                        fill={palette.secondary}
                        fillOpacity="0.24"
                        stroke={palette.primary}
                        strokeOpacity="0.48"
                        strokeWidth="0.8"
                    />
                    <path
                        d="M0 0 L15 0 C15 8.3 8.3 15 0 15 Z"
                        fill={palette.cartoucheFill}
                        fillOpacity="0.6"
                        stroke={palette.gold}
                        strokeWidth="0.75"
                    />
                    <circle cx="5.5" cy="5.5" r="1.7" fill={palette.gold} />
                </>
            );
    }
};

export const MadinahOpeningTazhibCrestSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
    cx: number;
    yCut: number;
    direction: 'top' | 'bottom';
}> = ({ design, palette, cx, yCut, direction }) => {
    // Tip points strictly away from the Quran text (upward for top carpet, downward for bottom carpet)
    const sy = direction === 'top' ? -1 : 1;

    switch (design) {
        case 2: // Andalusian Pearl Finial
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <path d="M-12 0 Q0 12 12 0" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.15" />
                    <circle cx="0" cy="4.2" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                    <circle cx="-6" cy="2" r="1.1" fill={palette.gold} />
                    <circle cx="6" cy="2" r="1.1" fill={palette.gold} />
                </g>
            );
        case 3: // Eight-Point Star Faceted Crest
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <polygon points="-11,0 0,10 11,0 0,-2" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.1" />
                    <polygon points="-5,0 0,5 5,0 0,-1" fill={palette.gold} />
                </g>
            );
        case 4: // Mamluk Trefoil Apex Finial
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <path d="M-11 0 Q-5 9 0 12 Q5 9 11 0" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.1" />
                    <circle cx="0" cy="5.5" r="2.3" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                </g>
            );
        case 5: // Ottoman Minimalist Dot
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <circle cx="0" cy="3.5" r="2.1" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                </g>
            );
        case 6: // Kufic Stepped Square Bracket
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <polygon points="-12,0 -12,5 -6,5 -6,9 6,9 6,5 12,5 12,0" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.1" />
                    <rect x="-2.8" y="2.2" width="5.6" height="4.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </g>
            );
        case 1:
        default:
            return null;
    }
};

export const MadinahOpeningTazhibCenterpieceSVG: React.FC<{
    design: MadinahFrameDesignId;
    cx: number;
    cy: number;
    scale: number;
    isFatihah: boolean;
    palette: MadinahThemePalette;
}> = ({ design, cx, cy, scale, isFatihah, palette }) => {
    switch (design) {
        case 2: // Andalusian Curved Horseshoe Arch Wings & Floral Shamsa
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <path
                                d="M44 0 Q72 -22 106 -8 Q120 0 132 0 Q120 0 106 8 Q72 22 44 0 Z"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.86"
                                stroke={palette.primary}
                                strokeWidth="1.05"
                            />
                            <path
                                d="M52 0 Q74 -14 100 -4 Q112 0 120 0 Q112 0 100 4 Q74 14 52 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.28"
                                stroke={palette.gold}
                                strokeWidth="0.85"
                            />
                            <circle cx="78" cy="0" r="3.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <circle cx="102" cy="0" r="2.2" fill={palette.primary} />
                            <circle cx="132" cy="0" r="2.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <circle r="38" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.35" />
                            <circle r="33" fill={palette.secondary} fillOpacity="0.16" stroke={palette.gold} strokeWidth="1.0" />
                            {Array.from({ length: 12 }).map((_, i) => (
                                <ellipse
                                    key={i}
                                    cx="0"
                                    cy="-18"
                                    rx="4.2"
                                    ry="9.5"
                                    transform={`rotate(${i * 30})`}
                                    fill={i % 2 === 0 ? palette.secondary : palette.gold}
                                    fillOpacity="0.42"
                                    stroke={palette.primary}
                                    strokeWidth="0.65"
                                />
                            ))}
                            <circle r="11" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.1" />
                            <circle r="6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <circle r="2.2" fill={palette.cartoucheFill} />
                        </g>
                    ) : (
                        <g>
                            <path
                                d="M-46 0 C-42 -22 -24 -30 0 -30 C24 -30 42 -22 46 0 C42 22 24 30 0 30 C-24 30 -42 22 -46 0 Z"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.35"
                            />
                            <path
                                d="M-40 0 C-36 -18 -21 -25 0 -25 C21 -25 36 -18 40 0 C36 18 21 25 0 25 C-21 25 -36 18 -40 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.18"
                                stroke={palette.gold}
                                strokeWidth="0.95"
                            />
                            {[0, 45, 90, 135].map((deg) => (
                                <ellipse
                                    key={deg}
                                    cx="0"
                                    cy="0"
                                    rx="13"
                                    ry="4.2"
                                    transform={`rotate(${deg})`}
                                    fill={palette.gold}
                                    fillOpacity="0.45"
                                    stroke={palette.primary}
                                    strokeWidth="0.65"
                                />
                            ))}
                            <circle r="4.8" fill={palette.gold} stroke={palette.primary} strokeWidth="0.8" />
                            <circle cx="-27" cy="0" r="2.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <circle cx="27" cy="0" r="2.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                        </g>
                    )}
                </g>
            );

        case 3: // Eight-Point Star Chevron Wings & Rub el Hizb Shamsa
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <polygon
                                points="42,0 64,-15 106,-11 132,0 106,11 64,15"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.9"
                                stroke={palette.primary}
                                strokeWidth="1.05"
                            />
                            <polygon
                                points="50,0 67,-10 100,-7 120,0 100,7 67,10"
                                fill={palette.secondary}
                                fillOpacity="0.28"
                                stroke={palette.gold}
                                strokeWidth="0.85"
                            />
                            <polygon points="78,-6 85,0 78,6 71,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <polygon points="103,-4 108,0 103,4 98,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                            <line x1="46" y1="-19" x2="122" y2="-11" stroke={palette.primary} strokeOpacity="0.55" strokeWidth="0.85" />
                            <line x1="46" y1="19" x2="122" y2="11" stroke={palette.primary} strokeOpacity="0.55" strokeWidth="0.85" />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <rect x="-28" y="-28" width="56" height="56" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.35" />
                            <rect x="-28" y="-28" width="56" height="56" transform="rotate(45)" fill={palette.cartoucheFill} fillOpacity="0.92" stroke={palette.primary} strokeWidth="1.35" />
                            <rect x="-22" y="-22" width="44" height="44" fill={palette.secondary} fillOpacity="0.18" stroke={palette.gold} strokeWidth="1" />
                            <rect x="-22" y="-22" width="44" height="44" transform="rotate(45)" fill="none" stroke={palette.gold} strokeWidth="1" />
                            <polygon points="0,-15 15,0 0,15 -15,0" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.95" />
                            <circle r="5.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.85" />
                            <circle r="2" fill={palette.cartoucheFill} />
                        </g>
                    ) : (
                        <g>
                            <polygon
                                points="-48,0 -34,-28 34,-28 48,0 34,28 -34,28"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.35"
                            />
                            <polygon
                                points="-41,0 -29,-22 29,-22 41,0 29,22 -29,22"
                                fill={palette.secondary}
                                fillOpacity="0.18"
                                stroke={palette.gold}
                                strokeWidth="0.95"
                            />
                            <rect x="-13" y="-13" width="26" height="26" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1" />
                            <rect x="-13" y="-13" width="26" height="26" transform="rotate(45)" fill={palette.frameBg} fillOpacity="0.9" stroke={palette.gold} strokeWidth="0.9" />
                            <polygon points="0,-7 7,0 0,7 -7,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.65" />
                            <polygon points="-28,-4 -24,0 -28,4 -32,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <polygon points="28,-4 32,0 28,4 24,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                        </g>
                    )}
                </g>
            );

        case 4: // Mamluk Trefoil Wings & Fluted Sunburst Medallion
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <path
                                d="M44 0 C58 -18 76 -18 90 -8 Q106 -14 122 0 Q106 14 90 8 C76 18 58 18 44 0 Z"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.9"
                                stroke={palette.primary}
                                strokeWidth="1.05"
                            />
                            <path
                                d="M52 0 C63 -11 76 -11 88 -4 Q100 -8 111 0 Q100 8 88 4 C76 11 63 11 52 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.28"
                                stroke={palette.gold}
                                strokeWidth="0.85"
                            />
                            <circle cx="71" cy="0" r="3.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <path d="M122 0 L132 -4 L136 0 L132 4 Z" fill={palette.gold} stroke={palette.primary} strokeWidth="0.65" />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <polygon
                                points="0,-39 8,-30 20,-34 22,-22 34,-20 30,-8 39,0 30,8 34,20 22,22 20,34 8,30 0,39 -8,30 -20,34 -22,22 -34,20 -30,8 -39,0 -30,-8 -34,-20 -22,-22 -20,-34 -8,-30"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.25"
                            />
                            <circle r="27" fill={palette.secondary} fillOpacity="0.2" stroke={palette.gold} strokeWidth="1" />
                            <circle r="18" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.05" />
                            <circle r="10" fill={palette.gold} fillOpacity="0.65" stroke={palette.primary} strokeWidth="0.8" />
                            <circle r="3.5" fill={palette.cartoucheFill} />
                        </g>
                    ) : (
                        <g>
                            <path
                                d="M-47 0 Q-43 -14 -33 -17 Q-28 -30 -14 -30 L14 -30 Q28 -30 33 -17 Q43 -14 47 0 Q43 14 33 17 Q28 30 14 30 L-14 30 Q-28 30 -33 17 Q-43 14 -47 0 Z"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.3"
                            />
                            <path
                                d="M-40 0 Q-37 -11 -29 -13 Q-24 -24 -12 -24 L12 -24 Q24 -24 29 -13 Q37 -11 40 0 Q37 11 29 13 Q24 24 12 24 L-12 24 Q-24 24 -29 13 Q-37 11 -40 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.18"
                                stroke={palette.gold}
                                strokeWidth="0.95"
                            />
                            <circle r="13" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1" />
                            <circle r="6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <circle cx="-26" cy="0" r="2.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                            <circle cx="26" cy="0" r="2.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    )}
                </g>
            );

        case 5: // Ottoman Rumi Calm Minimalist Finials & Triple-Ring Shamsa
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <line x1="42" y1="0" x2="128" y2="0" stroke={palette.gold} strokeWidth="1.1" />
                            <path
                                d="M46 -7 Q84 -15 118 0 Q84 15 46 7"
                                fill="none"
                                stroke={palette.primary}
                                strokeOpacity="0.45"
                                strokeWidth="0.8"
                            />
                            <circle cx="80" cy="0" r="5.5" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.9" />
                            <circle cx="80" cy="0" r="2.2" fill={palette.gold} />
                            <circle cx="105" cy="0" r="3" fill={palette.cartoucheFill} stroke={palette.gold} strokeWidth="0.8" />
                            <circle cx="128" cy="0" r="2" fill={palette.gold} />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <circle r="35" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                            <circle r="29" fill={palette.secondary} fillOpacity="0.12" stroke={palette.gold} strokeWidth="0.95" />
                            <circle r="21" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.95" />
                            <circle r="13" fill="none" stroke={palette.gold} strokeWidth="0.85" />
                            <circle r="5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                        </g>
                    ) : (
                        <g>
                            <rect x="-44" y="-26" width="88" height="52" rx="26" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                            <rect x="-38" y="-20.5" width="76" height="41" rx="20.5" fill={palette.secondary} fillOpacity="0.12" stroke={palette.gold} strokeWidth="0.95" />
                            <circle r="13" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.95" />
                            <circle r="5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <circle cx="-26" cy="0" r="2.2" fill={palette.gold} />
                            <circle cx="26" cy="0" r="2.2" fill={palette.gold} />
                        </g>
                    )}
                </g>
            );

        case 6: // Kufic Stepped Architectural Wings & Maze Plaque
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <path
                                d="M42 -10 H102 V-4 H122 V4 H102 V10 H42"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.9"
                                stroke={palette.primary}
                                strokeWidth="1.05"
                                strokeLinejoin="miter"
                            />
                            <path
                                d="M48 -5 H95 V5 H48"
                                fill={palette.secondary}
                                fillOpacity="0.22"
                                stroke={palette.gold}
                                strokeWidth="0.85"
                                strokeLinejoin="miter"
                            />
                            <rect x="68" y="-3.5" width="7" height="7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <rect x="126" y="-2.5" width="5" height="5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <rect x="-33" y="-33" width="66" height="66" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.35" />
                            <rect x="-27" y="-27" width="54" height="54" fill={palette.secondary} fillOpacity="0.16" stroke={palette.gold} strokeWidth="1" />
                            <path
                                d="M-19 -19 H19 V19 H-11 V-11 H11 V11 H-4 V-4 H4"
                                fill="none"
                                stroke={palette.primary}
                                strokeWidth="1.15"
                                strokeLinejoin="miter"
                            />
                            <rect x="-5" y="-5" width="10" height="10" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                        </g>
                    ) : (
                        <g>
                            <polygon
                                points="-45,-16 -36,-16 -36,-28 36,-28 36,-16 45,-16 45,16 36,16 36,28 -36,28 -36,16 -45,16"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.35"
                                strokeLinejoin="miter"
                            />
                            <rect x="-32" y="-22" width="64" height="44" fill={palette.secondary} fillOpacity="0.16" stroke={palette.gold} strokeWidth="0.95" />
                            <rect x="-14" y="-14" width="28" height="28" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.05" />
                            <rect x="-6" y="-6" width="12" height="12" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <rect x="-27" y="-3" width="6" height="6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                            <rect x="21" y="-3" width="6" height="6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    )}
                </g>
            );

        case 1:
        default: // Royal Madinah Classic Wings & Shamsa
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <line x1="44" y1="0" x2="132" y2="0" stroke={palette.gold} strokeWidth="1.15" />
                            <line x1="50" y1="-3.5" x2="118" y2="-3.5" stroke={palette.primary} strokeOpacity="0.35" strokeWidth="0.65" />
                            <line x1="50" y1="3.5" x2="118" y2="3.5" stroke={palette.primary} strokeOpacity="0.35" strokeWidth="0.65" />
                            <path
                                d="M52 0 C67 -12 87 -12 104 0 C87 12 67 12 52 0 Z"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.88"
                                stroke={palette.primary}
                                strokeWidth="1"
                            />
                            <path
                                d="M58 0 C70 -7.5 84 -7.5 97 0 C84 7.5 70 7.5 58 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.3"
                                stroke={palette.gold}
                                strokeWidth="0.75"
                            />
                            <polygon
                                points="78,-4.2 82.8,0 78,4.2 73.2,0"
                                fill={palette.gold}
                                stroke={palette.primary}
                                strokeWidth="0.55"
                            />
                            <path
                                d="M42 -16 C64 -28 96 -26 122 -14 C106 -17 88 -17 72 -11"
                                fill="none"
                                stroke={palette.primary}
                                strokeOpacity="0.7"
                                strokeWidth="0.95"
                                strokeLinecap="round"
                            />
                            <path
                                d="M42 16 C64 28 96 26 122 14 C106 17 88 17 72 11"
                                fill="none"
                                stroke={palette.primary}
                                strokeOpacity="0.7"
                                strokeWidth="0.95"
                                strokeLinecap="round"
                            />
                            <circle cx="122" cy="-14" r="1.9" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                            <circle cx="122" cy="14" r="1.9" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                            <path
                                d="M112 0 C118 -6 126 -6 132 0 C126 6 118 6 112 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.45"
                                stroke={palette.primary}
                                strokeWidth="0.85"
                            />
                            <circle cx="132" cy="0" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    ))}

                    {isFatihah ? (
                        <g>
                            <circle r="38" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.35" />
                            <circle r="34" fill={palette.secondary} fillOpacity="0.16" stroke={palette.gold} strokeWidth="1" strokeDasharray="2.8 1.8" />
                            <rect x="-21" y="-21" width="42" height="42" rx="2.2" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.15" />
                            <rect x="-21" y="-21" width="42" height="42" rx="2.2" transform="rotate(45)" fill={palette.frameBg} fillOpacity="0.88" stroke={palette.primary} strokeWidth="1.15" />
                            <rect x="-16.5" y="-16.5" width="33" height="33" rx="1.5" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                            <rect x="-16.5" y="-16.5" width="33" height="33" rx="1.5" transform="rotate(45)" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                            {[0, 45, 90, 135].map((deg) => (
                                <ellipse
                                    key={deg}
                                    cx="0"
                                    cy="0"
                                    rx="12"
                                    ry="4"
                                    transform={`rotate(${deg})`}
                                    fill={palette.secondary}
                                    fillOpacity="0.5"
                                    stroke={palette.primary}
                                    strokeWidth="0.7"
                                />
                            ))}
                            <circle r="5.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.85" />
                            <circle r="2" fill={palette.cartoucheFill} />
                        </g>
                    ) : (
                        <g>
                            <path
                                d="M-46 -17 L-30 -31 L30 -31 L46 -17 L46 17 L30 31 L-30 31 L-46 17 Z"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.35"
                            />
                            <path
                                d="M-41.5 -14.5 L-27.5 -27 L27.5 -27 L41.5 -14.5 L41.5 14.5 L27.5 27 L-27.5 27 L-41.5 14.5 Z"
                                fill={palette.secondary}
                                fillOpacity="0.18"
                                stroke={palette.gold}
                                strokeWidth="0.95"
                            />
                            <rect x="-14.5" y="-14.5" width="29" height="29" rx="1.6" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.05" />
                            <rect x="-14.5" y="-14.5" width="29" height="29" rx="1.6" transform="rotate(45)" fill={palette.frameBg} fillOpacity="0.92" stroke={palette.gold} strokeWidth="0.95" />
                            {[0, 45, 90, 135].map((deg) => (
                                <ellipse
                                    key={deg}
                                    cx="0"
                                    cy="0"
                                    rx="9.5"
                                    ry="3.2"
                                    transform={`rotate(${deg})`}
                                    fill={palette.secondary}
                                    fillOpacity="0.48"
                                    stroke={palette.primary}
                                    strokeWidth="0.65"
                                />
                            ))}
                            <circle r="4.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.75" />
                            <circle r="1.5" fill={palette.cartoucheFill} />
                            <polygon points="-30,-5 -25,0 -30,5 -35,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <polygon points="30,-5 35,0 30,5 25,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                        </g>
                    )}
                </g>
            );
    }
};
