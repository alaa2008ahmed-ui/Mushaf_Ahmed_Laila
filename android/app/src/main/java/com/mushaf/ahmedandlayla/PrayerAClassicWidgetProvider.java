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

public class PrayerAClassicWidgetProvider extends AppWidgetProvider {

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
            try {
                PersistentPrayerNotification.update(context);
            } catch (Exception ignored) {}
        }
    }

    public static void updateAllWidgets(Context context) {
        if (context == null) return;
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);

            // 1. Classic Widget Provider
            ComponentName compClassic = new ComponentName(context, PrayerAClassicWidgetProvider.class);
            int[] idsClassic = appWidgetManager.getAppWidgetIds(compClassic);
            if (idsClassic != null && idsClassic.length > 0) {
                for (int id : idsClassic) {
                    updateAppWidget(context, appWidgetManager, id);
                }
            }

            // 2. Compact Previous & Next Widget Provider
            ComponentName compCompact = new ComponentName(context, PrayerCompactWidgetProvider.class);
            int[] idsCompact = appWidgetManager.getAppWidgetIds(compCompact);
            if (idsCompact != null && idsCompact.length > 0) {
                for (int id : idsCompact) {
                    PrayerCompactWidgetProvider.updateAppWidget(context, appWidgetManager, id);
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
            text = text.replace("First Third", "أول الليل");
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
        text = text.replace("أول الليل", "First Third");
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
        // Each widget provider maintains its own true design and independent settings

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

        // Widget size handling: In the smallest vertical widget size (1-2 rows / < 150dp),
        // the Gregorian date is hidden (View.GONE) for both English and Arabic so the Hijri
        // date remains cleanly centered vertically without overlapping the accent divider strip.
        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int minHeight = (options != null) ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0) : 0;
        int minWidth = (options != null) ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 250) : 250;
        boolean isSmall = minHeight > 0 && minHeight < 105;
        boolean isLarge = minHeight >= 150;

        int layoutId;
        if (isSmall) {
            layoutId = isArabic ? R.layout.prayer_widget_small : R.layout.prayer_widget_small_ltr;
        } else {
            layoutId = isArabic ? R.layout.prayer_widget : R.layout.prayer_widget_ltr;
        }
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);

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
        Intent refreshIntent = new Intent(context, PrayerAClassicWidgetProvider.class);
        refreshIntent.setAction(ACTION_REFRESH_WIDGET);
        PendingIntent refreshPending = PendingIntent.getBroadcast(
                context, 103, refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_btn_refresh, refreshPending);

        if (isLarge) {
            views.setViewVisibility(R.id.widget_gregorian_date, View.VISIBLE);
            views.setViewVisibility(R.id.widget_hijri_date, View.VISIBLE);
            views.setViewVisibility(R.id.widget_app_icon_small, View.GONE);
            views.setViewVisibility(R.id.widget_app_icon_large, View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.widget_gregorian_date, View.GONE);
            views.setViewVisibility(R.id.widget_hijri_date, View.VISIBLE);
            views.setViewVisibility(R.id.widget_app_icon_small, View.VISIBLE);
            views.setViewVisibility(R.id.widget_app_icon_large, View.GONE);
        }

        // Dynamic Font Scaling on Widget Resize: Standard reference matching compact widget height (85dp)
        float wRatio = (minWidth > 0) ? (minWidth / 220f) : 1.0f;
        float hRatio = (minHeight > 0) ? (minHeight / 85f) : 1.0f;

        float fontScale;
        if (isLarge) {
            // Large/tall widget mode: scale based on available dimension growth
            float sizeFactor = Math.min(Math.max(1.0f, wRatio), Math.max(1.0f, hRatio));
            fontScale = Math.max(1.0f, Math.min(1.20f, sizeFactor));
        } else {
            fontScale = Math.min(wRatio, hRatio);
            fontScale = Math.max(0.70f, Math.min(1.0f, fontScale));
        }

        boolean isVerticallyCompressed = !isLarge && (minHeight > 0 && minHeight < 60);

        views.setTextViewTextSize(R.id.widget_hijri_date, TypedValue.COMPLEX_UNIT_SP, Math.round(10.5f * fontScale));
        views.setTextViewTextSize(R.id.widget_gregorian_date, TypedValue.COMPLEX_UNIT_SP, Math.round(9.5f * fontScale));
        views.setTextViewTextSize(R.id.widget_next_prayer_name, TypedValue.COMPLEX_UNIT_SP, Math.round(11.5f * fontScale));
        views.setTextViewTextSize(R.id.widget_next_prayer_time, TypedValue.COMPLEX_UNIT_SP, Math.round(13.5f * fontScale));
        views.setTextViewTextSize(R.id.widget_next_prayer_time_en, TypedValue.COMPLEX_UNIT_SP, Math.round(13.5f * fontScale));

        int prayerNameSize = Math.round(10.5f * fontScale);
        int prayerTimeSize = Math.round(12.5f * fontScale);
        views.setTextViewTextSize(R.id.name_fajr, TypedValue.COMPLEX_UNIT_SP, prayerNameSize);
        views.setTextViewTextSize(R.id.time_fajr, TypedValue.COMPLEX_UNIT_SP, prayerTimeSize);
        views.setTextViewTextSize(R.id.name_sunrise, TypedValue.COMPLEX_UNIT_SP, prayerNameSize);
        views.setTextViewTextSize(R.id.time_sunrise, TypedValue.COMPLEX_UNIT_SP, prayerTimeSize);
        views.setTextViewTextSize(R.id.name_dhuhr, TypedValue.COMPLEX_UNIT_SP, prayerNameSize);
        views.setTextViewTextSize(R.id.time_dhuhr, TypedValue.COMPLEX_UNIT_SP, prayerTimeSize);
        views.setTextViewTextSize(R.id.name_asr, TypedValue.COMPLEX_UNIT_SP, prayerNameSize);
        views.setTextViewTextSize(R.id.time_asr, TypedValue.COMPLEX_UNIT_SP, prayerTimeSize);
        views.setTextViewTextSize(R.id.name_maghrib, TypedValue.COMPLEX_UNIT_SP, prayerNameSize);
        views.setTextViewTextSize(R.id.time_maghrib, TypedValue.COMPLEX_UNIT_SP, prayerTimeSize);
        views.setTextViewTextSize(R.id.name_isha, TypedValue.COMPLEX_UNIT_SP, prayerNameSize);
        views.setTextViewTextSize(R.id.time_isha, TypedValue.COMPLEX_UNIT_SP, prayerTimeSize);

        int nightSize = Math.round(9.5f * fontScale);
        views.setTextViewTextSize(R.id.widget_first_third, TypedValue.COMPLEX_UNIT_SP, nightSize);
        views.setTextViewTextSize(R.id.widget_midnight, TypedValue.COMPLEX_UNIT_SP, nightSize);
        views.setTextViewTextSize(R.id.widget_last_third, TypedValue.COMPLEX_UNIT_SP, nightSize);


        if (prayerJson != null && !prayerJson.trim().isEmpty()) {

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

                    String autoDay = autoRes.dayName;
                    if (isVerticallyCompressed && !isArabic) {
                        autoDay = autoDay.replace("Monday", "Mon").replace("Tuesday", "Tue").replace("Wednesday", "Wed")
                                         .replace("Thursday", "Thu").replace("Friday", "Fri").replace("Saturday", "Sat").replace("Sunday", "Sun");
                    }
                    views.setTextViewText(R.id.widget_hijri_date, formatNumerals(autoDay + "، " + autoRes.hijriDate, isArabic));
                    views.setTextViewText(R.id.widget_gregorian_date, formatNumerals(autoRes.gregorianDate, isArabic));

                    String firstThirdLabel = isArabic ? ("أول الليل : " + autoRes.firstThird) : ("First Third : " + autoRes.firstThird);
                    String midLabel = isArabic ? ("منتصف الليل : " + autoRes.midnight) : ("Midnight : " + autoRes.midnight);
                    String lastThirdLabel = isArabic ? ("الثلث الأخير : " + autoRes.lastThird) : ("Last Third : " + autoRes.lastThird);
                    views.setTextViewText(R.id.widget_first_third, formatNumerals(firstThirdLabel, isArabic));
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
                    String dayStr = data.optString("day", "");
                    String hijriStr = data.optString("hijri", "");
                    if (isVerticallyCompressed && !isArabic) {
                        dayStr = dayStr.replace("Monday", "Mon").replace("Tuesday", "Tue").replace("Wednesday", "Wed")
                                       .replace("Thursday", "Thu").replace("Friday", "Fri").replace("Saturday", "Sat").replace("Sunday", "Sun");
                    }
                    views.setTextViewText(R.id.widget_hijri_date, formatNumerals(translate(dayStr + "، " + hijriStr, isArabic), isArabic));
                    views.setTextViewText(R.id.widget_gregorian_date, formatNumerals(translate(data.optString("gregorian", ""), isArabic), isArabic));
                    views.setTextViewText(R.id.widget_first_third, formatNumerals(translate(data.optString("first_third", ""), isArabic), isArabic));
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
                boolean isCompactHeaders = isVerticallyCompressed || fontScale < 0.95f;
                String nameSunrise = isArabic ? "الشروق" : (isCompactHeaders ? "Sun" : "Sunrise");
                String nameMaghrib = isArabic ? "المغرب" : (isCompactHeaders ? "Magh" : "Maghrib");
                views.setTextViewText(R.id.name_fajr, isArabic ? "الفجر" : "Fajr");
                views.setTextViewText(R.id.name_sunrise, nameSunrise);
                views.setTextViewText(R.id.name_dhuhr, isArabic ? "الظهر" : "Dhuhr");
                views.setTextViewText(R.id.name_asr, isArabic ? "العصر" : "Asr");
                views.setTextViewText(R.id.name_maghrib, nameMaghrib);
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
                        Intent updateIntent = new Intent(context, PrayerAClassicWidgetProvider.class);
                        updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});

                        PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                                context, appWidgetId, updateIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        );
                        scheduleSafeAlarm(context, targetTimeMillis + 1000, pendingUpdate);

                        // Schedule 1-minute recurring update alarm for smooth display
                        Intent minIntent = new Intent(context, PrayerAClassicWidgetProvider.class);
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

                Intent midnightIntent = new Intent(context, PrayerAClassicWidgetProvider.class);
                midnightIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                midnightIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
                PendingIntent midPending = PendingIntent.getBroadcast(
                        context, appWidgetId + 5000, midnightIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                scheduleSafeAlarm(context, midCal.getTimeInMillis(), midPending);

                // Theming & Color Palette for Smart Modern Home Design (التصميم الذكي الحديث)
                boolean isDark = true;
                if (data.has("theme") && !data.isNull("theme")) {
                    JSONObject themeObj = data.getJSONObject("theme");
                    isDark = themeObj.optBoolean("isDark", true);
                }

                // Smart Modern Home Layout Color Defaults (Night & Day Modes)
                int rootBgColor = isDark ? Color.parseColor("#18181B") : Color.parseColor("#F8FAFC");
                int middleBgColor = isDark ? Color.parseColor("#18181B") : Color.parseColor("#FFFFFF");
                int section1Bg = isDark ? Color.parseColor("#064E3B") : Color.parseColor("#E6F4EA");
                int section1Text = isDark ? Color.parseColor("#34D399") : Color.parseColor("#059669");
                int section2Bg = isDark ? Color.parseColor("#261C12") : Color.parseColor("#FEF3C7");
                int section2Text = isDark ? Color.parseColor("#FDE68A") : Color.parseColor("#B45309");
                int nextPrayerColor = isDark ? Color.parseColor("#34D399") : Color.parseColor("#059669");
                int highlightPrayerColor = isDark ? Color.parseColor("#F59E0B") : Color.parseColor("#059669");
                int sepColor = isDark ? Color.parseColor("#27272A") : Color.parseColor("#E2E8F0");
                int textColor = isDark ? Color.parseColor("#FFFFFF") : Color.parseColor("#1E293B");

                int stripColor1 = isDark ? Color.parseColor("#34D399") : Color.parseColor("#059669");
                int stripColor2 = isDark ? Color.parseColor("#F59E0B") : Color.parseColor("#D97706");
                int stripColor3 = isDark ? Color.parseColor("#10B981") : Color.parseColor("#10B981");
                int stripColor4 = isDark ? Color.parseColor("#D97706") : Color.parseColor("#B45309");

                if (data.has("theme") && !data.isNull("theme")) {
                    JSONObject themeObj = data.getJSONObject("theme");

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
                        sepColor = Color.parseColor("#3D3020");
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

                // Apply transparency and custom theme configuration from SharedPreferences strictly per appWidgetId
                int transparency = prefs.getInt("widget_transparency_" + appWidgetId, -1);
                if (transparency == -1) {
                    transparency = prefs.getInt("widget_classic_transparency",
                            prefs.getInt("widget_transparency", 100));
                }
                float alphaFactor = Math.max(0.0f, Math.min(1.0f, transparency / 100.0f));
                int alphaVal = Math.round(alphaFactor * 255);

                String overrideTheme = prefs.getString("widget_theme_" + appWidgetId, null);
                if (overrideTheme == null || overrideTheme.trim().isEmpty()) {
                    overrideTheme = prefs.getString("widget_classic_theme",
                            prefs.getString("widget_theme", "royal_gold_3d"));
                }

                if ("royal_gold_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#2D1600");
                    middleBgColor = Color.parseColor("#1C0D00");
                    section1Bg = Color.parseColor("#5E2E00");
                    section1Text = Color.parseColor("#FDE68A");
                    nextPrayerColor = Color.parseColor("#FBBF24");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#F59E0B");
                    sepColor = Color.parseColor("#78350F");
                    stripColor1 = Color.parseColor("#F59E0B");
                    stripColor2 = Color.parseColor("#D97706");
                    stripColor3 = Color.parseColor("#FBBF24");
                    stripColor4 = Color.parseColor("#B45309");
                    section2Bg = Color.parseColor("#451A03");
                    section2Text = Color.parseColor("#FEF08A");
                } else if ("emerald_prism_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#022C22");
                    middleBgColor = Color.parseColor("#011712");
                    section1Bg = Color.parseColor("#064E3B");
                    section1Text = Color.parseColor("#6EE7B7");
                    nextPrayerColor = Color.parseColor("#34D399");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#34D399");
                    sepColor = Color.parseColor("#065F46");
                    stripColor1 = Color.parseColor("#10B981");
                    stripColor2 = Color.parseColor("#059669");
                    stripColor3 = Color.parseColor("#34D399");
                    stripColor4 = Color.parseColor("#047857");
                    section2Bg = Color.parseColor("#064E3B");
                    section2Text = Color.parseColor("#A7F3D0");
                } else if ("ruby_gem_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#4C0519");
                    middleBgColor = Color.parseColor("#2B000C");
                    section1Bg = Color.parseColor("#881337");
                    section1Text = Color.parseColor("#FECDD3");
                    nextPrayerColor = Color.parseColor("#FB7185");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#FB7185");
                    sepColor = Color.parseColor("#9F1239");
                    stripColor1 = Color.parseColor("#F43F5E");
                    stripColor2 = Color.parseColor("#E11D48");
                    stripColor3 = Color.parseColor("#FDA4AF");
                    stripColor4 = Color.parseColor("#BE123C");
                    section2Bg = Color.parseColor("#70092B");
                    section2Text = Color.parseColor("#FFE4E6");
                } else if ("antique_bronze_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#261A12");
                    middleBgColor = Color.parseColor("#180F0A");
                    section1Bg = Color.parseColor("#4D3321");
                    section1Text = Color.parseColor("#E5C39E");
                    nextPrayerColor = Color.parseColor("#D4AF37");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#F5D77F");
                    sepColor = Color.parseColor("#5C3D26");
                    stripColor1 = Color.parseColor("#D4AF37");
                    stripColor2 = Color.parseColor("#8C531B");
                    stripColor3 = Color.parseColor("#B8860B");
                    stripColor4 = Color.parseColor("#6E3F15");
                    section2Bg = Color.parseColor("#3D2718");
                    section2Text = Color.parseColor("#F5D77F");
                } else if ("royal_marble_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#F8FAFC");
                    middleBgColor = Color.parseColor("#FFFFFF");
                    section1Bg = Color.parseColor("#FEF3C7");
                    section1Text = Color.parseColor("#78350F");
                    nextPrayerColor = Color.parseColor("#B45309");
                    textColor = Color.parseColor("#0F172A");
                    highlightPrayerColor = Color.parseColor("#B45309");
                    sepColor = Color.parseColor("#E2E8F0");
                    stripColor1 = Color.parseColor("#D97706");
                    stripColor2 = Color.parseColor("#F59E0B");
                    stripColor3 = Color.parseColor("#B45309");
                    stripColor4 = Color.parseColor("#D4AF37");
                    section2Bg = Color.parseColor("#FEF3C7");
                    section2Text = Color.parseColor("#78350F");
                } else if ("titanium_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#181E24");
                    middleBgColor = Color.parseColor("#181E24");
                    section1Bg = Color.parseColor("#242F3D");
                    section1Text = Color.parseColor("#38BDF8");
                    nextPrayerColor = Color.parseColor("#38BDF8");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#FBBF24");
                    sepColor = Color.parseColor("#2C3847");
                    stripColor1 = Color.parseColor("#38BDF8");
                    stripColor2 = Color.parseColor("#FBBF24");
                    stripColor3 = Color.parseColor("#94A3B8");
                    stripColor4 = Color.parseColor("#CBD5E1");
                    section2Bg = Color.parseColor("#222B35");
                    section2Text = Color.parseColor("#F8FAFC");
                } else if ("emerald_3d".equalsIgnoreCase(overrideTheme) || "emerald_night".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#022C22");
                    middleBgColor = Color.parseColor("#022C22");
                    section1Bg = Color.parseColor("#064E3B");
                    section1Text = Color.parseColor("#6EE7B7");
                    nextPrayerColor = Color.parseColor("#34D399");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#FBBF24");
                    sepColor = Color.parseColor("#065F46");
                    stripColor1 = Color.parseColor("#34D399");
                    stripColor2 = Color.parseColor("#FBBF24");
                    stripColor3 = Color.parseColor("#6EE7B7");
                    stripColor4 = Color.parseColor("#FDE68A");
                    section2Bg = Color.parseColor("#064E3B");
                    section2Text = Color.parseColor("#FDE68A");
                } else if ("sapphire_3d".equalsIgnoreCase(overrideTheme) || "navy".equalsIgnoreCase(overrideTheme) || "royal_navy".equalsIgnoreCase(overrideTheme) || "dark".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#091528");
                    middleBgColor = Color.parseColor("#091528");
                    section1Bg = Color.parseColor("#1E3A8A");
                    section1Text = Color.parseColor("#38BDF8");
                    nextPrayerColor = Color.parseColor("#38BDF8");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#60A5FA");
                    sepColor = Color.parseColor("#1E293B");
                    stripColor1 = Color.parseColor("#38BDF8");
                    stripColor2 = Color.parseColor("#60A5FA");
                    stripColor3 = Color.parseColor("#93C5FD");
                    stripColor4 = Color.parseColor("#38BDF8");
                    section2Bg = Color.parseColor("#0F274A");
                    section2Text = Color.parseColor("#93C5FD");
                } else if ("gold_ingot_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#140E03");
                    middleBgColor = Color.parseColor("#140E03");
                    section1Bg = Color.parseColor("#2D1F05");
                    section1Text = Color.parseColor("#FDE68A");
                    nextPrayerColor = Color.parseColor("#FBBF24");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#FDE047");
                    sepColor = Color.parseColor("#3D2A07");
                    stripColor1 = Color.parseColor("#FBBF24");
                    stripColor2 = Color.parseColor("#FDE047");
                    stripColor3 = Color.parseColor("#D97706");
                    stripColor4 = Color.parseColor("#FBBF24");
                    section2Bg = Color.parseColor("#231804");
                    section2Text = Color.parseColor("#FDE047");
                } else if ("ruby_velvet_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#33050E");
                    middleBgColor = Color.parseColor("#33050E");
                    section1Bg = Color.parseColor("#5C0A1B");
                    section1Text = Color.parseColor("#FECDD3");
                    nextPrayerColor = Color.parseColor("#FB7185");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#F43F5E");
                    sepColor = Color.parseColor("#700D22");
                    stripColor1 = Color.parseColor("#FB7185");
                    stripColor2 = Color.parseColor("#F43F5E");
                    stripColor3 = Color.parseColor("#FECDD3");
                    stripColor4 = Color.parseColor("#FB7185");
                    section2Bg = Color.parseColor("#4C0816");
                    section2Text = Color.parseColor("#FECDD3");
                } else if ("cyber_neon_3d".equalsIgnoreCase(overrideTheme) || "neon_cyber".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#04070A");
                    middleBgColor = Color.parseColor("#04070A");
                    section1Bg = Color.parseColor("#0B1C2A");
                    section1Text = Color.parseColor("#22D3EE");
                    nextPrayerColor = Color.parseColor("#22D3EE");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#4ADE80");
                    sepColor = Color.parseColor("#0E1E2C");
                    stripColor1 = Color.parseColor("#22D3EE");
                    stripColor2 = Color.parseColor("#4ADE80");
                    stripColor3 = Color.parseColor("#38BDF8");
                    stripColor4 = Color.parseColor("#22D3EE");
                    section2Bg = Color.parseColor("#0A121A");
                    section2Text = Color.parseColor("#4ADE80");
                } else if ("violet_amethyst_3d".equalsIgnoreCase(overrideTheme) || "royal_purple".equalsIgnoreCase(overrideTheme) || "amethyst_purple".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#200538");
                    middleBgColor = Color.parseColor("#200538");
                    section1Bg = Color.parseColor("#430D75");
                    section1Text = Color.parseColor("#E9D5FF");
                    nextPrayerColor = Color.parseColor("#C084FC");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#FDE68A");
                    sepColor = Color.parseColor("#51118A");
                    stripColor1 = Color.parseColor("#C084FC");
                    stripColor2 = Color.parseColor("#FDE68A");
                    stripColor3 = Color.parseColor("#E9D5FF");
                    stripColor4 = Color.parseColor("#C084FC");
                    section2Bg = Color.parseColor("#350A5C");
                    section2Text = Color.parseColor("#FDE68A");
                } else if ("copper_bronze_3d".equalsIgnoreCase(overrideTheme) || "bronze_copper".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#260F04");
                    middleBgColor = Color.parseColor("#260F04");
                    section1Bg = Color.parseColor("#4A1D08");
                    section1Text = Color.parseColor("#FED7AA");
                    nextPrayerColor = Color.parseColor("#FB923C");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#FED7AA");
                    sepColor = Color.parseColor("#5C250A");
                    stripColor1 = Color.parseColor("#FB923C");
                    stripColor2 = Color.parseColor("#FED7AA");
                    stripColor3 = Color.parseColor("#FDBA74");
                    stripColor4 = Color.parseColor("#FB923C");
                    section2Bg = Color.parseColor("#3D1806");
                    section2Text = Color.parseColor("#FED7AA");
                } else if ("azure_crystal_3d".equalsIgnoreCase(overrideTheme) || "sky".equalsIgnoreCase(overrideTheme) || "fajr_light".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#052233");
                    middleBgColor = Color.parseColor("#052233");
                    section1Bg = Color.parseColor("#0A4366");
                    section1Text = Color.parseColor("#A5F3FC");
                    nextPrayerColor = Color.parseColor("#22D3EE");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#67E8F9");
                    sepColor = Color.parseColor("#0C4E75");
                    stripColor1 = Color.parseColor("#22D3EE");
                    stripColor2 = Color.parseColor("#67E8F9");
                    stripColor3 = Color.parseColor("#A5F3FC");
                    stripColor4 = Color.parseColor("#22D3EE");
                    section2Bg = Color.parseColor("#083754");
                    section2Text = Color.parseColor("#A5F3FC");
                } else if ("desert_amber_3d".equalsIgnoreCase(overrideTheme) || "sunset_amber".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#331606");
                    middleBgColor = Color.parseColor("#331606");
                    section1Bg = Color.parseColor("#612A0B");
                    section1Text = Color.parseColor("#FEF08A");
                    nextPrayerColor = Color.parseColor("#F59E0B");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#FEF08A");
                    sepColor = Color.parseColor("#78350F");
                    stripColor1 = Color.parseColor("#F59E0B");
                    stripColor2 = Color.parseColor("#FEF08A");
                    stripColor3 = Color.parseColor("#FBBF24");
                    stripColor4 = Color.parseColor("#F59E0B");
                    section2Bg = Color.parseColor("#522309");
                    section2Text = Color.parseColor("#FEF08A");
                } else if ("mint_frost_3d".equalsIgnoreCase(overrideTheme) || "mint_fresh".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#03211B");
                    middleBgColor = Color.parseColor("#03211B");
                    section1Bg = Color.parseColor("#064539");
                    section1Text = Color.parseColor("#99F6E4");
                    nextPrayerColor = Color.parseColor("#2DD4BF");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#5EEAD4");
                    sepColor = Color.parseColor("#075243");
                    stripColor1 = Color.parseColor("#2DD4BF");
                    stripColor2 = Color.parseColor("#5EEAD4");
                    stripColor3 = Color.parseColor("#99F6E4");
                    stripColor4 = Color.parseColor("#2DD4BF");
                    section2Bg = Color.parseColor("#05382E");
                    section2Text = Color.parseColor("#99F6E4");
                } else if ("black".equalsIgnoreCase(overrideTheme) || "deep_black".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#000000");
                    middleBgColor = Color.parseColor("#000000");
                    section1Bg = Color.parseColor("#121212");
                    section1Text = Color.parseColor("#F59E0B");
                    nextPrayerColor = Color.parseColor("#FBBF24");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#FBBF24");
                    sepColor = Color.parseColor("#27272A");
                    stripColor1 = Color.parseColor("#F59E0B");
                    stripColor2 = Color.parseColor("#D97706");
                    stripColor3 = Color.parseColor("#B45309");
                    stripColor4 = Color.parseColor("#FDE047");
                    section2Bg = Color.parseColor("#18181B");
                    section2Text = Color.parseColor("#FDE68A");
                } else if ("clean_paper".equalsIgnoreCase(overrideTheme) || "pearl_white_3d".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#F1F5F9");
                    middleBgColor = Color.parseColor("#FFFFFF");
                    section1Bg = Color.parseColor("#E2E8F0");
                    section1Text = Color.parseColor("#0F172A");
                    nextPrayerColor = Color.parseColor("#0284C7");
                    textColor = Color.parseColor("#0F172A");
                    highlightPrayerColor = Color.parseColor("#D97706");
                    sepColor = Color.parseColor("#CBD5E1");
                    stripColor1 = Color.parseColor("#0284C7");
                    stripColor2 = Color.parseColor("#D97706");
                    stripColor3 = Color.parseColor("#10B981");
                    stripColor4 = Color.parseColor("#B45309");
                    section2Bg = Color.parseColor("#F8FAFC");
                    section2Text = Color.parseColor("#78350F");
                } else if ("shiny_gold".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#FEF08A");
                    middleBgColor = Color.parseColor("#FFFBEB");
                    section1Bg = Color.parseColor("#FDE047");
                    section1Text = Color.parseColor("#78350F");
                    nextPrayerColor = Color.parseColor("#B45309");
                    textColor = Color.parseColor("#78350F");
                    highlightPrayerColor = Color.parseColor("#D97706");
                    sepColor = Color.parseColor("#FDE68A");
                    stripColor1 = Color.parseColor("#B45309");
                    stripColor2 = Color.parseColor("#D97706");
                    stripColor3 = Color.parseColor("#F59E0B");
                    stripColor4 = Color.parseColor("#78350F");
                    section2Bg = Color.parseColor("#FEF3C7");
                } else if ("golden_trio".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#F8DE8A");
                    middleBgColor = Color.parseColor("#FFFFFF");
                    section1Bg = Color.parseColor("#C86400");
                    section1Text = Color.parseColor("#FFFFFF");
                    nextPrayerColor = Color.parseColor("#FFFFFF");
                    textColor = Color.parseColor("#000000");
                    highlightPrayerColor = Color.parseColor("#C86400");
                    sepColor = Color.parseColor("#E5D07B");
                    stripColor1 = Color.parseColor("#C86400");
                    stripColor2 = Color.parseColor("#F8DE8A");
                    stripColor3 = Color.parseColor("#78350F");
                    stripColor4 = Color.parseColor("#B45309");
                    section2Bg = Color.parseColor("#F8DE8A");
                    section2Text = Color.parseColor("#000000");
                } else if ("violet_green_light".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#F5F3FF");
                    middleBgColor = Color.parseColor("#FFFFFF");
                    section1Bg = Color.parseColor("#D1FAE5");
                    section1Text = Color.parseColor("#065F46");
                    nextPrayerColor = Color.parseColor("#5B21B6");
                    textColor = Color.parseColor("#0F172A");
                    highlightPrayerColor = Color.parseColor("#059669");
                    sepColor = Color.parseColor("#E2E8F0");
                    stripColor1 = Color.parseColor("#7C3AED");
                    stripColor2 = Color.parseColor("#10B981");
                    stripColor3 = Color.parseColor("#6D28D9");
                    stripColor4 = Color.parseColor("#047857");
                    section2Bg = Color.parseColor("#EDE9FE");
                    section2Text = Color.parseColor("#0F172A");
                } else if ("sky_blue_light".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#F0F9FF");
                    middleBgColor = Color.parseColor("#FFFFFF");
                    section1Bg = Color.parseColor("#E0F2FE");
                    section1Text = Color.parseColor("#0369A1");
                    nextPrayerColor = Color.parseColor("#0284C7");
                    textColor = Color.parseColor("#0F172A");
                    highlightPrayerColor = Color.parseColor("#0284C7");
                    sepColor = Color.parseColor("#BAE6FD");
                    stripColor1 = Color.parseColor("#0284C7");
                    stripColor2 = Color.parseColor("#38BDF8");
                    stripColor3 = Color.parseColor("#0369A1");
                    stripColor4 = Color.parseColor("#7DD3FC");
                    section2Bg = Color.parseColor("#E0F2FE");
                    section2Text = Color.parseColor("#0F172A");
                } else if ("rose_peach_light".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#FFF1F2");
                    middleBgColor = Color.parseColor("#FFFFFF");
                    section1Bg = Color.parseColor("#FFEDD5");
                    section1Text = Color.parseColor("#C2410C");
                    nextPrayerColor = Color.parseColor("#E11D48");
                    textColor = Color.parseColor("#0F172A");
                    highlightPrayerColor = Color.parseColor("#E11D48");
                    sepColor = Color.parseColor("#FECDD3");
                    stripColor1 = Color.parseColor("#F43F5E");
                    stripColor2 = Color.parseColor("#FB923C");
                    stripColor3 = Color.parseColor("#BE123C");
                    stripColor4 = Color.parseColor("#EA580C");
                    section2Bg = Color.parseColor("#FFE4E6");
                    section2Text = Color.parseColor("#0F172A");
                } else if ("emerald_mint_light".equalsIgnoreCase(overrideTheme)) {
                    rootBgColor = Color.parseColor("#ECFDF5");
                    middleBgColor = Color.parseColor("#FFFFFF");
                    section1Bg = Color.parseColor("#D1FAE5");
                    section1Text = Color.parseColor("#065F46");
                    nextPrayerColor = Color.parseColor("#059669");
                    textColor = Color.parseColor("#0F172A");
                    highlightPrayerColor = Color.parseColor("#047857");
                    sepColor = Color.parseColor("#A7F3D0");
                    stripColor1 = Color.parseColor("#059669");
                    stripColor2 = Color.parseColor("#10B981");
                    stripColor3 = Color.parseColor("#047857");
                    stripColor4 = Color.parseColor("#34D399");
                    section2Bg = Color.parseColor("#D1FAE5");
                    section2Text = Color.parseColor("#0F172A");
                } else { // "default" / "emerald": Vibrant Royal Emerald & Gold
                    rootBgColor = Color.parseColor("#0F1714");
                    middleBgColor = Color.parseColor("#0A110E");
                    section1Bg = Color.parseColor("#064E3B");
                    section1Text = Color.parseColor("#6EE7B7");
                    nextPrayerColor = Color.parseColor("#6EE7B7");
                    textColor = Color.parseColor("#FFFFFF");
                    highlightPrayerColor = Color.parseColor("#FBBF24");
                    sepColor = Color.parseColor("#1B2E24");
                    stripColor1 = Color.parseColor("#059669");
                    stripColor2 = Color.parseColor("#F59E0B");
                    stripColor3 = Color.parseColor("#34D399");
                    stripColor4 = Color.parseColor("#D97706");
                    section2Bg = Color.parseColor("#042F24");
                    section2Text = Color.parseColor("#FDE68A");
                }

                rootBgColor = Color.argb(alphaVal, Color.red(rootBgColor), Color.green(rootBgColor), Color.blue(rootBgColor));
                middleBgColor = Color.argb(alphaVal, Color.red(middleBgColor), Color.green(middleBgColor), Color.blue(middleBgColor));
                section1Bg = Color.argb(alphaVal, Color.red(section1Bg), Color.green(section1Bg), Color.blue(section1Bg));
                section2Bg = Color.argb(alphaVal, Color.red(section2Bg), Color.green(section2Bg), Color.blue(section2Bg));

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
                if (views.getLayoutId() != 0) {
                    try { views.setTextColor(R.id.widget_first_third, section2Text); } catch (Exception ignored) {}
                }
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