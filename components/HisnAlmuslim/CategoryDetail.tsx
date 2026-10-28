import React, { useState, useEffect } from 'react';
import { HISN_ALMUSLIM_DATA, HISN_ALMUSLIM_CATEGORIES } from '../../data/hisnAlmuslimData';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { HISN_ITEMS_EN, HISN_CATEGORIES_EN, HisnItemTranslation } from '../../data/hisnAlmuslimTranslationsEn';
import { getModernFlatTokens, hexToRgba } from '../../utils/flatDesignTokens';

interface CategoryDetailProps {
    selectedCategory: any;
    onZoom: (item: any) => void;
    setToastMessage: (msg: string) => void;
    counts: { [key: string]: number };
    onDecrement: (itemKey: string, current: number) => void;
    onReset: (itemKey: string, initCount: number) => void;
}

interface HisnItemCardProps {
    item: any;
    itemIndex: number;
    categoryId: string;
    currentCount: number;
    initialCount: number;
    isFinished: boolean;
    onDecrement: () => void;
    onReset: () => void;
    onZoom: (item: any) => void;
    setToastMessage: (msg: string) => void;
}

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

// Prebuild reverse map from Arabic text to English translation for quick lookups (especially in Favorites)
const arabicToEnHisnMap = new Map<string, HisnItemTranslation>();
Object.entries(HISN_ALMUSLIM_DATA).forEach(([catId, items]: [string, any]) => {
    items.forEach((it: any, idx: number) => {
        const en = HISN_ITEMS_EN[`${catId}_${idx}`];
        if (en && it.text && !arabicToEnHisnMap.has(it.text)) {
            arabicToEnHisnMap.set(it.text, en);
        }
    });
});

const HisnItemCard: React.FC<HisnItemCardProps> = ({ 
    item, 
    itemIndex,
    categoryId, 
    currentCount, 
    initialCount, 
    isFinished, 
    onDecrement, 
    onReset, 
    onZoom, 
    setToastMessage 
}) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const tokens = getModernFlatTokens(theme, themeKey);
    const isEn = language === 'en';
    const [isFav, setIsFav] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);

    // Resolve English translation if in English mode
    const trans = HISN_ITEMS_EN[`${categoryId}_${itemIndex}`] || arabicToEnHisnMap.get(item.text);
    const displayText = isEn ? (trans?.text || item.text) : item.text;
    const displayTitle = isEn ? (trans?.title || (item.title ? item.title.replace('الذكر', 'Supplication') : '')) : (item.title || '');
    const displaySource = isEn ? (trans?.source || '') : (item.source || '');
    const catInfo = HISN_ALMUSLIM_CATEGORIES.find(c => c.id === categoryId);
    const categoryTitleAr = categoryId === 'favorites' ? 'المفضلة' : (catInfo?.title || 'حصن المسلم');
    const categoryTitleEn = categoryId === 'favorites' ? 'Favorites' : (HISN_CATEGORIES_EN[categoryId]?.title || 'Fortress of the Muslim');
    const categoryTitle = isEn ? categoryTitleEn : categoryTitleAr;

    useEffect(() => {
        try {
            const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
            setIsFav(favs.includes(item.text));
        } catch (e) {}
    }, [item.text]);

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const isPlaying = playingText === displayText || playingText === item.text;

    const toggleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
            let newFavs;
            if (isFav) {
                newFavs = favs.filter((t: string) => t !== item.text);
            } else {
                newFavs = [...favs, item.text];
            }
            localStorage.setItem('favorite_dhikr', JSON.stringify(newFavs));
            setIsFav(!isFav);
            setToastMessage(isFav ? (isEn ? 'Removed from favorites' : 'تمت الإزالة من المفضلة') : (isEn ? 'Added to favorites' : 'تمت الإضافة إلى المفضلة'));
        } catch (e) {}
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(displayText).then(() => {
            setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
        });
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await shareAsImage({
            text: displayText,
            title: displayTitle,
            source: displaySource,
            category: categoryTitle,
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage
        });
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        playTTS(displayText, {
            onToast: (msg) => {
                if (isEn) {
                    if (msg.includes('جاري تشغيل')) setToastMessage('Playing audio...');
                    else if (msg.includes('تم إيقاف')) setToastMessage('Audio stopped');
                    else setToastMessage(msg);
                } else {
                    setToastMessage(msg);
                }
            }
        });
    };

    const repetitionText = isEn 
        ? (initialCount > 1 ? `Repeat ${initialCount} times` : 'Read once')
        : (initialCount > 1 
            ? (initialCount === 2 ? 'يُقرأ مرتين' : `يُقرأ ${toArabicNumerals(initialCount)} مرات`) 
            : 'يُقرأ مرة واحدة');

    return (
        <div 
            className={`p-5 pb-3.5 rounded-[18px] relative overflow-hidden group mb-4 transition-all duration-300 border-0 ${isFinished ? 'opacity-65' : 'cursor-pointer active:scale-[0.99]'}`}
            onClick={!isFinished ? onDecrement : undefined}
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ 
                backgroundColor: tokens.cardBgColor,
                boxShadow: tokens.cardShadow,
                color: 'var(--text-color)',
                fontFamily: isEn ? 'sans-serif' : theme.font
            }}
        >
            {/* Top Bar with repetition and counter badge */}
            <div className="flex justify-between items-start mb-3">
                <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold select-none" 
                    style={{ 
                        backgroundColor: hexToRgba(tokens.primaryColor, 0.1), 
                        color: tokens.primaryColor 
                    }}
                >
                    {repetitionText}
                </span>
                <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shrink-0 select-none cursor-pointer transition-transform active:scale-90" 
                    style={
                        isFinished 
                            ? { backgroundColor: '#10B981', color: '#FFFFFF' }
                            : { backgroundColor: hexToRgba(tokens.primaryColor, 0.12), color: tokens.primaryColor }
                    }
                    onClick={(e) => {
                        if (isFinished) {
                            e.stopPropagation();
                            onReset();
                        }
                    }}
                    title={isFinished ? (isEn ? 'Click to reset' : 'اضغط لإعادة التكرار') : (isEn ? 'Remaining count' : 'العدد المتبقي')}
                >
                    {isFinished ? <i className="fa-solid fa-check text-sm"></i> : (isEn ? currentCount : toArabicNumerals(currentCount))}
                </div>
            </div>

            {displayTitle && (
                <h3 className={`font-bold mb-2 text-sm font-cairo ${isEn ? 'text-left font-sans' : 'text-center'}`} style={{ color: tokens.primaryColor }}>
                    {displayTitle}
                </h3>
            )}

            <p className={`leading-[2.2] select-none mb-3 ${isEn ? 'text-base sm:text-lg text-left font-sans font-medium' : 'text-xl md:text-2xl text-center font-amiri'}`}>
                {displayText}
            </p>

            {displaySource && (
                <div className="flex justify-center mb-3">
                    <span className={`text-xs opacity-70 font-bold bg-slate-100 dark:bg-zinc-800/60 px-3.5 py-1 rounded-full ${isEn ? 'text-left font-sans' : 'text-center font-cairo'}`}>
                        {isEn ? `Source: ${displaySource}` : `المصدر: ${displaySource}`}
                    </span>
                </div>
            )}
            
            {/* Actions Bar */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
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
                       onClick={(e) => { 
                           e.stopPropagation(); 
                           onZoom({
                               title: displayTitle,
                               text: displayText,
                               textEn: trans?.text,
                               source: displaySource,
                               sourceEn: trans?.source,
                               category: categoryTitle,
                               categoryAr: categoryTitleAr,
                               categoryEn: categoryTitleEn,
                               count: initialCount,
                               isEn
                           }); 
                       }} 
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
                    style={{ backgroundColor: hexToRgba(tokens.primaryColor, 0.08) }}
                ></div>
            )}
        </div>
    );
};

