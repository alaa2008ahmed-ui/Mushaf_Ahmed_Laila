import React from 'react';

interface PrayerTimesHeaderProps {
    handleRefreshLocation: () => void;
    cityGov: string;
    fullCountry: string;
    combinedCode?: string;
    topBarTextColor: string;
}

const PrayerTimesHeader: React.FC<PrayerTimesHeaderProps> = ({
    handleRefreshLocation,
    cityGov,
    fullCountry,
    combinedCode,
    topBarTextColor
}) => {
    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <div className="flex items-center justify-center gap-2">
                    <i id="location-refresh-btn" onClick={handleRefreshLocation} className="text-xl cursor-pointer active:rotate-180 duration-700 fa-solid fa-location-crosshairs" style={{ color: topBarTextColor }}></i>
                    <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi truncate" style={{ color: topBarTextColor }}>{cityGov}</h1>
                </div>
                 <div className="flex items-center justify-center gap-2" dir="rtl">
                    <p className="text-xs font-bold" style={{ color: topBarTextColor }}>{fullCountry}</p>
                    {combinedCode && (
                        <span className="text-xs font-black text-white bg-black/20 px-2 py-0.5 rounded-md border border-white/20" dir="ltr">{combinedCode}</span>
                    )}
                </div>
            </div>
        </header>
    );
};

export default PrayerTimesHeader;
