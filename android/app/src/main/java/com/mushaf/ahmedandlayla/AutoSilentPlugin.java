package com.mushaf.ahmedandlayla;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.lang.ref.WeakReference;
import java.util.List;

@CapacitorPlugin(name = "AutoSilentMode")
public class AutoSilentPlugin extends Plugin {

    private static volatile WeakReference<AutoSilentPlugin> activePluginRef = null;
    private BroadcastReceiver ringerModeReceiver = null;
    private String activeTorchCameraId = null;
    private boolean isNativeTorchOn = false;
    private Object torchCallbackObj = null;

    @Override
    public void load() {
        super.load();
        activePluginRef = new WeakReference<>(this);
    }

    @Override
    protected void handleOnStart() {
        super.handleOnStart();
        activePluginRef = new WeakReference<>(this);
        registerRingerReceiver();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        activePluginRef = new WeakReference<>(this);
        Context ctx = getContext();
        if (ctx != null) {
            PrayerSilentReceiver.reconcileState(ctx);
            notifySilentStateChanged(ctx);
        }
    }

    @Override
    protected void handleOnStop() {
        super.handleOnStop();
        unregisterRingerReceiver();
        turnOffNativeTorchInternal();
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        unregisterRingerReceiver();
        turnOffNativeTorchInternal();
        unregisterTorchCallback();
    }

