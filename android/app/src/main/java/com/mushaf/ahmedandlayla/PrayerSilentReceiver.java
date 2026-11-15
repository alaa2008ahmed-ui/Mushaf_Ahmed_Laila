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
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;
import org.json.JSONArray;
import org.json.JSONObject;

public class PrayerSilentReceiver extends BroadcastReceiver {
    public static final String ACTION_START_SILENT = "com.mushaf.ahmedandlayla.ACTION_START_SILENT";
    public static final String ACTION_END_SILENT = "com.mushaf.ahmedandlayla.ACTION_END_SILENT";
    public static final String ACTION_IQAMA_ALERT = "com.mushaf.ahmedandlayla.ACTION_IQAMA_ALERT";
    public static final String ACTION_RESTORE_NOTIFICATION = "com.mushaf.ahmedandlayla.ACTION_RESTORE_NOTIFICATION";
    public static final String ACTION_UPDATE_NOTIFICATION = "com.mushaf.ahmedandlayla.ACTION_UPDATE_NOTIFICATION";

    public static final String EXTRA_PRAYER_NAME = "prayer_name";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";
    public static final String EXTRA_DURATION = "duration";
    public static final String EXTRA_WINDOW_ID = "window_id";
    public static final String EXTRA_NOTIF_ID = "notif_id";
    public static final String EXTRA_START_MILLIS = "start_millis";
    public static final String EXTRA_END_MILLIS = "end_millis";
    public static final String EXTRA_NOTIF_TITLE = "notif_title";
    public static final String EXTRA_NOTIF_BODY = "notif_body";
    public static final String EXTRA_PLAY_START_CHIME = "play_start_chime";
    public static final String EXTRA_PLAY_SOUND = "play_sound";
    public static final String EXTRA_IS_ARABIC = "is_arabic";

    public static final String PREFS_NAME = "PrayerSilentPrefs";
    public static final String KEY_ORIGINAL_RINGER_MODE = "original_ringer_mode";
    public static final String KEY_IS_SILENT_ACTIVE = "is_silent_active";
    public static final String KEY_USED_DND_FILTER = "used_dnd_filter";
    public static final String KEY_APPLIED_RINGER_MUTE = "applied_ringer_mute";
    public static final String KEY_HAS_SAVED_VOLUMES = "has_saved_audio_volumes";
    public static final String KEY_ORIGINAL_RING_VOL = "original_ring_volume";
    public static final String KEY_ORIGINAL_NOTIF_VOL = "original_notif_volume";
    public static final String KEY_ORIGINAL_SYSTEM_VOL = "original_system_volume";
    public static final String KEY_ORIGINAL_MUSIC_VOL = "original_music_volume";
    public static final String KEY_USER_MANUALLY_RESTORED = "user_manually_restored";
    public static final String KEY_LAST_ACTIVATION_TIME = "last_silent_activation_time";
    public static final String KEY_ACTIVE_WINDOW_ID = "active_window_id";
    public static final String KEY_ACTIVE_PRAYER_KEY = "active_prayer_key";
    public static final String KEY_ACTIVE_PRAYER_NAME = "active_prayer_name";
    public static final String KEY_ACTIVE_SILENT_START_MILLIS = "active_silent_start_millis";
    public static final String KEY_ACTIVE_SILENT_END_MILLIS = "active_silent_end_millis";
    public static final String KEY_RESTORED_WINDOW_START_MILLIS = "restored_window_start_millis";
    public static final String KEY_RESTORED_WINDOW_ID = "restored_window_id";
    public static final String KEY_LAST_HANDLED_START_MILLIS = "last_handled_start_millis";
    public static final String KEY_LAST_HANDLED_END_MILLIS = "last_handled_end_millis";
    public static final String KEY_SCHEDULED_WINDOWS = "scheduled_silent_windows";
    public static final String KEY_SCHEDULED_IQAMAS = "scheduled_iqama_alarms";

    public static final String CHANNEL_ID = "prayer_silent_v5_droplet_channel";
    public static final String SILENT_CHANNEL_ID = "prayer_silent_v4_silent_channel";
    public static final String IQAMA_CHANNEL_ID = "iqama_v5_droplet_channel";
    public static final String IQAMA_SILENT_CHANNEL_ID = "iqama_v4_silent_channel";

