export interface CompanionInfo {
  id: string;
  order: number;
  nameAr: string;
  nameEn: string;
  titleBadgeAr: string;
  titleBadgeEn: string;
  fullNameAr: string;
  fullNameEn: string;
  kunyaAr: string;
  kunyaEn: string;
  birthYearAr: string;
  birthYearEn: string;
  deathYearAr: string;
  deathYearEn: string;
  burialPlaceAr: string;
  burialPlaceEn: string;
  kinshipAr: string;
  kinshipEn: string;
  gladTidingsHadithAr: string;
  gladTidingsHadithEn: string;
  keyQuoteAr: string;
  keyQuoteEn: string;
  
  preIslamicLife: {
    titleAr: string;
    titleEn: string;
    statusInQurayshAr: string;
    statusInQurayshEn: string;
    moralsAndNatureAr: string;
    moralsAndNatureEn: string;
    tradeAndKnowledgeAr: string;
    tradeAndKnowledgeEn: string;
  };
  
  embracingIslam: {
    titleAr: string;
    titleEn: string;
    storyAr: string;
    storyEn: string;
    earlyPrecedenceAr: string;
    earlyPrecedenceEn: string;
    advocacyAndSacrificesAr: string;
    advocacyAndSacrificesEn: string;
  };

  migrationAndJihad: {
    titleAr: string;
    titleEn: string;
    migrationStoryAr: string;
    migrationStoryEn: string;
    majorBattlesAr: string[];
    majorBattlesEn: string[];
    unmatchedSacrificesAr: string;
    unmatchedSacrificesEn: string;
  };

  virtuesAndMerits: {
    titleAr: string;
    titleEn: string;
    hadithsAndQuotesAr: { hadith: string; source: string }[];
    hadithsAndQuotesEn: { hadith: string; source: string }[];
    titlesAndHonorsAr: string[];
    titlesAndHonorsEn: string[];
    testimoniesAr: string[];
    testimoniesEn: string[];
  };

  postProphetEraAndLegacy: {
    titleAr: string;
    titleEn: string;
    stanceAtProphetsDeathAr: string;
    stanceAtProphetsDeathEn: string;
    roleOrCaliphateAr: string;
    roleOrCaliphateEn: string;
    majorAchievementsAr: string[];
    majorAchievementsEn: string[];
  };

  passingAndTributes: {
    titleAr: string;
    titleEn: string;
    deathDetailsAr: string;
    deathDetailsEn: string;
    lastWordsAr: string;
    lastWordsEn: string;
    restingPlaceAr: string;
    restingPlaceEn: string;
  };

  inspirationalLessonsAr: string[];
  inspirationalLessonsEn: string[];
}

