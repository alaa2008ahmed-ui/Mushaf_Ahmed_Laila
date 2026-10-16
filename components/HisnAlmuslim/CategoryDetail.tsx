import React, { useState, useEffect } from 'react';
import { HISN_ALMUSLIM_DATA } from '../../data/hisnAlmuslimData';
import { useTheme } from '../../context/ThemeContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

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

const HisnItemCard: React.FC<HisnItemCardProps> = ({ 
    item, 
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
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
    const [isFav, setIsFav] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
        setIsFav(favs.includes(item.text));
    }, [item.text]);

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const isPlaying = playingText === item.text;

    const toggleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
        let newFavs;
        if (isFav) {
            newFavs = favs.filter((t: string) => t !== item.text);
        } else {
            newFavs = [...favs, item.text];
        }
        localStorage.setItem('favorite_dhikr', JSON.stringify(newFavs));
        setIsFav(!isFav);
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        playTTS(item.text, { onToast: setToastMessage, categoryId });
    };

    const repetitionText = initialCount > 1 
        ? (initialCount === 2 ? 'يُقرأ مرتين' : `يُقرأ ${toArabicNumerals(initialCount)} مرات`) 
        : 'يُقرأ مرة واحدة';

    const badgeStyle = isFinished 
        ? { backgroundColor: 'var(--badge-finished-bg)', color: 'var(--badge-finished-text)' } 
        : (themeKey === 'default' 
            ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' } 
            : { backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.name === 'اسود' ? '#000000' : '#ffffff' }
        );

    return (
        <div 
            className={`themed-card p-5 pb-2 rounded-2xl border relative overflow-hidden group mb-4 transition-all duration-300 ${isFinished ? 'opacity-60' : 'cursor-pointer hover:shadow-md'}`}
            onClick={!isFinished ? onDecrement : undefined}
            style={{ 
                borderColor: cardBorderColor, 
                borderWidth: '1.5px', 
                borderStyle: 'solid', 
                color: 'var(--text-color)' 
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
                    title={isFinished ? 'اضغط لإعادة التكرار' : 'العدد المتبقي'}
                >
                    {isFinished ? <i className="fa-solid fa-check"></i> : toArabicNumerals(currentCount)}
                </div>
            </div>

            {item.title && <h3 className="text-center font-bold mb-2 text-sm" style={{ color: theme.palette[1] }}>{item.title}</h3>}

            <p className="text-xl leading-relaxed text-center font-amiri select-none mb-3">{item.text}</p>
            {item.source && <p className="text-xs mt-2 text-center themed-text-muted opacity-80 font-cairo">المصدر: {item.source}</p>}
            
            {/* Actions Bar */}
            <div className="flex justify-between items-center mt-4 mb-2 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <button onClick={toggleFav} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors">
                    <i className={`fa-heart ${isFav ? 'fa-solid text-red-500' : 'fa-regular opacity-70'}`} style={isFav ? {} : { color: 'var(--text-color)' }}></i>
                </button>
                <div className="flex gap-2">
                   <button onClick={(e) => { e.stopPropagation(); onZoom(item); }} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" style={{ color: 'var(--text-color)' }} title="تكبير">
                       <i className="fa-solid fa-magnifying-glass-plus"></i>
                   </button>
                   <button onClick={(e) => {
                       e.stopPropagation();
                       navigator.clipboard.writeText(item.text);
                   }} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" style={{ color: 'var(--text-color)' }} title="نسخ">
                       <i className="fa-regular fa-copy"></i>
                   </button>
                   <button onClick={async (e) => {
                       e.stopPropagation();
                       await shareAsImage({
                           text: item.text,
                           source: item.source,
                           category: item.type === 'ayah' ? 'آية كريمة' : item.type === 'hadith' ? 'حديث نبوي' : 'دعاء / ذكر',
                           theme,
                           setToastMessage
                       });
                   }} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" style={{ color: 'var(--text-color)' }} title="مشاركة">
                       <i className="fa-solid fa-share-nodes"></i>
                   </button>
                   <button 
                       onClick={handlePlayAudio} 
                       className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                       style={{ color: isPlaying ? '#ef4444' : 'var(--text-color)' }}
                       title={isPlaying ? "إيقاف الاستماع" : "استماع صوتي"}
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
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 font-bold">
                <i className="fa-solid fa-star text-4xl mb-4 opacity-50"></i>
                <p>لا توجد أذكار في المفضلة بعد.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item: any, index: number) => {
                const initialCount = item.count || 1;
                const itemKey = item.text;
                const currentCount = counts[itemKey] !== undefined ? counts[itemKey] : initialCount;
                const isFinished = currentCount === 0;

                return (
                    <HisnItemCard 
                        key={index} 
                        item={item} 
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
