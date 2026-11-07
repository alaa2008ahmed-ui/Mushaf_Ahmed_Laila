import { THEMES, getLinkedQuranThemeForHomeVariant } from '../components/QuranReader/constants';

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

const ALL_READING_MODES = ['mushaf', 'tafseer', 'meanings', 'translation', 'bilingual'] as const;

export function getQuranThemeIdForLayout(modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): string {
  const layout = getQuranLayoutMode(navParams);
  const isNight = isNightModeForLayout(layout);
  const mKey = readingMode || 'mushaf';

  // Check unified global theme first
  const unifiedKey = isNight ? `current_theme_id_${layout}_unified_night` : `current_theme_id_${layout}_unified`;
  const savedUnified = localStorage.getItem(unifiedKey) || localStorage.getItem(unifiedKey + modeSuffix);
  if (savedUnified && THEMES[savedUnified as keyof typeof THEMES]) {
    return savedUnified;
  }

  if (isNight) {
    const scopedNightKey = `current_theme_id_${layout}_${mKey}_night`;
    const savedNight = localStorage.getItem(scopedNightKey + modeSuffix) || 
                       localStorage.getItem(scopedNightKey) || 
                       localStorage.getItem(`current_theme_id_${mKey}_night${modeSuffix}`) ||
                       localStorage.getItem(`current_theme_id_${mKey}_night`);
    if (savedNight && THEMES[savedNight as keyof typeof THEMES]) {
      return savedNight;
    }
    return 'deep_black';
  }

  const scopedModeKey = `current_theme_id_${layout}_${mKey}`;
  const altKey = `quran_layout_${layout}__${mKey}_theme${modeSuffix}`;

  const saved = localStorage.getItem(scopedModeKey + modeSuffix) || 
                localStorage.getItem(scopedModeKey) || 
                localStorage.getItem(altKey) || 
                localStorage.getItem(`current_theme_id_${mKey}${modeSuffix}`) ||
                localStorage.getItem(`current_theme_id_${mKey}`);

  if (saved && THEMES[saved as keyof typeof THEMES]) {
    return saved;
  }
  return layout === 'classic' ? 'black' : getLinkedQuranThemeForHomeVariant();
}

export function setQuranThemeIdForLayout(themeId: string, modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): void {
  const layout = getQuranLayoutMode(navParams);
  const isNight = isNightModeForLayout(layout);

  // Synchronize across all reading modes and unified keys
  ALL_READING_MODES.forEach(mode => {
    if (isNight) {
      const scopedNightKey = `current_theme_id_${layout}_${mode}_night`;
      localStorage.setItem(scopedNightKey + '_v', themeId);
      localStorage.setItem(scopedNightKey + '_h', themeId);
      localStorage.setItem(scopedNightKey, themeId);
      localStorage.setItem(`current_theme_id_${mode}_night_v`, themeId);
      localStorage.setItem(`current_theme_id_${mode}_night_h`, themeId);
      localStorage.setItem(`current_theme_id_${mode}_night`, themeId);
    } else {
      const scopedModeKey = `current_theme_id_${layout}_${mode}`;
      localStorage.setItem(scopedModeKey + '_v', themeId);
      localStorage.setItem(scopedModeKey + '_h', themeId);
      localStorage.setItem(scopedModeKey, themeId);
      localStorage.setItem(`quran_layout_${layout}__${mode}_theme_v`, themeId);
      localStorage.setItem(`quran_layout_${layout}__${mode}_theme_h`, themeId);
      localStorage.setItem(`current_theme_id_${mode}_v`, themeId);
      localStorage.setItem(`current_theme_id_${mode}_h`, themeId);
      localStorage.setItem(`current_theme_id_${mode}`, themeId);
    }
    localStorage.setItem(`quran_user_chosen_theme_${layout}_${mode}_v`, themeId);
    localStorage.setItem(`quran_user_chosen_theme_${layout}_${mode}_h`, themeId);
    localStorage.setItem(`quran_user_chosen_theme_${layout}_${mode}`, themeId);
  });

  // Also set unified keys
  if (isNight) {
    localStorage.setItem(`current_theme_id_${layout}_unified_night`, themeId);
    localStorage.setItem(`current_theme_id_${layout}_unified_night_v`, themeId);
    localStorage.setItem(`current_theme_id_${layout}_unified_night_h`, themeId);
  } else {
    localStorage.setItem(`current_theme_id_${layout}_unified`, themeId);
    localStorage.setItem(`current_theme_id_${layout}_unified_v`, themeId);
    localStorage.setItem(`current_theme_id_${layout}_unified_h`, themeId);
    localStorage.setItem('current_theme_id_unified', themeId);
  }

  localStorage.setItem('quran_theme_changed', 'true');
}

export function getQuranToolbarColorsForLayout(modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): any {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  const layoutKey = `quran_layout_${layout}_${mKey}_toolbar_colors${modeSuffix}`;
  const unifiedKey = `quran_layout_${layout}_unified_toolbar_colors`;
  const saved = localStorage.getItem(unifiedKey) || localStorage.getItem(layoutKey);
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
  const serialized = JSON.stringify(colors);
  
  ALL_READING_MODES.forEach(mode => {
    localStorage.setItem(`quran_layout_${layout}_${mode}_toolbar_colors_v`, serialized);
    localStorage.setItem(`quran_layout_${layout}_${mode}_toolbar_colors_h`, serialized);
    localStorage.setItem(`quran_layout_${layout}_${mode}_toolbar_colors`, serialized);
  });
  
  localStorage.setItem(`quran_layout_${layout}_unified_toolbar_colors`, serialized);
  localStorage.setItem('toolbar_colors_v2' + modeSuffix, serialized);
  localStorage.setItem('toolbar_colors_v2', serialized);
}

export function getQuranSettingsForLayout(modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): any {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  
  // Check unified global settings first
  const unifiedKey = `quran_layout_${layout}_unified_settings`;
  const savedUnified = localStorage.getItem(unifiedKey) || localStorage.getItem('quran_settings_unified');
  if (savedUnified) {
    try {
      return JSON.parse(savedUnified);
    } catch (e) {}
  }

  const layoutKey = `quran_layout_${layout}_${mKey}_settings${modeSuffix}`;
  const saved = localStorage.getItem(layoutKey) || localStorage.getItem(`quran_layout_${layout}_${mKey}_settings`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
}

export function setQuranSettingsForLayout(settings: any, modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): void {
  const layout = getQuranLayoutMode(navParams);
  const serialized = JSON.stringify(settings);

  ALL_READING_MODES.forEach(mode => {
    localStorage.setItem(`quran_layout_${layout}_${mode}_settings_v`, serialized);
    localStorage.setItem(`quran_layout_${layout}_${mode}_settings_h`, serialized);
    localStorage.setItem(`quran_layout_${layout}_${mode}_settings`, serialized);
    localStorage.setItem(`quran_settings_${mode}_v`, serialized);
    localStorage.setItem(`quran_settings_${mode}_h`, serialized);
    localStorage.setItem(`quran_settings_${mode}`, serialized);
  });

  localStorage.setItem(`quran_layout_${layout}_unified_settings`, serialized);
  localStorage.setItem('quran_settings_unified', serialized);
  localStorage.setItem('quran_settings_v', serialized);
  localStorage.setItem('quran_settings_h', serialized);
  localStorage.setItem('quran_settings', serialized);
}
