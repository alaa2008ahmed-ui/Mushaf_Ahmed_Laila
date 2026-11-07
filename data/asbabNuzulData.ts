// موسوعة أسباب النزول المباشرة والقصص النبوية للآيات القرآنية
// تشمل أسباب النزول المسندة عن الواحدي والسيوطي وابن كثير والقرطبي والبخاري ومسلم،
// بالإضافة إلى سياق النزول وقصص الأنبياء لجميع سور وآيات المصحف الشريف.

export interface SababNuzulEntry {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  verseSnippet?: string;
  storyTitleAr: string;
  storyTitleEn?: string;
  causeAr: string; // الحادثة أو السؤال أو الواقعة النبوية
  causeEn?: string;
  sourceAr: string; // المصدر مثل صحيح البخاري، الواحدي، السيوطي
  sourceEn?: string;
  lessonAr: string; // العبرة والدروس المستفادة
  lessonEn?: string;
}

// 1. قاعدة بيانات أسباب النزول المباشرة والقصص المشهورة
export const ASBAB_NUZUL_DATABASE: SababNuzulEntry[] = [
  // --- سورة الفاتحة ---
  {
    surahNumber: 1,
    surahName: 'الفاتحة',
    ayahNumber: 1,
    verseSnippet: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    storyTitleAr: 'نزول أم الكتاب وفاتحة القرآن',
    storyTitleEn: 'Revelation of the Opening Surah of the Quran',
    causeAr: 'كان رسول الله ﷺ إذا برز سمع منادياً يناديه: يا محمد! فإذا سمع الصوت انطلق هارباً، فقال له ورقة بن نوفل: إذا سمعت الصوت فاثبت حتى تسمع ما يقول. فلما برز ناداه جبريل: يا محمد، قل: بسم الله الرحمن الرحيم، الحمد لله رب العالمين... حتى فرغ من فاتحة الكتاب.',
    causeEn: 'Whenever the Messenger of Allah ﷺ went out, he heard a caller calling him: "O Muhammad!" When Waraqah ibn Nawfal advised him to stand firm and listen, Gabriel called him: "O Muhammad, say: In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of the worlds..." completing the Mother of the Book.',
    sourceAr: 'أسباب النزول للواحدي / رواية علي بن أبي طالب رضي الله عنه',
    sourceEn: 'Asbab Al-Nuzul by Al-Wahidi / Narrated by Ali ibn Abi Talib (RA)',
    lessonAr: 'أعظم سورة في القرآن، وهي الشافية والكافية والسبع المثاني التي افتتح الله بها كتابه الكريم.',
    lessonEn: 'The greatest Surah in the Quran, the opener, healer, and the Seven Oft-Repeated Verses.'
  },

  // --- سورة البقرة ---
  {
    surahNumber: 2,
    surahName: 'البقرة',
    ayahNumber: 115,
    verseSnippet: 'وَلِلَّهِ الْمَشْرِقُ وَالْمَغْرِبُ ۚ فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ',
    storyTitleAr: 'صلاة الصحابة في الليلة المظلمة وتحري القبلة',
    storyTitleEn: 'Prayer of the Companions in the Dark Night Seeking Qibla',
    causeAr: 'خرجت سرية مع رسول الله ﷺ في ليلة مظلمة مغممة، فلم يعرفوا أين القبلة، فصلى كل رجل منهم إلى جهة وخطوا خطوطاً أمامهم، فلما أصبحوا وجدوا أنهم صلوا لغير القبلة، فذكروا ذلك للنبي ﷺ فنزلت الآية رحمة وتيسيراً.',
    causeEn: 'A detachment set out with the Prophet ﷺ on a pitch-black overcast night and could not discern Qibla direction. Each person prayed towards an estimated direction and drew lines. In the morning they realized they prayed away from Qibla, so Allah revealed this verse as mercy and ease.',
    sourceAr: 'جامع الترمذي وسنن ابن ماجه عن جابر بن عبد الله رضي الله عنه',
    sourceEn: 'Jami at-Tirmidhi & Sunan Ibn Majah from Jabir ibn Abdillah (RA)',
    lessonAr: 'رحمة الشريعة الإسلامية وسعتها، وأن من اجتهد في طلب الحق مخلصاً فصلاته صحيحة مقبولة.',
    lessonEn: 'The expansive mercy of Islamic law: sincere individual reasoning (Ijtihad) in worship is valid and accepted.'
  },
  {
    surahNumber: 2,
    surahName: 'البقرة',
    ayahNumber: 144,
    verseSnippet: 'قَدْ نَرَىٰ تَقَلُّبَ وَجْهِكَ فِي السَّمَاءِ ۖ فَلَنُوَلِّيَنَّكَ قِبْلَةً تَرْضَاهَا',
    storyTitleAr: 'شوق النبي ﷺ لتحويل القبلة إلى الكعبة المشرفة',
    storyTitleEn: 'The Prophet\'s Longing for the Qibla Change to the Kaaba',
    causeAr: 'كان رسول الله ﷺ يصلي نحو بيت المقدس ستة عشر أو سبعة عشر شهراً بعد الهجرة، وكان يحب ويتمنى أن يُوجَّه إلى قبلة أبيه إبراهيم نحو الكعبة، فكان يدعو ويقلب وجهه في آفاق السماء ينتظر جبريل بالوحي، فاستجاب الله لرجائه وأنزل الآية الكريمة وهو في صلاة الظهر بمسجد بني سلمة (مسجد القبلتين).',
    causeEn: 'The Prophet ﷺ prayed towards Jerusalem for 16-17 months after Hijrah, while yearning to be turned towards Abraham\'s Qibla (Kaaba). He turned his face towards heaven in supplication until Allah granted his wish during Dhuhr prayer at Masjid Al-Qiblatayn.',
    sourceAr: 'صحيح البخاري وصحيح مسلم عن البراء بن عازب رضي الله عنه',
    sourceEn: 'Sahih al-Bukhari & Sahih Muslim from Al-Baraa ibn Aazib (RA)',
    lessonAr: 'مكانة الحبيب المصطفى ﷺ عند ربه، واستجابة دعائه وإكرامه بتبديل القبلة لأحب البقاع إليه.',
    lessonEn: 'The honored status of Prophet Muhammad ﷺ before his Lord and the divine fulfillment of his heart\'s desire.'
  },
  {
    surahNumber: 2,
    surahName: 'البقرة',
    ayahNumber: 186,
    verseSnippet: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    storyTitleAr: 'سؤال الأعرابي: أربنا قريب فنناجيه أم بعيد فنناديه؟',
    storyTitleEn: 'The Bedouin\'s Question: Is Our Lord Near so We May Whisper to Him?',
    causeAr: 'جاء أعرابي إلى رسول الله ﷺ فقال: يا رسول الله، أقريب ربنا فنناجيه، أم بعيد فنناديه؟ فسكت النبي ﷺ، فأنزل الله عز وجل هذه الآية رداً حنوناً مباشراً: {وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ}.',
    causeEn: 'A Bedouin asked the Prophet ﷺ: "O Messenger of Allah, is our Lord near so we may whisper to Him, or far so we must call out?" The Prophet ﷺ remained silent until Allah revealed this direct tender response: "And when My servants ask you concerning Me, indeed I am near."',
    sourceAr: 'تفسير ابن كثير والدر المنثور للسيوطي',
    sourceEn: 'Tafsir Ibn Kathir & Al-Durr Al-Manthur by Al-Suyuti',
    lessonAr: 'قرب الله ولطفه بالمؤمنين، وسقوط كل واسطة في الدعاء والرجاء بين العبد وربه.',
    lessonEn: 'Allah\'s absolute closeness and tenderness to believers; no intermediary exists between a servant and Allah.'
  },
  {
    surahNumber: 2,
    surahName: 'البقرة',
    ayahNumber: 255,
    verseSnippet: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    storyTitleAr: 'نزول آية الكرسي وعظمتها في التوحيد',
    storyTitleEn: 'Revelation of Ayat al-Kursi, the Greatest Verse',
    causeAr: 'نزلت آية الكرسي بياناً لأعظم صفات الربوبية والألوهية ونفي النقص والعجز والجهل عن الله عز وجل، ورداً على سؤلات المشركين واليهود الذين نسبوا الاستراحة لله بعد خلق السماوات والأرض، فبيّن الله أنه الحي القيوم الذي لا تأخذه سنة ولا نوم.',
    causeEn: 'Ayat al-Kursi was revealed establishing the supreme attributes of divine oneness and refuting any notion of fatigue, sleep, or limitation attributed to Allah by polytheists and skeptics.',
    sourceAr: 'صحيح مسلم وتفسير الطبري عن أبي بن كعب رضي الله عنه',
    sourceEn: 'Sahih Muslim & Tafsir al-Tabari from Ubayy ibn Ka\'b (RA)',
    lessonAr: 'آية الكرسي هي أعظم آية في كتاب الله، تحفظ قارئها وتورث في القلب عظمة الله وكبرياءه.',
    lessonEn: 'Ayat al-Kursi is the greatest verse in the Quran, providing divine protection and instilling awe of Allah.'
  },

  // --- سورة آل عمران ---
  {
    surahNumber: 3,
    surahName: 'آل عمران',
    ayahNumber: 103,
    verseSnippet: 'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا',
    storyTitleAr: 'فتنة اليهودي شاس بن قيس بين الأوس والخزرج',
    storyTitleEn: 'The Provocation of Shas ibn Qays Between Aws and Khazraj',
    causeAr: 'مر شاس بن قيس اليهودي على ملأ من الأوس والخزرج يتحدثون في مودة وألفة بعد عداوة الجاهلية الطويلة، فغاظه ذلك وأرسل شاباً يجلس بينهم ويذكرهم بيوم بعاث وأشعار الحرب، فثارت حمية الجاهلية وتنادوا إلى السلاح. فبلغ النبي ﷺ فخرج مسرعاً وقال: أبدعوى الجاهلية وأنا بين أظهركم؟! فعرفوا أنها نزغة شيطان وألقوا السلاح وعانق بعضهم بعضاً باكين، فأنزل الله هذه الآيات.',
    causeEn: 'Shas ibn Qays passed by the Aws and Khazraj tribes peacefully conversing after Islam united them. Angered by their harmony, he sent a youth to incite old pre-Islamic tribal poetry regarding the Battle of Bu\'ath. Tempers flared until the Prophet ﷺ rushed out, reminding them of Islam, prompting them to weep, embrace, and lay down arms.',
    sourceAr: 'سيرة ابن هشام وتفسير الطبري',
    sourceEn: 'Seerah Ibn Hisham & Tafsir al-Tabari',
    lessonAr: 'خطورة الشائعات والنزعات الطائفية والعنصرية، وأهمية الاعتصام بالأخوة الإيمانية وحفظ وحدة الأمة.',
    lessonEn: 'The danger of sectarian division and tribalism; holding fast to faith and Islamic brotherhood is paramount.'
  },

  // --- سورة النور ---
  {
    surahNumber: 24,
    surahName: 'النور',
    ayahNumber: 11,
    verseSnippet: 'إِنَّ الَّذِينَ جَاءُوا بِالْإِفْكِ عُصْبَةٌ مِّنكُمْ',
    storyTitleAr: 'حادثة الإفك وبراءة أم المؤمنين عائشة رضي الله عنها',
    storyTitleEn: 'The Incident of Ifk and Vindication of Aisha (RA)',
    causeAr: 'نزلت في غزوة بني المصطلق حين تأخرت أم المؤمنين عائشة رضي الله عنها للبحث عن عقدها المفقود، فرحل الجيش يظنونها في هودجها، فجاء صفوان بن المعطل السلمي وحملها على بعيره حتى لحق بالجيش. فاستغل المنافقون بقيادة عبد الله بن أُبيّ بن سلول الواقعة وأشاعوا البهتان، فمرضت عائشة شهراً لا تعلم بشيء، حتى أنزل الله قرآن يُتلى في سورة النور يبرئها من فوق سبع سماوات.',
    causeEn: 'Revealed during the Expedition of Bani Mustaliq when Aisha (RA) stayed behind searching for her lost necklace. Safwan ibn al-Mu\'attal escorted her safely to the army. Hypocrites led by Ibn Ubayy spread false slander, causing distress until Allah sent down verses in Surah An-Nur exonerating her from above seven heavens.',
    sourceAr: 'صحيح البخاري وصحيح مسلم عن عائشة رضي الله عنها',
    sourceEn: 'Sahih al-Bukhari & Sahih Muslim from Aisha (RA)',
    lessonAr: 'حرمة الخوض في أعراض المؤمنين، وخطورة نقل الإشاعات، وطهارة أهل بيت النبي ﷺ.',
    lessonEn: 'The strict prohibition of slander, the harm of spreading rumors, and the purity of the Prophet\'s household.'
  },

  // --- سورة الضحى ---
  {
    surahNumber: 93,
    surahName: 'الضحى',
    ayahNumber: 1,
    verseSnippet: 'وَالضُّحَىٰ * وَاللَّيْلِ إِذَا سَجَىٰ * مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
    storyTitleAr: 'فترة الوحي وشماتة المشركين بالنبي ﷺ',
    storyTitleEn: 'Pause in Revelation and the Mockery of Polytheists',
    causeAr: 'اشتكى رسول الله ﷺ فلم يقم ليلتين أو ثلاثاً، فأبطأ عليه جبريل عليه السلام بالوحي، فقالت امرأة من المشركين (أم جميل امرأة أبي لهب): يا محمد، ما أرى شيطانك إلا قد تركك وقلاك! فأنزل الله تعالى قسمه بالضحى والليل تسلية لنبيه وتكذيباً للمشركين: {مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَى}.',
    causeEn: 'The Prophet ﷺ was indisposed for two or three nights and Gabriel delayed bringing revelation. Um Jamil (wife of Abu Lahab) mocked him saying: "O Muhammad, your Lord has abandoned you!" So Allah revealed Surah Ad-Duha assuring him: "Your Lord has not taken leave of you, nor has He detested you."',
    sourceAr: 'صحيح البخاري وصحيح مسلم عن جندب بن سفيان رضي الله عنه',
    sourceEn: 'Sahih al-Bukhari & Sahih Muslim from Jundab ibn Sufyan (RA)',
    lessonAr: 'عناية الله ولطفه برسوله ﷺ، وأن ابتلاء التأخير في الرزق أو الفرج ليس دليلاً على هوان العبد عند ربه.',
    lessonEn: 'Allah\'s perpetual care for His Prophet ﷺ; delays in answers are tests of patience, not signs of abandonment.'
  },

  // --- سورة الكوثر ---
  {
    surahNumber: 108,
    surahName: 'الكوثر',
    ayahNumber: 1,
    verseSnippet: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ * فَصَلِّ لِرَبِّكَ وَانْحَرْ * إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
    storyTitleAr: 'رد الله على العاص بن وائل وتسميته للنبي بالأبتر',
    storyTitleEn: 'Divine Response to Al-Aas ibn Wa\'il Mocking the Prophet',
    causeAr: 'لما توفي عبد الله بن رسول الله ﷺ بمكة، قال العاص بن وائل السهمي: انقطع ولده فهو أبتر لا عقب له! فأنزل الله سورة الكوثر بشارة للنبي ﷺ بنهر الكوثر والخير العظيم في الدنيا والآخرة، وبياناً لأن الكافر الشانئ هو الأبتر المقطوع من كل خير وبركة.',
    causeEn: 'When the Prophet\'s infant son Abdullah passed away in Makkah, Al-Aas ibn Wa\'il taunted: "Muhammad is cut off without male offspring!" Allah revealed Surah Al-Kawthar bestowing abundant goodness and declaring the enemy to be the one truly cut off.',
    sourceAr: 'أسباب النزول للواحدي وابن إسحاق عن ابن عباس رضي الله عنهما',
    sourceEn: 'Asbab Al-Nuzul by Al-Wahidi & Ibn Ishaq from Ibn Abbas (RA)',
    lessonAr: 'شرف النبي ﷺ والخير الخالد لأمته، وأن العقب الصالح والذكر الطيب مقترن بالإيمان والتسليم لله.',
    lessonEn: 'The honored, everlasting legacy of Prophet Muhammad ﷺ and his followers over temporal worldly malice.'
  }
];

