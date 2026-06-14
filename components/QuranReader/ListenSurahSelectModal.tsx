import React, { useEffect, useRef } from 'react';

interface ListenSurahSelectModalProps {
    onClose: () => void;
    currentSurah: number;
    onSelect: (surahNumber: number) => void;
    isLandscape?: boolean;
    surahsList: { number: number, name: string }[];
}

const ListenSurahSelectModal: React.FC<ListenSurahSelectModalProps> = ({ onClose, currentSurah, onSelect, isLandscape, surahsList }) => {
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

    return (
        <div className={`fixed inset-0 bg-transparent z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={handleClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md sm:max-w-2xl rounded-2xl max-h-[90vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className={`p-3 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'}`}>
                    {surahsList.map(s => (
                        <button 
                            key={s.number} 
                            ref={currentSurah === s.number ? selectedRef : null}
                            onClick={() => handleSelect(s.number)}
                            className={`w-full text-right p-3 rounded-xl border-2 transition-all font-bold flex flex-col justify-center items-center text-center ${currentSurah === s.number ? 'theme-accent-btn' : 'border-transparent hover:opacity-80'}`}
                            style={currentSurah !== s.number ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', borderColor: 'var(--qr-card-border)' } : {}}
                        >
                            <div className="flex flex-col justify-center items-center w-full gap-2">
                                <span className="text-sm">{s.number} - {s.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ListenSurahSelectModal;
