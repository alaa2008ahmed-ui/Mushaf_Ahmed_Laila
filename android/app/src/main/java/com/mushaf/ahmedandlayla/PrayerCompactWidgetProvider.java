package com.mushaf.ahmedandlayla;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.Date;

public class PrayerCompactWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_REFRESH_COMPACT_WIDGET = "com.mushaf.ahmedandlayla.ACTION_REFRESH_COMPACT_WIDGET";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (intent == null) return;
        String action = intent.getAction();
        if (action == null) return;

        if (ACTION_REFRESH_COMPACT_WIDGET.equals(action) ||
            "com.mushaf.ahmedandlayla.ACTION_REFRESH_WIDGET".equals(action) ||
            Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
            Intent.ACTION_DATE_CHANGED.equals(action)) {

            if (ACTION_REFRESH_COMPACT_WIDGET.equals(action)) {
                try {
                    Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                    if (v != null) v.vibrate(40);
                } catch (Exception ignored) {}
            }
            updateAllWidgets(context);
        }
    }

    public static void updateAllWidgets(Context context) {
        if (context == null) return;
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName componentName = new ComponentName(context, PrayerCompactWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(componentName);
            if (appWidgetIds != null && appWidgetIds.length > 0) {
                for (int appWidgetId : appWidgetIds) {
                    updateAppWidget(context, appWidgetManager, appWidgetId);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String prayerJson = prefs.getString("widget_prayer_data", null);

        String lockLang = prefs.getString("widget_lock_lang", null);
        String appLang = (lockLang != null && !lockLang.trim().isEmpty()) ? lockLang : prefs.getString("app_language", null);
        if (appLang == null && prayerJson != null) {
            try {
                JSONObject d = new JSONObject(prayerJson);
                appLang = d.optString("app_language", null);
            } catch (Exception ignored) {}
        }
        if (appLang == null || appLang.trim().isEmpty()) {
            appLang = java.util.Locale.getDefault().getLanguage();
        }
        boolean isArabic = !"en".equalsIgnoreCase(appLang);

        RemoteViews views = new RemoteViews(context.getPackageName(), isArabic ? R.layout.prayer_compact_widget : R.layout.prayer_compact_widget_ltr);

        // Clicking root opens prayer-times directly via deep link
        Intent prayerIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("com.mushaf.ahmedandlayla://prayer-times"));
        prayerIntent.setClass(context, MainActivity.class);
        prayerIntent.putExtra("shortcut_target", "prayer-times");
        prayerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent rootPending = PendingIntent.getActivity(
                context, 801, prayerIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_compact_root, rootPending);

        if (prayerJson != null && !prayerJson.trim().isEmpty()) {
            try {
                JSONObject data = new JSONObject(prayerJson);
                String city = data.optString("city", "");
                views.setTextViewText(R.id.widget_compact_city, PrayerWidgetProvider.formatNumerals(PrayerWidgetProvider.translate(city, isArabic), isArabic));

                long now = System.currentTimeMillis();
                long targetTimeMillis = 0;
                String nextPrayerName = "";
                String nextPrayerTimeStr = "";

                // Check if date has elapsed to trigger autonomous calculation
                long baseDateMillis = data.optLong("base_date_millis", 0);
                Calendar nowCal = Calendar.getInstance();
                Calendar baseCal = Calendar.getInstance();
                if (baseDateMillis > 0) baseCal.setTimeInMillis(baseDateMillis);

                boolean dateElapsed = baseDateMillis > 0 &&
                        (nowCal.get(Calendar.DAY_OF_YEAR) != baseCal.get(Calendar.DAY_OF_YEAR) ||
                         nowCal.get(Calendar.YEAR) != baseCal.get(Calendar.YEAR));

                if (dateElapsed && data.has("coordinates")) {
                    JSONObject coords = data.getJSONObject("coordinates");
                    double lat = coords.optDouble("lat", 0.0);
                    double lng = coords.optDouble("lng", 0.0);
                    int methodId = data.optInt("method_id", 3);

                    int[] offsets = new int[6];
                    if (data.has("prayer_offsets")) {
                        JSONObject offObj = data.getJSONObject("prayer_offsets");
                        offsets[0] = offObj.optInt("Fajr", 0);
                        offsets[1] = offObj.optInt("Sunrise", 0);
                        offsets[2] = offObj.optInt("Dhuhr", 0);
                        offsets[3] = offObj.optInt("Asr", 0);
                        offsets[4] = offObj.optInt("Maghrib", 0);
                        offsets[5] = offObj.optInt("Isha", 0);
                    }

                    PrayerCalculationEngine.PrayerResult autoRes = PrayerCalculationEngine.calculate(
                            new Date(), lat, lng, methodId, false, offsets, isArabic,
                            baseDateMillis, data.optString("hijri", ""), data.optString("gregorian", "")
                    );

                    long[] autoTimes = {autoRes.fajrMillis, autoRes.sunriseMillis, autoRes.dhuhrMillis, autoRes.asrMillis, autoRes.maghribMillis, autoRes.ishaMillis};
                    String[] autoNamesAr = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
                    String[] autoNamesEn = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                    String[] autoNames = isArabic ? autoNamesAr : autoNamesEn;
                    String[] autoStrings = {autoRes.fajr, autoRes.sunrise, autoRes.dhuhr, autoRes.asr, autoRes.maghrib, autoRes.isha};

                    for (int i = 0; i < autoTimes.length; i++) {
                        if (autoTimes[i] > now) {
                            targetTimeMillis = autoTimes[i];
                            nextPrayerName = autoNames[i];
                            nextPrayerTimeStr = autoStrings[i];
                            break;
                        }
                    }

                    if (targetTimeMillis == 0) {
                        Calendar tomCal = Calendar.getInstance();
                        tomCal.add(Calendar.DAY_OF_YEAR, 1);
                        PrayerCalculationEngine.PrayerResult tomRes = PrayerCalculationEngine.calculate(
                                tomCal.getTime(), lat, lng, methodId, false, offsets, isArabic,
                                baseDateMillis, data.optString("hijri", ""), data.optString("gregorian", "")
                        );
                        targetTimeMillis = tomRes.fajrMillis;
                        nextPrayerName = isArabic ? "الفجر" : "Fajr";
                        nextPrayerTimeStr = tomRes.fajr;
                    }

                } else if (data.has("timestamps") && !data.isNull("timestamps")) {
                    JSONObject timestamps = data.getJSONObject("timestamps");
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

                    JSONObject times = data.optJSONObject("times");

                    for (int i = 0; i < prayerIds.length; i++) {
                        if (timestamps.has(prayerIds[i])) {
                            long pTime = timestamps.getLong(prayerIds[i]);
                            if (pTime > now) {
                                targetTimeMillis = pTime;
                                nextPrayerName = prayerNames[i];
                                String key = prayerIds[i].startsWith("next") ? prayerIds[i].substring(4).toLowerCase() : prayerIds[i];
                                if (times != null && times.has(key)) {
                                    nextPrayerTimeStr = times.getString(key);
                                }
                                break;
                            }
                        }
                    }
                }

                if (targetTimeMillis == 0 && data.has("target_time_millis")) {
                    targetTimeMillis = data.getLong("target_time_millis");
                    nextPrayerName = data.optString("next_prayer_name", isArabic ? "الصلاة" : "Prayer");
                }

                // Render prayer name & time
                String label = isArabic ? (nextPrayerName + " بعد") : (nextPrayerName + " in");
                views.setTextViewText(R.id.widget_compact_prayer_name, label);
                views.setTextViewText(R.id.widget_compact_prayer_tag, isArabic ? "الأذان" : "Adhan");
                if (!nextPrayerTimeStr.isEmpty()) {
                    views.setTextViewText(R.id.widget_compact_prayer_time, PrayerWidgetProvider.formatNumerals(nextPrayerTimeStr, isArabic));
                }

                // Setup countdown Chronometer / TextView
                if (targetTimeMillis > 0) {
                    long remainingMillis = targetTimeMillis - now;
                    if (isArabic) {
                        views.setViewVisibility(R.id.widget_compact_countdown, View.VISIBLE);
                        views.setViewVisibility(R.id.widget_compact_countdown_en, View.GONE);
                        if (remainingMillis <= 0) {
                            views.setChronometer(R.id.widget_compact_countdown, android.os.SystemClock.elapsedRealtime(), "00:00:00", false);
                        } else {
                            long base = android.os.SystemClock.elapsedRealtime() + remainingMillis;
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                                views.setBoolean(R.id.widget_compact_countdown, "setCountDown", true);
                            }
                            views.setChronometer(R.id.widget_compact_countdown, base, "%s", true);
                        }
                    } else {
                        views.setViewVisibility(R.id.widget_compact_countdown, View.GONE);
                        views.setViewVisibility(R.id.widget_compact_countdown_en, View.VISIBLE);
                        views.setTextViewText(R.id.widget_compact_countdown_en, PrayerWidgetProvider.formatRemainingTime(remainingMillis));
                    }

                    if (remainingMillis > 0) {
                        // Schedule update alarm
                        Intent updateIntent = new Intent(context, PrayerCompactWidgetProvider.class);
                        updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});

                        PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                                context, appWidgetId + 2000, updateIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        );
                        scheduleSafeAlarm(context, targetTimeMillis + 1000, pendingUpdate);

                        // Schedule 1-minute recurring update alarm for smooth display
                        Intent minIntent = new Intent(context, PrayerCompactWidgetProvider.class);
                        minIntent.setAction(ACTION_REFRESH_COMPACT_WIDGET);
                        PendingIntent minPending = PendingIntent.getBroadcast(
                                context, appWidgetId + 8000, minIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        );
                        long nextMinute = (System.currentTimeMillis() / 60000 + 1) * 60000;
                        scheduleSafeAlarm(context, nextMinute, minPending);
                    }
                }

                // Theme & 4 Home Page Section Colors Sync
                boolean isDark = false;
                int rootBgColor = Color.WHITE;
                int compactCityColor = Color.parseColor("#544670");
                int compactNameColor = Color.parseColor("#2E7D5E");
                int compactTagColor = Color.parseColor("#3B7A82");
                int compactTimeColor = Color.parseColor("#A26743");
                int sepColor = Color.parseColor("#E2E8F0");
                int textColor = Color.parseColor("#0F172A");

                int stripColor1 = Color.parseColor("#544670");
                int stripColor2 = Color.parseColor("#2E7D5E");
                int stripColor3 = Color.parseColor("#3B7A82");
                int stripColor4 = Color.parseColor("#A26743");

                if (data.has("theme") && !data.isNull("theme")) {
                    JSONObject themeObj = data.getJSONObject("theme");
                    isDark = themeObj.optBoolean("isDark", false);

                    if (themeObj.has("rootBg")) {
                        try { rootBgColor = Color.parseColor(themeObj.getString("rootBg")); } catch (Exception ignored) {}
                    } else if (themeObj.has("cardBg")) {
                        try { rootBgColor = Color.parseColor(themeObj.getString("cardBg")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("compactCityColor")) {
                        try { compactCityColor = Color.parseColor(themeObj.getString("compactCityColor")); } catch (Exception ignored) {}
                    } else if (themeObj.has("purpleColor")) {
                        try { compactCityColor = Color.parseColor(themeObj.getString("purpleColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("compactNameColor")) {
                        try { compactNameColor = Color.parseColor(themeObj.getString("compactNameColor")); } catch (Exception ignored) {}
                    } else if (themeObj.has("greenColor")) {
                        try { compactNameColor = Color.parseColor(themeObj.getString("greenColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("compactTagColor")) {
                        try { compactTagColor = Color.parseColor(themeObj.getString("compactTagColor")); } catch (Exception ignored) {}
                    } else if (themeObj.has("tealColor")) {
                        try { compactTagColor = Color.parseColor(themeObj.getString("tealColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("compactTimeColor")) {
                        try { compactTimeColor = Color.parseColor(themeObj.getString("compactTimeColor")); } catch (Exception ignored) {}
                    } else if (themeObj.has("terracottaColor")) {
                        try { compactTimeColor = Color.parseColor(themeObj.getString("terracottaColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("sepColor")) {
                        try { sepColor = Color.parseColor(themeObj.getString("sepColor")); } catch (Exception ignored) {}
                    } else if (isDark) {
                        sepColor = Color.parseColor("#334155");
                    }

                    if (themeObj.has("stripColor1")) {
                        try { stripColor1 = Color.parseColor(themeObj.getString("stripColor1")); } catch (Exception ignored) {}
                    } else if (themeObj.has("purpleColor")) {
                        try { stripColor1 = Color.parseColor(themeObj.getString("purpleColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("stripColor2")) {
                        try { stripColor2 = Color.parseColor(themeObj.getString("stripColor2")); } catch (Exception ignored) {}
                    } else if (themeObj.has("greenColor")) {
                        try { stripColor2 = Color.parseColor(themeObj.getString("greenColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("stripColor3")) {
                        try { stripColor3 = Color.parseColor(themeObj.getString("stripColor3")); } catch (Exception ignored) {}
                    } else if (themeObj.has("tealColor")) {
                        try { stripColor3 = Color.parseColor(themeObj.getString("tealColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("stripColor4")) {
                        try { stripColor4 = Color.parseColor(themeObj.getString("stripColor4")); } catch (Exception ignored) {}
                    } else if (themeObj.has("terracottaColor")) {
                        try { stripColor4 = Color.parseColor(themeObj.getString("terracottaColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("textColor")) {
                        try { textColor = Color.parseColor(themeObj.getString("textColor")); } catch (Exception ignored) {}
                    }
                }

                // Apply root background unconditionally
                views.setInt(R.id.widget_compact_root, "setBackgroundColor", rootBgColor);

                // Bind 4-color brand accent strip
                views.setInt(R.id.compact_strip_purple, "setBackgroundColor", stripColor1);
                views.setInt(R.id.compact_strip_green, "setBackgroundColor", stripColor2);
                views.setInt(R.id.compact_strip_teal, "setBackgroundColor", stripColor3);
                views.setInt(R.id.compact_strip_terracotta, "setBackgroundColor", stripColor4);

                // Text colors
                views.setTextColor(R.id.widget_compact_city, compactCityColor);
                views.setTextColor(R.id.widget_compact_prayer_name, compactNameColor);
                views.setTextColor(R.id.widget_compact_countdown, textColor);
                views.setTextColor(R.id.widget_compact_countdown_en, textColor);
                views.setTextColor(R.id.widget_compact_prayer_tag, compactTagColor);
                views.setTextColor(R.id.widget_compact_prayer_time, compactTimeColor);

                // Separators
                views.setInt(R.id.widget_compact_sep1, "setBackgroundColor", sepColor);
                views.setInt(R.id.widget_compact_sep2, "setBackgroundColor", sepColor);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static void scheduleSafeAlarm(Context context, long triggerMillis, PendingIntent pendingIntent) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC, triggerMillis, pendingIntent);
                } else {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC, triggerMillis, pendingIntent);
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC, triggerMillis, pendingIntent);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                alarmManager.setExact(AlarmManager.RTC, triggerMillis, pendingIntent);
            } else {
                alarmManager.set(AlarmManager.RTC, triggerMillis, pendingIntent);
            }
        } catch (SecurityException se) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC, triggerMillis, pendingIntent);
                } else {
                    alarmManager.set(AlarmManager.RTC, triggerMillis, pendingIntent);
                }
            } catch (Exception ignored) {}
        } catch (Exception ignored) {}
    }
}
