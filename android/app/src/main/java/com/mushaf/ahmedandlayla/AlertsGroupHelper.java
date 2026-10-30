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
 * Manages separate, strictly isolated Group Summaries for:
 * 1) Card 1: Persistent Prayer Notification (standalone, ongoing, group=null, NEVER grouped with alerts)
 * 2) Card 2: Prayer Alerts Card (Adhan, Pre-Adhan, Iqama, Auto-Silent Start/End) -> PRAYER_GROUP_KEY
 * 3) Card 3: General Alerts Card (Daily Wird, Adhkar, Habits, Duas, Occasions) -> GENERAL_GROUP_KEY
 */
public class AlertsGroupHelper {

    // Card 2: Prayer Notifications Group (Adhan, Pre-Adhan, Iqama, Auto-Silent, Night)
    public static final String PRAYER_GROUP_KEY = "com.mushaf.ahmedandlayla.PRAYER_ALERTS_CARD";
    public static final int PRAYER_SUMMARY_ID = 8980;
    public static final String PRAYER_SUMMARY_CHANNEL_ID = "prayer_alerts_summary_channel_v2";

    // Card 3: General App Alerts Group (Wird, Adhkar, Habits, Duas, Occasions)
    public static final String GENERAL_GROUP_KEY = "com.mushaf.ahmedandlayla.GENERAL_ALERTS_CARD";
    public static final int GENERAL_SUMMARY_ID = 8990;
    public static final String GENERAL_SUMMARY_CHANNEL_ID = "general_alerts_summary_channel_v2";

    // Legacy fallback constant for backwards compatibility
    public static final String GROUP_KEY = GENERAL_GROUP_KEY;
    public static final int SUMMARY_NOTIFICATION_ID = GENERAL_SUMMARY_ID;

    public static synchronized void updateGroupSummary(Context context, NotificationManager nm) {
        if (context == null) return;
        if (nm == null) {
            nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        }
        if (nm == null) return;

        try {
            int activePrayerCount = 0;
            int activeGeneralCount = 0;
            java.util.List<String> prayerLines = new java.util.ArrayList<>();
            java.util.List<String> generalLines = new java.util.ArrayList<>();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    android.service.notification.StatusBarNotification[] active = nm.getActiveNotifications();
                    if (active != null) {
                        for (android.service.notification.StatusBarNotification sbn : active) {
                            int id = sbn.getId();
                            // Skip persistent prayer notification and group summary cards themselves
                            if (id == PersistentPrayerNotification.NOTIFICATION_ID || 
                                id == PRAYER_SUMMARY_ID || 
                                id == GENERAL_SUMMARY_ID) {
                                continue;
                            }

                            android.app.Notification notif = sbn.getNotification();
                            if (notif != null && (notif.flags & android.app.Notification.FLAG_ONGOING_EVENT) == 0) {
                                String grp = notif.getGroup();
                                String title = "";
                                if (notif.extras != null) {
                                    CharSequence cs = notif.extras.getCharSequence(android.app.Notification.EXTRA_TITLE);
                                    if (cs != null) title = cs.toString();
                                }

                                if (PRAYER_GROUP_KEY.equals(grp)) {
                                    activePrayerCount++;
                                    if (!title.isEmpty()) prayerLines.add(title);
                                } else if (GENERAL_GROUP_KEY.equals(grp)) {
                                    activeGeneralCount++;
                                    if (!title.isEmpty()) generalLines.add(title);
                                } else {
                                    // Fallback heuristic based on notification ID:
                                    // Prayer alerts: Adhan (1000..5999), Pre-Adhan (5000..5999), Iqama (6000..6999), Auto-silent (7000..8999, 9401, 9402), Night (2000..2999)
                                    if ((id >= 1000 && id < 9000) || id == 9401 || id == 9402) {
                                        activePrayerCount++;
                                        if (!title.isEmpty()) prayerLines.add(title);
                                    } else {
                                        activeGeneralCount++;
                                        if (!title.isEmpty()) generalLines.add(title);
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

            // --- 1. Manage Prayer Alerts Card Summary (Card 2: ID 8980) ---
            // Whenever at least 1 prayer alert is active, maintain Card 2 so Android groups all prayer alerts here
            if (activePrayerCount >= 1 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
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
                String prayerBody = isArabic ? "تنبيهات الأذان، قبل الصلاة، الإقامة، والوضع الصامت" : "Adhan, Pre-Prayer, Iqama & Auto-Silent Alerts";

                NotificationCompat.InboxStyle inboxStyle = new NotificationCompat.InboxStyle();
                inboxStyle.setSummaryText(prayerSub);
                inboxStyle.setBigContentTitle(prayerTitle);
                for (String line : prayerLines) {
                    inboxStyle.addLine(line);
                }

                NotificationCompat.Builder prayerSummary = new NotificationCompat.Builder(context, PRAYER_SUMMARY_CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_stat_name)
                    .setColor(0xFF2E7D5E)
                    .setContentTitle(prayerTitle)
                    .setContentText(prayerBody)
                    .setSubText(prayerSub)
                    .setStyle(inboxStyle)
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

            // --- 2. Manage General Alerts Card Summary (Card 3: ID 8990) ---
            // Whenever at least 1 general alert is active, maintain Card 3 so Wird, Adhkar, Habits group here
            if (activeGeneralCount >= 1 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
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
                String generalBody = isArabic ? "الورد القرآني اليومي، أذكار الصباح والمساء، والسنن" : "Daily Wird, Sabah/Masaa Adhkar & Habits";

                NotificationCompat.InboxStyle inboxStyle = new NotificationCompat.InboxStyle();
                inboxStyle.setSummaryText(generalSub);
                inboxStyle.setBigContentTitle(generalTitle);
                for (String line : generalLines) {
                    inboxStyle.addLine(line);
                }

                NotificationCompat.Builder generalSummary = new NotificationCompat.Builder(context, GENERAL_SUMMARY_CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_stat_name)
                    .setColor(0xFF2E7D5E)
                    .setContentTitle(generalTitle)
                    .setContentText(generalBody)
                    .setSubText(generalSub)
                    .setStyle(inboxStyle)
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
