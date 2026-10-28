import { SpotlightStep } from './CommunitySpotlightGuide';

export const DAILY_SETTINGS_STEPS: SpotlightStep[] = [
  {
    id: 'wird_name',
    targetSelector: '#wird-name-container',
    titleAr: 'إسم الورد أو الختمة',
    titleEn: 'Wird or Khatma Name',
    descAr: 'قم بتسمية وردك القرآني (مثل ختمة رمضان أو الورد اليومي) لتمييزه بسهولة.',
    descEn: 'Name your Quranic wird (e.g. Ramadan Khatma or Daily Wird) to easily identify it.',
    badgeAr: 'اسم الختمة',
    badgeEn: 'Khatma Name',
    iconName: 'user',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'wird_mode',
    targetSelector: '#wird-mode-container',
    titleAr: 'طريقة تنظيم الختمة',
    titleEn: 'Khatma Method',
    descAr: 'اختر ما إذا كنت تريد تنظيم الختمة حسب عدد الأيام (مثلاً 30 يوماً) أو حسب عدد الصفحات يومياً.',
    descEn: 'Choose whether to organize your khatma by number of days (e.g. 30 days) or daily pages.',
    badgeAr: 'طريقة الختمة',
    badgeEn: 'Khatma Method',
    iconName: 'tab',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'wird_value',
    targetSelector: '#wird-value-container',
    titleAr: 'تحديد القيمة والكمية',
    titleEn: 'Value & Quantity',
    descAr: 'أدخل عدد الأيام المطلوبة لإتمام الختمة، أو عدد الصفحات التي تود قراءتها يومياً.',
    descEn: 'Enter the required days to complete the khatma, or the number of pages to read daily.',
    badgeAr: 'القيمة',
    badgeEn: 'Value',
    iconName: 'action',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'wird_start',
    targetSelector: '#wird-start-container',
    titleAr: 'زر حفظ وبدء الختمة',
    titleEn: 'Start & Save Khatma Button',
    descAr: 'اضغط هنا لحفظ إعدادات الختمة والبدء فوراً في متابعة وردك وتلاوتك.',
    descEn: 'Tap here to save khatma settings and immediately start tracking your wird and recitation.',
    badgeAr: 'البدء',
    badgeEn: 'Start',
    iconName: 'nav',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  }
];

export const DAILY_PROGRESS_STEPS: SpotlightStep[] = [
  {
    id: 'wird_notifications_toggle',
    targetSelector: '#wird-notifications-toggle-btn',
    titleAr: 'تفعيل وتعطيل تنبيهات الورد اليومي',
    titleEn: 'Daily Wird Reminders Toggle',
    descAr: 'اضغط على هذا الزر لتشغيل أو إيقاف التنبيهات اليومية لتذكيرك بقراءة وردك في الوقت المحدد (أخضر = مفعل / أحمر = معطل).',
    descEn: 'Tap this button to turn daily wird reminder notifications on or off (Green = Enabled / Red = Disabled).',
    badgeAr: 'التنبيهات',
    badgeEn: 'Notifications',
    iconName: 'bell',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'wird_profile',
    targetSelector: '#wird-profile-selector',
    titleAr: 'بطاقة المستخدم الحالي والختمات',
    titleEn: 'Current User & Khatmas',
    descAr: 'هذا هو المستخدم الحالي والختمة النشطة، يمكنك الضغط على هذه البطاقة للتبديل بين المستخدمين والختمات أو إضافة ختمة جديدة.',
    descEn: 'This is the current user and active khatma. Tap this card to switch users or create a new khatma.',
    badgeAr: 'المستخدم الحالي',
    badgeEn: 'Current User',
    iconName: 'user',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'wird_progress',
    targetSelector: '#wird-progress-container',
    titleAr: 'مؤشر إنجاز الختمة والتقدم',
    titleEn: 'Progress & Completion Rate',
    descAr: 'تابع نسبة إنجازك الإجمالية للختمة وعدد الأيام المكتملة بكل دقة وسهولة.',
    descEn: 'Track your overall khatma completion percentage and completed days precisely.',
    badgeAr: 'الإنجاز',
    badgeEn: 'Progress',
    iconName: 'quran',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'wird_today',
    targetSelector: '#wird-today-container',
    titleAr: 'تفاصيل ورد اليوم الحالي',
    titleEn: 'Today’s Wird Details',
    descAr: 'يعرض لك صفحات الورد المحددة لهذا اليوم (من صفحة كذا إلى صفحة كذا) بدقة.',
    descEn: 'Shows you the specified wird pages for today (from page X to page Y) precisely.',
    badgeAr: 'الورد اليومي',
    badgeEn: 'Daily Wird',
    iconName: 'search',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'wird_actions',
    targetSelector: '#wird-actions-container',
    titleAr: 'أزرار القراءة وتسجيل الإنجاز',
    titleEn: 'Reading & Action Buttons',
    descAr: 'افتح المصحف مباشرة للقراءة عند صفحة الورد، أو اضغط لتسجيل اليوم كمكتمل.',
    descEn: 'Open the Mushaf directly for reading at your wird page, or tap to mark the day as completed.',
    badgeAr: 'التفاعل',
    badgeEn: 'Actions',
    iconName: 'action',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'wird_edit',
    targetSelector: '#wird-edit-btn',
    titleAr: 'تعديل الختمة',
    titleEn: 'Edit Khatma',
    descAr: 'اضغط هنا لتعديل إعدادات الختمة الحالية أو تغيير طريقة التنظيم.',
    descEn: 'Tap here to edit current khatma settings or change the organization method.',
    badgeAr: 'تعديل',
    badgeEn: 'Edit',
    iconName: 'action',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'wird_reset',
    targetSelector: '#wird-reset-btn',
    titleAr: 'إعادة تعيين',
    titleEn: 'Reset',
    descAr: 'اضغط هنا لمسح سجل الختمة الحالية والبدء من جديد.',
    descEn: 'Tap here to clear the current khatma history and start over.',
    badgeAr: 'إعادة تعيين',
    badgeEn: 'Reset',
    iconName: 'nav',
    accentColor: '#ef4444',
    gradient: 'from-red-500 to-rose-600'
  }
];

// 15. خطوات إرشاد شاشة إعداد التحفيظ والتكرار
export const MEMORIZATION_SETUP_STEPS: SpotlightStep[] = [
  {
    id: 'mem_tabs',
    targetSelector: '#memorization-tabs-container',
    titleAr: 'تبويبات التحفيظ والمراجعة',
    titleEn: 'Memorization & Review Tabs',
    descAr: 'تنقل بسهولة بين إعداد جلسات الحفظ والتكرار الذكي، وجدول المراجعة الدورية وتثبيت المحفوظات.',
    descEn: 'Easily switch between setting up new memorization sessions and managing your periodic review schedule.',
    badgeAr: 'الأقسام',
    badgeEn: 'Tabs',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mem_reader',
    targetSelector: '#reader-select-container',
    titleAr: 'اختيار القارئ المفضل',
    titleEn: 'Select Reciter',
    descAr: 'اختر القارئ المفضل لديك للاستماع لتلاوته المتقنة والترديد خلفه أثناء جلسة الحفظ المباركة.',
    descEn: 'Choose your preferred reciter to listen to accurate recitations and repeat after them during memorization.',
    badgeAr: 'القارئ',
    badgeEn: 'Reciter',
    iconName: 'user',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'mem_range',
    targetSelector: '#ayah-range-container',
    titleAr: 'تحديد نطاق السور والآيات',
    titleEn: 'Surah & Ayah Range',
    descAr: 'حدد بدقة السورة والآية التي تود بدء الحفظ منها، والسورة والآية التي ينتهي عندها المقطع.',
    descEn: 'Accurately specify the starting surah and ayah, as well as the ending point of the passage to memorize.',
    badgeAr: 'نطاق الآيات',
    badgeEn: 'Ayah Range',
    iconName: 'verse',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'mem_repeat',
    targetSelector: '#repetition-settings-container',
    titleAr: 'إعدادات التكرار والربط الذكي',
    titleEn: 'Repetition & Linking Settings',
    descAr: 'حدد عدد مرات تكرار كل آية، وعدد تكرار كامل النطاق، مع ميزة «ربط الآيات» لترسيخ المعاني، ومدة السكتة للترديد.',
    descEn: 'Set repetitions per ayah, whole range loops, verse linking for deep retention, and pause length to repeat along.',
    badgeAr: 'التكرار والربط',
    badgeEn: 'Repetition',
    iconName: 'action',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'mem_test',
    targetSelector: '#test-after-session-container',
    titleAr: 'اختبار بعد الجلسة',
    titleEn: 'Post-Session Test',
    descAr: 'فعّل هذا الخيار لاختبار حفظك ذاتياً وتفاعلياً بمجرد انتهاء التكرار للتأكد من رسوخ الآيات في صدرك.',
    descEn: 'Enable this option to take an interactive self-test right after your repetition session to verify retention.',
    badgeAr: 'الاختبار',
    badgeEn: 'Test',
    iconName: 'action',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'mem_start',
    targetSelector: '#btn-start-memorization',
    titleAr: 'بدء جلسة التحفيظ',
    titleEn: 'Start Memorization Session',
    descAr: 'اضغط هنا لفتح المصحف الشريف وبدء جلسة التلاوة والتكرار المخصصة وفق الإعدادات التي اخترتها.',
    descEn: 'Tap here to launch the Quran screen and begin your interactive repetition session according to your plan.',
    badgeAr: 'ابدأ الآن',
    badgeEn: 'Start Now',
    iconName: 'quran',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mem_download',
    targetSelector: '#btn-download-reciters',
    titleAr: 'تحميل التلاوات بدون إنترنت',
    titleEn: 'Download Offline Recitations',
    descAr: 'يمكنك تحميل سور القراء مسبقاً على هاتفك للاستمرار في التحفيظ والمراجعة في أي وقت دون الحاجة لشبكة الإنترنت.',
    descEn: 'Download surahs beforehand so you can continue your memorization practice offline anywhere, anytime.',
    badgeAr: 'بدون إنترنت',
    badgeEn: 'Offline Audio',
    iconName: 'nav',
    accentColor: '#0284c7',
    gradient: 'from-cyan-500 to-blue-600'
  }
];

