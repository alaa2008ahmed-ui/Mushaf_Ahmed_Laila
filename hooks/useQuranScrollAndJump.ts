import React, { useRef, useCallback, useEffect } from 'react';
import { JUZ_MAP, toArabic } from '../components/QuranReader/constants';

export const useQuranScrollAndJump = (
    quranData: any,
    isLandscapeRef: React.MutableRefObject<boolean>,
    mushafContentRef: React.RefObject<HTMLDivElement>,
    currentAyahRef: React.MutableRefObject<{s: number, a: number}>,
    highlightedAyahIdRef: React.MutableRefObject<string | null>,
    setCurrentAyah: (ayah: {s: number, a: number}) => void,
    setHighlightedAyahId: (id: string | null) => void,
    setVisiblePages: React.Dispatch<React.SetStateAction<number[]>>,
    stopAudio: () => void,
    isPageInputActiveRef: React.MutableRefObject<boolean>,
    setActiveModals: React.Dispatch<React.SetStateAction<string[]>>,
    showToast: (msg: string) => void,
    autoScrollState: any,
    isJumpingRef: React.MutableRefObject<boolean>,
    showMarkerNotification: (type: 'juz' | 'quarter' | 'sajda' | 'surah', text: string) => void,
    handleSajdahVisible: (surahName: string, sNum: number, ayahNum: number) => void
) => {
    const lastScrollUpdateTime = useRef(0);
    const lastNotifiedQuarter = useRef<number | null>(null);
    const lastNotifiedJuz = useRef<number | null>(null);

    const scrollToAyah = useCallback((s: number, a: number, instant: boolean = false) => {
        const el = document.getElementById(`ayah-${s}-${a}`);
        if (el) {
            const container = mushafContentRef.current;
            if (container) {
                if (isLandscapeRef.current) {
                    const targetScroll = el.offsetTop - (container.clientHeight / 2) + (el.clientHeight / 2);
                    container.scrollTo({ top: targetScroll, behavior: instant ? 'auto' : 'smooth' });
                } else {
                    const containerRect = container.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    const scrollTop = container.scrollTop + elRect.top - containerRect.top - (containerRect.height / 2) + (elRect.height / 2);
                    container.scrollTo({ top: scrollTop, behavior: instant ? 'auto' : 'smooth' });
                }
            } else {
                el.scrollIntoView({ block: 'center', behavior: instant ? 'auto' : 'smooth' });
            }
        }
    }, [isLandscapeRef, mushafContentRef]);

    const handleAyahClick = useCallback((s: number, a: number) => {
        setHighlightedAyahId(`ayah-${s}-${a}`);
        setCurrentAyah({ s, a });
        const key = isLandscapeRef.current ? 'last_pos_h' : 'last_pos_v';
        localStorage.setItem(key, JSON.stringify({ s, a }));
    }, [isLandscapeRef, setCurrentAyah, setHighlightedAyahId]);

    const jumpToAyah = useCallback((s: number, a: number, instant = false) => {
        stopAudio();
        if (!quranData) return;
        const surah = quranData.surahs.find((su:any) => su.number === s);
        const ayah = surah?.ayahs.find((ay:any) => ay.numberInSurah === a);
        if (!ayah) return;
        
        isJumpingRef.current = true;
        lastNotifiedJuz.current = null;
        lastNotifiedQuarter.current = null;
        const p = Number(ayah.page);
        setVisiblePages([...new Set([p, p + 1, p + 2, p - 1, p - 2])].filter(n => n > 0 && n <= 604).sort((a: number, b: number) => a - b));
        
        setTimeout(() => {
            scrollToAyah(s, a, instant);
            handleAyahClick(s, a);
            setTimeout(() => {
                isJumpingRef.current = false;
            }, 500);
        }, 150);
        
        if (!isPageInputActiveRef.current) {
            setActiveModals([]);
        }
    }, [quranData, handleAyahClick, stopAudio, scrollToAyah, isJumpingRef, setVisiblePages, isPageInputActiveRef, setActiveModals]);

    const pagesMap = React.useMemo(() => {
        if (!quranData) return {};
        const map: Record<number, any[]> = {};
        quranData.surahs.forEach((s: any) => {
            s.ayahs.forEach((a: any) => {
                const p = Number(a.page);
                if (!map[p]) map[p] = [];
                map[p].push({ ...a, sNum: s.number, sName: s.name });
            });
        });
        return map;
    }, [quranData]);

    const getPageData = useCallback((pageNum: number) => pagesMap[pageNum] || [], [pagesMap]);

    const jumpToPage = useCallback((pageNum: number, instant: boolean = true) => {
        if (!quranData || isNaN(pageNum) || pageNum < 1 || pageNum > 604) return;
        
        const pageData = getPageData(pageNum);
        if (pageData && pageData.length > 0) {
            const sortedAyahs = pageData.sort((a: any, b: any) => {
                if (a.sNum !== b.sNum) return a.sNum - b.sNum;
                return a.numberInSurah - b.numberInSurah;
            });
            const firstAyah = sortedAyahs[0];
            jumpToAyah(firstAyah.sNum, firstAyah.numberInSurah, instant);
        } else {
            showToast(`لا توجد بيانات لصفحة ${toArabic(pageNum)}`);
        }
    }, [quranData, jumpToAyah, getPageData, showToast]);

    useEffect(() => {
        const contentEl = mushafContentRef.current;
        if (!contentEl) return;
    
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = contentEl;

            // Detect current page based on scroll position or element at center
            const x = window.innerWidth / 2;
            const y = window.innerHeight / 2;
            const elAtCenter = document.elementFromPoint(x, y);
            const pageEl = elAtCenter?.closest('[data-page]');
            
            if (pageEl) {
                const p = parseInt((pageEl as HTMLElement).dataset.page || '1', 10);
                setVisiblePages(prev => {
                    const start = Math.max(1, p - 3);
                    const end = Math.min(604, p + 3);
                    const newPages = [];
                    for (let i = start; i <= end; i++) newPages.push(i);
                    if (prev.length === newPages.length && prev.every((v, i) => v === newPages[i])) return prev;
                    return newPages;
                });
            } else {
                // Fallback to boundary detection if no page element at center
                if (scrollTop < clientHeight) {
                    setVisiblePages(prev => {
                        if (prev.length === 0) return prev;
                        const firstPage = Math.min(...prev);
                        if (firstPage <= 1) return prev;
                        const newPages = [firstPage - 1, ...prev].slice(0, 10);
                        return [...new Set(newPages)].sort((a, b) => a - b);
                    });
                }
                if (scrollHeight - scrollTop <= clientHeight + 500) {
                    setVisiblePages(prev => {
                        if (prev.length === 0) return prev;
                        const lastPage = Math.max(...prev);
                        if (lastPage >= 604) return prev;
                        const newPages = [...prev, lastPage + 1].slice(-10);
                        return [...new Set(newPages)].sort((a, b) => a - b);
                    });
                }
            }
    
            if (autoScrollState.isActive || isJumpingRef.current) return;
    
            const now = Date.now();
            if (now - lastScrollUpdateTime.current < 100) return;
            lastScrollUpdateTime.current = now;
    
            const el = elAtCenter;
            if (!el) return;
            
            const ayahBlock = el.closest('.ayah-text-block');
            if (ayahBlock && ayahBlock.id) {
                const parts = ayahBlock.id.split('-');
                if (parts.length === 3) {
                    const s = parseInt(parts[1], 10);
                    const a = parseInt(parts[2], 10);
    
                    if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                        setCurrentAyah({ s, a });

                        const juzAttr = (ayahBlock as HTMLElement).dataset.juz;
                        const quarterAttr = (ayahBlock as HTMLElement).dataset.hizbQuarter;
                        
                        if (juzAttr) {
                            const newJuz = parseInt(juzAttr, 10);
                            if (lastNotifiedJuz.current !== null && newJuz !== lastNotifiedJuz.current) {
                                showMarkerNotification('juz', `بداية الجزء ${toArabic(newJuz)}`);
                            }
                            lastNotifiedJuz.current = newJuz;
                        }

                        if (quarterAttr) {
                            const newQuarter = parseInt(quarterAttr, 10);
                            if (lastNotifiedQuarter.current !== null && newQuarter !== lastNotifiedQuarter.current) {
                                let label = '';
                                const qInHizb = ((newQuarter - 1) % 4) + 1;
                                const hizbNum = Math.ceil(newQuarter / 4);
                                if (qInHizb === 1) label = `بداية الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 2) label = `ربع الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 3) label = `نصف الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 4) label = `ثلاثة أرباع الحزب ${toArabic(hizbNum)}`;
                                
                                showMarkerNotification('quarter', label);
                            }
                            lastNotifiedQuarter.current = newQuarter;
                        }

                        if (ayahBlock.getAttribute('data-sajdah') === 'true') {
                            const surahName = (ayahBlock as HTMLElement).dataset.surah || '';
                            const sNum = parseInt((ayahBlock as HTMLElement).dataset.snum || '0', 10);
                            const ayahNum = parseInt((ayahBlock as HTMLElement).dataset.ayah || '0', 10);
                            if(surahName && sNum && ayahNum){
                                handleSajdahVisible(surahName, sNum, ayahNum);
                            }
                        }
                    }
                }
            }
        };
    
        contentEl.addEventListener('scroll', handleScroll, { passive: true });
    
        return () => {
            contentEl.removeEventListener('scroll', handleScroll);
        };
    }, [setVisiblePages, autoScrollState.isActive, handleSajdahVisible, isJumpingRef, mushafContentRef, currentAyahRef, setCurrentAyah, showMarkerNotification]);

    return {
        scrollToAyah, handleAyahClick, jumpToAyah, jumpToPage, getPageData
    };
};
