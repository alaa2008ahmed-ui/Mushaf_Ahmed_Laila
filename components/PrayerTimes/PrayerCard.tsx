import React from 'react';

interface PrayerCardProps {
    prayerKey: string;
    idx: number;
    displayTimeStr: string;
    iqamaTime: string;
    isMuted: boolean;
    isNextPrayer: boolean;
    prayerNameAr: string;
    primaryColor: string;
    secondaryColor: string;
    isBlackAndWhite: boolean;
    themePalette1: string;
    togglePrayerSound: (key: string) => void;
    openSettings: (key: string) => void;
    formatTime12: (time: string) => string;
    formatTime12_clean: (time: string) => string;
    isSummerTime?: boolean;
    toggleSummerTime?: () => void;
    supportsDST?: boolean;
}

const PrayerCard: React.FC<PrayerCardProps> = ({
    prayerKey,
    idx,
    displayTimeStr,
    iqamaTime,
    isMuted,
    isNextPrayer,
    prayerNameAr,
    primaryColor,
    secondaryColor,
    isBlackAndWhite,
    themePalette1,
    togglePrayerSound,
    openSettings,
    formatTime12,
    formatTime12_clean,
    isSummerTime,
    toggleSummerTime,
    supportsDST
}) => {
    return (
        <div className="prayer-card rounded-2xl px-4 flex items-center justify-between mb-3 themed-card" style={{borderColor: isNextPrayer ? primaryColor : 'var(--card-border)', borderWidth: isNextPrayer ? '2px' : '1px'}}>
            <div className="flex items-center gap-3">
                {prayerKey !== 'Sunrise' ? (
                    <div id={idx === 0 ? "prayer-actions-container" : undefined} className="flex flex-col items-center gap-2">
                        <div onClick={() => togglePrayerSound(prayerKey)} className={`toggle-dot ${isMuted ? 'bg-red-500' : 'bg-green-500'}`} style={{borderColor: primaryColor}}></div>
                        <button onClick={() => openSettings(prayerKey)} className="settings-btn shadow-sm hover:opacity-80" style={{ color: primaryColor }}><i className="fa-solid fa-sliders"></i></button>
                    </div>
                ) : (
                    supportsDST ? (
                        <div className="flex flex-col items-center gap-1 w-12">
                            <button 
                                onClick={toggleSummerTime}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${isSummerTime ? 'bg-green-500 text-white border-green-600' : 'bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'}`}
                                title="التقويم الصيفي"
                            >
                                <i className="fa-solid fa-clock"></i>
                            </button>
                            <span className="text-[8px] font-bold text-center leading-tight" style={{ color: primaryColor }}>صيفي</span>
                        </div>
                    ) : (
                        <div className="w-12"></div>
                    )
                )}
                <div className="w-10 h-10 rounded-2xl themed-bg-alt flex items-center justify-center border" style={{color: idx % 2 === 0 ? primaryColor : secondaryColor, borderColor: 'var(--card-border)'}}>
                     <i className={`fa-regular ${prayerKey === 'Sunrise' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
                </div>
                 <div className="flex flex-col">
                    <h3 className="font-bold text-sm leading-none mb-1.5" style={{ color: primaryColor }}>{prayerNameAr}</h3>
                    {prayerKey !== 'Sunrise' && iqamaTime && !iqamaTime.includes('--') && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full border" style={{color: secondaryColor, backgroundColor: isBlackAndWhite ? '#333' : themePalette1 + '1A', borderColor: isBlackAndWhite ? '#FFF' : themePalette1 + '33'}}>إقامة {formatTime12_clean(iqamaTime)}</span>
                    )}
                </div>
            </div>
            <div className="text-left flex flex-col items-end">
                <span style={{ color: primaryColor }} dangerouslySetInnerHTML={{ __html: formatTime12(displayTimeStr) }}></span>
            </div>
        </div>
    );
};

export default PrayerCard;
