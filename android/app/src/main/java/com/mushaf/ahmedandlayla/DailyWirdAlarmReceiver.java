package com.mushaf.ahmedandlayla;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/**
 * Intelligent Native Alarm Receiver for Daily Wird Phone Reminders
 * Ensures reliable alarms at 9:00 AM and 10:00 PM (22:00) with user's name,
 * dynamic catch-up messages, custom chime sound, and max-sized notification icon.
 */
public class DailyWirdAlarmReceiver extends BroadcastReceiver {

    public static final String ACTION_CHECK_DAILY_WIRD = "com.mushaf.ahmedandlayla.ACTION_CHECK_DAILY_WIRD";
    public static final String ACTION_SYNC_DAILY_WIRD = "com.mushaf.ahmedandlayla.ACTION_SYNC_DAILY_WIRD";
    public static final String EXTRA_PERIOD = "period"; // "morning" or "evening"

    private static final String CHANNEL_ID = "daily_wird_reminders_channel";
    private static final String NOTIFICATION_GROUP = "com.mushaf.ahmedandlayla.GENERAL_ALERTS_CARD";
    private static final int MORNING_NOTIF_ID = 9301;
    private static final int EVENING_NOTIF_ID = 9302;
    private static final int TOTAL_QURAN_PAGES = 604;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) return;
        String action = intent.getAction();

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            try {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Mushaf:DailyWirdWakeLock");
                wakeLock.acquire(10000);
            } catch (Exception ignored) {}
        }

        try {
            if (ACTION_CHECK_DAILY_WIRD.equals(action)) {
                String period = intent.getStringExtra(EXTRA_PERIOD);
                if (period == null || period.isEmpty()) {
                    int currentHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
                    period = (currentHour >= 18) ? "evening" : "morning";
                }
                evaluateAndNotifyWird(context, "evening".equalsIgnoreCase(period));
            }

            // Always reschedule the next alarms to maintain unbroken daily chain
            scheduleNextAlarms(context);
        } catch (Exception ignored) {
        } finally {
            if (wakeLock != null && wakeLock.isHeld()) {
                try {
                    wakeLock.release();
                } catch (Exception ignored) {}
            }
        }
    }

    /**
     * Schedules the next 9:00 AM and 10:00 PM (22:00) exact alarms using Android AlarmManager
     */
    public static void scheduleNextAlarms(Context context) {
        if (context == null) return;
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Calendar now = Calendar.getInstance();

        // 1. Next Morning Alarm (at custom reminderTime or default 09:00 AM)
        int morningHour = 9;
        int morningMinute = 0;
        try {
            SharedPreferences storage = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String rawJson = storage.getString("dailyWirdSettings_v2", null);
            if (rawJson != null) {
                JSONObject root = new JSONObject(rawJson);
                JSONArray profiles = root.optJSONArray("profiles");
                String activeId = root.optString("activeId", "");
                if (profiles != null && profiles.length() > 0) {
                    JSONObject activeProfile = profiles.getJSONObject(0);
                    for (int i = 0; i < profiles.length(); i++) {
                        JSONObject p = profiles.getJSONObject(i);
                        if (activeId.equals(p.optString("id"))) {
                            activeProfile = p;
                            break;
                        }
                    }
                    String rTime = activeProfile.optString("reminderTime", "09:00");
                    if (rTime != null && rTime.contains(":")) {
                        String[] parts = rTime.split(":");
                        morningHour = Integer.parseInt(parts[0].trim());
                        morningMinute = Integer.parseInt(parts[1].trim());
                    }
                }
            }
        } catch (Exception ignored) {}

        Calendar morningCal = Calendar.getInstance();
        morningCal.set(Calendar.HOUR_OF_DAY, morningHour);
        morningCal.set(Calendar.MINUTE, morningMinute);
        morningCal.set(Calendar.SECOND, 0);
        morningCal.set(Calendar.MILLISECOND, 0);
        if (morningCal.getTimeInMillis() <= now.getTimeInMillis()) {
            morningCal.add(Calendar.DAY_OF_YEAR, 1);
        }

        Intent morningIntent = new Intent(context, DailyWirdAlarmReceiver.class);
        morningIntent.setAction(ACTION_CHECK_DAILY_WIRD);
        morningIntent.putExtra(EXTRA_PERIOD, "morning");
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent morningPi = PendingIntent.getBroadcast(context, MORNING_NOTIF_ID, morningIntent, flags);

        // 2. Next Evening Alarm at 10:00 PM (22:00)
        Calendar eveningCal = Calendar.getInstance();
        eveningCal.set(Calendar.HOUR_OF_DAY, 22);
        eveningCal.set(Calendar.MINUTE, 0);
        eveningCal.set(Calendar.SECOND, 0);
        eveningCal.set(Calendar.MILLISECOND, 0);
        if (eveningCal.getTimeInMillis() <= now.getTimeInMillis()) {
            eveningCal.add(Calendar.DAY_OF_YEAR, 1);
        }

        Intent eveningIntent = new Intent(context, DailyWirdAlarmReceiver.class);
        eveningIntent.setAction(ACTION_CHECK_DAILY_WIRD);
        eveningIntent.putExtra(EXTRA_PERIOD, "evening");
        PendingIntent eveningPi = PendingIntent.getBroadcast(context, EVENING_NOTIF_ID, eveningIntent, flags);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, morningCal.getTimeInMillis(), morningPi);
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, eveningCal.getTimeInMillis(), eveningPi);
            } else {
                am.setExact(AlarmManager.RTC_WAKEUP, morningCal.getTimeInMillis(), morningPi);
                am.setExact(AlarmManager.RTC_WAKEUP, eveningCal.getTimeInMillis(), eveningPi);
            }
        } catch (SecurityException se) {
            // Fallback for devices restricting exact alarms
            am.set(AlarmManager.RTC_WAKEUP, morningCal.getTimeInMillis(), morningPi);
            am.set(AlarmManager.RTC_WAKEUP, eveningCal.getTimeInMillis(), eveningPi);
        } catch (Exception ignored) {}
    }

    /**
     * Inspects active wird profile in SharedPreferences and posts phone notification if unread
     */
    private void evaluateAndNotifyWird(Context context, boolean isEvening) {
        SharedPreferences storage = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String rawJson = storage.getString("dailyWirdSettings_v2", null);
        if (rawJson == null || rawJson.trim().isEmpty()) {
            return;
        }

        try {
            JSONObject root = new JSONObject(rawJson);
            JSONArray profiles = root.optJSONArray("profiles");
            if (profiles == null || profiles.length() == 0) return;

            String activeId = root.optString("activeId", "");
            JSONObject activeProfile = null;
            if (!activeId.isEmpty()) {
                for (int i = 0; i < profiles.length(); i++) {
                    JSONObject p = profiles.getJSONObject(i);
                    if (activeId.equals(p.optString("id"))) {
                        activeProfile = p;
                        break;
                    }
                }
            }
            if (activeProfile == null) {
                activeProfile = profiles.getJSONObject(0);
            }
            if (activeProfile == null) return;

            boolean isActive = activeProfile.optBoolean("isActive", true);
            boolean reminderEnabled = activeProfile.optBoolean("reminderEnabled", true);
            if (!isActive || !reminderEnabled) {
                cancelActiveWirdNotifications(context);
                return;
            }

            // Check if user already marked today completed via lastCompletedDate
            String todayDateStr = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            String lastCompletedDate = activeProfile.optString("lastCompletedDate", "");
            if (lastCompletedDate != null && lastCompletedDate.startsWith(todayDateStr)) {
                // Today's reading already finished! Do not notify today.
                cancelActiveWirdNotifications(context);
                return;
            }

            String mode = activeProfile.optString("mode", "days");
            int val = activeProfile.optInt("value", mode.equals("days") ? 30 : 20);
            int startPageOffset = activeProfile.optInt("startPage", 1);
            int totalDays = mode.equals("days") ? val : (int) Math.ceil((double) TOTAL_QURAN_PAGES / val);

            JSONArray completedDaysJson = activeProfile.optJSONArray("completedDays");
            Set<Integer> completedSet = new HashSet<>();
            if (completedDaysJson != null) {
                for (int i = 0; i < completedDaysJson.length(); i++) {
                    completedSet.add(completedDaysJson.getInt(i));
                }
            }
            int completedCount = completedSet.size();
            if (completedCount >= totalDays) {
                // Khatma already completed!
                cancelActiveWirdNotifications(context);
                return;
            }

            // Calculate days elapsed since start date
            String startDateStr = activeProfile.optString("startDate", todayDateStr);
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            Date startDate;
            try {
                startDate = sdf.parse(startDateStr.length() >= 10 ? startDateStr.substring(0, 10) : startDateStr);
            } catch (Exception e) {
                startDate = new Date();
            }
            Date todayDate;
            try {
                todayDate = sdf.parse(todayDateStr);
            } catch (Exception e) {
                todayDate = new Date();
            }

            long diffMillis = Math.max(0, todayDate.getTime() - startDate.getTime());
            int calendarDaysElapsed = (int) (diffMillis / (1000L * 60 * 60 * 24));

            // CRITICAL CHECK: If user already completed today's allocated portion:
            // e.g. calendarDaysElapsed is 1 (day 2) and completedCount is 2 (day 2 completed),
            // then today's wird is finished! No notification should be shown!
            if (completedCount > calendarDaysElapsed) {
                cancelActiveWirdNotifications(context);
                return;
            }

            int currentDay = activeProfile.optInt("currentDay", 1);
            if (completedSet.contains(currentDay)) {
                cancelActiveWirdNotifications(context);
                return;
            }

            int expectedPastDays = Math.min(calendarDaysElapsed, totalDays);
            int missedDaysCount = Math.max(0, expectedPastDays - completedCount);

            int targetDayNumber = Math.min(completedCount + 1, totalDays);
            if (completedSet.contains(targetDayNumber)) {
                cancelActiveWirdNotifications(context);
                return;
            }

            // Calculate page range for today
            int pagesLeft = TOTAL_QURAN_PAGES - startPageOffset + 1;
            int offset = startPageOffset - 1;
            int todayStartPage;
            int todayEndPage;

            if (mode.equals("days")) {
                todayStartPage = (int) Math.floor(((targetDayNumber - 1) * (double) pagesLeft) / val) + 1 + offset;
                todayEndPage = (int) Math.floor((targetDayNumber * (double) pagesLeft) / val) + offset;
            } else {
                todayStartPage = (targetDayNumber - 1) * val + 1 + offset;
                todayEndPage = Math.min(targetDayNumber * val + offset, TOTAL_QURAN_PAGES);
            }
            todayStartPage = Math.min(todayStartPage, TOTAL_QURAN_PAGES);
            todayEndPage = Math.min(Math.max(todayStartPage, todayEndPage), TOTAL_QURAN_PAGES);

            // User Name Formatting ("وباسم المستخدم")
            String rawName = activeProfile.optString("name", "").trim();
            String appLang = storage.getString("app_language", "ar");
            boolean isEn = "en".equalsIgnoreCase(appLang);

            String formattedName;
            if (rawName.isEmpty() || rawName.matches("(?i)^(مستخدم|user)(\\s*\\d+)?$")) {
                formattedName = isEn ? "Qur'an Reader" : "صاحب القرآن";
            } else {
                formattedName = rawName;
            }

            String title;
            String message;

            if (isEn) {
                String prefix = "Dear " + formattedName + ": ";
                String pageStr = "(p. " + todayStartPage + " - " + todayEndPage + ")";
                if (isEvening) {
                    if (missedDaysCount == 0) {
                        title = prefix + "Evening Qur'an Reminder";
                        message = "The day is coming to a close and today's portion (Day " + targetDayNumber + ") " + pageStr + " is waiting for you.. Conclude your night with the light of the Qur'an before sleep.";
                    } else if (missedDaysCount == 1) {
                        title = prefix + "Catch Up Before Day's End";
                        message = "Evening reminder: Yesterday's and today's portions await you.. Make the seal of your night verses from the Holy Qur'an.";
                    } else {
                        title = prefix + "Blessed Opportunity Tonight";
                        message = "Do not let today's portion and (" + missedDaysCount + ") previous portions pass unread.. Spend a few tranquil minutes catching up tonight.";
                    }
                } else {
                    if (missedDaysCount == 0) {
                        title = prefix + "Illuminate Your Day with the Qur'an";
                        message = "Daily Qur'an portion reminder for today (Day " + targetDayNumber + ") " + pageStr + ".. Blessed is the one who begins the day with the Qur'an.";
                    } else if (missedDaysCount == 1) {
                        title = prefix + "Gentle Reminder of the Holy Qur'an";
                        message = "A gentle reminder: You have not completed yesterday's portion yet, and a blessed new portion awaits you today.. Read them together to maintain your Khatma.";
                    } else {
                        title = prefix + "Eager for Your Return to the Qur'an";
                        message = "Today's portion and (" + missedDaysCount + ") previous delayed portions await you.. Do not let days pass without the light of the Qur'an.";
                    }
                }
            } else {
                String prefix = "يا " + formattedName + ": ";
                String pageStr = "(ص " + todayStartPage + " - " + todayEndPage + ")";
                if (isEvening) {
                    if (missedDaysCount == 0) {
                        title = prefix + "تذكير المساء بورد القرآن الكريم";
                        message = "أوشك اليوم على الانقضاء ولم تقرأ وردك المقرر (اليوم " + targetDayNumber + ") " + pageStr + ".. اختم يومك بنور كتاب الله واقرأ وردك قبل النوم لتنعم بليل مبارك.";
                    } else if (missedDaysCount == 1) {
                        title = prefix + "تدارك وردك قبل نهاية اليوم";
                        message = "تذكير مسائي: لم تقرأ ورد الأمس وورد اليوم " + pageStr + ".. اجعل مسك ختام ليلتك آيات من الذكر الحكيم واقرأهما الآن.";
                    } else {
                        title = prefix + "فرصة طيبة لاستدراك وردك الليلة";
                        message = "أوشك اليوم على الانتهاء ولديك ورد اليوم " + pageStr + " و (" + missedDaysCount + ") أوراد سابقة متأخرة في انتظارك.. بضع دقائق في سكون الليل كفيلة باستدراك ما فاتك.";
                    }
                } else {
                    if (missedDaysCount == 0) {
                        title = prefix + "نور يومك بكتاب الله";
                        message = "تذكير بوردك القرآني لليوم (اليوم " + targetDayNumber + ") " + pageStr + ".. هنيئاً لمن جعل للقرآن نصيباً من يومه، افتح مصحفك واقرأ وردك الآن.";
                    } else if (missedDaysCount == 1) {
                        title = prefix + "تذكير طيب بورد القرآن الكريم";
                        message = "تذكير لطيف: لم تكمل ورد الأمس، ولديك اليوم ورد مبارك جديد " + pageStr + ".. اقرأهما معاً لتستمر في مسيرة ختمتك المباركة وتفيض عليك البركة.";
                    } else {
                        title = prefix + "مشتاقون لعودتك إلى كتاب الله";
                        message = "لديك ورد اليوم " + pageStr + " و (" + missedDaysCount + ") أوراد سابقة في انتظارك.. لا تدع الأيام تمضي دون نور القرآن، افتح مصحفك الآن واستدرك ما فاتك.";
                    }
                }
            }

            int notifId = isEvening ? EVENING_NOTIF_ID : MORNING_NOTIF_ID;
            showWirdPhoneNotification(context, notifId, title, message);

        } catch (Exception ignored) {}
    }

    /**
     * Posts high-priority system phone notification with chime sound,
     * status bar icon (ic_stat_name at max size), and group GENERAL_ALERTS_CARD.
     */
    private void showWirdPhoneNotification(Context context, int notifId, String title, String message) {
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            int resId = context.getResources().getIdentifier("chime", "raw", context.getPackageName());
            Uri soundUri = null;
            if (resId != 0) {
                soundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + context.getPackageName() + "/" + resId);
            }

            AudioAttributes alarmAudioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                .build();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "تنبيهات الورد القرآني",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("تنبيهات قراءة الورد اليومي والختمات القرآنية بصوت التذكير الهادئ");
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                channel.setBypassDnd(true);
                channel.enableVibration(true);
                channel.enableLights(true);
                channel.setShowBadge(false);
                if (soundUri != null) {
                    channel.setSound(soundUri, alarmAudioAttributes);
                }
                nm.createNotificationChannel(channel);
            }

            Intent openAppIntent = new Intent(context, MainActivity.class);
            openAppIntent.putExtra("shortcut_target", "daily-wird");
            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(context, notifId, openAppIntent, flags);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setColor(0xFF2E7D5E)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setGroup(NOTIFICATION_GROUP)
                .setGroupSummary(false)
                .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
                .setSortKey("12_daily_wird")
                .setBadgeIconType(NotificationCompat.BADGE_ICON_NONE)
                .setNumber(0)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            if (soundUri != null) {
                builder.setSound(soundUri);
            }

            try {
                android.graphics.Bitmap largeIcon = android.graphics.BitmapFactory.decodeResource(context.getResources(), R.drawable.app_logo_large);
                if (largeIcon != null) {
                    builder.setLargeIcon(largeIcon);
                }
            } catch (Exception ignored) {}

            nm.notify(notifId, builder.build());
            AlertsGroupHelper.updateGroupSummary(context, nm);
        } catch (Exception ignored) {}
    }

    /**
     * Dismisses any active/delivered daily wird reminder notifications from the phone drawer
     */
    public static void cancelActiveWirdNotifications(Context context) {
        if (context == null) return;
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(MORNING_NOTIF_ID);
                nm.cancel(EVENING_NOTIF_ID);
            }
            AlertsGroupHelper.updateGroupSummary(context, nm);
        } catch (Exception ignored) {}
    }
}
