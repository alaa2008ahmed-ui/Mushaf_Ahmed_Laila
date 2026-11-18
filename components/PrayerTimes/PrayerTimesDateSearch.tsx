import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { tPrayer } from '../../utils/prayerTimesTranslations';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import {
    searchLocalLocations,
    searchOnlineLocations,
    mergeLocationResults,
    LocationSearchSuggestion
} from '../../utils/locationSearchService';
import { Search, MapPin, Globe2, Building2, X, Loader2 } from 'lucide-react';

interface PrayerTimesDateSearchProps {
    searchInput: string;
    setSearchInput: React.Dispatch<React.SetStateAction<string>>;
    handleManualSearch: () => void;
    onSelectLocation?: (suggestion: LocationSearchSuggestion) => void;
    searchIconRef: React.RefObject<HTMLElement | null>;
    primaryColor: string;
    secondaryColor: string;
    cardBorderColor?: string;
    isDefaultTheme?: boolean;
    isBlackTheme?: boolean;
    onOpenCalculationSettings?: () => void;
}

const PrayerTimesDateSearch: React.FC<PrayerTimesDateSearchProps> = ({
    searchInput,
    setSearchInput,
    handleManualSearch,
    onSelectLocation,
    primaryColor,
    isBlackTheme,
    onOpenCalculationSettings
}) => {
    const { language, isRTL, dir } = useLanguage();
    const { themeKey, homeThemeVariant, isNightMode } = useTheme();
    const isEn = language === 'en';

    const [suggestions, setSuggestions] = useState<LocationSearchSuggestion[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoadingOnline, setIsLoadingOnline] = useState(false);
    const [hasSearchedOnline, setHasSearchedOnline] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const skipNextEffectRef = useRef(false);

    const isDarkSurface = isBlackTheme || isNightMode;

    const isGoldenTheme = !isNightMode && (
        homeThemeVariant === 'gold' ||
        themeKey === 'shiny_gold' ||
        themeKey === 'gold'
    );

    const actionBtnBgImage = isBlackTheme
        ? 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(228,228,231,1) 100%)'
        : 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.08) 100%)';
    const actionBtnShadow = isBlackTheme
        ? '0 4.5px 0 #52525b, 0 8px 16px -2px rgba(0,0,0,0.55), inset 0 1.5px 1px rgba(255,255,255,0.9)'
        : `0 4.5px 0 rgba(0,0,0,0.26), 0 8px 16px -3px ${primaryColor}55, inset 0 1.5px 1px rgba(255,255,255,0.4)`;

    const runOnlineSearch = useCallback(async (query: string, localInitial: LocationSearchSuggestion[]) => {
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        setIsLoadingOnline(true);
        try {
            const online = await searchOnlineLocations(query, language, controller.signal);
            if (controller.signal.aborted) return;
            setSuggestions(mergeLocationResults(localInitial, online, 12));
            setHasSearchedOnline(true);
        } catch {
            // Silently keep local suggestions on network/abort errors
        } finally {
            if (!controller.signal.aborted) {
                setIsLoadingOnline(false);
            }
        }
    }, [language]);

    // Live instant local search + debounced online geocoding search
    useEffect(() => {
        if (skipNextEffectRef.current) {
            skipNextEffectRef.current = false;
            return;
        }

        const trimmed = searchInput.trim();
        if (!trimmed) {
            if (abortRef.current) abortRef.current.abort();
            setSuggestions([]);
            setIsLoadingOnline(false);
            setHasSearchedOnline(false);
            setIsDropdownOpen(false);
            return;
        }

        const localMatches = searchLocalLocations(trimmed, 10);
        setSuggestions(localMatches);
        setHasSearchedOnline(false);
        setIsDropdownOpen(true);

        if (trimmed.length < 2) {
            if (abortRef.current) abortRef.current.abort();
            setIsLoadingOnline(false);
            return;
        }

        const debounceTimer = setTimeout(() => {
            runOnlineSearch(trimmed, localMatches);
        }, 240);

        return () => {
            clearTimeout(debounceTimer);
        };
    }, [searchInput, runOnlineSearch]);

    // Cleanup ongoing fetch on unmount
    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    // Close dropdown on outside click/touch
    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleOutside = (e: MouseEvent | TouchEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside, { passive: true });
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
        };
    }, [isDropdownOpen]);

    // Close dropdown on Android hardware back button
    useEffect(() => {
        if (!isDropdownOpen) return;
        const unregister = registerBackInterceptor(() => {
            if (isDropdownOpen) {
                setIsDropdownOpen(false);
                return true;
            }
            return false;
        });
        return unregister;
    }, [isDropdownOpen]);

    const handleTriggerSearch = async () => {
        const trimmed = searchInput.trim();
        if (!trimmed) {
            inputRef.current?.focus();
            return;
        }

        if (!onSelectLocation) {
            handleManualSearch();
            return;
        }

        const localMatches = searchLocalLocations(trimmed, 10);
        setSuggestions(localMatches);
        setIsDropdownOpen(true);
        if (trimmed.length >= 2) {
            await runOnlineSearch(trimmed, localMatches);
        }
    };

    const handleSelectItem = (item: LocationSearchSuggestion) => {
        if (abortRef.current) abortRef.current.abort();
        skipNextEffectRef.current = true;
        setIsDropdownOpen(false);
        setIsLoadingOnline(false);
        setSearchInput(isEn ? item.titleEn : item.titleAr);
        if (onSelectLocation) {
            onSelectLocation(item);
        } else {
            handleManualSearch();
        }
    };

    const handleClear = () => {
        if (abortRef.current) abortRef.current.abort();
        setSearchInput('');
        setSuggestions([]);
        setIsLoadingOnline(false);
        setHasSearchedOnline(false);
        setIsDropdownOpen(false);
        inputRef.current?.focus();
    };

    const getTypeLabel = (type: LocationSearchSuggestion['type']) => {
        if (type === 'country') return isEn ? 'Country' : 'دولة';
        if (type === 'region') return isEn ? 'Region' : 'منطقة';
        return isEn ? 'City' : 'مدينة';
    };

    const renderTypeIcon = (type: LocationSearchSuggestion['type']) => {
        if (type === 'country') return <Globe2 className="w-4 h-4" />;
        if (type === 'region') return <Building2 className="w-4 h-4" />;
        return <MapPin className="w-4 h-4" />;
    };

    const trayStyle: React.CSSProperties = isBlackTheme
        ? {
            backgroundColor: '#111114',
            boxShadow: '0 18px 36px -6px rgba(0,0,0,0.85), 0 6px 0 #09090b, inset 0 1px 1px rgba(255,255,255,0.1)'
        }
        : isNightMode
        ? {
            backgroundColor: '#0f172a',
            boxShadow: '0 18px 36px -6px rgba(0,0,0,0.72), 0 6px 0 #020617, inset 0 1px 1px rgba(255,255,255,0.12)'
        }
        : {
            backgroundColor: '#f1f5f9',
            boxShadow: '0 18px 36px -6px rgba(15,23,42,0.22), 0 6px 0 rgba(148,163,184,0.38), inset 0 1.5px 1px rgba(255,255,255,0.9)'
        };

    return (
        <div ref={wrapperRef} id="prayer-date-search-wrapper" className="relative z-[60] overflow-visible">
            <div id="prayer-date-search-container" dir={dir} className="flex items-center justify-center gap-2 overflow-visible pb-0.5">
                {/* Input Container */}
                <div
                    id="search-input-container"
                    className={`app-page-card border-0 flex-1 relative rounded-2xl overflow-hidden transition-all duration-300 ${
                        isBlackTheme
                            ? 'bg-[#18181b] text-white'
                            : isNightMode
                            ? 'bg-slate-800 text-white'
                            : 'bg-white text-slate-800'
                    }`}
                    style={{ borderRadius: '16px', border: 'none' }}
                >
                    <div
                        className={`app-3d-badge w-6 h-6 rounded-lg flex items-center justify-center absolute top-1/2 -translate-y-1/2 ${
                            isRTL ? 'right-2.5' : 'left-2.5'
                        } pointer-events-none ${
                            isDarkSurface ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-50 text-slate-500'
                        }`}
                    >
                        {isLoadingOnline ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: primaryColor }} />
                        ) : (
                            <Search className="w-3.5 h-3.5" />
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onFocus={() => {
                            if (searchInput.trim().length >= 1) {
                                if (suggestions.length === 0) {
                                    const localMatches = searchLocalLocations(searchInput.trim(), 10);
                                    setSuggestions(localMatches);
                                }
                                setIsDropdownOpen(true);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleTriggerSearch();
                            } else if (e.key === 'Escape') {
                                setIsDropdownOpen(false);
                                inputRef.current?.blur();
                            }
                        }}
                        placeholder={tPrayer('searchPlaceholder', language)}
                        dir={dir}
                        autoComplete="off"
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="listbox"
                        className={`w-full bg-transparent py-3 text-xs sm:text-sm font-medium outline-none transition-all ${
                            isRTL ? 'pr-10 pl-8 text-right' : 'pl-10 pr-8 text-left'
                        } ${isDarkSurface ? 'placeholder:text-zinc-500 text-white' : 'placeholder:text-slate-400'}`}
                        style={{ color: isDarkSurface ? '#FFFFFF' : primaryColor }}
                    />

                    {searchInput.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label={isEn ? 'Clear search' : 'مسح البحث'}
                            className={`app-inner-3d-box unified-3d-btn border-0 w-6 h-6 rounded-lg flex items-center justify-center absolute top-1/2 -translate-y-1/2 cursor-pointer ${
                                isRTL ? 'left-2' : 'right-2'
                            } ${isDarkSurface ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-700'}`}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Search Button */}
                <button
                    type="button"
                    onClick={handleTriggerSearch}
                    className="unified-3d-btn text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-3 rounded-2xl cursor-pointer shrink-0 border-0"
                    style={{
                        backgroundColor: primaryColor,
                        backgroundImage: actionBtnBgImage,
                        color: isBlackTheme ? '#000000' : (isGoldenTheme ? '#000000' : '#FFFFFF'),
                        borderRadius: '16px',
                        boxShadow: actionBtnShadow
                    }}
                >
                    {tPrayer('searchBtn', language)}
                </button>

                {/* Calculation Settings Button */}
                {onOpenCalculationSettings && (
                    <button
                        type="button"
                        onClick={onOpenCalculationSettings}
                        className="unified-3d-btn text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-3 rounded-2xl cursor-pointer shrink-0 border-0"
                        style={{
                            backgroundColor: primaryColor,
                            backgroundImage: actionBtnBgImage,
                            color: isBlackTheme ? '#000000' : (isGoldenTheme ? '#000000' : '#FFFFFF'),
                            borderRadius: '16px',
                            boxShadow: actionBtnShadow
                        }}
                        title={isEn ? 'Calculation & Fiqh Settings' : 'إعدادات طريقة الحساب والمذاهب الفقهية'}
                        aria-label={isEn ? 'Calculation & Fiqh Settings' : 'إعدادات طريقة الحساب والمذاهب الفقهية'}
                    >
                        <span className="whitespace-nowrap">
                            {isEn ? 'Method' : 'الحساب'}
                        </span>
                    </button>
                )}
            </div>

            {/* 3D Embossed Location Suggestions Dropdown */}
            {isDropdownOpen && searchInput.trim().length > 0 && (suggestions.length > 0 || isLoadingOnline || (searchInput.trim().length >= 2 && hasSearchedOnline)) && (
                <div
                    role="listbox"
                    dir={dir}
                    className="absolute top-full left-0 right-0 mt-2.5 z-[70] rounded-2xl p-2.5 max-h-[52vh] overflow-y-auto hide-scrollbar space-y-2.5"
                    style={trayStyle}
                >
                    {suggestions.map((item) => {
                        const title = isEn ? item.titleEn : item.titleAr;
                        const subtitle = isEn ? item.subtitleEn : item.subtitleAr;
                        const typeLabel = getTypeLabel(item.type);

                        return (
                            <button
                                key={item.id}
                                type="button"
                                role="option"
                                onClick={() => handleSelectItem(item)}
                                className={`app-page-card border-0 w-full rounded-2xl px-3 py-2.5 flex items-center gap-2.5 cursor-pointer active:translate-y-[2px] ${
                                    isRTL ? 'text-right' : 'text-left'
                                } ${
                                    isBlackTheme
                                        ? 'bg-[#1c1c21] text-white'
                                        : isNightMode
                                        ? 'bg-slate-800 text-slate-100'
                                        : 'bg-white text-slate-800'
                                }`}
                            >
                                {/* 3D Type Icon Badge */}
                                <div
                                    className={`app-3d-badge w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        isDarkSurface ? 'bg-zinc-800/90' : 'bg-slate-50'
                                    }`}
                                    style={{ color: isDarkSurface ? '#FFFFFF' : primaryColor }}
                                >
                                    {renderTypeIcon(item.type)}
                                </div>

                                {/* City / Town / Country Details */}
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="text-xs sm:text-sm font-bold truncate leading-snug"
                                        style={{ color: isDarkSurface ? '#FFFFFF' : primaryColor }}
                                    >
                                        {title}
                                    </div>
                                    {subtitle && (
                                        <div
                                            className={`text-[11px] font-medium truncate mt-0.5 ${
                                                isDarkSurface ? 'text-zinc-400' : 'text-slate-500'
                                            }`}
                                        >
                                            {subtitle}
                                        </div>
                                    )}
                                </div>

                                {/* 3D Category Tag Badge */}
                                <span
                                    className={`app-3d-badge px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 ${
                                        isDarkSurface
                                            ? 'bg-zinc-800 text-zinc-200'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {typeLabel}
                                </span>
                            </button>
                        );
                    })}

                    {/* Loading More Card */}
                    {isLoadingOnline && (
                        <div
                            className={`app-page-card border-0 rounded-2xl px-3 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold ${
                                isBlackTheme
                                    ? 'bg-[#1c1c21] text-zinc-300'
                                    : isNightMode
                                    ? 'bg-slate-800 text-slate-300'
                                    : 'bg-white text-slate-500'
                            }`}
                        >
                            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: primaryColor }} />
                            <span>
                                {isEn ? 'Searching worldwide locations...' : 'جارٍ البحث عن المدن والدول...'}
                            </span>
                        </div>
                    )}

                    {/* Empty State 3D Card */}
                    {!isLoadingOnline && suggestions.length === 0 && (searchInput.trim().length >= 2 ? hasSearchedOnline : false) && (
                        <div
                            className={`app-page-card border-0 rounded-2xl px-3.5 py-3 text-center text-xs font-semibold ${
                                isBlackTheme
                                    ? 'bg-[#1c1c21] text-zinc-400'
                                    : isNightMode
                                    ? 'bg-slate-800 text-slate-400'
                                    : 'bg-white text-slate-500'
                            }`}
                        >
                            {isEn
                                ? 'No matching cities, towns, or countries found'
                                : 'لم يتم العثور على مدن أو بلاد أو دول مطابقة'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PrayerTimesDateSearch;

