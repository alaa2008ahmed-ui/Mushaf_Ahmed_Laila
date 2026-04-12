import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ZoomModalProps {
    zoomedItem: {
        title?: string;
        text: string;
        source?: string;
    } | null;
    onClose: () => void;
}

const ZoomModal: React.FC<ZoomModalProps> = ({ zoomedItem, onClose }) => {
    const { theme } = useTheme();

    if (!zoomedItem) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" style={{ fontFamily: theme.font }} onClick={e => e.stopPropagation()}>
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors z-10"
                >
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>

                <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                    {zoomedItem.title && <h3 className="text-xl font-bold mb-4" style={{ color: theme.palette[1] }}>{zoomedItem.title}</h3>}
                    <p className="text-3xl md:text-4xl leading-relaxed">
                        {zoomedItem.text}
                    </p>
                    {zoomedItem.source && (
                        <p className="text-lg mt-6 font-bold" style={{ color: theme.palette[1] }}>
                            المصدر: {zoomedItem.source}
                        </p>
                    )}
                </div>

                <div className="mt-6 shrink-0">
                    <button onClick={onClose} className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default ZoomModal;
