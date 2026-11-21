export function isTourPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('tourPreview') === '1';
  } catch {
    return false;
  }
}

export function getTourPreviewInitParams(): {
  page: string;
  lang: 'ar' | 'en' | null;
  night: boolean | null;
  variant: 'gold' | 'sky' | 'emerald' | 'burgundy' | null;
} {
  if (typeof window === 'undefined') {
    return { page: 'home', lang: null, night: null, variant: null };
  }
  try {
    const sp = new URLSearchParams(window.location.search);
    const page = sp.get('tourPage') || 'home';
    const rawLang = sp.get('tourLang');
    const lang = rawLang === 'ar' || rawLang === 'en' ? rawLang : null;
    const rawNight = sp.get('tourNight');
    const night = rawNight === '1' ? true : rawNight === '0' ? false : null;
    const rawVariant = sp.get('tourVariant');
    const variant =
      rawVariant === 'gold' || rawVariant === 'sky' || rawVariant === 'emerald' || rawVariant === 'burgundy'
        ? rawVariant
        : null;
    return { page, lang, night, variant };
  } catch {
    return { page: 'home', lang: null, night: null, variant: null };
  }
}
