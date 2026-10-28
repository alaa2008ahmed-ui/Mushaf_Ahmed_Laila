import React, { FC } from 'react';

const ScrollSpeedModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (minutes: number) => void,
    currentMinutes: number,
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelect, currentMinutes, isLandscape }) => {
    if (!isOpen) return null;
    const options = Array.from({length: 56}, (_, i) => i + 5);
    return (
        <div className={`fixed inset-0 z-[1200] bg-black/30 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-xl max-h-[90vh] rounded-2xl' : 'max-w-sm sm:max-w-2xl rounded-2xl max-h-[85vh]'} shadow-2xl flex flex-col border-none animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-3 border-b flex items-center justify-center shrink-0 border-none">
                    <span className="text-sm font-bold opacity-90">وقت التمرير (بالدقائق)</span>
                </div>
                <div className={`p-3 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5' : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5'}`}>
                    {options.map(m => {
                        const isSelected = currentMinutes === m;
                        return (
                            <button 
                                key={m} 
                                onClick={() => { onSelect(m); onClose(); }} 
                                className={`p-2.5 rounded-xl text-center font-bold transition-all border-none quran-raised-btn flex flex-col items-center justify-center ${isSelected ? 'theme-accent-btn quran-raised-btn-selected scale-105' : 'themed-card-bg'}`}
                            >
                                <span className="text-sm font-black">{m}</span>
                                <span className="text-[10px] block opacity-80 mt-0.5">دقيقة</span>
                            </button>
                        );
                    })}
                </div>
                <div className="p-3 border-none themed-card-bg rounded-b-2xl">
                    <button onClick={onClose} className="w-full py-2.5 rounded-xl font-bold border-none quran-raised-btn theme-btn-bg">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

export default ScrollSpeedModal;
