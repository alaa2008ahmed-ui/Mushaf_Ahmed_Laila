import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import moment from 'moment-hijri';

export type HabitCategory = 'prayers' | 'quran' | 'adhkar' | 'ethics' | 'custom';

export interface CustomHabit {
  id: string;
  title: string;
  icon: string;
  description?: string;
  days?: number[]; // [0..6] where 0=Sunday, 1=Monday... Empty or undefined means daily
  createdAt: string;
}

export interface DailyRecord {
  prayers: {
    fajr: boolean;
    fajrSunnah: boolean;
    dhuhr: boolean;
    dhuhrSunnah: boolean;
    asr: boolean;
    asrSunnah: boolean;
    maghrib: boolean;
    maghribSunnah: boolean;
    isha: boolean;
    ishaSunnah: boolean;
    duha: boolean;
    qiyam: boolean;
    tasbih: boolean;
    masjid: boolean;
    hajah: boolean;
    tawbah: boolean;
    istikharah: boolean;
    witr: boolean;
  };
  quran: {
    pages: number;
    completed: boolean;
  };
  adhkar: {
    sabah: boolean;
    masaa: boolean;
    salah: boolean;
    istighfar: boolean;
    adia: boolean;
  };
  ethics: {
    parents: boolean;
    charity: boolean;
    visitFamily: boolean;
    visitSick: boolean;
  };
  custom?: Record<string, boolean>;
}

export const defaultRecord: DailyRecord = {
  prayers: { 
    fajr: false, fajrSunnah: false, 
    dhuhr: false, dhuhrSunnah: false, 
    asr: false, asrSunnah: false,
    maghrib: false, maghribSunnah: false, 
    isha: false, ishaSunnah: false, 
    duha: false, qiyam: false,
    tasbih: false, masjid: false, 
    hajah: false, tawbah: false,
    istikharah: false, witr: false
  },
  quran: { pages: 0, completed: false },
  adhkar: { sabah: false, masaa: false, salah: false, istighfar: false, adia: false },
  ethics: { parents: false, charity: false, visitFamily: false, visitSick: false },
  custom: {}
};

export const HABIT_WEIGHTS = {
  // الفرائض الخمس (35 نقطة إجمالاً - 7 نقاط لكل فريضة مكتوبة)
  fard: {
    fajr: 7,
    dhuhr: 7,
    asr: 7,
    maghrib: 7,
    isha: 7,
  },
  // السنن الرواتب للصلوات الخمس (10 نقاط إجمالاً - 2 نقطة لكل سنة راتبة)
  sunnah: {
    fajrSunnah: 2,
    dhuhrSunnah: 2,
    asrSunnah: 2,
    maghribSunnah: 2,
    ishaSunnah: 2,
  },
  // صلوات النوافل وقيام الليل (13 نقطة إجمالاً)
  nawafil: {
    witr: 3,       // صلاة الوتر
    qiyam: 3,      // قيام الليل
    duha: 2,       // صلاة الضحى
    masjid: 1,     // تحية المسجد
    tasbih: 1,     // صلاة التسابيح
    hajah: 1,      // صلاة الحاجة
    tawbah: 1,     // صلاة التوبة
    istikharah: 1, // صلاة الاستخارة
  },
  // الورد القرآني وكمية الصفحات (الحد الأقصى 15 نقطة)
  quranMax: 15,
  // الأذكار اليومية (15 نقطة إجمالاً)
  adhkar: {
    sabah: 4,      // أذكار الصباح
    masaa: 4,      // أذكار المساء
    salah: 3,      // أذكار الصلاة
    istighfar: 2,  // الاستغفار
    adia: 2,       // الأدعية
  },
  // بر الوالدين والصدقات وصلة الرحم (15 نقطة إجمالاً)
  ethics: {
    parents: 5,     // بر الوالدين والدعاء لهما
    charity: 5,     // الصدقة (مربي الصدقات)
    visitFamily: 3, // صلة الرحم وزيارة الأقارب
    visitSick: 2,   // عيادة المريض
  },
  // وزن كل عبادة مخصصة مضافة في اليوم (4 نقاط لكل عبادة مخصصة)
  customHabit: 4,
};

