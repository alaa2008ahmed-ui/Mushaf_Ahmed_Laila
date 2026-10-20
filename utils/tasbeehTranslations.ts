export type Language = 'ar' | 'en';

export const TASBEEH_STRINGS: Record<string, { ar: string; en: string }> = {
  // Top bar
  title: {
    ar: 'السبحة الإلكترونية',
    en: 'Electronic Tasbeeh'
  },
  subtitle: {
    ar: 'أضف أذكارك الخاصة وتتبع تسبيحك بدقة',
    en: 'Custom Dhikr counter & spiritual remembrance'
  },
  back: {
    ar: 'رجوع للخلف',
    en: 'Back'
  },
  home: {
    ar: 'الصفحة الرئيسية',
    en: 'Home'
  },

  // Target Banner
  targetLabel: {
    ar: 'الهدف:',
    en: 'Target:'
  },
  targetReachedBanner: {
    ar: 'تم الوصول للهدف! 🎉',
    en: 'Target Reached! 🎉'
  },
  targetOpen: {
    ar: 'مفتوح',
    en: 'Unlimited'
  },

  // Counter button subtext
  tapToCount: {
    ar: 'اضغط للعد',
    en: 'Tap to count'
  },
  resetToStart: {
    ar: 'قم بالتصفير للبدء',
    en: 'Reset to start'
  },
  resetPrompt: {
    ar: 'قم بالتصفير',
    en: 'Reset'
  },
  beadsTapOrSwipe: {
    ar: 'اسحب أو اضغط للعد',
    en: 'Swipe or tap to count'
  },

  // 3D Action buttons (with aliases)
  reset: {
    ar: 'تصفير',
    en: 'Reset'
  },
  resetBtn: {
    ar: 'تصفير',
    en: 'Reset'
  },
  editTarget: {
    ar: 'تعديل الهدف',
    en: 'Set Target'
  },
  setTargetBtn: {
    ar: 'تعديل الهدف',
    en: 'Set Target'
  },

  // Quick action buttons
  add: {
    ar: 'إضافة',
    en: 'Add'
  },
  addBtn: {
    ar: 'إضافة',
    en: 'Add'
  },
  delete: {
    ar: 'حذف',
    en: 'Delete'
  },
  deleteBtn: {
    ar: 'حذف',
    en: 'Delete'
  },
  color: {
    ar: 'لون العداد',
    en: 'Color'
  },
  colorBtn: {
    ar: 'لون العداد',
    en: 'Color'
  },
  skin: {
    ar: 'شكل العداد',
    en: 'Skin'
  },
  skinBtn: {
    ar: 'شكل العداد',
    en: 'Skin'
  },
  chart: {
    ar: 'الرسم البياني',
    en: 'Chart'
  },
  chartBtn: {
    ar: 'الرسم البياني',
    en: 'Chart'
  },

  // Chart Banner Card
  chartTitle: {
    ar: 'الرسم البياني وتطور التسبيح',
    en: 'Tasbeeh Chart & Progress'
  },
  chartCardTitle: {
    ar: 'الرسم البياني وتطور التسبيح',
    en: 'Tasbeeh Chart & Progress'
  },
  weeklyMonthly: {
    ar: 'أسبوعي وشهري',
    en: 'Weekly & Monthly'
  },
  chartCardSubtitle: {
    ar: 'أسبوعي وشهري',
    en: 'Weekly & Monthly'
  },

  // Toast Messages
  targetReached: {
    ar: 'تم الوصول للهدف!',
    en: 'Target reached!'
  },
  targetReachedToast: {
    ar: 'تم الوصول للهدف!',
    en: 'Target reached!'
  },
  cannotAddEmpty: {
    ar: 'لا يمكن إضافة ذكر فارغ.',
    en: 'Cannot add an empty dhikr.'
  },
  cannotAddEmptyDhikr: {
    ar: 'لا يمكن إضافة ذكر فارغ.',
    en: 'Cannot add an empty dhikr.'
  },
  phraseExists: {
    ar: 'هذا الذكر موجود بالفعل.',
    en: 'This dhikr already exists.'
  },
  dhikrAlreadyExists: {
    ar: 'هذا الذكر موجود بالفعل.',
    en: 'This dhikr already exists.'
  },
  phraseAdded: {
    ar: 'تم إضافة الذكر بنجاح.',
    en: 'Dhikr added successfully.'
  },
  dhikrAddedSuccess: {
    ar: 'تم إضافة الذكر بنجاح.',
    en: 'Dhikr added successfully.'
  },
  phraseDeleted: {
    ar: 'تم حذف الذكر بنجاح.',
    en: 'Dhikr deleted successfully.'
  },
  dhikrDeletedSuccess: {
    ar: 'تم حذف الذكر بنجاح.',
    en: 'Dhikr deleted successfully.'
  },
  colorChanged: {
    ar: 'تم تغيير لون العداد.',
    en: 'Counter color updated.'
  },
  counterColorUpdated: {
    ar: 'تم تغيير لون العداد.',
    en: 'Counter color updated.'
  },
  skinChanged: {
    ar: 'تم تغيير شكل السبحة.',
    en: 'Tasbeeh style updated.'
  },
  tasbeehSkinUpdated: {
    ar: 'تم تغيير شكل السبحة.',
    en: 'Tasbeeh style updated.'
  },

  // Modals
  // 1. Target Modal
  targetModalTitle: {
    ar: 'تعيين الهدف',
    en: 'Set Target'
  },
  setTargetModalTitle: {
    ar: 'تعيين الهدف',
    en: 'Set Target'
  },
  targetModalDesc: {
    ar: 'أدخل العدد المستهدف (مثل 33). أدخل 0 للإلغاء.',
    en: 'Enter target count (e.g. 33). Enter 0 for unlimited.'
  },
  setTargetModalDesc: {
    ar: 'أدخل العدد المستهدف (مثل 33). أدخل 0 للإلغاء.',
    en: 'Enter target count (e.g. 33). Enter 0 for unlimited.'
  },
  cancel: {
    ar: 'إلغاء',
    en: 'Cancel'
  },
  save: {
    ar: 'حفظ',
    en: 'Save'
  },

  // 2. Add Modal
  addModalTitle: {
    ar: 'إضافة تسبيح',
    en: 'Add Dhikr'
  },
  addDhikrModalTitle: {
    ar: 'إضافة تسبيح',
    en: 'Add Dhikr'
  },
  addModalPlaceholder: {
    ar: 'اكتب الذكر هنا...',
    en: 'Write dhikr here...'
  },
  addDhikrPlaceholder: {
    ar: 'اكتب الذكر هنا...',
    en: 'Write dhikr here...'
  },

  // 3. Delete Modal
  deleteModalTitle: {
    ar: 'حذف تسبيح',
    en: 'Delete Dhikr'
  },
  deleteDhikrModalTitle: {
    ar: 'حذف تسبيح',
    en: 'Delete Dhikr'
  },
  noPhrasesToDelete: {
    ar: 'لا يوجد أذكار لحذفها.',
    en: 'No dhikr available to delete.'
  },
  noDhikrToDelete: {
    ar: 'لا يوجد أذكار لحذفها.',
    en: 'No dhikr available to delete.'
  },
  close: {
    ar: 'إغلاق',
    en: 'Close'
  },

  // 4. Color Modal
  colorModalTitle: {
    ar: 'اختر لون العداد',
    en: 'Select Counter Color'
  },

  // 5. Skin Modal
  skinsModalTitle: {
    ar: 'اختر شكل السبحة',
    en: 'Select Tasbeeh Style'
  },
  skinModalTitle: {
    ar: 'اختر شكل السبحة',
    en: 'Select Tasbeeh Style'
  },
  skinModern: {
    ar: 'عداد حديث',
    en: 'Modern Counter'
  },
  modernSkin: {
    ar: 'عداد حديث',
    en: 'Modern Counter'
  },
  skinClassic: {
    ar: 'عداد كلاسيكي',
    en: 'Classic Counter'
  },
  classicSkin: {
    ar: 'عداد كلاسيكي',
    en: 'Classic Counter'
  },
  skinBeads: {
    ar: 'حبات المسبحة',
    en: 'Prayer Beads'
  },
  beadsSkin: {
    ar: 'حبات المسبحة',
    en: 'Prayer Beads'
  },

  // Chart Modal Full Screen
  chartModalTitle: {
    ar: 'مخطط التسبيح',
    en: 'Tasbeeh Analytics'
  },
  weeklyTab: {
    ar: 'أسبوعي (آخر ٧ أيام)',
    en: 'Weekly (Last 7 Days)'
  },
  monthlyTab: {
    ar: 'شهري (آخر ٣٠ يوماً)',
    en: 'Monthly (Last 30 Days)'
  },
  totalSummary: {
    ar: 'الإجمالي',
    en: 'Total'
  },
  tasbeehUnit: {
    ar: 'تسبيحة',
    en: 'Tasbeeh'
  },
  dailyAverage: {
    ar: 'المتوسط اليومي',
    en: 'Daily Average'
  },
  tasbeehPerDay: {
    ar: 'تسبيحة / يوم',
    en: 'Tasbeeh / day'
  },
  peakDay: {
    ar: 'أعلى يوم',
    en: 'Peak Day'
  },
  todayLabel: {
    ar: 'اليوم',
    en: 'Today'
  },
  currentBadge: {
    ar: 'الحالي',
    en: 'Current'
  },
  clickBarHint: {
    ar: 'انقر على أي عمود لعرض تفاصيل ذلك اليوم',
    en: 'Tap on any bar to inspect day details'
  },
  dailyLogTitle: {
    ar: 'سجل التسبيح يوماً بيوم',
    en: 'Daily Remembrance Log'
  },
  sevenDaysBadge: {
    ar: '٧ أيام',
    en: '7 Days'
  },
  thirtyDaysBadge: {
    ar: '٣٠ يوماً',
    en: '30 Days'
  }
};

