import { EXTRA_HISTORICAL_EVENTS } from '../data/islamicHistoryEventsExtra';

export type Language = 'ar' | 'en';

export const CALENDAR_STRINGS: Record<string, { ar: string; en: string }> = {
  // Top bar
  pageTitle: {
    ar: 'التقويم',
    en: 'Islamic Calendar'
  },
  back: {
    ar: 'رجوع للخلف',
    en: 'Back'
  },
  home: {
    ar: 'الصفحة الرئيسية',
    en: 'Home'
  },

  // View switchers
  calendarView: {
    ar: 'عرض التقويم',
    en: 'Calendar View'
  },
  dateConverter: {
    ar: 'محول التاريخ',
    en: 'Date Converter'
  },

  // Calendar Header
  hijriYearSuffix: {
    ar: 'هـ',
    en: 'AH'
  },
  gregorianYearSuffix: {
    ar: 'م',
    en: 'AD'
  },
  prevMonth: {
    ar: 'الشهر السابق',
    en: 'Previous Month'
  },
  nextMonth: {
    ar: 'الشهر التالي',
    en: 'Next Month'
  },

  // Events list
  eventsTitle: {
    ar: 'أبرز المناسبات هذا الشهر',
    en: 'Key Occasions This Month'
  },
  noEvents: {
    ar: 'لا توجد مناسبات مسجلة',
    en: 'No events recorded this month'
  },

  // Converter
  hijriToGregorian: {
    ar: 'هجري ← ميلادي',
    en: 'Hijri → Gregorian'
  },
  gregorianToHijri: {
    ar: 'ميلادي ← هجري',
    en: 'Gregorian → Hijri'
  },
  dayLabel: {
    ar: 'اليوم',
    en: 'Day'
  },
  monthLabel: {
    ar: 'الشهر',
    en: 'Month'
  },
  yearLabel: {
    ar: 'السنة',
    en: 'Year'
  },
  hijriResultPrefix: {
    ar: 'النتيجة هجرياً:',
    en: 'Hijri Result:'
  },
  gregorianResultPrefix: {
    ar: 'النتيجة ميلادياً:',
    en: 'Gregorian Result:'
  },
  invalidDate: {
    ar: 'تاريخ غير صالح',
    en: 'Invalid Date'
  },
  invalidHijriDate: {
    ar: 'تاريخ هجري غير صالح',
    en: 'Invalid Hijri Date'
  },
  conversionError: {
    ar: 'خطأ في التحويل',
    en: 'Conversion Error'
  },

  // Historical memory card
  historyTitle: {
    ar: 'ذاكرة التاريخ الإسلامي',
    en: 'Islamic History Memory'
  },
  anotherEvent: {
    ar: 'حدث آخر',
    en: 'Another Event'
  },
  zoomIn: {
    ar: 'تكبير',
    en: 'Zoom In'
  },
  copy: {
    ar: 'نسخ',
    en: 'Copy'
  },
  share: {
    ar: 'مشاركة',
    en: 'Share'
  },
  copiedToClipboard: {
    ar: 'تم النسخ إلى الحافظة',
    en: 'Copied to clipboard'
  },
  close: {
    ar: 'إغلاق',
    en: 'Close'
  },
  shareEvent: {
    ar: 'مشاركة الحدث',
    en: 'Share Event'
  },

  // Pickers titles
  selectGDay: {
    ar: 'اختر اليوم (ميلادي)',
    en: 'Select Day (Gregorian)'
  },
  selectGMonth: {
    ar: 'اختر الشهر (ميلادي)',
    en: 'Select Month (Gregorian)'
  },
  selectGYear: {
    ar: 'اختر السنة (ميلادي)',
    en: 'Select Year (Gregorian)'
  },
  selectHDay: {
    ar: 'اختر اليوم (هجري)',
    en: 'Select Day (Hijri)'
  },
  selectHMonth: {
    ar: 'اختر الشهر (هجري)',
    en: 'Select Month (Hijri)'
  },
  selectHYear: {
    ar: 'اختر السنة (هجري)',
    en: 'Select Year (Hijri)'
  },
  selectMonth: {
    ar: 'اختر الشهر',
    en: 'Select Month'
  },
  selectYear: {
    ar: 'اختر السنة',
    en: 'Select Year'
  }
};

export const CALENDAR_WEEKDAYS: { ar: string; en: string; shortAr: string; shortEn: string }[] = [
  { ar: 'الأحد', en: 'Sunday', shortAr: 'أحد', shortEn: 'Sun' },
  { ar: 'الاثنين', en: 'Monday', shortAr: 'اثنين', shortEn: 'Mon' },
  { ar: 'الثلاثاء', en: 'Tuesday', shortAr: 'ثلاثاء', shortEn: 'Tue' },
  { ar: 'الأربعاء', en: 'Wednesday', shortAr: 'أربعاء', shortEn: 'Wed' },
  { ar: 'الخميس', en: 'Thursday', shortAr: 'خميس', shortEn: 'Thu' },
  { ar: 'الجمعة', en: 'Friday', shortAr: 'جمعة', shortEn: 'Fri' },
  { ar: 'السبت', en: 'Saturday', shortAr: 'سبت', shortEn: 'Sat' }
];

export const CALENDAR_GREGORIAN_MONTHS: { id: number; ar: string; en: string }[] = [
  { id: 1, ar: 'يناير', en: 'January' },
  { id: 2, ar: 'فبراير', en: 'February' },
  { id: 3, ar: 'مارس', en: 'March' },
  { id: 4, ar: 'أبريل', en: 'April' },
  { id: 5, ar: 'مايو', en: 'May' },
  { id: 6, ar: 'يونيو', en: 'June' },
  { id: 7, ar: 'يوليو', en: 'July' },
  { id: 8, ar: 'أغسطس', en: 'August' },
  { id: 9, ar: 'سبتمبر', en: 'September' },
  { id: 10, ar: 'أكتوبر', en: 'October' },
  { id: 11, ar: 'نوفمبر', en: 'November' },
  { id: 12, ar: 'ديسمبر', en: 'December' }
];

export const CALENDAR_HIJRI_MONTHS: { id: number; ar: string; en: string }[] = [
  { id: 1, ar: 'محرم', en: 'Muharram' },
  { id: 2, ar: 'صفر', en: 'Safar' },
  { id: 3, ar: 'ربيع الأول', en: "Rabi' al-Awwal" },
  { id: 4, ar: 'ربيع الآخر', en: "Rabi' al-Thani" },
  { id: 5, ar: 'جمادى الأولى', en: 'Jumada al-Ula' },
  { id: 6, ar: 'جمادى الآخرة', en: 'Jumada al-Thaniyah' },
  { id: 7, ar: 'رجب', en: 'Rajab' },
  { id: 8, ar: 'شعبان', en: "Sha'ban" },
  { id: 9, ar: 'رمضان', en: 'Ramadan' },
  { id: 10, ar: 'شوال', en: 'Shawwal' },
  { id: 11, ar: 'ذو القعدة', en: "Dhu al-Qi'dah" },
  { id: 12, ar: 'ذو الحجة', en: 'Dhu al-Hijjah' }
];

