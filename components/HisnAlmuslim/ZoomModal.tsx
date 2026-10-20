import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';

interface ZoomModalProps {
    zoomedItem: {
        title?: string;
        text: string;
        textEn?: string;
        source?: string;
        sourceEn?: string;
        category?: string;
        categoryAr?: string;
        categoryEn?: string;
        count?: number;
        isEn?: boolean;
    } | null;
    onClose: () => void;
    setToastMessage?: (msg: string) => void;
}

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const ZoomModal: React.FC<ZoomModalProps> = ({ zoomedItem, onClose, setToastMessage }) => {
    const { theme } = useTheme();
    const { language } = useLanguage();
    const isEn = zoomedItem?.isEn ?? (language === 'en' || (zoomedItem?.text ? !/[\u0600-\u06FF]/.test(zoomedItem.text) : false));

    if (!zoomedItem) return null;

    const displayText = isEn ? (zoomedItem.textEn || zoomedItem.text) : zoomedItem.text;
    const displayCategory = isEn 
        ? (zoomedItem.categoryEn || zoomedItem.category || 'Fortress of the Muslim')
        : (zoomedItem.categoryAr || zoomedItem.category || 'حصن المسلم');

    // Build subtitle matching the exact design:
    // e.g. "من أذكار الصباح المأثورة" or "من أذكار الاستيقاظ من النوم" in emerald color
    const getDisplaySubtitle = () => {
        if (isEn) {
            const cat = zoomedItem.categoryEn || zoomedItem.category || 'Fortress of the Muslim';
            const src = zoomedItem.sourceEn || zoomedItem.source;
            return src ? `${cat} • ${src}` : cat;
        }

        let cat = zoomedItem.categoryAr || zoomedItem.category;
        const src = zoomedItem.source;
        let formattedCat = '';

        if (cat && cat !== 'حصن المسلم') {
            cat = cat.trim();
            if (cat.startsWith('من ')) {
                formattedCat = cat;
            } else if (cat.startsWith('أذكار ') || cat.startsWith('دعاء ') || cat.startsWith('الذكر ')) {
                formattedCat = `من ${cat}`;
            } else {
                formattedCat = `من أذكار ${cat}`;
            }
        } else if (zoomedItem.title) {
            formattedCat = zoomedItem.title;
        } else {
            formattedCat = 'من أذكار حصن المسلم المأثورة';
        }

        if (src && src.trim()) {
            return `${formattedCat} (${src.trim()})`;
        }
        return formattedCat;
    };

    const displaySubtitle = getDisplaySubtitle();

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await shareAsImage({
            text: displayText,
            title: zoomedItem.title,
            source: zoomedItem.source,
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
                className="bg-modal-bg text-modal-text p-6 sm:p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" 
                style={{ 
                    fontFamily: isEn ? 'sans-serif' : theme.font,
                    borderColor: theme.palette[0] || '#059669'
                }} 
                dir={isEn ? 'ltr' : 'rtl'}
                onClick={e => e.stopPropagation()}
            >
                <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                    {/* Dhikr text */}
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

                    {/* Subtitle in emerald green matching the user's design */}
                    {displaySubtitle && (
                        <p 
                            className="text-base sm:text-lg mt-6 font-bold font-cairo" 
                            style={{ color: theme.palette[0] || '#059669' }} 
                            dir={isEn ? 'ltr' : 'rtl'}
                        >
                            {displaySubtitle}
                        </p>
                    )}

                    {zoomedItem.count && zoomedItem.count > 1 && (
                        <p className="text-sm mt-3 font-semibold opacity-75">
                            {isEn 
                                ? `Required repetitions: ${zoomedItem.count} times` 
                                : `التكرار المطلوب: ${toArabicNumerals(zoomedItem.count)} مرات`}
                        </p>
                    )}
                </div>

                {/* Bottom Action Buttons: Share as Image & Close */}
                <div className="mt-6 shrink-0 flex items-center gap-3" dir={isEn ? 'ltr' : 'rtl'}>
                    <button 
                        onClick={handleShare} 
                        className="flex-1 py-3 sm:py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-md cursor-pointer"
                        style={{ backgroundColor: theme.palette[0] || '#059669' }}
                        title={isEn ? "Share Image" : "مشاركة كصورة"}
                    >
                        <i className="fa-solid fa-share-nodes text-lg"></i>
                        <span>{isEn ? 'Share Image' : 'مشاركة كصورة'}</span>
                    </button>
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3 sm:py-3.5 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 active:scale-98 transition-all cursor-pointer"
                    >
                        {isEn ? 'Close' : 'إغلاق'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ZoomModal;
