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
import android.os.Bundle;
import android.os.PowerManager;
import android.service.notification.StatusBarNotification;
import androidx.core.app.NotificationCompat;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Intelligent Native Alarm Receiver for Daily Wird Phone Reminders.
 * Supports unlimited user profiles independently: emits notification/alert for the active user first,
 * then sequentially emits each additional eligible user's notification 10 seconds apart.
 */
public class DailyWirdAlarmReceiver extends BroadcastReceiver {

    public static final String ACTION_CHECK_DAILY_WIRD = "com.mushaf.ahmedandlayla.ACTION_CHECK_DAILY_WIRD";
    public static final String ACTION_WIRD_USER_STEP = "com.mushaf.ahmedandlayla.ACTION_WIRD_USER_STEP";
    public static final String ACTION_SYNC_DAILY_WIRD = "com.mushaf.ahmedandlayla.ACTION_SYNC_DAILY_WIRD";
    public static final String EXTRA_PERIOD = "period"; // "morning" or "evening"
    public static final String EXTRA_PROCESSED_IDS = "processed_ids";
    public static final String EXTRA_WIRD_PROFILE_ID = "wird_profile_id";

    private static final String CHANNEL_ID = "daily_wird_reminders_channel";
    private static final String NOTIFICATION_GROUP = "com.mushaf.ahmedandlayla.GENERAL_ALERTS_CARD";
    private static final int MORNING_NOTIF_ID = 9301;
    private static final int EVENING_NOTIF_ID = 9302;
    private static final int STEP_MORNING_REQUEST_CODE = 9303;
    private static final int STEP_EVENING_REQUEST_CODE = 9304;
    private static final int EXTRA_USER_NOTIF_ID_BASE = 93100;
    private static final long USER_STEP_DELAY_MS = 10_000L;
    private static final int TOTAL_QURAN_PAGES = 604;

    private static final class ProfileEntry {
        final JSONObject profile;
        final String id;
        final boolean isActiveProfile;
        final int morningNotifId;
        final int eveningNotifId;

        ProfileEntry(JSONObject profile, String id, boolean isActiveProfile, int morningNotifId, int eveningNotifId) {
            this.profile = profile;
            this.id = id;
            this.isActiveProfile = isActiveProfile;
            this.morningNotifId = morningNotifId;
            this.eveningNotifId = eveningNotifId;
        }
    }

    private static final class WirdNotificationPayload {
        final int notifId;
        final String title;
        final String message;

