package com.mushaf.ahmedandlayla;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import org.json.JSONObject;

public class PersistentPrayerNotification {

    public static final String CHANNEL_ID = "persistent_prayer_channel_v1";
    public static final int NOTIFICATION_ID = 9901;

    public static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "إشعار مواقيت الصلاة المستمر",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("يعرض الصلاة القادمة والوقت المتبقي في شريط الإشعارات وشاشة القفل بدون صوت");
            channel.setShowBadge(false);
            channel.enableVibration(false);
            channel.setSound(null, null);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            nm.createNotificationChannel(channel);
        }
    }

    public static void update(Context context) {
        if (context == null) return;
        
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        
        // Enabled by default unless explicitly disabled ("false")
        String enabledStr = prefs.getString("persistent_prayer_notification_enabled", "true");
        boolean isEnabled = !"false".equalsIgnoreCase(enabledStr);

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (!isEnabled) {
            nm.cancel(NOTIFICATION_ID);
            return;
        }

        String prayerJson = prefs.getString("widget_prayer_data", null);
        if (prayerJson == null || prayerJson.trim().isEmpty()) {
            return;
        }

        try {
            createChannel(context);

            JSONObject data = new JSONObject(prayerJson);
            boolean isArabic = java.util.Locale.getDefault().getLanguage().equals("ar");

            String nextPrayerName = data.optString("next_prayer_name", isArabic ? "الصلاة" : "Prayer");
            long targetTimeMillis = data.optLong("target_time_millis", 0);

            // Calculate formatted remaining time (e.g. 01:24 or 00:45)
            String remainingFormatted = "";
            long now = System.currentTimeMillis();
            if (targetTimeMillis > now) {
                long diffMillis = targetTimeMillis - now;
                long totalMinutes = (diffMillis + 59999) / 60000; // round up to nearest minute
                long hours = totalMinutes / 60;
                long minutes = totalMinutes % 60;
                remainingFormatted = String.format(java.util.Locale.US, "%02d:%02d", hours, minutes);
            } else {
                String rt = data.optString("remaining_time", "");
                if (!rt.isEmpty()) {
                    remainingFormatted = rt;
                }
            }

            JSONObject times = data.optJSONObject("times");
            StringBuilder summary = new StringBuilder();
            if (times != null) {
                if (isArabic) {
                    summary.append("الفجر: ").append(times.optString("fajr", ""))
                           .append(" • الظهر: ").append(times.optString("dhuhr", ""))
                           .append(" • العصر: ").append(times.optString("asr", ""))
                           .append(" • المغرب: ").append(times.optString("maghrib", ""))
                           .append(" • العشاء: ").append(times.optString("isha", ""));
                } else {
                    summary.append("Fajr: ").append(times.optString("fajr", ""))
                           .append(" • Dhuhr: ").append(times.optString("dhuhr", ""))
                           .append(" • Asr: ").append(times.optString("asr", ""))
                           .append(" • Maghrib: ").append(times.optString("maghrib", ""))
                           .append(" • Isha: ").append(times.optString("isha", ""));
                }
            }

            Intent openAppIntent = new Intent(context, MainActivity.class);
            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(context, NOTIFICATION_ID, openAppIntent, flags);

            // Display remaining time directly beside the next prayer name without city
            String title = (isArabic ? "الصلاة القادمة: " : "Next Prayer: ") + nextPrayerName;
            if (!remainingFormatted.isEmpty()) {
                title += " (" + (isArabic ? "متبقي " : "in ") + remainingFormatted + ")";
            }

            // Restore intent: if swiped away while enabled, automatically restore it
            Intent deleteIntent = new Intent(context, PrayerSilentReceiver.class);
            deleteIntent.setAction(PrayerSilentReceiver.ACTION_RESTORE_NOTIFICATION);
            PendingIntent deletePi = PendingIntent.getBroadcast(context, 9902, deleteIntent, flags);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setContentTitle(title)
                .setContentIntent(pendingIntent)
                .setDeleteIntent(deletePi)
                .setOngoing(true)
                .setAutoCancel(false)
                .setOnlyAlertOnce(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setShowWhen(false)
                .setContentText(summary.toString());

            // Notice: LargeIcon is deliberately omitted so the app icon does not appear twice

            if (summary.length() > 0) {
                builder.setStyle(new NotificationCompat.BigTextStyle()
                    .setBigContentTitle(title)
                    .bigText(summary.toString())
                );
            }

            Notification notification = builder.build();
            // Critical persistence flags: prevents removal via "Clear all" button and marks as persistent
            notification.flags |= Notification.FLAG_ONGOING_EVENT;
            notification.flags |= Notification.FLAG_NO_CLEAR;

            nm.notify(NOTIFICATION_ID, notification);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void cancel(Context context) {
        if (context == null) return;
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.cancel(NOTIFICATION_ID);
        }
    }
}
