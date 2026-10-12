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
}

const AutoSilentMode = registerPlugin<AutoSilentPluginInterface>('AutoSilentMode');

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
