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

import { ALL_SURAHS_STORY_ENCYCLOPEDIA } from './quranSurahStoriesEncyclopedia';

const PASSAGE_STORIES: PassageStoryMap[] = [
  // --- سورة الكهف (18) ---
  {
    surahNumber: 18,
    startAyah: 1,
    endAyah: 8,
    storyTitleAr: 'سياق النزول المفصل: أسئلة أحبار يهود يثرب، احتباس الوحي خمسة عشر يوماً، وافتتاح السورة بالحمد',
    storyTitleEn: 'Detailed Revelation Context: Questions of the Jewish Rabbis, 15-Day Pause & Divine Opening Praise',
    causeAr: `سورة الكهف مكية من أعظم سور القرآن الكريم، وتُقرأ كل جمعة لتكون نوراً بين الجمعتين وعصمة من فتنة المسيح الدجال.

سبب النزول المفصل:
بعثت قريش النضر بن الحارث وعقبة بن أبي معيط إلى أحبار يهود بالمدينة المنورة، وقالوا لهما: سلاهم عن محمد، فإنهم أهل كتاب أول وعندهم علم ليس عندنا من علم الأنبياء. فقال أحبار اليهود: سلوه عن ثلاث نأمركم بهن؛ فإن أخبركم بهن فهو نبي مرسل، وإن لم يفعل فالرجل متقول فاصنعوا به ما بدا لكم:
1. سلوه عن فتية ذهبوا في الدهر الأول، ما كان من أمرهم؟ فإنهم قد كان لهم حديث عجيب.
2. وسلوه عن رجل طواف بلغ مشارق الأرض ومغاربها، ما كان نبؤه؟
3. وسلوه عن الروح، ما هي؟

فلما قدم النضر وعقبة مكة، جاءا إلى رسول الله ﷺ وقالا: يا محمد أخبرنا، وسألوه عن الأمور الثلاثة. فقال النبي ﷺ بشوقه لهدايتهم: "أخبركم غداً بما سألتم عنه"، ولم يقل: "إن شاء الله". فاحتبس الوحي عنه خمسة عشر يوماً وليلة، لا ينزل إليه جبريل ولا يُوحى إليه شيء، حتى أرجف أهل مكة وشمت المشركون وقالوا: ودّعه ربه وقلاه! فشق ذلك على النبي ﷺ مشقة شديدة وحزن حزناً عظيماً.

ثم جاءه جبريل عليه السلام من عند الله بسورة الكهف المباركة، فعاتبه الله برفق في قوله: {وَلَا تَقُولَنَّ لِشَيْءٍ إِنِّي فَاعِلٌ ذَٰلِكَ غَدًا * إِلَّا أَن يَشَاءَ اللَّهُ ۚ وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ}، وافتتح الله السورة بأعظم تحميد لنفسه العلية على نعمة إنزال القرآن قيماً لا عوج فيه لينذر بأساً شديداً ويبشر المؤمنين، وفصّل الجواب الشافي عن الأسئلة الثلاثة كما أراد الله.`,
    causeEn: `Surah Al-Kahf is a weekly sanctuary of light and protection against the Antichrist (Dajjal).

Detailed Historical Context:
Quraysh sent An-Nadr ibn al-Harith and Uqbah ibn Abi Mu'ayt to the Jewish scholars in Yathrib (Madinah). The rabbis said: "Ask him three questions that only a true Prophet can answer: about young men who disappeared in antiquity with an astonishing saga, about a great monarch who traversed the east and the west, and about the nature of the Soul. If he tells you, follow him."

When asked, the Prophet ﷺ eagerly said: "I will tell you tomorrow," forgetting to say "In sha Allah" (If Allah wills). Revelation paused for fifteen agonizing days. Polytheists mocked claiming his Lord had deserted him, causing immense grief to the Prophet ﷺ.

Then Archangel Jibril descended carrying Surah Al-Kahf, gently reproaching him: "And never say of anything, 'Indeed, I will do that tomorrow,' except [when adding], 'If Allah wills'." The surah opened with glorious praises of Allah for revealing the perfectly upright Quran, and answered every question with breathtaking precision.`,
    sourceAr: 'سيرة ابن هشام، أسباب النزول للواحدي، صحيح البخاري، تفسير ابن كثير',
    sourceEn: 'Seerah Ibn Hisham, Asbab Al-Nuzul by Al-Wahidi, Sahih al-Bukhari, Tafsir Ibn Kathir',
    lessonAr: `• وجوب تعليق كل العزائم والأعمال المستقبلية بمشيئة الله تعالى وقول "إن شاء الله".
• عظمة القرآن الكريم واستقامته التامة الخالية من أي اعوجاج أو تناقض.
• عناية الله ورعايته لحبيبه المصطفى ﷺ وتأييده بالحق المبين أمام كيد المشككين.`,
    lessonEn: `• Absolute necessity of entrusting all future actions to divine will by stating "In sha Allah".
• The perfection of the Quran as an upright book completely free of contradiction.
• Divine support and vindication of Prophet Muhammad ﷺ against skepticism.`
  },
  {
    surahNumber: 18,
    startAyah: 9,
    endAyah: 26,
    storyTitleAr: 'قصة أصحاب الكهف المفصلة: الفتية الموحدون، الفرار بالدين، معجزة النوم ثلاثمائة سنة، والبرهان على البعث',
    storyTitleEn: 'Detailed Epic of the People of the Cave: Sincere Monotheism, 309 Years of Sleep & Proof of Bodily Resurrection',
    causeAr: `قصة أصحاب الكهف هي الإجابة الإلهية الأولى عن سؤال الفتية الذين غابوا في الدهر الأول:

أحداث القصة وتفاصيلها الكاملة:
كان هؤلاء الفتية أبناء ملوك وأشراف في بلاد الروم (في عهد الإمبراطور الوثني المستبد دقيانوس)، وكان قومهم يعبدون الأصنام ويذبحون لها، وكان الملك يتتبع كل من يعبد الله الواحد فيخيره بين الكفر أو القتل والتنكيل.
وقع الإيمان والتوحيد في قلوب هؤلاء الفتية النجباء؛ فأنكروا عبادة الحجارة، والتقوا صدفة خارج مدينتهم وكل منهم يخفي إيمانه حذراً، حتى تعارفوا وبث بعضهم سره للآخر فوجدوا قلوبهم مجتمعة على عبادة الله وحده دون شريك: {إِذْ قَامُوا فَقَالُوا رَبُّنَا رَبُّ السَّمَاوَاتِ وَالْأَرْضِ لَن نَّدْعُوَ مِن دُونِهِ إِلَٰهًا ۖ لَّقَدْ قُلْنَا إِذًا شَطَطًا}.

وشى بهم واشٍ إلى الملك الظالم، فاستحضرهم وهددهم بالقتل إن لم يسجدوا للأصنام، ثم أمهلهم أياماً لصغر سنهم ليرجعوا عن دينهم. فاغتنم الفتية الفرصة، وقرروا التضحية بكل بهارج الملك والقصور والفرار بدينهم وعقيدتهم إلى مغارة وكهف في جبل نجلوس مع كلبهم الحارس (قطمير). وتضرعوا إلى ربهم بقلوب منكسرة: {رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا}.

معجزة النوم وحفظ الأجساد:
استجاب الله دعاءهم فألقى عليهم نوماً عميقاً لا يقطعه صوت، وسد منافذ السمع: {فَضَرَبْنَا عَلَىٰ آذَانِهِمْ فِي الْكَهْفِ سِنِينَ عَدَدًا}.
وهيأ الله لهم عناية ربانية معجزة لحفظ أبدانهم وثيابهم طوال 309 سنوات قمرية (300 شمسية):
1. الشمس إذا طلعت تزاور عن كهفهم ذات اليمين فلا تحرقهم، وإذا غربت تقرضهم ذات الشمال، وهم في فجوة واسعة منه يأتيهم نسيم الهواء اللطيف.
2. ويقلبهم الله ذات اليمين وذات الشمال حتى لا تأكل الأرض لحومهم وجلودهم.
3. كلبهم باسط ذراعيه بالوصيد يحرس الفناء الخارجي.
4. ألقى الله عليهم هيبة مرعبة، فلو اطلع عليهم مطلع لولى منهم فراراً ولملئ منهم رعباً.

الاستيقاظ وآية البعث والنشور:
فلما تم الأجل المقدر، أيقظهم الله فتساءلوا: كم لبثتم؟ قال قائلهم: لبثنا يوماً أو بعض يوم؛ لأنهم ناموا في أول النهار واستيقظوا في آخره. وشعروا بالجوع الشديد، فأرسلوا أحدهم واسمه (تمليخا) بورقهم (نقودهم الفضية) خفيةً إلى المدينة متنكراً، وأوصوه بأمرين: أن يتخير أزكى الطعام وأحله، وأن يتلطف ولا يشعرن بهم أحداً خشية بطش دقيانوس وجنوده.

فلما دخل المدينة وجد معالمها قد تبدلت كلياً، ورأى شعار الإيمان مرفوعاً والمساجد عامرة؛ فقد هلك دقيانوس وانقرض جيله ومضت ثلاثة قرون، وتولى ملك مؤمن صالح. ولما مد تمليخا دراهمه الفضية للخباز، ذهل البائع وأصحابه وظنوا أنه عثر على كنز قديم قاروني؛ لأن النقود عليها صورة دقيانوس الذي مات منذ أكثر من 300 عام! ورُفع الأمر إلى الملك والعلماء، وكان أهل ذلك الزمان قد اختلفوا في شأن البعث: هل تُبعث الأرواح فقط أم الأرواح والأجساد معاً؟

فذهب الملك وأهل المدينة مع الفتى إلى الكهف، وتأكدوا من القصة العجيبة ورأوا الفتية أحياء بأجسادهم كما ناموا، فتجلت قدرة الله المطلقة بأن الذي حفظ أجسادهم طوال هذه القرون وأحياهم قادر على بعث الأجساد والأرواح يوم القيامة دون عناء. ثم قبض الله أرواح الفتية بسلام، وقرر أهل الإيمان بناء مسجد فوق كهفهم تذكيراً بهذه الآية الكبرى.`,
    causeEn: `The comprehensive saga of the Youths of the Cave answering the first challenge of Quraysh:

Historical Background:
During the reign of the tyrannical pagan Roman emperor Decius, citizens were forced to offer animal sacrifices to idols under penalty of horrific torture and execution.
A group of noble aristocratic youths were touched by pure monotheism. Meeting secretly outside the city, they found mutual unity in rejecting idol worship: "Our Lord is the Lord of the heavens and the earth; we will never invoke beside Him any deity."

When summoned and threatened by the tyrant, they were granted a brief reprieve due to their youth. Abandoning worldly wealth and royal luxury, they fled with their faith to a secluded cave with their loyal guard dog (Qitmir), praying: "Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance."

The Miraculous 309-Year Slumber:
Allah sealed their hearing into an unbroken miraculous sleep lasting 309 lunar years (300 solar years).
Divine design guarded their bodies: the morning sun tilted away from their cave to the right and set away to the left, sparing them blazing heat while providing gentle breezes; Allah turned them from right side to left side so the earth would not consume their flesh; their dog stretched its forelegs at the cave entrance; and an awe-inspiring dread shielded them from any intruder.

The Awakening & Resurrection Miracle:
When awakened by Allah, they estimated they had slept only a day or part of a day. Feeling famished, they dispatched one of them discreetly with silver coins to buy the purest food, warning him to be courteous and remain unnoticed.
Arriving at the city, the youth was stunned: the pagan era had vanished three centuries ago, and a righteous monotheistic king now ruled. Handing the silver coins to bakers, people gasped thinking he had unearthed ancient treasure.
The discovery resolved a heated theological dispute among the inhabitants regarding whether resurrection involves both body and soul. Witnessing the youths alive after 300 years proved conclusively that Allah resurrects bodies and souls together on the Day of Judgment!`,
    sourceAr: 'تفسير ابن كثير، جامع البيان للطبري، سيرة ابن هشام، البداية والنهاية',
    sourceEn: 'Tafsir Ibn Kathir, Tafsir al-Tabari, Seerah Ibn Hisham, Al-Bidayah wan-Nihayah',
    lessonAr: `• الفرار بالدين وحفظ العقيدة أقدس وأغلى من كل بهارج الدنيا وسلطانها.
• عناية الله ولطفه بالمؤمنين تتجاوز سنن الكون وقوانين الطبيعة؛ فمن كان مع الله كان الله معه.
• البرهان الحاسم على البعث الحسي بالأرواح والأجساد معاً يوم القيامة.
• أدب التلطف والبحث عن الطعام الحلال الطيب في كل الظروف.`,
    lessonEn: `• Guarding one's faith and monotheism is infinitely superior to all worldly luxury and prestige.
• Divine protection defies physical limitations for those who place their total trust in Allah.
• Conclusive proof of physical and spiritual resurrection on the Day of Judgment.
• The virtue of gentle demeanor and seeking wholesome, lawful sustenance under all circumstances.`
  },
  {
    surahNumber: 18,
    startAyah: 27,
    endAyah: 31,
    storyTitleAr: 'سياق النهي عن طرد ضعفاء الصحابة والصبر مع أهل الإخلاص',
    storyTitleEn: 'Reproving the Demand to Exclude Poor Companions & Valuing Sincere Devotion',
    causeAr: `سياق النزول التاريخي:
جاء أشراف قريش وساداتهم (كعيينة بن حصن والأقرع بن حابس وأمية بن خلف) إلى رسول الله ﷺ، ووجدوا عنده فقراء الصحابة وضعفاءهم: كبلال بن رباح، وصهيب الرومي، وخباب بن الأرت، وسلمان الفارسي، وعبد الله بن مسعود رضي الله عنهم، وعليهم ثياب صوف خشنة تفوح منها رائحة عرق العمل.
فقال أشراف مكة بكبر وغرور: "يا محمد، نحّ هؤلاء عنك! أتريدنا أن نجلس مع هؤلاء العبيد والفقراء؟! إنا نستحيي أن ترانا وفود العرب جالسين معهم، فإذا جئناك فأقمهم عنا، فإذا خرجنا فاجلس معهم إن شئت!".

فرجا النبي ﷺ في قرارة نفسه أن يكون في استرضائهم تأليف لقلوبهم وإسلامهم وإسلام قبائلهم، فهمّ بإجابتهم لمصلحة الدعوة، فأنزل الله الآية القاطعة الصريحة:
{وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُم بِالْغَدَاةِ وَالْعَشِيِّ يُرِيدُونَ وَجْهَهُ ۖ وَلَا تَعْدُ عَيْنَاكَ عَنْهُمْ تُرِيدُ زِينَةَ الْحَيَاةِ الدُّنْيَا ۖ وَلَا تُطِعْ مَنْ أَغْفَلْنَا قَلْبَهُ عَن ذِكْرِنَا وَاتَّبَعَ هَوَاهُ وَكَانَ أَمْرُهُ فُرُطًا}.

فخرج النبي ﷺ مسرعاً يبحث عن ضعفاء أصحابه حتى وجدهم في مؤخرة المسجد يذكرون الله، فجلس بينهم وقال بفرح: "الحمد لله الذي جعل في أمتي من أُمرت أن أصبر نفسي معهم!".`,
    causeEn: `Historical Background:
Pagan chieftains of Makkah came to Prophet Muhammad ﷺ and saw him sitting with humble companions: Bilal, Suhaib, Khabbab, Salman, and Ibn Mas'ud, wearing coarse wool from daily labor.
Arrogant chieftains sneered: "O Muhammad, dismiss these slaves and poor folks from your presence! We are too proud for Arab delegations to see us sitting alongside them. Make a separate elite council for us!"

Hoping their acceptance might bring them and their tribes into Islam, the Prophet ﷺ contemplated accommodating them. Immediately, Allah sent down this decisive commandment:
"And keep yourself patient [by being] with those who call upon their Lord in the morning and the evening, seeking His countenance. And let not your eyes pass beyond them, desiring the adornment of worldly life..."

The Prophet ﷺ rushed to find his humble companions in the back of the mosque, sat amidst them joyfully declaring: "All praise belongs to Allah who placed in my nation those with whom I am commanded to patiently abide!"`,
    sourceAr: 'صحيح مسلم، معالم التنزيل للبغوي، تفسير القرطبي، مسند أحمد',
    sourceEn: 'Sahih Muslim, Tafsir Al-Baghawi, Tafsir Al-Qurtubi, Musnad Ahmad',
    lessonAr: `• مقياس التفاضل عند الله هو التقوى والإخلاص وليس الأنساب والأموال والجاه الدنيوي.
• خطورة التنازل عن مبادئ الدين لإرضاء المتكبرين أو مجاراة البروتوكولات الدنيوية.
• شرف ملازمة الصالحين والذاكرين والتواضع للمؤمنين الصادقين.`,
    lessonEn: `• The true metric of human honor before Allah is sincere piety and devotion, not ancestry or riches.
• Never compromise core spiritual values to appease arrogant societal elites.
• The exalted virtue of accompanying sincere worshipers and serving the humble.`
  },
  {
    surahNumber: 18,
    startAyah: 32,
    endAyah: 44,
    storyTitleAr: 'قصة صاحب الجنتين المفصلة: حوار المؤمن والجاحد، فتنة الثروة، والندم بعد زوال النعمة',
    storyTitleEn: 'Detailed Story of the Owner of the Two Gardens: Arrogance of Wealth vs Humble Faith and the Sudden Loss',
    causeAr: `ضرب الله في هذه الآيات مثلاً بليغاً لرجلين من بني إسرائيل (وقيل شقيقان ورثا مالاً فاقتسماه؛ فأنفق أحدهما ماله في سبيل الله واشترى به الآخر بساتين وعقاراً):

أحداث القصة وحوار العقيدة والثروة:
آتى الله الرجل الكافر بستانين عظيمين محاطين بأسوار من النخيل الباسق، وبينهما كروم أعناب متدلية وزروع خضراء يانعة، وتتفجر من وسطهما أنهار عذبة رقراقة تجري بالماء ليلاً ونهاراً، فلم ينقص من ثمارها شيء: {كِلْتَا الْجَنَّتَيْنِ آتَتْ أُكُلَهَا وَلَمْ تَظْلِم مِّنْهُ شَيْئًا ۚ وَفَجَّرْنَا خِلَالَهُمَا نَهَرًا}.

فأصابت الرجل فتنة المال والكبر، فدخل جنته متبختراً ومعه صاحبه المؤمن الفقير، وقال بغرور أعمى: {مَا أَظُنُّ أَن تَبِيدَ هَٰذِهِ أَبَدًا * وَمَا أَظُنُّ السَّاعَةَ قَائِمَةً وَلَئِن رُّدِدتُّ إِلَىٰ رَبِّي لَأَجِدَنَّ خَيْرًا مِّنْهَا مُنقَلَبًا}. فجمع بين الاغترار بالدنيا وإنكار البعث والظن بأن النعمة استحقاق شخصي دائم!

فرد عليه صاحبه المؤمن بكلمات التوحيد واليقين والعقل:
{أَكَفَرْتَ بِالَّذِي خَلَقَكَ مِن تُرَابٍ ثُمَّ مِن نُّطْفَةٍ ثُمَّ سَوَّاكَ رَجُلًا * لَّٰكِنَّا هُوَ اللَّهُ رَبِّي وَلَا أُشْرِكُ بِرَبِّي أَحَدًا * وَلَوْلَا إِذْ دَخَلْتَ جَنَّتَكَ قُلْتَ مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ ۚ إِن تَرَنِ أَنَا أَقَلَّ مِنكَ مَالًا وَوَلَدًا * فَعَسَىٰ رَبِّي أَن يُؤْتِيَنِ خَيْرًا مِّن جَنَّتِكَ وَيُرْسِلَ عَلَيْهَا حُسْبَانًا مِّنَ السَّمَاءِ فَتُصْبِحَ صَعِيدًا زَلَقًا * أَوْ يُصْبِحَ مَاؤُهَا غَوْرًا فَلَن تَسْتَطِيعَ لَهُ طَلَبًا}.

العاقبة والمصير الصاعق:
لم تمضِ سوى ليلة واحدة حتى حاق بالرجل ما حذره منه صاحبه؛ فأرسل الله على الجنتين صاعقة وعذاباً من السماء في ظلمة الليل، فاحترقت الأشجار، وغارت المياه في أعماق الأرض، وتهاوت العروش، وأصبحت البساتين صعيداً زلقاً تراباً أملس لا نبات فيه ولا ماء!
فلما أقبل الصباح وجاء صاحبها مستبشراً، صُدم بمشهد الخراب الشامل؛ فوقف يبكي ويصفق كفاً بكف حسرةً وندماً على أمواله وجهوده التي ضاعت هباءً، وصرخ معترفاً بذنبه بعد فوات الأوان: {يَا لَيْتَنِي لَمْ أُشْرِكْ بِرَبِّي أَحَدًا}، ولم تكن له فئة ولا حرس ولا أعوان ينصرونه من دون الله.`,
    causeEn: `A profound Quranic parable contrasting two individuals (often identified as two brothers from the Children of Israel who divided an inheritance; one spent his share in charity while the other bought estates):

The Dialogue of Faith vs Vanity:
Allah bestowed upon the disbeliever two lavish vineyards bordered by towering date palms, enriched with lush agriculture, and bisected by running fresh streams producing bountiful harvest without flaw.
Deluded by wealth, he arrogantly walked his poor believer companion through his orchards, boasting: "I am greater than you in wealth and stronger in manpower! I do not think this will ever perish, nor do I think the Hour will ever occur, and even if I am returned to my Lord, I will surely find better than this!"

His pious companion countered with monotheistic reason:
"Do you disbelieve in He who created you from dust, then from a sperm-drop, then fashioned you into a man? But as for me, He is Allah, my Lord, and I associate none with Him. Why did you not say upon entering your garden: 'What Allah wills [has occurred]; there is no power except in Allah'? Even if you see me with less wealth, perhaps my Lord will grant me better than your garden and send down a calamity from heaven upon yours, leaving it barren dust!"

The Catastrophe:
That very night, a divine storm and celestial thunderbolt struck the orchards. Trees burned, underground springs dried into deep bedrock, and the lush paradise was reduced to a slippery wasteland.
Arriving in the morning, the owner stood paralyzed in horror, wringing his hands in bitter lament over his wasted fortunes, crying out: "Oh, would that I had not associated anyone with my Lord!" But no army or clan could save him against Allah.`,
    sourceAr: 'جامع البيان للطبري، تفسير ابن كثير، تفسير القرطبي',
    sourceEn: 'Tafsir al-Tabari, Tafsir Ibn Kathir, Tafsir Al-Qurtubi',
    lessonAr: `• التحذير من فتنة الغرور بالمال والجاه، وإدراك أن كل النعم عارية مستردة من الله.
• مشروعية وسنة قول: {مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ} عند رؤية ما يعجب الإنسان حفظاً للنعم من الزوال والحسد.
• الشرك لا يقتصر على عبادة الأصنام، بل يشمل الاعتماد المطلق على الأسباب ونسيان مسببها سبحانه.`,
    lessonEn: `• The ruinous snare of pride in transient wealth; all bounties are divine trusts subject to withdrawal.
• The sunnah of reciting "Ma sha Allah, la quwwata illa billah" upon admiring blessings to guard them.
• Polytheism (Shirk) includes absolute reliance on material causes while forgetting the Supreme Creator.`
  },
  {
    surahNumber: 18,
    startAyah: 45,
    endAyah: 59,
    storyTitleAr: 'سياق ضرب المثل بالحياة الدنيا وتذكير البشرية بعداوة إبليس واستكباره',
    storyTitleEn: 'Parable of the Fleeting World, Display of Deeds & The Primordial Enmity of Iblis',
    causeAr: `سياق الآيات وموضوعها:
نزلت الآيات رداً على تعلق كفار قريش ومترفي كل زمان بظواهر الدنيا وزينتها الخادعة، فضرب الله مثل الحياة الدنيا بالماء الذي ينزل من السماء فيختلط به نبات الأرض فيصبح هشيماً تذروه الرياح.

ثم حذرت الآيات من اليوم الذي تُسير فيه الجبال وتُبرز الأرض، ويُوضع كتاب الأعمال الدقيق الذي لا يغادر صغيرة ولا كبيرة إلا أحصاها، فيصرخ المجرمون من هول ما يشاهدون.

وذكّرت السورة البشرية بالعداوة الأزلية لإبليس حين أمره الله بالسجود لآدم تكريماً، فأبى واستكبر وكان من الجن ففسق عن أمر ربه، معاتبةً البشر: {أَفَتَتَّخِذُونَهُ وَذُرِّيَّتَهُ أَوْلِيَاءَ مِن دُونِي وَهُمْ لَكُمْ عَدُوٌّ ۚ بِئْسَ لِلظَّالِمِينَ بَدَلًا}.`,
    causeEn: `Core Context & Thematic Guidance:
Revealed challenging the obsession of Quraysh and worldly elites with temporary status. Allah strikes the vivid metaphor of worldly life as rain that briefly turns vegetation lush before it dries into brittle stubble blown by winds.

The passage unveils the Day of Judgment when mountains vanish, and the comprehensive Record of Deeds is laid open, leaving sinners terrified: "Woe to us! What a book this is that leaves neither small nor great except it enumerated it!"

It recalls the primordial rebellion of Iblis who refused to prostrate to Adam out of spite, asking humanity: "Will you then take him and his offspring as allies instead of Me, while they are your enemies? Wretched for the wrongdoers is the exchange!"`,
    sourceAr: 'تفسير ابن كثير، معالم التنزيل للبغوي، أسباب النزول للواحدي',
    sourceEn: 'Tafsir Ibn Kathir, Tafsir Al-Baghawi, Asbab Al-Nuzul by Al-Wahidi',
    lessonAr: `• حقيقة الدنيا دار ممر وزوال، وأن الباقيات الصالحات هي خير عند ربك ثواباً وخير أملاً.
• خطورة الغفلة عن مراقبة كتاب الأعمال الذي يسجل أدق الخواطر والأفعال.
• الحذر الدائم من وسوسة الشيطان وعداوته التاريخية لبني آدم.`,
    lessonEn: `• Fleeting nature of worldly illusion; enduring righteous deeds are the only true currency.
• The terrifying precision of the divine Record of Deeds recording every detail.
• Constant awareness of Satan's relentless hostility against humanity.`
  },
  {
    surahNumber: 18,
    startAyah: 60,
    endAyah: 82,
    storyTitleAr: 'قصة رحلة موسى والخضر المفصلة: التواضع في طلب العلم، والصبر على حكمة القدر الإلهي الخفية',
    storyTitleEn: 'Detailed Epic of Moses & Al-Khidr: Humility in Seeking Knowledge & Unveiling the Hidden Wisdom of Divine Destiny',
    causeAr: `قصة موسى والخضر عليهما السلام هي الإجابة الإلهية العظمى والمفصلة لقصة نبي الله موسى مع العبد الصالح:

سبب الرحلة والبداية النبوية:
قام كليم الله موسى عليه السلام خطيباً في بني إسرائيل، فوعظهم موعظة بليغة ذرفت منها العيون ووجلت منها القلوب، فلما فرغ سأله رجل: يا نبي الله، هل في الأرض أحد أعلم منك؟ فقال موسى: "لا"، ظناً منه أنه صاحب التوراة وكليم الله ولا أحد أعلم منه.
فعتب الله عليه إذ لم يكل العلم إلى الله تعالى، فأوحى الله إليه: "بلى يا موسى، إن لي عبداً بمجمع البحرين هو أعلم منك!".
فقال موسى بتواضع العلماء وشوق الصادقين: "يا رب، فكيف لي به؟".
فقال الله له: خذ معك حوتاً في مكتل (مشنة)، فحيثما فقدت الحوت فهو ثَمَّ.

رحلة البحث مع الفتى يوشع بن نون:
انطلق موسى ومعه فتاه وخادمه يوشع بن نون، وأعلن موسى عزمه الثابت: {لَا أَبْرَحُ حَتَّىٰ أَبْلُغَ مَجْمَعَ الْبَحْرَيْنِ أَوْ أَمْضِيَ حُقُبًا} (أي ولو سرت ثمانين سنة!).
وسارا حتى وصلا إلى صخرة عظيمة عند ملتقى البحرين، فأصابهما التعب وناما، وكان الحوت مملوحاً ميتاً، فمسّه رشاش من ماء عين الحياة، فاضطرب الحوت فجأة وعادت إليه الحياة وقفز من المكتل وسرب في البحر فاتخذ سبيله في البحر سرباً كالسرداب!
ولما استيقظا نسيا الحوت ومضيا بقية ليلتهما ويومهما حتى بلغ النصب والجهد من موسى مبلغه، فقال لفتاه: {آتِنَا غَدَاءَنَا لَقَدْ لَقِينَا مِن سَفَرِنَا هَٰذَا نَصَبًا}.
فتذكر يوشع وقال: {أَرَأَيْتَ إِذْ أَوَيْنَا إِلَى الصَّخْرَةِ فَإِنِّي نَسِيتُ الْحُوتَ وَمَا أَنسَانِيهُ إِلَّا الشَّيْطَانُ أَنْ أَذْكُرَهُ ۚ وَاتَّخَذَ سَبِيلَهُ فِي الْبَحْرِ عَجَبًا}.
فقال موسى: {ذَٰلِكَ مَا كُنَّا نَبْغِ ۚ فَارْتَدَّا عَلَىٰ آثَارِهِمَا قَصَصًا}.

اللقاء بالخضر والشروط الثلاثة:
فرجعا يقصان أقدامهما حتى بلغا الصخرة، فإذا هما برجل مسجى بثوب أبيض فسلم عليه موسى، فقال الخضر مستنكراً: وأنى بأرضك السلام؟ قال: أنا موسى. قال: موسى بني إسرائيل؟ قال: نعم، جئتك لتعلمني مما عُلمت رشداً.
فقال الخضر بميزان العلم الإلهي: يا موسى، إني على علم من علم الله علمنيه لا تعلمه أنت، وأنت على علم من علم الله علمكه لا أعلمه أنا، ولن تستطيع معي صبراً: {وَكَيْفَ تَصْبِرُ عَلَىٰ مَا لَمْ تُحِطْ بِهِ خُبْرًا}.
فوعده موسى: {سَتَجِدُنِي إِن شَاءَ اللَّهُ صَابِرًا وَلَا أَعْصِي لَكَ أَمْرًا}.
فاشترط الخضر شرطاً صارماً: {فَإِنِ اتَّبَعْتَنِي فَلَا تَسْأَلْنِي عَن شَيْءٍ حَتَّىٰ أُحْدِثَ لَكَ مِنْهُ ذِكْرًا}.

الوقائع الثلاث المحيرة:
1. خرق السفينة: انطلقا يمشيان على الساحل فمرت بهما سفينة، فعرف أهلها الخضر فحملوهما إكراماً بغير أجر. فلما ركبا، أخذ الخضر فأساً واقتلع لوحاً من السفينة فدخل الماء! ففزع موسى وقال غاضباً لأصحاب المعروف: {أَخَرَقْتَهَا لِتُغْرِقَ أَهْلَهَا لَقَدْ جِئْتَ شَيْئًا إِمْرًا}، فذكره الخضر بشرطه فاعتذر موسى بالنسيان.
2. قتل الغلام: نزلا من السفينة، فمرا بغلمان يلعبون فاستفرد الخضر بغلام وضيء الوجه فقتله! فصرخ موسى مستنكراً بشدة: {أَقَتَلْتَ نَفْسًا زَكِيَّةً بِغَيْرِ نَفْسٍ لَّقَدْ جِئْتَ شَيْئًا نُّكْرًا}، فأنبه الخضر: ألم أقل لك إنك لن تستطيع معي صبراً؟ فأعطاه موسى الفرصة الأخيرة: {إِن سَأَلْتُكَ عَن شَيْءٍ بَعْدَهَا فَلَا تُصَاحِبْنِي ۖ قَدْ بَلَغْتَ مِن لَّدُنِّي عُذْرًا}.
3. إقامة الجدار: دخلا قرية أهلها لئام بخلاء استطعماهم فأبوا أن يضيفوهما، وبينما هما خارجان وجد الخضر جداراً مائلاً مشرفاً على السقوط، فقام الخضر بيده الشريفة فرممه وأقامه مستوياً، فقال موسى بجهد الجوع: لو شئت لاتخذت عليه أجراً لنشتري به طعاماً!
فقال الخضر: {هَٰذَا فِرَاقُ بَيْنِي وَبَيْنِكَ ۚ سَأُنَبِّئُكَ بِتَأْوِيلِ مَا لَمْ تَسْتَطِع عَّلَيْهِ صَبْرًا}.

كشف أسرار الحكمة الربانية:
1. السفينة: كانت لمساكين يعملون في البحر يقتاتون منها، وكان وراءهم ملك ظالم غاصب يصادر كل سفينة صالحة صحيحة، فعيّبها الخضر لينجو أصحابها بها ويدفعوا فقرهم.
2. الغلام: كان أبواه مؤمنين صالحين وطُبع الغلام كافراً عاقاً، ولو كبر لأرهق أبويه طغياناً وكفراً حباً له، فأراد الله موته صغيراً ليدخلا الجنة وليبدلهما ربهما ولداً باراً رحيماً.
3. الجدار: كان لغلامين يتيمين في المدينة وتحته كنز ذهبي مدفون تركه لهما أبوهما الصالح، فأراد الله أن يبلغا أشدهما ويستخرجا كنزهما رحمة من ربك.
وختم الخضر كلامه متبرئاً من حوله: {وَمَا فَعَلْتُهُ عَنْ أَمْرِي ۚ ذَٰلِكَ تَأْوِيلُ مَا لَمْ تَسْطِع عَّلَيْهِ صَبْرًا}.`,
    causeEn: `The magnificent narrative of Moses and Al-Khidr answering deep spiritual questions about destiny and knowledge:

The Catalyst:
Prophet Moses (AS) delivered a sermon that moved hearts to tears. When asked if anyone on earth was more knowledgeable than him, he answered "No," believing as Allah's direct interlocutor that none exceeded him.
Allah gently reproached him: "Nay, Moses, I have a servant at the junction of the two seas who has knowledge you do not possess."
Moses immediately inquired how to find him. Allah instructed him to carry a salted fish in a basket; wherever the fish was lost, there the servant would be.

The Journey with Yusha ibn Nun:
Moses declared his resolution: "I will not cease until I reach the junction of the two seas, even if I travel for eighty years."
Reaching a large rock by the sea, they rested. A splash from the Spring of Life touched the dead fish, miraculously reviving it, and it burrowed into the sea. When they walked past and grew exhausted, Moses asked: "Bring us our morning meal; we have suffered fatigue." Yusha remembered and confessed: "I forgot the fish at the rock—none made me forget it except Satan—and it took its path into the sea amazingly!" Moses said: "That is what we were seeking!"

The Encounter with Al-Khidr & The Conditions:
Tracing their footsteps, they found Al-Khidr covered in a white garment. Moses requested: "May I follow you so that you may teach me from what you have been taught of right guidance?"
Al-Khidr cautioned: "You will not be able to have patience with me. And how can you have patience over that which you do not comprehend?" Moses promised obedience. Al-Khidr set one condition: "Do not ask me about anything until I make mention of it to you."

The Three Baffling Incidents:
1. The Damaged Ship: Boarding a ship whose crew carried them free of charge, Al-Khidr suddenly pulled out an axe and damaged a hull plank. Shocked, Moses exclaimed: "Have you damaged it to drown its people? You have done a grave thing!" Al-Khidr reminded him of his pledge.
2. The Slain Youth: Passing boys at play, Al-Khidr killed one. Outraged, Moses protested: "Have you killed an innocent soul without cause? You have done an abominable deed!" Moses granted himself one final excuse: "If I ask you anything after this, then keep me not as companion."
3. The Rebuilt Wall: Arriving at an inhospitable village that refused them food, Al-Khidr spotted a crumbling wall and repaired it with his bare hands. Moses noted: "If you wished, you could have taken wages for it to buy food!"
Al-Khidr announced: "This is the parting between me and you. I will now inform you of the interpretation of that which you could not bear patiently."

Unveiling Divine Wisdom:
1. The Ship: Belonged to destitute fishermen; an unjust king was seizing every intact vessel. Damaging it protected their livelihood from confiscation.
2. The Youth: His parents were devout believers, but he was destined to be a brutal tyrant who would drag them into apostasy. Allah took his soul to preserve their faith and grant them a righteous child.
3. The Wall: Concealed a buried treasure belonging to two orphan boys whose father was righteous. Allah preserved it until they reached maturity.
Al-Khidr concluded: "And I did not do it of my own accord. That is the interpretation of that about which you could not have patience."`,
    sourceAr: 'صحيح البخاري (كتاب العلم والتفسير)، صحيح مسلم، مسند أحمد عن أبي بن كعب رضي الله عنه',
    sourceEn: 'Sahih al-Bukhari, Sahih Muslim, Musnad Ahmad from Ubayy ibn Ka\'b (RA)',
    lessonAr: `• التواضع المطلق في طلب العلم، والارتحال وتجشم المشاق في سبيله مهما بلغت مكانة العالِم.
• حكمة الله الخفية في أقداره المؤلمة؛ فكم من مكروه ظاهره العذاب وباطنه عين الرحمة والنجاة.
• صلاح الآباء يحفظ الأبناء وأموالهم حتى بعد وفاتهم ببركة التقوى: {وَكَانَ أَبُوهُمَا صَالِحًا}.
• أدب التلميذ مع المعلم والوفاء بالشروط والعهود.`,
    lessonEn: `• Boundless humility in learning and enduring severe hardships for knowledge regardless of status.
• The hidden perfection of divine decree: what appears outwardly tragic often conceals profound salvation.
• A father's righteousness shields his children's future and inheritance: "And their father was a righteous man."
• High etiquette of students towards teachers and strict fulfillment of conditions.`
  },
  {
    surahNumber: 18,
    startAyah: 83,
    endAyah: 98,
    storyTitleAr: 'قصة الملك العادل ذي القرنين وبناء السد العظيم ضد يأجوج ومأجوج',
    storyTitleEn: 'Detailed Epic of King Dhul-Qarnayn: Journeys to the Edges of the Earth & Engineering the Great Barrier Against Gog and Magog',
    causeAr: `قصة ذي القرنين هي الإجابة الإلهية الثالثة عن سؤال قريش واليهود عن الرجل الطواف الذي بلغ مشارق الأرض ومغاربها:

شخصية ذي القرنين والتمكين الإلهي:
كان ذو القرنين ملكاً صالحاً موحداً عادلاً مكن الله له في الأرض، وبسط سلطانه، وآتاه من كل شيء سبباً (علم الهندسة، القوة العسكرية، والتدبير السياسي والحكمة)، فسخّر كل هذه النعم لنشر التوحيد وإرساء موازين العدل ورفع الظلم عن الشعوب.

رحلته إلى مغرب الشمس:
سار بجيشه غرباً حتى انتهى إلى شاطئ المحيط الأطلسي (بحر الظلمات) حيث تغرب الشمس في مرأى العين كأنها تسقط في عين ماء حارة طينية داكنة: {وَجَدَهَا تَغْرُبُ فِي عَيْنٍ حَمِئَةٍ}، ووجد عندها قوماً وثنيين.
فاختبر الله عدالته وخيره بين تعذيبهم أو الإحسان إليهم، فوضع دستوره الخالد في الحكم: {أَمَّا مَن ظَلَمَ فَسَوْفَ نُعَذِّبُهُ ثُمَّ يُرَدُّ إِلَىٰ رَبِّهِ فَيُعَذِّبُهُ عَذَابًا نُّكْرًا * وَأَمَّا مَنْ آمَنَ وَعَمِلَ صَالِحًا فَلَهُ جَزَاءً الْحُسْنَىٰ ۖ وَسَنَقُولُ لَهُ مِنْ أَمْرِنَا يُسْرًا}.

رحلته إلى مطلع الشمس:
ثم اتجه بجيشه شرقاً حتى بلغ أقصى الشرق المعمور حيث تطلع الشمس على قوم بدائيين لم يجعل الله لهم من دونها ستراً من جبال ولا بنيان يقيهم حرها، فعاملهم بالحكمة والرحمة وتركهم على ما هم عليه دون استبداد.

رحلته بين السدين وبناء السد الهندسي المعجز:
ثم سار حتى وصل إلى منطقة بين جبلين عظيمين متقابلين (بين السدين)، فوجد من ورائهما قوماً مستضعفين معزولين لا يكادون يفقهون لغة الغرباء لشدة انعزالهم.
فلما رأوا عدله وقوته، استغاثوا به من خطر داهم يهدد وجودهم؛ وهو هجمات يأجوج ومأجوج (وهم أمة مفسدة من ذرية يافث بن نوح يعيثون في الأرض قتلاً ونهباً وتخريباً).
وعرض القوم على ذي القرنين أن يجمعوا له خراجاً وأموالاً طائلة من ثرواتهم مقابل أن يبني بينهم وبين يأجوج ومأجوج سداً يحميهم: {فَهَلْ نَجْعَلُ لَكَ خَرْجًا عَلَىٰ أَن تَجْعَلَ بَيْنَنَا وَبَيْنَهُمْ سَدًّا}.

عفة الحاكم المسلم والإعجاز الهندسي:
ترفع ذو القرنين عن أموالهم بعزة نفس وقال كلمته التاريخية: {مَا مَكَّنِّي فِيهِ رَبِّي خَيْرٌ}؛ فما أعطاني ربي من الملك والقدرة خير من أموالكم، ولكن ساعدوني بطاقاتكم البشرية وقوتكم العاملة: {فَأَعِينُونِي بِقُوَّةٍ أَجْعَلْ بَيْنَكُمْ وَبَيْنَهُمْ رَدْمًا}.
ووجّههم بخطة هندسية بالغة الإتقان:
1. أمرهم بجمع قطع ضخمة وألواح من الحديد (زبر الحديد)، ورصفها وسد الفجوة الهائلة بين الجبلين حتى تساوت مع قمتي الجبلين: {حَتَّىٰ إِذَا سَاوَىٰ بَيْنَ الصَّدَفَيْنِ}.
2. أمر بنصب المنافيخ وأوقد النيران الهائلة على الحديد حتى احمر وتوهج كالجمر: {قَالَ انفُخُوا ۖ حَتَّىٰ إِذَا جَعَلَهُ نَارًا}.
3. أحضر النحاس المذاب المغلي وصبه فوق مسام الحديد الملتهب: {قَالَ آتُونِي أُفْرِغْ عَلَيْهِ قِطْرًا}.
فالتحم النحاس بالحديد وصنع سداً معدنياً مصفحاً أملس، شديد الصلابة لا يصدأ ولا ينثني.

النتيجة وتواضع الصالحين:
حُبس يأجوج ومأجوج وراء السد، فعجزوا عن تسلقه لارتفاعه وملاسته، وعجزوا عن نقبه لصلابته: {فَمَا اسْطَاعُوا أَن يَظْهَرُوهُ وَمَا اسْتَطَاعُوا لَهُ نَقْبًا}.
ولم يتفاخر ذو القرنين بعبقريته العسكرية أو الهندسية، بل رد الفضل كله لله متواضعاً: {قَالَ هَٰذَا رَحْمَةٌ مِّن رَّبِّي ۖ فَإِذَا جَاءَ وَعْدُ رَبِّي جَعَلَهُ دَكَّاءَ ۖ وَكَانَ وَعْدُ رَبِّي حَقًّا}.`,
    causeEn: `The epic narrative of Dhul-Qarnayn answering Quraysh's third query about the righteous monarch who traversed the horizons:

Identity & Mission:
Dhul-Qarnayn was an upright monotheist emperor granted geopolitical mastery, military prowess, and advanced technological expertise. He harnessed this dominion solely for establishing justice and aiding the oppressed.

Western Journey:
He marched west until he reached the Atlantic coast where the sun appeared to set in a murky thermal water expanse, encountering pagan tribes. Tested by Allah with authority, he established his eternal constitution of rule: firm retribution against tyrants and criminals, contrasted with generosity and honor for believers of righteous deeds.

Eastern Journey:
He ventured to the eastern limits where the sun rose over a nomadic population with no shelter or construction shielding them from heat, treating them with gentleness and leaving them undisturbed.

Northern Frontier & The Metallurgical Barrier:
Marching between two towering mountain ranges (between the two barriers), he discovered an isolated population who could scarcely understand foreign speech.
Plagued by savage raids of Gog and Magog (Yajuj and Majuj)—a destructive horde ravaging their lands—the inhabitants offered to pool taxes and riches if he would construct a barrier protecting them.

Righteous Leadership & Engineering Triumph:
Dhul-Qarnayn rejected their gold, proclaiming: "That in which my Lord has established me is better. Just assist me with manpower, and I will construct an impenetrable barrier between you and them!"
He directed a legendary engineering masterpiece:
1. Gathering massive iron ingots, they stacked and filled the colossal ravine until it leveled evenly with the mountain peaks.
2. Directing giant bellows, they stoked fires until the iron turned white-hot.
3. Pouring boiling molten copper over the glowing iron, the metals fused into a seamless, impenetrable alloy wall.

The Outcome:
Gog and Magog were unable to scale its steep polished face or puncture its hardened core. Dhul-Qarnayn shunned vanity, bowing humbly: "This is a mercy from my Lord. But when the promise of my Lord comes to pass, He will level it to dust, and the promise of my Lord is ever true."`,
    sourceAr: 'تفسير ابن كثير، سيرة ابن هشام، جامع البيان للطبري، البداية والنهاية',
    sourceEn: 'Tafsir Ibn Kathir, Seerah Ibn Hisham, Tafsir al-Tabari, Al-Bidayah wan-Nihayah',
    lessonAr: `• تسخير القوة والعلوم والتقنيات الهندسية في حماية المستضعفين وخدمة الإنسانية.
• نزاهة الحاكم الصالح وترفعه عن الرشوة واستغلال حاجة الشعوب المستضعفة.
• التواضع ونسبة كل إنجاز ونجاح إلى فضل الله ورحمته وليس للجهد الشخصي.
• الإيمان بأشراط الساعة الكبرى وأن خروج يأجوج ومأجوج من علامات اقتراب الوعد الحق.`,
    lessonEn: `• Utilizing military strength and engineering technology to defend vulnerable societies.
• Exemplary integrity of righteous leaders rejecting bribes and exploitation of needy citizens.
• Genuine humility in attributing every technical and political triumph solely to divine mercy.
• Firm belief in signs of the Day of Judgment, including the eventual breaching of the barrier.`
  },
  {
    surahNumber: 18,
    startAyah: 99,
    endAyah: 110,
    storyTitleAr: 'سياق ختام سورة الكهف: هول النفخ في الصور، سعة كلمات الله، والشرطان لقبول العمل',
    storyTitleEn: 'Surah Al-Kahf Conclusion: The Trumpet Blast, Immensity of Divine Wisdom & Two Pillars of Accepted Deeds',
    causeAr: `سياق الآيات الخاتمة وسبب نزولها:
نزلت الآيات الخاتمة رداً على أحبار اليهود الذين قالوا للنبي ﷺ لما سمعوا قوله تعالى: {وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا}: "أوتينا التوراة وفيها تبيان كل شيء، فكيف تقول وما أوتيتم من العلم إلا قليلاً؟".
فأنزل الله رداً حاسماً يوضح الفارق بين علم المخلوق وعلم الخالق:
{قُل لَّوْ كَانَ الْبَحْرُ مِدَادًا لِّكَلِمَاتِ رَبِّي لَنَفِدَ الْبَحْرُ قَبْلَ أَن تَنفَدَ كَلِمَاتُ رَبِّي وَلَوْ جِئْنَا بِمِثْلِهِ مَدَدًا}.

ثم خُتمت السورة بأعظم وصية جامعة في القرآن تجمع ركني قبول أي عمل صالح:
{قُلْ إِنَّمَا أَنَا بَشَرٌ مِّثْلُكُمْ يُوحَىٰ إِلَيَّ أَنَّمَا إِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ فَمَن كَانَ يَرْجُو لِقَاءَ رَبِّهِ فَلْيَعْمَلْ عَمَلًا صَالِحًا وَلَا يُشْرِكْ بِعِبَادَةِ رَبِّهِ أَحَدًا}.`,
    causeEn: `Revelation Context of the Climax:
Revealed in response to Jewish scholars who challenged the Prophet ﷺ after hearing the verse: "And you have not been given of knowledge except a little." They retorted: "We were given the Torah which contains guidance for everything!"
Allah revealed the supreme contrast between mortal knowledge and divine infinity:
"Say, 'If the sea were ink for the words of my Lord, the sea would be exhausted before the words of my Lord were exhausted, even if We brought the like of it as a supplement.'"

The chapter concludes with the timeless golden rule of worship:
"Say, 'I am only a man like you, to whom has been revealed that your god is one God. So whoever would hope for the meeting with his Lord - let him do righteous work and not associate in the worship of his Lord anyone.'"`,
    sourceAr: 'أسباب النزول للواحدي، تفسير الطبري، مسند أحمد عن ابن عباس رضي الله عنهما',
    sourceEn: 'Asbab Al-Nuzul by Al-Wahidi, Tafsir al-Tabari, Musnad Ahmad from Ibn Abbas (RA)',
    lessonAr: `• علم الخلائق جميعاً قطرة في بحر علم الله وكلماته وحكمته التي لا نهاية لها.
• شرطا قبول العمل عند الله هما: الإخلاص لله تعالى وحده، والمتابعة لسنة رسوله ﷺ.
• إثبات بشرية النبي ﷺ مع اصطفائه بالوحي والنبوة، وتنزيه الله عن الشريك.`,
    lessonEn: `• All human wisdom is a drop compared to the infinite ocean of divine knowledge and words.
• The two non-negotiable pillars for accepted deeds: pure sincerity for Allah and following the Prophetic example.
• Affirming the human nature of the Prophet ﷺ adorned with divine revelation.`
  },

  // --- سورة يوسف (12) ---
  {
    surahNumber: 12,
    startAyah: 1,
    endAyah: 111,
    storyTitleAr: 'قصة أحسن القصص: ابتلاءات وصبر وتمكين يوسف الصديق عليه السلام',
    storyTitleEn: 'The Best of Stories: Trials, Patience & Triumph of Prophet Yusuf (AS)',
    causeAr: 'نزلت سورة يوسف بالكامل في مكة في عام الحزن بعد وفاة خديجة وأبي طالب حين اشتاق الصحابة لسماع قصة تتضمن العبرة والسلوى، فقالوا: يا رسول الله، لو قصصت علينا؟ فأنزل الله {نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ}، مبينةً حسد إخوة يوسف، وإلقائه في الجب، وبيعه بالدراهم، وفتنة امرأة العزيز، ثم السجن لسنين، حتى رؤيا الملك والتمكين وإدارة اقتصاد مصر وجمع الشمل والصفح الجميل.',
    causeEn: 'Surah Yusuf was revealed during the Year of Sorrow following the deaths of Khadijah and Abu Talib to comfort the believers with the "Best of Stories" detailing Joseph\'s dream, betrayal, the pit, temptation, wrongful imprisonment, economic mastery, and gracious pardon.',
    sourceAr: 'مستدرك الحاكم وتفسير ابن كثير عن سعد بن أبي وقاص رضي الله عنه',
    sourceEn: 'Mustadrak Al-Hakim & Tafsir Ibn Kathir from Sa\'d ibn Abi Waqqas (RA)',
    lessonAr: 'الصبر الجميل، والعفة عن الحرام، والتسامح والصفح عند المقدرة، وأن لطف الله يحول المحن إلى منح.',
    lessonEn: 'Unwavering patience, chastity under temptation, magnanimous forgiveness, and divine subtlety transforming trials into triumph.'
  },

  // --- سورة مريم (19) ---
  {
    surahNumber: 19,
    startAyah: 1,
    endAyah: 98,
    storyTitleAr: 'قصة زكريا ويحيى ومريم وعيسى عليه السلام وبراءة التوحيد وتلاوة النجاشي',
    storyTitleEn: 'Stories of Zakariya, Yahya, Maryam & Isa (AS) and the Negus Court Recitation',
    causeAr: 'نزلت تبياناً وتكريماً للصديقة مريم العذراء وبياناً لولادة عيسى عليه السلام بكلمة من الله دون أب، وذكراً لدعاء زكريا الشديد واستجابة الله له بالولد يحيى في كبره، وتلاها جعفر بن أبي طالب في بلاط النجاشي ملك الحبشة فبكى وبكت أساقفته وحمى المهاجرين المسلمين.',
    causeEn: 'Revealed honoring Maryam and detailing the miraculous birth of Jesus as a Word from Allah, as well as Zakariya\'s supplication for Yahya. Recited by Ja\'far at the Abyssinian court, bringing the Christian King Negus to tears and granting Muslims asylum.',
    sourceAr: 'تفسير الطبري وابن كثير وسيرة ابن هشام (هجرة الحبشة)',
    sourceEn: 'Tafsir al-Tabari & Ibn Kathir & Seerah Ibn Hisham (Abyssinia Migration)',
    lessonAr: 'قدرة الله مطلقة تتجاوز القوانين المادية، وعظمة الدعاء الخفي، وطهارة ومكانة السيدة مريم.',
    lessonEn: 'Allah\'s omnipotence transcends physical laws; sincere supplication is answered and Maryam is exalted.'
  },

  // --- سورة طه (20) ---
  {
    surahNumber: 20,
    startAyah: 1,
    endAyah: 135,
    storyTitleAr: 'قصة نداء الله لموسى بالوادي المقدس طوى ومواجهة فرعون والسحرة وإسلام عمر',
    storyTitleEn: 'Call of Musa at Sacred Valley of Tuwa, Magicians\' Prostration & Conversion of Umar',
    causeAr: 'نزلت السورة تثبيتاً لقلب النبي ﷺ وتخفيفاً عنه في مكة: {مَا أَنزَلْنَا عَلَيْكَ الْقُرْآنَ لِتَشْقَى}، واستحضرت التفصيل العظيم لنداء الله لموسى في طور سيناء وإرساله لفرعون، وسحر السحرة وإيمانهم الباهر، وكانت سبب إسلام عمر بن الخطاب رضي الله عنه حين قرأها في دار أخته.',
    causeEn: 'Revealed to comfort the Prophet ﷺ: "We have not sent down to you the Quran that you be distressed," narrating Musa\'s calling at Mount Sinai, confronting Pharaoh, and the magicians\' faith. It catalyzed the historic conversion of Umar ibn al-Khattab.',
    sourceAr: 'أسباب النزول للواحدي وسيرة ابن هشام وتفسير البغوي',
    sourceEn: 'Asbab Al-Nuzul by Al-Wahidi, Seerah Ibn Hisham, Tafsir Al-Baghawi',
    lessonAr: 'القرآن هو تذكرة لمن يخشى وليس شقاءً، والحق يستعلي دائماً ويبطل السحر والباطل.',
    lessonEn: 'The Quran is reminders and mercy; truth ultimately prevails over tyranny and falsehood.'
  }
];

