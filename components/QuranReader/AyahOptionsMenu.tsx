import React from 'react';
import { Play, BookOpen, Bookmark, Palette, Share2, Copy, Languages, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AyahOptionsMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onPlay: () => void;
    onTafseer: () => void;
    onTranslation?: () => void;
    onBilingual?: () => void;
    onBookmark: () => void;
    onCustomize: () => void;
    onShare?: () => void;
    onCopy?: () => void;
    currentTheme: any;
    isLandscape?: boolean;
}

const AyahOptionsMenu: React.FC<AyahOptionsMenuProps> = ({
    x, y, onClose, onPlay, onTafseer, onTranslation, onBilingual, onBookmark, onCustomize, onShare, onCopy, currentTheme, isLandscape
}) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    const iconColor = currentTheme.accent || '#000000';

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/30 flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'} backdrop-blur-sm animate-fadeIn`} onClick={onClose}>
            <div 
                dir={dir}
                className={`w-full ${isLandscape ? 'max-w-[300px] max-h-[90vh] rounded-2xl' : 'max-w-[280px] rounded-2xl'} bg-white shadow-2xl transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden animate-modal-enter`} 
                style={{ 
                    fontFamily: currentTheme.font,
                    border: `2px solid ${currentTheme.barBorder || currentTheme.accent || '#000000'}`
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className={`p-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar ${isLandscape ? '' : ''}`}>
                    <div className="bg-blue-50/50 py-1.5 px-3 rounded-md mb-2 text-right">
                        <span className="text-xs font-bold text-gray-700">{isEn ? "Verse Options" : "خيارات الآية"}</span>
                    </div>
                    
                    <MenuItem icon={<Play size={18} />} label={isEn ? "Listen" : "استماع"} onClick={onPlay} iconColor={iconColor} />
                    <MenuItem icon={<BookOpen size={18} />} label={isEn ? "Tafseer" : "تفسير"} onClick={onTafseer} iconColor={iconColor} />
                    {onTranslation && <MenuItem icon={<Languages size={18} />} label={isEn ? "Translation" : "ترجمة"} onClick={onTranslation} iconColor={iconColor} />}
                    {onBilingual && <MenuItem icon={<Globe size={18} />} label={isEn ? "Recitation & Translation" : "التلاوة والترجمة"} onClick={onBilingual} iconColor={iconColor} />}
                    <MenuItem icon={<Bookmark size={18} />} label={isEn ? "Save as Bookmark" : "حفظ كعلامة"} onClick={onBookmark} iconColor={iconColor} />
                    
                    <div className="h-px bg-gray-100 my-2"></div>
                    
                    {onShare && <MenuItem icon={<Share2 size={18} />} label={isEn ? "Share" : "مشاركة"} onClick={onShare} iconColor={iconColor} />}
                    {onCopy && <MenuItem icon={<Copy size={18} />} label={isEn ? "Copy Text" : "نسخ النص"} onClick={onCopy} iconColor={iconColor} />}
                    <MenuItem icon={<Palette size={18} />} label={isEn ? "Customize Theme" : "تخصيص المظهر"} onClick={onCustomize} iconColor={iconColor} />
                </div>
                
                <div className="p-3 border-t bg-gray-50/80">
                    <button 
                        onClick={onClose}
                        className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm active:scale-95 transition-all"
                    >
                        {isEn ? "Close" : "إغلاق"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, iconColor: string }> = ({ icon, label, onClick, iconColor }) => (
    <button onClick={onClick} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-right w-full group">
        <div style={{ color: iconColor }} className="transition-transform group-active:scale-90">{icon}</div>
        <span className="text-sm font-bold flex-1 text-gray-800">{label}</span>
    </button>
);

export default AyahOptionsMenu;
