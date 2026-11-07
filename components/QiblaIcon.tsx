import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePrayerTimes } from '../context/PrayerTimesContext';

export function getDarkerThemeColor(theme: any, variant?: string, isNight?: boolean): string {
    if (isNight) return '#fbbf24'; // High contrast vibrant gold on dark card

    const v = variant || theme?.homeThemeVariant || theme?.variant || (typeof theme === 'string' ? theme : null);
    if (v === 'sky') return '#0284c7';
    if (v === 'emerald') return '#047857';
    if (v === 'burgundy') return '#9f1239';
    if (v === 'gold') return '#78350f';

    if (theme?.isDark) return '#fbbf24';

    const primary = theme?.palette?.[0] || theme?.accent || theme?.primaryColor || '#d97706';

    if (primary && primary.startsWith('#')) {
        let hex = primary.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map((c: string) => c + c).join('');
        }
        if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            // Darken channels by ~35% for rich contrast
            const darkR = Math.max(0, Math.floor(r * 0.62));
            const darkG = Math.max(0, Math.floor(g * 0.62));
            const darkB = Math.max(0, Math.floor(b * 0.62));

            return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
        }
    }

    return primary || '#78350f';
}

export function getAlignedThemeColor(theme: any, variant?: string, isNight?: boolean): string {
    if (isNight) return '#34d399'; // Bright emerald green in night mode
    const v = variant || theme?.homeThemeVariant || theme?.variant || (typeof theme === 'string' ? theme : null);
    if (v === 'sky') return '#0284c7';
    if (v === 'emerald') return '#10b981';
    if (v === 'burgundy') return '#e11d48';
    if (v === 'gold') return '#10b981';
    return theme?.accent || '#10b981';
}

interface QiblaIconProps {
    className?: string;
    size?: number;
    color?: string;
    disableSensor?: boolean;
    style?: React.CSSProperties;
}

