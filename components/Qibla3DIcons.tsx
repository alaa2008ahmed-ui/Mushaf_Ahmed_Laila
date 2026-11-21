import React, { useId } from 'react';

interface IconBaseProps {
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

interface Kaaba3DIconProps extends IconBaseProps {
    tone?: 'realistic' | 'emerald';
}

interface Shadow3DIconProps extends IconBaseProps {
    color?: string;
}

function adjustHexColor(hex: string, factor: number): string {
    if (!hex || !hex.startsWith('#')) return hex || '#d97706';
    let clean = hex.slice(1);
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return hex;

    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);

    const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

    if (factor >= 0) {
        // Lighten toward white
        const nr = clamp(r + (255 - r) * factor);
        const ng = clamp(g + (255 - g) * factor);
        const nb = clamp(b + (255 - b) * factor);
        return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
    } else {
        // Darken toward black
        const k = 1 + factor;
        const nr = clamp(r * k);
        const ng = clamp(g * k);
        const nb = clamp(b * k);
        return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
    }
}

export const Kaaba3DIcon: React.FC<Kaaba3DIconProps> = ({
    size = 64,
    tone = 'realistic',
    className = '',
    style,
}) => {
    const uid = useId().replace(/:/g, '');
    const isEmerald = tone === 'emerald';

    const roofTop = isEmerald ? '#6ee7b7' : '#52525b';
    const roofBot = isEmerald ? '#059669' : '#18181b';
    const leftTop = isEmerald ? '#047857' : '#27272a';
    const leftBot = isEmerald ? '#022c22' : '#09090b';
    const rightTop = isEmerald ? '#34d399' : '#3f3f46';
    const rightBot = isEmerald ? '#065f46' : '#18181b';
    const baseLeft = isEmerald ? '#6ee7b7' : '#cbd5e1';
    const baseRight = isEmerald ? '#ecfdf5' : '#f8fafc';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                filter: 'drop-shadow(0 6px 9px rgba(0,0,0,0.34))',
                ...style,
            }}
        >
            <defs>
                <linearGradient id={`k-roof-${uid}`} x1="12" y1="8" x2="52" y2="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={roofTop} />
                    <stop offset="100%" stopColor={roofBot} />
                </linearGradient>
                <linearGradient id={`k-left-${uid}`} x1="11" y1="20" x2="32" y2="54" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={leftTop} />
                    <stop offset="100%" stopColor={leftBot} />
                </linearGradient>
                <linearGradient id={`k-right-${uid}`} x1="32" y1="20" x2="53" y2="54" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={rightTop} />
                    <stop offset="100%" stopColor={rightBot} />
                </linearGradient>
                <linearGradient id={`k-gold-l-${uid}`} x1="11" y1="26" x2="32" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#b45309" />
                    <stop offset="55%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fde047" />
                </linearGradient>
                <linearGradient id={`k-gold-r-${uid}`} x1="32" y1="26" x2="53" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fef9c3" />
                    <stop offset="45%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id={`k-door-${uid}`} x1="39" y1="35" x2="46" y2="49" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
            </defs>

            {/* Ambient Ground Shadow */}
            <ellipse cx="32" cy="56.5" rx="22" ry="5" fill="rgba(0,0,0,0.28)" />

            {/* Marble Shadherwan 3D Stepped Plinth */}
            <polygon points="8.5,48.5 32,58.5 55.5,48.5 32,39" fill={baseRight} opacity="0.5" />
            <polygon points="8.5,48.5 32,58.5 32,54.5 8.5,44.5" fill={baseLeft} />
            <polygon points="55.5,48.5 32,58.5 32,54.5 55.5,44.5" fill={baseRight} />

            {/* Kaaba Body - Left Wall (Shaded) & Right Wall (Lit) */}
            <polygon points="11,20 32,29 32,54.5 11,45.5" fill={`url(#k-left-${uid})`} />
            <polygon points="53,20 32,29 32,54.5 53,45.5" fill={`url(#k-right-${uid})`} />

            {/* Crisp Corner Edge Specular Highlight */}
            <line x1="32" y1="29" x2="32" y2="54.5" stroke="rgba(255,255,255,0.34)" strokeWidth="1.1" />

            {/* Roof Face + Parapet Inner Bevel */}
            <polygon points="32,11 53,20 32,29 11,20" fill={`url(#k-roof-${uid})`} />
            <polygon
                points="32,13.3 48.2,20 32,26.7 15.8,20"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
            />
            {/* Roof Inner Recessed Surface */}
            <polygon points="32,14.5 45.8,20 32,25.5 18.2,20" fill="rgba(0,0,0,0.28)" />

            {/* Golden Mizab al-Rahmah (Spout on Left Roof Edge) */}
            <polygon points="18,16.5 22.5,18.4 20.3,19.8 15.8,17.9" fill="#fde047" />

            {/* Golden Kiswah Belt (Hizam) - Left & Right */}
            <polygon points="11,25.8 32,34.8 32,38.4 11,29.4" fill={`url(#k-gold-l-${uid})`} />
            <polygon points="53,25.8 32,34.8 32,38.4 53,29.4" fill={`url(#k-gold-r-${uid})`} />
            {/* Thin Gold Accent Band just below Kiswah Belt */}
            <polygon points="11,30.5 32,39.5 32,40.5 11,31.5" fill="#fbbf24" opacity="0.72" />
            <polygon points="53,30.5 32,39.5 32,40.5 53,31.5" fill="#fef08a" opacity="0.82" />

            {/* Calligraphic Medallions on Belt */}
            <ellipse cx="18.5" cy="30.8" rx="1.4" ry="0.9" fill="#fef08a" opacity="0.9" />
            <ellipse cx="25.5" cy="33.8" rx="1.4" ry="0.9" fill="#fef08a" opacity="0.9" />
            <ellipse cx="38.5" cy="33.8" rx="1.4" ry="0.9" fill="#fef9c3" opacity="0.95" />
            <ellipse cx="45.5" cy="30.8" rx="1.4" ry="0.9" fill="#fef9c3" opacity="0.95" />

            {/* Bab al-Kaaba (Gold Door on Right Wall) */}
            <polygon points="39.5,38.2 45.5,35.6 45.5,48.7 39.5,51.3" fill={`url(#k-door-${uid})`} />
            <polygon
                points="40.4,39 44.6,37.2 44.6,48.1 40.4,49.9"
                fill="none"
                stroke="#78350f"
                strokeWidth="0.65"
                opacity="0.75"
            />
            <line x1="42.5" y1="38.1" x2="42.5" y2="49" stroke="#78350f" strokeWidth="0.65" opacity="0.7" />

            {/* Hajar al-Aswad (Black Stone Silver Bezel on Front-Right Corner) */}
            <ellipse cx="33.8" cy="46.5" rx="1.4" ry="2" fill="#f1f5f9" />
            <ellipse cx="33.8" cy="46.5" rx="0.8" ry="1.25" fill="#09090b" />
        </svg>
    );
};

