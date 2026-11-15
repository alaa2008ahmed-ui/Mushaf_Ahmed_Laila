import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
    Sun, 
    Moon, 
    Sunrise, 
    Sunset, 
    Compass, 
    ChevronDown, 
    Play, 
    RotateCcw,
    Sparkles,
    Flame,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualSunPathProps {
    times: Record<string, string>;
    primaryColor: string;
    isBlackTheme?: boolean;
    isGoldenTheme?: boolean;
}

const toEnglishDigits = (s: string | number) => String(s ?? '')
    .replace(/[٠-٩]/g, d => (d.charCodeAt(0) - 1632).toString())
    .replace(/[۰-۹]/g, d => (d.charCodeAt(0) - 1776).toString());

export const VisualSunPath: React.FC<VisualSunPathProps> = ({
    times,
    primaryColor,
    isBlackTheme = false,
    isGoldenTheme = false
}) => {
    const { language, dir, isRTL, formatNumber } = useLanguage();
    const isAr = language === 'ar';

    // Always closed (collapsed) by default when opening the page at any time
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [simulatedProgress, setSimulatedProgress] = useState<number>(0);
    const simulationAnimRef = useRef<number | null>(null);

    // Initial entrance animation progress: smoothly slides from 0 to real-time progress
    const [entranceProgress, setEntranceProgress] = useState<number>(0);

    // Refresh clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 15000);
        return () => clearInterval(timer);
    }, []);

    const toggleExpand = () => {
        setIsExpanded(prev => !prev);
    };

    const parseTimeToMinutes = useCallback((timeStr: string): number => {
        if (!timeStr) return 0;
        const cleaned = toEnglishDigits(timeStr);
        const [h, m] = cleaned.split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    }, []);

    // Clean plain text 12-hour time formatter
    const formatCleanTime12 = useCallback((timeStr: string) => {
        if (!timeStr || timeStr.includes('--')) return "--:--";
        const cleaned = toEnglishDigits(timeStr);
        const [h, m] = cleaned.split(':');
        let hInt = parseInt(h, 10);
        if (isNaN(hInt)) return timeStr;
        const ap = hInt >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
        hInt = hInt % 12 || 12;
        const formattedDigits = isAr 
            ? `${formatNumber(hInt)}:${formatNumber((m || '00').padStart(2, '0'))}` 
            : `${hInt}:${(m || '00').padStart(2, '0')}`;
        return `${formattedDigits} ${ap}`;
    }, [isAr, formatNumber]);

    if (!times || !times.Sunrise || !times.Maghrib || !times.Dhuhr) {
        return null;
    }

    const sunriseMins = parseTimeToMinutes(times.Sunrise);
    const dhuhrMins = parseTimeToMinutes(times.Dhuhr);
    const sunsetMins = parseTimeToMinutes(times.Maghrib);
    const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;

    // Is daytime (between sunrise and sunset)
    const isDaytime = nowMins >= sunriseMins && nowMins <= sunsetMins;

    // Real-time Day Progress (0.0 to 1.0)
    let realDayProgress = 0;
    if (isDaytime && sunsetMins > sunriseMins) {
        realDayProgress = Math.min(1, Math.max(0, (nowMins - sunriseMins) / (sunsetMins - sunriseMins)));
    } else if (nowMins > sunsetMins) {
        realDayProgress = 1;
    } else {
        realDayProgress = 0;
    }

    // Run entrance slide-in animation when expanded
    useEffect(() => {
        if (!isExpanded) return;
        setEntranceProgress(0);
        let startTs: number | null = null;
        const target = realDayProgress;
        const duration = 1400; // 1.4s smooth glide from 0 to current progress

        const step = (ts: number) => {
            if (!startTs) startTs = ts;
            const elapsed = ts - startTs;
            const p = Math.min(1, elapsed / duration);
            // Cubic ease out
            const eased = 1 - Math.pow(1 - p, 3);
            setEntranceProgress(eased * target);

            if (p < 1) {
                requestAnimationFrame(step);
            } else {
                setEntranceProgress(target);
            }
        };

        const anim = requestAnimationFrame(step);
        return () => cancelAnimationFrame(anim);
    }, [isExpanded, realDayProgress]);

    // Active displayed progress (simulated vs animated entrance)
    const activeProgress = isSimulating ? simulatedProgress : entranceProgress;

    // Simulation controller: travels 0% -> 100% over 5 seconds
    const startSimulation = () => {
        if (isSimulating) {
            // Stop simulation and restore real-time progress
            if (simulationAnimRef.current) cancelAnimationFrame(simulationAnimRef.current);
            setIsSimulating(false);
            setEntranceProgress(realDayProgress);
            return;
        }

        setIsSimulating(true);
        let startTs: number | null = null;
        const duration = 5000; // 5s full journey

        const step = (ts: number) => {
            if (!startTs) startTs = ts;
            const elapsed = ts - startTs;
            const p = Math.min(1, elapsed / duration);
            setSimulatedProgress(p);

            if (p < 1) {
                simulationAnimRef.current = requestAnimationFrame(step);
            } else {
                // Done simulation: gently glide back to real position
                setTimeout(() => {
                    setIsSimulating(false);
                    setEntranceProgress(realDayProgress);
                }, 800);
            }
        };

        simulationAnimRef.current = requestAnimationFrame(step);
    };

    useEffect(() => {
        return () => {
            if (simulationAnimRef.current) cancelAnimationFrame(simulationAnimRef.current);
        };
    }, []);

    // Daylight duration math
    const totalDaylightMins = Math.max(0, sunsetMins - sunriseMins);
    const daylightHours = Math.floor(totalDaylightMins / 60);
    const daylightRemainderMins = totalDaylightMins % 60;

    // Remaining or elapsed daylight
    const elapsedMins = isDaytime ? Math.max(0, Math.floor(nowMins - sunriseMins)) : 0;
    const elapsedHours = Math.floor(elapsedMins / 60);
    const elapsedRemMins = elapsedMins % 60;

    const remainingMins = isDaytime ? Math.max(0, Math.floor(sunsetMins - nowMins)) : 0;
    const remainingHours = Math.floor(remainingMins / 60);
    const remainingRemMins = remainingMins % 60;

    // Geometric 3D Arc Math
    // ViewBox: 0 0 380 155
    // Start (Sunrise) -> Zenith (Peak) -> End (Sunset)
    // In RTL (Arabic standard): East (Sunrise) on Right (x=335), West (Sunset) on Left (x=45).
    // In LTR (English standard): East (Sunrise) on Left (x=45), West (Sunset) on Right (x=335).
    const startX = isRTL ? 335 : 45;
    const endX = isRTL ? 45 : 335;
    const midX = 190;
    const baseY = 120;
    const peakAltitude = 24; // top height of arc

    // Parabolic trajectory function
    const getCoordinatesAt = useCallback((t: number) => {
        const clampedT = Math.max(0, Math.min(1, t));
        const x = startX + clampedT * (endX - startX);
        const y = baseY - 4 * (baseY - peakAltitude) * clampedT * (1 - clampedT);
        return { x, y };
    }, [startX, endX, baseY, peakAltitude]);

    const currentOrbPos = getCoordinatesAt(activeProgress);

    // Approximate solar altitude angle (0° at horizon to ~75° at zenith)
    const currentAltitudeDeg = Math.round(Math.sin(activeProgress * Math.PI) * 76);

    // Generate interpolated points for the glowing active path
    const activePathD = useMemo(() => {
        const steps = 36;
        const currentSteps = Math.max(1, Math.round(steps * activeProgress));
        let path = '';
        for (let i = 0; i <= currentSteps; i++) {
            const t = (i / steps) * activeProgress;
            const pt = getCoordinatesAt(t);
            if (i === 0) {
                path += `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
            } else {
                path += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
            }
        }
        return path;
    }, [activeProgress, getCoordinatesAt]);

    // Full theoretical trajectory
    const fullArcD = useMemo(() => {
        const steps = 40;
        let path = '';
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const pt = getCoordinatesAt(t);
            if (i === 0) path += `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
            else path += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
        }
        return path;
    }, [getCoordinatesAt]);

    // Status description
    const getStatusText = () => {
        if (isSimulating) {
            const pct = Math.round(simulatedProgress * 100);
            return isAr 
                ? `محاكاة المسار اليومي (${formatNumber(pct)}٪)` 
                : `Simulating Solar Cycle (${pct}%)`;
        }
        if (!isDaytime) {
            return isAr ? 'فترة الليل (الاستعداد ليوم جديد)' : 'Nighttime (Resting period)';
        }
        const diffFromDhuhr = nowMins - dhuhrMins;
        if (Math.abs(diffFromDhuhr) <= 18) {
            return isAr ? 'استواء الشمس في كبد السماء (وقت الزوال)' : 'Solar Noon (Sun at Zenith)';
        }
        if (nowMins < dhuhrMins) {
            return isAr ? 'الشمس في مسار الارتفاع نحو الزوال' : 'Sun ascending towards Zenith';
        }
        return isAr ? 'الشمس في مسار الانحدار نحو الغروب' : 'Sun descending towards Sunset';
    };

    // Color tones based on active state & theme
    const themeAccents = useMemo(() => {
        if (isBlackTheme) {
            return {
                cardBg: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
                cardBorder: '1px solid rgba(255, 255, 255, 0.12)',
                headerColor: '#FFFFFF',
                skyGradient: 'radial-gradient(ellipse at 50% 18%, rgba(39, 39, 42, 0.8) 0%, rgba(24, 24, 27, 0.95) 60%, rgba(9, 9, 11, 1) 100%)',
                podBg: 'linear-gradient(135deg, rgba(39,39,42,0.7) 0%, rgba(24,24,27,0.85) 100%)',
                podBorder: 'rgba(255, 255, 255, 0.1)',
                podActiveBorder: '#F59E0B',
                podActiveBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(24,24,27,0.9) 100%)',
                sunCore: '#FBBF24',
                sunRim: '#EA580C',
                horizonLine: 'rgba(255, 255, 255, 0.18)'
            };
        }
        if (isGoldenTheme) {
            return {
                cardBg: 'linear-gradient(145deg, #FFFDF7 0%, #FEF9EE 100%)',
                cardBorder: '1px solid rgba(217, 119, 6, 0.25)',
                headerColor: '#B45309',
                skyGradient: 'radial-gradient(ellipse at 50% 18%, rgba(254, 243, 199, 0.95) 0%, rgba(253, 230, 138, 0.45) 50%, rgba(254, 252, 232, 0.9) 100%)',
                podBg: 'linear-gradient(135deg, #FFFFFF 0%, #FEF9EE 100%)',
                podBorder: 'rgba(217, 119, 6, 0.18)',
                podActiveBorder: '#D97706',
                podActiveBg: 'linear-gradient(135deg, rgba(254, 243, 199, 0.8) 0%, #FFFFFF 100%)',
                sunCore: '#FDE047',
                sunRim: '#D97706',
                horizonLine: 'rgba(180, 83, 9, 0.2)'
            };
        }
        // Standard Modern / Amber theme
        return {
            cardBg: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
            cardBorder: '1px solid rgba(0, 0, 0, 0.06)',
            headerColor: primaryColor || '#D97706',
            skyGradient: 'radial-gradient(ellipse at 50% 18%, rgba(254, 249, 195, 0.8) 0%, rgba(224, 242, 254, 0.45) 50%, rgba(248, 250, 252, 0.9) 100%)',
            podBg: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            podBorder: 'rgba(0, 0, 0, 0.08)',
            podActiveBorder: primaryColor || '#F59E0B',
            podActiveBg: 'linear-gradient(135deg, rgba(254, 243, 199, 0.5) 0%, #FFFFFF 100%)',
            sunCore: '#FDE047',
            sunRim: '#EA580C',
            horizonLine: 'rgba(0, 0, 0, 0.12)'
        };
    }, [isBlackTheme, isGoldenTheme, primaryColor]);

    // Active Pod Stage determination
    const activeStage = useMemo(() => {
        if (!isDaytime) return 'night';
        if (nowMins < dhuhrMins) return 'morning'; // sunrise -> zenith
        if (nowMins <= sunsetMins) return 'afternoon'; // zenith -> sunset
        return 'night';
    }, [isDaytime, nowMins, dhuhrMins, sunsetMins]);

    return (
        <div 
            id="visual-sun-path-card" 
            dir={dir}
            className="w-full app-page-card rounded-3xl mb-3 relative overflow-hidden transition-all duration-300 select-none shadow-xl"
            style={{ 
                background: themeAccents.cardBg,
                border: themeAccents.cardBorder,
                boxShadow: isBlackTheme 
                    ? '0 16px 36px -8px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.1)' 
                    : '0 12px 32px -6px rgba(0,0,0,0.07), 0 4px 12px -2px rgba(217,119,6,0.06), inset 0 1px 1px rgba(255,255,255,0.8)'
            }}
        >
            {/* 3D Elevated Header Bar */}
            <div 
                onClick={toggleExpand}
                className="flex items-center justify-between gap-2.5 p-3 sm:p-3.5 cursor-pointer relative z-10 transition-colors active:opacity-90"
            >
                {/* Right / Start: 3D Sun Icon & Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                        className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 relative transition-transform duration-300 hover:scale-105"
                        style={{ 
                            background: isBlackTheme 
                                ? 'linear-gradient(135deg, #27272a 0%, #18181b 100%)' 
                                : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                            boxShadow: isBlackTheme
                                ? '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
                                : '0 4px 12px rgba(245, 158, 11, 0.35), inset 0 1px 1px rgba(255,255,255,0.9)'
                        }}
                    >
                        {isDaytime ? (
                            <Sun 
                                size={19} 
                                className="text-amber-500 animate-[spin_12s_linear_infinite]" 
                                style={{ filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.8))' }}
                            />
                        ) : (
                            <Moon 
                                size={18} 
                                className="text-indigo-400 animate-pulse" 
                                style={{ filter: 'drop-shadow(0 0 6px rgba(129, 140, 248, 0.7))' }}
                            />
                        )}
                        {/* 3D Glass shine reflection */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-2xl pointer-events-none" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 
                                className="text-xs sm:text-sm font-black tracking-tight leading-tight" 
                                style={{ color: themeAccents.headerColor }}
                            >
                                {isAr ? 'مسار الشمس المرئي' : 'Visual Sun Path'}
                            </h4>
                            {isDaytime && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                    <Sparkles size={9} />
                                    <span>{formatNumber(currentAltitudeDeg)}°</span>
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] sm:text-[10.5px] opacity-80 font-medium leading-tight mt-0.5 truncate">
                            {getStatusText()}
                        </p>
                    </div>
                </div>

                {/* Left / End: Simulation Button + Daylight Pill + 3D Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Daylight Duration Badge */}
                    <div 
                        className="text-[9.5px] sm:text-[10px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap hidden xs:flex items-center gap-1"
                        style={{ 
                            background: isBlackTheme ? 'rgba(255,255,255,0.08)' : 'rgba(245, 158, 11, 0.12)',
                            color: themeAccents.headerColor,
                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)'
                        }}
                    >
                        <Clock size={11} className="shrink-0 opacity-80" />
                        <span>
                            {isAr 
                                ? `النهار: ${formatNumber(daylightHours)} س و ${formatNumber(daylightRemainderMins)} د` 
                                : `Daylight: ${daylightHours}h ${daylightRemainderMins}m`}
                        </span>
                    </div>

                    {/* 3D Expand / Collapse Chevron */}
                    <div 
                        className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-300"
                        style={{
                            background: isBlackTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                    >
                        <ChevronDown size={16} style={{ color: themeAccents.headerColor }} />
                    </div>
                </div>
            </div>

            {/* Expandable 3D Visual Celestial Stage */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="sun-path-stage"
                        initial={{ opacity: 0, height: 0, scale: 0.97 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.97 }}
                        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 pt-0 sm:px-4 sm:pb-3.5 flex flex-col gap-3">
                            
                            {/* 3D Sky Dome Arena with Dynamic Perspective & Shimmer */}
                            <div 
                                className="w-full rounded-2xl p-2 relative overflow-hidden transition-all duration-500"
                                style={{
                                    background: themeAccents.skyGradient,
                                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1), inset 0 -2px 10px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
                                    border: isBlackTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(245, 158, 11, 0.15)'
                                }}
                            >
                                {/* Interactive Simulation Controls Ribbon inside Dome */}
                                <div className="absolute top-2.5 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
                                    {/* Daylight Progress Pill */}
                                    <div className="flex items-center gap-1.5 text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-xs text-slate-700 dark:text-zinc-200">
                                        <Flame size={11} className="text-amber-500" />
                                        <span>
                                            {isAr 
                                                ? `مستوى الارتفاع: ${formatNumber(currentAltitudeDeg)}°` 
                                                : `Sun Altitude: ${currentAltitudeDeg}°`}
                                        </span>
                                    </div>

                                    {/* 3D Interactive Simulation Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startSimulation();
                                        }}
                                        className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
                                        style={{
                                            background: isSimulating 
                                                ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' 
                                                : isBlackTheme
                                                    ? 'linear-gradient(135deg, #3f3f46 0%, #27272a 100%)'
                                                    : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                            color: '#FFFFFF',
                                            boxShadow: isSimulating 
                                                ? '0 3px 10px rgba(239, 68, 68, 0.45)' 
                                                : '0 3px 10px rgba(245, 158, 11, 0.35)'
                                        }}
                                        title={isAr ? 'محاكاة رحلة الشمس طوال اليوم' : 'Simulate Sun Day Journey'}
                                    >
                                        {isSimulating ? <RotateCcw size={11} className="animate-spin" /> : <Play size={11} fill="currentColor" />}
                                        <span>
                                            {isSimulating 
                                                ? (isAr ? 'إيقاف المحاكاة' : 'Stop') 
                                                : (isAr ? 'محاكاة حركة الشمس' : 'Simulate')}
                                        </span>
                                    </button>
                                </div>

                                {/* Celestial SVG Canvas: Complete 3D Celestial Sphere & Solar Mechanics */}
                                <div className="w-full h-[148px] sm:h-[160px] relative mt-2">
                                    <svg 
                                        viewBox="0 0 380 155" 
                                        className="w-full h-full overflow-visible select-none"
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        <defs>
                                            {/* Volumetric Sun Sphere Radial Gradient */}
                                            <radialGradient id="sunSphereGrad" cx="35%" cy="35%" r="65%">
                                                <stop offset="0%" stopColor="#FFFFFF" />
                                                <stop offset="25%" stopColor={themeAccents.sunCore} />
                                                <stop offset="70%" stopColor="#F59E0B" />
                                                <stop offset="95%" stopColor={themeAccents.sunRim} />
                                                <stop offset="100%" stopColor="#9A3412" />
                                            </radialGradient>

                                            {/* Solar Corona Glow Filter */}
                                            <filter id="solarCoronaGlow" x="-60%" y="-60%" width="220%" height="220%">
                                                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                                                <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
                                                <feMerge>
                                                    <feMergeNode in="blur2" />
                                                    <feMergeNode in="blur1" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>

                                            {/* Traversed Path Golden Beam Gradient */}
                                            <linearGradient id="activeBeamGradient" x1={isRTL ? "100%" : "0%"} y1="0%" x2={isRTL ? "0%" : "100%"} y2="0%">
                                                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                                                <stop offset="50%" stopColor="#FDE047" stopOpacity="1" />
                                                <stop offset="100%" stopColor="#EA580C" stopOpacity="0.9" />
                                            </linearGradient>

                                            {/* Ambient Arc Tube Gradient */}
                                            <linearGradient id="ambientArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor={isBlackTheme ? '#71717A' : '#CBD5E1'} stopOpacity="0.25" />
                                                <stop offset="50%" stopColor={isBlackTheme ? '#A1A1AA' : '#94A3B8'} stopOpacity="0.5" />
                                                <stop offset="100%" stopColor={isBlackTheme ? '#71717A' : '#CBD5E1'} stopOpacity="0.25" />
                                            </linearGradient>

                                            {/* Ground Grid Ellipse Gradient */}
                                            <linearGradient id="horizonTerrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.12" />
                                                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                                            </linearGradient>

                                            {/* Vertical Sunbeam Drop Gradient */}
                                            <linearGradient id="verticalSunbeam" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#FDE047" stopOpacity="0.65" />
                                                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
                                            </linearGradient>
                                        </defs>

                                        {/* 1. Perspective 3D Ground Horizon Plane */}
                                        <ellipse 
                                            cx={midX} 
                                            cy={baseY} 
                                            rx="160" 
                                            ry="22" 
                                            fill="url(#horizonTerrainGrad)" 
                                        />

                                        {/* 3D Perspective Ground Grid Lines */}
                                        <g opacity={isBlackTheme ? 0.35 : 0.2}>
                                            <line x1="60" y1={baseY} x2="110" y2={baseY + 18} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
                                            <line x1="120" y1={baseY} x2="150" y2={baseY + 20} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
                                            <line x1="260" y1={baseY} x2="230" y2={baseY + 20} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
                                            <line x1="320" y1={baseY} x2="270" y2={baseY + 18} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
                                        </g>

                                        {/* Ground Horizon Datum Line */}
                                        <line 
                                            x1="30" 
                                            y1={baseY} 
                                            x2="350" 
                                            y2={baseY} 
                                            stroke={themeAccents.horizonLine} 
                                            strokeWidth="1.8" 
                                            strokeDasharray="4 4"
                                        />

                                        {/* 2. Celestial Concentric Altitude Rings (Astrolabe Guidance) */}
                                        <path 
                                            d={`M 75 ${baseY} Q ${midX} 56 305 ${baseY}`} 
                                            fill="none" 
                                            stroke={isBlackTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} 
                                            strokeWidth="1" 
                                            strokeDasharray="2 3"
                                        />
                                        <path 
                                            d={`M 110 ${baseY} Q ${midX} 86 270 ${baseY}`} 
                                            fill="none" 
                                            stroke={isBlackTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 
                                            strokeWidth="1" 
                                            strokeDasharray="2 3"
                                        />

                                        {/* Solar Zenith Meridian Center Axis */}
                                        <line 
                                            x1={midX} 
                                            y1={peakAltitude} 
                                            x2={midX} 
                                            y2={baseY} 
                                            stroke={isBlackTheme ? 'rgba(255,255,255,0.15)' : 'rgba(217,119,6,0.22)'} 
                                            strokeWidth="1.2" 
                                            strokeDasharray="2 2"
                                        />

                                        {/* 3. Outer Volumetric Arc Tube (Shadow & Core) */}
                                        {/* Arc Ground Drop Shadow */}
                                        <path 
                                            d={`M ${startX} ${baseY + 2} Q ${midX} ${peakAltitude + 16} ${endX} ${baseY + 2}`} 
                                            fill="none" 
                                            stroke={isBlackTheme ? 'rgba(0,0,0,0.6)' : 'rgba(180,83,9,0.08)'} 
                                            strokeWidth="6" 
                                            strokeLinecap="round"
                                        />

                                        {/* Ambient Full Path Tube */}
                                        <path 
                                            d={fullArcD} 
                                            fill="none" 
                                            stroke="url(#ambientArcGrad)" 
                                            strokeWidth="3.5" 
                                            strokeLinecap="round"
                                        />

                                        {/* 4. Traversed Radiant Solar Beam Trail (From Sunrise to Current Pos) */}
                                        {activePathD && (
                                            <>
                                                {/* Outer luminous glow of the path */}
                                                <path 
                                                    d={activePathD} 
                                                    fill="none" 
                                                    stroke="#F59E0B" 
                                                    strokeWidth="7" 
                                                    strokeLinecap="round" 
                                                    opacity="0.3"
                                                />
                                                {/* Core intense laser trail */}
                                                <path 
                                                    d={activePathD} 
                                                    fill="none" 
                                                    stroke="url(#activeBeamGradient)" 
                                                    strokeWidth="3" 
                                                    strokeLinecap="round"
                                                />
                                            </>
                                        )}

                                        {/* 5. Landmark Beacons (الشروق - الزوال - الغروب) */}
                                        
                                        {/* A. Sunrise Beacon (East) */}
                                        <g transform={`translate(${startX}, ${baseY})`}>
                                            {/* Horizon Pulsing Rings */}
                                            <circle cx="0" cy="0" r="10" fill="#F59E0B" opacity="0.18" className="animate-ping" />
                                            {/* 3D Base Pedestal */}
                                            <ellipse cx="0" cy="2" rx="9" ry="3.5" fill="#B45309" opacity="0.5" />
                                            <circle cx="0" cy="0" r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                                            <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                                        </g>

                                        {/* B. Zenith Pillar Marker (الزوال - كبد السماء) */}
                                        <g transform={`translate(${midX}, ${peakAltitude})`}>
                                            <circle cx="0" cy="0" r="7" fill={isBlackTheme ? '#FFFFFF' : primaryColor} opacity="0.15" />
                                            <polygon 
                                                points="0,-6 5,0 0,6 -5,0" 
                                                fill={isBlackTheme ? '#FFFFFF' : themeAccents.headerColor} 
                                                stroke="#FFFFFF" 
                                                strokeWidth="1"
                                            />
                                        </g>

                                        {/* C. Sunset Beacon (West) */}
                                        <g transform={`translate(${endX}, ${baseY})`}>
                                            {/* Horizon Dusk Aura */}
                                            <circle cx="0" cy="0" r="10" fill="#EA580C" opacity="0.18" className="animate-ping" />
                                            {/* 3D Base Pedestal */}
                                            <ellipse cx="0" cy="2" rx="9" ry="3.5" fill="#7C2D12" opacity="0.5" />
                                            <circle cx="0" cy="0" r="5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
                                            <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                                        </g>

                                        {/* 6. Real-time Vertical Sunbeam Casting Onto Ground */}
                                        {isDaytime && currentOrbPos && (
                                            <g>
                                                {/* Ground contact shadow */}
                                                <ellipse 
                                                    cx={currentOrbPos.x} 
                                                    cy={baseY} 
                                                    rx="14" 
                                                    ry="4" 
                                                    fill="#F59E0B" 
                                                    opacity="0.35" 
                                                />
                                                {/* Vertical cone light pillar */}
                                                <polygon 
                                                    points={`
                                                        ${currentOrbPos.x - 3},${currentOrbPos.y + 10} 
                                                        ${currentOrbPos.x + 3},${currentOrbPos.y + 10} 
                                                        ${currentOrbPos.x + 10},${baseY} 
                                                        ${currentOrbPos.x - 10},${baseY}
                                                    `}
                                                    fill="url(#verticalSunbeam)" 
                                                />
                                            </g>
                                        )}

                                        {/* 7. The 3D Master Sun Sphere / Moon Celestial Body */}
                                        {isDaytime && currentOrbPos ? (
                                            <g transform={`translate(${currentOrbPos.x}, ${currentOrbPos.y})`}>
                                                {/* Deep Atmospheric Halo */}
                                                <circle 
                                                    cx="0" 
                                                    cy="0" 
                                                    r="24" 
                                                    fill="#FBBF24" 
                                                    opacity="0.25" 
                                                    filter="url(#solarCoronaGlow)" 
                                                />

                                                {/* Rotating Solar Corona Flares (8 Rays) */}
                                                <g className="animate-[spin_10s_linear_infinite]" opacity="0.75">
                                                    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                                                        <line 
                                                            key={deg} 
                                                            x1="0" 
                                                            y1="0" 
                                                            x2={Math.cos((deg * Math.PI) / 180) * 19} 
                                                            y2={Math.sin((deg * Math.PI) / 180) * 19} 
                                                            stroke="#F59E0B" 
                                                            strokeWidth="1.6" 
                                                            strokeLinecap="round"
                                                        />
                                                    ))}
                                                </g>

                                                {/* Volumetric 3D Spherical Sun Body */}
                                                <circle 
                                                    cx="0" 
                                                    cy="0" 
                                                    r="12.5" 
                                                    fill="url(#sunSphereGrad)" 
                                                    stroke="rgba(255,255,255,0.7)" 
                                                    strokeWidth="1.2"
                                                    style={{ filter: 'drop-shadow(0 4px 10px rgba(245, 158, 11, 0.6))' }}
                                                />

                                                {/* 3D Specular Highlight Bulb */}
                                                <ellipse 
                                                    cx="-3.5" 
                                                    cy="-3.5" 
                                                    rx="4" 
                                                    ry="2.5" 
                                                    fill="#FFFFFF" 
                                                    opacity="0.9" 
                                                    transform="rotate(-25, -3.5, -3.5)"
                                                />

                                                {/* Floating Live Altitude Badge above the Sun */}
                                                <g transform="translate(0, -21)">
                                                    <rect 
                                                        x="-19" 
                                                        y="-9" 
                                                        width="38" 
                                                        height="16" 
                                                        rx="8" 
                                                        fill={isBlackTheme ? '#27272a' : '#1e293b'} 
                                                        stroke={isBlackTheme ? 'rgba(255,255,255,0.2)' : 'rgba(245,158,11,0.5)'}
                                                        strokeWidth="1"
                                                    />
                                                    <text 
                                                        x="0" 
                                                        y="2.5" 
                                                        textAnchor="middle" 
                                                        fill="#FFFFFF" 
                                                        fontSize="9" 
                                                        fontWeight="900" 
                                                        fontFamily="Cairo, sans-serif"
                                                    >
                                                        {formatNumber(currentAltitudeDeg)}°
                                                    </text>
                                                </g>
                                            </g>
                                        ) : (
                                            /* Night Mode: 3D Celestial Crescent Moon at Center Sky */
                                            <g transform={`translate(${midX}, 36)`}>
                                                <circle cx="0" cy="0" r="22" fill="#6366F1" opacity="0.2" filter="url(#solarCoronaGlow)" />
                                                <circle cx="0" cy="0" r="11" fill="#818CF8" />
                                                <circle 
                                                    cx="4" 
                                                    cy="-2.5" 
                                                    r="9" 
                                                    fill={isBlackTheme ? '#18181b' : (isGoldenTheme ? '#FEF9EE' : '#F8FAFC')} 
                                                />
                                                <text 
                                                    x="0" 
                                                    y="24" 
                                                    textAnchor="middle" 
                                                    fill={isBlackTheme ? '#A1A1AA' : '#64748B'} 
                                                    fontSize="9" 
                                                    fontWeight="bold"
                                                    fontFamily="Cairo, sans-serif"
                                                >
                                                    {isAr ? 'فترة السكون والليل' : 'Night Sky'}
                                                </text>
                                            </g>
                                        )}
                                    </svg>
                                </div>
                            </div>

                            {/* 3D Elevated Landmark Stations (الشروق - الزوال - الغروب) */}
                            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                                
                                {/* 1. Sunrise Station (الشروق) */}
                                <div 
                                    className="p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden"
                                    style={{
                                        background: activeStage === 'morning' ? themeAccents.podActiveBg : themeAccents.podBg,
                                        border: activeStage === 'morning' 
                                            ? `1.5px solid ${themeAccents.podActiveBorder}` 
                                            : `1px solid ${themeAccents.podBorder}`,
                                        boxShadow: activeStage === 'morning'
                                            ? '0 6px 16px -2px rgba(245, 158, 11, 0.25), inset 0 1px 1px rgba(255,255,255,0.7)'
                                            : '0 3px 8px -1px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    <div className="flex items-center gap-1.5 opacity-90">
                                        <div className="w-5 h-5 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                                            <Sunrise size={12} className="text-amber-500" />
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] font-extrabold truncate">
                                            {isAr ? 'الشروق' : 'Sunrise'}
                                        </span>
                                    </div>
                                    <span 
                                        className="text-xs sm:text-sm font-black font-mono tabular-nums leading-tight mt-1" 
                                        style={{ color: themeAccents.headerColor }}
                                    >
                                        {formatCleanTime12(times.Sunrise)}
                                    </span>
                                    <span className="text-[9px] opacity-65 font-medium mt-0.5">
                                        {isDaytime 
                                            ? (isAr ? `مضى ${formatNumber(elapsedHours)} س` : `${elapsedHours}h ago`)
                                            : (isAr ? 'بداية النهار' : 'Dawn')}
                                    </span>
                                </div>

                                {/* 2. Solar Noon / Zenith Station (الزوال / الظهر) */}
                                <div 
                                    className="p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden"
                                    style={{
                                        background: Math.abs(nowMins - dhuhrMins) <= 30 && isDaytime ? themeAccents.podActiveBg : themeAccents.podBg,
                                        border: Math.abs(nowMins - dhuhrMins) <= 30 && isDaytime
                                            ? `1.5px solid ${themeAccents.podActiveBorder}` 
                                            : `1px solid ${themeAccents.podBorder}`,
                                        boxShadow: Math.abs(nowMins - dhuhrMins) <= 30 && isDaytime
                                            ? '0 6px 16px -2px rgba(245, 158, 11, 0.25), inset 0 1px 1px rgba(255,255,255,0.7)'
                                            : '0 3px 8px -1px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    <div className="flex items-center gap-1.5 opacity-90">
                                        <div className="w-5 h-5 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                                            <Compass size={12} className="text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] font-extrabold truncate">
                                            {isAr ? 'الزوال / الظهر' : 'Zenith'}
                                        </span>
                                    </div>
                                    <span 
                                        className="text-xs sm:text-sm font-black font-mono tabular-nums leading-tight mt-1" 
                                        style={{ color: themeAccents.headerColor }}
                                    >
                                        {formatCleanTime12(times.Dhuhr)}
                                    </span>
                                    <span className="text-[9px] opacity-65 font-medium mt-0.5">
                                        {isAr ? 'أعلى نقطة' : 'Solar Peak'}
                                    </span>
                                </div>

                                {/* 3. Sunset Station (الغروب) */}
                                <div 
                                    className="p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden"
                                    style={{
                                        background: activeStage === 'afternoon' ? themeAccents.podActiveBg : themeAccents.podBg,
                                        border: activeStage === 'afternoon' 
                                            ? `1.5px solid ${themeAccents.podActiveBorder}` 
                                            : `1px solid ${themeAccents.podBorder}`,
                                        boxShadow: activeStage === 'afternoon'
                                            ? '0 6px 16px -2px rgba(234, 88, 12, 0.25), inset 0 1px 1px rgba(255,255,255,0.7)'
                                            : '0 3px 8px -1px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    <div className="flex items-center gap-1.5 opacity-90">
                                        <div className="w-5 h-5 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                                            <Sunset size={12} className="text-orange-500" />
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] font-extrabold truncate">
                                            {isAr ? 'الغروب' : 'Sunset'}
                                        </span>
                                    </div>
                                    <span 
                                        className="text-xs sm:text-sm font-black font-mono tabular-nums leading-tight mt-1" 
                                        style={{ color: themeAccents.headerColor }}
                                    >
                                        {formatCleanTime12(times.Maghrib)}
                                    </span>
                                    <span className="text-[9px] opacity-65 font-medium mt-0.5">
                                        {isDaytime 
                                            ? (isAr ? `متبقي ${formatNumber(remainingHours)} س` : `${remainingHours}h left`)
                                            : (isAr ? 'غروب الشمس' : 'Dusk')}
                                    </span>
                                </div>
                            </div>

                            {/* Slim 3D Daylight Elapsed Bar */}
                            <div className="w-full pt-1 flex flex-col gap-1">
                                <div className="flex items-center justify-between text-[9px] sm:text-[9.5px] opacity-75 font-semibold px-0.5">
                                    <span>{isAr ? 'انقضاء ساعات النهار' : 'Daylight Elapsed'}</span>
                                    <span className="font-mono font-bold">
                                        {formatNumber(Math.round(activeProgress * 100))}٪
                                    </span>
                                </div>
                                <div 
                                    className="w-full h-1.5 rounded-full overflow-hidden relative"
                                    style={{ background: isBlackTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}
                                >
                                    <div 
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${Math.round(activeProgress * 100)}%`,
                                            background: 'linear-gradient(90deg, #F59E0B 0%, #EA580C 100%)',
                                            boxShadow: '0 0 8px rgba(245, 158, 11, 0.7)'
                                        }}
                                    />
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VisualSunPath;