        WirdNotificationPayload(int notifId, String title, String message) {
            this.notifId = notifId;
            this.title = title;
            this.message = message;
        }
    }

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
                boolean isEvening = "evening".equalsIgnoreCase(period);
                cancelStepAlarm(context, isEvening);
                processDailyWirdStep(context, isEvening, new HashSet<>());
                // Always reschedule the next alarms to maintain unbroken daily chain
                scheduleNextAlarms(context);
            } else if (ACTION_WIRD_USER_STEP.equals(action)) {
                String period = intent.getStringExtra(EXTRA_PERIOD);
                boolean isEvening = "evening".equalsIgnoreCase(period);
                Set<String> processedIds = parseProcessedIds(intent.getStringExtra(EXTRA_PROCESSED_IDS));
                processDailyWirdStep(context, isEvening, processedIds);
            } else {
                // Boot / time change / sync: reschedule the next alarms
                scheduleNextAlarms(context);
            }
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
     * Schedules the next 10:00 AM and 10:00 PM (22:00) exact alarms using Android AlarmManager
     */
    public static void scheduleNextAlarms(Context context) {
        if (context == null) return;
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Calendar now = Calendar.getInstance();

        // 1. Next Morning Alarm (at custom reminderTime or default 10:00 AM)
        int morningHour = 10;
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
                    String rTime = activeProfile.optString("reminderTime", "10:00");
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
     * Evaluates ordered profiles starting from the active user, emits at most one notification now,
     * and schedules the next eligible user's notification exactly 10 seconds later.
     */
    private void processDailyWirdStep(Context context, boolean isEvening, Set<String> processedIds) {
        SharedPreferences storage = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String rawJson = storage.getString("dailyWirdSettings_v2", null);
        if (rawJson == null || rawJson.trim().isEmpty()) {
            return;
        }

        try {
            JSONObject root = new JSONObject(rawJson);
            List<ProfileEntry> ordered = getOrderedProfiles(root);
            if (ordered.isEmpty()) return;

            boolean postedOne = false;
            boolean hasMoreEligible = false;

            for (ProfileEntry entry : ordered) {
                if (processedIds.contains(entry.id)) {
                    continue;
                }

                WirdNotificationPayload payload = evaluateProfile(storage, entry, isEvening);
                if (payload == null) {
                    cancelNotificationsForEntry(context, entry);
                    processedIds.add(entry.id);
                    continue;
                }

                if (!postedOne) {
                    showWirdPhoneNotification(context, payload.notifId, payload.title, payload.message, entry.id);
                    processedIds.add(entry.id);
                    postedOne = true;
                } else {
                    hasMoreEligible = true;
                    break;
                }
            }

            if (hasMoreEligible) {
                scheduleStepAlarm(context, isEvening, processedIds, System.currentTimeMillis() + USER_STEP_DELAY_MS);
            }
        } catch (Exception ignored) {}
    }

    /**
     * Reconciles currently delivered notifications against live profiles:
     * cancels notifications only for profiles that completed today, are disabled, or were deleted.
     */
    public static void reconcileActiveNotifications(Context context) {
        if (context == null) return;
        try {
            SharedPreferences storage = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String rawJson = storage.getString("dailyWirdSettings_v2", null);
            if (rawJson == null || rawJson.trim().isEmpty()) {
                cancelActiveWirdNotifications(context);
                return;
            }

            JSONObject root = new JSONObject(rawJson);
            List<ProfileEntry> ordered = getOrderedProfiles(root);
            if (ordered.isEmpty()) {
                cancelActiveWirdNotifications(context);
                return;
            }

            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            Set<String> eligibleProfileIds = new HashSet<>();
            for (ProfileEntry entry : ordered) {
                boolean eligibleMorning = evaluateProfile(storage, entry, false) != null;
                boolean eligibleEvening = evaluateProfile(storage, entry, true) != null;
                if (!eligibleMorning && !eligibleEvening) {
                    nm.cancel(entry.morningNotifId);
                    nm.cancel(entry.eveningNotifId);
                } else {
                    eligibleProfileIds.add(entry.id);
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    StatusBarNotification[] active = nm.getActiveNotifications();
                    if (active != null) {
                        for (StatusBarNotification sbn : active) {
                            Notification notif = sbn.getNotification();
                            if (notif == null || notif.extras == null) continue;
                            String pId = notif.extras.getString(EXTRA_WIRD_PROFILE_ID);
                            if (pId != null && !pId.isEmpty() && !eligibleProfileIds.contains(pId)) {
                                nm.cancel(sbn.getId());
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            AlertsGroupHelper.updateGroupSummary(context, nm);
        } catch (Exception ignored) {}
    }

    private static List<ProfileEntry> getOrderedProfiles(JSONObject root) {
        List<ProfileEntry> ordered = new ArrayList<>();
        if (root == null) return ordered;

        JSONArray profiles = root.optJSONArray("profiles");
        if (profiles == null || profiles.length() == 0) return ordered;

        String activeId = root.optString("activeId", "");
        int activeIdx = 0;
        if (!activeId.isEmpty()) {
            for (int i = 0; i < profiles.length(); i++) {
                JSONObject p = profiles.optJSONObject(i);
                if (p != null && activeId.equals(p.optString("id"))) {
                    activeIdx = i;
                    break;
                }
            }
        }

        Set<Integer> usedNotifIds = new HashSet<>();
        usedNotifIds.add(MORNING_NOTIF_ID);
        usedNotifIds.add(EVENING_NOTIF_ID);
        usedNotifIds.add(9300);

        JSONObject activeObj = profiles.optJSONObject(activeIdx);
        if (activeObj != null) {
            String activeProfileId = activeObj.optString("id", "");
            if (activeProfileId.isEmpty()) {
                activeProfileId = "idx_" + activeIdx;
            }
            ordered.add(new ProfileEntry(activeObj, activeProfileId, true, MORNING_NOTIF_ID, EVENING_NOTIF_ID));
        }

        for (int i = 0; i < profiles.length(); i++) {
            if (i == activeIdx) continue;
            JSONObject p = profiles.optJSONObject(i);
            if (p == null) continue;

            String pId = p.optString("id", "");
            if (pId.isEmpty()) {
                pId = "idx_" + i;
            }

            int hashBucket = Math.abs(stableStringHash(pId)) % 400000;
            int morningId = EXTRA_USER_NOTIF_ID_BASE + (hashBucket * 2);
            while (usedNotifIds.contains(morningId) || usedNotifIds.contains(morningId + 1)) {
                morningId += 2;
            }
            int eveningId = morningId + 1;
            usedNotifIds.add(morningId);
            usedNotifIds.add(eveningId);

            ordered.add(new ProfileEntry(p, pId, false, morningId, eveningId));
        }

        return ordered;
    }

    private static int stableStringHash(String value) {
        if (value == null) return 0;
        int h = 0;
        for (int i = 0; i < value.length(); i++) {
            h = (31 * h) + value.charAt(i);
        }
        return h;
    }

    private static Set<String> parseProcessedIds(String jsonStr) {
        Set<String> result = new HashSet<>();
        if (jsonStr == null || jsonStr.trim().isEmpty()) return result;
        try {
            JSONArray arr = new JSONArray(jsonStr);
            for (int i = 0; i < arr.length(); i++) {
                String id = arr.optString(i, "");
                if (!id.isEmpty()) {
                    result.add(id);
                }
            }
        } catch (Exception ignored) {}
        return result;
    }

    private static void scheduleStepAlarm(Context context, boolean isEvening, Set<String> processedIds, long triggerAtMillis) {
        if (context == null) return;
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        JSONArray arr = new JSONArray();
        for (String id : processedIds) {
            arr.put(id);
        }

        Intent stepIntent = new Intent(context, DailyWirdAlarmReceiver.class);
        stepIntent.setAction(ACTION_WIRD_USER_STEP);
        stepIntent.putExtra(EXTRA_PERIOD, isEvening ? "evening" : "morning");
        stepIntent.putExtra(EXTRA_PROCESSED_IDS, arr.toString());

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        int requestCode = isEvening ? STEP_EVENING_REQUEST_CODE : STEP_MORNING_REQUEST_CODE;
        PendingIntent stepPi = PendingIntent.getBroadcast(context, requestCode, stepIntent, flags);

        Intent showIntent = new Intent(context, MainActivity.class);
        showIntent.putExtra("shortcut_target", "daily-wird");
        showIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent showPi = PendingIntent.getActivity(context, requestCode, showIntent, flags);

        try {
            // Use setAlarmClock for the 10-second inter-user step so Android Doze never throttles it
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, stepPi);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                AlarmManager.AlarmClockInfo alarmClockInfo = new AlarmManager.AlarmClockInfo(triggerAtMillis, showPi);
                am.setAlarmClock(alarmClockInfo, stepPi);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, stepPi);
            } else {
                am.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, stepPi);
            }
        } catch (SecurityException se) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, stepPi);
                } else {
                    am.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, stepPi);
                }
            } catch (Exception ignored) {}
        } catch (Exception ignored) {}
    }

    private static void cancelStepAlarm(Context context, boolean isEvening) {
        if (context == null) return;
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent stepIntent = new Intent(context, DailyWirdAlarmReceiver.class);
            stepIntent.setAction(ACTION_WIRD_USER_STEP);
            int flags = PendingIntent.FLAG_NO_CREATE;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            int requestCode = isEvening ? STEP_EVENING_REQUEST_CODE : STEP_MORNING_REQUEST_CODE;
            PendingIntent stepPi = PendingIntent.getBroadcast(context, requestCode, stepIntent, flags);
            if (stepPi != null) {
                am.cancel(stepPi);
                stepPi.cancel();
            }
        } catch (Exception ignored) {}
    }

    private static void cancelNotificationsForEntry(Context context, ProfileEntry entry) {
        if (context == null || entry == null) return;
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(entry.morningNotifId);
                nm.cancel(entry.eveningNotifId);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    try {
                        StatusBarNotification[] active = nm.getActiveNotifications();
                        if (active != null) {
                            for (StatusBarNotification sbn : active) {
                                Notification notif = sbn.getNotification();
                                if (notif != null && notif.extras != null &&
                                    entry.id.equals(notif.extras.getString(EXTRA_WIRD_PROFILE_ID))) {
                                    nm.cancel(sbn.getId());
                                }
                            }
                        }
                    } catch (Exception ignored) {}
                }
                AlertsGroupHelper.updateGroupSummary(context, nm);
            }
        } catch (Exception ignored) {}
    }

    /**
     * Inspects a single wird profile and returns notification payload if unread, or null if ineligible/completed
     */
    private static WirdNotificationPayload evaluateProfile(
        SharedPreferences storage,
        ProfileEntry entry,
        boolean isEvening
    ) {
        if (entry == null || entry.profile == null) return null;
        JSONObject profile = entry.profile;

        try {
            boolean isActive = profile.optBoolean("isActive", true);
            boolean reminderEnabled = profile.optBoolean("reminderEnabled", true);
            if (!isActive || !reminderEnabled) {
                return null;
            }

            // Check if user already marked today completed via lastCompletedDate
            String todayDateStr = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            String lastCompletedDate = profile.optString("lastCompletedDate", "");
            if (lastCompletedDate != null && lastCompletedDate.startsWith(todayDateStr)) {
                // Today's reading already finished! Do not notify today.
                return null;
            }

            String mode = profile.optString("mode", "days");
            int val = Math.max(1, profile.optInt("value", mode.equals("days") ? 30 : 20));
            int startPageOffset = profile.optInt("startPage", 1);
            int totalDays = mode.equals("days") ? val : (int) Math.ceil((double) TOTAL_QURAN_PAGES / val);

            JSONArray completedDaysJson = profile.optJSONArray("completedDays");
            Set<Integer> completedSet = new HashSet<>();
            if (completedDaysJson != null) {
                for (int i = 0; i < completedDaysJson.length(); i++) {
                    completedSet.add(completedDaysJson.getInt(i));
                }
            }
            int completedCount = completedSet.size();
            if (completedCount >= totalDays) {
                // Khatma already completed!
                return null;
            }

            // Calculate days elapsed since start date
            String startDateStr = profile.optString("startDate", todayDateStr);
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

            int expectedPastDays = Math.min(calendarDaysElapsed, totalDays);
            int missedDaysCount = Math.max(0, expectedPastDays - completedCount);

            int targetDayNumber = Math.min(completedCount + 1, totalDays);
            if (completedSet.contains(targetDayNumber)) {
                return null;
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

            // ACCURATE PROGRESS VERIFICATION:
            // Check if user has fully completed today's portion via lastPage
            int lastPageRead = profile.optInt("lastPage", 0);
            boolean isFullyCompleted = (lastPageRead >= todayEndPage && todayEndPage > 0);
            if (isFullyCompleted) {
                return null;
            }

            // User Name Formatting ("وباسم المستخدم")
            String rawName = profile.optString("name", "").trim();
            String appLang = storage.getString("app_language", "ar");
            boolean isEn = "en".equalsIgnoreCase(appLang);

            String formattedName;
            if (rawName.isEmpty() || rawName.matches("(?i)^(مستخدم|user)(\\s*\\d+)?$")) {
                formattedName = isEn ? "Qur'an Reader" : "صاحب القرآن";
            } else {
                formattedName = rawName;
            }

            // Format Date Range if missed days >= 2: e.g. "من 1 نوفمبر إلى 7 نوفمبر" or "from Nov 1 to Nov 7"
            String missedRangeStr = "";
            if (missedDaysCount >= 2) {
                try {
                    Calendar endCal = Calendar.getInstance();
                    endCal.setTime(todayDate);
                    endCal.add(Calendar.DAY_OF_YEAR, -1); // up to yesterday

                    Calendar startCal = Calendar.getInstance();
                    startCal.setTime(todayDate);
                    startCal.add(Calendar.DAY_OF_YEAR, -missedDaysCount);

                    String[] arMonths = {
                        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
                        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
                    };
                    String[] enMonths = {
                        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                    };

                    int sDay = startCal.get(Calendar.DAY_OF_MONTH);
                    int sMonth = startCal.get(Calendar.MONTH);
                    int eDay = endCal.get(Calendar.DAY_OF_MONTH);
                    int eMonth = endCal.get(Calendar.MONTH);

                    if (isEn) {
                        missedRangeStr = "from " + enMonths[sMonth] + " " + sDay + " to " + enMonths[eMonth] + " " + eDay;
                    } else {
                        missedRangeStr = "من يوم " + sDay + " " + arMonths[sMonth] + " إلى " + eDay + " " + arMonths[eMonth];
                    }
                } catch (Exception ignored) {}
            }

            String title;
            String message;

            if (isEn) {
                String prefix = "Dear " + formattedName + ": ";
                if (isEvening) {
                    if (missedDaysCount == 0) {
                        title = prefix + "Complete Today's Portion Before Sleep";
                        message = "The day is coming to a close and today's assigned portion awaits you.. Conclude your day with the Holy Qur'an before sleep.";
                    } else if (missedDaysCount == 1) {
                        title = prefix + "Catch Up Before Day's End";
                        message = "Evening reminder: Yesterday's portion and today's portion await you.. Make the seal of your night verses from the Holy Qur'an.";
                    } else {
                        title = prefix + "Blessed Opportunity Tonight";
                        String rangeText = !missedRangeStr.isEmpty() ? " (" + missedRangeStr + ")" : "";
                        message = "Do not let today's portion and your overdue portions" + rangeText + " pass unread.. Spend a few tranquil minutes catching up tonight.";
                    }
                } else {
                    if (missedDaysCount == 0) {
                        title = prefix + "Illuminate Your Day with the Qur'an";
                        message = "Gentle reminder for today's portion.. Blessed is the one who begins the day with the Qur'an. Open your Mushaf and read now.";
                    } else if (missedDaysCount == 1) {
                        title = prefix + "Gentle Reminder of the Holy Qur'an";
                        message = "Gentle reminder: Yesterday's portion and today's portion await you.. Read them together to maintain your blessed Khatma.";
                    } else {
                        title = prefix + "Eager for Your Return to the Qur'an";
                        String rangeText = !missedRangeStr.isEmpty() ? " (" + missedRangeStr + ")" : "";
                        message = "Today's portion and your overdue portions" + rangeText + " await you.. Open your Mushaf now and catch up on your blessed Khatma.";
                    }
                }
            } else {
                String prefix = "يا " + formattedName + ": ";
                if (isEvening) {
                    if (missedDaysCount == 0) {
                        title = prefix + "أكمل ورد اليوم قبل النوم";
                        message = "أوشك اليوم على الانقضاء وتذكيرك بورد اليوم.. اختم يومك بنور كتاب الله واقرأ وردك قبل النوم لتنعم بليل مبارك.";
                    } else if (missedDaysCount == 1) {
                        title = prefix + "تدارك وردك قبل نهاية اليوم";
                        message = "تذكير مسائي: تدارك ورد الأمس وورد اليوم.. اجعل مسك ختام ليلتك آيات من الذكر الحكيم واقرأهما الآن.";
                    } else {
                        title = prefix + "فرصة طيبة لاستدراك وردك الليلة";
                        String rangeText = !missedRangeStr.isEmpty() ? " (" + missedRangeStr + ")" : "";
                        message = "أوشك اليوم على الانتهاء، ولديك ورد اليوم والأوراد السابقة غير المقروءة" + rangeText + ".. بضع دقائق كفيلة باستدراك ما فاتك، افتح مصحفك الآن.";
                    }
                } else {
                    if (missedDaysCount == 0) {
                        title = prefix + "نور يومك بكتاب الله";
                        message = "تذكير بورد اليوم.. هنيئاً لمن جعل للقرآن نصيباً من يومه، افتح مصحفك واقرأ وردك الآن.";
                    } else if (missedDaysCount == 1) {
                        title = prefix + "تذكير طيب بورد القرآن الكريم";
                        message = "تذكير لطيف: تدارك ورد الأمس وورد اليوم.. اقرأهما معاً لتستمر في مسيرة ختمتك المباركة وتفيض عليك البركة.";
                    } else {
                        title = prefix + "مشتاقون لعودتك إلى كتاب الله";
                        String rangeText = !missedRangeStr.isEmpty() ? " (" + missedRangeStr + ")" : "";
                        message = "في انتظارك ورد اليوم والأوراد السابقة غير المقروءة" + rangeText + ".. لا تدع الأيام تمضي دون نور القرآن، افتح مصحفك واستدرك ما فاتك.";
                    }
                }
            }

            int notifId = isEvening ? entry.eveningNotifId : entry.morningNotifId;
            return new WirdNotificationPayload(notifId, title, message);
        } catch (Exception ignored) {
            return null;
        }
    }

    /**
     * Posts high-priority system phone notification with chime sound,
     * status bar icon (ic_stat_name at max size), and group GENERAL_ALERTS_CARD.
     */
    private void showWirdPhoneNotification(Context context, int notifId, String title, String message, String profileId) {
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
                NotificationVibrationHelper.configureChannelVibration(
                    channel,
                    NotificationVibrationHelper.ALERT_VIBRATION_PATTERN
                );
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

            Bundle extras = new Bundle();
            if (profileId != null && !profileId.isEmpty()) {
                extras.putString(EXTRA_WIRD_PROFILE_ID, profileId);
            }

            // Status Bar Notification Icon: Holy Quran on Rehal (Stand)
            int smallIconRes = R.drawable.ic_stat_name;
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(smallIconRes)
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
                .addExtras(extras)
                .setVibrate(NotificationVibrationHelper.ALERT_VIBRATION_PATTERN)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            if (soundUri != null) {
                builder.setSound(soundUri);
            }

            nm.notify(notifId, builder.build());
            AlertsGroupHelper.updateGroupSummary(context, nm);
            NotificationVibrationHelper.vibrateAlert(context);
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
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    try {
                        StatusBarNotification[] active = nm.getActiveNotifications();
                        if (active != null) {
                            for (StatusBarNotification sbn : active) {
                                int id = sbn.getId();
                                Notification notif = sbn.getNotification();
                                boolean hasWirdExtra = notif != null && notif.extras != null
                                    && notif.extras.containsKey(EXTRA_WIRD_PROFILE_ID);
                                if (hasWirdExtra || (id >= EXTRA_USER_NOTIF_ID_BASE && id <= 893200)) {
                                    nm.cancel(id);
                                }
                            }
                        }
                    } catch (Exception ignored) {}
                }
                AlertsGroupHelper.updateGroupSummary(context, nm);
            }
        } catch (Exception ignored) {}
    }
}
