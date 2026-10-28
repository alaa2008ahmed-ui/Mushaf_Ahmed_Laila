import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { getAdhkarTranslation } from '../../data/adkarTranslationsEn';

interface DhikrCardProps {
    dhikr: {
        text: string;
        textEn?: string;
        count: number;
        source?: string;
        sourceEn?: string;
        category?: string;
        categoryEn?: string;
    };
    currentCount: number;
    isFinished: boolean;
    onDecrement: () => void;
    onReset?: () => void;
    onZoom: () => void;
    setToastMessage?: (msg: string) => void;
}

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

function hexToRgba(hex?: string, alpha: number = 1): string {
    if (!hex) return `rgba(46, 125, 94, ${alpha})`;
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return `rgba(46, 125, 94, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DhikrCard: React.FC<DhikrCardProps> = ({ 
    dhikr, 
    currentCount, 
    isFinished, 
    onDecrement, 
    onReset,
    onZoom, 
    setToastMessage 
}) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [isFav, setIsFav] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);

    // Dynamic color resolution
    const isBlackTheme = theme.bgColor === '#000000' || themeKey === 'deep_black' || theme.name === 'اسود' || theme.name === 'أبيض وأسود';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');

    // Get authentic English translation if in English mode
    const translation = getAdhkarTranslation(dhikr.text);
    const displayText = isEn ? (translation?.text || dhikr.textEn || dhikr.text) : dhikr.text;
    const displaySource = isEn ? (translation?.source || dhikr.sourceEn || dhikr.source) : dhikr.source;

    let displayCategory = dhikr.category || 'أذكار';
    if (isEn) {
        if (dhikr.category === 'أذكار الصباح') displayCategory = 'Morning Remembrances';
        else if (dhikr.category === 'أذكار المساء') displayCategory = 'Evening Remembrances';
        else displayCategory = dhikr.categoryEn || 'Daily Remembrances';
    }

    useEffect(() => {
        try {
            const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
            setIsFav(favs.includes(dhikr.text));
        } catch (e) {}
    }, [dhikr.text]);

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const isPlaying = playingText === displayText || playingText === dhikr.text;

    const toggleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
            let newFavs;
            if (isFav) {
                newFavs = favs.filter((t: string) => t !== dhikr.text);
            } else {
                newFavs = [...favs, dhikr.text];
            }
            localStorage.setItem('favorite_dhikr', JSON.stringify(newFavs));
            setIsFav(!isFav);
        } catch (e) {}
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(displayText).then(() => {
            setToastMessage?.(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
        });
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await shareAsImage({
            text: displayText,
            source: displaySource,
            category: displayCategory,
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage
        });
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isMorning = dhikr.category === 'أذكار الصباح';
        const isEvening = dhikr.category === 'أذكار المساء';
        playTTS(displayText, {
            onToast: (msg) => {
                if (isEn) {
                    if (msg.includes('جاري تشغيل')) setToastMessage?.('Playing audio...');
                    else if (msg.includes('تم إيقاف')) setToastMessage?.('Audio stopped');
                    else setToastMessage?.(msg);
                } else {
                    setToastMessage?.(msg);
                }
            },
            categoryId: isMorning ? 'hisn_27' : isEvening ? 'hisn_28' : undefined
        });
    };

    const repetitionText = isEn 
        ? (dhikr.count > 1 ? `Read ${dhikr.count} times` : 'Read once')
        : (dhikr.count > 1 ? `يُقرأ ${toArabicNumerals(dhikr.count)} مرات` : 'يُقرأ مرة واحدة');

    return (
        <div 
            className={`p-5 pb-3.5 rounded-[18px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between border-0 ${
                isFinished ? 'opacity-65 cursor-pointer' : 'cursor-pointer'
            }`} 
            onClick={onDecrement}
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ 
                backgroundColor: isBlackTheme ? '#121212' : (theme.cardBg || (theme.isDark ? '#18181B' : '#FFFFFF')),
                boxShadow: theme.isDark ? '0 4px 20px -2px rgba(0, 0, 0, 0.35)' : '0 4px 14px rgba(0, 0, 0, 0.04)',
                color: 'var(--text-color)',
                fontFamily: isEn ? 'sans-serif' : theme.font
            }}
        >
            {/* Top row: Repetition badge and count badge */}
            <div className="flex justify-between items-center mb-3">
                <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold select-none transition-colors" 
                    style={{ 
                        backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.2 : 0.1), 
                        color: isBlackTheme ? '#FFFFFF' : primaryColor 
                    }}
                >
                    {repetitionText}
                </span>

                {/* Repetition Counter Badge */}
                <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg select-none cursor-pointer transition-all active:scale-90 hover:scale-105 shrink-0" 
                    style={
                        isFinished 
                        ? { backgroundColor: '#10B981', color: '#FFFFFF', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)' } 
                        : { 
                            backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.25 : 0.12), 
                            color: isBlackTheme ? '#FFFFFF' : primaryColor 
                        }
                    }
                    onClick={(e) => {
                        if (isFinished && onReset) {
                            e.stopPropagation();
                            onReset();
                        }
                    }}
                    title={isFinished ? (isEn ? "Click to reset" : "اضغط لإعادة التكرار") : (isEn ? "Remaining count" : "العدد المتبقي")}
                >
                    {isFinished ? <i className="fa-solid fa-check text-sm"></i> : (isEn ? currentCount : toArabicNumerals(currentCount))}
                </div>
            </div>

            {/* Dhikr text: generous line-height to prevent tashkeel collision */}
            {isEn ? (
                <p 
                    className="text-base sm:text-lg leading-relaxed text-center font-sans font-medium mb-4 select-none text-balance" 
                    dir="ltr"
                    style={{ color: 'var(--text-color)' }}
                >
                    {displayText}
                </p>
            ) : (
                <p 
                    className="text-xl md:text-2xl leading-[2.3] text-center font-amiri mb-4 select-none text-balance"
                    dir="rtl"
                    style={{ color: 'var(--text-color)' }}
                >
                    {displayText}
                </p>
            )}
            
            {/* Source */}
            {displaySource && (
                <div className="flex justify-center mb-3">
                    <span 
                        className="text-xs sm:text-sm text-center opacity-70 font-bold bg-slate-100 dark:bg-zinc-800/60 px-3.5 py-1 rounded-full" 
                        dir={isEn ? 'ltr' : 'rtl'}
                        style={{ color: 'var(--text-color)' }}
                    >
                        {displaySource}
                    </span>
                </div>
            )}
            
            {/* Bottom Action buttons row */}
            <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100/90 dark:border-white/5">
                <button 
                    onClick={toggleFav} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    title={isEn ? (isFav ? 'Remove from favorites' : 'Add to favorites') : (isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة')}
                    aria-label={isEn ? 'Favorite' : 'المفضلة'}
                >
                    <i className={`fa-heart ${isFav ? 'fa-solid text-red-500' : 'fa-regular opacity-70'}`} style={isFav ? {} : { color: 'var(--text-color)' }}></i>
                </button>
                <div className="flex gap-2">
                   <button 
                       onClick={(e) => { e.stopPropagation(); onZoom(); }} 
                       className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
                       style={{ color: 'var(--text-color)' }} 
                       title={isEn ? "Zoom" : "تكبير"}
                       aria-label={isEn ? "Zoom" : "تكبير"}
                   >
                       <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                   </button>
                   <button 
                       onClick={handleCopy} 
                       className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
                       style={{ color: 'var(--text-color)' }} 
                       title={isEn ? "Copy" : "نسخ"}
                       aria-label={isEn ? "Copy" : "نسخ"}
                   >
                       <i className="fa-regular fa-copy text-xs"></i>
                   </button>
                   <button 
                       onClick={handleShare} 
                       className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
                       style={{ color: 'var(--text-color)' }} 
                       title={isEn ? "Share" : "مشاركة"}
                       aria-label={isEn ? "Share" : "مشاركة"}
                   >
                       <i className="fa-solid fa-share-nodes text-xs"></i>
                   </button>
                   <button 
                       onClick={handlePlayAudio} 
                       className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
                       style={{ color: isPlaying ? '#ef4444' : 'var(--text-color)' }}
                       title={isEn ? (isPlaying ? "Stop listening" : "Listen audio") : (isPlaying ? "إيقاف الاستماع" : "استماع صوتي")}
                       aria-label={isEn ? "Listen audio" : "استماع صوتي"}
                   >
                       <i className={`fa-solid ${isPlaying ? 'fa-circle-pause text-red-500 animate-pulse text-sm' : 'fa-volume-high text-xs'}`}></i>
                   </button>
                </div>
            </div>
            
            {!isFinished && (
                <div 
                    className="absolute inset-0 opacity-0 group-active:opacity-100 transition pointer-events-none" 
                    style={{ backgroundColor: hexToRgba(primaryColor, 0.08) }}
                ></div>
            )}
        </div>
    );
};

export default DhikrCard;
