import React from 'react';

interface PrayerTimesDateSearchProps {
    dates: { hijri: string; gregorian: string };
    searchInput: string;
    setSearchInput: React.Dispatch<React.SetStateAction<string>>;
    handleManualSearch: () => void;
    searchIconRef: React.RefObject<HTMLElement>;
    primaryColor: string;
    secondaryColor: string;
    onNavigateToMonthly: () => void;
}

const PrayerTimesDateSearch: React.FC<PrayerTimesDateSearchProps> = ({
    dates,
    searchInput,
    setSearchInput,
    handleManualSearch,
    searchIconRef,
    primaryColor,
    secondaryColor,
    onNavigateToMonthly
}) => {
    return (
        <>
            <div id="date-search-container" className="themed-card rounded-2xl p-2.5 flex items-center justify-between shadow-sm mb-5">
                <div className="flex-1 text-center border-l themed-text-muted/20">
                    <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: secondaryColor }}>التاريخ الهجري</p>
                    <p className="text-xs font-bold" style={{color: secondaryColor}}>{dates.hijri}</p>
                </div>
                <div className="flex-1 text-center">
                    <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: primaryColor }}>التاريخ الميلادي</p>
                    <p className="text-xs font-bold" style={{color: primaryColor}}>{dates.gregorian}</p>
                </div>
            </div>

             <div className="flex items-center justify-center gap-2 mb-5 px-1">
                <button onClick={handleManualSearch} className="themed-card text-sm font-black px-3 py-2 rounded-lg shadow-sm active:scale-95 hover:bg-card-bg-hover" style={{ color: primaryColor }}>بحث</button>
                <div id="search-input-container" className="flex-1 relative themed-card rounded-xl overflow-hidden shadow-sm">
                    <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()} placeholder="عن مدينة أو محافظة..." 
                        className="w-full bg-transparent py-2.5 px-4 pr-10 text-xs outline-none transition-all" style={{ color: primaryColor }}/>
                    <button onClick={handleManualSearch} className="absolute right-3 top-2.5" style={{color: secondaryColor}}>
                        <i ref={searchIconRef} className="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
                <button id="monthly-times-btn" onClick={onNavigateToMonthly} className="themed-card text-sm font-black px-3 py-2 rounded-lg shadow-sm active:scale-95 hover:bg-card-bg-hover" style={{ color: primaryColor }}>مواقيت</button>
            </div>
        </>
    );
};

export default PrayerTimesDateSearch;
