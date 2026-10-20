import recitersMapData from '../data/recitersEnglishMap.json';
import quranMeta from '../data/quran-metadata.json';
import { SURAH_LIST } from '../data/listenQuranData';

export type Language = 'ar' | 'en';

const recitersEnglishMap: Record<string, string> = recitersMapData as Record<string, string>;

// Map surah number (1-114) to English name and translation
const SURAH_ENGLISH_MAP: Record<number, { name: string; englishName: string; translation: string }> = {};

if (quranMeta && Array.isArray((quranMeta as any).surahs)) {
  (quranMeta as any).surahs.forEach((s: any) => {
    SURAH_ENGLISH_MAP[s.number] = {
      name: s.name,
      englishName: s.englishName || `Surah ${s.number}`,
      translation: s.englishNameTranslation || ''
    };
  });
}

// Fallback names if metadata is missing any
const SURAH_NAME_FALLBACKS: Record<number, string> = {
  1: "Al-Faatiha", 2: "Al-Baqara", 3: "Aal-i-Imraan", 4: "An-Nisaa", 5: "Al-Maaida",
  6: "Al-An'aam", 7: "Al-A'raaf", 8: "Al-Anfaal", 9: "At-Tawba", 10: "Yunus",
  11: "Hud", 12: "Yusuf", 13: "Ar-Ra'd", 14: "Ibrahim", 15: "Al-Hijr",
  16: "An-Nahl", 17: "Al-Israa", 18: "Al-Kahf", 19: "Maryam", 20: "Taa-Haa",
  21: "Al-Anbiyaa", 22: "Al-Hajj", 23: "Al-Muminoon", 24: "An-Noor", 25: "Al-Furqaan",
  26: "Ash-Shu'araa", 27: "An-Naml", 28: "Al-Qasas", 29: "Al-Ankaboot", 30: "Ar-Room",
  31: "Luqman", 32: "As-Sajda", 33: "Al-Ahzaab", 34: "Saba", 35: "Faatir",
  36: "Yaseen", 37: "As-Saaffaat", 38: "Saad", 39: "Az-Zumar", 40: "Ghafir",
  41: "Fussilat", 42: "Ash-Shura", 43: "Az-Zukhruf", 44: "Ad-Dukhaan", 45: "Al-Jaathiya",
  46: "Al-Ahqaf", 47: "Muhammad", 48: "Al-Fath", 49: "Al-Hujuraat", 50: "Qaaf",
  51: "Adh-Dhaariyaat", 52: "At-Toor", 53: "An-Najm", 54: "Al-Qamar", 55: "Ar-Rahmaan",
  56: "Al-Waaqia", 57: "Al-Hadid", 58: "Al-Mujaadila", 59: "Al-Hashr", 60: "Al-Mumtahana",
  61: "As-Saff", 62: "Al-Jumu'a", 63: "Al-Munaafiqoon", 64: "At-Taghaabun", 65: "At-Talaaq",
  66: "At-Tahrim", 67: "Al-Mulk", 68: "Al-Qalam", 69: "Al-Haaqqa", 70: "Al-Ma'aarij",
  71: "Nooh", 72: "Al-Jinn", 73: "Al-Muzzammil", 74: "Al-Muddaththir", 75: "Al-Qiyaama",
  76: "Al-Insaan", 77: "Al-Mursalaat", 78: "An-Naba", 79: "An-Naazi'aat", 80: "Abasa",
  81: "At-Takwir", 82: "Al-Infitaar", 83: "Al-Mutaffifin", 84: "Al-Inshiqaaq", 85: "Al-Burooj",
  86: "At-Taariq", 87: "Al-A'laa", 88: "Al-Ghaashiya", 89: "Al-Fajr", 90: "Al-Balad",
  91: "Ash-Shams", 92: "Al-Lail", 93: "Ad-Dhuhaa", 94: "Ash-Sharh", 95: "At-Teen",
  96: "Al-Alaq", 97: "Al-Qadr", 98: "Al-Bayyina", 99: "Az-Zalzala", 100: "Al-Aadiyaat",
  101: "Al-Qaari'a", 102: "At-Takaathur", 103: "Al-Asr", 104: "Al-Humaza", 105: "Al-Fil",
  106: "Quraish", 107: "Al-Maa'oon", 108: "Al-Kawthar", 109: "Al-Kaafiroon", 110: "An-Nasr",
  111: "Al-Masad", 112: "Al-Ikhlaas", 113: "Al-Falaq", 114: "An-Naas"
};

