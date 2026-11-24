import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import MadinahFrameSVG, { getMadinahThemePalette } from './MadinahFrameSVG';
import MadinahPageContent from './MadinahPageContent';
import { isDarkQuranTheme, toArabic } from './constants';
import { useLanguage } from '../../context/LanguageContext';

interface MadinahMushafViewProps {
    currentPage: number;
    getPageData: (pageNum: number) => any[];
    highlightedAyahId: string | null;
    onPageChange: (newPage: number) => void;
    onAyahClick: (surah: number, ayah: number) => void;
    onVerseClick: (surah: number, ayah: number, event: React.MouseEvent) => void;
    onVerseLongPress?: (surah: number, ayah: number) => void;
    onAyahLongPress?: (surah: number, ayah: number, x: number, y: number) => void;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
    onSurahHeaderLongPress?: () => void;
    settings?: any;
    currentTheme?: any;
    hideVerses?: boolean;
    memorizationSettings?: any;
    isPlaying?: boolean;
    isRecording?: boolean;
    revealedAyahs?: string[];
    tempRevealedAyah?: string | null;
    audioProgress?: { currentTime: number; duration: number } | null;
    isLandscape?: boolean;
    isModalOpen?: boolean;
    isBottomPageInputActive?: boolean;
    bottomPageInputRef?: React.RefObject<HTMLInputElement>;
    bottomPageInput?: string;
    onBottomPageButtonClick?: () => void;
    onBottomPageInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBottomPageInputBlur?: () => void;
    onBottomPageInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    isVerticalMode?: boolean;
    scrollContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
    onScrollContainerClick?: () => void;
    verticalJumpTarget?: { page: number; seq: number } | null;
    autoScrollState?: { isActive: boolean; isPaused: boolean; elapsedTime: number };
    onAutoScrollButtonPointerDown?: (e: React.SyntheticEvent) => void;
    onAutoScrollButtonPointerUp?: (e: React.PointerEvent | React.TouchEvent) => void;
    onAutoScrollButtonPointerLeave?: () => void;
}

const TOTAL_PAGES = 604;

