export interface PageButtonItem {
  id: string;
  name: string;
  icon: string;
  visualType: 'circle-button' | 'square-button' | 'pill-button' | 'counter-button' | 'toggle-button' | 'card-button';
  iconColor?: string;
  btnBg?: string;
  label?: string;
  purpose: string;
}

export interface PageButtonsGuide {
  id: string;
  pageName: string; // الاسم كما هو في البرنامج تماماً
  buttons: PageButtonItem[];
}

export const PAGES_BUTTONS_GUIDE: PageButtonsGuide[] = [
  // 1. القرآن الكريم
  {
    id: 'quran',
    pageName: 'القرآن الكريم',
    buttons: [
      {
        id: 'ayah_single_click',
        name: 'الضغط بنقرة واحدة على نص الآية',
        icon: 'fa-solid fa-hand-pointer',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'النص القرآني',
        purpose: 'يقوم بتحديد وتظليل الآية الكريمة بلون مميز لمتابعة القراءة، ويقوم بإظهار أو إخفاء أشرطة الأدوات العلوية والسفلية لتوفير وضع القراءة ملء الشاشة، كما يوقف التمرير التلقائي مؤقتاً أو يستأنفه.'
      },
      {
        id: 'ayah_long_press',
        name: 'الضغط المطول على نص الآية',
        icon: 'fa-solid fa-fingerprint',
        visualType: 'pill-button',
        iconColor: '#f59e0b',
        label: 'النص القرآني',
        purpose: 'يفتح مباشرة قائمة سياق الآية لتخصيص الآية ولون تظليلها، أو نسخها بالرسم العثماني، أو فتح تفسيرها، أو تشغيل التلاوة الصوتية بدءاً منها.'
      },
      {
        id: 'verse_num_single_click',
        name: 'الضغط بنقرة واحدة على فاصل ورقم الآية',
        icon: 'fa-solid fa-circle-dot',
        visualType: 'counter-button',
        iconColor: '#3b82f6',
        label: 'رقم الآية',
        purpose: 'يفتح فوراً نافذة تفسير الآية الكريمة الميسر لقراءة شرح معاني الكلمات وأسباب النزول وبيان المعنى الإجمالي للآية.'
      },
      {
        id: 'verse_num_long_press',
        name: 'الضغط المطول على فاصل ورقم الآية',
        icon: 'fa-solid fa-circle-dot',
        visualType: 'counter-button',
        iconColor: '#8b5cf6',
        label: 'رقم الآية',
        purpose: 'يفتح نافذة اختيار كتب التفاسير المعتمدة للتبديل الفوري بين أمهات كتب التفسير (تفسير ابن كثير، تفسير الجلالين، التفسير الميسر، تفسير السعدي، تفسير القرطبي، تفسير الطبري، وتفسير البغوي).'
      },
      {
        id: 'play_audio_single_click',
        name: 'زر التلاوة الصوتية (نقرة واحدة)',
        icon: 'fa-solid fa-play',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: '',
        purpose: 'يبدأ تشغيل التلاوة الصوتية بصوت القارئ المختار مع تظليل كل كلمة أو آية مقروءة، والنقر عليه مرة أخرى يقوم بإيقاف التلاوة مؤقتاً والاحتفاظ بموضع الآية.'
      },
      {
        id: 'play_audio_long_press',
        name: 'زر التلاوة الصوتية (ضغط مطول)',
        icon: 'fa-solid fa-play',
        visualType: 'circle-button',
        iconColor: '#ec4899',
        label: '',
        purpose: 'يفتح مباشرة نافذة اختيار القارئ دون الحاجة لدخول الإعدادات، للاختيار من بين نخبة من كبار قراء العالم الإسلامي (الحصري، المنشاوي، عبد الباسط، المعيقلي، العفاسي، السديس، وغيرهم).'
      },
      {
        id: 'autoscroll_single_click',
        name: 'زر التمرير التلقائي (نقرة واحدة)',
        icon: 'fa-solid fa-chevron-down',
        visualType: 'circle-button',
        iconColor: '#3b82f6',
        label: '',
        purpose: 'يقوم بتحريك وتقليب أسطر وصفحات المصحف تلقائياً بشكل انسيابي هادئ لتتمكن من القراءة بدون لمس الشاشة نهائياً.'
      },
      {
        id: 'autoscroll_long_press',
        name: 'زر التمرير التلقائي (ضغط مطول)',
        icon: 'fa-solid fa-chevron-down',
        visualType: 'circle-button',
        iconColor: '#6366f1',
        label: '',
        purpose: 'يفتح نافذة إعدادات وسرعة التمرير التلقائي لزيادة أو تقليل سرعة نزول وانسياب الصفحات لتناسب سرعة قراءتك تماماً.'
      },
      {
        id: 'bookmark_single_click',
        name: 'زر العلامة المرجعية (نقرة واحدة)',
        icon: 'fa-solid fa-bookmark',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: '',
        purpose: 'يحفظ علامة مرجعية فورية وسريعة على الآية والصفحة الحالية بضغطة واحدة، ليثبت موضع وقوفك في الختمة.'
      },
      {
        id: 'bookmark_long_press',
        name: 'زر العلامة المرجعية (ضغط مطول)',
        icon: 'fa-solid fa-bookmark',
        visualType: 'circle-button',
        iconColor: '#8b5cf6',
        label: '',
        purpose: 'يفتح سجل وقائمة جميع الإشارات المرجعية والفواصل المحفوظة مسبقاً، مع تاريخ ووقت كل علامة، للانتقال المباشر لأي علامة أو حذفها.'
      },
      {
        id: 'surah_header_long_press',
        name: 'ترويسة السورة (ضغط مطول)',
        icon: 'fa-solid fa-palette',
        visualType: 'card-button',
        iconColor: '#d97706',
        label: 'اسم السورة',
        purpose: 'الضغط المطول على ترويسة السورة يفتح منتقي تصاميم وبراويز السور لاختيار الشكل الزخرفي والمحرابي المفضل لترويسة السورة من بين تصاميم عثمانية وإسلامية متنوعة.'
      },
      {
        id: 'header_page_input',
        name: 'زر ورقم الصفحة في الشريط العلوي',
        icon: 'fa-solid fa-arrow-down-1-9',
        visualType: 'counter-button',
        iconColor: '#3b82f6',
        label: 'رقم الصفحة',
        purpose: 'يعرض رقم الصفحة الحالية، وعند النقر عليه يتحول لخانة إدخال رقمية تتيح لك كتابة أي رقم صفحة (من 1 إلى 604) والانتقال إليها فوراً.'
      },
      {
        id: 'header_surah_name_btn',
        name: 'زر اسم السورة في الشريط العلوي',
        icon: 'fa-solid fa-bars-staggered',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'اسم السورة',
        purpose: 'يعرض اسم السورة ورقم الآية ورقم الجزء الحالي، والنقر عليه يفتح فهرس السور والأجزاء والأحزاب للانتقال السريع لأي موضع في المصحف.'
      },
      {
        id: 'btn_share_ayah',
        name: 'زر مشاركة الآية كبطاقة دعوية',
        icon: 'fa-solid fa-share-nodes',
        visualType: 'circle-button',
        iconColor: '#059669',
        label: '',
        purpose: 'يفتح محرر تصميم الآيات المذهب الفخم لتحويل الآية إلى بطاقة دعوية أنيقة مع اختيار الخلفية والإطار لمشاركتها عبر الواتساب ووسائل التواصل.'
      },
      {
        id: 'btn_home',
        name: 'زر الصفحة الرئيسية',
        icon: 'fa-solid fa-house',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: '',
        purpose: 'يعيدك مباشرة إلى الشاشة الرئيسية للتطبيق مع حفظ موضع قراءتك الحالي تلقائياً لاستئناف القراءة في أي وقت.'
      },
      {
        id: 'pinch_to_zoom',
        name: 'التكبير والتصغير بإصبعين على الشاشة',
        icon: 'fa-solid fa-magnifying-glass-plus',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'تكبير وتصغير',
        purpose: 'يمكنك وضع إصبعين على صفحة المصحف والتقريب أو الإبعاد لتكبير أو تصغير حجم خط الآيات وأبعاد الصفحة فورياً وبكل سلاسة لراحة عينيك.'
      },
      {
        id: 'sidebar_menu_btn',
        name: 'زر القائمة والشريط الجانبي',
        icon: 'fa-solid fa-bars',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: '',
        purpose: 'يفتح القائمة الجانبية الكاملة للمصحف الشريف، والتي تتيح الوصول لجميع أوضاع القراءة، والمظهر، والقراء، ونوع الخط، والتحميلات، والبحث الشامل، وإعدادات المصحف.'
      },
      {
        id: 'sidebar_reading_modes',
        name: 'الشريط الجانبي: أنماط القراءة الأربعة',
        icon: 'fa-solid fa-layer-group',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'أنماط القراءة',
        purpose: 'يتيح التبديل الفوري بين 4 أوضاع للقراءة: (1) المصحف العثماني بالصفحات، (2) وضع التفسير المباشر مع الآيات، (3) وضع معاني المفردات وغريب القرآن، (4) وضع الترجمة الإنجليزية المعتمدة.'
      },
      {
        id: 'sidebar_themes',
        name: 'الشريط الجانبي: المظهر والثيمات',
        icon: 'fa-solid fa-palette',
        visualType: 'card-button',
        iconColor: '#6366f1',
        label: 'المظهر',
        purpose: 'تخصيص كامل لألوان خلفية المصحف (الوضع الداكن الليلي، الأسود الملكي، الوضع الورقي، العسلي المريح للعين) مع خيارات تظليل الآيات وإطارات الصفحات.'
      },
      {
        id: 'sidebar_search',
        name: 'الشريط الجانبي: البحث الشامل في القرآن',
        icon: 'fa-solid fa-magnifying-glass',
        visualType: 'card-button',
        iconColor: '#3b82f6',
        label: 'البحث',
        purpose: 'محرك بحث فوري متقدم يبحث في جميع آيات وسور المصحف بالكلمة أو جزء الكلمة مع إبراز النتائج والانتقال الفوري للآية بلمسة واحدة.'
      },
      {
        id: 'sidebar_audio_reciters',
        name: 'الشريط الجانبي: قائمة القراء والتلاوة',
        icon: 'fa-solid fa-headphones',
        visualType: 'card-button',
        iconColor: '#ec4899',
        label: 'القراء',
        purpose: 'استعراض واختيار القارئ الصوتي المفضل، مع التحكم في سرعة الصوت وتكرار الآيات لتسهيل الحفظ والمراجعة.'
      },
      {
        id: 'sidebar_fonts',
        name: 'الشريط الجانبي: نوع الخط والرسم العثماني',
        icon: 'fa-solid fa-font',
        visualType: 'card-button',
        iconColor: '#14b8a6',
        label: 'نوع الخط',
        purpose: 'التبديل بين الخطوط القرآنية المعتمدة (الرسم العثماني لحفص، ورش، قالون، والخط الأميري) مع تفعيل أو تعطيل علامات التجويد الملونة.'
      },
      {
        id: 'sidebar_downloads',
        name: 'الشريط الجانبي: تحميل التلاوات والتفاسير',
        icon: 'fa-solid fa-cloud-arrow-down',
        visualType: 'card-button',
        iconColor: '#059669',
        label: 'التحميلات',
        purpose: 'إمكانية تنزيل سور المصحف بصوت قارئك المختار، وتحميل كتب التفاسير كاملة لتعمل معك في أي وقت وأي مكان دون الحاجة للاتصال بالإنترنت.'
      },
      {
        id: 'sidebar_sajdah_list',
        name: 'الشريط الجانبي: قائمة آيات السجدة ۩',
        icon: 'fa-solid fa-kaaba',
        visualType: 'card-button',
        iconColor: '#ef4444',
        label: 'السجدات',
        purpose: 'فهرس مرتب لجميع مواضع السجدات الـ 15 في المصحف الشريف، مع بيان اسم السورة ورقم الآية ودعاء سجود التلاوة الصحيح والانتقال المباشر إليها.'
      },
      {
        id: 'sidebar_settings',
        name: 'الشريط الجانبي: إعدادات المصحف العامة',
        icon: 'fa-solid fa-gear',
        visualType: 'card-button',
        iconColor: '#6b7280',
        label: 'الإعدادات',
        purpose: 'التحكم في خيارات القراءة: إبقاء الشاشة مضاءة أثناء القراءة لمنع الإغلاق التلقائي، قفل تدوير الشاشة، إخفاء أشرطة الأدوات تلقائياً، وتخصيص ألوان الأزرار.'
      }
    ]
  },

  // 2. الاستماع للقرآن
  {
    id: 'listen',
    pageName: 'الاستماع للقرآن',
    buttons: [
      {
        id: 'reciter_modal',
        name: 'قائمة اختيار القارئ الصوتي',
        icon: 'fa-solid fa-headphones',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'اختيار القارئ',
        purpose: 'يفتح قائمة مشاهير القراء لاختيار الشيخ المفضل والاستماع لتلاوته بروايات مختلفة مع إمكانية البحث السريع باسم القارئ.'
      },
      {
        id: 'surah_select_modal',
        name: 'قائمة اختيار السورة القرآنية',
        icon: 'fa-solid fa-book-quran',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'اختيار السورة',
        purpose: 'تفتح فهرس سور القرآن الكريم الـ 114 لاختيار أي سورة للاستماع إليها مباشرة مع بيان رقمها وعدد آياتها.'
      },
      {
        id: 'listen_play_pause',
        name: 'زر تشغيل / إيقاف التلاوة',
        icon: 'fa-solid fa-play',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'تشغيل / إيقاف',
        purpose: 'يبدأ تشغيل التلاوة الصوتية للسورة المختارة أو يوقفها مؤقتاً مع تذكر موضع التوقف بدقة.'
      },
      {
        id: 'next_surah',
        name: 'زر السورة التالية',
        icon: 'fa-solid fa-forward-step',
        visualType: 'circle-button',
        iconColor: '#3b82f6',
        label: 'التالية',
        purpose: 'ينتقل مباشرة إلى السورة التالية في ترتيب المصحف الشريف ويبدأ تشغيلها.'
      },
      {
        id: 'prev_surah',
        name: 'زر السورة السابقة',
        icon: 'fa-solid fa-backward-step',
        visualType: 'circle-button',
        iconColor: '#3b82f6',
        label: 'السابقة',
        purpose: 'ينتقل مباشرة إلى السورة السابقة في ترتيب المصحف الشريف.'
      },
      {
        id: 'seek_bar',
        name: 'شريط التمرير الزمني للتلاوة',
        icon: 'fa-solid fa-sliders',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'تقديم / ترجيع',
        purpose: 'يمكنك سحب مؤشر الشريط للتقديم أو الترجيع لأي دقيقة وثانية تريدها داخل السورة بدقة.'
      },
      {
        id: 'repeat_toggle',
        name: 'زر تكرار السورة الحالية',
        icon: 'fa-solid fa-repeat',
        visualType: 'circle-button',
        iconColor: '#ec4899',
        label: 'تكرار',
        purpose: 'إعادة تشغيل السورة الحالية تلقائياً بمجرد انتهائها دون توقف لتثبيت الحفظ والمراجعة ومداومة الاستماع.'
      },
      {
        id: 'continuous_play_toggle',
        name: 'زر التشغيل المتواصل للمصحف',
        icon: 'fa-solid fa-forward',
        visualType: 'toggle-button',
        iconColor: '#3b82f6',
        label: 'تشغيل متواصل',
        purpose: 'ينتقل تلقائياً لتشغيل السور التالية تباعاً فور انتهاء السورة الحالية لتستمع إلى أجزاء وسور المصحف متواصلة دون انقطاع.'
      },
      {
        id: 'sleep_timer',
        name: 'بطاقة مؤقت النوم الذكي',
        icon: 'fa-solid fa-moon',
        visualType: 'card-button',
        iconColor: '#f59e0b',
        label: 'مؤقت النوم',
        purpose: 'يتيح تحديد وقت لإيقاف صوت التلاوة تلقائياً مثل 15 أو 30 أو 60 دقيقة أو عند نهاية السورة، لنوم هادئ على آيات القرآن دون استنزاف بطارية الهاتف.'
      },
      {
        id: 'sleep_timer_controls',
        name: 'أزرار ضبط دقائق مؤقت النوم (+ و -)',
        icon: 'fa-solid fa-plus-minus',
        visualType: 'pill-button',
        iconColor: '#f59e0b',
        label: '+ / -',
        purpose: 'تتيح لك زيادة أو تقليل دقائق مؤقت النوم بدقة حسب رغبتك قبل تفعيل المؤقت.'
      },
      {
        id: 'sleep_timer_toggle_btn',
        name: 'زر بدء / إيقاف مؤقت النوم',
        icon: 'fa-solid fa-clock',
        visualType: 'circle-button',
        iconColor: '#f59e0b',
        label: 'بدء المؤقت',
        purpose: 'يبدأ العد التنازلي لإيقاف الصوت تلقائياً، والضغط عليه مرة أخرى أثناء عمل المؤقت يقوم بإلغائه وإعادة ضبطه.'
      },
      {
        id: 'download_quran_btn',
        name: 'زر تحميل المصحف والتلاوات',
        icon: 'fa-solid fa-cloud-arrow-down',
        visualType: 'pill-button',
        iconColor: '#059669',
        label: 'تحميل المصحف',
        purpose: 'ينقلك مباشرة لصفحة تحميل سور القرآن الكريم بصوت القارئ المختار لتخزينها على هاتفك والاستماع إليها في أي وقت دون اتصال بالإنترنت.'
      },
      {
        id: 'favorites_list_card',
        name: 'بطاقة وقائمة المفضلات المحفوظة',
        icon: 'fa-solid fa-heart',
        visualType: 'card-button',
        iconColor: '#ef4444',
        label: 'المفضلات (حتى 10)',
        purpose: 'قائمة سريعة تتسع لحفظ حتى 10 سور مع القراء المفضلين لكل سورة، تتيح لك تشغيل تلاوتك المفضلة فوراً بلمسة واحدة.'
      },
      {
        id: 'delete_favorite_btn',
        name: 'زر حذف السورة من المفضلة',
        icon: 'fa-solid fa-trash-can',
        visualType: 'circle-button',
        iconColor: '#ef4444',
        label: 'حذف',
        purpose: 'يتيح لك إزالة أي سورة محفوظة من قائمة المفضلات لإفساح المجال لسور وقراء آخرين.'
      }
    ]
  },

  // 3. مواقيت الصلاة (شرح مفصل ودقيق وشامل لكل ميزة وزر)
  {
    id: 'prayer-times',
    pageName: 'مواقيت الصلاة',
    buttons: [
      {
        id: 'location_gps_btn',
        name: 'زر تحديد وتحديث الموقع الجغرافي (GPS)',
        icon: 'fa-solid fa-location-dot',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'تحديث الموقع',
        purpose: 'يقوم بتحديد إحداثيات موقعك الجغرافي الفعلي بدقة عبر الأقمار الصناعية (GPS)، لحساب مواقيت الصلوات الخمس والشروق بدقة الثواني حسب خط الطول ودائرة العرض لمدينتك أو قريتك الحالية، وهو ضروري جداً عند السفر.'
      },
      {
        id: 'city_search_bar',
        name: 'شريط البحث عن المدن والدول حول العالم',
        icon: 'fa-solid fa-magnifying-glass',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'ابحث عن أي مدينة أو دولة...',
        purpose: 'يتيح لك البحث بالاسم عن أي مدينة أو عاصمة أو محافظة في العالم لمعرفة مواقيت الصلاة فيها فوراً، مع إمكانية اعتمادها وحفظها كموقع افتراضي دائم لحساب الصلوات.'
      },
      {
        id: 'countdown_card',
        name: 'بطاقة الصلاة القادمة والعد التنازلي التفاعلي',
        icon: 'fa-solid fa-stopwatch',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'الصلاة القادمة • متبقي 02:45:12',
        purpose: 'تعرض اسم الصلاة القادمة ومتبقي الوقت عليها بالعد التنازلي الحي والمستمر بالساعات والدقائق والثواني، مع إبراز البطاقة بلون زمردي فخم متناسق لترتيب جدولك اليومي قبل دخول وقت الفريضة.'
      },
      {
        id: 'prayer_cards',
        name: 'بطاقات مواقيت الصلوات الخمس والشروق',
        icon: 'fa-solid fa-mosque',
        visualType: 'card-button',
        iconColor: '#3b82f6',
        label: 'الفجر • الشروق • الظهر • العصر • المغرب • العشاء',
        purpose: 'تعرض الوقت الدقيق لدخول كل صلاة بنظام 12 ساعة (صباحاً ومساءً)، مع تظليل وقت الصلاة الحالية تلقائياً باللون الأخضر وتمييزها لمعرفة ما مضى وما تبقى من أوقات الفرائض.'
      },
      {
        id: 'night_times',
        name: 'حاسبة أوقات قيام الليل والتهجد وقت السحر',
        icon: 'fa-solid fa-moon',
        visualType: 'card-button',
        iconColor: '#8b5cf6',
        label: 'منتصف الليل • الثلث الأخير (النزول الإلهي)',
        purpose: 'تقوم بحساب وتحديد وقت منتصف الليل الشرعي وبدء الثلث الأخير من الليل (وقت النزول الإلهي واستجابة الدعاء) بدقة فلكية تامة، مع إمكانية ضبط منبه التهجد والاستغفار بالأسحار.'
      },
      {
        id: 'azan_tone',
        name: 'زر تخصيص نغمة وصوت الأذان لكل صلاة',
        icon: 'fa-solid fa-bell',
        visualType: 'circle-button',
        iconColor: '#f59e0b',
        label: 'نغمة الأذان',
        purpose: 'يتيح التحكم المستقل والشامل في كل صلاة؛ باختيار الأذان الكامل (بصوت كبار مؤذني الحرم المكي أو المدني أو الأقصى)، أو الاكتفاء بالتكبيرات الأولى فقط، أو رنين تنبيه هادئ، أو كتم صوت صلاة محددة.'
      },
      {
        id: 'auto_silent',
        name: 'زر الوضع الصامت التلقائي في المسجد (Auto Silent)',
        icon: 'fa-solid fa-volume-xmark',
        visualType: 'toggle-button',
        iconColor: '#ef4444',
        label: 'صامت تلقائي بالمسجد',
        purpose: 'يحول رنين الهاتف تلقائياً وبذكاء إلى الوضع الصامت بعد أذان الصلاة أو الإقامة بـ 20 ثانية ولمدة الصلاة المحددة (مثل 15 أو 20 دقيقة) لحفظ الخشوع ومنع الإحراج بالمسجد، ثم يعيد رنين الهاتف تلقائياً فور الانتهاء.'
      },
      {
        id: 'wudu_alert',
        name: 'زر تنبيه الاستعداد والوضوء المسبق',
        icon: 'fa-solid fa-hand-holding-droplet',
        visualType: 'toggle-button',
        iconColor: '#06b6d4',
        label: 'تنبيه مسبق (5 أو 10 دقائق)',
        purpose: 'يطلق نغمة تنبيه هادئة قبل موعد الأذان بوقت كافٍ (5 أو 10 أو 15 دقيقة) لتستعد وتتوضأ وتذهب إلى بيت الله مبكراً لإدراك الصف الأول وتكبيرة الإحرام.'
      },
      {
        id: 'iqama_alert',
        name: 'زر تنبيه إقامة الصلاة واستواء الصفوف',
        icon: 'fa-solid fa-clock',
        visualType: 'toggle-button',
        iconColor: '#8b5cf6',
        label: 'تنبيه الإقامة',
        purpose: 'يصدر تنبيهاً صوتياً ومرئياً ينبهك عند حلول وقت إقامة الصلاة بناءً على الفارق الزمني المحدد لكل فريضة، مع إمكانية تعديل دقائق الإقامة لكل صلاة بشكل منفصل.'
      },
      {
        id: 'prayer_offset',
        name: 'أداة معايرة وضبط دقائق المواقيت (Offset ±)',
        icon: 'fa-solid fa-sliders',
        visualType: 'pill-button',
        iconColor: '#6366f1',
        label: 'معايرة الدقائق (±)',
        purpose: 'تتيح لك تقديم أو تأخير توقيت أي صلاة بعدد من الدقائق (+1، +2 أو -1، -2 دقيقة...) لتتطابق مواقيت التطبيق بنسبة 100% مع التوقيت المعتمد في المسجد المجاور لمنزلك أو توقيت الأوقاف المحلي.'
      },
      {
        id: 'monthly_times_btn',
        name: 'زر إمساكية وجدول مواقيت الشهر بالكامل',
        icon: 'fa-solid fa-calendar-days',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'إمساكية الشهر',
        purpose: 'يفتح جدولاً كاملاً لمواقيت الصلوات الخمس والشروق طوال أيام الشهر الهجري والميلادي معاً، لمعرفة مواعيد الإمساك والإفطار لأيام الصيام وصيام النوافل وتنظيم جدولك الشهري.'
      },
      {
        id: 'date_search',
        name: 'زر بحث مواقيت أي تاريخ هجري أو ميلادي',
        icon: 'fa-solid fa-calendar-day',
        visualType: 'circle-button',
        iconColor: '#ec4899',
        label: 'بحث التاريخ',
        purpose: 'يمكنك من اختيار أي تاريخ سابق أو مستقبلي بالتقويم الهجري أو الميلادي لعرض مواقيت الصلوات الدقيقة الخاصة بذلك اليوم المحدد دون تغيير الموقع.'
      },
      {
        id: 'dst_toggle',
        name: 'زر التوقيت الصيفي / الشتوي (Daylight Saving)',
        icon: 'fa-solid fa-sun',
        visualType: 'toggle-button',
        iconColor: '#f59e0b',
        label: 'التوقيت الصيفي (DST)',
        purpose: 'لتقديم الساعة 60 دقيقة أو تأخيرها تلقائياً بما يتوافق مع قرارات التوقيت الصيفي والشتوي الرسمية في بلدك لضمان عدم حدوث أي فارق زمني في موعد الأذان.'
      },
      {
        id: 'home_screen_widget',
        name: 'ودجت مواقيت الصلاة لشاشة الهاتف (Widget)',
        icon: 'fa-solid fa-table-cells-large',
        visualType: 'card-button',
        iconColor: '#3b82f6',
        label: 'تطبيق مصغر للشاشة الرئيسية',
        purpose: 'يتيح لك وضع تطبيق مصغر (Widget) لمواقيت الصلاة على الشاشة الرئيسية لهاتفك الأندرويد، لمتابعة الصلوات والعد التنازلي للصلاة القادمة دون الحاجة لفتح التطبيق.'
      }
    ]
  },

  // 4. القبلة
  {
    id: 'qibla',
    pageName: 'القبلة',
    buttons: [
      {
        id: 'compass_dial',
        name: 'قرص البوصلة الرقمي التفاعلي',
        icon: 'fa-solid fa-compass',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'قرص البوصلة',
        purpose: 'يدور تلقائياً مع حركة يدك وهاتفك بالاعتماد على مستشعر الجيروسكوب المدمج لتحديد الاتجاهات الأربعة بدقة متناهية.'
      },
      {
        id: 'kaaba_indicator',
        name: 'مؤشر الكعبة المشرفة وتأكيد الاتجاه',
        icon: 'fa-solid fa-kaaba',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'اتجاه الكعبة',
        purpose: 'سهم ذكي يشير لموقع الكعبة، وعند توجيه الهاتف باتجاه القبلة تماماً يتحول لونه إلى الأخضر الزمردي ويهتز الهاتف تفاعلياً لتأكيد صحة اتجاه صلاتك.'
      },
      {
        id: 'degree_angle',
        name: 'عداد زاوية الانحراف الرقمي بالدرجات',
        icon: 'fa-solid fa-location-crosshairs',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'درجة الزاوية (مثلاً 140°)',
        purpose: 'يعرض زاوية انحراف القبلة بالدرجات الرقمية الدقيقة نسبة إلى الشمال المغناطيسي والحقيقي.'
      },
      {
        id: 'distance_text',
        name: 'مؤشر المسافة المباشرة لمكة المكرمة',
        icon: 'fa-solid fa-route',
        visualType: 'pill-button',
        iconColor: '#f59e0b',
        label: 'المسافة بالكيلومترات',
        purpose: 'يحسب ويعرض المسافة الجغرافية بالكيلومترات بين موقعك الحالي المشخص والكعبة المشرفة بمكة المكرمة.'
      }
    ]
  },

  // 5. أذكار الصلاة
  {
    id: 'salah-adhkar',
    pageName: 'أذكار الصلاة',
    buttons: [
      {
        id: 'tasbeeh_33',
        name: 'عداد التسبيح (سبحان الله - 33 مرة)',
        icon: 'fa-solid fa-hand-pointer',
        visualType: 'counter-button',
        iconColor: '#10b981',
        label: 'سبحان الله (33)',
        purpose: 'زر تفاعلي تضغط عليه لتسبيح الله عقب الصلاة المكتوبة، وينقص الرقم مع كل لمسة حتى تنهي 33 مرة مع اهتزاز لمسي.'
      },
      {
        id: 'tahmeed_33',
        name: 'عداد التحميد (الحمد لله - 33 مرة)',
        icon: 'fa-solid fa-hand-pointer',
        visualType: 'counter-button',
        iconColor: '#3b82f6',
        label: 'الحمد لله (33)',
        purpose: 'زر تفاعلي لحمد الله 33 مرة بعد الفريضة، ينقص باللمس مع اهتزاز تفاعلي عند الاكتمال.'
      },
      {
        id: 'takbeer_33',
        name: 'عداد التكبير (الله أكبر - 33 مرة)',
        icon: 'fa-solid fa-hand-pointer',
        visualType: 'counter-button',
        iconColor: '#8b5cf6',
        label: 'الله أكبر (33)',
        purpose: 'زر تفاعلي لتكبير الله 33 مرة عقب السلام ينقص باللمس.'
      },
      {
        id: 'tamam_100',
        name: 'بطاقة دعاء تمام المائة النبوي',
        icon: 'fa-solid fa-certificate',
        visualType: 'card-button',
        iconColor: '#f59e0b',
        label: 'لا إله إلا الله وحده لا شريك له...',
        purpose: 'لقراءة دعاء ختام المائة الوارد في صحيح السنة لغفران الخطايا والذنوب وإن كانت مثل زبد البحر.'
      },
      {
        id: 'salah_copy',
        name: 'زر نسخ الأذكار والمشاركة',
        icon: 'fa-regular fa-copy',
        visualType: 'circle-button',
        iconColor: '#6366f1',
        label: 'نسخ',
        purpose: 'ينسخ نص الذكر النبوي وسنده إلى الحافظة لنشره وتذكير المسلمين به.'
      }
    ]
  },

  // 6. الأدعية
  {
    id: 'adia',
    pageName: 'الأدعية',
    buttons: [
      {
        id: 'adia_cats',
        name: 'شريط تصنيفات وأبواب الأدعية',
        icon: 'fa-solid fa-layer-group',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'أدعية القرآن • أدعية الأنبياء • جوامع الدعاء • الشفاء والكرب',
        purpose: 'للتبديل السريع بين أبواب الأدعية وتصفح الأدعية القرآنية والنبوية الجامعة وأدعية الشفاء وتفريج الكرب.'
      },
      {
        id: 'adia_search',
        name: 'شريط البحث الفوري في نصوص الأدعية',
        icon: 'fa-solid fa-magnifying-glass',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'بحث في الأدعية...',
        purpose: 'للوصول المباشر والسريع لأي دعاء بمجرد كتابة أي كلمة منه أو من مناسبته.'
      },
      {
        id: 'adia_tts',
        name: 'زر الاستماع الصوتي للدعاء',
        icon: 'fa-solid fa-volume-high',
        visualType: 'circle-button',
        iconColor: '#8b5cf6',
        label: 'استماع للدعاء',
        purpose: 'يقوم بتشغيل القراءة الصوتية الواضحة للدعاء بالتشكيل الصحيح لترديده وحفظه.'
      },
      {
        id: 'adia_fav',
        name: 'زر حفظ الدعاء في قائمة المفضلة',
        icon: 'fa-solid fa-star',
        visualType: 'circle-button',
        iconColor: '#f59e0b',
        label: 'المفضلة',
        purpose: 'يضيف الدعاء إلى قائمتك المفضلة لتصل إليه بلمسة واحدة في أوقات الإجابة.'
      },
      {
        id: 'adia_copy',
        name: 'زر نسخ نص الدعاء ومصدره',
        icon: 'fa-regular fa-copy',
        visualType: 'circle-button',
        iconColor: '#06b6d4',
        label: 'نسخ الدعاء',
        purpose: 'ينسخ نص الدعاء ومصدره وتخريجه الشرعي من القرآن أو كتب السنة إلى الحافظة.'
      },
      {
        id: 'adia_share',
        name: 'زر مشاركة وتصميم بطاقة الدعاء',
        icon: 'fa-solid fa-share-nodes',
        visualType: 'circle-button',
        iconColor: '#ec4899',
        label: 'مشاركة كصورة',
        purpose: 'يصمم بطاقة إسلامية مذهبة راقية للدعاء لمشاركتها كصورة عبر واتساب وتطبيقات التواصل.'
      },
      {
        id: 'adia_counter',
        name: 'عداد تكرار الدعاء التفاعلي',
        icon: 'fa-solid fa-calculator',
        visualType: 'counter-button',
        iconColor: '#10b981',
        label: 'عداد التكرار',
        purpose: 'زر تفاعلي ينقص مع كل قراءة لتسجيل ومتابعة عدد مرات تكرارك للأدعية المأثورة.'
      }
    ]
  },

  // 7. حصن المسلم
  {
    id: 'hisn-muslim',
    pageName: 'حصن المسلم',
    buttons: [
      {
        id: 'hisn_categories',
        name: 'قائمة أبواب كتاب حصن المسلم الـ 130',
        icon: 'fa-solid fa-shield-halved',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'أذكار النوم • الاستيقاظ • المسجد • السفر • الهم والغم...',
        purpose: 'تصفح كافة أبواب كتاب حصن المسلم للدخول لأدعية وأذكار كل موقف وحال من أحوال المسلم.'
      },
      {
        id: 'hisn_search',
        name: 'شريط البحث في أبواب وأذكار الحصن',
        icon: 'fa-solid fa-magnifying-glass',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'ابحث في حصن المسلم...',
        purpose: 'للوصول المباشر للذكر المطلوب بمجرد كتابة اسمه أو موضوعه أو جزء من نصه.'
      },
      {
        id: 'hisn_font',
        name: 'زر التحكم بحجم الخط',
        icon: 'fa-solid fa-text-height',
        visualType: 'circle-button',
        iconColor: '#8b5cf6',
        label: 'حجم الخط',
        purpose: 'تكبير وتصغير حجم خط نصوص الأذكار لراحة العين والقراءة السهلة لكبار السن.'
      },
      {
        id: 'hisn_share',
        name: 'زر مشاركة الذكر مع تخريجه',
        icon: 'fa-solid fa-share-nodes',
        visualType: 'circle-button',
        iconColor: '#f59e0b',
        label: 'مشاركة الذكر',
        purpose: 'مشاركة نص الذكر وتخريجه الشرعي وفضله مع الأهل والأصدقاء لنيل الأجر.'
      }
    ]
  },

  // 8. الأذكار (الصباح والمساء)
  {
    id: 'sabah-masaa',
    pageName: 'الأذكار',
    buttons: [
      {
        id: 'tab_sabah',
        name: 'تبويب أذكار الصباح المباركة',
        icon: 'fa-solid fa-sun',
        visualType: 'pill-button',
        iconColor: '#f59e0b',
        label: 'أذكار الصباح',
        purpose: 'يعرض باقة أذكار الصباح المأثورة عن النبي ﷺ لتبدأ بها يومك في حفظ الله ورعايته.'
      },
      {
        id: 'tab_masaa',
        name: 'تبويب أذكار المساء والتحصين',
        icon: 'fa-solid fa-moon',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'أذكار المساء',
        purpose: 'يعرض باقة أذكار المساء المأثورة للتحصين والسكينة في المساء والليل.'
      },
      {
        id: 'dhikr_card_click',
        name: 'كارت الذكر والعداد التنازلي التفاعلي',
        icon: 'fa-solid fa-hand-pointer',
        visualType: 'counter-button',
        iconColor: '#10b981',
        label: 'اضغط لإنقاص العدد المتبقي',
        purpose: 'انقر في أي مكان على الكارت لإنقاص العدد المتبقي، ويتحول الكارت إلى اللون الأخضر ويهتز الهاتف عند إتمام تكرار الذكر.'
      },
      {
        id: 'dhikr_fadl',
        name: 'خانة فضل الذكر وثوابه وتخريجه',
        icon: 'fa-solid fa-book-bookmark',
        visualType: 'card-button',
        iconColor: '#06b6d4',
        label: 'فضل الذكر وتخريجه',
        purpose: 'توضح ثواب الذكر وأجره العظيم وتخريجه وسنده من كتب السنة والحديث الصحيحة.'
      },
      {
        id: 'dhikr_audio',
        name: 'زر الاستماع الصوتي للذكر',
        icon: 'fa-solid fa-volume-high',
        visualType: 'circle-button',
        iconColor: '#3b82f6',
        label: 'استماع صوتي',
        purpose: 'يشغل القراءة الصوتية المرتلة الواضحة للذكر لتستمع وتردد معه بالتشكيل الصحيح.'
      },
      {
        id: 'dhikr_reset',
        name: 'زر إعادة الضبط لجميع العدادات',
        icon: 'fa-solid fa-arrow-rotate-left',
        visualType: 'circle-button',
        iconColor: '#ef4444',
        label: 'إعادة ضبط الورد',
        purpose: 'يقوم بتصفير جميع العدادات وإعادتها لأعدادها الأصلية لتقرأ الورد من جديد في الصباح أو المساء.'
      }
    ]
  },

  // 9. التقويم
  {
    id: 'calendar',
    pageName: 'التقويم',
    buttons: [
      {
        id: 'hijri_display',
        name: 'شاشة التاريخ الهجري والميلادي المتزامنة',
        icon: 'fa-solid fa-calendar-check',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'اليوم والشهر والسنة الهجرية',
        purpose: 'عرض دقيق لليوم الهجري الحالي وما يوافقه بالتقويم الميلادي بتنسيق أنيق وواضح.'
      },
      {
        id: 'blessed_days',
        name: 'شارات الأيام الفاضلة وصيام السنن',
        icon: 'fa-solid fa-star-and-crescent',
        visualType: 'pill-button',
        iconColor: '#f59e0b',
        label: 'أيام البيض • الإثنين والخميس • عاشوراء',
        purpose: 'تنبيهات بصرية بالتواريخ التي يُستحب صيامها كأيام البيض (13 و14 و15) وصيام الإثنين والخميس وعاشوراء وعرفة.'
      },
      {
        id: 'month_nav',
        name: 'أسهم الانتقال بين الشهور الهجرية',
        icon: 'fa-solid fa-chevron-left',
        visualType: 'circle-button',
        iconColor: '#3b82f6',
        label: 'الشهر القادم / السابق',
        purpose: 'تصفح شهور السنة الهجرية القادمة والسابقة لمعرفة المناسبات ومواعيد الشهور مقدماً.'
      },
      {
        id: 'calibrate_day',
        name: 'زر معايرة التاريخ الهجري (+1 / -1)',
        icon: 'fa-solid fa-sliders',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'تعديل اليوم (+1 / -1)',
        purpose: 'لتقديم أو تأخير التاريخ الهجري بيوم واحد ليتطابق تماماً مع إعلان رؤية الهلال الرسمية في بلدك.'
      }
    ]
  },

  // 10. الحج والعمرة
  {
    id: 'hajj-umrah',
    pageName: 'الحج والعمرة',
    buttons: [
      {
        id: 'umrah_tab',
        name: 'تبويب خطوات ومناسك العمرة',
        icon: 'fa-solid fa-kaaba',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'مناسك العمرة خطوة بخطوة',
        purpose: 'يعرض خطوات أداء العمرة بالترتيب الشرعي (الإحرام، الطواف 7 أشواط، السعي 7 أشواط، والحلق أو التقصير) مع أدعية كل خطوة.'
      },
      {
        id: 'hajj_tab',
        name: 'تبويب أيام ومناسك الحج يوماً بيوم',
        icon: 'fa-solid fa-campground',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'مناسك الحج يوماً بيوم',
        purpose: 'يعرض أعمال الحج مرتبة بالتواريخ: يوم التروية (8 ذو الحجة)، عرفة (9)، ليلة مزدلفة، يوم النحر (10)، وأيام التشريق مع واجبات وسنن كل يوم.'
      },
      {
        id: 'duaa_cards',
        name: 'بطاقات أدعية المناسك الصحيحة',
        icon: 'fa-solid fa-hands-praying',
        visualType: 'card-button',
        iconColor: '#f59e0b',
        label: 'أدعية الطواف والسعي وعرفة',
        purpose: 'تعرض الأدعية الثابتة عن النبي ﷺ في الطواف والسعي وعلى الصفا والمروة وفي صعيد عرفات الطاهر مع الترجمة وشرح المعاني.'
      }
    ]
  },

  // 11. السبحة
  {
    id: 'tasbeeh',
    pageName: 'السبحة',
    buttons: [
      {
        id: 'big_tasbeeh_btn',
        name: 'زر التسبيح ثلاثي الأبعاد الضخم',
        icon: 'fa-solid fa-fingerprint',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'زر التسبيح',
        purpose: 'الزر الرئيسي الذي تضغط عليه للتسبيح، مع صوت نقرة خفيف واهتزاز لمسي تفاعلي (Haptic) يحاكي حبات السبحة الحقيقية.'
      },
      {
        id: 'dhikr_select',
        name: 'قائمة اختيار صيغ الذكر المأثورة',
        icon: 'fa-solid fa-list-check',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'اختيار الذكر',
        purpose: 'للتبديل السريع بين صيغ الأذكار المأثورة والاستغفار والصلاة على النبي ﷺ والتسبيح بها.'
      },
      {
        id: 'target_goal',
        name: 'أزرار تحديد الهدف (33 • 100 • حر ∞)',
        icon: 'fa-solid fa-bullseye',
        visualType: 'pill-button',
        iconColor: '#f59e0b',
        label: 'الهدف: ٣٣',
        purpose: 'يحدد عدد التسبيحات المطلوب إنجازها، مع تنبيه واهتزاز مميز عند إكمال الهدف المحدد بنجاح.'
      },
      {
        id: 'add_custom_dhikr',
        name: 'زر إضافة ذكر وأوراد مخصصة (+)',
        icon: 'fa-solid fa-plus',
        visualType: 'circle-button',
        iconColor: '#8b5cf6',
        label: 'إضافة ذكر',
        purpose: 'يتيح لك كتابة أي صيغة ذكر أو ورد خاص بك وتحديد عدده وهدفه ولونه المفضل لتكراره يومياً.'
      },
      {
        id: 'reset_counter',
        name: 'زر تصفير العداد الحالي',
        icon: 'fa-solid fa-rotate-right',
        visualType: 'circle-button',
        iconColor: '#ef4444',
        label: 'تصفير العداد',
        purpose: 'يعيد عداد التسبيحات الحالي إلى الصفر للبدء من جديد مع الاحتفاظ بالمجموع الإجمالي في الإحصائيات.'
      },
      {
        id: 'tasbeeh_stats',
        name: 'زر الإحصائيات والرسم البياني',
        icon: 'fa-solid fa-chart-line',
        visualType: 'circle-button',
        iconColor: '#06b6d4',
        label: 'الإحصائيات',
        purpose: 'يعرض مجموع تسبيحاتك اليومية والأسبوعية والشهرية مع رسم بياني يوضح مداومتك على ذكر الله.'
      }
    ]
  },

  // 12. مجتمع التواصل (شرح وافٍ وتفصيلي ومحدث)
  {
    id: 'community',
    pageName: 'مجتمع التواصل',
    buttons: [
      {
        id: 'direct_chat_tab',
        name: 'تبويب المحادثات الخاصة (الرسائل المباشرة)',
        icon: 'fa-solid fa-comment-dots',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'المحادثات الخاصة',
        purpose: 'يفتح قائمة محادثاتك الفردية الخاصة مع الإخوة وأهل القرآن، للتراسل الفوري، وتبادل الفوائد والتسجيلات القرآنية في بيئة إسلامية آمنة ومراقبة.'
      },
      {
        id: 'groups_tab',
        name: 'تبويب مجموعات التدارس وحلقات التلاوة الجماعية',
        icon: 'fa-solid fa-user-group',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'مجموعات التدارس',
        purpose: 'يتيح تصفح والانضمام إلى مجموعات تدارس القرآن الكريم والحديث النبوي، وحلقات مدارسة كتب التفسير، والتنافس على الختمات والمراجعة الجماعية.'
      },
      {
        id: 'users_directory_tab',
        name: 'تبويب دليل الأعضاء والبحث عن رفقاء القرآن',
        icon: 'fa-solid fa-address-book',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'دليل الأعضاء',
        purpose: 'يعرض قائمة الأعضاء المسجلين في التطبيق مع صورتهم الرمزية ونبذتهم ورتبتهم في قراءة القرآن، للتعرف عليهم وإرسال طلبات صداقة أو بدء محادثة هادفة.'
      },
      {
        id: 'blocked_users_tab',
        name: 'تبويب قائمة المحظورين وفك الحظر',
        icon: 'fa-solid fa-user-slash',
        visualType: 'pill-button',
        iconColor: '#ef4444',
        label: 'قائمة المحظورين',
        purpose: 'يعرض الحسابات التي قمت بحظرها لمنع وصول أي رسائل منها، مع إمكانية إلغاء الحظر بضغطة زر في أي وقت إذا رغبت في ذلك.'
      },
      {
        id: 'create_group_btn',
        name: 'زر إنشاء مجموعة تدارس جديدة (+)',
        icon: 'fa-solid fa-folder-plus',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'إنشاء مجموعة',
        purpose: 'يتيح لك تأسيس حلقة أو مجموعة تدارس خاصة بك، مع تسميتها وتحديد صورتها الرمزية، وكتابة أهدافها وشروطها، ودعوة الأصدقاء للانضمام إليها.'
      },
      {
        id: 'profile_edit_btn',
        name: 'زر تعديل الملف الشخصي والمعلومات الشخصية',
        icon: 'fa-solid fa-user-pen',
        visualType: 'circle-button',
        iconColor: '#3b82f6',
        label: 'تعديل حسابي',
        purpose: 'يتيح تغيير اسمك المعروض، واختيار صورتك الرمزية (أو قص وتحميل صورة خاصة بك)، وكتابة نبذة تعريفية ورقم هاتفك أو معرفك للتواصل.'
      },
      {
        id: 'quran_verse_share_btn',
        name: 'زر إرسال ومشاركة بطاقة آية في المحادثة',
        icon: 'fa-solid fa-book-quran',
        visualType: 'circle-button',
        iconColor: '#f59e0b',
        label: 'إرسال بطاقة آية',
        purpose: 'أداة مخصصة داخل المحادثات تتيح اختيار أي سورة ورقم آية لإرسالها فوراً كبطاقة دعوية مذهبة راقية ليقرأها ويتدبرها الطرف الآخر.'
      },
      {
        id: 'voice_record_btn',
        name: 'زر التسجيل الصوتي للرسائل والتلاوات',
        icon: 'fa-solid fa-microphone',
        visualType: 'circle-button',
        iconColor: '#ef4444',
        label: 'تسجيل صوتي',
        purpose: 'تسجيل رسالة صوتية نقية بصوتك، لقراءة مقطع قرآني لتصحيح التلاوة، أو إرسال فائدة وتوجيه صوتي بنقرة زر واحدة مع إمكانية الاستماع قبل الإرسال.'
      },
      {
        id: 'media_picker_btn',
        name: 'زر إرفاق الصور والملصقات الإسلامية',
        icon: 'fa-solid fa-paperclip',
        visualType: 'circle-button',
        iconColor: '#06b6d4',
        label: 'إرفاق وسائط',
        purpose: 'مشاركة صور الفوائد والبطاقات الدعوية والصور التوضيحية داخل الدردشات والمجموعات لتعميم الفائدة.'
      },
      {
        id: 'unread_messages_badge',
        name: 'عداد وشارة التنبيهات والرسائل غير المقروءة (+99)',
        icon: 'fa-solid fa-circle-exclamation',
        visualType: 'counter-button',
        iconColor: '#dc2626',
        label: 'إشعار بالرسائل الجديدة',
        purpose: 'إشعار بصري أحمر نابض يظهر على المحادثات والمجموعات ليوضح عدد الرسائل الجديدة التي لم تطلع عليها بعد فور ورودها.'
      },
      {
        id: 'search_community_input',
        name: 'شريط البحث في مجتمع التواصل',
        icon: 'fa-solid fa-magnifying-glass',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'ابحث عن صديق أو مجموعة...',
        purpose: 'للوصول السريع إلى أي صديق أو مجموعة أو عضو بكتابة اسمه أو جزء من معرفه الشخصي.'
      },
      {
        id: 'refresh_community_btn',
        name: 'زر التحديث الفوري ومزامنة الرسائل',
        icon: 'fa-solid fa-rotate',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'تحديث المحادثات',
        purpose: 'يقوم بجلب وتحديث قائمة الأعضاء الجدد، ورسائل المحادثات الحديثة، والمجموعات المنشأة من السيرفر فوراً.'
      },
      {
        id: 'admin_dashboard_btn',
        name: 'لوحة الإدارة والرقابة الشرعية للمشرفين',
        icon: 'fa-solid fa-shield-halved',
        visualType: 'circle-button',
        iconColor: '#6366f1',
        label: 'لوحة المشرفين',
        purpose: 'لوحة رقابة مخصصة للإدارة والمشرفين لمتابعة أمان المجتمع وحذف أي محتوى مخالف أو مسيء وحظر المستخدمين غير الملتزمين بالضوابط الإسلامية.'
      }
    ]
  },

  // 13. أهل القرآن
  {
    id: 'ahl-al-quran',
    pageName: 'أهل القرآن',
    buttons: [
      {
        id: 'leaderboard_tab',
        name: 'لوحة المتصدرين (الشرف التنافسي)',
        icon: 'fa-solid fa-trophy',
        visualType: 'card-button',
        iconColor: '#f59e0b',
        label: 'المراكز الأولى في التلاوة',
        purpose: 'تعرض ترتيب القراء الأكثر تلاوة وختماً لكتاب الله شهرياً وتراكمياً مع أوسمة الشرف الذهبية والفضية والبرونزية تشجيعاً على ملازمة القرآن.'
      },
      {
        id: 'my_stats_tab',
        name: 'تبويب إحصائياتي الشخصية وتتبع التلاوة',
        icon: 'fa-solid fa-chart-pie',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'إحصائياتي ورتبتي',
        purpose: 'يعرض عدد صفحاتك المقروءة، عدد الختمات المنجزة، ومعدلك اليومي ورتبتك في لوحة الشرف وأيام استمرارك في القراءة.'
      },
      {
        id: 'share_rank_card',
        name: 'زر مشاركة بطاقة الشرف والإنجاز',
        icon: 'fa-solid fa-share-nodes',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'مشاركة الإنجاز كصورة',
        purpose: 'ينشئ بطاقة مصممة بإنجازك ورتبتك القرآنية لمشاركتها مع أهلك وأصدقائك لتحفيزهم على التنافس في قراءة القرآن.'
      },
      {
        id: 'auto_page_recording',
        name: 'التسجيل الذاتي التلقائي للصفحات',
        icon: 'fa-solid fa-book-open',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'توثيق الصفحات تلقائياً',
        purpose: 'بمجرد قراءة أي صفحة في المصحف تسجل تلقائياً في رصيدك دون الحاجة لتدوين يدوي لضمان نزاهة التنافس.'
      },
      {
        id: 'khatma_counter_display',
        name: 'عداد الختمات المنجزة وتاريخ الإتمام',
        icon: 'fa-solid fa-award',
        visualType: 'counter-button',
        iconColor: '#f59e0b',
        label: 'عدد الختمات المكتملة',
        purpose: 'يوثق عدد المرات التي أتممت فيها ختم المصحف الشريف كاملاً (604 صفحات) مع تاريخ انتهاء كل ختمة مباركة.'
      }
    ]
  },

  // 14. الورد اليومي
  {
    id: 'daily-wird',
    pageName: 'الورد اليومي',
    buttons: [
      {
        id: 'set_wird_goal',
        name: 'زر تحديد وتعديل مقدار الورد اليومي',
        icon: 'fa-solid fa-bullseye',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'تحديد الخطة (صفحات/أجزاء)',
        purpose: 'لتحديد مقدار الصفحات التي تلزم نفسك بقراءتها يومياً (صفحة، 5 صفحات، جزء كامل، إلخ) للحفاظ على ختمة منتظمة ومباركة.'
      },
      {
        id: 'wird_progress_bar',
        name: 'شريط ومؤشر التقدم في الختمة الحالية',
        icon: 'fa-solid fa-chart-simple',
        visualType: 'card-button',
        iconColor: '#3b82f6',
        label: 'الصفحات المنجزة من أصل 604',
        purpose: 'يوضح كم صفحة قرأت حتى الآن، والنسبة المئوية لإنجاز الختمة، وكم تبقى من صفحات لإتمام الختمة الحالية.'
      },
      {
        id: 'jump_to_quran_btn',
        name: 'زر متابعة القراءة في المصحف',
        icon: 'fa-solid fa-book-open-reader',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'متابعة القراءة الآن',
        purpose: 'يفتح المصحف الشريف مباشرة على الصفحة المحددة في وردك اليومي لتبدأ القراءة فوراً دون البحث اليدوي.'
      },
      {
        id: 'wird_history_chart',
        name: 'سجل ومخطط الالتزام بالورد اليومي',
        icon: 'fa-solid fa-calendar-days',
        visualType: 'card-button',
        iconColor: '#f59e0b',
        label: 'سجل القراءة اليومي',
        purpose: 'يعرض لك أيام استمرارك والتزامك بالورد القرآني على مدار أيام الشهر لتشجيعك على المداومة وعدم هجر القرآن.'
      },
      {
        id: 'reset_wird_btn',
        name: 'زر إعادة ضبط الختمة وبدء ختمة جديدة',
        icon: 'fa-solid fa-rotate-left',
        visualType: 'circle-button',
        iconColor: '#ef4444',
        label: 'بدء ختمة جديدة',
        purpose: 'عند إتمام 604 صفحات، يتيح لك بدء ختمة جديدة مع توثيق الختمة السابقة في سجل الختمات.'
      }
    ]
  },

  // 15. التحفيظ
  {
    id: 'memorization',
    pageName: 'التحفيظ',
    buttons: [
      {
        id: 'surah_range_select',
        name: 'قوائم تحديد السورة والمقطع المراد حفظه',
        icon: 'fa-solid fa-list-ol',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'السورة • من آية • إلى آية',
        purpose: 'لتحديد الآيات المحددة التي ترغب في حفظها أو مراجعتها اليوم من أي سورة في القرآن الكريم.'
      },
      {
        id: 'repeat_count_selector',
        name: 'أداة تكرار الآيات للتحفيظ التلقائي',
        icon: 'fa-solid fa-repeat',
        visualType: 'counter-button',
        iconColor: '#3b82f6',
        label: 'تكرار الآية (1 إلى 10 مرات)',
        purpose: 'يكرر الآية تلقائياً بصوت القارئ المختار بعدد المرات التي تحددها حتى يثبت الحفظ ومخارج الكلمات في الذاكرة.'
      },
      {
        id: 'hide_words_mode',
        name: 'زر وضع التسميع الذاتي (إخفاء الكلمات)',
        icon: 'fa-solid fa-eye-slash',
        visualType: 'toggle-button',
        iconColor: '#f59e0b',
        label: 'إخفاء الكلمات للتسميع',
        purpose: 'يقوم بإخفاء كلمات أو آيات لتختبر حفظك ذاتياً وتكتشف إن كنت تحفظها غيباً دون النظر للمصحف.'
      },
      {
        id: 'reveal_text_btn',
        name: 'زر كشف الآية للتأكد من التسميع',
        icon: 'fa-solid fa-eye',
        visualType: 'circle-button',
        iconColor: '#06b6d4',
        label: 'كشف النص',
        purpose: 'يظهر الكلمات المخفية للتأكد من صحة تسميعك وتصحيح الخطأ مباشرة قبل التسميع للمحفظ.'
      },
      {
        id: 'review_test_modal',
        name: 'زر اختبار المراجعة وتكملة الآية التالية',
        icon: 'fa-solid fa-circle-question',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'اختبار الحفظ',
        purpose: 'يطرح عليك اختباراً تفاعلياً يعرض بداية آية ويطلب منك معرفة وتحديد الآية التي تليها لاختبار رسوخ الحفظ وترابط الآيات.'
      }
    ]
  },

  // 16. مربّي العبادات
  {
    id: 'habit-tracker',
    pageName: 'مربّي العبادات',
    buttons: [
      {
        id: 'prayers_check',
        name: 'خانات الصلوات المفروضة الخمس',
        icon: 'fa-solid fa-check',
        visualType: 'counter-button',
        iconColor: '#10b981',
        label: 'الفجر • الظهر • العصر • المغرب • العشاء',
        purpose: 'وضع علامة صح عند أداء الفريضة في وقتها لحساب نسبة التزامك اليومي بالصلوات في المسجد وفي أوقاتها.'
      },
      {
        id: 'sunnah_check',
        name: 'خانات السنن الرواتب والنوافل والوتر',
        icon: 'fa-solid fa-check',
        visualType: 'counter-button',
        iconColor: '#3b82f6',
        label: 'السنن الرواتب • الوتر • قيام الليل • الضحى',
        purpose: 'تسجيل أداء السنن والنوافل اليومية وركعتي الضحى والوتر لنيل الأجر والمداومة على هدي النبي ﷺ.'
      },
      {
        id: 'quran_adhkar_check',
        name: 'خانات الورد القرآني وأذكار اليوم',
        icon: 'fa-solid fa-check',
        visualType: 'counter-button',
        iconColor: '#8b5cf6',
        label: 'الورد القرآني • أذكار الصباح والمساء',
        purpose: 'لتوثيق قراءة وردك القرآني اليومي وأذكار الصباح والمساء وأذكار النوم والاستغفار.'
      },
      {
        id: 'birr_check',
        name: 'خانات أعمال البر والصدقات والإحسان',
        icon: 'fa-solid fa-heart',
        visualType: 'counter-button',
        iconColor: '#ec4899',
        label: 'الصدقة • بر الوالدين • صلة الرحم',
        purpose: 'تذكير يومي بأعمال الإحسان والبر وتسجيل إنجازها لتكون عباداتك متكاملة روحياً وسلوكياً.'
      },
      {
        id: 'add_habit',
        name: 'زر إضافة عبادة وطاعة مخصصة (+)',
        icon: 'fa-solid fa-plus',
        visualType: 'circle-button',
        iconColor: '#f59e0b',
        label: 'إضافة عبادة جديدة',
        purpose: 'يتيح لك إضافة أي طاعة خاصة بك (مثل صيام الإثنين، قراءة كتاب تفسير، كفالة يتيم) ومتابعتها يومياً.'
      },
      {
        id: 'heatmap_view',
        name: 'المخطط البياني والحراري الشهري',
        icon: 'fa-solid fa-calendar-days',
        visualType: 'card-button',
        iconColor: '#06b6d4',
        label: 'مخطط الإنجاز والالتزام الشهري',
        purpose: 'يعرض مستوى أدائك للعبادات بالألوان على مدار أيام الشهر لمعرفة مدى استمرارك في الطاعات ومواطن التقصير لتداركها.'
      },
      {
        id: 'weekly_achievement',
        name: 'تقرير الإنجاز الأسبوعي والأوسمة',
        icon: 'fa-solid fa-award',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'تقرير الأسبوع',
        purpose: 'ملخص شامل في نهاية كل أسبوع يوضح نسبة التزامك بالصلوات والقرآن والسنن، مع وسام تشجيعي للمثابرة.'
      }
    ]
  },

  // 17. الرقية الشرعية
  {
    id: 'others',
    pageName: 'الرقية الشرعية',
    buttons: [
      {
        id: 'ruqya_quran_cards',
        name: 'بطاقات آيات الرقية من القرآن الكريم',
        icon: 'fa-solid fa-book-quran',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'آية الكرسي • الفاتحة • خواتيم البقرة • المعوذات',
        purpose: 'تعرض نصوص آيات التحصين والشفاء من كتاب الله تعالى مضبوطة بالتشكيل التام مع تبيان عدد مرات قراءتها المأثورة.'
      },
      {
        id: 'ruqya_sunnah_cards',
        name: 'بطاقات أدعية الرقية من السنة النبوية',
        icon: 'fa-solid fa-hands-praying',
        visualType: 'card-button',
        iconColor: '#3b82f6',
        label: 'أدعية الشفاء والتحصين من السنة',
        purpose: 'تعرض الأدعية الثابتة عن النبي ﷺ للتحصين والشفاء من المرض والعين والحسد والمس مع ذكر المصدر والتخريج.'
      },
      {
        id: 'ruqya_audio_play',
        name: 'زر الاستماع الصوتي للرقية الشرعية',
        icon: 'fa-solid fa-volume-high',
        visualType: 'circle-button',
        iconColor: '#8b5cf6',
        label: 'تشغيل الرقية',
        purpose: 'يشغل تلاوة وقراءة آيات وأدعية الرقية الشرعية كاملة بصوت خاشع ومؤثر للاستماع إليها في البيت أو السيارة.'
      },
      {
        id: 'ruqya_copy_btn',
        name: 'زر نسخ نصوص الرقية الشرعية',
        icon: 'fa-regular fa-copy',
        visualType: 'circle-button',
        iconColor: '#f59e0b',
        label: 'نسخ',
        purpose: 'ينسخ نصوص الرقية الشرعية مرتبة لمشاركتها مع المريض أو من يحتاجها للرقية الذاتية.'
      },
      {
        id: 'ruqya_share_btn',
        name: 'زر مشاركة الرقية كبطاقة إيمانية',
        icon: 'fa-solid fa-share-nodes',
        visualType: 'circle-button',
        iconColor: '#06b6d4',
        label: 'مشاركة كصورة',
        purpose: 'تصميم بطاقة دعوية مميزة لآيات وأدعية الرقية لمشاركتها عبر الواتساب ووسائل التواصل الاجتماعي.'
      }
    ]
  },

  // 18. مواقع إسلامية
  {
    id: 'islamic-sites',
    pageName: 'مواقع إسلامية',
    buttons: [
      {
        id: 'site_cards',
        name: 'بطاقات المواقع الإسلامية المعتمدة',
        icon: 'fa-solid fa-globe',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'مجمع الملك فهد • دار الإفتاء • الدرر السنية...',
        purpose: 'تعرض أهم وأوثق المواقع العلمية الشرعية الموثوقة للفتاوى وتفاسير القرآن الكريم وتخريج الحديث الشريف والبحوث الفقهية.'
      },
      {
        id: 'open_site_btn',
        name: 'زر فتح وتصفح الموقع الرسمي مباشرة',
        icon: 'fa-solid fa-arrow-up-right-from-square',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'فتح الرابط الخارجي',
        purpose: 'ينقلك مباشرة إلى الموقع الرسمي على متصفح هاتفك لتصفح الفتاوى والبحوث الموثقة بكل أمان وسرعة.'
      },
      {
        id: 'copy_site_url',
        name: 'زر نسخ رابط الموقع الإلكتروني',
        icon: 'fa-regular fa-copy',
        visualType: 'circle-button',
        iconColor: '#8b5cf6',
        label: 'نسخ الرابط',
        purpose: 'ينسخ رابط الموقع الإلكتروني إلى الحافظة لمشاركته مع الآخرين أو حفظه في المفضلة.'
      },
      {
        id: 'site_search_input',
        name: 'شريط البحث وتصفية المواقع الإسلامية',
        icon: 'fa-solid fa-magnifying-glass',
        visualType: 'pill-button',
        iconColor: '#f59e0b',
        label: 'بحث في المواقع...',
        purpose: 'للبحث الفوري عن المواقع المتخصصة بالقرآن أو الفتاوى أو الحديث الشريف أو السيرة النبوية.'
      }
    ]
  },

  // 19. الحاسبة الشرعية
  {
    id: 'calculators',
    pageName: 'الحاسبة الشرعية',
    buttons: [
      {
        id: 'zakat_money_calc',
        name: 'حاسبة زكاة المال والنقدين والمدخرات (2.5%)',
        icon: 'fa-solid fa-coins',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'حساب زكاة المال (2.5%)',
        purpose: 'أدخل قيمة أموالك ومدخراتك البنكية، لتقوم الحاسبة بمقارنتها بنصاب الذهب والفضة وحساب مقدار الزكاة الواجب إخراجها فوراً عند دوران الحول.'
      },
      {
        id: 'zakat_gold_calc',
        name: 'حاسبة زكاة الذهب والفضة بمختلف العيارات',
        icon: 'fa-solid fa-scale-balanced',
        visualType: 'card-button',
        iconColor: '#f59e0b',
        label: 'حساب زكاة الذهب والفضة',
        purpose: 'أدخل عدد جرامات الذهب أو الفضة وعياره (24، 21، 18) لتعرف إن بلغ النصاب الشرعي ومقدار زكاته بالجرام والنقد بدقة.'
      },
      {
        id: 'mawarith_calc',
        name: 'حاسبة المواريث وتوزيع التركات الشرعية',
        icon: 'fa-solid fa-users',
        visualType: 'card-button',
        iconColor: '#3b82f6',
        label: 'حساب وتوزيع الميراث الشرعي',
        purpose: 'حدد جنس المتوفى وقيمة التركة وصلة قرابة الورثة، لتقوم الحاسبة بتوزيع الأنصبة الشرعية وتوضيح نصيب كل وارث بالدليل من القرآن والسنة.'
      },
      {
        id: 'kaffarat_calc',
        name: 'حاسبة الكفارات وفدية الصيام وزكاة الفطر',
        icon: 'fa-solid fa-receipt',
        visualType: 'card-button',
        iconColor: '#8b5cf6',
        label: 'كفارة اليمين • فدية الصيام • زكاة الفطر',
        purpose: 'لحساب قيمة كفارة اليمين وإطعام المساكين وفدية العاجز عن الصيام وزكاة الفطر حسب عدد أفراد الأسرة المقيدين.'
      },
      {
        id: 'fitr_udhiyah_calc',
        name: 'دليل وأحكام الأضحية والعقيقة وشروطها',
        icon: 'fa-solid fa-calculator',
        visualType: 'pill-button',
        iconColor: '#06b6d4',
        label: 'أحكام الأضحية والعقيقة',
        purpose: 'يوضح الشروط الشرعية لسن وأوصاف بهيمة الأنعام في الأضحية والعقيقة وأحكام توزيعها على الفقراء والأقارب.'
      }
    ]
  },

  // 20. الأربعون النووية
  {
    id: 'nawawi',
    pageName: 'الأربعون النووية',
    buttons: [
      {
        id: 'hadith_number_list',
        name: 'قائمة الأحاديث المرقمة (1 إلى 42)',
        icon: 'fa-solid fa-list-ol',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'الحديث الأول • الثاني • الثالث...',
        purpose: 'تصفح واختيار أي حديث من الأحاديث النبوية الجامعة للإمام النووي لقراءته والاستفادة من أنواره.'
      },
      {
        id: 'hadith_text_display',
        name: 'بطاقة متن الحديث النبوي المشكول',
        icon: 'fa-solid fa-book-quran',
        visualType: 'card-button',
        iconColor: '#3b82f6',
        label: 'نص الحديث الشريف كاملاً',
        purpose: 'عرض نص الحديث بضبط وتشكيل دقيقين مع ذكر الصحابي راوي الحديث ومخرجه من الشيخين.'
      },
      {
        id: 'hadith_explanation_btn',
        name: 'زر شرح الحديث ومعانيه وفوائده الفقهية',
        icon: 'fa-solid fa-book-open',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'شرح الحديث',
        purpose: 'يفتح الشرح المفصل لمعاني الكلمات النبوية، والفوائد الفقهية، والدروس التربوية والسلوكية المستفادة من الحديث.'
      },
      {
        id: 'hadith_copy_btn',
        name: 'زر نسخ ومشاركة الحديث الشريف',
        icon: 'fa-regular fa-copy',
        visualType: 'circle-button',
        iconColor: '#f59e0b',
        label: 'نسخ / مشاركة',
        purpose: 'نسخ نص الحديث الشريف مع شرحه لنشره وتذكير المسلمين بسنة نبيهم ﷺ.'
      },
      {
        id: 'hadith_search_input',
        name: 'شريط البحث في موضوعات الأحاديث النووية',
        icon: 'fa-solid fa-magnifying-glass',
        visualType: 'pill-button',
        iconColor: '#06b6d4',
        label: 'بحث في الأحاديث...',
        purpose: 'للبحث الفوري عن أي حديث أو راوٍ أو موضوع عقدي أو فقهي في متن الأربعين النووية.'
      }
    ]
  },

  // 21. التحكم الصوتي
  {
    id: 'voice-control',
    pageName: 'التحكم الصوتي',
    buttons: [
      {
        id: 'mic_toggle_btn',
        name: 'زر تشغيل الميكروفون والاستماع الصوتي',
        icon: 'fa-solid fa-microphone',
        visualType: 'circle-button',
        iconColor: '#ef4444',
        label: 'الميكروفون',
        purpose: 'يبدأ الاستماع لصوتك باللغة العربية الفصحى أو اللهجات لتلقي الأوامر والتنقل في التطبيق دون لمس الشاشة.'
      },
      {
        id: 'command_display_box',
        name: 'شاشة الأمر الصوتي المنطوق للتأكيد',
        icon: 'fa-solid fa-comment-dots',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'الأمر المسموع',
        purpose: 'تعرض الكلمات التي نطق بها لسانك للتأكد من فهم التطبيق للأمر قبل تنفيذه فوراً.'
      },
      {
        id: 'command_examples',
        name: 'بطاقات أمثلة الأوامر الصوتية المدعومة',
        icon: 'fa-solid fa-bullhorn',
        visualType: 'card-button',
        iconColor: '#3b82f6',
        label: 'افتح الأذكار • سورة الكهف • مواقيت الصلاة • الوضع الليلي...',
        purpose: 'تعرض قائمة الأوامر المتاحة التي يمكنك التحدث بها للتحكم بالقرآن وتغيير الثيمات والانتقال بين الصفحات.'
      },
      {
        id: 'voice_sound_feedback',
        name: 'مؤشر التفاعل الصوتي والتنفيذ',
        icon: 'fa-solid fa-volume-high',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'استجابة وتأكيد صوتي',
        purpose: 'يصدر نغمة تفاعلية لطيفة لتأكيد استلام وفهم الأمر وبدء تنفيذه على الشاشة.'
      }
    ]
  },

  // 22. أسماء الله الحسنى
  {
    id: 'asmaul-husna',
    pageName: 'أسماء الله الحسنى',
    buttons: [
      {
        id: 'name_cards_grid',
        name: 'شبكة بطاقات الأسماء الحسنى الـ 99',
        icon: 'fa-solid fa-star-and-crescent',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'الرحمن • الرحيم • الملك • القدوس • السلام...',
        purpose: 'عرض جميع أسماء الله الحسنى بتصميم إسلامي فخم مع إبراز كل اسم بالخط العربي الأصيل والمشكول بدقة.'
      },
      {
        id: 'name_detail_click',
        name: 'زر فتح الشرح والمعنى القرآني لكل اسم',
        icon: 'fa-solid fa-book-open',
        visualType: 'pill-button',
        iconColor: '#f59e0b',
        label: 'معنى ودلالة الاسم',
        purpose: 'اضغط على أي اسم لتفتح شاشته التي توضح معناه اللغوي والشرعي، شواهده من القرآن والسنة، وكيف نتعبد وندعو الله به.'
      },
      {
        id: 'search_name_input',
        name: 'شريط البحث في الأسماء الحسنى',
        icon: 'fa-solid fa-magnifying-glass',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'ابحث عن اسم من أسماء الله...',
        purpose: 'للوصول المباشر والسريع لأي اسم ترغب في معرفة معانيه وتفسيره وشواهده.'
      },
      {
        id: 'name_share_card',
        name: 'زر مشاركة بطاقة الاسم ومعانيه كصورة',
        icon: 'fa-solid fa-share-nodes',
        visualType: 'circle-button',
        iconColor: '#ec4899',
        label: 'مشاركة الاسم',
        purpose: 'ينشئ بطاقة مذهبة راقية باسم الله وشرحه لمشاركتها عبر الواتساب ومنصات التواصل.'
      }
    ]
  },

  // 23. السيرة والخط الزمني (مستقلة تماماً بدون أيقونات الجوانب)
  {
    id: 'prophetic-seerah',
    pageName: 'السيرة والخط الزمني',
    buttons: [
      {
        id: 'timeline_cards',
        name: 'بطاقات الخط الزمني لمحطات السيرة النبوية العطرة',
        icon: 'fa-solid fa-timeline',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'المولد الشريف • البعثة • الهجرة • الغزوات • حجة الوداع...',
        purpose: 'استعراض وقائع ومحطات حياة النبي ﷺ مرتبة بالترتيب الزمني التاريخي الدقيق من مولده الشريف وحتى وفاته ﷺ.'
      },
      {
        id: 'event_detail_btn',
        name: 'زر قراءة تفاصيل المحطة والدروس المستفادة والعبر',
        icon: 'fa-solid fa-book-open-reader',
        visualType: 'pill-button',
        iconColor: '#3b82f6',
        label: 'تفاصيل الحدث والعبر',
        purpose: 'اضغط على أي حدث تاريخي لعرض وقائعه بالتفصيل، وأسبابه، والدروس التربوية والإيمانية المستفادة منه في حياتنا المعاصرة.'
      },
      {
        id: 'seerah_standpoints_tab',
        name: 'تبويب مواقف نبوية خالدة',
        icon: 'fa-solid fa-scroll',
        visualType: 'pill-button',
        iconColor: '#f59e0b',
        label: 'مواقف خالدة',
        purpose: 'يعرض مواقف إنسانية وعظيمة في الرحمة والعدل والشجاعة والوفاء والحكمة والقيادة من حياة المصطفى ﷺ.'
      },
      {
        id: 'nasab_tab',
        name: 'تبويب شجرة النسب النبوي الشريف وأمهات المؤمنين',
        icon: 'fa-solid fa-tree',
        visualType: 'pill-button',
        iconColor: '#8b5cf6',
        label: 'النسب الشريف',
        purpose: 'استعراض شجرة نسب النبي ﷺ الطاهر، وأمهات المؤمنين رضي الله عنهن، وأولاده الكرام، وأهل بيته الأطهار.'
      },
      {
        id: 'seerah_search',
        name: 'شريط البحث في أحداث ووقائع السيرة النبوية',
        icon: 'fa-solid fa-magnifying-glass',
        visualType: 'pill-button',
        iconColor: '#06b6d4',
        label: 'ابحث في محطات السيرة...',
        purpose: 'للبحث الفوري عن أي غزوة، أو صحابي، أو معجزة، أو حادثة نبوية في الخط الزمني.'
      },
      {
        id: 'seerah_era_filter',
        name: 'فلاتر المراحل النبوية (العهد المكي • العهد المدني)',
        icon: 'fa-solid fa-filter',
        visualType: 'pill-button',
        iconColor: '#ec4899',
        label: 'المرحلة المكية • المرحلة المدنية',
        purpose: 'تصنيف وقائع السيرة إلى العهد المكي (الدعوة والصبر) والعهد المدني (بناء الدولة والغزوات الكبرى) لتسهيل الفهم.'
      },
      {
        id: 'seerah_share',
        name: 'زر مشاركة المحطة النبوية كبطاقة دعوية',
        icon: 'fa-solid fa-share-nodes',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'مشاركة السيرة',
        purpose: 'مشاركة ملخص المحطة النبوية والدروس المستفادة كبطاقة إيمانية لنشر سنة وسيرة الحبيب ﷺ.'
      }
    ]
  },

  // 24. أيقونة مجتمع التواصل السريعة (صفحة مستقلة بذاتها)
  {
    id: 'side-community',
    pageName: 'أيقونة مجتمع التواصل السريعة',
    buttons: [
      {
        id: 'seerah_side_community',
        name: 'أيقونة مجتمع التواصل السريعة (بالشاشة الرئيسية)',
        icon: 'fa-solid fa-comments',
        visualType: 'circle-button',
        iconColor: '#10b981',
        label: 'مجتمع التواصل',
        purpose: 'زر وصول سريع ومباشر لمجتمع التواصل القرآني بضغطة واحدة من الشاشة الرئيسية، يتيح لك الانتقال الفوري للدردشات الخاصة وغرف التلاوة الجماعية ومشاركة الفوائد الإيمانية مع إخوتك في الله دون المرور بأي قوائم فرعية.'
      },
      {
        id: 'side_community_badge',
        name: 'عداد ورقم الرسائل غير المقروءة (+99)',
        icon: 'fa-solid fa-bell',
        visualType: 'counter-button',
        iconColor: '#dc2626',
        label: 'إشعار +99',
        purpose: 'شارة حمراء بارزة أعلى الأيقونة تظهر لك عدد الرسائل الجديدة الواردة من الأصدقاء أو غرف التدارس لحظة بلحظة حتى لا يفوتك أي حديث أو تلاوة.'
      },
      {
        id: 'side_community_direct_access',
        name: 'ميزة الدخول الفوري السريع من أسفل الشاشة',
        icon: 'fa-solid fa-bolt',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'وصول مباشر',
        purpose: 'تم وضع هذا الزر بشكل استراتيجي بجانب زر السيرة في أسفل الشاشة ليكون في متناول إبهامك للوصول السريع حتى أثناء تصفح الواجهة الرئيسية للتطبيق.'
      }
    ]
  },

  // 25. أيقونة التواصل عبر الواتساب (صفحة مستقلة بذاتها)
  {
    id: 'side-whatsapp',
    pageName: 'أيقونة التواصل عبر الواتساب',
    buttons: [
      {
        id: 'seerah_side_whatsapp',
        name: 'أيقونة التواصل والدعم الفني عبر واتساب',
        icon: 'fa-brands fa-whatsapp',
        visualType: 'circle-button',
        iconColor: '#25D366',
        label: 'تواصل واتساب',
        purpose: 'زر اتصال مباشر بفريق تطوير ودعم تطبيق مصحف أحمد وليلى عبر تطبيق واتساب، يتيح لك إرسال الاستفسارات والملاحظات والاقتراحات لتطوير المصحف ومتابعة التحديثات.'
      },
      {
        id: 'whatsapp_support_feature',
        name: 'الدعم الفني والرد على الاستفسارات والملاحظات',
        icon: 'fa-solid fa-headset',
        visualType: 'card-button',
        iconColor: '#25D366',
        label: 'دعم فني فوري',
        purpose: 'إرسال أي مشكلة تقنية تواجهك في التطبيق أو استفسار بخصوص مواقيت الصلاة أو التلاوات لتحصل على حل وإرشاد سريع ومباشر من المطورين.'
      },
      {
        id: 'whatsapp_share_app',
        name: 'مشاركة ونشر التطبيق كصدقة جارية',
        icon: 'fa-solid fa-share-nodes',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'نشر وتكثير الأجر',
        purpose: 'مشاركة رابط التطبيق ومحتوياته الإيمانية مع جهات اتصالك ومجموعاتك على واتساب لتنال أجر كل من قرأ حرفاً أو سبّح أو صلى.'
      }
    ]
  },

  // 26. أيقونة التحكم الصوتي السريع (صفحة مستقلة بذاتها)
  {
    id: 'side-voice',
    pageName: 'أيقونة التحكم الصوتي السريع',
    buttons: [
      {
        id: 'seerah_side_voice',
        name: 'أيقونة الميكروفون السريع (بالشاشة الرئيسية)',
        icon: 'fa-solid fa-microphone',
        visualType: 'circle-button',
        iconColor: '#ef4444',
        label: 'التحكم الصوتي',
        purpose: 'زر تفعيل وإلغاء الاستماع الصوتي الفوري بنقرة واحدة من أسفل الشاشة الرئيسية دون الحاجة لدخول صفحة التحكم الصوتي.'
      },
      {
        id: 'voice_quick_listen',
        name: 'ميزة الاستماع للأوامر الفورية بضغطة واحدة',
        icon: 'fa-solid fa-ear-listen',
        visualType: 'pill-button',
        iconColor: '#10b981',
        label: 'استماع فوري',
        purpose: 'بمجرد الضغط على الأيقونة تبدأ الدائرة بالنبض وتستمع لصوتك؛ يمكنك قول: "سورة الكهف"، "مواقيت الصلاة"، "شغل التلاوة"، "الوضع الليلي"، أو "أذكار الصباح" ليفتحها التطبيق فوراً.'
      },
      {
        id: 'voice_hands_free',
        name: 'التحكم بالقرآن والتطبيق بدون لمس الشاشة (Hands-Free)',
        icon: 'fa-solid fa-hands-holding',
        visualType: 'card-button',
        iconColor: '#3b82f6',
        label: 'تحكم بلا لمس',
        purpose: 'مفيد جداً أثناء القيادة، أو الانشغال بالعمل، أو لكبار السن وضعاف البصر للتنقل في أرجاء المصحف والتطبيق عبر التحدث فقط.'
      }
    ]
  },

  // 27. أيقونة أهل القرآن ولوحة المتصدرين (صفحة مستقلة بذاتها)
  {
    id: 'side-ahl-al-quran',
    pageName: 'أيقونة أهل القرآن ولوحة المتصدرين',
    buttons: [
      {
        id: 'seerah_side_ahl_al_quran',
        name: 'أيقونة لوحة شرف أهل القرآن (بالشاشة الرئيسية)',
        icon: 'fa-solid fa-trophy',
        visualType: 'circle-button',
        iconColor: '#f59e0b',
        label: 'لوحة المتصدرين',
        purpose: 'زر وصول سريع للوحة شرف أهل القرآن الكريم، يعرض ترتيبك الفعلي بين جميع قراء وحفظة كتاب الله المتنافسين في الختمات والتلاوة اليومية.'
      },
      {
        id: 'rank_badge_display',
        name: 'شارة الترتيب الشخصي المتغير (#1, #2, ...)',
        icon: 'fa-solid fa-medal',
        visualType: 'counter-button',
        iconColor: '#f59e0b',
        label: 'شارة المركز الحالي',
        purpose: 'شارة مذهبة ملونة تعلو الكأس توضح ترتيبك بين المتصدرين؛ فإذا كنت بالمركز الأول تظهر (#1) باللون الذهبي البراق لتحفيزك على مواصلة القراءة وعدم هجر المصحف.'
      },
      {
        id: 'quick_points_sync',
        name: 'تسجيل صفحات القراءة التلقائي والتنافس',
        icon: 'fa-solid fa-chart-simple',
        visualType: 'card-button',
        iconColor: '#10b981',
        label: 'نقاط التلاوة التلقائية',
        purpose: 'كل صفحة تقرؤها في المصحف تسجل لك نقاطاً تلقائياً وتزيد رصيدك في لوحة المتصدرين شهرياً وتراكمياً.'
      }
    ]
  }
];

export const getPageButtonsGuide = (pageId: string): PageButtonsGuide | undefined => {
  return PAGES_BUTTONS_GUIDE.find(p => p.id === pageId);
};
