import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { playNotificationSound } from './prayerTimesUtils';
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
  reminderTime?: string; // HH:mm format, e.g. "09:00"
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
// 9301: Daily morning recurring fallback (9:00 AM)
// 9302: Daily evening recurring fallback (10:00 PM)
// 9310 - 9324: Exact upcoming morning notifications (days 0..14)
// 9330 - 9344: Exact upcoming evening notifications (days 0..14)
const TEST_NOTIFICATION_ID = 9300;
const RECURRING_MORNING_ID = 9301;
const RECURRING_EVENING_ID = 9302;
const BASE_MORNING_EXACT_ID = 9310;
const BASE_EVENING_EXACT_ID = 9330;

/**
 * Calculates start and end page for a given day in the Khatma
 */
export const getWirdDayRange = (day: number, profile: WirdProfile) => {
  const startPage = profile.startPage || 1;
  const pagesLeft = TOTAL_QURAN_PAGES - startPage + 1;
  const offset = startPage - 1;

  if (profile.mode === 'days') {
    const totalDays = profile.value;
    const start = Math.floor(((day - 1) * pagesLeft) / totalDays) + 1 + offset;
    const end = Math.floor((day * pagesLeft) / totalDays) + offset;
    return { start: Math.min(start, TOTAL_QURAN_PAGES), end: Math.min(Math.max(start, end), TOTAL_QURAN_PAGES) };
  } else {
    const pagesPerDay = profile.value;
    const start = (day - 1) * pagesPerDay + 1 + offset;
    const end = Math.min(day * pagesPerDay + offset, TOTAL_QURAN_PAGES);
    return { start: Math.min(start, TOTAL_QURAN_PAGES), end: Math.min(Math.max(start, end), TOTAL_QURAN_PAGES) };
  }
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
  const isTodayDayCompleted = Boolean(
    profile.lastCompletedDate && profile.lastCompletedDate.startsWith(targetDateStr)
  ) || profile.completedDays.includes(targetDayNumber);

  return {
    totalDays,
    completedCount,
    calendarDaysElapsed,
    missedDaysCount,
    targetDayNumber,
    isTodayDayCompleted,
    isKhatmaFinished
  };
};

/**
 * Builds respectful, inspiring Arabic or English notification texts addressing the user by name
 * Supports morning (9:00 AM) and evening (10:00 PM / 22:00) reminders with delayed catch-up.
 */