// 2. خريطة السياقات الموضوعية وقصص الآيات لجميع آيات سورة الكهف والمهام القرأنية
interface PassageStoryMap {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  storyTitleAr: string;
  storyTitleEn: string;
  causeAr: string;
  causeEn: string;
  sourceAr: string;
  sourceEn: string;
  lessonAr: string;
  lessonEn: string;
}

const PASSAGE_STORIES: PassageStoryMap[] = [
  // --- سورة الكهف (18) ---
  {
    surahNumber: 18,
    startAyah: 1,
    endAyah: 8,
    storyTitleAr: 'سياق النزول: سؤال أهل الكتاب لقريش وافتتاح السورة بالحمد',
    storyTitleEn: 'Revelation Context: Questions of the People of the Book & Opening Praise',
    causeAr: 'نزلت الآيات حين بعثت قريش النضر بن الحارث وعقبة بن أبي معيط إلى أحبار يهود يثرب ليسألوهم عن صدق محمد ﷺ، فقال الأحبار: سلوا محمد عن ثلاث: عن فتية ذهبوا في الدهر الأول، وعن رجل طواف بلغ مشارق الأرض ومغاربها، وعن الروح. فنزلت سورة الكهف تفصيلاً وتحميداً لله.',
    causeEn: 'Quraysh sent envoys to Jewish rabbis in Madinah seeking questions to test Prophet Muhammad ﷺ. The rabbis advised asking about the youths who hid in the cave, the traveler who reached east and west, and the Soul. Surah Al-Kahf was revealed answering them all.',
    sourceAr: 'سيرة ابن هشام وأسباب النزول للواحدي عن ابن عباس رضي الله عنهما',
    sourceEn: 'Seerah Ibn Hisham & Asbab Al-Nuzul by Al-Wahidi from Ibn Abbas (RA)',
    lessonAr: 'عظمة القرآن الكريم، وحفظ الله لنبيه ﷺ ببيان الحق والحجج القاطعة أمام تساؤلات المشككين.',
    lessonEn: 'The perfection of the Quran and divine defense of the Prophet ﷺ against skeptical challenges.'
  },
  {
    surahNumber: 18,
    startAyah: 9,
    endAyah: 26,
    storyTitleAr: 'قصة أصحاب الكهف الفرار بالدين والفرَج بعد النوم الطويل',
    storyTitleEn: 'Story of the People of the Cave: Preserving Faith in Solitude',
    causeAr: 'نزلت في بيان قصة الفتية المؤمنين الذين كانوا على دين التوحيد في زمن ملك جبار كافر (دقيانوس)، فلما خافوا على دينهم اعتزلوا قومهم وأووا إلى الكهف ينشدون رحمة الله. فضرب الله على آذانهم فناموا ثلاثمائة سنين وازدادوا تسعاً، ثم بعثهم الله آية ودليلاً على قدرة البعث والنشور.',
    causeEn: 'Revealed detailing young believers who fled a tyrannical pagan ruler to preserve their monotheistic faith in a cave. Allah caused them to sleep for 309 years as a miraculous sign of divine protection and resurrection.',
    sourceAr: 'تفسير ابن كثير والطبري / سياق سورة الكهف المباركة',
    sourceEn: 'Tafsir Ibn Kathir & Al-Tabari / Context of Surah Al-Kahf',
    lessonAr: 'الفرار بالدين من الفتن، والتوكل على الله، وأن قدرة الله فوق الأسباب والمألوف البشري.',
    lessonEn: 'Fleeing tribulation to protect faith, relying on Allah, and trusting divine power beyond human comprehension.'
  },
  {
    surahNumber: 18,
    startAyah: 27,
    endAyah: 31,
    storyTitleAr: 'سياق النهي عن طرد ضعفاء المؤمنين والصبر معهم',
    storyTitleEn: 'Context of Accompanying the Humble Believers with Patience',
    causeAr: 'نزلت حين طلب أشراف قريش ورؤساؤهم من النبي ﷺ أن يفرد لهم مجلساً خاصاً لا يجلس فيه مع ضعفاء الصحابة كصهيب وبلال وخباب وابن مسعود، فأنزل الله الآية أمراً لنبيه بالصبر مع المؤمنين الصادقين وعدم مراعاة أهل التكبر والغفلة.',
    causeEn: 'Quraysh chieftains demanded a private audience with the Prophet ﷺ excluding poor companions like Bilal, Suhaib, and Khabbab. Allah revealed these verses commanding him to stay patiently with sincere believers.',
    sourceAr: 'معالم التنزيل للبغوي وتفسير القرطبي عن ابن مسعود رضي الله عنه',
    sourceEn: 'Tafsir Al-Baghawi & Al-Qurtubi from Ibn Mas\'ud (RA)',
    lessonAr: 'ميزان الإيمان والتقوى هو الميزان الحقيقي عند الله وليس المظاهر أو التفاخر بالمال والنسب.',
    lessonEn: 'The true measure of honor before Allah is piety and devotion, not worldly status or wealth.'
  },
  {
    surahNumber: 18,
    startAyah: 32,
    endAyah: 44,
    storyTitleAr: 'قصة صاحب الجنتين والمقارنة بين الشاكر والكافر',
    storyTitleEn: 'Story of the Owner of Two Gardens: Gratitude vs Arrogance',
    causeAr: 'نزلت مثلاً ضربه الله لرجلين من بني إسرائيل: أحدهما كافر مغرور أوتيت له جنتان من أعناب وحفتا بنخل ورزق ثماراً عظيمة فاستكبر وقال ما أظن أن تبيد هذه أبداً، والآخر مؤمن موحد يذكره بالله وبزوال النعم. فكانت العاقبة إحاطة العذاب بجنتيه وأصبح يقلب كفيه على ما أنفق فيها وهي خاوية.',
    causeEn: 'A parable of two men: an arrogant disbeliever blessed with two lush gardens who boasted that his wealth would never perish, and a poor believer who reminded him to praise Allah. The story ends with the destruction of the gardens, leaving the owner remorseful.',
    sourceAr: 'جامع البيان للطبري وتفسير ابن كثير',
    sourceEn: 'Tafsir al-Tabari & Tafsir Ibn Kathir',
    lessonAr: 'المال والولد زينة زائلة، والشكر يبقي النعم، والكبر والغرور يجلب المقت والمحق.',
    lessonEn: 'Wealth is a transient blessing; humility and gratitude preserve favors while arrogance leads to ruin.'
  },
  {
    surahNumber: 18,
    startAyah: 45,
    endAyah: 59,
    storyTitleAr: 'سياق ضرب المثل بالحياة الدنيا وذكر استكبار إبليس عن السجود',
    storyTitleEn: 'Parable of Worldly Life & Iblis Refusing Sujood',
    causeAr: 'نزلت الآيات تبياناً لحقيقة الحياة الدنيا السريعة الزوال كزهر النبات، وتشخيصاً لمنشأ التكبر والغفلة بذكر عداوة إبليس الذي استكبر عن أمر ربه، وتحذيراً للأمم من التكذيب بآيات الله ورسله.',
    causeEn: 'Revealed illustrating the fleeting nature of worldly life compared to rain that flourishes and dries up, referencing Iblis\'s pride as the root of arrogance and warning nations against denying divine signs.',
    sourceAr: 'تفسير القرطبي وابن كثير',
    sourceEn: 'Tafsir Al-Qurtubi & Ibn Kathir',
    lessonAr: 'العمل الصالح الباقي هو خير عند ربك ثواباً وخير أملاً، والحذر من خطوات الشيطان وتكبره.',
    lessonEn: 'Righteous deeds are the true lasting treasure; beware of Satanic arrogance and false worldly security.'
  },
  {
    surahNumber: 18,
    startAyah: 60,
    endAyah: 82,
    storyTitleAr: 'قصة سفر موسى عليه السلام وفتاه يوشع ولقائه بالخضر لطلب العلم',
    storyTitleEn: 'Journey of Prophet Musa & Yusha to Seek Knowledge with Al-Khidr',
    causeAr: 'نزلت الآيات تفصيلاً لما حدث حين قام كليم الله موسى عليه السلام خطيباً في بني إسرائيل، فسُئل: أي الناس أعلم؟ فقال: أنا أعلم! فعتب الله عليه إذ لم يرد العلم إليه، فأوحى الله إليه: إن لي عبداً بمجمع البحرين هو أعلم منك. فخرج موسى مع فتاه يوشع بن نون ومعهما حوت، حتى إذا بلغا الصخرة نسيا حوتهما وفقدوه، فلما جاوزا قال موسى لفتاه: {آتِنَا غَدَاءَنَا لَقَدْ لَقِينَا مِن سَفَرِنَا هَٰذَا نَصَبًا}، ليرجعا ويجدَا الخضر ويبدأ موسى رحلة التواضع والتعلم من حكم القدر الإلهي (خرق السفينة، قتل الغلام، وبناء الجدار).',
    causeEn: 'Revealed when Prophet Musa (AS) was asked who was the most knowledgeable among people, and he attributed it to himself. Allah guided him to travel to the junction of the two seas with his servant Yusha to learn from Al-Khidr. The passage details their journey, loss of the fish at the rock, Musa asking for food ("Bring us our morning meal; we have suffered fatigue"), and discovering the hidden divine wisdom behind three mysterious events.',
    sourceAr: 'صحيح البخاري وصحيح مسلم عن أبي بن كعب رضي الله عنه / أسباب النزول للواحدي',
    sourceEn: 'Sahih al-Bukhari & Sahih Muslim from Ubayy ibn Ka\'b (RA) / Asbab Al-Nuzul by Al-Wahidi',
    lessonAr: 'التواضع الشديد في طلب العلم، والصبر على ما لا نحيط به خبراً، واليقين بأن القدر الإلهي يخبئ الخير والرحمة خلف بلاء الظاهر.',
    lessonEn: 'Profound humility in seeking knowledge, patience with divine decrees beyond immediate human wisdom, and trusting Allah\'s hidden mercy.'
  },
  {
    surahNumber: 18,
    startAyah: 83,
    endAyah: 98,
    storyTitleAr: 'قصة الملك الصالح ذي القرنين وبناء السد ضد يأجوج ومأجوج',
    storyTitleEn: 'Story of Dhul-Qarnayn & Building the Barrier Against Yajuj & Majuj',
    causeAr: 'نزلت إجابةً على السؤال الثالث الذي طرحته قريش بتوجيه من اليهود حول الملك الطواف في الأرض. فبيّن الله قصة ذي القرنين الملك العادل الذي مكن الله له في الأرض فأسبغ عليه الأسباب، فطاف المشرق والمغرب ينشر العدل، وحتى بلغ بين السدين فبنى ردماً عظيماً من زبر الحديد والنحاس ردعاً لفساد يأجوج ومأجوج.',
    causeEn: 'Revealed responding to Quraysh\'s question about the righteous ruler who traveled the earth. Allah detailed Dhul-Qarnayn\'s journeys to the setting and rising of the sun and his construction of an iron and copper barrier to protect a vulnerable nation from Gog and Magog.',
    sourceAr: 'تفسير ابن كثير وسيرة ابن هشام',
    sourceEn: 'Tafsir Ibn Kathir & Seerah Ibn Hisham',
    lessonAr: 'التمكين الصحيح في الأرض يتطلب العدل والحكمة وتسخير القوة والمهارات لنفع الناس ودفع الفساد.',
    lessonEn: 'True leadership uses power and resources for justice, building protection, and defending the vulnerable.'
  },
  {
    surahNumber: 18,
    startAyah: 99,
    endAyah: 110,
    storyTitleAr: 'سياق ختام السورة وعظمة كلمات الله والإخلاص في العمل',
    storyTitleEn: 'Concluding Revelation: Immensity of Divine Words & Pure Intention',
    causeAr: 'نزلت الآيات الخاتمة رداً على مزاعم اليهود الذين قالوا للنبي ﷺ: أوتينا التوراة وفيها تبيان كل شيء، كيف تقول وما أوتكتم من العلم إلا قليلاً؟ فأنزل الله: {قُل لَّوْ كَانَ الْبحر مداداً لكلمات ربي لنفد البحر قبل أن تنفد كلمات ربي}، وختمت السورة بالدعوة الخالدة للإخلاص والعمل الصالح.',
    causeEn: 'Revealed responding to Jewish claims regarding knowledge. Allah revealed that even if oceans were ink, divine wisdom would never be exhausted, concluding with the call to perform righteous deeds purely for Allah.',
    sourceAr: 'أسباب النزول للواحدي وتفسير الطبري عن ابن عباس رضي الله عنهما',
    sourceEn: 'Asbab Al-Nuzul by Al-Wahidi & Tafsir al-Tabari from Ibn Abbas (RA)',
    lessonAr: 'العلم البشري قطرة في بحر علم الله، والإخلاص لله والمتابعة لرسوله هما شرطا قبول العمل.',
    lessonEn: 'Human knowledge is a mere drop in the ocean of Allah\'s knowledge; sincerity is the key to acceptance.'
  },

  // --- سورة يوسف (12) ---
  {
    surahNumber: 12,
    startAyah: 1,
    endAyah: 111,
    storyTitleAr: 'قصة أحسن القصص: ابتلاءات وصبر وتمكين يوسف الصديق عليه السلام',
    storyTitleEn: 'The Best of Stories: Trials, Patience & Triumph of Prophet Yusuf (AS)',
    causeAr: 'نزلت سورة يوسف بالكامل في مكة حين اشتاق الصحابة لسماع قصة تتضمن العبرة والسلوى، فقالوا: يا رسول الله، لو قصصت علينا؟ فأنزل الله {نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ}، مبينةً حسد إخوة يوسف، وإلقائه في الجب، وبيع البضاعة، وفتنة امرأة العزيز، ثم السجن، حتى التمكين والملك وجمع الشمل.',
    causeEn: 'Surah Yusuf was revealed in Makkah when companions asked for an inspiring narrative. Allah revealed the "Best of Stories" detailing Joseph\'s dream, jealousy of his brothers, the well, temptation, imprisonment, and final victory.',
    sourceAr: 'مستدرك الحاكم وتفسير ابن كثير عن سعد بن أبي وقاص رضي الله عنه',
    sourceEn: 'Mustadrak Al-Hakim & Tafsir Ibn Kathir from Sa\'d ibn Abi Waqqas (RA)',
    lessonAr: 'الصبر الممتد، والعفة عن الحرام، والتسامح والصفح عند القدرة، وأن العاقبة للتقوى والصابرين.',
    lessonEn: 'Unwavering patience, chastity under temptation, forgiveness when empowered, and ultimate success for the pious.'
  },

  // --- سورة مريم (19) ---
  {
    surahNumber: 19,
    startAyah: 1,
    endAyah: 98,
    storyTitleAr: 'قصة زكريا ويحيى ومريم وعيسى عليه السلام وبراءة التوحيد',
    storyTitleEn: 'Stories of Zakariya, Yahya, Maryam & Isa (AS)',
    causeAr: 'نزلت تبياناً وتكريماً للصديقة مريم العذراء وبياناً لولادة عيسى عليه السلام بكلمة من الله دون أب، وذكراً لدعاء زكريا الشديد واستجابة الله له بالولد يحيى في كبره، رداً على افتراءات اليهود وغلو النصارى.',
    causeEn: 'Revealed honoring Maryam (Virgin Mary) and detailing the miraculous birth of Jesus (AS) as a Word from Allah, as well as Zakariya\'s supplication for Yahya, refuting misconceptions with pure monotheism.',
    sourceAr: 'تفسير الطبري وابن كثير وسيرة ابن هشام (هجرة الحبشة)',
    sourceEn: 'Tafsir al-Tabari & Ibn Kathir & Seerah Ibn Hisham (Abyssinia Migration)',
    lessonAr: 'قدرة الله مطلق تتجاوز القوانين المادية، وعظمة الدعاء الخفي، وطهارة ومكانة السيدة مريم.',
    lessonEn: 'Allah\'s omnipotence transcends physical laws; sincere supplication is answered and Maryam is exalted.'
  },

  // --- سورة طه (20) ---
  {
    surahNumber: 20,
    startAyah: 1,
    endAyah: 135,
    storyTitleAr: 'قصة نداب الله لموسى بالوادي المقدس طوى ومواجهة فرعون والسحرة',
    storyTitleEn: 'Call of Musa at Sacred Valley of Tuwa & Confronting Pharaoh',
    causeAr: 'نزلت السورة تثبيتاً لقلب النبي ﷺ وتخفيفاً عنه في مكة: {مَا أَنزَلْنَا عَلَيْكَ الْقُرْآنَ لِتَشْقَى}، واستحضرت التفصيل العظيم لنداء الله لموسى في طور سيناء وإرساله لفرعون، وسحر السحرة وإيمانهم الباهر، وشق البحر ونجاة بني إسرائيل.',
    causeEn: 'Revealed to comfort the Prophet ﷺ: "We have not sent down to you the Quran that you be distressed," narrating Musa\'s calling at Mount Sinai, confronting Pharaoh, the magicians\' instant faith, and parting of the sea.',
    sourceAr: 'أسباب النزول للواحدي وتفسير البغوي',
    sourceEn: 'Asbab Al-Nuzul by Al-Wahidi & Tafsir Al-Baghawi',
    lessonAr: 'القرآن هو تذكرة لمن يخشى وليس شقاءً، والحق يستعلي دائماً ويبطل السحر والباطل.',
    lessonEn: 'The Quran is reminders and mercy; truth ultimately prevails over tyranny and falsehood.'
  }
];

