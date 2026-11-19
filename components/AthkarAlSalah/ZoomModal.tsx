import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown } from 'lucide-react';
import { hexToRgba, getModernFlatTokens } from '../../utils/flatDesignTokens';
import QuranFormattedText, { getThemeQuranAccentColor, isQuranicContent } from '../Common/QuranFormattedText';

interface ZoomModalProps {
    zoomedZikr: {
        title?: string;
        titleEn?: string;
        text: string;
        textEn?: string;
        note?: string;
        noteEn?: string;
        category?: string;
        categoryEn?: string;
        isHtml?: boolean;
        isQuran?: boolean;
        count?: number;
    } | null;
    currentPrayer?: { id: string; title: string; titleEn?: string } | null;
    onClose: () => void;
    setToastMessage?: (msg: string) => void;
}

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const ZoomModal: React.FC<ZoomModalProps> = ({ zoomedZikr, currentPrayer, onClose, setToastMessage }) => {
    const { theme, themeKey } = useTheme();
    const { language, dir } = useLanguage();
    const tokens = getModernFlatTokens(theme, themeKey);
    const quranAccentColor = getThemeQuranAccentColor(theme, themeKey);
    const isEn = language === 'en';

    const [copied, setCopied] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState<number>(26);

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    if (!zoomedZikr) return null;

    const fallbackTitle = isEn ? 'Prayer Remembrance' : 'أذكار ما بعد الصلاة';
    const itemTitle = isEn 
        ? (zoomedZikr.titleEn || (currentPrayer ? `${currentPrayer.titleEn} Adhkar` : fallbackTitle)) 
        : (zoomedZikr.title || (currentPrayer ? `أذكار صلاة ${currentPrayer.title}` : fallbackTitle));

    const itemCategory = isEn 
        ? (zoomedZikr.categoryEn || (currentPrayer ? `${currentPrayer.titleEn} Adhkar` : 'Prayer Remembrances')) 
        : (zoomedZikr.category || (currentPrayer ? `أذكار صلاة ${currentPrayer.title}` : 'أذكار الصلاة'));

    const itemNote = isEn ? (zoomedZikr.noteEn || zoomedZikr.note) : zoomedZikr.note;
    const rawItemTitle = isEn ? zoomedZikr.titleEn : zoomedZikr.title;

    const displayText = isEn ? (zoomedZikr.textEn || zoomedZikr.text) : zoomedZikr.text;
    const hasHtmlMarkup = Boolean(
        zoomedZikr.isHtml ||
        /<(?:div|p|h[1-6]|ul|ol|li|span|b|strong)\b/i.test(displayText)
    );
    const isQuranItem = !hasHtmlMarkup && Boolean(
        zoomedZikr.isQuran || isQuranicContent(displayText, itemNote, rawItemTitle)
    );
    const cleanPlainText = displayText
        .replace(/<(br|\/div|\/p|\/li|\/h[1-6])\b[^>]*>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const isPlaying = playingText === cleanPlainText || playingText === displayText;

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            stopTTS();
        } else {
            playTTS(cleanPlainText, {
                isEn,
                onToast: (msg) => {
                    if (setToastMessage) setToastMessage(msg);
                }
            });
        }
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(cleanPlainText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            if (setToastMessage) {
                setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
            }
        });
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await shareAsImage({
            text: displayText,
            title: itemTitle,
            source: itemNote,
            category: itemCategory,
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage
        });
    };

    const handleToggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFontSize(prev => (prev >= 38 ? 20 : prev + 4));
    };

    const baseFontSize = isEn ? fontSize : fontSize + 4;
    const scalableFontSize = hasHtmlMarkup
        ? Math.max(16, baseFontSize - (isEn ? 6 : 8))
        : baseFontSize;
    const scalableLineHeight = hasHtmlMarkup
        ? (isEn ? '1.65' : '1.95')
        : (isEn ? '1.75' : '2.2');

    return (
        <div 
            className="fixed inset-0 bg-black/65 z-[120] flex flex-col justify-end select-none" 
            onClick={onClose}
            dir={dir}
        >
            <div 
                className="app-page-card border-0 w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[88dvh] overflow-hidden relative bg-white dark:bg-[#1E293B]"
                    style={{ 
                        color: 'var(--text-color)',
                        fontFamily: isEn ? 'sans-serif' : "'Cairo', sans-serif",
                    }} 
                    onClick={e => e.stopPropagation()}
                >
                    {/* Scoped font-size scaling for zoom button to work across all content including HTML cards */}
                    <style>{`
                        .zoom-scalable-content {
                            --zoom-fs: ${scalableFontSize}px;
                        }
                        .zoom-scalable-content,
                        .zoom-scalable-content p,
                        .zoom-scalable-content span,
                        .zoom-scalable-content div,
                        .zoom-scalable-content b,
                        .zoom-scalable-content strong,
                        .zoom-scalable-content li,
                        .zoom-scalable-content i {
                            font-size: var(--zoom-fs) !important;
                            line-height: ${scalableLineHeight} !important;
                        }
                        .zoom-scalable-content h3,
                        .zoom-scalable-content h4 {
                            font-size: calc(var(--zoom-fs) * 1.08) !important;
                            line-height: 1.45 !important;
                        }
                        .zoom-scalable-content .text-xs,
                        .zoom-scalable-content .text-sm,
                        .zoom-scalable-content .text-\\[11px\\],
                        .zoom-scalable-content small {
                            font-size: calc(var(--zoom-fs) * 0.85) !important;
                        }
                    `}</style>

                    {/* Top Drag Handle without X button */}
                    <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                        <div className="app-3d-drag-handle w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 mb-2" />
                        <div className="w-full flex items-center justify-center">
                            <span 
                                className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold"
                                style={{
                                    backgroundColor: hexToRgba(quranAccentColor, 0.1),
                                    color: quranAccentColor
                                }}
                            >
                                {itemCategory}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-4">
                        {!isQuranItem && itemTitle && (
                            <h3 
                                className="text-base sm:text-lg font-bold mb-3 text-center" 
                                style={{ color: quranAccentColor }}
                            >
                                {itemTitle}
                            </h3>
                        )}

                        {isQuranItem ? (
                            <QuranFormattedText
                                text={displayText}
                                title={rawItemTitle}
                                source={itemNote}
                                isEn={isEn}
                                isQuran={true}
                                accentColor={quranAccentColor}
                                fontSize={baseFontSize}
                                className={isEn ? 'leading-relaxed font-sans font-medium my-4' : 'leading-loose font-medium font-cairo py-2'}
                            />
                        ) : isEn ? (
                            <div 
                                className="zoom-scalable-content leading-relaxed font-sans font-medium text-center my-4 select-none text-balance"
                                style={{ fontSize: `${fontSize}px` }}
                                dir="ltr"
                                dangerouslySetInnerHTML={{ __html: displayText }}
                            />
                        ) : (
                            <div 
                                className="zoom-scalable-content leading-loose font-medium font-cairo text-center select-none py-2"
                                style={{ fontSize: `${fontSize + 4}px` }}
                                dir="rtl"
                                dangerouslySetInnerHTML={{ __html: displayText }}
                            />
                        )}

                        {itemNote && (
                            zoomedZikr.count !== undefined ? (
                                <div className="flex justify-center mt-3">
                                    <span
                                        className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold"
                                        style={{
                                            backgroundColor: hexToRgba(quranAccentColor, 0.08),
                                            color: quranAccentColor
                                        }}
                                        dir={isEn ? 'ltr' : 'rtl'}
                                    >
                                        {isEn ? `Required repetitions: ${itemNote}` : `التكرار المطلوب: ${itemNote}`}
                                    </span>
                                </div>
                            ) : (
                                <p 
                                    className="text-sm sm:text-base mt-4 font-bold font-cairo text-center" 
                                    style={{ color: quranAccentColor }} 
                                    dir={isEn ? 'ltr' : 'rtl'}
                                >
                                    {itemNote}
                                </p>
                            )
                        )}
                    </div>

                    {/* Action Bar (Audio, Share, Copy, Zoom, ChevronDown to hide) with safe-area bottom elevation */}
                    <div 
                        className="px-4 pt-3 pb-2 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 dark:border-white/5 overflow-visible" 
                    >
                        {/* Audio Button */}
                        <button
                            type="button"
                            onClick={handlePlayAudio}
                            className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                            style={{
                                backgroundColor: isPlaying ? hexToRgba(tokens.primaryColor, 0.15) : undefined,
                                color: isPlaying ? '#EF4444' : tokens.textColor
                            }}
                            title={isEn ? (isPlaying ? 'Stop audio' : 'Play audio') : (isPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
                        >
                            {isPlaying ? <VolumeX className="w-5 h-5 text-red-500 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
                        </button>

                        {/* Share Button */}
                        <button 
                            type="button"
                            onClick={handleShare} 
                            className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                            style={{
                                color: tokens.textColor
                            }}
                            title={isEn ? "Share Image" : "مشاركة كصورة"}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>

                        {/* Copy Button */}
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                            style={{
                                backgroundColor: copied ? '#10B981' : undefined,
                                color: copied ? '#FFFFFF' : tokens.textColor
                            }}
                            title={isEn ? 'Copy text' : 'نسخ النص'}
                        >
                            {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
                        </button>

                        {/* Zoom Button */}
                        <button
                            type="button"
                            onClick={handleToggleZoom}
                            className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                            style={{
                                color: tokens.textColor
                            }}
                            title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>

                        {/* Chevron Down / Hide Modal Button */}
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                            style={{
                                color: tokens.textColor
                            }}
                            title={isEn ? 'Hide list' : 'إخفاء القائمة'}
                        >
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default ZoomModal;
