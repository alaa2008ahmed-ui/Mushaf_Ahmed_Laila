import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Repeat, Play, User, ArrowLeftRight, CheckSquare, Minus, Plus, BookOpen, Calendar, List, Trophy, Trash2, RotateCcw, Download } from 'lucide-react';
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
    const cardBorderColor = isDefaultTheme 
      ? '#000000' 
      : (isBlackTheme 
          ? '#FFFFFF' 
          : (theme.palette?.[0] || theme.accent || '#000000'));
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.accent || (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));
    const btnTextColor = isBlackTheme ? '#000000' : (theme.btnText || (isBlackAndWhite ? '#000000' : '#FFFFFF'));
    
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

    const NumberPicker = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
        <div className="flex items-center gap-1">
            <div 
                onClick={() => setActivePicker(label as any)}
                className="flex flex-col items-center justify-center min-w-[80px] h-11 rounded-2xl shadow-sm border cursor-pointer hover:bg-black/5 transition-all active:scale-95" 
                style={{ backgroundColor: theme.bgColor, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <span className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{value}</span>
                <span className="text-[10px] opacity-60" style={{ color: 'var(--text-color)' }}>{isEn ? 'times' : 'مرة'}</span>
            </div>
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
        <div className="h-screen flex flex-col bg-transparent" dir={isEn ? 'ltr' : 'rtl'} style={{ fontFamily: theme.font, color: 'var(--text-color)' }}>
            <div className="relative z-10 flex flex-col h-full">
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
                                    <HelpCircle size={20} />
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

                <main id="memorization-scroll-container" className="flex-1 overflow-y-auto p-3 space-y-4 hide-scrollbar relative z-10">
                    {/* Tabs */}
                    <div id="memorization-tabs-container" className="flex p-1 rounded-2xl bg-black/5 border mb-2" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <button 
                            onClick={() => setActiveTab('setup')}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'setup' ? 'shadow-md' : 'opacity-60'}`}
                            style={{ 
                                backgroundColor: activeTab === 'setup' ? primaryColor : 'transparent',
                                color: activeTab === 'setup' ? btnTextColor : 'var(--text-color)'
                            }}
                        >
                            <BookOpen size={16} />
                            {isEn ? 'Memorization Setup' : 'إعداد الحفظ'}
                        </button>
                        <button 
                            onClick={() => {
                                setActiveTab('review');
                                setDismissedLocally(true);
                                markPageAsSeen('memorization_review_tab');
                            }}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 relative ${activeTab === 'review' ? 'shadow-md' : 'opacity-60'}`}
                            style={{ 
                                backgroundColor: activeTab === 'review' ? primaryColor : 'transparent',
                                color: activeTab === 'review' ? btnTextColor : 'var(--text-color)'
                            }}
                        >
                            {showNewBadge && (
                                <div className={`absolute -top-2.5 ${isEn ? '-right-1' : '-left-1'} bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-20 shadow-md border border-white animate-bounce pointer-events-none scale-75 origin-top`}>
                                    {isEn ? 'New' : 'جديد'}
                                </div>
                            )}
                            <Calendar size={16} />
                            <span>{isEn ? 'Review Schedule' : 'جدول المراجعة'}</span>
                            {memorizedRanges.length > 0 && (
                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {memorizedRanges.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'setup' ? (
                        <>
                            {/* Reader Selection */}
                            <div className="space-y-1" id="reader-select-container">
                                <div className="flex items-center justify-start gap-2 font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                                    <User size={18} />
                                    <span>{isEn ? 'Select Reciter' : 'اختر اسم القارئ'}</span>
                                </div>
                                <div className="relative">
                                    <div 
                                        onClick={() => setActivePicker('reader')}
                                        className={`w-full p-4 rounded-2xl cursor-pointer ${isEn ? 'text-left' : 'text-right'} font-medium text-sm shadow-sm border flex items-center justify-between`}
                                        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                    >
                                        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                        <span>{getReciterDisplayName(selectedReader, MEMORIZATION_READERS.find(r => r.id === selectedReader)?.name, language)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ayah Range */}
                            <div className="space-y-1" id="ayah-range-container">
                                <div className="flex items-center justify-start gap-2 font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                                    <ArrowLeftRight size={18} />
                                    <span>{isEn ? 'Ayah Range' : 'نطاق الآيات'}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                    {/* From */}
                                    <div className="flex-1 p-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                        <div className="text-center font-bold mb-1 text-xs" style={{ color: 'var(--text-color)' }}>
                                            {isEn ? 'From' : 'من'}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="relative">
                                                <div 
                                                    onClick={() => setActivePicker('fromSurah')}
                                                    className="w-full p-3 border rounded-lg cursor-pointer text-center font-bold shadow-sm text-xs transition-colors hover:bg-black/5"
                                                    style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                                >
                                                    {getSurahName(fromSurah)}
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <div 
                                                    onClick={() => setActivePicker('fromAyah')}
                                                    className="w-full p-3 border rounded-lg cursor-pointer text-center font-bold shadow-sm text-xs transition-colors hover:bg-black/5"
                                                    style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                                >
                                                    {isEn ? `Ayah ${fromAyah}` : `آية ${fromAyah}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* To */}
                                    <div className="flex-1 p-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                        <div className="text-center font-bold mb-1 text-xs" style={{ color: 'var(--text-color)' }}>
                                            {isEn ? 'To' : 'إلى'}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="relative">
                                                <div 
                                                    onClick={() => setActivePicker('toSurah')}
                                                    className="w-full p-3 border rounded-lg cursor-pointer text-center font-bold shadow-sm text-xs transition-colors hover:bg-black/5"
                                                    style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                                >
                                                    {getSurahName(toSurah)}
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <div 
                                                    onClick={() => setActivePicker('toAyah')}
                                                    className="w-full p-3 border rounded-lg cursor-pointer text-center font-bold shadow-sm text-xs transition-colors hover:bg-black/5"
                                                    style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                                >
                                                    {isEn ? `Ayah ${toAyah}` : `آية ${toAyah}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Repetition Settings */}
                            <div id="repetition-settings-container" className="space-y-2">
                                <div className="flex items-center justify-start gap-2 font-bold text-base" style={{ color: 'var(--text-color)' }}>
                                    <Repeat size={20} />
                                    <span>{isEn ? 'Repetition Settings' : 'إعدادات التكرار'}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {/* Range Repeat */}
                                    <div className="flex items-center justify-between p-1 px-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                        <span className="font-bold text-[10px] leading-tight" style={{ color: 'var(--text-color)' }}>
                                            {isEn ? 'Range Repeat' : 'تكرار النطاق'}
                                        </span>
                                        <NumberPicker value={rangeRepeat} onChange={(v) => { setRangeRepeat(v); setSavedSession(null); }} label="range" />
                                    </div>

                                    {/* Ayah Repeat */}
                                    <div className="flex items-center justify-between p-1 px-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                        <span className="font-bold text-[10px] leading-tight" style={{ color: 'var(--text-color)' }}>
                                            {isEn ? 'Ayah Repeat' : 'تكرار الآية'}
                                        </span>
                                        <NumberPicker value={ayahRepeat} onChange={(v) => { setAyahRepeat(v); setSavedSession(null); }} label="ayah" />
                                    </div>

                                    {/* Linked Repeat */}
                                    <div className="flex items-center justify-between p-1 px-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold text-[10px] leading-tight" style={{ color: 'var(--text-color)' }}>
                                                {isEn ? 'Linked Repeat' : 'ربط الآيات'}
                                            </span>
                                            <button 
                                                onClick={() => setShowExplanationModal(true)}
                                                className="text-[8px] opacity-60 flex items-center gap-0.5" 
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                {isEn ? 'Explanation' : 'توضيح'} <Play size={8} />
                                            </button>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer scale-90">
                                            <input type="checkbox" className="sr-only peer" checked={linkedRepeat} onChange={(e) => { setLinkedRepeat(e.target.checked); setSavedSession(null); }} />
                                            <div 
                                                className={`w-8 h-4.5 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:-translate-x-3.5 peer-checked:after:border-white ${linkedRepeat ? (isBlackTheme ? 'bg-white' : (theme.accent ? 'opacity-100' : 'bg-emerald-500')) : 'bg-gray-400'}`}
                                                style={linkedRepeat && !isBlackTheme ? { backgroundColor: primaryColor } : {}}
                                            ></div>
                                        </label>
                                    </div>

                                    {/* Pause Length */}
                                    <div className="flex items-center justify-between p-1 px-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                        <span className="font-bold text-[10px] leading-tight" style={{ color: 'var(--text-color)' }}>
                                            {isEn ? 'Pause' : 'السكتة'}
                                        </span>
                                        <NumberPicker value={pauseLength} onChange={(v) => { setPauseLength(v); setSavedSession(null); }} label="pause" />
                                    </div>
                                </div>
                            </div>

                            {/* Test After Session */}
                            <div id="test-after-session-container" className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                <div className="flex items-center gap-2 font-bold text-base" style={{ color: theme.textColor }}>
                                    <CheckSquare size={20} />
                                    <span>{isEn ? 'Test After Session' : 'اختبار بعد الجلسة'}</span>
                                    <HelpCircle 
                                        size={16} 
                                        onClick={() => setShowHelpModal(true)} 
                                        className="cursor-pointer hover:scale-110 transition-transform" 
                                        style={{ color: theme.btnBg || theme.palette[0] }} 
                                    />
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={testAfterSession} onChange={(e) => { setTestAfterSession(e.target.checked); setSavedSession(null); }} />
                                    <div 
                                        className={`w-9 h-5 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:-translate-x-full peer-checked:after:border-white ${testAfterSession ? (isBlackTheme ? 'bg-white' : (theme.accent ? 'opacity-100' : 'bg-emerald-500')) : 'bg-gray-300'}`}
                                        style={testAfterSession && !isBlackTheme ? { backgroundColor: primaryColor } : {}}
                                    ></div>
                                </label>
                            </div>

                            {/* Start Button */}
                            {activeTab === 'setup' && (
                                <div className="space-y-3 pt-2">
                                    <button 
                                        id="btn-start-memorization"
                                        onClick={handleStart}
                                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 ring-4`}
                                        style={{
                                             backgroundColor: primaryColor,
                                             borderColor: (isBlackAndWhite ? '#E5E5E5' : theme.palette[1] || primaryColor),
                                             color: btnTextColor,
                                             boxShadow: `0 10px 30px -5px ${primaryColor}80`,
                                             '--tw-ring-color': `${primaryColor}33`
                                         } as React.CSSProperties}
                                    >
                                        <Play size={20} fill="currentColor" />
                                        {isEn ? 'Start Memorization Session' : 'ابدأ جلسة التحفيظ'}
                                    </button>

                                    <button 
                                        id="btn-download-reciters"
                                        onClick={() => setShowDownloadModal(true)} 
                                        className="w-full h-12 px-4 flex items-center justify-between transition-all active:scale-[0.98] rounded-2xl border shadow-sm"
                                        style={{ 
                                            backgroundColor: 'var(--card-bg)', 
                                            borderColor: cardBorderColor, 
                                            borderWidth: '1.5px',
                                            borderStyle: 'solid',
                                            color: 'var(--text-color)' 
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBlackTheme ? 'bg-white' : 'bg-emerald-500/10'}`}>
                                                <Download size={18} className={isBlackTheme ? 'text-black' : 'text-emerald-500'} />
                                            </div>
                                            <span className="font-bold text-sm">{isEn ? 'Download Reciters' : 'تحميل القراء'}</span>
                                        </div>
                                        <ArrowRight size={16} className={`rotate-180 opacity-30 ${isEn ? 'rotate-0' : ''}`} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4 animate-fadeIn">
                            {/* Review Stats */}
                            <div id="memorization-review-stats" className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl border text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Trophy size={20} />
                                    </div>
                                    <div className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{memorizedRanges.length}</div>
                                    <div className="text-xs opacity-70" style={{ color: 'var(--text-color)' }}>
                                        {isEn ? 'Memorized Ranges' : 'نطاق تم حفظه'}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                    <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <RotateCcw size={20} />
                                    </div>
                                    <div className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                                        {memorizedRanges.filter(r => (r.nextReviewDate || 0) <= Date.now()).length}
                                    </div>
                                    <div className="text-xs opacity-70" style={{ color: 'var(--text-color)' }}>
                                        {isEn ? 'Pending Review Today' : 'بانتظار المراجعة اليوم'}
                                    </div>
                                </div>
                            </div>

                            {/* Review List */}
                            <div id="memorization-review-list" className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="font-bold text-base" style={{ color: 'var(--text-color)' }}>
                                        {isEn ? 'Your Memorization Review List' : 'قائمة محفوظاتك للمراجعة'}
                                    </h3>
                                    <List size={18} className="opacity-50" />
                                </div>

                                {memorizedRanges.length === 0 ? (
                                    <div id="memorization-review-empty" className="p-8 text-center rounded-3xl border border-dashed space-y-3 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                                        <Calendar size={48} className="mx-auto text-emerald-500/40" />
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
                                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 mt-2"
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
                                                className="p-4 rounded-2xl border space-y-3 relative overflow-hidden shadow-sm transition-all"
                                                style={{ 
                                                    backgroundColor: 'var(--card-bg)', 
                                                    borderColor: isDue ? primaryColor : cardBorderColor, 
                                                    borderWidth: '1.5px',
                                                    borderStyle: 'solid'
                                                }}
                                            >
                                                {isDue && <div className={`absolute top-0 ${isEn ? 'left-0' : 'right-0'} w-1.5 h-full bg-emerald-500`}></div>}
                                                
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                                                            {getSurahName(range.fromSurah)}
                                                        </div>
                                                        <div className="text-xs opacity-70 mt-0.5" style={{ color: 'var(--text-color)' }}>
                                                            {isEn ? `Ayahs: ${range.fromAyah} to ${range.toAyah}` : `الآيات: ${range.fromAyah} إلى ${range.toAyah}`}
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDue ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/10 opacity-70'}`}>
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
                                                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                                                    >
                                                        <Play size={14} />
                                                        {isEn ? 'Start Review & Fixation Session' : 'بدء جلسة المراجعة والتثبيت'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteRange(range.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
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
                    <div className="shrink-0 w-full h-6"></div>
                </main>
            </div>

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowHelpModal(false)}>
                    <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter ${isEn ? 'text-left' : 'text-right'} border`} onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderWidth: '1.5px', borderStyle: 'solid', borderColor: cardBorderColor }}>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2" style={{ borderColor: cardBorderColor }}>
                            {isEn ? 'Memorization Guide' : 'دليل التحفيظ'}
                        </h2>
                        <div className="space-y-4 text-sm leading-relaxed">
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
                        <button onClick={() => setShowHelpModal(false)} className="w-full mt-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: theme.btnBg || primaryColor }}>
                            {isEn ? 'Got it' : 'فهمت'}
                        </button>
                    </div>
                </div>
            )}

            {/* Explanation Modal */}
            {showExplanationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowExplanationModal(false)}>
                    <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter ${isEn ? 'text-left' : 'text-right'} border`} onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderWidth: '1.5px', borderStyle: 'solid', borderColor: cardBorderColor }}>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2" style={{ borderColor: cardBorderColor }}>
                            {isEn ? 'Linked Repeat' : 'التكرار المترابط'}
                        </h2>
                        <p className="text-sm leading-relaxed mb-6">
                            {isEn 
                                ? 'This feature helps you link verses together. When enabled, the app will play the previous ayah once before repeating the current ayah, establishing verse sequence in your memory.' 
                                : 'هذه الميزة تساعدك على ربط الآيات ببعضها. عند تفعيلها، سيقوم التطبيق بتشغيل الآية السابقة مرة واحدة قبل البدء بتكرار الآية الحالية، مما يرسخ تسلسل الآيات في ذاكرتك.'}
                        </p>
                        <button onClick={() => setShowExplanationModal(false)} className="w-full py-3 rounded-xl font-bold text-white" style={{ backgroundColor: theme.btnBg || primaryColor }}>
                            {isEn ? 'Close' : 'إغلاق'}
                        </button>
                    </div>
                </div>
            )}

            {/* Resume Session Modal */}
            {showResumePrompt && savedSession && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter text-center border" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderWidth: '1.5px', borderStyle: 'solid', borderColor: cardBorderColor }}>
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">
                            {isEn ? 'Previous Session Available' : 'جلسة سابقة متوفرة'}
                        </h2>
                        <p className="opacity-70 mb-6 text-sm leading-relaxed">
                            {isEn 
                                ? `A previous memorization session was found at ${getSurahName(savedSession.currentAyah.s)} Ayah ${savedSession.currentAyah.a}. Would you like to continue from where you left off or start over?`
                                : `تم العثور على جلسة تحفيظ سابقة عند سورة ${SURAH_NAMES_AR[savedSession.currentAyah.s - 1]} الآية ${savedSession.currentAyah.a}. هل تود الاستمرار من حيث توقفت أم البدء من جديد؟`}
                        </p>
                        <div className="space-y-3">
                            <button 
                                onClick={resumeSession}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform"
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
                                className="w-full py-3 bg-gray-500/10 hover:bg-gray-500/20 rounded-xl font-bold opacity-70 active:scale-95 transition-transform"
                                style={{ color: 'var(--text-color)' }}
                            >
                                {isEn ? 'Start Over' : 'البدء من جديد'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reader Picker using ReciterSelectModal */}
            {activePicker === 'reader' && (
                <div style={{
                    '--qr-bg': theme.bgColor || '#0D1B2A',
                    '--qr-text': theme.textColor,
                    '--qr-card-bg': isBlackTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
                    '--qr-card-text': theme.textColor,
                    '--qr-card-border': isBlackTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
                    '--qr-accent': isDefaultTheme ? '#000000' : (theme.palette[1] || theme.palette[0]),
                    '--qr-accent-text': '#ffffff',
                    '--qr-modal-bg': theme.bgColor || '#0D1B2A',
                    '--qr-modal-text': theme.textColor
                } as React.CSSProperties}>
                    <ReciterSelectModal
                        onClose={() => setActivePicker(null)}
                        currentReader={selectedReader}
                        onSelect={(id) => { setSelectedReader(id); setSavedSession(null); setActivePicker(null); }}
                        isLandscape={window.innerWidth > window.innerHeight}
                        readersList={MEMORIZATION_READERS}
                    />
                </div>
            )}

            {/* Custom Picker Modal */}
            {activePicker && activePicker !== 'reader' && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn" onClick={() => setActivePicker(null)}>
                    <div className="w-full max-w-[280px] rounded-[2rem] p-4 shadow-2xl animate-modal-enter flex flex-col max-h-[75vh] border" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderWidth: '1.5px', borderStyle: 'solid', borderColor: cardBorderColor }}>
                        <div className={`flex-1 overflow-y-auto scrollbar-hide space-y-2 p-2 ${isEn ? 'text-left' : 'text-right'}`} dir={isEn ? 'ltr' : 'rtl'}>
                            {(activePicker === 'fromSurah' || activePicker === 'toSurah') && (isEn ? SURAH_NAMES_EN : SURAH_NAMES_AR).map((name, i) => {
                                const surahNum = i + 1;
                                const current = activePicker === 'fromSurah' ? fromSurah : toSurah;
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
                                        className={`w-full p-2.5 rounded-xl ${isEn ? 'text-left' : 'text-right'} font-bold transition-all flex items-center justify-between ${current === surahNum ? 'theme-accent-btn text-white' : 'hover:bg-black/5 opacity-70 hover:opacity-100'}`}
                                    >
                                        <div className={`flex items-center gap-3 ${isEn ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] opacity-40 border" style={{ borderColor: 'var(--card-border)' }}>{surahNum}</span>
                                            <span className="text-sm">{isEn ? name : `سورة ${name}`}</span>
                                        </div>
                                    </button>
                                );
                            })}

                            {(activePicker === 'fromAyah' || activePicker === 'toAyah') && (
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: getAyahsCount(activePicker === 'fromAyah' ? fromSurah : toSurah) }).map((_, i) => {
                                        const ayahNum = i + 1;
                                        const current = activePicker === 'fromAyah' ? fromAyah : toAyah;
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
                                                className={`aspect-square flex items-center justify-center rounded-xl font-bold transition-all text-sm border-2 ${current === ayahNum ? 'theme-accent-btn text-white border-transparent' : 'border-current opacity-30 hover:opacity-100 hover:border-emerald-500'}`}
                                            >
                                                {ayahNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {(activePicker === 'range' || activePicker === 'ayah' || activePicker === 'pause') && (
                                <div className="grid grid-cols-2 gap-3">
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
                                                className={`py-4 flex items-center justify-center rounded-2xl border-2 font-bold transition-all active:scale-95 text-lg ${isSelected ? (isDefaultTheme ? 'bg-black text-white border-transparent' : 'theme-accent-btn text-white border-transparent') : ''}`}
                                                style={{ 
                                                    borderColor: isSelected ? 'transparent' : 'var(--card-border)',
                                                    backgroundColor: isSelected ? (isDefaultTheme ? '#000' : 'var(--btn-bg)') : 'transparent',
                                                    color: isSelected ? '#fff' : 'var(--text-color)',
                                                    boxShadow: isSelected ? `0 8px 20px rgba(0,0,0,0.15)` : 'none'
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
