import React, { FC } from 'react';

const MushafSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (type: 'uthmani') => void,
    currentType: 'uthmani',
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelect, currentType, isLandscape }) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 z-[1200] bg-black/25 backdrop-blur-[2px] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-sm sm:max-w-2xl rounded-3xl max-h-[90vh]'} shadow-2xl flex flex-col border-0 overflow-hidden animate-modal-enter`} style={{ border: 'none', outline: 'none' }} onClick={e => e.stopPropagation()}>
                <div className={`p-5 flex-1 grid ${isLandscape ? 'grid-cols-1 gap-4' : 'grid-cols-1 gap-4'}`}>
                    <button onClick={() => onSelect('uthmani')} 
                        className="w-full p-5 rounded-2xl text-center font-bold transition flex flex-col justify-center items-center gap-2.5 border-0 quran-raised-btn-selected active:scale-95" 
                        style={{ 
                            backgroundColor: 'var(--qr-card-bg)', 
                            color: currentType === 'uthmani' ? 'var(--qr-accent)' : 'var(--qr-card-text)', 
                            border: 'none'
                        }}>
                        <i className="fa-solid fa-book-open text-3xl quran-3d-icon"></i>
                        <span className="text-base font-black">المصحف العثماني</span>
                        {currentType === 'uthmani' && <i className="fa-solid fa-check text-sm quran-3d-icon"></i>}
                    </button>
                </div>
                <div className="p-3.5 border-0 themed-card-bg rounded-b-3xl">
                    <button onClick={onClose} className="w-full py-3 rounded-2xl font-bold border-0 quran-raised-btn theme-btn-bg active:scale-95 transition-all">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

export default MushafSelectionModal;
