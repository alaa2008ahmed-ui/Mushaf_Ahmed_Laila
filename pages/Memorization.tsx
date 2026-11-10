import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Trash2, Download, HelpCircle
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
    const [ayahRepeat, setAyahRepeat] = useState(3);
    const [linkedRepeat, setLinkedRepeat] = useState(false);
    const [isCumulative, setIsCumulative] = useState(false); // 3x3 loop
    const [pauseLength, setPauseLength] = useState(2);
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
            className="h-screen flex flex-col" 
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
                className="flex-1 overflow-y-auto px-4 py-3 space-y-4 max-w-lg mx-auto w-full hide-scrollbar"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}
            >
                {/* 1. Memorization Dashboard Header */}
                <div id="memorization-dashboard-container" className="p-4 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm">
                                {isEn ? 'Your Memorization Journey' : 'لوحة إنجاز الحافظ'}
                            </h3>
                            <p className="text-[11px] opacity-60">
                                {isEn 
                                  ? `${stats.totalAyahsMemorized} of 6,236 verses mastered` 
                                  : `تم حفظ وتثبيت ${stats.totalAyahsMemorized} آية من أصل 6,236`}
                            </p>
                        </div>

                        {/* Streak Badge */}
                        <div 
                            className="flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
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
                </div>

                {/* 2. Modern 4-Tab Segmented Control */}
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
                        )}
                    </button>

                    <button 
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
                    </button>
                </div>

                {/* TAB 1: SETUP (إعداد الحفظ والتحديد المرن) */}
                {activeTab === 'setup' && (
                    <div className="space-y-4">
                        {/* Flexible Range Selector Modes (آيات / صفحات / أرباع) */}
                        <div id="memorization-selection-mode-container" className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs" style={{ color: primaryColor }}>
                                    <span>{isEn ? 'Select Range Method' : 'طريقة تحديد النطاق'}</span>
                                </span>
                                
                                <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold">
                                    <button
                                        onClick={() => setSelectionMode('ayahs')}
                                        className={`px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer ${
                                            selectionMode === 'ayahs' ? 'bg-white dark:bg-zinc-700 shadow-sm font-black' : 'opacity-60'
                                        }`}
                                        style={{ color: selectionMode === 'ayahs' ? primaryColor : undefined }}
                                    >
                                        {isEn ? 'Verses' : 'بالآيات'}
                                    </button>
                                    <button
                                        onClick={() => setSelectionMode('page')}
                                        className={`px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer ${
                                            selectionMode === 'page' ? 'bg-white dark:bg-zinc-700 shadow-sm font-black' : 'opacity-60'
                                        }`}
                                        style={{ color: selectionMode === 'page' ? primaryColor : undefined }}
                                    >
                                        {isEn ? 'Page' : 'بالصفحة'}
                                    </button>
                                    <button
                                        onClick={() => setSelectionMode('quarter')}
                                        className={`px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer ${
                                            selectionMode === 'quarter' ? 'bg-white dark:bg-zinc-700 shadow-sm font-black' : 'opacity-60'
                                        }`}
                                        style={{ color: selectionMode === 'quarter' ? primaryColor : undefined }}
                                    >
                                        {isEn ? 'Quarter' : 'بالأرباع'}
                                    </button>
                                </div>
                            </div>

                            {/* Mode A: By Page */}
                            {selectionMode === 'page' && (
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>{isEn ? 'Mushaf Page' : 'صفحة المصحف الشريف'}</span>
                                        <button
                                            onClick={() => setActivePicker('page')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer border-0"
                                            style={{ backgroundColor: primaryColor, color: btnTextColor }}
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
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>{isEn ? 'Hizb Quarter (Rub\')' : 'ربع الحزب'}</span>
                                        <button
                                            onClick={() => setActivePicker('quarter')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer border-0"
                                            style={{ backgroundColor: primaryColor, color: btnTextColor }}
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
                                </div>
                            </div>

                            {/* Quick Preview & Tafseer Trigger */}
                            <button
                                onClick={() => setShowPreviewModal(true)}
                                className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/40 cursor-pointer active:scale-95 transition-all"
                            >
                                <span>{isEn ? 'Preview Verses & Tafseer First' : 'معاينة الآيات وقراءة التفسير الميسر أولاً'}</span>
                            </button>
                        </div>

                        {/* Reciter Selector */}
                        <div 
                            id="reader-select-container"
                            onClick={() => setActivePicker('reader')}
                            className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-between cursor-pointer"
                        >
                            <div>
                                <span className="text-[10px] font-bold opacity-60">{isEn ? 'Reciter' : 'القارئ المعلم'}</span>
                                <div className="font-bold text-sm">
                                    {getReciterDisplayName(selectedReader, MEMORIZATION_READERS.find(r => r.id === selectedReader)?.name, language)}
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-left text-xs opacity-40"></i>
                        </div>

                        {/* Repetition Engine Settings */}
                        <div id="repetition-settings-container" className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3">
                            <span className="font-bold text-xs" style={{ color: primaryColor }}>
                                <span>{isEn ? 'Repetition & Memorization Rules' : 'إعدادات وقواعد التكرار'}</span>
                            </span>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                    <span className="text-xs font-bold">{isEn ? 'Ayah Repeat' : 'تكرار الآية'}</span>
                                    <button 
                                        onClick={() => setActivePicker('ayah')}
                                        className="w-12 h-9 rounded-xl bg-white dark:bg-zinc-700 font-bold text-xs shadow-sm cursor-pointer border-0"
                                    >
                                        {ayahRepeat}×
                                    </button>
                                </div>

                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                    <span className="text-xs font-bold">{isEn ? 'Range Repeat' : 'تكرار النطاق'}</span>
                                    <button 
                                        onClick={() => setActivePicker('range')}
                                        className="w-12 h-9 rounded-xl bg-white dark:bg-zinc-700 font-bold text-xs shadow-sm cursor-pointer border-0"
                                    >
                                        {rangeRepeat}×
                                    </button>
                                </div>

                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                    <span className="text-xs font-bold">{isEn ? 'Recitation Pause' : 'سكتة الترديد'}</span>
                                    <button 
                                        onClick={() => setActivePicker('pause')}
                                        className="w-12 h-9 rounded-xl bg-white dark:bg-zinc-700 font-bold text-xs shadow-sm cursor-pointer border-0"
                                    >
                                        {pauseLength}s
                                    </button>
                                </div>

                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">{isEn ? 'Linked Repeat' : 'الربط بالسابقة'}</span>
                                        <span className="text-[9px] opacity-60">{isEn ? 'Link verses' : 'تثبيت التسلسل'}</span>
                                    </div>
                                    <input 
                                        type="checkbox"
                                        checked={linkedRepeat}
                                        onChange={e => setLinkedRepeat(e.target.checked)}
                                        className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Cumulative 3x3 Loop Toggle */}
                            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-zinc-800/60 border border-amber-200/50 dark:border-zinc-700/60 flex items-center justify-between">
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
                                    onChange={e => setIsCumulative(e.target.checked)}
                                    className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Start Button */}
                        <div className="space-y-2 pt-1">
                            <button
                                id="btn-start-memorization"
                                onClick={() => startMemorizationSession()}
                                className="w-full py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer border-0"
                                style={{ backgroundColor: primaryColor, color: btnTextColor }}
                            >
                                <span>{isEn ? 'Enter Quran Memorization Studio' : 'دخول استوديو تحفيظ القرآن الكريم'}</span>
                            </button>

                            <button
                                id="btn-download-reciters"
                                onClick={() => setShowDownloadModal(true)}
                                className="w-full py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all border-0 cursor-pointer"
                            >
                                <span>{isEn ? 'Download Audio for Offline Memorization' : 'تحميل التلاوات للحفظ بدون إنترنت'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: PLANS (خطط الحفظ المنهجية) */}
                {activeTab === 'plans' && (
                    <div id="memorization-preset-plans-container" className="space-y-3">
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
                                    className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3"
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
                                        onClick={() => handleStartPlan(plan)}
                                        className="w-full py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center active:scale-95 transition-all border-0 cursor-pointer"
                                        style={{ backgroundColor: primaryColor, color: btnTextColor }}
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
                    <div id="memorization-review-list" className="space-y-3">
                        <div id="memorization-review-stats" className="flex items-center justify-between px-1">
                            <span className="font-bold text-xs opacity-70">
                                {isEn ? 'Spaced Repetition Schedule (SM-2)' : 'جدول التكرار المتباعد الذكي'}
                            </span>
                            <span className="text-[11px] font-bold" style={{ color: primaryColor }}>
                                {memorizedRanges.length} {isEn ? 'Saved Ranges' : 'محفوظات'}
                            </span>
                        </div>

                        {memorizedRanges.length === 0 ? (
                            <div className="p-8 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3">
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
                                const mastery = range.masteryLevel || 'good';

                                return (
                                    <div 
                                        key={range.id}
                                        className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3"
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
                                            <div 
                                                className="px-3 py-1 rounded-full text-[10px] font-bold"
                                                style={{
                                                    backgroundColor: isDue ? '#FEE2E2' : '#DCFCE7',
                                                    color: isDue ? '#B91C1C' : '#15803D'
                                                }}
                                            >
                                                {isDue ? (isEn ? 'Due Today' : 'مستحق اليوم') : (isEn ? 'Scheduled' : 'مجدول')}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                onClick={() => startMemorizationSession({
                                                    fromSurah: range.fromSurah,
                                                    fromAyah: range.fromAyah,
                                                    toSurah: range.toSurah,
                                                    toAyah: range.toAyah,
                                                    reader: range.readerId,
                                                    rangeId: range.id
                                                })}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center active:scale-95 transition-all border-0 cursor-pointer"
                                                style={{ backgroundColor: primaryColor, color: btnTextColor }}
                                            >
                                                <span>{isEn ? 'Review in Studio' : 'مراجعة في الاستوديو'}</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setQuizTargetRange(range);
                                                    setShowQuizModal(true);
                                                }}
                                                className="px-3 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center active:scale-95 transition-all border-0 cursor-pointer text-xs font-bold"
                                                title={isEn ? 'Test This Range' : 'اختبار وتثبيت هذا النطاق'}
                                            >
                                                <span>{isEn ? 'Test' : 'اختبار'}</span>
                                            </button>

                                            <button
                                                onClick={() => handleDeleteRange(range.id)}
                                                className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 flex items-center justify-center active:scale-95 transition-all border-0 cursor-pointer"
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
                    <div className="space-y-4">
                        {/* Quiz Start Card */}
                        <div id="memorization-quiz-mode-container" className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-3">
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
                                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs font-bold" style={{ color: primaryColor }}>
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
                                      ? 'shadow-md active:scale-95 cursor-pointer' 
                                      : 'opacity-40 cursor-not-allowed grayscale'
                                }`}
                                style={{ 
                                    backgroundColor: primaryColor, 
                                    color: btnTextColor 
                                }}
                            >
                                <span>
                                    {selectedQuizCard 
                                      ? (isEn ? 'Start Test for Selected Range' : 'بدء الاختبار للنطاق المحدد حالياً')
                                      : (isEn ? 'Select a Range Card Below First' : 'حدد بطاقة من الأسفل أولاً لبدء الاختبار')}
                                </span>
                            </button>
                        </div>

                        {/* Saved Memorized Ranges List for Quizzes */}
                        <div id="memorization-quick-quizzes-container" className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <span className="font-bold text-xs opacity-70">
                                    {isEn ? 'Saved Memorization Ranges' : 'قائمة المحفوظات المتاحة للاختبار'}
                                </span>
                                <span className="text-[11px] font-bold" style={{ color: primaryColor }}>
                                    {memorizedRanges.length} {isEn ? 'Saved' : 'محفوظات'}
                                </span>
                            </div>

                            {memorizedRanges.length === 0 ? (
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
                                    {memorizedRanges.map(range => {
                                        const isSelected = selectedQuizCard?.id === range.id;

                                        return (
                                            <div
                                                key={range.id}
                                                onClick={() => setSelectedQuizCard(range)}
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
                                                        className="px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all border-0 cursor-pointer"
                                                        style={{ backgroundColor: primaryColor, color: btnTextColor }}
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

                <div className="h-8 shrink-0"></div>
            </main>

            {/* Custom Range / Ayah / Page Pickers Modal */}
            {activePicker && activePicker !== 'reader' && (
                <div 
                    className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn" 
                    onClick={() => setActivePicker(null)}
                >
                    <div 
                        className="w-full max-w-[320px] rounded-[2rem] p-4 shadow-2xl animate-modal-enter flex flex-col max-h-[75vh] bg-white dark:bg-zinc-900 border-0" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5 p-1 text-right" dir={isEn ? 'ltr' : 'rtl'}>
                            {/* Surah Picker */}
                            {(activePicker === 'fromSurah' || activePicker === 'toSurah') && (
                                (isEn ? SURAH_NAMES_EN : SURAH_NAMES_AR).map((name, i) => {
                                    const sNum = i + 1;
                                    const isSelected = (activePicker === 'fromSurah' ? fromSurah : toSurah) === sNum;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (activePicker === 'fromSurah') {
                                                    setFromSurah(sNum);
                                                    setFromAyah(1);
                                                    if (sNum > toSurah) {
                                                        setToSurah(sNum);
                                                        setToAyah(1);
                                                    }
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
                            {(activePicker === 'fromAyah' || activePicker === 'toAyah') && (
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: getAyahsCount(activePicker === 'fromAyah' ? fromSurah : toSurah) }).map((_, i) => {
                                        const aNum = i + 1;
                                        const isSelected = (activePicker === 'fromAyah' ? fromAyah : toAyah) === aNum;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    if (activePicker === 'fromAyah') setFromAyah(aNum);
                                                    else setToAyah(aNum);
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
                            )}

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
                                                {pNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Quarter Picker (1 to 240) */}
                            {activePicker === 'quarter' && (
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: 240 }).map((_, i) => {
                                        const qNum = i + 1;
                                        const isSelected = selectedQuarter === qNum;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleQuarterSelect(qNum)}
                                                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-xs cursor-pointer border-0 ${
                                                    isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-zinc-800'
                                                }`}
                                            >
                                                {qNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Number Pickers (Repeats, Pause) */}
                            {(activePicker === 'range' || activePicker === 'ayah' || activePicker === 'pause') && (
                                <div className="grid grid-cols-2 gap-2.5">
                                    {Array.from({ length: activePicker === 'ayah' ? 20 : 10 }).map((_, i) => {
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
                                                className={`py-3.5 flex items-center justify-center rounded-2xl font-bold transition-all text-base border-0 cursor-pointer ${
                                                    isSelected ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 dark:bg-zinc-800'
                                                }`}
                                            >
                                                {val} {activePicker === 'pause' ? 's' : '×'}
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
