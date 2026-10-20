import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, BookOpen, Copy, Check, ZoomIn, ZoomOut, RefreshCw, Layers } from 'lucide-react';
import { SURAH_NAMES_EN, toArabic } from './constants';

export interface EnglishTafseerModalProps {
    isOpen: boolean;
    onClose: () => void;
    surahNumber: number;
    ayahNumber: number;
    currentTheme?: any;
    isLandscape?: boolean;
    quranData?: any;
    readingMode?: string;
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

const EnglishTafseerModal: React.FC<EnglishTafseerModalProps> = ({
    isOpen,
    onClose,
    surahNumber,
    ayahNumber,
    currentTheme,
    isLandscape = false,
    readingMode = 'bilingual'
}) => {
    const isTranslationOnly = readingMode === 'translation';
    const [selectedEdition, setSelectedEdition] = useState<number>(169);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [tafsirHtml, setTafsirHtml] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState<number>(() => {
        const saved = localStorage.getItem('english_tafsir_font_size');
        return saved ? parseFloat(saved) : 16;
    });
    const [copied, setCopied] = useState<boolean>(false);
    const [verseText, setVerseText] = useState<{ ar: string; en: string }>({ ar: '', en: '' });

    // Load verse text from /en.json
    useEffect(() => {
        if (!isOpen) return;

        const loadVerse = async () => {
            try {
                if (!cachedEnJson) {
                    const res = await fetch('/en.json');
                    cachedEnJson = await res.json();
                }
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
        setIsLoading(true);
        setError(null);
        const cacheKey = `${editionId}_${surahNumber}_${ayahNumber}`;

        if (englishTafsirCache[cacheKey]) {
            setTafsirHtml(englishTafsirCache[cacheKey]);
            setIsLoading(false);
            return;
        }

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

    const accentColor = currentTheme?.accent || '#10b981';
    const bgColor = currentTheme?.bg || '#ffffff';
    const textColor = currentTheme?.text || '#000000';
    const cardBg = currentTheme?.cardBg || '#f8fafc';
    const cardBorder = currentTheme?.cardBorder || '#e2e8f0';

    return (
        <div 
            className={`fixed inset-0 z-[1300] bg-black/60 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-1' : 'p-3'} animate-fadeIn`}
            onClick={onClose}
            dir="ltr"
        >
            <div 
                className={`w-full ${isLandscape ? 'max-w-4xl h-[95vh] rounded-xl' : 'max-w-2xl h-[90vh] max-h-[850px] rounded-2xl'} shadow-2xl flex flex-col overflow-hidden animate-modal-enter border-2`}
                style={{ 
                    backgroundColor: bgColor, 
                    color: textColor,
                    borderColor: accentColor,
                    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div 
                    className="p-3.5 border-b flex items-center justify-between shrink-0"
                    style={{ borderColor: cardBorder }}
                >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                        >
                            <BookOpen size={18} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-extrabold text-sm sm:text-base leading-tight truncate">
                                    Surah {surahNameEn}
                                </h3>
                                <span 
                                    className="text-xs px-2 py-0.5 rounded-full font-bold shadow-xs"
                                    style={{ backgroundColor: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}33` }}
                                >
                                    Ayah {ayahNumber}
                                </span>
                            </div>
                            <span className="text-[11px] opacity-70 truncate">
                                {activeEdition.fullName}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Font resize buttons */}
                        <div className="flex items-center rounded-lg border p-0.5" style={{ borderColor: cardBorder }}>
                            <button 
                                onClick={() => handleFontSizeChange(-1.5)}
                                className="px-2 py-1 rounded hover:opacity-70 transition text-xs font-bold"
                                title="Decrease font size"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <span className="text-[11px] px-1 font-mono opacity-80 select-none">
                                {Math.round(fontSize)}
                            </span>
                            <button 
                                onClick={() => handleFontSizeChange(1.5)}
                                className="px-2 py-1 rounded hover:opacity-70 transition text-xs font-bold"
                                title="Increase font size"
                            >
                                <ZoomIn size={14} />
                            </button>
                        </div>

                        {/* Copy button */}
                        <button 
                            onClick={handleCopy}
                            className="p-1.5 rounded-lg border hover:opacity-80 transition"
                            style={{ borderColor: cardBorder }}
                            title="Copy Commentary"
                        >
                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>

                        {/* Close button */}
                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Edition Selector Tabs */}
                <div 
                    className="px-3.5 py-2 border-b flex items-center gap-1.5 overflow-x-auto scrollbar-hide shrink-0"
                    style={{ backgroundColor: `${cardBg}80`, borderColor: cardBorder }}
                >
                    <span className="text-[11px] font-bold opacity-60 mr-1 flex items-center gap-1 shrink-0">
                        <Layers size={13} />
                        Edition:
                    </span>
                    {ENGLISH_TAFSIR_EDITIONS.map(ed => {
                        const isSelected = selectedEdition === ed.id;
                        return (
                            <button
                                key={ed.id}
                                onClick={() => setSelectedEdition(ed.id)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 select-none ${
                                    isSelected 
                                        ? 'shadow-sm text-white' 
                                        : 'hover:opacity-80 opacity-70'
                                }`}
                                style={{
                                    backgroundColor: isSelected ? accentColor : 'transparent',
                                    border: `1px solid ${isSelected ? accentColor : cardBorder}`
                                }}
                            >
                                {ed.name}
                            </button>
                        );
                    })}
                </div>

                {/* Verse Citation Banner */}
                {((!isTranslationOnly && verseText.ar) || verseText.en) && (
                    <div 
                        className="mx-3.5 mt-3 p-3 rounded-xl border shrink-0 text-left"
                        style={{ 
                            backgroundColor: `${cardBg}`,
                            borderColor: `${accentColor}33`,
                            borderLeftWidth: '4px',
                            borderLeftColor: accentColor
                        }}
                    >
                        {!isTranslationOnly && verseText.ar && (
                            <p 
                                className="text-right text-base sm:text-lg mb-1 leading-relaxed opacity-90 select-text"
                                style={{ fontFamily: "var(--font-amiri), serif" }}
                                dir="rtl"
                            >
                                {verseText.ar} ﴿{toArabic(ayahNumber)}﴾
                            </p>
                        )}
                        {verseText.en && (
                            <p className="text-xs sm:text-sm font-serif italic opacity-85 leading-normal select-text">
                                "{verseText.en}"
                            </p>
                        )}
                    </div>
                )}

                {/* Tafsir Content */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                            <div 
                                className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
                                style={{ borderColor: `${accentColor}33`, borderTopColor: accentColor }}
                            />
                            <p className="text-sm font-bold opacity-75">Loading English Tafsir...</p>
                            <span className="text-xs opacity-50">Fetching {activeEdition.name}</span>
                        </div>
                    ) : error ? (
                        <div className="py-14 flex flex-col items-center justify-center text-center gap-3 max-w-sm mx-auto">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xl">
                                ⚠️
                            </div>
                            <p className="text-sm font-bold text-red-500">{error}</p>
                            <button 
                                onClick={() => fetchTafsir(selectedEdition)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 active:scale-95 transition"
                                style={{ backgroundColor: accentColor }}
                            >
                                <RefreshCw size={14} />
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div 
                            className="english-tafsir-prose select-text text-left leading-relaxed"
                            style={{ 
                                fontSize: `${fontSize}px`,
                                fontFamily: "'Merriweather', 'EB Garamond', Georgia, serif",
                                lineHeight: '1.8'
                            }}
                            dangerouslySetInnerHTML={{ __html: isTranslationOnly ? cleanArabicFromTafsir(tafsirHtml) : tafsirHtml }}
                        />
                    )}
                </div>

                {/* Footer */}
                <div 
                    className="p-2.5 px-4 border-t flex items-center justify-between shrink-0"
                    style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                >
                    <span className="text-[11px] opacity-60">
                        {surahNameEn} {surahNumber}:{ayahNumber} • {activeEdition.name}
                    </span>
                    <button 
                        onClick={onClose}
                        className="px-5 py-1.5 rounded-xl font-bold text-xs text-white shadow-sm transition active:scale-95"
                        style={{ backgroundColor: accentColor }}
                    >
                        Close
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
};

export default EnglishTafseerModal;
