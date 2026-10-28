import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { tPrayer } from '../../utils/prayerTimesTranslations';
import { Search } from 'lucide-react';

interface PrayerTimesDateSearchProps {
    searchInput: string;
    setSearchInput: React.Dispatch<React.SetStateAction<string>>;
    handleManualSearch: () => void;
    searchIconRef: React.RefObject<HTMLElement | null>;
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
    primaryColor,
    isBlackTheme
}) => {
    const { language, isRTL, dir } = useLanguage();

    return (
        <div id="prayer-date-search-container" dir={dir} className="flex items-center justify-center gap-2.5">
            {/* Input Container */}
            <div 
                id="search-input-container" 
                className={`flex-1 relative rounded-2xl overflow-hidden transition-all duration-300 ${
                    isBlackTheme 
                        ? 'bg-[#18181b] border border-white/10 text-white' 
                        : 'bg-white text-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)]'
                }`}
                style={{ borderRadius: '16px' }}
            >
                <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} pointer-events-none text-slate-400`}>
                    <Search className="w-4 h-4" />
                </div>
                <input 
                    type="text" 
                    value={searchInput} 
                    onChange={(e) => setSearchInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()} 
                    placeholder={tPrayer('searchPlaceholder', language)} 
                    dir={dir}
                    className={`w-full bg-transparent py-3 text-xs sm:text-sm font-medium outline-none transition-all ${
                        isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                    } ${isBlackTheme ? 'placeholder:text-zinc-500 text-white' : 'placeholder:text-slate-400 text-slate-800'}`} 
                />
            </div>

            {/* Search Button */}
            <button 
                type="button"
                onClick={handleManualSearch} 
                className="text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer shrink-0" 
                style={{ 
                    backgroundColor: primaryColor,
                    color: isBlackTheme ? '#000000' : '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: isBlackTheme 
                        ? '0 4px 14px -2px rgba(255,255,255,0.2)' 
                        : `0 4px 14px -2px ${primaryColor}40`
                }}
            >
                {tPrayer('searchBtn', language)}
            </button>
        </div>
    );
};

export default PrayerTimesDateSearch;
