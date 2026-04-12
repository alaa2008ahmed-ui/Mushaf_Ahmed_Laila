import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
    currentTheme?: any;
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose, currentTheme }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (show) {
            setShouldRender(true);
            // Small delay to ensure render happens before class addition for transition
            requestAnimationFrame(() => setIsVisible(true));
            
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 400);
            return () => clearTimeout(timer);
        }
    }, [show, onClose, message]);

    if (!shouldRender) return null;

    return (
        <div 
            id="message-toast" 
            className={`${isVisible ? 'show' : ''} modal-skinned toast-element`}
            style={{ fontFamily: currentTheme?.font }}
        >
            <div className="p-2 rounded-full theme-header-bg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div>
                <div className="font-bold text-sm">تنبيه</div>
                <div id="toast-message" className="text-xs mt-0.5 opacity-80">{message}</div>
            </div>
        </div>
    );
};

export default Toast;
