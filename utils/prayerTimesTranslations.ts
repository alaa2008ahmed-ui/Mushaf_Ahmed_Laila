export type Language = 'ar' | 'en';

export const PRAYER_NAMES_EN: Record<string, string> = {
  Fajr: 'Fajr',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha'
};

export const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

export function getPrayerDisplayName(key: string, language: Language = 'ar'): string {
  if (language === 'en') {
    return PRAYER_NAMES_EN[key] || key;
  }
  return PRAYER_NAMES_AR[key] || key;
}

export const TONE_NAMES_MAP: Record<string, { ar: string; en: string }> = {
  'بدون تنبيه': { ar: 'بدون تنبيه', en: 'No Alert' },
  'أذان 1': { ar: 'أذان 1', en: 'Adhan 1' },
  'أذان 2': { ar: 'أذان 2', en: 'Adhan 2' },
  'أذان 3': { ar: 'أذان 3', en: 'Adhan 3' },
  'أذان 4': { ar: 'أذان 4', en: 'Adhan 4' },
  'تكبيرة 1': { ar: 'تكبيرة 1', en: 'Takbeer 1' },
  'تكبيرة 2': { ar: 'تكبيرة 2', en: 'Takbeer 2' },
  'تكبيرة 3': { ar: 'تكبيرة 3', en: 'Takbeer 3' },
  'تكبيرة 4': { ar: 'تكبيرة 4', en: 'Takbeer 4' },
  'تكبيرة 5': { ar: 'تكبيرة 5', en: 'Takbeer 5' },
  'تكبيرة 6': { ar: 'تكبيرة 6', en: 'Takbeer 6' },
  'الشهادة': { ar: 'الشهادة', en: 'Shahadah' },
  'الصلاة': { ar: 'الصلاة', en: 'Salah' },
  'نغمة مخصصة من الجهاز...': { ar: 'نغمة مخصصة من الجهاز...', en: 'Custom tone from device...' },
  'نغمة مخصصة': { ar: 'نغمة مخصصة', en: 'Custom Tone' }
};

export function getToneDisplayName(name: string, language: Language = 'ar'): string {
  if (!name) return '';
  if (language === 'en') {
    if (TONE_NAMES_MAP[name]) return TONE_NAMES_MAP[name].en;
    // Normalized check
    const clean = name.trim().replace(/ة/g, 'ه').replace(/[أإآ]/g, 'ا');
    for (const [key, val] of Object.entries(TONE_NAMES_MAP)) {
      const keyClean = key.trim().replace(/ة/g, 'ه').replace(/[أإآ]/g, 'ا');
      if (clean === keyClean) return val.en;
    }
    return name;
  }
  return name;
}

export const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

export const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Thaniyah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

export const GREGORIAN_MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export const GREGORIAN_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const toEnglishDigits = (val: string | number): string => {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/[٠-٩]/g, d => (d.charCodeAt(0) - 1632).toString())
    .replace(/[۰-۹]/g, d => (d.charCodeAt(0) - 1776).toString());
};

