import React, { FC } from 'react';
import { TAFSEERS, getTafseerDisplayName } from './constants';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const TafseerSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (tafseerId: string) => void,
    currentTafseerId: string,
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelect, currentTafseerId, isLandscape }) => {
    const { theme } = useTheme();
    const { language, dir } = useLanguage();
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-[320px] max-h-[90vh] rounded-xl' : 'max-w-[300px] rounded-2xl max-h-[80vh]'} shadow-2xl flex flex-col animate-modal-enter border-0`} 
                style={{ backgroundColor: 'var(--qr-modal-bg, #FFF)', color: 'var(--qr-modal-text, #000)', border: 'none', outline: 'none' }}
                onClick={e => e.stopPropagation()}>
                <div className={`${isLandscape ? 'p-3 gap-2.5' : 'p-4 gap-3'} overflow-y-auto flex-1 flex flex-col`}>
                    {TAFSEERS.map(t => {
                        const isSelected = currentTafseerId === t.id;
                        return (
                            <button key={t.id} onClick={() => onSelect(t.id)} 
                                className={`w-full ${isLandscape ? 'py-2.5 px-3 text-sm' : 'py-3 px-4 text-base'} rounded-xl font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${isSelected ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`} 
                                style={{ 
                                    backgroundColor: isSelected ? 'var(--qr-accent)' : 'var(--qr-card-bg)', 
                                    color: isSelected ? 'var(--qr-accent-text, #fff)' : 'var(--qr-card-text)'
                                }}>
                                <span className="font-bold truncate">{getTafseerDisplayName(t.id, language as 'ar' | 'en')}</span>
                                {isSelected && <i className="fa-solid fa-check text-sm quran-3d-icon"></i>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TafseerSelectionModal;
