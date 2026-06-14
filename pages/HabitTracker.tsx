import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, CheckCircle, Clock, Heart, BookOpen, Plus, Minus, Medal } from 'lucide-react';
import moment from 'moment-hijri';
import { useHabitTracker, DailyRecord, HabitCategory, defaultRecord } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import BottomBar from '../components/BottomBar';
import { registerBackInterceptor } from '../hooks/useBackButton';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import Confetti from 'react-dom-confetti';
import HabitArchive from '../components/HabitArchive';

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

  const records = useHabitTracker((state) => state.records);
  const toggleHabit = useHabitTracker((state) => state.toggleHabit);
  const setQuranPages = useHabitTracker((state) => state.setQuranPages);
  const getDailyProgress = useHabitTracker((state) => state.getDailyProgress);
  const getStreak = useHabitTracker((state) => state.getStreak);
  const getHeatmapData = useHabitTracker((state) => state.getHeatmapData);

  const [viewMode, setViewMode] = useState<'tracker' | 'archive'>('tracker');
  const [showStreakMedal, setShowStreakMedal] = useState(false);
  const [activeStreakMsg, setActiveStreakMsg] = useState('');

  const todayRecord = records[todayStr] || defaultRecord;

  const progress = getDailyProgress(todayStr);
  const yesterdayStr = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const yesterdayProgress = getDailyProgress(yesterdayStr);
  const diff = progress - yesterdayProgress;

  let comparisonMsg = '';
  let comparisonClass = '';

  if (diff > 0) {
    comparisonMsg = `أعلى من الأمس بـ ${diff}% 📈`;
    comparisonClass = isBlackTheme ? 'bg-white/10 text-white border border-white/20' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  } else if (diff < 0) {
    comparisonMsg = `أقل من الأمس بـ ${Math.abs(diff)}% 📉`;
    comparisonClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  } else {
    comparisonMsg = `نفس إنجاز الأمس ➖`;
    comparisonClass = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }

  const handleHomeClick = () => {
    if (viewMode === 'archive') {
      setViewMode('tracker');
    } else {
      onBack();
    }
  };

  useEffect(() => {
    const interceptor = () => {
      if (viewMode === 'archive') {
        setViewMode('tracker');
        return true;
      }
      return false;
    };
    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [viewMode]);

  const heatmapData = useMemo(() => getHeatmapData(), [records, todayStr]);

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
    const wasCompleted = customCheck ? customCheck() : (todayRecord[category] as any)[habitId];
    
    if (category === 'quran' && customCheck) {
        // Handled specially
         toggleHabit(todayStr, category, habitId);
    } else {
        toggleHabit(todayStr, category, habitId);
    }
    
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

  const renderPrayerCard = (id: string, label: string) => {
    const fardId = id;
    const sunnahId = `${id}Sunnah`;
    
    // For standard rendering:
    const isFardCompleted = (todayRecord.prayers as any)[fardId];
    const isSunnahCompleted = (todayRecord.prayers as any)[sunnahId];
    
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
    const isCompleted = (todayRecord[category] as any)[habitId];
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

  if (viewMode === 'archive') {
    return <HabitArchive onBack={() => setViewMode('tracker')} />;
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
        id: 'habit-streaks',
        title: 'أوسمة الاستمرارية',
        text: 'عندما تحافظ على عبادة معينة لـ 7 أيام متتالية، ستحصل على وسام تقديري تشجيعاً لك على المداومة. "أحب الأعمال إلى الله أدومها وإن قل".',
        position: { top: '70%' },
        icon: <Medal className="w-8 h-8 text-white" />
    }
  ];

  return (
    <div className={`h-screen flex flex-col bg-transparent relative`}>
      <header className="app-top-bar">
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
      <main className="w-full flex-1 overflow-y-auto px-4 pt-0 pb-24">
        
        <div id="daily-achievement-card" className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 shadow-sm border border-black/5 dark:border-white/5 mb-6 mt-2">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold font-sans dark:text-white flex items-center gap-2">
                        إنجاز اليوم
                        <span className="text-xs font-normal opacity-60">({new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric' }).format(new Date())})</span>
                    </h2>
                    <motion.button
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setViewMode('archive')}
                       className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-transform bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm"
                       style={{ color: hexColor }}
                    >
                       <BookOpen className="w-4 h-4" />
                       السجل
                    </motion.button>
                  </div>
                  {progress === 100 && (
                    <p className="opacity-70 text-xs leading-relaxed font-sans dark:text-gray-300 mb-2 max-w-[200px]">ما شاء الله! يوم مليء بالطاعات.</p>
                  )}
                  
                  {/* Heatmap Row */}
                  <div className="flex flex-col gap-1 w-full mt-2" dir="rtl">
                    <div className="flex justify-start gap-1 w-full">
                      {heatmapData.slice(0, 15).map((day, i) => {
                        let opacity = 0.1;
                        if (day.progress > 0) opacity = 0.4;
                        if (day.progress >= 50) opacity = 0.7;
                        if (day.progress === 100) opacity = 1;

                        let bgClass = '';
                        let inlineStyle: any = {};
                        
                        const isPast = day.date < todayStr;
                        const isToday = day.date === todayStr;
                        
                        if (day.progress > 0) {
                           inlineStyle = { backgroundColor: hexColor, opacity };
                        } else if (isPast) {
                           inlineStyle = { backgroundColor: hexColor, opacity: 0.15 };
                        } else if (isToday) {
                           inlineStyle = { backgroundColor: hexColor, opacity: 0.3 };
                        } else {
                           bgClass = 'bg-gray-200 dark:bg-gray-700 opacity-50'; 
                        }
                        
                        // Highlight today's box with a border
                        if (isToday) {
                           inlineStyle = { ...inlineStyle, border: `2px solid ${hexColor}` };
                        }

                        return (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-all flex-grow-0 shrink-0 ${bgClass}`}
                            style={inlineStyle}
                            title={`${day.date}: ${day.progress}%`}
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
                        const isToday = day.date === todayStr;
                        
                        if (day.progress > 0) {
                           inlineStyle = { backgroundColor: hexColor, opacity };
                        } else if (isPast) {
                           inlineStyle = { backgroundColor: hexColor, opacity: 0.15 };
                        } else if (isToday) {
                           inlineStyle = { backgroundColor: hexColor, opacity: 0.3 };
                        } else {
                           bgClass = 'bg-gray-200 dark:bg-gray-700 opacity-50'; 
                        }
                        
                        // Highlight today's box with a border
                        if (isToday) {
                           inlineStyle = { ...inlineStyle, border: `2px solid ${hexColor}` };
                        }

                        return (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-all flex-grow-0 shrink-0 ${bgClass}`}
                            style={inlineStyle}
                            title={`${day.date}: ${day.progress}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                </div>
                <div className="shrink-0">
                  <ProgressRing progress={progress} color={hexColor} size={60} strokeWidth={5} />
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
                    onClick={() => setQuranPages(todayStr, Math.max(0, (todayRecord.quran?.pages || 0) - 1))}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-600 shadow-sm"
                 >
                    <Minus className="w-4 h-4 dark:text-white" />
                 </button>
                 <span className="font-bold w-6 text-center text-base dark:text-white">{todayRecord.quran?.pages || 0}</span>
                 <button 
                    onClick={() => setQuranPages(todayStr, (todayRecord.quran?.pages || 0) + 1)}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-600 shadow-sm"
                 >
                    <Plus className="w-4 h-4 dark:text-white" />
                 </button>
              </div>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleToggle('quran', 'completed', () => todayRecord.quran?.completed)}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  todayRecord.quran?.completed
                    ? (isBlackTheme ? 'text-black' : 'text-white')
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              style={todayRecord.quran?.completed ? { backgroundColor: hexColor } : {}}
            >
              {todayRecord.quran?.completed ? 'تم الإنجاز' : 'تأكيد الورد'}
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


        {/* Footer Sentence */}
        <div className="text-center pb-8 pt-4 px-6 border-t border-gray-200 dark:border-gray-700">
           <p className="text-sm font-semibold opacity-70 leading-relaxed font-amiri text-gray-600 dark:text-gray-400">
            "استمرارك في العبادة هو أعظم هدية لك ولروح أحمد وليلى"
           </p>
        </div>

      </main>

      <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

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
    </div>
  );
};

export default HabitTracker;
