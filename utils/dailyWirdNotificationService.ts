import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { playNotificationSound, getActiveNotificationSoundFileName, getActiveNotificationSoundPath } from './prayerTimesUtils';
import { updateNativeAlertsGroupSummary } from './silentMode';

// Plugin interface for native bridge
interface AutoSilentPluginInterface {
  syncDailyWird: () => Promise<void>;
  checkDndPermission?: () => Promise<{ granted: boolean }>;
  requestDndPermission?: () => Promise<void>;
}
const AutoSilentMode = registerPlugin<AutoSilentPluginInterface>('AutoSilentMode');

export interface WirdProfile {
  id: string;
  name: string;
  mode: 'days' | 'pages';
  value: number;
  startDate: string;
  currentDay: number;
  completedDays: number[];
  isActive: boolean;
  startPage?: number;
  lastPage?: number;
  lastAyah?: { s: number; a: number };
  reminderEnabled?: boolean;
  reminderTime?: string; // HH:mm format, e.g. "10:00"
  lastCompletedDate?: string; // YYYY-MM-DD or ISO
}

export interface WirdAlertData {
  profileId: string;
  profileName: string;
  currentDay: number;
  totalDays: number;
  startPage: number;
  endPage: number;
  missedDaysCount: number;
  title: string;
  message: string;
  soundFileName?: string;
}

const TOTAL_QURAN_PAGES = 604;
export const WIRD_CHANNEL_ID = 'daily_wird_reminders_channel';
export const WIRD_GROUP_ID = 'com.mushaf.ahmedandlayla.GENERAL_ALERTS_CARD';

// Notification IDs:
// 9300: Test notification
// 9301: Daily morning recurring fallback (10:00 AM)
// 9302: Daily evening recurring fallback (10:00 PM)
// 9310 - 9324: Exact upcoming morning notifications (days 0..14)
// 9330 - 9344: Exact upcoming evening notifications (days 0..14)
const TEST_NOTIFICATION_ID = 9300;
const RECURRING_MORNING_ID = 9301;
const RECURRING_EVENING_ID = 9302;
const BASE_MORNING_EXACT_ID = 9310;
const BASE_EVENING_EXACT_ID = 9330;

// Exact canonical page boundaries for all 30 Juz of the Holy Qur'an (Madinah Mushaf - 604 pages)
// Juz 1 starts at page 1 and ends at page 21 (Al-Baqarah 141).
// Juz 2 to 29 are exactly 20 pages each.
// Juz 30 is 23 pages (582 to 604).
export const JUZ_PAGE_BOUNDARIES: { start: number; end: number }[] = [
  { start: 1, end: 21 },    // Juz 1
  { start: 22, end: 41 },   // Juz 2
  { start: 42, end: 61 },   // Juz 3
  { start: 62, end: 81 },   // Juz 4
  { start: 82, end: 101 },  // Juz 5
  { start: 102, end: 121 }, // Juz 6
  { start: 122, end: 141 }, // Juz 7
  { start: 142, end: 161 }, // Juz 8
  { start: 162, end: 181 }, // Juz 9
  { start: 182, end: 201 }, // Juz 10
  { start: 202, end: 221 }, // Juz 11
  { start: 222, end: 241 }, // Juz 12
  { start: 242, end: 261 }, // Juz 13
  { start: 262, end: 281 }, // Juz 14
  { start: 282, end: 301 }, // Juz 15
  { start: 302, end: 321 }, // Juz 16
  { start: 322, end: 341 }, // Juz 17
  { start: 342, end: 361 }, // Juz 18
  { start: 362, end: 381 }, // Juz 19
  { start: 382, end: 401 }, // Juz 20
  { start: 402, end: 421 }, // Juz 21
  { start: 422, end: 441 }, // Juz 22
  { start: 442, end: 461 }, // Juz 23
  { start: 462, end: 481 }, // Juz 24
  { start: 482, end: 501 }, // Juz 25
  { start: 502, end: 521 }, // Juz 26
  { start: 522, end: 541 }, // Juz 27
  { start: 542, end: 561 }, // Juz 28
  { start: 562, end: 581 }, // Juz 29
  { start: 582, end: 604 }, // Juz 30
];

