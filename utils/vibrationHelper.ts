import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

export type AlertVibrationKind = 'alert' | 'adhan';

const ALERT_PATTERN = [280, 120, 280];
const ADHAN_PATTERN = [420, 160, 420];

let lastVibrationAt = 0;

/**
 * Triggers a distinct haptic/hardware vibration when an app notification or alert is displayed.
 * Includes a short cooldown to prevent double-firing when a native notification and modal open simultaneously.
 */
export async function triggerAlertVibration(kind: AlertVibrationKind = 'alert'): Promise<void> {
  const now = Date.now();
  if (now - lastVibrationAt < 650) {
    return;
  }
  lastVibrationAt = now;

  const isAdhan = kind === 'adhan';
  const primaryDuration = isAdhan ? 420 : 280;
  const gapDuration = isAdhan ? 160 : 120;
  const pattern = isAdhan ? ADHAN_PATTERN : ALERT_PATTERN;

  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.vibrate({ duration: primaryDuration });
      window.setTimeout(() => {
        Haptics.vibrate({ duration: primaryDuration }).catch(() => {});
      }, primaryDuration + gapDuration);
      return;
    } catch {
      // Fallback to Web Vibration API below
    }
  }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore vibration errors on unsupported platforms
  }
}