export interface LocalizedPhrase {
  id: number;
  ar: string;
  en: string;
}

export const DEFAULT_PHRASES_LOCALIZED: LocalizedPhrase[] = [
  {
    id: 1,
    ar: "سبحان الله",
    en: "Subhan Allah (Glory be to Allah)"
  },
  {
    id: 2,
    ar: "الحمد لله",
    en: "Alhamdulillah (All praise is due to Allah)"
  },
  {
    id: 3,
    ar: "الله أكبر",
    en: "Allahu Akbar (Allah is the Greatest)"
  },
  {
    id: 4,
    ar: "لا حول ولا قوة إلا بالله",
    en: "La hawla wa la quwwata illa billah (No power or might except with Allah)"
  },
  {
    id: 5,
    ar: "أستغفر الله العظيم",
    en: "Astaghfirullah al-Azeem (I seek forgiveness from Allah the Almighty)"
  },
  {
    id: 6,
    ar: "لا إله إلا أنت سبحانك إني كنت من الظالمين",
    en: "La ilaha illa Anta, Subhanaka (There is no deity except You; exalted are You)"
  },
  {
    id: 7,
    ar: "سبحان الله وبحمده، سبحان الله العظيم",
    en: "Subhan Allahi wa bihamdihi, Subhan Allahil-Azeem (Glory & praise to Allah, the Supreme)"
  },
  {
    id: 8,
    ar: "اللهم صل وسلم على نبينا محمد",
    en: "Allahumma salli wa sallim 'ala Muhammad (O Allah, bestow peace upon Muhammad)"
  }
];

export function getPhraseDisplay(text: string, language: Language = 'ar'): string {
  if (!text) return '';
  if (language === 'ar') return text;

  const matched = DEFAULT_PHRASES_LOCALIZED.find(p => p.ar.trim() === text.trim());
  if (matched) return matched.en;
  return text;
}

export function tTasbeeh(key: string, language: Language = 'ar'): string {
  const item = TASBEEH_STRINGS[key];
  if (!item) return key;
  return item[language] || item.ar || key;
}

export function formatTasbeehNumber(num: number | string | null | undefined, language: Language = 'ar'): string {
  if (num === null || num === undefined) return '';
  const str = String(num);
  if (language === 'en') {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d)));
  }
  return str.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}
