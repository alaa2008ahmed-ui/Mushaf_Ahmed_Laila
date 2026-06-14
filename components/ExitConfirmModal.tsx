
import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ExitConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLandscape?: boolean;
}

const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({ isOpen, onClose, onConfirm, isLandscape }) => {
    const { theme } = useTheme();

    const isGlass = theme.isGlass;
    const isGolden = theme.name.includes('ذهب') || theme.name.includes('Golden');
    const isEmerald = theme.name.includes('زمرد') || theme.name.includes('Emerald');

    const modalBg = isGlass 
        ? (isGolden ? '#451a03' : isEmerald ? '#064E3B' : '#1e293b')
        : (theme.bgColor || (theme.isOriginal ? '#ffffff' : '#1e293b'));
    
    const modalTextColor = isGlass ? '#FFFFFF' : theme.textColor;

    if (!isOpen) {
        return null;
    }

    return (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} fade-in`} onClick={onClose}>
            <div className={`rounded-xl p-6 ${isLandscape ? 'max-w-4xl h-full rounded-none' : 'max-w-sm w-full'} shadow-2xl border flex flex-col justify-center`} style={{ backgroundColor: modalBg, borderColor: theme.cardBorder || theme.palette[0] }} onClick={(e) => e.stopPropagation()}>
                <div className={isLandscape ? 'max-w-sm mx-auto w-full' : ''}>
                    <h3 className="text-lg font-bold text-center mb-4" style={{ color: modalTextColor }}>تأكيد الخروج</h3>
                    <p className="text-center mb-6 font-semibold" style={{ color: modalTextColor, opacity: 0.9 }}>هل تريد الخروج من مصحف احمد وليلى؟</p>
                    <div className="flex justify-center gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-2 rounded-lg font-bold transition active:scale-95"
                            style={{
                                backgroundColor: isGlass ? 'rgba(255, 255, 255, 0.15)' : (theme.isOriginal ? '#f3f4f6' : 'rgba(255, 255, 255, 0.1)'),
                                color: modalTextColor,
                                border: `1px solid ${isGlass ? 'rgba(255, 255, 255, 0.3)' : (theme.palette[1] || '#d1d5db')}`
                            }}
                        >
                            لا
                        </button>
                        <button 
                            onClick={onConfirm} 
                            className="px-6 py-2 rounded-lg font-bold transition active:scale-95 shadow-md"
                            style={{
                                backgroundColor: theme.palette[0] || '#ef4444',
                                color: theme.name === 'اسود' ? '#000000' : '#ffffff',
                                boxShadow: `0 4px 10px -2px ${theme.palette[0]}50`
                            }}
                        >
                            نعم
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExitConfirmModal;
