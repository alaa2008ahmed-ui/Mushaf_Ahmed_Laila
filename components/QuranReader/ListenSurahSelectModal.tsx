import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSurahDisplayName, formatListenNumber, tListen } from '../../utils/listenQuranTranslations';

interface ListenSurahSelectModalProps {
    onClose: () => void;
    currentSurah: number;
    onSelect: (surahNumber: number) => void;
    isLandscape?: boolean;
    surahsList: { number: number, name: string }[];
}

const ListenSurahSelectModal: React.FC<ListenSurahSelectModalProps> = ({ onClose, currentSurah, onSelect, isLandscape, surahsList }) => {
    const { language, isRTL, dir } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const selectedRef = useRef<HTMLButtonElement>(null);

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

    const handleSelect = (id: number) => {
        onSelect(id);
        handleClose();
    };

    const searchLower = searchTerm.toLowerCase().trim();
    const filteredSurahs = surahsList.filter(s => {
        if (!searchLower) return true;
        const arName = s.name.toLowerCase();
        const enName = getSurahDisplayName(s.number, 'en').toLowerCase();
        const numStr = String(s.number);
        return arName.includes(searchLower) || enName.includes(searchLower) || numStr.includes(searchLower);
    });

    return (
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={handleClose}>
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md sm:max-w-2xl rounded-3xl max-h-[90vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter border-0`} style={{ border: 'none', outline: 'none' }} onClick={e => e.stopPropagation()}>
                <div className="p-3.5 border-0">
                    <div className="relative quran-raised-card rounded-2xl overflow-hidden border-0">
                        <Search className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 opacity-50`} />
                        <input
                            type="text"
                            placeholder={language === 'en' ? 'Search Surah (name or number)...' : 'ابحث عن سورة بالاسم أو الرقم...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full bg-transparent border-0 py-2.5 ${isRTL ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} text-sm font-bold focus:outline-none`}
                            style={{ 
                                color: 'var(--qr-card-text)'
                            }}
                        />
                    </div>
                </div>
                <div className={`p-3.5 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5'}`}>
                    {filteredSurahs.map(s => {
                        const isCurrent = currentSurah === s.number;
                        const surahLabel = `${formatListenNumber(s.number, language)} - ${getSurahDisplayName(s.number, language)}`;
                        return (
                            <button 
                                key={s.number} 
                                ref={isCurrent ? selectedRef : null}
                                onClick={() => handleSelect(s.number)}
                                className={`w-full p-3 rounded-2xl border-0 transition-all font-bold flex flex-col justify-center items-center text-center cursor-pointer ${isCurrent ? 'theme-accent-btn quran-raised-btn-selected shadow-md scale-[1.02]' : 'quran-raised-btn hover:scale-[1.01]'}`}
                                style={!isCurrent ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', border: 'none' } : { border: 'none' }}
                            >
                                <div className="flex flex-col justify-center items-center w-full gap-1">
                                    <span className="text-xs sm:text-sm truncate w-full">{surahLabel}</span>
                                </div>
                            </button>
                        );
                    })}
                    {filteredSurahs.length === 0 && (
                        <div className="col-span-full py-8 text-center opacity-50 text-sm font-bold">
                            {tListen('noSearchResults', language)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListenSurahSelectModal;
