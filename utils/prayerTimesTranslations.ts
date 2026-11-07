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
  'اختيار نغمة': { ar: 'اختيار نغمة', en: 'Select tone' },
  'نغمة مخصصة من الجهاز...': { ar: 'اختيار نغمة', en: 'Select tone' },
  'نغمة مخصصة': { ar: 'نغمة مخصصة', en: 'Custom Tone' },
  'رنين هادئ': { ar: 'رنين هادئ', en: 'Soft Chime' },
  'جرس لطيف': { ar: 'جرس لطيف', en: 'Gentle Bell' },
  'بلورات نقية': { ar: 'بلورات نقية', en: 'Crystal Chime' },
  'قطرة ماء': { ar: 'قطرة ماء', en: 'Water Droplet' },
  'وتر هادئ': { ar: 'وتر هادئ', en: 'Soft Harpeggio' },
  'تنبيه خفيف': { ar: 'تنبيه خفيف', en: 'Subtle Ping' },
  'نغمة خشبية': { ar: 'نغمة خشبية', en: 'Warm Marimba' },
  'بدون صوت': { ar: 'بدون صوت', en: 'Silent' }
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
  // Common terms & System
  'موقعي الحالي': 'Current Location',
  'موقعي': 'Current Location',
  'موقع غير معروف': 'Unknown Location',

  // Saudi Arabia - All Provinces & Regions
  'الدمام - الشرقية': 'Dammam - Eastern Province',
  'الدمام - المنطقة الشرقية': 'Dammam - Eastern Province',
  'الظهران - الشرقية': 'Dhahran - Eastern Province',
  'الظهران - المنطقة الشرقية': 'Dhahran - Eastern Province',
  'الخبر - الشرقية': 'Khobar - Eastern Province',
  'الخبر - المنطقة الشرقية': 'Khobar - Eastern Province',
  'الجبيل - الشرقية': 'Jubail - Eastern Province',
  'الجبيل - المنطقة الشرقية': 'Jubail - Eastern Province',
  'الأحساء - الشرقية': 'Al-Ahsa - Eastern Province',
  'الأحساء - المنطقة الشرقية': 'Al-Ahsa - Eastern Province',
  'الهفوف - الشرقية': 'Al-Hofuf - Eastern Province',
  'الهفوف - المنطقة الشرقية': 'Al-Hofuf - Eastern Province',
  'المملكة العربية السعودية': 'Saudi Arabia',
  'السعودية': 'Saudi Arabia',
  'مكة المكرمة': 'Makkah',
  'مكة': 'Makkah',
  'المدينة المنورة': 'Madinah',
  'المدينة': 'Madinah',
  'الرياض': 'Riyadh',
  'مدينة الرياض': 'Riyadh City',
  'جدة': 'Jeddah',
  'الخبر': 'Khobar',
  'الظهران': 'Dhahran',
  'الدمام': 'Dammam',
  'الأحساء': 'Al-Ahsa',
  'الهفوف': 'Al-Hofuf',
  'المبرز': 'Al-Mubarraz',
  'القطيف': 'Al-Qatif',
  'الشرقية': 'Eastern Province',
  'المنطقة الشرقية': 'Eastern Province',
  'منطقة الرياض': 'Riyadh Region',
  'منطقة مكة المكرمة': 'Makkah Region',
  'منطقة مكة': 'Makkah Region',
  'منطقة المدينة المنورة': 'Madinah Region',
  'منطقة المدينة': 'Madinah Region',
  'منطقة القصيم': 'Al-Qassim Region',
  'القصيم': 'Al-Qassim',
  'بريدة': 'Buraidah',
  'عنيزة': 'Unaizah',
  'الرس': 'Ar-Rass',
  'المذنب': 'Al-Mithnab',
  'البكيرية': 'Al-Bukayriyah',
  'البدائع': 'Al-Badayea',
  'الأسياح': 'Al-Asyah',
  'النبهانية': 'Al-Nabhaniyah',
  'عيون الجواء': 'Uyun Al-Jiwa',
  'رياض الخبراء': 'Riyadh Al-Khabra',
  'الشماسية': 'Ash-Shimasiyah',
  'تبوك': 'Tabuk',
  'منطقة تبوك': 'Tabuk Region',
  'تيماء': 'Tayma',
  'ضباء': 'Duba',
  'الوجه': 'Al-Wajh',
  'أملج': 'Umluj',
  'حقل': 'Haql',
  'البدع': 'Al-Bad',
  'حائل': 'Hail',
  'منطقة حائل': 'Hail Region',
  'بقعاء': 'Baqaa',
  'الغزالة': 'Al-Ghazalah',
  'الشنان': 'Al-Shanan',
  'جازان': 'Jazan',
  'جيزان': 'Jazan',
  'منطقة جازان': 'Jazan Region',
  'صبيا': 'Sabya',
  'أبو عريش': 'Abu Arish',
  'صامطة': 'Samtah',
  'بيش': 'Baish',
  'الدرب': 'Al-Darb',
  'الحرث': 'Al-Harth',
  'ضمد': 'Damad',
  'الريث': 'Al-Reeth',
  'جزر فرسان': 'Farasan Islands',
  'فرسان': 'Farasan',
  'الدائر': 'Al-Dair',
  'العارضة': 'Al-Aridhah',
  'أحد المسارحة': 'Ahad Al-Masarihah',
  'العيدابي': 'Al-Idabi',
  'فيفاء': 'Faifa',
  'هروب': 'Harub',
  'نجران': 'Najran',
  'منطقة نجران': 'Najran Region',
  'شرورة': 'Sharurah',
  'حبونا': 'Hubuna',
  'بدر الجنوب': 'Badr Al-Janub',
  'يدمة': 'Yadamah',
  'ثار': 'Thar',
  'خباش': 'Khabash',
  'الخرخير': 'Al-Kharkhir',
  'أبها': 'Abha',
  'عسير': 'Asir',
  'منطقة عسير': 'Asir Region',
  'خميس مشيط': 'Khamis Mushait',
  'بيشة': 'Bisha',
  'محايل عسير': 'Muhayil Asir',
  'محايل': 'Muhayil',
  'النماص': 'Al-Namas',
  'أحد رفيدة': 'Ahad Rafidah',
  'ظهران الجنوب': 'Dhahran Al-Janub',
  'بلقرن': 'Balqarn',
  'سراة عبيدة': 'Sarat Abidah',
  'المجاردة': 'Al-Majardah',
  'رجال ألمع': 'Rijal Alma',
  'تثليث': 'Tathlith',
  'تنومة': 'Tanomah',
  'البرك': 'Al-Birk',
  'بارق': 'Bariq',
  'طريب': 'Turaib',
  'الطائف': 'Taif',
  'ينبع': 'Yanbu',
  'ينبع البحر': 'Yanbu Al-Bahr',
  'ينبع الصناعية': 'Yanbu Industrial City',
  'الجبيل': 'Jubail',
  'الجبيل الصناعية': 'Jubail Industrial City',
  'حفر الباطن': 'Hafar Al-Batin',
  'عرعر': 'Arar',
  'سكاكا': 'Sakaka',
  'الجوف': 'Al-Jawf',
  'منطقة الجوف': 'Al-Jawf Region',
  'دومة الجندل': 'Dumat Al-Jandal',
  'طبرجل': 'Tubarjal',
  'القريات': 'Al-Qurayyat',
  'الباحة': 'Al-Baha',
  'منطقة الباحة': 'Al-Baha Region',
  'بلجرشي': 'Baljurashi',
  'المندق': 'Al-Mandaq',
  'المخواة': 'Al-Mikhwah',
  'قلوة': 'Qilwah',
  'العقيق': 'Al-Aqiq',
  'القرى': 'Al-Qura',
  'الخرج': 'Al-Kharj',
  'الدوادمي': 'Ad-Dawadmi',
  'المجمعة': 'Al-Majmaah',
  'القويعية': 'Al-Quwayiyah',
  'وادي الدواسر': 'Wadi Al-Dawasir',
  'الأفلاج': 'Al-Aflaj',
  'الزلفي': 'Al-Zulfi',
  'شقراء': 'Shaqra',
  'حوطة بني تميم': 'Hawtat Bani Tamim',
  'عفيف': 'Afif',
  'السليل': 'As-Sulayyil',
  'ضرما': 'Dhurma',
  'المزاحمية': 'Al-Muzahmiyya',
  'رماح': 'Rumah',
  'ثادق': 'Thadiq',
  'حريملاء': 'Huraymila',
  'الحريق': 'Al-Hariq',
  'مرات': 'Marat',
  'الدرعية': 'Diriyah',
  'الحدود الشمالية': 'Northern Borders',
  'منطقة الحدود الشمالية': 'Northern Borders Region',
  'رفحاء': 'Rafha',
  'طريف': 'Turaif',
  'العويقيلة': 'Al-Uwayqilah',
  'القنفذة': 'Al-Qunfudhah',
  'الليث': 'Al-Lith',
  'رابغ': 'Rabigh',
  'خليص': 'Khulais',
  'رنية': 'Ranyah',
  'تربة': 'Turbah',
  'الخرمة': 'Al-Khurmah',
  'الكامل': 'Al-Kamil',
  'العرضيات': 'Al-Ardiyat',
  'أضم': 'Adham',
  'ميسان': 'Maysan',
  'بحرة': 'Bahrah',
  'العلا': 'AlUla',
  'بدر': 'Badr',
  'خيبر': 'Khaybar',
  'الحناكية': 'Al-Hanakiyah',
  'مهد الذهب': 'Mahd Al-Dhahab',
  'العيص': 'Al-Ais',
  'وادي الفرع': 'Wadi Al-Fara',
  'الخفجي': 'Al-Khafji',
  'رأس تنورة': 'Ras Tanura',
  'بقيق': 'Buqayq',
  'النعيرية': 'Al-Nairiyah',
  'قرية العليا': 'Qaryat Al-Ulya',

  // Egypt - All Governorates & Major Cities
  'مصر': 'Egypt',
  'جمهورية مصر العربية': 'Egypt',
  'القاهرة': 'Cairo',
  'محافظة القاهرة': 'Cairo Governorate',
  'الجيزة': 'Giza',
  'محافظة الجيزة': 'Giza Governorate',
  'الإسكندرية': 'Alexandria',
  'محافظة الإسكندرية': 'Alexandria Governorate',
  'بورسعيد': 'Port Said',
  'محافظة بورسعيد': 'Port Said Governorate',
  'السويس': 'Suez',
  'محافظة السويس': 'Suez Governorate',
  'الإسماعيلية': 'Ismailia',
  'محافظة الإسماعيلية': 'Ismailia Governorate',
  'دمياط': 'Damietta',
  'محافظة دمياط': 'Damietta Governorate',
  'الدقهلية': 'Dakahlia',
  'محافظة الدقهلية': 'Dakahlia Governorate',
  'المنصورة': 'Mansoura',
  'الشرقية (مصر)': 'Sharqia',
  'محافظة الشرقية': 'Sharqia Governorate',
  'الزقازيق': 'Zagazig',
  'القليوبية': 'Qalyubia',
  'محافظة القليوبية': 'Qalyubia Governorate',
  'بنها': 'Banha',
  'شبرا الخيمة': 'Shubra El-Kheima',
  'كفر الشيخ': 'Kafr El Sheikh',
  'محافظة كفر الشيخ': 'Kafr El Sheikh Governorate',
  'الغربية': 'Gharbia',
  'محافظة الغربية': 'Gharbia Governorate',
  'طنطا': 'Tanta',
  'المحلة الكبرى': 'Al Mahalla Al Kubra',
  'المنوفية': 'Monufia',
  'محافظة المنوفية': 'Monufia Governorate',
  'شبين الكوم': 'Shibin El Kom',
  'البحيرة': 'Beheira',
  'محافظة البحيرة': 'Beheira Governorate',
  'دمنهور': 'Damanhour',
  'مطروح': 'Matrouh',
  'محافظة مطروح': 'Matrouh Governorate',
  'مرسى مطروح': 'Marsa Matruh',
  'الفيوم': 'Fayoum',
  'محافظة الفيوم': 'Fayoum Governorate',
  'بني سويف': 'Beni Suef',
  'محافظة بني سويف': 'Beni Suef Governorate',
  'المنيا': 'Minya',
  'محافظة المنيا': 'Minya Governorate',
  'أسيوط': 'Asyut',
  'محافظة أسيوط': 'Asyut Governorate',
  'سوهاج': 'Sohag',
  'محافظة سوهاج': 'Sohag Governorate',
  'قنا': 'Qena',
  'محافظة قنا': 'Qena Governorate',
  'الأقصر': 'Luxor',
  'محافظة الأقصر': 'Luxor Governorate',
  'أسوان': 'Aswan',
  'محافظة أسوان': 'Aswan Governorate',
  'البحر الأحمر': 'Red Sea',
  'محافظة البحر الأحمر': 'Red Sea Governorate',
  'الغردقة': 'Hurghada',
  'سفاجا': 'Safaga',
  'مرسى علم': 'Marsa Alam',
  'شرم الشيخ': 'Sharm El Sheikh',
  'جنوب سيناء': 'South Sinai',
  'محافظة جنوب سيناء': 'South Sinai Governorate',
  'دهب': 'Dahab',
  'نويبع': 'Nuweiba',
  'شمال سيناء': 'North Sinai',
  'محافظة شمال سيناء': 'North Sinai Governorate',
  'العريش': 'Arish',
  'الوادي الجديد': 'New Valley',
  'محافظة الوادي الجديد': 'New Valley Governorate',
  'الخارجة': 'Kharga',
  'الداخلة': 'Dakhla',
  'مدينة السادس من أكتوبر': '6th of October City',
  '6 أكتوبر': '6th of October City',
  'القاهرة الجديدة': 'New Cairo',
  'حلوان': 'Helwan',

  // UAE
  'الإمارات': 'United Arab Emirates',
  'الإمارات العربية المتحدة': 'United Arab Emirates',
  'دبي': 'Dubai',
  'إمارة دبي': 'Dubai Emirate',
  'أبو ظبي': 'Abu Dhabi',
  'أبوظبي': 'Abu Dhabi',
  'إمارة أبو ظبي': 'Abu Dhabi Emirate',
  'الشارقة': 'Sharjah',
  'إمارة الشارقة': 'Sharjah Emirate',
  'عجمان': 'Ajman',
  'إمارة عجمان': 'Ajman Emirate',
  'رأس الخيمة': 'Ras Al Khaimah',
  'إمارة رأس الخيمة': 'Ras Al Khaimah Emirate',
  'الفجيرة': 'Fujairah',
  'إمارة الفجيرة': 'Fujairah Emirate',
  'أم القيوين': 'Umm Al Quwain',
  'إمارة أم القيوين': 'Umm Al Quwain Emirate',
  'العين': 'Al Ain',

  // Kuwait
  'الكويت': 'Kuwait',
  'دولة الكويت': 'Kuwait',
  'مدينة الكويت': 'Kuwait City',
  'الأحمدي': 'Al Ahmadi',
  'حولي': 'Hawalli',
  'الفروانية': 'Al Farwaniyah',
  'الجهراء': 'Al Jahra',
  'مبارك الكبير': 'Mubarak Al-Kabeer',
  'العاصمة (الكويت)': 'Capital Governorate',

  // Qatar
  'قطر': 'Qatar',
  'دولة قطر': 'Qatar',
  'الدوحة': 'Doha',
  'الريان': 'Al Rayyan',
  'الوكرة': 'Al Wakrah',
  'أم صلال': 'Umm Salal',
  'الخور': 'Al Khor',
  'الشمال': 'Madinat ash Shamal',
  'الظعاين': 'Al Daayen',
  'الشحانية': 'Al Shahaniya',

  // Bahrain
  'البحرين': 'Bahrain',
  'مملكة البحرين': 'Bahrain',
  'المنامة': 'Manama',
  'المحرق': 'Muharraq',
  'الرفاع': 'Riffa',
  'مدينة عيسى': 'Isa Town',
  'مدينة حمد': 'Hamad Town',
  'سترة': 'Sitra',

  // Oman
  'سلطنة عمان': 'Oman',
  'عمان': 'Oman',
  'مسقط': 'Muscat',
  'محافظة مسقط': 'Muscat Governorate',
  'صلالة': 'Salalah',
  'ظفار': 'Dhofar',
  'صحار': 'Sohar',
  'نزوى': 'Nizwa',
  'صور (عمان)': 'Sur',
  'البريمي': 'Al Buraimi',
  'السيب': 'Seeb',
  'بوشر': 'Bawshar',
  'مطرح': 'Muttrah',

  // Jordan
  'الأردن': 'Jordan',
  'المملكة الأردنية الهاشمية': 'Jordan',
  'عمّان': 'Amman',
  'الزرقاء': 'Zarqa',
  'إربد': 'Irbid',
  'العقبة': 'Aqaba',
  'السلط': 'As-Salt',
  'مادبا': 'Madaba',
  'جرش': 'Jerash',
  'عجلون': 'Ajloun',
  'المفرق': 'Mafraq',
  'الكرك': 'Karak',
  'الطفيلة': 'Tafilah',
  'معان': 'Maan',

  // Palestine
  'فلسطين': 'Palestine',
  'دولة فلسطين': 'Palestine',
  'القدس': 'Jerusalem',
  'القدس الشريف': 'Jerusalem',
  'غزة': 'Gaza',
  'رام الله': 'Ramallah',
  'نابلس': 'Nablus',
  'الخليل': 'Hebron',
  'بيت لحم': 'Bethlehem',
  'جنين': 'Jenin',
  'طولكرم': 'Tulkarm',
  'قلقيلية': 'Qalqilya',
  'أريحا': 'Jericho',
  'خان يونس': 'Khan Yunis',
  'رفح': 'Rafah',

  // Iraq
  'العراق': 'Iraq',
  'جمهورية العراق': 'Iraq',
  'بغداد': 'Baghdad',
  'البصرة': 'Basra',
  'الموصل': 'Mosul',
  'أربيل': 'Erbil',
  'كربلاء': 'Karbala',
  'النجف': 'Najaf',
  'السليمانية': 'Sulaymaniyah',
  'كركوك': 'Kirkuk',
  'الأنبار': 'Al-Anbar',
  'الفلوجة': 'Fallujah',
  'الرمادي': 'Ramadi',
  'الحلة': 'Hillah',
  'الديوانية': 'Diwaniyah',
  'الكوت': 'Kut',
  'العمارة': 'Amarah',
  'الناصرية': 'Nasiriyah',
  'سامراء': 'Samarra',
  'دهوك': 'Duhok',

  // Yemen
  'اليمن': 'Yemen',
  'الجمهورية اليمنية': 'Yemen',
  'صنعاء': 'Sanaa',
  'عدن': 'Aden',
  'تعز': 'Taiz',
  'الحديدة': 'Hodeidah',
  'إب': 'Ibb',
  'حضرموت': 'Hadhramaut',
  'المكلا': 'Mukalla',
  'ذمار': 'Dhamar',
  'سيئون': 'Sayun',
  'مأرب': 'Marib',

  // Syria
  'سوريا': 'Syria',
  'الجمهورية العربية السورية': 'Syria',
  'دمشق': 'Damascus',
  'حلب': 'Aleppo',
  'حمص': 'Homs',
  'حماة': 'Hama',
  'اللاذقية': 'Latakia',
  'طرطوس': 'Tartus',
  'دير الزور': 'Deir ez-Zor',
  'الرقة': 'Raqqa',
  'إدلب': 'Idlib',
  'درعا': 'Daraa',
  'السويداء': 'As-Suwayda',

  // Lebanon
  'لبنان': 'Lebanon',
  'الجمهورية اللبنانية': 'Lebanon',
  'بيروت': 'Beirut',
  'طرابلس (لبنان)': 'Tripoli',
  'صيدا': 'Sidon',
  'صور': 'Tyre',
  'زحلة': 'Zahle',
  'بعلبك': 'Baalbek',
  'جبيل': 'Byblos',
  'جونيه': 'Jounieh',

  // Sudan
  'السودان': 'Sudan',
  'جمهورية السودان': 'Sudan',
  'الخرطوم': 'Khartoum',
  'أم درمان': 'Omdurman',
  'بحري': 'Khartoum North',
  'بورتسودان': 'Port Sudan',
  'كسلا': 'Kassala',
  'الأبيض': 'Al-Ubayyid',
  'ود مدني': 'Wad Madani',
  'القضارف': 'Gedarif',
  'الفاشر': 'El Fasher',
  'نيالا': 'Nyala',

  // Libya
  'ليبيا': 'Libya',
  'دولة ليبيا': 'Libya',
  'طرابلس': 'Tripoli',
  'بنغازي': 'Benghazi',
  'مصراتة': 'Misrata',
  'الزاوية': 'Zawiya',
  'البيضاء': 'Bayda',
  'طبرق': 'Tobruk',
  'سبها': 'Sabha',
  'سرت': 'Sirte',

  // Tunisia
  'تونس': 'Tunisia',
  'الجمهورية التونسية': 'Tunisia',
  'تونس العاصمة': 'Tunis',
  'صفاقس': 'Sfax',
  'سوسة': 'Sousse',
  'القيروان': 'Kairouan',
  'بنزرت': 'Bizerte',
  'قابس': 'Gabes',
  'أريانة': 'Ariana',
  'المنستير': 'Monastir',

  // Algeria
  'الجزائر': 'Algeria',
  'الجمهورية الجزائرية الديمقراطية الشعبية': 'Algeria',
  'الجزائر العاصمة': 'Algiers',
  'وهران': 'Oran',
  'قسنطينة': 'Constantine',
  'عنابة': 'Annaba',
  'باتنة': 'Batna',
  'سطيف': 'Setif',
  'تلمسان': 'Tlemcen',
  'البليدة': 'Blida',
  'بجاية': 'Bejaia',

  // Morocco
  'المغرب': 'Morocco',
  'المملكة المغربية': 'Morocco',
  'الرباط': 'Rabat',
  'الدار البيضاء': 'Casablanca',
  'مراكش': 'Marrakech',
  'فاس': 'Fez',
  'طنجة': 'Tangier',
  'أكادير': 'Agadir',
  'مكناس': 'Meknes',
  'وجدة': 'Oujda',
  'تطوان': 'Tetouan',
  'العيون': 'Laayoune',

  // Mauritania, Somalia, Djibouti, Comoros
  'موريتانيا': 'Mauritania',
  'الجمهورية الإسلامية الموريتانية': 'Mauritania',
  'نواكشوط': 'Nouakchott',
  'نواذيبو': 'Nouadhibou',
  'الصومال': 'Somalia',
  'جمهورية الصومال الفيدرالية': 'Somalia',
  'مقديشو': 'Mogadishu',
  'هرجيسا': 'Hargeisa',
  'جيبوتي': 'Djibouti',
  'جمهورية جيبوتي': 'Djibouti',
  'مدينة جيبوتي': 'Djibouti City',
  'جزر القمر': 'Comoros',
  'جمهورية جزر القمر المتحدة': 'Comoros',
  'موروني': 'Moroni',

  // Turkey & Middle East
  'تركيا': 'Turkey',
  'إسطنبول': 'Istanbul',
  'أنقرة': 'Ankara',
  'إزمير': 'Izmir',
  'بورصة': 'Bursa',
  'أنطاليا': 'Antalya',
  'قونية': 'Konya',
  'غازي عنتاب': 'Gaziantep',
  'طرابزون': 'Trabzon',
  'إيران': 'Iran',
  'طهران': 'Tehran',
  'مشهد': 'Mashhad',
  'أصفهان': 'Isfahan',
  'شيراز': 'Shiraz',
  'تبريز': 'Tabriz',

  // Europe & Americas & Worldwide
  'المملكة المتحدة': 'United Kingdom',
  'بريطانيا': 'United Kingdom',
  'إنجلترا': 'England',
  'لندن': 'London',
  'مانشستر': 'Manchester',
  'برمنغهام': 'Birmingham',
  'فرنسا': 'France',
  'باريس': 'Paris',
  'مرسيليا': 'Marseille',
  'ليون': 'Lyon',
  'ألمانيا': 'Germany',
  'برلين': 'Berlin',
  'ميونخ': 'Munich',
  'فرانكفورت': 'Frankfurt',
  'هامبورغ': 'Hamburg',
  'إيطاليا': 'Italy',
  'روما': 'Rome',
  'ميلانو': 'Milan',
  'إسبانيا': 'Spain',
  'مدريد': 'Madrid',
  'برشلونة': 'Barcelona',
  'هولندا': 'Netherlands',
  'أمستردام': 'Amsterdam',
  'بلجيكا': 'Belgium',
  'بروكسل': 'Brussels',
  'سويسرا': 'Switzerland',
  'جنيف': 'Geneva',
  'زيورخ': 'Zurich',
  'النمسا': 'Austria',
  'فيينا': 'Vienna',
  'السويد': 'Sweden',
  'ستوكهولم': 'Stockholm',
  'النرويج': 'Norway',
  'أوسلو': 'Oslo',
  'الدنمارك': 'Denmark',
  'كوبنهاغن': 'Copenhagen',
  'اليونان': 'Greece',
  'أثينا': 'Athens',
  'روسيا': 'Russia',
  'موسكو': 'Moscow',
  'البوسنة والهرسك': 'Bosnia and Herzegovina',
  'سراييفو': 'Sarajevo',
  'الولايات المتحدة': 'United States',
  'الولايات المتحدة الأمريكية': 'United States',
  'أمريكا': 'United States',
  'نيويورك': 'New York',
  'واشنطن': 'Washington',
  'لوس أنجلوس': 'Los Angeles',
  'شيكاغو': 'Chicago',
  'هيوستن': 'Houston',
  'كندا': 'Canada',
  'أوتاوا': 'Ottawa',
  'تورونتو': 'Toronto',
  'مونتريال': 'Montreal',
  'فانكوفر': 'Vancouver',
  'أستراليا': 'Australia',
  'كانبرا': 'Canberra',
  'سيدني': 'Sydney',
  'ملبورن': 'Melbourne',
  'نيوزيلندا': 'New Zealand',
  'باكستان': 'Pakistan',
  'إسلام آباد': 'Islamabad',
  'كراتشي': 'Karachi',
  'لاهور': 'Lahore',
  'الهند': 'India',
  'نيودلهي': 'New Delhi',
  'مومباي': 'Mumbai',
  'إندونيسيا': 'Indonesia',
  'جاكرتا': 'Jakarta',
  'ماليزيا': 'Malaysia',
  'كوالالمبور': 'Kuala Lumpur',
  'بنغلاديش': 'Bangladesh',
  'دكا': 'Dhaka',
  'الصين': 'China',
  'بكين': 'Beijing',
  'اليابان': 'Japan',
  'طوكيو': 'Tokyo',
  'كوريا الجنوبية': 'South Korea',
  'سيول': 'Seoul',
  'البرازيل': 'Brazil',
  'برازيليا': 'Brasilia',
  'جنوب أفريقيا': 'South Africa',
  'نيجيريا': 'Nigeria',
  'أبوجا': 'Abuja'
};

