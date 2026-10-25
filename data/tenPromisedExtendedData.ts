export interface HeroicStance {
  id: string;
  companionId: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  periodAr: string;
  periodEn: string;
  storyAr: string;
  storyEn: string;
  impactAr: string;
  impactEn: string;
  quoteAr?: string;
  quoteEn?: string;
}

export interface CompanionTraits {
  companionId: string;
  physicalAppearanceAr: string;
  physicalAppearanceEn: string;
  worshipAndDevotionAr: string;
  worshipAndDevotionEn: string;
  familyAndLineageAr: string;
  familyAndLineageEn: string;
  specialSkillsAr: string[];
  specialSkillsEn: string[];
}

export interface WisdomQuote {
  companionId: string;
  quoteAr: string;
  quoteEn: string;
  contextAr: string;
  contextEn: string;
}

// -------------------------------------------------------------
// 1. ملامح وشمائل وأسرة الصحابة الكرام (Traits & Family)
// -------------------------------------------------------------
export const COMPANIONS_TRAITS_MAP: Record<string, CompanionTraits> = {
  'abu-bakr': {
    companionId: 'abu-bakr',
    physicalAppearanceAr: 'كان رضي الله عنه رجلاً أبيض نحيفاً خفيف العارضين (قليل شعر الخدين)، معروق الوجه، غائر العينين، ناتئ الجبهة، عاري الأشاجع (ظاهرة مفاصل أصابعه)، يخضب شيب لحيته وشعره بالحناء والكتم فيعلوه احمرار بهي، مهيب الطلعة يعلوه النور والسكينة.',
    physicalAppearanceEn: 'He was fair-skinned, slender, with deep-set eyes, a prominent forehead, and dyed his beard and hair with henna and katam, giving it an illuminating distinguished glow with profound tranquility.',
    worshipAndDevotionAr: 'كان بكّاءً رقيق القلب لا يملك دمعه إذا تلا القرآن، وكان يصوم النوافل ويكثر الصدقة، وما رُئي إلا ذاكراً أو مصلياً أو معيناً لمكروب، وقد قال فيه النبي ﷺ: «من أصبح منكم اليوم صائماً؟ قال أبو بكر: أنا... فقال ﷺ: ما اجتمعن في امرئ إلا دخل الجنة».',
    worshipAndDevotionEn: 'He was renowned for weeping profusely out of fear and awe of Allah while reciting the Quran. He consistently fasted voluntarily, gave continuous charity, and was ceaselessly engaged in worship and aiding the distressed.',
    familyAndLineageAr: 'تزوج من قتيلة بنت عبد العزى (أم أسماء وعبد الله)، وأم رومان (أم عائشة أم المؤمنين وعبد الرحمن)، وأسماء بنت عميس (أم محمد)، وحبيبة بنت خارجة (أم أم كلثوم). وله مصاهرة عظيمة بزواج رسول الله ﷺ من ابنته الصديقة عائشة رضي الله عنها.',
    familyAndLineageEn: 'Father of Mother of the Believers Aisha (R.A.) and Asma of the Two Girdles. Married Qutaylah, Umm Ruman, Asma bint Umays, and Habibah bint Kharijah, yielding a blessed lineage of scholars and heroes.',
    specialSkillsAr: ['أعلم قريش بالأنساب والتاريخ', 'فراسة الحكمة والقيادة', 'التجارة والاقتصاد النزيه', 'إدارة الأزمات والصلح بين الناس'],
    specialSkillsEn: ['Master genealogist of Arabia', 'Profound insight & crisis leadership', 'High-level ethical commerce', 'Tribal mediation & diplomacy']
  },
  'umar-ibn-khattab': {
    companionId: 'umar-ibn-khattab',
    physicalAppearanceAr: 'كان رضي الله عنه رجلاً طوالاً جسيماً مشرفاً على الناس كأنه راكب وهم يمشون، أبيض مشرباً بحمرة، حسن اللحية والشارب، أصلع الرأس خفيف الشعر، جهوري الصوت قوي البنية سريع المشية، إذا تكلم أسمع، وإذا مشى أسرع، وإذا ضرب أوجع.',
    physicalAppearanceEn: 'Towering in stature, heavily built, appearing taller than crowds around him. Fair complexion with a rosy hue, bald on top, with a commanding resonant voice and swift decisive stride.',
    worshipAndDevotionAr: 'كان يحيي الليل كله صلاة وبكاء، حتى حُفر في خديه خطان أسودان من كثرة الدموع، وكان يعسّ بالليل يتفقد الأرامل والأيتام، وإذا قرأ آية من كتاب الله غُشي عليه حتى يُعاد أياماً كما يُعاد المريض من خشية الله.',
    worshipAndDevotionEn: 'He spent entire nights in tearful prayers until two dark tear trails were etched on his cheeks. Reciting verses of divine warnings would shake him to the core, causing him to fall bedridden with awe of Allah.',
    familyAndLineageAr: 'تزوج من زينب بنت مظعون (أم عبد الله وحفصة أم المؤمنين وعبد الرحمن)، وأم كلثوم بنت علي بن أبي طالب وفاطمة الزهراء، وجميلة بنت ثابت، وعاتكة بنت زيد. صاهر النبي ﷺ بزواج حبيبته حفصة، وله ذرية من أئمة العلم كابن عمر.',
    familyAndLineageEn: 'Father of Mother of the Believers Hafsah (R.A.) and great jurist Abdullah ibn Umar. Married Zaynab bint Maz\'un, Umm Kulthum bint Ali and Fatimah, Jamilah bint Thabit, and Atikah bint Zayd.',
    specialSkillsAr: ['الدهاء الإداري وتأسيس الدواوين', 'الفروسية والمناظرة الدبلوماسية', 'القضاء والحكمة التشريعية', 'التخطيط الاستراتيجي العسكري'],
    specialSkillsEn: ['Statecraft & institutional governance', 'Horsemanship & diplomacy', 'Judicial acumen & jurisprudence', 'Grand military strategy']
  },
  'uthman-ibn-affan': {
    companionId: 'uthman-ibn-affan',
    physicalAppearanceAr: 'كان رضي الله عنه من أجمل قريش وأبهى الناس وجهاً، ربعة في القامة ليس بالقصير ولا بالطويل، حسن البشرة رقيقها، كثير شعر الرأس واللحية جعدهما ذهبي السمت، أسنانه مفلجة تلمع كاللؤلؤ، يعلوه بهاء الحياء والنور.',
    physicalAppearanceEn: 'Among the most handsome men of Quraysh, of medium stature, fair-skinned, with thick luminous beard and hair, perfectly aligned bright teeth, radiating overwhelming aura of modesty and angelic light.',
    worshipAndDevotionAr: 'كان صوّاماً بالنهار قوّاماً بالليل، يختم القرآن الكريم في ركعة واحدة بالوتر في جوف الكعبة، وكان شديد الحياء لا يرفع بصره، دائم الاستغفار والذكر، وكان عظيم الإخبات لكتاب الله يرويه بدمعه.',
    worshipAndDevotionEn: 'He fasted almost every day and spent whole nights in standing prayer, frequently finishing the entire Holy Qur\'an in a single Witr prayer unit inside the Ka\'bah, weeping over its divine passages.',
    familyAndLineageAr: 'تزوج ابنتي رسول الله ﷺ: رقية فولدت له عبد الله، ثم بعد وفاتها أم كلثوم، وتزوج فاختة بنت غزوان، وأم عمرو بنت جندب، ونائلة بنت الفرافصة الكلبية التي دافعت عنه بكفها يوم استشهاده حتى قُطعت أصابعها.',
    familyAndLineageEn: 'Married two daughters of the Prophet ﷺ: Ruqayyah (bore Abdullah) and Umm Kulthum; later married Na\'ilah bint Al-Farafisa who heroically shielded him during the final siege.',
    specialSkillsAr: ['إدارة التجارة والأوقاف الكبرى', 'الكتابة وتدوين المصاحف', 'الحلم والصبر اللامتناهي', 'السخاء والإنفاق الاستراتيجي'],
    specialSkillsEn: ['Macroeconomics & public endowments', 'Calligraphy & Quranic compilation', 'Unbounded forbearance & patience', 'Philanthropy & strategic welfare']
  },
  'ali-ibn-abi-talib': {
    companionId: 'ali-ibn-abi-talib',
    physicalAppearanceAr: 'كان رضي الله عنه ربعة إلى القصر، عريض المنكبين ضخم البطن والكتفين، أدعج العينين (شديدتا السواد والاتساع)، أصلع الرأس ذو لحية بيضاء كثة عريضة تملأ صدره، قوي الساعدين كأنهما حديد، إذا مسك ذراع رجل أمسك بنَفَسه.',
    physicalAppearanceEn: 'Broad-shouldered, powerfully muscular with piercing dark eyes, broad white beard cascading to his chest, with immense physical strength and lightning-fast agility on the battlefield.',
    worshipAndDevotionAr: 'كان إمام الزاهدين وسيد البلغاء، يقوم الليل في محرابه قابضاً على لحيته يتململ تململ السليم ويبكي بكاء الحزين وهو يقول: «يا دنيا، غرّي غيري! قد طلقتك ثلاثاً لا رجعة فيها، فعمرك قصير، وخطرك كبير، آه من قلة الزاد وبعد السفر!».',
    worshipAndDevotionEn: 'Supreme ascetic who spent his nights weeping in the prayer niche, clutching his beard and pleading: "O worldly life! Tempt someone else! I have divorced you thrice. Ah, how meager is the provision and how distant the journey!"',
    familyAndLineageAr: 'ابن عم رسول الله ﷺ، وزوج سيدة نساء العالمين فاطمة الزهراء رضي الله عنها، وأبو السبطين سيدي شباب أهل الجنة: الحسن والحسين، وزينب وأم كلثوم، وتزوج بعد فاطمة من أم البنين فاطمة الكلابية وأسماء بنت عميس وليلى بنت مسعود.',
    familyAndLineageEn: 'Cousin of the Prophet ﷺ and husband of Fatimah Az-Zahra. Father of the masters of the youth of Paradise: Al-Hasan and Al-Husayn, along with Zaynab, Umm Kulthum, and Al-Abbas.',
    specialSkillsAr: ['قمة الشجاعة والفروسية والمبارزة', 'أقضى الصحابة وأفقههم في المعضلات', 'سيد البلاغة والفصاحة والشعر', 'الزهد التام وعزة النفس'],
    specialSkillsEn: ['Unmatched warrior prowess & dueling', 'Master jurist & peerless arbitrator', 'Supreme eloquence & rhetoric', 'Profound detachment from worldly power']
  },
  'talha-ibn-ubaydillah': {
    companionId: 'talha-ibn-ubaydillah',
    physicalAppearanceAr: 'كان رضي الله عنه رجلاً أبيض مشرباً بحمرة، حسن الوجه بسام المحيا، جعد الشعر ليس بالقصير ولا بالطويل، ضخم الصدر بعيد ما بين المنكبين، ندي الكف واسع الجبين يعلوه بهاء الكرم والشرف القرشي التيمي.',
    physicalAppearanceEn: 'Fair complexion with reddish undertones, radiating a warm smiling demeanor, broad-chested, robust build with an aura of regal Arabian generosity and valor.',
    worshipAndDevotionAr: 'كان كثير الصلاة والذكر، متبتلاً في مواسم الخيرات، يرى أن شكر النعمة هو بثها في عباد الله، فكان يقضي الليل ساجداً شاكراً ربه، وينفق المئات من الآلاف صباحاً دون أن يدخر لنفسه سوى كسوته وطعامه.',
    worshipAndDevotionEn: 'A devoted worshiper who regarded wealth solely as a trust to be distributed to Allah\'s servants, spending entire nights prostrating and dispersing fortunes in the morning without keeping a dirham.',
    familyAndLineageAr: 'تزوج من حمنة بنت جحش (أخت زينب أم المؤمنين)، وأم كلثوم بنت أبي بكر الصديق، وسُعدى بنت عوف، وخولة بنت القعقاع. ومن أنجاله القائد الشهيد محمد بن طلحة (المعروف بالسجّاد لعبادته).',
    familyAndLineageEn: 'Married Hamnah bint Jahsh, Umm Kulthum bint Abi Bakr, and Su\'da bint Awf. Father of pious scholar Muhammad ibn Talha (known as As-Sajjad for ceaseless prostrations).',
    specialSkillsAr: ['الفدائية والبسالة العسكرية النادرة', 'السخاء والإنفاق اللامحدود', 'التجارة الموسعة والأمانة', 'رعاية الأرامل والأيتام والعلماء'],
    specialSkillsEn: ['Heroic shield combat & self-sacrifice', 'Legendary open-handed philanthropy', 'Large-scale ethical enterprise', 'Patronage of vulnerable families']
  },
  'az-zubayr-ibn-al-awwam': {
    companionId: 'az-zubayr-ibn-al-awwam',
    physicalAppearanceAr: 'كان رضي الله عنه رجلاً طويلاً ممتلئاً كأنه راكب إذا جلس مع الناس، أسمر اللون خفيف اللحية، قوي البنية شديد البطش، يلبس عمامة صفراء في ساحات الوغى وكان جبريل ينزل على هيئته وصورته.',
    physicalAppearanceEn: 'Tall and imposing, deeply athletic with a light beard, formidable strength, known for wearing a distinctive bright yellow turban in combat resembling Angel Jibril.',
    worshipAndDevotionAr: 'كان له خبء من عمل صالح لا يعلمه إلا الله، كثير التبتل وصيام الهواجر، وكان إذا سمع موعظة عن القيامة بكى حتى يُسمع نشيجه، ويقول لابنه عبد الله: «والله ما أصابتني ضربة ولا طعنة إلا مع رسول الله ﷺ وفي سبيل الله».',
    worshipAndDevotionEn: 'Maintained hidden pious deeds known only to Allah, frequently fasted in blistering heat, and wept uncontrollably when reflecting upon the Hereafter. His body bore dozens of scars from shielding Islam.',
    familyAndLineageAr: 'ابن عمة رسول الله ﷺ صفية بنت عبد المطلب، وزوج ذات النطاقين أسماء بنت أبي بكر الصديق، ووالد عبد الله بن الزبير أول مولود للمهاجرين بالمدينة وأحد كبار القادة والفقهاء، وعروة بن الزبير أحد فقهاء المدينة السبعة.',
    familyAndLineageEn: 'Son of the Prophet\'s aunt Safiyyah bint Abd Al-Muttalib, husband of Asma bint Abi Bakr, and father of Abdullah ibn Az-Zubayr and prominent jurist Urwah ibn Az-Zubayr.',
    specialSkillsAr: ['القتال بالسيفين معاً وهو راكب الفرس', 'شجاعة الاقتحام الفردي للحصون', 'المخابرات والاستطلاع العسكري الدقيق', 'التوكل المطلق على الله في الديون والشدائد'],
    specialSkillsEn: ['Dual-sword equestrian combat', 'Solo fortress breach operations', 'Master military reconnaissance', 'Supreme reliance on Allah in adversity']
  },
  'abdur-rahman-ibn-awf': {
    companionId: 'abdur-rahman-ibn-awf',
    physicalAppearanceAr: 'كان رضي الله عنه رجلاً أبيض مشرباً حمرة، حسن الوجه، رقيق البشرة، عظيم الهامة، عريض المنكبين، طويل القامة، أعرج إثر جرح أصابه يوم أحد في ساقه، وأهتم سقطت ثنيتاه يوم أحد دفاعاً عن رسول الله ﷺ.',
    physicalAppearanceEn: 'Fair-skinned with handsome features, broad-shouldered, tall, with a limp in his leg and missing front teeth suffered while defending the Prophet ﷺ heroically at Uhud.',
    worshipAndDevotionAr: 'كان يخاف ثروته خوفاً عظيماً، فكان يبكي إذا وُضع بين يديه الطعام الفاخر متذكراً مصعب بن عمير وحمزة اللذين استشهدا ولم يجدا ما يُكفنان به، وكان يكثر من عتق الرقاب وصلاة الليل وإطعام الفقراء.',
    worshipAndDevotionEn: 'He wept whenever lavish food was served, remembering earlier martyrs like Mus\'ab who had no shroud except a small cloak. He freed hundreds of slaves and spent nights worshipping with tears.',
    familyAndLineageAr: 'تزوج من تماضر بنت الأصبغ الكلبية (أول كلبية تزوجها قرشي)، وأم كلثوم بنت عقبة، وسهلة بنت عاصم، وبحريّة بنت هانئ. وله أولاد أعلام كان منهم إبراهيم بن عبد الرحمن وحميد وأبو سلمة أحد فقهاء المدينة السبعة.',
    familyAndLineageEn: 'Married Tumadir bint Al-Asbagh, Umm Kulthum bint Uqbah, and Sahla bint Asim. Father of eminent scholars including Abu Salamah, one of the seven great jurists of Madinah.',
    specialSkillsAr: ['العبقرية الاستثمارية والمالية الفذة', 'النزاهة والتجرد السياسي المطلق', 'إدارة التفاوض والشورى الحساسة', 'إطعام أهل المدينة وتأمين مجاعاتهم'],
    specialSkillsEn: ['Exceptional market acumen & venture growth', 'Unrivaled political neutrality & integrity', 'Diplomatic mediation & consensus building', 'Sustaining citywide food security & welfare']
  },
  'sad-ibn-abi-waqqas': {
    companionId: 'sad-ibn-abi-waqqas',
    physicalAppearanceAr: 'كان رضي الله عنه رجلاً قصيراً إلى الربعة، ذا هامة ضخمة وعنق متين، أسمر جعد الشعر، مفتول العضلات شديد الساعدين، أصابعه غلاظ كأنها كتل حديد من كثرة ما وتر القوس ورمى النبال في سبيل الله.',
    physicalAppearanceEn: 'Stocky, heavily muscled build with broad shoulders, dark-skinned, thick fingers calloused from tens of thousands of bow draws in defense of the faith.',
    worshipAndDevotionAr: 'كان مستجاب الدعوة مهاب الدعاء لبركة دعاء النبي ﷺ له: «اللهم سدد رميته وأجب دعوته»، فكان المسلمون يطلبون دعاءه، وكان يخاف الله في لسانه فلا يدعو على أحد إلا بحق، وكان دائم البكاء عند قراءة القرآن.',
    worshipAndDevotionEn: 'Blessed with answered prayers through the Prophet\'s prayer for him. Highly feared for his prayers yet meticulously gentle, weeping frequently and strictly monitoring every word he uttered.',
    familyAndLineageAr: 'خال رسول الله ﷺ من بني زهرة، تزوج من ماوية بنت قيس، وأم عامر بنت عمرو، وزبراء، وسُلمى بنت خصفة أرملة المثنى بن حارثة. ومن أبنائه القائد عمر بن سعد وعامر ومحمد ومصعب.',
    familyAndLineageEn: 'Maternal uncle of the Prophet ﷺ from Banu Zuhrah. Married Mawiyah bint Qays, Umm Amir, and Salma bint Khasafah. Father of Amir, Muhammad, and Mus\'ab.',
    specialSkillsAr: ['الرماية الخارقة بدقة لا تخطئ الهدف', 'القيادة العسكرية الكبرى والتكتيك الحربي', 'بناء المدن العسكرية الحصينة كالكوفة', 'الدعاء المستجاب والورع التام'],
    specialSkillsEn: ['Flawless archery precision', 'Grand theater military command', 'Urban garrison planning (founded Kufa)', 'Miraculously answered prayers & piety']
  },
  'saeed-ibn-zayd': {
    companionId: 'saeed-ibn-zayd',
    physicalAppearanceAr: 'كان رضي الله عنه رجلاً طوالاً، أسمر اللون، كثير الشعر، مهيب الوقار، ظاهر النسك والسكينة، إذا نظر إليه الرائي شعر بالهيبة والاطمئنان لصفاء ملامحه وعلو همته وبعده عن التكلف.',
    physicalAppearanceEn: 'Tall, dark-complexioned, with thick hair, possessing commanding solemnity and tranquility, radiating modesty, detachment from vanity, and resolute dignity.',
    worshipAndDevotionAr: 'نشأ على التوحيد الحنيف قبل البعثة اتباعاً لأبيه زيد بن عمرو بن نفيل، وكان كثير الصيام والقيام، زاهداً في المناصب والأموال، يبتعد عن الفتن وأضواء الشهرة مقبلاً على عبادة ربه والرباط في الثغور.',
    worshipAndDevotionEn: 'Raised on pure monotheism even before the Prophet\'s mission via his monotheistic father Zayd. Renowned for intense asceticism, declining governorships to remain a steadfast frontier sentry.',
    familyAndLineageAr: 'ابن عم عمر بن الخطاب رضي الله عنه، وزوج أخته فاطمة بنت الخطاب، وتزوج أيضاً من رملة بنت شيبة وحميدة بنت قسامة. وكان سبباً رئيسياً ومباشراً في إسلام الفاروق عمر في تلك الليلة المشهودة.',
    familyAndLineageEn: 'Cousin of Umar ibn Al-Khattab and husband of Umar\'s sister Fatimah bint Al-Khattab. Played the pivotal direct role in Umar\'s conversion to Islam.',
    specialSkillsAr: ['الثبات الاستثنائي في خطوط الدفاع الأولى', 'الزهد التام في السلطة والإمارة', 'استجابة الدعوة وسرعة اللجوء لله', 'الدعوة الصامتة والصبر على الأذى'],
    specialSkillsEn: ['Steadfast frontline infantry resilience', 'Complete renunciation of political titles', 'Answered prayers in times of injustice', 'Patient perseverance under adversity']
  },
  'abu-ubaydah-ibn-al-jarrah': {
    companionId: 'abu-ubaydah-ibn-al-jarrah',
    physicalAppearanceAr: 'كان رضي الله عنه رجلاً طويلاً نحيفاً، أثرم (سقطت ثنيتاه لما نزع حلقتي المغفر عن وجنتي النبي ﷺ يوم أحد بأسنانه فكان أحسن الناس أثرم)، معروق الوجه خفيف اللحية، أبيض مشرق الطلعة يفيض حياءً وتواضعاً وهيبة.',
    physicalAppearanceEn: 'Tall, slender, with missing front teeth lost while pulling out iron chainmail rings lodged in the Prophet\'s cheeks at Uhud, turning his smile into an emblem of honor and chivalry.',
    worshipAndDevotionAr: 'كان مثال الزهد التام؛ دخل عليه أمير المؤمنين عمر وهو قائد جيوش الشام فوجد بيته لا يحتوي سوى سيف وترس وجراب فيه كسرات خبز وإناء ماء، فبكى عمر وقال: «غيرتنا الدنيا كلنا غيرك يا أبا عبيدة!».',
    worshipAndDevotionEn: 'The supreme embodiment of asceticism. When Caliph Umar visited his commander tent in Syria, he found only a sword, a shield, a water skin, and dry bread crusts, moving Umar to tears.',
    familyAndLineageAr: 'ينتمي إلى بني الحارث بن فهر من قريش، تزوج من هند بنت جابر الفهرية وأنجب يزيد وعمير وماتا في حياته فانقطع عقبه، وتفرغ كلياً لحمل هم الرسالة وأمانة الأمة حتى لقي الله.',
    familyAndLineageEn: 'From Banu Al-Harith ibn Fihr of Quraysh. Married Hind bint Jabir; his sons passed away during his lifetime, leaving his legacy wholly tied to the eternal service of the Ummah.',
    specialSkillsAr: ['الأمانة المطلقة الموثقة بالشهادة النبوية', 'القيادة العسكرية الحكيمة وتوحيد القلوب', 'الصلح بين القبائل وإدارة الجيوش الشامية', 'الإيثار وإنكار الذات والتواضع المذهل'],
    specialSkillsEn: ['Absolute integrity certified by the Prophet ﷺ', 'Unifying military leadership of Levant', 'Strategic patience & peace diplomacy', 'Peerless altruism and self-effacement']
  }
};

