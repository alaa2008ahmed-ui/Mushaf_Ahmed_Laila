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
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.Date;

/**
 * Compact Widget: Displays strictly Date + Previous Prayer + Next Prayer + Remaining Countdown.
 * Supports auto font scaling on widget resize and bilingual (Arabic & English).
 */
public class PrayerCompactWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_REFRESH_COMPACT = "com.mushaf.ahmedandlayla.ACTION_REFRESH_COMPACT";

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

        if (ACTION_REFRESH_COMPACT.equals(action) ||
            PrayerWidgetProvider.ACTION_REFRESH_WIDGET.equals(action) ||
            Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
            Intent.ACTION_DATE_CHANGED.equals(action)) {

            if (ACTION_REFRESH_COMPACT.equals(action)) {
                try {
                    Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                    if (v != null) v.vibrate(35);
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

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
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

        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int minWidth = (options != null) ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 200) : 200;
        int minHeight = (options != null) ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 60) : 60;
        boolean isSmall = minHeight > 0 && minHeight < 95;

        int layoutId;
        if (isSmall) {
            layoutId = isArabic ? R.layout.prayer_widget_compact_small : R.layout.prayer_widget_compact_small_ltr;
        } else {
            layoutId = isArabic ? R.layout.prayer_widget_compact : R.layout.prayer_widget_compact_ltr;
        }
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);

        // Click Deep Links
        Intent homeIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("com.mushaf.ahmedandlayla://home"));
        homeIntent.setClass(context, MainActivity.class);
        homeIntent.putExtra("shortcut_target", "home");
        homeIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent homePending = PendingIntent.getActivity(
                context, 200, homeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, homePending);
        views.setOnClickPendingIntent(R.id.widget_app_icon, homePending);

        Intent calIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("com.mushaf.ahmedandlayla://calendar"));
        calIntent.setClass(context, MainActivity.class);
        calIntent.putExtra("shortcut_target", "calendar");
        calIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent calPending = PendingIntent.getActivity(
                context, 201, calIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.compact_date_container, calPending);

        Intent prayerIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("com.mushaf.ahmedandlayla://prayer-times"));
        prayerIntent.setClass(context, MainActivity.class);
        prayerIntent.putExtra("shortcut_target", "prayer-times");
        prayerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent prayerPending = PendingIntent.getActivity(
                context, 202, prayerIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.compact_cards_row, prayerPending);
        views.setOnClickPendingIntent(R.id.compact_countdown_card, prayerPending);

        Intent refreshIntent = new Intent(context, PrayerCompactWidgetProvider.class);
        refreshIntent.setAction(ACTION_REFRESH_COMPACT);
        PendingIntent refreshPending = PendingIntent.getBroadcast(
                context, 203, refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_btn_refresh, refreshPending);

        // Dynamic Font Scaling on Widget Resize
        float fontScale;
        if (isSmall) {
            float wRatio = (minWidth > 0) ? (minWidth / 220f) : 1.0f;
            fontScale = Math.max(0.90f, Math.min(1.15f, wRatio));

            views.setTextViewTextSize(R.id.compact_hijri_date, TypedValue.COMPLEX_UNIT_SP, Math.round(10f * fontScale));
            views.setTextViewTextSize(R.id.compact_gregorian_date, TypedValue.COMPLEX_UNIT_SP, Math.round(9.5f * fontScale));
            views.setTextViewTextSize(R.id.compact_prev_label, TypedValue.COMPLEX_UNIT_SP, Math.round(9f * fontScale));
            views.setTextViewTextSize(R.id.compact_prev_name, TypedValue.COMPLEX_UNIT_SP, Math.round(12f * fontScale));
            views.setTextViewTextSize(R.id.compact_prev_time, TypedValue.COMPLEX_UNIT_SP, Math.round(11.5f * fontScale));
            views.setTextViewTextSize(R.id.compact_next_label, TypedValue.COMPLEX_UNIT_SP, Math.round(9.5f * fontScale));
            views.setTextViewTextSize(R.id.compact_next_name, TypedValue.COMPLEX_UNIT_SP, Math.round(12.5f * fontScale));
            views.setTextViewTextSize(R.id.compact_next_time, TypedValue.COMPLEX_UNIT_SP, Math.round(12f * fontScale));
            views.setTextViewTextSize(R.id.compact_remaining_label, TypedValue.COMPLEX_UNIT_SP, Math.round(10f * fontScale));
            views.setTextViewTextSize(R.id.compact_chronometer, TypedValue.COMPLEX_UNIT_SP, Math.round(11f * fontScale));
            views.setTextViewTextSize(R.id.compact_remaining_en, TypedValue.COMPLEX_UNIT_SP, Math.round(11f * fontScale));
        } else {
            float wRatio = (minWidth > 0) ? (minWidth / 220f) : 1.0f;
            float hRatio = (minHeight > 0) ? (minHeight / 85f) : 1.0f;
            fontScale = Math.min(wRatio, hRatio);
            fontScale = Math.max(0.55f, Math.min(1.35f, fontScale));

            views.setTextViewTextSize(R.id.compact_hijri_date, TypedValue.COMPLEX_UNIT_SP, Math.round(12f * fontScale));
            views.setTextViewTextSize(R.id.compact_gregorian_date, TypedValue.COMPLEX_UNIT_SP, Math.round(11f * fontScale));
            views.setTextViewTextSize(R.id.compact_prev_label, TypedValue.COMPLEX_UNIT_SP, Math.round(11f * fontScale));
            views.setTextViewTextSize(R.id.compact_prev_name, TypedValue.COMPLEX_UNIT_SP, Math.round(15f * fontScale));
            views.setTextViewTextSize(R.id.compact_prev_time, TypedValue.COMPLEX_UNIT_SP, Math.round(13f * fontScale));
            views.setTextViewTextSize(R.id.compact_next_label, TypedValue.COMPLEX_UNIT_SP, Math.round(11.5f * fontScale));
            views.setTextViewTextSize(R.id.compact_next_name, TypedValue.COMPLEX_UNIT_SP, Math.round(17f * fontScale));
            views.setTextViewTextSize(R.id.compact_next_time, TypedValue.COMPLEX_UNIT_SP, Math.round(14f * fontScale));
            views.setTextViewTextSize(R.id.compact_remaining_label, TypedValue.COMPLEX_UNIT_SP, Math.round(12f * fontScale));
            views.setTextViewTextSize(R.id.compact_chronometer, TypedValue.COMPLEX_UNIT_SP, Math.round(15f * fontScale));
            views.setTextViewTextSize(R.id.compact_remaining_en, TypedValue.COMPLEX_UNIT_SP, Math.round(15f * fontScale));
        }

        JSONObject cachedThemeObj = null;

        if (prayerJson != null && !prayerJson.trim().isEmpty()) {
            try {
                JSONObject data = new JSONObject(prayerJson);
                if (data.has("theme") && !data.isNull("theme")) {
                    cachedThemeObj = data.getJSONObject("theme");
                }
                JSONObject times = data.optJSONObject("times");

                String nextPrayerId = data.optString("next_prayer_id", "fajr");
                String nextPrayerName = data.optString("next_prayer_name", isArabic ? "الفجر" : "Fajr");
                long targetTimeMillis = data.optLong("target_time_millis", 0);
                long now = System.currentTimeMillis();

                // Dynamic lookup from timestamps if targetTimeMillis is in the past or missing
                if (data.has("timestamps") && !data.isNull("timestamps")) {
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

                    for (int i = 0; i < prayerIds.length; i++) {
                        if (timestamps.has(prayerIds[i])) {
                            long pTime = timestamps.getLong(prayerIds[i]);
                            if (pTime > now) {
                                targetTimeMillis = pTime;
                                String id = prayerIds[i];
                                if (id.startsWith("next")) {
                                    id = id.substring(4).toLowerCase();
                                }
                                nextPrayerId = id;
                                nextPrayerName = prayerNames[i];
                                break;
                            }
                        }
                    }
                }

                // If targetTimeMillis is still expired or 0, fallback to autonomous calculation via PrayerCalculationEngine
                if ((targetTimeMillis <= now || targetTimeMillis <= 0) && data.has("coordinates")) {
                    JSONObject coords = data.getJSONObject("coordinates");
                    double lat = coords.optDouble("lat", 0.0);
                    double lng = coords.optDouble("lng", 0.0);
                    int methodId = data.optInt("method_id", 3);
                    long baseDateMillis = data.optLong("base_date_millis", 0);

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
                    String[] autoIds = {"fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"};
                    String[] autoNamesAr = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
                    String[] autoNamesEn = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                    String[] autoNames = isArabic ? autoNamesAr : autoNamesEn;

                    boolean foundNext = false;
                    for (int i = 0; i < autoTimes.length; i++) {
                        if (autoTimes[i] > now) {
                            targetTimeMillis = autoTimes[i];
                            nextPrayerId = autoIds[i];
                            nextPrayerName = autoNames[i];
                            foundNext = true;
                            break;
                        }
                    }

                    if (!foundNext) {
                        Calendar tomCal = Calendar.getInstance();
                        tomCal.add(Calendar.DAY_OF_YEAR, 1);
                        PrayerCalculationEngine.PrayerResult tomRes = PrayerCalculationEngine.calculate(
                                tomCal.getTime(), lat, lng, methodId, false, offsets, isArabic,
                                baseDateMillis, data.optString("hijri", ""), data.optString("gregorian", "")
                        );
                        targetTimeMillis = tomRes.fajrMillis;
                        nextPrayerId = "fajr";
                        nextPrayerName = isArabic ? "الفجر" : "Fajr";
                    }
                }

                // Compute previous prayer from prayer sequence
                String[] prayerOrder = {"fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"};
                String[] namesAr = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
                String[] namesEn = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                String[] names = isArabic ? namesAr : namesEn;

                int nextIdx = 0;
                for (int i = 0; i < prayerOrder.length; i++) {
                    if (prayerOrder[i].equalsIgnoreCase(nextPrayerId)) {
                        nextIdx = i;
                        break;
                    }
                }
                int prevIdx = (nextIdx - 1 + prayerOrder.length) % prayerOrder.length;
                String prevPrayerId = prayerOrder[prevIdx];
                String prevPrayerName = names[prevIdx];

                String prevTime = (times != null) ? times.optString(prevPrayerId, "--:--") : "--:--";
                String nextTime = (times != null) ? times.optString(nextPrayerId, "--:--") : "--:--";

                // Bind Dates
                String hijriStr = PrayerWidgetProvider.translate(data.optString("day", "") + "، " + data.optString("hijri", ""), isArabic);
                String gregStr = PrayerWidgetProvider.translate(data.optString("gregorian", ""), isArabic);
                views.setTextViewText(R.id.compact_hijri_date, PrayerWidgetProvider.formatNumerals(hijriStr, isArabic));
                views.setTextViewText(R.id.compact_gregorian_date, PrayerWidgetProvider.formatNumerals(gregStr, isArabic));

                // Bind Labels
                views.setTextViewText(R.id.compact_prev_label, isArabic ? "الصلاة السابقة" : "Previous");
                views.setTextViewText(R.id.compact_prev_name, prevPrayerName);
                views.setTextViewText(R.id.compact_prev_time, PrayerWidgetProvider.formatNumerals(prevTime, isArabic));

                views.setTextViewText(R.id.compact_next_label, isArabic ? "الصلاة القادمة" : "Next Prayer");
                views.setTextViewText(R.id.compact_next_name, nextPrayerName);
                views.setTextViewText(R.id.compact_next_time, PrayerWidgetProvider.formatNumerals(nextTime, isArabic));

                views.setTextViewText(R.id.compact_remaining_label, isArabic ? "متبقي على الصلاة:" : "Remaining:");

                // Setup countdown
                if (targetTimeMillis > now) {
                    long remainingMillis = targetTimeMillis - now;
                    if (isArabic) {
                        views.setViewVisibility(R.id.compact_chronometer, View.VISIBLE);
                        views.setViewVisibility(R.id.compact_remaining_en, View.GONE);
                        long base = android.os.SystemClock.elapsedRealtime() + remainingMillis;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            views.setBoolean(R.id.compact_chronometer, "setCountDown", true);
                        }
                        views.setChronometer(R.id.compact_chronometer, base, "%s", true);
                    } else {
                        views.setViewVisibility(R.id.compact_chronometer, View.GONE);
                        views.setViewVisibility(R.id.compact_remaining_en, View.VISIBLE);
                        views.setTextViewText(R.id.compact_remaining_en, PrayerWidgetProvider.formatRemainingTime(remainingMillis));
                    }

                    // Schedule Alarm for next prayer transition
                    Intent updateIntent = new Intent(context, PrayerCompactWidgetProvider.class);
                    updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                    updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
                    PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                            context, appWidgetId + 5000, updateIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );
                    scheduleSafeAlarm(context, targetTimeMillis + 1000, pendingUpdate);

                    // Schedule 1-minute recurring update alarm for smooth display
                    Intent minIntent = new Intent(context, PrayerCompactWidgetProvider.class);
                    minIntent.setAction(ACTION_REFRESH_COMPACT);
                    PendingIntent minPending = PendingIntent.getBroadcast(
                            context, appWidgetId + 9500, minIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );
                    long nextMinute = (System.currentTimeMillis() / 60000 + 1) * 60000;
                    scheduleSafeAlarm(context, nextMinute, minPending);
                } else {
                    views.setChronometer(R.id.compact_chronometer, android.os.SystemClock.elapsedRealtime(), "00:00:00", false);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        try {
                // Theme handling
                boolean isDark = false;
                if (cachedThemeObj != null) {
                    isDark = cachedThemeObj.optBoolean("isDark", false);
                }

                if (isDark) {
                    views.setInt(R.id.widget_root, "setBackgroundResource", R.drawable.widget_compact_bg_dark);
                    views.setInt(R.id.compact_prev_card, "setBackgroundResource", R.drawable.widget_compact_prev_card_dark);
                    views.setInt(R.id.compact_next_card, "setBackgroundResource", R.drawable.widget_compact_next_card_dark);
                    views.setInt(R.id.compact_countdown_card, "setBackgroundResource", R.drawable.widget_countdown_ribbon_dark);

                    views.setTextColor(R.id.compact_hijri_date, Color.parseColor("#34D399"));
                    views.setTextColor(R.id.compact_gregorian_date, Color.parseColor("#94A3B8"));
                    views.setTextColor(R.id.compact_prev_label, Color.parseColor("#94A3B8"));
                    views.setTextColor(R.id.compact_prev_name, Color.parseColor("#F1F5F9"));
                    views.setTextColor(R.id.compact_prev_time, Color.parseColor("#CBD5E1"));
                    views.setTextColor(R.id.compact_next_label, Color.parseColor("#34D399"));
                    views.setTextColor(R.id.compact_next_name, Color.parseColor("#6EE7B7"));
                    views.setTextColor(R.id.compact_next_time, Color.parseColor("#A7F3D0"));
                    views.setTextColor(R.id.compact_remaining_label, Color.parseColor("#FDE68A"));
                    views.setTextColor(R.id.compact_chronometer, Color.parseColor("#F59E0B"));
                    views.setTextColor(R.id.compact_remaining_en, Color.parseColor("#F59E0B"));
                } else {
                    views.setInt(R.id.widget_root, "setBackgroundResource", R.drawable.widget_compact_bg);
                    views.setInt(R.id.compact_prev_card, "setBackgroundResource", R.drawable.widget_compact_prev_card);
                    views.setInt(R.id.compact_next_card, "setBackgroundResource", R.drawable.widget_compact_next_card);
                    views.setInt(R.id.compact_countdown_card, "setBackgroundResource", R.drawable.widget_countdown_ribbon);

                    views.setTextColor(R.id.compact_hijri_date, Color.parseColor("#000000"));
                    views.setTextColor(R.id.compact_gregorian_date, Color.parseColor("#334155"));
                    views.setTextColor(R.id.compact_prev_label, Color.parseColor("#334155"));
                    views.setTextColor(R.id.compact_prev_name, Color.parseColor("#000000"));
                    views.setTextColor(R.id.compact_prev_time, Color.parseColor("#000000"));
                    views.setTextColor(R.id.compact_next_label, Color.parseColor("#FEF08A"));
                    views.setTextColor(R.id.compact_next_name, Color.parseColor("#FFFFFF"));
                    views.setTextColor(R.id.compact_next_time, Color.parseColor("#FFFFFF"));
                    views.setTextColor(R.id.compact_remaining_label, Color.parseColor("#000000"));
                    views.setTextColor(R.id.compact_chronometer, Color.parseColor("#C86400"));
                }

                // Apply transparency and custom theme configuration from SharedPreferences strictly per appWidgetId
                int transparency = prefs.getInt("widget_transparency_" + appWidgetId, -1);
                if (transparency == -1) {
                    transparency = prefs.getInt("widget_compact_transparency",
                            prefs.getInt("widget_transparency", 95));
                }
                float alphaFactor = Math.max(0.0f, Math.min(1.0f, transparency / 100.0f));
                int alphaVal = Math.round(alphaFactor * 255);

                String overrideTheme = prefs.getString("widget_theme_" + appWidgetId, null);
                if (overrideTheme == null || overrideTheme.trim().isEmpty()) {
                    overrideTheme = prefs.getString("widget_compact_theme",
                            prefs.getString("widget_theme", "golden_trio"));
                }

                // Vibrant Islamic Emerald & Gold Default Palette
                int rootBg = Color.parseColor("#0F1714");
                int prevCardBg = Color.parseColor("#064E3B");
                int nextCardBg = Color.parseColor("#047857");
                int ribbonBg = Color.parseColor("#022C22");
                int prevNameColor = Color.parseColor("#FFFFFF");
                int prevTimeColor = Color.parseColor("#38BDF8");
                int nextNameColor = Color.parseColor("#FDE68A");
                int nextTimeColor = Color.parseColor("#FFFFFF");
                int ribbonTextColor = Color.parseColor("#FBBF24");
                int dateTextColor = Color.parseColor("#6EE7B7");
                int labelTextColor = Color.parseColor("#CBD5E1");

                if ("royal_gold_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#2D1600");
                    prevCardBg = Color.parseColor("#1C0D00");
                    nextCardBg = Color.parseColor("#5E2E00");
                    ribbonBg = Color.parseColor("#451A03");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#FDE68A");
                    nextNameColor = Color.parseColor("#FFFFFF");
                    nextTimeColor = Color.parseColor("#FBBF24");
                    ribbonTextColor = Color.parseColor("#FEF08A");
                    dateTextColor = Color.parseColor("#FDE68A");
                    labelTextColor = Color.parseColor("#FDE68A");
                } else if ("emerald_prism_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#022C22");
                    prevCardBg = Color.parseColor("#011712");
                    nextCardBg = Color.parseColor("#064E3B");
                    ribbonBg = Color.parseColor("#064E3B");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#A7F3D0");
                    nextNameColor = Color.parseColor("#FFFFFF");
                    nextTimeColor = Color.parseColor("#34D399");
                    ribbonTextColor = Color.parseColor("#A7F3D0");
                    dateTextColor = Color.parseColor("#6EE7B7");
                    labelTextColor = Color.parseColor("#A7F3D0");
                } else if ("ruby_gem_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#4C0519");
                    prevCardBg = Color.parseColor("#2B000C");
                    nextCardBg = Color.parseColor("#881337");
                    ribbonBg = Color.parseColor("#70092B");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#FECDD3");
                    nextNameColor = Color.parseColor("#FFFFFF");
                    nextTimeColor = Color.parseColor("#FB7185");
                    ribbonTextColor = Color.parseColor("#FFE4E6");
                    dateTextColor = Color.parseColor("#FECDD3");
                    labelTextColor = Color.parseColor("#FECDD3");
                } else if ("antique_bronze_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#261A12");
                    prevCardBg = Color.parseColor("#180F0A");
                    nextCardBg = Color.parseColor("#4D3321");
                    ribbonBg = Color.parseColor("#3D2718");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#D4BFA6");
                    nextNameColor = Color.parseColor("#FFFFFF");
                    nextTimeColor = Color.parseColor("#D4AF37");
                    ribbonTextColor = Color.parseColor("#F5D77F");
                    dateTextColor = Color.parseColor("#E5C39E");
                    labelTextColor = Color.parseColor("#D4BFA6");
                } else if ("royal_marble_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#F8FAFC");
                    prevCardBg = Color.parseColor("#FFFFFF");
                    nextCardBg = Color.parseColor("#FEF3C7");
                    ribbonBg = Color.parseColor("#FEF3C7");
                    prevNameColor = Color.parseColor("#0F172A");
                    prevTimeColor = Color.parseColor("#475569");
                    nextNameColor = Color.parseColor("#78350F");
                    nextTimeColor = Color.parseColor("#B45309");
                    ribbonTextColor = Color.parseColor("#78350F");
                    dateTextColor = Color.parseColor("#78350F");
                    labelTextColor = Color.parseColor("#475569");
                } else if ("titanium_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#181E24");
                    prevCardBg = Color.parseColor("#222B35");
                    nextCardBg = Color.parseColor("#2C3847");
                    ribbonBg = Color.parseColor("#181E24");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#94A3B8");
                    nextNameColor = Color.parseColor("#38BDF8");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#FBBF24");
                    dateTextColor = Color.parseColor("#38BDF8");
                    labelTextColor = Color.parseColor("#94A3B8");
                } else if ("emerald_3d".equalsIgnoreCase(overrideTheme) || "emerald_night".equalsIgnoreCase(overrideTheme) || "emerald".equalsIgnoreCase(overrideTheme) || "default".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#022C22");
                    prevCardBg = Color.parseColor("#044E3B");
                    nextCardBg = Color.parseColor("#065F46");
                    ribbonBg = Color.parseColor("#022C22");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#6EE7B7");
                    nextNameColor = Color.parseColor("#FDE68A");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#FBBF24");
                    dateTextColor = Color.parseColor("#6EE7B7");
                    labelTextColor = Color.parseColor("#A7F3D0");
                } else if ("sapphire_3d".equalsIgnoreCase(overrideTheme) || "navy".equalsIgnoreCase(overrideTheme) || "royal_navy".equalsIgnoreCase(overrideTheme) || "dark".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#091528");
                    prevCardBg = Color.parseColor("#0F274A");
                    nextCardBg = Color.parseColor("#1E3A8A");
                    ribbonBg = Color.parseColor("#091528");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#93C5FD");
                    nextNameColor = Color.parseColor("#38BDF8");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#60A5FA");
                    dateTextColor = Color.parseColor("#38BDF8");
                    labelTextColor = Color.parseColor("#94A3B8");
                } else if ("gold_ingot_3d".equalsIgnoreCase(overrideTheme) || "gold".equalsIgnoreCase(overrideTheme) || "golden_sand".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#140E03");
                    prevCardBg = Color.parseColor("#231804");
                    nextCardBg = Color.parseColor("#3D2A07");
                    ribbonBg = Color.parseColor("#140E03");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#FEF08A");
                    nextNameColor = Color.parseColor("#FBBF24");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#FDE047");
                    dateTextColor = Color.parseColor("#FBBF24");
                    labelTextColor = Color.parseColor("#FDE68A");
                } else if ("ruby_velvet_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#33050E");
                    prevCardBg = Color.parseColor("#4C0816");
                    nextCardBg = Color.parseColor("#700D22");
                    ribbonBg = Color.parseColor("#33050E");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#FECDD3");
                    nextNameColor = Color.parseColor("#FB7185");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#F43F5E");
                    dateTextColor = Color.parseColor("#FECDD3");
                    labelTextColor = Color.parseColor("#FECDD3");
                } else if ("cyber_neon_3d".equalsIgnoreCase(overrideTheme) || "neon_cyber".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#04070A");
                    prevCardBg = Color.parseColor("#0A121A");
                    nextCardBg = Color.parseColor("#0E1E2C");
                    ribbonBg = Color.parseColor("#04070A");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#38BDF8");
                    nextNameColor = Color.parseColor("#22D3EE");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#4ADE80");
                    dateTextColor = Color.parseColor("#22D3EE");
                    labelTextColor = Color.parseColor("#94A3B8");
                } else if ("violet_amethyst_3d".equalsIgnoreCase(overrideTheme) || "royal_purple".equalsIgnoreCase(overrideTheme) || "amethyst_purple".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#200538");
                    prevCardBg = Color.parseColor("#350A5C");
                    nextCardBg = Color.parseColor("#51118A");
                    ribbonBg = Color.parseColor("#200538");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#E9D5FF");
                    nextNameColor = Color.parseColor("#C084FC");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#FDE68A");
                    dateTextColor = Color.parseColor("#E9D5FF");
                    labelTextColor = Color.parseColor("#E9D5FF");
                } else if ("copper_bronze_3d".equalsIgnoreCase(overrideTheme) || "bronze_copper".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#260F04");
                    prevCardBg = Color.parseColor("#3D1806");
                    nextCardBg = Color.parseColor("#5C250A");
                    ribbonBg = Color.parseColor("#260F04");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#FED7AA");
                    nextNameColor = Color.parseColor("#FB923C");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#FED7AA");
                    dateTextColor = Color.parseColor("#FED7AA");
                    labelTextColor = Color.parseColor("#FED7AA");
                } else if ("azure_crystal_3d".equalsIgnoreCase(overrideTheme) || "sky".equalsIgnoreCase(overrideTheme) || "fajr_light".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#052233");
                    prevCardBg = Color.parseColor("#083754");
                    nextCardBg = Color.parseColor("#0C4E75");
                    ribbonBg = Color.parseColor("#052233");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#A5F3FC");
                    nextNameColor = Color.parseColor("#22D3EE");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#67E8F9");
                    dateTextColor = Color.parseColor("#A5F3FC");
                    labelTextColor = Color.parseColor("#BAE6FD");
                } else if ("desert_amber_3d".equalsIgnoreCase(overrideTheme) || "sunset_amber".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#331606");
                    prevCardBg = Color.parseColor("#522309");
                    nextCardBg = Color.parseColor("#78350F");
                    ribbonBg = Color.parseColor("#331606");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#FEF08A");
                    nextNameColor = Color.parseColor("#F59E0B");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#FEF08A");
                    dateTextColor = Color.parseColor("#FEF08A");
                    labelTextColor = Color.parseColor("#FEF08A");
                } else if ("mint_frost_3d".equalsIgnoreCase(overrideTheme) || "mint_fresh".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#03211B");
                    prevCardBg = Color.parseColor("#05382E");
                    nextCardBg = Color.parseColor("#075243");
                    ribbonBg = Color.parseColor("#03211B");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#99F6E4");
                    nextNameColor = Color.parseColor("#2DD4BF");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#5EEAD4");
                    dateTextColor = Color.parseColor("#99F6E4");
                    labelTextColor = Color.parseColor("#99F6E4");
                } else if ("black".equalsIgnoreCase(overrideTheme) || "deep_black".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#000000");
                    prevCardBg = Color.parseColor("#18181B");
                    nextCardBg = Color.parseColor("#27272A");
                    ribbonBg = Color.parseColor("#121212");
                    prevNameColor = Color.parseColor("#FFFFFF");
                    prevTimeColor = Color.parseColor("#E4E4E7");
                    nextNameColor = Color.parseColor("#FBBF24");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#FDE68A");
                    dateTextColor = Color.parseColor("#FBBF24");
                    labelTextColor = Color.parseColor("#A1A1AA");
                } else if ("clean_paper".equalsIgnoreCase(overrideTheme) || "pearl_white_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#F1F5F9");
                    prevCardBg = Color.parseColor("#FFFFFF");
                    nextCardBg = Color.parseColor("#E2E8F0");
                    ribbonBg = Color.parseColor("#F8FAFC");
                    prevNameColor = Color.parseColor("#0F172A");
                    prevTimeColor = Color.parseColor("#334155");
                    nextNameColor = Color.parseColor("#0284C7");
                    nextTimeColor = Color.parseColor("#0F172A");
                    ribbonTextColor = Color.parseColor("#D97706");
                    dateTextColor = Color.parseColor("#0F172A");
                    labelTextColor = Color.parseColor("#475569");
                } else if ("shiny_gold".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#FEF08A");
                    prevCardBg = Color.parseColor("#FFFBEB");
                    nextCardBg = Color.parseColor("#FDE047");
                    ribbonBg = Color.parseColor("#FEF3C7");
                    prevNameColor = Color.parseColor("#78350F");
                    prevTimeColor = Color.parseColor("#92400E");
                    nextNameColor = Color.parseColor("#B45309");
                    nextTimeColor = Color.parseColor("#78350F");
                    ribbonTextColor = Color.parseColor("#78350F");
                } else if ("golden_trio".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#F8DE8A");
                    prevCardBg = Color.parseColor("#FFFFFF");
                    nextCardBg = Color.parseColor("#C86400");
                    ribbonBg = Color.parseColor("#FFFFFF");
                    prevNameColor = Color.parseColor("#000000");
                    prevTimeColor = Color.parseColor("#000000");
                    nextNameColor = Color.parseColor("#FFFFFF");
                    nextTimeColor = Color.parseColor("#FFFFFF");
                    ribbonTextColor = Color.parseColor("#000000");
                    dateTextColor = Color.parseColor("#000000");
                    labelTextColor = Color.parseColor("#334155");
                } else if ("violet_green_light".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#F5F3FF");
                    prevCardBg = Color.parseColor("#FFFFFF");
                    nextCardBg = Color.parseColor("#D1FAE5");
                    ribbonBg = Color.parseColor("#EDE9FE");
                    prevNameColor = Color.parseColor("#0F172A");
                    prevTimeColor = Color.parseColor("#7C3AED");
                    nextNameColor = Color.parseColor("#065F46");
                    nextTimeColor = Color.parseColor("#047857");
                    ribbonTextColor = Color.parseColor("#6D28D9");
                    dateTextColor = Color.parseColor("#0F172A");
                    labelTextColor = Color.parseColor("#475569");
                } else if ("sky_blue_light".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#F0F9FF");
                    prevCardBg = Color.parseColor("#FFFFFF");
                    nextCardBg = Color.parseColor("#E0F2FE");
                    ribbonBg = Color.parseColor("#E0F2FE");
                    prevNameColor = Color.parseColor("#0F172A");
                    prevTimeColor = Color.parseColor("#0369A1");
                    nextNameColor = Color.parseColor("#0284C7");
                    nextTimeColor = Color.parseColor("#0369A1");
                    ribbonTextColor = Color.parseColor("#0284C7");
                    dateTextColor = Color.parseColor("#0F172A");
                    labelTextColor = Color.parseColor("#475569");
                } else if ("rose_peach_light".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#FFF1F2");
                    prevCardBg = Color.parseColor("#FFFFFF");
                    nextCardBg = Color.parseColor("#FFEDD5");
                    ribbonBg = Color.parseColor("#FFE4E6");
                    prevNameColor = Color.parseColor("#0F172A");
                    prevTimeColor = Color.parseColor("#E11D48");
                    nextNameColor = Color.parseColor("#C2410C");
                    nextTimeColor = Color.parseColor("#EA580C");
                    ribbonTextColor = Color.parseColor("#E11D48");
                    dateTextColor = Color.parseColor("#0F172A");
                    labelTextColor = Color.parseColor("#475569");
                } else if ("emerald_mint_light".equalsIgnoreCase(overrideTheme)) {
                    rootBg = Color.parseColor("#ECFDF5");
                    prevCardBg = Color.parseColor("#FFFFFF");
                    nextCardBg = Color.parseColor("#D1FAE5");
                    ribbonBg = Color.parseColor("#D1FAE5");
                    prevNameColor = Color.parseColor("#0F172A");
                    prevTimeColor = Color.parseColor("#059669");
                    nextNameColor = Color.parseColor("#065F46");
                    nextTimeColor = Color.parseColor("#047857");
                    ribbonTextColor = Color.parseColor("#059669");
                    dateTextColor = Color.parseColor("#0F172A");
                    labelTextColor = Color.parseColor("#475569");
                }

                boolean isGoldenTrioTheme = "golden_trio".equalsIgnoreCase(overrideTheme);
                int nextLabelColor = isGoldenTrioTheme ? Color.parseColor("#FEF08A") : labelTextColor;
                int refreshTint = isGoldenTrioTheme ? Color.parseColor("#C86400") : dateTextColor;

                rootBg = Color.argb(alphaVal, Color.red(rootBg), Color.green(rootBg), Color.blue(rootBg));
                prevCardBg = Color.argb(alphaVal, Color.red(prevCardBg), Color.green(prevCardBg), Color.blue(prevCardBg));
                nextCardBg = Color.argb(alphaVal, Color.red(nextCardBg), Color.green(nextCardBg), Color.blue(nextCardBg));
                ribbonBg = Color.argb(alphaVal, Color.red(ribbonBg), Color.green(ribbonBg), Color.blue(ribbonBg));

                views.setInt(R.id.widget_root, "setBackgroundColor", rootBg);
                views.setInt(R.id.compact_prev_card, "setBackgroundColor", prevCardBg);
                views.setInt(R.id.compact_next_card, "setBackgroundColor", nextCardBg);
                views.setInt(R.id.compact_countdown_card, "setBackgroundColor", ribbonBg);
                views.setInt(R.id.widget_btn_refresh, "setColorFilter", refreshTint);

                views.setTextColor(R.id.compact_hijri_date, dateTextColor);
                views.setTextColor(R.id.compact_gregorian_date, labelTextColor);
                views.setTextColor(R.id.compact_prev_label, labelTextColor);
                views.setTextColor(R.id.compact_prev_name, prevNameColor);
                views.setTextColor(R.id.compact_prev_time, prevTimeColor);
                views.setTextColor(R.id.compact_next_label, nextLabelColor);
                views.setTextColor(R.id.compact_next_name, nextNameColor);
                views.setTextColor(R.id.compact_next_time, nextTimeColor);
                views.setTextColor(R.id.compact_remaining_label, ribbonTextColor);
                views.setTextColor(R.id.compact_chronometer, isGoldenTrioTheme ? Color.parseColor("#C86400") : ribbonTextColor);
                views.setTextColor(R.id.compact_remaining_en, isGoldenTrioTheme ? Color.parseColor("#C86400") : ribbonTextColor);

        } catch (Exception e) {
            e.printStackTrace();
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