// Automatic reverse dictionary generator (English -> Arabic)
export const LOCATION_TRANSLATIONS_EN_TO_AR: Record<string, string> = {};

// Populate inverted map with exact and case-insensitive keys
Object.entries(LOCATION_TRANSLATIONS).forEach(([ar, en]) => {
  const cleanEn = en.trim().toLowerCase();
  if (!LOCATION_TRANSLATIONS_EN_TO_AR[cleanEn]) {
    LOCATION_TRANSLATIONS_EN_TO_AR[cleanEn] = ar;
  }
  // Store exact case too
  if (!LOCATION_TRANSLATIONS_EN_TO_AR[en.trim()]) {
    LOCATION_TRANSLATIONS_EN_TO_AR[en.trim()] = ar;
  }
});

// Explicit overrides and common aliases for English -> Arabic (Governorates, Cities, Prefixes)
const EXPLICIT_EN_TO_AR: Record<string, string> = {
  // Countries
  'saudi arabia': 'المملكة العربية السعودية',
  'ksa': 'المملكة العربية السعودية',
  'kingdom of saudi arabia': 'المملكة العربية السعودية',
  'egypt': 'جمهورية مصر العربية',
  'arab republic of egypt': 'جمهورية مصر العربية',
  'united arab emirates': 'الإمارات العربية المتحدة',
  'uae': 'الإمارات العربية المتحدة',
  'kuwait': 'دولة الكويت',
  'qatar': 'دولة قطر',
  'bahrain': 'مملكة البحرين',
  'oman': 'سلطنة عمان',
  'jordan': 'المملكة الأردنية الهاشمية',
  'palestine': 'دولة فلسطين',
  'iraq': 'جمهورية العراق',
  'yemen': 'الجمهورية اليمنية',
  'syria': 'الجمهورية العربية السورية',
  'lebanon': 'الجمهورية اللبنانية',
  'sudan': 'جمهورية السودان',
  'libya': 'دولة ليبيا',
  'tunisia': 'الجمهورية التونسية',
  'algeria': 'الجمهورية الجزائرية الديمقراطية الشعبية',
  'morocco': 'المملكة المغربية',
  'mauritania': 'الجمهورية الإسلامية الموريتانية',
  'somalia': 'جمهورية الصومال الفيدرالية',
  'djibouti': 'جمهورية جيبوتي',
  'united kingdom': 'المملكة المتحدة',
  'uk': 'المملكة المتحدة',
  'britain': 'بريطانيا',
  'united states': 'الولايات المتحدة الأمريكية',
  'usa': 'الولايات المتحدة الأمريكية',
  'us': 'الولايات المتحدة الأمريكية',
  'turkey': 'تركيا',

  // Egyptian Governorates (All 27 in all Romanized and English forms)
  'gharbia': 'محافظة الغربية',
  'gharbiah': 'محافظة الغربية',
  'gharbiyah': 'محافظة الغربية',
  'gharbiyya': 'محافظة الغربية',
  'gharbeia': 'محافظة الغربية',
  'al gharbia': 'محافظة الغربية',
  'el gharbia': 'محافظة الغربية',
  'al gharbiyah': 'محافظة الغربية',
  'el gharbiyah': 'محافظة الغربية',
  'gharbia governorate': 'محافظة الغربية',
  'gharbiyah governorate': 'محافظة الغربية',
  'muhafazat al gharbiyah': 'محافظة الغربية',
  'muhafazat gharbia': 'محافظة الغربية',
  'tanta': 'طنطا',
  'tanta city': 'طنطا',
  'qism thani tanta': 'قسم ثان طنطا',
  'qism awwal tanta': 'قسم أول طنطا',
  'markaz tanta': 'مركز طنطا',
  'al mahalla al kubra': 'المحلة الكبرى',
  'el mahalla el kubra': 'المحلة الكبرى',
  'mahalla': 'المحلة الكبرى',
  'kafr el zayat': 'كفر الزيات',
  'kafr al zayat': 'كفر الزيات',
  'kafr el-zayat': 'كفر الزيات',
  'zefta': 'زفتى',
  'zifta': 'زفتى',
  'el santa': 'السنطة',
  'al santa': 'السنطة',
  'samanoud': 'سمنود',
  'samanud': 'سمنود',
  'basyoun': 'بسيون',
  'basyun': 'بسيون',
  'qutur': 'قطور',
  'kotour': 'قطور',
  'sibirbay': 'سبرباي',
  'seberbay': 'سبرباي',
  'lbib': 'لبيب',
  'lebib': 'لبيب',
  'ezbet lbib': 'عزبة لبيب',
  'ezbet lebib': 'عزبة لبيب',

  // Cairo & Giza
  'cairo': 'القاهرة',
  'al qahirah': 'القاهرة',
  'el qahera': 'القاهرة',
  'cairo governorate': 'محافظة القاهرة',
  'muhafazat al qahirah': 'محافظة القاهرة',
  'giza': 'الجيزة',
  'al jizah': 'الجيزة',
  'el giza': 'الجيزة',
  'giza governorate': 'محافظة الجيزة',
  'muhafazat al jizah': 'محافظة الجيزة',
  'nasr city': 'مدينة نصر',
  'maadi': 'المعادي',
  'heliopolis': 'مصر الجديدة',
  'new cairo': 'القاهرة الجديدة',
  '6th of october': 'السادس من أكتوبر',
  'sheikh zayed': 'الشيخ زايد',

  // Alexandria & Coast
  'alexandria': 'الإسكندرية',
  'al iskandariyah': 'الإسكندرية',
  'alexandria governorate': 'محافظة الإسكندرية',
  'muhafazat al iskandariyah': 'محافظة الإسكندرية',
  'borg el arab': 'برج العرب',
  'matrouh': 'محافظة مطروح',
  'matruh': 'محافظة مطروح',
  'marsa matruh': 'مرسى مطروح',
  'matrouh governorate': 'محافظة مطروح',
  'muhafazat matruh': 'محافظة مطروح',

  // Delta Governorates
  'dakahlia': 'محافظة الدقهلية',
  'daqahlia': 'محافظة الدقهلية',
  'daqahliyah': 'محافظة الدقهلية',
  'dakahlia governorate': 'محافظة الدقهلية',
  'ad daqahliyah': 'محافظة الدقهلية',
  'muhafazat ad daqahliyah': 'محافظة الدقهلية',
  'mansoura': 'المنصورة',
  'al mansurah': 'المنصورة',
  'sharqia': 'محافظة الشرقية',
  'sharqiyah': 'محافظة الشرقية',
  'sharqia governorate': 'محافظة الشرقية',
  'ash sharqiyah': 'محافظة الشرقية',
  'muhafazat ash sharqiyah': 'محافظة الشرقية',
  'zagazig': 'الزقازيق',
  'az zaqaziq': 'الزقازيق',
  '10th of ramadan': 'العاشر من رمضان',
  'monufia': 'محافظة المنوفية',
  'menofia': 'محافظة المنوفية',
  'menoufia': 'محافظة المنوفية',
  'monufiyah': 'محافظة المنوفية',
  'monufia governorate': 'محافظة المنوفية',
  'muhafazat al minufiyah': 'محافظة المنوفية',
  'shibin el kom': 'شبين الكوم',
  'shebin el kom': 'شبين الكوم',
  'qalyubia': 'محافظة القليوبية',
  'qalyubiyah': 'محافظة القليوبية',
  'qalyubia governorate': 'محافظة القليوبية',
  'al qalyubiyah': 'محافظة القليوبية',
  'muhafazat al qalyubiyah': 'محافظة القليوبية',
  'banha': 'بنها',
  'benha': 'بنها',
  'shubra el-kheima': 'شبرا الخيمة',
  'beheira': 'محافظة البحيرة',
  'el beheira': 'محافظة البحيرة',
  'al buhayrah': 'محافظة البحيرة',
  'beheira governorate': 'محافظة البحيرة',
  'muhafazat al buhayrah': 'محافظة البحيرة',
  'damanhour': 'دمنهور',
  'kafr el sheikh': 'محافظة كفر الشيخ',
  'kafr el-sheikh': 'محافظة كفر الشيخ',
  'kafr ash shaykh': 'محافظة كفر الشيخ',
  'kafr el sheikh governorate': 'محافظة كفر الشيخ',
  'muhafazat kafr ash shaykh': 'محافظة كفر الشيخ',
  'damietta': 'محافظة دمياط',
  'dumyat': 'محافظة دمياط',
  'damietta governorate': 'محافظة دمياط',
  'muhafazat dumyat': 'محافظة دمياط',
  'ras el bar': 'رأس البر',

  // Canal & Sinai
  'port said': 'محافظة بورسعيد',
  'bur said': 'محافظة بورسعيد',
  'port said governorate': 'محافظة بورسعيد',
  'muhafazat bur said': 'محافظة بورسعيد',
  'port fouad': 'بورفؤاد',
  'suez': 'محافظة السويس',
  'as suways': 'محافظة السويس',
  'suez governorate': 'محافظة السويس',
  'muhafazat as suways': 'محافظة السويس',
  'ismailia': 'محافظة الإسماعيلية',
  'al ismailiyah': 'محافظة الإسماعيلية',
  'ismailia governorate': 'محافظة الإسماعيلية',
  'muhafazat al ismailiyah': 'محافظة الإسماعيلية',
  'south sinai': 'محافظة جنوب سيناء',
  'south sinai governorate': 'محافظة جنوب سيناء',
  'janub sina': 'محافظة جنوب سيناء',
  'muhafazat janub sina': 'محافظة جنوب سيناء',
  'sharm el sheikh': 'شرم الشيخ',
  'dahab': 'دهب',
  'north sinai': 'محافظة شمال سيناء',
  'north sinai governorate': 'محافظة شمال سيناء',
  'shamal sina': 'محافظة شمال سيناء',
  'muhafazat shamal sina': 'محافظة شمال سيناء',
  'al arish': 'العريش',
  'el arish': 'العريش',

  // Upper Egypt & Red Sea
  'fayoum': 'محافظة الفيوم',
  'faiyum': 'محافظة الفيوم',
  'fayoum governorate': 'محافظة الفيوم',
  'muhafazat al fayyum': 'محافظة الفيوم',
  'beni suef': 'محافظة بني سويف',
  'beni suef governorate': 'محافظة بني سويف',
  'muhafazat bani suwayf': 'محافظة بني سويف',
  'minya': 'محافظة المنيا',
  'minya governorate': 'محافظة المنيا',
  'muhafazat al minya': 'محافظة المنيا',
  'asyut': 'محافظة أسيوط',
  'assiut': 'محافظة أسيوط',
  'asyut governorate': 'محافظة أسيوط',
  'muhafazat asyut': 'محافظة أسيوط',
  'sohag': 'محافظة سوهاج',
  'sohag governorate': 'محافظة سوهاج',
  'muhafazat sawhaj': 'محافظة سوهاج',
  'qena': 'محافظة قنا',
  'qena governorate': 'محافظة قنا',
  'muhafazat qina': 'محافظة قنا',
  'luxor': 'محافظة الأقصر',
  'luxor governorate': 'محافظة الأقصر',
  'muhafazat al uqsur': 'محافظة الأقصر',
  'aswan': 'محافظة أسوان',
  'aswan governorate': 'محافظة أسوان',
  'muhafazat aswan': 'محافظة أسوان',
  'red sea': 'محافظة البحر الأحمر',
  'red sea governorate': 'محافظة البحر الأحمر',
  'muhafazat al bahr al ahmar': 'محافظة البحر الأحمر',
  'hurghada': 'الغردقة',
  'new valley': 'محافظة الوادي الجديد',
  'new valley governorate': 'محافظة الوادي الجديد',
  'muhafazat al wadi al jadid': 'محافظة الوادي الجديد',

  // Saudi Arabia
  'eastern province': 'المنطقة الشرقية',
  'eastern region': 'المنطقة الشرقية',
  'dammam': 'الدمام',
  'dhahran': 'الظهران',
  'khobar': 'الخبر',
  'al khobar': 'الخبر',
  'al-khobar': 'الخبر',
  'jubail': 'الجبيل',
  'al-ahsa': 'الأحساء',
  'al ahsa': 'الأحساء',
  'al-hofuf': 'الهفوف',
  'al hofuf': 'الهفوف',
  'al-qatif': 'القطيف',
  'al qatif': 'القطيف',
  'hafar al-batin': 'حفر الباطن',
  'riyadh': 'الرياض',
  'riyadh city': 'مدينة الرياض',
  'riyadh region': 'منطقة الرياض',
  'makkah': 'مكة المكرمة',
  'mecca': 'مكة المكرمة',
  'makkah region': 'منطقة مكة المكرمة',
  'madinah': 'المدينة المنورة',
  'medina': 'المدينة المنورة',
  'madinah region': 'منطقة المدينة المنورة',
  'jeddah': 'جدة',
  'taif': 'الطائف',
  'qassim': 'القصيم',
  'al-qassim': 'القصيم',
  'qassim region': 'منطقة القصيم',
  'buraidah': 'بريدة',
  'unaizah': 'عنيزة',
  'tabuk': 'تبوك',
  'tabuk region': 'منطقة تبوك',
  'hail': 'حائل',
  'hail region': 'منطقة حائل',
  'asir': 'عسير',
  'asir region': 'منطقة عسير',
  'abha': 'أبها',
  'khamis mushait': 'خميس مشيط',
  'jazan': 'جازان',
  'jizan': 'جازان',
  'jazan region': 'منطقة جازان',
  'najran': 'نجران',
  'najran region': 'منطقة نجران',
  'al-baha': 'الباحة',
  'al-baha region': 'منطقة الباحة',
  'al-jawf': 'الجوف',
  'al-jawf region': 'منطقة الجوف',
  'northern borders': 'الحدود الشمالية',
  'northern borders region': 'منطقة الحدود الشمالية',
  'yanbu': 'ينبع',

  // Arab Gulf & Levant
  'dubai': 'دبي',
  'abu dhabi': 'أبو ظبي',
  'sharjah': 'الشارقة',
  'ajman': 'عجمان',
  'ras al khaimah': 'رأس الخيمة',
  'fujairah': 'الفجيرة',
  'doha': 'الدوحة',
  'kuwait city': 'مدينة الكويت',
  'manama': 'المنامة',
  'muscat': 'مسقط',
  'amman': 'عمّان',
  'jerusalem': 'القدس الشريف',
  'al quds': 'القدس الشريف',
  'gaza': 'غزة',
  'ramallah': 'رام الله',
  'baghdad': 'بغداد',
  'erbil': 'أربيل',
  'basra': 'البصرة',
  'damascus': 'دمشق',
  'aleppo': 'حلب',
  'beirut': 'بيروت',
  'tripoli': 'طرابلس',
  'sanaa': 'صنعاء',
  'aden': 'عدن',
  'khartoum': 'الخرطوم',
  'tunis': 'تونس',
  'algiers': 'الجزائر',
  'rabat': 'الرباط',
  'casablanca': 'الدار البيضاء',
  'nouakchott': 'نواكشوط',
  'mogadishu': 'مقديشو',

  // System & Fallbacks
  'current location': 'موقعي الحالي',
  'my location': 'موقعي الحالي',
  'unknown location': 'موقع غير معروف'
};