// -------------------------------------------------------------
// 2. مواقف بطولية وخالدة لكل صحابي (Historic Heroic Stances)
// -------------------------------------------------------------
export const COMPANIONS_HEROIC_STANCES: HeroicStance[] = [
  // --- Abu Bakr ---
  {
    id: 'ab-stance-1',
    companionId: 'abu-bakr',
    titleAr: 'موقف الغار وثاني اثنين واليقين المطلق',
    titleEn: 'The Cave of Thawr: Absolute Conviction',
    categoryAr: 'يقين وتوكل',
    categoryEn: 'Conviction & Faith',
    periodAr: 'الهجرة النبوية (1 هـ)',
    periodEn: 'The Migration (1 AH)',
    storyAr: 'حين وقف المشركون على فم الغار يطلبون رسول الله ﷺ وصاحبه، حتى قال أبو بكر راجفاً خوفاً على النبي ﷺ لا على نفسه: "يا رسول الله، لو نظر أحدهم تحت قدميه لرآنا!" فأجابه الحبيب المصطفى ﷺ بيقين السماء: «يا أبا بكر، ما ظنك باثنين الله ثالثهما؟». فأنزل الله سكينته على قلب أبي بكر فغشاه الاطمئنان الذي خلدته آيات سورة التوبة إلى يوم القيامة.',
    storyEn: 'When the pursuers stood at the cave\'s mouth, Abu Bakr whispered, fearing solely for the Prophet\'s life: "O Messenger of Allah, if any of them looks under his feet, he will see us!" The Prophet ﷺ replied: "O Abu Bakr, what do you think of two, where Allah is their third?"',
    impactAr: 'ضرب أروع مثال في التاريخ للبصيرة وحماية القائد والتوكل على حفظ الله ومعيته الخاصة.',
    impactEn: 'An immortal testament to pure faith, protecting the Prophet, and absolute divine reliance.',
    quoteAr: '«يا رسول الله، إن قُتلتُ فإنما أنا رجل واحد، وإن قُتلتَ أنتَ هلكت الأمة»',
    quoteEn: '"O Messenger of Allah, if I die, I am only one man; but if you die, the entire Ummah perishes."'
  },
  {
    id: 'ab-stance-2',
    companionId: 'abu-bakr',
    titleAr: 'عزم الصديق في حروب الردة ومانعي الزكاة',
    titleEn: 'The Wars of Riddah: Safeguarding the Faith',
    categoryAr: 'حزم وشجاعة',
    categoryEn: 'Courage & Leadership',
    periodAr: 'خلافة الصديق (11 هـ)',
    periodEn: 'Caliphate (11 AH)',
    storyAr: 'لما ارتدت قبائل العرب ومنع بعضهم الزكاة وكادت الجزيرة تشتعل، تراجع بعض الصحابة هيبةً وقال عمر: "كيف تقاتل الناس وقد قال رسول الله عصموا مني دماءهم بالشهادتين؟" فوقف أبو بكر كالطود الشامخ ممسكاً بتلابيب عمر صارخاً: "أجبار في الجاهلية خوار في الإسلام يا عمر؟! والله لأقاتلن من فرّق بين الصلاة والزكاة! والله لو منعوني عقال بعير كانوا يؤدونه لرسول الله لقاتلتهم على منعه ما استمسك السيف بيدي!".',
    storyEn: 'When multiple tribes rebelled and refused Zakat, Umar advised caution. Abu Bakr rose like a mountain: "A tyrant in Jahiliyyah, yet timid in Islam, O Umar?! By Allah, I will fight anyone who separates prayer from Zakat! If they withhold even a camel\'s tether they gave to the Messenger of Allah, I will battle them for it!"',
    impactAr: 'حفظ وحدة الإسلام وأركانه من الانهيار في أخطر منعطف واجهته الأمة بعد وفاة نبيها.',
    impactEn: 'Saved the pillars and political unity of Islam from disintegration in its gravest historical crisis.',
    quoteAr: '«أينقص الدين وأنا حي؟! والله لو منعوني عقالاً كانوا يؤدونه لرسول الله لقاتلتهم عليه»',
    quoteEn: '"Shall religion diminish while I am alive?! By Allah, I shall fight anyone who divides prayer and Zakat."'
  },
  {
    id: 'ab-stance-3',
    companionId: 'abu-bakr',
    titleAr: 'إنفاق المال كله في غزوة تبوك',
    titleEn: 'Tabuk: Donating His Entire Earthly Wealth',
    categoryAr: 'جود وإنفاق',
    categoryEn: 'Sacrifice & Wealth',
    periodAr: 'غزوة تبوك (9 هـ)',
    periodEn: 'Expedition of Tabuk (9 AH)',
    storyAr: 'حث النبي ﷺ على الصدقة لتجهيز جيش العسرة في قيظ الصيف، فجاء عمر بنصف ماله ظاناً أنه سيسبق أبا بكر هذه المرة. ثم جاء أبو بكر بصرة تحمل كل درهم ودينار يملكه ووضعها في حجر رسول الله ﷺ، فسأله النبي: «يا أبا بكر، ما تركت لأهلك؟» فأجاب بابتسامة الموقنين: «تركت لهم الله ورسوله!». فبكى عمر وقال: "والله لا أسابقك إلى شيء أبداً".',
    storyEn: 'When the Prophet ﷺ urged donations for Tabuk, Umar brought half his wealth, hoping to surpass Abu Bakr. Abu Bakr brought everything he owned. Asked what he left his family, he answered: "I left them Allah and His Messenger!" Umar wept and surrendered competition.',
    impactAr: 'رسخ أعلى درجات الزهد والتضحية في تاريخ البشرية، جاعلاً رضاء الله ورسوله فوق كل مدخرات الأرض.',
    impactEn: 'Set the ultimate benchmark in human selflessness and transcendental devotion to divine mission.',
    quoteAr: '«تركت لهم الله ورسوله!»',
    quoteEn: '"I left them Allah and His Messenger!"'
  },
  {
    id: 'ab-stance-4',
    companionId: 'abu-bakr',
    titleAr: 'عتق المستضعفين والمكروبين في مكة',
    titleEn: 'Emancipating Tortured Slaves in Makkah',
    categoryAr: 'رحمة وإنسانية',
    categoryEn: 'Mercy & Freedom',
    periodAr: 'العهد المكي المبكر',
    periodEn: 'Early Makkah Period',
    storyAr: 'حين كان كفار قريش يعذبون المستضعفين في رمضاء مكة كبلال بن رباح وعامر بن فهيرة زنيرة وأم عبيس، كان أبو بكر يشتري العبيد المعذبين بأغلى الأثمان من أمية بن خلف وغيره ثم يعتقهم لوجه الله فوراً. عاتبه والده أبو قحافة قائلاً: "أراك تعتق رقاباً ضعافاً فلو أعتقت رجالاً جلداً يمنعونك!" فأجاب الصديق: "يا أبتِ، إنما أريد ما أريد لله عز وجل".',
    storyEn: 'When Quraysh subjected defenseless converts to brutal tortures on scorching sand, Abu Bakr bought Bilal, Amir ibn Fuhayrah, Zannirah, and others at exorbitant prices, instantly liberating them for Allah.',
    impactAr: 'تحرير الإنسان وبناء صرح الأخوة الإيمانية التي لا تعترف بالعرق أو الطبقية.',
    impactEn: 'Pioneered universal human dignity and emancipation in an era dominated by cruel enslavement.',
    quoteAr: '«يا أبتِ، إنما أريد ما عند الله عز وجل»',
    quoteEn: '"O my father, I only seek that which is with Allah the Almighty."'
  },

  // --- Umar ibn Al-Khattab ---
  {
    id: 'um-stance-1',
    companionId: 'umar-ibn-khattab',
    titleAr: 'استلام مفاتيح بيت المقدس وثوب المرقعات',
    titleEn: 'Receiving Keys of Jerusalem in Patched Robe',
    categoryAr: 'عدل وتواضع',
    categoryEn: 'Justice & Humility',
    periodAr: 'فتح القدس (15 هـ)',
    periodEn: 'Liberation of Jerusalem (15 AH)',
    storyAr: 'اشترط بطريرك القدس صفرونيوس أن لا يسلم مفاتيح المدينة إلا لأمير المؤمنين شخصياً كما يجدون نعته في كتبهم. فسافر عمر من المدينة إلى القدس على بعير واحد يتناوب ركوبه مع غلامه، وعندما وصلا مشارف القدس كانت نوبة الركوب للغلام ونوبة المشي للخليفة! فخاض عمر المخاضة وثوبه مرقع بسبع عشرة رقعة، فقال له أبو عبيدة: "لو ركبت برذوناً ولبست ثوباً حسناً!" فضرب عمر على صدره وقال: "أووه لو غيرك قالها يا أبا عبيدة! إنا كنا أذل قوم فأعزنا الله بالإسلام، فمهما ابتغينا العزة بغير ما أعزنا الله به أذلنا الله!". وكتب لأهلها العهدة العمرية الخالدة.',
    storyEn: 'Patriarch Sophronius insisted on handing Jerusalem\'s keys only to the Caliph. Umar rode a single camel alternating turns with his servant. Approaching the city, it was the servant\'s turn to ride! Umar walked holding the bridle, wearing a robe with 17 patches, proving that dignity is found in Islam alone.',
    impactAr: 'صاغ أروع وثيقة تسامح وحرية دينية في التاريخ وحطم بروتوكولات الأباطرة والجبابرة بتواضع العادلين.',
    impactEn: 'Produced the immortal Covenant of Umar safeguarding Christian sanctuaries and pioneering human rights.',
    quoteAr: '«نحن قوم أعزنا الله بالإسلام، فمهما ابتغينا العزة بغيره أذلنا الله»',
    quoteEn: '"We were a humiliated people whom Allah honored through Islam; if we seek honor elsewhere, Allah will humiliate us."'
  },
  {
    id: 'um-stance-2',
    companionId: 'umar-ibn-khattab',
    titleAr: 'عام الرمادة وقسمة الجوع مع الرعية',
    titleEn: 'Year of Famine: Starving with His People',
    categoryAr: 'مسؤولية وأمانة',
    categoryEn: 'Empathy & Duty',
    periodAr: 'عام الرمادة (18 هـ)',
    periodEn: 'Year of Ramadah (18 AH)',
    storyAr: 'عندما أصابت الجزيرة مجاعة قاحلة ماتت فيها الماشية وجاعت البطون، أقسم عمر ألا يذوق السمْن ولا اللبن ولا اللحم حتى يشبع فقراء المسلمين! فتحول لونه من البياض إلى السواد، وقرقر بطنه يوماً من أكل الزيت والخل، فوضع أصبعه على بطنه وقال: "قرّقري أو لا تقرقري، فوالله لن تذوقي اللحم حتى يحيى الناس وتشبع بطون صبيان المسلمين!". وكان يقول باكياً: "كيف يعنيني شأن الرعية إن لم يمسّني ما مسّهم؟!".',
    storyEn: 'During catastrophic famine, Umar swore off butter, milk, and meat until every poor person was fed. His health deteriorated and his complexion darkened. Hearing his stomach rumble, he said: "Rumble as you wish; by Allah you will taste no meat until the children of Muslims are filled!"',
    impactAr: 'أعلى مفهوم التكافل والمسؤولية القيادية الأخلاقية في تاريخ الإدارة والحكم.',
    impactEn: 'Demonstrated an unprecedented level of political empathy, where rulers starve before their citizens.',
    quoteAr: '«كيف يعنيني شأن الرعية إذا لم يمسني ما مسهم؟!»',
    quoteEn: '"How can I truly care for my subjects if I do not experience what they suffer?!"'
  },
  {
    id: 'um-stance-3',
    companionId: 'umar-ibn-khattab',
    titleAr: 'العسس الليلي وقصة المرأة وأطفالها الجياع',
    titleEn: 'Night Vigil: Cooking for Starving Orphans',
    categoryAr: 'رعاية ورحمة',
    categoryEn: 'Care & Compassion',
    periodAr: 'عهد الخلافة بالمدينة',
    periodEn: 'Caliphate in Madinah',
    storyAr: 'خرج عمر ليلاً يعسّ بالمدينة ومعه أسلم مولاه، فرأى ناراً من بعيد في الصحراء، فأتاها فإذا بامرأة وحولها صبية يبكون وبيدها قِدر يغلي بالماء والحصى لتعللهم به حتى يناموا، وهي تقول: "الله بيننا وبين عمر!". فبكى عمر واقترب وسألها دون أن يعرّفها بنفسه: "ما يبكيهم؟" قالت: "الجوع!" فركض عمر مسرعاً إلى دار الدقيق، وحمل على ظهره وعاء الدقيق وشحم اللحم، فقال أسلم: "أحمل عنك يا أمير المؤمنين!" فنهره عمر باكياً: "أتحمل عني أوزاري يوم القيامة ثكلتك أمك؟!" وجثا على ركبتيه ينفخ النار حتى تخلل الدخان لحيته الكثة، وطبخ لهم وأطعمهم حتى ضحك الصغار، وقال للمرأة: "إذا كان الغد فأتِ أمير المؤمنين تجديني هناك".',
    storyEn: 'Patrolling at night, Umar saw a woman boiling water with stones to soothe starving children. Umar ran to the storehouse, loaded flour and fat onto his own back. When his servant offered to carry it, Umar wept: "Will you carry my sins on the Day of Judgment?!" He personally cooked and fed the children until they smiled.',
    impactAr: 'ألهم العالم صورة الحاكم الخادم الذي لا ينام ورعيته جياع، ولا يفوّض كرامة الفقير إلى موظف أو حاجب.',
    impactEn: 'Immortalized the servant-leader ideal where heads of state handle relief directly with utmost humility.',
    quoteAr: '«أتحمل عني وزري يوم القيامة لا أبا لك؟!»',
    quoteEn: '"Will you carry my burden of sins on the Day of Resurrection?!"'
  },

  // --- Uthman ibn Affan ---
  {
    id: 'ut-stance-1',
    companionId: 'uthman-ibn-affan',
    titleAr: 'تجهيز جيش العسرة وبشارة «ما ضر عثمان ما عمل بعد اليوم»',
    titleEn: 'Equipping the Army of Hardship (Tabuk)',
    categoryAr: 'جود وسخاء',
    categoryEn: 'Generosity & Sacrifice',
    periodAr: 'غزوة تبوك (9 هـ)',
    periodEn: 'Expedition of Tabuk (9 AH)',
    storyAr: 'لما ندب رسول الله ﷺ الناس لتجهيز جيش العسرة في تبوك لملاقاة الروم، وقف عثمان وقال: "عليّ مائة بعير بأحلاسها وأقتابها في سبيل الله"، ثم زاد النبي في الحث، فقام عثمان وقال: "عليّ مائتا بعير بأحلاسها وأقتابها"، ثم قال: "عليّ ثلاثمائة بعير"، حتى بلغت تسعمائة وخمسين بعيراً وخمسين فرساً، وجاء بصرة فيها ألف دينار ذهبي فصبها في حجر النبي ﷺ، فجعل النبي يقلبها مسروراً ويدعو له ويقول: «مَا ضَرَّ عُثْمَانَ مَا عَمِلَ بَعْدَ اليَوْمِ! مَا ضَرَّ عُثْمَانَ مَا عَمِلَ بَعْدَ اليَوْمِ!».',
    storyEn: 'For the massive campaign of Tabuk, Uthman equipped an entire third of the Muslim military, providing 950 loaded camels, 50 horses, and 1,000 gold dinars in cash. The Prophet ﷺ turned the gold coins in his hands, repeatedly exclaiming: "Nothing Uthman does after today can ever harm him!"',
    impactAr: 'أنقذ الجيش الإسلامي ومكنه من التحرك في أصعب ظرف جغرافي واقتصادي واجهته الدعوة.',
    impactEn: 'Saved the nascent state military from collapse, funding one of the most critical deterrence operations.',
    quoteAr: '«ما ضر عثمان ما عمل بعد اليوم!» (بشارة نبوية خالدة)',
    quoteEn: '"Nothing Uthman does after today can ever harm him!" (Prophetic Glad Tidings)'
  },
  {
    id: 'ut-stance-2',
    companionId: 'uthman-ibn-affan',
    titleAr: 'جمع القرآن الكريم وتوحيد المصاحف في مصحف إمام',
    titleEn: 'Standardizing the Holy Qur\'an (Al-Mushaf Al-Imam)',
    categoryAr: 'حفظ الدين والأمة',
    categoryEn: 'Preserving the Quran',
    periodAr: 'الخلافة الراشدة (25 هـ)',
    periodEn: 'Caliphate (25 AH)',
    storyAr: 'حين فزع حذيفة بن اليمان من اختلاف قراءات المسلمين في أذربيجان وأرمينيا حتى كادوا يكفرون بعضهم، هرع إلى عثمان وقال: "أدرك هذه الأمة قبل أن تختلف في الكتاب اختلاف اليهود والنصارى!". فجمع عثمان كبار الصحابة واستشارهم، وأرسل إلى حفصة رضي الله عنها فجاء بالصحف التي جُمعت في عهد أبي بكر، وشكّل لجنة برئاسة زيد بن ثابت وعضوية عبد الله بن الزبير وسعيد بن العاص وعبد الرحمن بن الحارث، فنسخوا المصاحف بلغة قريش وأرسل منها إلى كل مصر مصحفاً وأمر بحرق ما عداها، فتوحدت الأمة على كتاب ربها بحرف واحد.',
    storyEn: 'When regional differences in recitation threatened factionalism, Uthman formed an editorial council led by Zayd ibn Thabit, copied the original manuscripts of Abu Bakr into standardized codices (Al-Mushaf Al-Imam), and dispatched them across all provinces, uniting Muslims forever.',
    impactAr: 'أعظم منجز توثيقي في تاريخ البشرية، صان القرآن من التبديل والاختلاف وحفظ تلاوته غضة إلى يوم القيامة.',
    impactEn: 'The monumental achievement that unified the Qur\'an and preserved its exact textual purity across millennia.',
    quoteAr: '«أرى أن نجمع الناس على مصحف واحد، فلا تكون فرقة ولا يكون اختلاف»',
    quoteEn: '"I see that we unite the people upon a single Mushaf, so there shall be neither division nor dispute."'
  },
  {
    id: 'ut-stance-3',
    companionId: 'uthman-ibn-affan',
    titleAr: 'الصبر في الحصار ورفض إراقة قطرة دم مسلم',
    titleEn: 'Steadfast Martyrdom: Refusing to Shed Muslim Blood',
    categoryAr: 'فداء وورع',
    categoryEn: 'Martyrdom & Peace',
    periodAr: 'المدينة المنورة (35 هـ)',
    periodEn: 'Madinah (35 AH)',
    storyAr: 'حين حاصر الخوارج والمتمردون داره ومنعوا عنه حتى شرب الماء من بئر رومة التي اشتراها بماله للمسلمين، جاءه الحسن والحسين وابن الزبير وأبناء كبار الصحابة متوشحين سيوفهم يطلبون إذنه لقتال المحاصرين ودحرهم، فنهاهم عثمان بحزم قائلاً: "أعزم على كل من رأى أن له عليّ طاعة أن يكف يده ولا يريق قطرة دم في سببي!". وصام يومه ذلك، ورأى النبي ﷺ في منامه يقول له: «أفطر عندنا الليلة يا عثمان»، فاستبشر وفتح المصحف يتلوه حتى اقتحم عليه القتلة فاستشهد ودمه الطاهر يقطر على قوله تعالى: ﴿فَسَيَكْفِيكَهُمُ اللَّهُ وَهُوَ السَّمِيعُ الْعَلِيمُ﴾.',
    storyEn: 'Besieged in his house and denied water, prominent youth like Al-Hasan, Al-Husayn, and Ibn Az-Zubayr offered to fight. Uthman commanded them: "I forbid anyone under my obedience from shedding a drop of blood for my sake!" He fasted, saw the Prophet ﷺ in a dream, and embraced martyrdom while reciting the Quran.',
    impactAr: 'جسد أعلى معاني التضحية الشخصية لحماية حرمة دماء المسلمين وعدم شق عصا الجماعة.',
    impactEn: 'Supreme sacrifice: choosing personal martyrdom over plunging the Muslim capital into bloodshed.',
    quoteAr: '«لا أكون أول من خلف رسول الله ﷺ في أمته بإراقة الدماء»',
    quoteEn: '"I will never be the first successor of the Messenger of Allah ﷺ to spill blood among his Ummah."'
  },

  // --- Ali ibn Abi Talib ---
  {
    id: 'al-stance-1',
    companionId: 'ali-ibn-abi-talib',
    titleAr: 'المبيت في فراش النبي ﷺ ليلة الهجرة',
    titleEn: 'Sleeping in the Prophet\'s Bed on the Night of Hijrah',
    categoryAr: 'فداء وتضحية',
    categoryEn: 'Self-Sacrifice',
    periodAr: 'مكة المكرمة (1 هـ)',
    periodEn: 'Makkah (1 AH)',
    storyAr: 'حين أجمعت قريش على اغتيال النبي ﷺ في فراشه واجتمع فرسان كل قبيلة بسيوفهم حول الباب، طلب النبي ﷺ من علي بن أبي طالب وهو فتى يافع أن يبيت في فراشه ويلبس بردته الحضرمية الخضراء ليوهم المحاصرين أن النبي ما زال نائماً، ثم يرد أمانات أهل مكة التي كانوا يودعونها عند الصادق الأمين. قبل علي الفداء دون تردد ونام قرير العين تحت بريق سيوف الكفر، حتى انبثق الفجر وخرج عليهم علي فبُهت المشركون وقد نجى رسول الله.',
    storyEn: 'On the night of assassination, Ali bravely slept in the Prophet\'s bed wrapped in his green mantle, acting as a decoy beneath drawn swords while the Prophet migrated, and stayed behind to return all customer deposits to the people of Makkah.',
    impactAr: 'أعظم بطولة فدائية في تاريخ الإسلام، حيث افتدى النبي بروحه ومهد لنجاح الهجرة النبوية المباركة.',
    impactEn: 'Unrivaled heroism: risking his young life as a decoy to ensure the safe escape of the Prophet ﷺ.',
    quoteAr: '«فديتك بنَفْسي يا رسول الله، أوتسلم إن نمتُ في فراشك؟ قال: نعم، قال: فبتُّ هانئاً مطمئناً»',
    quoteEn: '"May my soul be sacrificed for you, O Messenger of Allah! Will you be safe if I sleep here? He said: Yes. Ali said: Then I slept in peace."'
  },
  {
    id: 'al-stance-2',
    companionId: 'ali-ibn-abi-talib',
    titleAr: 'فتح حصن خيبر وحمل الراية',
    titleEn: 'Conquering the Fortresses of Khaybar',
    categoryAr: 'بطولة وفروسية',
    categoryEn: 'Valor & Leadership',
    periodAr: 'غزوة خيبر (7 هـ)',
    periodEn: 'Battle of Khaybar (7 AH)',
    storyAr: 'استعصت حصون خيبر أياماً، فقال النبي ﷺ قولته الخالدة: «لَأُعْطِيَنَّ الرَّايَةَ غَدًا رَجُلًا يُحِبُّ اللَّهَ وَرَسُولَهُ وَيُحِبُّهُ اللَّهُ وَرَسُولُهُ، يَفْتَحُ اللَّهُ عَلَى يَدَيْهِ». فبات الصحابة يرجون أن ينالوها، فلما أصبحوا نادى النبي ﷺ: «أين علي بن أبي طالب؟» وكان أرمد العينين يشتكي، فبصق النبي في عينيه ودعا له فبرئ كأن لم يكن به وجع، ودفع إليه الراية. تقدم علي، وخرج له مرحب بطل يهود خيبر يرتجز شجاعته، فضربه علي ضربة صاعقة شقت مغفره وهامته، ثم اقتلع باب الحصن وتترس به حتى فتح الله الحصن المنيع.',
    storyEn: 'After multiple assaults failed at Khaybar, the Prophet ﷺ announced: "Tomorrow I will hand the banner to a man who loves Allah and His Messenger, and Allah and His Messenger love him." He called Ali, healed his eye illness with saliva, and Ali slew Marhab, leading the decisive assault.',
    impactAr: 'كسر شوكة خيبر وأنهى خطرها العسكري الغادر عن الدولة الإسلامية بحسم وبطولة أسطورية.',
    impactEn: 'Eliminated the greatest existential siege threat on Madinah through unprecedented personal courage.',
    quoteAr: '«أنا الذي سمّتني أمي حيدرة.. كليثِ غاباتٍ كريهِ المنظرة»',
    quoteEn: '"I am the one whose mother named him Lion... like a fierce beast in terrifying charge."'
  },
  {
    id: 'al-stance-3',
    companionId: 'ali-ibn-abi-talib',
    titleAr: 'مبارزة عمرو بن ود العامري يوم الخندق',
    titleEn: 'Dueling Amr ibn Abd Wudd at the Trench',
    categoryAr: 'شجاعة نادرة',
    categoryEn: 'Courage & Duel',
    periodAr: 'غزوة الخندق (5 هـ)',
    periodEn: 'Battle of the Trench (5 AH)',
    storyAr: 'اقتحم عمرو بن ود العامري - وكان فارس قريش وصنديدها الذي يُعد بألف فارس - الخندق ودعا المسلمين إلى المبارزة وهو يتبختر ويصيح: "من يبارز؟ أين جنتكم التي تزعمون أن من قُتل منكم دخلها؟!"، فهابه الناس لسجله المخيف في الفتك. فقام علي وهو شاب وقال: "أنا له يا نبي الله!"، فألبسه النبي عمامته وأعطاه سيفه ذو الفقار ودعا له: «اللهم أعنه عليه». تقدم علي وبارزه بثبات الجبال، وتبادلا ضربات عنيفة ارتفعت معها سحابة غبار، فما سمع المسلمون إلا صوت تكبير علي يهدر معلناً مصرع طاغية قريش، فكبّر رسول الله وكبّر المسلمون فرحاً.',
    storyEn: 'Amr ibn Abd Wudd, a fearsome champion counted as equal to a thousand warriors, leapt over the trench challenging anyone to duel. Ali accepted. After a furious duel hidden by dust clouds, Ali\'s roaring Takbir resounded, announcing the tyrant\'s defeat.',
    impactAr: 'تحطيم معنويات جيش الأحزاب وبث الرعب في صفوف المشركين وحماية ثغرة الخندق الحرجة.',
    impactEn: 'Shattered the morale of the confederate armies, sealing the defensive victory of the Muslims at the Trench.',
    quoteAr: '«لا تعجلن فقد أتاك مجيب صوتك غير عاجز!»',
    quoteEn: '"Hasten not, for there has answered your challenge one who is neither weak nor unprepared!"'
  },

  // --- Talha ibn Ubaydillah ---
  {
    id: 'tl-stance-1',
    companionId: 'talha-ibn-ubaydillah',
    titleAr: 'صقر أحد وحماية النبي ﷺ بالجسد حتى شُلت يده',
    titleEn: 'The Falcon of Uhud: The Human Shield',
    categoryAr: 'فداء وبطولة',
    categoryEn: 'Heroic Shielding',
    periodAr: 'غزوة أحد (3 هـ)',
    periodEn: 'Battle of Uhud (3 AH)',
    storyAr: 'حين اضطرب صفوف المسلمين في أحد وأحاط المشركون برسول الله ﷺ يرمونه بالنبال والسيوف لإبادته، صرخ النبي: «من يردهم عنا وهو رفيقي في الجنة؟» فقام طلحة ورمى بنفسه أمام النبي كالسد المنيع. صار يتلقى السهام بكفه وجسده وهو يقول: "نحري دون نحرك يا رسول الله!". أصيب طلحة في ذلك اليوم بأكثر من سبعين طعنة وضربة ورمية سهم، وقُطعت أوتار أصابعه وشُلت كفه التي كان يقبض بها على السيف ويصد بها السهام عن وجه النبي. فلما رآه النبي ملطخاً بالدماء قال: «أوجب طلحة» (أي وجبت له الجنة)، وسُمي "صقر يوم أحد".',
    storyEn: 'At Uhud when chaos erupted and enemies targeted the Prophet ﷺ, Talha threw his body forward as a human shield, catching arrows with his bare hands until his hand was permanently paralyzed, suffering over 70 wounds. The Prophet ﷺ declared: "Talha has earned Paradise!"',
    impactAr: 'إنقاذ حياة رسول الله ﷺ في أحلك ساعة مر بها الإسلام، ونيل وسام الشهيد الحي الذي يمشي على الأرض.',
    impactEn: 'Directly preserved the life of Prophet Muhammad ﷺ in battle, earning the title "The Living Martyr".',
    quoteAr: '«نحري دون نحرك، ونفسي فداء نفسك يا رسول الله!»',
    quoteEn: '"My throat before your throat, and my life in sacrifice for yours, O Messenger of Allah!"'
  },
  {
    id: 'tl-stance-2',
    companionId: 'talha-ibn-ubaydillah',
    titleAr: 'طلحة الخير والفياض وتوزيع 700 ألف درهم في ليلة',
    titleEn: 'Talha the Munificent: Giving Away 700,000 Dirhams Overnight',
    categoryAr: 'كرم وإيثار',
    categoryEn: 'Generosity & Charity',
    periodAr: 'المدينة المنورة',
    periodEn: 'Madinah Period',
    storyAr: 'جاءت طلحة أموال عظيمة من تجارته بحضرموت بلغت سبعمائة ألف درهم، فبات تلك الليلة مهموماً يتململ في فراشه، فسألته زوجته أم كلثوم بنت أبي بكر: "ما بك يا أبا محمد؟ أَرابك شيء من أهلك؟" قال: "لا والله، ونِعْمَ حليلة المسلم أنتِ، ولكن تفكرت في هذا المال وقلت: ما ظن رجل بربه يبيت وفي بيته هذا المال؟!" فقالت له: "وما يمنعك؟ إذا أصبحت فاقسمه بين فقراء قومك وأهل الحاجة". فلما أصبح دعا بالجفان فصب فيها المال، وفرقه كله على المهاجرين والأنصار وأهل الصفة، حتى ما بقي في بيته درهم واحد يشتري به طعاماً لغدائه!',
    storyEn: 'Upon receiving 700,000 dirhams from his trade caravans, Talha could not sleep from anxiety. His wife asked why, and he said: "What will my Lord think of me if I sleep with this wealth in my house?" By dawn, he gathered bowls and distributed every single coin to the poor.',
    impactAr: 'بيان أن المال عند الصحابة كان وسيلة لنيل رضا الله وإسعاد الضعفاء لا غاية للاكتناز والرياء.',
    impactEn: 'Exemplified spiritual detachment where vast wealth is treated purely as a tool for humanitarian relief.',
    quoteAr: '«ما ظن رجل بربه يبيت وفي بيته هذا المال دون أن يفرقه في سبيله؟!»',
    quoteEn: '"What would a servant think of his Lord if he slept overnight while this hoard remained in his home?!"'
  },

  // --- Az-Zubayr ibn Al-Awwam ---
  {
    id: 'zb-stance-1',
    companionId: 'az-zubayr-ibn-al-awwam',
    titleAr: 'أول سيف سُلّ في الإسلام',
    titleEn: 'The Very First Sword Drawn in Islam',
    categoryAr: 'سبق وشجاعة',
    categoryEn: 'Courage & Initiative',
    periodAr: 'مكة المكرمة (العهد المكي)',
    periodEn: 'Makkah (Early Dawns of Islam)',
    storyAr: 'بينما كان الزبير فتىً لم يبلغ السادسة عشرة من عمره في مكة، سرت شائعة كاذبة بأن رسول الله ﷺ قد قُتل أو أُخذ غدراً. فما كان من الزبير إلا أن استل سيفه ومضى في شوارع مكة كالسهم يشق صفوف قريش وعيناه تقدحان شرراً وهو يبحث عن النبي ﷺ. فلقيه رسول الله ﷺ في أعلى مكة، فتعجب النبي من هيئته وسأله: «ما لك يا زبير؟» قال: "سمعت أنك قُتلت أو أُخذت!" قال: «فما كنت صانعاً؟» قال الزبير بحمية المؤمن: "كنت والله لأضربن بسيفي هذا من أخذك حتى أفارق الحياة!". فسرّ النبي ﷺ ودعا له ولسيفه بالبركة والنصر، فكان أول سيف سُل دفاعاً عن النبي في الإسلام.',
    storyEn: 'At age 16, hearing a rumor that the Prophet ﷺ had been assassinated in Makkah, Az-Zubayr drew his sword and sprinted through hostile streets. When the Prophet ﷺ met him and asked what he intended, Az-Zubayr said: "I intended to strike with this sword whoever took you until I fell!" The Prophet blessed him and his sword.',
    impactAr: 'تسطير أول صرخة مسلحة في وجه طغيان مكة، وإبراز عقيدة الفداء التي قامت عليها سواعد الصحابة.',
    impactEn: 'Marked the dawn of heroic resistance in Islam, proving the unbounded loyalty of the youth.',
    quoteAr: '«كنت أردت أن أضرب به من أخذك حتى أُقتل!»',
    quoteEn: '"I intended to strike down whoever took you until I was killed in your defense!"'
  },
  {
    id: 'zb-stance-2',
    companionId: 'az-zubayr-ibn-al-awwam',
    titleAr: 'حواري رسول الله واختراق حصون بني قريظة يوم الخندق',
    titleEn: 'The Disciple of the Prophet: Reconnaissance at the Trench',
    categoryAr: 'فداء واستطلاع',
    categoryEn: 'Reconnaissance & Valor',
    periodAr: 'غزوة الخندق (5 هـ)',
    periodEn: 'Battle of the Trench (5 AH)',
    storyAr: 'في ليلة الخندق الباردة العاصفة حين بلغت القلوب الحناجر وتآمرت بنو قريظة من الخلف مع الأحزاب، قال النبي ﷺ ثلاث مرات: «من يأتيني بخبر بني قريظة؟» فما قام إلا الزبير بن العوام في كل مرة يقول: "أنا يا رسول الله!". فمضى وحده في ظلمة الليل والرياح العاتية واخترق معسكر العدو وعاد بالأخبار الدقيقة إلى رسول الله ﷺ، فقال النبي مقولته الخالدة: «إِنَّ لِكُلِّ نَبِيٍّ حَوَارِيًّا، وَحَوَارِيَّ الزُّبَيْرُ!». وفداه بأبويه: «فداك أبي وأمي».',
    storyEn: 'On a freezing howling night at the Trench when Banu Qurayzah betrayed Muslims, the Prophet ﷺ asked three times: "Who will bring me intelligence of Banu Qurayzah?" Only Az-Zubayr volunteered each time. The Prophet ﷺ declared: "Every Prophet has a disciple, and my disciple is Az-Zubayr!"',
    impactAr: 'كشف مخططات الغدر وإنقاذ المدينة من هجوم مباغت في أشد لحظات الحصار خطورة.',
    impactEn: 'Exposed betrayal, securing the inner city from a devastating flank attack at the Trench.',
    quoteAr: '«إن لكل نبي حوارياً، وحواريّ الزبير» (شهادة نبوية خالدة)',
    quoteEn: '"Every Prophet has a disciple (Hawari), and my disciple is Az-Zubayr!"'
  },

  // --- Abdur-Rahman ibn Awf ---
  {
    id: 'ar-stance-1',
    companionId: 'abdur-rahman-ibn-awf',
    titleAr: '«دلوني على السوق» وعزة النفس والاستثمار النزيه',
    titleEn: '"Guide Me to the Marketplace": Dignity & Enterprise',
    categoryAr: 'عزة نفس وعمل',
    categoryEn: 'Self-Reliance & Work',
    periodAr: 'الهجرة إلى المدينة (1 هـ)',
    periodEn: 'Arrival in Madinah (1 AH)',
    storyAr: 'لما آخى النبي ﷺ بين المهاجرين والأنصار، آخى بين عبد الرحمن بن عوف وسعد بن الربيع الأنصاري وكان من أغنى أهل المدينة. فقال سعد بكرم الأنصار: "يا عبد الرحمن، هذا مالي أقسمه بيني وبينك نصفين، وانظر أي زوجتيّ أحب إليك أطلقها لتتزوجها بعد عدتها!". فرد عبد الرحمن بعزة نفس مؤمنة وشكر عظيم: "بارك الله لك في أهلك ومالك، لا حاجة لي في ذلك.. ولكن دلوني على السوق!". فذهب إلى سوق قينقاع واشترى أقطاً وسمناً وباع وربح، وما مضت أشهر حتى أتى النبي ﷺ وعليه وضر من خلوق (أثر طيب العرس) وقد تزوج من ماله وأثراه الله بالحلال.',
    storyEn: 'When Sa\'d ibn Ar-Rabi offered to divide his vast wealth and property in half to assist the newly arrived migrant, Abdur-Rahman thanked him sincerely and replied: "May Allah bless you in your family and wealth; just direct me to the marketplace!" He traded honestly, becoming one of Madinah\'s greatest benefactors.',
    impactAr: 'إرساء أعظم درس في عزة النفس، وثقافة العمل والإنتاج والاستثمار الحلال بدلاً من الاعتماد على الصدقات.',
    impactEn: 'Pioneered economic self-reliance, ethical enterprise, and human dignity in Muslim community development.',
    quoteAr: '«بارك الله لك في أهلك ومالك.. دلوني على السوق!»',
    quoteEn: '"May Allah bless your family and wealth.. simply guide me to the marketplace!"'
  },
  {
    id: 'ar-stance-2',
    companionId: 'abdur-rahman-ibn-awf',
    titleAr: 'إمامة النبي ﷺ في الصلاة خلف عبد الرحمن بن عوف',
    titleEn: 'Leading Prophet Muhammad ﷺ in Congregational Prayer',
    categoryAr: 'شرف ومقام',
    categoryEn: 'Honor & Precedence',
    periodAr: 'غزوة تبوك (9 هـ)',
    periodEn: 'Expedition of Tabuk (9 AH)',
    storyAr: 'في غزوة تبوك ذهب النبي ﷺ لقضاء حاجته فتأخر في الوضوء ومعه المغيرة بن شعبة، وحضرت صلاة الفجر فخشي المسلمون فوات وقتها، فقدّموا عبد الرحمن بن عوف ليؤمهم في الصلاة. وبينما عبد الرحمن يصلي بهم ركع الركعة الأولى، فأقبل النبي ﷺ والتحق بالصف مقتدياً بعبد الرحمن بن عوف وصلى خلفه ما أدرك! فلما سلّم عبد الرحمن قام النبي ﷺ فأتم ركعته التي فاتته، فلما انتهى قال للصحابة مسروراً: «أَحْسَنْتُمْ وَأَصَبْتُمْ»، ولم يُعرف أحد من هذه الأمة صلى خلفه رسول الله ﷺ وهو إمام إلا عبد الرحمن بن عوف وأبو بكر الصديق.',
    storyEn: 'At Tabuk, the Prophet ﷺ was delayed completing wudu at dawn. The companions put forward Abdur-Rahman ibn Awf to lead Fajr prayer. The Prophet ﷺ arrived and joined the prayer row behind Abdur-Rahman, affirming his status with boundless delight.',
    impactAr: 'منزلة لا تضاهى في المحراب، واعتراف نبوي بفضل عبد الرحمن بن عوف واستحقاقه للإمامة.',
    impactEn: 'A rare celestial distinction where the Prophet of Allah prayed as a congregant behind his companion.',
    quoteAr: '«أحسنتم وأصبتم!» (ثناء النبي على الصلاة خلفه)',
    quoteEn: '"You have done well and acted rightly!" (Prophetic praise)'
  },

  // --- Sa'd ibn Abi Waqqas ---
  {
    id: 'sd-stance-1',
    companionId: 'sad-ibn-abi-waqqas',
    titleAr: 'فداء النبي له بأبويه يوم أحد: «ارمِ سعد، فداك أبي وأمي»',
    titleEn: 'Uhud: "Shoot, Sa\'d, May My Parents Be Sacrificed for You!"',
    categoryAr: 'فداء وشرف',
    categoryEn: 'Valor & Archery',
    periodAr: 'غزوة أحد (3 هـ)',
    periodEn: 'Battle of Uhud (3 AH)',
    storyAr: 'في غزوة أحد حين اشتد وطيس المعركة وانكشف المسلمون، جلس سعد بن أبي وقاص بين يدي رسول الله ﷺ يرمي المشركين بسهامه الصائبة. وكان النبي ﷺ ينثر له السهام من كنانته الشريفة ويناوله سهماً بعد سهم وهو يقول له بحرارة وفخر: «ارْمِ سَعْدُ! فِدَاكَ أَبِي وَأُمِّي!». قال علي بن أبي طالب رضي الله عنه: "ما سمعت رسول الله ﷺ يفدي أحداً بأبويه غير سعد بن أبي وقاص يوم أحد". وكان سعد يرمي السهم فيصيب به العدو ولا يخطئ قط لبركة دعاء النبي له.',
    storyEn: 'During the onslaught of Uhud, Sa\'d defended the Prophet with pinpoint archery. The Prophet ﷺ emptied his quiver, handing arrows to Sa\'d saying: "Shoot, Sa\'d! May my father and mother be sacrificed for you!" Ali remarked that the Prophet never combined both parents in ransom for anyone else.',
    impactAr: 'وسام شرف خالد من فم الصادق المصدوق لم يظفر به صحابي آخر مجتمعاً بأبويه هكذا.',
    impactEn: 'An unparalleled honor from the Prophet ﷺ, certifying Sa\'d as the premier archer of Islam.',
    quoteAr: '«ارْمِ سَعْدُ! فِدَاكَ أَبِي وَأُمِّي!»',
    quoteEn: '"Shoot, Sa\'d! May my father and mother be sacrificed for you!"'
  },
  {
    id: 'sd-stance-2',
    companionId: 'sad-ibn-abi-waqqas',
    titleAr: 'قائد معركة القادسية وإسقاط إمبراطورية الأكاسرة',
    titleEn: 'Commanding Al-Qadisiyyah: Fall of the Persian Empire',
    categoryAr: 'فتح ونصر',
    categoryEn: 'Military Conquest',
    periodAr: 'معركة القادسية (15 هـ)',
    periodEn: 'Battle of Al-Qadisiyyah (15 AH)',
    storyAr: 'اختاره الفاروق عمر بن الخطاب قائداً عاماً لجيوش المسلمين في العراق لفتح بلاد فارس ومنازلة رستم قائد جيوش كسرى. ورغم أن سعداً كان يعاني من عرق النسا ودمامل ألمت به حتى لم يكن يستطيع الجلوس على فرسه، إلا أنه أدار المعركة الكبرى من فوق قصر عذيب الهجانات مستلقياً على صدره يرسل التوجيهات الدقيقة للقادة حتى سقط رستم وانتصر المسلمون، ثم طاردهم وفتح المدائن عاصمة الأكاسرة، وأرسل تاج كسرى وإيوانه وسواره إلى المدينة المنورة.',
    storyEn: 'Appointed supreme commander by Umar at Al-Qadisiyyah against the massive Persian host. Though crippled with sciatica and agonizing sores, Sa\'d commanded from a rooftop overlooking the battlefield, directing maneuvers that shattered the Sasanian empire and captured Ctesiphon (Al-Mada\'in).',
    impactAr: 'تحرير العراق وبلاد فارس من طغيان المجوس وفتح أبواب الشرق لدخول الملايين في دين الله أفواجاً.',
    impactEn: 'Permanently dismantled the Sasanian Persian empire, opening the gates of the East to Islam.',
    quoteAr: '«إن الله قد وعدنا أرضهم وديارهم وأموالهم، فأخلصوا النيات واصدقوا في لقاء عدوكم»',
    quoteEn: '"Indeed Allah promised us their lands and treasures; purify your intentions and be steadfast when meeting the enemy."'
  },

  // --- Saeed ibn Zayd ---
  {
    id: 'sz-stance-1',
    companionId: 'saeed-ibn-zayd',
    titleAr: 'موقف الصبر على إسلامه وسبب إسلام الفاروق عمر',
    titleEn: 'Steadfast Faith & Pivotal Role in Umar\'s Conversion',
    categoryAr: 'ثبات ودعوة',
    categoryEn: 'Steadfastness & Dawah',
    periodAr: 'مكة المكرمة (ما قبل الهجرة)',
    periodEn: 'Makkah (Pre-Hijrah)',
    storyAr: 'أسلم سعيد بن زيد وزوجته فاطمة بنت الخطاب سراً وكان خباب بن الأرت يعلمهما القرآن. وعندما اقتحم عمر بن الخطاب دارهما غاضباً شاهر سيفه، واجه سعيد بن زيد عمراً بشجاعة ورباطة جأش قائلاً: "أرأيت يا عمر إن كان الحق في غير دينك؟" فبطش به عمر وأسقطه أرضاً، فدافعت عنه زوجته فاطمة فشجها عمر، فسال دمها وقالت بثبات الجبال: "يا عمر، إنا قد أسلمنا وآمنا بالله ورسوله، فاصنع ما بدا لك!". هذا الثبات الأسطوري من سعيد وزوجته صدع قسوة عمر وقاده إلى قراءة سورة طه وإعلان إسلامه في تلك الساعة.',
    storyEn: 'Saeed and his wife Fatimah (Umar\'s sister) secretly accepted Islam. When an enraged Umar stormed their house, Saeed confronted him fearlessly: "What if truth lies outside your creed?" Their unshakable conviction melted Umar\'s fury, leading him directly to Surah Taha and Islam.',
    impactAr: 'كان سعيد وزوجته البوابة الإلهية التي دخل منها عملاق الإسلام عمر بن الخطاب إلى دين الحق.',
    impactEn: 'The direct catalyst through whom Umar ibn Al-Khattab entered Islam, shifting the tide of history.',
    quoteAr: '«أرأيت يا عمر إن كان الحق في غير دينك؟ قد أسلمنا وآمنا بالله ورسوله فاصنع ما بدا لك»',
    quoteEn: '"What if the truth lies outside your old ways, Umar? We have believed in Allah and His Messenger; do as you will!"'
  },
  {
    id: 'sz-stance-2',
    companionId: 'saeed-ibn-zayd',
    titleAr: 'بطولة اليرموك والترجل لكسر فرسان الروم',
    titleEn: 'Yarmouk: Dismounting on Foot to Break Byzantine Heavy Cavalry',
    categoryAr: 'بسالة وجهاد',
    categoryEn: 'Courage & Battle',
    periodAr: 'معركة اليرموك (15 هـ)',
    periodEn: 'Battle of Yarmouk (15 AH)',
    storyAr: 'في ملحمة اليرموك العظمى حيث تجمعت مئات الآلاف من جحافل الروم، اشتد الضغط على ميسرة المسلمين واقترب الروم من كسر الجناح. كان سعيد بن زيد يقود قلب الجيش، فلما رأى هجوم الروم جثا على ركبتيه طويلاً ودعا ربه بيقين، ثم وثب كالأسد وترجل عن فرسه وقال: "أما أنا فأعقر فرسي وأقاتل راجلاً في سبيل الله!". تقدم سعيد حاملاً سيفه وطعن قائد فرسان الروم فصرعه، فانقض المسلمون خلفه بردّة حاسمة قلبت موازين المعركة وسحقت جحافل الروم.',
    storyEn: 'At Yarmouk against overwhelming Byzantine legions, the Muslim left wing was buckling. Saeed dismounted, grounded his knees in tearful prayer, then charged on foot into the cavalry, slaying their commander and turning the tide of the entire battle.',
    impactAr: 'إنقاذ ميسرة جيش المسلمين وتثبيت الصفوف لتحقيق النصر الحاسم في تاريخ الشام.',
    impactEn: 'Turned imminent battlefield collapse into a world-historic victory that liberated the Levant.',
    quoteAr: '«يا رب، إني أشتري نفسي منك اليوم!»',
    quoteEn: '"O Lord, today I barter my soul unto You!"'
  },

  // --- Umar ibn Al-Khattab additional stances ---
  {
    id: 'um-stance-4',
    companionId: 'umar-ibn-khattab',
    titleAr: 'إعلان الإسلام في دار الأرقم وخروج أول مسيرة للكعبة',
    titleEn: 'Proclaiming Islam at Dar Al-Arqam & Public Prayer',
    categoryAr: 'شجاعة وصدع بالحق',
    categoryEn: 'Courage & Proclamation',
    periodAr: 'مكة المكرمة (السنة 6 من البعثة)',
    periodEn: 'Makkah (6th Year of Prophethood)',
    storyAr: 'حين أسلم عمر في دار الأرقم، سأل النبي ﷺ: "يا رسول الله، ألسنا على الحق إن متنا وإن حيينا؟" قال: «بلى»، فقال عمر: "ففيمَ الاختفاء إذن؟! والذي بعثك بالحق لتخرجن!". فخرج المسلمون لأول مرة في صفين متراصين؛ حمزة بن عبد المطلب على أحدهما، وعمر بن الخطاب على الآخر، حتى دخلوا المسجد الحرام وكفار قريش ينظرون إليهم بكآبة وحسرة لم يسبق لها مثيل، وصلى المسلمون جهراً عند الكعبة.',
    storyEn: 'Upon accepting Islam, Umar asked the Prophet ﷺ: "Are we not upon the truth whether we live or die?" The Prophet replied: "Yes." Umar declared: "Why then should we hide?! By Him who sent you with truth, we shall march out!" Muslims marched in two ranks led by Hamzah and Umar, praying publicly at the Ka\'bah for the first time.',
    impactAr: 'تحول تاريخي من مرحلة الاستضعاف والكتمان إلى مرحلة الجهر والعزة لدعوة التوحيد.',
    impactEn: 'Historic paradigm shift from clandestine worship to public proclamation and collective strength.',
    quoteAr: '«ألسنا على الحق؟ ففيم الاختفاء إذن؟! والذي بعثك بالحق لتخرجن!»',
    quoteEn: '"Are we not upon the truth? Why then remain hidden?! By Him Who sent you with the truth, we will step forth!"'
  },
  {
    id: 'um-stance-5',
    companionId: 'umar-ibn-khattab',
    titleAr: 'الهجرة العلنية وتحدي صناديد قريش عند الكعبة',
    titleEn: 'Open Migration: Daring the Tyrants of Quraysh',
    categoryAr: 'بسالة وثبات',
    categoryEn: 'Fearless Heroism',
    periodAr: 'الهجرة إلى المدينة (1 هـ)',
    periodEn: 'Migration to Madinah (1 AH)',
    storyAr: 'بينما كان أغلب المهاجرين يتسللون ليلاً خفية خوفاً من ملاحقة قريش وبطشها، توشح عمر بن الخطاب سيفه ووضع قوسه على عاتقه وأخذ أسهماً في يده، وأتى الكعبة وأشراف قريش في فنائها، فطاف سبعاً ثم صلى ركعتين عند مقام إبراهيم، ثم وقف على حلقهم وقال بصوته الجهوري المزلزل: "شاهت الوجوه! من أراد أن تثكله أمه، وييتم ولده، وترمل زوجته، فليلقني وراء هذا الوادي!". فما جرؤ رجل واحد من فرسان قريش على ملاحقته.',
    storyEn: 'While many migrated secretly to avoid torture, Umar armed himself, performed Tawaf around the Ka\'bah before the assembled Qurayshi chiefs, prayed at Maqam Ibrahim, and proclaimed loudly: "Wretched be these faces! Whoever wishes their mother to be bereaved, their child orphaned, and their wife widowed, let them meet me behind this valley!" Not a single soul dared pursue him.',
    impactAr: 'إسقاط هيبة الطغيان الجاهلي في عقر داره وإثبات أن قوة الإيمان تفوق كل جبروت.',
    impactEn: 'Shattered pagan arrogance in Makkah, demonstrating absolute psychological and spiritual supremacy.',
    quoteAr: '«من أراد أن تثكله أمه وييتم ولده وترمل زوجته فليلقني وراء هذا الوادي!»',
    quoteEn: '"Whoever wishes their mother bereaved and their wife widowed, meet me behind this valley!"'
  },

  // --- Uthman ibn Affan additional stances ---
  {
    id: 'ut-stance-4',
    companionId: 'uthman-ibn-affan',
    titleAr: 'شراء بئر رومة ووقف مائها العذب لعامة المسلمين',
    titleEn: 'Purchasing the Well of Ruma: Eternal Public Water Endowment',
    categoryAr: 'وقف وتكافل',
    categoryEn: 'Welfare & Endowment',
    periodAr: 'المدينة المنورة (العام 1 هـ)',
    periodEn: 'Madinah (1 AH)',
    storyAr: 'حين هاجر المسلمون إلى المدينة وجدوا ماءها مالحاً إلا بئر رومة، وكان يملكها رجل يهودي يبيع القربة بالدرهم ويغالي في أثمانها. فقال رسول الله ﷺ: «من يشتري بئر رومة فيجعل دلوه فيها كدلاء المسلمين وله بها عين في الجنة؟». فسارع عثمان واشتراها بخمسة وثلاثين ألف درهم وجعلها وقفاً مجانياً للمسلمين يشرب منها الغني والفقير وابن السبيل، وظلت أوقافها تنمو في المدينة إلى يومنا هذا كأقدم وقف مستمر في التاريخ الإسلامي.',
    storyEn: 'In early Madinah, drinking water was scarce except for the Well of Ruma owned by a merchant selling water at inflated rates. The Prophet ﷺ announced: "Whoever purchases Ruma, sharing his bucket equally with the Muslims, shall have a spring in Paradise." Uthman bought it for 35,000 dirhams as an eternal public trust.',
    impactAr: 'تأسيس ثقافة الأوقاف المائية المستدامة والمسؤولية الاجتماعية للثروة في بناء المجتمع.',
    impactEn: 'Pioneered the oldest continuous municipal water endowment, modeling humanitarian investment.',
    quoteAr: '«دلو عثمان فيها كدلاء عامة المسلمين»',
    quoteEn: '"Uthman\'s bucket is just like the bucket of any ordinary Muslim."'
  },
  {
    id: 'ut-stance-5',
    companionId: 'uthman-ibn-affan',
    titleAr: 'قافلة الإغاثة الكبرى في عام المجاعة بالمدينة',
    titleEn: 'The Famine Relief Caravan: Refusing 500% Profit for Allah',
    categoryAr: 'إيثار وإطعام',
    categoryEn: 'Altruism & Famine Relief',
    periodAr: 'خلافة أبي بكر الصديق (عام الرمادة)',
    periodEn: 'Caliphate of Abu Bakr',
    storyAr: 'أصاب الناس قحط شديد في عهد أبي بكر حتى ضاقت الحيل، فقدمت لعثمان من الشام قافلة تجارية ضخمة تحمل ألف بعير موقرة بالبر والزيت والزبيب. فتسابق تجار المدينة إلى داره يعرضون عليه أرباحاً طائلة: نربحك على الدرهم درهمين! قال: قد زادني، قالوا: أربعة دراهم! قال: قد زادني، قالوا: خمسة دراهم وما في المدينة تجار غيرنا فمن زادك؟! قال عثمان بيقين: "زادني الله بالدرهم عشرة حسنات إلى سبعمائة ضعف، هل عندكم زيادة؟" قالوا: لا، قال: "فإني أشهد الله أني جعلت ما حملت هذه الألف بعير صدقة على فقراء المسلمين ومساكينهم!".',
    storyEn: 'During intense famine, Uthman\'s 1,000-camel supply caravan arrived from the Levant. Local merchants competed, offering up to 500% profit. Uthman said: "I have been offered ten times more!" They asked: "Who can offer that?" He replied: "Allah gives ten deeds for every one, up to 700 times! I declare this entire caravan a free donation to the poor!"',
    impactAr: 'كسر الاحتكار وحماية الأمن الغذائي لفقراء العاصمة النبوية في أقسى أزماتها الاقتصادية.',
    impactEn: 'Eliminated famine profiteering, single-handedly feeding the entire impoverished population.',
    quoteAr: '«قد بعتها لمن يعطيني بالدرهم عشرة حسنات.. جعلتها صدقة لوجه الله»',
    quoteEn: '"I have sold it to the One Who grants ten rewards per dirham.. all of it is charity for Allah."'
  },

  // --- Ali ibn Abi Talib additional stances ---
  {
    id: 'al-stance-4',
    companionId: 'ali-ibn-abi-talib',
    titleAr: 'قضاء اليمن وحكمته الفذة: «أقضاكم علي»',
    titleEn: 'Chief Jurist of Yemen: "The Best Judge Among You Is Ali"',
    categoryAr: 'حكمة وقضاء',
    categoryEn: 'Wisdom & Justice',
    periodAr: 'إرساله إلى اليمن (10 هـ)',
    periodEn: 'Judicial Mission to Yemen (10 AH)',
    storyAr: 'بعث النبي ﷺ علياً قاضياً إلى اليمن وهو شاب، فقال علي هائباً: "يا رسول الله، تبعثني وأنا حديث السن لا علم لي بالقضاء؟" فوضع النبي ﷺ كفه الشريفة على صدر علي ودعا له: «اللهم اهدِ قلبه، وثبّت لسانه». قال علي: "فما شككت في قضاء بين اثنين بعد ذلك اليوم". وقضى في اليمن بقضايا أعجزت كبار الحكماء، فكان الفاروق عمر يقول لاحقاً في معضلات الفقه والقضاء: "لولا علي لهلك عمر، وأعوذ بالله من معضلة ليس لها أبو حسن!".',
    storyEn: 'When the Prophet ﷺ appointed young Ali as judge of Yemen, Ali felt hesitant. The Prophet ﷺ placed his hand on Ali\'s chest praying: "O Allah, guide his heart and affirm his tongue." Ali recalled: "Never did I doubt a judicial ruling afterwards." Caliph Umar later declared: "Were it not for Ali, Umar would have perished!"',
    impactAr: 'إرساء أعظم مدرسة في القضاء الإسلامي وفقه النوازل بالعدل والرحمة والفراسة الربانية.',
    impactEn: 'Established Islamic jurisprudential standards of fairness, evidenced by Caliph Umar\'s high reliance on him.',
    quoteAr: '«لولا علي لهلك عمر، ولا أبقاني الله لمعضلة ليس لها أبو حسن» (مقولة عمر بن الخطاب الشهيرة)',
    quoteEn: '"Were it not for Ali, Umar would have perished; may Allah never test me with a crisis where Abu Al-Hasan is absent."'
  },
  {
    id: 'al-stance-5',
    companionId: 'ali-ibn-abi-talib',
    titleAr: 'مبارزة يوم بدر وإسقاط صناديد الشرك',
    titleEn: 'The Battle of Badr: Slaying the Champions of Paganism',
    categoryAr: 'فروسية وجهاد',
    categoryEn: 'Martial Supremacy',
    periodAr: 'غزوة بدر الكبرى (2 هـ)',
    periodEn: 'Battle of Badr (2 AH)',
    storyAr: 'في بداية معركة بدر الكبرى خرج عتبة بن ربيعة وأخوه شيبة وابنه الوليد يطلبون المبارزة من أكفاء قريش، فأمر النبي ﷺ علياً وحمزة وعبيدة بن الحارث بالخروج إليهم. برز علي وهو فتى في مقتبل العشرين للوليد بن عتبة وكان من أشرس فتيان مكة، فما أمهله علي لحظة حتى ألحقه بضربة خاطفة صرعته أرضاً، ثم أسرع مع حمزة فأجهزا على شيبة وعتبة وحملا عبيدة بن الحارث جريحاً إلى رسول الله ﷺ.',
    storyEn: 'At the opening of Badr, Qurayshi duel champions stepped forward. The Prophet dispatched Ali, Hamzah, and Ubaydah. Ali engaged the fierce warrior Al-Walid ibn Utbah, dispatching him in seconds, then assisted in overcoming the remaining pagan champions.',
    impactAr: 'افتتاح المعركة بنصر نفسي ساحق زعزع أركان جيش المشركين وكان فاتحة انتصارات الإسلام.',
    impactEn: 'Delivered an immense psychological strike at the very inception of Badr, destabilizing enemy resolve.',
    quoteAr: '«أنا عبد الله وأخو رسوله، وأول من آمن به وجاهد معه»',
    quoteEn: '"I am the servant of Allah, brother of His Messenger, and the first to believe and fight alongside him."'
  },

  // --- Talha ibn Ubaydillah additional stance ---
  {
    id: 'tl-stance-3',
    companionId: 'talha-ibn-ubaydillah',
    titleAr: 'قضاء ديون المسلمين وصلة أرحام بني تيم',
    titleEn: 'Paying the Debts of Distressed Families',
    categoryAr: 'مروءة وصلة رحم',
    categoryEn: 'Compassion & Chivalry',
    periodAr: 'العهد الراشدي بالمدينة',
    periodEn: 'Rightly Guided Caliphate',
    storyAr: 'كان طلحة لا يدع أحداً من بني تيم عائلاً إلا كفاه مؤونته وقضى دينه وزوج أيّمه وأخدم عائله. وقد استدان منه رجل من الصحابة ثلاثين ألف درهم وعجز عن سدادها، فجاء خجلاً يعتذر لطلحة، فقال له طلحة فوراً بابتسامة المروءة: "هو لك حلال، وعليها مثلها معونة لك ولعيالك!". وكان يرسل سنوياً إلى أم المؤمنين عائشة رضي الله عنها بعشرة آلاف درهم براً بها وبأبيها الصديق.',
    storyEn: 'Talha never allowed any impoverished family of his clan to suffer debt, sponsoring weddings and widows. When a debtor came unable to repay 30,000 dirhams, Talha forgave the debt and gifted him an equal sum for his family, while regularly sending financial stipends to Aisha (R.A.).',
    impactAr: 'تجسيد الأثر العملي للأخوة الإيمانية وتحويل رأس المال إلى صمام أمان اجتماعي للمجتمع.',
    impactEn: 'Exemplified the Islamic welfare ethic where personal fortunes guarantee community dignity.',
    quoteAr: '«المال عارية مستردة، وخير ما خلّف المرء ما قدّمه بين يدي ربه»',
    quoteEn: '"Wealth is but a borrowed trust; the finest legacy a person leaves is that which they send forward to their Lord."'
  },

  // --- Az-Zubayr ibn Al-Awwam additional stance ---
  {
    id: 'zb-stance-3',
    companionId: 'az-zubayr-ibn-al-awwam',
    titleAr: 'اقتحام حصن بابليون بمصر والاعتلاء منفرداً بالتكبير',
    titleEn: 'Breaching the Fortress of Babylon in Egypt Solo',
    categoryAr: 'بطولة خارقة',
    categoryEn: 'Military Feat',
    periodAr: 'فتح مصر (20 هـ)',
    periodEn: 'Conquest of Egypt (20 AH)',
    storyAr: 'استعصى حصن بابليون الحصين على جيش عمرو بن العاص سبعة أشهر كاملة، فأرسل عمر بن الخطاب مدداً بقيادة الزبير بن العوام وكتب: "إني أمددتك بأربعة آلاف رجل على كل ألف رجل يقوم مقام الألف، منهم الزبير!". فلما وصل الزبير طاف حول الحصن ليدرس أسواره، ثم وضع سلماً طويلاً وصعد عليه وحده في غسق الليل شاهراً سيفه حتى علا قمة السور، ثم كبّر بأعلى صوته تكبيرة زلزلت الحصن فظن الروم أن المسلمين قد اقتحموا المعقل، وركض الزبير وفتح الباب الأعظم لتدفق جيوش الفتح.',
    storyEn: 'The massive Fortress of Babylon held out against siege for 7 months. Caliph Umar sent Az-Zubayr, noting that his presence equaled a thousand men. Az-Zubayr mounted a ladder onto the ramparts solo in the dark, roared Takbir, terrifying the defenders, and unlocked the gates.',
    impactAr: 'إسقاط أقوى قلاع الروم في مصر وفتح الطريق لتحرير وادي النيل بالكامل.',
    impactEn: 'Broke the impregnable Roman defense line, sealing the liberation of Egypt.',
    quoteAr: '«الله أكبر! فتحت مصر بإذن الله!»',
    quoteEn: '"Allahu Akbar! Egypt is opened by the permission of Allah!"'
  },

  // --- Abdur-Rahman ibn Awf additional stance ---
  {
    id: 'ar-stance-3',
    companionId: 'abdur-rahman-ibn-awf',
    titleAr: 'تسيير قافلة السبعمائة راحلة وارتجاج المدينة فرحاً',
    titleEn: 'The 700-Camel Caravan that Shook Madinah with Joy',
    categoryAr: 'جود وإنفاق',
    categoryEn: 'Massive Charity',
    periodAr: 'العهد المدني',
    periodEn: 'Madinah Era',
    storyAr: 'دخلت المدينة قافلة تجارية لعبد الرحمن بن عوف تضم سبعمائة راحلة محملة بالبر والطعام والبضائع، حتى ارتجت أزقة المدينة لغبارها وأصواتها. فقالت عائشة رضي الله عنها: "ما هذه الرجة؟" قالوا: قافلة عبد الرحمن بن عوف! فقالت: سمعت رسول الله ﷺ يقول: «قد رأيت عبد الرحمن بن عوف يدخل الجنة حبواً». فلما بلغت الكلمة عبد الرحمن بن عوف أسرع إلى عائشة وقال: "يا أماه، إن استطعت لأدخلنها قائماً! أشهدك أنها بأحمالها وأقتابها وأحلاسها صدقة في سبيل الله!".',
    storyEn: 'A vast caravan of 700 camels owned by Abdur-Rahman entered Madinah, shaking the streets. Aisha recalled the Prophet\'s words regarding Abdur-Rahman entering Paradise. Hearing this, he rushed to her: "O Mother of the Believers, if I can, I shall enter Paradise walking upright! Bear witness that this entire caravan with its loads is dedicated in Allah\'s cause!"',
    impactAr: 'إطعام المدينة المنورة بأسرها وترسيخ شكر النعمة بالبذل الكامل الفوري دون تردد.',
    impactEn: 'Fed the entirety of Madinah, turning vast mercantile success into instantaneous divine endowment.',
    quoteAr: '«يا أماه، إن استطعتُ لأدخلنّ الجنة قائماً.. هي كلها بأحمالها صدقة لوجه الله!»',
    quoteEn: '"O Mother of Believers, if I can, I shall enter Paradise walking upright.. the entire caravan is charity for Allah!"'
  },

  // --- Sa'd ibn Abi Waqqas additional stances ---
  {
    id: 'sd-stance-3',
    companionId: 'sad-ibn-abi-waqqas',
    titleAr: 'أول سهم رُمي في الإسلام في سرية عبيدة بن الحارث',
    titleEn: 'Firing the Very First Arrow in the History of Islam',
    categoryAr: 'أسبقية وشرف',
    categoryEn: 'Firsts of Islam',
    periodAr: 'سرية رابغ (1 هـ)',
    periodEn: 'Expedition of Rabigh (1 AH)',
    storyAr: 'في السنة الأولى للهجرة خرجت سرية بقيادة عبيدة بن الحارث فلقيت جمعاً من المشركين عند ماء يقال له أحياء، فوقعت المناوشة، فأخرج سعد بن أبي وقاص كنانته ونزع سهماً ورماهم به فكان أول سهم يُرمى دفاعاً عن الإسلام في التاريخ، وحمى به انسحاب المسلمين بمهارة فائقة.',
    storyEn: 'In the first year of Hijrah, during the patrol of Rabigh against pagan scouts, Sa\'d drew his bow and released an arrow, becoming the first Muslim in history to fire a defensive arrow in the cause of Islam.',
    impactAr: 'تسجيل سابقة تاريخية شريفة نال بها سعد لقب "أول من رمى بسهم في سبيل الله".',
    impactEn: 'Cemented his historic epithet: "The First to Shoot an Arrow in the Cause of Allah".',
    quoteAr: '«أنا أول من رمى بسهم في سبيل الله في الإسلام»',
    quoteEn: '"I am the first to shoot an arrow in the cause of Allah in Islam."'
  },
  {
    id: 'sd-stance-4',
    companionId: 'sad-ibn-abi-waqqas',
    titleAr: 'الثبات في بر أمه عند إضرابها ونزول القرآن فيه',
    titleEn: 'Firm Faith with Mother\'s Hunger Strike: Quranic Revelation',
    categoryAr: 'عقيدة وبر',
    categoryEn: 'Monotheism & Kinship',
    periodAr: 'مكة المكرمة (بداية البعثة)',
    periodEn: 'Early Makkah Period',
    storyAr: 'كان سعد باراً جداً بأمه حمنة بنت سفيان، فلما أسلم أقسمت ألا تأكل ولا تشرب ولا تستظل حتى يرجع عن دينه أو تموت فيُعيّر به فيقال "يا قاتل أمه". مكثت أياماً حتى غشي عليها وجف ريقها، فأتاها سعد ونظر في عينيها وقال بحنان بارّ ولكن بيقين لا يتزلزل: "يا أماه، تعلمين والله لو كانت لك مائة نفس فخرجت نفساً نفساً ما تركت ديني هذا لشيء! فإن شئت فكلي، وإن شئت فلا تأكلي". فلما رأت صلابته أكلت وشربت، وأنزل الله تعالى فيه قرآناً: ﴿وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حُسْنًا وَإِن جَاهَدَاكَ لِتُشْرِكَ بِي مَا لَيْسَ لَكَ بِهِ عِلْمٌ فَلَا تُطِعْهُمَا﴾.',
    storyEn: 'Sa\'d was intensely devoted to his mother. When he accepted Islam, she staged a hunger strike, refusing food, water, or shelter until he apostatized. Seeing her on the brink of death, Sa\'d said tenderly yet resolutely: "O mother, by Allah, even if you had a hundred souls departing one by one, I would never abandon my faith! Eat if you wish, or abstain." She relented, and Allah revealed verse 8 of Surah Al-Ankabut praising his steadfastness.',
    impactAr: 'نزول قرآن يُتلى في شأنه يرسم التوازن الدقيق بين بر الوالدين وحفظ التوحيد الخالص لله.',
    impactEn: 'Direct Quranic revelation establishing the boundary between filial piety and divine monotheism.',
    quoteAr: '«يا أماه، لو كانت لكِ مائة نفس فخرجت نفساً نفساً ما تركتُ ديني هذا لشيء!»',
    quoteEn: '"O mother, even if you possessed a hundred souls expiring one by one, I would never forsake my faith!"'
  },

  // --- Saeed ibn Zayd additional stance ---
  {
    id: 'sz-stance-3',
    companionId: 'saeed-ibn-zayd',
    titleAr: 'الزهد في إمارة دمشق وتفضيل الرباط جندياً في الثغور',
    titleEn: 'Declining the Governorship of Damascus to Remain a Sentry',
    categoryAr: 'زهد وتجرد',
    categoryEn: 'Asceticism & Service',
    periodAr: 'فتح دمشق (14 هـ)',
    periodEn: 'Conquest of Damascus (14 AH)',
    storyAr: 'بعد فتح دمشق استخلفه القائد أبو عبيدة بن الجراح أميراً ووالياً على دمشق لحكمته وتقواه، لكن سعيد بن زيد كتب إلى أبي عبيدة يطلب إعفاءه قائلاً: "ما كنت لأوثر نفسي عليك ولا على المسلمين بالدعة والراحة في القصور وأنتم في الثغور تجاهدون! ابعث إلى دمشق من ترى، وألحقني بك جندياً أقاتل في سبيل الله حتى ألقى ربي!". فنزل أبو عبيدة على رغبته وأرسل يزيد بن أبي سفيان، ومضى سعيد مجاهداً مرابطاً في سبيل الله دون أدنى رغبة في منصب أو إمارة.',
    storyEn: 'Appointed governor of conquered Damascus by Abu Ubaydah, Saeed declined, writing: "I will not indulge in palatial leisure while you fight in frontier outposts! Appoint whom you wish and permit me to remain an ordinary foot soldier." He remained an ascetic frontline warrior.',
    impactAr: 'تقديم درس خالد في التحرر من بريق السلطة والمناصب وابتغاء الثواب الأخروي الخالص.',
    impactEn: 'Demonstrated complete detachment from political prestige in favor of dedicated spiritual service.',
    quoteAr: '«ما كنت لأوثر نفسي بالراحة وأنتم في الثغور.. دعني جندياً في سبيل الله»',
    quoteEn: '"I would never prefer ease for myself while you are in the outposts.. let me be a soldier for Allah\'s sake."'
  },

  // --- Abu Ubaydah ibn Al-Jarrah stances ---
  {
    id: 'au-stance-1',
    companionId: 'abu-ubaydah-ibn-al-jarrah',
    titleAr: 'نزع حلقتي المغفر بأسنانه فداءً للنبي ﷺ يوم أحد',
    titleEn: 'Extracting Helmet Rings with His Teeth at Uhud',
    categoryAr: 'فداء وتضحية',
    categoryEn: 'Sacrifice & Devotion',
    periodAr: 'غزوة أحد (3 هـ)',
    periodEn: 'Battle of Uhud (3 AH)',
    storyAr: 'حين أصيب النبي ﷺ يوم أحد وغارت حلقتا المغفر في وجنته الشريفة، أقبل أبو بكر مسرعاً لينتزعهما، فبادره أبو عبيدة وأقسم عليه: "أنشدك بالله يا أبا بكر إلا تركتني أنزعهما!". فكره أبو عبيدة أن يجذبهما بيده فيؤلم رسول الله ﷺ، فعض على الحلقة الأولى بأسنانه عضاً شديداً ونضاها برفق حتى انتزعها، فسقطت ثنيته الأولى! ثم عض على الحلقة الثانية فانتزعها وسقطت ثنيته الثانية، فكان أحسن الناس هتماً وأجملهم ابتسامة فداءً للحبيب المصطفى ﷺ.',
    storyEn: 'At Uhud when two iron links of the helmet dug into the Prophet\'s cheek, Abu Ubaydah insisted on removing them. Fearing to hurt the Prophet with his hands, he used his teeth to pull the first link until his front tooth broke. He pulled the second link and his second tooth broke, turning his smile into an eternal badge of honor.',
    impactAr: 'ضرب أعظم مثل في الرقة والأدب والفداء في تطبيب جراح الحبيب المصطفى ﷺ.',
    impactEn: 'An immortal testament to tender compassion and supreme physical sacrifice for the Prophet ﷺ.',
    quoteAr: '«أنشدك الله يا أبا بكر إلا تركتني!»',
    quoteEn: '"I adjure you by Allah, O Abu Bakr, let me be the one!"'
  },
  {
    id: 'au-stance-2',
    companionId: 'abu-ubaydah-ibn-al-jarrah',
    titleAr: 'سرية سيف البحر وقيادة جيش الخبط في المجاعة',
    titleEn: 'Expedition of the Sea Shore: Commanding in Extreme Famine',
    categoryAr: 'صبر وقيادة',
    categoryEn: 'Leadership & Endurance',
    periodAr: 'سرية سيف البحر (8 هـ)',
    periodEn: 'Expedition of the Seashore (8 AH)',
    storyAr: 'أمّره رسول الله ﷺ على ثلاثمائة من الصحابة لملاقاة قريش، فنفد زاد الجيش حتى جاعوا جوعاً شديداً، فأمر أبو عبيدة بجمع كل ما مع الجند من تمر في جراب واحد فكان يوزع عليهم تمرة تمرة يمصونها كما يمص الصبي ثم يشربون عليها الماء، ثم صاروا يخبطون أوراق الشجر بعصيهم ليأكلوه حتى سُمي جيش الخبط! وصبر بحكمته حتى ألقى الله لهم حوتاً عظيماً من البحر (العنبر) فأكلوا منه وتزودوا شهراً كاملاً، فلما رجعوا للمدينة بارك النبي صنيع أبي عبيدة.',
    storyEn: 'Appointed over 300 men on the coastal expedition when food was completely depleted. Abu Ubaydah collected all remaining dates and rationed them one by one per man, until they ate tree leaves. His patience led them to a miraculous beached whale sustaining them for a month.',
    impactAr: 'أظهر براعة القائد في إدارة الموارد وقت المجاعة والحفاظ على وحدة وروح الجيش.',
    impactEn: 'Demonstrated masterclass logistical leadership and equitable rationing during severe famine.',
    quoteAr: '«اصبروا واحتسبوا؛ فإن مع العسر يسراً»',
    quoteEn: '"Be patient and seek reward; indeed ease accompanies hardship."'
  },
  {
    id: 'au-stance-3',
    companionId: 'abu-ubaydah-ibn-al-jarrah',
    titleAr: 'أمير الجيوش وفراش الحصى وبكاء الفاروق عمر',
    titleEn: 'Commander of the Levant on a Bed of Gravel: Umar\'s Tears',
    categoryAr: 'زهد وأمانة',
    categoryEn: 'Humility & Asceticism',
    periodAr: 'زيارة عمر للشام (17 هـ)',
    periodEn: 'Caliph Umar\'s Visit to Syria (17 AH)',
    storyAr: 'حين زار الفاروق عمر بن الخطاب بلاد الشام استقبله كبار القادة والولاة بالملابس الفاخرة والمواكب، فقال عمر: "أين أخي؟" قالوا: من؟ قال: "أبو عبيدة بن الجراح!". فجاء أبو عبيدة على ناقة مخطومة بحبل وعليه كساء رث، فتعانقا وبكيا طويلاً، ثم ذهب عمر إلى خيمة أبي عبيدة فلم يجد فيها أثاثاً ولا طعاماً سوى سيف وترس ورحل وإناء ماء وكسرات خبز يابسة. ففاضت عينا عمر بالدموع وقال: "ألا اتخذت لنفسك ما اتخذه أصحابك من المتاع؟!" فقال أبو عبيدة بابتسامة الراضين: "يا أمير المؤمنين، هذا يبلغنا المقيل (يوصلنا إلى القبر)، وإنما هي دنيا زائلة!". فبكى عمر حتى اخضلت لحيته وقال: «غيرتنا الدنيا كلنا غيرك يا أبا عبيدة!».',
    storyEn: 'Visiting Syria, Umar was greeted by commanders in regal garments. Umar asked: "Where is my brother Abu Ubaydah?" Abu Ubaydah arrived on a humble mount. Entering Abu Ubaydah\'s tent, Umar found only dry crusts, a water flask, and weapons. Umar wept: "Did you not acquire comfort like the others?" Abu Ubaydah smiled: "O Amir Al-Mu\'minin, this suffices to reach our resting place; this world is fleeting." Umar wept: "The world changed all of us except you, O Abu Ubaydah!"',
    impactAr: 'أرقى صورة في تاريخ القادة العسكريين الذين تحكموا بأعظم أقاليم العالم وهم يعيشون كأزهد النساك.',
    impactEn: 'The gold standard of incorruptibility: ruling prosperous Roman provinces while living in austere piety.',
    quoteAr: '«كلنا غيرتنا الدنيا غيرك يا أبا عبيدة!» (شهادة أمير المؤمنين عمر بن الخطاب)',
    quoteEn: '"The world changed every one of us except you, O Abu Ubaydah!" (Testimony of Caliph Umar)'
  },
  {
    id: 'au-stance-4',
    companionId: 'abu-ubaydah-ibn-al-jarrah',
    titleAr: 'طاعون عمواس ورفض ترك جنده لإنقاذ نفسه',
    titleEn: 'Plague of Amwas: Refusing to Abandon His Troops',
    categoryAr: 'وفاء ومسؤولية',
    categoryEn: 'Loyalty & Sacrifice',
    periodAr: 'طاعون عمواس (18 هـ)',
    periodEn: 'Plague of Amwas (18 AH)',
    storyAr: 'حين وقع طاعون عمواس بالشام خشي عمر بن الخطاب على أبي عبيدة، فكتب إليه كتاباً يطلب قدومه عاجلاً لأمر لا غنى لعمر عنه في المدينة، لكي ينقذه من الوباء. ففطن أبو عبيدة لمراد عمر وكتب إليه معتذراً بأدب جم: "إني قد عرفتُ حاجتك يا أمير المؤمنين، وإني في جند من المسلمين لا أرغب بنفسي عنهم، ولا أريد فراقهم حتى يقضي الله فيّ وفيهم قضاءه، فخلّني من عزيمتك ودعني مع جندي!". فبكى عمر بكاءً مراً حتى سأله الناس: "أمات أبو عبيدة؟" قال: "لا، ولكن الموت منه قريب"، واستشهد أبو عبيدة صابراً محتسباً.',
    storyEn: 'During the devastating plague of Amwas, Caliph Umar urgently summoned Abu Ubaydah to Madinah to save him. Abu Ubaydah declined politely, writing: "I am in the midst of the Muslim soldiers; I cannot prefer my life over theirs until Allah decrees our destiny. Release me from your order, O Amir Al-Mu\'minin!" Umar wept profusely upon reading the reply.',
    impactAr: 'أسمى معاني التضامن القيادي الإنساني حيث يموت القائد مع جنوده رافضاً الامتيازات الخاصة.',
    impactEn: 'Supreme ethical solidarity: a commander refusing special evacuation to suffer alongside his men.',
    quoteAr: '«إني في جند من المسلمين لا أرغب بنفسي عنهم حتى يقضي الله فيّ وفيهم»',
    quoteEn: '"I am among an army of Muslims; I will never value my life above theirs until Allah decrees our fate."'
  },

  // --- Talha ibn Ubaydillah extra stance ---
  {
    id: 'tl-stance-4',
    companionId: 'talha-ibn-ubaydillah',
    titleAr: 'بيعة الرضوان واستبساله في حراسة النبي ﷺ',
    titleEn: 'Pledge of the Tree & Constant Vigilance',
    categoryAr: 'ولاء وبيعة',
    categoryEn: 'Loyalty & Pledge',
    periodAr: 'صلح الحديبية (6 هـ)',
    periodEn: 'Treaty of Hudaybiyyah (6 AH)',
    storyAr: 'كان طلحة من أسرع المبايعين تحت الشجرة على الموت دفاعاً عن رسول الله ﷺ لما شاع مقتل عثمان، وكان لا يفارق مقربة النبي ﷺ يرمق تحركاته ويتفقد كل ثغرة حول معسكر المسلمين لرد أي غدر محتمل من مشركي مكة.',
    storyEn: 'Among the foremost to pledge death under the Tree at Hudaybiyyah when Uthman was reported killed. Talha stood perpetual sentry around the Prophet\'s tent, anticipating any pagan ambush.',
    impactAr: 'ترسيخ مبدأ الجاهزية القصوى والفداء المطلق للقيادة النبوية في أحرج المنعطفات.',
    impactEn: 'Demonstrated complete tactical readiness and readiness to die for the Prophet\'s protection.',
    quoteAr: '«نبايعك على الموت في سبيل الله ونصرة دينك!»',
    quoteEn: '"We pledge allegiance unto death in Allah\'s cause and for the victory of His faith!"'
  },

  // --- Az-Zubayr ibn Al-Awwam extra stance ---
  {
    id: 'zb-stance-4',
    companionId: 'az-zubayr-ibn-al-awwam',
    titleAr: 'اختراق صفوف الروم مرتين بمفرده يوم اليرموك',
    titleEn: 'Yarmouk: Piercing the Byzantine Army Twice Solo',
    categoryAr: 'شجاعة أسطورية',
    categoryEn: 'Legendary Valor',
    periodAr: 'معركة اليرموك (15 هـ)',
    periodEn: 'Battle of Yarmouk (15 AH)',
    storyAr: 'في معركة اليرموك لما اصطفت جحافل الروم بمئات الآلاف، قال الصحابة للزبير: "ألا تشد فنشد معك؟" فقال: "إن شددتُ قصرتم!". قالوا: "لا نفعل!"، فسلّ الزبير سيفه وانقض كالشهاب بمفرده على صفوف الروم فشقها حتى خرج من أقصاها، ثم استدار وانقض راجعاً فشق صفوفهم مرة ثانية وخرج إليهم وهو يبتسم وقد أصيب في عاتقه ضربتان بينهما ضربة كان النبي ﷺ يدخل أصبعه فيها يداعبه يوم بدر!',
    storyEn: 'At Yarmouk, companions asked Az-Zubayr to lead a charge. He warned they might not keep up. He charged solo into the Byzantine legion, cutting completely through to their rear lines, turned his horse around, and sliced through them a second time, emerging victorious with wounds on his shoulders.',
    impactAr: 'بث الرعب الشامل في صفوف الروم وكسر هيبة الجيوش الإمبراطورية الضخمة.',
    impactEn: 'Inflicted immense shock on the Byzantine command, proving individual Islamic prowess.',
    quoteAr: '«إن شددت قصرتم! ثم شد عليهم فشق صفوفهم مرتين»',
    quoteEn: '"He charged solo through the entire Roman host and cleaved his way back through them!"'
  },

  // --- Abdur-Rahman ibn Awf extra stance ---
  {
    id: 'ar-stance-4',
    companionId: 'abdur-rahman-ibn-awf',
    titleAr: 'تجرده التاريخي في شورى الخلافة الستة وتنازله',
    titleEn: 'Electoral Council: Voluntary Renunciation of Power',
    categoryAr: 'نزاهة وحكمة',
    categoryEn: 'Integrity & Statesmanship',
    periodAr: 'الشورى بعد وفاة عمر (23 هـ)',
    periodEn: 'Post-Umar Shura (23 AH)',
    storyAr: 'لما جعل عمر الخلافة شورى في ستة، قال عبد الرحمن بن عوف: "أيكم يخرج نفسه منها ويلي الاختيار؟" فسكتوا جميعاً، فقال عبد الرحمن بتجرد مطلق: "أنا أخرج نفسي منها، والله عليّ ألا آلو عن أفضلكم!". فطاف ليلتين كاملتين لا ينام إلا غراراً يسأل أهل المدينة والفرسان والشيوخ والنساء في خدورهن حتى أجمع رأي الناس على عثمان بن عفان فبايعه وتبعه المسلمون، وحمى الأمة من الفتنة.',
    storyEn: 'When Umar nominated six candidates for the Caliphate, Abdur-Rahman stepped forward saying: "Who among you will withdraw their candidacy to arbitrate?" All stayed silent. Abdur-Rahman immediately withdrew his own candidacy, spending two sleepless days consulting the populace before peacefully electing Uthman.',
    impactAr: 'أرقى سابقة في تاريخ تداول السلطة السلمي والنزاهة السياسية والتخلي عن منصب الخلافة طواعية.',
    impactEn: 'A watershed precedent in peaceful transition of power, voluntarily renouncing supreme leadership.',
    quoteAr: '«أنا أخرج نفسي منها، والله عليّ ألا آلو عن أفضلكم!»',
    quoteEn: '"I withdraw myself from consideration; and Allah is my witness that I shall not fail to pick the finest among you!"'
  },

  // --- Saeed ibn Zayd extra stance ---
  {
    id: 'sz-stance-4',
    companionId: 'saeed-ibn-zayd',
    titleAr: 'استجابة دعائه على من ظلمته في أرضه بالمدينة',
    titleEn: 'Miraculously Answered Prayer Against False Land Encroachment',
    categoryAr: 'كرامة ودعاء',
    categoryEn: 'Answered Prayer',
    periodAr: 'المدينة المنورة',
    periodEn: 'Madinah Period',
    storyAr: 'خاصمته أروى بنت أوس إلى مروان بن الحكم والي المدينة زاعمة أنه أخذ شيئاً من أرضها، فقال سعيد متألماً: "أتراني آخذ من أرضها بعد الذي سمعتُ من رسول الله ﷺ؟ سمعته يقول: «من أخذ شبراً من الأرض ظلماً طُوّقه إلى سبع أرضين يوم القيامة!»، اللهم إن كانت كاذبة فاعمِ بصرها واجعل قبرها في دارها!". فما مضت أيام حتى عميت المرأة، وبينما هي تمشي في دارها سقطت في بئرها فكان قبرها، وشاع في المدينة قول الناس: "أعاذك الله من دعوة سعيد بن زيد!".',
    storyEn: 'A woman named Arwa falsely claimed Saeed encroached on her land. Saeed quoted the Prophet: "Whoever usurps a handspan of land unjustly will be encircled with seven earths on Resurrection Day," then prayed: "O Allah, if she is lying, blind her eyes and make her grave in her home!" She lost her eyesight soon after and fell into her own well, making Saeed\'s prayers legendary.',
    impactAr: 'بيان خطورة الظلم والتعدي على حقوق الصالحين وسرعة استجابة دعوة المظلوم عند الله.',
    impactEn: 'A stark historic lesson on the peril of injustice and the instantaneous potency of a righteous man\'s prayer.',
    quoteAr: '«اللهم إن كانت كاذبة فاعمِ بصرها واجعل قبرها في دارها!»',
    quoteEn: '"O Allah, if she is lying, blind her sight and make her well her grave!"'
  }
];

