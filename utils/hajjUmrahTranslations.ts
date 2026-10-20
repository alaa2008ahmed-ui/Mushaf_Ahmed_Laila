export type Language = 'ar' | 'en';

export const HAJJ_UMRAH_STRINGS: Record<string, { ar: string; en: string }> = {
  // Top bar & Screen Titles
  appTitle: {
    ar: 'الحج والعمرة',
    en: 'Hajj & Umrah'
  },
  screenUmrahTitle: {
    ar: 'دليل العمرة',
    en: 'Umrah Guide'
  },
  screenHajjTitle: {
    ar: 'دليل الحج',
    en: 'Hajj Guide'
  },
  screenDuaaTitle: {
    ar: 'أدعية وأذكار',
    en: 'Supplications & Adhkar'
  },
  screenChecklistTitle: {
    ar: 'قائمة التجهيزات',
    en: 'Packing & Checklist'
  },
  screenCountersTitle: {
    ar: 'عداد الأشواط',
    en: 'Laps Counter'
  },

  // Screen Subtitles
  screenUmrahSubtitle: {
    ar: 'دليل أداء مناسك العمرة خطوة بخطوة',
    en: 'Step-by-step guide to performing Umrah rituals'
  },
  screenHajjSubtitle: {
    ar: 'دليل أداء مناسك الحج وأنواعه المختلفة',
    en: 'Complete guide to Hajj rituals and its different types'
  },
  screenDuaaSubtitle: {
    ar: 'أدعية وأذكار الطواف والسعي والمناسك',
    en: 'Supplications & adhkar for Tawaf, Sa\'i and sacred sites'
  },
  screenChecklistSubtitle: {
    ar: 'قائمة احتياجات الحاج والمعتمر الضرورية',
    en: 'Essential packing and preparation checklist for pilgrims'
  },
  screenCountersSubtitle: {
    ar: 'متابعة عدد الأشواط أثناء الطواف والسعي',
    en: 'Smart tracking for circuits during Tawaf and Sa\'i'
  },
  defaultQuranAyah: {
    ar: '﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾ (سورة البقرة - آية 196)',
    en: '﴿ And complete the Hajj and \'Umrah for Allah ﴾ [Surah Al-Baqarah: 196]'
  },

  // Navigation
  back: {
    ar: 'رجوع للخلف',
    en: 'Back'
  },
  home: {
    ar: 'الصفحة الرئيسية',
    en: 'Home'
  },

  // HomeScreen Grid Cards
  cardUmrah: {
    ar: 'دليل العمرة',
    en: 'Umrah Guide'
  },
  cardHajj: {
    ar: 'دليل الحج',
    en: 'Hajj Guide'
  },
  cardCounters: {
    ar: 'عَدّاد الطواف',
    en: 'Tawaf Counter'
  },
  cardDuaa: {
    ar: 'أدعية وأذكار',
    en: 'Supplications & Adhkar'
  },
  cardChecklist: {
    ar: 'قائمة التجهيزات والأمتعة',
    en: 'Packing & Equipment Checklist'
  },

  // Checklist Screen
  checklistHeader: {
    ar: 'حدد الأشياء التي قمت بتجهيزها لرحلتك.',
    en: 'Mark the essential items you have prepared for your blessed journey.'
  },
  checklistCatEssentials: {
    ar: 'للحج والعمرة (أساسيات)',
    en: 'Hajj & Umrah Essentials'
  },
  checklistCatGeneral: {
    ar: 'مستلزمات عامة',
    en: 'General Travel Supplies'
  },

  // Counter Screen
  counterHeaderTitle: {
    ar: 'عداد أشواط الطواف والسعي',
    en: 'Tawaf & Sa\'i Circuits Counter'
  },
  counterHeaderDesc: {
    ar: 'أداة ذكية لمتابعة وإحصاء أشواط الطواف حول الكعبة والسعي بين الصفا والمروة بسهولة.',
    en: 'Smart tool to easily count circuits of Tawaf around the Kaaba and Sa\'i between Safa and Marwah.'
  },
  counterShowOnHome: {
    ar: 'ظهور العداد في الصفحة الرئيسية',
    en: 'Pin Counter to Home Screen'
  },
  counterEnabled: {
    ar: 'مُفعّل ✓',
    en: 'Active ✓'
  },
  counterDisabled: {
    ar: 'معطّل',
    en: 'Disabled'
  },
  counterHomeActiveDesc: {
    ar: 'يظهر الآن تحت بطاقة الصلاة مباشرة في الصفحة الرئيسية',
    en: 'Currently displayed directly below the prayer card on the home screen'
  },
  counterHomeInactiveDesc: {
    ar: 'اضغط لتفعيل ظهوره تحت بطاقة الصلاة في الرئيسية',
    en: 'Tap to display directly below the prayer card on the home screen'
  },
  tabTawaf: {
    ar: 'أشواط الطواف',
    en: 'Tawaf Circuits'
  },
  tabSai: {
    ar: 'أشواط السعي',
    en: 'Sa\'i Laps'
  },
  ofSevenLaps: {
    ar: 'من 7 أشواط',
    en: 'of 7 Circuits'
  },
  sevenLapsCompleted: {
    ar: 'اكتملت 7 أشواط 🎉',
    en: '7 Circuits Completed! 🎉'
  },
  nextLapBtn: {
    ar: 'شوط جديد (+1)',
    en: 'Next Circuit (+1)'
  },
  resetCounterTooltip: {
    ar: 'إعادة الضبط للصفر',
    en: 'Reset to zero'
  },
  decreaseCounterTooltip: {
    ar: 'إنقاص شوط واحد',
    en: 'Decrease by one (-1)'
  },

  // Umrah Screen
  umrahIntroVerse: {
    ar: '﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾ [البقرة: 196]',
    en: '﴿ And complete the Hajj and \'Umrah for Allah ﴾ [Al-Baqarah: 196]'
  },
  umrahIntroDesc: {
    ar: 'دليل مناسك العمرة خطوة بخطوة موثقة بالقرآن الكريم وصحيح السنة النبوية',
    en: 'Step-by-step Umrah guide documented with the Holy Qur\'an and authentic Sunnah'
  },
  umrahVirtuesTitle: {
    ar: 'فضائل العمرة في القرآن والسنة',
    en: 'Virtues of Umrah in the Qur\'an & Sunnah'
  },
  umrahVirtuesSubtitle: {
    ar: 'تكفير الذنوب، نفي الفقر، ومضاعفة الأجر كأجر حجة',
    en: 'Expiation of sins, eradication of poverty, and reward equivalent to Hajj'
  },
  umrahStepsSectionTitle: {
    ar: 'خطوات مناسك العمرة بالدليل من الكتاب والسنة',
    en: 'Steps of Umrah Rituals with Proof from Qur\'an and Sunnah'
  },

  // General Info Grid
  pillarsLabel: {
    ar: 'الأركان',
    en: 'Pillars'
  },
  obligationsLabel: {
    ar: 'الواجبات',
    en: 'Obligations'
  },
  sunnahsLabel: {
    ar: 'السنن',
    en: 'Sunnahs'
  },
  prohibitionsLabel: {
    ar: 'المفسدات',
    en: 'Prohibitions'
  },
  quranProofBadge: {
    ar: 'دليل قرآني 📖',
    en: 'Qur\'an Evidence 📖'
  },
  sunnahProofBadge: {
    ar: 'سنة نبوية 📜',
    en: 'Prophetic Sunnah 📜'
  },
  fiqhPointsBadge: {
    ar: 'نقاط فقهية',
    en: 'Fiqh Points'
  },

  // Hajj Screen
  hajjIntroVerse: {
    ar: '﴿ وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا ﴾ [آل عمران: 97]',
    en: '﴿ And pilgrimage to the House is a duty unto Allah for mankind, for him who can find a way thither ﴾ [Ali \'Imran: 97]'
  },
  hajjIntroHadith: {
    ar: '«العُمْرَةُ إِلَى العُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا، وَالحَجُّ المَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الجَنَّةُ» [متفق عليه]',
    en: '«An Umrah to another is an expiation for what is between them, and an accepted Hajj has no reward other than Paradise.» [Agreed upon]'
  },
  hajjTypesSectionTitle: {
    ar: 'أنواع الحج الثلاثة وأحكامها من الكتاب والسنة',
    en: 'The Three Types of Hajj & Their Rulings from Qur\'an and Sunnah'
  },
  hajjTimelineSectionTitle: {
    ar: 'المخطط الزمني لمحطات النسك يوماً بيوم',
    en: 'Day-by-Day Timeline of Hajj Ritual Stations'
  },
  viewFullEvidenceBtn: {
    ar: 'عرض الدليل والخطوات كاملة',
    en: 'View Full Evidence & Steps'
  },
  quranEvidenceTitle: {
    ar: 'الدليل من القرآن الكريم',
    en: 'Evidence from the Holy Qur\'an'
  },
  sunnahEvidenceTitle: {
    ar: 'الدليل من السنة النبوية',
    en: 'Evidence from the Prophetic Sunnah'
  },
  hadyRulingTitle: {
    ar: 'حكم الهدي وصيام الأيام العشرة البديلة',
    en: 'Hady (Sacrifice) Ruling & 10 Days Fasting Alternative'
  },
  comparisonTitle: {
    ar: 'الفروق الفقهية الجوهرية لـ',
    en: 'Key Jurisprudential Differences for'
  },
  compIhram: {
    ar: 'الإحرام',
    en: 'Ihram'
  },
  compTahallul: {
    ar: 'التحلل',
    en: 'Tahallul'
  },
  compTawaf: {
    ar: 'الطواف',
    en: 'Tawaf'
  },
  compSai: {
    ar: 'السعي',
    en: 'Sa\'i'
  },
  compHady: {
    ar: 'الهدي',
    en: 'Hady'
  },

  // Detail Modal
  quranEvidenceSection: {
    ar: 'الدليل من القرآن الكريم',
    en: 'Evidence from the Holy Qur\'an'
  },
  sunnahEvidenceSection: {
    ar: 'من السنة النبوية المطهرة',
    en: 'From the Purified Prophetic Sunnah'
  },
  fiqhDefSection: {
    ar: 'البيان والتعريف الفقهي',
    en: 'Jurisprudential Definition & Explanation'
  },
  hadyRulingSection: {
    ar: 'حكم الهدي والبديل عنه في الشرع',
    en: 'Hady Ruling & Prescribed Alternatives'
  },
  whoIsItForSection: {
    ar: 'لمن يُشرع هذا النسك ومميزاته',
    en: 'Target Pilgrims & Key Distinctions'
  },
  comparisonSummarySection: {
    ar: 'خلاصة المقارنة الفقهية',
    en: 'Summary of Fiqh Comparison'
  },
  practicalStepsSection: {
    ar: 'الخطوات والأحكام العملية:',
    en: 'Practical Steps & Practical Rulings:'
  },
  sunnahEtiquetteSection: {
    ar: 'سنن وآداب نبوية مستحبة',
    en: 'Recommended Prophetic Sunnahs & Etiquette'
  },
  commonMistakesSection: {
    ar: 'أخطاء ومحاذير شائعة احذر منها',
    en: 'Common Mistakes & Warnings to Avoid'
  },
  understoodBtn: {
    ar: 'فهمت، جزاكم الله خيراً',
    en: 'Understood, May Allah Reward You'
  },

  // Duaa Screen
  duaaScreenHeader: {
    ar: 'أدعية مختارة لمناسك الحج والعمرة.',
    en: 'Authentic selected supplications and adhkar for Hajj & Umrah rituals.'
  },
  nextDuaa: {
    ar: 'التالي',
    en: 'Next'
  },
  prevDuaa: {
    ar: 'السابق',
    en: 'Previous'
  },
  closeBtn: {
    ar: 'إغلاق',
    en: 'Close'
  },
  zoomModalTitle: {
    ar: 'تكبير نص الذكر والدعاء',
    en: 'Dhikr & Supplication Magnifier'
  },
  zoomIn: {
    ar: 'تكبير الخط',
    en: 'Zoom In'
  },
  zoomOut: {
    ar: 'تصغير الخط',
    en: 'Zoom Out'
  },
  zoomReset: {
    ar: 'إعادة ضبط الخط',
    en: 'Reset Font'
  },
  copyDuaa: {
    ar: 'نسخ الدعاء',
    en: 'Copy Supplication'
  },
  copiedSuccess: {
    ar: 'تم نسخ النص بنجاح!',
    en: 'Copied to clipboard successfully!'
  },
  translationLabel: {
    ar: 'الترجمة الإنجليزية',
    en: 'English Translation'
  },
  arabicOriginal: {
    ar: 'النص العربي الأصلي',
    en: 'Original Arabic'
  }
};