export const Sun3DIcon: React.FC<IconBaseProps> = ({
    size = 44,
    className = '',
    style,
}) => {
    const uid = useId().replace(/:/g, '');
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                filter: 'drop-shadow(0 6px 10px rgba(217,119,6,0.46))',
                ...style,
            }}
        >
            <defs>
                <radialGradient id={`sun-core-${uid}`} cx="34%" cy="28%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="22%" stopColor="#fef08a" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="88%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#9a3412" />
                </radialGradient>
                <linearGradient id={`sun-bezel-${uid}`} x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fef9c3" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id={`sun-ray-l-${uid}`} x1="28" y1="3" x2="32" y2="16" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fef9c3" />
                    <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <linearGradient id={`sun-ray-r-${uid}`} x1="32" y1="3" x2="36" y2="16" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <radialGradient id={`sun-glow-${uid}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fde047" stopOpacity="0.55" />
                    <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Warm Solar 3D Aura */}
            <circle cx="32" cy="32" r="30" fill={`url(#sun-glow-${uid})`} />

            {/* 8 Faceted 3D Pyramidal Sun Rays (Lit Left + Shaded Right) */}
            {Array.from({ length: 8 }).map((_, i) => (
                <g key={i} transform={`rotate(${i * 45} 32 32)`}>
                    <polygon points="32,3.2 28.1,15.5 32,14" fill={`url(#sun-ray-l-${uid})`} />
                    <polygon points="32,3.2 35.9,15.5 32,14" fill={`url(#sun-ray-r-${uid})`} />
                    <line x1="32" y1="3.8" x2="32" y2="14" stroke="#ffffff" strokeWidth="0.65" opacity="0.7" />
                </g>
            ))}

            {/* 8 Secondary Beveled Rays */}
            {Array.from({ length: 8 }).map((_, i) => (
                <g key={`s-${i}`} transform={`rotate(${i * 45 + 22.5} 32 32)`}>
                    <polygon points="32,8.5 29.5,16.8 32,15.8" fill="#fde047" opacity="0.92" />
                    <polygon points="32,8.5 34.5,16.8 32,15.8" fill="#d97706" opacity="0.92" />
                </g>
            ))}

            {/* 3D Extruded Outer Solar Collar */}
            <circle cx="32" cy="33" r="16.2" fill="#92400e" opacity="0.45" />
            <circle cx="32" cy="32" r="16.2" fill={`url(#sun-bezel-${uid})`} />

            {/* 3D Volumetric Sun Sphere */}
            <circle cx="32" cy="32" r="14.5" fill={`url(#sun-core-${uid})`} />

            {/* Glossy Specular Highlight & Secondary Rim Bounce */}
            <ellipse cx="26.2" cy="25.2" rx="5.8" ry="3.4" transform="rotate(-30 26.2 25.2)" fill="#ffffff" opacity="0.65" />
            <circle cx="23.5" cy="23.5" r="1.4" fill="#ffffff" opacity="0.85" />
            <path d="M25 43.5C29.5 45.8 35.5 45.2 39.8 41.5" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
        </svg>
    );
};

