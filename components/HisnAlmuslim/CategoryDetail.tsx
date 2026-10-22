import React, { useState, useEffect } from 'react';
import { HISN_ALMUSLIM_DATA, HISN_ALMUSLIM_CATEGORIES } from '../../data/hisnAlmuslimData';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { HISN_ITEMS_EN, HISN_CATEGORIES_EN, HisnItemTranslation } from '../../data/hisnAlmuslimTranslationsEn';

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
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name === 'الافتراضي' || !!theme.isOriginal || !themeKey;
    const cardBorderColor = isBlackTheme ? '#222222' : (theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)');
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
        } catch (e) {}
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(displayText).then(() => {
            setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
        });
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            stopTTS();
        } else {
            playTTS(displayText, {
                onToast: (msg) => {
                    if (isEn) {
                        if (msg.includes('جاري تشغيل')) setToastMessage('Playing audio...');
                        else if (msg.includes('تم إيقاف')) setToastMessage('Audio stopped');
                        else if (msg.includes('غير مفعلة') || msg.includes('غير مدعومة')) setToastMessage('Speech service is not available on this device');
                        else setToastMessage(msg);
                    } else {
                        setToastMessage(msg);
                    }
                },
                categoryId: isEn ? undefined : categoryId,
                lang: isEn ? 'en' : 'ar',
                isEn
            });
        }
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

    const repetitionText = isEn 
        ? (initialCount > 1 ? `Repeat ${initialCount} times` : 'Read once')
        : (initialCount > 1 
            ? (initialCount === 2 ? 'يُقرأ مرتين' : `يُقرأ ${toArabicNumerals(initialCount)} مرات`) 
            : 'يُقرأ مرة واحدة');

    const badgeStyle = isFinished 
        ? { backgroundColor: 'var(--badge-finished-bg)', color: 'var(--badge-finished-text)' } 
        : (themeKey === 'default' 
            ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' } 
            : { backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.name === 'اسود' ? '#000000' : '#ffffff' }
        );

    return (
        <div 
            className={`themed-card p-5 pb-3 rounded-2xl border relative overflow-hidden group mb-4 transition-all duration-300 ${isFinished ? 'opacity-60' : 'cursor-pointer hover:shadow-md'}`}
            onClick={!isFinished ? onDecrement : undefined}
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ 
                borderColor: cardBorderColor, 
                borderWidth: '1.5px', 
                borderStyle: 'solid', 
                color: 'var(--text-color)',
                fontFamily: isEn ? 'sans-serif' : theme.font
            }}
        >
            {/* Top Bar with repetition and counter badge */}
            <div className="flex justify-between items-start mb-3">
                <span 
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold shadow-sm select-none" 
                    style={{ backgroundColor: theme.palette[1] + '30', color: theme.palette[1] }}
                >
                    {repetitionText}
                </span>
                <div 
                    className="count-badge w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md transform transition-transform shrink-0 select-none cursor-pointer" 
                    style={badgeStyle}
                    onClick={(e) => {
                        if (isFinished) {
                            e.stopPropagation();
                            onReset();
                        }
                    }}
                    title={isFinished ? (isEn ? 'Click to reset' : 'اضغط لإعادة التكرار') : (isEn ? 'Remaining count' : 'العدد المتبقي')}
                >
                    {isFinished ? <i className="fa-solid fa-check"></i> : (isEn ? currentCount : toArabicNumerals(currentCount))}
                </div>
            </div>

            {displayTitle && (
                <h3 className={`font-bold mb-2 text-sm ${isEn ? 'text-left font-sans' : 'text-center font-cairo'}`} style={{ color: theme.palette[1] }}>
                    {displayTitle}
                </h3>
            )}

            <p className={`leading-relaxed select-none mb-3 ${isEn ? 'text-base sm:text-lg text-left font-sans font-medium' : 'text-xl text-center font-amiri'}`}>
                {displayText}
            </p>

            {displaySource && (
                <p className={`text-xs mt-2 themed-text-muted opacity-80 ${isEn ? 'text-left font-sans' : 'text-center font-cairo'}`}>
                    {isEn ? `Source: ${displaySource}` : `المصدر: ${displaySource}`}
                </p>
            )}
            
            {/* Actions Bar */}
            <div className="flex justify-between items-center mt-4 mb-1 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
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
                       aria-label={isEn ? "Audio" : "صوت"}
                   >
                       <i className={`fa-solid ${isPlaying ? 'fa-circle-pause text-red-500 animate-pulse' : 'fa-volume-high'}`}></i>
                   </button>
                </div>
            </div>

            {!isFinished && <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition pointer-events-none" style={{ backgroundColor: theme.palette[0] + '15' }}></div>}
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
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 font-bold" dir={isEn ? 'ltr' : 'rtl'}>
                <i className="fa-solid fa-heart-crack text-4xl mb-4 opacity-50"></i>
                <p>{isEn ? 'No supplications in favorites yet.' : 'لا توجد أذكار في المفضلة بعد.'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4" dir={isEn ? 'ltr' : 'rtl'}>
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
