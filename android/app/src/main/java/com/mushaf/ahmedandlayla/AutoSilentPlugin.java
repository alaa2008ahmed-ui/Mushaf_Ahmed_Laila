package com.mushaf.ahmedandlayla;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "AutoSilentMode")
public class AutoSilentPlugin extends Plugin {

    @PluginMethod
    public void checkDndPermission(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            boolean granted = nm != null && nm.isNotificationPolicyAccessGranted();
            ret.put("granted", granted);
        } else {
            ret.put("granted", true);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void requestDndPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void setSilentNow(PluginCall call) {
        boolean silent = call.getBoolean("silent", false);
        String prayerName = call.getString("prayerName", "الصلاة");
        Context context = getContext();
        AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        if (am == null) {
            call.reject("AudioManager not available");
            return;
        }

        try {
            if (silent) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                    if (nm != null && nm.isNotificationPolicyAccessGranted()) {
                        am.setRingerMode(AudioManager.RINGER_MODE_SILENT);
                    } else {
                        am.setRingerMode(AudioManager.RINGER_MODE_VIBRATE);
                    }
                } else {
                    am.setRingerMode(AudioManager.RINGER_MODE_SILENT);
                }
            } else {
                am.setRingerMode(AudioManager.RINGER_MODE_NORMAL);
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("isSilent", silent);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to set ringer mode: " + e.getMessage());
        }
    }

    @PluginMethod
    public void scheduleSilentWindows(PluginCall call) {
        JSArray windows = call.getArray("windows");
        if (windows == null) {
            call.resolve();
            return;
        }

        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            call.reject("AlarmManager not available");
            return;
        }

        long now = System.currentTimeMillis();

        for (int i = 0; i < windows.length(); i++) {
            try {
                JSONObject item = windows.getJSONObject(i);
                int id = item.getInt("id");
                String prayerName = item.optString("prayerName", "الصلاة");
                long startMillis = item.getLong("startMillis");
                int durationMinutes = item.getInt("durationMinutes");
                long endMillis = startMillis + ((long) durationMinutes * 60 * 1000);

                // Schedule START silent alarm if in the future
                if (startMillis > now) {
                    Intent startIntent = new Intent(context, PrayerSilentReceiver.class);
                    startIntent.setAction(PrayerSilentReceiver.ACTION_START_SILENT);
                    startIntent.putExtra(PrayerSilentReceiver.EXTRA_PRAYER_NAME, prayerName);
                    startIntent.putExtra(PrayerSilentReceiver.EXTRA_WINDOW_ID, id);

                    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
                    PendingIntent startPi = PendingIntent.getBroadcast(context, id * 2, startIntent, flags);

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        try {
                            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, startMillis, startPi);
                        } catch (SecurityException se) {
                            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, startMillis, startPi);
                        }
                    } else {
                        alarmManager.setExact(AlarmManager.RTC_WAKEUP, startMillis, startPi);
                    }
                }

                // Schedule END silent alarm if in the future
                if (endMillis > now) {
                    Intent endIntent = new Intent(context, PrayerSilentReceiver.class);
                    endIntent.setAction(PrayerSilentReceiver.ACTION_END_SILENT);
                    endIntent.putExtra(PrayerSilentReceiver.EXTRA_PRAYER_NAME, prayerName);
                    endIntent.putExtra(PrayerSilentReceiver.EXTRA_WINDOW_ID, id);

                    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
                    PendingIntent endPi = PendingIntent.getBroadcast(context, id * 2 + 1, endIntent, flags);

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        try {
                            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, endMillis, endPi);
                        } catch (SecurityException se) {
                            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, endMillis, endPi);
                        }
                    } else {
                        alarmManager.setExact(AlarmManager.RTC_WAKEUP, endMillis, endPi);
                    }
                }

            } catch (JSONException ignored) {
            }
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void cancelAllSilent(PluginCall call) {
        Context context = getContext();
        AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        if (am != null) {
            try {
                am.setRingerMode(AudioManager.RINGER_MODE_NORMAL);
            } catch (Exception ignored) {}
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
