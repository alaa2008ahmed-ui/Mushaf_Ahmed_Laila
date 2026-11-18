import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown, Sparkles, RefreshCw, ArrowRight, X } from 'lucide-react';
import { TAFSEERS, getTafseerDisplayName, SURAH_NAMES_AR, SURAH_NAMES_EN, toArabic } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { resolveQuranModalPalette } from './modalThemeUtils';

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

const sharedMultiTafseerCache: Record<string, any[]> = {};

export const MultiTafseerModal: React.FC<MultiTafseerModalProps> = React.memo(({
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

    const [text1, setText1] = useState<string>(() => {
        const cached = sharedMultiTafseerCache[`${surahNumber}_ar.jalalayn`];
        return cached?.[ayahNumber - 1]?.text || cached?.[ayahNumber - 1]?.explanation || '';
    });
    const [text2, setText2] = useState<string>(() => {
        const cached = sharedMultiTafseerCache[`${surahNumber}_ar.muyassar`];
        return cached?.[ayahNumber - 1]?.text || cached?.[ayahNumber - 1]?.explanation || '';
    });

    const [loading1, setLoading1] = useState<boolean>(false);
    const [loading2, setLoading2] = useState<boolean>(false);

    const [fontSize, setFontSize] = useState<number>(18);
    const [copiedAll, setCopiedAll] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

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
        const cacheKey = `${surahNumber}_${tafseer1Id}`;
        if (sharedMultiTafseerCache[cacheKey]) {
            const ayahObj = sharedMultiTafseerCache[cacheKey][ayahNumber - 1];
            setText1(ayahObj?.text || ayahObj?.explanation || '');
            setLoading1(false);
            return;
        }

        const fetchTafseer1 = async () => {
            setLoading1(true);
            try {
                if (tafseer1Id === 'ar.jalalayn') {
                    const res = await fetch('/assets/data/ar.jalalayn.json');
                    const data = await res.json();
                    if (data?.code === 200 && data?.data?.surahs) {
                        data.data.surahs.forEach((s: any) => {
                            sharedMultiTafseerCache[`${s.number}_ar.jalalayn`] = s?.ayahs || [];
                        });
                        const surah = data.data.surahs[surahNumber - 1];
                        if (isMounted) {
                            setText1(surah?.ayahs?.[ayahNumber - 1]?.text || '');
                        }
                    }
                } else {
                    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${tafseer1Id}`);
                    const data = await res.json();
                    if (data?.code === 200 && data?.data?.ayahs) {
                        sharedMultiTafseerCache[cacheKey] = data.data.ayahs;
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
        const cacheKey = `${surahNumber}_${tafseer2Id}`;
        if (sharedMultiTafseerCache[cacheKey]) {
            const ayahObj = sharedMultiTafseerCache[cacheKey][ayahNumber - 1];
            setText2(ayahObj?.text || ayahObj?.explanation || '');
            setLoading2(false);
            return;
        }

        const fetchTafseer2 = async () => {
            setLoading2(true);
            try {
                if (tafseer2Id === 'ar.jalalayn') {
                    const res = await fetch('/assets/data/ar.jalalayn.json');
                    const data = await res.json();
                    if (data?.code === 200 && data?.data?.surahs) {
                        data.data.surahs.forEach((s: any) => {
                            sharedMultiTafseerCache[`${s.number}_ar.jalalayn`] = s?.ayahs || [];
                        });
                        const surah = data.data.surahs[surahNumber - 1];
                        if (isMounted) {
                            setText2(surah?.ayahs?.[ayahNumber - 1]?.text || '');
                        }
                    }
                } else {
                    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${tafseer2Id}`);
                    const data = await res.json();
                    if (data?.code === 200 && data?.data?.ayahs) {
                        sharedMultiTafseerCache[cacheKey] = data.data.ayahs;
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

    const p = resolveQuranModalPalette(currentTheme);

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
            className={`fixed inset-0 z-[1300] bg-black/70 flex flex-col select-none ${isLandscape ? 'justify-center items-center p-2.5' : 'justify-end'}`}
            onClick={onClose}
            dir={dir}
        >
            <div 
                className={`zoom-modal-sheet modal-skinned settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} flex flex-col overflow-hidden relative shadow-2xl border-0 ${
                    isLandscape ? 'w-[62%] max-w-[430px] max-h-[86%] rounded-3xl' : 'w-full max-w-xl mx-auto rounded-t-[32px] max-h-[88dvh]'
                }`}
                style={{ 
                    backgroundColor: p.modalBg, 
                    color: p.modalText,
                    fontFamily: p.fontFamily || "'Cairo', sans-serif",
                    border: 'none',
                    outline: 'none'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Canonical Raised 3D Header */}
                <div className={`${isLandscape ? 'pt-2.5 px-3 pb-1.5' : 'pt-3 px-4 sm:px-5 pb-2.5'} shrink-0 flex flex-col`}>
                    {!isLandscape && (
                        <div className="app-3d-drag-handle w-12 h-1.5 rounded-full mb-2.5 bg-slate-300/80 dark:bg-zinc-600/80 mx-auto" />
                    )}
                    
                    <div 
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between gap-2 quran-raised-card border-0`}
                        style={{ backgroundColor: p.headerBg }}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {onBack && (
                                <button 
                                    type="button"
                                    onClick={onBack}
                                    className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} rounded-full flex items-center justify-center border-0 quran-raised-btn cursor-pointer shrink-0`}
                                    style={{
                                        backgroundColor: p.closeBg,
                                        color: p.headerAccent
                                    }}
                                    title={isEn ? "Back" : "رجوع للقائمة السابقة"}
                                >
                                    <ArrowRight className={`${isLandscape ? 'w-3.5 h-3.5' : 'w-4 h-4'} rtl:rotate-0 ltr:rotate-180`} style={{ color: p.headerAccent }} />
                                </button>
                            )}
                            <div className="flex flex-col min-w-0 text-start">
                                <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide truncate`} style={{ color: p.headerAccent }}>
                                    {isEn ? 'Tafseer Comparison' : 'مقارنة التفاسير'}
                                </span>
                                <span className={`${isLandscape ? 'text-[10px]' : 'text-[11px]'} font-bold truncate`} style={{ color: p.mutedText }}>
                                    {sourceRefText}
                                </span>
                            </div>
                        </div>

                        <button 
                            type="button"
                            onClick={onClose} 
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className={`overflow-y-auto custom-scrollbar flex-1 min-h-0 ${isLandscape ? 'px-3 pt-1 pb-3 space-y-2.5' : 'px-4 sm:px-5 pt-2 pb-5 space-y-4'}`}>
                    {/* Display Ayah Text in Raised 3D Card */}
                    {ayahText && (
                        <div 
                            className="p-4 rounded-2xl text-center select-text leading-[2.1] font-bold border-0 quran-raised-card"
                            style={{
                                backgroundColor: p.cardBg,
                                color: p.cardText,
                                fontSize: `${fontSize + 2}px`,
                                fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif"
                            }}
                            dir="rtl"
                        >
                            {ayahText} {ayahNumber ? <span style={{ color: p.headerAccent }}>﴿{toArabic(ayahNumber)}﴾</span> : ''}
                        </div>
                    )}

                    {/* Stacked Tafseers List */}
                    <div className="flex flex-col gap-4">
                        {/* Tafseer 1 Card */}
                        <div 
                            className="rounded-2xl p-4 flex flex-col border-0 quran-raised-card"
                            style={{ 
                                backgroundColor: p.cardBg,
                                color: p.cardText
                            }}
                        >
                            <div 
                                className="app-3d-recessed-field flex items-center justify-between gap-2 px-3 py-2 mb-3 rounded-xl border-0"
                                style={{ backgroundColor: p.subtleBg }}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Sparkles className="w-4 h-4 shrink-0" style={{ color: p.headerAccent }} />
                                    <select 
                                        value={tafseer1Id}
                                        onChange={(e) => setTafseer1Id(e.target.value)}
                                        className="font-extrabold text-sm sm:text-base bg-transparent outline-none cursor-pointer truncate w-full font-cairo"
                                        style={{ color: p.headerAccent }}
                                    >
                                        {TAFSEERS.map(t => (
                                            <option key={t.id} value={t.id} style={{ backgroundColor: p.modalBg, color: p.modalText }}>
                                                {getTafseerDisplayName(t.id, isEn ? 'en' : 'ar')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="py-1">
                                {loading1 ? (
                                    <div className="py-6 flex flex-col items-center justify-center gap-2">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: p.headerAccent }} />
                                        <span className="text-xs font-bold opacity-60">{isEn ? 'Loading Tafseer...' : 'جاري تحميل التفسير...'}</span>
                                    </div>
                                ) : (
                                    <div 
                                        className={`leading-[2.2] sm:leading-[2.4] font-bold text-center select-text py-1 px-1 ${isEn ? 'font-sans' : 'font-cairo'}`}
                                        style={{ 
                                            fontSize: `${fontSize}px`,
                                            whiteSpace: 'pre-wrap',
                                            color: p.cardText
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
                            className="rounded-2xl p-4 flex flex-col border-0 quran-raised-card"
                            style={{ 
                                backgroundColor: p.cardBg,
                                color: p.cardText
                            }}
                        >
                            <div 
                                className="app-3d-recessed-field flex items-center justify-between gap-2 px-3 py-2 mb-3 rounded-xl border-0"
                                style={{ backgroundColor: p.subtleBg }}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                                    <select 
                                        value={tafseer2Id}
                                        onChange={(e) => setTafseer2Id(e.target.value)}
                                        className="font-extrabold text-sm sm:text-base bg-transparent outline-none cursor-pointer truncate w-full font-cairo"
                                        style={{ color: p.headerAccent }}
                                    >
                                        {TAFSEERS.map(t => (
                                            <option key={t.id} value={t.id} style={{ backgroundColor: p.modalBg, color: p.modalText }}>
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
                                            color: p.cardText
                                        }}
                                        dir={isEn ? 'ltr' : 'rtl'}
                                    >
                                        {text2 || (isEn ? 'No tafseer available.' : 'لا يوجد تفسير متاح.')}
                                    </div>
                                )}
                            </div>
                        </div>
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
                    {/* 1. Play Button */}
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
                        title={isEn ? (isPlaying ? 'Stop audio' : 'Play audio') : (isPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
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
                        title={isEn ? 'Share' : 'مشاركة'}
                    >
                        <Share2 className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: p.headerAccent, stroke: p.headerAccent }} />
                    </button>

                    {/* 3. Copy Button */}
                    <button
                        type="button"
                        onClick={handleCopyAll}
                        className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer shrink-0 border-0 quran-raised-btn`}
                        style={{
                            backgroundColor: copiedAll ? '#10b981' : p.closeBg,
                            color: copiedAll ? '#ffffff' : p.headerAccent
                        }}
                        title={isEn ? 'Copy text' : 'نسخ النص'}
                    >
                        {copiedAll ? (
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
                        title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
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
                        title={isEn ? 'Hide list' : 'إخفاء القائمة'}
                    >
                        <ChevronDown className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: p.headerAccent, stroke: p.headerAccent }} />
                    </button>
                </div>
            </div>
        </div>
    );
});

export default MultiTafseerModal;