    private static final long ALARM_LOOKAHEAD_MS = 48L * 60L * 60L * 1000L; // 48 hours

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) return;
        String action = intent.getAction();
        if (action == null) return;

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            try {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Mushaf:AutoSilentWakeLock");
                wakeLock.acquire(10000);
            } catch (Exception ignored) {}
        }

        try {
            if (AudioManager.RINGER_MODE_CHANGED_ACTION.equals(action) || "android.media.RINGER_MODE_CHANGED".equals(action)) {
                handleRingerModeChanged(context);
                return;
            }

            if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
                "android.intent.action.BOOT_COMPLETED".equals(action) ||
                Intent.ACTION_TIME_CHANGED.equals(action) ||
                "android.intent.action.TIME_SET".equals(action) ||
                Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
                Intent.ACTION_DATE_CHANGED.equals(action)) {
                PersistentPrayerNotification.update(context);
                PrayerWidgetProvider.updateAllWidgets(context);
                DailyWirdAlarmReceiver.scheduleNextAlarms(context);
                AdhanAlarmReceiver.rescheduleSavedAlarms(context);
                rescheduleSavedIqamas(context);
                rescheduleSavedWindows(context);
                reconcileState(context);
                return;
            }

            if (ACTION_IQAMA_ALERT.equals(action)) {
                executeIqamaAlert(context, intent);
                rescheduleSavedIqamas(context);
                rescheduleSavedWindows(context);
                return;
            }

            if (ACTION_RESTORE_NOTIFICATION.equals(action) ||
                ACTION_UPDATE_NOTIFICATION.equals(action)) {
                PersistentPrayerNotification.update(context);
                PrayerWidgetProvider.updateAllWidgets(context);
                DailyWirdAlarmReceiver.scheduleNextAlarms(context);
                return;
            }

            // Ensure any lingering legacy auto-silent notifications (ID 9401 / 9402) are cancelled
            cancelNotificationById(context, 9401);
            cancelNotificationById(context, 9402);

            String prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME);
            if (prayerName == null || prayerName.isEmpty()) prayerName = "الصلاة";
            String prayerKey = intent.getStringExtra(EXTRA_PRAYER_KEY);
            if (prayerKey == null) prayerKey = "";

            SharedPreferences langPrefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String appLang = langPrefs.getString("app_language", "ar");
            boolean isArabic = intent.hasExtra(EXTRA_IS_ARABIC)
                ? intent.getBooleanExtra(EXTRA_IS_ARABIC, !"en".equalsIgnoreCase(appLang))
                : !"en".equalsIgnoreCase(appLang);

            int windowId = intent.getIntExtra(EXTRA_WINDOW_ID, 7001);
            int durationMinutes = intent.getIntExtra(EXTRA_DURATION, 15);
            if (durationMinutes <= 0) durationMinutes = 15;
            long startMillis = intent.getLongExtra(EXTRA_START_MILLIS, 0L);
            long endMillis = intent.getLongExtra(EXTRA_END_MILLIS, 0L);
            if (endMillis <= 0L && startMillis > 0L) {
                endMillis = startMillis + ((long) durationMinutes * 60000L);
            }

            String notifTitle = intent.getStringExtra(EXTRA_NOTIF_TITLE);
            String notifBody = intent.getStringExtra(EXTRA_NOTIF_BODY);
            boolean playStartChime = intent.getBooleanExtra(EXTRA_PLAY_START_CHIME, false);

            if (ACTION_START_SILENT.equals(action)) {
                executeStartWindow(
                    context, windowId, prayerKey, prayerName, durationMinutes,
                    startMillis, endMillis, notifTitle, notifBody, playStartChime, isArabic
                );
                rescheduleSavedWindows(context);
            } else if (ACTION_END_SILENT.equals(action)) {
                executeEndWindow(
                    context, windowId, prayerKey, prayerName, durationMinutes,
                    startMillis, endMillis, isArabic
                );
                rescheduleSavedWindows(context);
            }
        } finally {
            if (wakeLock != null && wakeLock.isHeld()) {
                try {
                    wakeLock.release();
                } catch (Exception ignored) {}
            }
        }
    }

    /**
     * Invoked via reflection from Capacitor TimedNotificationPublisher when a scheduled
     * auto-silent start (7000..7999) or end (8000..8999) local notification fires.
     * Returns true to indicate PrayerSilentReceiver handled the window and its notification
     * (either posted atomically after muting/unmuting, or suppressed if restored/duplicate).
     */
    public static synchronized boolean handleLocalNotificationTrigger(Context context, int notifId, boolean isStart) {
        if (context == null) return false;

        try {
            cancelNotificationById(context, 9401);
            cancelNotificationById(context, 9402);

            int baseId = isStart
                ? (notifId >= 7500 && notifId < 8000 ? notifId - 500 : notifId)
                : (notifId >= 8500 && notifId < 9000 ? notifId - 1500 : (notifId >= 8000 ? notifId - 1000 : notifId));

            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String savedJson = prefs.getString(KEY_SCHEDULED_WINDOWS, null);
            JSONObject matched = findSavedWindowById(savedJson, baseId);

            if (matched == null) {
                // If user disabled auto-silent or cleared windows, suppress stale notification
                if (!isStart) {
                    boolean isSilentActive = prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false);
                    if (isSilentActive) {
                        int activeWinId = prefs.getInt(KEY_ACTIVE_WINDOW_ID, -1);
                        String activeKey = prefs.getString(KEY_ACTIVE_PRAYER_KEY, "");
                        String activeName = prefs.getString(KEY_ACTIVE_PRAYER_NAME, "الصلاة");
                        long activeStart = prefs.getLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L);
                        long activeEnd = prefs.getLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L);
                        boolean isAr = getAppIsArabic(context);
                        executeEndWindow(context, activeWinId > 0 ? activeWinId : baseId, activeKey, activeName, 15, activeStart, activeEnd, isAr);
                    }
                }
                return true;
            }

            String prayerKey = matched.optString("prayerKey", "");
            String prayerName = matched.optString("prayerName", "الصلاة");
            long startMillis = matched.optLong("startMillis", 0L);
            int durationMinutes = matched.optInt("durationMinutes", 15);
            if (durationMinutes <= 0) durationMinutes = 15;
            long endMillis = startMillis + ((long) durationMinutes * 60000L);
            String title = matched.optString("title", "");
            String body = matched.optString("body", "");
            boolean shouldPlayChime = matched.optBoolean("shouldPlayChime", false);
            boolean isArabic = matched.optBoolean("isArabic", getAppIsArabic(context));

            if (isStart) {
                executeStartWindow(
                    context, baseId, prayerKey, prayerName, durationMinutes,
                    startMillis, endMillis, title, body, shouldPlayChime, isArabic
                );
            } else {
                executeEndWindow(
                    context, baseId, prayerKey, prayerName, durationMinutes,
                    startMillis, endMillis, isArabic
                );
            }
            rescheduleSavedWindows(context);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private static synchronized void executeStartWindow(
        Context context,
        int windowId,
        String prayerKey,
        String prayerName,
        int durationMinutes,
        long startMillis,
        long endMillis,
        String notifTitle,
        String notifBody,
        boolean playStartChime,
        boolean isArabic
    ) {
        if (context == null) return;
        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        if (audioManager == null) return;

        long now = System.currentTimeMillis();
        if (endMillis <= 0L && startMillis > 0L) {
            endMillis = startMillis + ((long) durationMinutes * 60000L);
        }
        if (endMillis > 0L && now >= endMillis) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        long restoredStart = prefs.getLong(KEY_RESTORED_WINDOW_START_MILLIS, -1L);
        int restoredWindowId = prefs.getInt(KEY_RESTORED_WINDOW_ID, -1);
        long lastHandledStart = prefs.getLong(KEY_LAST_HANDLED_START_MILLIS, -1L);

        // Never re-mute if manually restored or already handled for this exact window
        if (startMillis > 0L) {
            if (restoredStart == startMillis || lastHandledStart == startMillis) {
                return;
            }
        } else if (windowId > 0) {
            if (restoredWindowId == windowId) {
                return;
            }
        }

        boolean alreadyActive = prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false);
        long existingActiveStart = prefs.getLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L);
        long existingActiveEnd = prefs.getLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L);
        if (alreadyActive && startMillis > 0L && existingActiveStart == startMillis) {
            return;
        }

        // Clear stale active-session state from a previous expired or unmuted prayer window
        if (alreadyActive && (!isDeviceEffectivelyMuted(context, audioManager) || (existingActiveEnd > 0L && now >= existingActiveEnd))) {
            prefs.edit()
                .putBoolean(KEY_IS_SILENT_ACTIVE, false)
                .putBoolean(KEY_USED_DND_FILTER, false)
                .putBoolean(KEY_APPLIED_RINGER_MUTE, false)
                .putBoolean(KEY_HAS_SAVED_VOLUMES, false)
                .putInt(KEY_ACTIVE_WINDOW_ID, -1)
                .putString(KEY_ACTIVE_PRAYER_KEY, "")
                .putString(KEY_ACTIVE_PRAYER_NAME, "")
                .putLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L)
                .putLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L)
                .apply();
            alreadyActive = false;
        }

        if (!alreadyActive) {
            int currentMode = audioManager.getRingerMode();
            prefs.edit()
                .putInt(KEY_ORIGINAL_RINGER_MODE, currentMode)
                .putBoolean(KEY_USED_DND_FILTER, false)
                .putBoolean(KEY_APPLIED_RINGER_MUTE, false)
                .putBoolean(KEY_HAS_SAVED_VOLUMES, false)
                .apply();
        }

        // Mute phone synchronously (with settle wait + DND fallback for locked screen / OEMs)
        boolean isActuallyMuted = applySilentMode(context, audioManager);
        if (!isActuallyMuted) {
            // Even if ringer mode couldn't transition (rare OEM restriction), do not falsely show active silent
            return;
        }

        long effectiveStart = startMillis > 0L ? startMillis : now;
        long effectiveEnd = endMillis > 0L ? endMillis : (effectiveStart + ((long) durationMinutes * 60000L));
        int effectiveWindowId = windowId > 0 ? windowId : 7001;

        prefs.edit()
            .putBoolean(KEY_IS_SILENT_ACTIVE, true)
            .putBoolean(KEY_USER_MANUALLY_RESTORED, false)
            .putLong(KEY_RESTORED_WINDOW_START_MILLIS, -1L)
            .putInt(KEY_RESTORED_WINDOW_ID, -1)
            .putLong(KEY_LAST_HANDLED_START_MILLIS, effectiveStart)
            .putLong(KEY_LAST_ACTIVATION_TIME, System.currentTimeMillis())
            .putInt(KEY_ACTIVE_WINDOW_ID, effectiveWindowId)
            .putString(KEY_ACTIVE_PRAYER_KEY, prayerKey != null ? prayerKey : "")
            .putString(KEY_ACTIVE_PRAYER_NAME, prayerName != null ? prayerName : "الصلاة")
            .putLong(KEY_ACTIVE_SILENT_START_MILLIS, effectiveStart)
            .putLong(KEY_ACTIVE_SILENT_END_MILLIS, effectiveEnd)
            .apply();

        if (notifTitle == null || notifTitle.trim().isEmpty()) {
            notifTitle = isArabic
                ? ("تم تفعيل وضع الصامت (صلاة " + prayerName + ")")
                : ("Silent mode activated (" + prayerName + " Prayer)");
        }
        if (notifBody == null || notifBody.trim().isEmpty()) {
            notifBody = isArabic
                ? ("تم كتم صوت الهاتف تلقائياً لمدة " + durationMinutes + " دقيقة لأداء صلاة " + prayerName)
                : ("Device muted automatically for " + durationMinutes + " minutes for " + prayerName + " prayer.");
        }

        showNotification(context, effectiveWindowId, notifTitle, notifBody, playStartChime, isArabic);

        // Guarantee END alarm is armed for exact endMillis
        scheduleSingleEndAlarm(context, effectiveWindowId, prayerKey, prayerName, durationMinutes, effectiveStart, effectiveEnd, isArabic);

        PersistentPrayerNotification.update(context);
        AutoSilentPlugin.notifySilentStateChanged(context);
    }

    private static synchronized void executeEndWindow(
        Context context,
        int windowId,
        String prayerKey,
        String prayerName,
        int durationMinutes,
        long startMillis,
        long endMillis,
        boolean isArabic
    ) {
        if (context == null) return;
        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        if (audioManager == null) return;

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean isSilentActive = prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false);
        boolean manuallyRestored = prefs.getBoolean(KEY_USER_MANUALLY_RESTORED, false);
        long restoredStart = prefs.getLong(KEY_RESTORED_WINDOW_START_MILLIS, -1L);
        int restoredWinId = prefs.getInt(KEY_RESTORED_WINDOW_ID, -1);
        long activeStart = prefs.getLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L);
        long lastHandledEnd = prefs.getLong(KEY_LAST_HANDLED_END_MILLIS, -1L);

        // Prevent duplicate end execution for the same window
        if (endMillis > 0L && lastHandledEnd == endMillis) {
            return;
        }

        // If a different window is currently active, ignore this stale end alarm
        if (isSilentActive && activeStart > 0L && startMillis > 0L && activeStart != startMillis) {
            return;
        }

        boolean deviceStillMuted = isDeviceEffectivelyMuted(context, audioManager);
        boolean restoredThisWindow = manuallyRestored
            || (startMillis > 0L && restoredStart == startMillis)
            || (windowId > 0 && restoredWinId == windowId);

        boolean usedDndFilter = prefs.getBoolean(KEY_USED_DND_FILTER, false);
        prefs.edit()
            .putBoolean(KEY_IS_SILENT_ACTIVE, false)
            .putBoolean(KEY_USED_DND_FILTER, false)
            .putBoolean(KEY_APPLIED_RINGER_MUTE, false)
            .putBoolean(KEY_USER_MANUALLY_RESTORED, false)
            .putLong(KEY_LAST_HANDLED_END_MILLIS, endMillis > 0L ? endMillis : System.currentTimeMillis())
            .putInt(KEY_ACTIVE_WINDOW_ID, -1)
            .putString(KEY_ACTIVE_PRAYER_KEY, "")
            .putString(KEY_ACTIVE_PRAYER_NAME, "")
            .putLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L)
            .putLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L)
            .apply();

        if (windowId > 0) {
            cancelNotificationById(context, windowId);
        }

        // If user already manually restored sound or device is already unmuted,
        // DO NOT play chime and DO NOT post end-of-silent notification.
        if (restoredThisWindow || !isSilentActive || (!deviceStillMuted && !usedDndFilter)) {
            PersistentPrayerNotification.update(context);
            AutoSilentPlugin.notifySilentStateChanged(context);
            return;
        }

        int originalMode = prefs.getInt(KEY_ORIGINAL_RINGER_MODE, AudioManager.RINGER_MODE_NORMAL);
        restoreRingerMode(context, audioManager, originalMode);

        int endNotifId = windowId > 0
            ? (windowId >= 7000 && windowId < 8000 ? windowId + 1000 : windowId)
            : 8001;
        String safePrayerName = (prayerName != null && !prayerName.isEmpty()) ? prayerName : "الصلاة";
        String notifTitle = isArabic
            ? ("تم إنهاء وضع الصامت (صلاة " + safePrayerName + ")")
            : ("Silent mode ended (" + safePrayerName + " Prayer)");
        String notifBody = isArabic
            ? ("تم إعادة تفعيل صوت الهاتف والوسائط بعد انتهاء صلاة " + safePrayerName + " تقبل الله منا ومنكم")
            : ("Device sound and media restored after " + safePrayerName + " prayer. May Allah accept our prayers.");

        showNotification(context, endNotifId, notifTitle, notifBody, true, isArabic);
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            playChime(context);
        }

        PersistentPrayerNotification.update(context);
        AutoSilentPlugin.notifySilentStateChanged(context);
    }

    /**
     * Handles real-time OS ringer mode changes (e.g., user toggles Sound ON via Quick Settings or volume buttons).
     */
    public static synchronized void handleRingerModeChanged(Context context) {
        if (context == null) return;
        try {
            AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            if (audioManager == null) return;
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean isSilentActive = prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false);
            long activationTime = prefs.getLong(KEY_LAST_ACTIVATION_TIME, 0L);
            boolean appliedRingerMute = prefs.getBoolean(KEY_APPLIED_RINGER_MUTE, false);
            boolean usedDndFilter = prefs.getBoolean(KEY_USED_DND_FILTER, false);
            if (isSilentActive && (System.currentTimeMillis() - activationTime > 1500)) {
                boolean userUnmutedRinger = appliedRingerMute && audioManager.getRingerMode() == AudioManager.RINGER_MODE_NORMAL;
                if (userUnmutedRinger || !isDeviceEffectivelyMuted(context, audioManager)) {
                    long activeStart = prefs.getLong(KEY_ACTIVE_SILENT_START_MILLIS, -1L);
                    int activeWinId = prefs.getInt(KEY_ACTIVE_WINDOW_ID, -1);

                    if (userUnmutedRinger && usedDndFilter && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        try {
                            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                            if (nm != null && nm.isNotificationPolicyAccessGranted()
                                && nm.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_ALL) {
                                nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL);
                            }
                        } catch (Exception ignored) {}
                    }
                    restoreSavedAudioVolumes(context, audioManager, AudioManager.RINGER_MODE_NORMAL);

                    prefs.edit()
                        .putBoolean(KEY_IS_SILENT_ACTIVE, false)
                        .putBoolean(KEY_USED_DND_FILTER, false)
                        .putBoolean(KEY_APPLIED_RINGER_MUTE, false)
                        .putBoolean(KEY_HAS_SAVED_VOLUMES, false)
                        .putBoolean(KEY_USER_MANUALLY_RESTORED, true)
                        .putLong(KEY_RESTORED_WINDOW_START_MILLIS, activeStart)
                        .putInt(KEY_RESTORED_WINDOW_ID, activeWinId)
                        .putInt(KEY_ACTIVE_WINDOW_ID, -1)
                        .putString(KEY_ACTIVE_PRAYER_KEY, "")
                        .putString(KEY_ACTIVE_PRAYER_NAME, "")
                        .putLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L)
                        .putLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L)
                        .apply();

                    if (activeWinId > 0) {
                        cancelNotificationById(context, activeWinId);
                    }
                    PersistentPrayerNotification.update(context);
                    AutoSilentPlugin.notifySilentStateChanged(context);
                    return;
                }
            }
            AutoSilentPlugin.notifySilentStateChanged(context);
        } catch (Exception ignored) {}
    }

    /**
     * Reconciles stored silent flags with real hardware ringer state and active scheduled windows:
     * - If an active session passed its end time, ends it properly (restoring sound & showing end notification).
     * - If device hardware ringer is NORMAL (user unmuted outside app), marks manually restored & clears banner.
     * - If a scheduled window is currently in progress and has never been started or restored, starts it once.
     */
    public static synchronized void reconcileState(Context context) {
        if (context == null) return;
        try {
            AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean isSilentActive = prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false);
            long now = System.currentTimeMillis();

            if (isSilentActive) {
                long activationTime = prefs.getLong(KEY_LAST_ACTIVATION_TIME, 0L);
                long activeStart = prefs.getLong(KEY_ACTIVE_SILENT_START_MILLIS, -1L);
                long activeEnd = prefs.getLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L);
                int activeWinId = prefs.getInt(KEY_ACTIVE_WINDOW_ID, -1);
                String activeKey = prefs.getString(KEY_ACTIVE_PRAYER_KEY, "");
                String activeName = prefs.getString(KEY_ACTIVE_PRAYER_NAME, "الصلاة");
                boolean appliedRingerMute = prefs.getBoolean(KEY_APPLIED_RINGER_MUTE, false);
                boolean usedDndFilter = prefs.getBoolean(KEY_USED_DND_FILTER, false);

                // 1. If device hardware ringer is NORMAL (user turned sound ON outside app or DND wasn't active), mark manually restored
                boolean userUnmutedRinger = audioManager != null && appliedRingerMute && audioManager.getRingerMode() == AudioManager.RINGER_MODE_NORMAL;
                if (audioManager != null && (now - activationTime > 1500) && (userUnmutedRinger || !isDeviceEffectivelyMuted(context, audioManager))) {
                    if (userUnmutedRinger && usedDndFilter && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        try {
                            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                            if (nm != null && nm.isNotificationPolicyAccessGranted()
                                && nm.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_ALL) {
                                nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL);
                            }
                        } catch (Exception ignored) {}
                    }
                    restoreSavedAudioVolumes(context, audioManager, AudioManager.RINGER_MODE_NORMAL);

                    prefs.edit()
                        .putBoolean(KEY_IS_SILENT_ACTIVE, false)
                        .putBoolean(KEY_USED_DND_FILTER, false)
                        .putBoolean(KEY_APPLIED_RINGER_MUTE, false)
                        .putBoolean(KEY_HAS_SAVED_VOLUMES, false)
                        .putBoolean(KEY_USER_MANUALLY_RESTORED, true)
                        .putLong(KEY_RESTORED_WINDOW_START_MILLIS, activeStart)
                        .putInt(KEY_RESTORED_WINDOW_ID, activeWinId)
                        .putInt(KEY_ACTIVE_WINDOW_ID, -1)
                        .putString(KEY_ACTIVE_PRAYER_KEY, "")
                        .putString(KEY_ACTIVE_PRAYER_NAME, "")
                        .putLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L)
                        .putLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L)
                        .apply();
                    if (activeWinId > 0) {
                        cancelNotificationById(context, activeWinId);
                    }
                    return;
                }

                // 1b. If active via DND fallback while screen was locked and Quick Settings ringer remained NORMAL,
                //     attempt to sync RINGER_MODE_SILENT cleanly now (provided window hasn't expired)
                if (audioManager != null && !appliedRingerMute && audioManager.getRingerMode() == AudioManager.RINGER_MODE_NORMAL
                    && (activeEnd <= 0L || now < activeEnd)) {
                    try {
                        prefs.edit().putLong(KEY_LAST_ACTIVATION_TIME, System.currentTimeMillis()).apply();
                        muteAudioStreams(audioManager, false);
                        boolean silentSet = false;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                            if (nm != null && nm.isNotificationPolicyAccessGranted()) {
                                silentSet = forceRingerModeSilent(audioManager, prefs);
                                if (!silentSet && usedDndFilter && nm.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_ALL) {
                                    try {
                                        nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL);
                                        Thread.sleep(100);
                                        silentSet = forceRingerModeSilent(audioManager, prefs);
                                        if (!silentSet) {
                                            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALARMS);
                                        }
                                    } catch (Exception ignored) {}
                                }
                            }
                        } else {
                            silentSet = forceRingerModeSilent(audioManager, prefs);
                        }
                        if (!silentSet && audioManager.getRingerMode() == AudioManager.RINGER_MODE_NORMAL) {
                            audioManager.setRingerMode(AudioManager.RINGER_MODE_VIBRATE);
                            waitForMutedState(audioManager, 5);
                        }
                        if (audioManager.getRingerMode() != AudioManager.RINGER_MODE_NORMAL) {
                            boolean dndStillActive = false;
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                NotificationManager nmCheck = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                                dndStillActive = nmCheck != null && nmCheck.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_ALL;
                            }
                            prefs.edit()
                                .putBoolean(KEY_APPLIED_RINGER_MUTE, true)
                                .putBoolean(KEY_USED_DND_FILTER, usedDndFilter && dndStillActive)
                                .putLong(KEY_LAST_ACTIVATION_TIME, System.currentTimeMillis())
                                .apply();
                        }
                    } catch (Exception ignored) {}
                }

                // 2. If the window end time already passed (> 2s grace), properly end the session & restore sound
                if (activeEnd > 0L && now >= activeEnd + 2000L) {
                    int durationMins = (activeStart > 0L && activeEnd > activeStart)
                        ? (int) Math.max(1L, (activeEnd - activeStart) / 60000L)
                        : 15;
                    executeEndWindow(
                        context, activeWinId > 0 ? activeWinId : 7001,
                        activeKey, activeName, durationMins,
                        activeStart, activeEnd, getAppIsArabic(context)
                    );
                }
                return;
            }

            // 3. No silent session currently active: check if a scheduled window is currently in progress
            //    and was neither handled nor manually restored (catches missed alarms on app resume / boot).
            String savedJson = prefs.getString(KEY_SCHEDULED_WINDOWS, null);
            if (savedJson == null || savedJson.trim().isEmpty()) return;

            long restoredStart = prefs.getLong(KEY_RESTORED_WINDOW_START_MILLIS, -1L);
            int restoredWinId = prefs.getInt(KEY_RESTORED_WINDOW_ID, -1);
            long lastHandledStart = prefs.getLong(KEY_LAST_HANDLED_START_MILLIS, -1L);

            JSONArray arr = new JSONArray(savedJson);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject item = arr.optJSONObject(i);
                if (item == null) continue;
                int id = item.optInt("id", 0);
                long startMillis = item.optLong("startMillis", 0L);
                int durationMinutes = item.optInt("durationMinutes", 15);
                if (durationMinutes <= 0) durationMinutes = 15;
                long endMillis = startMillis + ((long) durationMinutes * 60000L);

                if (id > 0 && startMillis > 0L && now >= startMillis && now < endMillis) {
                    if (restoredStart == startMillis || restoredWinId == id || lastHandledStart == startMillis) {
                        break;
                    }
                    executeStartWindow(
                        context,
                        id,
                        item.optString("prayerKey", ""),
                        item.optString("prayerName", "الصلاة"),
                        durationMinutes,
                        startMillis,
                        endMillis,
                        item.optString("title", ""),
                        item.optString("body", ""),
                        item.optBoolean("shouldPlayChime", false),
                        item.optBoolean("isArabic", getAppIsArabic(context))
                    );
                    break;
                }
            }
        } catch (Exception ignored) {}
    }

    /**
     * Called when the user taps "استعادة الصوت الآن" in the app.
     */
    public static synchronized void manualRestore(Context context, long requestedStartMillis, int requestedWindowId) {
        if (context == null) return;
        try {
            AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            if (am != null) {
                restoreRingerMode(context, am, AudioManager.RINGER_MODE_NORMAL);
            }

            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            long activeStart = prefs.getLong(KEY_ACTIVE_SILENT_START_MILLIS, -1L);
            int activeWinId = prefs.getInt(KEY_ACTIVE_WINDOW_ID, -1);

            long restoredStart = requestedStartMillis > 0L ? requestedStartMillis : activeStart;
            int restoredWinId = requestedWindowId > 0 ? requestedWindowId : activeWinId;

            prefs.edit()
                .putBoolean(KEY_IS_SILENT_ACTIVE, false)
                .putBoolean(KEY_USED_DND_FILTER, false)
                .putBoolean(KEY_APPLIED_RINGER_MUTE, false)
                .putBoolean(KEY_HAS_SAVED_VOLUMES, false)
                .putBoolean(KEY_USER_MANUALLY_RESTORED, true)
                .putLong(KEY_RESTORED_WINDOW_START_MILLIS, restoredStart)
                .putInt(KEY_RESTORED_WINDOW_ID, restoredWinId)
                .putInt(KEY_ACTIVE_WINDOW_ID, -1)
                .putString(KEY_ACTIVE_PRAYER_KEY, "")
                .putString(KEY_ACTIVE_PRAYER_NAME, "")
                .putLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L)
                .putLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L)
                .apply();

            if (activeWinId > 0) {
                cancelNotificationById(context, activeWinId);
            }
            if (requestedWindowId > 0 && requestedWindowId != activeWinId) {
                cancelNotificationById(context, requestedWindowId);
            }

            PersistentPrayerNotification.update(context);
            AutoSilentPlugin.notifySilentStateChanged(context);
        } catch (Exception ignored) {}
    }

    public static synchronized void scheduleWindows(Context context, JSONArray windows) {
        if (context == null) return;
        reconcileState(context);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        boolean isSilentActive = prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false);
        if (isSilentActive) {
            long activeStart = prefs.getLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L);
            int activeWinId = prefs.getInt(KEY_ACTIVE_WINDOW_ID, -1);
            boolean stillPresent = false;
            if (windows != null) {
                for (int i = 0; i < windows.length(); i++) {
                    JSONObject item = windows.optJSONObject(i);
                    if (item == null) continue;
                    long s = item.optLong("startMillis", 0L);
                    int id = item.optInt("id", -1);
                    if ((activeStart > 0L && s == activeStart) || (activeWinId > 0 && id == activeWinId)) {
                        stillPresent = true;
                        break;
                    }
                }
            }
            if (!stillPresent) {
                AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
                if (am != null) {
                    int originalMode = prefs.getInt(KEY_ORIGINAL_RINGER_MODE, AudioManager.RINGER_MODE_NORMAL);
                    restoreRingerMode(context, am, originalMode);
                }
                prefs.edit()
                    .putBoolean(KEY_IS_SILENT_ACTIVE, false)
                    .putBoolean(KEY_USED_DND_FILTER, false)
                    .putBoolean(KEY_APPLIED_RINGER_MUTE, false)
                    .putBoolean(KEY_HAS_SAVED_VOLUMES, false)
                    .putBoolean(KEY_USER_MANUALLY_RESTORED, false)
                    .putInt(KEY_ACTIVE_WINDOW_ID, -1)
                    .putString(KEY_ACTIVE_PRAYER_KEY, "")
                    .putString(KEY_ACTIVE_PRAYER_NAME, "")
                    .putLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L)
                    .putLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L)
                    .apply();
                if (activeWinId > 0) {
                    cancelNotificationById(context, activeWinId);
                }
                PersistentPrayerNotification.update(context);
                AutoSilentPlugin.notifySilentStateChanged(context);
            }
        }

        cancelAllScheduledWindowAlarms(context);
        if (windows == null || windows.length() == 0) {
            prefs.edit().remove(KEY_SCHEDULED_WINDOWS).apply();
            return;
        }

        prefs.edit().putString(KEY_SCHEDULED_WINDOWS, windows.toString()).apply();
        scheduleWindowsFromJsonArray(context, windows);
        reconcileState(context);
    }

    public static synchronized void cancelAllWindows(Context context) {
        if (context == null) return;
        cancelAllScheduledWindowAlarms(context);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean wasActive = prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false);
        int activeWinId = prefs.getInt(KEY_ACTIVE_WINDOW_ID, -1);
        long activeStart = prefs.getLong(KEY_ACTIVE_SILENT_START_MILLIS, -1L);
        int originalMode = prefs.getInt(KEY_ORIGINAL_RINGER_MODE, AudioManager.RINGER_MODE_NORMAL);

        if (wasActive) {
            AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            if (am != null) {
                restoreRingerMode(context, am, originalMode);
            }
        }

        prefs.edit()
            .remove(KEY_SCHEDULED_WINDOWS)
            .putBoolean(KEY_IS_SILENT_ACTIVE, false)
            .putBoolean(KEY_USED_DND_FILTER, false)
            .putBoolean(KEY_APPLIED_RINGER_MUTE, false)
            .putBoolean(KEY_HAS_SAVED_VOLUMES, false)
            .putBoolean(KEY_USER_MANUALLY_RESTORED, wasActive)
            .putLong(KEY_RESTORED_WINDOW_START_MILLIS, wasActive ? activeStart : -1L)
            .putInt(KEY_RESTORED_WINDOW_ID, wasActive ? activeWinId : -1)
            .putInt(KEY_ACTIVE_WINDOW_ID, -1)
            .putString(KEY_ACTIVE_PRAYER_KEY, "")
            .putString(KEY_ACTIVE_PRAYER_NAME, "")
            .putLong(KEY_ACTIVE_SILENT_START_MILLIS, 0L)
            .putLong(KEY_ACTIVE_SILENT_END_MILLIS, 0L)
            .apply();

        if (activeWinId > 0) {
            cancelNotificationById(context, activeWinId);
        }

        PersistentPrayerNotification.update(context);
        AutoSilentPlugin.notifySilentStateChanged(context);
    }

    public static synchronized void rescheduleSavedWindows(Context context) {
        if (context == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String savedJson = prefs.getString(KEY_SCHEDULED_WINDOWS, null);
        if (savedJson == null || savedJson.trim().isEmpty()) return;

        try {
            JSONArray arr = new JSONArray(savedJson);
            scheduleWindowsFromJsonArray(context, arr);
        } catch (Exception ignored) {}
    }

    private static JSONObject findSavedWindowById(String savedJson, int windowId) {
        if (savedJson == null || savedJson.trim().isEmpty() || windowId <= 0) return null;
        try {
            JSONArray arr = new JSONArray(savedJson);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject item = arr.optJSONObject(i);
                if (item != null && item.optInt("id", -1) == windowId) {
                    return item;
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private static boolean getAppIsArabic(Context context) {
        try {
            SharedPreferences langPrefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String appLang = langPrefs.getString("app_language", "ar");
            return !"en".equalsIgnoreCase(appLang);
        } catch (Exception e) {
            return true;
        }
    }

    private static void cancelAllScheduledWindowAlarms(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String savedJson = prefs.getString(KEY_SCHEDULED_WINDOWS, null);
        if (savedJson == null || savedJson.trim().isEmpty()) return;

        try {
            JSONArray arr = new JSONArray(savedJson);
            int flags = PendingIntent.FLAG_NO_CREATE;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            for (int i = 0; i < arr.length(); i++) {
                JSONObject item = arr.optJSONObject(i);
                if (item == null) continue;
                int id = item.optInt("id", -1);
                if (id <= 0) continue;

                Intent startIntent = new Intent(context, PrayerSilentReceiver.class);
                startIntent.setAction(ACTION_START_SILENT);
                PendingIntent startPi = PendingIntent.getBroadcast(context, id * 2, startIntent, flags);
                if (startPi != null) {
                    am.cancel(startPi);
                    startPi.cancel();
                }

                Intent endIntent = new Intent(context, PrayerSilentReceiver.class);
                endIntent.setAction(ACTION_END_SILENT);
                PendingIntent endPi = PendingIntent.getBroadcast(context, id * 2 + 1, endIntent, flags);
                if (endPi != null) {
                    am.cancel(endPi);
                    endPi.cancel();
                }
            }
        } catch (Exception ignored) {}
    }

    private static void scheduleWindowsFromJsonArray(Context context, JSONArray windows) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null || windows == null) return;

        long now = System.currentTimeMillis();
        long lookaheadCutoff = now + ALARM_LOOKAHEAD_MS;
        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        long restoredStart = prefs.getLong(KEY_RESTORED_WINDOW_START_MILLIS, -1L);
        long lastHandledStart = prefs.getLong(KEY_LAST_HANDLED_START_MILLIS, -1L);

        for (int i = 0; i < windows.length(); i++) {
            JSONObject item = windows.optJSONObject(i);
            if (item == null) continue;

            int id = item.optInt("id", 0);
            if (id <= 0) continue;
            String prayerKey = item.optString("prayerKey", "");
            String prayerName = item.optString("prayerName", "الصلاة");
            long startMillis = item.optLong("startMillis", 0L);
            int durationMinutes = item.optInt("durationMinutes", 15);
            if (durationMinutes <= 0) durationMinutes = 15;
            long endMillis = startMillis + ((long) durationMinutes * 60000L);

            String title = item.optString("title", "");
            String body = item.optString("body", "");
            boolean shouldPlayChime = item.optBoolean("shouldPlayChime", false);
            boolean isArabic = item.optBoolean("isArabic", true);

            // Only register native AlarmManager alarms for the next 48 hours to avoid OEM alarm caps;
            // each trigger chains subsequent windows automatically from KEY_SCHEDULED_WINDOWS.
            if (startMillis > now && startMillis <= lookaheadCutoff && restoredStart != startMillis && lastHandledStart != startMillis) {
                Intent startIntent = new Intent(context, PrayerSilentReceiver.class);
                startIntent.setAction(ACTION_START_SILENT);
                startIntent.putExtra(EXTRA_WINDOW_ID, id);
                startIntent.putExtra(EXTRA_PRAYER_KEY, prayerKey);
                startIntent.putExtra(EXTRA_PRAYER_NAME, prayerName);
                startIntent.putExtra(EXTRA_DURATION, durationMinutes);
                startIntent.putExtra(EXTRA_START_MILLIS, startMillis);
                startIntent.putExtra(EXTRA_END_MILLIS, endMillis);
                startIntent.putExtra(EXTRA_NOTIF_TITLE, title);
                startIntent.putExtra(EXTRA_NOTIF_BODY, body);
                startIntent.putExtra(EXTRA_PLAY_START_CHIME, shouldPlayChime);
                startIntent.putExtra(EXTRA_IS_ARABIC, isArabic);

                PendingIntent startPi = PendingIntent.getBroadcast(context, id * 2, startIntent, piFlags);
                scheduleExactSilentAlarm(context, alarmManager, startMillis, startPi);
            }

            if (endMillis > now && endMillis <= lookaheadCutoff) {
                scheduleSingleEndAlarm(context, id, prayerKey, prayerName, durationMinutes, startMillis, endMillis, isArabic);
            }
        }
    }

    private static void scheduleSingleEndAlarm(
        Context context,
        int id,
        String prayerKey,
        String prayerName,
        int durationMinutes,
        long startMillis,
        long endMillis,
        boolean isArabic
    ) {
        if (context == null || endMillis <= System.currentTimeMillis()) return;
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        Intent endIntent = new Intent(context, PrayerSilentReceiver.class);
        endIntent.setAction(ACTION_END_SILENT);
        endIntent.putExtra(EXTRA_WINDOW_ID, id);
        endIntent.putExtra(EXTRA_PRAYER_KEY, prayerKey);
        endIntent.putExtra(EXTRA_PRAYER_NAME, prayerName);
        endIntent.putExtra(EXTRA_DURATION, durationMinutes);
        endIntent.putExtra(EXTRA_START_MILLIS, startMillis);
        endIntent.putExtra(EXTRA_END_MILLIS, endMillis);
        endIntent.putExtra(EXTRA_IS_ARABIC, isArabic);

        PendingIntent endPi = PendingIntent.getBroadcast(context, id * 2 + 1, endIntent, piFlags);
        scheduleExactSilentAlarm(context, am, endMillis, endPi);
    }

    /**
     * Schedules an exact alarm using AlarmManager.setAlarmClock on API 21+ so it fires at the
     * exact second even when the screen is locked in Deep Doze, completely bypassing the 3-9 minute
     * allowWhileIdle throttle between consecutive alarms (e.g., Iqama -> +10s Auto-Silent).
     */
    private static void scheduleExactSilentAlarm(Context context, AlarmManager am, long triggerMillis, PendingIntent operationPi) {
        if (context == null || am == null || operationPi == null) return;

        int showFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            showFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        Intent showIntent = new Intent(context, MainActivity.class);
        showIntent.putExtra("shortcut_target", "prayer-times");
        showIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent showPi = PendingIntent.getActivity(context, 9901, showIntent, showFlags);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerMillis, operationPi);
                return;
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                AlarmManager.AlarmClockInfo alarmClockInfo = new AlarmManager.AlarmClockInfo(triggerMillis, showPi);
                am.setAlarmClock(alarmClockInfo, operationPi);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                am.setExact(AlarmManager.RTC_WAKEUP, triggerMillis, operationPi);
            } else {
                am.set(AlarmManager.RTC_WAKEUP, triggerMillis, operationPi);
            }
        } catch (SecurityException se) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerMillis, operationPi);
                } else {
                    am.set(AlarmManager.RTC_WAKEUP, triggerMillis, operationPi);
                }
            } catch (Exception ignored) {}
        } catch (Exception ignored) {}
    }

    public static synchronized void scheduleIqamaAlarms(Context context, JSONArray alarms) {
        if (context == null) return;
        cancelAllIqamaAlarms(context);
        if (alarms == null || alarms.length() == 0) return;

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_SCHEDULED_IQAMAS, alarms.toString()).apply();

        scheduleIqamasFromJsonArray(context, alarms);
    }

    public static synchronized void cancelAllIqamaAlarms(Context context) {
        if (context == null) return;
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String savedJson = prefs.getString(KEY_SCHEDULED_IQAMAS, null);

        if (am != null && savedJson != null && !savedJson.trim().isEmpty()) {
            try {
                JSONArray arr = new JSONArray(savedJson);
                int flags = PendingIntent.FLAG_NO_CREATE;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject item = arr.optJSONObject(i);
                    if (item == null) continue;
                    int id = item.optInt("id", -1);
                    if (id <= 0) continue;
                    Intent intent = new Intent(context, PrayerSilentReceiver.class);
                    intent.setAction(ACTION_IQAMA_ALERT);
                    PendingIntent pi = PendingIntent.getBroadcast(context, id, intent, flags);
                    if (pi != null) {
                        am.cancel(pi);
                        pi.cancel();
                    }
                }
            } catch (Exception ignored) {}
        }

        prefs.edit().remove(KEY_SCHEDULED_IQAMAS).apply();
    }

    public static synchronized void rescheduleSavedIqamas(Context context) {
        if (context == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String savedJson = prefs.getString(KEY_SCHEDULED_IQAMAS, null);
        if (savedJson == null || savedJson.trim().isEmpty()) return;

        try {
            JSONArray arr = new JSONArray(savedJson);
            scheduleIqamasFromJsonArray(context, arr);
        } catch (Exception ignored) {}
    }

    private static void scheduleIqamasFromJsonArray(Context context, JSONArray alarms) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null || alarms == null) return;

        long now = System.currentTimeMillis();
        long lookaheadCutoff = now + ALARM_LOOKAHEAD_MS;
        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        for (int i = 0; i < alarms.length(); i++) {
            JSONObject item = alarms.optJSONObject(i);
            if (item == null) continue;

            int id = item.optInt("id", 0);
            long triggerAt = item.optLong("triggerAtMillis", 0L);
            if (id <= 0 || triggerAt <= now || triggerAt > lookaheadCutoff) continue;

            Intent intent = new Intent(context, PrayerSilentReceiver.class);
            intent.setAction(ACTION_IQAMA_ALERT);
            intent.putExtra(EXTRA_NOTIF_ID, id);
            intent.putExtra(EXTRA_PRAYER_KEY, item.optString("prayerKey", ""));
            intent.putExtra(EXTRA_NOTIF_TITLE, item.optString("title", ""));
            intent.putExtra(EXTRA_NOTIF_BODY, item.optString("body", ""));
            intent.putExtra(EXTRA_PLAY_SOUND, item.optBoolean("playSound", true));
            intent.putExtra(EXTRA_IS_ARABIC, item.optBoolean("isArabic", true));

            PendingIntent pi = PendingIntent.getBroadcast(context, id, intent, piFlags);
            scheduleExactSilentAlarm(context, am, triggerAt, pi);
        }
    }

    private static void executeIqamaAlert(Context context, Intent intent) {
        if (context == null || intent == null) return;
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            int notifId = intent.getIntExtra(EXTRA_NOTIF_ID, 6001);
            String title = intent.getStringExtra(EXTRA_NOTIF_TITLE);
            String body = intent.getStringExtra(EXTRA_NOTIF_BODY);
            boolean playSound = intent.getBooleanExtra(EXTRA_PLAY_SOUND, true);
            boolean isArabic = intent.getBooleanExtra(EXTRA_IS_ARABIC, getAppIsArabic(context));

            if (title == null || title.trim().isEmpty()) {
                title = isArabic ? "حان الآن موعد إقامة الصلاة" : "It is now time for Iqama";
            }
            if (body == null || body.trim().isEmpty()) {
                body = isArabic
                    ? "أقيمت الصلاة.. استووا وتراصوا واعتدلوا أثابكم الله"
                    : "Salah has begun. Straighten and close your ranks, may Allah reward you.";
            }

            int alertVolume = AdhanPlaybackService.getSavedAlertVolume(context);
            boolean effectiveSound = playSound && alertVolume > 0;

            ensureIqamaChannels(context, nm, isArabic);
            String chosenChannelId = effectiveSound ? IQAMA_CHANNEL_ID : IQAMA_SILENT_CHANNEL_ID;

            int resId = context.getResources().getIdentifier("notif_droplet", "raw", context.getPackageName());
            Uri soundUri = null;
            if (effectiveSound && resId != 0) {
                soundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + context.getPackageName() + "/" + resId);
            }

            Intent openAppIntent = new Intent(context, MainActivity.class);
            openAppIntent.putExtra("shortcut_target", "prayer-times");
            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(context, notifId, openAppIntent, flags);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, chosenChannelId)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setColor(0xFF2E7D5E)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setGroup(AlertsGroupHelper.PRAYER_GROUP_KEY)
                .setGroupSummary(false)
                .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
                .setSortKey("08_iqama")
                .setBadgeIconType(NotificationCompat.BADGE_ICON_NONE)
                .setNumber(0)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            if (effectiveSound && soundUri != null) {
                builder.setSound(soundUri);
            } else {
                builder.setSound(null);
            }

            nm.notify(notifId, builder.build());
            AlertsGroupHelper.updateGroupSummary(context, nm);

            if (effectiveSound && Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                playChime(context);
            }
        } catch (Exception ignored) {}
    }

    private static void ensureIqamaChannels(Context context, NotificationManager nm, boolean isArabic) {
        if (context == null || nm == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        try {
            nm.deleteNotificationChannel("iqama_v3_chime_channel");
            nm.deleteNotificationChannel("iqama_v4_chime_channel");
        } catch (Exception ignored) {}

        int resId = context.getResources().getIdentifier("notif_droplet", "raw", context.getPackageName());
        Uri soundUri = null;
        if (resId != 0) {
            soundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + context.getPackageName() + "/" + resId);
        }

        AudioAttributes alarmAudioAttributes = new AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
            .build();

        if (nm.getNotificationChannel(IQAMA_CHANNEL_ID) == null) {
            NotificationChannel iqamaChan = new NotificationChannel(
                IQAMA_CHANNEL_ID,
                isArabic ? "تنبيه إقامة الصلاة" : "Prayer Iqama Alert",
                NotificationManager.IMPORTANCE_HIGH
            );
            iqamaChan.setDescription(isArabic
                ? "نغمة تنبيه وإشعار مرئي عند حلول موعد إقامة الصلاة"
                : "Chime alert when prayer Iqama begins");
            iqamaChan.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            iqamaChan.setBypassDnd(true);
            iqamaChan.enableVibration(true);
            iqamaChan.enableLights(true);
            iqamaChan.setShowBadge(false);
            if (soundUri != null) {
                iqamaChan.setSound(soundUri, alarmAudioAttributes);
            }
            nm.createNotificationChannel(iqamaChan);
        }

        if (nm.getNotificationChannel(IQAMA_SILENT_CHANNEL_ID) == null) {
            NotificationChannel iqamaSilentChan = new NotificationChannel(
                IQAMA_SILENT_CHANNEL_ID,
                isArabic ? "تنبيه إقامة الصلاة (بدون صوت)" : "Prayer Iqama Alert (Silent)",
                NotificationManager.IMPORTANCE_HIGH
            );
            iqamaSilentChan.setDescription(isArabic
                ? "إشعار مرئي عند حلول موعد الإقامة بدون صوت"
                : "Silent notification when prayer Iqama begins");
            iqamaSilentChan.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            iqamaSilentChan.setBypassDnd(true);
            iqamaSilentChan.enableVibration(false);
            iqamaSilentChan.enableLights(true);
            iqamaSilentChan.setShowBadge(false);
            iqamaSilentChan.setSound(null, null);
            nm.createNotificationChannel(iqamaSilentChan);
        }
    }

    private static void cancelNotificationById(Context context, int notifId) {
        if (context == null || notifId <= 0) return;
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(notifId);
                AlertsGroupHelper.updateGroupSummary(context, nm);
            }
        } catch (Exception ignored) {}
    }

    private static void playChime(Context context) {
        try {
            int resId = context.getResources().getIdentifier("notif_droplet", "raw", context.getPackageName());
            if (resId != 0) {
                MediaPlayer mp = MediaPlayer.create(context, resId);
                if (mp != null) {
                    SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                    int volumePercent = prefs.getInt("alert_volume", 100);
                    if (volumePercent <= 0) {
                        mp.release();
                        return;
                    }
                    float vol = AdhanPlaybackService.computeScaledVolume(volumePercent);
                    mp.setVolume(vol, vol);

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        AudioAttributes aa = new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                            .build();
                        mp.setAudioAttributes(aa);
                    } else {
                        mp.setAudioStreamType(AudioManager.STREAM_ALARM);
                    }
                    mp.setOnCompletionListener(MediaPlayer::release);
                    mp.start();
                }
            }
        } catch (Exception ignored) {}
    }

    public static boolean isDeviceEffectivelyMuted(Context context, AudioManager audioManager) {
        if (audioManager != null && audioManager.getRingerMode() != AudioManager.RINGER_MODE_NORMAL) {
            return true;
        }
        if (context != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                boolean usedDndFilter = prefs.getBoolean(KEY_USED_DND_FILTER, false);
                if (usedDndFilter) {
                    NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                    if (nm != null && nm.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_ALL) {
                        return true;
                    }
                }
            } catch (Exception ignored) {}
        }
        return false;
    }

    private static int safeGetStreamVolume(AudioManager audioManager, int stream) {
        try {
            return audioManager.getStreamVolume(stream);
        } catch (Exception e) {
            return -1;
        }
    }

    private static void saveOriginalAudioStateIfNeeded(Context context, AudioManager audioManager) {
        if (context == null || audioManager == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            if (prefs.getBoolean(KEY_HAS_SAVED_VOLUMES, false)) return;

            SharedPreferences.Editor editor = prefs.edit();
            if (!prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false)) {
                editor.putInt(KEY_ORIGINAL_RINGER_MODE, audioManager.getRingerMode());
            }
            editor.putInt(KEY_ORIGINAL_RING_VOL, safeGetStreamVolume(audioManager, AudioManager.STREAM_RING));
            editor.putInt(KEY_ORIGINAL_NOTIF_VOL, safeGetStreamVolume(audioManager, AudioManager.STREAM_NOTIFICATION));
            editor.putInt(KEY_ORIGINAL_SYSTEM_VOL, safeGetStreamVolume(audioManager, AudioManager.STREAM_SYSTEM));
            editor.putInt(KEY_ORIGINAL_MUSIC_VOL, safeGetStreamVolume(audioManager, AudioManager.STREAM_MUSIC));
            editor.putBoolean(KEY_HAS_SAVED_VOLUMES, true);
            editor.apply();
        } catch (Exception ignored) {}
    }

    private static void muteAudioStreams(AudioManager audioManager, boolean includeRingerStreams) {
        if (audioManager == null) return;
        if (includeRingerStreams) {
            int[] ringerStreams = new int[]{
                AudioManager.STREAM_RING,
                AudioManager.STREAM_NOTIFICATION,
                AudioManager.STREAM_SYSTEM
            };
            for (int stream : ringerStreams) {
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        audioManager.adjustStreamVolume(stream, AudioManager.ADJUST_MUTE, 0);
                    }
                } catch (Exception ignored) {}
                try {
                    audioManager.setStreamVolume(stream, 0, 0);
                } catch (Exception ignored) {}
            }
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                audioManager.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_MUTE, 0);
            }
        } catch (Exception ignored) {}
        try {
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, 0, 0);
        } catch (Exception ignored) {}
    }

    private static void restoreSavedAudioVolumes(Context context, AudioManager audioManager, int targetRingerMode) {
        if (context == null || audioManager == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean hasSaved = prefs.getBoolean(KEY_HAS_SAVED_VOLUMES, false);
            int origRing = hasSaved ? prefs.getInt(KEY_ORIGINAL_RING_VOL, -1) : -1;
            int origNotif = hasSaved ? prefs.getInt(KEY_ORIGINAL_NOTIF_VOL, -1) : -1;
            int origSystem = hasSaved ? prefs.getInt(KEY_ORIGINAL_SYSTEM_VOL, -1) : -1;
            int origMusic = hasSaved ? prefs.getInt(KEY_ORIGINAL_MUSIC_VOL, -1) : -1;

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    audioManager.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_UNMUTE, 0);
                }
                if (origMusic > 0 && safeGetStreamVolume(audioManager, AudioManager.STREAM_MUSIC) == 0) {
                    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, origMusic, 0);
                }
            } catch (Exception ignored) {}

            if (targetRingerMode == AudioManager.RINGER_MODE_NORMAL) {
                int[] streams = new int[]{
                    AudioManager.STREAM_RING,
                    AudioManager.STREAM_NOTIFICATION,
                    AudioManager.STREAM_SYSTEM
                };
                int[] savedVols = new int[]{ origRing, origNotif, origSystem };
                for (int i = 0; i < streams.length; i++) {
                    int stream = streams[i];
                    int saved = savedVols[i];
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            audioManager.adjustStreamVolume(stream, AudioManager.ADJUST_UNMUTE, 0);
                        }
                    } catch (Exception ignored) {}
                    try {
                        if (saved > 0 && safeGetStreamVolume(audioManager, stream) == 0) {
                            audioManager.setStreamVolume(stream, saved, 0);
                        }
                    } catch (Exception ignored) {}
                }
            }

            prefs.edit().putBoolean(KEY_HAS_SAVED_VOLUMES, false).apply();
        } catch (Exception ignored) {}
    }

    private static boolean waitForRingerMode(AudioManager audioManager, int targetMode, int maxAttempts, boolean retrySilent) {
        for (int i = 0; i < maxAttempts; i++) {
            if (audioManager.getRingerMode() == targetMode) {
                return true;
            }
            if (retrySilent && targetMode == AudioManager.RINGER_MODE_SILENT && i == 3) {
                try {
                    audioManager.setRingerMode(AudioManager.RINGER_MODE_SILENT);
                } catch (Exception ignored) {}
            }
            try {
                Thread.sleep(50);
            } catch (InterruptedException ignored) {
                break;
            }
        }
        return audioManager.getRingerMode() == targetMode;
    }

    private static boolean waitForMutedState(AudioManager audioManager, int maxAttempts) {
        for (int i = 0; i < maxAttempts; i++) {
            if (audioManager.getRingerMode() != AudioManager.RINGER_MODE_NORMAL) {
                return true;
            }
            try {
                Thread.sleep(50);
            } catch (InterruptedException ignored) {
                break;
            }
        }
        return audioManager.getRingerMode() != AudioManager.RINGER_MODE_NORMAL;
    }

    private static boolean forceRingerModeSilent(AudioManager audioManager, SharedPreferences prefs) {
        if (audioManager == null) return false;
        if (audioManager.getRingerMode() == AudioManager.RINGER_MODE_SILENT) {
            return true;
        }
        try {
            audioManager.setRingerMode(AudioManager.RINGER_MODE_SILENT);
            if (waitForRingerMode(audioManager, AudioManager.RINGER_MODE_SILENT, 6, true)) {
                return true;
            }
        } catch (Exception ignored) {}

        // Samsung One UI cycles NORMAL -> VIBRATE -> SILENT; stepping via VIBRATE updates Quick Settings Sound tile reliably
        try {
            if (prefs != null && prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false)) {
                prefs.edit().putLong(KEY_LAST_ACTIVATION_TIME, System.currentTimeMillis()).apply();
            }
            audioManager.setRingerMode(AudioManager.RINGER_MODE_VIBRATE);
            Thread.sleep(120);
            audioManager.setRingerMode(AudioManager.RINGER_MODE_SILENT);
            if (waitForRingerMode(audioManager, AudioManager.RINGER_MODE_SILENT, 6, true)) {
                return true;
            }
        } catch (Exception ignored) {}

        // Reset stuck OEM audio/DND interlock by briefly resetting to NORMAL before asserting SILENT
        try {
            if (prefs != null && prefs.getBoolean(KEY_IS_SILENT_ACTIVE, false)) {
                prefs.edit().putLong(KEY_LAST_ACTIVATION_TIME, System.currentTimeMillis()).apply();
            }
            audioManager.setRingerMode(AudioManager.RINGER_MODE_NORMAL);
            Thread.sleep(150);
            audioManager.setRingerMode(AudioManager.RINGER_MODE_SILENT);
            if (waitForRingerMode(audioManager, AudioManager.RINGER_MODE_SILENT, 6, true)) {
                return true;
            }
        } catch (Exception ignored) {}

        return audioManager.getRingerMode() == AudioManager.RINGER_MODE_SILENT;
    }

    public static boolean applySilentMode(Context context, AudioManager audioManager) {
        if (audioManager == null) return false;
        SharedPreferences prefs = context != null
            ? context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            : null;
        saveOriginalAudioStateIfNeeded(context, audioManager);

        try {
            // Mute media stream only first; do NOT call ADJUST_MUTE/setStreamVolume(0) on ringer streams
            // before setRingerMode(RINGER_MODE_SILENT), as that interferes with Samsung One UI's Sound tile sync.
            muteAudioStreams(audioManager, false);

            if (context != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null && nm.isNotificationPolicyAccessGranted()) {
                    // 1. Transition ringer mode cleanly to SILENT (direct, or VIBRATE -> SILENT for One UI)
                    if (forceRingerModeSilent(audioManager, prefs)) {
                        if (prefs != null) {
                            prefs.edit()
                                .putBoolean(KEY_USED_DND_FILTER, false)
                                .putBoolean(KEY_APPLIED_RINGER_MUTE, true)
                                .apply();
                        }
                        return true;
                    }

                    // 2. If SILENT was blocked, apply DND filter and re-assert SILENT cleanly
                    boolean dndSet = false;
                    try {
                        nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALARMS);
                        Thread.sleep(100);
                        dndSet = nm.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_ALL;
                    } catch (Exception ignored) {}

                    if (!forceRingerModeSilent(audioManager, prefs)) {
                        // Fallback to VIBRATE if SILENT is still rejected by OEM policy
                        if (audioManager.getRingerMode() == AudioManager.RINGER_MODE_NORMAL) {
                            try {
                                audioManager.setRingerMode(AudioManager.RINGER_MODE_VIBRATE);
                                waitForMutedState(audioManager, 6);
                            } catch (Exception ignored) {}
                        }
                    }

                    // Last-resort stream mute only if ringer mode still remained NORMAL
                    if (audioManager.getRingerMode() == AudioManager.RINGER_MODE_NORMAL) {
                        muteAudioStreams(audioManager, true);
                    }

                    boolean ringerMuted = audioManager.getRingerMode() != AudioManager.RINGER_MODE_NORMAL;
                    boolean effectiveDnd = dndSet || (nm.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_ALL);
                    if (prefs != null) {
                        prefs.edit()
                            .putBoolean(KEY_USED_DND_FILTER, effectiveDnd)
                            .putBoolean(KEY_APPLIED_RINGER_MUTE, ringerMuted)
                            .apply();
                    }
                    return ringerMuted || effectiveDnd;
                } else {
                    // Fallback when DND policy access is not granted: switch to Vibrate cleanly
                    audioManager.setRingerMode(AudioManager.RINGER_MODE_VIBRATE);
                    boolean ringerMuted = waitForMutedState(audioManager, 6);
                    if (!ringerMuted) {
                        muteAudioStreams(audioManager, true);
                    }
                    if (prefs != null) {
                        prefs.edit()
                            .putBoolean(KEY_USED_DND_FILTER, false)
                            .putBoolean(KEY_APPLIED_RINGER_MUTE, ringerMuted)
                            .apply();
                    }
                    return ringerMuted;
                }
            } else {
                boolean muted = forceRingerModeSilent(audioManager, prefs);
                if (!muted) {
                    muteAudioStreams(audioManager, true);
                    muted = audioManager.getRingerMode() != AudioManager.RINGER_MODE_NORMAL;
                }
                if (prefs != null) {
                    prefs.edit().putBoolean(KEY_APPLIED_RINGER_MUTE, muted).apply();
                }
                return muted;
            }
        } catch (SecurityException se) {
            try {
                muteAudioStreams(audioManager, false);
                audioManager.setRingerMode(AudioManager.RINGER_MODE_VIBRATE);
                boolean muted = waitForMutedState(audioManager, 6);
                if (!muted) {
                    muteAudioStreams(audioManager, true);
                }
                if (prefs != null) {
                    prefs.edit().putBoolean(KEY_APPLIED_RINGER_MUTE, muted).apply();
                }
                return muted;
            } catch (Exception ignored) {}
        } catch (Exception ignored) {}
        boolean fallbackMuted = audioManager.getRingerMode() != AudioManager.RINGER_MODE_NORMAL;
        if (prefs != null) {
            prefs.edit().putBoolean(KEY_APPLIED_RINGER_MUTE, fallbackMuted).apply();
        }
        return fallbackMuted;
    }

    public static void restoreRingerMode(Context context, AudioManager audioManager, int mode) {
        if (audioManager == null) return;
        SharedPreferences prefs = context != null
            ? context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            : null;
        int effectiveMode = mode;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null && nm.isNotificationPolicyAccessGranted()) {
                    boolean usedDndFilter = prefs != null && prefs.getBoolean(KEY_USED_DND_FILTER, false);
                    if (usedDndFilter || (mode == AudioManager.RINGER_MODE_NORMAL
                        && nm.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_ALL)) {
                        try {
                            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL);
                            Thread.sleep(40);
                        } catch (Exception ignored) {}
                    }
                    audioManager.setRingerMode(effectiveMode);
                } else {
                    effectiveMode = AudioManager.RINGER_MODE_NORMAL;
                    audioManager.setRingerMode(effectiveMode);
                }
            } else {
                audioManager.setRingerMode(effectiveMode);
            }
            if (audioManager.getRingerMode() != effectiveMode) {
                try {
                    Thread.sleep(50);
                    audioManager.setRingerMode(effectiveMode);
                } catch (Exception ignored) {}
            }
        } catch (SecurityException se) {
            try {
                effectiveMode = AudioManager.RINGER_MODE_NORMAL;
                audioManager.setRingerMode(effectiveMode);
            } catch (Exception ignored) {}
        } catch (Exception ignored) {
        } finally {
            restoreSavedAudioVolumes(context, audioManager, effectiveMode);
            if (effectiveMode == AudioManager.RINGER_MODE_NORMAL && audioManager.getRingerMode() != AudioManager.RINGER_MODE_NORMAL) {
                try {
                    audioManager.setRingerMode(AudioManager.RINGER_MODE_NORMAL);
                } catch (Exception ignored) {}
            }
            if (prefs != null) {
                prefs.edit()
                    .putBoolean(KEY_USED_DND_FILTER, false)
                    .putBoolean(KEY_APPLIED_RINGER_MUTE, false)
                    .putBoolean(KEY_HAS_SAVED_VOLUMES, false)
                    .apply();
            }
        }
    }

    public static void ensureChannels(Context context, NotificationManager nm, boolean isArabic) {
        if (context == null || nm == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        try {
            nm.deleteNotificationChannel("prayer_silent_channel");
            nm.deleteNotificationChannel("prayer_silent_v3_chime_channel");
            nm.deleteNotificationChannel("prayer_silent_v4_chime_channel");
        } catch (Exception ignored) {}

        int resId = context.getResources().getIdentifier("notif_droplet", "raw", context.getPackageName());
        Uri soundUri = null;
        if (resId != 0) {
            soundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + context.getPackageName() + "/" + resId);
        }

        AudioAttributes alarmAudioAttributes = new AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
            .build();

        NotificationChannel chimeChannel = new NotificationChannel(
            CHANNEL_ID,
            isArabic ? "الصامت التلقائي للصلاة" : "Auto Silent Mode",
            NotificationManager.IMPORTANCE_HIGH
        );
        chimeChannel.setDescription(isArabic
            ? "إشعارات تفعيل وإلغاء وضع الصامت التلقائي أثناء الصلاة"
            : "Notifications for activating and ending auto-silent mode during prayer");
        chimeChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        chimeChannel.setBypassDnd(true);
        chimeChannel.enableVibration(true);
        chimeChannel.enableLights(true);
        chimeChannel.setShowBadge(false);
        if (soundUri != null) {
            chimeChannel.setSound(soundUri, alarmAudioAttributes);
        }
        nm.createNotificationChannel(chimeChannel);

        NotificationChannel silentChannel = new NotificationChannel(
            SILENT_CHANNEL_ID,
            isArabic ? "الصامت التلقائي للصلاة (بدون نغمة)" : "Auto Silent Mode (Silent)",
            NotificationManager.IMPORTANCE_HIGH
        );
        silentChannel.setDescription(isArabic
            ? "إشعار تفعيل وضع الصامت بدون تكرار نغمة الإقامة"
            : "Notification when auto-silent activates right after Iqama alert");
        silentChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        silentChannel.setBypassDnd(true);
        silentChannel.enableVibration(false);
        silentChannel.enableLights(true);
        silentChannel.setShowBadge(false);
        silentChannel.setSound(null, null);
        nm.createNotificationChannel(silentChannel);
    }

    private static void showNotification(Context context, int notifId, String title, String message, boolean playChimeSound, boolean isArabic) {
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            ensureChannels(context, nm, isArabic);

            String chosenChannelId = playChimeSound ? CHANNEL_ID : SILENT_CHANNEL_ID;
            int resId = context.getResources().getIdentifier("notif_droplet", "raw", context.getPackageName());
            Uri soundUri = null;
            if (playChimeSound && resId != 0) {
                soundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + context.getPackageName() + "/" + resId);
            }

            Intent openAppIntent = new Intent(context, MainActivity.class);
            openAppIntent.putExtra("shortcut_target", "prayer-times");
            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(context, notifId, openAppIntent, flags);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, chosenChannelId)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setColor(0xFF2E7D5E)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setGroup(AlertsGroupHelper.PRAYER_GROUP_KEY)
                .setGroupSummary(false)
                .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
                .setSortKey("10_alert")
                .setBadgeIconType(NotificationCompat.BADGE_ICON_NONE)
                .setNumber(0)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            if (playChimeSound && soundUri != null) {
                builder.setSound(soundUri);
            } else {
                builder.setSound(null);
            }

            nm.notify(notifId, builder.build());
            AlertsGroupHelper.updateGroupSummary(context, nm);
        } catch (Exception ignored) {}
    }
}