export const Moon3DIcon: React.FC<IconBaseProps> = ({
    size = 44,
    className = '',
    style,
}) => {
    const uid = useId().replace(/:/g, '');
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                filter: 'drop-shadow(0 6px 10px rgba(37,99,235,0.44))',
                ...style,
            }}
        >
            <defs>
                <linearGradient id={`moon-depth-${uid}`} x1="16" y1="12" x2="52" y2="56" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id={`moon-body-${uid}`} x1="14" y1="10" x2="48" y2="54" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f0f9ff" />
                    <stop offset="28%" stopColor="#93c5fd" />
                    <stop offset="68%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id={`moon-rim-${uid}`} x1="14" y1="12" x2="46" y2="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
                </linearGradient>
                <radialGradient id={`moon-star-${uid}`} cx="38%" cy="32%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#bae6fd" />
                    <stop offset="100%" stopColor="#2563eb" />
                </radialGradient>
            </defs>

            {/* Soft Lunar Halo */}
            <circle cx="31" cy="33" r="25" fill="rgba(96,165,250,0.16)" />

            {/* 3D Extruded Back Thickness Layer */}
            <path
                d="M41 12.8C28.7 12.8 18.7 22.8 18.7 35.1C18.7 47.4 28.7 57.4 41 57.4C45.2 57.4 49.1 56.2 52.5 54.1C43.3 52.9 36.2 45 36.2 35.5C36.2 25.7 43.6 17.7 53.1 16.9C49.5 14.3 45.4 12.8 41 12.8Z"
                fill={`url(#moon-depth-${uid})`}
                opacity="0.72"
            />

            {/* 3D Sculpted Crescent Front Face */}
            <path
                d="M39.5 11.2C27.2 11.2 17.2 21.2 17.2 33.5C17.2 45.8 27.2 55.8 39.5 55.8C43.7 55.8 47.6 54.6 51 52.5C41.8 51.3 34.7 43.4 34.7 33.9C34.7 24.1 42.1 16.1 51.6 15.3C48 12.7 43.9 11.2 39.5 11.2Z"
                fill={`url(#moon-body-${uid})`}
                stroke={`url(#moon-rim-${uid})`}
                strokeWidth="1.3"
                strokeLinejoin="round"
            />

            {/* Glossy Crescent Edge Specular Highlight */}
            <path
                d="M35.5 14.2C26.2 15.8 19.8 24 19.8 33.5C19.8 40.4 23 46.4 28 50.1"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity="0.62"
            />

            {/* Carved 3D Lunar Craters (Dark Inner + Lit Rim) */}
            <circle cx="26.5" cy="28.5" r="2.7" fill="rgba(15,23,42,0.28)" />
            <circle cx="26.9" cy="29" r="2.2" fill="rgba(147,197,253,0.28)" />
            <circle cx="29.2" cy="40.5" r="3.2" fill="rgba(15,23,42,0.26)" />
            <circle cx="29.6" cy="41" r="2.6" fill="rgba(147,197,253,0.26)" />
            <circle cx="23.6" cy="35.8" r="1.6" fill="rgba(255,255,255,0.4)" />

            {/* Faceted 3D Sparkling Star */}
            <path
                d="M46 20.5L48.1 25.4L53 27.5L48.1 29.6L46 34.5L43.9 29.6L39 27.5L43.9 25.4Z"
                fill={`url(#moon-star-${uid})`}
                stroke="#ffffff"
                strokeWidth="0.6"
            />
        </svg>
    );
};

