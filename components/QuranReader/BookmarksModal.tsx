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

const BookmarksModal: React.FC<BookmarksModalProps> = ({ bookmarks, quranData, onSelect, onDelete, onClose, isLandscape }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/30 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose} dir={isEn ? "ltr" : "rtl"}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-[340px] max-h-[90vh] rounded-2xl' : 'max-w-[320px] rounded-2xl max-h-[80vh]'} flex flex-col shadow-2xl border-none animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-3.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold opacity-90">{isEn ? "Bookmarks" : "الإشارات المرجعية"}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold opacity-75" style={{ backgroundColor: 'var(--qr-accent-10, rgba(16, 185, 129, 0.12))', color: 'var(--qr-accent, #10b981)' }}>
                            {bookmarks.length}
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-7 h-7 rounded-xl flex items-center justify-center transition-all quran-raised-btn opacity-70 hover:opacity-100 cursor-pointer border-none"
                        title={isEn ? "Close" : "إغلاق"}
                    >
                        <X className="w-4 h-4 quran-3d-icon" />
                    </button>
                </div>
                <div className="overflow-y-auto p-4 flex-1 flex flex-col gap-3.5">
                    {bookmarks.length === 0 ? (
                        <div className="col-span-full text-center py-8 font-bold opacity-70 text-sm">{isEn ? "No saved bookmarks" : "لا توجد إشارات مرجعية محفوظة"}</div>
                    ) : (
                        bookmarks.map((b, index) => {
                            const rawSurahName = quranData?.surahs[b.s - 1]?.name.replace('سورة','').trim() || '';
                            const surahName = isEn ? (SURAH_NAMES_EN[b.s - 1] || rawSurahName) : rawSurahName;
                            const hijriDate = getHijriDate(b.id, isEn);
                            return (
                                <div key={b.id} className={`w-full p-3.5 rounded-2xl border-none transition-all themed-card-bg relative group quran-raised-card`}>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(b.id);
                                        }} 
                                        className={`absolute top-3 ${isEn ? 'right-3' : 'left-3'} w-9 h-9 rounded-full flex items-center justify-center text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all border-none quran-raised-btn cursor-pointer`}
                                        title={isEn ? "Delete" : "حذف"}
                                    >
                                        <i className="fa-solid fa-trash-alt text-sm quran-3d-icon"></i>
                                    </button>
                                    
                                    <div className={`cursor-pointer ${isEn ? 'pr-11' : 'pl-11'}`} onClick={() => { onSelect(b.s, b.a, !!b.isLandscape); onClose(); }}>
                                        <div className="font-bold text-base flex items-center gap-1.5 mb-1.5" style={{ fontFamily: isEn ? 'system-ui, sans-serif' : 'var(--font-amiri)' }}>
                                            <span className="text-xs opacity-50 font-sans">{isEn ? `${index + 1} -` : `${toArabic(index + 1)} -`}</span>
                                            <span className="truncate max-w-[170px]">
                                                {isEn ? `Surah ${surahName} - Verse ${b.a}` : `${surahName} - آية ${toArabic(b.a)}`}
                                            </span>
                                        </div>
                                        
                                        <div className="flex flex-col gap-0.5 text-[10px] font-bold opacity-60">
                                            <div className="flex items-center gap-1">
                                                <i className="fa-regular fa-calendar text-[8px]"></i>
                                                {b.date} | {b.time}
                                            </div>
                                            {hijriDate && (
                                                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                    <i className="fa-solid fa-moon text-[8px]"></i>
                                                    {hijriDate}
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
