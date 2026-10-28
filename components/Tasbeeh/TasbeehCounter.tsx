import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatTasbeehNumber, tTasbeeh } from '../../utils/tasbeehTranslations';
import { motion, AnimatePresence } from 'motion/react';

interface TasbeehCounterProps {
    isCountingStopped: boolean;
    target: number;
    secondaryTextColor: string;
    primaryTextColor: string;
    counterColor: string;
    count: number;
    handleIncrement: () => void;
    isBlackAndWhite?: boolean;
    skin?: string;
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
        if (skin === 'classic') {
            return (
                <div className="relative flex items-center justify-center my-4">
                    {/* Glow aura */}
                    <div 
                        className="absolute w-44 h-44 rounded-full pointer-events-none -z-10 transition-all duration-300"
                        style={{
                            background: `radial-gradient(circle, ${activeColor}40 0%, ${activeColor}00 70%)`
                        }}
                    />
                    <motion.button 
                        whileTap={{ scale: 0.94 }}
                        onClick={handleIncrement} 
                        className="tasbeeh-counter w-38 h-38 rounded-full flex flex-col items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none relative z-10" 
                        style={{ 
                            backgroundColor: activeColor, 
                            boxShadow: isWhite 
                                ? '0 12px 30px -8px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,1)' 
                                : `0 16px 36px -8px ${activeColor}80, 0 6px 16px 0 ${activeColor}40, inset 0 2px 4px rgba(255,255,255,0.25)`,
                            color: isWhite ? '#000000' : '#FFFFFF'
                        }}
                    >
                        <span className="text-5xl font-sans font-black tracking-tight" style={{ color: 'inherit' }}>
                            {formatTasbeehNumber(count, language)}
                        </span>
                        <span className="text-xs font-bold mt-2" style={{ color: 'inherit', opacity: 0.9 }}>
                            {isCountingStopped ? tTasbeeh('resetPrompt', language) : tTasbeeh('tapToCount', language)}
                        </span>
                    </motion.button>
                </div>
            );
        }

        if (skin === 'beads') {
            return (
                <div className="relative flex flex-col items-center justify-center h-56 w-full my-4" onClick={handleIncrement}>
                    <div className="absolute top-0 bottom-0 w-1 bg-black/10 dark:bg-white/10 left-1/2 -translate-x-1/2 z-0"></div>
                    <motion.div 
                        key={count}
                        initial={{ y: -60, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg relative z-10 cursor-pointer"
                        style={{ 
                            background: isWhite 
                                ? 'radial-gradient(circle at 30% 30%, #ffffff, #e5e7eb)' 
                                : `radial-gradient(circle at 30% 30%, ${activeColor}, #000)`,
                            boxShadow: isWhite
                                ? `0 10px 20px -5px rgba(0,0,0,0.1), inset 0 -4px 6px rgba(0,0,0,0.05), inset 0 4px 6px rgba(255,255,255,1)`
                                : `0 12px 28px -5px ${activeColor}80, inset 0 -4px 6px rgba(0,0,0,0.4), inset 0 4px 6px rgba(255,255,255,0.4)`
                        }}
                    >
                        <span className="text-2xl font-sans font-black" style={{ color: isWhite ? '#000000' : 'rgba(255,255,255,0.95)' }}>
                            {formatTasbeehNumber(count, language)}
                        </span>
                    </motion.div>
                    <div className="mt-6 text-xs font-bold" style={{ color: primaryColor }}>
                        {tTasbeeh('beadsTapOrSwipe', language)}
                    </div>
                </div>
            );
        }

        // Default 'modern' skin
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

                {/* Main Vibrant Counter Button */}
                <motion.button 
                    whileTap={{ scale: 0.93 }}
                    onClick={handleIncrement} 
                    className={`tasbeeh-counter w-42 h-42 rounded-full flex flex-col items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none relative z-10 active:scale-95 ${
                        isBlackAndWhite && isBlackTheme 
                            ? 'border-4 border-white shadow-[0_0_25px_rgba(255,255,255,0.4)]' 
                            : (isWhite ? 'border border-gray-100 shadow-md' : '')
                    }`} 
                    style={{ 
                        backgroundColor: activeColor,
                        boxShadow: isWhite 
                            ? '0 15px 35px -10px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)'
                            : `0 16px 40px -8px ${activeColor}80, 0 8px 18px 0 ${activeColor}40, inset 0 2px 4px rgba(255,255,255,0.3)`,
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
                    {!isWhite && <div className="absolute bottom-4 w-12 h-1 rounded-full bg-white opacity-25"></div>}
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
            {/* Target Card - Pure White with Soft Drop Shadow & Zero Hard Borders */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center px-6 py-3.5 rounded-2xl bg-white dark:bg-[#1E293B] w-full max-w-xs shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)] border border-slate-100/80 dark:border-white/5 transition-all"
            >
                <span className="block text-xs font-bold mb-1 text-slate-500 dark:text-zinc-400">
                    {isCountingStopped && target > 0 ? tTasbeeh('targetReachedBanner', language) : tTasbeeh('targetLabel', language)}
                </span>
                <span className="text-3xl font-black font-sans tracking-tight" style={{ color: primaryColor }}>
                    {target > 0 ? formatTasbeehNumber(target, language) : tTasbeeh('targetOpen', language)}
                </span>
            </motion.div>

            {renderCounter()}
        </motion.div>
    );
};

export default TasbeehCounter;
