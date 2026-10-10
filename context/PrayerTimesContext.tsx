import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import moment from 'moment-hijri';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { prayerNamesAr } from '../data/prayerTimesData';
import { checkSupportsDST, calculateNightTimes } from '../utils/prayerTimesUtils';
import { updateAndroidWidget } from '../utils/widgetUtils';
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
    preAthanReminder: { enabled: true, minutes: 15 },
    autoSilent: false,
    autoSilentDuration: 30
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
            const saved = localStorage.getItem('prayerFinal_v33');
            return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
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
        if (!config.autoSilent || !times || Object.keys(times).length === 0) {
            setIsPrayerSilentActive(false);
            setActiveSilentPrayerName('');
            return;
        }

        const checkSilentStatus = () => {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const duration = config.autoSilentDuration || 30;

            const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let foundActive = false;
            let activeName = '';

            for (const key of prayerKeys) {
                const timeStr = times[key];
                if (!timeStr || timeStr.includes('--')) continue;

                const [h, m] = timeStr.split(':').map(Number);
                const supportsDST = checkSupportsDST(config.location?.combinedCode, config.location?.fullCountry);
                const totalOffset = (config.prayerOffsets[key] || 0) + ((config.isSummerTime && supportsDST) ? 60 : 0);
                const prayerMin = h * 60 + m + totalOffset;

                if (nowMinutes >= prayerMin && nowMinutes < prayerMin + duration) {
                    foundActive = true;
                    activeName = prayerNamesAr[key] || key;
                    break;
                }
            }

            setIsPrayerSilentActive(foundActive);
            setActiveSilentPrayerName(activeName);
        };

        checkSilentStatus();
        const interval = setInterval(checkSilentStatus, 30000);
        return () => clearInterval(interval);
    }, [config.autoSilent, config.autoSilentDuration, times, config.prayerOffsets, config.isSummerTime, config.location]);

    // --- Save Config ---
    useEffect(() => {
        localStorage.setItem('prayerFinal_v33', JSON.stringify(config));
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

    // --- Notification Scheduling ---
    const scheduleNotifications = useCallback(() => {
        const w = window as any;
        if (w.cordova && w.cordova.plugins && w.cordova.plugins.notification && w.cordova.plugins.notification.local) {
            const localNotifier = w.cordova.plugins.notification.local;
            const isAndroidNative = w.cordova && (w.cordova.platformId === 'android' || (w.device && w.device.platform === 'Android') || /android/i.test(navigator.userAgent));

            // Create Notification Channel for Android 8+
            if (w.cordova.platformId === 'android') {
                localNotifier.addActions('adhan_actions', [
                    { id: 'dismiss', title: 'إيقاف' }
                ]);
                
                // We need to ensure the channel exists before scheduling
                // The plugin might create a default channel, but it's better to be explicit
            }

            // Request permission first
            localNotifier.hasPermission((granted: boolean) => {
                const proceed = () => {
                    localNotifier.cancelAll(async () => {
                        const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
                        const notificationsToSchedule: any[] = [];
                        
                        // Schedule for today and next 6 days (total 7 days)
                        for (let day = 0; day < 7; day++) {
                            const date = new Date();
                            date.setDate(date.getDate() + day);
                            
                            // Recalculate times for that specific day
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

                            // Use a for...of loop to handle async operations sequentially
                            for (const key of prayerKeys) {
                                if (!config.mutedPrayers[key]) {
                                    let prayerDate = dayTimings[key];
                                    // Apply offset
                                    const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
                                    const totalOffset = (config.prayerOffsets[key] || 0) + ((config.isSummerTime && supportsDST) ? 60 : 0);
                                    prayerDate.setMinutes(prayerDate.getMinutes() + totalOffset);

                                    // Skip if time passed
                                    if (prayerDate < new Date()) continue;

                                    const toneConfig = config.tones[key];
                                    let soundPath = "/assets/audio/takbeer1.mp3"; // Default to Takbeer 1
                                    let playSound = true;
                                    
                                    if (config.audioMutedUntil && prayerDate.getTime() < config.audioMutedUntil) {
                                        playSound = false;
                                        soundPath = '';
                                    } else if (toneConfig && toneConfig.data) {
                                        if (toneConfig.data === 'none') {
                                            playSound = false;
                                            soundPath = '';
                                        } else if (!toneConfig.data.startsWith('data:')) {
                                            soundPath = toneConfig.data;
                                        }
                                    }

                                    // Fix sound path for Android (Capacitor)
                                    let androidSoundPath = soundPath;
                                    
                                    if (isAndroidNative && playSound && soundPath) {
                                        // Force bundled azans to use res://raw/ (even if they are old file:// or http:// paths in config)
                                        if (soundPath.includes('azan') || soundPath.includes('takbeer') || soundPath.startsWith('/assets/audio/')) {
                                            const filename = soundPath.split('/').pop();
                                            if (filename) {
                                                const rawName = filename.toLowerCase()
                                                    .replace(/\.mp3|\.wav|\.ogg/g, '') // Remove extension
                                                    .replace(/\s+/g, '_')       // Replace spaces
                                                    .replace(/[^a-z0-9_]/g, ''); // Remove special chars
                                                
                                                // Ensure it doesn't start with a number
                                                const finalName = /^\d/.test(rawName) ? 'sound_' + rawName : rawName;
                                                
                                                androidSoundPath = `res://raw/${finalName}`;
                                            }
                                        } else if (soundPath.startsWith('file://') || soundPath.startsWith('http')) {
                                            // It's a downloaded custom file or external URL
                                            androidSoundPath = soundPath;
                                        }
                                    }

                                    // Unique ID: day index * 10 + prayer index
                                    const id = (day * 10) + prayerKeys.indexOf(key) + 1;
                                    
                                    // Dynamic Channel ID to force sound update on Android 8+
                                    // If we use the same channel ID, Android will ignore the new sound
                                    const soundName = playSound ? (androidSoundPath.split('/').pop() || 'default') : 'silent';
                                    // Sanitize channel ID
                                    const channelId = `adhan_channel_${key}_${soundName.replace(/[^a-zA-Z0-9]/g, '_')}`;

                                    // Explicitly create the channel to ensure the custom sound is applied
                                    if (isAndroidNative && localNotifier.createChannel) {
                                        const channelConfig: any = {
                                            androidChannelId: channelId,
                                            androidChannelName: `Adhan ${prayerNamesAr[key]}`,
                                            androidChannelDescription: `Notifications for ${prayerNamesAr[key]} prayer`,
                                            androidChannelImportance: 5, // MAX importance to bypass doze
                                            androidChannelEnableVibration: true,
                                            androidChannelVisibility: 1,
                                            androidChannelLockscreenVisibility: 1
                                        };
                                        if (playSound && androidSoundPath) {
                                            channelConfig.sound = androidSoundPath;
                                            channelConfig.androidChannelSoundUsage = 4; // USAGE_ALARM
                                        } else {
                                            channelConfig.playSound = false;
                                        }
                                        localNotifier.createChannel(channelConfig);
                                    }

                                    const notificationObj: any = {
                                        id: id,
                                        title: `حان الآن موعد أذان ${prayerNamesAr[key]}`,
                                        text: 'لا تنس ذكر الله. قال رسول الله ﷺ: "أرحنا بها يا بلال"',
                                        trigger: { at: prayerDate },
                                        foreground: true,
                                        androidChannelId: channelId, // Unique channel per prayer/sound combo
                                        priority: 2, // High priority
                                        androidLockscreen: true,
                                        androidChannelEnableVibration: true,
                                        launch: true,
                                        smallIcon: 'ic_stat_name',
                                        icon: 'ic_stat_name',
                                        // Explicitly define channel properties for Android 8+
                                        // The plugin will create this channel if it doesn't exist
                                        androidChannelName: `Adhan ${prayerNamesAr[key]}`,
                                        androidChannelDescription: `Notifications for ${prayerNamesAr[key]} prayer`,
                                        androidChannelImportance: 5, // MAX importance
                                        androidAllowWhileIdle: true, // Allow in doze mode
                                        androidWakeUpScreen: true, // Wake up screen
                                        androidAlarmType: 0, // RTC_WAKEUP
                                        androidChannelVisibility: 1,
                                        androidChannelLockscreenVisibility: 1,
                                        visibility: 1, // Public
                                        playSound: playSound // Explicitly enable/disable sound
                                    };

                                    if (playSound && androidSoundPath) {
                                        notificationObj.sound = androidSoundPath;
                                        notificationObj.androidChannelSoundUsage = 4;
                                    }

                                    notificationsToSchedule.push(notificationObj);

                                    // --- Pre-Adhan Preparation Reminder (15 mins before adhan) ---
                                    const preReminder = config.preAthanReminder || { enabled: true, minutes: 15 };
                                    if (preReminder.enabled && !config.mutedPrayers[key] && key !== 'Sunrise') {
                                        const reminderMinutes = preReminder.minutes || 15;
                                        const prePrayerDate = new Date(prayerDate.getTime() - reminderMinutes * 60000);

                                        if (prePrayerDate > new Date()) {
                                            const preChannelId = 'pre_adhan_reminder_channel';
                                            if (isAndroidNative && localNotifier.createChannel) {
                                                localNotifier.createChannel({
                                                    androidChannelId: preChannelId,
                                                    androidChannelName: 'تنبيه الاستعداد للصلاة',
                                                    androidChannelDescription: 'تنبيه قبل الأذان بـ 15 دقيقة للوضوء والاستعداد والذهاب إلى المسجد',
                                                    androidChannelImportance: 4,
                                                    androidChannelEnableVibration: true,
                                                    androidChannelVisibility: 1,
                                                    androidChannelLockscreenVisibility: 1
                                                });
                                            }

                                            notificationsToSchedule.push({
                                                id: 5000 + (day * 10) + prayerKeys.indexOf(key) + 1,
                                                title: `⏰ اقترب موعد أذان ${prayerNamesAr[key]} (بقي ${reminderMinutes} دقيقة)`,
                                                text: `حان وقت الوضوء والاستعداد والذهاب إلى المسجد لأداء صلاة ${prayerNamesAr[key]} 🕌`,
                                                trigger: { at: prePrayerDate },
                                                foreground: true,
                                                androidChannelId: preChannelId,
                                                priority: 2,
                                                smallIcon: 'ic_stat_name',
                                                icon: 'ic_stat_name',
                                                androidChannelName: 'تنبيه الاستعداد للصلاة',
                                                androidChannelDescription: 'تنبيه قبل الأذان للوضوء والاستعداد والذهاب إلى المسجد',
                                                androidChannelImportance: 4,
                                                androidAllowWhileIdle: true,
                                                androidWakeUpScreen: true
                                            });
                                        }
                                    }
                                }
                            }

                            // --- Night Times Notifications ---
                            const nightNotifs = config.nightNotifications || { firstThird: true, midnight: true, lastThird: true };
                            
                            // Explicitly create the channel for night times to ensure it works on Android 8+
                            if (isAndroidNative && localNotifier.createChannel) {
                                localNotifier.createChannel({
                                    androidChannelId: 'night_times_channel',
                                    androidChannelName: 'تنبيهات أوقات الليل',
                                    androidChannelDescription: 'إشعارات لأوقات أول الليل، منتصف الليل، والثلث الأخير',
                                    androidChannelImportance: 5, // MAX importance
                                    androidChannelEnableVibration: true,
                                    androidChannelVisibility: 1,
                                    androidChannelLockscreenVisibility: 1
                                });
                            }
                            
                            // Calculate tomorrow's Fajr
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
                                    id: 1000 + (day * 10) + 1,
                                    title: 'أول الليل',
                                    text: 'قال رسول الله ﷺ: "أفضل الصلاة بعد الفريضة صلاة الليل"',
                                    trigger: { at: firstThirdDate },
                                    foreground: true,
                                    priority: 1,
                                    androidChannelId: 'night_times_channel',
                                    smallIcon: 'ic_stat_name',
                                    icon: 'ic_stat_name',
                                    androidChannelName: 'تنبيهات أوقات الليل',
                                    androidChannelDescription: 'إشعارات لأوقات أول الليل، منتصف الليل، والثلث الأخير',
                                    androidChannelImportance: 4,
                                    androidAllowWhileIdle: true,
                                    androidWakeUpScreen: true
                                });
                            }

                            if (nightNotifs.midnight && midnightDate > new Date()) {
                                notificationsToSchedule.push({
                                    id: 1000 + (day * 10) + 2,
                                    title: 'منتصف الليل',
                                    text: 'قال رسول الله ﷺ: "عليكم بقيام الليل فإنه دأب الصالحين قبلكم، وقربة إلى الله تعالى"',
                                    trigger: { at: midnightDate },
                                    foreground: true,
                                    priority: 1,
                                    androidChannelId: 'night_times_channel',
                                    smallIcon: 'ic_stat_name',
                                    icon: 'ic_stat_name',
                                    androidChannelName: 'تنبيهات أوقات الليل',
                                    androidChannelDescription: 'إشعارات لأوقات أول الليل، منتصف الليل، والثلث الأخير',
                                    androidChannelImportance: 4,
                                    androidAllowWhileIdle: true,
                                    androidWakeUpScreen: true
                                });
                            }

                            if (nightNotifs.lastThird && lastThirdDate > new Date()) {
                                notificationsToSchedule.push({
                                    id: 1000 + (day * 10) + 3,
                                    title: 'الثلث الأخير من الليل',
                                    text: 'قال ﷺ: "ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر، فيقول: من يدعوني فأستجيب له..."',
                                    trigger: { at: lastThirdDate },
                                    foreground: true,
                                    priority: 2,
                                    androidChannelId: 'night_times_channel',
                                    smallIcon: 'ic_stat_name',
                                    icon: 'ic_stat_name',
                                    androidChannelName: 'تنبيهات أوقات الليل',
                                    androidChannelDescription: 'إشعارات لأوقات أول الليل، منتصف الليل، والثلث الأخير',
                                    androidChannelImportance: 4,
                                    androidAllowWhileIdle: true,
                                    androidWakeUpScreen: true
                                });
                            }
                        }

                        if (notificationsToSchedule.length > 0) {
                            localNotifier.schedule(notificationsToSchedule);
                            console.log(`Scheduled ${notificationsToSchedule.length} notifications.`);
                        }
                    });
                };

                if (granted) {
                    proceed();
                } else {
                    localNotifier.requestPermission((newlyGranted: boolean) => {
                        if (newlyGranted) proceed();
                    });
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