const isHexLightColor = (color?: string): boolean => {
    if (!color || typeof color !== 'string') return false;
    const c = color.trim().toLowerCase();
    if (c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return false;
    const hex = c.startsWith('#') ? c.slice(1) : '';
    if (!hex) return false;
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else {
        return false;
    }
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.45;
};

const resolveMadinahPageBg = (settingsBg?: string, currentTheme?: any): string => {
    const isDark = isDarkQuranTheme(currentTheme);
    if (isDark) {
        if (!settingsBg || isHexLightColor(settingsBg)) {
            return currentTheme?.bg || '#000000';
        }
        return settingsBg;
    }
    return settingsBg || currentTheme?.bg || '#ffffff';
};

const MadinahVerticalReader: React.FC<MadinahMushafViewProps> = ({
    currentPage,
    getPageData,
    highlightedAyahId,
    onAyahClick,
    onVerseClick,
    onVerseLongPress,
    onAyahLongPress,
    onInteractionStart,
    onInteractionEnd,
    onSurahHeaderLongPress,
    settings,
    currentTheme,
    hideVerses,
    memorizationSettings,
    isPlaying,
    isRecording,
    revealedAyahs,
    tempRevealedAyah,
    audioProgress,
    isLandscape = false,
    isBottomPageInputActive = false,
    bottomPageInputRef,
    bottomPageInput = '',
    onBottomPageButtonClick,
    onBottomPageInputChange,
    onBottomPageInputBlur,
    onBottomPageInputKeyDown,
    scrollContainerRef,
    onScrollContainerClick,
    verticalJumpTarget,
    autoScrollState,
    onAutoScrollButtonPointerDown,
    onAutoScrollButtonPointerUp,
    onAutoScrollButtonPointerLeave,
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const clampedPage = Math.max(1, Math.min(TOTAL_PAGES, currentPage || 1));
    const localScrollerRef = useRef<HTMLDivElement | null>(null);
    const [stageSize, setStageSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
    const stageSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const [renderCenterPage, setRenderCenterPage] = useState<number>(clampedPage);
    const hasInitializedScrollRef = useRef(false);
    const lastJumpSeqRef = useRef<number | null>(null);
    const prevStrideRef = useRef<number>(0);

    const setScrollerNode = useCallback(
        (node: HTMLDivElement | null) => {
            localScrollerRef.current = node;
            if (scrollContainerRef) {
                scrollContainerRef.current = node;
            }
        },
        [scrollContainerRef]
    );

    useLayoutEffect(() => {
        const el = localScrollerRef.current;
        if (!el) return;

        const updateSize = () => {
            if (
                typeof document !== 'undefined' &&
                document.getElementById('madinah-bottom-page-input') &&
                stageSizeRef.current.h > 40
            ) {
                return;
            }
            const w = Math.round(el.clientWidth);
            const h = Math.round(el.clientHeight);
            if (w > 40 && h > 40) {
                stageSizeRef.current = { w, h };
                setStageSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
            }
        };

        updateSize();

        const ro = new ResizeObserver(updateSize);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const pageGap = isLandscape ? 22 : 24;
    const pageHeight = useMemo(() => {
        if (stageSize.h <= 40 || stageSize.w <= 40) return 600;
        if (isLandscape) {
            return Math.max(stageSize.h, Math.min(820, Math.round(stageSize.w * 1.15)));
        }
        return stageSize.h;
    }, [stageSize.w, stageSize.h, isLandscape]);

    const stride = pageHeight + pageGap;

    useLayoutEffect(() => {
        const el = localScrollerRef.current;
        if (!el || stageSize.h <= 40) return;

        if (!hasInitializedScrollRef.current) {
            hasInitializedScrollRef.current = true;
            prevStrideRef.current = stride;
            el.scrollTop = (clampedPage - 1) * stride;
            setRenderCenterPage(clampedPage);
            return;
        }

        if (prevStrideRef.current !== stride) {
            prevStrideRef.current = stride;
            el.scrollTop = (clampedPage - 1) * stride;
            setRenderCenterPage(clampedPage);
        }
    }, [stageSize.h, stride, clampedPage]);

    const hasPendingVerticalJump = Boolean(
        verticalJumpTarget && lastJumpSeqRef.current !== verticalJumpTarget.seq
    );
    const jumpTargetPage = hasPendingVerticalJump && verticalJumpTarget
        ? Math.max(1, Math.min(TOTAL_PAGES, verticalJumpTarget.page))
        : clampedPage;
    const effectiveCenterPage =
        hasPendingVerticalJump || Math.abs(clampedPage - renderCenterPage) > 2
            ? jumpTargetPage
            : renderCenterPage;

    useLayoutEffect(() => {
        const el = localScrollerRef.current;
        if (!el || stageSize.h <= 40 || !verticalJumpTarget) return;
        if (lastJumpSeqRef.current === verticalJumpTarget.seq) return;
        lastJumpSeqRef.current = verticalJumpTarget.seq;

        const targetPage = Math.max(1, Math.min(TOTAL_PAGES, verticalJumpTarget.page));
        el.scrollTop = (targetPage - 1) * stride;
        setRenderCenterPage(targetPage);
    }, [verticalJumpTarget, stageSize.h, stride]);

    const handleScrollerScroll = useCallback(() => {
        const el = localScrollerRef.current;
        if (!el || stride <= 0) return;
        const approxPage = Math.max(
            1,
            Math.min(TOTAL_PAGES, Math.floor((el.scrollTop + el.clientHeight * 0.45) / stride) + 1)
        );
        setRenderCenterPage((prev) => (prev === approxPage ? prev : approxPage));
    }, [stride]);

    const visiblePageNumbers = useMemo(() => {
        const start = Math.max(1, effectiveCenterPage - 3);
        const end = Math.min(TOTAL_PAGES, effectiveCenterPage + 4);
        const list: number[] = [];
        for (let p = start; p <= end; p++) {
            list.push(p);
        }
        return list;
    }, [effectiveCenterPage]);

    const palette = getMadinahThemePalette(currentTheme);
    const pageBg = resolveMadinahPageBg(settings?.bgColor, currentTheme);

    return (
        <div className="madinah-vertical-viewport" dir="rtl">
            <MadinahFrameSVG
                currentTheme={currentTheme}
                bgColor={pageBg}
                frameDesign={settings?.madinahFrameDesign}
                pageNum={clampedPage}
                isCurrent={true}
                isLandscape={isLandscape}
                isPageInputActive={isBottomPageInputActive}
                pageInputRef={bottomPageInputRef}
                pageInput={bottomPageInput}
                onPageButtonClick={onBottomPageButtonClick}
                onPageInputChange={onBottomPageInputChange}
                onPageInputBlur={onBottomPageInputBlur}
                onPageInputKeyDown={onBottomPageInputKeyDown}
                showAutoScrollButton={true}
                autoScrollState={autoScrollState}
                onAutoScrollButtonPointerDown={onAutoScrollButtonPointerDown}
                onAutoScrollButtonPointerUp={onAutoScrollButtonPointerUp}
                onAutoScrollButtonPointerLeave={onAutoScrollButtonPointerLeave}
                innerStageClassName="madinah-vertical-inner-stage"
            >
                <div
                    id="mushaf-content"
                    ref={setScrollerNode}
                    onClick={onScrollContainerClick}
                    onScroll={handleScrollerScroll}
                    className="madinah-vertical-scroller"
                    style={{ backgroundColor: pageBg }}
                    dir="rtl"
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: `${TOTAL_PAGES * stride}px`,
                        }}
                    >
                        {visiblePageNumbers.map((pageNum) => {
                            const topPx = (pageNum - 1) * stride;
                            return (
                                <React.Fragment key={`madinah-vpage-${pageNum}`}>
                                    <div
                                        id={`madinah-page-${pageNum}`}
                                        data-page={pageNum}
                                        className="madinah-vertical-page"
                                        style={{
                                            top: `${topPx}px`,
                                            height: `${pageHeight}px`,
                                            backgroundColor: pageBg,
                                        }}
                                    >
                                        <MadinahPageContent
                                            pageNum={pageNum}
                                            pageData={getPageData(pageNum)}
                                            isActiveSlide={pageNum === clampedPage}
                                            highlightedAyahId={highlightedAyahId}
                                            onAyahClick={onAyahClick}
                                            onVerseClick={onVerseClick}
                                            onVerseLongPress={onVerseLongPress}
                                            onAyahLongPress={onAyahLongPress}
                                            onInteractionStart={onInteractionStart}
                                            onInteractionEnd={onInteractionEnd}
                                            onSurahHeaderLongPress={onSurahHeaderLongPress}
                                            settings={settings}
                                            currentTheme={currentTheme}
                                            hideVerses={hideVerses}
                                            memorizationSettings={memorizationSettings}
                                            isPlaying={isPlaying}
                                            isRecording={isRecording}
                                            revealedAyahs={revealedAyahs}
                                            tempRevealedAyah={tempRevealedAyah}
                                            audioProgress={audioProgress}
                                        />
                                    </div>
                                    <div
                                        className="madinah-vertical-divider"
                                        style={{
                                            top: `${topPx + pageHeight}px`,
                                            height: `${pageGap}px`,
                                        }}
                                        aria-label={isEn ? `Page ${pageNum}` : `صفحة ${toArabic(pageNum)}`}
                                    >
                                        <span
                                            className="madinah-vertical-divider-line"
                                            style={{ backgroundColor: palette.gold }}
                                        />
                                        <span
                                            className="madinah-vertical-divider-page-num"
                                            style={{ color: palette.metaText }}
                                        >
                                            {isEn ? pageNum : toArabic(pageNum)}
                                        </span>
                                        <span
                                            className="madinah-vertical-divider-line"
                                            style={{ backgroundColor: palette.gold }}
                                        />
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </MadinahFrameSVG>
        </div>
    );
};

const MadinahHorizontalReader: React.FC<MadinahMushafViewProps> = ({
    currentPage,
    getPageData,
    highlightedAyahId,
    onPageChange,
    onAyahClick,
    onVerseClick,
    onVerseLongPress,
    onAyahLongPress,
    onInteractionStart,
    onInteractionEnd,
    onSurahHeaderLongPress,
    settings,
    currentTheme,
    hideVerses,
    memorizationSettings,
    isPlaying,
    isRecording,
    revealedAyahs,
    tempRevealedAyah,
    audioProgress,
    isLandscape = false,
    isModalOpen = false,
    isBottomPageInputActive = false,
    bottomPageInputRef,
    bottomPageInput = '',
    onBottomPageButtonClick,
    onBottomPageInputChange,
    onBottomPageInputBlur,
    onBottomPageInputKeyDown,
}) => {
    const pagerRef = useRef<HTMLDivElement | null>(null);
    const clampedPage = Math.max(1, Math.min(TOTAL_PAGES, currentPage || 1));

    const [dragOffsetPx, setDragOffsetPx] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [snapTargetDirection, setSnapTargetDirection] = useState<-1 | 0 | 1>(0);

    const animTimerRef = useRef<number | null>(null);
    const pendingTargetPageRef = useRef<number | null>(null);
    const suppressNextClickRef = useRef(false);
    const suppressTimerRef = useRef<number | null>(null);
    const lastTouchTimeRef = useRef<number>(0);

    const gestureRef = useRef<{
        active: boolean;
        source: 'touch' | 'mouse' | null;
        startX: number;
        startY: number;
        lastDx: number;
        startTime: number;
        lockedAxis: 'x' | 'y' | null;
        moved: boolean;
    }>({
        active: false,
        source: null,
        startX: 0,
        startY: 0,
        lastDx: 0,
        startTime: 0,
        lockedAxis: null,
        moved: false,
    });

    const wheelLockRef = useRef<number>(0);

    const clearAnimTimer = useCallback(() => {
        if (animTimerRef.current !== null) {
            window.clearTimeout(animTimerRef.current);
            animTimerRef.current = null;
        }
    }, []);

    const prevPropPageRef = useRef(clampedPage);
    useEffect(() => {
        if (prevPropPageRef.current !== clampedPage) {
            prevPropPageRef.current = clampedPage;
            clearAnimTimer();
            pendingTargetPageRef.current = null;
            setDragOffsetPx(0);
            setIsDragging(false);
            setIsAnimating(false);
            setSnapTargetDirection(0);
        }
    }, [clampedPage, clearAnimTimer]);

    useEffect(() => {
        return () => {
            clearAnimTimer();
            if (suppressTimerRef.current !== null) {
                window.clearTimeout(suppressTimerRef.current);
            }
        };
    }, [clearAnimTimer]);

    const getLocalCoords = useCallback(
        (clientX: number, clientY: number) => {
            const isCssRotated =
                isLandscape && typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
            if (isCssRotated) {
                return { x: clientY, y: -clientX };
            }
            return { x: clientX, y: clientY };
        },
        [isLandscape]
    );

    const scheduleSuppressClickClear = useCallback(() => {
        if (suppressTimerRef.current !== null) {
            window.clearTimeout(suppressTimerRef.current);
        }
        suppressTimerRef.current = window.setTimeout(() => {
            suppressNextClickRef.current = false;
            suppressTimerRef.current = null;
        }, 320);
    }, []);

    const flushPendingAnimation = useCallback((): number => {
        if (pendingTargetPageRef.current !== null) {
            const target = pendingTargetPageRef.current;
            pendingTargetPageRef.current = null;
            clearAnimTimer();
            setIsAnimating(false);
            setDragOffsetPx(0);
            setSnapTargetDirection(0);
            onPageChange(target);
            return target;
        }
        return clampedPage;
    }, [clampedPage, clearAnimTimer, onPageChange]);

    const commitTurn = useCallback(
        (direction: -1 | 1, basePageOverride?: number) => {
            clearAnimTimer();
            const basePage = basePageOverride ?? clampedPage;
            const targetPage = basePage + direction;
            if (targetPage < 1 || targetPage > TOTAL_PAGES) {
                pendingTargetPageRef.current = null;
                setIsDragging(false);
                setIsAnimating(true);
                setSnapTargetDirection(0);
                setDragOffsetPx(0);
                animTimerRef.current = window.setTimeout(() => {
                    animTimerRef.current = null;
                    setIsAnimating(false);
                }, 220);
                return;
            }

            const width = pagerRef.current?.clientWidth || window.innerWidth || 360;
            pendingTargetPageRef.current = targetPage;
            setIsDragging(false);
            setIsAnimating(true);
            setSnapTargetDirection(direction);
            setDragOffsetPx(direction * width);

            animTimerRef.current = window.setTimeout(() => {
                animTimerRef.current = null;
                pendingTargetPageRef.current = null;
                setIsAnimating(false);
                setDragOffsetPx(0);
                setSnapTargetDirection(0);
                onPageChange(targetPage);
            }, 220);
        },
        [clampedPage, clearAnimTimer, onPageChange]
    );

    const startGesture = useCallback(
        (source: 'touch' | 'mouse', clientX: number, clientY: number) => {
            if (isModalOpen) return false;
            if (isAnimating) {
                flushPendingAnimation();
            }
            const { x, y } = getLocalCoords(clientX, clientY);
            gestureRef.current = {
                active: true,
                source,
                startX: x,
                startY: y,
                lastDx: 0,
                startTime: Date.now(),
                lockedAxis: null,
                moved: false,
            };
            return true;
        },
        [flushPendingAnimation, getLocalCoords, isAnimating, isModalOpen]
    );

    const moveGesture = useCallback(
        (clientX: number, clientY: number, currentClampedPage: number): boolean => {
            const g = gestureRef.current;
            if (!g.active) return false;
            const { x, y } = getLocalCoords(clientX, clientY);
            const dx = x - g.startX;
            const dy = y - g.startY;

            if (!g.lockedAxis) {
                const dist = Math.hypot(dx, dy);
                if (dist < 6) return false;

                if (Math.abs(dx) >= Math.abs(dy) * 0.65 && Math.abs(dx) >= 5) {
                    g.lockedAxis = 'x';
                    suppressNextClickRef.current = true;
                    scheduleSuppressClickClear();
                    setIsDragging(true);
                } else if (Math.abs(dy) > 24 && Math.abs(dx) < 6) {
                    g.lockedAxis = 'y';
                    g.active = false;
                    return false;
                } else {
                    return false;
                }
            }

            if (g.lockedAxis === 'x') {
                g.moved = true;
                suppressNextClickRef.current = true;
                let dampedDx = dx;
                if ((currentClampedPage === 1 && dx < 0) || (currentClampedPage === TOTAL_PAGES && dx > 0)) {
                    dampedDx = dx * 0.22;
                }
                g.lastDx = dampedDx;
                setDragOffsetPx(dampedDx);
                return true;
            }
            return false;
        },
        [getLocalCoords, scheduleSuppressClickClear]
    );

    const endGesture = useCallback(() => {
        const g = gestureRef.current;
        if (!g.active) return;
        const wasHorizontal = g.lockedAxis === 'x' && g.moved;
        const dx = g.lastDx;
        const elapsed = Math.max(1, Date.now() - g.startTime);
        const velocity = Math.abs(dx) / elapsed;
        g.active = false;
        g.source = null;

        if (!wasHorizontal) {
            setIsDragging(false);
            setDragOffsetPx(0);
            return;
        }

        scheduleSuppressClickClear();

        const width = pagerRef.current?.clientWidth || window.innerWidth || 360;
        const threshold = Math.min(55, width * 0.13);
        const isFastSwipe = velocity > 0.22 && Math.abs(dx) > 18;

        if (dx > threshold || (dx > 0 && isFastSwipe)) {
            commitTurn(1);
        } else if (dx < -threshold || (dx < 0 && isFastSwipe)) {
            commitTurn(-1);
        } else {
            clearAnimTimer();
            setIsDragging(false);
            setIsAnimating(true);
            setSnapTargetDirection(0);
            setDragOffsetPx(0);
            animTimerRef.current = window.setTimeout(() => {
                animTimerRef.current = null;
                setIsAnimating(false);
            }, 200);
        }
    }, [clearAnimTimer, commitTurn, scheduleSuppressClickClear]);

    useEffect(() => {
        const el = pagerRef.current;
        if (!el) return;

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            if ((e.target as HTMLElement)?.closest?.('.madinah-bottom-page-badge')) return;
            lastTouchTimeRef.current = Date.now();
            const t = e.touches[0];
            startGesture('touch', t.clientX, t.clientY);
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!gestureRef.current.active || gestureRef.current.source !== 'touch' || e.touches.length !== 1) {
                return;
            }
            const t = e.touches[0];
            const isHorizontal = moveGesture(t.clientX, t.clientY, clampedPage);
            if (isHorizontal && e.cancelable) {
                e.preventDefault();
            }
        };

        const onTouchEnd = () => {
            lastTouchTimeRef.current = Date.now();
            if (gestureRef.current.source === 'touch') {
                endGesture();
            }
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        el.addEventListener('touchcancel', onTouchEnd, { passive: true });

        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
            el.removeEventListener('touchcancel', onTouchEnd);
        };
    }, [clampedPage, endGesture, moveGesture, startGesture]);

    useEffect(() => {
        const onWindowMouseMove = (e: MouseEvent) => {
            if (!gestureRef.current.active || gestureRef.current.source !== 'mouse') return;
            moveGesture(e.clientX, e.clientY, clampedPage);
        };

        const onWindowMouseUp = () => {
            if (!gestureRef.current.active || gestureRef.current.source !== 'mouse') return;
            endGesture();
        };

        window.addEventListener('mousemove', onWindowMouseMove);
        window.addEventListener('mouseup', onWindowMouseUp);
        window.addEventListener('blur', onWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', onWindowMouseMove);
            window.removeEventListener('mouseup', onWindowMouseUp);
            window.removeEventListener('blur', onWindowMouseUp);
        };
    }, [clampedPage, endGesture, moveGesture]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0 || isModalOpen) return;
        if ((e.target as HTMLElement)?.closest?.('.madinah-bottom-page-badge')) return;
        if (Date.now() - lastTouchTimeRef.current < 500) return;
        startGesture('mouse', e.clientX, e.clientY);
    };

    useEffect(() => {
        if (isModalOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                commitTurn(1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                commitTurn(-1);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [commitTurn, isModalOpen]);

    const handleWheel = (e: React.WheelEvent) => {
        if (isModalOpen || isAnimating) return;
        const absX = Math.abs(e.deltaX);
        const absY = Math.abs(e.deltaY);
        if (absX < 20 && absY < 30) return;
        const now = Date.now();
        if (now - wheelLockRef.current < 300) return;

        if (absX >= absY && absX >= 20) {
            wheelLockRef.current = now;
            commitTurn(e.deltaX < 0 ? 1 : -1);
        }
    };

    const handleClickCapture = (e: React.MouseEvent) => {
        if (suppressNextClickRef.current) {
            e.stopPropagation();
            e.preventDefault();
            suppressNextClickRef.current = false;
        }
    };

    const slides = useMemo(() => {
        const list: Array<{ slot: 'next' | 'current' | 'prev'; pageNum: number | null }> = [
            { slot: 'next', pageNum: clampedPage < TOTAL_PAGES ? clampedPage + 1 : null },
            { slot: 'current', pageNum: clampedPage },
            { slot: 'prev', pageNum: clampedPage > 1 ? clampedPage - 1 : null },
        ];
        return list;
    }, [clampedPage]);

    return (
        <div
            ref={pagerRef}
            className="madinah-pager-viewport"
            dir="ltr"
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            onClickCapture={handleClickCapture}
            onDragStart={(e) => e.preventDefault()}
        >
            <div
                className="madinah-pager-track"
                data-snap={snapTargetDirection}
                style={{
                    transform: `translate3d(calc(-33.333333% + ${dragOffsetPx}px), 0, 0)`,
                    transition: isDragging
                        ? 'none'
                        : isAnimating
                        ? 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'
                        : 'none',
                }}
            >
                {slides.map(({ slot, pageNum }) => {
                    const resolvedSlideBg = resolveMadinahPageBg(settings?.bgColor, currentTheme);
                    if (!pageNum) {
                        return (
                            <div
                                key={`empty-${slot}`}
                                className="madinah-pager-slide"
                                style={{ backgroundColor: resolvedSlideBg }}
                            />
                        );
                    }

                    const pageData = getPageData(pageNum);
                    const isCurrent = slot === 'current';

                    return (
                        <div key={`slide-${pageNum}`} className="madinah-pager-slide">
                                <MadinahFrameSVG
                                currentTheme={currentTheme}
                                bgColor={resolvedSlideBg}
                                frameDesign={settings?.madinahFrameDesign}
                                pageNum={pageNum}
                                isCurrent={isCurrent}
                                isLandscape={isLandscape}
                                isPageInputActive={isCurrent && isBottomPageInputActive}
                                pageInputRef={isCurrent ? bottomPageInputRef : undefined}
                                pageInput={isCurrent ? bottomPageInput : ''}
                                onPageButtonClick={isCurrent ? onBottomPageButtonClick : undefined}
                                onPageInputChange={isCurrent ? onBottomPageInputChange : undefined}
                                onPageInputBlur={isCurrent ? onBottomPageInputBlur : undefined}
                                onPageInputKeyDown={isCurrent ? onBottomPageInputKeyDown : undefined}
                            >
                                <MadinahPageContent
                                    pageNum={pageNum}
                                    pageData={pageData}
                                    isActiveSlide={isCurrent}
                                    highlightedAyahId={highlightedAyahId}
                                    onAyahClick={onAyahClick}
                                    onVerseClick={onVerseClick}
                                    onVerseLongPress={onVerseLongPress}
                                    onAyahLongPress={onAyahLongPress}
                                    onInteractionStart={onInteractionStart}
                                    onInteractionEnd={onInteractionEnd}
                                    onSurahHeaderLongPress={onSurahHeaderLongPress}
                                    settings={settings}
                                    currentTheme={currentTheme}
                                    hideVerses={hideVerses}
                                    memorizationSettings={memorizationSettings}
                                    isPlaying={isPlaying}
                                    isRecording={isRecording}
                                    revealedAyahs={revealedAyahs}
                                    tempRevealedAyah={tempRevealedAyah}
                                    audioProgress={audioProgress}
                                />
                            </MadinahFrameSVG>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MadinahMushafView: React.FC<MadinahMushafViewProps> = (props) => {
    if (props.isVerticalMode) {
        return <MadinahVerticalReader {...props} />;
    }
    return <MadinahHorizontalReader {...props} />;
};

export default MadinahMushafView;
