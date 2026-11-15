export interface AppNotificationSettings {
  quarter: boolean;
  juz: boolean;
  sajda: boolean;
  themes: boolean;
  downloads: boolean;
  bookmarks: boolean;
  general: boolean;
}

export const DEFAULT_APP_NOTIFICATION_SETTINGS: AppNotificationSettings = {
  quarter: true,
  juz: true,
  sajda: true,
  themes: true,
  downloads: true,
  bookmarks: true,
  general: true,
};

export const APP_NOTIFICATION_STORAGE_KEY = 'notification_settings';
export const APP_NOTIFICATION_CHANGE_EVENT = 'notification-settings-change';
export const APP_GLOBAL_TOAST_EVENT = 'app-global-toast';

export function getAppNotificationSettings(): AppNotificationSettings {
  try {
    const saved = localStorage.getItem(APP_NOTIFICATION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        quarter: parsed.quarter !== false,
        juz: parsed.juz !== false,
        sajda: parsed.sajda !== false,
        themes: parsed.themes !== false,
        downloads: parsed.downloads !== false,
        bookmarks: parsed.bookmarks !== false,
        general: parsed.general !== false,
      };
    }
  } catch (e) {
    console.error('Error parsing notification settings', e);
  }
  return { ...DEFAULT_APP_NOTIFICATION_SETTINGS };
}

export function saveAppNotificationSettings(settings: AppNotificationSettings): void {
  try {
    localStorage.setItem(APP_NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event(APP_NOTIFICATION_CHANGE_EVENT));
  } catch (e) {
    console.error('Error saving notification settings', e);
  }
}

export type ToastCategory = 'themes' | 'downloads' | 'bookmarks' | 'copy' | 'general';

export function getToastCategory(message: string): ToastCategory {
  const msg = (message || '').toLowerCase();

  const isTheme =
    message.includes('ثيم') ||
    message.includes('الشفافية') ||
    message.includes('لون التحديد') ||
    message.includes('لون النص') ||
    message.includes('لون الخلفية') ||
    message.includes('الوضع الذهبي') ||
    message.includes('الوضع الليلي') ||
    message.includes('الوضع الليلى') ||
    message.includes('الوضع السماوي') ||
    message.includes('الوضع السماوى') ||
    message.includes('الوضع الزمردي') ||
    message.includes('الوضع الزمردى') ||
    message.includes('الوضع العنابي') ||
    msg.includes('theme') ||
    msg.includes('transparency') ||
    msg.includes('highlight color') ||
    msg.includes('text color') ||
    msg.includes('background color') ||
    msg.includes('gold mode') ||
    msg.includes('night mode') ||
    msg.includes('sky mode') ||
    msg.includes('emerald mode') ||
    msg.includes('burgundy mode');

  if (isTheme) return 'themes';

  const isDownload =
    message.includes('تحميل') ||
    message.includes('محملة مسبقاً') ||
    msg.includes('download');

  if (isDownload) return 'downloads';

  const isBookmark =
    message.includes('الإشارة المرجعية') ||
    message.includes('الإشارات المرجعية') ||
    message.includes('إشارة مرجعية') ||
    message.includes('فاصل') ||
    msg.includes('bookmark');

  if (isBookmark) return 'bookmarks';

  const isCopy = message.includes('نسخ') || msg.includes('copied');
  if (isCopy) return 'copy';

  return 'general';
}

export function shouldShowAppToast(message: string): boolean {
  const settings = getAppNotificationSettings();
  const category = getToastCategory(message);

  if (category === 'themes') return settings.themes !== false;
  if (category === 'downloads') return settings.downloads !== false;
  if (category === 'bookmarks') return settings.bookmarks !== false;
  if (category === 'copy') return true;
  return settings.general !== false;
}

export function showGlobalAppToast(message: string): void {
  if (!message || !shouldShowAppToast(message)) return;
  window.dispatchEvent(
    new CustomEvent(APP_GLOBAL_TOAST_EVENT, { detail: { message } })
  );
}