export const LOCATION_TRANSLATIONS: Record<string, string> = {
  // Saudi Arabia
  'الدمام - الشرقية': 'Dammam - Eastern Province',
  'الدمام': 'Dammam',
  'المملكة العربية السعودية': 'Saudi Arabia',
  'السعودية': 'Saudi Arabia',
  'مكة المكرمة': 'Makkah',
  'مكة': 'Makkah',
  'المدينة المنورة': 'Madinah',
  'المدينة': 'Madinah',
  'الرياض': 'Riyadh',
  'جدة': 'Jeddah',
  'الخبر': 'Khobar',
  'الظهران': 'Dhahran',
  'الأحساء': 'Al-Ahsa',
  'الهفوف': 'Al-Hofuf',
  'الشرقية': 'Eastern Province',
  'المنطقة الشرقية': 'Eastern Province',
  'منطقة الرياض': 'Riyadh Region',
  'منطقة مكة المكرمة': 'Makkah Region',
  'منطقة المدينة المنورة': 'Madinah Region',
  'منطقة القصيم': 'Al-Qassim Region',
  'القصيم': 'Al-Qassim',
  'بريدة': 'Buraidah',
  'عنيزة': 'Unaizah',
  'الرس': 'Ar-Rass',
  'تبوك': 'Tabuk',
  'منطقة تبوك': 'Tabuk Region',
  'حائل': 'Hail',
  'منطقة حائل': 'Hail Region',
  'جازان': 'Jazan',
  'منطقة جازان': 'Jazan Region',
  'نجران': 'Najran',
  'منطقة نجران': 'Najran Region',
  'أبها': 'Abha',
  'عسير': 'Asir',
  'منطقة عسير': 'Asir Region',
  'خميس مشيط': 'Khamis Mushait',
  'الطائف': 'Taif',
  'ينبع': 'Yanbu',
  'الجبيل': 'Jubail',
  'حفر الباطن': 'Hafar Al-Batin',
  'عرعر': 'Arar',
  'سكاكا': 'Sakaka',
  'الجوف': 'Al-Jawf',
  'منطقة الجوف': 'Al-Jawf Region',
  'الباحة': 'Al-Baha',
  'منطقة الباحة': 'Al-Baha Region',
  'الخرج': 'Al-Kharj',
  'الدوادمي': 'Ad-Dawadmi',
  'المجمعة': 'Al-Majmaah',
  'وادي الدواسر': 'Wadi Al-Dawasir',
  'بيشة': 'Bisha',
  'القنفذة': 'Al-Qunfudhah',
  'محايل عسير': 'Muhayil Asir',
  'صبيا': 'Sabya',
  'أبو عريش': 'Abu Arish',
  'صامطة': 'Samtah',
  'شرورة': 'Sharurah',
  'العلا': 'AlUla',
  'ضباء': 'Duba',
  'الوجه': 'Al Wajh',
  'أملج': 'Umluj',
  'طريف': 'Turaif',
  'رفحاء': 'Rafha',
  'القريات': 'Al-Qurayyat',
  'الخفجي': 'Khafji',
  'رأس تنورة': 'Ras Tanura',
  'بقيق': 'Buqayq',

  // Egypt
  'مصر': 'Egypt',
  'جمهورية مصر العربية': 'Egypt',
  'القاهرة': 'Cairo',
  'محافظة القاهرة': 'Cairo Governorate',
  'الجيزة': 'Giza',
  'محافظة الجيزة': 'Giza Governorate',
  'الإسكندرية': 'Alexandria',
  'محافظة الإسكندرية': 'Alexandria Governorate',
  'بورسعيد': 'Port Said',
  'السويس': 'Suez',
  'الإسماعيلية': 'Ismailia',
  'دمياط': 'Damietta',
  'الدقهلية': 'Dakahlia',
  'المنصورة': 'Mansoura',
  'الشرقية (مصر)': 'Sharqia',
  'القليوبية': 'Qalyubia',
  'بنها': 'Banha',
  'كفر الشيخ': 'Kafr El Sheikh',
  'الغربية': 'Gharbia',
  'طنطا': 'Tanta',
  'المنوفية': 'Monufia',
  'شبين الكوم': 'Shibin El Kom',
  'البحيرة': 'Beheira',
  'دمنهور': 'Damanhour',
  'مطروح': 'Matrouh',
  'مرسى مطروح': 'Marsa Matruh',
  'الفيوم': 'Fayoum',
  'بني سويف': 'Beni Suef',
  'المنيا': 'Minya',
  'أسيوط': 'Asyut',
  'سوهاج': 'Sohag',
  'قنا': 'Qena',
  'الأقصر': 'Luxor',
  'أسوان': 'Aswan',
  'البحر الأحمر': 'Red Sea',
  'الغردقة': 'Hurghada',
  'شرم الشيخ': 'Sharm El Sheikh',
  'جنوب سيناء': 'South Sinai',
  'شمال سيناء': 'North Sinai',
  'العريش': 'Arish',
  'الوادي الجديد': 'New Valley',

  // UAE
  'الإمارات': 'UAE',
  'الإمارات العربية المتحدة': 'United Arab Emirates',
  'دبي': 'Dubai',
  'أبو ظبي': 'Abu Dhabi',
  'الشارقة': 'Sharjah',
  'عجمان': 'Ajman',
  'رأس الخيمة': 'Ras Al Khaimah',
  'الفجيرة': 'Fujairah',
  'أم القيوين': 'Umm Al Quwain',
  'العين': 'Al Ain',

  // Other Arab & World Countries
  'الكويت': 'Kuwait',
  'دولة الكويت': 'Kuwait',
  'مدينة الكويت': 'Kuwait City',
  'الأحمدي': 'Al Ahmadi',
  'حولي': 'Hawalli',
  'الفروانية': 'Al Farwaniyah',
  'الجهراء': 'Al Jahra',
  'مبارك الكبير': 'Mubarak Al-Kabeer',
  'قطر': 'Qatar',
  'دولة قطر': 'Qatar',
  'الدوحة': 'Doha',
  'الريان': 'Al Rayyan',
  'الوكرة': 'Al Wakrah',
  'البحرين': 'Bahrain',
  'مملكة البحرين': 'Bahrain',
  'المنامة': 'Manama',
  'المحرق': 'Muharraq',
  'سلطنة عمان': 'Oman',
  'عمان': 'Oman',
  'مسقط': 'Muscat',
  'صلالة': 'Salalah',
  'صحار': 'Sohar',
  'الأردن': 'Jordan',
  'المملكة الأردنية الهاشمية': 'Jordan',
  'عمّان': 'Amman',
  'الزرقاء': 'Zarqa',
  'إربد': 'Irbid',
  'العقبة': 'Aqaba',
  'فلسطين': 'Palestine',
  'دولة فلسطين': 'Palestine',
  'القدس': 'Jerusalem',
  'غزة': 'Gaza',
  'رام الله': 'Ramallah',
  'نابلس': 'Nablus',
  'الخليل': 'Hebron',
  'العراق': 'Iraq',
  'جمهورية العراق': 'Iraq',
  'بغداد': 'Baghdad',
  'البصرة': 'Basra',
  'الموصل': 'Mosul',
  'أربيل': 'Erbil',
  'كربلاء': 'Karbala',
  'النجف': 'Najaf',
  'اليمن': 'Yemen',
  'الجمهورية اليمنية': 'Yemen',
  'صنعاء': 'Sanaa',
  'عدن': 'Aden',
  'تعز': 'Taiz',
  'الحديدة': 'Hodeidah',
  'حضرموت': 'Hadhramaut',
  'المكلا': 'Mukalla',
  'سوريا': 'Syria',
  'دمشق': 'Damascus',
  'حلب': 'Aleppo',
  'حمص': 'Homs',
  'اللاذقية': 'Latakia',
  'لبنان': 'Lebanon',
  'بيروت': 'Beirut',
  'طرابلس (لبنان)': 'Tripoli',
  'صيدا': 'Sidon',
  'تركيا': 'Turkey',
  'إسطنبول': 'Istanbul',
  'أنقرة': 'Ankara',
  'المغرب': 'Morocco',
  'المملكة المغربية': 'Morocco',
  'الرباط': 'Rabat',
  'الدار البيضاء': 'Casablanca',
  'مراكش': 'Marrakech',
  'فاس': 'Fez',
  'طنجة': 'Tangier',
  'الجزائر': 'Algeria',
  'الجزائر العاصمة': 'Algiers',
  'وهران': 'Oran',
  'قسنطينة': 'Constantine',
  'تونس': 'Tunisia',
  'تونس العاصمة': 'Tunis',
  'صفاقس': 'Sfax',
  'سوسة': 'Sousse',
  'ليبيا': 'Libya',
  'طرابلس': 'Tripoli',
  'بنغازي': 'Benghazi',
  'مصراتة': 'Misrata',
  'السودان': 'Sudan',
  'الخرطوم': 'Khartoum',
  'أم درمان': 'Omdurman',
  'بورتسودان': 'Port Sudan',
  'موريتانيا': 'Mauritania',
  'نواكشوط': 'Nouakchott',
  'الصومال': 'Somalia',
  'مقديشو': 'Mogadishu',
  'جيبوتي': 'Djibouti',
  'جزر القمر': 'Comoros',
  'المملكة المتحدة': 'United Kingdom',
  'بريطانيا': 'United Kingdom',
  'لندن': 'London',
  'فرنسا': 'France',
  'باريس': 'Paris',
  'ألمانيا': 'Germany',
  'برلين': 'Berlin',
  'أمريكا': 'United States',
  'الولايات المتحدة': 'United States',
  'الولايات المتحدة الأمريكية': 'United States',
  'نيويورك': 'New York',
  'كندا': 'Canada',
  'تورونتو': 'Toronto',
  'أستراليا': 'Australia',
  'سيدني': 'Sydney',
  'باكستان': 'Pakistan',
  'إسلام آباد': 'Islamabad',
  'كراتشي': 'Karachi',
  'الهند': 'India',
  'نيودلهي': 'New Delhi',
  'مومباي': 'Mumbai',
  'إندونيسيا': 'Indonesia',
  'جاكرتا': 'Jakarta',
  'ماليزيا': 'Malaysia',
  'كوالالمبور': 'Kuala Lumpur',
  'موقعي الحالي': 'Current Location',
  'موقعي': 'Current Location'
};