/**
 * Returns the localized surah name for display
 * Supports:
 * - getSurahDisplayName(num, 'ar' | 'en')
 * - getSurahDisplayName(num, arabicFallback, 'ar' | 'en')
 * - getSurahDisplayName(num, 'ar' | 'en', arabicFallback)
 */
export function getSurahDisplayName(surahNumber: number, arg2?: any, arg3?: any): string {
  let lang: Language = 'ar';
  let fallback = '';

  if (arg2 === 'ar' || arg2 === 'en') {
    lang = arg2;
    if (typeof arg3 === 'string') fallback = arg3;
  } else if (typeof arg2 === 'string') {
    fallback = arg2;
    if (arg3 === 'ar' || arg3 === 'en') lang = arg3;
  }

  if (lang === 'en') {
    return SURAH_ENGLISH_MAP[surahNumber]?.englishName || SURAH_NAME_FALLBACKS[surahNumber] || fallback || `Surah ${surahNumber}`;
  }
  const arabic = SURAH_LIST.find(s => s.number === surahNumber)?.name;
  return fallback || arabic || SURAH_ENGLISH_MAP[surahNumber]?.name || `سورة ${surahNumber}`;
}

/**
 * Returns the localized reciter name for display
 * Supports:
 * - getReciterDisplayName(idOrName, 'ar' | 'en')
 * - getReciterDisplayName(id, arabicName, 'ar' | 'en')
 * - getReciterDisplayName(id, 'ar' | 'en', arabicName)
 */
