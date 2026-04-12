import React, { FC } from 'react';
import { TAFSEERS } from './constants';

const TafseerSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (tafseerId: string) => void,
    currentTafseerId: string,
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelect, currentTafseerId, isLandscape }) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 z-[1200] bg-transparent flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-[280px] max-h-[90vh] rounded-2xl' : 'max-w-[280px] rounded-2xl max-h-[80vh]'} shadow-2xl flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
                    {TAFSEERS.map(t => (
                        <button key={t.id} onClick={() => onSelect(t.id)} 
                            className={`w-full py-3 px-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 ${currentTafseerId === t.id ? '' : 'hover:opacity-80'}`} 
                            style={{ 
                                backgroundColor: 'transparent', 
                                color: currentTafseerId === t.id ? 'var(--qr-accent)' : 'var(--qr-card-text)', 
                                border: `2px solid ${currentTafseerId === t.id ? 'var(--qr-accent)' : 'var(--qr-card-border)'}` 
                            }}>
                            <span>{t.name}</span>
                            {currentTafseerId === t.id && <i className="fa-solid fa-check text-sm"></i>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TafseerSelectionModal;