export const Shadow3DIcon: React.FC<Shadow3DIconProps> = ({
    size = 44,
    color = '#d97706',
    className = '',
    style,
}) => {
    const uid = useId().replace(/:/g, '');
    const isNearWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';
    const lightTone = isNearWhite ? '#ffffff' : adjustHexColor(color, 0.48);
    const midTone = isNearWhite ? '#e2e8f0' : color;
    const darkTone = isNearWhite ? '#64748b' : adjustHexColor(color, -0.36);
    const deepTone = isNearWhite ? '#334155' : adjustHexColor(color, -0.58);

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                filter: 'drop-shadow(0 6px 9px rgba(0,0,0,0.32))',
                ...style,
            }}
        >
            <defs>
                <linearGradient id={`sh-body-${uid}`} x1="20" y1="12" x2="44" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={lightTone} />
                    <stop offset="48%" stopColor={midTone} />
                    <stop offset="100%" stopColor={darkTone} />
                </linearGradient>
                <linearGradient id={`sh-ray-${uid}`} x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={lightTone} />
                    <stop offset="100%" stopColor={darkTone} />
                </linearGradient>
                <radialGradient id={`sh-head-${uid}`} cx="34%" cy="28%" r="68%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
                    <stop offset="32%" stopColor={lightTone} />
                    <stop offset="76%" stopColor={midTone} />
                    <stop offset="100%" stopColor={deepTone} />
                </radialGradient>
            </defs>

            {/* Long Projected Ground Shadow & Base Ellipse */}
            <path d="M27 54L47 47L53 50.5L32 57.5Z" fill="rgba(15,23,42,0.22)" />
            <ellipse cx="32" cy="55" rx="14" ry="3.4" fill="rgba(0,0,0,0.26)" />

            {/* 3D Faceted Sun/Light Rays */}
            <g fill={`url(#sh-ray-${uid})`}>
                <polygon points="10.5,21.5 19.5,24.2 18,26.8" />
                <polygon points="10.5,36.5 18,31.2 19.5,33.8" />
                <polygon points="53.5,21.5 46,26.8 44.5,24.2" />
                <polygon points="53.5,36.5 44.5,33.8 46,31.2" />
                <polygon points="18,11 24.2,16.4 22,18.4" />
                <polygon points="46,11 42,18.4 39.8,16.4" />
            </g>

            {/* 3D Extruded Depth Layer behind Figure */}
            <circle cx="33.2" cy="18.2" r="5.6" fill={deepTone} opacity="0.72" />
            <path
                d="M23.7 30.2C23.7 27.5 26 25.7 29 25.7H37.4C40.4 25.7 42.7 27.5 42.7 30.2V37.9C42.7 39.3 41.6 40.3 40.2 40.3C39 40.3 38 39.5 37.8 38.3L37.4 32.5V51.9C37.4 53.5 36.1 54.7 34.6 54.7C33.2 54.7 32.1 53.7 32 52.3L33.2 41.2L30.4 52.3C30.3 53.7 29.2 54.7 27.8 54.7C26.3 54.7 25 53.5 25 51.9V32.5L24.6 38.3C24.4 39.5 23.4 40.3 22.2 40.3C20.8 40.3 19.7 39.3 19.7 37.9V30.2Z"
                fill={deepTone}
                opacity="0.75"
            />

            {/* 3D Sculpted Figure Head */}
            <circle cx="32" cy="17.2" r="5.6" fill={`url(#sh-head-${uid})`} stroke={lightTone} strokeWidth="0.6" />
            <circle cx="30.2" cy="15.3" r="1.4" fill="#ffffff" opacity="0.65" />

            {/* 3D Sculpted Figure Torso & Limbs */}
            <path
                d="M22.5 29.5C22.5 26.8 24.8 25 27.8 25H36.2C39.2 25 41.5 26.8 41.5 29.5V37.2C41.5 38.6 40.4 39.6 39 39.6C37.8 39.6 36.8 38.8 36.6 37.6L36.2 31.8V51.2C36.2 52.8 34.9 54 33.4 54C32 54 30.9 53 30.8 51.6L32 40.5L29.2 51.6C29.1 53 28 54 26.6 54C25.1 54 23.8 52.8 23.8 51.2V31.8L23.4 37.6C23.2 38.8 22.2 39.6 21 39.6C19.6 39.6 18.5 38.6 18.5 37.2V29.5Z"
                fill={`url(#sh-body-${uid})`}
                stroke={lightTone}
                strokeWidth="0.65"
            />

            {/* Subtle 3D Specular Edge Highlight on Shoulders */}
            <path
                d="M27.2 26.3H36C37.5 26.3 39 27.2 39.5 28.6"
                stroke="#ffffff"
                strokeWidth="1.35"
                strokeLinecap="round"
                opacity="0.6"
            />
        </svg>
    );
};