const QURAN_READER_EN_MAP: Record<string, string> = {
  'ابراهيم والك En': 'Ibrahim Walk En',
  'إبراهيم والك En': 'Ibrahim Walk En',
  'إبراهيم والك (ترجمة إنجليزية - صحيح إنترناشونال)': 'Ibrahim Walk En',
  'English/Sahih_Intnl_Ibrahim_Walk_192kbps': 'Ibrahim Walk En',
  'عبدالله بصفر وابراهيم والك En': 'Abdullah Basfar & Ibrahim Walk En',
  'عبدالله بصفر وإبراهيم والك En': 'Abdullah Basfar & Ibrahim Walk En',
  'عبدالله بصفر وإبراهيم والك (تلاوة وترجمة إنجليزية)': 'Abdullah Basfar & Ibrahim Walk En',
  'MultiLanguage/Basfar_Walk_192kbps': 'Abdullah Basfar & Ibrahim Walk En',
  'إبراهيم الأخضر': 'Ibrahim Al-Akhdar',
  'Ibrahim_Akhdar_32kbps': 'Ibrahim Al-Akhdar',
  'أبو بكر الشاطري': 'Abu Bakr Al-Shatri',
  'Abu_Bakr_Ash-Shaatree_128kbps': 'Abu Bakr Al-Shatri',
  'أحمد بن علي العجمي': 'Ahmad Al-Ajmy',
  'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net': 'Ahmad Al-Ajmy',
  'أحمد نعينع': 'Ahmed Neana',
  'Ahmed_Neana_128kbps': 'Ahmed Neana',
  'أكرم العلاقمي': 'Akram Al-Alaqmi',
  'Akram_AlAlaqimy_128kbps': 'Akram Al-Alaqmi',
  'أيمن سويد': 'Ayman Suwayd',
  'Ayman_Sowaid_64kbps': 'Ayman Suwayd',
  'خالد القحطاني': 'Khaled Al-Qahtani',
  'Khaalid_Abdullaah_al-Qahtaanee_192kbps': 'Khaled Al-Qahtani',
  'خليفة الطنيجي': 'Khalifa Al-Tunaiji',
  'khalefa_al_tunaiji_64kbps': 'Khalifa Al-Tunaiji',
  'سعد الغامدي': 'Saad Al-Ghamdi',
  'Ghamadi_40kbps': 'Saad Al-Ghamdi',
  'سعود الشريم': 'Saud Al-Shuraim',
  'Saood%20bin%20Ibraaheem%20Ash-Shuraym_128kbps': 'Saud Al-Shuraim',
  'سهل ياسين': 'Sahl Yassin',
  'Sahl_Yassin_128kbps': 'Sahl Yassin',
  'شهريار بارهيزجار': 'Shahriar Parhizgar',
  'Parhizgar_48kbps': 'Shahriar Parhizgar',
  'صلاح البدير': 'Salah Al-Budair',
  'Salah_Al_Budair_128kbps': 'Salah Al-Budair',
  'صلاح بو خاطر': 'Salah Bukhatir',
  'Salaah_AbdulRahman_Bukhatir_128kbps': 'Salah Bukhatir',
  'عبدالباسط عبدالصمد مجود': 'Abdul Basit Abdul Samad (Mujawwad)',
  'Abdul_Basit_Mujawwad_128kbps': 'Abdul Basit Abdul Samad (Mujawwad)',
  'عبدالباسط عبدالصمد مرتل': 'Abdul Basit Abdul Samad (Murattal)',
  'Abdul_Basit_Murattal_192kbps': 'Abdul Basit Abdul Samad (Murattal)',
  'عبدالرحمن السديس': 'Abdul Rahman Al-Sudais',
  'Abdurrahmaan_As-Sudais_192kbps': 'Abdul Rahman Al-Sudais',
  'عبدالله بصفر': 'Abdullah Basfar',
  'Abdullah_Basfar_192kbps': 'Abdullah Basfar',
  'عبدالله مطرود': 'Abdullah Matroud',
  'Abdullah_Matroud_128kbps': 'Abdullah Matroud',
  'عزيز عليلي': 'Aziz Alili',
  'aziz_alili_128kbps': 'Aziz Alili',
  'علي الحذيفي': 'Ali Al-Hudhaifi',
  'Hudhaify_128kbps': 'Ali Al-Hudhaifi',
  'علي جابر': 'Ali Jaber',
  'Ali_Jaber_64kbps': 'Ali Jaber',
  'علي حجاج السويسي': 'Ali Hajjaj Al-Suwaisi',
  'Ali_Hajjaj_AlSuesy_128kbps': 'Ali Hajjaj Al-Suwaisi',
  'فارس عباد': 'Fares Abbad',
  'Fares_Abbad_64kbps': 'Fares Abbad',
  'كريم منصوري': 'Karim Mansoori',
  'Karim_Mansoori_40kbps': 'Karim Mansoori',
  'ماهر المعيقلي': 'Maher Al-Muaiqly',
  'MaherAlMuaiqly128kbps': 'Maher Al-Muaiqly',
  'محسن القاسم': 'Muhsin Al-Qasim',
  'Muhsin_Al_Qasim_192kbps': 'Muhsin Al-Qasim',
  'محمد أيوب': 'Muhammad Ayyub',
  'Muhammad_Ayyoub_128kbps': 'Muhammad Ayyub',
  'محمد جبريل': 'Muhammad Jibreel',
  'Muhammad_Jibreel_128kbps': 'Muhammad Jibreel',
  'محمد صديق المنشاوي مجود': 'Mohamed Siddiq El-Minshawi (Mujawwad)',
  'Minshawy_Mujawwad_192kbps': 'Mohamed Siddiq El-Minshawi (Mujawwad)',
  'محمد صديق المنشاوي مرتل': 'Mohamed Siddiq El-Minshawi (Murattal)',
  'Minshawy_Murattal_128kbps': 'Mohamed Siddiq El-Minshawi (Murattal)',
  'محمد صديق المنشاوي معلم': 'Mohamed Siddiq El-Minshawi (Teacher)',
  'Minshawy_Teacher_128kbps': 'Mohamed Siddiq El-Minshawi (Teacher)',
  'محمد عبدالكريم': 'Muhammad Abdul Kareem',
  'Muhammad_AbdulKareem_128kbps': 'Muhammad Abdul Kareem',
  'محمود الطبلاوي': 'Mahmoud Al-Tablawi',
  'Mohammad_al_Tablaway_128kbps': 'Mahmoud Al-Tablawi',
  'محمود خليل الحصري': 'Mahmoud Khalil Al-Husary',
  'Husary_128kbps': 'Mahmoud Khalil Al-Husary',
  'محمود خليل الحصري مجود': 'Mahmoud Khalil Al-Husary (Mujawwad)',
  'Husary_128kbps_Mujawwad': 'Mahmoud Khalil Al-Husary (Mujawwad)',
  'محمود خليل الحصري معلم': 'Mahmoud Khalil Al-Husary (Teacher)',
  'Husary_Muallim_128kbps': 'Mahmoud Khalil Al-Husary (Teacher)',
  'محمود علي البنا': 'Mahmoud Ali Al-Banna',
  'mahmoud_ali_al_banna_32kbps': 'Mahmoud Ali Al-Banna',
  'مشاري العفاسي': 'Mishary Rashid Al-Afasy',
  'Alafasy_128kbps': 'Mishary Rashid Al-Afasy',
  'مصطفى إسماعيل': 'Mustafa Ismail',
  'Mustafa_Ismail_48kbps': 'Mustafa Ismail',
  'ناصر القطامي': 'Nasser Al-Qatami',
  'Nasser_Alqatami_128kbps': 'Nasser Al-Qatami',
  'نبيل الرفاعي': 'Nabil Al-Rifai',
  'Nabil_Rifa3i_48kbps': 'Nabil Al-Rifai',
  'هاني الرفاعي': 'Hani Al-Rifai',
  'Hani_Rifai_192kbps': 'Hani Al-Rifai',
  'ياسر الدوسري': 'Yasser Al-Dosari',
  'Yasser_Ad-Dussary_128kbps': 'Yasser Al-Dosari',
  'ياسر سلامة': 'Yasser Salama',
  'Yaser_Salamah_128kbps': 'Yasser Salama'
};

