import moment from 'moment-hijri';
import { quranData as quranJsonData } from './quranData';

export interface AccurateHijriDate {
  day: number;   // 1..30
  month: number; // 1..12
  year: number;  // e.g. 1448
}

export interface PrayerScheduleSnapshot {
  fajrToday: Date;
  sunriseToday: Date;
  dhuhrToday: Date;
  asrToday: Date;
  maghribToday: Date;
  ishaToday: Date;
  fajrTomorrow: Date;
  maghribYesterday: Date;
}

export interface ContextualReminder {
  id: string;
  category: 'holiday' | 'occasion' | 'fasting' | 'friday' | 'daily_sunnah';
  title: string;
  subtitle: string;
  actionLabel?: string;
  targetPage?: string;
  targetParams?: Record<string, any>;
}

export const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة'
];

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah'
];

/**
 * حساب التاريخ الهجري بدقة فلكية عالية وفق تقويم أم القرى الرسمي (Umm al-Qura)
 * مع تثبيت الساعة عند منتصف النهار المحلي (12:00) لمنع أي انزياح ناتج عن التوقيت الصيفي أو حدود منتصف الليل.
 */
export function getAccurateHijriDate(date: Date): AccurateHijriDate {
  const noonDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0
  );

  // ١. المحرك الأساسي: تقويم أم القرى الرسمي المدمج في النظام (ICU Umm al-Qura)
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(noonDate);
    const hDay = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);
    const hMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10);
    const hYear = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);

    // التحقق الصارم من أن المحرك لم يرجع التاريخ الميلادي بالخطأ على الأجهزة القديمة
    if (hDay >= 1 && hDay <= 30 && hMonth >= 1 && hMonth <= 12 && hYear >= 1400 && hYear <= 1600) {
      return { day: hDay, month: hMonth, year: hYear };
    }
  } catch {
    // الانتقال إلى البديل الدقيق
  }

  // ٢. البديل الثاني: جداول أم القرى في مكتبة moment-hijri
  try {
    const m = moment(noonDate);
    const hDay = m.iDate();
    const hMonth = m.iMonth() + 1;
    const hYear = m.iYear();
    if (hDay >= 1 && hDay <= 30 && hMonth >= 1 && hMonth <= 12 && hYear >= 1400 && hYear <= 1600) {
      return { day: hDay, month: hMonth, year: hYear };
    }
  } catch {
    // الانتقال إلى الحساب الفلكي الجدولي
  }

  // ٣. البديل الحسابي الفلكي المضمون
  let y = noonDate.getFullYear();
  let m = noonDate.getMonth() + 1;
  const d = noonDate.getDate();
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hMonth = Math.floor((24 * l) / 709);
  const hDay = l - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  return { day: hDay, month: hMonth, year: hYear };
}

function getSurahKahfStartPage(): number {
  try {
    const page = quranJsonData?.surahs?.[17]?.ayahs?.[0]?.page;
    if (typeof page === 'number' && page > 0) return page;
  } catch {}
  return 293;
}

/**
 * محرك التذكير الذكي للمواسم والمناسبات والأوقات الشرعية:
 * - يظهر فقط في نوافذ زمنية شرعية قصيرة ومحددة بدقة ثم يختفي تماماً بقية اليوم لعدم ازدحام الشاشة.
 * - يراعي دخول الليلة الشرعية عند أذان المغرب وانتهاءها عند أذان الفجر.
 * - يراعي الأحكام الفقهية الدقيقة (مثل تحريم صوم العيدين وأيام التشريق ١١-١٣ ذي الحجة، واستثناء رمضان و١٣ ذي الحجة من صيام الأيام البيض).
 */
