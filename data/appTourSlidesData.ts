export interface TourExportCardItem {
  titleAr: string;
  titleEn: string;
  subAr: string;
  subEn: string;
  badgeAr?: string;
  badgeEn?: string;
}

export interface TourSlide {
  id: string;
  page: string;
  navParams?: Record<string, any>;
  icon: string;
  accentColor: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: [string, string, string];
  featuresEn: [string, string, string];
  exportPreview: {
    headerAr: string;
    headerEn: string;
    heroTitleAr: string;
    heroTitleEn: string;
    heroSubAr: string;
    heroSubEn: string;
    items: TourExportCardItem[];
  };
}

export const APP_TOUR_SLIDES: TourSlide[] = [
  {
    id: 'home',
    page: 'home',
    icon: 'fa-house',
    accentColor: '#ca8a04',
    titleAr: 'الشاشة الرئيسية',
    titleEn: 'Home Screen',
    categoryAr: 'لوحة التحكم السريعة',
    categoryEn: 'Quick Dashboard',
    descriptionAr:
      'واجهة رئيسية مجسمة تجمع مواقيت الصلاة المباشرة، تقدم الورد ومربّي العبادات، الأذكار اليومية، والتنقل الذكي إلى جميع أقسام التطبيق بلمسة واحدة.',
    descriptionEn:
      'A Soft 3D dashboard uniting live prayer countdowns, Daily Wird & Worship Habit progress, daily Adhkar cards, and instant smart navigation across every feature.',
    featuresAr: [
      'بطاقات مجسمة حية للصلوات مع العد التنازلي المتبقي للصلاة القادمة',
      'متابعة الورد اليومي ومربي العبادات وعدّاد الطواف والتسبيح السريع',
      'تخصيص ترتيب الأزرار والاختصارات والثيمات النهارية والليلية بحرية كاملة',
    ],
    featuresEn: [
      'Live 3D prayer cards with real-time countdown to the next Salah',
      'Integrated Daily Wird, Worship Habit Tracker, Tawaf & quick Tasbeeh cards',
      'Drag-and-drop shortcut customization with Day & OLED Night themes',
    ],
    exportPreview: {
      headerAr: 'مُصْحَفُ أَحْمَدَ وَلَيْلَى',
      headerEn: 'Mushaf Ahmed & Laila',
      heroTitleAr: 'الصلاة القادمة: العصر • متبقي ٠١:٤٢:١٨',
      heroTitleEn: 'Next Prayer: Asr • 01:42:18 Remaining',
      heroSubAr: 'الخميس ١٥ رمضان ١٤٤٧ هـ • نظام التصميم المجسم',
      heroSubEn: 'Thursday 15 Ramadan 1447 AH • Soft 3D UI',
      items: [
        { titleAr: 'القرآن الكريم', titleEn: 'The Noble Qur\'an', subAr: 'متابعة القراءة من سورة البقرة', subEn: 'Resume reading Surah Al-Baqarah', badgeAr: 'القراءة', badgeEn: 'Read' },
        { titleAr: 'مربّي العبادات', titleEn: 'Worship Habit Tracker', subAr: 'إنجاز اليوم ٨٥٪ • سلسلة ١٤ يوماً', subEn: '85% Today • 14-day streak', badgeAr: 'متابعة', badgeEn: 'Track' },
        { titleAr: 'الورد اليومي والأذكار', titleEn: 'Daily Wird & Adhkar', subAr: 'ورد اليوم: ٤ صفحات متبقية', subEn: 'Today\'s Wird: 4 pages left', badgeAr: 'نشط', badgeEn: 'Active' },
      ],
    },
  },
  {
    id: 'quran-mushaf',
    page: 'quran',
    navParams: { readingMode: 'mushaf', page: 1, surah: 1, ayah: 1 },
    icon: 'fa-book-quran',
    accentColor: '#b45309',
    titleAr: 'المصحف الشريف والقراءة',
    titleEn: 'Quran Reader (Mushaf)',
    categoryAr: 'الرسم العثماني والتلاوة',
    categoryEn: 'Uthmani Script & Audio',
    descriptionAr:
      'تجربة مصحف رقمي متكاملة بالرسم العثماني وخطوط الطباعة الأصيلة مع تلاوة كبار القراء، التمرير التلقائي الهادئ، العلامات المرجعية، والبحث الفوري.',
    descriptionEn:
      'Authentic Uthmani Mushaf experience featuring crisp classic calligraphy, renowned Qari recitations, smooth hands-free auto-scroll, bookmarks, and instant ayah search.',
    featuresAr: [
      'عرض صفحات المصحف الشريف بالرسم العثماني وتشكيل وتجويد ملوّن',
      'تلاوة صوتية متزامنة مع تظليل الآية والتحميل للاستماع دون إنترنت',
      'بحث فوري في السور والآيات مع علامات مرجعية وتمرير تلقائي مرن',
    ],
    featuresEn: [
      'Authentic 604-page Uthmani Mushaf with optional color-coded Tajweed',
      'Synchronized ayah-by-ayah recitation with offline audio downloads',
      'Instant verse search, smart bookmarks, and adjustable auto-scroll',
    ],
    exportPreview: {
      headerAr: 'سورة الفاتحة • الصفحة ١ • الجزء ١',
      headerEn: 'Surah Al-Fatihah • Page 1 • Juz 1',
      heroTitleAr: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾',
      heroTitleEn: 'In the name of Allah, the Entirely Merciful, the Especially Merciful',
      heroSubAr: 'الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾',
      heroSubEn: 'The Sovereign of the Day of Recompense. It is You we worship and ask for help.',
      items: [
        { titleAr: 'تلاوة الشيخ المنشاوي', titleEn: 'Reciter: Al-Minshawi', subAr: 'تشغيل التلاوة مع تظليل الآية', subEn: 'Play audio with verse highlight', badgeAr: 'صوت', badgeEn: 'Audio' },
        { titleAr: 'خط المصحف العثماني', titleEn: 'Uthmani Script & Tajweed', subAr: 'تحكم كامل بالحجم والثيمات', subEn: 'Custom font size & reading themes', badgeAr: 'خطوط', badgeEn: 'Fonts' },
        { titleAr: 'البحث والعلامات المرجعية', titleEn: 'Search & Bookmarks', subAr: 'وصول لحظي لأي آية أو جزء', subEn: 'Jump directly to any ayah or juz', badgeAr: 'فوري', badgeEn: 'Instant' },
      ],
    },
  },
  {
    id: 'prayer-times',
    page: 'prayer-times',
    icon: 'fa-mosque',
    accentColor: '#0284c7',
    titleAr: 'مواقيت الصلاة ومسار الشمس',
    titleEn: 'Prayer Times & Sun Path',
    categoryAr: 'المواقيت الفلكية والخشوع',
    categoryEn: 'Salah & Khushoo Mode',
    descriptionAr:
      'عرض مجسم دقيق لأوقات الصلوات الخمس مع مسار الشمس المرئي الحي، تنبيهات الأذان والإقامة، وضع الخشوع الصامت التلقائي، وحساب صلاة الضحى وثلث الليل.',
    descriptionEn:
      'Precision 3D prayer timetable featuring a live visual Sun Path arc, Adhan & Iqama alerts, automatic Khushoo silent mode during prayer, plus Duha and last third of the night.',
    featuresAr: [
      'مسار الشمس المرئي التفاعلي مع بطاقات مجسمة متوهجة للصلاة النشطة',
      'وضع الخشوع الصامت التلقائي لإسكات الهاتف أثناء الصلاة واستعادته بعدها',
      'مواقيت النوافل الدقيقة: بداية ونهاية الضحى، منتصف الليل، والثلث الأخير',
    ],
    featuresEn: [
      'Interactive visual Sun Path arc with glowing 3D cards for current prayer',
      'Automatic Khushoo silent mode muting device alerts during congregation',
      'Calculated Sunnah timings: Duha window, Midnight, and Last Third of Night',
    ],
    exportPreview: {
      headerAr: 'مواقيت الصلاة • مسار الشمس الحي',
      headerEn: 'Prayer Times • Live Sun Path',
      heroTitleAr: 'الفجر ٠٤:٣٢ ص • الظهر ١٢:٠٨ م • العصر ٣:٣٤ م',
      heroTitleEn: 'Fajr 04:32 AM • Dhuhr 12:08 PM • Asr 03:34 PM',
      heroSubAr: 'المغرب ٦:١٥ م • العشاء ٧:٣٨ م • مسار الشمس مضيء ٦٢٪',
      heroSubEn: 'Maghrib 06:15 PM • Isha 07:38 PM • Sun Arc 62% Complete',
      items: [
        { titleAr: 'وضع الخشوع الصامت التلقائي', titleEn: 'Auto Silent (Khushoo)', subAr: 'كتم تلقائي ٢٥ دقيقة عند الإقامة', subEn: 'Auto-mute for 25 min from Iqama', badgeAr: 'مفعّل', badgeEn: 'Active' },
        { titleAr: 'مواقيت الضحى والقيام', titleEn: 'Duha & Qiyam Windows', subAr: 'الضحى: ٤:٥٠ ص – ١١:٥٨ ص', subEn: 'Duha: 04:50 AM – 11:58 AM', badgeAr: 'نوافل', badgeEn: 'Sunnah' },
        { titleAr: 'تنبيهات الأذان والإقامة', titleEn: 'Adhan & Iqama Alerts', subAr: 'اختيار المؤذن وتوقيت الإقامة لكل فرض', subEn: 'Custom Muadhin & per-prayer alerts', badgeAr: 'أذان', badgeEn: 'Alerts' },
      ],
    },
  },
  {
    id: 'qibla',
    page: 'qibla',
    icon: 'fa-compass',
    accentColor: '#0d9488',
    titleAr: 'اتجاه القبلة (٥ طرق دقيقة)',
    titleEn: 'Qibla Compass (5 Methods)',
    categoryAr: 'تحديد القبلة الفلكي والميداني',
    categoryEn: '5-Method Qibla Precision',
    descriptionAr:
      'أدق منظومة لتحديد اتجاه الكعبة المشرفة بخمس طرق علمية وميدانية متكاملة تعمل حتى في أصعب الظروف المغناطيسية مع المسافة والزاوية الفلكية.',
    descriptionEn:
      'Complete Qibla locator combining 5 astronomical and field methods—ensuring pin-point Kaaba alignment even near magnetic interference, complete with bearing and distance.',
    featuresAr: [
      'بوصلة حساسة ثلاثية الأبعاد + خريطة تفاعلية مباشرة نحو الكعبة المشرفة',
      'تحديد القبلة عبر الشمس والظل في اللحظة الحالية بدقة فلكية عالية',
      'وضع الواقع المعزز (AR) عبر الكاميرا لإسقاط مسار القبلة أمامك مباشرة',
    ],
    featuresEn: [
      '3D magnetic Compass + interactive Map line straight to the Holy Kaaba',
      'Real-time Sun alignment & Shadow-casting astronomical Qibla verification',
      'Live Camera Augmented Reality (AR) overlay pointing toward Makkah',
    ],
    exportPreview: {
      headerAr: 'اتجاه القبلة • ١٣٦° جنوب شرق',
      headerEn: 'Qibla Direction • 136° SE',
      heroTitleAr: 'المسافة إلى الكعبة المشرفة: ١٬٢٩٤ كم',
      heroTitleEn: 'Distance to Holy Kaaba: 1,294 km',
      heroSubAr: '٥ طرق ذكية: البوصلة • الخريطة • الشمس • الواقع المعزز • الظل',
      heroSubEn: '5 Methods: Compass • Map • Sun • AR Camera • Shadow',
      items: [
        { titleAr: '١. البوصلة المغناطيسية ٢. الخريطة', titleEn: '1. Compass & 2. Live Map', subAr: 'اهتزاز وتنبيه عند المطابقة التامة', subEn: 'Haptic confirmation on exact alignment', badgeAr: 'دقيق', badgeEn: 'Exact' },
        { titleAr: '٣. تحديد القبلة بالشمس ٤. بالظل', titleEn: '3. Sun & 4. Shadow Vector', subAr: 'يعمل بدون تأثر بالمجال المغناطيسي', subEn: 'Immune to magnetic distortion', badgeAr: 'فلكي', badgeEn: 'Solar' },
        { titleAr: '٥. الواقع المعزز بالكاميرا (AR)', titleEn: '5. Augmented Reality (AR)', subAr: 'رؤية مؤشر الكعبة عبر العدسة', subEn: 'Visual direction marker in camera view', badgeAr: 'AR', badgeEn: 'AR' },
      ],
    },
  },
  {
    id: 'tasbeeh',
    page: 'tasbeeh',
    icon: 'fa-kaaba',
    accentColor: '#7c3aed',
    titleAr: 'المسبحة الإلكترونية (٦ نماذج مجسمة)',
    titleEn: 'Electronic Tasbih (6 3D Models)',
    categoryAr: 'الذكر والتسبيح التفاعلي',
    categoryEn: 'Interactive 3D Dhikr',
    descriptionAr:
      'مسبحة إلكترونية فاخرة تضم ٦ تصاميم مجسمة واقعية (خاتم، سبحة دائرية، عداد كلاسيكي وغيرها) مع مؤثرات صوتية وحسية مريحة وإحصائيات شاملة.',
    descriptionEn:
      'Tactile Electronic Tasbih offering 6 realistic 3D models (Ring, Bead Loop, Classic Clicker & more) with subtle haptic pulses, crisp audio clicks, and lifetime analytics.',
    featuresAr: [
      '٦ نماذج مجسمة ثلاثية الأبعاد قابلة للتبديل مع ألوان ومواد واقعية',
      'مؤثرات لمسية (Haptic) وصوت نقرة حقيقية مع تحديد الهدف التلقائي',
      'سجل إحصائيات يومي وشامل مع إضافة أذكار مخصصة وفضائل التسبيح',
    ],
    featuresEn: [
      '6 switchable 3D Skeuomorphic models with realistic bead & ring physics',
      'Configurable haptic vibration, sound clicks, and automatic target cycles',
      'Daily & all-time Dhikr statistics plus custom Supplication presets',
    ],
    exportPreview: {
      headerAr: 'المسبحة الإلكترونية • ٦ نماذج مجسمة',
      headerEn: 'Electronic Tasbih • 6 3D Models',
      heroTitleAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ — ٣٣ / ٣٣',
      heroTitleEn: 'SubhanAllahi wa bihamdihi — 33 / 33',
      heroSubAr: 'مجموع تسبيحات اليوم: ٣٩٦ • السلسلة المستمرة: ٢١ يوماً',
      heroSubEn: 'Today\'s Count: 396 • Active Streak: 21 Days',
      items: [
        { titleAr: '٦ نماذج مجسمة مختلفة', titleEn: '6 Tactile 3D Designs', subAr: 'الخاتم الذهبي • السبحة المضيئة • الرقمي', subEn: 'Smart Ring • Pearl Beads • Classic', badgeAr: '٦ نماذج', badgeEn: '6 Styles' },
        { titleAr: 'المؤثرات الحسية والصوتية', titleEn: 'Haptic & Sound Feedback', subAr: 'نقرة واقعية واهتزاز لطيف عند التمام', subEn: 'Subtle vibration at 33 & 100 milestones', badgeAr: 'حسي', badgeEn: 'Tactile' },
        { titleAr: 'إحصائيات التسبيح المخصصة', titleEn: 'Detailed Dhikr Analytics', subAr: 'مقارنة الإنجاز اليومي والشهري', subEn: 'Daily, weekly & lifetime Dhikr logs', badgeAr: 'إحصاء', badgeEn: 'Stats' },
      ],
    },
  },
  {
    id: 'hisn-muslim',
    page: 'hisn-muslim',
    icon: 'fa-shield-halved',
    accentColor: '#059669',
    titleAr: 'حصن المسلم والأذكار الجامعة',
    titleEn: 'Hisn Al-Muslim',
    categoryAr: 'الأذكار والتحصين اليومي',
    categoryEn: 'Fortress of the Muslim',
    descriptionAr:
      'كتاب حصن المسلم كاملاً مبوّباً حسب مواقف الحياة اليومية (النوم، السفر، الهم، الكرب، المسجد) مع عداد تفاعلي لكل ذكر وسند التخريج الصحيح.',
    descriptionEn:
      'Complete Fortress of the Muslim organized by everyday life moments (sleep, travel, distress, mosque, rain) with interactive tap counters and verified Hadith sources.',
    featuresAr: [
      'أكثر من ١٣٠ باباً من أذكار الكتاب والسنة مع بحث فوري بالعنوان والنص',
      'عداد لمس مباشر داخل كل بطاقة ذكر مع الانتقال التلقائي عند الاكتمال',
      'مفضلة سريعة للأذكار المتكررة مع خيارات التكبير والنسخ والمشاركة',
    ],
    featuresEn: [
      '130+ categorized chapters from Qur\'an & Sunnah with instant search',
      'Interactive per-dhikr touch counter with smooth auto-progression',
      'Favorites bookmarking, adjustable typography, and instant sharing',
    ],
    exportPreview: {
      headerAr: 'حصن المسلم من أذكار الكتاب والسنة',
      headerEn: 'Fortress of the Muslim (Hisn)',
      heroTitleAr: 'أذكار النوم • الاستيقاظ • الدخول والخروج • الكرب',
      heroTitleEn: 'Sleep • Waking • Travel • Mosque • Anxiety Relief',
      heroSubAr: '١٣٢ باباً موثقاً بتخريج الأحاديث والعداد التفاعلي',
      heroSubEn: '132 Verified Chapters with Hadith Citations & Counters',
      items: [
        { titleAr: 'فهرس شامل وبحث لحظي', titleEn: 'Fast Category Search', subAr: 'الوصول لأي ذكر في ثانيتين', subEn: 'Find any supplication in seconds', badgeAr: '١٣٢ باب', badgeEn: '132' },
        { titleAr: 'عداد تفاعلي لكل ذكر', titleEn: 'Built-in Dhikr Counter', subAr: 'خصم التكرار بلمسة مريحة على البطاقة', subEn: 'Tap card to count repetitions cleanly', badgeAr: 'عداد', badgeEn: 'Tap' },
        { titleAr: 'تخريج الأحاديث والمفضلة', titleEn: 'Authenticated Sources', subAr: 'حفظ الأذكار المهمة في المفضلة', subEn: 'Pin daily essentials to favorites', badgeAr: 'موثق', badgeEn: 'Verified' },
      ],
    },
  },
  {
    id: 'calculators',
    page: 'calculators',
    icon: 'fa-calculator',
    accentColor: '#d97706',
    titleAr: 'الحاسبات الشرعية الدقيقة',
    titleEn: 'Sharia Legal Calculators',
    categoryAr: 'الزكاة والمواريث والكفارات',
    categoryEn: 'Zakat, Inheritance & Fitr',
    descriptionAr:
      'منظومة حسابية فقهية دقيقة لحساب زكاة المال والذهب والأسهم والزروع، قسمة المواريث الشرعية وتوزيع الأنصبة، وزكاة الفطر والأضاحي والكفارات.',
    descriptionEn:
      'Comprehensive Islamic jurisprudence suite calculating Zakat (cash, gold, stocks, crops), Sharia Inheritance shares (Al-Fara\'id), Zakat al-Fitr, Udhiyah, and Expiations.',
    featuresAr: [
      'حاسبة زكاة شاملة مع تحديث النصاب بالذهب والفضة وبعملة بلدك',
      'حاسبة مواريث فقهية تحدد الورثة والفروض والعصبات والحجب بدقة',
      'حاسبة زكاة الفطر والكفارات والأضحية مع تنبيهات فقهية إرشادية',
    ],
    featuresEn: [
      'Multi-asset Zakat calculator with live Gold/Silver Nisab thresholds',
      'Jurisprudential Inheritance engine computing Fara\'id, Asabah & Hajb',
      'Zakat al-Fitr, Udhiyah & Kaffarat calculators with Sharia notes',
    ],
    exportPreview: {
      headerAr: 'الحاسبة الشرعية الشاملة',
      headerEn: 'Islamic Legal Calculators',
      heroTitleAr: 'حاسبة الزكاة • حاسبة المواريث • الكفارات وزكاة الفطر',
      heroTitleEn: 'Zakat • Inheritance (Mawarith) • Kaffarat & Fitr',
      heroSubAr: 'نتائج مفصلة خطوة بخطوة وفق الضوابط الشرعية المعتمدة',
      heroSubEn: 'Step-by-step itemized breakdowns grounded in Fiqh rules',
      items: [
        { titleAr: 'زكاة المال والذهب والأسهم', titleEn: 'Wealth, Gold & Stocks Zakat', subAr: 'حساب النصاب ٢.٥٪ تلقائياً', subEn: 'Automatic 2.5% Nisab calculation', badgeAr: 'زكاة', badgeEn: 'Zakat' },
        { titleAr: 'قسمة المواريث الشرعية', titleEn: 'Sharia Inheritance Split', subAr: 'توزيع الأنصبة والنسب المئوية لكل وارث', subEn: 'Exact fractional shares per heir', badgeAr: 'مواريث', badgeEn: 'Fara\'id' },
        { titleAr: 'زكاة الفطر والأضحية والكفارات', titleEn: 'Fitr, Udhiyah & Expiation', subAr: 'تقدير الصاع وإطعام المساكين', subEn: 'Configurable local meal & staple rates', badgeAr: 'فقه', badgeEn: 'Fiqh' },
      ],
    },
  },
  {
    id: 'daily-wird',
    page: 'daily-wird',
    icon: 'fa-book-open',
    accentColor: '#b45309',
    titleAr: 'الورد اليومي والختمات',
    titleEn: 'Daily Wird & Khatmah',
    categoryAr: 'متابعة الختمة القرآنية',
    categoryEn: 'Qur\'an Completion Tracker',
    descriptionAr:
      'منظم ذكي لختم القرآن الكريم يتيح إنشاء أكثر من ملف أو ختمة مستقلة (لك ولعائلتك)، مع حساب الصفحات اليومية وتنبيهات المداومة.',
    descriptionEn:
      'Smart Qur\'an Khatmah planner supporting multiple independent user profiles, automatic daily page targets, catch-up calculations, and personalized reading reminders.',
    featuresAr: [
      'دعم تعدد المستخدمين والختمات (ختمة شخصية، رمضانية، أو عائلية)',
      'فتح المصحف مباشرة على ورد اليوم وإتمامه مع حساب الفائت تلقائياً',
      'تنبيهات مخصصة لكل مستخدم على حدة بأوقات القراءة المفضلة',
    ],
    featuresEn: [
      'Multi-profile support for personal, Ramadan, or family Khatmahs',
      'Direct one-tap jump into Mushaf reader with missed-day rebalancing',
      'Per-profile notification schedules tailored to reading times',
    ],
    exportPreview: {
      headerAr: 'الورد اليومي • خطة الختمة',
      headerEn: 'Daily Wird • Khatmah Planner',
      heroTitleAr: 'ختمة ٣٠ يوماً • التقدم العام ٤٨٪',
      heroTitleEn: '30-Day Khatmah • 48% Complete',
      heroSubAr: 'ورد اليوم: من صفحة ٢٨٢ إلى صفحة ٣٠١ (٢٠ صفحة)',
      heroSubEn: 'Today\'s Target: Pages 282 – 301 (20 pages)',
      items: [
        { titleAr: 'ملفات متعددة للختمات', titleEn: 'Multiple Wird Profiles', subAr: 'فصل ورد الحفظ عن ورد التلاوة', subEn: 'Separate memorization & recitation plans', badgeAr: 'مرن', badgeEn: 'Multi' },
        { titleAr: 'ابدأ القراءة الآن', titleEn: 'Launch Today\'s Portion', subAr: 'يفتح المصحف عند أول آية في وردك', subEn: 'Opens Mushaf directly at your daily start', badgeAr: 'قراءة', badgeEn: 'Start' },
        { titleAr: 'إشعارات متابعة الورد', titleEn: 'Dedicated Reminders', subAr: 'تذكير ذكي قبل نهاية اليوم', subEn: 'Gentle alerts to protect your streak', badgeAr: 'تنبيه', badgeEn: 'Alerts' },
      ],
    },
  },
  {
    id: 'listen',
    page: 'listen',
    icon: 'fa-headphones',
    accentColor: '#2563eb',
    titleAr: 'الاستماع للقرآن الكريم',
    titleEn: 'Listen to the Qur\'an',
    categoryAr: 'المكتبة الصوتية',
    categoryEn: 'Audio Library',
    descriptionAr:
      'استمع لأعذب التلاوات من نخبة قراء العالم الإسلامي بمختلف الروايات، مع مشغل عائم يستمر أثناء تصفح التطبيق أو قفل الشاشة وتحميل السور كاملة.',
    descriptionEn:
      'Stream or download full-Surah recitations from world-renowned Qaris across diverse Riwayat, powered by a floating background player across the entire app.',
    featuresAr: [
      'عشرات القراء المعتمدين بروايات متعددة (حفص، ورش، قالون، الدوري)',
      'تحميل السور أو المصحف الصوتي كاملاً للاستماع بدون إنترنت',
      'مشغل صوتي عائم ومؤقت نوم وتكرار السورة أو الانتقال التلقائي',
    ],
    featuresEn: [
      'Dozens of celebrated reciters across Hafs, Warsh, Qalun & more',
      'Batch download individual Surahs or full Mushafs for offline use',
      'Floating mini-player, sleep timer, loop, and auto-next controls',
    ],
    exportPreview: {
      headerAr: 'الاستماع للقرآن الكريم',
      headerEn: 'Audio Qur\'an Streaming',
      heroTitleAr: 'سورة الكهف • القارئ ماهر المعيقلي',
      heroTitleEn: 'Surah Al-Kahf • Maher Al-Muaiqly',
      heroSubAr: 'تشغيل في الخلفية • مؤقت نوم • تحميل بدون نت',
      heroSubEn: 'Background Playback • Sleep Timer • Offline Mode',
      items: [
        { titleAr: 'مكتبة كبار القراء', titleEn: 'Curated Qari Directory', subAr: 'الحصري • المنشاوي • العفاسي • المعيقلي', subEn: 'Al-Husary • Al-Minshawi • Al-Afasy', badgeAr: 'MP3', badgeEn: 'HQ' },
        { titleAr: 'التحميل دون اتصال', titleEn: 'Offline Surah Cache', subAr: 'حفظ السور للاستماع في السفر', subEn: 'Download Surahs for travel listening', badgeAr: 'حفظ', badgeEn: 'Saved' },
        { titleAr: 'المشغل العائم الذكي', titleEn: 'Floating App Player', subAr: 'تحكم بالتلاوة من أي شاشة', subEn: 'Persistent controls on every screen', badgeAr: 'عائم', badgeEn: 'Float' },
      ],
    },
  },
  {
    id: 'memorization',
    page: 'memorization',
    icon: 'fa-brain',
    accentColor: '#6d28d9',
    titleAr: 'تحفيظ القرآن الكريم',
    titleEn: 'Qur\'an Memorization Studio',
    categoryAr: 'الحفظ والتثبيت والمراجعة',
    categoryEn: 'Hifz & Mastery Tools',
    descriptionAr:
      'أداة تحفيظ احترافية تساعدك على الحفظ المتقن عبر تكرار الآية والربط بينها، إخفاء الكلمات تدريجياً لاختبار الحفظ، وتحديد نطاق الحفظ والمراجعة.',
    descriptionEn:
      'Structured Qur\'an memorization studio featuring ayah-by-ayah looping, progressive verse hiding for self-testing, and customizable range sessions.',
    featuresAr: [
      'تكرار مخصص لكل آية ولكل مقطع لترسيخ الحفظ بالاستماع والترديد',
      'وضع إخفاء الآيات والضغط للكشف لاختبار نفسك قبل التسميع',
      'بناء خطط حفظ مرنة بالسور أو الصفحات أو نطاق الآيات المحدد',
    ],
    featuresEn: [
      'Configurable verse and range repetition loops with pauses to repeat',
      'Hide-verses mode with tap-to-reveal self-testing during sessions',
      'Flexible range selection by Surah, Mushaf page, or custom Ayah span',
    ],
    exportPreview: {
      headerAr: 'تحفيظ القرآن الكريم',
      headerEn: 'Qur\'an Memorization',
      heroTitleAr: 'جلسة حفظ: سورة الملك (١ – ١٠)',
      heroTitleEn: 'Hifz Session: Surah Al-Mulk (1 – 10)',
      heroSubAr: 'التكرار: ٥ مرات لكل آية • وضع اختبار الإخفاء مفعّل',
      heroSubEn: 'Repeat: 5× per ayah • Blind Reveal Testing Active',
      items: [
        { titleAr: 'ترديد وتكرار متدرج', titleEn: 'Smart Repetition Loops', subAr: 'تكرار الآية ثم ربطها بما قبلها', subEn: 'Ayah loop + cumulative connection', badgeAr: 'حفظ', badgeEn: 'Loop' },
        { titleAr: 'اختبار الحفظ التفاعلي', titleEn: 'Tap-to-Reveal Test', subAr: 'إخفاء النص مع كشف فوري عند الحاجة', subEn: 'Hide verses and verify recall instantly', badgeAr: 'اختبار', badgeEn: 'Quiz' },
        { titleAr: 'تتبع السور المحفوظة', titleEn: 'Progress Overview', subAr: 'متابعة الإتقان لكل جزء وسورة', subEn: 'Track completion per Surah & Juz', badgeAr: 'متقن', badgeEn: 'Hifz' },
      ],
    },
  },
  {
    id: 'habit-tracker',
    page: 'habit-tracker',
    icon: 'fa-chart-line',
    accentColor: '#0f766e',
    titleAr: 'مربّي العبادات',
    titleEn: 'Worship Habit Tracker',
    categoryAr: 'متابعة الطاعات اليومية',
    categoryEn: 'Spiritual Analytics',
    descriptionAr:
      'رفيقك اليومي للمحافظة على الصلوات الخمس في جماعة، السنن الرواتب، قراءة القرآن الموثقة، الأذكار، الصدقة، والصيام مع رسوم بيانية تحفيزية.',
    descriptionEn:
      'Your daily companion for tracking the 5 obligatory prayers, Rawatib Sunnahs, verified Qur\'an pages read, Adhkar, charity, and voluntary fasting with streak insights.',
    featuresAr: [
      'تسجيل تفاعلي للصلوات الخمس والرواتب والوتر والضحى وأذكار اليوم',
      'احتساب تلقائي ودقيق لصفحات القرآن المقروءة فعلياً داخل المصحف',
      'تقارير أسبوعية وشهرية وسلاسل إنجاز مستمرة تحفزك على الثبات',
    ],
    featuresEn: [
      'One-tap daily logging for Fard prayers, Sunnah Rawatib, Witr & Adhkar',
      'Verified automatic credit when reading pages inside the Mushaf Reader',
      'Weekly & monthly completion insights with consistency streaks',
    ],
    exportPreview: {
      headerAr: 'مربّي العبادات • إنجاز اليوم',
      headerEn: 'Worship Habit Tracker',
      heroTitleAr: 'نسبة الثبات اليومي: ٩٢٪ • سلسلة ١٨ يوماً',
      heroTitleEn: 'Daily Consistency: 92% • 18-Day Streak',
      heroSubAr: 'الصلوات المفروضة ٥/٥ • الأذكار ٢/٢ • صفحات القرآن: ١٢',
      heroSubEn: 'Obligatory Salah 5/5 • Adhkar 2/2 • Verified Qur\'an Pages: 12',
      items: [
        { titleAr: 'الصلوات والسنن الرواتب', titleEn: 'Salah & Sunnah Logs', subAr: 'تتبع صلاة الجماعة والسنن اليومية', subEn: 'Record congregation & Sunnah prayers', badgeAr: '٥/٥', badgeEn: '5/5' },
        { titleAr: 'ربط ذكي بالمصحف الشريف', titleEn: 'Verified Mushaf Sync', subAr: 'يحتسب الصفحات المقروءة تلقائياً', subEn: 'Credits genuine reading duration & pages', badgeAr: 'تلقائي', badgeEn: 'Synced' },
        { titleAr: 'سجل الأيام السابقة', titleEn: 'Historical Timeline', subAr: 'استعراض وتعديل أي يوم سابق', subEn: 'Inspect and update past daily records', badgeAr: 'سجل', badgeEn: 'History' },
      ],
    },
  },
  {
    id: 'sabah-masaa',
    page: 'sabah-masaa',
    icon: 'fa-sun',
    accentColor: '#ea580c',
    titleAr: 'أذكار الصباح والمساء',
    titleEn: 'Morning & Evening Adhkar',
    categoryAr: 'الأذكار اليومية',
    categoryEn: 'Daily Fortress',
    descriptionAr:
      'أذكار الصباح والمساء الصحيحة بتنسيق مجسم مريح للعين، مع التبديل الذكي التلقائي حسب التوقيت، العداد التفاعلي، وفضل كل ذكر.',
    descriptionEn:
      'Authenticated Morning & Evening Adhkar in an eye-friendly Soft 3D card layout with automatic time-based switching, tap counters, and the Prophetic virtue of each Dhikr.',
    featuresAr: [
      'تبديل ذكي تلقائي بين أذكار الصباح والمساء حسب توقيت يومك',
      'شريط تقدم علوي وعداد ضغط تفاعلي مع إخفاء المنجز تلقائياً',
      'عرض سند الحديث وفضل الذكر والاستماع الصوتي إن رغبت',
    ],
    featuresEn: [
      'Smart automatic switch between Morning & Evening sets by time of day',
      'Progress indicator with smooth tap-to-count and auto-completion flow',
      'Clear Hadith authenticity notes and spiritual virtues per card',
    ],
    exportPreview: {
      headerAr: 'أذكار الصباح والمساء',
      headerEn: 'Morning & Evening Adhkar',
      heroTitleAr: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ...',
      heroTitleEn: 'We have reached the morning and all sovereignty belongs to Allah',
      heroSubAr: 'شريط إنجاز تفاعلي: ١٤ من ٢٤ ذكراً مكتملاً',
      heroSubEn: 'Interactive Progress: 14 of 24 Adhkar Completed',
      items: [
        { titleAr: 'تبديل تلقائي صباحاً ومساءً', titleEn: 'Auto Morning/Evening Mode', subAr: 'يفتح تلقائياً على الورد المناسب لوقتك', subEn: 'Adapts automatically to AM/PM window', badgeAr: 'ذكي', badgeEn: 'Smart' },
        { titleAr: 'عدّاد لمسي سلس', titleEn: 'Tactile Tap Counter', subAr: 'اهتزاز لطيف عند إتمام التكرارات', subEn: 'Soft haptic pulse on reaching target count', badgeAr: '٣×', badgeEn: '3×' },
        { titleAr: 'فضل الذكر والسند الصحيح', titleEn: 'Virtue & Authenticity', subAr: 'روايات صحيحة من السنة المطهرة', subEn: 'Sourced from Sahih collections', badgeAr: 'صحيح', badgeEn: 'Sahih' },
      ],
    },
  },
  {
    id: 'salah-adhkar',
    page: 'salah-adhkar',
    icon: 'fa-hands-praying',
    accentColor: '#0284c7',
    titleAr: 'أذكار الصلاة',
    titleEn: 'Adhkar of Salah',
    categoryAr: 'أذكار قبل وبعد الصلاة',
    categoryEn: 'Prayer Remembrances',
    descriptionAr:
      'مرجع منظم للأذكار والأدعية الواردة عند الأذان، الوضوء، الاستفتاح، الركوع والسجود، والتسبيح والأذكار المشروعة بعد السلام من الصلاة.',
    descriptionEn:
      'Structured guide to all Prophetic supplications around Salah—Wudu, Adhan response, Opening Dua, Ruku & Sujud, Tashahhud, and post-prayer Tasbih.',
    featuresAr: [
      'تقسيم مرتب: قبل الصلاة، أثناء الصلاة، وبعد السلام مباشرة',
      'عداد تسبيح مدمج للأذكار الثلاثية والثلاثين بعد الفريضة',
      'وضوح الخط والتشكيل مع التبديل السريع بين المراحل',
    ],
    featuresEn: [
      'Clear phases: Before Prayer, Inside Prayer, and After Tasleem',
      'Built-in counter for post-prayer 33× Tasbih, Tahmid & Takbir',
      'Crisp vocalized Arabic script with English translation & meaning',
    ],
    exportPreview: {
      headerAr: 'أذكار الصلاة • قبل وأثناء وبعد',
      headerEn: 'Adhkar of Salah',
      heroTitleAr: 'أَسْتَغْفِرُ اللَّهَ (٣) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ',
      heroTitleEn: 'Astaghfirullah (3×) — O Allah, You are Peace and from You is Peace',
      heroSubAr: 'أذكار ما بعد السلام • آية الكرسي • المعوذات • التسبيح ٣٣',
      heroSubEn: 'Post-Salah Sequence • Ayat Al-Kursi • 33× Tasbih',
      items: [
        { titleAr: 'دعاء الاستفتاح والركوع', titleEn: 'Opening & Ruku Adhkar', subAr: 'صيغ متعددة ثابتة في السنة', subEn: 'Multiple authentic Prophetic wordings', badgeAr: 'سنة', badgeEn: 'Sunnah' },
        { titleAr: 'الأذكار بعد السلام', titleEn: 'Post-Prayer Sequence', subAr: 'الاستغفار وآية الكرسي والتسبيحات', subEn: 'Guided sequence with tap counter', badgeAr: '٣٣×', badgeEn: '33×' },
        { titleAr: 'إجابة المؤذن والوضوء', titleEn: 'Adhan & Wudu Adhkar', subAr: 'ما يُقال عند السماع وبعد الوضوء', subEn: 'Complete pre-prayer remembrances', badgeAr: 'مرتب', badgeEn: 'Clean' },
      ],
    },
  },
  {
    id: 'adia',
    page: 'adia',
    icon: 'fa-hand-holding-heart',
    accentColor: '#db2777',
    titleAr: 'الأدعية المأثورة',
    titleEn: 'Prophetic Supplications',
    categoryAr: 'جوامع الدعاء',
    categoryEn: 'Qur\'an & Sunnah Du\'as',
    descriptionAr:
      'موسوعة منتقاة من جوامع الأدعية القرآنية والنبوية وأدعية الأنبياء والمواقف اليومية مع تصنيفات سهلة التصفح ونسخ ومشاركة فورية.',
    descriptionEn:
      'Curated treasury of Qur\'anic Du\'as, Prophetic supplications, prayers of the Prophets, and topical invocations with effortless filtering and instant sharing.',
    featuresAr: [
      'تبويب واضح: أدعية قرآنية، أدعية نبوية، أدعية الأنبياء، وتفريج الهم',
      'بحث سريع في نصوص الأدعية مع حفظ المفضلات للرجوع الفوري',
      'تكبير وتصغير الخط ونسخ ومشاركة الدعاء بتصميم أنيق',
    ],
    featuresEn: [
      'Organized categories: Qur\'anic, Prophetic, Prophets\' & situational Du\'as',
      'Instant keyword search and personal favorites pinning',
      'Adjustable reading scale and clean one-tap copy & share',
    ],
    exportPreview: {
      headerAr: 'الأدعية المأثورة من الكتاب والسنة',
      headerEn: 'Authenticated Du\'as',
      heroTitleAr: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      heroTitleEn: 'Our Lord, give us good in this world and good in the Hereafter',
      heroSubAr: 'جوامع الدعاء • الاستخارة • الرزق • الهداية والثبات',
      heroSubEn: 'Comprehensive Du\'as • Istikharah • Guidance • Relief',
      items: [
        { titleAr: 'الأدعية القرآنية الجامعة', titleEn: 'Qur\'anic Supplications', subAr: 'أدعية الأنبياء والمؤمنين في القرآن', subEn: 'All Rabbanā & Prophet invocations', badgeAr: 'قرآني', badgeEn: 'Qur\'an' },
        { titleAr: 'جوامع الكلم النبوي', titleEn: 'Prophetic Treasury', subAr: 'أصح الأدعية الواردة عن النبي ﷺ', subEn: 'Authentic invocations from Sunnah', badgeAr: 'نبوي', badgeEn: 'Sunnah' },
        { titleAr: 'بحث وحفظ بالمفضلة', titleEn: 'Search & Favorites', subAr: 'تخصيص قائمة أدعيتك اليومية', subEn: 'Build your personal Du\'a list', badgeAr: 'مفضل', badgeEn: 'Saved' },
      ],
    },
  },
  {
    id: 'nawawi',
    page: 'nawawi',
    icon: 'fa-scroll',
    accentColor: '#9333ea',
    titleAr: 'الأربعون النووية',
    titleEn: 'An-Nawawi\'s Forty Hadith',
    categoryAr: 'السنة النبوية وشرحها',
    categoryEn: 'Hadith & Commentary',
    descriptionAr:
      'متن الأحاديث الأربعين النووية كاملاً مع الشرح الميسر، ترجمة الرواة، الفوائد التربوية والعملية، وإمكانية البحث والمشاركة.',
    descriptionEn:
      'Complete text of Imam An-Nawawi\'s 42 foundational Hadiths accompanied by accessible commentary, narrator profiles, practical lessons, and search.',
    featuresAr: [
      'النص الكامل للأحاديث النبوية مضبوطاً بالشكل مع السند الصحيح',
      'شرح ميسر ومفردات غريبة واستخلاص الفوائد العملية من كل حديث',
      'قائمة فهرس سريعة للتنقل بين الأحاديث ومشاركتها بوضوح',
    ],
    featuresEn: [
      'Full vocalized Arabic text alongside accurate English translation',
      'Clear explanations, key vocabulary, and actionable life lessons',
      'Quick Hadith index, bookmarking, and one-tap sharing',
    ],
    exportPreview: {
      headerAr: 'الأربعون النووية • ٤٢ حديثاً جامعاً',
      headerEn: 'An-Nawawi\'s Forty Hadith',
      heroTitleAr: 'الحديث الأول: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»',
      heroTitleEn: 'Hadith 1: "Actions are but by intentions, and every person gets what they intended"',
      heroSubAr: 'المتن • الراوي • الشرح الميسر • الفوائد التربوية',
      heroSubEn: 'Text • Narrator • Simplified Explanation • Takeaways',
      items: [
        { titleAr: 'متن مضبوط بالتشكيل', titleEn: 'Full Vocalized Text', subAr: 'قراءة واضحة ومريحة للحديث النبوي', subEn: 'Crisp Arabic script + English translation', badgeAr: 'متن', badgeEn: 'Text' },
        { titleAr: 'الشرح والفوائد المستنبطة', titleEn: 'Insights & Key Lessons', subAr: 'ربط معاني الحديث بالواقع العملي', subEn: 'Practical Islamic wisdom per Hadith', badgeAr: 'شرح', badgeEn: 'Notes' },
        { titleAr: 'بطاقة التعريف بالصحابي', titleEn: 'Narrator Biography', subAr: 'نبذة عن راوي الحديث ومناقبه', subEn: 'Concise profile of each narrator', badgeAr: 'راوي', badgeEn: 'Info' },
      ],
    },
  },
  {
    id: 'asmaul-husna',
    page: 'asmaul-husna',
    icon: 'fa-star-and-crescent',
    accentColor: '#ca8a04',
    titleAr: 'أسماء الله الحسنى',
    titleEn: '99 Names of Allah',
    categoryAr: 'العقيدة والمعرفة بالله',
    categoryEn: 'The 99 Beautiful Names',
    descriptionAr:
      'استعراض بصري بديع لأسماء الله الحسنى التسعة والتسعين مع شرح المعنى اللغوي والعقدي، الدليل من القرآن والسنة، وكيفية التعبد والدعاء بكل اسم.',
    descriptionEn:
      'Elevated exploration of the 99 Beautiful Names of Allah with linguistic & theological meanings, Qur\'anic proofs, and how to call upon Allah using each Name.',
    featuresAr: [
      'بطاقات مجسمة للأسماء التسعة والتسعين بتصميم خطي مميز',
      'معنى كل اسم، شاهده من الكتاب والسنة، وأثره الإيماني في القلب',
      'بحث وتصفح سلس مع إمكانية الدعاء بالاسم ومشاركته',
    ],
    featuresEn: [
      'Distinctive 3D calligraphic cards for all 99 Divine Names',
      'Detailed meaning, scriptural evidence, and heart-awakening reflection',
      'Quick search filter and instant sharing cards',
    ],
    exportPreview: {
      headerAr: 'أسماء الله الحسنى • ٩٩ اسماً',
      headerEn: '99 Names of Allah',
      heroTitleAr: 'الرَّحْمَٰنُ • الرَّحِيمُ • الْمَلِكُ • الْقُدُّوسُ • السَّلَامُ',
      heroTitleEn: 'Ar-Rahman • Ar-Rahim • Al-Malik • Al-Quddus • As-Salam',
      heroSubAr: '«إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ»',
      heroSubEn: 'Explore meaning, Qur\'anic verses, and reflections for every Name',
      items: [
        { titleAr: 'الشرح والتعبد بالاسم', titleEn: 'Meaning & Reflection', subAr: 'كيف نعيش معاني الأسماء الحسنى', subEn: 'How to worship & supplicate with each Name', badgeAr: 'تدبر', badgeEn: 'Reflect' },
        { titleAr: 'الشواهد القرآنية والحديثية', titleEn: 'Scriptural Evidence', subAr: 'ذكر الاسم ومواضعه في كتاب الله', subEn: 'Authentic Qur\'anic verse references', badgeAr: 'دليل', badgeEn: 'Proof' },
        { titleAr: 'تصفح وبحث فوري', titleEn: 'Instant Lookup', subAr: 'الوصول لأي اسم من الـ ٩٩ بسهولة', subEn: 'Filter in Arabic or English anytime', badgeAr: '٩٩', badgeEn: '99' },
      ],
    },
  },
  {
    id: 'prophetic-seerah',
    page: 'prophetic-seerah',
    icon: 'fa-landmark',
    accentColor: '#b45309',
    titleAr: 'السيرة النبوية',
    titleEn: 'The Prophetic Seerah',
    categoryAr: 'السيرة والتاريخ الإسلامي',
    categoryEn: 'Prophetic Timeline',
    descriptionAr:
      'خط زمني تفاعلي يأخذك في رحلة ماتعة عبر محطات السيرة النبوية الشريفة من المولد والبعثة إلى الهجرة والفتح وحجة الوداع مع المواقف والدروس.',
    descriptionEn:
      'Interactive historical timeline guiding you through the blessed life of Prophet Muhammad ﷺ from Makkah and the Hijrah to Madinah, complete with wisdoms and key stances.',
    featuresAr: [
      'تسلسل زمني منظم لجميع المراحل والمحطات والغزوات النبوية',
      'عرض الدروس والعبر المستفادة من كل حدث بوضوح وعمق',
      'بحث وتصفية حسب الحقبة أو الموضوع مع حفظ آخر محطة مقروءة',
    ],
    featuresEn: [
      'Chronological interactive timeline from Birth to Farewell Pilgrimage',
      'Structured historical facts paired with timeless practical lessons',
      'Smart filtering by era & topic with automatic reading resume',
    ],
    exportPreview: {
      headerAr: 'السيرة النبوية العطرة ﷺ',
      headerEn: 'The Prophetic Seerah ﷺ',
      heroTitleAr: 'المولد • البعثة • الهجرة النبوية • بناء الدولة • الفتح المبين',
      heroTitleEn: 'Birth • Revelation • Hijrah • Madinah State • Conquest of Makkah',
      heroSubAr: 'خط زمني تفاعلي مع الدروس والعبر والشمائل المحمدية',
      heroSubEn: 'Interactive Milestones, Morals & Prophetic Stances',
      items: [
        { titleAr: 'محطات السيرة المرتبة زمنياً', titleEn: 'Chronological Milestones', subAr: 'تاريخ كل حدث ومكانه وسياقه الدقيق', subEn: 'Exact Hijri dates, locations & narratives', badgeAr: 'تاريخ', badgeEn: 'Era' },
        { titleAr: 'المواقف والشمائل والعبر', titleEn: 'Character & Lessons', subAr: 'مواقف الرحمة والحكمة والقيادة', subEn: 'Leadership, mercy & wisdom lessons', badgeAr: 'عبر', badgeEn: 'Wisdom' },
        { titleAr: 'وضع القراءة المركزة', titleEn: 'Focused Reader Mode', subAr: 'تكبير مريح وحفظ موضع التوقف', subEn: 'Distraction-free view with progress', badgeAr: 'قراءة', badgeEn: 'Read' },
      ],
    },
  },
  {
    id: 'ten-promised',
    page: 'ten-promised',
    icon: 'fa-award',
    accentColor: '#059669',
    titleAr: 'العشرة المبشرون بالجنة',
    titleEn: 'The Ten Promised Paradise',
    categoryAr: 'تراجم الصحابة الكرام',
    categoryEn: 'Noble Companions',
    descriptionAr:
      'سير وأحوال ومناقب العشرة المبشرين بالجنة رضي الله عنهم، مع إبراز مواقفهم الإيمانية، فضائلهم في السنة، وأشهر مأثوراتهم.',
    descriptionEn:
      'Inspiring biographies, virtues, and defining stances of the Ten Companions promised Paradise by Prophet Muhammad ﷺ, sourced from classical Sirah works.',
    featuresAr: [
      'بطاقات مجسمة شاملة لسيرة ومناقب كل صحابي من العشرة رضي الله عنهم',
      'مواقف البطولة والعدل والإنفاق والزهد في حياتهم المباركة',
      'أسئلة وعبر مستفادة وتنقل سريع بين الشخصيات العشر',
    ],
    featuresEn: [
      'Detailed interactive dossiers for all Ten Noble Companions',
      'Highlighting heroism, generosity, justice, and Prophetic praise',
      'Quick comparison and seamless navigation between biographies',
    ],
    exportPreview: {
      headerAr: 'العشرة المبشرون بالجنة',
      headerEn: 'Ten Promised Paradise',
      heroTitleAr: 'أبو بكر • عمر • عثمان • علي • طلحة • الزبير • عبد الرحمن • سعد • سعيد • أبو عبيدة',
      heroTitleEn: 'Abu Bakr • Umar • Uthman • Ali • Talhah • Az-Zubayr & Companions',
      heroSubAr: 'رضي الله عنهم أجمعين • مناقبهم ومواقفهم الخالدة',
      heroSubEn: 'Biographies, Authentic Virtues & Defining Moments',
      items: [
        { titleAr: 'المناقب والفضائل الثابتة', titleEn: 'Authenticated Virtues', subAr: 'شهادات النبي ﷺ لكل صحابي', subEn: 'Prophetic testimonies & rank in Islam', badgeAr: 'فضائل', badgeEn: 'Rank' },
        { titleAr: 'المواقف التاريخية الخالدة', titleEn: 'Historic Stances', subAr: 'قصص البذل والثبات في نصرة الدين', subEn: 'Stories of sacrifice & steadfastness', badgeAr: 'مواقف', badgeEn: 'Story' },
        { titleAr: 'تصفح منظم وسهل', titleEn: 'Organized Dossiers', subAr: 'انتقال فوري بين التراجم الكاملة', subEn: 'Instant switch across all 10 profiles', badgeAr: '١٠', badgeEn: '10' },
      ],
    },
  },
  {
    id: 'divine-miracles',
    page: 'divine-miracles',
    icon: 'fa-atom',
    accentColor: '#0284c7',
    titleAr: 'المعجزات الإلهية والإعجاز',
    titleEn: 'Divine Miracles',
    categoryAr: 'الإعجاز العلمي والغيبي',
    categoryEn: 'Scientific & Prophetic Signs',
    descriptionAr:
      'موسوعة علمية وإيمانية موثقة تستعرض أوجه الإعجاز البياني والعلمي في القرآن الكريم، النبوءات النبوية الصادقة، وأدلة الإيمان واليقين.',
    descriptionEn:
      'Documented faith-strengthening encyclopedia covering Qur\'anic scientific signs, fulfilled Prophetic predictions, linguistic miracles, and proofs of the Creator.',
    featuresAr: [
      'أقسام متخصصة: الإعجاز العلمي، الغيبي والتاريخي، والبلاغي في القرآن',
      'عرض الآيات والأحاديث مقرونة بالاكتشافات والحقائق العلمية الحديثة',
      'بطاقات قراءة مريحة مع وضع التركيز والتكبير والمشاركة المعرفية',
    ],
    featuresEn: [
      'Curated sections: Scientific, Historical, Linguistic & Prophetic signs',
      'Scriptural verses paired with modern verified scientific discoveries',
      'Clean zoom reading mode with effortless educational sharing',
    ],
    exportPreview: {
      headerAr: 'المعجزات الإلهية وإعجاز القرآن',
      headerEn: 'Divine Miracles & Signs',
      heroTitleAr: 'الإعجاز العلمي • النبوءات النبوية • دلائل الخالق',
      heroTitleEn: 'Scientific Signs • Prophetic Predictions • Proofs of Creation',
      heroSubAr: '﴿سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ﴾',
      heroSubEn: '"We will show them Our signs in the horizons and within themselves"',
      items: [
        { titleAr: 'الإعجاز العلمي في الكون والإنسان', titleEn: 'Cosmic & Human Signs', subAr: 'نشأة الكون • البحار • مراحل الجنين', subEn: 'Cosmology • Ocean Barriers • Embryology', badgeAr: 'علمي', badgeEn: 'Science' },
        { titleAr: 'النبوءات النبوية المتحققة', titleEn: 'Fulfilled Predictions', subAr: 'إخبارات صادقة تحققت عبر العصور', subEn: 'Accurate prophecies verified by history', badgeAr: 'نبوة', badgeEn: 'History' },
        { titleAr: 'شبهات وردود علمية رصينة', titleEn: 'Faith & Reason Clarity', subAr: 'عرض مبسط يرسخ اليقين القلبي', subEn: 'Clear rational & spiritual conviction', badgeAr: 'يقين', badgeEn: 'Faith' },
      ],
    },
  },
  {
    id: 'hajj-umrah',
    page: 'hajj-umrah',
    icon: 'fa-kaaba',
    accentColor: '#047857',
    titleAr: 'دليل الحج والعمرة',
    titleEn: 'Hajj & Umrah Guide',
    categoryAr: 'المناسك خطوة بخطوة',
    categoryEn: 'Pilgrimage Rites Guide',
    descriptionAr:
      'رفيق الحاج والمعتمر خطوة بخطوة من الإحرام والميقات حتى التحلل، مع عداد أشواط الطواف والسعي المدمج، الأدعية المأثورة، والخريطة التوضيحية للمشاعر.',
    descriptionEn:
      'Step-by-step Hajj & Umrah companion from Ihram and Miqat through Tawaf, Sa\'i, Arafah, and Muzdalifah—with built-in lap counters and rites checklists.',
    featuresAr: [
      'شرح عملي لمناسك العمرة وأنواع الحج (التمتع، القران، الإفراد)',
      'عداد أشواط تفاعلي للطواف والسعي مع أدعية كل شوط ومشعر',
      'التنبيه على المحظورات والسنن والمواقيت المكانية بوضوح تام',
    ],
    featuresEn: [
      'Step-by-step instructions for Umrah, Tamattu\', Qiran & Ifrad Hajj',
      'Integrated 7-circuit Tawaf & Sa\'i lap counters with authentic Du\'as',
      'Clear Miqat guides, Ihram prohibitions, and practical checklists',
    ],
    exportPreview: {
      headerAr: 'دليل الحج والعمرة الشامل',
      headerEn: 'Hajj & Umrah Companion',
      heroTitleAr: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ — خطوة بخطوة في المشاعر',
      heroTitleEn: 'Labbayk Allahumma Labbayk — Guided Rites',
      heroSubAr: 'الإحرام • الطواف ٧ أشواط • السعي • عرفة • المزدلفة • منى',
      heroSubEn: 'Ihram • 7-Lap Tawaf • Sa\'i • Arafah • Muzdalifah • Mina',
      items: [
        { titleAr: 'ترتيب المناسك بالأيام', titleEn: 'Day-by-Day Hajj Sequence', subAr: 'من يوم التروية إلى طواف الوداع', subEn: '8th – 13th Dhul-Hijjah detailed guide', badgeAr: 'حج', badgeEn: 'Hajj' },
        { titleAr: 'مناسك العمرة المختصرة', titleEn: 'Umrah Checklist', subAr: 'الإحرام والطواف والسعي والحلق', subEn: 'Complete step-by-step Umrah flow', badgeAr: 'عمرة', badgeEn: 'Umrah' },
        { titleAr: 'أدعية ومواقيت الحرمين', titleEn: 'Sanctuary Supplications', subAr: 'أدعية الطواف والسعي وجبل عرفات', subEn: 'Curated prayers for every holy site', badgeAr: 'دعاء', badgeEn: 'Du\'as' },
      ],
    },
  },
  {
    id: 'calendar',
    page: 'calendar',
    icon: 'fa-calendar-days',
    accentColor: '#0284c7',
    titleAr: 'التقويم الهجري والميلادي',
    titleEn: 'Islamic Hijri Calendar',
    categoryAr: 'التاريخ والمناسبات الإسلامية',
    categoryEn: 'Hijri Dates & Events',
    descriptionAr:
      'تقويم مزدوج يجمع التاريخ الهجري والميلادي في عرض واحد أنيق، مع تحويل التواريخ بدقة، إبراز الأيام البيض والاثنين والخميس، والمناسبات الدينية القادمة.',
    descriptionEn:
      'Dual Hijri-Gregorian calendar displaying sacred months, upcoming Islamic occasions, White Days (13-15), Sunnah fasting alerts, and instant date conversion.',
    featuresAr: [
      'تقويم شهري يدمج اليوم الهجري والميلادي مع إمكانية تعديل الهلال (+/-)',
      'محول تاريخ ثنائي الاتجاه (من هجري لميلادي والعكس) بدقة فلكية',
      'عداد تنازلي للمناسبات الإسلامية الكبرى وأيام الصيام المستحبة',
    ],
    featuresEn: [
      'Monthly grid with Hijri/Gregorian overlay and +/- moon-sighting offset',
      'Instant two-way Hijri ↔ Gregorian date converter',
      'Countdown to Ramadan, Eids, Ashura, Arafah, and White Days',
    ],
    exportPreview: {
      headerAr: 'التقويم الهجري والميلادي',
      headerEn: 'Hijri & Gregorian Calendar',
      heroTitleAr: 'رمضان ١٤٤٧ هـ • المناسبات والأيام المباركة',
      heroTitleEn: 'Ramadan 1447 AH • Blessed Occasions',
      heroSubAr: 'محول التواريخ • الأيام البيض • حساب المعايير الفلكية',
      heroSubEn: 'Date Converter • White Days • Moon Sighting Offset',
      items: [
        { titleAr: 'مؤشر المناسبات الإسلامية', titleEn: 'Occasions Countdown', subAr: 'كم يتبقى على رمضان وعرفة والعيدين', subEn: 'Exact days left for key Islamic events', badgeAr: 'مناسبات', badgeEn: 'Events' },
        { titleAr: 'الأيام البيض وصيام السنة', titleEn: 'White Days Highlighted', subAr: '١٣، ١٤، ١٥ من كل شهر هجري', subEn: '13th, 14th, 15th marked clearly', badgeAr: 'صيام', badgeEn: 'Sunnah' },
        { titleAr: 'تحويل التاريخ الفوري', titleEn: 'Date Converter Tool', subAr: 'تحويل دقيق لأي سنة هجرية أو ميلادية', subEn: 'Convert any past or future date', badgeAr: 'تحويل', badgeEn: 'Convert' },
      ],
    },
  },
  {
    id: 'others',
    page: 'others',
    icon: 'fa-shield-virus',
    accentColor: '#16a34a',
    titleAr: 'الرقية الشرعية الشاملة',
    titleEn: 'Al-Ruqyah Al-Shar\'iyyah',
    categoryAr: 'آيات الشفاء والتحصين',
    categoryEn: 'Healing & Protection',
    descriptionAr:
      'الرقية الشرعية الكاملة من القرآن الكريم والسنة النبوية الصحيحة مقسمة بوضوح للتحصين والشفاء مع عداد التكرار وضبط حجم الخط.',
    descriptionEn:
      'Authentic Al-Ruqyah Al-Shar\'iyyah compiled from the Holy Qur\'an and verified Prophetic Sunnah for spiritual healing and daily protection, complete with repetition counters.',
    featuresAr: [
      'آيات السكينة والشفاء والتحصين مرتبة بوضوح من المصحف الشريف',
      'الأدعية النبوية الصحيحة للرقية من العين والحسد والمرض والكرب',
      'شريط تحكم لتكبير الخط والتنقل المباشر بين أقسام الرقية',
    ],
    featuresEn: [
      'Qur\'anic verses of healing, tranquility, and refuge clearly arranged',
      'Verified Prophetic Ruqyah invocations with repetition guidelines',
      'Clean font scaling and quick section switching for focused reading',
    ],
    exportPreview: {
      headerAr: 'الرقية الشرعية من الكتاب والسنة',
      headerEn: 'Al-Ruqyah Al-Shar\'iyyah',
      heroTitleAr: '﴿وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ﴾',
      heroTitleEn: '"And We send down of the Qur\'an that which is healing and mercy"',
      heroSubAr: 'آيات الرقية • الأدعية النبوية الصحيحة • ضوابط التحصين',
      heroSubEn: 'Qur\'anic Healing • Prophetic Protection • Verified Guidance',
      items: [
        { titleAr: 'آيات التحصين والشفاء', titleEn: 'Qur\'anic Ruqyah Verses', subAr: 'الفاتحة والكرسي وخواتيم البقرة والمعوذات', subEn: 'Al-Fatihah, Al-Kursi & Al-Mu\'awwidhat', badgeAr: 'قرآن', badgeEn: 'Qur\'an' },
        { titleAr: 'الأدعية النبوية المأثورة', titleEn: 'Sunnah Protection Du\'as', subAr: 'أعوذ بكلمات الله التامات وغيرها', subEn: 'Authentic refuge supplications', badgeAr: 'سنة', badgeEn: 'Sunnah' },
        { titleAr: 'إرشادات وآداب الرقية', titleEn: 'Authentic Etiquettes', subAr: 'التوكل على الله وشروط الرقية الصحيحة', subEn: 'Reliance on Allah & proper guidelines', badgeAr: 'ضوابط', badgeEn: 'Guide' },
      ],
    },
  },
  {
    id: 'islamic-sites',
    page: 'islamic-sites',
    icon: 'fa-globe',
    accentColor: '#0d9488',
    titleAr: 'دليل المواقع الإسلامية الموثوقة',
    titleEn: 'Trusted Islamic Websites',
    categoryAr: 'مصادر العلم والفتوى',
    categoryEn: 'Scholarly Directory',
    descriptionAr:
      'دليل منتقى لأوثق المنصات والموسوعات الإسلامية الرسمية للفتاوى، الحديث الشريف، تلاوات القرآن، وتعلم أحكام الدين بضغطة واحدة.',
    descriptionEn:
      'Curated directory of recognized Islamic scholarly portals for Fatwas, Hadith verification (Dorar/Sunnah), Tafseer encyclopedias, and authentic Islamic learning.',
    featuresAr: [
      'مواقع معتمدة للفتوى والحديث مثل الدرر السنية وإسلام ويب وابن باز',
      'تصنيف مرتب: القرآن والتفسير، الحديث والعقيدة، الفتاوى والبحوث',
      'معاينة وصف كل منصة قبل زيارتها أو مشاركة رابطها الموثوق',
    ],
    featuresEn: [
      'Trusted scholarly hubs: Dorar.net, IslamWeb, Bin Baz & King Fahd Complex',
      'Categorized into Qur\'an, Hadith Verification, Fatwas & Learning',
      'Clear descriptions and one-tap visit or link sharing',
    ],
    exportPreview: {
      headerAr: 'مواقع إسلامية موثوقة',
      headerEn: 'Trusted Islamic Directory',
      heroTitleAr: 'موسوعات الفتوى • تخريج الحديث • علوم القرآن',
      heroTitleEn: 'Fatwa Portals • Hadith Checkers • Qur\'an Sciences',
      heroSubAr: 'بوابة منظمة للمصادر العلمية والشرعية الموثوقة',
      heroSubEn: 'Verified Educational & Scholarly Portals',
      items: [
        { titleAr: 'مجمع الملك فهد والدرر السنية', titleEn: 'King Fahd & Dorar.net', subAr: 'مراجع القرآن الكريم وتخريج الأحاديث', subEn: 'Authentic Qur\'an & Hadith verification', badgeAr: 'مرجع', badgeEn: 'Ref' },
        { titleAr: 'بوابات الفتاوى المعتبرة', titleEn: 'Scholarly Fatwa Sites', subAr: 'فتاوى موثقة لعلماء الأمة المعتبرين', subEn: 'Accessible verified Q&A archives', badgeAr: 'فتوى', badgeEn: 'Fatwa' },
        { titleAr: 'تصنيف وبحث سريع', titleEn: 'Quick Category Filter', subAr: 'وصول منظم حسب التخصص الشرعي', subEn: 'Filter by field of Islamic knowledge', badgeAr: 'مرتب', badgeEn: 'Clean' },
      ],
    },
  },
  {
    id: 'voice-control',
    page: 'voice-control',
    icon: 'fa-microphone',
    accentColor: '#e11d48',
    titleAr: 'التحكم الصوتي الذكي',
    titleEn: 'Smart Voice Control',
    categoryAr: 'الأوامر الصوتية بالعربية والإنجليزية',
    categoryEn: 'Hands-Free Navigation',
    descriptionAr:
      'تنقّل داخل التطبيق وافتح السور أو الصفحات أو شغّل التلاوة والأذكار عبر الأوامر الصوتية الطبيعية دون لمس الشاشة.',
    descriptionEn:
      'Navigate seamlessly across the app, open any Surah, jump to pages, or trigger recitations and Adhkar completely hands-free with Arabic & English voice commands.',
    featuresAr: [
      'دعم الأوامر الصوتية لفتح أي سورة أو صفحة من صفحات التطبيق فوراً',
      'التحكم بتشغيل التلاوة والتقليب والتفسير أثناء القراءة بالصوت',
      'دليل واضح للأوامر المدعومة وتجربة استجابة فورية بالعربية والإنجليزية',
    ],
    featuresEn: [
      'Instant voice navigation to any Surah, page, or feature',
      'Control audio playback, page turns & Tafseer hands-free',
      'Interactive command reference in both Arabic & English',
    ],
    exportPreview: {
      headerAr: 'التحكم الصوتي الذكي',
      headerEn: 'Smart Voice Control',
      heroTitleAr: 'قل مثلاً: "افتح سورة الكهف" أو "مواقيت الصلاة"',
      heroTitleEn: 'Say: "Open Surah Al-Kahf" or "Prayer Times"',
      heroSubAr: 'استجابة فورية بالعربية والإنجليزية لتجربة مريحة دون لمس',
      heroSubEn: 'Bilingual Speech Recognition for Hands-Free Control',
      items: [
        { titleAr: 'فتح السور والآيات بالصوت', titleEn: 'Voice Surah Jump', subAr: 'انتقال مباشر لأي سورة أو رقم صفحة', subEn: 'Jump directly to any Surah or page', badgeAr: 'صوت', badgeEn: 'Voice' },
        { titleAr: 'التنقل بين جميع الصفحات', titleEn: 'App-Wide Navigation', subAr: 'الأذكار، القبلة، المسبحة، الورد اليومي', subEn: 'Open Adhkar, Qibla, Tasbeeh, Wird', badgeAr: 'سريع', badgeEn: 'Fast' },
        { titleAr: 'قائمة الأوامر المقترحة', titleEn: 'Command Directory', subAr: 'أمثلة جاهزة لتجربة الأوامر بسهولة', subEn: 'Ready-to-try voice command cards', badgeAr: 'دليل', badgeEn: 'Guide' },
      ],
    },
  },
  {
    id: 'search',
    page: 'search',
    icon: 'fa-magnifying-glass',
    accentColor: '#2563eb',
    titleAr: 'البحث الشامل المتقدم',
    titleEn: 'Global Advanced Search',
    categoryAr: 'بحث فوري في كل المحتوى',
    categoryEn: 'Unified Search Engine',
    descriptionAr:
      'محرك بحث محلي فوري يبحث في آيات القرآن الكريم بدون تشكيل، والأذكار والأدعية والأحاديث النووية، وينقلك مباشرة إلى موضع النتيجة.',
    descriptionEn:
      'Lightning-fast offline search across all 6,236 Qur\'an verses (diacritic-insensitive), Adhkar, Du\'as, and Nawawi Hadiths—jumping straight to the exact source.',
    featuresAr: [
      'بحث فوري متجاهل للتشكيل والهمزات في كامل آيات المصحف الشريف',
      'نتائج موحدة تشمل القرآن، الأذكار، الأدعية، حصن المسلم، والحديث',
      'انتقال بنقرة واحدة إلى الآية في المصحف أو نص الدعاء مباشرة',
    ],
    featuresEn: [
      'Diacritic-insensitive Arabic & English search across the whole Qur\'an',
      'Unified results spanning Qur\'an, Hisn Al-Muslim, Du\'as & Hadith',
      'One-tap jump straight into the exact Mushaf page or Adhkar card',
    ],
    exportPreview: {
      headerAr: 'البحث الشامل في التطبيق',
      headerEn: 'Global Unified Search',
      heroTitleAr: 'ابحث عن آية، دعاء، ذكر، أو حديث في لحظة',
      heroTitleEn: 'Search Qur\'an verses, Du\'as, Adhkar & Hadith',
      heroSubAr: 'نتائج فورية دون إنترنت مع إبراز الكلمة المفتاحية',
      heroSubEn: '100% Offline Instant Index with Highlighted Matches',
      items: [
        { titleAr: 'بحث ذكي بدون تشكيل', titleEn: 'Smart Normalization', subAr: 'يطابق الكلمات رغم اختلاف الهمزات', subEn: 'Matches root letters effortlessly', badgeAr: 'قرآن', badgeEn: 'Qur\'an' },
        { titleAr: 'تصفية حسب القسم', titleEn: 'Categorized Filters', subAr: 'قرآن • أذكار • أدعية • أحاديث', subEn: 'Qur\'an • Adhkar • Du\'as • Hadith', badgeAr: 'شامل', badgeEn: 'All' },
        { titleAr: 'فتح مباشر في المصحف', titleEn: 'Direct Jump to Verse', subAr: 'تظليل الآية فور فتح صفحة القراءة', subEn: 'Highlights target ayah automatically', badgeAr: 'انتقال', badgeEn: 'Jump' },
      ],
    },
  },
  {
    id: 'monthly-prayer-times',
    page: 'monthly-prayer-times',
    icon: 'fa-calendar-check',
    accentColor: '#0284c7',
    titleAr: 'جدول مواقيت الصلاة الشهري',
    titleEn: 'Monthly Prayer Timetable',
    categoryAr: 'مواقيت الشهر كاملاً',
    categoryEn: 'Full Month Schedule',
    descriptionAr:
      'جدول تفصيلي لمواقيت الصلوات الخمس والشروق لكل يوم في الشهر الهجري أو الميلادي مع إبراز اليوم الحالي وإمكانية استعراض الأشهر القادمة.',
    descriptionEn:
      'Complete day-by-day monthly table for Fajr, Sunrise, Dhuhr, Asr, Maghrib & Isha—highlighting today\'s row and allowing exploration of any upcoming month.',
    featuresAr: [
      'جدول منظم لكل أيام الشهر الهجري والميلادي في صفحة واحدة واضحة',
      'إبراز صف اليوم الحالي تلقائياً لسهولة المتابعة السريعة',
      'التنقل بين الشهور وتصدير أو طباعة جدول المواقيت عند الحاجة',
    ],
    featuresEn: [
      'Clear 30-day timetable displaying all six daily prayer timestamps',
      'Automatic highlighting of today\'s schedule for rapid lookup',
      'Navigate freely across future and past months anytime',
    ],
    exportPreview: {
      headerAr: 'جدول المواقيت الشهري',
      headerEn: 'Monthly Prayer Schedule',
      heroTitleAr: 'مواقيت ٣٠ يوماً كاملة • تمييز اليوم الحالي',
      heroTitleEn: 'Full 30-Day Timetable • Today Highlighted',
      heroSubAr: 'الفجر • الشروق • الظهر • العصر • المغرب • العشاء',
      heroSubEn: 'Fajr • Sunrise • Dhuhr • Asr • Maghrib • Isha',
      items: [
        { titleAr: 'عرض جدولي واضح ومرتب', titleEn: 'Structured Grid View', subAr: 'مقارنة الفروق الزمنية يوماً بيوم', subEn: 'Track daily solar shift effortlessly', badgeAr: '٣٠ يوم', badgeEn: '30d' },
        { titleAr: 'تبديل الأشهر بسهولة', titleEn: 'Month Navigation', subAr: 'معاينة مواقيت رمضان والأشهر القادمة', subEn: 'Preview Ramadan & upcoming schedules', badgeAr: 'شهري', badgeEn: 'Month' },
        { titleAr: 'متزامن مع إعدادات بلدك', titleEn: 'Synced Calculation', subAr: 'يعكس طريقة الحساب والمذهب المختار', subEn: 'Reflects your exact city & Madhab', badgeAr: 'دقيق', badgeEn: 'Exact' },
      ],
    },
  },
  {
    id: 'prayer-calculation-settings',
    page: 'prayer-calculation-settings',
    icon: 'fa-sliders',
    accentColor: '#0369a1',
    titleAr: 'إعدادات الحساب الفلكي والموقع',
    titleEn: 'Calculation & Location Settings',
    categoryAr: 'ضبط المواقيت والموقع',
    categoryEn: 'Precision Configuration',
    descriptionAr:
      'تحكم كامل بطريقة الحساب الفلكية المعتمدة في بلدك (أم القرى، الهيئة المصرية، رابطة العالم الإسلامي...)، المذهب الفقهي للعصر، والتعديل اليدوي بالدقائق.',
    descriptionEn:
      'Fine-tune prayer calculation authorities (Umm Al-Qura, Egyptian Authority, MWL, ISNA), Asr juristic method (Shafi\'i/Hanafi), GPS city lookup, and per-prayer minute offsets.',
    featuresAr: [
      'اختيار الهيئة الفلكية المعتمدة لبلدك وتحديد الموقع التلقائي أو اليدوي',
      'تحديد مذهب صلاة العصر (الجمهور / الحنفي) وحساب خطوط العرض العليا',
      'تعديل يدوي دقيق (+/- دقائق) لكل صلاة على حدة لتطابق مساجد مدينتك',
    ],
    featuresEn: [
      'Select regional Fiqh authorities & update GPS or manual city location',
      'Choose Asr shadow factor (Standard / Hanafi) & high-latitude rules',
      'Per-prayer minute adjustments (+/-) to match your local mosque',
    ],
    exportPreview: {
      headerAr: 'إعدادات الحساب الفلكي للمواقيت',
      headerEn: 'Prayer Calculation Settings',
      heroTitleAr: 'طريقة الحساب • المذهب الفقهي • التعديل الدقيق بالدقائق',
      heroTitleEn: 'Authority Method • Juristic Asr • Minute Offsets',
      heroSubAr: 'تحديد تلقائي عبر GPS أو اختيار يدوي لأي مدينة حول العالم',
      heroSubEn: 'Auto GPS Detection or Manual Global City Selection',
      items: [
        { titleAr: 'هيئات الحساب المعتمدة', titleEn: 'Global Calculation Methods', subAr: 'أم القرى • المصرية • الرابطة • إيسنا', subEn: 'Umm Al-Qura • Egyptian • MWL • ISNA', badgeAr: 'فلكي', badgeEn: 'Method' },
        { titleAr: 'تعديل الدقائق لكل فرض', titleEn: 'Per-Prayer Offsets', subAr: 'مواءمة تامة مع تقويم مدينتك', subEn: 'Fine-tune every single prayer time', badgeAr: '+/- د', badgeEn: '+/- m' },
        { titleAr: 'المذهب الحنفي والجمهور', titleEn: 'Juristic Asr Rule', subAr: 'ضبط وقت العصر وفق المذهب المعتمد', subEn: 'Standard 1× or Hanafi 2× shadow', badgeAr: 'فقهي', badgeEn: 'Fiqh' },
      ],
    },
  },
];