export const TEN_PROMISED_COMPANIONS: CompanionInfo[] = [
  // 1. أبو بكر الصديق
  {
    id: 'abu-bakr',
    order: 1,
    nameAr: 'أبو بكر الصديق',
    nameEn: 'Abu Bakr As-Siddiq',
    titleBadgeAr: 'الخليفة الأول للمسلمين • الصدّيق • ثاني اثنين في الغار',
    titleBadgeEn: '1st Caliph of Islam • As-Siddiq • Companion in the Cave',
    fullNameAr: 'عبد الله بن عثمان (أبي قحافة) بن عامر بن عمرو بن كعب بن سعد بن تيم بن مرة القرشي التيمي',
    fullNameEn: 'Abdullah ibn Uthman (Abi Quhafah) ibn Amir ibn Amr ibn Ka\'b ibn Sa\'d ibn Taym ibn Murrah Al-Qurashi',
    kunyaAr: 'أبو بكر (ويُلقب بالعتيق لجمال وجهه وعتقه من النار، وبالصدّيق لتصديقه النبي ﷺ)',
    kunyaEn: 'Abu Bakr (Also titled Al-Ateeq and As-Siddiq)',
    birthYearAr: '573 م (بعد عام الفيل بنحو سنتين وستة أشهر)',
    birthYearEn: '573 CE (approx. 2 years and 6 months after the Year of the Elephant)',
    deathYearAr: '13 هـ / 634 م (عن عمر 63 سنة، كعمر النبي ﷺ)',
    deathYearEn: '13 AH / 634 CE (Aged 63, the same age as Prophet Muhammad ﷺ)',
    burialPlaceAr: 'المدينة المنورة (بجوار رسول الله ﷺ في حجرة عائشة رضي الله عنها)',
    burialPlaceEn: 'Al-Madinah Al-Munawwarah (Buried beside the Prophet ﷺ in the chamber of Aisha R.A.)',
    kinshipAr: 'صاحب رسول الله ﷺ الأقرب، ووالد زوجه عائشة أم المؤمنين رضي الله عنها، ويلتقي نسبه مع النبي ﷺ في جده السادس مرة بن كعب.',
    kinshipEn: 'Closest companion of the Prophet ﷺ, father of Aisha (Mother of the Believers R.A.), and lineages meet at Murrah ibn Ka\'b.',
    gladTidingsHadithAr: '«أَبُو بَكْرٍ فِي الْجَنَّةِ، وَعُمَرُ فِي الْجَنَّةِ، وَعُثْمَانُ فِي الْجَنَّةِ، وَعَلِيٌّ فِي الْجَنَّةِ، وَطَلْحَةُ فِي الْجَنَّةِ، وَالزُّبَيْرُ فِي الْجَنَّةِ، وَعَبْدُ الرَّحْمَنِ بْنُ عَوْفٍ فِي الْجَنَّةِ، وَسَعْدٌ فِي الْجَنَّةِ، وَسَعِيدٌ فِي الْجَنَّةِ، وَأَبُو عُبَيْدَةَ بْنُ الْجَرَّاحِ فِي الْجَنَّةِ» [صحيح الترمذي]',
    gladTidingsHadithEn: '"Abu Bakr is in Paradise, Umar is in Paradise, Uthman is in Paradise, Ali is in Paradise, Talha is in Paradise, Az-Zubayr is in Paradise, Abdur-Rahman ibn Awf is in Paradise, Sa\'d is in Paradise, Saeed is in Paradise, and Abu Ubaydah ibn Al-Jarrah is in Paradise." [Jami` at-Tirmidhi]',
    keyQuoteAr: '«من كان يعبد محمداً فإن محمداً قد مات، ومن كان يعبد الله فإن الله حي لا يموت»',
    keyQuoteEn: '"Whoever worshipped Muhammad, then Muhammad has passed away; but whoever worships Allah, Allah is Ever-Living and never dies."',

    preIslamicLife: {
      titleAr: 'أحواله ومكانته قبل الإسلام',
      titleEn: 'Life & Status Before Islam',
      statusInQurayshAr: 'كان أبو بكر من وجهاء قريش وأشرافها، وكان إليه أمر "الأشناق" (أي الديات وحمل الغرامات والتحكيم المالي بين بطون قريش)، وكان إذا تحمّل شيئاً صدّقته قريش وأمضت حكمه ورضيت به.',
      statusInQurayshEn: 'Abu Bakr was among the most noble and respected leaders of Quraysh. He was entrusted with the arbitration of blood money (Diyat) and financial compensations among Arab clans, and all tribes trusted his judgment.',
      moralsAndNatureAr: 'عُرف بسلامة فطرته وطهارة سريرته؛ فلم يشرب الخمر قط في الجاهلية قائلاً: "أصون عرضي وأحفظ مروءتي"، ولم يسجد لصنم قط طيلة حياته لعلمه ببطلان عبادتها، وكان محبباً لقومه، ليّن الجانب، عظيم الحياء.',
      moralsAndNatureEn: 'He possessed immaculate pure character and innate morality. He never drank alcohol in the pre-Islamic era, saying: "I protect my dignity and preserve my chivalry," nor did he ever bow down to an idol.',
      tradeAndKnowledgeAr: 'كان تاجراً غنياً صادقاً جواداً، وكان أعلم قريش بأنساب العرب وتاريخها وأيامها وأشعارها، مما جعل مجلسته مقصداً لأعيان العرب ورجالاتها.',
      tradeAndKnowledgeEn: 'He was a wealthy, honest cloth merchant and the most knowledgeable genealogist and historian of Arabian tribal lineage and history, making his company sought after by notables.'
    },

    embracingIslam: {
      titleAr: 'قصة إسلامه وسبقه الخالد',
      titleEn: 'Embracing Islam & His Precedence',
      storyAr: 'كان الصديق أول من أسلم من الرجال الأحرار البالغين. فعندما نزل الوحي على رسول الله ﷺ، أتى أبا بكر وعرض عليه الإسلام، فما تلعثم ولا تردد ولا كبا، بل أسلم من فوره وقال له النبي ﷺ لاحقاً: «ما دعوت أحداً إلى الإسلام إلا كانت له عنه كبوة وتردد، إلا ما كان من أبي بكر فإنه لم يتردد حين ذكرته له».',
      storyEn: 'He was the very first free adult man to accept Islam. When the Prophet ﷺ conveyed the divine revelation to him, he embraced it instantly without hesitation. The Prophet ﷺ later testified: "Whenever I invited anyone to Islam, they had hesitation, except Abu Bakr who accepted without a moment\'s delay."',
      earlyPrecedenceAr: 'لُقّب بالصديق صبيحة ليلة الإسراء والمعراج؛ حيث كذّبت قريش النبي ﷺ وهرعوا إلى أبي بكر يظنون أنه سيرتد، فقال قولته الخالدة: "إن كان قال ذلك فقد صدق! إني لأصدقه بأعجب من ذلك؛ أصدقه بخبر السماء يأتيه في غدوة أو روحة".',
      earlyPrecedenceEn: 'He was titled "As-Siddiq" (The Truthful Confirmer) following the Night Journey (Al-Isra & Al-Mi\'raj). When disbelievers tried to shake his faith, he declared: "If he said so, then he has spoken the truth! I believe him in what is greater than that—the revelation descending from the heavens."',
      advocacyAndSacrificesAr: 'لم يكن إسلامه سلبياً، بل دعا كبار رجال قريش فأسلم على يديه خمسة من العشرة المبشرين بالجنة: (عثمان بن عفان، وطلحة بن عبيد الله، والزبير بن العوام، وعبد الرحمن بن عوف، وسعد بن أبي وقاص). وسخّر ثروته كلها لعتق المعذبين والمستضعفين مثل بلال بن رباح وعامر بن فهيرة.',
      advocacyAndSacrificesEn: 'He immediately propagated the message, bringing five of the Ten Promised Paradise into Islam through his advocacy (Uthman, Talha, Az-Zubayr, Abdur-Rahman, and Sa\'d). He spent his fortune purchasing and emancipating tortured slaves, including Bilal ibn Rabah.'
    },

    migrationAndJihad: {
      titleAr: 'الهجرة والجهاد مع رسول الله ﷺ',
      titleEn: 'Migration & Stances in Jihad',
      migrationStoryAr: 'رافَق النبي ﷺ في رحلة الهجرة النبوية التاريخية من مكة إلى المدينة، وكان رفيقه الوحيد في غار ثور لثلاث ليالٍ، وخلّد القرآن الكريم هذا الموقف المهيب: ﴿إِلَّا تَنصُرُوهُ فَقَدْ نَصَرَهُ اللَّهُ إِذْ أَخْرَجَهُ الَّذِينَ كَفَرُوا ثَانِيَ اثْنَيْنِ إِذْ هُمَا فِي الْغَارِ إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا﴾.',
      migrationStoryEn: 'He accompanied the Prophet ﷺ on the historic Migration from Makkah to Madinah, staying together in the Cave of Thawr for three nights. The Holy Qur\'an immortalized this bond: "The second of the two, when they were in the cave, and he said to his companion: Do not grieve; indeed Allah is with us."',
      majorBattlesAr: [
        'غزوة بدر الكبرى (2 هـ): كان ملازماً لرسول الله ﷺ في العريش حارساً ومواسياً ومشاركاً في القيادة.',
        'غزوة أحد (3 هـ): ثبت بجوار النبي ﷺ دفاعاً عنه حين تفرق كثير من الناس.',
        'صلح الحديبية (6 هـ): وافق رأيه رأي النبي ﷺ تماماً حتى قبل أن يشرحه له.',
        'غزوة تبوك (9 هـ): جاء بماله كله وقال له النبي: "ما أبقيت لأهلك؟" قال: "أبقيت لهم الله ورسوله".',
        'حجة أبي بكر (9 هـ): أمّره رسول الله ﷺ على أول حجة للمسلمين لإرساء قواعد التوحيد.'
      ],
      majorBattlesEn: [
        'Battle of Badr (2 AH): Guarded and remained intimately beside the Prophet ﷺ in the command post.',
        'Battle of Uhud (3 AH): Stood steadfast defending the Prophet ﷺ when battle chaos unfolded.',
        'Treaty of Hudaybiyyah (6 AH): Endorsed the Prophet\'s wisdom and reassured the companions with unwavering clarity.',
        'Expedition of Tabuk (9 AH): Donated his entire wealth. When asked what he left for his family, he replied: "I left them Allah and His Messenger."',
        'Leading the Hajj (9 AH): Appointed by the Prophet ﷺ to lead the very first Islamic pilgrimage.'
      ],
      unmatchedSacrificesAr: 'قدّم كل ما يملك من مال ونفس وولد في سبيل نصرة الدين، وكان أغير الناس على رسول الله ﷺ، وقد ضربه كفار قريش في مكة حتى ورم وجهه وما سأل حين أفاق إلا عن رسول الله ﷺ.',
      unmatchedSacrificesEn: 'He sacrificed all his wealth, soul, and family for Islam. When severely beaten in Makkah until unconscious, the very first word he uttered upon waking was: "How is the Messenger of Allah?"'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«لَوْ كُنْتُ مُتَّخِذًا خَلِيلًا غَيْرَ رَبِّي لَاتَّخَذْتُ أَبَا بَكْرٍ خَلِيلًا، وَلَكِنْ أُخُوَّةُ الإِسْلَامِ وَمَوَدَّتُهُ»', source: 'صحيح البخاري' },
        { hadith: '«مَنْ أَنْفَقَ زَوْجَيْنِ فِي سَبِيلِ اللَّهِ نُودِيَ مِنْ أَبْوَابِ الجَنَّةِ... فَقَالَ أَبُو بَكْرٍ: هَلْ يُدْعَى أَحَدٌ مِنْ تِلْكَ الأَبْوَابِ كُلِّهَا؟ قَالَ: نَعَمْ، وَأَرْجُو أَنْ تَكُونَ مِنْهُمْ»', source: 'متفق عليه' },
        { hadith: '«أَرْحَمُ أُمَّتِي بِأُمَّتِي أَبُو بَكْرٍ»', source: 'صحيح الترمذي' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"If I were to take a Khalil (intimate friend) other than my Lord, I would have chosen Abu Bakr, but he is my brother and companion in Islam."', source: 'Sahih Al-Bukhari' },
        { hadith: '"Whoever spends a pair of things in the cause of Allah will be called from all the gates of Paradise... Abu Bakr asked: Will anyone be called from all of them? The Prophet replied: Yes, and I hope you will be one of them."', source: 'Sahih Al-Bukhari & Muslim' },
        { hadith: '"The most merciful of my Ummah towards my Ummah is Abu Bakr."', source: 'Jami` at-Tirmidhi' }
      ],
      titlesAndHonorsAr: [
        'الصديق الأكبر وثاني اثنين في الغار بنص القرآن الكريم.',
        'أول الخلفاء الراشدين المهديين وأفضل البشر بعد الأنبياء والمرسلين بإجماع أهل السنة.',
        'الرجل الوحيد الذي يُدعى من أبواب الجنة الثمانية جميعها تكريماً وتفضيطاً.',
        'اختاره النبي ﷺ لإمامة المسلمين في الصلاة في مرض وفاته الشريفة.'
      ],
      titlesAndHonorsEn: [
        'As-Siddiq Al-Akbar, titled by Allah in the Qur\'an as "The second of the two in the cave".',
        'First of the Rightly-Guided Caliphs and greatest human after the Prophets by consensus.',
        'Promised entry into Paradise from any of its eight gates he chooses.',
        'Explicitly designated by the Prophet ﷺ to lead the Muslims in prayer during his final illness.'
      ],
      testimoniesAr: [
        'قال علي بن أبي طالب رضي الله عنه: "والله ما استبقنا إلى خير قط إلا وسبقنا إليه أبو بكر".',
        'قال عمر بن الخطاب رضي الله عنه: "وددت أني شعرة في صدر أبي بكر، ليلة من أبي بكر ويوم خير من آل عمر".'
      ],
      testimoniesEn: [
        'Ali ibn Abi Talib (R.A.) said: "By Allah, whenever we competed in doing good, Abu Bakr preceded us."',
        'Umar ibn Al-Khattab (R.A.) said: "A single day and night of Abu Bakr is better than all of the family of Umar."'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'خلافته ومآثره بعد وفاة النبي ﷺ',
      titleEn: 'Caliphate & Immortal Achievements',
      stanceAtProphetsDeathAr: 'حين صُدم المسلمون بوفاة النبي ﷺ وذهل عمر، خرج أبو بكر بكل ثبات ويقين وتلا قول الله تعالى: ﴿وَمَا مُحَمَّدٌ إِلَّا رَسُولٌ قَدْ خَلَتْ مِن قَبْلِهِ الرُّسُلُ﴾، فثبّت الأمة وأعاد إليها السكينة والتوازن.',
      stanceAtProphetsDeathEn: 'When the Ummah was devastated by the Prophet\'s passing, Abu Bakr stood resolute, reciting: "Muhammad is not but a messenger; other messengers have passed on before him," stabilizing the entire nation with sublime faith.',
      roleOrCaliphateAr: 'بويع بالخلافة في سقيفة بني ساعدة (11 هـ). واستمرت خلافته سنتين وثلاثة أشهر، وكانت من أعظم فترات التاريخ الإسلامي حسماً وتثبيتاً للدين.',
      roleOrCaliphateEn: 'Pledged allegiance at Saqifah Bani Sa\'idah (11 AH). His caliphate lasted 2 years and 3 months, yet became one of the most transformative eras in Islamic history.',
      majorAchievementsAr: [
        'إنفاذ جيش أسامة بن زيد تنفيذاً لوصية النبي ﷺ رغم اعتراض البعض لصعوبة الظروف.',
        'حروب الردة: حارب المرتدين ومانعي الزكاة بمقولته الشهيرة: "أينقص الدين وأنا حي؟ والله لو منعوني عقالاً كانوا يؤدونه لرسول الله لقاتلتهم عليه".',
        'جمع القرآن الكريم: أمر زيد بن ثابت بجمع المصحف الشريف بعد استشهاد القراء في معركة اليمامة.',
        'بدء الفتوحات الإسلامية الكبرى لتحرير العراق والشام من كسرى وقيصر وتعيين خالد بن الوليد وأبي عبيدة.'
      ],
      majorAchievementsEn: [
        'Dispatching Usama ibn Zayd\'s army strictly honoring the Prophet\'s instructions.',
        'The Wars of Apostasy (Riddah): Safeguarding the pillars of Islam, uttering: "Shall religion diminish while I am alive?"',
        'Compiling the Holy Qur\'an: Commissioning Zayd ibn Thabit to gather the Qur\'an into one written compilation.',
        'Launching the great Islamic liberations of Iraq and the Levant against Byzantine and Sasanian tyranny.'
      ]
    },

    passingAndTributes: {
      titleAr: 'وفاته وتوديعه للأمة',
      titleEn: 'Passing & Farewell',
      deathDetailsAr: 'مرض رضي الله عنه في جمادى الآخرة سنة 13 هـ، واستمر مرضه خمسة عشر يوماً، فاستخلف عمر بن الخطاب بعد استشارة كبار الصحابة رضوان الله عليهم جميعاً.',
      deathDetailsEn: 'He fell ill in Jumada Al-Akhirah 13 AH for fifteen days, nominating Umar ibn Al-Khattab after consulting the senior companions.',
      lastWordsAr: 'كانت آخر كلماته في الدنيا تلاوة قول الله تعالى: ﴿تَوَفَّنِي مُسْلِمًا وَأَلْحِقْنِي بِالصَّالِحِينَ﴾.',
      lastWordsEn: 'His last words in this world were the Quranic verse: "Cause me to die a Muslim and join me with the righteous." [Yusuf: 101]',
      restingPlaceAr: 'توفي ليلة الثلاثاء 22 جمادى الآخرة 13 هـ، ودُفن ليلتها إلى جوار رسول الله ﷺ وجعل رأسه عند كتفي النبي ﷺ في حجرة عائشة.',
      restingPlaceEn: 'He passed away on Tuesday night, 22 Jumada Al-Akhirah 13 AH, and was buried beside Prophet Muhammad ﷺ with his head near the Prophet\'s shoulders.'
    },

    inspirationalLessonsAr: [
      'اليقين المطلق في نصر الله وحفظه، والتصديق القلبي الصادق دون تردد.',
      'إنفاق المال والجهد الخالص في سبيل المبادئ الحقة دون انتظار المقابل.',
      'الثبات في اللحظات الحرجة والأزمات الكبرى التي تعصف بالأمم.',
      'التواضع الشديد مع عظمة المنصب؛ كان يحلب شياه الأرامل والضعفاء وهو خليفة للمسلمين.'
    ],
    inspirationalLessonsEn: [
      'Unshakable conviction in Allah\'s promise and truthful endorsement without skepticism.',
      'Selfless generosity and dedicating resources for divine truth without worldly expectations.',
      'Steadfast leadership in historical crises and moments of collective shock.',
      'Profound humility; milking the sheep of poor widows even while serving as Caliph of the Muslim world.'
    ]
  },

  // 2. عمر بن الخطاب
  {
    id: 'umar-ibn-khattab',
    order: 2,
    nameAr: 'عمر بن الخطاب',
    nameEn: 'Umar ibn Al-Khattab',
    titleBadgeAr: 'الخليفة الثاني للمسلمين • الفاروق • أمير المؤمنين',
    titleBadgeEn: '2nd Caliph of Islam • Al-Farooq • Commander of the Faithful',
    fullNameAr: 'عمر بن الخطاب بن نفيل بن عبد العزى بن رياح بن عبد الله بن قرط بن رزاح بن عدي بن كعب القرشي العدوي',
    fullNameEn: 'Umar ibn Al-Khattab ibn Nufayl ibn Abd Al-Uzza ibn Riyah ibn Abdullah ibn Qurṭ ibn Razah ibn Adiy ibn Ka\'b Al-Qurashi',
    kunyaAr: 'أبو حفص (ولقّبه رسول الله ﷺ بالفاروق لأن الله فرّق به بين الحق والباطل)',
    kunyaEn: 'Abu Hafs (Titled Al-Farooq by the Prophet ﷺ because Allah separated truth from falsehood through him)',
    birthYearAr: '584 م (بعد عام الفيل بثلاث عشرة سنة)',
    birthYearEn: '584 CE (approx. 13 years after the Year of the Elephant)',
    deathYearAr: '23 هـ / 644 م (استشهد محرابياً في صلاة الفجر وعمره 63 سنة)',
    deathYearEn: '23 AH / 644 CE (Martyred while leading Fajr prayer, aged 63)',
    burialPlaceAr: 'المدينة المنورة (بجوار رسول الله ﷺ وأبي بكر الصديق في الروضة الشريفة)',
    burialPlaceEn: 'Al-Madinah Al-Munawwarah (Buried beside the Prophet ﷺ and Abu Bakr in the Prophet\'s chamber)',
    kinshipAr: 'صهر رسول الله ﷺ (والد أم المؤمنين حفصة رضي الله عنها)، ويلتقي نسبه مع النبي ﷺ في جده كعب بن لؤي.',
    kinshipEn: 'Father-in-law of the Prophet ﷺ (father of Hafsa R.A.), lineage meets the Prophet at Ka\'b ibn Lu\'ayy.',
    gladTidingsHadithAr: '«عُمَرُ فِي الْجَنَّةِ... وَرَأَيْتُ قَصْرًا أَبْيَضَ فِي الجَنَّةِ، فَقُلْتُ: لِمَنْ هَذَا؟ قَالُوا: لِعُمَرَ بْنِ الخَطَّابِ» [صحيح البخاري ومسلم]',
    gladTidingsHadithEn: '"Umar is in Paradise... and I saw a white palace in Paradise, so I asked: Whose is this? They said: For Umar ibn Al-Khattab." [Sahih Al-Bukhari & Muslim]',
    keyQuoteAr: '«متى استعبدتم الناس وقد ولدتهم أمهاتهم أحراراً؟» وقوله: «لو عثرت بغلة في العراق لسألني الله عنها: لمَ لم تسوّ لها الطريق يا عمر؟»',
    keyQuoteEn: '"Since when have you enslaved people while their mothers bore them free?" and "If a mule stumbled in Iraq, I fear Allah would question me: Why did you not pave the road for it, O Umar?"',

    preIslamicLife: {
      titleAr: 'أحواله ومكانته قبل الإسلام',
      titleEn: 'Life & Status Before Islam',
      statusInQurayshAr: 'كانت إليه السفارة في الجاهلية؛ فإذا وقعت حرب بين قريش وغيرها بعثوه سفيراً ومناظراً، وإذا نافرهم أحد بمفاخرة أو مفاصلة أرسلوا عمراً لرجاحة عقله وفصاحته وقوته.',
      statusInQurayshEn: 'He held the role of official ambassador for Quraysh in pre-Islamic times. Whenever disputes arose with other tribes, Umar was dispatched as negotiator and diplomat.',
      moralsAndNatureAr: 'كان رجلاً شديد البأس، مهيب الطلعة، حاد الذكاء، صريحاً في الحق، فارساً شجاعاً، يحب الشعر ويتذوقه، وكان شديد الغيرة على تقاليد قومه قبل أن يشرح الله صدره للإسلام.',
      moralsAndNatureEn: 'Renowned for towering stature, formidable presence, intellectual sharpness, and bravery. He was an eloquent orator and poetic connoisseur with fierce protective honor.',
      tradeAndKnowledgeAr: 'عمل برعي الإبل في صباه لوالده ولخالاته، ثم دخل عالم التجارة فسافر في رحلات الشتاء والصيف إلى بلاد الشام واليمن واكتسب حنكة سياسية وإدارية واسعة.',
      tradeAndKnowledgeEn: 'He herded camels in his youth and later engaged in regional caravan commerce traveling to the Levant and Yemen, honing immense strategic and organizational acumen.'
    },

    embracingIslam: {
      titleAr: 'قصة إسلامه العظيمة',
      titleEn: 'Embracing Islam & Divine Answer',
      storyAr: 'كان إسلامه استجابة لدعوة النبي ﷺ: «اللَّهُمَّ أَعِزَّ الإِسْلَامَ بِأَحَبِّ هَذَيْنِ الرَّجُلَيْنِ إِلَيْكَ: بِأَبِي جَهْلٍ أَوْ بِعُمَرَ بْنِ الخَطَّابِ». خرج متوشحاً سيفه لقتل النبي ﷺ، فلقيه نعيم بن عبد الله فأخبره بإسلام أخته فاطمة وزوجها سعيد بن زيد، فذهب إليهما غاضباً، وسمع سورة طه، فلما قرأها خشع قلبه وارتعد وقال: "ما أحسن هذا الكلام وأكرمه!" ومضى إلى دار الأرقم وأعلن إسلامه بين يدي النبي ﷺ فكبّر الصحابة تكبيرة رَجّت مكة.',
      storyEn: 'His conversion was the direct fulfillment of the Prophet\'s prayer: "O Allah! Strengthen Islam with whichever of these two men is more beloved to You: Abu Jahl or Umar ibn Al-Khattab." He set out armed to harm the Prophet, learned his sister and brother-in-law had accepted Islam, read verses from Surah Taha, wept, and embraced Islam at Dar Al-Arqam to joyful chants of Takbir echoing across Makkah.',
      earlyPrecedenceAr: 'قال عبد الله بن مسعود رضي الله عنه: "ما زلنا أعزة منذ أسلم عمر، كان إسلام عمر فتحاً، وكانت هجرته نصراً، وكانت إمارته رحمة". خرج المسلمون أول مرة يصلون جهراً في الكعبة في صفين؛ أحدهما يقوده عمر والآخر حمزة.',
      earlyPrecedenceEn: 'Abdullah ibn Mas\'ud stated: "We have remained mighty ever since Umar accepted Islam. His conversion was an opening, his migration was a victory, and his caliphate was a mercy." For the first time, Muslims prayed publicly at the Ka\'bah.',
      advocacyAndSacrificesAr: 'هاجر علانية متحدياً قريشاً، وقال قولته الشهيرة عند الكعبة: "من أراد أن تثكله أمه وييتم ولده وتُرمل زوجته فليلقني وراء هذا الوادي"، فما تبعه أحد من كفار قريش خوفاً من بأسه.',
      advocacyAndSacrificesEn: 'He migrated openly and fearlessly, declaring before the Ka\'bah: "Whoever wishes his mother to be bereaved and his children orphaned, let him meet me behind this valley." Not a single disbeliever dared challenge him.'
    },

    migrationAndJihad: {
      titleAr: 'الهجرة والجهاد مع رسول الله ﷺ',
      titleEn: 'Migration & Stances in Jihad',
      migrationStoryAr: 'هاجر إلى المدينة واستقر في قباء، وكان الوزير الثاني لرسول الله ﷺ ومستشاره الأقرب بعد أبي بكر الصديق.',
      migrationStoryEn: 'He migrated to Madinah and became the second core vizier and trusted counselor of the Prophet ﷺ alongside Abu Bakr.',
      majorBattlesAr: [
        'شهد بدراً الكبرى وقتل فيها خاله العاص بن هشام بن المغيرة إعلاءً لراية العقيدة فوق رابطة النسب.',
        'ثبت في أحد بجوار النبي ﷺ وردّ على أبي سفيان مقولته الشهيرة: "الله أعلى وأجل، لا سواء؛ قتلانا في الجنة وقتلاكم في النار".',
        'شهد الخندق والحديبية وبيعة الرضوان وفتح مكة وحنين وتبوك وحجة الوداع.'
      ],
      majorBattlesEn: [
        'Fought valiantly at Badr, demonstrating that devotion to faith superseded tribal allegiance.',
        'Stood firm at Uhud, answering Abu Sufyan boldly: "Allah is Supreme and Exalted! We are not equal: our deceased are in Paradise, and yours in Hellfire."',
        'Participated in the Trench, Hudaybiyyah, Pledge of Ridwan, Liberation of Makkah, Hunayn, Tabuk, and the Farewell Pilgrimage.'
      ],
      unmatchedSacrificesAr: 'وافق الوحي القرآني في مواضع عدة (موافقات عمر)، كأسرى بدر، واتخاذ مقام إبراهيم مصلى، والحجاب، وتحريم الخمر.',
      unmatchedSacrificesEn: 'The Quranic revelation concurred with Umar\'s insights on multiple occasions ("Muwafaqat Umar"), including Maqam Ibrahim as a place of prayer, hijab, and prisoners of Badr.'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«إِنَّ اللَّهَ جَعَلَ الحَقَّ عَلَى لِسَانِ عُمَرَ وَقَلْبِهِ»', source: 'صحيح الترمذي' },
        { hadith: '«وَالَّذِي نَفْسِي بِيَدِهِ، مَا لَقِيَكَ الشَّيْطَانُ سَالِكًا فَجًّا قَطُّ إِلَّا سَلَكَ فَجًّا غَيْرَ فَجِّكَ»', source: 'صحيح البخاري' },
        { hadith: '«إِنَّهُ قَدْ كَانَ فِيمَا مَضَى قَبْلَكُمْ مِنَ الأُمَمِ مُحَدَّثُونَ، وَإِنَّهُ إِنْ كَانَ فِي أُمَّتِي هَذِهِ مِنْهُمْ فَإِنَّهُ عُمَرُ بْنُ الخَطَّابِ»', source: 'صحيح مسلم' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"Indeed, Allah has placed the truth upon Umar\'s tongue and in his heart."', source: 'Jami` at-Tirmidhi' },
        { hadith: '"By the One in Whose Hand is my soul, whenever Satan sees you walking along a path, he surely takes a path other than yours."', source: 'Sahih Al-Bukhari' },
        { hadith: '"Among the nations before you there were inspired persons; if there is one such person among my followers, it is Umar ibn Al-Khattab."', source: 'Sahih Muslim' }
      ],
      titlesAndHonorsAr: [
        'الفاروق، وأول من لُقّب بـ "أمير المؤمنين".',
        'مؤسس التقويم الهجري ودواوين الدولة الإسلامية ونظام الحسبة وبيت المال.',
        'سيد شهداء المحراب ورجل الإلهام والعدل المطلق.'
      ],
      titlesAndHonorsEn: [
        'Al-Farooq, and the very first to be titled "Amir Al-Mu\'minin" (Commander of the Faithful).',
        'Founder of the Hijri calendar, state administrative registries (Diwans), and the treasury (Bayt Al-Mal).',
        'Epitome of justice, inspired wisdom, and beloved martyr of the prayer niche.'
      ],
      testimoniesAr: [
        'قال علي بن أبي طالب رضي الله عنه: "ما كنا نبعد أن السكينة تنطق على لسان عمر".',
        'قال حذيفة بن اليمان رضي الله عنه: "كان عمر باباً موثقاً بين الإسلام وبين الفتن، فلما كُسر الباب هاجت الفتن".'
      ],
      testimoniesEn: [
        'Ali ibn Abi Talib (R.A.) said: "We would not consider it far-fetched that tranquil divine inspiration spoke through the tongue of Umar."',
        'Hudhayfah (R.A.) said: "Umar was a closed fortress door shielding Islam from tribulations; when that door was broken, tribulations surged."'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'خلافته العادلة وفتوحاته الكبرى',
      titleEn: 'Just Caliphate & Vast Liberations',
      stanceAtProphetsDeathAr: 'كان الساعد الأيمن لأبي بكر الصديق في حروب الردة وإدارة شؤون المسلمين، وهو الذي أشار عليه بجمع المصحف الشريف.',
      stanceAtProphetsDeathEn: 'He served as Abu Bakr\'s chief right hand through the Riddah wars, and advocated decisively for compiling the Holy Qur\'an into one book.',
      roleOrCaliphateAr: 'تولى الخلافة عشر سنين وستة أشهر (13 - 23 هـ). فتح الله في عهده بلاد فارس والشام ومصر وبيت المقدس وأسقط إمبراطوريتي كسرى وقيصر.',
      roleOrCaliphateEn: 'Led the Caliphate for 10.5 years (13 - 23 AH). Under his rule, the Persian Empire collapsed, the Levant, Egypt, and Jerusalem were liberated.',
      majorAchievementsAr: [
        'العهدة العمرية: وثيقة تاريخية تاريخية خالدة لأهل إيلياء (القدس) أرست مبادئ التسامح الديني وحرية العبادة.',
        'تأسيس التقويم الهجري انطلاقاً من هجرة النبي ﷺ.',
        'إنشاء المدن والأمصار الإسلامية كالبصرة والكوفة والفسطاط.',
        'تأسيس ديوان الجند، بيت المال، العسس (الشرطة الليلية)، والبريد، وإرساء نظام الرعاية الاجتماعية للأطفال والمحتاجين.'
      ],
      majorAchievementsEn: [
        'The Covenant of Umar (Al-Uhda Al-Umariyya): Eternal charter guaranteeing freedom of worship and sanctuary for the people of Jerusalem.',
        'Inaugurated the Islamic Hijri calendar starting from the Prophet\'s Migration.',
        'Established foundational urban centers: Basra, Kufa, and Fustat.',
        'Created registries of army stipends, night patrols (Al-Asas), public postal couriers, and welfare subsidies for newborns and the elderly.'
      ]
    },

    passingAndTributes: {
      titleAr: 'استشهاده محرابياً',
      titleEn: 'Martyrdom in the Mihrab',
      deathDetailsAr: 'طعنه أبو لؤلؤة المجوسي غدراً وهو يؤم المسلمين في صلاة الفجر بثلاث طعنات بخنجر مسموم ذي شعبتين أواخر ذي الحجة سنة 23 هـ.',
      deathDetailsEn: 'Stabbed treacherously by Abu Lu\'lu\'ah the Persian while leading Muslims in Fajr prayer with a poisoned dagger in late Dhu al-Hijjah 23 AH.',
      lastWordsAr: 'سأل لما أفاق: "من قتلني؟" فقالوا: غلام المغيرة، فقال: "الحمد لله الذي لم يجعل منيتي بيد رجل سجد لله سجدة"، وأوصى بالشورى في ستة من العشرة المبشرين بالجنة.',
      lastWordsEn: 'Upon waking, he asked: "Who struck me?" When told, he whispered: "Praise be to Allah Who did not cause my death at the hands of one who prostrated once to Allah," designating the Shura council among six of the Ten Promised Paradise.',
      restingPlaceAr: 'استأذن عائشة رضي الله عنها أن يُدفن إلى جوار صاحبيه، فقالت: "كنت أريده لنفسي، ولأوثرنّه اليوم على نفسي"، فدُفن بجوار النبي ﷺ وأبي بكر.',
      restingPlaceEn: 'He humbly requested Aisha\'s permission to be buried next to his two companions. She replied: "I had intended that spot for myself, but today I will give him preference over myself."'
    },

    inspirationalLessonsAr: [
      'العدالة المطلقة التي لا تفرق بين حاكم ومحكوم، وقريب وغريب.',
      'الزهد في الدنيا والعيش بمستوى أفقر رعايا الدولة وهو يحكم أعظم إمبراطورية.',
      'قوة الهيبة مع رقة القلب والخشية الشديدة من الحساب بين يدي الله.',
      'التخطيط المؤسسي وبناء الأنظمة المستدامة لخدمة الإنسان.'
    ],
    inspirationalLessonsEn: [
      'Absolute justice that makes zero distinction between ruler and citizen, strong or weak.',
      'Stunning asceticism, dressing in patched garments while ruling the world\'s greatest empire.',
      'Commanding awe paired with soft-heartedness and profound fear of standing before Allah.',
      'Visionary institutional governance building resilient systems that serve society.'
    ]
  },

  // 3. عثمان بن عفان
  {
    id: 'uthman-ibn-affan',
    order: 3,
    nameAr: 'عثمان بن عفان',
    nameEn: 'Uthman ibn Affan',
    titleBadgeAr: 'الخليفة الثالث للمسلمين • ذو النورين • جامع القرآن',
    titleBadgeEn: '3rd Caliph of Islam • Dhun-Noorayn • Compiler of the Quran',
    fullNameAr: 'عثمان بن عفان بن أبي العاص بن أمية بن عبد شمس بن عبد مناف القرشي الأموي',
    fullNameEn: 'Uthman ibn Affan ibn Abi Al-Aas ibn Umayyah ibn Abd Shams ibn Abd Manaf Al-Qurashi',
    kunyaAr: 'أبو عبد الله (ويُكنى أيضاً بأبي عمرو، ولُقّب بذي النورين لزواجه من ابنتي النبي ﷺ رقية وأم كلثوم)',
    kunyaEn: 'Abu Abdullah (Also Abu Amr, titled Dhun-Noorayn - Possessor of Two Lights - for marrying the Prophet\'s two daughters)',
    birthYearAr: '576 م (بعد عام الفيل بست سنين في الطائف)',
    birthYearEn: '576 CE (approx. 6 years after the Year of the Elephant)',
    deathYearAr: '35 هـ / 656 م (استشهد صائماً يتلو القرآن وعمره 82 سنة)',
    deathYearEn: '35 AH / 656 CE (Martyred while fasting and reciting the Qur\'an, aged 82)',
    burialPlaceAr: 'المدينة المنورة (مقبرة البقيع الشريف)',
    burialPlaceEn: 'Al-Madinah Al-Munawwarah (Al-Baqi Cemetery)',
    kinshipAr: 'صهر رسول الله ﷺ؛ تزوّج رقية، فلما ماتت زوّجه النبي ﷺ أختها أم كلثوم وقال: "لو كان لنا ثالثة لزوّجناك إياها يا عثمان"، ويلتقي نسبه بالنبي ﷺ في عبد مناف.',
    kinshipEn: 'Son-in-law of the Prophet ﷺ; married Ruqayyah, and after her demise, Umm Kulthum. The Prophet ﷺ said: "If we had a third daughter, we would have married her to you, O Uthman."',
    gladTidingsHadithAr: '«عُثْمَانُ فِي الْجَنَّةِ... وَبَشِّرْ عُثْمَانَ بِالْجَنَّةِ عَلَى بَلْوَى تُصِيبُهُ» [متفق عليه]',
    gladTidingsHadithEn: '"Uthman is in Paradise... and convey glad tidings of Paradise to Uthman along with a tribulation that will afflict him." [Sahih Al-Bukhari & Muslim]',
    keyQuoteAr: '«لو طهرت قلوبكم ما شبعت من كلام ربكم»',
    keyQuoteEn: '"If your hearts were truly pure, they would never have their fill of the words of your Lord."',

    preIslamicLife: {
      titleAr: 'أحواله ومكانته قبل الإسلام',
      titleEn: 'Life & Status Before Islam',
      statusInQurayshAr: 'كان عثمان من أغنى قريش وأرفعهم حسباً وجمالاً وحياءً، وكانت له منزلة رفيعة عند أهل مكة، حتى إن أمهات قريش كن يرقصن أطفالهن قائلات: "أحبك والرحمن، حب قريش لعثمان".',
      statusInQurayshEn: 'One of the wealthiest and most revered aristocrats of Quraysh, beloved for beauty, refinement, and integrity. Mothers sang to their children: "I love you by the Most Merciful, as Quraysh loves Uthman."',
      moralsAndNatureAr: 'عُرف بالحياء الأسطوري؛ قال عن نفسه: "ما زنيت في جاهلية ولا إسلام، ولا تمنيت عورة أحد قط"، ولم يشرب خمراً قط ولا عبد صنماً.',
      moralsAndNatureEn: 'Celebrated for legendary modesty. He said: "I never committed adultery neither in Jahiliyyah nor Islam, nor did I ever gaze upon anyone\'s private areas." He never touched wine or idols.',
      tradeAndKnowledgeAr: 'كان تاجراً خبيراً واسع الثراء، يستثمر أمواله في الصفقات الشريفة ويعين الضعفاء والمحتاجين.',
      tradeAndKnowledgeEn: 'A master merchant who ran ethical mercantile ventures, utilizing his riches to sponsor the impoverished and destitute.'
    },

    embracingIslam: {
      titleAr: 'إسلامه المبارك',
      titleEn: 'Embracing Islam',
      storyAr: 'دعاه أبو بكر الصديق إلى الإسلام في الأيام الأولى، فاستجاب على الفور ودخل على النبي ﷺ وشهد شهادة الحق، فكان رابع من أسلم من الرجال.',
      storyEn: 'Invited by Abu Bakr in the earliest dawn of Islam; he accepted immediately, becoming the fourth free adult male to embrace the faith.',
      earlyPrecedenceAr: 'صاحب الهجرتين؛ أول من هاجر بأهله إلى الحبشة فراراً بدينهم، فقال فيهما النبي ﷺ: «إِنَّهُمَا لَأَوَّلُ مَنْ هَاجَرَ إِلَى اللَّهِ بَعْدَ لُوطٍ عَلَيْهِ السَّلَامُ».',
      earlyPrecedenceEn: 'Hero of the Two Migrations; led the first migration with his family to Abyssinia, prompting the Prophet ﷺ to say: "They are the first to migrate for Allah\'s sake after Prophet Lot."',
      advocacyAndSacrificesAr: 'تحمّل تعذيب عمه الحكم بن أبي العاص الذي شدّ عليه وثاقه ليترد، فقال عثمان: "والله لا أدعه أبداً ولا أفارقه"، حتى تركه عمه يائساً.',
      advocacyAndSacrificesEn: 'Endured brutal torture by his uncle Al-Hakam, who bound him in chains. Uthman declared: "By Allah, I will never abandon this faith!" until his uncle gave up in despair.'
    },

    migrationAndJihad: {
      titleAr: 'جهاده وبذله الأسطوري',
      titleEn: 'Sacrifices & Historic Charity',
      migrationStoryAr: 'هاجر إلى الحبشة ثم إلى المدينة المنورة، ووهب ماله وثقله كله لخدمة مجتمع الأنصار والمهاجرين.',
      migrationStoryEn: 'Migrated to Abyssinia and subsequently to Madinah, devoting his monumental wealth to support the emerging community.',
      majorBattlesAr: [
        'تخلّف عن بدر بأمر النبي ﷺ لتمريض زوجته رقية بنت النبي، وضرب له النبي ﷺ بسهمه وأجره واعتبره من أهل بدر.',
        'شهد أحداً والخندق وجميع الغزوات، وكان سفير رسول الله ﷺ إلى قريش في الحديبية، وبايع النبي ﷺ عنه بيعة الرضوان بيده الشريفة قائلاً: «هَذِهِ يَدُ عُثْمَانَ».',
        'تجهيز جيش العسرة (غزوة تبوك): اشترى تسعمائة وخمسين بعيراً وخمسين فرساً، وصبّ في حجر النبي ﷺ ألف دينار ذهبي، فقلّبها النبي مسروراً وقال: «مَا ضَرَّ عُثْمَانَ مَا عَمِلَ بَعْدَ اليَوْمِ».',
        'شراء بئر رومة: جعلها وقفاً عذباً للمسلمين إلى يوم القيامة.'
      ],
      majorBattlesEn: [
        'Stayed back from Badr exclusively by the Prophet\'s command to nurse his critically ill wife Ruqayyah; the Prophet ﷺ awarded him full spoils and status of Badr veterans.',
        'Emissary of the Prophet ﷺ to Makkah at Hudaybiyyah. The Prophet ﷺ placed his own hand over the other for the Pledge of Ridwan, declaring: "This hand is Uthman\'s."',
        'Equipping the Army of Hardship (Tabuk): Provided 950 camels, 50 horses, and 1,000 gold dinars. The Prophet ﷺ exclaimed: "Nothing Uthman does after today can harm him!"',
        'Purchased the Well of Ruma: Dedicated it as a public freshwater endowment for Muslims forever.'
      ],
      unmatchedSacrificesAr: 'في عام الرمادة والقحط في عهد أبي بكر، وصلت قافلة تجارية لعثمان بألف بعير، فساومه تجار المدينة لشرائها بأضعاف، فقال: "قد بعتها لمن أعطاني بالدرهم عشرة"، ووزعها كلها صدقة لوجه الله.',
      unmatchedSacrificesEn: 'During famine in Madinah, his 1,000-camel supply caravan arrived. When merchants offered high profit, he said: "I sold it to the One Who pays tenfold per dirham," donating all of it free to the poor.'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«أَلَا أَسْتَحِي مِنْ رَجُلٍ تَسْتَحِي مِنْهُ المَلَائِكَةُ؟»', source: 'صحيح مسلم' },
        { hadith: '«مَنْ حَفَرَ بِئْرَ رُومَةَ فَلَهُ الجَنَّةُ» (فحفرها عثمان)', source: 'صحيح البخاري' },
        { hadith: '«لِكُلِّ نَبِيٍّ رَفِيقٌ، وَرَفِيقِي فِي الجَنَّةِ عُثْمَانُ»', source: 'سنن الترمذي' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"Shall I not feel bashful before a man in whose presence the Angels feel bashful?"', source: 'Sahih Muslim' },
        { hadith: '"Whoever buys and digs the Well of Ruma will have Paradise." (Uthman bought it)', source: 'Sahih Al-Bukhari' },
        { hadith: '"Every Prophet has a companion in Paradise, and my companion in Paradise is Uthman."', source: 'Jami` at-Tirmidhi' }
      ],
      titlesAndHonorsAr: [
        'ذو النورين، لا يُعرف أحد تزوج بنتي نبي غيره من لدن آدم إلى قيام الساعة.',
        'جامع القرآن الكريم على حرف وقراءة واحدة جامعة للأمة حمتها من الاختلاف.',
        'صاحب الحياء الرباني الذي تستحي منه الملائكة الكرام.'
      ],
      titlesAndHonorsEn: [
        'Dhun-Noorayn; no other human from Adam until the Day of Resurrection married two daughters of a Prophet.',
        'Compiler of the standardized Holy Qur\'an (Al-Mushaf Al-Imam) uniting the Ummah on an authentic script.',
        'Epitome of divine modesty honored by the angels of heaven.'
      ],
      testimoniesAr: [
        'قال ابن عمر رضي الله عنهما: "كنا نعد في زمن النبي ﷺ: أبو بكر، ثم عمر، ثم عثمان".',
        'قال علي بن أبي طالب رضي الله عنه: "عثمان كان رجلاً يُدعى في الملأ الأعلى ذا النورين".'
      ],
      testimoniesEn: [
        'Ibn Umar (R.A.) stated: "During the lifetime of the Prophet ﷺ, we recognized: Abu Bakr, then Umar, then Uthman."',
        'Ali ibn Abi Talib (R.A.) said: "Uthman is called in the Highest Assembly: Dhun-Noorayn."'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'خلافته وإنجازه الخالد في جمع المصحف',
      titleEn: 'Caliphate & Gathering the Mushaf',
      stanceAtProphetsDeathAr: 'كان مستشاراً مؤتمناً للصديق والفاروق، واختاره أهل الشورى بعد عمر لتولى الخلافة الراشدة.',
      stanceAtProphetsDeathEn: 'Senior consultant to both Abu Bakr and Umar, chosen unanimously by the Shura council to assume leadership.',
      roleOrCaliphateAr: 'دامت خلافته اثنتي عشرة سنة (23 - 35 هـ)، ووصلت الفتوحات في عهده إلى القوقاز وقبرص وخراسان وشمال إفريقيا، وأنشأ أول أسطول بحري إسلامي.',
      roleOrCaliphateEn: 'Reigned for 12 years (23 - 35 AH). Muslim lands expanded to Cyprus, the Caucasus, Khorasan, and North Africa; he commissioned the first Islamic naval fleet.',
      majorAchievementsAr: [
        'جمع القرآن الكريم في المصحف العثماني وتوزيعه على الأمصار وحرق ما سواه لتوحيد كلمة المسلمين.',
        'توسعة المسجد النبوي الشريف والمسجد الحرام بمكة.',
        'تأسيس أول أسطول بحري إسلامي وخوض معركة ذات الصواري التاريخية.'
      ],
      majorAchievementsEn: [
        'Standardizing the Quranic text (Uthmanic Codex) distributed to capitals, eliminating sectarian textual divergence.',
        'Architectural expansion of the Prophet\'s Mosque in Madinah and the Sacred Mosque in Makkah.',
        'Constructing the first Islamic naval fleet, winning the decisive Battle of the Masts (Dhat As-Sawari).'
      ]
    },

    passingAndTributes: {
      titleAr: 'استشهاده صابراً محتسباً',
      titleEn: 'Martyrdom & Patience Under Siege',
      deathDetailsAr: 'حاصره الخوارج المتمردون في داره أربعين يوماً ومنعوا عنه الماء، ورفض أن يُراق دم مسلم واحد دفاعاً عنه، فاقتحموا داره وقتلوه ظلماً وهو يتلو المصحف الشريف في 18 ذي الحجة سنة 35 هـ.',
      deathDetailsEn: 'Besieged in his house for 40 days by rebels who denied him drinking water. He steadfastly forbade any bloodshed in his defense, martyred while reciting the Qur\'an on 18 Dhu al-Hijjah 35 AH.',
      lastWordsAr: 'سالت دماؤه الطاهرة الشريفة على المصحف، وتحديداً على الآية الكريمة: ﴿فَسَيَكْفِيكَهُمُ اللَّهُ وَهُوَ السَّمِيعُ الْعَلِيمُ﴾ [البقرة: 137].',
      lastWordsEn: 'His pure blood spilled upon the open Mushaf, precisely upon the verse: "Allah will suffice you against them, and He is the Hearing, the Knowing." [Al-Baqarah: 137]',
      restingPlaceAr: 'دُفن في البقيع بالمدينة المنورة، ورثاه كبار الصحابة بدموع الأسى والوفاء.',
      restingPlaceEn: 'Buried in Al-Baqi Cemetery in Madinah, mourned profoundly by all the righteous companions.'
    },

    inspirationalLessonsAr: [
      'سخاء اليد وبذل الثروة لنصرة الدين والأمة وتفريج كربات المسلمين.',
      'الحياء والعفة وصيانة الحرمات في السر والعلن.',
      'التضحية بالنفس وتقديم حقن دماء المسلمين على سلامة الذات والمنصب.',
      'الارتباط الوثيق بكتاب الله تلاوة وتدبراً وحفظاً حتى آخر رمق في الحياة.'
    ],
    inspirationalLessonsEn: [
      'Unbounded generosity, investing personal fortune to uplift society and ease crises.',
      'Sanctity of bashfulness and preserving moral purity in public and privacy.',
      'Refusal to allow Muslim bloodshed for the sake of holding political power.',
      'Intimate bond with the Qur\'an—reciting, living, and passing away with it in one\'s hands.'
    ]
  },

  // 4. علي بن أبي طالب
  {
    id: 'ali-ibn-abi-talib',
    order: 4,
    nameAr: 'علي بن أبي طالب',
    nameEn: 'Ali ibn Abi Talib',
    titleBadgeAr: 'الخليفة الرابع للمسلمين • أمير المؤمنين • باب مدينة العلم',
    titleBadgeEn: '4th Caliph of Islam • Commander of the Faithful • Gate of Knowledge',
    fullNameAr: 'علي بن أبي طالب (عبد مناف) بن عبد المطلب بن هاشم بن عبد مناف القرشي الهاشمي',
    fullNameEn: 'Ali ibn Abi Talib (Abd Manaf) ibn Abd Al-Muttalib ibn Hashim ibn Abd Manaf Al-Qurashi Al-Hashimi',
    kunyaAr: 'أبو الحسن، وأبو تراب (كنية أحبها إلى قلبه أطلقها عليه رسول الله ﷺ)',
    kunyaEn: 'Abu Al-Hasan and Abu Turab (Father of Dust - the dearest nickname given to him by the Prophet ﷺ)',
    birthYearAr: '600 م (قبل البعثة بعشر سنين، وُلد داخل جوف الكعبة المشرفة)',
    birthYearEn: '600 CE (approx. 10 years before the prophetic mission; born inside the Ka\'bah)',
    deathYearAr: '40 هـ / 661 م (استشهد غدراً في محراب الكوفة في رمضان وعمره 63 سنة)',
    deathYearEn: '40 AH / 661 CE (Martyred in the prayer niche of Kufa, aged 63)',
    burialPlaceAr: 'النجف الأشرف (بالقرب من الكوفة بالعراق)',
    burialPlaceEn: 'An-Najaf (near Kufa, Iraq)',
    kinshipAr: 'ابن عم رسول الله ﷺ وتربيته، وزوج ابنته سيدة نساء العالمين فاطمة الزهراء، ووالد سبطي رسول الله وسيدي شباب أهل الجنة: الحسن والحسين.',
    kinshipEn: 'First cousin of the Prophet ﷺ raised in his household, husband of Fatimah (leader of women of Paradise), father of Al-Hasan and Al-Husayn.',
    gladTidingsHadithAr: '«عَلِيٌّ فِي الْجَنَّةِ... أَنْتَ مِنِّي وَأَنَا مِنْكَ... أَمَا تَرْضَى أَنْ تَكُونَ مِنِّي بِمَنْزِلَةِ هَارُونَ مِنْ مُوسَى غَيْرَ أَنَّهُ لَا نَبِيَّ بَعْدِي» [صحيح البخاري ومسلم]',
    gladTidingsHadithEn: '"Ali is in Paradise... You are from me and I am from you... Are you not pleased to be to me as Aaron was to Moses, except that there is no prophet after me?" [Sahih Al-Bukhari & Muslim]',
    keyQuoteAr: '«الناس صنفان: إما أخ لك في الدين، أو نظير لك في الخلق» وقوله: «سلوني قبل أن تفقدوني»',
    keyQuoteEn: '"People are of two types: either your brother in faith, or your equal in creation" and "Ask me before you lose me."',

    preIslamicLife: {
      titleAr: 'أحواله ونشأته في بيت النبوة',
      titleEn: 'Upbringing in the Prophetic Household',
      statusInQurayshAr: 'نشأ علي بن أبي طالب في كنف ابن عمه رسول الله ﷺ منذ نعومة أظفاره؛ حيث أخذه النبي ﷺ من والده أبي طالب تخفيفاً عنه لكثرة عياله، فنشأ في أطهر بيت يتغذى بأخلاق النبوة.',
      statusInQurayshEn: 'Raised from childhood directly in the home of the Prophet ﷺ, who took him in to relieve his uncle Abu Talib\'s financial burdens, soaking in prophetic morality.',
      moralsAndNatureAr: 'لم يدنس بملوثات الجاهلية قط، ولم يسجد لصنم قط طيلة عمره؛ ولذلك يُقال عند ذكره: "كرّم الله وجهه"، وكان مثالاً في الشجاعة والفروسية والزهد والبلاغة والعدل.',
      moralsAndNatureEn: 'Never polluted by pagan customs and never prostrated to an idol—hence praised with: "May Allah ennoble his face." Revered for valor, unmatched eloquence, and piety.',
      tradeAndKnowledgeAr: 'كان أبلغ العرب كلاماً، وأقضاهم وأحكمهم، تشرّب الحكمة النبوية وأسرار القرآن الكريم حتى كان مرجع الصحابة في الفتيا والقضاء والمعضلات.',
      tradeAndKnowledgeEn: 'The most eloquent orator of Arabia and its most astute jurist, deeply grounded in the Qur\'an and Sunnah, serving as supreme judicial reference for the companions.'
    },

    embracingIslam: {
      titleAr: 'أول من أسلم من الصبيان',
      titleEn: 'First Youth to Accept Islam',
      storyAr: 'رأى النبي ﷺ وخديجة رضي الله عنها يصليان، فسأل عما يفعلان، فدعاه النبي ﷺ إلى عبادة الله وحده وخلع الأنداد، فبات ليلته مفكراً ثم أسلم صبيحة الغد وهو ابن عشر سنين دون أن يستشير أحداً.',
      storyEn: 'Seeing the Prophet ﷺ and Khadijah praying, he inquired about it. The Prophet invited him to worship Allah alone. He reflected overnight and embraced Islam the next morning at age 10.',
      earlyPrecedenceAr: 'أول فدائي في الإسلام؛ بات في فراش النبي ﷺ ليلة الهجرة ملتحفاً ببرده الحضرمي الأخضر ليوهم قريشاً أن النبي ما زال نائماً، مع علمه بأن سيوف قريش تحيط بالدار، ثم أدى الأمانات التي كانت عند رسول الله ﷺ إلى أهل مكة وهاجر ماشياً على قدميه حتى تفطرت قدماه.',
      earlyPrecedenceEn: 'The foremost heroic ransom in Islam: Slept in the Prophet\'s bed on the Night of Migration wrapped in his green cloak, deceiving assassins while knowing swords surrounded him, then returned all deposited trusts to Makkans.',
      advocacyAndSacrificesAr: 'كان عضد النبي ﷺ في مكة والمدينة، وسيف الإسلام الصقيل الذي لا يُهزم في ميدان.',
      advocacyAndSacrificesEn: 'The steadfast rock beside the Prophet ﷺ through persecution, becoming the unbeatable champion of truth in all arenas.'
    },

    migrationAndJihad: {
      titleAr: 'بطولاته وجهاده الأسطوري',
      titleEn: 'Heroism & Stances in Jihad',
      migrationStoryAr: 'هاجر على قدميه وحيداً متخفياً بالنهار سارياً بالليل حتى وصل إلى قباء، فاستقبله النبي ﷺ وضمه وبكى لما أصاب قدميه ومسح عليهما بيده الشريفة.',
      migrationStoryEn: 'Walked hundreds of miles on foot from Makkah to Madinah, traveling by night. The Prophet ﷺ welcomed him weeping at his blistered feet, wiping over them with blessing.',
      majorBattlesAr: [
        'غزوة بدر: بارز الوليد بن عتبة فقتله في ثوانٍ، وحصد بسيفه "ذي الفقار" رؤوس طواغيت الشرك.',
        'غزوة أحد: ثبت يذود عن رسول الله ﷺ وأصيب بست عشرة ضربة وهو يصد الكتائب.',
        'غزوة الخندق (الأحزاب): قتل فارس قريش الذي لا يُقهر عمرو بن عبد ود العامري في مبارزة أسطورية.',
        'غزوة خيبر: دفع النبي ﷺ إليه الراية قائلاً: «لَأُعْطِيَنَّ الرَّايَةَ غَدًا رَجُلًا يُحِبُّ اللَّهَ وَرَسُولَهُ، وَيُحِبُّهُ اللَّهُ وَرَسُولُهُ، يَفْتَحُ اللَّهُ عَلَى يَدَيْهِ»، ففتح الحصن ببطولة نادرة.'
      ],
      majorBattlesEn: [
        'Battle of Badr: Struck down Walid ibn Utbah instantly in duel and routed enemy champions with Dhu Al-Faqar.',
        'Battle of Uhud: Defended the Prophet ﷺ fiercely, absorbing 16 wounds while repelling battalions.',
        'Battle of the Trench: Slew Amr ibn Abd Wudd, the feared champion of Arabia, in single combat.',
        'Battle of Khaybar: The Prophet handed him the banner, declaring: "Tomorrow I will give the banner to a man who loves Allah and His Messenger, and whom Allah and His Messenger love, through whom Allah will grant victory."'
      ],
      unmatchedSacrificesAr: 'كان حامل لواء رسول الله ﷺ في جل الغزوات، ولم يفر قط من زحف، ولم يبارزه فارس إلا صرعه.',
      unmatchedSacrificesEn: 'Bearer of the Prophet\'s grand standard in nearly all battles, never retreated from combat, nor did any opponent survive a duel with him.'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«أَنَا مَدِينَةُ العِلْمِ وَعَلِيٌّ بَابُهَا»', source: 'جامع الترمذي والحاكم' },
        { hadith: '«مَنْ كُنْتُ مَوْلَاهُ فَعَلِيٌّ مَوْلَاهُ، اللَّهُمَّ وَالِ مَنْ وَالَاهُ وَعَادِ مَنْ عَادَاهُ»', source: 'مسند أحمد والترمذي' },
        { hadith: '«لَا يُحِبُّكَ إِلَّا مُؤْمِنٌ، وَلَا يُبْغِضُكَ إِلَّا مُنَافِقٌ»', source: 'صحيح مسلم' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"I am the city of knowledge and Ali is its gate."', source: 'Jami` at-Tirmidhi & Al-Hakim' },
        { hadith: '"Whoever has me as his Mawla (beloved protector), then Ali is his Mawla. O Allah, befriend who befriends him and oppose who opposes him."', source: 'Musnad Ahmad & Tirmidhi' },
        { hadith: '"None loves you except a true believer, and none hates you except a hypocrite."', source: 'Sahih Muslim' }
      ],
      titlesAndHonorsAr: [
        'أمير المؤمنين ورابع الخلفاء الراشدين المهديين.',
        'أسد الله الغالب وحيدرة وفارس الإسلام الأعظم.',
        'زوج الزهراء البتول ووالد السبطين الحسن والحسين ريحانتي رسول الله ﷺ.'
      ],
      titlesAndHonorsEn: [
        'Commander of the Faithful and fourth Rightly-Guided Caliph.',
        'Asadullah (Lion of Allah) and supreme knight of Islamic chivalry.',
        'Spouse of Lady Fatimah and father of Al-Hasan and Al-Husayn, the two masters of youths in Paradise.'
      ],
      testimoniesAr: [
        'قال عمر بن الخطاب رضي الله عنه: "علي أقضانا، ولولا علي لهلك عمر".',
        'قالت عائشة رضي الله عنها: "أما إنه لأعلم الناس بالسنة".'
      ],
      testimoniesEn: [
        'Umar ibn Al-Khattab (R.A.) stated: "Ali is the best judge among us; without Ali, Umar would have been ruined."',
        'Aisha (R.A.) affirmed: "Indeed, he was the most knowledgeable of all people in the Prophetic Sunnah."'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'خلافته الراشدة ومواجهة الفتن',
      titleEn: 'Caliphate & Dealing with Crises',
      stanceAtProphetsDeathAr: 'تولى تغسيل رسول الله ﷺ وتجهيزه مع العباس والفضل، وكان المرجع الفقهي والقضائي الأول لأبي بكر وعمر وعثمان رضوان الله عليهم.',
      stanceAtProphetsDeathEn: 'Washed and shrouded the blessed body of the Prophet ﷺ with Al-Abbas and Al-Fadl, serving as senior jurisprudential adviser to Abu Bakr, Umar, and Uthman.',
      roleOrCaliphateAr: 'بويع بالخلافة سنة 35 هـ في أشد أوقات الفتنة بعد استشهاد عثمان، فنقل العاصمة إلى الكوفة وحرص على إرساء قواعد العدل والزهد.',
      roleOrCaliphateEn: 'Pledged allegiance in 35 AH during severe civil upheaval, relocated the administrative center to Kufa, and championed rigorous social equity.',
      majorAchievementsAr: [
        'وضع قواعد النحو العربي بتوجيه أبي الأسود الدؤلي لحماية لغة القرآن الكريم من اللحن.',
        'تأسيس نظام التفتيش القضائي وحماية حقوق المساجين والفقراء.',
        'ترسيخ أصول الفقه وأدب القضاء والحكم العادل في رسائله وخطبه الخالدة (نهج البلاغة).'
      ],
      majorAchievementsEn: [
        'Commissioned the founding rules of Arabic grammar via Abu Al-Aswad Ad-Du\'ali to preserve Quranic recitation.',
        'Pioneered prison inspection systems and civic protection for the indigent.',
        'Codified ethical judicial guidelines and political justice immortalized in his speeches and letters.'
      ]
    },

    passingAndTributes: {
      titleAr: 'استشهاده في محراب الفجر',
      titleEn: 'Martyrdom in the Fajr Mihrab',
      deathDetailsAr: 'في صبيحة 17 رمضان سنة 40 هـ، خرج يوقظ الناس لصلاة الفجر قائلاً: "الصلاة الصلاة"، فباغته عبد الرحمن بن ملجم المرادي بسيف مسموم ضربه على رأسه.',
      deathDetailsEn: 'On the morning of 17 Ramadan 40 AH, while walking to awaken worshippers for Fajr shouting: "Prayer! Prayer!", Ibn Muljam struck him with a poisoned sword on his head.',
      lastWordsAr: 'صاح رضي الله عنه لحظة طعنه: "فزت ورب الكعبة!"، وأوصى بحسن معاملة قاتله وعدم التمثيل به قائلاً: "النفس بالنفس، فإن عشت فأنا ولي دمي، وإن مت فاضربوه ضربة بضربة ولا تمثلوا بالرجل".',
      lastWordsEn: 'He shouted upon being struck: "By the Lord of the Ka\'bah, I have succeeded!" and commanded his sons to treat his assassin humanely and never mutilate him.',
      restingPlaceAr: 'توفي ليلة 21 رمضان 40 هـ ودُفن في النجف، تاركاً إرثاً إيمانياً وفكرياً وبطولياً خالداً.',
      restingPlaceEn: 'Passed away on the 21st of Ramadan 40 AH and was buried in An-Najaf, leaving an eternal legacy of faith, wisdom, and honor.'
    },

    inspirationalLessonsAr: [
      'الشجاعة النادرة في الحق ونصرة المظلوم دون أدنى خوف من أحد.',
      'الزهد في حطام الدنيا وهو يقسم بيت المال على المسلمين ويكنسه ويصلي فيه.',
      'العدالة الصارمة في القضاء ومحاسبة النفس قبل محاسبة الناس.',
      'الحرص على الوحدة ودرء الفتن وبث روح التسامح حتى مع الخصوم.'
    ],
    inspirationalLessonsEn: [
      'Uncompromising courage in standing for truth and upholding the oppressed.',
      'Detachment from material allure, distributing state funds to citizens and sweeping the treasury clean.',
      'Exemplary justice and holding oneself accountable before judging others.',
      'Protecting the sanctity of life and demonstrating magnanimity even toward adversaries.'
    ]
  },

  // 5. طلحة بن عبيد الله
  {
    id: 'talha-ibn-ubaydillah',
    order: 5,
    nameAr: 'طلحة بن عبيد الله',
    nameEn: 'Talha ibn Ubaydullah',
    titleBadgeAr: 'طلحة الخير • طلحة الجود • طلحة الفياض • صقر يوم أحد',
    titleBadgeEn: 'Talhat Al-Khayr • Talha the Generous • Shield of Uhud',
    fullNameAr: 'طلحة بن عبيد الله بن عثمان بن عمرو بن كعب بن سعد بن تيم بن مرة القرشي التيمي',
    fullNameEn: 'Talha ibn Ubaydullah ibn Uthman ibn Amr ibn Ka\'b ibn Sa\'d ibn Taym ibn Murrah Al-Qurashi',
    kunyaAr: 'أبو محمد (وسماه رسول الله ﷺ طلحة الخير، وطلحة الجود، وطلحة الفياض)',
    kunyaEn: 'Abu Muhammad (Named Talhat Al-Khayr, Talhat Al-Jood, and Talhat Al-Fayyad by the Prophet ﷺ)',
    birthYearAr: '594 م (قبل البعثة بستة عشر عاماً)',
    birthYearEn: '594 CE (approx. 16 years before the Prophetic Mission)',
    deathYearAr: '36 هـ / 656 م (استشهد يوم الجمل وعمره 64 سنة)',
    deathYearEn: '36 AH / 656 CE (Martyred at the Battle of the Camel, aged 64)',
    burialPlaceAr: 'البصرة (العراق)',
    burialPlaceEn: 'Basra, Iraq',
    kinshipAr: 'ابن عم أبي بكر الصديق، ويلتقي نسبه مع النبي ﷺ في جده مرة بن كعب، وأحد أصهار النبي وزوج أخت عائشة أم المؤمنين.',
    kinshipEn: 'Cousin of Abu Bakr As-Siddiq, lineages meet at Murrah ibn Ka\'b; brother-in-law of Aisha (Mother of the Believers).',
    gladTidingsHadithAr: '«طَلْحَةُ فِي الْجَنَّةِ... مَنْ سَرَّهُ أَنْ يَنْظُرَ إِلَى شَهِيدٍ يَمْشِي عَلَى وَجْهِ الأَرْضِ، فَلْيَنْظُرْ إِلَى طَلْحَةَ بْنِ عُبَيْدِ اللَّهِ» [صحيح الترمذي]',
    gladTidingsHadithEn: '"Talha is in Paradise... Whoever is pleased to look at a martyr walking upon the face of the earth, let him look at Talha ibn Ubaydullah." [Jami` at-Tirmidhi]',
    keyQuoteAr: '«نحن جند الله وأولياؤه، لا نبالي في أي سبيل كان منيتنا ما دمنا على دين محمد ﷺ»',
    keyQuoteEn: '"We are the soldiers and servants of Allah; we care not on which path our demise falls as long as we adhere to the faith of Muhammad ﷺ."',

    preIslamicLife: {
      titleAr: 'أحواله ومكانته قبل الإسلام',
      titleEn: 'Life & Status Before Islam',
      statusInQurayshAr: 'كان شاباً قرشياً ميمون الطالع، من أثرياء بني تيم، وتاجراً يافعاً يتمتع برؤية ثاقبة ونقاء سريرة، محبوباً من قريش لكرمه ونبل أخلاقه.',
      statusInQurayshEn: 'A prosperous, distinguished young nobleman of Banu Taym, highly respected in Makkah for extraordinary generosity, chivalry, and business acumen.',
      moralsAndNatureAr: 'كان كريم اليد، شهماً، يأنف من عادات الجاهلية الساقطة، يبحث عن الحق والدين الحقيقي.',
      moralsAndNatureEn: 'Possessed innate nobility and generous impulses, disdaining pagan decadence in search of true monotheism.',
      tradeAndKnowledgeAr: 'سافر في تجارة إلى بصرى الشام، فالتقى براهب في سوقها سأل الناس: "هل ظهر فيكم أحمد صاحب الحرم؟" فعلق الخبر بقلبه وعاد مسرعاً إلى مكة.',
      tradeAndKnowledgeEn: 'While on a commercial caravan to Busra in Syria, a Christian monk announced the imminent arrival of Ahmad, the final Prophet from the Sanctuary, engraving this prophecy in his soul.'
    },

    embracingIslam: {
      titleAr: 'إسلامه المبارك وبلاء الصبر',
      titleEn: 'Embracing Islam & Torture',
      storyAr: 'عاد إلى مكة فوجد أن محمداً ﷺ قد بُعث وأن أبا بكر قد آمن به، فذهب فوراً إلى أبي بكر ومعه إلى رسول الله ﷺ وأعلن إسلامه فكان من السابقين الأولين.',
      storyEn: 'Returning to Makkah, he heard that Muhammad ﷺ declared prophethood and Abu Bakr followed him. He hastened with Abu Bakr to the Prophet ﷺ and accepted Islam.',
      earlyPrecedenceAr: 'سُمّي هو وأبو بكر الصديق بـ "القرينين"؛ لأن نوفل بن خويلد (أسد قريش) ربطهما معاً بحبل واحد وعذبهما ليرجعهما عن دينهما فلم يزدهما ذلك إلا ثباتاً.',
      earlyPrecedenceEn: 'He and Abu Bakr were dubbed "The Two Bound Companions" (Al-Qareenayn) after Nawfal ibn Khuwaylid tied them together in one rope and tortured them, yet they remained immovable in faith.',
      advocacyAndSacrificesAr: 'أنفق أموالاً طائلة في فكاك المعذبين وإعانة المهاجرين، واحتمل أذى قومه حتى كتب الله له الهجرة.',
      advocacyAndSacrificesEn: 'Lavished immense wealth assisting destitute converts, bearing persecution until permitted to migrate.'
    },

    migrationAndJihad: {
      titleAr: 'صقر يوم أحد وبطولاته الخالدة',
      titleEn: 'The Hawk of Uhud & Heroism',
      migrationStoryAr: 'هاجر إلى المدينة، وفوّته النبي ﷺ غزوة بدر لأنه أرسله وسعيد بن زيد في مهمة استطلاعية شمالاً لترصد عير قريش، فضرب له النبي بسهمه وأجره.',
      migrationStoryEn: 'Migrated to Madinah. Missed direct combat at Badr because the Prophet ﷺ dispatched him and Saeed ibn Zayd on reconnaissance; the Prophet awarded him full honors of Badr.',
      majorBattlesAr: [
        'يوم أحد: يوم طلحة الخالد! قال أبو بكر: "ذلك اليوم كله كان يوم طلحة". عندما انقض المشركون على رسول الله ﷺ، حماه طلحة بجسده وجعل من نفسه ترساً يقي به النبي السهام، وشُلّت يده وهو يتلقى بها النبال عن وجه النبي، وتلقى أكثر من 70 طعنة ورمية، حتى قال النبي ﷺ: «أَوْجَبَ طَلْحَةُ» (أي وجبت له الجنة).',
        'حمل النبي ﷺ على ظهره وصعد به الصخرة حين أثقله الدرعان في أحد، فقال النبي: «أَوْجَبَ طَلْحَةُ».',
        'شهد الخندق والحديبية وبيعة الرضوان وخيبر وفتح مكة وحنين وتبوك.'
      ],
      majorBattlesEn: [
        'Battle of Uhud: His immortal day! Abu Bakr said: "That whole day belonged to Talha." When enemies swarmed the Prophet ﷺ, Talha shielded him with his bare body, catching poisoned arrows with his hand until it was paralyzed, receiving over 70 cuts and wounds. The Prophet ﷺ declared: "Talha has earned it (Paradise)!"',
        'Carried the wounded Prophet ﷺ upon his back up the boulder when the Prophet\'s two coats of armor were too heavy, prompting the Prophet\'s glad tidings: "Paradise is assured for Talha."',
        'Fought in the Trench, Hudaybiyyah, Khaybar, Makkah, and Tabuk.'
      ],
      unmatchedSacrificesAr: 'عاش بعد أحد يده شلاء فخراً وشرفاً في سبيل الله، وكان لقبه "الشهيد الحي" الذي يمشي بين الناس.',
      unmatchedSacrificesEn: 'Walked the earth with a paralyzed hand—a glorious badge of honor earned defending the Prophet ﷺ—hailed as the "Living Martyr".'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«مَنْ سَرَّهُ أَنْ يَنْظُرَ إِلَى رَجُلٍ يَمْشِي عَلَى الأَرْضِ قَدْ قَضَى نَحْبَهُ، فَلْيَنْظُرْ إِلَى طَلْحَةَ بْنِ عُبَيْدِ اللَّهِ»', source: 'صحيح الترمذي' },
        { hadith: '«طَلْحَةُ وَالزُّبَيْرُ جَارَايَ فِي الجَنَّةِ»', source: 'صحيح الترمذي' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"Whoever wishes to look at a man walking on earth who has fulfilled his vow (of martyrdom), let him look at Talha ibn Ubaydullah."', source: 'Jami` at-Tirmidhi' },
        { hadith: '"Talha and Az-Zubayr are my neighbors in Paradise."', source: 'Jami` at-Tirmidhi' }
      ],
      titlesAndHonorsAr: [
        'الشهيد الحي الذي يمشي على الأرض بنص كلام رسول الله ﷺ.',
        'صاحب اليد الشلاء دفاعاً عن رسول الله ﷺ.',
        'طلحة الخير والجود والفياض لعطائه الذي لم يشهد له مثيل.'
      ],
      titlesAndHonorsEn: [
        'The Living Martyr verified by the words of Prophet Muhammad ﷺ.',
        'Paralyzed Hand defender of the Messenger of Allah.',
        'Bestowed multiple titles of benevolence and boundless charity by the Prophet ﷺ.'
      ],
      testimoniesAr: [
        'قالت عائشة رضي الله عنها: "كان أبو بكر إذا ذكر يوم أحد قال: ذلك اليوم كله لطلحة".',
        'قال علي بن أبي طالب باكياً عند استشهاد طلحة: "إني لأرجو أن أكون أنا وأنت ممن قال الله فيهم: ﴿وَنَزَعْنَا مَا فِي صُدُورِهِم مِّنْ غِلٍّ إِخْوَانًا عَلَىٰ سُرُرٍ مُّتَقَابِلِينَ﴾".'
      ],
      testimoniesEn: [
        'Aisha (R.A.) recalled: "Whenever Abu Bakr remembered the day of Uhud, he would say: That entire day belonged to Talha."',
        'Ali ibn Abi Talib wept at Talha\'s passing, praying: "I earnestly hope that you and I will be among those whom Allah describes: \'And We shall remove from their hearts any grievance, as brothers facing each other on thrones of dignity.\'"'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'مواقفه بعد وفاة النبي ﷺ وجهاده',
      titleEn: 'Stances After the Prophet & Legacy',
      stanceAtProphetsDeathAr: 'كان عضداً لأبي بكر وعمر، وكان أحد أعضاء مجلس الشورى الستة الذين أوكل إليهم عمر اختيار الخليفة من بعده.',
      stanceAtProphetsDeathEn: 'Stalwart adviser during the reigns of Abu Bakr and Umar, and selected among the six Shura council members to elect Umar\'s successor.',
      roleOrCaliphateAr: 'اشتهر بكرمه الخرافي؛ فكان يوزع أرباح تجارته على فقراء المسلمين وأراملهم، وكان يقضي ديون بني تيم ويزوج أيمهم ويعطي عطاء من لا يخشى الفقر.',
      roleOrCaliphateEn: 'Renowned for astonishing philanthropic generosity, distributing trade revenues to widows and paying off all debts of his clan members.',
      majorAchievementsAr: [
        'باع أرضاً له بسبعمائة ألف درهم فبات ليلته يفرقها على المحتاجين حتى لم يبق معه درهم واحد.',
        'دوره في الشورى وتثبيت أركان الدولة الإسلامية.',
        'موقفه في إصلاح ذات البين يوم الجمل ورغبته الصادقة في الصلح.'
      ],
      majorAchievementsEn: [
        'Sold an estate for 700,000 dirhams and distributed every single coin to the poor before dawn.',
        'Foundational contributions to the Shura council maintaining state coherence.',
        'Seeking peaceful reconciliation before the tragedy of the Battle of the Camel.'
      ]
    },

    passingAndTributes: {
      titleAr: 'استشهاده ووفاته',
      titleEn: 'Martyrdom & Resting Place',
      deathDetailsAr: 'استشهد يوم الجمل سنة 36 هـ بسهم غادر أصابه بعد أن قرر اعتزال المعركة حقناً لدماء المسلمين تلبية لمناشدة علي بن أبي طالب وتذكره لحديث النبي ﷺ.',
      deathDetailsEn: 'Martyred at the Battle of the Camel in 36 AH by a stray arrow after withdrawing from fighting to preserve Muslim lives following Ali\'s reminder of the Prophet\'s words.',
      lastWordsAr: 'كان يهلل ويستغفر الله ويسأله الرضوان والجنة، ودُفن بالقرب من البصرة.',
      lastWordsEn: 'Passed away repeating Tahlil and Istighfar, seeking Allah\'s pleasure and Paradise, buried near Basra.',
      restingPlaceAr: 'دُفن في البصرة بالعراق، ومقامه معروف يُزار.',
      restingPlaceEn: 'Buried in Basra, Iraq, where his tomb remains historically revered.'
    },

    inspirationalLessonsAr: [
      'الفداء الصادق والاستعداد للتضحية بالجسد والروح دفاعاً عن العقيدة ورسول الله ﷺ.',
      'الجود والسخاء وبذل الثروات دون منّ ولا أذى.',
      'الرجوع إلى الحق فور تذكره والابتعاد عن مواطن الفتنة.',
      'الوفاء بالعهود حتى وصفه النبي ﷺ بالشهيد الذي قضى نحبه.'
    ],
    inspirationalLessonsEn: [
      'Unmatched personal valor and readiness to shield truth with body and blood.',
      'Limitless charity without hesitation, vanity, or desire for fame.',
      'Immediate return to the truth the moment divine counsel is recalled.',
      'Steadfast fidelity fulfilling solemn vows of faith to the last breath.'
    ]
  },

  // 6. الزبير بن العوام
  {
    id: 'zubayr-ibn-alawwam',
    order: 6,
    nameAr: 'الزبير بن العوام',
    nameEn: 'Az-Zubayr ibn Al-Awwam',
    titleBadgeAr: 'حَوَارِيّ رسول الله ﷺ • أول من سلّ سيفاً في الإسلام • فارس النخوة',
    titleBadgeEn: 'Disciple of the Prophet ﷺ • First to Draw a Sword in Islam',
    fullNameAr: 'الزبير بن العوام بن خويلد بن أسد بن عبد العزى بن قصي بن كلاب القرشي الأسدي',
    fullNameEn: 'Az-Zubayr ibn Al-Awwam ibn Khuwaylid ibn Asad ibn Abd Al-Uzza ibn Qusayy ibn Kilab Al-Qurashi',
    kunyaAr: 'أبو عبد الله (ولقّبه رسول الله ﷺ بالحواري، وقال: «لِكُلِّ نَبِيٍّ حَوَارِيٌّ، وَحَوَارِيَّ الزُّبَيْرُ»)',
    kunyaEn: 'Abu Abdullah (Titled Hawari - The Intimate Disciple - by the Prophet Muhammad ﷺ)',
    birthYearAr: '594 م (قبل البعثة بستة عشر عاماً)',
    birthYearEn: '594 CE (approx. 16 years before the Prophetic Mission)',
    deathYearAr: '36 هـ / 656 م (استشهد غدراً وهو يصلي في وادي السباع وعمره 64 سنة)',
    deathYearEn: '36 AH / 656 CE (Martyred treacherously while praying at Wadi As-Siba\', aged 64)',
    burialPlaceAr: 'وادي السباع قرب البصرة (العراق)',
    burialPlaceEn: 'Wadi As-Siba\', near Basra (Iraq)',
    kinshipAr: 'ابن عمة رسول الله ﷺ (أمه صفية بنت عبد المطلب)، وابن أخي أم المؤمنين خديجة بنت خويلد، وزوج أسماء بنت أبي بكر (ذات النطاقين)، ووالد عبد الله بن الزبير.',
    kinshipEn: 'Cousin of the Prophet ﷺ (son of Safiyyah bint Abd Al-Muttalib), nephew of Khadijah, husband of Asma bint Abi Bakr, father of Abdullah ibn Az-Zubayr.',
    gladTidingsHadithAr: '«وَالزُّبَيْرُ فِي الْجَنَّةِ... إِنَّ لِكُلِّ نَبِيٍّ حَوَارِيًّا، وَإِنَّ حَوَارِيَّ الزُّبَيْرُ بْنُ العَوَّامِ» [متفق عليه]',
    gladTidingsHadithEn: '"Az-Zubayr is in Paradise... For every prophet there is a disciple, and my disciple is Az-Zubayr ibn Al-Awwam." [Sahih Al-Bukhari & Muslim]',
    keyQuoteAr: '«فداك أبي وأمي يا رسول الله!» (وهي الكلمة التي جمع له النبي ﷺ بها أبويه يوم الخندق)',
    keyQuoteEn: '"May my father and mother be sacrificed for you, O Messenger of Allah!" (The rare honor the Prophet granted him at the Trench: "May my parents be ransomed for you!")',

    preIslamicLife: {
      titleAr: 'أحواله ونشأته وفروسيته',
      titleEn: 'Upbringing & Early Chivalry',
      statusInQurayshAr: 'نشأ يتيماً بعد مقتل والده العوام في حرب الفجار، فربته أمه صفية بنت عبد المطلب رضي الله عنها بحزم وشدة لتصنع منه فارساً مقداماً لا يهاب المنايا.',
      statusInQurayshEn: 'Orphaned young when his father fell in the Fijar War. Raised rigorously by his heroic mother Safiyyah bint Abd Al-Muttalib to be an invincible knight.',
      moralsAndNatureAr: 'كان عظيم الشجاعة، قوي البنية، عفيف النفس، عزيز الفؤاد، اشتهر بمهارته القتالية الخارقة؛ كان يقاتل بسيفين في آن واحد وهو ممتطٍ جواده.',
      moralsAndNatureEn: 'Possessed unmatched physical valor and integrity, famous for fighting with two swords simultaneously while guiding his warhorse with his feet.',
      tradeAndKnowledgeAr: 'كان تاجراً ناجحاً ورجل أعمال بارعاً، بارك الله في تجارته حتى قيل إنه ما اشترى شبراً إلا ربح فيه، وكان يوظف ثروته كلها لإعلاء دين الله.',
      tradeAndKnowledgeEn: 'A master entrepreneur blessed with exceptional commercial fortune; he utilized his vast resources to equip Muslim warriors.'
    },

    embracingIslam: {
      titleAr: 'أول من سلّ سيفاً في سبيل الله',
      titleEn: 'First Sword Drawn for Islam',
      storyAr: 'أسلم على يد أبي بكر الصديق وهو فتى صغير لم يتجاوز الخامسة عشرة أو السادسة عشرة من عمره، فكان رابع أو خامس من دخل الإسلام.',
      storyEn: 'Embraced Islam through Abu Bakr when he was only 15 or 16 years old, standing among the very first handful of believers.',
      earlyPrecedenceAr: 'شاع في مكة يوماً أن النبي ﷺ قد أُسر أو قُتل، فخرج الزبير حاسراً سيفه يشق صفوف قريش وهو غلام يافع، حتى وصل إلى النبي ﷺ، فقال له النبي: «مَا لَكَ يَا زُبَيْرُ؟» قال: "سمعت أنك أُخذت، فجئت لأضرب بسيفي من أخذك!" فدعا له النبي ﷺ ولسيفه بالبركة، فكان أول سيف سُلّ في الإسلام.',
      earlyPrecedenceEn: 'When rumors spread in Makkah that the Prophet ﷺ was assassinated, teenager Az-Zubayr charged through the city brandishing his sword, ready to fight all Quraysh. The Prophet smiled and prayed for him and his sword, making it the first sword drawn for Islam.',
      advocacyAndSacrificesAr: 'عذبه عمه نوفل بن خويلد أشد العذاب؛ كان يلفه في حصير ويدخن عليه بالنار ليكتم أنفاسه ويقول: "ارجع إلى الكفر"، فيصرخ الزبير: "لا أكفر أبداً!".',
      advocacyAndSacrificesEn: 'His uncle wrapped him in woven mats and lit suffocating fire beneath him, ordering him to apostatize. Az-Zubayr gasped: "I will never return to disbelief!"'
    },

    migrationAndJihad: {
      titleAr: 'بطولاته وجهاده الأسطوري',
      titleEn: 'Heroic Exploits & Battles',
      migrationStoryAr: 'هاجر إلى الحبشة في الهجرتين ثم إلى المدينة المنورة، وولد له فيها عبد الله بن الزبير، أول مولود للمهاجرين في المدينة، ففرح به المسلمون فرحاً عظيماً.',
      migrationStoryEn: 'Migrated to Abyssinia and then to Madinah, where his son Abdullah became the first newborn among the Muhajirun, shattering Jewish rumors that Muslims were bewitched into barrenness.',
      majorBattlesAr: [
        'غزوة بدر: نزل على فرس شقراء معتماً بعمامة صفراء، فنزل جبريل والملائكة على سيماء الزبير بعمائم صفر!',
        'غزوة أحد: ثبت مع النبي ﷺ حين تخلى الناس، وتفانى في الدفاع عنه.',
        'غزوة الخندق: قال النبي ﷺ: «مَنْ يَأْتِينَا بِخَبَرِ القَوْمِ؟» فقال الزبير: أنا، ثم قالها ثانية فقال الزبير: أنا، فقال النبي ﷺ: «فِدَاكَ أَبِي وَأُمِّي... لِكُلِّ نَبِيٍّ حَوَارِيٌّ، وَحَوَارِيَّ الزُّبَيْرُ».',
        'فتح حصن بابليون (مصر): اعتلى سور الحصن الضخم وحيداً وتسلّقه بسلمه وكبّر فظن الروم أن الجيش دخل فهربوا وفُتح الحصن العتيد ببطولته.'
      ],
      majorBattlesEn: [
        'Battle of Badr: Fought wearing a bright yellow turban; the Archangel Jibril and host of angels descended wearing yellow turbans in Az-Zubayr\'s honor!',
        'Battle of Uhud: Stood firm shielding the Prophet ﷺ throughout the crisis.',
        'Battle of the Trench: Volunteered thrice behind enemy lines into Banu Qurayza, prompting the Prophet\'s tribute: "May my father and mother be ransomed for you! Every prophet has a disciple, and my disciple is Az-Zubayr."',
        'Siege of Babylon Fortress (Egypt): Scaled the massive fortress walls alone with a ladder, chanting Takbir until the garrison panicked and surrendered.'
      ],
      unmatchedSacrificesAr: 'كان جسده مليئاً بالطعنات والندوب الغائرة، حتى قال عروة بن الزبير: "كان في ظهر أبي ثلاث ضربات بالسيف، كنت أدخل أصابعي فيها وأنا صغير".',
      unmatchedSacrificesEn: 'His torso was covered in deep battle scars. His son Urwah recounted: "My father had three sword scars on his back so deep that I used to insert my fingers into them as a boy."'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«طَلْحَةُ وَالزُّبَيْرُ جَارَايَ فِي الجَنَّةِ»', source: 'صحيح الترمذي' },
        { hadith: '«إِنَّ لِكُلِّ نَبِيٍّ حَوَارِيًّا، وَحَوَارِيَّ الزُّبَيْرُ»', source: 'صحيح البخاري' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"Talha and Az-Zubayr are my neighbors in Paradise."', source: 'Jami` at-Tirmidhi' },
        { hadith: '"Every Prophet has an intimate disciple, and my disciple is Az-Zubayr."', source: 'Sahih Al-Bukhari' }
      ],
      titlesAndHonorsAr: [
        'حواري رسول الله ﷺ وصاحب النخوة والفداء.',
        'أول من سل سيفاً في سبيل الله تعالى.',
        'أحد أهل الشورى الستة الذين توفي رسول الله ﷺ وهو عنهم راضٍ.'
      ],
      titlesAndHonorsEn: [
        'Hawari (Disciple) of the Messenger of Allah ﷺ.',
        'The very first warrior to draw a sword for the cause of Islam.',
        'Member of the prestigious six-man electoral Shura council.'
      ],
      testimoniesAr: [
        'قال عمر بن الخطاب رضي الله عنه: "الزبير ركن من أركان الدين".',
        'قال علي بن أبي طالب رضي الله عنه حين أُتي بسيف الزبير بعد مقتله: "سيفٌ طالما والله كشف الكرب عن وجه رسول الله ﷺ، بشّر قاتل ابن صفية بالنار".'
      ],
      testimoniesEn: [
        'Umar ibn Al-Khattab (R.A.) praised him: "Az-Zubayr is one of the pillars of this religion."',
        'Ali ibn Abi Talib held Az-Zubayr\'s sword after his murder, kissing it and weeping: "A sword that so often removed distress from the face of the Prophet ﷺ! Announce Hellfire to the killer of Safiyyah\'s son!"'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'مواقفه بعد وفاة النبي ﷺ',
      titleEn: 'Stances After the Prophet & Legacy',
      stanceAtProphetsDeathAr: 'ثبت على بيعة أبي بكر الصديق وشارك في فتوحات الشام واليرموك ومصر، واختاره عمر ضمن الستة أصحاب الشورى.',
      stanceAtProphetsDeathEn: 'Supported Abu Bakr, participated in the conquest of the Levant, Yarmouk, and Egypt, and selected into Umar\'s council.',
      roleOrCaliphateAr: 'كان قائداً عسكرياً عبقرياً في معركة اليرموك؛ حيث اخترق جيش الروم العرمرم بمفرده من الميمنة إلى الميسرة مرتين دون أن ينكسر.',
      roleOrCaliphateEn: 'Renowned military strategist who broke through the Byzantine lines twice single-handedly at the Battle of Yarmouk.',
      majorAchievementsAr: [
        'بطولته الحاسمة في فتح مصر مع عمرو بن العاص وتطويع حصن بابليون.',
        'إعانة مئات الأيتام والأرامل والإنفاق في وجوه البر.',
        'استجابته لنداء علي بن أبي طالب وتركه القتال يوم الجمل حرصاً على جمع كلمة المسلمين.'
      ],
      majorAchievementsEn: [
        'Decisive role liberating Egypt with Amr ibn Al-Aas and capturing Babylon fortress.',
        'Financed thousands of orphans, widows, and liberation campaigns.',
        'Immediately laid down arms at the Battle of the Camel upon being reminded of the Prophet\'s words.'
      ]
    },

    passingAndTributes: {
      titleAr: 'استشهاده غدراً',
      titleEn: 'Treacherous Martyrdom',
      deathDetailsAr: 'لما اعتزل القتال يوم الجمل، تبعه رجل يُدعى ابن جرموز، فباغته وهو يصلي في وادي السباع وقتله غدراً وهو ساجد لله سنة 36 هـ.',
      deathDetailsEn: 'After retiring from the battle, Ibn Jurmuz stalked him to Wadi As-Siba\' and treacherously stabbed him while he was prostrating in prayer in 36 AH.',
      lastWordsAr: 'استشهد ساجداً لله خاشعاً، وبكى عليه علي بن أبي طالب والصحابة جميعاً.',
      lastWordsEn: 'Martyred in humble prostration, wept over by Ali ibn Abi Talib and all the righteous companions.',
      restingPlaceAr: 'دُفن في وادي السباع قرب البصرة.',
      restingPlaceEn: 'Buried at Wadi As-Siba\' near Basra, Iraq.'
    },

    inspirationalLessonsAr: [
      'الاستجابة الفورية لنداء الحق دون تردد أو خوف.',
      'الشجاعة الفائقة في الدفاع عن المقدسات ورموز الدين.',
      'الإنصاف وسرعة الرجوع عن الشبهة عندما يستبين الحق.',
      'البركة في الكسب الحلال والإنفاق الصادق في سبيل الله.'
    ],
    inspirationalLessonsEn: [
      'Instantaneous answering to truth without hesitation or fear.',
      'Sublime valor defending the sacred sanctuaries of faith.',
      'Immediate retraction from confusion the moment truth is revealed.',
      'Divine abundance reaped through ethical commerce and sincere charity.'
    ]
  },

  // 7. عبد الرحمن بن عوف
  {
    id: 'abdurrahman-ibn-awf',
    order: 7,
    nameAr: 'عبد الرحمن بن عوف',
    nameEn: 'Abdur-Rahman ibn Awf',
    titleBadgeAr: 'تاجر الرحمن • صاحب القافلة العظمى • صانع الشورى ومانع الفتنة',
    titleBadgeEn: 'Merchant of the Most Merciful • Philanthropist of the Ummah',
    fullNameAr: 'عبد الرحمن بن عوف بن عبد عوف بن عبد بن الحارث بن زهرة بن كلاب القرشي الزهري',
    fullNameEn: 'Abdur-Rahman ibn Awf ibn Abd Awf ibn Abd ibn Al-Harith ibn Zuhrah ibn Kilab Al-Qurashi',
    kunyaAr: 'أبو محمد (وكان اسمه في الجاهلية عبد عمرو أو عبد الكعبة، فسمّاه رسول الله ﷺ عبد الرحمن)',
    kunyaEn: 'Abu Muhammad (Originally named Abd Amr or Abd Al-Ka\'bah; renamed Abdur-Rahman by the Prophet ﷺ)',
    birthYearAr: '580 م (بعد عام الفيل بعشر سنين)',
    birthYearEn: '580 CE (approx. 10 years after the Year of the Elephant)',
    deathYearAr: '32 هـ / 652 م (عن عمر يناهز 75 سنة في المدينة المنورة)',
    deathYearEn: '32 AH / 652 CE (Aged 75 in Al-Madinah Al-Munawwarah)',
    burialPlaceAr: 'المدينة المنورة (مقبرة البقيع الشريف)',
    burialPlaceEn: 'Al-Madinah Al-Munawwarah (Al-Baqi Cemetery)',
    kinshipAr: 'ابن عم أم النبي ﷺ آمنة بنت وهب الزهرية، ويلتقي نسبه مع النبي ﷺ في جدهما كلاب بن مرة.',
    kinshipEn: 'Cousin of the Prophet\'s mother Aminah bint Wahb, lineages meet at Kilab ibn Murrah.',
    gladTidingsHadithAr: '«وَعَبْدُ الرَّحْمَنِ بْنُ عَوْفٍ فِي الْجَنَّةِ... يَا ابْنَ عَوْفٍ، إِنَّكَ مِنَ الأَغْنِيَاءِ، وَلَا تَدْخُلُ الجَنَّةَ إِلَّا زَحْفًا، فَأَقْرِضِ اللَّهَ يُطْلِقْ لَكَ قَدَمَيْكَ» [مسند أحمد والبزار]',
    gladTidingsHadithEn: '"Abdur-Rahman ibn Awf is in Paradise... O Ibn Awf, you are a wealthy man, so lend to Allah and He will loosen your feet into Paradise with ease." [Musnad Ahmad & Al-Bazzar]',
    keyQuoteAr: '«بارك الله لك في أهلك ومالك، ولكن دُلّني على السوق!»',
    keyQuoteEn: '"May Allah bless your family and your wealth, but just show me the way to the marketplace!"',

    preIslamicLife: {
      titleAr: 'أحواله ومكانته قبل الإسلام',
      titleEn: 'Life & Status Before Islam',
      statusInQurayshAr: 'كان من أعيان بني زهرة وأشرافها، ورجل تجارة وأمانة وحصافة عقل، عُرف بالصدق والمروءة والنزاهة.',
      statusInQurayshEn: 'One of the noblemen of Banu Zuhrah, recognized across Makkah for extraordinary financial honesty, chivalry, and shrewd enterprise.',
      moralsAndNatureAr: 'حرّم على نفسه الخمر في الجاهلية قائلاً: "لا أشرب ما يُذهب عقلي ويُنقص مروءتي"، ولم يسجد لصنم قط.',
      moralsAndNatureEn: 'Forbidden alcohol upon himself in pagan times, saying: "I will not drink what deprives my intellect and reduces my dignity," nor did he worship idols.',
      tradeAndKnowledgeAr: 'كان يتمتع بذهنية تجارية عبقرية؛ قال عن نفسه: "لو رفعت حجراً لرجوت أن أجد تحته ذهباً وفضة لكثرة بركة الله في تجارته".',
      tradeAndKnowledgeEn: 'Possessed legendary commercial brilliance; he remarked: "Even if I lifted a stone, I would expect to discover gold and silver beneath it by Allah\'s blessing."'
    },

    embracingIslam: {
      titleAr: 'إسلامه المبارك وبداية الجهاد',
      titleEn: 'Embracing Islam & Early Struggles',
      storyAr: 'أسلم مبكراً بدعوة أبي بكر الصديق قبل دخول النبي ﷺ دار الأرقم، فكان من الثمانية الأوائل الذين دخلوا الإسلام.',
      storyEn: 'Accepted Islam in the earliest days via Abu Bakr before the Prophet entered Dar Al-Arqam, ranking among the first eight believers.',
      earlyPrecedenceAr: 'هاجر الهجرتين إلى الحبشة فراراً بدينه من بطش قريش، ثم هاجر إلى المدينة المنورة.',
      earlyPrecedenceEn: 'Participated in both migrations to Abyssinia enduring displacement, then migrated to Madinah.',
      advocacyAndSacrificesAr: 'آخى النبي ﷺ بينه وبين سعد بن الربيع الأنصاري، فعرض عليه سعد أن يقاسمه نصف ثروته وإحدى زوجتيه، فرد عبد الرحمن بأعظم نموذج لعزة النفس والتوكل: "بارك الله لك في أهلك ومالك، دُلّني على السوق"، فذهب واشترى وباع وأصبح في أيام من كبار الأثرياء.',
      advocacyAndSacrificesEn: 'Paired in brotherhood with Sa\'d ibn Ar-Rabi\', who offered to share half his fortune and houses. Abdur-Rahman replied with legendary self-reliance: "May Allah bless your wealth and family; just direct me to the marketplace!" Within days, he was self-made and wealthy.'
    },

    migrationAndJihad: {
      titleAr: 'جهاده وبذله المبارك',
      titleEn: 'Stances in Jihad & Spending',
      migrationStoryAr: 'بنى نفسه بنفسه في المدينة بفضل الله وتجارته النظيفة، وكان يمول جيوش المسلمين بأموال طائلة.',
      migrationStoryEn: 'Built financial independence in Madinah through fair commerce, financing Muslim state defense tirelessly.',
      majorBattlesAr: [
        'شهد بدراً وأبلى فيها بلاءً حسناً، وهو الذي دلّ الغلامين معاذ ومعوّذ على رأس الشرك أبي جهل ليقتلاه.',
        'ثبت في أحد مع النبي ﷺ وجُرح أكثر من عشرين جرحاً وسقطت ثنيتاه فعُرف بهتكه الشريف، وأصيب في رجله فظل يعرج بها فخراً في سبيل الله.',
        'صلّى النبي ﷺ خلفه في غزوة تبوك! وهذه منقبة لم ينلها إلا عبد الرحمن وأبو بكر الصديق.',
        'تجهيز الجيوش بالذهب والإبل والزاد في سبيل الله.'
      ],
      majorBattlesEn: [
        'Fought at Badr, guiding the young brothers Mu\'adh and Mu\'awwadh to slay Abu Jahl, leader of paganism.',
        'Stood firm at Uhud sustaining over 20 wounds; lost front teeth and walked with a limp thereafter as a badge of honor.',
        'The Prophet Muhammad ﷺ prayed behind him as a follower (Ma\'mum) during the Tabuk expedition—an honor shared only with Abu Bakr!',
        'Equipped Muslim armed forces with endless camels, gold, and provisions.'
      ],
      unmatchedSacrificesAr: 'دخلت المدينة يوماً قافلة تجارية له من سبعمائة بعير محملة بالبر والدقيق والطعام، فرجّت المدينة بصوتها، فتصدق بها كلها بأحمالها وأقتابها وأحلاسها على فقراء المدينة!',
      unmatchedSacrificesEn: 'When his trade caravan of 700 camels loaded with wheat and food rattled Madinah, he donated all 700 loaded camels and saddles to the poor of the city for Allah\'s sake.'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«عَبْدُ الرَّحْمَنِ بْنُ عَوْفٍ فِي الجَنَّةِ»', source: 'سنن الترمذي' },
        { hadith: '«صَلَّى رَسُولُ اللَّهِ ﷺ خَلْفَ عَبْدِ الرَّحْمَنِ بْنِ عَوْفٍ رَكْعَةً»', source: 'صحيح مسلم' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"Abdur-Rahman ibn Awf is in Paradise."', source: 'Jami` at-Tirmidhi' },
        { hadith: '"The Messenger of Allah ﷺ prayed a Rak\'ah behind Abdur-Rahman ibn Awf."', source: 'Sahih Muslim' }
      ],
      titlesAndHonorsAr: [
        'أحد العشرة المبشرين بالجنة.',
        'الصحابي الذي صلّى النبي ﷺ مأموماً خلفه.',
        'أمين الشورى الذي تنازل عن الخلافة لله وجمع كلمة الأمة باختيار عثمان.'
      ],
      titlesAndHonorsEn: [
        'Promised Paradise in the authentic single hadith.',
        'Led prayer with the Prophet Muhammad ﷺ praying behind him.',
        'Arbiter of the Shura who renounced caliphate candidacy to unite the Ummah behind Uthman.'
      ],
      testimoniesAr: [
        'قال طلحة بن عبيد الله: "كان أهل المدينة عيالاً على عبد الرحمن بن عوف: ثلث يقرضهم، وثلث يقضي ديونهم، وثلث يصلهم ويعطيهم".',
        'قالت عائشة رضي الله عنها: "سقى الله عبد الرحمن بن عوف من سلسبيل الجنة".'
      ],
      testimoniesEn: [
        'Talha stated: "All residents of Madinah lived off the hospitality of Abdur-Rahman: a third he loaned money to, a third whose debts he paid, and a third he supported gratuitously."',
        'Aisha (R.A.) prayed: "May Allah quench Abdur-Rahman ibn Awf from Salsabeel, the springs of Paradise!"'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'دوره التاريخي في مجلس الشورى',
      titleEn: 'Historic Role in the Shura',
      stanceAtProphetsDeathAr: 'كان مستشاراً مؤتمناً لأبي بكر وعمر، وكان يتولى رعاية أمهات المؤمنين والإنفاق عليهن وحراستهن في الحج.',
      stanceAtProphetsDeathEn: 'Senior confidant to Abu Bakr and Umar; took personal responsibility for escorting, guarding, and maintaining the Mothers of the Believers during Hajj.',
      roleOrCaliphateAr: 'صانع الاستقرار؛ جعله عمر في الستة أصحاب الشورى، فتنازل عن حقه في الخلافة، وظل ثلاثة أيام يطوف على بيوت المهاجرين والأنصار يسألهم حتى أجمعوا على عثمان.',
      roleOrCaliphateEn: 'The peacemaker: Voluntarily withdrew his own candidacy for caliphate, spending three sleepless days surveying citizens to elect Uthman peacefully.',
      majorAchievementsAr: [
        'تأمين وحدة الأمة في أخطر منعطف سياسي بعد استشهاد الفاروق عمر.',
        'أوصى عند موته بخمسين ألف دينار في سبيل الله، وبأربعمائة دينار لكل من بقي حياً من أهل بدر.',
        'أعتق في يوم واحد ثلاثين عبداً لوجه الله.'
      ],
      majorAchievementsEn: [
        'Preserved Muslim solidarity at the most perilous juncture following Umar\'s assassination.',
        'Bequeathed 50,000 gold dinars for charity and 400 gold dinars to every surviving veteran of Badr.',
        'Emancipated thirty slaves in a single day purely for the sake of Allah.'
      ]
    },

    passingAndTributes: {
      titleAr: 'وفاته وتوديعه للدنيا',
      titleEn: 'Passing & Farewell',
      deathDetailsAr: 'توفي سنة 32 هـ بالمدينة المنورة عن عمر ناهز 75 عاماً، وبكى عند احتضاره لما قُدم له طعام طيب وتذكر مصعب بن عمير وحمزة اللذين استشهدا ولم يجدا ما يُكفنان به.',
      deathDetailsEn: 'Passed away in 32 AH in Madinah aged 75. Wept on his deathbed remembering Mus\'ab ibn Umayr and Hamzah who died in poverty while he was granted riches.',
      lastWordsAr: 'كان يرجو رحمة الله ويبتهل إليه أن يتغمده بفضله ورضوانه.',
      lastWordsEn: 'Repeatedly sought Allah\'s boundless mercy, begging to enter Paradise among the righteous.',
      restingPlaceAr: 'حمل جنازته سعد بن أبي وقاص وصلى عليه عثمان بن عفان، ودُفن في البقيع المبارك.',
      restingPlaceEn: 'His funeral bier was carried by Sa\'d ibn Abi Waqqas, prayer led by Caliph Uthman, buried in Al-Baqi.'
    },

    inspirationalLessonsAr: [
      'عزة النفس والاعتماد على الكسب الحلال والعمل الدؤوب.',
      'أن الغنى الصالح في يد العبد الصالح نعمة كبرى تعمر الدنيا والآخرة.',
      'التجرد والإيثار والتنازل عن المناصب الدنيوية لصالح وحدة الأمة.',
      'البكاء من خشية الله والتواضع مهما بلغت الثروة والمنزلة.'
    ],
    inspirationalLessonsEn: [
      'Self-respect, reliance on legitimate hard work, and business ethics.',
      'Ethical wealth in the hands of a righteous servant is an immense catalyst for social good.',
      'Relinquishing executive power selflessly for the greater unity of the community.',
      'Crying out of the fear of Allah and staying humble despite vast fortunes.'
    ]
  },

  // 8. سعد بن أبي وقاص
  {
    id: 'saad-ibn-abi-waqqas',
    order: 8,
    nameAr: 'سعد بن أبي وقاص',
    nameEn: 'Sa\'d ibn Abi Waqqas',
    titleBadgeAr: 'فارس الإسلام • أول من رمى بسهم في سبيل الله • فاتح القادسية والمدائن',
    titleBadgeEn: 'Knight of Islam • First Archer in Islam • Hero of Al-Qadisiyyah',
    fullNameAr: 'سعد بن أبي وقاص (مالك) بن وهيب بن عبد مناف بن زهرة بن كلاب القرشي الزهري',
    fullNameEn: 'Sa\'d ibn Abi Waqqas (Malik) ibn Wuhayb ibn Abd Manaf ibn Zuhrah ibn Kilab Al-Qurashi',
    kunyaAr: 'أبو إسحاق (وكان رسول الله ﷺ يقول: «هَذَا خَالِي فَلْيُرِنِي امْرُؤٌ خَالَهُ»)',
    kunyaEn: 'Abu Ishaq (The Prophet ﷺ proudly declared: "This is my maternal uncle; let any man show me his uncle!")',
    birthYearAr: '595 م (قبل البعثة بنحو سبعة عشر عاماً)',
    birthYearEn: '595 CE (approx. 17 years before the Prophetic Mission)',
    deathYearAr: '55 هـ / 674 م (آخر العشرة المبشرين بالجنة وفاة، عن عمر 80 سنة)',
    deathYearEn: '55 AH / 674 CE (The last surviving of the Ten Promised Paradise, aged 80)',
    burialPlaceAr: 'المدينة المنورة (مقبرة البقيع الشريف)',
    burialPlaceEn: 'Al-Madinah Al-Munawwarah (Al-Baqi Cemetery)',
    kinshipAr: 'خال رسول الله ﷺ من بني زهرة (أخوال النبي ﷺ)، ومن السابقين الأولين إلى الإسلام.',
    kinshipEn: 'Maternal uncle of the Prophet ﷺ through Banu Zuhrah, and one of the very earliest converts.',
    gladTidingsHadithAr: '«وَسَعْدٌ فِي الْجَنَّةِ... ارْمِ سَعْدُ فِدَاكَ أَبِي وَأُمِّي» [صحيح البخاري ومسلم]',
    gladTidingsHadithEn: '"Sa\'d is in Paradise... Shoot, O Sa\'d! May my father and mother be ransomed for you!" [Sahih Al-Bukhari & Muslim]',
    keyQuoteAr: '«ارْمِ سَعْدُ فِدَاكَ أَبِي وَأُمِّي» وقوله: «ما رميت سهماً في سبيل الله إلا وأنا أرجو أن يصيب عدواً لله»',
    keyQuoteEn: '"Shoot, O Sa\'d, may my parents be ransomed for you!" and "Never did I shoot an arrow for Allah\'s cause except hoping it strikes down an enemy of Allah."',

    preIslamicLife: {
      titleAr: 'أحواله ومكانته قبل الإسلام',
      titleEn: 'Life & Status Before Islam',
      statusInQurayshAr: 'كان شاباً شجاعاً من أشراف بني زهرة، حريصاً على صناعة الأقواس والسهام وركوب الخيل والصيد، مبرزاً في الرماية.',
      statusInQurayshEn: 'A bold young noble of Banu Zuhrah who specialized in bow-crafting, archery, hunting, and horse-riding, renowned for unmatched precision.',
      moralsAndNatureAr: 'كان باراً بأمه براً عظيماً، نقي السريرة، لم تعجبه عبادة الأصنام وكان يكره ظلم قريش وضعف منطقها.',
      moralsAndNatureEn: 'Exemplary in devotion to his mother, pure-hearted, disgusted by idol-worship and tribal injustice.',
      tradeAndKnowledgeAr: 'عمل في بري السهام وصناعة النبال، مما أكسبه دقة بصرية فائقة ومهارة حربية فريدة.',
      tradeAndKnowledgeEn: 'Mastered the manufacture of arrows and ballistic balance, developing legendary marksmanship.'
    },

    embracingIslam: {
      titleAr: 'إسلامه وثباته العظيم أمام والدته',
      titleEn: 'Embracing Islam & Maternal Test',
      storyAr: 'أسلم على يد أبي بكر الصديق وهو ابن سبع عشرة سنة، وكان يقول: "لقد مكثت سبعة أيام وإني لثلث الإسلام" (أي ثالث رجل أسلم).',
      storyEn: 'Accepted Islam via Abu Bakr at age 17, stating: "I spent seven days being one-third of Islam (one of the first three men to believe)."',
      earlyPrecedenceAr: 'أول من أراق دماً في سبيل الله دفاعاً عن حرية العقيدة عندما اعتدى كفار قريش على المسلمين وهم يصلون في شعاب مكة، وأول من رمى بسهم في الإسلام في سرية عبيدة بن الحارث.',
      earlyPrecedenceEn: 'First to draw blood defending Muslims praying in Makkah valleys, and the first archer to shoot an arrow for the cause of Islam in Ubaydah\'s expedition.',
      advocacyAndSacrificesAr: 'أضربت أمه عن الطعام والشراب حتى تكاد تهلك ليرجع عن دينه، فنزل فيه قول الله تعالى: ﴿وَإِن جَاهَدَاكَ عَلَىٰ أَن تُشْرِكَ بِي مَا لَيْسَ لَكَ بِهِ عِلْمٌ فَلَا تُطِعْهُمَا وَصَاحِبْهُمَا فِي الدُّنْيَا مَعْرُوفًا﴾، فقال لها سعد بثبات: "يا أماه، والله لو كانت لك مائة نفس فخرجت نفساً نفساً ما تركت ديني هذا لشيء، فإن شئتِ فكلي وإن شئتِ فلا تأكلي"، فلما رأت ثباته أكلت.',
      advocacyAndSacrificesEn: 'His mother went on a hunger strike to death to force him to recant. Allah revealed: "If they strive to make you associate partners with Me... do not obey them, but accompany them in this world with kindness." Sa\'d declared: "O Mother! By Allah, if you had a hundred souls and they departed one by one, I would never abandon this religion!" Seeing his resolve, she ended her strike.'
    },

    migrationAndJihad: {
      titleAr: 'فارس الإسلام وفاتح القادسية',
      titleEn: 'Commander of Al-Qadisiyyah',
      migrationStoryAr: 'هاجر إلى المدينة، وكان حارساً لرسول الله ﷺ في ليالي الخوف، وبات يحرس النبي ﷺ حتى نام النبي قرير العين ودعا له.',
      migrationStoryEn: 'Migrated to Madinah. Guarded the Prophet\'s tent during perilous nights until the Prophet ﷺ slept peacefully and prayed for him.',
      majorBattlesAr: [
        'غزوة أحد: نثل له رسول الله ﷺ كنانته وجمع له أبويه، وهو شرف لم يجتمع لأحد غيره: «ارْمِ سَعْدُ فِدَاكَ أَبِي وَأُمِّي»، فكان يرمي السهم فيصيب به العدو في مقتل.',
        'معركة القادسية الكبرى (15 هـ): قاد جيش المسلمين بإمرة الفاروق عمر، وهزم إمبراطورية الفرس الساسانية وقائدهم رستم في معركة تاريخية خالدة.',
        'فتح المدائن (عاصمة كسرى): عبر بجيشه نهر دجلة وهو يفيض في معجزة عسكرية باهرة، ودخل إيوان كسرى وصلى فيه ثماني ركعات صلاة الفتح، وتلا: ﴿كَمْ تَرَكُوا مِن جَنَّاتٍ وَعُيُونٍ﴾.',
        'بناء مدينة الكوفة: أسس الكوفة بأمر عمر لتكون معسكراً للمسلمين.'
      ],
      majorBattlesEn: [
        'Battle of Uhud: The Prophet handed him his quiver, granting him an unprecedented honor: "Shoot, O Sa\'d, may my father and mother be ransomed for you!" Every arrow struck lethally.',
        'Battle of Al-Qadisiyyah (15 AH): Supreme commander appointed by Umar, crushing the Sasanian Persian Empire and defeating their commander Rostam in an epochal victory.',
        'Liberation of Ctesiphon (Al-Mada\'in): Crossed the flooded Tigris River with his cavalry and recited in Khosrow\'s Palace: "How many gardens and fountains did they leave behind!"',
        'Founded the garrison city of Kufa under Umar\'s instructions.'
      ],
      unmatchedSacrificesAr: 'دعا له النبي ﷺ فقال: «اللَّهُمَّ سَدِّدْ رَمْيَتَهُ، وَأَجِبْ دَعْوَتَهُ»، فكان مستجاب الدعوة مهاباً، لا يدعو على أحد إلا استجاب الله له.',
      unmatchedSacrificesEn: 'The Prophet ﷺ prayed for him: "O Allah, direct his shooting and answer his prayers." He was famous for instantly answered prayers (Mustajab Ad-Da\'wah).'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«ارْمِ سَعْدُ فِدَاكَ أَبِي وَأُمِّي»', source: 'متفق عليه' },
        { hadith: '«اللَّهُمَّ اسْتَجِبْ لِسَعْدٍ إِذَا دَعَاكَ»', source: 'صحيح الترمذي' },
        { hadith: '«يَدْخُلُ عَلَيْكُمُ الآنَ رَجُلٌ مِنْ أَهْلِ الجَنَّةِ» فطلع سعد بن أبي وقاص ثلاث مرات في ثلاثة أيام متتالية!', source: 'مسند أحمد والنسائي' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"Shoot, O Sa\'d, may my parents be ransomed for you!"', source: 'Sahih Al-Bukhari & Muslim' },
        { hadith: '"O Allah, answer Sa\'d whenever he calls upon You."', source: 'Jami` at-Tirmidhi' },
        { hadith: '"A man from the people of Paradise will now enter upon you." And Sa\'d entered three consecutive days!', source: 'Musnad Ahmad & An-Nasa\'i' }
      ],
      titlesAndHonorsAr: [
        'أول من رمى بسهم في الإسلام، ومستجاب الدعوة.',
        'الصحابي الوحيد الذي جمع له النبي ﷺ أبويه في الفداء.',
        'فاتح بلاد فارس وقاهر إمبراطورية الأكاسرة.',
        'آخر من توفي من العشرة المبشرين بالجنة.'
      ],
      titlesAndHonorsEn: [
        'First archer in Islam with answered supplications.',
        'Only companion for whom the Prophet said: "May my father and mother be ransomed for you."',
        'Conqueror of the Sasanian Empire.',
        'The last surviving companion among the Ten Promised Paradise.'
      ],
      testimoniesAr: [
        'قال النبي ﷺ لأصحابه: "هذا خالي فليرني امرؤ خاله!".',
        'قال عبد الله بن عمر: "كنا جلوساً مع رسول الله فقال: يدخل عليكم رجل من أهل الجنة، فدخل سعد".'
      ],
      testimoniesEn: [
        'The Prophet ﷺ proudly declared to his companions: "This is my uncle, let anyone show me his uncle!"',
        'Abdullah ibn Umar witnessed the Prophet predict three times that a man of Paradise was entering, and each time it was Sa\'d.'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'مواقفه بعد وفاة النبي ﷺ',
      titleEn: 'Stances After the Prophet & Legacy',
      stanceAtProphetsDeathAr: 'تولى قيادة الجيوش الشرقية في عهد عمر وعثمان، وكان والياً على الكوفة وأحد أهل الشورى الستة.',
      stanceAtProphetsDeathEn: 'Supreme eastern military commander under Umar and Uthman, governor of Kufa, and member of the Shura council.',
      roleOrCaliphateAr: 'اعتزل الفتنة الكبرى تماماً بعد استشهاد عثمان، ولزم بيته في العقيق رافضاً الدخول في أي قتال بين المسلمين.',
      roleOrCaliphateEn: 'Completely retired to his estate at Al-Aqiq during the civil strife after Uthman, refusing to participate in intra-Muslim warfare.',
      majorAchievementsAr: [
        'معركة القادسية وفتح العراق وفارس وإسقاط دولة كسرى.',
        'تأسيس مدينة الكوفة.',
        'الحفاظ على سلامة اليد من دماء المسلمين أثناء الفتن.'
      ],
      majorAchievementsEn: [
        'Historic triumph at Al-Qadisiyyah and liberation of Iraq and Persia.',
        'Urban founding of Kufa.',
        'Keeping his hands clean of Muslim blood during civil unrest.'
      ]
    },

    passingAndTributes: {
      titleAr: 'وفاته وتوديعه للدنيا',
      titleEn: 'Passing & Farewell',
      deathDetailsAr: 'توفي في قصره بالعقيق على بعد أميال من المدينة المنورة سنة 55 هـ عن عمر ناهز ثمانين سنة، وكان آخر العشرة المبشرين بالجنة وفاة.',
      deathDetailsEn: 'Passed away at his estate in Al-Aqiq near Madinah in 55 AH aged 80, the last of the Ten Promised Paradise to pass on.',
      lastWordsAr: 'طلب جبّة صوف قديمة كانت عنده وقال: "كفنوني بها، فإني لقيت بها المشركين يوم بدر، وإنما كنت أخبؤها لهذا اليوم".',
      lastWordsEn: 'Asked for an old woolen cloak: "Shroud me in this, for I wore it fighting the pagans at Badr, and I preserved it for this day."',
      restingPlaceAr: 'حُمل على أعناق الرجال إلى المدينة المنورة وصلى عليه مروان بن الحكم ودُفن في البقيع، وبكته أمهات المؤمنين وسائر الصحابة.',
      restingPlaceEn: 'Carried to Madinah and buried in Al-Baqi cemetery, mourned by the Mothers of the Believers and the entire generation.'
    },

    inspirationalLessonsAr: [
      'الدعاء المستجاب الذي ينبع من صفاء القلب وأكل الحلال.',
      'الثبات الراسخ على العقيدة حتى أمام عواطف أقرب الناس.',
      'المهارة والاحتراف العالي في خدمة المبادئ السامية.',
      'اعتزال الفتنة وحقن دماء المسلمين.'
    ],
    inspirationalLessonsEn: [
      'Supplications answered through pure food, pure deeds, and a clean heart.',
      'Steadfastness in faith even against intense emotional family pressures.',
      'Mastery of skill and military brilliance applied for divine justice.',
      'Refusal to participate in partisan discord, safeguarding sanctities.'
    ]
  },

  // 9. سعيد بن زيد
  {
    id: 'saeed-ibn-zayd',
    order: 9,
    nameAr: 'سعيد بن زيد',
    nameEn: 'Saeed ibn Zayd',
    titleBadgeAr: 'ابن الحنيف الباحث عن التوحيد • مستجاب الدعوة • بطل اليرموك والفتوح',
    titleBadgeEn: 'Son of the Hanif • Champion of Yarmouk • Pure Monotheist',
    fullNameAr: 'سعيد بن زيد بن عمرو بن نفيل بن عبد العزى بن رياح بن عبد الله بن قرط القرشي العدوي',
    fullNameEn: 'Saeed ibn Zayd ibn Amr ibn Nufayl ibn Abd Al-Uzza ibn Riyah ibn Abdullah ibn Qurṭ Al-Qurashi',
    kunyaAr: 'أبو الأعور (ويُكنى أيضاً بأبي ثور)',
    kunyaEn: 'Abu Al-A\'war (Also kunya Abu Thawr)',
    birthYearAr: '593 م (قبل البعثة بسبعة عشر عاماً)',
    birthYearEn: '593 CE (approx. 17 years before the Prophetic Mission)',
    deathYearAr: '51 هـ / 671 م (عن عمر يناهز 79 سنة في العقيق)',
    deathYearEn: '51 AH / 671 CE (Aged 79 at Al-Aqiq near Madinah)',
    burialPlaceAr: 'المدينة المنورة (مقبرة البقيع الشريف)',
    burialPlaceEn: 'Al-Madinah Al-Munawwarah (Al-Baqi Cemetery)',
    kinshipAr: 'ابن عم عمر بن الخطاب، وزوج أخته فاطمة بنت الخطاب، وزوجته أخت عمر، وكان عمر متزوجاً من أخته عاتكة بنت زيد.',
    kinshipEn: 'Cousin of Umar ibn Al-Khattab, husband of Umar\'s sister Fatimah bint Al-Khattab, while Umar married Saeed\'s sister Atikah.',
    gladTidingsHadithAr: '«وَسَعِيدُ بْنُ زَيْدٍ فِي الْجَنَّةِ...» [صحيح الترمذي وأبو داود]',
    gladTidingsHadithEn: '"Saeed ibn Zayd is in Paradise..." [Jami` at-Tirmidhi & Sunan Abi Dawud]',
    keyQuoteAr: '«اللَّهُمَّ إِنْ كُنْتَ حَرَمْتَ أَبِي هَذَا الخَيْرَ فَلَا تَحْرِمْنِي أَنَا وَابْنِي»',
    keyQuoteEn: '"O Allah, if You have deprived my father of this divine good (Islam), do not deprive me and my son from it!"',

    preIslamicLife: {
      titleAr: 'أحواله ونشأته في بيت الحنيفية',
      titleEn: 'Upbringing in a Monotheist Home',
      statusInQurayshAr: 'هو ابن زيد بن عمرو بن نفيل، الحنيف الباحث عن دين إبراهيم، الذي اعتزل عبادة الأصنام في الجاهلية ورفض أكل الميتة والذبائح المذبوحة على النصب، وقال عنه النبي ﷺ: «يُبْعَثُ يَوْمَ القِيَامَةِ أُمَّةً وَحْدَهُ».',
      statusInQurayshEn: 'Son of Zayd ibn Amr ibn Nufayl, the legendary Hanif monotheist who rejected idols and pagan meats before Islam. The Prophet ﷺ said of his father: "He will be resurrected on the Day of Judgment as a nation unto himself."',
      moralsAndNatureAr: 'تغذى سعيد في طفولته على نبذ الأوثان والبحث عن دين إبراهيم الحنيف، فنشأ عفيفاً صادقاً نقياً من دنس الشرك.',
      moralsAndNatureEn: 'Nourished upon pure monotheism and distaste for idolatry from infancy, growing up upright and sincere.',
      tradeAndKnowledgeAr: 'كان رجلاً حكيماً زاهداً، صلب الشكيمة في الحق، متواضعاً لا يطلب الرياسة ولا الشهرة.',
      tradeAndKnowledgeEn: 'A wise, ascetic nobleman of quiet resolve who shunned political ambition and ostentation.'
    },

    embracingIslam: {
      titleAr: 'إسلامه المبكر ودوره في إسلام عمر',
      titleEn: 'Early Islam & Role in Umar\'s Conversion',
      storyAr: 'أسلم هو وزوجته فاطمة بنت الخطاب قبل أن يدخل رسول الله ﷺ دار الأرقم، فكان من أوائل المؤمنين الذين صدقوا الرسالة.',
      storyEn: 'Embraced Islam along with his wife Fatimah bint Al-Khattab before the Prophet entered Dar Al-Arqam, among the very first pioneers.',
      earlyPrecedenceAr: 'كان بيته منارة الدعوة الأولى وسراً من أسرار إسلام عمر بن الخطاب رضي الله عنه؛ حيث كان خبّاب بن الأرت يعلّمهما سورة طه في بيتهما، فلما دخل عمر غاضباً واجههما، فثبت سعيد وقال: "أرأيت يا عمر إن كان الحق في غير دينك؟" فكان هذا الموقف بداية تحول الفاروق.',
      earlyPrecedenceEn: 'His home was the catalyst for Umar ibn Al-Khattab\'s conversion. Khabbab was teaching them Surah Taha when Umar broke in. Saeed stood fearless: "O Umar, what if the truth lies outside your pagan faith?" sparking Umar\'s spiritual turnaround.',
      advocacyAndSacrificesAr: 'تحمّل الأذى الشديد من قريش وصبر مع زوجته حتى أذن الله بالهجرة إلى يثرب.',
      advocacyAndSacrificesEn: 'Endured rigorous trials and boycott in Makkah patiently until migration to Madinah was decreed.'
    },

    migrationAndJihad: {
      titleAr: 'بطولاته وجهاده في الفتوحات',
      titleEn: 'Heroism & Battles in the Levant',
      migrationStoryAr: 'هاجر إلى المدينة، وأرسله النبي ﷺ مع طلحة بن عبيد الله في مهمة استطلاعية لترصد عير قريش قبل بدر، فضرب له النبي ﷺ بسهمه وأجره.',
      migrationStoryEn: 'Migrated to Madinah. Dispatched with Talha on pre-Badr reconnaissance; the Prophet ﷺ granted him full status and reward of Badr veterans.',
      majorBattlesAr: [
        'شهد غَزْوَةَ أُحُدٍ والخندق والحديبية وبيعة الرضوان وخيبر وفتح مكة وحنين وتبوك وحجة الوداع.',
        'معركة اليرموك الخالدة: كان قائداً لفرسان المسلمين، وترجل يقاتل راجلاً ببطولة خارقة، وكان سبباً حاسماً في هزيمة الروم.',
        'فتح دمشق: كان من أوائل من اقتحموا أسوار دمشق، وولاه أبو عبيدة بن الجراح عليها، فتنازل عنها رغبة في الجهاد قائلاً: "ما كنت لأوثر نفسي بالولاية على إخواني في الجهاد".'
      ],
      majorBattlesEn: [
        'Fought at Uhud, the Trench, Hudaybiyyah, Khaybar, Makkah, and Tabuk.',
        'Battle of Yarmouk: Commanded cavalry battalions, dismounted to fight on foot with stunning courage, decisively turning the tide against the Byzantines.',
        'Liberation of Damascus: First to scale Damascus walls; appointed its first Muslim governor, but stepped down to rejoin combat, saying: "I would never prefer governance over frontline service with my brothers."'
      ],
      unmatchedSacrificesAr: 'عُرف باستجابة الدعاء؛ خاصمته امرأة تدعى أروى بنت أوس وادّعت كذباً أنه غصب جزءاً من أرضها، فقال: "اللهم إن كانت كاذبة فاعمِ بصرها واقتلها في أرضها"، فعميت وسقطت في بئر بأرضها وماتت!',
      unmatchedSacrificesEn: 'Known for answered prayers. A woman named Arwa falsely accused him of taking land. He prayed: "O Allah, if she is lying, blind her eyes and make her grave in her well." She lost her eyesight and fell into her well.'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«وَسَعِيدُ بْنُ زَيْدٍ فِي الجَنَّةِ»', source: 'سنن الترمذي' },
        { hadith: 'هو راوي حديث العشرة المبشرين بالجنة الشهير، وكان يتحرج من ذكر نفسه تواضعاً حتى ألحّ عليه الصحابة فذكر اسمه عاشراً!', source: 'سنن أبي داود' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"Saeed ibn Zayd is in Paradise."', source: 'Jami` at-Tirmidhi' },
        { hadith: 'He is the primary narrator of the Ten Promised Paradise hadith. Out of humility, he kept naming nine until scholars pressed him, then named himself tenth!', source: 'Sunan Abi Dawud' }
      ],
      titlesAndHonorsAr: [
        'أحد العشرة المبشرين بالجنة.',
        'أول والٍ مسلم على دمشق الفيحاء وتنازل عنها للجهاد.',
        'المستجاب الدعوة والزاهد في الإمارة والرياسة.'
      ],
      titlesAndHonorsEn: [
        'One of the Ten Promised Paradise.',
        'First Muslim governor of Damascus who relinquished office to stay on the frontlines.',
        'Man of answered supplication who completely rejected political prominence.'
      ],
      testimoniesAr: [
        'كان الصحابة يعرفون لسعيد فضله وسابقته ومكانته العالية.',
        'لما شُهد له بالجنة، بكى خوفاً وخشية من الله تعالى.'
      ],
      testimoniesEn: [
        'The companions revered Saeed\'s purity, precedence, and unblemished record.',
        'Whenever reminded of his glad tidings of Paradise, he wept in fear and awe of Allah.'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'مواقفه بعد وفاة النبي ﷺ',
      titleEn: 'Stances After the Prophet & Legacy',
      stanceAtProphetsDeathAr: 'شهد الفتوحات الكبرى في الشام تحت قيادة أبي عبيدة وخالد بن الوليد، واعتزل المناصب الدنيوية.',
      stanceAtProphetsDeathEn: 'Fought across the Syrian campaigns under Abu Ubaydah and Khalid ibn Al-Walid, declining governance.',
      roleOrCaliphateAr: 'اعتزل الفتن كلياً ولزم عبادة ربه في مزرعته بالعقيق خارج المدينة المنورة.',
      roleOrCaliphateEn: 'Withdrew from civil discord, dedicating his twilight years to prayer and contemplation at Al-Aqiq.',
      majorAchievementsAr: [
        'بطولاته الفاصلة في فتوحات الشام واليرموك ودمشق.',
        'رواية أحاديث السنن وفضائل الصحابة.',
        'القدوة في التجرد ونبذ المطامع السياسية.'
      ],
      majorAchievementsEn: [
        'Pivotal combat feats in the Syrian liberations, Yarmouk, and Damascus.',
        'Transmitting authentic Prophetic hadiths.',
        'Epitome of selfless non-attachment to worldly status.'
      ]
    },

    passingAndTributes: {
      titleAr: 'وفاته وتوديعه للدنيا',
      titleEn: 'Passing & Farewell',
      deathDetailsAr: 'توفي سنة 51 هـ في العقيق عن عمر يناهز تسعة وسبعين عاماً.',
      deathDetailsEn: 'Passed away in 51 AH at Al-Aqiq near Madinah aged 79.',
      lastWordsAr: 'فاضت روحه الطاهرة وهو يذكر الله ويحمده على نعمة الإسلام.',
      lastWordsEn: 'His soul departed serenely praising Allah for the blessing of Islam.',
      restingPlaceAr: 'غسّله سعد بن أبي وقاص وكفّنه وصلى عليه عبد الله بن عمر، ودُفن في البقيع بالمدينة المنورة.',
      restingPlaceEn: 'Washed by Sa\'d ibn Abi Waqqas, funeral prayer led by Abdullah ibn Umar, buried in Al-Baqi.'
    },

    inspirationalLessonsAr: [
      'التواضع الشديد وستر الفضائل وعدم التباهي بالبشارة بالجنة.',
      'الزهد في المناصب والولايات وتقديم مرضاة الله على حطام الدنيا.',
      'الثبات على الحق واليقين الصادق في أوقات الشدائد.',
      'الاستجابة لنداء التوحيد ونبذ الشرك والخرافات.'
    ],
    inspirationalLessonsEn: [
      'Humility in concealing one\'s merits rather than boasting of glad tidings.',
      'Relinquishing high government office for pure devotion and spiritual service.',
      'Steadfast conviction during adversity and persecution.',
      'Pure monotheism rejecting superstition and pagan customs.'
    ]
  },

  // 10. أبو عبيدة بن الجراح
  {
    id: 'abu-ubaydah-ibn-aljarrah',
    order: 10,
    nameAr: 'أبو عبيدة بن الجراح',
    nameEn: 'Abu Ubaydah ibn Al-Jarrah',
    titleBadgeAr: 'أمين الأمة • فاتح الشام • فاتح القدس الشريف • القائد الزاهد',
    titleBadgeEn: 'Trustee of the Ummah • Conqueror of the Levant & Jerusalem',
    fullNameAr: 'عامر بن عبد الله بن الجراح بن هلال بن أهيب بن ضبة بن الحارث بن فهر بن مالك القرشي الفهري',
    fullNameEn: 'Aamir ibn Abdullah ibn Al-Jarrah ibn Hilal ibn Uhayb ibn Dabbah ibn Al-Harith ibn Fihr Al-Qurashi',
    kunyaAr: 'أبو عبيدة (اشتهر بكنيته ونسبه لجده الجراح، ولقّبه رسول الله ﷺ بأمين الأمة)',
    kunyaEn: 'Abu Ubaydah (Commonly known by his kunya, titled Trustee of the Ummah by the Prophet ﷺ)',
    birthYearAr: '583 م (بعد عام الفيل بثلاث عشرة سنة)',
    birthYearEn: '583 CE (approx. 13 years after the Year of the Elephant)',
    deathYearAr: '18 هـ / 639 م (استشهد في طاعون عمواس بالشام وعمره 58 سنة)',
    deathYearEn: '18 AH / 639 CE (Martyred in the Plague of Emmaus in the Levant, aged 58)',
    burialPlaceAr: 'غور الأردن (قرية دير علا في المملكة الأردنية الهاشمية)',
    burialPlaceEn: 'Jordan Valley (Deir Alla, Hashemite Kingdom of Jordan)',
    kinshipAr: 'يلتقي نسبه مع رسول الله ﷺ في جده فهر بن مالك (قريش)، وهو من السابقين الأولين.',
    kinshipEn: 'Lineage converges with the Prophet Muhammad ﷺ at Fihr ibn Malik (forefather of Quraysh).',
    gladTidingsHadithAr: '«وَأَبُو عُبَيْدَةَ بْنُ الجَرَّاحِ فِي الجَنَّةِ... إِنَّ لِكُلِّ أُمَّةٍ أَمِينًا، وَإِنَّ أَمِينَنَا أَيَّتُهَا الأُمَّةُ أَبُو عُبَيْدَةَ بْنُ الجَرَّاحِ» [صحيح البخاري ومسلم]',
    gladTidingsHadithEn: '"And Abu Ubaydah ibn Al-Jarrah is in Paradise... For every nation there is a trustworthy trustee, and the trustee of our Ummah is Abu Ubaydah ibn Al-Jarrah." [Sahih Al-Bukhari & Muslim]',
    keyQuoteAr: '«إني امرؤ من قريش، وما منكم من أحد أحمر ولا أسود يفضلني بتقوى إلا وددت أني في مسلاخه»',
    keyQuoteEn: '"I am merely a man of Quraysh; there is none among you, red or black, who surpasses me in piety except that I wish I were in his skin."',

    preIslamicLife: {
      titleAr: 'أحواله ومكانته قبل الإسلام',
      titleEn: 'Life & Status Before Islam',
      statusInQurayshAr: 'كان من أشراف بني فهر ووجهائها، موصوفاً بالحلم والأمانة الفائقة ورجاحة العقل والشجاعة الباسلة، محترماً عند كل بطون قريش.',
      statusInQurayshEn: 'One of the most dignified chiefs of Banu Fihr, universally venerated across Makkah for integrity, serenity, and courage.',
      moralsAndNatureAr: 'كان وسيماً طويلاً نحيفاً، ذا وجه مهيب وابتسامة مريحة، متواضعاً أشد التواضع، شجاعاً كالسيف، أميناً على الأموال والعهود.',
      moralsAndNatureEn: 'Tall, lean, and luminous with a serene countenance. Extremely humble, courageous, and utterly immune to deceit.',
      tradeAndKnowledgeAr: 'عمل بالتجارة وعُرف بالأمانة المطلقة، حتى كانت قريش تستأمنه على ودائعها وتلجأ إليه في الملمات.',
      tradeAndKnowledgeEn: 'Engaged in trade; famous throughout Arabia as a trustee of financial deposits.'
    },

    embracingIslam: {
      titleAr: 'إسلامه وسَبقه العظيم',
      titleEn: 'Embracing Islam & Sincerity',
      storyAr: 'أسلم على يد أبي بكر الصديق في غداة اليوم التالي لإسلام أبي بكر، وذهب مع عثمان بن مظعون والأرقم وعبد الرحمن بن عوف إلى رسول الله ﷺ فأسلموا جميعاً.',
      storyEn: 'Accepted Islam via Abu Bakr the very next morning after Abu Bakr\'s conversion, declaring faith alongside Uthman ibn Maz\'un and Abdur-Rahman ibn Awf.',
      earlyPrecedenceAr: 'هاجر إلى الحبشة في الهجرة الثانية فراراً بدينه ثم عاد ليشهد مع رسول الله ﷺ بناء الدولة في المدينة.',
      earlyPrecedenceEn: 'Migrated in the second migration to Abyssinia, enduring exile before joining the Prophet in Madinah.',
      advocacyAndSacrificesAr: 'في غزوة بدر، واجه أصعب ابتلاء إيماني؛ حيث حاول والده عبد الله بن الجراح قتله في المعركة وترصّد له مراراً وأبو عبيدة يتحايد عنه، فلما ضيّق عليه الطريق ولم يجد مفراً قتله دفاعاً عن عقيدة التوحيد، فنزل فيه وفي أمثاله قرآن يتلى: ﴿لَّا تَجِدُ قَوْمًا يُؤْمِنُونَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ يُوَادُّونَ مَنْ حَادَّ اللَّهَ وَرَسُولَهُ وَلَوْ كَانُوا آبَاءَهُمْ﴾ [المجادلة: 22].',
      advocacyAndSacrificesEn: 'At Badr, his pagan father repeatedly pursued him to kill him. Abu Ubaydah evaded him until backed into a corner where defending monotheism became imperative, leading to his father\'s death. Allah revealed: "You will not find a people who believe in Allah and the Last Day having affection for those who oppose Allah and His Messenger, even if they were their fathers..." [58:22].'
    },

    migrationAndJihad: {
      titleAr: 'بطولاته وجهاده الأسطوري',
      titleEn: 'Heroic Exploits & Battles',
      migrationStoryAr: 'هاجر إلى المدينة المنورة، وآخى النبي ﷺ بينه وبين محمد بن مسلمة، وسلّمه النبي ﷺ قيادة سرايا كبرى كسريّة سيف البحر (الخبط).',
      migrationStoryEn: 'Migrated to Madinah. Appointed by the Prophet ﷺ to command key strategic missions, including the Expedition of the Fish (Sayf Al-Bahr).',
      majorBattlesAr: [
        'يوم أحد: لما أُصيب النبي ﷺ ودخلت حلقتان من حلق المغفر في وجنته الشريفة، أقبل أبو عبيدة وعضّ على الحلقة الأولى بأسنانه ونزعها فسقطت ثنيته، ثم عضّ على الثانية فنزعها فسقطت ثنيته الأخرى، فصار أهتم (أي ساقط الثنايا) وكان ذلك أجمل ما رُئي في وجه رجل!',
        'فتح الشام: ولاه عمر بن الخطاب القيادة العامة لجيوش المسلمين في بلاد الشام خلفاً لخالد بن الوليد، فتعاملا بأعلى درجات الأدب والأخوة الإسلامية.',
        'معركة اليرموك: قاد الجيش الإسلامي بحكمة وتواضع وتخطيط فذ أذهل قادة الروم.',
        'فتح القدس الشريف: حاصر إيلياء (القدس) حتى اشترط بطريركها صفرونيوس تسليم مفاتيح المدينة لأمير المؤمنين عمر بن الخطاب شخصياً.'
      ],
      majorBattlesEn: [
        'Battle of Uhud: When two links of the helmet dug into the Prophet\'s cheek, Abu Ubaydah pulled the first out with his teeth, breaking his front tooth, then pulled the second, losing his other tooth—a scar regarded as the most noble in history.',
        'Conquest of the Levant: Appointed supreme commander of all Islamic armies in Syria by Umar. He and Khalid cooperated in sublime mutual humility.',
        'Battle of Yarmouk: Orchestrated the overarching logistics and moral fortitude crushing the Byzantine empire.',
        'Liberation of Jerusalem: Besieged Jerusalem until Patriarch Sophronius agreed to surrender the keys exclusively to Caliph Umar.'
      ],
      unmatchedSacrificesAr: 'لما جاء نصارى نجران يطلبون حكماً عدلاً، قال النبي ﷺ: «لَأَبْعَثَنَّ مَعَكُمْ رَجُلًا أَمِينًا، حَقَّ أَمِينٍ، حَقَّ أَمِينٍ»، فاستشرف الصحابة لها، فبعث أبا عبيدة بن الجراح.',
      unmatchedSacrificesEn: 'When the Christians of Najran asked for an upright judge, the Prophet announced: "I will send with you a man who is truly trustworthy, truly trustworthy!" and dispatched Abu Ubaydah.'
    },

    virtuesAndMerits: {
      titleAr: 'بشارته بالجنة وفضائله الشريفة',
      titleEn: 'Glad Tidings of Paradise & Virtues',
      hadithsAndQuotesAr: [
        { hadith: '«إِنَّ لِكُلِّ أُمَّةٍ أَمِينًا، وَإِنَّ أَمِينَ هَذِهِ الأُمَّةِ أَبُو عُبَيْدَةَ بْنُ الجَرَّاحِ»', source: 'صحيح البخاري ومسلم' },
        { hadith: '«أَبُو بَكْرٍ فِي الجَنَّةِ، وَعُمَرُ فِي الجَنَّةِ... وَأَبُو عُبَيْدَةَ بْنُ الجَرَّاحِ فِي الجَنَّةِ»', source: 'صحيح الترمذي' }
      ],
      hadithsAndQuotesEn: [
        { hadith: '"Every Ummah has a trustee, and the trustee of this Ummah is Abu Ubaydah ibn Al-Jarrah."', source: 'Sahih Al-Bukhari & Muslim' },
        { hadith: '"Abu Bakr is in Paradise, Umar is in Paradise... and Abu Ubaydah ibn Al-Jarrah is in Paradise."', source: 'Jami` at-Tirmidhi' }
      ],
      titlesAndHonorsAr: [
        'أمين هذه الأمة بنص حديث المعصوم ﷺ.',
        'فاتح بلاد الشام وقائد جيوش المسلمين العظمى.',
        'محرر بيت المقدس ونازع حلق المغفر عن وجنة النبي ﷺ يوم أحد.'
      ],
      titlesAndHonorsEn: [
        'Trustee of this Ummah by the Prophet\'s declaration.',
        'Supreme Commander and Liberator of the Levant and Jerusalem.',
        'The savior who extracted the helmet links from the Prophet\'s cheek at Uhud.'
      ],
      testimoniesAr: [
        'قال عمر بن الخطاب وهو على فراش الموت: "لو كان أبو عبيدة حياً لاستخلفته، فإن سألني ربي قلت: استخلفت أمين الله وأمين رسوله".',
        'دخل عمر بيته في الشام وهو أمير الجيوش فلم يجد في بيته إلا سيفه وترسه ورحله، فبكى عمر وقال: "غيّرتنا الدنيا كلنا غيرك يا أبا عبيدة!".'
      ],
      testimoniesEn: [
        'Umar said on his deathbed: "If Abu Ubaydah were alive, I would have appointed him Caliph; if my Lord asked me, I would say: I appointed the trustee of Allah and His Messenger."',
        'Umar visited his dwelling in Syria and found only a sword, shield, and traveler\'s mat. Umar wept: "The world changed all of us, except you, O Abu Ubaydah!"'
      ]
    },

    postProphetEraAndLegacy: {
      titleAr: 'قيادة فتوحات الشام وطاعون عمواس',
      titleEn: 'Leadership in Syria & Plague of Emmaus',
      stanceAtProphetsDeathAr: 'يوم سقيفة بني ساعدة، قال أبو بكر للأنصار: "قد رضيت لكم أحد هذين الرجلين فبايعوا: عمر بن الخطاب أو أبا عبيدة بن الجراح"، فقال عمر: "والله ما كنت لأتقدم على رجل أمره رسول الله أن يؤمنا" وبايعوا أبا بكر.',
      stanceAtProphetsDeathEn: 'At the Saqifah, Abu Bakr offered: "I am pleased for you to pledge allegiance to either of these two: Umar or Abu Ubaydah." Umar refused to precede Abu Bakr, confirming their unity.',
      roleOrCaliphateAr: 'قاد الفتوحات الشامية العظيمة وفتح حمص وحلب وأنطاكية ودمشق والقدس، وكان زاهداً رفيقاً بالرعية يعامل أهل الذمة بكل عدل ووفاء.',
      roleOrCaliphateEn: 'Led the momentous Syrian campaigns liberating Homs, Aleppo, Antioch, and Damascus with legendary gentleness and equity.',
      majorAchievementsAr: [
        'الانتصار الحاسم في معركة اليرموك وإنهاء الوجود الروماني في الشام.',
        'فتح القدس الشريف واستقبال الفاروق عمر بن الخطاب.',
        'ضرب أروع أمثلة التواضع والزهد للقيادة العسكرية في التاريخ.'
      ],
      majorAchievementsEn: [
        'Decisive victory at Yarmouk ending Byzantine rule in Syria.',
        'Liberation of Jerusalem and orchestrating Caliph Umar\'s entry.',
        'Setting the timeless standard for ascetic military leadership.'
      ]
    },

    passingAndTributes: {
      titleAr: 'استشهاده في طاعون عمواس',
      titleEn: 'Martyrdom in the Plague of Emmaus',
      deathDetailsAr: 'أصاب طاعون عمواس بلاد الشام سنة 18 هـ، وأرسل إليه عمر رسالة يأمره بالقدوم إلى المدينة لينقذه، ففهم أبو عبيدة وكتب لعمر يعتذر قائلاً: "إني في جند من المسلمين لا أرغب بنفسي عنهم حتى يقضي الله فيّ قضاءه"، فبكى عمر حتى ظن الناس أن أبا عبيدة قد مات.',
      deathDetailsEn: 'When the Plague of Emmaus struck in 18 AH, Umar sent an urgent letter summoning him to Madinah to save his life. Abu Ubaydah politely declined: "I am in the midst of a Muslim army, and I cannot preserve myself above them." Umar wept intensely.',
      lastWordsAr: 'أوصى المسلمين عند احتضاره: "أقيموا الصلاة، وصوموا شهركم، وتصدقوا، وحجوا، وتناصحوا لأمرائكم، ولا تغرنكم الدنيا"، واستشهد شهيداً بالطاعون.',
      lastWordsEn: 'His final testament to the soldiers: "Establish prayer, fast your month, give charity, perform pilgrimage, advise your leaders sincerely, and let not the world deceive you."',
      restingPlaceAr: 'صلّى عليه معاذ بن جبل ودُفن في غور الأردن بقرية دير علا، ومقامه ومسجده معروفان إلى اليوم.',
      restingPlaceEn: 'Mu\'adh ibn Jabal led his funeral prayer, buried in Deir Alla in the Jordan Valley, where his mosque and tomb stand today.'
    },

    inspirationalLessonsAr: [
      'الأمانة المطلقة في القول والعمل والمسؤولية القيادية.',
      'الزهد الحقيقي في المناصب وزخارف الدنيا الفانية.',
      'التفاني مع الرعية والجنود ورفض النجاة الفردية وترك الأمة في الأزمات.',
      'التواضع مع كبار القادة والتعاون الخالص لوجه الله كما فعل مع خالد بن الوليد.'
    ],
    inspirationalLessonsEn: [
      'Absolute trustworthiness in words, actions, and executive leadership.',
      'Total spiritual detachment from political rank and worldly luxury.',
      'Standing shoulder to shoulder with the people during collective calamities.',
      'Humble teamwork prioritizing God\'s pleasure above personal credit, as exemplified with Khalid.'
    ]
  }
];

export const TEN_PROMISED_UI_TEXTS = {
  ar: {
    pageTitle: 'العشرة المبشرون',
    pageSubtitle: 'أكابر صحابة رسول الله ﷺ الذين جمعهم حديث نبوي شريف في البشارة بالجنة',
    hadithBannerTitle: 'حديث البشارة بالجنة الشريف',
    searchPlaceholder: 'ابحث عن اسم صحابي، لقبه، كنيته، أو موقفه...',
    clearSearch: 'مسح البحث',
    orderPrefix: 'الترتيب في الحديث الشريف:',
    viewDetails: 'تصفح السيرة العطرة',
    tabProfile: 'بطاقة التعريف',
    tabStances: 'مواقف وبطولات',
    tabTraits: 'شمائله وأسرته',
    tabSayings: 'حكم وأقوال',
    tabPreIslam: 'قبل الإسلام',
    tabConversion: 'إسلامه وجهاده',
    tabVirtues: 'الفضائل والبشارة',
    tabLegacy: 'الخلافة والآثار',
    tabLessons: 'دروس وعِبر',
    filterAll: 'الكل (١٠)',
    filterCaliphs: 'الخلفاء الراشدون',
    filterEarly: 'السابقون الأولون',
    filterCommanders: 'قادة الفتوحات',
    stancesCount: 'موقف بطولي موثق',
    categoryLabel: 'المجال والعِبرة:',
    periodLabel: 'الفترة التاريخية:',
    impactLabel: 'الأثر والعِبرة الخالدة:',
    physicalAppearanceLabel: 'الصفة الخَلقية والملامح الشريفة:',
    worshipLabel: 'العبادة والزهد وقيام الليل:',
    familyLabel: 'الأسرة والزوجات والمصاهرات:',
    specialSkillsLabel: 'السمات والملكات الاستثنائية:',
    quotesWisdomLabel: 'روائع الكلم والحِكم المأثورة:',
    wisdomContextLabel: 'مناسبة القول وسياقه:',
    zoom: 'تكبير النص',
    copyText: 'نسخ النص',
    copyBiography: 'نسخ السيرة كاملة',
    shareImage: 'مشاركة كصورة',
    toastCopiedText: 'تم نسخ النص بنجاح',
    toastCopiedBio: 'تم نسخ السيرة العطرة كاملة',
    toastCopyFailed: 'تعذر النسخ',
    toastShareFailed: 'تعذر مشاركة الصورة',
    nextCompanion: 'الصحابي التالي',
    prevCompanion: 'الصحابي السابق',
    backToList: 'العودة لقائمة العشرة',
    goBack: 'رجوع',
    home: 'الرئيسية',
    guideTooltip: 'دليل الصفحة',
    close: 'إغلاق',
    noResults: 'لا توجد نتائج مطابقة لبحثك',
    quoteTitle: 'كلمة خالدة',
    fullNameLabel: 'الاسم الكامل والنسب:',
    kunyaLabel: 'الكنية واللقب:',
    birthLabel: 'المولد والنشأة:',
    deathLabel: 'الوفاة والاستشهاد:',
    burialLabel: 'مكان الدفن والضريح:',
    kinshipLabel: 'الصلة برسول الله ﷺ:',
    hadithProofLabel: 'نص حديث البشارة:',
    majorBattlesLabel: 'أبرز الغزوات والمواقف التاريخية:',
    majorAchievementsLabel: 'أبرز المآثر والإنجازات الكبرى:',
    hadithsAndQuotesLabel: 'أحاديث نبوية شريفة في فضله ومناقبه:',
    titlesAndHonorsLabel: 'ألقابه ومقاماته الشريفة:',
    testimoniesLabel: 'شهادات الصحابة والتابعين فيه:',
    lastWordsLabel: 'وصيته وكلماته الأخيرة:',
    detailsAndLessons: 'تفاصيل السيرة والدروس',
    companionsCount: '١٠ صحابة كرام'
  },
  en: {
    pageTitle: 'The Ten Promised',
    pageSubtitle: 'The eminent companions honored by the Prophet ﷺ with the glad tidings of Paradise in a single hadith',
    hadithBannerTitle: 'The Authentic Hadith of Glad Tidings',
    searchPlaceholder: 'Search companion name, title, kunya, or milestone...',
    clearSearch: 'Clear search',
    orderPrefix: 'Order in the Noble Hadith:',
    viewDetails: 'Explore Biography',
    tabProfile: 'Profile Card',
    tabStances: 'Heroic Stances',
    tabTraits: 'Traits & Family',
    tabSayings: 'Wisdom & Quotes',
    tabPreIslam: 'Before Islam',
    tabConversion: 'Islam & Jihad',
    tabVirtues: 'Virtues & Merits',
    tabLegacy: 'Legacy & Era',
    tabLessons: 'Faith Lessons',
    filterAll: 'All (10)',
    filterCaliphs: 'The 4 Caliphs',
    filterEarly: 'Early Converts',
    filterCommanders: 'Great Commanders',
    stancesCount: 'Heroic Stances',
    categoryLabel: 'Category:',
    periodLabel: 'Historical Period:',
    impactLabel: 'Enduring Impact & Lesson:',
    physicalAppearanceLabel: 'Physical Appearance & Demeanor:',
    worshipLabel: 'Worship, Piety & Devotion:',
    familyLabel: 'Family, Wives & Lineage:',
    specialSkillsLabel: 'Attributes & Special Talents:',
    quotesWisdomLabel: 'Enduring Sayings & Maxims:',
    wisdomContextLabel: 'Context & Historical Occasion:',
    zoom: 'Enlarge Text',
    copyText: 'Copy Text',
    copyBiography: 'Copy Full Biography',
    shareImage: 'Share as Image',
    toastCopiedText: 'Text copied successfully',
    toastCopiedBio: 'Full biography copied successfully',
    toastCopyFailed: 'Failed to copy',
    toastShareFailed: 'Failed to share image',
    nextCompanion: 'Next Companion',
    prevCompanion: 'Previous Companion',
    backToList: 'Back to the Ten',
    goBack: 'Back',
    home: 'Home',
    guideTooltip: 'Page Guide',
    close: 'Close',
    noResults: 'No matching results found',
    quoteTitle: 'Immortal Quote',
    fullNameLabel: 'Full Name & Lineage:',
    kunyaLabel: 'Kunya & Titles:',
    birthLabel: 'Birth & Upbringing:',
    deathLabel: 'Demise & Martyrdom:',
    burialLabel: 'Resting Place:',
    kinshipLabel: 'Kinship to the Prophet ﷺ:',
    hadithProofLabel: 'Hadith of Glad Tidings:',
    majorBattlesLabel: 'Key Battles & Historical Milestones:',
    majorAchievementsLabel: 'Major Enduring Achievements:',
    hadithsAndQuotesLabel: 'Prophetic Hadiths on His Virtues:',
    titlesAndHonorsLabel: 'Titles & Distinctive Honors:',
    testimoniesLabel: 'Testimonies of the Companions:',
    lastWordsLabel: 'Last Words & Final Will:',
    detailsAndLessons: 'Details & Lessons',
    companionsCount: '10 Noble Companions'
  }
};
