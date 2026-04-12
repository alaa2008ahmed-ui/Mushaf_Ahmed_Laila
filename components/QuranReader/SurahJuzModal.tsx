import React, { useState, useEffect, useRef, useCallback } from 'react';
import { JUZ_MAP, toArabic, SURAH_INFO, HIZB_QUARTERS } from './constants';

interface SurahJuzModalProps {
    type: 'surah' | 'juz' | 'hizb';
    quranData: any;
    onSelect: (surah: number, ayah: number) => void;
    onClose: () => void;
    isLandscape?: boolean;
    currentSelection?: number;
    currentAyah?: { s: number, a: number };
}

const SurahJuzModal: React.FC<SurahJuzModalProps> = ({ type, quranData, onSelect, onClose, isLandscape, currentSelection, currentAyah }) => {
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
        return normalizedName.includes(normalizedSearch) || normalizedNameWithoutSurah.includes(normalizedSearch);
    });

    const formatHizbQuarter = (hq: number) => {
        const hizb = Math.ceil(hq / 4);
        const quarter = hq % 4;
        let quarterText = '';
        if (quarter === 1) quarterText = 'الحزب';
        else if (quarter === 2) quarterText = 'ربع الحزب';
        else if (quarter === 3) quarterText = 'نصف الحزب';
        else if (quarter === 0) quarterText = 'ثلاثة أرباع الحزب';
        
        return `${quarterText} ${toArabic(hizb)}`;
    };

    return (
        <div className={`fixed inset-0 z-[1200] bg-transparent flex justify-center items-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-4xl rounded-2xl max-h-[90vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                {!isLandscape && (
                    <div className="p-4 theme-header-bg flex flex-col gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="بحث في السور..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pr-10 rounded-xl theme-card-bg border theme-card-border theme-card-text placeholder:opacity-50 text-sm focus:outline-none focus:ring-2 theme-accent-ring transition-all"
                            />
                            <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-70"></i>
                        </div>
                    </div>
                )}

                <div className="flex flex-1 overflow-hidden themed-card-bg">
                    {/* Juz Column */}
                    <div className="flex-1 flex flex-col border-l theme-card-border">
                        <div className="p-2 text-center text-xs font-bold opacity-60 border-b theme-card-border">الجزء</div>
                        <div className="flex-1 overflow-y-auto p-1 space-y-1 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                                <button
                                    key={j}
                                    ref={el => juzRefs.current[j] = el}
                                    onClick={() => handleJuzClick(j)}
                                    className={`w-full p-2 rounded text-sm font-bold transition ${selectedJuz === j ? 'theme-accent-btn shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {toArabic(j)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Surah Column */}
                    <div className="flex-1 flex flex-col border-l theme-card-border">
                        <div className="p-2 text-center text-xs font-bold opacity-60 border-b theme-card-border">السورة</div>
                        <div className="flex-1 overflow-y-auto p-1 space-y-1 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {filteredSurahs.map((s: any) => (
                                <button
                                    key={s.number}
                                    ref={el => surahRefs.current[s.number] = el}
                                    onClick={() => handleSurahClick(s.number)}
                                    className={`w-full p-2 rounded text-sm font-bold text-right flex justify-start items-center gap-2 transition ${selectedSurah === s.number ? 'theme-accent-btn shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <span className={`text-xs ${selectedSurah === s.number ? 'text-white' : 'opacity-60'}`}>{toArabic(s.number)} -</span>
                                    <span style={{ fontFamily: 'var(--font-amiri)' }}>{s.name.replace('سورة', '').trim()}</span>
                                </button>
                            ))}
                            {filteredSurahs.length === 0 && (
                                <div className="text-center py-4 text-xs opacity-50">لا توجد نتائج</div>
                            )}
                        </div>
                    </div>

                    {/* Ayah Column */}
                    <div className="flex-1 flex flex-col border-l theme-card-border">
                        <div className="p-2 text-center text-xs font-bold opacity-60 border-b theme-card-border">الآية</div>
                        <div className="flex-1 overflow-y-auto p-1 space-y-1 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {Array.from({ length: ayahsCount }, (_, i) => i + 1).map(a => (
                                <button
                                    key={a}
                                    ref={el => ayahRefs.current[a] = el}
                                    onClick={() => handleAyahClick(a)}
                                    className={`w-full p-2 rounded text-sm font-bold transition ${selectedAyah === a ? 'theme-accent-btn shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {toArabic(a)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hizb Quarter Column */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-2 text-center text-xs font-bold opacity-60 border-b theme-card-border">الحزب</div>
                        <div className="flex-1 overflow-y-auto p-1 space-y-1 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {Array.from({ length: 240 }, (_, i) => i + 1).map(hq => (
                                <button
                                    key={hq}
                                    ref={el => hizbRefs.current[hq] = el}
                                    onClick={() => handleHizbQuarterClick(hq)}
                                    className={`w-full p-2 rounded text-xs font-bold transition ${selectedHizbQuarter === hq ? 'theme-accent-btn shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {formatHizbQuarter(hq)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 theme-header-bg flex justify-center gap-4">
                    <button 
                        onClick={() => onSelect(selectedSurah, selectedAyah)}
                        className="theme-accent-btn px-8 py-2 rounded-full font-bold shadow-lg transform active:scale-95 transition"
                    >
                        عرض
                    </button>
                    <button 
                        onClick={onClose}
                        className="theme-btn-bg theme-btn-text px-8 py-2 rounded-full font-bold shadow-lg transform active:scale-95 transition border theme-card-border"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurahJuzModal;
