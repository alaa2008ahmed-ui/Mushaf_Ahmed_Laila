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

public class PrayerWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_REFRESH_WIDGET = "com.mushaf.ahmedandlayla.ACTION_REFRESH_WIDGET";

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

        if (ACTION_REFRESH_WIDGET.equals(action) ||
            Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
            Intent.ACTION_DATE_CHANGED.equals(action)) {

            if (ACTION_REFRESH_WIDGET.equals(action)) {
                try {
                    Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                    if (v != null) v.vibrate(40);
                } catch (Exception ignored) {}
            }

            updateAllWidgets(context);
            PrayerCompactWidgetProvider.updateAllWidgets(context);
            try {
                PersistentPrayerNotification.update(context);
            } catch (Exception ignored) {}
        }
    }

    public static void updateAllWidgets(Context context) {
        if (context == null) return;
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName componentName = new ComponentName(context, PrayerWidgetProvider.class);
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

    public static String formatNumerals(String input, boolean isArabic) {
        if (input == null) return "";
        if (!isArabic) {
            // Strictly convert any Eastern Arabic / Persian digits to standard Latin digits (0-9)
            StringBuilder sb = new StringBuilder(input.length());
            for (int i = 0; i < input.length(); i++) {
                char c = input.charAt(i);
                if (c >= '\u0660' && c <= '\u0669') {
                    sb.append((char) ('0' + (c - '\u0660')));
                } else if (c >= '\u06F0' && c <= '\u06F9') {
                    sb.append((char) ('0' + (c - '\u06F0')));
                } else {
                    sb.append(c);
                }
            }
            return sb.toString();
        }

        // Arabic digits (٠-٩)
        char[] arabicChars = {'٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'};
        StringBuilder builder = new StringBuilder(input.length());
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (c >= '0' && c <= '9') {
                builder.append(arabicChars[c - '0']);
            } else {
                builder.append(c);
            }
        }
        return builder.toString();
    }

    public static String formatRemainingTime(long diffMillis) {
        if (diffMillis <= 0) return "00:00:00";
        long h = diffMillis / 3600000;
        long m = (diffMillis % 3600000) / 60000;
        long s = (diffMillis % 60000) / 1000;
        if (h > 0) {
            return String.format(java.util.Locale.ENGLISH, "%d:%02d:%02d", h, m, s);
        } else {
            return String.format(java.util.Locale.ENGLISH, "%02d:%02d", m, s);
        }
    }

    public static String translate(String text, boolean isArabic) {
        if (text == null) return "";
        if (isArabic) {
            // Translate English Gregorian Months to Arabic
            text = text.replace("January", "يناير");
            text = text.replace("February", "فبراير");
            text = text.replace("March", "مارس");
            text = text.replace("April", "أبريل");
            text = text.replace("May", "مايو");
            text = text.replace("June", "يونيو");
            text = text.replace("July", "يوليو");
            text = text.replace("August", "أغسطس");
            text = text.replace("September", "سبتمبر");
            text = text.replace("October", "أكتوبر");
            text = text.replace("November", "نوفمبر");
            text = text.replace("December", "ديسمبر");

            // Hijri Months translation to Arabic
            text = text.replace("Muharram", "محرم");
            text = text.replace("Safar", "صفر");
            text = text.replace("Rabi' 1", "ربيع الأول");
            text = text.replace("Rabi' al-Awwal", "ربيع الأول");
            text = text.replace("Rabi' 2", "ربيع الثاني");
            text = text.replace("Rabi' al-Thani", "ربيع الثاني");
            text = text.replace("Jumada 1", "جمادى الأولى");
            text = text.replace("Jumada al-Ula", "جمادى الأولى");
            text = text.replace("Jumada al-Awwal", "جمادى الأولى");
            text = text.replace("Jumada 2", "جمادى الآخرة");
            text = text.replace("Jumada al-Thani", "جمادى الآخرة");
            text = text.replace("Jumada al-Akhirah", "جمادى الآخرة");
            text = text.replace("Rajab", "رجب");
            text = text.replace("Sha'ban", "شعبان");
            text = text.replace("Ramadan", "رمضان");
            text = text.replace("Shawwal", "شوال");
            text = text.replace("Dhul-Qadah", "ذو القعدة");
            text = text.replace("Dhu al-Qi'dah", "ذو القعدة");
            text = text.replace("Dhul-Hijjah", "ذو الحجة");
            text = text.replace("Dhu al-Hijjah", "ذو الحجة");

            // Days translation to Arabic
            text = text.replace("Sunday", "الأحد");
            text = text.replace("Monday", "الإثنين");
            text = text.replace("Tuesday", "الثلاثاء");
            text = text.replace("Wednesday", "الأربعاء");
            text = text.replace("Thursday", "الخميس");
            text = text.replace("Friday", "الجمعة");
            text = text.replace("Saturday", "السبت");

            // Labels
            text = text.replace("Midnight", "منتصف الليل");
            text = text.replace("Last Third", "الثلث الأخير");
            text = text.replace("Adhan", "الأذان");
            text = text.replace("Prayer", "الصلاة");
            text = text.replace("in", "بعد");

            // Cities
            text = text.replace("Dhahran", "الظهران");
            text = text.replace("Dammam", "الدمام");
            text = text.replace("Riyadh", "الرياض");
            text = text.replace("Jeddah", "جدة");
            text = text.replace("Makkah", "مكة المكرمة");
            text = text.replace("Madinah", "المدينة المنورة");
            text = text.replace("Khobar", "الخبر");

            return text;
        }

        text = text.replaceAll("[\\u064B-\\u065F\\u0670]", "");

        // Prayer Names
        text = text.replace("الفجر", "Fajr");
        text = text.replace("الشروق", "Sunrise");
        text = text.replace("الظهر", "Dhuhr");
        text = text.replace("العصر", "Asr");
        text = text.replace("المغرب", "Maghrib");
        text = text.replace("العشاء", "Isha");

        // Labels
        text = text.replace("بعد", "in");
        text = text.replace("منتصف الليل", "Midnight");
        text = text.replace("الثلث الأخير", "Last Third");
        text = text.replace("الأذان", "Adhan");
        text = text.replace("الصلاة", "Prayer");

        // Days
        text = text.replace("الأحد", "Sunday");
        text = text.replace("الإثنين", "Monday");
        text = text.replace("الاثنين", "Monday");
        text = text.replace("الثلاثاء", "Tuesday");
        text = text.replace("الأربعاء", "Wednesday");
        text = text.replace("الاربعاء", "Wednesday");
        text = text.replace("الخميس", "Thursday");
        text = text.replace("الجمعة", "Friday");
        text = text.replace("الجمعه", "Friday");
        text = text.replace("السبت", "Saturday");

        // Gregorian Months
        text = text.replace("يناير", "January");
        text = text.replace("فبراير", "February");
        text = text.replace("مارس", "March");
        text = text.replace("أبريل", "April");
        text = text.replace("ابريل", "April");
        text = text.replace("مايو", "May");
        text = text.replace("يونيو", "June");
        text = text.replace("يوليو", "July");
        text = text.replace("أغسطس", "August");
        text = text.replace("اغسطس", "August");
        text = text.replace("سبتمبر", "September");
        text = text.replace("أكتوبر", "October");
        text = text.replace("اكتوبر", "October");
        text = text.replace("نوفمبر", "November");
        text = text.replace("ديسمبر", "December");

        // Hijri Months (Short/Clean English Abbreviation as requested)
        text = text.replace("المحرم", "Muharram");
        text = text.replace("محرم", "Muharram");
        text = text.replace("صفر", "Safar");
        text = text.replace("ربيع الأول", "Rabi' 1");
        text = text.replace("ربيع الاول", "Rabi' 1");
        text = text.replace("ربيع الآخر", "Rabi' 2");
        text = text.replace("ربيع الاخر", "Rabi' 2");
        text = text.replace("ربيع الثاني", "Rabi' 2");
        text = text.replace("جمادى الأولى", "Jumada 1");
        text = text.replace("جمادى الاولى", "Jumada 1");
        text = text.replace("جمادى الأول", "Jumada 1");
        text = text.replace("جمادى الاخرة", "Jumada 2");
        text = text.replace("جمادى الآخرة", "Jumada 2");
        text = text.replace("جمادى الاخيرة", "Jumada 2");
        text = text.replace("جمادى الأخيرة", "Jumada 2");
        text = text.replace("جمادى الثاني", "Jumada 2");
        text = text.replace("رجب", "Rajab");
        text = text.replace("شعبان", "Sha'ban");
        text = text.replace("رمضان", "Ramadan");
        text = text.replace("شوال", "Shawwal");
        text = text.replace("ذو القعدة", "Dhul-Qadah");
        text = text.replace("ذو القعده", "Dhul-Qadah");
        text = text.replace("ذو الحجة", "Dhul-Hijjah");
        text = text.replace("ذو الحجه", "Dhul-Hijjah");

        // Also clean up any preexisting long English names
        text = text.replace("Jumada al-Awwal", "Jumada 1");
        text = text.replace("Jumada al-Ula", "Jumada 1");
        text = text.replace("Jumada al-Thani", "Jumada 2");
        text = text.replace("Jumada al-Akhirah", "Jumada 2");
        text = text.replace("Rabi' al-Awwal", "Rabi' 1");
        text = text.replace("Rabi' al-Thani", "Rabi' 2");
        text = text.replace("Dhu al-Qi'dah", "Dhul-Qadah");
        text = text.replace("Dhu al-Qadah", "Dhul-Qadah");
        text = text.replace("Dhu al-Hijjah", "Dhul-Hijjah");

        // Cities
        text = text.replace("الظهران", "Dhahran");
        text = text.replace("الدمام", "Dammam");
        text = text.replace("الرياض", "Riyadh");
        text = text.replace("جدة", "Jeddah");
        text = text.replace("جده", "Jeddah");
        text = text.replace("مكة المكرمة", "Makkah");
        text = text.replace("مكة", "Makkah");
        text = text.replace("مكه", "Makkah");
        text = text.replace("المدينة المنورة", "Madinah");
        text = text.replace("المدينة", "Madinah");
        text = text.replace("المدينه", "Madinah");
        text = text.replace("الخبر", "Khobar");
        text = text.replace("الأحساء", "Al-Ahsa");
        text = text.replace("الاحساء", "Al-Ahsa");
        text = text.replace("الهفوف", "Al-Hofuf");
        text = text.replace("الطائف", "Taif");
        text = text.replace("تبوك", "Tabuk");
        text = text.replace("بريدة", "Buraidah");
        text = text.replace("عنيزة", "Unaizah");
        text = text.replace("حائل", "Hail");
        text = text.replace("أبها", "Abha");
        text = text.replace("ابها", "Abha");
        text = text.replace("خميس مشيط", "Khamis Mushait");
        text = text.replace("جازان", "Jazan");
        text = text.replace("نجران", "Najran");
        text = text.replace("ينبع", "Yanbu");
        text = text.replace("الجبيل", "Jubail");
        text = text.replace("حفر الباطن", "Hafar Al-Batin");

        text = text.replace("،", ", ");
        return text;
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String prayerJson = prefs.getString("widget_prayer_data", null);

        // Language determination strictly from app_language or widget_lock_lang
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

        RemoteViews views = new RemoteViews(context.getPackageName(), isArabic ? R.layout.prayer_widget : R.layout.prayer_widget_ltr);

        // Deep Linking: Click Root -> Open Main App
        Intent homeIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("com.mushaf.ahmedandlayla://home"));
        homeIntent.setClass(context, MainActivity.class);
        homeIntent.putExtra("shortcut_target", "home");
        homeIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent homePending = PendingIntent.getActivity(
                context, 100, homeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, homePending);
        views.setOnClickPendingIntent(R.id.widget_app_icon_small, homePending);
        views.setOnClickPendingIntent(R.id.widget_app_icon_large, homePending);

        // Deep Linking: Click Date Section -> Open Calendar
        Intent calIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("com.mushaf.ahmedandlayla://calendar"));
        calIntent.setClass(context, MainActivity.class);
        calIntent.putExtra("shortcut_target", "calendar");
        calIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent calPending = PendingIntent.getActivity(
                context, 101, calIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_left_section, calPending);

        // Deep Linking: Click Prayers & Countdown -> Open Prayer Times
        Intent prayerIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("com.mushaf.ahmedandlayla://prayer-times"));
        prayerIntent.setClass(context, MainActivity.class);
        prayerIntent.putExtra("shortcut_target", "prayer-times");
        prayerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent prayerPending = PendingIntent.getActivity(
                context, 102, prayerIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_middle_section, prayerPending);
        views.setOnClickPendingIntent(R.id.widget_next_prayer_container, prayerPending);
        views.setOnClickPendingIntent(R.id.widget_bottom_section, prayerPending);

        // Manual Refresh Button Click
        Intent refreshIntent = new Intent(context, PrayerWidgetProvider.class);
        refreshIntent.setAction(ACTION_REFRESH_WIDGET);
        PendingIntent refreshPending = PendingIntent.getBroadcast(
                context, 103, refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_btn_refresh, refreshPending);

        if (prayerJson != null && !prayerJson.trim().isEmpty()) {
            // Widget size handling
            Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
            int minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);
            boolean isLarge = minHeight >= 95;

            if (isLarge) {
                views.setViewVisibility(R.id.widget_gregorian_date, View.VISIBLE);
                views.setViewVisibility(R.id.widget_app_icon_small, View.GONE);
                views.setViewVisibility(R.id.widget_app_icon_large, View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.widget_gregorian_date, View.GONE);
                views.setViewVisibility(R.id.widget_app_icon_small, View.VISIBLE);
                views.setViewVisibility(R.id.widget_app_icon_large, View.GONE);
            }

            try {
                JSONObject data = new JSONObject(prayerJson);
                String city = data.optString("city", "");
                // Note: city text removed from over icon as requested

                JSONObject times = data.optJSONObject("times");
                String nextPrayerId = data.optString("next_prayer_id", "");
                String nextPrayerName = data.optString("next_prayer_name", "");
                long targetTimeMillis = data.optLong("target_time_millis", 0);
                long now = System.currentTimeMillis();

                // Check for autonomous calculation if date changed
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

                    // Update UI with newly computed day times
                    views.setTextViewText(R.id.time_fajr, formatNumerals(autoRes.fajr, isArabic));
                    views.setTextViewText(R.id.time_sunrise, formatNumerals(autoRes.sunrise, isArabic));
                    views.setTextViewText(R.id.time_dhuhr, formatNumerals(autoRes.dhuhr, isArabic));
                    views.setTextViewText(R.id.time_asr, formatNumerals(autoRes.asr, isArabic));
                    views.setTextViewText(R.id.time_maghrib, formatNumerals(autoRes.maghrib, isArabic));
                    views.setTextViewText(R.id.time_isha, formatNumerals(autoRes.isha, isArabic));

                    views.setTextViewText(R.id.widget_hijri_date, formatNumerals(autoRes.dayName + "، " + autoRes.hijriDate, isArabic));
                    views.setTextViewText(R.id.widget_gregorian_date, formatNumerals(autoRes.gregorianDate, isArabic));

                    String midLabel = isArabic ? ("منتصف الليل : " + autoRes.midnight) : ("Midnight : " + autoRes.midnight);
                    String lastThirdLabel = isArabic ? ("الثلث الأخير : " + autoRes.lastThird) : ("Last Third : " + autoRes.lastThird);
                    views.setTextViewText(R.id.widget_midnight, formatNumerals(midLabel, isArabic));
                    views.setTextViewText(R.id.widget_last_third, formatNumerals(lastThirdLabel, isArabic));

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

                } else {
                    // Standard flow using cached data
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

                    // Static texts from JSON
                    views.setTextViewText(R.id.widget_hijri_date, formatNumerals(translate(data.optString("day", "") + "، " + data.optString("hijri", ""), isArabic), isArabic));
                    views.setTextViewText(R.id.widget_gregorian_date, formatNumerals(translate(data.optString("gregorian", ""), isArabic), isArabic));
                    views.setTextViewText(R.id.widget_midnight, formatNumerals(translate(data.optString("midnight", ""), isArabic), isArabic));
                    views.setTextViewText(R.id.widget_last_third, formatNumerals(translate(data.optString("last_third", ""), isArabic), isArabic));

                    if (times != null) {
                        views.setTextViewText(R.id.time_fajr, formatNumerals(times.optString("fajr", ""), isArabic));
                        views.setTextViewText(R.id.time_sunrise, formatNumerals(times.optString("sunrise", ""), isArabic));
                        views.setTextViewText(R.id.time_dhuhr, formatNumerals(times.optString("dhuhr", ""), isArabic));
                        views.setTextViewText(R.id.time_asr, formatNumerals(times.optString("asr", ""), isArabic));
                        views.setTextViewText(R.id.time_maghrib, formatNumerals(times.optString("maghrib", ""), isArabic));
                        views.setTextViewText(R.id.time_isha, formatNumerals(times.optString("isha", ""), isArabic));
                    }
                }

                // Prayer Names (Headers)
                views.setTextViewText(R.id.name_fajr, isArabic ? "الفجر" : "Fajr");
                views.setTextViewText(R.id.name_sunrise, isArabic ? "الشروق" : "Sunrise");
                views.setTextViewText(R.id.name_dhuhr, isArabic ? "الظهر" : "Dhuhr");
                views.setTextViewText(R.id.name_asr, isArabic ? "العصر" : "Asr");
                views.setTextViewText(R.id.name_maghrib, isArabic ? "المغرب" : "Maghrib");
                views.setTextViewText(R.id.name_isha, isArabic ? "العشاء" : "Isha");

                String nextLabel = isArabic ? (nextPrayerName + " بعد") : (nextPrayerName + " in");
                views.setTextViewText(R.id.widget_next_prayer_name, nextLabel);

                // Setup countdown Chronometer / TextView
                if (targetTimeMillis > 0) {
                    long remainingMillis = targetTimeMillis - now;
                    if (isArabic) {
                        views.setViewVisibility(R.id.widget_next_prayer_time, View.VISIBLE);
                        views.setViewVisibility(R.id.widget_next_prayer_time_en, View.GONE);
                        if (remainingMillis <= 0) {
                            views.setChronometer(R.id.widget_next_prayer_time, android.os.SystemClock.elapsedRealtime(), "00:00:00", false);
                        } else {
                            long base = android.os.SystemClock.elapsedRealtime() + remainingMillis;
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                                views.setBoolean(R.id.widget_next_prayer_time, "setCountDown", true);
                            }
                            views.setChronometer(R.id.widget_next_prayer_time, base, "%s", true);
                        }
                    } else {
                        views.setViewVisibility(R.id.widget_next_prayer_time, View.GONE);
                        views.setViewVisibility(R.id.widget_next_prayer_time_en, View.VISIBLE);
                        views.setTextViewText(R.id.widget_next_prayer_time_en, formatRemainingTime(remainingMillis));
                    }

                    if (remainingMillis > 0) {
                        // Schedule Alarm for prayer transition
                        Intent updateIntent = new Intent(context, PrayerWidgetProvider.class);
                        updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});

                        PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                                context, appWidgetId, updateIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        );
                        scheduleSafeAlarm(context, targetTimeMillis + 1000, pendingUpdate);

                        // Schedule 1-minute recurring update alarm for smooth display
                        Intent minIntent = new Intent(context, PrayerWidgetProvider.class);
                        minIntent.setAction(ACTION_REFRESH_WIDGET);
                        PendingIntent minPending = PendingIntent.getBroadcast(
                                context, appWidgetId + 9000, minIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        );
                        long nextMinute = (System.currentTimeMillis() / 60000 + 1) * 60000;
                        scheduleSafeAlarm(context, nextMinute, minPending);
                    }
                }

                // Schedule midnight alarm (00:00:01) to advance dates automatically
                Calendar midCal = Calendar.getInstance();
                midCal.add(Calendar.DAY_OF_YEAR, 1);
                midCal.set(Calendar.HOUR_OF_DAY, 0);
                midCal.set(Calendar.MINUTE, 0);
                midCal.set(Calendar.SECOND, 1);
                midCal.set(Calendar.MILLISECOND, 0);

                Intent midnightIntent = new Intent(context, PrayerWidgetProvider.class);
                midnightIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                midnightIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
                PendingIntent midPending = PendingIntent.getBroadcast(
                        context, appWidgetId + 5000, midnightIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                scheduleSafeAlarm(context, midCal.getTimeInMillis(), midPending);

                // Theming & Dark Mode with the 4 Home Page Section Colors
                boolean isDark = false;
                int rootBgColor = Color.WHITE;
                int middleBgColor = Color.WHITE;
                int colorPurple = Color.parseColor("#544670");
                int colorGreen = Color.parseColor("#2E7D5E");
                int colorTeal = Color.parseColor("#3B7A82");
                int colorTerracotta = Color.parseColor("#A26743");

                int section1Bg = Color.parseColor("#544670");
                int section1Text = Color.WHITE;
                int section2Bg = Color.parseColor("#A26743");
                int section2Text = Color.WHITE;
                int nextPrayerColor = Color.parseColor("#2E7D5E");
                int highlightPrayerColor = Color.parseColor("#3B7A82");
                int sepColor = Color.parseColor("#E0E0E0");
                int textColor = Color.parseColor("#0F172A");

                int stripColor1 = colorPurple;
                int stripColor2 = colorGreen;
                int stripColor3 = colorTeal;
                int stripColor4 = colorTerracotta;

                if (data.has("theme") && !data.isNull("theme")) {
                    JSONObject themeObj = data.getJSONObject("theme");
                    isDark = themeObj.optBoolean("isDark", false);

                    if (themeObj.has("rootBg")) {
                        try { rootBgColor = Color.parseColor(themeObj.getString("rootBg")); } catch (Exception ignored) {}
                    } else if (themeObj.has("cardBg")) {
                        try { rootBgColor = Color.parseColor(themeObj.getString("cardBg")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("middleBg")) {
                        try { middleBgColor = Color.parseColor(themeObj.getString("middleBg")); } catch (Exception ignored) {}
                    } else {
                        middleBgColor = rootBgColor;
                    }

                    if (themeObj.has("section1Bg")) {
                        try { section1Bg = Color.parseColor(themeObj.getString("section1Bg")); } catch (Exception ignored) {}
                    } else if (themeObj.has("purpleColor")) {
                        try { section1Bg = Color.parseColor(themeObj.getString("purpleColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("section1Text")) {
                        try { section1Text = Color.parseColor(themeObj.getString("section1Text")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("section2Bg")) {
                        try { section2Bg = Color.parseColor(themeObj.getString("section2Bg")); } catch (Exception ignored) {}
                    } else if (themeObj.has("terracottaColor")) {
                        try { section2Bg = Color.parseColor(themeObj.getString("terracottaColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("section2Text")) {
                        try { section2Text = Color.parseColor(themeObj.getString("section2Text")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("nextPrayerColor")) {
                        try { nextPrayerColor = Color.parseColor(themeObj.getString("nextPrayerColor")); } catch (Exception ignored) {}
                    } else if (themeObj.has("greenColor")) {
                        try { nextPrayerColor = Color.parseColor(themeObj.getString("greenColor")); } catch (Exception ignored) {}
                    }

                    if (themeObj.has("highlightPrayerColor")) {
                        try { highlightPrayerColor = Color.parseColor(themeObj.getString("highlightPrayerColor")); } catch (Exception ignored) {}
                    } else if (themeObj.has("tealColor")) {
                        try { highlightPrayerColor = Color.parseColor(themeObj.getString("tealColor")); } catch (Exception ignored) {}
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

                // Apply section and container background colors unconditionally
                views.setInt(R.id.widget_root, "setBackgroundColor", rootBgColor);
                views.setInt(R.id.widget_top_right_section, "setBackgroundColor", rootBgColor);
                views.setInt(R.id.widget_middle_section, "setBackgroundColor", middleBgColor);
                views.setInt(R.id.widget_left_section, "setBackgroundColor", section1Bg);
                views.setInt(R.id.widget_bottom_section, "setBackgroundColor", section2Bg);

                // Apply separators
                views.setInt(R.id.sep_1, "setBackgroundColor", sepColor);
                views.setInt(R.id.sep_2, "setBackgroundColor", sepColor);
                views.setInt(R.id.sep_3, "setBackgroundColor", sepColor);
                views.setInt(R.id.sep_4, "setBackgroundColor", sepColor);
                views.setInt(R.id.sep_5, "setBackgroundColor", sepColor);

                // Apply section text colors
                views.setTextColor(R.id.widget_hijri_date, section1Text);
                views.setTextColor(R.id.widget_gregorian_date, section1Text);
                views.setTextColor(R.id.widget_midnight, section2Text);
                views.setTextColor(R.id.widget_last_third, section2Text);

                // Bind the 4-color accent strip divider
                views.setInt(R.id.full_strip_purple, "setBackgroundColor", stripColor1);
                views.setInt(R.id.full_strip_green, "setBackgroundColor", stripColor2);
                views.setInt(R.id.full_strip_teal, "setBackgroundColor", stripColor3);
                views.setInt(R.id.full_strip_terracotta, "setBackgroundColor", stripColor4);

                // Top-right countdown and next prayer label
                views.setTextColor(R.id.widget_next_prayer_name, nextPrayerColor);
                views.setTextColor(R.id.widget_next_prayer_time, textColor);
                views.setTextColor(R.id.widget_next_prayer_time_en, textColor);

                // Default prayer text colors in the row
                views.setTextColor(R.id.name_fajr, textColor);
                views.setTextColor(R.id.time_fajr, textColor);
                views.setTextColor(R.id.name_sunrise, textColor);
                views.setTextColor(R.id.time_sunrise, textColor);
                views.setTextColor(R.id.name_dhuhr, textColor);
                views.setTextColor(R.id.time_dhuhr, textColor);
                views.setTextColor(R.id.name_asr, textColor);
                views.setTextColor(R.id.time_asr, textColor);
                views.setTextColor(R.id.name_maghrib, textColor);
                views.setTextColor(R.id.time_maghrib, textColor);
                views.setTextColor(R.id.name_isha, textColor);
                views.setTextColor(R.id.time_isha, textColor);

                // Highlight active upcoming prayer
                if ("fajr".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.name_fajr, highlightPrayerColor);
                    views.setTextColor(R.id.time_fajr, highlightPrayerColor);
                } else if ("sunrise".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.name_sunrise, highlightPrayerColor);
                    views.setTextColor(R.id.time_sunrise, highlightPrayerColor);
                } else if ("dhuhr".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.name_dhuhr, highlightPrayerColor);
                    views.setTextColor(R.id.time_dhuhr, highlightPrayerColor);
                } else if ("asr".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.name_asr, highlightPrayerColor);
                    views.setTextColor(R.id.time_asr, highlightPrayerColor);
                } else if ("maghrib".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.name_maghrib, highlightPrayerColor);
                    views.setTextColor(R.id.time_maghrib, highlightPrayerColor);
                } else if ("isha".equalsIgnoreCase(nextPrayerId)) {
                    views.setTextColor(R.id.name_isha, highlightPrayerColor);
                    views.setTextColor(R.id.time_isha, highlightPrayerColor);
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