import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { toArabic } from './constants';
import { resolveQuranModalPalette } from './modalThemeUtils';

interface TafseerModalProps {
    isOpen: boolean;
    isLoading?: boolean;
    title: string;
    text: string;
    onClose: () => void;
    onOpenCompare?: () => void;
    isLandscape?: boolean;
    currentTheme?: any;
    surahNumber?: number;
    ayahNumber?: number;
    surahName?: string;
    ayahText?: string;
    onPlayAudio?: (surah: number, ayah: number) => void;
    onStopAudio?: () => void;
    isAudioPlaying?: boolean;
    showToast?: (msg: string) => void;
    categoryTitle?: string;
}

const TafseerModal: React.FC<TafseerModalProps> = ({ 
    isOpen, 
    isLoading = false, 
    title, 
    text, 
    onClose, 
    onOpenCompare,
    isLandscape = false, 
    currentTheme,
    surahNumber,
    ayahNumber,
    surahName,
    ayahText,
    onPlayAudio,
    onStopAudio,
    isAudioPlaying,
    showToast,
    categoryTitle
}) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';

    const [fontSize, setFontSize] = useState<number>(18);
    const [copied, setCopied] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = subscribeTTS((playingText) => {
            setIsPlaying(Boolean(playingText));
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const isAudioActive = isAudioPlaying !== undefined ? isAudioPlaying : isPlaying;

    const handleClose = () => {
        stopTTS();
        if (onStopAudio && isAudioActive) {
            onStopAudio();
        }
        onClose();
    };

    if (!isOpen) return null;

    const p = resolveQuranModalPalette(currentTheme);

    // Derived category title if not explicitly passed
    const badgeCategoryTitle = categoryTitle || (
        title.includes('معاني') 
            ? (isEn ? 'Quran Meanings' : 'معاني القرآن') 
            : title.includes('ترجمة') || title.includes('Translation')
            ? (isEn ? 'Ayah Translation' : 'ترجمة الآية')
            : (isEn ? 'Ayah Tafseer' : 'تفسير الآية')
    );

    const handleToggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFontSize((prev) => (prev >= 32 ? 16 : prev + 3));
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const cleanPlainText = text.replace(/<[^>]*>/g, '').trim();
        const headerRef = surahName && ayahNumber 
            ? `[${surahName} - ${isEn ? `Ayah ${ayahNumber}` : `آية ${toArabic(ayahNumber)}`}]`
            : `[${badgeCategoryTitle}]`;
        const fullCopyText = ayahText 
            ? `${ayahText}\n\n${cleanPlainText}\n\n${headerRef}`
            : `${cleanPlainText}\n\n${headerRef}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullCopyText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                if (showToast) {
                    showToast(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
                }
            });
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const cleanPlainText = text.replace(/<[^>]*>/g, '').trim();
        const fullShareText = ayahText 
            ? `${ayahText}\n\n${cleanPlainText}`
            : cleanPlainText;
        const sourceRef = surahName && ayahNumber 
            ? `${surahName} - ${isEn ? `Ayah ${ayahNumber}` : `آية ${toArabic(ayahNumber)}`}`
            : title;

        await shareAsImage({
            text: fullShareText,
            title: badgeCategoryTitle,
            source: sourceRef,
            category: badgeCategoryTitle,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage: showToast,
        });
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isAudioActive) {
            stopTTS();
            if (onStopAudio) onStopAudio();
            setIsPlaying(false);
            return;
        }
        if (onPlayAudio && surahNumber && ayahNumber) {
            stopTTS();
            onPlayAudio(surahNumber, ayahNumber);
            return;
        }
        const textToRead = ayahText ? `${ayahText}. ${text}` : text;
        const cleanPlainText = textToRead.replace(/<[^>]*>/g, '').trim();
        playTTS(cleanPlainText, {
            isEn,
            onToast: (msg) => { if (showToast) showToast(msg); }
        });
        setIsPlaying(true);
    };

    const sourceSubTitle = surahName && ayahNumber
        ? (isEn ? `${surahName} • Ayah ${ayahNumber}` : `${surahName} • آية ${toArabic(ayahNumber)}`)
        : '';

    return (
        <div 
            className={`fixed inset-0 z-[1300] bg-black/70 flex flex-col select-none ${isLandscape ? 'justify-center items-center p-2.5' : 'justify-end'}`}
            onClick={handleClose}
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
                        <div className="flex flex-col min-w-0 text-start">
                            <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide truncate`} style={{ color: p.headerAccent }}>
                                {badgeCategoryTitle}
                            </span>
                            {sourceSubTitle && (
                                <span className={`${isLandscape ? 'text-[10px]' : 'text-[11px]'} font-bold truncate`} style={{ color: p.mutedText }}>
                                    {sourceSubTitle}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {onOpenCompare && (
                                <button 
                                    type="button"
                                    onClick={onOpenCompare}
                                    className={`${isLandscape ? 'px-2.5 h-7 text-[11px]' : 'px-3.5 h-8 text-xs'} rounded-full font-black flex items-center justify-center border-0 quran-raised-btn cursor-pointer font-cairo`}
                                    style={{
                                        backgroundColor: p.closeBg,
                                        color: p.headerAccent
                                    }}
                                    title={isEn ? "Compare Tafseers" : "مقارنة تفاسير متعددة"}
                                >
                                    <span>{isEn ? "Compare" : "مقارنة"}</span>
                                </button>
                            )}
                            <button 
                                type="button"
                                onClick={handleClose} 
                                className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
                                style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                                aria-label={isEn ? "Close" : "إغلاق"}
                            >
                                <X size={isLandscape ? 14 : 16} />
                            </button>
                        </div>
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
                                fontSize: `${fontSize + 4}px`,
                                fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif"
                            }}
                            dir="rtl"
                        >
                            {ayahText} {ayahNumber ? <span style={{ color: p.headerAccent }}>﴿{toArabic(ayahNumber)}﴾</span> : ''}
                        </div>
                    )}

                    {/* Main Explanation / Tafseer / Meaning / Translation inside Raised 3D Card */}
                    <div 
                        className="p-4 sm:p-5 rounded-2xl border-0 quran-raised-card"
                        style={{
                            backgroundColor: p.cardBg,
                            color: p.cardText
                        }}
                    >
                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: p.headerAccent }}></div>
                                <p className="font-bold opacity-60 text-sm">{isEn ? "Loading..." : "جاري التحميل..."}</p>
                            </div>
                        ) : (
                            <div 
                                className={`leading-[2.2] sm:leading-[2.4] font-bold text-center select-text ${
                                    isEn ? 'font-sans' : 'font-cairo'
                                }`}
                                style={{ 
                                    fontSize: `${fontSize}px`,
                                    whiteSpace: 'pre-wrap',
                                    color: p.cardText
                                }}
                                dir={isEn ? 'ltr' : 'rtl'}
                            >
                                {text}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sculpted 3D Action Bar (5 round quran-raised-btn buttons in RTL) */}
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
                            isAudioActive ? 'ring-2 ring-red-400/80 animate-pulse' : ''
                        }`}
                        style={{
                            backgroundColor: isAudioActive ? '#dc2626' : p.closeBg,
                            color: isAudioActive ? '#ffffff' : p.headerAccent
                        }}
                        title={isEn ? (isAudioActive ? 'Stop audio' : 'Play audio') : (isAudioActive ? 'إيقاف الصوت' : 'استماع صوتي')}
                    >
                        {isAudioActive ? (
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
                        onClick={handleCopy}
                        className={`${isLandscape ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center cursor-pointer shrink-0 border-0 quran-raised-btn`}
                        style={{
                            backgroundColor: copied ? '#10b981' : p.closeBg,
                            color: copied ? '#ffffff' : p.headerAccent
                        }}
                        title={isEn ? 'Copy text' : 'نسخ النص'}
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
                        title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
                    >
                        <ZoomIn className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: p.headerAccent, stroke: p.headerAccent }} />
                    </button>

                    {/* 5. Chevron Down / Hide Modal Button (LEFTMOST in RTL) */}
                    <button
                        type="button"
                        onClick={handleClose}
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
};

export default React.memo(TafseerModal);
