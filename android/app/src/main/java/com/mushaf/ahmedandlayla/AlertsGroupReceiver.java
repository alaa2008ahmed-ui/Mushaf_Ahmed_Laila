package com.mushaf.ahmedandlayla;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * BroadcastReceiver triggered whenever an alert is posted or dismissed
 * to keep the App Alerts group summary card in sync.
 */
public class AlertsGroupReceiver extends BroadcastReceiver {
    public static final String ACTION_UPDATE_ALERTS_SUMMARY = "com.mushaf.ahmedandlayla.ACTION_UPDATE_ALERTS_SUMMARY";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null) return;
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            AlertsGroupHelper.updateGroupSummary(context, nm);
        } catch (Exception ignored) {}
    }
}