export function getReciterDisplayName(reciterIdOrName: string, arg2?: any, arg3?: any): string {
  if (!reciterIdOrName) return '';
  let lang: Language = 'ar';
  let fallbackName = '';

  if (arg2 === 'ar' || arg2 === 'en') {
    lang = arg2;
    if (typeof arg3 === 'string') fallbackName = arg3;
  } else if (typeof arg2 === 'string') {
    fallbackName = arg2;
    if (arg3 === 'ar' || arg3 === 'en') lang = arg3;
  }

  if (lang === 'en') {
    const cleanId = reciterIdOrName.replace(/\/+$/, '');
    if (QURAN_READER_EN_MAP[cleanId]) return QURAN_READER_EN_MAP[cleanId];
    if (QURAN_READER_EN_MAP[reciterIdOrName]) return QURAN_READER_EN_MAP[reciterIdOrName];
    if (fallbackName && QURAN_READER_EN_MAP[fallbackName]) return QURAN_READER_EN_MAP[fallbackName];
    const trimmed = reciterIdOrName.trim();
    if (QURAN_READER_EN_MAP[trimmed]) return QURAN_READER_EN_MAP[trimmed];
    if (recitersEnglishMap[cleanId]) return recitersEnglishMap[cleanId];
    if (recitersEnglishMap[reciterIdOrName]) return recitersEnglishMap[reciterIdOrName];
    if (fallbackName && recitersEnglishMap[fallbackName]) return recitersEnglishMap[fallbackName];
    if (recitersEnglishMap[trimmed]) return recitersEnglishMap[trimmed];
    return fallbackName || reciterIdOrName;
  }
  return fallbackName || reciterIdOrName;
}

/**
 * Converts numbers into Arabic numerals if language is 'ar', or keeps Latin numerals if 'en'
 */
export function formatListenNumber(num: number | string, language: Language = 'ar'): string {
  const str = String(num);
  if (language === 'en') {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d)));
  }
  return str.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

