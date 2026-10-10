import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle, Clock, Heart, BookOpen, Plus, Minus, Medal, Award, Star, Trash2, Sparkles, Share2, Calendar, RotateCcw } from 'lucide-react';
import moment from 'moment-hijri';
import { useHabitTracker, DailyRecord, HabitCategory, defaultRecord, CustomHabit } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import BottomBar from '../components/BottomBar';
import { registerBackInterceptor } from '../hooks/useBackButton';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import Confetti from 'react-dom-confetti';
import HabitArchive from '../components/HabitArchive';
import WeeklyAchievementModal from '../components/WeeklyAchievementModal';
import CustomHabitModal from '../components/CustomHabitModal';
import { shareDailyHabitCard } from '../utils/habitShareHelper';

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
  const { theme } = useTheme();
  const isBlackTheme = theme.bgColor === '#000000';
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
  const getDailyProgress = useHabitTracker((state) => state.getDailyProgress);
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

  const showTrackerToast = (msg: string) => {
    setTrackerToast(msg);
    setTimeout(() => setTrackerToast(''), 3000);
  };

  // Get record and progress for the selected date
  const currentRecord = records[selectedDate] || defaultRecord;
  const progress = getDailyProgress(selectedDate);

  const prevDayStr = moment(selectedDate).subtract(1, 'days').format('YYYY-MM-DD');
  const prevDayProgress = getDailyProgress(prevDayStr);
  const diff = progress - prevDayProgress;

  const selectedMoment = moment(selectedDate);
  const selectedDayName = ARABIC_DAYS[selectedMoment.day()];
  const selectedFormattedDate = selectedMoment.locale('ar').format('D MMMM YYYY');
  const selectedHijriDate = `${selectedMoment.iDate()} ${selectedMoment.locale('ar-SA').format('iMMMM')} ${selectedMoment.iYear()} هـ`;

  let comparisonMsg = '';
  let comparisonClass = '';

  if (diff > 0) {
    comparisonMsg = `أعلى من اليوم السابق بـ ${diff}% 📈`;
    comparisonClass = isBlackTheme ? 'bg-white/10 text-white border border-white/20' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  } else if (diff < 0) {
    comparisonMsg = `أقل من اليوم السابق بـ ${Math.abs(diff)}% 📉`;
    comparisonClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  } else {
    comparisonMsg = `نفس إنجاز اليوم السابق ➖`;
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

  useEffect(() => {
    // Schedule Notifications on Mount
    const schedule = async () => {
      if (Capacitor.isNativePlatform()) {
        const perms = await LocalNotifications.checkPermissions();
        if (perms.display === 'granted') {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: 1111,
                title: 'مربّي العبادات',
                body: 'صلاة الضحى غنيمة.. هل صليتها اليوم؟',
                schedule: { allowWhileIdle: true, on: { hour: 9, minute: 30 } },
                extra: { page: 'habit-tracker' }
              },
              {
                id: 1112,
                title: 'يوم الجمعة',
                body: 'لا تنسَ الاتصال بوالديك والدعاء لأحمد وليلى',
                // Capacitor Weekdays: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
                schedule: { allowWhileIdle: true, on: { weekday: 6, hour: 10, minute: 0 } },
                extra: { page: 'habit-tracker' }
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
          setActiveStreakMsg(`أحسنت! أتممت 7 أيام متتالية في هذه العبادة`);
          setShowStreakMedal(true);
          setTimeout(() => setShowStreakMedal(false), 4000);
        }
      }, 100);
    }
  };

  const prayersList = [
    { id: 'fajr', label: 'الفجر' },
    { id: 'dhuhr', label: 'الظهر' },
    { id: 'asr', label: 'العصر' },
    { id: 'maghrib', label: 'المغرب' },
    { id: 'isha', label: 'العشاء' },
  ];

  const additionalPrayersList = [
    { id: 'duha', label: 'صلاة الضحى' },
    { id: 'qiyam', label: 'قيام الليل' },
    { id: 'witr', label: 'صلاة الوتر' },
    { id: 'masjid', label: 'تحية المسجد' },
    { id: 'tasbih', label: 'صلاة التسابيح' },
    { id: 'hajah', label: 'صلاة الحاجة' },
    { id: 'tawbah', label: 'صلاة التوبة' },
    { id: 'istikharah', label: 'صلاة الاستخارة' },
  ];

  const adhkarList = [
    { id: 'sabah', label: 'أذكار الصباح' },
    { id: 'masaa', label: 'أذكار المساء' },
    { id: 'istighfar', label: 'الاستغفار' },
    { id: 'adia', label: 'الأدعية' },
  ];

  const ethicsList = [
    { id: 'parents', label: 'الدعاء للوالدين' },
    { id: 'charity', label: 'صدقة' },
    { id: 'visitFamily', label: 'زيارة الأهل والأقارب' },
    { id: 'visitSick', label: 'زيارة مريض' },
  ];

  const handleConfirmDelete = () => {
    if (!habitToDelete) return;
    removeCustomHabit(habitToDelete.id);
    showTrackerToast(`تم حذف عبادة "${habitToDelete.title}"`);
    setHabitToDelete(null);
  };

  const renderPrayerCard = (id: string, label: string) => {
    const fardId = id;
    const sunnahId = `${id}Sunnah`;
    
    // For selected date rendering:
    const isFardCompleted = (currentRecord.prayers as any)?.[fardId];
    const isSunnahCompleted = (currentRecord.prayers as any)?.[sunnahId];
    
    return (
      <div key={id} id={`prayer-card-${id}`} className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-3 shadow-sm border border-black/5 dark:border-white/5 mb-0">
         <span className="font-bold text-sm block mb-2 px-1 text-gray-800 dark:text-gray-200">{label}</span>
         <div className="flex gap-2">
            <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => handleToggle('prayers', fardId)}
               className={`flex-1 flex items-center justify-between py-1.5 px-2 rounded-xl text-xs font-semibold transition-colors border ${isFardCompleted ? (isBlackTheme ? 'text-black' : 'text-white') : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
               style={isFardCompleted ? { backgroundColor: hexColor, borderColor: hexColor } : {}}
            >
               <span>الفريضة</span>
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
               <span>السنة</span>
               <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSunnahCompleted ? 'border-transparent' : 'border-gray-300 dark:border-gray-600'}`} style={isSunnahCompleted ? { backgroundColor: isBlackTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)' } : {}}>
                  {isSunnahCompleted && <CheckCircle className={`w-2.5 h-2.5 ${isBlackTheme ? 'text-black' : 'text-white'}`} />}
               </div>
            </motion.button>
         </div>
      </div>
    );
  };

  const renderCard = (category: HabitCategory, habitId: string, label: string) => {
    const isCompleted = (currentRecord[category] as any)?.[habitId];
    const streak = getStreak(category, habitId);
    
    return (
      <motion.button
        key={`${category}-${habitId}`}
        whileTap={{ scale: 0.96 }}
        onClick={() => handleToggle(category, habitId)}
        className={`w-full flex items-center justify-between p-3 rounded-2xl mb-0 border backdrop-blur-sm transition-all ${
          isCompleted 
            ? 'bg-white shadow-md border-transparent dark:bg-gray-800' 
            : 'bg-white/50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
        }`}
      >
        <span className={`font-semibold text-xs sm:text-sm px-1 ${isCompleted ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {label}
        </span>
        <div className="flex items-center gap-2">
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
            ? 'bg-white shadow-md border-transparent dark:bg-gray-800'
            : 'bg-white/60 border-gray-200 dark:bg-gray-800/60 dark:border-gray-700'
        }`}
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
                  {isSelectedToday ? 'اليوم 🌟' : 'مجدول لهذا اليوم 🌟'}
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
            title={isCompleted ? 'تم الإنجاز' : 'تحديد كمنجز'}
          >
            {isCompleted && <CheckCircle className={`w-4 h-4 ${isBlackTheme ? 'text-black' : 'text-white'}`} />}
          </motion.button>

          <button
            onClick={() => setHabitToDelete({ id: habit.id, title: habit.title })}
            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="حذف العبادة"
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
        onSelectDate={(date) => {
          setSelectedDate(date);
          setViewMode('tracker');
          showTrackerToast(`تم فتح عبادات يوم ${date}`);
        }} 
      />
    );
  }

  const habitTrackerTutorialSteps: TutorialStep[] = [
    {
        id: 'habit-welcome',
        title: 'مرحباً بك في مربّي العبادات',
        text: 'هذا القسم مصمم خصيصاً ليساعدك على بناء عادات إيمانية قوية والمحافظة على طاعاتك اليومية بكل سهولة ويسر.',
        position: { top: '60%' },
        icon: <Heart className="w-8 h-8 text-white" />
    },
    {
        id: 'habit-progress',
        title: 'إنجازك اليومي والسنوي',
        text: 'هنا ترى ملخص إنجازك اليومي، ومخطط الحرارة الذي يوضح استمراريتك طوال الشهر. كل مربع ملون يمثل يوماً مليئاً بالطاعات.',
        selector: '#daily-achievement-card',
        icon: <CheckCircle className="w-8 h-8 text-white" />
    },
    {
        id: 'habit-weekly',
        title: 'بطاقة الإنجاز الأسبوعية',
        text: 'صدر بطاقة حصاد أسبوعك الإيماني كصورة جميلة بجودة عالية أو انسخ ملخصها وشاركها مع الأهل والأصدقاء للتشجيع والتنافس في الخير.',
        selector: '#weekly-card-btn',
        icon: <Award className="w-8 h-8 text-white" />
    },
    {
        id: 'habit-fajr',
        title: 'الفرائض والسنن',
        text: 'يمكنك هنا تسجيل صلواتك الخمس، مع إمكانية متابعة السنن الرواتب لكل صلاة بشكل منفصل لزيادة الأجر.',
        selector: '#prayer-card-fajr',
        icon: <Clock className="w-8 h-8 text-white" />
    },
    {
        id: 'habit-quran',
        title: 'الورد القرآني',
        text: 'لا تنسَ نصيبك من كتاب الله؛ سجل عدد الصفحات التي قرأتها اليوم وتابع تقدمك في الورد اليومي.',
        selector: '#quran-habit-section',
        icon: <BookOpen className="w-8 h-8 text-white" />
    },
    {
        id: 'habit-custom',
        title: 'العبادات المخصصة',
        text: 'يمكنك إضافة عباداتك الخاصة (كصيام الاثنين والخميس أو ركعتي الضحى وبر الوالدين) لتتابع استمراريتك وتدخل في حساب إنجازك اليومي والأسبوعي.',
        selector: '#custom-habits-section',
        icon: <Star className="w-8 h-8 text-white" />
    },
    {
        id: 'habit-streaks',
        title: 'أوسمة الاستمرارية',
        text: 'عندما تحافظ على عبادة معينة لـ 7 أيام متتالية، ستحصل على وسام تقديري تشجيعاً لك على المداومة. "أحب الأعمال إلى الله أدومها وإن قل".',
        position: { top: '70%' },
        icon: <Medal className="w-8 h-8 text-white" />
    }
  ];

  return (
    <div className={`h-screen h-[100dvh] max-h-screen max-h-[100dvh] flex flex-col bg-transparent relative overflow-hidden`} dir="rtl">
      <header className="app-top-bar shrink-0">
          <div className="app-top-bar__inner">
              <div className="relative flex items-center justify-center w-full">
                  <div className="absolute left-0">
                    <ThemePageLock />
                  </div>
                  <h1 className="app-top-bar__title text-2xl font-kufi">
                      مربّي العبادات
                  </h1>
              </div>
              <p className="app-top-bar__subtitle">
                  متابعة الطاعات والسنن اليومية
              </p>
          </div>
      </header>

      {/* Content */}
      <main className="w-full flex-1 min-h-0 overflow-y-auto px-4 pt-2 pb-36 overscroll-contain">
        
        {/* 1. Day Navigation & Date Selector (Now first card) */}
        <div className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-black/5 dark:border-white/5 mb-3 flex items-center justify-between gap-2">
          {/* Previous Day Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setSelectedDate(prev => moment(prev).subtract(1, 'day').format('YYYY-MM-DD'))}
            className="py-1.5 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 text-xs font-bold shrink-0"
            title="اليوم السابق"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </motion.button>

          {/* Current Date Display & Picker */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
                className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
                title="انقر لاختيار أي يوم لتسجيله"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: hexColor }} />
                <span>{selectedDayName}، {selectedFormattedDate}</span>
              </button>
              {isSelectedToday ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 shrink-0">
                  اليوم
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200 shrink-0 transition-colors flex items-center gap-1"
                  title="العودة إلى اليوم الحالي"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>العودة لليوم</span>
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
            title={isSelectedToday ? 'لا يمكن تسجيل أيام مستقبلية' : 'اليوم التالي'}
          >
            <span>التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Past Day Notice Banner */}
        {!isSelectedToday && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 rounded-2xl p-2.5 px-3.5 mb-3 flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🗓️</span>
              <span className="truncate">
                أنت تسجل عبادات يوم سابق: <b className="font-bold underline">{selectedDayName} ({selectedDate})</b>
              </span>
            </div>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors shrink-0"
            >
              العودة لليوم
            </button>
          </motion.div>
        )}

        {/* 2. Daily Achievement Card (Now second card) */}
        <div id="daily-achievement-card" className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-3 sm:p-3.5 shadow-sm border border-black/5 dark:border-white/5 mb-3">
            {/* Header: Title */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base sm:text-lg font-bold font-sans dark:text-white flex items-center gap-2">
                    <span>إنجاز {isSelectedToday ? 'اليوم' : selectedDayName}</span>
                    <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                        ({new Intl.DateTimeFormat('ar-EG', { month: 'long', day: 'numeric' }).format(new Date(selectedDate))})
                    </span>
                </h2>
            </div>

            <div className="flex items-end justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Action buttons: الأسبوع والسجل جنباً إلى جنب */}
                  <div className="flex items-center gap-2 flex-nowrap mb-2 overflow-x-auto no-scrollbar">
                    <motion.button
                       id="weekly-card-btn"
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setShowWeeklyModal(true)}
                       className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 shadow-sm shrink-0 whitespace-nowrap"
                    >
                       <Award className="w-4 h-4 text-amber-500" />
                       <span>الأسبوع 🏆</span>
                    </motion.button>

                    <motion.button
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setViewMode('archive')}
                       className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-transform bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 shadow-sm shrink-0 whitespace-nowrap"
                       style={{ color: hexColor }}
                    >
                       <BookOpen className="w-4 h-4" />
                       <span>السجل</span>
                    </motion.button>
                  </div>

                  {progress === 100 && (
                    <p className="opacity-70 text-[11px] leading-relaxed font-sans dark:text-gray-300 mb-1 max-w-[200px]">ما شاء الله! يوم مليء بالطاعات.</p>
                  )}
                  
                  {/* Heatmap Row - Clickable days to select any day */}
                  <div className="flex flex-col gap-1 w-full" dir="rtl">
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
            الصلوات المكتوبة والسنن الرواتب
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {prayersList.map(habit => renderPrayerCard(habit.id, habit.label))}
          </div>
        </section>
        
        {/* Additional Prayers */}
        <section className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 dark:text-white">
            <Heart className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            صلوات النوافل
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {additionalPrayersList.map(habit => renderCard('prayers', habit.id, habit.label))}
          </div>
        </section>

        {/* Quran */}
        <section id="quran-habit-section" className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 dark:text-white">
            <BookOpen className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            الورد القرآني
          </h3>
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 shadow-sm border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-sm dark:text-gray-200">الصفحات المنجزة</span>
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                 <button 
                    onClick={() => setQuranPages(selectedDate, Math.max(0, (currentRecord.quran?.pages || 0) - 1))}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-600 shadow-sm"
                 >
                    <Minus className="w-4 h-4 dark:text-white" />
                 </button>
                 <span className="font-bold w-6 text-center text-base dark:text-white">{currentRecord.quran?.pages || 0}</span>
                 <button 
                    onClick={() => setQuranPages(selectedDate, (currentRecord.quran?.pages || 0) + 1)}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-600 shadow-sm"
                 >
                    <Plus className="w-4 h-4 dark:text-white" />
                 </button>
              </div>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleToggle('quran', 'completed', () => currentRecord.quran?.completed)}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  currentRecord.quran?.completed
                    ? (isBlackTheme ? 'text-black' : 'text-white')
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              style={currentRecord.quran?.completed ? { backgroundColor: hexColor } : {}}
            >
              {currentRecord.quran?.completed ? 'تم الإنجاز' : 'تأكيد الورد'}
            </motion.button>
          </div>
        </section>

        {/* Adhkar */}
        <section className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 dark:text-white">
            <Heart className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            الأذكار
          </h3>
          <div className="grid grid-cols-2 gap-2">
             {adhkarList.map(habit => renderCard('adhkar', habit.id, habit.label))}
          </div>
        </section>

        {/* Ethics & Parents */}
        <section className="mb-8">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 dark:text-white">
            <Medal className="w-4 h-4 opacity-70" style={{ color: hexColor }} />
            بر الوالدين والأخلاق
          </h3>
          <div className="grid grid-cols-2 gap-2">
              {ethicsList.map(habit => renderCard('ethics', habit.id, habit.label))}
          </div>
        </section>

        {/* Custom Habits & Worships */}
        <section id="custom-habits-section" className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 dark:text-white">
              <Star className="w-4 h-4 opacity-80 text-amber-500" />
              العبادات والعادات المخصصة
              {customHabits.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  {customHabits.length}
                </span>
              )}
            </h3>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCustomHabitModal(true)}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: hexColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة عبادة</span>
            </motion.button>
          </div>

          {customHabits.length > 0 && (
            <div className="space-y-2">
              {customHabits.map((habit) => renderCustomHabitCard(habit))}
            </div>
          )}
        </section>

        {/* Footer Sentence */}
        <div className="text-center pb-8 pt-4 px-6 border-t border-gray-200 dark:border-gray-700">
           <p className="text-sm font-semibold opacity-70 leading-relaxed font-amiri text-gray-600 dark:text-gray-400">
            "استمرارك في العبادة هو أعظم هدية لك ولروح أحمد وليلى"
           </p>
        </div>

      </main>

      <div className="shrink-0 z-30">
        <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
      </div>

      <TutorialOverlay tutorialId="habit-tracker-tutorial" steps={habitTrackerTutorialSteps} />

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
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">وسام الاستمرارية</h3>
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
            onAdded={(title) => showTrackerToast(`تمت إضافة "${title}" بنجاح 🌿`)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {habitToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl text-center border border-black/10 dark:border-white/10"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                حذف العبادة
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                هل أنت متأكد من حذف عبادة "{habitToDelete.title}"؟
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
                >
                  نعم، حذف
                </button>
                <button
                  onClick={() => setHabitToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors"
                >
                  إلغاء
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
    </div>
  );
};

export default HabitTracker;
