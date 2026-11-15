// الفهرس والموسوعة الموضوعية الشاملة لمفاهيم وقصص وأدعية وتشريعات القرآن الكريم
export interface ThematicVerse {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  verseSnippet: string;
  keyMeaningAr: string; // المحور أو المقصد الجوهري للآية في هذا الباب
  keyMeaningEn?: string;
}

export interface ThematicConcept {
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr: string;
  descriptionEn?: string;
  verses: ThematicVerse[];
}

export interface ThematicCategory {
  id: string;
  nameAr: string;
  nameEn?: string;
  concepts: ThematicConcept[];
}

export const THEMATIC_CATEGORIES: ThematicCategory[] = [
  // ==========================================
  // 1. العقيدة والإيمان والتوحيد
  // ==========================================
  {
    id: 'aqeedah',
    nameAr: 'العقيدة والإيمان والتوحيد',
    nameEn: 'Aqeedah, Faith & Monotheism',
    concepts: [
      {
        id: 'tawheed',
        titleAr: 'توحيد الله وإفراده بالعبادة والربوبية',
        titleEn: 'Oneness of Allah & Pure Monotheism',
        descriptionAr: 'الأصل الأصيل والغاية العظمى من خلق الكون والإنسان؛ إفراد الخالق بالربوبية والألوهية والأسماء الحسنى ونفي الشرك والند والولد.',
        descriptionEn: 'The supreme foundation and ultimate objective of all creation: professing Allah\'s absolute Oneness and pure worship without partners.',
        verses: [
          {
            surahNumber: 112,
            surahName: 'الإخلاص',
            ayahNumber: 1,
            verseSnippet: 'قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾',
            keyMeaningAr: 'إثبات الأحدية المطلقة، والصمدية التي تصمد إليها الخلائق، ونفي الشبيه والنظير والولد.',
            keyMeaningEn: 'Affirming absolute singularity, eternal self-sufficiency, and negating all offspring and likeness.'
          },
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 255,
            verseSnippet: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
            keyMeaningAr: 'آية الكرسي: أعظم آية في كتاب الله تشمل كمال الحياة والقيومية وتمام الملك والقدرة الشاملة.',
            keyMeaningEn: 'Ayat al-Kursi: The greatest verse depicting divine living reality, eternal providence, and boundless sovereignty.'
          },
          {
            surahNumber: 6,
            surahName: 'الأنعام',
            ayahNumber: 102,
            verseSnippet: 'ذَٰلِكُمُ اللَّهُ رَبُّكُمْ ۖ لَا إِلَٰهَ إِلَّا هُوَ ۖ خَالِقُ كُلِّ شَيْءٍ فَاعْبُدُوهُ ۚ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ وَكِيلٌ',
            keyMeaningAr: 'الربوبية المستوجبة للألوهية، وتوكيل كل مقاليد الكون والخلق إليه وحده سبحانه.',
            keyMeaningEn: 'Divine Lordship demanding sole adoration, resting all cosmic governance upon Him alone.'
          },
          {
            surahNumber: 16,
            surahName: 'النحل',
            ayahNumber: 36,
            verseSnippet: 'وَلَقَدْ بَعَثْنَا فِي كُلِّ أُمَّةٍ رَّسُولًا أَنِ اعْبُدُوا اللَّهَ وَاجْتَنِبُوا الطَّاغُوتَ',
            keyMeaningAr: 'وحدة الرسالات الإلهية وجوهرها القائم على إخلاص التوحيد والبراءة من كل معبود دونه.',
            keyMeaningEn: 'The unified prophetic message across eras: worship Allah exclusively and shun falsehood.'
          }
        ]
      },
      {
        id: 'asma_sifat',
        titleAr: 'أسماء الله الحسنى وصفاته العُلى',
        titleEn: 'Allah\'s Most Beautiful Names & Attributes',
        descriptionAr: 'معرفة الله تعالى بأسمائه الحسنى وصفاته الكاملة، والتعبد بها ومناجاته وإثبات ما أثبته لنفسه بلا تمثيل ولا تعطيل.',
        descriptionEn: 'Knowing Allah through His majestic Names and supreme Attributes, worshipping Him through them in humility and awe.',
        verses: [
          {
            surahNumber: 7,
            surahName: 'الأعراف',
            ayahNumber: 180,
            verseSnippet: 'وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا ۖ وَذَرُوا الَّذِينَ يُلْحِدُونَ فِي أَسْمَائِهِ',
            keyMeaningAr: 'الأمر بالتوسل إلى الله ودعائه بأسمائه الحسنى الدالة على كمال رحمته وجلاله وعزته.',
            keyMeaningEn: 'Calling upon the Almighty by His most exalted Names reflecting mercy, majesty, and might.'
          },
          {
            surahNumber: 59,
            surahName: 'الحشر',
            ayahNumber: 23,
            verseSnippet: 'هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ ۚ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ',
            keyMeaningAr: 'آيات الحشر الجامعة لأسماء التنزيه والملك والسلام والأمان والعزة والجبروت المتعالي.',
            keyMeaningEn: 'Sublime attributes of holiness, peace, security, overpowering might, and supreme grandeur.'
          },
          {
            surahNumber: 42,
            surahName: 'الشورى',
            ayahNumber: 11,
            verseSnippet: 'لَيْسَ كَمِثْلِهِ شَيْءٌ ۖ وَهُوَ السَّمِيعُ الْبَصِيرُ',
            keyMeaningAr: 'القاعدة الكبرى في التنزيه: نفي المشابهة للمخلوقين مع إثبات السمع والبصر المطلقين لله.',
            keyMeaningEn: 'The supreme theological axiom: Nothing resembles Him whatsoever, while He is the All-Hearing, All-Seeing.'
          }
        ]
      },
      {
        id: 'tawakkul',
        titleAr: 'التوكل على الله وتفويض الأمور إليه',
        titleEn: 'Reliance on Allah & Supreme Trust',
        descriptionAr: 'صدق اعتماد القلب على الله في جلب المصالح ودفع المضار مع الأخذ الكامل بالأسباب المتاحة والرضا بحكمه وقضائه.',
        descriptionEn: 'Absolute trust of the heart in Allah for relief and provision, combined with taking active practical means.',
        verses: [
          {
            surahNumber: 65,
            surahName: 'الطلاق',
            ayahNumber: 3,
            verseSnippet: 'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا',
            keyMeaningAr: 'كفاية الله الشاملة لمن فوض أمره وتوكل بصدق، وفتح أبواب الفرج من وجوه لا تخطر على قلب بشر.',
            keyMeaningEn: 'Allah is completely sufficient for whoever relies upon Him, bringing boundless unexpected provision.'
          },
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 159,
            verseSnippet: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ',
            keyMeaningAr: 'التلازم الحاسم بين العزيمة واتخاذ القرار وبين التوكل على الله ونيل محبته ورضاه.',
            keyMeaningEn: 'The harmony between resolve, decisive action, and entrusting the outcome to Allah.'
          },
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 173,
            verseSnippet: 'الَّذِينَ قَالَ لَهُمُ النَّاسُ إِنَّ النَّاسَ قَدْ جَمَعُوا لَكُمْ فَاخْشَوْهُمْ فَزَادَهُمْ إِيمَانًا وَقَالُوا حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
            keyMeaningAr: 'حسبنا الله ونعم الوكيل: ملاذ المؤمنين في أوقات الشدائد وتآلب المخاوف ليتحول الخوف إلى سكينة ونصر.',
            keyMeaningEn: 'Saying "Allah is sufficient for us, and He is the best Disposer of affairs" transforms dread into divine victory.'
          }
        ]
      },
      {
        id: 'hereafter_qiyamah',
        titleAr: 'الإيمان باليوم الآخر والبعث والجزاء العادل',
        titleEn: 'The Hereafter, Resurrection & Accountability',
        descriptionAr: 'اليقين بالمعاد والوقوف بين يدي الله للحساب والميزان والجزاء، وأن الدنيا دار ابتلاء والخلود الحقيقي في دار الآخرة.',
        descriptionEn: 'Certainty in the resurrection, the divine scale of absolute justice, and that this earthly life is a test for eternity.',
        verses: [
          {
            surahNumber: 99,
            surahName: 'الزلزلة',
            ayahNumber: 7,
            verseSnippet: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ﴿٧﴾ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ ﴿٨﴾',
            keyMeaningAr: 'دقة الميزان الإلهي الذي لا يضيع فيه مثقال ذرة من خير أو شر مهما استصغره البشر.',
            keyMeaningEn: 'The flawless precision of the divine scale where not even an atom\'s weight of good or bad is overlooked.'
          },
          {
            surahNumber: 21,
            surahName: 'الأنبياء',
            ayahNumber: 47,
            verseSnippet: 'وَنَضَعُ الْمَوَازِينَ الْقِسْطَ لِيَوْمِ الْقِيَامَةِ فَلَا تُظْلَمُ نَفْسٌ شَيْئًا ۖ وَإِن كَانَ مِثْقَالَ حَبَّةٍ مِّنْ خَرْدَلٍ أَتَيْنَا بِهَا ۗ وَكَفَىٰ بِنَا حَاسِبِينَ',
            keyMeaningAr: 'العدل الرباني المطلق حيث تنتفي المظالم وتوزن الأعمال بحبة الخردل.',
            keyMeaningEn: 'Absolute divine justice established on the Day of Judgment without the slightest inequity.'
          },
          {
            surahNumber: 23,
            surahName: 'المؤمنون',
            ayahNumber: 115,
            verseSnippet: 'أَفَحَسِبْتُمْ أَنَّمَا خَلَقْنَاكُمْ عَبَثًا وَأَنَّكُمْ إِلَيْنَا لَا تُرْجَعُونَ',
            keyMeaningAr: 'حكمة الخلق الإلهي المنزه عن العبث واللهو، وتأكيد الرجوع الحتمي إلى الواحد القهار.',
            keyMeaningEn: 'Rebuking the assumption of purposeless creation and reiterating the certain return to the Sovereign Creator.'
          }
        ]
      },
      {
        id: 'jannah_bliss',
        titleAr: 'نعيم الجنة والخلود في رضوان الله',
        titleEn: 'Paradise & Everlasting Bliss',
        descriptionAr: 'وصف الدار الآخرة التي أعدها الله للمتقين؛ جنات تجري من تحتها الأنهار، وما فيها من قرة أعين ورؤية وجه الله الكريم.',
        descriptionEn: 'The celestial sanctuary prepared for the righteous: gardens beneath which rivers flow, unending peace, and divine contentment.',
        verses: [
          {
            surahNumber: 32,
            surahName: 'السجدة',
            ayahNumber: 17,
            verseSnippet: 'فَلَا تَعْلَمُ نَفْسٌ مَّا أُخْفِيَ لَهُم مِّن قُرَّةِ أَعْيُنٍ جَزَاءً بِمَا كَانُوا يَعْمَلُونَ',
            keyMeaningAr: 'عظمة النعيم المدخر الذي لا يخطر على قلب بشر جزاءً لما قدموه من طاعات في الخلوات.',
            keyMeaningEn: 'Unimaginable delight concealed by Allah as reward for sincere deeds done with devotion.'
          },
          {
            surahNumber: 55,
            surahName: 'الرحمن',
            ayahNumber: 46,
            verseSnippet: 'وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ',
            keyMeaningAr: 'مكافأة الخوف من الله واستشعار رقابته في الدنيا بجنتين عظيمتين ومراتب عليا.',
            keyMeaningEn: 'Whoever stands in reverence before the majesty of their Lord receives two bountiful gardens.'
          },
          {
            surahNumber: 10,
            surahName: 'يونس',
            ayahNumber: 26,
            verseSnippet: 'لِّلَّذِينَ أَحْسَنُوا الْحُسْنَىٰ وَزِيَادَةٌ ۖ وَلَا يَرْهَقُ وُجُوهَهُمْ قَتَرٌ وَلَا ذِلَّةٌ ۚ أُولَٰئِكَ أَصْحَابُ الْجَنَّةِ ۖ هُمْ فِيهَا خَالِدُونَ',
            keyMeaningAr: 'الحسنى هي الجنة، والزيادة هي النظر إلى وجه الله الكريم أعظم نعيم على الإطلاق.',
            keyMeaningEn: 'For the doers of good is the best reward (Paradise) and an increase—the joy of gazing upon the Divine Countenance.'
          }
        ]
      },
      {
        id: 'cosmic_miracles',
        titleAr: 'التفكر في خلق السماوات والأرض والآيات الكونية',
        titleEn: 'Cosmic Reflection & Signs in Creation',
        descriptionAr: 'دعوة القرآن المستمرة لإعمال العقل والتفكر في نظام الأفلاك والنجوم، والليل والنهار، ونشأة الحياة والماء وإحكام الصنعة.',
        descriptionEn: 'The Quranic imperative to contemplate the cosmic order, celestial mechanics, cycles of night and day, and biological wonders.',
        verses: [
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 190,
            verseSnippet: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ ﴿١٩٠﴾ الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ',
            keyMeaningAr: 'صفات أولي الألباب: الجمع المتواصل بين الفكر في عجائب الصنعة والذكر الخاشع للمولى.',
            keyMeaningEn: 'Men of understanding continually integrate cosmic contemplation with spiritual remembrance.'
          },
          {
            surahNumber: 51,
            surahName: 'الذاريات',
            ayahNumber: 20,
            verseSnippet: 'وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ ﴿٢٠﴾ وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ ﴿٢١﴾',
            keyMeaningAr: 'آيات الإعجاز في خلق النفس البشرية وتشريحها وأجهزة حياتها، وعجائب تضاريس الأرض ونباتها.',
            keyMeaningEn: 'Wonders in the earth and within your own biological makeup—will you not observe with insight?'
          },
          {
            surahNumber: 21,
            surahName: 'الأنبياء',
            ayahNumber: 30,
            verseSnippet: 'أَوَلَمْ يَرَ الَّذِينَ كَفَرُوا أَنَّ السَّمَاوَاتِ وَالْأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَاهُمَا ۖ وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ۖ أَفَلَا يُؤْمِنُونَ',
            keyMeaningAr: 'الإشارة المعجزة لانفتاق الكون وبدء الوجود، وجعل الماء العنصر الجوهري لكل حياة نابضة.',
            keyMeaningEn: 'The miraculous testament to cosmic separation and the foundation of all life upon water.'
          }
        ]
      },
      {
        id: 'qadar_hikmah',
        titleAr: 'الإيمان بالقضاء والقدر وحكمة التدبير الإلهي',
        titleEn: 'Divine Decree & Wisdom of Tests',
        descriptionAr: 'اليقين بأن ما أصاب العبد لم يكن ليخطئه، وأن أفعال الله كلها دائرة بين العدل والفضل والرحمة، وعواقب الأمور كلها بيده.',
        descriptionEn: 'Certainty in Allah\'s timeless wisdom, knowing that what reaches man could never miss him, and all events unfold by profound divine decree.',
        verses: [
          {
            surahNumber: 57,
            surahName: 'الحديد',
            ayahNumber: 22,
            verseSnippet: 'مَا أَصَابَ مِن مُّصِيبَةٍ فِي الْأَرْضِ وَلَا فِي أَنفُسِكُمْ إِلَّا فِي كِتَابٍ مِّن قَبْلِ أَن نَّبْرَأَهَا ۚ إِنَّ ذَٰلِكَ عَلَى اللَّهِ يَسِيرٌ ﴿٢٢﴾ لِّكَيْلَا تَأْسَوْا عَلَىٰ مَا فَاتَكُمْ وَلَا تَفْرَحُوا بِمَا آتَاكُمْ',
            keyMeaningAr: 'الراحة النفسية العظمى في استشعار القضاء والقدر؛ فلا حسرة تقتل النفس على ما فات، ولا بطر وطغيان بما جاء.',
            keyMeaningEn: 'Supreme psychological peace in the divine decree: avoiding debilitating sorrow over the past and vain arrogance over favors.'
          },
          {
            surahNumber: 64,
            surahName: 'التغابن',
            ayahNumber: 11,
            verseSnippet: 'مَا أَصَابَ مِن مُّصِيبَةٍ إِلَّا بِإِذْنِ اللَّهِ ۗ وَمَن يُؤْمِن بِاللَّهِ يَهْدِ قَلْبَهُ ۚ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ',
            keyMeaningAr: 'من رضي بقضاء الله وعلم أنه من ربه، هدى الله قلبه للسكينة واليقين عند نزول الشدائد.',
            keyMeaningEn: 'No disaster strikes except by permission of Allah; and whoever believes in Allah, He guides their heart to serenity.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 2. الأخلاق والقيم الإنسانية
  // ==========================================
  {
    id: 'akhlaq',
    nameAr: 'الأخلاق والقيم الإنسانية',
    nameEn: 'Ethics, Morals & Human Values',
    concepts: [
      {
        id: 'sabr',
        titleAr: 'الصبر والاحتساب والرضا عند البلاء',
        titleEn: 'Patience, Fortitude & Trials',
        descriptionAr: 'حبس النفس عن الجزع واللسان عن الشكوى، والثبات على طاعة الله، والصبر على أقداره المؤلمة ثقةً في حكمته ولطفه وبشاراته.',
        descriptionEn: 'Restraining the soul from despair, persevering in obedience, enduring adversity with dignity, and holding unyielding hope in divine reward.',
        verses: [
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 155,
            verseSnippet: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ ﴿١٥٥﴾ الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
            keyMeaningAr: 'البشارة الإلهية للصابرين بالصلوات والرحمة والهداية عند استقبال المصائب بالاسترجاع (إنا لله وإنا إليه راجعون).',
            keyMeaningEn: 'Divine glad tidings of mercy and guidance to those who face loss and fear with profound surrender to Allah.'
          },
          {
            surahNumber: 39,
            surahName: 'الزمر',
            ayahNumber: 10,
            verseSnippet: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ',
            keyMeaningAr: 'عظم أجر الصابرين المنهمر بغير كيل ولا ميزان، جزاء كظمهم للألم ورضاهم بالمقدور.',
            keyMeaningEn: 'The patient will surely be given their reward in full without measure or limit.'
          },
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 153,
            verseSnippet: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
            keyMeaningAr: 'معية الله الخاصة للصابرين وتثبيته لهم، واعتبار الصلاة والصبر أعظم سلاحين لمواجهة أعباء الحياة.',
            keyMeaningEn: 'Seeking divine aid through perseverance and prayer, with Allah being closely with the patient.'
          },
          {
            surahNumber: 94,
            surahName: 'الشرح',
            ayahNumber: 5,
            verseSnippet: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿٥﴾ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿٦﴾',
            keyMeaningAr: 'القانون الرباني الثابت: لا يغلب عسر يسرين، والفرج يولد دائماً من رحم الشدة المطبقة.',
            keyMeaningEn: 'The immutable divine promise: with every hardship comes profound ease and relief.'
          },
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 200,
            verseSnippet: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ',
            keyMeaningAr: 'مراتب المجاهدة: الصبر في النفس، والمصابرة في مواجهة التحديات، والمرابطة على الحق، وملازمة التقوى.',
            keyMeaningEn: 'Ascending ranks of fortitude: endure, outdo in patience, remain steadfastly bonded, and fear Allah to prosper.'
          }
        ]
      },
      {
        id: 'walidayn',
        titleAr: 'بر الوالدين والإحسان المطلق إليهما',
        titleEn: 'Filial Piety & Excellence to Parents',
        descriptionAr: 'من أقدس الواجبات التي قرنها الله بتوحيده؛ خفض جناح الذل لهما، وحسن صحبتهما، والدعاء لهما بالرحمة أحياءً وأمواتاً.',
        descriptionEn: 'One of the most sacred duties in the Quran, paired alongside monotheism: lowering wings of humility, cherishing parents, and constant prayer.',
        verses: [
          {
            surahNumber: 17,
            surahName: 'الإسراء',
            ayahNumber: 23,
            verseSnippet: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا',
            keyMeaningAr: 'اقتران التوحيد ببر الوالدين، وتحريم أدنى كلمة تذمر (أف)، والتأكيد على القول الكريم عند بلوغهما الكبر.',
            keyMeaningEn: 'Pairing monotheism with honoring parents; strictly forbidding even a sigh of irritation ("Uff") to elderly parents.'
          },
          {
            surahNumber: 17,
            surahName: 'الإسراء',
            ayahNumber: 24,
            verseSnippet: 'وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
            keyMeaningAr: 'التذلل الرحيم للوالدين واستحضار فضلهما في التربية، والدعاء الدائم لهما بالرحمة الإلهية.',
            keyMeaningEn: 'Lowering the wing of humility through tenderness, supplicating: "My Lord, have mercy upon them as they brought me up when I was small."'
          },
          {
            surahNumber: 31,
            surahName: 'لقمان',
            ayahNumber: 14,
            verseSnippet: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَالُهُ فِي عَامَيْنِ أَنِ اشْكُرْ لِي وَلِوَالِدَيْكَ إِلَيَّ الْمَصِيرُ',
            keyMeaningAr: 'تذكير بجهد الأم وتعبها في الحمل والرضاع، وربط شكر الله الخالق بشكر الوالدين المنفقين جهدهما.',
            keyMeaningEn: 'Acknowledging mother\'s pain of gestation and nursing, conjoining gratitude to Allah with gratitude to parents.'
          },
          {
            surahNumber: 46,
            surahName: 'الأحقاف',
            ayahNumber: 15,
            verseSnippet: 'حَتَّىٰ إِذَا بَلَغَ أَشُدَّهُ وَبَلَغَ أَرْبَعِينَ سَنَةً قَالَ رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ',
            keyMeaningAr: 'دعاء النضج عند سن الأربعين: الشكر لنعم الله على النفس والوالدين، وطلب صلاح الذرية.',
            keyMeaningEn: 'The mature prayer at forty: praying to be grateful for favors upon oneself and parents, seeking righteous offspring.'
          }
        ]
      },
      {
        id: 'silat_arham',
        titleAr: 'صلة الأرحام والإحسان إلى ذوي القربى',
        titleEn: 'Kinship Ties & Caring for Relatives',
        descriptionAr: 'تعظيم شأن الرحم المشتق اسمها من اسم الرحمن، والتحذير من قطيعتها، وبذل الإحسان والصلة بالقول والمال والمواساة.',
        descriptionEn: 'Venerating kinship derived from Ar-Rahman\'s divine name, warning against severance, and extending financial and emotional solidarity.',
        verses: [
          {
            surahNumber: 4,
            surahName: 'النساء',
            ayahNumber: 1,
            verseSnippet: 'وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ ۚ إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا',
            keyMeaningAr: 'اقتران تقوى الله برعاية الأرحام في افتتاحية سورة النساء لبيان حرمتها العظمى.',
            keyMeaningEn: 'Coupling the fear of Allah with guarding kinship ties in the opening of Surah An-Nisaa.'
          },
          {
            surahNumber: 47,
            surahName: 'محمد',
            ayahNumber: 22,
            verseSnippet: 'فَهَلْ عَسَيْتُمْ إِن تَوَلَّيْتُمْ أَن تُفْسِدُوا فِي الْأَرْضِ وَتُقَطِّعُوا أَرْحَامَكُمْ ﴿٢٢﴾ أُولَٰئِكَ الَّذِينَ لَعَنَهُمُ اللَّهُ فَأَصَمَّهُمْ وَأَعْمَىٰ أَبْصَارَهُمْ',
            keyMeaningAr: 'التحذير القرآني الصارم من الإفساد في الأرض وقطيعة الأرحام وعواقبها الوخيمة.',
            keyMeaningEn: 'Stern Quranic warning against spreading corruption on earth and severing bonds of kinship.'
          }
        ]
      },
      {
        id: 'sidq_amanah',
        titleAr: 'الصدق والأمانة والوفاء بالعهود',
        titleEn: 'Truthfulness, Integrity & Keeping Covenants',
        descriptionAr: 'عماد الأخلاق الإسلامية، مطابقة الظاهر للباطن، وحفظ ودائع الناس وحقوقهم، والوفاء بالمواثيق الدينية والإنسانية.',
        descriptionEn: 'The pillars of Islamic character: unwavering truthfulness, safeguarding trusts, and honoring agreements diligently.',
        verses: [
          {
            surahNumber: 9,
            surahName: 'التوبة',
            ayahNumber: 119,
            verseSnippet: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ',
            keyMeaningAr: 'الأمر بلزوم الصدق في القول والعمل ومصاحبة أهل الصدق لنيل معية الله ورضوانه.',
            keyMeaningEn: 'O believers, be conscious of Allah and accompany those who are truthful in word and deed.'
          },
          {
            surahNumber: 4,
            surahName: 'النساء',
            ayahNumber: 58,
            verseSnippet: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ ۚ إِنَّ اللَّهَ نِعِمَّا يَعِظُكُم بِهِ',
            keyMeaningAr: 'الأمر القطعي بأداء جميع الأمانات لأصحابها وإقامة العدل بين سائر الناس دون محاباة.',
            keyMeaningEn: 'Indeed, Allah commands you to render trusts to whom they belong and judge between people with justice.'
          },
          {
            surahNumber: 17,
            surahName: 'الإسراء',
            ayahNumber: 34,
            verseSnippet: 'وَأَوْفُوا بِالْعَهْدِ ۖ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا',
            keyMeaningAr: 'مسؤولية العهد والميثاق أمام الله، وأنه سيسأل العبد عن كل عهد قطعه على نفسه.',
            keyMeaningEn: 'Fulfill every covenant, for covenants will surely be questioned on the Day of Judgment.'
          }
        ]
      },
      {
        id: 'adl_inssaf',
        titleAr: 'العدل والقسط والشهادة بالحق',
        titleEn: 'Justice, Equity & Standing for Truth',
        descriptionAr: 'الميزان الذي قامت عليه السماوات والأرض؛ إعطاء كل ذي حق حقه دون تفريق بين قريب وغريب أو مسلم وغير مسلم.',
        descriptionEn: 'The cosmic foundation of order: upholding absolute justice and impartial truth, even against oneself or loved ones.',
        verses: [
          {
            surahNumber: 4,
            surahName: 'النساء',
            ayahNumber: 135,
            verseSnippet: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ بِالْقِسْطِ شُهَدَاءَ لِلَّهِ وَلَوْ عَلَىٰ أَنفُسِكُمْ أَوِ الْوَالِدَيْنِ وَالأَقْرَبِينَ ۚ إِن يَكُنْ غَنِيًّا أَوْ فَقِيرًا فَاللَّهُ أَوْلَىٰ بِهِمَا',
            keyMeaningAr: 'القيام بالعدل المطلق لوجه الله ولو كانت الشهادة ضد مصلحة النفس أو الوالدين أو ذوي القربى.',
            keyMeaningEn: 'Stand firmly for justice as witnesses to Allah, even if it be against yourselves, parents, or close relatives.'
          },
          {
            surahNumber: 5,
            surahName: 'المائدة',
            ayahNumber: 8,
            verseSnippet: 'وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا ۚ اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ ۖ وَاتَّقُوا اللَّهَ',
            keyMeaningAr: 'النهي عن الظلم حتى مع الخصوم والأعداء؛ فالعدالة واجبة مع من نحب ومن نبغض على السواء.',
            keyMeaningEn: 'Do not let hatred of a people lead you toward injustice. Be just; that is closest to righteousness.'
          },
          {
            surahNumber: 16,
            surahName: 'النحل',
            ayahNumber: 90,
            verseSnippet: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ وَيَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ وَالْبَغْيِ ۚ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ',
            keyMeaningAr: 'الآية الجامعة لأصول الفضائل الإنسانية: العدل والإحسان وصلة الرحم ونبذ الفحشاء والبغي.',
            keyMeaningEn: 'The comprehensive verse commanding justice, excellence, charity to relatives, and forbidding wickedness and oppression.'
          }
        ]
      },
      {
        id: 'afw_safh',
        titleAr: 'العفو والصفح وكظم الغيظ ومقابلة الإساءة بالإحسان',
        titleEn: 'Forgiveness, Clemency & Overcoming Anger',
        descriptionAr: 'قمة النبل الأخلاقي؛ التسامح والتجاوز عن أخطاء الآخرين مع القدرة على الانتقام، ودفع السيئة بالحسنة لإصلاح القلوب.',
        descriptionEn: 'The pinnacle of noble character: forgiving others when able to retaliate, subduing wrath, and returning bad with good.',
        verses: [
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 134,
            verseSnippet: 'الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
            keyMeaningAr: 'من أعظم صفات المتقين أصحاب الجنة: كظم الغيظ، والعفو التام عن الناس، ومحبة الله للمحسنين.',
            keyMeaningEn: 'Hallmarks of the righteous: restraining fury, pardoning people graciously, and earning Allah\'s love.'
          },
          {
            surahNumber: 41,
            surahName: 'فصلت',
            ayahNumber: 34,
            verseSnippet: 'وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ',
            keyMeaningAr: 'الإستراتيجية الأخلاقية لتحويل العداوات إلى صداقات حميمة بمقابلة السوء بالإحسان واللين.',
            keyMeaningEn: 'Repelling evil with that which is superior turns bitter enmity into affectionate friendship.'
          },
          {
            surahNumber: 42,
            surahName: 'الشورى',
            ayahNumber: 40,
            verseSnippet: 'وَجَزَاءُ سَيِّئَةٍ سَيِّئَةٌ مِّثْلُهَا ۖ فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُ عَلَى اللَّهِ ۚ إِنَّهُ لَا يُحِبُّ الظَّالِمِينَ',
            keyMeaningAr: 'الأجر غير المحدود لمن آثر العفو والإصلاح، حيث تكفل الله سبحانه بمكافأته بذاته الكريمة.',
            keyMeaningEn: 'Whoever pardons and reconciles, his immense reward is directly upon Allah.'
          }
        ]
      },
      {
        id: 'tawadu',
        titleAr: 'التواضع ولين الجانب واجتناب الكبر والخيلاء',
        titleEn: 'Humility, Gentleness & Shunning Pride',
        descriptionAr: 'خفض الجناح للمؤمنين والمشي على الأرض بسكينة ووقار، واجتناب الغرور والتعالي على عباد الله بنسب أو مال أو علم.',
        descriptionEn: 'Gentleness of spirit, walking with dignity without arrogance, and recognizing that all excellence belongs to Allah.',
        verses: [
          {
            surahNumber: 25,
            surahName: 'الفرقان',
            ayahNumber: 63,
            verseSnippet: 'وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا وَإِذَا خَاطَبَهُمُ الْجَاهِلُونَ قَالُوا سَلَامًا',
            keyMeaningAr: 'أولى صفات عباد الرحمن: التواضع والسكينة في المشي، والترفع عن مجاراة الجاهلين بالسفاهة.',
            keyMeaningEn: 'The servants of the Most Merciful walk gently upon the earth, replying with peace to the insolent.'
          },
          {
            surahNumber: 31,
            surahName: 'لقمان',
            ayahNumber: 18,
            verseSnippet: 'وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا ۖ إِنَّ اللَّهَ لَا يُحِبُّ كُلَّ مُخْتَالٍ فَخُورٍ',
            keyMeaningAr: 'وصايا لقمان: النهي عن إمالة الوجه تكبراً على الناس، والنهي عن مشية التباهي والخيلاء.',
            keyMeaningEn: 'Luqman\'s counsel: Do not turn your cheek away from people in contempt, nor walk strutting with pride.'
          },
          {
            surahNumber: 17,
            surahName: 'الإسراء',
            ayahNumber: 37,
            verseSnippet: 'وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا ۖ إِنَّكَ لَن تَخْرِقَ الْأَرْضَ وَلَن تَبْلُغَ الْجِبَالَ طُولًا',
            keyMeaningAr: 'بيان ضعف الإنسان وعجزه؛ فلن يخرق الأرض بكبره ولن يطاول الجبال، فما أولاه بالتواضع.',
            keyMeaningEn: 'Human limitation: You cannot tear the earth open nor rival mountains in height, so remain humble.'
          }
        ]
      },
      {
        id: 'hifz_lisan',
        titleAr: 'حفظ اللسان والنهي عن الغيبة والنميمة والسخرية',
        titleEn: 'Guarding the Tongue & Rejecting Slander',
        descriptionAr: 'صيانة اللفظ من الباطل، واجتناب السخرية من الناس، والابتعاد عن التجسس واغتياب الغائبين وظن السوء وتتبع العورات.',
        descriptionEn: 'Preserving speech from vanity and malice, forbidding mockery, suspicion, spying, and eating the flesh of others through backbiting.',
        verses: [
          {
            surahNumber: 49,
            surahName: 'الحجرات',
            ayahNumber: 11,
            verseSnippet: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا يَسْخَرْ قَوْمٌ مِّن قَوْمٍ عَسَىٰ أَن يَكُونُوا خَيْرًا مِّنْهُمْ وَلَا نِسَاءٌ مِّن نِّسَاءٍ عَسَىٰ أَن يَكُنَّ خَيْرًا مِّنْهُنَّ',
            keyMeaningAr: 'حرمة السخرية والتنابز بالألقاب، وتذكير بأن من نسخر منه قد يكون أكرم عند الله وأرفع منزلة.',
            keyMeaningEn: 'Prohibiting ridicule and offensive nicknames; the mocked might be far superior in the sight of Allah.'
          },
          {
            surahNumber: 49,
            surahName: 'الحجرات',
            ayahNumber: 12,
            verseSnippet: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ ۖ وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَن يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ',
            keyMeaningAr: 'تحريم الغيبة والتمثيل البليغ المقزز لها بأكل لحم الأخ ميتاً، والنهي الحازم عن التجسس وظن السوء.',
            keyMeaningEn: 'Forbidding suspicion, espionage, and depicting backbiting as eating the dead flesh of one\'s brother.'
          },
          {
            surahNumber: 50,
            surahName: 'ق',
            ayahNumber: 18,
            verseSnippet: 'مَّا يَلْفِظُ مِن قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ',
            keyMeaningAr: 'الرقابة الملائكية التامة على كل كلمة تخرج من اللسان وتسجيلها في صحيفة الأعمال.',
            keyMeaningEn: 'Every uttered word is recorded meticulously by vigilant, ready angel witnesses.'
          }
        ]
      },
      {
        id: 'haya_iffah',
        titleAr: 'الحياء والعفة وغض البصر وصيانة الحرمات',
        titleEn: 'Modesty, Chastity & Guarding Sight',
        descriptionAr: 'خلق الإسلام الرفيع في صيانة الطهارة القلبية والجسدية، وغض البصر عن المحارم، وحفظ الفروج، ولباس التقوى والستر.',
        descriptionEn: 'The hallmark virtue of Islam: shielding heart and body in pristine purity, lowering gaze, and adorning oneself with modesty.',
        verses: [
          {
            surahNumber: 24,
            surahName: 'النور',
            ayahNumber: 30,
            verseSnippet: 'قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ ۗ إِنَّ اللَّهَ خَبِيرٌ بِمَا يَصْنَعُونَ',
            keyMeaningAr: 'غض البصر هو الحصن الأكبر للعفة وطهارة القلب وسلامة المجتمع من الفتن.',
            keyMeaningEn: 'Directing believers to lower gaze and guard chastity as the purest spiritual shield.'
          },
          {
            surahNumber: 23,
            surahName: 'المؤمنون',
            ayahNumber: 5,
            verseSnippet: 'وَالَّذِينَ هُمْ لِفُرُوجِهِمْ حَافِظُونَ ﴿٥﴾ إِلَّا عَلَىٰ أَزْوَاجِهِمْ أَوْ مَا مَلَكَتْ أَيْمَانُهُمْ فَإِنَّهُمْ غَيْرُ مَلُومِينَ',
            keyMeaningAr: 'حفظ الفرج وعفته من أبرز معالم المؤمنين المفلحين الوارثين للفردوس الأعلى.',
            keyMeaningEn: 'Safeguarding sexual integrity as a defining quality of the inheritors of the highest Paradise.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 3. قصص الأنبياء والرسل والعبر
  // ==========================================
  {
    id: 'anbiya',
    nameAr: 'قصص الأنبياء والرسل والعبر',
    nameEn: 'Stories of Prophets & Lessons',
    concepts: [
      {
        id: 'adam',
        titleAr: 'آدم عليه السلام: بداية الخلق والتوبة والاستخلاف',
        titleEn: 'Adam (Pbuh) - Creation, Repentance & Stewardship',
        descriptionAr: 'قصة خلق الإنسان الأول ونفخ الروح، وسجود الملائكة وإباء إبليس واستكباره، ثم الخطيئة والتوبة والتعليم الإلهي والاستخلاف في الأرض.',
        descriptionEn: 'The creation of mankind, angelic prostration, Iblees\'s arrogance, the descent, and pristine divine repentance.',
        verses: [
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 30,
            verseSnippet: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً ۖ قَالُوا أَتَجْعَلُ فِيهَا مَن يُفْسِدُ فِيهَا وَيَسْفِكُ الدِّمَاءَ وَنَحْنُ نُسَبِّحُ بِحَمْدِكَ وَنُقَدِّسُ لَكَ ۖ قَالَ إِنِّي أَعْلَمُ مَا لَا تَعْلَمُونَ',
            keyMeaningAr: 'إعلان استخلاف الإنسان في الأرض لعمارة الكون وإقامة شريعة العدل والتوحيد بالعلم والمسؤولية.',
            keyMeaningEn: 'The divine declaration appointing humanity as stewards to build the earth with justice, knowledge, and piety.'
          },
          {
            surahNumber: 7,
            surahName: 'الأعراف',
            ayahNumber: 23,
            verseSnippet: 'قَالَا رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
            keyMeaningAr: 'دعاء آدم وحواء المعلم للبشرية في الاعتراف بالذنب والمسارعة إلى التوبة وطلب المغفرة والرحمة.',
            keyMeaningEn: 'Adam and Eve\'s foundational supplication of repentance, acknowledging human frailty and seeking mercy.'
          },
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 37,
            verseSnippet: 'فَتَلَقَّىٰ آدَمُ مِن رَّبِّهِ كَلِمَاتٍ فَتَابَ عَلَيْهِ ۚ إِنَّهُ هُوَ التَّوَّابُ الرَّحِيمُ',
            keyMeaningAr: 'تفضل الله بتلقين آدم كلمات التوبة وقبولها فوراً، لبيان سعة باب التوبة لكل بني آدم.',
            keyMeaningEn: 'Allah taught Adam words of repentance and graciously turned to him, illustrating eternal divine forgiveness.'
          }
        ]
      },
      {
        id: 'nuh',
        titleAr: 'نوح عليه السلام: شيخ المرسلين والصبر ألف عام',
        titleEn: 'Noah (Pbuh) - Millennial Perseverance & The Ark',
        descriptionAr: 'أول أولي العزم من الرسل، قضى 950 عاماً في الدعوة ليلاً ونهاراً سراً وعلانية، وبناء السفينة بأمر الله والنجاة من الطوفان العظيم.',
        descriptionEn: 'The master of persistence who invited his people for 950 years with boundless patience until building the Ark of Salvation.',
        verses: [
          {
            surahNumber: 71,
            surahName: 'نوح',
            ayahNumber: 5,
            verseSnippet: 'قَالَ رَبِّ إِنِّي دَعَوْتُ قَوْمِي لَيْلًا وَنَهَارًا ﴿٥﴾ فَلَمْ يَزِدْهُمْ دُعَائِي إِلَّا فِرَارًا ﴿٦﴾ وَإِنِّي كُلَّمَا دَعَوْتُهُمْ لِتَغْفِرَ لَهُمْ جَعَلُوا أَصَابِعَهُمْ فِي آذَانِهِمْ وَاسْتَغْشَوْا ثِيَابَهُمْ',
            keyMeaningAr: 'المثابرة الدعوية المتواصلة في كل الأوقات والأساليب رغم إعراض القوم وعنادهم المستكبر.',
            keyMeaningEn: 'Unyielding perseverance in guiding people through all seasons despite persistent defiance.'
          },
          {
            surahNumber: 11,
            surahName: 'هود',
            ayahNumber: 41,
            verseSnippet: 'وَقَالَ ارْكَبُوا فِيهَا بِسْمِ اللَّهِ مَجْرَاهَا وَمُرْسَاهَا ۚ إِنَّ رَبِّي لَغَفُورٌ رَّحِيمٌ',
            keyMeaningAr: 'التوكل التام وربط النجاة والحركة والسكون باسم الله في خضم الطوفان الهادر.',
            keyMeaningEn: 'Embarking with absolute reliance upon Allah: in His Name is its sailing and its mooring.'
          },
          {
            surahNumber: 29,
            surahName: 'العنكبوت',
            ayahNumber: 14,
            verseSnippet: 'وَلَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ فَلَبِثَ فِيهِمْ أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا فَأَخَذَهُمُ الطُّوفَانُ وَهُمْ ظَالِمُونَ',
            keyMeaningAr: 'الصبر الملحمي لنوح عليه السلام قرابة ألف عام في مواجهة التكذيب والاستهزاء دون كلل.',
            keyMeaningEn: 'Noah\'s legendary endurance through 950 years of relentless guidance against all ridicule.'
          }
        ]
      },
      {
        id: 'hud_salih',
        titleAr: 'هود وصالح عليهما السلام: عاد وثمود ومصير الطغيان',
        titleEn: 'Hud & Salih (Pbuh) - Ancient Civilizations & Divine Law',
        descriptionAr: 'قصتا عاد ذات العماد التي لم يُخلق مثلها في البلاد، وثمود الذين جابوا الصخر بالواد والناقة المعجزة؛ وكيف هلكوا بالاغترار بالقوة.',
        descriptionEn: 'The narratives of Hud to towering Ad and Salih to Thamud who carved rocks into palaces, destroyed by delusions of grandeur.',
        verses: [
          {
            surahNumber: 89,
            surahName: 'الفجر',
            ayahNumber: 6,
            verseSnippet: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِعَادٍ ﴿٦﴾ إِرَمَ ذَاتِ الْعِمَادِ ﴿٧﴾ الَّتِي لَمْ يُخْلَقْ مِثْلُهَا فِي الْبِلَادِ ﴿٨﴾ وَثَمُودَ الَّذِينَ جَابُوا الصَّخْرَ بِالْوَادِ',
            keyMeaningAr: 'العبرة التاريخية الكبرى: عظمة الحضارات العمرانية والقوة المادية لا تغني شيئاً عند كفران نعم الله وبغي الظالمين.',
            keyMeaningEn: 'Monumental architectural and military prowess never avails when nations sink into tyranny and ingratitude.'
          },
          {
            surahNumber: 26,
            surahName: 'الشعراء',
            ayahNumber: 128,
            verseSnippet: 'أَتَبْنُونَ بِكُلِّ رِيعٍ آيَةً تَعْبَثُونَ ﴿١٢٨﴾ وَتَتَّخِذُونَ مَصَانِعَ لَعَلَّكُمْ تَخْلُدُونَ ﴿١٢٩﴾ وَإِذَا بَطَشْتُم بَطَشْتُمْ جَبَّارِينَ',
            keyMeaningAr: 'نداء هود لقومه محذراً من العبث بالثروات والبطش الجائر والتعلق الكاذب بالخلود الدنيوي.',
            keyMeaningEn: 'Hud\'s warning against wasteful vanity projects, brutal oppression, and false delusions of worldly eternity.'
          }
        ]
      },
      {
        id: 'ibrahim',
        titleAr: 'إبراهيم وإسماعيل عليهما السلام: خليل الرحمن وبناء البيت وفداء الذبيح',
        titleEn: 'Abraham & Ishmael (Pbuh) - Devotion, Sacrifice & The Kaaba',
        descriptionAr: 'إمام الحنفاء الذي واجه الشرك بالحجة والبرهان، وابتُلي بالنار وذبح الولد فوفّى وسلّم، وبنى مع ابنه إسماعيل الكعبة المشرفة في مكة.',
        descriptionEn: 'The patriarch of pure faith who triumphed in supreme tests, survived the fire, and built the Holy Sanctuary alongside Ishmael.',
        verses: [
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 124,
            verseSnippet: 'وَإِذِ ابْتَلَىٰ إِبْرَاهِيمَ رَبُّهُ بِكَلِمَاتٍ فَأَتَمَّهُنَّ ۖ قَالَ إِنِّي جَاعِلُكَ لِلنَّاسِ إِمَامًا ۖ قَالَ وَمِن ذُرِّيَّتِي ۖ قَالَ لَا يَنَالُ عَهْدِي الظَّالِمِينَ',
            keyMeaningAr: 'نيل مرتبة الإمامة بالوفاء في الابتلاءات والامتثال المطلق لأوامر الله تعالى، وحرمان الظالمين منها.',
            keyMeaningEn: 'Leadership in faith is earned by fulfilling divine commandments and triumphing over severe trials.'
          },
          {
            surahNumber: 21,
            surahName: 'الأنبياء',
            ayahNumber: 69,
            verseSnippet: 'قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ ﴿٦٩﴾ وَأَرَادُوا بِهِ كَيْدًا فَجَعَلْنَاهُمُ الْأَخْسَرِينَ',
            keyMeaningAr: 'قدرة الله الحاكمة على قوانين الطبيعة؛ فجعل النار المحرقة برداً وسلاماً على خليله المخلص.',
            keyMeaningEn: 'Divine command transcending natural physics: making raging flames cool and safe for Abraham.'
          },
          {
            surahNumber: 37,
            surahName: 'الصافات',
            ayahNumber: 102,
            verseSnippet: 'قَالَ يَا بُنَيَّ إِنِّي أَرَىٰ فِي الْمَنَامِ أَنِّي أَذْبَحُكَ فَانظُرْ مَاذَا تَرَىٰ ۚ قَالَ يَا أَبَتِ افْعَلْ مَا تُؤْمَرُ ۖ سَتَجِدُنِي إِن شَاءَ اللَّهُ مِنَ الصَّابِرِينَ ﴿١٠٢﴾ فَلَمَّا أَسْلَمَا وَتَلَّهُ لِلْجَبِينِ ﴿١٠٣﴾ وَنَادَيْنَاهُ أَن يَا إِبْرَاهِيمُ ﴿١٠٤﴾ قَدْ صَدَّقْتَ الرُّؤْيَا',
            keyMeaningAr: 'قمة الاستسلام والامتثال لأمر الله من الوالد والولد، فكان الفداء العظيم وسنة الأضحية الخالدة.',
            keyMeaningEn: 'The ultimate pinnacle of surrender from father and son, rewarded with a magnificent redemption.'
          },
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 127,
            verseSnippet: 'وَإِذْ يَرْفَعُ إِبْرَاهِيمُ الْقَوَاعِدَ مِنَ الْبَيْتِ وَإِسْمَاعِيلُ رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
            keyMeaningAr: 'بناء البيت العتيق بمكة والضراعة بالقبول رغم عظم العمل وإخلاص النية.',
            keyMeaningEn: 'Raising the foundations of the Kaaba, demonstrating immense humility by begging for divine acceptance.'
          }
        ]
      },
      {
        id: 'yusuf',
        titleAr: 'يوسف عليه السلام: أحسن القصص من الجب إلى ملك مصر',
        titleEn: 'Joseph (Pbuh) - From Pit to Throne & Pure Chastity',
        descriptionAr: 'ملحمة الصبر والعفة واليقين؛ من غيرة الإخوة والإلقاء في البئر والافتراء في السجن، إلى السيادة والتمكين والصفح الجميل.',
        descriptionEn: 'The most captivating story of destiny, chastity, prison trials, and divine elevation crowned with graceful pardon.',
        verses: [
          {
            surahNumber: 12,
            surahName: 'يوسف',
            ayahNumber: 23,
            verseSnippet: 'وَرَاوَدَتْهُ الَّتِي هُوَ فِي بَيْتِهَا عَن نَّفْسِهِ وَغَلَّقَتِ الْأَبْوَابَ وَقَالَتْ هَيْتَ لَكَ ۚ قَالَ مَعَاذَ اللَّهِ ۖ إِنَّهُ رَبِّي أَحْسَنَ مَثْوَايَ ۖ إِنَّهُ لَا يُفْلِحُ الظَّالِمُونَ',
            keyMeaningAr: 'العفة الصادقة والاعتصام بالله في أشد لحظات الفتنة والخلوة بقوله الحاسم: (معاذ الله).',
            keyMeaningEn: 'Unshakable chastity and seeking sanctuary in Allah during moments of immense temptation: "I seek refuge in Allah."'
          },
          {
            surahNumber: 12,
            surahName: 'يوسف',
            ayahNumber: 90,
            verseSnippet: 'قَالُوا أَإِنَّكَ لَأَنتَ يُوسُفُ ۖ قَالَ أَنَا يُوسُفُ وَهَٰذَا أَخِي ۖ قَدْ مَنَّ اللَّهُ عَلَيْنَا ۖ إِنَّهُ مَن يَتَّقِ وَيَصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ',
            keyMeaningAr: 'الخلاصة الكبرى لقصة يوسف: قانون التقوى والصبر الذي يقود حتماً للظفر وحفظ الأجر.',
            keyMeaningEn: 'The golden core of Joseph\'s odyssey: whoever fears Allah and remains patient, Allah never loses the reward of the righteous.'
          },
          {
            surahNumber: 12,
            surahName: 'يوسف',
            ayahNumber: 92,
            verseSnippet: 'قَالَ لَا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ ۖ يَغْفِرُ اللَّهُ لَكُمْ ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ',
            keyMeaningAr: 'أسمى درجات العفو عند المقدرة والصفح عن الإخوة الذين حاولوا قتله وإبعاده.',
            keyMeaningEn: 'Sublime forgiveness at the summit of power: "No blame will there be upon you today; Allah will forgive you."'
          },
          {
            surahNumber: 12,
            surahName: 'يوسف',
            ayahNumber: 100,
            verseSnippet: 'إِنَّ رَبِّي لَطِيفٌ لِّمَا يَشَاءُ ۚ إِنَّهُ هُوَ الْعَلِيمُ الْحَكِيمُ',
            keyMeaningAr: 'لطف الله الخفي في نسج الأقدار؛ فالمحن الشديدة كانت سلالم ارتقاء للمجد والتمكين.',
            keyMeaningEn: 'Subtle divine orchestration: the harshest trials were secret stepping stones to supreme elevation.'
          }
        ]
      },
      {
        id: 'musa',
        titleAr: 'موسى وهارون عليهما السلام: مواجهة الطغيان ورحلة الخضر',
        titleEn: 'Moses & Aaron (Pbuh) - Confronting Tyranny & Unseen Wisdom',
        descriptionAr: 'كليم الله الذي ولد في عام الذبح، وربّي في قصر فرعون، وواجه أعتى طواغيت الأرض بالحجة والمعجزات، وانفلق له البحر، وتعلم من الخضر.',
        descriptionEn: 'The Messenger who spoke directly to Allah, confronted Pharaoh\'s tyranny, parted the Red Sea, and sought esoteric wisdom with Al-Khidr.',
        verses: [
          {
            surahNumber: 20,
            surahName: 'طه',
            ayahNumber: 46,
            verseSnippet: 'قَالَ لَا تَخَافَا ۖ إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ',
            keyMeaningAr: 'المعية الربانية المطلقة التي تزيل كل خوف من قلب الداعية في مواجهة الطغاة.',
            keyMeaningEn: 'Absolute reassurance when confronting tyrants: "Fear not, for I am with you both, hearing and seeing."'
          },
          {
            surahNumber: 26,
            surahName: 'الشعراء',
            ayahNumber: 62,
            verseSnippet: 'قَالَ كَلَّا ۖ إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ ﴿٦٢﴾ فَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنِ اضْرِب بِّعَصَاكَ الْبَحْرَ ۖ فَانفَلَقَ فَكَانَ كُلُّ فِرْقٍ كَالطَّوْدِ الْعَظِيمِ',
            keyMeaningAr: 'اليقين الصاعق عند انقطاع الأسباب وحصار البحر والعدو؛ فكان الانفلاق العظيم للبحر ونجاة المؤمنين.',
            keyMeaningEn: 'Unfaltering conviction when trapped by sea and soldiers: "Nay, my Lord is with me; He will guide me."'
          },
          {
            surahNumber: 18,
            surahName: 'الكهف',
            ayahNumber: 65,
            verseSnippet: 'فَوَجَدَا عَبْدًا مِّنْ عِبَادِنَا آتَيْنَاهُ رَحْمَةً مِّنْ عِندِنَا وَعَلَّمْنَاهُ مِن لَّدُنَّا عِلْمًا',
            keyMeaningAr: 'رحلة موسى لطلب الحكمة من الخضر، وبيان لطف تدابير الأقدار الخفية وراء الظواهر المؤلمة.',
            keyMeaningEn: 'Meeting Al-Khidr to uncover the subtle mercy hidden behind apparent worldly calamities.'
          }
        ]
      },
      {
        id: 'dawud_sulayman',
        titleAr: 'داود وسليمان عليهما السلام: الملك والحكمة وتسبيح الجبال ومنطق الطير',
        titleEn: 'David & Solomon (Pbuh) - Sovereignty, Gratitude & Marvels',
        descriptionAr: 'جمع الله لهما بين النبوة والحكمة والملك والتمكين، تسبيح الجبال والحديد اللين لداود، وفهم منطق الطير وتسخير الرياح والجن لسليمان.',
        descriptionEn: 'Endowed with prophethood, sovereign power, and boundless wisdom; softening of iron, subjugation of winds, and understanding bird languages.',
        verses: [
          {
            surahNumber: 38,
            surahName: 'ص',
            ayahNumber: 18,
            verseSnippet: 'إِنَّا سَخَّرْنَا الْجِبَالَ مَعَهُ يُسَبِّحْنَ بِالْعَشِيِّ وَالْإِشْرَاقِ ﴿١٨﴾ وَالطَّيْرَ مَحْشُورَةً ۖ كُلٌّ لَّهُ أَوَّابٌ',
            keyMeaningAr: 'تفاعل الكون الصامت وتسبيح الجبال والطيور مع صوت داود الخاشع في محرابه.',
            keyMeaningEn: 'Mountains and birds echoing with praise alongside David\'s melodious recitations at dawn and evening.'
          },
          {
            surahNumber: 27,
            surahName: 'النمل',
            ayahNumber: 19,
            verseSnippet: 'فَتَبَسَّمَ ضَاحِكًا مِّن قَوْلِهَا وَقَالَ رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ',
            keyMeaningAr: 'أدب سليمان وشكره الخاشع لله عند سماع النملة، وتوجيه النعم إلى طاعة الله والتواضع.',
            keyMeaningEn: 'Solomon smiling at the ant\'s speech, instantly praying for inspiration to be grateful for immense divine favors.'
          }
        ]
      },
      {
        id: 'ayyub_yunus',
        titleAr: 'أيوب ويونس عليهما السلام: مدرسة الصبر والنداء في الظلمات',
        titleEn: 'Job & Jonah (Pbuh) - Radiance in Affliction & Deliverance',
        descriptionAr: 'أيوب ضرب أروع مثل في الصبر على فقد الأهل والمال والصحة، ويونس علم الإنسانية دعاء تفريج الكروب في بطن الحوت.',
        descriptionEn: 'Job\'s legendary endurance through physical agony and loss, and Jonah\'s supplication that illuminates the darkest depths of the ocean.',
        verses: [
          {
            surahNumber: 21,
            surahName: 'الأنبياء',
            ayahNumber: 83,
            verseSnippet: 'وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ ﴿٨٣﴾ فَاسْتَجَبْنَا لَهُ فَكَشَفْنَا مَا بِهِ مِن ضُرٍّ ۖ وَآتَيْنَاهُ أَهْلَهُ وَمِثْلَهُم مَّعَهُمْ رَحْمَةً مِّنْ عِندِنَا وَذِكْرَىٰ لِلْعَابِدِينَ',
            keyMeaningAr: 'أدب أيوب في الخطاب: لم ينسب الضر لله، بل استغاث برحمته، فكان الشفاء والعوض المضاعف رحمة وذكرى.',
            keyMeaningEn: 'Job\'s exquisite etiquette in distress: "Harm has touched me, and You are the Most Merciful," bringing miraculous healing and restorative grace.'
          },
          {
            surahNumber: 21,
            surahName: 'الأنبياء',
            ayahNumber: 87,
            verseSnippet: 'وَذَا النُّونِ إِذ ذَّهَبَ مُغَاضِبًا فَظَنَّ أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ ﴿٨٧﴾ فَاسْتَجَبْنَا لَهُ وَنَجَّيْنَاهُ مِنَ الْغَمِّ ۚ وَكَذَٰلِكَ نُنجِي الْمُؤْمِنِينَ',
            keyMeaningAr: 'دعاء ذي النون: توحيد وتنزيه واعتراف، وهو مفتاح فك كل كرب لكل مؤمن إلى يوم القيامة.',
            keyMeaningEn: 'Jonah\'s invocation in the whale\'s belly: pure monotheism, praise, and repentance that delivers all believers from anguish.'
          }
        ]
      },
      {
        id: 'zakariya_isa_maryam',
        titleAr: 'زكريا ويحيى وعيسى ومريم عليهم السلام: خوارق العطاء والطهر',
        titleEn: 'Zechariah, John, Jesus & Mary (Peace be upon them)',
        descriptionAr: 'استجابة الدعاء المستحيل بشهادة عقم الزوجة واشتعال الرأس شيباً، وعفة مريم العذراء الصديقة، وولادة المسيح كلمة الله وروحه.',
        descriptionEn: 'The granting of John to aged Zechariah, the saintly devotion of Mary, and the miraculous birth of Jesus as a Word and Spirit from Allah.',
        verses: [
          {
            surahNumber: 19,
            surahName: 'مريم',
            ayahNumber: 4,
            verseSnippet: 'قَالَ رَبِّ إِنِّي وَهَنَ الْعَظْمُ مِنِّي وَاشْتَعَلَ الرَّأْسُ شَيْبًا وَلَمْ أَكُن بِدُعَائِكَ رَبِّ شَقِيًّا',
            keyMeaningAr: 'يقين زكريا بربه رغم وهن الجسد واشتعال الشيب، فوهبه الله يحيى نبياً حصوراً.',
            keyMeaningEn: 'Zechariah praying with unbreakable hope despite frail bones, blessed with John the Baptist.'
          },
          {
            surahNumber: 19,
            surahName: 'مريم',
            ayahNumber: 30,
            verseSnippet: 'قَالَ إِنِّي عَبْدُ اللَّهِ آتَانِيَ الْكِتَابَ وَجَعَلَنِي نَبِيًّا ﴿٣٠﴾ وَجَعَلَنِي مُبَارَكًا أَيْنَ مَا كُنتُ وَأَوْصَانِي بِالصَّلَاةِ وَالزَّكَاةِ مَا دُمْتُ حَيًّا ﴿٣١﴾ وَبَرًّا بِوَالِدَتِي وَلَمْ يَجْعَلْنِي جَبَّارًا شَقِيًّا',
            keyMeaningAr: 'كلام عيسى في المهد معلناً عبوديته لله ورسالته النبوية وبره بأمه الطاهرة وابتعاده عن التجبر.',
            keyMeaningEn: 'Jesus speaking in the cradle, declaring his servanthood to Allah, prophethood, and filial love for his pure mother.'
          }
        ]
      },
      {
        id: 'muhammad_rasulullah',
        titleAr: 'محمد ﷺ: الرحمة المهداة وخاتم النبيين',
        titleEn: 'Prophet Muhammad ﷺ - The Universal Mercy',
        descriptionAr: 'سيد المرسلين وخاتم النبيين، بعثه الله رحمة للعالمين، صاحب الخلق العظيم، المبتلى الصابر، المؤيد بالقرآن الخالد.',
        descriptionEn: 'The seal of prophets, sent as universal mercy, bearer of sublime moral character, enduring supreme trials with steadfast fortitude.',
        verses: [
          {
            surahNumber: 21,
            surahName: 'الأنبياء',
            ayahNumber: 107,
            verseSnippet: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ',
            keyMeaningAr: 'الغاية الكبرى من بعثته الشريفة: شمول الرحمة لكل زمان ومكان وللإنس والجن وسائر الكائنات.',
            keyMeaningEn: 'And We have not sent you except as a comprehensive mercy to all of existence.'
          },
          {
            surahNumber: 68,
            surahName: 'القلم',
            ayahNumber: 4,
            verseSnippet: 'وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ',
            keyMeaningAr: 'التزكية الإلهية العظمى لأخلاق النبي ﷺ التي تمثلت القرآن الكريم عملاً وسلوكاً.',
            keyMeaningEn: 'Divine testimony to the unmatched, majestic moral character of the Prophet ﷺ.'
          },
          {
            surahNumber: 9,
            surahName: 'التوبة',
            ayahNumber: 128,
            verseSnippet: 'لَقَدْ جَاءَكُمْ رَسُولٌ مِّنْ أَنفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرِيصٌ عَلَيْكُم بِالْمُؤْمِنِينَ رَءُوفٌ رَّحِيمٌ',
            keyMeaningAr: 'رأفة النبي وحرصه الشديد على أمته وتألمه لما يشق عليهم ومحبته للخير لهم.',
            keyMeaningEn: 'Deepest compassionate warmth, grieving at our hardship and devotedly caring for the believers.'
          }
        ]
      },
      {
        id: 'salihun_parables',
        titleAr: 'قصص الصالحين: أصحاب الكهف، ذو القرنين، لقمان، ومؤمن آل فرعون',
        titleEn: 'Righteous Believers & Parables: Cave Companions, Dhul-Qarnayn & Luqman',
        descriptionAr: 'نماذج قرآنية ملهمة في الثبات على التوحيد (أصحاب الكهف)، والحكم بالعدل وتطويع القوة (ذو القرنين)، والحكمة التربوية (لقمان)، والصدع بالحق (مؤمن آل فرعون).',
        descriptionEn: 'Inspirational Quranic figures: youthful steadfastness in the Cave, just governance and technology with Dhul-Qarnayn, and educational wisdom of Luqman.',
        verses: [
          {
            surahNumber: 18,
            surahName: 'الكهف',
            ayahNumber: 13,
            verseSnippet: 'إِنَّهُمْ فِتْيَةٌ آمَنُوا بِرَبِّهِمْ وَزِدْنَاهُمْ هُدًى ﴿١٣﴾ وَرَبَطْنَا عَلَىٰ قُلُوبِهِمْ إِذْ قَامُوا فَقَالُوا رَبُّنَا رَبُّ السَّمَاوَاتِ وَالْأَرْضِ لَن نَّدْعُوَ مِن دُونِهِ إِلَٰهًا',
            keyMeaningAr: 'شجاعة الشباب في إعلان التوحيد واعتزال الباطل، فكانت الرعاية الإلهية بتثبيت القلوب وحمايتهم.',
            keyMeaningEn: 'Youthful courage declaring monotheism in the face of tyranny, rewarded with divine guidance and protection.'
          },
          {
            surahNumber: 18,
            surahName: 'الكهف',
            ayahNumber: 95,
            verseSnippet: 'قَالَ مَا مَكَّنِّي فِيهِ رَبِّي خَيْرٌ فَأَعِينُونِي بِقُوَّةٍ أَجْعَلْ بَيْنَكُمْ وَبَيْنَهُمْ رَدْمًا',
            keyMeaningAr: 'منهج ذي القرنين: توظيف القوة والخبرة الهندسية في خدمة المستضعفين ونسبة الفضل لله دون استغلال.',
            keyMeaningEn: 'Dhul-Qarnayn\'s model leadership: utilizing power and civil engineering to protect the vulnerable solely for God.'
          },
          {
            surahNumber: 31,
            surahName: 'لقمان',
            ayahNumber: 17,
            verseSnippet: 'يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ ۖ إِنَّ ذَٰلِكَ مِنْ عَزْمِ الْأُمُورِ',
            keyMeaningAr: 'المنهج التربوي المتكامل: إقامة الصلاة، والإصلاح الاجتماعي، والصبر على أذى الناس بعزيمة صلبة.',
            keyMeaningEn: 'Luqman\'s parenting cornerstone: establish prayer, enjoin good, forbid evil, and bear trials with resolve.'
          },
          {
            surahNumber: 40,
            surahName: 'غافر',
            ayahNumber: 28,
            verseSnippet: 'وَقَالَ رَجُلٌ مُّؤْمِنٌ مِّنْ آلِ فِرْعَوْنَ يَكْتُمُ إِيمَانَهُ أَتَقْتُلُونَ رَجُلًا أَن يَقُولَ رَبِّيَ اللَّهُ وَقَدْ جَاءَكُم بِالْبَيِّنَاتِ مِن رَّبِّكُمْ',
            keyMeaningAr: 'شجاعة مؤمن آل فرعون في الصدع بكلمة الحق عند سلطان جائر دفاعاً عن موسى والرسالة.',
            keyMeaningEn: 'The courageous stand of the believer from Pharaoh\'s court speaking truth to power in defense of Moses.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 4. أدعية القرآن والمناجاة الخاشعة
  // ==========================================
  {
    id: 'duaa',
    nameAr: 'أدعية القرآن والمناجاة الخاشعة',
    nameEn: 'Quranic Supplications & Prayers',
    concepts: [
      {
        id: 'maghfirah_rahmah',
        titleAr: 'أدعية طلب المغفرة والعفو والرحمة',
        titleEn: 'Supplications for Forgiveness & Mercy',
        descriptionAr: 'دعوات مباركة علمها الله لعباده للتوسل إليه بستر الذنوب وتكفير السيئات والنجاة من العقاب ونيل الرحمة الواسعة في الدارين.',
        descriptionEn: 'Sublime invocations taught by Allah to seek eradication of sins, pardon for lapses, and immersion in boundless divine mercy.',
        verses: [
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 286,
            verseSnippet: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
            keyMeaningAr: 'خواتيم البقرة: دعاء شامل للتيسير والعفو والتجاوز عن النسيان والخطأ ورفع الآصار والمشاق.',
            keyMeaningEn: 'The culminating prayer of Surah Al-Baqarah: seeking pardon for human lapses, lifting burdens, and imploring mercy.'
          },
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 193,
            verseSnippet: 'رَّبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلْإِيمَانِ أَنْ آمِنُوا بِرَبِّكُمْ فَآمَنَّا ۚ رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الْأَبْرَارِ',
            keyMeaningAr: 'التوسل بالإيمان الصادق لنيل غفران الذنوب وتكفير الخطايا والموت على صحبة الأبرار.',
            keyMeaningEn: 'Supplicating through sincere faith to obtain complete forgiveness and pass away alongside the righteous.'
          },
          {
            surahNumber: 23,
            surahName: 'المؤمنون',
            ayahNumber: 118,
            verseSnippet: 'وَقُل رَّبِّ اغْفِرْ وَارْحَمْ وَأَنتَ خَيْرُ الرَّاحِمِينَ',
            keyMeaningAr: 'دعاء قرآني موجز جامع يختصر حاجة العبد لخير المغفرة وخير الرحمة من أرحم الراحمين.',
            keyMeaningEn: 'A concise yet infinite prayer: "My Lord, forgive and have mercy, for You are the Best of the merciful."'
          }
        ]
      },
      {
        id: 'thabat_hidaya',
        titleAr: 'أدعية الثبات على الإيمان ونيل الهداية وحسن الخاتمة',
        titleEn: 'Prayers for Steadfastness & Guidance',
        descriptionAr: 'سؤال الله تثبيت الفؤاد على الحق، وتجنب الزيغ والضلال بعد الهداية، وسلوك الصراط المستقيم حتى الممات.',
        descriptionEn: 'Pleading with Allah for heart-stability upon truth, guarding against deviation after guidance, and walking the straight path.',
        verses: [
          {
            surahNumber: 1,
            surahName: 'الفاتحة',
            ayahNumber: 6,
            verseSnippet: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾',
            keyMeaningAr: 'أعظم دعاء في القرآن يُردد في كل ركعة: سؤال الهداية لصراط المنعم عليهم من النبيين والصديقين والشهداء.',
            keyMeaningEn: 'The core daily supplication of Surah Al-Faatiha: guide us to the straight path of divine grace.'
          },
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 8,
            verseSnippet: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
            keyMeaningAr: 'دعاء الراسخين في العلم: الاستعاذة من انتكاس القلوب وزيغها وسؤال الرحمة والهداية الدائمة.',
            keyMeaningEn: 'Prayer of the deeply grounded in knowledge: "Our Lord, let not our hearts deviate after You have guided us."'
          },
          {
            surahNumber: 12,
            surahName: 'يوسف',
            ayahNumber: 101,
            verseSnippet: 'تَوَفَّنِي مُسْلِمًا وَأَلْحِقْنِي بِالصَّالِحِينَ',
            keyMeaningAr: 'دعاء يوسف عليه السلام عند قمة مجده؛ تمنى الثبات على الإسلام وحسن الوفاة واللحاق بالصالحين.',
            keyMeaningEn: 'Joseph\'s sublime prayer at the height of royalty: "Cause me to die a Muslim and join me with the righteous."'
          }
        ]
      },
      {
        id: 'dhurriyah_family',
        titleAr: 'أدعية صلاح الذرية والأسرة والسكينة الزوجية',
        titleEn: 'Prayers for Righteous Offspring & Family Harmony',
        descriptionAr: 'دعوات مباركة للزوجين والأولاد، وسؤال الله جعل البيوت واحات سكينة وقرة أعين وإمامة في التقوى، وصلاح الأجيال.',
        descriptionEn: 'Quranic prayers for marital harmony, raising virtuous children, and making the household a fountain of peace and leadership.',
        verses: [
          {
            surahNumber: 25,
            surahName: 'الفرقان',
            ayahNumber: 74,
            verseSnippet: 'وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
            keyMeaningAr: 'دعاء عباد الرحمن: طلب السعادة والقرّة في الأهل والأولاد، وبلوغ أعلى مراتب الإمامة في التقوى.',
            keyMeaningEn: 'The prayer of Ar-Rahman\'s servants: "Grant us from our spouses and offspring comfort to our eyes, and make us leaders for the righteous."'
          },
          {
            surahNumber: 14,
            surahName: 'إبراهيم',
            ayahNumber: 40,
            verseSnippet: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
            keyMeaningAr: 'دعوة إبراهيم الخالدة لحفظ الصلاة في نفسه وأجيال ذريته المتعاقبة، فإقامة الصلاة عماد كل صلاح.',
            keyMeaningEn: 'Abraham\'s timeless invocation: "My Lord, make me an establisher of prayer, and from my descendants."'
          },
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 38,
            verseSnippet: 'هُنَالِكَ دَعَا زَكَرِيَّا رَبَّهُ ۖ قَالَ رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ الدُّعَاءِ',
            keyMeaningAr: 'دعاء زكريا الخاشع لطلب الذرية الطيبة المباركة الممتدة في الخير والصلاح عند رؤية رزق مريم.',
            keyMeaningEn: 'Zechariah\'s prayer for pure, wholesome offspring: "Grant me from Yourself a good offspring; You hear all prayer."'
          }
        ]
      },
      {
        id: 'shifa_durr',
        titleAr: 'أدعية الشفاء وكشف الضر وتفريج الكروب',
        titleEn: 'Prayers for Healing & Dispelling Calamities',
        descriptionAr: 'اللجوء إلى الشافي المعافي لكشف الأمراض والهموم، وتفريج ضيق الصدور ورفع البلايا عن النفس والجسد برحمة الله ولطفه.',
        descriptionEn: 'Turning to the Healer to cure bodily ailments and grief, dispelling dark tribulations with unwavering faith in His gentleness.',
        verses: [
          {
            surahNumber: 26,
            surahName: 'الشعراء',
            ayahNumber: 80,
            verseSnippet: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
            keyMeaningAr: 'يقين إبراهيم الخالص بأن الشفاء التام بيد الله وحده مع عزو المرض للنفس تواضعاً وأدباً.',
            keyMeaningEn: 'Abraham\'s absolute faith: "And when I am ill, it is He who cures me."'
          },
          {
            surahNumber: 28,
            surahName: 'القصص',
            ayahNumber: 24,
            verseSnippet: 'فَسَقَىٰ لَهُمَا ثُمَّ تَوَلَّىٰ إِلَى الظِّلِّ فَقَالَ رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
            keyMeaningAr: 'دعاء موسى عند ماء مدين: إظهار الفقر المطلق لله والتعرض لنفحات كرمه، فجاءه الفرج والمأوى والزوجة والعمل.',
            keyMeaningEn: 'Moses\'s humble prayer: "My Lord, indeed I am, for whatever good You would send down to me, in needy distress."'
          },
          {
            surahNumber: 12,
            surahName: 'يوسف',
            ayahNumber: 86,
            verseSnippet: 'قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ وَأَعْلَمُ مِنَ اللَّهِ مَا لَا تَعْلَمُونَ',
            keyMeaningAr: 'شكوى يعقوب لله وحده وتفريغ الهموم في جنابه العلي مع اليقين بفرجه القريب.',
            keyMeaningEn: 'Jacob\'s refuge: "I only complain of my suffering and my grief to Allah, and I know from Allah that which you do not know."'
          }
        ]
      },
      {
        id: 'nasr_tamkeen',
        titleAr: 'أدعية النصر والتمكين ودفع كيد الظالمين',
        titleEn: 'Prayers for Victory, Strength & Overcoming Injustice',
        descriptionAr: 'الاستنصار بالله في مواجهة البغي والعدوان، وسؤال الثبات وإفراغ الصبر عند ملاقاة الشدائد والفتن، والتحصن من كيد المعتدين.',
        descriptionEn: 'Beseeching Allah\'s decisive victory over oppressors, asking for poured-out patience and steadfast footing in crises.',
        verses: [
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 250,
            verseSnippet: 'وَلَمَّا بَرَزُوا لِجَالُوتَ وَجُنُودِهِ قَالُوا رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
            keyMeaningAr: 'دعاء طالوت والمؤمنين: طلب إفاضة الصبر وتثبيت الأقدام على الحق لتحقيق النصر.',
            keyMeaningEn: 'Supplication of the believers facing Goliath: "Our Lord, pour upon us patience and plant firmly our feet and give us victory."'
          },
          {
            surahNumber: 60,
            surahName: 'الممتحنة',
            ayahNumber: 4,
            verseSnippet: 'رَّبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِلَيْكَ الْمَصِيرُ ﴿٤﴾ رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلَّذِينَ كَفَرُوا وَاغْفِرْ لَنَا رَبَّنَا ۖ إِنَّكَ أَنتَ الْعَزِيزُ الْحَكِيمُ',
            keyMeaningAr: 'دعاء إبراهيم والمؤمنين معه في التوكل والإنابة والنجاة من أن يكونوا فتنة واختباراً للظالمين.',
            keyMeaningEn: 'The invocation of Abraham: "Our Lord, upon You we have relied, and to You we have returned, and to You is the final destination."'
          }
        ]
      },
      {
        id: 'ilm_hikmah',
        titleAr: 'أدعية طلب العلم النافع وانشراح الصدر وتيسير الأمر',
        titleEn: 'Prayers for Knowledge, Wisdom & Clear Speech',
        descriptionAr: 'طلب الزيادة في المعرفة وتنوير العقل، وحل عقد اللسان للشرح والبيان، وانشراح الصدر لتبليغ رسالات الخير.',
        descriptionEn: 'Asking for continuous increase in beneficial knowledge, untying knots of the tongue, and expanding the chest for wisdom.',
        verses: [
          {
            surahNumber: 20,
            surahName: 'طه',
            ayahNumber: 114,
            verseSnippet: 'فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ ۗ وَلَا تَعْجَلْ بِالْقُرْآنِ مِن قَبْلِ أَن يُقْضَىٰ إِلَيْكَ وَحْيُهُ ۖ وَقُل رَّبِّ زِدْنِي عِلْمًا',
            keyMeaningAr: 'الأمر الرباني الوحيد للنبي ﷺ بطلب الاستزادة من شيء كان في العلم: (وقل رب زدني علماً).',
            keyMeaningEn: 'The only thing Allah commanded His Prophet ﷺ to seek an increase of was knowledge: "Say, My Lord, increase me in knowledge."'
          },
          {
            surahNumber: 20,
            surahName: 'طه',
            ayahNumber: 25,
            verseSnippet: 'قَالَ رَبِّ اشْرَحْ لِي صَدْرِي ﴿٢٥﴾ وَيَسِّرْ لِي أَمْرِي ﴿٢٦﴾ وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي ﴿٢٧﴾ يَفْقَهُوا قَوْلِي ﴿٢٨﴾',
            keyMeaningAr: 'دعاء موسى عليه السلام عند تكليفه بالرسالة: سؤال انشراح الصدر وتيسير الصعاب وفصاحة البيان.',
            keyMeaningEn: 'Moses\'s prayer before his mission: "My Lord, expand for me my chest, ease for me my task, and untie the knot from my tongue."'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 5. العبادات والفرائض وشعائر الإسلام
  // ==========================================
  {
    id: 'ibadat',
    nameAr: 'العبادات والفرائض وشعائر الإسلام',
    nameEn: 'Worship, Pillars & Rites',
    concepts: [
      {
        id: 'salah_khushu',
        titleAr: 'الصلاة وإقامتها والخشوع في المحراب',
        titleEn: 'Prayer, Regular Devotion & Sacred Humility',
        descriptionAr: 'عمود الدين وأول ما يحاسب عليه العبد، صلة الروح بربها، وناهية عن الفحشاء والمنكر وسكينة للمؤمن في دنياه وآخرته.',
        descriptionEn: 'The central pillar of faith, spiritual sanctuary from worldly distractions, and guardian against immorality.',
        verses: [
          {
            surahNumber: 23,
            surahName: 'المؤمنون',
            ayahNumber: 1,
            verseSnippet: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ ﴿١﴾ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ',
            keyMeaningAr: 'الفلاح الحقيقي مرهون بالخشوع في الصلاة واستحضار عظمة من نقف بين يديه.',
            keyMeaningEn: 'True success belongs to believers who manifest solemn humility and presence in their prayers.'
          },
          {
            surahNumber: 29,
            surahName: 'العنكبوت',
            ayahNumber: 45,
            verseSnippet: 'اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ',
            keyMeaningAr: 'الأثر التربوي والسلوكي للصلاة في تطهير المجتمع وردع النفس عن المعاصي.',
            keyMeaningEn: 'Prayer protects from shameful deeds and wrongdoing, and remembrance of Allah is the greatest reality.'
          },
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 238,
            verseSnippet: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ',
            keyMeaningAr: 'الأمر بالمحافظة على الصلوات في أوقاتها وخاصة صلاة العصر، والقيام بالقنوت والخشوع.',
            keyMeaningEn: 'Safeguard all regular prayers and especially the middle prayer, standing before Allah in devout obedience.'
          }
        ]
      },
      {
        id: 'zakah_infaq',
        titleAr: 'الزكاة والصدقات والإنفاق في سبيل الله',
        titleEn: 'Zakat, Charity & Pure Generosity',
        descriptionAr: 'تطهير الأموال وتزكية النفوس من الشح والبخل، وكفالة الفقراء والمحتاجين، ومضاعفة الحسنات عند الله أضعافاً كثيرة.',
        descriptionEn: 'Purifying wealth and cleansing souls, uplifting the needy, and multiplying eternal spiritual treasures with Allah.',
        verses: [
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 261,
            verseSnippet: 'مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ ۗ وَاللَّهُ يُضَاعِفُ لِمَن يَشَاءُ ۗ وَاللَّهُ وَاسِعٌ عَلِيمٌ',
            keyMeaningAr: 'المثل القرآني البديع لمضاعفة أجر الصدقة إلى سبعمائة ضعف وأكثر في سبيل الله.',
            keyMeaningEn: 'The parable of spending in Allah\'s cause: a seed yielding seven hundred grains and even more multiplied.'
          },
          {
            surahNumber: 9,
            surahName: 'التوبة',
            ayahNumber: 103,
            verseSnippet: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا وَصَلِّ عَلَيْهِمْ ۖ إِنَّ صَلَاتَكَ سَكَنٌ لَّهُمْ ۗ وَاللَّهُ سَمِيعٌ عَلِيمٌ',
            keyMeaningAr: 'وظيفة الزكاة التطهيرية للمال والروح، وجلب السكينة والبركة للمجتمع المسلم.',
            keyMeaningEn: 'Charity as a purifying mechanism for wealth and character, infusing community peace.'
          },
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 92,
            verseSnippet: 'لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ ۚ وَمَا تُنفِقُوا مِن شَيْءٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ',
            keyMeaningAr: 'بلوغ ذروة البر لا يتم إلا بالإنفاق مما تحبه النفس وتعزّه، ابتغاء مرضاة الله.',
            keyMeaningEn: 'You will never attain righteousness until you spend from that which you truly love and cherish.'
          }
        ]
      },
      {
        id: 'siyam_ramadan',
        titleAr: 'الصيام وشهر رمضان وروح التقوى',
        titleEn: 'Fasting, Ramadan & Spiritual Ascension',
        descriptionAr: 'مدرسة الصبر والتقوى، كسر الشهوة، وشهر نزول القرآن، والتراحم مع الفقراء والجوعى، وبلوغ ليلة القدر.',
        descriptionEn: 'The school of self-restraint and mindfulness, fasting from dawn to dusk, and the blessed season of Quranic revelation.',
        verses: [
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 183,
            verseSnippet: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
            keyMeaningAr: 'الغاية العظمى من فرض الصيام: تحقيق تقوى الله ومراقبته في السر والعلن.',
            keyMeaningEn: 'Fasting is prescribed as it was for earlier nations so that you may attain deep spiritual mindfulness (Taqwa).'
          },
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 185,
            verseSnippet: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ',
            keyMeaningAr: 'مكانة شهر رمضان المبارك بصفته الوعاء الزمني لنزول القرآن الكريم هداية للبشرية.',
            keyMeaningEn: 'The month of Ramadan in which the Quran was revealed as unmatched guidance and discernment for humanity.'
          },
          {
            surahNumber: 97,
            surahName: 'القدر',
            ayahNumber: 1,
            verseSnippet: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ ﴿١﴾ وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ ﴿٢﴾ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ',
            keyMeaningAr: 'عظمة ليلة القدر المباركة في رمضان، وأن العبادة فيها خير من عبادة ألف شهر (أكثر من 83 عاماً).',
            keyMeaningEn: 'The Night of Decree, surpassing in spiritual value and divine mercy over a thousand months.'
          }
        ]
      },
      {
        id: 'hajj_umrah',
        titleAr: 'الحج والعمرة وتعظيم شعائر الله',
        titleEn: 'Hajj, Umrah & Sanctity of Rites',
        descriptionAr: 'المؤتمر الإسلامي الأكبر، استجابة لنداء إبراهيم، التجرّد من الدنيا بلباس الإحرام، والطواف والسعي والوقوف بعرفة.',
        descriptionEn: 'The monumental pilgrimage answering Abraham\'s ancient call, shedding worldly status in simple garb, circumambulating the Kaaba, and standing at Arafat.',
        verses: [
          {
            surahNumber: 22,
            surahName: 'الحج',
            ayahNumber: 27,
            verseSnippet: 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ',
            keyMeaningAr: 'استجابة الأمم لنداء إبراهيم عليه السلام بالحج على مر القرون من شتى بقاع الأرض.',
            keyMeaningEn: 'The universal proclamation to mankind for pilgrimage, journeying from every deep distant mountain pass.'
          },
          {
            surahNumber: 22,
            surahName: 'الحج',
            ayahNumber: 32,
            verseSnippet: 'ذَٰلِكَ وَمَن يُعَظِّمْ شَعَائِرَ اللَّهِ فَإِنَّهَا مِن تَقْوَى الْقُلُوبِ',
            keyMeaningAr: 'تعظيم معالم الحج ومناسكه وحرمات الله برهان أكيد على تقوى القلوب ونقائها.',
            keyMeaningEn: 'Honoring and sanctifying the symbols of Allah is an unmistakable sign of heart piety.'
          }
        ]
      },
      {
        id: 'dhikr_istighfar',
        titleAr: 'ذكر الله وتسبيحه والاستغفار بالأسحار',
        titleEn: 'Remembrance, Tasbeeh & Seeking Forgiveness',
        descriptionAr: 'حياة القلوب وروح العبادة؛ تسبيح الله آناء الليل وأطراف النهار، وملازمة الاستغفار في الأسحار لنيل الرضوان والبركة.',
        descriptionEn: 'The heartbeat of spiritual vitality: glorifying Allah day and night, constant seeking of pardon, and serene contemplation before dawn.',
        verses: [
          {
            surahNumber: 13,
            surahName: 'الرعد',
            ayahNumber: 28,
            verseSnippet: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
            keyMeaningAr: 'الطمأنينة المطلقة والشفاء القلبي من القلق والاضطراب لا يكون إلا في ظلال ذكر الله.',
            keyMeaningEn: 'Truly, in the remembrance of Allah do troubled hearts find supreme reassurance and peace.'
          },
          {
            surahNumber: 33,
            surahName: 'الأحزاب',
            ayahNumber: 41,
            verseSnippet: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا ﴿٤١﴾ وَسَبِّحُوهُ بُكْرَةً وَأَصِيلًا',
            keyMeaningAr: 'الأمر الإلهي بالإكثار من الذكر والتسبيح في البكور والأصائل لنيل صلاة الله وملائكته.',
            keyMeaningEn: 'O you who have believed, remember Allah with much remembrance and glorify Him morning and evening.'
          },
          {
            surahNumber: 71,
            surahName: 'نوح',
            ayahNumber: 10,
            verseSnippet: 'فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا ﴿١٠﴾ يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا ﴿١١﴾ وَيُمْدِدْكُم بِأَمْوَالٍ وَبَنِينَ وَيَجْعَل لَّكُمْ جَنَّاتٍ وَيَجْعَل لَّكُمْ أَنْهَارًا',
            keyMeaningAr: 'ثمرات الاستغفار الدنيوية العاجلة: نزول الأمطار، سعة الرزق، هبة الأموال والأولاد والبركات.',
            keyMeaningEn: 'The abundant worldly fruits of seeking forgiveness: rain, wealth, children, and flourishing gardens.'
          }
        ]
      },
      {
        id: 'tilawat_tadabbur',
        titleAr: 'تلاوة القرآن وتدبر آياته والتأمل في معانيه',
        titleEn: 'Quran Recitation & Deep Contemplation',
        descriptionAr: 'قراءة كتاب الله بترتيل وخشوع، وتدبر دلالاته وأحكامه وأسراره، وعدم هجره وجعله منهاج حياة يومي.',
        descriptionEn: 'Chanting the divine verses in serene rhythm, opening heart locks to its sublime wisdom, and living by its divine light.',
        verses: [
          {
            surahNumber: 47,
            surahName: 'محمد',
            ayahNumber: 24,
            verseSnippet: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا',
            keyMeaningAr: 'الحث الصارم على فتح أقفال القلوب والتأمل العميق في آيات الكتاب الحكيم.',
            keyMeaningEn: 'Do they not reflect upon the Quran, or are there locks upon their hearts?'
          },
          {
            surahNumber: 38,
            surahName: 'ص',
            ayahNumber: 29,
            verseSnippet: 'كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ وَلِيَتَذَكَّرَ أُولُو الْأَلْبَابِ',
            keyMeaningAr: 'بركة القرآن العظمى مرتبطة بتدبر آياته والعمل بما فيها وتذكر أولي العقول.',
            keyMeaningEn: 'This is a blessed Book We have revealed to you, so that they may ponder its verses and people of understanding take heed.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 6. المعاملات والتشريعات وحقوق المجتمع
  // ==========================================
  {
    id: 'tashriat',
    nameAr: 'المعاملات والتشريعات وحقوق المجتمع',
    nameEn: 'Social Laws & Economic Ethics',
    concepts: [
      {
        id: 'riba_wealth',
        titleAr: 'تحريم الربا وأكل أموال الناس بالباطل',
        titleEn: 'Prohibition of Usury & Protection of Wealth',
        descriptionAr: 'حماية الاقتصاد من الاستغلال والاحتكار، وإحلال التجارة العادلة والقرض الحسن والإنفاق الرحيم محل الربا الماحق.',
        descriptionEn: 'Safeguarding community economic well-being against exploitation, replacing predatory usury with fair trade and benevolent loans.',
        verses: [
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 275,
            verseSnippet: 'الَّذِينَ يَأْكُلُونَ الرِّبَا لَا يَقُومُونَ إِلَّا كَمَا يَقُومُ الَّذِي يَتَخَبَّطُهُ الشَّيْطَانُ مِنَ الْمَسِّ ۚ ذَٰلِكَ بِأَنَّهُمْ قَالُوا إِنَّمَا الْبَيْعُ مِثْلُ الرِّبَا ۗ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
            keyMeaningAr: 'الفرق الحاسم بين التجارة المشروعة المنتجة وبين الربا الاستغلالي الماحق للبركة.',
            keyMeaningEn: 'The definitive divine boundary: Allah has permitted fair trade and strictly prohibited usury.'
          },
          {
            surahNumber: 2,
            surahName: 'البقرة',
            ayahNumber: 276,
            verseSnippet: 'يَمْحَقُ اللَّهُ الرِّبَا وَيُرْبِي الصَّدَقَاتِ ۗ وَاللَّهُ لَا يُحِبُّ كُلَّ كَفَّارٍ أَثِيمٍ',
            keyMeaningAr: 'المعادلة الاقتصادية الربانية: محق بركة الربا ونماء وزيادة الصدقات في الدنيا والآخرة.',
            keyMeaningEn: 'Allah destroys interest-based exploitation and multiplies charity with boundless blessings.'
          }
        ]
      },
      {
        id: 'usrah_zawaj',
        titleAr: 'أحكام الأسرة والزواج والمعاشرة بالمعروف',
        titleEn: 'Family Sanctity, Marriage & Good Conduct',
        descriptionAr: 'ميثاق الزواج الغليظ القائم على السكن والمودة والرحمة، وحسن العشرة، وحفظ الحقوق المتبادلة بين الزوجين وحل النزاع بالحسنى.',
        descriptionEn: 'The sacred covenant of marriage built on serenity, mutual tenderness, respectful companionship, and divine affection.',
        verses: [
          {
            surahNumber: 30,
            surahName: 'الروم',
            ayahNumber: 21,
            verseSnippet: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
            keyMeaningAr: 'المقصد الأسمى للزواج في الإسلام: تحقيق السكن النفسي والمودة المتبادلة والرحمة التكافلية.',
            keyMeaningEn: 'The sublime purpose of marriage: creating a sanctuary of peace, mutual love, and enduring mercy.'
          },
          {
            surahNumber: 4,
            surahName: 'النساء',
            ayahNumber: 19,
            verseSnippet: 'وَعَاشِرُوهُنَّ بِالْمَعْرُوفِ ۚ فَإِن كَرِهْتُمُوهُنَّ فَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَيَجْعَلَ اللَّهُ فِيهِ خَيْرًا كَثِيرًا',
            keyMeaningAr: 'الأمر الإلهي بالمعاشرة الطيبة بالمعروف والصبر على الطبائع، وتوقع الخير الكثير من وراء الصبر.',
            keyMeaningEn: 'Live with them in kindness. If you dislike them, it may be that you dislike a thing through which Allah brings abundant good.'
          }
        ]
      },
      {
        id: 'yatama_duafa',
        titleAr: 'رعاية اليتامى وأموالهم والإحسان إلى الضعفاء والمساكين',
        titleEn: 'Protection of Orphans & Caring for the Vulnerable',
        descriptionAr: 'حرمة أكل مال اليتيم، والأمر بإكرامه ورعايته نفسياً ومالياً، وصيانة حقوق المساكين وابن السبيل وذوي الحاجات.',
        descriptionEn: 'Stern prohibition against squandering orphans\' assets, demanding their honoring, affection, and caring for the impoverished.',
        verses: [
          {
            surahNumber: 4,
            surahName: 'النساء',
            ayahNumber: 10,
            verseSnippet: 'إِنَّ الَّذِينَ يَأْكُلُونَ أَمْوَالَ الْيَتَامَىٰ ظُلْمًا إِنَّمَا يَأْكُلُونَ فِي بُطُونِهِمْ نَارًا ۖ وَسَيَصْلَوْنَ سَعِيرًا',
            keyMeaningAr: 'الوعيد الشديد الزاجر عن التعدي على أموال اليتامى أو استغلال ضعفهم بأي شكل.',
            keyMeaningEn: 'Those who unjustly consume the property of orphans devour nothing but fire into their bellies.'
          },
          {
            surahNumber: 93,
            surahName: 'الضحى',
            ayahNumber: 9,
            verseSnippet: 'فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ ﴿٩﴾ وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ ﴿١٠﴾ وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ ﴿١١﴾',
            keyMeaningAr: 'الوصية النبوية والإنسانية الخالدة: حفظ كرامة اليتيم وجبر خاطره ومنع قهره، واللطف مع السائلين.',
            keyMeaningEn: 'Do not oppress the orphan, nor repel the petitioner, and proclaim the blessing of your Lord.'
          }
        ]
      },
      {
        id: 'shura_taawun',
        titleAr: 'الشورى والتعاون على البر والتقوى',
        titleEn: 'Mutual Consultation (Shura) & Civic Cooperation',
        descriptionAr: 'منهج إدارة شؤون المجتمع والأمة عبر تداول الرأي والتشاور ونبذ الاستبداد، والتعاون على الخير وحظر التعاون على الإثم والعدوان.',
        descriptionEn: 'The governance ethos of collective deliberation (Shura), participatory wisdom, and uniting efforts exclusively for righteousness.',
        verses: [
          {
            surahNumber: 42,
            surahName: 'الشورى',
            ayahNumber: 38,
            verseSnippet: 'وَالَّذِينَ اسْتَجَابُوا لِرَبِّهِمْ وَأَقَامُوا الصَّلَاةَ وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ',
            keyMeaningAr: 'اقتران الشورى بين الصلاة والإنفاق كدليل على مركزيتها في بناء الشخصية والمجتمع الراشد.',
            keyMeaningEn: 'Consultation coupled directly between prayer and charity as a bedrock of righteous community life.'
          },
          {
            surahNumber: 5,
            surahName: 'المائدة',
            ayahNumber: 2,
            verseSnippet: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ ۚ وَاتَّقُوا اللَّهَ ۖ إِنَّ اللَّهَ شَدِيدُ الْعِقَابِ',
            keyMeaningAr: 'القاعدة الذهبية في الاجتماع الإنساني: التحالف على الخير والعدل، وحظر أي تعاون يقود للظلم والعدوان.',
            keyMeaningEn: 'Cooperate in righteousness and piety, but do not cooperate in sin and transgression.'
          }
        ]
      },
      {
        id: 'mawarith_huquq',
        titleAr: 'أحكام المواريث وتوزيع التركات بالعدل الإلهي',
        titleEn: 'Inheritance Laws & Divine Distributive Justice',
        descriptionAr: 'حدود الله الحكيمة في توزيع التركات دون إجحاف ولا جور، وضمان حقوق النساء والأطفال والوالدين بالحق الإلهي.',
        descriptionEn: 'The divine, meticulous distribution of inheritance protecting women, children, and elders without human bias.',
        verses: [
          {
            surahNumber: 4,
            surahName: 'النساء',
            ayahNumber: 13,
            verseSnippet: 'تِلْكَ حُدُودُ اللَّهِ ۚ وَمَن يُطِعِ اللَّهَ وَرَسُولَهُ يُدْخِلْهُ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا ۚ وَذَٰلِكَ الْفَوْزُ الْعَظِيمُ',
            keyMeaningAr: 'آيات المواريث هي حدود الله القطعية التي يستوجب الالتزام بها الفوز بجنات النعيم.',
            keyMeaningEn: 'Inheritance distribution constitutes sacred divine boundaries; honoring them leads to Paradise.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 7. السنن الإلهية والتربية النفسية والروحية
  // ==========================================
  {
    id: 'sunan_nafs',
    nameAr: 'السنن الإلهية والتربية النفسية والروحية',
    nameEn: 'Cosmic Laws & Spiritual Purification',
    concepts: [
      {
        id: 'tazkiyat_nafs',
        titleAr: 'تزكية النفس وأمراض القلوب واليقظة الروحية',
        titleEn: 'Purification of the Soul & Inner Vigilance',
        descriptionAr: 'تطهير الباطن من الرياء والحقد والحسد وحب الدنيا، وترقية النفس من الأمارة بالسوء إلى اللوامة ثم المطمئنة.',
        descriptionEn: 'Purging the inner heart from ostentation, rancor, envy, and worldly attachment, elevating the soul to serene tranquility.',
        verses: [
          {
            surahNumber: 91,
            surahName: 'الشمس',
            ayahNumber: 9,
            verseSnippet: 'قَدْ أَفْلَحَ مَن زَكَّاهَا ﴿٩﴾ وَقَدْ خَابَ مَن دَسَّاهَا ﴿١٠﴾',
            keyMeaningAr: 'أطول قسم في القرآن للتدليل على أن الفلاح الوحيد معلق بتطهير النفس وتزكيتها بالفضائل.',
            keyMeaningEn: 'The longest oath in the Quran affirming that true prosperity belongs solely to whoever purifies their soul.'
          },
          {
            surahNumber: 26,
            surahName: 'الشعراء',
            ayahNumber: 88,
            verseSnippet: 'يَوْمَ لَا يَنفَعُ مَالٌ وَلَا بَنُونَ ﴿٨٨﴾ إِلَّا مَنْ أَتَى اللَّهَ بِقَلْبٍ سَلِيمٍ',
            keyMeaningAr: 'القلب السليم الخالي من الشرك والغل والحسد هو جواز المرور والنجاة الوحيد في اليوم الآخر.',
            keyMeaningEn: 'The Day when neither wealth nor sons avail, except him who comes to Allah with a sound, pure heart.'
          },
          {
            surahNumber: 89,
            surahName: 'الفجر',
            ayahNumber: 27,
            verseSnippet: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ﴿٢٧﴾ ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً ﴿٢٨﴾ فَادْخُلِي فِي عِبَادِي ﴿٢٩﴾ وَادْخُلِي جَنَّتِي',
            keyMeaningAr: 'البشارة الإلهية الختامية للنفس المطمئنة بالرجوع إلى جوار ربها راضية مرضية في جنات الخلد.',
            keyMeaningEn: 'The divine call to the tranquil soul: "Return to your Lord, well-pleased and pleasing to Him, and enter My Paradise."'
          }
        ]
      },
      {
        id: 'sunan_taghyir',
        titleAr: 'سنة التغيير الحضاري ونصر الحق وأفول الباطل',
        titleEn: 'Laws of Societal Change & Inevitable Truth',
        descriptionAr: 'السنن الربانية التي لا تحابي أحداً؛ إن الله لا يغير ما بقوم حتى يغيروا ما بأنفسهم، وأن الباطل زاهق مهما انتفش وقوي.',
        descriptionEn: 'Unchanging divine social laws: transformation begins within hearts and deeds, and falsehood is inherently transient.',
        verses: [
          {
            surahNumber: 13,
            surahName: 'الرعد',
            ayahNumber: 11,
            verseSnippet: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ',
            keyMeaningAr: 'قانون التغيير النفسي والمجتمعي: النصر والنهوض والبركة تنبع من المبادرة الذاتية في الإصلاح.',
            keyMeaningEn: 'Indeed, Allah will not change the condition of a people until they change what is in their inner selves.'
          },
          {
            surahNumber: 17,
            surahName: 'الإسراء',
            ayahNumber: 81,
            verseSnippet: 'وَقُلْ جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ ۚ إِنَّ الْبَاطِلَ كَانَ زَهُوقًا',
            keyMeaningAr: 'طبيعة الصراع الكوني: الحق أصيل ثابت منتصر، والباطل طارئ هش محكوم عليه بالزوال.',
            keyMeaningEn: 'Truth has arrived, and falsehood has vanished; indeed, falsehood is bound by nature to perish.'
          },
          {
            surahNumber: 3,
            surahName: 'آل عمران',
            ayahNumber: 140,
            verseSnippet: 'وَتِلْكَ الْأَيَّامُ نُدَاوِلُهَا بَيْنَ النَّاسِ وَلِيَعْلَمَ اللَّهُ الَّذِينَ آمَنُوا وَيَتَّخِذَ مِنكُمْ شُهَدَاءَ ۗ وَاللَّهُ لَا يُحِبُّ الظَّالِمِينَ',
            keyMeaningAr: 'سنة مداولة الأيام والابتلاء بالشدة والرخاء لتمحيص الصفوف واصطفاء المؤمنين الصادقين.',
            keyMeaningEn: 'Such days of alternating fortune We rotate among mankind, that Allah may test and purify the faithful.'
          }
        ]
      },
      {
        id: 'dunya_haqiqah',
        titleAr: 'حقيقة الحياة الدنيا وزينتها ومزرعة الآخرة',
        titleEn: 'Reality of Earthly Life & Eternal Horizon',
        descriptionAr: 'بيان الطبيعة العابرة للدنيا، وأنها دار ممر وامتحان وليست دار مقر، والحث على اغتنام الأوقات في الباقيات الصالحات.',
        descriptionEn: 'Recognizing the transient nature of mortal life, that it is a testing ground and bridge toward everlasting reality.',
        verses: [
          {
            surahNumber: 57,
            surahName: 'الحديد',
            ayahNumber: 20,
            verseSnippet: 'اعْلَمُوا أَنَّمَا الْحَيَاةُ الدُّنْيَا لَعِبٌ وَلَهْوٌ وَزِينَةٌ وَتَفَاخُرٌ بَيْنَكُمْ وَتَكَاثُرٌ فِي الْأَمْوَالِ وَالْأَوْلَادِ ۖ كَمَثَلِ غَيْثٍ أَعْجَبَ الْكُفَّارَ نَبَاتُهُ ثُمَّ يَهِيجُ فَتَرَاهُ مُصْفَرًّا ثُمَّ يَكُونُ حُطَامًا',
            keyMeaningAr: 'التصوير القرآني المعجز لدورة الحياة الدنيا السريعة، وتنبيه الألباب لعدم الاغترار بمظاهرها الفانية.',
            keyMeaningEn: 'The vivid Quranic metaphor of earthly pleasures like transient vegetation that soon turns to dry chaff.'
          },
          {
            surahNumber: 18,
            surahName: 'الكهف',
            ayahNumber: 46,
            verseSnippet: 'الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا ۖ وَالْبَاقِيَاتُ الصَّالِحَاتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا',
            keyMeaningAr: 'المقارنة الجلية بين زينة الحياة الدنيا الزائلة وبين الباقيات الصالحات من ذكر وطاعة وأثر طيب.',
            keyMeaningEn: 'Wealth and children are attractions of this worldly life, but the enduring good deeds are best in reward and hope.'
          }
        ]
      },
      {
        id: 'sakina_tumaaneenah',
        titleAr: 'السكينة وانشراح الصدر وطرد اليأس والحزن',
        titleEn: 'Inner Serenity, Relief & Dispelling Despair',
        descriptionAr: 'عطاء الله الخاص لعباده المؤمنين في تنزيل السكينة على قلوبهم في أحلك الظروف، وفتح أبواب الأمل وطرد القنوط من رحمته.',
        descriptionEn: 'Divine tranquility sent into believers\' hearts during tumultuous trials, banishing sorrow and despair through His boundless mercy.',
        verses: [
          {
            surahNumber: 48,
            surahName: 'الفتح',
            ayahNumber: 4,
            verseSnippet: 'هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَّعَ إِيمَانِهِمْ ۗ وَلِلَّهِ جُنُودُ السَّمَاوَاتِ وَالْأَرْضِ',
            keyMeaningAr: 'السكينة الربانية التي يسكبها الله في قلوب أوليائه فتمنحهم ثباتاً وطمأنينة لا تزلزلها العواصف.',
            keyMeaningEn: 'It is He who sent down peace and tranquility into the hearts of believers so that they may increase in faith.'
          },
          {
            surahNumber: 39,
            surahName: 'الزمر',
            ayahNumber: 53,
            verseSnippet: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ',
            keyMeaningAr: 'أرجى آية في كتاب الله تفتح أبواب الأمل وتطرد اليأس، مبشرةً بمغفرة جميع الذنوب للمنيبين.',
            keyMeaningEn: 'The most hopeful verse in the Quran: "Do not despair of the mercy of Allah; indeed, Allah forgives all sins."'
          }
        ]
      }
    ]
  }
];
