import React from 'react';

interface TafseerModalProps {
    isOpen: boolean;
    isLoading: boolean;
    title: string;
    text: string;
    onClose: () => void;
    isLandscape?: boolean;
    currentTheme?: any;
}

const TafseerModal: React.FC<TafseerModalProps> = ({ isOpen, isLoading, title, text, onClose, isLandscape, currentTheme }) => {
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[1200] bg-transparent flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[90vh]'} flex flex-col shadow-2xl`} 
                 style={{ 
                     backgroundColor: currentTheme?.modalBg, 
                     color: currentTheme?.modalText,
                     fontFamily: currentTheme?.font
                 }}
                 onClick={e => e.stopPropagation()}>
                <div className="p-5 overflow-y-auto text-center flex-1">
                    {isLoading ? (
                        <div>
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto" style={{ borderColor: currentTheme?.accent || '#10b981' }}></div>
                            <p className="mt-3 opacity-60">جاري تحميل التفسير...</p>
                        </div>
                    ) : (
                        <p className="text-lg leading-relaxed font-serif" style={{ whiteSpace: 'pre-wrap', color: currentTheme?.modalText }}>{text}</p>
                    )}
                </div>
                <div className="p-2 border-t rounded-b-2xl themed-card-bg" style={{ backgroundColor: currentTheme?.cardBg, borderColor: currentTheme?.cardBorder }}>
                    <button onClick={onClose} className="w-full py-2 rounded-xl font-bold transition theme-btn-bg" style={{ backgroundColor: currentTheme?.btnBg, color: currentTheme?.btnText }}>إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default TafseerModal;