Object.entries(EXPLICIT_EN_TO_AR).forEach(([k, v]) => {
  LOCATION_TRANSLATIONS_EN_TO_AR[k.toLowerCase().trim()] = v;
});

// Helper to strip standard Latin accents and Arabic Romanization diacritics
export const stripLatinDiacritics = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[āáàâäǎãå]/gi, 'a')
    .replace(/[ēéèêëěẽ]/gi, 'e')
    .replace(/[īíìîïǐĩ]/gi, 'i')
    .replace(/[ōóòôöǒõ]/gi, 'o')
    .replace(/[ūúùûüǔũ]/gi, 'u')
    .replace(/[ḥ]/gi, 'h')
    .replace(/[ḍ]/gi, 'd')
    .replace(/[ṭ]/gi, 't')
    .replace(/[ẓ]/gi, 'z')
    .replace(/[ṣ]/gi, 's')
    .replace(/[ḏ]/gi, 'dh')
    .replace(/[ṯ]/gi, 'th')
    .replace(/[ġ]/gi, 'gh')
    .replace(/[ḫ]/gi, 'kh')
    .replace(/[š]/gi, 'sh')
    .replace(/[̧]/g, '')
    .replace(/[‘'’`]/g, '');
};

// Helper to normalize Arabic text for resilient dictionary lookup
const normalizeArForMatch = (text: string): string => {
  return text
    .trim()
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة\b/g, 'ه')
    .replace(/ى\b/g, 'ي')
    .toLowerCase();
};