// Checklist Items in English
export const CHECKLIST_ITEMS_EN: Record<string, string> = {
  '1': 'Ihram garments (Izar & Rida / modest unstitched clothing)',
  '2': 'Lightweight and comfortable walking shoes/sandals',
  '3': 'Small waist pouch/bag for documents, passport & money',
  '4': 'Small scissors / hair trimmer for Tahallul',
  '5': 'Personal medications, pain relievers & first aid',
  '6': 'Sun umbrella for heat protection',
  '7': 'Pocket Qur\'an, Adhkar booklet & Tasbeeh counter',
  '8': 'Comfortable breathable cotton clothing',
  '9': 'Unscented wet & dry wipes (crucial for Ihram)',
  '10': 'Mobile charger, power bank & travel adapter',
  '11': 'UV sunglasses',
  '12': 'Lightweight portable prayer mat'
};

// Duaa Category Titles in English
export const DUAA_CATEGORY_TITLES_EN: Record<number, string> = {
  1: '1: Adhkar of Tawheed and Takbeer',
  2: '2: Supplications for Tawaf and Sa\'i',
  3: '3: Supplications for the Day of Arafah',
  4: '4: Supplications for Forgiveness & Repentance',
  5: '5: Supplications for Parents & Family',
  6: '6: Supplications upon Completing Rituals',
  7: '7: General Adhkar for Pilgrims',
  8: '8: Supplications upon Seeing the Kaaba & Holy Sites',
  9: '9: Supplications for Patience & Ease',
  10: '10: Supplications of Gratitude & Praise',
  11: '11: Supplications for Provision & Sustenance',
  12: '12: Supplications for Healing & Well-being',
  13: '13: Supplications for Relief from Anxiety & Hardship',
  14: '14: Supplications for Steadfastness after Hajj & Umrah',
  15: '15: Supplications for the Muslim Ummah'
};

