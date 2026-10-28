import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown } from 'lucide-react';
import { hexToRgba, getModernFlatTokens } from '../../utils/flatDesignTokens';
import { RuqyahItem } from '../../data/ruqyahData';

interface ZoomModalProps {
    zoomedDuaa: RuqyahItem | null;
    onClose: () => void;
    setToastMessage?: (msg: string) => void;
}

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const ZoomModal: React.FC<ZoomModalProps> = ({ zoomedDuaa, onClose, setToastMessage }) => {
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

    if (!zoomedDuaa) return null;

    const shareCategory = isEn 
        ? (zoomedDuaa.type === 'quran' ? "The Noble Qur'an" : "Prophetic Sunnah") 
        : (zoomedDuaa.type === 'quran' ? 'القرآن الكريم' : 'السنة النبوية');

    const shareTitle = isEn 
        ? (zoomedDuaa.titleEn || zoomedDuaa.sourceEn || 'Al-Ruqyah') 
        : (zoomedDuaa.title || zoomedDuaa.source || 'الرقية الشرعية');

    const displaySubtitle = isEn 
        ? (zoomedDuaa.type === 'quran'
            ? `From the Holy Qur'an (${zoomedDuaa.sourceEn || zoomedDuaa.source})`
            : `From the Prophetic Sunnah (${zoomedDuaa.sourceEn || zoomedDuaa.source})`)
        : (zoomedDuaa.type === 'quran'
            ? `من آيات الرقية من القرآن الكريم (${zoomedDuaa.source})`
            : `من أدعية الرقية من السنة النبوية (${zoomedDuaa.source})`);

    const displayText = isEn ? (zoomedDuaa.textEn || zoomedDuaa.text) : zoomedDuaa.text;
    const cleanPlainText = displayText.replace(/<[^>]*>/g, '').trim();

    const isPlaying = playingText === cleanPlainText || playingText === displayText;

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            stopTTS();
        } else {
            playTTS(cleanPlainText, {
                isEn,
                lang: isEn ? 'en' : 'ar',
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
            source: isEn ? (zoomedDuaa.sourceEn || zoomedDuaa.source) : zoomedDuaa.source,
            category: shareCategory,
            title: shareTitle,
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage
        });
    };

    const handleToggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFontSize(prev => (prev >= 38 ? 22 : prev + 4));
    };

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
                                {isEn ? "Al-Ruqyah Al-Shar'iyyah" : "الرقية الشرعية"}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="overflow-y-auto hide-scrollbar flex-1 px-6 py-4">
                        {isEn ? (
                            <div 
                                className="leading-relaxed font-sans font-medium text-center my-4 select-none text-balance"
                                style={{ fontSize: `${fontSize}px` }}
                                dir="ltr"
                            >
                                {displayText}
                            </div>
                        ) : (
                            <div 
                                className="leading-[2.4] font-amiri text-center select-none py-2"
                                style={{ fontSize: `${fontSize + 4}px` }}
                                dir="rtl"
                            >
                                {displayText}
                            </div>
                        )}

                        {displaySubtitle && (
                            <p 
                                className="text-sm sm:text-base mt-4 font-bold font-cairo text-center" 
                                style={{ color: tokens.primaryColor }} 
                                dir={isEn ? 'ltr' : 'rtl'}
                            >
                                {displaySubtitle}
                            </p>
                        )}

                        {(zoomedDuaa as any).count && (zoomedDuaa as any).count > 1 && (
                            <div className="flex justify-center mt-3">
                                <span 
                                    className="px-3.5 py-1 rounded-full text-xs font-bold"
                                    style={{
                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.08),
                                        color: tokens.primaryColor
                                    }}
                                >
                                    {isEn 
                                        ? `Required: ${(zoomedDuaa as any).count} times` 
                                        : `التكرار المطلوب: ${toArabicNumerals((zoomedDuaa as any).count)} مرات`}
                                </span>
                            </div>
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
