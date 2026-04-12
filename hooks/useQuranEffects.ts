import React, { useEffect } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';

export const useQuranEffects = (
    isFloatingMenuOpen: boolean,
    floatingMenuRef: React.RefObject<HTMLDivElement>,
    menuButtonRef: React.RefObject<HTMLButtonElement>,
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>,
    activeModals: string[],
    tafseerInfo: any,
    tafseerSelectionInfo: any,
    sajdahCardInfo: any,
    isPageInputActive: boolean,
    closeModal: (modalName: string) => void,
    handleCloseSajdahCard: () => void,
    setTafseerInfo: React.Dispatch<React.SetStateAction<any>>,
    setTafseerSelectionInfo: React.Dispatch<React.SetStateAction<any>>,
    setIsPageInputActive: React.Dispatch<React.SetStateAction<boolean>>,
    autoScrollPausedRef: React.MutableRefObject<boolean>,
    setAutoScrollState: React.Dispatch<React.SetStateAction<any>>,
    isPageInputActiveRef: React.MutableRefObject<boolean>,
    pageInputRef: React.RefObject<HTMLInputElement>,
    isBookmarksModalOpen: boolean,
    setBookmarks: React.Dispatch<React.SetStateAction<any[]>>,
    modeSuffix: string,
    hasJumpedRef: React.MutableRefObject<boolean>,
    initialLandscape: boolean,
    jumpToAyah: (s: number, a: number, instant: boolean) => void,
    quranData: any
) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (isFloatingMenuOpen && 
                floatingMenuRef.current && 
                !floatingMenuRef.current.contains(event.target as Node) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target as Node)) {
                setIsFloatingMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isFloatingMenuOpen, floatingMenuRef, menuButtonRef, setIsFloatingMenuOpen]);

    useEffect(() => {
        const interceptor = () => {
            if (activeModals.length > 0) {
                const lastModal = activeModals[activeModals.length - 1];
                closeModal(lastModal);
                return true;
            }
            if (tafseerInfo.isOpen) {
                if (tafseerInfo.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                }
                setTafseerInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (tafseerSelectionInfo.isOpen) {
                if (tafseerSelectionInfo.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                }
                setTafseerSelectionInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (sajdahCardInfo.show) {
                handleCloseSajdahCard();
                return true;
            }
            if (isFloatingMenuOpen) {
                setIsFloatingMenuOpen(false);
                return true;
            }
            if (isPageInputActive) {
                setIsPageInputActive(false);
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [activeModals, tafseerInfo, tafseerSelectionInfo, sajdahCardInfo, isFloatingMenuOpen, isPageInputActive, closeModal, handleCloseSajdahCard, setTafseerInfo, setTafseerSelectionInfo, setIsFloatingMenuOpen, setIsPageInputActive, autoScrollPausedRef, setAutoScrollState]);

    useEffect(() => {
        if (isPageInputActive && pageInputRef.current) {
            pageInputRef.current.focus();
        }
    }, [isPageInputActive, pageInputRef]);

    useEffect(() => {
        if (isBookmarksModalOpen) {
            setBookmarks(JSON.parse(localStorage.getItem('quran_bookmarks_list' + modeSuffix) || '[]'));
        }
    }, [isBookmarksModalOpen, modeSuffix, setBookmarks]);

    useEffect(() => {
        if (hasJumpedRef.current || !quranData) return;
        hasJumpedRef.current = true;
        const key = initialLandscape ? 'last_pos_h' : 'last_pos_v';
        const lastPos = JSON.parse(localStorage.getItem(key) || '{}');
        setTimeout(() => {
            jumpToAyah(lastPos.s || 1, lastPos.a || 1, true);
        }, 100);
    }, [jumpToAyah, initialLandscape, hasJumpedRef, quranData]);
};
