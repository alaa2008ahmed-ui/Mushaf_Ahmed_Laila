import React, { useCallback, useRef } from 'react';

export const useQuranHandlers = (
    isLandscapeRef: React.MutableRefObject<boolean>,
    initialLandscape: boolean,
    autoScrollStateRef: React.MutableRefObject<any>,
    autoScrollPausedRef: React.MutableRefObject<boolean>,
    setAutoScrollState: React.Dispatch<React.SetStateAction<any>>,
    setIsLandscapeUIHidden: React.Dispatch<React.SetStateAction<boolean>>,
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>,
    handleAyahClick: (s: number, a: number) => void,
    quranData: any,
    setIsTafseerLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setTafseerInfo: React.Dispatch<React.SetStateAction<any>>,
    setTafseerSelectionInfo: React.Dispatch<React.SetStateAction<any>>,
    setAyahContextMenu: React.Dispatch<React.SetStateAction<any>>,
    settingsRef: React.MutableRefObject<any>,
    settings: any,
    setSettings: React.Dispatch<React.SetStateAction<any>>,
    modeSuffix: string,
    setPageInput: React.Dispatch<React.SetStateAction<string>>,
    pageInput: string,
    jumpToPage: (pageNum: number, instant: boolean) => void,
    setIsPageInputActive: React.Dispatch<React.SetStateAction<boolean>>,
    autoScrollState: any,
    showToast: (msg: string) => void,
    setQuranData: React.Dispatch<React.SetStateAction<any>>,
    closeModal: (modalName: string) => void,
    quranJson: any
) => {

    const handleAyahTextClick = useCallback((s: number, a: number) => {
        handleAyahClick(s, a);
        setIsFloatingMenuOpen(false);
        
        if (autoScrollStateRef.current.isActive) {
            const newPausedState = !autoScrollStateRef.current.isPaused;
            autoScrollPausedRef.current = newPausedState;
            const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
            
            if (initialLandscape) {
                setIsLandscapeUIHidden(!newPausedState);
            }
        } else if (initialLandscape) {
            setIsLandscapeUIHidden(prev => !prev);
        }
    }, [handleAyahClick, setIsFloatingMenuOpen, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, initialLandscape, setIsLandscapeUIHidden]);

    const handleVerseClick = useCallback((s: number, a: number, event: React.MouseEvent) => {
        event.stopPropagation();
        handleAyahClick(s, a);
        if (!quranData) return;
        const surah = quranData.surahs.find((su: any) => su.number === s);
        if (surah) {
            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            if (wasAutoscrolling) {
                autoScrollPausedRef.current = true;
                const newState = { ...autoScrollStateRef.current, isPaused: true };
                autoScrollStateRef.current = newState;
                setAutoScrollState(newState);
            if (initialLandscape) {
                setIsLandscapeUIHidden(false);
            }
            }
            setIsTafseerLoading(true);
            setTafseerInfo({ isOpen: true, s, a, text: '', surahName: surah.name, wasAutoscrolling });
        }
    }, [quranData, handleAyahClick, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, initialLandscape, setIsLandscapeUIHidden, setIsTafseerLoading, setTafseerInfo]);

    const handleVerseLongPress = useCallback((s: number, a: number) => {
        if (isLandscapeRef.current) return;
        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
        if (wasAutoscrolling) {
            autoScrollPausedRef.current = true;
            setAutoScrollState((p: any) => ({ ...p, isPaused: true }));
            autoScrollStateRef.current = { ...autoScrollStateRef.current, isPaused: true };
        }
        setTafseerSelectionInfo({ isOpen: true, s, a, wasAutoscrolling });
    }, [isLandscapeRef, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, setTafseerSelectionInfo]);

    const handleAyahLongPress = useCallback((s: number, a: number, x: number, y: number) => {
        if (isLandscapeRef.current) return;
        setAyahContextMenu({ isOpen: true, x, y, s, a, tempSettings: { ...settingsRef.current } });
    }, [isLandscapeRef, setAyahContextMenu, settingsRef]);

    const handleTafseerSelect = useCallback((tafseerId: string) => {
        setTafseerSelectionInfo((prev: any) => {
            if (prev.wasAutoscrolling) {
                autoScrollPausedRef.current = false;
                setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
            }
            return { ...prev, isOpen: false, wasAutoscrolling: false };
        });
        
        const newSettings = { ...settings, tafseer: tafseerId };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('settings-change'));
    }, [setTafseerSelectionInfo, autoScrollPausedRef, setAutoScrollState, settings, setSettings, modeSuffix]);

    const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
        setPageInput(value);
    }, [setPageInput]);

    const handlePageInputBlur = useCallback(() => {
        if (pageInput) {
            const pageNum = parseInt(pageInput, 10);
            if (pageNum >= 1 && pageNum <= 604) {
                jumpToPage(pageNum, true);
            }
        }
        setIsPageInputActive(false);
        setPageInput(''); 
    }, [pageInput, jumpToPage, setIsPageInputActive, setPageInput]);

    const handlePageInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePageInputBlur();
        }
    }, [handlePageInputBlur]);

    const handlePageButtonClick = useCallback(() => {
        if (initialLandscape) return;
        if (autoScrollState.isActive && !autoScrollState.isPaused) {
            autoScrollPausedRef.current = true;
            setAutoScrollState((p: any) => ({ ...p, isPaused: true }));
        }
        setIsPageInputActive(true);
    }, [initialLandscape, autoScrollState.isActive, autoScrollState.isPaused, autoScrollPausedRef, setAutoScrollState, setIsPageInputActive]);

    const handleMushafTypeSelect = useCallback(() => {
        setQuranData(quranJson.data);
        closeModal('mushaf-selection-modal');
        showToast('تم تفعيل المصحف العثماني');
        window.dispatchEvent(new Event('settings-change'));
    }, [setQuranData, quranJson, closeModal, showToast]);

    const handleInteractionStart = useCallback(() => {
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
        }
    }, [autoScrollStateRef, autoScrollPausedRef]);

    const handleInteractionEnd = useCallback((activeModals: string[], tafseerInfoIsOpen: boolean, tafseerSelectionInfoIsOpen: boolean) => {
        setTimeout(() => {
             const isAnyModalOpen = activeModals.length > 0 || tafseerInfoIsOpen || tafseerSelectionInfoIsOpen;
             if (!isAnyModalOpen && autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                 autoScrollPausedRef.current = false;
             }
        }, 100);
    }, [autoScrollStateRef, autoScrollPausedRef]);

    const handleScreenTap = useCallback(() => {
      setIsFloatingMenuOpen(false);
      if (autoScrollStateRef.current.isActive) {
        const newPausedState = !autoScrollStateRef.current.isPaused;
        autoScrollPausedRef.current = newPausedState;
        const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
        autoScrollStateRef.current = newState;
        setAutoScrollState(newState);
        
        if (initialLandscape) {
            setIsLandscapeUIHidden(!newPausedState);
        }
      } else if (initialLandscape) {
          setIsLandscapeUIHidden((prev: boolean) => !prev);
      }
    }, [setIsFloatingMenuOpen, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, initialLandscape, setIsLandscapeUIHidden]);

    return {
        handleAyahTextClick, handleVerseClick, handleVerseLongPress, handleAyahLongPress,
        handleTafseerSelect, handlePageInputChange, handlePageInputBlur, handlePageInputKeyDown,
        handlePageButtonClick, handleMushafTypeSelect, handleInteractionStart, handleInteractionEnd,
        handleScreenTap
    };
};
