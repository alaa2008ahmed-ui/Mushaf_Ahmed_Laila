package com.mushaf.ahmedandlayla; // تم التعديل إلى الاسم المعتمد (y)

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;
import android.os.Bundle;
import android.view.View;
import org.json.JSONObject;

// السطر التالي هو المفتاح لحل مشكلة الـ 22 خطأ (ربط الفهرس بالحزمة الصحيحة)
import com.mushaf.ahmedandlayla.R; 

public class PrayerWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    static String formatNumerals(String input) {
        if (input == null) return "";
        
        // Check system language
        java.util.Locale locale = java.util.Locale.getDefault();
        if (!locale.getLanguage().equals("ar")) {
            return input; // Return as is (English/Latin numerals)
        }
        
        char[] arabicChars = {'٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'};
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (Character.isDigit(c)) {
                builder.append(arabicChars[Character.getNumericValue(c)]);
            } else {
                builder.append(c);
            }
        }
        return builder.toString();
    }

    static String translate(String text, boolean isArabic) {
        if (text == null) return "";
        if (isArabic) return text; // JS sends Arabic by default

        // Remove Arabic diacritics (harakat) for easier matching
        text = text.replaceAll("[\\u064B-\\u065F\\u0670]", "");

        // Prayer Names
        text = text.replace("الفجر", "Fajr");
        text = text.replace("الشروق", "Sunrise");
        text = text.replace("الظهر", "Dhuhr");
        text = text.replace("العصر", "Asr");
        text = text.replace("المغرب", "Maghrib");
        text = text.replace("العشاء", "Isha");

        // Labels
        text = text.replace("بعد", "After");
        text = text.replace("منتصف الليل", "Midnight");
        text = text.replace("الثلث الأخير", "Last Third");
        
        // Days
        text = text.replace("الأحد", "Sunday");
        text = text.replace("الإثنين", "Monday");
        text = text.replace("الثلاثاء", "Tuesday");
        text = text.replace("الأربعاء", "Wednesday");
        text = text.replace("الخميس", "Thursday");
        text = text.replace("الجمعة", "Friday");
        text = text.replace("السبت", "Saturday");

        // Months (Gregorian)
        text = text.replace("يناير", "January");
        text = text.replace("فبراير", "February");
        text = text.replace("مارس", "March");
        text = text.replace("أبريل", "April");
        text = text.replace("مايو", "May");
        text = text.replace("يونيو", "June");
        text = text.replace("يوليو", "July");
        text = text.replace("أغسطس", "August");
        text = text.replace("سبتمبر", "September");
        text = text.replace("أكتوبر", "October");
        text = text.replace("نوفمبر", "November");
        text = text.replace("ديسمبر", "December");

        // Months (Hijri)
        text = text.replace("المحرم", "Muharram");
        text = text.replace("صفر", "Safar");
        text = text.replace("ربيع الأول", "Rabi' al-Awwal");
        text = text.replace("ربيع الآخر", "Rabi' al-Thani");
        text = text.replace("ربيع الثاني", "Rabi' al-Thani");
        text = text.replace("جمادى الأولى", "Jumada al-Awwal");
        text = text.replace("جمادى الآخرة", "Jumada al-Thani");
        text = text.replace("جمادى الثانية", "Jumada al-Thani");
        text = text.replace("رجب", "Rajab");
        text = text.replace("شعبان", "Sha'ban");
        text = text.replace("رمضان", "Ramadan");
        text = text.replace("شوال", "Shawwal");
        text = text.replace("ذو القعدة", "Dhu al-Qi'dah");
        text = text.replace("ذو الحجة", "Dhu al-Hijjah");

        // Separators
        text = text.replace("،", ",");

        return text;
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // قراءة البيانات من مخزن Capacitor المشترك
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String prayerJson = prefs.getString("widget_prayer_data", null);

        // Check system language
        boolean isArabic = java.util.Locale.getDefault().getLanguage().equals("ar");

        // ربط الواجهة (الريدجت) مع الحزمة الصحيحة
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget);

        // جعل الريدجت يفتح التطبيق عند الضغط عليه
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        if (prayerJson != null) {
            // التحقق من حجم الويدجت (إذا كان أكبر من صف واحد 4x1)
            Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
            int minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);
            
            // الارتفاع الافتراضي لصف واحد يكون غالباً أقل من 90dp. إذا كان 100 أو أكثر معناه صفين أو أكبر.
            boolean isLarge = minHeight >= 100;

            if (isLarge) {
                views.setViewVisibility(R.id.widget_gregorian_date, View.VISIBLE);
                views.setViewVisibility(R.id.widget_app_icon_small, View.GONE);
                views.setViewVisibility(R.id.widget_app_icon_large, View.VISIBLE);
            } else {
                views.setTextViewText(R.id.widget_gregorian_date, "");
                views.setViewVisibility(R.id.widget_gregorian_date, View.GONE);
                views.setViewVisibility(R.id.widget_app_icon_small, View.VISIBLE);
                views.setViewVisibility(R.id.widget_app_icon_large, View.GONE);
            }

            try {
                JSONObject data = new JSONObject(prayerJson);
                JSONObject times = data.getJSONObject("times");
                String nextPrayerId = data.has("next_prayer_id") ? data.getString("next_prayer_id") : "";
                String nextPrayerName = data.has("next_prayer_name") ? data.getString("next_prayer_name") : "";
                long targetTimeMillis = data.has("target_time_millis") ? data.getLong("target_time_millis") : 0;

                // حساب الصلاة القادمة بناءً على الوقت الحالي إذا توفرت الطوابع الزمنية
                if (data.has("timestamps")) {
                    JSONObject timestamps = data.getJSONObject("timestamps");
                    long now = System.currentTimeMillis();
                    
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

                // --- NEW FALLBACK LOGIC ---
                // إذا انتهت كل الطوابع الزمنية ولم يتم تحديث التطبيق لفترة طويلة (أو targetTimeMillis صار في الماضي)
                // نستخرج أوقات الصلوات اليومية ونحسب الصلاة القادمة برمجياً لتجنب توقف العداد (أصفار)
                if (targetTimeMillis <= System.currentTimeMillis()) {
                    long now = System.currentTimeMillis();
                    java.util.Calendar cal = java.util.Calendar.getInstance();
                    int nowHour = cal.get(java.util.Calendar.HOUR_OF_DAY);
                    int nowMin = cal.get(java.util.Calendar.MINUTE);
                    int nowTotal = nowHour * 60 + nowMin;

                    String[] ids = {"fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"};
                    String[] namesAr = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
                    String[] namesEn = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                    String[] names = isArabic ? namesAr : namesEn;

                    JSONObject sourceTimes = (data.has("times_24h") && !data.isNull("times_24h"))
                            ? data.getJSONObject("times_24h")
                            : times;

                    boolean found = false;
                    for (int i = 0; i < ids.length; i++) {
                        try {
                            String timeStr = sourceTimes.getString(ids[i]);
                            String[] parts = timeStr.split(":");
                            int h = Integer.parseInt(parts[0].trim());
                            int m = Integer.parseInt(parts[1].trim());

                            // إذا كانت الأوقات المرجعية بصيغة 12 ساعة ولم تتضمن times_24h
                            if (sourceTimes == times) {
                                if (ids[i].equals("dhuhr") && h < 11) h += 12;
                                else if ((ids[i].equals("asr") || ids[i].equals("maghrib") || ids[i].equals("isha")) && h < 12) h += 12;
                            }

                            int pTotal = h * 60 + m;

                            if (pTotal > nowTotal) {
                                java.util.Calendar nextCal = java.util.Calendar.getInstance();
                                nextCal.set(java.util.Calendar.HOUR_OF_DAY, h);
                                nextCal.set(java.util.Calendar.MINUTE, m);
                                nextCal.set(java.util.Calendar.SECOND, 0);
                                nextCal.set(java.util.Calendar.MILLISECOND, 0);
                                targetTimeMillis = nextCal.getTimeInMillis();
                                nextPrayerId = ids[i];
                                nextPrayerName = names[i];
                                found = true;
                                break;
                            }
                        } catch (Exception e) {}
                    }

                    // إذا مرت جميع الصلوات لليوم الحالي، فالصلاة القادمة هي الفجر غداً
                    if (!found) {
                        try {
                            String timeStr = sourceTimes.getString("fajr");
                            String[] parts = timeStr.split(":");
                            int h = Integer.parseInt(parts[0].trim());
                            int m = Integer.parseInt(parts[1].trim());
                            
                            java.util.Calendar nextCal = java.util.Calendar.getInstance();
                            nextCal.add(java.util.Calendar.DAY_OF_YEAR, 1);
                            nextCal.set(java.util.Calendar.HOUR_OF_DAY, h);
                            nextCal.set(java.util.Calendar.MINUTE, m);
                            nextCal.set(java.util.Calendar.SECOND, 0);
                            nextCal.set(java.util.Calendar.MILLISECOND, 0);
                            targetTimeMillis = nextCal.getTimeInMillis();
                            nextPrayerId = "fajr";
                            nextPrayerName = names[0];
                        } catch (Exception e) {}
                    }
                }
                // --- END FALLBACK LOGIC ---

                // تحديث التاريخ الهجري ومعلومات الصلاة القادمة
                views.setTextViewText(R.id.widget_hijri_date, formatNumerals(translate(data.getString("day") + "، " + data.getString("hijri"), isArabic)));
                views.setTextViewText(R.id.widget_gregorian_date, formatNumerals(translate(data.getString("gregorian"), isArabic)));
                views.setTextViewText(R.id.widget_next_prayer_name, translate(nextPrayerName + " بعد", isArabic));
                
                if (targetTimeMillis > 0) {
                    long remainingMillis = targetTimeMillis - System.currentTimeMillis();
                    
                    if (remainingMillis <= 0) {
                        views.setChronometer(R.id.widget_next_prayer_time, android.os.SystemClock.elapsedRealtime(), "00:00:00", false);
                    } else {
                        long base = android.os.SystemClock.elapsedRealtime() + remainingMillis;
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                            views.setBoolean(R.id.widget_next_prayer_time, "setCountDown", true);
                        }
                        views.setChronometer(R.id.widget_next_prayer_time, base, "%s", true);
                        
                        // جدولة تحديث الريدجت عند دخول وقت الصلاة القادمة
                        Intent updateIntent = new Intent(context, PrayerWidgetProvider.class);
                        updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
                        
                        PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                                context, appWidgetId, updateIntent, 
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                                
                        android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                        if (alarmManager != null) {
                            // إضافة ثانية واحدة للتأكد من أن الوقت قد دخل فعلاً عند التحديث
                            long alarmTime = targetTimeMillis + 1000;
                            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                                alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC, alarmTime, pendingUpdate);
                            } else if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
                                alarmManager.setExact(android.app.AlarmManager.RTC, alarmTime, pendingUpdate);
                            } else {
                                alarmManager.set(android.app.AlarmManager.RTC, alarmTime, pendingUpdate);
                            }
                        }
                    }
                } else {
                    // Fallback if target_time_millis is not available
                    views.setTextViewText(R.id.widget_next_prayer_time, formatNumerals(data.getString("remaining_time")));
                }
                
                views.setTextViewText(R.id.widget_midnight, formatNumerals(translate(data.getString("midnight"), isArabic)));
                views.setTextViewText(R.id.widget_last_third, formatNumerals(translate(data.getString("last_third"), isArabic)));

                // تحديث أوقات الصلوات
                views.setTextViewText(R.id.name_fajr, isArabic ? "الفجر" : "Fajr");
                views.setTextViewText(R.id.name_sunrise, isArabic ? "الشروق" : "Sunrise");
                views.setTextViewText(R.id.name_dhuhr, isArabic ? "الظهر" : "Dhuhr");
                views.setTextViewText(R.id.name_asr, isArabic ? "العصر" : "Asr");
                views.setTextViewText(R.id.name_maghrib, isArabic ? "المغرب" : "Maghrib");
                views.setTextViewText(R.id.name_isha, isArabic ? "العشاء" : "Isha");

                views.setTextViewText(R.id.time_fajr, formatNumerals(times.getString("fajr")));
                views.setTextViewText(R.id.time_sunrise, formatNumerals(times.getString("sunrise")));
                views.setTextViewText(R.id.time_dhuhr, formatNumerals(times.getString("dhuhr")));
                views.setTextViewText(R.id.time_asr, formatNumerals(times.getString("asr")));
                views.setTextViewText(R.id.time_maghrib, formatNumerals(times.getString("maghrib")));
                views.setTextViewText(R.id.time_isha, formatNumerals(times.getString("isha")));

                // إعداد الألوان (تصفير الألوان)
                int defaultColor = Color.parseColor("#000000");
                int highlightColor = Color.parseColor("#10b981"); // Green
                int bgColor = Color.parseColor("#FFFFFF");
                int textColor = Color.parseColor("#000000");
                int accentColor = Color.parseColor("#7C3AED"); // Purple
                int secondaryColor = Color.parseColor("#10b981"); // Green

                // تطبيق الثيم إذا كان متوفراً
                if (data.has("theme") && !data.isNull("theme")) {
                    JSONObject theme = data.getJSONObject("theme");
                    if (theme.has("primaryColor")) highlightColor = Color.parseColor(theme.getString("primaryColor"));
                    if (theme.has("secondaryColor")) accentColor = Color.parseColor(theme.getString("secondaryColor"));
                    if (theme.has("bgColor")) bgColor = Color.parseColor(theme.getString("bgColor"));
                    if (theme.has("textColor")) textColor = Color.parseColor(theme.getString("textColor"));
                    
                    // تطبيق الألوان على الخلفيات
                    views.setInt(R.id.widget_root, "setBackgroundColor", bgColor);
                    views.setInt(R.id.widget_left_section, "setBackgroundColor", accentColor);
                    views.setInt(R.id.widget_bottom_section, "setBackgroundColor", accentColor);
                }

                views.setTextColor(R.id.widget_next_prayer_name, highlightColor);
                views.setTextColor(R.id.widget_next_prayer_time, textColor);
                views.setTextColor(R.id.widget_hijri_date, Color.WHITE); // Keep white for contrast on accent
                views.setTextColor(R.id.widget_gregorian_date, Color.WHITE);
                views.setTextColor(R.id.widget_midnight, Color.WHITE);
                views.setTextColor(R.id.widget_last_third, Color.WHITE);

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

                // تظليل الصلاة القادمة فقط
                if (nextPrayerId.equals("fajr")) {
                    views.setTextColor(R.id.name_fajr, highlightColor);
                    views.setTextColor(R.id.time_fajr, highlightColor);
                } else if (nextPrayerId.equals("sunrise")) {
                    views.setTextColor(R.id.name_sunrise, highlightColor);
                    views.setTextColor(R.id.time_sunrise, highlightColor);
                } else if (nextPrayerId.equals("dhuhr")) {
                    views.setTextColor(R.id.name_dhuhr, highlightColor);
                    views.setTextColor(R.id.time_dhuhr, highlightColor);
                } else if (nextPrayerId.equals("asr")) {
                    views.setTextColor(R.id.name_asr, highlightColor);
                    views.setTextColor(R.id.time_asr, highlightColor);
                } else if (nextPrayerId.equals("maghrib")) {
                    views.setTextColor(R.id.name_maghrib, highlightColor);
                    views.setTextColor(R.id.time_maghrib, highlightColor);
                } else if (nextPrayerId.equals("isha")) {
                    views.setTextColor(R.id.name_isha, highlightColor);
                    views.setTextColor(R.id.time_isha, highlightColor);
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Handle resizing logic
        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);
        
        // If the widget is shrunk below a certain threshold (e.g., 100dp), adjust font sizes to fit everything
        if (minHeight > 0 && minHeight < 100) {
            views.setViewVisibility(R.id.widget_bottom_section, View.VISIBLE);
            views.setTextViewTextSize(R.id.widget_midnight, android.util.TypedValue.COMPLEX_UNIT_SP, 9);
            views.setTextViewTextSize(R.id.widget_last_third, android.util.TypedValue.COMPLEX_UNIT_SP, 9);
            
            // Shrink middle section text
            float nameSize = 12;
            float timeSize = 13;
            views.setTextViewTextSize(R.id.name_fajr, android.util.TypedValue.COMPLEX_UNIT_SP, nameSize);
            views.setTextViewTextSize(R.id.time_fajr, android.util.TypedValue.COMPLEX_UNIT_SP, timeSize);
            views.setTextViewTextSize(R.id.name_sunrise, android.util.TypedValue.COMPLEX_UNIT_SP, nameSize);
            views.setTextViewTextSize(R.id.time_sunrise, android.util.TypedValue.COMPLEX_UNIT_SP, timeSize);
            views.setTextViewTextSize(R.id.name_dhuhr, android.util.TypedValue.COMPLEX_UNIT_SP, nameSize);
            views.setTextViewTextSize(R.id.time_dhuhr, android.util.TypedValue.COMPLEX_UNIT_SP, timeSize);
            views.setTextViewTextSize(R.id.name_asr, android.util.TypedValue.COMPLEX_UNIT_SP, nameSize);
            views.setTextViewTextSize(R.id.time_asr, android.util.TypedValue.COMPLEX_UNIT_SP, timeSize);
            views.setTextViewTextSize(R.id.name_maghrib, android.util.TypedValue.COMPLEX_UNIT_SP, nameSize);
            views.setTextViewTextSize(R.id.time_maghrib, android.util.TypedValue.COMPLEX_UNIT_SP, timeSize);
            views.setTextViewTextSize(R.id.name_isha, android.util.TypedValue.COMPLEX_UNIT_SP, nameSize);
            views.setTextViewTextSize(R.id.time_isha, android.util.TypedValue.COMPLEX_UNIT_SP, timeSize);

            // Hide gregorian date to save space
            views.setViewVisibility(R.id.widget_gregorian_date, View.GONE);
        } else {
            views.setViewVisibility(R.id.widget_bottom_section, View.VISIBLE);
            views.setTextViewTextSize(R.id.widget_midnight, android.util.TypedValue.COMPLEX_UNIT_SP, 12);
            views.setTextViewTextSize(R.id.widget_last_third, android.util.TypedValue.COMPLEX_UNIT_SP, 12);
            
            // Standard sizes for large widget
            views.setTextViewTextSize(R.id.name_fajr, android.util.TypedValue.COMPLEX_UNIT_SP, 14);
            views.setTextViewTextSize(R.id.time_fajr, android.util.TypedValue.COMPLEX_UNIT_SP, 16);
            views.setTextViewTextSize(R.id.name_sunrise, android.util.TypedValue.COMPLEX_UNIT_SP, 14);
            views.setTextViewTextSize(R.id.time_sunrise, android.util.TypedValue.COMPLEX_UNIT_SP, 16);
            views.setTextViewTextSize(R.id.name_dhuhr, android.util.TypedValue.COMPLEX_UNIT_SP, 14);
            views.setTextViewTextSize(R.id.time_dhuhr, android.util.TypedValue.COMPLEX_UNIT_SP, 16);
            views.setTextViewTextSize(R.id.name_asr, android.util.TypedValue.COMPLEX_UNIT_SP, 14);
            views.setTextViewTextSize(R.id.time_asr, android.util.TypedValue.COMPLEX_UNIT_SP, 16);
            views.setTextViewTextSize(R.id.name_maghrib, android.util.TypedValue.COMPLEX_UNIT_SP, 14);
            views.setTextViewTextSize(R.id.time_maghrib, android.util.TypedValue.COMPLEX_UNIT_SP, 16);
            views.setTextViewTextSize(R.id.name_isha, android.util.TypedValue.COMPLEX_UNIT_SP, 14);
            views.setTextViewTextSize(R.id.time_isha, android.util.TypedValue.COMPLEX_UNIT_SP, 16);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}