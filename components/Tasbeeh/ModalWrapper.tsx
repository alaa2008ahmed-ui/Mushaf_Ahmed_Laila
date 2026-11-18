import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ModalWrapperProps {
    children?: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
    title?: string;
    className?: string;
    noStyles?: boolean;
    cardBorderColor?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children, onClose, isOpen, title, className = "", noStyles = false }) => {
    const { theme } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/65 z-50 flex justify-center items-center p-4" 
            onClick={onClose}
        >
            <div 
                className={noStyles
                    ? `w-full ${className.includes('max-w-') ? '' : 'max-w-xs'} ${className}`
                    : `app-page-card border-0 p-6 rounded-2xl w-full ${className.includes('max-w-') ? '' : 'max-w-xs'} space-y-4 bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white ${className}`} 
                onClick={e => e.stopPropagation()}
            >
                {title && !noStyles && (
                    <h3 className="text-base sm:text-lg font-black text-center leading-tight">
                        {title}
                    </h3>
                )}
                {children}
            </div>
        </div>
    );
};

export default ModalWrapper;