// Phonetic fallback: Transliterates remaining Latin letters to Arabic
export const transliterateLatinToAr = (str: string): string => {
  if (!str) return '';
  let s = stripLatinDiacritics(str.trim().toLowerCase());
  
  // Replace digraphs first
  const digraphs: [RegExp, string][] = [
    [/sh/g, 'ش'],
    [/ch/g, 'تش'],
    [/th/g, 'ث'],
    [/kh/g, 'خ'],
    [/gh/g, 'غ'],
    [/dh/g, 'ذ'],
    [/ph/g, 'ف'],
    [/ou/g, 'و'],
    [/ee/g, 'ي'],
    [/oo/g, 'و'],
    [/aa/g, 'ا']
  ];
  for (const [re, rep] of digraphs) {
    s = s.replace(re, rep);
  }

  // Replace single characters
  const charMap: Record<string, string> = {
    'a': 'ا', 'b': 'ب', 'c': 'ك', 'd': 'د', 'e': 'ي', 'f': 'ف',
    'g': 'ج', 'h': 'ه', 'i': 'ي', 'j': 'ج', 'k': 'ك', 'l': 'ل',
    'm': 'م', 'n': 'ن', 'o': 'و', 'p': 'ب', 'q': 'ق', 'r': 'ر',
    's': 'س', 't': 'ت', 'u': 'و', 'v': 'ف', 'w': 'و', 'x': 'كس',
    'y': 'ي', 'z': 'ز'
  };

  let out = '';
  for (const char of s) {
    if (charMap[char]) {
      out += charMap[char];
    } else {
      out += char;
    }
  }

  // Clean double identical Arabic letters from transliteration (e.g. يي -> ي)
  out = out.replace(/(.)\1+/g, '$1');
  return out;
};

