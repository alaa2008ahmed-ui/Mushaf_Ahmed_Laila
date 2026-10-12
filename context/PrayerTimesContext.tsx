import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import moment from 'moment-hijri';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { prayerNamesAr } from '../data/prayerTimesData';
import { checkSupportsDST, calculateNightTimes } from '../utils/prayerTimesUtils';
import { updateAndroidWidget } from '../utils/widgetUtils';
import { LocalNotifications } from '@capacitor/local-notifications';
import { scheduleDeviceSilentWindows, cancelAllDeviceSilentWindows, setDeviceSilentNow } from '../utils/silentMode';
import { useTheme } from './ThemeContext';

// --- Types ---
interface PrayerConfig {
    iqamaOffsets: Record<string, number>;
    prayerOffsets: Record<string, number>;
    tones: Record<string, { name: string; data: string; originalUrl?: string }>;
    mutedPrayers: Record<string, boolean>;
    location: {
        cityGov: string;
        fullCountry: string;
        combinedCode: string;
        lat: number;
        lng: number;
    };
    isSummerTime?: boolean;
    syncWidgetTheme?: boolean;
    nightNotifications?: {
        firstThird: boolean;
        midnight: boolean;
        lastThird: boolean;
    };
    audioMutedUntil?: number;
    preAthanReminder?: {
        enabled: boolean;
        minutes: number;
    };
    autoSilent?: boolean;
    autoSilentDuration?: number;
    // Per-prayer overrides (when global setting is off)
    prayerPreReminders?: Record<string, { enabled: boolean; minutes: number }>;
    prayerAutoSilent?: Record<string, { enabled: boolean; duration: number }>;
    // Iqama alert settings
    iqamaReminder?: {
        enabled: boolean;
        minutes?: number;
    };
    prayerIqamaReminders?: Record<string, { enabled: boolean; minutes?: number }>;
}

interface PrayerTimesContextType {
    times: Record<string, string>;
    dates: { hijri: string; gregorian: string };
    nextPrayer: { key: string; date: Date; name: string } | null;
    countdown: string;
    config: PrayerConfig;
    setConfig: React.Dispatch<React.SetStateAction<PrayerConfig>>;
    refreshLocation: () => Promise<void>;
    manualSearch: (query: string) => Promise<void>;
    updateConfig: (newConfig: Partial<PrayerConfig>) => void;
    isPrayerSilentActive?: boolean;
    activeSilentPrayerName?: string;
}

// --- Default Configuration ---
const DEFAULT_CONFIG: PrayerConfig = {
    iqamaOffsets: { Fajr: 20, Dhuhr: 15, Asr: 15, Maghrib: 10, Isha: 15 },
    prayerOffsets: { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 },
    tones: {},
    mutedPrayers: { Sunrise: true },
    location: { cityGov: "الدمام - الشرقية", fullCountry: "المملكة العربية السعودية", combinedCode: "+966013", lat: 26.4207, lng: 50.0888 },
    isSummerTime: false,
    syncWidgetTheme: true,
    nightNotifications: { firstThird: true, midnight: true, lastThird: true },
    preAthanReminder: { enabled: false, minutes: 15 },
    autoSilent: false,
    autoSilentDuration: 30,
    iqamaReminder: { enabled: false, minutes: 15 }
};



// --- Helper Functions ---
const fetchWithTimeout = async (url: string, options: any = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
};