export const ISLAMIC_EVENTS_TRANSLATED: Record<string, { enName: string; enDesc: string }> = {
  'رأس السنة الهجرية': {
    enName: 'Islamic Hijri New Year',
    enDesc: 'Beginning of the new Islamic Hijri Year'
  },
  'يوم عاشوراء': {
    enName: 'Day of Ashura',
    enDesc: 'The day Allah saved Prophet Musa (Moses) peace be upon him'
  },
  'المولد النبوي الشريف': {
    enName: "The Prophet's Birthday (Mawlid)",
    enDesc: 'Birth commemoration of Prophet Muhammad ﷺ'
  },
  'الإسراء والمعراج': {
    enName: "Al-Isra' & Al-Mi'raj",
    enDesc: 'The miraculous Night Journey and Heavenly Ascension'
  },
  'ليلة النصف من شعبان': {
    enName: "Mid-Sha'ban Night",
    enDesc: 'Blessed night of forgiveness and Qibla redirection'
  },
  'بداية شهر رمضان': {
    enName: 'First Day of Ramadan',
    enDesc: 'Commencement of the holy month of fasting'
  },
  'ليلة القدر (تقديرياً)': {
    enName: 'Laylat Al-Qadr (Estimated)',
    enDesc: 'The Night of Decree — better than a thousand months'
  },
  'عيد الفطر المبارك': {
    enName: 'Blessed Eid Al-Fitr',
    enDesc: 'Celebration of breaking the fast after Ramadan'
  },
  'بداية ذي الحجة': {
    enName: 'First of Dhu al-Hijjah',
    enDesc: 'Beginning of the blessed first ten days of Dhu al-Hijjah'
  },
  'يوم عرفة': {
    enName: 'Day of Arafah',
    enDesc: 'Standing at Mount Arafat, the greatest pillar of Hajj'
  },
  'عيد الأضحى المبارك': {
    enName: 'Blessed Eid Al-Adha',
    enDesc: 'Festival of Sacrifice honoring Prophet Ibrahim peace be upon him'
  }
};