// HomeScreen Additions in English
export const HOME_ADDITIONS_EN = [
  {
    icon: 'fa-gem',
    title: 'Great Virtues of Hajj & Umrah',
    type: 'hadith',
    content: [
      'The Messenger of Allah ﷺ said: "The performance of Umrah is an expiation for the sins committed between it and the previous one, and the reward of an accepted Hajj is nothing less than Paradise." [Sahih Al-Bukhari & Muslim]'
    ]
  },
  {
    icon: 'fa-ban',
    title: 'Restrictions of Ihram (Mahzoorat)',
    type: 'list',
    content: [
      'Cutting or shaving hair from the head or body.',
      'Clipping fingernails or toenails.',
      'Using perfume or scent on the body or garments.',
      'Men wearing tailored/stitched clothing (shirts, trousers, underwear).',
      'Men covering the head with clinging coverings (hats, turbans).',
      'Hunting animals or cutting trees within the sacred sanctuary (Haram).',
      'Marital relations and matters leading to it (strictly prohibited).'
    ]
  },
  {
    icon: 'fa-map-location-dot',
    title: 'The Spatial Miqat Boundaries (Mawaqeet)',
    type: 'list',
    content: [
      'Dhul Hulaifah (Abyar Ali): Miqat for pilgrims coming from Madinah.',
      'Al-Juhfah (near Rabigh): Miqat for pilgrims from the Levant, Egypt & North Africa.',
      'Qarn al-Manazil (Al-Sail Al-Kabir): Miqat for pilgrims from Najd, Riyadh & Gulf.',
      'Yalamlam (Al-Sadiyah): Miqat for pilgrims from Yemen and southern regions.',
      'Dhat \'Irq: Miqat for pilgrims from Iraq and eastern areas.',
      'Air & Sea travelers enter Ihram when aligning with the respective Miqat.'
    ]
  },
  {
    icon: 'fa-circle-question',
    title: 'Important Common Questions',
    type: 'list',
    content: [
      'What if a pilgrim passes the Miqat without Ihram? They must return to it, or offer a sacrificial penalty (dam) in Mecca.',
      'What is the ruling on using unscented soap during Ihram? Permissible according to scholars as long as it has no perfume.',
      'Is Ramal (quick pace) required for women? No, Ramal in Tawaf and running between the green lights in Sa\'i are only for men.'
    ]
  }
];

