export interface GeographicalStation {
  placeAr: string;
  placeEn: string;
  periodAr: string;
  periodEn: string;
  detailsAr: string;
  detailsEn: string;
}

export interface QuranicVerseContext {
  verseAr: string;
  verseEn: string;
  surahAr: string;
  surahEn: string;
  contextAr: string;
  contextEn: string;
}

export interface TestimonyItem {
  speakerAr: string;
  speakerEn: string;
  quoteAr: string;
  quoteEn: string;
}

export interface CompanionExtraSections {
  companionId: string;
  
  // Tab: Profile
  lineageDetailsAr: string;
  lineageDetailsEn: string;
  geographicalStations: GeographicalStation[];

  // Tab: Traits & Devotion
  dailyRoutineAr: string;
  dailyRoutineEn: string;
  uniqueDistinctionsAr: string[];
  uniqueDistinctionsEn: string[];

  // Tab: Pre-Islam
  idolatryStanceAr: string;
  idolatryStanceEn: string;
  wisdomAndPreIslamRoleAr: string;
  wisdomAndPreIslamRoleEn: string;

  // Tab: Conversion & Jihad
  hijrahAndBrotherhoodAr: string;
  hijrahAndBrotherhoodEn: string;
  prophetSacrificeAr: string;
  prophetSacrificeEn: string;

  // Tab: Virtues & Merits
  quranicVerses: QuranicVerseContext[];
  extraTestimonies: TestimonyItem[];

  // Tab: Legacy & Era
  civilizationalImpactAr: string[];
  civilizationalImpactEn: string[];
  eternalAdviceAr: string;
  eternalAdviceEn: string;

  // Tab: Lessons
  spiritualLessonsAr: string[];
  spiritualLessonsEn: string[];
  leadershipLessonsAr: string[];
  leadershipLessonsEn: string[];
  modernApplicationAr: string[];
  modernApplicationEn: string[];
}

