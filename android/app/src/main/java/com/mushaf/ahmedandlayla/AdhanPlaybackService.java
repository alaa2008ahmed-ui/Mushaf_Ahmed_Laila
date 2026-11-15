package com.mushaf.ahmedandlayla;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

/**
 * Foreground service that plays the scheduled Adhan sound via MediaPlayer
 * using USAGE_ALARM and scales playback loudness strictly according to the
 * user's saved "alert_volume" preference (0 - 100%).
 */
public class AdhanPlaybackService extends Service {

    public static final String CHANNEL_ADHAN_VISUAL = "adhan_v6_media_silent";
    public static final String EXTRA_NOTIF_ID = "notif_id";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_BODY = "body";
    public static final String EXTRA_SOUND_NAME = "sound_name";
    public static final String EXTRA_SOUND_URI = "sound_uri";
    public static final String EXTRA_IS_ARABIC = "is_arabic";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";

    private static final String PREFS_NAME = "PrayerSilentPrefs";
    private static final String KEY_ALERT_VOLUME = "alert_volume";

    private static volatile MediaPlayer activePlayer = null;
    private static volatile PowerManager.WakeLock activeWakeLock = null;
    private static volatile AdhanPlaybackService runningInstance = null;
    private static volatile int activeNotifId = 1001;
    private static volatile String activeTitle = "";
    private static volatile String activeBody = "";
    private static volatile boolean activeIsArabic = true;
    private static volatile AudioManager activeAudioManager = null;
    private static volatile AudioFocusRequest activeAudioFocusRequest = null;

    /**
     * Perceptual volume curve (quadratic) mapping 0..100 -> 0.0..1.0 so that
     * mid/low slider values (35%, 70%) produce clearly distinguishable loudness drops.
     */
    public static float computeScaledVolume(int volumePercent) {
        int clamped = Math.max(0, Math.min(100, volumePercent));
        if (clamped <= 0) return 0.0f;
        double normalized = clamped / 100.0;
        return (float) (normalized * normalized);
    }