/**
 * Calculates start and end page for a given day in the Khatma
 * Accurately aligns with canonical Qur'anic Juz boundaries (e.g. Day 1: 1-21, Day 2: 22-41)
 */
export const getWirdDayRange = (
  day: number,
  profile: { mode: 'days' | 'pages'; value: number; startPage?: number }
) => {
  const startPage = profile.startPage || 1;
  const safeDay = Math.max(1, day);

  // 1. Standard 30-Day Khatma (1 Juz per day) starting from page 1:
  // Use canonical Madinah Mushaf Juz boundaries (Juz 1: 1-21, Juz 2: 22-41, etc.)
  if (profile.mode === 'days' && profile.value === 30 && startPage === 1) {
    const idx = Math.min(Math.max(0, safeDay - 1), 29);
    return JUZ_PAGE_BOUNDARIES[idx];
  }

  // 2. Standard 60-Day Khatma (Half Juz / 1 Hizb per day) starting from page 1:
  if (profile.mode === 'days' && profile.value === 60 && startPage === 1) {
    const juzIndex = Math.min(Math.floor((safeDay - 1) / 2), 29);
    const isSecondHalf = (safeDay - 1) % 2 === 1;
    const juz = JUZ_PAGE_BOUNDARIES[juzIndex];
    const midPage = Math.floor((juz.start + juz.end) / 2);
    if (!isSecondHalf) {
      return { start: juz.start, end: midPage };
    } else {
      return { start: midPage + 1, end: juz.end };
    }
  }

  // 3. Arbitrary Days Mode:
  if (profile.mode === 'days') {
    const totalDays = Math.max(1, profile.value);
    const pagesLeft = TOTAL_QURAN_PAGES - startPage + 1;
    const offset = startPage - 1;

    // Continuous contiguous distribution without gaps
    const start = Math.floor(((safeDay - 1) * pagesLeft) / totalDays) + 1 + offset;
    let end = Math.floor((safeDay * pagesLeft) / totalDays) + offset;
    if (safeDay >= totalDays) {
      end = TOTAL_QURAN_PAGES;
    }
    return {
      start: Math.min(start, TOTAL_QURAN_PAGES),
      end: Math.min(Math.max(start, end), TOTAL_QURAN_PAGES)
    };
  }

  // 4. Pages Mode:
  const pagesPerDay = Math.max(1, profile.value);
  const offset = startPage - 1;
  const start = (safeDay - 1) * pagesPerDay + 1 + offset;
  const end = Math.min(start + pagesPerDay - 1, TOTAL_QURAN_PAGES);
  return {
    start: Math.min(start, TOTAL_QURAN_PAGES),
    end: Math.min(Math.max(start, end), TOTAL_QURAN_PAGES)
  };
};

/**
 * Returns total days of Khatma
 */
export const getWirdTotalDays = (profile: WirdProfile): number => {
  return profile.mode === 'days' ? profile.value : Math.ceil(TOTAL_QURAN_PAGES / profile.value);
};

/**
 * Reads the active wird profile from localStorage
 */
export const getActiveWirdProfile = (): WirdProfile | null => {
  try {
    const saved = localStorage.getItem('dailyWirdSettings_v2');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const profiles: WirdProfile[] = parsed.profiles || [];
    const activeId = parsed.activeId || (profiles.length > 0 ? profiles[0].id : null);
    if (!activeId) return null;
    const profile = profiles.find(p => p.id === activeId);
    return profile || null;
  } catch (e) {
    console.error('Error getting active wird profile:', e);
    return null;
  }
};