export function getLocalizedLocationName(text: string, language: Language = 'ar'): string {
  if (!text || language === 'ar') return text;
  if (LOCATION_TRANSLATIONS[text]) return LOCATION_TRANSLATIONS[text];
  
  if (text.includes(' - ')) {
    const parts = text.split(' - ').map(p => p.trim());
    const transParts = parts.map(p => LOCATION_TRANSLATIONS[p] || (p.startsWith('محافظة ') ? (LOCATION_TRANSLATIONS[p.replace('محافظة ', '')] || p) : p));
    return transParts.join(' - ');
  }
  
  const clean = text.trim();
  if (LOCATION_TRANSLATIONS[clean]) return LOCATION_TRANSLATIONS[clean];

  if (clean.startsWith('محافظة ')) {
    const sub = clean.replace('محافظة ', '').trim();
    if (LOCATION_TRANSLATIONS[sub]) return `${LOCATION_TRANSLATIONS[sub]} Governorate`;
  }
  if (clean.startsWith('منطقة ')) {
    const sub = clean.replace('منطقة ', '').trim();
    if (LOCATION_TRANSLATIONS[sub]) return `${LOCATION_TRANSLATIONS[sub]} Region`;
  }

  for (const [k, v] of Object.entries(LOCATION_TRANSLATIONS)) {
    if (clean === k) return v;
  }
  return text;
}