/**
 * Formats time in mm:ss according to language
 */
export function formatListenTime(seconds: number, language: Language = 'ar'): string {
  if (isNaN(seconds) || seconds < 0) {
    return formatListenNumber('00:00', language);
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formatted = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return formatListenNumber(formatted, language);
}

/**
 * Formats countdown in hh:mm:ss or mm:ss according to language
 */
export function formatListenTimerCountdown(totalSeconds: number, language: Language = 'ar'): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) {
    return formatListenNumber('00:00', language);
  }
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return formatListenNumber(formatted, language);
}

export const LISTEN_QURAN_STRINGS: Record<string, { ar: string; en: string }> = {
  // Page Top Bar
  pageTitle: {
    ar: 'الاستماع للقرآن',
    en: 'Listen to Qur\'an'
  },
  back: {
    ar: 'رجوع للخلف',
    en: 'Back'
  },
  home: {
    ar: 'الصفحة الرئيسية',
    en: 'Home'
  },
  addToFavorites: {
    ar: 'إضافة إلى المفضلة',
    en: 'Add to favorites'
  },
  removeFromFavorites: {
    ar: 'إزالة من المفضلة',
    en: 'Remove from favorites'
  },
  favorites: {
    ar: 'المفضلة',
    en: 'Favorites'
  },
  favoritesTitle: {
    ar: 'المفضلات المحفوظة',
    en: 'Saved Favorites'
  },
  emptyFavorites: {
    ar: 'لا توجد مفضلات محفوظة حتى الآن.<br />اختر قارئاً وسورة واضغط على أيقونة القلب بالأعلى لحفظها هنا لسهولة الرجوع إليها (حتى ١٠ مفضلات).',
    en: 'No saved favorites yet.<br />Select a reciter and a Surah, then tap the heart icon at the top to save them here for quick access (up to 10 favorites).'
  },
  unknown: {
    ar: 'غير معروف',
    en: 'Unknown'
  },
  unknownSurah: {
    ar: 'غير معروفة',
    en: 'Unknown Surah'
  },

  // Audio Controls
  previous: {
    ar: 'السابق',
    en: 'Previous'
  },
  next: {
    ar: 'التالى',
    en: 'Next'
  },
  repeatSurah: {
    ar: 'تكرار السورة',
    en: 'Repeat Surah'
  },
  repeatSurahActiveTooltip: {
    ar: 'تكرار السورة مفعل (اضغط للإلغاء)',
    en: 'Repeat Surah active (tap to cancel)'
  },
  repeatSurahInactiveTooltip: {
    ar: 'تفعيل تكرار نفس السورة بعد انتهائها',
    en: 'Enable repeat current Surah'
  },
  continuousPlay: {
    ar: 'تشغيل متواصل',
    en: 'Continuous Play'
  },
  continuousPlayActiveTooltip: {
    ar: 'التشغيل المتواصل مفعل (اضغط للإلغاء)',
    en: 'Continuous play active (tap to cancel)'
  },
  continuousPlayInactiveTooltip: {
    ar: 'تفعيل الانتقال للسورة التالية تلقائياً',
    en: 'Auto-play next Surah'
  },

  // Sleep Timer Card
  sleepTimer: {
    ar: 'مؤقت النوم',
    en: 'Sleep Timer'
  },
  timerOff: {
    ar: 'متوقف',
    en: 'Off'
  },
  endOfSurah: {
    ar: 'آخر السورة',
    en: 'End of Surah'
  },
  atEndOfSurah: {
    ar: 'عند آخر السورة',
    en: 'At End of Surah'
  },
  remaining: {
    ar: 'متبقي',
    en: 'Remaining'
  },
  cancel: {
    ar: 'إلغاء',
    en: 'Cancel'
  },
  cancelTimer: {
    ar: 'إلغاء المؤقت',
    en: 'Cancel Timer'
  },
  preset15: {
    ar: '١٥ دقيقة',
    en: '15 Min'
  },
  preset30: {
    ar: '٣٠ دقيقة',
    en: '30 Min'
  },
  preset60: {
    ar: '٦٠ دقيقة',
    en: '60 Min'
  },
  minShort: {
    ar: 'دقيقة',
    en: 'Min'
  },
  minutes: {
    ar: 'دقيقة',
    en: 'minutes'
  },
  startTimer: {
    ar: 'بدء المؤقت',
    en: 'Start Timer'
  },
  stopTimer: {
    ar: 'إيقاف المؤقت',
    en: 'Stop Timer'
  },
  decreaseTimeTooltip: {
    ar: 'إنقاص الوقت (-٥ دقائق)',
    en: 'Decrease time (-5 min)'
  },
  increaseTimeTooltip: {
    ar: 'زيادة الوقت (+٥ دقائق)',
    en: 'Increase time (+5 min)'
  },
  decreaseTimeAria: {
    ar: 'إنقاص الوقت',
    en: 'Decrease time'
  },
  increaseTimeAria: {
    ar: 'زيادة الوقت',
    en: 'Increase time'
  },

  // Settings Card
  repeatSurahToggle: {
    ar: 'تكرار نفس السورة بعد انتهائها',
    en: 'Repeat same Surah upon ending'
  },
  continuousPlayToggle: {
    ar: 'تشغيل متواصل (الانتقال للسورة التالية)',
    en: 'Continuous play (auto-next Surah)'
  },
  downloadMushaf: {
    ar: 'تحميل المصحف',
    en: 'Download Qur\'an'
  },

  // Saved Favorites Card
  savedFavorites: {
    ar: 'المفضلات المحفوظة',
    en: 'Saved Favorites'
  },
  noFavoritesDesc: {
    ar: 'لا توجد مفضلات محفوظة حتى الآن.<br />اختر قارئاً وسورة واضغط على أيقونة القلب بالأعلى لحفظها هنا لسهولة الرجوع إليها (حتى ١٠ مفضلات).',
    en: 'No saved favorites yet.<br />Select a reciter and a Surah, then tap the heart icon at the top to save them here for quick access (up to 10 favorites).'
  },
  surahPrefix: {
    ar: 'سورة',
    en: 'Surah'
  },
  reciterPrefix: {
    ar: 'القارئ:',
    en: 'Reciter:'
  },
  playing: {
    ar: 'قيد التشغيل',
    en: 'Playing'
  },
  selected: {
    ar: 'المحددة',
    en: 'Selected'
  },
  deleteFromFavorites: {
    ar: 'حذف من المفضلة',
    en: 'Remove from favorites'
  },
  delete: {
    ar: 'حذف',
    en: 'Delete'
  },
  tapToListen: {
    ar: 'اضغط للاستماع',
    en: 'Tap to listen'
  },

  // Page Bottom Note
  internetNote: {
    ar: 'ملاحظة: لا تعمل هذه الصفحة إلا إذا كنت متصلاً بالإنترنت، ويفضل الواي فاي.',
    en: 'Note: This page only works when connected to the internet; Wi-Fi is recommended.'
  },

  // Audio Alerts
  audioLoadError: {
    ar: 'خطأ في تحميل المقطع الصوتي. قد يكون غير متوفر حاليًا.',
    en: 'Error loading audio file. It may be currently unavailable.'
  },
  autoPlayError: {
    ar: 'فشل التشغيل التلقائي.',
    en: 'Autoplay failed.'
  },
  browserPlayError: {
    ar: 'لم يتمكن المتصفح من تشغيل الصوت تلقائيًا.',
    en: 'Browser could not autoplay audio.'
  },
  sleepTimerActivatedToast: {
    ar: 'تم تفعيل مؤقت النوم: {m} دقيقة',
    en: 'Sleep timer set: {m} min'
  },
  sleepTimerEndOfSurahToast: {
    ar: 'تم تفعيل مؤقت النوم عند نهاية سورة {s}',
    en: 'Sleep timer set to end of Surah {s}'
  },
  sleepTimerStoppedToast: {
    ar: 'تم إيقاف مؤقت النوم',
    en: 'Sleep timer cancelled'
  },
  sleepTimerEndedToast: {
    ar: 'انتهى مؤقت النوم وتم إيقاف التلاوة',
    en: 'Sleep timer ended — recitation stopped'
  },
  timerAdded5MinToast: {
    ar: 'تمت زيادة ٥ دقائق لمؤقت النوم',
    en: 'Added 5 minutes to sleep timer'
  },
  timerReduced5MinToast: {
    ar: 'تم إنقاص ٥ دقائق من مؤقت النوم',
    en: 'Reduced 5 minutes from sleep timer'
  },
  timerSetToOneMinToast: {
    ar: 'تم تعيين المؤقت إلى دقيقة واحدة',
    en: 'Timer set to 1 minute'
  },
  timerMinOneMinToast: {
    ar: 'الحد الأدنى دقيقة واحدة',
    en: 'Minimum duration is 1 minute'
  },

  // Modals Strings
  searchReciterPlaceholder: {
    ar: 'بحث عن قارئ...',
    en: 'Search reciter...'
  },
  noSearchResults: {
    ar: 'لا يوجد نتائج للبحث',
    en: 'No search results found'
  },
  selectReaderTitle: {
    ar: 'اختر القارئ',
    en: 'Select Reciter'
  },
  availableSurahsCount: {
    ar: '(متوفر: {n} سورة)',
    en: '(Available: {n} Surahs)'
  },
  completeMushafTitle: {
    ar: '(المصحف كامل)',
    en: '(Complete Qur\'an)'
  },
  searchReaderModal: {
    ar: 'ابحث عن قارئ...',
    en: 'Search reciters...'
  },
  selectSurahsTitle: {
    ar: 'اختر السور',
    en: 'Select Surahs'
  },
  selectSurahsSubAvailable: {
    ar: '(المتاح لهذا القارئ: {n} سورة فقط)',
    en: '(Available for this reciter: {n} Surahs)'
  },
  selectSurahsSubMultiple: {
    ar: '(يمكنك اختيار أكثر من سورة)',
    en: '(You can select multiple Surahs)'
  },
  selectedSurahsLabel: {
    ar: 'محدد: {n} سورة',
    en: 'Selected: {n} Surahs'
  },
  allAvailableSurahsBtn: {
    ar: 'السور المتاحة كاملة ({n})',
    en: 'All Available Surahs ({n})'
  },
  completeMushafBtn: {
    ar: 'المصحف كاملًا',
    en: 'Complete Qur\'an'
  },
  selectJuzsTitle: {
    ar: 'اختر الأجزاء',
    en: 'Select Juzs'
  },
  selectJuzsSubAvailable: {
    ar: '(يتم تعديل كل جزء ليشمل السور المتوفرة فقط)',
    en: '(Each Juz adjusted to available Surahs only)'
  },
  selectJuzsSubMultiple: {
    ar: '(يمكنك اختيار أكثر من جزء)',
    en: '(You can select multiple Juzs)'
  },
  selectedJuzsLabel: {
    ar: 'محدد: {n} جزء',
    en: 'Selected: {n} Juzs'
  },
  juzLabel: {
    ar: 'الجزء {n}',
    en: 'Juz {n}'
  },
  unavailableLabel: {
    ar: 'غير متوفر',
    en: 'Unavailable'
  },
  surahsAvailableLabel: {
    ar: '({n} سورة متوفرة)',
    en: '({n} Surahs available)'
  },
  downloadBtn: {
    ar: 'تحميل',
    en: 'Download'
  },
  downloadedBtn: {
    ar: 'محمل',
    en: 'Downloaded'
  },
  downloadingNotice: {
    ar: 'جاري تحميل السور المتوفرة للقارئ فقط',
    en: 'Downloading available Surahs for this reciter only'
  },
  stopDownloadBtn: {
    ar: 'إيقاف التحميل',
    en: 'Cancel Download'
  },
  closeBtn: {
    ar: 'إغلاق',
    en: 'Close'
  }
};

export function tListen(key: string, language: Language = 'ar'): string {
  const item = LISTEN_QURAN_STRINGS[key];
  if (!item) return key;
  return item[language] || item.ar || key;
}
