import React, { useEffect, useLayoutEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle, Clock, Heart, BookOpen, Plus, Minus, Medal, Award, Star, Trash2, Sparkles, Share2, Calendar, RotateCcw, Check, HelpCircle } from 'lucide-react';
import { markPageAsSeen } from '../utils/badgeManager';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { WORSHIP_MENTOR_PAGE_STEPS } from '../components/Community/communityTourSteps';
import moment from 'moment-hijri';
import { useHabitTracker, DailyRecord, HabitCategory, defaultRecord, CustomHabit } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ThemePageLock from '../components/ThemePageLock';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import Confetti from 'react-dom-confetti';
import HabitArchive from '../components/HabitArchive';
import WeeklyAchievementModal from '../components/WeeklyAchievementModal';
import CustomHabitModal from '../components/CustomHabitModal';
import { shareDailyHabitCard } from '../utils/habitShareHelper';
import { gregorianMonths, hijriMonths } from '../data/calendarData';

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II',
  'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
];

const CONFETTI_CONFIG = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

interface HabitTrackerProps {
  onBack: () => void; onNavigate: (id: string, params?: any) => void; 
}

const ProgressRing = ({ progress, size = 100, strokeWidth = 8, color }: { progress: number, size?: number, strokeWidth?: number, color: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-gray-200 dark:text-gray-700" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-xl font-bold font-sans" style={{ color }}>{progress}%</div>
    </div>
  );
};