export interface HistoricalEventLocalized {
  titleAr: string;
  titleEn: string;
  hijriYearAr: string;
  hijriYearEn: string;
  gregorianYearAr: string;
  gregorianYearEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const HISTORICAL_EVENTS_TRANSLATED: HistoricalEventLocalized[] = [
  {
    titleAr: "الهجرة النبوية الشريفة",
    titleEn: "The Noble Prophet's Hijrah (Migration)",
    hijriYearAr: "1 هـ",
    hijriYearEn: "1 AH",
    gregorianYearAr: "622 م",
    gregorianYearEn: "622 AD",
    descriptionAr: "هجرة النبي محمد ﷺ من مكة إلى المدينة المنورة (يثرب). تعتبر نقطة التحول الكبرى في التاريخ الإسلامي، حيث تأسست أول دولة إسلامية، وبها بدأ التأريخ الهجري الذي اعتمده عمر بن الخطاب رضي الله عنه.",
    descriptionEn: "The migration of Prophet Muhammad ﷺ from Makkah to Madinah (Yathrib). It represents the major turning point in Islamic history, establishing the first Islamic society and founding the Hijri calendar adopted by Umar ibn al-Khattab."
  },
  {
    titleAr: "تحويل القبلة",
    titleEn: "Redirection of the Qibla",
    hijriYearAr: "2 هـ",
    hijriYearEn: "2 AH",
    gregorianYearAr: "624 م",
    gregorianYearEn: "624 AD",
    descriptionAr: "تحويل القبلة من بيت المقدس إلى الكعبة المشرفة في مكة المكرمة، وذلك استجابة لرغبة النبي ﷺ، وكان ذلك في شهر شعبان من السنة الثانية للهجرة.",
    descriptionEn: "The shifting of the prayer direction from Jerusalem (Bayt al-Maqdis) to the Holy Kaaba in Makkah in response to the longing of Prophet Muhammad ﷺ during Sha'ban of 2 AH."
  },
  {
    titleAr: "غزوة بدر الكبرى",
    titleEn: "The Great Battle of Badr",
    hijriYearAr: "2 هـ",
    hijriYearEn: "2 AH",
    gregorianYearAr: "624 م",
    gregorianYearEn: "624 AD",
    descriptionAr: "أول معركة فاصلة في تاريخ الإسلام. التقى فيها المسلمون (313 مقاتل) بجيش قريش (1000 مقاتل). انتهت بنصر مؤزر للمسلمين، مما عزز مكانة الدولة الإسلامية الناشئة في شبه الجزيرة العربية.",
    descriptionEn: "The first decisive battle in Islamic history where 313 Muslims met 1,000 Qurayshi fighters, ending in a monumental victory for Muslims that solidified the standing of the nascent Islamic state."
  },
  {
    titleAr: "غزوة أحد",
    titleEn: "The Battle of Uhud",
    hijriYearAr: "3 هـ",
    hijriYearEn: "3 AH",
    gregorianYearAr: "625 م",
    gregorianYearEn: "625 AD",
    descriptionAr: "وقعت بين المسلمين وقوات قريش عند جبل أحد. كانت المعركة اختباراً كبيراً للمسلمين، وتعلموا منها دروساً عظيمة في الطاعة والثبات، واستشهد فيها حمزة بن عبد المطلب رضي الله عنه.",
    descriptionEn: "Fought at Mount Uhud between Muslims and Quraysh. It served as a profound spiritual test imparting timeless lessons of obedience and steadfastness, wherein Hamzah ibn Abd al-Muttalib was martyred."
  },
  {
    titleAr: "غزوة الخندق (الأحزاب)",
    titleEn: "The Battle of the Trench (Al-Ahzab)",
    hijriYearAr: "5 هـ",
    hijriYearEn: "5 AH",
    gregorianYearAr: "627 م",
    gregorianYearEn: "627 AD",
    descriptionAr: "حصار ضربته قبائل العرب واليهود (الأحزاب) على المدينة. أشار سلمان الفارسي بحفر خندق لحماية المدينة. انتهى الحصار بهزيمة الأحزاب بفضل الله ثم الرياح الشديدة التي اقتلعت خيامهم.",
    descriptionEn: "A massive siege laid by allied confederates against Madinah. Following the advice of Salman al-Farsi, a trench was dug. The siege concluded with divine aid through fierce winds dispersing the confederates."
  },
  {
    titleAr: "صلح الحديبية",
    titleEn: "The Treaty of Al-Hudaybiyyah",
    hijriYearAr: "6 هـ",
    hijriYearEn: "6 AH",
    gregorianYearAr: "628 م",
    gregorianYearEn: "628 AD",
    descriptionAr: "معاهدة سلام بين المسلمين وقريش لمدة 10 سنوات. رغم شروطها التي بدت مجحفة ظاهرياً، اعتبرها القرآن 'فتحاً مبيناً' لأنها أتاحت للمسلمين نشر الدعوة بأمان وتفرغوا لدعوة القبائل والملوك.",
    descriptionEn: "A 10-year peace treaty between Muslims and Quraysh. Declared in the Qur'an as a 'Manifest Victory' (Fath Mubeen), it enabled peaceful propagation of faith across tribes and nations."
  },
  {
    titleAr: "غزوة خيبر",
    titleEn: "The Conquest of Khaybar",
    hijriYearAr: "7 هـ",
    hijriYearEn: "7 AH",
    gregorianYearAr: "628 م",
    gregorianYearEn: "628 AD",
    descriptionAr: "فتح فيها المسلمون حصون خيبر التي كانت مركزاً لمؤامرات اليهود ضد الدولة الإسلامية، وشهدت المعركة بطولات كبيرة لعلي بن أبي طالب رضي الله عنه.",
    descriptionEn: "The liberation of the fortified oasis of Khaybar, neutralizing conspiracies against Madinah and showcasing the unmatched valor of Ali ibn Abi Talib."
  },
  {
    titleAr: "غزوة مؤتة",
    titleEn: "The Battle of Mu'tah",
    hijriYearAr: "8 هـ",
    hijriYearEn: "8 AH",
    gregorianYearAr: "629 م",
    gregorianYearEn: "629 AD",
    descriptionAr: "أول مواجهة عسكرية كبيرة بين المسلمين والإمبراطورية البيزنطية وحلفائها. استشهد فيها القادة الثلاثة: زيد بن حارثة، جعفر بن أبي طالب، وعبد الله بن رواحة، وأظهر فيها خالد بن الوليد عبقرية عسكرية في الانسحاب.",
    descriptionEn: "The first major military engagement between Muslims and the Byzantine Empire. After the martyrdom of commanders Zayd, Ja'far, and Ibn Rawahah, Khalid ibn al-Walid displayed tactical brilliance."
  },
  {
    titleAr: "فتح مكة",
    titleEn: "The Conquest of Makkah",
    hijriYearAr: "8 هـ",
    hijriYearEn: "8 AH",
    gregorianYearAr: "630 م",
    gregorianYearEn: "630 AD",
    descriptionAr: "دخول النبي ﷺ مكة بجيش قوامه 10 آلاف مقاتل دون إراقة دماء بعد نقض قريش لصلح الحديبية. تم تطهير الكعبة من الأصنام، وأعلن النبي العفو العام قائلاً: 'اذهبوا فأنتم الطلقاء'.",
    descriptionEn: "Prophet Muhammad ﷺ entered Makkah peacefully with 10,000 believers following Quraysh's breach of treaty. The Kaaba was cleansed of idols, and general amnesty was proclaimed: 'Go, you are free.'"
  },
  {
    titleAr: "غزوة تبوك",
    titleEn: "The Expedition of Tabuk",
    hijriYearAr: "9 هـ",
    hijriYearEn: "9 AH",
    gregorianYearAr: "630 م",
    gregorianYearEn: "630 AD",
    descriptionAr: "آخر غزوة خرج فيها النبي ﷺ بنفسه، وتسمى 'غزوة العسرة' لصعوبتها. خرج المسلمون لملاقاة الروم، لكن الروم تراجعوا، وعقد النبي ﷺ معاهدات مع القبائل المجاورة.",
    descriptionEn: "The last campaign led by Prophet Muhammad ﷺ, known as the Expedition of Hardship (Usrah). Byzantine forces retreated, and peaceful treaties were forged with regional frontier tribes."
  },
  {
    titleAr: "وفاة النبي ﷺ",
    titleEn: "Passing of Prophet Muhammad ﷺ",
    hijriYearAr: "11 هـ",
    hijriYearEn: "11 AH",
    gregorianYearAr: "632 م",
    gregorianYearEn: "632 AD",
    descriptionAr: "انتقل النبي محمد ﷺ إلى الرفيق الأعلى في يوم الاثنين 12 ربيع الأول بعد أداء حجة الوداع وإتمام الدين، وخلفه أبو بكر الصديق في قيادة المسلمين.",
    descriptionEn: "The Prophet Muhammad ﷺ returned to the Highest Companion on 12 Rabi' al-Awwal after completing the Farewell Pilgrimage and perfecting the religion, succeeded by Abu Bakr as-Siddiq."
  },
  {
    titleAr: "جمع القرآن الكريم",
    titleEn: "Compilation of the Holy Qur'an",
    hijriYearAr: "12 هـ",
    hijriYearEn: "12 AH",
    gregorianYearAr: "633 م",
    gregorianYearEn: "633 AD",
    descriptionAr: "تم جمع القرآن الكريم في مصحف واحد لأول مرة في عهد الخليفة أبي بكر الصديق وبإشارة من عمر بن الخطاب، وذلك بعد استشهاد عدد كبير من حفاظ القرآن في حروب الردة.",
    descriptionEn: "The Qur'an was meticulously assembled into a single manuscript during the Caliphate of Abu Bakr upon the counsel of Umar, safeguarding the divine revelation after many memorizers fell in battle."
  },
  {
    titleAr: "معركة اليرموك",
    titleEn: "The Battle of Yarmouk",
    hijriYearAr: "15 هـ",
    hijriYearEn: "15 AH",
    gregorianYearAr: "636 م",
    gregorianYearEn: "636 AD",
    descriptionAr: "معركة حاسمة بقيادة خالد بن الوليد ضد الإمبراطورية البيزنطية. استمرت 6 أيام وانتهت بانتصار ساحق للمسلمين، مما أدى إلى إنهاء السيطرة الرومانية على بلاد الشام وفتح أبواب القدس.",
    descriptionEn: "A monumental 6-day battle commanded by Khalid ibn al-Walid against the Byzantine Empire, concluding in a resounding victory that ended Roman hegemony in the Levant and opened Jerusalem."
  },
  {
    titleAr: "معركة القادسية",
    titleEn: "The Battle of Al-Qadisiyyah",
    hijriYearAr: "15 هـ",
    hijriYearEn: "15 AH",
    gregorianYearAr: "636 م",
    gregorianYearEn: "636 AD",
    descriptionAr: "معركة كبرى بقيادة سعد بن أبي وقاص ضد الإمبراطورية الساسانية الفارسية. انتهت بانتصار المسلمين وسقوط عاصمة الفرس (المدائن)، وافتتاح بلاد العراق للعرب المسلمين.",
    descriptionEn: "A landmark engagement led by Sa'd ibn Abi Waqqas against the Persian Sasanian Empire, resulting in Muslim victory and the fall of the Persian imperial capital, Ctesiphon (Al-Mada'in)."
  },
  {
    titleAr: "فتح بيت المقدس",
    titleEn: "Liberation of Jerusalem",
    hijriYearAr: "16 هـ",
    hijriYearEn: "16 AH",
    gregorianYearAr: "637 م",
    gregorianYearEn: "637 AD",
    descriptionAr: "تسلم عمر بن الخطاب رضي الله عنه مفاتيح القدس من البطريرك صفرونيوس، وكتب 'العهدة العمرية' التي منحت المسيحيين الأمان على أنفسهم وكنائسهم وممتلكاتهم.",
    descriptionEn: "Caliph Umar ibn al-Khattab received the keys of Jerusalem from Patriarch Sophronius, issuing the historic 'Umar's Covenant' guaranteeing religious tolerance, protection of churches, and peace."
  },
  {
    titleAr: "عام الرمادة",
    titleEn: "Year of the Severe Drought (Am al-Ramadah)",
    hijriYearAr: "18 هـ",
    hijriYearEn: "18 AH",
    gregorianYearAr: "639 م",
    gregorianYearEn: "639 AD",
    descriptionAr: "سنة قحط وجفاف شديد أصابت بلاد الحجاز في عهد عمر بن الخطاب، وأبلى فيها الفاروق بلاءً حسناً في إدارة الأزمة وإغاثة الناس من الأمصار المجاورة.",
    descriptionEn: "A year of catastrophic drought in the Hijaz during Umar's caliphate, marked by his legendary crisis leadership and emergency aid distribution from Egypt and Syria."
  },
  {
    titleAr: "فتح مصر",
    titleEn: "Conquest of Egypt",
    hijriYearAr: "20 هـ",
    hijriYearEn: "20 AH",
    gregorianYearAr: "641 م",
    gregorianYearEn: "641 AD",
    descriptionAr: "دخول الإسلام إلى مصر بقيادة عمرو بن العاص، حيث سقط حصن بابليون وفتحت الإسكندرية، وبدأت مرحلة جديدة من تاريخ مصر تحت الحكم الإسلامي.",
    descriptionEn: "The entry of Islam into Egypt led by Amr ibn al-Aas with the fall of Babylon Fortress and Alexandria, establishing a prosperous era of justice and mutual respect."
  },
  {
    titleAr: "معارك ذات الصواري",
    titleEn: "Battle of the Masts (Dhat al-Sawari)",
    hijriYearAr: "34 هـ",
    hijriYearEn: "34 AH",
    gregorianYearAr: "654 م",
    gregorianYearEn: "654 AD",
    descriptionAr: "أول معركة بحرية كبرى في تاريخ المسلمين، وقعت بين الأسطول الإسلامي والأسطول البيزنطي في البحر المتوسط، وانتهت بانتصار المسلمين وسيطرتهم البحرية.",
    descriptionEn: "The first great naval engagement in Islamic history in the Mediterranean against the Byzantine fleet, establishing Islamic maritime prowess."
  },
  {
    titleAr: "تأسيس الدولة الأموية",
    titleEn: "Establishment of the Umayyad Caliphate",
    hijriYearAr: "41 هـ",
    hijriYearEn: "41 AH",
    gregorianYearAr: "661 م",
    gregorianYearEn: "661 AD",
    descriptionAr: "بدء حكم الدولة الأموية بتولي معاوية بن أبي سفيان رضي الله عنه الخلافة، واتخاذ دمشق عاصمة لها، لتبدأ مرحلة الفتوحات الواسعة شرقاً وغرباً.",
    descriptionEn: "Beginning of the Umayyad dynasty with Muawiyah ibn Abi Sufyan establishing Damascus as the imperial capital, inaugurating wide-ranging civilizational expansions."
  },
  {
    titleAr: "بناء القيروان",
    titleEn: "Founding of Kairouan",
    hijriYearAr: "50 هـ",
    hijriYearEn: "50 AH",
    gregorianYearAr: "670 م",
    gregorianYearEn: "670 AD",
    descriptionAr: "أسسها القائد عقبة بن نافع في تونس لتكون أول قاعدة عسكرية ومدنية للمسلمين في إفريقيا ومنطلقاً لنشر الإسلام في المغرب العربي.",
    descriptionEn: "Founded by general Uqba ibn Nafi in Tunisia as the premier civil and military center for spreading Islamic culture and learning across North Africa."
  },
  {
    titleAr: "بناء مسجد قبة الصخرة",
    titleEn: "Construction of the Dome of the Rock",
    hijriYearAr: "72 هـ",
    hijriYearEn: "72 AH",
    gregorianYearAr: "691 م",
    gregorianYearEn: "691 AD",
    descriptionAr: "أتم بناءه الخليفة الأموي عبد الملك بن مروان في المسجد الأقصى بالقدس، ويعد أحد أقدم وأجمل المعالم المعمارية الإسلامية الباقية حتى اليوم.",
    descriptionEn: "Commissioned by Umayyad Caliph Abd al-Malik ibn Marwan in the Al-Aqsa compound in Jerusalem, standing as one of the oldest and most sublime architectural masterpieces."
  },
  {
    titleAr: "تعريب الدواوين",
    titleEn: "Arabization of State Administration",
    hijriYearAr: "81 هـ",
    hijriYearEn: "81 AH",
    gregorianYearAr: "700 م",
    gregorianYearEn: "700 AD",
    descriptionAr: "أمر الخليفة عبد الملك بن مروان بتحويل لغة السجلات الرسمية (الدواوين) إلى اللغة العربية بدلاً من الفارسية واليونانية، مما عزز الهوية العربية للدولة.",
    descriptionEn: "Caliph Abd al-Malik ibn Marwan decreed Arabic as the official administrative language for state registries, replacing Greek and Persian and fostering unified cultural literacy."
  },
  {
    titleAr: "بناء الجامع الأموي",
    titleEn: "Erection of the Umayyad Mosque",
    hijriYearAr: "86 هـ",
    hijriYearEn: "86 AH",
    gregorianYearAr: "705 م",
    gregorianYearEn: "705 AD",
    descriptionAr: "بدأ الخليفة الوليد بن عبد الملك بناء الجامع الكبير في دمشق، والذي يعد من أعظم المساجد في تاريخ الإسلام وفخر العمارة الأموية.",
    descriptionEn: "Begun by Caliph Al-Walid ibn Abd al-Malik in Damascus, one of the greatest and most iconic sanctuaries of Islamic architecture and intellectual life."
  },
  {
    titleAr: "فتح الأندلس",
    titleEn: "Conquest of Al-Andalus",
    hijriYearAr: "92 هـ",
    hijriYearEn: "92 AH",
    gregorianYearAr: "711 م",
    gregorianYearEn: "711 AD",
    descriptionAr: "بدأ بقيادة طارق بن زياد وموسى بن نصير. عبرت القوات المضيق وانتهت بفتح معظم شبه الجزيرة الأيبيرية وبداية الحضارة الأندلسية العريقة.",
    descriptionEn: "Initiated by Tariq ibn Ziyad and Musa ibn Nusayr across the strait, culminating in the opening of the Iberian Peninsula and eight centuries of brilliant civilization."
  },
  {
    titleAr: "معركة بلاط الشهداء",
    titleEn: "Battle of Tours (Balat al-Shuhada)",
    hijriYearAr: "114 هـ",
    hijriYearEn: "114 AH",
    gregorianYearAr: "732 م",
    gregorianYearEn: "732 AD",
    descriptionAr: "وقعت في فرنسا بقيادة عبد الرحمن الغافقي ضد قوات الفرنجة، وتعتبر من أهم المعارك التي أوقفت التمدد الإسلامي في أوربا.",
    descriptionEn: "Fought in central France under commander Abd ar-Rahman al-Ghafiqi against Frankish forces, marking the furthest northern reach of early Islamic presence in Europe."
  },
  {
    titleAr: "تأسيس الدولة العباسية",
    titleEn: "Founding of the Abbasid Caliphate",
    hijriYearAr: "132 هـ",
    hijriYearEn: "132 AH",
    gregorianYearAr: "750 م",
    gregorianYearEn: "750 AD",
    descriptionAr: "سقوط الدولة الأموية وقيام الدولة العباسية بعد معركة الزاب، وانتقال مركز الخلافة إلى العراق.",
    descriptionEn: "Rise of the Abbasid dynasty following the Battle of the Zab, relocating the imperial center to Iraq and ushering in the Islamic Golden Age."
  },
  {
    titleAr: "بناء مدينة بغداد",
    titleEn: "Construction of Baghdad (City of Peace)",
    hijriYearAr: "145 هـ",
    hijriYearEn: "145 AH",
    gregorianYearAr: "762 م",
    gregorianYearEn: "762 AD",
    descriptionAr: "أنشأها الخليفة العباسي أبو جعفر المنصور وسماها 'دار السلام'. أصبحت عاصمة الخلافة العباسية ومركزاً عالمياً للعلم والترجمة والازدهار الحضاري.",
    descriptionEn: "Founded by Abbasid Caliph Abu Ja'far al-Mansur as Dar al-Salam (City of Peace), swiftly becoming the world's premier metropolis of science, translation, and culture."
  },
  {
    titleAr: "تأسيس إمارة الأندلس",
    titleEn: "Establishment of the Emirate of Cordoba",
    hijriYearAr: "138 هـ",
    hijriYearEn: "138 AH",
    gregorianYearAr: "756 م",
    gregorianYearEn: "756 AD",
    descriptionAr: "نجاح عبد الرحمن الداخل (صقر قريش) في دخول الأندلس وتأسيس إمارة أموية مستقلة فيها بعد سقوط الدولة الأموية في المشرق.",
    descriptionEn: "Abd al-Rahman I (the Falcon of Quraysh) successfully established an independent Umayyad emirate in Al-Andalus, launching the golden cultural era of Cordoba."
  },
  {
    titleAr: "فتح جزيرة صقلية",
    titleEn: "Conquest of Sicily",
    hijriYearAr: "212 هـ",
    hijriYearEn: "212 AH",
    gregorianYearAr: "827 م",
    gregorianYearEn: "827 AD",
    descriptionAr: "بدأ الفتح بقيادة القاضي أسد بن الفرات في عهد الأغالبة، واستمرت الجزيرة تحت الحكم الإسلامي لعدة قرون كمركز حضاري هام.",
    descriptionEn: "Begun under scholar-judge Asad ibn al-Furat during the Aghlabid era, making Sicily a vital conduit of medicine, agronomy, and sciences to Europe."
  },
  {
    titleAr: "فتح عمورية",
    titleEn: "Conquest of Amorium",
    hijriYearAr: "223 هـ",
    hijriYearEn: "223 AH",
    gregorianYearAr: "838 م",
    gregorianYearEn: "838 AD",
    descriptionAr: "قادها الخليفة المعتصم بالله رداً على اعتداء البيزنطيين على المسلمين، وتخلدت ببيت أبي تمام: 'السيف أصدق أنباء من الكتب'.",
    descriptionEn: "Led in person by Caliph Al-Mu'tasim Billah in defense of oppressed subjects, commemorated in the immortal ode by poet Abu Tammam."
  },
  {
    titleAr: "بناء جامعة القرويين",
    titleEn: "Founding of University of al-Qarawiyyin",
    hijriYearAr: "245 هـ",
    hijriYearEn: "245 AH",
    gregorianYearAr: "859 م",
    gregorianYearEn: "859 AD",
    descriptionAr: "أسستها فاطمة الفهرية في مدينة فاس بالمغرب، وتعتبر أقدم جامعة مستمرة في منح الدرجات العلمية في العالم حسب اليونسكو.",
    descriptionEn: "Founded by Fatima al-Fihriya in Fez, Morocco; recognized by UNESCO as the oldest continuously operating degree-granting university in the world."
  },
  {
    titleAr: "بناء الجامع الأزهر",
    titleEn: "Founding of Al-Azhar Mosque and University",
    hijriYearAr: "359 هـ",
    hijriYearEn: "359 AH",
    gregorianYearAr: "970 م",
    gregorianYearEn: "970 AD",
    descriptionAr: "أسسه جوهر الصقلي القائد الفاطمي في القاهرة. تحول لاحقاً إلى أهم مدرسة ومعلم علمي في العالم الإسلامي لتدريس العلوم الشرعية واللغة العربية.",
    descriptionEn: "Established in Cairo by general Jawhar al-Siqilli, later evolving into the Islamic world's foremost sanctuary of theological and linguistic sciences."
  },
  {
    titleAr: "معركة ملاذكرد",
    titleEn: "The Battle of Manzikert",
    hijriYearAr: "463 هـ",
    hijriYearEn: "463 AH",
    gregorianYearAr: "1071 م",
    gregorianYearEn: "1071 AD",
    descriptionAr: "انتصار السلاجقة بقيادة ألب أرسلان على الإمبراطورية البيزنطية، مما مهد الطريق لدخول الأتراك المسلمين إلى بلاد الأناضول.",
    descriptionEn: "Decisive Seljuk triumph led by Sultan Alp Arslan over the Byzantine Emperor Romanos IV, paving the permanent way for Muslim settlements in Anatolia."
  },
  {
    titleAr: "معركة الزلاقة",
    titleEn: "The Battle of Sagrajas (Al-Zallaqah)",
    hijriYearAr: "479 هـ",
    hijriYearEn: "479 AH",
    gregorianYearAr: "1086 م",
    gregorianYearEn: "1086 AD",
    descriptionAr: "انتصار كبير للمرابطين بقيادة يوسف بن تاشفين مع ملوك الطوائف ضد قوات ألفونسو السادس ملك قشتالة، مما أدى إلى تأخير سقوط الأندلس لأكثر من قرنين.",
    descriptionEn: "A monumental Almoravid victory led by Yusuf ibn Tashfin alongside Taifa kings against Alfonso VI of Castile, prolonging Islamic presence in Al-Andalus for centuries."
  },
  {
    titleAr: "معركة حطين",
    titleEn: "The Battle of Hattin",
    hijriYearAr: "583 هـ",
    hijriYearEn: "583 AH",
    gregorianYearAr: "1187 م",
    gregorianYearEn: "1187 AD",
    descriptionAr: "معركة فاصلة بقيادة صلاح الدين الأيوبي ضد الصليبيين. تم فيها تدمير الجيش الصليبي وأسر ملك القدس، مما مهد الطريق لاستعادة القدس وشريفها.",
    descriptionEn: "The historic victory commanded by Sultan Saladin against the Crusader armies, shattering their forces and directly paving the path to reclaim Jerusalem."
  },
  {
    titleAr: "وفاة صلاح الدين الأيوبي",
    titleEn: "Passing of Sultan Saladin",
    hijriYearAr: "589 هـ",
    hijriYearEn: "589 AH",
    gregorianYearAr: "1193 م",
    gregorianYearEn: "1193 AD",
    descriptionAr: "وفاة الناصر صلاح الدين في دمشق بعد حياة حافلة بالبطولات والعدل والجهاد ضد الصليبيين، ودفن في منزله بجانب المسجد الأموي.",
    descriptionEn: "Sultan Saladin passed away in Damascus after an exemplary life of chivalry, justice, and devotion, resting adjacent to the Umayyad Mosque."
  },
  {
    titleAr: "معركة المنصورة",
    titleEn: "The Battle of Mansurah",
    hijriYearAr: "648 هـ",
    hijriYearEn: "648 AH",
    gregorianYearAr: "1250 م",
    gregorianYearEn: "1250 AD",
    descriptionAr: "هزيمة الحملة الصليبية السابعة بقيادة الملك لويس التاسع في مصر، وأسره في دار ابن لقمان، مما مثل نهاية للحروب الصليبية الكبرى.",
    descriptionEn: "Defeat of the Seventh Crusade under King Louis IX of France in the Nile Delta and his capture in Dar Ibn Luqman, ending major crusading incursions."
  },
  {
    titleAr: "معركة عين جالوت",
    titleEn: "The Battle of Ain Jalut",
    hijriYearAr: "658 هـ",
    hijriYearEn: "658 AH",
    gregorianYearAr: "1260 م",
    gregorianYearEn: "1260 AD",
    descriptionAr: "معركة تاريخية كبرى بقيادة سيف الدين قطز والظاهر بيبرس. انتهت بهزيمة جيش المغول، وأنقذت العالم الإسلامي من الزوال ومهدت لدولة المماليك.",
    descriptionEn: "A pivotal victory commanded by Qutuz and Baybars defeating the Mongol horde, preserving Islamic and world civilization from annihilation."
  },
  {
    titleAr: "استعادة عكا",
    titleEn: "Liberation of Acre (Akka)",
    hijriYearAr: "690 هـ",
    hijriYearEn: "690 AH",
    gregorianYearAr: "1291 م",
    gregorianYearEn: "1291 AD",
    descriptionAr: "نجاح المماليك بقيادة الأشرف خليل بن قلاوون في فتح مدينة عكا، وبذلك انتهى الوجود الصليبي في بلاد الشام بشكل نهائي.",
    descriptionEn: "The Mamluk liberation of Acre under Sultan Al-Ashraf Khalil ibn Qalawun, marking the definitive and final end of the Crusader presence in the Levant."
  },
  {
    titleAr: "فتح القسطنطينية",
    titleEn: "Conquest of Constantinople",
    hijriYearAr: "857 هـ",
    hijriYearEn: "857 AH",
    gregorianYearAr: "1453 م",
    gregorianYearEn: "1453 AD",
    descriptionAr: "نجاح السلطان العثماني محمد الفاتح في فتح القسطنطينية، تحقق بذلك حديث النبي ﷺ، وتم تحويل اسمها إلى إسطنبول لتصبح عاصمة العثمانيين.",
    descriptionEn: "Ottoman Sultan Mehmed II (The Conqueror) successfully opened Constantinople fulfilling the prophetic tradition, establishing Istanbul as the thriving Ottoman capital."
  },
  {
    titleAr: "سقوط غرناطة",
    titleEn: "Fall of Granada",
    hijriYearAr: "897 هـ",
    hijriYearEn: "897 AH",
    gregorianYearAr: "1492 م",
    gregorianYearEn: "1492 AD",
    descriptionAr: "سلم أبو عبد الله محمد الصغير مفاتيح غرناطة للملوك الكاثوليك، وبذلك سقطت آخر ممالك المسلمين في الأندلس بعد 8 قرون.",
    descriptionEn: "The surrender of the keys of Granada to the Catholic Monarchs, concluding eight centuries of Islamic sovereignty and illumination in Al-Andalus."
  },
  {
    titleAr: "معركة مرج دابق",
    titleEn: "The Battle of Marj Dabiq",
    hijriYearAr: "922 هـ",
    hijriYearEn: "922 AH",
    gregorianYearAr: "1516 م",
    gregorianYearEn: "1516 AD",
    descriptionAr: "معركة بين العثمانيين والمماليك بقيادة سليم الأول وقنصوة الغوري. انتهت بضم بلاد الشام ومصر لاحقاً إلى السيادة العثمانية.",
    descriptionEn: "Engagement near Aleppo between the Ottomans and Mamluks, leading to Ottoman custody over the Levant and Egypt, unifying vast Islamic realms."
  },
  {
    titleAr: "بناء المسجد السليماني",
    titleEn: "Construction of Süleymaniye Mosque",
    hijriYearAr: "964 هـ",
    hijriYearEn: "964 AH",
    gregorianYearAr: "1557 م",
    gregorianYearEn: "1557 AD",
    descriptionAr: "تحفة معمارية صممها المهندس سنان في عهد السلطان سليمان القانوني في إسطنبول، تعبيراً عن قوة الدولة العثمانية في عصرها الذهبي.",
    descriptionEn: "An architectural marvel masterminded by architect Mimar Sinan for Sultan Suleiman the Magnificent, symbolizing the peak of Ottoman art and civic patronage."
  },
  {
    titleAr: "معركة ليبانتو",
    titleEn: "The Battle of Lepanto",
    hijriYearAr: "979 هـ",
    hijriYearEn: "979 AH",
    gregorianYearAr: "1571 م",
    gregorianYearEn: "1571 AD",
    descriptionAr: "معركة بحرية ضخمة بين الأسطول العثماني والتحالف المسيحي في البحر المتوسط، وتعتبر هزة قوية للبحرية العثمانية في ذلك الوقت.",
    descriptionEn: "A massive naval battle in the Mediterranean between the Ottoman fleet and Holy League coalition, shaping Renaissance European geopolitics."
  },
  {
    titleAr: "حصار فيينا الثاني",
    titleEn: "Second Siege of Vienna",
    hijriYearAr: "1094 هـ",
    hijriYearEn: "1094 AH",
    gregorianYearAr: "1683 م",
    gregorianYearEn: "1683 AD",
    descriptionAr: "محاولة العثمانيين الكبرى لفتح فيينا بقيادة مرزيفونلو قره مصطفى باشا، وانتهت بتراجع العثمانيين وبدء مرحلة انحسار نفوذهم في أوربا.",
    descriptionEn: "The high-water mark of Ottoman expansion in Central Europe led by Kara Mustafa Pasha, culminating in strategic realignments across Europe."
  },
  {
    titleAr: "تأسيس الدولة السعودية الأولى",
    titleEn: "Founding of the First Saudi State",
    hijriYearAr: "1157 هـ",
    hijriYearEn: "1157 AH",
    gregorianYearAr: "1744 م",
    gregorianYearEn: "1744 AD",
    descriptionAr: "بدأ التحالف التاريخي بين الإمام محمد بن سعود والشيخ محمد بن عبد الوهاب في الدرعية، لتبدأ مرحلة جديدة في تاريخ الجزيرة العربية.",
    descriptionEn: "The historic pact in Diriyah between Imam Muhammad ibn Saud and Sheikh Muhammad ibn Abd al-Wahhab, initiating a new era in the Arabian Peninsula."
  },
  {
    titleAr: "بناء مسجد قباء",
    titleEn: "Building of Quba Mosque",
    hijriYearAr: "1 هـ",
    hijriYearEn: "1 AH",
    gregorianYearAr: "622 م",
    gregorianYearEn: "622 AD",
    descriptionAr: "أول مسجد أسسه النبي ﷺ عند وصوله إلى المدينة المنورة في رحلة الهجرة، ويمثل أول لبنة في العمارة الإسلامية المسجدية.",
    descriptionEn: "The very first mosque established by Prophet Muhammad ﷺ upon arriving at Madinah during the Hijrah, marking the bedrock of Islamic sacred architecture."
  },
  {
    titleAr: "بناء مسجد القبلتين",
    titleEn: "Mosque of the Two Qiblas (Al-Qiblatayn)",
    hijriYearAr: "2 هـ",
    hijriYearEn: "2 AH",
    gregorianYearAr: "624 م",
    gregorianYearEn: "624 AD",
    descriptionAr: "المكان الذي شهد نزول الوحي على النبي ﷺ بتحويل القبلة من بيت المقدس إلى الكعبة المشرفة بمكة أثناء صلاة الظهر.",
    descriptionEn: "The historical sanctuary where divine revelation commanded the Prophet ﷺ to shift Qibla from Jerusalem towards the Holy Kaaba during prayer."
  },
  {
    titleAr: "فتح جزيرة قبرص",
    titleEn: "Conquest of Cyprus",
    hijriYearAr: "28 هـ",
    hijriYearEn: "28 AH",
    gregorianYearAr: "649 م",
    gregorianYearEn: "649 AD",
    descriptionAr: "أول غزو بحري للمسلمين في عهد الخليفة عثمان بن عفان، بقيادة معاوية بن أبي سفيان، مما مهد للسيادة البحرية الإسلامية.",
    descriptionEn: "The first maritime campaign undertaken during Caliph Uthman's era, securing diplomatic peace and Mediterranean naval security."
  },
  {
    titleAr: "معركة نهاوند",
    titleEn: "The Battle of Nahavand",
    hijriYearAr: "21 هـ",
    hijriYearEn: "21 AH",
    gregorianYearAr: "642 م",
    gregorianYearEn: "642 AD",
    descriptionAr: "تسمى 'فتح الفتوح'؛ حيث انتصر المسلمون بقيادة النعمان بن مقرن على الفرس، وكانت المعركة الفاصلة التي أنهت حكم الساسانيين.",
    descriptionEn: "Celebrated as the 'Victory of Victories' under commander Nu'man ibn Muqarrin, sealing the final collapse of the Sasanian imperial structure."
  },
  {
    titleAr: "فتح بلاد النوبة",
    titleEn: "Opening of Nubia & The Baqt Treaty",
    hijriYearAr: "31 هـ",
    hijriYearEn: "31 AH",
    gregorianYearAr: "652 م",
    gregorianYearEn: "652 AD",
    descriptionAr: "بقيادة عمرو بن العاص ثم عبد الله بن أبي السرح؛ حيث تم توقيع معاهدة 'البقط' التي نظمت العلاقة بين المسلمين وأهل النوبة لقرون.",
    descriptionEn: "Under general Abdallah ibn Abi Sarh, culminating in the historic Baqt treaty ensuring centuries of peaceful commerce and mutual autonomy."
  },
  {
    titleAr: "فتح بلاد السند",
    titleEn: "Conquest of Sindh",
    hijriYearAr: "92 هـ",
    hijriYearEn: "92 AH",
    gregorianYearAr: "711 م",
    gregorianYearEn: "711 AD",
    descriptionAr: "بقيادة البطل الشاب محمد بن القاسم الثقفي، الذي تمكن من دخول الهند ونشر الإسلام في تلك الربوع بفضل عدله وشجاعته.",
    descriptionEn: "Commanded by the 17-year-old general Muhammad ibn al-Qasim, establishing benevolent governance, religious tolerance, and justice across Sindh."
  },
  {
    titleAr: "فتح سمرقند",
    titleEn: "Opening of Samarkand",
    hijriYearAr: "93 هـ",
    hijriYearEn: "93 AH",
    gregorianYearAr: "712 م",
    gregorianYearEn: "712 AD",
    descriptionAr: "نجح القائد قتيبة بن مسلم الباهلي في فتح سمرقند، لتصبح لاحقاً واحدة من أعظم مراكز العلم والحضارة في تاريخ الإسلام.",
    descriptionEn: "Conducted by Qutayba ibn Muslim, elevating Samarkand into one of the most radiant hubs of Islamic mathematics, astronomy, and theology."
  },
  {
    titleAr: "تأسيس مدينة القاهرة",
    titleEn: "Founding of Cairo (Al-Qahirah)",
    hijriYearAr: "358 هـ",
    hijriYearEn: "358 AH",
    gregorianYearAr: "969 م",
    gregorianYearEn: "969 AD",
    descriptionAr: "وضع حجر أساسها القائد جوهر الصقلي في عهد الخليفة المعز لدين الله الفاطمي، وسُميت 'القاهرة' تيمناً بالكوكب القاهر.",
    descriptionEn: "Founded by general Jawhar al-Siqilli under Fatimid Caliph Al-Mu'izz li-Din Allah, named 'The Victorious' to become a timeless world capital."
  },
  {
    titleAr: "فتح كابل",
    titleEn: "Opening of Kabul",
    hijriYearAr: "367 هـ",
    hijriYearEn: "367 AH",
    gregorianYearAr: "977 م",
    gregorianYearEn: "977 AD",
    descriptionAr: "بدأ دخول الإسلام الفعلي لأفغانستان في عهد الدولة الغزنوية بقيادة سبكتكين، مما مهد الطريق لنشر الإسلام في شبه القارة الهندية.",
    descriptionEn: "Consolidation of Islamic society in Afghanistan under Sabuktigin during the Ghaznavid era, opening routes of cultural synthesis towards the Indian subcontinent."
  },
  {
    titleAr: "استعادة دمشق",
    titleEn: "Unification of Damascus by Nur al-Din",
    hijriYearAr: "549 هـ",
    hijriYearEn: "549 AH",
    gregorianYearAr: "1154 م",
    gregorianYearEn: "1154 AD",
    descriptionAr: "نجح نور الدين زنكي في ضم دمشق، موحداً بذلك الجبهة الإسلامية ضد الصليبيين، مما مهد الطريق لاحقاً لانتصارات صلاح الدين.",
    descriptionEn: "Nur al-Din Zengi peacefully united Damascus into a unified Muslim defense front, laying the vital political and moral ground for Saladin's victories."
  },
  {
    titleAr: "معركة العقاب",
    titleEn: "Battle of Las Navas de Tolosa (Al-Uqab)",
    hijriYearAr: "609 هـ",
    hijriYearEn: "609 AH",
    gregorianYearAr: "1212 م",
    gregorianYearEn: "1212 AD",
    descriptionAr: "معركة كبرى في الأندلس بين الموحدين والتحالف الصليبي الإسباني؛ وتعتبر نقطة البداية لتفكك دولة الموحدين وضياع الأندلس.",
    descriptionEn: "A major engagement in Andalusia between the Almohad Caliphate and Christian coalition, turning the tide of Iberian medieval history."
  },
  {
    titleAr: "سقوط بغداد",
    titleEn: "Fall of Baghdad",
    hijriYearAr: "656 هـ",
    hijriYearEn: "656 AH",
    gregorianYearAr: "1258 م",
    gregorianYearEn: "1258 AD",
    descriptionAr: "اجتياح هولاكو وجيوش المغول لبغداد، عاصمة الخلافة العباسية، مما أدى إلى دمار هائل للمكتبات والمساجد ونهاية حقبة حضارية.",
    descriptionEn: "Hulagu Khan's sack of Abbasid Baghdad, causing tragic losses to libraries and monuments, before the Islamic civilization rebounded dynamically."
  },
  {
    titleAr: "معركة وادي الخزندار",
    titleEn: "Battle of Wadi al-Khazandar",
    hijriYearAr: "699 هـ",
    hijriYearEn: "699 AH",
    gregorianYearAr: "1299 م",
    gregorianYearEn: "1299 AD",
    descriptionAr: "اشتباك عنيف بين المماليك وإيلخانات المغول في الشام؛ ورغم الهزيمة الظاهرية، إلا أنها استنزفت المغول ومنعتهم من الاستقرار.",
    descriptionEn: "Fierce confrontation between Mamluks and Ilkhanate Mongols near Homs, halting permanent Mongol incursions into Syrian centers."
  },
  {
    titleAr: "معركة نيقوبوليس",
    titleEn: "The Battle of Nicopolis",
    hijriYearAr: "798 هـ",
    hijriYearEn: "798 AH",
    gregorianYearAr: "1396 م",
    gregorianYearEn: "1396 AD",
    descriptionAr: "انتصار العثمانيين بقيادة بايزيد الأول (الصاعقة) على تحالف صليبي أوروبي ضخم، مما أثبت قوة العثمانيين في قلب القارة الأوروبية.",
    descriptionEn: "Decisive victory by Ottoman Sultan Bayezid I (The Thunderbolt) against a massive allied European crusade in the Danube basin."
  },
  {
    titleAr: "معركة أنقرة",
    titleEn: "The Battle of Ankara",
    hijriYearAr: "804 هـ",
    hijriYearEn: "804 AH",
    gregorianYearAr: "1402 م",
    gregorianYearEn: "1402 AD",
    descriptionAr: "وقعت بين تيمورلنك وبايزيد الأول؛ أدت لهزيمة العثمانيين ودخول الدولة في مرحلة 'الفترة' الانتقالية قبل أن تعود أقوى مما كانت.",
    descriptionEn: "Clash between Timur and Bayezid I near Ankara, triggering the Ottoman Interregnum before the empire reunited with greater institutional vigor."
  },
  {
    titleAr: "معركة تشالديران",
    titleEn: "The Battle of Chaldiran",
    hijriYearAr: "920 هـ",
    hijriYearEn: "920 AH",
    gregorianYearAr: "1514 م",
    gregorianYearEn: "1514 AD",
    descriptionAr: "انتصار السلطان سليم الأول على الصفويين؛ مما أدى إلى تأمين الحدود الشرقية للدولة العثمانية والسيطرة على المناطق الحيوية.",
    descriptionEn: "Victory of Ottoman Sultan Selim I, securing the empire's eastern provinces and inaugurating long-term regional stability."
  },
  {
    titleAr: "معركة وادي المخازن",
    titleEn: "Battle of the Three Kings (Wadi al-Makhazin)",
    hijriYearAr: "986 هـ",
    hijriYearEn: "986 AH",
    gregorianYearAr: "1578 م",
    gregorianYearEn: "1578 AD",
    descriptionAr: "أو معركة الملوك الثلاثة في المغرب؛ حيث انتصر المغاربة على البرتغاليين، مما حفظ استقلال المغرب وحماه من الاستعمار لعدة قرون.",
    descriptionEn: "Celebrated victory of Moroccan forces under Ahmad al-Mansur over Portuguese royal armies, preserving Moroccan sovereignty and international prestige."
  },
  {
    titleAr: "تأسيس الدار البيضاء",
    titleEn: "Founding of Casablanca (Anfa)",
    hijriYearAr: "710 هـ تقريباً",
    hijriYearEn: "c. 710 AH",
    gregorianYearAr: "1310 م",
    gregorianYearEn: "c. 1310 AD",
    descriptionAr: "بداية تشكل النواة الأولى للمدينة في العهد المريني، حيث بدأت تبرز كمركز تجاري وبحري هام على المحيط الأطلسي.",
    descriptionEn: "Emergence of the maritime town during the Marinid dynasty, rising to become the premier commercial gateway of North Africa."
  },
  {
    titleAr: "بناء تاج محل",
    titleEn: "Construction of the Taj Mahal",
    hijriYearAr: "1041 هـ",
    hijriYearEn: "1041 AH",
    gregorianYearAr: "1632 م",
    gregorianYearEn: "1632 AD",
    descriptionAr: "بدأ الإمبراطور شاه جهان بناء ضريح 'تاج محل' في أغرة بالهند، والذي يعد من أروع نماذج العمارة الإسلامية الفنية في العالم.",
    descriptionEn: "Commissioned in Agra by Mughal Emperor Shah Jahan, acclaimed globally as the crowning jewel of Indo-Islamic art and marble masonry."
  },
  {
    titleAr: "رحلة الإمام البخاري",
    titleEn: "Imam Al-Bukhari's Scholarly Journey",
    hijriYearAr: "210 هـ تقريباً",
    hijriYearEn: "c. 210 AH",
    gregorianYearAr: "825 م",
    gregorianYearEn: "c. 825 AD",
    descriptionAr: "بدأ الإمام البخاري رحلته الكبرى في طلب الحديث عبر الأمصار، والتي أثمرت عن 'صحيح البخاري' أصح كتاب بعد كتاب الله.",
    descriptionEn: "Imam Muhammad ibn Ismail al-Bukhari embarked on his historic travels across cities compiling 'Sahih al-Bukhari', the most authentic collection of Hadith."
  },
  ...EXTRA_HISTORICAL_EVENTS
];

export function tCalendar(key: string, language: Language = 'ar'): string {
  const item = CALENDAR_STRINGS[key];
  if (!item) return key;
  return item[language] || item.ar || key;
}

export function formatCalendarNumber(num: number | string | null | undefined, language: Language = 'ar'): string {
  if (num === null || num === undefined) return '';
  const str = String(num);
  if (language === 'en') {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d)));
  }
  return str.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

export function getCalendarMonthName(monthIndex: number, isHijri: boolean, language: Language = 'ar'): string {
  if (isHijri) {
    const item = CALENDAR_HIJRI_MONTHS[monthIndex];
    return item ? (language === 'en' ? item.en : item.ar) : '';
  } else {
    const item = CALENDAR_GREGORIAN_MONTHS[monthIndex];
    return item ? (language === 'en' ? item.en : item.ar) : '';
  }
}

export function getCalendarWeekdayName(dayIndex: number, short = false, language: Language = 'ar'): string {
  const item = CALENDAR_WEEKDAYS[dayIndex];
  if (!item) return '';
  if (language === 'en') {
    return short ? item.shortEn : item.en;
  }
  return short ? item.shortAr : item.ar;
}
