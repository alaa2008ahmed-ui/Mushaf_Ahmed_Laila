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
 */
export function useShowNewBadge(): boolean {
  const [show, setShow] = useState<boolean>(() => shouldShowNewBadge());

  useEffect(() => {
    setShow(shouldShowNewBadge());

    const handleChange = () => {
      setShow(shouldShowNewBadge());
    };

    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return show;
}
