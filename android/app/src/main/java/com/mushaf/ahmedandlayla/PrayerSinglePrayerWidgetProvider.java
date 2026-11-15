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
 * Single Prayer 1x1 Widget:
 * Displays ONLY the upcoming prayer name and live remaining countdown (e.g. "صلاة الفجر بعد 00:24:15").
 * Ultra-clean, scalable when resized, supports 16 themes and transparency.
 */
public class PrayerSinglePrayerWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_REFRESH_SINGLE = "com.mushaf.ahmedandlayla.ACTION_REFRESH_SINGLE";

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

        if (ACTION_REFRESH_SINGLE.equals(action) ||
            PrayerWidgetProvider.ACTION_REFRESH_WIDGET.equals(action) ||
            Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
            Intent.ACTION_DATE_CHANGED.equals(action)) {

            if (ACTION_REFRESH_SINGLE.equals(action)) {
                try {
                    Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                    if (v != null) v.vibrate(30);
                } catch (Exception ignored) {}
            }

            updateAllWidgets(context);
        }
    }

    public static void updateAllWidgets(Context context) {
        if (context == null) return;
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName componentName = new ComponentName(context, PrayerSinglePrayerWidgetProvider.class);
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

        int layoutId = isArabic ? R.layout.prayer_widget_single : R.layout.prayer_widget_single_ltr;
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);

        // Click on 1x1 widget directly opens Prayer Times page
        Intent prayerIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("com.mushaf.ahmedandlayla://prayer-times"));
        prayerIntent.setClass(context, MainActivity.class);
        prayerIntent.putExtra("shortcut_target", "prayer-times");
        prayerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent prayerPending = PendingIntent.getActivity(
                context, 301, prayerIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, prayerPending);

        // Dynamic Font Scaling when user resizes widget from 1x1 to larger sizes
        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int minWidth = (options != null) ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 50) : 50;
        int minHeight = (options != null) ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 50) : 50;

        float sizeDimension = Math.min(minWidth > 0 ? minWidth : 50, minHeight > 0 ? minHeight : 50);
        float scale = sizeDimension / 55.0f;
        scale = Math.max(0.85f, Math.min(2.2f, scale));

        float nameSize = Math.max(11f, 12f * scale);
        float countSize = Math.max(15f, 17f * scale);
        views.setTextViewTextSize(R.id.widget_single_prayer_name, TypedValue.COMPLEX_UNIT_SP, Math.round(nameSize));
        views.setTextViewTextSize(R.id.widget_single_countdown, TypedValue.COMPLEX_UNIT_SP, Math.round(countSize));
        views.setTextViewTextSize(R.id.widget_single_countdown_en, TypedValue.COMPLEX_UNIT_SP, Math.round(countSize));

        String nextPrayerName = isArabic ? "الفجر" : "Fajr";
        long targetTimeMillis = 0;
        long now = System.currentTimeMillis();
        JSONObject cachedThemeObj = null;

        if (prayerJson != null && !prayerJson.trim().isEmpty()) {
            try {
                JSONObject data = new JSONObject(prayerJson);
                if (data.has("theme") && !data.isNull("theme")) {
                    cachedThemeObj = data.getJSONObject("theme");
                }
                nextPrayerName = data.optString("next_prayer_name", isArabic ? "الفجر" : "Fajr");
                targetTimeMillis = data.optLong("target_time_millis", 0);

                // Timestamps lookup
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
                                nextPrayerName = prayerNames[i];
                                break;
                            }
                        }
                    }
                }

                // Autonomous recalculation if targetTime is expired and coordinates available
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
                    String[] autoNamesAr = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
                    String[] autoNamesEn = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                    String[] autoNames = isArabic ? autoNamesAr : autoNamesEn;

                    boolean found = false;
                    for (int i = 0; i < autoTimes.length; i++) {
                        if (autoTimes[i] > now) {
                            targetTimeMillis = autoTimes[i];
                            nextPrayerName = autoNames[i];
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        Calendar tomCal = Calendar.getInstance();
                        tomCal.add(Calendar.DAY_OF_YEAR, 1);
                        PrayerCalculationEngine.PrayerResult tomRes = PrayerCalculationEngine.calculate(
                                tomCal.getTime(), lat, lng, methodId, false, offsets, isArabic,
                                baseDateMillis, data.optString("hijri", ""), data.optString("gregorian", "")
                        );
                        targetTimeMillis = tomRes.fajrMillis;
                        nextPrayerName = isArabic ? "الفجر" : "Fajr";
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Format label strictly as requested: e.g. "صلاة الفجر بعد"
        String singleLabel;
        if (isArabic) {
            singleLabel = "صلاة " + nextPrayerName + " بعد";
        } else {
            singleLabel = nextPrayerName + " in";
        }
        views.setTextViewText(R.id.widget_single_prayer_name, singleLabel);

        // Setup Countdown Chronometer / English formatted text
        if (targetTimeMillis > now) {
            long remainingMillis = targetTimeMillis - now;
            if (isArabic) {
                views.setViewVisibility(R.id.widget_single_countdown, View.VISIBLE);
                views.setViewVisibility(R.id.widget_single_countdown_en, View.GONE);
                long base = android.os.SystemClock.elapsedRealtime() + remainingMillis;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    views.setBoolean(R.id.widget_single_countdown, "setCountDown", true);
                }
                views.setChronometer(R.id.widget_single_countdown, base, "%s", true);
            } else {
                views.setViewVisibility(R.id.widget_single_countdown, View.GONE);
                views.setViewVisibility(R.id.widget_single_countdown_en, View.VISIBLE);
                views.setTextViewText(R.id.widget_single_countdown_en, PrayerWidgetProvider.formatRemainingTime(remainingMillis));
            }

            // Schedule alarm for transition
            Intent updateIntent = new Intent(context, PrayerSinglePrayerWidgetProvider.class);
            updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
            PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                    context, appWidgetId + 7000, updateIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            scheduleSafeAlarm(context, targetTimeMillis + 1000, pendingUpdate);

            // Schedule 1-minute safety alarm
            Intent minIntent = new Intent(context, PrayerSinglePrayerWidgetProvider.class);
            minIntent.setAction(ACTION_REFRESH_SINGLE);
            PendingIntent minPending = PendingIntent.getBroadcast(
                    context, appWidgetId + 9800, minIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            long nextMinute = (System.currentTimeMillis() / 60000 + 1) * 60000;
            scheduleMinuteAlarm(context, nextMinute, minPending);
        } else {
            views.setChronometer(R.id.widget_single_countdown, android.os.SystemClock.elapsedRealtime(), "00:00:00", false);
        }

        // Theming & Transparency
        try {
            boolean isDark = false;
            if (cachedThemeObj != null) {
                isDark = cachedThemeObj.optBoolean("isDark", false);
            }

            int transparency = prefs.getInt("widget_transparency_" + appWidgetId, -1);
            if (transparency == -1) {
                transparency = prefs.getInt("widget_single_transparency",
                        prefs.getInt("widget_transparency", 95));
            }
            float alphaFactor = Math.max(0.0f, Math.min(1.0f, transparency / 100.0f));
            int alphaVal = Math.round(alphaFactor * 255);

            String overrideTheme = prefs.getString("widget_theme_" + appWidgetId, null);
            if (overrideTheme == null || overrideTheme.trim().isEmpty()) {
                overrideTheme = prefs.getString("widget_single_theme",
                        prefs.getString("widget_theme", "golden_trio"));
            }

            // Color defaults
            int rootBg = isDark ? Color.parseColor("#18181B") : Color.parseColor("#F8DE8A");
            int prayerNameColor = isDark ? Color.parseColor("#34D399") : Color.parseColor("#C86400");
            int countdownColor = isDark ? Color.parseColor("#F59E0B") : Color.parseColor("#000000");

            if ("royal_gold_3d".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#2D1600");
                prayerNameColor = Color.parseColor("#FBBF24");
                countdownColor = Color.parseColor("#FFFFFF");
            } else if ("emerald_prism_3d".equalsIgnoreCase(overrideTheme) || "emerald_3d".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#022C22");
                prayerNameColor = Color.parseColor("#34D399");
                countdownColor = Color.parseColor("#FFFFFF");
            } else if ("ruby_gem_3d".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#4C0519");
                prayerNameColor = Color.parseColor("#FB7185");
                countdownColor = Color.parseColor("#FFFFFF");
            } else if ("antique_bronze_3d".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#261A12");
                prayerNameColor = Color.parseColor("#D4AF37");
                countdownColor = Color.parseColor("#FFFFFF");
            } else if ("royal_marble_3d".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#1E293B");
                prayerNameColor = Color.parseColor("#38BDF8");
                countdownColor = Color.parseColor("#FFFFFF");
            } else if ("cyber_neon_3d".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#050814");
                prayerNameColor = Color.parseColor("#00F0FF");
                countdownColor = Color.parseColor("#39FF14");
            } else if ("violet_amethyst_3d".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#1A0B2E");
                prayerNameColor = Color.parseColor("#C084FC");
                countdownColor = Color.parseColor("#FFFFFF");
            } else if ("azure_crystal_3d".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#041D3B");
                prayerNameColor = Color.parseColor("#38BDF8");
                countdownColor = Color.parseColor("#FFFFFF");
            } else if ("pearl_white_3d".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#F8FAFC");
                prayerNameColor = Color.parseColor("#0284C7");
                countdownColor = Color.parseColor("#0F172A");
            } else if ("golden_trio".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#F8DE8A");
                prayerNameColor = Color.parseColor("#C86400");
                countdownColor = Color.parseColor("#000000");
            } else if ("violet_green_light".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#FAF5FF");
                prayerNameColor = Color.parseColor("#7E22CE");
                countdownColor = Color.parseColor("#0F172A");
            } else if ("sky_blue_light".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#F0F9FF");
                prayerNameColor = Color.parseColor("#0284C7");
                countdownColor = Color.parseColor("#0F172A");
            } else if ("rose_peach_light".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#FFF1F2");
                prayerNameColor = Color.parseColor("#BE123C");
                countdownColor = Color.parseColor("#1F080C");
            } else if ("emerald_mint_light".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#ECFDF5");
                prayerNameColor = Color.parseColor("#047857");
                countdownColor = Color.parseColor("#022C22");
            } else if ("black".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#000000");
                prayerNameColor = Color.parseColor("#FBBF24");
                countdownColor = Color.parseColor("#FFFFFF");
            } else if ("navy".equalsIgnoreCase(overrideTheme)) {
                rootBg = Color.parseColor("#0F172A");
                prayerNameColor = Color.parseColor("#38BDF8");
                countdownColor = Color.parseColor("#FFFFFF");
            }

            int alphaRootBg = Color.argb(alphaVal, Color.red(rootBg), Color.green(rootBg), Color.blue(rootBg));
            views.setInt(R.id.widget_root, "setBackgroundColor", alphaRootBg);
            views.setTextColor(R.id.widget_single_prayer_name, prayerNameColor);
            views.setTextColor(R.id.widget_single_countdown, countdownColor);
            views.setTextColor(R.id.widget_single_countdown_en, countdownColor);

        } catch (Exception e) {
            e.printStackTrace();
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static void scheduleSafeAlarm(Context context, long triggerAtMillis, PendingIntent pendingIntent) {
        if (context == null || pendingIntent == null || triggerAtMillis <= System.currentTimeMillis()) return;
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                } else {
                    am.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void scheduleMinuteAlarm(Context context, long triggerAtMillis, PendingIntent pendingIntent) {
        if (context == null || pendingIntent == null || triggerAtMillis <= System.currentTimeMillis()) return;
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (am.canScheduleExactAlarms()) {
                        am.setExact(AlarmManager.RTC, triggerAtMillis, pendingIntent);
                    } else {
                        am.set(AlarmManager.RTC, triggerAtMillis, pendingIntent);
                    }
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    am.setExact(AlarmManager.RTC, triggerAtMillis, pendingIntent);
                } else {
                    am.set(AlarmManager.RTC, triggerAtMillis, pendingIntent);
                }
            }
        } catch (SecurityException se) {
            try {
                AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                if (am != null) {
                    am.set(AlarmManager.RTC, triggerAtMillis, pendingIntent);
                }
            } catch (Exception ignored) {}
        } catch (Exception ignored) {}
    }
}
