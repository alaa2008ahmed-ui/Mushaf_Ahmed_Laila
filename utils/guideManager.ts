import { useState, useEffect } from 'react';

const SHOW_PAGE_GUIDES_KEY = 'show_page_guides';
const EVENT_NAME = 'page_guides_visibility_changed';

/**
 * Returns whether guide buttons across all pages should be visible.
 * Default is `true` (visible) on first launch unless explicitly disabled.
 */
export function getShowPageGuides(): boolean {
  try {
    const val = localStorage.getItem(SHOW_PAGE_GUIDES_KEY);
    if (val === 'false') return false;
    return true; // Default is shown on first launch
  } catch {
    return true;
  }
}

/**
 * Updates the guide button visibility setting and notifies all active pages.
 */
export function setShowPageGuides(show: boolean): void {
  try {
    localStorage.setItem(SHOW_PAGE_GUIDES_KEY, show ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: show }));
  } catch (e) {
    console.error('Failed to set guide visibility setting', e);
  }
}

/**
 * React hook to reactively subscribe to the guide buttons visibility state across pages.
 */
export function useShowPageGuides(): boolean {
  const [show, setShow] = useState<boolean>(() => getShowPageGuides());

  useEffect(() => {
    const handleChanged = () => {
      setShow(getShowPageGuides());
    };
    window.addEventListener(EVENT_NAME, handleChanged);
    window.addEventListener('storage', handleChanged);
    return () => {
      window.removeEventListener(EVENT_NAME, handleChanged);
      window.removeEventListener('storage', handleChanged);
    };
  }, []);

  return show;
}
