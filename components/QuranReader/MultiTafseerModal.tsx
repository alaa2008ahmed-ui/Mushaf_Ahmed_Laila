import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { TAFSEERS, getTafseerDisplayName, SURAH_NAMES_AR, SURAH_NAMES_EN, toArabic } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

interface MultiTafseerModalProps {
    isOpen: boolean;
    surahNumber: number;
    ayahNumber: number;
    surahName?: string;
    ayahText?: string;
    currentTheme: any;
    onClose: () => void;
    onBack?: () => void;
    isLandscape?: boolean;
    onPlayAudio?: (s: number, a: number) => void;
    onStopAudio?: () => void;
    isAudioPlaying?: boolean;
    showToast?: (msg: string) => void;
}

export const MultiTafseerModal: React.FC<MultiTafseerModalProps> = ({
    isOpen,
    surahNumber,
    ayahNumber,
    surahName,
    ayahText,
    currentTheme,
    onClose,
    onBack,
    isLandscape = false,
    onPlayAudio,
    onStopAudio,
    isAudioPlaying,
    showToast
}) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';

    const [tafseer1Id, setTafseer1Id] = useState<string>('ar.jalalayn');
    const [tafseer2Id, setTafseer2Id] = useState<string>('ar.muyassar');

    const [text1, setText1] = useState<string>('');
    const [text2, setText2] = useState<string>('');

    const [loading1, setLoading1] = useState<boolean>(false);
    const [loading2, setLoading2] = useState<boolean>(false);

    const [fontSize, setFontSize] = useState<number>(18);
    const [copiedAll, setCopiedAll] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const cacheRef = useRef<Record<string, any[]>>({});

    useEffect(() => {
        const unsubscribe = subscribeTTS((playingText) => {
            setIsPlaying(Boolean(playingText));
        });
        return () => {
            unsubscribe();
        };
    }, []);

    // Fetch Tafseer 1
    useEffect(() => {
        if (!isOpen || !surahNumber) return;

        let isMounted = true;
        const fetchTafseer1 = async () => {
            setLoading1(true);
            const cacheKey = `${surahNumber}_${tafseer1Id}`;
            if (cacheRef.current[cacheKey]) {
                const ayahObj = cacheRef.current[cacheKey][ayahNumber - 1];
                if (isMounted) {
                    setText1(ayahObj?.text || ayahObj?.explanation || '');
                    setLoading1(false);
                }
                return;
            }

            try {
                if (tafseer1Id === 'ar.jalalayn') {
                    const res = await fetch('/assets/data/ar.jalalayn.json');
                    const data = await res.json();
                    if (data?.code === 200 && data?.data?.surahs) {
                        const surah = data.data.surahs[surahNumber - 1];
                        cacheRef.current[cacheKey] = surah?.ayahs || [];
                        if (isMounted) {
                            setText1(surah?.ayahs?.[ayahNumber - 1]?.text || '');
                        }
                    }
                } else {
                    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${tafseer1Id}`);
                    const data = await res.json();
                    if (data?.code === 200 && data?.data?.ayahs) {
                        cacheRef.current[cacheKey] = data.data.ayahs;
                        if (isMounted) {
                            setText1(data.data.ayahs[ayahNumber - 1]?.text || '');
                        }
                    }
                }
            } catch (err) {
                if (isMounted) setText1(isEn ? 'Failed to load Tafseer.' : 'تعذر تحميل التفسير.');
            } finally {
                if (isMounted) setLoading1(false);
            }
        };

        fetchTafseer1();
        return () => { isMounted = false; };
    }, [isOpen, surahNumber, ayahNumber, tafseer1Id, isEn]);

    // Fetch Tafseer 2
    useEffect(() => {
        if (!isOpen || !surahNumber) return;

        let isMounted = true;
        const fetchTafseer2 = async () => {
            setLoading2(true);
            const cacheKey = `${surahNumber}_${tafseer2Id}`;
            if (cacheRef.current[cacheKey]) {
                const ayahObj = cacheRef.current[cacheKey][ayahNumber - 1];
                if (isMounted) {
                    setText2(ayahObj?.text || ayahObj?.explanation || '');
                    setLoading2(false);
                }
                return;
            }

            try {
                if (tafseer2Id === 'ar.jalalayn') {
                    const res = await fetch('/assets/data/ar.jalalayn.json');
                    const data = await res.json();
                    if (data?.code === 200 && data?.data?.surahs) {
                        const surah = data.data.surahs[surahNumber - 1];
                        cacheRef.current[cacheKey] = surah?.ayahs || [];
                        if (isMounted) {
                            setText2(surah?.ayahs?.[ayahNumber - 1]?.text || '');
                        }
                    }
                } else {
                    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${tafseer2Id}`);
                    const data = await res.json();
                    if (data?.code === 200 && data?.data?.ayahs) {
                        cacheRef.current[cacheKey] = data.data.ayahs;
                        if (isMounted) {
                            setText2(data.data.ayahs[ayahNumber - 1]?.text || '');
                        }
                    }
                }
            } catch (err) {
                if (isMounted) setText2(isEn ? 'Failed to load Tafseer.' : 'تعذر تحميل التفسير.');
            } finally {
                if (isMounted) setLoading2(false);
            }
        };

        fetchTafseer2();
        return () => { isMounted = false; };
    }, [isOpen, surahNumber, ayahNumber, tafseer2Id, isEn]);

    if (!isOpen) return null;

    const themeAccent = currentTheme?.accent || '#10b981';
    const isDeepBlack = currentTheme?.id === 'deep_black';
    const themeAccentColor = isDeepBlack ? '#ffffff' : themeAccent;

    const sName = surahName || (isEn ? (SURAH_NAMES_EN[surahNumber - 1] || String(surahNumber)) : (SURAH_NAMES_AR[surahNumber - 1] || String(surahNumber)));
    const cleanSurahName = sName.replace('سورة', '').trim();
    const sourceRefText = isEn 
        ? `${cleanSurahName} (Ayah ${ayahNumber})` 
        : `من سورة ${cleanSurahName} (آية ${toArabic(ayahNumber || 1)})`;

    const handleToggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFontSize((prev) => (prev >= 30 ? 16 : prev + 3));
    };

    const name1 = getTafseerDisplayName(tafseer1Id, isEn ? 'en' : 'ar');
    const name2 = getTafseerDisplayName(tafseer2Id, isEn ? 'en' : 'ar');

    const handleCopyAll = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const clean1 = text1.replace(/<[^>]*>/g, '').trim();
        const clean2 = text2.replace(/<[^>]*>/g, '').trim();
        
        const fullCopyText = `${ayahText ? `${ayahText}\n\n` : ''}=== ${name1} ===\n${clean1}\n\n=== ${name2} ===\n${clean2}\n\n${sourceRefText}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullCopyText).then(() => {
                setCopiedAll(true);
                setTimeout(() => setCopiedAll(false), 2000);
                if (showToast) {
                    showToast(isEn ? 'Comparison copied to clipboard' : 'تم نسخ المقارنة إلى الحافظة');
                }
            });
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const clean1 = text1.replace(/<[^>]*>/g, '').trim();
        const clean2 = text2.replace(/<[^>]*>/g, '').trim();

        const fullShareText = `${ayahText ? `${ayahText}\n\n` : ''}📌 ${name1}:\n${clean1}\n\n📌 ${name2}:\n${clean2}`;

        await shareAsImage({
            text: fullShareText,
            title: isEn ? 'Tafseer Comparison' : 'مقارنة التفاسير',
            source: sourceRefText,
            category: isEn ? 'Tafseer Comparison' : 'مقارنة التفاسير',
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage: showToast,
        });
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            stopTTS();
            setIsPlaying(false);
            return;
        }
        if (onPlayAudio && surahNumber && ayahNumber) {
            onPlayAudio(surahNumber, ayahNumber);
            setIsPlaying(true);
            return;
        }
        const clean1 = text1.replace(/<[^>]*>/g, '').trim();
        const clean2 = text2.replace(/<[^>]*>/g, '').trim();
        const textToRead = `${ayahText ? `${ayahText}. ` : ''}${name1}: ${clean1}. ${name2}: ${clean2}.`;
        playTTS(textToRead, {
            isEn,
            onToast: (msg) => { if (showToast) showToast(msg); }
        });
        setIsPlaying(true);
    };

    return (
        <div 
            className="fixed inset-0 z-[1300] bg-black/65 backdrop-blur-xs flex flex-col justify-end select-none animate-fadeIn"
            onClick={onClose}
            dir={dir}
        >
            <div 
                className={`zoom-modal-sheet w-full max-w-xl mx-auto rounded-t-[32px] flex flex-col overflow-hidden relative shadow-2xl animate-modal-enter ${
                    isLandscape ? 'max-h-[92vh]' : 'max-h-[88vh] sm:max-h-[85vh]'
                }`}
                style={{ 
                    backgroundColor: currentTheme?.modalBg || currentTheme?.bg || '#ffffff', 
                    color: currentTheme?.modalText || currentTheme?.text || '#000000',
                    fontFamily: currentTheme?.font || "'Cairo', sans-serif"
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Top Drag Handle & Category Badge with Back Button */}
                <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                    <div className="w-12 h-1.5 rounded-full mb-2.5 bg-slate-300 dark:bg-zinc-700 opacity-70 mx-auto" />
                    
                    <div className="w-full flex items-center justify-center relative px-2">
                        {onBack && (
                            <button 
                                onClick={onBack}
                                className="absolute left-2 rtl:left-auto rtl:right-2 p-2 rounded-full text-xs font-bold flex items-center justify-center border transition-all cursor-pointer font-cairo shadow-2xs active:scale-95"
                                style={{
                                    backgroundColor: `${themeAccent}18`,
                                    borderColor: `${themeAccent}40`,
                                    color: themeAccentColor
                                }}
                                title={isEn ? "Back" : "رجوع للقائمة السابقة"}
                            >
                                <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" style={{ color: themeAccentColor }} />
                            </button>
                        )}
                        <span 
                            className="px-4 py-1.5 rounded-full text-xs font-extrabold shadow-2xs border transition-all"
                            style={{
                                backgroundColor: `${themeAccent}18`,
                                borderColor: `${themeAccent}40`,
                                color: themeAccentColor
                            }}
                        >
                            {isEn ? 'Tafseer Comparison' : 'مقارنة التفاسير'}
                        </span>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto custom-scrollbar flex-1 px-4 sm:px-6 py-2">
                    {/* Display Ayah Text if available */}
                    {ayahText && (
                        <div 
                            className="py-3 px-4 my-2 rounded-2xl text-center select-text leading-[2.1] font-bold border quran-raised-card font-cairo"
                            style={{
                                backgroundColor: `${themeAccent}0d`,
                                borderColor: `${themeAccent}25`,
                                fontSize: `${fontSize + 2}px`,
                                fontFamily: "'Cairo', sans-serif"
                            }}
                            dir="rtl"
                        >
                            {ayahText} {ayahNumber ? <span>﴿{toArabic(ayahNumber)}﴾</span> : ''}
                        </div>
                    )}

                    {/* Stacked Tafseers List */}
                    <div className="flex flex-col gap-3.5 my-2">
                        {/* Tafseer 1 Card */}
                        <div 
                            className="rounded-2xl p-4 flex flex-col border shadow-2xs transition-all quran-raised-card"
                            style={{ 
                                backgroundColor: isDeepBlack ? 'rgba(255,255,255,0.05)' : `${themeAccent}08`, 
                                borderColor: isDeepBlack ? 'rgba(255,255,255,0.12)' : `${themeAccent}20` 
                            }}
                        >
                            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-black/10 dark:border-white/10">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Sparkles className="w-4 h-4 shrink-0" style={{ color: themeAccentColor }} />
                                    <select 
                                        value={tafseer1Id}
                                        onChange={(e) => setTafseer1Id(e.target.value)}
                                        className="font-extrabold text-sm sm:text-base bg-transparent outline-none cursor-pointer truncate w-full font-cairo"
                                        style={{ color: currentTheme?.modalText || currentTheme?.text || '#000000' }}
                                    >
                                        {TAFSEERS.map(t => (
                                            <option key={t.id} value={t.id} style={{ backgroundColor: currentTheme?.modalBg || currentTheme?.bg || '#ffffff', color: currentTheme?.modalText || currentTheme?.text || '#000000' }}>
                                                {getTafseerDisplayName(t.id, isEn ? 'en' : 'ar')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="py-1">
                                {loading1 ? (
                                    <div className="py-6 flex flex-col items-center justify-center gap-2">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: themeAccentColor }} />
                                        <span className="text-xs font-bold opacity-60">{isEn ? 'Loading Tafseer...' : 'جاري تحميل التفسير...'}</span>
                                    </div>
                                ) : (
                                    <div 
                                        className={`leading-[2.2] sm:leading-[2.4] font-bold text-center select-text py-1 px-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                        style={{ 
                                            fontSize: `${fontSize}px`,
                                            whiteSpace: 'pre-wrap',
                                            color: currentTheme?.modalText || currentTheme?.text || '#000000'
                                        }}
                                        dir={isEn ? 'ltr' : 'rtl'}
                                    >
                                        {text1 || (isEn ? 'No tafseer available.' : 'لا يوجد تفسير متاح.')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tafseer 2 Card */}
                        <div 
                            className="rounded-2xl p-4 flex flex-col border shadow-2xs transition-all quran-raised-card"
                            style={{ 
                                backgroundColor: isDeepBlack ? 'rgba(255,255,255,0.05)' : `${themeAccent}08`, 
                                borderColor: isDeepBlack ? 'rgba(255,255,255,0.12)' : `${themeAccent}20` 
                            }}
                        >
                            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-black/10 dark:border-white/10">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                                    <select 
                                        value={tafseer2Id}
                                        onChange={(e) => setTafseer2Id(e.target.value)}
                                        className="font-extrabold text-sm sm:text-base bg-transparent outline-none cursor-pointer truncate w-full font-cairo"
                                        style={{ color: currentTheme?.modalText || currentTheme?.text || '#000000' }}
                                    >
                                        {TAFSEERS.map(t => (
                                            <option key={t.id} value={t.id} style={{ backgroundColor: currentTheme?.modalBg || currentTheme?.bg || '#ffffff', color: currentTheme?.modalText || currentTheme?.text || '#000000' }}>
                                                {getTafseerDisplayName(t.id, isEn ? 'en' : 'ar')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="py-1">
                                {loading2 ? (
                                    <div className="py-6 flex flex-col items-center justify-center gap-2">
                                        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                                        <span className="text-xs font-bold opacity-60">{isEn ? 'Loading Tafseer...' : 'جاري تحميل التفسير...'}</span>
                                    </div>
                                ) : (
                                    <div 
                                        className={`leading-[2.2] sm:leading-[2.4] font-bold text-center select-text py-1 px-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                        style={{ 
                                            fontSize: `${fontSize}px`,
                                            whiteSpace: 'pre-wrap',
                                            color: currentTheme?.modalText || currentTheme?.text || '#000000'
                                        }}
                                        dir={isEn ? 'ltr' : 'rtl'}
                                    >
                                        {text2 || (isEn ? 'No tafseer available.' : 'لا يوجد تفسير متاح.')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reference Citation Subtitle */}
                    {(surahName || (surahNumber && ayahNumber)) && (
                        <div className="flex items-center justify-center mt-3 mb-2">
                            <span 
                                className="text-xs sm:text-sm font-extrabold text-center px-4 py-1.5 rounded-xl border shadow-2xs font-cairo"
                                style={{
                                    backgroundColor: `${themeAccent}12`,
                                    borderColor: `${themeAccent}35`,
                                    color: themeAccentColor
                                }}
                                dir={isEn ? 'ltr' : 'rtl'}
                            >
                                {sourceRefText}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Bar matching image (5 round action buttons in RTL: Audio on Right, Chevron on Left) */}
                <div 
                    className="p-4 pt-3.5 shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t border-slate-200/50 dark:border-white/10"
                    dir="rtl"
                    style={{
                        paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
                        backgroundColor: currentTheme?.modalBg || currentTheme?.cardBg || currentTheme?.bg || '#ffffff'
                    }}
                >
                    {/* 1. Audio / Recitation Play Button (RIGHTMOST in RTL) */}
                    <button
                        type="button"
                        onClick={handlePlayAudio}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 ${
                            isPlaying ? 'ring-2 ring-red-400/80 animate-pulse' : 'quran-raised-card'
                        }`}
                        style={{
                            backgroundColor: isPlaying ? '#dc2626' : `${themeAccent}18`,
                            color: isPlaying ? '#ffffff' : themeAccentColor
                        }}
                        title={isEn ? (isPlaying ? 'Stop audio' : 'Play audio') : (isPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
                    >
                        {isPlaying ? (
                            <VolumeX className="w-5 h-5 text-white animate-pulse" />
                        ) : (
                            <Volume2 className="w-5 h-5" style={{ color: themeAccentColor, stroke: themeAccentColor }} />
                        )}
                    </button>

                    {/* 2. Share Button */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 quran-raised-card"
                        style={{
                            backgroundColor: `${themeAccent}18`,
                            color: themeAccentColor
                        }}
                        title={isEn ? 'Share' : 'مشاركة'}
                    >
                        <Share2 className="w-5 h-5" style={{ color: themeAccentColor, stroke: themeAccentColor }} />
                    </button>

                    {/* 3. Copy Button */}
                    <button
                        type="button"
                        onClick={handleCopyAll}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 quran-raised-card"
                        style={{
                            backgroundColor: copiedAll ? '#10b981' : `${themeAccent}18`,
                            color: copiedAll ? '#ffffff' : themeAccentColor
                        }}
                        title={isEn ? 'Copy text' : 'نسخ النص'}
                    >
                        {copiedAll ? (
                            <Check className="w-5 h-5 text-white stroke-[2.5]" />
                        ) : (
                            <Copy className="w-5 h-5" style={{ color: themeAccentColor, stroke: themeAccentColor }} />
                        )}
                    </button>

                    {/* 4. Zoom Button */}
                    <button
                        type="button"
                        onClick={handleToggleZoom}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 quran-raised-card"
                        style={{
                            backgroundColor: `${themeAccent}18`,
                            color: themeAccentColor
                        }}
                        title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
                    >
                        <ZoomIn className="w-5 h-5" style={{ color: themeAccentColor, stroke: themeAccentColor }} />
                    </button>

                    {/* 5. Chevron Down / Hide Modal Button (LEFTMOST in RTL) */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0 quran-raised-card"
                        style={{
                            backgroundColor: `${themeAccent}18`,
                            color: themeAccentColor
                        }}
                        title={isEn ? 'Hide list' : 'إخفاء القائمة'}
                    >
                        <ChevronDown className="w-5 h-5" style={{ color: themeAccentColor, stroke: themeAccentColor }} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MultiTafseerModal;
