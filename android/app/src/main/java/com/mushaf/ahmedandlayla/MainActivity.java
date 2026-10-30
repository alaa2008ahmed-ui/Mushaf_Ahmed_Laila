package com.mushaf.ahmedandlayla;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
    public static volatile String pendingShortcut = null;
    public static volatile long pendingShortcutSeq = 0L;
    public static volatile long lastConsumedShortcutSeq = 0L;

    private static synchronized long nextShortcutSeq() {
        long now = System.currentTimeMillis();
        if (now <= pendingShortcutSeq) {
            pendingShortcutSeq = pendingShortcutSeq + 1;
        } else {
            pendingShortcutSeq = now;
        }
        return pendingShortcutSeq;
    }

    private final BroadcastReceiver timeTickReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            PersistentPrayerNotification.update(context);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AutoSilentPlugin.class);

        Intent incomingIntent = getIntent();
        String coldTarget = extractShortcutTarget(incomingIntent);
        long coldSeq = 0L;

        if (coldTarget != null) {
            coldSeq = nextShortcutSeq();
            pendingShortcut = coldTarget;
            savePendingShortcutPrefs(coldTarget, coldSeq);
        }

        // Pass genuine incomingIntent to super.onCreate so Capacitor's bridge captures getLaunchUrl and deep links
        super.onCreate(savedInstanceState);

        // Sanitize Activity intent AFTER super.onCreate so resume from recents doesn't re-trigger it
        if (incomingIntent != null && isShortcutOrDeepLinkIntent(incomingIntent)) {
            clearShortcutFromIntent(incomingIntent);
            setIntent(incomingIntent);
        }

        android.content.SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String appLang = prefs.getString("app_language", "ar");
        AutoSilentPlugin.applyAppLocale(this, appLang);
        
        createAdhanNotificationChannels("ar".equalsIgnoreCase(appLang));
        updateDynamicShortcuts("ar".equalsIgnoreCase(appLang));
        DailyWirdAlarmReceiver.scheduleNextAlarms(this);

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

            if (coldTarget != null) {
                final String targetToDispatch = coldTarget;
                final long seqToDispatch = coldSeq;
                long[] delays = new long[]{ 300, 700, 1200, 2000, 3200 };
                for (long delay : delays) {
                    this.bridge.getWebView().postDelayed(() -> dispatchShortcutToWebView(targetToDispatch, seqToDispatch), delay);
                }
            }
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        try {
            IntentFilter filter = new IntentFilter();
            filter.addAction(Intent.ACTION_TIME_TICK);
            filter.addAction(Intent.ACTION_SCREEN_ON);
            registerReceiver(timeTickReceiver, filter);
        } catch (Exception ignored) {}
    }

    @Override
    public void onStop() {
        super.onStop();
        try {
            unregisterReceiver(timeTickReceiver);
        } catch (Exception ignored) {}
    }

    @Override
    public void onResume() {
        super.onResume();
        // NOTE: Never re-process getIntent() or re-dispatch shortcuts in onResume()!
        // Resuming from background/Recents must always keep the user on the exact page they left.
        android.content.SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String appLang = prefs.getString("app_language", "ar");
        AutoSilentPlugin.applyAppLocale(this, appLang);
        PersistentPrayerNotification.update(this);
        AlertsGroupHelper.updateGroupSummary(this, (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE));
        updateDynamicShortcuts("ar".equalsIgnoreCase(appLang));
        DailyWirdAlarmReceiver.scheduleNextAlarms(this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        String warmTarget = extractShortcutTarget(intent);
        long warmSeq = 0L;

        if (warmTarget != null) {
            warmSeq = nextShortcutSeq();
            pendingShortcut = warmTarget;
            savePendingShortcutPrefs(warmTarget, warmSeq);
        }

        // Pass genuine intent to super.onNewIntent so Capacitor's AppPlugin fires appUrlOpen!
        super.onNewIntent(intent);

        // Sanitize Activity intent AFTER super.onNewIntent has notified plugins
        if (intent != null && isShortcutOrDeepLinkIntent(intent)) {
            clearShortcutFromIntent(intent);
            setIntent(intent);
        }

        if (warmTarget != null) {
            final String targetToDispatch = warmTarget;
            final long seqToDispatch = warmSeq;
            dispatchShortcutToWebView(targetToDispatch, seqToDispatch);
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().postDelayed(() -> dispatchShortcutToWebView(targetToDispatch, seqToDispatch), 80);
                this.bridge.getWebView().postDelayed(() -> dispatchShortcutToWebView(targetToDispatch, seqToDispatch), 250);
                this.bridge.getWebView().postDelayed(() -> dispatchShortcutToWebView(targetToDispatch, seqToDispatch), 600);
            }
        }
    }

    private void savePendingShortcutPrefs(String target, long seq) {
        try {
            android.content.SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            prefs.edit()
                    .putString("pending_shortcut_target", target)
                    .putLong("pending_shortcut_seq", seq)
                    .apply();
        } catch (Exception ignored) {}
    }

    public static void clearPendingShortcutState(Context context, long consumedSeq) {
        if (consumedSeq > 0) {
            lastConsumedShortcutSeq = Math.max(lastConsumedShortcutSeq, consumedSeq);
        }
        if (consumedSeq <= 0 || pendingShortcutSeq <= consumedSeq) {
            pendingShortcut = null;
        }
        if (context != null) {
            try {
                android.content.SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                prefs.edit()
                        .remove("pending_shortcut_target")
                        .remove("pending_shortcut_seq")
                        .apply();
            } catch (Exception ignored) {}
        }
    }

    private boolean isShortcutOrDeepLinkIntent(Intent intent) {
        if (intent == null) return false;
        if (intent.hasExtra("shortcut_target") || intent.hasExtra("route")
                || intent.hasExtra("android.intent.extra.shortcut.ID") || intent.hasExtra("shortcut_id")) {
            return true;
        }
        Uri data = intent.getData();
        if (data != null && "com.mushaf.ahmedandlayla".equalsIgnoreCase(data.getScheme())) {
            return true;
        }
        return false;
    }

    private void clearShortcutFromIntent(Intent intent) {
        if (intent == null) return;
        try {
            intent.setData(null);
            if (Intent.ACTION_VIEW.equals(intent.getAction())) {
                intent.setAction(Intent.ACTION_MAIN);
            }
            intent.removeExtra("shortcut_target");
            intent.removeExtra("route");
            intent.removeExtra("android.intent.extra.shortcut.ID");
            intent.removeExtra("shortcut_id");
        } catch (Exception ignored) {}
    }

    private void dispatchShortcutToWebView(final String target, final long seq) {
        if (target == null || target.isEmpty()) return;
        if (seq > 0 && seq <= lastConsumedShortcutSeq) return;

        final String safeTarget = target.replace("'", "\\'");
        final String js = "(function() {" +
                "  var t = '" + safeTarget + "';" +
                "  var s = " + seq + ";" +
                "  if (typeof window.handleNativeShortcut === 'function') {" +
                "    return window.handleNativeShortcut(t, s);" +
                "  } else {" +
                "    window.__pendingShortcut = { target: t, seq: s };" +
                "    try { localStorage.setItem('pending_shortcut_target', t); localStorage.setItem('pending_shortcut_seq', String(s)); } catch(e){}" +
                "    window.dispatchEvent(new CustomEvent('nativeShortcutTriggered', { detail: { target: t, seq: s } }));" +
                "    return 'queued';" +
                "  }" +
                "})();";

        runOnUiThread(() -> {
            try {
                if (seq > 0 && seq <= lastConsumedShortcutSeq) return;
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().evaluateJavascript(js, value -> {
                        if (value != null && value.contains("handled")) {
                            clearPendingShortcutState(MainActivity.this, seq);
                        }
                    });
                }
            } catch (Exception ignored) {}
        });
    }

    private String extractShortcutTarget(Intent intent) {
        if (intent == null) return null;
        String target = null;

        if (intent.hasExtra("shortcut_target")) {
            target = intent.getStringExtra("shortcut_target");
        } else if (intent.hasExtra("route")) {
            target = intent.getStringExtra("route");
        } else if (intent.hasExtra("android.intent.extra.shortcut.ID")) {
            target = intent.getStringExtra("android.intent.extra.shortcut.ID");
        } else if (intent.hasExtra("shortcut_id")) {
            target = intent.getStringExtra("shortcut_id");
        }

        if (target == null && intent.getData() != null) {
            Uri data = intent.getData();
            String host = data.getHost();
            String path = data.getPath();
            String ssp = data.getSchemeSpecificPart();
            if (host != null && !host.isEmpty()) {
                target = host;
            } else if (path != null && !path.isEmpty()) {
                target = path.replace("/", "");
            } else if (ssp != null && !ssp.isEmpty()) {
                target = ssp.replace("/", "");
            }
        }

        if (target == null && intent.getDataString() != null) {
            String ds = intent.getDataString().toLowerCase();
            if (ds.contains("quran")) target = "quran";
            else if (ds.contains("prayer") || ds.contains("salah") || ds.contains("times")) target = "prayer-times";
            else if (ds.contains("qibla")) target = "qibla";
            else if (ds.contains("seerah")) target = "prophetic-seerah";
            else if (ds.contains("hisn") || ds.contains("azkar") || ds.contains("athkar")) target = "hisn-muslim";
            else if (ds.contains("wird")) target = "daily-wird";
            else if (ds.contains("calendar")) target = "calendar";
            else if (ds.contains("home")) target = "home";
        }

        if (target != null && !target.trim().isEmpty()) {
            target = target.toLowerCase().trim();
            if (target.contains("quran")) target = "quran";
            else if (target.contains("prayer") || target.contains("salah") || target.contains("times")) target = "prayer-times";
            else if (target.contains("qibla")) target = "qibla";
            else if (target.contains("seerah")) target = "prophetic-seerah";
            else if (target.contains("hisn") || target.contains("azkar") || target.contains("athkar")) target = "hisn-muslim";
            else if (target.contains("wird")) target = "daily-wird";
            else if (target.contains("calendar")) target = "calendar";
            else if (target.contains("home")) target = "home";
            return target;
        }
        return null;
    }

    public void updateDynamicShortcuts(boolean isArabic) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
            try {
                android.content.pm.ShortcutManager shortcutManager = getSystemService(android.content.pm.ShortcutManager.class);
                if (shortcutManager == null) return;
                // Remove all shortcuts from the long-press launcher menu as requested
                shortcutManager.removeAllDynamicShortcuts();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        android.content.SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String appLang = prefs.getString("app_language", "ar");
        AutoSilentPlugin.applyAppLocale(this, appLang);
        PersistentPrayerNotification.update(this);
    }

    public void createAdhanNotificationChannels() {
        android.content.SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String appLang = prefs.getString("app_language", "ar");
        createAdhanNotificationChannels("ar".equalsIgnoreCase(appLang));
    }

    public void createAdhanNotificationChannels(boolean isArabic) {
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
                "prayer_silent_v3_chime_channel",
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
                "adhan_v4_salah", "adhan_v4_shahadah", "adhan_v4_silent",
                "persistent_prayer_channel_v1",
                "persistent_prayer_channel_v2",
                "persistent_prayer_channel_v3",
                "persistent_prayer_channel_v4",
                "prayer_alerts_summary_channel_v1",
                "general_alerts_summary_channel_v1"
            };
            for (String oldId : legacyChannels) {
                try {
                    nm.deleteNotificationChannel(oldId);
                } catch (Exception ignored) {}
            }
            PersistentPrayerNotification.createChannel(this, isArabic);

            AudioAttributes alarmAudioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                .build();

            String[][] channels = new String[][]{
                // Adhan tones (v5)
                {"adhan_v5_takbeer1", isArabic ? "أذان الصلوات (تكبيرات 1)" : "Prayer Adhan (Takbeer 1)", "takbeer1"},
                {"adhan_v5_takbeer2", isArabic ? "أذان الصلوات (تكبيرات 2)" : "Prayer Adhan (Takbeer 2)", "takbeer2"},
                {"adhan_v5_takbeer3", isArabic ? "أذان الصلوات (تكبيرات 3)" : "Prayer Adhan (Takbeer 3)", "takbeer3"},
                {"adhan_v5_takbeer4", isArabic ? "أذان الصلوات (تكبيرات 4)" : "Prayer Adhan (Takbeer 4)", "takbeer4"},
                {"adhan_v5_takbeer5", isArabic ? "أذان الصلوات (تكبيرات 5)" : "Prayer Adhan (Takbeer 5)", "takbeer5"},
                {"adhan_v5_takbeer6", isArabic ? "أذان الصلوات (تكبيرات 6)" : "Prayer Adhan (Takbeer 6)", "takbeer6"},
                {"adhan_v5_azan1", isArabic ? "أذان الصلوات (أذان 1)" : "Prayer Adhan (Adhan 1)", "azan1"},
                {"adhan_v5_azan2", isArabic ? "أذان الصلوات (أذان 2)" : "Prayer Adhan (Adhan 2)", "azan2"},
                {"adhan_v5_azan3", isArabic ? "أذان الصلوات (أذان 3)" : "Prayer Adhan (Adhan 3)", "azan3"},
                {"adhan_v5_azan4", isArabic ? "أذان الصلوات (أذان 4)" : "Prayer Adhan (Adhan 4)", "azan4"},
                {"adhan_v5_shahadah", isArabic ? "أذان الصلوات (الشهادة)" : "Prayer Adhan (Shahadah)", "shahadah"},
                {"adhan_v5_salah", isArabic ? "أذان الصلوات (الصلاة)" : "Prayer Adhan (Salah)", "salah"},

                // Short gentle chime alerts (Preparation, Iqama, Silent Mode, Night, Athkar, Wird, Habits)
                {"pre_adhan_v3_chime_channel", isArabic ? "تنبيه الاستعداد للصلاة" : "Prayer Preparation Alert", "chime"},
                {"iqama_v4_chime_channel", isArabic ? "تنبيه إقامة الصلاة" : "Prayer Iqama Alert", "chime"},
                {"prayer_silent_v4_chime_channel", isArabic ? "الصامت التلقائي للصلاة" : "Auto Silent Mode", "chime"},
                {"night_times_v3_chime_channel", isArabic ? "تنبيهات أوقات الليل" : "Night Times Reminders", "chime"},
                {"athkar_v3_chime_channel", isArabic ? "أذكار وتنبيهات عامة" : "General Adhkar & Reminders", "chime"},
                {"daily_wird_reminders_channel", isArabic ? "تنبيهات الورد القرآني" : "Daily Wird Reminders", "chime"},
                {"daily_wird_reminder_channel", isArabic ? "تنبيهات الورد اليومي" : "Daily Wird Reminders", "chime"},
                {"habit_tracker_channel", isArabic ? "تذكير العادات والسنن" : "Habit Tracker Reminders", "chime"},
                {"athkar_reminders_chime_channel", isArabic ? "تذكير العادات ومربي العبادات" : "Habit Tracker Reminders", "chime"},

                // Islamic Occasions
                {"islamic_eid_channel", isArabic ? "تكبيرات وأعياد المسلمين" : "Eid Takbeers", "takbeer1"},
                {"islamic_mawlid_channel", isArabic ? "المولد النبوي الشريف" : "Prophet Birthday Remembrance", "salah"},
                {"islamic_newyear_channel", isArabic ? "رأس السنة الهجرية" : "Islamic New Year", "takbeer1"},
                {"islamic_ramadan_channel", isArabic ? "مناسبات شهر رمضان" : "Ramadan Occasions", "takbeer1"}
            };

            for (String[] ch : channels) {
                try {
                    String id = ch[0];
                    String name = ch[1];
                    String rawSound = ch[2];

                    NotificationChannel channel = new NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH);
                    channel.setDescription(isArabic ? "تنبيه مع أيقونة بالشريط العلوي وصوت مخصص" : "High priority alert with status bar icon");
                    channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                    channel.setBypassDnd(true);
                    channel.enableVibration(true);
                    channel.enableLights(true);
                    channel.setShowBadge(false); // Disabling badge prevents continuous "1" on launcher icon

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
                    isArabic ? "أذان الصلوات (بدون صوت)" : "Prayer Adhan (Silent)",
                    NotificationManager.IMPORTANCE_HIGH
                );
                silentChan.setDescription(isArabic ? "إشعار الأذان بدون صوت مع أيقونة بالشريط العلوي" : "Silent Adhan notification with status bar icon");
                silentChan.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                silentChan.enableVibration(false);
                silentChan.setShowBadge(false);
                nm.createNotificationChannel(silentChan);
            } catch (Exception ignored) {}
        }
    }
}
