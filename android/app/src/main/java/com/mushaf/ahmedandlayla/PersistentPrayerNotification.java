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

    public static final String CHANNEL_ID = "persistent_prayer_channel_v5";
    public static final int NOTIFICATION_ID = 9901;
    public static final String GROUP_KEY = "com.mushaf.ahmedandlayla.PERSISTENT_PRAYER_CARD";

    public static void createChannel(Context context) {
        createChannel(context, true);
    }

    public static void createChannel(Context context, boolean isArabic) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            try {
                nm.deleteNotificationChannel("persistent_prayer_channel_v1");
                nm.deleteNotificationChannel("persistent_prayer_channel_v2");
                nm.deleteNotificationChannel("persistent_prayer_channel_v3");
                nm.deleteNotificationChannel("persistent_prayer_channel_v4");
            } catch (Exception ignored) {}

            // IMPORTANCE_LOW shows the icon in the status bar beside the clock
            // while keeping the notification silent without audio interrupts
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                isArabic ? "إشعار مواقيت الصلاة المستمر" : "Persistent Prayer Notification",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription(isArabic
                ? "يعرض الصلاة القادمة والوقت المتبقي مع إظهار أيقونة التطبيق في الشريط العلوي للهاتف بجوار الساعة"
                : "Displays next prayer and countdown with app icon in the status bar beside the clock");
            // Disabling badge ensures Samsung One UI Home and Android launchers never display number "1"
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
            cancel(context);
            return;
        }

        String prayerJson = prefs.getString("widget_prayer_data", null);
        if (prayerJson == null || prayerJson.trim().isEmpty()) {
            return;
        }

        try {
            JSONObject data = new JSONObject(prayerJson);
            
            // Strictly determine language from the App's language, NEVER from the device's locale
            String appLang = prefs.getString("app_language", null);
            if (appLang == null && data.has("app_language")) {
                appLang = data.optString("app_language", "ar");
            }
            if (appLang == null || appLang.trim().isEmpty()) {
                appLang = "ar";
            }
            boolean isArabic = !"en".equalsIgnoreCase(appLang);

            createChannel(context, isArabic);

            long now = System.currentTimeMillis();
            String nextPrayerName = "";
            long targetTimeMillis = 0;

            // 1. First, search dynamically in timestamps if provided
            if (data.has("timestamps") && !data.isNull("timestamps")) {
                JSONObject timestamps = data.optJSONObject("timestamps");
                if (timestamps != null) {
                    String[] prayerIds = {
                        "fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", 
                        "nextFajr", "nextSunrise", "nextDhuhr", "nextAsr", "nextMaghrib", "nextIsha"
                    };
                    String[] prayerNamesAr = {
                        "الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء", 
                        "الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"
                    };
                    String[] prayerNamesEn = {
                        "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", 
                        "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"
                    };
                    String[] prayerNames = isArabic ? prayerNamesAr : prayerNamesEn;

                    for (int i = 0; i < prayerIds.length; i++) {
                        if (timestamps.has(prayerIds[i])) {
                            long pTime = timestamps.optLong(prayerIds[i], 0);
                            if (pTime > now) {
                                targetTimeMillis = pTime;
                                nextPrayerName = prayerNames[i];
                                break;
                            }
                        }
                    }
                }
            }

            // 2. If timestamps expired or are not in future, calculate dynamically from times_24h / times
            if (targetTimeMillis <= now) {
                JSONObject sourceTimes = (data.has("times_24h") && !data.isNull("times_24h"))
                        ? data.optJSONObject("times_24h")
                        : data.optJSONObject("times");

                if (sourceTimes != null) {
                    java.util.Calendar cal = java.util.Calendar.getInstance();
                    int nowHour = cal.get(java.util.Calendar.HOUR_OF_DAY);
                    int nowMin = cal.get(java.util.Calendar.MINUTE);
                    int nowTotalMins = nowHour * 60 + nowMin;

                    String[] ids = {"fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"};
                    String[] namesAr = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
                    String[] namesEn = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                    String[] names = isArabic ? namesAr : namesEn;

                    boolean found = false;
                    for (int i = 0; i < ids.length; i++) {
                        String timeStr = sourceTimes.optString(ids[i], "");
                        if (timeStr.contains(":")) {
                            try {
                                String[] parts = timeStr.trim().split(":");
                                int h = Integer.parseInt(parts[0].trim());
                                int m = Integer.parseInt(parts[1].trim());
                                int pTotalMins = h * 60 + m;

                                if (pTotalMins > nowTotalMins) {
                                    java.util.Calendar nextCal = java.util.Calendar.getInstance();
                                    nextCal.set(java.util.Calendar.HOUR_OF_DAY, h);
                                    nextCal.set(java.util.Calendar.MINUTE, m);
                                    nextCal.set(java.util.Calendar.SECOND, 0);
                                    nextCal.set(java.util.Calendar.MILLISECOND, 0);

                                    targetTimeMillis = nextCal.getTimeInMillis();
                                    nextPrayerName = names[i];
                                    found = true;
                                    break;
                                }
                            } catch (Exception ignored) {}
                        }
                    }

                    // If all prayers today have passed (now is past Isha), next prayer is Fajr tomorrow
                    if (!found) {
                        String fajrStr = sourceTimes.optString("fajr", "");
                        if (fajrStr.contains(":")) {
                            try {
                                String[] parts = fajrStr.trim().split(":");
                                int h = Integer.parseInt(parts[0].trim());
                                int m = Integer.parseInt(parts[1].trim());

                                java.util.Calendar nextCal = java.util.Calendar.getInstance();
                                nextCal.add(java.util.Calendar.DAY_OF_YEAR, 1);
                                nextCal.set(java.util.Calendar.HOUR_OF_DAY, h);
                                nextCal.set(java.util.Calendar.MINUTE, m);
                                nextCal.set(java.util.Calendar.SECOND, 0);
                                nextCal.set(java.util.Calendar.MILLISECOND, 0);

                                targetTimeMillis = nextCal.getTimeInMillis();
                                nextPrayerName = names[0];
                            } catch (Exception ignored) {}
                        }
                    }
                }
            }

            // 3. Fallback to saved next_prayer_name if still empty
            if (nextPrayerName.isEmpty()) {
                String savedName = data.optString("next_prayer_name", isArabic ? "الصلاة" : "Prayer");
                nextPrayerName = isArabic ? toArabicPrayerName(savedName) : toEnglishPrayerName(savedName);
            }
            if (targetTimeMillis <= 0) {
                targetTimeMillis = data.optLong("target_time_millis", 0);
            }

            // Calculate formatted remaining time with seconds for fallback title
            String remainingFormatted = "";
            long diffMillis = targetTimeMillis - now;
            if (targetTimeMillis > now && diffMillis > 0) {
                long totalSeconds = Math.max(0, (diffMillis + 999) / 1000);
                long hours = totalSeconds / 3600;
                long minutes = (totalSeconds % 3600) / 60;
                long seconds = totalSeconds % 60;
                if (hours > 0) {
                    remainingFormatted = String.format(java.util.Locale.US, "%02d:%02d:%02d", hours, minutes, seconds);
                } else {
                    remainingFormatted = String.format(java.util.Locale.US, "%02d:%02d", minutes, seconds);
                }
            }

            JSONObject times = data.optJSONObject("times");
            StringBuilder summary = new StringBuilder();
            if (times != null) {
                if (isArabic) {
                    summary.append("الفجر: ").append(PrayerWidgetProvider.formatNumerals(times.optString("fajr", ""), true))
                           .append(" • الظهر: ").append(PrayerWidgetProvider.formatNumerals(times.optString("dhuhr", ""), true))
                           .append(" • العصر: ").append(PrayerWidgetProvider.formatNumerals(times.optString("asr", ""), true))
                           .append(" • المغرب: ").append(PrayerWidgetProvider.formatNumerals(times.optString("maghrib", ""), true))
                           .append(" • العشاء: ").append(PrayerWidgetProvider.formatNumerals(times.optString("isha", ""), true));
                } else {
                    summary.append("Fajr: ").append(PrayerWidgetProvider.formatNumerals(times.optString("fajr", ""), false))
                           .append(" • Dhuhr: ").append(PrayerWidgetProvider.formatNumerals(times.optString("dhuhr", ""), false))
                           .append(" • Asr: ").append(PrayerWidgetProvider.formatNumerals(times.optString("asr", ""), false))
                           .append(" • Maghrib: ").append(PrayerWidgetProvider.formatNumerals(times.optString("maghrib", ""), false))
                           .append(" • Isha: ").append(PrayerWidgetProvider.formatNumerals(times.optString("isha", ""), false));
                }
            }

            Intent openAppIntent = new Intent(context, MainActivity.class);
            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(context, NOTIFICATION_ID, openAppIntent, flags);

            // Fallback title for lock screen / auto / wear
            String prayerLabel = (isArabic ? "الصلاة القادمة: " : "Next Prayer: ") + nextPrayerName;
            String fallbackTitle = prayerLabel;
            if (!remainingFormatted.isEmpty()) {
                String formattedRem = PrayerWidgetProvider.formatNumerals(remainingFormatted, isArabic);
                fallbackTitle += " (" + (isArabic ? "متبقي " : "in ") + formattedRem + ")";
            }

            // Restore intent: if swiped away while enabled, automatically restore it
            Intent deleteIntent = new Intent(context, PrayerSilentReceiver.class);
            deleteIntent.setAction(PrayerSilentReceiver.ACTION_RESTORE_NOTIFICATION);
            PendingIntent deletePi = PendingIntent.getBroadcast(context, 9902, deleteIntent, flags);

            // Build RemoteViews for custom content with live second-by-second Chronometer
            android.widget.RemoteViews collapsedView = new android.widget.RemoteViews(context.getPackageName(), R.layout.notification_persistent_prayer);
            android.widget.RemoteViews expandedView = new android.widget.RemoteViews(context.getPackageName(), R.layout.notification_persistent_prayer_expanded);

            long chronometerBase = android.os.SystemClock.elapsedRealtime() + Math.max(0, diffMillis);
            String prefix = " (" + (isArabic ? "متبقي " : "in ");
            String suffix = ")";

            for (android.widget.RemoteViews rv : new android.widget.RemoteViews[]{collapsedView, expandedView}) {
                rv.setTextViewText(R.id.notif_next_prayer, prayerLabel);

                if (targetTimeMillis > now && diffMillis > 0) {
                    rv.setViewVisibility(R.id.notif_remaining_prefix, android.view.View.VISIBLE);
                    rv.setViewVisibility(R.id.notif_chronometer, android.view.View.VISIBLE);
                    rv.setViewVisibility(R.id.notif_remaining_suffix, android.view.View.VISIBLE);

                    rv.setTextViewText(R.id.notif_remaining_prefix, prefix);
                    rv.setTextViewText(R.id.notif_remaining_suffix, suffix);

                    rv.setChronometer(R.id.notif_chronometer, chronometerBase, null, true);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        rv.setChronometerCountDown(R.id.notif_chronometer, true);
                    }
                } else {
                    rv.setViewVisibility(R.id.notif_remaining_prefix, android.view.View.GONE);
                    rv.setViewVisibility(R.id.notif_chronometer, android.view.View.GONE);
                    rv.setViewVisibility(R.id.notif_remaining_suffix, android.view.View.GONE);
                }
            }

            // Collapsed view: hide summary & small time so the big countdown has full width
            collapsedView.setViewVisibility(R.id.notif_summary, android.view.View.GONE);

            // Expanded view: show small time, big time, and all prayer times
            expandedView.setViewVisibility(R.id.notif_summary, android.view.View.VISIBLE);
            expandedView.setTextViewText(R.id.notif_summary, summary.toString());
            if (targetTimeMillis > now && diffMillis > 0) {
                expandedView.setViewVisibility(R.id.notif_chronometer_small, android.view.View.VISIBLE);
                expandedView.setChronometer(R.id.notif_chronometer_small, chronometerBase, null, true);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    expandedView.setChronometerCountDown(R.id.notif_chronometer_small, true);
                }
            } else {
                expandedView.setViewVisibility(R.id.notif_chronometer_small, android.view.View.GONE);
            }

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setColor(0xFF2E7D5E)
                .setContentTitle(fallbackTitle)
                .setSubText(isArabic ? "مواقيت الصلاة" : "Prayer Times")
                .setContentIntent(pendingIntent)
                .setDeleteIntent(deletePi)
                .setOngoing(true)
                .setAutoCancel(false)
                .setOnlyAlertOnce(true)
                .setShowWhen(false)
                .setUsesChronometer(false)
                .setGroup(null)
                .setGroupSummary(false)
                .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_ALL)
                .setSortKey("00_persistent")
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setBadgeIconType(NotificationCompat.BADGE_ICON_NONE)
                .setNumber(0)
                .setContentText(summary.toString())
                .setCustomContentView(collapsedView)
                .setCustomBigContentView(expandedView)
                .setStyle(new NotificationCompat.DecoratedCustomViewStyle());

            Notification notification = builder.build();
            // Critical persistence flags: prevents removal via "Clear all" button and marks as persistent
            notification.flags |= Notification.FLAG_ONGOING_EVENT;
            notification.flags |= Notification.FLAG_NO_CLEAR;

            nm.notify(NOTIFICATION_ID, notification);

            // Keep the non-persistent app alerts summary in sync in its own completely separate card
            AlertsGroupHelper.updateGroupSummary(context, nm);

            // Schedule background alarms to ensure continuous accuracy even when app is closed
            scheduleAlarms(context, targetTimeMillis);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void scheduleAlarms(Context context, long targetTimeMillis) {
        if (context == null) return;
        android.app.AlarmManager am = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        // 1. Alarm exactly when the prayer time arrives (+1 second so now > targetTime to switch prayer immediately)
        if (targetTimeMillis > System.currentTimeMillis()) {
            Intent prayerIntent = new Intent(context, PrayerSilentReceiver.class);
            prayerIntent.setAction(PrayerSilentReceiver.ACTION_UPDATE_NOTIFICATION);
            PendingIntent piPrayer = PendingIntent.getBroadcast(context, 9903, prayerIntent, flags);

            long alarmTime = targetTimeMillis + 1000;
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, alarmTime, piPrayer);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    am.setExact(android.app.AlarmManager.RTC_WAKEUP, alarmTime, piPrayer);
                } else {
                    am.set(android.app.AlarmManager.RTC_WAKEUP, alarmTime, piPrayer);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // 2. Alarm for the next minute to update the countdown string smoothly
        long now = System.currentTimeMillis();
        long nextMinute = (now / 60000 + 1) * 60000 + 500;
        if (targetTimeMillis > 0 && nextMinute < targetTimeMillis) {
            Intent minuteIntent = new Intent(context, PrayerSilentReceiver.class);
            minuteIntent.setAction(PrayerSilentReceiver.ACTION_UPDATE_NOTIFICATION);
            PendingIntent piMinute = PendingIntent.getBroadcast(context, 9904, minuteIntent, flags);

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC, nextMinute, piMinute);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    am.setExact(android.app.AlarmManager.RTC, nextMinute, piMinute);
                } else {
                    am.set(android.app.AlarmManager.RTC, nextMinute, piMinute);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private static String toEnglishPrayerName(String name) {
        if (name == null || name.isEmpty()) return "Prayer";
        if (name.contains("فجر") || name.equalsIgnoreCase("fajr")) return "Fajr";
        if (name.contains("شروق") || name.equalsIgnoreCase("sunrise")) return "Sunrise";
        if (name.contains("ظهر") || name.equalsIgnoreCase("dhuhr")) return "Dhuhr";
        if (name.contains("عصر") || name.equalsIgnoreCase("asr")) return "Asr";
        if (name.contains("مغرب") || name.equalsIgnoreCase("maghrib")) return "Maghrib";
        if (name.contains("عشاء") || name.equalsIgnoreCase("isha")) return "Isha";
        return name;
    }

    private static String toArabicPrayerName(String name) {
        if (name == null || name.isEmpty()) return "الصلاة";
        if (name.equalsIgnoreCase("fajr") || name.contains("فجر")) return "الفجر";
        if (name.equalsIgnoreCase("sunrise") || name.contains("شروق")) return "الشروق";
        if (name.equalsIgnoreCase("dhuhr") || name.contains("ظهر")) return "الظهر";
        if (name.equalsIgnoreCase("asr") || name.contains("عصر")) return "العصر";
        if (name.equalsIgnoreCase("maghrib") || name.contains("مغرب")) return "المغرب";
        if (name.equalsIgnoreCase("isha") || name.contains("عشاء")) return "العشاء";
        return name;
    }

    public static void cancel(Context context) {
        if (context == null) return;
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.cancel(NOTIFICATION_ID);
            AlertsGroupHelper.updateGroupSummary(context, nm);
        }
        try {
            android.app.AlarmManager am = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am != null) {
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                Intent intent1 = new Intent(context, PrayerSilentReceiver.class);
                intent1.setAction(PrayerSilentReceiver.ACTION_UPDATE_NOTIFICATION);
                PendingIntent pi1 = PendingIntent.getBroadcast(context, 9903, intent1, flags);
                am.cancel(pi1);

                Intent intent2 = new Intent(context, PrayerSilentReceiver.class);
                intent2.setAction(PrayerSilentReceiver.ACTION_UPDATE_NOTIFICATION);
                PendingIntent pi2 = PendingIntent.getBroadcast(context, 9904, intent2, flags);
                am.cancel(pi2);
            }
        } catch (Exception ignored) {}
    }
}
