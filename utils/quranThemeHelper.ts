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

export function getQuranThemeIdForLayout(modeSuffix: string = '_v', navParams?: any): string {
  const layout = getQuranLayoutMode(navParams);
  const layoutKey = `current_theme_id_${layout}${modeSuffix}`;
  const altKey = `quran_layout_${layout}_theme${modeSuffix}`;
  const saved = localStorage.getItem(layoutKey) || localStorage.getItem(`current_theme_id_${layout}`) || localStorage.getItem(altKey);
  if (saved && THEMES[saved as keyof typeof THEMES]) {
    return saved;
  }
  // Default fallbacks if no theme has been explicitly saved for this layout mode yet:
  // Classic layout default is 'black' (standard default). Modern layout default is 'gold' (golden theme).
  return layout === 'classic' ? 'black' : 'gold';
}

export function setQuranThemeIdForLayout(themeId: string, modeSuffix: string = '_v', navParams?: any): void {
  const layout = getQuranLayoutMode(navParams);
  const layoutKey = `current_theme_id_${layout}${modeSuffix}`;
  const altKey = `quran_layout_${layout}_theme${modeSuffix}`;
  localStorage.setItem(layoutKey, themeId);
  localStorage.setItem(`current_theme_id_${layout}`, themeId);
  localStorage.setItem(altKey, themeId);
  localStorage.setItem('current_theme_id' + modeSuffix, themeId);
  localStorage.setItem('current_theme_id', themeId);
}

export function getQuranToolbarColorsForLayout(modeSuffix: string = '_v', navParams?: any): any {
  const layout = getQuranLayoutMode(navParams);
  const layoutKey = `quran_layout_${layout}_toolbar_colors${modeSuffix}`;
  const saved = localStorage.getItem(layoutKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  
  const themeId = getQuranThemeIdForLayout(modeSuffix, navParams);
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

export function setQuranToolbarColorsForLayout(colors: any, modeSuffix: string = '_v', navParams?: any): void {
  const layout = getQuranLayoutMode(navParams);
  const layoutKey = `quran_layout_${layout}_toolbar_colors${modeSuffix}`;
  localStorage.setItem(layoutKey, JSON.stringify(colors));
  localStorage.setItem('toolbar_colors_v2' + modeSuffix, JSON.stringify(colors));
}

export function getQuranSettingsForLayout(modeSuffix: string = '_v', navParams?: any): any {
  const layout = getQuranLayoutMode(navParams);
  const layoutKey = `quran_layout_${layout}_settings${modeSuffix}`;
  const saved = localStorage.getItem(layoutKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
}

export function setQuranSettingsForLayout(settings: any, modeSuffix: string = '_v', navParams?: any): void {
  const layout = getQuranLayoutMode(navParams);
  const layoutKey = `quran_layout_${layout}_settings${modeSuffix}`;
  localStorage.setItem(layoutKey, JSON.stringify(settings));
  localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(settings));
}
