import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Trash2,
  Download,
  HelpCircle,
  CheckCircle,
  Clock,
  Check,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { quranData as quranJsonData } from '../utils/quranData';
import { SURAH_NAMES_AR, MEMORIZATION_READERS } from '../components/QuranReader/constants';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { QuranDownloadModal } from '../components/QuranReader/DownloadModals';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import ToastComponent from '../components/QuranReader/Toast';
import {
  memorizationService,
  MemorizedRange,
  MemorizationStats
} from '../services/memorizationService';
import {
  getPageRange,
  getQuarterRange,
  getJuzRange,
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

type SelectionMode = 'ayahs' | 'page' | 'quarter' | 'juz';
type ActiveTab = 'setup' | 'plans' | 'review' | 'quiz';

const MEMORIZATION_SETTINGS_STORAGE_KEY = 'memorization_settings_v1';

interface SavedMemorizationSettings {
    selectionMode?: SelectionMode;
    selectedPage?: number;
    selectedQuarter?: number;
    selectedJuz?: number;
    reader?: string;
    fromSurah?: number;
    fromAyah?: number;
    toSurah?: number;
    toAyah?: number;
    rangeRepeat?: number;
    ayahRepeat?: number;
    linkedRepeat?: boolean;
    isCumulative?: boolean;
    isShanqiti3x3?: boolean;
    pauseLength?: number | 'auto';
    testAfterSession?: boolean;
}

function readSavedMemorizationSettings(): SavedMemorizationSettings {
    try {
        const raw = localStorage.getItem(MEMORIZATION_SETTINGS_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return {};
        return parsed as SavedMemorizationSettings;
    } catch {
        return {};
    }
}

const Memorization: React.FC<MemorizationProps> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.accent || '#10B981');
    const secondaryColor = isBlackTheme ? '#A1A1AA' : (theme.palette?.[1] || '#3B82F6');
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
    const primary3DShadow = isBlackTheme
        ? '0 6.5px 0 #52525b, 0 14px 26px -2px rgba(0, 0, 0, 0.72), inset 0 2px 2px rgba(255, 255, 255, 0.85), inset 0 -3px 5px rgba(0, 0, 0, 0.22)'
        : '0 6.5px 0 rgba(0, 0, 0, 0.28), 0 12px 24px -2px rgba(0, 0, 0, 0.22), inset 0 2px 2px rgba(255, 255, 255, 0.55), inset 0 -3px 5px rgba(0, 0, 0, 0.24)';
    const primary3DStyle: React.CSSProperties = {
        backgroundColor: primaryColor,
        backgroundImage: isBlackTheme
            ? 'linear-gradient(180deg, #FFFFFF 0%, #E4E4E7 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.03) 48%, rgba(0, 0, 0, 0.16) 100%)',
        color: btnTextColor,
        boxShadow: primary3DShadow
    };

    const initialSavedSettings = React.useMemo(() => readSavedMemorizationSettings(), []);

    // Tabs
    const [activeTab, setActiveTab] = useState<ActiveTab>('setup');

    // Selection Mode: by ayah, by page, by quarter, or by juz
    const [selectionMode, setSelectionMode] = useState<SelectionMode>(() => {
        const mode = initialSavedSettings.selectionMode;
        return mode === 'ayahs' || mode === 'page' || mode === 'quarter' || mode === 'juz' ? mode : 'ayahs';
    });
    const [selectedPage, setSelectedPage] = useState<number>(() => {
        const p = initialSavedSettings.selectedPage;
        return typeof p === 'number' && Number.isInteger(p) && p >= 1 && p <= 604 ? p : 1;
    });
    const [selectedQuarter, setSelectedQuarter] = useState<number>(() => {
        const q = initialSavedSettings.selectedQuarter;
        return typeof q === 'number' && Number.isInteger(q) && q >= 1 && q <= 240 ? q : 1;
    });
    const [selectedJuz, setSelectedJuz] = useState<number>(() => {
        const j = initialSavedSettings.selectedJuz;
        return typeof j === 'number' && Number.isInteger(j) && j >= 1 && j <= 30 ? j : 1;
    });

    // Reader & Repetitions
    const [selectedReader, setSelectedReader] = useState<string>(() => {
        const r = initialSavedSettings.reader;
        return typeof r === 'string' && r.trim() !== ''
            ? r
            : (MEMORIZATION_READERS[1]?.id || 'Abdul_Basit_Murattal_192kbps');
    });
    const [fromSurah, setFromSurah] = useState<number>(() => {
        const s = initialSavedSettings.fromSurah;
        return typeof s === 'number' && s >= 1 && s <= 114 ? s : 1;
    });
    const [fromAyah, setFromAyah] = useState<number>(() => {
        const a = initialSavedSettings.fromAyah;
        return typeof a === 'number' && a >= 1 ? a : 1;
    });
    const [toSurah, setToSurah] = useState<number>(() => {
        const s = initialSavedSettings.toSurah;
        return typeof s === 'number' && s >= 1 && s <= 114 ? s : 1;
    });
    const [toAyah, setToAyah] = useState<number>(() => {
        const a = initialSavedSettings.toAyah;
        return typeof a === 'number' && a >= 1 ? a : 7;
    });

    const [rangeRepeat, setRangeRepeat] = useState<number>(() => {
        const rr = initialSavedSettings.rangeRepeat;
        return typeof rr === 'number' && rr >= 1 ? rr : 1;
    });
    const [ayahRepeat, setAyahRepeat] = useState<number>(() => {
        const ar = initialSavedSettings.ayahRepeat;
        return typeof ar === 'number' && ar >= 1 ? ar : 1;
    });
    const [linkedRepeat, setLinkedRepeat] = useState<boolean>(() => {
        return typeof initialSavedSettings.linkedRepeat === 'boolean' ? initialSavedSettings.linkedRepeat : false;
    });
    const [isCumulative, setIsCumulative] = useState<boolean>(() => {
        return typeof initialSavedSettings.isCumulative === 'boolean' ? initialSavedSettings.isCumulative : false;
    });
    const [isShanqiti3x3, setIsShanqiti3x3] = useState<boolean>(() => {
        return typeof initialSavedSettings.isShanqiti3x3 === 'boolean' ? initialSavedSettings.isShanqiti3x3 : false;
    }); // Shanqiti 3x3 chunked loop
    const [pauseLength, setPauseLength] = useState<number | 'auto'>(() => {
        const pl = initialSavedSettings.pauseLength;
        if (pl === 'auto') return 'auto';
        return typeof pl === 'number' && pl >= 0 ? pl : 3;
    });
    const [testAfterSession, setTestAfterSession] = useState<boolean>(() => {
        return typeof initialSavedSettings.testAfterSession === 'boolean' ? initialSavedSettings.testAfterSession : true;
    });

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
    const [activePicker, setActivePicker] = useState<'range' | 'ayah' | 'pause' | 'reader' | 'fromSurah' | 'fromAyah' | 'toSurah' | 'toAyah' | 'page' | 'quarter' | 'juz' | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizTargetRange, setQuizTargetRange] = useState<any>(null);
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

    // Save all Setup tab settings automatically whenever any setting changes
    useEffect(() => {
        try {
            const payload: SavedMemorizationSettings = {
                selectionMode,
                selectedPage,
                selectedQuarter,
                selectedJuz,
                reader: selectedReader,
                fromSurah,
                fromAyah,
                toSurah,
                toAyah,
                rangeRepeat,
                ayahRepeat,
                linkedRepeat,
                isCumulative,
                isShanqiti3x3,
                pauseLength,
                testAfterSession
            };
            localStorage.setItem(MEMORIZATION_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {}
    }, [
        selectionMode,
        selectedPage,
        selectedQuarter,
        selectedJuz,
        selectedReader,
        fromSurah,
        fromAyah,
        toSurah,
        toAyah,
        rangeRepeat,
        ayahRepeat,
        linkedRepeat,
        isCumulative,
        isShanqiti3x3,
        pauseLength,
        testAfterSession
    ]);

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

    // Update range when Juz changes
    const handleJuzSelect = (juzNum: number) => {
        setSelectedJuz(juzNum);
        const b = getJuzRange(juzNum);
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
            isShanqiti3x3: customParams?.isShanqiti3x3 !== undefined ? customParams.isShanqiti3x3 : isShanqiti3x3,
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
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo flex items-center justify-center gap-2 truncate" style={{ color: 'var(--qr-bar-text)' }}>
                                <span>{isEn ? 'Quran Memorization' : 'تحفيظ القرآن الكريم'}</span>
                            </h1>
                        </div>

                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
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
                            <span className="relative flex w-2.5 h-2.5 shrink-0">
                                <span className="animate-ping absolute inset-0 rounded-full bg-amber-400 opacity-75"></span>
                                <span
                                    className="relative inline-flex w-2.5 h-2.5 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600"
                                    style={{
                                        boxShadow: '0 2px 0 #b45309, 0 3px 6px rgba(245, 158, 11, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                                    }}
                                ></span>
                            </span>
                        )}
                    </button>

                    <button 
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
                    </button>
                </div>

                {/* 2. Memorization Dashboard Header (لوحة الإنجاز) */}
                <div id="memorization-dashboard-container" className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3">
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
                            className="wird-inner-raised flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
                            style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}
                        >
                            <span>{stats.streakDays} {isEn ? 'Days' : 'أيام'}</span>
                        </div>
                    </div>

                    {/* Progress Bar of Whole Quran */}
                    <div className="space-y-1">
                        <div className={`app-3d-progress-track border-0 w-full h-3.5 rounded-full overflow-hidden p-0.5 ${isBlackTheme ? 'bg-[#09090b]' : 'bg-slate-100 dark:bg-zinc-900'}`}>
                            <div 
                                className="app-3d-progress-fill h-full rounded-full transition-all duration-500"
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
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 dark:border-white/5">
                            <div className="wird-inner-raised p-2.5 rounded-xl bg-emerald-500/10 flex items-center justify-between">
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

                            <div className="wird-inner-raised p-2.5 rounded-xl bg-amber-500/10 flex items-center justify-between">
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
                        {/* Flexible Range Selector Modes (آية / صفحة / ربع / جزء) */}
                        <div id="memorization-selection-mode-container" className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3.5">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <span className="font-bold text-xs whitespace-nowrap" style={{ color: primaryColor }}>
                                    <span>{isEn ? 'Select Range' : 'تحديد النطاق'}</span>
                                </span>
                                
                                <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setSelectionMode('ayahs')}
                                        className={`px-2 py-1.5 rounded-xl whitespace-nowrap transition-all border-0 cursor-pointer ${
                                            selectionMode === 'ayahs'
                                                ? 'font-black active:translate-y-[2px]'
                                                : 'wird-inner-raised bg-white dark:bg-[#0F172A] opacity-75 hover:opacity-100'
                                        }`}
                                        style={selectionMode === 'ayahs' ? primary3DStyle : undefined}
                                    >
                                        {isEn ? 'Verse' : 'بالآية'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectionMode('page');
                                            const b = getPageRange(selectedPage);
                                            setFromSurah(b.start.s);
                                            setFromAyah(b.start.a);
                                            setToSurah(b.end.s);
                                            setToAyah(b.end.a);
                                        }}
                                        className={`px-2 py-1.5 rounded-xl whitespace-nowrap transition-all border-0 cursor-pointer ${
                                            selectionMode === 'page'
                                                ? 'font-black active:translate-y-[2px]'
                                                : 'wird-inner-raised bg-white dark:bg-[#0F172A] opacity-75 hover:opacity-100'
                                        }`}
                                        style={selectionMode === 'page' ? primary3DStyle : undefined}
                                    >
                                        {isEn ? 'Page' : 'بالصفحة'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectionMode('quarter');
                                            const b = getQuarterRange(selectedQuarter);
                                            setFromSurah(b.start.s);
                                            setFromAyah(b.start.a);
                                            setToSurah(b.end.s);
                                            setToAyah(b.end.a);
                                        }}
                                        className={`px-2 py-1.5 rounded-xl whitespace-nowrap transition-all border-0 cursor-pointer ${
                                            selectionMode === 'quarter'
                                                ? 'font-black active:translate-y-[2px]'
                                                : 'wird-inner-raised bg-white dark:bg-[#0F172A] opacity-75 hover:opacity-100'
                                        }`}
                                        style={selectionMode === 'quarter' ? primary3DStyle : undefined}
                                    >
                                        {isEn ? 'Quarter' : 'بالربع'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectionMode('juz');
                                            const b = getJuzRange(selectedJuz);
                                            setFromSurah(b.start.s);
                                            setFromAyah(b.start.a);
                                            setToSurah(b.end.s);
                                            setToAyah(b.end.a);
                                        }}
                                        className={`px-2 py-1.5 rounded-xl whitespace-nowrap transition-all border-0 cursor-pointer ${
                                            selectionMode === 'juz'
                                                ? 'font-black active:translate-y-[2px]'
                                                : 'wird-inner-raised bg-white dark:bg-[#0F172A] opacity-75 hover:opacity-100'
                                        }`}
                                        style={selectionMode === 'juz' ? primary3DStyle : undefined}
                                    >
                                        {isEn ? 'Juz' : 'بالجزء'}
                                    </button>
                                </div>
                            </div>

                            {/* Mode A: By Page */}
                            {selectionMode === 'page' && (
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>{isEn ? 'Mushaf Page' : 'صفحة المصحف الشريف'}</span>
                                        <button
                                            type="button"
                                            onClick={() => setActivePicker('page')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 active:translate-y-[2px] transition-all"
                                            style={primary3DStyle}
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
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>{isEn ? 'Hizb Quarter (Rub\')' : 'ربع الحزب'}</span>
                                        <button
                                            type="button"
                                            onClick={() => setActivePicker('quarter')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 active:translate-y-[2px] transition-all"
                                            style={primary3DStyle}
                                        >
                                            {isEn ? `Quarter ${selectedQuarter}` : `الربع ${selectedQuarter}`}
                                        </button>
                                    </div>
                                    <div className="text-[11px] opacity-70">
                                        {getSurahName(fromSurah)} ({fromAyah}) ➔ {getSurahName(toSurah)} ({toAyah})
                                    </div>
                                </div>
                            )}

                            {/* Mode D: By Juz */}
                            {selectionMode === 'juz' && (
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>{isEn ? 'Quran Juz' : 'الجزء من القرآن'}</span>
                                        <button
                                            type="button"
                                            onClick={() => setActivePicker('juz')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 active:translate-y-[2px] transition-all"
                                            style={primary3DStyle}
                                        >
                                            {isEn ? `Juz ${selectedJuz}` : `الجزء ${selectedJuz}`}
                                        </button>
                                    </div>
                                    <div className="text-[11px] opacity-70">
                                        {getSurahName(fromSurah)} ({fromAyah}) ➔ {getSurahName(toSurah)} ({toAyah})
                                    </div>
                                </div>
                            )}

                            {/* Mode C: By Surah and Ayah (Always available as primary / custom) */}
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
                                </div>
                            </div>

                            {/* Quick Preview & Tafseer Trigger */}
                            <button
                                type="button"
                                onClick={() => setShowPreviewModal(true)}
                                className="app-page-card border-0 w-full py-3 rounded-2xl bg-white dark:bg-[#1E293B] font-bold text-xs flex items-center justify-center cursor-pointer transition-all"
                                style={{ color: isBlackTheme ? '#FFFFFF' : '#059669' }}
                            >
                                <span>{isEn ? 'Preview Verses & Tafseer First' : 'معاينة الآيات وقراءة التفسير الميسر أولاً'}</span>
                            </button>
                        </div>

                        {/* Reciter Selector */}
                        <button 
                            type="button"
                            id="reader-select-container"
                            onClick={() => setActivePicker('reader')}
                            className="app-page-card border-0 w-full p-4 rounded-3xl bg-white dark:bg-[#1E293B] flex items-center justify-between cursor-pointer text-start"
                        >
                            <div>
                                <span className="text-[10px] font-bold opacity-60 block">{isEn ? 'Reciter' : 'القارئ المعلم'}</span>
                                <div className="font-bold text-sm">
                                    {getReciterDisplayName(selectedReader, MEMORIZATION_READERS.find(r => r.id === selectedReader)?.name, language)}
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-left text-xs opacity-40"></i>
                        </button>

                        {/* Repetition Engine Settings */}
                        <div id="repetition-settings-container" className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3">
                            <span className="font-bold text-xs block" style={{ color: primaryColor }}>
                                <span>{isEn ? 'Repetition & Memorization Rules' : 'إعدادات وقواعد التكرار'}</span>
                            </span>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold">{isEn ? 'Ayah Repeat' : 'تكرار الآية'}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('ayah')}
                                        className="app-page-card border-0 w-12 h-9 rounded-xl bg-white dark:bg-[#1E293B] font-bold text-xs cursor-pointer"
                                    >
                                        {ayahRepeat}×
                                    </button>
                                </div>

                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold">{isEn ? 'Range Repeat' : 'تكرار النطاق'}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('range')}
                                        className="app-page-card border-0 w-12 h-9 rounded-xl bg-white dark:bg-[#1E293B] font-bold text-xs cursor-pointer"
                                    >
                                        {rangeRepeat}×
                                    </button>
                                </div>

                                <div className="app-inner-3d-box border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/85 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold">{isEn ? 'Recitation Pause' : 'سكتة الترديد'}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePicker('pause')}
                                        className="app-page-card border-0 px-2.5 h-9 min-w-[3rem] rounded-xl bg-white dark:bg-[#1E293B] font-bold text-xs cursor-pointer whitespace-nowrap"
                                    >
                                        {pauseLength === 'auto'
                                            ? (isEn ? 'Auto' : 'تلقائي')
                                            : pauseLength === 0
                                                ? (isEn ? '0 (Off)' : '0 (مستمر)')
                                                : `${pauseLength}s`}
                                    </button>
                                </div>

                                <div 
                                    className="wird-inner-raised border-0 p-3 rounded-2xl bg-white dark:bg-[#0F172A]/80 flex items-center justify-between cursor-pointer active:translate-y-[2px]"
                                    onClick={() => {
                                        const nextVal = !linkedRepeat;
                                        setLinkedRepeat(nextVal);
                                        if (nextVal) {
                                            setIsCumulative(false);
                                            setIsShanqiti3x3(false);
                                        }
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">{isEn ? 'Linked Repeat' : 'الربط بالسابقة'}</span>
                                        <span className="text-[9px] opacity-60">{isEn ? 'Link with previous verse' : 'تثبيت التسلسل'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={linkedRepeat}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const nextVal = !linkedRepeat;
                                            setLinkedRepeat(nextVal);
                                            if (nextVal) {
                                                setIsCumulative(false);
                                                setIsShanqiti3x3(false);
                                            }
                                        }}
                                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 cursor-pointer app-3d-checkbox ${
                                            linkedRepeat
                                                ? 'app-3d-checkbox-checked bg-emerald-500 text-white'
                                                : 'bg-slate-100 dark:bg-zinc-800 text-transparent'
                                        }`}
                                        aria-label={isEn ? 'Linked Repeat' : 'الربط بالسابقة'}
                                    >
                                        {linkedRepeat && <Check size={14} strokeWidth={3} />}
                                    </button>
                                </div>
                            </div>

                            {/* Cumulative Methods Single Card (2-button selector) */}
                            <div className="wird-inner-raised border-0 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-[#0F172A]/80 space-y-2.5">
                                <div>
                                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                        {isEn ? 'Cumulative Memorization' : 'الحفظ التراكمي'}
                                    </div>
                                    <div className="text-[10px] text-amber-700 dark:text-amber-400">
                                        {isShanqiti3x3
                                            ? (isEn ? '3-verse groups with in-group linking & full consolidation' : 'تقسيم النطاق لمجموعات من 3 آيات مع الربط والتثبيت الشامل')
                                            : isCumulative
                                                ? (isEn ? 'Repeats verses progressively for strong retention' : 'تكرار الآيات تصاعدياً لضمان الرسوخ وعدم التفلت')
                                                : (isEn ? 'Choose between Cumulative or Shanqiti (3×3)' : 'اختر إحدى طريقتي الحفظ التراكمي أو الشنقيطي (3×3)')}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        aria-pressed={isCumulative}
                                        onClick={() => {
                                            const nextVal = !isCumulative;
                                            setIsCumulative(nextVal);
                                            if (nextVal) {
                                                setLinkedRepeat(false);
                                                setIsShanqiti3x3(false);
                                            }
                                        }}
                                        className={`px-2 py-2.5 rounded-xl text-[10.5px] sm:text-xs transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 text-center leading-snug active:translate-y-[2px] ${
                                            isCumulative
                                                ? 'font-black'
                                                : 'wird-inner-raised bg-white dark:bg-[#1E293B] text-amber-900 dark:text-amber-200 font-bold opacity-85 hover:opacity-100'
                                        }`}
                                        style={isCumulative ? primary3DStyle : undefined}
                                        aria-label={isEn ? 'Cumulative Loop' : 'الحفظ التراكمي'}
                                    >
                                        {isCumulative && <Check size={13} strokeWidth={3} className="shrink-0" />}
                                        <span>{isEn ? 'Cumulative Loop' : 'الحفظ التراكمي'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        aria-pressed={isShanqiti3x3}
                                        onClick={() => {
                                            const nextVal = !isShanqiti3x3;
                                            setIsShanqiti3x3(nextVal);
                                            if (nextVal) {
                                                setLinkedRepeat(false);
                                                setIsCumulative(false);
                                            }
                                        }}
                                        className={`px-2 py-2.5 rounded-xl text-[10.5px] sm:text-xs transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 text-center leading-snug active:translate-y-[2px] ${
                                            isShanqiti3x3
                                                ? 'font-black'
                                                : 'wird-inner-raised bg-white dark:bg-[#1E293B] text-amber-900 dark:text-amber-200 font-bold opacity-85 hover:opacity-100'
                                        }`}
                                        style={isShanqiti3x3 ? primary3DStyle : undefined}
                                        aria-label={isEn ? 'Shanqiti Cumulative (3×3)' : 'الحفظ التراكمي الشنقيطي (3×3)'}
                                    >
                                        {isShanqiti3x3 && <Check size={13} strokeWidth={3} className="shrink-0" />}
                                        <span>{isEn ? 'Shanqiti (3×3)' : 'الحفظ التراكمي الشنقيطي (3×3)'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Start Button */}
                        <div className="space-y-3.5 pt-1 pb-2">
                            <button
                                type="button"
                                id="btn-start-memorization"
                                onClick={() => startMemorizationSession()}
                                className="w-full py-4 min-h-[56px] rounded-2xl font-bold text-base flex items-center justify-center hover:-translate-y-[2px] active:translate-y-[4px] active:scale-[0.99] transition-all cursor-pointer border-0"
                                style={primary3DStyle}
                            >
                                <span>{isEn ? 'Start Quran Memorization Session' : 'بدء جلسة تحفيظ القرآن الكريم'}</span>
                            </button>

                            <button
                                type="button"
                                id="btn-download-reciters"
                                onClick={() => setShowDownloadModal(true)}
                                className="app-page-card border-0 w-full py-4 min-h-[52px] rounded-2xl font-bold text-sm bg-white dark:bg-[#1E293B] text-slate-700 dark:text-zinc-200 flex items-center justify-center transition-all cursor-pointer"
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
                    <div id="memorization-preset-plans-container" className="space-y-3.5 pb-2">
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
                                    className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3"
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
                                                    <span className="app-3d-badge border-0 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                                                        {isEn ? `Day ${progress.currentDay}` : `اليوم ${progress.currentDay}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enrolled Progress Bar */}
                                    {isEnrolled && (
                                        <div className="space-y-1 pt-1">
                                            <div className="app-3d-progress-track w-full bg-slate-200/80 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden p-[1.5px]">
                                                <div 
                                                    className="app-3d-progress-fill h-full rounded-full transition-all duration-300"
                                                    style={{
                                                        backgroundColor: primaryColor,
                                                        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 60%)',
                                                        width: `${percent}%`
                                                    }}
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
                                        type="button"
                                        onClick={() => handleStartPlan(plan)}
                                        className="w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center active:translate-y-[3px] transition-all border-0 cursor-pointer"
                                        style={primary3DStyle}
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
                    <div id="memorization-review-list" className="space-y-3.5 pb-2">
                        <div id="memorization-review-stats" className="flex items-center justify-between px-1">
                            <span className="font-bold text-xs opacity-70">
                                {isEn ? 'Spaced Repetition Schedule (SM-2)' : 'جدول التكرار المتباعد الذكي'}
                            </span>
                            <span className="app-3d-badge border-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-[#1E293B]" style={{ color: primaryColor }}>
                                {memorizedRanges.length} {isEn ? 'Saved Ranges' : 'محفوظات'}
                            </span>
                        </div>

                        {memorizedRanges.length === 0 ? (
                            <div className="app-page-card border-0 p-8 text-center rounded-3xl bg-white dark:bg-[#1E293B] space-y-3">
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

                                return (
                                    <div 
                                        key={range.id}
                                        className="app-page-card border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] space-y-3"
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
                                                    <span className="app-3d-badge border-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                                        <ShieldCheck size={11} />
                                                        <span>{isEn ? 'Mastered' : 'راسخ مؤكد'}</span>
                                                    </span>
                                                )}
                                                <div 
                                                    className="app-3d-badge border-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
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
                                                type="button"
                                                onClick={() => startMemorizationSession({
                                                    fromSurah: range.fromSurah,
                                                    fromAyah: range.fromAyah,
                                                    toSurah: range.toSurah,
                                                    toAyah: range.toAyah,
                                                    reader: range.readerId,
                                                    rangeId: range.id
                                                })}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center active:translate-y-[2px] transition-all border-0 cursor-pointer"
                                                style={primary3DStyle}
                                            >
                                                <span>{isEn ? 'Start Review & Repeat' : 'بدء المراجعة والتكرار'}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setQuizTargetRange(range);
                                                    setShowQuizModal(true);
                                                }}
                                                className="app-page-card border-0 px-3 h-10 rounded-xl bg-white dark:bg-[#0F172A] flex items-center justify-center transition-all cursor-pointer text-xs font-bold"
                                                title={isEn ? 'Test This Range' : 'اختبار وتثبيت هذا النطاق'}
                                            >
                                                <span>{isEn ? 'Test' : 'اختبار'}</span>
                                            </button>

                                            {/* Confirm Mastery Toggle Button */}
                                            <button
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
                                                title={range.isMastered 
                                                    ? (isEn ? 'Marked as Mastered (Click to re-activate regular review)' : 'حفظ راسخ ومؤكد (انقر لإعادته للمراجعة الدورية)')
                                                    : (isEn ? 'Confirm as Fully Mastered' : 'تأكيد الحفظ ورسوخه')}
                                            >
                                                <CheckCircle size={15} />
                                                <span>{range.isMastered ? (isEn ? 'Mastered' : 'مؤكّد') : (isEn ? 'Confirm' : 'تأكيد')}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRange(range.id)}
                                                className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center active:translate-y-[2px] transition-all border-0 cursor-pointer"
                                                style={{
                                                    boxShadow: '0 4px 0 #b91c1c, inset 0 1.5px 1px rgba(255,255,255,0.35)'
                                                }}
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

                {/* TAB 4: QUIZ CENTER */}
                {activeTab === 'quiz' && (
                    <div className="space-y-4 pb-2">
                        {/* Saved Memorized Ranges List for Quizzes */}
                        <div id="memorization-quick-quizzes-container" className="space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="font-bold text-xs opacity-70">
                                    {isEn ? 'Saved Memorization Ranges' : 'قائمة المحفوظات المتاحة للاختبار'}
                                </span>
                                <span className="app-3d-badge border-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-[#1E293B]" style={{ color: primaryColor }}>
                                    {memorizedRanges.length} {isEn ? 'Saved' : 'محفوظات'}
                                </span>
                            </div>

                            {memorizedRanges.length === 0 ? (
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
                                    {memorizedRanges.map((range, idx) => {
                                        const handleOpenQuiz = () => {
                                            setQuizTargetRange({
                                                fromSurah: range.fromSurah,
                                                fromAyah: range.fromAyah,
                                                toSurah: range.toSurah,
                                                toAyah: range.toAyah,
                                                id: range.id
                                            });
                                            setShowQuizModal(true);
                                        };

                                        return (
                                            <div
                                                key={range.id}
                                                onClick={handleOpenQuiz}
                                                className="app-page-card tasbeeh-pressable border-0 p-4 rounded-3xl bg-white dark:bg-[#1E293B] transition-all cursor-pointer space-y-2.5"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="min-w-[32px] h-8 px-1.5 rounded-full flex items-center justify-center border-0 font-black text-xs sm:text-sm shrink-0 select-none font-cairo"
                                                            style={{
                                                                ...primary3DStyle,
                                                                boxShadow: isBlackTheme
                                                                    ? '0 4px 0 #52525b, 0 8px 14px -2px rgba(0, 0, 0, 0.65), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.85), inset 0 -2px 3px rgba(0, 0, 0, 0.22)'
                                                                    : '0 4px 0 rgba(0, 0, 0, 0.26), 0 8px 14px -2px rgba(0, 0, 0, 0.18), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.55), inset 0 -2px 3px rgba(0, 0, 0, 0.22)',
                                                                textShadow: isBlackTheme
                                                                    ? '0 1px 0 rgba(255, 255, 255, 0.65)'
                                                                    : '0 1.5px 2px rgba(0, 0, 0, 0.35)'
                                                            }}
                                                        >
                                                            {idx + 1}
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
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenQuiz();
                                                        }}
                                                        className="px-3.5 py-2 rounded-xl font-bold text-xs active:translate-y-[2px] transition-all border-0 cursor-pointer"
                                                        style={primary3DStyle}
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
                    className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/65" 
                    onClick={() => setActivePicker(null)}
                >
                    <div 
                        className="app-page-card border-0 w-full max-w-[320px] rounded-[2rem] p-4 flex flex-col max-h-[75dvh] bg-white dark:bg-[#1E293B]" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2.5 p-1.5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
                            {/* Surah Picker */}
                            {(activePicker === 'fromSurah' || activePicker === 'toSurah') && (
                                (isEn ? SURAH_NAMES_EN : SURAH_NAMES_AR)
                                    .map((name, i) => ({ name, sNum: i + 1 }))
                                    .filter(({ sNum }) => activePicker === 'fromSurah' || sNum >= fromSurah)
                                    .map(({ name, sNum }) => {
                                        const isSelected = (activePicker === 'fromSurah' ? fromSurah : toSurah) === sNum;
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
                                                <span className={`app-3d-badge border-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    isSelected
                                                        ? (isBlackTheme ? 'bg-black/15 text-black' : 'bg-white/20 text-white')
                                                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300'
                                                }`}>{sNum}</span>
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
                                                {pNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Quarter Picker (1 to 240) */}
                            {activePicker === 'quarter' && (
                                <div className="grid grid-cols-4 gap-2.5 p-0.5">
                                    {Array.from({ length: 240 }).map((_, i) => {
                                        const qNum = i + 1;
                                        const isSelected = selectedQuarter === qNum;
                                        return (
                                            <button
                                                type="button"
                                                key={i}
                                                onClick={() => handleQuarterSelect(qNum)}
                                                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-xs cursor-pointer border-0 ${
                                                    isSelected
                                                        ? 'active:translate-y-[2px]'
                                                        : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                }`}
                                                style={isSelected ? primary3DStyle : undefined}
                                            >
                                                {qNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Juz Picker (1 to 30) */}
                            {activePicker === 'juz' && (
                                <div className="grid grid-cols-4 gap-2.5 p-0.5">
                                    {Array.from({ length: 30 }).map((_, i) => {
                                        const jNum = i + 1;
                                        const isSelected = selectedJuz === jNum;
                                        return (
                                            <button
                                                type="button"
                                                key={jNum}
                                                onClick={() => handleJuzSelect(jNum)}
                                                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-xs cursor-pointer border-0 ${
                                                    isSelected
                                                        ? 'active:translate-y-[2px]'
                                                        : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                }`}
                                                style={isSelected ? primary3DStyle : undefined}
                                            >
                                                {jNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Number Pickers (Repeats, Pause) */}
                            {activePicker === 'pause' && (
                                <div className="grid grid-cols-2 gap-3 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPauseLength('auto');
                                            setActivePicker(null);
                                        }}
                                        className={`col-span-2 py-3.5 px-3 flex items-center justify-center rounded-2xl font-bold transition-all text-sm border-0 cursor-pointer ${
                                            pauseLength === 'auto'
                                                ? 'active:translate-y-[2px]'
                                                : 'app-page-card bg-white dark:bg-[#0F172A]'
                                        }`}
                                        style={pauseLength === 'auto' ? primary3DStyle : undefined}
                                    >
                                        {isEn ? 'Auto (By Verse Length)' : 'تلقائي (بمقدار طول الآية)'}
                                    </button>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                                        const isSelected = pauseLength === val;
                                        return (
                                            <button
                                                type="button"
                                                key={val}
                                                onClick={() => {
                                                    setPauseLength(val);
                                                    setActivePicker(null);
                                                }}
                                                className={`py-3.5 flex items-center justify-center rounded-2xl font-bold transition-all text-sm border-0 cursor-pointer ${
                                                    isSelected
                                                        ? 'active:translate-y-[2px]'
                                                        : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                }`}
                                                style={isSelected ? primary3DStyle : undefined}
                                            >
                                                {val === 0 
                                                    ? (isEn ? '0s (Continuous)' : '0 (مستمر بدون توقف)') 
                                                    : val === 1
                                                        ? (isEn ? '1 sec' : 'ثانية واحدة')
                                                        : val === 2
                                                            ? (isEn ? '2 sec' : 'ثانيتان')
                                                            : `${val} ${isEn ? 'sec' : 'ثوانٍ'}`}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Range & Ayah Number Pickers */}
                            {(activePicker === 'range' || activePicker === 'ayah') && (
                                <div className="grid grid-cols-2 gap-3 p-0.5">
                                    {Array.from({ length: activePicker === 'ayah' ? 20 : 10 }).map((_, i) => {
                                        const val = i + 1;
                                        const isSelected = (activePicker === 'range' ? rangeRepeat : ayahRepeat) === val;
                                        return (
                                            <button
                                                type="button"
                                                key={i}
                                                onClick={() => {
                                                    if (activePicker === 'range') setRangeRepeat(val);
                                                    else if (activePicker === 'ayah') setAyahRepeat(val);
                                                    setActivePicker(null);
                                                }}
                                                className={`py-3.5 flex items-center justify-center rounded-2xl font-bold transition-all text-base border-0 cursor-pointer ${
                                                    isSelected
                                                        ? 'active:translate-y-[2px]'
                                                        : 'app-page-card bg-white dark:bg-[#0F172A]'
                                                }`}
                                                style={isSelected ? primary3DStyle : undefined}
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