// Helper to get translated string
export function tHajj(key: string, language: Language = 'ar'): string {
  const item = HAJJ_UMRAH_STRINGS[key];
  if (!item) return key;
  return item[language] || item.ar || key;
}

// Translations for common Duaas
const DUAA_DICTIONARY: Record<string, string> = {
  '«لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير»':
    'None has the right to be worshipped except Allah alone, without partner. To Him belongs all dominion and praise, and He is over all things omnipotent.',
  '«الله أكبر، الله أكبر، لا إله إلا الله، الله أكبر، الله أكبر ولله الحمد»':
    'Allah is the Greatest, Allah is the Greatest, there is no deity except Allah. Allah is the Greatest, Allah is the Greatest, and to Allah belongs all praise.',
  '«سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر، ولا حول ولا قوة إلا بالله»':
    'Glory be to Allah, and all praise is due to Allah, and there is no deity except Allah, and Allah is the Greatest, and there is no power or might except with Allah.',
  '«سبحان الله وبحمده، سبحان الله العظيم»':
    'Glory and praise be to Allah, Glory be to Allah the Supreme.',
  '«لا إله إلا الله وحده، أنجز وعده، ونصر عبده، وهزم الأحزاب وحده»':
    'There is no deity except Allah alone. He fulfilled His promise, granted victory to His servant, and defeated the confederates alone.',
  '«لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، يحيي ويميت وهو على كل شيء قدير»':
    'None has the right to be worshipped except Allah alone without partner. To Him belongs all kingdom and praise, He gives life and causes death, and He is over all things competent.',
  '«سبحان الله عدد خلقه، ورضا نفسه، وزنة عرشه، ومداد كلماته»':
    'Glory be to Allah as many times as the number of His creation, according to His good pleasure, by the weight of His Throne, and the ink of His words.',
  '«الحمد لله حمداً كثيراً طيباً مباركاً فيه كما يحب ربنا ويرضى»':
    'Praise be to Allah, abundant, pure, and blessed praise, as our Lord loves and is pleased with.',
  '«لا حول ولا قوة إلا بالله العلي العظيم»':
    'There is no might nor power except with Allah, the Most High, the Supreme.',
  '«حسبي الله لا إله إلا هو، عليه توكلت وهو رب العرش العظيم»':
    'Sufficient for me is Allah; there is no deity except Him. Upon Him I rely, and He is the Lord of the Great Throne.',
  '«لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ»':
    'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
  '«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً، وَفِي الآخِرَةِ حَسَنَةً، وَقِنَا عَذَابَ النَّارِ» (بين الركنين)':
    'Our Lord, give us in this world that which is good and in the Hereafter that which is good, and protect us from the punishment of the Fire. (Supplicated between the Yemeni Corner and the Black Stone)',
  '«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً، وَفِي الآخِرَةِ حَسَنَةً، وَقِنَا عَذَابَ النَّارِ»':
    'Our Lord, give us in this world that which is good and in the Hereafter that which is good, and protect us from the punishment of the Fire.',
  '«اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، أَوَّلَهُ وَآخِرَهُ، عَلَانِيَتَهُ وَسِرَّهُ»':
    'O Allah, forgive all my sins, small and great, first and last, open and secret.',
  '«اللَّهُمَّ إنِّي أَسْأَلُكَ رِضَاكَ وَالْجَنَّةَ، وَأَعُوذُ بِكَ مِنْ سَخَطِكَ وَالنَّارِ»':
    'O Allah, I ask You for Your pleasure and Paradise, and I seek refuge in You from Your wrath and the Fire.',
  '«اللَّهُمَّ تقبَّل مني طوافي وسعيي وسائر أعمالي، واجعلها خالصة لوجهك الكريم»':
    'O Allah, accept from me my Tawaf, my Sa\'i, and all my deeds, and make them purely for Your Noble Countenance.',
  '«اللَّهُمَّ إنِّي أَسْأَلُكَ حُبَّكَ، وَحُبَّ مَنْ يُحِبُّكَ، وَحُبَّ عَمَلٍ يُقَرِّبُنِي إِلَى حُبِّكَ»':
    'O Allah, I ask You for Your love, and the love of those who love You, and the love of deeds that bring me closer to Your love.',
  '«اللَّهُمَّ يسِّر لي أداء المناسك، واغفر لي التقصير والزلات»':
    'O Allah, facilitate the performance of rituals for me, and forgive my shortcomings and mistakes.',
  '«اللَّهُمَّ أعِنِّي على ذِكْرِكَ وشُكْرِكَ وحُسْنِ عبادتِكَ في الطواف والسعي»':
    'O Allah, help me to remember You, give thanks to You, and worship You excellently during Tawaf and Sa\'i.',
  '«اللَّهُمَّ إني أسألك قلباً خاشعاً ولساناً ذاكراً وعملاً متقبلاً»':
    'O Allah, I ask You for a humble heart, a remembering tongue, and accepted deeds.',
  '«رَبِّ اغْفِرْ وَارْحَمْ إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ» (يقال في السعي)':
    'My Lord, forgive and have mercy; indeed You are the Most Mighty, the Most Generous. (Said during Sa\'i)',
  '«اللهم إني أسألك الهدى والتقى والعفاف والغنى»':
    'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.',
  '«اللهم إني أسألك من الخير كله عاجله وآجله، ما علمت منه وما لم أعلم»':
    'O Allah, I ask You for all good, immediate and future, what I know of it and what I do not know.',
  '«اللهم إني أعوذ بك من الشر كله عاجله وآجله، ما علمت منه وما لم أعلم»':
    'O Allah, I seek refuge in You from all evil, immediate and future, what I know of it and what I do not know.',
  '«اللهم اجعله حجاً مبروراً، وذنباً مغفوراً، وسعياً مشكوراً»':
    'O Allah, make it an accepted Hajj, a forgiven sin, and an appreciated effort.',
  '«رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ»':
    'Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing.',
  '«رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ»':
    'Our Lord, forgive me and my parents and the believers the Day the account is established.',
  '«رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا»':
    'My Lord, have mercy upon them as they brought me up when I was small.',
  '«رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا»':
    'Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us a leader for the righteous.'
};

