
export const prayerNamesAr = { Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };

export const internetTones = [
    { name: "أذان 1", path: "/assets/audio/azan1.mp3" },
    { name: "أذان 2", path: "/assets/audio/azan2.mp3" },
    { name: "أذان 3", path: "/assets/audio/azan3.mp3" },
    { name: "أذان 4", path: "/assets/audio/azan4.mp3" },
    { name: "تكبيرة 1", path: "/assets/audio/takbeer1.mp3" },
    { name: "تكبيرة 2", path: "/assets/audio/takbeer2.mp3" },
    { name: "تكبيرة 3", path: "/assets/audio/takbeer3.mp3" },
    { name: "تكبيرة 4", path: "/assets/audio/takbeer4.mp3" },
    { name: "تكبيرة 5", path: "/assets/audio/takbeer5.mp3" },
    { name: "تكبيرة 6", path: "/assets/audio/takbeer6.mp3" },
    { name: "الشهادة", path: "/assets/audio/shahadah.mp3" },
    { name: "الصلاة", path: "/assets/audio/salah.mp3" },
];

export const ADHAN_CHANNELS_CONFIG = [
    { id: 'adhan_v5_takbeer1', sound: 'takbeer1.mp3', raw: 'takbeer1', name: 'أذان الصلوات (تكبيرات 1)' },
    { id: 'adhan_v5_takbeer2', sound: 'takbeer2.mp3', raw: 'takbeer2', name: 'أذان الصلوات (تكبيرات 2)' },
    { id: 'adhan_v5_takbeer3', sound: 'takbeer3.mp3', raw: 'takbeer3', name: 'أذان الصلوات (تكبيرات 3)' },
    { id: 'adhan_v5_takbeer4', sound: 'takbeer4.mp3', raw: 'takbeer4', name: 'أذان الصلوات (تكبيرات 4)' },
    { id: 'adhan_v5_takbeer5', sound: 'takbeer5.mp3', raw: 'takbeer5', name: 'أذان الصلوات (تكبيرات 5)' },
    { id: 'adhan_v5_takbeer6', sound: 'takbeer6.mp3', raw: 'takbeer6', name: 'أذان الصلوات (تكبيرات 6)' },
    { id: 'adhan_v5_azan1', sound: 'azan1.mp3', raw: 'azan1', name: 'أذان الصلوات (أذان 1)' },
    { id: 'adhan_v5_azan2', sound: 'azan2.mp3', raw: 'azan2', name: 'أذان الصلوات (أذان 2)' },
    { id: 'adhan_v5_azan3', sound: 'azan3.mp3', raw: 'azan3', name: 'أذان الصلوات (أذان 3)' },
    { id: 'adhan_v5_azan4', sound: 'azan4.mp3', raw: 'azan4', name: 'أذان الصلوات (أذان 4)' },
    { id: 'adhan_v5_shahadah', sound: 'shahadah.mp3', raw: 'shahadah', name: 'أذان الصلوات (الشهادة)' },
    { id: 'adhan_v5_salah', sound: 'salah.mp3', raw: 'salah', name: 'أذان الصلوات (الصلاة)' },
];

export interface NotificationToneOption {
    id: string;
    name: string;
    path: string;
    fileName: string;
}

export const shortNotificationTones: NotificationToneOption[] = [
    { id: 'chime', name: 'رنين هادئ', path: '/assets/audio/chime.mp3', fileName: 'chime.mp3' },
    { id: 'notif_bell', name: 'جرس لطيف', path: '/assets/audio/notif_bell.wav', fileName: 'notif_bell.wav' },
    { id: 'notif_crystal', name: 'بلورات نقية', path: '/assets/audio/notif_crystal.wav', fileName: 'notif_crystal.wav' },
    { id: 'notif_droplet', name: 'قطرة ماء', path: '/assets/audio/notif_droplet.wav', fileName: 'notif_droplet.wav' },
    { id: 'notif_harpeggio', name: 'وتر هادئ', path: '/assets/audio/notif_harpeggio.wav', fileName: 'notif_harpeggio.wav' },
    { id: 'notif_subtle', name: 'تنبيه خفيف', path: '/assets/audio/notif_subtle.wav', fileName: 'notif_subtle.wav' },
    { id: 'notif_marimba', name: 'نغمة خشبية', path: '/assets/audio/notif_marimba.wav', fileName: 'notif_marimba.wav' },
];

export const DEFAULT_NOTIFICATION_TONE = {
    id: 'chime',
    name: 'رنين هادئ',
    data: '/assets/audio/chime.mp3',
    path: '/assets/audio/chime.mp3',
    fileName: 'chime.mp3'
};