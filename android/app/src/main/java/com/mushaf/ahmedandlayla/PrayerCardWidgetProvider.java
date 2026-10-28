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
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.Date;

public class PrayerCardWidgetProvider extends AppWidgetProvider {

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

        if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(action) ||
            "com.mushaf.ahmedandlayla.ACTION_REFRESH_WIDGET".equals(action) ||
            Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
            Intent.ACTION_DATE_CHANGED.equals(action)) {
            updateAllWidgets(context);
        }
    }

    public static void updateAllWidgets(Context context) {
        if (context == null) return;
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName componentName = new ComponentName(context, PrayerCardWidgetProvider.class);
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

        RemoteViews views = new RemoteViews(context.getPackageName(), isArabic ? R.layout.prayer_card_widget : R.layout.prayer_card_widget_ltr);

        // Deep linking: Tap card opens Prayer Times
        Intent prayerIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("com.mushaf.ahmedandlayla://prayer-times"));
        prayerIntent.setClass(context, MainActivity.class);
        prayerIntent.putExtra("shortcut_target", "prayer-times");
        prayerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent rootPending = PendingIntent.getActivity(
                context, 901, prayerIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_card_root, rootPending);

        if (prayerJson != null && !prayerJson.trim().isEmpty()) {
            try {
                JSONObject data = new JSONObject(prayerJson);
                String city = data.optString("city", "");
                views.setTextViewText(R.id.widget_card_city, PrayerWidgetProvider.formatNumerals(PrayerWidgetProvider.translate(city, isArabic), isArabic));

                long now = System.currentTimeMillis();
                long targetTimeMillis = 0;
                String nextPrayerId = data.optString("next_prayer_id", "");
                String nextPrayerName = data.optString("next_prayer_name", "");
                String nextPrayerTimeStr = "";

                // Autonomous date advancement check
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

                    views.setTextViewText(R.id.card_time_fajr, PrayerWidgetProvider.formatNumerals(autoRes.fajr, isArabic));
                    views.setTextViewText(R.id.card_time_sunrise, PrayerWidgetProvider.formatNumerals(autoRes.sunrise, isArabic));
                    views.setTextViewText(R.id.card_time_dhuhr, PrayerWidgetProvider.formatNumerals(autoRes.dhuhr, isArabic));
                    views.setTextViewText(R.id.card_time_asr, PrayerWidgetProvider.formatNumerals(autoRes.asr, isArabic));
                    views.setTextViewText(R.id.card_time_maghrib, PrayerWidgetProvider.formatNumerals(autoRes.maghrib, isArabic));
                    views.setTextViewText(R.id.card_time_isha, PrayerWidgetProvider.formatNumerals(autoRes.isha, isArabic));

                    views.setTextViewText(R.id.widget_card_date, PrayerWidgetProvider.formatNumerals(autoRes.hijriDate, isArabic));

                    long[] autoTimes = {autoRes.fajrMillis, autoRes.sunriseMillis, autoRes.dhuhrMillis, autoRes.asrMillis, autoRes.maghribMillis, autoRes.ishaMillis};
                    String[] autoIds = {"fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"};
                    String[] autoNamesAr = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
                    String[] autoNamesEn = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                    String[] autoNames = isArabic ? autoNamesAr : autoNamesEn;
                    String[] autoStrings = {autoRes.fajr, autoRes.sunrise, autoRes.dhuhr, autoRes.asr, autoRes.maghrib, autoRes.isha};

                    for (int i = 0; i < autoTimes.length; i++) {
                        if (autoTimes[i] > now) {
                            targetTimeMillis = autoTimes[i];
                            nextPrayerId = autoIds[i];
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
                        nextPrayerId = "fajr";
                        nextPrayerName = isArabic ? "الفجر" : "Fajr";
                        nextPrayerTimeStr = tomRes.fajr;
                    }

                } else {
                    // Cached data flow
                    views.setTextViewText(R.id.widget_card_date, PrayerWidgetProvider.formatNumerals(PrayerWidgetProvider.translate(data.optString("hijri", ""), isArabic), isArabic));

                    JSONObject times = data.optJSONObject("times");
                    if (times != null) {
                        views.setTextViewText(R.id.card_time_fajr, PrayerWidgetProvider.formatNumerals(times.optString("fajr", ""), isArabic));
                        views.setTextViewText(R.id.card_time_sunrise, PrayerWidgetProvider.formatNumerals(times.optString("sunrise", ""), isArabic));
                        views.setTextViewText(R.id.card_time_dhuhr, PrayerWidgetProvider.formatNumerals(times.optString("dhuhr", ""), isArabic));
                        views.setTextViewText(R.id.card_time_asr, PrayerWidgetProvider.formatNumerals(times.optString("asr", ""), isArabic));
                        views.setTextViewText(R.id.card_time_maghrib, PrayerWidgetProvider.formatNumerals(times.optString("maghrib", ""), isArabic));
                        views.setTextViewText(R.id.card_time_isha, PrayerWidgetProvider.formatNumerals(times.optString("isha", ""), isArabic));
                    }

                    if (data.has("timestamps") && !data.isNull("timestamps")) {
                        JSONObject timestamps = data.getJSONObject("timestamps");
                        String[] pIds = {"fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "nextFajr", "nextSunrise", "nextDhuhr", "nextAsr", "nextMaghrib", "nextIsha"};
                        String[] namesAr = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء", "الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
                        String[] namesEn = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                        String[] names = isArabic ? namesAr : namesEn;

                        for (int i = 0; i < pIds.length; i++) {
                            if (timestamps.has(pIds[i])) {
                                long pTime = timestamps.getLong(pIds[i]);
                                if (pTime > now) {
                                    targetTimeMillis = pTime;
                                    String id = pIds[i].startsWith("next") ? pIds[i].substring(4).toLowerCase() : pIds[i];
                                    nextPrayerId = id;
                                    nextPrayerName = names[i];
                                    if (times != null && times.has(id)) {
                                        nextPrayerTimeStr = times.getString(id);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }

                // Header Labels
                views.setTextViewText(R.id.card_name_fajr, isArabic ? "فجر" : "Fajr");
                views.setTextViewText(R.id.card_name_sunrise, isArabic ? "شروق" : "Sun");
                views.setTextViewText(R.id.card_name_dhuhr, isArabic ? "ظهر" : "Dhuhr");
                views.setTextViewText(R.id.card_name_asr, isArabic ? "عصر" : "Asr");
                views.setTextViewText(R.id.card_name_maghrib, isArabic ? "مغرب" : "Maghrib");
                views.setTextViewText(R.id.card_name_isha, isArabic ? "عشاء" : "Isha");

                String heroLabel = isArabic ? ("صلاة " + nextPrayerName + " بعد") : (nextPrayerName + " in");
                views.setTextViewText(R.id.widget_card_prayer_name, heroLabel);

                if (!nextPrayerTimeStr.isEmpty()) {
                    String timeLabel = isArabic ? ("الأذان : " + nextPrayerTimeStr) : ("Adhan : " + nextPrayerTimeStr);
                    views.setTextViewText(R.id.widget_card_prayer_time, PrayerWidgetProvider.formatNumerals(timeLabel, isArabic));
                }

                // Countdown Chronometer / TextView
                if (targetTimeMillis > 0) {
                    long remainingMillis = targetTimeMillis - now;
                    if (isArabic) {
                        views.setViewVisibility(R.id.widget_card_countdown, View.VISIBLE);
                        views.setViewVisibility(R.id.widget_card_countdown_en, View.GONE);
                        if (remainingMillis <= 0) {
                            views.setChronometer(R.id.widget_card_countdown, android.os.SystemClock.elapsedRealtime(), "00:00:00", false);
                        } else {
                            long base = android.os.SystemClock.elapsedRealtime() + remainingMillis;
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                                views.setBoolean(R.id.widget_card_countdown, "setCountDown", true);
                            }
                            views.setChronometer(R.id.widget_card_countdown, base, "%s", true);
                        }
                    } else {
                        views.setViewVisibility(R.id.widget_card_countdown, View.GONE);
                        views.setViewVisibility(R.id.widget_card_countdown_en, View.VISIBLE);
                        views.setTextViewText(R.id.widget_card_countdown_en, PrayerWidgetProvider.formatRemainingTime(remainingMillis));
                    }

                    if (remainingMillis > 0) {
                        Intent updateIntent = new Intent(context, PrayerCardWidgetProvider.class);
                        updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
                        PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                                context, appWidgetId + 3000, updateIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        );
                        scheduleSafeAlarm(context, targetTimeMillis + 1000, pendingUpdate);

                        // Schedule 1-minute recurring update alarm for smooth display
                        Intent minIntent = new Intent(context, PrayerCardWidgetProvider.class);
                        minIntent.setAction("com.mushaf.ahmedandlayla.ACTION_REFRESH_WIDGET");
                        PendingIntent minPending = PendingIntent.getBroadcast(
                                context, appWidgetId + 7000, minIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        );
                        long nextMinute = (System.currentTimeMillis() / 60000 + 1) * 60000;
                        scheduleSafeAlarm(context, nextMinute, minPending);
                    }
                }

                // Theme styling with harmonized colors
                boolean isDark = false;
                int rootBgColor = Color.WHITE;
                int heroBgColor = Color.parseColor("#544670");
                int cardCityColor = Color.parseColor("#544670");
                int cardDateColor = Color.parseColor("#3B7A82");
                int heroPrayerNameColor = Color.parseColor("#86EFAC");
                int heroPrayerTimeColor = Color.parseColor("#FDE68A");
                int heroCountdownColor = Color.WHITE;
                int highlightPrayerColor = Color.parseColor("#3B7A82");
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

                    if (themeObj.has("heroBg")) {
                        try { heroBgColor = Color.parseColor(themeObj.getString("heroBg")); } catch (Exception ignored) {}
                    } else if (themeObj.has("section1Bg")) {
                        try { heroBgColor = Color.parseColor(themeObj.getString("section1Bg")); } catch (Exception ignored) {}
                    } else if (themeObj.has("purpleColor")) {
                        try { heroBgColor = Color.parseColor(themeObj.getString("purpleColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("cardCityColor")) {
                        try { cardCityColor = Color.parseColor(themeObj.getString("cardCityColor")); } catch (Exception ignored) {}
                    } else if (themeObj.has("purpleColor")) {
                        try { cardCityColor = Color.parseColor(themeObj.getString("purpleColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("cardDateColor")) {
                        try { cardDateColor = Color.parseColor(themeObj.getString("cardDateColor")); } catch (Exception ignored) {}
                    } else if (themeObj.has("tealColor")) {
                        try { cardDateColor = Color.parseColor(themeObj.getString("tealColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("heroPrayerName")) {
                        try { heroPrayerNameColor = Color.parseColor(themeObj.getString("heroPrayerName")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("heroPrayerTime")) {
                        try { heroPrayerTimeColor = Color.parseColor(themeObj.getString("heroPrayerTime")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("heroCountdown")) {
                        try { heroCountdownColor = Color.parseColor(themeObj.getString("heroCountdown")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("highlightPrayerColor")) {
                        try { highlightPrayerColor = Color.parseColor(themeObj.getString("highlightPrayerColor")); } catch (Exception ignored) {}
                    } else if (themeObj.has("tealColor")) {
                        try { highlightPrayerColor = Color.parseColor(themeObj.getString("tealColor")); } catch (Exception ignored) {}
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

                // Apply container and hero background unconditionally
                views.setInt(R.id.widget_card_root, "setBackgroundColor", rootBgColor);
                views.setInt(R.id.widget_card_hero, "setBackgroundColor", heroBgColor);

                // Bind 4-color brand accent strip
                views.setInt(R.id.card_strip_purple, "setBackgroundColor", stripColor1);
                views.setInt(R.id.card_strip_green, "setBackgroundColor", stripColor2);
                views.setInt(R.id.card_strip_teal, "setBackgroundColor", stripColor3);
                views.setInt(R.id.card_strip_terracotta, "setBackgroundColor", stripColor4);

                // Header text colors
                views.setTextColor(R.id.widget_card_city, cardCityColor);
                views.setTextColor(R.id.widget_card_date, cardDateColor);

                // Hero text colors
                views.setTextColor(R.id.widget_card_prayer_name, heroPrayerNameColor);
                views.setTextColor(R.id.widget_card_prayer_time, heroPrayerTimeColor);
                views.setTextColor(R.id.widget_card_countdown, heroCountdownColor);
                views.setTextColor(R.id.widget_card_countdown_en, heroCountdownColor);

                // Prayer strip text colors
                views.setTextColor(R.id.card_name_fajr, textColor);
                views.setTextColor(R.id.card_time_fajr, textColor);
                views.setTextColor(R.id.card_name_sunrise, textColor);
                views.setTextColor(R.id.card_time_sunrise, textColor);
                views.setTextColor(R.id.card_name_dhuhr, textColor);
                views.setTextColor(R.id.card_time_dhuhr, textColor);
                views.setTextColor(R.id.card_name_asr, textColor);
                views.setTextColor(R.id.card_time_asr, textColor);
                views.setTextColor(R.id.card_name_maghrib, textColor);
                views.setTextColor(R.id.card_time_maghrib, textColor);
                views.setTextColor(R.id.card_name_isha, textColor);
                views.setTextColor(R.id.card_time_isha, textColor);

                // Highlight next prayer in strip
                if ("fajr".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.card_name_fajr, highlightPrayerColor);
                    views.setTextColor(R.id.card_time_fajr, highlightPrayerColor);
                } else if ("sunrise".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.card_name_sunrise, highlightPrayerColor);
                    views.setTextColor(R.id.card_time_sunrise, highlightPrayerColor);
                } else if ("dhuhr".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.card_name_dhuhr, highlightPrayerColor);
                    views.setTextColor(R.id.card_time_dhuhr, highlightPrayerColor);
                } else if ("asr".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.card_name_asr, highlightPrayerColor);
                    views.setTextColor(R.id.card_time_asr, highlightPrayerColor);
                } else if ("maghrib".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.card_name_maghrib, highlightPrayerColor);
                    views.setTextColor(R.id.card_time_maghrib, highlightPrayerColor);
                } else if ("isha".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.card_name_isha, highlightPrayerColor);
                    views.setTextColor(R.id.card_time_isha, highlightPrayerColor);
                }

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
            } else {
                alarmManager.set(AlarmManager.RTC, triggerMillis, pendingIntent);
            }
        } catch (Exception ignored) {}
    }
}
