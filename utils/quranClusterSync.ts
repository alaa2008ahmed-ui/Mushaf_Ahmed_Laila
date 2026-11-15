import { ReadingMode, THEMES, DEFAULT_SETTINGS, getToolbarColorsForTheme } from '../components/QuranReader/constants';

export type ReadingCluster = 'unified' | 'ar' | 'en';

export const ALL_READING_MODES: ReadingMode[] = ['mushaf', 'tafseer', 'meanings', 'translation', 'bilingual'];
export const ARABIC_CLUSTER_MODES: ReadingMode[] = ALL_READING_MODES;
export const ENGLISH_CLUSTER_MODES: ReadingMode[] = ALL_READING_MODES;

export const getClusterModes = (_cluster?: ReadingCluster): ReadingMode[] => {
    return ALL_READING_MODES;
};

export const getClusterForLanguage = (_language?: string): ReadingCluster => {
    return 'unified';
};

export const isModeInCluster = (_cluster: ReadingCluster | string, mode: ReadingMode | string): boolean => {
    return ALL_READING_MODES.includes(mode as ReadingMode);
};

export interface AyahPosition {
    s: number;
    a: number;
    page?: number;
    juz?: number;
    isExplicit?: boolean;
    ts?: number;
}

/**
 * Save reading position universally across ALL 5 reading modes:
 * Mushaf, Tafseer, Meanings, Translation, Recitation & Translation (Bilingual)
 * Whenever any page updates the position or stops on an ayah, every page stays 100% in sync.
 */
export const saveClusterPosition = (
    _cluster: ReadingCluster | string,
    pos: AyahPosition,
    isLandscape: boolean = false
) => {
    try {
        if (!pos || typeof pos.s !== 'number' || pos.s < 1 || pos.s > 114) return;
        const s = pos.s;
        const a = pos.a || 1;
        const timestamp = Date.now();
        const savedObj: AyahPosition = { ...pos, s, a, isExplicit: true, ts: timestamp };
        const serialized = JSON.stringify(savedObj);
        const orient = isLandscape ? 'h' : 'v';

        // Master universal keys
        localStorage.setItem('quran_last_pos_unified', serialized);
        localStorage.setItem('quran_last_pos_ar_cluster', serialized);
        localStorage.setItem('quran_last_pos_en_cluster', serialized);
        localStorage.setItem('last_read_ayah_global', serialized);
        localStorage.setItem(`last_pos_${orient}`, serialized);
        localStorage.setItem('last_pos_v', serialized);
        localStorage.setItem('last_pos_h', serialized);

        // Sync across all 5 reading pages and both orientations
        ALL_READING_MODES.forEach(m => {
            localStorage.setItem(`last_read_pos_${m}`, serialized);
            localStorage.setItem(`last_pos_${m}_v`, serialized);
            localStorage.setItem(`last_pos_${m}_h`, serialized);
        });

        // Specific legacy & isolated keys
        localStorage.setItem('last_read_pos_bilingual_ar', serialized);
        localStorage.setItem('last_pos_bilingual_ar_v', serialized);
        localStorage.setItem('last_pos_bilingual_ar_h', serialized);
        localStorage.setItem('last_read_pos_bilingual_en', serialized);
        localStorage.setItem('last_pos_bilingual_en_v', serialized);
        localStorage.setItem('last_pos_bilingual_en_h', serialized);

        window.dispatchEvent(new Event('last_read_update'));
    } catch (e) {
        console.warn('Failed to save cluster position', e);
    }
};

/**
 * Retrieve saved reading position universally.
 */
export const getClusterPosition = (
    _cluster?: ReadingCluster | string,
    targetMode?: ReadingMode,
    isLandscape: boolean = false
): AyahPosition | null => {
    try {
        const orient = isLandscape ? 'h' : 'v';
        const keysToCheck = [
            'quran_last_pos_unified',
            'last_read_ayah_global',
            targetMode ? `last_read_pos_${targetMode}` : null,
            targetMode ? `last_pos_${targetMode}_${orient}` : null,
            'last_read_pos_mushaf',
            'last_pos_mushaf_v',
            'last_read_pos_tafseer',
            'last_read_pos_meanings',
            'last_read_pos_translation',
            'last_read_pos_bilingual',
            'quran_last_pos_ar_cluster',
            'quran_last_pos_en_cluster',
            `last_pos_${orient}`,
            'last_pos_v',
            'last_pos_h'
        ].filter(Boolean) as string[];

        for (const key of keysToCheck) {
            const item = localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                if (parsed && typeof parsed.s === 'number' && parsed.s >= 1 && parsed.s <= 114) {
                    return parsed;
                }
            }
        }
    } catch (e) {
        console.warn('Failed to get cluster position', e);
    }
    return null;
};

/**
 * Sync reading settings (font size, text color, background color, highlight color, theme, etc.)
 * across all 5 reading pages (Mushaf, Tafseer, Meanings, Translation, Bilingual).
 */