    public static int getSavedAlertVolume(Context context) {
        if (context == null) return 100;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return Math.max(0, Math.min(100, prefs.getInt(KEY_ALERT_VOLUME, 100)));
        } catch (Exception e) {
            return 100;
        }
    }

    public static void ensureVisualChannel(Context context, boolean isArabic) {
        if (context == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        NotificationChannel existing = nm.getNotificationChannel(CHANNEL_ADHAN_VISUAL);
        if (existing != null) return;

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ADHAN_VISUAL,
            isArabic ? "أذان الصلوات (بالتحكم بالصوت)" : "Prayer Adhan (Volume Controlled)",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription(isArabic
            ? "قناة إشعارات الأذان مع التحكم الكامل بمستوى الصوت من داخل التطبيق"
            : "Prayer Adhan notifications with in-app volume control");
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        channel.setBypassDnd(true);
        channel.enableVibration(true);
        channel.enableLights(true);
        channel.setShowBadge(false);
        channel.setSound(null, null);
        nm.createNotificationChannel(channel);
    }

    public static Notification buildAdhanNotification(
        Context context,
        int notifId,
        String title,
        String body,
        boolean isArabic,
        boolean includeStopAction,
        boolean ongoing
    ) {
        ensureVisualChannel(context, isArabic);

        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.putExtra("shortcut_target", "prayer-times");
        openIntent.putExtra("stop_adhan_audio", true);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPi = PendingIntent.getActivity(context, notifId, openIntent, piFlags);

        Intent deleteIntent = new Intent(context, AdhanAlarmReceiver.class);
        deleteIntent.setAction(AdhanAlarmReceiver.ACTION_STOP_ADHAN);
        deleteIntent.putExtra(EXTRA_NOTIF_ID, notifId);
        deleteIntent.putExtra("cancel_notification", true);
        PendingIntent deletePi = PendingIntent.getBroadcast(context, notifId + 10000, deleteIntent, piFlags);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ADHAN_VISUAL)
            .setSmallIcon(R.drawable.ic_stat_name)
            .setColor(0xFF2E7D5E)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(contentPi)
            .setDeleteIntent(deletePi)
            .setAutoCancel(!ongoing)
            .setOngoing(ongoing)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setGroup(AlertsGroupHelper.PRAYER_GROUP_KEY)
            .setGroupSummary(false)
            .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
            .setSortKey("05_adhan")
            .setBadgeIconType(NotificationCompat.BADGE_ICON_NONE)
            .setNumber(0)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        if (includeStopAction) {
            Intent stopIntent = new Intent(context, AdhanAlarmReceiver.class);
            stopIntent.setAction(AdhanAlarmReceiver.ACTION_STOP_ADHAN);
            stopIntent.putExtra(EXTRA_NOTIF_ID, notifId);
            stopIntent.putExtra("cancel_notification", false);
            PendingIntent stopPi = PendingIntent.getBroadcast(context, notifId + 20000, stopIntent, piFlags);
            String stopLabel = isArabic ? "إيقاف الصوت" : "Stop Sound";
            builder.addAction(0, stopLabel, stopPi);
        }

        return builder.build();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        runningInstance = this;

        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        int notifId = intent.getIntExtra(EXTRA_NOTIF_ID, 1001);
        String title = intent.getStringExtra(EXTRA_TITLE);
        String body = intent.getStringExtra(EXTRA_BODY);
        String soundName = intent.getStringExtra(EXTRA_SOUND_NAME);
        String soundUri = intent.getStringExtra(EXTRA_SOUND_URI);
        boolean isArabic = intent.getBooleanExtra(EXTRA_IS_ARABIC, true);

        if (title == null || title.isEmpty()) {
            title = isArabic ? "حان الآن موعد الأذان" : "It is time for Adhan";
        }
        if (body == null) body = "";
        if (soundName == null || soundName.isEmpty()) soundName = "takbeer1";

        int volumePercent = getSavedAlertVolume(this);
        if (volumePercent <= 0) {
            // Muted: post silent notification and do not play audio
            Notification silentNotif = buildAdhanNotification(this, notifId, title, body, isArabic, false, false);
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.notify(notifId, silentNotif);
                AlertsGroupHelper.updateGroupSummary(this, nm);
            }
            stopSelf();
            return START_NOT_STICKY;
        }

        Notification foregroundNotif = buildAdhanNotification(this, notifId, title, body, isArabic, true, true);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(notifId, foregroundNotif, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(notifId, foregroundNotif);
            }
        } catch (Exception e) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.notify(notifId, foregroundNotif);
                AlertsGroupHelper.updateGroupSummary(this, nm);
            }
        }

        startPlayback(this, notifId, title, body, soundName, soundUri, isArabic, volumePercent);
        return START_NOT_STICKY;
    }

    /**
     * Fallback playback helper used if the OS denies startForegroundService().
     */
    public static void playDirectFallback(
        Context context,
        int notifId,
        String title,
        String body,
        String soundName,
        String soundUri,
        boolean isArabic
    ) {
        if (context == null) return;
        int volumePercent = getSavedAlertVolume(context);
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (volumePercent <= 0) {
            if (nm != null) {
                nm.notify(notifId, buildAdhanNotification(context, notifId, title, body, isArabic, false, false));
                AlertsGroupHelper.updateGroupSummary(context, nm);
            }
            return;
        }

        if (nm != null) {
            nm.notify(notifId, buildAdhanNotification(context, notifId, title, body, isArabic, true, false));
            AlertsGroupHelper.updateGroupSummary(context, nm);
        }
        startPlayback(context.getApplicationContext(), notifId, title, body, soundName, soundUri, isArabic, volumePercent);
    }

    private static synchronized void startPlayback(
        final Context context,
        final int notifId,
        final String title,
        final String body,
        final String soundName,
        final String soundUri,
        final boolean isArabic,
        final int volumePercent
    ) {
        releasePlayerAndWakeLock();

        activeNotifId = notifId;
        activeTitle = title;
        activeBody = body;
        activeIsArabic = isArabic;

        // Acquire wake lock bounded to 5 minutes so long Adhans finish reliably even with screen off
        try {
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                activeWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Mushaf:AdhanPlaybackWakeLock");
                activeWakeLock.setReferenceCounted(false);
                activeWakeLock.acquire(5 * 60 * 1000L);
            }
        } catch (Exception ignored) {}

        AudioAttributes alarmAttrs = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
            .build();

        // Request transient audio focus on ALARM usage
        try {
            activeAudioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            if (activeAudioManager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    activeAudioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                        .setAudioAttributes(alarmAttrs)
                        .build();
                    activeAudioManager.requestAudioFocus(activeAudioFocusRequest);
                } else {
                    activeAudioManager.requestAudioFocus(null, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK);
                }
            }
        } catch (Exception ignored) {}

        float scaledVol = computeScaledVolume(volumePercent);
        MediaPlayer mp = null;

        try {
            // 1. Try custom URI if provided (file:// or content://)
            if (soundUri != null && (soundUri.startsWith("file://") || soundUri.startsWith("content://"))) {
                try {
                    mp = new MediaPlayer();
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        mp.setAudioAttributes(alarmAttrs);
                    } else {
                        mp.setAudioStreamType(AudioManager.STREAM_ALARM);
                    }
                    mp.setDataSource(context, Uri.parse(soundUri));
                    mp.prepare();
                } catch (Exception customErr) {
                    if (mp != null) {
                        try { mp.release(); } catch (Exception ignored) {}
                        mp = null;
                    }
                }
            }

            // 2. Load bundled tone from res/raw
            if (mp == null) {
                String cleanName = soundName != null ? soundName.toLowerCase().trim() : "takbeer1";
                if (cleanName.contains(".")) {
                    cleanName = cleanName.substring(0, cleanName.lastIndexOf("."));
                }
                cleanName = cleanName.replaceAll("[^a-z0-9_]", "");
                if (cleanName.isEmpty()) cleanName = "takbeer1";

                int resId = context.getResources().getIdentifier(cleanName, "raw", context.getPackageName());
                if (resId == 0) {
                    resId = context.getResources().getIdentifier("takbeer1", "raw", context.getPackageName());
                }

                if (resId != 0) {
                    mp = new MediaPlayer();
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        mp.setAudioAttributes(alarmAttrs);
                    } else {
                        mp.setAudioStreamType(AudioManager.STREAM_ALARM);
                    }
                    android.content.res.AssetFileDescriptor afd = context.getResources().openRawResourceFd(resId);
                    if (afd != null) {
                        mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                        afd.close();
                        mp.prepare();
                    } else {
                        mp.release();
                        mp = null;
                    }
                }
            }

            if (mp != null) {
                activePlayer = mp;
                mp.setLooping(false);
                mp.setVolume(scaledVol, scaledVol);
                mp.setOnCompletionListener(player -> finishPlayback(context, false));
                mp.setOnErrorListener((player, what, extra) -> {
                    finishPlayback(context, false);
                    return true;
                });
                mp.start();
                AutoSilentPlugin.notifyAdhanPlaybackStateChanged(true);
            } else {
                finishPlayback(context, false);
            }
        } catch (Exception e) {
            finishPlayback(context, false);
        }
    }

    /**
     * Adjusts Adhan volume in real time if an Adhan notification is currently playing.
     */
    public static synchronized void updateVolume(Context context, int volumePercent) {
        MediaPlayer mp = activePlayer;
        if (mp == null) return;
        try {
            if (volumePercent <= 0) {
                stopIfPlaying(context, false);
            } else {
                float scaled = computeScaledVolume(volumePercent);
                mp.setVolume(scaled, scaled);
            }
        } catch (Exception ignored) {}
    }

    public static synchronized void stopIfPlaying(Context context, boolean cancelNotification) {
        if (activePlayer != null || runningInstance != null) {
            finishPlayback(context, cancelNotification);
        } else if (cancelNotification && context != null) {
            try {
                NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    nm.cancel(activeNotifId);
                    AlertsGroupHelper.updateGroupSummary(context, nm);
                }
            } catch (Exception ignored) {}
        }
    }

    private static synchronized void finishPlayback(Context context, boolean cancelNotification) {
        releasePlayerAndWakeLock();
        AutoSilentPlugin.notifyAdhanPlaybackStateChanged(false);

        AdhanPlaybackService svc = runningInstance;
        runningInstance = null;

        Context appCtx = context != null ? context.getApplicationContext() : (svc != null ? svc.getApplicationContext() : null);
        NotificationManager nm = appCtx != null ? (NotificationManager) appCtx.getSystemService(Context.NOTIFICATION_SERVICE) : null;

        if (svc != null) {
            try {
                ServiceCompat.stopForeground(svc, ServiceCompat.STOP_FOREGROUND_REMOVE);
            } catch (Exception ignored) {}
            try {
                svc.stopSelf();
            } catch (Exception ignored) {}
        }

        if (appCtx != null && nm != null) {
            try {
                if (cancelNotification) {
                    nm.cancel(activeNotifId);
                } else if (activeTitle != null && !activeTitle.isEmpty()) {
                    // Replace foreground notification with clean dismissible alert in Prayer group
                    Notification normalNotif = buildAdhanNotification(
                        appCtx,
                        activeNotifId,
                        activeTitle,
                        activeBody != null ? activeBody : "",
                        activeIsArabic,
                        false,
                        false
                    );
                    nm.notify(activeNotifId, normalNotif);
                }
                AlertsGroupHelper.updateGroupSummary(appCtx, nm);
            } catch (Exception ignored) {}
        }
    }

    private static synchronized void releasePlayerAndWakeLock() {
        if (activePlayer != null) {
            try {
                if (activePlayer.isPlaying()) {
                    activePlayer.stop();
                }
            } catch (Exception ignored) {}
            try {
                activePlayer.release();
            } catch (Exception ignored) {}
            activePlayer = null;
        }

        if (activeAudioManager != null) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && activeAudioFocusRequest != null) {
                    activeAudioManager.abandonAudioFocusRequest(activeAudioFocusRequest);
                } else {
                    activeAudioManager.abandonAudioFocus(null);
                }
            } catch (Exception ignored) {}
            activeAudioFocusRequest = null;
            activeAudioManager = null;
        }

        if (activeWakeLock != null && activeWakeLock.isHeld()) {
            try {
                activeWakeLock.release();
            } catch (Exception ignored) {}
        }
        activeWakeLock = null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        releasePlayerAndWakeLock();
        runningInstance = null;
    }
}