/**
 * حساب نقاط الورد القرآني بناءً على عدد الصفحات المقروءة وتأكيد الورد:
 * كلما زادت صفحات القراءة ارتفعت النقاط تلقائياً حتى 15 نقطة كاملة
 */
export const calculateQuranScore = (pages: number = 0, completed: boolean = false): number => {
  if (pages <= 0 && !completed) return 0;

  // النقاط المكتسبة حسب عدد الصفحات المقروءة:
  let pageScore = 0;
  if (pages >= 20) {
    pageScore = 13; // جزء كامل فأكثر
  } else if (pages >= 15) {
    pageScore = 12;
  } else if (pages >= 10) {
    pageScore = 10; // نصف جزء تقريباً
  } else if (pages >= 5) {
    pageScore = 8;  // ربع حزب أو ربع جزء
  } else if (pages >= 3) {
    pageScore = 5;
  } else if (pages >= 1) {
    pageScore = 3;  // صفحة أو صفحتين
  }

  // إضافة مكافأة تأكيد الورد اليومي
  if (completed) {
    if (pageScore === 0) {
      pageScore = 6; // تأكيد دون تحديد عدد الصفحات يمنح 6 نقاط تشجيعية
    } else {
      pageScore = Math.min(15, pageScore + 2); // إضافة نقطتي إتمام الورد
    }
  }

  // في حال قراءة 20 صفحة فأكثر مع التأكيد ينال كامل الـ 15 نقطة
  if (pages >= 20 && completed) {
    return 15;
  }

  return Math.min(15, pageScore);
};

export interface DailyScoreBreakdown {
  totalEarned: number;
  totalAvailable: number;
  percentage: number;
  fardPoints: number;
  sunnahPoints: number;
  nawafilPoints: number;
  quranPoints: number;
  adhkarPoints: number;
  ethicsPoints: number;
  customPoints: number;
}

/**
 * المعايير الرسمية لمعدل تلاوة القرآن الكريم وفق طبعة مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة:
 * - عدد صفحات المصحف الشريف: 604 صفحات (بمعدل 20 صفحة لكل جزء، و15 سطراً للصفحة القياسية بمتوسط ~75 كلمة).
 * - المعدل الرسمي المعتمد لقراءة الصفحة الواحدة (مرتبة الحدر المتقن): دقيقة واحدة (60 ثانية) للصفحة = 20 دقيقة للجزء.
 * - النطاق الزمني المعتمد لقراءة الجزء الكامل: يبدأ من 10 دقائق (حدر سريع متقن = 30 ثانية كحد أدنى للصفحة القياسية)
 *   إلى 20 دقيقة فأكثر (الحدر المعتاد والتدوير والترتيل).
 */
export const QURAN_READING_STANDARDS = {
  TOTAL_MUSHAF_PAGES: 604,
  PAGES_PER_JUZ: 20,
  STANDARD_WORDS_PER_PAGE: 75,
  STANDARD_SECONDS_PER_PAGE: 60,
  MIN_MINUTES_PER_JUZ: 10,
  STANDARD_MINUTES_PER_JUZ: 20,
  MIN_SECONDS_PER_STANDARD_PAGE: 30,
  MIN_SECONDS_SHORT_PAGE: 15,
  MIN_AUTO_SCROLL_SECONDS: 3,
  TRANSIENT_SKIM_RESET_SECONDS: 6,
} as const;

interface VerifiedQuranSyncData {
  pages: number[];
  totalVerifiedSeconds: number;
}

const getVerifiedSyncKey = (date: string) => `quran_verified_pages_v2_${date}`;

