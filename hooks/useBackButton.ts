import { useEffect, useRef, useCallback } from 'react';
import { App } from '@capacitor/app';

interface UseBackButtonProps {
    isThemeSelectorOpen: boolean;
    showExitConfirm: boolean;
    history: string[];
    navigateBack: () => void;
    setIsThemeSelectorOpen: (isOpen: boolean) => void;
    setShowExitConfirm: (show: boolean) => void;
}

// Global stack of interceptors
const backButtonInterceptors: Array<() => boolean> = [];

export const registerBackInterceptor = (interceptor: () => boolean) => {
    backButtonInterceptors.push(interceptor);
    return () => {
        const index = backButtonInterceptors.indexOf(interceptor);
        if (index !== -1) {
            backButtonInterceptors.splice(index, 1);
        }
    };
};

export function useBackButton({
    isThemeSelectorOpen,
    showExitConfirm,
    history,
    navigateBack,
    setIsThemeSelectorOpen,
    setShowExitConfirm,
}: UseBackButtonProps) {
    const historyRef = useRef(history);
    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    const isThemeSelectorOpenRef = useRef(isThemeSelectorOpen);
    useEffect(() => {
        isThemeSelectorOpenRef.current = isThemeSelectorOpen;
    }, [isThemeSelectorOpen]);

    const showExitConfirmRef = useRef(showExitConfirm);
    useEffect(() => {
        showExitConfirmRef.current = showExitConfirm;
    }, [showExitConfirm]);

    const handleBackButton = useCallback(() => {
        if (showExitConfirmRef.current) {
            setShowExitConfirm(false);
            return;
        }

        if (isThemeSelectorOpenRef.current) {
            setIsThemeSelectorOpen(false);
            return;
        }

        // Check if any interceptor handles the back button
        for (let i = backButtonInterceptors.length - 1; i >= 0; i--) {
            const interceptor = backButtonInterceptors[i];
            if (interceptor()) {
                return; // Interceptor handled it
            }
        }

        if (historyRef.current.length > 1) {
            navigateBack();
        } else {
            setShowExitConfirm(true);
        }
    }, [navigateBack, setIsThemeSelectorOpen, setShowExitConfirm]);

    useEffect(() => {
        const listener = App.addListener('backButton', () => {
            handleBackButton();
        });

        // Also keep the document listener for broader compatibility
        document.addEventListener('backbutton', handleBackButton, false);

        return () => {
            listener.then(l => l.remove());
            document.removeEventListener('backbutton', handleBackButton, false);
        };
    }, [handleBackButton]);
}
