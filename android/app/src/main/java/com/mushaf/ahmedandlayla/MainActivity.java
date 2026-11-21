package com.mushaf.ahmedandlayla;

import android.app.Activity;
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
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
    public static volatile String pendingShortcut = null;
    public static volatile long pendingShortcutSeq = 0L;
    public static volatile long lastConsumedShortcutSeq = 0L;
    private static volatile boolean currentStatusBarIsDark = false;
    private static volatile Boolean lastAppliedStatusBarIsDark = null;
    private static volatile int lastAppliedWindowHash = 0;
    private volatile float lastSafeTopCss = 0f;
    private volatile float lastSafeBottomCss = 0f;
    private volatile float appliedSafeTopCss = -1f;
    private volatile float appliedSafeBottomCss = -1f;
    private volatile float fallbackStatusBarCss = 0f;
    private volatile boolean initialInsetsCaptured = false;
    private int lastAdhanConsumedKeyCode = KeyEvent.KEYCODE_UNKNOWN;

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
        } else {
            try {
                getWindow().setBackgroundDrawableResource(R.drawable.splash_screen);
            } catch (Exception ignored) {}
        }

        // Pass genuine incomingIntent to super.onCreate so Capacitor's bridge captures getLaunchUrl and deep links
        super.onCreate(savedInstanceState);

        // Sanitize Activity intent AFTER super.onCreate so resume from recents doesn't re-trigger it
        if (incomingIntent != null && isShortcutOrDeepLinkIntent(incomingIntent)) {
            clearShortcutFromIntent(incomingIntent);
            setIntent(incomingIntent);
        }

        if (incomingIntent != null && incomingIntent.getBooleanExtra("stop_adhan_audio", false)) {
            AdhanPlaybackService.stopIfPlaying(this, false);
        }

        android.content.SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String appLang = prefs.getString("app_language", "ar");
        currentStatusBarIsDark = prefs.getBoolean("status_bar_is_dark", false);
        applyStatusBarStyle(this, currentStatusBarIsDark);
        AutoSilentPlugin.applyAppLocale(this, appLang);
        
        createAdhanNotificationChannels("ar".equalsIgnoreCase(appLang));
        updateDynamicShortcuts("ar".equalsIgnoreCase(appLang));
        DailyWirdAlarmReceiver.scheduleNextAlarms(this);
        AdhanAlarmReceiver.rescheduleSavedAlarms(this);
        PrayerSilentReceiver.rescheduleSavedIqamas(this);
        PrayerSilentReceiver.rescheduleSavedWindows(this);

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

            setupWindowInsetsBridge(this.bridge.getWebView());

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

    public static void applyStatusBarStyle(final Activity activity, final boolean isDarkTheme) {
        currentStatusBarIsDark = isDarkTheme;
        if (activity == null) return;
        final int windowHash = System.identityHashCode(activity);
        if (lastAppliedStatusBarIsDark != null
                && lastAppliedStatusBarIsDark.booleanValue() == isDarkTheme
                && lastAppliedWindowHash == windowHash) {
            return;
        }
        lastAppliedStatusBarIsDark = isDarkTheme;
        lastAppliedWindowHash = windowHash;

        activity.runOnUiThread(() -> {
            try {
                Window window = activity.getWindow();
                if (window == null) return;
                View decorView = window.getDecorView();
                if (decorView == null) return;

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    int winFlags = window.getAttributes().flags;
                    if ((winFlags & WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS) != 0) {
                        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
                    }
                    if ((winFlags & WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS) == 0) {
                        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                    }
                }

                // isAppearanceLightStatusBars(false) => WHITE icons (light content on black/dark theme)
                // isAppearanceLightStatusBars(true)  => BLACK icons (dark content on light themes)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);
                    if (controller != null) {
                        boolean wantLight = !isDarkTheme;
                        if (controller.isAppearanceLightStatusBars() != wantLight) {
                            controller.setAppearanceLightStatusBars(wantLight);
                        }
                        if (controller.isAppearanceLightNavigationBars() != wantLight) {
                            controller.setAppearanceLightNavigationBars(wantLight);
                        }
                    }
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    int currentFlags = decorView.getSystemUiVisibility();
                    int newFlags = currentFlags;
                    if (isDarkTheme) {
                        newFlags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    } else {
                        newFlags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        if (isDarkTheme) {
                            newFlags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                        } else {
                            newFlags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                        }
                    }
                    if (newFlags != currentFlags) {
                        decorView.setSystemUiVisibility(newFlags);
                    }
                }
            } catch (Exception ignored) {}
        });
    }

    private float resolveFallbackStatusBarCss() {
        try {
            float density = getResources().getDisplayMetrics().density;
            if (density <= 0f) density = 1f;
            int resId = getResources().getIdentifier("status_bar_height", "dimen", "android");
            if (resId > 0) {
                int px = getResources().getDimensionPixelSize(resId);
                if (px > 0) {
                    return px / density;
                }
            }
        } catch (Exception ignored) {}
        return 0f;
    }

    private void setupWindowInsetsBridge(android.webkit.WebView webView) {
        if (webView == null) return;
        fallbackStatusBarCss = resolveFallbackStatusBarCss();
        android.content.SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        float cachedTop = prefs.getFloat("native_safe_top_css_num", 0f);
        float cachedBottom = prefs.getFloat("native_safe_bottom_css_num", 0f);
        if (cachedTop > 0f) {
            lastSafeTopCss = cachedTop;
        } else if (fallbackStatusBarCss > 0f) {
            lastSafeTopCss = fallbackStatusBarCss;
        }
        if (cachedBottom > 0f) {
            lastSafeBottomCss = cachedBottom;
        }

        WindowInsetsCompat rootInsets = ViewCompat.getRootWindowInsets(webView);
        if (rootInsets != null) {
            Insets sysBars = rootInsets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            float density = getResources().getDisplayMetrics().density;
            if (density <= 0f) density = 1f;
            float topCss = Math.max(0f, sysBars.top / density);
            float bottomCss = Math.max(0f, sysBars.bottom / density);
            if (topCss > 0f) {
                lastSafeTopCss = topCss;
                initialInsetsCaptured = true;
            }
            if (bottomCss >= 0f) {
                lastSafeBottomCss = bottomCss;
            }
        }

        if (!initialInsetsCaptured) {
            ViewCompat.setOnApplyWindowInsetsListener(webView, (v, windowInsets) -> {
                if (!initialInsetsCaptured) {
                    Insets sysBars = windowInsets.getInsets(
                        WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
                    );
                    float density = getResources().getDisplayMetrics().density;
                    if (density <= 0f) density = 1f;
                    float topCss = Math.max(0f, sysBars.top / density);
                    float bottomCss = Math.max(0f, sysBars.bottom / density);
                    if (topCss > 0f || fallbackStatusBarCss <= 0f) {
                        lastSafeTopCss = topCss;
                    }
                    lastSafeBottomCss = bottomCss;
                    initialInsetsCaptured = true;
                    applyNativeSafeAreaCssVars(false);
                    // Detach listener after capturing initial insets once so window insets are never re-processed continuously
                    ViewCompat.setOnApplyWindowInsetsListener(v, null);
                }
                return ViewCompat.onApplyWindowInsets(v, windowInsets);
            });
        }
        applyNativeSafeAreaCssVars(true);
    }

    private void applyNativeSafeAreaCssVars(boolean force) {
        if (!force
            && Math.abs(lastSafeTopCss - appliedSafeTopCss) < 0.5f
            && Math.abs(lastSafeBottomCss - appliedSafeBottomCss) < 0.5f) {
            return;
        }
        appliedSafeTopCss = lastSafeTopCss;
        appliedSafeBottomCss = lastSafeBottomCss;

        try {
            if (lastSafeTopCss > 0f) {
                getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)
                    .edit()
                    .putFloat("native_safe_top_css_num", lastSafeTopCss)
                    .putFloat("native_safe_bottom_css_num", lastSafeBottomCss)
                    .apply();
            }
        } catch (Exception ignored) {}

        final String topVal = String.format(java.util.Locale.US, "%.2fpx", lastSafeTopCss);
        final String bottomVal = String.format(java.util.Locale.US, "%.2fpx", lastSafeBottomCss);
        final String js = "(function(){" +
            "var r=document.documentElement;" +
            "if(r&&r.style){" +
            "if(r.style.getPropertyValue('--native-safe-top')!=='" + topVal + "'){r.style.setProperty('--native-safe-top','" + topVal + "');}" +
            "if(r.style.getPropertyValue('--native-safe-bottom')!=='" + bottomVal + "'){r.style.setProperty('--native-safe-bottom','" + bottomVal + "');}" +
            "try{if(" + (lastSafeTopCss > 0f ? "true" : "false") + "){localStorage.setItem('native_safe_top_css','" + topVal + "');localStorage.setItem('native_safe_bottom_css','" + bottomVal + "');}}catch(e){}" +
            "}" +
            "})();";
        runOnUiThread(() -> {
            try {
                if (this.bridge != null && this.bridge.getWebView() != null) {
                    this.bridge.getWebView().evaluateJavascript(js, null);
                }
            } catch (Exception ignored) {}
        });
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
    public void onPause() {
        super.onPause();
        if (QuranPlaybackKeepAliveService.isPlaybackActive() && this.bridge != null && this.bridge.getWebView() != null) {
            try {
                this.bridge.getWebView().onResume();
                this.bridge.getWebView().resumeTimers();
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        try {
            unregisterReceiver(timeTickReceiver);
        } catch (Exception ignored) {}
        if (QuranPlaybackKeepAliveService.isPlaybackActive() && this.bridge != null && this.bridge.getWebView() != null) {
            try {
                this.bridge.getWebView().onResume();
                this.bridge.getWebView().resumeTimers();
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onDestroy() {
        if (isFinishing()) {
            QuranPlaybackKeepAliveService.stopService(this);
        }
        if (lastAppliedWindowHash == System.identityHashCode(this)) {
            lastAppliedStatusBarIsDark = null;
            lastAppliedWindowHash = 0;
        }
        super.onDestroy();
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
        PrayerSilentReceiver.reconcileState(this);
        AutoSilentPlugin.notifySilentStateChanged(this);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event != null) {
            int keyCode = event.getKeyCode();
            if (event.getAction() == KeyEvent.ACTION_DOWN) {
                if (AdhanPlaybackService.isPlaying()) {
                    AdhanPlaybackService.stopIfPlaying(this, false);
                    lastAdhanConsumedKeyCode = keyCode;
                    return true;
                }
            } else if (event.getAction() == KeyEvent.ACTION_UP && keyCode == lastAdhanConsumedKeyCode) {
                lastAdhanConsumedKeyCode = KeyEvent.KEYCODE_UNKNOWN;
                return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        if (intent != null && intent.getBooleanExtra("stop_adhan_audio", false)) {
            AdhanPlaybackService.stopIfPlaying(this, false);
        }
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
                "pre_adhan_v3_chime_channel",
                "iqama_reminder_channel",
                "iqama_alarm_channel",
                "iqama_v3_chime_channel",
                "iqama_v4_chime_channel",
                "prayer_silent_channel",
                "prayer_silent_v3_chime_channel",
                "prayer_silent_v4_chime_channel",
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
                "general_alerts_summary_channel_v1",
                "athkar_channel_v4_silent",
                "adhan_v5_silent",
                "iqama_v4_silent_channel",
                "prayer_silent_v4_silent_channel"
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

                // Short gentle droplet alerts (Preparation, Iqama, Silent Mode) and chime alerts (Night, Athkar, Wird, Habits)
                {"pre_adhan_v4_droplet_channel", isArabic ? "تنبيه الاستعداد للصلاة" : "Prayer Preparation Alert", "notif_droplet"},
                {"iqama_v5_droplet_channel", isArabic ? "تنبيه إقامة الصلاة" : "Prayer Iqama Alert", "notif_droplet"},
                {"prayer_silent_v5_droplet_channel", isArabic ? "الصامت التلقائي للصلاة" : "Auto Silent Mode", "notif_droplet"},
                {"night_times_v3_chime_channel", isArabic ? "تنبيهات أوقات الليل" : "Night Times Reminders", "chime"},
                {"sunrise_duha_v1_chime_channel", isArabic ? "تنبيهات الشروق وصلاة الضحى" : "Sunrise & Duha Alerts", "chime"},
                {"athkar_v3_chime_channel", isArabic ? "أذكار وتنبيهات عامة" : "General Adhkar & Reminders", "chime"},
                {"daily_wird_reminders_channel", isArabic ? "تنبيهات الورد القرآني" : "Daily Wird Reminders", "chime"},
                {"daily_wird_reminder_channel", isArabic ? "تنبيهات الورد اليومي" : "Daily Wird Reminders", "chime"},
                {"habit_tracker_channel", isArabic ? "تذكير العادات والسنن" : "Habit Tracker Reminders", "chime"},
                {"athkar_reminders_chime_channel", isArabic ? "تذكير العادات ومربي العبادات" : "Habit Tracker Reminders", "chime"},

                // Dedicated Adhkar & Reminders tone channels (v4)
                {"athkar_channel_v4_chime", isArabic ? "تنبيهات وأذكار (رنين هادئ)" : "Reminders (Chime)", "chime"},
                {"athkar_channel_v4_notif_bell", isArabic ? "تنبيهات وأذكار (جرس لطيف)" : "Reminders (Bell)", "notif_bell"},
                {"athkar_channel_v4_notif_crystal", isArabic ? "تنبيهات وأذكار (بلورات نقية)" : "Reminders (Crystal)", "notif_crystal"},
                {"athkar_channel_v4_notif_droplet", isArabic ? "تنبيهات وأذكار (قطرة ماء)" : "Reminders (Droplet)", "notif_droplet"},
                {"athkar_channel_v4_notif_harpeggio", isArabic ? "تنبيهات وأذكار (وتر هادئ)" : "Reminders (Harpeggio)", "notif_harpeggio"},
                {"athkar_channel_v4_notif_subtle", isArabic ? "تنبيهات وأذكار (تنبيه خفيف)" : "Reminders (Subtle)", "notif_subtle"},
                {"athkar_channel_v4_notif_marimba", isArabic ? "تنبيهات وأذكار (نغمة خشبية)" : "Reminders (Marimba)", "notif_marimba"},
                {"athkar_channel_v5_silent", isArabic ? "تنبيهات وأذكار (بدون صوت)" : "Reminders (Silent)", "none"},

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
                    NotificationVibrationHelper.configureChannelVibration(
                        channel,
                        id.startsWith("adhan_")
                            ? NotificationVibrationHelper.ADHAN_VIBRATION_PATTERN
                            : NotificationVibrationHelper.ALERT_VIBRATION_PATTERN
                    );
                    channel.enableLights(true);
                    channel.setShowBadge(false); // Disabling badge prevents continuous "1" on launcher icon

                    if (rawSound != null && !"none".equals(rawSound)) {
                        int resId = getResources().getIdentifier(rawSound, "raw", getPackageName());
                        if (resId != 0) {
                            Uri soundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/" + resId);
                            channel.setSound(soundUri, alarmAudioAttributes);
                        }
                    } else {
                        channel.setSound(null, null);
                    }

                    nm.createNotificationChannel(channel);
                } catch (Exception ignored) {}
            }

            // Silent Adhan channel (used when Adhan or volume preset is muted)
            try {
                NotificationChannel silentChan = new NotificationChannel(
                    "adhan_v6_silent",
                    isArabic ? "أذان الصلوات (بدون صوت)" : "Prayer Adhan (Silent)",
                    NotificationManager.IMPORTANCE_HIGH
                );
                silentChan.setDescription(isArabic ? "إشعار الأذان بدون صوت مع أيقونة بالشريط العلوي" : "Silent Adhan notification with status bar icon");
                silentChan.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                silentChan.setBypassDnd(true);
                NotificationVibrationHelper.configureChannelVibration(
                    silentChan,
                    NotificationVibrationHelper.ADHAN_VIBRATION_PATTERN
                );
                silentChan.enableLights(true);
                silentChan.setShowBadge(false);
                silentChan.setSound(null, null);
                nm.createNotificationChannel(silentChan);
            } catch (Exception ignored) {}

            // Volume-controlled Adhan visual notification channel (audio handled by AdhanPlaybackService)
            AdhanPlaybackService.ensureVisualChannel(this, isArabic);
            // Auto-silent chime & silent notification channels
            PrayerSilentReceiver.ensureChannels(this, nm, isArabic);
        }
    }
}
