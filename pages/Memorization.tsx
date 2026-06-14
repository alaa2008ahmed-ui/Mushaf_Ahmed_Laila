import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Repeat, Play, User, ArrowLeftRight, CheckSquare, Minus, Plus, BookOpen, Calendar, List, Trophy, Trash2, RotateCcw, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { quranData as quranJsonData } from '../utils/quranData';
const quranData = { data: quranJsonData };
import { SURAH_NAMES_AR, MEMORIZATION_READERS } from '../components/QuranReader/constants';
import { registerBackInterceptor } from '../hooks/useBackButton';
import BottomBar from '../components/BottomBar';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { QuranDownloadModal } from '../components/QuranReader/DownloadModals';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import Toast from '../components/QuranReader/Toast';
import { memorizationService, MemorizedRange } from '../services/memorizationService';
import './QuranReader.css';

interface MemorizationProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

const Memorization: React.FC<MemorizationProps> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const isDefaultTheme = themeKey === 'default';
    const isBlackAndWhite = themeKey === 'deep_black';
    const isBlackTheme = theme.bgColor === '#000000';
    const primaryColor = theme.accent || (isBlackTheme ? '#FFFFFF' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));
    const btnTextColor = theme.btnText || (isBlackTheme ? '#000000' : (isBlackAndWhite ? '#000000' : '#FFFFFF'));
    
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
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    useEffect(() => {
        // Stop audio when unmounting Memorization page
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

        // Check for active session
        const session = localStorage.getItem('memorization_session_v1');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                // Only suggest if it's recent (last 24h)
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setSavedSession(parsed);
                }
            } catch (e) {}
        }

        // Load memorized ranges
        setMemorizedRanges(memorizationService.getMemorizedRanges());
    }, []);

    // Save settings to localStorage whenever they change
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

    // Auto-scroll to selected items when pickers are opened
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
        // Save to history if it's a new range
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

    const memorizationTutorialSteps: TutorialStep[] = [
        {
            id: 'memo-welcome',
            title: 'رفيقك في رحلة الحفظ والتثبيت',
            text: 'مرحباً بك في قسم التحفيظ. صُمم هذا القسم ليكون مساعدك الشخصي في حفظ القرآن الكريم وتثبيته. نستخدم هنا تقنيات التكرار الممنهج والاستماع المركز لمساعدتك على الحفظ المتقن بأقل جهد وأعلى كفاءة.',
            icon: <BookOpen className="w-8 h-8 text-white" />
        },
        {
            id: 'reader-select',
            title: 'اختيار المعلم (القارئ)',
            text: 'الحفظ يبدأ بالاستماع الصحيح. اختر من هنا قارئك المفضل الذي ترتاح لصوته وتجده مناسباً لمستوى حفظك. الاستماع المتكرر لنفس القارئ يساعد عقلك على محاكاة النطق الصحيح وتثبيت مخارج الحروف.',
            selector: '#reader-select-container',
            icon: <User className="w-8 h-8 text-white" />
        },
        {
            id: 'ayah-range',
            title: 'تحديد ورد الحفظ بدقة',
            text: 'من هنا تحدد "المقطع" الذي تود التركيز عليه اليوم. اختر السورة، ثم حدد آية البداية وآية النهاية. ننصحك دائماً بتقسيم الحفظ إلى مقاطع صغيرة (5-10 آيات) لضمان الإتقان قبل الانتقال لما بعدها.',
            selector: '#ayah-range-container',
            icon: <ArrowLeftRight className="w-8 h-8 text-white" />
        },
        {
            id: 'repetition-settings',
            title: 'إعدادات التكرار الذكي',
            text: 'السر في الحفظ هو التكرار. يمكنك هنا تحديد عدد مرات تكرار كل آية على حدة، وعدد مرات تكرار المقطع كاملاً. كما يمكنك إضافة "فترة صمت" بين الآيات لتعطي نفسك فرصة لترديد الآية غيباً خلف القارئ.',
            selector: '#repetition-settings-container',
            icon: <RotateCcw className="w-8 h-8 text-white" />
        },
        {
            id: 'start-btn',
            title: 'الانتقال لواجهة التحفيظ',
            text: 'عندما تصبح جاهزاً، اضغط هنا للانتقال إلى "وضع التحفيظ" في المصحف. هناك ستجد واجهة خاصة تركز فقط على الآيات المختارة، مع إمكانية إخفاء الآيات لاختبار حفظك وتفعيل التكرار التلقائي.',
            selector: '#btn-start-memorization',
            icon: <Play className="w-8 h-8 text-white" />
        }
    ];

    const getAyahsCount = (surahNum: number) => {
        return quranData.data.surahs[surahNum - 1]?.ayahs.length || 0;
    };

    const NumberPicker = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
        <div className="flex items-center gap-1">
            <div 
                onClick={() => setActivePicker(label as any)}
                className="flex flex-col items-center justify-center min-w-[80px] h-11 rounded-2xl shadow-sm border cursor-pointer hover:bg-black/5 transition-all active:scale-95" 
                style={{ backgroundColor: theme.bgColor, borderColor: 'var(--card-border)' }}
            >
                <span className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{value}</span>
                <span className="text-[10px] opacity-60" style={{ color: 'var(--text-color)' }}>مرة</span>
            </div>
        </div>
    );

    const handleDeleteRange = (id: string) => {
        memorizationService.deleteRange(id);
        setMemorizedRanges(memorizationService.getMemorizedRanges());
        showToast('تم حذف النطاق من المراجعة');
    };

    const handleReviewRange = (range: MemorizedRange) => {
        onNavigate('quran', {
            isMemorization: true,
            initialSurah: range.fromSurah,
            initialAyah: range.fromAyah,
            memorizationSettings: {
                reader: range.readerId,
                fromSurah: range.fromSurah,
                fromAyah: range.fromAyah,
                toSurah: range.toSurah,
                toAyah: range.toAyah,
                rangeRepeat: 3,
                ayahRepeat: 1,
                linkedRepeat: false,
                pauseLength: 1,
                testAfterSession: true,
                isReviewMode: true // New flag for review mode
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

    return (
        <div className="h-screen flex flex-col bg-transparent" style={{ fontFamily: theme.font, color: 'var(--text-color)' }}>
            <div className="relative z-10 flex flex-col h-full">
                <header className="app-top-bar shrink-0 relative z-10" style={{ backgroundColor: 'var(--qr-bar-bg)', borderBottom: '1px solid var(--qr-bar-border)' }}>
                    <div className="app-top-bar__inner">
                        <div className="relative flex items-center justify-center w-full">
                            <div className="absolute left-0">
                                <ThemePageLock />
                            </div>
                            <h1 className="app-top-bar__title text-2xl font-kufi flex items-center justify-center gap-2" style={{ color: 'var(--qr-bar-text)' }}>
                                التحفيظ
                            </h1>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-3 space-y-4 hide-scrollbar relative z-10" dir="rtl">
                    {/* Tabs */}
                    <div className="flex p-1 rounded-2xl bg-black/5 border mb-2" style={{ borderColor: 'var(--card-border)' }}>
                        <button 
                            onClick={() => setActiveTab('setup')}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'setup' ? 'shadow-md' : 'opacity-60'}`}
                            style={{ 
                                backgroundColor: activeTab === 'setup' ? primaryColor : 'transparent',
                                color: activeTab === 'setup' ? btnTextColor : 'var(--text-color)'
                            }}
                        >
                            <BookOpen size={16} />
                            إعداد الحفظ
                        </button>
                        <button 
                            onClick={() => setActiveTab('review')}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'review' ? 'shadow-md' : 'opacity-60'}`}
                            style={{ 
                                backgroundColor: activeTab === 'review' ? primaryColor : 'transparent',
                                color: activeTab === 'review' ? btnTextColor : 'var(--text-color)'
                            }}
                        >
                            <Calendar size={16} />
                            جدول المراجعة
                            {false && memorizedRanges.length > 0 && (
                                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
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
                            <span>اختر اسم القارئ</span>
                            <User size={18} />
                        </div>
                        <div className="relative">
                            <div 
                                onClick={() => setActivePicker('reader')}
                                className="w-full p-4 rounded-2xl cursor-pointer text-right font-medium text-sm shadow-sm border flex items-center justify-between"
                                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                            >
                                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                <span>{MEMORIZATION_READERS.find(r => r.id === selectedReader)?.name}</span>
                            </div>
                        </div>
                    </div>


                    {/* Ayah Range */}
                    <div className="space-y-1" id="ayah-range-container">
                        <div className="flex items-center justify-start gap-2 font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                            <span>نطاق الآيات</span>
                            <ArrowLeftRight size={18} />
                        </div>
                        
                        <div className="flex gap-2">
                            {/* From */}
                            <div className="flex-1 p-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <div className="text-center font-bold mb-1 text-xs" style={{ color: 'var(--text-color)' }}>من</div>
                                <div className="space-y-1.5">
                                    <div className="relative">
                                        <div 
                                            onClick={() => setActivePicker('fromSurah')}
                                            className="w-full p-3 border rounded-lg cursor-pointer text-center font-bold shadow-sm text-xs transition-colors hover:bg-black/5"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {SURAH_NAMES_AR[fromSurah - 1]}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div 
                                            onClick={() => setActivePicker('fromAyah')}
                                            className="w-full p-3 border rounded-lg cursor-pointer text-center font-bold shadow-sm text-xs transition-colors hover:bg-black/5"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                             آية {fromAyah}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* To */}
                            <div className="flex-1 p-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <div className="text-center font-bold mb-1 text-xs" style={{ color: 'var(--text-color)' }}>إلى</div>
                                <div className="space-y-1.5">
                                    <div className="relative">
                                        <div 
                                            onClick={() => setActivePicker('toSurah')}
                                            className="w-full p-3 border rounded-lg cursor-pointer text-center font-bold shadow-sm text-xs transition-colors hover:bg-black/5"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {SURAH_NAMES_AR[toSurah - 1]}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div 
                                            onClick={() => setActivePicker('toAyah')}
                                            className="w-full p-3 border rounded-lg cursor-pointer text-center font-bold shadow-sm text-xs transition-colors hover:bg-black/5"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                             آية {toAyah}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Repetition Settings */}
                    <div id="repetition-settings-container" className="space-y-2">
                        <div className="flex items-center justify-start gap-2 font-bold text-base" style={{ color: 'var(--text-color)' }}>
                            <span>إعدادات التكرار</span>
                            <Repeat size={20} />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {/* Range Repeat */}
                            <div className="flex items-center justify-between p-1 px-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <span className="font-bold text-[10px] leading-tight" style={{ color: 'var(--text-color)' }}>تكرار النطاق</span>
                                <NumberPicker value={rangeRepeat} onChange={(v) => { setRangeRepeat(v); setSavedSession(null); }} label="range" />
                            </div>

                            {/* Ayah Repeat */}
                            <div className="flex items-center justify-between p-1 px-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <span className="font-bold text-[10px] leading-tight" style={{ color: 'var(--text-color)' }}>تكرار الآية</span>
                                <NumberPicker value={ayahRepeat} onChange={(v) => { setAyahRepeat(v); setSavedSession(null); }} label="ayah" />
                            </div>

                            {/* Linked Repeat */}
                            <div className="flex items-center justify-between p-1 px-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-[10px] leading-tight" style={{ color: 'var(--text-color)' }}>ربط الآيات</span>
                                    <button 
                                        onClick={() => setShowExplanationModal(true)}
                                        className="text-[8px] opacity-60 flex items-center gap-0.5" 
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        توضيح <Play size={8} />
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
                            <div className="flex items-center justify-between p-1 px-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <span className="font-bold text-[10px] leading-tight" style={{ color: 'var(--text-color)' }}>السكتة</span>
                                <NumberPicker value={pauseLength} onChange={(v) => { setPauseLength(v); setSavedSession(null); }} label="pause" />
                            </div>
                        </div>
                    </div>

                    {/* Test After Session */}
                    <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        <div className="flex items-center gap-2 font-bold text-base" style={{ color: theme.textColor }}>
                            <span>اختبار بعد الجلسة</span>
                            <CheckSquare size={20} />
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
                                ابدأ جلسة التحفيظ
                            </button>

                            {/* Download Button moved to bottom of setup area */}
                            <button 
                                onClick={() => setShowDownloadModal(true)} 
                                className="w-full h-12 px-4 flex items-center justify-between transition-all active:scale-[0.98] rounded-2xl border shadow-sm"
                                style={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--card-border)', 
                                    color: 'var(--text-color)' 
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBlackTheme ? 'bg-white' : 'bg-emerald-500/10'}`}>
                                        <Download size={18} className={isBlackTheme ? 'text-black' : 'text-emerald-500'} />
                                    </div>
                                    <span className="font-bold text-sm">تحميل القراء</span>
                                </div>
                                <ArrowRight size={16} className="rotate-180 opacity-30" />
                            </button>
                        </div>
                    )}
                        </>
                    ) : (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex flex-col items-center justify-center mt-12 opacity-60">
                                <Calendar size={64} className="mb-4 opacity-30" />
                                <h2 className="text-xl font-bold">جدول المراجعة</h2>
                                <p className="mt-2 text-sm text-center font-medium">جاري الإنشاء في التحديث القادم إن شاء الله</p>
                            </div>

                            {/* Hidden for now: to be completed in the next update */}
                            {false && (
                                <>
                            {/* Review Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl border text-center" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Trophy size={20} />
                                    </div>
                                    <div className="text-2xl font-bold">{memorizedRanges.length}</div>
                                    <div className="text-[10px] opacity-50">نطاق تم حفظه</div>
                                </div>
                                <div className="p-4 rounded-2xl border text-center" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                    <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <RotateCcw size={20} />
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {memorizedRanges.filter(r => r.nextReviewDate <= Date.now()).length}
                                    </div>
                                    <div className="text-[10px] opacity-50">بانتظار المراجعة</div>
                                </div>
                            </div>

                            {/* Review List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="font-bold text-base">قائمة المراجعة</h3>
                                    <List size={18} className="opacity-50" />
                                </div>

                                {memorizedRanges.length === 0 ? (
                                    <div className="p-8 text-center opacity-50 space-y-2">
                                        <Calendar size={48} className="mx-auto opacity-20" />
                                        <p>لا توجد محفوظات حالياً</p>
                                        <p className="text-xs">ابدأ بحفظ نطاق جديد ليظهر هنا</p>
                                    </div>
                                ) : (
                                    memorizedRanges.map((range) => {
                                        const isDue = range.nextReviewDate <= Date.now();
                                        return (
                                            <div 
                                                key={range.id} 
                                                className="p-4 rounded-2xl border space-y-3 relative overflow-hidden"
                                                style={{ backgroundColor: 'var(--card-bg)', borderColor: isDue ? 'rgba(16, 185, 129, 0.3)' : 'var(--card-border)' }}
                                            >
                                                {isDue && <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>}
                                                
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-sm">
                                                            سورة {SURAH_NAMES_AR[range.fromSurah - 1]}
                                                        </div>
                                                        <div className="text-xs opacity-60">
                                                            الآيات: {range.fromAyah} - {range.toAyah}
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDue ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 opacity-50'}`}>
                                                            {isDue ? 'حان وقت المراجعة' : 'مراجعة قادمة'}
                                                        </div>
                                                        <div className="text-[9px] opacity-40 mt-1">
                                                            {new Date(range.nextReviewDate).toLocaleDateString('ar-SA')}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <button 
                                                        onClick={() => handleReviewRange(range)}
                                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                                                    >
                                                        <Play size={14} />
                                                        بدء المراجعة
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteRange(range.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                                </>
                            )}
                        </div>
                    )}
                    <div className="shrink-0 w-full h-32"></div>
                </main>

                {/* Removed fixed Start Button container to keep it in scrollable area or just before bottom bar */}
            </div>
            
            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowHelpModal(false)}>
                    <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter text-right" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)' }}>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>دليل التحفيظ</h2>
                        <div className="space-y-4 text-sm leading-relaxed">
                            <p>• <span className="font-bold">تكرار الآية:</span> عدد مرات تكرار كل آية على حدة قبل الانتقال للتالية.</p>
                            <p>• <span className="font-bold">تكرار النطاق:</span> عدد مرات إعادة المجموعة كاملة بعد الانتهاء منها.</p>
                            <p>• <span className="font-bold">التكرار المترابط:</span> يقوم بتكرار الآية السابقة مع الحالية لربط الحفظ.</p>
                            <p>• <span className="font-bold">السكتة:</span> فترة صمت بعد كل آية لتعطيك فرصة للترديد خلف القارئ.</p>
                        </div>
                        <button onClick={() => setShowHelpModal(false)} className="w-full mt-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: theme.btnBg }}>فهمت</button>
                    </div>
                </div>
            )}

            {/* Explanation Modal */}
            {showExplanationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowExplanationModal(false)}>
                    <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter text-right" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)' }}>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>التكرار المترابط</h2>
                        <p className="text-sm leading-relaxed mb-6">
                            هذه الميزة تساعدك على ربط الآيات ببعضها. عند تفعيلها، سيقوم التطبيق بتشغيل الآية السابقة مرة واحدة قبل البدء بتكرار الآية الحالية، مما يرسخ تسلسل الآيات في ذاكرتك.
                        </p>
                        <button onClick={() => setShowExplanationModal(false)} className="w-full py-3 rounded-xl font-bold text-white" style={{ backgroundColor: theme.btnBg }}>إغلاق</button>
                    </div>
                </div>
            )}

            {/* Resume Session Modal */}
            {showResumePrompt && savedSession && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter text-center" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)' }}>
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">جلسة سابقة متوفرة</h2>
                        <p className="opacity-70 mb-6 text-sm leading-relaxed">
                            تم العثور على جلسة تحفيظ سابقة عند سورة {SURAH_NAMES_AR[savedSession.currentAyah.s - 1]} الآية {savedSession.currentAyah.a}.
                            هل تود الاستمرار من حيث توقفت أم البدء من جديد؟
                        </p>
                        <div className="space-y-3">
                            <button 
                                onClick={resumeSession}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform"
                            >
                                الاستمرار في الجلسة
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
                                البدء من جديد
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
                    <div className="w-full max-w-[280px] rounded-[2rem] p-4 shadow-2xl animate-modal-enter flex flex-col max-h-[75vh]" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)' }}>
                        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 p-2" dir="rtl">
                            {(activePicker === 'fromSurah' || activePicker === 'toSurah') && SURAH_NAMES_AR.map((name, i) => {
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
                                        className={`w-full p-2.5 rounded-xl text-right font-bold transition-all flex items-center justify-between ${current === surahNum ? 'theme-accent-btn text-white' : 'hover:bg-black/5 opacity-70 hover:opacity-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] opacity-40 border" style={{ borderColor: 'var(--card-border)' }}>{surahNum}</span>
                                            <span className="text-sm">سورة {name}</span>
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

            <TutorialOverlay tutorialId="memorization-tutorial" steps={memorizationTutorialSteps} />

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
        </div>
    );
};

export default Memorization;