// 16. خطوات إرشاد شاشة جدول المراجعة والتثبيت
export const MEMORIZATION_REVIEW_STEPS: SpotlightStep[] = [
  {
    id: 'rev_tabs',
    targetSelector: '#memorization-tabs-container',
    titleAr: 'جدول المراجعة الدورية',
    titleEn: 'Periodic Review Schedule',
    descAr: 'هذا القسم مخصص لإدارة وتثبيت ما حفظته وفق خوارزمية التكرار المتباعد لتفادي النسيان.',
    descEn: 'This section organizes and strengthens what you memorized using spaced repetition so you never forget.',
    badgeAr: 'المراجعة',
    badgeEn: 'Review',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'rev_stats',
    targetSelector: '#memorization-review-stats',
    titleAr: 'إحصائيات الإنجاز والمراجعة',
    titleEn: 'Memorization Stats',
    descAr: 'يعرض لك إجمالي المقاطع المحفوظة، مع بيان عدد المقاطع التي استحقت موعد المراجعة اليوم.',
    descEn: 'Displays total memorized ranges and the number of passages due for review today.',
    badgeAr: 'الإحصائيات',
    badgeEn: 'Stats',
    iconName: 'profile',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'rev_list',
    targetSelector: '#first-review-card, #memorization-review-empty, #memorization-review-list',
    titleAr: 'قائمة المحفوظات للمراجعة',
    titleEn: 'Review Schedule List',
    descAr: 'يعرض جميع مقاطعك المحفوظة مع تواريخ مراجعتها؛ يمكنك الضغط على زر «بدء جلسة المراجعة والتثبيت» للانطلاق فوراً في تثبيتها، أو حذفها.',
    descEn: 'Lists all your memorized passages with due dates; tap "Start Review & Fixation Session" to review immediately or delete them.',
    badgeAr: 'جدول المحفوظات',
    badgeEn: 'Schedule List',
    iconName: 'quran',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  }
];

export const RUQYAH_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'ruqyah_page_intro',
    titleAr: 'الرقية الشرعية من الكتاب والسنة',
    titleEn: "Al-Ruqyah Al-Shar'iyyah",
    descAr: 'رقية شرعية جامعة وشاملة للتحصين والاستشفاء ودفع كل أذى وسوء، بآيات القرآن الكريم والأدعية النبوية الثابتة عن النبي ﷺ مع إمكانية القراءة والاستماع الصوتي.',
    descEn: 'Comprehensive spiritual healing and protection from the Holy Quran and authentic Prophetic supplications, with recitation and audio listening.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const WORSHIP_MENTOR_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'worship_mentor_auto_sync',
    targetSelector: '#habit-auto-sync-btn',
    titleAr: 'زر التفعيل والتعطيل (المزامنة الذكية)',
    titleEn: 'Auto-Sync Toggle',
    descAr: 'يمكنك تفعيل أو تعطيل الربط التلقائي للعبادات؛ عند تفعيله يتم احتساب صفحات القرآن المقروءة تلقائياً من المصحف الشريف وجدولة تذكيرات الطاعات.',
    descEn: 'Toggle automatic worship synchronization; when enabled, Quran pages read in the reader are auto-counted and prayer/habit notifications are scheduled.',
    badgeAr: 'المزامنة التلقائية',
    badgeEn: 'Auto-Sync',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'worship_mentor_achievement_text',
    targetSelector: '#habit-achievement-title',
    titleAr: 'نص إنجاز اليوم والتاريخ',
    titleEn: 'Daily Achievement & Date',
    descAr: 'يعرض عنوان الإنجاز لليوم المحدد مع التاريخ الهجري والميلادي بدقة لتتعرف على اليوم الجاري وتتابع وردك فيه.',
    descEn: 'Displays the achievement title for the selected day along with the Gregorian and Hijri dates to monitor your current progress.',
    badgeAr: 'اليوم والتاريخ',
    badgeEn: 'Day & Date',
    iconName: 'calendar',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'worship_mentor_weekly_btn',
    targetSelector: '#weekly-card-btn',
    titleAr: 'زر الأسبوع',
    titleEn: 'Weekly Achievement',
    descAr: 'اضغط هنا لفتح شاشة إنجاز الأسبوع؛ تمنحك تحليلاً تفصيلياً لنسبة التزامك وأبرز الطاعات التي داومت عليها طوال الأسبوع.',
    descEn: 'Tap here to view your weekly achievement report with in-depth stats on your consistency and weekly highlights.',
    badgeAr: 'تقرير الأسبوع',
    badgeEn: 'Weekly Report',
    iconName: 'calendar',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'worship_mentor_archive_btn',
    targetSelector: '#habit-archive-btn',
    titleAr: 'زر السجل',
    titleEn: 'Records & Archive',
    descAr: 'ينقلك إلى سجل الأرشيف الشهري الكامل؛ لمراجعة تاريخ عباداتك لكل الشهور والأيام السابقة وتتبع التطور الإيماني.',
    descEn: 'Navigates to your complete monthly archive to review past habits, streaks, and continuous spiritual growth.',
    badgeAr: 'سجل العبادات',
    badgeEn: 'Worship Archive',
    iconName: 'file',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'worship_mentor_score_points',
    targetSelector: '#habit-score-badge',
    titleAr: 'رصيد النقاط (103 نقطة)',
    titleEn: 'Points Score (103 Pts)',
    descAr: 'عداد النقاط الإجمالي: إجمالي نقاط طاعات اليوم الكاملة 103 نقطة موزعة على الفرائض والسنن والأذكار؛ تزداد مع كل طاعة تنجزها.',
    descEn: 'Daily points counter: a total of 103 points distributed across obligatory prayers, sunnahs, adhkar, and righteous deeds.',
    badgeAr: '103 نقطة',
    badgeEn: '103 Points',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'worship_mentor_percentage_ring',
    targetSelector: '#habit-progress-ring',
    titleAr: 'النسبة المئوية للإنجاز',
    titleEn: 'Completion Percentage',
    descAr: 'حلقة بيانية تفاعلية تعرض النسبة المئوية المكتملة لطاعاتك اليوم؛ ترتفع تدريجياً كلما أنجزت عبادة حتى تصل إلى 100% بإذن الله.',
    descEn: 'Interactive circular progress indicator displaying your daily completion percentage up to 100%.',
    badgeAr: 'النسبة المئوية',
    badgeEn: 'Percentage',
    iconName: 'action',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'worship_mentor_heatmap_days',
    targetSelector: '#habit-heatmap-grid',
    titleAr: 'المربعات التي تمثل كل يوم من الأيام',
    titleEn: 'Daily Activity Heatmap',
    descAr: 'مربعات تفاعلية تمثل آخر 30 يوماً؛ يتغير لونها تبعاً لنسبة إنجازك في كل يوم، ويمكنك النقر على أي مربع يوم لعرض أو تسجيل عبادات ذلك اليوم مباشرة.',
    descEn: 'Heatmap boxes representing the last 30 days. Click any day box to navigate to it and view or record its worships.',
    badgeAr: 'مربعات الأيام',
    badgeEn: 'Days Grid',
    iconName: 'calendar',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'worship_mentor_prayers_section',
    targetSelector: '#habit-prayers-fard-sunnah-section',
    titleAr: 'بطاقة الصلوات المكتوبة والسنن الرواتب',
    titleEn: 'Obligatory Prayers & Sunnah',
    descAr: 'إرشاد موحد لبطاقات الصلوات الخمس المفروضة والسنن الرواتب التابعة لها؛ انقر على زر (الفريضة) أو (السنة) عند أدائها لتوثيقها واحتساب نقاطها.',
    descEn: 'Section for the five obligatory prayers and confirmed sunnahs; tap (Fard) or (Sunnah) once performed to record points.',
    badgeAr: 'الفرائض والسنن',
    badgeEn: 'Prayers & Sunnah',
    iconName: 'clock',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'worship_mentor_nawafil_section',
    targetSelector: '#habit-nawafil-section',
    titleAr: 'صلوات النوافل',
    titleEn: 'Supererogatory Prayers (Nawafil)',
    descAr: 'إرشاد موحد لصلوات النوافل وقيام الليل: ركعات الشفع والوتر، قيام الليل، صلاة الضحى، تحية المسجد، وصلاة الاستخارة والتوبة والحاجة.',
    descEn: 'Section for voluntary prayers: Shafa & Witr, Qiyam, Duha, Tahiyatul Masjid, and other recommended prayers.',
    badgeAr: 'النوافل والقيام',
    badgeEn: 'Nawafil & Qiyam',
    iconName: 'moon',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'worship_mentor_quran_section',
    targetSelector: '#quran-habit-section',
    titleAr: 'الورد القرآني',
    titleEn: 'Daily Quran Recitation',
    descAr: 'إرشاد موحد لقسم الورد القرآني؛ تتبع عدد الصفحات والأجزاء المقروءة يومياً مع التحديث التلقائي أثناء القراءة أو الزيادة والنقصان يدوياً بالأزرار.',
    descEn: 'Track your daily Quran recitation in pages and juz. Auto-synced from Quran reading or manually editable.',
    badgeAr: 'الورد القرآني',
    badgeEn: 'Quran Recitation',
    iconName: 'quran',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'worship_mentor_adhkar_section',
    targetSelector: '#habit-adhkar-section',
    titleAr: 'الأذكار اليومية',
    titleEn: 'Daily Adhkar',
    descAr: 'إرشاد موحد لقسم الأذكار؛ تتبع أذكار الصباح والمساء، أذكار بعد الصلاة المفروضة، ورد الاستغفار، والأدعية المأثورة.',
    descEn: 'Track Morning & Evening Athkar, post-prayer remembrances, daily istighfar, and authentic supplications.',
    badgeAr: 'الأذكار المأثورة',
    badgeEn: 'Daily Adhkar',
    iconName: 'block',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'worship_mentor_ethics_section',
    targetSelector: '#habit-ethics-section',
    titleAr: 'بر الوالدين والأخلاق',
    titleEn: 'Kindness, Ethics & Charity',
    descAr: 'إرشاد موحد لطاعات البر والمعاملات: بر الوالدين والدعاء لهما، الصدقات، صلة الأرحام، وعيادة المرضى؛ لترتقي بالخلق الرفيع.',
    descEn: 'Track acts of goodness: filial piety & prayers for parents, charity, visiting kin, and checking on the sick.',
    badgeAr: 'البر والأخلاق',
    badgeEn: 'Ethics & Kindness',
    iconName: 'user',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'worship_mentor_add_habit_btn',
    targetSelector: '#habit-add-custom-btn',
    titleAr: 'زر إضافة عبادة',
    titleEn: 'Add Custom Habit Button',
    descAr: 'اضغط هنا لفتح نافذة إضافة عبادة أو ورد شخصي تفضله؛ وتعيين رمزها وتحديد ما إذا كانت يومية أو في أيام محددة كالاثنين والخميس.',
    descEn: 'Tap to add your own personal worship or habit with a custom icon and schedule (daily or specific weekdays).',
    badgeAr: 'إضافة عبادة',
    badgeEn: 'Add Habit',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'worship_mentor_past_days_card',
    targetSelector: '#habit-date-navigation-card',
    titleAr: 'بطاقة الأيام السابقة واختيار التاريخ',
    titleEn: 'Past Days Navigation Card',
    descAr: 'تمكنك من التنقل بين الأيام السابقة لتوثيق العبادات الفائتة، أو النقر على التاريخ لاختيار أي يوم من مصفوفة التقويم مباشرة.',
    descEn: 'Enables navigating past days to record previous worships or tapping the date to open the calendar picker.',
    badgeAr: 'الأيام السابقة',
    badgeEn: 'Past Days',
    iconName: 'calendar',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  }
];

