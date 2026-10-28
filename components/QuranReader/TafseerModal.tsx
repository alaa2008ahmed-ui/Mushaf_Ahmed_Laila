import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface TafseerModalProps {
    isOpen: boolean;
    isLoading: boolean;
    title: string;
    text: string;
    onClose: () => void;
    onOpenThemes?: () => void;
    isLandscape?: boolean;
    currentTheme?: any;
}

const TafseerModal: React.FC<TafseerModalProps> = ({ isOpen, isLoading, title, text, onClose, onOpenThemes, isLandscape, currentTheme }) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/35 backdrop-blur-[2px] flex items-center justify-center ${isLandscape ? 'p-1' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-3xl max-h-[90vh]'} flex flex-col shadow-2xl border-0 overflow-hidden animate-modal-enter`} 
                 style={{ 
                     backgroundColor: currentTheme?.modalBg, 
                     color: currentTheme?.modalText,
                     fontFamily: currentTheme?.font,
                     border: 'none',
                     outline: 'none'
                 }}
                 onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 flex justify-between items-center shrink-0 border-0">
                    <div className="flex items-center gap-2.5 truncate max-w-[75%]">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 quran-raised-card"
                             style={{ backgroundColor: `${currentTheme?.accent || '#10b981'}20`, color: currentTheme?.accent || '#10b981' }}>
                            <i className="fa-solid fa-book-open quran-3d-icon text-sm"></i>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base truncate">{title}</h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button 
                            onClick={onOpenThemes}
                            className="p-2 rounded-xl transition-all quran-raised-btn flex items-center justify-center border-0"
                            style={{ color: currentTheme?.accent || 'inherit' }}
                            title={isEn ? "Change Theme" : "تغيير الثيم"}
                        >
                            <i className="fa-solid fa-palette quran-3d-icon"></i>
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-xl transition-all quran-raised-btn flex items-center justify-center border-0 opacity-70 hover:opacity-100"
                            title={isEn ? "Close" : "إغلاق"}
                        >
                            <i className="fa-solid fa-xmark quran-3d-icon"></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 px-8 overflow-y-auto text-center flex-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto" style={{ borderColor: currentTheme?.accent || '#10b981' }}></div>
                            <p className="mt-4 font-bold opacity-60 text-sm">{isEn ? "Loading Tafseer..." : "جاري تحميل التفسير..."}</p>
                        </div>
                    ) : (
                        <p className="text-lg leading-relaxed font-serif" style={{ whiteSpace: 'pre-wrap', color: currentTheme?.modalText }}>{text}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-0 rounded-b-3xl">
                    <button onClick={onClose} className="w-full py-3 rounded-2xl font-bold transition border-0 quran-raised-btn-selected flex items-center justify-center gap-2" style={{ backgroundColor: currentTheme?.accent || currentTheme?.btnBg, color: currentTheme?.accentText || currentTheme?.btnText }}>
                        <span>{isEn ? "Close" : "إغلاق"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TafseerModal;
