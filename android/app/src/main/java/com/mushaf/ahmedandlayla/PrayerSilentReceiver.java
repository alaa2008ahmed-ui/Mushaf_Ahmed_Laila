package com.mushaf.ahmedandlayla;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class PrayerSilentReceiver extends BroadcastReceiver {
    public static final String ACTION_START_SILENT = "com.mushaf.ahmedandlayla.ACTION_START_SILENT";
    public static final String ACTION_END_SILENT = "com.mushaf.ahmedandlayla.ACTION_END_SILENT";
    public static final String EXTRA_PRAYER_NAME = "prayer_name";
    public static final String EXTRA_DURATION = "duration";
    public static final String EXTRA_WINDOW_ID = "window_id";

    private static final String PREFS_NAME = "PrayerSilentPrefs";
    private static final String KEY_ORIGINAL_RINGER_MODE = "original_ringer_mode";
    private static final String CHANNEL_ID = "prayer_silent_channel";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (action == null) return;

        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        if (audioManager == null) return;

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME);
        if (prayerName == null || prayerName.isEmpty()) {
            prayerName = "الصلاة";
        }

        if (ACTION_START_SILENT.equals(action)) {
            // Save current ringer mode before muting (only if not already muted)
            int currentMode = audioManager.getRingerMode();
            if (currentMode != AudioManager.RINGER_MODE_SILENT && currentMode != AudioManager.RINGER_MODE_VIBRATE) {
                prefs.edit().putInt(KEY_ORIGINAL_RINGER_MODE, currentMode).apply();
            }

            // Apply Silent Mode
            applySilentMode(context, audioManager);
            showNotification(context, 9901, "🔕 تم تفعيل وضع الصامت", "تم كتم صوت الهاتف تلقائياً لأداء صلاة " + prayerName);

        } else if (ACTION_END_SILENT.equals(action)) {
            // Restore original ringer mode
            int originalMode = prefs.getInt(KEY_ORIGINAL_RINGER_MODE, AudioManager.RINGER_MODE_NORMAL);
            restoreRingerMode(context, audioManager, originalMode);
            showNotification(context, 9902, "🔔 تم إنهاء وضع الصامت", "تم إعادة تفعيل صوت الهاتف بعد انتهاء صلاة " + prayerName);
        }
    }

    private void applySilentMode(Context context, AudioManager audioManager) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null && nm.isNotificationPolicyAccessGranted()) {
                    audioManager.setRingerMode(AudioManager.RINGER_MODE_SILENT);
                } else {
                    // Fallback to Vibrate if DND not granted
                    audioManager.setRingerMode(AudioManager.RINGER_MODE_VIBRATE);
                }
            } else {
                audioManager.setRingerMode(AudioManager.RINGER_MODE_SILENT);
            }
        } catch (SecurityException se) {
            try {
                audioManager.setRingerMode(AudioManager.RINGER_MODE_VIBRATE);
            } catch (Exception ignored) {}
        } catch (Exception ignored) {}
    }

    private void restoreRingerMode(Context context, AudioManager audioManager, int mode) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null && nm.isNotificationPolicyAccessGranted()) {
                    audioManager.setRingerMode(mode);
                } else {
                    audioManager.setRingerMode(AudioManager.RINGER_MODE_NORMAL);
                }
            } else {
                audioManager.setRingerMode(mode);
            }
        } catch (SecurityException se) {
            try {
                audioManager.setRingerMode(AudioManager.RINGER_MODE_NORMAL);
            } catch (Exception ignored) {}
        } catch (Exception ignored) {}
    }

    private void showNotification(Context context, int notifId, String title, String message) {
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "الصامت التلقائي للصلاة",
                    NotificationManager.IMPORTANCE_DEFAULT
                );
                channel.setDescription("إشعارات تفعيل وإلغاء وضع الصامت التلقائي أثناء الصلاة");
                nm.createNotificationChannel(channel);
            }

            Intent openAppIntent = new Intent(context, MainActivity.class);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(context, notifId, openAppIntent, flags);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setContentTitle(title)
                .setContentText(message)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);

            try {
                android.graphics.Bitmap largeIcon = android.graphics.BitmapFactory.decodeResource(context.getResources(), R.drawable.app_logo_large);
                if (largeIcon != null) {
                    builder.setLargeIcon(largeIcon);
                }
            } catch (Exception ignored) {}

            nm.notify(notifId, builder.build());
        } catch (Exception ignored) {}
    }
}