// Phonetic fallback: Transliterates remaining Arabic letters to English
export const transliterateArToEn = (str: string): string => {
  if (!str) return '';
  const arMap: Record<string, string> = {
    'ا': 'A', 'أ': 'A', 'إ': 'I', 'آ': 'Aa', 'ب': 'B', 'ت': 'T', 'ث': 'Th',
    'ج': 'J', 'ح': 'H', 'خ': 'Kh', 'د': 'D', 'ذ': 'Dh', 'ر': 'R', 'ز': 'Z',
    'س': 'S', 'ش': 'Sh', 'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': 'A',
    'غ': 'Gh', 'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
    'ه': 'H', 'و': 'W', 'ي': 'Y', 'ى': 'A', 'ة': 'ah', 'ء': '', 'ئ': 'Y', 'ؤ': 'W'
  };

  let out = '';
  for (const char of str.trim()) {
    if (arMap[char]) {
      out += arMap[char];
    } else if (/[0-9\s\-\,\.]/.test(char)) {
      out += char;
    }
  }
  return out.replace(/\b\w/g, l => l.toUpperCase()).trim();
};

// Translate a single location token to English
const translateSingleTokenToEn = (token: string): string => {
  const clean = token.trim();
  if (!clean) return '';

  // 1. If it's Romanized Arabic with diacritics (e.g. "Muḥāfaz̧at al Gharbīyah"):
  // First normalize and check if it maps to an Arabic entity, then to English!
  const stripped = stripLatinDiacritics(clean).toLowerCase().trim();
  if (LOCATION_TRANSLATIONS_EN_TO_AR[stripped]) {
    const arEntity = LOCATION_TRANSLATIONS_EN_TO_AR[stripped];
    if (LOCATION_TRANSLATIONS[arEntity]) {
      return LOCATION_TRANSLATIONS[arEntity];
    }
  }

  // 2. Direct lookup in Arabic -> English map
  if (LOCATION_TRANSLATIONS[clean]) return LOCATION_TRANSLATIONS[clean];

  // 3. Normalized Arabic matching
  const normAr = normalizeArForMatch(clean);
  for (const [k, v] of Object.entries(LOCATION_TRANSLATIONS)) {
    if (normalizeArForMatch(k) === normAr) return v;
  }

  // 4. Handle common Arabic administrative prefixes
  const prefixes = [
    { ar: 'محافظة ', enSuffix: ' Governorate' },
    { ar: 'منطقة ', enSuffix: ' Region' },
    { ar: 'مدينة ', enSuffix: ' City' },
    { ar: 'إمارة ', enSuffix: ' Emirate' },
    { ar: 'ولاية ', enSuffix: ' State' },
    { ar: 'حي ', enSuffix: ' District' },
    { ar: 'بلدية ', enSuffix: ' Municipality' },
    { ar: 'مركز ', enSuffix: ' Center' },
    { ar: 'قسم ', enSuffix: ' District' },
    { ar: 'أمانة ', enSuffix: '' }
  ];

  for (const p of prefixes) {
    if (clean.startsWith(p.ar)) {
      const core = clean.slice(p.ar.length).trim();
      const normCore = normalizeArForMatch(core);
      for (const [k, v] of Object.entries(LOCATION_TRANSLATIONS)) {
        if (normalizeArForMatch(k) === normCore) {
          if (v.includes('Province') || v.includes('Region') || v.includes('Governorate')) {
            return v;
          }
          return `${v}${p.enSuffix}`;
        }
      }
    }
  }

  // 5. If it's already pure English/Latin without Arabic, clean up diacritics and return capitalized
  if (/^[a-zA-Z\s0-9\-\.\,\'\(\)]+$/.test(stripped)) {
    // If it started with "muhafazat ...", format nicely e.g. "Gharbia Governorate"
    if (/^muhafazat\s+/i.test(stripped)) {
      const core = stripped.replace(/^muhafazat\s+(al\s+|el\s+)?/i, '').trim();
      const arEntity = LOCATION_TRANSLATIONS_EN_TO_AR[core];
      if (arEntity && LOCATION_TRANSLATIONS[arEntity]) {
        return LOCATION_TRANSLATIONS[arEntity];
      }
      return `${core.charAt(0).toUpperCase() + core.slice(1)} Governorate`;
    }
    // Capitalize words
    return stripped.replace(/\b\w/g, l => l.toUpperCase());
  }

  // 6. If it still contains Arabic letters, transliterate to English phonetics
  if (/[\u0600-\u06FF]/.test(clean)) {
    return transliterateArToEn(clean);
  }

  return clean;
};

// Translate a single location token to Arabic
const translateSingleTokenToAr = (token: string): string => {
  const clean = token.trim();
  if (!clean) return '';

  // 1. If it's already pure Arabic, return as-is
  if (/^[\u0600-\u06FF\s0-9\-\.\,\(\)]+$/.test(clean)) {
    return clean;
  }

  // 2. Normalize Latin diacritics and casing
  const normalized = stripLatinDiacritics(clean).toLowerCase().trim();

  // 3. Direct lookup in inverted dictionary
  if (LOCATION_TRANSLATIONS_EN_TO_AR[normalized]) {
    return LOCATION_TRANSLATIONS_EN_TO_AR[normalized];
  }

  // 4. Try without articles: al-, el-, ad-, as-, ash-, at-, az-, ar-, an-
  let strippedArticle = normalized;
  const articleRegex = /^(al|el|ad|as|ash|at|az|ar|an)[\s\-]+/i;
  if (articleRegex.test(strippedArticle)) {
    strippedArticle = strippedArticle.replace(articleRegex, '').trim();
    if (LOCATION_TRANSLATIONS_EN_TO_AR[strippedArticle]) {
      return LOCATION_TRANSLATIONS_EN_TO_AR[strippedArticle];
    }
  }

  // 5. Handle Romanized Arabic / English administrative prefixes:
  // e.g. "muhafazat al gharbiyah", "muhafazah of cairo", "region of riyadh"
  const adminPrefixes = [
    { prefix: /^(muhafazat|muhafazah|muhafazet|governorate of)\s+/i, arPrefix: 'محافظة ' },
    { prefix: /^(mintaqat|mintaqah|region of|province of)\s+/i, arPrefix: 'منطقة ' },
    { prefix: /^(wilayat|wilayah|state of)\s+/i, arPrefix: 'ولاية ' },
    { prefix: /^(imarat|imarah|emirate of)\s+/i, arPrefix: 'إمارة ' },
    { prefix: /^(madinat|madinah|city of)\s+/i, arPrefix: 'مدينة ' },
    { prefix: /^(markaz|center of)\s+/i, arPrefix: 'مركز ' },
    { prefix: /^(qism|district of|hayy)\s+/i, arPrefix: 'حي ' }
  ];

  for (const item of adminPrefixes) {
    if (item.prefix.test(normalized)) {
      let core = normalized.replace(item.prefix, '').trim();
      if (articleRegex.test(core)) {
        core = core.replace(articleRegex, '').trim();
      }
      const trans = LOCATION_TRANSLATIONS_EN_TO_AR[core] || LOCATION_TRANSLATIONS_EN_TO_AR[`al ${core}`];
      if (trans) {
        if (trans.startsWith(item.arPrefix) || trans.startsWith('المنطقة ')) {
          return trans;
        }
        return `${item.arPrefix}${trans}`;
      }
    }
  }

  // 6. Handle English administrative suffixes:
  // e.g. "gharbiyah governorate", "eastern province", "riyadh region"
  const adminSuffixes = [
    { suffix: /\s+(governorate)$/i, arPrefix: 'محافظة ' },
    { suffix: /\s+(province|region)$/i, arPrefix: 'منطقة ' },
    { suffix: /\s+(city)$/i, arPrefix: 'مدينة ' },
    { suffix: /\s+(emirate)$/i, arPrefix: 'إمارة ' },
    { suffix: /\s+(district)$/i, arPrefix: 'حي ' },
    { suffix: /\s+(state)$/i, arPrefix: 'ولاية ' }
  ];

  for (const item of adminSuffixes) {
    if (item.suffix.test(normalized)) {
      let core = normalized.replace(item.suffix, '').trim();
      if (articleRegex.test(core)) {
        core = core.replace(articleRegex, '').trim();
      }
      const trans = LOCATION_TRANSLATIONS_EN_TO_AR[core] || LOCATION_TRANSLATIONS_EN_TO_AR[`al ${core}`];
      if (trans) {
        if (trans.startsWith(item.arPrefix) || trans.startsWith('المنطقة ')) {
          return trans;
        }
        return `${item.arPrefix}${trans}`;
      }
    }
  }

  // 7. Check if word contains any remaining Latin letters - Phonetic Transliteration fallback
  if (/[a-zA-Z]/.test(clean)) {
    return transliterateLatinToAr(clean);
  }

  return clean;
};

/**
 * Universal Bidirectional Location Localizer.
 * Accurately translates any city, governorate/region, and country name:
 * - If language is 'ar', ensures output is in clean Arabic with 0% foreign Latin characters.
 * - If language is 'en', ensures output is in clean English with 0% Arabic characters.
 */
export function getLocalizedLocationName(text: string, language: Language = 'ar'): string {
  if (!text || !text.trim()) {
    return language === 'en' ? 'Current Location' : 'موقعي الحالي';
  }

  const raw = text.trim();

  // Normalize delimiters to standard ' - '
  const normalizedDelimiters = raw
    .replace(/\s*[,،\/–—]\s*/g, ' - ')
    .replace(/\s+-\s+/g, ' - ')
    .replace(/ - - /g, ' - ')
    .trim();

  // Check if string contains multiple segments (e.g. City - Province)
  if (normalizedDelimiters.includes(' - ')) {
    const rawParts = normalizedDelimiters.split(' - ').map(p => p.trim()).filter(Boolean);
    
    const translatedParts = rawParts.map(part => {
      return language === 'en'
        ? translateSingleTokenToEn(part)
        : translateSingleTokenToAr(part);
    });

    // Remove duplicates
    let uniqueParts: string[] = [];
    for (const part of translatedParts) {
      if (!uniqueParts.includes(part) && part) {
        uniqueParts.push(part);
      }
    }

    // Smart cleanup for 3+ parts when a major city and governorate are present:
    // e.g. ["طنطا", "لبيب", "محافظة الغربية"] -> simplify to "طنطا - محافظة الغربية" for clean top bar display
    if (uniqueParts.length >= 3) {
      const govIdx = uniqueParts.findIndex(p => 
        p.includes('محافظة') || p.includes('منطقة') || p.includes('Governorate') || p.includes('Province') || p.includes('Region')
      );
      if (govIdx !== -1) {
        const gov = uniqueParts[govIdx];
        const nonGov = uniqueParts.filter((_, idx) => idx !== govIdx);
        uniqueParts = [nonGov[0], gov];
      }
    }

    return uniqueParts.join(' - ');
  }

  // Single entity (e.g. country name or single city name)
  return language === 'en'
    ? translateSingleTokenToEn(normalizedDelimiters)
    : translateSingleTokenToAr(normalizedDelimiters);
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
  iqama: { ar: 'الإقامة', en: 'Iqama' },
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
  notificationToneLabel: { ar: 'نغمة الإشعارات', en: 'Notification Tone' },
  changeTone: { ar: 'تغيير', en: 'Change' },
  currentToneFile: { ar: 'الملف الحالي:', en: 'Current file:' },
  selectToneModalTitle: { ar: 'اختر نغمة التنبيه', en: 'Select Alert Tone' },
  selectNotificationToneModalTitle: { ar: 'اختر نغمة الإشعارات', en: 'Select Notification Tone' },
  selectToneFromDevice: { ar: 'اختيار نغمة', en: 'Select tone' },
  noSound: { ar: 'بدون صوت', en: 'Silent' },
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
  createdAppAttribution: { ar: 'مصحف أحمد و ليلى', en: 'Mushaf Ahmed & Laila' },
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

