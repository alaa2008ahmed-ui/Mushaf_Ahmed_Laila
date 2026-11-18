import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Trash2, Download, HelpCircle, CheckCircle, Clock, BookOpen, Check, ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ThemePageLock from '../components/ThemePageLock';
import { quranData as quranJsonData } from '../utils/quranData';
import { SURAH_NAMES_AR, MEMORIZATION_READERS } from '../components/QuranReader/constants';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { QuranDownloadModal } from '../components/QuranReader/DownloadModals';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import ToastComponent from '../components/QuranReader/Toast';
import { 
  memorizationService, 
  MemorizedRange, 
  MemorizationStats, 
  MasteryLevel 
} from '../services/memorizationService';
import { 
  getPageRange, 
  getQuarterRange, 
  getAyahsInRange,
  PRESET_MEMORIZATION_PLANS,
  MemorizationPlanItem
} from '../utils/quranMemorizationUtils';
import { getReciterDisplayName } from '../utils/listenQuranTranslations';
import MemorizationPreviewModal from '../components/Memorization/MemorizationPreviewModal';
import MemorizationQuizModal from '../components/Memorization/MemorizationQuizModal';
import { CommunitySpotlightGuide } from '../components/Community/CommunitySpotlightGuide';
import { 
  MEMORIZATION_SETUP_STEPS, 
  MEMORIZATION_PLANS_STEPS, 
  MEMORIZATION_REVIEW_STEPS, 
  MEMORIZATION_QUIZ_STEPS 
} from '../components/Community/communityTourSteps';
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

