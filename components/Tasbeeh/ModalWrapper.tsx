import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalWrapperProps {
    children?: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
    className?: string;
    noStyles?: boolean;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children, onClose, isOpen, className = "", noStyles = false }) => {
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
                        className={noStyles ? `w-full max-w-xs ${className}` : `p-6 rounded-2xl w-full max-w-xs space-y-4 bg-modal-bg text-modal-text shadow-2xl border border-modal-border ${className}`} 
                        onClick={e => e.stopPropagation()}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWrapper;
