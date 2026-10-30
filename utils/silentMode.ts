import { registerPlugin, Capacitor } from '@capacitor/core';

export interface SilentWindow {
  id: number;
  prayerKey: string;
  prayerName: string;
  startMillis: number;
  durationMinutes: number;
}

interface AutoSilentPluginInterface {
  checkDndPermission(): Promise<{ granted: boolean }>;
  requestDndPermission(): Promise<void>;
  setSilentNow(options: { silent: boolean; prayerName?: string }): Promise<{ success: boolean; isSilent: boolean }>;
  scheduleSilentWindows(options: { windows: SilentWindow[] }): Promise<{ success: boolean }>;
  cancelAllSilent(): Promise<{ success: boolean }>;
  updateWidget?(): Promise<{ success: boolean }>;
  updatePersistentNotification(): Promise<{ success: boolean }>;
  updateAlertsGroupSummary?(): Promise<{ success: boolean }>;
  setPersistentNotificationEnabled(options: { enabled: boolean }): Promise<{ success: boolean; enabled: boolean }>;
  checkBatteryOptimization(): Promise<{ isIgnoring: boolean }>;
  requestBatteryOptimization(): Promise<void>;
  openAppNotificationSettings?(): Promise<{ success: boolean }>;
  playTone(options: { path: string }): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string }>;
  stopTone(): Promise<{ success: boolean }>;
  setAppLanguage?(options: { language: string }): Promise<{ success: boolean; language: string }>;
  getPendingShortcut?(): Promise<{ target?: string; seq?: number }>;
  markShortcutConsumed?(options: { seq: number }): Promise<{ success: boolean }>;
}

export const AutoSilentMode = registerPlugin<AutoSilentPluginInterface>('AutoSilentMode');

/**
 * Checks if the app has Do Not Disturb (DND) / notification policy access on Android.
 * Always returns true on non-Android platforms.
 */
export const isDndPermissionGranted = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') return true;
  try {
    const res = await AutoSilentMode.checkDndPermission();
    return !!res.granted;
  } catch (e) {
    console.warn('checkDndPermission error:', e);
    return false;
  }
};

/**
 * Opens Android system settings for Do Not Disturb access so the user can grant permission.
 */
export const requestDndPermission = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    await AutoSilentMode.requestDndPermission();
  } catch (e) {
    console.warn('requestDndPermission error:', e);
  }
};

/**
 * Immediately toggles device silent/vibrate mode on Android.
 */
export const setDeviceSilentNow = async (silent: boolean, prayerName?: string): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') return true;
  try {
    const res = await AutoSilentMode.setSilentNow({ silent, prayerName });
    return !!res.success;
  } catch (e) {
    console.warn('setDeviceSilentNow error:', e);
    return false;
  }
};

/**
 * Schedules native exact alarms to mute and un-mute the phone at each prayer's silent window.
 */
export const scheduleDeviceSilentWindows = async (windows: SilentWindow[]): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    await AutoSilentMode.scheduleSilentWindows({ windows });
  } catch (e) {
    console.warn('scheduleDeviceSilentWindows error:', e);
  }
};

/**
 * Cancels all scheduled silent alarms and restores device ringer to normal.
 */
export const cancelAllDeviceSilentWindows = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    await AutoSilentMode.cancelAllSilent();
  } catch (e) {
    console.warn('cancelAllDeviceSilentWindows error:', e);
  }
};

/**
 * Triggers native persistent prayer notification update.
 */
export const updateNativePersistentNotification = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    await AutoSilentMode.updatePersistentNotification();
  } catch (e) {
    console.warn('updateNativePersistentNotification error:', e);
  }
};

/**
 * Updates the native alerts group summary card in the Android notification drawer.
 */
export const updateNativeAlertsGroupSummary = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    await AutoSilentMode.updateAlertsGroupSummary?.();
  } catch (e) {
    console.warn('updateNativeAlertsGroupSummary error:', e);
  }
};

/**
 * Enables or disables the native persistent prayer notification.
 */
export const setNativePersistentNotificationEnabled = async (enabled: boolean): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') return false;
  try {
    const res = await AutoSilentMode.setPersistentNotificationEnabled({ enabled });
    return !!res?.success;
  } catch (e) {
    console.warn('setNativePersistentNotificationEnabled error:', e);
    return false;
  }
};

/**
 * Checks whether the app is ignored from battery optimizations (Unrestricted background).
 */
export const checkNativeBatteryOptimization = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') return true;
  try {
    const res = await AutoSilentMode.checkBatteryOptimization();
    return !!res?.isIgnoring;
  } catch (e) {
    console.warn('checkNativeBatteryOptimization error:', e);
    return false;
  }
};

/**
 * Requests the user to ignore battery optimization (allows true background execution).
 */
export const requestNativeBatteryOptimization = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    await AutoSilentMode.requestBatteryOptimization();
  } catch (e) {
    console.warn('requestNativeBatteryOptimization error:', e);
  }
};

/**
 * Opens system notification settings for this app directly.
 */
export const openNativeNotificationSettings = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') return false;
  try {
    const res = await AutoSilentMode.openAppNotificationSettings?.();
    return !!res?.success;
  } catch (e) {
    console.warn('openNativeNotificationSettings error:', e);
    return false;
  }
};

/**
 * Plays a prayer alert tone natively on Android via MediaPlayer from res/raw or file.
 * Returns true if played natively, false if web fallback should handle it.
 */
export const playNativeTone = async (path: string): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') return false;
  try {
    const res = await AutoSilentMode.playTone({ path });
    return !!res?.success;
  } catch (e) {
    console.warn('playNativeTone error:', e);
    return false;
  }
};

/**
 * Stops any actively playing native tone on Android.
 */
export const stopNativeTone = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    await AutoSilentMode.stopTone();
  } catch (e) {
    console.warn('stopNativeTone error:', e);
  }
};

/**
 * Sets native application language in Android (updates LocaleManager, SharedPreferences,
 * PersistentPrayerNotification, and Widgets).
 */
export const setNativeAppLanguage = async (language: string): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    if (AutoSilentMode.setAppLanguage) {
      await AutoSilentMode.setAppLanguage({ language });
    }
  } catch (e) {
    console.warn('setNativeAppLanguage error:', e);
  }
};

export interface PendingShortcutResult {
  target: string;
  seq: number;
}

/**
 * Retrieves and clears any pending launcher/widget shortcut target from native Android storage.
 */
export const getPendingShortcutInfo = async (): Promise<PendingShortcutResult | null> => {
  if (Capacitor.getPlatform() !== 'android') return null;
  try {
    if (AutoSilentMode.getPendingShortcut) {
      const res = await AutoSilentMode.getPendingShortcut();
      if (res && res.target && res.target.trim()) {
        return {
          target: res.target.trim(),
          seq: typeof res.seq === 'number' ? res.seq : 0,
        };
      }
    }
    return null;
  } catch (e) {
    console.warn('getPendingShortcut error:', e);
    return null;
  }
};

export const getPendingShortcut = async (): Promise<string | null> => {
  const info = await getPendingShortcutInfo();
  return info ? info.target : null;
};

/**
 * Marks a shortcut sequence as consumed so native Android cancels any queued dispatches
 * and doesn't re-trigger it on resume.
 */
export const markNativeShortcutConsumed = async (seq?: number): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    if (AutoSilentMode.markShortcutConsumed) {
      await AutoSilentMode.markShortcutConsumed({ seq: seq || 0 });
    }
  } catch (e) {
    console.warn('markNativeShortcutConsumed error:', e);
  }
};