export const Phone3DIcon: React.FC<IconBaseProps> = ({
    size = 36,
    className = '',
    style,
}) => {
    const uid = useId().replace(/:/g, '');

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                filter: 'drop-shadow(0 6px 9px rgba(185,28,28,0.44))',
                ...style,
            }}
        >
            <defs>
                <linearGradient id={`ph-side-${uid}`} x1="17" y1="8" x2="49" y2="58" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#991b1b" />
                    <stop offset="100%" stopColor="#450a0a" />
                </linearGradient>
                <linearGradient id={`ph-body-${uid}`} x1="16" y1="6" x2="46" y2="56" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="28%" stopColor="#ef4444" />
                    <stop offset="78%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
                <linearGradient id={`ph-screen-${uid}`} x1="20" y1="12" x2="42" y2="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="45%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <linearGradient id={`ph-glare-${uid}`} x1="20" y1="12" x2="38" y2="34" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.48" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* 3D Extruded Side/Bottom Chassis Depth */}
            <rect x="19.5" y="9" width="28" height="49" rx="6.5" fill={`url(#ph-side-${uid})`} />

            {/* Front 3D Beveled Red Smartphone Body */}
            <rect
                x="16.5"
                y="6"
                width="28"
                height="49"
                rx="6.5"
                fill={`url(#ph-body-${uid})`}
                stroke="#fecaca"
                strokeWidth="1.1"
            />

            {/* Side Volume/Power Button Relief */}
            <rect x="44.5" y="18" width="1.8" height="7" rx="0.9" fill="#b91c1c" />

            {/* Glossy Dark Glass Screen */}
            <rect x="19.5" y="11.5" width="22" height="36" rx="3.2" fill={`url(#ph-screen-${uid})`} stroke="#475569" strokeWidth="0.6" />

            {/* Diagonal Glass Specular Reflection */}
            <path
                d="M19.5 14.5C19.5 12.8 20.8 11.5 22.5 11.5H38L23 47.5H22.5C20.8 47.5 19.5 46.2 19.5 44.5V14.5Z"
                fill={`url(#ph-glare-${uid})`}
            />

            {/* 3D Direction Ring & Pointer on Screen */}
            <circle cx="30.5" cy="28" r="6" stroke="rgba(248,113,113,0.45)" strokeWidth="1" />
            <path
                d="M30.5 22.5L35 31L30.5 29L26 31Z"
                fill="#fca5a5"
            />

            {/* Top Speaker Pill */}
            <rect x="26.5" y="8.2" width="8" height="1.6" rx="0.8" fill="#fee2e2" opacity="0.9" />

            {/* Bottom Home Bar */}
            <rect x="26" y="50.2" width="9" height="2" rx="1" fill="#fee2e2" opacity="0.95" />
        </svg>
    );
};