export const PRAYER_TIMES_STRINGS: Record<string, { ar: string; en: string }> = {
  // Header
  back: { ar: 'رجوع للخلف', en: 'Back' },
  refreshLocation: { ar: 'تحديث الموقع', en: 'Refresh location' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  home: { ar: 'الصفحة الرئيسية', en: 'Home' },

  // Quick Action Buttons
  nearbyMosques: { ar: 'المساجد القريبة', en: 'Nearby Mosques' },
  monthlyTimes: { ar: 'المواقيت الشهرية', en: 'Monthly Times' },
  searchBtn: { ar: 'بحث', en: 'Search' },
  searchPlaceholder: { ar: 'عن مدينة أو محافظة...', en: 'Search city or province...' },

  // Muted Alert Banner
  audioAlertsPaused: { ar: 'التنبيهات الصوتية متوقفة', en: 'Audio alerts paused' },
  untilDate: { ar: 'حتى ', en: 'Until ' },
  enable: { ar: 'تفعيل', en: 'Enable' },

  // Next Prayer Card
  remainingUntil: { ar: 'المتبقي على صلاة', en: 'Time remaining until' },
  firstThird: { ar: 'أول الليل', en: 'First Third' },
  midnight: { ar: 'منتصف الليل', en: 'Midnight' },
  lastThird: { ar: 'الثلث الأخير', en: 'Last Third' },

  // Live Silent Mode Banner
  silentModeActive: { ar: 'وضع الصامت نَشِط حالياً لأداء صلاة {p}', en: 'Silent mode active during {p} prayer' },
  mayAllahAccept: { ar: 'تقبل الله طاعتكم', en: 'May Allah accept your worship' },

  // Prayer Card
  alertsMutedTooltip: { ar: 'تم إيقاف التنبيهات والإشعارات تماماً (معطل)', en: 'Alerts and notifications disabled (muted)' },
  alertsActiveTooltip: { ar: 'التنبيهات والإشعارات مفعلة (أخضر)', en: 'Alerts and notifications active (green)' },
  customize: { ar: 'تخصيص', en: 'Customize' },
  dstTooltip: { ar: 'التوقيت الصيفي', en: 'Daylight Saving Time' },
  iqamaPrefix: { ar: 'إقامة', en: 'Iqama' },
  iqamaButtonTooltip: { ar: 'تخصيص وقت ونغمة الإقامة', en: 'Customize Iqama time and alert' },

  // Footer Note
  locationRequirementNote: {
    ar: '(يجب تفعيل الموقع للهاتف لحساب الموقع بدقه)',
    en: '(Device location must be enabled for accurate prayer calculations)'
  },

  // Settings Modal
  prayerSettingsTitle: { ar: 'إعدادات صلاة {p}', en: '{p} Prayer Settings' },
  adjustAdhanTime: { ar: 'تعديل وقت الأذان (بالدقائق)', en: 'Adjust Adhan Time (minutes)' },
  decreaseMinuteTooltip: { ar: 'إنقاص دقيقة', en: 'Decrease minute' },
  increaseMinuteTooltip: { ar: 'زيادة دقيقة', en: 'Increase minute' },
  directTimeEditTooltip: { ar: 'تعديل الوقت يدويًا', en: 'Edit time directly' },
  directTimePrompt: { ar: 'أدخل وقت الأذان الجديد (مثال: 04:30):', en: 'Enter new Adhan time (e.g. 04:30):' },
  offsetLabel: { ar: 'الفارق:', en: 'Offset:' },
  minuteShort: { ar: 'د', en: 'm' },
  manualOffsetTooltip: { ar: 'تعديل الفارق بالدقائق يدويًا', en: 'Edit minute offset manually' },

  // Alert Tone
  alertToneLabel: { ar: 'نغمة التنبيه', en: 'Alert Tone' },
  changeTone: { ar: 'تغيير', en: 'Change' },
  currentToneFile: { ar: 'الملف الحالي:', en: 'Current file:' },
  selectToneModalTitle: { ar: 'اختر نغمة التنبيه', en: 'Select Alert Tone' },
  close: { ar: 'إغلاق', en: 'Close' },

  // Pre-reminder
  readinessReminder: { ar: 'تنبيه الاستعداد', en: 'Readiness Reminder' },
  beforeMinutes: { ar: 'قبل {m}د', en: '{m}m before' },
  timeLabel: { ar: 'الوقت:', en: 'Time:' },
  durationLabel: { ar: 'المدة:', en: 'Duration:' },

  // Iqama Alert
  iqamaAlert: { ar: 'تنبيه الإقامة', en: 'Iqama Alert' },
  iqamaToggleTooltip: { ar: 'تفعيل/تعطيل تنبيه الإقامة', en: 'Enable/disable Iqama alert' },
  afterMinutes: { ar: 'بعد {m}د', en: '{m}m after' },
  iqamaSoundBtn: { ar: 'صوت التنبيه', en: 'Alert Tone' },
  iqamaSoundPreviewTooltip: { ar: 'معاينة صوت تنبيه الإقامة', en: 'Preview Iqama alert tone' },

  // Auto-Silent
  autoSilent: { ar: 'الصامت التلقائي', en: 'Auto-Silent Mode' },
  dndRequiredNotice: { ar: 'يلزم إذن (عدم الإزعاج) لكتم الهاتف تلقائياً', en: 'Do Not Disturb permission required for auto-silent' },
  grantPermission: { ar: 'منح الإذن', en: 'Grant Permission' },

  // Save changes
  saveChanges: { ar: 'حفظ التغييرات', en: 'Save Changes' },

  // Toasts
  toastLocating: { ar: 'جاري تحديد الموقع واستعادة المواقيت الأصلية...', en: 'Locating and restoring original prayer times...' },
  toastLocationSuccess: { ar: 'تم تحديد الموقع واستعادة المواقيت الأصلية تلقائياً', en: 'Location set and original times restored automatically' },
  toastLocationError: { ar: 'حدث خطأ أثناء تحديد الموقع', en: 'Error while detecting location' },
  toastCitySuccess: { ar: 'تم تحديد المدينة بنجاح واستعادة المواقيت الأصلية', en: 'City located successfully and original times restored' },
  toastSearchError: { ar: 'حدث خطأ أثناء البحث أو لم يتم العثور على نتائج.', en: 'Error during search or no results found.' },
  toastSettingsSaved: { ar: 'تم حفظ تعديل وقت الصلاة بنجاح', en: 'Prayer time settings saved successfully' },
  toastAudioMutedNotice: { ar: 'التنبيهات الصوتية متوقفة مؤقتاً. قم بإلغاء الكتم أولاً.', en: 'Audio alerts are paused. Unmute first.' },
  toastPrayerDisabled: { ar: 'تم إيقاف تنبيه وإشعار صلاة {p} تماماً (صوتي ومرئي)', en: 'Alert and notification for {p} prayer disabled completely' },
  toastPrayerEnabled: { ar: 'تم تفعيل تنبيه وإشعار صلاة {p} (صوتي ومرئي)', en: 'Alert and notification for {p} prayer enabled' },
  toastDstEnabled: { ar: 'تم تفعيل التقويم الصيفي (+60 دقيقة)', en: 'Daylight Saving Time enabled (+60 min)' },
  toastDstDisabled: { ar: 'تم إلغاء التقويم الصيفي', en: 'Daylight Saving Time disabled' },
  toastDownloadingTone: { ar: 'جاري تحميل الصوت للمعاينة...', en: 'Loading audio preview...' },
  toastToneSelected: { ar: 'تم اختيار الصوت بنجاح', en: 'Audio tone selected successfully' },
  toastToneDownloadFailed: { ar: 'فشل في تحميل الملف الصوتي. يرجى التحقق من اتصالك بالإنترنت.', en: 'Failed to load audio file. Please check your internet connection.' },

  // Alert Modals
  adhanModalBadge: { ar: 'تنبيه موعد الأذان', en: 'Adhan Prayer Alert' },
  adhanModalTitle: { ar: 'حان الآن موعد أذان {p}', en: 'It is now time for {p} Adhan' },
  timeInfo: { ar: 'الوقت:', en: 'Time:' },
  adhanPropheticReminder: {
    ar: '«الله أكبر الله أكبر.. لا تنس ذكر الله والصلاة على النبي ﷺ ودعاء الوسيلة»',
    en: '«Allahu Akbar, Allahu Akbar.. Remember Allah, send blessings upon the Prophet ﷺ, and recite the supplication»'
  },
  stopSound: { ar: 'إيقاف الصوت', en: 'Stop Audio' },
  doneClose: { ar: 'تم (إغلاق)', en: 'Done (Close)' },

  iqamaModalBadge: { ar: 'تنبيه إقامة الصلاة', en: 'Iqama Prayer Alert' },
  iqamaModalTitle: { ar: 'حان الآن موعد إقامة صلاة {p}', en: 'It is now time for {p} Iqama' },
  iqamaTimeSuffix: { ar: '(بعد {m} دقيقة من الأذان)', en: '({m} minutes after Adhan)' },
  iqamaPropheticReminder: {
    ar: '«أُقيمت الصلاة.. استووا وتراصّوا واعتدلوا أثابكم الله»',
    en: '«Salah has been established.. Straighten and close your ranks, may Allah reward you»'
  },
  replayTone: { ar: 'إعادة النغمة', en: 'Replay Tone' },
  performPrayer: { ar: 'أداء الصلاة', en: 'Perform Prayer' },

  // Notification Settings Modal Strings
  appNotificationsTab: { ar: 'إشعارات التطبيق', en: 'App Notifications' },
  phoneNotificationsTab: { ar: 'إشعارات الهاتف', en: 'Phone Notifications' },
  appNotifSubtitle: { ar: 'إشعارات تظهر داخل التطبيق أثناء الاستخدام', en: 'In-app notifications while using the application' },
  phoneNotifSubtitle: { ar: 'إشعارات تظهر على شاشة الهاتف حتى لو كان التطبيق مغلقاً', en: 'Notifications that appear on phone screen even when closed' },
  nightTimesSection: { ar: 'أوقات الليل', en: 'Night Times' },
  athkarSection: { ar: 'الأذكار والتسبيح', en: 'Athkar & Tasbeeh' },
  randomAthkarTitle: { ar: 'أذكار عشوائية', en: 'Random Athkar' },
  randomAthkarDesc: { ar: 'تلقي أذكار وتنبيهات عشوائية خلال اليوم لتذكيرك بذكر الله', en: 'Receive random athkar and reminders throughout the day' },
  randomFrequencyLabel: { ar: 'عدد المرات يومياً:', en: 'Times per day:' },
  startTimeLabel: { ar: 'وقت البدء:', en: 'Start time:' },
  endTimeLabel: { ar: 'وقت الانتهاء:', en: 'End time:' },
  pauseAudioSection: { ar: 'إيقاف التنبيهات الصوتية للصلاة', en: 'Pause Prayer Audio Alerts' },
  enableAudioBtn: { ar: 'تفعيل الصوت', en: 'Enable Audio' },
  audioMutedUntilNotice: { ar: 'التنبيهات الصوتية متوقفة حتى: {date}', en: 'Audio alerts paused until: {date}' },
  saveAndClose: { ar: 'حفظ وإغلاق', en: 'Save & Close' },
  dailyReminderNotice: { ar: 'تنبيه يومي في الوقت المحدد', en: 'Daily reminder at scheduled time' },
  weeklyFridayNotice: { ar: 'تنبيه أسبوعي يوم الجمعة', en: 'Weekly reminder on Friday' },
  enabledPrefix: { ar: 'تم تفعيل', en: 'Enabled' },
  disabledPrefix: { ar: 'تم تعطيل', en: 'Disabled' },
  today: { ar: 'اليوم', en: 'Today' },
  tomorrow: { ar: 'غداً', en: 'Tomorrow' },
  twoDays: { ar: 'يومين', en: '2 Days' },
  threeDays: { ar: '3 أيام', en: '3 Days' },
  fourDays: { ar: '4 أيام', en: '4 Days' },
  oneWeek: { ar: 'أسبوع', en: '1 Week' },
  twoWeeks: { ar: 'أسبوعين', en: '2 Weeks' },
  oneMonth: { ar: 'شهر', en: '1 Month' },

  // Notification setting item labels & descs
  sabahAthkar: { ar: 'أذكار الصباح', en: 'Morning Athkar' },
  masaaAthkar: { ar: 'أذكار المساء', en: 'Evening Athkar' },
  duaTime: { ar: 'وقت الدعاء', en: 'Dua Time' },
  tasbeehMorning: { ar: 'التسبيح (صباحاً)', en: 'Morning Tasbeeh' },
  tasbeehEvening: { ar: 'التسبيح (مساءً)', en: 'Evening Tasbeeh' },
  kahfSurah: { ar: 'سورة الكهف', en: 'Surat Al-Kahf' },

  quarterNotif: { ar: 'الأحزاب والأرباع', en: 'Hizb & Quarters' },
  quarterNotifDesc: { ar: 'تنبيه عند الوصول لبداية حزب أو ربع جديد', en: 'Alert when reaching a new Hizb or Quarter' },
  juzNotif: { ar: 'بداية الأجزاء', en: 'Start of Juz' },
  juzNotifDesc: { ar: 'تنبيه عند الانتقال لجزء جديد', en: 'Alert when moving to a new Juz' },
  sajdaNotif: { ar: 'مواضع السجدات', en: 'Prostration Verses (Sajdah)' },
  sajdaNotifDesc: { ar: 'تنبيه عند الوصول لآية بها سجدة تلاوة', en: 'Alert when reaching a verse with prostration' },
  themesNotif: { ar: 'تغيير الثيمات', en: 'Theme Changes' },
  themesNotifDesc: { ar: 'تنبيه عند تطبيق لون أو ثيم جديد', en: 'Alert when applying a new theme' },
  downloadsNotif: { ar: 'التحميلات', en: 'Downloads' },
  downloadsNotifDesc: { ar: 'تنبيهات حالة تحميل السور أو التفاسير', en: 'Alerts for download progress and completion' },
  bookmarksNotif: { ar: 'الإشارات المرجعية', en: 'Bookmarks' },
  bookmarksNotifDesc: { ar: 'تنبيه عند حفظ أو حذف إشارة مرجعية', en: 'Alert when saving or deleting bookmarks' },
  generalNotif: { ar: 'تنبيهات عامة', en: 'General Alerts' },
  firstThirdDesc: { ar: 'تنبيه بدخول وقت أول الليل', en: 'Alert when first third of the night begins' },
  midnightDesc: { ar: 'تنبيه بدخول منتصف الليل الشرعي', en: 'Alert when Islamic midnight begins' },
  lastThirdDesc: { ar: 'تنبيه بدخول الثلث الأخير من الليل', en: 'Alert when the last third of the night begins' },

  // Monthly Prayer Times Page
  monthlyPrayerTitle: { ar: 'مواقيت الشهر', en: 'Monthly Prayer Times' },
  exportPdf: { ar: 'تصدير ملف PDF', en: 'Export PDF' },
  shareMonthlyTimes: { ar: 'مشاركة المواقيت', en: 'Share Monthly Times' },
  share: { ar: 'مشاركة', en: 'Share' },
  selectMonthYear: { ar: 'اختيار الشهر والسنة', en: 'Select Month & Year' },
  month: { ar: 'الشهر', en: 'Month' },
  year: { ar: 'السنة', en: 'Year' },
  done: { ar: 'تم', en: 'Done' },
  hijri: { ar: 'هجري', en: 'Hijri' },
  gregorian: { ar: 'ميلادي', en: 'Gregorian' },
  dayHeader: { ar: 'اليوم', en: 'Day' },
  dateHeader: { ar: 'م/هـ', en: 'H / G' },
  hijriDateHeader: { ar: 'التاريخ الهجري', en: 'Hijri Date' },
  gregorianDateHeader: { ar: 'التاريخ الميلادي', en: 'Gregorian Date' },
  sharePdfTitle: { ar: 'مشاركة أو حفظ ملف PDF', en: 'Share or Save PDF' },
  shareNotSupported: { ar: 'المشاركة غير مدعومة في هذا المتصفح', en: 'Sharing is not supported in this browser' },
  pdfError: { ar: 'حدث خطأ أثناء إنشاء ملف PDF', en: 'Error generating PDF file' },
  createdAppAttribution: { ar: 'مصحف أحمد وليلى', en: 'Mushaf Ahmed & Laila' },
  monthlyShareHeading: { ar: 'مواقيت الصلاة لشهر {m}', en: 'Prayer Times for the Month of {m}' },
  locationLabel: { ar: 'الموقع: {loc}', en: 'Location: {loc}' },
  generatedByLabel: { ar: 'تم الإنشاء بواسطة: {app}', en: 'Created by: {app}' }
};

export function tPrayer(key: string, language: Language = 'ar', params?: Record<string, string | number>): string {
  const item = PRAYER_TIMES_STRINGS[key];
  let res = item ? (item[language] || item.ar || key) : key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      res = res.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return res;
}

