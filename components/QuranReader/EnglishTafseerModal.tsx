import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Copy, Check, ZoomIn, RefreshCw, Layers, ChevronDown, Share2, Volume2, VolumeX } from 'lucide-react';
import { SURAH_NAMES_EN, toArabic } from './constants';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { resolveQuranModalPalette } from './modalThemeUtils';

export interface EnglishTafseerModalProps {
    isOpen: boolean;
    onClose: () => void;
    surahNumber: number;
    ayahNumber: number;
    currentTheme?: any;
    isLandscape?: boolean;
    quranData?: any;
    readingMode?: string;
    onPlayAudio?: (s: number, a: number) => void;
    onStopAudio?: () => void;
    isAudioPlaying?: boolean;
}

export const ENGLISH_TAFSIR_EDITIONS = [
    { id: 169, name: 'Ibn Kathir', fullName: 'Tafsir Ibn Kathir (Abridged)', slug: 'en-tafisr-ibn-kathir' },
    { id: 168, name: "Ma'arif al-Qur'an", fullName: "Ma'arif al-Qur'an (Mufti Shafi)", slug: 'en-tafsir-maarif-ul-quran' },
    { id: 817, name: 'Tazkirul Quran', fullName: 'Tazkirul Quran (Wahiduddin Khan)', slug: 'tazkirul-quran-en' }
];

