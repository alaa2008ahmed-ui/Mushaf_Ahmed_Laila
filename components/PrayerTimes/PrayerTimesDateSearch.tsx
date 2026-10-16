import React from 'react';

interface PrayerTimesDateSearchProps {
    searchInput: string;
    setSearchInput: React.Dispatch<React.SetStateAction<string>>;
    handleManualSearch: () => void;
    searchIconRef: React.RefObject<HTMLElement>;
    primaryColor: string;
    secondaryColor: string;
    cardBorderColor?: string;
    isDefaultTheme?: boolean;
    isBlackTheme?: boolean;
}

const PrayerTimesDateSearch: React.FC<PrayerTimesDateSearchProps> = ({
    searchInput,
    setSearchInput,
    handleManualSearch,
    searchIconRef,
    primaryColor,
    secondaryColor,
    cardBorderColor,
    isDefaultTheme,
    isBlackTheme
}) => {
    const borderColor = cardBorderColor || (isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : primaryColor));

    return (
        <>
             <div className="flex items-center justify-center gap-2 px-1">
                <button 
                    onClick={handleManualSearch} 
                    className="text-sm font-black px-4 py-3 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer" 
                    style={{ 
                        color: isBlackTheme ? '#FFFFFF' : primaryColor,
                        border: `1.5px solid ${borderColor}`,
                        backgroundColor: isDefaultTheme ? '#FFFFFF' : (isBlackTheme ? '#111111' : undefined)
                    }}
                >
                    بحث
                </button>
                <div 
                    id="search-input-container" 
                    className="flex-1 relative rounded-xl overflow-hidden shadow-xs"
                    style={{ 
                        border: `1.5px solid ${borderColor}`,
                        backgroundColor: isDefaultTheme ? '#FFFFFF' : (isBlackTheme ? '#111111' : undefined)
                    }}
                >
                    <input 
                        type="text" 
                        value={searchInput} 
                        onChange={(e) => setSearchInput(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()} 
                        placeholder="عن مدينة أو محافظة..." 
                        className={`w-full bg-transparent py-3 px-4 pr-10 text-xs outline-none transition-all ${isBlackTheme ? 'placeholder:text-gray-400 text-white' : ''}`} 
                        style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }}
                    />
                    <button onClick={handleManualSearch} className="absolute right-3 top-3 cursor-pointer" style={{color: isBlackTheme ? '#FFFFFF' : secondaryColor}}>
                        <i ref={searchIconRef} className="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
            </div>
        </>
    );
};

export default PrayerTimesDateSearch;
