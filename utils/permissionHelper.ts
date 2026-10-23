import { Capacitor, registerPlugin } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

interface AutoSilentPlugin {
  checkDndPermission(): Promise<{ granted: boolean }>;
  requestDndPermission(): Promise<void>;
  openAppSettings(): Promise<void>;
  setSilentNow(options: { silent: boolean; prayerName?: string }): Promise<void>;
}

const AutoSilentMode = registerPlugin<AutoSilentPlugin>('AutoSilentMode');

/**
 * Open the native Android / OS application settings page directly
 * where the user can manage all permissions with one tap.
 */
export const openAppSettings = async (): Promise<boolean> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await AutoSilentMode.openAppSettings();
      return true;
    } catch (e) {
      console.warn('Could not open app settings via AutoSilentMode:', e);
    }
  }
  return false;
};

/**
 * Request Microphone permission in-app.
 * On native Android / iOS, invokes VoiceRecorder.requestAudioRecordingPermission()
 * which automatically displays the system permission dialog directly inside the app.
 * On web, invokes navigator.mediaDevices.getUserMedia({ audio: true }).
 */
export const requestMicrophonePermission = async (): Promise<{ granted: boolean; error?: string }> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // 1. Check if already granted
      try {
        const hasPerm = await VoiceRecorder.hasAudioRecordingPermission();
        if (hasPerm && hasPerm.value) {
          return { granted: true };
        }
      } catch (e) {
        console.warn('hasAudioRecordingPermission check error:', e);
      }

      // 2. Request permission directly through Capacitor plugin (opens Android OS dialog)
      const req = await VoiceRecorder.requestAudioRecordingPermission();
      if (req && req.value) {
        return { granted: true };
      }
      return { granted: false, error: 'تم رفض إذن الميكروفون' };
    } else {
      // Web / Browser platform
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return { granted: false, error: 'المتصفح لا يدعم تسجيل الصوت أو لا يتوفر ميكروفون' };
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop stream immediately so microphone indicator turns off until recording starts
      stream.getTracks().forEach(t => t.stop());
      return { granted: true };
    }
  } catch (err: any) {
    console.warn('requestMicrophonePermission error:', err);
    const errName = err?.name || '';
    const errMsg = err?.message?.toLowerCase() || '';
    if (
      errName === 'NotAllowedError' ||
      errName === 'PermissionDeniedError' ||
      errMsg.includes('denied') ||
      errMsg.includes('not allowed')
    ) {
      return { granted: false, error: 'تم رفض إذن الميكروفون' };
    }
    return { granted: false, error: err?.message || 'تعذر الوصول إلى الميكروفون' };
  }
};

/**
 * Quick non-blocking check whether microphone permission is currently granted.
 */
export const checkMicrophonePermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await VoiceRecorder.hasAudioRecordingPermission();
      return Boolean(res && res.value);
    } else if (navigator.permissions && navigator.permissions.query) {
      const res = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return res.state === 'granted';
    }
  } catch (e) {
    // Ignore query failure
  }
  return false;
};

/**
 * Request Local Notifications permission in-app.
 */
export const requestNotificationPermission = async (): Promise<{ granted: boolean }> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return { granted: true };
      const req = await LocalNotifications.requestPermissions();
      return { granted: req.display === 'granted' };
    } else if ('Notification' in window) {
      const res = await Notification.requestPermission();
      return { granted: res === 'granted' };
    }
  } catch (e) {
    console.warn('requestNotificationPermission error:', e);
  }
  return { granted: false };
};

/**
 * Request Geolocation / GPS permission in-app.
 */
export const requestLocationPermission = async (): Promise<{ granted: boolean }> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await Geolocation.checkPermissions();
      if (status.location === 'granted') return { granted: true };
      const req = await Geolocation.requestPermissions();
      return { granted: req.location === 'granted' };
    } else if (navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve({ granted: true }),
          () => resolve({ granted: false }),
          { timeout: 8000 }
        );
      });
    }
  } catch (e) {
    console.warn('requestLocationPermission error:', e);
  }
  return { granted: false };
};

/**
 * Request Camera permission in-app.
 */
export const requestCameraPermission = async (): Promise<{ granted: boolean }> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await Camera.checkPermissions();
      if (status.camera === 'granted') return { granted: true };
      const req = await Camera.requestPermissions({ permissions: ['camera'] });
      return { granted: req.camera === 'granted' };
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      return { granted: true };
    }
  } catch (e) {
    console.warn('requestCameraPermission error:', e);
  }
  return { granted: false };
};

/**
 * Request Speech Recognition permission in-app.
 */
export const requestSpeechRecognitionPermission = async (): Promise<{ granted: boolean }> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await SpeechRecognition.checkPermissions();
      if (status.speechRecognition === 'granted') return { granted: true };
      const req = await SpeechRecognition.requestPermissions();
      return { granted: req.speechRecognition === 'granted' };
    }
    return { granted: true };
  } catch (e) {
    console.warn('requestSpeechRecognitionPermission error:', e);
  }
  return { granted: false };
};