export const syncClusterSettings = (
    _cluster: ReadingCluster | string,
    newSettings: any,
    _isLandscape: boolean = false
) => {
    try {
        if (!newSettings || typeof newSettings !== 'object') return;
        
        // Preserve base
        const currentUnifiedStr = localStorage.getItem('quran_settings_unified') || 
                                  localStorage.getItem('quran_settings_ar_cluster') || 
                                  localStorage.getItem('quran_settings');
        const currentUnified = currentUnifiedStr ? JSON.parse(currentUnifiedStr) : {};
        const mergedSettings = { ...DEFAULT_SETTINGS, ...currentUnified, ...newSettings };
        const serialized = JSON.stringify(mergedSettings);
        
        // Save unified master settings
        localStorage.setItem('quran_settings_unified', serialized);
        localStorage.setItem('quran_settings_ar_cluster', serialized);
        localStorage.setItem('quran_settings_en_cluster', serialized);
        localStorage.setItem('quran_settings', serialized);
        localStorage.setItem('quran_settings_v', serialized);
        localStorage.setItem('quran_settings_h', serialized);

        const layouts = ['classic', 'modern'] as const;
        const orients = ['v', 'h'] as const;

        ALL_READING_MODES.forEach(m => {
            orients.forEach(o => {
                const modeSuffix = m === 'mushaf' ? `_${o}` : `_${m}_${o}`;
                localStorage.setItem(`quran_settings${modeSuffix}`, serialized);
                localStorage.setItem(`quran_settings_${m}_${o}`, serialized);
                layouts.forEach(l => {
                    localStorage.setItem(`quran_settings_${l}_${m}_${o}`, serialized);
                });
            });
        });

        // Legacy bilingual variants
        ['bilingual_ar', 'bilingual_en'].forEach(b => {
            orients.forEach(o => {
                localStorage.setItem(`quran_settings_${b}_${o}`, serialized);
                layouts.forEach(l => {
                    localStorage.setItem(`quran_settings_${l}_${b}_${o}`, serialized);
                });
            });
        });

        window.dispatchEvent(new Event('settings-change'));
    } catch (e) {
        console.warn('Failed to sync cluster settings', e);
    }
};

/**
 * Sync theme selection across all 5 pages.
 */
export const syncClusterTheme = (
    _cluster: ReadingCluster | string,
    themeId: string,
    currentLayout: 'classic' | 'modern' = 'modern',
    isLandscape: boolean = false
) => {
    try {
        const theme = THEMES[themeId as keyof typeof THEMES];
        if (!theme) return;

        localStorage.setItem('current_theme_id_unified', themeId);
        localStorage.setItem('current_theme_id_ar_cluster', themeId);
        localStorage.setItem('current_theme_id_en_cluster', themeId);
        localStorage.setItem('current_theme_id_v', themeId);
        localStorage.setItem('current_theme_id_h', themeId);
        localStorage.setItem('current_theme_id', themeId);

        const colors = getToolbarColorsForTheme(theme);
        const colorsJson = JSON.stringify(colors);
        const orients = ['_v', '_h'] as const;

        ALL_READING_MODES.forEach(m => {
            orients.forEach(o => {
                const modeSuffix = m === 'mushaf' ? o : `_${m}${o}`;
                localStorage.setItem(`current_theme_id_${m}${o}`, themeId);
                localStorage.setItem(`current_theme_id_${m}`, themeId);
                localStorage.setItem(`quran_layout_${currentLayout}_${m}_theme${o}`, themeId);
                localStorage.setItem(`quran_user_chosen_theme_${currentLayout}_${m}${o}`, themeId);
                localStorage.setItem(`quran_user_chosen_theme_${currentLayout}_${m}`, themeId);
                localStorage.setItem(`toolbar_colors_v2${modeSuffix}`, colorsJson);
            });
        });

        // Also update settings with the theme colors
        const existingStr = localStorage.getItem('quran_settings_unified') || localStorage.getItem('quran_settings_ar_cluster');
        const existing = existingStr ? JSON.parse(existingStr) : {};
        const updated = {
            ...DEFAULT_SETTINGS,
            ...existing,
            bgColor: theme.bg,
            textColor: theme.text,
            fontFamily: theme.font || existing.fontFamily,
            highlightTextColor: existing.lockHighlightColor ? existing.highlightTextColor : (theme.highlightText || theme.accent),
            theme: theme.id
        };
        syncClusterSettings('unified', updated, isLandscape);

        window.dispatchEvent(new Event('theme-change'));
    } catch (e) {
        console.warn('Failed to sync cluster theme', e);
    }
};

/**
 * Retrieve cluster settings.
 */
export const getClusterSettings = (
    _cluster?: ReadingCluster | string,
    currentMode?: ReadingMode,
    isLandscape: boolean = false
): any => {
    try {
        const saved = localStorage.getItem('quran_settings_unified') || 
                      localStorage.getItem('quran_settings_ar_cluster') || 
                      localStorage.getItem('quran_settings_en_cluster');
        if (saved) {
            return JSON.parse(saved);
        }

        const orient = isLandscape ? 'h' : 'v';
        const modeSuffix = currentMode === 'mushaf' ? `_${orient}` : `_${currentMode}_${orient}`;
        const modeSaved = localStorage.getItem(`quran_settings${modeSuffix}`);
        if (modeSaved) {
            return JSON.parse(modeSaved);
        }
    } catch (e) {
        console.warn('Failed to get cluster settings', e);
    }
    return null;
};