// 3. دالة جلب سبب النزول المباشر أو التفسير السياقي والقصصي لجميع سور القرآن الـ 114
export const getSababNuzulForAyah = (surahNumber: number, ayahNumber: number): SababNuzulEntry => {
  // 1. البحث في قاعدة البيانات المباشرة للأسباب المحددة بدقة للآية
  const exactMatch = ASBAB_NUZUL_DATABASE.find(e => e.surahNumber === surahNumber && e.ayahNumber === ayahNumber);
  if (exactMatch) return exactMatch;

  // 2. البحث في خريطة مقاطع السور والقصص النبوية المطولة المفصلة
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

  // 3. استخدام الموسوعة الشاملة لجميع سور القرآن الكريم الـ 114 سورة بالتفصيل
  const encyclopediaEntry = ALL_SURAHS_STORY_ENCYCLOPEDIA[surahNumber];
  if (encyclopediaEntry) {
    return {
      surahNumber,
      ayahNumber,
      surahName: encyclopediaEntry.surahNameAr,
      storyTitleAr: `${encyclopediaEntry.storyTitleAr} (آية ${ayahNumber})`,
      storyTitleEn: `${encyclopediaEntry.storyTitleEn} (Ayah ${ayahNumber})`,
      causeAr: encyclopediaEntry.causeAr,
      causeEn: encyclopediaEntry.causeEn,
      sourceAr: encyclopediaEntry.sourceAr,
      sourceEn: encyclopediaEntry.sourceEn,
      lessonAr: encyclopediaEntry.lessonAr,
      lessonEn: encyclopediaEntry.lessonEn
    };
  }

  // احتياط طوارئ نادر إذا لم توجد السورة
  return {
    surahNumber,
    ayahNumber,
    surahName: `السورة ${surahNumber}`,
    storyTitleAr: `سياق سورة القرآن الكريم (آية ${ayahNumber})`,
    storyTitleEn: `Quranic Revelation Context (Ayah ${ayahNumber})`,
    causeAr: `نزلت هذه الآية الكريمة ضمن سياق السورة المباركة هداية وتبياناً لأصول الإيمان والتشريع والأخلاق والتدبر.`,
    causeEn: `Revealed within this blessed chapter providing divine guidance, legislation, and spiritual contemplation.`,
    sourceAr: `أمهات كتب التفسير وأسباب النزول المعتمدة`,
    sourceEn: `Canonical Tafsir & Revelation Literature`,
    lessonAr: `وجوب تدبر آيات الله والعمل بمقتضاها والتخلق بأخلاق القرآن.`,
    lessonEn: `Deep contemplation of Quranic verses and applying their virtues in daily life.`
  };
};