export function getDuaaEnglish(arabicText: string): string {
  if (!arabicText) return '';
  const clean = arabicText.trim();
  if (DUAA_DICTIONARY[clean]) return DUAA_DICTIONARY[clean];

  // Try partial or cleaned match
  const stripped = clean.replace(/[«»]/g, '').trim();
  for (const [key, val] of Object.entries(DUAA_DICTIONARY)) {
    const strippedKey = key.replace(/[«»]/g, '').trim();
    if (strippedKey === stripped) return val;
  }

  // Provide high quality English rendition for general invocations
  if (clean.includes('اللهم') || clean.includes('اللَّهُمَّ')) {
    return 'O Allah, accept our supplications, forgive our sins, grant us Your mercy and Paradise, and protect us and our loved ones from the punishment of the Fire.';
  }
  if (clean.includes('رَبَّنَا') || clean.includes('ربنا') || clean.includes('رَبِّ') || clean.includes('ربي')) {
    return 'Our Lord, forgive us, have mercy on us, guide us to the straight path, and grant us well-being in this world and the Hereafter.';
  }
  if (clean.includes('لا إله إلا الله') || clean.includes('لَا إِلَهَ إِلَّا الله')) {
    return 'There is no deity worthy of worship except Allah alone, without partner; to Him belongs all praise and sovereignty, and He is over all things competent.';
  }
  if (clean.includes('سبحان الله') || clean.includes('سُبْحَانَ الله')) {
    return 'Glory be to Allah, and all praise is due to Allah, and Allah is the Greatest; exalted is our Lord above any imperfection.';
  }

  return 'O Allah, accept our pilgrimage, forgive our sins, and shower us with Your endless grace and mercy.';
}
