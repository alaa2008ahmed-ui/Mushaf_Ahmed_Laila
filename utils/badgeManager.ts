import { useState, useEffect } from 'react';

const LAUNCH_COUNT_KEY = 'app_launch_counter_v1';
const SESSION_FLAG_KEY = 'app_session_launch_recorded_v1';
export const MAX_NEW_BADGE_LAUNCHES = 10;

// Flag in memory to prevent multiple increments during the same runtime session
let sessionCountedInMemory = false;

// Listeners for reactive updates
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener error
    }
  });
}

/**
 * Records a single launch of the application.
 * Called when the app starts (in App.tsx).
 * Only increments once per application session/process.
 */
export function recordAppLaunch(): number {
  if (sessionCountedInMemory) {
    return getAppLaunchCount();
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (sessionStorage.getItem(SESSION_FLAG_KEY) === 'true') {
        sessionCountedInMemory = true;
        return getAppLaunchCount();
      }
    }
  } catch {
    // Ignore sessionStorage errors
  }

  let currentCount = 0;
  try {
    const stored = localStorage.getItem(LAUNCH_COUNT_KEY);
    if (stored !== null) {
      currentCount = parseInt(stored, 10);
      if (isNaN(currentCount) || currentCount < 0) currentCount = 0;
    } else {
      currentCount = 0;
    }
  } catch {
    currentCount = 0;
  }

  const newCount = currentCount + 1;

  try {
    localStorage.setItem(LAUNCH_COUNT_KEY, newCount.toString());
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(SESSION_FLAG_KEY, 'true');
    }
  } catch {
    // Ignore localStorage errors
  }

  sessionCountedInMemory = true;
  notifyListeners();
  return newCount;
}

const SEEN_PAGES_KEY = 'app_seen_pages_badge_v1';

/**
 * Returns array of page IDs that user has already opened/seen.
 */
export function getSeenPages(): string[] {
  try {
    const stored = localStorage.getItem(SEEN_PAGES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Checks if a specific page has already been opened/seen by user.
 */
export function isPageSeen(pageId: string): boolean {
  const seen = getSeenPages();
  return seen.includes(pageId);
}

/**
 * Marks a specific page as seen so its "جديد" badge automatically disappears.
 */
export function markPageAsSeen(pageId: string): void {
  try {
    const seen = getSeenPages();
    if (!seen.includes(pageId)) {
      seen.push(pageId);
      localStorage.setItem(SEEN_PAGES_KEY, JSON.stringify(seen));
      notifyListeners();
    }
  } catch {}
}

/**
 * Determines whether the "جديد" badge should be shown for a specific page.
 * Returns false immediately if the page has already been opened/seen,
 * or if launch count exceeded the maximum.
 */
export function shouldShowBadgeForPage(pageId: string): boolean {
  if (isPageSeen(pageId)) return false;
  return shouldShowNewBadge();
}

/**
 * Returns current launch count.
 */
export function getAppLaunchCount(): number {
  try {
    const val = localStorage.getItem(LAUNCH_COUNT_KEY);
    const parsed = parseInt(val || '0', 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

/**
 * Determines whether the "جديد" badge should be shown.
 * Returns true for the first 10 app launches (count <= 10).
 * Disappears after 10 launches (count > 10).
 */
export function shouldShowNewBadge(): boolean {
  const count = getAppLaunchCount();
  // If count is 0 (before recordAppLaunch executes), treat as initial launch (<= 10)
  return count <= MAX_NEW_BADGE_LAUNCHES;
}

/**
 * React hook to reactively get whether the "جديد" badge should be shown.
 * If pageId is provided, automatically returns false once the page has been opened.
 */
export function useShowNewBadge(pageId?: string): boolean {
  const [show, setShow] = useState<boolean>(() => pageId ? shouldShowBadgeForPage(pageId) : shouldShowNewBadge());

  useEffect(() => {
    setShow(pageId ? shouldShowBadgeForPage(pageId) : shouldShowNewBadge());

    const handleChange = () => {
      setShow(pageId ? shouldShowBadgeForPage(pageId) : shouldShowNewBadge());
    };

    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, [pageId]);

  return show;
}

/**
 * Hook to get the list of seen pages reactively.
 */
export function useSeenPages(): { seenPages: string[]; isPageSeen: (pageId: string) => boolean; markPageAsSeen: (pageId: string) => void } {
  const [seen, setSeen] = useState<string[]>(() => getSeenPages());

  useEffect(() => {
    const handleChange = () => {
      setSeen(getSeenPages());
    };
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return {
    seenPages: seen,
    isPageSeen: (id: string) => seen.includes(id),
    markPageAsSeen
  };
}