function hexToRgba(hex: string, alpha: number = 1): string {
    if (!hex) return `rgba(16, 185, 129, ${alpha})`;
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return `rgba(16, 185, 129, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface MemorizationProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

type SelectionMode = 'ayahs' | 'page' | 'quarter';
type ActiveTab = 'setup' | 'plans' | 'review' | 'quiz';

const Memorization: React.FC<MemorizationProps> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.accent || '#10B981');
    const secondaryColor = isBlackTheme ? '#A1A1AA' : (theme.palette?.[1] || '#3B82F6');
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
<<<<<<< HEAD
    const primary3DShadow = isBlackTheme
        ? '0 5px 0 #52525b, 0 10px 18px -2px rgba(0, 0, 0, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.65)'
        : '0 5px 0 rgba(0, 0, 0, 0.22), 0 10px 18px -2px rgba(0, 0, 0, 0.16), inset 0 2px 2px rgba(255, 255, 255, 0.35)';
    const primary3DStyle: React.CSSProperties = {
        backgroundColor: primaryColor,
        color: btnTextColor,
        boxShadow: primary3DShadow
    };
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

    // Tabs
    const [activeTab, setActiveTab] = useState<ActiveTab>('setup');

    // Selection Mode: by ayahs, by page, or by quarter
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('ayahs');
    const [selectedPage, setSelectedPage] = useState<number>(1);
    const [selectedQuarter, setSelectedQuarter] = useState<number>(1);

    // Reader & Repetitions
    const [selectedReader, setSelectedReader] = useState(MEMORIZATION_READERS[1]?.id || 'Abdul_Basit_Murattal_192kbps');
    const [fromSurah, setFromSurah] = useState(1);
    const [fromAyah, setFromAyah] = useState(1);
    const [toSurah, setToSurah] = useState(1);
    const [toAyah, setToAyah] = useState(7);

    const [rangeRepeat, setRangeRepeat] = useState(1);
    const [ayahRepeat, setAyahRepeat] = useState(1);
    const [linkedRepeat, setLinkedRepeat] = useState(false);
    const [isCumulative, setIsCumulative] = useState(false); // 3x3 loop
    const [pauseLength, setPauseLength] = useState(3);
    const [testAfterSession, setTestAfterSession] = useState(true);

    // Data lists
    const [memorizedRanges, setMemorizedRanges] = useState<MemorizedRange[]>([]);
    const [stats, setStats] = useState<MemorizationStats>({
      totalRanges: 0,
      totalAyahsMemorized: 0,
      dueTodayCount: 0,
      streakDays: 0,
      perfectCount: 0,
      goodCount: 0,
      needsWorkCount: 0
    });
    const [userPlans, setUserPlans] = useState<any>({});

    // Modals & Pickers
    const [activePicker, setActivePicker] = useState<'range' | 'ayah' | 'pause' | 'reader' | 'fromSurah' | 'fromAyah' | 'toSurah' | 'toAyah' | 'page' | 'quarter' | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizTargetRange, setQuizTargetRange] = useState<any>(null);
    const [selectedQuizCard, setSelectedQuizCard] = useState<MemorizedRange | null>(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [savedSession, setSavedSession] = useState<any>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    const [showGuide, setShowGuide] = useState(false);

    // Keep screen awake logic (Screen Wake Lock API) throughout Memorization page
    useEffect(() => {
        let wakeLock: any = null;

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await (navigator as any).wakeLock.request('screen');
                }
            } catch (err) {
                // Ignore wake lock error
            }
        };

        requestWakeLock();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLock) {
                wakeLock.release().catch(() => {});
            }
        };
    }, []);

    const getMemorizationSteps = () => {
        switch (activeTab) {
            case 'setup':
                return MEMORIZATION_SETUP_STEPS;
            case 'plans':
                return MEMORIZATION_PLANS_STEPS;
            case 'review':
                return MEMORIZATION_REVIEW_STEPS;
            case 'quiz':
                return MEMORIZATION_QUIZ_STEPS;
            default:
                return MEMORIZATION_SETUP_STEPS;
        }
    };

    const getGuideKey = () => `memorization_spotlight_${activeTab}`;

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    // Load initial data & refresh stats
    const refreshData = () => {
      setMemorizedRanges(memorizationService.getMemorizedRanges());
      setStats(memorizationService.getStats());
      setUserPlans(memorizationService.getUserPlans());
    };

    useEffect(() => {
        refreshData();
        const savedSettings = localStorage.getItem('memorization_settings_v1');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed.reader) setSelectedReader(parsed.reader);
                if (parsed.fromSurah) setFromSurah(parsed.fromSurah);
                if (parsed.fromAyah) setFromAyah(parsed.fromAyah);
                if (parsed.toSurah) setToSurah(parsed.toSurah);
                if (parsed.toAyah) setToAyah(parsed.toAyah);
                if (parsed.rangeRepeat) setRangeRepeat(parsed.rangeRepeat);
                if (parsed.ayahRepeat) setAyahRepeat(parsed.ayahRepeat);
                if (parsed.linkedRepeat !== undefined) setLinkedRepeat(parsed.linkedRepeat);
                if (parsed.isCumulative !== undefined) setIsCumulative(parsed.isCumulative);
                if (parsed.pauseLength !== undefined) setPauseLength(parsed.pauseLength);
                if (parsed.testAfterSession !== undefined) setTestAfterSession(parsed.testAfterSession);
            } catch (e) {}
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
    }, []);

    // Save settings on change
    useEffect(() => {
        const payload = {
            reader: selectedReader,
            fromSurah,
            fromAyah,
            toSurah,
            toAyah,
            rangeRepeat,
            ayahRepeat,
            linkedRepeat,
            isCumulative,
            pauseLength,
            testAfterSession
        };
        localStorage.setItem('memorization_settings_v1', JSON.stringify(payload));
    }, [selectedReader, fromSurah, fromAyah, toSurah, toAyah, rangeRepeat, ayahRepeat, linkedRepeat, isCumulative, pauseLength, testAfterSession]);

    // Back Interceptor
    useEffect(() => {
        const interceptor = () => {
            if (showPreviewModal) { setShowPreviewModal(false); return true; }
            if (showQuizModal) { setShowQuizModal(false); return true; }
            if (showResumePrompt) { setShowResumePrompt(false); return true; }
            if (activePicker) { setActivePicker(null); return true; }
            if (showDownloadModal) { setShowDownloadModal(false); return true; }
            return false;
        };
        return registerBackInterceptor(interceptor);
    }, [showPreviewModal, showQuizModal, showResumePrompt, activePicker, showDownloadModal]);

    // Update range when Page changes
    const handlePageSelect = (pageNum: number) => {
        setSelectedPage(pageNum);
        const b = getPageRange(pageNum);
        setFromSurah(b.start.s);
        setFromAyah(b.start.a);
        setToSurah(b.end.s);
        setToAyah(b.end.a);
        setActivePicker(null);
    };

    // Update range when Quarter changes
    const handleQuarterSelect = (qNum: number) => {
        setSelectedQuarter(qNum);
        const b = getQuarterRange(qNum);
        setFromSurah(b.start.s);
        setFromAyah(b.start.a);
        setToSurah(b.end.s);
        setToAyah(b.end.a);
        setActivePicker(null);
    };

    const getAyahsCount = (surahNum: number) => {
        return quranJsonData.surahs[surahNum - 1]?.ayahs.length || 0;
    };

    const getSurahName = (num: number) => {
        return isEn ? (SURAH_NAMES_EN[num - 1] || `Surah ${num}`) : (SURAH_NAMES_AR[num - 1] || `سورة ${num}`);
    };

    // Launch Dedicated Quran Memorization Studio
    const startMemorizationSession = (customParams?: any) => {
        const sessionSettings = {
            reader: selectedReader,
            fromSurah: customParams?.fromSurah || fromSurah,
            fromAyah: customParams?.fromAyah || fromAyah,
            toSurah: customParams?.toSurah || toSurah,
            toAyah: customParams?.toAyah || toAyah,
            rangeRepeat: customParams?.rangeRepeat || rangeRepeat,
            ayahRepeat: customParams?.ayahRepeat || ayahRepeat,
            linkedRepeat: customParams?.linkedRepeat !== undefined ? customParams.linkedRepeat : linkedRepeat,
            isCumulative: customParams?.isCumulative !== undefined ? customParams.isCumulative : isCumulative,
            pauseLength: customParams?.pauseLength !== undefined ? customParams.pauseLength : pauseLength,
            testAfterSession: customParams?.testAfterSession !== undefined ? customParams.testAfterSession : testAfterSession,
            rangeId: customParams?.rangeId
        };

        // Automatically record range in review schedule
        memorizationService.saveRange({
            fromSurah: sessionSettings.fromSurah,
            fromAyah: sessionSettings.fromAyah,
            toSurah: sessionSettings.toSurah,
            toAyah: sessionSettings.toAyah,
            readerId: sessionSettings.reader
        });
        refreshData();

        onNavigate('memorization-session', { memorizationSettings: sessionSettings });
    };

    const handleDeleteRange = (id: string) => {
        memorizationService.deleteRange(id);
        refreshData();
        showToast(isEn ? 'Removed from review schedule' : 'تم الحذف من جدول المراجعة');
    };

    const handleToggleMastery = (id: string) => {
        const updated = memorizationService.toggleMasteryStatus(id);
        refreshData();
        if (updated?.isMastered) {
            showToast(isEn ? 'Marked as Fully Mastered! (Saved in your mastered treasury)' : 'تم تأكيد ورسوخ الحفظ بنجاح! تم نقله للمحفوظات الراسخة');
        } else {
            showToast(isEn ? 'Returned to active review schedule' : 'تمت الإعادة لجدول المراجعة النشط');
        }
    };

    const handleStartPlan = (plan: MemorizationPlanItem) => {
        memorizationService.startPlan(plan.id);
        refreshData();
        showToast(isEn ? `Enrolled in ${plan.titleEn}` : `تم بدء خطة: ${plan.titleAr}`);
        
        // Start day 1 session
        startMemorizationSession({
            fromSurah: plan.fromSurah,
            fromAyah: plan.fromAyah,
            toSurah: plan.toSurah,
            toAyah: Math.min(plan.toAyah, plan.fromAyah + 10)
        });
    };

    return (
        <div 
            className="h-[100dvh] flex flex-col overflow-hidden" 
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ 
                fontFamily: theme.font, 
                backgroundColor: theme.bgColor || '#F8FAFC', 
                color: 'var(--text-color)' 
            }}
        >
            {/* Top Bar */}
            <header className="app-top-bar shrink-0 relative z-10" style={{ backgroundColor: 'var(--qr-bar-bg)', borderBottom: '1px solid var(--qr-bar-border)' }}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer border-0"
                                title={isEn ? 'Go Back' : 'رجوع للخلف'}
                            >
                                <ArrowRight size={20} className={isEn ? 'rotate-180' : ''} />
                            </button>
                        </div>

                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi flex items-center justify-center gap-2 truncate" style={{ color: 'var(--qr-bar-text)' }}>
                                <span>{isEn ? 'Quran Memorization' : 'تحفيظ القرآن الكريم'}</span>
                            </h1>
                        </div>

                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <ThemePageLock />
                            <button
                                id="memorization-guide-btn"
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer border-0"
                                title={isEn ? 'Memorization Guide' : 'إرشادات قسم التحفيظ'}
                                aria-label="Memorization Guide"
                            >
                                <HelpCircle size={20} />
                            </button>
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer border-0"
                                title={isEn ? 'Home Page' : 'الصفحة الرئيسية'}
                            >
                                <i className="fa-solid fa-house text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main 
                className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 app-scroll-safe space-y-4 max-w-lg mx-auto w-full hide-scrollbar"
            >
<<<<<<< HEAD
                {/* 1. Modern 3D 4-Tab Sculpted Control matching Tasbeeh */}
                <div id="memorization-tabs-container" className="grid grid-cols-4 gap-2 pt-0.5">
                    <button 
                        type="button"
                        onClick={() => setActiveTab('setup')}
                        className={`py-2.5 px-1.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer border-0 ${
                            activeTab === 'setup'
                                ? 'active:translate-y-[3px]'
                                : 'app-page-card bg-white dark:bg-[#1E293B] text-slate-700 dark:text-zinc-200'
                        }`}
                        style={activeTab === 'setup' ? primary3DStyle : undefined}
                    >
                        <span className="truncate">{isEn ? 'Setup' : 'إعداد الحفظ'}</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => setActiveTab('plans')}
                        className={`py-2.5 px-1.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer border-0 ${
                            activeTab === 'plans'
                                ? 'active:translate-y-[3px]'
                                : 'app-page-card bg-white dark:bg-[#1E293B] text-slate-700 dark:text-zinc-200'
                        }`}
                        style={activeTab === 'plans' ? primary3DStyle : undefined}
                    >
                        <span className="truncate">{isEn ? 'Plans' : 'الخطط'}</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => setActiveTab('review')}
                        className={`py-2.5 px-1.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border-0 ${
                            activeTab === 'review'
                                ? 'active:translate-y-[3px]'
                                : 'app-page-card bg-white dark:bg-[#1E293B] text-slate-700 dark:text-zinc-200'
                        }`}
                        style={activeTab === 'review' ? primary3DStyle : undefined}
                    >
                        <span className="truncate">{isEn ? 'Review' : 'المراجعة'}</span>
                        {stats.dueTodayCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0"></span>
=======
                {/* 1. Modern 4-Tab Segmented Control (First element at top of page) */}
                <div id="memorization-tabs-container" className="flex p-1.5 rounded-2xl bg-slate-200/60 dark:bg-zinc-800/60 gap-1 shadow-none">
                    <button 
                        onClick={() => setActiveTab('setup')}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer border-0 ${
                            activeTab === 'setup' ? 'shadow-sm text-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ 
                            backgroundColor: activeTab === 'setup' ? primaryColor : 'transparent',
                            color: activeTab === 'setup' ? btnTextColor : undefined
                        }}
                    >
                        <span>{isEn ? 'Setup' : 'إعداد الحفظ'}</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('plans')}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer border-0 ${
                            activeTab === 'plans' ? 'shadow-sm text-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ 
                            backgroundColor: activeTab === 'plans' ? primaryColor : 'transparent',
                            color: activeTab === 'plans' ? btnTextColor : undefined
                        }}
                    >
                        <span>{isEn ? 'Plans' : 'الخطط'}</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('review')}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border-0 ${
                            activeTab === 'review' ? 'shadow-sm text-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ 
                            backgroundColor: activeTab === 'review' ? primaryColor : 'transparent',
                            color: activeTab === 'review' ? btnTextColor : undefined
                        }}
                    >
                        <span>{isEn ? 'Review' : 'المراجعة'}</span>
                        {stats.dueTodayCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                        )}
                    </button>

                    <button 
<<<<<<< HEAD
                        type="button"
                        onClick={() => setActiveTab('quiz')}
                        className={`py-2.5 px-1.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer border-0 ${
                            activeTab === 'quiz'
                                ? 'active:translate-y-[3px]'
                                : 'app-page-card bg-white dark:bg-[#1E293B] text-slate-700 dark:text-zinc-200'
                        }`}
                        style={activeTab === 'quiz' ? primary3DStyle : undefined}
                    >
                        <span className="truncate">{isEn ? 'Testing' : 'الاختبار'}</span>
=======
                        onClick={() => setActiveTab('quiz')}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer border-0 ${
                            activeTab === 'quiz' ? 'shadow-sm text-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ 
                            backgroundColor: activeTab === 'quiz' ? primaryColor : 'transparent',
                            color: activeTab === 'quiz' ? btnTextColor : undefined
                        }}
                    >
                        <span>{isEn ? 'Testing' : 'الاختبار'}</span>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    </button>
                </div>

                {/* 2. Memorization Dashboard Header (لوحة الإنجاز) */}
<<<<<<< HEAD
                <div id="memorization-dashboard-container" className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3">
=======
                <div id="memorization-dashboard-container" className="p-4 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 space-y-3">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm">
                                {isEn ? 'Your Memorization Journey' : 'لوحة الإنجاز'}
                            </h3>
                            <p className="text-[11px] opacity-60">
                                {isEn 
                                  ? `${stats.totalAyahsMemorized} of 6,236 verses mastered` 
                                  : `تم حفظ وتثبيت ${stats.totalAyahsMemorized} آية من أصل 6,236`}
                            </p>
                        </div>

                        {/* Streak Badge */}
                        <div 
<<<<<<< HEAD
                            className="wird-inner-raised flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
=======
                            className="flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}
                        >
                            <span>{stats.streakDays} {isEn ? 'Days' : 'أيام'}</span>
                        </div>
                    </div>

                    {/* Progress Bar of Whole Quran */}
                    <div className="space-y-1">
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-500 shadow-sm"
                                style={{ 
                                    backgroundColor: primaryColor,
                                    width: `${Math.max(1, Math.min(100, (stats.totalAyahsMemorized / 6236) * 100))}%`
                                }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] opacity-60 font-semibold px-0.5">
                            <span>{((stats.totalAyahsMemorized / 6236) * 100).toFixed(1)}% {isEn ? 'Completed' : 'من القرآن الكريم'}</span>
                            <span>{stats.dueTodayCount > 0 ? (isEn ? `${stats.dueTodayCount} due today` : `${stats.dueTodayCount} بانتظار المراجعة اليوم`) : (isEn ? 'All reviewed!' : 'المراجعات مكتملة اليوم')}</span>
                        </div>
                    </div>

                    {/* Breakdown Badges: Mastered vs Active Review */}
                    {memorizedRanges.length > 0 && (
<<<<<<< HEAD
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 dark:border-white/5">
                            <div className="wird-inner-raised p-2.5 rounded-xl bg-emerald-500/10 flex items-center justify-between">
=======
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 truncate">
                                        {isEn ? 'Confirmed Mastered' : 'الحفظ الراسخ المؤكّد'}
                                    </span>
                                </div>
                                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
                                    {memorizedRanges.filter(r => r.isMastered).length}
                                </span>
                            </div>

<<<<<<< HEAD
                            <div className="wird-inner-raised p-2.5 rounded-xl bg-amber-500/10 flex items-center justify-between">
=======
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Clock size={14} className="text-amber-600 shrink-0" />
                                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 truncate">
                                        {isEn ? 'Currently In Review' : 'قيد المراجعة والتثبيت'}
                                    </span>
                                </div>
                                <span className="text-xs font-black text-amber-700 dark:text-amber-300 tabular-nums">
                                    {memorizedRanges.filter(r => !r.isMastered).length}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* TAB 1: SETUP (إعداد الحفظ والتحديد المرن) */}
                {activeTab === 'setup' && (
                    <div className="space-y-4">
                        {/* Flexible Range Selector Modes (آيات / صفحات / أرباع) */}
<<<<<<< HEAD
                        <div id="memorization-selection-mode-container" className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3.5">
                            <div className="flex items-center justify-between gap-2">
=======
                        <div id="memorization-selection-mode-container" className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3">
                            <div className="flex items-center justify-between">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                <span className="font-bold text-xs" style={{ color: primaryColor }}>
                                    <span>{isEn ? 'Select Range Method' : 'طريقة تحديد النطاق'}</span>
                                </span>
                                
<<<<<<< HEAD
                                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setSelectionMode('ayahs')}
                                        className={`px-2.5 py-1.5 rounded-xl transition-all border-0 cursor-pointer ${
                                            selectionMode === 'ayahs'
                                                ? 'font-black active:translate-y-[2px]'
                                                : 'wird-inner-raised bg-white dark:bg-[#0F172A] opacity-75 hover:opacity-100'
                                        }`}
                                        style={selectionMode === 'ayahs' ? primary3DStyle : undefined}
=======
                                <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold">
                                    <button
                                        onClick={() => setSelectionMode('ayahs')}
                                        className={`px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer ${
                                            selectionMode === 'ayahs' ? 'bg-white dark:bg-zinc-700 shadow-sm font-black' : 'opacity-60'
                                        }`}
                                        style={{ color: selectionMode === 'ayahs' ? primaryColor : undefined }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    >
                                        {isEn ? 'Verses' : 'بالآيات'}
                                    </button>
                                    <button
<<<<<<< HEAD
                                        type="button"
                                        onClick={() => setSelectionMode('page')}
                                        className={`px-2.5 py-1.5 rounded-xl transition-all border-0 cursor-pointer ${
                                            selectionMode === 'page'
                                                ? 'font-black active:translate-y-[2px]'
                                                : 'wird-inner-raised bg-white dark:bg-[#0F172A] opacity-75 hover:opacity-100'
                                        }`}
                                        style={selectionMode === 'page' ? primary3DStyle : undefined}
=======
                                        onClick={() => setSelectionMode('page')}
                                        className={`px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer ${
                                            selectionMode === 'page' ? 'bg-white dark:bg-zinc-700 shadow-sm font-black' : 'opacity-60'
                                        }`}
                                        style={{ color: selectionMode === 'page' ? primaryColor : undefined }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    >
                                        {isEn ? 'Page' : 'بالصفحة'}
                                    </button>
                                    <button
<<<<<<< HEAD
                                        type="button"
                                        onClick={() => setSelectionMode('quarter')}
                                        className={`px-2.5 py-1.5 rounded-xl transition-all border-0 cursor-pointer ${
                                            selectionMode === 'quarter'
                                                ? 'font-black active:translate-y-[2px]'
                                                : 'wird-inner-raised bg-white dark:bg-[#0F172A] opacity-75 hover:opacity-100'
                                        }`}
                                        style={selectionMode === 'quarter' ? primary3DStyle : undefined}
=======
                                        onClick={() => setSelectionMode('quarter')}
                                        className={`px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer ${
                                            selectionMode === 'quarter' ? 'bg-white dark:bg-zinc-700 shadow-sm font-black' : 'opacity-60'
                                        }`}
                                        style={{ color: selectionMode === 'quarter' ? primaryColor : undefined }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    >
                                        {isEn ? 'Quarter' : 'بالأرباع'}
                                    </button>
                                </div>
                            </div>

                            {/* Mode A: By Page */}
                            {selectionMode === 'page' && (
<<<<<<< HEAD
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>{isEn ? 'Mushaf Page' : 'صفحة المصحف الشريف'}</span>
                                        <button
                                            type="button"
                                            onClick={() => setActivePicker('page')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 active:translate-y-[2px] transition-all"
                                            style={primary3DStyle}
=======
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>{isEn ? 'Mushaf Page' : 'صفحة المصحف الشريف'}</span>
                                        <button
                                            onClick={() => setActivePicker('page')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer border-0"
                                            style={{ backgroundColor: primaryColor, color: btnTextColor }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                        >
                                            {isEn ? `Page ${selectedPage}` : `صفحة رقم ${selectedPage}`}
                                        </button>
                                    </div>
                                    <div className="text-[11px] opacity-70">
                                        {getSurahName(fromSurah)} ({fromAyah}) ➔ {getSurahName(toSurah)} ({toAyah})
                                    </div>
                                </div>
                            )}

                            {/* Mode B: By Quarter */}
                            {selectionMode === 'quarter' && (
<<<<<<< HEAD
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>{isEn ? 'Hizb Quarter (Rub\')' : 'ربع الحزب'}</span>
                                        <button
                                            type="button"
                                            onClick={() => setActivePicker('quarter')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 active:translate-y-[2px] transition-all"
                                            style={primary3DStyle}
=======
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>{isEn ? 'Hizb Quarter (Rub\')' : 'ربع الحزب'}</span>
                                        <button
                                            onClick={() => setActivePicker('quarter')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer border-0"
                                            style={{ backgroundColor: primaryColor, color: btnTextColor }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                        >
                                            {isEn ? `Quarter ${selectedQuarter}` : `الربع ${selectedQuarter}`}
                                        </button>
                                    </div>
                                    <div className="text-[11px] opacity-70">
                                        {getSurahName(fromSurah)} ({fromAyah}) ➔ {getSurahName(toSurah)} ({toAyah})
                                    </div>
                                </div>
                            )}

                            {/* Mode C: By Surah and Ayah (Always available as primary / custom) */}
<<<<<<< HEAD
                            <div id="memorization-range-picker-container" className="grid grid-cols-2 gap-3">
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 space-y-2.5">
                                    <span className="block text-[10px] font-bold opacity-65 px-1">{isEn ? 'From' : 'من'}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('fromSurah')}
                                        className="app-page-card border-0 w-full py-2.5 px-3 rounded-xl bg-white dark:bg-[#1E293B] text-xs font-bold truncate cursor-pointer text-center"
                                    >
                                        {getSurahName(fromSurah)}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('fromAyah')}
                                        className="app-page-card border-0 w-full py-2.5 px-3 rounded-xl bg-white dark:bg-[#1E293B] text-xs font-bold cursor-pointer text-center"
                                    >
                                        {isEn ? `Ayah ${fromAyah}` : `آية ${fromAyah}`}
                                    </button>
                                </div>

                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 space-y-2.5">
                                    <span className="block text-[10px] font-bold opacity-65 px-1">{isEn ? 'To' : 'إلى'}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('toSurah')}
                                        className="app-page-card border-0 w-full py-2.5 px-3 rounded-xl bg-white dark:bg-[#1E293B] text-xs font-bold truncate cursor-pointer text-center"
                                    >
                                        {getSurahName(toSurah)}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('toAyah')}
                                        className="app-page-card border-0 w-full py-2.5 px-3 rounded-xl bg-white dark:bg-[#1E293B] text-xs font-bold cursor-pointer text-center"
                                    >
                                        {isEn ? `Ayah ${toAyah}` : `آية ${toAyah}`}
                                    </button>
=======
                            <div id="memorization-range-picker-container" className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
                                    <span className="text-[10px] font-bold opacity-60">{isEn ? 'From' : 'من'}</span>
                                    <div 
                                        onClick={() => setActivePicker('fromSurah')}
                                        className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-700/80 text-xs font-bold truncate cursor-pointer shadow-sm text-center"
                                    >
                                        {getSurahName(fromSurah)}
                                    </div>
                                    <div 
                                        onClick={() => setActivePicker('fromAyah')}
                                        className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-700/80 text-xs font-bold cursor-pointer shadow-sm text-center"
                                    >
                                        {isEn ? `Ayah ${fromAyah}` : `آية ${fromAyah}`}
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
                                    <span className="text-[10px] font-bold opacity-60">{isEn ? 'To' : 'إلى'}</span>
                                    <div 
                                        onClick={() => setActivePicker('toSurah')}
                                        className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-700/80 text-xs font-bold truncate cursor-pointer shadow-sm text-center"
                                    >
                                        {getSurahName(toSurah)}
                                    </div>
                                    <div 
                                        onClick={() => setActivePicker('toAyah')}
                                        className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-700/80 text-xs font-bold cursor-pointer shadow-sm text-center"
                                    >
                                        {isEn ? `Ayah ${toAyah}` : `آية ${toAyah}`}
                                    </div>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                </div>
                            </div>

                            {/* Quick Preview & Tafseer Trigger */}
                            <button
<<<<<<< HEAD
                                type="button"
                                onClick={() => setShowPreviewModal(true)}
                                className="app-page-card border-0 w-full py-3 rounded-2xl bg-white dark:bg-[#1E293B] font-bold text-xs flex items-center justify-center cursor-pointer transition-all"
                                style={{ color: isBlackTheme ? '#FFFFFF' : '#059669' }}
=======
                                onClick={() => setShowPreviewModal(true)}
                                className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/40 cursor-pointer active:scale-95 transition-all"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            >
                                <span>{isEn ? 'Preview Verses & Tafseer First' : 'معاينة الآيات وقراءة التفسير الميسر أولاً'}</span>
                            </button>
                        </div>

                        {/* Reciter Selector */}
<<<<<<< HEAD
                        <button 
                            type="button"
                            id="reader-select-container"
                            onClick={() => setActivePicker('reader')}
                            className="app-page-card border-0 w-full p-4 rounded-3xl bg-white dark:bg-[#1E293B] flex items-center justify-between cursor-pointer text-start"
                        >
                            <div>
                                <span className="text-[10px] font-bold opacity-60 block">{isEn ? 'Reciter' : 'القارئ المعلم'}</span>
=======
                        <div 
                            id="reader-select-container"
                            onClick={() => setActivePicker('reader')}
                            className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-between cursor-pointer"
                        >
                            <div>
                                <span className="text-[10px] font-bold opacity-60">{isEn ? 'Reciter' : 'القارئ المعلم'}</span>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                <div className="font-bold text-sm">
                                    {getReciterDisplayName(selectedReader, MEMORIZATION_READERS.find(r => r.id === selectedReader)?.name, language)}
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-left text-xs opacity-40"></i>
<<<<<<< HEAD
                        </button>

                        {/* Repetition Engine Settings */}
                        <div id="repetition-settings-container" className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3">
                            <span className="font-bold text-xs block" style={{ color: primaryColor }}>
=======
                        </div>

                        {/* Repetition Engine Settings */}
                        <div id="repetition-settings-container" className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3">
                            <span className="font-bold text-xs" style={{ color: primaryColor }}>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                <span>{isEn ? 'Repetition & Memorization Rules' : 'إعدادات وقواعد التكرار'}</span>
                            </span>

                            <div className="grid grid-cols-2 gap-2.5">
<<<<<<< HEAD
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold">{isEn ? 'Ayah Repeat' : 'تكرار الآية'}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('ayah')}
                                        className="app-page-card border-0 w-12 h-9 rounded-xl bg-white dark:bg-[#1E293B] font-bold text-xs cursor-pointer"
=======
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                    <span className="text-xs font-bold">{isEn ? 'Ayah Repeat' : 'تكرار الآية'}</span>
                                    <button 
                                        onClick={() => setActivePicker('ayah')}
                                        className="w-12 h-9 rounded-xl bg-white dark:bg-zinc-700 font-bold text-xs shadow-sm cursor-pointer border-0"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    >
                                        {ayahRepeat}×
                                    </button>
                                </div>

<<<<<<< HEAD
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold">{isEn ? 'Range Repeat' : 'تكرار النطاق'}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('range')}
                                        className="app-page-card border-0 w-12 h-9 rounded-xl bg-white dark:bg-[#1E293B] font-bold text-xs cursor-pointer"
=======
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                    <span className="text-xs font-bold">{isEn ? 'Range Repeat' : 'تكرار النطاق'}</span>
                                    <button 
                                        onClick={() => setActivePicker('range')}
                                        className="w-12 h-9 rounded-xl bg-white dark:bg-zinc-700 font-bold text-xs shadow-sm cursor-pointer border-0"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    >
                                        {rangeRepeat}×
                                    </button>
                                </div>

<<<<<<< HEAD
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold">{isEn ? 'Recitation Pause' : 'سكتة الترديد'}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('pause')}
                                        className="app-page-card border-0 px-2.5 h-9 min-w-[3rem] rounded-xl bg-white dark:bg-[#1E293B] font-bold text-xs cursor-pointer"
=======
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                    <span className="text-xs font-bold">{isEn ? 'Recitation Pause' : 'سكتة الترديد'}</span>
                                    <button 
                                        onClick={() => setActivePicker('pause')}
                                        className="px-2.5 h-9 min-w-[3rem] rounded-xl bg-white dark:bg-zinc-700 font-bold text-xs shadow-sm cursor-pointer border-0"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    >
                                        {pauseLength === 0 ? (isEn ? '0 (Off)' : '0 (مستمر)') : `${pauseLength}s`}
                                    </button>
                                </div>

                                <div 
<<<<<<< HEAD
                                    className="wird-inner-raised border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/80 flex items-center justify-between cursor-pointer active:translate-y-[2px]"
=======
                                    className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between cursor-pointer"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    onClick={() => {
                                        const nextVal = !linkedRepeat;
                                        setLinkedRepeat(nextVal);
                                        if (nextVal) setIsCumulative(false);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">{isEn ? 'Linked Repeat' : 'الربط بالسابقة'}</span>
                                        <span className="text-[9px] opacity-60">{isEn ? 'Link with previous verse' : 'تثبيت التسلسل'}</span>
                                    </div>
                                    <input 
                                        type="checkbox"
                                        checked={linkedRepeat}
                                        onChange={e => {
                                            const checked = e.target.checked;
                                            setLinkedRepeat(checked);
                                            if (checked) setIsCumulative(false);
                                        }}
                                        onClick={e => e.stopPropagation()}
                                        className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Cumulative 3x3 Loop Toggle */}
                            <div 
<<<<<<< HEAD
                                className="wird-inner-raised border-0 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-[#0F172A]/80 flex items-center justify-between cursor-pointer active:translate-y-[2px]"
=======
                                className="p-3 rounded-2xl bg-amber-50/70 dark:bg-zinc-800/60 border border-amber-200/50 dark:border-zinc-700/60 flex items-center justify-between cursor-pointer"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                onClick={() => {
                                    const nextVal = !isCumulative;
                                    setIsCumulative(nextVal);
                                    if (nextVal) setLinkedRepeat(false);
                                }}
                            >
                                <div>
                                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                        {isEn ? 'Cumulative 3x3 Loop (Shanqiti)' : 'الحفظ التراكمي الشنقيطي (3×3)'}
                                    </div>
                                    <div className="text-[10px] text-amber-700 dark:text-amber-400">
                                        {isEn ? 'Repeats verses progressively for strong retention' : 'تكرار الآيات تصاعدياً لضمان الرسوخ وعدم التفلت'}
                                    </div>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={isCumulative}
                                    onChange={e => {
                                        const checked = e.target.checked;
                                        setIsCumulative(checked);
                                        if (checked) setLinkedRepeat(false);
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Start Button */}
<<<<<<< HEAD
                        <div className="space-y-3.5 pt-1 pb-2">
                            <button
                                type="button"
                                id="btn-start-memorization"
                                onClick={() => startMemorizationSession()}
                                className="w-full py-4 min-h-[56px] rounded-2xl font-bold text-base flex items-center justify-center active:translate-y-[3px] transition-all cursor-pointer border-0"
                                style={primary3DStyle}
=======
                        <div className="space-y-3 pt-1">
                            <button
                                id="btn-start-memorization"
                                onClick={() => startMemorizationSession()}
                                className="w-full py-4 min-h-[56px] rounded-2xl font-bold text-base shadow-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer border-0"
                                style={{ backgroundColor: primaryColor, color: btnTextColor }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            >
                                <span>{isEn ? 'Start Quran Memorization Session' : 'بدء جلسة تحفيظ القرآن الكريم'}</span>
                            </button>

                            <button
<<<<<<< HEAD
                                type="button"
                                id="btn-download-reciters"
                                onClick={() => setShowDownloadModal(true)}
                                className="app-page-card border-0 w-full py-4 min-h-[52px] rounded-2xl font-bold text-sm bg-white dark:bg-[#1E293B] text-slate-700 dark:text-zinc-200 flex items-center justify-center transition-all cursor-pointer"
=======
                                id="btn-download-reciters"
                                onClick={() => setShowDownloadModal(true)}
                                className="w-full py-4 min-h-[52px] rounded-2xl font-bold text-sm bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-700 shadow-sm transition-all border-0 cursor-pointer active:scale-98"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            >
                                <span className="flex items-center gap-2">
                                    <Download size={18} />
                                    <span>{isEn ? 'Download Audio for Offline Memorization' : 'تحميل التلاوات للحفظ بدون إنترنت'}</span>
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: PLANS (خطط الحفظ المنهجية) */}
                {activeTab === 'plans' && (
<<<<<<< HEAD
                    <div id="memorization-preset-plans-container" className="space-y-3.5 pb-2">
=======
                    <div id="memorization-preset-plans-container" className="space-y-3">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                        <div className="text-xs opacity-70 px-1 font-medium">
                            {isEn 
                              ? 'Select a ready curriculum to follow your daily memorization targets:' 
                              : 'اختر خطة منهجية لترتيب وردك اليومي ومتابعة التزامك:'}
                        </div>

                        {PRESET_MEMORIZATION_PLANS.map(plan => {
                            const progress = userPlans[plan.id];
                            const isEnrolled = Boolean(progress);
                            const completedCount = progress?.completedDays?.length || 0;
                            const percent = Math.round((completedCount / plan.totalDays) * 100);

                            return (
                                <div 
                                    key={plan.id}
<<<<<<< HEAD
                                    className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3"
=======
                                    className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold text-sm">
                                                {isEn ? plan.titleEn : plan.titleAr}
                                            </h4>
                                            <p className="text-xs opacity-70 leading-relaxed mt-0.5">
                                                {isEn ? plan.descriptionEn : plan.descriptionAr}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-[11px] font-bold" style={{ color: primaryColor }}>
                                                <span>{plan.totalDays} {isEn ? 'Days' : 'يوماً'}</span>
                                                {isEnrolled && (
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                                                        {isEn ? `Day ${progress.currentDay}` : `اليوم ${progress.currentDay}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enrolled Progress Bar */}
                                    {isEnrolled && (
                                        <div className="space-y-1 pt-1">
                                            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-300"
                                                    style={{ backgroundColor: primaryColor, width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] opacity-60 font-semibold">
                                                <span>{percent}% {isEn ? 'Completed' : 'مكتمل'}</span>
                                                <span>{completedCount}/{plan.totalDays} {isEn ? 'days' : 'أيام'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action button */}
                                    <button
<<<<<<< HEAD
                                        type="button"
                                        onClick={() => handleStartPlan(plan)}
                                        className="w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center active:translate-y-[3px] transition-all border-0 cursor-pointer"
                                        style={primary3DStyle}
=======
                                        onClick={() => handleStartPlan(plan)}
                                        className="w-full py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center active:scale-95 transition-all border-0 cursor-pointer"
                                        style={{ backgroundColor: primaryColor, color: btnTextColor }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    >
                                        <span>{isEnrolled ? (isEn ? 'Continue Today\'s Target' : 'متابعة ورد اليوم') : (isEn ? 'Start This Plan' : 'البدء في هذه الخطة')}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* TAB 3: REVIEW (جدول المراجعة الذكي SM-2) */}
                {activeTab === 'review' && (
<<<<<<< HEAD
                    <div id="memorization-review-list" className="space-y-3.5 pb-2">
=======
                    <div id="memorization-review-list" className="space-y-3">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                        <div id="memorization-review-stats" className="flex items-center justify-between px-1">
                            <span className="font-bold text-xs opacity-70">
                                {isEn ? 'Spaced Repetition Schedule (SM-2)' : 'جدول التكرار المتباعد الذكي'}
                            </span>
                            <span className="text-[11px] font-bold" style={{ color: primaryColor }}>
                                {memorizedRanges.length} {isEn ? 'Saved Ranges' : 'محفوظات'}
                            </span>
                        </div>

                        {memorizedRanges.length === 0 ? (
<<<<<<< HEAD
                            <div className="app-page-card border-0 p-8 text-center rounded-3xl bg-white dark:bg-[#1E293B] space-y-3">
=======
                            <div className="p-8 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                <h4 className="font-bold text-sm">
                                    {isEn ? 'No ranges in review schedule yet' : 'لا توجد محفوظات في جدول المراجعة بعد'}
                                </h4>
                                <p className="text-xs opacity-60 leading-relaxed max-w-xs mx-auto">
                                    {isEn 
                                      ? 'Any surah or ayah range you memorize will automatically appear here with a calculated smart review date.' 
                                      : 'كل سورة أو نطاق آيات تقوم بحفظه سيظهر هنا تلقائياً مع تاريخ المراجعة الذكي لضمان عدم نسيانه.'}
                                </p>
                            </div>
                        ) : (
                            memorizedRanges.map(range => {
                                const isDue = (range.nextReviewDate || 0) <= Date.now();
<<<<<<< HEAD
=======
                                const mastery = range.masteryLevel || 'good';
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

                                return (
                                    <div 
                                        key={range.id}
<<<<<<< HEAD
                                        className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3"
=======
                                        className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-sm">
                                                    {getSurahName(range.fromSurah)}
                                                </div>
                                                <div className="text-xs opacity-60">
                                                    {isEn ? `Ayahs ${range.fromAyah} to ${range.toAyah}` : `الآيات: ${range.fromAyah} إلى ${range.toAyah}`}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-1.5">
                                                {range.isMastered && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                                        <ShieldCheck size={11} />
                                                        <span>{isEn ? 'Mastered' : 'راسخ مؤكد'}</span>
                                                    </span>
                                                )}
                                                <div 
                                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                                                    style={{
                                                        backgroundColor: isDue ? '#FEE2E2' : '#DCFCE7',
                                                        color: isDue ? '#B91C1C' : '#15803D'
                                                    }}
                                                >
                                                    {isDue ? (isEn ? 'Due Today' : 'مستحق اليوم') : (isEn ? 'Scheduled' : 'مجدول')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1">
                                            <button
<<<<<<< HEAD
                                                type="button"
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                onClick={() => startMemorizationSession({
                                                    fromSurah: range.fromSurah,
                                                    fromAyah: range.fromAyah,
                                                    toSurah: range.toSurah,
                                                    toAyah: range.toAyah,
                                                    reader: range.readerId,
                                                    rangeId: range.id
                                                })}
<<<<<<< HEAD
                                                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center active:translate-y-[2px] transition-all border-0 cursor-pointer"
                                                style={primary3DStyle}
=======
                                                className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center active:scale-95 transition-all border-0 cursor-pointer"
                                                style={{ backgroundColor: primaryColor, color: btnTextColor }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                            >
                                                <span>{isEn ? 'Start Review & Repeat' : 'بدء المراجعة والتكرار'}</span>
                                            </button>

                                            <button
<<<<<<< HEAD
                                                type="button"
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                onClick={() => {
                                                    setQuizTargetRange(range);
                                                    setShowQuizModal(true);
                                                }}
<<<<<<< HEAD
                                                className="app-page-card border-0 px-3 h-10 rounded-xl bg-white dark:bg-[#0F172A] flex items-center justify-center transition-all cursor-pointer text-xs font-bold"
=======
                                                className="px-3 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center active:scale-95 transition-all border-0 cursor-pointer text-xs font-bold"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                title={isEn ? 'Test This Range' : 'اختبار وتثبيت هذا النطاق'}
                                            >
                                                <span>{isEn ? 'Test' : 'اختبار'}</span>
                                            </button>

                                            {/* Confirm Mastery Toggle Button */}
                                            <button
<<<<<<< HEAD
                                                type="button"
                                                onClick={() => handleToggleMastery(range.id)}
                                                className={`px-3 h-10 rounded-xl flex items-center justify-center gap-1 transition-all border-0 cursor-pointer text-xs font-bold ${
                                                    range.isMastered 
                                                        ? 'bg-emerald-500 text-white active:translate-y-[2px]' 
                                                        : 'app-page-card bg-white dark:bg-[#0F172A] text-emerald-700 dark:text-emerald-300'
                                                }`}
                                                style={range.isMastered ? {
                                                    boxShadow: '0 4px 0 #047857, inset 0 1.5px 2px rgba(255,255,255,0.4)'
                                                } : undefined}
=======
                                                onClick={() => handleToggleMastery(range.id)}
                                                className={`px-3 h-10 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all border-0 cursor-pointer text-xs font-bold ${
                                                    range.isMastered 
                                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm' 
                                                        : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                                                }`}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                title={range.isMastered 
                                                    ? (isEn ? 'Marked as Mastered (Click to re-activate regular review)' : 'حفظ راسخ ومؤكد (انقر لإعادته للمراجعة الدورية)')
                                                    : (isEn ? 'Confirm as Fully Mastered' : 'تأكيد الحفظ ورسوخه')}
                                            >
                                                <CheckCircle size={15} />
                                                <span>{range.isMastered ? (isEn ? 'Mastered' : 'مؤكّد') : (isEn ? 'Confirm' : 'تأكيد')}</span>
                                            </button>

                                            <button
<<<<<<< HEAD
                                                type="button"
                                                onClick={() => handleDeleteRange(range.id)}
                                                className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center active:translate-y-[2px] transition-all border-0 cursor-pointer"
                                                style={{
                                                    boxShadow: '0 4px 0 #b91c1c, inset 0 1.5px 1px rgba(255,255,255,0.35)'
                                                }}
=======
                                                onClick={() => handleDeleteRange(range.id)}
                                                className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 flex items-center justify-center active:scale-95 transition-all border-0 cursor-pointer"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                title={isEn ? 'Delete' : 'حذف'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* TAB 4: QUIZ CENTER (مركز الاختبارات الفورية) */}
                {activeTab === 'quiz' && (
<<<<<<< HEAD
                    <div className="space-y-4 pb-2">
                        {/* Quiz Start Card */}
                        <div id="memorization-quiz-mode-container" className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3">
=======
                    <div className="space-y-4">
                        {/* Quiz Start Card */}
                        <div id="memorization-quiz-mode-container" className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            <div>
                                <h3 className="font-bold text-sm">
                                    {isEn ? 'Instant Quran Quiz Center' : 'مركز الاختبار القرآني المباشر'}
                                </h3>
                                <p className="text-xs opacity-60 leading-relaxed mt-1">
                                    {isEn 
                                      ? 'Select a memorized range card from the list below to activate and start the test.' 
                                      : 'اختر بطاقة من محفوظاتك بالأسفل لتفعيل زر بدء الاختبار للنطاق المحدد.'}
                                </p>
                            </div>

                            {/* Selected Card Preview Badge */}
                            {selectedQuizCard && (
<<<<<<< HEAD
                                <div className="wird-inner-raised p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 flex items-center justify-between text-xs font-bold" style={{ color: primaryColor }}>
=======
                                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs font-bold" style={{ color: primaryColor }}>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    <span>
                                        {isEn 
                                          ? `Selected: ${getSurahName(selectedQuizCard.fromSurah)} (${selectedQuizCard.fromAyah}-${selectedQuizCard.toAyah})` 
                                          : `المحدد: ${getSurahName(selectedQuizCard.fromSurah)} (الآيات ${selectedQuizCard.fromAyah} إلى ${selectedQuizCard.toAyah})`}
                                    </span>
                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">
                                        {isEn ? 'Ready' : 'جاهز للاختبار'}
                                    </span>
                                </div>
                            )}

                            {/* Start Button - Disabled until a card is selected */}
                            <button
<<<<<<< HEAD
                                type="button"
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                disabled={!selectedQuizCard}
                                onClick={() => {
                                    if (selectedQuizCard) {
                                        setQuizTargetRange({ 
                                            fromSurah: selectedQuizCard.fromSurah, 
                                            fromAyah: selectedQuizCard.fromAyah, 
                                            toSurah: selectedQuizCard.toSurah, 
                                            toAyah: selectedQuizCard.toAyah,
                                            id: selectedQuizCard.id
                                        });
                                        setShowQuizModal(true);
                                    }
                                }}
                                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all border-0 ${
                                    selectedQuizCard 
<<<<<<< HEAD
                                      ? 'active:translate-y-[3px] cursor-pointer' 
                                      : 'opacity-45 cursor-not-allowed grayscale'
                                }`}
                                style={primary3DStyle}
=======
                                      ? 'shadow-md active:scale-95 cursor-pointer' 
                                      : 'opacity-40 cursor-not-allowed grayscale'
                                }`}
                                style={{ 
                                    backgroundColor: primaryColor, 
                                    color: btnTextColor 
                                }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            >
                                <span>
                                    {selectedQuizCard 
                                      ? (isEn ? 'Start Test for Selected Range' : 'بدء الاختبار للنطاق المحدد حالياً')
                                      : (isEn ? 'Select a Range Card Below First' : 'حدد بطاقة من الأسفل أولاً لبدء الاختبار')}
                                </span>
                            </button>
                        </div>

                        {/* Saved Memorized Ranges List for Quizzes */}
<<<<<<< HEAD
                        <div id="memorization-quick-quizzes-container" className="space-y-2.5">
=======
                        <div id="memorization-quick-quizzes-container" className="space-y-2">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            <div className="flex items-center justify-between px-1">
                                <span className="font-bold text-xs opacity-70">
                                    {isEn ? 'Saved Memorization Ranges' : 'قائمة المحفوظات المتاحة للاختبار'}
                                </span>
                                <span className="text-[11px] font-bold" style={{ color: primaryColor }}>
                                    {memorizedRanges.length} {isEn ? 'Saved' : 'محفوظات'}
                                </span>
                            </div>

                            {memorizedRanges.length === 0 ? (
<<<<<<< HEAD
                                <div className="app-page-card border-0 p-6 text-center rounded-3xl bg-white dark:bg-[#1E293B] space-y-3">
                                    <div
                                        className="app-inner-3d-box border-0 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto bg-white dark:bg-[#0F172A]/90"
                                        style={{ color: primaryColor }}
                                    >
                                        <i className="fa-solid fa-brain text-xl"></i>
                                    </div>
                                    <div className="app-inner-3d-box border-0 p-3.5 rounded-2xl bg-white dark:bg-[#0F172A]/85 space-y-1">
                                        <h4 className="font-bold text-xs">
                                            {isEn ? 'No saved ranges available yet' : 'قائمة الاختبارات فارغة حالياً'}
                                        </h4>
                                        <p className="text-[11px] opacity-70 leading-relaxed max-w-xs mx-auto">
                                            {isEn 
                                              ? 'Go to "Setup" tab, choose your surah/ayah range and start memorizing to add it here automatically.' 
                                              : 'يرجى الانتقال لتبويب "إعداد الحفظ" وتحديد السورة أو الآيات أولاً ليتم حفظها وإدراجها هنا للاختبار.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
=======
                                <div className="p-6 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-2">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto opacity-40 bg-slate-100 dark:bg-zinc-800">
                                        <i className="fa-solid fa-brain text-xl"></i>
                                    </div>
                                    <h4 className="font-bold text-xs">
                                        {isEn ? 'No saved ranges available yet' : 'قائمة الاختبارات فارغة حالياً'}
                                    </h4>
                                    <p className="text-[11px] opacity-60 leading-relaxed max-w-xs mx-auto">
                                        {isEn 
                                          ? 'Go to "Setup" tab, choose your surah/ayah range and start memorizing to add it here automatically.' 
                                          : 'يرجى الانتقال لتبويب "إعداد الحفظ" وتحديد السورة أو الآيات أولاً ليتم حفظها وإدراجها هنا للاختبار.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    {memorizedRanges.map(range => {
                                        const isSelected = selectedQuizCard?.id === range.id;

                                        return (
                                            <div
                                                key={range.id}
                                                onClick={() => setSelectedQuizCard(range)}
<<<<<<< HEAD
                                                className={`app-page-card tasbeeh-pressable border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] transition-all cursor-pointer space-y-2.5 ${
                                                    isSelected 
                                                      ? (isBlackTheme ? 'ring-2 ring-white/80' : 'ring-2 ring-emerald-500')
                                                      : ''
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center border-0 transition-all shrink-0 ${
                                                                isSelected ? '' : 'app-inner-3d-box bg-white dark:bg-[#0F172A]'
                                                            }`}
                                                            style={isSelected ? {
                                                                backgroundColor: isBlackTheme ? '#FFFFFF' : '#10B981',
                                                                color: isBlackTheme ? '#000000' : '#FFFFFF',
                                                                boxShadow: isBlackTheme
                                                                    ? '0 3px 0 #52525b, 0 5px 10px rgba(0, 0, 0, 0.45), inset 0 1.5px 1px rgba(255, 255, 255, 0.6)'
                                                                    : '0 3px 0 #047857, 0 5px 10px rgba(16, 185, 129, 0.28), inset 0 1.5px 1px rgba(255, 255, 255, 0.45)'
                                                            } : undefined}
                                                        >
                                                            {isSelected ? (
                                                                <i className="fa-solid fa-check text-[10px]"></i>
                                                            ) : (
                                                                <span className="w-2 h-2 rounded-full bg-slate-300/70 dark:bg-white/20" />
                                                            )}
=======
                                                className={`p-4 rounded-3xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer space-y-2.5 ${
                                                    isSelected 
                                                      ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md bg-emerald-50/10 dark:bg-emerald-950/10' 
                                                      : 'border-slate-100 dark:border-zinc-800 hover:border-slate-300 shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div 
                                                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                                                isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-zinc-700'
                                                            }`}
                                                        >
                                                            {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xs sm:text-sm">
                                                                {getSurahName(range.fromSurah)}
                                                            </div>
                                                            <div className="text-[11px] opacity-60">
                                                                {isEn ? `Ayahs ${range.fromAyah} to ${range.toAyah}` : `الآيات: ${range.fromAyah} إلى ${range.toAyah}`}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
<<<<<<< HEAD
                                                        type="button"
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedQuizCard(range);
                                                            setQuizTargetRange({
                                                                fromSurah: range.fromSurah,
                                                                fromAyah: range.fromAyah,
                                                                toSurah: range.toSurah,
                                                                toAyah: range.toAyah,
                                                                id: range.id
                                                            });
                                                            setShowQuizModal(true);
                                                        }}
<<<<<<< HEAD
                                                        className="px-3.5 py-2 rounded-xl font-bold text-xs active:translate-y-[2px] transition-all border-0 cursor-pointer"
                                                        style={primary3DStyle}
=======
                                                        className="px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all border-0 cursor-pointer"
                                                        style={{ backgroundColor: primaryColor, color: btnTextColor }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                    >
                                                        <span>{isEn ? 'Start Test' : 'اختبار الآن'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>

            {/* Custom Range / Ayah / Page Pickers Modal */}
            {activePicker && activePicker !== 'reader' && (
                <div 
                    className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn" 
                    onClick={() => setActivePicker(null)}
                >
                    <div 
<<<<<<< HEAD
                        className="app-page-card border-0 w-full max-w-[320px] rounded-[2rem] p-4 animate-modal-enter flex flex-col max-h-[75dvh] bg-white dark:bg-[#1E293B]" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2.5 p-1.5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
=======
                        className="w-full max-w-[320px] rounded-[2rem] p-4 shadow-2xl animate-modal-enter flex flex-col max-h-[75dvh] bg-white dark:bg-zinc-900 border-0" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-1.5 p-1 text-right" dir={isEn ? 'ltr' : 'rtl'}>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            {/* Surah Picker */}
                            {(activePicker === 'fromSurah' || activePicker === 'toSurah') && (
                                (isEn ? SURAH_NAMES_EN : SURAH_NAMES_AR)
                                    .map((name, i) => ({ name, sNum: i + 1 }))
                                    .filter(({ sNum }) => activePicker === 'fromSurah' || sNum >= fromSurah)
                                    .map(({ name, sNum }) => {
                                        const isSelected = (activePicker === 'fromSurah' ? fromSurah : toSurah) === sNum;
<<<<<<< HEAD
                                        return (
                                            <button
                                                type="button"
                                                key={sNum}
                                                onClick={() => {
                                                    if (activePicker === 'fromSurah') {
                                                        setFromSurah(sNum);
                                                        setFromAyah(1);
                                                        setToSurah(sNum);
                                                        setToAyah(getAyahsCount(sNum));
                                                    } else {
                                                        setToSurah(sNum);
                                                        setToAyah(getAyahsCount(sNum));
                                                    }
                                                    setActivePicker(null);
                                                }}
                                                className={`w-full p-2.5 rounded-xl font-bold transition-all flex items-center justify-between cursor-pointer border-0 ${
                                                    isSelected
                                                        ? 'active:translate-y-[2px]'
                                                        : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                }`}
                                                style={isSelected ? primary3DStyle : undefined}
                                            >
                                                <span className="text-xs">{isEn ? name : `سورة ${name}`}</span>
                                                <span className="text-[10px] opacity-60">{sNum}</span>
                                            </button>
                                        );
                                    })
                            )}

                            {/* Ayah Picker */}
                            {(activePicker === 'fromAyah' || activePicker === 'toAyah') && (() => {
                                const targetSurah = activePicker === 'fromAyah' ? fromSurah : toSurah;
                                const totalAyahs = getAyahsCount(targetSurah);
                                const startAyah = (activePicker === 'toAyah' && fromSurah === toSurah) ? fromAyah : 1;
                                const count = Math.max(0, totalAyahs - startAyah + 1);
                                return (
                                    <div className="grid grid-cols-4 gap-2.5 p-0.5">
                                        {Array.from({ length: count }).map((_, i) => {
                                            const aNum = startAyah + i;
                                            const isSelected = (activePicker === 'fromAyah' ? fromAyah : toAyah) === aNum;
                                            return (
                                                <button
                                                    type="button"
                                                    key={aNum}
                                                    onClick={() => {
                                                        if (activePicker === 'fromAyah') {
                                                            setFromAyah(aNum);
                                                            if (fromSurah === toSurah && toAyah < aNum) {
                                                                setToAyah(aNum);
                                                            }
                                                        } else {
                                                            setToAyah(aNum);
                                                        }
                                                        setActivePicker(null);
                                                    }}
                                                    className={`aspect-square flex items-center justify-center rounded-xl font-bold transition-all text-xs cursor-pointer border-0 ${
                                                        isSelected
                                                            ? 'active:translate-y-[2px]'
                                                            : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                    }`}
                                                    style={isSelected ? primary3DStyle : undefined}
                                                >
                                                    {aNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            {/* Page Picker (1 to 604) */}
                            {activePicker === 'page' && (
                                <div className="grid grid-cols-4 gap-2.5 p-0.5">
                                    {Array.from({ length: 604 }).map((_, i) => {
                                        const pNum = i + 1;
                                        const isSelected = selectedPage === pNum;
                                        return (
                                            <button
                                                type="button"
                                                key={i}
                                                onClick={() => handlePageSelect(pNum)}
                                                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-xs cursor-pointer border-0 ${
                                                    isSelected
                                                        ? 'active:translate-y-[2px]'
                                                        : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                }`}
                                                style={isSelected ? primary3DStyle : undefined}
                                            >
=======
                                        return (
                                            <button
                                                key={sNum}
                                                onClick={() => {
                                                    if (activePicker === 'fromSurah') {
                                                        setFromSurah(sNum);
                                                        setFromAyah(1);
                                                        setToSurah(sNum);
                                                        setToAyah(getAyahsCount(sNum));
                                                    } else {
                                                        setToSurah(sNum);
                                                        setToAyah(getAyahsCount(sNum));
                                                    }
                                                    setActivePicker(null);
                                                }}
                                                className={`w-full p-2.5 rounded-xl font-bold transition-all flex items-center justify-between cursor-pointer border-0 ${
                                                    isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'
                                                }`}
                                            >
                                                <span className="text-xs">{isEn ? name : `سورة ${name}`}</span>
                                                <span className="text-[10px] opacity-60">{sNum}</span>
                                            </button>
                                        );
                                    })
                            )}

                            {/* Ayah Picker */}
                            {(activePicker === 'fromAyah' || activePicker === 'toAyah') && (() => {
                                const targetSurah = activePicker === 'fromAyah' ? fromSurah : toSurah;
                                const totalAyahs = getAyahsCount(targetSurah);
                                const startAyah = (activePicker === 'toAyah' && fromSurah === toSurah) ? fromAyah : 1;
                                const count = Math.max(0, totalAyahs - startAyah + 1);
                                return (
                                    <div className="grid grid-cols-4 gap-2">
                                        {Array.from({ length: count }).map((_, i) => {
                                            const aNum = startAyah + i;
                                            const isSelected = (activePicker === 'fromAyah' ? fromAyah : toAyah) === aNum;
                                            return (
                                                <button
                                                    key={aNum}
                                                    onClick={() => {
                                                        if (activePicker === 'fromAyah') {
                                                            setFromAyah(aNum);
                                                            if (fromSurah === toSurah && toAyah < aNum) {
                                                                setToAyah(aNum);
                                                            }
                                                        } else {
                                                            setToAyah(aNum);
                                                        }
                                                        setActivePicker(null);
                                                    }}
                                                    className={`aspect-square flex items-center justify-center rounded-xl font-bold transition-all text-xs cursor-pointer border-0 ${
                                                        isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-zinc-800'
                                                    }`}
                                                >
                                                    {aNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            {/* Page Picker (1 to 604) */}
                            {activePicker === 'page' && (
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: 604 }).map((_, i) => {
                                        const pNum = i + 1;
                                        const isSelected = selectedPage === pNum;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handlePageSelect(pNum)}
                                                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-xs cursor-pointer border-0 ${
                                                    isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-zinc-800'
                                                }`}
                                            >
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                {pNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Quarter Picker (1 to 240) */}
                            {activePicker === 'quarter' && (
<<<<<<< HEAD
                                <div className="grid grid-cols-4 gap-2.5 p-0.5">
=======
                                <div className="grid grid-cols-4 gap-2">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    {Array.from({ length: 240 }).map((_, i) => {
                                        const qNum = i + 1;
                                        const isSelected = selectedQuarter === qNum;
                                        return (
                                            <button
<<<<<<< HEAD
                                                type="button"
                                                key={i}
                                                onClick={() => handleQuarterSelect(qNum)}
                                                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-xs cursor-pointer border-0 ${
                                                    isSelected
                                                        ? 'active:translate-y-[2px]'
                                                        : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                }`}
                                                style={isSelected ? primary3DStyle : undefined}
=======
                                                key={i}
                                                onClick={() => handleQuarterSelect(qNum)}
                                                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-xs cursor-pointer border-0 ${
                                                    isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-zinc-800'
                                                }`}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                            >
                                                {qNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Number Pickers (Repeats, Pause) */}
                            {activePicker === 'pause' && (
<<<<<<< HEAD
                                <div className="grid grid-cols-2 gap-3 p-0.5">
=======
                                <div className="grid grid-cols-2 gap-2.5">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                                        const isSelected = pauseLength === val;
                                        return (
                                            <button
<<<<<<< HEAD
                                                type="button"
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                key={val}
                                                onClick={() => {
                                                    setPauseLength(val);
                                                    setActivePicker(null);
                                                }}
                                                className={`py-3.5 flex items-center justify-center rounded-2xl font-bold transition-all text-sm border-0 cursor-pointer ${
<<<<<<< HEAD
                                                    isSelected
                                                        ? 'active:translate-y-[2px]'
                                                        : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                }`}
                                                style={isSelected ? primary3DStyle : undefined}
=======
                                                    isSelected ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 dark:bg-zinc-800'
                                                }`}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                            >
                                                {val === 0 
                                                    ? (isEn ? '0s (Continuous)' : '0 (مستمر بدون توقف)') 
                                                    : `${val} ${isEn ? 'sec' : 'ثوانٍ'}`}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Range & Ayah Number Pickers */}
                            {(activePicker === 'range' || activePicker === 'ayah') && (
<<<<<<< HEAD
                                <div className="grid grid-cols-2 gap-3 p-0.5">
=======
                                <div className="grid grid-cols-2 gap-2.5">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                    {Array.from({ length: activePicker === 'ayah' ? 20 : 10 }).map((_, i) => {
                                        const val = i + 1;
                                        const isSelected = (activePicker === 'range' ? rangeRepeat : ayahRepeat) === val;
                                        return (
                                            <button
<<<<<<< HEAD
                                                type="button"
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                                key={i}
                                                onClick={() => {
                                                    if (activePicker === 'range') setRangeRepeat(val);
                                                    else if (activePicker === 'ayah') setAyahRepeat(val);
                                                    setActivePicker(null);
                                                }}
                                                className={`py-3.5 flex items-center justify-center rounded-2xl font-bold transition-all text-base border-0 cursor-pointer ${
<<<<<<< HEAD
                                                    isSelected
                                                        ? 'active:translate-y-[2px]'
                                                        : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                }`}
                                                style={isSelected ? primary3DStyle : undefined}
=======
                                                    isSelected ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 dark:bg-zinc-800'
                                                }`}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                                            >
                                                {val}×
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reciter Modal */}
            {activePicker === 'reader' && (
                <ReciterSelectModal
                    onClose={() => setActivePicker(null)}
                    currentReader={selectedReader}
                    onSelect={(id) => { setSelectedReader(id); setActivePicker(null); }}
                    isLandscape={false}
                    readersList={MEMORIZATION_READERS}
                    hideHeader={true}
                />
            )}

            {/* Preview Modal */}
            {showPreviewModal && (
                <MemorizationPreviewModal
                    isOpen={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    onStartSession={() => {
                        setShowPreviewModal(false);
                        startMemorizationSession();
                    }}
                    fromSurah={fromSurah}
                    fromAyah={fromAyah}
                    toSurah={toSurah}
                    toAyah={toAyah}
                    primaryColor={primaryColor}
                    btnTextColor={btnTextColor}
                    isEn={isEn}
                />
            )}

            {/* Quiz Modal */}
            {showQuizModal && (
                <MemorizationQuizModal
                    isOpen={showQuizModal}
                    onClose={() => setShowQuizModal(false)}
                    fromSurah={quizTargetRange?.fromSurah || fromSurah}
                    fromAyah={quizTargetRange?.fromAyah || fromAyah}
                    toSurah={quizTargetRange?.toSurah || toSurah}
                    toAyah={quizTargetRange?.toAyah || toAyah}
                    rangeId={quizTargetRange?.id}
                    primaryColor={primaryColor}
                    btnTextColor={btnTextColor}
                    isEn={isEn}
                    onComplete={() => {
                        refreshData();
                        showToast(isEn ? 'Review recorded successfully!' : 'تم تسجيل نتيجة المراجعة بنجاح!');
                    }}
                />
            )}

            {/* Offline Download Modal */}
            {showDownloadModal && (
                <QuranDownloadModal
                    onClose={() => setShowDownloadModal(false)}
                    quranData={quranJsonData}
                    showToast={showToast}
                    isLandscape={false}
                    readersList={MEMORIZATION_READERS}
                />
            )}

            <CommunitySpotlightGuide
                guideKey={getGuideKey()}
                steps={getMemorizationSteps()}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={isEn}
            />

            {toast.show && <ToastComponent show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />}
        </div>
    );
};

export default Memorization;