// -------------------------------------------------------------
// 3. درر وحكم وأقوال مأثورة لكل صحابي (Wisdom Quotes)
// -------------------------------------------------------------
export const COMPANIONS_WISDOM_QUOTES: WisdomQuote[] = [
  // Abu Bakr
  {
    companionId: 'abu-bakr',
    quoteAr: '«أَيُّهَا النَّاسُ، إِنِّي قَدْ وُلِّيتُ عَلَيْكُمْ وَلَسْتُ بِخَيْرِكُمْ، فَإِنْ أَحْسَنْتُ فَأَعِينُونِي، وَإِنْ أَسَأْتُ فَقَوِّمُونِي... الصِّدْقُ أَمَانَةٌ، وَالكَذِبُ خِيَانَةٌ»',
    quoteEn: '"O people, I have been appointed over you though I am not the best among you. If I do well, help me; if I deviate, correct me... Truthfulness is trust, and falsehood is treason."',
    contextAr: 'من خطبة توليه الخلافة الراشدة التي أرست قواعد الحكم الدستوري والمسؤولية المشتركة.',
    contextEn: 'Inaugural address establishing democratic accountability and constitutional governance in Islam.'
  },
  {
    companionId: 'abu-bakr',
    quoteAr: '«احْرِصْ عَلَى المَوْتِ تُوهَبْ لَكَ الحَيَاةُ»',
    quoteEn: '"Be eager for honorable death, and true life shall be granted to you."',
    contextAr: 'وصيته الخالدة للقائد خالد بن الوليد عند إرساله لفتوح الشام والعراق.',
    contextEn: 'His immortal counsel to general Khalid ibn Al-Walid before embarking on liberation campaigns.'
  },
  {
    companionId: 'abu-bakr',
    quoteAr: '«أَكْيَسُ الكَيْسِ التَّقْوَى، وَأَحْمَقُ الحُمْقِ الفُجُورُ»',
    quoteEn: '"The sharpest intellect is piety, and the sheerest foolishness is transgression."',
    contextAr: 'من روائع حكمه في ميزان العقل الحقيقي ومقاييس البصيرة الإيمانية.',
    contextEn: 'His foundational aphorism on true wisdom and moral intellect.'
  },

  // Umar ibn Al-Khattab
  {
    companionId: 'umar-ibn-khattab',
    quoteAr: '«حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُوزَنُوا، فَإِنَّهُ أَهْوَنُ عَلَيْكُمْ فِي حِسَابِ غَدٍ أَنْ تُحَاسِبُوا أَنْفُسَكُمُ اليَوْمَ»',
    quoteEn: '"Hold yourselves accountable before you are held to account, and weigh your deeds before they are weighed for you."',
    contextAr: 'موعظته المنبرية الشهيرة في تربية النفس واستحضار رهبة اليوم الآخر.',
    contextEn: 'His celebrated sermon on rigorous self-reckoning before the Day of Judgment.'
  },
  {
    companionId: 'umar-ibn-khattab',
    quoteAr: '«مَتَى اسْتَعْبَدْتُمُ النَّاسَ وَقَدْ وَلَدَتْهُمْ أُمَّهَاتُهُمْ أَحْرَارًا؟!»',
    quoteEn: '"Since when have you enslaved people while their mothers bore them free?!"',
    contextAr: 'قولته الخالدة لعمرو بن العاص واليه على مصر وابنه حين ضرب قبطياً.',
    contextEn: 'His historic proclamation of innate human liberty delivered to the governor of Egypt.'
  },
  {
    companionId: 'umar-ibn-khattab',
    quoteAr: '«تَفَقَّهُوا قَبْلَ أَنْ تُسَوَّدُوا، فَإِنَّكُمْ إِنْ سُدْتُمْ اسْتَحْيَيْتُمْ أَنْ تَتَعَلَّمُوا»',
    quoteEn: '"Attain profound knowledge before you are elevated to leadership, for once in office you will feel too shy to learn."',
    contextAr: 'توجيهه للشباب وطلاب العلم في ترسيخ الفقه قبل الرئاسة والشهرة.',
    contextEn: 'His educational counsel on mastering scholarly jurisprudence prior to assuming leadership.'
  },

  // Uthman ibn Affan
  {
    companionId: 'uthman-ibn-affan',
    quoteAr: '«لَوْ أَنَّ قُلُوبَنَا طَهُرَتْ مَا شَبِعَتْ مِنْ كَلَامِ رَبِّنَا»',
    quoteEn: '"If our hearts were truly pure, they would never tire or satisfy their yearning for the words of our Lord."',
    contextAr: 'في بيان أثر طهارة الباطن في تذوق حلاوة تلاوة القرآن وتدبر آياته.',
    contextEn: 'His profound reflection on spiritual purity and ceaseless love for Quranic recitation.'
  },
  {
    companionId: 'uthman-ibn-affan',
    quoteAr: '«إِنَّ اللَّهَ يَزَعُ بِالسُّلْطَانِ مَا لَا يَزَعُ بِالقُرْآنِ»',
    quoteEn: '"Indeed Allah restrains through authority and justice that which is not restrained by the Quran alone."',
    contextAr: 'في أهمية إقامة العدل وتطبيق القوانين وحماية الأمن العام لردع الظالمين.',
    contextEn: 'Foundational principle of political jurisprudence on law enforcement and social order.'
  },

  // Ali ibn Abi Talib
  {
    companionId: 'ali-ibn-abi-talib',
    quoteAr: '«قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ»',
    quoteEn: '"The worth of every human being is that which they master with excellence."',
    contextAr: 'من أبلغ جوامع الكلم في الحث على إتقان العلم والعمل والمهارة النافعة.',
    contextEn: 'One of his most renowned maxims celebrating craftsmanship, mastery, and expertise.'
  },
  {
    companionId: 'ali-ibn-abi-talib',
    quoteAr: '«النَّاسُ صِنْفَانِ: إِمَّا أَخٌ لَكَ فِي الدِّينِ، أَوْ نَظِيرٌ لَكَ فِي الخَلْقِ»',
    quoteEn: '"People are of two kinds: either a brother to you in faith, or an equal to you in humanity."',
    contextAr: 'من عهده الخالد لواليه على مصر مالك الأشتر في إرساء المواطنة والعدل مع جميع البشر.',
    contextEn: 'His eternal decree to his governor outlining universal brotherhood and human equality.'
  },
  {
    companionId: 'ali-ibn-abi-talib',
    quoteAr: '«العِلْمُ يَحْرُسُكَ وَأَنْتَ تَحْرُسُ المَالَ، وَالعِلْمُ حَاكِمٌ وَالمَالُ مَحْكُومٌ عَلَيْهِ»',
    quoteEn: '"Knowledge guards you while you must guard wealth; knowledge is sovereign, while wealth is subordinate."',
    contextAr: 'وصيته لكميل بن زياد في تفضيل العلم النافع على حطام الدنيا.',
    contextEn: 'His famous discourse to Kumayl comparing the spiritual supremacy of knowledge over worldly wealth.'
  },

  // Talha ibn Ubaydillah
  {
    companionId: 'talha-ibn-ubaydillah',
    quoteAr: '«إِنَّ لِلْمَعْرُوفِ ثَمَنًا، فَمَنْ شَحَّ بِمَالِهِ بَخِلَ بِعِرْضِهِ»',
    quoteEn: '"Doing good has a price; whoever is stingy with their wealth has jeopardized their honor."',
    contextAr: 'في فلسفة الجود وصلة الرحم وإعانة المتعففين.',
    contextEn: 'His reflections on noble generosity and preserving moral honor through selfless giving.'
  },
  {
    companionId: 'talha-ibn-ubaydillah',
    quoteAr: '«كَسْبُ المَالِ بِعِزَّةِ النَّفْسِ أَيْسَرُ مِنْ حِفْظِهِ، وَإِنْفَاقُهُ فِي طَاعَةِ اللَّهِ هُوَ حِفْظُهُ الحَقِيقِيُّ»',
    quoteEn: '"Earning wealth with dignified honor is easier than hoarding it; spending it in obedience to Allah is its true preservation."',
    contextAr: 'توجيهه للشباب والتجار في كيفية إدارة الثروة بالبذل والإيثار.',
    contextEn: 'His financial philosophy on managing fortune through strategic philanthropy.'
  },
  {
    companionId: 'talha-ibn-ubaydillah',
    quoteAr: '«مَا اسْتَغْنَى أَحَدٌ بِاللَّهِ إِلَّا افْتَقَرَ النَّاسُ إِلَيْهِ، وَمَا تَمَسَّكَ رَجُلٌ بِالحَقِّ إِلَّا أَعَزَّهُ اللَّهُ»',
    quoteEn: '"None seeks sufficiency through Allah except that people seek him, and none clings to the truth except that Allah elevates him."',
    contextAr: 'في عزة التوكل على الله والتمسك بمبادئ الحق.',
    contextEn: 'On spiritual self-sufficiency and moral steadfastness.'
  },

  // Az-Zubayr ibn Al-Awwam
  {
    companionId: 'az-zubayr-ibn-al-awwam',
    quoteAr: '«يَا بُنَيَّ، إِنْ عَجَزْتَ عَنْ دَيْنِي فَاسْتَعِنْ بِمَوْلَايَ.. قَالَ ابْنُهُ: مَنْ مَوْلَاكَ يَا أَبَتِ؟ قَالَ: اللهُ! فَمَا وَقَعْتُ فِي كُرْبَةٍ إِلَّا قُلْتُ: يَا مَوْلَى الزُّبَيْرِ اقْضِ عَنْهُ دَيْنَهُ، فَيَقْضِيهِ»',
    quoteEn: '"O my son, if you are unable to settle my debts, seek help from my Patron... His son asked: Who is your Patron, father? He said: Allah! And never did I face difficulty except that I called: O Patron of Az-Zubayr, settle his debt, and it was settled."',
    contextAr: 'وصيته لابنه عبد الله بن الزبير قبل استشهاده مبرزاً صدق التوكل على الله في الديون.',
    contextEn: 'His moving final bequest to his son embodying transcendental reliance on the Almighty.'
  },
  {
    companionId: 'az-zubayr-ibn-al-awwam',
    quoteAr: '«الشَّجَاعَةُ صَبْرُ سَاعَةٍ، وَمَنْ خَافَ اللَّهَ أَمَّنَهُ اللَّهُ مِنْ كُلِّ شَيْءٍ، وَمَنْ خَافَ غَيْرَهُ خَوَّفَهُ اللَّهُ مِنْ كُلِّ شَيْءٍ»',
    quoteEn: '"Courage is but an hour of endurance. Whoever fears Allah, Allah shields him from all things; whoever fears others, Allah makes him fear everything."',
    contextAr: 'في تربية الفرسان وعقيدة الإقدام ورباطة الجأش.',
    contextEn: 'On martial fortitude and the supreme psychological fearlessness born of God-consciousness.'
  },
  {
    companionId: 'az-zubayr-ibn-al-awwam',
    quoteAr: '«مَنِ اسْتَطَاعَ مِنْكُمْ أَنْ يَكُونَ لَهُ خَبْءٌ مِنْ عَمَلٍ صَالِحٍ فَلْيَفْعَلْ»',
    quoteEn: '"Whoever among you is able to have a secret cache of righteous deeds hidden from everyone, let him do so."',
    contextAr: 'وصيته المشهورة في إخفاء الأعمال الصالحة والصدقات عن أعين الناس لنيل الإخلاص.',
    contextEn: 'His celebrated counsel on maintaining private righteous deeds known only to the Creator.'
  },

  // Abdur-Rahman ibn Awf
  {
    companionId: 'abdur-rahman-ibn-awf',
    quoteAr: '«ابْتُلِينَا مَعَ رَسُولِ اللَّهِ ﷺ بِالضَّرَّاءِ فَصَبَرْنَا، ثُمَّ ابْتُلِينَا بِالسَّرَّاءِ بَعْدَهُ فَلَمْ نَصْبِرْ!»',
    quoteEn: '"We were tested alongside the Messenger of Allah with hardship and we persevered; then we were tested with prosperity after him, and we could hardly bear it!"',
    contextAr: 'تحذيره من فتنة ترف الدنيا وحرصه على سلامة القلوب من الركون للثروة.',
    contextEn: 'His warning that the spiritual trial of luxury and wealth can be far harder than that of poverty.'
  },
  {
    companionId: 'abdur-rahman-ibn-awf',
    quoteAr: '«إِنِّي لَا أَبِيعُ بِنَسِيئَةٍ، وَلَا أَكْتُمُ عَيْبًا، وَأَرْضَى بِالرِّبْحِ اليَسِيرِ.. وَاللَّهِ لَوْ رَفَعْتُ حَجَرًا لَرَجَوْتُ أَنْ أَجِدَ تَحْتَهُ ذَهَبًا بِبَرَكَةِ الصِّدْقِ»',
    quoteEn: '"I never sell on deceptive delay, never conceal a flaw, and remain satisfied with modest profit. By Allah, if I lifted a rock, I would expect to find gold beneath it through the blessing of honesty."',
    contextAr: 'سر نجاحه الاستثماري المعجز وأخلاقيات التجارة التي سار عليها.',
    contextEn: 'The core business principles behind his legendary ethical commercial triumph.'
  },
  {
    companionId: 'abdur-rahman-ibn-awf',
    quoteAr: '«خَيْرُ المَالِ مَا أَعَانَ عَلَى تَقْوَى اللَّهِ، وَوَقَى العِرْضَ، وَسَدَّ خَلَّةَ الفَقِيرِ»',
    quoteEn: '"The best of wealth is that which aids in devotion to Allah, shields personal dignity, and fills the void of the poor."',
    contextAr: 'في ميزان تفاضل الأموال والغنى الشاكر.',
    contextEn: 'On the social utility of wealth and purposeful financial stewardship.'
  },

  // Sa'd ibn Abi Waqqas
  {
    companionId: 'sad-ibn-abi-waqqas',
    quoteAr: '«إِذَا أَرَدْتَ أَنْ تُسْتَجَابَ دَعْوَتُكَ، فَأَطِبْ مَطْعَمَكَ وَلَا تُدْخِلْ بَطْنَكَ حَرَامًا»',
    quoteEn: '"If you desire your prayers to be answered, ensure your livelihood and food are pure, and never let anything forbidden enter your stomach."',
    contextAr: 'سر استجابة دعائه كما علمه النبي ﷺ: «يا سعد أطب مطعمك تكن مستجاب الدعوة».',
    contextEn: 'The core spiritual discipline behind answered supplications as taught directly by the Prophet ﷺ.'
  },
  {
    companionId: 'sad-ibn-abi-waqqas',
    quoteAr: '«يَا بُنَيَّ، إِيَّاكَ وَالطَّمَعَ؛ فَإِنَّهُ فَقْرٌ حَاضِرٌ، وَعَلَيْكَ بِاليَأْسِ مِمَّا فِي أَيْدِي النَّاسِ، فَإِنَّهُ الغِنَى»',
    quoteEn: '"O my son, beware of greed, for it is present poverty; cling to independence from that which people possess, for that is true wealth."',
    contextAr: 'وصيته التربوية لأبنائه في التحرر من التطلع لما عند المخلوقين.',
    contextEn: 'His fatherly advice on contentment and emotional freedom from coveting the possessions of others.'
  },
  {
    companionId: 'sad-ibn-abi-waqqas',
    quoteAr: '«إِنَّ اللَّهَ يُحِبُّ العَبْدَ التَّقِيَّ، الغَنِيَّ، الخَفِيَّ»',
    quoteEn: '"Indeed Allah loves the servant who is God-fearing, self-sufficient in heart, and devoted in quiet anonymity."',
    contextAr: 'روايته لحديث النبي وتطبيقه العملي له حين اعتزل الفتن في مزرعته بالعقيق.',
    contextEn: 'His transmission of the prophetic hadith and his personal lifestyle of quiet contemplative devotion.'
  },

  // Saeed ibn Zayd
  {
    companionId: 'saeed-ibn-zayd',
    quoteAr: '«وَاللَّهِ لَمَشْهَدُ رَجُلٍ مِنْهُمْ مَعَ رَسُولِ اللَّهِ ﷺ يَغْبَرُّ فِيهِ وَجْهُهُ، خَيْرٌ مِنْ عَمَلِ أَحَدِكُمْ وَلَوْ عُمِّرَ عُمُرَ نُوحٍ!»',
    quoteEn: '"By Allah, a single moment where one companion\'s face gathered dust alongside the Messenger of Allah ﷺ is greater than the lifelong deeds of any of you, even if you lived the lifespan of Noah!"',
    contextAr: 'في بيان فضل صحبة رسول الله ﷺ وشرف الجهاد في معيته.',
    contextEn: 'His testament on the peerless virtue of accompanying and defending Prophet Muhammad ﷺ.'
  },
  {
    companionId: 'saeed-ibn-zayd',
    quoteAr: '«إِيَّاكُمْ وَالظُّلْمَ؛ فَإِنَّ دَعْوَةَ المَظْلُومِ لَيْسَ بَيْنَهَا وَبَيْنَ اللَّهِ حِجَابٌ، وَلَوْ بَعْدَ حِينٍ»',
    quoteEn: '"Beware of injustice! For between the supplication of the oppressed and Allah there is no veil, even if answered after a while."',
    contextAr: 'موعظته لأهل الكوفة والمدينة في التحذير من التعدي على حقوق الآخرين.',
    contextEn: 'His warning on the inviolability of human rights and the guaranteed vengeance of divine justice.'
  },
  {
    companionId: 'saeed-ibn-zayd',
    quoteAr: '«مَنْ لَمْ يَرْضَ بِالقَلِيلِ لَمْ يَشْبَعْ بِالكَثِيرِ، وَمَنْ أَرَادَ كَرَامَةَ الآخِرَةِ هَانَتْ عَلَيْهِ مَصَائِبُ الأُولَى»',
    quoteEn: '"Whoever is not content with little will never be sated with much; whoever yearns for the honor of the Hereafter finds the calamities of this world light to bear."',
    contextAr: 'في أدب الزهد والرضا بالقضاء والقدر.',
    contextEn: 'On the serenity of spiritual contentment and the enduring perspective of eternity.'
  },

  // Abu Ubaydah ibn Al-Jarrah
  {
    companionId: 'abu-ubaydah-ibn-al-jarrah',
    quoteAr: '«أَلَا رُبَّ مُبَيِّضٍ لِثِيَابِهِ مُدَنِّسٍ لِدِينِهِ! وَأَلَا رُبَّ مُكْرِمٍ لِنَفْسِهِ وَهُوَ لَهَا مُهِينٌ!»',
    quoteEn: '"Beware! How many bleach their outer garments while soiling their faith! And how many pamper their ego while utterly humiliating their soul!"',
    contextAr: 'من خطبته في بلاد الشام مذكراً بحقيقة نقاء الباطن على نقاء الظاهر.',
    contextEn: 'His Syrian sermon contrasting superficial vanity with profound inner spiritual purity.'
  },
  {
    companionId: 'abu-ubaydah-ibn-al-jarrah',
    quoteAr: '«يَا أَيُّهَا النَّاسُ، إِنِّي امْرُؤٌ مِنْ قُرَيْشٍ، وَمَا مِنْكُمْ مِنْ أَحْمَرَ وَلَا أَسْوَدَ يَفْضُلُنِي بِتَقْوَى إِلَّا وَدِدْتُ أَنِّي فِي مِسْلَاخِهِ!»',
    quoteEn: '"O people, I am merely a man from Quraysh; there is none among you, red or black, who surpasses me in Taqwa except that I wish I were in his skin!"',
    contextAr: 'خطبته لجيوش الشام في إرساء المساواة الإنسانية وإسقاط العنصرية.',
    contextEn: 'His address to the Levantine army abolishing tribal supremacism in favor of pure piety.'
  },
  {
    companionId: 'abu-ubaydah-ibn-al-jarrah',
    quoteAr: '«إِنَّمَا نَحْنُ فِي هَذِهِ الدُّنْيَا رَكْبٌ قُعُودٌ، تَمْشِي بِنَا أَيَّامُنَا إِلَى مَنَازِلِنَا فِي الآخِرَةِ»',
    quoteEn: '"In this world we are but seated travelers; our days carry us forward continuously to our eternal abode in the Hereafter."',
    contextAr: 'في استحضار قصر الأمل وحقيقة الارتحال السريع من هذه الدار.',
    contextEn: 'On the rapid transit of earthly life toward the immortal Hereafter.'
  }
];

// Helper functions
export const getCompanionTraits = (companionId: string): CompanionTraits | undefined => {
  return COMPANIONS_TRAITS_MAP[companionId];
};

export const getCompanionHeroicStances = (companionId: string): HeroicStance[] => {
  return COMPANIONS_HEROIC_STANCES.filter(s => s.companionId === companionId);
};

export const getCompanionWisdomQuotes = (companionId: string): WisdomQuote[] => {
  return COMPANIONS_WISDOM_QUOTES.filter(q => q.companionId === companionId);
};