export function resolveContextualReminder(
  nowDate: Date,
  schedule: PrayerScheduleSnapshot,
  isEn: boolean,
  formatNumber: (n: number | string) => string,
  fromSource: 'modern_home' | 'classic_home' = 'modern_home'
): ContextualReminder | null {
  const {
    fajrToday,
    sunriseToday,
    dhuhrToday,
    asrToday,
    maghribToday,
    ishaToday,
    fajrTomorrow,
    maghribYesterday
  } = schedule;

  const todayCivilNoon = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
    12,
    0,
    0
  );
  const tomorrowCivilNoon = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate() + 1,
    12,
    0,
    0
  );

  const todayHijri = getAccurateHijriDate(todayCivilNoon);
  const tomorrowHijri = getAccurateHijriDate(tomorrowCivilNoon);

  const isAfterMaghrib = nowDate >= maghribToday;
  const isBeforeFajr = nowDate < fajrToday;
  const isNightWindow = isAfterMaghrib || isBeforeFajr;

  // الليلة الشرعية الحالية (تبدأ من المغرب وتنتهي بطلوع الفجر)
  const islamicNightHijri: AccurateHijriDate | null = isAfterMaghrib
    ? tomorrowHijri
    : isBeforeFajr
      ? todayHijri
      : null;

  // نوافذ نهارية محددة ومختصرة حتى لا يطول ظهور الشريط طوال اليوم
  const isFajrToMaghrib = nowDate >= fajrToday && nowDate < maghribToday;
  const isFajrToAsr = nowDate >= fajrToday && nowDate < asrToday;
  const isSunriseToDhuhr = nowDate >= sunriseToday && nowDate < dhuhrToday;
  const isEveningReminderHours =
    (isAfterMaghrib && nowDate.getTime() <= ishaToday.getTime() + 90 * 60000) ||
    (isBeforeFajr && fajrToday.getTime() - nowDate.getTime() <= 150 * 60000);

  // =========================================================================
  // ١. الأعياد والمناسبات الإسلامية السنوية الكبرى (أعلى أولوية)
  // =========================================================================

  // --- ليلة عيد الفطر المبارك (١ شوال: من مغرب آخر يوم رمضان حتى الفجر) ---
  if (islamicNightHijri && islamicNightHijri.month === 10 && islamicNightHijri.day === 1) {
    return {
      id: `eid_fitr_night_${islamicNightHijri.year}`,
      category: 'holiday',
      title: isEn ? 'Night of Eid al-Fitr' : 'ليلة عيد الفطر المبارك',
      subtitle: isEn
        ? 'May Allah accept your fasting • Sunnah to proclaim Takbeer tonight'
        : 'تقبّل الله صيامكم وقيامكم • يُسنّ التكبير من غروب الشمس حتى صلاة العيد',
      actionLabel: isEn ? 'Takbeer' : 'التكبير',
      targetPage: 'tasbeeh'
    };
  }

  // --- يوم عيد الفطر المبارك (١ شوال: من الفجر حتى العصر فقط) ---
  if (todayHijri.month === 10 && todayHijri.day === 1 && isFajrToAsr) {
    return {
      id: `eid_fitr_day_${todayHijri.year}`,
      category: 'holiday',
      title: isEn ? 'Eid al-Fitr Mubarak' : 'عيد فطر مبارك',
      subtitle: isEn
        ? 'May Allah accept from us and from you • Wishing you a joyous Eid'
        : 'تقبّل الله منّا ومنكم صالح الأعمال، وكل عام وأنتم بخير',
      actionLabel: isEn ? 'Takbeer' : 'التكبير',
      targetPage: 'tasbeeh'
    };
  }

  // --- ليلة عيد الأضحى المبارك (١٠ ذو الحجة: من مغرب عرفة حتى الفجر) ---
  if (islamicNightHijri && islamicNightHijri.month === 12 && islamicNightHijri.day === 10) {
    return {
      id: `eid_adha_night_${islamicNightHijri.year}`,
      category: 'holiday',
      title: isEn ? 'Night of Eid al-Adha' : 'ليلة عيد الأضحى المبارك',
      subtitle: isEn
        ? 'Allahu Akbar, Allahu Akbar, la ilaha illallah, wa Lillahil Hamd'
        : 'الله أكبر الله أكبر لا إله إلا الله، الله أكبر الله أكبر ولله الحمد',
      actionLabel: isEn ? 'Takbeer' : 'التكبير',
      targetPage: 'tasbeeh'
    };
  }

  // --- يوم عيد الأضحى المبارك (١٠ ذو الحجة: من الفجر حتى العصر فقط) ---
  if (todayHijri.month === 12 && todayHijri.day === 10 && isFajrToAsr) {
    return {
      id: `eid_adha_day_${todayHijri.year}`,
      category: 'holiday',
      title: isEn ? 'Eid al-Adha Mubarak' : 'عيد أضحى مبارك',
      subtitle: isEn
        ? 'May Allah accept your worship and sacrifices • Blessed Eid'
        : 'تقبّل الله طاعاتكم وأضاحيكم، وأعاده عليكم بالخير والبركات',
      actionLabel: isEn ? 'Takbeer' : 'التكبير',
      targetPage: 'tasbeeh'
    };
  }

  // --- تذكير صيام يوم عرفة (ليلة ٩ ذو الحجة: من مغرب ٨ ذي الحجة إلى فجر ٩ ذي الحجة) ---
  if (islamicNightHijri && islamicNightHijri.month === 12 && islamicNightHijri.day === 9) {
    return {
      id: `arafah_fast_${islamicNightHijri.year}`,
      category: 'fasting',
      title: isEn
        ? isAfterMaghrib
          ? 'Fast Tomorrow: Day of Arafah (9 Dhu al-Hijjah)'
          : 'Day of Arafah • Suhoor & Fasting Intention'
        : isAfterMaghrib
          ? `تذكير بصيام غدٍ • يوم عرفة (${formatNumber(9)} ذو الحجة)`
          : `يوم عرفة (${formatNumber(9)} ذو الحجة) • وقت السحور ونية الصيام`,
      subtitle: isEn
        ? 'Fasting the Day of Arafah expiates the previous and coming year'
        : 'صيام يوم عرفة يكفّر السنة الماضية والباقية لغير الحاج',
      actionLabel: isEn ? 'Duas' : 'الأدعية',
      targetPage: 'adia'
    };
  }

  // --- نهار يوم عرفة المبارك (٩ ذو الحجة: من الفجر حتى المغرب) ---
  if (todayHijri.month === 12 && todayHijri.day === 9 && isFajrToMaghrib) {
    return {
      id: `arafah_day_${todayHijri.year}`,
      category: 'occasion',
      title: isEn ? 'Blessed Day of Arafah' : 'يوم عرفة المبارك',
      subtitle: isEn
        ? 'The best supplication is that of the Day of Arafah'
        : 'خير الدعاء دعاء يوم عرفة • أكثروا من التهليل والتكبير والدعاء',
      actionLabel: isEn ? 'Duas' : 'الأدعية',
      targetPage: 'adia'
    };
  }

  // --- أيام التشريق (١١، ١٢، ١٣ ذو الحجة: إشارة صباحية مختصرة من الشروق للظهر) ---
  if (
    todayHijri.month === 12 &&
    (todayHijri.day === 11 || todayHijri.day === 12 || todayHijri.day === 13) &&
    isSunriseToDhuhr
  ) {
    return {
      id: `tashreeq_${todayHijri.year}_${todayHijri.day}`,
      category: 'occasion',
      title: isEn ? 'Days of Tashreeq' : 'أيام التشريق المباركة',
      subtitle: isEn
        ? 'Days of eating, drinking, and remembering Allah (fasting is prohibited)'
        : 'أيام أكل وشرب وذكرٍ لله عز وجل • يُشرع التكبير عقب الصلوات',
      actionLabel: isEn ? 'Tasbeeh' : 'التسبيح',
      targetPage: 'tasbeeh'
    };
  }

  // --- غُرّة عشر ذي الحجة (١ ذو الحجة: من الفجر حتى العصر) ---
  if (todayHijri.month === 12 && todayHijri.day === 1 && isFajrToAsr) {
    return {
      id: `dhul_hijjah_start_${todayHijri.year}`,
      category: 'occasion',
      title: isEn ? 'Blessed Ten Days of Dhu al-Hijjah' : 'غُرّة عشر ذي الحجة المباركة',
      subtitle: isEn
        ? 'No righteous deeds are more beloved to Allah than in these ten days'
        : 'خير أيام الدنيا • أكثروا فيهن من التهليل والتكبير والتحميد والعمل الصالح',
      actionLabel: isEn ? 'Tasbeeh' : 'التسبيح',
      targetPage: 'tasbeeh'
    };
  }

  // --- رأس السنة الهجرية الجديدة (١ محرم: من الفجر حتى العصر فقط) ---
  if (todayHijri.month === 1 && todayHijri.day === 1 && isFajrToAsr) {
    return {
      id: `hijri_new_year_${todayHijri.year}`,
      category: 'occasion',
      title: isEn
        ? `New Hijri Year (${todayHijri.year} AH)`
        : `بداية السنة الهجرية الجديدة (${formatNumber(todayHijri.year)} هـ)`,
      subtitle: isEn
        ? 'O Allah, bring this year upon us with peace, faith, safety, and Islam'
        : 'اللهم أهلّه علينا بالأمن والإيمان والسلامة والإسلام والتوفيق لما تحب وترضى',
      actionLabel: isEn ? 'Calendar' : 'التقويم',
      targetPage: 'calendar'
    };
  }

  // --- تذكير صيام تاسوعاء (ليلة ٩ محرم: في أوقات التذكير المسائية والسحور) ---
  if (
    islamicNightHijri &&
    islamicNightHijri.month === 1 &&
    islamicNightHijri.day === 9 &&
    isNightWindow
  ) {
    return {
      id: `tasua_fast_${islamicNightHijri.year}`,
      category: 'fasting',
      title: isEn
        ? isAfterMaghrib
          ? "Fast Tomorrow: Tasu'a (9 Muharram)"
          : "Tasu'a (9 Muharram) • Suhoor Reminder"
        : isAfterMaghrib
          ? `تذكير بصيام غدٍ • تاسوعاء (${formatNumber(9)} محرم)`
          : `يوم تاسوعاء (${formatNumber(9)} محرم) • وقت السحور ونية الصيام`,
      subtitle: isEn
        ? 'Sunnah to fast the 9th of Muharram alongside Ashura'
        : 'يُستحب صيام تاسوعاء مع عاشوراء اتباعاً للسنة النبوية',
      actionLabel: isEn ? 'Duas' : 'الأدعية',
      targetPage: 'adia'
    };
  }

  // --- تذكير صيام عاشوراء (ليلة ١٠ محرم: من مغرب ٩ محرم إلى فجر ١٠ محرم) ---
  if (
    islamicNightHijri &&
    islamicNightHijri.month === 1 &&
    islamicNightHijri.day === 10 &&
    isNightWindow
  ) {
    return {
      id: `ashura_fast_${islamicNightHijri.year}`,
      category: 'fasting',
      title: isEn
        ? isAfterMaghrib
          ? 'Fast Tomorrow: Ashura (10 Muharram)'
          : 'Day of Ashura • Suhoor & Fasting Intention'
        : isAfterMaghrib
          ? `تذكير بصيام غدٍ • يوم عاشوراء (${formatNumber(10)} محرم)`
          : `يوم عاشوراء (${formatNumber(10)} محرم) • وقت السحور ونية الصيام`,
      subtitle: isEn
        ? 'Fasting Ashura expiates the sins of the previous year'
        : 'صيام يوم عاشوراء أحتسب على الله أن يكفّر السنة التي قبله',
      actionLabel: isEn ? 'Duas' : 'الأدعية',
      targetPage: 'adia'
    };
  }

  // --- نهار يوم عاشوراء (١٠ محرم: من الفجر حتى العصر) ---
  if (todayHijri.month === 1 && todayHijri.day === 10 && isFajrToAsr) {
    return {
      id: `ashura_day_${todayHijri.year}`,
      category: 'occasion',
      title: isEn ? 'Day of Ashura (10 Muharram)' : `يوم عاشوراء (${formatNumber(10)} محرم)`,
      subtitle: isEn
        ? 'The day Allah saved Musa (AS) • May Allah accept your fasting'
        : 'اليوم الذي نجّى الله فيه موسى عليه السلام • تقبّل الله صيامكم وطاعتكم',
      actionLabel: isEn ? 'Duas' : 'الأدعية',
      targetPage: 'adia'
    };
  }

  // --- ذكرى المولد النبوي الشريف (١٢ ربيع الأول: من الفجر حتى العصر فقط) ---
  if (todayHijri.month === 3 && todayHijri.day === 12 && isFajrToAsr) {
    return {
      id: `mawlid_${todayHijri.year}`,
      category: 'occasion',
      title: isEn ? 'Prophetic Biography & Mawlid Memory' : 'ذكرى مولد خير الأنام ﷺ',
      subtitle: isEn
        ? 'Send abundant Salawat upon Prophet Muhammad ﷺ & explore his Seerah'
        : 'اللهم صلِّ وسلِّم على نبينا محمد ﷺ • قبسٌ من سيرته العطرة',
      actionLabel: isEn ? 'Seerah' : 'السيرة النبوية',
      targetPage: 'prophetic-seerah'
    };
  }

  // --- ذكرى الإسراء والمعراج (ليلة ٢٧ رجب أو صباح ٢٧ رجب حتى الظهر) ---
  if (
    (islamicNightHijri && islamicNightHijri.month === 7 && islamicNightHijri.day === 27 && isEveningReminderHours) ||
    (todayHijri.month === 7 && todayHijri.day === 27 && isSunriseToDhuhr)
  ) {
    const yr = islamicNightHijri?.year || todayHijri.year;
    return {
      id: `isra_miraj_${yr}`,
      category: 'occasion',
      title: isEn ? "Isra & Mi'raj Memory (27 Rajab)" : `ذكرى الإسراء والمعراج (${formatNumber(27)} رجب)`,
      subtitle: isEn
        ? 'Miraculous night journey and the obligation of the Five Daily Prayers'
        : 'معجزة الرحلة المباركة وفرض الصلوات الخمس في السماوات العُلا',
      actionLabel: isEn ? 'Seerah' : 'السيرة النبوية',
      targetPage: 'prophetic-seerah'
    };
  }

  // --- ليلة النصف من شعبان (ليلة ١٥ شعبان: وهي كذلك ليلة ثالث الأيام البيض) ---
  if (
    islamicNightHijri &&
    islamicNightHijri.month === 8 &&
    islamicNightHijri.day === 15 &&
    isEveningReminderHours
  ) {
    return {
      id: `mid_shaban_${islamicNightHijri.year}`,
      category: 'occasion',
      title: isEn ? "Mid-Sha'ban & 15th White Day" : `النصف من شعبان وثالث الأيام البيض`,
      subtitle: isEn
        ? 'Purify the heart from rancor & gentle reminder to fast tomorrow'
        : 'تفقد قلبك بالمسامحة والإخلاص • وتذكير لطيف بصيام ثالث الأيام البيض',
      actionLabel: isEn ? 'Duas' : 'الأدعية',
      targetPage: 'adia'
    };
  }

  // --- حلول شهر رمضان المبارك (ليلة ١ رمضان أو نهار ١ رمضان حتى العصر) ---
  if (
    (islamicNightHijri && islamicNightHijri.month === 9 && islamicNightHijri.day === 1) ||
    (todayHijri.month === 9 && todayHijri.day === 1 && isFajrToAsr)
  ) {
    const yr = islamicNightHijri?.year || todayHijri.year;
    return {
      id: `ramadan_start_${yr}`,
      category: 'holiday',
      title: isEn ? 'Ramadan Mubarak' : 'مباركٌ عليكم شهر رمضان',
      subtitle: isEn
        ? 'The month in which the Quran was revealed • Start your Khatma plan'
        : 'شهر القرآن والرحمة والمغفرة • ابدأ ختمتك المباركة بهمة عالية',
      actionLabel: isEn ? 'Daily Wird' : 'الورد اليومي',
      targetPage: 'daily-wird'
    };
  }

  // --- ذكرى غزوة بدر الكبرى (١٧ رمضان: من الشروق إلى الظهر) ---
  if (todayHijri.month === 9 && todayHijri.day === 17 && isSunriseToDhuhr) {
    return {
      id: `badr_battle_${todayHijri.year}`,
      category: 'occasion',
      title: isEn ? 'Day of Al-Furqan • Battle of Badr (17 Ramadan)' : `ذكرى غزوة بدر الكبرى (${formatNumber(17)} رمضان)`,
      subtitle: isEn
        ? 'Commemorating the decisive victory of faith in Prophetic history'
        : 'يوم الفرقان الذي أعزّ الله فيه الإسلام ونصر نبيّه ﷺ وأصحابه',
      actionLabel: isEn ? 'Seerah' : 'السيرة النبوية',
      targetPage: 'prophetic-seerah'
    };
  }

  // --- ذكرى فتح مكة المكرمة (٢٠ رمضان: من الشروق إلى الظهر) ---
  if (todayHijri.month === 9 && todayHijri.day === 20 && isSunriseToDhuhr) {
    return {
      id: `makkah_conquest_${todayHijri.year}`,
      category: 'occasion',
      title: isEn ? 'Conquest of Makkah (20 Ramadan)' : `ذكرى فتح مكة المكرمة (${formatNumber(20)} رمضان)`,
      subtitle: isEn
        ? 'A timeless lesson in mercy, pardon, and humility in victory'
        : 'الفتح الأعظم وتجلّي عفو النبي ﷺ ورحمته وتواضعه لله',
      actionLabel: isEn ? 'Seerah' : 'السيرة النبوية',
      targetPage: 'prophetic-seerah'
    };
  }

  // --- ليالي الوتر في العشر الأواخر من رمضان (٢١، ٢٣، ٢٥، ٢٧، ٢٩: من المغرب حتى مطلع الفجر فقط) ---
  if (
    islamicNightHijri &&
    islamicNightHijri.month === 9 &&
    (islamicNightHijri.day === 21 ||
      islamicNightHijri.day === 23 ||
      islamicNightHijri.day === 25 ||
      islamicNightHijri.day === 27 ||
      islamicNightHijri.day === 29)
  ) {
    const d = islamicNightHijri.day;
    return {
      id: `laylat_qadr_${islamicNightHijri.year}_${d}`,
      category: 'occasion',
      title: isEn
        ? d === 27
          ? 'Night of 27th Ramadan • Seek Laylat al-Qadr'
          : `Odd Night of Ramadan (${d} Ramadan)`
        : d === 27
          ? `ليلة السابع والعشرين من رمضان`
          : `ليلة وترية من العشر الأواخر (${formatNumber(d)} رمضان)`,
      subtitle: isEn
        ? 'O Allah, You are Pardoning and love pardon, so pardon me'
        : 'تحرّوا ليلة القدر • «اللهم إنك عفوٌّ تحب العفو فاعفُ عنّي»',
      actionLabel: isEn ? 'Duas' : 'الأدعية',
      targetPage: 'adia'
    };
  }

  // --- صيام الست من شوال (٢ شوال: إشارة صباحية لطيفة من الشروق للظهر فقط) ---
  if (todayHijri.month === 10 && todayHijri.day === 2 && isSunriseToDhuhr) {
    return {
      id: `six_shawwal_${todayHijri.year}`,
      category: 'fasting',
      title: isEn ? 'Six Days of Shawwal' : 'موسم صيام الست من شوال',
      subtitle: isEn
        ? 'Whoever fasts Ramadan then follows it with six days of Shawwal, it is as fasting a lifetime'
        : '«من صام رمضان ثم أتبعه ستّاً من شوال كان كصيام الدهر»',
      actionLabel: isEn ? 'Tracker' : 'مربي العبادات',
      targetPage: 'habit-tracker'
    };
  }

  // =========================================================================
  // ٢. التذكيرات الشهرية والأسبوعية الموقوتة (الأيام البيض / يوم الجمعة)
  // =========================================================================

  // --- تذكير صيام الأيام البيض (١٣، ١٤، ١٥ من كل شهر هجري عدا رمضان وعدا ١٣ ذو الحجة شرعاً) ---
  // يظهر فقط في نافذة التذكير المسائية (بعد المغرب إلى العشاء + ٩٠ د) وقبيل الفجر (وقت السحور) حتى لا يطول ظهوره
  if (
    islamicNightHijri &&
    isEveningReminderHours &&
    islamicNightHijri.month !== 9 &&
    (islamicNightHijri.day === 13 || islamicNightHijri.day === 14 || islamicNightHijri.day === 15) &&
    !(islamicNightHijri.month === 12 && islamicNightHijri.day === 13)
  ) {
    const monthAr = HIJRI_MONTHS_AR[islamicNightHijri.month - 1] || '';
    const monthEn = HIJRI_MONTHS_EN[islamicNightHijri.month - 1] || '';
    const d = islamicNightHijri.day;

    return {
      id: `white_day_${islamicNightHijri.year}_${islamicNightHijri.month}_${d}`,
      category: 'fasting',
      title: isEn
        ? isAfterMaghrib
          ? `White Day Fasting Tomorrow (${d} ${monthEn})`
          : `White Day Fasting (${d} ${monthEn}) • Suhoor`
        : isAfterMaghrib
          ? `تذكير بصيام الغد • الأيام البيض (${formatNumber(d)} ${monthAr})`
          : `صيام الأيام البيض (${formatNumber(d)} ${monthAr}) • وقت السحور`,
      subtitle: isEn
        ? 'Gentle Sunnah reminder to fast the three luminous days of the month'
        : 'وصية نبوية مباركة بصيام ثلاثة أيام من كل شهر',
      actionLabel: isEn ? 'Tracker' : 'مربي العبادات',
      targetPage: 'habit-tracker'
    };
  }

  // --- يوم الجمعة (من الفجر حتى العصر/المغرب فقط، ويختفي فور غروب الشمس) ---
  if (nowDate.getDay() === 5 && isFajrToMaghrib) {
    const kahfPage = getSurahKahfStartPage();
    return {
      id: `friday_kahf_${nowDate.getFullYear()}_${nowDate.getMonth() + 1}_${nowDate.getDate()}`,
      category: 'friday',
      title: isEn ? "Blessed Jumu'ah" : 'يوم الجمعة المبارك',
      subtitle: isEn
        ? 'Abundant Salawat upon the Prophet ﷺ & light between the two Fridays'
        : 'أكثروا من الصلاة على النبي ﷺ ونوّروا جمعتكم بتلاوة سورة الكهف',
      actionLabel: isEn ? 'Surah Al-Kahf' : 'سورة الكهف',
      targetPage: 'quran',
      targetParams: {
        from: fromSource,
        surah: 18,
        ayah: 1,
        page: kahfPage
      }
    };
  }

  // =========================================================================
  // ٣. الإشارات اليومية الخفيفة المحدودة بوقتها الشرعي القصير (الضحى / الثلث الأخير)
  // =========================================================================

  // --- وقت صلاة الضحى: يبدأ بعد الشروق بـ ٢٠ دقيقة ولمدة ٩٠ دقيقة فقط حتى لا يطول ظهوره ---
  const duhaStart = new Date(sunriseToday.getTime() + 20 * 60000);
  const duhaEnd = new Date(
    Math.min(
      sunriseToday.getTime() + 110 * 60000,
      dhuhrToday.getTime() - 20 * 60000
    )
  );

  if (duhaEnd > duhaStart && nowDate >= duhaStart && nowDate < duhaEnd) {
    return {
      id: `duha_${nowDate.getFullYear()}_${nowDate.getMonth() + 1}_${nowDate.getDate()}`,
      category: 'daily_sunnah',
      title: isEn ? 'Duha Prayer Time' : 'وقت صلاة الضحى',
      subtitle: isEn
        ? 'Two light rak’ahs suffice as charity for every joint (Prayer of the Oft-Returning)'
        : 'صلاة الأوابين • ركعتان خفيفتان تجزئان عن صدقة ٣٦٠ مفصلاً',
      actionLabel: isEn ? 'Adhkar' : 'الأذكار',
      targetPage: 'sabah-masaa'
    };
  }

  // --- الثلث الأخير من الليل: حساب شرعي فلكي دقيق من غروب الشمس إلى طلوع الفجر ---
  if (isNightWindow) {
    const nightStart = isAfterMaghrib ? maghribToday : maghribYesterday;
    const nightEnd = isAfterMaghrib ? fajrTomorrow : fajrToday;
    const nightDurationMs = nightEnd.getTime() - nightStart.getTime();

    if (nightDurationMs > 0 && nightDurationMs < 18 * 3600000) {
      const lastThirdStart = new Date(nightEnd.getTime() - nightDurationMs / 3);
      if (nowDate >= lastThirdStart && nowDate < nightEnd) {
        return {
          id: `last_third_${nightEnd.getFullYear()}_${nightEnd.getMonth() + 1}_${nightEnd.getDate()}`,
          category: 'daily_sunnah',
          title: isEn ? 'Last Third of the Night' : 'الثلث الأخير من الليل',
          subtitle: isEn
            ? 'Blessed hour of divine descent • Qiyam prayer, Witr & sincere Dua'
            : 'وقت التنزّل الإلهي المبارك • غنيمة لصلاة القيام والوتر والدعاء المستجاب',
          actionLabel: isEn ? 'Duas' : 'الأدعية',
          targetPage: 'adia'
        };
      }
    }
  }

  return null;
}
