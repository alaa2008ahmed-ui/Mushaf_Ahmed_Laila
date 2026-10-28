import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { JUZ_MAP, toArabic, SURAH_INFO, HIZB_QUARTERS, SURAH_NAMES_EN } from './constants';
import SurahInfoModal from './SurahInfoModal';
import { useLanguage } from '../../context/LanguageContext';

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
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const isEnglishMode = isEn || readingMode === 'bilingual' || readingMode === 'translation';
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

    const normalizedSearch = removeDiacritics(searchTerm);

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
    };

    const handleSurahClick = (s: number) => {
        setSelectedSurah(s);
        setSelectedAyah(1);
        setSelectedJuz(getJuzForAyah(s, 1));
        setSelectedHizbQuarter(getHizbQuarterForSurah(s));
        setSearchTerm('');
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
        return (
            <div className="flex flex-1 overflow-hidden themed-card-bg relative" dir={isRTL ? "rtl" : "ltr"}>
                {/* Juz Column */}
                <div className="flex-[0.5] flex flex-col border-0">
                    <div className="p-2 text-center text-xs font-bold opacity-70 border-0">
                        {isEn ? "Juz" : "الجزء"}
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                            <button
                                key={j}
                                id={j === 1 ? 'juz-item-1' : undefined}
                                ref={el => { juzRefs.current[j] = el; }}
                                onClick={() => handleJuzClick(j)}
                                className={`w-full p-2.5 rounded-xl text-sm font-bold transition border-0 ${j === 1 ? 'surah-juz-first-row-item' : ''} ${selectedJuz === j ? 'theme-accent-btn quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                            >
                                {isEn ? j : toArabic(j)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Surah Column */}
                <div className="flex-[2] flex flex-col border-0">
                    <div className="p-2 text-center text-xs font-bold opacity-70 border-0">
                        {isEn ? "Surah" : "السورة"}
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {filteredSurahs.map((s: any) => {
                            const surahNameAr = s.name.replace('سورة', '').trim();
                            const surahDisplayName = isEn ? (SURAH_NAMES_EN[s.number - 1] || surahNameAr) : surahNameAr;
                            const isFirstSurah = s.number === 1;
                            return (
                                <button
                                    key={s.number}
                                    id={isFirstSurah ? 'surah-item-1' : `surah-item-${s.number}`}
                                    ref={el => { surahRefs.current[s.number] = el; }}
                                    onClick={() => handleSurahClick(s.number)}
                                    onPointerDown={() => handleSurahPointerDown(s.number, surahNameAr)}
                                    onPointerUp={handleSurahPointerUp}
                                    onPointerLeave={handleSurahPointerUp}
                                    className={`w-full p-2.5 rounded-xl text-sm font-bold text-center flex justify-center items-center gap-2 transition select-none border-0 ${isFirstSurah ? 'surah-juz-first-row-item' : ''} ${selectedSurah === s.number ? 'theme-accent-btn quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                                >
                                    <span className={`text-xs ${selectedSurah === s.number ? 'text-white' : 'opacity-60'}`}>{isEn ? s.number : toArabic(s.number)} -</span>
                                    <span style={{ fontFamily: isEn ? 'inherit' : 'var(--font-amiri)' }}>{surahDisplayName}</span>
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
                <div className="flex-[0.5] flex flex-col border-0">
                    <div className="p-2 text-center text-xs font-bold opacity-70 border-0">
                        {isEn ? "Ayah" : "الآية"}
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {Array.from({ length: ayahsCount }, (_, i) => i + 1).map(a => (
                            <button
                                key={a}
                                id={a === 1 ? 'ayah-item-1' : undefined}
                                ref={el => { ayahRefs.current[a] = el; }}
                                onClick={() => handleAyahClick(a)}
                                className={`w-full p-2.5 rounded-xl text-sm font-bold transition border-0 ${a === 1 ? 'surah-juz-first-row-item' : ''} ${selectedAyah === a ? 'theme-accent-btn quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                            >
                                {isEn ? a : toArabic(a)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hizb Quarter Column */}
                <div className="flex-[1.5] flex flex-col border-0">
                    <div className="p-2 text-center text-xs font-bold opacity-70 border-0">
                        {isEn ? "Hizb" : "الحزب"}
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {Array.from({ length: 240 }, (_, i) => i + 1).map(hq => (
                            <button
                                key={hq}
                                id={hq === 1 ? 'hizb-item-1' : undefined}
                                ref={el => { hizbRefs.current[hq] = el; }}
                                onClick={() => handleHizbQuarterClick(hq)}
                                className={`w-full p-2.5 rounded-xl text-xs font-bold transition border-0 ${hq === 1 ? 'surah-juz-first-row-item' : ''} ${selectedHizbQuarter === hq ? 'theme-accent-btn quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                            >
                                {formatHizbQuarter(hq)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }, [selectedJuz, selectedSurah, selectedAyah, selectedHizbQuarter, filteredSurahs, ayahsCount, isEn, isRTL]);

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/25 backdrop-blur-[2px] flex justify-center items-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} 
             dir={isRTL ? "rtl" : "ltr"}
             onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div 
                className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-4xl rounded-3xl max-h-[90vh]'} shadow-2xl overflow-hidden flex flex-col border-0 animate-modal-enter`}
                style={{ border: 'none', outline: 'none' }}
                onClick={e => e.stopPropagation()}
            >
                {!isLandscape && (
                    <div className="p-4 theme-header-bg flex flex-col gap-3 border-0" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                            <div id="surah-juz-search-box" className="relative flex-1 quran-raised-card rounded-2xl overflow-hidden border-0">
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
                                    className={`w-full p-2.5 ${isRTL ? 'pr-10' : 'pl-10'} rounded-2xl theme-card-bg border-0 theme-card-text placeholder:opacity-50 text-sm font-bold focus:outline-none transition-all`}
                                />
                                <i className={`fas fa-search absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-sm opacity-60`}></i>
                            </div>
                            {onOpenGuide && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenGuide();
                                    }}
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center theme-btn-bg text-sm quran-raised-btn border-0 active:scale-95 transition-all cursor-pointer"
                                    title={isEn ? "Surah Index Guide" : "إرشاد فهرس السور"}
                                >
                                    <i className="fas fa-question-circle text-emerald-500 text-lg quran-3d-icon"></i>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {listsContent}

                <div className="p-4 theme-header-bg flex justify-center gap-4 border-0">
                    <button 
                        onClick={() => onSelect(selectedSurah, selectedAyah)}
                        className="theme-accent-btn px-8 py-2.5 rounded-2xl font-bold border-0 quran-raised-btn-selected active:scale-95 transition"
                    >
                        {isEn ? "View" : "عرض"}
                    </button>
                    <button 
                        onClick={onClose}
                        className="theme-btn-bg theme-btn-text px-8 py-2.5 rounded-2xl font-bold border-0 quran-raised-btn active:scale-95 transition"
                        style={{ 
                            color: currentTheme?.id === 'black' ? (currentTheme?.btnText || '#000000') : (currentTheme?.btnText || '#000000'),
                            backgroundColor: currentTheme?.id === 'black' ? (currentTheme?.btnBg || '#ffffff') : (currentTheme?.btnBg || '#ffffff')
                        }}
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
                />
            )}
        </div>
    );
};

export default SurahJuzModal;