export const COMPANIONS_EXTRA_DATA: Record<string, CompanionExtraSections> = {
  // 1. أبو بكر الصديق
  'abu-bakr': {
    companionId: 'abu-bakr',
    lineageDetailsAr: 'عبد الله بن عثمان بن عامر بن عمرو بن كعب بن سعد بن تيم بن مرة بن كعب بن لؤي القرشي التيمي، يلتقي مع النبي ﷺ في الجد السادس (مرة بن كعب)، وكانت أمه سلمى بنت صخر (أم الخير) قد أسلمت بمكة، وأبوه أبو قحافة أسلم يوم فتح مكة، فكان بيته بيت صدق وإيمان اجتمع فيه إسلام أربعة أجيال متتالية.',
    lineageDetailsEn: 'Abdullah ibn Uthman ibn Amir from Banu Taym of Quraysh. His lineage merges with the Prophet ﷺ at Murrah ibn Ka\'b. His mother Umm Al-Khayr accepted Islam early in Makkah and his father Abu Quhafah accepted on the Day of Conquest, creating an unprecedented household where four consecutive generations embraced Islam.',
    geographicalStations: [
      {
        placeAr: 'مكة المكرمة',
        placeEn: 'Makkah Al-Mukarramah',
        periodAr: 'المولد والنشأة حتى 1 هـ',
        periodEn: 'Birth until 1 AH',
        detailsAr: 'نشأ رئيساً في قريش مؤتمناً على الديات، وكان أول من آمن من الرجال، وأنفق ثروته في عتق المعذبين بمكة.',
        detailsEn: 'Raised as an esteemed chieftain trusted with blood-money arbitration; became the first free man to accept Islam, funding slave emancipations.'
      },
      {
        placeAr: 'غار ثور (طريق الهجرة)',
        placeEn: 'Cave of Thawr',
        periodAr: 'العام 1 هـ',
        periodEn: '1 AH',
        detailsAr: 'المحطة الخالدة التي قضى فيها ثلاث ليالٍ رفيقاً وحارساً لرسول الله ﷺ وتنزلت فيها السكينة الإلهية.',
        detailsEn: 'Immortal station where he sheltered with the Prophet ﷺ for three nights during the Hijrah, immortalized in the Quran.'
      },
      {
        placeAr: 'المدينة المنورة',
        placeEn: 'Al-Madinah Al-Munawwarah',
        periodAr: '1 هـ - 13 هـ',
        periodEn: '1 AH - 13 AH',
        detailsAr: 'بنى دولة الإسلام إلى جوار النبي ﷺ، وتولى الخلافة الراشدة، وقاد حروب الردة وجمع القرآن، ودُفن بجوار النبي ﷺ.',
        detailsEn: 'Co-founded the Islamic state, led the First Caliphate, triumphed in the Riddah wars, compiled the Quran, and was buried beside the Prophet ﷺ.'
      }
    ],
    dailyRoutineAr: 'كان يبدأ يومه بركعتي الفجر إماماً أو مقتدياً، فإذا انقضت الصلاة تفقد عوالي المدينة وأراملها؛ فكان يذهب إلى عجوز عمياء في أطراف المدينة يكنس بيتها ويعجن خبزها ويحلب شياتها دون أن تعرف من هو! ثم يجلس في المسجد يقضي بين الناس بحكم الله، ويقضي نهاره صائماً متبتلاً ويفطر على تمرات وماء، ويحيي ليله باكياً مترنماً بالقرآن.',
    dailyRoutineEn: 'He began his day at dawn prayer, then routinely visited a blind destitute elderly woman on the outskirts of Madinah to sweep her tent, knead her dough, and milk her goats anonymously. By midday he judged among people with divine equity, fasted regularly, and spent entire nights in tearful Quranic vigils.',
    uniqueDistinctionsAr: [
      'الصحابي الوحيد الذي خُلّد في القرآن الكريم بصفة الصاحب المعين: ﴿إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا﴾.',
      'الرجل الوحيد في تاريخ الأمة الذي يُدعى من أبواب الجنة الثمانية جميعها في آنٍ واحد.',
      'أول من أسلم من الرجال الأحرار، وأول من جمع المصحف الشريف بين دفتين.',
      'أمضى النبي ﷺ صلاته مقتدياً به، واستخلفه في إمامة المسلمين أثناء مرضه الشريف.'
    ],
    uniqueDistinctionsEn: [
      'The only companion specifically given the Quranic title of "Companion": "When he said to his companion: Do not grieve, Allah is with us."',
      'The only individual promised to be called from all eight gates of Paradise simultaneously.',
      'First adult free man to embrace Islam, and pioneer of the comprehensive Quranic compilation.',
      'Designated by the Prophet ﷺ to lead the congregational prayers during the Prophet\'s final illness.'
    ],
    idolatryStanceAr: 'لم يسجد لصنم قط طوال الجاهلية؛ قال رضي الله عنه: "لما ناهزتُ الحلم أخذني أبي أبو قحافة بيدي إلى مخدع فيه الأصنام فقال: هذه آلهتك فاسجد لها! فدنوتُ من صنم فقلت: إني جائع فأطعمني فلم يجب! قلت: إني عارٍ فاكسني فلم يجب! فتناولت صخرة فرميته بها فخرّ لوجهه، فما عدت إليها أبداً".',
    idolatryStanceEn: 'He never bowed to an idol during the Jahiliyyah. He recalled that in his youth his father took him to a chamber of idols commanding him to prostrate. Abu Bakr approached an idol saying: "I am hungry, feed me!" and receiving no answer, he cast a stone at it and never looked at an idol again.',
    wisdomAndPreIslamRoleAr: 'كان صاحب "الأشناق" في قريش وهو التحكيم المالي في الديات وفدية الدماء؛ فكان إذا ضمن دماً أو ديّة سارع بطون قريش للإقرار به ورضوا بحكمه فوراً، وكان أوسع العرب علماً بأنساب القبائل وأيام مفاخرها ومثالبها دون أن يطعن في أحد.',
    wisdomAndPreIslamRoleEn: 'Entrusted with the judicial portfolio of blood-money and indemnities in Quraysh. His integrity was so absolute that all clans accepted his financial rulings without objection, and he was the premier genealogist of Arabia.',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بينه وبين خارجة بن زيد الأنصاري الخزرجي، وضرب الصديق في الهجرة مثلاً لا نظير له؛ فكان يمشي تارة أمام النبي وتارة خلفه وتارة عن يمينه وتارة عن شماله، فسأله النبي عن ذلك فقال: "يا رسول الله، أذكر الرصد فأمشي أمامك، وأذكر الطلب فأمشي خلفك، وأذكر الكمين فأمشي عن يمينك وشمالك، فوالله لو متُّ أنا لمتُّ وحدي، ولو قُتلتَ أنت لهلكت الأمة!".',
    hijrahAndBrotherhoodEn: 'Fraternized by the Prophet with Kharijah ibn Zayd. During the Hijrah trek, he constantly shifted positions walking in front, behind, right, and left of the Prophet. Asked why, he said: "When I fear ambush, I walk ahead; when I fear pursuit, I fall behind! If I die, I am just one man; if you die, the Ummah dies!"',
    prophetSacrificeAr: 'حين قام عقبة بن أبي معيط وخنق النبي ﷺ بردائه عند الكعبة وهو يصلي، ركض أبو بكر ودفعه عن النبي باكياً وهو يصيح: "أتقتلون رجلاً أن يقول ربي الله وقد جاءكم بالبينات من ربكم؟!"، فتركوا النبي وأقبلوا على أبي بكر يضربونه بالنعال حتى توارى وجهه ورمى به بنو تيم ظانين أنه قد فارق الحياة.',
    prophetSacrificeEn: 'When Uqbah ibn Abi Mu\'ayt attempted to strangle the Prophet with his mantle at the Ka\'bah, Abu Bakr charged in, shoving the aggressor away and crying: "Do you kill a man merely because he says my Lord is Allah and has brought you clear signs?!" They turned on Abu Bakr, beating him senseless.',
    quranicVerses: [
      {
        verseAr: '﴿إِلَّا تَنصُرُوهُ فَقَدْ نَصَرَهُ اللَّهُ إِذْ أَخْرَجَهُ الَّذِينَ كَفَرُوا ثَانِيَ اثْنَيْنِ إِذْ هُمَا فِي الْغَارِ إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا﴾',
        verseEn: '"If you do not aid him, Allah has already aided him when those who disbelieved had driven him out as the second of two, when they were in the cave and he said to his companion, \'Do not grieve; indeed Allah is with us.\'"',
        surahAr: 'سورة التوبة: 40',
        surahEn: 'Surah At-Tawbah: 40',
        contextAr: 'شهادة ربانية صريحة لا تحتمل تأويلاً بصحبته ومعية الله الخاصة له وللنبي ﷺ في أحرج لحظات الهجرة.',
        contextEn: 'Divine Quranic testimony affirming his singular companionship and shared divine accompaniment in the Cave.'
      },
      {
        verseAr: '﴿وَسَيُجَنَّبُهَا الْأَتْقَى * الَّذِي يُؤْتِي مَالَهُ يَتَزَكَّى * وَمَا لِأَحَدٍ عِندَهُ مِن نِّعْمَةٍ تُجْزَى * إِلَّا ابْتِغَاءَ وَجْهِ رَبِّهِ الْأَعْلَى * وَلَسَوْفَ يَرْضَى﴾',
        verseEn: '"And the righteous will be spared it - who gives his wealth to purify himself, and not in return for any favor received, but only seeking the countenance of his Lord, Most High. And he will surely be satisfied."',
        surahAr: 'سورة الليل: 17-21',
        surahEn: 'Surah Al-Layl: 17-21',
        contextAr: 'أجمع المفسرون على نزولها في أبي بكر الصديق لما أنفق أمواله في عتق بلال والمستضعفين لوجه الله تعالى.',
        contextEn: 'Consensus of classical exegetes confirms this was revealed concerning Abu Bakr purchasing and freeing tortured slaves.'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'عمر بن الخطاب رضي الله عنه',
        speakerEn: 'Umar ibn Al-Khattab',
        quoteAr: '«أبو بكر سيدنا، وأعتق سيدنا (يعني بلال بن رباح)». وقال: «والله لوددت أني شعرة في صدر أبي بكر».',
        quoteEn: '"Abu Bakr is our master, and he emancipated our master (Bilal)." He also said: "By Allah, I wish I were a single hair on the chest of Abu Bakr."'
      },
      {
        speakerAr: 'علي بن أبي طالب رضي الله عنه',
        speakerEn: 'Ali ibn Abi Talib',
        quoteAr: '«والذي نفسي بيده، ما استبقنا إلى خير قط إلا كان أبو بكر أسبقنا إليه، وهو خير الناس بعد رسول الله ﷺ».',
        quoteEn: '"By Him in whose hand is my soul, never did we compete in any virtue except that Abu Bakr surpassed us to it; he is the best of mankind after the Prophet ﷺ."'
      }
    ],
    civilizationalImpactAr: [
      'تثبيت أركان الدولة الإسلامية وإخماد فتنة الردة وحفظ فريضة الزكاة كركن مالي وسياسي.',
      'جمع المصحف الشريف في ديوان موحد بإشراف كبار حفظة الصحابة حفظاً للنص القرآني.',
      'بدء الفتوحات الإسلامية الكبرى في العراق والشام وكسر هيبة الإمبراطوريتين الفارسية والبيزنطية.',
      'تأسيس مبدأ المحاسبة والشفافية في الحكم: "إن أحسنتُ فأعينوني، وإن أسأتُ فقوّموني".'
    ],
    civilizationalImpactEn: [
      'Preserving the state and institutionalizing Zakat as a pillar of communal welfare during the Riddah crisis.',
      'Commissioning the first authorized codification of the Holy Quran under Zayd ibn Thabit.',
      'Launching the Levant and Mesopotamian liberation campaigns against Byzantine and Sasanian tyranny.',
      'Founding democratic accountability in Muslim statecraft: "If I act rightly, assist me; if I err, correct me."'
    ],
    eternalAdviceAr: '«إن الله يرى من باطنك ما يرى من ظاهرك، فاجعل سريرتك خيراً من علانيتك، واعلم أن مع كل عمل أجلاً، فبادر الآجال بصالح الأعمال قبل انقطاع الأمل».',
    eternalAdviceEn: '"Indeed Allah witnesses your inward self just as He sees your outward. Ensure your inner soul is more beautiful than your public display, and rush forward with noble deeds before appointed lifespans end."',
    spiritualLessonsAr: [
      'اليقين التام والتصديق القلبي الذي لا يخالطه شك في وعد الله ورسوله.',
      'الإنفاق التام والزهد في حطام الدنيا لابتغاء ما عند الله من النعيم المقيم.',
      'الصبر والسكينة عند نزول النوازل الكبرى وثبات الأقدام في ساعات الفزع.'
    ],
    spiritualLessonsEn: [
      'Unwavering certainty and unshakeable conviction in divine promises.',
      'Complete altruism, gladly giving away worldly treasure for eternal spiritual reward.',
      'Sublime composure and reassurance during epochal calamities.'
    ],
    leadershipLessonsAr: [
      'الحزم في مواطن الحزم واللين في مواطن الرحمة دون إفراط أو تفريط.',
      'الشورى مع أهل العلم والخبرة وتقديم الصالح العام على أهواء النفوس.',
      'التواضع الشخصي الشديد مع الهيبة القيادية والقدرة على إدارة أخطر الأزمات.'
    ],
    leadershipLessonsEn: [
      'Decisive resolve in defense of principles paired with profound empathy for the vulnerable.',
      'Rigorous consultation with wise counselors, placing public welfare above all pride.',
      'Incomparable personal humility matched with authoritative command in crisis.'
    ],
    modernApplicationAr: [
      'تحري الصدق المطلق في القول والعمل والوفاء بالعهود في المعاملات اليومية.',
      'المبادرة إلى دعم المحتاجين وكفالة الأيتام والتعفف عن استغلال المناصب.',
      'التثبت من الشائعات ونصرة الحق والدفاع عن القيم والمبادئ النبيلة.'
    ],
    modernApplicationEn: [
      'Practicing absolute transparency and integrity in daily vocational and personal affairs.',
      'Proactively initiating relief for the destitute and refusing to exploit positions for vanity.',
      'Resolutely upholding moral principles in the face of widespread cultural cynicism.'
    ]
  },

  // 2. عمر بن الخطاب
  'umar-ibn-khattab': {
    companionId: 'umar-ibn-khattab',
    lineageDetailsAr: 'عمر بن الخطاب بن نفيل بن عبد العزى بن رياح بن عبد الله بن قرط بن رزاح بن عدي بن كعب القرشي العدوي، يلتقي مع النبي ﷺ في جده الثامن كعب بن لؤي، وتلتقي معه بنو عدي التي كانت إليها السفارة في الجاهلية، وأمه حنتمة بنت هشام بن المغيرة المخزومية أخت أبي جهل.',
    lineageDetailsEn: 'Umar ibn Al-Khattab from Banu Adiy of Quraysh, meeting the Prophet\'s lineage at Ka\'b ibn Lu\'ayy. His clan held the ancestral embassy and diplomacy portfolio in pre-Islamic Arabia. His mother was Hantamah bint Hisham of Banu Makhzum.',
    geographicalStations: [
      {
        placeAr: 'مكة المكرمة',
        placeEn: 'Makkah Al-Mukarramah',
        periodAr: 'المولد والنشأة حتى 1 هـ',
        periodEn: 'Birth until 1 AH',
        detailsAr: 'نشأ سفيراً لقريش وبطلاً من فرسانها، ثم شرح الله صدره للإسلام فكان إسلامه فتحاً ومهاجراً علانية بتحدٍ.',
        detailsEn: 'Served as Quraysh\'s chief ambassador and equestrian champion; his conversion revolutionized Islam, followed by open migration.'
      },
      {
        placeAr: 'المدينة المنورة',
        placeEn: 'Al-Madinah Al-Munawwarah',
        periodAr: '1 هـ - 23 هـ',
        periodEn: '1 AH - 23 AH',
        detailsAr: 'وزير النبي الأقرب ومستشار الصديق، ثم بويع بالخلافة فبنى أركان الإدارة الإسلامية واستشهد في محرابها.',
        detailsEn: 'Chief vizier to the Prophet and Abu Bakr; assumed the Caliphate, established civil governance, and was martyred in prayer.'
      },
      {
        placeAr: 'القدس الشريف (بيت المقدس)',
        placeEn: 'Jerusalem (Bayt Al-Maqdis)',
        periodAr: '15 هـ',
        periodEn: '15 AH',
        detailsAr: 'استلم مفاتيح بيت المقدس شخصياً بثوبه المرقع، وكتب العهدة العمرية الخالدة التي أرست حرية العبادة.',
        detailsEn: 'Received the keys of Jerusalem in a patched robe, issuing the historic Covenant of Umar safeguarding Christian holy sites.'
      }
    ],
    dailyRoutineAr: 'كان يصلي الصبح إماماً بالمسلمين بالسور الطوال كـ "يوسف" و"النحل" ويبكي حتى يُسمع نشيجه من خلف الصفوف، ثم يجلس لمتابعة بريد الولايات والجيوش، فإذا انتصف النهار أخذ درته ودار في أسواق المدينة يتفقد الأسعار ويكيل المكاييل، ويقيل تحت شجرة في العراء متوسداً نعليه، فإذا جن الليل خرج يعسّ يحمل جراب الدقيق على كتفه للمحتاجين ويوقظ الناس لقيام الليل.',
    dailyRoutineEn: 'Led dawn prayer weeping audibly through long surahs, attended state correspondence and provincial justice by noon, inspected market weights with his staff, napped unshielded beneath an open tree using his sandals as a pillow, and walked nocturnal patrols carrying flour sacks on his back for hungry orphans.',
    uniqueDistinctionsAr: [
      'أول من لُقب بـ "أمير المؤمنين" في تاريخ الإسلام إجماعاً من الصحابة.',
      'أول من وضع التاريخ الهجري تقويماً رسمياً للمسلمين بدءاً من هجرة النبي ﷺ.',
      'أول من دوّن الدواوين، وأنشأ نظام البريد، وعسّ بالليل، ومصّر الأمصار (كالبصرة والكوفة والفسطاط).',
      'الملهم المحدّث الذي وافقه القرآن الكريم في أكثر من عشرة مواضع تشريعية وتاريخية.'
    ],
    uniqueDistinctionsEn: [
      'First leader titled "Commander of the Faithful" (Amir Al-Mu\'minin) by unanimous consensus.',
      'Instituted the Hijri lunar calendar as the official Islamic epoch beginning from the Hijrah.',
      'Pioneered ministries (Diwans), public treasuries, municipal postal networks, and new garrison cities (Basra, Kufa, Fustat).',
      'The "Inspired" (Muhaddath) whose intuitive legal insights were explicitly affirmed by divine Quranic revelations in over ten instances.'
    ],
    idolatryStanceAr: 'كان شديد الاعتزاز بالمروءة، وحين سُئل عن عبادته للأصنام في الجاهلية تذكّر كيف كان بعض العرب يصنعون أصنامهم من التمر فإذا جاعوا أكلوها، فكان يضحك من ضلال العقول ويبكي شكراً لله الذي أنقذه بنور الوحي والتوحيد.',
    idolatryStanceEn: 'He possessed natural dignity; reflecting on pre-Islamic paganism, he would marvel at how tribes fashioned idols from pressed dates and consumed them when starved, laughing at the folly of idolatry and weeping in gratitude for divine guidance.',
    wisdomAndPreIslamRoleAr: 'توارث السفارة والمناظرة في قريش؛ فإذا وقعت خصومة بين بطون قريش أو بين قريش والقبائل الأخرى أوفدوا عمراً لرجاحة حيلته وبلاغة حجته وهيبته، مما صقل فكره السياسي قبل الإسلام.',
    wisdomAndPreIslamRoleEn: 'Hereditary ambassador and diplomat for Quraysh, dispatched to resolve inter-tribal disputes with razor-sharp rhetorical eloquence and intimidating personal charisma.',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بينه وبين عتبان بن مالك الأنصاري في المدينة، وكانا يتناوبان النزول على رسول الله ﷺ؛ فينزل عمر يوماً فيأتيه بخبر الوحي والأمر، وينزل عتبان يوماً فيفعل مثل ذلك، في ترسيخ باهر لطلب العلم المقرون بالعمل.',
    hijrahAndBrotherhoodEn: 'Fraternized with Utban ibn Malik in Madinah. They alternated daily visits to the Prophet ﷺ: one day Umar attended to gather revelation and state matters, and the next day Utban attended, modeling educational teamwork.',
    prophetSacrificeAr: 'كان درع النبي ﷺ الصامد؛ يوم أحد لما نادى أبو سفيان: "أفيكم محمد؟ أفيكم ابن أبي قحافة؟ أفيكم ابن الخطاب؟" وأمر النبي بالسكوت، لم يطق عمر صبراً لما قال أبو سفيان "اعلُ هُبَل"، فصرخ عمر: "الله أعلى وأجل! لا سواء، قتلانا في الجنة وقتلاكم في النار!".',
    prophetSacrificeEn: 'Stood as an unyielding defensive bastion; at Uhud when Abu Sufyan called asking if Muhammad, Abu Bakr, and Umar survived, Umar could not contain his zeal when pagan slogans were chanted, bellowing: "Allah is Most High and Supreme! Our martyrs are in Paradise and your dead are in Hell!"',
    quranicVerses: [
      {
        verseAr: '﴿وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى﴾',
        verseEn: '"And take the station of Abraham as a place of prayer."',
        surahAr: 'سورة البقرة: 125',
        surahEn: 'Surah Al-Baqarah: 125',
        contextAr: 'من موافقات عمر الشهيرة؛ حيث قال للنبي ﷺ: "يا رسول الله، لو اتخذنا من مقام إبراهيم مصلى؟" فنزل القرآن باللفظ ذاته.',
        contextEn: 'Famous confirmation of Umar\'s insight; he suggested to the Prophet taking Maqam Ibrahim for prayer, and the verse descended verbatim.'
      },
      {
        verseAr: '﴿يَا أَيُّهَا النَّبِيُّ قُل لِّأَزْوَاجِكَ وَبَنَاتِكَ وَنِسَاءِ الْمُؤْمِنِينَ يُدْنِينَ عَلَيْهِنَّ مِن جَلَابِيبِهِنَّ﴾',
        verseEn: '"O Prophet, tell your wives and your daughters and the women of the believers to bring down over themselves of their outer garments."',
        surahAr: 'سورة الأحزاب: 59',
        surahEn: 'Surah Al-Ahzab: 59',
        contextAr: 'اقترح عمر احتجاب أمهات المؤمنين صوناً لهن ونزاهة لبيوتهن فنزل الوحي بالحجاب موافقاً لرأيه.',
        contextEn: 'Umar proposed modesty garments for the Mothers of the Believers to honor their sanctity, affirmed directly by revelation.'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'رسول الله ﷺ',
        speakerEn: 'Prophet Muhammad ﷺ',
        quoteAr: '«إِنَّ اللَّهَ جَعَلَ الحَقَّ عَلَى لِسَانِ عُمَرَ وَقَلْبِهِ»، وقال: «مَا لَقِيَكَ الشَّيْطَانُ سَالِكًا فَجًّا إِلَّا سَلَكَ فَجًّا غَيْرَ فَجِّكَ».',
        quoteEn: '"Indeed Allah has placed the truth upon the tongue and heart of Umar," and "Never does Satan encounter you taking a path except that he flees to another path."'
      },
      {
        speakerAr: 'ابن عباس رضي الله عنهما',
        speakerEn: 'Ibn Abbas',
        quoteAr: '«كان عمر بن الخطاب كالطير الحذر يحسب أن كل صيحة عليه، وكان إذا ذُكر الله عنده خرّ ساجداً وبكى».',
        quoteEn: '"Umar was like a vigilant bird acutely wary of divine accountability; whenever Allah was mentioned in his presence, he fell prostrate in tears."'
      }
    ],
    civilizationalImpactAr: [
      'تأسيس منظومة القضاء المستقل وإرسال القضاة للأقاليم وتدوين رسالة القضاء الشهيرة لأبي موسى الأشعري.',
      'إنشاء بيت مال المسلمين وصرف رواتب دورية للأيتام والشيوخ حتى من أهل الذمة من غير المسلمين.',
      'تحرير القدس والشام ومصر وبلاد فارس من الاستبداد الإمبراطوري وإرساء التسامح الديني.',
      'إلغاء التمايز الطبقي بين الحكام والمحكومين ومحاسبة الولاة سنوياً في موسم الحج.'
    ],
    civilizationalImpactEn: [
      'Established an independent judiciary, sending specialized judges and penning the foundational Charter of Jurisprudence.',
      'Instituted state welfare stipends for orphans, the elderly, and non-Muslim protected citizens (Ahl Adh-Dhimmah).',
      'Liberated Jerusalem, the Levant, Egypt, and Persia, enshrining unprecedented religious liberties.',
      'Abolished elitism, convening mandatory annual public audits of all governors during Hajj season.'
    ],
    eternalAdviceAr: '«حاسبوا أنفسكم قبل أن تُحاسبوا، وتزينوا للعرض الأكبر، يومئذ تُعرضون لا تخفى منكم خافية. واعلموا أن العدل أساس الملك، ومخافة الله رأس الحكمة».',
    eternalAdviceEn: '"Reckon your souls before you are called to reckoning, and prepare for the Grand Presentation when not a single hidden deed remains concealed. Justice is the foundation of sovereignty, and the fear of Allah is the zenith of wisdom."',
    spiritualLessonsAr: [
      'الخشية التامة من الله واستشعار المراقبة الإلهية في السر والعلن.',
      'الزهد في زينة الحكم وملذات الدنيا والتواضع التام بين الرعية.',
      'الرجوع إلى الحق فور سماعه دون مكابرة حتى لو جاء الحق على لسان امرأة أو طفل.'
    ],
    spiritualLessonsEn: [
      'Profound God-consciousness (Taqwa) and sensing the divine gaze in private and public.',
      'Radical detachment from regal vanity, living in simplicity amidst imperial triumphs.',
      'Instant submission to truth without pride, even when corrected by an ordinary woman or child.'
    ],
    leadershipLessonsAr: [
      'المسؤولية المباشرة للحاكم عن كل رعيته حتى الحيوان العاثر في أقصى الأرض.',
      'الجرأة في التطوير المؤسسي وسن القوانين التنظيمية لمصلحة الأمة.',
      'الفصل التام بين المصلحة الشخصية والمال العام وحماية حقوق المستضعفين.'
    ],
    leadershipLessonsEn: [
      'Total presidential accountability down to an injured pack animal across the borders.',
      'Visionary institutional innovation and administrative legislation for the public good.',
      'Strict firewalls separating personal assets from state revenue, defending the disenfranchised.'
    ],
    modernApplicationAr: [
      'غرس الشجاعة الأدبية في قول كلمة الحق والإصلاح دون خوف أو محاباة.',
      'احترام المال العام ورفض كل أشكال الفساد والرشوة والمحسوبية.',
      'إقامة العدل والمساواة في بيئات العمل والأسرة وتجنب الظلم بكافة صوره.'
    ],
    modernApplicationEn: [
      'Cultivating civic courage to champion reform and speak truth to power with integrity.',
      'Guarding public resources and categorically eliminating corruption, bribery, and nepotism.',
      'Enforcing strict fairness and equality in workplaces, governance, and familial life.'
    ]
  },

  // 3. عثمان بن عفان
  'uthman-ibn-affan': {
    companionId: 'uthman-ibn-affan',
    lineageDetailsAr: 'عثمان بن عفان بن أبي العاص بن أمية بن عبد شمس بن عبد مناف القرشي الأموي، يلتقي مع النبي ﷺ في جده الخامس عبد مناف، وأمه أروى بنت كريز وأمها البيضاء بنت عبد المطلب عمة رسول الله ﷺ فكان ابن عمة النبي من جهة أمه، وصهر النبي ﷺ مرتين.',
    lineageDetailsEn: 'Uthman ibn Affan of Banu Umayyah, meeting the Prophet\'s lineage at Abd Manaf. His maternal grandmother was Al-Bayda bint Abd Al-Muttalib (the Prophet\'s paternal aunt), making him cousin of the Prophet ﷺ as well as twice his son-in-law.',
    geographicalStations: [
      {
        placeAr: 'مكة المكرمة',
        placeEn: 'Makkah Al-Mukarramah',
        periodAr: 'المولد حتى الهجرة إلى الحبشة',
        periodEn: 'Birth until Abyssinia',
        detailsAr: 'نشأ من أثرى فتيان قريش وأشرفهم خلقاً، وكان من السابقين الأولين فتعرض لتعذيب عمه الحكم بن أبي العاص.',
        detailsEn: 'Raised in wealth and nobility; was tortured by his uncle Al-Hakam for converting as an early pioneer.'
      },
      {
        placeAr: 'أرض الحبشة',
        placeEn: 'Abyssinia (Ethiopia)',
        periodAr: 'الهجرتان الأولى والثانية',
        periodEn: '1st & 2nd Migrations',
        detailsAr: 'أول من هاجر بأهله (رقية بنت رسول الله ﷺ) في سبيل الله بعد لوط وإبراهيم عليهما السلام.',
        detailsEn: 'First believer to migrate with his household (Ruqayyah, the Prophet\'s daughter) in faith since Lot and Abraham.'
      },
      {
        placeAr: 'المدينة المنورة',
        placeEn: 'Al-Madinah Al-Munawwarah',
        periodAr: '1 هـ - 35 هـ',
        periodEn: '1 AH - 35 AH',
        detailsAr: 'جهّز جيش العسرة، واشترى بئر رومة، ووسّع المسجد النبوي، وتولى الخلافة وجمع المصحف واستشهد في داره.',
        detailsEn: 'Funded Tabuk, bought the Ruma well, expanded the Prophet\'s Mosque, unified the Quran, and was martyred in Madinah.'
      }
    ],
    dailyRoutineAr: 'كان صوّاماً لا يفطر إلا نادراً، فإذا جنّ الليل قام في محرابه يصلي ويتلو القرآن حتى يختمه في ركعة واحدة بالوتر، وكان شديد الحياء يغتسل في البيت المغلق منحنياً من الحياء من ربه، وكان يُطعم الناس طعام الإمارة الفاخر ويذهب إلى بيته ليأكل الخل والزيت، ولا يوقظ خادماً بالليل بل يخدم نفسه بنفسه.',
    dailyRoutineEn: 'He fasted almost perpetually; at night he stood in prayer reciting the Quran often completing its entirety in a single Witr unit. He bathed veiled in modesty before Allah. He served banquets to citizens while eating vinegar and dry bread privately, refusing to wake servants at night.',
    uniqueDistinctionsAr: [
      'ذو النورين: الصحابي الوحيد في التاريخ البشري الذي جمع بين ابنتي نبي مرسل (رقية ثم أم كلثوم).',
      'تستحي منه ملائكة الرحمن بشهادة النبي ﷺ: «أَلَا أَسْتَحِي مِنْ رَجُلٍ تَسْتَحِي مِنْهُ المَلَائِكَةُ؟».',
      'جامع المصاحف وموحّد الأمة على القراءة الإمام التي يتلوها العالم الإسلامي إلى اليوم.',
      'أنشأ أول أسطول بحري إسلامي في التاريخ وفتح قبرص ومناطق واسعة في إفريقيا وآسيا.'
    ],
    uniqueDistinctionsEn: [
      'Possessor of Two Lights (Dhun-Nurayn): the only man in history to marry two daughters of a Prophet (Ruqayyah and Umm Kulthum).',
      'The angels themselves felt shyness before his angelic purity, certified by the Prophet ﷺ.',
      'Standardized the Holy Quran into codices sent across all continents, preserving identical recitation globally.',
      'Commissioned the first Muslim naval fleet, securing the Mediterranean and liberating Cyprus and North Africa.'
    ],
    idolatryStanceAr: 'قال عن جاهليته: "ما تغنيتُ ولا تمنيتُ، ولا مسستُ ذكري بيميني منذ بايعتُ بها رسول الله ﷺ، ولا شربتُ خمراً في جاهلية ولا في إسلام، ولا زنيتُ في جاهلية ولا في إسلام، ولا سجدتُ لوثن قط". فكان رمحاً في نقاء الفطرة وطهارة الشرف.',
    idolatryStanceEn: 'He declared of his early life: "I never sang vain poetry, nor touched my right hand to impurity since pledging allegiance to the Prophet ﷺ, nor drank wine, nor committed fornication, nor ever prostrated to an idol in Jahiliyyah or Islam."',
    wisdomAndPreIslamRoleAr: 'كان من ألمع رجال الأعمال في مكة؛ يتقن تجارة الأقمشة والعطور برأسمال ضخم ونزاهة بيضاء، فكان محبوباً في قريش حتى كانت النساء يرقصن أطفالهن ويقلن: "أحبك والرحمن.. حب قريش لعثمان!".',
    wisdomAndPreIslamRoleEn: 'One of Makkah\'s preeminent merchant princes, mastering ethical trade. He was so beloved across Quraysh that mothers sang lullabies to infants saying: "I love you by the Merciful, as Quraysh loves Uthman!"',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بينه وبين أوس بن ثابت الأنصاري في المدينة، وكان عثمان سند المهاجرين مالياً؛ فوفّر لهم المساكن والمياه العذبة حين اشترى بئر رومة وجعلها وقفاً مجانياً للجميع.',
    hijrahAndBrotherhoodEn: 'Fraternized with Aws ibn Thabit. Uthman served as the economic pillar for newly arrived migrants, providing lodging and securing the municipality\'s water by buying the Well of Ruma for public access.',
    prophetSacrificeAr: 'في صلح الحديبية بعثه النبي ﷺ سفيراً إلى قريش في مكة لعلمه بحبهم له، فحبسوه وشاع أنه قُتل، فدعا النبي ﷺ الصحابة إلى بيعة الرضوان تحت الشجرة، ثم وضع النبي يده اليمنى على اليسرى وقال: «هذه يد عثمان» فبايع عنه غائباً في أعظم تشريف نبوي.',
    prophetSacrificeEn: 'Dispatched as the Prophet\'s ambassador at Hudaybiyyah. When rumors spread of his murder, the Prophet called the Pledge of the Tree (Bay\'at Ar-Ridwan), placing his own blessed right hand over his left saying: "This is for Uthman," pledging on his behalf.',
    quranicVerses: [
      {
        verseAr: '﴿أَمَّنْ هُوَ قَانِتٌ آنَاءَ اللَّيْلِ سَاجِدًا وَقَائِمًا يَحْذَرُ الْآخِرَةَ وَيَرْجُو رَحْمَةَ رَبِّهِ﴾',
        verseEn: '"Is one who is devoutly obedient during periods of the night, prostrating and standing, fearing the Hereafter and hoping for the mercy of his Lord..."',
        surahAr: 'سورة الزمر: 9',
        surahEn: 'Surah Az-Zumar: 9',
        contextAr: 'قال ابن عباس رضي الله عنهما: "هو عثمان بن عفان رضي الله عنه، كان يحيي الليل كله في ركعة يختم فيها القرآن".',
        contextEn: 'Ibn Abbas stated this verse was revealed concerning Uthman who stood entire nights finishing the Quran in prayer.'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'أم المؤمنين عائشة رضي الله عنها',
        speakerEn: 'Mother of the Believers Aisha',
        quoteAr: '«كان عثمان والله أوصلهم للرحم، وأتقاهم للرب عز وجل، وأنفقهم لماله في طاعة الله ورسوله».',
        quoteEn: '"Uthman, by Allah, was the most devoted among them to family ties, the most God-fearing, and the most generous in spending for Allah and His Messenger."'
      },
      {
        speakerAr: 'علي بن أبي طالب رضي الله عنه',
        speakerEn: 'Ali ibn Abi Talib',
        quoteAr: '«عثمان رجل يدعى في الملأ الأعلى ذا النورين، وكان صهر رسول الله ﷺ على ابنتيه، وضمن له النبي الجنة على بلوى تصيبه».',
        quoteEn: '"Uthman is called Dhun-Nurayn in the Heavenly host; twice son-in-law to the Prophet who guaranteed him Paradise during testing tribulations."'
      }
    ],
    civilizationalImpactAr: [
      'جمع المصحف العثماني الإمام وتوزيعه على الأمصار لمنع تحريف القراءات إلى قيام الساعة.',
      'تأسيس أول أسطول بحري إسلامي وانتصار المسلمين في معركة ذات الصواري التاريخية.',
      'توسعة المسجد الحرام والمسجد النبوي الشريف لاستيعاب الأعداد المليونية من المسلمين.',
      'تطوير النظم المالية والتجارية للأوقاف ومضاعفة موارد بيت المال في أرجاء العالم الإسلامي.'
    ],
    civilizationalImpactEn: [
      'Standardized the Uthmanic Master Mushaf, securing identical global transmission for all posterity.',
      'Built the first Muslim naval fleet and secured maritime victory at the Battle of the Masts.',
      'Undertook major expansions of the Holy Mosques in Makkah and Madinah to absorb pilgrims.',
      'Pioneered endowment economics and municipal trust funds, multiplying public welfare treasuries.'
    ],
    eternalAdviceAr: '«إن الله جعل الدنيا لتطلبوا بها الآخرة، ولم يجعلها لتركنوا إليها؛ فإن الدنيا تفنى والآخرة تبقى، فلا تبطرنكم الفانية، وآثروا ما يبقى على ما يفنى».',
    eternalAdviceEn: '"Allah created this world so you may seek the Hereafter, not that you should be seduced by it. The world perishes while the Hereafter endures; let not the transient intoxicate you, and prefer the eternal over the fleeting."',
    spiritualLessonsAr: [
      'الحياء الرباني الذي يورث صفاء النفس وستر العيوب والتأدب مع الله.',
      'الإنفاق السخي بلا حدود وشكر النعمة بتحويل الثروة إلى خدمة المستضعفين.',
      'الصبر الأسطوري على الابتلاء وتقديم المصلحة العليا وحقن الدماء على النجاة الشخصية.'
    ],
    spiritualLessonsEn: [
      'Angelic modesty (Haya) that refines the inner soul and nurtures reverence before the Almighty.',
      'Boundless philanthropy, recognizing financial prosperity as a tool for public service.',
      'Sublime patience under persecution, sacrificing oneself to protect community cohesion.'
    ],
    leadershipLessonsAr: [
      'الحرص على الوحدة الفكرية والثقافية للأمة وتوحيدها على كتاب الله.',
      'الرؤية الاستراتيجية في بناء القوة البحرية وتأمين الملاحة الدولية للدولة.',
      'العفو والصفح عند المقدرة وعدم استخدام القوة ضد المعارضين والمغرر بهم.'
    ],
    leadershipLessonsEn: [
      'Protecting core cultural and ideological unity around foundational scripture.',
      'Strategic foresight in naval development and maritime geopolitical security.',
      'Magnanimous clemency, refusing to deploy violent state force against dissidents.'
    ],
    modernApplicationAr: [
      'تأسيس مشاريع الأوقاف المستدامة كالمياه والتعليم والمستشفيات لخدمة المجتمع.',
      'التحلي بالحياء والعفة في السلوك والتعامل مع الناس والابتعاد عن الفحش.',
      'توظيف الثروات والنجاح التجاري في دعم نهضة الأمة وتفريج كرب المحتاجين.'
    ],
    modernApplicationEn: [
      'Establishing sustainable endowments for water, medicine, and education for community development.',
      'Embodying modesty and dignified speech in public conduct and digital discourse.',
      'Leveraging business success and personal wealth to lift underprivileged communities.'
    ]
  },

  // 4. علي بن أبي طالب
  'ali-ibn-abi-talib': {
    companionId: 'ali-ibn-abi-talib',
    lineageDetailsAr: 'علي بن أبي طالب (عبد مناف) بن عبد المطلب (شيبة الحمد) بن هاشم بن عبد مناف القرشي الهاشمي، ابن عم رسول الله ﷺ الشقيق، وأخوه بالمؤاخاة، وزوج ابنته فاطمة الزهراء سيدة نساء العالمين، وأبو السبطين الحسن والحسين، وأمه فاطمة بنت أسد الهاشمية أول هاشمية تلد هاشمياً.',
    lineageDetailsEn: 'Ali ibn Abi Talib of Banu Hashim. First cousin to the Prophet ﷺ, his fraternal brother, husband of Fatimah Az-Zahra (Chief of the Women of Paradise), father of Al-Hasan and Al-Husayn. His mother Fatimah bint Asad was the first Hashimite woman to give birth to a Hashimite.',
    geographicalStations: [
      {
        placeAr: 'مكة المكرمة',
        placeEn: 'Makkah Al-Mukarramah',
        periodAr: 'المولد حتى الهجرة 1 هـ',
        periodEn: 'Birth until 1 AH',
        detailsAr: 'نشأ في كنف النبي ﷺ كابنه، وأول من أسلم من الصبيان، وافتدى النبي بالنوم في فراشه ليلة الهجرة.',
        detailsEn: 'Raised in the Prophet\'s household; was the first youth to accept Islam, sleeping in the Prophet\'s bed on the night of Hijrah.'
      },
      {
        placeAr: 'المدينة المنورة',
        placeEn: 'Al-Madinah Al-Munawwarah',
        periodAr: '1 هـ - 35 هـ',
        periodEn: '1 AH - 35 AH',
        detailsAr: 'بطل المشاهد كلها وفارسها المغوار، حامل راية خيبر، والمستشار القضائي والتشريعي الأبرز للخلفاء الثلاثة.',
        detailsEn: 'Foremost champion in all major battles, carrier of the Khaybar banner, chief judicial counselor to the Caliphs.'
      },
      {
        placeAr: 'الكوفة (العراق)',
        placeEn: 'Kufa (Iraq)',
        periodAr: '36 هـ - 40 هـ',
        periodEn: '36 AH - 40 AH',
        detailsAr: 'عاصمة خلافته الراشدة، أدار منها شؤون الأمة بزهد مطلق وعدالة صارمة حتى استشهد في محراب مسجدها.',
        detailsEn: 'Capital of his Caliphate; governed with legendary asceticism and rigorous justice until his martyrdom.'
      }
    ],
    dailyRoutineAr: 'كان يقوم ثلثي الليل في محرابه يتضرع ويتململ كالسليم ويبكي بكاء الثكلى من خشية الله، فإذا صلى الفجر مكث في مسجده يذكر الله حتى تطلع الشمس، ثم يخرج إلى السوق بمفرده يمشي بلا حراس، يرشد الضال، ويعين الحمال على حمله، ويقرأ على التجار: ﴿تِلْكَ الدَّارُ الْآخِرَةُ نَجْعَلُهَا لِلَّذِينَ لَا يُرِيدُونَ عُلُوًّا فِي الْأَرْضِ وَلَا فَسَادًا﴾، ويقضي بين الخصوم بنور الفقه، ويفطر على قرص شعير يكسره بركبته من يبسه.',
    dailyRoutineEn: 'He spent two-thirds of the night weeping in prayer. After dawn he remained in Dhikr, then walked unescorted in the bazaars guiding lost travelers, helping porters lift heavy loads, reciting Quranic warnings against vanity, judging disputes, and breaking fast on hard barley bread he had to snap against his knee.',
    uniqueDistinctionsAr: [
      'فارس الإسلام الذي لم يُهزم قط في مبارزة طوال حياته وقاتل مرحب وعمرو بن ود.',
      'شهادة النبي ﷺ بمنزلته: «أَنْتَ مِنِّي بِمَنْزِلَةِ هَارُونَ مِنْ مُوسَى، إِلَّا أَنَّهُ لَا نَبِيَّ بَعْدِي».',
      'حامل لواء المحبة الإلهية يوم خيبر: «رَجُلٌ يُحِبُّ اللَّهَ وَرَسُولَهُ وَيُحِبُّهُ اللَّهُ وَرَسُولُهُ».',
      'سيد البلاغة والفصاحة والقضاء بشهادة عمر: «أقضانا علي وأقرؤنا أبيّ».',
      'الوحيد الذي تربى في حجر النبوة صبياً وافتدى الرسول شاباً وصاهره خليفةً.'
    ],
    uniqueDistinctionsEn: [
      'Undefeated warrior in every personal duel throughout his life, vanquishing titans like Amr ibn Abd Wudd and Marhab.',
      'Honored by the Prophet: "You are to me as Aaron was to Moses, except there is no Prophet after me."',
      'Awarded the divine banner at Khaybar: "A man who loves Allah and His Messenger, and Allah and His Messenger love him."',
      'The supreme jurist of the Sahaba, affirmed by Umar: "The best judge among us is Ali."',
      'Raised directly in the Prophet\'s home, sacrificed himself as a decoy at Hijrah, and father of the Prophet\'s direct descendants.'
    ],
    idolatryStanceAr: 'لم يتدنس قلبه ولا جبينه بسجدة لصنم قط؛ لأنه وُلد ونشأ في كنف النبي ﷺ قبل البعثة واستضاء بنور النبوة منذ نعومة أظفاره فاستحق لقب «كرّم الله وجهه» لتنزهه الكامل عن شرك الجاهلية وقاذوراتها.',
    idolatryStanceEn: 'His forehead never bowed to a pagan idol. Having been nurtured in the Prophet\'s own household from childhood, he was preserved from all pagan pollutions, earning the traditional honorific "May Allah honor his countenance."',
    wisdomAndPreIslamRoleAr: 'كان أصغر بني هاشم ولكن أوقدهم ذكاءً وأشجعهم قلباً؛ تشرب من النبي ﷺ الحكمة ومكارم الأخلاق، وحين جمع النبي عشيرته الأقربين ودعاهم إلى الإسلام صمت الكبار فقام علي وهو فتى وصاح: "أنا عونك يا رسول الله!".',
    wisdomAndPreIslamRoleEn: 'Though young, he possessed blazing intellect and valor. When the Prophet assembled Banu Hashim summoning them to Islam, the elders sat hesitant while young Ali sprang forward declaring: "I shall be your supporter, O Messenger of Allah!"',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بين الصحابة جميعاً، فلما فرغ بكى علي وقال: "يا رسول الله، آخيت بين أصحابك ولم تواخِ بيني وبين أحد!" فاحتضنه النبي ﷺ وقال: «أَنْتَ أَخِي فِي الدُّنْيَا وَالآخِرَةِ!».',
    hijrahAndBrotherhoodEn: 'When the Prophet paired the companions in fraternal pacts, Ali wept noticing he had no partner. The Prophet embraced him warmly declaring: "You are my brother in this world and in the Hereafter!"',
    prophetSacrificeAr: 'فداؤه ليلة الهجرة حين نام في فراش النبي ﷺ مسجىً ببردته الخضراء والسيوف تلمع فوق رأسه؛ فكان أول فدائي يفتدي صاحب الرسالة بروحه بيقين واطمئنان معجزين.',
    prophetSacrificeEn: 'His immortal decoy stance sleeping in the Prophet\'s bed beneath the gleaming assassination blades, risking his life so the Prophet could escape safely to Madinah.',
    quranicVerses: [
      {
        verseAr: '﴿وَمِنَ النَّاسِ مَن يَشْرِي نَفْسَهُ ابْتِغَاءَ مَرْضَاتِ اللَّهِ وَاللَّهُ رَءُوفٌ بِالْعِبَادِ﴾',
        verseEn: '"And of the people is he who sells himself, seeking means to the approval of Allah. And Allah is kind to [His] servants."',
        surahAr: 'سورة البقرة: 207',
        surahEn: 'Surah Al-Baqarah: 207',
        contextAr: 'ذكر أئمة التفسير كابن عباس والحاكم أنها نزلت في علي بن أبي طالب حين بات في فراش رسول الله ﷺ ليلة الهجرة.',
        contextEn: 'Classical commentators state this was revealed regarding Ali bartering his soul sleeping in the Prophet\'s bed on the night of Hijrah.'
      },
      {
        verseAr: '﴿إِنَّمَا وَلِيُّكُمُ اللَّهُ وَرَسُولُهُ وَالَّذِينَ آمَنُوا الَّذِينَ يُقِيمُونَ الصَّلَاةَ وَيُؤْتُونَ الزَّكَاةَ وَهُمْ رَاكِعُونَ﴾',
        verseEn: '"Only Allah is your ally and His Messenger and those who have believed - those who establish prayer and give Zakat while bowing down."',
        surahAr: 'سورة المائدة: 55',
        surahEn: 'Surah Al-Maaida: 55',
        contextAr: 'نزلت حين تصدق علي بخاتمه وهو راكع في صلاته لسائل مسكين دخل المسجد.',
        contextEn: 'Revealed when Ali bestowed his ring in charity to a destitute petitioner while bowing in prayer.'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'عمر بن الخطاب رضي الله عنه',
        speakerEn: 'Umar ibn Al-Khattab',
        quoteAr: '«لولا علي لهلك عمر، وأعوذ بالله من معضلة ليس لها أبو حسن، وعلي أقضانا وأعلمنا بكتاب الله».',
        quoteEn: '"Were it not for Ali, Umar would have perished! I seek refuge in Allah from a crisis where Abu Al-Hasan is absent."'
      },
      {
        speakerAr: 'أم المؤمنين عائشة رضي الله عنها',
        speakerEn: 'Mother of the Believers Aisha',
        quoteAr: '«أما إنه أعلم من بقي بالسنة»، وقالت لما بلغها استشهاده: «رحم الله علياً، إني ما رأيته إلا يسبق بالخير».',
        quoteEn: '"Indeed he was the most knowledgeable of remaining people in the Sunnah." She lamented upon his martyrdom: "May Allah have mercy on Ali; I never saw him except racing towards every noble deed."'
      }
    ],
    civilizationalImpactAr: [
      'تأسيس علم النحو وقواعد اللغة العربية؛ حين أملى على أبي الأسود الدؤلي: "الكلام اسم وفعل وحرف، انحُ هذا النحو".',
      'إرساء عهد الحكم والإدارة الرشيدة في رسالته التاريخية لمالك الأشتر التي تُعد أعظم وثيقة دستورية وإنسانية.',
      'تأصيل فقه القضاء والشهادات والمعاملات وفض المنازعات بحيادية وتجرد أذهل الخصوم.',
      'التطبيق الحرفي للمساواة الاقتصادية في العطاء؛ كان يقسم المال بين الرعية بالتساوي دون تمييز لقرابة أو شرف.'
    ],
    civilizationalImpactEn: [
      'Founded Arabic syntax and grammar, instructing Abu Al-Aswad Ad-Du\'ali: "Speech consists of noun, verb, and particle; pursue this course."',
      'Authored the immortal epistle of governance to Malik Al-Ashtar, cited worldwide as a masterpiece of social justice and civil rights.',
      'Codified forensic judicial jurisprudence and dispute resolution with absolute integrity.',
      'Enforced egalitarian public treasury distributions, distributing revenue equally regardless of tribal lineage.'
    ],
    eternalAdviceAr: '«النَّاسُ صِنْفَانِ: إِمَّا أَخٌ لَكَ فِي الدِّينِ، أَوْ نَظِيرٌ لَكَ فِي الخَلْقِ. واعلم أن البغي يقصر الأعمار، وأن الصدق نجاة، وقيمة كل امرئ ما يحسنه».',
    eternalAdviceEn: '"People are of two categories: either your brother in faith, or your equal in humanity. Injustice truncates life, truthfulness is salvation, and the worth of each person lies in the excellence of their craft."',
    spiritualLessonsAr: [
      'الزهد الحقيقي في مباهج السلطة والرئاسة والنظر للدنيا كوسيلة للآخرة.',
      'الشجاعة القلبية الموصولة بالتوكل، فلا يهاب الموت ولا يجزع من الشدائد.',
      'الإخلاص التام لله؛ كان يقاتل لله وحده وحين بصق عدوه في وجهه أمسك عن قتله لئلا يغضب لنفسه.'
    ],
    spiritualLessonsEn: [
      'Radical asceticism, declining regal wealth while commanding a superpower.',
      'Inner spiritual fearlessness anchored in divine trust, unmoved by threats.',
      'Absolute purity of intention; fighting solely for God without personal vengeance.'
    ],
    leadershipLessonsAr: [
      'العدالة الصارمة بين الحاكم والمحكومين والوقوف أمام القاضي جنباً إلى جنب مع الخصوم.',
      'العناية بالفئات المستضعفة والمهمشة والإنصاف للمظلوم دون إبطاء.',
      'البلاغة والحكمة في توجيه الشعوب وجمع الكلمة على أسس المبادئ والأخلاق.'
    ],
    leadershipLessonsEn: [
      'Universal equality under the law, willingly standing trial before judges alongside ordinary citizens.',
      'Vigilant advocacy for the marginalized and rapid restitution for the oppressed.',
      'Inspiring eloquent rhetoric that unites communities around ethical excellence.'
    ],
    modernApplicationAr: [
      'إتقان العلم والعمل والمهارات النافعة عملاً بحكمته: "قيمة كل امرئ ما يحسنه".',
      'التعامل الإنساني الراقي مع جميع البشر على قاعدة الأخوة في الإنسانية والعدل للجميع.',
      'التحلي بالشجاعة الأدبية في نصرة المظلومين والترفع عن الانتقام الشخصي.'
    ],
    modernApplicationEn: [
      'Pursuing vocational mastery in line with his maxim: "The value of each person is what they master."',
      'Treating all human beings with respect rooted in universal human kinship and equity.',
      'Courageously standing up for justice while subduing personal ego and vengeance.'
    ]
  },

  // 5. طلحة بن عبيد الله
  'talha-ibn-ubaydillah': {
    companionId: 'talha-ibn-ubaydillah',
    lineageDetailsAr: 'طلحة بن عبيد الله بن عثمان بن عمرو بن كعب بن سعد بن تيم بن مرة القرشي التيمي، يلتقي مع النبي ﷺ وأبي بكر الصديق في الجد السادس مرة بن كعب، وأمه الصعبة بنت الحضرمي أسلمت وهاجرت إلى المدينة، وهو أحد الثمانية السابقين إلى الإسلام.',
    lineageDetailsEn: 'Talha ibn Ubaydillah of Banu Taym, merging with the Prophet\'s and Abu Bakr\'s lineages at Murrah ibn Ka\'b. His mother Al-Sa\'bah bint Al-Hadrami accepted Islam and migrated to Madinah. He was among the first eight converts in Islamic history.',
    geographicalStations: [
      {
        placeAr: 'بُصرى الشام',
        placeEn: 'Bosra (Syria)',
        periodAr: 'قبل البعثة النبوية',
        periodEn: 'Pre-Prophethood',
        detailsAr: 'سمع في سوقها راهباً يبشر بخروج نبي أحمد من الحرم، فكان ذلك سبب بحثه عن النبي ﷺ وإسلامه فور عودته.',
        detailsEn: 'Encountered a Christian monk prophesying the advent of the final Prophet Ahmad, driving him to accept Islam upon return.'
      },
      {
        placeAr: 'جبل أحد',
        placeEn: 'Mount Uhud',
        periodAr: '3 هـ',
        periodEn: '3 AH',
        detailsAr: 'المحطة التي خلدته درعاً بشرياً لرسول الله ﷺ وتلقى بيده النبال حتى شُلت ونال لقب صقر أحد والشهيد الحي.',
        detailsEn: 'The historic summit where he shielded the Prophet ﷺ with his bare hands, suffering paralysis and earning the title "Living Martyr".'
      },
      {
        placeAr: 'البصرة (العراق)',
        placeEn: 'Basra (Iraq)',
        periodAr: '36 هـ',
        periodEn: '36 AH',
        detailsAr: 'شهد يوم الجمل ثم اعتزل القتال طلباً لحقن الدماء واستشهد ودفن بها بعد حياة حافلة بالبذل والجهاد.',
        detailsEn: 'Present at the Battle of the Camel, withdrew to avoid Muslim bloodshed, and was martyred and buried in Basra.'
      }
    ],
    dailyRoutineAr: 'كان يقضي نهاره في التجارة والأعمال المبرورة، فإذا ربح وزع الأرباح في حينه على المحتاجين، وكان يقسم ليله بين الصلاة والدعاء وتفقد الأرامل والأيتام، لا يدع يتيماً من قومه إلا كفاه وعلّمه وزوّجه، وكان دائم البشر والابتسامة لا يلقى أحداً إلا بوجهٍ طلق رحب.',
    dailyRoutineEn: 'Balanced high-level commerce with instant charity disbursement. At night he divided his hours between prostration and community welfare, personally mentoring and funding every orphan in his clan with an irrepressible cheerful smile.',
    uniqueDistinctionsAr: [
      'الشهيد الحي الذي يمشي على الأرض بشهادة النبي ﷺ: «مَنْ سَرَّهُ أَنْ يَنْظُرَ إِلَى شَهِيدٍ يَمْشِي عَلَى وَجْهِ الأَرْضِ فَلْيَنْظُرْ إِلَى طَلْحَةَ».',
      'صقر أحد الذي وقى رسول الله ﷺ بنفسه وشُلت يده وتلقى أكثر من 70 طعنة ورمية سهم.',
      'أطلق عليه النبي ﷺ ألقاب الجود الثلاثة: «طلحة الخير، طلحة الفياض، طلحة الجود».',
      'أحد الستة أصحاب الشورى الذين اختارهم عمر بن الخطاب رضي الله عنه لتولي الخلافة.'
    ],
    uniqueDistinctionsEn: [
      'Certified by the Prophet ﷺ as "The Living Martyr walking upon the earth."',
      'The Falcon of Uhud who endured over 70 wounds and lost mobility in his hand shielding the Prophet.',
      'Given three distinct titles of munificence by the Prophet: "Talha of Goodness, Talha the Overflowing, Talha of Generosity."',
      'One of the six-member electoral council chosen by Umar to elect the successor Caliph.'
    ],
    idolatryStanceAr: 'كان واسع الأفق شغوفاً بالتوحيد؛ لما سمع راهب بصرى الشام يتحدث عن نبي الرحمة عاف قلبه جاهلية مكة وأصنامها، ورجع يبحث عن النور فالتحق بركب الهدى دون تردد.',
    idolatryStanceEn: 'Enlightened in outlook; hearing the Syrian hermit announce the Prophet of mercy, his soul rejected the hollow idols of Makkah, returning immediately to seek monotheism.',
    wisdomAndPreIslamRoleAr: 'كان تاجراً فطناً صادق المعاملة ذائع الصيت في أسواق العرب، حظي باحترام كبراء قريش لأمانته وعقليته الاستثمارية وسماحته في البيع والشراء.',
    wisdomAndPreIslamRoleEn: 'A visionary young merchant of pristine reputation, esteemed by elders of Quraysh for trading honesty and exceptional business diplomacy.',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بينه وبين أبي أيوب الأنصاري، ولما هاجر النبي وأبو بكر استقبلهما طلحة في الطريق وكساهما من ثياب الشام الفاخرة التي أتى بها من تجارته.',
    hijrahAndBrotherhoodEn: 'Fraternized with Abu Ayyub Al-Ansari. Meeting the Prophet and Abu Bakr during their migration, Talha joyfully gifted them fine garments from his Syrian caravan.',
    prophetSacrificeAr: 'في أحد لما طوّق المشركون النبي وصاح النبي: «من للقوم وهو رفيقي في الجنة؟» انقض طلحة يقاتل حتى حمى النبي وظل يصد السهام بكفه، وكان أبو بكر يقول: "ذلك اليوم كله كان يوم طلحة!".',
    prophetSacrificeEn: 'At Uhud when enemies encircled the Prophet, Talha engaged eleven enemy fighters single-handedly. Abu Bakr repeatedly declared: "That entire day belonged to Talha!"',
    quranicVerses: [
      {
        verseAr: '﴿مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ فَمِنْهُم مَّن قَضَىٰ نَحْبَهُ وَمِنْهُم مَّن يَنتَظِرُ وَمَا بَدَّلُوا تَبْدِيلًا﴾',
        verseEn: '"Among the believers are men true to what they promised Allah. Among them is he who has fulfilled his vow, and among them is he who awaits, and they have not altered [their commitment] at all."',
        surahAr: 'سورة الأحزاب: 23',
        surahEn: 'Surah Al-Ahzab: 23',
        contextAr: 'أشار النبي ﷺ إلى طلحة وقال: «هذا ممن قضى نحبه»، مبيناً أنه شهيد حي يمشي بين الناس.',
        contextEn: 'The Prophet ﷺ pointed to Talha declaring: "This is among those who fulfilled their vow," denoting his living martyrdom.'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'أبو بكر الصديق رضي الله عنه',
        speakerEn: 'Abu Bakr As-Siddiq',
        quoteAr: '«كان يوم أحد كله يوم طلحة، هو الذي فدى رسول الله ﷺ ووقاه بمهجته ودمه».',
        quoteEn: '"The entire day of Uhud was Talha\'s day; he ransomed the Messenger of Allah ﷺ with his very flesh and blood."'
      },
      {
        speakerAr: 'علي بن أبي طالب رضي الله عنه',
        speakerEn: 'Ali ibn Abi Talib',
        quoteAr: '«سمعت رسول الله ﷺ يقول: طلحة والزبير جاراي في الجنة، وإني لأرجو أن أكون أنا وطلحة والزبير ممن قال الله فيهم: ﴿إِخْوَانًا عَلَىٰ سُرُرٍ مُّتَقَابِلِينَ﴾».',
        quoteEn: '"I heard the Prophet say: Talha and Az-Zubayr are my neighbors in Paradise, and I pray to be with them reclining as loving brothers upon thrones facing one another."'
      }
    ],
    civilizationalImpactAr: [
      'تأسيس منظومة الرعاية الاجتماعية والتكافل العشائري بسداد ديون الغارمين وكفالة الأرامل.',
      'إنشاء شبكات تجارية أخلاقية واسعة ربطت الجزيرة العربية بالشام وحضرموت وعززت اقتصاد المسلمين.',
      'المشاركة في قيادة معارك الفتوح الكبرى وإدارة مجلس الشورى الستة بعد وفاة الفاروق.',
      'إعلاء حرمة دماء المسلمين حين اعتزل القتال يوم الجمل مؤثراً لقاء ربه شهيداً مظلوماً.'
    ],
    civilizationalImpactEn: [
      'Pioneered communal welfare, systematically wiping out debts of struggling debtors and financing orphans.',
      'Built ethical trade highways linking Arabia to the Levant and Yemen, invigorating the Islamic market.',
      'Active leadership in foundational campaigns and service on Umar\'s six-man constitutional council.',
      'Exemplified the sanctity of Muslim life by withdrawing from civil strife to meet Allah in peace.'
    ],
    eternalAdviceAr: '«إن للمروءة ثمناً فمن بذل ماله حفظ عرضه، ومن بخل بماله أهان نفسه، ولا خير في مال لا يرى الناس أثره في سد جوعتهم وتفريج كربتهم».',
    eternalAdviceEn: '"Chivalry demands a price: whoever spends their wealth guards their honor, and whoever hoards it diminishes their soul. There is no virtue in wealth unless its bounty relieves the hungry and comforts the distressed."',
    spiritualLessonsAr: [
      'الفدائية الحقة وبذل النفس رخيصة في سبيل الله ونصرة نبيه ﷺ.',
      'سخاء اليد وطهارة القلب من التعلق ببريق الأموال والأرباح الفانية.',
      'سلامة الصدر والحرص على وحدة المسلمين وتجنب إراقة الدماء.'
    ],
    spiritualLessonsEn: [
      'Selfless valor, joyfully laying down one\'s body for the defense of the Prophet of Allah.',
      'Munificent generosity, holding vast fortunes in the palm of one\'s hand without letting them enter the heart.',
      'Purity of conscience and absolute commitment to the inviolability of human life.'
    ],
    leadershipLessonsAr: [
      'التقدم في الصفوف الأولى عند الخطر وحماية الجنود والقائد بالجسد.',
      'المبادرة إلى دعم المشاريع الحيوية والتكفل باحتياجات الضعفاء دون منّ أو أذى.',
      'الشجاعة في اتخاذ قرار الانسحاب وحقن الدماء حين تشتبه الرايات وتلتبس الفتن.'
    ],
    leadershipLessonsEn: [
      'Leading from the front rank in peril, acting as a shield for the team and commander.',
      'Proactively underwriting community welfare without patronizing strings attached.',
      'The moral courage to disengage and prevent bloodshed when civil conflicts blur lines.'
    ],
    modernApplicationAr: [
      'بذل المعروف وإعانة المتعثرين مالياً وقضاء حوائج الأسر المحتاجة.',
      'التضحية والوفاء للأصدقاء وإخوان الصدق في أوقات الشدائد والمحن.',
      'تجنب النزاعات والخلافات والسعي الدائم لإصلاح ذات البين ونشر السلام.'
    ],
    modernApplicationEn: [
      'Practicing generous humanitarian charity to relieve distressed families and relieve debts.',
      'Standing loyally by colleagues and loved ones in seasons of adversity and trial.',
      'Actively de-escalating conflicts and championing reconciliatory peace.'
    ]
  },

  // 6. الزبير بن العوام
  'az-zubayr-ibn-al-awwam': {
    companionId: 'az-zubayr-ibn-al-awwam',
    lineageDetailsAr: 'الزبير بن العوام بن خويلد بن أسد بن عبد العزى بن قصي بن كلاب القرشي الأسدي، ابن عمة رسول الله ﷺ (صفية بنت عبد المطلب)، وابن أخي أم المؤمنين خديجة بنت خويلد، وزوج أسماء بنت أبي بكر (ذات النطاقين)، وصهر الصديق، وأحد الستة أصحاب الشورى.',
    lineageDetailsEn: 'Az-Zubayr ibn Al-Awwam of Banu Asad. Son of the Prophet\'s aunt Safiyyah bint Abd Al-Muttalib, nephew of Khadijah bint Khuwaylid, husband of Asma bint Abi Bakr, and one of the six councilors appointed by Umar.',
    geographicalStations: [
      {
        placeAr: 'مكة المكرمة',
        placeEn: 'Makkah Al-Mukarramah',
        periodAr: 'المولد حتى الهجرة إلى الحبشة',
        periodEn: 'Birth until Abyssinia',
        detailsAr: 'أسلم وعمره 15 سنة، وسلّ أول سيف في الإسلام دفاعاً عن النبي، وعذبه عمه بالدخان في الحصير فثبت كالطود.',
        detailsEn: 'Embraced Islam at age 15, drew the first sword in Islam, endured severe torture wrapped in smoking mats.'
      },
      {
        placeAr: 'أرض الحبشة',
        placeEn: 'Abyssinia (Ethiopia)',
        periodAr: 'الهجرة الأولى والثانية',
        periodEn: 'Migrations to Abyssinia',
        detailsAr: 'هاجر فراراً بدينه، وسبح في النيل استطلاعاً لمعركة النجاشي وعاد بالبشارة بنصر الملك العادل.',
        detailsEn: 'Migrated for faith; swam the Nile on an inflated waterskin to scout a battle, bringing glad tidings of the Negus\'s victory.'
      },
      {
        placeAr: 'حصن بابليون (مصر)',
        placeEn: 'Fortress of Babylon (Egypt)',
        periodAr: '20 هـ',
        periodEn: '20 AH',
        detailsAr: 'اقتحم حصن بابليون العظيم منفرداً في فتح مصر معتلياً السور بسيفه فكبّر وفتح الباب الأعظم لجيش الفتح.',
        detailsEn: 'Breached the Roman ramparts of Babylon fortress solo in Egypt, roaring Takbir and unlocking the massive gates.'
      }
    ],
    dailyRoutineAr: 'كان يقضي وقته بين الفروسية وإعداد السلاح والتجارة الصادقة، فإذا كان الليل عكف على تلاوة القرآن وذكر الله، وكان قليل الحديث يحفظ لسانه، وإذا دخل في الصلاة بكى خشوعاً، وكان إذا استدان الناس منه كتبها قرضاً لئلا تضيع حقوقهم وقال: "إني أخشى أن يضيع مال أخي المسلم"، متوكلاً على ربه ومولاه في قضاء الديون.',
    dailyRoutineEn: 'Balanced warrior conditioning and commerce with prolonged silent nocturnal prayers. Spoke sparingly, strictly guarding his tongue. He treated incoming cash deposits as loans so clients would not bear risk, relying wholly upon Allah as his Supreme Patron.',
    uniqueDistinctionsAr: [
      'حواري رسول الله ﷺ وصاحب بشارته: «إِنَّ لِكُلِّ نَبِيٍّ حَوَارِيًّا، وَحَوَارِيَّ الزُّبَيْرُ».',
      'صاحب أول سيف سُلّ في سبيل الله في تاريخ الدعوة الإسلامية.',
      'نزلت الملائكة يوم بدر على سيماه وعمامته الصفراء تكريماً له ولبسالته.',
      'فداه رسول الله ﷺ بأبويه في غزوة الخندق: «فداك أبي وأمي».',
      'المقاتل الفذ الذي كان يقاتل بالسيفين معاً وهو ممتطٍ صهوة فرسه بإتقان إعجازي.'
    ],
    uniqueDistinctionsEn: [
      'The singular Disciple (Hawari) of the Prophet: "Every Prophet has a disciple, and my disciple is Az-Zubayr."',
      'Drew the very first sword in the history of Islam to defend the Prophet.',
      'The angels descended on Badr wearing yellow turbans mirroring Az-Zubayr\'s battle appearance.',
      'Ransomed by the Prophet ﷺ with both parents at the Trench: "May my father and mother be sacrificed for you."',
      'Mastered simultaneous dual-sword equestrian combat on the battlefield.'
    ],
    idolatryStanceAr: 'نشأ أبياً لا يقبل الخنوع؛ ولما كبر رفض وثنية مكة وعاداتها، وحين عذبه عمه نوفل بلفه في حصير وإيقاد النار تحته ليدخن عليه ليترد، كان الزبير يصرخ مخنوقاً: "لا أكفر بالله أبداً!".',
    idolatryStanceEn: 'Fiercely dignified from youth; when his uncle wrapped him in a rush mat suffocating him with dense smoke to force apostasy, young Az-Zubayr choked out: "Never shall I disbelieve in Allah!"',
    wisdomAndPreIslamRoleAr: 'ربته أمه صفية بنت عبد المطلب بشدة وصلابة ليكون فارساً مجاهداً يذود عن الحياض، فكان يتدرب على الركوب والقتال حتى صار مضرب المثل في الشجاعة والأنفة.',
    wisdomAndPreIslamRoleEn: 'Strictly raised by his formidable mother Safiyyah bint Abd Al-Muttalib to become a resolute knight, mastering horsemanship and tactical archery from boyhood.',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بينه وبين سلمة بن سلامة بن وقش، وكان ابنه عبد الله بن الزبير أول مولود للمهاجرين في المدينة، فكبّر المسلمون فرحاً به لدحض شائعة سحر اليهود للمسلمين بالعقم.',
    hijrahAndBrotherhoodEn: 'Fraternized with Salamah ibn Salamah. His son Abdullah was the first child born to the migrants in Madinah, celebrated with joyful Takbir across the city.',
    prophetSacrificeAr: 'في يوم الخندق لما غدرت بنو قريظة وتطوع وحده لاختراق حصونهم والاستطلاع في ظلمة الليل والرياح الباردة ثلاث مرات، فداه النبي بأبويه ومنحه وسام الحواري.',
    prophetSacrificeEn: 'Volunteered three consecutive times on a freezing howling night at the Trench to penetrate enemy fortifications, earning the Prophet\'s eternal tribute: "My disciple is Az-Zubayr."',
    quranicVerses: [
      {
        verseAr: '﴿الَّذِينَ اسْتَجَابُوا لِلَّهِ وَالرَّسُولِ مِن بَعْدِ مَا أَصَابَهُمُ الْقَرْحُ ۚ لِلَّذِينَ أَحْسَنُوا مِنْهُمْ وَاتَّقَوْا أَجْرٌ عَظِيمٌ﴾',
        verseEn: '"Those who responded to Allah and the Messenger after injury had struck them. For those who did good among them and feared Allah is a great reward."',
        surahAr: 'سورة آل عمران: 172',
        surahEn: 'Surah Aal-i-Imraan: 172',
        contextAr: 'قالت عائشة لابن أختها عروة بن الزبير: "يا ابن أختي، كان أبوك الزبير وأبو بكر منهم؛ لما أصاب النبي ما أصاب بأحد خرجوا يطاردون المشركين في حمراء الأسد".',
        contextEn: 'Aisha confirmed to her nephew Urwah: "Your father Az-Zubayr and Abu Bakr were among them, pursuing pagan forces to Hamra Al-Asad despite severe injuries."'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'أمير المؤمنين عمر بن الخطاب رضي الله عنه',
        speakerEn: 'Umar ibn Al-Khattab',
        quoteAr: '«الزبير ركن من أركان الدين، وفارس رسول الله ﷺ، يعد بألف رجل في المعركة».',
        quoteEn: '"Az-Zubayr is a pillar of the faith, the champion cavalryman of the Prophet ﷺ, equal to a thousand warriors in battle."'
      },
      {
        speakerAr: 'ابن عباس رضي الله عنهما',
        speakerEn: 'Ibn Abbas',
        quoteAr: '«ما كان في أصحاب رسول الله ﷺ أحد أفرس ولا أجرأ اقتحاماً من الزبير بن العوام».',
        quoteEn: '"Among all companions of the Prophet ﷺ, none possessed greater equestrian mastery or daring fortress-breaching courage than Az-Zubayr."'
      }
    ],
    civilizationalImpactAr: [
      'حسم فتح مصر باقتحام حصن بابليون التاريخي وكسر أقوى خطوط الدفاع البيزنطية.',
      'المشاركة في الفتوح الكبرى في اليرموك والشام وشمال إفريقيا وتأمين حدود الدولة.',
      'تأسيس منظومة الودائع والأمانات الاستثمارية بالتوكل المطلق على الله.',
      'توريث أجيال من أئمة العلم والقيادة؛ كابنه القائد عبد الله، وعروة أحد فقهاء المدينة السبعة.'
    ],
    civilizationalImpactEn: [
      'Decisively breached Babylon fortress, unlocking the liberation of Egypt.',
      'Instrumental cavalry spearhead at Yarmouk, North Africa, and Syrian campaigns.',
      'Founded ethical deposit trusts anchored in absolute reliance upon the Almighty.',
      'Sired monumental leaders and scholars, including Abdullah and master jurist Urwah.'
    ],
    eternalAdviceAr: '«إذا نابك أمر فاستعن بمولاك الحق، فإنه نعم المولى ونعم النصير، وعليك بالصدق فإن عاقبته النجاة، ولا تبت وأنت تؤذي مسلماً».',
    eternalAdviceEn: '"Whenever hardship befalls you, seek aid from your True Patron, for He is the finest Protector. Cling to truthfulness, for its fruit is salvation, and never sleep while causing distress to a fellow believer."',
    spiritualLessonsAr: [
      'التوكل الإعجازي على الله في قضاء الديون وتفريج الكروب: "يا مولى الزبير اقضِ دينه".',
      'الثبات الراسخ على المبدأ رغم أهوال التعذيب والتنكيل.',
      'الرجوع الفوري إلى الحق عند التذكير؛ اعتزل معركة الجمل فور تذكير علي له بحديث النبي.'
    ],
    spiritualLessonsEn: [
      'Profound reliance on Allah for settling obligations and overcoming adversity.',
      'Unshakeable steadfastness under physical torment and hardship.',
      'Instantaneous compliance with truth when reminded of the Prophet\'s teachings.'
    ],
    leadershipLessonsAr: [
      'الجرأة الخارقة والمبادرة الفردية لكسر الحصارات وإنقاذ الجيوش.',
      'السرية والاستطلاع العسكري الدقيق في اللحظات الحرجة من المعارك.',
      'الحفاظ على الأمانة وحقوق الناس المالية حتى في أحلك الظروف.'
    ],
    leadershipLessonsEn: [
      'Audacious tactical initiative to shatter sieges and secure breakthroughs.',
      'Flawless reconnaissance operations under high-stakes conditions.',
      'Scrupulous safeguarding of public and private trust assets even in combat.'
    ],
    modernApplicationAr: [
      'غرس الشجاعة والمبادرة الإيجابية في مواجهة التحديات وعدم التردد في فعل الخير.',
      'التوكل الصادق على الله مع الأخذ بكافة الأسباب المادية المتاحة.',
      'الوفاء بالأمانات والديون والحرص على نظافة الذمة المالية.'
    ],
    modernApplicationEn: [
      'Cultivating proactive courage to confront obstacles and champion noble causes.',
      'Pairing absolute reliance upon Allah with rigorous tactical preparation.',
      'Meticulously fulfilling debts and preserving unblemished fiscal integrity.'
    ]
  },

  // 7. عبد الرحمن بن عوف
  'abdur-rahman-ibn-awf': {
    companionId: 'abdur-rahman-ibn-awf',
    lineageDetailsAr: 'عبد الرحمن بن عوف بن عبد عوف بن عبد بن الحارث بن زهرة بن كلاب القرشي الزهري، يلتقي مع النبي ﷺ في جده كلاب بن مرة، وهو ابن عم آمنة بنت وهب أم رسول الله ﷺ، وأمه الشفاء بنت عوف الزهرية قابلت النبي ﷺ عند ولادته الشريفة، كان اسمه في الجاهلية "عبد عمرو" فسمّاه النبي "عبد الرحمن".',
    lineageDetailsEn: 'Abdur-Rahman ibn Awf of Banu Zuhrah, meeting the Prophet\'s lineage at Kilab. Cousin of Aminah bint Wahb (the Prophet\'s mother). His mother Al-Shifa was the midwife who attended the Prophet\'s birth. Named "Abd Amr" in Jahiliyyah, the Prophet renamed him Abdur-Rahman.',
    geographicalStations: [
      {
        placeAr: 'مكة المكرمة',
        placeEn: 'Makkah Al-Mukarramah',
        periodAr: 'المولد حتى الهجرة إلى الحبشة',
        periodEn: 'Birth until Abyssinia',
        detailsAr: 'من السابقين الأولين أسلم على يد أبي بكر، وذاق ألوان التعذيب في مكة وهاجر مرتين.',
        detailsEn: 'Early convert through Abu Bakr; endured torture in Makkah and migrated twice to Abyssinia.'
      },
      {
        placeAr: 'المدينة المنورة (سوق قينقاع)',
        placeEn: 'Madinah (Qaynuqa Bazaar)',
        periodAr: '1 هـ - 32 هـ',
        periodEn: '1 AH - 32 AH',
        detailsAr: 'رفع شعار "دلوني على السوق" وبنى أعظم صرح تجاري خيري، وقاد الشورى بعد وفاة عمر.',
        detailsEn: 'Raised the banner "Guide me to the market," building an epic business empire and directing the Caliphate election.'
      },
      {
        placeAr: 'تبوك',
        placeEn: 'Tabuk',
        periodAr: '9 هـ',
        periodEn: '9 AH',
        detailsAr: 'صلى رسول الله ﷺ خلفه ركعة الفجر إماماً في أعظم تكريم ناله صحابي في المحراب.',
        detailsEn: 'Led Prophet Muhammad ﷺ in dawn congregational prayer, achieving rare spiritual precedence.'
      }
    ],
    dailyRoutineAr: 'كان يبدأ نهاره بالاستبكار إلى المسجد ثم يخرج إلى السوق يستثمر بالحلال الصافي، فإذا ربح عزل نصيب الفقراء والأرامل أولاً، وكان كثير البكاء عند طعامه خائفاً من بسطة الدنيا، ويقضي ليله في المحراب باكياً متضرعاً، ويعتق في كل شهر عشرات الرقاب، ويتكفل بنفقات أمهات المؤمنين جميعاً بعد وفاة النبي ﷺ.',
    dailyRoutineEn: 'Began at dawn prayer, then engaged in rigorous ethical trading. He allocated the welfare share of profits first. Wept over modest meals fearing worldly luxuries, spent nights in prayer, freed dozens of slaves monthly, and personally underwrote all living expenses for the Mothers of the Believers.',
    uniqueDistinctionsAr: [
      'الصحابي الوحيد الذي صلى خلفه رسول الله ﷺ وهو إمام في سفر وركع خلفه.',
      'مهندس الشورى ورجل الإجماع الذي تنازل عن الخلافة طواعية واختار عثمان بن عفان بحياد تام.',
      'أحد الثمانية السابقين إلى الإسلام، وأحد العشرة المبشرين بالجنة.',
      'أنفق في سبيل الله نصف ماله (أربعة آلاف درهم)، ثم أربعين ألف دينار، ثم جهز 500 فرس و1500 راحلة.'
    ],
    uniqueDistinctionsEn: [
      'The companion behind whom Prophet Muhammad ﷺ performed congregational prayer as a follower.',
      'The architect of the 6-man council who voluntarily renounced the Caliphate to arbitrate consensus neutrally.',
      'Among the earliest eight converts to Islam and one of the Ten Promised Paradise.',
      'Donated half his wealth (4,000 dirhams), then 40,000 gold dinars, then equipped 500 warhorses and 1,500 camels.'
    ],
    idolatryStanceAr: 'كان كريم النفس عالي الهمة، عاف خمر الجاهلية وأصنامها قبل الإسلام قائلاً: "إن شرب الخمر مفسدة للعقل ومذهبة للمروءة، وسجود الحجر ضياع للبصيرة"، فما مسّ صنماً قط.',
    idolatryStanceEn: 'Noble-spirited; shunned alcohol and pagan statues prior to Islam saying: "Wine corrupts the intellect and destroys chivalry, and prostrating to stone is the blindness of discernment."',
    wisdomAndPreIslamRoleAr: 'عُرف بأمانته وعقليته التجارية الفذة في مكة، وكان من أصحاب المشورة في بني زهرة لرجاحة حكمته وسداد رأيه في المعاملات المالية.',
    wisdomAndPreIslamRoleEn: 'Celebrated for fiscal acumen and honesty in Makkah, acting as trusted financial advisor within Banu Zuhrah.',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بينه وبين سعد بن الربيع الأنصاري، فقدم سعد له نصف ثروته فرفض عبد الرحمن بعفة مؤمنة وقال كلمته الخالدة: «بارك الله لك في أهلك ومالك، دلوني على السوق!».',
    hijrahAndBrotherhoodEn: 'Fraternized with Sa\'d ibn Ar-Rabi who offered half his immense fortune; Abdur-Rahman declined with noble dignity, uttering: "May Allah bless your wealth, simply guide me to the market!"',
    prophetSacrificeAr: 'ثبت يوم أحد دفاعاً عن رسول الله ﷺ حتى أصيب بأكثر من عشرين جرحاً وسقطت ثناياه وعرجت ساقه فكانت أوسمة شرف تلازمه طوال حياته.',
    prophetSacrificeEn: 'Stood steadfast at Uhud, suffering over twenty wounds, losing front teeth and walking with a permanent limp incurred while defending the Prophet.',
    quranicVerses: [
      {
        verseAr: '﴿الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ ثُمَّ لَا يُتْبِعُونَ مَا أَنفَقُوا مَنًّا وَلَا أَذًى ۙ لَّهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ﴾',
        verseEn: '"Those who spend their wealth in the cause of Allah and then do not follow up what they have spent with reminders [of it] or other injury will have their reward with their Lord."',
        surahAr: 'سورة البقرة: 262',
        surahEn: 'Surah Al-Baqarah: 262',
        contextAr: 'نزلت في عثمان بن عفان وعبد الرحمن بن عوف لما تصدق عبد الرحمن بنصف ماله وتصدق عثمان بجيش العسرة.',
        contextEn: 'Revealed regarding Abdur-Rahman ibn Awf donating half his entire fortune and Uthman funding Tabuk.'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'أم المؤمنين عائشة رضي الله عنها',
        speakerEn: 'Mother of the Believers Aisha',
        quoteAr: '«سقى الله عبد الرحمن بن عوف من سلسبيل الجنة؛ كان يكفل أمهات المؤمنين ويبرهن بعد وفاة رسول الله ﷺ».',
        quoteEn: '"May Allah give Abdur-Rahman ibn Awf to drink from Salsabil in Paradise; he sustained and honored the Mothers of the Believers after the Prophet\'s passing."'
      },
      {
        speakerAr: 'علي بن أبي طالب رضي الله عنه',
        speakerEn: 'Ali ibn Abi Talib',
        quoteAr: '«أنت سيد من سادات المسلمين وأمين من أمناء الأرض، سمعت رسول الله ﷺ يقول: عبد الرحمن بن عوف أمين في السماء أمين في الأرض».',
        quoteEn: '"You are a chieftain of the Muslims and an honest trustee on earth; the Prophet ﷺ said: Abdur-Rahman is trustworthy in heaven and trustworthy on earth."'
      }
    ],
    civilizationalImpactAr: [
      'إرساء النموذج الاقتصادي الإسلامي القائم على الإنتاج الحلال ورفض الربا والاحتكار وتدوير رأس المال.',
      'إدارة أزمة انتقال السلطة بعد استشهاد عمر واختيار الخليفة عثمان بنجاح ودون إراقة قطرة دم واحدة.',
      'كفالة عائلات الصحابة وأمهات المؤمنين ورعاية جيوش الفتح بتمويلات ضخمة مستمرة.',
      'إعتاق ما يزيد على ثلاثين ألف نسمة من الأرقاء وتحريرهم لوجه الله تعالى.'
    ],
    civilizationalImpactEn: [
      'Established the Islamic economic paradigm of ethical enterprise, anti-usury, and wealth circulation.',
      'Masterfully steered the constitutional transition after Umar\'s martyrdom without a single drop of blood.',
      'Sustained the Mothers of the Believers and underwrote frontier armies with ongoing capital.',
      'Personally emancipated over 30,000 enslaved people in the cause of Allah.'
    ],
    eternalAdviceAr: '«إن أردتم البركة في أموالكم فأخرجوا حق الله فيها ولا تتبعوها مناً ولا أذى، واعلموا أن المال خادم صالح وسيد فاسد، فكونوا سادة لأموالكم ولا تكونوا عبيداً لها».',
    eternalAdviceEn: '"If you desire divine blessing in your wealth, discharge Allah\'s due upon it without reminders or harm. Wealth is a useful servant but a corrupt master; master your fortunes and never become enslaved by them."',
    spiritualLessonsAr: [
      'الخوف من استدراج الدنيا وبكاء العين عند توفر النعم خشية استعجال الطيبات.',
      'عزة النفس الإيمانية والتعفف عن أموال الناس والاعتماد على الكسب الحلال.',
      'الإخلاص والتجرد لله والتنازل عن أعلى المناصب السياسية عند التعارض.'
    ],
    spiritualLessonsEn: [
      'Vigilance against spiritual complacency, weeping over riches lest rewards be consumed in this world.',
      'Noble self-reliance, refusing charity handouts in favor of honest enterprise.',
      'Sublime detachment, freely stepping aside from the supreme office of Caliph.'
    ],
    leadershipLessonsAr: [
      'الحياد والنزاهة في إدارة الأزمات السياسية والتحكيم بين القادة.',
      'استخدام القوة الاقتصادية كرصيد استراتيجي لدعم أمن المجتمع واستقراره.',
      'بناء الثقة المؤسسية والاستماع لآراء العامة والخاصة قبل اتخاذ القرارات المصيرية.'
    ],
    leadershipLessonsEn: [
      'Unimpeachable neutrality in political mediation and selecting heads of state.',
      'Deploying financial capital as a strategic cushion for civic resilience.',
      'Building institutional consensus through broad-based consultation before critical decisions.'
    ],
    modernApplicationAr: [
      'تطبيق أخلاقيات التجارة النزيهة ودعم المشاريع الريادية القائمة على العمل الجاد.',
      'الاستثمار في تمكين الشباب وتوجيههم نحو الاعتماد على النفس وسوق العمل.',
      'تخصيص نسب من أرباح الشركات للأعمال الخيرية المستدامة ورعاية الأيتام.'
    ],
    modernApplicationEn: [
      'Practicing ethical commerce and incubating entrepreneurship built on hard work.',
      'Investing in youth empowerment, guiding job-seekers toward economic self-reliance.',
      'Allocating steady corporate profit percentages to enduring charitable endowments.'
    ]
  },

  // 8. سعد بن أبي وقاص
  'sad-ibn-abi-waqqas': {
    companionId: 'sad-ibn-abi-waqqas',
    lineageDetailsAr: 'سعد بن أبي وقاص (مالك) بن وهيب بن عبد مناف بن زهرة بن كلاب القرشي الزهري، خال رسول الله ﷺ، يلتقي مع النبي ﷺ في جده كلاب بن مرة، وأمه حمنة بنت سفيان بن أمية بن عبد شمس، وهو أحد الثمانية السابقين إلى الإسلام وأحد الستة أصحاب الشورى.',
    lineageDetailsEn: 'Sa\'d ibn Abi Waqqas of Banu Zuhrah, maternal uncle of the Prophet ﷺ (meeting lineage at Kilab). His mother was Hamnah bint Sufyan of Banu Umayyah. Among the first eight converts to Islam and one of the six electoral councilors.',
    geographicalStations: [
      {
        placeAr: 'مكة المكرمة',
        placeEn: 'Makkah Al-Mukarramah',
        periodAr: 'المولد حتى الهجرة 1 هـ',
        periodEn: 'Birth until 1 AH',
        detailsAr: 'أسلم وهو ابن 17 سنة وكان من أوائل من صدّع بالحق، وصبر على إضراب أمه عن الطعام.',
        detailsEn: 'Converted at age 17 as an early pioneer, standing firm despite his mother\'s prolonged hunger strike.'
      },
      {
        placeAr: 'القادسية والمدائن (العراق)',
        placeEn: 'Al-Qadisiyyah & Ctesiphon',
        periodAr: '15 هـ - 16 هـ',
        periodEn: '15 AH - 16 AH',
        detailsAr: 'قاد المعركة التاريخية التي أسقطت كسرى، وفتح المدائن عاصمة فارس وصلى في إيوان كسرى صلاة الفتح.',
        detailsEn: 'Led the epochal victory crushing the Sasanian empire, entering the White Palace of Ctesiphon for victory prayer.'
      },
      {
        placeAr: 'الكوفة',
        placeEn: 'Kufa (Iraq)',
        periodAr: '17 هـ',
        periodEn: '17 AH',
        detailsAr: 'خطط وأنشأ مدينة الكوفة لتكون معسكراً ودار هجرة وعاصمة عسكرية لحماية حدود العراق والشرق.',
        detailsEn: 'Planned and founded the military garrison city of Kufa, anchoring regional security in the East.'
      }
    ],
    dailyRoutineAr: 'كان يبدأ فجره بالتضرع والبكاء في المسجد، ثم يتفقد تدريب الرماة وصيانة الأسلحة، وكان حريصاً على طيب طعامه متورعاً عن الشبهات استجابة لوصية النبي: «أطب مطعمك تكن مستجاب الدعوة»، وكان يخاف لسانه فلا يدعو على أحد إلا بحق، وإذا خلا في داره تبتل مصلياً حتى الصباح.',
    dailyRoutineEn: 'Began with tearful dawn worship, inspected archers and military hardware, rigorously vetted every morsel of food to ensure pure lawful sustenance honoring the Prophet\'s advice for answered prayers, and spent nights in worship.',
    uniqueDistinctionsAr: [
      'الصحابي الوحيد الذي فداه النبي ﷺ بأبويه معاً يوم أحد: «ارْمِ سَعْدُ! فِدَاكَ أَبِي وَأُمِّي!».',
      'صاحب أول سهم رُمي في سبيل الله في تاريخ الإسلام.',
      'مستجاب الدعوة ببركة دعاء النبي له: «اللَّهُمَّ سَدِّدْ رَمْيَتَهُ، وَأَجِبْ دَعْوَتَهُ».',
      'فاتح بلاد فارس وقائد معركة القادسية وإسقاط عرش الأكاسرة.',
      'آخر من مات من العشرة المبشرين بالجنة (توفي سنة 55 هـ بالمدينة وعمره 83 سنة).'
    ],
    uniqueDistinctionsEn: [
      'The only companion for whom the Prophet ﷺ combined both parents in ransom: "Shoot, Sa\'d, may my father and mother be sacrificed for you!"',
      'Fired the very first defensive arrow in the history of Islam.',
      'Miraculously answered in prayer through the Prophet\'s supplication: "O Allah, direct his shot and answer his prayer."',
      'Conqueror of the Persian empire and victorious commander at Al-Qadisiyyah.',
      'The longest-lived of the Ten Promised Paradise (passing in 55 AH at age 83).'
    ],
    idolatryStanceAr: 'نشأ محباً للحق شريف السيرة؛ لما دعاه أبو بكر إلى الإسلام قال سعد: "والله لقد رأيت في منامي قبل ثلاثة أيام كأني في ظلمة لا أبصر شيئاً، وإذا بقمر قد أشرق فأتبعته، فإذا أنا بأبي بكر وعلي وزيد قد سبقوني إليه، فلما دعاني رسول الله عرفت أنه الحق".',
    idolatryStanceEn: 'Guided by pure instinct; three nights prior to his conversion, he dreamt he was stumbling in pitch darkness until a radiant moon illuminated the path, with Abu Bakr and Ali preceding him. Hearing the Prophet\'s call, he recognized the divine light instantly.',
    wisdomAndPreIslamRoleAr: 'كان يبري السهام ويصنع القسي، فبرع في علم الرماية ودراسة الرياح والمسافات حتى صار أعظم رامي عرفته بلاد العرب.',
    wisdomAndPreIslamRoleEn: 'Crafted arrows and longbows from youth, mastering ballistic trajectories, wind physics, and marksmanship to become Arabia\'s legendary archer.',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بينه وبين سعد بن معاذ الأنصاري سيد الأوس، وكان لسعد بن أبي وقاص شرف الدفاع عن المدينة وحراسة النبي ﷺ في غزواته وسراياه.',
    hijrahAndBrotherhoodEn: 'Fraternized with Sa\'d ibn Mu\'adh, chief of the Aws tribe; served as royal bodyguard safeguarding the Prophet on campaigns.',
    prophetSacrificeAr: 'في ليلة من ليالي المدينة سهر النبي ﷺ وقال: «ليت رجلاً صالحاً يحرسني الليلة»، فسمع قعقعة السلاح فقال: «من هذا؟» قال: سعد يا رسول الله، جئت أحرسك! فدعا له النبي ونام قرير العين.',
    prophetSacrificeEn: 'One night the Prophet ﷺ stayed awake in Madinah wishing a righteous man would guard him. Hearing armor, he asked: "Who is that?" Sa\'d answered: "Sa\'d, O Messenger of Allah, come to guard you!" The Prophet prayed for him and slept peacefully.',
    quranicVerses: [
      {
        verseAr: '﴿وَإِن جَاهَدَاكَ لِتُشْرِكَ بِي مَا لَيْسَ لَكَ بِهِ عِلْمٌ فَلَا تُطِعْهُمَا ۖ وَصَاحِبْهُمَا فِي الدُّنْيَا مَعْرُوفًا﴾',
        verseEn: '"But if they endeavor to make you associate with Me that of which you have no knowledge, do not obey them but accompany them in this world with appropriate kindness."',
        surahAr: 'سورة لقمان: 15 (وسورة العنكبوت: 8)',
        surahEn: 'Surah Luqman: 15 & Surah Al-Ankabut: 8',
        contextAr: 'نزلت في سعد لما أضربت أمه عن الطعام والشراب ليرجع عن دينه فثبت على إيمانه وبر بأمه.',
        contextEn: 'Revealed regarding Sa\'d when his mother went on hunger strike; he stood firm in monotheism while continuing dutiful care.'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'علي بن أبي طالب رضي الله عنه',
        speakerEn: 'Ali ibn Abi Talib',
        quoteAr: '«ما سمعت رسول الله ﷺ يفدي أحداً بأبويه غير سعد بن أبي وقاص يوم أحد».',
        quoteEn: '"I never heard the Prophet ﷺ ransom both his parents for anyone except Sa\'d ibn Abi Waqqas at Uhud."'
      },
      {
        speakerAr: 'أمير المؤمنين عمر بن الخطاب رضي الله عنه',
        speakerEn: 'Umar ibn Al-Khattab',
        quoteAr: '«إن وليها سعد فذاك، وإلا فليستعن به الخليفة بعدي فإني لم أعزله عن عجز ولا خيانة، وإنما هو رجل مبارك مستجاب الدعوة».',
        quoteEn: '"If Sa\'d is chosen as Caliph, so be it; otherwise let the next Caliph seek his counsel, for I never dismissed him for weakness or dishonesty, but he is a blessed man whose prayers are answered."'
      }
    ],
    civilizationalImpactAr: [
      'كسر أقوى إمبراطورية طاغية في الشرق وفتح العراق وفارس وخراسان ونشر الإسلام في آسيا.',
      'تأسيس وتخطيط مدينة الكوفة كمركز حضاري عسكري وعلمي خرّج آلاف العلماء والقادة.',
      'اعتزال الفتنة الكبرى في عقيق المدينة حفظاً لدماء المسلمين ورفض المشاركة في الحرب الأهلية.',
      'ترسيخ أدبيات القيادة العسكرية القائمة على التوكل ودعاء الله وحسن إدارة الجند.'
    ],
    civilizationalImpactEn: [
      'Decisively toppled the Sasanian Persian empire, liberating Iraq and Central Asia for Islam.',
      'Engineered and founded the garrison city of Kufa, incubating thousands of scholars and jurists.',
      'Firmly withdrew from civil wars to his rural estate, upholding absolute non-violence among believers.',
      'Pioneered spiritual military doctrine blending prayer, logistical mastery, and ethical battlefield leadership.'
    ],
    eternalAdviceAr: '«يا بني، إذا طلبت الغنى فاطلبه بالقناعة فإنها مال لا ينفد، وإياك والطمع فإنه فقر حاضر، وعليك بالورع في مطعمك يستجب الله لك».',
    eternalAdviceEn: '"O my son, when you seek wealth, seek it through contentment, for it is a treasure that never depletes. Beware of greed, for it is immediate poverty, and purify your food so Allah answers your supplications."',
    spiritualLessonsAr: [
      'أثر طيب المكسب والمطعم الحلال في استجابة الدعوات وفتح أبواب السماء.',
      'الثبات على التوحيد ولو خالفك أقرب الأقربين مع الحفاظ على برهم والإحسان إليهم.',
      'الزهد في الدماء والمناصب عند وقوع الفتن والاعتصام بعبادة الله في الخلوات.'
    ],
    spiritualLessonsEn: [
      'The direct causal link between honest lawful sustenance and answered prayers.',
      'Uncompromising commitment to monotheism coupled with affectionate filial respect.',
      'Total restraint from shedding blood during political turmoil, seeking refuge in solitary worship.'
    ],
    leadershipLessonsAr: [
      'القيادة العسكرية الحكيمة بإدارة المعارك من الموقع الاستراتيجي حتى مع المرض الشديد.',
      'بناء المدن والمراكز الحيوية لحماية المكتسبات وضمان استقرار الدول.',
      'الثقة في الكفاءات الميدانية وتفويض المهام للقادة المؤهلين في ساحات الوغى.'
    ],
    leadershipLessonsEn: [
      'Strategic command from the optimal vantage post even while severely afflicted with illness.',
      'Urban planning and garrison city development to secure territorial frontiers.',
      'Trusting tactical field commanders and delegating operational maneuvers effectively.'
    ],
    modernApplicationAr: [
      'تحري الحلال الخالص في الرزق والمطعم والمشرب لضمان طهارة النفس والبركة.',
      'البر بالوالدين والإحسان إليهما حتى مع وجود خلافات فكرية أو دينية.',
      'الابتعاد عن الشقاق والفتن المجتمعية وحفظ اللسان عن الخوض في أعراض الناس.'
    ],
    modernApplicationEn: [
      'Meticulously verifying the ethical lawfulness of earnings and food for spiritual barakah.',
      'Honoring and cherishing parents with kindness regardless of generational differences.',
      'Refusing to participate in social polarization and strictly guarding the tongue.'
    ]
  },

  // 9. سعيد بن زيد
  'saeed-ibn-zayd': {
    companionId: 'saeed-ibn-zayd',
    lineageDetailsAr: 'سعيد بن زيد بن عمرو بن نفيل بن عبد العزى بن رياح بن عبد الله بن قرط بن رزاح بن عدي بن كعب القرشي العدوي، ابن عم عمر بن الخطاب، وزوج أخته فاطمة بنت الخطاب، وأبوه زيد بن عمرو بن نفيل الذي مات موحداً حنيفاً قبل البعثة وشهد له النبي ﷺ بأنه أمة وحده يبعث يوم القيامة.',
    lineageDetailsEn: 'Saeed ibn Zayd of Banu Adiy. First cousin of Umar ibn Al-Khattab and husband of Umar\'s sister Fatimah. His father Zayd ibn Amr ibn Nufayl was the famous pre-Islamic monotheist whom the Prophet ﷺ testified will be resurrected as an entire nation unto himself.',
    geographicalStations: [
      {
        placeAr: 'مكة المكرمة',
        placeEn: 'Makkah Al-Mukarramah',
        periodAr: 'المولد حتى الهجرة 1 هـ',
        periodEn: 'Birth until 1 AH',
        detailsAr: 'نشأ على التوحيد الفطري الموروث من أبيه، وأسلم مبكراً فكان بيته شعلة النور التي قادت عمر بن الخطاب للإسلام.',
        detailsEn: 'Raised on innate monotheism taught by his father; accepted Islam early, his home being the site of Umar\'s conversion.'
      },
      {
        placeAr: 'معركة اليرموك (الشام)',
        placeEn: 'Battle of Yarmouk',
        periodAr: '15 هـ',
        periodEn: '15 AH',
        detailsAr: 'قاد المشاة في قلب الجيش، وترجل عن فرسه وكسر فرسان الروم ببسالة حاسمة كانت مفتاح النصر.',
        detailsEn: 'Commanded the infantry center; dismounted to fight on foot, breaking the Byzantine heavy cavalry in heroic assault.'
      },
      {
        placeAr: 'دمشق',
        placeEn: 'Damascus (Syria)',
        periodAr: '14 هـ - 15 هـ',
        periodEn: '14 AH - 15 AH',
        detailsAr: 'أول والٍ ومحافظ مسلم لدمشق بعد فتحها، ثم اعتذر ليتفرغ للجهاد جندياً مرابطاً في سبيل الله.',
        detailsEn: 'Appointed first Muslim governor of conquered Damascus, but requested relief to remain a frontline soldier.'
      }
    ],
    dailyRoutineAr: 'كان يقضي نهاره في المرابطة والتدريب أو في بستانه بالمدينة يعيش من كد يمينه، فإذا دخل الليل خلا بمحرابه باكياً يتذكر صحبة النبي ﷺ، وكان قليل الظهور في مجالس السلاطين، يكره المناصب ويهرب من الإمارة مقبلاً على عبادة ربه متوكلاً عليه في كل أموره.',
    dailyRoutineEn: 'Lived as an ascetic frontiersman working his farm with his own hands. At night he wept in solitary prayer remembering his days with the Prophet. He shunned royal courts, refused political titles, and focused on silent worship.',
    uniqueDistinctionsAr: [
      'ابن الموحّد الحنيف زيد بن عمرو بن نفيل الذي لم يسجد لصنم ولم يأكل ميتة وبحث عن دين إبراهيم.',
      'السبب المباشر في إسلام الفاروق عمر بن الخطاب بثباته وثبات زوجته فاطمة بنت الخطاب.',
      'أحد العشرة المبشرين بالجنة، وأحد السابقين الأولين في دار الأرقم.',
      'أول والٍ على دمشق الفيحاء بعد فتحها في التاريخ الإسلامي ثم تنازل عنها زهداً.',
      'مستجاب الدعوة؛ استجاب الله دعاءه المشهور على أروى بنت أوس التي ادعت على أرضه ظلماً.'
    ],
    uniqueDistinctionsEn: [
      'Son of Zayd ibn Amr, the pre-Islamic monotheist who refused idol meat and traveled seeking Abraham\'s faith.',
      'The direct catalyst for Umar ibn Al-Khattab\'s conversion through his courage under Umar\'s fury.',
      'One of the Ten Promised Paradise and early pioneer from the Dar Al-Arqam days.',
      'First governor of Damascus after its opening, resigning out of pure spiritual asceticism.',
      'Miraculously answered in prayer against Arwa bint Aws who falsely encroached upon his land.'
    ],
    idolatryStanceAr: 'ورث بغض الأصنام عن أبيه زيد بن عمرو بن نفيل؛ فكان يرى الأصنام حجارة صماء لا تضر ولا تنفع، ونشأ على دين الحنيفية ملة إبراهيم فكان إسلامه استجابة طبيعية لما كان يبحث عنه.',
    idolatryStanceEn: 'Inherited fierce contempt for idols from his father. Viewing pagan statues as deaf stone, he adhered to Abrahamic monotheism from birth; accepting Islam was the natural realization of his life\'s quest.',
    wisdomAndPreIslamRoleAr: 'عُرف بطهارة السيرة والنبل في بني عدي، وكان من الفتيان القلائل الذين تمسكوا بمكارم الأخلاق وعفة اللسان في مجتمع جاهلي غارق في المفاسد.',
    wisdomAndPreIslamRoleEn: 'Celebrated for pristine moral dignity in Banu Adiy, remaining a rare beacon of refined virtue in a society mired in pagan vices.',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بينه وبين رافع بن مالك الأنصاري، وكان رسول الله ﷺ قد بعثه مع طلحة بن عبيد الله قبل بدر يتحسسان أخبار عير قريش، فضرب لهما النبي بسهمهما وأجرهما كمن شهد بدراً.',
    hijrahAndBrotherhoodEn: 'Fraternized with Rafi ibn Malik. Prior to Badr, the Prophet dispatched him and Talha to scout the caravan; the Prophet awarded them full shares and rewards of Badr participants.',
    prophetSacrificeAr: 'ثبت في المشاهد كلها كأحد فرسان الصدمة، وكان يضع نفسه دائماً في المواقع الأكثر خطورة طلباً للشهادة وحماية لرسول الله ﷺ والدعوة.',
    prophetSacrificeEn: 'Stood heroically in all campaigns as an elite shock-infantry warrior, intentionally volunteering for high-risk vanguard duties to protect the Prophet.',
    quranicVerses: [
      {
        verseAr: '﴿وَالسَّابِقُونَ الْأَوَّلُونَ مِنَ الْمُهَاجِرِينَ وَالْأَنصَارِ وَالَّذِينَ اتَّبَعُوهُم بِإِحْسَانٍ رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ﴾',
        verseEn: '"And the first forerunners [in the faith] among the Muhajireen and the Ansar and those who followed them with good conduct - Allah is pleased with them and they are pleased with Him."',
        surahAr: 'سورة التوبة: 100',
        surahEn: 'Surah At-Tawbah: 100',
        contextAr: 'سعيد بن زيد من أوائل السابقين المهاجرين الذين شملتهم هذه البشارة القرآنية العظيمة برضوان الله وجناته.',
        contextEn: 'Saeed is among the earliest vanguard of Muhajireen explicitly promised Allah\'s eternal pleasure.'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'أمير المؤمنين عمر بن الخطاب رضي الله عنه',
        speakerEn: 'Umar ibn Al-Khattab',
        quoteAr: '«كان سعيد بن زيد خيراً مني وأسبق إلى كل فضل، به هداني الله للإسلام ولثباته وثبات أخته فاطمة».',
        quoteEn: '"Saeed ibn Zayd was better than me and earlier to every virtue; through him and his wife Fatimah Allah guided me to Islam."'
      },
      {
        speakerAr: 'عبد الله بن عمر رضي الله عنهما',
        speakerEn: 'Abdullah ibn Umar',
        quoteAr: '«توفي عمي سعيد بن زيد يوم الجمعة فغسله سعد بن أبي وقاص وكفنه، وما رأيت أحداً أزهد في الدنيا ولا أشد خوفاً من الله منه».',
        quoteEn: '"My uncle Saeed passed away on Friday; Sa\'d washed and shrouded him. I never saw anyone more detached from this world or more God-fearing."'
      }
    ],
    civilizationalImpactAr: [
      'حسم ملحمة اليرموك بترجله وبسالته كقائد لقلب الجيش مما فتح بلاد الشام قاطبة.',
      'إرساء معايير الحاكم الزاهد؛ تنازل عن ولاية دمشق مؤثراً الرباط كجندي مخلص في الثغور.',
      'حفظ ونقل أحاديث فضائل الصحابة والعشرة المبشرين بالجنة وتوثيقها للأجيال.',
      'تجسيد مبدأ الابتعاد عن الفتنة والاعتصام بالحق والعدالة دون التطلع للمكاسب الدنيوية.'
    ],
    civilizationalImpactEn: [
      'Decisively broke the Byzantine front at Yarmouk on foot, liberating the Levant.',
      'Set the standard of selfless governance by resigning the governorship of Damascus to serve as a sentry.',
      'Preserved and narrated the definitive hadith of the Ten Promised Paradise for posterity.',
      'Exemplified total withdrawal from civil strife, prioritizing spiritual rectitude over political spoils.'
    ],
    eternalAdviceAr: '«إياكم ومحقرات الذنوب، واعلموا أن مشهد رجل غبرت قدماه في سبيل الله خير من عبادة دهر، واطلبوا رضا الله بإخفاء طاعتكم كما تخفون خطاياكم».',
    eternalAdviceEn: '"Beware of belittling small sins. A single hour with dusty feet in the cause of Allah is greater than lifelong rituals. Seek Allah\'s pleasure by concealing your good deeds just as you conceal your sins."',
    spiritualLessonsAr: [
      'بركة البيئة الموحدة؛ أثر توحيد والده زيد بن عمرو في نشأته على الفطرة السليمة.',
      'التواضع الشديد وكتمان المناقب؛ كتم بشارته بالجنة حتى ألح عليه الصحابة والتابعون.',
      'اليقين في عدالة الله؛ استجابة دعوته على من ظلمته ليعلم الناس أن الظلم ظلمات.'
    ],
    spiritualLessonsEn: [
      'The blessing of a monotheistic home; his father\'s quest for truth preserved his pure instinct.',
      'Deep humility, concealing his personal promise of Paradise until pressed by companions.',
      'Certainty in divine justice, demonstrating that oppression brings ruin upon the oppressor.'
    ],
    leadershipLessonsAr: [
      'تفضيل الميدان والخدمة الحقيقية على كراسي الحكم والمناصب البراقة.',
      'الثبات في أصعب لحظات القتال وتحويل التراجع إلى هجوم مظفر.',
      'الترفع عن استغلال النفوذ القرابي؛ كان ابن عم عمر وصهره ولم يطلب منه منصباً قط.'
    ],
    leadershipLessonsEn: [
      'Prioritizing frontline service over comfortable bureaucratic chairs.',
      'Steadfast valor during battlefield crises, turning retreats into triumphs.',
      'Refusing to leverage family connections, never requesting favors from his cousin Caliph Umar.'
    ],
    modernApplicationAr: [
      'التواضع وترك التباهي بالإنجازات والحرص على إخلاص العمل لله تعالى.',
      'الترفع عن المناصب إذا وجد المرء في نفسه ميلاً للراحة على حساب المصلحة العامة.',
      'الحذر الشديد من ظلم الآخرين أو التعدي على حقوقهم وأموالهم وأراضيهم.'
    ],
    modernApplicationEn: [
      'Practicing quiet humility, shunning self-promotion, and dedicating work purely for God.',
      'Stepping aside from titles when one\'s contribution is greater in service rather than administration.',
      'Exercising extreme caution against encroaching on the rights, properties, and honor of others.'
    ]
  },

  // 10. أبو عبيدة بن الجراح
  'abu-ubaydah-ibn-al-jarrah': {
    companionId: 'abu-ubaydah-ibn-al-jarrah',
    lineageDetailsAr: 'عامر بن عبد الله بن الجراح بن هلال بن أهيب بن ضبة بن الحارث بن فهر بن مالك القرشي الفهري، يلتقي مع النبي ﷺ في جده العاشر فهر بن مالك، وأمه أميمة بنت عثمان بن جابر الفهرية أسلمت، وهو أحد العشرة المبشرين بالجنة وقائد جيوش الفتح في بلاد الشام.',
    lineageDetailsEn: 'Amir ibn Abdullah ibn Al-Jarrah of Banu Al-Harith ibn Fihr of Quraysh, meeting the Prophet\'s lineage at Fihr. His mother Umaymah accepted Islam. One of the Ten Promised Paradise and supreme commander of the Levant campaigns.',
    geographicalStations: [
      {
        placeAr: 'مكة المكرمة',
        placeEn: 'Makkah Al-Mukarramah',
        periodAr: 'المولد حتى الهجرة إلى الحبشة',
        periodEn: 'Birth until Abyssinia',
        detailsAr: 'أسلم صبيحة إسلام أبي بكر الصديق في دار الأرقم، وهاجر إلى الحبشة ثم عاد ليرافق النبي في مسيرته.',
        detailsEn: 'Accepted Islam the morning after Abu Bakr at Dar Al-Arqam; migrated to Abyssinia before joining the Prophet.'
      },
      {
        placeAr: 'بلاد الشام',
        placeEn: 'The Levant (Syria/Palestine)',
        periodAr: '13 هـ - 18 هـ',
        periodEn: '13 AH - 18 AH',
        detailsAr: 'القائد العام لجيوش المسلمين، فتح دمشق وحمص وحلب وأنطاكية وبيت المقدس وأدار البلاد بعدالة وأمانة.',
        detailsEn: 'Supreme commander liberating Damascus, Homs, Aleppo, Antioch, and Jerusalem with incorruptible justice.'
      },
      {
        placeAr: 'عمواس (الأردن)',
        placeEn: 'Amwas (Jordan)',
        periodAr: '18 هـ',
        periodEn: '18 AH',
        detailsAr: 'أصابه طاعون عمواس فرفض مغادرة جنده والفرار بنفسه حتى توفاه الله شهيداً ودُفن في غور الأردن.',
        detailsEn: 'Struck by the plague of Amwas, refusing Caliph Umar\'s invitation to escape, dying as a martyr among his troops.'
      }
    ],
    dailyRoutineAr: 'كان يعيش في خيمته كأفقر جندي في الجيش؛ لا يملك إلا سيفاً وترساً وقربة ماء وكسرات خبز يابسة، ويبدأ نهاره بتفقد خطوط الجبهة ورعاية المصابين وتقسيم الأقوات بالسوية، ويقضي ليله باكياً يناجي ربه متذكراً رسول الله ﷺ، وكان ليّن العريكة متواضعاً إذا رآه الغريب لم يميزه عن سائر جنده.',
    dailyRoutineEn: 'Lived in his commander tent with only a sword, shield, waterskin, and dry crusts. Inspected frontlines at dawn, tended to wounded troops, distributed equal rations, wept all night in prayer, and remained so unpretentious that strangers could not distinguish him from an ordinary private.',
    uniqueDistinctionsAr: [
      'أمين الأمة بشهادة النبي ﷺ الخالدة: «إِنَّ لِكُلِّ أُمَّةٍ أَمِينًا، وَإِنَّ أَمِينَنَا أَيَّتُهَا الأُمَّةُ أَبُو عُبَيْدَةَ بْنُ الجَرَّاحِ».',
      'نزع حلقتي المغفر عن وجنتي النبي ﷺ يوم أحد بأسنانه حتى سقطت ثناياه فصار أحسن الناس هتماً.',
      'القائد الذي تنازل له خالد بن الوليد وعمل تحت رايته بكل محبة وتناغم نادر بين عظماء التاريخ.',
      'تمنى عمر بن الخطاب وهو يحتضر بيتاً ملؤه رجال مثل أبي عبيدة ليوليهم أمر المسلمين.'
    ],
    uniqueDistinctionsEn: [
      'The Trustworthy of the Ummah: "Every nation has a trustworthy guardian, and our trustworthy guardian, O Ummah, is Abu Ubaydah ibn Al-Jarrah."',
      'Pulled out the iron chainmail links embedded in the Prophet\'s cheeks at Uhud using his teeth, losing his front teeth in the act.',
      'Led the Levantine forces with Khalid ibn Al-Walid serving harmoniously beneath his banner.',
      'Umar ibn Al-Khattab on his deathbed lamented: "If Abu Ubaydah were alive, I would have appointed him Caliph without hesitation."'
    ],
    idolatryStanceAr: 'نشأ على كمال المروءة وطهارة النفس؛ فلما رأى ضلال عبادة الأصنام ونفاق قريش انصرف عنها باحثاً عن الصدق، فكان من أسرع الناس تصديقاً للنبي ﷺ لما دعاه.',
    idolatryStanceEn: 'Endowed with pristine dignity; appalled by idolatry and tribal duplicity, he embraced the Prophet\'s call without a moment of hesitation.',
    wisdomAndPreIslamRoleAr: 'عُرف بالحلم والأمانة ووداعة الطبع في قريش، وكان محبباً لجميع البطون لعدم تورطه في الخصومات والمظالم.',
    wisdomAndPreIslamRoleEn: 'Cherished across Quraysh for calm gentleness and immaculate trustworthiness, staying free from tribal blood-feuds.',
    hijrahAndBrotherhoodAr: 'آخى النبي ﷺ بينه وبين سعد بن معاذ (وفي رواية محمد بن مسلمة)، وكان النبي ﷺ إذا بعث سريّة وأراد أن يؤمّر عليها أصلح الناس أمّر أبا عبيدة، كسرية سيف البحر ووفد نجران.',
    hijrahAndBrotherhoodEn: 'Fraternized with Muhammad ibn Maslamah. Chosen by the Prophet to command delicate missions, including the Expedition of the Sea Shore and the embassy of Najran.',
    prophetSacrificeAr: 'في أحد لما غارت حلقتا المغفر في وجنة النبي ﷺ، أقسم أبو عبيدة على أبي بكر أن يدعه ينتزعهما، فكره أن ينتزعهما بيده فيؤذي النبي، فعض عليهما بثنيتيه عضاً شديداً حتى انتزعهما وسقطت ثنيتاه معهما فداءً للنبي.',
    prophetSacrificeEn: 'At Uhud when helmet rings penetrated the Prophet\'s face, Abu Ubaydah begged Abu Bakr to let him extract them. Fearing to cause pain with his hands, he clamped his front teeth onto the rings, wrenching them free at the cost of his teeth.',
    quranicVerses: [
      {
        verseAr: '﴿لَّا تَجِدُ قَوْمًا يُؤْمِنُونَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ يُوَادُّونَ مَنْ حَادَّ اللَّهَ وَرَسُولَهُ وَلَوْ كَانُوا آبَاءَهُمْ أَوْ أَبْنَاءَهُمْ أَوْ إِخْوَانَهُمْ أَوْ عَشِيرَتَهُمْ﴾',
        verseEn: '"You will not find a people who believe in Allah and the Last Day having affection for those who oppose Allah and His Messenger, even if they were their fathers or their sons or their brothers or their clan."',
        surahAr: 'سورة المجادلة: 22',
        surahEn: 'Surah Al-Mujadila: 22',
        contextAr: 'ذكر المفسرون أنها نزلت في أبي عبيدة بن الجراح لما تصدى لأبيه المشرك عبد الله بن الجراح يوم بدر حين كان يتربص بقتل النبي ﷺ.',
        contextEn: 'Exegetes report this was revealed regarding Abu Ubaydah when his pagan father targeted him at Badr, choosing faith over kinship.'
      }
    ],
    extraTestimonies: [
      {
        speakerAr: 'أمير المؤمنين عمر بن الخطاب رضي الله عنه',
        speakerEn: 'Umar ibn Al-Khattab',
        quoteAr: '«لو كان أبو عبيدة حياً لاستخلفته، فإن سألني ربي قلت: استخلفتُ أمين الله وأمين رسوله».',
        quoteEn: '"If Abu Ubaydah were alive, I would have appointed him Caliph; if my Lord questioned me, I would answer: I appointed the trustee of Allah and His Messenger."'
      },
      {
        speakerAr: 'سيف الله خالد بن الوليد رضي الله عنه',
        speakerEn: 'Khalid ibn Al-Walid',
        quoteAr: '«ما على الأرض رجل أحب إلي أن أكون تحت لواء قيادته من أبي عبيدة بن الجراح».',
        quoteEn: '"There is no man on the face of the earth under whose banner I would rather serve than Abu Ubaydah ibn Al-Jarrah."'
      }
    ],
    civilizationalImpactAr: [
      'قيادة فتوحات الشام الكبرى وإرساء نموذج الحكم العادل الذي جعل نصارى الشام يفضلون حكم المسلمين على الروم.',
      'تجسيد منتهى النزاهة الإدارية والمالية؛ عاش ومات ولم يتملك شبراً من أرض الشام ولا ديناراً من أموالها.',
      'إدارة أزمة طاعون عمواس بثبات وإيثار، ورفضه النجاة بنفسه دون جنوده ورعيته.',
      'إشاعة روح الأخوة والتواضع بين القادة؛ أدار الجيوش بالتنسيق مع خالد وعمرو وشرحبيل بروح الفريق الواحد.'
    ],
    civilizationalImpactEn: [
      'Liberated the Levant with such integrity that local Christians openly preferred Muslim justice over Byzantine extortion.',
      'Exemplified total fiscal incorruptibility, leaving neither land nor gold behind after ruling empires.',
      'Managed the catastrophic plague of Amwas with boundless solidarity, refusing to evacuate while his troops suffered.',
      'Fostered seamless cohesion among legendary commanders, coordinating with Khalid, Amr, and Shurahbil harmoniously.'
    ],
    eternalAdviceAr: '«ألا رب مبيض لثيابه مدنس لدينه! ألا رب مكرم لنفسه وهو لها مهين! بادروا بالعمل الصالح قبل هجوم الأجل، واعلموا أن الدنيا دار ممر والآخرة دار مقر».',
    eternalAdviceEn: '"Beware! How many bleach their garments while soiling their faith! How many pamper their body while humiliating their soul! Rush to righteous deeds before lifespans end; this world is a transit station, and the Hereafter is the eternal abode."',
    spiritualLessonsAr: [
      'الأمانة المطلقة التي تجعل صاحبها أهلاً لثقة السماء وثقة رسول الله والأمة بأسرها.',
      'إنكار الذات والإيثار النادر؛ قيادة الجيوش العظمى دون أدنى كبر أو استعلاء.',
      'الوفاء والمسؤولية القيادية الأخلاقية؛ رفض ترك رعيته في الطاعون والبقاء معهم حتى الرمق الأخير.'
    ],
    spiritualLessonsEn: [
      'Absolute trustworthiness that commands divine recognition and universal respect.',
      'Sublime self-effacement, commanding superpower armies without an ounce of arrogance.',
      'Ethical solidarity, choosing to suffer alongside troops in pestilence rather than fleeing to safety.'
    ],
    leadershipLessonsAr: [
      'القيادة بالقدوة والعيش في نفس مستوى معيشة الجند والضعفاء.',
      'القدرة على احتواء الشخصيات القيادية القوية كخالد بن الوليد وتوجيه طاقاتها للنصر.',
      'العدالة مع غير المسلمين والوفاء بالمعاهدات بدقة متناهية.'
    ],
    leadershipLessonsEn: [
      'Leading by direct personal example, sharing the exact hardships of ordinary infantry.',
      'Harmoniously integrating brilliant strong-willed personalities like Khalid toward collective triumph.',
      'Flawless treaty compliance and benevolence toward non-Muslim communities.'
    ],
    modernApplicationAr: [
      'أداء الأمانة في الوظائف والمسؤوليات الحكومية والخاصة دون تفريط أو محاباة.',
      'التواضع مع المرؤوسين ومشاركتهم الصعاب وبناء بيئة عمل قائمة على التقدير المتبادل.',
      'الصدق والوفاء بالوعود والعقود في كافة المجالات التجارية والإدارية.'
    ],
    modernApplicationEn: [
      'Practicing rigorous fiduciary integrity in corporate and public offices without favoritism.',
      'Showing humility toward subordinates, sharing workloads, and cultivating team camaraderie.',
      'Honoring commitments, contracts, and promises with uncompromising fidelity.'
    ]
  }
};

export const getCompanionExtraSections = (companionId: string): CompanionExtraSections | undefined => {
  return COMPANIONS_EXTRA_DATA[companionId];
};
