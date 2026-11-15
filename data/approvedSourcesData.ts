export type ApprovedSourcePageId =
  | 'quran'
  | 'tafseer'
  | 'listen-memorization'
  | 'nawawi'
  | 'hisn-muslim'
  | 'daily-adhkar'
  | 'adia'
  | 'ruqyah'
  | 'prayer-times'
  | 'qibla'
  | 'calendar'
  | 'calculators'
  | 'habit-tracker'
  | 'seerah'
  | 'miracles'
  | 'asmaul-husna'
  | 'ten-promised'
  | 'wisdom'
  | 'hajj-umrah'
  | 'history-sites'
  | 'voice-search-tech';

export interface ApprovedSourceItem {
  id: string;
  titleAr: string;
  titleEn: string;
  authorOrOrgAr?: string;
  authorOrOrgEn?: string;
  detailAr: string;
  detailEn: string;
}

export type ApprovedSourceIconName =
  | 'BookOpen'
  | 'LibraryBig'
  | 'Headphones'
  | 'ScrollText'
  | 'Shield'
  | 'ShieldPlus'
  | 'Sparkles'
  | 'HeartHandshake'
  | 'Clock'
  | 'Compass'
  | 'Calendar'
  | 'Scale'
  | 'ListChecks'
  | 'Landmark'
  | 'Star'
  | 'Award'
  | 'Users'
  | 'Quote'
  | 'MapPin'
  | 'Globe'
  | 'Mic';

export interface ApprovedSourcePage {
  id: ApprovedSourcePageId;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  iconName: ApprovedSourceIconName;
  items: ApprovedSourceItem[];
}

