import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { AutoSilentMode } from './silentMode';

let lastAppliedTheme: string | null = null;
let lastAppliedStatusBarIsDark: boolean | null = null;
let lastSyncedThemeColor: string | null = null;
let isSplashFullscreenActive = false;

/**
 * Enables or disables edge-to-edge immersive fullscreen during the initial launch splash screen,
 * hiding both the top status bar and bottom navigation bar on mobile so only the splash image shows.
 */
export function setSplashFullscreenMode(fullscreen: boolean): void {
  isSplashFullscreenActive = fullscreen;

  if (typeof document !== 'undefined') {
    try {
      const root = document.documentElement;
      const body = document.body;
      if (fullscreen) {
        root.classList.add('splash-fullscreen-active');
        body?.classList.add('splash-fullscreen-active');
        const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement | null;
        if (appleMeta) appleMeta.content = 'black-translucent';
      } else {
        root.classList.remove('splash-fullscreen-active');
        body?.classList.remove('splash-fullscreen-active');
        lastAppliedTheme = null;
        lastAppliedStatusBarIsDark = null;
      }
    } catch {}
  }

  if (!Capacitor.isNativePlatform()) {
    return;
  }

  if (
    Capacitor.getPlatform() === 'android' &&
    AutoSilentMode &&
    typeof AutoSilentMode.setSplashFullscreen === 'function'
  ) {
    try {
      void AutoSilentMode.setSplashFullscreen({ fullscreen }).catch(() => {});
    } catch {}
    return;
  }

  try {
    if (fullscreen) {
      void SystemBars.hide().catch(() => {});
    } else {
      void SystemBars.show().catch(() => {});
    }
  } catch {}
}

/**
 * Synchronizes the native Android/iOS status bar & navigation bar icon colors
 * and browser/PWA theme-color metadata with the active app theme.
 * Runs only once at startup and when the effective theme actually changes.
 *
 * - isDarkTheme = true  (Black / Night / Dark theme) -> WHITE icons (light content / SystemBarsStyle.Dark)
 * - isDarkTheme = false (All Light themes)           -> BLACK icons (dark content  / SystemBarsStyle.Light)
 */
export function syncSystemStatusBar(
  isDarkTheme: boolean,
  lightThemeColor = '#FFFFFF',
  themeIdentifier?: string
): void {
  const targetColor = isDarkTheme ? '#000000' : (lightThemeColor || '#FFFFFF');
  const nextThemeKey = `${themeIdentifier || ''}|${isDarkTheme ? 'dark' : 'light'}|${targetColor}`;

  if (lastAppliedTheme === nextThemeKey && lastAppliedStatusBarIsDark === isDarkTheme) {
    return;
  }
  lastAppliedTheme = nextThemeKey;

  if (typeof document !== 'undefined') {
    try {
      if (lastSyncedThemeColor !== targetColor || lastAppliedStatusBarIsDark !== isDarkTheme) {
        let themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
        if (!themeMeta) {
          themeMeta = document.createElement('meta');
          themeMeta.name = 'theme-color';
          document.head.appendChild(themeMeta);
        }
        if (themeMeta.content !== targetColor) {
          themeMeta.content = targetColor;
        }

        let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement | null;
        if (!appleMeta) {
          appleMeta = document.createElement('meta');
          appleMeta.name = 'apple-mobile-web-app-status-bar-style';
          document.head.appendChild(appleMeta);
        }
        const targetAppleStyle = isSplashFullscreenActive || isDarkTheme ? 'black-translucent' : 'default';
        if (appleMeta.content !== targetAppleStyle) {
          appleMeta.content = targetAppleStyle;
        }

        const targetScheme = isDarkTheme ? 'dark' : 'light';
        if (document.documentElement.style.colorScheme !== targetScheme) {
          document.documentElement.style.colorScheme = targetScheme;
        }
        lastSyncedThemeColor = targetColor;
      }
    } catch {
      // Ignore DOM metadata errors in restricted environments
    }
  }

  if (isSplashFullscreenActive) {
    return;
  }

  if (lastAppliedStatusBarIsDark === isDarkTheme) {
    return;
  }
  lastAppliedStatusBarIsDark = isDarkTheme;

  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // On Android, use our unified guarded native handler (updates both Status Bar & Navigation Bar once).
  // Calling both SystemBars.setStyle and AutoSilentMode.setStatusBarStyle simultaneously causes window flag flicker on older Honor/Android ROMs.
  if (
    Capacitor.getPlatform() === 'android' &&
    AutoSilentMode &&
    typeof AutoSilentMode.setStatusBarStyle === 'function'
  ) {
    try {
      void AutoSilentMode.setStatusBarStyle({ isDark: isDarkTheme }).catch(() => {});
    } catch {
      // AutoSilentMode fallback unavailable
    }
    return;
  }

  try {
    const targetStyle = isDarkTheme ? SystemBarsStyle.Dark : SystemBarsStyle.Light;
    void SystemBars.setStyle({ style: targetStyle }).catch(() => {});
  } catch {
    // SystemBars plugin unavailable on older shells
  }
}
