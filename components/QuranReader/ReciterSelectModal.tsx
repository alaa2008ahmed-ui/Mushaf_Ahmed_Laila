import React, { useState, useEffect, useRef, useMemo } from 'react';
import { READERS, ReaderItem, ReadingMode, getReadersForMode, isEnglishReader } from './constants';
import { Search, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getReciterDisplayName, tListen } from '../../utils/listenQuranTranslations';

interface ReciterSelectModalProps {
    onClose: () => void;
    currentReader: string;
    onSelect: (readerId: string) => void;
    isLandscape?: boolean;
    readersList?: ReaderItem[];
    readingMode?: ReadingMode;
}

const ReciterSelectModal: React.FC<ReciterSelectModalProps> = ({ 
    onClose, 
    currentReader, 
    onSelect, 
    isLandscape, 
    readersList = READERS,
    readingMode = 'mushaf'
}) => {
    const { language, isRTL, dir } = useLanguage();
    const isEn = language === 'en';
    const [searchTerm, setSearchTerm] = useState('');
    const selectedRef = useRef<HTMLButtonElement>(null);

    // Strictly filter the available readers based on current reading mode
    const modeReaders = useMemo(() => {
        return getReadersForMode(readingMode, readersList);
    }, [readingMode, readersList]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedRef.current) {
                selectedRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        }, 150);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        onClose();
    };

    const handleSelect = (id: string) => {
        onSelect(id);
        handleClose();
    };

    const searchLower = searchTerm.toLowerCase().trim();
    const filteredReaders = useMemo(() => {
        return modeReaders.filter(r => {
            if (!searchLower) return true;
            const arName = r.name.toLowerCase();
            const enName = getReciterDisplayName(r.name, 'en').toLowerCase();
            return arName.includes(searchLower) || enName.includes(searchLower);
        });
    }, [modeReaders, searchLower]);

    const isBilingualMode = readingMode === 'bilingual';
    const isTranslationMode = readingMode === 'translation';
    const isSingleReciterMode = isBilingualMode || isTranslationMode;

    const modalTitle = isBilingualMode 
        ? (isEn ? "Recitation & Translation Reciter" : "قارئ التلاوة والترجمة الإنجليزية")
        : isTranslationMode
            ? (isEn ? "English Translation Reciter" : "قارئ الترجمة الإنجليزية (صحيح إنترناشونال)")
            : (isEn ? "Holy Quran Reciters" : "قراء القرآن الكريم");

    return (
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={handleClose}>
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md sm:max-w-2xl rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-3 border-b flex flex-col gap-2" style={{ borderColor: 'var(--qr-card-border)' }}>
                    <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-bold truncate" style={{ color: 'var(--qr-card-text)' }}>
                            {modalTitle}
                        </span>
                        {isSingleReciterMode && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 font-bold border border-indigo-500/30">
                                {isBilingualMode ? 'AR + EN' : 'EN'}
                            </span>
                        )}
                    </div>
                    {!isSingleReciterMode && (
                        <div className="relative w-full">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 opacity-50`} />
                            <input
                                type="text"
                                placeholder={tListen('searchReciterPlaceholder', language)}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full bg-transparent border-2 rounded-xl py-2 ${isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                                style={{ 
                                    borderColor: 'var(--qr-card-border)',
                                    color: 'var(--qr-card-text)'
                                }}
                            />
                        </div>
                    )}
                </div>
                <div className={`p-3 overflow-y-auto flex-1 ${isSingleReciterMode ? 'flex flex-col items-center justify-center' : `grid ${isLandscape ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'}`}`}>
                    {filteredReaders.map(r => {
                        const isSelected = currentReader === r.id || isSingleReciterMode;
                        const isEnReader = isEnglishReader(r);
                        return (
                            <button 
                                key={r.id} 
                                ref={isSelected ? selectedRef : null}
                                onClick={() => handleSelect(r.id)}
                                className={`w-full ${isSingleReciterMode ? 'max-w-md p-5' : 'p-3'} rounded-xl border-2 transition-all font-bold flex flex-col items-center justify-center text-center cursor-pointer ${isSelected ? 'shadow-md' : 'hover:opacity-80'}`}
                                style={{ 
                                    backgroundColor: isEnReader 
                                        ? 'var(--qr-card-bg)' 
                                        : (isSelected ? 'var(--qr-accent)' : 'var(--qr-card-bg)'), 
                                    color: isEnReader 
                                        ? 'var(--qr-card-text)' 
                                        : (isSelected ? '#ffffff' : 'var(--qr-card-text)'), 
                                    borderColor: isEnReader 
                                        ? 'var(--qr-card-border)' 
                                        : (isSelected ? 'var(--qr-accent)' : 'var(--qr-card-border)') 
                                }}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className={`${isSingleReciterMode ? 'text-sm font-black' : 'text-xs font-bold'} truncate flex-1 text-center`}>
                                        {getReciterDisplayName(r.name, language)}
                                    </span>
                                    {isSelected && <Check size={isSingleReciterMode ? 20 : 16} className="shrink-0 ml-1" style={{ color: isEnReader ? 'var(--qr-card-text)' : '#ffffff' }} />}
                                </div>
                                {!isEnReader && (r.subTitle || r.subTitleEn) && (
                                    <span className={`${isSingleReciterMode ? 'text-xs mt-1.5' : 'text-[10px] mt-1'} opacity-90 ${isSelected ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-300'}`}>
                                        {isEn ? (r.subTitleEn || r.subTitle) : r.subTitle}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {filteredReaders.length === 0 && (
                        <div className="col-span-full py-8 text-center opacity-50 text-sm">
                            {tListen('noSearchResults', language)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReciterSelectModal;
