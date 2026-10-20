import React from 'react';
import { toArabic, SURAH_NAMES_EN } from './constants';
import { useLanguage } from '../../context/LanguageContext';

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
        <div className={`fixed inset-0 z-[1200] bg-transparent flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose} dir={isEn ? "ltr" : "rtl"}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-[300px] max-h-[90vh] rounded-2xl' : 'max-w-[280px] rounded-2xl max-h-[80vh]'} flex flex-col shadow-2xl animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="overflow-y-auto p-4 flex-1 flex flex-col gap-3">
                    {bookmarks.length === 0 ? (
                        <div className="col-span-full text-center p-4 font-bold">{isEn ? "No saved bookmarks" : "لا توجد إشارات مرجعية محفوظة"}</div>
                    ) : (
                        bookmarks.map((b, index) => {
                            const rawSurahName = quranData?.surahs[b.s - 1]?.name.replace('سورة','').trim() || '';
                            const surahName = isEn ? (SURAH_NAMES_EN[b.s - 1] || rawSurahName) : rawSurahName;
                            const hijriDate = getHijriDate(b.id, isEn);
                            return (
                                <div key={b.id} className={`w-full p-3 rounded-xl border transition themed-card-bg relative group`}>
                                    <button 
                                        onClick={() => onDelete(b.id)} 
                                        className={`absolute top-2 ${isEn ? 'right-2' : 'left-2'} text-red-500 hover:text-red-700 p-1.5 transition-colors`}
                                        title={isEn ? "Delete" : "حذف"}
                                    >
                                        <i className="fa-solid fa-trash-alt text-sm"></i>
                                    </button>
                                    
                                    <div className={`cursor-pointer ${isEn ? 'pl-1' : 'pr-1'}`} onClick={() => { onSelect(b.s, b.a, !!b.isLandscape); onClose(); }}>
                                        <div className="font-bold text-base flex items-center gap-1 mb-1" style={{ fontFamily: isEn ? 'system-ui, sans-serif' : 'var(--font-amiri)' }}>
                                            <span className="text-xs opacity-40 font-sans">{isEn ? `${index + 1} -` : `${toArabic(index + 1)} -`}</span>
                                            <span className="truncate max-w-[180px]">
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