/**
 * Helper to get current app language from localStorage
 */
export const getCurrentAppLanguage = (): 'ar' | 'en' => {
  try {
    const lang = localStorage.getItem('app_language');
    if (lang === 'en') return 'en';
  } catch (e) {}
  return 'ar';
};

/**
 * Formats user's display name politely for notifications ("وباسم المستخدم")
 */
export const formatWirdUserName = (rawName?: string, lang: 'ar' | 'en' = 'ar'): string => {
  if (!rawName || !rawName.trim()) {
    return lang === 'en' ? "Qur'an Reader" : 'صاحب القرآن';
  }
  const clean = rawName.trim();
  if (/^مستخدم(\s*\d+)?$/i.test(clean) || /^user(\s*\d+)?$/i.test(clean)) {
    return lang === 'en' ? "Qur'an Reader" : 'صاحب القرآن';
  }
  return clean;
};

/**
 * Calculates missed days and current wird status relative to a specific reference date
 */
export const calculateWirdStatus = (profile: WirdProfile, targetDate = new Date()) => {
  const totalDays = getWirdTotalDays(profile);
  const completedCount = profile.completedDays?.length || 0;
  const isKhatmaFinished = completedCount >= totalDays;

  // Normalize dates to midnight local time
  const start = new Date(profile.startDate);
  start.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = Math.max(0, target.getTime() - start.getTime());
  const calendarDaysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Expected days that should have been finished before target date
  const expectedPastDays = Math.min(calendarDaysElapsed, totalDays);
  const missedDaysCount = Math.max(0, expectedPastDays - completedCount);

  // Target day in progression
  const targetDayNumber = Math.min(completedCount + 1, totalDays);
  
  // Check if today was already completed
  const targetDateStr = targetDate.toISOString().split('T')[0];
  const targetDayRange = getWirdDayRange(targetDayNumber, profile);
  const lastPageRead = profile.lastPage || 0;
  const isTodayPagesFinished = lastPageRead >= targetDayRange.end && targetDayRange.end > 0;
  const isPartiallyReadToday = lastPageRead >= targetDayRange.start && lastPageRead < targetDayRange.end;
  const remainingPagesToday = Math.max(0, targetDayRange.end - Math.max(lastPageRead, targetDayRange.start - 1));

  const isTodayDayCompleted = Boolean(
    profile.lastCompletedDate && profile.lastCompletedDate.startsWith(targetDateStr)
  ) || isTodayPagesFinished;

  return {
    totalDays,
    completedCount,
    calendarDaysElapsed,
    missedDaysCount,
    targetDayNumber,
    isTodayDayCompleted,
    isPartiallyReadToday,
    remainingPagesToday,
    lastPageRead,
    isKhatmaFinished
  };
};

/**
 * Builds respectful, inspiring Arabic or English notification texts addressing the user by name
 * Supports morning (10:00 AM) and evening (10:00 PM / 22:00) reminders with delayed catch-up.
 */
