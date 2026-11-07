import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getCurrentSplashImage } from '../utils/splashThemeHelper';

const SPLASH_DURATION_MS = 3000;

interface ImageSplashProps {
  onEnded: () => void;
}

/**
 * Purges the initial HTML boot splash overlay and releases image bitmap buffers
 * from memory synchronously to guarantee zero white/black flashes on transition.
 */
export function purgeBootSplashMemory(): void {
  if (typeof document === 'undefined') return;
  try {
    document.body.style.backgroundColor = '#FFFFFF';
    document.documentElement.style.backgroundColor = '#FFFFFF';
    const bootEl = document.getElementById('initial-boot-splash');
    if (bootEl) {
      const imgs = bootEl.querySelectorAll('img');
      imgs.forEach((img) => {
        try {
          img.src = '';
          img.removeAttribute('src');
        } catch {}
      });
      bootEl.remove();
    }
  } catch {}
}

const ImageSplash: React.FC<ImageSplashProps> = ({ onEnded }) => {
  const hasEndedRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const heroImgRef = useRef<HTMLImageElement>(null);

  // If index.html already painted #initial-boot-splash at t=0ms, keep using it directly
  // without stacking a duplicate layer; otherwise render the identical fallback overlay.
  const [hasNativeBootDom] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    const bootEl = document.getElementById('initial-boot-splash');
    return Boolean(bootEl && bootEl.style.display !== 'none');
  });

  useEffect(() => {
    // 1. Pre-decode WelcomeSplash assets & purge any legacy splash.mp4 cache entries
    try {
      const preloadIcon = new Image();
      preloadIcon.decoding = 'sync';
      preloadIcon.src = '/app_icon.png';
      if (typeof preloadIcon.decode === 'function') {
        preloadIcon.decode().catch(() => {});
      }

      if (typeof window !== 'undefined' && 'caches' in window) {
        window.caches
          .keys()
          .then((names) => {
            names.forEach((name) => {
              window.caches
                .open(name)
                .then((cache) => {
                  cache.delete('/splash.mp4').catch(() => {});
                })
                .catch(() => {});
            });
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  useLayoutEffect(() => {
    const now = Date.now();
    const rawStart =
      typeof window !== 'undefined' && typeof (window as any).__SPLASH_START_TS__ === 'number'
        ? (window as any).__SPLASH_START_TS__
        : now;

    // Ensure exact 3,000ms total splash visibility from initial instant launch paint
    const elapsed = Math.max(0, now - rawStart);
    const remainingMs = Math.max(0, SPLASH_DURATION_MS - elapsed);

    const finishSplash = () => {
      if (hasEndedRef.current) return;
      hasEndedRef.current = true;

      // Release React-rendered image buffers if fallback was used
      if (heroImgRef.current) {
        heroImgRef.current.src = '';
        heroImgRef.current.removeAttribute('src');
      }

      // Transition state first, then synchronously remove boot splash DOM
      onEndedRef.current();
      purgeBootSplashMemory();
    };

    if (remainingMs === 0) {
      finishSplash();
      return;
    }

    const timerId = window.setTimeout(finishSplash, remainingMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  const [splashSrc] = useState<string>(() => getCurrentSplashImage());

  if (hasNativeBootDom) {
    return null;
  }

  return (
    <div
      id="app-image-splash"
      className="app-splash-overlay"
      aria-hidden="true"
    >
      <img
        ref={heroImgRef}
        className="app-splash-fullscreen-img"
        src={splashSrc}
        alt="مصحف أحمد وليلى - Mushaf Ahmed & Laila"
        decoding="sync"
        loading="eager"
        draggable={false}
      />
    </div>
  );
};

export default ImageSplash;
