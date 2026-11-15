import React, { useEffect } from 'react';
import { showGlobalAppToast } from '../../utils/appNotificationSettings';

interface ToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
    currentTheme?: any;
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show && message) {
            showGlobalAppToast(message);
            onClose();
        }
    }, [show, message, onClose]);

    return null;
};

export default Toast;
