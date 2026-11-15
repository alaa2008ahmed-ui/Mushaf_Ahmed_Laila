import { useState, useEffect, useCallback } from 'react';

const USAGE_STORAGE_KEY = 'mushaf_app_usage_counts_v1';
const LAST_VISIT_STORAGE_KEY = 'mushaf_app_last_visit_v1';

// التطبيقات الأولوية الافتراضية عند التشغيل لأول مرة (الأيقونة الأولى ثنائية الأهمية دائماً للقرآن الكريم)
export const DEFAULT_FAVORITE_APPS = [
  'quran',
  'daily-wird',
  'voice-control',
  'prayer-times',
  'sabah-masaa',
  'listen',
  'habit-tracker',
  'hisn-muslim',
  'salah-adhkar',
  'adia',
  'qibla',
  'tasbeeh',
  'others',
  'ten-promised',
  'hajj-umrah',
  'asmaul-husna',
  'calculators',
  'nawawi',
  'calendar',
  'islamic-sites',
  'prophetic-seerah',
  'divine-miracles',
  'quran-landscape',
  'memorization'
];

export const VALID_APP_IDS = [
  'quran',
  'listen',
  'habit-tracker',
  'daily-wird',
  'prophetic-seerah',
  'prayer-times',
  'salah-adhkar',
  'qibla',
  'sabah-masaa',
  'adia',
  'tasbeeh',
  'others',
  'ten-promised',
  'hisn-muslim',
  'hajj-umrah',
  'asmaul-husna',
  'calculators',
  'nawawi',
  'calendar',
  'islamic-sites',
  'voice-control',
  'quran-landscape',
  'divine-miracles',
  'memorization'
];

export function getAppUsageCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading app usage counts:', e);
  }
  return {};
}

export function getLastVisitTimestamps(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LAST_VISIT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading last visit timestamps:', e);
  }
  return {};
}

/**
 * تسجيل فتح صفحة/تطبيق لزيادة عدد مرات استخدامه وتحديث أحدث وقت زيارة
 */
export function recordAppVisit(pageId: string) {
  if (!pageId || pageId === 'home' || pageId === 'settings' || pageId.includes('settings') || pageId.includes('download')) return;

  // Normalize aliases if needed
  const aliasMap: Record<string, string> = {
    'adhkar': 'sabah-masaa',
    'athkar-sabah-massa': 'sabah-masaa',
    'athkar-salah': 'salah-adhkar',
    'roqya': 'others',
    'ruqyah': 'others',
    'seerah': 'prophetic-seerah',
    'hadith': 'nawawi',
    'misbaha': 'tasbeeh',
    'sebha': 'tasbeeh',
    'asma-allah': 'asmaul-husna',
    'asmaa-allah': 'asmaul-husna',
    'miracles': 'divine-miracles',
    'divine-miracle': 'divine-miracles',
    'moajazat': 'divine-miracles',
    'monthly-prayer-times': 'prayer-times',
    'quran-search': 'quran',
  };
  const normalizedId = aliasMap[pageId] || pageId;

  if (!VALID_APP_IDS.includes(normalizedId)) return;

  try {
    const counts = getAppUsageCounts();
    counts[normalizedId] = (counts[normalizedId] || 0) + 1;
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(counts));

    const timestamps = getLastVisitTimestamps();
    timestamps[normalizedId] = Date.now();
    localStorage.setItem(LAST_VISIT_STORAGE_KEY, JSON.stringify(timestamps));

    // Notify all listeners
    window.dispatchEvent(new CustomEvent('favorite-apps-updated'));
  } catch (e) {
    console.error('Error saving app visit:', e);
  }
}

/**
 * استخراج التطبيقات اليومية (10 تطبيقات):
 * - الأيقونة الأولى ثابته دائماً لـ القرآن الكريم ('quran')
 * - التطبيقات الـ 9 الأخرى مرتبة حسب الأكثر فتحاً واستخداماً (عدد المرات تنازلياً)
 */
export function getFavoriteAppIds(limit = 10): string[] {
  const counts = getAppUsageCounts();
  const timestamps = getLastVisitTimestamps();

  const firstApp = 'quran';
  const otherAppIds = VALID_APP_IDS.filter(id => id !== firstApp);

  // فرز باقي التطبيقات بحسب الأكثر استخداماً أولاً (عدد الزيارات تنازلياً)
  const sortedOthers = [...otherAppIds].sort((a, b) => {
    const countA = counts[a] || 0;
    const countB = counts[b] || 0;
    if (countB !== countA) {
      return countB - countA; // الأكثر استخداماً يظهر أولاً
    }
    const timeA = timestamps[a] || 0;
    const timeB = timestamps[b] || 0;
    if (timeB !== timeA) {
      return timeB - timeA; // أحدث زيارة في حال التساوي
    }
    const defaultIndexA = DEFAULT_FAVORITE_APPS.indexOf(a);
    const defaultIndexB = DEFAULT_FAVORITE_APPS.indexOf(b);
    const idxA = defaultIndexA !== -1 ? defaultIndexA : 999;
    const idxB = defaultIndexB !== -1 ? defaultIndexB : 999;
    return idxA - idxB;
  });

  const neededOthersCount = Math.max(0, limit - 1);
  const topOthers = sortedOthers.slice(0, neededOthersCount);

  return [firstApp, ...topOthers];
}

/**
 * Hook to reactively get favorite apps in React components
 */
export function useFavoriteApps(limit = 10): string[] {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteAppIds(limit));

  const refreshFavorites = useCallback(() => {
    setFavoriteIds(getFavoriteAppIds(limit));
  }, [limit]);

  useEffect(() => {
    refreshFavorites();
    const handleUpdate = () => refreshFavorites();
    window.addEventListener('favorite-apps-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('favorite-apps-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshFavorites]);

  return favoriteIds;
}