export const CUSTOM_HABIT_MODAL_STEPS: SpotlightStep[] = [
  {
    id: 'custom_habit_title_step',
    targetSelector: '#custom-habit-title-box',
    titleAr: 'اسم العبادة أو الطاعة',
    titleEn: 'Habit Name',
    descAr: 'اكتب اسم العبادة أو الطاعة التي ترغب في المداومة عليها (مثال: صيام الاثنين والخميس، ركعتي الضحى، قراءة سورة الملك).',
    descEn: 'Enter the title of the worship or habit you wish to cultivate (e.g. fasting Mondays and Thursdays, Surah Al-Mulk).',
    badgeAr: 'اسم العبادة',
    badgeEn: 'Habit Name',
    iconName: 'text',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'custom_habit_icon_step',
    targetSelector: '#custom-habit-icon-box',
    titleAr: 'رمز وأيقونة العبادة',
    titleEn: 'Habit Icon',
    descAr: 'اختر أيقونة معبرة لتمييز عبادتك في قائمة العبادات والبطاقات اليومية.',
    descEn: 'Select an expressive emoji icon to distinguish this worship in your daily list.',
    badgeAr: 'الأيقونة',
    badgeEn: 'Icon',
    iconName: 'emoji',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'custom_habit_recurrence_step',
    targetSelector: '#custom-habit-recurrence-box',
    titleAr: 'تكرار العبادة وجدولتها',
    titleEn: 'Frequency & Scheduled Days',
    descAr: 'حدد تكرار العبادة سواء كانت يومياً في كل يوم، أو في أيام محددة من الأسبوع (مثل الاثنين والخميس أو الجمعة فقط).',
    descEn: 'Set whether this habit occurs daily or on specific days of the week (such as Mon & Thu, or Friday only).',
    badgeAr: 'الجدولة والتكرار',
    badgeEn: 'Recurrence',
    iconName: 'calendar',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'custom_habit_save_step',
    targetSelector: '#custom-habit-save-btn',
    titleAr: 'حفظ وإضافة العبادة',
    titleEn: 'Save & Add Habit',
    descAr: 'انقر على زر الحفظ لتثبيت عبادتك الجديدة وتفعيل متابعتها في قائمة الطاعات اليومية فوراً.',
    descEn: 'Tap save to record your new habit and immediately start tracking it in your daily worship list.',
    badgeAr: 'حفظ العبادة',
    badgeEn: 'Save Habit',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

// 12. خطوات إرشاد الحاسبة الشرعية - تبويب الزكاة
export const CALCULATOR_ZAKAT_STEPS: SpotlightStep[] = [
  {
    id: 'calc_tabs_bar',
    targetSelector: '#calc-tabs-bar',
    titleAr: 'تبويبات الحاسبة الشرعية',
    titleEn: 'Sharia Calculator Tabs',
    descAr: 'شريط التبويبات الفقهية: تنقل بسهولة بين حاسبة الزكاة بأنواعها، حاسبة المواريث والتركات، حاسبة الكفارات وفدية الصيام، وحاسبة زكاة الفطر والأضاحي والعقيقة.',
    descEn: 'Jurisprudence tabs bar: easily switch between Zakat, Inheritance, Expiations & Fidyah, and Fitr, Udhiyah & Aqiqah.',
    badgeAr: 'الأقسام الفقهية',
    badgeEn: 'Calculator Tabs',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'zakat_header_actions',
    targetSelector: '#zakat-header-actions',
    titleAr: 'شريط النتائج وزر إعادة الضبط',
    titleEn: 'Total Badge & Reset Action',
    descAr: 'يعرض شارة إجمالي الزكاة النقدية المستحقة فورياً بمجرد إدخال البيانات، مع زر (إعادة ضبط) لمسح جميع الحقول والبدء بحساب جديد بلمسة واحدة.',
    descEn: 'Displays the live calculated cash zakat total badge, with a (Reset) button to instantly clear all inputs and start fresh.',
    badgeAr: 'الإجمالي وإعادة الضبط',
    badgeEn: 'Total & Reset',
    iconName: 'action',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'zakat_card_cash',
    targetSelector: '#zakat-card-cash',
    titleAr: 'بطاقة زكاة النقود والمدخرات',
    titleEn: 'Cash & Savings Zakat Card',
    descAr: 'أدخل إجمالي أموالك النقدية الحاضرة ومدخراتك البنكية والودائع التي حال عليها الحول القمري (مرور عام هجري كامل)؛ حيث تجب فيها الزكاة شرعاً بنسبة 2.5% (ربع العُشر) عند بلوغ النصاب.',
    descEn: 'Enter all your cash in hand and bank savings held for a full lunar year (Hawl); zakat is due at 2.5% upon reaching the Nisab threshold.',
    badgeAr: 'زكاة النقود',
    badgeEn: 'Cash & Savings',
    iconName: 'block',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'zakat_card_gold_silver',
    targetSelector: '#zakat-card-gold-silver',
    titleAr: 'بطاقة زكاة الذهب والفضة',
    titleEn: 'Gold & Silver Zakat Card',
    descAr: 'بطاقة شاملة لحساب زكاة المعادن الثمينة: أدخل الوزن وسعر الجرام الحالي في بلدك لعيار 24 (نصابه 85 جم)، عيار 21 (نصابه 97.14 جم)، عيار 18 (نصابه 113.33 جم)، والفضة (نصابها 595 جم)؛ ليقوم النظام آلياً بضرب الأوزان بالأسعار وتحديد بلوغ النصاب الشرعي واحتساب مقدار الزكاة المستحقة بنسبة 2.5%.',
    descEn: 'All-in-one precious metals card: enter weight and market price per gram for 24K (Nisab 85g), 21K (Nisab 97.14g), 18K (Nisab 113.33g), and Silver (Nisab 595g); automatically computes values, verifies Nisab, and calculates 2.5% due.',
    badgeAr: 'الذهب والفضة',
    badgeEn: 'Gold & Silver',
    iconName: 'block',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'zakat_card_trade',
    targetSelector: '#zakat-card-trade',
    titleAr: 'بطاقة عروض التجارة والعقارات',
    titleEn: 'Trade Merchandise & Real Estate Card',
    descAr: 'تشمل تقييم البضائع المعروضة للبيع والنشاط التجاري بسعر السوق الحالي عند تمام الحول، وإيرادات وغلة العقارات الاستثمارية المؤجرة بعد مرور عام قمري عليها، وتُضم لحساب الوعاء الزكوي بنسبة 2.5%.',
    descEn: 'Evaluates inventory goods for trade at current market selling prices at the end of Hawl, plus investment rental revenues held for a lunar year, taxed at 2.5%.',
    badgeAr: 'عروض التجارة',
    badgeEn: 'Trade & Properties',
    iconName: 'block',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'zakat_card_crops',
    targetSelector: '#zakat-card-crops',
    titleAr: 'بطاقة زكاة الزروع والثمار',
    titleEn: 'Crops & Agricultural Produce Card',
    descAr: 'لحساب زكاة المحاصيل والثمار يوم حصادها؛ نصابها 5 أوسق (حوالي 653 كجم)، مع تحديد طريقة الري: ري طبيعي بالأمطار والعيون (الواجب 10% - العُشر)، أو ري بآلات ومضخات وتكلفة (الواجب 5% - نصف العُشر)، مع إمكانية إدخال سعر الكيلو لحساب القيمة النقدية المقابلة اختيارياً.',
    descEn: 'Calculates agricultural zakat at harvest time; Nisab is 5 Awsuq (~653 kg), select irrigation: natural rainfed (10% due) or artificial machinery (5% due), with optional price per kg to compute monetary value.',
    badgeAr: 'الزروع والثمار',
    badgeEn: 'Agricultural Zakat',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'zakat_card_livestock',
    targetSelector: '#zakat-card-livestock',
    titleAr: 'بطاقة زكاة الأنعام والركاز',
    titleEn: 'Livestock & Rikaz Card',
    descAr: 'أدخل أعداد الماشية السائمة لحساب زكاتها الشرعية: الإبل (نصابها من 5)، البقر (نصابها من 30)، الغنم والماعز (نصابها من 40) لمعرفة نوع وعدد الرؤوس الواجب إخراجها، بالإضافة لحقل الركاز والمعادن المدفونة التي تجب فيها نسبة الخُمس (20%) فور استخراجها دون اشتراط حول.',
    descEn: 'Enter grazing livestock counts: camels (Nisab 5), cattle (Nisab 30), sheep/goats (Nisab 40) to determine due animal types, plus buried treasures (Rikaz) and minerals taxed at 20% immediately without Hawl.',
    badgeAr: 'الأنعام والركاز',
    badgeEn: 'Livestock & Rikaz',
    iconName: 'block',
    accentColor: '#ea580c',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'zakat_card_summary',
    targetSelector: '#zakat-card-summary',
    titleAr: 'بطاقة الملخص النهائي للزكاة النقدية',
    titleEn: 'Final Cash Zakat Summary Card',
    descAr: 'الملخص الشامل للزكاة؛ يعرض إجمالي المبالغ الواجب إخراجها نقدياً، مع تفصيل نصيب كل قسم (الأموال والتجارة، المحاصيل، الركاز)، وتنبيه فقهي ذكي باللون الأحمر في حال لم يبلغ مجموع المال النصاب الشرعي المحدد.',
    descEn: 'Comprehensive summary displaying total payable cash zakat, breakdown by category (monetary/trade, crops, rikaz), and alert if wealth is below Nisab.',
    badgeAr: 'الملخص النهائي',
    badgeEn: 'Final Summary',
    iconName: 'action',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

// خطوات إرشاد الحاسبة الشرعية - تبويب المواريث والتركات
export const CALCULATOR_MAWARITH_STEPS: SpotlightStep[] = [
  {
    id: 'mawarith_header_actions',
    targetSelector: '#mawarith-header-actions',
    titleAr: 'شريط المواريث وإعادة الضبط',
    titleEn: 'Inheritance Header & Reset',
    descAr: 'عنوان قسم المواريث وحساب التركات، مزود بزر (إعادة ضبط) لمسح جميع بيانات الورثة والتركة والبدء في حل مسألة فقهية جديدة بلمسة واحدة.',
    descEn: 'Inheritance calculation header equipped with a (Reset) button to instantly clear all heirs and estate figures to start a new case.',
    badgeAr: 'إدارة المسألة',
    badgeEn: 'Header & Reset',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mawarith_card_estate',
    targetSelector: '#mawarith-card-estate',
    titleAr: 'بطاقة قيمة التركة الإجمالية',
    titleEn: 'Total Estate Value Card',
    descAr: 'أدخل المبلغ الصافي للتركة المراد توزيعها على الورثة، وذلك بعد خصم تكاليف تجهيز الميت وتكفينه ودفنه، وسداد جميع ديونه المستحقة للعباد ولله، وإنفاذ وصاياه الشرعية الصحيحة في حدود الثلث لغير وارث.',
    descEn: 'Enter net estate value after deducting funeral expenses, settling all debts, and executing valid wills within one-third for non-heirs.',
    badgeAr: 'قيمة التركة',
    badgeEn: 'Estate Value',
    iconName: 'block',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'mawarith_card_parents',
    targetSelector: '#mawarith-card-parents',
    titleAr: 'بطاقة الأصول (الآباء والأجداد)',
    titleEn: 'Ascendants (Parents & Grandparents) Card',
    descAr: 'حدد وجود الأب والأم والجد لأب والجدات من الجهتين؛ حيث يرث الأب بالفرض أو التعصيب ويحجب الأجداد والإخوة، وترث الأم الثلث أو السدس مع حجب الجدات، وتتفاعل الخيارات ذاتياً بحسب قواعد الحجب الفقهية.',
    descEn: 'Select living parents and grandparents; father inherits by quota or Ta\'seeb and blocks grandfathers and siblings, mother inherits 1/3 or 1/6 and blocks grandmothers.',
    badgeAr: 'الآباء والأجداد',
    badgeEn: 'Ascendants',
    iconName: 'user',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'mawarith_card_spouses',
    targetSelector: '#mawarith-card-spouses',
    titleAr: 'بطاقة الزوج والزوجة',
    titleEn: 'Spouse Status Card',
    descAr: 'اختر الحالة الزوجية للمتوفى (زوج يرث النصف أو الربع، أو زوجة ترث الربع أو الثمن بحسب وجود الفرع الوارث)، مع إمكانية تحديد عدد الزوجات (من 1 إلى 4) ليتم اقتسام نصيب الزوجية بينهن بالتساوي.',
    descEn: 'Select surviving spouse (husband inherits 1/2 or 1/4, or wife inherits 1/4 or 1/8 based on descendants), with wives counter (1-4) sharing the portion equally.',
    badgeAr: 'الزوجية',
    badgeEn: 'Spouses',
    iconName: 'user',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'mawarith_card_descendants',
    targetSelector: '#mawarith-card-descendants',
    titleAr: 'بطاقة الفروع (الأبناء وبناتهم)',
    titleEn: 'Descendants (Children & Grandchildren) Card',
    descAr: 'أدخل أعداد الأبناء الذكور والإناث، وأولاد الابن (أبناء وبنات الابن) عند عدم وجود ابن مباشر صلب؛ حيث يطبق النظام قاعدة التوريث القرآنية (للذكر مثل حظ الأنثيين) وحساب فروض البنات عند انفرادهن.',
    descEn: 'Enter counts of sons, daughters, grandsons, and granddaughters (blocked by sons); automatically applies (male gets twice female share) and daughters\' fixed shares.',
    badgeAr: 'الفروع',
    badgeEn: 'Descendants',
    iconName: 'user',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'mawarith_card_siblings',
    targetSelector: '#mawarith-card-siblings',
    titleAr: 'بطاقة الحواشي (الإخوة والأخوات)',
    titleEn: 'Collaterals (Brothers & Sisters) Card',
    descAr: 'أدخل عدد الإخوة والأخوات الأشقاء، ولأب، ولأم؛ وتطبق الحاسبة قواعد الحجب بالفرع الوارث المذكر أو الأب، كما تحسب ميراث الإخوة لأم بالسوية بالتساوي التام بين الذكر والأنثى بنص القرآن الكريم.',
    descEn: 'Enter counts of full, paternal, and maternal siblings; automatically applies blocking by male descendants or father, and splits maternal siblings\' quota equally between males and females.',
    badgeAr: 'الحواشي',
    badgeEn: 'Siblings',
    iconName: 'group',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'mawarith_card_extended',
    targetSelector: '#mawarith-card-extended',
    titleAr: 'بطاقة العصبات الأخرى (أبناء الإخوة والأعمام)',
    titleEn: 'Other Agnatic Heirs (Asabah) Card',
    descAr: 'لحساب أنصبة باقي العصبات بالنفس عند انعدام العصبات الأقرب: أبناء الأخ الشقيق، أبناء الأخ لأب، الأعمام، وأبناء العمومة؛ مع تقديم الأقرب جهة ودرجة وقوة لحيازة ما تبقى من التركة تعصيباً.',
    descEn: 'Calculates shares for secondary agnatic heirs (nephews, uncles, cousins) when closer agnates are absent, following strict genealogical proximity rules.',
    badgeAr: 'العصبات',
    badgeEn: 'Extended Heirs',
    iconName: 'group',
    accentColor: '#ea580c',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'mawarith_card_results',
    targetSelector: '#mawarith-card-results',
    titleAr: 'بطاقة جدول توزيع الميراث والأنصبة',
    titleEn: 'Inheritance Distribution Table Card',
    descAr: 'جدول بياني شامل يعرض قائمة الورثة المستحقين، نوع إرث كل وارث (فرض، تعصيب، عول، رد)، النسبة المئوية الدقيقة من التركة، والمبلغ المالي المستحق لكل فرد أو فئة بالعملة بدقة شرعية وحسابية متناهية.',
    descEn: 'Detailed distribution table presenting eligible heirs, share type (Fixed, Ta\'seeb, Awl, Radd), exact percentage, and final monetary payout for each heir.',
    badgeAr: 'جدول الميراث',
    badgeEn: 'Distribution Table',
    iconName: 'block',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

// خطوات إرشاد الحاسبة الشرعية - تبويب الكفارات وفدية الصيام
export const CALCULATOR_KAFFARAT_STEPS: SpotlightStep[] = [
  {
    id: 'kaffarat_header_actions',
    targetSelector: '#kaffarat-header-actions',
    titleAr: 'شريط الكفارات وإعادة الضبط',
    titleEn: 'Expiations Header & Reset',
    descAr: 'عنوان قسم حساب الكفارات والفدية الشرعية مع زر (إعادة ضبط) لمسح القيم المدخلة وتصفير الحسابات للبدء من جديد بلمسة واحدة.',
    descEn: 'Expiations and Fidyah calculator toolbar with a (Reset) button to instantly clear all values and restart calculation.',
    badgeAr: 'إدارة الكفارات',
    badgeEn: 'Header & Reset',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'kaffarat_card_fidyah',
    targetSelector: '#kaffarat-card-fidyah',
    titleAr: 'بطاقة فدية الصيام',
    titleEn: 'Fasting Fidyah Card',
    descAr: 'تجب على العاجز عن صيام رمضان عجزاً دائماً كالكبير في السن والمريض مرضاً مزمناً؛ أدخل عدد الأيام المفطرة ومتوسط تكلفة وجبة إطعام مسكين واحد ليحسب النظام آلياً إجمالي المبلغ الواجب إخراجه.',
    descEn: 'Due by those permanently unable to fast Ramadan (elderly or chronically ill); enter missed days and meal cost per needy person to automatically compute total Fidyah.',
    badgeAr: 'فدية الصيام',
    badgeEn: 'Fasting Fidyah',
    iconName: 'block',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'kaffarat_card_yamin',
    targetSelector: '#kaffarat-card-yamin',
    titleAr: 'بطاقة كفارة اليمين',
    titleEn: 'Oath Expiation (Kaffarat al-Yamin) Card',
    descAr: 'تجب عند الحنث في اليمين المعقودة؛ وهي إطعام عشرة مساكين من أوسط ما تطعمون أهليكم؛ أدخل تكلفة الوجبة المشبعة الواحدة ليقوم النظام آلياً بضربها في 10 وإظهار إجمالي كفارة اليمين المستحقة.',
    descEn: 'Due upon breaking an oath; feeding 10 needy persons; enter cost of one meal to automatically multiply by 10 and display the total expiation amount.',
    badgeAr: 'كفارة اليمين',
    badgeEn: 'Oath Expiation',
    iconName: 'block',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'kaffarat_card_notes',
    targetSelector: '#kaffarat-card-notes',
    titleAr: 'بطاقة الضوابط الفقهية لإخراج الكفارات',
    titleEn: 'Jurisprudence Guidelines Card',
    descAr: 'إيضاح للأحكام الفقهية المعتمدة: الأصل الشرعي في الكفارة والفدية إخراج الطعام عيناً من قوت البلد (مُد أو نصف صاع)، وأجاز جمهور من الفقهاء إخراج القيمة نقداً تيسيراً وسداً لحاجة المسكين.',
    descEn: 'Jurisprudence notes: the standard Sharia requirement is distributing actual staple food (Mudd or half Sa\'), while paying cash value is permitted by scholars to ease poor relief.',
    badgeAr: 'ضوابط فقهية',
    badgeEn: 'Legal Guidelines',
    iconName: 'block',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-violet-600'
  }
];

// خطوات إرشاد الحاسبة الشرعية - تبويب زكاة الفطر
export const CALCULATOR_FITR_STEPS: SpotlightStep[] = [
  {
    id: 'fitr_subtabs',
    targetSelector: '#fitr-udhiyah-subtabs',
    titleAr: 'التبديل بين زكاة الفطر والأضحية',
    titleEn: 'Toggle Fitr & Udhiyah Modes',
    descAr: 'شريط التبديل السريع بين قسمين: (زكاة الفطر) لحساب صاع الفطر للأفراد والأسرة، و(الأضحية والعقيقة) لحساب بهيمة الأنعام والأسهم وقسمة الأثلاث والعقيقة عن المواليد.',
    descEn: 'Quick subtab switcher: toggle between (Zakat al-Fitr) for individuals and families, and (Udhiyah & Aqiqah) for livestock, shares, thirds division, and newborn sacrifice.',
    badgeAr: 'التبويب الفرعي',
    badgeEn: 'Subtab Toggle',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'fitr_card_inputs',
    targetSelector: '#fitr-card-inputs',
    titleAr: 'بطاقة مدخلات زكاة الفطر',
    titleEn: 'Zakat al-Fitr Inputs Card',
    descAr: 'بطاقة متكاملة لحساب الفطر: حدد عدد أفراد الأسرة بالأرقام أو الأزرار السريعة، خيار إضافة الجنين في بطن أمه (استحباباً لفعل عثمان رضي الله عنه)، اختيار نوع الصاع من قوت البلد (أرز، قمح، تمر، زبيب، صاع قياسي)، وخيار إدخال القيمة النقدية للفرد بالعملة المحلية.',
    descEn: 'All-in-one Fitr input card: specify family member count with quick buttons, unborn baby checkbox (recommended), select staple food type (rice, wheat, dates, standard Sa\'), and enter cash equivalent per person.',
    badgeAr: 'مدخلات الفطر',
    badgeEn: 'Fitr Inputs',
    iconName: 'block',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'fitr_card_results',
    targetSelector: '#fitr-card-results',
    titleAr: 'بطاقة نتائج زكاة الفطر وأحكامها',
    titleEn: 'Zakat al-Fitr Results & Rulings Card',
    descAr: 'تعرض إجمالي المقدار العيني بالصاع والكيلوجرام، وإجمالي المقدار النقدي المقدر، مع ملخص للأحكام الفقهية: وقت الوجوب بغروب شمس ليلة العيد، وأفضل وقت للإخراج قبل صلاة العيد، ومصارفها المشروعة للمساكين.',
    descEn: 'Displays total in-kind weight in kg, estimated total cash, and Sharia rulings: time of obligation at Eid eve sunset, best time before Eid prayer, and poor recipients.',
    badgeAr: 'نتائج وأحكام',
    badgeEn: 'Fitr Results',
    iconName: 'block',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

// خطوات إرشاد الحاسبة الشرعية - تبويب الأضحية والعقيقة
export const CALCULATOR_UDHIYAH_STEPS: SpotlightStep[] = [
  {
    id: 'udhiyah_subtabs',
    targetSelector: '#fitr-udhiyah-subtabs',
    titleAr: 'التبديل بين زكاة الفطر والأضحية',
    titleEn: 'Toggle Fitr & Udhiyah Modes',
    descAr: 'شريط التبديل السريع بين قسمين: (زكاة الفطر) لحساب صاع الفطر للأفراد والأسرة، و(الأضحية والعقيقة) لحساب بهيمة الأنعام والأسهم وقسمة الأثلاث والعقيقة عن المواليد.',
    descEn: 'Quick subtab switcher: toggle between (Zakat al-Fitr) for individuals and families, and (Udhiyah & Aqiqah) for livestock, shares, thirds division, and newborn sacrifice.',
    badgeAr: 'التبويب الفرعي',
    badgeEn: 'Subtab Toggle',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'udhiyah_card_animal',
    targetSelector: '#udhiyah-card-animal',
    titleAr: 'بطاقة بهيمة الأنعام والأسهم والأسعار',
    titleEn: 'Livestock Type, Age & Shares Card',
    descAr: 'اختر نوع الأضحية (ضأن، ماعز، بقر، إبل) مع بيان السن الشرعي المجزئ لكل نوع، تحديد عدد أسهمك المشارك بها (تجزئ الشاة عن شخص وأهل بيته، وتجزئ البقرة والبدنة عن 7 أسهم)، وإدخال سعر الذبيحة لحساب قيمة السهم وحصتك بدقة.',
    descEn: 'Choose animal type (sheep, goat, cattle, camel) with minimum age, select partnership shares (sheep for 1 household, cattle/camels up to 7 shares), and input price to calculate share cost.',
    badgeAr: 'بهيمة الأنعام',
    badgeEn: 'Livestock & Shares',
    iconName: 'block',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'udhiyah_card_division',
    targetSelector: '#udhiyah-card-division',
    titleAr: 'بطاقة قسمة الأضحية المستحبة (الأثلاث)',
    titleEn: 'Recommended Thirds Division Card',
    descAr: 'قسمة الأضحية وفق السنة النبوية الشريفة «فكلوا وأطعموا وادخروا»؛ حيث يقسم النظام وزن اللحم الصافي آلياً إلى ثلاثة أثلاث متساوية: ثلث لأهل البيت، ثلث هدية للأقارب والجيران، وثلث صدقة للفقراء والمساكين.',
    descEn: 'Divides net meat weight into three equal portions according to the Sunnah: 1/3 for family, 1/3 as gifts for relatives & neighbors, and 1/3 in charity for the needy.',
    badgeAr: 'قسمة الأثلاث',
    badgeEn: 'Thirds Division',
    iconName: 'block',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'udhiyah_card_defects',
    targetSelector: '#udhiyah-card-defects',
    titleAr: 'بطاقة فحص السلامة من العيوب الأربعة المانعة',
    titleEn: 'Invalidation Defects Checklist Card',
    descAr: 'قائمة تفاعلية لفحص سلامة الأضحية من العيوب الأربعة المانعة للإجزاء الواردة في حديث النبي ﷺ (العوراء، المريضة، العرجاء، والعجفاء)، مع مؤشر ذكي يوضح صحة الأضحية وإجزائها شرعاً.',
    descEn: 'Interactive checklist ensuring the animal is free from the 4 invalidating defects from the Prophetic Hadith (blind, sick, lame, emaciated), with validity badge.',
    badgeAr: 'فحص العيوب',
    badgeEn: 'Defect Checklist',
    iconName: 'block',
    accentColor: '#ef4444',
    gradient: 'from-rose-500 to-red-600'
  },
  {
    id: 'udhiyah_card_aqiqah',
    targetSelector: '#udhiyah-card-aqiqah',
    titleAr: 'بطاقة حاسبة العقيقة عن المواليد',
    titleEn: 'Newborn Aqiqah Calculator Card',
    descAr: 'لحساب العقيقة المسنونة في اليوم السابع للمولود؛ أدخل عدد المواليد الذكور (شاتان عن كل ولد) وعدد الإناث (شاة عن كل بنت)، ليقوم النظام بحساب إجمالي عدد الذبائح المطلوبة للعقيقة.',
    descEn: 'Calculates Sunnah Aqiqah for the 7th day of newborn; enter number of boys (2 sheep each) and girls (1 sheep each) to compute total required sacrifice animals.',
    badgeAr: 'حاسبة العقيقة',
    badgeEn: 'Aqiqah Calculator',
    iconName: 'block',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  }
];

export const CALCULATOR_FITR_UDHIYAH_STEPS: SpotlightStep[] = CALCULATOR_FITR_STEPS;

// للتوافق مع أي استدعاء قديم
export const CALCULATOR_PAGE_STEPS: SpotlightStep[] = CALCULATOR_ZAKAT_STEPS;

export const NAWAWI_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'nawawi_page_intro',
    titleAr: 'الأربعون النووية',
    titleEn: "Al-Nawawi's 40 Hadith",
    descAr: 'الأحاديث النبوية الجامعة للإمام النووي رحمه الله، مع الشرح المختصر والفوائد العقدية والفقهية والتربوية لكل حديث، وإمكانية الاستماع الصوتي والبحث الذكي.',
    descEn: "Imam Al-Nawawi's comprehensive prophetic traditions with brief explanations, creed, jurisprudence, and behavioral benefits for each hadith, plus audio listening and smart search.",
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

// 13. خطوات إرشاد صفحة مواقيت الصلاة
export const PRAYER_TIMES_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'prayer_gps_refresh',
    targetSelector: '#location-refresh-btn',
    titleAr: 'تحديث الموقع الجغرافي (GPS)',
    titleEn: 'Refresh GPS Location',
    descAr: 'اضغط هنا لتحديث إحداثيات موقعك الحالي بدقة عبر نظام الـ GPS لإعادة حساب مواقيت الأذان والصلوات بدقة تامة لمدينتك.',
    descEn: 'Tap here to update your current GPS coordinates and recalculate precise prayer times and Qibla direction for your city.',
    badgeAr: 'الموقع الجغرافي',
    badgeEn: 'GPS Location',
    iconName: 'map',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'prayer_top_settings_btn',
    targetSelector: '#prayer-top-bar-settings-btn',
    titleAr: 'إعدادات الصلاة والإشعارات',
    titleEn: 'Prayer Settings & Notifications',
    descAr: 'اضغط هنا لفتح قائمة إعدادات الصلاة والإشعارات: تفعيل الإشعار المستمر لمواقيت الصلاة، كتم التنبيهات الصوتية مؤقتاً، وتنبيهات أذكار قيام الليل واليوم.',
    descEn: 'Tap here to open prayer settings and notifications: manage persistent prayer notification, temporarily mute audio alerts, and customize night and daily athkar reminders.',
    badgeAr: 'إعدادات الصلاة',
    badgeEn: 'Prayer Settings',
    iconName: 'gear',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'prayer_nearby_mosques',
    targetSelector: '#nearby-mosques-btn',
    titleAr: 'المساجد القريبة من موقعك',
    titleEn: 'Nearby Mosques',
    descAr: 'يفتح لك خرائط جوجل للبحث عن جميع المساجد المحيطة بك وعرض المسافة ومسارات المشي والقيادة للوصول إلى صلاة الجماعة.',
    descEn: 'Opens Google Maps to locate all mosques surrounding your current position with walking and driving directions.',
    badgeAr: 'المساجد • Maps',
    badgeEn: 'Nearby Mosques',
    iconName: 'map',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'prayer_monthly_times',
    targetSelector: '#monthly-times-btn',
    titleAr: 'جدول مواقيت الشهر بالكامل',
    titleEn: 'Monthly Timetable',
    descAr: 'عرض جدول إمساكية ومواقيت الصلاة لكامل الشهر الهجري أو الميلادي مع إمكانية تصديرها كملف PDF أنيق أو مشاركتها كصورة.',
    descEn: 'View the full monthly prayer timetable for Hijri or Gregorian months with options to export as a formatted PDF or share as an image.',
    badgeAr: 'إمساكية الشهر',
    badgeEn: 'Monthly Timetable',
    iconName: 'calendar',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'prayer_search_box',
    targetSelector: '#prayer-date-search-container',
    titleAr: 'البحث عن أي مدينة أو تاريخ',
    titleEn: 'City & Date Search',
    descAr: 'يمكنك كتابة اسم أي مدينة أو عاصمة في العالم أو اختيار يوم محدد لمعرفة مواقيت الصلاة الفلكية بدقة متناهية دون الحاجة لتواجدك هناك.',
    descEn: 'Type any city or country worldwide, or pick a specific date to view its exact astronomical prayer times instantly.',
    badgeAr: 'البحث الذكي',
    badgeEn: 'Search',
    iconName: 'search',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'prayer_next_card',
    targetSelector: '#next-prayer-countdown-container',
    titleAr: 'الصلاة القادمة والعد التنازلي الحي',
    titleEn: 'Next Prayer & Live Countdown',
    descAr: 'يعرض اسم الصلاة القادمة مع عداد تنازلي دقيق بالثواني والدقائق لموعد رفع الأذان، مع تلوين مميز للبطاقة لتنبيهك بوقت الصلاة.',
    descEn: 'Displays the next upcoming prayer with an active countdown timer down to the second until the call to prayer.',
    badgeAr: 'الصلاة القادمة',
    badgeEn: 'Next Prayer',
    iconName: 'clock',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'prayer_night_times',
    targetSelector: '#night-times-container',
    titleAr: 'مواقيت قيام الليل وتنبيهات الأسحار',
    titleEn: 'Night Times & Tahajjud Reminders',
    descAr: 'حساب شرعي دقيق للثلث الأول ومنتصف الليل والثلث الأخير المستحب فيه قيام الليل والاستغفار، مع إمكانية تفعيل جرس التنبيه لكل وقت.',
    descEn: 'Accurate calculations for the first third, midnight, and the blessed last third of the night, with toggleable reminder bells.',
    badgeAr: 'قيام الليل',
    badgeEn: 'Night Times',
    iconName: 'moon',
    accentColor: '#6366f1',
    gradient: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'prayer_cards_grid',
    targetSelector: '#prayer-list',
    titleAr: 'بطاقات مواقيت الصلوات اليومية',
    titleEn: 'Daily Prayer Cards Grid',
    descAr: 'شبكة مواقيت الصلوات الست (الفجر، الشروق، الظهر، العصر، المغرب، العشاء). توضح وقت دخول الصلاة ووقت الإقامة المحدد لكل فرض.',
    descEn: 'Grid of the six daily prayer cards showing exact adhan times, iqama intervals, and active highlights.',
    badgeAr: 'أوقات الصلوات',
    badgeEn: 'Prayer Timings',
    iconName: 'clock',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'prayer_sound_toggle',
    targetSelector: '#prayer-sound-toggle-btn',
    titleAr: 'كتم أو تشغيل صوت الأذان للصلاة',
    titleEn: 'Mute / Unmute Adhan Sound',
    descAr: 'اضغط على النقطة (خضراء=مفعل / حمراء=مكتوم) لتفعيل أو إيقاف صوت الأذان والتنبيه لكل صلاة على حدة حسب رغبتك.',
    descEn: 'Tap the status indicator (green=active / red=muted) to toggle adhan sound and notifications independently for each prayer.',
    badgeAr: 'صوت الأذان',
    badgeEn: 'Sound Alert',
    iconName: 'volume',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'prayer_card_settings_btn',
    targetSelector: '#prayer-settings-btn',
    titleAr: 'زر تخصيص وإعدادات الصلاة',
    titleEn: 'Prayer Customization & Settings',
    descAr: 'اضغط على هذا الزر لفتح قائمة إعدادات الصلاة: ضبط دقائق الأذان، تنبيه الاستعداد، وقت الإقامة، الوضع الصامت التلقائي واختيار نغمة المؤذن.',
    descEn: 'Tap this button to open the prayer settings menu: calibrate adhan minutes, readiness alert, iqama time, auto-silent mode, and reciter tone.',
    badgeAr: 'إعدادات الصلاة',
    badgeEn: 'Settings',
    iconName: 'gear',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-violet-600'
  }
];

// 14. خطوات إرشاد صفحة مواقيت الشهر
export const MONTHLY_PRAYER_TIMES_STEPS: SpotlightStep[] = [
  {
    id: 'monthly_export_pdf',
    targetSelector: '#btn-monthly-pdf',
    titleAr: 'تصدير إمساكية الشهر كـ PDF',
    titleEn: 'Export Timetable as PDF',
    descAr: 'تصدير جدول مواقيت الصلاة للشهر كاملاً في ملف PDF عالي الجودة ومنسق بعناية للطباعة الورقية أو الحفظ على الهاتف.',
    descEn: 'Export the complete monthly prayer schedule as a high quality PDF document ready for printing or offline keeping.',
    badgeAr: 'تصدير PDF',
    badgeEn: 'Export PDF',
    iconName: 'file',
    accentColor: '#ef4444',
    gradient: 'from-red-500 to-rose-600'
  },
  {
    id: 'monthly_share_image',
    targetSelector: '#btn-monthly-share',
    titleAr: 'مشاركة جدول الشهر كصورة',
    titleEn: 'Share Timetable as Image',
    descAr: 'إنشاء صورة بتصميم إسلامي أنيق لجدول مواقيت الصلاة ومشاركتها مع العائلة والأصدقاء ومجموعات الواتساب ومواقع التواصل.',
    descEn: 'Generate an elegant image of the monthly prayer timetable and share it with family and WhatsApp groups.',
    badgeAr: 'مشاركة كصورة',
    badgeEn: 'Share Image',
    iconName: 'share',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'monthly_date_picker',
    targetSelector: '#btn-monthly-picker',
    titleAr: 'اختيار الشهر والسنة',
    titleEn: 'Month & Year Picker',
    descAr: 'اضغط على اسم الشهر لفتح نافذة اختيار أي شهر وسنة هجرية أو ميلادية والتنقل المباشر لمواقيتها بكل سهولة.',
    descEn: 'Tap the month name to open a quick selector modal and switch directly to any Hijri or Gregorian month and year.',
    badgeAr: 'اختيار الشهر',
    badgeEn: 'Date Picker',
    iconName: 'calendar',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'monthly_calendar_toggle',
    targetSelector: '#btn-monthly-calendar-toggle',
    titleAr: 'التبديل بين الهجري والميلادي',
    titleEn: 'Hijri & Gregorian Toggle',
    descAr: 'زر التبديل السريع لعرض مواقيت الشهر حسب الأشهر الهجرية الإسلامية (رمضان، شوال..) أو الأشهر الميلادية.',
    descEn: 'Quick toggle to view the monthly schedule based on Islamic Hijri months or Gregorian calendar months.',
    badgeAr: 'التقويم',
    badgeEn: 'Calendar Toggle',
    iconName: 'tab',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'monthly_nav_arrows',
    targetSelector: '#btn-monthly-prev, #btn-monthly-next',
    titleAr: 'التنقل بين الشهور السابقة والقادمة',
    titleEn: 'Month Navigation Arrows',
    descAr: 'استخدم أسهم التنقل للانتقال السريع للشهر التالي أو العودة للشهر السابق بلمسة واحدة.',
    descEn: 'Use the navigation arrows to advance to the next month or go back to previous months with one tap.',
    badgeAr: 'تنقل الشهور',
    badgeEn: 'Navigation',
    iconName: 'nav',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'monthly_table_grid',
    targetSelector: '#monthly-table-container',
    preferredPlacement: 'center',
    titleAr: 'جدول المواقيت وتظليل اليوم الحالي',
    titleEn: 'Timetable & Today Highlighting',
    descAr: 'جدول كامل لجميع أيام الشهر مع مواقيت الصلوات الخمس والشروق، ويتم تمييز وتظليل يومك الحالي بلون بارز تلقائياً لسهولة المتابعة.',
    descEn: 'Full monthly timetable with all five prayers and sunrise times, automatically highlighting today row for easy tracking.',
    badgeAr: 'جدول الشهر',
    badgeEn: 'Timetable',
    iconName: 'clock',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

// 15. خطوات إرشاد قائمة إعدادات الصلاة
export const PRAYER_SETTINGS_MODAL_STEPS: SpotlightStep[] = [
  {
    id: 'setting_adhan_offset',
    targetSelector: '#setting-adhan-adjustment',
    titleAr: 'تقديم أو تأخير وقت الأذان',
    titleEn: 'Adjust Adhan Timing & Offset',
    descAr: 'يمكنك زيادة أو إنقاص وقت الأذان بالدقائق عبر زري (+ / -) أو كتابة الرقم يدوياً، أو الضغط على أيقونة الساعة لكتابة الوقت الدقيق لمطابقة مسجد حيك.',
    descEn: 'Increase or decrease the adhan time in minutes using (+ / -), type the offset manually, or tap the clock icon to enter exact local time.',
    badgeAr: 'وقت الأذان',
    badgeEn: 'Adhan Calibration',
    iconName: 'clock',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'setting_tone_selector',
    targetSelector: '#setting-tone-selector',
    titleAr: 'نغمة الأذان واختيار المؤذن',
    titleEn: 'Adhan Tone & Reciter Selection',
    descAr: 'اختر نغمة وتكبيرات الأذان المفضلة لديك من قائمة المؤذنين المشاهير، أو ارفع ملفك الصوتي الخاص من ذاكرة هاتفك.',
    descEn: 'Choose your preferred adhan or takbeer from renowned muezzins, or upload your own audio file from your device.',
    badgeAr: 'صوت الأذان',
    badgeEn: 'Adhan Reciter',
    iconName: 'volume',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'setting_pre_reminder',
    targetSelector: '#setting-pre-reminder',
    titleAr: 'تنبيه الاستعداد للصلاة قبل الأذان',
    titleEn: 'Pre-Adhan Readiness Alert',
    descAr: 'تنبيه لطيف مسبق قبل حلول الأذان بعدة دقائق (10، 15، 20 دقيقة أو تحديد يدوي) للاستعداد والتفرغ والوضوء والذهاب للمسجد.',
    descEn: 'A preparatory reminder minutes before adhan (10, 15, 20 mins or custom) to prepare, make wudu, and head to prayer.',
    badgeAr: 'الاستعداد للصلاة',
    badgeEn: 'Readiness Alert',
    iconName: 'bell',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'setting_iqama_alert',
    targetSelector: '#setting-iqama-alert',
    titleAr: 'تنبيه وموعد إقامة الصلاة',
    titleEn: 'Iqama Reminder Alert',
    descAr: 'تنبيه بصوت رنين عند حلول موعد إقامة الصلاة في المسجد بعدد الدقائق المحدد بعد الأذان (10، 15، 20 دقيقة أو تحديد يدوي).',
    descEn: 'Chime reminder when the congregation prayer starts after your specified minutes from adhan.',
    badgeAr: 'وقت الإقامة',
    badgeEn: 'Iqama Time',
    iconName: 'bell',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'setting_auto_silent',
    targetSelector: '#setting-auto-silent',
    titleAr: 'تحويل الهاتف للوضع الصامت تلقائياً',
    titleEn: 'Automatic Silent Mode in Prayer',
    descAr: 'كتم صوت الهاتف ونغماته تلقائياً أثناء الصلاة لمنع الإزعاج داخل المسجد، مع إعادته لوضعه الطبيعي تلقائياً بعد انقضاء مدة الصلاة.',
    descEn: 'Automatically mutes phone ringers during prayer to prevent disturbance, and restores normal volume afterwards.',
    badgeAr: 'الوضع الصامت',
    badgeEn: 'Auto Silent',
    iconName: 'volume',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'setting_save_btn',
    targetSelector: '#setting-save-btn',
    titleAr: 'حفظ الإعدادات والتعديلات',
    titleEn: 'Save Custom Settings',
    descAr: 'اضغط على زر الحفظ لتطبيق كافة التغييرات على توقيت الصلاة ونغماتها والتنبيهات التلقائية فوراً.',
    descEn: 'Tap the save button to apply all custom timings, alerts, and silent durations immediately.',
    badgeAr: 'حفظ التعديلات',
    badgeEn: 'Save Changes',
    iconName: 'action',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

export const ASMAUL_HUSNA_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'asmaul_husna_page_intro',
    titleAr: 'أسماء الله الحسنى',
    titleEn: 'Beautiful Names of Allah',
    descAr: 'تعرف على أسماء الله الحسنى ومعانيها العظيمة ودلائلها القرآنية، مع إمكانية الاستماع الصوتي لكل اسم ومشاركته كبطاقة تصميم إسلامية مذهبة والبحث السريع.',
    descEn: 'Explore the Beautiful Names of Allah, their profound meanings and Qurancic proofs, with audio recitations, Islamic design cards sharing, and smart search.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const LISTEN_QURAN_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'listen_top_fav',
    targetSelector: '#btn-listen-toggle-fav',
    titleAr: 'إضافة التلاوة للمفضلة',
    titleEn: 'Add to Favorites',
    descAr: 'اضغط على رمز القلب لحفظ التلاوة الحالية (السورة مع القارئ المختار) في قائمة مفضلاتك للرجوع إليها والاستماع لها في أي وقت بلمسة واحدة.',
    descEn: 'Tap the heart icon to save the current recitation (surah & selected reciter) to your favorites for instant playback anytime.',
    badgeAr: 'المفضلة',
    badgeEn: 'Favorites',
    iconName: 'action',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'listen_reciter_select',
    targetSelector: '#btn-listen-select-reciter',
    titleAr: 'اختيار القارئ والشيخ',
    titleEn: 'Select Reciter',
    descAr: 'اضغط لاختيار قارئك المفضل من بين نخبة من كبار قراء العالم الإسلامي بمختلف الروايات وطرق التلاوة (مرتل ومجود)، مع إمكانية البحث السريع.',
    descEn: 'Tap to choose your favorite reciter from renowned Islamic reciters across multiple recitation styles, with quick search.',
    badgeAr: 'القارئ',
    badgeEn: 'Reciter',
    iconName: 'user',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'listen_surah_select',
    targetSelector: '#btn-listen-select-surah',
    titleAr: 'اختيار السورة الكريمة',
    titleEn: 'Select Surah',
    descAr: 'اضغط لعرض قائمة سور القرآن الكريم المتاحة بصوت القارئ الحالي، مع بيان رقم السورة واسمها ونوعها (مكية أو مدنية).',
    descEn: 'Tap to browse all available Quranic surahs for this reciter, with surah number, name, and revelation type.',
    badgeAr: 'السورة',
    badgeEn: 'Surah',
    iconName: 'quran',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'listen_player_controls',
    targetSelector: '#listen-player-card',
    titleAr: 'مشغل التلاوة والتحكم بالصوت',
    titleEn: 'Audio Player & Controls',
    descAr: 'مشغل الصوت التفاعلي: شريط تقديم وتأخير التلاوة بالدقائق والثواني، زر التشغيل والإيقاف المؤقت، وزري الانتقال للسورة التالية والسابقة.',
    descEn: 'Interactive audio player: seekbar to scrub through minutes and seconds, Play/Pause button, and skip to next or previous surah.',
    badgeAr: 'المشغل',
    badgeEn: 'Player',
    iconName: 'volume',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'listen_sleep_timer',
    targetSelector: '#listen-sleep-timer-card',
    titleAr: 'مؤقت النوم والإيقاف التلقائي',
    titleEn: 'Sleep Timer & Auto-Stop',
    descAr: 'حدد موعداً لإيقاف التلاوة تلقائياً عند النوم؛ اختر فترات سريعة (15، 30، 60 دقيقة) أو عند نهاية السورة، أو حدد الدقائق يدوياً بـ (+ / -).',
    descEn: 'Set a timer to automatically stop playback when sleeping; choose quick presets (15, 30, 60 mins), at the end of the surah, or fine-tune minutes with (+ / -).',
    badgeAr: 'مؤقت النوم',
    badgeEn: 'Sleep Timer',
    iconName: 'moon',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'listen_playback_options',
    targetSelector: '#listen-options-card',
    titleAr: 'خيارات التكرار والتشغيل المتواصل',
    titleEn: 'Repeat & Continuous Play',
    descAr: 'خيارات تشغيل ذكية: تفعيل تكرار نفس السورة تلقائياً للحفظ والمراجعة، أو التشغيل المتواصل للانتقال التلقائي للسور التالية تباعاً دون انقطاع.',
    descEn: 'Smart playback options: repeat the current surah for memorization, or enable continuous play to automatically transition to subsequent surahs.',
    badgeAr: 'خيارات التشغيل',
    badgeEn: 'Options',
    iconName: 'action',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    id: 'listen_download_surahs',
    targetSelector: '#btn-listen-download',
    titleAr: 'تحميل التلاوات بدون إنترنت',
    titleEn: 'Download for Offline Listening',
    descAr: 'تحميل سور المصحف الشريف بصوت أي قارئ تريده على ذاكرة هاتفك للاستماع لها في أي وقت ومكان دون الحاجة لاتصال بالإنترنت.',
    descEn: 'Download holy surahs recited by your favorite reciters to your device storage for offline playback anytime without internet.',
    badgeAr: 'تحميل التلاوات',
    badgeEn: 'Offline Download',
    iconName: 'nav',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'listen_saved_favorites',
    targetSelector: '#listen-favorites-card',
    titleAr: 'قائمة المفضلات المحفوظة',
    titleEn: 'Saved Recitations Favorites',
    descAr: 'بطاقة تجمع تلاواتك المفضلة (حتى 10 تلاوات)؛ اضغط على أي تلاوة لتشغيلها فوراً، أو احذفها بلمسة واحدة متى شئت.',
    descEn: 'Collection of your favorite recitations (up to 10); tap any item to play it instantly or remove it with one click.',
    badgeAr: 'المفضلات',
    badgeEn: 'Favorites List',
    iconName: 'block',
    accentColor: '#ef4444',
    gradient: 'from-rose-500 to-red-600'
  }
];

export const QIBLA_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'qibla_page_intro',
    titleAr: 'اتجاه القبلة',
    titleEn: 'Qibla Direction',
    descAr: 'حدد اتجاه القبلة بدقة من أي مكان في العالم باستخدام البوصلة التفاعلية الذكية المدمجة.',
    descEn: 'Accurately determine the Qibla direction from anywhere in the world using the integrated smart interactive compass.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const ATHKAR_SALAH_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'athkar_salah_page_intro',
    titleAr: 'أذكار الصلاة',
    titleEn: 'Prayer Athkar',
    descAr: 'مجموعة الأذكار المسنونة بعد الصلوات المكتوبة، مع إمكانية القراءة والعد.',
    descEn: 'Collection of Sunnah adhkar after obligatory prayers, with reading and counting capabilities.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const ADIA_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'adia_page_intro',
    titleAr: 'الأدعية المأثورة',
    titleEn: 'Supplications (Adia)',
    descAr: 'مجموعة متنوعة من الأدعية المأثورة من الكتاب والسنة لمختلف الحالات والمناسبات.',
    descEn: 'A diverse collection of supplications from the Quran and Sunnah for various situations and occasions.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const HISN_ALMUSLIM_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'hisn_almuslim_page_intro',
    titleAr: 'حصن المسلم',
    titleEn: 'Hisn Al-Muslim',
    descAr: 'الكتاب الشهير لأذكار وأدعية المسلم اليومية، منظم في أبواب لسهولة الوصول.',
    descEn: 'The famous book of daily Muslim adhkar and supplications, organized into chapters for easy access.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const ADKAR_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'adkar_page_intro',
    titleAr: 'أذكار الصباح والمساء',
    titleEn: 'Morning and Evening Athkar',
    descAr: 'أذكار الصباح والمساء الثابتة عن النبي ﷺ مع إمكانية العد والمتابعة.',
    descEn: 'Authentic Morning and Evening Athkar from the Prophet ﷺ, with counting and tracking capabilities.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const CALENDAR_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'calendar_page_intro',
    titleAr: 'التقويم الهجري والميلادي والمناسبات',
    titleEn: 'Hijri & Gregorian Calendar & Events',
    descAr: 'عرض التقويم الهجري والميلادي جنباً إلى جنب مع تحديد المناسبات الإسلامية والأحداث التاريخية الهامة ومحول تواريخ دقيق.',
    descEn: 'Display Hijri and Gregorian calendars side by side with Islamic occasions, historical events, and accurate date converter.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const HAJJ_UMRAH_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'hajj_umrah_page_intro',
    titleAr: 'دليل الحج والعمرة والسبحة التفاعلية',
    titleEn: 'Hajj, Umrah & Tawaf Guide',
    descAr: 'دليل شامل ومبسط لمناسك الحج والعمرة مع أذكار الطواف والسعي ومتابعة الأشواط بالعداد التفاعلي والأحكام الفقهية.',
    descEn: 'Comprehensive and simplified guide for Hajj and Umrah rituals with Tawaf and Sai supplications, interactive counter for circuits, and jurisprudence rulings.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const VOICE_CONTROL_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'voice_control_intro',
    titleAr: 'التحكم الصوتي في التطبيق',
    titleEn: 'Voice Control',
    descAr: 'تحكم في التطبيق بالكامل باستخدام الأوامر الصوتية، مثل فتح الأبواب والبحث والتنقل، لتسهيل تجربة الاستخدام.',
    descEn: 'Control the entire app using voice commands, such as opening sections, searching, and navigating, for an easier user experience.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'voice',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const ISLAMIC_SITES_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'islamic_sites_intro',
    titleAr: 'مواقع إسلامية موثوقة',
    titleEn: 'Islamic Websites',
    descAr: 'دليل لأبرز المواقع الإسلامية الموثوقة والمصنفة لخدمة المسلم في شتى العلوم الشرعية والقرآنية.',
    descEn: 'A directory of the most prominent and trusted Islamic websites, categorized to serve the Muslim in various Sharia and Quranic sciences.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'quran',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const TASBEEH_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'tasbeeh_page_intro',
    titleAr: 'السبحة الإلكترونية الذكية',
    titleEn: 'Smart Electronic Tasbeeh',
    descAr: 'سبحة إلكترونية متطورة مع أذكار متنوعة وأشكال عرض متعددة وإحصائيات يومية لتتبع ورد التسبيح والاستغفار بسهولة.',
    descEn: 'Advanced electronic tasbeeh with diverse supplications, multiple display skins, and daily statistics to easily track your tasbeeh and dhikr.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const PROPHETIC_SEERAH_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'prophetic_seerah_page_intro',
    titleAr: 'السيرة النبوية العطرة',
    titleEn: 'The Noble Prophetic Seerah',
    descAr: 'سيرة النبي محمد ﷺ الشريفة، محطاتها التاريخية العظيمة، ومواقفه الخالدة، ونسبه الشريف مع إمكانية التصفح، البحث الذكي، ومشاركة البطاقات كصور.',
    descEn: "The blessed biography of Prophet Muhammad ﷺ, grand historical milestones, immortal stances, and noble lineage with search, audio-like features, and card sharing.",
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const TEN_PROMISED_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'ten_promised_intro',
    titleAr: 'العشرة المبشرون',
    titleEn: 'The Ten Promised',
    descAr: 'سير وبيانات العشرة المبشرين بالجنة رضي الله عنهم: أحوالهم قبل الإسلام، قصة إسلامهم، جهادهم، فضائلهم، ومواقفهم العظيمة مع إمكانية تكبير النصوص ومشاركة البطاقات.',
    descEn: 'Biographies and historical details of the Ten Promised Paradise: their lives before Islam, embracing the faith, jihad, virtues, and immortal legacy with zoom and card sharing.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Page Guide',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'ten_promised_companion_card',
    targetSelector: '#ten-promised-card-1',
    titleAr: 'بطاقة الصحابي والتفاصيل الكاملة',
    titleEn: 'Companion Profile & Full Details',
    descAr: 'اضغط على بطاقة أي صحابي للدخول إلى صفحته المستقلة التي تضم تفاصيل نشأته، إسلامه، غزواته، بشارته بالجنة، وأبرز الدروس والعبر.',
    descEn: 'Tap any companion card to open their comprehensive profile featuring life before Islam, conversion, battles, virtues, and timeless faith lessons.',
    badgeAr: 'التصفح',
    badgeEn: 'Navigation',
    iconName: 'user',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];