interface Qibla3DArrowProps {
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const Qibla3DArrow: React.FC<Qibla3DArrowProps> = ({
    color = '#d97706',
    className = 'w-full h-full',
    style,
}) => {
    const uid = useId().replace(/:/g, '');
    const isNearWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';
    const lightTone = isNearWhite ? '#ffffff' : adjustHexColor(color, 0.42);
    const midTone = isNearWhite ? '#e2e8f0' : color;
    const darkTone = isNearWhite ? '#64748b' : adjustHexColor(color, -0.36);
    const edgeTone = isNearWhite ? '#334155' : adjustHexColor(color, -0.56);

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            style={style}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id={`qa-left-${uid}`} x1="38" y1="2" x2="50" y2="23" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="32%" stopColor={lightTone} />
                    <stop offset="100%" stopColor={midTone} />
                </linearGradient>
                <linearGradient id={`qa-right-${uid}`} x1="50" y1="2" x2="62" y2="23" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={midTone} />
                    <stop offset="65%" stopColor={darkTone} />
                    <stop offset="100%" stopColor={edgeTone} />
                </linearGradient>
                <linearGradient id={`qa-bevel-${uid}`} x1="38" y1="18" x2="62" y2="25" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={darkTone} />
                    <stop offset="100%" stopColor={edgeTone} />
                </linearGradient>
                <filter id={`qa-shadow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.34" />
                </filter>
            </defs>

            <g filter={`url(#qa-shadow-${uid})`}>
                {/* 3D Extruded Bottom Thickness Bevel */}
                <polygon
                    points="50,17 38,22.5 40.5,24.8 50,19.8 59.5,24.8 62,22.5"
                    fill={`url(#qa-bevel-${uid})`}
                />

                {/* Left Lit 3D Facet */}
                <polygon
                    points="50,2 38,22.5 50,17"
                    fill={`url(#qa-left-${uid})`}
                />

                {/* Right Shaded 3D Facet */}
                <polygon
                    points="50,2 62,22.5 50,17"
                    fill={`url(#qa-right-${uid})`}
                />

                {/* Crisp Center Spine Highlight */}
                <line
                    x1="50"
                    y1="2.8"
                    x2="50"
                    y2="17"
                    stroke="#ffffff"
                    strokeWidth="0.95"
                    strokeLinecap="round"
                    opacity="0.82"
                />

                {/* Subtle Specular Edge Glint */}
                <line
                    x1="49.5"
                    y1="3.4"
                    x2="40"
                    y2="20.4"
                    stroke="#ffffff"
                    strokeWidth="0.7"
                    strokeLinecap="round"
                    opacity="0.55"
                />
            </g>
        </svg>
    );
};

interface Compass3DLetterProps {
    letter: string;
    color?: string;
    size?: number;
    isPrimary?: boolean;
    className?: string;
}

export const Compass3DLetter: React.FC<Compass3DLetterProps> = ({
    letter,
    color = '#94a3b8',
    size = 34,
    isPrimary = false,
    className = '',
}) => {
    const uid = useId().replace(/:/g, '');
    const isNearWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';
    const topTone = isNearWhite ? '#ffffff' : adjustHexColor(color, 0.45);
    const midTone = isNearWhite ? '#e2e8f0' : color;
    const darkTone = isNearWhite ? '#64748b' : adjustHexColor(color, -0.4);
    const extrudeTone = isNearWhite ? '#334155' : adjustHexColor(color, -0.58);

    const fontSize = isPrimary ? 27 : 20;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 44 44"
            className={className}
            style={{
                overflow: 'visible',
                filter: isPrimary
                    ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.28))'
                    : 'drop-shadow(0 3px 4px rgba(0,0,0,0.2))',
            }}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id={`cl-face-${uid}`} x1="22" y1="7" x2="22" y2="35" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={topTone} />
                    <stop offset="48%" stopColor={midTone} />
                    <stop offset="100%" stopColor={darkTone} />
                </linearGradient>
            </defs>

            {/* Multi-layer 3D Extruded Depth */}
            <text
                x="22"
                y="24.5"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Cairo, sans-serif"
                fontWeight="900"
                fontSize={fontSize}
                fill={extrudeTone}
                opacity="0.9"
            >
                {letter}
            </text>
            <text
                x="22"
                y="23.4"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Cairo, sans-serif"
                fontWeight="900"
                fontSize={fontSize}
                fill={extrudeTone}
            >
                {letter}
            </text>
            <text
                x="22"
                y="22.3"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Cairo, sans-serif"
                fontWeight="900"
                fontSize={fontSize}
                fill={darkTone}
            >
                {letter}
            </text>

            {/* Front Sculpted Face with Subtle Bevel Rim */}
            <text
                x="22"
                y="21"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Cairo, sans-serif"
                fontWeight="900"
                fontSize={fontSize}
                fill={`url(#cl-face-${uid})`}
                stroke={isNearWhite ? 'rgba(255,255,255,0.75)' : adjustHexColor(color, 0.6)}
                strokeWidth="0.65"
                paintOrder="stroke fill"
            >
                {letter}
            </text>
        </svg>
    );
};

interface Compass3DCenterDomeProps {
    color?: string;
    size?: number;
}

