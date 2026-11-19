import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown } from 'lucide-react';
import { hexToRgba, getModernFlatTokens } from '../../utils/flatDesignTokens';
import { RuqyahItem } from '../../data/ruqyahData';
import QuranFormattedText, { getThemeQuranAccentColor } from '../Common/QuranFormattedText';

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

    if (!zoomedDuaa) return null;

    const shareCategory = isEn 
        ? (zoomedDuaa.type === 'quran' ? "The Noble Qur'an" : "Prophetic Sunnah") 
        : (zoomedDuaa.type === 'quran' ? 'القرآن الكريم' : 'السنة النبوية');

    const shareTitle = isEn 
        ? (zoomedDuaa.titleEn || zoomedDuaa.sourceEn || 'Al-Ruqyah') 
        : (zoomedDuaa.title || zoomedDuaa.source || 'الرقية الشرعية');

    const displaySubtitle = zoomedDuaa.type === 'quran'
        ? (isEn ? (zoomedDuaa.sourceEn || zoomedDuaa.source) : zoomedDuaa.source)
        : (isEn ? `Prophetic Sunnah • ${zoomedDuaa.sourceEn || zoomedDuaa.source}` : `السنة النبوية • ${zoomedDuaa.source}`);

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
                                    backgroundColor: hexToRgba(quranAccentColor, 0.1),
                                    color: quranAccentColor
                                }}
                            >
                                {isEn ? "Al-Ruqyah Al-Shar'iyyah" : "الرقية الشرعية"}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-4">
                        <QuranFormattedText
                            text={displayText}
                            source={isEn ? (zoomedDuaa.sourceEn || zoomedDuaa.source) : zoomedDuaa.source}
                            title={isEn ? (zoomedDuaa.titleEn || zoomedDuaa.title) : zoomedDuaa.title}
                            isEn={isEn}
                            isQuran={zoomedDuaa.type === 'quran'}
                            showSurahHeader={false}
                            accentColor={quranAccentColor}
                            fontSize={isEn ? fontSize : fontSize + 4}
                            className={isEn ? 'leading-relaxed font-sans font-medium my-4' : 'leading-loose font-medium font-cairo py-2'}
                            nonQuranClassName={isEn ? 'leading-relaxed font-sans font-medium text-center my-4 select-none text-balance' : 'leading-loose font-medium font-cairo text-center select-none py-2'}
                        />

                        {displaySubtitle && (
                            <p 
                                className="text-sm sm:text-base mt-4 font-bold font-cairo text-center" 
                                style={{ color: quranAccentColor }} 
                                dir={isEn ? 'ltr' : 'rtl'}
                            >
                                {displaySubtitle}
                            </p>
                        )}

                        {(zoomedDuaa as any).count && (zoomedDuaa as any).count > 1 && (
                            <div className="flex justify-center mt-3">
                                <span 
                                    className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold"
                                    style={{
                                        backgroundColor: hexToRgba(quranAccentColor, 0.08),
                                        color: quranAccentColor
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
                        className="px-4 pt-3 pb-2 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 dark:border-white/5 overflow-visible" 
                    >
                        {/* Audio Button */}
                        <button
                            type="button"
                            onClick={handlePlayAudio}
                            className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0"
                            style={{
                                ...(isPlaying ? { backgroundColor: hexToRgba(tokens.primaryColor, 0.15) } : {}),
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
                                ...(copied ? { backgroundColor: '#10B981' } : {}),
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
