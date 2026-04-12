import React from 'react';
import { Moon, Star, Clock, Bell, BellOff } from 'lucide-react';

interface NextPrayerCardProps {
    nextPrayer: { key: string; name: string } | null;
    times: Record<string, string>;
    countdown: string;
    isBlackAndWhite: boolean;
    themePalette0: string;
    themePalette1: string;
    formatTime12: (time: string) => string;
    applyOffset: (timeStr: string, offsetMins: number) => string;
    prayerOffset: number;
    nightTimes: { firstThird: string; midnight: string; lastThird: string };
    nightNotifications?: { firstThird: boolean; midnight: boolean; lastThird: boolean };
    onToggleNightNotification?: (key: 'firstThird' | 'midnight' | 'lastThird') => void;
}

const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
    nextPrayer,
    times,
    countdown,
    isBlackAndWhite,
    themePalette0,
    themePalette1,
    formatTime12,
    applyOffset,
    prayerOffset,
    nightTimes,
    nightNotifications = { firstThird: true, midnight: true, lastThird: true },
    onToggleNightNotification
}) => {
    if (!nextPrayer || !times[nextPrayer.key]) return null;

    const formatNightTime = (timeStr: string) => {
        if (!timeStr || timeStr.includes('--')) return "--:-- --";
        let [h, m] = timeStr.split(':');
        let hInt = parseInt(h);
        const ap = hInt >= 12 ? 'pm' : 'am';
        hInt = hInt % 12 || 12;
        return `${hInt}:${m.toString().padStart(2, '0')} ${ap}`;
    };

    return (
        <div id="next-prayer-card" className="rounded-2xl text-white mb-3 relative overflow-hidden flex flex-col" style={{background: isBlackAndWhite ? `linear-gradient(135deg, #333, #000)` : `linear-gradient(135deg, ${themePalette1}, ${themePalette0})`}}>
            <div className="px-4 py-2 flex justify-between items-center relative z-10">
                <div className="text-center flex flex-col items-center">
                    <p className="text-[10px] font-bold opacity-90 mb-0.5">المتبقي على صلاة <span className="underline decoration-white/40">{nextPrayer.name}</span></p>
                    <p className="text-xl font-black font-mono tracking-tighter leading-none">{countdown}</p>
                </div>
                <div id="night-times-container" className="text-left flex gap-2 sm:gap-3 items-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 opacity-90 mb-0.5">
                            {onToggleNightNotification && (
                                <button 
                                    onClick={() => onToggleNightNotification('firstThird')}
                                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    {nightNotifications.firstThird ? <Bell className="w-3 h-3 text-green-300" /> : <BellOff className="w-3 h-3 text-red-300 opacity-70" />}
                                </button>
                            )}
                            <span className="text-[9px] font-bold">أول الليل</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono" dir="ltr">{formatNightTime(nightTimes.firstThird)}</span>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 opacity-90 mb-0.5">
                            {onToggleNightNotification && (
                                <button 
                                    onClick={() => onToggleNightNotification('midnight')}
                                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    {nightNotifications.midnight ? <Bell className="w-3 h-3 text-green-300" /> : <BellOff className="w-3 h-3 text-red-300 opacity-70" />}
                                </button>
                            )}
                            <span className="text-[9px] font-bold">منتصف الليل</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono" dir="ltr">{formatNightTime(nightTimes.midnight)}</span>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 opacity-90 mb-0.5">
                            {onToggleNightNotification && (
                                <button 
                                    onClick={() => onToggleNightNotification('lastThird')}
                                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    {nightNotifications.lastThird ? <Bell className="w-3 h-3 text-green-300" /> : <BellOff className="w-3 h-3 text-red-300 opacity-70" />}
                                </button>
                            )}
                            <span className="text-[9px] font-bold">الثلث الأخير</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono" dir="ltr">{formatNightTime(nightTimes.lastThird)}</span>
                    </div>
                </div>
            </div>

            <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>
    );
};

export default NextPrayerCard;
