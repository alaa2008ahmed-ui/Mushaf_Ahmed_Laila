package com.mushaf.ahmedandlayla;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AutoSilentPlugin.class);
        super.onCreate(savedInstanceState);
        
        createAdhanNotificationChannels();

        // Preserve all Capacitor BridgeWebChromeClient capabilities (file chooser, camera, photo gallery)
        // while ensuring native Android permissions are requested if not already granted.
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
            this.bridge.getWebView().setWebChromeClient(new BridgeWebChromeClient(this.bridge) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            String[] resources = request.getResources();
                            java.util.List<String> neededPermissions = new java.util.ArrayList<>();
                            for (String res : resources) {
                                if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) {
                                    if (checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                                        neededPermissions.add(android.Manifest.permission.RECORD_AUDIO);
                                    }
                                } else if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(res)) {
                                    if (checkSelfPermission(android.Manifest.permission.CAMERA) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                                        neededPermissions.add(android.Manifest.permission.CAMERA);
                                    }
                                }
                            }
                            if (!neededPermissions.isEmpty()) {
                                requestPermissions(neededPermissions.toArray(new String[0]), 103);
                            }
                        }
                        request.grant(request.getResources());
                    });
                }
            });
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        PersistentPrayerNotification.update(this);
    }

    private void createAdhanNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm == null) return;

            // Delete legacy channels so new audio & alarm settings take effect cleanly
            String[] legacyChannels = new String[]{
                "pre_adhan_reminder_channel",
                "pre_adhan_alarm_channel",
                "iqama_reminder_channel",
                "iqama_alarm_channel",
                "iqama_v3_chime_channel",
                "prayer_silent_channel",
                "night_times_channel",
                "night_times_alarm_channel",
                "athkar_reminders_channel",
                "athkar_reminders_alarm_channel",
                "adhan_v3_takbeer1", "adhan_v3_takbeer2", "adhan_v3_takbeer3",
                "adhan_v3_takbeer4", "adhan_v3_takbeer5", "adhan_v3_takbeer6",
                "adhan_v3_azan1", "adhan_v3_azan2", "adhan_v3_azan3", "adhan_v3_azan4",
                "adhan_v3_salah", "adhan_v3_shahadah", "adhan_v3_silent",
                "adhan_v4_takbeer1", "adhan_v4_takbeer2", "adhan_v4_takbeer3",
                "adhan_v4_takbeer4", "adhan_v4_takbeer5", "adhan_v4_takbeer6",
                "adhan_v4_azan1", "adhan_v4_azan2", "adhan_v4_azan3", "adhan_v4_azan4",
                "adhan_v4_salah", "adhan_v4_shahadah", "adhan_v4_silent"
            };
            for (String oldId : legacyChannels) {
                try {
                    nm.deleteNotificationChannel(oldId);
                } catch (Exception ignored) {}
            }

            AudioAttributes alarmAudioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                .build();

            String[][] channels = new String[][]{
                // Adhan tones (v5)
                {"adhan_v5_takbeer1", "أذان الصلوات (تكبيرات 1)", "takbeer1"},
                {"adhan_v5_takbeer2", "أذان الصلوات (تكبيرات 2)", "takbeer2"},
                {"adhan_v5_takbeer3", "أذان الصلوات (تكبيرات 3)", "takbeer3"},
                {"adhan_v5_takbeer4", "أذان الصلوات (تكبيرات 4)", "takbeer4"},
                {"adhan_v5_takbeer5", "أذان الصلوات (تكبيرات 5)", "takbeer5"},
                {"adhan_v5_takbeer6", "أذان الصلوات (تكبيرات 6)", "takbeer6"},
                {"adhan_v5_azan1", "أذان الصلوات (أذان 1)", "azan1"},
                {"adhan_v5_azan2", "أذان الصلوات (أذان 2)", "azan2"},
                {"adhan_v5_azan3", "أذان الصلوات (أذان 3)", "azan3"},
                {"adhan_v5_azan4", "أذان الصلوات (أذان 4)", "azan4"},
                {"adhan_v5_shahadah", "أذان الصلوات (الشهادة)", "shahadah"},
                {"adhan_v5_salah", "أذان الصلوات (الصلاة)", "salah"},

                // Short gentle chime alerts (Preparation, Iqama, Silent Mode, Night, Athkar)
                {"pre_adhan_v3_chime_channel", "تنبيه الاستعداد للصلاة", "chime"},
                {"iqama_v4_chime_channel", "تنبيه إقامة الصلاة", "chime"},
                {"prayer_silent_v3_chime_channel", "الصامت التلقائي للصلاة", "chime"},
                {"night_times_v3_chime_channel", "تنبيهات أوقات الليل", "chime"},
                {"athkar_v3_chime_channel", "أذكار وتنبيهات عامة", "chime"}
            };

            for (String[] ch : channels) {
                try {
                    String id = ch[0];
                    String name = ch[1];
                    String rawSound = ch[2];

                    NotificationChannel channel = new NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH);
                    channel.setDescription("تنبيه بصوت مخصص يعمل مع قفل الشاشة");
                    channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                    channel.setBypassDnd(true);
                    channel.enableVibration(true);
                    channel.enableLights(true);

                    int resId = getResources().getIdentifier(rawSound, "raw", getPackageName());
                    if (resId != 0) {
                        Uri soundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/" + resId);
                        channel.setSound(soundUri, alarmAudioAttributes);
                    }

                    nm.createNotificationChannel(channel);
                } catch (Exception ignored) {}
            }

            // Silent Adhan channel
            try {
                NotificationChannel silentChan = new NotificationChannel(
                    "adhan_v5_silent",
                    "أذان الصلوات (بدون صوت)",
                    NotificationManager.IMPORTANCE_HIGH
                );
                silentChan.setDescription("إشعار الأذان بدون صوت");
                silentChan.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                silentChan.enableVibration(false);
                nm.createNotificationChannel(silentChan);
            } catch (Exception ignored) {}
        }
    }
}
