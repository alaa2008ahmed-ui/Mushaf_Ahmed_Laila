
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

export interface CalculationMethodOption {
    id: string;
    nameAr: string;
    nameEn: string;
    descAr: string;
    descEn: string;
    regionAr: string;
    regionEn: string;
    aladhanId: number;
}

export const CALCULATION_METHOD_OPTIONS: CalculationMethodOption[] = [
    {
        id: 'auto',
        nameAr: 'تلقائي بحسب الدولة (موصى به)',
        nameEn: 'Automatic based on country (Recommended)',
        descAr: 'تحديد الهيئة الفلكية الرسمية تلقائياً وفقاً لموقعك الجغرافي',
        descEn: 'Automatically selects the official authority based on your location',
        regionAr: 'كافة الدول',
        regionEn: 'Worldwide',
        aladhanId: 3
    },
    {
        id: 'UmmAlQura',
        nameAr: 'جامعة أم القرى - مكة المكرمة',
        nameEn: 'Umm Al-Qura University, Makkah',
        descAr: 'الفجر 18.5°، العشاء بعد المغرب بـ 90 دقيقة (120 في رمضان)',
        descEn: 'Fajr 18.5°, Isha 90 min after Maghrib (120 in Ramadan)',
        regionAr: 'السعودية والخليج العربي',
        regionEn: 'Saudi Arabia & Gulf',
        aladhanId: 4
    },
    {
        id: 'Egyptian',
        nameAr: 'الهيئة المصرية العامة للمساحة',
        nameEn: 'Egyptian General Authority of Survey',
        descAr: 'الفجر 19.5°، العشاء 17.5°',
        descEn: 'Fajr 19.5°, Isha 17.5°',
        regionAr: 'مصر، بلاد الشام، وشمال إفريقيا',
        regionEn: 'Egypt, Levant, North Africa',
        aladhanId: 5
    },
    {
        id: 'MuslimWorldLeague',
        nameAr: 'رابطة العالم الإسلامي (MWL)',
        nameEn: 'Muslim World League (MWL)',
        descAr: 'الفجر 18°، العشاء 17°',
        descEn: 'Fajr 18°, Isha 17°',
        regionAr: 'أوروبا، الشرق الأقصى، وأجزاء من آسيا',
        regionEn: 'Europe, Far East, General',
        aladhanId: 3
    },
    {
        id: 'Karachi',
        nameAr: 'جامعة العلوم الإسلامية بكراتشي',
        nameEn: 'University of Islamic Sciences, Karachi',
        descAr: 'الفجر 18°، العشاء 18°',
        descEn: 'Fajr 18°, Isha 18°',
        regionAr: 'باكستان، الهند، بنغلاديش، وأفغانستان',
        regionEn: 'Pakistan, India, Bangladesh, Afghanistan',
        aladhanId: 1
    },
    {
        id: 'NorthAmerica',
        nameAr: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)',
        nameEn: 'Islamic Society of North America (ISNA)',
        descAr: 'الفجر 15°، العشاء 15°',
        descEn: 'Fajr 15°, Isha 15°',
        regionAr: 'الولايات المتحدة الأمريكية وكندا',
        regionEn: 'United States & Canada',
        aladhanId: 2
    },
    {
        id: 'Dubai',
        nameAr: 'دائرة الشؤون الإسلامية والعمل الخيري بدبي',
        nameEn: 'Dubai Islamic Affairs (IACAD)',
        descAr: 'الفجر 18.2°، العشاء 18.2°',
        descEn: 'Fajr 18.2°, Isha 18.2°',
        regionAr: 'دولة الإمارات العربية المتحدة',
        regionEn: 'United Arab Emirates',
        aladhanId: 16
    },
    {
        id: 'Kuwait',
        nameAr: 'وزارة الأوقاف والشؤون الإسلامية - الكويت',
        nameEn: 'Ministry of Awqaf - Kuwait',
        descAr: 'الفجر 18°، العشاء 17.5°',
        descEn: 'Fajr 18°, Isha 17.5°',
        regionAr: 'دولة الكويت',
        regionEn: 'Kuwait',
        aladhanId: 9
    },
    {
        id: 'Qatar',
        nameAr: 'وزارة الأوقاف والشؤون الإسلامية - قطر',
        nameEn: 'Ministry of Awqaf - Qatar',
        descAr: 'الفجر 18°، العشاء بعد المغرب بـ 90 دقيقة',
        descEn: 'Fajr 18°, Isha 90 min after Maghrib',
        regionAr: 'دولة قطر',
        regionEn: 'Qatar',
        aladhanId: 10
    },
    {
        id: 'Turkey',
        nameAr: 'رئاسة الشؤون الدينية التركية (Diyanet)',
        nameEn: 'Diyanet İşleri Başkanlığı, Turkey',
        descAr: 'الفجر 18°، العشاء 17°',
        descEn: 'Fajr 18°, Isha 17°',
        regionAr: 'تركيا والبلقان ودول وسط آسيا',
        regionEn: 'Turkey, Balkans, Central Asia',
        aladhanId: 13
    },
    {
        id: 'Singapore',
        nameAr: 'مجلس الشؤون الإسلامية بسنغافورة (MUIS)',
        nameEn: 'Majlis Ugama Islam Singapura (MUIS)',
        descAr: 'الفجر 20°، العشاء 18°',
        descEn: 'Fajr 20°, Isha 18°',
        regionAr: 'سنغافورة وماليزيا وإندونيسيا',
        regionEn: 'Singapore, Malaysia, Indonesia',
        aladhanId: 11
    },
    {
        id: 'MoonsightingCommittee',
        nameAr: 'لجنة رؤية الهلال العالمية (Moonsighting)',
        nameEn: 'Moonsighting Committee Worldwide',
        descAr: 'الفجر 18°، العشاء 18° (حسابات فلكية دقيقة للشفق)',
        descEn: 'Fajr 18°, Isha 18°',
        regionAr: 'بريطانيا وأوروبا وأمريكا الشمالية',
        regionEn: 'UK, Europe, North America',
        aladhanId: 15
    },
    {
        id: 'Tehran',
        nameAr: 'معهد الجيوفيزياء بجامعة طهران',
        nameEn: 'Institute of Geophysics, University of Tehran',
        descAr: 'الفجر 17.7°، العشاء 14°، المغرب 4.5°',
        descEn: 'Fajr 17.7°, Isha 14°, Maghrib 4.5°',
        regionAr: 'إيران وبعض المجتمعات الجعفرية',
        regionEn: 'Iran & Shia communities',
        aladhanId: 7
    }
];

