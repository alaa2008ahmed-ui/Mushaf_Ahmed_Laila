/**
 * Outdoor Prayer Weather Service
 * Fetches accurate weather data & temperature forecast for Fajr & Isha outdoor prayers.
 * Powered by Open-Meteo API using device coordinates (No API keys required).
 */

export interface OutdoorPrayerWeather {
  currentTemp: number;
  currentCode: number;
  currentConditionAr: string;
  currentConditionEn: string;
  fajrTemp: number | null;
  ishaTemp: number | null;
  prayerTemps?: Record<string, { temp: number; code?: number; conditionAr?: string; conditionEn?: string }>;
  windSpeed: number; // km/h
  humidity: number; // %
  adviceAr: string;
  adviceEn: string;
  isRainy: boolean;
  isCold: boolean;
  fetchedAt: number;
}

const WEATHER_CODES_AR: Record<number, string> = {
  0: 'صافٍ ومعتدل',
  1: 'صافٍ غالباً',
  2: 'غائم جزئياً',
  3: 'غائم',
  45: 'ضبابي',
  48: 'ضباب صقيعي',
  51: 'رذاذ خفيف',
  53: 'رذاذ متوسط',
  55: 'رذاذ كثيف',
  61: 'مطر خفيف',
  63: 'مطر متوسط',
  65: 'مطر غزير',
  71: 'تساقط ثلوج خفيف',
  73: 'تساقط ثلوج متوسط',
  75: 'تساقط ثلوج كثيف',
  80: 'زخات مطر خفيفة',
  81: 'زخات مطر متوسطة',
  82: 'زخات مطر غزيرة',
  95: 'عاصفة رعدية',
  96: 'عاصفة رعدية مع برد'
};

const WEATHER_CODES_EN: Record<number, string> = {
  0: 'Clear & Mild',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail'
};