const readVerifiedSyncData = (date: string): VerifiedQuranSyncData => {
  try {
    const raw = localStorage.getItem(getVerifiedSyncKey(date));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.pages)) {
        return {
          pages: parsed.pages.filter((n: any) => typeof n === 'number' && n >= 1 && n <= 604),
          totalVerifiedSeconds: Number(parsed.totalVerifiedSeconds) || 0,
        };
      }
    }
  } catch (e) {}
  return { pages: [], totalVerifiedSeconds: 0 };
};

const writeVerifiedSyncData = (date: string, data: VerifiedQuranSyncData) => {
  try {
    localStorage.setItem(getVerifiedSyncKey(date), JSON.stringify(data));
  } catch (e) {}
};

export const getVerifiedPagesReadForDate = (date: string): number[] => {
  return readVerifiedSyncData(date).pages;
};

interface HabitTrackerState {
  records: Record<string, DailyRecord>;
  customHabits: CustomHabit[];
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
  addCustomHabit: (habit: { title: string; icon?: string; description?: string; days?: number[] }) => void;
  removeCustomHabit: (id: string) => void;
  toggleHabit: (date: string, category: HabitCategory, habitId: string) => void;
  setHabitStatus: (date: string, category: HabitCategory, habitId: string, status: boolean) => void;
  setQuranPages: (date: string, pages: number) => void;
  recordQuranPageRead: (pageNum: number, verifiedSeconds?: number, isAutoScroll?: boolean) => void;
  recordAdhkarRead: (type: 'sabah' | 'masaa' | 'salah' | 'istighfar' | 'adia') => void;
  getRecord: (date: string) => DailyRecord;
  getStreak: (category: HabitCategory, habitId: string) => number;
  getDailyScoreBreakdown: (date: string) => DailyScoreBreakdown;
  getDailyProgress: (date: string) => number;
  getHeatmapData: () => { date: string; progress: number; isToday?: boolean }[];
}

