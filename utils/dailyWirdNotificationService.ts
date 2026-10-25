import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { playNotificationSound, stopNotificationSound } from './prayerTimesUtils';

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
  lastCompletedDate?: string; // YYYY-MM-DD
}

export interface WirdAlertData {
  profileId: string;
  profileName: string;
  currentDay: number;
  totalDays: number;
  startPage: number;
  endPage: number;
  missedDaysCount: number; // 0 = on track, 1 = missed yesterday, >1 = missed multiple days
  title: string;
  message: string;
  soundFileName?: string;
}

const TOTAL_QURAN_PAGES = 604;
const WIRD_CHANNEL_ID = 'daily_wird_reminder_channel';
const NOTIFICATION_BASE_ID = 9300; // IDs 9301 to 9330 reserved for scheduled wird notifications
const TEST_NOTIFICATION_ID = 9300;

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
    return { start, end: Math.max(start - 1, end) };
  } else {
    const pagesPerDay = profile.value;
    const start = (day - 1) * pagesPerDay + 1 + offset;
    const end = Math.min(day * pagesPerDay + offset, TOTAL_QURAN_PAGES);
    return { start: Math.min(start, TOTAL_QURAN_PAGES + 1), end };
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
 * Helper to calculate missed days and current wird status relative to a specific reference date
 */
export const calculateWirdStatus = (profile: WirdProfile, targetDate = new Date()) => {
  const totalDays = getWirdTotalDays(profile);
  const completedCount = profile.completedDays?.length || 0;
  const isKhatmaFinished = completedCount >= totalDays;

  // Normalize dates to midnight local time to avoid timezone/hour discrepancies
  const start = new Date(profile.startDate);
  start.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - start.getTime();
  const calendarDaysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  // Expected days that should have been finished by the end of yesterday:
  // e.g. If started today (diff = 0), expected past finished = 0.
  // If tomorrow (diff = 1), expected past finished = 1 (Day 1).
  const expectedPastDays = Math.min(calendarDaysElapsed, totalDays);
  
  // Missed days = how many past days were expected minus what is actually completed
  const missedDaysCount = Math.max(0, expectedPastDays - completedCount);

  // Today's target day in progression
  const targetDayNumber = Math.min(completedCount + 1, totalDays);
  const isTodayDayCompleted = profile.completedDays.includes(profile.currentDay);

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
 * Builds respectful, inspiring Arabic or English texts based on missed days count
 */
export const buildWirdNotificationContent = (
  profile: WirdProfile,
  dayNumber: number,
  missedCount: number,
  lang: 'ar' | 'en' = getCurrentAppLanguage()
) => {
  const range = getWirdDayRange(dayNumber, profile);
  const isEn = lang === 'en';
  const pageRangeStr = range.start <= range.end 
    ? (isEn ? `(p. ${range.start} - ${range.end})` : `(ص ${range.start} - ${range.end})`) 
    : '';

  if (isEn) {
    if (missedCount === 0) {
      // Normal reminder: on schedule, today's wird
      return {
        title: "Illuminate Your Day with the Qur'an",
        body: `Daily Qur'an portion reminder (Day ${dayNumber}) ${pageRangeStr}.. Blessed is the one who dedicates time to the Qur'an. Open your Mushaf and read now.`
      };
    } else if (missedCount === 1) {
      // Missed yesterday's wird
      return {
        title: "Gentle Reminder of the Noble Qur'an",
        body: `A gentle reminder: You haven't completed yesterday's portion yet, and a blessed new portion awaits you today.. Read them together to keep your Khatma growing in grace and blessings.`
      };
    } else {
      // Missed multiple days
      return {
        title: "Eager for Your Return to the Qur'an",
        body: `Today's portion and (${missedCount}) previous portions are waiting for you.. Do not let days pass without the light of the Qur'an. A few minutes will catch you up; open your Mushaf now.`
      };
    }
  }

  // Arabic
  if (missedCount === 0) {
    // Normal reminder: on schedule, today's wird
    return {
      title: 'نور يومك بكتاب الله',
      body: `تذكير بوردك القرآني لليوم (اليوم ${dayNumber}) ${pageRangeStr}.. هنيئاً لمن جعل للقرآن نصيباً من يومه، افتح مصحفك واقرأ وردك الآن.`
    };
  } else if (missedCount === 1) {
    // Missed yesterday's wird
    return {
      title: 'تذكير طيب بورد القرآن الكريم',
      body: `تذكير لطيف: لم تكمل ورد الأمس بعد، ولديك اليوم ورد مبارك جديد.. يمكنك قراءتهما معاً لتستمر في مسيرة ختمتك المباركة وتفيض عليك البركة.`
    };
  } else {
    // Missed multiple days
    return {
      title: 'مشتاقون لعودتك إلى كتاب الله',
      body: `لديك ورد اليوم و (${missedCount}) أوراد سابقة في انتظارك.. لا تدع الأيام تمضي دون نور القرآن، بضع دقائق كفيلة باستدراك ما فاتك، افتح مصحفك الآن.`
    };
  }
};

/**
 * Initializes the dedicated Android notification channel
 */
export const ensureWirdNotificationChannel = async (lang: 'ar' | 'en' = getCurrentAppLanguage()) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const isEn = lang === 'en';
    await LocalNotifications.createChannel({
      id: WIRD_CHANNEL_ID,
      name: isEn ? 'Daily Wird & Khatma Reminders' : 'تنبيهات الورد اليومي والختمات',
      description: isEn 
        ? "Gentle reminders for daily Qur'an reading and Khatma progress with chime sound and vibration"
        : 'قناة تنبيهات الورد القرآني والتذكير بالقراءة اليومية بنغمة هادئة واهتزاز',
      importance: 5, // High importance (shows heads-up notification)
      sound: 'chime.mp3',
      vibration: true,
      visibility: 1
    });
  } catch (e) {
    console.warn('Error creating wird notification channel:', e);
  }
};

