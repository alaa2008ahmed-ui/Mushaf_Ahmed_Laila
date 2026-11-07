/**
 * Helper to determine and persist the splash image based on the chosen theme.
 *
 * 5 Themes & Splash Images:
 * 1. الوضع الذهبي (Gold Mode - Default on first launch): /splash.jpg
 * 2. الوضع الليلي (Night Mode): /assets/splash/splash_night.jpg (Image 01)
 * 3. الوضع السماوي (Sky Mode): /assets/splash/splash_sky.jpg (Image 02)
 * 4. الوضع الزمردي (Emerald Mode): /assets/splash/splash_emerald.jpg (Image 03)
 * 5. الوضع العنابي (Burgundy Mode): /assets/splash/splash_burgundy.jpg (Image 04)
 */

export const THEME_SPLASH_IMAGES = {
  gold: '/splash.jpg',
  night: '/assets/splash/splash_night.jpg',
  sky: '/assets/splash/splash_sky.jpg',
  emerald: '/assets/splash/splash_emerald.jpg',
  burgundy: '/assets/splash/splash_burgundy.jpg',
} as const;

export type ThemeSplashKey = keyof typeof THEME_SPLASH_IMAGES;

/**
 * Returns the splash image path corresponding to the given theme state.
 * - isNight: true -> Night splash (01)
 * - variant: 'sky' -> Sky splash (02)
 * - variant: 'emerald' -> Emerald splash (03)
 * - variant: 'burgundy' -> Burgundy splash (04)
 * - default/gold -> Gold splash (/splash.jpg)
 */
export function getSplashImageForTheme(
  isNight: boolean,
  homeThemeVariant?: string | null
): string {
  if (isNight) {
    return THEME_SPLASH_IMAGES.night;
  }
  if (homeThemeVariant === 'sky') {
    return THEME_SPLASH_IMAGES.sky;
  }
  if (homeThemeVariant === 'emerald') {
    return THEME_SPLASH_IMAGES.emerald;
  }
  if (homeThemeVariant === 'burgundy') {
    return THEME_SPLASH_IMAGES.burgundy;
  }
  return THEME_SPLASH_IMAGES.gold;
}

/**
 * Synchronously reads the current theme from localStorage and returns the matching splash image.
 */
export function getCurrentSplashImage(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return THEME_SPLASH_IMAGES.gold;
  }
  try {
    const isNight =
      localStorage.getItem('night_mode_active_modern') === 'true' ||
      localStorage.getItem('night_mode_active') === 'true';
    const variant = localStorage.getItem('modern_home_theme_variant');
    return getSplashImageForTheme(isNight, variant);
  } catch {
    return THEME_SPLASH_IMAGES.gold;
  }
}

/**
 * Saves the active splash image path to localStorage so inline HTML scripts can access it instantly.
 */
export function syncCurrentSplashImage(
  isNight: boolean,
  homeThemeVariant?: string | null
): string {
  const url = getSplashImageForTheme(isNight, homeThemeVariant);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('current_splash_image', url);
    }
  } catch {}
  return url;
}
