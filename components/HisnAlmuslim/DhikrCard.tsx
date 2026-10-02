import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

interface DhikrCardProps {
    dhikr: {
        text: string;
        count: number;
        source?: string;
        category?: string;
    };
    currentCount: number;
    isFinished: boolean;
    onDecrement: () => void;
    onZoom: () => void;
    setToastMessage?: (msg: string) => void;
}

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const DhikrCard: React.FC<DhikrCardProps> = ({ dhikr, currentCount, isFinished, onDecrement, onZoom, setToastMessage }) => {
    const { theme, themeKey } = useTheme();
    const [isFav, setIsFav] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
        setIsFav(favs.includes(dhikr.text));
    }, [dhikr.text]);

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const isPlaying = playingText === dhikr.text;

    const toggleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
        let newFavs;
        if (isFav) {
            newFavs = favs.filter((t: string) => t !== dhikr.text);
        } else {
            newFavs = [...favs, dhikr.text];
        }
        localStorage.setItem('favorite_dhikr', JSON.stringify(newFavs));
        setIsFav(!isFav);
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        playTTS(dhikr.text, setToastMessage);
    };

    return (
        <div 
            className={`themed-card p-5 pb-0 rounded-2xl border relative overflow-hidden group transition-all duration-300 ${isFinished ? 'opacity-60' : 'cursor-pointer'}`} 
            onClick={onDecrement}
            style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold shadow-sm" style={{backgroundColor: theme.palette[1]+'30', color: theme.palette[1]}}>
                    {dhikr.count > 1 ? `يُقرأ ${toArabicNumerals(dhikr.count)} مرات` : 'يُقرأ مرة واحدة'}
                </span>
                <div 
                    className={`count-badge w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md transform transition-transform`} 
                    style={
                        isFinished 
                        ? { backgroundColor: 'var(--badge-finished-bg)', color: 'var(--badge-finished-text)' } 
                        : (themeKey === 'default' 
                            ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' } 
                            : { backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.name === 'اسود' ? '#000000' : '#ffffff' }
                        )
                    }
                >
                    {isFinished ? <i className="fa-solid fa-check"></i> : toArabicNumerals(currentCount)}
                </div>
            </div>

            <p className="text-lg leading-relaxed text-center font-amiri select-none">
                {dhikr.text}
            </p>
            
            {dhikr.source && <p className="text-xs mt-2 text-center themed-text-muted opacity-80 font-cairo">{dhikr.source}</p>}
            
            <div className="flex justify-between items-center mt-3 mb-2 pt-2 border-t" style={{borderColor: 'var(--card-border)'}}>
                <button onClick={toggleFav} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors">
                    <i className={`fa-heart ${isFav ? 'fa-solid text-red-500' : 'fa-regular opacity-70'}`} style={isFav ? {} : { color: 'var(--text-color)' }}></i>
                </button>
                <div className="flex gap-2">
                   <button onClick={(e) => { e.stopPropagation(); onZoom(); }} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" style={{ color: 'var(--text-color)' }} title="تكبير">
                       <i className="fa-solid fa-magnifying-glass-plus"></i>
                   </button>
                   <button onClick={(e) => {
                       e.stopPropagation();
                       navigator.clipboard.writeText(dhikr.text);
                   }} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" style={{ color: 'var(--text-color)' }} title="نسخ">
                       <i className="fa-regular fa-copy"></i>
                   </button>
                   <button onClick={async (e) => {
                       e.stopPropagation();
                       await shareAsImage({
                           text: dhikr.text,
                           source: dhikr.source,
                           category: dhikr.category || 'أذكار',
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
            
            {!isFinished && <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition pointer-events-none" style={{backgroundColor: theme.palette[0]+'15'}}></div>}
        </div>
    );
};

export default DhikrCard;
