import { WORLD_LOCATIONS_DATA, WorldLocationEntry } from '../data/worldLocationsData';
import { getLocalizedLocationName, stripLatinDiacritics, Language } from './prayerTimesTranslations';

export interface LocationSearchSuggestion {
    id: string;
    type: 'city' | 'country' | 'region';
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    subtitleEn: string;
    cityGovAr: string;
    cityGovEn: string;
    fullCountryAr: string;
    fullCountryEn: string;
    combinedCode: string;
    lat: number;
    lng: number;
    countryCode: string;
    source: 'local' | 'online';
}

const DIAL_CODES: Record<string, string> = {
    'sa': '+966', 'eg': '+20', 'ae': '+971', 'kw': '+965', 'qa': '+974', 'bh': '+973',
    'om': '+968', 'jo': '+962', 'sy': '+963', 'lb': '+961', 'ps': '+970', 'iq': '+964',
    'ye': '+967', 'sd': '+249', 'ly': '+218', 'tn': '+216', 'dz': '+213', 'ma': '+212',
    'mr': '+222', 'so': '+252', 'dj': '+253', 'km': '+269', 'tr': '+90', 'us': '+1',
    'gb': '+44', 'fr': '+33', 'de': '+49', 'it': '+39', 'es': '+34', 'ca': '+1',
    'au': '+61', 'nl': '+31', 'be': '+32', 'ch': '+41', 'at': '+43', 'se': '+46',
    'no': '+47', 'dk': '+45', 'gr': '+30', 'ru': '+7', 'ba': '+387', 'pk': '+92',
    'in': '+91', 'id': '+62', 'my': '+60', 'bd': '+880', 'ir': '+98', 'cn': '+86',
    'jp': '+81', 'kr': '+82', 'br': '+55', 'za': '+27', 'ng': '+234'
};

const COUNTRY_NAMES_AR: Record<string, string> = {
    'sa': 'المملكة العربية السعودية', 'eg': 'جمهورية مصر العربية', 'ae': 'الإمارات العربية المتحدة',
    'kw': 'دولة الكويت', 'qa': 'دولة قطر', 'bh': 'مملكة البحرين', 'om': 'سلطنة عمان',
    'jo': 'المملكة الأردنية الهاشمية', 'sy': 'الجمهورية العربية السورية', 'lb': 'الجمهورية اللبنانية',
    'ps': 'دولة فلسطين', 'iq': 'جمهورية العراق', 'ye': 'الجمهورية اليمنية', 'sd': 'جمهورية السودان',
    'ly': 'دولة ليبيا', 'tn': 'الجمهورية التونسية', 'dz': 'الجمهورية الجزائرية الديمقراطية الشعبية',
    'ma': 'المملكة المغربية', 'mr': 'الجمهورية الإسلامية الموريتانية', 'so': 'جمهورية الصومال الفيدرالية',
    'dj': 'جمهورية جيبوتي', 'km': 'جزر القمر', 'tr': 'تركيا', 'us': 'الولايات المتحدة الأمريكية',
    'gb': 'المملكة المتحدة', 'fr': 'فرنسا', 'de': 'ألمانيا', 'it': 'إيطاليا', 'es': 'إسبانيا',
    'ca': 'كندا', 'au': 'أستراليا', 'nl': 'هولندا', 'be': 'بلجيكا', 'ch': 'سويسرا',
    'at': 'النمسا', 'se': 'السويد', 'no': 'النرويج', 'dk': 'الدنمارك', 'gr': 'اليونان',
    'ru': 'روسيا', 'ba': 'البوسنة والهرسك', 'pk': 'باكستان', 'in': 'الهند', 'id': 'إندونيسيا',
    'my': 'ماليزيا', 'bd': 'بنغلاديش', 'ir': 'إيران', 'cn': 'الصين', 'jp': 'اليابان',
    'kr': 'كوريا الجنوبية', 'br': 'البرازيل', 'za': 'جنوب أفريقيا', 'ng': 'نيجيريا'
};

