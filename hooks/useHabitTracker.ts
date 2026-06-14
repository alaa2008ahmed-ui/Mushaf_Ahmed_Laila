import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import moment from 'moment-hijri';

export type HabitCategory = 'prayers' | 'quran' | 'adhkar' | 'ethics';

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
  ethics: { parents: false, charity: false, visitFamily: false, visitSick: false }
};

interface HabitTrackerState {
  records: Record<string, DailyRecord>;
  toggleHabit: (date: string, category: HabitCategory, habitId: string) => void;
  setQuranPages: (date: string, pages: number) => void;
  getRecord: (date: string) => DailyRecord;
  getStreak: (category: HabitCategory, habitId: string) => number;
  getDailyProgress: (date: string) => number;
  getHeatmapData: () => { date: string; progress: number }[];
}

export const useHabitTracker = create<HabitTrackerState>()(
  persist(
    (set, get) => ({
      records: {},

      toggleHabit: (date, category, habitId) => {
        set((state) => {
          const currentRecord = state.records[date] || JSON.parse(JSON.stringify(defaultRecord));
          if (category === 'quran') {
            (currentRecord[category] as any)[habitId] = !(currentRecord[category] as any)[habitId];
          } else {
             (currentRecord[category] as any)[habitId] = !(currentRecord[category] as any)[habitId];
          }
          return { records: { ...state.records, [date]: currentRecord } };
        });
      },

      setQuranPages: (date, pages) => {
        set((state) => {
          const currentRecord = state.records[date] || JSON.parse(JSON.stringify(defaultRecord));
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
        
        // Start checking from today
        while (true) {
          const dateStr = date.format('YYYY-MM-DD');
          const record = records[dateStr];
          
          if (record && (record[category] as any)[habitId]) {
            streak++;
            date = date.subtract(1, 'days');
          } else {
            // If checking today and it's missing, try yesterday to not break the streak prematurely
            if (streak === 0 && date.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                date = date.subtract(1, 'days');
                const prevStr = date.format('YYYY-MM-DD');
                if (records[prevStr] && (records[prevStr][category] as any)[habitId]) {
                    // Continue loop with yesterday
                    continue;
                }
            }
            break;
          }
        }
        return streak;
      },

      getDailyProgress: (date) => {
        const record = get().records[date];
        if (!record) return 0;

        let total = 0;
        let completed = 0;

        // Prayers (12)
        Object.values(record.prayers).forEach(val => { total++; if (val) completed++; });
        // Quran (count completed boolean flag here)
        total++; if (record.quran.completed) completed++;
        // Adhkar (4)
        Object.values(record.adhkar).forEach(val => { total++; if (val) completed++; });
        // Ethics (4)
        Object.values(record.ethics).forEach(val => { total++; if (val) completed++; });

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
