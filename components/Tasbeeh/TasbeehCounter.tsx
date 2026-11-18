import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatTasbeehNumber, tTasbeeh } from '../../utils/tasbeehTranslations';
import { motion, AnimatePresence } from 'motion/react';

export type TasbeehSkinType = 'modern' | 'classic' | 'beads' | 'wheel' | 'crystal' | 'mechanical';

interface TasbeehCounterProps {
    isCountingStopped: boolean;
    target: number;
    secondaryTextColor: string;
    primaryTextColor: string;
    counterColor: string;
    count: number;
    handleIncrement: () => void;
    isBlackAndWhite?: boolean;
    skin?: TasbeehSkinType | string;
    isDefaultTheme?: boolean;
    theme?: any;
    cardBorderColor?: string;
}

const TasbeehCounter: React.FC<TasbeehCounterProps> = ({ 
    isCountingStopped, 
    target, 
    counterColor, 
    count, 
    handleIncrement, 
    isBlackAndWhite, 
    skin = 'modern', 
    theme 
}) => {
    const { language } = useLanguage();
    const isBlackTheme = theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || theme?.accent || '#2E7D5E');
    
    // If counterColor was the old default black, use the vibrant primary theme color
    const activeColor = (!counterColor || counterColor === '#000000') && !isBlackTheme 
        ? primaryColor 
        : counterColor;

    // Calculate progress percentage
    const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0;
    const strokeDasharray = 283; // 2 * pi * r (approx 45)
    const strokeDashoffset = strokeDasharray - (strokeDasharray * progress) / 100;

    const isWhite = activeColor === '#FFFFFF' || activeColor === 'white' || activeColor === '#fff';

    const renderCounter = () => {
        // 1. Classic 3D Handheld Digital Tally Counter (عداد كلاسيكي ثلاثي الأبعاد)
        if (skin === 'classic') {
            return (
                <div className="relative flex items-center justify-center my-4">
                    {/* Ambient Glow */}
                    <div 
                        className="absolute w-48 h-56 rounded-[3rem] pointer-events-none -z-10 transition-all duration-300"
                        style={{
                            background: `radial-gradient(circle, ${activeColor}35 0%, ${activeColor}00 72%)`
                        }}
                    />
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.96, y: 4 }}
                        onClick={handleIncrement}
                        className="tasbeeh-counter relative w-44 rounded-[2.6rem] p-4 pb-5 flex flex-col items-center justify-between cursor-pointer select-none transition-all"
                        style={{
                            background: isWhite
                                ? 'linear-gradient(155deg, #ffffff 0%, #f1f5f9 55%, #e2e8f0 100%)'
                                : `linear-gradient(155deg, ${activeColor} 0%, ${activeColor}e6 60%, rgba(0,0,0,0.28) 100%)`,
                            backgroundColor: activeColor,
                            boxShadow: isWhite
                                ? '0 10px 0 #cbd5e1, 0 20px 34px -4px rgba(0,0,0,0.18), inset 0 3px 4px rgba(255,255,255,1), inset 0 -4px 8px rgba(0,0,0,0.08)'
                                : `0 10px 0 rgba(0,0,0,0.34), 0 22px 38px -6px ${activeColor}75, inset 0 3px 5px rgba(255,255,255,0.42), inset 0 -6px 10px rgba(0,0,0,0.28)`,
                            color: isWhite ? '#0f172a' : '#ffffff'
                        }}
                    >
                        {/* Top Gloss Highlight */}
                        <div
                            className="w-16 h-1 rounded-full mb-2.5"
                            style={{
                                background: isWhite ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)',
                                boxShadow: isWhite
                                    ? '0 1.5px 0 rgba(15,23,42,0.12), inset 0 1px 1px rgba(255,255,255,0.95)'
                                    : '0 1.5px 0 rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.65)'
                            }}
                        />

                        {/* Recessed 3D Digital LCD Screen */}
                        <div
                            className="w-full rounded-2xl px-3 py-3 mb-3.5 flex flex-col items-center justify-center relative overflow-hidden"
                            style={{
                                background: isBlackTheme
                                    ? 'linear-gradient(180deg, #090d16 0%, #111827 100%)'
                                    : 'linear-gradient(180deg, #cbd5c0 0%, #dbe4d0 100%)',
                                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.35), inset 0 -1px 2px rgba(255,255,255,0.45), 0 1px 0 rgba(255,255,255,0.3)'
                            }}
                        >
                            <span
                                className="text-4xl font-mono font-black tracking-wider leading-none"
                                style={{
                                    color: isBlackTheme ? '#34d399' : '#1e293b',
                                    textShadow: isBlackTheme ? '0 0 10px rgba(52,211,153,0.45)' : '0 1px 0 rgba(255,255,255,0.5)'
                                }}
                            >
                                {formatTasbeehNumber(count, language)}
                            </span>
                            <span
                                className="text-[10px] font-bold mt-1 opacity-70"
                                style={{ color: isBlackTheme ? '#a7f3d0' : '#334155' }}
                            >
                                {target > 0 ? `${formatTasbeehNumber(count, language)} / ${formatTasbeehNumber(target, language)}` : tTasbeeh('targetOpen', language)}
                            </span>
                        </div>

                        {/* Sculpted 3D Physical Thumb Click Dome */}
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center relative"
                            style={{
                                background: isWhite
                                    ? 'radial-gradient(circle at 35% 28%, #ffffff 0%, #e2e8f0 70%, #cbd5e1 100%)'
                                    : `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.42) 0%, ${activeColor} 45%, rgba(0,0,0,0.38) 100%)`,
                                boxShadow: isWhite
                                    ? '0 6px 0 #94a3b8, 0 10px 16px rgba(0,0,0,0.16), inset 0 2px 3px rgba(255,255,255,0.95)'
                                    : '0 6px 0 rgba(0,0,0,0.38), 0 10px 18px rgba(0,0,0,0.32), inset 0 2px 4px rgba(255,255,255,0.55)'
                            }}
                        >
                            <span className="text-xs font-black tracking-wide" style={{ color: isWhite ? '#0f172a' : '#ffffff' }}>
                                {isCountingStopped ? tTasbeeh('resetPrompt', language) : tTasbeeh('tapToCount', language)}
                            </span>
                        </div>
                    </motion.button>
                </div>
            );
        }

        // 2. 3D Multi-Bead Sliding Prayer Strand (حبات المسبحة ثلاثية الأبعاد)
        if (skin === 'beads') {
            const visibleBeadIds = [count - 1, count, count + 1];
            const beadGradient = isWhite
                ? 'radial-gradient(circle at 30% 26%, #ffffff 0%, #f1f5f9 55%, #cbd5e1 85%, #94a3b8 100%)'
                : `radial-gradient(circle at 30% 26%, rgba(255,255,255,0.85) 0%, ${activeColor} 42%, #09090b 100%)`;

            return (
                <button
                    type="button"
                    onClick={handleIncrement}
                    className="relative flex flex-col items-center justify-center w-full my-2 cursor-pointer select-none focus:outline-none group"
                >
                    <div className="relative h-60 w-full flex items-center justify-center overflow-visible">
                        {/* 3D Vertical Braided Cord */}
                        <div
                            className="absolute top-2 bottom-2 w-2 left-1/2 -translate-x-1/2 rounded-full z-0"
                            style={{
                                background: isBlackTheme
                                    ? 'linear-gradient(90deg, #27272a, #71717a, #27272a)'
                                    : 'linear-gradient(90deg, #94a3b8, #e2e8f0, #64748b)',
                                boxShadow: 'inset 0 0 2px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.15)'
                            }}
                        />

                        {/* Top Metallic Finial Cap */}
                        <div
                            className="w-7 h-3 rounded-full absolute top-2 z-10"
                            style={{
                                background: 'linear-gradient(180deg, #fde68a 0%, #d97706 60%, #92400e 100%)',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.8)'
                            }}
                        />

                        {/* Gold Spacer Ring */}
                        <div
                            className="w-8 h-2.5 rounded-full absolute z-10 pointer-events-none"
                            style={{
                                transform: 'translateY(57px)',
                                background: 'linear-gradient(180deg, #fef08a 0%, #d97706 65%, #78350f 100%)',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.25)'
                            }}
                        />

                        {/* Smooth Continuous Upward Bead Conveyor */}
                        <AnimatePresence initial={false}>
                            {visibleBeadIds.map((beadId) => {
                                const isCenter = beadId === count;
                                const isTop = beadId === count - 1;

                                const targetState = isCenter
                                    ? { y: 0, scale: 1, opacity: 1 }
                                    : isTop
                                        ? { y: -80, scale: 0.38, opacity: 0.96 }
                                        : { y: 86, scale: 0.42, opacity: 1 };

                                return (
                                    <motion.div
                                        key={`bead-${beadId}`}
                                        initial={{ y: 118, scale: 0.16, opacity: 0 }}
                                        animate={targetState}
                                        exit={{
                                            y: -112,
                                            scale: 0.14,
                                            opacity: 0,
                                            transition: { duration: 0.22, ease: 'easeOut' }
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 280,
                                            damping: 25,
                                            mass: 0.8
                                        }}
                                        className="w-24 h-24 rounded-full flex items-center justify-center absolute pointer-events-none"
                                        style={{
                                            zIndex: isCenter ? 30 : 20,
                                            background: beadGradient,
                                            boxShadow: isCenter
                                                ? (isWhite
                                                    ? '0 10px 22px -2px rgba(0,0,0,0.22), inset 0 -6px 10px rgba(0,0,0,0.12), inset 0 4px 8px rgba(255,255,255,1)'
                                                    : `0 14px 28px -4px ${activeColor}85, 0 6px 12px rgba(0,0,0,0.3), inset 0 -6px 10px rgba(0,0,0,0.45), inset 0 4px 8px rgba(255,255,255,0.5)`)
                                                : '0 8px 16px rgba(0,0,0,0.25), inset 0 -5px 8px rgba(0,0,0,0.35), inset 0 3px 6px rgba(255,255,255,0.45)'
                                        }}
                                    >
                                        {/* Gloss Specular Spot */}
                                        <div className="absolute top-3 left-5 w-5 h-3 rounded-full bg-white/55 -rotate-25 blur-[0.5px] pointer-events-none" />

                                        <AnimatePresence>
                                            {isCenter && (
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.7 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.6 }}
                                                    transition={{ duration: 0.16 }}
                                                    className="text-3xl font-sans font-black relative z-10 leading-none"
                                                    style={{
                                                        color: isWhite ? '#0f172a' : '#ffffff',
                                                        textShadow: isWhite ? 'none' : '0 2px 6px rgba(0,0,0,0.45)'
                                                    }}
                                                >
                                                    {formatTasbeehNumber(count, language)}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    <div className="mt-2 text-xs font-bold relative z-10" style={{ color: primaryColor }}>
                        {isCountingStopped ? tTasbeeh('resetToStart', language) : tTasbeeh('tapToCount', language)}
                    </div>
                </button>
            );
        }

        // 3. 3D Circular Rosary Wheel (المسبحة الحلقية ثلاثية الأبعاد) - 11 beads for target 1..50, 33 beads otherwise
        if (skin === 'wheel') {
            const isCompactTarget = target >= 1 && target <= 50;
            const totalBeads = isCompactTarget ? 11 : 33;
            const activeIdx = count === 0 ? -1 : (count - 1) % totalBeads;
            const completedCycle = count > 0 && count % totalBeads === 0;
            const radius = isCompactTarget ? 94 : 102;

            return (
                <div className="relative flex items-center justify-center my-4">
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={handleIncrement}
                        className="tasbeeh-counter relative w-[236px] h-[236px] rounded-full flex items-center justify-center cursor-pointer select-none focus:outline-none"
                    >
                        {/* Subtle Ring String */}
                        <div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: `${radius * 2}px`,
                                height: `${radius * 2}px`,
                                border: `3px solid ${isBlackTheme ? 'rgba(255,255,255,0.16)' : 'rgba(100,116,139,0.25)'}`,
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)'
                            }}
                        />

                        {/* 11 or 33 3D Spherical Beads arranged in a complete circular rosary */}
                        {Array.from({ length: totalBeads }).map((_, i) => {
                            const angleDeg = (i * 360) / totalBeads - 90;
                            const angleRad = (angleDeg * Math.PI) / 180;
                            const bx = Math.cos(angleRad) * radius;
                            const by = Math.sin(angleRad) * radius;
                            const isHeadBead = i === 0;
                            const isLit = completedCycle || i <= activeIdx;
                            const isCurrent = i === activeIdx;
                            const beadSize = isCompactTarget
                                ? (isHeadBead ? 24 : (isCurrent ? 22 : 19))
                                : (isHeadBead ? 16 : (isCurrent ? 15 : 12));

                            return (
                                <div
                                    key={`${totalBeads}-${i}`}
                                    className="absolute rounded-full transition-all duration-200 pointer-events-none"
                                    style={{
                                        width: `${beadSize}px`,
                                        height: `${beadSize}px`,
                                        transform: `translate(${bx}px, ${by}px) ${isCurrent ? 'scale(1.22)' : 'scale(1)'}`,
                                        background: isHeadBead
                                            ? 'radial-gradient(circle at 30% 25%, #fef9c3 0%, #f59e0b 55%, #92400e 100%)'
                                            : isLit
                                                ? (isWhite
                                                    ? 'radial-gradient(circle at 30% 25%, #ffffff 0%, #e2e8f0 65%, #94a3b8 100%)'
                                                    : `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.85) 0%, ${activeColor} 50%, #09090b 100%)`)
                                                : (isBlackTheme
                                                    ? 'radial-gradient(circle at 30% 25%, #52525b 0%, #27272a 65%, #09090b 100%)'
                                                    : 'radial-gradient(circle at 30% 25%, #ffffff 0%, #cbd5e1 70%, #94a3b8 100%)'),
                                        boxShadow: isCurrent
                                            ? `0 0 12px ${isWhite ? 'rgba(255,255,255,0.8)' : activeColor}, 0 4px 8px rgba(0,0,0,0.35)`
                                            : '0 3px 6px rgba(0,0,0,0.28), inset 0 -2px 3px rgba(0,0,0,0.25)'
                                    }}
                                />
                            );
                        })}

                        {/* Central 3D Sculpted Medallion Counter */}
                        <div
                            className="w-32 h-32 rounded-full flex flex-col items-center justify-center relative z-10 transition-all"
                            style={{
                                background: isWhite
                                    ? 'radial-gradient(circle at 32% 24%, #ffffff 0%, #f1f5f9 65%, #cbd5e1 100%)'
                                    : `radial-gradient(circle at 32% 24%, rgba(255,255,255,0.45) 0%, ${activeColor} 55%, rgba(0,0,0,0.28) 100%)`,
                                backgroundColor: activeColor,
                                boxShadow: isWhite
                                    ? '0 7px 0 #94a3b8, 0 14px 26px rgba(0,0,0,0.18), inset 0 2px 4px rgba(255,255,255,1)'
                                    : `0 7px 0 rgba(0,0,0,0.28), 0 14px 28px -4px ${activeColor}75, inset 0 2.5px 4px rgba(255,255,255,0.45)`,
                                color: isWhite ? '#0f172a' : '#ffffff'
                            }}
                        >
                            <span
                                className="text-4xl sm:text-5xl font-sans font-black tracking-tight"
                                style={{ textShadow: isWhite ? 'none' : '0 3px 8px rgba(0,0,0,0.25)' }}
                            >
                                {formatTasbeehNumber(count, language)}
                            </span>
                            <span className="text-[11px] font-bold mt-1 opacity-85">
                                {isCountingStopped ? tTasbeeh('resetToStart', language) : tTasbeeh('tapToCount', language)}
                            </span>
                        </div>
                    </motion.button>
                </div>
            );
        }

        // 4. NEW DESIGN 2: 3D Faceted Crystal Gem Keycap (البلورة المضيئة ثلاثية الأبعاد)
        if (skin === 'crystal') {
            return (
                <div className="relative flex items-center justify-center my-5">
                    {/* Ambient Crystal Glow */}
                    <div
                        className="absolute w-48 h-48 rounded-[2.75rem] pointer-events-none -z-10 transition-all duration-300"
                        style={{
                            background: `radial-gradient(circle, ${activeColor}40 0%, ${activeColor}00 72%)`
                        }}
                    />

                    {/* Outer 3D Beveled Pedestal Frame */}
                    <div
                        className="p-2.5 rounded-[2.5rem] relative"
                        style={{
                            background: isBlackTheme
                                ? 'linear-gradient(160deg, #27272a 0%, #18181b 60%, #09090b 100%)'
                                : 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%)',
                            boxShadow: isBlackTheme
                                ? '0 9px 0 #09090b, 0 20px 36px rgba(0,0,0,0.8), inset 0 2px 2px rgba(255,255,255,0.2)'
                                : '0 9px 0 #94a3b8, 0 18px 34px rgba(0,0,0,0.16), inset 0 2px 3px rgba(255,255,255,0.95)'
                        }}
                    >
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.96, y: 5 }}
                            onClick={handleIncrement}
                            className="tasbeeh-counter relative w-38 h-38 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-all"
                            style={{
                                background: isWhite
                                    ? 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 48%, #e2e8f0 100%)'
                                    : `linear-gradient(135deg, rgba(255,255,255,0.38) 0%, ${activeColor} 45%, rgba(0,0,0,0.32) 100%)`,
                                backgroundColor: activeColor,
                                boxShadow: isWhite
                                    ? '0 7px 0 #cbd5e1, inset 0 3px 6px rgba(255,255,255,1), inset 0 -6px 12px rgba(0,0,0,0.08)'
                                    : `0 7px 0 rgba(0,0,0,0.34), 0 12px 24px -4px ${activeColor}80, inset 0 3px 6px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.28)`,
                                color: isWhite ? '#0f172a' : '#ffffff'
                            }}
                        >
                            {/* Faceted Diamond Inner Prism Overlay */}
                            <div
                                className="absolute inset-4 rounded-2xl rotate-45 pointer-events-none"
                                style={{
                                    border: `1.5px solid ${isWhite ? 'rgba(148,163,184,0.35)' : 'rgba(255,255,255,0.28)'}`,
                                    background: isWhite
                                        ? 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(226,232,240,0.2))'
                                        : 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.02))'
                                }}
                            />

                            {/* Diagonal Glass Light Sheen */}
                            <div
                                className="absolute -top-8 -left-8 w-28 h-28 rounded-full pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)'
                                }}
                            />

                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <AnimatePresence mode="popLayout">
                                    <motion.span
                                        key={count}
                                        initial={{ scale: 0.82, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 1.12, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 360, damping: 24 }}
                                        className="text-5xl sm:text-6xl font-sans font-black tracking-tight"
                                        style={{ textShadow: isWhite ? 'none' : '0 4px 12px rgba(0,0,0,0.3)' }}
                                    >
                                        {formatTasbeehNumber(count, language)}
                                    </motion.span>
                                </AnimatePresence>
                                <span className="text-xs font-bold mt-2 opacity-85">
                                    {isCountingStopped ? tTasbeeh('resetToStart', language) : tTasbeeh('tapToCount', language)}
                                </span>
                            </div>
                        </motion.button>
                    </div>
                </div>
            );
        }

        // 5. NEW DESIGN: 3D Mechanical Drum Counter (العداد الميكانيكي ثلاثي الأبعاد)
        if (skin === 'mechanical') {
            const rawDigits = String(count).padStart(4, '0').split('');
            const formattedDigits = rawDigits.map((d) => formatTasbeehNumber(d, language));

            return (
                <div className="relative flex items-center justify-center my-5">
                    {/* Ambient Glow */}
                    <div
                        className="absolute w-64 h-44 rounded-[2.2rem] pointer-events-none -z-10 transition-all duration-300"
                        style={{
                            background: `radial-gradient(circle, ${activeColor}38 0%, ${activeColor}00 72%)`
                        }}
                    />

                    <div className="relative flex items-center justify-center">
                        {/* Left 3D Metallic Knurled Thumbwheel */}
                        <div
                            className="w-3.5 h-16 rounded-s-lg -me-1 relative z-0"
                            style={{
                                background: 'repeating-linear-gradient(180deg, #e2e8f0 0px, #e2e8f0 3px, #64748b 3px, #64748b 6px)',
                                boxShadow: '-2px 4px 8px rgba(0,0,0,0.28), inset 0 2px 2px rgba(255,255,255,0.6)'
                            }}
                        />

                        {/* Main 3D Brushed Instrument Chassis */}
                        <div
                            className="relative z-10 w-60 rounded-[2rem] p-3.5 pb-4 flex flex-col items-center gap-3"
                            style={{
                                background: isWhite
                                    ? 'linear-gradient(165deg, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)'
                                    : `linear-gradient(165deg, ${activeColor} 0%, ${activeColor}e6 55%, rgba(0,0,0,0.32) 100%)`,
                                backgroundColor: activeColor,
                                boxShadow: isWhite
                                    ? '0 10px 0 #94a3b8, 0 22px 36px rgba(0,0,0,0.18), inset 0 3px 4px rgba(255,255,255,1), inset 0 -4px 8px rgba(0,0,0,0.08)'
                                    : `0 10px 0 rgba(0,0,0,0.36), 0 22px 38px -6px ${activeColor}75, inset 0 3px 5px rgba(255,255,255,0.45), inset 0 -6px 10px rgba(0,0,0,0.28)`
                            }}
                        >
                            {/* Top Metallic Screw/Highlight Detail */}
                            <div className="w-full flex items-center justify-between px-2">
                                <div className="w-2 h-2 rounded-full bg-white/45 shadow-inner" />
                                <div
                                    className="w-16 h-1 rounded-full"
                                    style={{
                                        background: isWhite ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)',
                                        boxShadow: isWhite
                                            ? '0 1.5px 0 rgba(15,23,42,0.12), inset 0 1px 1px rgba(255,255,255,0.95)'
                                            : '0 1.5px 0 rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.65)'
                                    }}
                                />
                                <div className="w-2 h-2 rounded-full bg-white/45 shadow-inner" />
                            </div>

                            {/* Recessed 3D Mechanical Drum Reels Housing */}
                            <div
                                dir="ltr"
                                className="w-full rounded-2xl p-2 flex items-center justify-center gap-1.5"
                                style={{
                                    background: 'linear-gradient(180deg, #090d16 0%, #1e293b 100%)',
                                    boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.75), 0 1px 0 rgba(255,255,255,0.35)'
                                }}
                            >
                                {formattedDigits.map((digitChar, idx) => (
                                    <div
                                        key={idx}
                                        className="relative flex-1 h-14 rounded-xl overflow-hidden flex items-center justify-center"
                                        style={{
                                            background: isBlackTheme
                                                ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 22%, #334155 50%, #1e293b 78%, #020617 100%)'
                                                : 'linear-gradient(180deg, #cbd5e1 0%, #f8fafc 22%, #ffffff 50%, #e2e8f0 80%, #94a3b8 100%)',
                                            boxShadow: 'inset 0 3px 4px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.45)'
                                        }}
                                    >
                                        {/* Drum Cylinder Horizontal Seam */}
                                        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/15 pointer-events-none z-20" />
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            <motion.span
                                                key={`${idx}-${digitChar}`}
                                                initial={{ y: 18, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -18, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                                                className="text-2xl sm:text-3xl font-sans font-black relative z-10 leading-none"
                                                style={{
                                                    color: isBlackTheme ? '#f8fafc' : '#0f172a'
                                                }}
                                            >
                                                {digitChar}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            {/* Target Progress Bar Strip */}
                            {target > 0 && (
                                <div
                                    className="w-full h-2 rounded-full bg-black/25 overflow-hidden p-[1.5px]"
                                    style={{
                                        boxShadow: isWhite
                                            ? 'inset 0 2px 4px rgba(15, 23, 42, 0.35), inset 0 -1px 1px rgba(255, 255, 255, 0.9), 0 1px 0 rgba(255, 255, 255, 0.7)'
                                            : 'inset 0 2px 4px rgba(0, 0, 0, 0.68), inset 0 -1px 1px rgba(255, 255, 255, 0.28), 0 1px 0 rgba(255, 255, 255, 0.22)'
                                    }}
                                >
                                    <motion.div
                                        className="h-full rounded-full"
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        style={{
                                            background: isWhite
                                                ? 'linear-gradient(180deg, #334155 0%, #0f172a 100%)'
                                                : 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
                                            boxShadow: isWhite
                                                ? '0 1px 2px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.35)'
                                                : '0 0 8px rgba(255,255,255,0.75), inset 0 1px 1px rgba(255,255,255,0.95), inset 0 -1px 1px rgba(0,0,0,0.2)'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Wide 3D Sculpted Tactile Rocker Trigger Bar */}
                            <motion.button
                                type="button"
                                whileTap={{ y: 4, scale: 0.98 }}
                                onClick={handleIncrement}
                                className="tasbeeh-counter w-full py-3.5 px-4 rounded-2xl flex items-center justify-between cursor-pointer select-none focus:outline-none"
                                style={{
                                    background: isWhite
                                        ? 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)'
                                        : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 75%, #cbd5e1 100%)',
                                    boxShadow: '0 6px 0 rgba(0,0,0,0.28), 0 10px 16px rgba(0,0,0,0.2), inset 0 2px 3px rgba(255,255,255,1)',
                                    color: '#0f172a'
                                }}
                            >
                                {/* Left tactile grip ribs */}
                                <div className="flex gap-1 opacity-60">
                                    <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)', boxShadow: '0 1px 0 rgba(255,255,255,0.8), inset 0 1px 1px rgba(0,0,0,0.35)' }} />
                                    <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)', boxShadow: '0 1px 0 rgba(255,255,255,0.8), inset 0 1px 1px rgba(0,0,0,0.35)' }} />
                                </div>

                                <span className="text-sm font-black tracking-wide">
                                    {isCountingStopped ? tTasbeeh('resetPrompt', language) : tTasbeeh('tapToCount', language)}
                                </span>

                                {/* Right tactile grip ribs */}
                                <div className="flex gap-1 opacity-60">
                                    <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)', boxShadow: '0 1px 0 rgba(255,255,255,0.8), inset 0 1px 1px rgba(0,0,0,0.35)' }} />
                                    <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)', boxShadow: '0 1px 0 rgba(255,255,255,0.8), inset 0 1px 1px rgba(0,0,0,0.35)' }} />
                                </div>
                            </motion.button>
                        </div>

                        {/* Right 3D Metallic Knurled Thumbwheel */}
                        <div
                            className="w-3.5 h-16 rounded-e-lg -ms-1 relative z-0"
                            style={{
                                background: 'repeating-linear-gradient(180deg, #e2e8f0 0px, #e2e8f0 3px, #64748b 3px, #64748b 6px)',
                                boxShadow: '2px 4px 8px rgba(0,0,0,0.28), inset 0 2px 2px rgba(255,255,255,0.6)'
                            }}
                        />
                    </div>
                </div>
            );
        }

        // 6. Default 'modern' skin (عداد حديث ثلاثي الأبعاد)
        return (
            <div className="relative flex items-center justify-center my-6">
                {/* Ambient Soft Glow Behind the Button */}
                <div 
                    className="absolute w-52 h-52 rounded-full pointer-events-none -z-10 transition-all duration-500"
                    style={{
                        background: `radial-gradient(circle, ${activeColor}45 0%, ${activeColor}00 70%)`
                    }}
                />

                {/* Animated Subtle Ripple Ring */}
                <motion.div 
                    animate={{ scale: [1, 1.07, 1], opacity: [0.4, 0.15, 0.4] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-46 h-46 rounded-full pointer-events-none -z-10"
                    style={{
                        border: `2px solid ${activeColor}50`,
                        backgroundColor: `${activeColor}0a`
                    }}
                />

                {/* SVG Progress Ring */}
                {target > 0 && (
                    <svg className="absolute w-[190px] h-[190px] -rotate-90 pointer-events-none drop-shadow-md z-0" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle 
                            cx="50" 
                            cy="50" 
                            r="45" 
                            fill="transparent" 
                            stroke={activeColor} 
                            strokeWidth="3.5" 
                            strokeOpacity="0.12" 
                        />
                        {/* Progress indicator */}
                        <motion.circle
                            cx="50" 
                            cy="50" 
                            r="45" 
                            fill="transparent" 
                            stroke={activeColor} 
                            strokeWidth="6" 
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: strokeDasharray }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            style={{ strokeDasharray }}
                        />
                    </svg>
                )}

                {/* Main 3D Domed Vibrant Counter Button */}
                <motion.button 
                    whileTap={{ scale: 0.94, y: 4 }}
                    onClick={handleIncrement} 
                    className={`tasbeeh-counter w-42 h-42 rounded-full flex flex-col items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none relative z-10 ${
                        isBlackAndWhite && isBlackTheme 
                            ? 'border-4 border-white shadow-[0_0_25px_rgba(255,255,255,0.4)]' 
                            : ''
                    }`} 
                    style={{ 
                        background: isWhite
                            ? 'radial-gradient(circle at 32% 24%, #ffffff 0%, #f1f5f9 65%, #cbd5e1 100%)'
                            : `radial-gradient(circle at 32% 24%, rgba(255,255,255,0.38) 0%, ${activeColor} 52%, rgba(0,0,0,0.22) 100%)`,
                        backgroundColor: activeColor,
                        boxShadow: isWhite 
                            ? '0 8px 0 #cbd5e1, 0 16px 30px -2px rgba(0, 0, 0, 0.14), inset 0 3px 4px rgba(255, 255, 255, 1), inset 0 -4px 6px rgba(0, 0, 0, 0.06)'
                            : `0 8px 0 rgba(0, 0, 0, 0.26), 0 18px 40px -8px ${activeColor}85, 0 8px 18px 0 ${activeColor}40, inset 0 3px 5px rgba(255, 255, 255, 0.42), inset 0 -5px 8px rgba(0, 0, 0, 0.22)`,
                        color: isWhite ? '#000000' : '#FFFFFF'
                    }}
                >
                    <div className="relative overflow-hidden h-24 flex items-center justify-center w-full mt-2">
                        <AnimatePresence mode="popLayout">
                            <motion.span 
                                key={count}
                                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -20, opacity: 0, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                                className="text-6xl md:text-7xl font-sans font-black tracking-tight absolute select-none" 
                                style={{ 
                                    textShadow: isWhite ? 'none' : '0 4px 12px rgba(0,0,0,0.25)', 
                                    color: 'inherit' 
                                }}
                            >
                                {formatTasbeehNumber(count, language)}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                    <span className="text-xs sm:text-sm font-bold mt-1 mb-3" style={{ color: 'inherit', opacity: 0.85 }}>
                        {isCountingStopped ? tTasbeeh('resetToStart', language) : tTasbeeh('tapToCount', language)}
                    </span>
                    
                    {/* Ripple/Glow highlight bar */}
                    {!isWhite && (
                        <div
                            className="absolute bottom-4 w-12 h-1 rounded-full"
                            style={{
                                background: 'rgba(255,255,255,0.3)',
                                boxShadow: '0 1.5px 0 rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.65)'
                            }}
                        />
                    )}
                </motion.button>
            </div>
        );
    };

    return (
        <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset }) => {
                const swipe = offset.x;
                if (swipe < -50) {
                    if ((window as any).handleNextPhrase) (window as any).handleNextPhrase();
                } else if (swipe > 50) {
                    if ((window as any).handlePrevPhrase) (window as any).handlePrevPhrase();
                }
            }}
            className="flex-grow flex flex-col items-center justify-center w-full max-w-lg space-y-6 py-2 relative z-0"
        >
            {/* Target Card - Elevated 3D Card matching AthkarAlSalah */}
            <div 
                className="app-page-card border-0 text-center px-6 py-3.5 rounded-2xl bg-white dark:bg-[#1E293B] w-full max-w-xs transition-all"
            >
                <span className="block text-xs font-bold mb-1 text-slate-500 dark:text-zinc-400">
                    {isCountingStopped && target > 0 ? tTasbeeh('targetReachedBanner', language) : tTasbeeh('targetLabel', language)}
                </span>
                <span className="text-3xl font-black font-sans tracking-tight" style={{ color: primaryColor }}>
                    {target > 0 ? formatTasbeehNumber(target, language) : tTasbeeh('targetOpen', language)}
                </span>
            </div>

            {renderCounter()}
        </motion.div>
    );
};

export default TasbeehCounter;
