import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown } from 'lucide-react';
import { hexToRgba, getModernFlatTokens } from '../../utils/flatDesignTokens';

interface ZoomModalProps {
    zoomedZikr: {
        title?: string;
        titleEn?: string;
        text: string;
        textEn?: string;
        note?: string;
        noteEn?: string;
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
        ? (currentPrayer ? `${currentPrayer.titleEn} Adhkar` : 'Prayer Remembrances') 
        : (currentPrayer ? `أذكار صلاة ${currentPrayer.title}` : 'أذكار الصلاة');

    const itemNote = isEn ? (zoomedZikr.noteEn || zoomedZikr.note) : zoomedZikr.note;

    const displayText = isEn ? (zoomedZikr.textEn || zoomedZikr.text) : zoomedZikr.text;
    const cleanPlainText = displayText.replace(/<[^>]*>/g, '').trim();

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

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 bg-black/60 z-[120] flex flex-col justify-end backdrop-blur-xs select-none" 
                onClick={onClose}
                dir={dir}
            >
                <motion.div 
                    initial={{ y: '100%', opacity: 0.6 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    className="w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col max-h-[85vh] overflow-hidden relative shadow-2xl"
                    style={{ 
                        backgroundColor: tokens.cardBgColor,
                        color: 'var(--text-color)',
                        fontFamily: isEn ? 'sans-serif' : theme.font,
                    }} 
                    onClick={e => e.stopPropagation()}
                >
                    {/* Scoped font-size scaling for zoom button to work across all content including HTML cards */}
                    <style>{`
                        .zoom-scalable-content {
                            --zoom-fs: ${baseFontSize}px;
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
                            line-height: ${isEn ? '1.75' : '2.2'} !important;
                        }
                        .zoom-scalable-content h3,
                        .zoom-scalable-content h4 {
                            font-size: calc(var(--zoom-fs) * 1.15) !important;
                            line-height: 1.4 !important;
                        }
                        .zoom-scalable-content .text-xs,
                        .zoom-scalable-content .text-sm,
                        .zoom-scalable-content .text-\\[11px\\],
                        .zoom-scalable-content small {
                            font-size: calc(var(--zoom-fs) * 0.76) !important;
                        }
                    `}</style>

                    {/* Top Drag Handle without X button */}
                    <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 mb-2" />
                        <div className="w-full flex items-center justify-center">
                            <span 
                                className="px-3.5 py-1 rounded-full text-xs font-bold"
                                style={{
                                    backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                    color: tokens.primaryColor
                                }}
                            >
                                {itemCategory}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="overflow-y-auto hide-scrollbar flex-1 px-6 py-4">
                        {itemTitle && (
                            <h3 
                                className="text-base sm:text-lg font-bold mb-3 text-center" 
                                style={{ color: tokens.primaryColor }}
                            >
                                {itemTitle}
                            </h3>
                        )}

                        {isEn ? (
                            <div 
                                className="zoom-scalable-content leading-relaxed font-sans font-medium text-center my-4 select-none text-balance"
                                style={{ fontSize: `${fontSize}px` }}
                                dir="ltr"
                                dangerouslySetInnerHTML={{ __html: displayText }}
                            />
                        ) : (
                            <div 
                                className="zoom-scalable-content leading-[2.4] font-amiri text-center select-none py-2"
                                style={{ fontSize: `${fontSize + 4}px` }}
                                dir="rtl"
                                dangerouslySetInnerHTML={{ __html: displayText }}
                            />
                        )}

                        {itemNote && (
                            <p 
                                className="text-sm sm:text-base mt-4 font-bold font-cairo text-center" 
                                style={{ color: tokens.primaryColor }} 
                                dir={isEn ? 'ltr' : 'rtl'}
                            >
                                {zoomedZikr.count !== undefined 
                                    ? (isEn ? `Required repetitions: ${itemNote}` : `التكرار المطلوب: ${itemNote}`)
                                    : itemNote}
                            </p>
                        )}
                    </div>

                    {/* Action Bar (Audio, Share, Copy, Zoom, ChevronDown to hide) with safe-area bottom elevation */}
                    <div 
                        className="p-4 pt-3 shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 dark:border-white/5" 
                        style={{ 
                            backgroundColor: tokens.cardBgColor,
                            paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'
                        }}
                    >
                        {/* Audio Button */}
                        <button
                            type="button"
                            onClick={handlePlayAudio}
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                            style={{
                                backgroundColor: isPlaying ? hexToRgba(tokens.primaryColor, 0.15) : (tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
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
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                            style={{
                                backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
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
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                            style={{
                                backgroundColor: copied ? '#10B981' : (tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'),
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
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                            style={{
                                backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
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
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border-0"
                            style={{
                                backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                                color: tokens.textColor
                            }}
                            title={isEn ? 'Hide list' : 'إخفاء القائمة'}
                        >
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ZoomModal;