export interface AsrMadhabOption {
    id: 'shafi' | 'hanafi';
    nameAr: string;
    nameEn: string;
    scholarAr: string;
    scholarEn: string;
    descAr: string;
    descEn: string;
    shadowRatio: number;
}

export const ASR_MADHAB_OPTIONS: AsrMadhabOption[] = [
    {
        id: 'shafi',
        nameAr: 'جمهور الفقهاء (الشافعي، المالكي، الحنبلي)',
        nameEn: 'Standard / Majority (Shafi\'i, Maliki, Hanbali)',
        scholarAr: 'جمهور العلماء',
        scholarEn: 'Majority',
        descAr: 'يبدأ وقت العصر عندما يصبح ظل الشيء مثله (المعتمد في معظم العالم العربي والإسلامي)',
        descEn: 'Asr begins when an object shadow equals its height (Majority of the Islamic world)',
        shadowRatio: 1
    },
    {
        id: 'hanafi',
        nameAr: 'المذهب الحنفي (الإمام أبو حنيفة)',
        nameEn: 'Hanafi Madhab (Imam Abu Hanifa)',
        scholarAr: 'المذهب الحنفي',
        scholarEn: 'Hanafi',
        descAr: 'يبدأ وقت العصر عندما يصبح ظل الشيء مثليه (معتمد في باكستان والهند وتركيا وبنغلاديش وآسيا الوسطى)',
        descEn: 'Asr begins when an object shadow equals twice its height (Common in South Asia, Turkey, Central Asia)',
        shadowRatio: 2
    }
];

export interface HighLatitudeRuleOption {
    id: 'auto' | 'twilightangle' | 'middleofthenight' | 'seventhofthenight' | 'none';
    nameAr: string;
    nameEn: string;
    descAr: string;
    descEn: string;
    aladhanId: number;
}

export const HIGH_LATITUDE_RULE_OPTIONS: HighLatitudeRuleOption[] = [
    {
        id: 'auto',
        nameAr: 'تلقائي (موصى به للمناطق الشمالية)',
        nameEn: 'Automatic (Recommended for North)',
        descAr: 'يكتشف التطبيق تلقائياً إذا كان موقعك أعلى من خط عرض 48° ويطبق أفضل قاعدة علمية',
        descEn: 'Automatically detects if above 48° latitude and applies optimal astronomical rule',
        aladhanId: 3
    },
    {
        id: 'twilightangle',
        nameAr: 'قاعدة زاوية الشفق (Angle-Based Rule)',
        nameEn: 'Angle-Based Rule',
        descAr: 'تعتمد نسبة زاوية شفق الفجر والعشاء (موصى بها لبريطانيا والدول الأوروبية)',
        descEn: 'Calculates Fajr and Isha as a proportion of night based on twilight angle',
        aladhanId: 3
    },
    {
        id: 'middleofthenight',
        nameAr: 'منتصف الليل (Middle of the Night)',
        nameEn: 'Middle of the Night',
        descAr: 'يقسم الليل إلى نصفين من الغروب للشروق (لا يتجاوز الفجر أو العشاء منتصف الليل)',
        descEn: 'Night divided into two halves; Fajr and Isha do not exceed midnight',
        aladhanId: 1
    },
    {
        id: 'seventhofthenight',
        nameAr: 'سُبع الليل (One-Seventh Rule)',
        nameEn: 'One-Seventh of the Night',
        descAr: 'يحدد وقت الفجر في السبع الأخير والعشاء في السبع الأول من الليل',
        descEn: 'Fajr in last seventh, Isha in first seventh of the night',
        aladhanId: 2
    },
    {
        id: 'none',
        nameAr: 'إيقاف التعديل (قياسي)',
        nameEn: 'No Adjustment (Standard)',
        descAr: 'الحساب الفلكي المباشر فقط (مناسب لبلدان الشرق الأوسط وإفريقيا والمناطق الاستوائية)',
        descEn: 'Direct astronomical calculation without high latitude adjustments',
        aladhanId: 0
    }
];