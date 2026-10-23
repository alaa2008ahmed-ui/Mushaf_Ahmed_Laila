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
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name === 'الافتراضي' || !!theme.isOriginal || !themeKey;
    const cardBorderColor = isBlackTheme ? '#222222' : (theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)');

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
            className={`themed-card p-5 pb-3 rounded-3xl border relative overflow-hidden group transition-all duration-300 flex flex-col justify-between ${isFinished ? 'opacity-60 cursor-pointer' : 'cursor-pointer hover:shadow-md'}`} 
            onClick={onDecrement}
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ 
                borderColor: cardBorderColor, 
                borderWidth: '1.5px', 
                borderStyle: 'solid',
                color: 'var(--text-color)',
                fontFamily: isEn ? 'sans-serif' : theme.font
            }}
        >
            {/* Top row: Repetition badge and count badge */}
            <div className="flex justify-between items-start mb-3">
                <span 
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold shadow-sm select-none" 
                    style={{ backgroundColor: theme.palette[1] + '30', color: theme.palette[1] }}
                >
                    {repetitionText}
                </span>
                <div 
                    className="count-badge w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md transform transition-transform shrink-0 select-none cursor-pointer" 
                    style={
                        isFinished 
                        ? { backgroundColor: 'var(--badge-finished-bg)', color: 'var(--badge-finished-text)' } 
                        : (themeKey === 'default' 
                            ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' } 
                            : { backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.name === 'اسود' ? '#000000' : '#ffffff' }
                        )
                    }
                    onClick={(e) => {
                        if (isFinished && onReset) {
                            e.stopPropagation();
                            onReset();
                        }
                    }}
                    title={isFinished ? (isEn ? "Click to reset" : "اضغط لإعادة التكرار") : (isEn ? "Remaining count" : "العدد المتبقي")}
                >
                    {isFinished ? <i className="fa-solid fa-check"></i> : (isEn ? currentCount : toArabicNumerals(currentCount))}
                </div>
            </div>

            {/* Dhikr text: pure English when isEn, pure Arabic when Arabic */}
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
                    className="text-xl md:text-2xl leading-relaxed text-center font-amiri mb-4 select-none"
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
                        className="text-xs sm:text-sm text-center opacity-70 font-bold bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full" 
                        dir={isEn ? 'ltr' : 'rtl'}
                        style={{ color: 'var(--text-color)' }}
                    >
                        {displaySource}
                    </span>
                </div>
            )}
            
            {/* Action buttons row */}
            <div className="flex justify-between items-center mt-auto pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <button 
                    onClick={toggleFav} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                    title={isEn ? (isFav ? 'Remove from favorites' : 'Add to favorites') : (isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة')}
                    aria-label={isEn ? 'Favorite' : 'المفضلة'}
                >
                    <i className={`fa-heart ${isFav ? 'fa-solid text-red-500' : 'fa-regular opacity-70'}`} style={isFav ? {} : { color: 'var(--text-color)' }}></i>
                </button>
                <div className="flex gap-2">
                   <button 
                       onClick={(e) => { e.stopPropagation(); onZoom(); }} 
                       className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                       style={{ color: 'var(--text-color)' }} 
                       title={isEn ? "Zoom" : "تكبير"}
                       aria-label={isEn ? "Zoom" : "تكبير"}
                   >
                       <i className="fa-solid fa-magnifying-glass-plus"></i>
                   </button>
                   <button 
                       onClick={handleCopy} 
                       className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                       style={{ color: 'var(--text-color)' }} 
                       title={isEn ? "Copy" : "نسخ"}
                       aria-label={isEn ? "Copy" : "نسخ"}
                   >
                       <i className="fa-regular fa-copy"></i>
                   </button>
                   <button 
                       onClick={handleShare} 
                       className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                       style={{ color: 'var(--text-color)' }} 
                       title={isEn ? "Share" : "مشاركة"}
                       aria-label={isEn ? "Share" : "مشاركة"}
                   >
                       <i className="fa-solid fa-share-nodes"></i>
                   </button>
                   <button 
                       onClick={handlePlayAudio} 
                       className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                       style={{ color: isPlaying ? '#ef4444' : 'var(--text-color)' }}
                       title={isEn ? (isPlaying ? "Stop listening" : "Listen audio") : (isPlaying ? "إيقاف الاستماع" : "استماع صوتي")}
                       aria-label={isEn ? "Listen audio" : "استماع صوتي"}
                   >
                       <i className={`fa-solid ${isPlaying ? 'fa-circle-pause text-red-500 animate-pulse' : 'fa-volume-high'}`}></i>
                   </button>
                </div>
            </div>
            
            {!isFinished && <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition pointer-events-none" style={{ backgroundColor: theme.palette[0] + '15' }}></div>}
        </div>
    );
};

export default DhikrCard;