// Helper to completely purge Arabic text blocks and characters when in Translation mode
const cleanArabicFromTafsir = (html: string): string => {
    if (!html) return '';
    // 1. Remove paragraphs, divs, blockquotes where content is solely or predominantly Arabic
    let cleaned = html.replace(/<(p|div|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi, (match, _tag, inner) => {
        const textOnly = inner.replace(/<[^>]+>/g, '').trim();
        if (!textOnly) return '';
        const arCount = (textOnly.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
        const enCount = (textOnly.match(/[a-zA-Z]/g) || []).length;
        if (arCount > 0 && enCount === 0) return '';
        if (arCount > enCount && arCount > 4) return '';
        return match;
    });
    // 2. Remove spans/elements explicitly marked as RTL or Arabic
    cleaned = cleaned.replace(/<[a-z0-9]+[^>]*dir=["']rtl["'][^>]*>[\s\S]*?<\/[a-z0-9]+>/gi, '');
    cleaned = cleaned.replace(/<[a-z0-9]+[^>]*class=["'][^"']*arabic[^"']*["'][^>]*>[\s\S]*?<\/[a-z0-9]+>/gi, '');
    // 3. Remove inline spans with Arabic text
    cleaned = cleaned.replace(/<span[^>]*>[\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u064B-\u065F\u0670-\u06D3\d﴿﴾—\-]+<\/span>/gi, '');
    // 4. Remove any remaining Arabic word sequences (e.g. isolated Quranic phrases)
    cleaned = cleaned.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]{2,}/g, '');
    return cleaned;
};

// In-memory cache across modal openings for instant loading
const englishTafsirCache: Record<string, string> = {};
let cachedEnJson: any[] | null = null;

const EnglishTafseerModal: React.FC<EnglishTafseerModalProps> = React.memo(({
    isOpen,
    onClose,
    surahNumber,
    ayahNumber,
    currentTheme,
    isLandscape = false,
    readingMode = 'bilingual',
    onPlayAudio,
    onStopAudio,
    isAudioPlaying
}) => {
    const isTranslationOnly = readingMode === 'translation';
    const [selectedEdition, setSelectedEdition] = useState<number>(169);
    const [isLoading, setIsLoading] = useState<boolean>(() => !englishTafsirCache[`169_${surahNumber}_${ayahNumber}`]);
    const [tafsirHtml, setTafsirHtml] = useState<string>(() => englishTafsirCache[`169_${surahNumber}_${ayahNumber}`] || '');
    const [error, setError] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState<number>(() => {
        const saved = localStorage.getItem('english_tafsir_font_size');
        return saved ? parseFloat(saved) : 16;
    });
    const [copied, setCopied] = useState<boolean>(false);
    const [verseText, setVerseText] = useState<{ ar: string; en: string }>(() => {
        const v = cachedEnJson?.[surahNumber - 1]?.verses?.[ayahNumber - 1];
        return v ? { ar: v.text || '', en: v.translation || '' } : { ar: '', en: '' };
    });
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = subscribeTTS((playingText) => {
            setIsPlaying(Boolean(playingText));
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!isOpen) return;
        const unregister = registerBackInterceptor(() => {
            onCloseRef.current();
            return true;
        });
        return unregister;
    }, [isOpen]);

    // Load verse text from /en.json
    useEffect(() => {
        if (!isOpen) return;

        if (cachedEnJson && cachedEnJson[surahNumber - 1]) {
            const verseObj = cachedEnJson[surahNumber - 1].verses?.[ayahNumber - 1];
            if (verseObj) {
                setVerseText({
                    ar: verseObj.text || '',
                    en: verseObj.translation || ''
                });
            }
            return;
        }

        const loadVerse = async () => {
            try {
                const res = await fetch('/en.json');
                cachedEnJson = await res.json();
                if (cachedEnJson && cachedEnJson[surahNumber - 1]) {
                    const surahObj = cachedEnJson[surahNumber - 1];
                    const verseObj = surahObj.verses?.[ayahNumber - 1];
                    if (verseObj) {
                        setVerseText({
                            ar: verseObj.text || '',
                            en: verseObj.translation || ''
                        });
                    }
                }
            } catch (e) {
                console.warn('Could not load verse text for English Tafsir banner', e);
            }
        };

        loadVerse();
    }, [isOpen, surahNumber, ayahNumber]);

    // Fetch Tafsir for surahNumber, ayahNumber and selectedEdition
    const fetchTafsir = useCallback(async (editionId: number) => {
        const cacheKey = `${editionId}_${surahNumber}_${ayahNumber}`;
        setError(null);

        if (englishTafsirCache[cacheKey]) {
            setTafsirHtml(englishTafsirCache[cacheKey]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // First attempt: API via qurancdn
            const primaryUrl = `https://api.qurancdn.com/api/qdc/tafsirs/${editionId}/by_ayah/${surahNumber}:${ayahNumber}`;
            let res = await fetch(primaryUrl);
            
            // Fallback attempt: api.quran.com
            if (!res.ok) {
                const fallbackUrl = `https://api.quran.com/api/v4/tafsirs/${editionId}/by_ayah/${surahNumber}:${ayahNumber}`;
                res = await fetch(fallbackUrl);
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            const text = data?.tafsir?.text;
            if (text && typeof text === 'string' && text.trim().length > 0) {
                englishTafsirCache[cacheKey] = text;
                setTafsirHtml(text);
            } else {
                setTafsirHtml('<p class="italic text-gray-500">No commentary found for this ayah in the selected edition.</p>');
            }
        } catch (err: any) {
            console.error('Error fetching English Tafsir:', err);
            setError('Could not load commentary. Please check your internet connection.');
        } finally {
            setIsLoading(false);
        }
    }, [surahNumber, ayahNumber]);

    useEffect(() => {
        if (isOpen) {
            fetchTafsir(selectedEdition);
        }
    }, [isOpen, selectedEdition, fetchTafsir]);

    const handleCopy = () => {
        const surahName = SURAH_NAMES_EN[surahNumber - 1] || `Surah ${surahNumber}`;
        const editionObj = ENGLISH_TAFSIR_EDITIONS.find(e => e.id === selectedEdition);
        // Strip HTML tags for clipboard plain text
        const tmp = document.createElement('div');
        tmp.innerHTML = tafsirHtml;
        const cleanText = tmp.textContent || tmp.innerText || '';

        const fullCopy = isTranslationOnly
            ? `[${editionObj?.fullName || 'English Tafsir'}]\nSurah ${surahName} (${surahNumber}:${ayahNumber})\n\nVerse Translation:\n"${verseText.en}"\n\nCommentary:\n${cleanText.trim()}`
            : `[${editionObj?.fullName || 'English Tafsir'}]\nSurah ${surahName} (${surahNumber}:${ayahNumber})\n\nVerse:\n${verseText.ar} (${ayahNumber})\n\nVerse Translation:\n"${verseText.en}"\n\nCommentary:\n${cleanText.trim()}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullCopy).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const handleFontSizeChange = (delta: number) => {
        setFontSize(prev => {
            const next = Math.min(Math.max(prev + delta, 13), 26);
            localStorage.setItem('english_tafsir_font_size', String(next));
            return next;
        });
    };

    if (!isOpen) return null;

    const surahNameEn = SURAH_NAMES_EN[surahNumber - 1] || `Surah ${surahNumber}`;
    const activeEdition = ENGLISH_TAFSIR_EDITIONS.find(e => e.id === selectedEdition) || ENGLISH_TAFSIR_EDITIONS[0];

    const p = resolveQuranModalPalette(currentTheme);
    const accentColor = p.accentColor;

    const handleToggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFontSize((prev) => (prev >= 26 ? 14 : prev + 3));
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const tmp = document.createElement('div');
        tmp.innerHTML = tafsirHtml;
        const cleanText = tmp.textContent || tmp.innerText || '';
        const fullShareText = `Surah ${surahNameEn} (${surahNumber}:${ayahNumber})\n\nVerse: "${verseText.en}"\n\nCommentary (${activeEdition.name}):\n${cleanText.trim()}`;

        await shareAsImage({
            text: fullShareText,
            title: `English Tafseer - ${surahNameEn}`,
            source: `${surahNameEn} ${surahNumber}:${ayahNumber}`,
            category: 'English Commentary',
            isEn: true,
            language: 'en',
        });
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            stopTTS();
            setIsPlaying(false);
            return;
        }
        const tmp = document.createElement('div');
        tmp.innerHTML = tafsirHtml;
        const cleanText = tmp.textContent || tmp.innerText || '';
        const textToRead = verseText.en ? `${verseText.en}. ${cleanText}` : cleanText;
        playTTS(textToRead, { isEn: true });
        setIsPlaying(true);
    };

    return (
        <div 
            className={`fixed inset-0 z-[1300] bg-black/70 flex flex-col select-none ${isLandscape ? 'justify-center items-center p-2.5' : 'justify-end'}`}
            onClick={onClose}
            dir="ltr"
        >
            <div 
                className={`zoom-modal-sheet modal-skinned settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} flex flex-col overflow-hidden relative shadow-2xl border-0 ${
                    isLandscape ? 'w-[62%] max-w-[430px] max-h-[86%] rounded-3xl' : 'w-full max-w-xl mx-auto rounded-t-[32px] max-h-[88dvh]'
                }`}
                style={{ 
                    backgroundColor: p.modalBg, 
                    color: p.modalText,
                    border: 'none',
                    outline: 'none',
                    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Canonical Raised 3D Header */}
                <div className={`${isLandscape ? 'pt-2.5 px-3 pb-1.5' : 'pt-3 px-4 sm:px-5 pb-2'} shrink-0 flex flex-col`}>
                    {!isLandscape && (
                        <div className="app-3d-drag-handle w-12 h-1.5 rounded-full mb-2.5 bg-slate-300/80 dark:bg-zinc-600/80 mx-auto" />
                    )}
                    
                    <div 
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between gap-2 quran-raised-card border-0`}
                        style={{ backgroundColor: p.headerBg }}
                    >
                        <div className="flex flex-col min-w-0 text-left">
                            <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide truncate`} style={{ color: p.headerAccent }}>
                                English Commentary
                            </span>
                            <span className={`${isLandscape ? 'text-[10px]' : 'text-[11px]'} font-bold truncate`} style={{ color: p.mutedText }}>
                                Surah {surahNameEn} ({surahNumber}:{ayahNumber})
                            </span>
                        </div>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label="Close"
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>
                </div>

                {/* Edition Selector Tabs */}
                <div 
                    className={`${isLandscape ? 'px-3 pt-1 pb-2 gap-1.5' : 'px-4 sm:px-5 pt-1.5 pb-3.5 gap-2.5'} flex items-center overflow-x-auto custom-scrollbar shrink-0`}
                >
                    <span className="text-[11px] font-bold mr-0.5 flex items-center gap-1 shrink-0" style={{ color: p.mutedText }}>
                        <Layers size={12} className="quran-3d-icon" />
                        Edition:
                    </span>
                    {ENGLISH_TAFSIR_EDITIONS.map(ed => {
                        const isSelected = selectedEdition === ed.id;
                        return (
                            <button
                                key={ed.id}
                                type="button"
                                onClick={() => setSelectedEdition(ed.id)}
                                className={`${isLandscape ? 'text-[11px] px-2.5 py-1.5 rounded-xl' : 'text-xs px-3.5 py-2 rounded-2xl'} font-bold shrink-0 select-none border-0 cursor-pointer ${
                                    isSelected 
                                        ? 'quran-raised-btn-selected' 
                                        : 'quran-raised-btn'
                                }`}
                                style={{
                                    backgroundColor: isSelected ? undefined : p.cardBg,
                                    color: isSelected ? p.selectedText : p.cardText
                                }}
                            >
                                {ed.name}
                            </button>
                        );
                    })}
                </div>

                {/* Scrollable Content Area */}
                <div className={`${isLandscape ? 'px-3 pt-1 pb-3 space-y-2.5' : 'px-4 sm:px-5 pt-1 pb-5 space-y-4'} overflow-y-auto flex-1 min-h-0 custom-scrollbar`}>
                    {/* Verse Citation Banner */}
                    {((!isTranslationOnly && verseText.ar) || verseText.en) && (
                        <div 
                            className="p-4 rounded-2xl border-0 quran-raised-card text-left"
                            style={{ 
                                backgroundColor: p.cardBg,
                                color: p.cardText
                            }}
                        >
                            {!isTranslationOnly && verseText.ar && (
                                <p 
                                    className="text-right text-base sm:text-lg mb-1.5 leading-relaxed select-text"
                                    style={{ fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" }}
                                    dir="rtl"
                                >
                                    {verseText.ar} <span style={{ color: p.headerAccent }}>﴿{toArabic(ayahNumber)}﴾</span>
                                </p>
                            )}
                            {verseText.en && (
                                <p className="text-xs sm:text-sm font-serif italic opacity-85 leading-normal select-text">
                                    "{verseText.en}"
                                </p>
                            )}
                        </div>
                    )}

                    {/* Tafsir Content inside Raised 3D Card */}
                    <div 
                        className="p-4 sm:p-5 rounded-2xl border-0 quran-raised-card"
                        style={{
                            backgroundColor: p.cardBg,
                            color: p.cardText
                        }}
                    >
                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                                <div 
                                    className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
                                    style={{ borderColor: `${p.headerAccent}33`, borderTopColor: p.headerAccent }}
                                />
                                <p className="text-sm font-bold opacity-75">Loading English Tafsir...</p>
                            </div>
                        ) : error ? (
                            <div className="py-10 flex flex-col items-center justify-center text-center gap-3 max-w-sm mx-auto">
                                <p className="text-sm font-bold text-red-500">{error}</p>
                                <button 
                                    type="button"
                                    onClick={() => fetchTafsir(selectedEdition)}
                                    className="px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border-0 quran-raised-btn-selected cursor-pointer"
                                    style={{ color: p.selectedText }}
                                >
                                    <RefreshCw size={14} className="quran-3d-icon" />
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div 
                                className="english-tafsir-prose select-text text-left leading-relaxed"
                                style={{ 
                                    fontSize: `${fontSize}px`,
                                    fontFamily: "'Merriweather', 'EB Garamond', Georgia, serif",
                                    lineHeight: '1.8',
                                    color: p.cardText
                                }}
                                dangerouslySetInnerHTML={{ __html: isTranslationOnly ? cleanArabicFromTafsir(tafsirHtml) : tafsirHtml }}
                            />
                        )}
                    </div>
                </div>

                {/* Sculpted 3D Action Bar */}
                <div 
                    data-toast-bottom-bar="true"
                    className={`${isLandscape ? 'px-3 pt-2 pb-2.5 gap-3' : 'px-4 pt-3.5 pb-4 modal-sheet-safe-bottom gap-3.5 sm:gap-4'} shrink-0 flex items-center justify-center zoom-modal-action-bar-3d`}
                    dir="rtl"
                    style={{
                        backgroundColor: p.modalBg
                    }}
                >
                    {/* 1. Audio / Recitation Play Button (RIGHTMOST in RTL) */}
                    <button
                        type="button"
                        onClick={handlePlayAudio}
                        className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer shrink-0 border-0 quran-raised-btn ${
                            isPlaying ? 'ring-2 ring-red-400/80 animate-pulse' : ''
                        }`}
                        style={{
                            backgroundColor: isPlaying ? '#dc2626' : p.closeBg,
                            color: isPlaying ? '#ffffff' : p.headerAccent
                        }}
                        title={isPlaying ? 'Stop audio' : 'Play audio'}
                    >
                        {isPlaying ? (
                            <VolumeX className={`${isLandscape ? 'w-4 h-4' : 'w-5 h-5'} text-white animate-pulse`} />
                        ) : (
                            <Volume2 className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: p.headerAccent, stroke: p.headerAccent }} />
                        )}
                    </button>

                    {/* 2. Share Button */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer shrink-0 border-0 quran-raised-btn`}
                        style={{
                            backgroundColor: p.closeBg,
                            color: p.headerAccent
                        }}
                        title="Share image"
                    >
                        <Share2 className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: p.headerAccent, stroke: p.headerAccent }} />
                    </button>

                    {/* 3. Copy Button */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer shrink-0 border-0 quran-raised-btn`}
                        style={{
                            backgroundColor: copied ? '#10b981' : p.closeBg,
                            color: copied ? '#ffffff' : p.headerAccent
                        }}
                        title="Copy commentary"
                    >
                        {copied ? (
                            <Check className={`${isLandscape ? 'w-4 h-4' : 'w-5 h-5'} text-white stroke-[2.5]`} />
                        ) : (
                            <Copy className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: p.headerAccent, stroke: p.headerAccent }} />
                        )}
                    </button>

                    {/* 4. Zoom Button */}
                    <button
                        type="button"
                        onClick={handleToggleZoom}
                        className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer shrink-0 border-0 quran-raised-btn`}
                        style={{
                            backgroundColor: p.closeBg,
                            color: p.headerAccent
                        }}
                        title="Enlarge font size"
                    >
                        <ZoomIn className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: p.headerAccent, stroke: p.headerAccent }} />
                    </button>

                    {/* 5. Chevron Down / Hide Modal Button (LEFTMOST in RTL) */}
                    <button
                        type="button"
                        onClick={onClose}
                        className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer shrink-0 border-0 quran-raised-btn`}
                        style={{
                            backgroundColor: p.closeBg,
                            color: p.headerAccent
                        }}
                        title="Hide commentary"
                    >
                        <ChevronDown className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: p.headerAccent, stroke: p.headerAccent }} />
                    </button>
                </div>
            </div>

            <style>{`
                .english-tafsir-prose h2,
                .english-tafsir-prose h3,
                .english-tafsir-prose h4 {
                    font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
                    font-weight: 800;
                    margin-top: 1.5rem;
                    margin-bottom: 0.6rem;
                    color: inherit;
                    opacity: 0.95;
                    line-height: 1.3;
                }
                .english-tafsir-prose h2 { font-size: 1.25em; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 0.3rem; }
                .english-tafsir-prose h3 { font-size: 1.15em; }
                .english-tafsir-prose h4 { font-size: 1.05em; }
                .english-tafsir-prose p {
                    margin-bottom: 1rem;
                    text-align: justify;
                }
                .english-tafsir-prose blockquote {
                    border-left: 3px solid ${accentColor};
                    padding-left: 1rem;
                    margin: 1rem 0;
                    font-style: italic;
                    opacity: 0.85;
                }
                ${isTranslationOnly ? `
                .english-tafsir-prose [dir="rtl"],
                .english-tafsir-prose .arabic,
                .english-tafsir-prose [lang="ar"] {
                    display: none !important;
                }
                ` : `
                .english-tafsir-prose [dir="rtl"],
                .english-tafsir-prose .arabic {
                    font-family: var(--font-amiri), serif !important;
                    font-size: 1.2em;
                    line-height: 2.2;
                    text-align: right;
                    direction: rtl;
                    display: block;
                    margin: 0.5rem 0;
                }
                `}
                .english-tafsir-prose ul, .english-tafsir-prose ol {
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .english-tafsir-prose li {
                    margin-bottom: 0.3rem;
                }
            `}</style>
        </div>
    );
});

export default EnglishTafseerModal;