/**
 * Synchronizes and schedules daily notifications for the active Khatma
 * Schedules ahead for up to 14 days, updating intelligently based on current progress
 */
export const syncDailyWirdNotifications = async (langOverride?: 'ar' | 'en') => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[DailyWird] Platform is not native, skip local notification scheduling.');
    return;
  }

  const lang = langOverride || getCurrentAppLanguage();
  try {
    const profile = getActiveWirdProfile();
    
    // 1. First, cancel any previously scheduled wird notifications (IDs 9301 to 9330)
    const pending = await LocalNotifications.getPending();
    const wirdPending = pending.notifications.filter(n => n.id >= 9300 && n.id <= 9330);
    if (wirdPending.length > 0) {
      await LocalNotifications.cancel({ notifications: wirdPending });
    }

    if (!profile || !profile.isActive || profile.reminderEnabled === false) {
      console.log('[DailyWird] No active wird or reminder is disabled.');
      return;
    }

    const totalDays = getWirdTotalDays(profile);
    if (profile.completedDays.length >= totalDays) {
      console.log('[DailyWird] Khatma already completed. No reminder scheduled.');
      return;
    }

    // Check permissions
    const permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      console.log('[DailyWird] Notification permission not granted yet.');
      return;
    }

    await ensureWirdNotificationChannel(lang);

    // Parse reminder time (default to 09:00 AM)
    const reminderTimeStr = profile.reminderTime || '09:00';
    const [hStr, mStr] = reminderTimeStr.split(':');
    const reminderHour = parseInt(hStr, 10) || 9;
    const reminderMinute = parseInt(mStr, 10) || 0;

    const now = new Date();
    const notificationsToSchedule: any[] = [];

    // Schedule for the next 14 calendar days
    // Day offset 1 = tomorrow, 2 = day after, ..., up to 14
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + dayOffset);
      targetDate.setHours(reminderHour, reminderMinute, 0, 0);

      // If scheduled time already passed (shouldn't happen for dayOffset >= 1), skip
      if (targetDate.getTime() <= now.getTime()) continue;

      // Status calculation assuming user hasn't made progress in between:
      // Current completed count:
      const completedCount = profile.completedDays.length;
      
      // Is today's target day already completed today?
      const isTodayCompleted = profile.completedDays.includes(profile.currentDay);

      // Number of days that will have been missed before this target date:
      // Tomorrow (dayOffset = 1):
      // If today wasn't completed -> 1 missed day (ورد الأمس).
      // If today was completed -> 0 missed days.
      // Day after tomorrow (dayOffset = 2):
      // (isTodayCompleted ? 0 : 1) + 1 = 1 or 2 missed days.
      const missedOnTargetDate = (isTodayCompleted ? 0 : 1) + (dayOffset - 1);

      const targetDayNumber = Math.min(completedCount + 1, totalDays);
      const content = buildWirdNotificationContent(profile, targetDayNumber, missedOnTargetDate, lang);

      notificationsToSchedule.push({
        id: NOTIFICATION_BASE_ID + dayOffset,
        title: content.title,
        body: content.body,
        schedule: { at: targetDate, allowWhileIdle: true },
        channelId: WIRD_CHANNEL_ID,
        sound: 'chime.mp3',
        extra: {
          page: 'daily-wird',
          type: 'daily-wird',
          profileId: profile.id,
          profileName: profile.name,
          dayNumber: targetDayNumber,
          missedCount: missedOnTargetDate,
          playSound: true,
          soundFile: '/assets/audio/chime.mp3'
        },
        smallIcon: 'ic_stat_name'
      });
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      console.log(`[DailyWird] Successfully scheduled ${notificationsToSchedule.length} upcoming wird notifications in (${lang}).`);
    }
  } catch (error) {
    console.error('[DailyWird] Error synchronizing notifications:', error);
  }
};