export const useHabitTracker = create<HabitTrackerState>()(
  persist(
    (set, get) => ({
      records: {},
      customHabits: [],
      autoSyncEnabled: true,

      setAutoSyncEnabled: (enabled) => {
        set({ autoSyncEnabled: enabled });
      },

      addCustomHabit: (habit) => {
        const newHabit: CustomHabit = {
          id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          title: habit.title.trim(),
          icon: habit.icon || '⭐',
          description: habit.description || '',
          days: habit.days || [],
          createdAt: moment().format('YYYY-MM-DD')
        };
        set((state) => ({
          customHabits: [...(state.customHabits || []), newHabit]
        }));
      },

      removeCustomHabit: (id) => {
        set((state) => ({
          customHabits: (state.customHabits || []).filter(h => h.id !== id)
        }));
      },

      toggleHabit: (date, category, habitId) => {
        set((state) => {
          const currentRecord: DailyRecord = state.records[date] 
            ? JSON.parse(JSON.stringify(state.records[date])) 
            : JSON.parse(JSON.stringify(defaultRecord));

          if (!currentRecord.custom) currentRecord.custom = {};
          if (!currentRecord.prayers) currentRecord.prayers = { ...defaultRecord.prayers };
          if (!currentRecord.quran) currentRecord.quran = { ...defaultRecord.quran };
          if (!currentRecord.adhkar) currentRecord.adhkar = { ...defaultRecord.adhkar };
          if (!currentRecord.ethics) currentRecord.ethics = { ...defaultRecord.ethics };

          if (category === 'custom') {
            currentRecord.custom[habitId] = !currentRecord.custom[habitId];
          } else {
            (currentRecord[category] as any)[habitId] = !(currentRecord[category] as any)[habitId];
          }
          return { records: { ...state.records, [date]: currentRecord } };
        });
      },

      setHabitStatus: (date, category, habitId, status) => {
        set((state) => {
          const currentRecord: DailyRecord = state.records[date] 
            ? JSON.parse(JSON.stringify(state.records[date])) 
            : JSON.parse(JSON.stringify(defaultRecord));

          if (!currentRecord.custom) currentRecord.custom = {};
          if (!currentRecord.prayers) currentRecord.prayers = { ...defaultRecord.prayers };
          if (!currentRecord.quran) currentRecord.quran = { ...defaultRecord.quran };
          if (!currentRecord.adhkar) currentRecord.adhkar = { ...defaultRecord.adhkar };
          if (!currentRecord.ethics) currentRecord.ethics = { ...defaultRecord.ethics };

          if (category === 'custom') {
            currentRecord.custom[habitId] = status;
          } else {
            (currentRecord[category] as any)[habitId] = status;
          }
          return { records: { ...state.records, [date]: currentRecord } };
        });
      },

      setQuranPages: (date, pages) => {
        const clampedPages = Math.max(0, Math.min(QURAN_READING_STANDARDS.TOTAL_MUSHAF_PAGES, Math.floor(Number(pages) || 0)));
        const syncData = readVerifiedSyncData(date);
        if (clampedPages === 0) {
          writeVerifiedSyncData(date, { pages: [], totalVerifiedSeconds: 0 });
        } else if (clampedPages < syncData.pages.length) {
          writeVerifiedSyncData(date, {
            pages: syncData.pages.slice(0, clampedPages),
            totalVerifiedSeconds: syncData.totalVerifiedSeconds,
          });
        }

        set((state) => {
          const currentRecord: DailyRecord = state.records[date] 
            ? JSON.parse(JSON.stringify(state.records[date])) 
            : JSON.parse(JSON.stringify(defaultRecord));
          if (!currentRecord.quran) currentRecord.quran = { ...defaultRecord.quran };
          currentRecord.quran.pages = clampedPages;
          currentRecord.quran.completed = clampedPages > 0;
          return { records: { ...state.records, [date]: currentRecord } };
        });
      },

      recordQuranPageRead: (pageNum, verifiedSeconds = 0, isAutoScroll = false) => {
        if (!get().autoSyncEnabled) return;
        if (!pageNum || pageNum < 1 || pageNum > QURAN_READING_STANDARDS.TOTAL_MUSHAF_PAGES) return;
        // في التمرير التلقائي يتم اعتماد كافة أوقات التمرير التلقائي، أما التمرير اليدوي فيشترط حد القراءة الفعلي (10 دقائق فأكثر للجزء)
        const minAllowedSeconds = isAutoScroll
          ? QURAN_READING_STANDARDS.MIN_AUTO_SCROLL_SECONDS
          : QURAN_READING_STANDARDS.MIN_SECONDS_SHORT_PAGE;
        if (verifiedSeconds < minAllowedSeconds) return;

        const today = moment().format('YYYY-MM-DD');
        const syncData = readVerifiedSyncData(today);

        // عدم تكرار احتساب نفس الصفحة في نفس اليوم عند العودة إليها أو التمرير البسيط
        if (syncData.pages.includes(pageNum)) {
          return;
        }

        const updatedSync: VerifiedQuranSyncData = {
          pages: [...syncData.pages, pageNum],
          totalVerifiedSeconds: syncData.totalVerifiedSeconds + verifiedSeconds,
        };
        writeVerifiedSyncData(today, updatedSync);

        set((state) => {
          const currentRecord: DailyRecord = state.records[today] 
            ? JSON.parse(JSON.stringify(state.records[today])) 
            : JSON.parse(JSON.stringify(defaultRecord));
          if (!currentRecord.quran) currentRecord.quran = { ...defaultRecord.quran };
          
          const currentPages = currentRecord.quran.pages || 0;
          const nextPages = Math.min(QURAN_READING_STANDARDS.TOTAL_MUSHAF_PAGES, currentPages + 1);
          currentRecord.quran.pages = nextPages;
          currentRecord.quran.completed = nextPages > 0;
          return { records: { ...state.records, [today]: currentRecord } };
        });
      },

      recordAdhkarRead: (type) => {
        if (!get().autoSyncEnabled) return;
        const today = moment().format('YYYY-MM-DD');
        set((state) => {
          const currentRecord: DailyRecord = state.records[today] 
            ? JSON.parse(JSON.stringify(state.records[today])) 
            : JSON.parse(JSON.stringify(defaultRecord));
          if (!currentRecord.adhkar) currentRecord.adhkar = { ...defaultRecord.adhkar };
          
          if (type === 'adia') {
            currentRecord.adhkar.adia = true;
            currentRecord.adhkar.istighfar = true;
          } else {
            (currentRecord.adhkar as any)[type] = true;
          }
          return { records: { ...state.records, [today]: currentRecord } };
        });
      },

      getRecord: (date) => {
        return get().records[date] || JSON.parse(JSON.stringify(defaultRecord));
      },

      getStreak: (category, habitId) => {
        const records = get().records;
        let streak = 0;
        let date = moment();
        const customHabits = get().customHabits || [];
        const customHabit = category === 'custom' ? customHabits.find(h => h.id === habitId) : null;
        
        let checkedDays = 0;
        while (checkedDays < 365) {
          const dateStr = date.format('YYYY-MM-DD');
          const dayOfWeek = date.day();
          const record = records[dateStr];
          
          const isApplicable = !customHabit || !customHabit.days || customHabit.days.length === 0 || customHabit.days.includes(dayOfWeek);

          if (isApplicable) {
            const isCompleted = record && (
              category === 'custom' 
                ? !!(record.custom && record.custom[habitId])
                : !!(record[category] as any)?.[habitId]
            );

            if (isCompleted) {
              streak++;
              date = date.subtract(1, 'days');
            } else {
              if (streak === 0 && dateStr === moment().format('YYYY-MM-DD')) {
                date = date.subtract(1, 'days');
                checkedDays++;
                continue;
              }
              break;
            }
          } else {
            date = date.subtract(1, 'days');
          }
          checkedDays++;
        }
        return streak;
      },

      getDailyScoreBreakdown: (date) => {
        const record = get().records[date] || defaultRecord;
        let totalAvailable = 0;
        let totalEarned = 0;

        let fardPoints = 0;
        let sunnahPoints = 0;
        let nawafilPoints = 0;

        // 1. الفرائض الخمس (7 نقاط لكل فريضة)
        const fardKeys: (keyof typeof HABIT_WEIGHTS.fard)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        fardKeys.forEach((key) => {
          const weight = HABIT_WEIGHTS.fard[key];
          totalAvailable += weight;
          if (record.prayers?.[key]) {
            fardPoints += weight;
            totalEarned += weight;
          }
        });

        // 2. السنن الرواتب للصلوات الخمس (2 نقطة لكل سنة)
        const sunnahKeys: (keyof typeof HABIT_WEIGHTS.sunnah)[] = ['fajrSunnah', 'dhuhrSunnah', 'asrSunnah', 'maghribSunnah', 'ishaSunnah'];
        sunnahKeys.forEach((key) => {
          const weight = HABIT_WEIGHTS.sunnah[key];
          totalAvailable += weight;
          if (record.prayers?.[key]) {
            sunnahPoints += weight;
            totalEarned += weight;
          }
        });

        // 3. صلوات النوافل وقيام الليل
        const nawafilKeys: (keyof typeof HABIT_WEIGHTS.nawafil)[] = ['witr', 'qiyam', 'duha', 'masjid', 'tasbih', 'hajah', 'tawbah', 'istikharah'];
        nawafilKeys.forEach((key) => {
          const weight = HABIT_WEIGHTS.nawafil[key];
          totalAvailable += weight;
          if (record.prayers?.[key]) {
            nawafilPoints += weight;
            totalEarned += weight;
          }
        });

        // 4. الورد القرآني وكمية الصفحات المقروءة (تصل حتى 15 نقطة)
        totalAvailable += HABIT_WEIGHTS.quranMax;
        const quranPages = record.quran?.pages || 0;
        const quranDone = !!record.quran?.completed;
        const quranPoints = calculateQuranScore(quranPages, quranDone);
        totalEarned += quranPoints;

        // 5. الأذكار اليومية
        let adhkarPoints = 0;
        const adhkarKeys: (keyof typeof HABIT_WEIGHTS.adhkar)[] = ['sabah', 'masaa', 'salah', 'istighfar', 'adia'];
        adhkarKeys.forEach((key) => {
          const weight = HABIT_WEIGHTS.adhkar[key];
          totalAvailable += weight;
          if (record.adhkar?.[key]) {
            adhkarPoints += weight;
            totalEarned += weight;
          }
        });

        // 6. الأخلاق والصدقات والوالدين
        let ethicsPoints = 0;
        const ethicsKeys: (keyof typeof HABIT_WEIGHTS.ethics)[] = ['parents', 'charity', 'visitFamily', 'visitSick'];
        ethicsKeys.forEach((key) => {
          const weight = HABIT_WEIGHTS.ethics[key];
          totalAvailable += weight;
          if (record.ethics?.[key]) {
            ethicsPoints += weight;
            totalEarned += weight;
          }
        });

        // 7. العبادات المخصصة المضافة (Custom Habits)
        let customPoints = 0;
        const customHabits = get().customHabits || [];
        const dayOfWeek = moment(date).day();
        customHabits.forEach((h) => {
          const isApplicable = !h.days || h.days.length === 0 || h.days.includes(dayOfWeek);
          if (isApplicable) {
            totalAvailable += HABIT_WEIGHTS.customHabit;
            if (record.custom && record.custom[h.id]) {
              customPoints += HABIT_WEIGHTS.customHabit;
              totalEarned += HABIT_WEIGHTS.customHabit;
            }
          }
        });

        const percentage = totalAvailable > 0
          ? Math.min(100, Math.round((totalEarned / totalAvailable) * 100))
          : 0;

        return {
          totalEarned,
          totalAvailable,
          percentage,
          fardPoints,
          sunnahPoints,
          nawafilPoints,
          quranPoints,
          adhkarPoints,
          ethicsPoints,
          customPoints
        };
      },

      getDailyProgress: (date) => {
        return get().getDailyScoreBreakdown(date).percentage;
      },

      getHeatmapData: () => {
        const data = [];
        const startOfMonth = moment().startOf('month');
        const daysInMonth = startOfMonth.daysInMonth();
        const todayStr = moment().format('YYYY-MM-DD');

        for (let i = 0; i < daysInMonth; i++) {
          const dateStr = startOfMonth.clone().add(i, 'days').format('YYYY-MM-DD');
          data.push({
            date: dateStr,
            progress: get().getDailyProgress(dateStr),
            isToday: dateStr === todayStr
          });
        }
        return data;
      }
    }),
    {
      name: 'habit-tracker-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          if (localStorage.getItem('quran_sync_migrated_v2') === 'true') return;
          const today = moment().format('YYYY-MM-DD');
          const legacyKey = `quran_pages_read_${today}`;
          const legacyRaw = localStorage.getItem(legacyKey);
          if (legacyRaw) {
            const legacyPages = JSON.parse(legacyRaw);
            const todayRecord = state.records?.[today];
            // إذا كان عدد صفحات اليوم مطابقاً للعداد التلقائي القديم الخاطئ الناتج عن التمرير السريع، يتم تصفيره لبدء احتساب دقيق
            if (
              Array.isArray(legacyPages) &&
              todayRecord?.quran &&
              todayRecord.quran.pages === legacyPages.length
            ) {
              state.setQuranPages(today, 0);
            }
            localStorage.removeItem(legacyKey);
          }
          localStorage.setItem('quran_sync_migrated_v2', 'true');
        } catch (e) {}
      },
    }
  )
);
