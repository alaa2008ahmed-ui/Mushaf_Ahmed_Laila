package com.mushaf.ahmedandlayla;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

/**
 * Foreground MediaPlayback service that keeps WebView Quran listening playback
 * alive when the user minimizes the app to the background on Android, and stops
 * cleanly when the user closes/swipes away the app from Recents.
 */
public class QuranPlaybackKeepAliveService extends Service {

    public static final String CHANNEL_ID = "quran_background_playback_v1";
    public static final int NOTIFICATION_ID = 9951;

    public static final String ACTION_START_OR_UPDATE = "com.mushaf.ahmedandlayla.ACTION_QURAN_BG_START";
    public static final String ACTION_STOP = "com.mushaf.ahmedandlayla.ACTION_QURAN_BG_STOP";

    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_SUBTITLE = "subtitle";
    public static final String EXTRA_IS_ARABIC = "is_arabic";

    private static volatile boolean playbackActive = false;
    private static volatile PowerManager.WakeLock wakeLock = null;

    public static boolean isPlaybackActive() {
        return playbackActive;
    }

    public static void setPlaybackFlag(boolean active) {
        playbackActive = active;
    }

    public static void startOrUpdate(Context context, String title, String subtitle, boolean isArabic) {
        if (context == null) return;
        playbackActive = true;
        Intent intent = new Intent(context.getApplicationContext(), QuranPlaybackKeepAliveService.class);
        intent.setAction(ACTION_START_OR_UPDATE);
        intent.putExtra(EXTRA_TITLE, title);
        intent.putExtra(EXTRA_SUBTITLE, subtitle);
        intent.putExtra(EXTRA_IS_ARABIC, isArabic);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.getApplicationContext().startForegroundService(intent);
            } else {
                context.getApplicationContext().startService(intent);
            }
        } catch (Exception e) {
            try {
                context.getApplicationContext().startService(intent);
            } catch (Exception ignored) {}
        }
    }

    public static void stopService(Context context) {
        playbackActive = false;
        releaseWakeLock();
        if (context == null) return;
        try {
            Intent intent = new Intent(context.getApplicationContext(), QuranPlaybackKeepAliveService.class);
            context.getApplicationContext().stopService(intent);
        } catch (Exception ignored) {}
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(NOTIFICATION_ID);
            }
        } catch (Exception ignored) {}
    }

    private static synchronized void acquireWakeLock(Context context) {
        if (context == null) return;
        try {
            if (wakeLock == null) {
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Mushaf:QuranBgAudioWakeLock");
                    wakeLock.setReferenceCounted(false);
                }
            }
            if (wakeLock != null && !wakeLock.isHeld()) {
                // Bounded to 3 hours max safety; re-acquired on updates
                wakeLock.acquire(3 * 60 * 60 * 1000L);
            }
        } catch (Exception ignored) {}
    }

    private static synchronized void releaseWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Exception ignored) {}
        wakeLock = null;
    }

    private void ensureChannel(boolean isArabic) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            NotificationChannel existing = nm.getNotificationChannel(CHANNEL_ID);
            if (existing != null) return;

            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                isArabic ? "تشغيل القرآن في الخلفية" : "Background Quran Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription(isArabic
                ? "إبقاء تلاوة القرآن الكريم تعمل بسلاسة في الخلفية"
                : "Keeps Holy Quran recitation playing smoothly in the background");
            channel.setShowBadge(false);
            channel.enableVibration(false);
            channel.setSound(null, null);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification(String title, String subtitle, boolean isArabic) {
        ensureChannel(isArabic);

        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        // Open existing app task at whatever page user left (ListenQuran or Floating Button page)
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPi = PendingIntent.getActivity(this, NOTIFICATION_ID, openIntent, piFlags);

        Intent stopIntent = new Intent(this, QuranPlaybackKeepAliveService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(this, NOTIFICATION_ID + 1, stopIntent, piFlags);

        String displayTitle = (title != null && !title.trim().isEmpty())
            ? title
            : (isArabic ? "الاستماع للقرآن الكريم" : "Listen to Holy Quran");
        String displaySubtitle = (subtitle != null && !subtitle.trim().isEmpty())
            ? subtitle
            : (isArabic ? "التلاوة مستمرة" : "Recitation playing");

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_name)
            .setColor(0xFF2E7D5E)
            .setContentTitle(displayTitle)
            .setContentText(displaySubtitle)
            .setSubText(isArabic ? "الاستماع للقرآن" : "Quran Audio")
            .setContentIntent(contentPi)
            .setOngoing(true)
            .setAutoCancel(false)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setShowWhen(false)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setBadgeIconType(NotificationCompat.BADGE_ICON_NONE)
            .setNumber(0)
            .addAction(0, isArabic ? "إيقاف" : "Stop", stopPi)
            .build();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            playbackActive = false;
            releaseWakeLock();
            AutoSilentPlugin.notifyQuranPlaybackStoppedFromNotification(this);
            try {
                ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE);
            } catch (Exception ignored) {}
            stopSelf();
            return START_NOT_STICKY;
        }

        if (intent == null || !playbackActive) {
            releaseWakeLock();
            try {
                ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE);
            } catch (Exception ignored) {}
            stopSelf();
            return START_NOT_STICKY;
        }

        String title = intent.getStringExtra(EXTRA_TITLE);
        String subtitle = intent.getStringExtra(EXTRA_SUBTITLE);
        boolean isArabic = intent.getBooleanExtra(EXTRA_IS_ARABIC, true);

        Notification notif = buildNotification(title, subtitle, isArabic);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, notif);
            }
        } catch (Exception e) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.notify(NOTIFICATION_ID, notif);
            }
        }

        acquireWakeLock(this);
        return START_NOT_STICKY;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // When user closes/swipes away the app from Recents, end background playback cleanly
        playbackActive = false;
        releaseWakeLock();
        try {
            ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE);
        } catch (Exception ignored) {}
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(NOTIFICATION_ID);
            }
        } catch (Exception ignored) {}
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        playbackActive = false;
        releaseWakeLock();
        try {
            ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE);
        } catch (Exception ignored) {}
        super.onDestroy();
    }
}
