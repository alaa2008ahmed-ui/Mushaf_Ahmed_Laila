import React from 'react';
import { toArabic, SURAH_NAMES_EN } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { X } from 'lucide-react';
import { resolveQuranModalPalette } from './modalThemeUtils';

interface BookmarksModalProps {
    bookmarks: any[];
    quranData: any;
    onSelect: (surah: number, ayah: number, isLandscape: boolean) => void;
    onDelete: (id: number) => void;
    onClose: () => void;
    isLandscape?: boolean;
    currentTheme?: any;
}

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
    const p = resolveQuranModalPalette(currentTheme);

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/55 flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'}`} onClick={onClose} dir={isEn ? "ltr" : "rtl"}>
            <div 
                className={`modal-skinned ${isLandscape ? 'w-[56%] max-w-[360px] max-h-[84%] rounded-3xl' : 'w-full max-w-[360px] sm:max-w-[380px] rounded-3xl max-h-[88dvh]'} flex flex-col border-0 overflow-hidden ${p.isDark ? 'quran-3d-dark' : ''}`} 
                style={{
                    fontFamily: p.fontFamily,
                    backgroundColor: p.modalBg,
                    color: p.modalText
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Canonical Raised Header */}
                <div className={isLandscape ? "p-2.5 pb-1.5 shrink-0" : "p-3.5 pb-2 shrink-0"}>
                    <div 
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between quran-raised-card border-0`}
                        style={{
                            backgroundColor: p.headerBg,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide`} style={{ color: p.headerAccent }}>
                                {isEn ? "Bookmarks" : "الإشارات المرجعية"}
                            </span>
                            <span className={`${isLandscape ? 'text-[10px] px-2' : 'text-xs px-2.5'} py-0.5 rounded-full font-bold`} style={{ backgroundColor: p.isDark ? 'rgba(255, 255, 255, 0.14)' : `${p.headerAccent}22`, color: p.headerAccent }}>
                                {isEn ? bookmarks.length : toArabic(bookmarks.length)}
                            </span>
                        </div>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>
                </div>

                <div className={`overflow-y-auto ${isLandscape ? 'p-2.5 pt-1.5 pb-3 gap-2.5' : 'p-3.5 pt-2 pb-4 gap-3.5'} flex-1 min-h-0 flex flex-col`}>
                    {bookmarks.length === 0 ? (
                        <div className="col-span-full text-center py-6 font-bold opacity-70 text-xs sm:text-sm">{isEn ? "No saved bookmarks" : "لا توجد إشارات مرجعية محفوظة"}</div>
                    ) : (
                        bookmarks.map((b, index) => {
                            const rawSurahName = quranData?.surahs[b.s - 1]?.name.replace('سورة','').trim() || '';
                            const cleanEnName = (SURAH_NAMES_EN[b.s - 1] || rawSurahName).replace(/^Al-/, '');
                            const hijriDate = getHijriDate(b.id, isEn);
                            return (
                                <div 
                                    key={b.id} 
                                    className={`w-full ${isLandscape ? 'p-3 rounded-xl min-h-[68px]' : 'p-4 rounded-2xl min-h-[92px]'} border-0 relative group quran-raised-card flex flex-col justify-center`}
                                    style={{ backgroundColor: p.cardBg, color: p.cardText }}
                                >
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(b.id);
                                        }} 
                                        className={`absolute ${isLandscape ? 'top-2.5 w-7 h-7' : 'top-4 w-9 h-9'} ${isEn ? 'right-3' : 'left-3'} rounded-full flex items-center justify-center text-red-500 border-0 quran-raised-btn cursor-pointer`}
                                        style={{ backgroundColor: p.closeBg }}
                                        aria-label={isEn ? "Delete" : "حذف"}
                                    >
                                        <i className={`fa-solid fa-trash-alt ${isLandscape ? 'text-xs' : 'text-sm'} quran-3d-icon`}></i>
                                    </button>
                                    
                                    <div className={`cursor-pointer ${isLandscape ? (isEn ? 'pr-9' : 'pl-9') : (isEn ? 'pr-12' : 'pl-12')}`} onClick={() => { onSelect(b.s, b.a, !!b.isLandscape); onClose(); }}>
                                        <div className={`font-black ${isLandscape ? 'text-sm mb-1' : 'text-base mb-2'} flex flex-wrap items-center gap-1.5 leading-snug`} style={{ fontFamily: isEn ? 'system-ui, -apple-system, sans-serif' : 'var(--font-amiri)' }}>
                                            <span className="text-xs opacity-50 font-sans">{isEn ? `${index + 1} -` : `${toArabic(index + 1)} -`}</span>
                                            <span className="break-words">
                                                {isEn ? `Surah-${cleanEnName} - ${b.a}` : `${rawSurahName} - آية ${toArabic(b.a)}`}
                                            </span>
                                        </div>
                                        
                                        <div className={`flex flex-col gap-0.5 ${isLandscape ? 'text-[10px]' : 'text-[11px]'} font-semibold opacity-75`}>
                                            <div className="flex items-center gap-1.5">
                                                <i className="fa-regular fa-calendar text-[9px] opacity-70"></i>
                                                <span>{b.date} | {b.time}</span>
                                            </div>
                                            {hijriDate && (
                                                <div className="flex items-center gap-1.5 font-bold" style={{ color: p.headerAccent }}>
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
