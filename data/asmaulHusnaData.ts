export interface AsmaulHusnaItem {
  id: number;
  name: string;
  transliteration: string;
  meaning: string;
  meaningEn: string;
  evidence: string;
  evidenceEn: string;
}

export const asmaulHusna: AsmaulHusnaItem[] = [
  {
    id: 1,
    name: "الله",
    transliteration: "Allah",
    meaning: "لفظ الجلالة وأعظم الأسماء، وهو الاسم الذي تفرد به الخالق سبحانه وتعالى، والجامع لكل معاني الألوهية وصفات الكمال، والمستحق للعبادة وحده لا شريك له، وإليه تنسب سائر الأسماء.",
    meaningEn: "The Majestic Name and the greatest of all names. It is the proper name for the Creator, encompassing all attributes of divinity and perfection, worthy of worship alone without partner.",
    evidence: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ (البقرة: 255)",
    evidenceEn: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. (Al-Baqarah: 255)"
  },
  {
    id: 2,
    name: "الرَّحْمَنُ",
    transliteration: "Ar-Rahman",
    meaning: "الذي وسعت رحمته كل شيء في الوجود، وهي صفة ذاتية ثابتة لله عز وجل، تدل على سعة رحمته بجميع خلقه (المؤمن والكافر) في أمور معاشهم بالدنيا.",
    meaningEn: "The All-Compassionate. The One whose mercy encompasses all things in existence, showering His blessings upon all creation in this worldly life.",
    evidence: "الرَّحْمَنُ عَلَى الْعَرْشِ اسْتَوَى (طه: 5)",
    evidenceEn: "The Most Merciful [who is] above the Throne established. (Ta-Ha: 5)"
  },
  {
    id: 3,
    name: "الرَّحِيمُ",
    transliteration: "Ar-Rahim",
    meaning: "الذي يوصل رحمته إلى من يشاء من عباده، وهي رحمة تختص بالمؤمنين هدايةً في الدنيا وإكراماً بالجنة في الآخرة، وهي تدل على الرحمة كفعل منه سبحانه.",
    meaningEn: "The All-Merciful. The One who specifically bestows His special mercy upon the believers, guiding them in this world and rewarding them with Paradise in the Hereafter.",
    evidence: "وَكَانَ بِالْمُؤْمِنِينَ رَحِيمًا (الأحزاب: 43)",
    evidenceEn: "And ever is He, to the believers, Merciful. (Al-Ahzab: 43)"
  },
  {
    id: 4,
    name: "الْمَلِكُ",
    transliteration: "Al-Malik",
    meaning: "صاحب السلطان المطلق والملك الحق، المتصرف في الأكوان كما يشاء، الذي لا يزول ملكه ولا يحتاج لغيره، والكل عبيد له تحت قهره وتدبيره.",
    meaningEn: "The Absolute Ruler, the King. The Sovereign Lord who possesses absolute dominion over all worlds, needing nothing while everything depends on Him.",
    evidence: "فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ (طه: 114)",
    evidenceEn: "So high [above all] is Allah, the Sovereign, the Truth. (Ta-Ha: 114)"
  },
  {
    id: 5,
    name: "الْقُدُّوسُ",
    transliteration: "Al-Quddus",
    meaning: "المطهر والمنزه عن كل نقص أو عيب لا يليق بجلاله، والمقدس الذي تعظمه الملائكة، وهو الطاهر المنزه عن الصاحبة والولد وعن كل ما يتخيله الوهم.",
    meaningEn: "The Pure, the Holy. The One who is free from all imperfections, flaws, and any resemblance to His creation, glorified by the angels.",
    evidence: "الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ (الحشر: 23)",
    evidenceEn: "The Sovereign, the Pure, the Perfection, the Granter of Security... (Al-Hashr: 23)"
  },
  {
    id: 6,
    name: "السَّلَامُ",
    transliteration: "As-Salam",
    meaning: "السالم من كل نقص أو فناء، والناشر للسلام بين خلقه، الذي يسلم عباده من ظلمه، ويدعو أولياءه إلى دار السلام ويحييهم فيها بالسلام.",
    meaningEn: "The Source of Peace. The One who is free from all defects, who grants safety and peace to His creation, welcoming His righteous servants to the Abode of Peace.",
    evidence: "الْمَلِكُ الْقُدُّوسُ السَّلَامُ (الحشر: 23)",
    evidenceEn: "The Sovereign, the Pure, the Perfection, the Source of Peace... (Al-Hashr: 23)"
  },
  {
    id: 7,
    name: "الْمُؤْمِنُ",
    transliteration: "Al-Mu'min",
    meaning: "المصدق لرسله فيما جاؤوا به بإظهار المعجزات، والذي وفى بعهده لعباده، والذي أمن خلقه من أن يظلمهم، واطمأنت القلوب بذكره والتوكل عليه.",
    meaningEn: "The Granter of Security, the Guardian of Faith. The One who grants safety and security, confirming His messengers and fulfilling His promises to His servants.",
    evidence: "الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ (الحشر: 23)",
    evidenceEn: "The Granter of Security, the Overseer, the Almighty... (Al-Hashr: 23)"
  },
  {
    id: 8,
    name: "الْمُهَيْمِنُ",
    transliteration: "Al-Muhaymin",
    meaning: "الرقيب الحافظ لكل شيء، القائم على خلقه بأعمالهم وأحزاتهم وأرزاقهم، والمطلع على ما تهجسه النفوس، والمحيط بكل شيء حفظاً وعلماً.",
    meaningEn: "The Protector, the Overseer. The One who witnesses all things, watching over His creation with absolute awareness, preservation, and care.",
    evidence: "الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ (الحشر: 23)",
    evidenceEn: "The Overseer, the Almighty, the Compeller... (Al-Hashr: 23)"
  },
  {
    id: 9,
    name: "الْعَزِيزُ",
    transliteration: "Al-Aziz",
    meaning: "القوي المنيع الغالب الذي لا يُغلب، الذي يمتنع عن العجز والذلة، وكل عزة في الوجود فهي مستمدة من عزته وقوته القاهرة.",
    meaningEn: "The Almighty, the Invincible. The One to whom absolute might and power belong, who cannot be defeated and before whom all creation humbles itself.",
    evidence: "وَهُوَ الْعَزِيزُ الْحَكِيمُ (إبراهيم: 4)",
    evidenceEn: "And He is the Almighty, the Wise. (Ibrahim: 4)"
  },
  {
    id: 10,
    name: "الْجَبَّارُ",
    transliteration: "Al-Jabbar",
    meaning: "العالي على خلقه القاهر لكل شيء، الذي يصلح أمور خلقه ويجبر الكسير ويغني الفقير، ولا يخرج أحد عن سلطانه وقدرته.",
    meaningEn: "The Compeller, the Restorer. The One who mends every broken heart, assists the weak, and enforces His will over all creation with supreme majesty.",
    evidence: "الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ (الحشر: 23)",
    evidenceEn: "The Almighty, the Compeller, the Supreme. (Al-Hashr: 23)"
  },
  {
    id: 11,
    name: "الْمُتَكَبِّرُ",
    transliteration: "Al-Mutakabbir",
    meaning: "المنزه عن صفات الذل والعجز، المتعالي بعظمته وكبريائه عن كل ظلم أو نقص، صاحب الكبرياء والعظمة في ذاته وصفاته.",
    meaningEn: "The Supreme, the Majestic. The One who is far above all creation in His attributes of greatness, majesty, and perfection.",
    evidence: "الْجَبَّارُ الْمُتَكَبِّرُ سُبْحَانَ اللَّهِ (الحشر: 23)",
    evidenceEn: "The Compeller, the Supreme. Exalted is Allah above whatever they associate with Him. (Al-Hashr: 23)"
  },
  {
    id: 12,
    name: "الْخَالِقُ",
    transliteration: "Al-Khaliq",
    meaning: "المقدر للأشياء والمجدد لها على غير مثال سابق، الذي أوجب الوجود لكل مخلوق بحكمة وتقدير دقيق.",
    meaningEn: "The Creator, the Maker. The One who brings things into existence from non-existence according to His precise measurement and wisdom.",
    evidence: "خَالِقُ كُلِّ شَيْءٍ فَاعْبُدُوهُ (الأنعام: 102)",
    evidenceEn: "The Creator of all things, so worship Him. (Al-An'am: 102)"
  },
  {
    id: 13,
    name: "الْبَارِئُ",
    transliteration: "Al-Bari",
    meaning: "الذي خلق المخلوقات بريئة من التفاوت والتناقض، المنشئ للأشياء والمبرز لها من العدم إلى الوجود بتقدير محكم.",
    meaningEn: "The Evolver, the Producer. The One who creates all things in harmony, proportion, and balance without any flaw or discrepancy.",
    evidence: "الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ (الحشر: 24)",
    evidenceEn: "The Creator, the Producer, the Fashioner. (Al-Hashr: 24)"
  },
  {
    id: 14,
    name: "الْمُصَوِّرُ",
    transliteration: "Al-Musawwir",
    meaning: "الذي أعطى كل مخلوق صوره وشكله الخاص وهيأته التي تميزه عن غيره بحكمة بالغة وإبداع مطلق.",
    meaningEn: "The Fashioner. The One who gives every creation its distinct form, shape, and unique appearance with absolute wisdom and beauty.",
    evidence: "الْبَارِئُ الْمُصَوِّرُ لَهُ الْأَسْمَاءُ الْحُسْنَى (الحشر: 24)",
    evidenceEn: "The Producer, the Fashioner; to Him belong the best names. (Al-Hashr: 24)"
  },
  {
    id: 15,
    name: "الْغَفَّارُ",
    transliteration: "Al-Ghaffar",
    meaning: "الكثير المغفرة والستر لذنوب عباده مرّة بعد أخرى متى تابوا وأنابوا إليه، الواسع ستره لعيوبهم.",
    meaningEn: "The All-Forgiving. The One who continually conceals sins and forgives the repentant time and time again with infinite grace.",
    evidence: "وَإِنِّي لَغَفَّارٌ لِمَنْ تَابَ (طه: 82)",
    evidenceEn: "And indeed, I am the Perpetual Forgiver of whoever repents. (Ta-Ha: 82)"
  },
  {
    id: 16,
    name: "الْقَهَّارُ",
    transliteration: "Al-Qahhar",
    meaning: "الغالب لكل شيء، الذي خضعت له الرقاب وذلت له الجبابرة، المالك لأزمّة الأمور والقاهر لكل عدو وعاص.",
    meaningEn: "The Subduer, the Dominant. The One who holds absolute power and dominance over all creation, before whom everything humbles itself.",
    evidence: "وَهُوَ الْوَاحِدُ الْقَهَّارُ (الرعد: 16)",
    evidenceEn: "And He is the One, the Prevailing. (Ar-Ra'd: 16)"
  },
  {
    id: 17,
    name: "الْوَهَّابُ",
    transliteration: "Al-Wahhab",
    meaning: "الكثير العطاء والجود بلا عوض ولا غاية، الذي يهب النعم والرزق لمن يشاء من عباده تفضلاً منه وامتناناً.",
    meaningEn: "The Bestower, the Giver of Gifts. The One who continuously grants blessings, provisions, and favors generously without expecting anything in return.",
    evidence: "أَمْ عِنْدَهُمْ خَزَائِنُ رَحْمَةِ رَبِّكَ الْعَزِيزِ الْوَهَّابِ (ص: 9)",
    evidenceEn: "Or do they have the depositories of the mercy of your Lord, the Almighty, the Bestower? (Sad: 9)"
  },
  {
    id: 18,
    name: "الرَّزَّاقُ",
    transliteration: "Ar-Razzaq",
    meaning: "الخالق للأرزاق والموصل لها إلى جميع خلقه، الظاهر والباطن، المادي والمعنوي، فلا يخلو مخلوق من رزقه طرفة عين.",
    meaningEn: "The Provider. The One who creates and distributes all provisions, physical and spiritual, ensuring that every creature receives its sustenance.",
    evidence: "إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ (الذاريات: 58)",
    evidenceEn: "Indeed, Allah is the [continual] Provider, the firm possessor of strength. (Ad-Dhariyat: 58)"
  },
  {
    id: 19,
    name: "الْفَتَّاحُ",
    transliteration: "Al-Fattah",
    meaning: "الذي يفتح أبواب الرحمة والرزق والمعرفة لعباده، والحاكم العادل بين خلقه بكلماته وقضائه.",
    meaningEn: "The Opener, the Judge. The One who opens the gates of mercy, provision, and understanding, and judges justly between His creation.",
    evidence: "وَهُوَ الْفَتَّاحُ الْعَلِيمُ (سبأ: 26)",
    evidenceEn: "And He is the Knowing Judge. (Saba: 26)"
  },
  {
    id: 20,
    name: "الْعَلِيمُ",
    transliteration: "Al-Alim",
    meaning: "المحيط علما بكل شيء، الظاهر والباطن، الجلي والخفي، الماضي والمستقبل، فلا يعزب عنه مثقال ذرة في السموات ولا في الأرض.",
    meaningEn: "The All-Knowing. The One who knows everything in complete detail—past, present, and future, visible and hidden. Not an atom escapes His knowledge.",
    evidence: "وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ (الحجرات: 16)",
    evidenceEn: "And Allah is Knowing of all things. (Al-Hujurat: 16)"
  },
  {
    id: 21,
    name: "الْقَابِضُ",
    transliteration: "Al-Qabid",
    meaning: "الذي يقبض الأرزاق أو الأرواح أو القلوب بحكمته، فيضيق الرزق على من يشاء ابتلاءً أو حكمة.",
    meaningEn: "The Withholder, the Constrictor. The One who withholds sustenance, souls, or provisions with ultimate wisdom and divine measure.",
    evidence: "وَاللَّهُ يَقْبِضُ وَيَبْسُطُ وَإِلَيْهِ تُرْجَعُونَ (البقرة: 245)",
    evidenceEn: "And Allah withholds and grants abundance, and to Him you will be returned. (Al-Baqarah: 245)"
  },
  {
    id: 22,
    name: "الْبَاسِطُ",
    transliteration: "Al-Basit",
    meaning: "الذي يبسط الرزق والرحمة والفضل لمن يشاء من عباده سعةً وجوداً وبسطاً للقلوب بالهداية.",
    meaningEn: "The Expander, the Extender. The One who expands provision, mercy, and grace for whomever He wills, and fills hearts with joy and guidance.",
    evidence: "وَاللَّهُ يَقْبِضُ وَيَبْسُطُ وَإِلَيْهِ تُرْجَعُونَ (البقرة: 245)",
    evidenceEn: "And Allah withholds and grants abundance... (Al-Baqarah: 245)"
  },
  {
    id: 23,
    name: "الْخَافِضُ",
    transliteration: "Al-Khafid",
    meaning: "الذي يخفض الكافرين والفاسقين بقدرته، ويخفض من شاء من عباده ابتلاءً أو جزاءً لتواضعهم أو لرفعة درجاتهم.",
    meaningEn: "The Abaser, the Reducer. The One who lowers the arrogant and disbelievers, or lowers whatever He wills in rank according to His justice and wisdom.",
    evidence: "خَافِضَةٌ رَافِعَةٌ (الواقعة: 3)",
    evidenceEn: "Bringing down [some], raising up [others]. (Al-Waqi'ah: 3)"
  },
  {
    id: 24,
    name: "الرَّافِعُ",
    transliteration: "Ar-Rafi",
    meaning: "الذي يرفع المؤمنين بالطاعات والتوحيد، ويرفع قدر من شاء من خلقه في الدنيا والآخرة.",
    meaningEn: "The Exaltier, the Elevator. The One who raises the believers through faith and righteous deeds, elevating whoever He wills in honor and status.",
    evidence: "وَرَفَعْنَاهُ مَكَانًا عَلِيًّا (مريم: 57)",
    evidenceEn: "And We raised him to a high station. (Maryam: 57)"
  },
  {
    id: 25,
    name: "الْمُعِزُّ",
    transliteration: "Al-Mu'izz",
    meaning: "الذي يهب العزة والغلبة والرفعة لمن أطاعه وتمسك بدينه، وينزعها عن أعدائه.",
    meaningEn: "The Bestower of Honor. The One who grants honor, dignity, and strength to those who obey Him and adhere to His guidance.",
    evidence: "وَتُعِزُّ مَنْ تَشَاءُ وَتُذِلُّ مَنْ تَشَاءُ (آل عمران: 26)",
    evidenceEn: "And You honor whom You will and you humiliate whom You will. (Ali 'Imran: 26)"
  },
  {
    id: 26,
    name: "الْمُذِلُّ",
    transliteration: "Al-Mudhill",
    meaning: "الذي يذل من عصاه وتمرد على أمره، ويسلبهم القوة والعزة جزاءً لظلمهم وطغيانهم.",
    meaningEn: "The Humiliator, the Dishonorer. The One who humbles those who rebel against His commands and stray from His path.",
    evidence: "وَمَنْ يُهِنِ اللَّهُ فَمَا لَهُ مِنْ مُكْرِمٍ (الحج: 18)",
    evidenceEn: "And whoever Allah humiliates - for him there is no bestower of honor. (Al-Hajj: 18)"
  },
  {
    id: 27,
    name: "السَّمِيعُ",
    transliteration: "As-Sami",
    meaning: "المحيط سمعُه جميع الأصوات، الجلي والخفي، البعيد والقريب، يسمع دعاء الداعين ونجوى المضطرين.",
    meaningEn: "The All-Hearing. The One whose hearing encompasses all sounds, hidden or manifest. He hears the supplications of those who call upon Him.",
    evidence: "وَهُوَ السَّمِيعُ الْبَصِيرُ (الشورى: 11)",
    evidenceEn: "And He is the Hearing, the Seeing. (Ash-Shura: 11)"
  },
  {
    id: 28,
    name: "الْبَصِيرُ",
    transliteration: "Al-Basir",
    meaning: "المحيط بصرُه جميع المرئيات، يرى دبيب النملة السوداء على الصخرة الصماء في الليلة الظلماء.",
    meaningEn: "The All-Seeing. The One who sees all things, manifest and hidden, even the movement of a black ant on a dark rock.",
    evidence: "إِنَّهُ هُوَ السَّمِيعُ الْبَصِيرُ (الإسراء: 1)",
    evidenceEn: "Indeed, He is the Hearing, the Seeing. (Al-Isra: 1)"
  },
  {
    id: 29,
    name: "الْحَكَمُ",
    transliteration: "Al-Hakam",
    meaning: "الحاكم العدل بين خلقه في الدنيا والآخرة، الذي لا راد لقضائه ولا معقب لحكمه، وفصل بين الحق والباطل.",
    meaningEn: "The Judge, the Arbitrator. The Ultimate Judge whose decrees are absolute and just, separating truth from falsehood with ultimate wisdom.",
    evidence: "أَفَغَيْرَ اللَّهُ أَبْتَغِي حَكَمًا (الأنعام: 114)",
    evidenceEn: "Then is it other than Allah I should seek as judge? (Al-An'am: 114)"
  },
  {
    id: 30,
    name: "الْعَدْلُ",
    transliteration: "Al-Adl",
    meaning: "المنزه عن الظلم في أفعاله وأقواله، الحكيم في تدبيره، الذي يعطي كل ذي حق حقه بميزان القسط والعدل.",
    meaningEn: "The Just. The One who is completely free from injustice, whose decrees and actions are established upon absolute fairness and equity.",
    evidence: "وَتَمَّتْ كَلِمَتُ رَبِّكَ صِدْقًا وَعَدْلًا (الأنعام: 115)",
    evidenceEn: "And the word of your Lord has been fulfilled in truth and in justice. (Al-An'am: 115)"
  },
  {
    id: 31,
    name: "اللَّطِيفُ",
    transliteration: "Al-Latif",
    meaning: "الرفيق بعباده، العليم بدقائق الأمور ومصالحها، الذي يوصل البر والإحسان إلى خلقه من حيث لا يحتسبون وبألطف الطرق.",
    meaningEn: "The Subtle, the Kind. The One who is infinitely gentle and subtle in His actions, bringing about good in ways beyond human comprehension.",
    evidence: "اللَّهُ لَطِيفٌ بِعِبَادِهِ (الشورى: 19)",
    evidenceEn: "Allah is Subtle with His servants. (Ash-Shura: 19)"
  },
  {
    id: 32,
    name: "الْخَبِيرُ",
    transliteration: "Al-Khabir",
    meaning: "العليم ببواطن الأمور وخباياها، الذي لا يخفى عليه شيء في الأرض ولا في السماء، ويعلم حقيقة كل شيء.",
    meaningEn: "The All-Aware. The One who knows the innermost secrets of all things, nothing whatsoever being hidden from His awareness.",
    evidence: "وَهُوَ الْحَكِيمُ الْخَبِيرُ (الأنعام: 18)",
    evidenceEn: "And He is the Wise, the Acquainted. (Al-An'am: 18)"
  },
  {
    id: 33,
    name: "الْحَلِيمُ",
    transliteration: "Al-Halim",
    meaning: "الذي لا يعجل بالعقوبة على العاصين، بل يمهلهم لعلهم يتوبون، الصبور على أذاهم مع كمال قدرته عليهم.",
    meaningEn: "The Forbearing, the Clement. The One who does not hasten punishment for sinners, but grants them time to repent out of patience and grace.",
    evidence: "وَاللَّهُ غَفُورٌ حَلِيمٌ (البقرة: 225)",
    evidenceEn: "And Allah is Forgiving and Forbearing. (Al-Baqarah: 225)"
  },
  {
    id: 34,
    name: "الْعَظِيمُ",
    transliteration: "Al-Azim",
    meaning: "الذي تعظم القلوب جلاله وهيبته، المتصف بصفات العظمة والكبرياء التي تقصر عن معرفتها عقول المخلوقات.",
    meaningEn: "The Magnificent, the Supreme. The One who possesses ultimate greatness, majesty, and glory, before whom all creation bows in awe.",
    evidence: "وَهُوَ الْعَلِيُّ الْعَظِيمُ (البقرة: 255)",
    evidenceEn: "And He is the Most High, the Magnificent. (Al-Baqarah: 255)"
  },
  {
    id: 35,
    name: "الْغَفُورُ",
    transliteration: "Al-Ghafur",
    meaning: "الكثير المغفرة لذنوب عباده، الساتر لعيوبهم، الذي يغفر الذنوب العظام ويتجاوز عنها برحمته الواسعة.",
    meaningEn: "The All-Forgiving. The One who forgives immense sins and covers faults, overlooking shortcomings with His boundless forgiveness.",
    evidence: "إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ (النحل: 119)",
    evidenceEn: "Indeed, Allah is Forgiving and Merciful. (An-Nahl: 119)"
  },
  {
    id: 36,
    name: "الشَّكُورُ",
    transliteration: "Ash-Shakur",
    meaning: "الذي يجزي عباده على القليل من العمل بالثواب الجزيل، ويضاعف حسناتهم، ويشكر الطائعين بقبول أعمالهم.",
    meaningEn: "The Appreciative, the Grateful. The One who rewards small deeds with immense grace, multiplying good deeds for His grateful servants.",
    evidence: "إِنَّهُ غَفُورٌ شَكُورٌ (فاطر: 30)",
    evidenceEn: "Indeed, He is Forgiving and Appreciative. (Fatir: 30)"
  },
  {
    id: 37,
    name: "الْعَلِيُّ",
    transliteration: "Al-Ali",
    meaning: "العالي في ذاته وقدره وقهره فوق جميع خلقه، الذي لا يعلوه شيء ولا يحيط به مخلوق.",
    meaningEn: "The Most High, the Exalted. The One who is above all His creation in status, power, and majesty, surpassing all limits.",
    evidence: "وَهُوَ الْعَلِيُّ الْعَظِيمُ (البقرة: 255)",
    evidenceEn: "And He is the Most High, the Magnificent. (Al-Baqarah: 255)"
  },
  {
    id: 38,
    name: "الْكَبِيرُ",
    transliteration: "Al-Kabir",
    meaning: "المتصف بكبرياء الجلال والعظمة، الذي كل شيء دونه حقير، المتعالي عن كل نقص.",
    meaningEn: "The Greatest. The One who is greater than everything in existence, possessing supreme majesty and perfection.",
    evidence: "الْكَبِيرُ الْمُتَعَالِ (الرعد: 9)",
    evidenceEn: "The Grand, the Exalted. (Ar-Ra'd: 9)"
  },
  {
    id: 39,
    name: "الْحَفِيظُ",
    transliteration: "Al-Hafiz",
    meaning: "الحافظ لكل شيء أن يضيع أو يفسد، الحافظ لأعمال عباده وأقوالهم، الواقي لأوليائه من المهالك.",
    meaningEn: "The Preserver, the Guardian. The One who protects all creation from ruin or decay, guarding the deeds of His servants and protecting the righteous.",
    evidence: "إِنَّ رَبِّي عَلَى كُلِّ شَيْءٍ حَفِيظٌ (هود: 57)",
    evidenceEn: "Indeed, my Lord is Guardian over all things. (Hud: 57)"
  },
  {
    id: 40,
    name: "الْمُقِيتُ",
    transliteration: "Al-Muqit",
    meaning: "المقدر للأقوات وموصلها إلى أجسام القلوب، الحافظ لها، والمقتدر على كل شيء.",
    meaningEn: "The Nourisher, the Sustainer. The One who provides nourishment and sustenance to all bodies and souls with absolute capability.",
    evidence: "وَكَانَ اللَّهُ عَلَى كُلِّ شَيْءٍ مُقِيتًا (النساء: 85)",
    evidenceEn: "And ever is Allah, over all things, a Keeper. (An-Nisa: 85)"
  },
  {
    id: 41,
    name: "الْحَسِيبُ",
    transliteration: "Al-Hasib",
    meaning: "الكافي عباده ما أهمهم، والمحاسب للخلق أجمعين على أعمالهم، العالم بدقائق الأمور.",
    meaningEn: "The Reckoner, the Sufficient. The One who is sufficient for His servants, keeping absolute account of all deeds and holding everyone responsible.",
    evidence: "وَكَفَى بِاللَّهِ حَسِيبًا (النساء: 6)",
    evidenceEn: "And sufficient is Allah as Accountant. (An-Nisa: 6)"
  },
  {
    id: 42,
    name: "الْجَلِيلُ",
    transliteration: "Al-Jalil",
    meaning: "المتصف بصفات الجلال والعظمة والكمال المطلق، المنزه عن كل نقص، المستحق لكل تعظيم.",
    meaningEn: "The Majestic. The One who possesses supreme majesty, glory, and perfection, deserving all reverence and honor.",
    evidence: "تَبَارَكَ اسْمُ رَبِّكَ ذِي الْجَلَالِ وَالْإِكْرَامِ (الرحمن: 78)",
    evidenceEn: "Blessed be the name of your Lord, Owner of Majesty and Honor. (Ar-Rahman: 78)"
  },
  {
    id: 43,
    name: "الْكَرِيمُ",
    transliteration: "Al-Karim",
    meaning: "الكثير الجود والخير، المعطي بلا طلب، الذي إذا عاهد وفى، وإذا أعطى أجزَل، الكريم في أفعاله وصفاته.",
    meaningEn: "The Most Generous, the Noble. The One who gives limitlessly, fulfills His promises, and pours forth blessings beyond measure.",
    evidence: "رَبِّ الْعَرْشِ الْكَرِيمِ (المؤمنون: 116)",
    evidenceEn: "Lord of the Noble Throne. (Al-Mu'minun: 116)"
  },
  {
    id: 44,
    name: "الرَّقِيبُ",
    transliteration: "Ar-Raqib",
    meaning: "المطلع على السرائر والخفايا، الحافظ للخلائق، الذي لا يغفل عن شيء ولا يخفى عليه أمر.",
    meaningEn: "The Watchful. The One who observes all things, witnessing every action, thought, and secret without ever being absent.",
    evidence: "وَكَانَ اللَّهُ عَلَى كُلِّ شَيْءٍ رَقِيبًا (الأحزاب: 52)",
    evidenceEn: "And ever is Allah, over all things, an Observer. (An-Ahzab: 52)"
  },
  {
    id: 45,
    name: "الْمُجِيبُ",
    transliteration: "Al-Mujib",
    meaning: "المستجيب لدعاء السائلين، والمغيث للمضطرين، والقريب ممن ناجاه ودعاه بإخلاص.",
    meaningEn: "The Responsive. The One who answers the supplications of those who call upon Him, fulfilling their needs and relieving their distress.",
    evidence: "إِنَّ رَبِّي قَرِيبٌ مُجِيبٌ (هود: 61)",
    evidenceEn: "Indeed, my Lord is near and responsive. (Hud: 61)"
  },
  {
    id: 46,
    name: "الْوَاسِعُ",
    transliteration: "Al-Wasi",
    meaning: "المحيط سعته كل شيء في العلم والرحمة والمغفرة والفضل، الذي لا تنفد خزائنه.",
    meaningEn: "The All-Encompassing, the Vast. The One whose knowledge, mercy, grace, and abundance encompass all things without limitation.",
    evidence: "وَاللَّهُ وَاسِعٌ عَلِيمٌ (البقرة: 115)",
    evidenceEn: "And Allah is all-Encompassing and Knowing. (Al-Baqarah: 115)"
  },
  {
    id: 47,
    name: "الْحَكِيمُ",
    transliteration: "Al-Hakim",
    meaning: "المدبر للأمور بحكمة بالغة، الذي يضع كل شيء في موضعه الصحيح، الخبير بمصالح العباد.",
    meaningEn: "The All-Wise. The One whose actions are guided by absolute wisdom, placing every single thing in its rightful place with perfection.",
    evidence: "وَهُوَ الْحَكِيمُ الْخَبِيرُ (الأنعام: 18)",
    evidenceEn: "And He is the Wise, the Acquainted. (Al-An'am: 18)"
  },
  {
    id: 48,
    name: "الْوَدُودُ",
    transliteration: "Al-Wadud",
    meaning: "المحب لعباده الصالحين، والمحبوب في قلوب أوليائه بما أسبغ عليهم من نعمه، الودود الرحيم.",
    meaningEn: "The Loving-Kind. The One who loves His righteous servants and is beloved by their hearts, showering them with affection and mercy.",
    evidence: "إِنَّ رَبِّي رَحِيمٌ وَدُودٌ (هود: 90)",
    evidenceEn: "Indeed, my Lord is Merciful and Affectionate. (Hud: 90)"
  },
  {
    id: 49,
    name: "الْمَجِيدُ",
    transliteration: "Al-Majid",
    meaning: "المتصف بكمال المجد والعظمة والشرف، الواسع الصفات العالية في جلاله وجماله.",
    meaningEn: "The Glorious, the Honorable. The One who possesses supreme glory, noble honor, and infinite exalted attributes.",
    evidence: "ذُو الْعَرْشِ الْمَجِيدُ (البروج: 15)",
    evidenceEn: "Owner of the Glorious Throne. (Al-Buruj: 15)"
  },
  {
    id: 50,
    name: "الْبَاعِثُ",
    transliteration: "Al-Ba'ith",
    meaning: "الذي يبعث الموتى من قبورهم للحساب والجزاء، ويبعث الهمم والعزائم في قلوب أوليائه.",
    meaningEn: "The Resurrector. The One who will raise all the dead from their graves for judgment, and inspires life and energy into hearts.",
    evidence: "وَأَنَّ اللَّهَ يَبْعَثُ مَنْ فِي الْقُبُورِ (الحج: 7)",
    evidenceEn: "And that Allah will resurrect those who are in the graves. (Al-Hajj: 7)"
  },
  {
    id: 51,
    name: "الشَّهِيدُ",
    transliteration: "Ash-Shahid",
    meaning: "الحاضر الذي لا يغيب عنه شيء، الشاهد على أعمال عباده، الذي لا يخفى عليه أمر في السموات والأرض.",
    meaningEn: "The Witness. The One who witnesses all things, present everywhere with His knowledge, testifying to the deeds of all creation.",
    evidence: "وَاللَّهُ عَلَى كُلِّ شَيْءٍ شَهِيدٌ (المجادلة: 6)",
    evidenceEn: "And Allah is Witness over all things. (Al-Mujadilah: 6)"
  },
  {
    id: 52,
    name: "الْحَقُّ",
    transliteration: "Al-Haqq",
    meaning: "الموجود حقيقةً، الثابت الذي لا يتغير، الذي وعده حق وقوله حق ودينه حق وكل ما صدر عنه حق.",
    meaningEn: "The Truth. The One whose existence is absolute and unchanging, whose promises, words, and religion are the ultimate truth.",
    evidence: "فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ (طه: 114)",
    evidenceEn: "So high [above all] is Allah, the Sovereign, the Truth. (Ta-Ha: 114)"
  },
  {
    id: 53,
    name: "الْوَكِيلُ",
    transliteration: "Al-Wakil",
    meaning: "الكفيل بأمور خلقه، الذي يتوكل عليه المتوكلون فيكفيهم، القائم بمصالح عباده أحسن قيام.",
    meaningEn: "The Trustee, the Disposer of Affairs. The One upon whom believers rely completely, entrusting their matters to Him as the best guardian.",
    evidence: "وَحَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ (آل عمران: 173)",
    evidenceEn: "And sufficient is Allah, and He is the best Disposer of affairs. (Ali 'Imran: 173)"
  },
  {
    id: 54,
    name: "الْقَوِيُّ",
    transliteration: "Al-Qawiy",
    meaning: "صاحب القوة الكاملة والقدرة المطلقة، الذي لا يعجزه شيء في الأرض ولا في السماء، الغالب الذي لا يُقهر.",
    meaningEn: "The Strong. The One who possesses absolute and infinite strength and power, never faltering or failing in any matter.",
    evidence: "إِنَّ رَبَّكَ هُوَ الْقَوِيُّ الْعَزِيزُ (هود: 66)",
    evidenceEn: "Indeed, your Lord is the Strong, the Almighty. (Hud: 66)"
  },
  {
    id: 55,
    name: "الْمَتِينُ",
    transliteration: "Al-Matin",
    meaning: "الشديد القوة، البالغ في قوته حدّاً لا ينقطع ولا يتطرق إليه ضعف، المتين في أفعاله وأقواله.",
    meaningEn: "The Firm, the Steadfast. The One whose strength and firmness know no bounds, steadfast in His power and determination.",
    evidence: "إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ (الذاريات: 58)",
    evidenceEn: "Indeed, Allah is the [continual] Provider, the firm possessor of strength. (Ad-Dhariyat: 58)"
  },
  {
    id: 56,
    name: "الْوَلِيُّ",
    transliteration: "Al-Wali",
    meaning: "الناصر والمعين والمحب لأوليائه، المتولّي أمورهم والمخرج لهم من الظلمات إلى النور.",
    meaningEn: "The Protecting Associate, the Friend. The One who aids, protects, and loves the believers, guiding them out of darkness into light.",
    evidence: "وَاللَّهُ وَلِيُّ الْمُؤْمِنِينَ (آل عمران: 68)",
    evidenceEn: "And Allah is the protector of the believers. (Ali 'Imran: 68)"
  },
  {
    id: 57,
    name: "الْحَمِيدُ",
    transliteration: "Al-Hamid",
    meaning: "المستحق للحمد والثناء على أفعاله وأوصافه، المحمود في السراء والضراء، ذو الثناء الحسن.",
    meaningEn: "The Praiseworthy. The One who is deserving of all praise and gratitude for His divine perfection, blessings, and wisdom.",
    evidence: "وَاعْلَمُوا أَنَّ اللَّهَ غَنِيٌّ حَمِيدٌ (البقرة: 267)",
    evidenceEn: "And know that Allah is Free of need and Praiseworthy. (Al-Baqarah: 267)"
  },
  {
    id: 58,
    name: "الْمُحْصِي",
    transliteration: "Al-Muhsi",
    meaning: "الذي أحصى كل شيء بعلمه فلا يفوته منه شاذة ولا فاذة، المحاسب لخلقه على أعمالهم بدقة متناهية.",
    meaningEn: "The Accounter, the Enumerator. The One who keeps exact account of all things, knowing the number and details of every single creation.",
    evidence: "وَأَحْصَى كُلَّ شَيْءٍ عَدَدًا (الجن: 28)",
    evidenceEn: "And has enumerated all things in number. (Al-Jinn: 28)"
  },
  {
    id: 59,
    name: "الْمُبْدِئُ",
    transliteration: "Al-Mubdi",
    meaning: "الذي أنشأ المخلوقات لأول مرة على غير مثال سابق، وبدأ الخلق من العدم.",
    meaningEn: "The Originator. The One who initiates creation from nothing, bringing forth all life for the very first time.",
    evidence: "إِنَّهُ هُوَ يُبْدِئُ وَيُعِيدُ (البروج: 13)",
    evidenceEn: "Indeed, it is He who originates [creation] and repeats. (Al-Buruj: 13)"
  },
  {
    id: 60,
    name: "الْمُعِيدُ",
    transliteration: "Al-Mu'id",
    meaning: "الذي يعيد الخلق بعد موتهم يوم القيامة للحساب والجزاء، كما بدأهم أول مرة.",
    meaningEn: "The Restorer. The One who brings creation back to life after death, resurrecting them just as He originated them.",
    evidence: "كَمَا بَدَأْنَا أَوَّلَ خَلْقٍ نُعِيدُهُ (الأنبياء: 104)",
    evidenceEn: "As We began the first creation, We will repeat it. (Al-Anbiya: 104)"
  },
  {
    id: 61,
    name: "الْمُحْيِي",
    transliteration: "Al-Muhyi",
    meaning: "واهب الحياة للأجساد بنفخ الروحي فيها، وواهب الحياة للقلوب بنور الإيمان والمعرفة.",
    meaningEn: "The Giver of Life. The One who bestows life upon lifeless bodies and brings hearts to life through faith and divine guidance.",
    evidence: "إِنَّ الَّذِي أَحْيَاهَا لَمُحْيِي الْمَوْتَى (فصلت: 39)",
    evidenceEn: "Indeed, He who has given it life will give life to the dead. (Fussilat: 39)"
  },
  {
    id: 62,
    name: "الْمُمِيتُ",
    transliteration: "Al-Mumit",
    meaning: "مقدر الموت على جميع خلقه لحكمة بالغة، ولا يموت سبحانه وتعالى، وهو القابض للأرواح.",
    meaningEn: "The Creator of Death. The One who decrees and creates death for all living creatures, while He is the Ever-Living who never dies.",
    evidence: "وَاللَّهُ يُحْيِي وَيُمِيتُ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ (آل عمران: 156)",
    evidenceEn: "And Allah gives life and causes death, and Allah is Seeing of what you do. (Ali 'Imran: 156)"
  },
  {
    id: 63,
    name: "الْحَيُّ",
    transliteration: "Al-Hayy",
    meaning: "الباقي الأزلي الأبدي الذي لا يموت، الحي بذاته الذي لا تدركه سنة ولا نوم، صاحب الحياة المطلقة.",
    meaningEn: "The Ever-Living. The One who possesses eternal, absolute life without beginning or end, never touched by sleep or death.",
    evidence: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ (البقرة: 255)",
    evidenceEn: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. (Al-Baqarah: 255)"
  },
  {
    id: 64,
    name: "الْقَيُّومُ",
    transliteration: "Al-Qayyum",
    meaning: "القائم بنفسه الذي لا يحتاج لأحد، والمقيم لجميع المخلوقات ومدبرها بحفظه ورعايته وقوته.",
    meaningEn: "The Self-Sustaining, the Sustainer of all. The One who depends on nothing while every single creation depends on Him for its existence.",
    evidence: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ (البقرة: 255)",
    evidenceEn: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. (Al-Baqarah: 255)"
  },
  {
    id: 65,
    name: "الْوَاجِدُ",
    transliteration: "Al-Wajid",
    meaning: "المجدي الغني الذي لا يعجزه شيء، الواجد لكل ما يشاء في ملكوت السموات والأرض.",
    meaningEn: "The Finder, the Perceiver. The One who lacks nothing, possessing everything effortlessly in His vast dominion.",
    evidence: "وَوَجَدَكَ ضَالًّا فَهَدَى (الضحى: 7)",
    evidenceEn: "And He found you lost and guided [you]. (Ad-Duha: 7)"
  },
  {
    id: 66,
    name: "الْمَاجِدُ",
    transliteration: "Al-Majid",
    meaning: "الكريم العظيم الشأن، الواسع العطاء، الشريف في أفعاله وأقواله وصفاته.",
    meaningEn: "The Noble, the Illustrious. The One who possesses sublime nobility, boundless generosity, and magnificent glory.",
    evidence: "ذُو الْعَرْشِ الْمَجِيدُ (البروج: 15)",
    evidenceEn: "Owner of the Glorious Throne. (Al-Buruj: 15)"
  },
  {
    id: 67,
    name: "الْوَاحِدُ",
    transliteration: "Al-Wahid",
    meaning: "الفرد في ذاته وصفاته وأفعاله، الذي لا نظير له ولا شريك، المنفرد بالوحدانية والألوهية.",
    meaningEn: "The One, the Unique. The One and Only in His essence, attributes, and actions, having no partner, equal, or associate.",
    evidence: "وَهُوَ اللَّهُ الْوَاحِدُ الْقَهَّارُ (الرعد: 16)",
    evidenceEn: "And He is the One, the Prevailing. (Ar-Ra'd: 16)"
  },
  {
    id: 68,
    name: "الصَّمَدُ",
    transliteration: "As-Samad",
    meaning: "الذي تصمد إليه الخلائق في حاجاتهم ومطالبهم، السيد الذي كمل في سؤدده، الذي لا جوف له ولا يأكل ولا يشرب.",
    meaningEn: "The Eternal Refuge, the Absolute Master. The One to whom all creation turns for all their needs, while He depends on no one.",
    evidence: "اللَّهُ الصَّمَدُ (الإخلاص: 2)",
    evidenceEn: "Allah, the Eternal Refuge. (Al-Ikhlas: 2)"
  },
  {
    id: 69,
    name: "الْقَادِرُ",
    transliteration: "Al-Qadir",
    meaning: "المقتدر على كل شيء، الذي لا يمتنع عليه أمر ولا يعجزه شيء أراده في ملكه.",
    meaningEn: "The Able, the Omnipotent. The One who is capable of doing absolutely anything, nothing in the heavens or earth being able to frustrate Him.",
    evidence: "قُلْ هُوَ الْقَادِرُ عَلَى أَنْ يَبْعَثَ عَلَيْكُمْ عَذَابًا (الأنعام: 65)",
    evidenceEn: "Say, 'He is the [one] capable of sending upon you affliction...' (Al-An'am: 65)"
  },
  {
    id: 70,
    name: "الْمُقْتَدِرُ",
    transliteration: "Al-Muqtadir",
    meaning: "البالغ في القدرة نهايتها، الذي لا يعجزه شيء وتقع مقدوراته بحكمته وقدرته النافذة.",
    meaningEn: "The Powerful, the Omnipotent. The One who possesses absolute, overriding power, executing His decrees effortlessly with supreme dominion.",
    evidence: "عِنْدَ مَلِيكٍ مُقْتَدِرٍ (القمر: 55)",
    evidenceEn: "Near a Sovereign, Perfect in Ability. (Al-Qamar: 55)"
  },
  {
    id: 71,
    name: "الْمُقَدِّمُ",
    transliteration: "Al-Muqaddim",
    meaning: "الذي يقدم من يشاء من خلقه بحكمته، ويرفع من يشاء في الدرجات والمكانة.",
    meaningEn: "The Expediter, the Promoter. The One who brings forward whomever He wills in rank, status, and proximity according to His wisdom.",
    evidence: "وَتُقَدِّمُ مَنْ تَشَاءُ وَتُؤَخِّرُ مَنْ تَشَاءُ",
    evidenceEn: "And You advance whom You will and delay whom You will."
  },
  {
    id: 72,
    name: "الْمُؤَخِّرُ",
    transliteration: "Al-Mu'akhkhir",
    meaning: "الذي يؤخر من يشاء من خلقه بحكمته وعدله، ويضع الأمور في مواضعها الصحيحة.",
    meaningEn: "The Delayer, the Postponer. The One who delays whomever He wills in rank or punishment according to His absolute justice and wisdom.",
    evidence: "وَتُقَدِّمُ مَنْ تَشَاءُ وَتُؤَخِّرُ مَنْ تَشَاءُ",
    evidenceEn: "And You advance whom You will and delay whom You will."
  },
  {
    id: 73,
    name: "الْأَوَّلُ",
    transliteration: "Al-Awwal",
    meaning: "الذي ليس قبله شيء، الأزلي الذي سبق كل الكائنات بوجوده.",
    meaningEn: "The First. The One who precedes everything in existence, having no beginning before Him.",
    evidence: "هُوَ الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ (الحديد: 3)",
    evidenceEn: "He is the First and the Last, the Ascendant and the Intimate. (Al-Hadid: 3)"
  },
  {
    id: 74,
    name: "الْآخِرُ",
    transliteration: "Al-Akhir",
    meaning: "الباقي بعد فناء خلقه، الذي ليس بعده شيء، الأبدي الذي لا نهاية لوجوده.",
    meaningEn: "The Last. The One who remains after all creation passes away, having no end after Him.",
    evidence: "هُوَ الْأَوَّلُ وَالْآخِرُ (الحديد: 3)",
    evidenceEn: "He is the First and the Last. (Al-Hadid: 3)"
  },
  {
    id: 75,
    name: "الظَّاهِرُ",
    transliteration: "Az-Zahir",
    meaning: "العالي على كل شيء، الظاهرة آياته ودلائل قدرته في الكون، الذي لا يخفى على من تدبر.",
    meaningEn: "The Manifest, the Ascendant. The One whose existence is clearly evidenced by the wonders of the universe and His sublime attributes.",
    evidence: "وَالظَّاهِرُ وَالْبَاطِنُ (الحديد: 3)",
    evidenceEn: "The Ascendant and the Intimate. (Al-Hadid: 3)"
  },
  {
    id: 76,
    name: "الْبَاطِنُ",
    transliteration: "Al-Batin",
    meaning: "المحيط ببواطن الأمور وخباياها، الذي لا يرى في الدنيا بالأبصار، المحتجب عن عيون خلقه.",
    meaningEn: "The Hidden, the Intimate. The One who is closer to everything than its jugular vein, yet beyond physical perception in this world.",
    evidence: "وَالظَّاهِرُ وَالْبَاطِنُ (الحديد: 3)",
    evidenceEn: "The Ascendant and the Intimate. (Al-Hadid: 3)"
  },
  {
    id: 77,
    name: "الْوَالِي",
    transliteration: "Al-Wali",
    meaning: "المالك المتصرف في الأمور المدبر لشؤون خلقه وحده لا شريك له.",
    meaningEn: "The Governor, the Master. The One who governs and manages the entire universe and all affairs of creation.",
    evidence: "وَمَا لَهُمْ مِنْ دُونِهِ مِنْ وَالٍ (الرعد: 11)",
    evidenceEn: "And they have not besides Him any protector. (Ar-Ra'd: 11)"
  },
  {
    id: 78,
    name: "الْمُتَعَالِي",
    transliteration: "Al-Muta'ali",
    meaning: "المنزه عن صفات المخلوقات، المتعالي بعظمته وقدرته فوق كل نقص.",
    meaningEn: "The Most Exalted, the Supreme. The One who is far above all creation in majesty, transcending every flaw or limitation.",
    evidence: "الْكَبِيرُ الْمُتَعَالِ (الرعد: 9)",
    evidenceEn: "The Grand, the Exalted. (Ar-Ra'd: 9)"
  },
  {
    id: 79,
    name: "الْبَرُّ",
    transliteration: "Al-Barr",
    meaning: "الكثير الإحسان والبر واللطف بعباده، الصادق في وعده، الواسع جوده لجميع خلقه.",
    meaningEn: "The Source of All Goodness, the Beneficent. The One who is kind, affectionate, and generous to His creation, fulfilling His promises faithfully.",
    evidence: "إِنَّهُ هُوَ الْبَرُّ الرَّحِيمُ (الطور: 28)",
    evidenceEn: "Indeed, it is He who is the Beneficent, the Merciful. (At-Tur: 28)"
  },
  {
    id: 80,
    name: "التَّوَّابُ",
    transliteration: "At-Tawwab",
    meaning: "الذي يوفق عباده للتوبة مرّة بعد أخرى، ويقبل توبتهم ويتجاوز عن سيئاتهم إذا أنابوا إليه.",
    meaningEn: "The Acceptor of Repentance. The One who continually turns towards the repentant, forgiving their sins and accepting their return to Him.",
    evidence: "وَأَنَّ اللَّهَ تَوَّابٌ رَحِيمٌ (النور: 10)",
    evidenceEn: "And that Allah is Accepting of repentance and Merciful. (An-Nur: 10)"
  },
  {
    id: 81,
    name: "الْمُنْتَقِمُ",
    transliteration: "Al-Muntaqim",
    meaning: "الذي يقصم الظالمين ويعاقب المجتمين المتمردين بعد إقامة الحجة وإعذارهم.",
    meaningEn: "The Avenger. The One who justly exacts retribution from the tyrants, oppressors, and stubborn criminals after offering them guidance.",
    evidence: "إِنَّا مِنَ الْمُنْتَقِمِينَ (الدخان: 16)",
    evidenceEn: "Indeed, We will take retribution. (Ad-Dukhan: 16)"
  },
  {
    id: 82,
    name: "الْعَفُوُّ",
    transliteration: "Al-Afuww",
    meaning: "الذي يمحو السيئات ويتجاوز عن الذنوب والعصاة، فلا يعاقبهم تفضلاً منه وكرماً.",
    meaningEn: "The Pardoner, the Effacer of Sins. The One who pardons sins, erasing them completely as if they never happened out of His immense grace.",
    evidence: "وَكَانَ اللَّهُ عَفُوًّا غَفُورًا (النساء: 99)",
    evidenceEn: "And ever is Allah Pardoning and Forgiving. (An-Nisa: 99)"
  },
  {
    id: 83,
    name: "الرَّؤُوفُ",
    transliteration: "Ar-Ra'uf",
    meaning: "الشديد الرحمة والرأفة بعباده، اللطيف بهم، الذي يرحمهم فيكشف عنهم الضر والبلاء.",
    meaningEn: "The Compassionate, the Kind. The One who shows intense tenderness, compassion, and care toward His servants, relieving their hardships.",
    evidence: "إِنَّ اللَّهَ بِالنَّاسِ لَرَؤُوفٌ رَحِيمٌ (البقرة: 143)",
    evidenceEn: "Indeed, Allah is, to the people, Kind and Merciful. (Al-Baqarah: 143)"
  },
  {
    id: 84,
    name: "مَالِكُ الْمُلْكِ",
    transliteration: "Malik-ul-Mulk",
    meaning: "المالك الحقيقي لكل الملك والوجود، يعطي الملك لمن يشاء وينزعه ممن يشاء.",
    meaningEn: "The Owner of Sovereignty. The Sovereign Lord who possesses absolute dominion over all existence, granting and stripping power as He wills.",
    evidence: "قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ (آل عمران: 26)",
    evidenceEn: "Say, 'O Allah, Owner of Sovereignty...' (Ali 'Imran: 26)"
  },
  {
    id: 85,
    name: "ذُو الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Dhul-Jalali wal-Ikram",
    meaning: "صاحب العظمة والكبرياء والجلال المطلق، وصاحب الجود والإحسان والإكرام لأوليائه.",
    meaningEn: "The Lord of Majesty and Generosity. The One who possesses supreme majesty, glory, and infinite generosity toward His servants.",
    evidence: "ذُو الْجَلَالِ وَالْإِكْرَامِ (الرحمن: 27)",
    evidenceEn: "Owner of Majesty and Honor. (Ar-Rahman: 27)"
  },
  {
    id: 86,
    name: "الْمُقْسِطُ",
    transliteration: "Al-Muqsit",
    meaning: "العادل الذي ينصف المظلوم من الظالم، الحكيم في أحكامه وقضائه.",
    meaningEn: "The Equitable, the Just. The One who establishes absolute justice, vindicating the oppressed and rendering fair judgment.",
    evidence: "وَأَقْسِطُوا إِنَّ اللَّهَ يُحِبُّ الْمُقْسِطِينَ (الحجرات: 9)",
    evidenceEn: "And be just; indeed, Allah loves those who act justly. (Al-Hujurat: 9)"
  },
  {
    id: 87,
    name: "الْجَامِعُ",
    transliteration: "Al-Jami",
    meaning: "الذي يجمع الخلائق يوم القيامة للحساب، والجامع لكل الفضائل والكمالات.",
    meaningEn: "The Gatherer, the Unifier. The One who gathers all of humanity on the Day of Judgment for accountability, and unites hearts.",
    evidence: "رَبَّنَا إِنَّكَ جَامِعُ النَّاسِ لِيَوْمٍ لَا رَيْبَ فِيهِ (آل عمران: 9)",
    evidenceEn: "Our Lord, surely You will gather the people for a Day about which there is no doubt. (Ali 'Imran: 9)"
  },
  {
    id: 88,
    name: "الْغَنِيُّ",
    transliteration: "Al-Ghani",
    meaning: "المستغني بذاته عن كل ما سواه، الذي لا يحتاج لأحد، وكل مخلوق محتاج إليه.",
    meaningEn: "The Self-Sufficient, the Independent. The One who is completely free of need from all creation, while everything else depends entirely on Him.",
    evidence: "وَاللَّهُ الْغَنِيُّ وَأَنْتُمُ الْفُقَرَاءُ (محمد: 38)",
    evidenceEn: "And Allah is the Free of need, while you are the needy. (Muhammad: 38)"
  },
  {
    id: 89,
    name: "الْمُغْنِي",
    transliteration: "Al-Mughni",
    meaning: "الذي يغني عباده ويكفيهم حاجاتهم، ويهب الغنى المادي والروحي لمن يشاء.",
    meaningEn: "The Enricher. The One who satisfies the needs of His creation, granting wealth, contentment, and fulfillment to whoever He wills.",
    evidence: "وَأَنَّهُ هُوَ أَغْنَى وَأَقْنَى (النجم: 48)",
    evidenceEn: "And that it is He who enriches and suffices. (An-Najm: 48)"
  },
  {
    id: 90,
    name: "الْمَانِعُ",
    transliteration: "Al-Mani",
    meaning: "الذي يمنع الضرر عن عباده، ويحمي أوليائه، ويمنع العطاء عن من يشاء حكمةً وعدلاً.",
    meaningEn: "The Withholder, the Preventer. The One who prevents harm from reaching His servants and protects them with His wisdom.",
    evidence: "وَإِنْ يَمْسَسْكَ اللَّهُ بِضُرٍّ فَلَا كَاشِفَ لَهُ إِلَّا هُوَ (الأنعام: 17)",
    evidenceEn: "And if Allah should touch you with adversity, there is no remover of it except Him. (Al-An'am: 17)"
  },
  {
    id: 91,
    name: "الضَّارُّ",
    transliteration: "Ad-Darr",
    meaning: "المقدر للضرر على من شاء بحكمته جزاءً أو ابتلاءً ليمحص المؤمنين.",
    meaningEn: "The Creator of Adversity, the Distresser. The One who decrees hardship or adversity with absolute wisdom to test and purify souls.",
    evidence: "وَإِنْ يَمْسَسْكَ اللَّهُ بِضُرٍّ فَلَا كَاشِفَ لَهُ إِلَّا هُوَ (الأنعام: 17)",
    evidenceEn: "And if Allah should touch you with adversity... (Al-An'am: 17)"
  },
  {
    id: 92,
    name: "النَّافِعُ",
    transliteration: "An-Nafi",
    meaning: "الواهن للخير والنفع لعباده، فلا يقع نفع في الكون إلا بإذنه وتقديره.",
    meaningEn: "The Source of Good, the Benefactor. The One who creates and bestows all benefit, profit, and goodness upon His creation.",
    evidence: "وَإِنْ يَمْسَسْكَ اللَّهُ بِضُرٍّ فَلَا كَاشِفَ لَهُ إِلَّا هُوَ وَإِنْ يَمْسَسْكَ بِخَيْرٍ فَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ (الأنعام: 17)",
    evidenceEn: "And if He touches you with good - then He is over all things competent. (Al-An'am: 17)"
  },
  {
    id: 93,
    name: "النُُّورُ",
    transliteration: "An-Nur",
    meaning: "المنور للسموات والأرض بنوره، وهادي قلوب أوليائه بنور الإيمان والقرآن.",
    meaningEn: "The Light. The One who illuminates the heavens and the earth with His light, guiding the hearts of believers with faith and divine wisdom.",
    evidence: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ (النور: 35)",
    evidenceEn: "Allah is the Light of the heavens and the earth. (An-Nur: 35)"
  },
  {
    id: 94,
    name: "الْهَادِي",
    transliteration: "Al-Hadi",
    meaning: "المرشد والموفق لعباده إلى طريق الحق والخير، والهادي لقلوب الخلائق إلى مصالحهم.",
    meaningEn: "The Guide. The One who guides His creation to truth, righteousness, and success, illuminating the path of guidance for hearts.",
    evidence: "وَكَفَى بِرَبِّكَ هَادِيًا وَنَصِيرًا (الفرقان: 31)",
    evidenceEn: "And sufficient is your Lord as a guide and helper. (Al-Furqan: 31)"
  },
  {
    id: 95,
    name: "الْبَدِيعُ",
    transliteration: "Al-Badi",
    meaning: "المخترع المبدع للكون وأشياءه على غير مثال سابق بكمال وإتقان.",
    meaningEn: "The Originator, the Incomparable. The One who creates the universe in its astonishing beauty and precision without any prior model.",
    evidence: "بَدِيعُ السَّمَاوَاتِ وَالْأَرْضِ (البقرة: 117)",
    evidenceEn: "Originator of the heavens and the earth. (Al-Baqarah: 117)"
  },
  {
    id: 96,
    name: "الْبَاقِي",
    transliteration: "Al-Baqi",
    meaning: "الدائم المستمر الوجود الذي لا فناء له ولا زوال، الحي الذي لا يموت.",
    meaningEn: "The Everlasting, the Immutable. The One who remains eternally without end or cessation, while all else passes away.",
    evidence: "وَيَبْقَى وَجْهُ رَبِّكَ ذُو الْجَلَالِ وَالْإِكْرَامِ (الرحمن: 27)",
    evidenceEn: "And there will remain the Face of your Lord, Owner of Majesty and Honor. (Ar-Rahman: 27)"
  },
  {
    id: 97,
    name: "الْوَارِثُ",
    transliteration: "Al-Warith",
    meaning: "الباقي بعد فناء الخلائق، إليه ترجع الأموال والممالك وكل شيء بعد زوال أهله.",
    meaningEn: "The Ultimate Heir. The One who remains after all creation perishes, to whom all ownership and dominion ultimately return.",
    evidence: "وَإِنَّ لَنَحْنُ نُحْيِي وَنُمِيتُ وَنَحْنُ الْوَارِثُونَ (الحجر: 23)",
    evidenceEn: "And indeed, it is We who give life and cause death, and We are the Inheritor. (Al-Hijr: 23)"
  },
  {
    id: 98,
    name: "الرَّشِيدُ",
    transliteration: "Ar-Rashid",
    meaning: "الحكيم في تدبيره، المرشد لخلقه إلى طريق الرشاد والسداد والصلاح.",
    meaningEn: "The Guide to the Right Path. The One who directs all affairs with supreme wisdom toward the best and most correct outcomes.",
    evidence: "إِنَّ رَبِّي عَلَى صِرَاطٍ مُسْتَقِيمٍ (هود: 56)",
    evidenceEn: "Indeed, my Lord is on a straight path. (Hud: 56)"
  },
  {
    id: 99,
    name: "الصَّبُورُ",
    transliteration: "As-Sabur",
    meaning: "الحليم الذي لا يعجل بالعقوبة على العصاة مع كمال قدرته، الصبور على أذى خلقه مع عظيم حلمه.",
    meaningEn: "The Patient, the Enduring. The One who does not hasten to punish transgressors, showing immense patience and forbearance with His creation.",
    evidence: "وَاللَّهُ يُحِبُّ الصَّابِرِينَ (آل عمران: 146)",
    evidenceEn: "And Allah loves the patient. (Ali 'Imran: 146)"
  }
];