export const buildWirdNotificationContent = (
  profile: WirdProfile,
  dayNumber: number,
  missedCount: number,
  isEvening: boolean = false,
  lang: 'ar' | 'en' = getCurrentAppLanguage()
) => {
  const isEn = lang === 'en';
  const userName = formatWirdUserName(profile.name, lang);

  // Compute date range for missed days >= 2 (e.g., from Nov 1 to Nov 7 / من يوم 1 نوفمبر إلى 7 نوفمبر)
  let missedRangeStr = '';
  if (missedCount >= 2) {
    try {
      const today = new Date();
      const endD = new Date(today);
      endD.setDate(today.getDate() - 1); // yesterday
      const startD = new Date(today);
      startD.setDate(today.getDate() - missedCount);

      const arMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      const enMonths = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      if (isEn) {
        missedRangeStr = `from ${enMonths[startD.getMonth()]} ${startD.getDate()} to ${enMonths[endD.getMonth()]} ${endD.getDate()}`;
      } else {
        missedRangeStr = `من يوم ${startD.getDate()} ${arMonths[startD.getMonth()]} إلى ${endD.getDate()} ${arMonths[endD.getMonth()]}`;
      }
    } catch (e) {}
  }

  if (isEn) {
    const prefix = `Dear ${userName}: `;
    if (isEvening) {
      if (missedCount === 0) {
        return {
          title: `${prefix}Complete Today's Portion Before Sleep`,
          body: `The day is coming to a close and today's assigned portion awaits you.. Conclude your day with the Holy Qur'an before sleep.`
        };
      } else if (missedCount === 1) {
        return {
          title: `${prefix}Catch Up Before Day's End`,
          body: `Evening reminder: Yesterday's portion and today's portion await you.. Make the seal of your night verses from the Holy Qur'an.`
        };
      } else {
        const rangeText = missedRangeStr ? ` (${missedRangeStr})` : '';
        return {
          title: `${prefix}Blessed Opportunity Tonight`,
          body: `Do not let today's portion and your overdue portions${rangeText} pass unread.. Spend a few tranquil minutes catching up tonight.`
        };
      }
    } else {
      // Morning (10:00 AM)
      if (missedCount === 0) {
        return {
          title: `${prefix}Illuminate Your Day with the Qur'an`,
          body: `Gentle reminder for today's portion.. Blessed is the one who begins the day with the Qur'an. Open your Mushaf and read now.`
        };
      } else if (missedCount === 1) {
        return {
          title: `${prefix}Gentle Reminder of the Holy Qur'an`,
          body: `Gentle reminder: Yesterday's portion and today's portion await you.. Read them together to maintain your blessed Khatma.`
        };
      } else {
        const rangeText = missedRangeStr ? ` (${missedRangeStr})` : '';
        return {
          title: `${prefix}Eager for Your Return to the Qur'an`,
          body: `Today's portion and your overdue portions${rangeText} await you.. Open your Mushaf now and catch up on your blessed Khatma.`
        };
      }
    }
  }

  // Arabic
  const prefix = `يا ${userName}: `;
  if (isEvening) {
    if (missedCount === 0) {
      return {
        title: `${prefix}أكمل ورد اليوم قبل النوم`,
        body: `أوشك اليوم على الانقضاء وتذكيرك بورد اليوم.. اختم يومك بنور كتاب الله واقرأ وردك قبل النوم لتنعم بليل مبارك.`
      };
    } else if (missedCount === 1) {
      return {
        title: `${prefix}تدارك وردك قبل نهاية اليوم`,
        body: `تذكير مسائي: تدارك ورد الأمس وورد اليوم.. اجعل مسك ختام ليلتك آيات من الذكر الحكيم واقرأهما الآن.`
      };
    } else {
      const rangeText = missedRangeStr ? ` (${missedRangeStr})` : '';
      return {
        title: `${prefix}فرصة طيبة لاستدراك وردك الليلة`,
        body: `أوشك اليوم على الانتهاء، ولديك ورد اليوم والأوراد السابقة غير المقروءة${rangeText}.. بضع دقائق كفيلة باستدراك ما فاتك، افتح مصحفك الآن.`
      };
    }
  } else {
    // Morning (10:00 AM)
    if (missedCount === 0) {
      return {
        title: `${prefix}نور يومك بكتاب الله`,
        body: `تذكير بورد اليوم.. هنيئاً لمن جعل للقرآن نصيباً من يومه، افتح مصحفك واقرأ وردك الآن.`
      };
    } else if (missedCount === 1) {
      return {
        title: `${prefix}تذكير طيب بورد القرآن الكريم`,
        body: `تذكير لطيف: تدارك ورد الأمس وورد اليوم.. اقرأهما معاً لتستمر في مسيرة ختمتك المباركة وتفيض عليك البركة.`
      };
    } else {
      const rangeText = missedRangeStr ? ` (${missedRangeStr})` : '';
      return {
        title: `${prefix}مشتاقون لعودتك إلى كتاب الله`,
        body: `في انتظارك ورد اليوم والأوراد السابقة غير المقروءة${rangeText}.. لا تدع الأيام تمضي دون نور القرآن، افتح مصحفك واستدرك ما فاتك.`
      };
    }
  }
};

