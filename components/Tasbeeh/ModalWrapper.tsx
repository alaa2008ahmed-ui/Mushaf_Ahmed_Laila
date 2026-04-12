import React from 'react';

interface ModalWrapperProps {
    children?: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children, onClose, isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="p-6 rounded-2xl w-full max-w-xs space-y-4 bg-modal-bg text-modal-text shadow-2xl border border-modal-border" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default ModalWrapper;
