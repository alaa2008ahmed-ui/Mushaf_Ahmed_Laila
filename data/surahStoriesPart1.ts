// الجزء الأول من موسوعة قصص وأسباب نزول سور القرآن الكريم (السور من 1 إلى 28)
// يحتوي على التفاصيل الكاملة لأسباب النزول، وسياق القصص القرآنية، والدروس المستفادة.

import { SurahEncyclopediaStory } from './quranSurahStoriesEncyclopedia';

export const SURAH_STORIES_PART_1: Record<number, SurahEncyclopediaStory> = {
  // 1. الفاتحة
  1: {
    surahNumber: 1,
    surahNameAr: 'الفاتحة',
    surahNameEn: 'Al-Fatiha',
    storyTitleAr: 'سياق نزول أم الكتاب وفضائل رقية الفاتحة وقسمة الصلاة',
    storyTitleEn: 'Revelation of the Opening Surah & Its Divine Healing',
    causeAr: `سورة الفاتحة هي أعظم سور القرآن الكريم، وتعددت الروايات في سبب ومكان نزولها، وأرجحها أنها نزلت بمكة في أوائل البعثة النبوية حين فُرضت الصلاة، ولا تصح صلاة إلا بها.

وروى الإمام علي بن أبي طالب رضي الله عنه أن رسول الله ﷺ كان إذا برز سمع منادياً من السماء يناديه: "يا محمد!"، فإذا سمع الصوت انطلق هارباً دهشةً، حتى نصحه ورقة بن نوفل بأن يثبت ويستمع لما يُقال له. فلما برز ناداه جبريل عليه السلام: "يا محمد، قل: بسم الله الرحمن الرحيم، الحمد لله رب العالمين، الرحمن الرحيم..." حتى ختم السورة الكريمة، فكانت بشارة بالرسالة ودستوراً للصلاة.

ومن أعظم القصص النبوية المرتبطة بهذه السورة، قصة الصحابي أبي سعيد الخدري رضي الله عنه حين نزل رهط من الصحابة بحي من أحياء العرب واستضافوهم فأبوا أن يضيفوهم، فلُدغ سيد الحي فأتوا الصحابة يسألونهم رقية، فرقى أبو سعيد الخدري سيد الحي بسورة الفاتحة يقرؤها وينفث، فقام كأنما نَشِطَ من عِقال ولم يبق به قلبة، وأعطوهم قطيعاً من الغنم، فأقرهم النبي ﷺ وقال لأبي سعيد: "وما يدريك أنها رقية؟ اقسموا واضربوا لي معكم بسهم".

كما صح في الحديث القدسي العظيم: "قسمت الصلاة بيني وبين عبدي نصفين، فإذا قال العبد: الحمد لله رب العالمين، قال الله: حمدني عبدي...".`,
    causeEn: `Al-Fatiha is the greatest chapter of the Holy Quran, revealed in Makkah at the dawn of Prophethood to establish prayer. When the Prophet ﷺ initially heard the celestial call, Jibril (Gabriel) appeared commanding him to recite: "In the Name of Allah, the Most Gracious, the Most Merciful..."

A famous prophetic event occurred when Abu Sa'id al-Khudri treated a dying tribal chief bitten by a scorpion by reciting Al-Fatiha; the chief stood fully healed as if freed from chains. In Hadith Qudsi, Allah declares: "I have divided the prayer between Myself and My servant into two halves..."`,
    sourceAr: 'صحيح البخاري، صحيح مسلم، أسباب النزول للواحدي، سنن البيهقي',
    sourceEn: 'Sahih al-Bukhari, Sahih Muslim, Asbab Al-Nuzul by Al-Wahidi',
    lessonAr: `• أم الكتاب تشتمل على جميع مقاصد الدين: إخلاص التوحيد، وإثبات الجزاء، وحصر الاستعانة والعبادة بالله وحده.
• طلب الهداية إلى الصراط المستقيم هو أعظم وألح دعاء يحتاجه العبد في كل ركعة وفي كل شأن.
• فضل سورة الفاتحة كرقية شرعية كافية وشافية لأمراض القلوب والأبدان.`,
    lessonEn: `• Al-Fatiha contains the whole essence of Islam: pure monotheism, day of judgment, and devotion to Allah alone.
• Seeking guidance on the Straight Path is the most essential prayer in life.
• Spiritual healing power of Al-Fatiha as a complete Ruqyah.`
  },

  // 2. البقرة
  2: {
    surahNumber: 2,
    surahNameAr: 'البقرة',
    surahNameEn: 'Al-Baqarah',
    storyTitleAr: 'سياق نزول أطول سور القرآن وقصة بقرة بني إسرائيل وميثاق الاستخلاف',
    storyTitleEn: 'Revelation of Al-Baqarah: The Cow Parable & Divine Covenant',
    causeAr: `سورة البقرة هي أول سورة نزلت بالمدينة المنورة بعد هجرة النبي ﷺ، ونزلت آياتها على مدار سنوات العهد المدني لتبني المجتمع الإسلامي وترسخ أركان الدولة وتنظم الشؤون العقدية والمالية والأسرية والجهادية.

وتحمل السورة القصة الشهيرة لبقرة بني إسرائيل؛ حيث قُتل رجل غني موسر من بني إسرائيل ولم يُعرف قاتله، وكادت تقع فتنة وحرب بين الأسباط، فأتوا نبي الله موسى عليه السلام يسألونه أن يدعو ربه ليكشف القاتل. فأمرهم موسى بأمر الله قائلاً: {إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تَذْبَحُوا بَقَرَةً}. وبدلاً من الامتثال السريع والاستسلام لأمر الله، بدأ بنو إسرائيل يماطلون ويتعنتون بكثرة الأسئلة والتفاصيل: ما هي؟ وما لونها؟ وما شأنها؟ فشددوا على أنفسهم فشدد الله عليهم، حتى طلبوا بقرة صفراء فاقع لونها تسر الناظرين، لا ذلول تثير الأرض ولا تسقي الحرث. فلما وجدوها واشتروها بثمن باهظ ذبحوها وكادوا لا يفعلون، ثم ضربوا القتيل ببعضها فأحياه الله بقدرته ونطق باسم قاتله وكُشفت الجريمة.

كما تفيض السورة بوقائع نزول متتابعة: كقصة تحويل القبلة من بيت المقدس إلى الكعبة المشرفة بعد ستة عشر شهراً من شوق النبي ﷺ ودعائه، وقصة طالوت وجالوت ونصرة الفئة القليلة المؤمنة على الفئة الكثيرة، وقصة محاجة إبراهيم للنمرود في خلق الحياة والموت، وأعظم آية في كتاب الله (آية الكرسي) التي تصدع بالتوحيد وتنفي العجز والسِنة والنوم عن القيوم سبحانه.`,
    causeEn: `Al-Baqarah was the first Surah revealed in Madinah, laying down the civil, military, and spiritual constitution of Islam. It contains the famous narrative of the yellow cow of the Children of Israel, who complicated a simple divine command with obstinate questioning after an unresolved murder, until Allah miraculously revived the deceased to identify his murderer.

The surah also details the changing of the Qibla towards Makkah, Talut and Jalut, Abraham confronting Nimrod, and Ayat Al-Kursi—the greatest verse in the Quran.`,
    sourceAr: 'صحيح البخاري، تفسير ابن كثير، جامع البيان للطبري، أسباب النزول للواحدي',
    sourceEn: 'Sahih al-Bukhari, Tafsir Ibn Kathir, Tafsir al-Tabari',
    lessonAr: `• التحذير الشديد من المماطلة والتشدد في دين الله، ووجوب التسليم الفوري لأوامر الشرع.
• قدرة الله المطلقة على إحياء الموتى وإظهار الحق مهما حاول المجرمون إخفاءه.
• التمكين في الأرض ميثاق أمانة وعدالة يزول بالظلم والغفلة والانحراف عن الوحي.`,
    lessonEn: `• Submission without unwarranted complication of divine commands.
• Certainty of resurrection and divine justice revealing hidden truths.
• The spiritual responsibility of stewardship on Earth.`
  },

  // 3. آل عمران
  3: {
    surahNumber: 3,
    surahNameAr: 'آل عمران',
    surahNameEn: 'Ali \'Imran',
    storyTitleAr: 'سياق وفد نصارى نجران والمباهلة وأحداث غزوة أحد ودروس الثبات',
    storyTitleEn: 'The Delegation of Najran & Lessons of Faith from the Battle of Uhud',
    causeAr: `سورة آل عمران سورة مدنية ارتبطت بمحطتين مفصليتين:
الأولى: مناظرة وفد نصارى نجران الذين غلوا في عيسى بن مريم عليه السلام، فأنزل الله رداً حاسماً: {إِنَّ مَثَلَ عِيسَىٰ عِندَ اللَّهِ كَمَثَلِ آدَمَ ۖ خَلَقَهُ مِن تُرَابٍ ثُمَّ قَالَ لَهُ كُن فَيَكُونُ}، ودعاهم النبي ﷺ إلى المباهلة فخافوا ونكصوا.
الثانية: التحليل القرآني الدقيق لغزوة أحد؛ حين خالف الرماة أمر النبي ﷺ ونزلوا لجمع الغنائم، فحدثت الهزيمة واستُشهد سبعون من الصحابة، فأنزل الله الآيات تثبيتاً للقلوب وبياناً لسنة التمحيص الإلهي وأجر الشهداء.`,
    causeEn: `Revealed in Madinah, Ali 'Imran addresses the theological debate with the Christian delegation of Najran, culminating in the call to Mubahala, and provides a profound analysis of the Battle of Uhud where the disobedience of the archers caused a painful trial, teaching the companions eternal discipline, repentance, and steadfastness.`,
    sourceAr: 'صحيح البخاري، صحيح مسلم، سيرة ابن هشام، تفسير البغوي',
    sourceEn: 'Sahih al-Bukhari, Sahih Muslim, Seerah Ibn Hisham',
    lessonAr: `• وجوب الطاعة الكاملة والالتزام بالأوامر القيادية والشرعية؛ فحب الدنيا ومخالفة الهدي سبب الانكسار.
• تنزيه عيسى عليه السلام عن الشرك وإثبات أنه عبد الله ورسوله وكلمته ألقاها إلى مريم.
• الابتلاء سنة ماضية لتمحيص الصادقين ورفع درجات الشهداء.`,
    lessonEn: `• True victory requires unwavering adherence to divine instruction over material gain.
• Pure monotheism honoring Jesus as a noble prophet rather than divine.
• The exalted, living status of martyrs in the presence of Allah.`
  },

  // 4. النساء
  4: {
    surahNumber: 4,
    surahNameAr: 'النساء',
    surahNameEn: 'An-Nisa',
    storyTitleAr: 'سياق حماية الضعفاء وتشريع المواريث وقصة درع قتادة وبراءة اليهودي',
    storyTitleEn: 'Safeguarding the Vulnerable, Inheritance Laws & Absolute Justice',
    causeAr: `سورة النساء سورة مدنية ركزت على إقامة العدل الاجتماعي وكفالة اليتامى والأرامل بعد استشهاد أرباب الأسر في غزوة أحد، وتحديد أنصبة المواريث.
وتضم القصة الشهيرة لطعمة بن أبيرق الذي سرق درعاً لقتادة بن النعمان وخبأها عند يهودي يدعى زيد بن السمين واتهم اليهودي بالسرقة، وجاء قومه يدافعون عنه عند النبي ﷺ، فأنزل الله براءة اليهودي وإدانة الخائن: {إِنَّا أَنزَلْنَا إِلَيْكَ الْكِتَابَ بِالْحَقِّ لِتَحْكُمَ بَيْنَ النَّاسِ بِمَا أَرَاكَ اللَّهُ ۚ وَلَا تَكُن لِّلْخَائِنِينَ خَصِيمًا}.`,
    causeEn: `Revealed after Uhud, An-Nisa established robust social justice and inheritance laws. When Tu'mah stole a shield and framed a Jewish man, Allah revealed verses vindicating the Jewish man and condemning the false defense of a treacherous Muslim, establishing absolute justice.`,
    sourceAr: 'سنن الترمذي، تفسير الطبري، أسباب النزول للواحدي',
    sourceEn: 'Sunan at-Tirmidhi, Tafsir al-Tabari, Asbab Al-Nuzul by Al-Wahidi',
    lessonAr: `• العدالة في الإسلام مطلقة فوق العصبيات والقرابة والديانة.
• الحفاظ على حقوق النساء واليتامى والأمانات المالية.
• نبذ الخيانة والنفاق والتبرؤ من الظالمين.`,
    lessonEn: `• Impartial justice applies equally regardless of faith or status.
• Severe prohibition against taking the wealth of orphans.
• Total protection of women's rights and family dignity.`
  },

  // 5. المائدة
  5: {
    surahNumber: 5,
    surahNameAr: 'المائدة',
    surahNameEn: 'Al-Ma\'idah',
    storyTitleAr: 'سياق إكمال الدين في حجة الوداع وقصة ابني آدم ومائدة عيسى عليه السلام',
    storyTitleEn: 'Completion of Religion, Story of Cain & Abel, and the Heavenly Table',
    causeAr: `سورة المائدة من أواخر ما نزل، ونزلت فيها آية إكمال الدين يوم عرفة: {الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ}. وتسرد قصة ابني آدم (قابيل وهابيل) حين تقبل الله قربان هابيل التقي فحسده قابيل وقتله ليكون أول قاتل في تاريخ البشرية، وبعث الله غراباً يبحث في الأرض ليريه كيف يواري سوأة أخيه. كما تسرد طلب الحواريين لنزول مائدة طعام من السماء على يد عيسى عليه السلام لتكون لهم عيداً وشاهداً على صدق الرسالة.`,
    causeEn: `Al-Ma'idah was among the last chapters revealed, featuring the completion of religion at the Farewell Pilgrimage. It details the murder of Abel by his envious brother Cain, the raven demonstrating burial, and Jesus's disciples receiving the miraculous Heavenly Table.`,
    sourceAr: 'صحيح البخاري، صحيح مسلم، تفسير ابن كثير',
    sourceEn: 'Sahih al-Bukhari, Sahih Muslim, Tafsir Ibn Kathir',
    lessonAr: `• خطورة الحسد وعاقبته الوخيمة في إهلاك النفس وإشعال العداوات.
• الوفاء بالعقود والعهود وامتثال الحلال والحرام.
• كمال الشريعة الإسلامية وشموليتها لكل مناحي الحياة.`,
    lessonEn: `• The destructive consequence of envy that sparked the first homicide.
• The sacred obligation of fulfilling covenants.
• The finality and perfection of divine revelation in Islam.`
  },

  // 6. الأنعام
  6: {
    surahNumber: 6,
    surahNameAr: 'الأنعام',
    surahNameEn: 'Al-An\'am',
    storyTitleAr: 'سياق نزول السورة جملة واحدة وقصة مناظرة إبراهيم في الكواكب والتوحيد',
    storyTitleEn: 'Revelation with 70,000 Angels & Abraham\'s Celestial Debate',
    causeAr: `سورة الأنعام مكية نزلت جملة واحدة ليلاً يشيعها سبعون ألف ملك بالتسبيح والتحميد تعظيماً لما حوته من براهين التوحيد القاطعة. وتبرز فيها قصة مناظرة خليل الله إبراهيم لقومه حين نظر في الكوكب والقمر والشمس، فاستدل بأفولها وغيابها على بطلان ألوهيتها، وأعلن التوحيد الخالص لله فاطر السماوات والأرض.`,
    causeEn: `Revealed all at once in Makkah escorted by 70,000 angels, Al-An'am focuses on pure theology and features Abraham's logical debate observing stars, moon, and sun to disprove idol worship and assert the sole worship of the Creator.`,
    sourceAr: 'مستدرك الحاكم، تفسير القرطبي، أسباب النزول للواحدي',
    sourceEn: 'Mustadrak Al-Hakim, Tafsir Al-Qurtubi, Asbab Al-Nuzul by Al-Wahidi',
    lessonAr: `• التوحيد يبنى على التفكر والبرهان العقلي اليقيني.
• الكائنات والمخلوقات آيات دالة على الخالق ولا تصح عبادتها من دون الله.
• عظمة القرآن الكريم ورعاية الملائكة لكلمات الوحي.`,
    lessonEn: `• Faith rests on rational reflection and certainty.
• Celestial bodies are signs pointing to the Creator.
• The exalted status of Surah Al-An'am in Islamic creed.`
  },

  // 7. الأعراف
  7: {
    surahNumber: 7,
    surahNameAr: 'الأعراف',
    surahNameEn: 'Al-A\'raf',
    storyTitleAr: 'سياق صراع الحق والباطل وقصص الأمم وأصحاب السبت وتجلي الطور',
    storyTitleEn: 'Epic of Divine Guidance, The Sabbath Breakers & Mount Sinai',
    causeAr: `سورة الأعراف مكية ترسم تاريخ الهداية والصراع مع إبليس. وتضم قصة سؤال موسى لرؤية ربه وتجلي الله لجبل الطور فجعله دكاً وخر موسى صعقاً. وقصة أصحاب السبت من بني إسرائيل الذين احتالوا على صيد الحيتان بالسبت فمسخ الله المعتدين قردة خاسئين ونجى الناصحين الآمرين بالمعروف. وقصة بلعام بن باعوراء الذي آتاه الله العلم فانسلخ منه واتبع هواه.`,
    causeEn: `Al-A'raf documents the struggle between truth and falsehood. It recounts Mount Sinai crumbling when Moses asked to see his Lord, the transgression of the Sabbath fishermen who were transformed for deceptive tricks, and Balaam who traded divine signs for worldly lusts.`,
    sourceAr: 'صحيح مسلم، تفسير ابن كثير، البداية والنهاية',
    sourceEn: 'Sahih Muslim, Tafsir Ibn Kathir, Al-Bidayah wan-Nihayah',
    lessonAr: `• التحذير من التحايل على شرع الله واستحلال المحرمات.
• فريضة الأمر بالمعروف والنهي عن المنكر هي سبب النجاة عند حلول العذاب.
• العلم بغير تقوى وعمل يورد صاحبه الهلاك.`,
    lessonEn: `• The peril of inventing loopholes to commit sins.
• Enjoining good and forbidding evil is the path to salvation.
• Knowledge without righteousness becomes a curse.`
  },

  // 8. الأنفال
  8: {
    surahNumber: 8,
    surahNameAr: 'الأنفال',
    surahNameEn: 'Al-Anfal',
    storyTitleAr: 'سياق غزوة بدر الكبرى ونزول الملائكة مردفين وتقسيم الغنائم',
    storyTitleEn: 'The Battle of Badr: Angelic Reinforcements & The Spoils of Faith',
    causeAr: `سورة الأنفال (سورة بدر) مدنية نزلت في أعقاب غزوة بدر الكبرى في رمضان 2 هـ. تبين تفاصيل استشارة النبي ﷺ للأنصار والمهاجرين، ودعائه المستمر في العريش، ونزول النعاس والمطر، وتأييد الله للمؤمنين بألف من الملائكة مردفين بقيادة جبريل. ولما اختلف الصحابة في قسمة الغنائم نزلت السورة لتؤكد أن النصر والغنيمة لله ورسوله لتوحيد الصفوف ونبذ التنازع.`,
    causeEn: `Al-Anfal is the Surah of Badr, revealed after the great victory of 2 AH. Outnumbered, the believers were aided by calm sleep, rain, and 1,000 angels. When dispute arose over war spoils, Allah reclaimed their authority to preserve brotherhood and spiritual purity.`,
    sourceAr: 'صحيح البخاري، صحيح مسلم، سيرة ابن هشام',
    sourceEn: 'Sahih al-Bukhari, Sahih Muslim, Seerah Ibn Hisham',
    lessonAr: `• النصر من عند الله بالتوكل والاستقامة وليس بالكثرة والعتاد.
• التنازع على الدنيا يذهب بركة العمل ويفشل العزائم.
• الملائكة والكرامات تؤيد من صدق في جهاده وبذله لنصرة الحق.`,
    lessonEn: `• Victory comes from Allah through sincerity rather than numbers.
• Worldly greed breaks unity and saps collective power.
• Divine support unfailingly attends sincere believers.`
  },

  // 9. التوبة
  9: {
    surahNumber: 9,
    surahNameAr: 'التوبة',
    surahNameEn: 'At-Tawbah',
    storyTitleAr: 'سياق غزوة تبوك وفضح المنافقين وقصة توبة الثلاثة الذين خُلفوا',
    storyTitleEn: 'The Expedition of Tabuk, Exposing Hypocrisy & The Three Who Remained',
    causeAr: `سورة التوبة نزلت في العام 9 هـ إثر غزوة تبوك (جيش العسرة) لمواجهة الروم في حر الصيف الشديد. فضح الله فيها نفاق المنافقين الذين اعتذروا كذباً وتخلفوا عن النفير. وسردت القصة العظيمة لتوبة كعب بن مالك وصاحبيه الذين اعترفوا بصدق بتخلفهم دون نفاق، فقاطعهم المسلمون خمسين ليلة حتى نزلت براءتهم وتوبتهم من فوق سبع سماوات بعد أن ضاقت عليهم الأرض بما رحبت.`,
    causeEn: `Revealed after the Expedition of Tabuk, At-Tawbah unmasked hypocrites who fabricated excuses. It highlights Ka'b ibn Malik and two companions who honestly admitted their neglect and endured fifty days of isolation until Allah accepted their sincere repentance.`,
    sourceAr: 'صحيح البخاري، صحيح مسلم، أسباب النزول للواحدي',
    sourceEn: 'Sahih al-Bukhari, Sahih Muslim, Asbab Al-Nuzul by Al-Wahidi',
    lessonAr: `• الصدق منجاة في كل حال، والكذب والاعتذار الباطل خزي ونفاق.
• سعة توبة الله على من انكسر وصدق وندم على ذنبه.
• التضحية بالمال والنفس في سبيل الله عنوان الإيمان الصادق.`,
    lessonEn: `• Honesty with Allah brings ultimate salvation.
• Sincere repentance is unconditionally welcomed by Allah.
• Selfless sacrifice of wealth and effort proves true faith.`
  },

  // 10. يونس
  10: {
    surahNumber: 10,
    surahNameAr: 'يونس',
    surahNameEn: 'Yunus',
    storyTitleAr: 'سياق نجاة قوم يونس الفريدة وقصة غرق فرعون وحفظ بدنه آية',
    storyTitleEn: 'The Repentance of Jonah\'s People & Pharaoh\'s Preserved Body',
    causeAr: `سورة يونس مكية نزلت رداً على تحدي كفار مكة للوحي. تذكر القصة الاستثنائية لقوم نبي الله يونس عليه السلام الذين تداركهم الله برحمته حين آمنوا وتابوا مخلصين بعدما رأوا أمارات العذاب، فكشف الله عنهم عذاب الخزي ومتعهم إلى حين. كما وثقت غرق فرعون حين قال عند الموت آمنت بإله بني إسرائيل، فقيل له آلآن؟ وأنجى الله بدنه ليكون لمن بعده آية.`,
    causeEn: `Yunus highlights the miraculous salvation of Prophet Jonah's townspeople who repented sincerely before destruction descended. It contrasts this with Pharaoh, who accepted faith only when drowning was upon him—which was rejected, while his corpse was preserved as a historical sign.`,
    sourceAr: 'تفسير ابن كثير، جامع البيان للطبري',
    sourceEn: 'Tafsir Ibn Kathir, Tafsir al-Tabari',
    lessonAr: `• التوبة في وقت السعة مقبولة وترفع غضب الله وعقابه.
• الإيمان عند معاينة الموت الحتمي لا ينفع صاحبه.
• حفظ بدن فرعون شاهد تاريخي قائم على صدق القرآن.`,
    lessonEn: `• Sincere repentance in times of health averts calamity.
• Deathbed faith under imminent drowning is invalid.
• Pharaoh's preserved body is a timeless sign of divine power.`
  },

  // 11. هود
  11: {
    surahNumber: 11,
    surahNameAr: 'هود',
    surahNameEn: 'Hud',
    storyTitleAr: 'سياق "شيبتني هود" وقصة نوح والطوفان وموت ابنه غرقاً',
    storyTitleEn: 'The Gravity of Hud: Noah\'s Ark & The Drowning of His Son',
    causeAr: `سورة هود مكية قال فيها النبي ﷺ: "شيبتني هود وأخواتها" لشدة أمر الاستقامة فيها وعظمة مشاهد هلاك المكذبين. تسرد السورة قصة نوح عليه السلام وبناء السفينة وفوران التنور وركوب المؤمنين في موج كالجبال، ونداء نوح لابنه كنعان في معزل: {يَا بُنَيَّ ارْكَب مَّعَنَا}، وامتناع الابن ولجوئه إلى الجبل حتى غرق، وتأكيد الله أن رابطة الدين تعلو على رابطة الدم والنسب.`,
    causeEn: `Surah Hud made the Prophet's hair turn gray due to its uncompromising call to steadfastness. It recounts Noah crafting the Ark amidst ridicule, the Deluge, and Noah's emotional plea to his son who refused faith and drowned, proving that spiritual kinship supercedes blood.`,
    sourceAr: 'سنن الترمذي، صحيح مسلم، البداية والنهاية',
    sourceEn: 'Sunan at-Tirmidhi, Sahih Muslim, Al-Bidayah wan-Nihayah',
    lessonAr: `• الاستقامة على الحق جهاد مستمر يحتاج إلى يقظة وتثبيت.
• رابطة العقيدة هي الأصل الذي يحدد النجاة والخسران يوم القيامة.
• عاقبة تكذيب الرسل الهلاك مهما بلغت قوة الأمم وبنيانها.`,
    lessonEn: `• Continuous perseverance on the Straight Path requires spiritual resilience.
• The bond of faith supercedes physical lineage before Allah.
• Rejection of divine truth leads civilizations to destruction.`
  },

  // 12. يوسف
  12: {
    surahNumber: 12,
    surahNameAr: 'يوسف',
    surahNameEn: 'Yusuf',
    storyTitleAr: 'سياق نزول أحسن القصص تسليةً لقلب النبي ﷺ وسرد ملحمة يوسف الكاملة',
    storyTitleEn: 'The Best of Stories: Comforting the Prophet with Joseph\'s Odyssey',
    causeAr: `سورة يوسف مكية نزلت في عام الحزن تسلية لقلب النبي ﷺ بملحمة أحسن القصص: رؤيا يوسف لأحد عشر كوكباً، وحسد إخوته وإلقائه في الجب، وبيعه بمصر، وفتنة امرأة العزيز وعفته المطلقة {مَعَاذَ اللَّهِ}، وتفضيله السجن على المعصية، وتعبير الرؤى حتى تولى خزائن مصر، وجمع شمل أسرته بالصفح الجميل: {لَا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ ۖ يَغْفِرُ اللَّهُ لَكُمْ}.`,
    causeEn: `Revealed during the Year of Sorrow, Surah Yusuf comforted the Prophet ﷺ with the complete story of Joseph: from parental betrayal and the dark well, to enduring palace temptation, wrongful imprisonment, master of Egyptian storehouses, and final noble reconciliation and pardon.`,
    sourceAr: 'مستدرك الحاكم، تفسير ابن كثير، تاريخ الطبري',
    sourceEn: 'Mustadrak Al-Hakim, Tafsir Ibn Kathir, Tarikh al-Tabari',
    lessonAr: `• تدبير الله اللطيف يحول قيعان الآبار وسجون الظلم إلى عروش الملك والتمكين.
• العفة ومراقبة الله في الخلوات مفتاح الفرج والرفعة.
• التسامح والصفح عند القدرة من شيم الأنبياء والصديقين.`,
    lessonEn: `• Divine providence transforms deep pits and prisons into seats of power.
• Moral purity in times of secret temptation leads to eternal honor.
• Forgiveness when empowered over adversaries is the hallmark of prophets.`
  },

  // 13. الرعد
  13: {
    surahNumber: 13,
    surahNameAr: 'الرعد',
    surahNameEn: 'Ar-Ra\'d',
    storyTitleAr: 'سياق تسبيح الرعد وقصة هلاك أربد بن قيس وعامر بن الطفيل بالصاعقة',
    storyTitleEn: 'Thunder Glorifying Allah & The Thunderbolts Against Plotters',
    causeAr: `سورة الرعد تتناول عظمة قدرة الله، ونزلت في قصة عامر بن الطفيل وأربد بن قيس اللذين تآمرا على اغتيال النبي ﷺ بالمدينة، فحبس الله يد أربد عن سل سيفه ودعا النبي عليهما، فأرسل الله صاعقة أحرقت أربد وبعيره في الصحراء، ومات عامر بطاعون خبيث، مصداقاً لقوله: {وَيُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ وَيُرْسِلُ الصَّوَاعِقَ}.`,
    causeEn: `Ar-Ra'd reveals divine majesty. When Amir and Arbad came to Madinah plotting the assassination of the Prophet ﷺ, their conspiracy was thwarted by divine intervention: Arbad was struck by a lightning bolt, and Amir died of an agonizing plague.`,
    sourceAr: 'أسباب النزول للواحدي، تفسير الطبري، سيرة ابن إسحاق',
    sourceEn: 'Asbab Al-Nuzul by Al-Wahidi, Tafsir al-Tabari, Seerah Ibn Ishaq',
    lessonAr: `• رعاية الله وكفايته لرسوله ﷺ ولدينه أمام مكر الغادرين.
• مظاهر الكون الطبيعية كالمطر والرعد خاضعة مسخرة تسبح لله.
• زوال الباطل كزبد السيل وبقاء الحق الراسخ النافع للناس.`,
    lessonEn: `• Divine protection shields messengers against plots.
• Nature obeys and glorifies Allah continuously.
• Falsehood vanishes like transient foam while truth endures.`
  },

  // 14. إبراهيم
  14: {
    surahNumber: 14,
    surahNameAr: 'إبراهيم',
    surahNameEn: 'Ibrahim',
    storyTitleAr: 'سياق دعاء إبراهيم عند وادي مكة ومثل الكلمة الطيبة والكلمة الخبيثة',
    storyTitleEn: 'Abraham\'s Valley Supplication & The Parable of the Goodly Tree',
    causeAr: `سورة إبراهيم مكية خلدت دعاء إبراهيم عليه السلام حين أسكن هاجر وإسماعيل بواد غير ذي زرع عند الكعبة المشرفة: {رَّبَّنَا إِنِّي أَسْكَنتُ مِن ذُرِّيَّتِي بِوَادٍ غَيْرِ ذِي زَرْعٍ عِندَ بَيْتِكَ الْمُحَرَّمِ... فَاجْعَلْ أَفْئِدَةً مِّنَ النَّاسِ تَهْوِي إِلَيْهِمْ}. فاستجاب الله بتفجر زمزم وتوافد الحجاج من كل فج. وضربت السورة مثل الكلمة الطيبة (لا إله إلا الله) كشجرة طيبة أصلها ثابت وفرعها في السماء.`,
    causeEn: `Named after Abraham, it preserves his prayer upon leaving his family in the barren valley of Makkah. Allah answered with Zamzam and making hearts yearn for the sanctuary. It strikes the immortal parable of Tawhid as a deep-rooted, fruitful tree.`,
    sourceAr: 'صحيح البخاري، تفسير ابن كثير',
    sourceEn: 'Sahih al-Bukhari, Tafsir Ibn Kathir',
    lessonAr: `• الثقة المطلقة في توجيه الله تجلب الرزق والأمن من حيث لا يحتسب الإنسان.
• الكلمة الطيبة تثمر في القلوب عملاً صالحاً وبركة دائمة.
• شكر النعم سبب زيادتها: {لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ}.`,
    lessonEn: `• Sincere reliance upon Allah turns desolate valleys into sanctuaries of bounty.
• Good words of faith yield perpetual spiritual fruit.
• Gratitude guarantees the preservation and increase of blessings.`
  },

  // 15. الحجر
  15: {
    surahNumber: 15,
    surahNameAr: 'الحجر',
    surahNameEn: 'Al-Hijr',
    storyTitleAr: 'سياق حفظ الذكر وقصة أصحاب الحجر (ثمود) والمستهزئين بالنبي ﷺ',
    storyTitleEn: 'Divine Guarantee of the Quran & The Fate of the Mockers of Al-Hijr',
    causeAr: `سورة الحجر مكية نزلت حين تطاول كفار قريش بالاستهزاء بالنبي ﷺ، فأنزل الله الوعد الصادق بحفظ القرآن: {إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ}، وأهلك الله المستهزئين الخمسة من أكابر قريش بآفات متنوعة بكفاية الله لنبيه. كما ذكرت السورة مصير قوم ثمود (أصحاب الحجر) الذين نحتوا من الجبال بيوتاً آمنين فأخذتهم الصيحة صباحاً فما أغنى عنهم ما كانوا يكسبون.`,
    causeEn: `Al-Hijr features Allah's eternal guarantee of preserving the Quran: "Indeed, We sent down the Quran and We will be its guardian." Archangel Jibril eliminated the five chief pagan mockers in Makkah, while the surah recalls the ruins of Thamud at Al-Hijr.`,
    sourceAr: 'أسباب النزول للواحدي، تفسير الطبري، سيرة ابن هشام',
    sourceEn: 'Asbab Al-Nuzul by Al-Wahidi, Tafsir al-Tabari, Seerah Ibn Hisham',
    lessonAr: `• القرآن محفوظ بحفظ الله الذاتي من التحريف والتبديل على مر العصور.
• كفاية الله للمصلحين وانتقامه من المستهزئين بالدين.
• التحصينات الصخرية والقوة المادية لا ترد بأس الله إذا حل العذاب.`,
    lessonEn: `• The Quran remains uniquely preserved against all alteration.
• Allah protects righteous callers against arrogant ridicule.
• Mountain fortresses cannot protect unjust societies against divine judgment.`
  },

  // 16. النحل
  16: {
    surahNumber: 16,
    surahNameAr: 'النحل',
    surahNameEn: 'An-Nahl',
    storyTitleAr: 'سياق سورة النعم وقصة إكراه عمار بن ياسر على النطق بكلمة الكفر',
    storyTitleEn: 'The Surah of Blessings & The Coercion of Ammar ibn Yasir',
    causeAr: `سورة النحل (سورة النعم) مكية تبين آلاء الله. ومن أشهر أسباب نزولها قصة عمار بن ياسر رضي الله عنه بعدما استُشهد والداه تحت التعذيب، فأُكره على قول كلمة الكفر بلسانه ليتخلص من الموت، فجاء باكياً للنبي ﷺ فقال له: "كيف تجد قلبك؟" قال: "مطمئناً بالإيمان"، فأنزل الله رخصة الإكراه: {إِلَّا مَنْ أُكْرِهَ وَقَلْبُهُ مُطْمَئِنٌّ بِالْإِيمَانِ}.`,
    causeEn: `Known as the Surah of Blessings, An-Nahl addresses religious coercion. When Ammar ibn Yasir was tortured after his parents' martyrdom and forced to utter praise for pagan deities, the Prophet ﷺ confirmed that true faith resides in the heart, confirmed by revelation.`,
    sourceAr: 'مستدرك الحاكم، السنن الكبرى للبيهقي، أسباب النزول للواحدي',
    sourceEn: 'Mustadrak Al-Hakim, Sunan al-Bayhaqi, Asbab Al-Nuzul by Al-Wahidi',
    lessonAr: `• رخصة الشريعة وسماحتها عند الإكراه وحفظ النفس من القتل.
• الإيمان مقرّه القلب وعقيدة النفس وليس اللسان المُكره.
• شكر النعم الكونية العظيمة في الأنعام والنحل والظلال.`,
    lessonEn: `• Jurisprudential concessions protect life under lethal coercion.
• True faith is the inner conviction of the heart.
• Mindful gratitude for the diverse natural wonders given to humanity.`
  },

  // 17. الإسراء
  17: {
    surahNumber: 17,
    surahNameAr: 'الإسراء',
    surahNameEn: 'Al-Isra',
    storyTitleAr: 'سياق معجزة الإسراء والمعراج الشريفة وبر الوالدين وسؤال الروح',
    storyTitleEn: 'The Miraculous Night Journey, Honoring Parents & The Question of the Soul',
    causeAr: `سورة الإسراء مكية تخلد معجزة الإسراء بروح النبي وجسده من المسجد الحرام إلى المسجد الأقصى ثم المعراج إلى السماوات العلى وفرض الصلاة. وكذبت قريش الخبر حتى وصف لهم بيت المقدس بدقة، وصدقه أبو بكر فسُمي الصديق. كما اشتملت على إجابة سؤال قريش واليهود عن كنه الروح: {قُلِ الرُّوحُ مِنْ أَمْرِ رَبِّي}، وأعظم وصايا بر الوالدين وحفظ حقوق المجتمع.`,
    causeEn: `Al-Isra chronicles the Night Journey to Jerusalem and the Ascension to the heavens to receive the gift of prayer. Abu Bakr was titled As-Siddiq for his unshakeable faith in the event. It clarifies the enigma of the human Soul and establishes supreme filial duties.`,
    sourceAr: 'صحيح البخاري، صحيح مسلم، سيرة ابن هشام',
    sourceEn: 'Sahih al-Bukhari, Sahih Muslim, Seerah Ibn Hisham',
    lessonAr: `• المنزلة الإيمانية والقدسية للمسجد الأقصى ورابطته بالمسجد الحرام.
• الصلاة صلة مباشرة ومعراج روحي يومي بين العبد وخالقه.
• البر بالوالدين قرين التوحيد في ميزان الشريعة الإسلامية.`,
    lessonEn: `• The sacred status of Al-Aqsa Mosque in Islamic heritage.
• Daily prayer connects human hearts directly with heaven.
• Honoring parents is directly linked with the worship of Allah.`
  },

  // 18. الكهف
  18: {
    surahNumber: 18,
    surahNameAr: 'الكهف',
    surahNameEn: 'Al-Kahf',
    storyTitleAr: 'موسوعة سورة الكهف الشاملة: أسئلة أحبار يهود، فتية الكهف، الجنتين، موسى والخضر، وذو القرنين',
    storyTitleEn: 'The Comprehensive Epic of Al-Kahf: The Cave, The Gardens, Musa & Khidr, Dhul-Qarnayn',
    causeAr: `سورة الكهف مكية نزلت إجابة عن أسئلة أحبار يهود يثرب لقريش:
1. قصة أصحاب الكهف (آيات 9-26): فتية مؤمنون فروا بدينهم من الملك الكافر دقيانوس، فأنامهم الله في الكهف 309 سنوات هجرية تقلبهم الملائكة والشمس تميل عنهم، واستيقظوا فبعثوا أحدهم بورقهم إلى المدينة، فكانت آية قاطعة في إثبات البعث والنشور بالأجساد والأرواح.
2. قصة صاحب الجنتين (آيات 32-44): كافر رزقه الله بستانين عظيمين فتكبر على صاحبه الفقير وقال ما أظن أن تبيد هذه أبداً، فأرسل الله عليها عذاباً دمرها وأصبح يقلب كفيه ندماً.
3. قصة موسى والخضر (آيات 60-82): ارتحال موسى وفتاه يوشع لمجمع البحرين للقاء العبد الصالح الخضر والتعلم منه؛ فخرق السفينة لإنقاذها من الملك الغاصب، وقتل الغلام ليحمي أبويه المؤمنين من طغيانه، وبنى الجدار في القرية البخيلة ليحفظ كنز اليتيمين بصلاح أبيهما.
4. قصة ذي القرنين (آيات 83-98): ملك عادل طاف المشرق والمغرب بالعدل، وبنى بين السدين ردماً من زبر الحديد والنحاس المذاب لحماية المستضعفين من فساد يأجوج ومأجوج.`,
    causeEn: `Surah Al-Kahf provides immunity against Dajjal through four grand stories: The People of the Cave (Faith preserved over 309 years of sleep), The Two Gardens (Wealth tested by sudden ruin), Moses and Khidr (Humility in learning unseen divine wisdom), and Dhul-Qarnayn (Power harnessed with iron and copper to shield humanity from Gog and Magog).`,
    sourceAr: 'صحيح البخاري، صحيح مسلم، سيرة ابن هشام، تفسير ابن كثير',
    sourceEn: 'Sahih al-Bukhari, Sahih Muslim, Seerah Ibn Hisham, Tafsir Ibn Kathir',
    lessonAr: `• الحماية من الفتن الكبرى: فتنة الدين، فتنة المال، فتنة العلم، وفتنة السلطة والقوة.
• التسليم لحكمة القدر واليقين بأن ما يكرهه الإنسان قد يخبئ أعظم النعم والرحمات.
• التواضع في العلم واستحضار مشيئة الله بقول: "إن شاء الله".`,
    lessonEn: `• Fortification against trials of faith, wealth, knowledge, and leadership.
• Divine decree conceals immense mercy within apparent hardships.
• Humility before knowledge and regular invocation of In sha Allah.`
  },

  // 19. مريم
  19: {
    surahNumber: 19,
    surahNameAr: 'مريم',
    surahNameEn: 'Maryam',
    storyTitleAr: 'سياق هجرة الحبشة وتلاوة السورة أمام النجاشي وقصص زكريا ويحيى ومريم وعيسى',
    storyTitleEn: 'The Abyssinian Court Recitation & The Miracles of Zakariya and Maryam',
    causeAr: `سورة مريم مكية تلاها جعفر بن أبي طالب في بلاط النجاشي ملك الحبشة فبكى وبكى أساقفته ورفض تسليم المسلمين لقريش. وتفصل معجزة ولادة يحيى للشيخ الفاني زكريا استجابة لدعائه الخفي، ومعجزة ولادة مريم البتول لعيسى عليه السلام بكلمة من الله تحت جذع النخلة، ونطق عيسى في المهد صبياً شاهداً على براءة أمه ونبوته وتوحيده لله.`,
    causeEn: `Surah Maryam brought the Negus of Abyssinia and his court to tears when recited by Ja'far ibn Abi Talib. It details Zakariya's supplication rewarded with Yahya, Maryam's miraculous conception under the palm tree, and the newborn Jesus speaking from the cradle in servitude to Allah.`,
    sourceAr: 'مسند أحمد، سيرة ابن هشام، صحيح مسلم',
    sourceEn: 'Musnad Ahmad, Seerah Ibn Hisham, Sahih Muslim',
    lessonAr: `• طلاقة القدرة الإلهية واستجابة الدعاء الخالص في أحلك الظروف.
• طهارة وبراءة الصديقة مريم وتنزيه الله عن الصاحبة والولد.
• نصرة المظلومين والفرار بالدين من بطش الطغاة.`,
    lessonEn: `• Limitless divine capability answering sincere supplications.
• Exaltation of Maryam and rejection of divine offspring.
• Safe haven granted to those who flee oppression for faith.`
  },

  // 20. طه
  20: {
    surahNumber: 20,
    surahNameAr: 'طه',
    surahNameEn: 'Ta-Ha',
    storyTitleAr: 'سياق إسلام عمر بن الخطاب وقصة موسى في الوادي المقدس ومواجهة فرعون والسحرة',
    storyTitleEn: 'The Conversion of Umar ibn Al-Khattab & Moses at the Burning Bush',
    causeAr: `سورة طه مكية كانت سبباً في إسلام الفاروق عمر بن الخطاب رضي الله عنه بعدما قرأ صحيفتها في دار أخته فاطمة فانشرح صدره للإسلام. وتفصل مسيرة موسى عليه السلام حين نودي في الوادي المقدس طوى وخلع نعليه، وآتاه الله معجزتي العصا واليد، ومواجهته لفرعون وسحرته وسجود السحرة لله واستهانتهم بوعيد فرعون.`,
    causeEn: `Surah Ta-Ha inspired the conversion of Umar ibn al-Khattab when he read its sacred parchment. It documents Moses at the sacred valley of Tuwa receiving the staff and radiant hand, culminating in the public defeat of Pharaoh's magicians who prostrated in faith.`,
    sourceAr: 'سيرة ابن هشام، مستدرك الحاكم، تاريخ الطبري',
    sourceEn: 'Seerah Ibn Hisham, Mustadrak Al-Hakim, Tarikh al-Tabari',
    lessonAr: `• سلطة القرآن المعجزة في إلانة أشد القلوب وتحويل مسار التاريخ.
• الخطاب اللين في الدعوة أجدى في التأثير حتى مع أعتى الطغاة.
• قوة العقيدة الحقيقية تستعلي على التهديد الدنيوي والبطش.`,
    lessonEn: `• The miraculous power of the Quran transforming hostile hearts.
• Gentle admonition serves as the cornerstone of prophetic guidance.
• Sincere faith fearlessly transcends worldly threats and intimidation.`
  },

  // 21. الأنبياء
  21: {
    surahNumber: 21,
    surahNameAr: 'الأنبياء',
    surahNameEn: 'Al-Anbiya',
    storyTitleAr: 'سياق قصص الأنبياء وإبراهيم في النار وتسبيح يونس في الحوت وصبر أيوب',
    storyTitleEn: 'The Assembly of Prophets: Abraham\'s Fire, Jonah\'s Fish & Job\'s Patience',
    causeAr: `سورة الأنبياء مكية جامعة لقصص ستة عشر نبياً، ونزلت تثبيتاً للقلوب ببيان سنن النجاة والابتلاء:
1. إبراهيم عليه السلام: تحطيمه لأصنام قومه بالفأس وترك كبيرهم ليحاجهم، فلما ألقوه في النار المشتعلة قال الله: {يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ} فكانت معجزة نصر التوحيد.
2. أيوب عليه السلام: صبره العظيم على فقد أهله وماله ومرضه الطويل حتى دعا: {أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ}، فاستجاب الله وأمره أن يركض برجله فنبع ماء بارد اغتسل منه فبرئ.
3. ذو النون (يونس) عليه السلام: لما التقمه الحوت نادى في الظلمات الثلاث: {لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ} فنجاه الله من الغم.
4. زكريا ويحيى، وداود وسليمان في فهم حكم الحرث.`,
    causeEn: `Al-Anbiya compiles narratives of sixteen prophets. It portrays Abraham surviving the furnace when fire was ordered to be cool and peaceful, Job's patient prayer during devastating sickness, and Jonah crying out from the belly of the whale in triple darkness: "There is no deity except You; exalted are You; indeed, I was of the wrongdoers," bringing instant deliverance.`,
    sourceAr: 'صحيح البخاري، سنن الترمذي، تفسير ابن كثير',
    sourceEn: 'Sahih al-Bukhari, Sunan at-Tirmidhi, Tafsir Ibn Kathir',
    lessonAr: `• دعاء يونس عليه السلام (دعوة ذي النون) ما دعا بها مكروب إلا فرج الله كربه.
• الصبر على البلاء والاستغاثة بالله تثمر العافية والمثوبة كأيوب.
• نواميس الكون وقوانين الطبيعة مسخرة طائعة لأمر الله الحاكم.`,
    lessonEn: `• The supplication of Jonah is a guaranteed shield against distress.
• Exemplary patience during chronic trials yields ultimate restoration.
• Natural physics remain entirely subservient to the command of Allah.`
  },

  // 22. الحج
  22: {
    surahNumber: 22,
    surahNameAr: 'الحج',
    surahNameEn: 'Al-Hajj',
    storyTitleAr: 'سياق أذان إبراهيم بالحج وتحدي مثل الذباب والإذن بالقتال دفعاً للظلم',
    storyTitleEn: 'Abraham Proclaiming Pilgrimage, Parable of the Fly & Permission for Defense',
    causeAr: `سورة الحج تميزت بأن فيها آيات مكية وأخرى مدنية. وتخلد نداء إبراهيم الخليل عليه السلام حين فرغ من بناء الكعبة وقيل له: أذّن في الناس بالحج، فقال: رب وكيف يبلغ صوتي؟ فقال الله: أذّن وعلينا البلاغ، فأذن إبراهيم فسمعه من في أصلاب الرجال وأرحام النساء وأجابوا: لبيك اللهم لبيك. وفيها نزل الإذن التاريخي بالقتال دفاعاً عن المستضعفين والمساجد: {أُذِنَ لِلَّذِينَ يُقَاتَلُونَ بِأَنَّهُمْ ظُلِمُوا}. وتحدت السورة آلهة المشركين بمثل الذباب العاجز: {لَن يَخْلُقُوا ذُبَابًا وَلَوِ اجْتَمَعُوا لَهُ}.`,
    causeEn: `Al-Hajj records Abraham proclaiming Hajj to all humanity from Makkah, granting permission for righteous defense to protect places of worship, and issuing the divine challenge that all false gods combined cannot even create a single fly.`,
    sourceAr: 'سنن الترمذي، تفسير الطبري، مسند أحمد',
    sourceEn: 'Sunan at-Tirmidhi, Tafsir al-Tabari, Musnad Ahmad',
    lessonAr: `• الحج مؤتمر الأمة الإيماني لتجريد التوحيد واستشعار أهوال القيامة.
• الإذن بالقتال شرع لحماية حرية العقيدة ودفع الظلم عن المستضعفين وحفظ المساجد والصوامع.
• كمال عجز الآلهة والأنداد الباطلة أمام أدق خلق الله كالذباب.`,
    lessonEn: `• Hajj symbolizes universal human equality and pure monotheism.
• Defensive deterrence is ordained to protect sanctuaries and freedom of faith.
• Total helplessness of idols to create even the smallest insect.`
  },

  // 23. المؤمنون
  23: {
    surahNumber: 23,
    surahNameAr: 'المؤمنون',
    surahNameEn: 'Al-Mu\'minun',
    storyTitleAr: 'سياق صفات المفلحين وخلق الإنسان وأطوار الجنين وسفينة نوح',
    storyTitleEn: 'Attributes of Believers, Embryonic Stages & The Ship of Noah',
    causeAr: `سورة المؤمنون مكية، روى عمر بن الخطاب رضي الله عنه أن النبي ﷺ كان إذا نزل عليه الوحي يُسمع عند وجهه كدويّ النحل، فاستقبل القبلة ودعا ثم قال: "لقد أُنزلت عليّ عشر آيات من أقامهن دخل الجنة"، وقرأ: {قَدْ أَفْلَحَ الْمُؤْمِنُونَ} حتى ختم العشر صفات (الخشوع في الصلاة، الإعراض عن اللغو، أداء الزكاة، حفظ الفروج، رعاية الأمانة والعهد، والمحافظة على الصلاة). وتفصل السورة مراحل خلق الإنسان وأطوار الجنين الإعجازية في الرحم، وقصة نوح وصنعه للفلك بأعين الله ووحيه.`,
    causeEn: `Revealed in Makkah, the opening ten verses guarantee Paradise to believers who embody six spiritual traits: humility in prayer, shunning vanity, charity, chastity, trustworthiness, and punctuality in worship. It details human embryonic creation and Noah's Ark guided by divine surveillance.`,
    sourceAr: 'مسند أحمد، سنن الترمذي، صحيح مسلم، تفسير ابن كثير',
    sourceEn: 'Musnad Ahmad, Sunan at-Tirmidhi, Sahih Muslim',
    lessonAr: `• الخشوع في الصلاة هو سر الفلاح وسكينة القلوب.
• أمانة العهود والأخلاق الفاضلة ميزان النجاة في الدنيا والآخرة.
• الإعجاز العلمي في أطوار خلق الجنين شاهد ساطع على حكمة الخالق.`,
    lessonEn: `• Humility in prayer is the true essence of spiritual prosperity.
• Honoring trusts and covenants defines moral excellence.
• Miraculous embryological development attests to the Creator's design.`
  },

  // 24. النور
  24: {
    surahNumber: 24,
    surahNameAr: 'النور',
    surahNameEn: 'An-Nur',
    storyTitleAr: 'سياق حادثة الإفك المفصلة وبراءة أم المؤمنين عائشة ومثل نور الله',
    storyTitleEn: 'The Vindication of Aisha in the Incident of Ifk & The Verse of Light',
    causeAr: `سورة النور مدنية اشتملت على تشريعات حماية الأعراض والبيوت. وتمحورت حول "حادثة الإفك" في غزوة بني المصطلق حين انقطع عقد أم المؤمنين عائشة وتخلفت للبحث عنه، فحملها صفوان بن المعطل السلمي على بعيره، فأشاع المنافقون بقيادة عبد الله بن أبي بن سلول فرية الزور والبهتان. فمرضت عائشة شهراً لا تعلم بالحديث حتى علمت فبكت حتى ظنت أن البكاء فالق كبدها، وأمسك النبي ﷺ عن الحديث حتى نزل القرآن في سورة النور مبرئاً لها من فوق سبع سماوات في عشر آيات تُتلى إلى يوم القيامة، وتوعد الخائضين في الأعراض بالعذاب الأليم. وتشرق في السورة آية النور العظيمة: {اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ}.`,
    causeEn: `An-Nur highlights the Incident of Ifk when Aisha (RA) was slanderously accused by hypocrites led by Ibn Ubayy. Heartbroken and ill, her vindication descended from above the seven heavens across ten immortal verses, establishing severe punishment for defamation. It features the glorious Verse of Light depicting faith illuminating the believer's chest.`,
    sourceAr: 'صحيح البخاري، صحيح مسلم (حديث الإفك الطويل)، تفسير ابن كثير',
    sourceEn: 'Sahih al-Bukhari, Sahih Muslim (Detailed Hadith of Ifk), Tafsir Ibn Kathir',
    lessonAr: `• حرمة الخوض في أعراض الأبرياء وخطورة تداول الشائعات وتصديقها.
• طهارة وعلو قدر أمهات المؤمنين وأهل بيت النبي ﷺ.
• آداب الاستئذان وغض البصر وستر العورات لتحصين المجتمع من الفواحش.`,
    lessonEn: `• Absolute prohibition against slandering reputations and circulating rumors.
• Exalted purity of the Prophet's household and Aisha's virtue.
• Social etiquette regarding privacy, lowering the gaze, and modest dress.`
  },

  // 25. الفرقان
  25: {
    surahNumber: 25,
    surahNameAr: 'الفرقان',
    surahNameEn: 'Al-Furqan',
    storyTitleAr: 'سياق الرد على شبهات المشركين ونزول القرآن منجماً وصفات عباد الرحمن',
    storyTitleEn: 'Refuting Skeptics, Gradual Revelation & The Servants of the Merciful',
    causeAr: `سورة الفرقان مكية تفصل الشبهات التي أثارها مشركو قريش؛ كقولهم: ما لهذا الرسول يأكل الطعام ويمشي في الأسواق؟ ولولا نزل عليه القرآن جملة واحدة كالتوراة؟ فأجابهم الله بأن الرسل كلهم بشر، وأن القرآن نزل منجماً مفرقاً لتثبيت قلب النبي ﷺ: {كَذَٰلِكَ لِنُثَبِّتَ بِهِ فُؤَادَكَ ۖ وَرَتَّلْنَاهُ تَرْتِيلًا}. وتختم السورة بأروع تصوير لأخلاق "عباد الرحمن" الذين يمشون على الأرض هوناً وإذا خاطبهم الجاهلون قالوا سلاماً، ويبيتون لربهم سجداً وقياماً، ويقولون ربنا هب لنا من أزواجنا وذرياتنا قرة أعين واجعلنا للمتقين إماماً.`,
    causeEn: `Al-Furqan counters pagan objections regarding why the Prophet ﷺ ate and walked in markets and why the Quran was revealed gradually rather than all at once. Allah clarified that gradual revelation fortifies the heart against daily trials. It concludes with the sublime characteristics of the Servants of the Most Merciful.`,
    sourceAr: 'أسباب النزول للواحدي، تفسير الطبري، صحيح البخاري',
    sourceEn: 'Asbab Al-Nuzul by Al-Wahidi, Tafsir al-Tabari, Sahih al-Bukhari',
    lessonAr: `• الحكمة في نزول القرآن منجماً لمعالجة الوقائع وتثبيت النفوس.
• بشرية الرسل ضرورة للاقتداء العملي وحجة على العباد.
• التحلي بصفات عباد الرحمن في التواضع والإنفاق المتزن والمناجاة الليلية.`,
    lessonEn: `• Divine wisdom of gradual revelation continuously comforting the believer.
• The human nature of prophets makes them practical moral role models.
• Adopting the serene humility and noble character of the Servants of the Merciful.`
  },

  // 26. الشعراء
  26: {
    surahNumber: 26,
    surahNameAr: 'الشعراء',
    surahNameEn: 'Ash-Shu\'ara',
    storyTitleAr: 'سياق تسلية النبي ﷺ وقصص الرسل السبعة واستثناء الشعراء المؤمنين',
    storyTitleEn: 'Comforting the Prophet, Seven Prophetic Epics & Sincere Poets',
    causeAr: `سورة الشعراء مكية افتُتحت بتسلية النبي ﷺ لشدة حزنه على كفر قومه: {لَعَلَّكَ بَاخِعٌ نَّفْسَكَ أَلَّا يَكُونُوا مُؤْمِنِينَ}. وتسرد ملاحم سبعة من الأنبياء (موسى، إبراهيم، نوح، هود، صالح، لوط، وشعيب) وموقف أقوامهم المكذبين والآية الخاتمة لكل قصة: {إِنَّ فِي ذَٰلِكَ لَآيَةً ۖ وَمَا كَانَ أَكْثَرُهُم مُّؤْمِنِينَ * وَإِنَّ رَبَّكَ لَهُوَ الْعَزِيزُ الرَّحِيمُ}. وختمت بالرد على من زعم أن القرآن شعر؛ فبينت تيه الشعراء الغاوين، واستثنت الشعراء المؤمنين الذين سخروا شعرهم لنصرة الحق كحسان بن ثابت وكعب بن مالك وعبد الله بن رواحة.`,
    causeEn: `Revealed to soothe the Prophet's grief over pagan obstinacy, Ash-Shu'ara details the sagas of seven prophets and concludes by distinguishing chaotic pagan poetry from principled Muslim poets like Hassan ibn Thabit and Ka'b ibn Malik who utilized their art for truth.`,
    sourceAr: 'صحيح مسلم، أسباب النزول للواحدي، تفسير ابن كثير',
    sourceEn: 'Sahih Muslim, Asbab Al-Nuzul by Al-Wahidi, Tafsir Ibn Kathir',
    lessonAr: `• الداعية المخلص يبذل جهده ولا يهلك نفسه حسرة على من أبى الإيمان.
• سنن النصر والهلاك تتكرر عبر العصور بنفس القوانين الإلهية.
• تسخير الأدب والشعر والإعلام في نصرة الحق والدفاع عن العقيدة.`,
    lessonEn: `• The spiritual caller delivers guidance without despairing over rejection.
• Universal moral laws govern the triumph of truth and ruin of tyranny.
• Harnessing poetry, art, and media in defense of righteous values.`
  },

  // 27. النمل
  27: {
    surahNumber: 27,
    surahNameAr: 'النمل',
    surahNameEn: 'An-Naml',
    storyTitleAr: 'سياق ملك سليمان العظيم ونبأ الهدهد وإسلام بلقيس ملكة سبأ',
    storyTitleEn: 'Solomon\'s Kingdom, The Hoopoe\'s News & The Submission of Queen Sheba',
    causeAr: `سورة النمل مكية تستعرض النعم والملك الخارق الذي آتاه الله لداود وسليمان عليهما السلام. وتبرز قصة سليمان مع وادي النمل حين سمع نملة تحذر قومها: {ادْخُلُوا مَسَاكِنَكُمْ لَا يَحْطِمَنَّكُمْ سُلَيْمَانُ وَجُنُودُهُ وَهُمْ لَا يَشْعُرُونَ} فتبسم ضاحكاً وشكر ربه. ثم قصة غياب الهدهد وقدومه بنبأ سبأ وقومهم الذين يسجدون للشمس، فكتب سليمان كتابه الكريم: {إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ}. وأحضر الذي عنده علم من الكتاب عرش بلقيس في طرفة عين، ولما رأت الصرح المُمَرَّد حسبته لجة وكشفت عن ساقيها فأدركت عظمة ملك سليمان وأسلمت لله رب العالمين.`,
    causeEn: `An-Naml celebrates the miraculous kingdom of Solomon who understood animals and jinn. It documents the ant warning its colony, the Hoopoe reporting Sheba's sun-worship, Solomon's letter, moving Bilqis's throne within the blink of an eye, and her ultimate submission to the Lord of the worlds.`,
    sourceAr: 'صحيح البخاري، تفسير الطبري، البداية والنهاية',
    sourceEn: 'Sahih al-Bukhari, Tafsir al-Tabari, Al-Bidayah wan-Nihayah',
    lessonAr: `• التواضع والشكر لله عند علو السلطة وامتلاك القوة والإمكانات.
• دقة الحيوان وشعوره، وحسن الظن بسليمان وجنوده {وهم لا يشعرون}.
• الحكمة السياسية في الدعوة إلى الله والنزول على سلطان الحق.`,
    lessonEn: `• Absolute humility and gratitude when gifted with vast authority and talent.
• Compassion toward nature and creatures.
• Diplomatic wisdom in inviting nations to monotheism.`
  },

  // 28. القصص
  28: {
    surahNumber: 28,
    surahNameAr: 'القصص',
    surahNameEn: 'Al-Qasas',
    storyTitleAr: 'سياق قصة موسى من المهد إلى النبوة وقصة كنز قارون والخسف',
    storyTitleEn: 'The Epic of Moses: From the Nile Cradle to Prophethood & Korah\'s Fall',
    causeAr: `سورة القصص مكية نزلت في مرحلة استضعاف المسلمين في مكة لتبشرهم بأن العاقبة للمستضعفين المؤمنين كما حدث مع موسى وبني إسرائيل في مواجهة فرعون وهامان.
وتسرد حياة موسى منذ ولادته في عام ذبح الأبناء، وإلقاء أمه له في التابوت في نهر النيل ثقة بوعد الله، والتقاط آل فرعون له ليربى في قصر عدوه، ورفضه للمراضع حتى رُد إلى أمه كي تقر عينها، ثم قتله القبطي خطأ وفراره خائفاً إلى مدين وسقيا الفتاتين وزواجه عشر سنين، حتى نودي بالنبوة في جبل الطور.
كما تفصل قصة قارون الذي كان من قوم موسى فبغى عليهم بكنوزه التي تنوء مفاتيحها بالعصبة أولي القوة، وتكبر على نصيحة العقلاء {لَا تَفْرَحْ ۖ إِنَّ اللَّهَ لَا يُحِبُّ الْفَرِحِينَ}، فخسف الله به وبداره الأرض فما كان له من فئة ينصرونه.`,
    causeEn: `Al-Qasas comforted the persecuted early Muslims by detailing Moses's life: placed as an infant in the Nile to be raised in Pharaoh's palace, fleeing to Midian, and receiving prophethood. It contrasts this with the ruin of Korah (Qarun) whose staggering gold treasures could not prevent him and his palace from being swallowed into the earth.`,
    sourceAr: 'صحيح البخاري، تفسير ابن كثير، سيرة ابن هشام',
    sourceEn: 'Sahih al-Bukhari, Tafsir Ibn Kathir, Seerah Ibn Hisham',
    lessonAr: `• تدبير الله ولطفه فوق كل تدابير الطغاة؛ فالطفل الرضيع قهر إمبراطورية فرعون.
• حفظ الله لمن توكل عليه وأخلص قلبه كوعده لأم موسى: {إِنَّا رَادُّوهُ إِلَيْكِ}.
• الكبر والغرور بالثروة والمال سبب الخسف والهلاك العاجل والآجل.`,
    lessonEn: `• Divine providence effortlessly overrules tyrannical plots.
• Absolute fulfillment of divine promises to trustful mothers.
• Arrogant pride in worldly wealth invites immediate divine retribution.`
  }
};
