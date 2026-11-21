package com.mushaf.ahmedandlayla;

import android.app.NotificationChannel;
import android.content.Context;
import android.media.AudioAttributes;
import android.os.Build;
import android.os.VibrationAttributes;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.util.Log;

public final class NotificationVibrationHelper {

    private static final String TAG = "NotifVibrationHelper";

    public static final long[] ALERT_VIBRATION_PATTERN = new long[]{0L, 280L, 120L, 280L};
    public static final long[] ADHAN_VIBRATION_PATTERN = new long[]{0L, 420L, 160L, 420L};

    private NotificationVibrationHelper() {
    }

    public static void configureChannelVibration(NotificationChannel channel, long[] pattern) {
        if (channel == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        long[] effectivePattern = (pattern != null && pattern.length > 0) ? pattern : ALERT_VIBRATION_PATTERN;
        try {
            channel.enableVibration(true);
            channel.setVibrationPattern(effectivePattern);
        } catch (Throwable t) {
            Log.w(TAG, "Failed to configure channel vibration", t);
        }
    }

    public static void vibrateAlert(Context context) {
        vibrate(context, ALERT_VIBRATION_PATTERN, false);
    }

    public static void vibrateAdhan(Context context) {
        vibrate(context, ADHAN_VIBRATION_PATTERN, true);
    }

    public static void vibrate(Context context, long[] pattern, boolean isAlarm) {
        if (context == null) return;
        long[] effectivePattern = (pattern != null && pattern.length > 0) ? pattern : ALERT_VIBRATION_PATTERN;

        try {
            Vibrator vibrator = getVibrator(context);
            if (vibrator == null || !vibrator.hasVibrator()) {
                return;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                VibrationEffect effect = VibrationEffect.createWaveform(effectivePattern, -1);
                VibrationAttributes attrs = new VibrationAttributes.Builder()
                        .setUsage(isAlarm ? VibrationAttributes.USAGE_ALARM : VibrationAttributes.USAGE_NOTIFICATION)
                        .build();
                vibrator.vibrate(effect, attrs);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                VibrationEffect effect = VibrationEffect.createWaveform(effectivePattern, -1);
                AudioAttributes attrs = new AudioAttributes.Builder()
                        .setUsage(isAlarm ? AudioAttributes.USAGE_ALARM : AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build();
                vibrator.vibrate(effect, attrs);
            } else {
                vibrateLegacy(vibrator, effectivePattern);
            }
        } catch (Throwable t) {
            Log.w(TAG, "Failed to vibrate device for notification", t);
        }
    }

    @SuppressWarnings("deprecation")
    private static Vibrator getVibrator(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vm = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return vm != null ? vm.getDefaultVibrator() : null;
        }
        return (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
    }

    @SuppressWarnings("deprecation")
    private static void vibrateLegacy(Vibrator vibrator, long[] pattern) {
        vibrator.vibrate(pattern, -1);
    }
}
