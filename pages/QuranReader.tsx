import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, FC } from 'react';
import { flushSync } from 'react-dom';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import './QuranReader.css'; 
import { ReadingMode, JUZ_MAP, toArabic, THEMES, TAFSEERS, READERS, MEMORIZATION_READERS, DEFAULT_SETTINGS, FONTS, SURAH_NAMES_AR } from '../components/QuranReader/constants';
import SearchModal from '../components/QuranReader/SearchModal';
import ThemesModal from '../components/QuranReader/ThemesModal';
import SettingsModal from '../components/QuranReader/SettingsModal';
import ToolbarColorPickerModal from '../components/QuranReader/ToolbarColorPickerModal';
import { QuranDownloadModal, TafsirDownloadModal } from '../components/QuranReader/DownloadModals';
import SurahJuzModal from '../components/QuranReader/SurahJuzModal';
import { KeepAwake } from '@capacitor-community/keep-awake';
import BookmarksModal from '../components/QuranReader/BookmarksModal';
import MushafPage from '../components/QuranReader/MushafPage';
import VerticalReadingView from '../components/QuranReader/VerticalReadingView';
import SurahDesignPickerModal from '../components/QuranReader/SurahDesignPickerModal';
import Toast from '../components/QuranReader/Toast';
import TafseerModal from '../components/QuranReader/TafseerModal';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import SajdahCardModal from '../components/QuranReader/SajdahCardModal';
import TafseerSelectionModal from '../components/QuranReader/TafseerSelectionModal';
import MushafSelectionModal from '../components/QuranReader/MushafSelectionModal';
import FontSelectModal from '../components/QuranReader/FontSelectModal';
import ScrollSpeedModal from '../components/QuranReader/ScrollSpeedModal';
import AutoScrollSettingsModal from '../components/QuranReader/AutoScrollSettingsModal';
import ReadingTimer from '../components/QuranReader/ReadingTimer';
import MarkerNotification from '../components/QuranReader/MarkerNotification';
import JuzNotification from '../components/QuranReader/JuzNotification';
import NotificationSettingsModal from '../components/QuranReader/NotificationSettingsModal';
import QuranHeader from '../components/QuranReader/QuranHeader';
import QuranFooter from '../components/QuranReader/QuranFooter';
import FloatingMenu from '../components/QuranReader/FloatingMenu';
import AyahContextMenu from '../components/QuranReader/AyahContextMenu';
import ShareAyahModal from '../components/QuranReader/ShareAyahModal';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { MousePointer2, Move, ZoomIn, Grid, Mic, Bookmark, Home, Share2, BookOpen, Trophy, Play, Menu, Palette } from 'lucide-react';
import { quranData as quranJsonData } from '../utils/quranData';
import ReviewTestModal from '../components/QuranReader/ReviewTestModal';
import { memorizationService } from '../services/memorizationService';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { parseVoiceCommand, normalizeArabic } from '../utils/voiceParser';
import { useTheme } from '../context/ThemeContext';
import { useAudioStore } from '../hooks/useAudioStore';
import { App as CapacitorApp } from '@capacitor/app';

declare var window: any;

const parseArabicNumber = (text: string): number | null => {
    const arabicDigits = text.match(/[٠-٩]+/g);
    if (arabicDigits) {
        const standard = arabicDigits[0].replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
        return parseInt(standard);
    }
    const englishDigits = text.match(/\d+/g);
    if (englishDigits) return parseInt(englishDigits[0]);
    
    const words: Record<string, number> = {
        'واحد': 1, 'اثنين': 2, 'ثلاثة': 3, 'اربعة': 4, 'خمسة': 5, 'ستة': 6, 'سبعة': 7, 'ثمانية': 8, 'تسعة': 9, 'عشرة': 10,
        'عشرين': 20, 'ثلاثين': 30, 'اربعين': 40, 'خمسين': 50, 'ستين': 60, 'سبعين': 70, 'ثمانين': 80, 'تسعين': 90, 'مئة': 100, 'مائة': 100
    };
    
    for (const [word, val] of Object.entries(words)) {
        if (text.includes(word)) return val;
    }
    return null;
};

const AyahActionMenu = ({ isOpen, onClose, onTafseer, onMeanings, onTranslation, currentTheme, isLandscape }: any) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 z-[1200] bg-transparent flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-[300px] max-h-[90vh] rounded-xl' : 'max-w-[280px] rounded-2xl'} shadow-2xl flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className={`flex flex-col ${isLandscape ? 'p-2.5 gap-2' : 'p-5 gap-4'}`}>
                    <button onClick={onTafseer} style={{ borderTop: `2px solid ${currentTheme?.accent || '#4f46e5'}`, borderBottom: `2px solid ${currentTheme?.accent || '#4f46e5'}`, borderLeft: `2px solid ${currentTheme?.accent || '#4f46e5'}`, borderRight: `2px solid ${currentTheme?.accent || '#4f46e5'}`, color: currentTheme?.accent || '#4f46e5', backgroundColor: 'transparent' }} className={`w-full ${isLandscape ? 'py-1.5 px-2 text-sm' : 'py-3 px-4 text-lg'} rounded-xl font-bold transition-transform hover:scale-105 flex items-center justify-center gap-2`}>
                        <i className="fa-solid fa-book-open"></i>
                        التفسير
                    </button>
                    <button onClick={onMeanings} style={{ borderTop: `2px solid ${currentTheme?.highlightText || currentTheme?.accent || '#0d9488'}`, borderBottom: `2px solid ${currentTheme?.highlightText || currentTheme?.accent || '#0d9488'}`, borderLeft: `2px solid ${currentTheme?.highlightText || currentTheme?.accent || '#0d9488'}`, borderRight: `2px solid ${currentTheme?.highlightText || currentTheme?.accent || '#0d9488'}`, color: currentTheme?.highlightText || currentTheme?.accent || '#0d9488', backgroundColor: 'transparent' }} className={`w-full ${isLandscape ? 'py-1.5 px-2 text-sm' : 'py-3 px-4 text-lg'} rounded-xl font-bold transition-transform hover:scale-105 flex items-center justify-center gap-2`}>
                        <i className="fa-solid fa-language"></i>
                        معاني القرآن
                    </button>
                    <button onClick={onTranslation} style={{ borderTop: `2px solid ${currentTheme?.accent || '#4f46e5'}`, borderBottom: `2px solid ${currentTheme?.accent || '#4f46e5'}`, borderLeft: `2px solid ${currentTheme?.accent || '#4f46e5'}`, borderRight: `2px solid ${currentTheme?.accent || '#4f46e5'}`, color: currentTheme?.accent || '#4f46e5', backgroundColor: 'transparent' }} className={`w-full ${isLandscape ? 'py-1.5 px-2 text-sm' : 'py-3 px-4 text-lg'} rounded-xl font-bold transition-transform hover:scale-105 flex items-center justify-center gap-2`}>
                        <i className="fa-solid fa-language"></i>
                        الترجمة
                    </button>
                </div>
            </div>
        </div>
    );
};

    const getDayRange = (day: number, settings: any) => {
        const TOTAL_PAGES = 604;
        const startPage = settings.startPage || 1;
        const pagesLeft = TOTAL_PAGES - startPage + 1;
        const offset = startPage - 1;

        if (settings.mode === 'days') {
            const totalDays = settings.value;
            const start = Math.floor(((day - 1) * pagesLeft) / totalDays) + 1 + offset;
            const end = Math.floor((day * pagesLeft) / totalDays) + offset;
            return { start, end: Math.max(start - 1, end) };
        } else {
            const pagesPerDay = settings.value;
            const start = (day - 1) * pagesPerDay + 1 + offset;
            const end = Math.min(day * pagesPerDay + offset, TOTAL_PAGES);
            return { start: Math.min(start, TOTAL_PAGES + 1), end };
        }
    };