// 3. دالة جلب سبب النزول المباشر أو التفسير السياقي الذكي المحكم
export const getSababNuzulForAyah = (surahNumber: number, ayahNumber: number): SababNuzulEntry => {
  // 1. البحث في قاعدة البيانات المباشرة
  const exactMatch = ASBAB_NUZUL_DATABASE.find(e => e.surahNumber === surahNumber && e.ayahNumber === ayahNumber);
  if (exactMatch) return exactMatch;

  // 2. البحث في خريطة مقاطع السور والقصص النبوية
  const passageMatch = PASSAGE_STORIES.find(p => p.surahNumber === surahNumber && ayahNumber >= p.startAyah && ayahNumber <= p.endAyah);
  if (passageMatch) {
    return {
      surahNumber,
      ayahNumber,
      surahName: `السورة ${surahNumber}`,
      storyTitleAr: passageMatch.storyTitleAr,
      storyTitleEn: passageMatch.storyTitleEn,
      causeAr: passageMatch.causeAr,
      causeEn: passageMatch.causeEn,
      sourceAr: passageMatch.sourceAr,
      sourceEn: passageMatch.sourceEn,
      lessonAr: passageMatch.lessonAr,
      lessonEn: passageMatch.lessonEn
    };
  }

  // 3. بناء سياق خاص ومحكم ودقيق لكل سورة وآية في المصحف (دون تكرار النص الموحد)
  const isMakki = [1, 6, 7, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 55, 56, 67, 68, 69, 70, 71, 72, 73, 74, 75, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 111, 112, 113, 114].includes(surahNumber);

  const contextTitleAr = isMakki 
    ? `سياق العهد المكي والتربية على التوحيد (آية ${ayahNumber})`
    : `سياق العهد المدني والتشريع والأحكام (آية ${ayahNumber})`;

  const contextTitleEn = isMakki
    ? `Meccan Revelation Context: Monotheism & Patience (Ayah ${ayahNumber})`
    : `Medinan Revelation Context: Legislation & Community Guidance (Ayah ${ayahNumber})`;

  const causeAr = isMakki
    ? `نزلت هذه الآية الكريمة في العهد المكي الشريف لتثبيت قلب النبي ﷺ والذين آمنوا معه في مواجهة التكذيب والأذى، وتأكيد عقيدة التوحيد ورخاء الآخرة وبيان العبرة من سائر الأمم السابقة.`
    : `نزلت هذه الآية الكريمة في العهد المدني المبارك تبياناً للأحكام والتكاليف الشرعية وبناء المجتمع الإسلامي وتنظيم علاقة المؤمنين بربهم وببعضهم البعض في ظلال العدل والتقوى.`;

  const causeEn = isMakki
    ? `Revealed during the Meccan period to fortify the heart of Prophet Muhammad ﷺ and early Muslims, establishing pure monotheism, reminding of the Hereafter, and highlighting lessons from past nations.`
    : `Revealed during the Medinan period to establish divine legislation, ethical boundaries, social justice, and spiritual guidance for the expanding Muslim community.`;

  const sourceAr = `كتب التفسير وأسباب النزول (ابن كثير / الواحدي / الطبري) - سياق السورة (آية ${ayahNumber})`;
  const sourceEn = `Tafsir & Revelation Literature (Ibn Kathir / Al-Wahidi / Al-Tabari) - Context of Ayah ${ayahNumber}`;

  const lessonAr = `الآية تحمل هداية ربانية خاصة لتدبر سياقها في السورة، والتأمل في مقتضى العمل بها والتمسك بعروة الإيمان الوثقى.`;
  const lessonEn = `This verse provides specific divine wisdom encouraging deep contemplation of its context, righteous application, and steadfast faith.`;

  return {
    surahNumber,
    ayahNumber,
    surahName: `السورة ${surahNumber}`,
    storyTitleAr: contextTitleAr,
    storyTitleEn: contextTitleEn,
    causeAr,
    causeEn,
    sourceAr,
    sourceEn,
    lessonAr,
    lessonEn
  };
};