/**
 * Triggers an immediate test notification and sound for the user to try
 */
export const triggerTestWirdNotification = async (langOverride?: 'ar' | 'en') => {
  const lang = langOverride || getCurrentAppLanguage();
  const isEn = lang === 'en';
  const profile = getActiveWirdProfile();
  const dayNumber = profile ? profile.currentDay : 1;
  const content = profile 
    ? buildWirdNotificationContent(profile, dayNumber, 0, lang)
    : (isEn ? {
        title: "Daily Wird Test Alert",
        body: "This is a test notification for your daily Qur'an portion with gentle reminder chime and vibration."
      } : {
        title: 'تنبيه الورد اليومي التجريبي',
        body: 'هذا نموذج لتنبيه الورد اليومي القرآني بصوت نغمة التذكير الهادئة واهتزاز الهاتف.'
      });

  // Play gentle sound
  playNotificationSound('/assets/audio/chime.mp3', true);

  // Dispatch in-app modal alert only on web / browser (never in native APK)
  if (!Capacitor.isNativePlatform()) {
    window.dispatchEvent(new CustomEvent('show-wird-alert', {
      detail: {
        profileId: profile?.id || 'demo',
        profileName: profile?.name || (isEn ? 'Current Khatma' : 'الختمة الحالية'),
        currentDay: dayNumber,
        totalDays: profile ? getWirdTotalDays(profile) : 30,
        startPage: profile ? getWirdDayRange(dayNumber, profile).start : 1,
        endPage: profile ? getWirdDayRange(dayNumber, profile).end : 20,
        missedDaysCount: 0,
        title: content.title,
        message: content.body,
        soundFileName: 'chime.mp3'
      }
    }));
  }

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
            smallIcon: 'ic_stat_name'
          }
        ]
      });
    } catch (e) {
      console.warn('Error sending test wird notification:', e);
    }
  }
};

/**
 * Checks if the user has an uncompleted wird on app launch/resume and returns alert data if needed
 * Note: Only active on web/browser platforms. In native APK, reminders are handled via system notifications.
 */
export const checkWirdAlertOnAppResume = (): WirdAlertData | null => {
  // Never show in-app popup alerts inside native APK
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
    
    // Only prompt if today's wird is NOT completed yet
    if (status.isTodayDayCompleted) {
      return null;
    }

    // Check last alert prompt date to avoid annoying modal every single page navigation
    const todayStr = new Date().toISOString().split('T')[0];
    const lastAlertKey = `wird_alert_shown_date_${profile.id}`;
    const lastShown = localStorage.getItem(lastAlertKey);
    if (lastShown === todayStr) {
      return null;
    }

    const lang = getCurrentAppLanguage();
    const dayRange = getWirdDayRange(status.targetDayNumber, profile);
    const content = buildWirdNotificationContent(profile, status.targetDayNumber, status.missedDaysCount, lang);

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

/**
 * Marks today's alert modal as viewed for today
 */
export const markWirdAlertShownToday = (profileId: string) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`wird_alert_shown_date_${profileId}`, todayStr);
  } catch (e) {}
};
