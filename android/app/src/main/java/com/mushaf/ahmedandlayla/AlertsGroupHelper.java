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
 * Manages separate Group Summaries for:
 * 1) Prayer Alerts Card (Adhan, Pre-Adhan, Iqama, Auto-Silent) -> PRAYER_GROUP_KEY
 * 2) General Alerts Card (Daily Wird, Adhkar, Habits, Duas, Occasions) -> GENERAL_GROUP_KEY
 * 
 * PersistentPrayerNotification remains completely independent in its own ongoing card
 * (PERSISTENT_PRAYER_CARD) with badge disabled.
 */
public class AlertsGroupHelper {

    // Card 2: Prayer Notifications Group
    public static final String PRAYER_GROUP_KEY = "com.mushaf.ahmedandlayla.PRAYER_ALERTS_CARD";
    public static final int PRAYER_SUMMARY_ID = 8980;
    public static final String PRAYER_SUMMARY_CHANNEL_ID = "prayer_alerts_summary_channel_v2";

    // Card 3: General App Alerts Group (Wird, Adhkar, Habits, Duas)
    public static final String GENERAL_GROUP_KEY = "com.mushaf.ahmedandlayla.GENERAL_ALERTS_CARD";
    public static final int GENERAL_SUMMARY_ID = 8990;
    public static final String GENERAL_SUMMARY_CHANNEL_ID = "general_alerts_summary_channel_v2";

    // Legacy fallback constant for backwards compatibility
    public static final String GROUP_KEY = GENERAL_GROUP_KEY;
    public static final int SUMMARY_NOTIFICATION_ID = GENERAL_SUMMARY_ID;