/**
 * Initializes the dedicated Android notification channels
 */
export const ensureWirdNotificationChannel = async (lang: 'ar' | 'en' = getCurrentAppLanguage()) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const isEn = lang === 'en';
    const notifSoundFile = getActiveNotificationSoundFileName();
    const soundForCapacitor = notifSoundFile && notifSoundFile !== 'none' ? notifSoundFile : undefined;
    const channelConfig = {
      name: isEn ? 'Daily Wird & Khatma Reminders' : 'تنبيهات الورد اليومي والختمات',
      description: isEn 
        ? "Reminders for daily Qur'an reading and Khatma progress"
        : 'قناة تنبيهات الورد القرآني والتذكير بالقراءة اليومية بنغمة هادئة واهتزاز',
      importance: 5 as any, // High importance (shows heads-up notification and status bar icon)
      sound: soundForCapacitor,
      vibration: true,
      visibility: 1
    };
    await LocalNotifications.createChannel({
      id: WIRD_CHANNEL_ID,
      ...channelConfig
    } as any);
    await LocalNotifications.createChannel({
      id: 'daily_wird_reminder_channel',
      ...channelConfig
    } as any);
  } catch (e) {
    console.warn('Error creating wird notification channel:', e);
  }
};

/**
 * Synchronizes and schedules daily notifications for the active Khatma
 * - Immediately requests permissions if not granted
 * - Stores state in Preferences for native Android background alarms
 * - Schedules morning (10:00 AM) and evening (10:00 PM / 22:00) reminders
 * - Automatically addresses user by name
 * - Handles missed days catch-up dynamically
 */