export const APPROVED_SOURCES_PAGES: ApprovedSourcePage[] = [
  {
    id: 'quran',
    titleAr: 'القرآن الكريم وعلومه',
    titleEn: 'The Noble Qur\'an & Its Sciences',
    subtitleAr: 'الرسم العثماني، الوقف، المتشابهات، أسباب النزول، الإعراب، الفهرس الموضوعي والترجمة',
    subtitleEn: 'Uthmani script, Waqf, Mutashabihat, Asbab al-Nuzul, I\'rab, thematic index & translation',
    iconName: 'BookOpen',
    items: [
      {
        id: 'quran-uthmani',
        titleAr: 'النص القرآني بالرسم العثماني (رواية حفص عن عاصم)',
        titleEn: 'Uthmani Script Text (Hafs \'an \'Asim Narration)',
        authorOrOrgAr: 'قاعدة بيانات المصحف العثماني المدمجة وبيانات مصحف المدينة المنورة',
        authorOrOrgEn: 'Bundled Uthmani Qur\'an Corpus & Madinah Mushaf Metadata',
        detailAr:
          'المصحف الشريف كاملاً (114 سورة، 6236 آية) بالرسم العثماني المضبوط برواية حفص عن عاصم، مع الفهرسة الدقيقة للصفحات الـ 604 والأجزاء الـ 30 والأحزاب الـ 60 والأرباع الـ 240 ومواضع السجدات الـ 15 للعمل دون اتصال بالإنترنت.',
        detailEn:
          'Complete 114 Surahs (6,236 Ayahs) in verified Uthmani script (Hafs \'an \'Asim) with offline indexing for 604 Mushaf pages, 30 Juz, 60 Hizb, 240 quarters, and the 15 Sajdah positions.',
      },
      {
        id: 'quran-en-saheeh',
        titleAr: 'الترجمة الإنجليزية لمعاني القرآن الكريم',
        titleEn: 'Verified English Translation of the Qur\'an',
        authorOrOrgAr: 'ترجمة صحيح إنترناشيونال (Saheeh International)',
        authorOrOrgEn: 'Saheeh International Translation',
        detailAr:
          'النص الإنجليزي الكامل لمعاني جميع آيات القرآن الكريم (114 سورة) المدمج محلياً داخل التطبيق لعرض القراءة ثنائية اللغة أو وضع الترجمة الإنجليزية والتدبر.',
        detailEn:
          'Complete offline-bundled English meaning translation for all 114 Surahs powering bilingual reading, English-only translation mode, and study modals.',
      },
      {
        id: 'quran-meanings-muyassar',
        titleAr: 'معاني الكلمات والآيات المدمجة محلياً',
        titleEn: 'Offline Ayah & Word Meanings',
        authorOrOrgAr: 'التفسير الميسر — مجمع الملك فهد لطباعة المصحف الشريف',
        authorOrOrgEn: 'Al-Tafseer Al-Muyassar (King Fahd Glorious Qur\'an Printing Complex)',
        detailAr:
          'عرض معاني الآيات والكلمات القرآنية فوراً دون الحاجة للإنترنت في قارئ المصحف وإستوديو التحفيظ بالاعتماد على النسخة المدمجة من التفسير الميسر.',
        detailEn:
          'Instant offline verse and word meanings in the Qur\'an reader and memorization preview powered by the bundled Al-Muyassar dataset.',
      },
      {
        id: 'quran-waqf',
        titleAr: 'دليل علامات الوقف والابتداء',
        titleEn: 'Qur\'anic Pause & Initiation Marks (Waqf & Ibtida)',
        authorOrOrgAr: 'ضوابط مصحف المدينة النبوية وعلم الوقف والابتداء',
        authorOrOrgEn: 'Madinah Mushaf Notation & Classical Rules of Waqf',
        detailAr:
          'توثيق أحكام علامات الوقف الست المعتمدة في المصحف (مـ الوقف اللازم، لا النهي عن الوقف، ج الجائز المستوي، صلى الوصل أولى، قلى الوقف أولى، ∴ تعانق الوقف) مع أثرها الدلالي وأمثلتها القرآنية المباشرة.',
        detailEn:
          'Detailed rules for the six Madinah Mushaf pause marks (مـ, لا, ج, صلى, قلى, ∴), their impact on meaning, and direct verse examples.',
      },
      {
        id: 'quran-mutashabihat',
        titleAr: 'المتشابهات اللفظية والفروق البيانية',
        titleEn: 'Verbal Similarities (Mutashabihat) & Rhetorical Nuances',
        authorOrOrgAr: 'درة التنزيل وغرة التأويل للخطيب الإسكافي وملاك التأويل لابن الزبير الغرناطي',
        authorOrOrgEn: 'Durrat al-Tanzil (Al-Khatib al-Iskafi) & Malak al-Ta\'wil (Ibn al-Zubayr al-Gharnati)',
        detailAr:
          'رصد ومقارنة الآيات المتشابهة لفظياً عبر السور واستخراج الفروق السياقية واللغوية والبلاغية بالاستناد إلى أمهات كتب المتشابهات التراثية المعتمدة.',
        detailEn:
          'Cross-Surah comparison of verbally similar verses with contextual and rhetorical explanations grounded in classical Mutashabihat treatises.',
      },
      {
        id: 'quran-asbab-nuzul',
        titleAr: 'أسباب النزول لكافة سور القرآن الكريم (114 سورة)',
        titleEn: 'Occasions of Revelation (Asbab Al-Nuzul) Across All 114 Surahs',
        authorOrOrgAr: 'الواحدي (أسباب النزول)، السيوطي (لباب النقول)، الطبري، ابن كثير، القرطبي، البغوي، السعدي، والصحيحان والسنن',
        authorOrOrgEn: 'Al-Wahidi, Al-Suyuti (Lubab al-Nuqul), Al-Tabari, Ibn Kathir, Al-Qurtubi, Al-Baghawi, Al-Sa\'di & Primary Hadith Books',
        detailAr:
          'توثيق أسباب النزول والروايات التاريخية للآيات في جميع السور بالرجوع إلى صحيح البخاري وصحيح مسلم وسنن أبي داود والترمذي والنسائي وابن ماجه ومسند أحمد ومستدرك الحاكم، مع كتب التفسير بالمأثور.',
        detailEn:
          'Authenticated occasions of revelation across all 114 Surahs sourced from Al-Wahidi, Al-Suyuti, classical Tafsirs, Sahihayn, the Four Sunan, Musnad Ahmad, and Mustadrak al-Hakim.',
      },
      {
        id: 'quran-surah-stories',
        titleAr: 'موسوعة قصص السور وبطاقات التعريف بالسور الـ 114',
        titleEn: 'Surah Stories Encyclopedia & 114 Surah Profiles',
        authorOrOrgAr: 'ابن كثير، الطبري، القرطبي، البغوي، الشنقيطي، السعدي، والفضائل الثابتة في السنة',
        authorOrOrgEn: 'Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Baghawi, Al-Shanqiti, Al-Sa\'di & Authenticated Virtues',
        detailAr:
          'موسوعة شاملة لقصص السور، وجه التسمية، المكي والمدني، ترتيب النزول، المقاصد التربوية، والفضائل النبوية الثابتة لكل سورة من سور المصحف الشريف.',
        detailEn:
          'Comprehensive encyclopedia of Surah narratives, naming reasons, Makki/Madani classification, revelation order, core objectives, and authenticated Prophetic virtues.',
      },
      {
        id: 'quran-irab-thematic',
        titleAr: 'إعراب القرآن الكريم والفهرس الموضوعي الشامل',
        titleEn: 'Qur\'anic Syntax (I\'rab) & Thematic Encyclopedia',
        authorOrOrgAr: 'قواعد النحو العربي والبيان والمفاهيم القرآنية المصنفة',
        authorOrOrgEn: 'Classical Arabic Grammar, Balaghah & Thematic Subject Index',
        detailAr:
          'تحليل نحوي وصرفي للكلمات والتراكيب القرآنية، مع فهرس موضوعي يصنف الآيات تحت محاور العقيدة والتوحيد، العبادات، الأخلاق، القصص، والتشريعات والمعاملات.',
        detailEn:
          'Grammatical and syntactic analysis of verses alongside a curated thematic encyclopedia covering Aqeedah, worship, ethics, stories, and Islamic legislation.',
      },
      {
        id: 'quran-typography',
        titleAr: 'الخطوط القرآنية والعربية المعتمدة',
        titleEn: 'Approved Qur\'anic & Arabic Fonts',
        authorOrOrgAr: 'مجموعات خطوط المصحف المفتوحة عالية الوضوح',
        authorOrOrgEn: 'High-Legibility Open-Source Arabic & Qur\'anic Typefaces',
        detailAr:
          'تضمين خطوط عربية وقرآنية مضبوطة التشكيل داخل القارئ (Amiri Quran، Amiri، Scheherazade New، Noto Naskh Arabic، Lateef، Reem Kufi، Aref Ruqaa، Cairo، وEl Messiri).',
        detailEn:
          'Bundled diacritic-accurate Arabic and Mushaf typefaces including Amiri Quran, Amiri, Scheherazade New, Noto Naskh Arabic, Lateef, Reem Kufi, Aref Ruqaa, Cairo, and El Messiri.',
      },
    ],
  },
  {
    id: 'tafseer',
    titleAr: 'التفاسير المعتمدة',
    titleEn: 'Approved Tafseers',
    subtitleAr: 'الجلالين، الميسر، البغوي، القرطبي، الوسيط، ابن كثير، معارف القرآن، وتذكير القرآن',
    subtitleEn: 'Al-Jalalayn, Al-Muyassar, Al-Baghawi, Al-Qurtubi, Al-Waseet, Ibn Kathir, Ma\'arif & Tazkirul',
    iconName: 'LibraryBig',
    items: [
      {
        id: 'tafseer-jalalayn',
        titleAr: 'تفسير الجلالين (مدمج محلياً للعمل دون إنترنت)',
        titleEn: 'Tafseer Al-Jalalayn (Offline Bundled & Cloud)',
        authorOrOrgAr: 'الإمام جلال الدين المحلي والإمام جلال الدين السيوطي رحمهما الله',
        authorOrOrgEn: 'Imam Jalal ad-Din al-Mahalli & Imam Jalal ad-Din as-Suyuti',
        detailAr:
          'نسخة كاملة مدمجة داخل ملفات التطبيق للرجوع الفوري إلى التفسير دون إنترنت في وضع القراءة العمودي والأفقي، مع إمكانية التحديث عبر AlQuran Cloud.',
        detailEn:
          'Fully bundled inside app assets for instant offline verse commentary in all reading layouts, alongside cloud sync via AlQuran Cloud.',
      },
      {
        id: 'tafseer-muyassar',
        titleAr: 'التفسير الميسر',
        titleEn: 'Al-Tafseer Al-Muyassar',
        authorOrOrgAr: 'نخبة من العلماء بإشراف مجمع الملك فهد لطباعة المصحف الشريف',
        authorOrOrgEn: 'Scholars of King Fahd Glorious Qur\'an Printing Complex',
        detailAr:
          'تفسير واضح العبارة سليم المنهج متاح محلياً في قاعدة المعاني المدمجة وعبر واجهة AlQuran Cloud API مع قابلية التحميل المسبق للسور والأجزاء.',
        detailEn:
          'Concise, accessible commentary aligned with Salaf methodology, available offline and through AlQuran Cloud API with Surah/Juz download support.',
      },
      {
        id: 'tafseer-baghawi',
        titleAr: 'تفسير البغوي (معالم التنزيل)',
        titleEn: 'Tafseer Al-Baghawi (Ma\'alim al-Tanzil)',
        authorOrOrgAr: 'الإمام محيي السنة أبو محمد الحسين بن مسعود البغوي',
        authorOrOrgEn: 'Imam Abu Muhammad al-Husayn ibn Mas\'ud al-Baghawi',
        detailAr:
          'أحد أمهات كتب التفسير بالمأثور المعتمدة في تفسير القرآن بالقرآن والسنة وأقوال الصحابة والتابعين، يُجلب ويُخزّن محلياً عبر AlQuran Cloud API.',
        detailEn:
          'Renowned narration-based classical Tafseer explaining the Qur\'an through authentic Hadiths and early generations\' reports via AlQuran Cloud API.',
      },
      {
        id: 'tafseer-qurtubi',
        titleAr: 'تفسير القرطبي (الجامع لأحكام القرآن)',
        titleEn: 'Tafseer Al-Qurtubi (Al-Jami\' li-Ahkam al-Qur\'an)',
        authorOrOrgAr: 'الإمام أبو عبد الله محمد بن أحمد الأنصاري القرطبي',
        authorOrOrgEn: 'Imam Abu Abdullah Muhammad ibn Ahmad al-Qurtubi',
        detailAr:
          'المرجع الموسوعي في استنباط الأحكام الفقهية، القراءات، اللغة والإعراب، وأسباب النزول، متاح للقراءة والتحميل المسبق عبر AlQuran Cloud API.',
        detailEn:
          'Encyclopedic exegesis renowned for juristic rulings, linguistic precision, Qira\'at, and causes of revelation via AlQuran Cloud API.',
      },
      {
        id: 'tafseer-waseet',
        titleAr: 'التفسير الوسيط للقرآن الكريم',
        titleEn: 'Al-Tafseer Al-Waseet',
        authorOrOrgAr: 'فضيلة الشيخ الأستاذ الدكتور محمد سيد طنطاوي رحمه الله',
        authorOrOrgEn: 'Prof. Dr. Muhammad Sayyid Tantawi',
        detailAr:
          'تفسير تحليلي معاصر يجمع بين البيان اللغوي الدقيق واستخلاص الدروس التربوية والهدايات القرآنية عبر AlQuran Cloud API.',
        detailEn:
          'Contemporary analytical commentary bridging Arabic rhetorical insight with practical moral guidance via AlQuran Cloud API.',
      },
      {
        id: 'tafseer-en-ibn-kathir',
        titleAr: 'مختصر تفسير ابن كثير (بالإنجليزية)',
        titleEn: 'Tafsir Ibn Kathir (Abridged — English Edition)',
        authorOrOrgAr: 'الحافظ عماد الدين إسماعيل بن كثير (النسخة الإنجليزية عبر QuranCDN / Quran.com)',
        authorOrOrgEn: 'Hafiz Ibn Kathir — via QuranCDN & Quran.com API v4',
        detailAr:
          'أحد أشهر التفاسير الإنجليزية المعتمدة في نافذة التفسير الإنجليزي والتدبر، يُجلب من واجهة QuranCDN مع خادم Quran.com الاحتياطي.',
        detailEn:
          'Primary English Tafseer edition in the English Commentary view, delivered via QuranCDN API with Quran.com API v4 fallback.',
      },
      {
        id: 'tafseer-en-maarif-tazkirul',
        titleAr: 'معارف القرآن وتذكير القرآن (بالإنجليزية)',
        titleEn: 'Ma\'arif al-Qur\'an & Tazkirul Quran (English Editions)',
        authorOrOrgAr: 'المفتي محمد شفيع العثماني والشيخ وحيد الدين خان (عبر QuranCDN / Quran.com)',
        authorOrOrgEn: 'Mufti Muhammad Shafi & Maulana Wahiduddin Khan via QuranCDN / Quran.com',
        detailAr:
          'تفسيران معتمدان بالإنجليزية يقدمان الفوائد الفقهية والروحية والدلالية للناطقين بالإنجليزية في نافذة التفسير الإنجليزي.',
        detailEn:
          'Additional verified English commentary editions offering spiritual, juristic, and thematic reflections inside the English Tafseer modal.',
      },
    ],
  },
  {
    id: 'listen-memorization',
    titleAr: 'الاستماع والتحفيظ والورد',
    titleEn: 'Listen, Memorization & Wird',
    subtitleAr: 'منصات التلاوة الصوتية، قراء السور والآيات، خطط الورد والتحفيظ، والتسميع',
    subtitleEn: 'Audio recitation CDNs, multi-riwayah Qaris, Wird plans & speech memorization studio',
    iconName: 'Headphones',
    items: [
      {
        id: 'audio-mp3quran',
        titleAr: 'بوابة تلاوات السور الكاملة وتعدد الروايات',
        titleEn: 'Full-Surah Recitations & Multi-Riwayah Qari Directory',
        authorOrOrgAr: 'بوابة MP3Quran.net (API v3 والخوادم الصوتية الرسمية)',
        authorOrOrgEn: 'MP3Quran.net (API v3 & Official Audio Servers)',
        detailAr:
          'تزويد صفحة «الاستماع للقرآن» بقوائم مئات القراء وخرائط السور المتاحة لكل قارئ وتلاوات السور الكاملة بروايات متعددة (حفص، ورش، قالون، شعبة، الدوري وغيرها) مع إمكانية التحميل والتشغيل في الخلفية.',
        detailEn:
          'Powers the Listen to Qur\'an directory with live Qari listings, partial-reciter mappings, and full-Surah audio across multiple Riwayat with background playback.',
      },
      {
        id: 'audio-everyayah',
        titleAr: 'تلاوات الآيات المرتلة والمجودة والمعلمة والترجمة الصوتية',
        titleEn: 'Ayah-by-Ayah Murattal, Mujawwad, Teacher & English Audio',
        authorOrOrgAr: 'منصة EveryAyah.com',
        authorOrOrgEn: 'EveryAyah.com Audio Platform',
        detailAr:
          'بث وتحميل تلاوات الآيات المفردة لمشاهير القراء في المصحف قراءةً وتحفيظاً (بما فيها مصحف الحصري والمنشاوي المعلم)، إضافة إلى التلاوة الإنجليزية بصوت عبد الله بصفر وإبراهيم والك.',
        detailEn:
          'Streams and caches individual Ayah recitations (Murattal, Mujawwad, Al-Husary/Al-Minshawy Teacher editions) plus English translation audio by Basfar and Ibrahim Walk.',
      },
      {
        id: 'audio-islamic-network',
        titleAr: 'شبكة Islamic Network CDN للآيات والمشاركة',
        titleEn: 'Islamic Network Audio CDN',
        authorOrOrgAr: 'شبكة AlQuran Cloud / cdn.islamic.network',
        authorOrOrgEn: 'AlQuran Cloud / cdn.islamic.network',
        detailAr:
          'مصدر صوتي احتياطي ومكمل لتلاوات الآيات القرآنية ومقاطع بطاقات مشاركة الآيات المصممة.',
        detailEn:
          'Secondary fallback audio CDN ensuring uninterrupted Ayah playback and media generation in Share Ayah Cards.',
      },
      {
        id: 'wird-memorization-layout',
        titleAr: 'هيكلة مصحف المدينة لخطط الورد اليومي والتحفيظ',
        titleEn: 'Madinah Mushaf Boundary Mapping for Daily Wird & Memorization',
        authorOrOrgAr: 'ضوابط الترقيم القياسي لمصحف المدينة (604 صفحات / 30 جزءاً / 240 ربعاً)',
        authorOrOrgEn: 'Standard Madinah Mushaf Grid (604 Pages / 30 Juz / 240 Quarters)',
        detailAr:
          'توليد الجداول اليومية للختمات وخطط الحفظ والمراجعة والاختبارات التفاعلية بدقة متطابقة مع بداية كل جزء وحزب وربع وصفحة.',
        detailEn:
          'Generates daily Khatmah Wird allocations, memorization targets, and quiz sessions aligned exactly with Mushaf pages and Hizb quarters.',
      },
      {
        id: 'memorization-stt',
        titleAr: 'محرك التسميع الصوتي وتقييم الحفظ',
        titleEn: 'Speech Recitation Verification Engine',
        authorOrOrgAr: 'خوارزمية التطبيع القرآني والتعرف الصوتي على الجهاز',
        authorOrOrgEn: 'Arabic Script Normalization & Device Speech Recognition',
        detailAr:
          'مقارنة تلاوة المستخدم الصوتية بالنص القرآني بعد تطبيع الهمزات والتشكيل في إستوديو التحفيظ لرصد الأخطاء والتنبيه اللحظي.',
        detailEn:
          'Compares spoken recitation against Qur\'anic text using diacritic-normalized Arabic matching in Memorization Studio.',
      },
    ],
  },
  {
    id: 'nawawi',
    titleAr: 'الأربعون النووية',
    titleEn: 'An-Nawawi\'s Forty Hadith',
    subtitleAr: 'متن الـ 42 حديثاً، التخريج من الدواوين السبعة، الشروح التحليلية، والتلاوة الصوتية',
    subtitleEn: '42-Hadith text, seven-book Takhrij, structured commentaries & audio archive',
    iconName: 'ScrollText',
    items: [
      {
        id: 'nawawi-matn',
        titleAr: 'متن الأربعين النووية كاملاً مع التتمة (42 حديثاً)',
        titleEn: 'Complete Text of An-Nawawi\'s Forty Hadith (42 Hadiths)',
        authorOrOrgAr: 'الإمام محيي الدين أبو زكريا يحيى بن شرف النووي (ت 676 هـ) وتتمة الحافظ ابن رجب',
        authorOrOrgEn: 'Imam Yahya ibn Sharaf al-Nawawi & Ibn Rajab\'s Completion',
        detailAr:
          'النص العربي الكامل للأحاديث الـ 42 بالتشكيل المضبوط مع الترجمة الإنجليزية الكاملة لكل حديث وراوٍ.',
        detailEn:
          'Complete vocalized Arabic texts of all 42 foundational Hadiths paired with accurate English translations.',
      },
      {
        id: 'nawawi-takhrij',
        titleAr: 'التخريج الحديثي من دواوين السنة المعتمدة',
        titleEn: 'Authenticated Hadith Takhrij & Grading',
        authorOrOrgAr: 'صحيح البخاري، صحيح مسلم، سنن أبي داود، جامع الترمذي، سنن النسائي، سنن ابن ماجه، ومسند أحمد',
        authorOrOrgEn: 'Sahih al-Bukhari, Sahih Muslim, The Four Sunan & Musnad Ahmad',
        detailAr:
          'توثيق مخرج كل حديث بدقة في الصحيحين أو السنن الأربعة أو المسانيد مع ذكر روايات الحاكم والذهبي وتنبيهات الدرجة الحديثية.',
        detailEn:
          'Attributes every Hadith to the Two Sahihs, Abu Dawud, al-Tirmidhi, al-Nasa\'i, Ibn Majah, and Musnad Ahmad alongside classical scholarly notes.',
      },
      {
        id: 'nawawi-commentaries',
        titleAr: 'الشروح التحليلية للأحاديث (عقيدة، فقه، سلوك)',
        titleEn: 'Structured Analytical Commentaries',
        authorOrOrgAr: 'مستمدة من شروح ابن دقيق العيد، وابن رجب الحنبلي (جامع العلوم والحكم)، والشيخ ابن عثيمين، والأذكار للنووي',
        authorOrOrgEn: 'Drawn from Ibn Daqiq al-\'Id, Ibn Rajab (Jami\' al-\'Ulum), Ibn Uthaymeen & Al-Nawawi',
        detailAr:
          'تحليل كل حديث باللغتين العربية والإنجليزية في أربعة محاور واضحة: الخلاصة الجامعة، الفوائد العقدية، الأحكام الفقهية، والقيم التربوية والأخلاقية.',
        detailEn:
          'Structured bilingual breakdown for each Hadith covering general summary, Aqeedah insights, Fiqh rulings, and ethical takeaways.',
      },
      {
        id: 'nawawi-audio-archive',
        titleAr: 'المكتبة الصوتية لقراءة متن الأربعين النووية',
        titleEn: 'Forty Hadith Audio Narration Stream',
        authorOrOrgAr: 'أرشيف التلاوة المسموعة Archive.org (an-nawawi-40-hadith) والنطق الآلي',
        authorOrOrgEn: 'Archive.org Audio Collection & Device TTS Fallback',
        detailAr:
          'تشغيل المقاطع الصوتية العربية المخصصة لكل حديث من الـ 42 حديثاً مع محرك النطق المدمج عند العرض باللغة الإنجليزية.',
        detailEn:
          'Streams dedicated Arabic audio recordings for all 42 Hadiths with automatic TTS support in English mode.',
      },
    ],
  },
  {
    id: 'hisn-muslim',
    titleAr: 'حصن المسلم',
    titleEn: 'Hisn Al-Muslim',
    subtitleAr: 'أذكار الكتاب والسنة المصنفة مع التخريج والترجمة الإنجليزية',
    subtitleEn: 'Categorized Qur\'an & Sunnah supplications with Takhrij & English translations',
    iconName: 'Shield',
    items: [
      {
        id: 'hisn-qahtani',
        titleAr: 'متن كتاب حصن المسلم من أذكار الكتاب والسنة كاملاً',
        titleEn: 'Complete Text of Hisn Al-Muslim (Fortress of the Muslim)',
        authorOrOrgAr: 'فضيلة الشيخ الدكتور سعيد بن علي بن وهف القحطاني رحمه الله',
        authorOrOrgEn: 'Dr. Sa\'id ibn Ali ibn Wahf Al-Qahtani',
        detailAr:
          'كامل أبواب الأذكار اليومية المصنفة حسب الأحوال والمواضع (الاستيقاظ، اللباس، الخلاء، الوضوء، المسجد، الكرب، السفر، المرض، الطعام، السلام وغيرها) مع أعداد التكرار والفضائل.',
        detailEn:
          'All categorized daily chapters covering waking, dressing, ablution, prayer, travel, distress, illness, and social etiquette with prescribed counts.',
      },
      {
        id: 'hisn-hadith-sources',
        titleAr: 'أصول التخريج الحديثي في الكتاب',
        titleEn: 'Primary Hadith Sources Referenced in Hisn Al-Muslim',
        authorOrOrgAr: 'الصحيحان، السنن الأربعة، مسند أحمد، موطأ مالك، مستدرك الحاكم، ابن حبان، وابن السني',
        authorOrOrgEn: 'Sahihayn, The Four Sunan, Musnad Ahmad, Muwatta Malik, Al-Hakim, Ibn Hibban & Ibn al-Sunni',
        detailAr:
          'التزام العزو الدقيق لكل ذكر ودعاء إلى مصادره الحديثية الأصلية وتحقيقات أهل العلم بالصحة والحسن.',
        detailEn:
          'Each supplication is grounded in the primary Hadith attributions documented by the author and classical Hadith scholars.',
      },
      {
        id: 'hisn-dataset-en',
        titleAr: 'قاعدة البيانات المهيكلة والترجمة الإنجليزية الكاملة',
        titleEn: 'Structured Dataset & Complete English Rendering',
        authorOrOrgAr: 'بيانات @kazishariar/hisnul-muslim-data والترجمة الإنجليزية الموثقة',
        authorOrOrgEn: '@kazishariar/hisnul-muslim-data & Verified English Translations',
        detailAr:
          'فهرسة رقمية منظمة لجميع أبواب الكتاب وأذكاره مع الترجمة الإنجليزية الدقيقة لعناوين الأبواب ومتون الأذكار.',
        detailEn:
          'Structured chapter and dhikr indexing paired with complete English translations across the entire book.',
      },
    ],
  },
  {
    id: 'daily-adhkar',
    titleAr: 'الأذكار اليومية والتسبيح',
    titleEn: 'Daily Adhkar & Tasbeeh',
    subtitleAr: 'أوراد الصباح والمساء، أذكار دبر الصلوات المكتوبة، وصيغ التسبيح',
    subtitleEn: 'Morning & evening remembrances, post-Salah Adhkar & Tasbeeh formulas',
    iconName: 'Sparkles',
    items: [
      {
        id: 'adhkar-sabah-masaa',
        titleAr: 'أذكار الصباح والمساء والنوم والاستيقاظ',
        titleEn: 'Morning, Evening, Sleep & Waking Adhkar',
        authorOrOrgAr: 'القرآن الكريم، الصحيحان (البخاري ومسلم)، السنن الأربعة، مسند أحمد، وحصن المسلم',
        authorOrOrgEn: 'Qur\'an, Sahihayn, The Four Sunan, Musnad Ahmad & Hisn Al-Muslim',
        detailAr:
          'آية الكرسي والمعوذات وخواتيم البقرة، وسيد الاستغفار، وأذكار التحصين والتوكل بالصيغ الصحيحة الثابتة وأعداد التكرار والفضائل المروية باللغتين.',
        detailEn:
          'Ayat al-Kursi, Al-Mu\'awwidhat, Sayyid al-Istighfar, and authenticated protection remembrances with their Hadith virtues and repetition counts.',
      },
      {
        id: 'adhkar-salah',
        titleAr: 'أذكار ما بعد الصلوات المفروضة الخمس',
        titleEn: 'Post-Prayer (Dabr al-Salah) Remembrances',
        authorOrOrgAr: 'صحيح مسلم، صحيح البخاري، سنن أبي داود، النسائي، الترمذي، وابن ماجه',
        authorOrOrgEn: 'Sahih Muslim, Sahih al-Bukhari, Abu Dawud, al-Nasa\'i, al-Tirmidhi & Ibn Majah',
        detailAr:
          'الاستغفار ثلاثاً، «اللهم أنت السلام...»، التهليلات المأثورة، التسبيح والتحميد والتكبير 33 مرة وتمام المائة، آية الكرسي والمعوذات، وما يُختص به بعد الفجر والمغرب (الاستعاذة من النار سبعاً وسؤال العلم النافع).',
        detailEn:
          'Istighfar, Allahumma Anta as-Salam, authenticated Tahlil formulas, 33x Tasbeeh/Tahmeed/Takbeer, Ayat al-Kursi, and Fajr/Maghrib special supplications.',
      },
      {
        id: 'adhkar-tasbeeh',
        titleAr: 'صفحة المسبحة الإلكترونية وصيغ التسبيح المأثورة',
        titleEn: 'Digital Tasbeeh Formulas & Dhikr Statistics',
        authorOrOrgAr: 'الباقيات الصالحات والأذكار المضاعفة الثابتة في الصحيحين والسنن',
        authorOrOrgEn: 'Authenticated Sunnah Glorification & Multiplier Formulas',
        detailAr:
          'صيغ التسبيح والتحميد والتهليل والتكبير والحوقلة والاستغفار والصلاة الإبراهيمية و«سبحان الله وبحمده عدد خلقه...»، مع حفظ العداد التراكمي والرسوم البيانية الأسبوعية.',
        detailEn:
          'Includes Subhan Allah, Alhamdulillah, La ilaha illallah, Allahu Akbar, Hawqalah, Istighfar, and Prophetic multiplier formulas with daily/weekly analytics.',
      },
    ],
  },
  {
    id: 'adia',
    titleAr: 'الأدعية المأثورة',
    titleEn: 'Qur\'anic & Prophetic Supplications',
    subtitleAr: 'الأدعية القرآنية بأرقام الآيات وجوامع الدعاء النبوي المصنفة',
    subtitleEn: 'Qur\'anic Du\'as by verse reference & categorized Prophetic supplications',
    iconName: 'HeartHandshake',
    items: [
      {
        id: 'adia-quranic',
        titleAr: 'الأدعية القرآنية المباشرة وأدعية الأنبياء',
        titleEn: 'Direct Qur\'anic Prayers & Supplications of the Prophets',
        authorOrOrgAr: 'القرآن الكريم (أكثر من 20 سورة قرآنية موثقة برقم الآية)',
        authorOrOrgEn: 'The Noble Qur\'an (20+ Surahs Cited by Exact Verse)',
        detailAr:
          'أدعية ربنا في سور الفاتحة، البقرة، آل عمران، الأعراف، التوبة، يونس، هود، يوسف، إبراهيم، الإسراء، الكهف، طه، الأنبياء، المؤمنون، الفرقان، الشعراء، النمل، القصص، الأحقاف، الحشر، الممتحنة، التحريم، ونوح.',
        detailEn:
          'Exact verse-cited Du\'as across Al-Fatihah, Al-Baqarah, Ali \'Imran, Al-A\'raf, Hud, Yusuf, Ibrahim, Al-Kahf, Ta-Ha, Al-Anbiya, Al-Furqan, Al-Hashr, Nuh, and more.',
      },
      {
        id: 'adia-prophetic',
        titleAr: 'جوامع الأدعية النبوية المصنفة حسب الأبواب',
        titleEn: 'Categorized Prophetic Supplications',
        authorOrOrgAr: 'البخاري، مسلم، الترمذي، أبو داود، النسائي، ابن ماجه، مسند أحمد، الحاكم، ابن حبان، والطبراني',
        authorOrOrgEn: 'Bukhari, Muslim, Tirmidhi, Abu Dawud, Nasa\'i, Ibn Majah, Ahmad, Al-Hakim, Ibn Hibban & Al-Tabarani',
        detailAr:
          'أبواب الكرب والهم، الرزق والبركة، الشفاء والعافية، الاستخارة، الهداية والثبات، الاستغفار والتوبة، الوالدين والذرية، وسؤال الجنة والاستعاذة من النار، مع توثيق التخريج والترجمة الإنجليزية لكل دعاء.',
        detailEn:
          'Supplications for distress, provision, healing, Istikharah, guidance, repentance, parents/family, and Paradise with explicit Hadith citations and English translations.',
      },
    ],
  },
  {
    id: 'ruqyah',
    titleAr: 'الرقية الشرعية',
    titleEn: 'Sharia Ruqyah',
    subtitleAr: 'آيات الشفاء والتحصين، الأدعية النبوية الصحيحة، وضوابط الرقية الشرعية',
    subtitleEn: 'Qur\'anic verses of healing, Prophetic prayers & Ruqyah guidelines',
    iconName: 'ShieldPlus',
    items: [
      {
        id: 'ruqyah-quran',
        titleAr: 'الرقية الشرعية بآيات القرآن الكريم',
        titleEn: 'Qur\'anic Verses for Ruqyah & Healing',
        authorOrOrgAr: 'القرآن الكريم — آيات الفاتحة والكرسي والشفاء والسكينة والحفظ',
        authorOrOrgEn: 'The Noble Qur\'an — Verses of Healing, Tranquility & Protection',
        detailAr:
          'تضم سورة الفاتحة (أم الكتاب والشافية)، وأوائل وخواتيم سورة البقرة، وآية الكرسي، وآيات إبطال السحر والشفاء والسكينة في سور آل عمران والأعراف ويونس وهود والإسراء والشعراء وفصلت والحشر والقلم، وسور الإخلاص والفلق والناس.',
        detailEn:
          'Comprises Al-Fatihah, opening & closing of Al-Baqarah, Ayat al-Kursi, verses of healing and tranquility from 10+ Surahs, and Al-Mu\'awwidhat.',
      },
      {
        id: 'ruqyah-sunnah',
        titleAr: 'الأحاديث والأدعية النبوية في الرقية والتحصين',
        titleEn: 'Authentic Prophetic Ruqyah Supplications',
        authorOrOrgAr: 'صحيح البخاري، صحيح مسلم، سنن الترمذي، أبي داود، النسائي، ابن ماجه، مسند أحمد، والأذكار للنووي',
        authorOrOrgEn: 'Bukhari, Muslim, Tirmidhi, Abu Dawud, Nasa\'i, Ibn Majah, Ahmad & Al-Adhkar (Al-Nawawi)',
        detailAr:
          'رقية جبريل عليه السلام («باسم الله أرقيك...»)، ودعاء «أذهب البأس رب الناس»، والتعوذ بكلمات الله التامات، وحصن الطفلين («أعيذكما بكلمات الله التامة...»)، وإرشادات الوضوء والإخلاص وآداب الرقية الثابتة.',
        detailEn:
          'Includes Gabriel\'s Ruqyah, Prophetic healing prayers, seeking refuge in Allah\'s perfect words, and a step-by-step ethical guide to Sharia Ruqyah.',
      },
    ],
  },
  {
    id: 'prayer-times',
    titleAr: 'مواقيت الصلاة والطقس',
    titleEn: 'Prayer Times & Weather',
    subtitleAr: 'مكتبة Adhan، الـ 12 هيئة فلكية، مذاهب العصر، خطوط العرض، الطقس، والمواقيت الشهرية',
    subtitleEn: 'Adhan engine, 12 official authorities, Asr schools, high-latitudes, Open-Meteo & AlAdhan',
    iconName: 'Clock',
    items: [
      {
        id: 'prayer-adhan-engine',
        titleAr: 'محرك الحساب الفلكي المحلي والمواقيت الشهرية',
        titleEn: 'Local Astronomical Engine & Monthly Timetable Sync',
        authorOrOrgAr: 'مكتبة Adhan الفلكية ومزامنة AlAdhan API الاختيارية',
        authorOrOrgEn: 'Adhan Astronomical Library & Optional AlAdhan API',
        detailAr:
          'حساب مواقيت الفجر والشروق والظهر والعصر والمغرب والعشاء ومنتصف الليل الشرعي وثلث الليل الأخير محلياً دون إنترنت وفق إحداثيات GPS أو المدينة المختارة، مع عرض الجدول الشهري وإمساكية الصلاة.',
        detailEn:
          'Computes all five prayers, Sunrise, Midnight, and Last Third locally offline via Adhan library, with full monthly timetable calculation and AlAdhan API sync.',
      },
      {
        id: 'prayer-12-authorities',
        titleAr: 'الهيئات والمجامع الفلكية الرسمية الـ 12 المعتمدة',
        titleEn: '12 Recognized Global Calculation Authorities',
        authorOrOrgAr: 'هيئات الرصد والمواقيت الإسلامية العالمية',
        authorOrOrgEn: 'Official Islamic Astronomical & Awqaf Authorities',
        detailAr:
          '1) جامعة أم القرى (مكة)، 2) الهيئة المصرية العامة للمساحة، 3) رابطة العالم الإسلامي (MWL)، 4) جامعة العلوم الإسلامية بكراتشي، 5) ISNA (أمريكا الشمالية)، 6) دبي (IACAD)، 7) وزارة الأوقاف الكويتية، 8) وزارة الأوقاف القطرية، 9) رئاسة الشؤون الدينية التركية (Diyanet)، 10) مجلس MUIS سنغافورة، 11) لجنة رؤية الهلال العالمية، 12) معهد الجيوفيزياء بطهران، إضافة إلى التعديل اليدوي لكل صلاة.',
        detailEn:
          'Supports Umm Al-Qura, Egyptian General Authority, MWL, Karachi, ISNA, Dubai (IACAD), Kuwait, Qatar, Diyanet (Turkey), MUIS (Singapore), Moonsighting Committee, and Tehran Geophysics, plus per-prayer minute offsets.',
      },
      {
        id: 'prayer-asr-highlat',
        titleAr: 'مذاهب صلاة العصر وقواعد خطوط العرض العليا',
        titleEn: 'Asr Juristic Schools & High-Latitude Adjustments',
        authorOrOrgAr: 'مذهب الجمهور (ظل المثل) والمذهب الحنفي (ظل المثلين) وضوابط ما فوق 48°',
        authorOrOrgEn: 'Majority (1x) vs. Hanafi (2x) Shadow & High-Latitude Twilight Rules',
        detailAr:
          'تطبيق المذهب الشافعي والمالكي والحنبلي أو المذهب الحنفي لصلاة العصر، وضوابط خطوط العرض العليا الخمسة (التلقائي، زاوية الشفق، منتصف الليل، سُبع الليل، أو دون تعديل).',
        detailEn:
          'Configurable Shafi\'i/Majority vs. Hanafi Asr shadow ratios and five high-latitude twilight adjustments (Auto, Angle-Based, Middle of Night, One-Seventh, None).',
      },
      {
        id: 'prayer-weather-native',
        titleAr: 'حالة الطقس المحلية ونظام الأذان والإقامة والصامت التلقائي',
        titleEn: 'Outdoor Weather Service & Native Prayer Alerts',
        authorOrOrgAr: 'خدمة الأرصاد Open-Meteo API وخدمات التنبيه الأصلية في أندرويد',
        authorOrOrgEn: 'Open-Meteo Weather API & Android Native Alarm/Silent Services',
        detailAr:
          'جلب درجة الحرارة وسرعة الرياح والرطوبة وحالة الطقس لإرشادات التوجه للمسجد عبر Open-Meteo، مع نظام الأذان والإقامة والصامت التلقائي في أوقات الصلاة عبر نظام AlarmManager الأصلي.',
        detailEn:
          'Live outdoor temperature, humidity, wind, and conditions via Open-Meteo API, paired with native Android Adhan, Iqama, and Auto-Silent scheduling.',
      },
    ],
  },
  {
    id: 'qibla',
    titleAr: 'البوصلة واتجاه القبلة',
    titleEn: 'Compass & Qibla',
    subtitleAr: 'معادلة الدائرة العظمى، معايرة الشمس والقمر والظل (SunCalc)، وخرائط OpenStreetMap',
    subtitleEn: 'Great-Circle bearing, SunCalc solar/lunar/shadow alignment & OpenStreetMap / Leaflet',
    iconName: 'Compass',
    items: [
      {
        id: 'qibla-great-circle',
        titleAr: 'معادلة الدائرة العظمى نحو الكعبة المشرفة',
        titleEn: 'Spherical Great-Circle Bearing to the Holy Kaaba',
        authorOrOrgAr: 'إحداثيات الكعبة المشرفة الدقيقة (21.4225° شمالاً، 39.8262° شرقاً)',
        authorOrOrgEn: 'Exact Kaaba Coordinates (21.4225° N, 39.8262° E)',
        detailAr:
          'حساب زاوية سمت القبلة عن الشمال الحقيقي بدقة هندسية كروية، وربطها بحساسات البوصلة المغناطيسية واتجاه الشاشة ووضع الكاميرا والواقع المعزز (AR).',
        detailEn:
          'Calculates true-north Qibla azimuth via spherical trigonometry, integrated with device orientation sensors and AR camera overlay.',
      },
      {
        id: 'qibla-suncalc',
        titleAr: 'المعايرة الفلكية بالشمس والقمر والظل',
        titleEn: 'Astronomical Sun, Moon & Shadow Alignment',
        authorOrOrgAr: 'مكتبة SunCalc الفلكية للرصد الشمسي والقمري',
        authorOrOrgEn: 'SunCalc Astronomical Positions Library',
        detailAr:
          'تحديد سمت الشمس والقمر واتجاه الظل في الموقع الحالي بدقة زمنية، مما يتيح للمستخدم التحقق من اتجاه القبلة فلكياً في حال تشوش البوصلة المغناطيسية.',
        detailEn:
          'Computes live solar, lunar, and shadow azimuths via SunCalc for sensor-free Qibla verification anywhere in the world.',
      },
      {
        id: 'qibla-map',
        titleAr: 'خريطة المسار التفاعلية نحو مكة المكرمة',
        titleEn: 'Interactive Qibla Map Visualization',
        authorOrOrgAr: 'خرائط OpenStreetMap ومحرك Leaflet / React-Leaflet',
        authorOrOrgEn: 'OpenStreetMap Tiles & Leaflet / React-Leaflet Engine',
        detailAr:
          'عرض خريطة تفاعلية لموقع المستخدم وخط التوجيه المباشر نحو الكعبة المشرفة للمعاينة الجغرافية الدقيقة.',
        detailEn:
          'Renders interactive OpenStreetMap layers via Leaflet displaying the user\'s location and geodesic Qibla line toward Makkah.',
      },
    ],
  },
  {
    id: 'calendar',
    titleAr: 'التقويم الهجري والمناسبات',
    titleEn: 'Hijri Calendar',
    subtitleAr: 'محرك أم القرى ثلاثي الطبقات، مكتبة moment-hijri، والأيام الفاضلة',
    subtitleEn: 'Three-tier Umm al-Qura engine, moment-hijri & seasonal Islamic occasions',
    iconName: 'Calendar',
    items: [
      {
        id: 'calendar-3tier',
        titleAr: 'محرك التحويل الهجري والميلادي ثلاثي الطبقات',
        titleEn: 'Three-Tier Hijri/Gregorian Conversion Engine',
        authorOrOrgAr: 'تقويم أم القرى الرسمي (Intl ICU islamic-umalqura) ومكتبة moment-hijri',
        authorOrOrgEn: 'Official ICU Umm al-Qura (islamic-umalqura) & moment-hijri Library',
        detailAr:
          'يعتمد تقويم أم القرى الرسمي من النظام كأولوية أولى، وتعمل مكتبة moment-hijri كطبقة ثانية، والخوارزمية الفلكية القياسية كطبقة احتياطية ثالثة، مع دعم التعديل اليدوي لبداية الشهر (± يومين).',
        detailEn:
          'Prioritizes official system ICU Umm al-Qura tables, backed by moment-hijri and algorithmic fallback, plus manual crescent adjustment.',
      },
      {
        id: 'calendar-occasions-list',
        titleAr: 'تقويم المناسبات الشرعية وأيام الصيام المستحبة',
        titleEn: 'Islamic Occasions & Sunnah Fasting Tracker',
        authorOrOrgAr: 'المواقيت الهجرية السنوية والشهرية الثابتة في السنة النبوية',
        authorOrOrgEn: 'Authenticated Hijri Seasons & Prophetic Fasting Days',
        detailAr:
          'تنبيه وتمييز غرة المحرم، عاشوراء وتاسوعاء، رجب وشعبان، شهر رمضان المبارك وليلة القدر، عيد الفطر، ست من شوال، عشر ذي الحجة، يوم عرفة، عيد الأضحى، والأيام البيض (13-14-15) والاثنين والخميس.',
        detailEn:
          'Highlights Muharram, Ashura, Ramadan, Laylat al-Qadr, Eids, Six Days of Shawwal, Dhul-Hijjah, Day of Arafah, White Days, and Monday/Thursday Sunnah fasts.',
      },
    ],
  },
  {
    id: 'calculators',
    titleAr: 'الحاسبة الشرعية',
    titleEn: 'Islamic Calculators',
    subtitleAr: 'أصول علم الفرائض، أنصبة الزكاة، الصاع النبوي، شروط الأضحية، والكفارات',
    subtitleEn: 'Al-Fara\'id inheritance, Zakat Nisab, Prophetic Sa\', Udhiyah rules & Kaffarat',
    iconName: 'Scale',
    items: [
      {
        id: 'calc-mawarith',
        titleAr: 'حاسبة المواريث الشرعية (علم الفرائض)',
        titleEn: 'Islamic Inheritance Calculator (Al-Fara\'id)',
        authorOrOrgAr: 'آيات المواريث (سورة النساء: 11، 12، 176)، السنة الصحيحة، وإجماع الفقهاء',
        authorOrOrgEn: 'Qur\'anic Verses (An-Nisa: 11, 12, 176), Sunnah & Juristic Consensus',
        detailAr:
          'حساب أنصبة الورثة بدقة وفق الفروض الستة المقدرة (النصف، الربع، الثمن، الثلثان، الثلث، السدس)، والتعصيب بأنواعه (بالنفس والغير ومع الغير)، وقواعد الحجب الكلي والجزئي، ومسائل العول والرد وتصحيح الفريضة.',
        detailEn:
          'Implements the six Qur\'anic fixed shares (Furood), residuary classes (Asabah), total and partial exclusion (Hajb), \'Awl reduction, and Radd surplus redistribution.',
      },
      {
        id: 'calc-zakat',
        titleAr: 'حاسبة الزكاة الشاملة (النقد، الذهب، التجارة، الزروع، الأنعام، الركاز)',
        titleEn: 'Comprehensive Zakat Calculator',
        authorOrOrgAr: 'الأنصبة النبوية الثابتة وقرارات المجامع الفقهية المعاصرة',
        authorOrOrgEn: 'Authenticated Prophetic Nisab Standards & Fiqh Council Resolutions',
        detailAr:
          'الربع عُشر (2.5%) في النقد وعروض التجارة والأسهم والذهب والفضة عند بلوغ نصاب الذهب (85 جم عيار 24) أو الفضة (595 جم) وحولان الحول، وزكاة الزروع (10% أو 5% ببلوغ 5 أوسق / 653 كجم)، وجداول بهيمة الأنعام السائمة، وخُمس الركاز (20%).',
        detailEn:
          'Computes 2.5% wealth/trade Zakat (85g 24K Gold / 595g Silver Nisab), Crops (10%/5% at 653 kg), Livestock tables, and 20% Rikaz.',
      },
      {
        id: 'calc-fitr',
        titleAr: 'حاسبة زكاة الفطر ومقادير الصاع النبوي',
        titleEn: 'Zakat al-Fitr & Prophetic Sa\' Weights',
        authorOrOrgAr: 'ضوابط الصاع النبوي (4 أمداد) وتقدير الوزن لكل صنف طعام',
        authorOrOrgEn: 'Prophetic Sa\' Equivalents Across Staple Grains',
        detailAr:
          'حساب مقدار الصاع من غالب قوت البلد عن كل فرد وفق الأوزان المعتمدة (الأرز والقياس العام 2.5 كجم، القمح 2.04 كجم، التمر 2.0 كجم، الزبيب 1.64 كجم) مع إمكانية تقدير القيمة النقدية.',
        detailEn:
          'Calculates per-person obligation using standard staple grain weights (Rice/Standard 2.5 kg, Wheat 2.04 kg, Dates 2.0 kg, Raisins 1.64 kg) with optional cash valuation.',
      },
      {
        id: 'calc-udhiyah-aqiqah',
        titleAr: 'دليل وحاسبة الأضحية والعقيقة',
        titleEn: 'Udhiyah (Sacrifice) & Aqiqah Calculator',
        authorOrOrgAr: 'السنن الصحيحة في شروط السن والأسهم والعيوب الأربعة المانعة',
        authorOrOrgEn: 'Authentic Sunnah Conditions on Age, Shares & Disqualifying Defects',
        detailAr:
          'التحقق من بلوغ السن الشرعية (الإبل 5 سنوات، البقر سنتان، المعز سنة، الضأن 6 أشهر)، والاشتراك في البُدْن والبقر (1–7 أسهم)، وخلو الذبيحة من العيوب الأربعة المنصوص عليها (العوراء البين عورها، المريضة البين مرضها، العرجاء البين ضلعها، والعجفاء التي لا تنقي)، وشاة الغلام والجارية في العقيقة.',
        detailEn:
          'Verifies minimum sacrifice ages (Camel 5y, Cattle 2y, Goat 1y, Sheep 6m), 1–7 share rules, the four disqualifying defects from Sunnah, and Aqiqah rules.',
      },
      {
        id: 'calc-kaffarat-fidyah',
        titleAr: 'حاسبة الكفارات وفدية الصيام',
        titleEn: 'Expiations (Kaffarat) & Fasting Fidyah Calculator',
        authorOrOrgAr: 'القرآن الكريم (المائدة: 89، البقرة: 184، المجادلة: 3-4) وأحكام الفقه الإسلامي',
        authorOrOrgEn: 'Qur\'an (Al-Ma\'idah: 89, Al-Baqarah: 184, Al-Mujadila: 3-4) & Classical Fiqh',
        detailAr:
          'تقدير كفارة اليمين (إطعام أو كسوة 10 مساكين)، وكفارة الظهار والجماع في نهار رمضان (عتق أو صيام شهرين متتابعين أو إطعام 60 مسكيناً)، وفدية الصيام للعاجز بمقدار المُد أو نصف الصاع.',
        detailEn:
          'Estimates Oath Expiation (10 needy persons), Major Expiation (60 needy persons), and chronic-illness Fasting Fidyah by Mudd/half-Sa\'.',
      },
    ],
  },
  {
    id: 'habit-tracker',
    titleAr: 'مربّي العبادات',
    titleEn: 'Habit Tracker',
    subtitleAr: 'الصلوات الخمس، السنن الرواتب، الضحى والوتر وقيام الليل، الصيام، والورد',
    subtitleEn: 'Daily prayers, 12 Rawatib Sunnahs, Duha, Witr, Qiyam, fasting & daily Wird',
    iconName: 'ListChecks',
    items: [
      {
        id: 'habit-fard-rawatib',
        titleAr: 'متابعة الصلوات المفروضة والسنن الرواتب الـ 12',
        titleEn: 'Five Obligatory Prayers & 12 Rawatib Sunnahs',
        authorOrOrgAr: 'صحيح مسلم (حديث أم حبيبة رضي الله عنها في اثنتي عشرة ركعة) والصحيحان',
        authorOrOrgEn: 'Sahih Muslim (Umm Habibah\'s Hadith on 12 Rawatib) & Sahihayn',
        detailAr:
          'تسجيل الصلوات المكتوبة الخمس، والسنن الرواتب المؤكدة (ركعتان قبل الفجر، أربع قبل الظهر وركعتان بعدها، ركعتان بعد المغرب، ركعتان بعد العشاء)، وصلاة الضحى والوتر وقيام الليل.',
        detailEn:
          'Tracks daily Fard prayers, the 12 confirmed Rawatib Sunnah units, Duha, Witr, and night Qiyam prayers.',
      },
      {
        id: 'habit-adhkar-fasting',
        titleAr: 'سجل الأذكار والورد وصيام التطوع والأرشيف',
        titleEn: 'Adhkar, Qur\'an Wird, Voluntary Fasting & Archive',
        authorOrOrgAr: 'سنن الصيام (الاثنين والخميس والأيام البيض) الثابتة في الصحيحين والسنن',
        authorOrOrgEn: 'Authenticated Monday/Thursday & White Days Fasting Traditions',
        detailAr:
          'ربط الإنجاز اليومي بأذكار الصباح والمساء والورد القرآني وصيام النوافل مع حفظ السجل التاريخي والإحصاءات التحفيزية.',
        detailEn:
          'Connects daily morning/evening Adhkar, Qur\'an reading, and Sunnah fasting with a persistent calendar archive and progress analytics.',
      },
    ],
  },
  {
    id: 'seerah',
    titleAr: 'السيرة النبوية',
    titleEn: 'Prophetic Seerah',
    subtitleAr: 'النسب الشريف، العهدان المكي والمدني، الغزوات، المواقف النبوية، والشخصيات',
    subtitleEn: 'Prophetic lineage, Makkan & Madinan eras, battles, moral stances & figures',
    iconName: 'Landmark',
    items: [
      {
        id: 'seerah-raheeq-hisham',
        titleAr: 'مصادر السيرة النبوية الأساسية',
        titleEn: 'Primary Classical & Modern Seerah Compendia',
        authorOrOrgAr: 'الرحيق المختوم (صفي الرحمن المباركفوري)، السيرة النبوية لابن هشام (عن ابن إسحاق)، وزاد المعاد لابن القيم',
        authorOrOrgEn: 'Al-Raheeq Al-Makhtum (Al-Mubarakpuri), Sirat Ibn Hisham (Ibn Ishaq) & Zad al-Ma\'ad (Ibn al-Qayyim)',
        detailAr:
          'المرجع المحوري لبناء التسلسل الزمني للسيرة النبوية الشريفة من البعثة والهجرة إلى الوفاة، إضافة إلى الغزوات والسرايا وسلسلة النسب الشريف.',
        detailEn:
          'Foundational chronology for the Prophet\'s ﷺ life from Makkan revelation and Hijrah to expeditions and noble lineage.',
      },
      {
        id: 'seerah-history-dalail',
        titleAr: 'دواوين التاريخ الإسلامي والشمائل ودلائل النبوة',
        titleEn: 'Islamic History, Shama\'il & Dala\'il al-Nubuwwah Works',
        authorOrOrgAr: 'البداية والنهاية لابن كثير، تاريخ الطبري، الطبقات الكبرى لابن سعد، دلائل النبوة للبيهقي، الشفا للقاضي عياض، الوفا لابن الجوزي، وسبل الهدى والرشاد للصالحي',
        authorOrOrgEn: 'Al-Bidayah wa al-Nihayah, Tarikh al-Tabari, Al-Tabaqat al-Kubra, Dala\'il (Al-Bayhaqi), Al-Shifa (Qadi Iyad), Al-Wafa & Subul al-Huda',
        detailAr:
          'توثيق الشمائل المحمدية والمعجزات والمشاهد التربوية ومواقف الصحابة وأهل البيت وأبرز الشخصيات في العهد النبوي.',
        detailEn:
          'Supplies detailed portraits of Prophetic character, miracles, key Companions, and pivotal events throughout the Seerah.',
      },
      {
        id: 'seerah-hadith',
        titleAr: 'المسانيد والصحاح المستشهد بها في المواقف والأحداث',
        titleEn: 'Authenticated Hadith Sources Cited in Seerah Milestones',
        authorOrOrgAr: 'صحيح البخاري، صحيح مسلم، السنن الأربعة، مسند أحمد، مستدرك الحاكم، صحيح ابن حبان، ومجمع الزوائد',
        authorOrOrgEn: 'Bukhari, Muslim, The Four Sunan, Musnad Ahmad, Al-Hakim, Ibn Hibban & Majma\' al-Zawa\'id',
        detailAr:
          'عزو الأحاديث والمواقف التربوية داخل بطاقات السيرة إلى دواوين السنة الموثوقة وتصحيحات المحدثين كالألباني رحمه الله باللغتين.',
        detailEn:
          'Bilingual attribution of Prophetic stances and historical reports to primary Hadith compilations and scholarly authentication.',
      },
    ],
  },
  {
    id: 'miracles',
    titleAr: 'المعجزات الإلهية',
    titleEn: 'Divine Miracles',
    subtitleAr: 'الإعجاز البياني والتشريعي، النبوءات، والآيات الكونية والطبية والتاريخية الموثقة',
    subtitleEn: 'Proofs of existence & revelation, prophecies, cosmic, medical & historical evidences',
    iconName: 'Star',
    items: [
      {
        id: 'miracles-islamic-classics',
        titleAr: 'كتب التفسير والحديث ودلائل النبوة والإعجاز التراثية',
        titleEn: 'Classical Tafsir, Hadith & I\'jaz al-Qur\'an Authorities',
        authorOrOrgAr: 'الصحيحان، السنن، مسند أحمد، الحاكم، البيهقي، الخطابي، الباقلاني (إعجاز القرآن)، الجرجاني (دلائل الإعجاز)، وابن كثير والطبري والقرطبي والسعدي',
        authorOrOrgEn: 'Sahihayn, Sunan, Ahmad, Al-Hakim, Al-Bayhaqi, Al-Baqillani, Al-Jurjani, Ibn Kathir, Al-Tabari, Al-Qurtubi & Al-Sa\'di',
        detailAr:
          'توثيق براهين الوحي، والتحدي البلاغي، وحفظ القرآن الكريم، وإخبارات الغيب النبوية المتحققة (انتصار الروم، سقوط كسرى وقيصر، تطاول البنيان، عودة جزيرة العرب مروجاً وأنهاراً، والفتح الموعود).',
        detailEn:
          'Documents the rhetorical challenge, preservation of revelation, and fulfilled Prophetic prophecies grounded in authenticated classical sources.',
      },
      {
        id: 'miracles-contemporary-scholars',
        titleAr: 'مؤلفات وأبحاث الإعجاز والفكر الإسلامي المعاصرة',
        titleEn: 'Contemporary Works on Qur\'anic Inimitability & Faith',
        authorOrOrgAr: 'محمد عبد الله دراز (النبأ العظيم)، مالك بن نبي (الظاهرة القرآنية)، د. مصطفى محمود، د. زغلول النجار، د. حسن شمسي باشا، د. سامي السويلم، وموريس بوكاي',
        authorOrOrgEn: 'M. A. Draz (The Great News), Malek Bennabi, Dr. Mustafa Mahmoud, Dr. Zaghloul El-Naggar, Dr. H. Shamsi Pasha & Maurice Bucaille',
        detailAr:
          'الاستدلال الفكري والعقلي على وجود الخالق، ونظام الفطرة، والتكامل التشريعي والاقتصادي في منع احتكار الثروة وحفظ الصحة والسكينة النفسية.',
        detailEn:
          'Draws upon modern Islamic scholarship addressing rational theology, economic justice, preventive health, and textual preservation.',
      },
      {
        id: 'miracles-cosmic-science',
        titleAr: 'الوكالات والمؤسسات والأبحاث الفيزيائية والكونية والجيولوجية',
        titleEn: 'Cosmological, Astrophysical & Geological References',
        authorOrOrgAr: 'NASA (هابل و SRTM)، هيئة المسح الجيولوجي USGS، معهد ماكس بلانك (Palaeodeserts)، أوتاد الجبال (Frank Press)، ونظريات نشأة الكون (BGV / Alan Guth)',
        authorOrOrgEn: 'NASA, USGS, Max Planck Institute (Palaeodeserts), Frank Press & Raymond Siever (Earth), BGV Theorem & Alan Guth',
        detailAr:
          'الاستشهاد بالمعطيات الرصدية الموثقة في توسع الكون، والرتق والفتق، وإنزال الحديد، وجذور الجبال كأوتاد، وظلمات البحار العميقة، والغلاف الجوي (السقف المحفوظ)، وتلقيح الرياح، ودراسات الجزيرة العربية المطيرة قديماً.',
        detailEn:
          'Cites documented scientific literature on cosmic expansion, iron formation, mountain roots, deep-sea internal waves, atmospheric protection, and ancient Arabian palaeodeserts.',
      },
      {
        id: 'miracles-medical-historical',
        titleAr: 'المراجع الطبية والتشريحية والمخطوطات التاريخية الموثقة',
        titleEn: 'Medical, Embryological & Historical Manuscript Sources',
        authorOrOrgAr: 'كيث مور (The Developing Human)، جائزة نوبل 2016 (الالتهام الذاتي)، Gray\'s Anatomy، منظمة WHO، دراسة مخطوطة جامعة برمنغهام (2015)، ودراسات فسيولوجيا الناصية والبصمات',
        authorOrOrgEn: 'Keith Moore, 2016 Nobel Prize (Autophagy), Gray\'s Anatomy, WHO, University of Birmingham Manuscript Study (2015) & Journal of Religion and Health',
        detailAr:
          'توثيق مراحل تكوين الجنين، ووظيفة الفص الجبهي (الناصية)، وبصمة البنان (فرانسيس غالتون)، ونقص الأكسجة بالارتفاعات، وآثار الصيام الطبية، وشهادة الكربون المشع لمخطوطات برمنغهام القرآنية.',
        detailEn:
          'Includes embryological staging, frontal lobe executive function, dermatoglyphics, fasting autophagy research, and radiocarbon dating of the Birmingham Qur\'an folio.',
      },
    ],
  },
  {
    id: 'asmaul-husna',
    titleAr: 'أسماء الله الحسنى',
    titleEn: 'The 99 Names of Allah',
    subtitleAr: 'الأسماء الـ 99، شواهدها من القرآن والسنة، ومعانيها اللغوية والعقدية',
    subtitleEn: '99 Divine Names, Qur\'an & Sunnah evidences, and theological explanations',
    iconName: 'Award',
    items: [
      {
        id: 'asma-quran-sunnah',
        titleAr: 'سرد الأسماء الـ 99 وشواهدها النصية',
        titleEn: 'The 99 Names & Their Scriptural Proofs',
        authorOrOrgAr: 'القرآن الكريم، الصحيحان (حديث: «إن لله تسعة وتسعين اسماً...»)، جامع الترمذي، مستدرك الحاكم، وموطأ مالك',
        authorOrOrgEn: 'The Noble Qur\'an, Sahihayn, Jami\' al-Tirmidhi, Mustadrak al-Hakim & Muwatta Malik',
        detailAr:
          'عرض كل اسم من أسماء الله الحسنى الـ 99 باللغتين العربية والإنجليزية مع الشاهد القرآني أو الحديثي المباشر ومعناه العقدي واللغوي.',
        detailEn:
          'Presents each of the 99 Names bilingually with its direct Qur\'anic or Sunnah proof and linguistic/theological meaning.',
      },
      {
        id: 'asma-scholars',
        titleAr: 'مراجع شرح أسماء الله الحسنى',
        titleEn: 'Classical & Contemporary Divine Names Commentaries',
        authorOrOrgAr: 'شأن الدعاء للخطابي، بدائع الفوائد ومدارج السالكين لابن القيم، وتيسير الكريم الرحمن للسعدي',
        authorOrOrgEn: 'Al-Khattabi, Ibn Qayyim al-Jawziyyah & Sheikh Abd al-Rahman al-Sa\'di',
        detailAr:
          'بيان أثر الإيمان بكل اسم وصفة في تعظيم الله وحسن عبادته ودعائه بمقتضى أسمائه الحسنى.',
        detailEn:
          'Explains the spiritual impact and devotion connected to calling upon Allah by each of His Most Beautiful Names.',
      },
    ],
  },
  {
    id: 'ten-promised',
    titleAr: 'العشرة المبشرون بالجنة',
    titleEn: 'The Ten Promised Paradise',
    subtitleAr: 'أحاديث البشارة بالجنة وسير وتراجم الصحابة الكرام العشرة رضي الله عنهم',
    subtitleEn: 'Glad-tidings Hadiths & detailed biographies of the Ten Companions',
    iconName: 'Users',
    items: [
      {
        id: 'ten-promised-hadith',
        titleAr: 'نصوص البشارة بالجنة ومناقبهم في دواوين السنة',
        titleEn: 'Hadiths of the Glad Tidings of Paradise',
        authorOrOrgAr: 'جامع الترمذي، سنن أبي داود، مسند الإمام أحمد، صحيح البخاري، صحيح مسلم، سنن النسائي، موطأ مالك، ومستدرك الحاكم',
        authorOrOrgEn: 'Al-Tirmidhi, Abu Dawud, Musnad Ahmad, Bukhari, Muslim, al-Nasa\'i, Muwatta Malik & Al-Hakim',
        detailAr:
          'تخريج حديث العشرة المبشرين بالجنة عن عبد الرحمن بن عوف وسعيد بن زيد رضي الله عنهما، مع الأحاديث الموثقة في فضائل كل صحابي ومواقفه مع النبي ﷺ.',
        detailEn:
          'Documents the authenticated glad-tidings Hadith and individual virtues of Abu Bakr, Umar, Uthman, Ali, Talhah, al-Zubayr, Abd al-Rahman ibn Awf, Sa\'d ibn Abi Waqqas, Sa\'id ibn Zayd, and Abu Ubaydah.',
      },
      {
        id: 'ten-promised-biographies',
        titleAr: 'موسوعات التراجم والتاريخ الإسلامي',
        titleEn: 'Classical Biographical & Historical Encyclopedias',
        authorOrOrgAr: 'سير أعلام النبلاء للذهبي، الإصابة في تمييز الصحابة لابن حجر، أسد الغابة لابن الأثير، الاستيعاب لابن عبد البر، والبداية والنهاية لابن كثير',
        authorOrOrgEn: 'Siyar A\'lam al-Nubala\' (Al-Dhahabi), Al-Isabah (Ibn Hajar), Usd al-Ghabah, Al-Isti\'ab & Al-Bidayah wa al-Nihayah',
        detailAr:
          'تغطية تفصيلية للنسب والكنية والحياة قبل الإسلام وقصة الإيمان والمشاهد والغزوات والدروس المستلهمة ووقت الوفاة وموضع الدفن باللغتين.',
        detailEn:
          'Detailed bilingual profiles covering lineage, Kunya, pre-Islamic standing, conversion stories, battles, inspiring lessons, and resting places.',
      },
    ],
  },
  {
    id: 'wisdom',
    titleAr: 'الحِكم والمواعظ',
    titleEn: 'Islamic Wisdoms',
    subtitleAr: 'مأثور الصحابة والتابعين وأئمة السلف والعلماء في التزكية والحكمة',
    subtitleEn: 'Curated aphorisms from the Companions, Tabi\'un & classical scholars',
    iconName: 'Quote',
    items: [
      {
        id: 'wisdom-companions-scholars',
        titleAr: 'أقوال الصحابة والتابعين وأئمة العلم والسلوك',
        titleEn: 'Sayings of the Companions, Tabi\'un & Classical Scholars',
        authorOrOrgAr: 'الخلفاء الراشدون، ابن مسعود، أبو الدرداء، أبو هريرة، لقمان الحكيم، الحسن البصري، عمر بن عبد العزيز، سفيان الثوري، الفضيل بن عياض، ابن المبارك، الشافعي، أحمد بن حنبل، ابن الجوزي، ابن تيمية، وابن القيم',
        authorOrOrgEn: 'The Rightly Guided Caliphs, Ibn Mas\'ud, Abu al-Darda, Hasan al-Basri, Al-Shafi\'i, Ahmad, Ibn al-Jawzi, Ibn Taymiyyah & Ibn al-Qayyim',
        detailAr:
          'مختارات موثقة في الإخلاص، الصبر، مراقبة الله، صلاح القلب، علو الهمة، وحفظ اللسان والوقت، تُعرض وتُترجم باللغتين العربية والإنجليزية في الشاشة الرئيسية وبطاقات المشاركة.',
        detailEn:
          'Verified sayings on sincerity, patience, heart purification, and resolve displayed across the home reflection cards and shareable graphics.',
      },
    ],
  },
  {
    id: 'hajj-umrah',
    titleAr: 'الحج والعمرة',
    titleEn: 'Hajj & Umrah',
    subtitleAr: 'المواقيت، الإحرام، الطواف، السعي، عرفة، مزدلفة، منى، وعداد الطواف والسعي',
    subtitleEn: 'Miqat, Ihram, Tawaf, Sa\'i, Arafah, Muzdalifah, Mina & interactive counter',
    iconName: 'MapPin',
    items: [
      {
        id: 'hajj-quran-sunnah',
        titleAr: 'الأدلة الشرعية لمناسك الحج والعمرة خطوة بخطوة',
        titleEn: 'Qur\'an & Sunnah Proofs for Hajj & Umrah Rituals',
        authorOrOrgAr: 'القرآن الكريم، صحيح مسلم (حديث جابر في صفة حجة النبي ﷺ)، البخاري، الترمذي، النسائي، أبو داود، ابن ماجه، ومسند أحمد',
        authorOrOrgEn: 'Qur\'an, Sahih Muslim (Jabir\'s Hadith on the Prophet\'s Hajj), Bukhari, the Four Sunan & Ahmad',
        detailAr:
          'شرح تفصيلي لأنواع النسك (الإفراد، القران، التمتع)، والمواقيت المكانية والزمانية، وأركان وواجبات وسنن ومحظورات الإحرام، والطواف والسعي، ويوم التروية وعرفة والمزدلفة ورمي الجمرات والتحلل.',
        detailEn:
          'Step-by-step bilingual guide covering Ihram types, Miqat stations, Tawaf, Sa\'i, Arafah, Muzdalifah, Jamarat stoning, pillars, obligations, and exemptions.',
      },
      {
        id: 'hajj-duas-counter',
        titleAr: 'الأدعية المأثورة في المناسك وعداد الطواف والسعي التفاعلي',
        titleEn: 'Pilgrimage Supplications & Interactive Tawaf/Sa\'i Counter',
        authorOrOrgAr: 'الأذكار الثابتة في التلبية وعرفة والمشعر الحرام وبين الركنين',
        authorOrOrgEn: 'Authenticated Talbiyah, Arafah & Tawaf/Sa\'i Remembrances',
        detailAr:
          'توثيق صيغة التلبية، والدعاء عند رؤية الكعبة، وبين الركن اليماني والحجر الأسود، وعلى الصفا والمروة، وعشية عرفة، مع عداد الأشواط السبعة التفاعلي.',
        detailEn:
          'Includes the Talbiyah, prayers at the Kaaba, between the Yamani Corner and Black Stone, Safa & Marwah, and Arafah paired with the 7-lap tracker.',
      },
    ],
  },
  {
    id: 'history-sites',
    titleAr: 'التاريخ والمواقع الإسلامية',
    titleEn: 'History & Islamic Sites',
    subtitleAr: 'الذاكرة التاريخية الإسلامية والعالمية ودليل الـ 24 موقعاً وموسوعة إسلامية موثوقة',
    subtitleEn: 'Islamic/world historical timeline & 24 curated authoritative Islamic portals',
    iconName: 'Globe',
    items: [
      {
        id: 'history-islamic-bundled',
        titleAr: 'سجل الأحداث التاريخية الإسلامية المدمج',
        titleEn: 'Bundled Islamic Historical Archive',
        authorOrOrgAr: 'تاريخ الطبري، البداية والنهاية لابن كثير، سير أعلام النبلاء للذهبي، الإصابة، الصحيحان، الموطأ، ومسند أحمد',
        authorOrOrgEn: 'Tarikh al-Tabari, Al-Bidayah wa al-Nihayah, Siyar A\'lam al-Nubala\', Al-Isabah & Primary Hadith Books',
        detailAr:
          'رصد أحداث التاريخ الإسلامي والحضاري المرتبطة بيوم وشهر اليوم في الذاكرة التاريخية وبطاقة «حدث في مثل هذا اليوم» مع خيارات التصفح والمشاركة.',
        detailEn:
          'Curated offline Islamic historical milestones indexed by date for the On This Day and Historical Memory cards.',
      },
      {
        id: 'history-wikipedia-api',
        titleAr: 'التغذية التاريخية الحية للأحداث العالمية',
        titleEn: 'Live Global Historical Events Feed',
        authorOrOrgAr: 'واجهة موسوعة ويكيميديا الرسمية Wikimedia / Wikipedia REST API (onthisday)',
        authorOrOrgEn: 'Wikimedia / Wikipedia REST API (onthisday)',
        detailAr:
          'جلب الأحداث التاريخية العالمية المرتبطة بتاريخ اليوم عند توفر الاتصال لعرضها بجانب الأرشيف التاريخي المدمج.',
        detailEn:
          'Fetches verified historical events for the current month and day when online alongside bundled events.',
      },
      {
        id: 'islamic-sites-24',
        titleAr: 'دليل الـ 24 موقعاً وموسوعة إسلامية عالمية موثوقة',
        titleEn: 'Directory of 24 Trusted Global Islamic Portals',
        authorOrOrgAr: 'هيئات ومجامع ومؤسسات علمية وإسلامية عالمية معتمدة',
        authorOrOrgEn: 'Recognized International Qur\'anic, Hadith & Scholarly Institutions',
        detailAr:
          'يضم الدليل 24 منصة موثوقة ومصنفة: مجمع الملك فهد لطباعة المصحف الشريف (qurancomplex.gov.sa)، جامع خادم الحرمين الشريفين للسنة النبوية (sunnah.sa)، Quran.com، Sunnah.com، آيات جامعة الملك سعود، الدرر السنية، المكتبة الشاملة، الإسلام سؤال وجواب، مركز تفسير، موسوعة الأحاديث (HadeethEnc)، موقعا الشيخين ابن باز وابن عثيمين، قصة الإسلام، الكلم الطيب، صيد الفوائد، الباحث الحديثي، شبكة الألوكة، نداء الإيمان، المجلس الأوروبي للإفتاء، تنزيل، سورة قرآن، موسوعة القرآن (QuranEnc)، نبي الرحمة، وMP3Quran.',
        detailEn:
          'Features 24 vetted platforms including King Fahd Complex, King Salman Sunnah Portal (sunnah.sa), Quran.com, Sunnah.com, KSU Ayat, Dorar.net, Shamela.ws, IslamQA, Tafsir.net, HadeethEnc, BinBaz, BinOthaymeen, IslamStory, Alukah, Tanzil, QuranEnc, and MP3Quran.',
      },
    ],
  },
  {
    id: 'voice-search-tech',
    titleAr: 'البحث والتحكم الصوتي',
    titleEn: 'Search & Voice Control',
    subtitleAr: 'محرك البحث الموحد، الأوامر الصوتية، القراءة الآلية، وشريط الإشراقات اليومية',
    subtitleEn: 'Unified search engine, voice commands, text-to-speech & live ticker services',
    iconName: 'Mic',
    items: [
      {
        id: 'global-search-engine',
        titleAr: 'محرك البحث الشامل وتطبيع النصوص العربية',
        titleEn: 'Unified Global Search & Arabic Text Normalization',
        authorOrOrgAr: 'خوارزمية البحث الفوري المدمجة داخل التطبيق',
        authorOrOrgEn: 'Built-in Local Full-Text Search & Diacritic Normalizer',
        detailAr:
          'بحث موحد فوري بعد إزالة التشكيل وتوحيد الألف والهمزات والتاء المربوطة عبر القرآن الكريم، التفاسير، حصن المسلم، الأدعية، الأربعين النووية، السيرة، المعجزات، وأسماء الله الحسنى.',
        detailEn:
          'Instant offline search with Arabic normalization across Qur\'an, Tafsirs, Hisn Al-Muslim, Du\'as, Nawawi, Seerah, Miracles, and 99 Names.',
      },
      {
        id: 'voice-tts-engine',
        titleAr: 'التحكم الصوتي ومحرك النطق الصوتي للنصوص',
        titleEn: 'Voice Commands & Text-to-Speech (TTS) Engine',
        authorOrOrgAr: 'نظام التعرف الصوتي ومشغل Android TextToSpeech و Google Translate TTS',
        authorOrOrgEn: 'Device Speech Recognition, Capacitor TTS & Google Translate TTS',
        detailAr:
          'استقبال الأوامر الصوتية للتنقل والقراءة، وتشغيل النطق الصوتي الأصلي على الهاتف مع محرك بديل via Google Translate TTS لقراءة الأذكار والأدعية والأحاديث والشروح.',
        detailEn:
          'Enables hands-free voice navigation plus native Android TextToSpeech (with Google Translate TTS web fallback) for supplications and explanations.',
      },
      {
        id: 'daily-ticker-translation',
        titleAr: 'شريط الإشراقات اليومية والترجمة التلقائية',
        titleEn: 'Live Daily Reflections Ticker & Translation Fallback',
        authorOrOrgAr: 'جدول بيانات Google Sheets المنشور ومحرّكا Google Translate و MyMemory',
        authorOrOrgEn: 'Published Google Sheets CSV Feed with Google Translate & MyMemory APIs',
        detailAr:
          'تحديث عبارات الإشراقات والتذكير اليومي عبر جدول بيانات سحابي مرن، مع ترجمة فورية إلى الإنجليزية عند تفعيل الواجهة الإنجليزية.',
        detailEn:
          'Updates daily inspirational reminders from a lightweight cloud CSV feed, paired with automatic Arabic-to-English translation when English mode is active.',
      },
    ],
  },
];
