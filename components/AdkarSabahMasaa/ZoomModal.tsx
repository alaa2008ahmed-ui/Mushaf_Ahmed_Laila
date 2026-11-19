import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getAdhkarTranslation } from '../../data/adkarTranslationsEn';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown } from 'lucide-react';
import { hexToRgba, getModernFlatTokens } from '../../utils/flatDesignTokens';
import { QuranFormattedText, getThemeQuranAccentColor } from '../Common/QuranFormattedText';

interface ZoomModalProps {
    zoomedDhikr: {
        text: string;
        textEn?: string;
        source?: string;
        sourceEn?: string;
        category?: string;
        categoryEn?: string;
        count?: number;
    } | null;
    onClose: () => void;
    setToastMessage?: (msg: string) => void;
}

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const ZoomModal: React.FC<ZoomModalProps> = ({ zoomedDhikr, onClose, setToastMessage }) => {
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

    if (!zoomedDhikr) return null;

    const translation = getAdhkarTranslation(zoomedDhikr.text);
    const displayText = isEn ? (translation?.text || zoomedDhikr.textEn || zoomedDhikr.text) : zoomedDhikr.text;
    const displaySource = isEn ? (translation?.source || zoomedDhikr.sourceEn || zoomedDhikr.source) : zoomedDhikr.source;
    
    let displayCategory = zoomedDhikr.category || 'أذكار';
    if (isEn) {
        if (zoomedDhikr.category === 'أذكار الصباح') displayCategory = 'Morning Remembrances';
        else if (zoomedDhikr.category === 'أذكار المساء') displayCategory = 'Evening Remembrances';
        else displayCategory = zoomedDhikr.categoryEn || 'Daily Remembrances';
    }

    const isPlaying = playingText === displayText || playingText === zoomedDhikr.text;

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            stopTTS();
        } else {
            playTTS(displayText, {
                isEn,
                onToast: (msg) => {
                    if (setToastMessage) setToastMessage(msg);
                }
            });
        }
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(displayText).then(() => {
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
            source: displaySource,
            category: displayCategory,
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
                    {/* Top Drag Handle without X button */}
                    <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                        <div className="app-3d-drag-handle w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 mb-2" />
                        <div className="w-full flex items-center justify-center">
                            <span 
                                className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold"
                                style={{
                                    backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                    color: tokens.primaryColor
                                }}
                            >
                                {displayCategory}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-4">
                        <QuranFormattedText
                            text={displayText}
                            source={displaySource}
                            isEn={isEn}
                            accentColor={quranAccentColor}
                            fontSize={isEn ? fontSize : fontSize + 4}
                            className={isEn ? 'leading-relaxed font-sans font-medium my-4' : 'leading-loose font-medium font-cairo py-2'}
                            nonQuranClassName={isEn ? 'leading-relaxed font-sans font-medium text-center my-4 select-none text-balance' : 'leading-loose font-medium font-cairo text-center select-none py-2'}
                        />

                        {displaySource && (
                            <p 
                                className="text-sm sm:text-base mt-4 font-bold font-cairo text-center" 
                                style={{ color: quranAccentColor }} 
                                dir={isEn ? 'ltr' : 'rtl'}
                            >
                                {displaySource}
                            </p>
                        )}

                        {zoomedDhikr.count && zoomedDhikr.count > 1 && (
                            <div className="flex justify-center mt-3">
                                <span 
                                    className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold"
                                    style={{
                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.08),
                                        color: tokens.primaryColor
                                    }}
                                >
                                    {isEn 
                                        ? `Required: ${zoomedDhikr.count} times` 
                                        : `التكرار المطلوب: ${toArabicNumerals(zoomedDhikr.count)} مرات`}
                                </span>
                            </div>
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
