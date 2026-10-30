import { useEffect, useRef, useCallback } from 'react';
import { App } from '@capacitor/app';

interface UseBackButtonProps {
    isThemeSelectorOpen: boolean;
    showExitConfirm: boolean;
    isSideMenuOpen?: boolean;
    history: string[];
    navigateBack: () => void;
    setIsThemeSelectorOpen: (isOpen: boolean) => void;
    setShowExitConfirm: (show: boolean) => void;
    setIsSideMenuOpen?: (isOpen: boolean) => void;
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
    isSideMenuOpen,
    history,
    navigateBack,
    setIsThemeSelectorOpen,
    setShowExitConfirm,
    setIsSideMenuOpen,
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

    const isSideMenuOpenRef = useRef(isSideMenuOpen);
    useEffect(() => {
        isSideMenuOpenRef.current = isSideMenuOpen;
    }, [isSideMenuOpen]);

    const lastBackTimeRef = useRef(0);

    const handleBackButton = useCallback(() => {
        const now = Date.now();
        // Debounce hardware/gesture back button to avoid double triggering within 250ms
        if (now - lastBackTimeRef.current < 250) {
            return;
        }
        lastBackTimeRef.current = now;

        // 1. Close exit confirmation dialog if open
        if (showExitConfirmRef.current) {
            setShowExitConfirm(false);
            return;
        }

        // 2. Close side menu if open
        if (isSideMenuOpenRef.current && setIsSideMenuOpen) {
            setIsSideMenuOpen(false);
            return;
        }

        // 3. Close theme selector if open
        if (isThemeSelectorOpenRef.current) {
            setIsThemeSelectorOpen(false);
            return;
        }

        // 4. Check in-page interceptors (modals, popups, tafseer, image share, etc.)
        for (let i = backButtonInterceptors.length - 1; i >= 0; i--) {
            const interceptor = backButtonInterceptors[i];
            try {
                if (interceptor()) {
                    return; // In-page overlay handled the back button
                }
            } catch (err) {
                console.error('Error executing back interceptor:', err);
            }
        }

        // 5. Navigate back in history if not at root home screen
        if (historyRef.current.length > 1) {
            navigateBack();
        } else {
            // At root home screen (Classic or Modern Smart): prompt exit confirmation modal
            setShowExitConfirm(true);
        }
    }, [navigateBack, setIsThemeSelectorOpen, setShowExitConfirm, setIsSideMenuOpen]);

    useEffect(() => {
        // 1. Capacitor native Android back button event (hardware button & back gestures)
        let capacitorListener: any = null;
        try {
            capacitorListener = App.addListener('backButton', () => {
                handleBackButton();
            });
        } catch (e) {
            console.warn('Capacitor App backButton listener registration warning:', e);
        }

        // 2. Browser / Android WebView popstate event
        const handlePopState = (e: PopStateEvent) => {
            e.preventDefault();
            handleBackButton();
            // Re-arm history trap state so Android WebView history does not pop out of app
            window.history.pushState({ page: 'mushaf_history', t: Date.now() }, '', window.location.href);
        };

        // Push initial state trap if not already set
        window.history.pushState({ page: 'mushaf_history', t: Date.now() }, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        // 3. Document backbutton event for Cordova / older WebView runtimes
        document.addEventListener('backbutton', handleBackButton, false);

        return () => {
            if (capacitorListener && typeof capacitorListener.then === 'function') {
                capacitorListener.then((l: any) => l.remove()).catch(() => {});
            }
            document.removeEventListener('backbutton', handleBackButton, false);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [handleBackButton]);
}
