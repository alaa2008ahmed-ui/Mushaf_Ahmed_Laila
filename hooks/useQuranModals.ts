import React, { useCallback } from 'react';

export const useQuranModals = (
    activeModals: string[],
    setActiveModals: React.Dispatch<React.SetStateAction<string[]>>,
    tafseerSelectionInfo: any,
    setTafseerSelectionInfo: React.Dispatch<React.SetStateAction<any>>,
    autoScrollStateRef: React.MutableRefObject<any>,
    autoScrollPausedRef: React.MutableRefObject<boolean>,
    setAutoScrollState: React.Dispatch<React.SetStateAction<any>>,
    wasAutoscrollingBeforeModal: React.MutableRefObject<boolean>,
    stopAudio: () => void
) => {
    const closeModal = useCallback((modalName: string) => {
        setActiveModals(p => p.filter(m => m !== modalName));
        if (wasAutoscrollingBeforeModal.current) {
            const anyOtherOpen = activeModals.some(m => m !== modalName);
            if (!anyOtherOpen) {
                autoScrollPausedRef.current = false;
                setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                wasAutoscrollingBeforeModal.current = false;
            }
        }
    }, [activeModals, autoScrollPausedRef, setAutoScrollState, wasAutoscrollingBeforeModal, setActiveModals]);

    const openModal = useCallback((modalName: string) => { 
        stopAudio(); 
        let wasScrolling = false;
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
            const newState = { ...autoScrollStateRef.current, isPaused: true };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
            wasAutoscrollingBeforeModal.current = true;
            wasScrolling = true;
        }
        if (modalName === 'tafseer-selection-modal') {
            setTafseerSelectionInfo((p: any) => ({ ...p, isOpen: true, wasAutoscrolling: wasScrolling }));
        } else {
            setActiveModals(p => [...p.filter(m => m !== modalName), modalName]); 
        }
    }, [stopAudio, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, wasAutoscrollingBeforeModal, setTafseerSelectionInfo, setActiveModals]);

    return { closeModal, openModal };
};
