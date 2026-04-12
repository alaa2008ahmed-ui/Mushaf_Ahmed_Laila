import { useState, useEffect, useRef, useCallback } from 'react';
import { JUZ_MAP, toArabic } from '../components/QuranReader/constants';

export const useQuranState = (initialLandscape: boolean) => {
    const [isLandscape, setIsLandscape] = useState(initialLandscape);
    const isLandscapeRef = useRef(isLandscape);
    useEffect(() => { isLandscapeRef.current = isLandscape; }, [isLandscape]);

    const modeSuffix = isLandscape ? '_h' : '_v';

    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(100);

    const [visiblePages, setVisiblePages] = useState<number[]>([1, 2, 3]);
    const [currentAyah, setCurrentAyah] = useState<{ s: number; a: number }>({ s: 1, a: 1 });
    const currentAyahRef = useRef(currentAyah);
    useEffect(() => { currentAyahRef.current = currentAyah; }, [currentAyah]);

    const [highlightedAyahId, setHighlightedAyahId] = useState<string | null>(null);
    const highlightedAyahIdRef = useRef(highlightedAyahId);
    useEffect(() => { highlightedAyahIdRef.current = highlightedAyahId; }, [highlightedAyahId]);

    const [activeModals, setActiveModals] = useState<string[]>([]);
    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
    
    const [toast, setToast] = useState({ show: false, message: '' });
    const showToast = useCallback((message: string) => setToast({ show: true, message }), []);
    const handleToastClose = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

    const [reciterToast, setReciterToast] = useState({ show: false, name: '' });
    
    const [markerNotification, setMarkerNotification] = useState<{ show: boolean, type: 'juz' | 'quarter' | 'sajda' | 'surah', text: string }>({ show: false, type: 'juz', text: '' });
    const showMarkerNotification = useCallback((type: 'juz' | 'quarter' | 'sajda' | 'surah', text: string) => {
        setMarkerNotification({ show: true, type, text });
        setTimeout(() => setMarkerNotification(prev => ({ ...prev, show: false })), 2000);
    }, []);

    const [isLandscapeUIHidden, setIsLandscapeUIHidden] = useState(() => {
        if (!initialLandscape) return false;
        return localStorage.getItem('is_landscape_ui_hidden') === 'true';
    });
    const isLandscapeUIHiddenRef = useRef(isLandscapeUIHidden);
    useEffect(() => { 
        isLandscapeUIHiddenRef.current = isLandscapeUIHidden; 
        if (isLandscapeRef.current) {
            localStorage.setItem('is_landscape_ui_hidden', String(isLandscapeUIHidden));
        }
    }, [isLandscapeUIHidden]);

    const [isPageInputActive, setIsPageInputActive] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const isPageInputActiveRef = useRef(isPageInputActive);
    useEffect(() => { isPageInputActiveRef.current = isPageInputActive; }, [isPageInputActive]);

    const isJumpingRef = useRef(false);
    const wasAutoscrollingBeforeModal = useRef(false);

    const closeModal = useCallback((modalName: string) => {
        setActiveModals(p => p.filter(m => m !== modalName));
    }, []);

    const openModal = useCallback((modalName: string) => { 
        setActiveModals(p => [...p.filter(m => m !== modalName), modalName]); 
    }, []);

    return {
        isLandscape, setIsLandscape, isLandscapeRef, modeSuffix,
        isLoading, setIsLoading, loadingStatus, setLoadingStatus, loadingProgress, setLoadingProgress,
        visiblePages, setVisiblePages,
        currentAyah, setCurrentAyah, currentAyahRef,
        highlightedAyahId, setHighlightedAyahId, highlightedAyahIdRef,
        activeModals, setActiveModals, closeModal, openModal,
        isFloatingMenuOpen, setIsFloatingMenuOpen,
        toast, showToast, handleToastClose,
        reciterToast, setReciterToast,
        markerNotification, showMarkerNotification,
        isLandscapeUIHidden, setIsLandscapeUIHidden, isLandscapeUIHiddenRef,
        isPageInputActive, setIsPageInputActive, isPageInputActiveRef,
        pageInput, setPageInput,
        isJumpingRef, wasAutoscrollingBeforeModal
    };
};
