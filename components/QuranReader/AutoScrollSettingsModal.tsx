import React, { FC } from 'react';

const AutoScrollSettingsModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelectTime: (minutes: number) => void,
    currentMinutes: number,
    isLandscape?: boolean,
    isEn?: boolean
}> = ({ isOpen, onClose, onSelectTime, currentMinutes, isLandscape, isEn = false }) => {
    if (!isOpen) return null;
    const options = Array.from({length: 56}, (_, i) => i + 5);
    return (
        <div className={`fixed inset-0 z-[1200] bg-black/30 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-[320px] rounded-2xl max-h-[70vh]'} shadow-2xl flex flex-col border-none animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="mb-4 font-bold text-center text-base opacity-90">{isEn ? 'Scroll Duration (Minutes)' : 'وقت التمرير (بالدقائق)'}</div>
                    <div className="grid grid-cols-4 gap-2.5">
                        {options.map(m => {
                            const isSelected = currentMinutes === m;
                            return (
                                <button 
                                    key={m} 
                                    onClick={() => { onSelectTime(m); onClose(); }} 
                                    className={`p-2.5 rounded-xl text-center font-bold transition-all border-none quran-raised-btn ${isSelected ? 'theme-accent-btn quran-raised-btn-selected scale-105' : 'themed-card-bg'}`}
                                >
                                    <span className="text-sm font-black">{m}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoScrollSettingsModal;
