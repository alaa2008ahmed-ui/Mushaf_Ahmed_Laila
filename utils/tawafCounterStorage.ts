export interface TawafCounterState {
  showOnHome: boolean;
  activeTab: 'tawaf' | 'sai';
  tawafCount: number;
  saiCount: number;
}

const STORAGE_KEY = 'mushaf_tawaf_counter_state';
const EVENT_NAME = 'tawaf_counter_state_changed';

const DEFAULT_STATE: TawafCounterState = {
  showOnHome: false,
  activeTab: 'tawaf',
  tawafCount: 0,
  saiCount: 0,
};

export const getTawafCounterState = (): TawafCounterState => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      showOnHome: Boolean(parsed.showOnHome),
      activeTab: parsed.activeTab === 'sai' ? 'sai' : 'tawaf',
      tawafCount: Math.min(7, Math.max(0, Number(parsed.tawafCount) || 0)),
      saiCount: Math.min(7, Math.max(0, Number(parsed.saiCount) || 0)),
    };
  } catch {
    return DEFAULT_STATE;
  }
};

export const saveTawafCounterState = (updater: Partial<TawafCounterState> | ((prev: TawafCounterState) => TawafCounterState)) => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const current = getTawafCounterState();
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    return updated;
  } catch {
    return DEFAULT_STATE;
  }
};

export const subscribeTawafCounter = (callback: (state: TawafCounterState) => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const handler = (e: Event) => {
    const custom = e as CustomEvent<TawafCounterState>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getTawafCounterState());
    }
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getTawafCounterState());
    }
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', storageHandler);
  };
};
