import React, { useState, useEffect, useRef } from 'react';
import { READERS } from './constants';

interface ReciterSelectModalProps {
    onClose: () => void;
    currentReader: string;
    onSelect: (readerId: string) => void;
    isLandscape?: boolean;
    readersList?: { id: string, name: string }[];
}

const ReciterSelectModal: React.FC<ReciterSelectModalProps> = ({ onClose, currentReader, onSelect, isLandscape, readersList = READERS }) => {
    const [isClosing, setIsClosing] = useState(false);
    const selectedRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // Use a timeout to ensure the modal animation doesn't interfere with scrolling
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

    return (
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={handleClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md sm:max-w-2xl rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className={`p-3 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'}`}>
                    {readersList.map(r => (
                        <button 
                            key={r.id} 
                            ref={currentReader === r.id ? selectedRef : null}
                            onClick={() => handleSelect(r.id)}
                            className={`w-full text-right p-3 rounded-xl border-2 transition-all font-bold flex flex-col justify-center items-center text-center ${currentReader === r.id ? '' : 'hover:opacity-80'}`}
                            style={{ 
                                backgroundColor: 'var(--qr-card-bg)', 
                                color: currentReader === r.id ? 'var(--qr-accent)' : 'var(--qr-card-text)', 
                                borderColor: currentReader === r.id ? 'var(--qr-accent)' : 'var(--qr-card-border)' 
                            }}
                        >
                            <div className="flex flex-col justify-center items-center w-full gap-2">
                                <span className="text-sm">{r.name}</span>
                                {currentReader === r.id && <i className="fa-solid fa-check text-xs"></i>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReciterSelectModal;
