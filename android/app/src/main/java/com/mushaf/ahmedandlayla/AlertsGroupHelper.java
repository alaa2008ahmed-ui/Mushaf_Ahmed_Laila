package com.mushaf.ahmedandlayla;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.core.app.NotificationCompat;

/**
 * Manages the Group Summary notification for all non-persistent app alerts
 * (Adhkar, Duas, Prayer/Adhan times, Daily Wird).
 * 
 * By maintaining an explicit Group Summary for "com.mushaf.ahmedandlayla.APP_ALERTS_CARD",
 * Android and Samsung One UI group all alerts into their own distinct notification card,
 * while leaving PersistentPrayerNotification completely independent on its own ongoing card.
 */
public class AlertsGroupHelper {

    public static final String GROUP_KEY = "com.mushaf.ahmedandlayla.APP_ALERTS_CARD";
    public static final int SUMMARY_NOTIFICATION_ID = 8990;
    public static final String SUMMARY_CHANNEL_ID = "athkar_v3_chime_channel";

    public static void updateGroupSummary(Context context, NotificationManager nm) {
        if (context == null) return;
        if (nm == null) {
            nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        }
        if (nm == null) return;

        try {
            int activeAlertsCount = 0;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    android.service.notification.StatusBarNotification[] active = nm.getActiveNotifications();
                    if (active != null) {
                        for (android.service.notification.StatusBarNotification sbn : active) {
                            int id = sbn.getId();
                            // Do not count the persistent prayer notification or the summary card itself
                            if (id != PersistentPrayerNotification.NOTIFICATION_ID && id != SUMMARY_NOTIFICATION_ID) {
                                activeAlertsCount++;
                            }
                        }
                    }
                } catch (Exception ignored) {}
            } else {
                activeAlertsCount = 2; // Safe fallback for older Android versions
            }

            // If there are no active alert notifications in the shade, cancel the summary card
            if (activeAlertsCount == 0 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                nm.cancel(SUMMARY_NOTIFICATION_ID);
                return;
            }

            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String appLang = prefs.getString("app_language", "ar");
            boolean isArabic = !"en".equalsIgnoreCase(appLang);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = nm.getNotificationChannel(SUMMARY_CHANNEL_ID);
                if (channel == null) {
                    channel = new NotificationChannel(
                        SUMMARY_CHANNEL_ID,
                        isArabic ? "أذكار وتنبيهات عامة" : "General Reminders & Adhkar",
                        NotificationManager.IMPORTANCE_HIGH
                    );
                    channel.enableVibration(true);
                    nm.createNotificationChannel(channel);
                }
            }

            Intent openAppIntent = new Intent(context, MainActivity.class);
            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(context, SUMMARY_NOTIFICATION_ID, openAppIntent, flags);

            String title = isArabic ? "مصحف أحمد وليلى" : "Mushaf Ahmed & Layla";
            String subText = isArabic ? "تنبيهات التطبيق" : "App Notifications";
            String contentText = isArabic 
                ? "الأذكار ومواقيت الصلاة والأدعية" 
                : "Adhkar, Prayers & Duas Alerts";

            NotificationCompat.Builder summary = new NotificationCompat.Builder(context, SUMMARY_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setColor(0xFF2E7D5E)
                .setContentTitle(title)
                .setContentText(contentText)
                .setSubText(subText)
                .setStyle(new NotificationCompat.InboxStyle().setSummaryText(subText))
                .setGroup(GROUP_KEY)
                .setGroupSummary(true)
                .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
                .setAutoCancel(true)
                .setOnlyAlertOnce(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent);

            nm.notify(SUMMARY_NOTIFICATION_ID, summary.build());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