const COUNTRY_NAMES_EN: Record<string, string> = {
    'sa': 'Saudi Arabia', 'eg': 'Egypt', 'ae': 'United Arab Emirates',
    'kw': 'Kuwait', 'qa': 'Qatar', 'bh': 'Bahrain', 'om': 'Oman',
    'jo': 'Jordan', 'sy': 'Syria', 'lb': 'Lebanon',
    'ps': 'Palestine', 'iq': 'Iraq', 'ye': 'Yemen', 'sd': 'Sudan',
    'ly': 'Libya', 'tn': 'Tunisia', 'dz': 'Algeria',
    'ma': 'Morocco', 'mr': 'Mauritania', 'so': 'Somalia',
    'dj': 'Djibouti', 'km': 'Comoros', 'tr': 'Turkey', 'us': 'United States',
    'gb': 'United Kingdom', 'fr': 'France', 'de': 'Germany',
    'it': 'Italy', 'es': 'Spain', 'ca': 'Canada', 'au': 'Australia',
    'nl': 'Netherlands', 'be': 'Belgium', 'ch': 'Switzerland', 'at': 'Austria',
    'se': 'Sweden', 'no': 'Norway', 'dk': 'Denmark', 'gr': 'Greece',
    'ru': 'Russia', 'ba': 'Bosnia and Herzegovina', 'pk': 'Pakistan', 'in': 'India',
    'id': 'Indonesia', 'my': 'Malaysia', 'bd': 'Bangladesh', 'ir': 'Iran',
    'cn': 'China', 'jp': 'Japan', 'kr': 'South Korea', 'br': 'Brazil',
    'za': 'South Africa', 'ng': 'Nigeria'
};

export const getCountryInfo = (countryCode: string, countryName: string, _cityName: string = '') => {
    const code = (countryCode || '').toLowerCase().trim();
    const combinedCode = DIAL_CODES[code] || '';
    const fullNameAr = COUNTRY_NAMES_AR[code] || (countryName ? getLocalizedLocationName(countryName, 'ar') : '');
    const fullNameEn = COUNTRY_NAMES_EN[code] || (countryName ? getLocalizedLocationName(countryName, 'en') : '');
    return {
        fullName: fullNameAr,
        fullNameAr,
        fullNameEn,
        combinedCode
    };
};

const normalizeArSearch = (text: string): string => {
    return (text || '')
        .trim()
        .replace(/[ًٌٍَُِّْـ]/g, '')
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/\s+/g, ' ')
        .toLowerCase();
};