export async function fetchOutdoorPrayerWeather(
  lat: number,
  lng: number,
  fajrTimeStr?: string,
  ishaTimeStr?: string,
  allPrayerTimes?: Record<string, string>
): Promise<OutdoorPrayerWeather | null> {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

  const cacheKey = `outdoor_weather_${lat.toFixed(2)}_${lng.toFixed(2)}`;

  try {
    const cachedStr = localStorage.getItem(cacheKey);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr) as OutdoorPrayerWeather;
      // Cache valid for 30 minutes
      if (Date.now() - cached.fetchedAt < 30 * 60 * 1000) {
        return cached;
      }
    }
  } catch (e) {
    // Ignore cache parse errors
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weathercode,windspeed_10m&forecast_days=2&timezone=auto`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    const current = data.current_weather;
    if (!current) return null;

    const currentTemp = current.temperature ?? 0;
    const currentCode = current.weathercode ?? 0;
    const windSpeed = Math.round(current.windspeed ?? 0);
    
    // Get humidity from hourly if available
    const hourlyTimes: string[] = data.hourly?.time || [];
    const hourlyTemps: number[] = data.hourly?.temperature_2m || [];
    const hourlyCodes: number[] = data.hourly?.weathercode || [];
    const hourlyHumid: number[] = data.hourly?.relative_humidity_2m || [];
    
    const nowIso = new Date().toISOString().slice(0, 13);
    let humidity = 50;
    const nowIdx = hourlyTimes.findIndex(t => t.startsWith(nowIso));
    if (nowIdx !== -1 && hourlyHumid[nowIdx] !== undefined) {
      humidity = Math.round(hourlyHumid[nowIdx]);
    }

    // Determine Fajr & Isha hours
    let fajrHour = 4;
    if (fajrTimeStr && fajrTimeStr.includes(':')) {
      fajrHour = parseInt(fajrTimeStr.split(':')[0], 10) || 4;
    }

    let ishaHour = 20;
    if (ishaTimeStr && ishaTimeStr.includes(':')) {
      ishaHour = parseInt(ishaTimeStr.split(':')[0], 10) || 20;
    }

    let fajrTemp: number | null = null;
    let ishaTemp: number | null = null;
    const prayerTemps: Record<string, { temp: number; code?: number; conditionAr?: string; conditionEn?: string }> = {};

    const prayerDefaults: Record<string, { hour: number; fallbackOffset: number }> = {
      Fajr: { hour: fajrHour, fallbackOffset: -3 },
      Sunrise: { hour: 6, fallbackOffset: -1 },
      Dhuhr: { hour: 12, fallbackOffset: 4 },
      Asr: { hour: 15, fallbackOffset: 3 },
      Maghrib: { hour: 18, fallbackOffset: 0 },
      Isha: { hour: ishaHour, fallbackOffset: -2 }
    };

    const targetTimes: Record<string, string> = {
      Fajr: fajrTimeStr || '04:30',
      Sunrise: allPrayerTimes?.Sunrise || '06:00',
      Dhuhr: allPrayerTimes?.Dhuhr || '12:00',
      Asr: allPrayerTimes?.Asr || '15:15',
      Maghrib: allPrayerTimes?.Maghrib || '18:00',
      Isha: ishaTimeStr || allPrayerTimes?.Isha || '19:30',
      ...(allPrayerTimes || {})
    };

    const todayStr = new Date().toISOString().slice(0, 10);

    Object.entries(targetTimes).forEach(([key, timeVal]) => {
      let prayerHour = prayerDefaults[key]?.hour ?? 12;
      if (typeof timeVal === 'string' && timeVal.includes(':')) {
        prayerHour = parseInt(timeVal.split(':')[0], 10);
        if (isNaN(prayerHour)) prayerHour = prayerDefaults[key]?.hour ?? 12;
      }

      if (hourlyTimes.length > 0 && hourlyTemps.length > 0) {
        const timeKey = `${todayStr}T${prayerHour.toString().padStart(2, '0')}`;
        const pIdx = hourlyTimes.findIndex(t => t.startsWith(timeKey));
        if (pIdx !== -1 && hourlyTemps[pIdx] !== undefined) {
          const temp = Number(hourlyTemps[pIdx]);
          const code = hourlyCodes[pIdx] ?? currentCode;
          prayerTemps[key] = {
            temp,
            code,
            conditionAr: WEATHER_CODES_AR[code] || 'معتدل',
            conditionEn: WEATHER_CODES_EN[code] || 'Mild'
          };
        } else {
          const offset = prayerDefaults[key]?.fallbackOffset ?? 0;
          prayerTemps[key] = {
            temp: currentTemp + offset,
            code: currentCode,
            conditionAr: WEATHER_CODES_AR[currentCode] || 'معتدل',
            conditionEn: WEATHER_CODES_EN[currentCode] || 'Mild'
          };
        }
      } else {
        const offset = prayerDefaults[key]?.fallbackOffset ?? 0;
        prayerTemps[key] = {
          temp: currentTemp + offset,
          code: currentCode,
          conditionAr: WEATHER_CODES_AR[currentCode] || 'معتدل',
          conditionEn: WEATHER_CODES_EN[currentCode] || 'Mild'
        };
      }
    });

    fajrTemp = prayerTemps.Fajr?.temp ?? (currentTemp - 2);
    ishaTemp = prayerTemps.Isha?.temp ?? (currentTemp - 1);

    const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(currentCode);
    const isCold = currentTemp <= 16 || (fajrTemp !== null && fajrTemp <= 16);

    let adviceAr = 'الطقس معتدل ولطيف للخروج لصلاة الجماعة بالمسجد.';
    let adviceEn = 'Weather is pleasant for outdoor walk to the mosque.';

    if (isRainy) {
      adviceAr = 'هناك احتمال لهطول الأمطار، احرص على حمل مظلة واحتساب أجر الخطى للمسجد.';
      adviceEn = 'Rain expected, remember your umbrella & earn rewards walking to the mosque.';
    } else if (isCold) {
      adviceAr = 'الطقس بارد، يُنصح بارتداء ثوب أو معطف دافئ خصوصاً عند صلاة الفجر.';
      adviceEn = 'Cold weather, wear warm clothing especially for Fajr prayer.';
    } else if (currentTemp >= 36) {
      adviceAr = 'الطقس حار، يُستحب اصطحاب سجادة صلاة خاصة والشرب الكافي من الماء.';
      adviceEn = 'Hot weather, carrying your own prayer mat is recommended.';
    }

    const result: OutdoorPrayerWeather = {
      currentTemp,
      currentCode,
      currentConditionAr: WEATHER_CODES_AR[currentCode] || 'معتدل',
      currentConditionEn: WEATHER_CODES_EN[currentCode] || 'Mild',
      fajrTemp,
      ishaTemp,
      prayerTemps,
      windSpeed,
      humidity,
      adviceAr,
      adviceEn,
      isRainy,
      isCold,
      fetchedAt: Date.now()
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (e) {}

    return result;
  } catch (err) {
    console.warn('Outdoor weather fetch failed:', err);
    return null;
  }
}