    private void registerRingerReceiver() {
        Context ctx = getContext();
        if (ctx == null || ringerModeReceiver != null) return;
        try {
            ringerModeReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    PrayerSilentReceiver.handleRingerModeChanged(context);
                }
            };
            IntentFilter filter = new IntentFilter(AudioManager.RINGER_MODE_CHANGED_ACTION);
            ContextCompat.registerReceiver(ctx, ringerModeReceiver, filter, ContextCompat.RECEIVER_EXPORTED);
        } catch (Exception ignored) {
            ringerModeReceiver = null;
        }
    }

    private void unregisterRingerReceiver() {
        Context ctx = getContext();
        if (ctx != null && ringerModeReceiver != null) {
            try {
                ctx.unregisterReceiver(ringerModeReceiver);
            } catch (Exception ignored) {}
            ringerModeReceiver = null;
        }
    }

    public static JSObject buildStatusObject(Context context) {
        JSObject ret = new JSObject();
        if (context == null) {
            ret.put("isSilentActive", false);
            ret.put("manuallyRestored", false);
            ret.put("isDeviceMuted", false);
            ret.put("ringerMode", AudioManager.RINGER_MODE_NORMAL);
            ret.put("activeWindowId", -1);
            ret.put("activePrayerKey", "");
            ret.put("activePrayerName", "");
            ret.put("activeStartMillis", 0L);
            ret.put("activeEndMillis", 0L);
            ret.put("restoredWindowStartMillis", -1L);
            return ret;
        }

        SharedPreferences prefs = context.getSharedPreferences(PrayerSilentReceiver.PREFS_NAME, Context.MODE_PRIVATE);
        AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        int ringerMode = am != null ? am.getRingerMode() : AudioManager.RINGER_MODE_NORMAL;
        boolean isDeviceMuted = PrayerSilentReceiver.isDeviceEffectivelyMuted(context, am);

        boolean storedActive = prefs.getBoolean(PrayerSilentReceiver.KEY_IS_SILENT_ACTIVE, false);
        boolean manuallyRestored = prefs.getBoolean(PrayerSilentReceiver.KEY_USER_MANUALLY_RESTORED, false);
        int activeWindowId = prefs.getInt(PrayerSilentReceiver.KEY_ACTIVE_WINDOW_ID, -1);
        String activePrayerKey = prefs.getString(PrayerSilentReceiver.KEY_ACTIVE_PRAYER_KEY, "");
        String activePrayerName = prefs.getString(PrayerSilentReceiver.KEY_ACTIVE_PRAYER_NAME, "");
        long activeStartMillis = prefs.getLong(PrayerSilentReceiver.KEY_ACTIVE_SILENT_START_MILLIS, 0L);
        long activeEndMillis = prefs.getLong(PrayerSilentReceiver.KEY_ACTIVE_SILENT_END_MILLIS, 0L);
        long restoredWindowStartMillis = prefs.getLong(PrayerSilentReceiver.KEY_RESTORED_WINDOW_START_MILLIS, -1L);

        long now = System.currentTimeMillis();
        boolean withinWindow = activeEndMillis <= 0L || now < activeEndMillis;
        boolean effectiveActive = storedActive && !manuallyRestored && isDeviceMuted && withinWindow;

        ret.put("isSilentActive", effectiveActive);
        ret.put("manuallyRestored", manuallyRestored);
        ret.put("isDeviceMuted", isDeviceMuted);
        ret.put("ringerMode", ringerMode);
        ret.put("activeWindowId", activeWindowId);
        ret.put("activePrayerKey", activePrayerKey != null ? activePrayerKey : "");
        ret.put("activePrayerName", activePrayerName != null ? activePrayerName : "");
        ret.put("activeStartMillis", activeStartMillis);
        ret.put("activeEndMillis", activeEndMillis);
        ret.put("restoredWindowStartMillis", restoredWindowStartMillis);
        return ret;
    }

    public static void notifySilentStateChanged(Context context) {
        if (context == null) return;
        try {
            AutoSilentPlugin plugin = activePluginRef != null ? activePluginRef.get() : null;
            if (plugin != null) {
                plugin.notifyListeners("silentStateChanged", buildStatusObject(context));
            }
        } catch (Exception ignored) {}
    }

    public static void notifyQuranPlaybackStoppedFromNotification(Context context) {
        try {
            AutoSilentPlugin plugin = activePluginRef != null ? activePluginRef.get() : null;
            if (plugin != null) {
                JSObject data = new JSObject();
                data.put("stopped", true);
                plugin.notifyListeners("quranPlaybackStopped", data);
            }
        } catch (Exception ignored) {}
    }

    public static void notifyAdhanPlaybackStateChanged(boolean isPlaying) {
        try {
            AutoSilentPlugin plugin = activePluginRef != null ? activePluginRef.get() : null;
            if (plugin != null) {
                JSObject data = new JSObject();
                data.put("isPlaying", isPlaying);
                plugin.notifyListeners("adhanPlaybackStateChanged", data);
            }
        } catch (Exception ignored) {}
    }

    public static void notifyTonePlaybackEnded() {
        try {
            AutoSilentPlugin plugin = activePluginRef != null ? activePluginRef.get() : null;
            if (plugin != null) {
                JSObject data = new JSObject();
                data.put("ended", true);
                plugin.notifyListeners("tonePlaybackEnded", data);
            }
        } catch (Exception ignored) {}
    }

    @PluginMethod
    public void getSilentStatus(PluginCall call) {
        Context context = getContext();
        if (context != null) {
            PrayerSilentReceiver.reconcileState(context);
        }
        call.resolve(buildStatusObject(context));
    }

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
            Uri uri = Uri.fromParts("package", getContext().getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open app settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openLocationSettings(PluginCall call) {
        Context context = getContext();
        try {
            Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            try {
                Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                fallback.setData(Uri.fromParts("package", context.getPackageName(), null));
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(fallback);
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception ex) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", ex.getMessage());
                call.resolve(ret);
            }
        }
    }

    private String resolveFlashCameraId(CameraManager cm) {
        if (cm == null) return null;
        try {
            String fallbackId = null;
            String[] ids = cm.getCameraIdList();
            for (String id : ids) {
                CameraCharacteristics chars = cm.getCameraCharacteristics(id);
                Boolean hasFlash = chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                if (Boolean.TRUE.equals(hasFlash)) {
                    Integer facing = chars.get(CameraCharacteristics.LENS_FACING);
                    if (facing != null && facing == CameraCharacteristics.LENS_FACING_BACK) {
                        return id;
                    }
                    if (fallbackId == null) {
                        fallbackId = id;
                    }
                }
            }
            return fallbackId;
        } catch (Exception ignored) {
            return null;
        }
    }

    private void ensureTorchCallback(CameraManager cm) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || cm == null || torchCallbackObj != null) {
            return;
        }
        try {
            CameraManager.TorchCallback cb = new CameraManager.TorchCallback() {
                @Override
                public void onTorchModeChanged(String cameraId, boolean enabled) {
                    if (activeTorchCameraId == null || activeTorchCameraId.equals(cameraId)) {
                        isNativeTorchOn = enabled;
                        JSObject data = new JSObject();
                        data.put("enabled", enabled);
                        data.put("cameraId", cameraId);
                        notifyListeners("torchStateChanged", data);
                    }
                }

                @Override
                public void onTorchModeUnavailable(String cameraId) {
                    if (activeTorchCameraId != null && activeTorchCameraId.equals(cameraId)) {
                        isNativeTorchOn = false;
                    }
                }
            };
            cm.registerTorchCallback(cb, new Handler(Looper.getMainLooper()));
            torchCallbackObj = cb;
        } catch (Exception ignored) {
            torchCallbackObj = null;
        }
    }

    private void unregisterTorchCallback() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || torchCallbackObj == null) {
            return;
        }
        Context context = getContext();
        if (context != null) {
            try {
                CameraManager cm = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
                if (cm != null && torchCallbackObj instanceof CameraManager.TorchCallback) {
                    cm.unregisterTorchCallback((CameraManager.TorchCallback) torchCallbackObj);
                }
            } catch (Exception ignored) {}
        }
        torchCallbackObj = null;
    }

    private void turnOffNativeTorchInternal() {
        if (!isNativeTorchOn) return;
        isNativeTorchOn = false;
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;
        Context context = getContext();
        if (context == null) return;
        try {
            CameraManager cm = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
            if (cm != null) {
                String camId = activeTorchCameraId != null ? activeTorchCameraId : resolveFlashCameraId(cm);
                if (camId != null) {
                    cm.setTorchMode(camId, false);
                }
            }
        } catch (Exception ignored) {}
    }

    @PluginMethod
    public void checkTorchAvailability(PluginCall call) {
        JSObject ret = new JSObject();
        Context context = getContext();
        if (context == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            ret.put("available", false);
            ret.put("enabled", false);
            call.resolve(ret);
            return;
        }

        try {
            PackageManager pm = context.getPackageManager();
            boolean hasFeature = pm != null && pm.hasSystemFeature(PackageManager.FEATURE_CAMERA_FLASH);
            CameraManager cm = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
            String camId = resolveFlashCameraId(cm);
            if (camId != null) {
                activeTorchCameraId = camId;
                ensureTorchCallback(cm);
            }
            boolean available = camId != null || hasFeature;
            ret.put("available", available);
            ret.put("cameraId", camId != null ? camId : "");
            ret.put("enabled", isNativeTorchOn);
        } catch (Exception e) {
            ret.put("available", false);
            ret.put("enabled", false);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void setTorchEnabled(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        JSObject ret = new JSObject();
        Context context = getContext();

        if (context == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            ret.put("success", false);
            ret.put("reason", "UNSUPPORTED");
            ret.put("error", "Camera2 torch requires Android 6.0+");
            call.resolve(ret);
            return;
        }

        try {
            CameraManager cm = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
            if (cm == null) {
                ret.put("success", false);
                ret.put("reason", "UNAVAILABLE");
                ret.put("error", "CameraManager unavailable");
                call.resolve(ret);
                return;
            }

            String camId = activeTorchCameraId != null ? activeTorchCameraId : resolveFlashCameraId(cm);
            if (camId == null) {
                ret.put("success", false);
                ret.put("reason", "NO_FLASH");
                ret.put("error", "No camera flash unit found on device");
                call.resolve(ret);
                return;
            }

            activeTorchCameraId = camId;
            ensureTorchCallback(cm);
            cm.setTorchMode(camId, enabled);
            isNativeTorchOn = enabled;

            ret.put("success", true);
            ret.put("enabled", enabled);
            ret.put("cameraId", camId);
            call.resolve(ret);
        } catch (CameraAccessException e) {
            String reason = "ACCESS_ERROR";
            int code = e.getReason();
            if (code == CameraAccessException.CAMERA_IN_USE || code == CameraAccessException.MAX_CAMERAS_IN_USE) {
                reason = "CAMERA_IN_USE";
            } else if (code == CameraAccessException.CAMERA_DISABLED) {
                reason = "CAMERA_DISABLED";
            }
            if (!enabled) {
                isNativeTorchOn = false;
            }
            ret.put("success", false);
            ret.put("reason", reason);
            ret.put("error", e.getMessage() != null ? e.getMessage() : "CameraAccessException");
            call.resolve(ret);
        } catch (Exception e) {
            if (!enabled) {
                isNativeTorchOn = false;
            }
            ret.put("success", false);
            ret.put("reason", "ERROR");
            ret.put("error", e.getMessage() != null ? e.getMessage() : "Torch control failed");
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void syncDailyWird(PluginCall call) {
        try {
            Context context = getContext();
            if (context != null) {
                DailyWirdAlarmReceiver.reconcileActiveNotifications(context);
                DailyWirdAlarmReceiver.scheduleNextAlarms(context);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not sync daily wird alarms: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setSilentNow(PluginCall call) {
        boolean silent = call.getBoolean("silent", false);
        Context context = getContext();
        AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        if (am == null) {
            call.reject("AudioManager not available");
            return;
        }

        try {
            if (silent) {
                PrayerSilentReceiver.applySilentMode(context, am);
            } else {
                PrayerSilentReceiver.restoreRingerMode(context, am, AudioManager.RINGER_MODE_NORMAL);
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("isSilent", am.getRingerMode() != AudioManager.RINGER_MODE_NORMAL);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to set ringer mode: " + e.getMessage());
        }
    }

    @PluginMethod
    public void scheduleSilentWindows(PluginCall call) {
        JSArray windows = call.getArray("windows");
        Context context = getContext();
        if (context == null) {
            call.resolve();
            return;
        }

        PrayerSilentReceiver.scheduleWindows(context, windows);
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void manualRestoreSound(PluginCall call) {
        Context context = getContext();
        long startMillis = call.hasOption("startMillis") ? call.getLong("startMillis", -1L) : -1L;
        int windowId = call.hasOption("windowId") ? call.getInt("windowId", -1) : -1;

        PrayerSilentReceiver.manualRestore(context, startMillis, windowId);
        JSObject ret = buildStatusObject(context);
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void cancelAllSilent(PluginCall call) {
        Context context = getContext();
        PrayerSilentReceiver.cancelAllWindows(context);
        JSObject ret = buildStatusObject(context);
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void updateWidget(PluginCall call) {
        Context context = getContext();
        if (context != null) {
            PrayerWidgetProvider.updateAllWidgets(context);
            PersistentPrayerNotification.update(context);
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
    public void updateAlertsGroupSummary(PluginCall call) {
        Context context = getContext();
        if (context != null) {
            AlertsGroupHelper.updateGroupSummary(context, null);
        }
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

    @PluginMethod
    public void openAppNotificationSettings(PluginCall call) {
        Context context = getContext();
        try {
            Intent intent = new Intent();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                intent.setAction(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.getPackageName());
            } else {
                intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
                intent.putExtra("app_package", context.getPackageName());
                intent.putExtra("app_uid", context.getApplicationInfo().uid);
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("error", e.getMessage());
            call.resolve(ret);
        }
    }

    private static MediaPlayer previewMediaPlayer = null;

    @PluginMethod
    public void scheduleAdhanAlarms(PluginCall call) {
        try {
            JSArray alarms = call.getArray("alarms");
            Context context = getContext();
            if (context != null) {
                if (alarms == null || alarms.length() == 0) {
                    AdhanAlarmReceiver.cancelAllAlarms(context);
                } else {
                    AdhanAlarmReceiver.scheduleAlarms(context, alarms);
                }
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("count", alarms != null ? alarms.length() : 0);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to schedule Adhan alarms: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelAdhanAlarms(PluginCall call) {
        try {
            Context context = getContext();
            if (context != null) {
                AdhanAlarmReceiver.cancelAllAlarms(context);
                AdhanPlaybackService.stopIfPlaying(context, false);
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to cancel Adhan alarms: " + e.getMessage());
        }
    }

    @PluginMethod
    public void scheduleIqamaAlarms(PluginCall call) {
        try {
            JSArray alarms = call.getArray("alarms");
            Context context = getContext();
            if (context != null) {
                if (alarms == null || alarms.length() == 0) {
                    PrayerSilentReceiver.cancelAllIqamaAlarms(context);
                } else {
                    PrayerSilentReceiver.scheduleIqamaAlarms(context, alarms);
                }
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("count", alarms != null ? alarms.length() : 0);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to schedule Iqama alarms: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelIqamaAlarms(PluginCall call) {
        try {
            Context context = getContext();
            if (context != null) {
                PrayerSilentReceiver.cancelAllIqamaAlarms(context);
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to cancel Iqama alarms: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setAlertVolume(PluginCall call) {
        int volume = call.getInt("volume", 100);
        int clamped = Math.max(0, Math.min(100, volume));
        Context context = getContext();
        try {
            SharedPreferences prefs = context.getSharedPreferences(PrayerSilentReceiver.PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putInt("alert_volume", clamped).apply();
        } catch (Exception ignored) {}

        AdhanPlaybackService.updateVolume(context, clamped);
        if (previewMediaPlayer != null) {
            try {
                if (clamped <= 0) {
                    stopToneInternal();
                } else if (previewMediaPlayer.isPlaying()) {
                    float scaled = AdhanPlaybackService.computeScaledVolume(clamped);
                    previewMediaPlayer.setVolume(scaled, scaled);
                }
            } catch (Exception ignored) {}
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("volume", clamped);
        call.resolve(ret);
    }

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

            int volPercent;
            Double volumeOpt = call.getDouble("volume");
            if (volumeOpt != null) {
                volPercent = (int) Math.max(0, Math.min(100, Math.round(volumeOpt)));
            } else {
                SharedPreferences prefs = getContext().getSharedPreferences(PrayerSilentReceiver.PREFS_NAME, Context.MODE_PRIVATE);
                volPercent = Math.max(0, Math.min(100, prefs.getInt("alert_volume", 100)));
            }

            if (volPercent <= 0) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("muted", true);
                ret.put("volume", 0);
                call.resolve(ret);
                return;
            }

            float vol = AdhanPlaybackService.computeScaledVolume(volPercent);
            android.media.AudioAttributes alarmAttrs = new android.media.AudioAttributes.Builder()
                .setUsage(android.media.AudioAttributes.USAGE_ALARM)
                .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setFlags(android.media.AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                .build();

            Context ctx = getContext();
            boolean isExternalUri = path.startsWith("file://") || path.startsWith("content://");
            if (!isExternalUri) {
                String soundName = path.toLowerCase().trim();
                if (soundName.contains("/")) {
                    soundName = soundName.substring(soundName.lastIndexOf("/") + 1);
                }
                if (soundName.contains(".")) {
                    soundName = soundName.substring(0, soundName.lastIndexOf("."));
                }
                soundName = soundName.replaceAll("[^a-z0-9_]", "");

                int resId = ctx.getResources().getIdentifier(soundName, "raw", ctx.getPackageName());
                if (resId != 0) {
                    MediaPlayer mp = new MediaPlayer();
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        mp.setAudioAttributes(alarmAttrs);
                    } else {
                        mp.setAudioStreamType(AudioManager.STREAM_ALARM);
                    }
                    android.content.res.AssetFileDescriptor afd = ctx.getResources().openRawResourceFd(resId);
                    if (afd != null) {
                        mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                        afd.close();
                        mp.prepare();
                        previewMediaPlayer = mp;
                        previewMediaPlayer.setVolume(vol, vol);
                        previewMediaPlayer.setOnCompletionListener(p -> {
                            stopToneInternal();
                            notifyTonePlaybackEnded();
                        });
                        previewMediaPlayer.start();
                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("source", "raw");
                        ret.put("name", soundName);
                        ret.put("volume", volPercent);
                        call.resolve(ret);
                        return;
                    } else {
                        mp.release();
                    }
                }
            }

            if (isExternalUri) {
                MediaPlayer mp = new MediaPlayer();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mp.setAudioAttributes(alarmAttrs);
                } else {
                    mp.setAudioStreamType(AudioManager.STREAM_ALARM);
                }
                mp.setDataSource(ctx, Uri.parse(path));
                mp.prepare();
                previewMediaPlayer = mp;
                previewMediaPlayer.setVolume(vol, vol);
                previewMediaPlayer.setOnCompletionListener(p -> {
                    stopToneInternal();
                    notifyTonePlaybackEnded();
                });
                previewMediaPlayer.start();
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("source", "uri");
                ret.put("volume", volPercent);
                call.resolve(ret);
                return;
            }

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
        AdhanPlaybackService.stopIfPlaying(getContext(), false);
        notifyTonePlaybackEnded();
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

    private static final String CUSTOM_PHONE_CHANNEL_PREFIX = "athkar_channel_phone_";

    private String ensureCustomPhoneNotificationChannelInternal(Context context, Uri soundUri, String toneTitle) {
        if (context == null || soundUri == null) return "athkar_channel_v4_chime";

        String uriString = soundUri.toString();
        String hashHex = Integer.toHexString(uriString.hashCode() & 0x7fffffff);
        String channelId = CUSTOM_PHONE_CHANNEL_PREFIX + hashHex;

        try {
            context.grantUriPermission("com.android.systemui", soundUri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
        } catch (Exception ignored) {}

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    try {
                        List<NotificationChannel> existingChannels = nm.getNotificationChannels();
                        if (existingChannels != null) {
                            for (NotificationChannel existing : existingChannels) {
                                String existingId = existing.getId();
                                if (existingId != null && existingId.startsWith(CUSTOM_PHONE_CHANNEL_PREFIX) && !existingId.equals(channelId)) {
                                    nm.deleteNotificationChannel(existingId);
                                }
                            }
                        }
                    } catch (Exception ignored) {}

                    if (nm.getNotificationChannel(channelId) == null) {
                        SharedPreferences storage = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                        boolean isArabic = !"en".equalsIgnoreCase(storage.getString("app_language", "ar"));

                        String safeTitle = (toneTitle != null && !toneTitle.trim().isEmpty())
                            ? toneTitle.trim()
                            : (isArabic ? "نغمة من الهاتف" : "Phone Tone");
                        String channelName = isArabic
                            ? ("تنبيهات وأذكار (" + safeTitle + ")")
                            : ("Reminders (" + safeTitle + ")");

                        AudioAttributes alarmAudioAttributes = new AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                            .build();

                        NotificationChannel channel = new NotificationChannel(
                            channelId,
                            channelName,
                            NotificationManager.IMPORTANCE_HIGH
                        );
                        channel.setDescription(isArabic
                            ? "قناة تنبيهات الأذكار والتنبيهات بنغمة الهاتف المختارة"
                            : "Reminders and adhkar notifications with selected phone tone");
                        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                        channel.setBypassDnd(true);
                        NotificationVibrationHelper.configureChannelVibration(
                            channel,
                            NotificationVibrationHelper.ALERT_VIBRATION_PATTERN
                        );
                        channel.enableLights(true);
                        channel.setShowBadge(false);
                        channel.setSound(soundUri, alarmAudioAttributes);
                        nm.createNotificationChannel(channel);
                    }
                }
            } catch (Exception ignored) {}
        }

        try {
            SharedPreferences storage = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            storage.edit()
                .putString("custom_phone_notif_uri", uriString)
                .putString("custom_phone_notif_channel_id", channelId)
                .apply();
        } catch (Exception ignored) {}

        return channelId;
    }

    @PluginMethod
    public void pickPhoneNotificationTone(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context unavailable");
            return;
        }
        try {
            String currentUri = call.getString("currentUri", "");
            String pickerTitle = call.getString("title", "نغمات الهاتف");

            Intent intent = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER);
            intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_NOTIFICATION);
            intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true);
            intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);
            intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, pickerTitle);

            if (currentUri != null && (currentUri.startsWith("content://") || currentUri.startsWith("file://"))) {
                try {
                    intent.putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, Uri.parse(currentUri));
                } catch (Exception ignored) {}
            } else {
                try {
                    Uri defaultUri = RingtoneManager.getActualDefaultRingtoneUri(context, RingtoneManager.TYPE_NOTIFICATION);
                    if (defaultUri != null) {
                        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, defaultUri);
                    }
                } catch (Exception ignored) {}
            }

            startActivityForResult(call, intent, "onRingtonePickerResult");
        } catch (Exception e) {
            call.reject("Could not open phone ringtone picker: " + e.getMessage());
        }
    }

    @ActivityCallback
    @SuppressWarnings("deprecation")
    private void onRingtonePickerResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        try {
            if (result == null || result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
                JSObject ret = new JSObject();
                ret.put("cancelled", true);
                call.resolve(ret);
                return;
            }

            Intent data = result.getData();
            Uri pickedUri = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                ? data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI, Uri.class)
                : data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI);

            if (pickedUri == null) {
                JSObject ret = new JSObject();
                ret.put("cancelled", false);
                ret.put("silent", true);
                ret.put("uri", "");
                ret.put("name", "بدون صوت");
                call.resolve(ret);
                return;
            }

            Context context = getContext();
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    context.getContentResolver().takePersistableUriPermission(pickedUri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                }
            } catch (Exception ignored) {}

            String toneName = "";
            try {
                Ringtone ringtone = RingtoneManager.getRingtone(context, pickedUri);
                if (ringtone != null) {
                    toneName = ringtone.getTitle(context);
                }
            } catch (Exception ignored) {}

            if (toneName == null || toneName.trim().isEmpty()) {
                SharedPreferences storage = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                boolean isArabic = !"en".equalsIgnoreCase(storage.getString("app_language", "ar"));
                toneName = isArabic ? "نغمة من الهاتف" : "Phone Tone";
            }

            String channelId = ensureCustomPhoneNotificationChannelInternal(context, pickedUri, toneName);

            JSObject ret = new JSObject();
            ret.put("cancelled", false);
            ret.put("silent", false);
            ret.put("uri", pickedUri.toString());
            ret.put("name", toneName.trim());
            ret.put("channelId", channelId);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to read picked ringtone: " + e.getMessage());
        }
    }

    @PluginMethod
    public void ensureCustomNotificationChannel(PluginCall call) {
        Context context = getContext();
        String uriStr = call.getString("uri", "");
        String name = call.getString("name", "");
        if (context == null || uriStr == null || uriStr.trim().isEmpty()) {
            JSObject ret = new JSObject();
            ret.put("channelId", "athkar_channel_v4_chime");
            call.resolve(ret);
            return;
        }
        try {
            Uri soundUri = Uri.parse(uriStr.trim());
            String channelId = ensureCustomPhoneNotificationChannelInternal(context, soundUri, name);
            JSObject ret = new JSObject();
            ret.put("channelId", channelId);
            call.resolve(ret);
        } catch (Exception e) {
            JSObject ret = new JSObject();
            ret.put("channelId", "athkar_channel_v4_chime");
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void setQuranPlaybackActive(PluginCall call) {
        boolean active = call.getBoolean("active", false);
        String title = call.getString("title", "");
        String subtitle = call.getString("subtitle", "");
        boolean isArabic = call.getBoolean("isArabic", true);
        Context context = getContext();
        if (context != null) {
            if (active) {
                QuranPlaybackKeepAliveService.startOrUpdate(context, title, subtitle, isArabic);
            } else {
                QuranPlaybackKeepAliveService.stopService(context);
            }
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("active", active);
        call.resolve(ret);
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

    @PluginMethod
    public void setAppLanguage(PluginCall call) {
        String language = call.getString("language", "ar");
        Context context = getContext();
        if (context == null) {
            call.resolve();
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        prefs.edit().putString("app_language", language).apply();

        applyAppLocale(context, language);

        if (context instanceof MainActivity) {
            final MainActivity activity = (MainActivity) context;
            activity.runOnUiThread(() -> {
                activity.createAdhanNotificationChannels("ar".equalsIgnoreCase(language));
                activity.updateDynamicShortcuts("ar".equalsIgnoreCase(language));
            });
        }

        PersistentPrayerNotification.update(context);
        PrayerWidgetProvider.updateAllWidgets(context);

        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("language", language);
        call.resolve(ret);
    }

    @PluginMethod
    public void getPendingShortcut(PluginCall call) {
        String target = MainActivity.pendingShortcut;
        long seq = MainActivity.pendingShortcutSeq;
        if (seq > 0 && seq <= MainActivity.lastConsumedShortcutSeq) {
            target = null;
        }
        MainActivity.pendingShortcut = null;
        try {
            SharedPreferences prefs = getContext().getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            if (target == null || target.isEmpty()) {
                long storedSeq = prefs.getLong("pending_shortcut_seq", 0L);
                if (storedSeq > 0 && storedSeq <= MainActivity.lastConsumedShortcutSeq) {
                    target = null;
                } else {
                    target = prefs.getString("pending_shortcut_target", null);
                    seq = storedSeq;
                }
            }
            prefs.edit()
                    .remove("pending_shortcut_target")
                    .remove("pending_shortcut_seq")
                    .apply();
        } catch (Exception ignored) {}

        if (seq > 0 && target != null && !target.isEmpty()) {
            MainActivity.lastConsumedShortcutSeq = Math.max(MainActivity.lastConsumedShortcutSeq, seq);
        }

        JSObject ret = new JSObject();
        ret.put("target", target != null ? target : "");
        ret.put("seq", seq);
        call.resolve(ret);
    }

    @PluginMethod
    public void markShortcutConsumed(PluginCall call) {
        long seq = call.hasOption("seq") ? call.getLong("seq", 0L) : 0L;
        MainActivity.clearPendingShortcutState(getContext(), seq);
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void setStatusBarStyle(PluginCall call) {
        boolean isDark = Boolean.TRUE.equals(call.getBoolean("isDark", false));
        Context context = getContext();
        if (context != null) {
            try {
                SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                if (prefs.getBoolean("status_bar_is_dark", false) != isDark) {
                    prefs.edit().putBoolean("status_bar_is_dark", isDark).apply();
                }
            } catch (Exception ignored) {}
        }

        if (getActivity() != null) {
            MainActivity.applyStatusBarStyle(getActivity(), isDark);
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("isDark", isDark);
        call.resolve(ret);
    }

    public static void applyAppLocale(Context context, String language) {
        if (context == null || language == null || language.trim().isEmpty()) return;
        try {
            java.util.Locale locale = new java.util.Locale(language.trim());
            java.util.Locale.setDefault(locale);

            android.content.res.Resources res = context.getResources();
            android.content.res.Configuration config = new android.content.res.Configuration(res.getConfiguration());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                config.setLocale(locale);
                config.setLayoutDirection(locale);
            } else {
                config.locale = locale;
            }
            res.updateConfiguration(config, res.getDisplayMetrics());

            Context appCtx = context.getApplicationContext();
            if (appCtx != null && appCtx != context) {
                android.content.res.Resources appRes = appCtx.getResources();
                android.content.res.Configuration appConfig = new android.content.res.Configuration(appRes.getConfiguration());
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                    appConfig.setLocale(locale);
                    appConfig.setLayoutDirection(locale);
                } else {
                    appConfig.locale = locale;
                }
                appRes.updateConfiguration(appConfig, appRes.getDisplayMetrics());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
