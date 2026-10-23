package com.mushaf.ahmedandlayla;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
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
    public void openAppSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            android.net.Uri uri = android.net.Uri.fromParts("package", getContext().getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open app settings: " + e.getMessage());
        }
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

    @PluginMethod
    public void updatePersistentNotification(PluginCall call) {
        Context context = getContext();
        PersistentPrayerNotification.update(context);
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void setPersistentNotificationEnabled(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", true);
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        prefs.edit().putString("persistent_prayer_notification_enabled", enabled ? "true" : "false").apply();
        
        if (enabled) {
            PersistentPrayerNotification.update(context);
        } else {
            PersistentPrayerNotification.cancel(context);
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("enabled", enabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void checkBatteryOptimization(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            boolean isIgnoring = pm != null && pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
            ret.put("isIgnoring", isIgnoring);
        } else {
            ret.put("isIgnoring", true);
        }
        call.resolve(ret);
    }

    private static MediaPlayer previewMediaPlayer = null;

    @PluginMethod
    public void playTone(PluginCall call) {
        String path = call.getString("path", "");
        if (path == null || path.isEmpty() || "none".equals(path)) {
            stopToneInternal();
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
            return;
        }

        try {
            stopToneInternal();

            // Extract sound name (e.g., "/assets/audio/salah.mp3" -> "salah", "salah" -> "salah")
            String soundName = path.toLowerCase().trim();
            if (soundName.contains("/")) {
                soundName = soundName.substring(soundName.lastIndexOf("/") + 1);
            }
            if (soundName.contains(".")) {
                soundName = soundName.substring(0, soundName.lastIndexOf("."));
            }
            soundName = soundName.replaceAll("[^a-z0-9_]", "");

            Context ctx = getContext();
            int resId = ctx.getResources().getIdentifier(soundName, "raw", ctx.getPackageName());
            if (resId != 0) {
                previewMediaPlayer = MediaPlayer.create(ctx, resId);
                if (previewMediaPlayer != null) {
                    previewMediaPlayer.setOnCompletionListener(mp -> {
                        stopToneInternal();
                    });
                    previewMediaPlayer.start();
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    ret.put("source", "raw");
                    ret.put("name", soundName);
                    call.resolve(ret);
                    return;
                }
            }

            // If it's a file or content URI
            if (path.startsWith("file://") || path.startsWith("content://")) {
                previewMediaPlayer = new MediaPlayer();
                previewMediaPlayer.setDataSource(ctx, Uri.parse(path));
                previewMediaPlayer.prepare();
                previewMediaPlayer.setOnCompletionListener(mp -> {
                    stopToneInternal();
                });
                previewMediaPlayer.start();
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("source", "uri");
                call.resolve(ret);
                return;
            }

            // Not found in res/raw, resolve so web fallback can handle it
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("fallbackNeeded", true);
            call.resolve(ret);
        } catch (Exception e) {
            stopToneInternal();
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("error", e.getMessage());
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void stopTone(PluginCall call) {
        stopToneInternal();
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    private void stopToneInternal() {
        if (previewMediaPlayer != null) {
            try {
                if (previewMediaPlayer.isPlaying()) {
                    previewMediaPlayer.stop();
                }
                previewMediaPlayer.release();
            } catch (Exception ignored) {}
            previewMediaPlayer = null;
        }
    }

    @PluginMethod
    public void requestBatteryOptimization(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            } catch (Exception e) {
                try {
                    Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                } catch (Exception ignored) {}
            }
        }
        call.resolve();
    }
}
