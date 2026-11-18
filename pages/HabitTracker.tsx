import React, { useEffect, useLayoutEffect, useState, useMemo, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Clock, Heart, BookOpen, Plus, Minus, Medal, Award, Star, Trash2, Sparkles, Calendar, RotateCcw, Check, X } from 'lucide-react';
import { markPageAsSeen } from '../utils/badgeManager';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { WORSHIP_MENTOR_PAGE_STEPS } from '../components/Community/communityTourSteps';
import moment from 'moment-hijri';
import { useHabitTracker, HabitCategory, defaultRecord, CustomHabit, HABIT_WEIGHTS } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useShowPageGuides } from '../utils/guideManager';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getActiveNotificationSoundFileName } from '../utils/prayerTimesUtils';
import Confetti from 'react-dom-confetti';
import HabitArchive from '../components/HabitArchive';
import WeeklyAchievementModal from '../components/WeeklyAchievementModal';
import CustomHabitModal from '../components/CustomHabitModal';
import { gregorianMonths, hijriMonths } from '../data/calendarData';
import { hexToRgba } from '../utils/flatDesignTokens';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';
import { getToast3DStyles } from '../utils/toast3DStyles';

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

const ProgressRing = ({
  progress,
  size = 100,
  strokeWidth = 8,
  color,
  isDark = false,
  isBlackTheme = false,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  isDark?: boolean;
  isBlackTheme?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const ringFilterId = React.useId();
  const innerSize = Math.max(24, Math.round(size - strokeWidth * 2 - 6));

  const outerRingStyle: React.CSSProperties = isDark
    ? {
        width: size + 8,
        height: size + 8,
        background: isBlackTheme
          ? 'linear-gradient(145deg, #27272a 0%, #09090b 100%)'
          : 'linear-gradient(145deg, #334155 0%, #1e293b 100%)',
        boxShadow: isBlackTheme
          ? '0 4.5px 0 #000000, 0 8px 16px -2px rgba(0, 0, 0, 0.72), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.16), inset 0 -2px 4px rgba(0, 0, 0, 0.5)'
          : '0 4.5px 0 #0f172a, 0 8px 16px -2px rgba(0, 0, 0, 0.5), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.15), inset 0 -2px 4px rgba(0, 0, 0, 0.35)',
      }
    : {
        width: size + 8,
        height: size + 8,
        background: 'linear-gradient(145deg, #ffffff 0%, #eef2f6 100%)',
        boxShadow:
          '0 4.5px 0 rgba(0, 0, 0, 0.14), 0 8px 16px -2px rgba(0, 0, 0, 0.12), inset 0 2px 2px rgba(255, 255, 255, 0.98), inset 0 -2px 4px rgba(0, 0, 0, 0.08)',
      };

  const innerCapStyle: React.CSSProperties = isDark
    ? {
        width: innerSize,
        height: innerSize,
        background: isBlackTheme
          ? 'linear-gradient(160deg, #18181b 0%, #09090b 100%)'
          : 'linear-gradient(160deg, #273549 0%, #172030 100%)',
        boxShadow:
          '0 2px 4px rgba(0, 0, 0, 0.55), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.12), inset 0 -1.5px 2px rgba(0, 0, 0, 0.45)',
      }
    : {
        width: innerSize,
        height: innerSize,
        background: 'linear-gradient(160deg, #ffffff 0%, #f1f5f9 100%)',
        boxShadow:
          '0 2.5px 5px rgba(0, 0, 0, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98), inset 0 -1.5px 2px rgba(0, 0, 0, 0.06)',
      };

  return (
    <div
      className="relative rounded-full flex items-center justify-center shrink-0"
      style={outerRingStyle}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
          <defs>
            <filter id={ringFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.4" floodColor="rgba(0,0,0,0.28)" />
            </filter>
          </defs>
          {/* Recessed groove track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(148, 163, 184, 0.28)'}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#${ringFilterId})`}
          />
        </svg>
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={innerCapStyle}
        >
          <span
            className="font-black font-sans leading-none tracking-tight"
            style={{
              color: isBlackTheme ? '#FFFFFF' : color,
              fontSize: size <= 70 ? '1.2rem' : '1.55rem',
            }}
          >
            {progress}
          </span>
        </div>
      </div>
    </div>
  );
};

const HabitTracker: React.FC<HabitTrackerProps> = ({ onBack, onNavigate }) => {
  const showPageGuides = useShowPageGuides();
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
  const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
  const { language } = useLanguage();
  const isEn = language === 'en';
  const hexColor = s3d.primaryColor;
  // Dynamic today string for habits & auto-update at 12:00 AM midnight
  const [todayStr, setTodayStr] = useState<string>(() => moment().format('YYYY-MM-DD'));
  const [selectedDate, setSelectedDate] = useState<string>(() => moment().format('YYYY-MM-DD'));

  useEffect(() => {
    const updateMidnight = () => {
      const freshStr = moment().format('YYYY-MM-DD');
      setTodayStr((prevToday) => {
        if (prevToday !== freshStr) {
          setSelectedDate((prevSel) => (prevSel === prevToday ? freshStr : prevSel));
          return freshStr;
        }
        return prevToday;
      });
    };

    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const midnightTimeout = setTimeout(updateMidnight, msUntilMidnight);
    const intervalCheck = setInterval(updateMidnight, 30000);

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(intervalCheck);
    };
  }, []);

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
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; title: string } | null>(null);
  const [trackerToast, setTrackerToast] = useState('');
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
  const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
  const selectedDayName = isEn
    ? selectedMoment.clone().locale('en').format('dddd')
    : ARABIC_DAYS[selectedMoment.day()];
  const selectedFormattedDate = isEn
    ? selectedMoment.clone().locale('en').format('D MMMM YYYY')
    : `${selDay || selectedMoment.date()} ${gregorianMonths[(selMonth || (selectedMoment.month() + 1)) - 1]?.name || ''} ${selYear || selectedMoment.year()} م`;

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
      selectedGregorianShort: gregShort,
      selectedHijriShort: `${hDay} ${hijriMonthLabel}`,
      selectedHijriDate: isEn ? `${hDay} ${hijriMonthLabel} ${hYear} AH` : `${hDay} ${hijriMonthLabel} ${hYear} هـ`
    };
  }, [selectedDate, isEn, selectedMoment]);

  const achievementHeaderRowRef = useRef<HTMLDivElement>(null);
  const achievementTitleRef = useRef<HTMLHeadingElement>(null);
  const achievementBadgeRef = useRef<HTMLButtonElement>(null);
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
    setAchievementTitleSize(prev => (Math.abs(prev - targetSize) >= 0.25 ? targetSize : prev));
  }, [selectedDate, isEn, isSelectedToday, scoreBreakdown.totalEarned, scoreBreakdown.totalAvailable]);

  useLayoutEffect(() => {
    fitAchievementHeaderRow();
  }, [fitAchievementHeaderRow, viewMode]);

  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitAchievementHeaderRow).catch(() => {});
    }
    window.addEventListener('resize', fitAchievementHeaderRow);
    return () => {
      window.removeEventListener('resize', fitAchievementHeaderRow);
    };
  }, [fitAchievementHeaderRow, viewMode]);

  const handleHomeClick = () => {
    if (showPointsModal) {
      setShowPointsModal(false);
      return;
    }
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
      if (showPointsModal) {
        setShowPointsModal(false);
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
  }, [viewMode, showWeeklyModal, showCustomHabitModal, showPointsModal, showGuide, habitToDelete]);

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
            const notifSoundFile = getActiveNotificationSoundFileName();
            const soundForCap = notifSoundFile && notifSoundFile !== 'none' ? notifSoundFile : undefined;
            await LocalNotifications.createChannel({
              id: 'athkar_reminders_chime_channel',
              name: 'أذكار وتنبيهات عامة',
              description: 'قناة تنبيهات أذكار الصباح والمساء والسنن والأدعية بنغمة قصيرة وخفيفة',
              importance: 5,
              sound: soundForCap,
              vibration: true,
              visibility: 1
            });
          } catch (e) {}

          const habitSoundFile = getActiveNotificationSoundFileName();
          const habitSoundForCap = habitSoundFile && habitSoundFile !== 'none' ? habitSoundFile : undefined;

          await LocalNotifications.schedule({
            notifications: [
              {
                id: 9501,
                title: 'مربّي العبادات',
                body: 'صلاة الضحى غنيمة.. هل صليتها اليوم؟',
                schedule: { allowWhileIdle: true, on: { hour: 9, minute: 30 } },
                channelId: 'athkar_reminders_chime_channel',
                sound: habitSoundForCap,
                smallIcon: 'ic_stat_name',
                iconColor: '#2E7D5E',
                group: 'com.mushaf.ahmedandlayla.GENERAL_ALERTS_CARD',
                groupSummary: false,
                extra: { page: 'habit-tracker', playSound: habitSoundForCap !== undefined, soundFile: habitSoundFile }
              },
              {
                id: 9502,
                title: 'يوم الجمعة',
                body: 'لا تنسَ الاتصال بوالديك والدعاء لأحمد وليلى',
                schedule: { allowWhileIdle: true, on: { weekday: 6, hour: 10, minute: 0 } },
                channelId: 'athkar_reminders_chime_channel',
                sound: habitSoundForCap,
                smallIcon: 'ic_stat_name',
                iconColor: '#2E7D5E',
                group: 'com.mushaf.ahmedandlayla.GENERAL_ALERTS_CARD',
                groupSummary: false,
                extra: { page: 'habit-tracker', playSound: habitSoundForCap !== undefined, soundFile: habitSoundFile }
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
        className={`app-page-card border-0 rounded-2xl p-2.5 sm:p-3.5 mb-0 min-w-0 transition-all ${s3d.surfaceCardClass}`}
      >
         <span className="font-extrabold text-sm block mb-2 sm:mb-2.5 px-1" style={{ color: s3d.textColor }}>{label}</span>
         <div className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0 overflow-visible pb-1.5">
            <button 
               onClick={() => handleToggle('prayers', fardId)}
               className={`app-page-card border-0 flex-1 min-w-0 flex items-center justify-between gap-1 py-2 sm:py-2.5 px-1.5 sm:px-2.5 rounded-xl text-[10.5px] sm:text-xs leading-tight active:scale-95 transition-transform cursor-pointer ${
                  isFardCompleted
                    ? 'font-black'
                    : `font-bold ${s3d.surfaceCardClass}`
               }`}
               style={isFardCompleted ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
            >
               <span className="truncate min-w-0">{isEn ? 'Fard' : 'الفريضة'}</span>
               <div className={`app-3d-badge w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 rounded-full flex items-center justify-center ${
                 isFardCompleted
                   ? (s3d.isBlackTheme ? 'bg-black/15' : 'bg-white/25')
                   : (s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10')
               }`}>
                  {isFardCompleted && <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: s3d.btnTextColor }} />}
               </div>
            </button>
            <button 
               onClick={() => handleToggle('prayers', sunnahId)}
               className={`app-page-card border-0 flex-1 min-w-0 flex items-center justify-between gap-1 py-2 sm:py-2.5 px-1.5 sm:px-2.5 rounded-xl text-[10.5px] sm:text-xs leading-tight active:scale-95 transition-transform cursor-pointer ${
                  isSunnahCompleted
                    ? 'font-black'
                    : `font-bold ${s3d.surfaceCardClass}`
               }`}
               style={isSunnahCompleted ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
            >
               <span className="truncate min-w-0">{isEn ? 'Sunnah' : 'السنة'}</span>
               <div className={`app-3d-badge w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 rounded-full flex items-center justify-center ${
                 isSunnahCompleted
                   ? (s3d.isBlackTheme ? 'bg-black/15' : 'bg-white/25')
                   : (s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10')
               }`}>
                  {isSunnahCompleted && <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: s3d.btnTextColor }} />}
               </div>
            </button>
         </div>
      </div>
    );
  };

  const renderCard = (category: HabitCategory, habitId: string, label: string, _points?: number) => {
    const isCompleted = (currentRecord[category] as any)?.[habitId];
    const streak = getStreak(category, habitId);
    
    return (
      <button
        key={`${category}-${habitId}`}
        onClick={() => handleToggle(category, habitId)}
        className={`app-page-card border-0 w-full flex items-center justify-between p-3.5 rounded-2xl mb-0 active:scale-[0.98] transition-transform cursor-pointer ${s3d.surfaceCardClass}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-xs sm:text-sm px-1 truncate" style={{ color: s3d.textColor }}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {streak > 1 && (
            <div className="app-3d-badge border-0 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
              <span>🔥</span> {streak}
            </div>
          )}
          <div 
            className={`app-3d-badge w-7 h-7 rounded-full flex items-center justify-center ${
              isCompleted ? '' : (s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10')
            }`}
            style={isCompleted ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
          >
            {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" style={{ color: s3d.btnTextColor }} /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />}
          </div>
        </div>
      </button>
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
        className={`app-page-card border-0 relative flex items-center justify-between p-3.5 rounded-2xl transition-all ${s3d.surfaceCardClass}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-1">
          <span className={`app-3d-badge border-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 select-none ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
            {habit.icon || '⭐'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs sm:text-sm truncate" style={{ color: s3d.textColor }}>
                {habit.title}
              </span>
              {isScheduledToday ? (
                <span className="app-3d-badge border-0 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  {isSelectedToday ? 'اليوم 🌟' : 'مجدول 🌟'}
                </span>
              ) : (
                <span className={`app-3d-badge border-0 text-[10px] px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`} style={{ color: s3d.subtextColor }}>
                  {scheduleLabel}
                </span>
              )}
            </div>
            {habit.description && (
              <p className="text-[10px] truncate mt-0.5" style={{ color: s3d.subtextColor }}>
                {habit.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 overflow-visible pb-1">
          {streak > 1 && (
            <div className="app-3d-badge border-0 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
              <span>🔥</span> {streak}
            </div>
          )}

          <button
            onClick={() => handleToggle('custom', habit.id)}
            className={`app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer ${
              isCompleted ? '' : s3d.surfaceCardClass
            }`}
            style={isCompleted ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
            title={isCompleted ? (isEn ? 'Completed' : 'تم الإنجاز') : (isEn ? 'Mark as completed' : 'تحديد كمنجز')}
          >
            {isCompleted ? <Check className="w-4 h-4 stroke-[3]" style={{ color: s3d.btnTextColor }} /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-600" />}
          </button>

          <button
            onClick={() => setHabitToDelete({ id: habit.id, title: habit.title })}
            className={`app-page-card border-0 p-2 rounded-xl text-gray-400 hover:text-red-500 transition-colors cursor-pointer ${s3d.surfaceCardClass}`}
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

    let topColor = '';
    let bottomColor = '';
    let lipColor = '';

    if (day.progress === 100) {
      // الأخضر الزمردي الداكن (إنجاز كامل)
      topColor = '#10b981';
      bottomColor = '#047857';
      lipColor = s3d.isDark ? '#022c22' : '#065f46';
    } else if (day.progress >= 75) {
      topColor = '#34d399';
      bottomColor = '#059669';
      lipColor = s3d.isDark ? '#064e3b' : '#047857';
    } else if (day.progress >= 50) {
      topColor = '#34d399';
      bottomColor = '#10b981';
      lipColor = s3d.isDark ? '#065f46' : '#059669';
    } else if (day.progress >= 25) {
      topColor = '#4ade80';
      bottomColor = '#16a34a';
      lipColor = s3d.isDark ? '#14532d' : '#15803d';
    } else if (day.progress > 0) {
      topColor = '#6ee7b7';
      bottomColor = '#22c55e';
      lipColor = s3d.isDark ? '#166534' : '#16a34a';
    } else if (isDayToday) {
      // اليوم الحالي دون تسجيل: البنفسجي
      topColor = '#a78bfa';
      bottomColor = '#7c3aed';
      lipColor = s3d.isDark ? '#4c1d95' : '#5b21b6';
    } else if (isPast) {
      // الأيام السابقة دون تسجيل: العنبر الدافئ
      topColor = '#fbbf24';
      bottomColor = '#d97706';
      lipColor = s3d.isDark ? '#78350f' : '#b45309';
    } else {
      // الأيام التالية (القادمة): الأزرق السماوي
      topColor = '#38bdf8';
      bottomColor = '#0284c7';
      lipColor = s3d.isDark ? '#0c4a6e' : '#0369a1';
    }

    const baseBoxShadow = s3d.isDark
      ? `0 2.5px 0 ${lipColor}, 0 4px 7px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.35), inset 0 -1px 1.5px rgba(0, 0, 0, 0.3)`
      : `0 2.5px 0 ${lipColor}, 0 3px 6px rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.55), inset 0 -1px 1.5px rgba(0, 0, 0, 0.15)`;

    const inlineStyle: React.CSSProperties = {
      backgroundColor: bottomColor,
      backgroundImage: `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`,
      border: 'none',
      borderRadius: '4.5px',
      boxShadow: baseBoxShadow,
      opacity: 1,
    };

    if (isDaySelected) {
      const ringColor = s3d.isDark ? '#FFFFFF' : '#0f172a';
      inlineStyle.boxShadow = `0 0 0 2px ${ringColor}, 0 0 8px ${ringColor}40, ${baseBoxShadow}`;
      inlineStyle.transform = 'scale(1.18) translateY(-1px)';
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
        className="w-full max-w-[15px] aspect-square mx-auto transition-all hover:scale-110 active:translate-y-[1px] cursor-pointer border-0"
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
    <div className="h-[100dvh] flex flex-col relative overflow-hidden" style={{ backgroundColor: s3d.pageBgColor, color: s3d.textColor, fontFamily: theme.font }} dir={isEn ? 'ltr' : 'rtl'}>
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
                        </div>

                        {/* Title */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-bold truncate">
                                {isEn ? 'Worship Habit Tracker' : 'مربّي العبادات'}
                            </h1>
                        </div>

                        {/* Home & Guide */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1.5`}>
                            {showPageGuides && (
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
                            )}
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
      <main className="w-full flex-1 min-h-0 overflow-y-auto px-4 pt-3 app-scroll-safe hide-scrollbar">
        
        {/* Past Day Notice Banner */}
        {!isSelectedToday && (
          <div
            className={`app-page-card border-0 rounded-3xl p-3.5 px-4 mb-4 flex items-center justify-between gap-2 text-xs ${s3d.surfaceCardClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`app-3d-badge border-0 w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>🗓️</span>
              <span className="truncate font-semibold" style={{ color: s3d.textColor }}>
                {isEn ? `You are recording habits for a past day:` : `أنت تسجل عبادات يوم سابق:`} <b className="font-extrabold underline">{selectedDayName} ({selectedDate})</b>
              </span>
            </div>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="app-page-card border-0 px-3.5 py-2 rounded-2xl font-black text-[11px] transition-all shrink-0 cursor-pointer"
              style={{ backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }}
            >
              {isEn ? 'Back to today' : 'العودة لليوم'}
            </button>
          </div>
        )}

        {/* Daily Achievement Card - 3D Sculpted */}
        <div 
          id="daily-achievement-card" 
          className={`app-page-card border-0 rounded-3xl p-4 sm:p-5 mb-5 ${s3d.surfaceCardClass}`}
        >
            <div ref={achievementHeaderRowRef} className="flex items-center justify-between gap-1.5 mb-3 flex-nowrap">
                <h2
                    id="habit-achievement-title"
                    ref={achievementTitleRef}
                    className="font-extrabold flex items-center gap-1.5 whitespace-nowrap min-w-0 overflow-hidden leading-tight"
                    style={{ fontSize: `${achievementTitleSize}px`, color: s3d.textColor }}
                >
                    <span className="shrink-0">{isEn ? `Achievement of ${isSelectedToday ? 'Today' : selectedDayName}` : `إنجاز ${isSelectedToday ? 'اليوم' : selectedDayName}`}</span>
                    <span className="font-bold opacity-85 shrink-0" style={{ color: hexColor }}>
                        ({selectedGregorianShort} • {selectedHijriShort})
                    </span>
                </h2>
                <button
                    type="button"
                    id="habit-score-badge"
                    ref={achievementBadgeRef}
                    onClick={() => setShowPointsModal(true)}
                    className="app-3d-badge border-0 text-xs font-black px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 cursor-pointer active:scale-95 transition-transform"
                    style={{
                        backgroundColor: hexToRgba(hexColor, s3d.isBlackTheme ? 0.2 : 0.1),
                        color: s3d.isBlackTheme ? '#FFFFFF' : hexColor
                    }}
                    title={isEn ? 'Tap to see how points are distributed' : 'اضغط لمعرفة طريقة توزيع النقاط'}
                    aria-label={isEn ? 'Points distribution details' : 'تفاصيل توزيع النقاط'}
                >
                    {scoreBreakdown.totalEarned} / {scoreBreakdown.totalAvailable} {isEn ? 'pts' : 'نقطة'}
                </button>
            </div>

            <div className="flex items-end justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-3 overflow-visible pb-1.5">
                    <button
                       id="weekly-card-btn"
                       onClick={() => setShowWeeklyModal(true)}
                       className="app-page-card border-0 flex items-center justify-center px-4 py-2 rounded-2xl text-xs sm:text-sm font-black active:scale-95 transition-transform shrink-0 whitespace-nowrap cursor-pointer"
                       style={{ backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }}
                    >
                       <span>{isEn ? 'Achievements' : 'الإنجازات'}</span>
                    </button>

                    <button
                       id="habit-archive-btn"
                       onClick={() => setViewMode('archive')}
                       className={`app-page-card border-0 flex items-center justify-center px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold active:scale-95 transition-transform shrink-0 whitespace-nowrap cursor-pointer ${s3d.surfaceCardClass}`}
                    >
                       <span>{isEn ? 'Record' : 'السجل'}</span>
                    </button>
                  </div>

                  {progress === 100 && (
                    <p className="text-[11px] font-semibold leading-relaxed mb-1.5 max-w-[220px]" style={{ color: s3d.subtextColor }}>
                      {isEn ? "Masha'Allah! A day full of devotion." : 'ما شاء الله! يوم مليء بالطاعات.'}
                    </p>
                  )}
                  
                  {/* Heatmap Row */}
                  <div id="habit-heatmap-grid" className="flex flex-col gap-1.5 w-full mt-1.5 pe-1 overflow-visible" dir={isEn ? 'ltr' : 'rtl'}>
                    <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-[3px] sm:gap-1 w-full overflow-visible py-1 px-0.5">
                      {heatmapData.slice(0, Math.ceil(heatmapData.length / 2)).map((day, i) => renderHeatmapBox(day, i))}
                    </div>
                    <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-[3px] sm:gap-1 w-full overflow-visible py-1 px-0.5">
                      {heatmapData.slice(Math.ceil(heatmapData.length / 2)).map((day, i) => renderHeatmapBox(day, i + Math.ceil(heatmapData.length / 2)))}
                    </div>
                  </div>
                </div>
                <div id="habit-progress-ring" className="shrink-0 flex flex-col items-center justify-end self-end pb-1 ps-2">
                  <ProgressRing
                    progress={progress}
                    color={hexColor}
                    size={62}
                    strokeWidth={6}
                    isDark={s3d.isDark}
                    isBlackTheme={s3d.isBlackTheme}
                  />
                </div>
            </div>
        </div>
        
        {/* Prayers */}
        <section id="habit-prayers-fard-sunnah-section" className="mb-6">
          <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2.5" style={{ color: s3d.textColor }}>
            <span className={`app-3d-badge border-0 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
              <Clock className="w-4 h-4" style={{ color: hexColor }} />
            </span>
            {isEn ? 'Obligatory Prayers & Sunnah' : 'الصلوات المكتوبة والسنن الرواتب'}
          </h3>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {prayersList.map(habit => renderPrayerCard(habit.id, habit.label))}
          </div>
        </section>
        
        {/* Additional Prayers */}
        <section id="habit-nawafil-section" className="mb-6">
          <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2.5" style={{ color: s3d.textColor }}>
            <span className={`app-3d-badge border-0 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
              <Heart className="w-4 h-4" style={{ color: hexColor }} />
            </span>
            {isEn ? 'Supererogatory Prayers' : 'صلوات النوافل'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {additionalPrayersList.map(habit => renderCard('prayers', habit.id, habit.label, habit.points))}
          </div>
        </section>

        {/* Quran */}
        <section id="quran-habit-section" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold flex items-center gap-2.5" style={{ color: s3d.textColor }}>
              <span className={`app-3d-badge border-0 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                <BookOpen className="w-4 h-4" style={{ color: hexColor }} />
              </span>
              {isEn ? 'Quran Recitation' : 'الورد القرآني'}
            </h3>
            <div className="flex items-center gap-2">
              {autoSyncEnabled && isSelectedToday && (
                <span className="app-3d-badge border-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{isEn ? 'Auto ⚡' : 'تلقائي ⚡'}</span>
                </span>
              )}
              {(currentRecord.quran?.pages || 0) > 0 && (
                <span className="app-3d-badge border-0 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {isEn ? 'Done ✓' : 'مكتمل ✓'}
                </span>
              )}
            </div>
          </div>
          <div 
            className={`app-page-card border-0 rounded-3xl p-4 sm:p-5 ${s3d.surfaceCardClass}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-sm block" style={{ color: s3d.textColor }}>{isEn ? 'Pages Read' : 'الصفحات المقروءة'}</span>
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
                    <span className="text-[11px] font-semibold block mt-0.5" style={{ color: s3d.subtextColor }}>
                      {text}
                    </span>
                  );
                })()}
              </div>
              <div className={`app-3d-recessed-field border-0 flex items-center gap-2 rounded-2xl p-1.5 pb-2 overflow-visible ${s3d.recessedInputClass}`}>
                 <button 
                    type="button"
                    onClick={() => setQuranPages(selectedDate, Math.max(0, (currentRecord.quran?.pages || 0) - 1))}
                    className={`app-page-card border-0 p-2 rounded-xl transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                 >
                    <Minus className="w-4 h-4" style={{ color: s3d.textColor }} />
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
                    className="font-black w-12 text-center text-base bg-transparent focus:outline-none rounded border-0"
                    style={{ color: s3d.textColor }}
                 />
                 <button 
                    type="button"
                    onClick={() => setQuranPages(selectedDate, (currentRecord.quran?.pages || 0) + 1)}
                    className={`app-page-card border-0 p-2 rounded-xl transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                 >
                    <Plus className="w-4 h-4" style={{ color: s3d.textColor }} />
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* Adhkar */}
        <section id="habit-adhkar-section" className="mb-6">
          <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2.5" style={{ color: s3d.textColor }}>
            <span className={`app-3d-badge border-0 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
              <Heart className="w-4 h-4" style={{ color: hexColor }} />
            </span>
            {isEn ? 'Adhkar' : 'الأذكار'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
             {adhkarList.map(habit => renderCard('adhkar', habit.id, habit.label, habit.points))}
          </div>
        </section>

        {/* Ethics & Parents */}
        <section id="habit-ethics-section" className="mb-8">
          <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2.5" style={{ color: s3d.textColor }}>
            <span className={`app-3d-badge border-0 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
              <Medal className="w-4 h-4" style={{ color: hexColor }} />
            </span>
            {isEn ? 'Kindness & Ethics' : 'بر الوالدين والأخلاق'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
              {ethicsList.map(habit => renderCard('ethics', habit.id, habit.label, habit.points))}
          </div>
        </section>

        {/* Custom Habits & Worships */}
        <section id="custom-habits-section" className="mb-8">
          <div className="flex items-center justify-between mb-3 gap-2 overflow-visible pb-1">
            <h3 className="text-sm font-extrabold flex items-center gap-2.5" style={{ color: s3d.textColor }}>
              <span className={`app-3d-badge border-0 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                <Star className="w-4 h-4 text-amber-500" />
              </span>
              <span>{isEn ? 'Custom Habits' : 'العبادات والعادات المخصصة'}</span>
              {filteredCustomHabits.length > 0 && (
                <span className={`app-3d-badge border-0 text-xs font-bold px-2.5 py-0.5 rounded-full ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`} style={{ color: s3d.subtextColor }}>
                  {filteredCustomHabits.length}
                </span>
              )}
            </h3>
            <button
              id="habit-add-custom-btn"
              onClick={() => setShowCustomHabitModal(true)}
              className="app-page-card border-0 flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-2xl active:scale-95 transition-transform cursor-pointer shrink-0"
              style={{ backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.75]" />
              <span>{isEn ? 'Add Habit' : 'إضافة عبادة'}</span>
            </button>
          </div>

          {filteredCustomHabits.length > 0 && (
            <div className="space-y-3">
              {filteredCustomHabits.map((habit) => renderCustomHabitCard(habit))}
            </div>
          )}
        </section>

        {/* Day Navigation & Date Selector */}
        <div 
          id="habit-date-navigation-card"
          className={`app-page-card border-0 rounded-3xl p-3.5 pb-4 mb-4 flex items-center justify-between gap-2 overflow-visible ${s3d.surfaceCardClass}`}
        >
          <button
            onClick={() => setSelectedDate(prev => moment(prev).subtract(1, 'day').format('YYYY-MM-DD'))}
            className={`app-page-card border-0 w-11 h-11 rounded-2xl active:scale-95 transition-transform flex items-center justify-center shrink-0 cursor-pointer ${s3d.surfaceCardClass}`}
            title={isEn ? 'Previous Day' : 'اليوم السابق'}
            aria-label={isEn ? 'Previous Day' : 'اليوم السابق'}
          >
            {isEn ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          <div className="flex-1 flex flex-col items-center justify-center min-w-0 gap-2 overflow-visible pb-1">
            <div className="flex items-center gap-2 flex-wrap justify-center overflow-visible">
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
                className={`app-page-card border-0 flex items-center gap-1.5 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                title={isEn ? 'Click to select a day to record' : 'انقر لاختيار أي يوم لتسجيله'}
              >
                <Calendar className="w-4 h-4 shrink-0" style={{ color: hexColor }} />
                <span>{selectedDayName}{isEn ? ', ' : '، '}{selectedFormattedDate}</span>
              </button>
              {isSelectedToday ? (
                <span className="app-3d-badge border-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  {isEn ? 'Today' : 'اليوم'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`app-page-card border-0 text-[10px] font-bold px-2.5 py-1 rounded-full text-amber-700 dark:text-amber-300 shrink-0 transition-all flex items-center gap-1 cursor-pointer ${s3d.surfaceCardClass}`}
                  title={isEn ? 'Back to today' : 'العودة إلى اليوم الحالي'}
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>{isEn ? 'Back to today' : 'العودة لليوم'}</span>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
              className={`app-page-card border-0 flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl transition-all cursor-pointer ${s3d.surfaceCardClass}`}
              title={isEn ? 'Click to select a day to record' : 'انقر لاختيار أي يوم لتسجيله'}
            >
              <span>{selectedHijriDate}</span>
            </button>
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

          <button
            disabled={isSelectedToday}
            onClick={() => setSelectedDate(prev => moment(prev).add(1, 'day').format('YYYY-MM-DD'))}
            className={`app-page-card border-0 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s3d.surfaceCardClass} ${
              isSelectedToday
                ? 'opacity-35 cursor-not-allowed'
                : 'cursor-pointer active:scale-95 transition-transform'
            }`}
            title={isSelectedToday ? (isEn ? 'Cannot record future days' : 'لا يمكن تسجيل أيام مستقبلية') : (isEn ? 'Next Day' : 'اليوم التالي')}
            aria-label={isSelectedToday ? (isEn ? 'Cannot record future days' : 'لا يمكن تسجيل أيام مستقبلية') : (isEn ? 'Next Day' : 'اليوم التالي')}
          >
            {isEn ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer Sentence */}
        <div className={`text-center pt-4 px-6 border-t ${s3d.dividerClass}`}>
           <p className="text-sm font-semibold opacity-75 leading-relaxed font-amiri" style={{ color: s3d.subtextColor }}>
            {isEn ? "Your consistency in worship is the greatest gift to you and to the spirits of Ahmed and Laila." : "استمرارك في العبادة هو أعظم هدية لك ولروح أحمد وليلى"}
           </p>
        </div>
      </main>

      {/* Streak Achievement Modal */}
      {showStreakMedal && (
        <div 
          className={`app-page-card border-0 fixed inset-x-0 bottom-20 mx-auto w-[90%] max-w-sm rounded-3xl p-6 text-center z-50 ${s3d.surfaceCardClass}`}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
             <Confetti active={showStreakMedal} config={CONFETTI_CONFIG} />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div 
              className="app-3d-badge border-0 w-16 h-16 flex items-center justify-center rounded-full mb-4"
              style={{ backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }}
            >
              <Medal className="w-8 h-8" style={{ color: s3d.btnTextColor }} />
            </div>
            <h3 className="text-xl font-extrabold mb-2" style={{ color: s3d.textColor }}>{isEn ? 'Consistency Medal' : 'وسام الاستمرارية'}</h3>
            <p className="font-semibold" style={{ color: s3d.subtextColor }}>{activeStreakMsg}</p>
          </div>
        </div>
      )}

      {/* Weekly Achievement Card Modal */}
      {showWeeklyModal && (
        <WeeklyAchievementModal
          records={records}
          getDailyProgress={getDailyProgress}
          customHabits={customHabits}
          theme={theme}
          hexColor={hexColor}
          isBlackTheme={s3d.isBlackTheme}
          onClose={() => setShowWeeklyModal(false)}
        />
      )}

      {/* Custom Habit Modal */}
      {showCustomHabitModal && (
        <CustomHabitModal
          hexColor={hexColor}
          isBlackTheme={s3d.isBlackTheme}
          onClose={() => setShowCustomHabitModal(false)}
          onAdded={(title) => showTrackerToast(isEn ? `Habit "${title}" added successfully 🌿` : `تمت إضافة "${title}" بنجاح 🌿`)}
          onNavigate={onNavigate}
        />
      )}

      {/* Delete Confirmation Dialog - Modal Bottom Sheet style */}
      {habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65" dir={isEn ? 'ltr' : 'rtl'} onClick={() => setHabitToDelete(null)}>
          <div
            className={`app-page-card border-0 w-full max-w-xs rounded-3xl p-6 text-center ${s3d.surfaceCardClass}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="app-3d-badge border-0 w-12 h-12 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center mx-auto mb-3.5">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold mb-1.5" style={{ color: s3d.textColor }}>
              {isEn ? 'Delete Habit' : 'حذف العبادة'}
            </h3>
            <p className="text-xs mb-5 leading-relaxed font-medium" style={{ color: s3d.subtextColor }}>
              {isEn ? `Are you sure you want to delete the habit "${habitToDelete.title}"?` : `هل أنت متأكد من حذف عبادة "${habitToDelete.title}"؟`}
            </p>
            <div className="flex gap-2.5 overflow-visible pb-1">
              <button
                onClick={handleConfirmDelete}
                className="app-page-card border-0 flex-1 py-3 rounded-2xl text-white font-black text-xs cursor-pointer transition-all"
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF'
                }}
              >
                {isEn ? 'Yes, Delete' : 'نعم، حذف'}
              </button>
              <button
                onClick={() => setHabitToDelete(null)}
                className={`app-page-card border-0 flex-1 py-3 rounded-2xl font-bold text-xs cursor-pointer ${s3d.surfaceCardClass}`}
              >
                {isEn ? 'Cancel' : 'إلغاء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Distribution Explanation Modal */}
      {showPointsModal && (() => {
          const baseTotal =
            Object.values(HABIT_WEIGHTS.fard).reduce((a, b) => a + b, 0) +
            Object.values(HABIT_WEIGHTS.sunnah).reduce((a, b) => a + b, 0) +
            Object.values(HABIT_WEIGHTS.nawafil).reduce((a, b) => a + b, 0) +
            HABIT_WEIGHTS.quranMax +
            Object.values(HABIT_WEIGHTS.adhkar).reduce((a, b) => a + b, 0) +
            Object.values(HABIT_WEIGHTS.ethics).reduce((a, b) => a + b, 0);

          const customAvailableTotal = filteredCustomHabits.length * HABIT_WEIGHTS.customHabit;

          const distributionSections = [
            {
              id: 'fard',
              title: isEn ? 'Obligatory Prayers (5 Prayers)' : 'الصلوات المكتوبة (الفرائض الخمس)',
              earned: scoreBreakdown.fardPoints,
              max: 35,
              detail: isEn
                ? '7 pts per prayer (Fajr, Dhuhr, Asr, Maghrib, Isha)'
                : '7 نقاط لكل صلاة مفروضة (5 × 7 نقاط)',
            },
            {
              id: 'sunnah',
              title: isEn ? 'Regular Sunnah Prayers' : 'السنن الرواتب',
              earned: scoreBreakdown.sunnahPoints,
              max: 10,
              detail: isEn
                ? '2 pts for each prayer’s Sunnah (5 × 2 pts)'
                : 'نقطتان لكل سنة راتبة مع الصلوات الخمس (5 × 2 نقاط)',
            },
            {
              id: 'nawafil',
              title: isEn ? 'Voluntary Prayers & Qiyam' : 'النوافل وقيام الليل',
              earned: scoreBreakdown.nawafilPoints,
              max: 13,
              detail: isEn
                ? 'Witr (3) • Qiyam (3) • Duha (2) • Masjid, Tasabih, Hajah, Tawbah, Istikharah (1 pt each)'
                : 'الشفع والوتر (3) • قيام الليل (3) • الضحى (2) • تحية المسجد، التسابيح، الحاجة، التوبة، الاستخارة (نقطة لكل صلاة)',
            },
            {
              id: 'quran',
              title: isEn ? 'Quran Recitation' : 'الورد القرآني',
              earned: scoreBreakdown.quranPoints,
              max: HABIT_WEIGHTS.quranMax,
              detail: isEn
                ? 'Up to 15 pts based on pages read (from 1 page up to 20+ pages / full Juz)'
                : 'تصل إلى 15 نقطة حسب عدد الصفحات المقروءة (تبدأ من صفحة واحدة وتكتمل عند 20 صفحة فأكثر)',
            },
            {
              id: 'adhkar',
              title: isEn ? 'Daily Adhkar' : 'الأذكار اليومية',
              earned: scoreBreakdown.adhkarPoints,
              max: 15,
              detail: isEn
                ? 'Morning (4) • Evening (4) • Salah Adhkar (3) • Istighfar (2) • Supplications (2)'
                : 'أذكار الصباح (4) • المساء (4) • الصلاة (3) • الاستغفار (2) • الأدعية (2)',
            },
            {
              id: 'ethics',
              title: isEn ? 'Kindness, Charity & Ethics' : 'بر الوالدين والأخلاق والصدقة',
              earned: scoreBreakdown.ethicsPoints,
              max: 15,
              detail: isEn
                ? 'Parents (5) • Charity (5) • Visiting Relatives (3) • Visiting Sick (2)'
                : 'بر الوالدين (5) • الصدقة (5) • صلة الرحم (3) • زيارة مريض (2)',
            },
          ];

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65"
              dir={isEn ? 'ltr' : 'rtl'}
              onClick={() => setShowPointsModal(false)}
            >
              <div
                className={`app-page-card border-0 w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[88dvh] ${s3d.surfaceCardClass}`}
                style={{ fontFamily: theme.font }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b ${s3d.dividerClass} shrink-0`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`app-3d-badge border-0 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                      <Award className="w-4.5 h-4.5" style={{ color: hexColor }} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm sm:text-base truncate" style={{ color: s3d.textColor }}>
                        {isEn ? 'Points Distribution' : 'طريقة توزيع النقاط'}
                      </h3>
                      <p className="text-[11px] font-bold" style={{ color: s3d.subtextColor }}>
                        {isEn
                          ? `Earned ${scoreBreakdown.totalEarned} of ${scoreBreakdown.totalAvailable} pts (${scoreBreakdown.percentage}%)`
                          : `المكتسب ${scoreBreakdown.totalEarned} من أصل ${scoreBreakdown.totalAvailable} نقطة (${scoreBreakdown.percentage}%)`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPointsModal(false)}
                    className={`app-3d-badge border-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 shrink-0 ${s3d.isBlackTheme ? 'bg-white/10 text-white' : 'bg-slate-100 dark:bg-white/10'}`}
                    style={{ color: s3d.textColor }}
                    aria-label={isEn ? 'Close' : 'إغلاق'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-3 hide-scrollbar">
                  {/* Simple Summary Box */}
                  <div
                    className="app-inner-3d-box border-0 rounded-2xl p-3.5 text-xs leading-relaxed font-semibold"
                    style={{ backgroundColor: s3d.softResultBg, color: s3d.textColor }}
                  >
                    {isEn ? (
                      <>
                        Base daily worships total <b>{baseTotal} pts</b>. Your daily percentage equals your earned points divided by today&apos;s total (<b>{scoreBreakdown.totalAvailable} pts</b>). Any scheduled custom habit added automatically adds <b>+{HABIT_WEIGHTS.customHabit} pts</b>.
                      </>
                    ) : (
                      <>
                        مجموع نقاط العبادات الأساسية <b>{baseTotal} نقطة</b>، وتُحسب نسبتك اليومية بقسمة نقاطك المكتسبة على إجمالي نقاط اليوم المتاحة (<b>{scoreBreakdown.totalAvailable} نقطة</b>). وكل عبادة مخصصة مجدولة تضيف <b>+{HABIT_WEIGHTS.customHabit} نقاط</b> تلقائياً.
                      </>
                    )}
                  </div>

                  {/* Base Categories */}
                  <div className="space-y-2">
                    {distributionSections.map((sec) => (
                      <div
                        key={sec.id}
                        className={`app-3d-recessed-field border-0 rounded-2xl p-3 ${s3d.recessedInputClass}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-extrabold text-xs sm:text-[13px]" style={{ color: s3d.textColor }}>
                            {sec.title}
                          </span>
                          <span
                            className="app-3d-badge border-0 text-[11px] font-black px-2.5 py-0.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: hexToRgba(hexColor, s3d.isBlackTheme ? 0.2 : 0.12),
                              color: s3d.isBlackTheme ? '#FFFFFF' : hexColor,
                            }}
                          >
                            {sec.earned} / {sec.max} {isEn ? 'pts' : 'نقطة'}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed font-medium" style={{ color: s3d.subtextColor }}>
                          {sec.detail}
                        </p>
                      </div>
                    ))}

                    {/* Dynamic Custom Habits Section */}
                    <div
                      className={`app-3d-recessed-field border-0 rounded-2xl p-3 ${s3d.recessedInputClass}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-extrabold text-xs sm:text-[13px] flex items-center gap-1.5" style={{ color: s3d.textColor }}>
                          <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{isEn ? 'Added Custom Habits' : 'العبادات المخصصة المضافة'}</span>
                        </span>
                        <span
                          className="app-3d-badge border-0 text-[11px] font-black px-2.5 py-0.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: hexToRgba(hexColor, s3d.isBlackTheme ? 0.2 : 0.12),
                            color: s3d.isBlackTheme ? '#FFFFFF' : hexColor,
                          }}
                        >
                          {scoreBreakdown.customPoints} / {customAvailableTotal} {isEn ? 'pts' : 'نقطة'}
                        </span>
                      </div>

                      {filteredCustomHabits.length > 0 ? (
                        <div className="mt-2 space-y-1.5">
                          <p className="text-[11px] font-medium mb-1.5" style={{ color: s3d.subtextColor }}>
                            {isEn
                              ? `${filteredCustomHabits.length} scheduled custom habit(s) today (+${HABIT_WEIGHTS.customHabit} pts each):`
                              : `${filteredCustomHabits.length} عبادة مخصصة مجدولة لهذا اليوم (+${HABIT_WEIGHTS.customHabit} نقاط لكل عبادة):`}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {filteredCustomHabits.map((habit) => {
                              const isDone = !!(currentRecord.custom && currentRecord.custom[habit.id]);
                              return (
                                <span
                                  key={habit.id}
                                  className={`app-3d-badge border-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                                    isDone
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                      : s3d.isBlackTheme
                                        ? 'bg-white/10 text-zinc-200'
                                        : 'bg-white dark:bg-slate-800'
                                  }`}
                                  style={!isDone ? { color: s3d.textColor } : undefined}
                                >
                                  <span>{habit.icon || '⭐'}</span>
                                  <span className="truncate max-w-[140px]">{habit.title}</span>
                                  <span className="opacity-75 font-black">({HABIT_WEIGHTS.customHabit})</span>
                                  {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] leading-relaxed font-medium" style={{ color: s3d.subtextColor }}>
                          {isEn
                            ? `No custom habits scheduled for this day yet. Each added habit automatically adds +${HABIT_WEIGHTS.customHabit} pts to the total.`
                            : `لا توجد عبادات مخصصة مجدولة لهذا اليوم حالياً؛ وعند إضافة أي عبادة جديدة يرتفع المجموع تلقائياً بمقدار ${HABIT_WEIGHTS.customHabit} نقاط لكل عبادة.`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Total Equation Footer */}
                <div className={`px-4 sm:px-5 py-3 border-t ${s3d.dividerClass} shrink-0 flex items-center justify-between gap-2`}>
                  <span className="text-[11px] font-bold" style={{ color: s3d.subtextColor }}>
                    {filteredCustomHabits.length > 0
                      ? (isEn
                          ? `Total: ${baseTotal} + ${customAvailableTotal} custom`
                          : `المجموع: ${baseTotal} (الأساسي) + ${customAvailableTotal} (المخصصة)`)
                      : (isEn ? 'Base daily total' : 'إجمالي نقاط اليوم المتاحة')}
                  </span>
                  <span
                    className="app-3d-badge border-0 text-xs font-black px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: s3d.primaryColor,
                      color: s3d.btnTextColor,
                    }}
                  >
                    {scoreBreakdown.totalAvailable} {isEn ? 'pts' : 'نقطة'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Toast Notification */}
      {trackerToast && (
        <div
          className="app-3d-toast fixed bottom-[calc(var(--app-bottom-clearance,5.25rem)+1rem)] left-1/2 -translate-x-1/2 max-w-[85vw] w-max text-xs sm:text-sm font-bold py-2.5 px-4 rounded-2xl z-50 pointer-events-none border-0 flex items-center justify-center gap-2.5 text-center leading-normal break-words"
          style={toast3D.style}
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={toast3D.iconStyle}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
          <span>{trackerToast}</span>
        </div>
      )}

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