const HabitTracker: React.FC<HabitTrackerProps> = ({ onBack , onNavigate }) => {
  const { theme, themeKey } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
  const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
  const cardBorderColor = isDefaultTheme 
    ? '#000000' 
    : (isBlackTheme 
        ? '#FFFFFF' 
        : (theme.palette?.[0] || '#000000'));
  const hexColor = isBlackTheme ? '#FFFFFF' : (theme.palette && theme.palette.length > 0 ? theme.palette[0] : '#059669');
  const todayStr = moment().format('YYYY-MM-DD');

  // Selected date allowing the user to view and record any past day
  const [selectedDate, setSelectedDate] = useState<string>(() => moment().format('YYYY-MM-DD'));
  const isSelectedToday = selectedDate === todayStr;
  const dateInputRef = useRef<HTMLInputElement>(null);

  const records = useHabitTracker((state) => state.records);
  const customHabits = useHabitTracker((state) => state.customHabits) || [];
  const addCustomHabit = useHabitTracker((state) => state.addCustomHabit);
  const removeCustomHabit = useHabitTracker((state) => state.removeCustomHabit);
  const toggleHabit = useHabitTracker((state) => state.toggleHabit);
  const setQuranPages = useHabitTracker((state) => state.setQuranPages);
  const autoSyncEnabled = useHabitTracker((state) => state.autoSyncEnabled);
  const setAutoSyncEnabled = useHabitTracker((state) => state.setAutoSyncEnabled);
  const getDailyProgress = useHabitTracker((state) => state.getDailyProgress);
  const getDailyScoreBreakdown = useHabitTracker((state) => state.getDailyScoreBreakdown);
  const getStreak = useHabitTracker((state) => state.getStreak);
  const getHeatmapData = useHabitTracker((state) => state.getHeatmapData);

  const [viewMode, setViewMode] = useState<'tracker' | 'archive'>('tracker');
  const [showStreakMedal, setShowStreakMedal] = useState(false);
  const [activeStreakMsg, setActiveStreakMsg] = useState('');
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showCustomHabitModal, setShowCustomHabitModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; title: string } | null>(null);
  const [trackerToast, setTrackerToast] = useState('');
  const [isSharingDaily, setIsSharingDaily] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    markPageAsSeen('habit-tracker');
    if (!getGuideSeen('worship_mentor_page_spotlight')) {
      setShowGuide(true);
    }
  }, []);

  const showTrackerToast = (msg: string) => {
    setTrackerToast(msg);
    setTimeout(() => setTrackerToast(''), 3000);
  };

  // Get record and detailed score breakdown for the selected date
  const currentRecord = records[selectedDate] || defaultRecord;
  const scoreBreakdown = getDailyScoreBreakdown(selectedDate);
  const progress = scoreBreakdown.percentage;

  const prevDayStr = moment(selectedDate).subtract(1, 'days').format('YYYY-MM-DD');
  const prevDayProgress = getDailyProgress(prevDayStr);
  const diff = progress - prevDayProgress;

  const selectedMoment = moment(selectedDate, 'YYYY-MM-DD');
  const selectedDayName = isEn ? selectedMoment.format('dddd') : ARABIC_DAYS[selectedMoment.day()];
  const selectedFormattedDate = selectedMoment.locale(isEn ? 'en' : 'ar').format(isEn ? 'D MMMM YYYY' : 'D MMMM YYYY');

  const { selectedGregorianShort, selectedHijriShort, selectedHijriDate } = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const localNoon = new Date(y || 2026, (m || 1) - 1, d || 1, 12, 0, 0);

    const gregShort = isEn
      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(localNoon)
      : `${d} ${gregorianMonths[(m || 1) - 1]?.name || ''}`;

    let hDay = selectedMoment.iDate();
    let hMonth = selectedMoment.iMonth() + 1;
    let hYear = selectedMoment.iYear();

    try {
      const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).formatToParts(localNoon);
      const pDay = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);
      const pMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10);
      const pYear = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
      if (pDay > 0 && pMonth >= 1 && pMonth <= 12 && pYear > 0) {
        hDay = pDay;
        hMonth = pMonth;
        hYear = pYear;
      }
    } catch {}

    const hijriMonthLabel = isEn
      ? (HIJRI_MONTHS_EN[hMonth - 1] || '')
      : (hijriMonths[hMonth - 1]?.name || '');

    return {
      selectedGregorianShort: isEn ? gregShort : `${gregShort} م`,
      selectedHijriShort: isEn ? `${hDay} ${hijriMonthLabel}` : `${hDay} ${hijriMonthLabel} هـ`,
      selectedHijriDate: isEn ? `${hDay} ${hijriMonthLabel} ${hYear}` : `${hDay} ${hijriMonthLabel} ${hYear} هـ`
    };
  }, [selectedDate, isEn, selectedMoment]);

  const achievementHeaderRowRef = useRef<HTMLDivElement>(null);
  const achievementTitleRef = useRef<HTMLHeadingElement>(null);
  const achievementBadgeRef = useRef<HTMLSpanElement>(null);
  const [achievementTitleSize, setAchievementTitleSize] = useState<number>(14);

  const fitAchievementHeaderRow = useCallback(() => {
    const rowEl = achievementHeaderRowRef.current;
    const titleEl = achievementTitleRef.current;
    const badgeEl = achievementBadgeRef.current;
    if (!rowEl || !titleEl) return;

    const badgeWidth = badgeEl ? badgeEl.offsetWidth + 8 : 0;
    const availableWidth = rowEl.clientWidth - badgeWidth - 2;
    if (availableWidth <= 0) return;

    const maxSize = typeof window !== 'undefined' && window.innerWidth >= 640 ? 16.5 : 14.5;
    const minSize = 9.5;
    let targetSize = maxSize;
    titleEl.style.fontSize = `${targetSize}px`;

    if (titleEl.scrollWidth > availableWidth) {
      const ratio = availableWidth / titleEl.scrollWidth;
      targetSize = Math.max(minSize, Math.floor(targetSize * ratio * 0.97 * 10) / 10);
      titleEl.style.fontSize = `${targetSize}px`;

      while (titleEl.scrollWidth > availableWidth && targetSize > minSize) {
        targetSize = Math.max(minSize, Number((targetSize - 0.25).toFixed(2)));
        titleEl.style.fontSize = `${targetSize}px`;
      }
    }
    setAchievementTitleSize(targetSize);
  }, [selectedDate, isEn, isSelectedToday, scoreBreakdown.totalEarned, scoreBreakdown.totalAvailable]);

  useLayoutEffect(() => {
    fitAchievementHeaderRow();
  }, [fitAchievementHeaderRow, viewMode]);

  useEffect(() => {
    const rowEl = achievementHeaderRowRef.current;
    if (!rowEl) return;

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => fitAchievementHeaderRow());
      ro.observe(rowEl);
    }
    window.addEventListener('resize', fitAchievementHeaderRow);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', fitAchievementHeaderRow);
    };
  }, [fitAchievementHeaderRow, viewMode]);

  let comparisonMsg = '';
  let comparisonClass = '';

  if (diff > 0) {
    comparisonMsg = isEn ? `Higher than previous day by ${diff}% 📈` : `أعلى من اليوم السابق بـ ${diff}% 📈`;
    comparisonClass = isBlackTheme ? 'bg-white/10 text-white border border-white/20' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  } else if (diff < 0) {
    comparisonMsg = isEn ? `Lower than previous day by ${Math.abs(diff)}% 📉` : `أقل من اليوم السابق بـ ${Math.abs(diff)}% 📉`;
    comparisonClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  } else {
    comparisonMsg = isEn ? `Same progress as previous day ➖` : `نفس إنجاز اليوم السابق ➖`;
    comparisonClass = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }

  const handleHomeClick = () => {
    if (showWeeklyModal) {
      setShowWeeklyModal(false);
      return;
    }
    if (showCustomHabitModal) {
      setShowCustomHabitModal(false);
      return;
    }
    if (viewMode === 'archive') {
      setViewMode('tracker');
    } else {
      onBack();
    }
  };

  // Share daily habit card with native app selector
  const handleShareDailyCard = async () => {
    if (isSharingDaily) return;
    setIsSharingDaily(true);
    try {
      await shareDailyHabitCard({
        date: selectedDate,
        record: currentRecord,
        progress,
        customHabits,
        theme,
        hexColor,
        isBlackTheme,
        setToastMessage: showTrackerToast
      });
    } catch (e) {
      console.error('Share error:', e);
      showTrackerToast('تعذر مشاركة الصورة');
    } finally {
      setIsSharingDaily(false);
    }
  };

  useEffect(() => {
    const interceptor = () => {
      if (showGuide) {
        setShowGuide(false);
        return true;
      }
      if (showWeeklyModal) {
        setShowWeeklyModal(false);
        return true;
      }
      if (showCustomHabitModal) {
        setShowCustomHabitModal(false);
        return true;
      }
      if (habitToDelete) {
        setHabitToDelete(null);
        return true;
      }
      if (viewMode === 'archive') {
        setViewMode('tracker');
        return true;
      }
      return false;
    };
    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [viewMode, showWeeklyModal, showCustomHabitModal, habitToDelete]);

  const heatmapData = useMemo(() => getHeatmapData(), [records, todayStr, selectedDate]);

  const filteredCustomHabits = useMemo(() => {
    const dayOfWeek = moment(selectedDate).day();
    return customHabits.filter((habit) => {
      if (!habit.days || habit.days.length === 0) return true;
      return habit.days.includes(dayOfWeek);
    });
  }, [customHabits, selectedDate]);

  useEffect(() => {
    // Schedule Notifications on Mount
    const schedule = async () => {
      if (Capacitor.isNativePlatform()) {
        const perms = await LocalNotifications.checkPermissions();
        if (perms.display === 'granted') {
          try {
            await LocalNotifications.deleteChannel({ id: 'athkar_reminders_channel' });
            await LocalNotifications.deleteChannel({ id: 'athkar_reminders_alarm_channel' });
            await LocalNotifications.createChannel({
              id: 'athkar_reminders_chime_channel',
              name: 'أذكار وتنبيهات عامة',
              description: 'قناة تنبيهات أذكار الصباح والمساء والسنن والأدعية بنغمة قصيرة وخفيفة',
              importance: 5,
              sound: 'chime.mp3',
              vibration: true,
              visibility: 1
            });
          } catch (e) {}

          await LocalNotifications.schedule({
            notifications: [
              {
                id: 9501,
                title: 'مربّي العبادات',
                body: 'صلاة الضحى غنيمة.. هل صليتها اليوم؟',
                schedule: { allowWhileIdle: true, on: { hour: 9, minute: 30 } },
                channelId: 'athkar_reminders_chime_channel',
                sound: 'chime.mp3',
                smallIcon: 'ic_stat_name',
                extra: { page: 'habit-tracker', playSound: true, soundFile: 'chime.mp3' }
              },
              {
                id: 9502,
                title: 'يوم الجمعة',
                body: 'لا تنسَ الاتصال بوالديك والدعاء لأحمد وليلى',
                // Capacitor Weekdays: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
                schedule: { allowWhileIdle: true, on: { weekday: 6, hour: 10, minute: 0 } },
                channelId: 'athkar_reminders_chime_channel',
                sound: 'chime.mp3',
                smallIcon: 'ic_stat_name',
                extra: { page: 'habit-tracker', playSound: true, soundFile: 'chime.mp3' }
              }
            ]
          });
        }
      }
    };
    schedule();
  }, []);

  const handleToggle = (category: HabitCategory, habitId: string, customCheck?: () => boolean) => {
    const wasCompleted = customCheck 
      ? customCheck() 
      : (category === 'custom' ? !!(currentRecord.custom && currentRecord.custom[habitId]) : (currentRecord[category] as any)?.[habitId]);
    
    toggleHabit(selectedDate, category, habitId);
    
    // Check streak after toggle if we are turning it ON
    if (!wasCompleted) {
      setTimeout(() => {
        const currentStreak = getStreak(category, habitId);
        // Only show if it hit exactly a multiple of 7, just for motivation
        if (currentStreak > 0 && currentStreak % 7 === 0) {
          setActiveStreakMsg(isEn ? `Well done! You completed 7 consecutive days in this habit` : `أحسنت! أتممت 7 أيام متتالية في هذه العبادة`);
          setShowStreakMedal(true);
          setTimeout(() => setShowStreakMedal(false), 4000);
        }
      }, 100);
    }
  };

  const prayersList = [
    { id: 'fajr', label: isEn ? 'Fajr' : 'الفجر' },
    { id: 'dhuhr', label: isEn ? 'Dhuhr' : 'الظهر' },
    { id: 'asr', label: isEn ? 'Asr' : 'العصر' },
    { id: 'maghrib', label: isEn ? 'Maghrib' : 'المغرب' },
    { id: 'isha', label: isEn ? 'Isha' : 'العشاء' },
  ];

  const additionalPrayersList = [
    { id: 'witr', label: isEn ? 'Witr' : 'صلاة الوتر', points: 3 },
    { id: 'qiyam', label: isEn ? 'Qiyam' : 'قيام الليل', points: 3 },
    { id: 'duha', label: isEn ? 'Duha' : 'صلاة الضحى', points: 2 },
    { id: 'masjid', label: isEn ? 'Tahiyatul Masjid' : 'تحية المسجد', points: 1 },
    { id: 'tasbih', label: isEn ? 'Tasabih' : 'صلاة التسابيح', points: 1 },
    { id: 'hajah', label: isEn ? 'Hajah' : 'صلاة الحاجة', points: 1 },
    { id: 'tawbah', label: isEn ? 'Tawbah' : 'صلاة التوبة', points: 1 },
    { id: 'istikharah', label: isEn ? 'Istikharah' : 'صلاة الاستخارة', points: 1 },
  ];

  const adhkarList = [
    { id: 'sabah', label: isEn ? 'Morning Adhkar' : 'أذكار الصباح', points: 4 },
    { id: 'masaa', label: isEn ? 'Evening Adhkar' : 'أذكار المساء', points: 4 },
    { id: 'salah', label: isEn ? 'Salah Adhkar' : 'أذكار الصلاة', points: 3 },
    { id: 'istighfar', label: isEn ? 'Istighfar' : 'الاستغفار', points: 2 },
    { id: 'adia', label: isEn ? 'Supplications' : 'الأدعية', points: 2 },
  ];

  const ethicsList = [
    { id: 'parents', label: isEn ? 'Kindness to Parents' : 'بر الوالدين والدعاء لهما', points: 5 },
    { id: 'charity', label: isEn ? 'Charity' : 'الصدقة', points: 5 },
    { id: 'visitFamily', label: isEn ? 'Visit Relatives' : 'زيارة الأهل والأقارب', points: 3 },
    { id: 'visitSick', label: isEn ? 'Visit Sick' : 'زيارة مريض', points: 2 },
  ];

  const handleConfirmDelete = () => {
    if (!habitToDelete) return;
    removeCustomHabit(habitToDelete.id);
    showTrackerToast(isEn ? `Habit "${habitToDelete.title}" deleted` : `تم حذف عبادة "${habitToDelete.title}"`);
    setHabitToDelete(null);
  };

  const renderPrayerCard = (id: string, label: string) => {
    const fardId = id;
    const sunnahId = `${id}Sunnah`;
    
    // For selected date rendering:
    const isFardCompleted = (currentRecord.prayers as any)?.[fardId];
    const isSunnahCompleted = (currentRecord.prayers as any)?.[sunnahId];
    
    return (
      <div 
        key={id} 
        id={`prayer-card-${id}`} 
        className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-3 shadow-sm border mb-0"
        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
      >
         <span className="font-bold text-sm block mb-2 px-1 text-gray-800 dark:text-gray-200">{label}</span>
         <div className="flex gap-2">
            <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => handleToggle('prayers', fardId)}
               className={`flex-1 flex items-center justify-between py-1.5 px-2 rounded-xl text-xs font-semibold transition-colors border ${isFardCompleted ? (isBlackTheme ? 'text-black' : 'text-white') : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
               style={isFardCompleted ? { backgroundColor: hexColor, borderColor: hexColor } : {}}
            >
               <span>{isEn ? 'Fard' : 'الفريضة'}</span>
               <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isFardCompleted ? 'border-transparent' : 'border-gray-300 dark:border-gray-600'}`} style={isFardCompleted ? { backgroundColor: isBlackTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)' } : {}}>
                  {isFardCompleted && <CheckCircle className={`w-2.5 h-2.5 ${isBlackTheme ? 'text-black' : 'text-white'}`} />}
               </div>
            </motion.button>
            <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => handleToggle('prayers', sunnahId)}
               className={`flex-1 flex items-center justify-between py-1.5 px-2 rounded-xl text-xs font-semibold transition-colors border ${isSunnahCompleted ? (isBlackTheme ? 'text-black' : 'text-white') : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
               style={isSunnahCompleted ? { backgroundColor: hexColor, borderColor: hexColor } : {}}
            >
               <span>{isEn ? 'Sunnah' : 'السنة'}</span>
               <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSunnahCompleted ? 'border-transparent' : 'border-gray-300 dark:border-gray-600'}`} style={isSunnahCompleted ? { backgroundColor: isBlackTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)' } : {}}>
                  {isSunnahCompleted && <CheckCircle className={`w-2.5 h-2.5 ${isBlackTheme ? 'text-black' : 'text-white'}`} />}
               </div>
            </motion.button>
         </div>
      </div>
    );
  };

  const renderCard = (category: HabitCategory, habitId: string, label: string, _points?: number) => {
    const isCompleted = (currentRecord[category] as any)?.[habitId];
    const streak = getStreak(category, habitId);
    
    return (
      <motion.button
        key={`${category}-${habitId}`}
        whileTap={{ scale: 0.96 }}
        onClick={() => handleToggle(category, habitId)}
        className={`w-full flex items-center justify-between p-3 rounded-2xl mb-0 border backdrop-blur-sm transition-all ${
          isCompleted 
            ? 'bg-white shadow-md dark:bg-gray-800' 
            : 'bg-white/50 dark:bg-gray-800/50'
        }`}
        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`font-semibold text-xs sm:text-sm px-1 truncate ${isCompleted ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {streak > 1 && (
            <div className="flex items-center gap-0.5 opacity-70 px-1 py-[1px] rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-[10px] font-bold">
              <span>🔥</span> {streak}
            </div>
          )}
          <div 
            className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
              isCompleted ? 'border-transparent' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={isCompleted ? { backgroundColor: hexColor } : {}}
          >
            {isCompleted && <CheckCircle className={`w-3 h-3 ${isBlackTheme ? 'text-black' : 'text-white'}`} />}
          </div>
        </div>
      </motion.button>
    );
  };

  const renderCustomHabitCard = (habit: CustomHabit) => {
    const isCompleted = !!(currentRecord.custom && currentRecord.custom[habit.id]);
    const streak = getStreak('custom', habit.id);
    const dayOfWeek = moment(selectedDate).day();
    const isScheduledToday = !habit.days || habit.days.length === 0 || habit.days.includes(dayOfWeek);

    let scheduleLabel = 'يومياً';
    if (habit.days && habit.days.length > 0) {
      if (habit.days.length === 2 && habit.days.includes(1) && habit.days.includes(4)) {
        scheduleLabel = 'الاثنين والخميس';
      } else if (habit.days.length === 1 && habit.days.includes(5)) {
        scheduleLabel = 'الجمعة';
      } else {
        const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
        scheduleLabel = habit.days.map((d) => dayNames[d]).join('، ');
      }
    }

    return (
      <div
        key={habit.id}
        className={`relative flex items-center justify-between p-3 rounded-2xl border backdrop-blur-sm transition-all ${
          isCompleted
            ? 'bg-white shadow-md dark:bg-gray-800'
            : 'bg-white/60 dark:bg-gray-800/60'
        }`}
        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-1">
          <span className="text-xl shrink-0 select-none">{habit.icon || '⭐'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-semibold text-xs sm:text-sm truncate ${isCompleted ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {habit.title}
              </span>
              {isScheduledToday ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold shrink-0">
                  {isSelectedToday ? 'اليوم 🌟' : 'مجدول 🌟'}
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 font-medium shrink-0">
                  {scheduleLabel}
                </span>
              )}
            </div>
            {habit.description && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {streak > 1 && (
            <div className="flex items-center gap-0.5 opacity-80 px-1.5 py-[2px] rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-[10px] font-bold">
              <span>🔥</span> {streak}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleToggle('custom', habit.id)}
            className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
              isCompleted ? 'border-transparent' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={isCompleted ? { backgroundColor: hexColor } : {}}
            title={isCompleted ? (isEn ? 'Completed' : 'تم الإنجاز') : (isEn ? 'Mark as completed' : 'تحديد كمنجز')}
          >
            {isCompleted && <CheckCircle className={`w-4 h-4 ${isBlackTheme ? 'text-black' : 'text-white'}`} />}
          </motion.button>

          <button
            onClick={() => setHabitToDelete({ id: habit.id, title: habit.title })}
            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title={isEn ? 'Delete Habit' : 'حذف العبادة'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  if (viewMode === 'archive') {
    return (
      <HabitArchive 
        onBack={() => setViewMode('tracker')} 
        onHome={() => onNavigate('home')}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setViewMode('tracker');
          showTrackerToast(isEn ? `Opened habits for ${date}` : `تم فتح عبادات يوم ${date}`);
        }} 
      />
    );
  }

  return (
    <div className={`h-screen h-[100dvh] max-h-screen max-h-[100dvh] flex flex-col bg-transparent relative overflow-hidden`} dir={isEn ? 'ltr' : 'rtl'}>
      <header className="app-top-bar shrink-0">
          <div className="app-top-bar__inner">
              <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* سهم الرجوع للخلف وأيقونة التفعيل */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center gap-1.5`}>
                            <button
                                onClick={handleHomeClick}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? 'Back' : 'رجوع للخلف'}
                                aria-label={isEn ? 'Back' : 'رجوع للخلف'}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    const next = !autoSyncEnabled;
                                    setAutoSyncEnabled(next);
                                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                                        try { navigator.vibrate(30); } catch {}
                                    }
                                    showTrackerToast(
                                        next 
                                            ? (isEn ? 'Auto-Sync enabled ⚡' : 'تم تفعيل الربط التلقائي للعبادات ⚡') 
                                            : (isEn ? 'Auto-Sync disabled 🔒' : 'تم تعطيل الربط التلقائي للعبادات 🔒')
                                    );
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={
                                    isEn 
                                        ? (autoSyncEnabled ? 'Auto-Sync Worship: Enabled (Click to disable)' : 'Auto-Sync Worship: Disabled (Click to enable)') 
                                        : (autoSyncEnabled ? 'الربط التلقائي للعبادات: مفعّل (اضغط للتعطيل)' : 'الربط التلقائي للعبادات: معطّل (اضغط للتفعيل)')
                                }
                                aria-label={
                                    isEn 
                                        ? (autoSyncEnabled ? 'Auto-Sync Worship: Enabled' : 'Auto-Sync Worship: Disabled') 
                                        : (autoSyncEnabled ? 'الربط التلقائي للعبادات: مفعّل' : 'الربط التلقائي للعبادات: معطّل')
                                }
                            >
                                <div className={`w-[19px] h-[19px] rounded-full border-[1.5px] border-white/90 dark:border-white/80 shadow-xs transition-all duration-300 flex items-center justify-center ${
                                    autoSyncEnabled 
                                        ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 text-white shadow-emerald-500/30 ring-1.5 ring-emerald-500/25' 
                                        : 'bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 text-white shadow-red-500/30 ring-1.5 ring-red-500/25'
                                }`}>
                                    {autoSyncEnabled ? (
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    ) : (
                                        <span className="w-1.5 h-0.5 bg-white/95 rounded-full" />
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {isEn ? 'Worship Habit Tracker' : 'مربّي العبادات'}
                            </h1>
                        </div>

                        {/* أيقونة المنزل */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1.5`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Worship Mentor Guide" : "دليل وشرح مربي العبادات"}
                                aria-label={isEn ? "Worship Mentor Guide" : "دليل وشرح مربي العبادات"}
                            >
                                <HelpCircle size={19} />
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? 'Home' : 'الصفحة الرئيسية'}
                                aria-label={isEn ? 'Home' : 'الصفحة الرئيسية'}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
              </div>
          </div>
      </header>

      {/* Content */}
      <main 
        className="w-full flex-1 min-h-0 overflow-y-auto px-4 pt-2 overscroll-contain"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        
        {/* Past Day Notice Banner */}
        {!isSelectedToday && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 border text-amber-800 dark:text-amber-200 rounded-2xl p-2.5 px-3.5 mb-3 flex items-center justify-between gap-2 text-xs"
            style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🗓️</span>
              <span className="truncate">
                {isEn ? `You are recording habits for a past day:` : `أنت تسجل عبادات يوم سابق:`} <b className="font-bold underline">{selectedDayName} ({selectedDate})</b>
              </span>
            </div>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors shrink-0"
            >
              {isEn ? 'Back to today' : 'العودة لليوم'}
            </button>
          </motion.div>
        )}

        {/* Daily Achievement Card (Kept at the top) */}
        <div 
          id="daily-achievement-card" 
          className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-3 sm:p-3.5 shadow-sm border mb-3"
          style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
        >
            {/* Header: Title (with Gregorian + Hijri dates on one single row) & Total Points Badge */}
            <div ref={achievementHeaderRowRef} className="flex items-center justify-between gap-1.5 mb-2 flex-nowrap">
                <h2
                    ref={achievementTitleRef}
                    className="font-bold font-sans dark:text-white flex items-center gap-1 whitespace-nowrap min-w-0 overflow-hidden leading-tight"
                    style={{ fontSize: `${achievementTitleSize}px` }}
                >
                    <span className="shrink-0">{isEn ? `Achievement of ${isSelectedToday ? 'Today' : selectedDayName}` : `إنجاز ${isSelectedToday ? 'اليوم' : selectedDayName}`}</span>
                    <span className="font-black text-gray-900 dark:text-white shrink-0">
                        ({selectedGregorianShort} • {selectedHijriShort})
                    </span>
                </h2>
                <span
                    ref={achievementBadgeRef}
                    className="text-[11px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap shrink-0"
                >
                    {scoreBreakdown.totalEarned} / {scoreBreakdown.totalAvailable} {isEn ? 'pts' : 'نقطة'}
                </span>
            </div>

            <div className="flex items-end justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Action buttons: الأسبوع والسجل جنباً إلى جنب بدون أيقونات */}
                  <div className="flex items-center gap-2 flex-nowrap mb-2 overflow-x-auto no-scrollbar">
                    <motion.button
                       id="weekly-card-btn"
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setShowWeeklyModal(true)}
                       className="flex items-center justify-center px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 shadow-sm shrink-0 whitespace-nowrap"
                    >
                       <span>{isEn ? 'Weekly' : 'الأسبوع'}</span>
                    </motion.button>

                    <motion.button
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setViewMode('archive')}
                       className="flex items-center justify-center px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-transform bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 shadow-sm shrink-0 whitespace-nowrap"
                       style={{ color: hexColor }}
                    >
                       <span>{isEn ? 'Record' : 'السجل'}</span>
                    </motion.button>
                  </div>

                  {progress === 100 && (
                    <p className="opacity-70 text-[11px] leading-relaxed font-sans dark:text-gray-300 mb-1 max-w-[200px]">
                      {isEn ? "Masha'Allah! A day full of devotion." : 'ما شاء الله! يوم مليء بالطاعات.'}
                    </p>
                  )}
                  
                  {/* Heatmap Row - Clickable days to select any day */}
                  <div className="flex flex-col gap-1 w-full" dir={isEn ? 'ltr' : 'rtl'}>
                    <div className="flex justify-start gap-1 w-full">
                      {heatmapData.slice(0, 15).map((day, i) => {
                        let opacity = 0.1;
                        if (day.progress > 0) opacity = 0.4;
                        if (day.progress >= 50) opacity = 0.7;
                        if (day.progress === 100) opacity = 1;

                        let bgClass = '';
                        let inlineStyle: any = {};
                        
                        const isPast = day.date < todayStr;
                        const isDayToday = day.date === todayStr;
                        const isDaySelected = day.date === selectedDate;
                        
                        if (day.progress > 0) {
                           inlineStyle = { backgroundColor: hexColor, opacity };
                        } else if (isPast) {
                           inlineStyle = { backgroundColor: hexColor, opacity: 0.15 };
                        } else if (isDayToday) {
                           inlineStyle = { backgroundColor: hexColor, opacity: 0.3 };
                        } else {
                           bgClass = 'bg-gray-200 dark:bg-gray-700 opacity-50'; 
                        }
                        
                        // Highlight selected box
                        if (isDaySelected) {
                           inlineStyle = { ...inlineStyle, border: `2px solid ${isBlackTheme ? '#FFFFFF' : '#f59e0b'}` };
                        } else if (isDayToday) {
                           inlineStyle = { ...inlineStyle, border: `1.5px solid ${hexColor}` };
                        }

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedDate(day.date);
                              showTrackerToast(`عرض عبادات يوم ${day.date}`);
                            }}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-transform hover:scale-125 cursor-pointer flex-grow-0 shrink-0 ${bgClass}`}
                            style={inlineStyle}
                            title={`${day.date}: ${day.progress}% (انقر للعرض والتسجيل)`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-start gap-1 w-full">
                      {heatmapData.slice(15).map((day, i) => {
                        let opacity = 0.1;
                        if (day.progress > 0) opacity = 0.4;
                        if (day.progress >= 50) opacity = 0.7;
                        if (day.progress === 100) opacity = 1;

                        let bgClass = '';
                        let inlineStyle: any = {};
                        
                        const isPast = day.date < todayStr;
                        const isDayToday = day.date === todayStr;
                        const isDaySelected = day.date === selectedDate;
                        
                        if (day.progress > 0) {
                           inlineStyle = { backgroundColor: hexColor, opacity };
                        } else if (isPast) {
                           inlineStyle = { backgroundColor: hexColor, opacity: 0.15 };
                        } else if (isDayToday) {
                           inlineStyle = { backgroundColor: hexColor, opacity: 0.3 };
                        } else {
                           bgClass = 'bg-gray-200 dark:bg-gray-700 opacity-50'; 
                        }
                        
                        // Highlight selected box
                        if (isDaySelected) {
                           inlineStyle = { ...inlineStyle, border: `2px solid ${isBlackTheme ? '#FFFFFF' : '#f59e0b'}` };
                        } else if (isDayToday) {
                           inlineStyle = { ...inlineStyle, border: `1.5px solid ${hexColor}` };
                        }

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedDate(day.date);
                              showTrackerToast(`عرض عبادات يوم ${day.date}`);
                            }}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-transform hover:scale-125 cursor-pointer flex-grow-0 shrink-0 ${bgClass}`}
                            style={inlineStyle}
                            title={`${day.date}: ${day.progress}% (انقر للعرض والتسجيل)`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                </div>
                <div className="shrink-0 flex flex-col items-center justify-end self-end pb-0.5">
                  <ProgressRing progress={progress} color={hexColor} size={54} strokeWidth={4.5} />
                </div>
            </div>
        </div>
        
        {/* Prayers */}
        <section className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 dark:text-white">
            <Clock className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            {isEn ? 'Obligatory Prayers & Sunnah' : 'الصلوات المكتوبة والسنن الرواتب'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {prayersList.map(habit => renderPrayerCard(habit.id, habit.label))}
          </div>
        </section>
        
        {/* Additional Prayers */}
        <section className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 dark:text-white">
            <Heart className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            {isEn ? 'Supererogatory Prayers' : 'صلوات النوافل'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {additionalPrayersList.map(habit => renderCard('prayers', habit.id, habit.label, habit.points))}
          </div>
        </section>

        {/* Quran */}
        <section id="quran-habit-section" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 dark:text-white">
              <BookOpen className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
              {isEn ? 'Quran Recitation' : 'الورد القرآني'}
            </h3>
            <div className="flex items-center gap-1.5">
              {autoSyncEnabled && isSelectedToday && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{isEn ? 'Auto ⚡' : 'تلقائي ⚡'}</span>
                </span>
              )}
              {(currentRecord.quran?.pages || 0) > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  {isEn ? 'Done ✓' : 'مكتمل ✓'}
                </span>
              )}
            </div>
          </div>
          <div 
            className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 shadow-sm border"
            style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm dark:text-gray-200 block">{isEn ? 'Pages Read' : 'الصفحات المقروءة'}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {(() => {
                    const p = currentRecord.quran?.pages || 0;
                    if (p <= 0) {
                      return autoSyncEnabled
                        ? (isEn ? 'Auto-calculated during actual reading, manual edit available' : 'يتم الاحتساب تلقائياً وفق معدل القراءة الفعلي، مع إمكانية التعديل يدوياً')
                        : (isEn ? 'Enter pages manually' : 'اكتب عدد صفحات القرآن المقروءة يدوياً');
                    }
                    if (p === 20) return isEn ? 'Full Juz (20 pages) 🌟' : 'جزء كامل (20 صفحة) 🌟';
                    if (p > 20) {
                      const juzCount = Math.floor(p / 20);
                      const rem = p % 20;
                      return isEn
                        ? `${p} pages (${juzCount} Juz${rem > 0 ? ` + ${rem}p` : ''}) 🌟`
                        : `${p} صفحة (${juzCount === 1 ? 'جزء' : juzCount === 2 ? 'جزءان' : `${juzCount} أجزاء`}${rem > 0 ? ` و${rem} ص` : ''}) 🌟`;
                    }
                    if (p === 10) return isEn ? 'Half Juz (10 pages) 📖' : 'نصف جزء (10 صفحات) 📖';
                    if (p > 10) return isEn ? `${p} pages ✨` : `${p} صفحة ✨`;
                    if (p >= 5) return isEn ? `${p} pages 🌿` : `${p} صفحات 🌿`;
                    if (p >= 3) return isEn ? `${p} pages` : `${p} صفحات`;
                    if (p === 2) return isEn ? '2 pages' : 'صفحتان';
                    return isEn ? '1 page' : 'صفحة واحدة';
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1.5">
                 <button 
                    type="button"
                    onClick={() => setQuranPages(selectedDate, Math.max(0, (currentRecord.quran?.pages || 0) - 1))}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
                 >
                    <Minus className="w-4 h-4 dark:text-white" />
                 </button>
                 <input
                    type="number"
                    min="0"
                    max="604"
                    value={currentRecord.quran?.pages ?? 0}
                    onChange={(e) => {
                       const val = parseInt(e.target.value, 10);
                       setQuranPages(selectedDate, isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    className="font-bold w-12 text-center text-base bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                 />
                 <button 
                    type="button"
                    onClick={() => setQuranPages(selectedDate, (currentRecord.quran?.pages || 0) + 1)}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
                 >
                    <Plus className="w-4 h-4 dark:text-white" />
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* Adhkar */}
        <section className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 dark:text-white">
            <Heart className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            {isEn ? 'Adhkar' : 'الأذكار'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
             {adhkarList.map(habit => renderCard('adhkar', habit.id, habit.label, habit.points))}
          </div>
        </section>

        {/* Ethics & Parents */}
        <section className="mb-8">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 dark:text-white">
            <Medal className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            {isEn ? 'Kindness & Ethics' : 'بر الوالدين والأخلاق'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
              {ethicsList.map(habit => renderCard('ethics', habit.id, habit.label, habit.points))}
          </div>
        </section>

        {/* Custom Habits & Worships */}
        <section id="custom-habits-section" className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 dark:text-white">
              <Star className="w-4 h-4 opacity-80 text-amber-500" />
              {isEn ? 'Custom Habits' : 'العبادات والعادات المخصصة'}
          {filteredCustomHabits.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {filteredCustomHabits.length}
            </span>
          )}
        </h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCustomHabitModal(true)}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-opacity hover:opacity-90 ${isBlackTheme ? 'text-black' : 'text-white'}`}
          style={{ backgroundColor: hexColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isEn ? 'Add Habit' : 'إضافة عبادة'}</span>
        </motion.button>
      </div>

      {filteredCustomHabits.length > 0 && (
        <div className="space-y-2">
          {filteredCustomHabits.map((habit) => renderCustomHabitCard(habit))}
        </div>
      )}
    </section>

        {/* 1. Day Navigation & Date Selector (Moved to bottom) */}
        <div 
          className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-md rounded-2xl p-3 shadow-sm border mb-3 flex items-center justify-between gap-2"
          style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
        >
          {/* Previous Day Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setSelectedDate(prev => moment(prev).subtract(1, 'day').format('YYYY-MM-DD'))}
            className="py-1.5 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 text-xs font-bold shrink-0"
            title={isEn ? 'Previous Day' : 'اليوم السابق'}
          >
            <ChevronRight className="w-4 h-4" />
            <span>{isEn ? 'Previous' : 'السابق'}</span>
          </motion.button>

          {/* Current Date Display & Picker */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
                className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
                title={isEn ? 'Click to select a day to record' : 'انقر لاختيار أي يوم لتسجيله'}
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: hexColor }} />
                <span>{selectedDayName}، {selectedFormattedDate}</span>
              </button>
              {isSelectedToday ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 shrink-0">
                  {isEn ? 'Today' : 'اليوم'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200 shrink-0 transition-colors flex items-center gap-1"
                  title={isEn ? 'Back to today' : 'العودة إلى اليوم الحالي'}
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>{isEn ? 'Back to today' : 'العودة لليوم'}</span>
                </button>
              )}
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              {selectedHijriDate}
            </span>
            <input
              type="date"
              ref={dateInputRef}
              max={todayStr}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value && e.target.value <= todayStr) {
                  setSelectedDate(e.target.value);
                }
              }}
              className="sr-only"
            />
          </div>

          {/* Next Day Button */}
          <motion.button
            whileTap={isSelectedToday ? undefined : { scale: 0.92 }}
            disabled={isSelectedToday}
            onClick={() => setSelectedDate(prev => moment(prev).add(1, 'day').format('YYYY-MM-DD'))}
            className={`py-1.5 px-2.5 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold shrink-0 ${
              isSelectedToday
                ? 'opacity-40 bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={isSelectedToday ? (isEn ? 'Cannot record future days' : 'لا يمكن تسجيل أيام مستقبلية') : (isEn ? 'Next Day' : 'اليوم التالي')}
          >
            <span>{isEn ? 'Next' : 'التالي'}</span>
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
        </div>



        {/* Footer Sentence */}
        <div className="text-center pb-0 pt-4 px-6 border-t border-gray-200 dark:border-gray-700">
           <p className="text-sm font-semibold opacity-70 leading-relaxed font-amiri text-gray-600 dark:text-gray-400">
            {isEn ? "Your consistency in worship is the greatest gift to you and to the spirits of Ahmed and Laila." : "استمرارك في العبادة هو أعظم هدية لك ولروح أحمد وليلى"}
           </p>
        </div>
      </main>

      {/* Streak Achievement Modal */}
      <AnimatePresence>
        {showStreakMedal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-x-0 bottom-20 mx-auto w-[90%] max-w-sm themed-card rounded-2xl shadow-2xl p-6 text-center z-50 border-4"
            style={{ borderColor: hexColor, color: 'var(--text-color)' }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
               <Confetti active={showStreakMedal} config={CONFETTI_CONFIG} />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 shadow-lg ${isBlackTheme ? 'text-black' : 'text-white'}`}
                style={{ backgroundColor: hexColor }}
              >
                <Medal className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{isEn ? 'Consistency Medal' : 'وسام الاستمرارية'}</h3>
              <p className="text-gray-600 dark:text-gray-300 font-semibold">{activeStreakMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Achievement Card Modal */}
      <AnimatePresence>
        {showWeeklyModal && (
          <WeeklyAchievementModal
            records={records}
            getDailyProgress={getDailyProgress}
            customHabits={customHabits}
            theme={theme}
            hexColor={hexColor}
            isBlackTheme={isBlackTheme}
            onClose={() => setShowWeeklyModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Custom Habit Modal */}
      <AnimatePresence>
        {showCustomHabitModal && (
          <CustomHabitModal
            hexColor={hexColor}
            isBlackTheme={isBlackTheme}
            onClose={() => setShowCustomHabitModal(false)}
            onAdded={(title) => showTrackerToast(isEn ? `Habit "${title}" added successfully 🌿` : `تمت إضافة "${title}" بنجاح 🌿`)}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {habitToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir={isEn ? 'ltr' : 'rtl'}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl text-center border"
              style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {isEn ? 'Delete Habit' : 'حذف العبادة'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                {isEn ? `Are you sure you want to delete the habit "${habitToDelete.title}"?` : `هل أنت متأكد من حذف عبادة "${habitToDelete.title}"؟`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
                >
                  {isEn ? 'Yes, Delete' : 'نعم، حذف'}
                </button>
                <button
                  onClick={() => setHabitToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors"
                >
                  {isEn ? 'Cancel' : 'إلغاء'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {trackerToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-lg z-50 pointer-events-none"
          >
            {trackerToast}
          </motion.div>
        )}
      </AnimatePresence>

      <CommunitySpotlightGuide
        guideKey="worship_mentor_page_spotlight"
        steps={WORSHIP_MENTOR_PAGE_STEPS}
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        isEn={isEn}
      />
    </div>
  );
};

export default HabitTracker;
