import React, { useState, useEffect } from 'react';
import { HISN_ALMUSLIM_DATA } from '../../data/hisnAlmuslimData';
import { useTheme } from '../../context/ThemeContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

interface CategoryDetailProps {
    selectedCategory: any;
    onZoom: (item: any) => void;
    setToastMessage: (msg: string) => void;
}

const HisnItemCard = ({ item, onZoom, setToastMessage }: { item: any; onZoom: (item: any) => void; setToastMessage: (msg: string) => void }) => {
    const { theme } = useTheme();
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
        playTTS(item.text, setToastMessage);
    };

    return (
        <div 
            className="themed-card p-5 pb-2 rounded-2xl border relative overflow-hidden group mb-4 transition-shadow hover:shadow-md duration-300"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
        >
            <p className="text-xl leading-relaxed text-center font-amiri select-none">{item.text}</p>
            {item.source && <p className="text-xs mt-3 text-center themed-text-muted opacity-80">المصدر: {item.source}</p>}
            
            <div className="flex justify-between items-center mt-4 mb-3 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
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
        </div>
    );
};

const CategoryDetail: React.FC<CategoryDetailProps> = ({ selectedCategory, onZoom, setToastMessage }) => {
    if (!selectedCategory) return null;
    const items = React.useMemo(() => {
        let result = [];
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
            {items.map((item: any, index: number) => (
                <HisnItemCard key={index} item={item} onZoom={onZoom} setToastMessage={setToastMessage} />
            ))}
        </div>
    );
};

export default CategoryDetail;
