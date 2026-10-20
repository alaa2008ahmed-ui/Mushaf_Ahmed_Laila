import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getAdhkarTranslation } from '../../data/adkarTranslationsEn';
import { shareAsImage } from '../../utils/shareAsImage';

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
    const { theme } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

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

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" 
            onClick={onClose}
        >
            <div 
                className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" 
                style={{ fontFamily: isEn ? 'sans-serif' : theme.font }} 
                dir={isEn ? 'ltr' : 'rtl'}
                onClick={e => e.stopPropagation()}
            >
                <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                    {/* Dhikr Text: pure English when isEn, pure Arabic when Arabic */}
                    {isEn ? (
                        <div 
                            className="text-xl md:text-2xl leading-relaxed font-sans font-medium text-center my-4 select-none text-balance"
                            dir="ltr"
                        >
                            {displayText}
                        </div>
                    ) : (
                        <div 
                            className="text-3xl md:text-4xl leading-relaxed font-amiri text-center select-none"
                            dir="rtl"
                        >
                            {displayText}
                        </div>
                    )}

                    {displaySource && (
                        <p className="text-base sm:text-lg mt-6 font-bold" style={{ color: theme.palette[0] }} dir={isEn ? 'ltr' : 'rtl'}>
                            {displaySource}
                        </p>
                    )}

                    {zoomedDhikr.count && zoomedDhikr.count > 1 && (
                        <p className="text-sm mt-3 font-semibold opacity-75">
                            {isEn 
                                ? `Required repetitions: ${zoomedDhikr.count} times` 
                                : `التكرار المطلوب: ${toArabicNumerals(zoomedDhikr.count)} مرات`}
                        </p>
                    )}
                </div>

                <div className="mt-6 shrink-0 flex items-center gap-3">
                    <button 
                        onClick={handleShare} 
                        className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md"
                        style={{ backgroundColor: theme.palette[0] }}
                        title={isEn ? "Share Image" : "مشاركة كصورة"}
                    >
                        <i className="fa-solid fa-share-nodes"></i>
                        <span>{isEn ? 'Share Image' : 'مشاركة كصورة'}</span>
                    </button>
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity"
                    >
                        {isEn ? 'Close' : 'إغلاق'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ZoomModal;