export const Compass3DCenterDome: React.FC<Compass3DCenterDomeProps> = ({
    color = '#d97706',
    size = 26,
}) => {
    const uid = useId().replace(/:/g, '');
    const isNearWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';
    const lightTone = isNearWhite ? '#ffffff' : adjustHexColor(color, 0.5);
    const midTone = isNearWhite ? '#e2e8f0' : color;
    const darkTone = isNearWhite ? '#475569' : adjustHexColor(color, -0.45);

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.32))' }}
        >
            <defs>
                <radialGradient id={`cd-dome-${uid}`} cx="34%" cy="30%" r="68%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="26%" stopColor={lightTone} />
                    <stop offset="72%" stopColor={midTone} />
                    <stop offset="100%" stopColor={darkTone} />
                </radialGradient>
                <linearGradient id={`cd-ring-${uid}`} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
            </defs>

            {/* Outer Metallic Collar */}
            <circle cx="16" cy="16" r="13.5" fill={`url(#cd-ring-${uid})`} />
            <circle cx="16" cy="16" r="11" fill={darkTone} opacity="0.25" />

            {/* 3D Spherical Gemstone Dome */}
            <circle cx="16" cy="16" r="10" fill={`url(#cd-dome-${uid})`} />

            {/* Specular Shine Highlight */}
            <ellipse cx="12.5" cy="12" rx="3.4" ry="2" transform="rotate(-28 12.5 12)" fill="#ffffff" opacity="0.78" />
        </svg>
    );
};

interface KaabaAR3DMonumentProps extends IconBaseProps {
    isAligned?: boolean;
    accentColor?: string;
    accentLightColor?: string;
}

