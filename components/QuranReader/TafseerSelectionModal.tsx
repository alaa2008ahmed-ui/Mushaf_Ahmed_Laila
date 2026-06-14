import React, { FC } from 'react';
import { TAFSEERS } from './constants';
import { useTheme } from '../../context/ThemeContext';

const TafseerSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (tafseerId: string) => void,
    currentTafseerId: string,
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelect, currentTafseerId, isLandscape }) => {
    const { theme } = useTheme();
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 z-[1200] bg-transparent flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-[300px] max-h-[90vh] rounded-xl' : 'max-w-[280px] rounded-2xl max-h-[80vh]'} shadow-2xl flex flex-col animate-modal-enter`} 
                style={{ backgroundColor: 'var(--qr-modal-bg, #FFF)', color: 'var(--qr-modal-text, #000)' }}
                onClick={e => e.stopPropagation()}>
                <div className={`${isLandscape ? 'p-2.5 gap-2' : 'p-5 gap-4'} overflow-y-auto flex-1 flex flex-col`}>
                    {TAFSEERS.map(t => {
                        const isSelected = currentTafseerId === t.id;
                        return (
                            <button key={t.id} onClick={() => onSelect(t.id)} 
                                className={`w-full ${isLandscape ? 'py-1.5 px-2 text-sm' : 'py-3 px-4 text-lg'} rounded-xl font-bold transition-transform hover:scale-105 flex items-center justify-center gap-2 ${isSelected ? '' : 'hover:opacity-80'}`} 
                                style={{ 
                                    backgroundColor: isSelected ? 'color-mix(in srgb, var(--qr-accent) 15%, transparent)' : 'transparent', 
                                    color: isSelected ? 'var(--qr-accent)' : 'var(--qr-card-text)', 
                                    border: `2px solid ${isSelected ? 'var(--qr-accent)' : 'var(--qr-card-border)'}` 
                                }}>
                                <span>{t.name}</span>
                                {isSelected && <i className="fa-solid fa-check text-sm" style={{ color: 'var(--qr-accent)' }}></i>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TafseerSelectionModal;
