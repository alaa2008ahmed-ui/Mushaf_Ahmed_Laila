import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import moment from 'moment-hijri';
import { BASE_ADHKAR_MORNING, BASE_ADHKAR_EVENING } from '../data/adkarSabahMasaaData';
import { PhoneNotificationSettings } from '../hooks/useNotificationSettings';

const ALL_ATHKAR = [...BASE_ADHKAR_MORNING, ...BASE_ADHKAR_EVENING];

const getRandomAthkar = () => {
    const randomIndex = Math.floor(Math.random() * ALL_ATHKAR.length);
    return ALL_ATHKAR[randomIndex];
};

export const setupNotifications = async (settings?: PhoneNotificationSettings) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Local notifications are not supported on the web platform.');
    return;
  }

  try {
    // Request permissions
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Default settings if not provided
    const defaultSettings: PhoneNotificationSettings = {
        sabah: { enabled: true, time: '07:00' },
        masaa: { enabled: true, time: '16:30' },
        dua: { enabled: true, time: '14:00' },
        tasbeehMorning: { enabled: true, time: '10:00' },
        tasbeehEvening: { enabled: true, time: '20:00' },
        kahf: { enabled: true, time: '09:00' },
        randomAthkar: { enabled: false, frequency: 5, startTime: '08:00', endTime: '22:00' },
    };
    
    let activeSettings: PhoneNotificationSettings = defaultSettings;
    
    if (settings) {
        activeSettings = settings;
    } else {
        const saved = localStorage.getItem('phone-notification-storage');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.state && parsed.state.phoneSettings) {
                    activeSettings = parsed.state.phoneSettings;
                }
            } catch(e) {
                console.error('Error parsing notification settings', e);
            }
        }
    }

    // Clear existing notifications to avoid duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notificationsToSchedule: any[] = [];

    // Helper to parse time string HH:mm
    const parseTime = (timeStr: string) => {
        const parts = timeStr.split(':').map(Number);
        return { hour: parts[0] || 0, minute: parts[1] || 0 };
    };

    // 1. Regular Notifications
    const regularConfigs = [
        { key: 'sabah', title: 'أذكار الصباح', page: 'sabah-masaa', id: 1 },
        { key: 'masaa', title: 'أذكار المساء', page: 'sabah-masaa', id: 2 },
        { key: 'dua', title: 'وقت الدعاء', page: 'adia', id: 3 },
        { key: 'tasbeehMorning', title: 'فضل التسبيح', page: 'tasbeeh', id: 4 },
        { key: 'tasbeehEvening', title: 'وقت التسبيح', page: 'tasbeeh', id: 5 },
    ];

    regularConfigs.forEach(conf => {
        const setting = activeSettings[conf.key as keyof PhoneNotificationSettings] as { enabled: boolean; time: string };
        if (setting && setting.enabled) {
            const { hour, minute } = parseTime(setting.time);
            notificationsToSchedule.push({
                title: conf.title,
                body: getRandomAthkar().text,
                id: conf.id,
                schedule: { on: { hour, minute }, allowWhileIdle: true, repeats: true },
                extra: { page: conf.page },
                smallIcon: 'ic_stat_name',
            });
        }
    });

    // 2. Surah Kahf (Weekly on Friday)
    if (activeSettings.kahf && activeSettings.kahf.enabled) {
      const { hour, minute } = parseTime(activeSettings.kahf.time);
      notificationsToSchedule.push({
        title: 'سورة الكهف',
        body: 'قال رسول الله ﷺ: "من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين".',
        id: 6,
        schedule: { on: { weekday: 6, hour, minute }, allowWhileIdle: true, repeats: true }, // Friday is 6
        extra: { page: 'quran', params: { surah: 18 } },
        smallIcon: 'ic_stat_name',
      });
    }

    // 3. Random Athkar
    if (activeSettings.randomAthkar && activeSettings.randomAthkar.enabled) {
        const { frequency, startTime, endTime } = activeSettings.randomAthkar;
        const start = parseTime(startTime);
        const end = parseTime(endTime);
        
        const startTotalMinutes = start.hour * 60 + start.minute;
        const endTotalMinutes = end.hour * 60 + end.minute;
        const duration = endTotalMinutes - startTotalMinutes;

        if (duration > 0) {
            for (let day = 0; day < 2; day++) {
                for (let i = 0; i < frequency; i++) {
                    const randomOffset = Math.floor(Math.random() * duration);
                    const totalMinutes = startTotalMinutes + randomOffset;
                    const hour = Math.floor(totalMinutes / 60);
                    const minute = totalMinutes % 60;

                    const scheduleDate = new Date();
                    scheduleDate.setDate(scheduleDate.getDate() + day);
                    scheduleDate.setHours(hour, minute, 0, 0);

                    if (scheduleDate > new Date()) {
                        const athkar = getRandomAthkar();
                        notificationsToSchedule.push({
                            title: 'ذكر الله',
                            body: athkar.text,
                            id: 100 + day * 50 + i, // Offset IDs to avoid collision
                            schedule: { at: scheduleDate, allowWhileIdle: true },
                            extra: { page: 'sabah-masaa' },
                            smallIcon: 'ic_stat_name',
                        });
                    }
                }
            }
        }
    }

    // Specials
    try {
      const currentHijriYear = moment().iYear();
      const currentHijriMonth = moment().iMonth();
      let targetYear = currentHijriYear;
      if (currentHijriMonth >= 8) targetYear += 1;
      let ramadan1 = moment(`${targetYear}/9/1`, 'iYYYY/iM/iD');
      let dayBeforeRamadan = ramadan1.clone().subtract(1, 'days');
      dayBeforeRamadan.hour(10).minute(0).second(0).millisecond(0);
      if (dayBeforeRamadan.isBefore(moment())) {
        targetYear += 1;
        ramadan1 = moment(`${targetYear}/9/1`, 'iYYYY/iM/iD');
        dayBeforeRamadan = ramadan1.clone().subtract(1, 'days');
        dayBeforeRamadan.hour(10).minute(0).second(0).millisecond(0);
      }
      notificationsToSchedule.push({
        title: 'استعد لرمضان!',
        body: 'غداً أول أيام شهر رمضان المبارك. قم بتجهيز الورد الشهري الخاص بك الآن.',
        id: 50,
        schedule: { at: dayBeforeRamadan.toDate(), allowWhileIdle: true },
        extra: { page: 'daily-wird' },
        smallIcon: 'ic_stat_name',
      });
    } catch (e) {}

    try {
      const currentHijriYear = moment().iYear();
      const currentHijriMonth = moment().iMonth();
      const currentHijriDay = moment().iDate();
      let targetYear = currentHijriYear;
      if (currentHijriMonth > 2 || (currentHijriMonth === 2 && currentHijriDay >= 12)) targetYear += 1;
      const mawlidDate = moment(`${targetYear}/3/12`, 'iYYYY/iM/iD');
      mawlidDate.hour(8).minute(0).second(0).millisecond(0);
      notificationsToSchedule.push({
        title: 'مولد الهدى ﷺ',
        body: 'وُلِدَ الهُدى فَالكائِناتُ ضِياءُ.. نبارك لكم ذكرى مولد خير الأنام محمد ﷺ.',
        id: 51,
        schedule: { at: mawlidDate.toDate(), allowWhileIdle: true },
        extra: { page: 'home' },
        smallIcon: 'ic_stat_name',
      });
    } catch (e) {}

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};
