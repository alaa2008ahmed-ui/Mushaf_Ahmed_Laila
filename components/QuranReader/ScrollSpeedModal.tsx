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
        <div className={`fixed inset-0 z-[1200] bg-transparent flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-xl max-h-[90vh] rounded-2xl' : 'max-w-sm sm:max-w-2xl rounded-2xl max-h-[90vh]'} shadow-2xl flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className={`p-2 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2' : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'}`}>
                    {options.map(m => (
                        <button key={m} onClick={() => { onSelect(m); onClose(); }} className={`p-2 rounded-lg text-center font-bold transition ${currentMinutes === m ? 'theme-accent-btn' : 'themed-card-bg border'}`}>
                            <span className="text-sm">{m}</span>
                            <span className="text-[10px] block opacity-70">دقيقة</span>
                        </button>
                    ))}
                </div>
                <div className="p-3 border-t themed-card-bg rounded-b-2xl">
                    <button onClick={onClose} className="w-full py-2 rounded-xl font-bold theme-btn-bg">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

export default ScrollSpeedModal;