export const syncDailyWirdNotifications = async (langOverride?: 'ar' | 'en') => {
  // Sync to native SharedPreferences (CapacitorStorage) so background Android receivers can access it
  try {
    const saved = localStorage.getItem('dailyWirdSettings_v2');
    if (saved) {
      await Preferences.set({ key: 'dailyWirdSettings_v2', value: saved });
    }
  } catch (e) {
    console.warn('Error mirroring daily wird settings to Preferences:', e);
  }

  if (!Capacitor.isNativePlatform()) {
    console.log('[DailyWird] Platform is not native, skip local notification scheduling.');
    return;
  }

  const lang = langOverride || getCurrentAppLanguage();
  try {
    // 1. Explicitly request notification permissions (ensures Android 13+ prompt appears)
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== 'granted') {
      console.log('[DailyWird] Notification permission not granted yet by user.');
      return;
    }

    const profile = getActiveWirdProfile();

    // 2. Clear previously scheduled wird notifications (IDs 9300 to 9399) that are not currently delivered
    const pending = await LocalNotifications.getPending();
    const delivered = await LocalNotifications.getDeliveredNotifications();
    const deliveredIds = new Set((delivered?.notifications || []).map(n => n.id));
    const wirdPending = (pending?.notifications || []).filter(
      n => n.id >= 9300 && n.id <= 9399 && !deliveredIds.has(n.id)
    );
    if (wirdPending.length > 0) {
      await LocalNotifications.cancel({ notifications: wirdPending });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isTodayAlreadyCompleted = Boolean(
      profile && profile.lastCompletedDate && profile.lastCompletedDate.startsWith(todayStr)
    );

    // If today is completed, remove any delivered notifications from drawer immediately
    if (isTodayAlreadyCompleted) {
      try {
        const wirdDelivered = (delivered?.notifications || []).filter(
          n => n.id >= 9300 && n.id <= 9399
        );
        if (wirdDelivered.length > 0) {
          await LocalNotifications.removeDeliveredNotifications({
            notifications: wirdDelivered
          });
        }
      } catch (e) {}
    }

    // Also trigger native alarm synchronization
    try {
      if (AutoSilentMode && typeof AutoSilentMode.syncDailyWird === 'function') {
        await AutoSilentMode.syncDailyWird();
      }
    } catch (e) {}

    // On native Android, native DailyWirdAlarmReceiver handles exact AlarmManager reminders (morning and evening)
    // with live state and completion verification. We avoid scheduling duplicate LocalNotifications on Android!
    if (Capacitor.isNativePlatform()) {
      console.log('[DailyWird] Native AlarmManager handles wird alarms via DailyWirdAlarmReceiver.');
      await updateNativeAlertsGroupSummary();
      return;
    }

    if (!profile || !profile.isActive || profile.reminderEnabled === false) {
      console.log('[DailyWird] No active wird or reminder is disabled.');
      return;
    }

    const totalDays = getWirdTotalDays(profile);
    if (profile.completedDays.length >= totalDays) {
      console.log('[DailyWird] Khatma already completed. No reminder needed.');
      return;
    }

    await ensureWirdNotificationChannel(lang);

    const notificationsToSchedule: any[] = [];

    // 3. Baseline Daily Repeating Notifications via AlarmManager:
    // Morning (10:00 AM) and Evening (10:00 PM / 22:00)
    const baselineDayNumber = Math.min(profile.completedDays.length + 1, totalDays);
    const morningBaseContent = buildWirdNotificationContent(profile, baselineDayNumber, 0, false, lang);
    const eveningBaseContent = buildWirdNotificationContent(profile, baselineDayNumber, 0, true, lang);
    const wirdSoundFile = getActiveNotificationSoundFileName();
    const wirdSoundPath = getActiveNotificationSoundPath();
    const wirdCapacitorSound = wirdSoundFile && wirdSoundFile !== 'none' ? wirdSoundFile : undefined;
    const hasWirdSound = wirdCapacitorSound !== undefined;

    notificationsToSchedule.push({
      id: RECURRING_MORNING_ID,
      title: morningBaseContent.title,
      body: morningBaseContent.body,
      schedule: { on: { hour: 10, minute: 0 }, allowWhileIdle: true, repeats: true },
      channelId: WIRD_CHANNEL_ID,
      sound: wirdCapacitorSound,
      extra: {
        page: 'daily-wird',
        type: 'daily-wird',
        period: 'morning',
        profileId: profile.id,
        playSound: hasWirdSound,
        soundFile: wirdSoundPath
      },
      smallIcon: 'ic_stat_name',
      iconColor: '#2E7D5E',
      group: WIRD_GROUP_ID,
      groupSummary: false,
      ongoing: false,
      autoCancel: true
    });

    notificationsToSchedule.push({
      id: RECURRING_EVENING_ID,
      title: eveningBaseContent.title,
      body: eveningBaseContent.body,
      schedule: { on: { hour: 22, minute: 0 }, allowWhileIdle: true, repeats: true },
      channelId: WIRD_CHANNEL_ID,
      sound: wirdCapacitorSound,
      extra: {
        page: 'daily-wird',
        type: 'daily-wird',
        period: 'evening',
        profileId: profile.id,
        playSound: hasWirdSound,
        soundFile: wirdSoundPath
      },
      smallIcon: 'ic_stat_name',
      iconColor: '#2E7D5E',
      group: WIRD_GROUP_ID,
      groupSummary: false,
      ongoing: false,
      autoCancel: true
    });

    // 4. Exact Lookahead Schedule for Day 0 (today) and the next 14 calendar days
    for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
      // Calculate calendar target date
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + dayOffset);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Missed count calculation assuming no additional reading in between:
      // If dayOffset == 0 (today):
      //   missed = 0 if on track, or past missed days
      // If dayOffset >= 1 (future):
      //   if today is completed: dayOffset - 1 missed days
      //   if today is not completed: dayOffset missed days
      let missedOnTargetDate: number;
      if (dayOffset === 0) {
        const start = new Date(profile.startDate);
        start.setHours(0, 0, 0, 0);
        const diffTime = Math.max(0, targetDate.getTime() - start.getTime());
        const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        missedOnTargetDate = Math.max(0, daysElapsed - profile.completedDays.length);
      } else {
        missedOnTargetDate = (isTodayAlreadyCompleted ? 0 : 1) + (dayOffset - 1);
      }

      const targetDayNumber = Math.min(profile.completedDays.length + 1, totalDays);

      // Morning Schedule (10:00 AM)
      const morningTarget = new Date(targetDate);
      morningTarget.setHours(10, 0, 0, 0);

      // If today and already completed today, skip morning reminder for today
      const shouldScheduleMorning = (dayOffset > 0 || !isTodayAlreadyCompleted) && (morningTarget.getTime() > now.getTime());
      if (shouldScheduleMorning) {
        const morningContent = buildWirdNotificationContent(profile, targetDayNumber, missedOnTargetDate, false, lang);
        notificationsToSchedule.push({
          id: BASE_MORNING_EXACT_ID + dayOffset,
          title: morningContent.title,
          body: morningContent.body,
          schedule: { at: morningTarget, allowWhileIdle: true },
          channelId: WIRD_CHANNEL_ID,
          sound: wirdCapacitorSound,
          extra: {
            page: 'daily-wird',
            type: 'daily-wird',
            period: 'morning',
            profileId: profile.id,
            profileName: profile.name,
            dayNumber: targetDayNumber,
            missedCount: missedOnTargetDate,
            playSound: hasWirdSound,
            soundFile: wirdSoundPath
          },
          smallIcon: 'ic_stat_name',
          iconColor: '#2E7D5E',
          group: WIRD_GROUP_ID,
          groupSummary: false,
          ongoing: false,
          autoCancel: true
        });
      }

      // Evening Schedule (10:00 PM / 22:00)
      const eveningTarget = new Date(targetDate);
      eveningTarget.setHours(22, 0, 0, 0);

      const shouldScheduleEvening = (dayOffset > 0 || !isTodayAlreadyCompleted) && (eveningTarget.getTime() > now.getTime());
      if (shouldScheduleEvening) {
        const eveningContent = buildWirdNotificationContent(profile, targetDayNumber, missedOnTargetDate, true, lang);
        notificationsToSchedule.push({
          id: BASE_EVENING_EXACT_ID + dayOffset,
          title: eveningContent.title,
          body: eveningContent.body,
          schedule: { at: eveningTarget, allowWhileIdle: true },
          channelId: WIRD_CHANNEL_ID,
          sound: wirdCapacitorSound,
          extra: {
            page: 'daily-wird',
            type: 'daily-wird',
            period: 'evening',
            profileId: profile.id,
            profileName: profile.name,
            dayNumber: targetDayNumber,
            missedCount: missedOnTargetDate,
            playSound: hasWirdSound,
            soundFile: wirdSoundPath
          },
          smallIcon: 'ic_stat_name',
          iconColor: '#2E7D5E',
          group: WIRD_GROUP_ID,
          groupSummary: false,
          ongoing: false,
          autoCancel: true
        });
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      console.log(`[DailyWird] Successfully scheduled ${notificationsToSchedule.length} phone notifications in (${lang}) with chime sound and custom icon.`);
      await updateNativeAlertsGroupSummary();
    }
  } catch (error) {
    console.error('[DailyWird] Error synchronizing notifications:', error);
  }
};

