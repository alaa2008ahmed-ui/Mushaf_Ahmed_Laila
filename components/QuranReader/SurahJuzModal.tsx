import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { JUZ_MAP, toArabic, SURAH_INFO, HIZB_QUARTERS, SURAH_NAMES_EN, isDarkQuranTheme } from './constants';
import SurahInfoModal from './SurahInfoModal';
import { useLanguage } from '../../context/LanguageContext';
import { useShowPageGuides } from '../../utils/guideManager';
import { loadMadinahPageFont, preloadAdjacentMadinahFonts } from '../../utils/qpcMadinahData';
import { getMadinahThemePalette } from './MadinahFrameSVG';

interface SurahJuzModalProps {
    type: 'surah' | 'juz' | 'hizb';
    quranData: any;
    onSelect: (surah: number, ayah: number) => void;
    onClose: () => void;
    currentTheme: any;
    isLandscape?: boolean;
    currentSelection?: number;
    currentAyah?: { s: number, a: number };
    readingMode?: string;
    onOpenGuide?: () => void;
    isGuideOpen?: boolean;
}

const SurahJuzModal: React.FC<SurahJuzModalProps> = ({ 
    type, 
    quranData, 
    onSelect, 
    onClose, 
    currentTheme, 
    isLandscape, 
    currentSelection, 
    currentAyah, 
    readingMode,
    onOpenGuide,
    isGuideOpen
}) => {
    const showPageGuides = useShowPageGuides();
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const isEnglishMode = isEn || readingMode === 'bilingual' || readingMode === 'translation';
    const isMadinahOrMushaf = readingMode === 'madinah' || readingMode === 'mushaf';

    const ornamentPalette = getMadinahThemePalette(currentTheme);
    const isDarkTheme = isDarkQuranTheme(currentTheme);
    const isDeepBlack = currentTheme?.id === 'deep_black';

    const isHexDark = (color?: string): boolean => {
        if (!color || typeof color !== 'string') return false;
        const clean = color.trim().replace(/^#/, '');
        if (clean.length !== 3 && clean.length !== 6) return false;
        const full = clean.length === 3
            ? clean.split('').map(c => c + c).join('')
            : clean;
        const r = parseInt(full.slice(0, 2), 16);
        const g = parseInt(full.slice(2, 4), 16);
        const b = parseInt(full.slice(4, 6), 16);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
    };

    const modalBg = ornamentPalette.frameBg;
    const bodyTextColor = isDarkTheme ? '#f8fafc' : ornamentPalette.bannerText;
    const accentColor = isDeepBlack
        ? '#e4e4e7'
        : (ornamentPalette.primary || currentTheme?.accent || '#b45309');
    const selectedControlBg = isDeepBlack ? '#3f3f46' : accentColor;
    const selectedControlText = isHexDark(selectedControlBg) ? '#ffffff' : '#09090b';
    const cardSurfaceBg = isDarkTheme
        ? (currentTheme?.cardBg && !currentTheme.cardBg.startsWith('rgba') ? currentTheme.cardBg : '#18181b')
        : (ornamentPalette.cartoucheFill || '#ffffff');
    const borderSubtle = isDarkTheme
        ? 'rgba(255, 255, 255, 0.16)'
        : `${accentColor}44`;
    const borderStrong = isDarkTheme
        ? 'rgba(255, 255, 255, 0.28)'
        : `${accentColor}99`;
    // Helper to find Juz for a given (Surah, Ayah)
    const getJuzForAyah = useCallback((s: number, a: number) => {
        for (let i = JUZ_MAP.length - 1; i >= 0; i--) {
            const j = JUZ_MAP[i];
            if (s > j.s || (s === j.s && a >= j.a)) {
                return j.j;
            }
        }
        return 1;
    }, []);

    const getHizbQuarterForSurah = useCallback((s: number) => {
        return HIZB_QUARTERS[s - 1] || 1;
    }, []);

    // Initialize state
    const [selectedSurah, setSelectedSurah] = useState(() => {
        if (currentAyah) return currentAyah.s;
        if (type === 'surah') return currentSelection || 1;
        if (type === 'juz') return JUZ_MAP[(currentSelection || 1) - 1].s;
        return 1;
    });

    const [selectedAyah, setSelectedAyah] = useState(() => {
        if (currentAyah) return currentAyah.a;
        if (type === 'surah') return 1;
        if (type === 'juz') return JUZ_MAP[(currentSelection || 1) - 1].a;
        return 1;
    });

    const [selectedJuz, setSelectedJuz] = useState(() => getJuzForAyah(selectedSurah, selectedAyah));
    const [selectedHizbQuarter, setSelectedHizbQuarter] = useState(() => getHizbQuarterForSurah(selectedSurah));
    const [searchTerm, setSearchTerm] = useState('');
    const [infoSurah, setInfoSurah] = useState<{ name: string, number: number } | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    // Reset selection to first row when guide is open so green highlight is visible across all columns
    useEffect(() => {
        if (isGuideOpen) {
            setSelectedJuz(1);
            setSelectedSurah(1);
            setSelectedAyah(1);
            setSelectedHizbQuarter(1);
            setSearchTerm('');
        }
    }, [isGuideOpen]);

    const juzRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const surahRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const ayahRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const hizbRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const removeDiacritics = (text: string) => {
        if (!text) return "";
        return text
            .replace(/[\u064B-\u0652\u0670\u0653-\u065F\u0640]/g, "")
            .replace(/[أإآٱ]/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/\s+/g, " ")
            .trim();
    };

    const prewarmSelectionFont = useCallback((surahNum: number, ayahNum: number) => {
        if (readingMode !== 'madinah' || !quranData?.surahs) return;
        const surahObj = quranData.surahs[surahNum - 1];
        const ayahObj =
            (surahObj?.ayahs?.[ayahNum - 1]?.numberInSurah === ayahNum
                ? surahObj.ayahs[ayahNum - 1]
                : surahObj?.ayahs?.find((ay: any) => ay.numberInSurah === ayahNum));
        const targetPage = Number(ayahObj?.page);
        if (targetPage >= 1 && targetPage <= 604) {
            void loadMadinahPageFont(targetPage);
            void loadMadinahPageFont(1);
            preloadAdjacentMadinahFonts(targetPage);
        }
    }, [readingMode, quranData]);

    const normalizedSearch = removeDiacritics(searchTerm);

    useEffect(() => {
        prewarmSelectionFont(selectedSurah, selectedAyah);
    }, [prewarmSelectionFont, selectedSurah, selectedAyah]);

    // Scroll to selected items on mount and when they change
    useEffect(() => {
        const scrollOptions: ScrollIntoViewOptions = { block: 'center', behavior: 'auto' };
        juzRefs.current[selectedJuz]?.scrollIntoView(scrollOptions);
        surahRefs.current[selectedSurah]?.scrollIntoView(scrollOptions);
        ayahRefs.current[selectedAyah]?.scrollIntoView(scrollOptions);
        hizbRefs.current[selectedHizbQuarter]?.scrollIntoView(scrollOptions);
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setTimeout(() => {
                juzRefs.current[selectedJuz]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 50);
        }
    }, [selectedJuz, searchTerm]);

    useEffect(() => {
        if (!searchTerm) {
            setTimeout(() => {
                surahRefs.current[selectedSurah]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 50);
        }
    }, [selectedSurah, searchTerm]);

    useEffect(() => {
        if (!searchTerm) {
            setTimeout(() => {
                ayahRefs.current[selectedAyah]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 50);
        }
    }, [selectedAyah, searchTerm]);

    useEffect(() => {
        if (!searchTerm) {
            setTimeout(() => {
                hizbRefs.current[selectedHizbQuarter]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 50);
        }
    }, [selectedHizbQuarter, searchTerm]);

    const handleJuzClick = (j: number) => {
        const juzData = JUZ_MAP[j - 1];
        setSelectedJuz(j);
        setSelectedSurah(juzData.s);
        setSelectedAyah(juzData.a);
        
        let targetHq = getHizbQuarterForSurah(juzData.s);
        if (quranData && quranData.surahs) {
            const surah = quranData.surahs[juzData.s - 1];
            if (surah && surah.ayahs) {
                const ayah = surah.ayahs.find((a: any) => a.numberInSurah === juzData.a);
                if (ayah && ayah.hizbQuarter) {
                    targetHq = ayah.hizbQuarter;
                }
            }
        }
        setSelectedHizbQuarter(targetHq);
        setSearchTerm('');
        prewarmSelectionFont(juzData.s, juzData.a);
    };

    const handleSurahClick = (s: number) => {
        setSelectedSurah(s);
        setSelectedAyah(1);
        setSelectedJuz(getJuzForAyah(s, 1));
        setSelectedHizbQuarter(getHizbQuarterForSurah(s));
        setSearchTerm('');
        prewarmSelectionFont(s, 1);
    };

    const handleSurahPointerDown = (s: number, name: string) => {
        longPressTimer.current = setTimeout(() => {
            setInfoSurah({ name, number: s });
            longPressTimer.current = null;
        }, 600); // 600ms for long press
    };

    const handleSurahPointerUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleAyahClick = (a: number) => {
        setSelectedAyah(a);
        setSelectedJuz(getJuzForAyah(selectedSurah, a));
        
        let targetHq = getHizbQuarterForSurah(selectedSurah);
        if (quranData && quranData.surahs) {
            const surah = quranData.surahs[selectedSurah - 1];
            if (surah && surah.ayahs) {
                const ayah = surah.ayahs.find((ay: any) => ay.numberInSurah === a);
                if (ayah && ayah.hizbQuarter) {
                    targetHq = ayah.hizbQuarter;
                }
            }
        }
        setSelectedHizbQuarter(targetHq);
        prewarmSelectionFont(selectedSurah, a);
    };

    const handleHizbQuarterClick = (hq: number) => {
        setSelectedHizbQuarter(hq);
        
        let targetSurah = 1;
        let targetAyah = 1;
        
        if (quranData && quranData.surahs) {
            for (const surah of quranData.surahs) {
                const ayah = surah.ayahs.find((a: any) => a.hizbQuarter === hq);
                if (ayah) {
                    targetSurah = surah.number;
                    targetAyah = ayah.numberInSurah;
                    break;
                }
            }
        } else {
            targetSurah = HIZB_QUARTERS.findIndex(h => h === hq) + 1;
            if (targetSurah <= 0) targetSurah = 1;
        }

        setSelectedSurah(targetSurah);
        setSelectedAyah(targetAyah);
        setSelectedJuz(getJuzForAyah(targetSurah, targetAyah));
        setSearchTerm('');
        prewarmSelectionFont(targetSurah, targetAyah);
    };

    const ayahsCount = SURAH_INFO[selectedSurah]?.ayahs || 0;
    const surahs = quranData?.surahs || [];

    const filteredSurahs = surahs.filter((s: any) => {
        const normalizedName = removeDiacritics(s.name);
        const normalizedNameWithoutSurah = removeDiacritics(s.name.replace('سورة', '').trim());
        const surahNumber = s.number.toString();
        const enName = (SURAH_NAMES_EN[s.number - 1] || '').toLowerCase();
        const searchLower = searchTerm.trim().toLowerCase();
        return normalizedName.includes(normalizedSearch) || 
               normalizedNameWithoutSurah.includes(normalizedSearch) ||
               enName.includes(searchLower) ||
               surahNumber.includes(searchTerm);
    });

    const formatHizbQuarter = (hq: number) => {
        const hizb = Math.ceil(hq / 4);
        const quarter = hq % 4;
        if (isEn) {
            if (quarter === 1) return `Hizb ${hizb}`;
            if (quarter === 2) return `1/4 Hizb ${hizb}`;
            if (quarter === 3) return `1/2 Hizb ${hizb}`;
            return `3/4 Hizb ${hizb}`;
        }
        let quarterText = '';
        if (quarter === 1) quarterText = 'الحزب';
        else if (quarter === 2) quarterText = 'ربع الحزب';
        else if (quarter === 3) quarterText = 'نصف الحزب';
        else if (quarter === 0) quarterText = 'ثلاثة أرباع الحزب';
        
        return `${quarterText} ${toArabic(hizb)}`;
    };

    const listsContent = useMemo(() => {
        const listContainerClass = isMadinahOrMushaf
            ? 'flex flex-1 overflow-hidden relative'
            : 'flex flex-1 overflow-hidden themed-card-bg relative';
        const getRowStyle = (isSelected: boolean): React.CSSProperties | undefined => {
            if (!isMadinahOrMushaf) return undefined;
            return isSelected
                ? { backgroundColor: selectedControlBg, color: selectedControlText, borderColor: selectedControlBg }
                : { backgroundColor: cardSurfaceBg, color: bodyTextColor, borderColor: borderSubtle };
        };
        const getRowClass = (isSelected: boolean, extraClass: string) => {
            if (isMadinahOrMushaf) {
                return `${extraClass} ${isSelected ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`;
            }
            return `${extraClass} ${isSelected ? 'theme-accent-btn quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`;
        };

        return (
            <div
                className={listContainerClass}
                style={isMadinahOrMushaf ? { backgroundColor: modalBg, color: bodyTextColor } : undefined}
                dir={isRTL ? "rtl" : "ltr"}
            >
                {/* Juz Column */}
                <div className="flex-[0.55] flex flex-col border-0">
                    <div
                        className={`${isLandscape ? 'p-1.5 text-[11px]' : 'p-2 text-xs'} text-center font-bold opacity-75 border-0`}
                        style={isMadinahOrMushaf ? { color: bodyTextColor } : undefined}
                    >
                        {isEn ? "Juz" : "الجزء"}
                    </div>
                    <div className={`flex-1 overflow-y-auto ${isLandscape ? 'p-1 space-y-1' : 'p-1.5 space-y-1.5'} min-h-0 overscroll-contain`} style={{ WebkitOverflowScrolling: 'touch' }}>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                            <button
                                key={j}
                                id={j === 1 ? 'juz-item-1' : undefined}
                                ref={el => { juzRefs.current[j] = el; }}
                                onClick={() => handleJuzClick(j)}
                                className={getRowClass(selectedJuz === j, `w-full ${isLandscape ? 'py-1.5 px-1 text-xs rounded-lg' : 'p-2.5 text-sm rounded-xl'} font-bold transition border-0 ${j === 1 ? 'surah-juz-first-row-item' : ''}`)}
                                style={getRowStyle(selectedJuz === j)}
                            >
                                {isEn ? j : toArabic(j)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Surah Column */}
                <div className="flex-[2] flex flex-col border-0">
                    <div
                        className={`${isLandscape ? 'p-1.5 text-[11px]' : 'p-2 text-xs'} text-center font-bold opacity-75 border-0`}
                        style={isMadinahOrMushaf ? { color: bodyTextColor } : undefined}
                    >
                        {isEn ? "Surah" : "السورة"}
                    </div>
                    <div className={`flex-1 overflow-y-auto ${isLandscape ? 'p-1 space-y-1' : 'p-1.5 space-y-1.5'} min-h-0 overscroll-contain`} style={{ WebkitOverflowScrolling: 'touch' }}>
                        {filteredSurahs.map((s: any) => {
                            const surahNameAr = s.name.replace('سورة', '').trim();
                            const surahDisplayName = isEn ? (SURAH_NAMES_EN[s.number - 1] || surahNameAr) : surahNameAr;
                            const isFirstSurah = s.number === 1;
                            const isSelected = selectedSurah === s.number;
                            return (
                                <button
                                    key={s.number}
                                    id={isFirstSurah ? 'surah-item-1' : `surah-item-${s.number}`}
                                    ref={el => { surahRefs.current[s.number] = el; }}
                                    onClick={() => handleSurahClick(s.number)}
                                    onPointerDown={() => handleSurahPointerDown(s.number, surahNameAr)}
                                    onPointerUp={handleSurahPointerUp}
                                    onPointerLeave={handleSurahPointerUp}
                                    className={getRowClass(isSelected, `w-full ${isLandscape ? 'py-1.5 px-1.5 text-xs rounded-lg gap-1' : 'p-2.5 text-sm rounded-xl gap-2'} font-bold text-center flex justify-center items-center transition select-none border-0 ${isFirstSurah ? 'surah-juz-first-row-item' : ''}`)}
                                    style={getRowStyle(isSelected)}
                                >
                                    <span
                                        className={`${isLandscape ? 'text-[10px]' : 'text-xs'} ${isSelected ? '' : 'opacity-65'}`}
                                        style={isMadinahOrMushaf ? { color: isSelected ? selectedControlText : bodyTextColor } : (isSelected ? { color: '#ffffff' } : undefined)}
                                    >
                                        {isEn ? s.number : toArabic(s.number)} -
                                    </span>
                                    <span className="truncate" style={{ fontFamily: isEn ? 'inherit' : 'var(--font-amiri)' }}>{surahDisplayName}</span>
                                </button>
                            );
                        })}
                        {filteredSurahs.length === 0 && (
                            <div className="text-center py-4 text-xs opacity-50 font-bold">
                                {isEn ? "No results found" : "لا توجد نتائج"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Ayah Column */}
                <div className="flex-[0.55] flex flex-col border-0">
                    <div
                        className={`${isLandscape ? 'p-1.5 text-[11px]' : 'p-2 text-xs'} text-center font-bold opacity-75 border-0`}
                        style={isMadinahOrMushaf ? { color: bodyTextColor } : undefined}
                    >
                        {isEn ? "Ayah" : "الآية"}
                    </div>
                    <div className={`flex-1 overflow-y-auto ${isLandscape ? 'p-1 space-y-1' : 'p-1.5 space-y-1.5'} min-h-0 overscroll-contain`} style={{ WebkitOverflowScrolling: 'touch' }}>
                        {Array.from({ length: ayahsCount }, (_, i) => i + 1).map(a => (
                            <button
                                key={a}
                                id={a === 1 ? 'ayah-item-1' : undefined}
                                ref={el => { ayahRefs.current[a] = el; }}
                                onClick={() => handleAyahClick(a)}
                                className={getRowClass(selectedAyah === a, `w-full ${isLandscape ? 'py-1.5 px-1 text-xs rounded-lg' : 'p-2.5 text-sm rounded-xl'} font-bold transition border-0 ${a === 1 ? 'surah-juz-first-row-item' : ''}`)}
                                style={getRowStyle(selectedAyah === a)}
                            >
                                {isEn ? a : toArabic(a)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hizb Quarter Column */}
                <div className="flex-[1.5] flex flex-col border-0">
                    <div
                        className={`${isLandscape ? 'p-1.5 text-[11px]' : 'p-2 text-xs'} text-center font-bold opacity-75 border-0`}
                        style={isMadinahOrMushaf ? { color: bodyTextColor } : undefined}
                    >
                        {isEn ? "Hizb" : "الحزب"}
                    </div>
                    <div className={`flex-1 overflow-y-auto ${isLandscape ? 'p-1 space-y-1' : 'p-1.5 space-y-1.5'} min-h-0 overscroll-contain`} style={{ WebkitOverflowScrolling: 'touch' }}>
                        {Array.from({ length: 240 }, (_, i) => i + 1).map(hq => (
                            <button
                                key={hq}
                                id={hq === 1 ? 'hizb-item-1' : undefined}
                                ref={el => { hizbRefs.current[hq] = el; }}
                                onClick={() => handleHizbQuarterClick(hq)}
                                className={getRowClass(selectedHizbQuarter === hq, `w-full ${isLandscape ? 'py-1.5 px-1 text-[11px] rounded-lg' : 'p-2.5 text-xs rounded-xl'} font-bold transition border-0 ${hq === 1 ? 'surah-juz-first-row-item' : ''}`)}
                                style={getRowStyle(selectedHizbQuarter === hq)}
                            >
                                {formatHizbQuarter(hq)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }, [selectedJuz, selectedSurah, selectedAyah, selectedHizbQuarter, filteredSurahs, ayahsCount, isEn, isRTL, isLandscape, isMadinahOrMushaf, modalBg, bodyTextColor, cardSurfaceBg, selectedControlBg, selectedControlText, borderSubtle]);

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/50 flex justify-center items-center ${isLandscape ? 'p-2' : 'p-4'}`} 
             dir={isRTL ? "rtl" : "ltr"}
             onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div 
                className={`modal-skinned surah-juz-modal font-cairo ${isLandscape ? 'w-[62%] max-w-[430px] h-[86%] max-h-[86%] rounded-3xl' : 'w-full max-w-4xl rounded-3xl max-h-[90dvh]'} shadow-2xl overflow-hidden flex flex-col border-0`}
                style={
                    isMadinahOrMushaf
                        ? ({
                              fontFamily: "'Cairo', sans-serif",
                              backgroundColor: modalBg,
                              color: bodyTextColor,
                              border: `2px solid ${borderStrong}`,
                              outline: 'none',
                              '--madinah-menu-bg': modalBg,
                              '--madinah-menu-surface': cardSurfaceBg,
                              '--madinah-menu-text': bodyTextColor,
                              '--madinah-menu-accent': selectedControlBg,
                              '--madinah-menu-border-subtle': borderSubtle,
                              '--madinah-menu-border-strong': borderStrong,
                              '--qr-flat-accent': selectedControlBg,
                              '--qr-flat-border-subtle': borderSubtle,
                              '--qr-flat-border-strong': borderStrong,
                          } as React.CSSProperties)
                        : { fontFamily: "'Cairo', sans-serif", border: 'none', outline: 'none' }
                }
                onClick={e => e.stopPropagation()}
            >
                {!isLandscape && (
                    <div
                        className={`p-4 flex flex-col gap-3 border-0 ${isMadinahOrMushaf ? '' : 'theme-header-bg'}`}
                        style={isMadinahOrMushaf ? { backgroundColor: modalBg, color: bodyTextColor, borderBottom: `1.5px solid ${borderSubtle}` } : undefined}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                id="surah-juz-search-box"
                                className="relative flex-1 quran-raised-card rounded-2xl overflow-hidden border-0"
                                style={isMadinahOrMushaf ? { backgroundColor: cardSurfaceBg, borderColor: borderSubtle } : undefined}
                            >
                                <input
                                    id="surah-juz-search-input"
                                    type="text"
                                    placeholder={isEn ? "Search by surah name or number..." : "بحث باسم السورة أو رقمها..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                    onFocus={e => e.stopPropagation()}
                                    onMouseDown={e => e.stopPropagation()}
                                    onTouchStart={e => e.stopPropagation()}
                                    className={`w-full p-2.5 ${isRTL ? 'pr-10' : 'pl-10'} rounded-2xl border-0 placeholder:opacity-55 text-sm font-bold focus:outline-none transition-all ${isMadinahOrMushaf ? '' : 'theme-card-bg theme-card-text'}`}
                                    style={isMadinahOrMushaf ? { backgroundColor: cardSurfaceBg, color: bodyTextColor } : undefined}
                                />
                                <i
                                    className={`fas fa-search absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-sm opacity-70`}
                                    style={isMadinahOrMushaf ? { color: accentColor } : undefined}
                                ></i>
                            </div>
                            {!isLandscape && onOpenGuide && showPageGuides && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenGuide();
                                    }}
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm quran-raised-btn border-0 active:scale-95 transition-all cursor-pointer ${isMadinahOrMushaf ? '' : 'theme-btn-bg'}`}
                                    style={isMadinahOrMushaf ? { backgroundColor: cardSurfaceBg, color: accentColor, borderColor: borderSubtle } : undefined}
                                    title={isEn ? "Surah Index Guide" : "إرشاد فهرس السور"}
                                >
                                    <i
                                        className="fas fa-question-circle text-lg quran-3d-icon"
                                        style={{
                                            color: isMadinahOrMushaf
                                                ? accentColor
                                                : currentTheme?.id === 'deep_black'
                                                ? '#ffffff'
                                                : (currentTheme?.accent || 'var(--qr-accent, #10b981)')
                                        }}
                                    ></i>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {listsContent}

                <div
                    className={`${isLandscape ? 'p-2.5 gap-3' : 'p-4 gap-4'} flex justify-center border-0 ${isMadinahOrMushaf ? '' : 'theme-header-bg'}`}
                    style={isMadinahOrMushaf ? { backgroundColor: modalBg, color: bodyTextColor, borderTop: `1.5px solid ${borderSubtle}` } : undefined}
                >
                    <button 
                        onClick={() => onSelect(selectedSurah, selectedAyah)}
                        className={`${isMadinahOrMushaf ? '' : 'theme-accent-btn'} ${isLandscape ? 'px-6 py-1.5 text-xs rounded-xl' : 'px-8 py-2.5 rounded-2xl'} font-bold border-0 quran-raised-btn-selected active:scale-95 transition`}
                        style={isMadinahOrMushaf ? { backgroundColor: selectedControlBg, color: selectedControlText, borderColor: selectedControlBg } : undefined}
                    >
                        {isEn ? "View" : "عرض"}
                    </button>
                    <button 
                        onClick={onClose}
                        className={`${isMadinahOrMushaf ? '' : 'theme-btn-bg theme-btn-text'} ${isLandscape ? 'px-6 py-1.5 text-xs rounded-xl' : 'px-8 py-2.5 rounded-2xl'} font-bold border-0 quran-raised-btn active:scale-95 transition`}
                        style={
                            isMadinahOrMushaf
                                ? { backgroundColor: cardSurfaceBg, color: bodyTextColor, borderColor: borderSubtle }
                                : {
                                      color: currentTheme?.id === 'black' ? (currentTheme?.btnText || '#000000') : (currentTheme?.btnText || '#000000'),
                                      backgroundColor: currentTheme?.id === 'black' ? (currentTheme?.btnBg || '#ffffff') : (currentTheme?.btnBg || '#ffffff')
                                  }
                        }
                    >
                        {isEn ? "Close" : "إغلاق"}
                    </button>
                </div>
            </div>
            
            {infoSurah && (
                <SurahInfoModal 
                    surahName={infoSurah.name}
                    surahNumber={infoSurah.number}
                    quranData={quranData}
                    onClose={() => setInfoSurah(null)}
                    isEnglishMode={isEnglishMode}
                    isLandscape={isLandscape}
                />
            )}
        </div>
    );
};

export default SurahJuzModal;