const CategoryDetail: React.FC<CategoryDetailProps> = ({ 
    selectedCategory, 
    onZoom, 
    setToastMessage,
    counts,
    onDecrement,
    onReset
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';

    if (!selectedCategory) return null;
    const items = React.useMemo(() => {
        let result: any[] = [];
        if (selectedCategory.id === 'favorites') {
            const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
            Object.values(HISN_ALMUSLIM_DATA).forEach((catItems: any) => {
                catItems.forEach((item: any) => {
                    if (favs.includes(item.text) && !result.find(i => i.text === item.text)) {
                        result.push(item);
                    }
                });
            });
        } else {
            result = HISN_ALMUSLIM_DATA[selectedCategory.id] || [];
        }
        return result;
    }, [selectedCategory.id]);

    if (items.length === 0 && selectedCategory.id === 'favorites') {
        return (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400 font-bold" dir={isEn ? 'ltr' : 'rtl'}>
                <i className="fa-solid fa-heart-crack text-4xl mb-4 opacity-40"></i>
                <p className="text-sm font-cairo">{isEn ? 'No supplications in favorites yet.' : 'لا توجد أذكار في المفضلة بعد.'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3.5" dir={isEn ? 'ltr' : 'rtl'}>
            {items.map((item: any, index: number) => {
                const initialCount = item.count || 1;
                const itemKey = item.text;
                const currentCount = counts[itemKey] !== undefined ? counts[itemKey] : initialCount;
                const isFinished = currentCount === 0;

                return (
                    <HisnItemCard 
                        key={index} 
                        item={item} 
                        itemIndex={index}
                        categoryId={selectedCategory.id}
                        initialCount={initialCount}
                        currentCount={currentCount}
                        isFinished={isFinished}
                        onDecrement={() => onDecrement(itemKey, currentCount)}
                        onReset={() => onReset(itemKey, initialCount)}
                        onZoom={onZoom} 
                        setToastMessage={setToastMessage} 
                    />
                );
            })}
        </div>
    );
};

export default CategoryDetail;
