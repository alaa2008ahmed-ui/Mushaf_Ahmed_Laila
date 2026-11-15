package com.mushaf.ahmedandlayla;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Exact Alarm BroadcastReceiver for prayer Adhan notifications.
 * Decouples Adhan playback from static Android NotificationChannel sounds so
 * the user's selected "مستوى صوت الأذان" (0% - 100%) controls actual phone playback
 * in real time — whether the app is open, backgrounded, or killed.
 */
public class AdhanAlarmReceiver extends BroadcastReceiver {

    public static final String ACTION_TRIGGER_ADHAN = "com.mushaf.ahmedandlayla.ACTION_TRIGGER_ADHAN";
    public static final String ACTION_STOP_ADHAN = "com.mushaf.ahmedandlayla.ACTION_STOP_ADHAN";

    public static final String EXTRA_NOTIF_ID = "notif_id";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_BODY = "body";
    public static final String EXTRA_SOUND_NAME = "sound_name";
    public static final String EXTRA_SOUND_URI = "sound_uri";
    public static final String EXTRA_PLAY_SOUND = "play_sound";
    public static final String EXTRA_IS_ARABIC = "is_arabic";

    private static final String PREFS_NAME = "PrayerSilentPrefs";
    private static final String KEY_SCHEDULED_ADHANS = "scheduled_adhan_alarms";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) return;
        String action = intent.getAction();
        if (action == null) return;

        if (ACTION_STOP_ADHAN.equals(action)) {
            boolean cancelNotif = intent.getBooleanExtra("cancel_notification", false);
            int notifId = intent.getIntExtra(AdhanPlaybackService.EXTRA_NOTIF_ID, -1);
            AdhanPlaybackService.stopIfPlaying(context, cancelNotif);
            if (cancelNotif && notifId > 0) {
                try {
                    NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                    if (nm != null) {
                        nm.cancel(notifId);
                        AlertsGroupHelper.updateGroupSummary(context, nm);
                    }
                } catch (Exception ignored) {}
            }
            return;
        }

        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            "android.intent.action.BOOT_COMPLETED".equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            "android.intent.action.TIME_SET".equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
            Intent.ACTION_DATE_CHANGED.equals(action)) {
            rescheduleSavedAlarms(context);
            return;
        }

        if (!ACTION_TRIGGER_ADHAN.equals(action)) return;

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            try {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Mushaf:AdhanReceiverWakeLock");
                wakeLock.acquire(10000);
            } catch (Exception ignored) {}
        }

        try {
            int notifId = intent.getIntExtra(EXTRA_NOTIF_ID, 1001);
            String prayerKey = intent.getStringExtra(EXTRA_PRAYER_KEY);
            String title = intent.getStringExtra(EXTRA_TITLE);
            String body = intent.getStringExtra(EXTRA_BODY);
            String soundName = intent.getStringExtra(EXTRA_SOUND_NAME);
            String soundUri = intent.getStringExtra(EXTRA_SOUND_URI);
            boolean playSound = intent.getBooleanExtra(EXTRA_PLAY_SOUND, true);
            boolean isArabic = intent.getBooleanExtra(EXTRA_IS_ARABIC, true);

            if (title == null || title.isEmpty()) {
                title = isArabic ? "حان الآن موعد الأذان" : "It is now time for Adhan";
            }
            if (body == null) body = "";
            if (soundName == null || soundName.isEmpty()) soundName = "takbeer1";

            // Always read live volume from SharedPreferences at the moment Adhan fires
            int alertVolume = AdhanPlaybackService.getSavedAlertVolume(context);

            if (!playSound || alertVolume <= 0) {
                postMutedNotification(context, notifId, title, body, isArabic);
                return;
            }

            Intent serviceIntent = new Intent(context, AdhanPlaybackService.class);
            serviceIntent.putExtra(AdhanPlaybackService.EXTRA_NOTIF_ID, notifId);
            serviceIntent.putExtra(AdhanPlaybackService.EXTRA_PRAYER_KEY, prayerKey);
            serviceIntent.putExtra(AdhanPlaybackService.EXTRA_TITLE, title);
            serviceIntent.putExtra(AdhanPlaybackService.EXTRA_BODY, body);
            serviceIntent.putExtra(AdhanPlaybackService.EXTRA_SOUND_NAME, soundName);
            serviceIntent.putExtra(AdhanPlaybackService.EXTRA_SOUND_URI, soundUri);
            serviceIntent.putExtra(AdhanPlaybackService.EXTRA_IS_ARABIC, isArabic);

            try {
                ContextCompat.startForegroundService(context, serviceIntent);
            } catch (Exception fgErr) {
                // Fallback if OEM blocks startForegroundService despite exact-alarm exemption
                AdhanPlaybackService.playDirectFallback(
                    context, notifId, title, body, soundName, soundUri, isArabic
                );
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

    private static void postMutedNotification(
        Context context,
        int notifId,
        String title,
        String body,
        boolean isArabic
    ) {
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            String silentChannelId = "adhan_v5_silent";
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel ch = nm.getNotificationChannel(silentChannelId);
                if (ch == null) {
                    ch = new NotificationChannel(
                        silentChannelId,
                        isArabic ? "أذان الصلوات (بدون صوت)" : "Prayer Adhan (Silent)",
                        NotificationManager.IMPORTANCE_HIGH
                    );
                    ch.setDescription(isArabic
                        ? "إشعار الأذان بدون صوت مع أيقونة بالشريط العلوي"
                        : "Silent Adhan notification with status bar icon");
                    ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                    ch.enableVibration(false);
                    ch.enableLights(true);
                    ch.setShowBadge(false);
                    ch.setSound(null, null);
                    nm.createNotificationChannel(ch);
                }
            }

            int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                piFlags |= PendingIntent.FLAG_IMMUTABLE;
            }
            Intent openIntent = new Intent(context, MainActivity.class);
            openIntent.putExtra("shortcut_target", "prayer-times");
            openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent contentPi = PendingIntent.getActivity(context, notifId, openIntent, piFlags);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, silentChannelId)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setColor(0xFF2E7D5E)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(contentPi)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setGroup(AlertsGroupHelper.PRAYER_GROUP_KEY)
                .setGroupSummary(false)
                .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
                .setSortKey("05_adhan")
                .setBadgeIconType(NotificationCompat.BADGE_ICON_NONE)
                .setNumber(0)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            nm.notify(notifId, builder.build());
            AlertsGroupHelper.updateGroupSummary(context, nm);
        } catch (Exception ignored) {}
    }

    public static synchronized void scheduleAlarms(Context context, JSONArray alarms) {
        if (context == null) return;
        cancelAllAlarms(context);
        if (alarms == null || alarms.length() == 0) return;

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_SCHEDULED_ADHANS, alarms.toString()).apply();

        scheduleFromJsonArray(context, alarms);
    }

    public static synchronized void cancelAllAlarms(Context context) {
        if (context == null) return;
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String savedJson = prefs.getString(KEY_SCHEDULED_ADHANS, null);

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
                    Intent intent = new Intent(context, AdhanAlarmReceiver.class);
                    intent.setAction(ACTION_TRIGGER_ADHAN);
                    PendingIntent pi = PendingIntent.getBroadcast(context, id, intent, flags);
                    if (pi != null) {
                        am.cancel(pi);
                        pi.cancel();
                    }
                }
            } catch (Exception ignored) {}
        }

        prefs.edit().remove(KEY_SCHEDULED_ADHANS).apply();
    }

    public static synchronized void rescheduleSavedAlarms(Context context) {
        if (context == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String savedJson = prefs.getString(KEY_SCHEDULED_ADHANS, null);
        if (savedJson == null || savedJson.trim().isEmpty()) return;

        try {
            JSONArray arr = new JSONArray(savedJson);
            scheduleFromJsonArray(context, arr);
        } catch (Exception ignored) {}
    }

    private static void scheduleFromJsonArray(Context context, JSONArray alarms) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null || alarms == null) return;

        long now = System.currentTimeMillis();
        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        for (int i = 0; i < alarms.length(); i++) {
            JSONObject item = alarms.optJSONObject(i);
            if (item == null) continue;

            int id = item.optInt("id", 0);
            long triggerAt = item.optLong("triggerAtMillis", 0L);
            if (id <= 0 || triggerAt <= now) continue;

            Intent intent = new Intent(context, AdhanAlarmReceiver.class);
            intent.setAction(ACTION_TRIGGER_ADHAN);
            intent.putExtra(EXTRA_NOTIF_ID, id);
            intent.putExtra(EXTRA_PRAYER_KEY, item.optString("prayerKey", ""));
            intent.putExtra(EXTRA_TITLE, item.optString("title", ""));
            intent.putExtra(EXTRA_BODY, item.optString("body", ""));
            intent.putExtra(EXTRA_SOUND_NAME, item.optString("soundName", "takbeer1"));
            intent.putExtra(EXTRA_SOUND_URI, item.optString("soundUri", ""));
            intent.putExtra(EXTRA_PLAY_SOUND, item.optBoolean("playSound", true));
            intent.putExtra(EXTRA_IS_ARABIC, item.optBoolean("isArabic", true));

            PendingIntent pi = PendingIntent.getBroadcast(context, id, intent, piFlags);

            Intent showIntent = new Intent(context, MainActivity.class);
            showIntent.putExtra("shortcut_target", "prayer-times");
            showIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent showPi = PendingIntent.getActivity(context, 9901, showIntent, piFlags);

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    AlarmManager.AlarmClockInfo alarmClockInfo = new AlarmManager.AlarmClockInfo(triggerAt, showPi);
                    am.setAlarmClock(alarmClockInfo, pi);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    am.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pi);
                } else {
                    am.set(AlarmManager.RTC_WAKEUP, triggerAt, pi);
                }
            } catch (SecurityException se) {
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
                    } else {
                        am.set(AlarmManager.RTC_WAKEUP, triggerAt, pi);
                    }
                } catch (Exception ignored) {}
            } catch (Exception ignored) {}
        }
    }
}
