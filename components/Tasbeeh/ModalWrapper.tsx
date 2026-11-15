import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" 
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWrapper;
