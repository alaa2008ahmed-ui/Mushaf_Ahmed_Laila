import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { X, Volume2, VolumeX, Copy, Check, Share2, ZoomIn, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import {
    ensureEmbeddedMeaningsLoaded,
    ensureEmbeddedTafseerLoaded,
    ensureEmbeddedTranslationLoaded,
    getEmbeddedTafseerSurahSync,
    getExplanationEntrySync,
    hasEmbeddedDataReadySync,
} from '../../utils/embeddedQuranExplanations';
import { SURAH_INFO, SURAH_NAMES_AR, SURAH_NAMES_EN, getTafseerDisplayName, toArabic } from './constants';
import { resolveQuranModalPalette } from './modalThemeUtils';

export type SurahExplanationMode = 'tafseer' | 'meanings' | 'translation';

interface SurahExplanationModalProps {
    isOpen: boolean;
    mode: SurahExplanationMode;
    surahNumber: number;
    targetAyahNumber?: number;
    surahName?: string;
    quranData: any;
    settings: any;
    currentTheme?: any;
    isLandscape?: boolean;
    tafseerCacheRef: React.MutableRefObject<any>;
    quranMeaningsCacheRef: React.MutableRefObject<any>;
    quranMeaningsMapRef: React.MutableRefObject<Map<string, string> | null>;
    quranTranslationCacheRef: React.MutableRefObject<any>;
    onPlayAudio?: (surah: number, ayah: number) => void;
    onStopAudio?: () => void;
    playingAyah?: { s: number; a: number } | null;
    isAudioPlaying?: boolean;
    showToast?: (msg: string) => void;
    onClose: () => void;
}

type FlattenedExplanationItem =
    | {
          type: 'header';
          key: string;
          surahNumber: number;
          rawArName: string;
          enName: string;
          ayahCount: number;
          revelationType: string;
      }
    | {
          type: 'ayah';
          key: string;
          surahNumber: number;
          ayahNumber: number;
          text: string;
          rawArName: string;
          enName: string;
      };

const cleanExplanationText = (raw?: string): string => {
    if (!raw) return '';
    return raw
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .trim();
};

const stripSurahWord = (name: string): string =>
    (name || '').replace(/سورة|سُورَةُ|سُورَة/g, '').trim();

const SurahExplanationModal: React.FC<SurahExplanationModalProps> = ({
    isOpen,
    mode,
    surahNumber,
    targetAyahNumber = 1,
    quranData,
    settings,
    currentTheme,
    isLandscape = false,
    tafseerCacheRef,
    onPlayAudio,
    onStopAudio,
    playingAyah,
    isAudioPlaying = false,
    showToast,
    onClose,
}) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    const currentTafseerId = settings?.tafseer || 'ar.jalalayn';

    const [fontSize, setFontSize] = useState<number>(17);
    const [isLoading, setIsLoading] = useState<boolean>(() => !hasEmbeddedDataReadySync(mode));
    const [loadError, setLoadError] = useState<boolean>(false);
    const [dataRevision, setDataRevision] = useState<number>(0);
    const [copiedAyahKey, setCopiedAyahKey] = useState<string | null>(null);
    const [copiedSurah, setCopiedSurah] = useState<boolean>(false);
    const [reloadNonce, setReloadNonce] = useState<number>(0);
    const [selectedAyah, setSelectedAyah] = useState<{ s: number; a: number }>({
        s: surahNumber,
        a: targetAyahNumber || 1,
    });
    const [visibleSurah, setVisibleSurah] = useState<number>(surahNumber);

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const fetchingSurahsRef = useRef<Set<number>>(new Set());
    const userInteractedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!isOpen) return;
        setSelectedAyah({ s: surahNumber, a: targetAyahNumber || 1 });
        setVisibleSurah(surahNumber);
        setCopiedSurah(false);
        userInteractedRef.current = false;
    }, [isOpen, surahNumber, targetAyahNumber]);

    const { flattenedItems, ayahToIndexMap } = useMemo(() => {
        const items: FlattenedExplanationItem[] = [];
        const indexMap = new Map<string, number>();
        const surahs: any[] = quranData?.surahs || [];

        for (let sIdx = 0; sIdx < surahs.length; sIdx++) {
            const surah = surahs[sIdx];
            const sNum = Number(surah?.number || sIdx + 1);
            const rawArName = stripSurahWord(SURAH_NAMES_AR[sNum - 1] || surah?.name || '');
            const enName = SURAH_NAMES_EN[sNum - 1] || rawArName;
            const info = SURAH_INFO[sNum];
            const ayahs: any[] = surah?.ayahs || [];

            items.push({
                type: 'header',
                key: `surah-header-${sNum}`,
                surahNumber: sNum,
                rawArName,
                enName,
                ayahCount: info?.ayahs || ayahs.length,
                revelationType: info?.type || '',
            });

            for (let aIdx = 0; aIdx < ayahs.length; aIdx++) {
                const ayah = ayahs[aIdx];
                const aNum = Number(ayah?.numberInSurah || aIdx + 1);
                const idx = items.length;
                indexMap.set(`${sNum}:${aNum}`, idx);
                items.push({
                    type: 'ayah',
                    key: `ayah-${sNum}-${aNum}`,
                    surahNumber: sNum,
                    ayahNumber: aNum,
                    text: ayah?.text || '',
                    rawArName,
                    enName,
                });
            }
        }

        return { flattenedItems: items, ayahToIndexMap: indexMap };
    }, [quranData]);

    const initialIndex = useMemo(() => {
        const targetKey = `${surahNumber}:${targetAyahNumber || 1}`;
        return ayahToIndexMap.get(targetKey) ?? 0;
    }, [ayahToIndexMap, surahNumber, targetAyahNumber]);

    const ensureRemoteTafseerForSurah = useCallback(
        async (targetSurah: number) => {
            if (mode !== 'tafseer' || currentTafseerId === 'ar.jalalayn') return;
            const existing = getEmbeddedTafseerSurahSync(targetSurah, currentTafseerId, tafseerCacheRef.current);
            if (existing) return;
            if (fetchingSurahsRef.current.has(targetSurah)) return;

            fetchingSurahsRef.current.add(targetSurah);
            try {
                const res = await fetch(`https://api.alquran.cloud/v1/surah/${targetSurah}/${currentTafseerId}`);
                const data = await res.json();
                if (data?.code === 200 && Array.isArray(data?.data?.ayahs)) {
                    tafseerCacheRef.current[`${targetSurah}_${currentTafseerId}`] = data.data.ayahs;
                    setDataRevision((r) => r + 1);
                }
            } catch {
                // Embedded Jalalayn fallback remains displayed immediately
            } finally {
                fetchingSurahsRef.current.delete(targetSurah);
            }
        },
        [mode, currentTafseerId, tafseerCacheRef]
    );

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        setLoadError(false);

        const initEmbeddedData = async () => {
            if (hasEmbeddedDataReadySync(mode)) {
                setIsLoading(false);
                if (mode === 'tafseer' && currentTafseerId !== 'ar.jalalayn') {
                    void ensureRemoteTafseerForSurah(surahNumber);
                }
                return;
            }

            try {
                setIsLoading(true);
                if (mode === 'tafseer') {
                    await ensureEmbeddedTafseerLoaded();
                } else if (mode === 'meanings') {
                    await ensureEmbeddedMeaningsLoaded();
                } else {
                    await ensureEmbeddedTranslationLoaded();
                }

                if (!cancelled) {
                    setIsLoading(false);
                    setDataRevision((r) => r + 1);
                    if (mode === 'tafseer' && currentTafseerId !== 'ar.jalalayn') {
                        void ensureRemoteTafseerForSurah(surahNumber);
                    }
                }
            } catch {
                if (!cancelled) {
                    setLoadError(true);
                    setIsLoading(false);
                }
            }
        };

        void initEmbeddedData();
        return () => {
            cancelled = true;
        };
    }, [isOpen, mode, surahNumber, currentTafseerId, reloadNonce, ensureRemoteTafseerForSurah]);

    // Reinforce immediate exact centering on target ayah once mounted & measured
    useEffect(() => {
        if (!isOpen || isLoading || flattenedItems.length === 0) return;

        const alignTarget = () => {
            if (userInteractedRef.current) return;
            virtuosoRef.current?.scrollToIndex({
                index: initialIndex,
                align: 'center',
                behavior: 'auto',
            });
        };

        const rafId = window.requestAnimationFrame(alignTarget);
        const timerId = window.setTimeout(alignTarget, 45);
        return () => {
            window.cancelAnimationFrame(rafId);
            window.clearTimeout(timerId);
        };
    }, [isOpen, isLoading, initialIndex, flattenedItems.length]);

    const p = resolveQuranModalPalette(currentTheme);
    const hairlineColor = p.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

    const handleCopyVerse = useCallback(
        (sNum: number, aNum: number, rawArName: string, ayahText: string, explanationText: string) => {
            const cleanExp = cleanExplanationText(explanationText);
            const fullText = `${ayahText} ﴿${toArabic(aNum)}﴾\n\n${cleanExp}\n\n[سورة ${rawArName} - آية ${toArabic(aNum)}]`;
            const key = `${sNum}-${aNum}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(fullText).then(() => {
                    setCopiedAyahKey(key);
                    window.setTimeout(() => setCopiedAyahKey((prev) => (prev === key ? null : prev)), 1800);
                    showToast?.(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
                });
            }
        },
        [isEn, showToast]
    );

    const categoryBadgeLabel =
        mode === 'tafseer'
            ? isEn
                ? 'Quran Tafseer'
                : 'تفسير القرآن'
            : mode === 'meanings'
            ? isEn
                ? 'Quran Meanings'
                : 'معاني القرآن'
            : isEn
            ? 'English Translation'
            : 'الترجمة الإنجليزية';

    const handleShareVerse = useCallback(
        async (sNum: number, aNum: number, rawArName: string, enName: string, ayahText: string, explanationText: string) => {
            const cleanExp = cleanExplanationText(explanationText);
            const fullShareText = ayahText ? `${ayahText} ﴿${toArabic(aNum)}﴾\n\n${cleanExp}` : cleanExp;
            const sourceRef = isEn ? `Surah ${enName} - Ayah ${aNum}` : `سورة ${rawArName} - آية ${toArabic(aNum)}`;

            await shareAsImage({
                text: fullShareText,
                title: categoryBadgeLabel,
                source: sourceRef,
                category: categoryBadgeLabel,
                theme: currentTheme,
                isEn,
                language: isEn ? 'en' : 'ar',
                setToastMessage: showToast,
            });
        },
        [categoryBadgeLabel, currentTheme, isEn, showToast]
    );

    const handleSelectAyah = useCallback((sNum: number, aNum: number) => {
        userInteractedRef.current = true;
        setSelectedAyah({ s: sNum, a: aNum });
        setVisibleSurah(sNum);
    }, []);

    const handleClose = () => {
        if (isAudioPlaying && onStopAudio) {
            onStopAudio();
        }
        onClose();
    };

    const emptyFallbackText =
        mode === 'tafseer'
            ? isEn
                ? 'Tafseer is not available for this verse.'
                : 'التفسير غير متوفر لهذه الآية.'
            : mode === 'meanings'
            ? isEn
                ? 'Word meanings are not available for this verse.'
                : 'معاني الكلمات غير متوفرة لهذه الآية.'
            : isEn
            ? 'Translation is not available for this verse.'
            : 'الترجمة غير متوفرة لهذه الآية.';

    const copyTextToClipboard = useCallback(async (text: string): Promise<boolean> => {
        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch {
                // fallback below
            }
        }
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(textarea);
            return ok;
        } catch {
            return false;
        }
    }, []);

    const handleCopyCurrentSurah = useCallback(
        async (targetSurahNum: number, titleText: string, subtitleText: string) => {
            const surahs: any[] = quranData?.surahs || [];
            const surahObj = surahs.find((s, idx) => Number(s?.number || idx + 1) === targetSurahNum);
            const ayahs: any[] = surahObj?.ayahs || [];
            if (ayahs.length === 0) return;

            const parts: string[] = [`${titleText} (${subtitleText})`];
            if (targetSurahNum !== 1 && targetSurahNum !== 9) {
                parts.push('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
            }

            for (let idx = 0; idx < ayahs.length; idx++) {
                const ayah = ayahs[idx];
                const aNum = Number(ayah?.numberInSurah || idx + 1);
                const ayahText = ayah?.text || '';
                const rawBody = getExplanationEntrySync(
                    mode,
                    targetSurahNum,
                    aNum,
                    currentTafseerId,
                    tafseerCacheRef.current
                );
                const cleanExp = cleanExplanationText(rawBody) || emptyFallbackText;
                parts.push(`${ayahText} ﴿${toArabic(aNum)}﴾\n${cleanExp}`);
            }

            const ok = await copyTextToClipboard(parts.join('\n\n'));
            if (ok) {
                setCopiedSurah(true);
                window.setTimeout(() => setCopiedSurah(false), 1800);
                showToast?.(isEn ? 'Current surah copied to clipboard' : 'تم نسخ السورة الحالية بالكامل');
            }
        },
        [copyTextToClipboard, currentTafseerId, emptyFallbackText, isEn, mode, quranData, showToast, tafseerCacheRef]
    );

    const renderItem = useCallback(
        (index: number, item: FlattenedExplanationItem) => {
            const topPad = index === 0 ? (isLandscape ? 'pt-3' : 'pt-3.5') : '';

            if (item.type === 'header') {
                const revLabel =
                    item.revelationType === 'مكية'
                        ? isEn
                            ? 'Meccan'
                            : 'مكية'
                        : item.revelationType === 'مدنية'
                        ? isEn
                            ? 'Medinan'
                            : 'مدنية'
                        : '';
                return (
                    <div className={`max-w-3xl mx-auto ${isLandscape ? 'px-3.5 pb-2.5' : 'px-3.5 sm:px-5 pb-3'} ${topPad}`}>
                        <div
                            className="p-3 sm:p-3.5 rounded-2xl space-y-2 quran-raised-card"
                            style={{
                                backgroundColor: p.headerBg,
                                border: `1.5px solid ${p.headerAccent}44`,
                            }}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                        style={{
                                            backgroundColor: p.headerAccent,
                                            color: p.isDark ? '#000000' : '#ffffff',
                                        }}
                                    >
                                        {isEn ? item.surahNumber : toArabic(item.surahNumber)}
                                    </span>
                                    <span className="text-sm sm:text-base font-black truncate" style={{ color: p.headerAccent }}>
                                        {isEn ? `Surah ${item.enName}` : `سورة ${item.rawArName}`}
                                    </span>
                                </div>
                                <span
                                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg shrink-0"
                                    style={{
                                        backgroundColor: p.isDark ? 'rgba(255,255,255,0.08)' : `${p.headerAccent}14`,
                                        color: p.mutedText,
                                    }}
                                >
                                    {isEn
                                        ? `${item.ayahCount} Verses${revLabel ? ` • ${revLabel}` : ''}`
                                        : `${toArabic(item.ayahCount)} آية${revLabel ? ` • ${revLabel}` : ''}`}
                                </span>
                            </div>

                            {item.surahNumber !== 1 && item.surahNumber !== 9 && (
                                <div
                                    className="pt-2 text-center font-bold"
                                    style={{
                                        borderTop: `1px solid ${hairlineColor}`,
                                        color: p.headerAccent,
                                        fontSize: `${fontSize + 1}px`,
                                        fontFamily: isEn
                                            ? "'Noto Naskh Arabic', 'Amiri', 'Scheherazade New', serif"
                                            : "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                                    }}
                                    dir="rtl"
                                >
                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            const isSelected = selectedAyah.s === item.surahNumber && selectedAyah.a === item.ayahNumber;
            const isThisPlaying = isAudioPlaying && playingAyah?.s === item.surahNumber && playingAyah?.a === item.ayahNumber;
            const copyKey = `${item.surahNumber}-${item.ayahNumber}`;
            const rawBody = getExplanationEntrySync(
                mode,
                item.surahNumber,
                item.ayahNumber,
                currentTafseerId,
                tafseerCacheRef.current
            );
            const cleanBody = cleanExplanationText(rawBody) || emptyFallbackText;

            return (
                <div className={`max-w-3xl mx-auto ${isLandscape ? 'px-3.5 pb-2.5' : 'px-3.5 sm:px-5 pb-3'} ${topPad}`}>
                    <div
                        onClick={() => handleSelectAyah(item.surahNumber, item.ayahNumber)}
                        className={`p-3.5 sm:p-4 rounded-2xl space-y-2.5 cursor-pointer transition-colors ${
                            isSelected ? 'quran-raised-card-selected' : 'quran-raised-card'
                        }`}
                        style={{
                            backgroundColor: isSelected ? p.headerBg : p.cardBg,
                            border: isSelected ? `2px solid ${p.headerAccent}` : `1px solid ${hairlineColor}`,
                        }}
                    >
                        {/* Ayah Toolbar Row (Surah+Ayah Badge + Audio + Share + Copy) */}
                        <div className="flex items-center justify-between gap-2">
                            <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black"
                                style={{
                                    backgroundColor: isSelected
                                        ? p.headerAccent
                                        : p.isDark
                                        ? 'rgba(255,255,255,0.10)'
                                        : `${p.headerAccent}16`,
                                    color: isSelected ? (p.isDark ? '#000000' : '#ffffff') : p.headerAccent,
                                }}
                            >
                                {isEn
                                    ? `${item.enName} • Ayah ${item.ayahNumber}`
                                    : `${item.rawArName} • الآية ${toArabic(item.ayahNumber)}`}
                            </span>

                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {onPlayAudio && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleSelectAyah(item.surahNumber, item.ayahNumber);
                                            if (isThisPlaying) onStopAudio?.();
                                            else onPlayAudio(item.surahNumber, item.ayahNumber);
                                        }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer quran-raised-btn"
                                        style={{
                                            backgroundColor: p.isDark ? 'rgba(255,255,255,0.08)' : p.subtleBg,
                                            color: isThisPlaying ? '#ef4444' : p.headerAccent,
                                        }}
                                        title={isThisPlaying ? (isEn ? 'Stop' : 'إيقاف') : isEn ? 'Listen' : 'استماع'}
                                        aria-label={isThisPlaying ? (isEn ? 'Stop' : 'إيقاف') : isEn ? 'Listen' : 'استماع'}
                                    >
                                        {isThisPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSelectAyah(item.surahNumber, item.ayahNumber);
                                        void handleShareVerse(
                                            item.surahNumber,
                                            item.ayahNumber,
                                            item.rawArName,
                                            item.enName,
                                            item.text,
                                            cleanBody
                                        );
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer quran-raised-btn"
                                    style={{
                                        backgroundColor: p.isDark ? 'rgba(255,255,255,0.08)' : p.subtleBg,
                                        color: p.headerAccent,
                                    }}
                                    title={isEn ? 'Share Ayah' : 'مشاركة الآية'}
                                    aria-label={isEn ? 'Share Ayah' : 'مشاركة الآية'}
                                >
                                    <Share2 size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSelectAyah(item.surahNumber, item.ayahNumber);
                                        handleCopyVerse(item.surahNumber, item.ayahNumber, item.rawArName, item.text, cleanBody);
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer quran-raised-btn"
                                    style={{
                                        backgroundColor: p.isDark ? 'rgba(255,255,255,0.08)' : p.subtleBg,
                                        color: copiedAyahKey === copyKey ? '#16a34a' : p.headerAccent,
                                    }}
                                    title={isEn ? 'Copy' : 'نسخ'}
                                    aria-label={isEn ? 'Copy' : 'نسخ'}
                                >
                                    {copiedAyahKey === copyKey ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Quranic Ayah Text */}
                        <p
                            className="mb-0 text-right select-text leading-[2.0] font-bold"
                            style={{
                                color: p.cardText,
                                fontSize: `${fontSize + 3}px`,
                                fontFamily: isEn
                                    ? "'Noto Naskh Arabic', 'Amiri', 'Scheherazade New', serif"
                                    : "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                            }}
                            dir="rtl"
                        >
                            {item.text} <span style={{ color: p.headerAccent }}>﴿{toArabic(item.ayahNumber)}﴾</span>
                        </p>

                        {/* Explanation / Meanings / Translation Body */}
                        <div className="pt-2.5 select-text" style={{ borderTop: `1px solid ${hairlineColor}` }}>
                            <p
                                className={`mb-0 whitespace-pre-line leading-relaxed font-medium ${
                                    mode === 'translation' ? 'text-left' : 'text-right'
                                }`}
                                style={{
                                    color: p.cardText,
                                    fontSize: `${fontSize}px`,
                                    fontFamily:
                                        mode === 'translation'
                                            ? "'Inter', 'Segoe UI', system-ui, sans-serif"
                                            : p.fontFamily || "'Cairo', sans-serif",
                                    opacity: 0.94,
                                }}
                                dir={mode === 'translation' ? 'ltr' : 'rtl'}
                            >
                                {cleanBody}
                            </p>
                        </div>
                    </div>
                </div>
            );
        },
        [
            copiedAyahKey,
            currentTafseerId,
            dataRevision,
            emptyFallbackText,
            fontSize,
            handleCopyVerse,
            handleSelectAyah,
            handleShareVerse,
            hairlineColor,
            isAudioPlaying,
            isEn,
            isLandscape,
            mode,
            onPlayAudio,
            onStopAudio,
            p,
            playingAyah?.a,
            playingAyah?.s,
            selectedAyah.a,
            selectedAyah.s,
            tafseerCacheRef,
        ]
    );

    if (!isOpen) return null;

    const activeSurahNum = visibleSurah || selectedAyah.s || surahNumber;
    const activeRawArName = stripSurahWord(SURAH_NAMES_AR[activeSurahNum - 1] || '');
    const activeEnName = SURAH_NAMES_EN[activeSurahNum - 1] || activeRawArName;
    const tafseerDisplayName = getTafseerDisplayName(currentTafseerId, isEn ? 'en' : 'ar');

    const headerTitle =
        mode === 'tafseer'
            ? isEn
                ? `Surah ${activeEnName} Tafseer`
                : `تفسير سورة ${activeRawArName}`
            : mode === 'meanings'
            ? isEn
                ? `Surah ${activeEnName} Meanings`
                : `معاني سورة ${activeRawArName}`
            : isEn
            ? `Surah ${activeEnName} Translation`
            : `ترجمة سورة ${activeRawArName}`;

    const headerSubtitle =
        mode === 'tafseer'
            ? tafseerDisplayName
            : mode === 'meanings'
            ? isEn
                ? 'Quran Vocabulary & Meanings'
                : 'معاني مفردات القرآن'
            : isEn
            ? 'English Translation'
            : 'الترجمة الإنجليزية';

    return (
        <div
            dir={dir}
            className={`quran-reader-fullscreen-overlay modal-skinned settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} fixed inset-0 z-[1300] w-full h-[100dvh] flex flex-col overflow-hidden select-none border-0`}
            style={{
                backgroundColor: p.modalBg,
                color: p.modalText,
                fontFamily: p.fontFamily || "'Cairo', sans-serif",
                paddingBottom: 'var(--logical-safe-bottom, var(--app-safe-bottom, env(safe-area-inset-bottom, 0px)))',
            }}
        >
            {/* Full-screen Top Bar with X Exit Button */}
            <div
                className={`shrink-0 ${isLandscape ? 'px-3 pb-2' : 'px-3.5 sm:px-5 pb-2.5'}`}
                style={{
                    borderBottom: `1px solid ${hairlineColor}`,
                    backgroundColor: p.modalBg,
                    paddingTop: isLandscape
                        ? 'calc(0.5rem + var(--logical-safe-top, var(--app-safe-top, env(safe-area-inset-top, 0px))))'
                        : 'calc(0.75rem + var(--logical-safe-top, var(--app-safe-top, env(safe-area-inset-top, 0px))))',
                    paddingLeft: isLandscape ? 'calc(0.75rem + var(--logical-safe-left, 0px))' : undefined,
                    paddingRight: isLandscape ? 'calc(0.75rem + var(--logical-safe-right, 0px))' : undefined,
                }}
            >
                <div
                    className={`${isLandscape ? 'py-2 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between gap-2.5 quran-raised-card border-0`}
                    style={{ backgroundColor: p.headerBg }}
                >
                    <div className="flex flex-col min-w-0 flex-1 text-start">
                        <span
                            className={`${isLandscape ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-black tracking-wide truncate`}
                            style={{ color: p.headerAccent }}
                        >
                            {headerTitle}
                        </span>
                        <span
                            className={`${isLandscape ? 'text-[10px]' : 'text-[11px]'} font-bold truncate`}
                            style={{ color: p.mutedText }}
                        >
                            {headerSubtitle}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => void handleCopyCurrentSurah(activeSurahNum, headerTitle, headerSubtitle)}
                            className={`${isLandscape ? 'w-8 h-8' : 'w-9 h-9'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
                            style={{
                                backgroundColor: p.closeBg,
                                color: copiedSurah ? '#16a34a' : p.headerAccent,
                            }}
                            title={isEn ? 'Copy current surah' : 'نسخ السورة الحالية'}
                            aria-label={isEn ? 'Copy current surah' : 'نسخ السورة الحالية'}
                        >
                            {copiedSurah ? <Check size={isLandscape ? 15 : 17} /> : <Copy size={isLandscape ? 15 : 17} />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFontSize((prev) => (prev >= 27 ? 15 : prev + 2))}
                            className={`${isLandscape ? 'w-8 h-8' : 'w-9 h-9'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            title={isEn ? 'Change font size' : 'تكبير الخط'}
                            aria-label={isEn ? 'Change font size' : 'تكبير الخط'}
                        >
                            <ZoomIn size={isLandscape ? 15 : 17} />
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`${isLandscape ? 'w-8 h-8' : 'w-9 h-9'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            title={isEn ? 'Close' : 'إغلاق'}
                            aria-label={isEn ? 'Close' : 'إغلاق'}
                        >
                            <X size={isLandscape ? 16 : 18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Full-screen Virtualized All-Quran Scrollable Content */}
            <div className="flex-1 min-h-0 relative">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div
                            className="w-10 h-10 border-4 rounded-full animate-spin"
                            style={{ borderColor: hairlineColor, borderTopColor: p.headerAccent }}
                        />
                        <p className="text-sm font-bold opacity-80" style={{ color: p.mutedText }}>
                            {isEn ? 'Loading...' : 'جاري التحميل...'}
                        </p>
                    </div>
                ) : loadError ? (
                    <div className="max-w-3xl mx-auto p-5">
                        <div
                            className="p-6 rounded-2xl text-center space-y-3 quran-raised-card"
                            style={{ backgroundColor: p.cardBg, border: `1px solid ${hairlineColor}` }}
                        >
                            <p className="text-sm font-bold" style={{ color: p.cardText }}>
                                {isEn
                                    ? 'Unable to load content. Please try again.'
                                    : 'تعذر تحميل المحتوى. يرجى المحاولة مرة أخرى.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => setReloadNonce((n) => n + 1)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 quran-raised-btn"
                                style={{ backgroundColor: p.headerBg, color: p.headerAccent }}
                            >
                                <RefreshCw size={14} />
                                <span>{isEn ? 'Retry' : 'إعادة المحاولة'}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <Virtuoso
                        ref={virtuosoRef}
                        data={flattenedItems}
                        computeItemKey={(_, item) => item.key}
                        initialTopMostItemIndex={{ index: initialIndex, align: 'center' }}
                        defaultItemHeight={210}
                        increaseViewportBy={{ top: 550, bottom: 750 }}
                        className="custom-scrollbar"
                        style={{ height: '100%', width: '100%' }}
                        onWheel={() => {
                            userInteractedRef.current = true;
                        }}
                        onTouchStart={() => {
                            userInteractedRef.current = true;
                        }}
                        rangeChanged={(range) => {
                            const midIdx = Math.min(
                                flattenedItems.length - 1,
                                Math.max(0, Math.floor((range.startIndex + range.endIndex) / 2))
                            );
                            const midItem = flattenedItems[midIdx];
                            if (midItem?.surahNumber && midItem.surahNumber !== visibleSurah) {
                                setVisibleSurah(midItem.surahNumber);
                            }
                            if (mode === 'tafseer' && currentTafseerId !== 'ar.jalalayn') {
                                const startSurah = flattenedItems[range.startIndex]?.surahNumber;
                                const endSurah = flattenedItems[range.endIndex]?.surahNumber;
                                if (startSurah) void ensureRemoteTafseerForSurah(startSurah);
                                if (midItem?.surahNumber && midItem.surahNumber !== startSurah) {
                                    void ensureRemoteTafseerForSurah(midItem.surahNumber);
                                }
                                if (endSurah && endSurah !== midItem?.surahNumber) {
                                    void ensureRemoteTafseerForSurah(endSurah);
                                }
                            }
                        }}
                        itemContent={renderItem}
                    />
                )}
            </div>
        </div>
    );
};

export default SurahExplanationModal;