const applyOffset = (timeStr: string, offsetMins: number) => {
    if (!timeStr || timeStr.includes('--')) return "--:--";
    let [h, m] = timeStr.split(':');
    let date = new Date();
    date.setHours(parseInt(h), parseInt(m), 0);
    date.setMinutes(date.getMinutes() + (offsetMins || 0));
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const getCountryInfo = (countryCode: string, countryName: string, cityName: string) => {
    const code = countryCode?.toLowerCase() || '';
    
    const dialCodes: Record<string, string> = {
        'sa': '+966', 'eg': '+20', 'ae': '+971', 'kw': '+965', 'qa': '+974', 'bh': '+973', 
        'om': '+968', 'jo': '+962', 'sy': '+963', 'lb': '+961', 'ps': '+970', 'iq': '+964', 
        'ye': '+967', 'sd': '+249', 'ly': '+218', 'tn': '+216', 'dz': '+213', 'ma': '+212', 
        'mr': '+222', 'so': '+252', 'dj': '+253', 'tr': '+90', 'us': '+1', 'gb': '+44',
        'fr': '+33', 'de': '+49', 'it': '+39', 'es': '+34', 'ca': '+1', 'au': '+61'
    };

    const fullNames: Record<string, string> = {
        'sa': 'المملكة العربية السعودية', 'eg': 'جمهورية مصر العربية', 'ae': 'الإمارات العربية المتحدة',
        'kw': 'دولة الكويت', 'qa': 'دولة قطر', 'bh': 'مملكة البحرين', 'om': 'سلطنة عمان',
        'jo': 'المملكة الأردنية الهاشمية', 'sy': 'الجمهورية العربية السورية', 'lb': 'الجمهورية اللبنانية',
        'ps': 'دولة فلسطين', 'iq': 'جمهورية العراق', 'ye': 'الجمهورية اليمنية', 'sd': 'جمهورية السودان',
        'ly': 'دولة ليبيا', 'tn': 'الجمهورية التونسية', 'dz': 'الجمهورية الجزائرية الديمقراطية الشعبية',
        'ma': 'المملكة المغربية', 'mr': 'الجمهورية الإسلامية الموريتانية', 'so': 'جمهورية الصومال الفيدرالية',
        'dj': 'جمهورية جيبوتي'
    };

    const saudiCities: Record<string, string> = {
        'الرياض': '11', 'الخرج': '11', 'مكة': '12', 'مكة المكرمة': '12', 'جدة': '12', 'الطائف': '12',
        'الدمام': '13', 'الخبر': '13', 'الظهران': '13', 'الجبيل': '13', 'الأحساء': '13', 'الهفوف': '13', 'حفر الباطن': '13',
        'المدينة': '14', 'المدينة المنورة': '14', 'تبوك': '14', 'ينبع': '14', 'عرعر': '14',
        'القصيم': '16', 'بريدة': '16', 'عنيزة': '16', 'حائل': '16', 'المجمعة': '16',
        'أبها': '17', 'خميس مشيط': '17', 'نجران': '17', 'جازان': '17', 'الباحة': '17'
    };

    const egyptCities: Record<string, string> = {
        'القاهرة': '2', 'الجيزة': '2', 'الإسكندرية': '3', 'بورسعيد': '66', 'السويس': '62', 'الإسماعيلية': '64',
        'الأقصر': '95', 'أسوان': '97', 'أسيوط': '88', 'سوهاج': '93', 'المنصورة': '50', 'الدقهلية': '50',
        'الزقازيق': '55', 'الشرقية': '55', 'طنطا': '40', 'الغربية': '40', 'المنوفية': '48', 'شبين الكوم': '48',
        'البحيرة': '45', 'دمنهور': '45', 'الفيوم': '84', 'بني سويف': '82', 'المنيا': '86', 'قنا': '96',
        'دمياط': '57', 'كفر الشيخ': '47', 'البحر الأحمر': '65', 'الغردقة': '65', 'الوادي الجديد': '92',
        'مطروح': '46', 'شمال سيناء': '68', 'العريش': '68', 'جنوب سيناء': '69', 'الطور': '69', 'شرم الشيخ': '69'
    };

    let baseDialCode = dialCodes[code] || '';
    let fullName = fullNames[code] || countryName;
    let combinedCode = baseDialCode; // Keep it simple: just the dial code

    return { fullName, combinedCode };
};

const getCalculationParams = (date: Date, locationData?: any) => {
    let params = CalculationMethod.MuslimWorldLeague();
    let methodId = 3; // MWL

    const country = locationData?.fullCountry || '';
    const code = locationData?.combinedCode || '';

    if (code.startsWith('+20') || country.includes('مصر')) {
        params = CalculationMethod.Egyptian();
        methodId = 5;
    } else if (code.startsWith('+966') || country.includes('السعودية')) {
        params = CalculationMethod.UmmAlQura();
        methodId = 4;
    } else if (code.startsWith('+971') || country.includes('الإمارات')) {
        params = CalculationMethod.Dubai();
        methodId = 16;
    } else if (code.startsWith('+965') || country.includes('الكويت')) {
        params = CalculationMethod.Kuwait();
        methodId = 9;
    } else if (code.startsWith('+974') || country.includes('قطر')) {
        params = CalculationMethod.Qatar();
        methodId = 10;
    } else if (code.startsWith('+1') || country.includes('أمريكا') || country.includes('كندا')) {
        params = CalculationMethod.NorthAmerica();
        methodId = 2;
    } else if (code.startsWith('+90') || country.includes('تركيا')) {
        params = CalculationMethod.Turkey();
        methodId = 13;
    } else if (code.startsWith('+92') || country.includes('باكستان')) {
        params = CalculationMethod.Karachi();
        methodId = 1;
    }

    return { params, methodId };
};

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const PrayerTimesProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<PrayerConfig>(() => {
        try {
            const saved = localStorage.getItem('prayerFinal_v34');
            if (saved) {
                return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
            }
            // Migrate from v33 ensuring new default: preAthanReminder, autoSilent, iqamaReminder are false
            const oldSaved = localStorage.getItem('prayerFinal_v33');
            if (oldSaved) {
                const parsed = JSON.parse(oldSaved);
                return {
                    ...DEFAULT_CONFIG,
                    ...parsed,
                    preAthanReminder: { enabled: false, minutes: parsed.preAthanReminder?.minutes || 15 },
                    autoSilent: false,
                    iqamaReminder: { enabled: false, minutes: parsed.iqamaReminder?.minutes || 15 }
                };
            }
            return DEFAULT_CONFIG;
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    });

    const { themeKey } = useTheme();
    const [times, setTimes] = useState<Record<string, string>>({});
    const [dates, setDates] = useState({ hijri: "-- -- --", gregorian: "-- -- --" });
    const [nextPrayer, setNextPrayer] = useState<{ key: string; date: Date; name: string } | null>(null);
    const [countdown, setCountdown] = useState("00:00:00");
    const [isPrayerSilentActive, setIsPrayerSilentActive] = useState(false);
    const [activeSilentPrayerName, setActiveSilentPrayerName] = useState('');

    // Check if phone/app should be automatically silent during prayer time
    useEffect(() => {
        if (!times || Object.keys(times).length === 0) {
            setIsPrayerSilentActive(false);
            setActiveSilentPrayerName('');
            return;
        }

        const checkSilentStatus = () => {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();

            const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let foundActive = false;
            let activeName = '';

            for (const key of prayerKeys) {
                // If prayer is muted by user (red circle), skip auto-silent completely for it
                if (config.mutedPrayers?.[key]) continue;

                // Determine if auto-silent is enabled for this prayer
                let isSilentEnabled = false;
                let duration = 30;

                if (config.prayerAutoSilent?.[key] !== undefined) {
                    // Per-prayer override takes precedence
                    isSilentEnabled = !!config.prayerAutoSilent[key].enabled;
                    duration = config.prayerAutoSilent[key].duration || 30;
                } else if (config.autoSilent) {
                    // Global is ON: applies to all prayers
                    isSilentEnabled = true;
                    duration = config.autoSilentDuration || 30;
                }

                if (!isSilentEnabled) continue;

                const timeStr = times[key];
                if (!timeStr || timeStr.includes('--')) continue;

                const [h, m] = timeStr.split(':').map(Number);
                const supportsDST = checkSupportsDST(config.location?.combinedCode, config.location?.fullCountry);
                const totalOffset = (config.prayerOffsets[key] || 0) + ((config.isSummerTime && supportsDST) ? 60 : 0);
                const prayerMin = h * 60 + m + totalOffset;
                
                // Silent mode starts at Iqama time (Adhan + Iqama offset), not at Adhan time
                const iqamaOffset = config.iqamaOffsets?.[key] !== undefined ? config.iqamaOffsets[key] : (config.iqamaReminder?.minutes ?? 15);
                const silentStartMin = prayerMin + iqamaOffset;

                if (nowMinutes >= silentStartMin && nowMinutes < silentStartMin + duration) {
                    foundActive = true;
                    activeName = prayerNamesAr[key] || key;
                    break;
                }
            }

            setIsPrayerSilentActive(foundActive);
            setActiveSilentPrayerName(activeName);
            if (foundActive) {
                setDeviceSilentNow(true, activeName);
            } else {
                setDeviceSilentNow(false);
            }
        };

        checkSilentStatus();
        const interval = setInterval(checkSilentStatus, 30000);
        return () => clearInterval(interval);
    }, [config.autoSilent, config.autoSilentDuration, config.prayerAutoSilent, config.mutedPrayers, config.iqamaOffsets, config.iqamaReminder, times, config.prayerOffsets, config.isSummerTime, config.location]);

    // --- Save Config ---
    useEffect(() => {
        localStorage.setItem('prayerFinal_v34', JSON.stringify(config));
        // Re-calculate times when config changes (e.g. location)
        fetchTimesForLocation(config.location);
    }, [config]);

    // --- Calculation Logic ---
    const fetchTimesForLocation = useCallback(async (locationData: any) => {
        const { lat, lng } = locationData;
        try {
            const date = new Date();
            const { params, methodId } = getCalculationParams(date, locationData);
            
            let timings: any = null;
            let hijriDate = "";
            let gregorianDate = "";

            // Try AlAdhan API first for maximum accuracy and official times
            try {
                const timestamp = Math.floor(date.getTime() / 1000);
                const apiRes = await fetchWithTimeout(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${methodId}`, {}, 5000);
                const apiData = await apiRes.json();
                
                if (apiData && apiData.code === 200) {
                    const data = apiData.data;
                    timings = {
                        Fajr: data.timings.Fajr,
                        Sunrise: data.timings.Sunrise,
                        Dhuhr: data.timings.Dhuhr,
                        Asr: data.timings.Asr,
                        Maghrib: data.timings.Maghrib,
                        Isha: data.timings.Isha,
                    };
                    
                    // Use API dates for consistency
                    hijriDate = `${data.date.hijri.day} ${data.date.hijri.month.ar} ${data.date.hijri.year}`;
                    gregorianDate = `${data.date.gregorian.day} ${data.date.gregorian.month.en} ${data.date.gregorian.year}`;
                    
                    // Store timezone offset for countdown logic
                    const timezone = data.meta.timezone;
                    localStorage.setItem('grandLocationTimezone', timezone);
                }
            } catch (apiErr) {
                console.warn("AlAdhan API failed, falling back to local calculation:", apiErr);
            }

            // Fallback to local calculation if API fails
            if (!timings) {
                const coordinates = new Coordinates(lat, lng);
                const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);

                const formatTime = (d: Date) => {
                    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                };

                // Ramadan Isha Adjustment for specific countries (Saudi Arabia, Qatar)
                const isRamadan = moment(date).iMonth() === 8;
                const country = locationData?.fullCountry || '';
                const code = locationData?.combinedCode || '';
                let ishaTime = prayerTimes.isha;
                if (isRamadan && (code.startsWith('+966') || country.includes('السعودية') || code.startsWith('+974') || country.includes('قطر'))) {
                    const diffMinutes = (ishaTime.getTime() - prayerTimes.maghrib.getTime()) / 60000;
                    if (diffMinutes < 110) {
                        ishaTime = new Date(ishaTime.getTime() + 30 * 60000);
                    }
                }

                timings = {
                    Fajr: formatTime(prayerTimes.fajr),
                    Sunrise: formatTime(prayerTimes.sunrise),
                    Dhuhr: formatTime(prayerTimes.dhuhr),
                    Asr: formatTime(prayerTimes.asr),
                    Maghrib: formatTime(prayerTimes.maghrib),
                    Isha: formatTime(ishaTime),
                };

                const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
                hijriDate = hijriFormatter.format(date);
                
                const gregorianFormatter = new Intl.DateTimeFormat('ar-EG', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
                gregorianDate = gregorianFormatter.format(date);
            }

            const datesData = { hijri: hijriDate, gregorian: gregorianDate };

            setTimes(timings);
            setDates(datesData);
            
            // Cache for offline use
            localStorage.setItem('grandPrayersCache', JSON.stringify({ timings, dates: datesData }));
            
        } catch(e) { console.error("Failed to calculate prayer times:", e); }
    }, []);

    const refreshLocation = useCallback(async () => {
        return new Promise<void>(async (resolve, reject) => {
            const fetchByIP = async () => {
                const fallbacks = [
                    {
                        url: 'https://ipapi.co/json/',
                        parser: (data: any) => ({
                            lat: data.latitude,
                            lng: data.longitude,
                            cityGov: `${data.city} - ${data.region}`,
                            fullCountry: data.country_name,
                            combinedCode: data.country_calling_code
                        })
                    },
                    {
                        url: 'https://ipwho.is/',
                        parser: (data: any) => ({
                            lat: data.latitude,
                            lng: data.longitude,
                            cityGov: `${data.city} - ${data.region}`,
                            fullCountry: data.country,
                            combinedCode: data.calling_code ? `+${data.calling_code}` : ''
                        })
                    },
                    {
                        url: 'https://freeipapi.com/api/json',
                        parser: (data: any) => ({
                            lat: data.latitude,
                            lng: data.longitude,
                            cityGov: `${data.cityName} - ${data.regionName}`,
                            fullCountry: data.countryName,
                            combinedCode: data.countryCode
                        })
                    }
                ];

                for (const service of fallbacks) {
                    try {
                        const res = await fetchWithTimeout(service.url, { cache: 'no-cache' }, 5000);
                        if (!res.ok) continue;
                        const data = await res.json();
                        const newLoc = service.parser(data);
                        if (newLoc.lat && newLoc.lng) {
                            setConfig(prev => ({ ...prev, location: newLoc }));
                            resolve();
                            return;
                        }
                    } catch (e) {
                        console.warn(`IP location fetch failed for ${service.url}:`, e);
                    }
                }
                reject(new Error("Failed to fetch location by IP from all services"));
            };

            try {
                if (Capacitor.isNativePlatform()) {
                    const permStatus = await Geolocation.checkPermissions();
                    if (permStatus.location !== 'granted') {
                        const requestStatus = await Geolocation.requestPermissions();
                        if (requestStatus.location !== 'granted') {
                            throw new Error("Location permission denied");
                        }
                    }
                }

                const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
                const { latitude, longitude } = pos.coords;
                let newLoc = {
                    lat: latitude, lng: longitude,
                    cityGov: 'موقعي الحالي', fullCountry: '', combinedCode: ''
                };
                try {
                    const res = await fetchWithTimeout(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`, {}, 7000);
                    const data = await res.json();
                    if (data && data.address) {
                        const addr = data.address;
                        const city = addr.village || addr.town || addr.city || "موقعي";
                        const countryInfo = getCountryInfo(addr.country_code, addr.country, city);
                        newLoc = {
                            ...newLoc,
                            cityGov: `${city}${addr.state ? ` - ${addr.state}` : ''}`,
                            fullCountry: countryInfo.fullName,
                            combinedCode: countryInfo.combinedCode
                        };
                    } else {
                        throw new Error("No address");
                    }
                } catch(e) {
                    try {
                        const res2 = await fetchWithTimeout(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`, {}, 7000);
                        const data2 = await res2.json();
                        if (data2 && data2.countryName) {
                            newLoc = {
                                ...newLoc,
                                cityGov: data2.city || data2.locality || "موقعي الحالي",
                                fullCountry: data2.countryName,
                                combinedCode: ""
                            };
                        } else {
                            throw new Error("No data");
                        }
                    } catch (err) {
                        newLoc.cityGov = "موقعي الحالي";
                    }
                }
                setConfig(prev => ({ ...prev, location: newLoc }));
                resolve();
            } catch (err) {
                console.warn("Geolocation failed, falling back to IP:", err);
                fetchByIP();
            }
        });
    }, []);

    const manualSearch = useCallback(async (query: string) => {
        if(!query) return;
        try {
            const res = await fetchWithTimeout(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&accept-language=ar&limit=1`, {}, 5000);
            const data = await res.json();
            if(data && data.length > 0) {
                const addr = data[0].address;
                const name = addr.city || addr.town || addr.village || query;
                const province = addr.state || "";
                const countryInfo = getCountryInfo(addr.country_code, addr.country, name);
                const newLocation = {
                    cityGov: `${name} - ${province}`,
                    fullCountry: countryInfo.fullName,
                    combinedCode: countryInfo.combinedCode,
                    lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon)
                };
                setConfig(prev => ({ ...prev, location: newLocation }));
            } else {
                throw new Error("لم يتم العثور على نتائج");
            }
        } catch(e) { 
            throw e;
        } 
    }, []);

    const updateConfig = useCallback((newConfig: Partial<PrayerConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    // --- Notification & Auto-Silent Scheduling ---
    const scheduleNotifications = useCallback(async () => {
        const isNative = Capacitor.isNativePlatform();
        const w = window as any;

        const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const notificationsToSchedule: any[] = [];
        const silentWindowsToSchedule: any[] = [];

        // Setup notification channels and check permissions for LocalNotifications on Capacitor
        if (isNative) {
            try {
                const perm = await LocalNotifications.checkPermissions();
                if (perm.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }

                // Ensure Android notification channels exist
                await LocalNotifications.createChannel({
                    id: 'adhan_general_channel',
                    name: 'أذان الصلوات',
                    description: 'إشعارات الأذان لمواقيت الصلاة',
                    importance: 5,
                    vibration: true,
                    visibility: 1
                });

                await LocalNotifications.createChannel({
                    id: 'pre_adhan_reminder_channel',
                    name: 'تنبيه الاستعداد للصلاة',
                    description: 'تنبيه قبل الأذان للوضوء والاستعداد والذهاب إلى المسجد',
                    importance: 4,
                    vibration: true,
                    visibility: 1
                });

                await LocalNotifications.createChannel({
                    id: 'iqama_reminder_channel',
                    name: 'تنبيه إقامة الصلاة',
                    description: 'تنبيه عند حلول موعد إقامة الصلاة',
                    importance: 5,
                    sound: 'takbeer1.mp3',
                    vibration: true,
                    visibility: 1
                });

                await LocalNotifications.createChannel({
                    id: 'night_times_channel',
                    name: 'تنبيهات أوقات الليل',
                    description: 'إشعارات لأوقات أول الليل، منتصف الليل، والثلث الأخير',
                    importance: 4,
                    vibration: true,
                    visibility: 1
                });
            } catch (err) {
                console.warn('Error configuring LocalNotifications channels:', err);
            }
        }

        // Calculate schedule for today and next 6 days (total 7 days)
        for (let day = 0; day < 7; day++) {
            const date = new Date();
            date.setDate(date.getDate() + day);

            const coordinates = new Coordinates(config.location.lat, config.location.lng);
            const { params } = getCalculationParams(date, config.location);
            const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);

            const dayTimings: any = {
                Fajr: prayerTimes.fajr,
                Dhuhr: prayerTimes.dhuhr,
                Asr: prayerTimes.asr,
                Maghrib: prayerTimes.maghrib,
                Isha: prayerTimes.isha,
            };

            // Ramadan Isha Adjustment
            const isRamadan = moment(date).iMonth() === 8;
            const country = config.location.fullCountry || '';
            const code = config.location.combinedCode || '';
            if (isRamadan && (code.startsWith('+966') || country.includes('السعودية') || code.startsWith('+974') || country.includes('قطر'))) {
                const diffMinutes = (dayTimings.Isha.getTime() - dayTimings.Maghrib.getTime()) / 60000;
                if (diffMinutes < 110) {
                    dayTimings.Isha = new Date(dayTimings.Isha.getTime() + 30 * 60000);
                }
            }

            for (const key of prayerKeys) {
                let prayerDate = new Date(dayTimings[key]);
                const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
                const totalOffset = (config.prayerOffsets[key] || 0) + ((config.isSummerTime && supportsDST) ? 60 : 0);
                prayerDate.setMinutes(prayerDate.getMinutes() + totalOffset);

                // 1. Adhan Notification (scheduled only if not muted)
                if (!config.mutedPrayers?.[key] && key !== 'Sunrise') {
                    const toneConfig = config.tones?.[key];
                    let soundFileName = 'takbeer1.mp3';
                    let playSound = true;

                    if (config.audioMutedUntil && prayerDate.getTime() < config.audioMutedUntil) {
                        playSound = false;
                    } else if (toneConfig && toneConfig.data) {
                        if (toneConfig.data === 'none') {
                            playSound = false;
                        } else if (toneConfig.data.includes('azan') || toneConfig.data.includes('takbeer')) {
                            const fname = toneConfig.data.split('/').pop() || 'takbeer1.mp3';
                            soundFileName = fname.endsWith('.mp3') ? fname : fname + '.mp3';
                        }
                    }

                    if (prayerDate > new Date()) {
                        const notifId = 1000 + (day * 10) + prayerKeys.indexOf(key) + 1;
                        notificationsToSchedule.push({
                            id: notifId,
                            title: `حان الآن موعد أذان ${prayerNamesAr[key]}`,
                            body: 'لا تنس ذكر الله. قال رسول الله ﷺ: "أرحنا بها يا بلال"',
                            schedule: { at: prayerDate, allowWhileIdle: true },
                            channelId: 'adhan_general_channel',
                            sound: playSound ? soundFileName : undefined,
                            smallIcon: 'ic_stat_name',
                            extra: { type: 'adhan', prayer: key }
                        });
                    }
                }

                // 2. Pre-Adhan Preparation Reminder
                let isPreReminderEnabled = false;
                let reminderMinutes = 15;

                if (config.prayerPreReminders?.[key] !== undefined) {
                    isPreReminderEnabled = !!config.prayerPreReminders[key].enabled;
                    reminderMinutes = config.prayerPreReminders[key].minutes || 15;
                } else if (config.preAthanReminder && config.preAthanReminder.enabled !== false) {
                    isPreReminderEnabled = true;
                    reminderMinutes = config.preAthanReminder.minutes || 15;
                }

                if (isPreReminderEnabled && key !== 'Sunrise') {
                    const prePrayerDate = new Date(prayerDate.getTime() - reminderMinutes * 60000);
                    if (prePrayerDate > new Date()) {
                        notificationsToSchedule.push({
                            id: 5000 + (day * 10) + prayerKeys.indexOf(key) + 1,
                            title: `⏰ اقترب موعد أذان ${prayerNamesAr[key]} (بقي ${reminderMinutes} دقيقة)`,
                            body: `حان وقت الوضوء والاستعداد والذهاب إلى المسجد لأداء صلاة ${prayerNamesAr[key]} 🕌`,
                            schedule: { at: prePrayerDate, allowWhileIdle: true },
                            channelId: 'pre_adhan_reminder_channel',
                            smallIcon: 'ic_stat_name',
                            extra: { type: 'pre_adhan', prayer: key }
                        });
                    }
                }

                // 3. Iqama Reminder Notification
                let isIqamaReminderEnabled = false;
                let iqamaMinutes = config.iqamaOffsets?.[key] || 15;

                if (config.prayerIqamaReminders?.[key] !== undefined) {
                    isIqamaReminderEnabled = !!config.prayerIqamaReminders[key].enabled;
                    iqamaMinutes = config.prayerIqamaReminders[key].minutes ?? (config.iqamaOffsets?.[key] || 15);
                } else if (config.iqamaReminder?.enabled) {
                    isIqamaReminderEnabled = true;
                    iqamaMinutes = config.iqamaReminder.minutes ?? (config.iqamaOffsets?.[key] || 15);
                }

                if (isIqamaReminderEnabled && key !== 'Sunrise') {
                    const iqamaPrayerDate = new Date(prayerDate.getTime() + iqamaMinutes * 60000);
                    if (iqamaPrayerDate > new Date()) {
                        notificationsToSchedule.push({
                            id: 6000 + (day * 10) + prayerKeys.indexOf(key) + 1,
                            title: `🕌 حان الآن موعد إقامة صلاة ${prayerNamesAr[key]}`,
                            body: `أقيمت الصلاة.. استووا وتراصوا واعتدلوا أثابكم الله 🤲`,
                            schedule: { at: iqamaPrayerDate, allowWhileIdle: true },
                            channelId: 'iqama_reminder_channel',
                            sound: 'takbeer1.mp3',
                            smallIcon: 'ic_stat_name',
                            extra: { type: 'iqama', prayer: key }
                        });
                    }
                }

                // 4. Auto Silent Mode Window Scheduling
                let isSilentEnabled = false;
                let silentDuration = 30;

                if (config.prayerAutoSilent?.[key] !== undefined) {
                    isSilentEnabled = !!config.prayerAutoSilent[key].enabled;
                    silentDuration = config.prayerAutoSilent[key].duration || 30;
                } else if (config.autoSilent) {
                    isSilentEnabled = true;
                    silentDuration = config.autoSilentDuration || 30;
                }

                if (isSilentEnabled && key !== 'Sunrise') {
                    const iqamaOffset = config.iqamaOffsets?.[key] !== undefined ? config.iqamaOffsets[key] : (config.iqamaReminder?.minutes ?? 15);
                    const silentStart = new Date(prayerDate.getTime() + iqamaOffset * 60000);
                    if (silentStart.getTime() + silentDuration * 60000 > Date.now()) {
                        silentWindowsToSchedule.push({
                            id: 7000 + (day * 10) + prayerKeys.indexOf(key) + 1,
                            prayerKey: key,
                            prayerName: prayerNamesAr[key] || key,
                            startMillis: silentStart.getTime(),
                            durationMinutes: silentDuration
                        });
                    }
                }
            }

            // Night Times Notifications
            const nightNotifs = config.nightNotifications || { firstThird: true, midnight: true, lastThird: true };
            const tomorrow = new Date(date);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowParams = getCalculationParams(tomorrow, config.location).params;
            const tomorrowPrayerTimes = new AdhanPrayerTimes(coordinates, tomorrow, tomorrowParams);

            const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
            const isSummerTimeActive = config.isSummerTime && supportsDST;

            let maghribDate = new Date(dayTimings.Maghrib);
            let tomorrowFajrDate = new Date(tomorrowPrayerTimes.fajr);

            const maghribOffset = (config.prayerOffsets.Maghrib || 0) + (isSummerTimeActive ? 60 : 0);
            const fajrOffset = (config.prayerOffsets.Fajr || 0) + (isSummerTimeActive ? 60 : 0);

            maghribDate.setMinutes(maghribDate.getMinutes() + maghribOffset);
            tomorrowFajrDate.setMinutes(tomorrowFajrDate.getMinutes() + fajrOffset);

            const diffMs = tomorrowFajrDate.getTime() - maghribDate.getTime();
            const firstThirdDate = new Date(maghribDate.getTime() + diffMs / 3);
            const midnightDate = new Date(maghribDate.getTime() + diffMs / 2);
            const lastThirdDate = new Date(maghribDate.getTime() + (diffMs * 2) / 3);

            if (nightNotifs.firstThird && firstThirdDate > new Date()) {
                notificationsToSchedule.push({
                    id: 2000 + (day * 10) + 1,
                    title: 'أول الليل',
                    body: 'قال رسول الله ﷺ: "أفضل الصلاة بعد الفريضة صلاة الليل"',
                    schedule: { at: firstThirdDate, allowWhileIdle: true },
                    channelId: 'night_times_channel',
                    smallIcon: 'ic_stat_name',
                    extra: { type: 'night', period: 'firstThird' }
                });
            }

            if (nightNotifs.midnight && midnightDate > new Date()) {
                notificationsToSchedule.push({
                    id: 2000 + (day * 10) + 2,
                    title: 'منتصف الليل',
                    body: 'قال رسول الله ﷺ: "عليكم بقيام الليل فإنه دأب الصالحين قبلكم، وقربة إلى الله تعالى"',
                    schedule: { at: midnightDate, allowWhileIdle: true },
                    channelId: 'night_times_channel',
                    smallIcon: 'ic_stat_name',
                    extra: { type: 'night', period: 'midnight' }
                });
            }

            if (nightNotifs.lastThird && lastThirdDate > new Date()) {
                notificationsToSchedule.push({
                    id: 2000 + (day * 10) + 3,
                    title: 'الثلث الأخير من الليل',
                    body: 'قال ﷺ: "ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر، فيقول: من يدعوني فأستجيب له..."',
                    schedule: { at: lastThirdDate, allowWhileIdle: true },
                    channelId: 'night_times_channel',
                    smallIcon: 'ic_stat_name',
                    extra: { type: 'night', period: 'lastThird' }
                });
            }
        }

        // Apply LocalNotifications on Capacitor native
        if (isNative) {
            try {
                const pending = await LocalNotifications.getPending();
                const prayerNotifs = pending.notifications.filter(n => n.id >= 1000 && n.id < 9000);
                if (prayerNotifs.length > 0) {
                    await LocalNotifications.cancel({ notifications: prayerNotifs });
                }

                if (notificationsToSchedule.length > 0) {
                    await LocalNotifications.schedule({ notifications: notificationsToSchedule });
                    console.log(`[Capacitor] Scheduled ${notificationsToSchedule.length} prayer/iqama notifications.`);
                }
            } catch (err) {
                console.warn('Error scheduling via LocalNotifications:', err);
            }

            // Schedule Auto-Silent Windows natively
            try {
                if (silentWindowsToSchedule.length > 0) {
                    await scheduleDeviceSilentWindows(silentWindowsToSchedule);
                    console.log(`[Capacitor] Scheduled ${silentWindowsToSchedule.length} auto-silent windows.`);
                } else {
                    await cancelAllDeviceSilentWindows();
                }
            } catch (silentErr) {
                console.warn('Error scheduling auto-silent windows:', silentErr);
            }
        } else if (w.cordova && w.cordova.plugins && w.cordova.plugins.notification && w.cordova.plugins.notification.local) {
            // Cordova fallback for legacy environments
            const localNotifier = w.cordova.plugins.notification.local;
            localNotifier.cancelAll(() => {
                const cordovaNotifs = notificationsToSchedule.map(n => ({
                    id: n.id,
                    title: n.title,
                    text: n.body,
                    trigger: { at: n.schedule?.at },
                    foreground: true,
                    smallIcon: 'ic_stat_name',
                    icon: 'ic_stat_name',
                    androidAllowWhileIdle: true
                }));
                if (cordovaNotifs.length > 0) {
                    localNotifier.schedule(cordovaNotifs);
                }
            });
        }
    }, [config]);

    // Schedule whenever config changes (location, offsets, muted prayers)
    useEffect(() => {
        scheduleNotifications();
    }, [scheduleNotifications]);

    const updateWidget = useCallback((currentTimes: Record<string, string>, currentDates: { hijri: string; gregorian: string }, currentNext: any, currentCountdown: string) => {
        if (Capacitor.getPlatform() !== 'android' || !currentTimes.Fajr || !currentNext) return;

        const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
        const isSummerTimeActive = config.isSummerTime && supportsDST;
        
        const maghribOffset = (config.prayerOffsets.Maghrib || 0) + (isSummerTimeActive ? 60 : 0);
        const fajrOffset = (config.prayerOffsets.Fajr || 0) + (isSummerTimeActive ? 60 : 0);
        const maghribTime = applyOffset(currentTimes.Maghrib, maghribOffset);
        const fajrTime = applyOffset(currentTimes.Fajr, fajrOffset);
        const nightTimes = calculateNightTimes(maghribTime, fajrTime);
        
        const to12h = (timeStr: string) => {
            if (!timeStr || timeStr.includes('--')) return "--:--";
            let [hh, mm] = timeStr.split(':');
            let hInt = parseInt(hh);
            hInt = hInt % 12 || 12;
            return `${hInt.toString().padStart(2, '0')}:${mm}`;
        };

        const formatTime = (timeStr: string, offset: number) => {
            const adjusted = applyOffset(timeStr, offset + (isSummerTimeActive ? 60 : 0));
            if (!adjusted || adjusted.includes('--')) return "--:--";
            let [hh, mm] = adjusted.split(':');
            let hInt = parseInt(hh);
            hInt = hInt % 12 || 12;
            return `${hInt.toString().padStart(2, '0')}:${mm}`;
        };

        const formatTime24 = (timeStr: string, offset: number) => {
            const adjusted = applyOffset(timeStr, offset + (isSummerTimeActive ? 60 : 0));
            if (!adjusted || adjusted.includes('--')) return "00:00";
            return adjusted;
        };
        
        const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const currentDayName = dayNamesAr[new Date().getDay()];
        
        const getTimestamp = (timeStr: string, offset: number, isTomorrow: boolean = false) => {
            const adjusted = applyOffset(timeStr, offset + (isSummerTimeActive ? 60 : 0));
            if (!adjusted || adjusted.includes('--')) return 0;
            let [hh, mm] = adjusted.split(':');
            
            const cityTimezone = localStorage.getItem('grandLocationTimezone');
            let cityNow = new Date();
            if (cityTimezone) {
                try {
                    const cityTimeStr = cityNow.toLocaleString('en-US', { timeZone: cityTimezone });
                    cityNow = new Date(cityTimeStr);
                } catch (e) {}
            }
            
            let pDate = new Date(cityNow);
            if (isTomorrow) pDate.setDate(pDate.getDate() + 1);
            pDate.setHours(parseInt(hh), parseInt(mm), 0, 0);
            
            return Date.now() + (pDate.getTime() - cityNow.getTime());
        };

        updateAndroidWidget({
            hijri: currentDates.hijri,
            gregorian: currentDates.gregorian,
            day: currentDayName,
            city: config.location.cityGov.split(' - ')[0],
            next_prayer_name: currentNext.name,
            next_prayer_id: currentNext.key.toLowerCase(),
            remaining_time: currentCountdown.split(':').slice(0, 2).join(':'), // HH:MM
            target_time_millis: Date.now() + (currentNext.date.getTime() - currentNext.cityNow.getTime()),
            midnight: `منتصف الليل : ${to12h(nightTimes.midnight)}`,
            last_third: `الثلث الأخير : ${to12h(nightTimes.lastThird)}`,
            times: {
                fajr: formatTime(currentTimes.Fajr, config.prayerOffsets.Fajr || 0),
                sunrise: formatTime(currentTimes.Sunrise, config.prayerOffsets.Sunrise || 0),
                dhuhr: formatTime(currentTimes.Dhuhr, config.prayerOffsets.Dhuhr || 0),
                asr: formatTime(currentTimes.Asr, config.prayerOffsets.Asr || 0),
                maghrib: formatTime(currentTimes.Maghrib, config.prayerOffsets.Maghrib || 0),
                isha: formatTime(currentTimes.Isha, config.prayerOffsets.Isha || 0)
            },
            times_24h: {
                fajr: formatTime24(currentTimes.Fajr, config.prayerOffsets.Fajr || 0),
                sunrise: formatTime24(currentTimes.Sunrise, config.prayerOffsets.Sunrise || 0),
                dhuhr: formatTime24(currentTimes.Dhuhr, config.prayerOffsets.Dhuhr || 0),
                asr: formatTime24(currentTimes.Asr, config.prayerOffsets.Asr || 0),
                maghrib: formatTime24(currentTimes.Maghrib, config.prayerOffsets.Maghrib || 0),
                isha: formatTime24(currentTimes.Isha, config.prayerOffsets.Isha || 0)
            },
            timestamps: {
                fajr: getTimestamp(currentTimes.Fajr, config.prayerOffsets.Fajr || 0),
                sunrise: getTimestamp(currentTimes.Sunrise, config.prayerOffsets.Sunrise || 0),
                dhuhr: getTimestamp(currentTimes.Dhuhr, config.prayerOffsets.Dhuhr || 0),
                asr: getTimestamp(currentTimes.Asr, config.prayerOffsets.Asr || 0),
                maghrib: getTimestamp(currentTimes.Maghrib, config.prayerOffsets.Maghrib || 0),
                isha: getTimestamp(currentTimes.Isha, config.prayerOffsets.Isha || 0),
                nextFajr: getTimestamp(currentTimes.Fajr, config.prayerOffsets.Fajr || 0, true),
                nextSunrise: getTimestamp(currentTimes.Sunrise, config.prayerOffsets.Sunrise || 0, true),
                nextDhuhr: getTimestamp(currentTimes.Dhuhr, config.prayerOffsets.Dhuhr || 0, true),
                nextAsr: getTimestamp(currentTimes.Asr, config.prayerOffsets.Asr || 0, true),
                nextMaghrib: getTimestamp(currentTimes.Maghrib, config.prayerOffsets.Maghrib || 0, true),
                nextIsha: getTimestamp(currentTimes.Isha, config.prayerOffsets.Isha || 0, true)
            }
        }, config.syncWidgetTheme !== false);
    }, [config.location, config.prayerOffsets, config.isSummerTime, config.syncWidgetTheme]);

    // --- Next Prayer & Countdown Logic ---
    useEffect(() => {
        const findNext = () => {
            if (!Object.keys(times).length) return null;
            
            // Get city timezone if available
            const cityTimezone = localStorage.getItem('grandLocationTimezone');
            
            // Get current time in city's timezone
            let now = new Date();
            if (cityTimezone) {
                try {
                    const cityTimeStr = now.toLocaleString('en-US', { timeZone: cityTimezone });
                    now = new Date(cityTimeStr);
                } catch (e) {
                    console.error("Timezone conversion failed:", e);
                }
            }

            const keys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let found = null;

            const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
            const isSummerTimeActive = config.isSummerTime && supportsDST;

            for (const key of keys) {
                const totalOffset = (config.prayerOffsets[key] || 0) + (isSummerTimeActive ? 60 : 0);
                const adjustedTime = applyOffset(times[key], totalOffset);
                if (adjustedTime && !adjustedTime.includes('--')) {
                    const [h, m] = adjustedTime.split(':');
                    const pDate = new Date(now); // Use city's current date
                    pDate.setHours(parseInt(h), parseInt(m), 0, 0);
                    
                    if (pDate > now) {
                        found = { key, date: pDate, name: prayerNamesAr[key], cityNow: now };
                        break;
                    }
                }
            }

            if (!found && times.Fajr) {
                const totalOffset = (config.prayerOffsets.Fajr || 0) + (isSummerTimeActive ? 60 : 0);
                const fajrTime = applyOffset(times.Fajr, totalOffset);
                if (fajrTime && !fajrTime.includes('--')) {
                    const [h, m] = fajrTime.split(':');
                    const pDate = new Date(now);
                    pDate.setDate(pDate.getDate() + 1);
                    pDate.setHours(parseInt(h), parseInt(m), 0, 0);
                    found = { key: 'Fajr', date: pDate, name: prayerNamesAr['Fajr'], cityNow: now };
                }
            }
            return found;
        };

        let lastWidgetUpdateMinute = -1;

        const timer = setInterval(() => {
            const next = findNext();
            setNextPrayer(next);
            
            if (next && next.cityNow) {
                const diff = next.date.getTime() - next.cityNow.getTime();
                if (diff > 0) {
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    const countdownStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                    setCountdown(countdownStr);
                    
                    if (m !== lastWidgetUpdateMinute) {
                        lastWidgetUpdateMinute = m;
                        updateWidget(times, dates, next, countdownStr);
                    }
                } else {
                    setCountdown("00:00:00");
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [times, config.prayerOffsets, config.isSummerTime]);

    // Update widget when times or next prayer changes (not every second)
    useEffect(() => {
        if (times.Fajr && nextPrayer) {
            updateWidget(times, dates, nextPrayer, countdown);
        }
    }, [times, dates, nextPrayer?.key, updateWidget]);

    // Update widget immediately when theme changes
    useEffect(() => {
        if (times.Fajr && nextPrayer) {
            updateWidget(times, dates, nextPrayer, countdown);
        }
    }, [themeKey, times, dates, nextPrayer, countdown, updateWidget]);

    // Initial load
    useEffect(() => {
        const cached = localStorage.getItem('grandPrayersCache');
        if (cached) {
            try {
                const prayerData = JSON.parse(cached);
                setTimes(prayerData.timings);
                setDates(prayerData.dates);
            } catch(e) {}
        }
        refreshLocation().catch(() => {});
    }, [refreshLocation]);

    return (
        <PrayerTimesContext.Provider value={{ 
            times, dates, nextPrayer, countdown, config, setConfig, 
            refreshLocation, manualSearch, updateConfig,
            isPrayerSilentActive, activeSilentPrayerName
        }}>
            {children}
        </PrayerTimesContext.Provider>
    );
};

export const usePrayerTimes = () => {
    const context = useContext(PrayerTimesContext);
    if (!context) {
        throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
    }
    return context;
};

export const copyAssetToDevice = async (assetPath: string): Promise<string> => {
    try {
        const filename = assetPath.split('/').pop()?.split('?')[0] || 'audio.mp3';
        if (!filename) return assetPath;

        const targetDirectory = Capacitor.getPlatform() === 'android' ? Directory.External : Directory.Data;

        // Check if file already exists in the target directory
        try {
            const stat = await Filesystem.stat({
                path: `sounds/${filename}`,
                directory: targetDirectory
            });
            return stat.uri;
        } catch (e) {
            // File doesn't exist, proceed to copy
        }

        if (assetPath.startsWith('http')) {
            try {
                // Use native downloadFile for much faster downloads and no CORS issues
                const downloadResult = await Filesystem.downloadFile({
                    url: assetPath,
                    path: `sounds/${filename}`,
                    directory: targetDirectory,
                    recursive: true
                });
                
                if (downloadResult.path) {
                    // Return the proper file:// URI
                    const stat = await Filesystem.stat({
                        path: `sounds/${filename}`,
                        directory: targetDirectory
                    });
                    return stat.uri;
                }
            } catch (downloadError) {
                console.warn("Native downloadFile failed (likely on web), falling back to fetch:", downloadError);
            }
        }

        // Fallback for non-http or if downloadFile fails
        let response;
        try {
            response = await fetch(assetPath);
            if (!response.ok) throw new Error("Direct fetch failed");
        } catch (e) {
            if (assetPath.startsWith('http')) {
                console.warn("Direct fetch failed, trying proxy...", e);
                // Try corsproxy.io as a reliable fallback
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(assetPath)}`;
                response = await fetch(proxyUrl);
                if (!response.ok) {
                    // Try allorigins as a second fallback
                    const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(assetPath)}`;
                    response = await fetch(proxyUrl2);
                    if (!response.ok) throw new Error("All proxy fetches failed");
                }
            } else {
                throw e;
            }
        }
        
        const blob = await response.blob();

        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        await Filesystem.writeFile({
            path: `sounds/${filename}`,
            data: base64Data,
            directory: targetDirectory,
            recursive: true
        });

        const uriResult = await Filesystem.getUri({
            path: `sounds/${filename}`,
            directory: targetDirectory
        });

        return uriResult.uri;
    } catch (error) {
        console.error("Error copying asset to device:", error);
        return assetPath; // Fallback to original path if copy fails
    }
};
