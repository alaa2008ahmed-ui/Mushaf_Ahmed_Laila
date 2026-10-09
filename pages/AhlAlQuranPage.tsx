import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, BookOpen, Crown, Medal, User, Calendar, 
  Eye, EyeOff, Shield, RefreshCw, ChevronDown, CheckCircle2,
  Sparkles, Info, Award, Trash2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { 
  ahlAlQuranService, 
  CalendarType, 
  PrivacyMode 
} from '../services/ahlAlQuranService';
import { communityService } from '../services/communityService';
import UsernameModal from '../components/Community/UsernameModal';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import ThemePageLock from '../components/ThemePageLock';

interface AhlAlQuranPageProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
}

const AhlAlQuranPage: React.FC<AhlAlQuranPageProps> = ({ onBack, onNavigate }) => {
  const { theme, themeKey } = useTheme();

  const isBlackTheme = theme.bgColor === '#000000';
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || '#10b981');
  const primaryTextColor = isBlackTheme ? '#000000' : (theme.btnText || '#FFFFFF');
  const cardBg = isBlackTheme 
    ? '#111111' 
    : (theme.isGlass ? 'rgba(255, 255, 255, 0.15)' : (theme.cardBg || (theme.isDark ? '#1e293b' : '#ffffff')));
  const cardBorder = isBlackTheme 
    ? '#333333' 
    : (theme.cardBorder || (theme.isDark ? '#334155' : '#e2e8f0'));
  const secondaryBg = isBlackTheme 
    ? '#1a1a1a' 
    : (theme.isDark ? '#0f172a' : '#f8fafc');

  // Navigation & Calendar States
  const [calendarType, setCalendarType] = useState<CalendarType>(() => {
    try {
      const saved = localStorage.getItem('ahl_al_quran_calendar_type');
      if (saved === 'hijri' || saved === 'gregorian') return saved;
    } catch (e) {}
    return 'hijri';
  });
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');
  const [isArchiveDropdownOpen, setIsArchiveDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'my_stats' | 'privacy'>('leaderboard');
  const [tabHistory, setTabHistory] = useState<('leaderboard' | 'my_stats' | 'privacy')[]>(['leaderboard']);

  const switchTab = (newTab: 'leaderboard' | 'my_stats' | 'privacy') => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
    setTabHistory(prev => [...prev, newTab]);
  };
  
  const handleCalendarTypeChange = (type: CalendarType) => {
    setCalendarType(type);
    try {
      localStorage.setItem('ahl_al_quran_calendar_type', type);
    } catch (e) {}
    showToast(
      type === 'hijri' 
        ? 'تم اعتماد الشهور الهجرية للوحة المتصدرين' 
        : 'تم اعتماد الشهور الميلادية للوحة المتصدرين'
    );
  };
  
  // Real-time Data
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => communityService.getCurrentUser());
  const [isProfileComplete, setIsProfileComplete] = useState(() => communityService.isProfileComplete());
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const isAdmin = communityService.isCurrentUserAdmin();
  const [userPrivacy, setUserPrivacy] = useState<PrivacyMode>(() => ahlAlQuranService.getCurrentUserPrivacy());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available Month Options (Current + Archived)
  const monthOptions = useMemo(() => {
    return ahlAlQuranService.getAvailableMonths(calendarType);
  }, [calendarType]);

  // Set default month to current month when calendarType changes
  useEffect(() => {
    if (monthOptions.length > 0) {
      setSelectedMonthKey(monthOptions[0].key);
    }
  }, [monthOptions]);

  // Subscribe to real-time Ahl Al-Quran updates
  useEffect(() => {
    const unsub = ahlAlQuranService.subscribe(() => {
      setRefreshTrigger(prev => prev + 1);
    });
    const handleEventUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('ahl_al_quran_updated', handleEventUpdate);
    window.addEventListener('ahl_al_quran_page_recorded', handleEventUpdate);
    window.addEventListener('community_user_updated', handleEventUpdate);
    window.addEventListener('community_user_deleted', handleEventUpdate);
    return () => {
      unsub();
      window.removeEventListener('ahl_al_quran_updated', handleEventUpdate);
      window.removeEventListener('ahl_al_quran_page_recorded', handleEventUpdate);
      window.removeEventListener('community_user_updated', handleEventUpdate);
      window.removeEventListener('community_user_deleted', handleEventUpdate);
    };
  }, []);

  // Update current user & profile state
  useEffect(() => {
    const cur = communityService.getCurrentUser();
    setCurrentUser(cur);
    setIsProfileComplete(communityService.isProfileComplete());
    setUserPrivacy(ahlAlQuranService.getCurrentUserPrivacy());
  }, [refreshTrigger, showUsernameModal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute Leaderboard for Selected Month
  const leaderboard = useMemo(() => {
    return ahlAlQuranService.getLeaderboard(selectedMonthKey, currentUser?.userId);
  }, [selectedMonthKey, currentUser?.userId, refreshTrigger]);

  // Current user's specific performance in this selected month
  const currentUserEntry = useMemo(() => {
    return leaderboard.find(item => item.isCurrentUser);
  }, [leaderboard]);

  const handlePrivacyChange = async (mode: PrivacyMode) => {
    await ahlAlQuranService.setPrivacyMode(mode);
    setUserPrivacy(mode);
    showToast(
      mode === 'public' 
        ? 'تم تفعيل الظهور باسمك وصورتك في لائحة الشرف'
        : mode === 'anonymous'
        ? 'تم تفعيل الظهور كفاعل خير (مجهول) للحفاظ على أجر السر'
        : 'تم حجب اسمك من القائمة العامة مع استمرار حفظ إحصائياتك الشخصية'
    );
  };

  const selectedMonthName = useMemo(() => {
    if (selectedMonthKey === 'lifetime') return 'جميع الأوقات (التراكمي)';
    const found = monthOptions.find(m => m.key === selectedMonthKey);
    return found ? found.name : 'الشهر الحالي';
  }, [selectedMonthKey, monthOptions]);

  const isCurrentMonthSelected = useMemo(() => {
    return monthOptions.length > 0 && monthOptions[0].key === selectedMonthKey;
  }, [selectedMonthKey, monthOptions]);

  // Back interceptor for device/phone back button
  useEffect(() => {
    const interceptor = () => {
      // 1. Close archive dropdown if open
      if (isArchiveDropdownOpen) {
        setIsArchiveDropdownOpen(false);
        return true;
      }
      // 2. Close username registration modal if open
      if (showUsernameModal) {
        setShowUsernameModal(false);
        return true;
      }
      return false; // Let global handler navigate back to origin (home or more-menu)
    };

    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [isArchiveDropdownOpen, showUsernameModal]);

  const ahlAlQuranTutorialSteps: TutorialStep[] = [
    {
      id: 'ahl-leaderboard',
      title: 'لوحة المتصدرين',
      text: 'ترتيب شهري وتنافس شريف بين القراء حسب عدد الصفحات والختمات مع تمييز الأوائل بالتيجان والأوسمة.',
      selector: '#ahl-tab-leaderboard',
      icon: <Crown className="w-8 h-8 text-amber-300" />
    },
    {
      id: 'ahl-stats',
      title: 'إحصائياتي الشخصية',
      text: 'متابعة إنجازك القرآني وترتيبك وعدد الصفحات المقروءة ونسبة تقدمك في الختمة بدقة.',
      selector: '#ahl-tab-mystats',
      icon: <BookOpen className="w-8 h-8 text-sky-400" />
    },
    {
      id: 'ahl-privacy',
      title: 'الخصوصية والظهور',
      text: 'التحكم في ظهور اسمك وبياناتك في قائمة المتصدرين أو القراءة كفاعل خير بكل أمان.',
      selector: '#ahl-tab-privacy',
      icon: <Shield className="w-8 h-8 text-purple-400" />
    }
  ];

  return (
    <div 
      className="h-screen max-h-screen h-[100dvh] w-full flex flex-col overflow-y-auto overscroll-contain transition-colors bg-transparent"
      dir="rtl"
      style={{
        backgroundColor: 'transparent',
        color: theme.textColor,
        fontFamily: theme.font,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3.75rem + 1cm)'
      }}
    >
      {/* Top Header Bar */}
      <header className="app-top-bar z-20 shrink-0">
        <div className="app-top-bar__inner">
          <div className="relative flex items-center justify-between w-full">
            {/* Right: Quran Shortcut */}
            <button
              type="button"
              onClick={() => onNavigate('quran')}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer flex-shrink-0"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                color: primaryColor
              }}
              title="الذهاب للمصحف الشريف"
            >
              <BookOpen size={20} />
            </button>

            {/* Center Title */}
            <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi text-center flex-1" style={{ color: theme.textColor }}>
              أهل القرآن الكريم
            </h1>

            {/* Left: Admin reset button and ThemePageLock */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer text-rose-500 hover:bg-rose-500/10"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: cardBorder
                  }}
                  title="تصفير وحذف ترتيب أهل القرآن (إدارة التطبيق)"
                >
                  <Trash2 size={18} />
                </button>
              ) : (
                <div className="w-10 h-10 flex-shrink-0 opacity-0 pointer-events-none" />
              )}
              <ThemePageLock />
            </div>
          </div>
          <p className="app-top-bar__subtitle text-xs" style={{ color: theme.textColor + 'aa' }}>
            لوحة المتصدرين وإنجازات قراء كتاب الله الكريم
          </p>
        </div>
      </header>

      <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pt-3">

        {/* Unregistered User Warning / Invitation Banner */}
        {!isProfileComplete && (
          <div 
            className="mb-4 p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}35`,
              color: theme.textColor
            }}
          >
            <div className="flex items-center gap-3 text-right">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
              >
                <Info size={22} />
              </div>
              <h4 className="font-bold text-sm">لم تقم بالتسجيل في مجتمع المصحف بعد</h4>
            </div>
            <button
              onClick={() => setShowUsernameModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: primaryColor, color: primaryTextColor }}
            >
              تسجيل حسابي الآن
            </button>
          </div>
        )}

        {/* Main Tab Switcher: Leaderboard, My Stats, Privacy */}
        <div 
          className="grid grid-cols-3 gap-1 p-1.5 rounded-2xl border mb-4"
          style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
        >
          <button
            id="ahl-tab-leaderboard"
            onClick={() => switchTab('leaderboard')}
            className="py-2 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
            style={activeTab === 'leaderboard' ? {
              backgroundColor: primaryColor,
              color: primaryTextColor,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            } : {
              color: theme.textColor,
              opacity: 0.7
            }}
          >
            <Trophy size={16} />
            <span>لوحة المتصدرين</span>
          </button>

          <button
            id="ahl-tab-mystats"
            onClick={() => switchTab('my_stats')}
            className="py-2 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
            style={activeTab === 'my_stats' ? {
              backgroundColor: primaryColor,
              color: primaryTextColor,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            } : {
              color: theme.textColor,
              opacity: 0.7
            }}
          >
            <Award size={16} />
            <span>إحصائياتي</span>
          </button>

          <button
            id="ahl-tab-privacy"
            onClick={() => switchTab('privacy')}
            className="py-2 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
            style={activeTab === 'privacy' ? {
              backgroundColor: primaryColor,
              color: primaryTextColor,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            } : {
              color: theme.textColor,
              opacity: 0.7
            }}
          >
            <Shield size={16} />
            <span>الخصوصية والظهور</span>
          </button>
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div>
            {/* Header: Selected Month & Archive Dropdown */}
            <div 
              className="border rounded-3xl p-3 sm:p-4 mb-4 shadow-xs flex items-center justify-between gap-3"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="flex items-center gap-2 truncate">
                <Calendar size={18} style={{ color: primaryColor }} className="shrink-0" />
                <span className="font-extrabold text-sm sm:text-base truncate" style={{ color: theme.textColor }}>
                  {selectedMonthName}
                </span>
                {isCurrentMonthSelected && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-bold shrink-0"
                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                  >
                    الشهر الحالي
                  </span>
                )}
              </div>

              {/* Archive Selector */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsArchiveDropdownOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderColor: `${primaryColor}30`,
                    color: theme.textColor
                  }}
                >
                  <span>الأرشيف</span>
                  <ChevronDown size={14} className={`transition-transform ${isArchiveDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu for Archive */}
                <AnimatePresence>
                  {isArchiveDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute left-0 mt-1.5 w-60 border rounded-2xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto p-1.5"
                      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                    >
                      {monthOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setSelectedMonthKey(opt.key);
                            setIsArchiveDropdownOpen(false);
                          }}
                          className="w-full text-right px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all hover:opacity-80"
                          style={selectedMonthKey === opt.key ? {
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor,
                            fontWeight: 'bold'
                          } : {
                            color: theme.textColor
                          }}
                        >
                          <span>{opt.name}</span>
                          {opt.isCurrent && (
                            <span 
                              className="text-[10px] px-1.5 py-0.5 rounded-md"
                              style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
                            >
                              الحالي
                            </span>
                          )}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedMonthKey('lifetime');
                          setIsArchiveDropdownOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border-t mt-1 hover:opacity-80"
                        style={selectedMonthKey === 'lifetime' ? {
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor,
                          fontWeight: 'bold',
                          borderColor: cardBorder
                        } : {
                          color: theme.textColor,
                          borderColor: cardBorder
                        }}
                      >
                        <span>👑 الإجمالي التراكمي</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Current User Floating Progress Bar if participating */}
            {currentUserEntry && (
              <div 
                className="mb-4 border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs"
                style={{
                  backgroundColor: `${primaryColor}12`,
                  borderColor: `${primaryColor}35`
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-2xl font-extrabold flex items-center justify-center text-sm shadow-sm"
                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                  >
                    #{currentUserEntry.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm" style={{ color: theme.textColor }}>
                        ترتيبك في {selectedMonthName}:
                      </span>
                      <span 
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                      >
                        المركز {currentUserEntry.rank}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold mt-0.5" style={{ color: primaryColor }}>
                      {currentUserEntry.formattedProgress.summaryText}
                    </div>
                  </div>
                </div>
                {currentUserEntry.khatmas > 0 && (
                  <div 
                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    <Crown size={14} />
                    <span>{currentUserEntry.khatmas} ختمة</span>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard Cards List */}
            {leaderboard.length === 0 ? (
              <div 
                className="text-center py-16 rounded-3xl border p-6"
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                <Trophy size={48} className="mx-auto mb-3 opacity-60" style={{ color: primaryColor }} />
                <h3 className="font-bold text-base" style={{ color: theme.textColor }}>
                  لا توجد قراءات مسجلة في هذا الشهر حتى الآن
                </h3>
                <button
                  onClick={() => onNavigate('quran')}
                  className="mt-4 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                  style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                >
                  <BookOpen size={16} />
                  <span>فتح المصحف والقراءة الآن</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {leaderboard.map((item) => {
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;

                  // Width hierarchy: 1st full width, 2nd slightly smaller from left, 3rd smaller than 2nd, rest smaller than 3rd
                  const cardWidthClass = isTop1
                    ? 'w-full'
                    : isTop2
                    ? 'w-[92%] mr-0 ml-auto ms-0 me-auto'
                    : isTop3
                    ? 'w-[84%] mr-0 ml-auto ms-0 me-auto'
                    : 'w-[76%] mr-0 ml-auto ms-0 me-auto';

                  // Username colors: 1st gold, 2nd silver, 3rd bronze, rest black
                  const displayNameColor = isTop1
                    ? '#D4AF37' // ذهبي
                    : isTop2
                    ? '#94A3B8' // فضي
                    : isTop3
                    ? '#CD7F32' // برونزي
                    : (theme.isDark || isBlackTheme ? '#FFFFFF' : '#000000'); // باقي الأسماء باللون الأسود

                  return (
                    <motion.div
                      key={item.record.userId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative rounded-3xl border p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 transition-all ${cardWidthClass} ${
                        item.isCurrentUser
                          ? 'shadow-sm ring-1 ring-emerald-500/30'
                          : isTop1
                          ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/40 shadow-xs'
                          : isTop2
                          ? 'bg-gradient-to-r from-slate-400/10 via-slate-400/5 to-transparent border-slate-300 dark:border-slate-700 shadow-xs'
                          : isTop3
                          ? 'bg-gradient-to-r from-amber-700/10 via-amber-700/5 to-transparent border-amber-700/30 shadow-xs'
                          : 'shadow-xs'
                      }`}
                      style={{
                        backgroundColor: item.isCurrentUser 
                          ? `${primaryColor}15` 
                          : (!isTop1 && !isTop2 && !isTop3 ? cardBg : undefined),
                        borderColor: item.isCurrentUser 
                          ? `${primaryColor}50` 
                          : (!isTop1 && !isTop2 && !isTop3 ? cardBorder : undefined)
                      }}
                    >
                      {/* Left Side: Rank Badge + User Profile */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        {/* Rank Badge - Numbers 1, 2, 3 enlarged prominently */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          {isTop1 ? (
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-md shadow-amber-500/35 border border-amber-300/50">
                              1
                            </div>
                          ) : isTop2 ? (
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-slate-400/35 border border-slate-200/50">
                              2
                            </div>
                          ) : isTop3 ? (
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-amber-700/35 border border-amber-500/50">
                              3
                            </div>
                          ) : (
                            <div 
                              className="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center"
                              style={{ backgroundColor: secondaryBg, color: theme.textColor }}
                            >
                              {item.rank}
                            </div>
                          )}
                        </div>

                        {/* Avatar */}
                        <div 
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border overflow-hidden flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30` }}
                        >
                          {item.isAnonymous ? (
                            <Shield size={18} style={{ color: primaryColor }} />
                          ) : item.displayAvatar ? (
                            <img src={item.displayAvatar} alt={item.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} style={{ color: primaryColor }} />
                          )}
                        </div>

                        {/* Name & Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 
                              className="font-black text-xs sm:text-sm truncate" 
                              style={{ color: displayNameColor }}
                            >
                              {item.displayName}
                            </h4>
                            {item.isCurrentUser && (
                              <span 
                                className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                              >
                                أنت
                              </span>
                            )}
                            {item.isAnonymous && (
                              <span 
                                className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                                style={{ backgroundColor: secondaryBg, color: theme.textColor }}
                              >
                                مجهول
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] mt-0.5 truncate opacity-70" style={{ color: theme.textColor }}>
                            {!item.isAnonymous && item.record.country && (
                              <span>{item.record.country}</span>
                            )}
                            <span>•</span>
                            <span className="font-mono">{item.pages} صفحة مسجلة</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Formatted Progress (Ajza & Remaining Pages) */}
                      <div className="text-left shrink-0">
                        <div className="text-xs sm:text-sm font-extrabold whitespace-nowrap" style={{ color: primaryColor }}>
                          {item.formattedProgress.summaryText}
                        </div>
                        {item.khatmas > 0 && (
                          <div 
                            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg mt-0.5"
                            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                          >
                            <Crown size={12} />
                            <span>{item.khatmas} ختمة</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY STATS */}
        {activeTab === 'my_stats' && (
          <div className="space-y-4">
            {/* Quick Profile Overview Card */}
            <div 
              className="border rounded-3xl p-5 shadow-xs text-center"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div 
                className="w-16 h-16 rounded-full border-2 mx-auto mb-3 overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}35` }}
              >
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={30} style={{ color: primaryColor }} />
                )}
              </div>
              <h3 className="font-extrabold text-base" style={{ color: theme.textColor }}>
                {currentUser?.username || 'قارئ المصحف'}
              </h3>

              {/* Progress Counters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                <div 
                  className="p-3.5 rounded-2xl border text-center"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
                >
                  <div className="text-xs font-bold" style={{ color: theme.textColor }}>صفحات هذا الشهر</div>
                  <div className="text-xl font-black mt-1" style={{ color: primaryColor }}>
                    {currentUserEntry?.pages || 0}
                  </div>
                </div>

                <div 
                  className="p-3.5 rounded-2xl border text-center"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
                >
                  <div className="text-xs font-bold" style={{ color: theme.textColor }}>ختمات هذا الشهر</div>
                  <div className="text-xl font-black mt-1 text-amber-500">
                    {currentUserEntry?.khatmas || 0}
                  </div>
                </div>

                <div 
                  className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl border text-center"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
                >
                  <div className="text-xs font-bold" style={{ color: theme.textColor }}>الترتيب الحالي</div>
                  <div className="text-xl font-black mt-1" style={{ color: primaryColor }}>
                    {currentUserEntry ? `#${currentUserEntry.rank}` : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('quran')}
                className="p-4 rounded-3xl border shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer"
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <BookOpen size={20} />
                </div>
                <div className="font-bold text-sm" style={{ color: theme.textColor }}>فتح المصحف</div>
              </button>

              <button
                onClick={() => onNavigate('community')}
                className="p-4 rounded-3xl border shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer"
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <User size={20} />
                </div>
                <div className="font-bold text-sm" style={{ color: theme.textColor }}>مجتمع المصحف</div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PRIVACY & VISIBILITY CONTROLS */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            {/* Calendar Selection Card (Moved here from leaderboard tab) */}
            <div 
              className="border rounded-3xl p-5 shadow-xs"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <h3 className="font-extrabold text-base flex items-center gap-2 mb-3" style={{ color: theme.textColor }}>
                <Calendar size={20} style={{ color: primaryColor }} />
                <span>نوع التقويم المعتمد للوحة المتصدرين</span>
              </h3>

              <div 
                className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl border"
                style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
              >
                <button
                  onClick={() => handleCalendarTypeChange('hijri')}
                  className="py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={calendarType === 'hijri' ? {
                    backgroundColor: primaryColor,
                    color: primaryTextColor,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  } : {
                    color: theme.textColor,
                    opacity: 0.75
                  }}
                >
                  <span>📅 الشهور الهجرية</span>
                  {calendarType === 'hijri' && <CheckCircle2 size={16} />}
                </button>

                <button
                  onClick={() => handleCalendarTypeChange('gregorian')}
                  className="py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={calendarType === 'gregorian' ? {
                    backgroundColor: primaryColor,
                    color: primaryTextColor,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  } : {
                    color: theme.textColor,
                    opacity: 0.75
                  }}
                >
                  <span>🗓️ الشهور الميلادية</span>
                  {calendarType === 'gregorian' && <CheckCircle2 size={16} />}
                </button>
              </div>
            </div>

            {/* Visibility Mode Options Card */}
            <div 
              className="border rounded-3xl p-5 shadow-xs space-y-3"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <h3 className="font-extrabold text-base flex items-center gap-2 mb-2" style={{ color: theme.textColor }}>
                <Shield size={20} style={{ color: primaryColor }} />
                <span>إعدادات خصوصية الظهور</span>
              </h3>

              {/* Option 1: Public with Name & Avatar */}
              <div
                onClick={() => handlePrivacyChange('public')}
                className="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                style={{
                  backgroundColor: userPrivacy === 'public' ? `${primaryColor}10` : secondaryBg,
                  borderColor: userPrivacy === 'public' ? primaryColor : cardBorder
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    <Eye size={20} />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm" style={{ color: theme.textColor }}>
                    الظهور بالاسم والصورة الرسمية (علني)
                  </h4>
                </div>
                {userPrivacy === 'public' && (
                  <CheckCircle2 size={20} style={{ color: primaryColor }} className="shrink-0" />
                )}
              </div>

              {/* Option 2: Anonymous (فاعل خير) */}
              <div
                onClick={() => handlePrivacyChange('anonymous')}
                className="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                style={{
                  backgroundColor: userPrivacy === 'anonymous' ? `${primaryColor}10` : secondaryBg,
                  borderColor: userPrivacy === 'anonymous' ? primaryColor : cardBorder
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Shield size={20} />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm" style={{ color: theme.textColor }}>
                    الظهور كـ "فاعل خير" (مجهول)
                  </h4>
                </div>
                {userPrivacy === 'anonymous' && (
                  <CheckCircle2 size={20} style={{ color: primaryColor }} className="shrink-0" />
                )}
              </div>

              {/* Option 3: Completely Hidden */}
              <div
                onClick={() => handlePrivacyChange('hidden')}
                className="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                style={{
                  backgroundColor: userPrivacy === 'hidden' ? `${primaryColor}10` : secondaryBg,
                  borderColor: userPrivacy === 'hidden' ? primaryColor : cardBorder
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    <EyeOff size={20} />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm" style={{ color: theme.textColor }}>
                    عدم الظهور نهائياً في القائمة (خاص)
                  </h4>
                </div>
                {userPrivacy === 'hidden' && (
                  <CheckCircle2 size={20} style={{ color: primaryColor }} className="shrink-0" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-slate-900 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-2xl shadow-xl z-50 text-center border border-slate-700"
          >
            {toastMessage}
          </motion.div>
        )}

        {/* Admin Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-5 border text-center shadow-2xl space-y-4"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                <AlertTriangle size={26} />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: theme.textColor }}>
                  تصفير ترتيب أهل القرآن بالكامل؟
                </h3>
                <p className="text-xs mt-1.5 opacity-70 leading-relaxed">
                  سيتم حذف جميع إحصائيات وترتيب القراء في صفحة أهل القرآن نهائياً والبدء من جديد كأن الصفحة جديدة تماماً.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer opacity-80 hover:opacity-100"
                  style={{ borderColor: cardBorder, color: theme.textColor }}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={async () => {
                    setIsResetting(true);
                    try {
                      await ahlAlQuranService.resetAllRankings();
                      setShowResetConfirm(false);
                      showToast('تم تصفير وحذف الترتيب بالكامل بنجاح ✅');
                    } catch (err) {
                      showToast('حدث خطأ أثناء محاولة التصفير');
                    } finally {
                      setIsResetting(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isResetting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>تأكيد الحذف والتصفير</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration Modal if user clicks register */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSaved={() => {
          setShowUsernameModal(false);
          setIsProfileComplete(communityService.isProfileComplete());
          setCurrentUser(communityService.getCurrentUser());
          showToast('مرحباً بك! تم تسجيل حسابك بنجاح وأصبحت الآن ضمن أهل القرآن 🌸');
        }}
      />

      {/* Standard BottomBar across the app */}
      <BottomBar 
        onHomeClick={onBack}
        onThemesClick={() => {}}
        showThemes={false}
      />

      {/* Tutorial Overlay */}
      <TutorialOverlay 
        tutorialId="ahl-al-quran-tutorial" 
        steps={ahlAlQuranTutorialSteps} 
        onStepChange={(stepId) => {
          if (stepId === 'ahl-leaderboard') switchTab('leaderboard');
          else if (stepId === 'ahl-stats') switchTab('my_stats');
          else if (stepId === 'ahl-privacy') switchTab('privacy');
        }}
      />
    </div>
  );
};

export default AhlAlQuranPage;