export const buildWirdNotificationContent = (
  profile: WirdProfile,
  dayNumber: number,
  missedCount: number,
  isEvening: boolean = false,
  lang: 'ar' | 'en' = getCurrentAppLanguage()
) => {
  const range = getWirdDayRange(dayNumber, profile);
  const isEn = lang === 'en';
  const userName = formatWirdUserName(profile.name, lang);
  const pageRangeStr = range.start <= range.end 
    ? (isEn ? `(p. ${range.start} - ${range.end})` : `(ص ${range.start} - ${range.end})`) 
    : '';

  // Calculate yesterday's range if missed
  let yesterdayRangeStr = '';
  if (missedCount >= 1 && dayNumber > 1) {
    const yRange = getWirdDayRange(dayNumber - 1, profile);
    yesterdayRangeStr = isEn ? `(p. ${yRange.start} - ${yRange.end})` : `(ص ${yRange.start} - ${yRange.end})`;
  }

  if (isEn) {
    const prefix = `Dear ${userName}: `;
    if (isEvening) {
      if (missedCount === 0) {
        return {
          title: `${prefix}Evening Qur'an Reminder`,
          body: `The day is coming to a close and today's assigned portion (Day ${dayNumber}) ${pageRangeStr} awaits you.. Conclude your night with the light of the Qur'an before sleep.`
        };
      } else if (missedCount === 1) {
        return {
          title: `${prefix}Catch Up Before Day's End`,
          body: `Evening reminder: Yesterday's portion ${yesterdayRangeStr} and today's portion ${pageRangeStr} await you.. Make the seal of your night verses from the Holy Qur'an.`
        };
      } else {
        return {
          title: `${prefix}Blessed Opportunity Tonight`,
          body: `Do not let today's portion ${pageRangeStr} and (${missedCount}) previous portions pass unread.. Spend a few tranquil minutes catching up tonight.`
        };
      }
    } else {
      // Morning (9:00 AM)
      if (missedCount === 0) {
        return {
          title: `${prefix}Illuminate Your Day with the Qur'an`,
          body: `Daily Qur'an portion reminder (Day ${dayNumber}) ${pageRangeStr}.. Blessed is the one who begins the day with the Qur'an. Open your Mushaf and read now.`
        };
      } else if (missedCount === 1) {
        return {
          title: `${prefix}Gentle Reminder of the Holy Qur'an`,
          body: `A gentle reminder: You haven't completed yesterday's portion ${yesterdayRangeStr} yet, and a blessed new portion awaits you today ${pageRangeStr}.. Read them together to maintain your Khatma.`
        };
      } else {
        return {
          title: `${prefix}Eager for Your Return to the Qur'an`,
          body: `Today's portion ${pageRangeStr} and (${missedCount}) previous portions await you.. Do not let days pass without the light of the Qur'an. Catch up now.`
        };
      }
    }
  }

  // Arabic
  const prefix = `يا ${userName}: `;
  if (isEvening) {
    if (missedCount === 0) {
      return {
        title: `${prefix}تذكير المساء بورد القرآن الكريم`,
        body: `أوشك اليوم على الانقضاء ولم تقرأ وردك المقرر (اليوم ${dayNumber}) ${pageRangeStr}.. اختم يومك بنور كتاب الله واقرأ وردك قبل النوم لتنعم بليل مبارك.`
      };
    } else if (missedCount === 1) {
      return {
        title: `${prefix}تدارك وردك قبل نهاية اليوم`,
        body: `تذكير مسائي: لم تقرأ ورد الأمس ${yesterdayRangeStr} وورد اليوم ${pageRangeStr}.. اجعل مسك ختام ليلتك آيات من الذكر الحكيم واقرأهما الآن.`
      };
    } else {
      return {
        title: `${prefix}فرصة طيبة لاستدراك وردك الليلة`,
        body: `أوشك اليوم على الانتهاء ولديك ورد اليوم ${pageRangeStr} و (${missedCount}) أوراد سابقة متأخرة في انتظارك.. بضع دقائق في سكون الليل كفيلة باستدراك ما فاتك، افتح مصحفك الآن.`
      };
    }
  } else {
    // Morning (9:00 AM)
    if (missedCount === 0) {
      return {
        title: `${prefix}نور يومك بكتاب الله`,
        body: `تذكير بوردك القرآني لليوم (اليوم ${dayNumber}) ${pageRangeStr}.. هنيئاً لمن جعل للقرآن نصيباً من يومه، افتح مصحفك واقرأ وردك الآن.`
      };
    } else if (missedCount === 1) {
      return {
        title: `${prefix}تذكير طيب بورد القرآن الكريم`,
        body: `تذكير لطيف: لم تكمل ورد الأمس ${yesterdayRangeStr}، ولديك اليوم ورد مبارك جديد ${pageRangeStr}.. اقرأهما معاً لتستمر في مسيرة ختمتك المباركة وتفيض عليك البركة.`
      };
    } else {
      return {
        title: `${prefix}مشتاقون لعودتك إلى كتاب الله`,
        body: `لديك ورد اليوم ${pageRangeStr} و (${missedCount}) أوراد سابقة متأخرة في انتظارك.. لا تدع الأيام تمضي دون نور القرآن، افتح مصحفك الآن واستدرك ما فاتك.`
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
    const channelConfig = {
      name: isEn ? 'Daily Wird & Khatma Reminders' : 'تنبيهات الورد اليومي والختمات',
      description: isEn 
        ? "Gentle reminders for daily Qur'an reading and Khatma progress with chime sound and vibration"
        : 'قناة تنبيهات الورد القرآني والتذكير بالقراءة اليومية بنغمة هادئة واهتزاز',
      importance: 5 as any, // High importance (shows heads-up notification and status bar icon)
      sound: 'chime.mp3',
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
 * - Schedules morning (09:00 AM) and evening (10:00 PM / 22:00) reminders
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
    // Morning (09:00 AM) and Evening (10:00 PM / 22:00)
    const baselineDayNumber = Math.min(profile.completedDays.length + 1, totalDays);
    const morningBaseContent = buildWirdNotificationContent(profile, baselineDayNumber, 0, false, lang);
    const eveningBaseContent = buildWirdNotificationContent(profile, baselineDayNumber, 0, true, lang);

    notificationsToSchedule.push({
      id: RECURRING_MORNING_ID,
      title: morningBaseContent.title,
      body: morningBaseContent.body,
      schedule: { on: { hour: 9, minute: 0 }, allowWhileIdle: true, repeats: true },
      channelId: WIRD_CHANNEL_ID,
      sound: 'chime.mp3',
      extra: {
        page: 'daily-wird',
        type: 'daily-wird',
        period: 'morning',
        profileId: profile.id,
        playSound: true,
        soundFile: '/assets/audio/chime.mp3'
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
      sound: 'chime.mp3',
      extra: {
        page: 'daily-wird',
        type: 'daily-wird',
        period: 'evening',
        profileId: profile.id,
        playSound: true,
        soundFile: '/assets/audio/chime.mp3'
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

      // Morning Schedule (09:00 AM)
      const morningTarget = new Date(targetDate);
      morningTarget.setHours(9, 0, 0, 0);

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
          sound: 'chime.mp3',
          extra: {
            page: 'daily-wird',
            type: 'daily-wird',
            period: 'morning',
            profileId: profile.id,
            profileName: profile.name,
            dayNumber: targetDayNumber,
            missedCount: missedOnTargetDate,
            playSound: true,
            soundFile: '/assets/audio/chime.mp3'
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
          sound: 'chime.mp3',
          extra: {
            page: 'daily-wird',
            type: 'daily-wird',
            period: 'evening',
            profileId: profile.id,
            profileName: profile.name,
            dayNumber: targetDayNumber,
            missedCount: missedOnTargetDate,
            playSound: true,
            soundFile: '/assets/audio/chime.mp3'
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
        body: `Portion reminder (Day 1) (p. 1 - 20).. Blessed is the one who dedicates time to the Holy Qur'an.`
      } : {
        title: `يا ${userName}: نور يومك بكتاب الله`,
        body: `تذكير بوردك القرآني لليوم (اليوم 1) (ص 1 - 20).. هنيئاً لمن جعل للقرآن نصيباً من يومه، افتح مصحفك واقرأ وردك الآن.`
      });

  // Play gentle sound
  playNotificationSound('/assets/audio/chime.mp3', true);

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureWirdNotificationChannel(lang);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: TEST_NOTIFICATION_ID,
            title: content.title,
            body: content.body,
            schedule: { at: new Date(Date.now() + 500), allowWhileIdle: true },
            channelId: WIRD_CHANNEL_ID,
            sound: 'chime.mp3',
            extra: {
              page: 'daily-wird',
              type: 'daily-wird',
              profileId: profile?.id || 'demo',
              dayNumber,
              missedCount: 0,
              playSound: true,
              soundFile: '/assets/audio/chime.mp3'
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
      soundFileName: 'chime.mp3'
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