export const QiblaIcon: React.FC<QiblaIconProps> = ({
    className = "w-7 h-7",
    size,
    color,
    disableSensor = false,
    style
}) => {
    let themeObj: any = null;
    let homeThemeVariant: string = 'gold';
    let isNightMode: boolean = false;
    try {
        const themeCtx = useTheme();
        themeObj = themeCtx?.theme;
        homeThemeVariant = themeCtx?.homeThemeVariant || 'gold';
        isNightMode = themeCtx?.isNightMode || false;
    } catch {}

    let prayerConfig: any = null;
    try {
        const prayerCtx = usePrayerTimes();
        prayerConfig = prayerCtx?.config;
    } catch {}

    const [heading, setHeading] = useState<number>(0);
    const [hasSensor, setHasSensor] = useState<boolean>(false);
    const [qiblaDirection, setQiblaDirection] = useState<number>(255); // Default estimation
    const [isAligned, setIsAligned] = useState<boolean>(false);

    const targetHeadingRef = useRef<number>(0);
    const smoothedHeadingRef = useRef<number>(0);

    // Calculate Qibla direction based on user geolocation if available
    useEffect(() => {
        const lat = prayerConfig?.location?.lat;
        const lng = prayerConfig?.location?.lng;
        if (typeof lat === 'number' && typeof lng === 'number') {
            const kaabaLat = 21.4225;
            const kaabaLng = 39.8262;
            const toRad = (d: number) => (d * Math.PI) / 180;
            const toDeg = (r: number) => (r * 180) / Math.PI;

            const uLat = toRad(lat);
            const kLat = toRad(kaabaLat);
            const dLng = toRad(kaabaLng - lng);

            const y = Math.sin(dLng) * Math.cos(kLat);
            const x = Math.cos(uLat) * Math.sin(kLat) - Math.sin(uLat) * Math.cos(kLat) * Math.cos(dLng);

            let direction = (toDeg(Math.atan2(y, x)) + 360) % 360;
            setQiblaDirection(direction);
        }
    }, [prayerConfig?.location?.lat, prayerConfig?.location?.lng]);

    // Listen to live orientation sensor with continuous shortest-path angle unwrapping
    useEffect(() => {
        if (disableSensor) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            let angle: number | undefined;
            if ((event as any).webkitCompassHeading !== undefined) {
                angle = (event as any).webkitCompassHeading;
            } else if (event.absolute && event.alpha !== null) {
                angle = (360 - event.alpha) % 360;
            } else if (event.alpha !== null) {
                angle = (360 - event.alpha) % 360;
            }

            if (typeof angle === 'number' && !isNaN(angle)) {
                // Shortest angular distance unwrapping to prevent 360-degree flip spins
                const currentMod = ((targetHeadingRef.current % 360) + 360) % 360;
                let diff = angle - currentMod;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;

                targetHeadingRef.current += diff;
                setHasSensor(true);
            }
        };

        if ('ondeviceorientationabsolute' in window) {
            (window as any).addEventListener('deviceorientationabsolute', handleOrientation, true);
        }
        window.addEventListener('deviceorientation', handleOrientation, true);

        return () => {
            (window as any).removeEventListener('deviceorientationabsolute', handleOrientation, true);
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, [disableSensor]);

    // Smooth animation loop using low-pass exponential filter (lerp)
    useEffect(() => {
        if (!hasSensor || disableSensor) return;

        let animId: number;
        const animate = () => {
            // Low-pass exponential smoothing factor (0.06 = heavy liquid dampening for ultra-smooth slow rotation)
            const diff = targetHeadingRef.current - smoothedHeadingRef.current;
            if (Math.abs(diff) > 0.005) {
                smoothedHeadingRef.current += diff * 0.06;
                setHeading(smoothedHeadingRef.current);
            }
            animId = requestAnimationFrame(animate);
        };

        animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, [hasSensor, disableSensor]);

    // Check Qibla alignment without any vibration (purely visual color change)
    useEffect(() => {
        if (!hasSensor || disableSensor) {
            setIsAligned(false);
            return;
        }

        const normalizedHeading = ((heading % 360) + 360) % 360;
        const diff = Math.abs((normalizedHeading - qiblaDirection + 360) % 360);
        const aligned = diff < 7 || diff > 353;
        setIsAligned(aligned);
        // Vibration completely removed as requested
    }, [heading, qiblaDirection, hasSensor, disableSensor]);

    const defaultIconColor = color || getDarkerThemeColor(themeObj, homeThemeVariant, isNightMode);
    const alignedColor = getAlignedThemeColor(themeObj, homeThemeVariant, isNightMode);

    const activeIconColor = isAligned ? alignedColor : defaultIconColor;

    const containerStyle: React.CSSProperties = {
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
        color: activeIconColor,
        filter: isAligned ? `drop-shadow(0 0 6px ${alignedColor})` : undefined,
        transition: 'color 0.4s ease, filter 0.4s ease',
        ...style
    };

    const finalNeedleRotation = hasSensor ? qiblaDirection - heading : 0;
    const finalDialRotation = hasSensor ? -heading : 0;

    return (
        <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} ${isAligned ? 'animate-pulse' : ''}`}
            style={containerStyle}
        >
            {/* Outer Ring with subtle glow shadow */}
            <circle 
                cx="18" 
                cy="18" 
                r="16" 
                stroke="currentColor" 
                strokeWidth={isAligned ? "2.5" : "2"} 
                strokeLinecap="round" 
                className="transition-all duration-400"
            />
            
            {/* Inner Ticked Ring */}
            <circle cx="18" cy="18" r="13" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1.5 2.5" opacity="0.65" />
            
            {/* Cardinal Points - Islamic Star Accents */}
            <g style={{ transform: `rotate(${finalDialRotation}deg)`, transformOrigin: '18px 18px', transition: 'transform 0.3s ease-out' }}>
                <path d="M18 3.5L19.3 5.5L18 7.2L16.7 5.5Z" fill="currentColor" />
                <path d="M32.5 18L30.5 19.3L28.8 18L30.5 16.7Z" fill="currentColor" opacity="0.75" />
                <path d="M18 32.5L16.7 30.5L18 28.8L19.3 30.5Z" fill="currentColor" opacity="0.75" />
                <path d="M3.5 18L5.5 16.7L7.2 18L5.5 19.3Z" fill="currentColor" opacity="0.75" />
            </g>

            {/* Qibla Needle - Rotates dynamically to point to Qibla */}
            <g style={{ transform: `rotate(${finalNeedleRotation}deg)`, transformOrigin: '18px 18px', transition: 'transform 0.3s ease-out' }}>
                {/* Qibla Needle - Top Arrow */}
                <path d="M18 7.5L22.2 17.5L18 15.5L13.8 17.5Z" fill="currentColor" />

                {/* Qibla Needle - Bottom Arrow */}
                <path d="M18 28.5L13.8 18.5L18 20.5L22.2 18.5Z" fill="currentColor" opacity="0.4" />

                {/* Miniature Kaaba Motif on Top Pointer Peak */}
                <rect x="15.8" y="2.2" width="4.4" height="4.4" rx="0.8" fill="currentColor" />
                <path d="M15.8 4.2H20.2" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.95" />
            </g>

            {/* Center Pivot Pearl */}
            <circle cx="18" cy="18" r="2.5" fill="currentColor" />
            <circle cx="18" cy="18" r="1.1" fill="#FFFFFF" />
        </svg>
    );
};

export default QiblaIcon;
