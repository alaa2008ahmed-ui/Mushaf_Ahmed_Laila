import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown, Columns } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { toArabic } from './constants';

interface TafseerModalProps {
    isOpen: boolean;
    isLoading?: boolean;
    title: string;
    text: string;
    onClose: () => void;
    onOpenThemes?: () => void;
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

    const themeAccent = currentTheme?.accent || '#10b981';
    const isDeepBlack = currentTheme?.id === 'deep_black';
    const themeAccentColor = isDeepBlack ? '#ffffff' : themeAccent;

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

    return (
        <div 
            className="fixed inset-0 z-[1300] bg-black/65 backdrop-blur-xs flex flex-col justify-end select-none animate-fadeIn"
            onClick={handleClose}
            dir={dir}
        >
            <div 
                className={`zoom-modal-sheet w-full max-w-xl mx-auto rounded-t-[32px] flex flex-col overflow-hidden relative shadow-2xl animate-modal-enter ${
                    isLandscape ? 'max-h-[92dvh]' : 'max-h-[88dvh]'
                }`}
                style={{ 
                    backgroundColor: currentTheme?.modalBg || currentTheme?.bg || '#ffffff', 
                    color: currentTheme?.modalText || currentTheme?.text || '#000000',
                    fontFamily: currentTheme?.font || "'Cairo', sans-serif"
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Top Drag Handle & Category Badge */}
                <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                    <div className="w-12 h-1.5 rounded-full mb-2.5 bg-slate-300 dark:bg-zinc-700 opacity-70 mx-auto" />
                    
                    <div className="w-full flex items-center justify-center relative px-2">
                        <span 
                            className="px-4 py-1.5 rounded-full text-xs font-extrabold shadow-2xs border transition-all"
                            style={{
                                backgroundColor: `${themeAccent}18`,
                                borderColor: `${themeAccent}40`,
                                color: themeAccentColor
                            }}
                        >
                            {badgeCategoryTitle}
                        </span>

                        {onOpenCompare && (
                            <button 
                                onClick={onOpenCompare}
                                className="absolute left-2 rtl:left-auto rtl:right-2 p-1.5 px-3.5 rounded-full text-xs font-bold flex items-center justify-center border transition-all cursor-pointer font-cairo shadow-2xs active:scale-95"
                                style={{
                                    backgroundColor: `${themeAccent}18`,
                                    borderColor: `${themeAccent}40`,
                                    color: themeAccentColor
                                }}
                                title={isEn ? "Compare Tafseers" : "مقارنة تفاسير متعددة"}
                            >
                                <span>{isEn ? "Compare" : "مقارنة"}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 px-6 py-3">
                    {/* Display Ayah Text if available */}
                    {ayahText && (
                        <div 
                            className="py-3 px-4 my-2.5 rounded-2xl text-center select-text leading-[2.1] font-bold border quran-raised-card transition-all"
                            style={{
                                backgroundColor: `${themeAccent}0d`,
                                borderColor: `${themeAccent}25`,
                                fontSize: `${fontSize + 4}px`,
                                fontFamily: "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif"
                            }}
                            dir="rtl"
                        >
                            {ayahText} {ayahNumber ? <span>﴿{toArabic(ayahNumber)}﴾</span> : ''}
                        </div>
                    )}

                    {/* Main Explanation / Tafseer / Meaning / Translation Text */}
                    {isLoading ? (
                        <div className="py-14 flex flex-col items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: themeAccentColor }}></div>
                            <p className="font-bold opacity-60 text-sm">{isEn ? "Loading..." : "جاري التحميل..."}</p>
                        </div>
                    ) : (
                        <div 
                            className={`leading-[2.2] sm:leading-[2.4] font-bold text-center select-text py-2 px-1 transition-all ${
                                isEn ? 'font-sans' : 'font-cairo'
                            }`}
                            style={{ 
                                fontSize: `${fontSize}px`,
                                whiteSpace: 'pre-wrap',
                                color: currentTheme?.modalText || currentTheme?.text || '#000000'
                            }}
                            dir={isEn ? 'ltr' : 'rtl'}
                        >
                            {text}
                        </div>
                    )}
                </div>

                {/* Action Bar matching image (5 round action buttons in RTL: Audio on Right, Chevron on Left) */}
                <div 
                    data-toast-bottom-bar="true"
                    className="px-4 pt-3.5 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t border-slate-200/50 dark:border-white/10"
                    dir="rtl"
                    style={{
                        backgroundColor: currentTheme?.modalBg || currentTheme?.cardBg || currentTheme?.bg || '#ffffff'
                    }}
                >
                    {/* 1. Audio / Recitation Play Button (RIGHTMOST in RTL) */}
                    <button
                        type="button"
                        onClick={handlePlayAudio}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border border-slate-200/80 shadow-md ${
                            isAudioActive ? 'ring-2 ring-red-400/80 animate-pulse' : ''
                        }`}
                        style={{
                            backgroundColor: isAudioActive ? '#dc2626' : '#ffffff',
                            color: isAudioActive ? '#ffffff' : (currentTheme?.accent || themeAccent)
                        }}
                        title={isEn ? (isAudioActive ? 'Stop audio' : 'Play audio') : (isAudioActive ? 'إيقاف الصوت' : 'استماع صوتي')}
                    >
                        {isAudioActive ? (
                            <VolumeX className="w-5 h-5 text-white animate-pulse" />
                        ) : (
                            <Volume2 className="w-5 h-5" style={{ color: currentTheme?.accent || themeAccent, stroke: currentTheme?.accent || themeAccent }} />
                        )}
                    </button>

                    {/* 2. Share Button */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border border-slate-200/80 shadow-md"
                        style={{
                            backgroundColor: '#ffffff',
                            color: currentTheme?.accent || themeAccent
                        }}
                        title={isEn ? 'Share' : 'مشاركة'}
                    >
                        <Share2 className="w-5 h-5" style={{ color: currentTheme?.accent || themeAccent, stroke: currentTheme?.accent || themeAccent }} />
                    </button>

                    {/* 3. Copy Button */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border border-slate-200/80 shadow-md"
                        style={{
                            backgroundColor: copied ? '#10b981' : '#ffffff',
                            color: copied ? '#ffffff' : (currentTheme?.accent || themeAccent)
                        }}
                        title={isEn ? 'Copy text' : 'نسخ النص'}
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-white stroke-[2.5]" />
                        ) : (
                            <Copy className="w-5 h-5" style={{ color: currentTheme?.accent || themeAccent, stroke: currentTheme?.accent || themeAccent }} />
                        )}
                    </button>

                    {/* 4. Zoom Button */}
                    <button
                        type="button"
                        onClick={handleToggleZoom}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border border-slate-200/80 shadow-md"
                        style={{
                            backgroundColor: '#ffffff',
                            color: currentTheme?.accent || themeAccent
                        }}
                        title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
                    >
                        <ZoomIn className="w-5 h-5" style={{ color: currentTheme?.accent || themeAccent, stroke: currentTheme?.accent || themeAccent }} />
                    </button>

                    {/* 5. Chevron Down / Hide Modal Button (LEFTMOST in RTL) */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border border-slate-200/80 shadow-md"
                        style={{
                            backgroundColor: '#ffffff',
                            color: currentTheme?.accent || themeAccent
                        }}
                        title={isEn ? 'Hide list' : 'إخفاء القائمة'}
                    >
                        <ChevronDown className="w-5 h-5" style={{ color: currentTheme?.accent || themeAccent, stroke: currentTheme?.accent || themeAccent }} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TafseerModal;
