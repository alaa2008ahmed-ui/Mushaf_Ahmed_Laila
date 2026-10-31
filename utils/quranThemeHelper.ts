import { THEMES } from '../components/QuranReader/constants';

export type QuranLayoutMode = 'classic' | 'modern';

export function getQuranLayoutMode(navParams?: any): QuranLayoutMode {
  if (navParams?.from === 'modern_home') return 'modern';
  if (navParams?.from === 'classic_home') return 'classic';
  try {
    const saved = localStorage.getItem('home_layout_system');
    return saved === 'classic' ? 'classic' : 'modern';
  } catch {
    return 'modern';
  }
}

export function isNightModeForLayout(layout: 'classic' | 'modern'): boolean {
  try {
    const key = `night_mode_active_${layout}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) return saved === 'true';
    if (layout === 'classic') return false;
    return localStorage.getItem('night_mode_active') === 'true';
  } catch {
    return false;
  }
}

export function getQuranThemeIdForLayout(modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): string {
  const layout = getQuranLayoutMode(navParams);
  const isNight = isNightModeForLayout(layout);
  const mKey = readingMode || 'mushaf';

  if (isNight) {
    const scopedNightKey = `current_theme_id_${layout}_${mKey}_night`;
    const savedNight = localStorage.getItem(scopedNightKey + modeSuffix) || 
                       localStorage.getItem(scopedNightKey) || 
                       localStorage.getItem(`current_theme_id_${layout}_night` + modeSuffix) ||
                       localStorage.getItem(`current_theme_id_${layout}_night`) ||
                       localStorage.getItem('current_theme_id_night' + modeSuffix) ||
                       localStorage.getItem('current_theme_id_night');
    if (savedNight && THEMES[savedNight as keyof typeof THEMES]) {
      return savedNight;
    }
    return 'deep_black';
  }

  const scopedModeKey = `current_theme_id_${layout}_${mKey}`;
  const scopedKey = layout === 'classic' ? 'current_theme_id_classic' : 'current_theme_id_modern';
  const altKey = `quran_layout_${layout}__${mKey}_theme${modeSuffix}`;

  const saved = localStorage.getItem(scopedModeKey + modeSuffix) || 
                localStorage.getItem(scopedModeKey) || 
                localStorage.getItem(altKey) || 
                localStorage.getItem(scopedKey + modeSuffix) || 
                localStorage.getItem(scopedKey);

  if (saved && THEMES[saved as keyof typeof THEMES]) {
    return saved;
  }
  return layout === 'classic' ? 'black' : 'gold';
}

export function setQuranThemeIdForLayout(themeId: string, modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): void {
  const layout = getQuranLayoutMode(navParams);
  const isNight = isNightModeForLayout(layout);
  const mKey = readingMode || 'mushaf';

  if (isNight) {
    const scopedNightKey = `current_theme_id_${layout}_${mKey}_night`;
    localStorage.setItem(scopedNightKey + modeSuffix, themeId);
    localStorage.setItem(scopedNightKey, themeId);
  } else {
    const scopedModeKey = `current_theme_id_${layout}_${mKey}`;
    localStorage.setItem(scopedModeKey + modeSuffix, themeId);
    localStorage.setItem(scopedModeKey, themeId);
  }
  localStorage.setItem(`quran_user_chosen_theme_${layout}_${mKey}` + modeSuffix, themeId);
  localStorage.setItem(`quran_user_chosen_theme_${layout}_${mKey}`, themeId);
  localStorage.setItem('quran_theme_changed', 'true');
}

export function getQuranToolbarColorsForLayout(modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): any {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  const layoutKey = `quran_layout_${layout}_${mKey}_toolbar_colors${modeSuffix}`;
  const saved = localStorage.getItem(layoutKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  
  const themeId = getQuranThemeIdForLayout(modeSuffix, navParams, readingMode);
  const theme = THEMES[themeId as keyof typeof THEMES] || THEMES['black'];
  return {
    'top-toolbar': { bg: theme.barBg, border: theme.barBorder },
    'bottom-toolbar': { bg: theme.barBg, border: theme.barBorder },
    'surah': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font },
    'juz': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font },
    'page': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font },
    'audio': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-settings': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-home': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-bookmark': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-bookmarks-list': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-themes': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-autoscroll': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-menu': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-search': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-share': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }
  };
}

export function setQuranToolbarColorsForLayout(colors: any, modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): void {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  const layoutKey = `quran_layout_${layout}_${mKey}_toolbar_colors${modeSuffix}`;
  localStorage.setItem(layoutKey, JSON.stringify(colors));
  localStorage.setItem('toolbar_colors_v2' + modeSuffix, JSON.stringify(colors));
}

export function getQuranSettingsForLayout(modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): any {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  const layoutKey = `quran_layout_${layout}_${mKey}_settings${modeSuffix}`;
  const saved = localStorage.getItem(layoutKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
}

export function setQuranSettingsForLayout(settings: any, modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): void {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  const layoutKey = `quran_layout_${layout}_${mKey}_settings${modeSuffix}`;
  localStorage.setItem(layoutKey, JSON.stringify(settings));
  localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(settings));
}