const WirdCompletionModal = ({ isOpen, onClose, onGoToWird, onGoHome, currentTheme, onMarkCompleted, onMarkAndContinue, isLandscape }: any) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 z-[1100] bg-black/40 backdrop-blur-[2px] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none' : 'max-w-[320px] rounded-3xl'} shadow-2xl flex flex-col animate-modal-enter p-6 text-center`} 
                 style={{ 
                     fontFamily: currentTheme?.font,
                     backgroundColor: currentTheme?.modalBg,
                     color: currentTheme?.modalText,
                     borderColor: currentTheme?.barBorder
                 }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                     style={{ backgroundColor: `${currentTheme?.accent}20`, color: currentTheme?.accent }}>
                    <i className="fa-solid fa-check-double text-3xl"></i>
                </div>
                <h2 className="text-xl font-bold mb-3 font-kufi" style={{ color: currentTheme?.accent }}>تقبل الله طاعتك!</h2>
                <p className="opacity-80 mb-6 text-sm leading-relaxed">لقد وصلت إلى نهاية وردك اليومي المحدد. يمكنك التوقف عن القراءة الآن أو الاستمرار كما تحب.</p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => onMarkCompleted()}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                        style={{ backgroundColor: currentTheme?.accent, color: currentTheme?.accentText }}
                    >
                        <i className="fa-solid fa-check-circle"></i>
                        حفظ الورد
                    </button>
                    <button 
                        onClick={() => onMarkAndContinue()}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                        style={{ backgroundColor: currentTheme?.btnBg, color: currentTheme?.btnText, border: `1px solid ${currentTheme?.barBorder}` }}
                    >
                        <i className="fa-solid fa-forward-step"></i>
                        حفظ الورد واستمرار القراءة
                    </button>
                    <button 
                        onClick={onGoToWird}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                        style={{ backgroundColor: currentTheme?.headerBg, color: currentTheme?.headerText }}
                    >
                        <i className="fa-solid fa-calendar-check"></i>
                        العودة لصفحة الورد
                    </button>
                    <button 
                        onClick={onGoHome}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105 flex items-center justify-center gap-2"
                        style={currentTheme?.bg === '#000000' ? {
                            backgroundColor: '#000000',
                            color: '#FFFFFF',
                            border: '1px solid #FFFFFF'
                        } : { backgroundColor: `${currentTheme?.barBg}80`, color: currentTheme?.barText, border: `1px solid ${currentTheme?.barBorder}` }}
                    >
                        <i className="fa-solid fa-house"></i>
                        الصفحة الرئيسية
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResumeSessionModal = ({ isOpen, onClose, onResume, onStartNew, currentTheme, savedSession, isLandscape }: any) => {
    if (!isOpen || !savedSession) return null;
    return (
        <div className={`fixed inset-0 z-[1100] bg-black/40 backdrop-blur-[2px] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none' : 'max-w-sm rounded-3xl'} shadow-2xl p-6 text-center animate-modal-enter`}
                 style={{ fontFamily: currentTheme?.font }}>
                <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-play text-3xl"></i>
                </div>
                <h2 className="text-xl font-bold mb-2">جلسة سابقة متوفرة</h2>
                <p className="opacity-70 mb-6 text-sm">
                    تم العثور على جلسة تحفيظ سابقة عند سورة {SURAH_NAMES_AR[savedSession.currentAyah.s - 1]} الآية {savedSession.currentAyah.a}.
                    هل تود الاستمرار من حيث توقفت أم البدء من جديد؟
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={onResume}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform"
                    >
                        الاستمرار في الجلسة
                    </button>
                    <button 
                        onClick={onStartNew}
                        className="w-full py-3 bg-gray-500/10 hover:bg-gray-500/20 rounded-xl font-bold opacity-70 active:scale-95 transition-transform"
                        style={{ color: 'var(--modal-text)' }}
                    >
                        البدء من جديد
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuranReader: FC<{ page: string, onBack: () => void, onNavigate: (pageId: string) => void, onOpenThemes?: () => void, initialLandscape?: boolean, initialSurah?: number, initialAyah?: number, initialPage?: number, isWirdMode?: boolean, isMemorizationMode?: boolean, memorizationSettings?: any, navParams?: any }> = ({ page, onBack, onNavigate, onOpenThemes, initialLandscape = false, initialSurah, initialAyah, initialPage, isWirdMode = false, isMemorizationMode = false, memorizationSettings, navParams }) => {
    const { setCurrentPage, isGlobalTheme, themeKey } = useTheme();

    const [isLandscape, setIsLandscape] = useState(initialLandscape);

    const [readingMode, setReadingMode] = useState<ReadingMode>(() => {
        if (isWirdMode || isMemorizationMode) return 'mushaf';
        if (initialLandscape) return 'mushaf';
        const mode = initialLandscape ? '_h' : '_v';
        const saved = localStorage.getItem('last_reading_mode' + mode);
        return (saved as ReadingMode) || 'mushaf';
    });
    
    useEffect(() => {
        if (!isWirdMode && !isMemorizationMode) {
            const mode = isLandscape ? '_h' : '_v';
            localStorage.setItem('last_reading_mode' + mode, readingMode);
        }
    }, [readingMode, isWirdMode, isMemorizationMode, isLandscape]);

    // Independent reading mode for landscape/vertical
    useEffect(() => {
        if (isWirdMode || isMemorizationMode) return;
        if (isLandscape) {
            if (readingMode !== 'mushaf') setReadingMode('mushaf');
            return;
        }
        const mode = isLandscape ? '_h' : '_v';
        const saved = localStorage.getItem('last_reading_mode' + mode);
        if (saved && saved !== readingMode) {
            setReadingMode(saved as ReadingMode);
        }
    }, [isLandscape, isWirdMode, isMemorizationMode]);

    useEffect(() => {
        setCurrentPage(`quran_${readingMode}`);
    }, [setCurrentPage, readingMode]);

    const [showResumeModal, setShowResumeModal] = useState(false);
    const [savedSession, setSavedSession] = useState<any>(null);
    const [localIsMemorizationMode, setLocalIsMemorizationMode] = useState(isMemorizationMode);
    const [localMemorizationSettings, setLocalMemorizationSettings] = useState(memorizationSettings);
    const [isHideMode, setIsHideMode] = useState(memorizationSettings?.isReviewMode || false);
    
    useEffect(() => {
        if (localMemorizationSettings?.isReviewMode) {
            setIsHideMode(true);
            setRevealedAyahs([]);
            setTempRevealedAyah(null);
        } else {
            setIsHideMode(false);
            setRevealedAyahs([]);
            setTempRevealedAyah(null);
        }
    }, [localMemorizationSettings?.isReviewMode]);
    const [revealedAyahs, setRevealedAyahs] = useState<string[]>([]);
    const [tempRevealedAyah, setTempRevealedAyah] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
    const [showReviewTest, setShowReviewTest] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    // Auto-detect orientation based on layout dimensions for browser and device compatibility
    useEffect(() => {
        const handleResize = () => {
            if (initialLandscape) return;
            
            // Ignore resize if keyboard is likely open to prevent orientation flip
            const activeEl = document.activeElement;
            const isInputActive = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.getAttribute('contenteditable') === 'true';
            
            if (isInputActive) {
                return;
            }

            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Check if height changed drastically (likely keyboard)
            // A typical keyboard takes 30-50% of the screen.
            // If the ratio width/height increased but absolute height decreased a lot, it's likely keyboard.
            // But matchMedia is better for this.
            
            // Use matchMedia for more reliable orientation detection that ignores keyboard height
            let isL = window.matchMedia("(orientation: landscape)").matches;
            
            // Re-validate: if it claims landscape but height is EXTREMELY small relative to width on a mobile device,
            // or if it's a mobile device and width < 600, it's probably just a resize.
            // Most phones in landscape are > 600px wide.
            if (isL && width < 600 && (navigator.userAgent.includes('Mobi') || navigator.userAgent.includes('Android'))) {
                return;
            }
            
            // Only auto-switch to landscape mode on mobile/native devices. 
            // On desktop/preview, a wide window shouldn't force the mobile landscape reading UI 
            // which hides toolbars and share buttons.
            if (!Capacitor.isNativePlatform()) {
                const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (!isMobileUA) {
                    isL = false; // Always default to portrait in desktop preview so toolbars/share buttons appear normally
                }
            }
            
            if (isL !== isLandscapeRef.current) {
                setIsLandscape(isL);
            }
        };
        
        // Use both resize event and ResizeObserver for maximum robustness
        window.addEventListener('resize', handleResize);
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(document.body);
        
        handleResize(); // Initial check
        
        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, []);

    const sharedSuffix = isLandscape ? '_h' : '_v';
    const modeSuffix = sharedSuffix;
    
    // Scoped suffixes for bookmarks and last position to have separate records for each mode
    const getScopedSuffix = (mode: string, landscapeFlag?: boolean) => {
        const orient = (landscapeFlag !== undefined ? landscapeFlag : isLandscape) ? 'h' : 'v';
        if (isWirdMode) return `_wird_${orient}`;
        if (localIsMemorizationMode) return `_memorization_${orient}`;
        if (mode === 'mushaf') return `_${orient}`;
        return `_${mode}_${orient}`;
    };

    const bookmarkSuffix = getScopedSuffix(readingMode);
    const posSuffix = getScopedSuffix(readingMode);
    const themeSuffix = posSuffix; // Always scope settings/themes strictly per mode

    const getOtherOrientSuffix = useCallback((mode: string) => {
        if (mode.endsWith('_h')) return mode.replace('_h', '_v');
        if (mode.endsWith('_v')) return mode.replace('_v', '_h');
        return mode;
    }, []);

    const [quranData, setQuranData] = useState(quranJsonData);

    const hasJumpedRef = useRef(false);

    const handleHomeClick = useCallback(async (targetPage?: string) => {
        if (isLandscape) {
            setIsLandscape(false);
            try {
                if (Capacitor.isNativePlatform()) {
                    await ScreenOrientation.lock({ orientation: 'portrait' });
                    // Give a small delay for orientation to settle
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (e) {
                console.error('Failed to lock orientation to portrait', e);
            }
        }
        if (targetPage === 'home') {
            onNavigate('home');
        } else {
            onBack();
        }
    }, [isLandscape, onBack, onNavigate]);

    const [isLandscapeUIHidden, setIsLandscapeUIHidden] = useState(() => {
        if (initialLandscape) return true;
        // Default to false (visible) to ensure UI is seen in browser preview
        // Only hide if explicitly saved as hidden in localStorage for this mode
        try {
            const saved = localStorage.getItem('is_landscape_ui_hidden' + modeSuffix);
            return saved === 'true';
        } catch (e) {
            return false;
        }
    });
    const isLandscapeUIHiddenRef = useRef(isLandscapeUIHidden);
    useEffect(() => { 
        isLandscapeUIHiddenRef.current = isLandscapeUIHidden; 
        if (isLandscapeRef.current) {
            localStorage.setItem('is_landscape_ui_hidden' + modeSuffix, String(isLandscapeUIHidden));
        }
    }, [isLandscapeUIHidden, modeSuffix]);

    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const prevReadingModeRef = useRef(readingMode);
    const markerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(100);

    const [visiblePages, setVisiblePages] = useState<number[]>(() => {
        let p = initialPage;
        if (!p && initialSurah) {
            const surah = quranJsonData.surahs[initialSurah - 1];
            const ayah = surah?.ayahs[(initialAyah || 1) - 1];
            if (ayah) p = ayah.page;
        }
        if (!p && isMemorizationMode && memorizationSettings) {
             const surah = quranJsonData.surahs[memorizationSettings.fromSurah - 1];
             const ayah = surah?.ayahs[(memorizationSettings.fromAyah || 1) - 1];
             if (ayah) p = ayah.page;
        }
        if (!p) {
             try {
                // readingMode is initialized before this
                const orient = initialLandscape ? 'h' : 'v';
                let key = '';
                if (isWirdMode) key = `_wird_${orient}`;
                else if (isMemorizationMode) key = `_memorization_${orient}`;
                else if (readingMode === 'mushaf') key = `_${orient}`;
                else key = `_${readingMode}_${orient}`;

                const saved = localStorage.getItem(`last_pos${key}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && typeof parsed.s === 'number') {
                        const surah = quranJsonData.surahs[parsed.s - 1];
                        const ayah = surah?.ayahs[(parsed.a || 1) - 1];
                        if (ayah) p = ayah.page;
                    }
                }
            } catch(e) {}
        }
        const targetPage = p || 1;
        return [...new Set([targetPage, targetPage + 1, targetPage + 2, targetPage - 1, targetPage - 2])].filter(n => n > 0 && n <= 604).sort((a: number, b: number) => a - b);
    });
    const [wirdEndPage, setWirdEndPage] = useState<number | null>(null);
    const [showWirdCompleteModal, setShowWirdCompleteModal] = useState(false);
    const [hasShownWirdComplete, setHasShownWirdComplete] = useState(false);

    useEffect(() => {
        if (isWirdMode) {
            const saved = localStorage.getItem('dailyWirdSettings_v2');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const activeProfile = parsed.profiles?.find((p: any) => p.id === parsed.activeId);
                    if (activeProfile && activeProfile.isActive) {
                        const { end } = getDayRange(activeProfile.currentDay, activeProfile);
                        setWirdEndPage(end);
                    }
                } catch (e) {}
            }
        }
    }, [isWirdMode]);

    const [currentAyah, setCurrentAyah] = useState<{ s: number; a: number }>(() => {
        if (initialSurah) {
            return { s: initialSurah, a: initialAyah || 1 };
        }
        if (initialPage) {
            // Find the first ayah on this page
            const pageInt = Number(initialPage);
            for (let s = 1; s <= 114; s++) {
                const surah = quranJsonData.surahs[s-1];
                for (let a = 1; a <= surah.ayahs.length; a++) {
                    if (surah.ayahs[a-1].page === pageInt) {
                        return { s, a };
                    }
                }
            }
        }
        if (localIsMemorizationMode && localMemorizationSettings) {
            return { s: localMemorizationSettings.fromSurah, a: localMemorizationSettings.fromAyah };
        }
        try {
            const orient = initialLandscape ? 'h' : 'v';
            let key = '';
            if (isWirdMode) key = `_wird_${orient}`;
            else if (isMemorizationMode) key = `_memorization_${orient}`;
            else if (readingMode === 'mushaf') key = `_${orient}`;
            else key = `_${readingMode}_${orient}`;

            const saved = localStorage.getItem(`last_pos${key}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed.s === 'number') {
                    return { s: parsed.s, a: parsed.a || 1 };
                }
            }
        } catch(e) {}
        return { s: 1, a: 1 };
    });

    const recordedAudioRef = useRef<HTMLAudioElement | null>(null);

    const speechRecognitionRef = useRef<any>(null);
    const recognizedTextRef = useRef<string>('');
    const isSpeechRecognitionActiveRef = useRef(false);

    const checkRecognizedText = (isFinalCheck = false) => {
        const ayah = currentAyahRef.current;
        const spokenText = normalizeArabic(recognizedTextRef.current);
        const currentAyahData = quranData?.surahs[ayah.s - 1]?.ayahs[ayah.a - 1];
        
        if (currentAyahData) {
            const originalText = normalizeArabic(currentAyahData.text);
            
            const spokenWords = spokenText.split(' ').filter(w => w.length > 0);
            const originalWords = originalText.split(' ').filter(w => w.length > 0);
            
            let matchCount = 0;
            for (const word of originalWords) {
                if (spokenWords.includes(word)) {
                    matchCount++;
                }
            }
            
            const matchPercentage = originalWords.length > 0 ? matchCount / originalWords.length : 0;
            
            // If it's correct (or mostly correct)
            if (matchPercentage > 0.6 || spokenText.includes(originalText) || originalText.includes(spokenText)) {
                // It's correct!
                showToast('أحسنت');
                const ayahKey = `${ayah.s}-${ayah.a}`;
                setRevealedAyahs(prev => prev.includes(ayahKey) ? prev : [...prev, ayahKey]);
                
                // Clear recognized text for the next ayah
                recognizedTextRef.current = '';
                
                // Check if we reached the end of the memorization range
                let isEnd = false;
                if (localMemorizationSettings) {
                    const { toSurah, toAyah } = localMemorizationSettings;
                    if (ayah.s === toSurah && ayah.a === toAyah) {
                        showToast('تم الانتهاء من المراجعة بنجاح');
                        isEnd = true;
                    }
                }

                // Stop the recording immediately as requested
                stopRecording(true);
                
                if (isEnd) return;

                // Move to next ayah
                const nextA = ayah.a + 1;
                const currentSurah = quranData.surahs[ayah.s - 1];
                if (nextA <= currentSurah.ayahs.length) {
                    jumpToAyah(ayah.s, nextA, true);
                } else if (ayah.s < 114) {
                    jumpToAyah(ayah.s + 1, 1, true);
                }
            } else if (spokenWords.length >= Math.max(2, originalWords.length * 0.4)) {
                // If they spoke enough words but it's wrong, show error and reveal temporarily
                showToast('أخطأت، حاول مرة أخرى');
                const ayahKey = `${ayah.s}-${ayah.a}`;
                setTempRevealedAyah(ayahKey);
                
                // Clear the recognized text so they can try again
                recognizedTextRef.current = '';
                
                // Hide the ayah again after 3 seconds
                setTimeout(() => {
                    setTempRevealedAyah(null);
                }, 3000);
            } else if (isFinalCheck) {
                // If it's the final check (user pressed stop or error detected) and it's wrong
                showToast('أخطأت أعد المحاولة');
                
                // Flash the ayah as a hint
                const ayahKey = `${ayah.s}-${ayah.a}`;
                setTempRevealedAyah(ayahKey);
                setTimeout(() => {
                    setTempRevealedAyah(null);
                }, 800); // Show for 0.8 seconds

                if (recognizedTextRef.current) {
                    console.log("Recognized text was:", recognizedTextRef.current);
                }
                
                // Reset recognized text to let them try again
                recognizedTextRef.current = '';
            }
        }
    };

    const startRecording = async () => {
        stopAudio(); // Stop reciter audio
        if (recordedAudioRef.current) {
            recordedAudioRef.current.pause();
            recordedAudioRef.current = null;
        }
        
        recognizedTextRef.current = '';
        isSpeechRecognitionActiveRef.current = false;

        if (localMemorizationSettings?.isReviewMode) {
            try {
                if (Capacitor.isNativePlatform()) {
                    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                    const checkPerm = await SpeechRecognition.checkPermissions();
                    if (checkPerm.speechRecognition !== 'granted') {
                        await SpeechRecognition.requestPermissions();
                    }
                    
                    SpeechRecognition.removeAllListeners(); // Clear previous listeners
                    SpeechRecognition.addListener('partialResults', (data: any) => {
                        if (data.matches && data.matches.length > 0) {
                            recognizedTextRef.current = data.matches[0];
                            checkRecognizedText(false);
                        }
                    });
                    
                    SpeechRecognition.addListener('listeningState', (data: any) => {
                        console.log("Listening state changed:", data.status);
                    });
                    
                    await SpeechRecognition.start({
                        language: "ar-SA",
                        maxResults: 1,
                        partialResults: true,
                        popup: false
                    });
                    
                    isSpeechRecognitionActiveRef.current = true;
                } else {
                    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                    if (SpeechRecognitionAPI) {
                        const recognition = new SpeechRecognitionAPI();
                        recognition.lang = 'ar-SA';
                        recognition.continuous = true;
                        recognition.interimResults = true;
                        
                        recognition.onstart = () => {
                        console.log("Speech recognition started");
                        showToast('جاري الاستماع...');
                    };

                    recognition.onerror = (event: any) => {
                        console.error("Speech recognition error", event.error);
                        showToast(`خطأ في التعرف على الصوت: ${event.error}`);
                        setIsRecording(false);
                        isSpeechRecognitionActiveRef.current = false;
                    };

                        recognition.onresult = (event: any) => {
                            let interimTranscript = '';
                            let isFinal = false;
                            for (let i = event.resultIndex; i < event.results.length; ++i) {
                                if (event.results[i].isFinal) {
                                    recognizedTextRef.current = event.results[i][0].transcript;
                                    isFinal = true;
                                } else {
                                    interimTranscript += event.results[i][0].transcript;
                                }
                            }
                            if (interimTranscript) {
                                recognizedTextRef.current = interimTranscript;
                            }
                            checkRecognizedText(isFinal);
                        };
                        
                        speechRecognitionRef.current = recognition;
                        recognition.start();
                        isSpeechRecognitionActiveRef.current = true;
                    } else {
                        throw new Error("Speech Recognition not supported");
                    }
                }
                setIsRecording(true);
                showToast('بدأ الاستماع...');
                return;
            } catch (err) {
                console.error("Error starting speech recognition", err);
                isSpeechRecognitionActiveRef.current = false;
                // Fallback to normal recording if speech recognition fails
            }
        }

        try {
            if (Capacitor.isNativePlatform()) {
                const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();
                if (!hasPermission.value) {
                    const request = await VoiceRecorder.requestAudioRecordingPermission();
                    if (!request.value) {
                        showToast('الرجاء منح صلاحية الميكروفون');
                        return;
                    }
                }
                
                const result = await VoiceRecorder.startRecording();
                if (result.value) {
                    setIsRecording(true);
                    showToast('بدأ التسجيل...');
                } else {
                    showToast('فشل بدء التسجيل');
                }
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setRecordedAudio(audioUrl);
                    setIsRecording(false);
                };

                mediaRecorder.start();
                setIsRecording(true);
                showToast('بدأ التسجيل...');
            }
        } catch (err) {
            console.error("Error starting recording", err);
            showToast('فشل بدء التسجيل');
        }
    };

    const stopRecording = async (isAutoMatched: any = false) => {
        const autoMatched = isAutoMatched === true;
        setIsRecording(false);
        if (localMemorizationSettings?.isReviewMode && isSpeechRecognitionActiveRef.current) {
            try {
                if (Capacitor.isNativePlatform()) {
                    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                    await SpeechRecognition.stop();
                    SpeechRecognition.removeAllListeners();
                } else if (speechRecognitionRef.current) {
                    speechRecognitionRef.current.stop();
                }
                
                isSpeechRecognitionActiveRef.current = false;

                if (!autoMatched) {
                    // Manual stop, check if it's correct
                    checkRecognizedText(true);
                }
                return;
            } catch (err) {
                console.error("Error stopping speech recognition", err);
            }
        }

        if (Capacitor.isNativePlatform()) {
            try {
                const result = await VoiceRecorder.stopRecording();
                if (result.value && result.value.recordDataBase64) {
                    const audioUrl = `data:${result.value.mimeType};base64,${result.value.recordDataBase64}`;
                    setRecordedAudio(audioUrl);
                    showToast('تم إيقاف التسجيل');
                }
            } catch (err) {
                console.error("Error stopping recording", err);
                showToast('فشل إيقاف التسجيل');
            }
        } else if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            showToast('تم إيقاف التسجيل');
        }
    };

    const playRecordedAudio = () => {
        stopAudio(); // Stop reciter audio
        if (recordedAudioRef.current) {
            recordedAudioRef.current.pause();
        }
        if (recordedAudio) {
            const audio = new Audio(recordedAudio);
            recordedAudioRef.current = audio;
            audio.play();
        }
    };

    useEffect(() => {
        if (isWirdMode && wirdEndPage && quranData && !hasShownWirdComplete) {
            const ayah = quranData.surahs[currentAyah.s - 1]?.ayahs[currentAyah.a - 1];
            if (ayah && ayah.page > wirdEndPage) {
                // تأخير ظهور النافذة لضمان رؤية اكتمال الصفحة وانتقالها للأعلى
                const timer = setTimeout(() => {
                    setShowWirdCompleteModal(true);
                    setHasShownWirdComplete(true);
                }, 1200);
                return () => clearTimeout(timer);
            }
        }
    }, [currentAyah, wirdEndPage, quranData, hasShownWirdComplete, isWirdMode]);
    const isInitialMountRef = useRef(true);

    useEffect(() => {
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            return;
        }
        if (isWirdMode && quranData) {
            const ayah = quranData.surahs[currentAyah.s - 1]?.ayahs[currentAyah.a - 1];
            if (ayah) {
                const page = ayah.page;
                // Update localStorage for Daily Wird progress
                const saved = localStorage.getItem('dailyWirdSettings_v2');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        const activeProfileIndex = parsed.profiles?.findIndex((p: any) => p.id === parsed.activeId);
                        if (activeProfileIndex !== -1) {
                            // Only update if it's a new position
                            if (parsed.profiles[activeProfileIndex].lastPage !== page || 
                                parsed.profiles[activeProfileIndex].lastAyah?.s !== currentAyah.s ||
                                parsed.profiles[activeProfileIndex].lastAyah?.a !== currentAyah.a) {
                                
                                parsed.profiles[activeProfileIndex].lastPage = page;
                                parsed.profiles[activeProfileIndex].lastAyah = currentAyah;
                                localStorage.setItem('dailyWirdSettings_v2', JSON.stringify(parsed));
                            }
                        }
                    } catch (e) {}
                }
            }
        }
    }, [currentAyah, isWirdMode, quranData]);

    const [highlightedAyahId, setHighlightedAyahId] = useState<string | null>(null);
    const [isTransparentMode, setIsTransparentMode] = useState(() => localStorage.getItem('transparent_mode' + modeSuffix) === 'true');
    const [isHideToolbarsEnabled, setIsHideToolbarsEnabled] = useState(() => {
        const saved = localStorage.getItem('hide_toolbars_enabled' + modeSuffix);
        return saved !== null ? saved === 'true' : false;
    });
    const isHideToolbarsEnabledRef = useRef(isHideToolbarsEnabled);
    useEffect(() => { isHideToolbarsEnabledRef.current = isHideToolbarsEnabled; }, [isHideToolbarsEnabled]);
    const [lastInteractionType, setLastInteractionType] = useState<'page' | 'ayah'>(() => {
        const saved = localStorage.getItem('last_interaction_type' + modeSuffix);
        return (saved as 'page' | 'ayah') || 'page';
    });

    useEffect(() => {
        localStorage.setItem('last_interaction_type' + modeSuffix, lastInteractionType);
    }, [lastInteractionType, modeSuffix]);

    const [activeModals, setActiveModals] = useState<string[]>([]);
    const [initialSearchQuery, setInitialSearchQuery] = useState<string | undefined>(undefined);
    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
    const [ayahContextMenu, setAyahContextMenu] = useState<{isOpen: boolean, isCustomizing: boolean, x: number, y: number, s: number, a: number, tempSettings: any, originalSettings: any}>({isOpen: false, isCustomizing: false, x: 0, y: 0, s: 0, a: 0, tempSettings: DEFAULT_SETTINGS, originalSettings: DEFAULT_SETTINGS});
    const [ayahContextColorField, setAyahContextColorField] = useState<'textColor' | 'bgColor' | 'highlightTextColor' | null>(null);

    const PREDEFINED_COLORS = [
        '#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#000000',
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e', '#78716c', '#57534e', 'transparent'
    ];

    const renderCheckerboard = (color: string) => {
        if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
            return {
                backgroundColor: '#ffffff',
                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)',
                backgroundSize: '8px 8px'
            };
        }
        return { backgroundColor: color };
    };
    
    // Close context menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (ayahContextMenu.isOpen && activeModals.length === 0) {
                const target = e.target as HTMLElement;
                if (!target.closest('.ayah-context-menu')) {
                    setAyahContextMenu(prev => ({ ...prev, isOpen: false }));
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [ayahContextMenu.isOpen, activeModals]);

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('settings-change'));
    };
    const isLandscapeRef = useRef(initialLandscape);
    useEffect(() => { isLandscapeRef.current = isLandscape; }, [isLandscape]);

    useEffect(() => {
        const lockOrientation = async () => {
            try {
                if (initialLandscape) {
                    await ScreenOrientation.lock({ orientation: 'landscape' });
                } else {
                    await ScreenOrientation.unlock();
                }
            } catch (e) {
                console.log('Screen orientation lock failed or not supported in this environment', e);
            }
        };
        lockOrientation();
        
        return () => {
            const unlockOrientation = async () => {
                try {
                    if (Capacitor.isNativePlatform()) {
                        await ScreenOrientation.lock({ orientation: 'portrait' });
                    }
                    await ScreenOrientation.unlock();
                } catch (e) {
                    console.log('Screen orientation unlock failed', e);
                }
            };
            unlockOrientation();
        };
    }, [initialLandscape]);

    // Load settings based on orientation and mode
    useEffect(() => {
        const mode = themeSuffix;
        
        const savedSettings = localStorage.getItem('quran_settings' + mode);
        const baseSettings = savedSettings ? JSON.parse(savedSettings) : {};
        const initialSettings = { ...DEFAULT_SETTINGS, ...baseSettings };
        
        // Guard setSettings to avoid unnecessary re-renders
        setSettings(prev => {
            if (JSON.stringify(prev) === JSON.stringify(initialSettings)) return prev;
            return initialSettings;
        });

        const themeId = localStorage.getItem('current_theme_id' + mode) || 'black';
        const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['black'];
        
        setCurrentTheme(prev => {
            if (prev?.id === newTheme.id) return prev;
            return newTheme;
        });
        
        const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
        setIsTransparentMode(transSetting);

        const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + bookmarkSuffix);
        const parsedBookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
        setBookmarks(prev => {
            if (JSON.stringify(prev) === JSON.stringify(parsedBookmarks)) return prev;
            return parsedBookmarks;
        });

        const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
        const targetSajdah = savedSajdah !== null ? savedSajdah === 'true' : true;
        if (showSajdahCard !== targetSajdah) setShowSajdahCard(targetSajdah);

        if (mode.endsWith('_h')) {
            setIsLandscapeUIHidden(true);
        } else {
            if (!isHideToolbarsEnabledRef.current && isLandscapeUIHidden !== false) setIsLandscapeUIHidden(false);
        }

        const posKey = `last_pos${posSuffix}`;
        const lastPos = JSON.parse(localStorage.getItem(posKey) || '{}');
        
        // Only stop activities if the reading mode actually changed, not just orientation
        if (prevReadingModeRef.current !== readingMode) {
            stopAudio();
            setAutoScrollState({ isActive: false, isPaused: false, elapsedTime: 0 });
            setActiveModals([]);
            setIsFloatingMenuOpen(false);
            prevReadingModeRef.current = readingMode;

            // Immediately update currentAyah to the last position of the new mode
            if (lastPos.s && lastPos.a) {
                setCurrentAyah({ s: lastPos.s, a: lastPos.a });
            }
        }

        if (!hasJumpedRef.current && (initialSurah || initialPage || localIsMemorizationMode || isWirdMode)) {
            // Do not jump to lastPos on initial mount if we have initial params
        } else {
            // Prevent scroll listener from overwriting position during transition
            isJumpingRef.current = true;
            const targetS = lastPos.s || 1;
            const targetA = lastPos.a || 1;
            
            setTimeout(() => {
                jumpToAyah(targetS, targetA, true);
            }, 100);
        }

        const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + mode);
        if (savedToolbarColors) {
            try {
                const colors = JSON.parse(savedToolbarColors);
                // SANITIZER: Force solid colors for backgrounds
                Object.keys(colors).forEach(key => {
                    if (colors[key].bg && (colors[key].bg.includes('rgba') || colors[key].bg === 'transparent')) {
                        colors[key].bg = THEMES[themeId as keyof typeof THEMES]?.barBg || "#ffffff";
                    }
                    if (colors[key].border && (colors[key].border.includes('rgba') || colors[key].border === 'transparent')) {
                        colors[key].border = THEMES[themeId as keyof typeof THEMES]?.barBorder?.split(' ')[2] || "#e5e7eb";
                    }
                });
                setToolbarColors(colors);
            } catch (e) {}
        } else {
            const theme = THEMES['black'];
            
            setToolbarColors({
                'top-toolbar': { bg: theme.barBg, border: theme.barBorder },
                'bottom-toolbar': { bg: theme.barBg, border: theme.barBorder },
                'surah': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font },
                'page': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font },
                'audio': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
                'btn-settings': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
                'btn-home': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
                'btn-bookmark': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
                'btn-bookmarks-list': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
                'btn-themes': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
                'btn-autoscroll': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
                'btn-menu': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
                'btn-share': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }
            });
        }
    }, [themeSuffix, posSuffix, initialSurah, initialPage, localIsMemorizationMode, isWirdMode, isGlobalTheme]);
    
    useEffect(() => {
        if (!isLandscape) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let isScrolling = false;
        let lastTouchTime = 0;
        let velocityX = 0;
        let velocityY = 0;
        let momentumFrame: number | null = null;
        let activeScrollable: HTMLElement | null = null;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            if (momentumFrame) cancelAnimationFrame(momentumFrame);
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            lastTouchX = touchStartX;
            lastTouchY = touchStartY;
            lastTouchTime = e.timeStamp;
            isScrolling = false;
            velocityX = 0;
            velocityY = 0;
            activeScrollable = null;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const currentTime = e.timeStamp;
            
            if (!isScrolling) {
                if (Math.abs(currentX - touchStartX) > 10 || Math.abs(currentY - touchStartY) > 10) {
                    isScrolling = true;
                } else {
                    return;
                }
            }

            const deltaX = currentX - lastTouchX;
            const deltaY = currentY - lastTouchY;
            const deltaTime = currentTime - lastTouchTime;
            
            if (deltaTime > 0) {
                velocityX = deltaX / deltaTime;
                velocityY = deltaY / deltaTime;
            }
            
            lastTouchX = currentX;
            lastTouchY = currentY;
            lastTouchTime = currentTime;

            if (isScrolling) {
                let target = e.target as HTMLElement;
                let scrollable: HTMLElement | null = null;
                
                while (target && target !== document.body) {
                    const style = window.getComputedStyle(target);
                    const overflowY = style.overflowY;
                    const overflowX = style.overflowX;
                    
                    const canScrollY = (overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight;
                    const canScrollX = (overflowX === 'auto' || overflowX === 'scroll') && target.scrollWidth > target.clientWidth;
                    
                    if (canScrollY || canScrollX) {
                        scrollable = target;
                        break;
                    }
                    target = target.parentElement as HTMLElement;
                }

                if (scrollable) {
                    const isSimulatedLandscape = isLandscape && window.innerHeight > window.innerWidth;
                    
                    if (isSimulatedLandscape) {
                        if (e.cancelable) {
                            e.preventDefault();
                        }
                        // In 90deg rotation: 
                        // Physical UP/DOWN (deltaY) should scroll the list (scrollTop)
                        // Physical LEFT/RIGHT (deltaX) should scroll horizontally (scrollLeft)
                        scrollable.scrollTop -= deltaY;
                        scrollable.scrollLeft += deltaX;
                        activeScrollable = scrollable;
                    } else if (isLandscape) {
                        // Native landscape: normal mapping
                        // We could let browser handle it, but if we are here, we might want to override.
                        // Actually, for native landscape, it's better to NOT preventDefault and let browser handle it.
                        // But let's keep it consistent if we want custom momentum.
                        if (e.cancelable) {
                            e.preventDefault();
                        }
                        scrollable.scrollTop -= deltaY;
                        scrollable.scrollLeft -= deltaX;
                        activeScrollable = scrollable;
                    }
                }
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!isScrolling || !activeScrollable) return;
            
            const timeSinceLastMove = e.timeStamp - lastTouchTime;
            if (timeSinceLastMove > 50) {
                velocityX = 0;
                velocityY = 0;
            }
            
            let vx = velocityX;
            let vy = velocityY;
            const friction = 0.95;
            const isSimulatedLandscape = isLandscape && window.innerHeight > window.innerWidth;
            
            const applyMomentum = () => {
                if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) return;
                
                if (activeScrollable) {
                    if (isSimulatedLandscape) {
                        activeScrollable.scrollTop -= vy * 16;
                        activeScrollable.scrollLeft += vx * 16;
                    } else {
                        activeScrollable.scrollTop -= vy * 16;
                        activeScrollable.scrollLeft -= vx * 16;
                    }
                }
                
                vx *= friction;
                vy *= friction;
                
                momentumFrame = requestAnimationFrame(applyMomentum);
            };
            
            if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
                momentumFrame = requestAnimationFrame(applyMomentum);
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            if (momentumFrame) cancelAnimationFrame(momentumFrame);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isLandscape]);

    const toggleOrientation = () => {
        setIsLandscape(!isLandscape);
        setIsFloatingMenuOpen(false);
    };
    
    const [toast, setToast] = useState({ show: false, message: '' });
    const [reciterToast, setReciterToast] = useState({ show: false, name: '' });
    const [markerNotification, setMarkerNotification] = useState<{ show: boolean, type: 'quarter' | 'sajda' | 'surah', text: string }>({ show: false, type: 'quarter', text: '' });
    const [juzNotification, setJuzNotification] = useState({ show: false, text: '' });
    const juzTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [notificationSettings, setNotificationSettings] = useState(() => {
        const saved = localStorage.getItem('notification_settings' + modeSuffix);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing notification settings', e);
            }
        }
        return {
            quarter: true,
            juz: true,
            sajda: true,
            themes: true,
            downloads: true,
            bookmarks: true,
            general: true
        };
    });

    useEffect(() => {
        const handleUpdate = () => {
            const saved = localStorage.getItem('notification_settings' + modeSuffix);
            if (saved) {
                try {
                    setNotificationSettings(JSON.parse(saved));
                } catch (e) {}
            }
        };
        window.addEventListener('notification-settings-change', handleUpdate);
        return () => window.removeEventListener('notification-settings-change', handleUpdate);
    }, [modeSuffix]);
    const lastNotifiedQuarter = useRef<number | null>(null);
    const lastNotifiedJuz = useRef<number | null>(null);
    const [bookmarks, setBookmarks] = useState(() => {
        const mode = initialLandscape ? '_h' : '_v';
        const bSuffix = (localIsMemorizationMode ? `_memorization_${mode}` : isWirdMode ? `_wird_${mode}` : readingMode === 'mushaf' ? mode : `_${readingMode}_${mode}`);
        return JSON.parse(localStorage.getItem('quran_bookmarks_list' + bSuffix) || '[]');
    });

    // Update bookmarks when mode or tajweed changes
    useEffect(() => {
        const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + bookmarkSuffix);
        const parsedBookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
        setBookmarks(parsedBookmarks);
    }, [bookmarkSuffix]);

    const [sajdahInfo, setSajdahInfo] = useState<{ show: boolean; surah?: string; ayah?: number }>({ show: false });
    const [sajdahCardInfo, setSajdahCardInfo] = useState({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false, openedFromMenu: false });
    const [floatingMenuInitialView, setFloatingMenuInitialView] = useState('main');

    const [autoScrollState, setAutoScrollState] = useState({ isActive: false, isPaused: false, elapsedTime: 0 });
    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const mode = initialLandscape ? '_h' : '_v';
        const saved = localStorage.getItem('show_sajdah_card' + mode);
        return saved !== null ? saved === 'true' : true;
    });

    const [isAutoScrollSettingsOpen, setIsAutoScrollSettingsOpen] = useState(false);
    const autoScrollButtonTimerRef = useRef<number | null>(null);
    const autoScrollFrameRef = useRef<number | null>(null);
    const landscapeAutoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastScrollTimeRef = useRef<number>(0);
    const { 
        isPlaying, setIsPlaying, 
        isAudioLoading, setIsAudioLoading, 
        playingAyah, setPlayingAyah 
    } = useAudioStore();
    
    const [tafseerInfo, setTafseerInfo] = useState({ isOpen: false, s: 0, a: 0, text: '', surahName: '', wasAutoscrolling: false });
    const [tafseerSelectionInfo, setTafseerSelectionInfo] = useState({ isOpen: false, s: 0, a: 0, wasAutoscrolling: false });
    const [isTafseerLoading, setIsTafseerLoading] = useState(false);
    const tafseerCache = useRef<any>({});
    
    const [ayahActionMenu, setAyahActionMenu] = useState({ isOpen: false, s: 0, a: 0, surahName: '', wasAutoscrolling: false });
    const [quranMeaningsInfo, setQuranMeaningsInfo] = useState({ isOpen: false, s: 0, a: 0, text: '', surahName: '', wasAutoscrolling: false });
    const [isQuranMeaningsLoading, setIsQuranMeaningsLoading] = useState(false);
    const quranMeaningsCache = useRef<any>(null);
    
    const [quranTranslationInfo, setQuranTranslationInfo] = useState({ isOpen: false, s: 0, a: 0, text: '', surahName: '', wasAutoscrolling: false });

    useEffect(() => {
        const updateCurrentPage = () => {
            if (tafseerInfo.isOpen) setCurrentPage('tafseer');
            else if (quranMeaningsInfo.isOpen) setCurrentPage('meanings');
            else if (quranTranslationInfo.isOpen) setCurrentPage('translation');
            else setCurrentPage(page);
        };
        setTimeout(updateCurrentPage, 0);
    }, [tafseerInfo.isOpen, quranMeaningsInfo.isOpen, quranTranslationInfo.isOpen, page, setCurrentPage]);
    const [isQuranTranslationLoading, setIsQuranTranslationLoading] = useState(false);
    const quranTranslationCache = useRef<any>(null);

    const [isSurahDesignPickerOpen, setIsSurahDesignPickerOpen] = useState(false);

    const [isPageInputActive, setIsPageInputActive] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const isPageInputActiveRef = useRef(false);
    useEffect(() => { isPageInputActiveRef.current = isPageInputActive; }, [isPageInputActive]);
    const isJumpingRef = useRef(true);
    const wasAutoscrollingBeforeModal = useRef(false);

    const isAnyMenuOpen = isFloatingMenuOpen || 
                          activeModals.length > 0 || 
                          ayahContextMenu.isOpen || 
                          showWirdCompleteModal || 
                          showResumeModal || 
                          showReviewTest || 
                          isRecording ||
                          tafseerInfo.isOpen ||
                          quranMeaningsInfo.isOpen ||
                          quranTranslationInfo.isOpen ||
                          ayahActionMenu.isOpen ||
                          tafseerSelectionInfo.isOpen ||
                          isAutoScrollSettingsOpen ||
                          sajdahCardInfo.show;

    const [settings, setSettings] = useState(() => {
        const mode = getScopedSuffix(readingMode, initialLandscape);
        const saved = localStorage.getItem('quran_settings' + mode);
        const defaultTheme = THEMES['black'];
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS, fontFamily: defaultTheme.font, textColor: "", bgColor: "" };
    });

    const [currentTheme, setCurrentTheme] = useState(() => {
        const mode = getScopedSuffix(readingMode, initialLandscape);
        const themeId = localStorage.getItem('current_theme_id' + mode) || 'black';
        return THEMES[themeId as keyof typeof THEMES] || THEMES['black'];
    });

    // Keep screen awake logic
    useEffect(() => {
        let wakeLock: any = null;

        const requestWakeLock = async () => {
            // 1. Try Capacitor KeepAwake (for APK)
            try {
                await KeepAwake.keepAwake();
            } catch (e) {
                // Not in Capacitor or failed
            }

            // 2. Try Web Screen Wake Lock API (Fallback/Web)
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await (navigator as any).wakeLock.request('screen');
                } catch (err) {
                    console.warn('Wake Lock request failed:', err);
                }
            }
        };

        requestWakeLock();

        // Re-request wake lock when page becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            KeepAwake.allowSleep().catch(() => {});
            if (wakeLock) {
                wakeLock.release().catch(() => {});
            }
        };
    }, []);

    const [toolbarColors, setToolbarColors] = useState(() => {
        const mode = initialLandscape ? '_h' : '_v';
        const saved = localStorage.getItem('toolbar_colors_v2' + mode);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed;
            } catch (e) {}
        }
        
        const theme = THEMES['black'];
        
        return {
            'top-toolbar': { bg: theme.barBg, border: theme.barBorder },
            'bottom-toolbar': { bg: theme.barBg, border: theme.barBorder },
            'surah': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder, font: theme.font },
            'juz': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder, font: theme.font },
            'page': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder, font: theme.font },
            'audio': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
            'btn-settings': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
            'btn-home': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
            'btn-bookmark': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
            'btn-bookmarks-list': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
            'btn-themes': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
            'btn-autoscroll': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
            'btn-menu': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
            'btn-share': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }
        };
    });

    const quranTutorialSteps: TutorialStep[] = [
        {
            id: 'surah-name',
            title: 'اسم السورة واختيار الموضع',
            text: 'عند الضغط يمكنك اختيار السورة او الجزء او الحزب او رقم الايه والانتقال لحظيا اليها وعند الضغط مطولا على اسم السورة يتم عرض معلومات عن السورة',
            selector: '#surah-name-header',
            icon: <Grid className="w-8 h-8 text-white" />
        },
        {
            id: 'page-nav',
            title: 'رقم الصفحة والانتقال السريع',
            text: 'يعرض رقم الصفحة الحالية وفقاً لطبعة المدينة المنورة. بالضغط عليه، تظهر نافذة تتيح لك كتابة رقم الصفحة التي ترغب في الذهاب إليها مباشرة، مما يوفر عليك عناء التقليب اليدوي في المصحف.',
            selector: '#header-page',
            icon: <Move className="w-8 h-8 text-white" />
        },
        {
            id: 'surah-design',
            title: 'تصميم رأس السورة',
            text: 'يوجد مجموعة متنوعة من التصميمات المختلفة والمميزة لرأس السورة. يمكنك الضغط مطولاً على اسم السورة لتغيير التصميم واختيار ما يناسب ذوقك الخاص.',
            selector: '#surah-header-container',
            icon: <Palette className="w-8 h-8 text-white" />
        },
        {
            id: 'audio-play',
            title: 'التشغيل الصوتي واختيار القراء',
            text: 'اضغط هنا لبدء الاستماع لتلاوة عطرة للآيات. الضغط المطول على هذا الزر يفتح لك قائمة بمجموعة كبيرة من القراء من مشاهير القراء، حيث يمكنك اختيار قارئك المفضل وتحديد جودة الصوت.',
            selector: '#btn-play',
            icon: <Mic className="w-8 h-8 text-white" />
        },
        {
            id: 'ayah-text',
            title: 'تفاعل ذكي مع الآيات',
            text: 'عند الضغط على الايه يتم تحديدها بلون مختلف وعند الضغط المطول يمكنك تغيير لون النص القرانى ولون الخلفيه ولون الايه المحدده',
            selector: '.ayah-text-block',
            icon: <MousePointer2 className="w-8 h-8 text-white" />
        },
        {
            id: 'ayah-number',
            title: 'التفسير والترجمه',
            text: 'قم بالضغط على رقم الايه لعرض التفسير أو معانى القران او الترجمه وقم بالضغط المطول على الرقم لاختيار من بين التفسيرات المختلفه',
            selector: '.verse-container',
            icon: <MousePointer2 className="w-8 h-8 text-white" />
        },
        {
            id: 'zoom-gesture',
            title: 'تحكم مرن في حجم الخط',
            text: 'لراحتك، يمكنك استخدام إصبعين على الشاشة (Pinch to Zoom) لتكبير الخط أو تصغيره فوراً في وضع القراءة الطولي، مما يضمن لك رؤية واضحة ومريحة مهما كان حجم شاشة هاتفك.',
            icon: <ZoomIn className="w-8 h-8 text-white" />
        },
        {
            id: 'share-ayah-feature',
            title: 'مشاركة آية',
            text: 'اضغط هنا لمشاركة الآية الحالية كصورة مصممة بشكل جميل. يمكنك تخصيص الخلفية، الخط، والألوان قبل المشاركة مع أصدقائك أو على وسائل التواصل الاجتماعي.',
            selector: '#btn-share',
            icon: <Share2 className="w-8 h-8 text-white" />
        },
        {
            id: 'bookmark-feature',
            title: 'حفظ العلامة',
            text: 'اضغط هنا لحفظ موضع قراءتك الحالي للعودة إليه لاحقاً. يمكنك الضغط مطولاً على الزر لفتح وإدارة قائمة جميع العلامات المرجعية المحفوظة.',
            selector: '#btn-bookmark',
            icon: <Bookmark className="w-8 h-8 text-white" />
        },
        {
            id: 'autoscroll-feature',
            title: 'التمرير التلقائي',
            text: 'يتيح لك هذا الزر بدء أو إيقاف التمرير التلقائي للصفحة أثناء القراءة. اضغط مطولاً لضبط سرعة التمرير بما يتناسب مع سرعة قراءتك.',
            selector: '#btn-autoscroll',
            icon: <Move className="w-8 h-8 text-white" />
        },
        {
            id: 'home-nav',
            title: 'الرئيسية',
            text: 'اضغط هنا للعودة السريعة إلى الشاشة الرئيسية للتطبيق في أي وقت ومن أي مكان داخل صفحة القراءة.',
            selector: '#btn-home',
            icon: <Home className="w-8 h-8 text-white" />
        }
    ];
    const mushafContentRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);
    
    const readingModeRef = useRef(readingMode);
    useEffect(() => { readingModeRef.current = readingMode; }, [readingMode]);
    const floatingMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const scrollIntervalRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const scrollAccumulatorRef = useRef(0);
    const autoScrollPausedRef = useRef(false);
    const currentAyahRef = useRef(currentAyah);
    const lastScrollUpdateTime = useRef(0);
    const pageInputRef = useRef<HTMLInputElement>(null);
    
    const audioCacheRef = useRef<Record<string, HTMLAudioElement>>({});
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const pauseTimeoutRef = useRef<number | null>(null);
    const isMountedRef = useRef<boolean>(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleResumeSession = () => {
        if (savedSession) {
            setLocalIsMemorizationMode(true);
            const settings = {
                ...savedSession.settings,
                rangeRepeatCount: savedSession.rangeRepeatCount,
                currentRepeatCount: savedSession.currentRepeatCount
            };
            setLocalMemorizationSettings(settings);
            memorizationSettingsRef.current = settings;
            
            jumpToAyah(savedSession.currentAyah.s, savedSession.currentAyah.a, true);
            setTimeout(() => {
                if (isMountedRef.current) {
                    playAudio(savedSession.currentAyah.s, savedSession.currentAyah.a);
                }
            }, 500);
        }
        setShowResumeModal(false);
    };

    const handleStartNewFromResume = () => {
        localStorage.removeItem('memorization_session_v1');
        setShowResumeModal(false);
    };

    const currentRepeatCountRef = useRef(localMemorizationSettings?.currentRepeatCount || 0);
    const ayahRepeatCountRef = useRef(settings.ayahRepeatCount || 1);

    useEffect(() => {
        ayahRepeatCountRef.current = settings.ayahRepeatCount || 1;
    }, [settings.ayahRepeatCount]);

    const sajdahInfoRef = useRef(sajdahInfo);
    useEffect(() => { sajdahInfoRef.current = sajdahInfo; }, [sajdahInfo]);
    const sajdahCardInfoRef = useRef(sajdahCardInfo);
    useEffect(() => { sajdahCardInfoRef.current = sajdahCardInfo; }, [sajdahCardInfo]);
    const autoScrollStateRef = useRef(autoScrollState);
    useEffect(() => { autoScrollStateRef.current = autoScrollState; }, [autoScrollState]);
    const isPlayingRef = useRef(isPlaying);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    const isAudioLoadingRef = useRef(isAudioLoading);
    useEffect(() => { isAudioLoadingRef.current = isAudioLoading; }, [isAudioLoading]);
    const highlightedAyahIdRef = useRef(highlightedAyahId);
    useEffect(() => { highlightedAyahIdRef.current = highlightedAyahId; }, [highlightedAyahId]);

    useEffect(() => { currentAyahRef.current = currentAyah; }, [currentAyah]);

    useEffect(() => {
        // Clear audio cache when reader changes to prevent playing old reader's audio
        audioCacheRef.current = {};

        if (isPlaying || isAudioLoading) {
            // Restart with new reader from the currently playing ayah (if any), otherwise current selected
            const target = playingAyah || currentAyah;
            playAudio(target.s, target.a);
        }
    }, [settings.reader]);
    
    useEffect(() => {
        if (isPageInputActive && pageInputRef.current) {
            pageInputRef.current.focus();
        }
    }, [isPageInputActive]);

    const showToast = useCallback((message: string) => {
        // Check notification settings
        const isTheme = message.includes('ثيم') || message.includes('الشفافية') || message.includes('لون التحديد');
        const isDownload = message.includes('تحميل') || message.includes('محملة مسبقاً');
        const isBookmark = message.includes('الإشارة المرجعية');
        
        if (isTheme && notificationSettings.themes === false) return;
        if (isDownload && notificationSettings.downloads === false) return;
        if (isBookmark && notificationSettings.bookmarks === false) return;
        if (!isTheme && !isDownload && !isBookmark && notificationSettings.general === false) {
            // Only allow critical messages if general is off? 
            // For now, respect the user's wish to turn off general notifications
            return;
        }

        setToast({ show: true, message });
    }, [notificationSettings]);
    
    const stopAudio = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.onended = null;
        }
        if (recordedAudioRef.current) {
            recordedAudioRef.current.pause();
            recordedAudioRef.current = null;
        }
        if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
            pauseTimeoutRef.current = null;
        }
        currentRepeatCountRef.current = 0;
        setIsPlaying(false);
        setIsAudioLoading(false);
        setPlayingAyah(null);
    }, [setIsPlaying, setIsAudioLoading, setPlayingAyah]);

    const isSessionFinishedRef = useRef(false);

    // Stop audio on unmount and save memorization session if active
    useEffect(() => {
        const handleStopAudio = () => stopAudio();
        window.addEventListener('quran-stop-audio', handleStopAudio);

        // Stop audio when app is backgrounded (minimized)
        const appStateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (!isActive) {
                stopAudio();
            }
        });

        return () => {
            window.removeEventListener('quran-stop-audio', handleStopAudio);
            appStateListener.then(l => l.remove());
            
            if (localIsMemorizationMode && !isSessionFinishedRef.current) {
                const sessionData = {
                    currentAyah: currentAyahRef.current,
                    settings: memorizationSettingsRef.current,
                    rangeRepeatCount: rangeRepeatCountRef.current,
                    currentRepeatCount: currentRepeatCountRef.current,
                    timestamp: Date.now()
                };
                localStorage.setItem('memorization_session_v1', JSON.stringify(sessionData));
            }
            stopAudio();
        };
    }, [localIsMemorizationMode, stopAudio]);
    const showMarkerNotification = useCallback((type: 'quarter' | 'sajda' | 'surah', text: string) => {
        // Map types to settings
        const settingKey = type === 'quarter' ? 'quarter' : type === 'sajda' ? 'sajda' : 'general';
        if (!notificationSettings[settingKey]) return;
        
        // Defer state update to prevent "Cannot update a component while rendering" error
        // as this can be called from Virtuoso callbacks
        setTimeout(() => {
            if (markerTimeoutRef.current) clearTimeout(markerTimeoutRef.current);
            setMarkerNotification({ show: true, type, text });
            markerTimeoutRef.current = setTimeout(() => {
                setMarkerNotification(prev => ({ ...prev, show: false }));
                markerTimeoutRef.current = null;
            }, 3500);
        }, 0);
    }, [notificationSettings]);

    const showJuzNotification = useCallback((text: string) => {
        if (notificationSettings.juz === false) return;
        
        // Defer state update to prevent "Cannot update a component while rendering" error
        setTimeout(() => {
            if (juzTimeoutRef.current) clearTimeout(juzTimeoutRef.current);
            setJuzNotification({ show: true, text });
            juzTimeoutRef.current = setTimeout(() => {
                setJuzNotification(prev => ({ ...prev, show: false }));
                juzTimeoutRef.current = null;
            }, 4000);
        }, 0);
    }, [notificationSettings.juz]);

    const handleSajdahVisible = useCallback((surahName: string, sNum: number, ayahNum: number) => {
        if (sajdahCardInfoRef.current.show) return;

        const displaySurah = (surahName.includes('سورة') || surahName.includes('سُورَة')) 
            ? surahName 
            : `سورة ${surahName}`;

        showMarkerNotification('sajda', `سجدة تلاوة: ${displaySurah} - آية ${toArabic(ayahNum)}`);

        if (showSajdahCard) {
            if (!quranData) return;
            const juz = JUZ_MAP.slice().reverse().find(j => (sNum > j.s) || (sNum === j.s && ayahNum >= j.a))?.j || 1;
            const page = quranData.surahs[sNum - 1]?.ayahs.find((ay:any) => ay.numberInSurah === ayahNum)?.page || 1;

            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            const wasPlaying = isPlayingRef.current || isAudioLoadingRef.current;

            // Defer state updates to prevent "Cannot update a component while rendering" error
            // if this is called during Virtuoso render
            setTimeout(() => {
                if (wasAutoscrolling) {
                    autoScrollPausedRef.current = true;
                    const newState = { ...autoScrollStateRef.current, isPaused: true };
                    autoScrollStateRef.current = newState;
                    setAutoScrollState(newState);
                }
                if (wasPlaying) {
                    stopAudio();
                }

                setSajdahCardInfo({
                    show: true,
                    surah: surahName,
                    ayah: ayahNum,
                    juz,
                    page,
                    wasAutoscrolling,
                    wasPlaying,
                    openedFromMenu: false
                });
            }, 0);
        }
    }, [quranData, showMarkerNotification, stopAudio, showSajdahCard]);

    const toggleFloatingMenu = useCallback(() => {
        setIsFloatingMenuOpen(prev => {
            const willOpen = !prev;
            if (willOpen) {
                // Defer these updates as they cannot be called inside a state updater
                setTimeout(() => {
                    setFloatingMenuInitialView('main');
                    stopAudio();
                }, 0);
            }
            return willOpen;
        });
    }, [stopAudio]);

    const handleCloseSajdahCard = () => {
        const wasFromMenu = sajdahCardInfo.openedFromMenu;
        if (sajdahCardInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            setAutoScrollState(p => ({...p, isPaused: false }));
        }
        setSajdahCardInfo({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false, openedFromMenu: false });
        
        if (wasFromMenu) {
            setFloatingMenuInitialView('sajdah_list');
            setIsFloatingMenuOpen(true);
        }
    };

    const scrollToAyah = useCallback((s: number, a: number, instant: boolean = false, retries: number = 50, isPageJump: boolean = false) => {
        const container = document.getElementById('mushaf-content');
        if (!container) {
            setTimeout(() => {
                isJumpingRef.current = false;
            }, 600);
            return;
        }
        
        const el = document.getElementById(`ayah-${s}-${a}`);
        if (el) {
            const scrollElToTop = (element: HTMLElement) => {
                const pageEl = element.closest('.mushaf-page');
                const targetEl = (isPageJump && pageEl) ? (pageEl as HTMLElement) : element;
                
                // Calculate offsetTop relative to the container to avoid getBoundingClientRect issues with CSS transforms
                let offsetTop = 0;
                let currentEl: HTMLElement | null = targetEl;
                while (currentEl && currentEl !== container) {
                    offsetTop += currentEl.offsetTop;
                    currentEl = currentEl.offsetParent as HTMLElement;
                }
                
                // Center the ayah in the viewport, unless it's a page jump
                if (!isPageJump) {
                    const containerHeight = container.clientHeight;
                    const elHeight = targetEl.clientHeight;
                    offsetTop = Math.max(0, offsetTop - (containerHeight / 2) + (elHeight / 2));
                }
                
                if (instant) {
                    container.scrollTop = offsetTop;
                } else {
                    container.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
            };

            scrollElToTop(el);
            
            if (instant) {
                // Call it a few more times to combat layout shift from images/fonts loading
                let count = 0;
                const interval = setInterval(() => {
                    const currentEl = document.getElementById(`ayah-${s}-${a}`);
                    if (currentEl) {
                        scrollElToTop(currentEl);
                    }
                    count++;
                    if (count > 5) clearInterval(interval);
                }, 100);
            }
            
            // Reset jumping state after a short delay to allow scroll to complete
            setTimeout(() => {
                isJumpingRef.current = false;
            }, 600);
        } else if (retries > 0) {
            setTimeout(() => scrollToAyah(s, a, instant, retries - 1, isPageJump), 50);
        } else {
            // Reset jumping state if we failed to find the element
            isJumpingRef.current = false;
        }
    }, []);

    const manageAudioCache = useCallback((currentS: number, currentA: number) => {
        const keys = Object.keys(audioCacheRef.current);
        if (keys.length <= 20) return;
        for (const key of keys) {
            const [s, a] = key.split(':').map(Number);
            if (Math.abs(currentA - a) > 10 || currentS !== s) {
                delete audioCacheRef.current[key];
            }
        }
    }, []);

    const preloadAudioQueue = useCallback(async (s: number, startAyah: number) => {
        if (!quranData) return;
        const surah = quranData.surahs[s - 1];
        if (!surah) return;

        const reader = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader;

        for (let i = 0; i < 10; i++) {
            const ayahNum = startAyah + i;
            if (ayahNum > surah.ayahs.length) break;
            const cacheKey = `${s}:${ayahNum}`;
            if (!audioCacheRef.current[cacheKey]) {
                const surahStr = String(s).padStart(3, '0');
                const ayahStr = String(ayahNum).padStart(3, '0');
                const audioUrl = `https://everyayah.com/data/${reader}/${surahStr}${ayahStr}.mp3`;
                
                try {
                    if ('caches' in window) {
                        const cache = await caches.open('quran-audio-cache');
                        const cachedResponse = await cache.match(audioUrl);
                        if (!cachedResponse) {
                            const audio = new Audio(audioUrl);
                            audio.preload = 'auto';
                            audioCacheRef.current[cacheKey] = audio;
                        }
                    } else {
                         const audio = new Audio(audioUrl);
                         audio.preload = 'auto';
                         audioCacheRef.current[cacheKey] = audio;
                    }
                } catch (e) { console.warn("Preloading failed", e); }
            }
        }
    }, [settings.reader, quranData, localIsMemorizationMode]);

    const memorizationSettingsRef = useRef(localMemorizationSettings);
    useEffect(() => { memorizationSettingsRef.current = localMemorizationSettings; }, [localMemorizationSettings]);
    const rangeRepeatCountRef = useRef(localMemorizationSettings?.rangeRepeatCount || 0);
    const lastLinkedAyahRef = useRef<{s: number, a: number} | null>(null);

    const playAudio = useCallback(async (s: number, a: number, isLinked = false, targetAyah?: {s: number, a: number}) => {
        stopAudio();
        setIsAudioLoading(true);

        const reader = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader;

        setPlayingAyah({ s, a });
        setCurrentAyah({ s, a });
        setHighlightedAyahId(`ayah-${s}-${a}`);
        scrollToAyah(s, a, false);
        
        // Reset repeat count if it's a new ayah (not a repetition or linked)
        if (!isLinked && !targetAyah) {
            currentRepeatCountRef.current = 0;
        }

        // Handle Linked Repeat if it's the start of a new ayah session
        if (localIsMemorizationMode && memorizationSettingsRef.current?.linkedRepeat && !isLinked && !targetAyah) {
            // Only play linked if we haven't played it for this ayah yet
            if (lastLinkedAyahRef.current?.s !== s || lastLinkedAyahRef.current?.a !== a) {
                // Find previous ayah
                let prevS = s;
                let prevA = a - 1;
                if (prevA < 1) {
                    if (prevS > 1) {
                        prevS -= 1;
                        prevA = quranData.surahs[prevS - 1].ayahs.length;
                    }
                }
                
                if (prevA >= 1) {
                    lastLinkedAyahRef.current = { s, a };
                    // Play previous ayah once, then come back to current ayah
                    playAudio(prevS, prevA, true, { s, a });
                    return;
                }
            }
        }

        // Save session on every ayah change
        if (localIsMemorizationMode) {
            const sessionData = {
                currentAyah: { s, a },
                settings: memorizationSettingsRef.current,
                rangeRepeatCount: rangeRepeatCountRef.current,
                currentRepeatCount: currentRepeatCountRef.current,
                timestamp: Date.now()
            };
            localStorage.setItem('memorization_session_v1', JSON.stringify(sessionData));
        }

        // Pause voice control if it's running
        window.dispatchEvent(new CustomEvent('voice-control-pause'));
    
        const cacheKey = `${s}:${a}`;
        let audio: HTMLAudioElement;
    
        if (audioCacheRef.current[cacheKey]) {
            audio = audioCacheRef.current[cacheKey];
            audio.currentTime = 0;
        } else {
            const surahStr = String(s).padStart(3, '0');
            const ayahStr = String(a).padStart(3, '0');
            const reader = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader;
            const audioUrl = `https://everyayah.com/data/${reader}/${surahStr}${ayahStr}.mp3`;
            let audioSrc = audioUrl;

            try {
                if ('caches' in window) {
                    const cache = await caches.open('quran-audio-cache');
                    const cachedResponse = await cache.match(audioUrl);
                    if (cachedResponse) {
                        const blob = await cachedResponse.blob();
                        audioSrc = URL.createObjectURL(blob);
                    }
                }
            } catch (e) { console.warn("Cache API check failed", e); }
    
            audio = new Audio(audioSrc);
            audio.preload = 'auto';
            audioCacheRef.current[cacheKey] = audio;
        }
    
        currentAudioRef.current = audio;
    
        audio.onplaying = () => { setIsPlaying(true); setIsAudioLoading(false); };
        audio.onpause = () => { 
            setIsPlaying(false);
            // Resume voice control if it was running before
            window.dispatchEvent(new CustomEvent('voice-control-resume'));
        };
        audio.onwaiting = () => setIsAudioLoading(true);
        audio.onended = () => {
            if (!isMountedRef.current) return;
            if (localIsMemorizationMode && memorizationSettingsRef.current) {
                const memSettings = memorizationSettingsRef.current;
                
                // If this was a linked ayah, play the target ayah next
                if (isLinked && targetAyah) {
                    playAudio(targetAyah.s, targetAyah.a, false);
                    return;
                }

                const maxAyahRepeat = memSettings.ayahRepeat || 1;
                const pauseLength = memSettings.pauseLength || 0;
                
                const handleNext = () => {
                    if (currentRepeatCountRef.current < maxAyahRepeat - 1) {
                        currentRepeatCountRef.current += 1;
                        audio.currentTime = 0;
                        audio.play().catch(e => {
                            console.error("Repeat playback failed", e);
                            playNextAyahRef.current();
                        });
                    } else {
                        currentRepeatCountRef.current = 0;
                        // Check if we reached the end of the range
                        if (s === memSettings.toSurah && a === memSettings.toAyah) {
                            const maxRangeRepeat = memSettings.rangeRepeat || 1;
                            if (rangeRepeatCountRef.current < maxRangeRepeat - 1) {
                                rangeRepeatCountRef.current += 1;
                                playAudio(memSettings.fromSurah, memSettings.fromAyah);
                            } else {
                                rangeRepeatCountRef.current = 0;
                                isSessionFinishedRef.current = true;
                                stopAudio();
                                localStorage.removeItem('memorization_session_v1');
                                showToast('انتهت جلسة التحفيظ');
                                if (memSettings.testAfterSession) {
                                    showToast('حان وقت الاختبار!');
                                }
                                // Auto-return to memorization page
                                setTimeout(() => {
                                    if (!isMountedRef.current) return;
                                    if (onBack) handleHomeClick();
                                    else if (onNavigate) onNavigate('memorization');
                                }, 1500);
                            }
                        } else {
                            playNextAyahRef.current();
                        }
                    }
                };

                if (pauseLength > 0) {
                    const pauseMs = audio.duration * 1000 * pauseLength;
                    pauseTimeoutRef.current = window.setTimeout(handleNext, pauseMs);
                } else {
                    handleNext();
                }
            } else {
                const maxRepeat = ayahRepeatCountRef.current;
                
                if (currentRepeatCountRef.current < maxRepeat - 1) {
                    currentRepeatCountRef.current += 1;
                    audio.currentTime = 0;
                    audio.play().catch(e => {
                        console.error("Repeat playback failed", e);
                        playNextAyahRef.current();
                    });
                } else {
                    currentRepeatCountRef.current = 0;
                    playNextAyahRef.current();
                }
            }
        };
        audio.onerror = () => {
            showToast('خطأ في تحميل المقطع الصوتي.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
            window.dispatchEvent(new CustomEvent('voice-control-resume'));
        };

    
        try {
            await audio.play();
            if (!isMountedRef.current) {
                audio.pause();
                return;
            }
            preloadAudioQueue(s, a + 1);
            manageAudioCache(s, a);
        } catch (error) {
            if (!isMountedRef.current) return;
            showToast('فشل تشغيل الصوت.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
            window.dispatchEvent(new CustomEvent('voice-control-resume'));
        }
    }, [settings.reader, settings.ayahRepeatCount, localIsMemorizationMode, stopAudio, preloadAudioQueue, manageAudioCache, showToast, scrollToAyah, onBack, onNavigate]);

    const playNextAyah = useCallback(() => {
        if (!quranData || !playingAyah) return stopAudio();
        const { s, a } = playingAyah;
        const surah = quranData.surahs[s - 1];
        if (!surah) return stopAudio();
    
        let nextS = s;
        let nextA = a + 1;

        if (a < surah.ayahs.length) {
            nextA = a + 1;
        } else if (s < 114) {
            nextS = s + 1;
            nextA = 1;
        } else {
            stopAudio();
            showToast('انتهت السورة');
            return;
        }

        playAudio(nextS, nextA);
    }, [quranData, playingAyah, stopAudio, showToast, localIsMemorizationMode, playAudio]);

    const playNextAyahRef = useRef(playNextAyah);
    useEffect(() => { playNextAyahRef.current = playNextAyah; }, [playNextAyah]);



    const closeModal = useCallback((modalName: string) => {
        setActiveModals(p => p.filter(m => m !== modalName));
        if (modalName === 'search-modal') {
            setInitialSearchQuery(undefined);
        }
        if (wasAutoscrollingBeforeModal.current) {
            const anyOtherOpen = activeModals.some(m => m !== modalName);
            if (!anyOtherOpen) {
                autoScrollPausedRef.current = false;
                setAutoScrollState(p => ({ ...p, isPaused: false }));
                wasAutoscrollingBeforeModal.current = false;
            }
        }
    }, [activeModals]);

    const [modalParams, setModalParams] = useState<any>(null);

    const openModal = useCallback((modalName: string, params?: any) => { 
        stopAudio(); 
        setModalParams(params);
        if (modalName === 'search-modal' && params?.target) {
            setInitialSearchQuery(params.target);
        } else if (modalName === 'search-modal') {
            setInitialSearchQuery(undefined);
        }
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
            setTafseerSelectionInfo(p => ({ ...p, isOpen: true, wasAutoscrolling: wasScrolling }));
        } else if (modalName === 'sajdah-card') {
            setSajdahCardInfo({ 
                show: true, 
                surah: '', 
                ayah: 0, 
                juz: 0, 
                page: 0, 
                wasAutoscrolling: wasScrolling, 
                wasPlaying: false,
                openedFromMenu: isFloatingMenuOpen
            });
        } else {
            setActiveModals(p => [...p.filter(m => m !== modalName), modalName]); 
        }
    }, [stopAudio, isFloatingMenuOpen]);

    useEffect(() => {
        if (navParams?.openModal) {
            const timer = setTimeout(() => {
                openModal(navParams.openModal, navParams);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [navParams, openModal]);
    
    const handleAyahClick = useCallback((s, a) => {
        setTimeout(() => {
            setHighlightedAyahId(`ayah-${s}-${a}`);
            setCurrentAyah({ s, a });
            currentAyahRef.current = { s, a };
            const key = `last_pos${posSuffix}`;
            localStorage.setItem(key, JSON.stringify({ s, a }));
        }, 0);
    }, [posSuffix]);

    const handleAyahTextClick = useCallback((s: number, a: number) => {
        handleAyahClick(s, a);
        setIsFloatingMenuOpen(false);
        
        if (isLandscapeRef.current) {
            setIsLandscapeUIHidden(prev => !prev);
            if (landscapeAutoHideTimerRef.current) {
                clearTimeout(landscapeAutoHideTimerRef.current);
                landscapeAutoHideTimerRef.current = null;
            }
        } else {
            if (isHideToolbarsEnabledRef.current) {
                setIsLandscapeUIHidden(prev => !prev);
            }
        }

        if (autoScrollStateRef.current.isActive) {
            const newPausedState = !autoScrollStateRef.current.isPaused;
            autoScrollPausedRef.current = newPausedState;
            const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
        }
    }, [handleAyahClick]);

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
            }
            
            if (isLandscapeRef.current) {
                setIsLandscapeUIHidden(prev => !prev);
                if (landscapeAutoHideTimerRef.current) {
                    clearTimeout(landscapeAutoHideTimerRef.current);
                    landscapeAutoHideTimerRef.current = null;
                }
                showToast('هذه الصفحات غير متاحة في الوضع الأفقي');
            } else {
                setAyahActionMenu({ isOpen: true, s, a, surahName: surah.name, wasAutoscrolling });
            }
        }
    }, [quranData, handleAyahClick]);

    const handleVerseLongPress = useCallback((s: number, a: number) => {
        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
        if (wasAutoscrolling) {
            autoScrollPausedRef.current = true;
            setAutoScrollState(p => ({ ...p, isPaused: true }));
            // Force update ref immediately to prevent race condition with handleInteractionEnd
            autoScrollStateRef.current = { ...autoScrollStateRef.current, isPaused: true };
        }
        setTafseerSelectionInfo({ isOpen: true, s, a, wasAutoscrolling });
    }, []);

    const handleAyahLongPress = useCallback((s: number, a: number, x: number, y: number) => {
        stopAudio();
        setAyahContextColorField(null); 
        setAyahContextMenu({ 
            isOpen: true, 
            isCustomizing: true, 
            x, y, s, a, 
            tempSettings: { ...settingsRef.current },
            originalSettings: { ...settingsRef.current }
        });
    }, []);

    const handleTafseerSelect = useCallback((tafseerId: string) => {
        if (tafseerSelectionInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            setAutoScrollState(p => ({ ...p, isPaused: false }));
        }
        setTafseerSelectionInfo(prev => ({ ...prev, isOpen: false, wasAutoscrolling: false }));
        
        const newSettings = { ...settings, tafseer: tafseerId };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('settings-change'));
    }, [settings, tafseerSelectionInfo.wasAutoscrolling]);
    
    useEffect(() => {
        const fetchTafseer = async () => {
            if (!tafseerInfo.isOpen) return;
            const currentTafseerId = settings.tafseer || 'ar.jalalayn';
            const cacheKey = `${tafseerInfo.s}_${currentTafseerId}`;
            try {
                if (!tafseerCache.current[cacheKey]) {
                    if (currentTafseerId === 'ar.jalalayn') {
                        const res = await fetch('/assets/data/ar.jalalayn.json');
                        const data = await res.json();
                        if (data.code === 200 && data.data && data.data.surahs) {
                            data.data.surahs.forEach((surah: any) => {
                                tafseerCache.current[`${surah.number}_ar.jalalayn`] = surah.ayahs;
                            });
                        } else {
                            throw new Error('Failed to parse local tafseer data');
                        }
                    } else {
                        const res = await fetch(`https://api.alquran.cloud/v1/surah/${tafseerInfo.s}/${currentTafseerId}`);
                        const data = await res.json();
                        if (data.code === 200) tafseerCache.current[cacheKey] = data.data.ayahs;
                        else throw new Error('Failed to fetch tafseer data');
                    }
                }
                const ayahTafseer = tafseerCache.current[cacheKey]?.[tafseerInfo.a - 1];
                setTafseerInfo(prev => ({ ...prev, text: ayahTafseer?.text || "التفسير غير متوفر لهذه الآية." }));
            } catch (e) {
                setTafseerInfo(prev => ({...prev, text: 'خطأ في تحميل التفسير. يرجى التحقق من اتصالك بالإنترنت.'}));
            } finally { setIsTafseerLoading(false); }
        };
        fetchTafseer();
    }, [tafseerInfo.isOpen, tafseerInfo.s, tafseerInfo.a, settings.tafseer]);

    useEffect(() => {
        const fetchQuranMeanings = async () => {
            if (!quranMeaningsInfo.isOpen) return;
            try {
                setIsQuranMeaningsLoading(true);
                if (!quranMeaningsCache.current) {
                    const res = await fetch('/tafseer.json');
                    const data = await res.json();
                    quranMeaningsCache.current = data;
                }
                
                const meaningObj = quranMeaningsCache.current.find(
                    (item: any) => item.number === String(quranMeaningsInfo.s) && item.aya === String(quranMeaningsInfo.a)
                );
                
                setQuranMeaningsInfo(prev => ({ 
                    ...prev, 
                    text: meaningObj?.text || "معاني الكلمات غير متوفرة لهذه الآية." 
                }));
            } catch (e) {
                setQuranMeaningsInfo(prev => ({
                    ...prev, 
                    text: 'خطأ في تحميل معاني القرآن. يرجى التحقق من اتصالك بالإنترنت.'
                }));
            } finally { 
                setIsQuranMeaningsLoading(false); 
            }
        };
        fetchQuranMeanings();
    }, [quranMeaningsInfo.isOpen, quranMeaningsInfo.s, quranMeaningsInfo.a]);

    useEffect(() => {
        const fetchQuranTranslation = async () => {
            if (!quranTranslationInfo.isOpen) return;
            try {
                setIsQuranTranslationLoading(true);
                if (!quranTranslationCache.current) {
                    const res = await fetch('/en.json');
                    const data = await res.json();
                    quranTranslationCache.current = data;
                }
                
                const translationObj = quranTranslationCache.current[quranTranslationInfo.s - 1]?.verses[quranTranslationInfo.a - 1];
                
                setQuranTranslationInfo(prev => ({ 
                    ...prev, 
                    text: translationObj?.translation || "الترجمة غير متوفرة لهذه الآية." 
                }));
            } catch (e) {
                setQuranTranslationInfo(prev => ({
                    ...prev, 
                    text: 'خطأ في تحميل الترجمة. يرجى التحقق من اتصالك بالإنترنت.'
                }));
            } finally { 
                setIsQuranTranslationLoading(false); 
            }
        };
        fetchQuranTranslation();
    }, [quranTranslationInfo.isOpen, quranTranslationInfo.s, quranTranslationInfo.a]);

    const toggleAudio = useCallback(() => {
        if (isPlaying || isAudioLoading) stopAudio();
        else if (currentAyah) {
            playAudio(currentAyah.s, currentAyah.a);
            const currentReaderId = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader;
            const readerList = localIsMemorizationMode ? MEMORIZATION_READERS : READERS;
            const reciterName = readerList.find(r => r.id === currentReaderId)?.name || 'القارئ';
            setReciterToast({ show: true, name: reciterName });
            setTimeout(() => setReciterToast(prev => ({ ...prev, show: false })), 2000);
        }
        else showToast('الرجاء اختيار آية للبدء');
    }, [isPlaying, isAudioLoading, currentAyah, playAudio, stopAudio, settings.reader, localIsMemorizationMode]);

    const playButtonTimerRef = useRef<number | null>(null);
    const handlePlayButtonPointerDown = () => {
        playButtonTimerRef.current = window.setTimeout(() => {
            playButtonTimerRef.current = null;
            openModal('reciter-modal');
        }, 500);
    };

    const handlePlayButtonPointerUp = () => {
        if (playButtonTimerRef.current) {
            clearTimeout(playButtonTimerRef.current);
            playButtonTimerRef.current = null;
            toggleAudio();
        }
    };

    const handlePlayButtonPointerLeave = () => {
        if (playButtonTimerRef.current) {
            clearTimeout(playButtonTimerRef.current);
            playButtonTimerRef.current = null;
        }
    };

    const handleAutoScrollButtonPointerDown = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        if (e && e.type === 'touchstart') {
            e.preventDefault();
        }
        if (autoScrollButtonTimerRef.current) return;
        autoScrollButtonTimerRef.current = window.setTimeout(() => {
            autoScrollButtonTimerRef.current = null;
            setIsAutoScrollSettingsOpen(true);
        }, 500);
    };

    const handleAutoScrollButtonPointerUp = (e: React.PointerEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (e && e.type === 'touchend') {
            e.preventDefault();
        }
        if (autoScrollButtonTimerRef.current) {
            clearTimeout(autoScrollButtonTimerRef.current);
            autoScrollButtonTimerRef.current = null;
            toggleAutoScroll();
        }
    };

    const handleAutoScrollButtonPointerLeave = () => {
        if (autoScrollButtonTimerRef.current) {
            clearTimeout(autoScrollButtonTimerRef.current);
            autoScrollButtonTimerRef.current = null;
        }
    };

    const handleMushafTypeSelect = () => {
        setQuranData(quranJsonData);
        closeModal('mushaf-selection-modal');
        showToast('تم تفعيل المصحف العثماني');
        window.dispatchEvent(new Event('settings-change'));
    };

    useEffect(() => {
        const handleThemeChange = () => {
            const modeSuffix = themeSuffix;
            const themeId = localStorage.getItem('current_theme_id' + modeSuffix) || 'black';
            const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['black'];
            
            setCurrentTheme(prev => {
                if (prev?.id === newTheme.id) return prev;
                return newTheme;
            });

            const savedSettings = localStorage.getItem('quran_settings' + modeSuffix);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                const newSettings = { ...DEFAULT_SETTINGS, ...parsed };
                setSettings(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(newSettings)) return prev;
                    return newSettings;
                });
            } else {
                setSettings(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(DEFAULT_SETTINGS)) return prev;
                    return DEFAULT_SETTINGS;
                });
            }

            const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + modeSuffix);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    setToolbarColors(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(parsed)) return prev;
                        return parsed;
                    });
                } catch (e) {}
            } else {
                const theme = THEMES['black'];
                const defaultColors = {
                    'top-toolbar': { bg: theme.barBg, border: theme.barBorder },
                    'bottom-toolbar': { bg: theme.barBg, border: theme.barBorder },
                    'surah': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder, font: theme.font },
                    'juz': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder, font: theme.font },
                    'page': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder, font: theme.font },
                    'audio': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
                    'btn-settings': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
                    'btn-home': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
                    'btn-bookmark': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
                    'btn-bookmarks-list': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
                    'btn-themes': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
                    'btn-autoscroll': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
                    'btn-menu': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
                    'btn-share': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }
                };
                setToolbarColors(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(defaultColors)) return prev;
                    return defaultColors;
                });
            }
            
            setQuranData(quranJsonData);

            const transSetting = localStorage.getItem('transparent_mode' + modeSuffix) === 'true';
            if (isTransparentMode !== transSetting) setIsTransparentMode(transSetting);

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + bookmarkSuffix);
            const parsedBookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
            setBookmarks(prev => {
                if (JSON.stringify(prev) === JSON.stringify(parsedBookmarks)) return prev;
                return parsedBookmarks;
            });

            const savedSajdah = localStorage.getItem('show_sajdah_card' + modeSuffix);
            const targetSajdah = savedSajdah !== null ? savedSajdah === 'true' : true;
            if (showSajdahCard !== targetSajdah) setShowSajdahCard(targetSajdah);

            if (modeSuffix.endsWith('_h')) {
                setIsLandscapeUIHidden(true);
            } else {
                if (!isHideToolbarsEnabledRef.current && isLandscapeUIHidden !== false) setIsLandscapeUIHidden(false);
            }
        };
        const handleSettingsChange = () => {
            const mode = themeSuffix;
            const saved = localStorage.getItem('quran_settings' + mode);
            if (saved) {
                const parsed = JSON.parse(saved);
                const newSettings = { ...DEFAULT_SETTINGS, ...parsed };
                setSettings(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(newSettings)) return prev;
                    return newSettings;
                });
            }
            
            const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + mode);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    setToolbarColors(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(parsed)) return prev;
                        return parsed;
                    });
                } catch (e) {}
            }

            const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
            setIsTransparentMode(transSetting);

            const hideToolbarsSetting = localStorage.getItem('hide_toolbars_enabled' + mode) === 'true';
            if (isHideToolbarsEnabledRef.current !== hideToolbarsSetting) {
                setIsHideToolbarsEnabled(hideToolbarsSetting);
                if (!isLandscapeRef.current) {
                    if (hideToolbarsSetting) {
                        setIsLandscapeUIHidden(true);
                    } else {
                        setIsLandscapeUIHidden(false);
                    }
                }
            }

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + bookmarkSuffix);
            const parsedBookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
            setBookmarks(prev => {
                if (JSON.stringify(prev) === JSON.stringify(parsedBookmarks)) return prev;
                return parsedBookmarks;
            });

            const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
            const targetSajdah = savedSajdah !== null ? savedSajdah === 'true' : true;
            if (showSajdahCard !== targetSajdah) setShowSajdahCard(targetSajdah);
        };

        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('settings-change', handleSettingsChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('settings-change', handleSettingsChange);
        };
    }, [themeSuffix, bookmarkSuffix]);

    // Initial load for the current themeSuffix
    useEffect(() => {
        const mode = themeSuffix;
        const themeId = localStorage.getItem('current_theme_id' + mode) || 'black';
        const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['black'];
        
        setCurrentTheme(prev => {
            if (prev?.id === newTheme.id) return prev;
            return newTheme;
        });
        
        const saved = localStorage.getItem('quran_settings' + mode);
        if (saved) {
            const parsed = JSON.parse(saved);
            const newSettings = { ...DEFAULT_SETTINGS, ...parsed };
            setSettings(prev => {
                if (JSON.stringify(prev) === JSON.stringify(newSettings)) return prev;
                return newSettings;
            });
        }
    }, [themeSuffix, getOtherOrientSuffix]);

    const handleMarkWirdCompleted = useCallback((shouldContinue = false) => {
        const saved = localStorage.getItem('dailyWirdSettings_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const activeProfile = parsed.profiles?.find((p: any) => p.id === parsed.activeId);
                if (activeProfile) {
                    const TOTAL_PAGES_COUNT = 604;
                    const getTotalDaysCount = (settings: any) => {
                        return settings.mode === 'days' ? settings.value : Math.ceil(TOTAL_PAGES_COUNT / settings.value);
                    };
                    
                    const newCompleted = [...activeProfile.completedDays, activeProfile.currentDay];
                    const totalDays = getTotalDaysCount(activeProfile);
                    const newCurrentDay = activeProfile.currentDay < totalDays ? activeProfile.currentDay + 1 : activeProfile.currentDay;
                    
                    const newProfile = {
                        ...activeProfile,
                        completedDays: newCompleted,
                        currentDay: newCurrentDay,
                    };
                    
                    const newProfiles = parsed.profiles.map((p: any) => p.id === activeProfile.id ? newProfile : p);
                    localStorage.setItem('dailyWirdSettings_v2', JSON.stringify({ ...parsed, profiles: newProfiles }));
                    
                    if (shouldContinue) {
                        const { end } = getDayRange(newProfile.currentDay, newProfile);
                        setWirdEndPage(end);
                        setHasShownWirdComplete(false);
                        setShowWirdCompleteModal(false);
                        showToast('تم حفظ الورد والاستمرار في القراءة');
                    } else {
                        showToast('تم حفظ الورد اليومي بنجاح');
                        setShowWirdCompleteModal(false);
                    }
                }
            } catch (e) {
                console.error('Error saving wird progress:', e);
            }
        }
    }, [showToast]);

    useLayoutEffect(() => {
        const root = document.documentElement;
        const t = currentTheme;
        
        // Set Theme CSS Variables
        root.style.setProperty('--qr-bg', settings.bgColor || t.bg);
        root.style.setProperty('--qr-text', settings.textColor || t.text);
        root.style.setProperty('--qr-fontFamily', settings.fontFamily || t.font);
        root.style.setProperty('--qr-bar-bg', t.barBg);
        root.style.setProperty('--qr-bar-text', t.barText);
        root.style.setProperty('--qr-bar-border', t.barBorder);
        root.style.setProperty('--qr-btn-bg', t.btnBg);
        root.style.setProperty('--qr-btn-text', t.btnText);
        root.style.setProperty('--qr-accent', t.accent || (t as any).palette?.[0]);
        root.style.setProperty('--qr-accent-text', t.accentText || '#ffffff');
        root.style.setProperty('--qr-modal-bg', t.modalBg);
        root.style.setProperty('--qr-modal-text', t.modalText);
        root.style.setProperty('--qr-header-bg', t.headerBg);
        root.style.setProperty('--qr-header-text', t.headerText);
        root.style.setProperty('--qr-card-bg', t.cardBg);
        root.style.setProperty('--qr-card-text', t.cardText);
        root.style.setProperty('--qr-card-border', t.cardBorder);
        root.style.setProperty('--qr-sajdah', t.sajdah);
        root.style.setProperty('--qr-highlight-text', settings.highlightTextColor || (t as any).highlightText || t.accent || (t as any).palette?.[0]);

        root.style.setProperty('--color-sajdah', t.sajdah);
        root.style.setProperty('--search-result-bg', t.cardBg);
        root.style.setProperty('--search-result-border', t.accent || (t as any).palette?.[0]);
        root.style.setProperty('--search-result-text', t.cardText);
        
        const darkBgs = [
            '#000000', '#2c241b', '#101010', '#0f172a', '#2e1065', '#064e3b', '#1e293b', '#4c1d95', 
            '#1e1b4b', '#451a03', '#022c22', '#450a0a', '#1e3a8a', '#422006', '#78350f', '#4c1d95',
            '#280a1e', '#041e3a', '#1c1917', '#0f172a', '#09090b', '#064e3b', '#134e4a', '#334155',
            '#0a0a0a', '#111111'
        ];
        // Ensure isDark is true if either background is in the list OR the text color is explicitly white
        const textColor = (settings.textColor || t.text || '').toLowerCase();
        const bgColor = (settings.bgColor || t.bg || '').toLowerCase();
        const isDark = darkBgs.includes(bgColor) || textColor === '#ffffff';
        
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        
        // Signal that quran context variables have been set to avoid other contexts overwriting them
        window.dispatchEvent(new CustomEvent('quran-vars-applied', { detail: { themeId: t.id } }));
    }, [currentTheme, themeKey, settings.highlightTextColor, settings.textColor, settings.bgColor, settings.fontFamily, activeModals]);

    const isBookmarksModalOpen = activeModals.includes('bookmarks-modal');
    useEffect(() => {
        if (isBookmarksModalOpen) {
            setBookmarks(JSON.parse(localStorage.getItem('quran_bookmarks_list' + bookmarkSuffix) || '[]'));
        }
    }, [isBookmarksModalOpen, bookmarkSuffix]);

    useEffect(() => {
        const contentEl = mushafContentRef.current;
        if (!contentEl) return;
    
        const handleScroll = () => {
            if (isJumpingRef.current) return;

            const { scrollTop, scrollHeight, clientHeight } = contentEl;

            if (readingMode === 'mushaf') {
                if (scrollTop < 500) {
                    setVisiblePages(prev => {
                        if (prev.length === 0) return prev;
                        const firstPage = Math.min(...prev);
                        if (firstPage > 1) {
                            const newPage = firstPage - 1;
                            if (!prev.includes(newPage)) {
                                return [newPage, ...prev].sort((a, b) => a - b);
                            }
                        }
                        return prev;
                    });
                }
                if (scrollHeight - scrollTop <= clientHeight + 800) {
                    setVisiblePages(prev => {
                        if (prev.length === 0) return prev;
                        const lastPage = Math.max(...prev);
                        if (lastPage < 604) {
                            const newPage = lastPage + 1;
                            if (!prev.includes(newPage)) {
                                return [...prev, newPage].sort((a, b) => a - b);
                            }
                        }
                        return prev;
                    });
                }
            }
    
            const now = Date.now();
            if (now - lastScrollUpdateTime.current < 50) return; // More frequent updates
            lastScrollUpdateTime.current = now;
    
            const x = window.innerWidth / 2;
            const y = window.innerHeight / 2;
            
            const el = document.elementFromPoint(x, y);
            if (!el) return;
            
            const ayahBlock = el.closest('.ayah-text-block, .ayah-item');
            if (ayahBlock && ayahBlock.id) {
                const parts = ayahBlock.id.split('-');
                if (parts.length === 3) {
                    const s = parseInt(parts[1], 10);
                    const a = parseInt(parts[2], 10);
    
                    if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                        const prevAyah = currentAyahRef.current;
                        
                        // Prevent backward jumping of active Ayah/Page due to sub-pixel hit-testing during auto-scroll
                        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                            if (s < prevAyah.s || (s === prevAyah.s && a < prevAyah.a)) {
                                return;
                            }
                        }
                        
                        setCurrentAyah({ s, a });
                        localStorage.setItem(`last_pos${posSuffix}`, JSON.stringify({ s, a })); 
                        localStorage.setItem("last_read_ayah_global", JSON.stringify({ s, a, ts: Date.now() }));
                        window.dispatchEvent(new Event('last_read_update'));

                        // Detect Surah change
                        /* 
                        if (s !== prevAyah.s) {
                            const surahName = SURAH_NAMES_AR[s - 1];
                            showMarkerNotification('surah', `بداية سورة ${surahName}`);
                        }
                        */

                        const juzAttr = (ayahBlock as HTMLElement).dataset.juz;
                        const quarterAttr = (ayahBlock as HTMLElement).dataset.hizbQuarter;
                        
                        // Detect Juz change
                        if (juzAttr) {
                            const newJuz = parseInt(juzAttr, 10);
                            if (lastNotifiedJuz.current !== null && newJuz !== lastNotifiedJuz.current) {
                                if (notificationSettings.juz !== false) {
                                    if (juzTimeoutRef.current) clearTimeout(juzTimeoutRef.current);
                                    setJuzNotification({ show: true, text: `بداية الجزء ${toArabic(newJuz)}` });
                                    juzTimeoutRef.current = setTimeout(() => {
                                        setJuzNotification(prev => ({ ...prev, show: false }));
                                        juzTimeoutRef.current = null;
                                    }, 4000);
                                }
                            }
                            lastNotifiedJuz.current = newJuz;
                        }

                        // Detect Quarter change
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
    }, [visiblePages, autoScrollState.isActive, handleSajdahVisible, posSuffix, readingMode]);

    const pagesMap = useMemo(() => {
        if (!quranData) return new Map<number, any[]>();
        const map = new Map<number, any[]>();
        quranData.surahs.forEach((surah: any) => {
            surah.ayahs.forEach((ayah: any) => {
                const p = Number(ayah.page);
                if (!map.has(p)) map.set(p, []);
                map.get(p)!.push({ ...ayah, sNum: surah.number, sName: surah.name });
            });
        });
        return map;
    }, [quranData]);

    const getPageData = useCallback((pageNum: number) => {
        return pagesMap.get(Number(pageNum)) || [];
    }, [pagesMap]);

    const jumpToAyah = useCallback((s: number, a: number, instant: boolean = false, isPageJump: boolean = false) => {
        if (isJumpingRef.current && !instant) return;
        setLastInteractionType(isPageJump ? 'page' : 'ayah');
        stopAudio();
        if (!quranData) return;
        const surah = quranData.surahs.find((su:any) => su.number === s);
        const ayah = surah?.ayahs.find((ay:any) => ay.numberInSurah === a);
        if (!ayah) return;
        
        isJumpingRef.current = true;
        lastNotifiedJuz.current = null;
        lastNotifiedQuarter.current = null;
        
        const p = Number(ayah.page);
        const targetPage = p;
        
        flushSync(() => {
            setVisiblePages([...new Set([targetPage, targetPage + 1, targetPage + 2, targetPage - 1, targetPage - 2])].filter(n => n > 0 && n <= 604).sort((a: number, b: number) => a - b));
            handleAyahClick(s, a);
            if (!isPageInputActiveRef.current) {
                setActiveModals([]);
            }
        });

        scrollToAyah(s, a, instant, 50, isPageJump);
        if (isHideToolbarsEnabledRef.current || isLandscapeRef.current) {
            setIsLandscapeUIHidden(true);
        }
    }, [quranData, handleAyahClick, stopAudio, scrollToAyah]);

    const jumpToPage = useCallback((pageNum: number, instant: boolean = true) => {
        if (!quranData || isNaN(pageNum) || pageNum < 1 || pageNum > 604) return;
        setLastInteractionType('page');
        
        const targetPageNum = pageNum;
        
        const pageData = getPageData(targetPageNum);
        if (pageData && pageData.length > 0) {
            // Sort by surah number then ayah number to get the absolute first ayah of the page
            const sortedAyahs = [...pageData].sort((a: any, b: any) => {
                if (a.sNum !== b.sNum) return a.sNum - b.sNum;
                return a.numberInSurah - b.numberInSurah;
            });
            const firstAyah = sortedAyahs[0];
            jumpToAyah(firstAyah.sNum, firstAyah.numberInSurah, instant, true);
        } else {
            showToast(`لا توجد بيانات لصفحة ${toArabic(targetPageNum)}`);
        }
    }, [quranData, jumpToAyah, getPageData, showToast]);

    useEffect(() => {
        if (initialSurah && initialAyah) {
            setTimeout(() => {
                if (isMountedRef.current) {
                    jumpToAyah(initialSurah, initialAyah, true);
                }
            }, 300); // Increased timeout for better reliability
            hasJumpedRef.current = true;
            return;
        }

        if (hasJumpedRef.current) return;
        hasJumpedRef.current = true;
        
        if (localIsMemorizationMode && localMemorizationSettings) {
            setTimeout(() => {
                const startS = localMemorizationSettings.fromSurah;
                const startA = localMemorizationSettings.fromAyah;
                jumpToAyah(startS, startA, true);
                setTimeout(() => {
                    if (isMountedRef.current) {
                        if (!localMemorizationSettings.isReviewMode) {
                            playAudio(startS, startA);
                        }
                    }
                }, 500);
            }, 0);
        } else if (initialPage) {
            setTimeout(() => {
                jumpToPage(initialPage, true);
            }, 0);
        } else {
            const key = posSuffix;
            const lastPos = JSON.parse(localStorage.getItem(`last_pos${key}`) || '{}');
            setTimeout(() => {
                jumpToAyah(lastPos.s || 1, lastPos.a || 1, true);
            }, 0);
        }
    }, [jumpToAyah, jumpToPage, posSuffix, initialSurah, initialAyah, initialPage, localIsMemorizationMode, localMemorizationSettings, playAudio]);

    const handleVoiceCommand = useCallback((text: string) => {
        console.log('QuranReader - Voice Command:', text);
        
        // Use the new parser for Quran navigation and custom commands
        const saved = localStorage.getItem('voice_commands_v2');
        const customCommands = saved ? JSON.parse(saved) : [];
        const parsed = parseVoiceCommand(text, SURAH_NAMES_AR, customCommands);
        
        if (parsed) {
            console.log('QuranReader - Parsed Command:', parsed.action, parsed.params);
            const { action, params } = parsed;
            
            if (action === 'go_to_page' && params?.page) {
                jumpToPage(params.page, true);
                return;
            } else if (action === 'go_to_juz' && params?.juz) {
                const juzInfo = JUZ_MAP.find(j => j.j === params.juz);
                if (juzInfo) jumpToAyah(juzInfo.s, juzInfo.a, true);
                return;
            } else if (action === 'go_to_surah' && params?.surah) {
                jumpToAyah(params.surah, 1, true);
                return;
            } else if (action === 'go_to_ayah' && params?.surah && params?.ayah) {
                jumpToAyah(params.surah, params.ayah, true);
                return;
            } else if (action === 'next_page') {
                jumpToPage(Math.min(604, Math.min(...visiblePages) + 1));
                return;
            } else if (action === 'prev_page') {
                jumpToPage(Math.max(1, Math.min(...visiblePages) - 1));
                return;
            } else if (action === 'play_audio') {
                handlePlayButtonPointerDown();
                handlePlayButtonPointerUp();
                return;
            } else if (action === 'open_settings') {
                openModal('settings-modal');
                return;
            } else if (action === 'open_themes') {
                openModal('themes-modal');
                return;
            } else if (action === 'go_home') {
                handleHomeClick();
                return;
            } else if (action === 'go_athkar') {
                onNavigate('athkar');
                return;
            } else if (action === 'go_prayer') {
                onNavigate('prayer-times');
                return;
            } else if (action === 'go_qibla') {
                onNavigate('qibla');
                return;
            } else if (action === 'go_tasbeeh') {
                onNavigate('tasbeeh');
                return;
            } else if (action === 'go_tajweed') {
                onNavigate('tajweed-education');
                return;
            } else if (action === 'show_tafsir') {
                if (isLandscapeRef.current) {
                    showToast('صفحات التفاسير غير متاحة في الوضع الأفقي');
                    return;
                }
                if (currentAyahRef.current) {
                    const { s, a } = currentAyahRef.current;
                    const surah = quranData?.surahs.find((su: any) => su.number === s);
                    if (surah) {
                        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
                        if (wasAutoscrolling) {
                            autoScrollPausedRef.current = true;
                            const newState = { ...autoScrollStateRef.current, isPaused: true };
                            autoScrollStateRef.current = newState;
                            setAutoScrollState(newState);
                            if (isLandscapeRef.current) {
                                setIsLandscapeUIHidden(false);
                            }
                        }
                        setIsTafseerLoading(true);
                        setTafseerInfo({ isOpen: true, s, a, text: '', surahName: surah.name, wasAutoscrolling });
                    }
                }
                return;
            } else if (action === 'toggle_auto_scroll') {
                toggleAutoScroll();
                return;
            } else if (action === 'open_bookmarks') {
                openModal('bookmarks-modal');
                return;
            } else if (action === 'save_bookmark') {
                saveBookmark();
                return;
            }
        }

        // Fallback for other commands not in parser
        const normalized = normalizeArabic(text);
        
        if (normalized.includes('تكبير') || normalized.includes('خط كبير')) {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'increase_font' } }));
        } else if (normalized.includes('تصغير') || normalized.includes('خط صغير')) {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'decrease_font' } }));
        } else if (normalized.includes('شغل') || normalized.includes('وقف') || normalized.includes('صوت') || normalized.includes('استماع')) {
            handlePlayButtonPointerDown();
            handlePlayButtonPointerUp();
        }
    }, [onNavigate, onBack, openModal, jumpToAyah, jumpToPage, visiblePages, handlePlayButtonPointerDown, handlePlayButtonPointerUp]);

    // Handle global voice commands
    useEffect(() => {
        const handleGlobalVoiceCommand = (e: any) => {
            const { action, text, params } = e.detail;
            
            // Prevent background navigation if download modals are open
            const isDownloadModalOpen = activeModals.includes('quran-download-modal') || activeModals.includes('tafsir-download-modal');
            if (isDownloadModalOpen && ['quran_navigation', 'go_to_page', 'go_to_juz', 'go_to_surah', 'go_to_ayah', 'next_page', 'prev_page'].includes(action)) {
                return; // Let the modal handle it
            }

            if (action === 'quran_navigation' && text) {
                handleVoiceCommand(text);
            } else if (action === 'go_to_page' && params?.page) {
                jumpToPage(params.page, true);
            } else if (action === 'go_to_juz' && params?.juz) {
                const juzInfo = JUZ_MAP.find(j => j.j === params.juz);
                if (juzInfo) jumpToAyah(juzInfo.s, juzInfo.a, true);
            } else if (action === 'go_to_surah' && params?.surah) {
                jumpToAyah(params.surah, 1, true);
            } else if (action === 'go_to_ayah' && params?.surah && params?.ayah) {
                jumpToAyah(params.surah, params.ayah, true);
            } else if (action === 'next_page') {
                jumpToPage(Math.min(604, Math.min(...visiblePages) + 1));
            } else if (action === 'prev_page') {
                jumpToPage(Math.max(1, Math.min(...visiblePages) - 1));
            } else if (action === 'play_audio' || action === 'stop_audio') {
                handlePlayButtonPointerDown();
                handlePlayButtonPointerUp();
            } else if (action === 'set_orientation_horizontal') {
                ScreenOrientation.lock({ orientation: 'landscape' });
            } else if (action === 'set_orientation_vertical') {
                ScreenOrientation.lock({ orientation: 'portrait' });
            } else if (action === 'contextual_number' && params?.value) {
                const num = params.value;
                // If last interaction was ayah and number is reasonable for an ayah
                if (lastInteractionType === 'ayah' && num <= 286) {
                    jumpToAyah(currentAyah.s, num, true);
                } else if (num <= 604) {
                    jumpToPage(num, true);
                }
            } else if (action === 'open_search') {
                openModal('search-modal', params);
            } else if (action === 'open_settings' || action === 'change_theme') {
                openModal('settings-modal');
            } else if (action === 'download_quran') {
                openModal('quran-download-modal');
            } else if (action === 'download_tafsir') {
                openModal('tafsir-download-modal');
            } else if (action === 'show_tafsir') {
                if (isLandscapeRef.current) {
                    showToast('صفحات التفاسير غير متاحة في الوضع الأفقي');
                    return;
                }
                if (currentAyahRef.current) {
                    const { s, a } = currentAyahRef.current;
                    const surah = quranData?.surahs.find((su: any) => su.number === s);
                    if (surah) {
                        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
                        if (wasAutoscrolling) {
                            autoScrollPausedRef.current = true;
                            const newState = { ...autoScrollStateRef.current, isPaused: true };
                            autoScrollStateRef.current = newState;
                            setAutoScrollState(newState);
                            if (isLandscapeRef.current) {
                                setIsLandscapeUIHidden(false);
                            }
                        }
                        setIsTafseerLoading(true);
                        setTafseerInfo({ isOpen: true, s, a, text: '', surahName: surah.name, wasAutoscrolling });
                    }
                }
            } else if (action === 'open_bookmarks') {
                openModal('bookmarks-modal');
            } else if (action === 'toggle_auto_scroll') {
                toggleAutoScroll();
            } else if (action === 'pause_auto_scroll') {
                if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                    autoScrollPausedRef.current = true;
                    const newState = { ...autoScrollStateRef.current, isPaused: true };
                    autoScrollStateRef.current = newState;
                    setAutoScrollState(newState);
                }
            } else if (action === 'stop_auto_scroll') {
                if (autoScrollStateRef.current.isActive) {
                    stopAutoScroll(false);
                }
            } else if (action === 'close_modal') {
                setActiveModals([]);
                if (wasAutoscrollingBeforeModal.current) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState(p => ({ ...p, isPaused: false }));
                    wasAutoscrollingBeforeModal.current = false;
                }
                setTafseerInfo(p => ({ ...p, isOpen: false }));
                setTafseerSelectionInfo(p => ({ ...p, isOpen: false }));
                if (sajdahCardInfo.show) handleCloseSajdahCard();
                setIsFloatingMenuOpen(false);
                setIsPageInputActive(false);
                setAyahContextMenu(p => ({ ...p, isOpen: false }));
            } else if (action === 'save_bookmark') {
                saveBookmark();
            } else if (action === 'increase_font') {
                setSettings(prev => {
                    const newSize = Number((Math.min(4.5, prev.fontSize + 0.1)).toFixed(2));
                    const newSettings = { ...prev, fontSize: newSize };
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                    return newSettings;
                });
            } else if (action === 'decrease_font') {
                setSettings(prev => {
                    const newSize = Number((Math.max(0.5, prev.fontSize - 0.1)).toFixed(2));
                    const newSettings = { ...prev, fontSize: newSize };
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                    return newSettings;
                });
            } else if (action === 'set_font_size' && params?.size) {
                setSettings(prev => {
                    const newSize = Math.max(0.5, Math.min(4.5, params.size));
                    const newSettings = { ...prev, fontSize: newSize };
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                    return newSettings;
                });
            } else if (action === 'set_theme' && params?.theme) {
                updateSetting('theme', params.theme);
            }
        };

        window.addEventListener('voice-command', handleGlobalVoiceCommand);
        return () => window.removeEventListener('voice-command', handleGlobalVoiceCommand);
    }, [visiblePages, jumpToPage, handlePlayButtonPointerDown, handlePlayButtonPointerUp, openModal, handleVoiceCommand, activeModals]);

    const saveBookmark = () => { 
        const current = currentAyahRef.current;
        if (!current) { showToast('اختر آية أولاً'); return; } 
        const stored = JSON.parse(localStorage.getItem('quran_bookmarks_list' + bookmarkSuffix) || '[]'); 
        const date = new Date(); 
        const newBookmark = { 
            id: Date.now(), 
            s: current.s, 
            a: current.a, 
            date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }), 
            time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
        }; 
        const newBookmarks = [newBookmark, ...stored]; 
        localStorage.setItem('quran_bookmarks_list' + bookmarkSuffix, JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
        showToast(`تم حفظ الإشارة المرجعية`); 
    };
    const deleteBookmark = (id:number) => { 
        const newBookmarks = bookmarks.filter((b:any) => b.id !== id); 
        localStorage.setItem('quran_bookmarks_list' + bookmarkSuffix, JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
    };

    const bookmarkButtonTimerRef = useRef<number | null>(null);
    const handleBookmarkButtonPointerDown = (e: React.PointerEvent | React.TouchEvent) => {
        if (e && e.type === 'touchstart') {
            // Prevent pointer events if touch is handled
            e.preventDefault();
        }
        if (bookmarkButtonTimerRef.current) return;
        bookmarkButtonTimerRef.current = window.setTimeout(() => {
            bookmarkButtonTimerRef.current = null;
            openModal('bookmarks-modal');
        }, 500);
    };

    const handleBookmarkButtonPointerUp = (e: React.PointerEvent | React.TouchEvent) => {
        if (e && e.type === 'touchend') {
            e.preventDefault();
        }
        if (bookmarkButtonTimerRef.current) {
            clearTimeout(bookmarkButtonTimerRef.current);
            bookmarkButtonTimerRef.current = null;
            saveBookmark();
        }
    };

    const handleBookmarkButtonPointerLeave = () => {
        if (bookmarkButtonTimerRef.current) {
            clearTimeout(bookmarkButtonTimerRef.current);
            bookmarkButtonTimerRef.current = null;
        }
    };

    const PAGES_PER_JUZ = 20;
    const PAGE_HEIGHT_FALLBACK = 1300;

    const initialPinchDistanceRef = useRef<number | null>(null);
    const initialPinchFontSizeRef = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            initialPinchDistanceRef.current = distance;
            initialPinchFontSizeRef.current = settings.fontSize;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDistanceRef.current !== null && initialPinchFontSizeRef.current !== null) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            
            const scaleFactor = distance / initialPinchDistanceRef.current;
            const newFontSize = Math.min(Math.max(initialPinchFontSizeRef.current * scaleFactor, 1.0), 5.0);
            
            setSettings(prev => ({ ...prev, fontSize: newFontSize }));
        }
    };

    const handleTouchEnd = () => {
        if (initialPinchDistanceRef.current !== null) {
             localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(settingsRef.current));
             window.dispatchEvent(new Event('settings-change'));
        }
        initialPinchDistanceRef.current = null;
        initialPinchFontSizeRef.current = null;
    };

    const updateHeadersDuringAutoScroll = () => {
        const content = mushafContentRef.current;
        if (!content) return;
        
        // Use the center of the screen
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;
        const el = document.elementFromPoint(x, y); 
        if (!el) return;
        const ayahBlock = el.closest('.ayah-text-block');
        if (ayahBlock && ayahBlock.id) {
            const parts = ayahBlock.id.split('-'); 
            if (parts.length === 3) {
                const s = parseInt(parts[1]); const a = parseInt(parts[2]);
                if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                    // If there is a highlighted ayah, we only update currentAyah if it's NOT visible
                    // This prevents jumping selection on start and keeps the focus on the selected ayah.
                    const highlightedId = highlightedAyahIdRef.current;
                    if (highlightedId) {
                        const hEl = document.getElementById(highlightedId);
                        if (hEl) {
                            const rect = hEl.getBoundingClientRect();
                            const contentRect = content.getBoundingClientRect();
                            // If highlighted ayah is visible in the content area, don't update header
                            if (rect.top < contentRect.bottom && rect.bottom > contentRect.top) {
                                return;
                            }
                        }
                    }

                    // Prevent automatic selection in non-mushaf modes
                    setCurrentAyah({ s, a });
                    currentAyahRef.current = { s, a };
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

    const stopAutoScroll = (showTimer = true) => {
        if (autoScrollFrameRef.current) cancelAnimationFrame(autoScrollFrameRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        autoScrollFrameRef.current = null;
        timerIntervalRef.current = null;
        autoScrollPausedRef.current = false;

        const newState = { isActive: false, isPaused: false, elapsedTime: autoScrollStateRef.current.elapsedTime };
        autoScrollStateRef.current = newState;
        setAutoScrollState(newState);
        
        if (showTimer) setTimeout(() => setAutoScrollState(p => ({...p, elapsedTime: 0})), 3000);
        else setAutoScrollState(p => ({...p, elapsedTime: 0}));
    };
    
    const startAutoScroll = () => {
        if (!mushafContentRef.current) return;
        
        // Close any open menus/settings first to ensure bars can hide
        setIsAutoScrollSettingsOpen(false);
        setIsFloatingMenuOpen(false);

        // Clear any existing auto-scroll without triggering a full stop state update
        if (autoScrollFrameRef.current) cancelAnimationFrame(autoScrollFrameRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        autoScrollFrameRef.current = null;
        timerIntervalRef.current = null;
        autoScrollPausedRef.current = false;
        
        // Update state immediately
        const initialState = { isActive: true, isPaused: false, elapsedTime: 0 };
        autoScrollStateRef.current = initialState;
        setAutoScrollState(initialState);

        if (isHideToolbarsEnabledRef.current || isLandscapeRef.current) {
            setIsLandscapeUIHidden(true);
        }
        
        // Delay to let layout stabilize
        setTimeout(() => {
            if (!mushafContentRef.current) return;
            
            scrollAccumulatorRef.current = 0;
            autoScrollPausedRef.current = false;
            lastScrollTimeRef.current = performance.now();
            
            let cachedPageHeight = PAGE_HEIGHT_FALLBACK;
            let lastHeightCalcTime = 0;

            const scrollStep = (timestamp: number) => {
                if (!lastScrollTimeRef.current) lastScrollTimeRef.current = timestamp;
                const deltaTime = timestamp - lastScrollTimeRef.current;
                lastScrollTimeRef.current = timestamp;

                if (!autoScrollPausedRef.current && mushafContentRef.current) {
                    const content = mushafContentRef.current;
                    
                    // Recalculate page height every 3 seconds or if it's the first time
                    if (timestamp - lastHeightCalcTime > 3000 || lastHeightCalcTime === 0) {
                        const pages = content.querySelectorAll('.mushaf-page');
                        let totalHeight = 0; let count = 0;
                        pages.forEach((page: any) => { const h = page.offsetHeight; if (h) { totalHeight += h; count++; } });
                        cachedPageHeight = count ? (totalHeight / count) : (content.clientHeight || PAGE_HEIGHT_FALLBACK);
                        lastHeightCalcTime = timestamp;
                    }
                    
                    const minutesPerJuz = parseInt(String(settingsRef.current.scrollMinutes), 10) || 20;
                    const totalPixels = cachedPageHeight * PAGES_PER_JUZ;
                    const totalTimeMs = minutesPerJuz * 60 * 1000;
                    
                    if (totalPixels > 0 && totalTimeMs > 0) {
                        const pixelsPerMs = totalPixels / totalTimeMs;
                        scrollAccumulatorRef.current += pixelsPerMs * deltaTime;
                        
                        if (scrollAccumulatorRef.current >= 1) {
                            const pixelsToMove = Math.floor(scrollAccumulatorRef.current);
                            content.scrollTop += pixelsToMove;
                            scrollAccumulatorRef.current -= pixelsToMove;
                            updateHeadersDuringAutoScroll();
                        }
                    }
                }
                autoScrollFrameRef.current = requestAnimationFrame(scrollStep);
            };

            autoScrollFrameRef.current = requestAnimationFrame(scrollStep);

            timerIntervalRef.current = window.setInterval(() => {
                 if (!autoScrollPausedRef.current) {
                     setAutoScrollState(prev => ({ ...prev, elapsedTime: prev.elapsedTime + 1 }));
                 }
            }, 1000);
        }, 100); // Reduced delay to 100ms for faster start
    };

    const toggleAutoScroll = () => {
        if (autoScrollStateRef.current.isActive) stopAutoScroll();
        else { startAutoScroll(); showToast('تم تفعيل التمرير التلقائي'); }
    };
    const handleScreenTap = () => {
      setIsFloatingMenuOpen(false);
      
      if (isLandscapeRef.current) {
          if (!isLandscapeUIHidden) {
              setIsLandscapeUIHidden(true);
          }
      } else {
          if (isHideToolbarsEnabledRef.current) {
              setIsLandscapeUIHidden(prev => !prev);
          }
      }

      if (autoScrollStateRef.current.isActive) {
        const newPausedState = !autoScrollStateRef.current.isPaused;
        autoScrollPausedRef.current = newPausedState;
        const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
        autoScrollStateRef.current = newState;
        setAutoScrollState(newState);
      }
    };

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
        setPageInput(value);
    };

    const handlePageInputBlur = () => {
        if (pageInput) {
            const pageNum = parseInt(pageInput, 10);
            if (pageNum >= 1 && pageNum <= 604) {
                jumpToPage(pageNum, true);
            }
        }
        setIsPageInputActive(false);
        setPageInput(''); 
    };

    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePageInputBlur();
        }
    };

    const handlePageButtonClick = () => {
        if (autoScrollState.isActive && !autoScrollState.isPaused) {
            autoScrollPausedRef.current = true;
            setAutoScrollState(p => ({ ...p, isPaused: true }));
        }
        setIsPageInputActive(true);
        setPageInput('');
        setTimeout(() => pageInputRef.current?.focus(), 100);
    };

    const getToolbarStyle = (type: string, defaultBg: string, defaultText: string, defaultBorder: string) => {
        const isBlackTheme = currentTheme?.bg === '#000000' && currentTheme?.id !== 'deep_black';
        if (isBlackTheme && type === 'btn-home') {
            return {
                backgroundColor: '#000000',
                color: '#FFFFFF',
                border: '1px solid #FFFFFF',
                fontFamily: toolbarColors[type]?.font || 'inherit',
                opacity: 1,
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none'
            };
        }

        const config = toolbarColors[type];
        let bg = config?.bg || defaultBg || "#ffffff";
        let border = config?.border || defaultBorder || "#e5e7eb";

        // Final safety check: if bg is rgba or transparent, use a solid fallback
        if (!bg || bg.includes('rgba') || bg === 'transparent') {
            bg = currentTheme.barBg || "#ffffff";
        }
        if (!border || border.includes('rgba') || border === 'transparent') {
            border = currentTheme.barBorder?.split(' ')[2] || "#e5e7eb";
        }

        // Apply transparency if enabled (only for main bars)
        let finalBg = bg;
        let backdrop = 'none';
        let finalShadow: string | undefined = undefined;
        if (isTransparentMode && (type === 'top-toolbar' || type === 'bottom-toolbar')) {
            finalBg = 'transparent';
            border = 'transparent';
            finalShadow = 'none';
        }

        const isMainBar = type === 'top-toolbar' || type === 'bottom-toolbar';
        const borderStyle = `1px solid ${border}`;

        return { 
            backgroundColor: finalBg, 
            color: config?.text || defaultText, 
            borderTop: type === 'top-toolbar' ? '0px none' : borderStyle,
            borderBottom: type === 'bottom-toolbar' ? '0px none' : borderStyle,
            borderLeft: isMainBar ? '0px none' : borderStyle,
            borderRight: isMainBar ? '0px none' : borderStyle,
            fontFamily: config?.font || 'inherit',
            opacity: 1,
            backdropFilter: backdrop,
            WebkitBackdropFilter: backdrop,
            ...(finalShadow && { boxShadow: finalShadow })
        };
    };

    const handleToastClose = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, []);

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
                    setAutoScrollState(p => ({ ...p, isPaused: false }));
                }
                setTafseerInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (tafseerSelectionInfo.isOpen) {
                if (tafseerSelectionInfo.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState(p => ({ ...p, isPaused: false }));
                }
                setTafseerSelectionInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
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
                setPageInput('');
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [activeModals, tafseerInfo, tafseerSelectionInfo, sajdahCardInfo, isFloatingMenuOpen, isPageInputActive, closeModal, handleCloseSajdahCard]);

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
    }, [isFloatingMenuOpen]);

    if (isLoading) { return <div id="loader" className="fixed inset-0 bg-[#1f2937] text-white z-[9999] flex flex-col items-center justify-center"><div className="text-2xl font-bold mb-4">جاري تحميل المصحف...</div><div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden"><div id="progress-bar" className="h-full bg-green-500 transition-all duration-300" style={{width: `${loadingProgress}%`}}></div></div><div id="loader-status" className="mt-2 text-sm text-gray-400">{loadingStatus}</div></div> }
    
    const surahName = SURAH_NAMES_AR[currentAyah.s - 1] || '';
    const juz = JUZ_MAP.slice().reverse().find(j => (currentAyah.s > j.s) || (currentAyah.s === j.s && currentAyah.a >= j.a))?.j || 1;
    const currentPageNumber = quranData?.surahs[currentAyah.s - 1]?.ayahs.find((ay:any) => ay.numberInSurah === currentAyah.a)?.page || 1;
    const tafseerName = TAFSEERS.find(t => t.id === settings.tafseer)?.name || 'التفسير';

    const renderPlayButtonIcon = () => {
        const iconColor = currentTheme.barText || '#000000';
        if (isAudioLoading) return <i className="fa-solid fa-spinner fa-spin text-xl" style={{ color: iconColor }}></i>;
        if (isPlaying) return <i className="fa-solid fa-circle-pause text-2xl" style={{ color: '#ef4444' }}></i>;
        return <i className="fa-solid fa-circle-play text-2xl" style={{ color: iconColor }}></i>;
    };

    const handleInteractionStart = useCallback(() => {
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
        }
    }, []);

    const handleInteractionEnd = useCallback(() => {
        setTimeout(() => {
             const isAnyModalOpen = activeModals.length > 0 || tafseerInfo.isOpen || tafseerSelectionInfo.isOpen;
             if (!isAnyModalOpen && autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                 autoScrollPausedRef.current = false;
             }
        }, 100);
    }, [activeModals, tafseerInfo.isOpen, tafseerSelectionInfo.isOpen]);

    const handleVerticalAyahClick = useCallback((s: number, a: number) => {
        setCurrentAyah({ s, a });
        setHighlightedAyahId(`ayah-${s}-${a}`);
        localStorage.setItem(`last_pos${posSuffix}`, JSON.stringify({ s, a })); 
        localStorage.setItem("last_read_ayah_global", JSON.stringify({ s, a, ts: Date.now() }));
        window.dispatchEvent(new Event('last_read_update'));
    }, [posSuffix]);

    const sortedVisiblePages = useMemo(() => {
        return [...new Set(visiblePages)].sort((a: number, b: number) => a - b);
    }, [visiblePages]);

    return (
        <div className={`quran-reader-container ${isPageInputActive ? 'force-ui-visible' : ''} ${isLandscape ? 'landscape-mode' : ''} ${isLandscapeUIHidden ? 'landscape-ui-hidden' : ''} ${!isLandscape ? 'vertical-page' : ''} ${isTransparentMode ? 'is-transparent-mode' : ''} ${settings.showPageBorder === false ? 'no-border' : ''} ${(isHideToolbarsEnabled && isLandscapeUIHidden) ? 'hide-toolbars-autoscroll' : ''}`} id="app-container" style={{ 
            backgroundColor: settings.bgColor, 
            color: settings.textColor, 
            fontFamily: settings.fontFamily, 
            position: 'relative', 
            height: '100dvh', 
            overflow: 'hidden',
            boxSizing: 'border-box',
            '--quran-border-color': currentTheme.barBorder || currentTheme.accent || '#000000'
        } as React.CSSProperties}>
            <QuranHeader 
                isPageInputActive={isPageInputActive}
                pageInputRef={pageInputRef}
                pageInput={pageInput}
                handlePageInputChange={handlePageInputChange}
                handlePageInputBlur={handlePageInputBlur}
                handlePageInputKeyDown={handlePageInputKeyDown}
                handlePageButtonClick={handlePageButtonClick}
                page={currentPageNumber}
                surahName={surahName}
                currentAyah={currentAyah}
                juz={juz}
                openModal={openModal}
                currentTheme={currentTheme}
                getToolbarStyle={getToolbarStyle}
                handlePlayButtonPointerDown={handlePlayButtonPointerDown}
                handlePlayButtonPointerUp={handlePlayButtonPointerUp}
                handlePlayButtonPointerLeave={handlePlayButtonPointerLeave}
                renderPlayButtonIcon={renderPlayButtonIcon}
                reciterToast={reciterToast}
                readingMode={readingMode}
                setReadingMode={setReadingMode}
                isWirdMode={isWirdMode}
                isMemorizationMode={localIsMemorizationMode}
                memorizationSettings={localMemorizationSettings}
                handleMushafTypeSelect={handleMushafTypeSelect}
                setIsFloatingMenuOpen={toggleFloatingMenu}
                isFloatingMenuOpen={isFloatingMenuOpen}
                isAnyMenuOpen={isAnyMenuOpen}
            />
            <FloatingMenu 
                page={page}
                isFloatingMenuOpen={isFloatingMenuOpen}
                floatingMenuRef={floatingMenuRef}
                openModal={openModal}
                setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                getToolbarStyle={getToolbarStyle}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
                onNavigate={onNavigate}
                readingMode={readingMode}
                setReadingMode={setReadingMode}
                handleMushafTypeSelect={handleMushafTypeSelect}
                showToast={showToast}
                isWirdMode={isWirdMode}
                isMemorizationMode={localIsMemorizationMode}
                settings={settings}
                updateSetting={updateSetting}
                isHideToolbarsEnabled={isHideToolbarsEnabled}
                setIsHideToolbarsEnabled={setIsHideToolbarsEnabled}
                isTransparentMode={isTransparentMode}
                setIsTransparentMode={setIsTransparentMode}
                bookmarks={bookmarks}
                deleteBookmark={deleteBookmark}
                jumpToAyah={jumpToAyah}
                initialView={floatingMenuInitialView}
            />
            <ReadingTimer isVisible={autoScrollState.isPaused || (!autoScrollState.isActive && autoScrollState.elapsedTime > 0)} elapsedTime={autoScrollState.elapsedTime} />
            <div id="mushaf-content" ref={mushafContentRef} onClick={handleScreenTap} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="flex-grow overflow-y-auto w-full relative touch-pan-y">
                {readingMode === 'mushaf' ? (
                    <div id="pages-container" className="full-mushaf-container">
                    {sortedVisiblePages.map(pageNum => {
                        const displaySettings = ayahContextMenu.isOpen ? { ...settings, ...ayahContextMenu.tempSettings } : settings;
                        return (
                            <MushafPage 
                                key={pageNum} 
                                pageNum={pageNum} 
                                pageData={getPageData(pageNum)} 
                                highlightedAyahId={highlightedAyahId} 
                                onAyahClick={handleAyahTextClick} 
                                onVerseClick={handleVerseClick} 
                                onVerseLongPress={handleVerseLongPress} 
                                onAyahLongPress={handleAyahLongPress} 
                                onInteractionStart={handleInteractionStart} 
                                onInteractionEnd={handleInteractionEnd} 
                                settings={displaySettings} 
                                currentTheme={currentTheme}
                                hideVerses={isHideMode}
                                memorizationSettings={localMemorizationSettings}
                                isPlaying={isPlaying}
                                isRecording={isRecording}
                                revealedAyahs={revealedAyahs}
                                tempRevealedAyah={tempRevealedAyah}
                                onSurahHeaderLongPress={() => setIsSurahDesignPickerOpen(true)}
                            />
                        );
                    })}
                    </div>
                ) : (
                    <div className="min-h-full w-full">
                        <VerticalReadingView 
                            quranData={quranJsonData}
                            readingMode={readingMode as any}
                            settings={settings}
                            currentTheme={currentTheme}
                            currentAyah={currentAyah}
                            highlightedAyahId={highlightedAyahId}
                            isLandscape={isLandscape}
                            onAyahClick={handleVerticalAyahClick}
                            onAyahLongPress={handleAyahLongPress}
                            onVisibleAyahChange={(s, a) => {
                                if (isJumpingRef.current) return;
                                if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                                    // Wrap in setTimeout to prevent "Cannot update a component while rendering" error
                                    // as rangeChanged can be called during Virtuoso render
                                    setTimeout(() => {
                                        setCurrentAyah({ s, a });
                                        localStorage.setItem(`last_pos${posSuffix}`, JSON.stringify({ s, a })); 
                                        localStorage.setItem("last_read_ayah_global", JSON.stringify({ s, a, ts: Date.now() }));
                                        window.dispatchEvent(new Event('last_read_update'));
                                    }, 0);
                                }
                            }}
                            showMarkerNotification={showMarkerNotification}
                            showJuzNotification={showJuzNotification}
                            handleSajdahVisible={handleSajdahVisible}
                            onSettingsChange={setSettings}
                            modeSuffix={modeSuffix}
                            hideVerses={isHideMode}
                            memorizationSettings={localMemorizationSettings}
                            onSurahHeaderLongPress={() => setIsSurahDesignPickerOpen(true)}
                            isPlaying={isPlaying}
                            isRecording={isRecording}
                            revealedAyahs={revealedAyahs}
                            tempRevealedAyah={tempRevealedAyah}
                        />
                    </div>
                )}
            </div>
            <MarkerNotification isVisible={markerNotification.show} type={markerNotification.type} text={markerNotification.text} currentTheme={currentTheme} />
            
            <AyahContextMenu 
                isOpen={ayahContextMenu.isOpen && ayahContextMenu.isCustomizing && !initialLandscape}
                tempSettings={ayahContextMenu.tempSettings}
                ayahContextColorField={ayahContextColorField}
                setAyahContextColorField={setAyahContextColorField}
                setAyahContextMenu={setAyahContextMenu}
                onTempSettingsChange={(newSettings) => {
                    setSettings(prev => {
                        const updated = { ...prev, ...newSettings };
                        localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(updated));
                        window.dispatchEvent(new Event('settings-change'));
                        return updated;
                    });
                }}
                renderCheckerboard={renderCheckerboard}
                PREDEFINED_COLORS={PREDEFINED_COLORS}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
            />

            <QuranFooter 
                currentTheme={currentTheme}
                getToolbarStyle={getToolbarStyle}
                setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                isFloatingMenuOpen={isFloatingMenuOpen}
                isAnyMenuOpen={isAnyMenuOpen}
                hideShareButton={readingMode !== 'mushaf' || isLandscape}
                hideAutoScrollButton={readingMode !== 'mushaf'}
                openModal={openModal}
                menuButtonRef={menuButtonRef}
                handleBookmarkButtonPointerDown={handleBookmarkButtonPointerDown}
                handleBookmarkButtonPointerUp={handleBookmarkButtonPointerUp}
                handleBookmarkButtonPointerLeave={handleBookmarkButtonPointerLeave}
                handleAutoScrollButtonPointerDown={handleAutoScrollButtonPointerDown}
                handleAutoScrollButtonPointerUp={handleAutoScrollButtonPointerUp}
                handleAutoScrollButtonPointerLeave={handleAutoScrollButtonPointerLeave}
                autoScrollState={autoScrollState}
                onBack={handleHomeClick}
            />
            {isAutoScrollSettingsOpen && (
            <AutoScrollSettingsModal
                isOpen={isAutoScrollSettingsOpen}
                onClose={() => setIsAutoScrollSettingsOpen(false)}
                onSelectTime={(minutes) => {
                    setSettings(p => ({...p, scrollMinutes: minutes}));
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify({...settings, scrollMinutes: minutes}));
                }}
                currentMinutes={settings.scrollMinutes}
                isLandscape={isLandscape}
            />
        )}
        {activeModals.includes('surah-modal') && <SurahJuzModal type="surah" quranData={quranData} currentTheme={currentTheme} onSelect={(s, a) => { closeModal('surah-modal'); jumpToAyah(s, a, true); }} onClose={() => closeModal('surah-modal')} isLandscape={isLandscape} currentSelection={currentAyah.s} currentAyah={currentAyah} />}
            {activeModals.includes('juz-modal') && <SurahJuzModal type="juz" quranData={quranData} currentTheme={currentTheme} onSelect={(s, a) => { closeModal('juz-modal'); jumpToAyah(s, a, true); }} onClose={() => closeModal('juz-modal')} isLandscape={isLandscape} currentSelection={juz} currentAyah={currentAyah} />}
            {activeModals.includes('bookmarks-modal') && (
                <BookmarksModal 
                    bookmarks={bookmarks} 
                    quranData={quranData} 
                    isLandscape={isLandscape}
                    onSelect={(s, a, isL) => {
                        jumpToAyah(s, a, true);
                    }} 
                    onDelete={deleteBookmark} 
                    onClose={() => {
                        closeModal('bookmarks-modal');
                    }} 
                />
            )}
            <WirdCompletionModal 
                isOpen={showWirdCompleteModal} 
                onClose={() => setShowWirdCompleteModal(false)} 
                onGoToWird={handleHomeClick} 
                onGoHome={() => handleHomeClick('home')}
                onMarkCompleted={() => handleMarkWirdCompleted(false)}
                onMarkAndContinue={() => handleMarkWirdCompleted(true)}
                currentTheme={currentTheme} 
                isLandscape={isLandscape}
            />
            <SurahDesignPickerModal
                isOpen={isSurahDesignPickerOpen}
                onClose={() => setIsSurahDesignPickerOpen(false)}
                currentDesign={settings.surahHeaderDesign || 1}
                onSelectDesign={(d) => {
                    const newSettings = { ...settings, surahHeaderDesign: d };
                    setSettings(newSettings);
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                }}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
            />
            {activeModals.includes('search-modal') && <SearchModal quranData={quranData} onSelect={(s,a) => jumpToAyah(s,a, true)} onClose={() => closeModal('search-modal')} isLandscape={isLandscape} initialQuery={initialSearchQuery} readingMode={readingMode} currentTheme={currentTheme} />}
            {activeModals.includes('share-ayah') && <ShareAyahModal isOpen={true} onClose={() => closeModal('share-ayah')} currentAyah={currentAyah} quranData={quranData} currentTheme={currentTheme} readingMode={readingMode} settings={settings} showToast={showToast} />}
            {activeModals.includes('themes-modal') && <ThemesModal onClose={() => closeModal('themes-modal')} showToast={showToast} isLandscape={isLandscape} readingMode={readingMode} modeSuffix={themeSuffix} />}
            {activeModals.includes('settings-modal') && <SettingsModal onClose={() => closeModal('settings-modal')} onOpenModal={openModal} showToast={showToast} isLandscape={isLandscape} readingMode={readingMode} modeSuffix={themeSuffix} />}
            {activeModals.includes('notification-settings-modal') && <NotificationSettingsModal onClose={() => closeModal('notification-settings-modal')} showToast={showToast} isLandscape={isLandscape} modeSuffix={themeSuffix} initialTab={modalParams?.tab} />}
            {activeModals.includes('font-modal') && <FontSelectModal isOpen={true} onClose={() => closeModal('font-modal')} isLandscape={isLandscape} currentFontId={settings.fontFamily} onSelect={(id) => {
                const newSettings = { ...settings, fontFamily: id };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير الخط بنجاح');
                closeModal('font-modal');
            }} />}
            {activeModals.includes('ayah-font-modal') && (
                <FontSelectModal 
                    isOpen={true} 
                    onClose={() => closeModal('ayah-font-modal')} 
                    isLandscape={isLandscape} 
                    currentFontId={ayahContextMenu.tempSettings.fontFamily} 
                    onSelect={(id) => {
                        setAyahContextMenu(prev => ({
                            ...prev,
                            tempSettings: { ...prev.tempSettings, fontFamily: id }
                        }));
                        closeModal('ayah-font-modal');
                    }} 
                />
            )}
            {activeModals.includes('scroll-speed-modal') && <ScrollSpeedModal isOpen={true} onClose={() => closeModal('scroll-speed-modal')} isLandscape={isLandscape} currentMinutes={settings.scrollMinutes} onSelect={(m) => {
                const newSettings = { ...settings, scrollMinutes: m };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير سرعة التمرير');
                closeModal('scroll-speed-modal');
            }} />}
            {activeModals.includes('reciter-modal') && <ReciterSelectModal onClose={() => closeModal('reciter-modal')} currentReader={localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader} isLandscape={isLandscape} readersList={localIsMemorizationMode ? MEMORIZATION_READERS : READERS} onSelect={(id) => {
                if (localIsMemorizationMode && memorizationSettingsRef.current) {
                    memorizationSettingsRef.current.reader = id;
                }
                const newSettings = { ...settings, reader: id };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير القارئ بنجاح');
            }} />}
            {activeModals.includes('toolbar-color-picker-modal') && <ToolbarColorPickerModal onClose={() => closeModal('toolbar-color-picker-modal')} onOpenModal={openModal} showToast={showToast} currentTheme={currentTheme} toolbarColors={toolbarColors} isLandscape={isLandscape} modeSuffix={themeSuffix} />}
            {activeModals.includes('quran-download-modal') && (
                <QuranDownloadModal 
                    onClose={() => closeModal('quran-download-modal')} 
                    quranData={quranData} 
                    showToast={showToast} 
                    isLandscape={isLandscape} 
                    readersList={modalParams?.readersList}
                    mode={modalParams?.mode}
                />
            )}
            {activeModals.includes('tafsir-download-modal') && <TafsirDownloadModal onClose={() => closeModal('tafsir-download-modal')} quranData={quranData} showToast={showToast} isLandscape={isLandscape} />}
            <TafseerModal 
                isOpen={tafseerInfo.isOpen} 
                isLoading={isTafseerLoading} 
                isLandscape={isLandscape}
                currentTheme={currentTheme}
                onOpenThemes={() => openModal('themes-modal')}
                title={`${tafseerName} - ${tafseerInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(tafseerInfo.a)}`} 
                text={tafseerInfo.text} 
                onClose={() => {
                    if (tafseerInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setTafseerInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
            />
            <TafseerModal 
                isOpen={quranMeaningsInfo.isOpen} 
                isLoading={isQuranMeaningsLoading} 
                isLandscape={isLandscape}
                currentTheme={currentTheme}
                onOpenThemes={() => openModal('themes-modal')}
                title={`معاني القرآن - ${quranMeaningsInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(quranMeaningsInfo.a)}`} 
                text={quranMeaningsInfo.text} 
                onClose={() => {
                    if (quranMeaningsInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setQuranMeaningsInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
            />
            <TafseerModal 
                isOpen={quranTranslationInfo.isOpen} 
                isLoading={isQuranTranslationLoading} 
                isLandscape={isLandscape}
                currentTheme={currentTheme}
                onOpenThemes={() => openModal('themes-modal')}
                title={`الترجمة الإنجليزية - ${quranTranslationInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(quranTranslationInfo.a)}`} 
                text={quranTranslationInfo.text} 
                onClose={() => {
                    if (quranTranslationInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setQuranTranslationInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
            />
            <AyahActionMenu
                isOpen={ayahActionMenu.isOpen}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
                onClose={() => {
                    if (ayahActionMenu.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setAyahActionMenu(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }}
                onTafseer={() => {
                    setAyahActionMenu(p => ({ ...p, isOpen: false }));
                    setIsTafseerLoading(true);
                    setTafseerInfo({ isOpen: true, s: ayahActionMenu.s, a: ayahActionMenu.a, text: '', surahName: ayahActionMenu.surahName, wasAutoscrolling: ayahActionMenu.wasAutoscrolling });
                }}
                onMeanings={() => {
                    setAyahActionMenu(p => ({ ...p, isOpen: false }));
                    setQuranMeaningsInfo({ isOpen: true, s: ayahActionMenu.s, a: ayahActionMenu.a, text: '', surahName: ayahActionMenu.surahName, wasAutoscrolling: ayahActionMenu.wasAutoscrolling });
                }}
                onTranslation={() => {
                    setAyahActionMenu(p => ({ ...p, isOpen: false }));
                    setQuranTranslationInfo({ isOpen: true, s: ayahActionMenu.s, a: ayahActionMenu.a, text: '', surahName: ayahActionMenu.surahName, wasAutoscrolling: ayahActionMenu.wasAutoscrolling });
                }}
            />
            <TafseerSelectionModal 
                isOpen={tafseerSelectionInfo.isOpen} 
                isLandscape={isLandscape}
                onClose={() => {
                    if (tafseerSelectionInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setTafseerSelectionInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
                onSelect={handleTafseerSelect} 
                currentTafseerId={settings.tafseer} 
            />
            <MushafSelectionModal
                isOpen={activeModals.includes('mushaf-selection-modal')}
                isLandscape={isLandscape}
                onClose={() => closeModal('mushaf-selection-modal')}
                onSelect={handleMushafTypeSelect}
                currentType={'uthmani'}
            />
            <SajdahCardModal info={sajdahCardInfo} onClose={handleCloseSajdahCard} isLandscape={isLandscape} currentTheme={currentTheme} />
            <ResumeSessionModal 
                isOpen={showResumeModal} 
                onClose={() => setShowResumeModal(false)} 
                onResume={handleResumeSession} 
                onStartNew={handleStartNewFromResume} 
                currentTheme={currentTheme} 
                savedSession={savedSession} 
                isLandscape={isLandscape}
            />
            <JuzNotification isVisible={juzNotification.show} text={juzNotification.text} currentTheme={currentTheme} />
            <Toast message={toast.message} show={toast.show} onClose={handleToastClose} currentTheme={currentTheme} />
            {!isLandscape && <TutorialOverlay tutorialId="quran-reader-tutorial" steps={quranTutorialSteps} />}
            
            {/* Memorization Review Controls */}
            {localIsMemorizationMode && localMemorizationSettings?.isReviewMode && (
                <div className="fixed bottom-24 left-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
                    <div className="flex justify-between items-end w-full pointer-events-auto">
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => setIsHideMode(!isHideMode)}
                                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90 ${isHideMode ? 'bg-emerald-600 text-white' : 'bg-white/90 text-gray-700'}`}
                                title={isHideMode ? "إظهار الآيات" : "إخفاء الآيات"}
                            >
                                {isHideMode ? <BookOpen size={24} /> : <Grid size={24} />}
                            </button>
                            <button 
                                onClick={() => setShowReviewTest(true)}
                                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-white/90 text-gray-700 transition-all active:scale-90"
                                title="اختبار الحفظ"
                            >
                                <Trophy size={24} className="text-amber-500" />
                            </button>
                            <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-white/90 text-gray-700'}`}
                                title={isRecording ? "إيقاف التسجيل" : "بدء التسجيل"}
                            >
                                <Mic size={24} />
                            </button>
                            {recordedAudio && !isRecording && (
                                <button 
                                    onClick={playRecordedAudio}
                                    className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-blue-600 text-white transition-all active:scale-90"
                                    title="تشغيل التسجيل"
                                >
                                    <Play size={24} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showReviewTest && localMemorizationSettings && (
                <ReviewTestModal 
                    isOpen={showReviewTest}
                    onClose={() => setShowReviewTest(false)}
                    quranData={quranJsonData}
                    fromSurah={localMemorizationSettings.fromSurah}
                    fromAyah={localMemorizationSettings.fromAyah}
                    toSurah={localMemorizationSettings.toSurah}
                    toAyah={localMemorizationSettings.toAyah}
                    currentTheme={currentTheme}
                    onComplete={(success) => {
                        setShowReviewTest(false);
                        if (success) {
                            showToast('أحسنت! لقد نجحت في الاختبار');
                            // Update review schedule if in review mode
                            if (localMemorizationSettings.isReviewMode) {
                                // We need the range ID, but for now let's just show success
                            }
                        } else {
                            showToast('تحتاج لمزيد من المراجعة، حاول مرة أخرى');
                        }
                    }}
                />
            )}
        </div>
    );
};

export default QuranReader;