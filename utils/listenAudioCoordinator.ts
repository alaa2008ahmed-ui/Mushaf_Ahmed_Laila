// Coordinates temporary pause/resume of ListenQuran playback whenever
// another in-app audio source or microphone becomes active.

type InterruptionHandlers = {
  onInterrupt: () => void;
  onResume: () => void;
};

const activeInterruptions = new Set<string>();
let handlers: InterruptionHandlers | null = null;
let resumeTimer: ReturnType<typeof setTimeout> | null = null;

export const registerListenInterruptionHandlers = (nextHandlers: InterruptionHandlers) => {
  handlers = nextHandlers;
};

export const acquireListenInterruption = (token: string) => {
  if (!token) return;

  if (resumeTimer !== null) {
    clearTimeout(resumeTimer);
    resumeTimer = null;
  }

  const wasEmpty = activeInterruptions.size === 0;
  activeInterruptions.add(token);

  if (wasEmpty && handlers) {
    try {
      handlers.onInterrupt();
    } catch (e) {
      console.warn('Listen interruption handler failed:', e);
    }
  }
};

export const releaseListenInterruption = (token: string) => {
  if (!token) return;
  if (!activeInterruptions.has(token)) return;

  activeInterruptions.delete(token);

  if (activeInterruptions.size === 0 && handlers) {
    if (resumeTimer !== null) {
      clearTimeout(resumeTimer);
    }
    // Small debounce prevents rapid pause/resume blips when switching ayahs or TTS chunks
    resumeTimer = setTimeout(() => {
      resumeTimer = null;
      if (activeInterruptions.size === 0 && handlers) {
        try {
          handlers.onResume();
        } catch (e) {
          console.warn('Listen resume handler failed:', e);
        }
      }
    }, 150);
  }
};

export const clearAllListenInterruptions = () => {
  if (resumeTimer !== null) {
    clearTimeout(resumeTimer);
    resumeTimer = null;
  }
  activeInterruptions.clear();
};

export const getActiveListenInterruptionCount = (): number => activeInterruptions.size;