export const KaabaAR3DMonument: React.FC<KaabaAR3DMonumentProps> = ({
    size = 96,
    isAligned = false,
    accentColor = '#f59e0b',
    accentLightColor = '#fde047',
    className = '',
    style,
}) => {
    const uid = useId().replace(/:/g, '');

    const glowPrimary = isAligned ? '#22c55e' : accentColor;
    const glowSecondary = isAligned ? '#6ee7b7' : accentLightColor;
    const pedSideLeft = isAligned ? '#065f46' : adjustHexColor(accentColor, -0.45);
    const pedSideRight = isAligned ? '#047857' : adjustHexColor(accentColor, -0.6);
    const pedTopLight = isAligned ? '#d1fae5' : '#ffffff';
    const pedTopDark = isAligned ? '#6ee7b7' : '#cbd5e1';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 110 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                filter: isAligned
                    ? 'drop-shadow(0 10px 18px rgba(34,197,94,0.62))'
                    : 'drop-shadow(0 10px 16px rgba(0,0,0,0.58))',
                ...style,
            }}
        >
            <defs>
                <radialGradient id={`kar-beam-${uid}`} cx="50%" cy="72%" r="54%">
                    <stop offset="0%" stopColor={glowSecondary} stopOpacity="0.48" />
                    <stop offset="55%" stopColor={glowPrimary} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={glowPrimary} stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`kar-ped-top-${uid}`} x1="20" y1="68" x2="90" y2="92" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={pedTopLight} />
                    <stop offset="60%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor={pedTopDark} />
                </linearGradient>
                <linearGradient id={`kar-ped-side-${uid}`} x1="16" y1="78" x2="94" y2="94" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={pedSideLeft} />
                    <stop offset="50%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor={pedSideRight} />
                </linearGradient>
                <linearGradient id={`kar-roof-${uid}`} x1="28" y1="16" x2="82" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#52525b" />
                    <stop offset="55%" stopColor="#27272a" />
                    <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
                <linearGradient id={`kar-left-${uid}`} x1="24" y1="28" x2="55" y2="82" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#27272a" />
                    <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
                <linearGradient id={`kar-right-${uid}`} x1="55" y1="28" x2="86" y2="82" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3f3f46" />
                    <stop offset="65%" stopColor="#18181b" />
                    <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
                <linearGradient id={`kar-gold-l-${uid}`} x1="24" y1="36" x2="55" y2="56" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#b45309" />
                    <stop offset="55%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fde047" />
                </linearGradient>
                <linearGradient id={`kar-gold-r-${uid}`} x1="55" y1="36" x2="86" y2="56" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fef9c3" />
                    <stop offset="48%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id={`kar-door-${uid}`} x1="65" y1="54" x2="76" y2="75" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fef9c3" />
                    <stop offset="45%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
            </defs>

            {/* Volumetric Holographic Glow Aura */}
            <ellipse cx="55" cy="60" rx="46" ry="44" fill={`url(#kar-beam-${uid})`} />

            {/* Deep Ground Shadow under 3D Pedestal */}
            <ellipse cx="55" cy="96" rx="40" ry="10.5" fill="rgba(0,0,0,0.52)" />

            {/* 3D Extruded Circular Haram Marble Pedestal */}
            <path
                d="M17 81V88C17 94.6 34 100 55 100C76 100 93 94.6 93 88V81H17Z"
                fill={`url(#kar-ped-side-${uid})`}
            />
            <ellipse cx="55" cy="81" rx="38" ry="12" fill={`url(#kar-ped-top-${uid})`} stroke={glowSecondary} strokeWidth="1.2" />
            <ellipse cx="55" cy="81" rx="31" ry="9.2" fill="none" stroke={glowPrimary} strokeWidth="0.9" strokeOpacity="0.48" />

            {/* Subtle Hijr Ismail (Hatim) 3D Semi-Circular Marble Wall on Left */}
            <path
                d="M27 76C23 79.2 25.5 84.5 34.5 86.2"
                stroke="#f8fafc"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.88"
            />
            <path
                d="M27 76C23 79.2 25.5 84.5 34.5 86.2"
                stroke="#94a3b8"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.65"
            />

            {/* Stepped Marble Shadherwan Base */}
            <polygon points="22,72 55,86 55,81.5 22,67.5" fill="#cbd5e1" />
            <polygon points="88,72 55,86 55,81.5 88,67.5" fill="#f8fafc" />

            {/* Kaaba Monumental Walls - Left (Shaded) & Right (Lit) */}
            <polygon points="25,30 55,43 55,81.5 25,68.5" fill={`url(#kar-left-${uid})`} />
            <polygon points="85,30 55,43 55,81.5 85,68.5" fill={`url(#kar-right-${uid})`} />

            {/* Crisp Front Corner Ridge Highlight */}
            <line x1="55" y1="43" x2="55" y2="81.5" stroke="rgba(255,255,255,0.42)" strokeWidth="1.2" />

            {/* Roof Face + Parapet Bevel + Inner Recessed Surface */}
            <polygon points="55,17 85,30 55,43 25,30" fill={`url(#kar-roof-${uid})`} />
            <polygon
                points="55,20 78.2,30 55,40 31.8,30"
                fill="none"
                stroke="rgba(255,255,255,0.34)"
                strokeWidth="1.2"
            />
            <polygon points="55,21.6 74.5,30 55,38.4 35.5,30" fill="rgba(0,0,0,0.34)" />

            {/* Golden Mizab al-Rahmah Spout */}
            <polygon points="35,24.8 41.5,27.6 38.5,29.5 32,26.7" fill="#fde047" />

            {/* Golden Kiswah Belt (Hizam) */}
            <polygon points="25,38.5 55,51.5 55,56.8 25,43.8" fill={`url(#kar-gold-l-${uid})`} />
            <polygon points="85,38.5 55,51.5 55,56.8 85,43.8" fill={`url(#kar-gold-r-${uid})`} />
            {/* Secondary Lower Gold Accent Band */}
            <polygon points="25,45.2 55,58.2 55,59.6 25,46.6" fill="#fbbf24" opacity="0.75" />
            <polygon points="85,45.2 55,58.2 55,59.6 85,46.6" fill="#fef08a" opacity="0.85" />

            {/* Calligraphic Medallions & Qandil Accents */}
            <ellipse cx="35.5" cy="45.8" rx="2" ry="1.25" fill="#fef08a" opacity="0.92" />
            <ellipse cx="45.5" cy="50.1" rx="2" ry="1.25" fill="#fef08a" opacity="0.92" />
            <ellipse cx="64.5" cy="50.1" rx="2" ry="1.25" fill="#fef9c3" opacity="0.96" />
            <ellipse cx="74.5" cy="45.8" rx="2" ry="1.25" fill="#fef9c3" opacity="0.96" />

            {/* Bab al-Kaaba (Golden Door on Right Wall) */}
            <polygon points="65.5,56.8 74.5,52.9 74.5,73 65.5,76.9" fill={`url(#kar-door-${uid})`} />
            <polygon
                points="66.8,58 73.2,55.2 73.2,72 66.8,74.8"
                fill="none"
                stroke="#78350f"
                strokeWidth="0.8"
                opacity="0.78"
            />
            <line x1="70" y1="56.6" x2="70" y2="73.4" stroke="#78350f" strokeWidth="0.8" opacity="0.72" />

            {/* Hajar al-Aswad (Black Stone Silver Bezel) */}
            <ellipse cx="57.6" cy="69.5" rx="1.9" ry="2.7" fill="#f1f5f9" />
            <ellipse cx="57.6" cy="69.5" rx="1.1" ry="1.75" fill="#09090b" />
        </svg>
    );
};
