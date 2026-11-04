package com.mushaf.ahmedandlayla;

import android.appwidget.AppWidgetManager;
import android.content.Context;

/**
 * PrayerWidgetProvider acts as the primary compatibility entry point and provider
 * for prayer widgets, delegating to PrayerAClassicWidgetProvider.
 */
public class PrayerWidgetProvider extends PrayerAClassicWidgetProvider {

    public static final String ACTION_REFRESH_WIDGET = PrayerAClassicWidgetProvider.ACTION_REFRESH_WIDGET;

    public static void updateAllWidgets(Context context) {
        PrayerAClassicWidgetProvider.updateAllWidgets(context);
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        PrayerAClassicWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    public static String formatNumerals(String input, boolean isArabic) {
        return PrayerAClassicWidgetProvider.formatNumerals(input, isArabic);
    }

    public static String formatRemainingTime(long diffMillis) {
        return PrayerAClassicWidgetProvider.formatRemainingTime(diffMillis);
    }

    public static String translate(String text, boolean isArabic) {
        return PrayerAClassicWidgetProvider.translate(text, isArabic);
    }
}
