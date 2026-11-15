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
    const navigateBackRef = useRef(navigateBack);
    navigateBackRef.current = navigateBack;
    const setIsThemeSelectorOpenRef = useRef(setIsThemeSelectorOpen);
    setIsThemeSelectorOpenRef.current = setIsThemeSelectorOpen;
    const setShowExitConfirmRef = useRef(setShowExitConfirm);
    setShowExitConfirmRef.current = setShowExitConfirm;
    const setIsSideMenuOpenRef = useRef(setIsSideMenuOpen);
    setIsSideMenuOpenRef.current = setIsSideMenuOpen;

    const handleBackButton = useCallback(() => {
        const now = Date.now();
        // Debounce duplicate synchronous back events (Capacitor backButton + document backbutton)
        if (now - lastBackTimeRef.current < 150) {
            return;
        }
        lastBackTimeRef.current = now;

        // 1. Close exit confirmation dialog if open
        if (showExitConfirmRef.current) {
            setShowExitConfirmRef.current(false);
            return;
        }

        // 2. Close side menu if open
        if (isSideMenuOpenRef.current && setIsSideMenuOpenRef.current) {
            setIsSideMenuOpenRef.current(false);
            return;
        }

        // 3. Close theme selector if open
        if (isThemeSelectorOpenRef.current) {
            setIsThemeSelectorOpenRef.current(false);
            return;
        }

        // 4. Check in-page interceptors (LIFO: newest child modal/overlay runs first)
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
            navigateBackRef.current();
        } else {
            // At root home screen (Classic or Modern Smart): prompt exit confirmation modal
            setShowExitConfirmRef.current(true);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        // 1. Capacitor native Android back button event (hardware button & back gestures)
        let capacitorListener: Promise<{ remove: () => Promise<void> }> | null = null;
        try {
            capacitorListener = App.addListener('backButton', () => {
                handleBackButton();
            });
            capacitorListener.then((handle) => {
                if (!isMounted) {
                    handle.remove().catch(() => {});
                }
            }).catch(() => {});
        } catch (e) {
            console.warn('Capacitor App backButton listener registration warning:', e);
        }

        // 2. Browser / Android WebView popstate event
        const handlePopState = (e: PopStateEvent) => {
            e.preventDefault();
            handleBackButton();
            // Re-arm history trap state so WebView/browser back stays inside the app
            try {
                window.history.pushState({ page: 'mushaf_history', t: Date.now() }, '', window.location.href);
            } catch {}
        };

        // Push initial state trap only if not already set
        try {
            if (window.history.state?.page !== 'mushaf_history') {
                window.history.pushState({ page: 'mushaf_history', t: Date.now() }, '', window.location.href);
            }
        } catch {}
        window.addEventListener('popstate', handlePopState);

        // 3. Document backbutton event for Cordova / Android Capacitor WebView bridge
        document.addEventListener('backbutton', handleBackButton, false);

        return () => {
            isMounted = false;
            if (capacitorListener && typeof capacitorListener.then === 'function') {
                capacitorListener.then((l) => l.remove()).catch(() => {});
            }
            document.removeEventListener('backbutton', handleBackButton, false);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [handleBackButton]);
}
