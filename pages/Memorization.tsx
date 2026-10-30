import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Repeat, Play, User, ArrowLeftRight, CheckSquare, BookOpen, Calendar, List, Trophy, Trash2, RotateCcw, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ThemePageLock from '../components/ThemePageLock';
import { quranData as quranJsonData } from '../utils/quranData';
const quranData = { data: quranJsonData };
import { SURAH_NAMES_AR, MEMORIZATION_READERS } from '../components/QuranReader/constants';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { QuranDownloadModal } from '../components/QuranReader/DownloadModals';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import Toast from '../components/QuranReader/Toast';
import { memorizationService, MemorizedRange } from '../services/memorizationService';
import { getReciterDisplayName } from '../utils/listenQuranTranslations';
import { useShowNewBadge, markPageAsSeen } from '../utils/badgeManager';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { MEMORIZATION_SETUP_STEPS, MEMORIZATION_REVIEW_STEPS } from '../components/Community/communityTourSteps';
import './QuranReader.css';

export const SURAH_NAMES_EN = [
    "Al-Fatihah", "Al-Baqarah", "Aali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
    "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha",
    "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum",
    "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
    "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
    "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahana",
    "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
    "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa",
    "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
    "Ash-Shams", "Al-Lail", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
    "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraish", "Al-Ma'un", "Al-Kauthar", "Al-Kafirun", "An-Nasr",
    "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

// Utility to convert hex colors to rgba for soft tinted badges and highlights
function hexToRgba(hex: string, alpha: number = 1): string {
    if (!hex) return `rgba(46, 125, 94, ${alpha})`;
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return `rgba(46, 125, 94, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface MemorizationProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

const Memorization: React.FC<MemorizationProps> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
    const isBlackAndWhite = themeKey === 'deep_black';
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
    
    // Dynamic theme primary and accent colors
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.accent || (isBlackAndWhite ? '#FFFFFF' : (theme.palette?.[0] || '#2E7D5E')));
    const secondaryColor = isBlackTheme ? '#A1A1AA' : (theme.palette?.[1] || theme.palette?.[0] || '#4B5563');
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
    
    const [selectedReader, setSelectedReader] = useState(MEMORIZATION_READERS[1].id); // Default to Abdul Basit
    
    const [fromSurah, setFromSurah] = useState(1);
    const [fromAyah, setFromAyah] = useState(1);
    const [toSurah, setToSurah] = useState(1);
    const [toAyah, setToAyah] = useState(7);

    const [rangeRepeat, setRangeRepeat] = useState(1);
    const [ayahRepeat, setAyahRepeat] = useState(1);
    const [linkedRepeat, setLinkedRepeat] = useState(false);
    const [pauseLength, setPauseLength] = useState(1);
    const [testAfterSession, setTestAfterSession] = useState(false);
    const [activeTab, setActiveTab] = useState<'setup' | 'review'>('setup');
    const [memorizedRanges, setMemorizedRanges] = useState<MemorizedRange[]>([]);

    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showExplanationModal, setShowExplanationModal] = useState(false);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [savedSession, setSavedSession] = useState<any>(null);
    const [activePicker, setActivePicker] = useState<'range' | 'ayah' | 'pause' | 'reader' | 'fromSurah' | 'fromAyah' | 'toSurah' | 'toAyah' | null>(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [dismissedLocally, setDismissedLocally] = useState(false);
    const isNewBadgeEligible = useShowNewBadge('memorization_review_tab');
    const showNewBadge = isNewBadgeEligible && !dismissedLocally;
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

    // Interactive Spotlight Guides - independent for each tab
    const [showSetupTour, setShowSetupTour] = useState(() => !getGuideSeen('memorization_setup_tour'));
    const [showReviewTour, setShowReviewTour] = useState(false);

    useEffect(() => {
        if (activeTab === 'review') {
            setDismissedLocally(true);
            markPageAsSeen('memorization_review_tab');
            if (!getGuideSeen('memorization_review_tour')) {
                setShowReviewTour(true);
            }
        }
    }, [activeTab]);

    const handleOpenGuide = () => {
        if (activeTab === 'setup') {
            setShowSetupTour(true);
        } else {
            setShowReviewTour(true);
        }
    };

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    useEffect(() => {
        return () => {
            const audioElements = document.querySelectorAll('audio');
            audioElements.forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        };
    }, []);

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('memorization_settings_v1');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSelectedReader(parsed.reader || MEMORIZATION_READERS[1].id);
                setFromSurah(parsed.fromSurah || 1);
                setFromAyah(parsed.fromAyah || 1);
                setToSurah(parsed.toSurah || 1);
                setToAyah(parsed.toAyah || 7);
                setRangeRepeat(parsed.rangeRepeat || 1);
                setAyahRepeat(parsed.ayahRepeat || 1);
                setLinkedRepeat(parsed.linkedRepeat !== undefined ? parsed.linkedRepeat : false);
                setPauseLength(parsed.pauseLength || 1);
                setTestAfterSession(parsed.testAfterSession || false);
            } catch (e) {
                console.error("Failed to load memorization settings", e);
            }
        }

        const session = localStorage.getItem('memorization_session_v1');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setSavedSession(parsed);
                }
            } catch (e) {}
        }

        setMemorizedRanges(memorizationService.getMemorizedRanges());
    }, []);

    useEffect(() => {
        const settings = {
            reader: selectedReader,
            fromSurah,
            fromAyah,
            toSurah,
            toAyah,
            rangeRepeat,
            ayahRepeat,
            linkedRepeat,
            pauseLength,
            testAfterSession
        };
        localStorage.setItem('memorization_settings_v1', JSON.stringify(settings));
    }, [selectedReader, fromSurah, fromAyah, toSurah, toAyah, rangeRepeat, ayahRepeat, linkedRepeat, pauseLength, testAfterSession]);

    useEffect(() => {
        if (!activePicker || activePicker === 'reader') return;

        const timer = setTimeout(() => {
            let elementId = '';
            if (activePicker === 'fromSurah') {
                elementId = `surah-btn-${fromSurah}`;
            } else if (activePicker === 'toSurah') {
                elementId = `surah-btn-${toSurah}`;
            } else if (activePicker === 'fromAyah') {
                elementId = `ayah-btn-${fromAyah}`;
            } else if (activePicker === 'toAyah') {
                elementId = `ayah-btn-${toAyah}`;
            }

            if (elementId) {
                const el = document.getElementById(elementId);
                if (el) {
                    el.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [activePicker, selectedReader, fromSurah, toSurah, fromAyah, toAyah]);

    const handleStart = () => {
        const session = localStorage.getItem('memorization_session_v1');
        if (savedSession && session) {
            setShowResumePrompt(true);
        } else {
            setSavedSession(null);
            startNewSession();
        }
    };

    const startNewSession = () => {
        memorizationService.saveRange({
            fromSurah,
            fromAyah,
            toSurah,
            toAyah,
            readerId: selectedReader
        });
        setMemorizedRanges(memorizationService.getMemorizedRanges());

        onNavigate('quran', {
            isMemorization: true,
            initialSurah: fromSurah,
            initialAyah: fromAyah,
            memorizationSettings: {
                reader: selectedReader,
                fromSurah,
                fromAyah,
                toSurah,
                toAyah,
                rangeRepeat,
                ayahRepeat,
                linkedRepeat,
                pauseLength,
                testAfterSession
            }
        });
    };

    const resumeSession = () => {
        onNavigate('quran', {
            isMemorization: true,
            memorizationSettings: savedSession.settings,
            initialSurah: savedSession.currentAyah.s,
            initialAyah: savedSession.currentAyah.a
        });
    };

    const getAyahsCount = (surahNum: number) => {
        return quranData.data.surahs[surahNum - 1]?.ayahs.length || 0;
    };

    // Modern flat NumberPicker chip
    const NumberPicker = ({ value, label }: { value: number, onChange: (v: number) => void, label: string }) => (
        <div 
            onClick={() => setActivePicker(label as any)}
            className="flex flex-col items-center justify-center min-w-[72px] h-11 rounded-xl cursor-pointer bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200/70 dark:hover:bg-zinc-700/80 transition-all active:scale-95 select-none"
        >
            <span className="font-black text-base leading-tight" style={{ color: 'var(--text-color)' }}>{value}</span>
            <span className="text-[10px] opacity-60 font-medium" style={{ color: 'var(--text-color)' }}>{isEn ? 'times' : 'مرة'}</span>
        </div>
    );

    const handleDeleteRange = (id: string) => {
        memorizationService.deleteRange(id);
        setMemorizedRanges(memorizationService.getMemorizedRanges());
        showToast(isEn ? 'Range removed from review' : 'تم حذف النطاق من المراجعة');
    };

    const handleReviewRange = (range: MemorizedRange) => {
        onNavigate('quran', {
            isMemorization: true,
            surah: range.fromSurah,
            ayah: range.fromAyah,
            initialSurah: range.fromSurah,
            initialAyah: range.fromAyah,
            memorizationSettings: {
                rangeId: range.id,
                reader: range.readerId || selectedReader,
                fromSurah: range.fromSurah,
                fromAyah: range.fromAyah,
                toSurah: range.toSurah,
                toAyah: range.toAyah,
                rangeRepeat: 2,
                ayahRepeat: 1,
                linkedRepeat: false,
                pauseLength: 1,
                testAfterSession: true,
                isReviewMode: true
            }
        });
    };

    const handleHomeClick = () => {
        if (showHelpModal) setShowHelpModal(false);
        else if (showExplanationModal) setShowExplanationModal(false);
        else if (showResumePrompt) setShowResumePrompt(false);
        else if (activePicker) setActivePicker(null);
        else if (showDownloadModal) setShowDownloadModal(false);
        else onBack();
    };

    useEffect(() => {
        const interceptor = () => {
            if (showHelpModal) { setShowHelpModal(false); return true; }
            if (showExplanationModal) { setShowExplanationModal(false); return true; }
            if (showResumePrompt) { setShowResumePrompt(false); return true; }
            if (activePicker) { setActivePicker(null); return true; }
            if (showDownloadModal) { setShowDownloadModal(false); return true; }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [showHelpModal, showExplanationModal, showResumePrompt, activePicker, showDownloadModal]);

    const getSurahName = (num: number) => {
        return isEn ? (SURAH_NAMES_EN[num - 1] || `Surah ${num}`) : (SURAH_NAMES_AR[num - 1] || `سورة ${num}`);
    };

    return (
        <div 
            className="h-screen flex flex-col" 
            dir={isEn ? 'ltr' : 'rtl'} 
            style={{ 
                fontFamily: theme.font, 
                backgroundColor: theme.bgColor || '#F8FAFC', 
                color: 'var(--text-color)' 
            }}
        >
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <header className="app-top-bar shrink-0 relative z-10" style={{ backgroundColor: 'var(--qr-bar-bg)', borderBottom: '1px solid var(--qr-bar-border)' }}>
                    <div className="app-top-bar__inner">
                        <div className="relative flex items-center justify-center w-full min-h-[44px]">
                            {/* Back button */}
                            <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                                <button
                                    onClick={handleHomeClick}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    title={isEn ? 'Go Back' : 'رجوع للخلف'}
                                    aria-label={isEn ? 'Go Back' : 'رجوع للخلف'}
                                >
                                    <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                                </button>
                            </div>

                            {/* Title in center */}
                            <div className="text-center px-12 min-w-0">
                                <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi flex items-center justify-center gap-2 truncate" style={{ color: 'var(--qr-bar-text)' }}>
                                    {isEn ? 'Memorization' : 'التحفيظ'}
                                </h1>
                            </div>

                            {/* Guide / Page Lock / Home icons */}
                            <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                                <button
                                    type="button"
                                    onClick={handleOpenGuide}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    style={{ color: 'var(--qr-bar-text, var(--top-bar-text, inherit))' }}
                                    title={isEn ? "Memorization Guide" : "دليل وشرح التحفيظ"}
                                    aria-label={isEn ? "Memorization Guide" : "دليل وشرح التحفيظ"}
                                >
                                    <i className="fa-solid fa-circle-question text-lg"></i>
                                </button>
                                <ThemePageLock />
                                <button
                                    onClick={() => onNavigate('home')}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    title={isEn ? 'Home Page' : 'الصفحة الرئيسية'}
                                    aria-label={isEn ? 'Home Page' : 'الصفحة الرئيسية'}
                                >
                                    <i className="fa-solid fa-house text-xl"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main id="memorization-scroll-container" className="flex-1 overflow-y-auto px-4 py-3 space-y-4 hide-scrollbar relative z-10 max-w-lg mx-auto w-full">
                    {/* Modern Flat Segmented Control Tabs */}
                    <div 
                        id="memorization-tabs-container" 
                        className="flex p-1.5 rounded-2xl bg-slate-200/60 dark:bg-zinc-800/60 gap-1.5 shadow-none border-0"
                    >
                        <button 
                            onClick={() => setActiveTab('setup')}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'setup' 
                                    ? 'shadow-sm' 
                                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            style={{ 
                                backgroundColor: activeTab === 'setup' ? primaryColor : 'transparent',
                                color: activeTab === 'setup' ? btnTextColor : undefined
                            }}
                        >
                            <BookOpen size={16} />
                            <span>{isEn ? 'Memorization Setup' : 'إعداد الحفظ'}</span>
                        </button>
                        
                        <button 
                            onClick={() => {
                                setActiveTab('review');
                                setDismissedLocally(true);
                                markPageAsSeen('memorization_review_tab');
                            }}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 relative cursor-pointer ${
                                activeTab === 'review' 
                                    ? 'shadow-sm' 
                                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            style={{ 
                                backgroundColor: activeTab === 'review' ? primaryColor : 'transparent',
                                color: activeTab === 'review' ? btnTextColor : undefined
                            }}
                        >
                            {showNewBadge && (
                                <div className={`absolute -top-2.5 ${isEn ? '-right-1' : '-left-1'} bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-20 shadow-md animate-bounce pointer-events-none scale-75 origin-top`}>
                                    {isEn ? 'New' : 'جديد'}
                                </div>
                            )}
                            <Calendar size={16} />
                            <span>{isEn ? 'Review Schedule' : 'جدول المراجعة'}</span>
                            {memorizedRanges.length > 0 && (
                                <span 
                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                    style={{
                                        backgroundColor: activeTab === 'review' ? 'rgba(255,255,255,0.25)' : hexToRgba(primaryColor, 0.15),
                                        color: activeTab === 'review' ? '#FFFFFF' : primaryColor
                                    }}
                                >
                                    {memorizedRanges.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'setup' ? (
                        <div className="space-y-4">
                            {/* Reader Selection Card */}
                            <div className="space-y-1.5" id="reader-select-container">
                                <div className="flex items-center justify-start gap-2 font-bold text-sm text-slate-800 dark:text-zinc-200 px-1">
                                    <User size={17} style={{ color: primaryColor }} />
                                    <span>{isEn ? 'Select Reciter' : 'اختر اسم القارئ'}</span>
                                </div>
                                <div 
                                    onClick={() => setActivePicker('reader')}
                                    className="w-full p-4 rounded-2xl cursor-pointer font-medium text-sm shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md flex items-center justify-between transition-all bg-white dark:bg-zinc-900 border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
                                            style={{ backgroundColor: hexToRgba(primaryColor, 0.12), color: primaryColor }}
                                        >
                                            <User size={16} />
                                        </div>
                                        <span className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                                            {getReciterDisplayName(selectedReader, MEMORIZATION_READERS.find(r => r.id === selectedReader)?.name, language)}
                                        </span>
                                    </div>
                                    <div 
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs opacity-60 bg-slate-100 dark:bg-zinc-800"
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        <i className="fa-solid fa-chevron-down text-xs"></i>
                                    </div>
                                </div>
                            </div>

                            {/* Ayah Range Card */}
                            <div className="space-y-1.5" id="ayah-range-container">
                                <div className="flex items-center justify-start gap-2 font-bold text-sm text-slate-800 dark:text-zinc-200 px-1">
                                    <ArrowLeftRight size={17} style={{ color: primaryColor }} />
                                    <span>{isEn ? 'Ayah Range' : 'نطاق الآيات'}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {/* From */}
                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-2 border-0">
                                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold" style={{ color: primaryColor }}>
                                            <span>{isEn ? 'From Verse' : 'من الآية'}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div 
                                                onClick={() => setActivePicker('fromSurah')}
                                                className="w-full py-3 px-2 rounded-xl cursor-pointer text-center font-bold text-xs bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200/70 transition-all border-0 truncate"
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                {getSurahName(fromSurah)}
                                            </div>
                                            <div 
                                                onClick={() => setActivePicker('fromAyah')}
                                                className="w-full py-3 px-2 rounded-xl cursor-pointer text-center font-bold text-xs bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200/70 transition-all border-0"
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                {isEn ? `Ayah ${fromAyah}` : `آية ${fromAyah}`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* To */}
                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-2 border-0">
                                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold" style={{ color: primaryColor }}>
                                            <span>{isEn ? 'To Verse' : 'إلى الآية'}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div 
                                                onClick={() => setActivePicker('toSurah')}
                                                className="w-full py-3 px-2 rounded-xl cursor-pointer text-center font-bold text-xs bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200/70 transition-all border-0 truncate"
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                {getSurahName(toSurah)}
                                            </div>
                                            <div 
                                                onClick={() => setActivePicker('toAyah')}
                                                className="w-full py-3 px-2 rounded-xl cursor-pointer text-center font-bold text-xs bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200/70 transition-all border-0"
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                {isEn ? `Ayah ${toAyah}` : `آية ${toAyah}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Repetition Settings Card */}
                            <div id="repetition-settings-container" className="space-y-1.5">
                                <div className="flex items-center justify-start gap-2 font-bold text-sm text-slate-800 dark:text-zinc-200 px-1">
                                    <Repeat size={17} style={{ color: primaryColor }} />
                                    <span>{isEn ? 'Repetition Settings' : 'إعدادات التكرار'}</span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-0">
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Range Repeat */}
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                                            <span className="font-bold text-xs leading-tight pr-1" style={{ color: 'var(--text-color)' }}>
                                                {isEn ? 'Range Repeat' : 'تكرار النطاق'}
                                            </span>
                                            <NumberPicker value={rangeRepeat} onChange={(v) => { setRangeRepeat(v); setSavedSession(null); }} label="range" />
                                        </div>

                                        {/* Ayah Repeat */}
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                                            <span className="font-bold text-xs leading-tight pr-1" style={{ color: 'var(--text-color)' }}>
                                                {isEn ? 'Ayah Repeat' : 'تكرار الآية'}
                                            </span>
                                            <NumberPicker value={ayahRepeat} onChange={(v) => { setAyahRepeat(v); setSavedSession(null); }} label="ayah" />
                                        </div>

                                        {/* Linked Repeat Toggle */}
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-xs leading-tight" style={{ color: 'var(--text-color)' }}>
                                                    {isEn ? 'Linked Repeat' : 'ربط الآيات'}
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowExplanationModal(true)}
                                                    className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5 hover:opacity-100 transition-opacity" 
                                                    style={{ color: primaryColor }}
                                                >
                                                    {isEn ? 'Explanation' : 'توضيح'} <Play size={8} />
                                                </button>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={linkedRepeat} 
                                                    onChange={(e) => { setLinkedRepeat(e.target.checked); setSavedSession(null); }} 
                                                />
                                                <div 
                                                    className="w-10 h-6 rounded-full peer transition-colors after:content-[''] after:absolute after:top-[3px] after:right-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:-translate-x-4 shadow-inner"
                                                    style={{ 
                                                        backgroundColor: linkedRepeat ? primaryColor : '#CBD5E1' 
                                                    }}
                                                ></div>
                                            </label>
                                        </div>

                                        {/* Pause Length */}
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                                            <span className="font-bold text-xs leading-tight pr-1" style={{ color: 'var(--text-color)' }}>
                                                {isEn ? 'Pause Time' : 'السكتة'}
                                            </span>
                                            <NumberPicker value={pauseLength} onChange={(v) => { setPauseLength(v); setSavedSession(null); }} label="pause" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Test After Session Toggle Card */}
                            <div 
                                id="test-after-session-container" 
                                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-0"
                            >
                                <div className="flex items-center gap-2.5 font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                                    <div 
                                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: hexToRgba(primaryColor, 0.12), color: primaryColor }}
                                    >
                                        <CheckSquare size={18} />
                                    </div>
                                    <span>{isEn ? 'Test After Session' : 'اختبار بعد الجلسة'}</span>
                                    <HelpCircle 
                                        size={16} 
                                        onClick={() => setShowHelpModal(true)} 
                                        className="cursor-pointer hover:scale-110 transition-transform opacity-70 hover:opacity-100" 
                                        style={{ color: primaryColor }} 
                                    />
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={testAfterSession} 
                                        onChange={(e) => { setTestAfterSession(e.target.checked); setSavedSession(null); }} 
                                    />
                                    <div 
                                        className="w-10 h-6 rounded-full peer transition-colors after:content-[''] after:absolute after:top-[3px] after:right-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:-translate-x-4 shadow-inner"
                                        style={{ 
                                            backgroundColor: testAfterSession ? primaryColor : '#CBD5E1' 
                                        }}
                                    ></div>
                                </label>
                            </div>

                            {/* Start Memorization Button */}
                            <div className="space-y-3 pt-2">
                                <button 
                                    id="btn-start-memorization"
                                    onClick={handleStart}
                                    className="w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer border-0"
                                    style={{
                                         backgroundColor: primaryColor,
                                         color: btnTextColor,
                                         boxShadow: `0 10px 25px -5px ${hexToRgba(primaryColor, 0.4)}`
                                    }}
                                >
                                    <Play size={20} fill="currentColor" />
                                    <span>{isEn ? 'Start Memorization Session' : 'ابدأ جلسة التحفيظ'}</span>
                                </button>

                                <button 
                                    id="btn-download-reciters"
                                    onClick={() => setShowDownloadModal(true)} 
                                    className="w-full h-13 px-4 flex items-center justify-between transition-all active:scale-[0.98] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md bg-white dark:bg-zinc-900 border-0 cursor-pointer"
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: hexToRgba(primaryColor, 0.12), color: primaryColor }}
                                        >
                                            <Download size={18} />
                                        </div>
                                        <span className="font-bold text-sm">{isEn ? 'Download Reciters' : 'تحميل القراء'}</span>
                                    </div>
                                    <ArrowRight size={16} className={`rotate-180 opacity-40 ${isEn ? 'rotate-0' : ''}`} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fadeIn">
                            {/* Review Stats */}
                            <div id="memorization-review-stats" className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900 border-0">
                                    <div 
                                        className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-2"
                                        style={{ backgroundColor: hexToRgba(primaryColor, 0.12), color: primaryColor }}
                                    >
                                        <Trophy size={22} />
                                    </div>
                                    <div className="text-2xl font-black" style={{ color: primaryColor }}>
                                        {memorizedRanges.length}
                                    </div>
                                    <div className="text-xs opacity-70 font-semibold mt-0.5" style={{ color: 'var(--text-color)' }}>
                                        {isEn ? 'Memorized Ranges' : 'نطاق تم حفظه'}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900 border-0">
                                    <div 
                                        className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-2"
                                        style={{ backgroundColor: hexToRgba(secondaryColor, 0.12), color: secondaryColor }}
                                    >
                                        <RotateCcw size={22} />
                                    </div>
                                    <div className="text-2xl font-black" style={{ color: secondaryColor }}>
                                        {memorizedRanges.filter(r => (r.nextReviewDate || 0) <= Date.now()).length}
                                    </div>
                                    <div className="text-xs opacity-70 font-semibold mt-0.5" style={{ color: 'var(--text-color)' }}>
                                        {isEn ? 'Pending Review Today' : 'بانتظار المراجعة اليوم'}
                                    </div>
                                </div>
                            </div>

                            {/* Review List */}
                            <div id="memorization-review-list" className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                                        {isEn ? 'Your Memorization Review List' : 'قائمة محفوظاتك للمراجعة'}
                                    </h3>
                                    <List size={18} className="opacity-50" />
                                </div>

                                {memorizedRanges.length === 0 ? (
                                    <div 
                                        id="memorization-review-empty" 
                                        className="p-8 text-center rounded-3xl space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900 border-0"
                                    >
                                        <div 
                                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-1"
                                            style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor }}
                                        >
                                            <Calendar size={32} />
                                        </div>
                                        <h4 className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                                            {isEn ? 'No memorized ranges in review schedule currently' : 'لا توجد محفوظات في جدول المراجعة حالياً'}
                                        </h4>
                                        <p className="text-xs opacity-70 leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-color)' }}>
                                            {isEn 
                                                ? 'Start memorizing and repeating any surah or ayah range from the Setup tab, and it will be automatically added to the smart review schedule.' 
                                                : 'ابدأ بحفظ وتكرار أي سورة أو نطاق آيات من تبويب (إعداد الحفظ)، وسيتم إدراجه تلقائياً في جدول المراجعة الذكي.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('setup')}
                                            className="px-5 py-3 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 mt-2 border-0 cursor-pointer"
                                            style={{ 
                                                backgroundColor: primaryColor,
                                                color: btnTextColor,
                                                boxShadow: `0 8px 20px -4px ${hexToRgba(primaryColor, 0.35)}`
                                            }}
                                        >
                                            {isEn ? 'Setup New Memorization Range' : 'إعداد نطاق جديد للحفظ'}
                                        </button>
                                    </div>
                                ) : (
                                    memorizedRanges.map((range, idx) => {
                                        const isDue = (range.nextReviewDate || 0) <= Date.now();
                                        return (
                                            <div 
                                                key={range.id} 
                                                id={idx === 0 ? "first-review-card" : undefined}
                                                className="p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900 border-0 transition-all"
                                            >
                                                {isDue && (
                                                    <div 
                                                        className={`absolute top-0 ${isEn ? 'left-0' : 'right-0'} w-1.5 h-full`}
                                                        style={{ backgroundColor: primaryColor }}
                                                    ></div>
                                                )}
                                                
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                                                            {getSurahName(range.fromSurah)}
                                                        </div>
                                                        <div className="text-xs opacity-70 mt-0.5 font-medium" style={{ color: 'var(--text-color)' }}>
                                                            {isEn ? `Ayahs: ${range.fromAyah} to ${range.toAyah}` : `الآيات: ${range.fromAyah} إلى ${range.toAyah}`}
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <div 
                                                            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                                            style={{
                                                                backgroundColor: isDue ? hexToRgba(primaryColor, 0.14) : 'rgba(156, 163, 175, 0.15)',
                                                                color: isDue ? primaryColor : 'var(--text-color)'
                                                            }}
                                                        >
                                                            {isDue ? (isEn ? 'Review Time! ⏱️' : 'حان وقت المراجعة ⏱️') : (isEn ? 'Upcoming Review ⏳' : 'مراجعة قادمة ⏳')}
                                                        </div>
                                                        <div className="text-[10px] opacity-60 mt-1 font-sans">
                                                            {range.nextReviewDate ? new Date(range.nextReviewDate).toLocaleDateString(isEn ? 'en-US' : 'ar-SA') : (isEn ? 'Today' : 'اليوم')}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <button 
                                                        onClick={() => handleReviewRange(range)}
                                                        className="flex-1 py-3 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 border-0 cursor-pointer"
                                                        style={{ 
                                                            backgroundColor: primaryColor,
                                                            color: btnTextColor,
                                                            boxShadow: `0 6px 16px -2px ${hexToRgba(primaryColor, 0.35)}`
                                                        }}
                                                    >
                                                        <Play size={14} fill="currentColor" />
                                                        <span>{isEn ? 'Start Review & Fixation Session' : 'بدء جلسة المراجعة والتثبيت'}</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteRange(range.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95 border-0 cursor-pointer"
                                                        title={isEn ? 'Delete from review schedule' : 'حذف من جدول المراجعة'}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                    <div className="shrink-0 w-full h-8"></div>
                </main>
            </div>

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowHelpModal(false)}>
                    <div 
                        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter ${isEn ? 'text-left' : 'text-right'} bg-white dark:bg-zinc-900 border-0`} 
                        onClick={e => e.stopPropagation()} 
                        style={{ color: 'var(--text-color)' }}
                    >
                        <h2 className="text-lg font-bold mb-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                            {isEn ? 'Memorization Guide' : 'دليل التحفيظ'}
                        </h2>
                        <div className="space-y-3 text-xs leading-relaxed opacity-90">
                            {isEn ? (
                                <>
                                    <p>• <span className="font-bold">Ayah Repeat:</span> Number of times to repeat each ayah individually before moving to the next.</p>
                                    <p>• <span className="font-bold">Range Repeat:</span> Number of times to repeat the entire group after finishing it.</p>
                                    <p>• <span className="font-bold">Linked Repeat:</span> Repeats the previous ayah with the current one to link memorization.</p>
                                    <p>• <span className="font-bold">Pause:</span> Silence period after each ayah to give you a chance to recite after the reciter.</p>
                                </>
                            ) : (
                                <>
                                    <p>• <span className="font-bold">تكرار الآية:</span> عدد مرات تكرار كل آية على حدة قبل الانتقال للتالية.</p>
                                    <p>• <span className="font-bold">تكرار النطاق:</span> عدد مرات إعادة المجموعة كاملة بعد الانتهاء منها.</p>
                                    <p>• <span className="font-bold">التكرار المترابط:</span> يقوم بتكرار الآية السابقة مع الحالية لربط الحفظ.</p>
                                    <p>• <span className="font-bold">السكتة:</span> فترة صمت بعد كل آية لتعطيك فرصة للترديد خلف القارئ.</p>
                                </>
                            )}
                        </div>
                        <button 
                            onClick={() => setShowHelpModal(false)} 
                            className="w-full mt-5 py-3 rounded-xl font-bold text-white border-0 cursor-pointer shadow-md" 
                            style={{ backgroundColor: primaryColor, color: btnTextColor }}
                        >
                            {isEn ? 'Got it' : 'فهمت'}
                        </button>
                    </div>
                </div>
            )}

            {/* Explanation Modal */}
            {showExplanationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowExplanationModal(false)}>
                    <div 
                        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter ${isEn ? 'text-left' : 'text-right'} bg-white dark:bg-zinc-900 border-0`} 
                        onClick={e => e.stopPropagation()} 
                        style={{ color: 'var(--text-color)' }}
                    >
                        <h2 className="text-lg font-bold mb-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                            {isEn ? 'Linked Repeat' : 'التكرار المترابط'}
                        </h2>
                        <p className="text-xs leading-relaxed mb-5 opacity-90">
                            {isEn 
                                ? 'This feature helps you link verses together. When enabled, the app will play the previous ayah once before repeating the current ayah, establishing verse sequence in your memory.' 
                                : 'هذه الميزة تساعدك على ربط الآيات ببعضها. عند تفعيلها، سيقوم التطبيق بتشغيل الآية السابقة مرة واحدة قبل البدء بتكرار الآية الحالية، مما يرسخ تسلسل الآيات في ذاكرتك.'}
                        </p>
                        <button 
                            onClick={() => setShowExplanationModal(false)} 
                            className="w-full py-3 rounded-xl font-bold text-white border-0 cursor-pointer shadow-md" 
                            style={{ backgroundColor: primaryColor, color: btnTextColor }}
                        >
                            {isEn ? 'Close' : 'إغلاق'}
                        </button>
                    </div>
                </div>
            )}

            {/* Resume Session Modal */}
            {showResumePrompt && savedSession && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div 
                        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter text-center bg-white dark:bg-zinc-900 border-0" 
                        onClick={e => e.stopPropagation()} 
                        style={{ color: 'var(--text-color)' }}
                    >
                        <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ backgroundColor: hexToRgba(primaryColor, 0.12), color: primaryColor }}
                        >
                            <Play size={28} fill="currentColor" />
                        </div>
                        <h2 className="text-lg font-bold mb-2">
                            {isEn ? 'Previous Session Available' : 'جلسة سابقة متوفرة'}
                        </h2>
                        <p className="opacity-70 mb-5 text-xs leading-relaxed">
                            {isEn 
                                ? `A previous memorization session was found at ${getSurahName(savedSession.currentAyah.s)} Ayah ${savedSession.currentAyah.a}. Would you like to continue from where you left off or start over?`
                                : `تم العثور على جلسة تحفيظ سابقة عند سورة ${SURAH_NAMES_AR[savedSession.currentAyah.s - 1]} الآية ${savedSession.currentAyah.a}. هل تود الاستمرار من حيث توقفت أم البدء من جديد؟`}
                        </p>
                        <div className="space-y-2.5">
                            <button 
                                onClick={resumeSession}
                                className="w-full py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform border-0 cursor-pointer"
                                style={{ backgroundColor: primaryColor, color: btnTextColor }}
                            >
                                {isEn ? 'Continue Session' : 'الاستمرار في الجلسة'}
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('memorization_session_v1');
                                    setSavedSession(null);
                                    setShowResumePrompt(false);
                                    startNewSession();
                                }}
                                className="w-full py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-xl font-bold text-xs opacity-80 active:scale-95 transition-transform border-0 cursor-pointer"
                                style={{ color: 'var(--text-color)' }}
                            >
                                {isEn ? 'Start Over' : 'البدء من جديد'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reader Picker Modal */}
            {activePicker === 'reader' && (
                <div style={{
                    '--qr-bg': theme.bgColor || '#0D1B2A',
                    '--qr-text': theme.textColor,
                    '--qr-card-bg': isBlackTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
                    '--qr-card-text': theme.textColor,
                    '--qr-card-border': 'transparent',
                    '--qr-accent': primaryColor,
                    '--qr-accent-text': btnTextColor,
                    '--qr-modal-bg': theme.bgColor || '#0D1B2A',
                    '--qr-modal-text': theme.textColor
                } as React.CSSProperties}>
                    <ReciterSelectModal
                        onClose={() => setActivePicker(null)}
                        currentReader={selectedReader}
                        onSelect={(id) => { setSelectedReader(id); setSavedSession(null); setActivePicker(null); }}
                        isLandscape={window.innerWidth > window.innerHeight}
                        readersList={MEMORIZATION_READERS}
                        hideHeader={true}
                    />
                </div>
            )}

            {/* Custom Picker Modal (Surah, Ayah, Counts) */}
            {activePicker && activePicker !== 'reader' && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn" onClick={() => setActivePicker(null)}>
                    <div 
                        className="w-full max-w-[300px] rounded-[2rem] p-4 shadow-2xl animate-modal-enter flex flex-col max-h-[75vh] bg-white dark:bg-zinc-900 border-0" 
                        onClick={e => e.stopPropagation()} 
                        style={{ color: 'var(--text-color)' }}
                    >
                        <div className={`flex-1 overflow-y-auto scrollbar-hide space-y-2 p-1 ${isEn ? 'text-left' : 'text-right'}`} dir={isEn ? 'ltr' : 'rtl'}>
                            {(activePicker === 'fromSurah' || activePicker === 'toSurah') && (isEn ? SURAH_NAMES_EN : SURAH_NAMES_AR).map((name, i) => {
                                const surahNum = i + 1;
                                const current = activePicker === 'fromSurah' ? fromSurah : toSurah;
                                const isSelected = current === surahNum;
                                return (
                                    <button
                                        key={i}
                                        id={`surah-btn-${surahNum}`}
                                        onClick={() => {
                                            if (activePicker === 'fromSurah') {
                                                setFromSurah(surahNum);
                                                setFromAyah(1);
                                                if (surahNum > toSurah) {
                                                    setToSurah(surahNum);
                                                    setToAyah(1);
                                                }
                                            } else {
                                                setToSurah(surahNum);
                                                setToAyah(getAyahsCount(surahNum));
                                            }
                                            setSavedSession(null);
                                            setActivePicker(null);
                                        }}
                                        className={`w-full p-2.5 rounded-xl font-bold transition-all flex items-center justify-between cursor-pointer border-0 ${
                                            isSelected 
                                                ? 'shadow-sm text-white' 
                                                : 'hover:bg-slate-100 dark:hover:bg-zinc-800 opacity-80 hover:opacity-100'
                                        }`}
                                        style={{ 
                                            backgroundColor: isSelected ? primaryColor : 'transparent',
                                            color: isSelected ? btnTextColor : undefined
                                        }}
                                    >
                                        <div className={`flex items-center gap-3 ${isEn ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <span 
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                style={{ 
                                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                                                    color: isSelected ? '#FFFFFF' : 'inherit'
                                                }}
                                            >
                                                {surahNum}
                                            </span>
                                            <span className="text-xs">{isEn ? name : `سورة ${name}`}</span>
                                        </div>
                                    </button>
                                );
                            })}

                            {(activePicker === 'fromAyah' || activePicker === 'toAyah') && (
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: getAyahsCount(activePicker === 'fromAyah' ? fromSurah : toSurah) }).map((_, i) => {
                                        const ayahNum = i + 1;
                                        const current = activePicker === 'fromAyah' ? fromAyah : toAyah;
                                        const isSelected = current === ayahNum;
                                        return (
                                            <button
                                                key={i}
                                                id={`ayah-btn-${ayahNum}`}
                                                onClick={() => {
                                                    if (activePicker === 'fromAyah') setFromAyah(ayahNum);
                                                    else setToAyah(ayahNum);
                                                    setSavedSession(null);
                                                    setActivePicker(null);
                                                }}
                                                className={`aspect-square flex items-center justify-center rounded-xl font-bold transition-all text-xs cursor-pointer border-0 ${
                                                    isSelected 
                                                        ? 'shadow-sm text-white' 
                                                        : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 opacity-80'
                                                }`}
                                                style={{ 
                                                    backgroundColor: isSelected ? primaryColor : undefined,
                                                    color: isSelected ? btnTextColor : undefined
                                                }}
                                            >
                                                {ayahNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {(activePicker === 'range' || activePicker === 'ayah' || activePicker === 'pause') && (
                                <div className="grid grid-cols-2 gap-2.5">
                                    {Array.from({ length: 10 }).map((_, i) => {
                                        const val = i + 1;
                                        const isSelected = (activePicker === 'range' ? rangeRepeat : activePicker === 'ayah' ? ayahRepeat : pauseLength) === val;
                                        return (
                                            <button 
                                                key={i}
                                                onClick={() => {
                                                    if (activePicker === 'range') setRangeRepeat(val);
                                                    else if (activePicker === 'ayah') setAyahRepeat(val);
                                                    else if (activePicker === 'pause') setPauseLength(val);
                                                    setActivePicker(null);
                                                }}
                                                className={`py-3.5 flex items-center justify-center rounded-2xl font-bold transition-all active:scale-95 text-base border-0 cursor-pointer ${
                                                    isSelected 
                                                        ? 'shadow-md text-white' 
                                                        : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200'
                                                }`}
                                                style={{ 
                                                    backgroundColor: isSelected ? primaryColor : undefined,
                                                    color: isSelected ? btnTextColor : 'var(--text-color)'
                                                }}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showDownloadModal && (
                <QuranDownloadModal 
                    onClose={() => setShowDownloadModal(false)} 
                    quranData={quranData.data} 
                    showToast={showToast} 
                    isLandscape={false} 
                    readersList={MEMORIZATION_READERS}
                />
            )}
            {toast.show && <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />}

            {/* Interactive Spotlight Guides */}
            <CommunitySpotlightGuide
                guideKey="memorization_setup_tour"
                steps={MEMORIZATION_SETUP_STEPS}
                isOpen={showSetupTour && activeTab === 'setup'}
                onClose={() => setShowSetupTour(false)}
                isEn={isEn}
            />

            <CommunitySpotlightGuide
                guideKey="memorization_review_tour"
                steps={MEMORIZATION_REVIEW_STEPS}
                isOpen={showReviewTour && activeTab === 'review'}
                onClose={() => setShowReviewTour(false)}
                isEn={isEn}
            />
        </div>
    );
};

export default Memorization;
