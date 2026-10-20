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
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md sm:max-w-2xl rounded-2xl max-h-[90vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-3 border-b" style={{ borderColor: 'var(--qr-card-border)' }}>
                    <div className="relative">
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 opacity-50`} />
                        <input
                            type="text"
                            placeholder={language === 'en' ? 'Search Surah (name or number)...' : 'ابحث عن سورة بالاسم أو الرقم...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full bg-transparent border-2 rounded-xl py-2 ${isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                            style={{ 
                                borderColor: 'var(--qr-card-border)',
                                color: 'var(--qr-card-text)'
                            }}
                        />
                    </div>
                </div>
                <div className={`p-3 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'}`}>
                    {filteredSurahs.map(s => {
                        const isCurrent = currentSurah === s.number;
                        const surahLabel = `${formatListenNumber(s.number, language)} - ${getSurahDisplayName(s.number, language)}`;
                        return (
                            <button 
                                key={s.number} 
                                ref={isCurrent ? selectedRef : null}
                                onClick={() => handleSelect(s.number)}
                                className={`w-full p-2.5 rounded-xl border-2 transition-all font-bold flex flex-col justify-center items-center text-center cursor-pointer ${isCurrent ? 'theme-accent-btn' : 'border-transparent hover:opacity-80'}`}
                                style={!isCurrent ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', borderColor: 'var(--qr-card-border)' } : {}}
                            >
                                <div className="flex flex-col justify-center items-center w-full gap-1">
                                    <span className="text-xs sm:text-sm truncate w-full">{surahLabel}</span>
                                </div>
                            </button>
                        );
                    })}
                    {filteredSurahs.length === 0 && (
                        <div className="col-span-full py-8 text-center opacity-50 text-sm">
                            {tListen('noSearchResults', language)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListenSurahSelectModal;
