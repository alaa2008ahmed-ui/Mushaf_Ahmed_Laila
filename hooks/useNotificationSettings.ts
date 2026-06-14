import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PhoneNotificationSettings {
    sabah: { enabled: boolean; time: string };
    masaa: { enabled: boolean; time: string };
    dua: { enabled: boolean; time: string };
    tasbeehMorning: { enabled: boolean; time: string };
    tasbeehEvening: { enabled: boolean; time: string };
    kahf: { enabled: boolean; time: string };
    randomAthkar: {
        enabled: boolean;
        frequency: number; // times per day
        startTime: string;
        endTime: string;
    };
}

interface NotificationSettingsState {
    phoneSettings: PhoneNotificationSettings;
    updatePhoneSettings: (settings: Partial<PhoneNotificationSettings>) => void;
    updateSpecificSetting: (key: keyof Omit<PhoneNotificationSettings, 'randomAthkar'>, value: Partial<{ enabled: boolean; time: string }>) => void;
    updateRandomSettings: (value: Partial<PhoneNotificationSettings['randomAthkar']>) => void;
}

const defaultPhoneSettings: PhoneNotificationSettings = {
    sabah: { enabled: true, time: '07:00' },
    masaa: { enabled: true, time: '16:30' },
    dua: { enabled: true, time: '14:00' },
    tasbeehMorning: { enabled: true, time: '10:00' },
    tasbeehEvening: { enabled: true, time: '20:00' },
    kahf: { enabled: true, time: '09:00' },
    randomAthkar: {
        enabled: false,
        frequency: 5,
        startTime: '08:00',
        endTime: '22:00',
    },
};

export const useNotificationSettings = create<NotificationSettingsState>()(
    persist(
        (set) => ({
            phoneSettings: defaultPhoneSettings,
            updatePhoneSettings: (settings) => set((state) => ({
                phoneSettings: { ...state.phoneSettings, ...settings }
            })),
            updateSpecificSetting: (key, value) => set((state) => ({
                phoneSettings: {
                    ...state.phoneSettings,
                    [key]: { ...state.phoneSettings[key], ...value }
                }
            })),
            updateRandomSettings: (value) => set((state) => ({
                phoneSettings: {
                    ...state.phoneSettings,
                    randomAthkar: { ...state.phoneSettings.randomAthkar, ...value }
                }
            })),
        }),
        {
            name: 'phone-notification-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
