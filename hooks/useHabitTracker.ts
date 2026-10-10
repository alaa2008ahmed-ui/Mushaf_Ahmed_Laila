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
  adhkar: { sabah: false, masaa: false, istighfar: false, adia: false },
  ethics: { parents: false, charity: false, visitFamily: false, visitSick: false },
  custom: {}
};

interface HabitTrackerState {
  records: Record<string, DailyRecord>;
  customHabits: CustomHabit[];
  addCustomHabit: (habit: { title: string; icon?: string; description?: string; days?: number[] }) => void;
  removeCustomHabit: (id: string) => void;
  toggleHabit: (date: string, category: HabitCategory, habitId: string) => void;
  setQuranPages: (date: string, pages: number) => void;
  getRecord: (date: string) => DailyRecord;
  getStreak: (category: HabitCategory, habitId: string) => number;
  getDailyProgress: (date: string) => number;
  getHeatmapData: () => { date: string; progress: number; isToday?: boolean }[];
}

export const useHabitTracker = create<HabitTrackerState>()(
  persist(
    (set, get) => ({
      records: {},
      customHabits: [],

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

      setQuranPages: (date, pages) => {
        set((state) => {
          const currentRecord: DailyRecord = state.records[date] 
            ? JSON.parse(JSON.stringify(state.records[date])) 
            : JSON.parse(JSON.stringify(defaultRecord));
          if (!currentRecord.quran) currentRecord.quran = { ...defaultRecord.quran };
          currentRecord.quran.pages = pages;
          return { records: { ...state.records, [date]: currentRecord } };
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

      getDailyProgress: (date) => {
        const record = get().records[date];
        if (!record) return 0;

        let total = 0;
        let completed = 0;

        // Prayers
        if (record.prayers) {
          Object.values(record.prayers).forEach(val => { total++; if (val) completed++; });
        }
        // Quran
        total++; 
        if (record.quran?.completed) completed++;
        // Adhkar
        if (record.adhkar) {
          Object.values(record.adhkar).forEach(val => { total++; if (val) completed++; });
        }
        // Ethics
        if (record.ethics) {
          Object.values(record.ethics).forEach(val => { total++; if (val) completed++; });
        }
        // Custom habits applicable on this day
        const customHabits = get().customHabits || [];
        const dayOfWeek = moment(date).day();
        customHabits.forEach(h => {
          const isApplicable = !h.days || h.days.length === 0 || h.days.includes(dayOfWeek);
          if (isApplicable) {
            total++;
            if (record.custom && record.custom[h.id]) {
              completed++;
            }
          }
        });

        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
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
    }
  )
);
