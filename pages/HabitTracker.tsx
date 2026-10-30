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
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';

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
  onBack: () => void; 
  onNavigate: (id: string, params?: any) => void; 
}

const ProgressRing = ({ progress, size = 100, strokeWidth = 8, color }: { progress: number, size?: number, strokeWidth?: number, color: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-gray-200 dark:text-zinc-700" />
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

const HabitTracker: React.FC<HabitTrackerProps> = ({ onBack, onNavigate }) => {
  const { theme, themeKey } = useTheme();
  const tokens = getModernFlatTokens(theme, themeKey);
  const { language } = useLanguage();
  const isEn = language === 'en';
  const hexColor = tokens.primaryColor;
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
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const showTrackerToast = (msg: string) => {
    setTrackerToast(msg);
    setTimeout(() => setTrackerToast(''), 3000);
  };

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
                iconColor: '#2E7D5E',
                group: 'com.mushaf.ahmedandlayla.GENERAL_ALERTS_CARD',
                groupSummary: false,
                extra: { page: 'habit-tracker', playSound: true, soundFile: 'chime.mp3' }
              },
              {
                id: 9502,
                title: 'يوم الجمعة',
                body: 'لا تنسَ الاتصال بوالديك والدعاء لأحمد وليلى',
                schedule: { allowWhileIdle: true, on: { weekday: 6, hour: 10, minute: 0 } },
                channelId: 'athkar_reminders_chime_channel',
                sound: 'chime.mp3',
                smallIcon: 'ic_stat_name',
                iconColor: '#2E7D5E',
                group: 'com.mushaf.ahmedandlayla.GENERAL_ALERTS_CARD',
                groupSummary: false,
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
    
    if (!wasCompleted) {
      setTimeout(() => {
        const currentStreak = getStreak(category, habitId);
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
    { id: 'witr', label: isEn ? 'Shafa & Witr' : 'صلاة الشفع والوتر', points: 3 },
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
    
    const isFardCompleted = (currentRecord.prayers as any)?.[fardId];
    const isSunnahCompleted = (currentRecord.prayers as any)?.[sunnahId];
    
    return (
      <div 
        key={id} 
        id={`prayer-card-${id}`} 
        className="rounded-[18px] p-3.5 mb-0 transition-all border-0"
        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
      >
         <span className="font-bold text-sm block mb-2 px-1" style={{ color: tokens.textColor }}>{label}</span>
         <div className="flex gap-2">
            <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => handleToggle('prayers', fardId)}
               className={`flex-1 flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                  isFardCompleted ? 'shadow-xs text-white' : 'bg-slate-100 dark:bg-zinc-800'
               }`}
               style={{ 
                  backgroundColor: isFardCompleted ? hexColor : undefined,
                  color: isFardCompleted ? '#FFFFFF' : tokens.textColor
               }}
            >
               <span>{isEn ? 'Fard' : 'الفريضة'}</span>
               <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isFardCompleted ? 'bg-white/25' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                  {isFardCompleted && <CheckCircle className="w-3 h-3 text-white" />}
               </div>
            </motion.button>
            <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => handleToggle('prayers', sunnahId)}
               className={`flex-1 flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                  isSunnahCompleted ? 'shadow-xs text-white' : 'bg-slate-100 dark:bg-zinc-800'
               }`}
               style={{ 
                  backgroundColor: isSunnahCompleted ? hexColor : undefined,
                  color: isSunnahCompleted ? '#FFFFFF' : tokens.textColor
               }}
            >
               <span>{isEn ? 'Sunnah' : 'السنة'}</span>
               <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isSunnahCompleted ? 'bg-white/25' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                  {isSunnahCompleted && <CheckCircle className="w-3 h-3 text-white" />}
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
        whileTap={{ scale: 0.97 }}
        onClick={() => handleToggle(category, habitId)}
        className="w-full flex items-center justify-between p-3.5 rounded-[18px] mb-0 transition-all border-0 cursor-pointer"
        style={{ 
          backgroundColor: tokens.cardBgColor, 
          boxShadow: tokens.cardShadow 
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-xs sm:text-sm px-1 truncate" style={{ color: tokens.textColor }}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {streak > 1 && (
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
              <span>🔥</span> {streak}
            </div>
          )}
          <div 
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              isCompleted ? 'text-white' : 'bg-slate-100 dark:bg-zinc-800'
            }`}
            style={{ backgroundColor: isCompleted ? hexColor : undefined }}
          >
            {isCompleted ? <Check className="w-3.5 h-3.5 text-white stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />}
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
        className="relative flex items-center justify-between p-3.5 rounded-[18px] transition-all border-0"
        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-1">
          <span className="text-xl shrink-0 select-none">{habit.icon || '⭐'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs sm:text-sm truncate" style={{ color: tokens.textColor }}>
                {habit.title}
              </span>
              {isScheduledToday ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  {isSelectedToday ? 'اليوم 🌟' : 'مجدول 🌟'}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 font-medium shrink-0" style={{ color: tokens.subtextColor }}>
                  {scheduleLabel}
                </span>
              )}
            </div>
            {habit.description && (
              <p className="text-[10px] truncate mt-0.5" style={{ color: tokens.subtextColor }}>
                {habit.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {streak > 1 && (
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
              <span>🔥</span> {streak}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleToggle('custom', habit.id)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer border-0"
            style={{ backgroundColor: isCompleted ? hexColor : hexToRgba(tokens.primaryColor, 0.1) }}
            title={isCompleted ? (isEn ? 'Completed' : 'تم الإنجاز') : (isEn ? 'Mark as completed' : 'تحديد كمنجز')}
          >
            {isCompleted ? <Check className="w-4 h-4 text-white stroke-[3]" /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-600" />}
          </motion.button>

          <button
            onClick={() => setHabitToDelete({ id: habit.id, title: habit.title })}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-0 cursor-pointer"
            title={isEn ? 'Delete Habit' : 'حذف العبادة'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderHeatmapBox = (day: { date: string; progress: number; isToday?: boolean }, i: number) => {
    const isPast = day.date < todayStr;
    const isDayToday = day.date === todayStr;
    const isDaySelected = day.date === selectedDate;

    let bg = '';
    if (day.progress === 100) {
      bg = hexColor;
    } else if (day.progress >= 75) {
      bg = hexToRgba(hexColor, 0.8);
    } else if (day.progress >= 50) {
      bg = hexToRgba(hexColor, 0.55);
    } else if (day.progress >= 25) {
      bg = hexToRgba(hexColor, 0.35);
    } else if (day.progress > 0) {
      bg = hexToRgba(hexColor, 0.2);
    } else if (isDayToday) {
      bg = hexToRgba(hexColor, 0.15);
    } else if (isPast) {
      bg = hexToRgba(hexColor, 0.08);
    } else {
      bg = 'rgba(156, 163, 175, 0.15)';
    }

    const inlineStyle: React.CSSProperties = {
      backgroundColor: bg,
      border: 'none',
      borderRadius: '4px'
    };

    if (isDaySelected) {
      inlineStyle.boxShadow = `0 0 0 2px ${hexColor}`;
      inlineStyle.transform = 'scale(1.15)';
      inlineStyle.zIndex = 10;
    }

    return (
      <button
        key={day.date || i}
        type="button"
        onClick={() => {
          setSelectedDate(day.date);
          showTrackerToast(isEn ? `Showing worships for ${day.date}` : `عرض عبادات يوم ${day.date}`);
        }}
        className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all hover:scale-115 cursor-pointer flex-grow-0 shrink-0 border-0"
        style={inlineStyle}
        title={`${day.date}: ${day.progress}% (${isEn ? 'Tap to view' : 'انقر للعرض والتسجيل'})`}
      />
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
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: theme.font }} dir={isEn ? 'ltr' : 'rtl'}>
      <header className="app-top-bar shrink-0">
          <div className="app-top-bar__inner">
              <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center gap-1.5`}>
                            <button
                                onClick={handleHomeClick}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                title={isEn ? 'Back' : 'رجوع للخلف'}
                                aria-label={isEn ? 'Back' : 'رجوع للخلف'}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                            
                            <button
                                id="habit-auto-sync-btn"
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
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                title={
                                    isEn 
                                        ? (autoSyncEnabled ? 'Auto-Sync Worship: Enabled (Click to disable)' : 'Auto-Sync Worship: Disabled (Click to enable)') 
                                        : (autoSyncEnabled ? 'الربط التلقائي للعبادات: مفعّل (اضغط للتعطيل)' : 'الربط التلقائي للعبادات: معطّل (اضغط للتفعيل)')
                                }
                            >
                                <div className={`w-[20px] h-[20px] rounded-full border-[1.5px] border-white/90 shadow-xs transition-all flex items-center justify-center ${
                                    autoSyncEnabled 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-red-500 text-white'
                                }`}>
                                    {autoSyncEnabled ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-0.5 bg-white rounded-full" />}
                                </div>
                            </button>
                        </div>

                        {/* Title */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-bold truncate">
                                {isEn ? 'Worship Habit Tracker' : 'مربّي العبادات'}
                            </h1>
                        </div>

                        {/* Home & Guide */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1.5`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Worship Mentor Guide" : "دليل وشرح مربي العبادات"}
                                aria-label={isEn ? "Worship Mentor Guide" : "دليل وشرح مربي العبادات"}
                            >
                                <i className="fa-solid fa-circle-question text-lg"></i>
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate('home')}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
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
      <main className="w-full flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-8 hide-scrollbar">
        
        {/* Past Day Notice Banner */}
        {!isSelectedToday && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[18px] p-3 px-4 mb-3.5 flex items-center justify-between gap-2 text-xs border-0 shadow-sm"
            style={{ backgroundColor: hexToRgba(tokens.primaryColor, 0.08) }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🗓️</span>
              <span className="truncate" style={{ color: tokens.textColor }}>
                {isEn ? `You are recording habits for a past day:` : `أنت تسجل عبادات يوم سابق:`} <b className="font-bold underline">{selectedDayName} ({selectedDate})</b>
              </span>
            </div>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-3 py-1.5 rounded-xl text-white font-bold text-[11px] transition-colors shrink-0 border-0 cursor-pointer shadow-xs"
              style={{ backgroundColor: tokens.primaryColor }}
            >
              {isEn ? 'Back to today' : 'العودة لليوم'}
            </button>
          </motion.div>
        )}

        {/* Daily Achievement Card - Pure White, Soft Elevation, Zero Border */}
        <div 
          id="daily-achievement-card" 
          className="rounded-[18px] p-4 sm:p-5 shadow-sm mb-4 border-0"
          style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
        >
            <div ref={achievementHeaderRowRef} className="flex items-center justify-between gap-1.5 mb-2.5 flex-nowrap">
                <h2
                    id="habit-achievement-title"
                    ref={achievementTitleRef}
                    className="font-bold flex items-center gap-1.5 whitespace-nowrap min-w-0 overflow-hidden leading-tight"
                    style={{ fontSize: `${achievementTitleSize}px`, color: tokens.textColor }}
                >
                    <span className="shrink-0">{isEn ? `Achievement of ${isSelectedToday ? 'Today' : selectedDayName}` : `إنجاز ${isSelectedToday ? 'اليوم' : selectedDayName}`}</span>
                    <span className="font-bold opacity-80 shrink-0" style={{ color: tokens.primaryColor }}>
                        ({selectedGregorianShort} • {selectedHijriShort})
                    </span>
                </h2>
                <span
                    id="habit-score-badge"
                    ref={achievementBadgeRef}
                    className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shrink-0 border-0"
                    style={{
                      backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                      color: tokens.primaryColor
                    }}
                >
                    {scoreBreakdown.totalEarned} / {scoreBreakdown.totalAvailable} {isEn ? 'pts' : 'نقطة'}
                </span>
            </div>

            <div className="flex items-end justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-nowrap mb-2.5 overflow-x-auto no-scrollbar">
                    <motion.button
                       id="weekly-card-btn"
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setShowWeeklyModal(true)}
                       className="flex items-center justify-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap border-0 cursor-pointer shadow-xs"
                       style={{
                         backgroundColor: hexToRgba(tokens.primaryColor, 0.12),
                         color: tokens.primaryColor
                       }}
                    >
                       <span>{isEn ? 'Weekly' : 'الأسبوع'}</span>
                    </motion.button>

                    <motion.button
                       id="habit-archive-btn"
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setViewMode('archive')}
                       className="flex items-center justify-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-transform bg-slate-100 dark:bg-zinc-800 shrink-0 whitespace-nowrap border-0 cursor-pointer shadow-xs"
                       style={{ color: tokens.textColor }}
                    >
                       <span>{isEn ? 'Record' : 'السجل'}</span>
                    </motion.button>
                  </div>

                  {progress === 100 && (
                    <p className="opacity-75 text-[11px] leading-relaxed mb-1 max-w-[200px]" style={{ color: tokens.subtextColor }}>
                      {isEn ? "Masha'Allah! A day full of devotion." : 'ما شاء الله! يوم مليء بالطاعات.'}
                    </p>
                  )}
                  
                  {/* Heatmap Row */}
                  <div id="habit-heatmap-grid" className="flex flex-col gap-1 w-full mt-1.5 pe-1" dir={isEn ? 'ltr' : 'rtl'}>
                    <div className="flex justify-start gap-1 w-full overflow-hidden py-0.5">
                      {heatmapData.slice(0, Math.ceil(heatmapData.length / 2)).map((day, i) => renderHeatmapBox(day, i))}
                    </div>
                    <div className="flex justify-start gap-1 w-full overflow-hidden py-0.5">
                      {heatmapData.slice(Math.ceil(heatmapData.length / 2)).map((day, i) => renderHeatmapBox(day, i + Math.ceil(heatmapData.length / 2)))}
                    </div>
                  </div>
                </div>
                <div id="habit-progress-ring" className="shrink-0 flex flex-col items-center justify-end self-end pb-0.5 ps-2">
                  <ProgressRing progress={progress} color={hexColor} size={58} strokeWidth={5} />
                </div>
            </div>
        </div>
        
        {/* Prayers */}
        <section id="habit-prayers-fard-sunnah-section" className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: tokens.textColor }}>
            <Clock className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            {isEn ? 'Obligatory Prayers & Sunnah' : 'الصلوات المكتوبة والسنن الرواتب'}
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {prayersList.map(habit => renderPrayerCard(habit.id, habit.label))}
          </div>
        </section>
        
        {/* Additional Prayers */}
        <section id="habit-nawafil-section" className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: tokens.textColor }}>
            <Heart className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            {isEn ? 'Supererogatory Prayers' : 'صلوات النوافل'}
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {additionalPrayersList.map(habit => renderCard('prayers', habit.id, habit.label, habit.points))}
          </div>
        </section>

        {/* Quran */}
        <section id="quran-habit-section" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: tokens.textColor }}>
              <BookOpen className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
              {isEn ? 'Quran Recitation' : 'الورد القرآني'}
            </h3>
            <div className="flex items-center gap-1.5">
              {autoSyncEnabled && isSelectedToday && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1 border-0">
                  <Sparkles className="w-3 h-3" />
                  <span>{isEn ? 'Auto ⚡' : 'تلقائي ⚡'}</span>
                </span>
              )}
              {(currentRecord.quran?.pages || 0) > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                  {isEn ? 'Done ✓' : 'مكتمل ✓'}
                </span>
              )}
            </div>
          </div>
          <div 
            className="rounded-[18px] p-4.5 shadow-sm border-0"
            style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm block" style={{ color: tokens.textColor }}>{isEn ? 'Pages Read' : 'الصفحات المقروءة'}</span>
                {(() => {
                  const p = currentRecord.quran?.pages || 0;
                  if (p <= 0) return null;
                  let text = '';
                  if (p === 20) text = isEn ? 'Full Juz (20 pages) 🌟' : 'جزء كامل (20 صفحة) 🌟';
                  else if (p > 20) {
                    const juzCount = Math.floor(p / 20);
                    const rem = p % 20;
                    text = isEn
                      ? `${p} pages (${juzCount} Juz${rem > 0 ? ` + ${rem}p` : ''}) 🌟`
                      : `${p} صفحة (${juzCount === 1 ? 'جزء' : juzCount === 2 ? 'جزءان' : `${juzCount} أجزاء`}${rem > 0 ? ` و${rem} ص` : ''}) 🌟`;
                  } else if (p === 10) text = isEn ? 'Half Juz (10 pages) 📖' : 'نصف جزء (10 صفحات) 📖';
                  else if (p > 10) text = isEn ? `${p} pages ✨` : `${p} صفحة ✨`;
                  else if (p >= 5) text = isEn ? `${p} pages 🌿` : `${p} صفحات 🌿`;
                  else if (p >= 3) text = isEn ? `${p} pages` : `${p} صفحات`;
                  else if (p === 2) text = isEn ? '2 pages' : 'صفحتان';
                  else text = isEn ? '1 page' : 'صفحة واحدة';

                  return (
                    <span className="text-[11px] block mt-0.5" style={{ color: tokens.subtextColor }}>
                      {text}
                    </span>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 rounded-xl p-1.5 border-0">
                 <button 
                    type="button"
                    onClick={() => setQuranPages(selectedDate, Math.max(0, (currentRecord.quran?.pages || 0) - 1))}
                    className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 shadow-xs hover:scale-105 active:scale-95 transition-transform border-0 cursor-pointer"
                 >
                    <Minus className="w-4 h-4" style={{ color: tokens.textColor }} />
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
                    className="font-bold w-12 text-center text-base bg-transparent focus:outline-none rounded border-0"
                    style={{ color: tokens.textColor }}
                 />
                 <button 
                    type="button"
                    onClick={() => setQuranPages(selectedDate, (currentRecord.quran?.pages || 0) + 1)}
                    className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 shadow-xs hover:scale-105 active:scale-95 transition-transform border-0 cursor-pointer"
                 >
                    <Plus className="w-4 h-4" style={{ color: tokens.textColor }} />
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* Adhkar */}
        <section id="habit-adhkar-section" className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: tokens.textColor }}>
            <Heart className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            {isEn ? 'Adhkar' : 'الأذكار'}
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
             {adhkarList.map(habit => renderCard('adhkar', habit.id, habit.label, habit.points))}
          </div>
        </section>

        {/* Ethics & Parents */}
        <section id="habit-ethics-section" className="mb-8">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: tokens.textColor }}>
            <Medal className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            {isEn ? 'Kindness & Ethics' : 'بر الوالدين والأخلاق'}
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
              {ethicsList.map(habit => renderCard('ethics', habit.id, habit.label, habit.points))}
          </div>
        </section>

        {/* Custom Habits & Worships */}
        <section id="custom-habits-section" className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: tokens.textColor }}>
              <Star className="w-4 h-4 opacity-80 text-amber-500" />
              {isEn ? 'Custom Habits' : 'العبادات والعادات المخصصة'}
              {filteredCustomHabits.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800" style={{ color: tokens.subtextColor }}>
                  {filteredCustomHabits.length}
                </span>
              )}
            </h3>
            <motion.button
              id="habit-add-custom-btn"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCustomHabitModal(true)}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-opacity hover:opacity-90 text-white cursor-pointer border-0"
              style={{ backgroundColor: hexColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEn ? 'Add Habit' : 'إضافة عبادة'}</span>
            </motion.button>
          </div>

          {filteredCustomHabits.length > 0 && (
            <div className="space-y-2.5">
              {filteredCustomHabits.map((habit) => renderCustomHabitCard(habit))}
            </div>
          )}
        </section>

        {/* Day Navigation & Date Selector */}
        <div 
          id="habit-date-navigation-card"
          className="rounded-[18px] p-3.5 shadow-sm mb-3 flex items-center justify-between gap-2 border-0"
          style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
        >
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setSelectedDate(prev => moment(prev).subtract(1, 'day').format('YYYY-MM-DD'))}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs font-bold shrink-0 border-0 cursor-pointer"
            style={{ color: tokens.textColor }}
            title={isEn ? 'Previous Day' : 'اليوم السابق'}
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-0" />
            <span>{isEn ? 'Previous' : 'السابق'}</span>
          </motion.button>

          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
                className="flex items-center gap-1.5 font-bold text-xs sm:text-sm hover:opacity-80 transition-opacity border-0 cursor-pointer"
                style={{ color: tokens.textColor }}
                title={isEn ? 'Click to select a day to record' : 'انقر لاختيار أي يوم لتسجيله'}
              >
                <Calendar className="w-4 h-4 shrink-0" style={{ color: hexColor }} />
                <span>{selectedDayName}، {selectedFormattedDate}</span>
              </button>
              {isSelectedToday ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  {isEn ? 'Today' : 'اليوم'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 shrink-0 transition-colors flex items-center gap-1 border-0 cursor-pointer"
                  title={isEn ? 'Back to today' : 'العودة إلى اليوم الحالي'}
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>{isEn ? 'Back to today' : 'العودة لليوم'}</span>
                </button>
              )}
            </div>
            <span className="text-[10px] mt-0.5" style={{ color: tokens.subtextColor }}>
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

          <motion.button
            whileTap={isSelectedToday ? undefined : { scale: 0.92 }}
            disabled={isSelectedToday}
            onClick={() => setSelectedDate(prev => moment(prev).add(1, 'day').format('YYYY-MM-DD'))}
            className={`py-2 px-3 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold shrink-0 border-0 ${
              isSelectedToday
                ? 'opacity-30 bg-slate-100 dark:bg-zinc-800 cursor-not-allowed'
                : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 cursor-pointer'
            }`}
            style={{ color: tokens.textColor }}
            title={isSelectedToday ? (isEn ? 'Cannot record future days' : 'لا يمكن تسجيل أيام مستقبلية') : (isEn ? 'Next Day' : 'اليوم التالي')}
          >
            <span>{isEn ? 'Next' : 'التالي'}</span>
            <ChevronLeft className="w-4 h-4 rtl:rotate-0" />
          </motion.button>
        </div>

        {/* Footer Sentence */}
        <div className="text-center pb-2 pt-4 px-6 border-t border-slate-100 dark:border-zinc-800">
           <p className="text-sm font-semibold opacity-70 leading-relaxed font-amiri" style={{ color: tokens.subtextColor }}>
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
            className="fixed inset-x-0 bottom-20 mx-auto w-[90%] max-w-sm rounded-[24px] shadow-2xl p-6 text-center z-50 border-0"
            style={{ backgroundColor: tokens.cardBgColor, color: tokens.textColor }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
               <Confetti active={showStreakMedal} config={CONFETTI_CONFIG} />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div 
                className="w-16 h-16 flex items-center justify-center rounded-full mb-4 shadow-lg text-white"
                style={{ backgroundColor: hexColor }}
              >
                <Medal className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: tokens.textColor }}>{isEn ? 'Consistency Medal' : 'وسام الاستمرارية'}</h3>
              <p className="font-semibold" style={{ color: tokens.subtextColor }}>{activeStreakMsg}</p>
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
            isBlackTheme={tokens.isDark}
            onClose={() => setShowWeeklyModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Custom Habit Modal */}
      <AnimatePresence>
        {showCustomHabitModal && (
          <CustomHabitModal
            hexColor={hexColor}
            isBlackTheme={tokens.isDark}
            onClose={() => setShowCustomHabitModal(false)}
            onAdded={(title) => showTrackerToast(isEn ? `Habit "${title}" added successfully 🌿` : `تمت إضافة "${title}" بنجاح 🌿`)}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog - Modal Bottom Sheet style */}
      <AnimatePresence>
        {habitToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir={isEn ? 'ltr' : 'rtl'} onClick={() => setHabitToDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs rounded-[24px] p-6 shadow-2xl text-center border-0"
              style={{ backgroundColor: tokens.cardBgColor }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: tokens.textColor }}>
                {isEn ? 'Delete Habit' : 'حذف العبادة'}
              </h3>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: tokens.subtextColor }}>
                {isEn ? `Are you sure you want to delete the habit "${habitToDelete.title}"?` : `هل أنت متأكد من حذف عبادة "${habitToDelete.title}"؟`}
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors border-0 cursor-pointer"
                >
                  {isEn ? 'Yes, Delete' : 'نعم، حذف'}
                </button>
                <button
                  onClick={() => setHabitToDelete(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 font-bold text-xs hover:bg-slate-200 transition-colors border-0 cursor-pointer"
                  style={{ color: tokens.textColor }}
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-lg z-50 pointer-events-none border-0"
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
