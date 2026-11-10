import React from 'react';
import { toArabic, SURAH_NAMES_EN } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { X } from 'lucide-react';

interface BookmarksModalProps {
    bookmarks: any[];
    quranData: any;
    onSelect: (surah: number, ayah: number, isLandscape: boolean) => void;
    onDelete: (id: number) => void;
    onClose: () => void;
    isLandscape?: boolean;
    currentTheme?: any;
}

const extractModalAccentColor = (val?: string, fallback = '#3b82f6'): string => {
    if (!val) return fallback;
    if (val.includes('#')) {
        const match = val.match(/#[0-9a-fA-F]{3,8}/);
        if (match) return match[0];
    }
    return val;
};

const getHijriDate = (timestamp: number, isEn: boolean) => {
    try {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat(isEn ? 'en-US-u-ca-islamic-umalqura' : 'ar-SA-islamic', {
            day: 'numeric', month: 'long', year: 'numeric', calendar: 'islamic-umalqura'
        }).format(date);
    } catch (e) {
        return '';
    }
};

const BookmarksModal: React.FC<BookmarksModalProps> = ({ bookmarks, quranData, onSelect, onDelete, onClose, isLandscape, currentTheme }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isDeepBlack = currentTheme?.id === 'deep_black';

    const accentColor = isDeepBlack
        ? '#ffffff'
        : extractModalAccentColor(
            currentTheme?.barBorder || currentTheme?.cardBorder || currentTheme?.accent,
            '#3b82f6'
        );

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/30 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose} dir={isEn ? "ltr" : "rtl"}>
            <div 
                className={`modal-skinned w-full ${isLandscape ? 'max-w-[400px] max-h-[90vh] rounded-3xl' : 'max-w-[360px] sm:max-w-[380px] rounded-3xl max-h-[85vh]'} flex flex-col shadow-2xl border-none animate-modal-enter overflow-hidden`} 
                style={{
                    backgroundColor: currentTheme?.modalBg || currentTheme?.bg || '#ffffff',
                    color: currentTheme?.modalText || currentTheme?.text || '#000000'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header Bar - Identical to Colors & Customization Modal */}
                <div className="p-3.5 shrink-0">
                    <div 
                        className="py-2.5 px-3.5 rounded-2xl flex items-center justify-between transition-colors quran-raised-card border-0"
                        style={{
                            backgroundColor: isDeepBlack ? 'rgba(255, 255, 255, 0.08)' : `${accentColor}12`,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black tracking-wide" style={{ color: accentColor }}>
                                {isEn ? "Bookmarks" : "الإشارات المرجعية"}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold opacity-80" style={{ backgroundColor: isDeepBlack ? 'rgba(255, 255, 255, 0.15)' : `${accentColor}25`, color: accentColor }}>
                                {isEn ? bookmarks.length : toArabic(bookmarks.length)}
                            </span>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-1.5 quran-raised-btn rounded-full transition-all active:scale-90 flex items-center justify-center border-0 cursor-pointer"
                            style={{ color: accentColor }}
                            title={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-4 pt-1 flex-1 flex flex-col gap-4">
                    {bookmarks.length === 0 ? (
                        <div className="col-span-full text-center py-8 font-bold opacity-70 text-sm">{isEn ? "No saved bookmarks" : "لا توجد إشارات مرجعية محفوظة"}</div>
                    ) : (
                        bookmarks.map((b, index) => {
                            const rawSurahName = quranData?.surahs[b.s - 1]?.name.replace('سورة','').trim() || '';
                            const cleanEnName = (SURAH_NAMES_EN[b.s - 1] || rawSurahName).replace(/^Al-/, '');
                            const hijriDate = getHijriDate(b.id, isEn);
                            return (
                                <div key={b.id} className={`w-full p-4 sm:p-4.5 rounded-2xl border-none transition-all themed-card-bg relative group quran-raised-card min-h-[96px] flex flex-col justify-center`}>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(b.id);
                                        }} 
                                        className={`absolute top-4 ${isEn ? 'right-3.5' : 'left-3.5'} w-9 h-9 rounded-full flex items-center justify-center text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all border-none quran-raised-btn cursor-pointer`}
                                        title={isEn ? "Delete" : "حذف"}
                                    >
                                        <i className="fa-solid fa-trash-alt text-sm quran-3d-icon"></i>
                                    </button>
                                    
                                    <div className={`cursor-pointer ${isEn ? 'pr-12' : 'pl-12'}`} onClick={() => { onSelect(b.s, b.a, !!b.isLandscape); onClose(); }}>
                                        <div className="font-black text-base flex flex-wrap items-center gap-1.5 mb-2 leading-snug" style={{ fontFamily: isEn ? 'system-ui, -apple-system, sans-serif' : 'var(--font-amiri)' }}>
                                            <span className="text-xs opacity-50 font-sans">{isEn ? `${index + 1} -` : `${toArabic(index + 1)} -`}</span>
                                            <span className="break-words">
                                                {isEn ? `Surah-${cleanEnName} - ${b.a}` : `${rawSurahName} - آية ${toArabic(b.a)}`}
                                            </span>
                                        </div>
                                        
                                        <div className="flex flex-col gap-1 text-[11px] font-semibold opacity-75">
                                            <div className="flex items-center gap-1.5">
                                                <i className="fa-regular fa-calendar text-[9px] opacity-70"></i>
                                                <span>{b.date} | {b.time}</span>
                                            </div>
                                            {hijriDate && (
                                                <div className={`flex items-center gap-1.5 ${isDeepBlack ? 'text-white/90' : 'text-emerald-600 dark:text-emerald-400 font-bold'}`}>
                                                    <i className="fa-solid fa-moon text-[9px]"></i>
                                                    <span>{hijriDate}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookmarksModal;
