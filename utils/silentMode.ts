import { registerPlugin, Capacitor, PluginListenerHandle } from '@capacitor/core';

export interface SilentWindow {
  id: number;
  prayerKey: string;
  prayerName: string;
  startMillis: number;
  durationMinutes: number;
  title?: string;
  body?: string;
  shouldPlayChime?: boolean;
  isArabic?: boolean;
}

export interface SilentStatus {
  isSilentActive: boolean;
  manuallyRestored: boolean;
  isDeviceMuted: boolean;
  ringerMode: number;
  activeWindowId: number;
  activePrayerKey: string;
  activePrayerName: string;
  activeStartMillis: number;
  activeEndMillis: number;
  restoredWindowStartMillis: number;
}

export interface ScheduledAdhanAlarm {
  id: number;
  prayerKey: string;
  title: string;
  body: string;
  triggerAtMillis: number;
  soundName: string;
  soundUri?: string;
  playSound: boolean;
  isArabic: boolean;
}

export interface ScheduledIqamaAlarm {
  id: number;
  prayerKey: string;
  title: string;
  body: string;
  triggerAtMillis: number;
  playSound: boolean;
  isArabic: boolean;
}

interface AutoSilentPluginInterface {
  checkDndPermission(): Promise<{ granted: boolean }>;
  requestDndPermission(): Promise<void>;
  setSilentNow(options: { silent: boolean; prayerName?: string }): Promise<{ success: boolean; isSilent: boolean }>;
  scheduleSilentWindows(options: { windows: SilentWindow[] }): Promise<{ success: boolean }>;
  cancelAllSilent(): Promise<{ success: boolean }>;
  manualRestoreSound?(options?: { startMillis?: number; windowId?: number }): Promise<SilentStatus & { success: boolean }>;
  getSilentStatus?(): Promise<SilentStatus>;
  addListener?(eventName: 'silentStateChanged', listenerFunc: (status: SilentStatus) => void): Promise<PluginListenerHandle>;
  addListener?(eventName: 'quranPlaybackStopped', listenerFunc: () => void): Promise<PluginListenerHandle>;
  addListener?(eventName: 'tonePlaybackEnded', listenerFunc: () => void): Promise<PluginListenerHandle>;
  addListener?(eventName: 'adhanPlaybackStateChanged', listenerFunc: (data: { isPlaying: boolean }) => void): Promise<PluginListenerHandle>;
  scheduleAdhanAlarms?(options: { alarms: ScheduledAdhanAlarm[] }): Promise<{ success: boolean; count?: number }>;
  cancelAdhanAlarms?(): Promise<{ success: boolean }>;
  scheduleIqamaAlarms?(options: { alarms: ScheduledIqamaAlarm[] }): Promise<{ success: boolean; count?: number }>;
  cancelIqamaAlarms?(): Promise<{ success: boolean }>;
  updateWidget?(): Promise<{ success: boolean }>;
  updatePersistentNotification(): Promise<{ success: boolean }>;
  updateAlertsGroupSummary?(): Promise<{ success: boolean }>;
  setPersistentNotificationEnabled(options: { enabled: boolean }): Promise<{ success: boolean; enabled: boolean }>;
  checkBatteryOptimization(): Promise<{ isIgnoring: boolean }>;
  requestBatteryOptimization(): Promise<void>;
  openAppNotificationSettings?(): Promise<{ success: boolean }>;
  openLocationSettings?(): Promise<{ success: boolean; error?: string }>;
  setAlertVolume?(options: { volume: number }): Promise<{ success: boolean; volume: number }>;
  playTone(options: { path: string; volume?: number }): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string; volume?: number }>;
  stopTone(): Promise<{ success: boolean }>;
  setQuranPlaybackActive?(options: { active: boolean; title?: string; subtitle?: string; isArabic?: boolean }): Promise<{ success: boolean; active: boolean }>;
  setAppLanguage?(options: { language: string }): Promise<{ success: boolean; language: string }>;
  getPendingShortcut?(): Promise<{ target?: string; seq?: number }>;
  markShortcutConsumed?(options: { seq: number }): Promise<{ success: boolean }>;
  setStatusBarStyle?(options: { isDark: boolean }): Promise<{ success: boolean; isDark: boolean }>;
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
 * Schedules native AlarmManager exact alarms for prayer Adhans on Android so playback
 * runs through AdhanPlaybackService using the user's selected alert_volume.
 */
export const scheduleNativeAdhanAlarms = async (alarms: ScheduledAdhanAlarm[]): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    if (AutoSilentMode.scheduleAdhanAlarms) {
      await AutoSilentMode.scheduleAdhanAlarms({ alarms });
    }
  } catch (e) {
    console.warn('scheduleNativeAdhanAlarms error:', e);
  }
};

/**
 * Cancels all natively scheduled Adhan alarms and stops any active Adhan playback.
 */
export const cancelNativeAdhanAlarms = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    if (AutoSilentMode.cancelAdhanAlarms) {
      await AutoSilentMode.cancelAdhanAlarms();
    }
  } catch (e) {
    console.warn('cancelNativeAdhanAlarms error:', e);
  }
};

