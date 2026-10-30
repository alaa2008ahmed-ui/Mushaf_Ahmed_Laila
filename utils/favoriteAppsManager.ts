import { useState, useEffect, useCallback } from 'react';

const USAGE_STORAGE_KEY = 'mushaf_app_usage_counts_v1';
const LAST_VISIT_STORAGE_KEY = 'mushaf_app_last_visit_v1';

// التطبيقات الأولوية الافتراضية عند التشغيل لأول مرة
export const DEFAULT_FAVORITE_APPS = [
  'quran',
  'listen',
  'habit-tracker',
  'daily-wird',
  'prophetic-seerah',
  'prayer-times',
  'salah-adhkar',
  'sabah-masaa',
  'others',
  'hisn-muslim'
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
  'quran-landscape'
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
  if (!pageId || pageId === 'home') return;

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
 * استخراج أهم 10 تطبيقات:
 * أول تطبيقين هما الأكثر استخداماً، ومن التطبيق الثالث إلى العاشر حسب أحدث تاريخ فتح (أحدث الزيارات)
 */
export function getFavoriteAppIds(limit = 10): string[] {
  const counts = getAppUsageCounts();
  const timestamps = getLastVisitTimestamps();

  const hasUsage = Object.values(counts).some(c => c > 0) || Object.values(timestamps).some(t => t > 0);

  if (!hasUsage) {
    return DEFAULT_FAVORITE_APPS.slice(0, limit);
  }

  // 1. فرز كافة التطبيقات بحسب الأكثر استخداماً (عدد المرات)
  const sortedByCount = [...VALID_APP_IDS].sort((a, b) => {
    const countA = counts[a] || 0;
    const countB = counts[b] || 0;
    if (countB !== countA) {
      return countB - countA;
    }
    const timeA = timestamps[a] || 0;
    const timeB = timestamps[b] || 0;
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    const defaultIndexA = DEFAULT_FAVORITE_APPS.indexOf(a);
    const defaultIndexB = DEFAULT_FAVORITE_APPS.indexOf(b);
    return (defaultIndexA !== -1 ? defaultIndexA : 999) - (defaultIndexB !== -1 ? defaultIndexB : 999);
  });

  // استخراج أكثر تطبيقين استخداماً
  const top2MostUsed = sortedByCount.slice(0, 2);

  // 2. فرز بقية التطبيقات بحسب آخر وقت زيارة (أحدث تطبيق تم فتحه أولاً)
  const remainingApps = VALID_APP_IDS.filter(id => !top2MostUsed.includes(id));
  const sortedByRecent = remainingApps.sort((a, b) => {
    const timeA = timestamps[a] || 0;
    const timeB = timestamps[b] || 0;
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    const countA = counts[a] || 0;
    const countB = counts[b] || 0;
    if (countB !== countA) {
      return countB - countA;
    }
    const defaultIndexA = DEFAULT_FAVORITE_APPS.indexOf(a);
    const defaultIndexB = DEFAULT_FAVORITE_APPS.indexOf(b);
    return (defaultIndexA !== -1 ? defaultIndexA : 999) - (defaultIndexB !== -1 ? defaultIndexB : 999);
  });

  // الدمج: [الأكثر استخداماً 1، الأكثر استخداماً 2، أحدث زيارة 1، أحدث زيارة 2، ...] حتى 10 تطبيقات
  const combined = [...top2MostUsed, ...sortedByRecent];
  return combined.slice(0, limit);
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