/**
 * Triggers an immediate test notification with chime sound and custom icon for the user to verify
 */
export const triggerTestWirdNotification = async (langOverride?: 'ar' | 'en') => {
  const lang = langOverride || getCurrentAppLanguage();
  const isEn = lang === 'en';
  const profile = getActiveWirdProfile();
  const dayNumber = profile ? profile.currentDay : 1;
  const userName = profile ? formatWirdUserName(profile.name, lang) : (isEn ? 'Ahmed' : 'أحمد');
  
  const content = profile 
    ? buildWirdNotificationContent(profile, dayNumber, 0, false, lang)
    : (isEn ? {
        title: `Dear ${userName}: Daily Wird Phone Alert`,
        body: `Gentle reminder for today's portion.. Blessed is the one who dedicates time to the Holy Qur'an.`
      } : {
        title: `يا ${userName}: نور يومك بكتاب الله`,
        body: `تذكير بورد اليوم.. هنيئاً لمن جعل للقرآن نصيباً من يومه، افتح مصحفك واقرأ وردك الآن.`
      });

  // Play chosen notification sound
  const testSound = getActiveNotificationSoundPath();
  if (testSound && testSound !== 'none') {
    playNotificationSound(testSound, true);
  }

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureWirdNotificationChannel(lang);
      const testSoundFile = getActiveNotificationSoundFileName();
      const testSoundForCap = testSoundFile && testSoundFile !== 'none' ? testSoundFile : undefined;
      await LocalNotifications.schedule({
        notifications: [
          {
            id: TEST_NOTIFICATION_ID,
            title: content.title,
            body: content.body,
            schedule: { at: new Date(Date.now() + 500), allowWhileIdle: true },
            channelId: WIRD_CHANNEL_ID,
            sound: testSoundForCap,
            extra: {
              page: 'daily-wird',
              type: 'daily-wird',
              profileId: profile?.id || 'demo',
              dayNumber,
              missedCount: 0,
              playSound: testSoundForCap !== undefined,
              soundFile: testSound
            },
            smallIcon: 'ic_stat_name',
            iconColor: '#2E7D5E',
            group: WIRD_GROUP_ID,
            groupSummary: false,
            ongoing: false,
            autoCancel: true
          }
        ]
      });
    } catch (e) {
      console.warn('Error sending test wird notification:', e);
    }
  }
};

