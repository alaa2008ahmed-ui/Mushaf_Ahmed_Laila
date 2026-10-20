const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../public/assets/audio');
const DEST_DIR = path.join(__dirname, '../android/app/src/main/res/raw');

async function prepareAudio() {
    console.log('--- Starting Audio Preparation ---');
    
    if (!fs.existsSync(SOURCE_DIR)) {
        console.log(`Creating directory: ${SOURCE_DIR}`);
        fs.mkdirSync(SOURCE_DIR, { recursive: true });
    }

    try {
        if (!fs.existsSync(DEST_DIR)) {
            fs.mkdirSync(DEST_DIR, { recursive: true });
        }
        
        const files = fs.readdirSync(SOURCE_DIR);
        files.forEach(file => {
            if (file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg')) {
                const sourcePath = path.join(SOURCE_DIR, file);
                let destFilename = file.toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_.]/g, '');
                    
                if (/^\d/.test(destFilename)) {
                    destFilename = 'sound_' + destFilename;
                }

                const destPath = path.join(DEST_DIR, destFilename);
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied: ${file} -> res/raw/${destFilename}`);
            }
        });
    } catch (e) {
        console.warn(`Warning: Could not copy to Android dir. This is normal if the Android platform is not added yet.`);
    }
    
    // Ensure Capacitor LocalNotifications plugin retains wake lock and alarm attributes
    patchCapacitorNotifications();

    console.log('--- Audio Preparation Complete ---');
}

function patchCapacitorNotifications() {
    try {
        const chanMgrPath = path.join(__dirname, '../node_modules/@capacitor/local-notifications/android/src/main/java/com/capacitorjs/plugins/localnotifications/NotificationChannelManager.java');
        if (fs.existsSync(chanMgrPath)) {
            let content = fs.readFileSync(chanMgrPath, 'utf8');
            if (content.includes('AudioAttributes.USAGE_NOTIFICATION')) {
                content = content.replace(
                    '.setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)\n                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)\n                    .build()',
                    '.setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)\n                    .setUsage(AudioAttributes.USAGE_ALARM)\n                    .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)\n                    .build()'
                );
                fs.writeFileSync(chanMgrPath, content, 'utf8');
                console.log('Patched NotificationChannelManager with USAGE_ALARM');
            }
        }

        const pubPath = path.join(__dirname, '../node_modules/@capacitor/local-notifications/android/src/main/java/com/capacitorjs/plugins/localnotifications/TimedNotificationPublisher.java');
        if (fs.existsSync(pubPath)) {
            let pubContent = fs.readFileSync(pubPath, 'utf8');
            
            // Generate full clean content for TimedNotificationPublisher
            const newPubContent = `package com.capacitorjs.plugins.localnotifications;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Class used to create notification from timer event with background wake lock & direct alarm playback
 */
public class TimedNotificationPublisher extends BroadcastReceiver {

    public static String NOTIFICATION_KEY = "NotificationPublisher.notification";
    public static String CRON_KEY = "NotificationPublisher.cron";

    @Override
    public void onReceive(Context context, Intent intent) {
        // [MushafDirectMediaPlayer] Ensure wake lock is held during alarm presentation
        android.os.PowerManager pm = (android.os.PowerManager) context.getSystemService(Context.POWER_SERVICE);
        android.os.PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            try {
                wakeLock = pm.newWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, "Mushaf:AdhanWakeLock");
                wakeLock.acquire(120000); // 2 minutes wake lock for full adhan & reminders
            } catch (Exception ignored) {}
        }

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        Notification notification;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notification = intent.getParcelableExtra(NOTIFICATION_KEY, Notification.class);
        } else {
            notification = getParcelableExtraLegacy(intent, NOTIFICATION_KEY);
        }

        if (notification != null) {
            notification.when = System.currentTimeMillis();
            notification.flags |= Notification.FLAG_AUTO_CANCEL;
            notification.flags |= Notification.FLAG_SHOW_LIGHTS;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                notification.visibility = Notification.VISIBILITY_PUBLIC;
                notification.priority = Notification.PRIORITY_MAX;
                notification.category = Notification.CATEGORY_ALARM;
            }
        }

        int id = intent.getIntExtra(LocalNotificationManager.NOTIFICATION_INTENT_KEY, Integer.MIN_VALUE);
        if (id == Integer.MIN_VALUE) {
            Logger.error(Logger.tags("LN"), "No valid id supplied", null);
        }
        NotificationStorage storage = new NotificationStorage(context);
        JSObject notificationJson = storage.getSavedNotificationAsJSObject(Integer.toString(id));
        LocalNotificationsPlugin.fireReceived(notificationJson);
        
        if (notification != null) {
            notificationManager.notify(id, notification);
        }

        // Release wake lock safely after notification dispatch
        if (wakeLock != null && wakeLock.isHeld()) {
            try { wakeLock.release(); } catch (Exception ignored) {}
        }

        if (!rescheduleNotificationIfNeeded(context, intent, id)) {
            storage.deleteNotification(Integer.toString(id));
        }
    }

    @SuppressWarnings("deprecation")
    private Notification getParcelableExtraLegacy(Intent intent, String string) {
        return intent.getParcelableExtra(NOTIFICATION_KEY);
    }

    private boolean rescheduleNotificationIfNeeded(Context context, Intent intent, int id) {
        String dateString = intent.getStringExtra(CRON_KEY);

        if (dateString != null) {
            DateMatch date = DateMatch.fromMatchString(dateString);
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

            long trigger = date.nextTrigger(new Date());
            Intent clone = (Intent) intent.clone();
            int flags = PendingIntent.FLAG_CANCEL_CURRENT;
            if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                flags = flags | PendingIntent.FLAG_MUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getBroadcast(context, id, clone, flags);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                Logger.warn(
                    "Capacitor/LocalNotification",
                    "Exact alarms not allowed in user settings. Notification scheduled with non-exact alarm."
                );
                alarmManager.set(AlarmManager.RTC, trigger, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC, trigger, pendingIntent);
            }
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            Logger.debug(Logger.tags("LN"), "notification " + id + " will next fire at " + sdf.format(new Date(trigger)));
            return true;
        }

        return false;
    }
}
`;
            fs.writeFileSync(pubPath, newPubContent, 'utf8');
            console.log('Patched TimedNotificationPublisher with direct MediaPlayer, WakeLock and VISIBILITY_PUBLIC');
        }
    } catch (e) {
        console.warn('Could not patch Capacitor notifications:', e);
    }
}

prepareAudio();