/**
 * Schedules native AlarmManager clock alarms for prayer Iqama reminders on Android so they
 * fire accurately at T=0 without Doze cooldown throttling.
 */
export const scheduleNativeIqamaAlarms = async (alarms: ScheduledIqamaAlarm[]): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    if (AutoSilentMode.scheduleIqamaAlarms) {
      await AutoSilentMode.scheduleIqamaAlarms({ alarms });
    }
  } catch (e) {
    console.warn('scheduleNativeIqamaAlarms error:', e);
  }
};

/**
 * Cancels all natively scheduled Iqama alarms.
 */
export const cancelNativeIqamaAlarms = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    if (AutoSilentMode.cancelIqamaAlarms) {
      await AutoSilentMode.cancelIqamaAlarms();
    }
  } catch (e) {
    console.warn('cancelNativeIqamaAlarms error:', e);
  }
};

/**
 * Manually restores device sound and marks user_manually_restored = true so that
 * the end-of-silent notification and chime do not fire when the window expires.
 */
export const manualRestoreDeviceSound = async (options?: { startMillis?: number; windowId?: number }): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') return true;
  try {
    if (AutoSilentMode.manualRestoreSound) {
      const res = await AutoSilentMode.manualRestoreSound(options);
      return !!res?.success;
    }
    await AutoSilentMode.setSilentNow({ silent: false });
    return true;
  } catch (e) {
    console.warn('manualRestoreDeviceSound error:', e);
    return false;
  }
};

/**
 * Reads the authoritative native auto-silent status and real hardware AudioManager ringer mode on Android.
 */
export const getNativeSilentStatus = async (): Promise<SilentStatus | null> => {
  if (Capacitor.getPlatform() !== 'android') return null;
  try {
    if (AutoSilentMode.getSilentStatus) {
      return await AutoSilentMode.getSilentStatus();
    }
    return null;
  } catch (e) {
    console.warn('getNativeSilentStatus error:', e);
    return null;
  }
};

/**
 * Subscribes to real-time native auto-silent / ringer mode state changes on Android.
 */
export const addNativeSilentStateListener = async (
  listener: (status: SilentStatus) => void
): Promise<PluginListenerHandle | null> => {
  if (Capacitor.getPlatform() !== 'android') return null;
  try {
    if (AutoSilentMode.addListener) {
      return await AutoSilentMode.addListener('silentStateChanged', listener);
    }
    return null;
  } catch (e) {
    console.warn('addNativeSilentStateListener error:', e);
    return null;
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
 * Sets native prayer alert volume on Android (0% - 100%) stored in SharedPreferences.
 * Used for native MediaPlayer playback without altering device ringer/notification streams.
 */
export const setNativeAlertVolume = async (volume: number): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') return true;
  try {
    if (AutoSilentMode.setAlertVolume) {
      const clamped = Math.max(0, Math.min(100, Math.round(volume)));
      const res = await AutoSilentMode.setAlertVolume({ volume: clamped });
      return !!res?.success;
    }
    return true;
  } catch (e) {
    console.warn('setNativeAlertVolume error:', e);
    return false;
  }
};

/**
 * Plays a prayer alert tone natively on Android via MediaPlayer from res/raw or file.
 * Returns true if played natively, false if web fallback should handle it.
 */
export const playNativeTone = async (path: string, volume?: number): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') return false;
  try {
    const res = await AutoSilentMode.playTone({ path, volume });
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

/**
 * Starts/updates or stops the Android MediaPlayback foreground service
 * so ListenQuran audio continues reliably when the app is minimized.
 */
export const setNativeQuranPlaybackActive = async (
  active: boolean,
  title?: string,
  subtitle?: string,
  isArabic: boolean = true
): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    if (AutoSilentMode.setQuranPlaybackActive) {
      await AutoSilentMode.setQuranPlaybackActive({
        active,
        title: title || '',
        subtitle: subtitle || '',
        isArabic,
      });
    }
  } catch (e) {
    console.warn('setNativeQuranPlaybackActive error:', e);
  }
};

export const addNativeQuranStopListener = async (
  listener: () => void
): Promise<PluginListenerHandle | null> => {
  if (Capacitor.getPlatform() !== 'android') return null;
  try {
    if (AutoSilentMode.addListener) {
      return await AutoSilentMode.addListener('quranPlaybackStopped', listener);
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const addNativeToneEndedListener = async (
  listener: () => void
): Promise<PluginListenerHandle | null> => {
  if (Capacitor.getPlatform() !== 'android') return null;
  try {
    if (AutoSilentMode.addListener) {
      return await AutoSilentMode.addListener('tonePlaybackEnded', listener);
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const addNativeAdhanStateListener = async (
  listener: (data: { isPlaying: boolean }) => void
): Promise<PluginListenerHandle | null> => {
  if (Capacitor.getPlatform() !== 'android') return null;
  try {
    if (AutoSilentMode.addListener) {
      return await AutoSilentMode.addListener('adhanPlaybackStateChanged', listener);
    }
    return null;
  } catch (e) {
    return null;
  }
};