const normalizeEnSearch = (text: string): string => {
    return stripLatinDiacritics(text || '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const stripAlPrefix = (normAr: string): string => {
    return normAr.startsWith('ال') && normAr.length > 3 ? normAr.slice(2) : normAr;
};

const toSuggestionFromLocal = (entry: WorldLocationEntry): LocationSearchSuggestion => {
    const cityGovAr = entry.regionAr ? `${entry.nameAr} - ${entry.regionAr}` : entry.nameAr;
    const cityGovEn = entry.regionEn ? `${entry.nameEn} - ${entry.regionEn}` : entry.nameEn;

    const subtitleAr = entry.type === 'country'
        ? 'دولة'
        : (entry.regionAr ? `${entry.regionAr} · ${entry.countryAr}` : entry.countryAr);

    const subtitleEn = entry.type === 'country'
        ? 'Country'
        : (entry.regionEn ? `${entry.regionEn} · ${entry.countryEn}` : entry.countryEn);

    return {
        id: entry.id,
        type: entry.type,
        titleAr: entry.nameAr,
        titleEn: entry.nameEn,
        subtitleAr,
        subtitleEn,
        cityGovAr,
        cityGovEn,
        fullCountryAr: entry.countryAr,
        fullCountryEn: entry.countryEn,
        combinedCode: DIAL_CODES[entry.countryCode] || '',
        lat: entry.lat,
        lng: entry.lng,
        countryCode: entry.countryCode,
        source: 'local'
    };
};

export const searchLocalLocations = (query: string, limit: number = 10): LocationSearchSuggestion[] => {
    const raw = (query || '').trim();
    if (!raw) return [];

    const hasAr = /[\u0600-\u06FF]/.test(raw);
    const normArQuery = normalizeArSearch(raw);
    const normArNoAl = stripAlPrefix(normArQuery);
    const normEnQuery = normalizeEnSearch(raw);
    const tokens = (hasAr ? normArQuery : normEnQuery).split(' ').filter(Boolean);

    const scored: Array<{ entry: WorldLocationEntry; score: number }> = [];

    for (const entry of WORLD_LOCATIONS_DATA) {
        let score = 0;
        const basePriority = (entry.priority || 70) / 10;

        const nameArNorm = normalizeArSearch(entry.nameAr);
        const nameArNoAl = stripAlPrefix(nameArNorm);
        const aliasesArNorm = (entry.aliasesAr || []).map(normalizeArSearch);
        const regionArNorm = normalizeArSearch(entry.regionAr || '');
        const countryArNorm = normalizeArSearch(entry.countryAr);

        const nameEnNorm = normalizeEnSearch(entry.nameEn);
        const aliasesEnNorm = (entry.aliasesEn || []).map(normalizeEnSearch);
        const regionEnNorm = normalizeEnSearch(entry.regionEn || '');
        const countryEnNorm = normalizeEnSearch(entry.countryEn);

        if (hasAr) {
            if (nameArNorm === normArQuery || nameArNoAl === normArNoAl || aliasesArNorm.includes(normArQuery)) {
                score = 120;
            } else if (
                nameArNorm.startsWith(normArQuery) ||
                nameArNoAl.startsWith(normArNoAl) ||
                aliasesArNorm.some(a => a.startsWith(normArQuery) || stripAlPrefix(a).startsWith(normArNoAl))
            ) {
                score = 95;
            } else if (
                nameArNorm.includes(normArQuery) ||
                nameArNoAl.includes(normArNoAl) ||
                aliasesArNorm.some(a => a.includes(normArQuery))
            ) {
                score = 75;
            } else if (countryArNorm.includes(normArQuery) || regionArNorm.includes(normArQuery)) {
                score = entry.type === 'country' ? 80 : 45;
            } else if (tokens.length > 1) {
                const combinedAr = `${nameArNorm} ${aliasesArNorm.join(' ')} ${regionArNorm} ${countryArNorm}`;
                if (tokens.every(t => combinedAr.includes(t) || combinedAr.includes(stripAlPrefix(t)))) {
                    score = 70;
                }
            }
        } else if (normEnQuery) {
            if (nameEnNorm === normEnQuery || aliasesEnNorm.includes(normEnQuery)) {
                score = 120;
            } else if (
                nameEnNorm.startsWith(normEnQuery) ||
                aliasesEnNorm.some(a => a.startsWith(normEnQuery))
            ) {
                score = 95;
            } else if (
                nameEnNorm.includes(normEnQuery) ||
                aliasesEnNorm.some(a => a.includes(normEnQuery))
            ) {
                score = 75;
            } else if (countryEnNorm.includes(normEnQuery) || regionEnNorm.includes(normEnQuery)) {
                score = entry.type === 'country' ? 80 : 45;
            } else if (tokens.length > 1) {
                const combinedEn = `${nameEnNorm} ${aliasesEnNorm.join(' ')} ${regionEnNorm} ${countryEnNorm}`;
                if (tokens.every(t => combinedEn.includes(t))) {
                    score = 70;
                }
            }
        }

        if (score > 0) {
            scored.push({ entry, score: score + basePriority });
        }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(item => toSuggestionFromLocal(item.entry));
};

const inferLocationType = (item: any): 'city' | 'country' | 'region' => {
    const addrType = (item?.addresstype || item?.type || '').toLowerCase();
    const cls = (item?.class || '').toLowerCase();
    if (addrType === 'country' || (cls === 'boundary' && item?.address?.country && !item?.address?.city && !item?.address?.town && !item?.address?.village && !item?.address?.state)) {
        return 'country';
    }
    if (addrType === 'state' || addrType === 'province' || addrType === 'region' || addrType === 'governorate') {
        return 'region';
    }
    return 'city';
};

const parseNominatimResults = (data: any[]): LocationSearchSuggestion[] => {
    if (!Array.isArray(data)) return [];
    const results: LocationSearchSuggestion[] = [];

    for (const item of data) {
        const lat = parseFloat(item?.lat);
        const lng = parseFloat(item?.lon);
        if (isNaN(lat) || isNaN(lng)) continue;

        const addr = item.address || {};
        const namedetails = item.namedetails || {};
        const countryCode = (addr.country_code || '').toLowerCase();
        const type = inferLocationType(item);

        const rawPrimary =
            type === 'country'
                ? (addr.country || item.name || item.display_name?.split(',')[0] || '')
                : (addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state_district || addr.suburb || addr.state || item.name || item.display_name?.split(',')[0] || '');

        if (!rawPrimary) continue;

        const rawArName = namedetails['name:ar'] || '';
        const rawEnName = namedetails['name:en'] || '';

        const titleAr = rawArName ? getLocalizedLocationName(rawArName, 'ar') : getLocalizedLocationName(rawPrimary, 'ar');
        const titleEn = rawEnName ? getLocalizedLocationName(rawEnName, 'en') : getLocalizedLocationName(rawPrimary, 'en');

        const rawState = addr.state || addr.region || addr.province || '';
        const regionAr = rawState && normalizeArSearch(rawState) !== normalizeArSearch(titleAr)
            ? getLocalizedLocationName(rawState, 'ar')
            : '';
        const regionEn = rawState && normalizeEnSearch(rawState) !== normalizeEnSearch(titleEn)
            ? getLocalizedLocationName(rawState, 'en')
            : '';

        const countryInfo = getCountryInfo(countryCode, addr.country || '', titleAr);
        const fullCountryAr = countryInfo.fullNameAr || (addr.country ? getLocalizedLocationName(addr.country, 'ar') : titleAr);
        const fullCountryEn = countryInfo.fullNameEn || (addr.country ? getLocalizedLocationName(addr.country, 'en') : titleEn);

        const cityGovAr = type === 'country'
            ? fullCountryAr
            : (regionAr && regionAr !== titleAr ? `${titleAr} - ${regionAr}` : titleAr);
        const cityGovEn = type === 'country'
            ? fullCountryEn
            : (regionEn && regionEn !== titleEn ? `${titleEn} - ${regionEn}` : titleEn);

        const subtitleAr = type === 'country'
            ? 'دولة'
            : [regionAr, fullCountryAr].filter(Boolean).join(' · ');
        const subtitleEn = type === 'country'
            ? 'Country'
            : [regionEn, fullCountryEn].filter(Boolean).join(' · ');

        results.push({
            id: `nom-${item.place_id || `${lat.toFixed(3)}-${lng.toFixed(3)}`}`,
            type,
            titleAr: type === 'country' ? fullCountryAr : titleAr,
            titleEn: type === 'country' ? fullCountryEn : titleEn,
            subtitleAr: subtitleAr || fullCountryAr,
            subtitleEn: subtitleEn || fullCountryEn,
            cityGovAr,
            cityGovEn,
            fullCountryAr,
            fullCountryEn,
            combinedCode: countryInfo.combinedCode,
            lat,
            lng,
            countryCode,
            source: 'online'
        });
    }

    return results;
};

const parseOpenMeteoResults = (data: any): LocationSearchSuggestion[] => {
    const items = data?.results;
    if (!Array.isArray(items)) return [];

    const results: LocationSearchSuggestion[] = [];
    for (const item of items) {
        const lat = Number(item?.latitude);
        const lng = Number(item?.longitude);
        if (isNaN(lat) || isNaN(lng) || !item?.name) continue;

        const countryCode = (item.country_code || '').toLowerCase();
        const fCode = (item.feature_code || '').toUpperCase();
        const type: 'city' | 'country' | 'region' =
            fCode === 'PCLI' || fCode === 'PCLD' || fCode === 'PCLF'
                ? 'country'
                : fCode.startsWith('ADM1')
                ? 'region'
                : 'city';

        const titleAr = getLocalizedLocationName(item.name, 'ar');
        const titleEn = getLocalizedLocationName(item.name, 'en');

        const regionAr = item.admin1 ? getLocalizedLocationName(item.admin1, 'ar') : '';
        const regionEn = item.admin1 ? getLocalizedLocationName(item.admin1, 'en') : '';

        const countryInfo = getCountryInfo(countryCode, item.country || '', titleAr);
        const fullCountryAr = countryInfo.fullNameAr || (item.country ? getLocalizedLocationName(item.country, 'ar') : titleAr);
        const fullCountryEn = countryInfo.fullNameEn || (item.country ? getLocalizedLocationName(item.country, 'en') : titleEn);

        const cityGovAr = type === 'country'
            ? fullCountryAr
            : (regionAr && regionAr !== titleAr ? `${titleAr} - ${regionAr}` : titleAr);
        const cityGovEn = type === 'country'
            ? fullCountryEn
            : (regionEn && regionEn !== titleEn ? `${titleEn} - ${regionEn}` : titleEn);

        const subtitleAr = type === 'country'
            ? 'دولة'
            : [regionAr, fullCountryAr].filter(Boolean).join(' · ');
        const subtitleEn = type === 'country'
            ? 'Country'
            : [regionEn, fullCountryEn].filter(Boolean).join(' · ');

        results.push({
            id: `om-${item.id || `${lat.toFixed(3)}-${lng.toFixed(3)}`}`,
            type,
            titleAr: type === 'country' ? fullCountryAr : titleAr,
            titleEn: type === 'country' ? fullCountryEn : titleEn,
            subtitleAr: subtitleAr || fullCountryAr,
            subtitleEn: subtitleEn || fullCountryEn,
            cityGovAr,
            cityGovEn,
            fullCountryAr,
            fullCountryEn,
            combinedCode: countryInfo.combinedCode,
            lat,
            lng,
            countryCode,
            source: 'online'
        });
    }

    return results;
};

export const mergeLocationResults = (
    localList: LocationSearchSuggestion[],
    onlineList: LocationSearchSuggestion[],
    maxResults: number = 12
): LocationSearchSuggestion[] => {
    const merged: LocationSearchSuggestion[] = [...localList];

    for (const candidate of onlineList) {
        const candTitleAr = normalizeArSearch(candidate.titleAr);
        const candTitleEn = normalizeEnSearch(candidate.titleEn);

        const isDuplicate = merged.some(existing => {
            const distLat = Math.abs(existing.lat - candidate.lat);
            const distLng = Math.abs(existing.lng - candidate.lng);
            const closeCoords = distLat < 0.12 && distLng < 0.12;
            const sameCountry = !existing.countryCode || !candidate.countryCode || existing.countryCode === candidate.countryCode;
            const sameTitleAr = normalizeArSearch(existing.titleAr) === candTitleAr;
            const sameTitleEn = normalizeEnSearch(existing.titleEn) === candTitleEn;
            return (closeCoords && (sameTitleAr || sameTitleEn || existing.type === candidate.type)) || (sameCountry && sameTitleAr && sameTitleEn);
        });

        if (!isDuplicate) {
            merged.push(candidate);
        }
    }

    return merged.slice(0, maxResults);
};

export const searchOnlineLocations = async (
    query: string,
    language: Language = 'ar',
    externalSignal?: AbortSignal
): Promise<LocationSearchSuggestion[]> => {
    const q = (query || '').trim();
    if (q.length < 2) return [];

    const isEn = language === 'en';
    const langParam = isEn ? 'en,ar' : 'ar,en';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const onExternalAbort = () => controller.abort();
    if (externalSignal) {
        if (externalSignal.aborted) {
            clearTimeout(timeoutId);
            return [];
        }
        externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }

    try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&namedetails=1&accept-language=${langParam}&limit=8`;
        const omUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=${isEn ? 'en' : 'ar'}&format=json`;

        const [nomRes, omRes] = await Promise.allSettled([
            fetch(nomUrl, { signal: controller.signal }).then(r => (r.ok ? r.json() : [])),
            fetch(omUrl, { signal: controller.signal }).then(r => (r.ok ? r.json() : null))
        ]);

        const nomResults = nomRes.status === 'fulfilled' ? parseNominatimResults(nomRes.value) : [];
        const omResults = omRes.status === 'fulfilled' && omRes.value ? parseOpenMeteoResults(omRes.value) : [];

        return mergeLocationResults(nomResults, omResults, 10);
    } catch {
        return [];
    } finally {
        clearTimeout(timeoutId);
        if (externalSignal) {
            externalSignal.removeEventListener('abort', onExternalAbort);
        }
    }
};