/**
 * Checks if the user has an uncompleted wird on web/browser only
 */
export const checkWirdAlertOnAppResume = (): WirdAlertData | null => {
  if (Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const profile = getActiveWirdProfile();
    if (!profile || !profile.isActive || profile.reminderEnabled === false) {
      return null;
    }

    const totalDays = getWirdTotalDays(profile);
    if (profile.completedDays.length >= totalDays) {
      return null;
    }

    const status = calculateWirdStatus(profile);
    if (status.isTodayDayCompleted) {
      return null;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const lastAlertKey = `wird_alert_shown_date_${profile.id}`;
    const lastShown = localStorage.getItem(lastAlertKey);
    if (lastShown === todayStr) {
      return null;
    }

    const lang = getCurrentAppLanguage();
    const dayRange = getWirdDayRange(status.targetDayNumber, profile);
    const content = buildWirdNotificationContent(profile, status.targetDayNumber, status.missedDaysCount, false, lang);

    return {
      profileId: profile.id,
      profileName: profile.name,
      currentDay: status.targetDayNumber,
      totalDays: status.totalDays,
      startPage: dayRange.start,
      endPage: dayRange.end,
      missedDaysCount: status.missedDaysCount,
      title: content.title,
      message: content.body,
      soundFileName: getActiveNotificationSoundFileName() || 'chime.mp3'
    };
  } catch (e) {
    console.error('Error checking wird alert on resume:', e);
    return null;
  }
};

export const markWirdAlertShownToday = (profileId: string) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`wird_alert_shown_date_${profileId}`, todayStr);
  } catch (e) {}
};
