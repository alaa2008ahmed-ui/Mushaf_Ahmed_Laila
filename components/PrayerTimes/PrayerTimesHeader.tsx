import React from 'react';
import ThemePageLock from '../ThemePageLock';

interface PrayerTimesHeaderProps {
    handleRefreshLocation: () => void;
    onOpenNotifications: () => void;
    cityGov: string;
    fullCountry: string;
    combinedCode?: string;
    topBarTextColor: string;
}

const PrayerTimesHeader: React.FC<PrayerTimesHeaderProps> = ({
    handleRefreshLocation,
    onOpenNotifications,
    cityGov,
    fullCountry,
    combinedCode,
    topBarTextColor
}) => {
    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <div className="absolute left-0">
                        <ThemePageLock />
                    </div>
                    <h1 className="app-top-bar__title text-base sm:text-lg md:text-xl font-kufi truncate px-14 sm:px-20">
                        {cityGov}
                    </h1>
                    <div className="absolute right-0 flex items-center gap-1">
                         <i onClick={onOpenNotifications} className="text-xl cursor-pointer fa-solid fa-bell p-2 opacity-80 hover:opacity-100"></i>
                         <i id="location-refresh-btn" onClick={handleRefreshLocation} className="text-xl cursor-pointer active:rotate-180 duration-700 fa-solid fa-location-crosshairs p-2 opacity-80 hover:opacity-100"></i>
                    </div>
                </div>
                 <div className="app-top-bar__subtitle flex items-center justify-center gap-1.5" dir="rtl">
                    <span className="font-bold">{fullCountry}</span>
                    {combinedCode && (
                        <span className="text-[10px] font-black text-white bg-black/20 px-1.5 py-0 rounded border border-white/20" dir="ltr">{combinedCode}</span>
                    )}
                </div>
            </div>
        </header>
    );
};

export default PrayerTimesHeader;