    public static void updateGroupSummary(Context context, NotificationManager nm) {
        if (context == null) return;
        if (nm == null) {
            nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        }
        if (nm == null) return;

        try {
            int activePrayerCount = 0;
            int activeGeneralCount = 0;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    android.service.notification.StatusBarNotification[] active = nm.getActiveNotifications();
                    if (active != null) {
                        for (android.service.notification.StatusBarNotification sbn : active) {
                            int id = sbn.getId();
                            // Skip persistent prayer notification and group summary cards
                            if (id == PersistentPrayerNotification.NOTIFICATION_ID || 
                                id == PRAYER_SUMMARY_ID || 
                                id == GENERAL_SUMMARY_ID) {
                                continue;
                            }

                            android.app.Notification notif = sbn.getNotification();
                            if (notif != null && (notif.flags & android.app.Notification.FLAG_ONGOING_EVENT) == 0) {
                                String grp = notif.getGroup();
                                if (PRAYER_GROUP_KEY.equals(grp)) {
                                    activePrayerCount++;
                                } else if (GENERAL_GROUP_KEY.equals(grp)) {
                                    activeGeneralCount++;
                                } else {
                                    // Fallback heuristic based on notification ID
                                    if ((id >= 1000 && id < 6000) || id == 9401 || id == 9402) {
                                        activePrayerCount++;
                                    } else {
                                        activeGeneralCount++;
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception ignored) {}
            } else {
                activePrayerCount = 0;
                activeGeneralCount = 0;
            }

            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String appLang = prefs.getString("app_language", "ar");
            boolean isArabic = !"en".equalsIgnoreCase(appLang);

            // --- 1. Manage Prayer Alerts Card Summary (ID: 8980) ---
            if (activePrayerCount >= 2 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    NotificationChannel prayerChan = nm.getNotificationChannel(PRAYER_SUMMARY_CHANNEL_ID);
                    if (prayerChan == null) {
                        prayerChan = new NotificationChannel(
                            PRAYER_SUMMARY_CHANNEL_ID,
                            isArabic ? "تنبيهات مواقيت الصلاة والأذان" : "Prayer Times & Adhan Alerts",
                            NotificationManager.IMPORTANCE_HIGH
                        );
                        prayerChan.setShowBadge(false); // Summary cards must not affect app icon badge
                        prayerChan.enableVibration(true);
                        nm.createNotificationChannel(prayerChan);
                    }
                }

                Intent openPrayerIntent = new Intent(context, MainActivity.class);
                openPrayerIntent.putExtra("shortcut_target", "prayer-times");
                openPrayerIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                PendingIntent prayerPi = PendingIntent.getActivity(context, PRAYER_SUMMARY_ID, openPrayerIntent, flags);

                String prayerTitle = isArabic ? "مواقيت الصلاة والأذان" : "Prayer Times & Adhan";
                String prayerSub = isArabic ? "تنبيهات الصلاة" : "Prayer Alerts";
                String prayerBody = isArabic ? "تنبيهات الأذان والإقامة والاستعداد للصلاة" : "Adhan, Iqama & Preparation Alerts";

                NotificationCompat.Builder prayerSummary = new NotificationCompat.Builder(context, PRAYER_SUMMARY_CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_stat_name)
                    .setColor(0xFF2E7D5E)
                    .setContentTitle(prayerTitle)
                    .setContentText(prayerBody)
                    .setSubText(prayerSub)
                    .setStyle(new NotificationCompat.InboxStyle().setSummaryText(prayerSub))
                    .setGroup(PRAYER_GROUP_KEY)
                    .setGroupSummary(true)
                    .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
                    .setBadgeIconType(NotificationCompat.BADGE_ICON_NONE)
                    .setNumber(0)
                    .setAutoCancel(true)
                    .setOnlyAlertOnce(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setContentIntent(prayerPi);

                nm.notify(PRAYER_SUMMARY_ID, prayerSummary.build());
            } else {
                nm.cancel(PRAYER_SUMMARY_ID);
            }

            // --- 2. Manage General Alerts Card Summary (ID: 8990) ---
            if (activeGeneralCount >= 2 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    NotificationChannel generalChan = nm.getNotificationChannel(GENERAL_SUMMARY_CHANNEL_ID);
                    if (generalChan == null) {
                        generalChan = new NotificationChannel(
                            GENERAL_SUMMARY_CHANNEL_ID,
                            isArabic ? "الأذكار والورد القرآني" : "Adhkar & Daily Wird",
                            NotificationManager.IMPORTANCE_HIGH
                        );
                        generalChan.setShowBadge(false); // Summary cards must not affect app icon badge
                        generalChan.enableVibration(true);
                        nm.createNotificationChannel(generalChan);
                    }
                }

                Intent openGeneralIntent = new Intent(context, MainActivity.class);
                openGeneralIntent.putExtra("shortcut_target", "daily-wird");
                openGeneralIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                PendingIntent generalPi = PendingIntent.getActivity(context, GENERAL_SUMMARY_ID, openGeneralIntent, flags);

                String generalTitle = isArabic ? "الأذكار والورد القرآني" : "Daily Wird & Adhkar";
                String generalSub = isArabic ? "تنبيهات التطبيق" : "App Notifications";
                String generalBody = isArabic ? "الورد اليومي وأذكار الصباح والمساء والسنن" : "Daily Wird, Sabah/Masaa Adhkar & Habits";

                NotificationCompat.Builder generalSummary = new NotificationCompat.Builder(context, GENERAL_SUMMARY_CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_stat_name)
                    .setColor(0xFF2E7D5E)
                    .setContentTitle(generalTitle)
                    .setContentText(generalBody)
                    .setSubText(generalSub)
                    .setStyle(new NotificationCompat.InboxStyle().setSummaryText(generalSub))
                    .setGroup(GENERAL_GROUP_KEY)
                    .setGroupSummary(true)
                    .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
                    .setBadgeIconType(NotificationCompat.BADGE_ICON_NONE)
                    .setNumber(0)
                    .setAutoCancel(true)
                    .setOnlyAlertOnce(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setContentIntent(generalPi);

                nm.notify(GENERAL_SUMMARY_ID, generalSummary.build());
            } else {
                nm.cancel(GENERAL_SUMMARY_ID);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
