import { PassageStoryMap } from './asbabNuzulData';

// مقاطع وأسباب نزول وتفاسير سورة التحريم (At-Tahrim) - 12 مقطعاً تفصيلياً تغطي جميع آيات السورة آيةً بآية
export const TAHRIM_DETAILED_PASSAGES: PassageStoryMap[] = [
  {
    surahNumber: 66,
    startAyah: 1,
    endAyah: 1,
    storyTitleAr: "لم تحرم ما أحل الله لك: قصة تحريم العسل (وفي رواية مارية) في بيت النبي ﷺ",
    storyTitleEn: "Why Do You Prohibit What Allah Has Made Lawful? The Honey Oath",
    causeAr: `سبب نزول مطلع السورة في عتاب لطيف للنبي ﷺ: {يَا أَيُّهَا النَّبِيُّ لِمَ تُحَرِّمُ مَا أَحَلَّ اللَّهُ لَكَ ۖ تَبْتَغِي مَرْضَاتَ أَزْوَاجِكَ}.
ثبت في الصحيحين عن عائشة رضي الله عنها أن النبي ﷺ كان يمكث عند زينب بنت جحش ويشرب عندها عسلاً، فتواصت عائشة وحفصة أن تقولا له: إنا نجد منك ريح مغافير! فقال: «بل شربت عسلاً ولن أعود له وقد حلفت»، كما روى النسائي وابن جرير عن أنس وابن عباس قصة تحريم أمته مارية القبطية استرضاءً لحفصة؛ والجمع بينهما أن السورة نزلت لبيان أنه لا يحق لأحد تحريم ما أحل الله له ولو إرضاءً لأهله.`,
    causeEn: `Revealed over the Prophet ﷺ swearing off something lawful to please his wives: {O Prophet, why do you prohibit [yourself from] what Allah has made lawful for you, seeking the approval of your wives?}. Sahih al-Bukhari (4912, 5267) and Sahih Muslim (1474) record via Aishah that he swore off honey after wives teased him about its scent; classical tafsir (an-Nasa'i, al-Tabari) also note a parallel report involving Mariyah al-Qibtiyyah—both illustrating that only Allah defines lawful and forbidden.`,
    sourceAr: "صحيح البخاري (4912، 5267)، صحيح مسلم (1474) عن عائشة رضي الله عنها؛ وسنن النسائي",
    sourceEn: "Sahih al-Bukhari (4912, 5267), Sahih Muslim (1474) via Aishah (RA); Sunan an-Nasa'i",
    lessonAr: `• التشريع في الحل والحرمة لله وحده؛ لا يُحرّم الحلال ولو بيمين أو مراعاة للخواطر.\n• رفق النبي ﷺ بأهله ومكانتهم في بيت النبوة مع حفظ مقام الوحي ومغفرة الله له.`,
    lessonEn: `• Only Allah determines lawful and unlawful; personal vows cannot permanently outlaw what He permitted.\n• The Prophet's ﷺ gentle care for his family operated alongside clear divine guidance.`
  },
  {
    surahNumber: 66,
    startAyah: 2,
    endAyah: 2,
    storyTitleAr: "قد فرض الله لكم تحلة أيمانكم: تشريع كفارة اليمين وحل عقدة التحريم",
    storyTitleEn: "Allah Has Ordained for You the Dissolution of Your Oaths",
    causeAr: `بيان المخرج التشريعي للأيمان ومنها تحريم الحلال: {قَدْ فَرَضَ اللَّهُ لَكُمْ تَحِلَّةَ أَيْمَانِكُمْ ۚ وَاللَّهُ مَوْلَاكُمْ}.
فأبان الله للأمة أن من حلف على ترك مباح أو على تحريم حلال كطعام أو نحوه فلا يصير حراماً، بل يُكفّر عن يمينه الكفارة المشروعة في سورة المائدة ويأتي الذي هو خير.`,
    causeEn: `Clarifying how oaths are resolved legally: {Allah has already ordained for you [Muslims] the dissolution of your oaths. And Allah is your protector, and He is the Knowing, the Wise}. Expressed expiation (kaffarah) frees a person to return to what is good.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير، صحيح البخاري (في كفارة اليمين والتحريم)",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir, Sahih al-Bukhari",
    lessonAr: `• يسر الشريعة في جعل كفارة اليمين مخرجاً لمن تعجل بحلف أو تحريم مباح.\n• تحريم الحلال دون إذن الله لا ينفذ شرعاً وإنما تجب فيه كفارة اليمين.`,
    lessonEn: `• Expiation provides an ethical release from hasty oaths restricting lawful blessings.\n• Allah's legislation remains compassionate, knowing, and wise.`
  },
  {
    surahNumber: 66,
    startAyah: 3,
    endAyah: 3,
    storyTitleAr: "وإذ أسر النبي إلى بعض أزواجه حديثاً: حفظ أسرار البيوت وأدب المعاشرة",
    storyTitleEn: "When the Prophet Confided a Secret to One of His Wives",
    causeAr: `موقف أسري تربوي بليغ في بيت النبوة: {وَإِذْ أَسَرَّ النَّبِيُّ إِلَىٰ بَعْضِ أَزْوَاجِهِ حَدِيثًا فَلَمَّا نَبَّأَتْ بِهِ وَأَظْهَرَهُ اللَّهُ عَلَيْهِ عَرَّفَ بَعْضَهُ وَأَعْرَضَ عَن بَعْضٍ}.
أسرّ النبي ﷺ إلى حفصة رضي الله عنها حديثاً (تحريمه ما حرم أو بشارته بأمر الخلافة على اختلاف الروايات) وأوصاها بكتمانه، فأفشته لعائشة، فأطلعه الله؛ فتأدب ﷺ في العتاب فعرفها ببعض الأمر وأعرض عن ذكر بعضه تكرماً وحياءً.`,
    causeEn: `Highlighting prophetic tact when confidences leaked: {And [remember] when the Prophet confided to one of his wives a statement; and when she informed [another] of it and Allah showed it to him, he made known part of it and ignored a part}. Learning through revelation what transpired, he addressed only part of the slip out of noble restraint.`,
    sourceAr: "صحيح البخاري (4913، 4915)، صحيح مسلم (1479)، تفسير الطبري",
    sourceEn: "Sahih al-Bukhari (4913, 4915), Sahih Muslim (1479), Tafsir al-Tabari",
    lessonAr: `• أمانة المجالس وحفظ أسرار الزوجية ركيزة لاستقرار البيوت.\n• من شيم الكرام في العتاب ألا يستقصي المرء كل الزلات بل يغض الطرف تكرماً (تغافل النبلاء).`,
    lessonEn: `• Confidentiality within households is a sacred trust.\n• Noble leadership exercises graceful restraint rather than airing every fault.`
  },
  {
    surahNumber: 66,
    startAyah: 4,
    endAyah: 4,
    storyTitleAr: "إن تتوبا إلى الله فقد صغت قلوبكما: مراجعة عمر بن الخطاب لحفصة وعائشة ونصرة الله لرسوله",
    storyTitleEn: "If You Two Repent to Allah: Umar's Account of the Two Mothers of Believers",
    causeAr: `توجيه رباني مباشر لأمَّي المؤمنين حفصة وعائشة رضي الله عنهما: {إِن تَتُوبَا إِلَى اللَّهِ فَقَدْ صَغَتْ قُلُوبُكُمَا ۖ وَإِن تَظَاهَرَا عَلَيْهِ فَإِنَّ اللَّهَ هُوَ مَوْلَاهُ وَجِبْرِيلُ وَصَالِحُ الْمُؤْمِنِينَ}.
ثبت في الصحيحين عن ابن عباس أنه سأل عمر بن الخطاب رضي الله عنه: من المرأتان اللتان تظاهرتا على رسول الله ﷺ؟ فما أتم سؤاله حتى قال عمر: عائشة وحفصة! وأكمل قصة اعتزال النبي ﷺ نساءه شهراً في المشربة وتأديبهن ثم عودتهن تائبات راضيات.`,
    causeEn: `A candid spiritual call to reconciliation: {If you two [wives] repent to Allah, [it is best], for your hearts have deviated. But if you cooperate against him—then indeed Allah is his protector, and Gabriel and the righteous of the believers}. Sahih al-Bukhari (4913, 2468) and Sahih Muslim (1479) preserve Umar's direct identification of Aishah and Hafsah, who sincerely repented.`,
    sourceAr: "صحيح البخاري (4913، 2468)، صحيح مسلم (1479) عن عمر وابن عباس رضي الله عنهم",
    sourceEn: "Sahih al-Bukhari (4913, 2468), Sahih Muslim (1479) via Umar & Ibn Abbas (RA)",
    lessonAr: `• فضل التوبة والرجوع السريع إلى الله مهما بلغت مكانة الإنسان في الفضل والقرابة.\n• ولاية الله وجبريل والمؤمنين لرسوله ﷺ تمنع أي تآزر يؤذيه.`,
    lessonEn: `• Swift repentance is honorable regardless of high standing.\n• Divine protection surrounds the Prophet ﷺ in every circumstance.`
  },
  {
    surahNumber: 66,
    startAyah: 5,
    endAyah: 5,
    storyTitleAr: "عسى ربه إن طلقكن أن يبدله أزواجاً خيراً منكن: موافقة قول عمر للوحي وصفات المؤمنة الكاملة",
    storyTitleEn: "Traits of Ideal Believing Women and Umar's Corroborated Counsel",
    causeAr: `بيان الميزان الرباني في خصال المرأة الصالحة: {عَسَىٰ رَبُّهُ إِن طَلَّقَكُنَّ أَن يُبْدِلَهُ أَزْوَاجًا خَيْرًا مِّنكُنَّ مُسْلِمَاتٍ مُّؤْمِنَاتٍ قَانِتَاتٍ تَائِبَاتٍ عَابِدَاتٍ سَائِحَاتٍ}.
وقد ورد في صحيح البخاري ومسلم أن عمر رضي الله عنه قال ذلك ناصحاً لبعض أزواج النبي ﷺ فنزل القرآن موافقاً لقوله؛ ومع تراجعهن وتوبتهن أبقاهن الله أمهات للمؤمنين وحققن هذه الخصال السبع الجليلة.`,
    causeEn: `Enumerating seven virtues of exemplary believing women—submitted, faithful, obedient, repentant, devout, fasting: {Perhaps his Lord, if he divorced you [all], would substitute for him wives better than you...}. Bukhari & Muslim record Umar ibn al-Khattab spoke these exact words advising the Prophet's ﷺ wives right before revelation confirmed it; having repented, they remained honored Mothers of the Believers.`,
    sourceAr: "صحيح البخاري (402، 4916)، صحيح مسلم (2399) عن عمر وأنس رضي الله عنهما",
    sourceEn: "Sahih al-Bukhari (402, 4916), Sahih Muslim (2399) via Umar & Anas (RA)",
    lessonAr: `• الخصال السبع هي مقياس الفضل الحقيقي للمرأة المسلمة: إسلام، إيمان، قنوت، توبة، عبادة، وصيام.\n• حفظ كرامة بيت النبوة وتربيتهم على أولوية طاعة الله على الغيرة والرفاهية.`,
    lessonEn: `• Spiritual devotion, humility, repentance, and fasting define true nobility.\n• Sacred correction refined the prophetic household into an enduring model.`
  },
  {
    surahNumber: 66,
    startAyah: 6,
    endAyah: 6,
    storyTitleAr: "قوا أنفسكم وأهليكم ناراً: مسؤولية الأسرة في التربية والنجاة",
    storyTitleEn: "Protect Yourselves and Your Families From a Fire",
    causeAr: `أمر عام لجميع المؤمنين بعد معالجة قضية البيت النبوي: {يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا وَقُودُهَا النَّاسُ وَالْحِجَارَةُ}.
قال علي وابن عباس في تفسيرها: أدّبوهم وعلّموهم أمر الله ونهيه، ومُروهم بطاعة الله وانهوهم عن معاصيه؛ لتحموهم من نار حرسها ملائكة غلاظ شداد لا يعصون الله أبداً.`,
    causeEn: `Expanding from the prophetic household to every Muslim family: {O you who have believed, protect yourselves and your families from a Fire whose fuel is people and stones, over which are [appointed] angels, harsh and severe}. Ali and Ibn Abbas explained this protection comes through moral instruction and pious example.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير، المستدرك عن علي رضي الله عنه",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir, Al-Mustadrak via Ali (RA)",
    lessonAr: `• مسؤولية الوالدين والأزواج لا تقتصر على الطعام والشراب بل تشمل التربية الدينية والأخلاقية.\n• البداية بوقاية النفس قدوةً عملية تسبق نصح الأهل والأولاد.`,
    lessonEn: `• Family stewardship encompasses moral education and spiritual care, not just material provision.\n• Self-reform provides the essential example for guiding loved ones.`
  },
  {
    surahNumber: 66,
    startAyah: 7,
    endAyah: 7,
    storyTitleAr: "لا تعتذروا اليوم: انقطاع المعاذير الباطلة يوم الجزاء",
    storyTitleEn: "Make No Excuses That Day—You Are Recompensed Only for Your Deeds",
    causeAr: `بيان حال المكذبين حين يُدفعون إلى المصير المحتوم: {يَا أَيُّهَا الَّذِينَ كَفَرُوا لَا تَعْتَذِرُوا الْيَوْمَ ۖ إِنَّمَا تُجْزَوْنَ مَا كُنتُمْ تَعْمَلُونَ}.
فقد انقضى وقت الاختبار والعمل في الدنيا ولم يبق إلا الجزاء العدل المطابق للأعمال.`,
    causeEn: `Describing the moment accountability overtakes stubborn deniers: {O you who have disbelieved, make no excuses that Day. You will only be recompensed for what you used to do}.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir",
    lessonAr: `• قبول العذر والتوبة محله في الدنيا قبل إغلاق صحف الأعمال.\n• تمام العدل الإلهي في مجازاة كل عامل بما كسبت يداه.`,
    lessonEn: `• Earthly life is the sole window for sincere repentance and correction.\n• Final judgment reflects exact, unfailing justice.`
  },
  {
    surahNumber: 66,
    startAyah: 8,
    endAyah: 8,
    storyTitleAr: "توبوا إلى الله توبة نصوحاً: شروط التوبة الصادقة ونور المؤمنين على الصراط",
    storyTitleEn: "Repent With Sincere Repentance: Believers' Light on the Day of Judgment",
    causeAr: `دعوة رحيمة تجمع المؤمنين على التوبة الخالصة: {يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا}.
قال عمر وأُبي بن كعب رضي الله عنهما: التوبة النصوح هي التي يتوب العبد من الذنب ثم لا يعود إليه أبداً كما لا يعود اللبن إلى الضرع؛ وثمرتها تكفير السيئات والنجاة يوم يسعى نور المؤمنين بين أيديهم وبأيمانهم وهم يسألون الله إتمام نورهم.`,
    causeEn: `A sweeping call to wholehearted renewal: {O you who have believed, repent to Allah with sincere repentance}. Umar and Ubayy ibn Ka'b defined Tawbah Nasuh as resolute remorse never intending return to the sin—rewarded with forgiveness, gardens, and guiding light running ahead on Judgment Day.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير، المستدرك عن عمر وأبي بن كعب",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir, Al-Mustadrak",
    lessonAr: `• شروط التوبة النصوح: الإقلاع، والندم، والعزم على عدم العودة، ورد الحقوق.\n• خوف المؤمن على نوره يوم القيامة يدفعه إلى الاستغفار الدائم والتضرع: {رَبَّنَا أَتْمِمْ لَنَا نُورَنَا}.`,
    lessonEn: `• Genuine repentance involves remorse, abandonment, firm resolve, and restitution.\n• Humble believers continually pray for Allah to preserve and perfect their spiritual light.`
  },
  {
    surahNumber: 66,
    startAyah: 9,
    endAyah: 9,
    storyTitleAr: "يا أيها النبي جاهد الكفار والمنافقين: الحزم الشرعي أمام المحاربين والمنافقين",
    storyTitleEn: "Strive Against Aggressive Disbelievers and Hypocrites",
    causeAr: `الأمر باليقظة والحزم القيادي تجاه الأعداء في الداخل والخارج: {يَا أَيُّهَا النَّبِيُّ جَاهِدِ الْكُفَّارَ وَالْمُنَافِقِينَ وَاغْلُظْ عَلَيْهِمْ}.
قال ابن عباس ومفسرو السلف: مجاهدة الكفار المحاربين بالسيف ومجاهدة المنافقين باللسان والحجة وإقامة الحدود وردع المرجفين دون مداهنة.`,
    causeEn: `Instructing resolute leadership against external and internal threats: {O Prophet, strive against the disbelievers and the hypocrites and be harsh upon them}. Classical scholars clarified this meant armed defense against belligerents and firm moral/legal confrontation with deceitful hypocrites.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir",
    lessonAr: `• رحمة القيادة النبوية لا تعني اللين مع المفسدين والمنافقين المتآمرين.\n• مواجهة النفاق تكون بالحجة الواضحة والصرامة الشرعية العادلة.`,
    lessonEn: `• Prophetic compassion is paired with moral firmness against subversion.\n• Hypocrisy is countered through truth, clarity, and accountability.`
  },
  {
    surahNumber: 66,
    startAyah: 10,
    endAyah: 10,
    storyTitleAr: "امرأت نوح وامرأت لوط: مثل الخيانة العقدية وأن النسب الزوجي لا يغني بلا إيمان",
    storyTitleEn: "The Wives of Noah and Lot: Marital Ties Cannot Replace Faith",
    causeAr: `ضرب مثلين في ختام السورة تنبيهاً لأزواج النبي ﷺ ولكل مسلم أن القرابة لا تنفع مع خيانة العقيدة: {ضَرَبَ اللَّهُ مَثَلًا لِّلَّذِينَ كَفَرُوا امْرَأَتَ نُوحٍ وَامْرَأَتَ لُوطٍ كَانَتَا تَحْتَ عَبْدَيْنِ مِنْ عِبَادِنَا صَالِحَيْنِ فَخَانَتَاهُمَا}.
أي خانتا في الدين والتواطؤ مع الكفار (لا في العرض والعفة حاشا للأنبياء)، فلم يدفع نوح ولوط عنهما عذاب الله شيئاً.`,
    causeEn: `Offering two cautionary examples: {Allah presents an example of those who disbelieved: the wife of Noah and the wife of Lot. They were under two of Our righteous servants but betrayed them}. Scholars stress their betrayal was religious—opposing prophetic missions and aiding foes—proving even marriage to a prophet cannot save an unbeliever.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير عن ابن عباس رضي الله عنهما",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir via Ibn Abbas (RA)",
    lessonAr: `• النجاة يوم القيامة بالعمل الصالح والعقيدة السليمة لا بالاتكال على صلاح الزوج أو الأب.\n• الخيانة هنا خيانة الأمانة الدينية والإفشاء مع الأعداء تذكيراً بحفظ حرمة البيوت.`,
    lessonEn: `• Salvation depends on personal faith, not proximity to righteous relatives.\n• Betraying trust and faith strips away borrowed prestige.`
  },
  {
    surahNumber: 66,
    startAyah: 11,
    endAyah: 11,
    storyTitleAr: "امرأت فرعون إذ قالت رب ابن لي عندك بيتاً في الجنة: ثبات آسية بنت مزاحم",
    storyTitleEn: "Pharaoh's Wife Asiyah: Choosing a Home With Allah Over Tyranny",
    causeAr: `المثل المقابل المشرق في سيدة آمنت في بيت أعتى الطغاة: {وَضَرَبَ اللَّهُ مَثَلًا لِّلَّذِينَ آمَنُوا امْرَأَتَ فِرْعَوْنَ إِذْ قَالَتْ رَبِّ ابْنِ لِي عِندَكَ بَيْتًا فِي الْجَنَّةِ}.
فقد تحدت آسية بنت مزاحم طغيان فرعون وآمنت بموسى رغم القصر والملك، وطلبت الجوار قبل الدار («عندك» ثم «بيتاً في الجنة») والنجاة من ظلم فرعون وعمله، وقد صح في حديث ابن عباس وأبي موسى تفضيلها بين كمل النساء.`,
    causeEn: `Contrasting with an inspiring model of courage: {And Allah presents an example of those who believed: the wife of Pharaoh, when she said, "My Lord, build for me near You a house in Paradise and save me from Pharaoh and his deeds"}. Asiyah rejected royal luxury under tyranny, seeking Allah's nearness first.`,
    sourceAr: "صحيح البخاري (3411)، صحيح مسلم (2431)، تفسير الطبري وتفسير ابن كثير",
    sourceEn: "Sahih al-Bukhari (3411), Sahih Muslim (2431), Tafsir al-Tabari & Ibn Kathir",
    lessonAr: `• الجوار الإلهي مقدم على الدار في دعاء المؤمن الصادق: «عندك بيتاً».\n• بيئة الفساد والطغيان لا تمنع الإنسان الصادق من بلوغ أعلى درجات الإيمان.`,
    lessonEn: `• Choosing nearness to Allah ("near You") precedes asking for Paradise itself.\n• Corrupt environments cannot prevent sincere souls from attaining spiritual greatness.`
  },
  {
    surahNumber: 66,
    startAyah: 12,
    endAyah: 12,
    storyTitleAr: "ومريم ابنت عمران التي أحصنت فرجها: قدوة العفة والتصديق والقنوت",
    storyTitleEn: "Mary Daughter of Imran: Paragon of Chastity, Trust, and Devotion",
    causeAr: `ختام السورة بالمثل الأعلى الثاني للمؤمنات والمؤمنين: {وَمَرْيَمَ ابْنَتَ عِمْرَانَ الَّتِي أَحْصَنَتْ فَرْجَهَا فَنَفَخْنَا فِيهِ مِن رُّوحِنَا وَصَدَّقَتْ بِكَلِمَاتِ رَبِّهَا وَكُتُبِهِ}.
عفةٌ بالغة، وتصديق تام بكلمات الله وشرعه، ومداومة على القنوت والطاعة؛ فاستحقت اصطفاء الله وتكريمها في العالمين مع آسية وخديجة وفاطمة كما صح في الحديث.`,
    causeEn: `Concluding with the second supreme female exemplar: {And [the example of] Mary, the daughter of Imran, who guarded her chastity, so We blew into [her garment] through Our angel, and she believed in the words of her Lord and His scriptures and was of the devoutly obedient}.`,
    sourceAr: "صحيح البخاري (3411)، صحيح مسلم (2430)، تفسير الطبري وتفسير ابن كثير",
    sourceEn: "Sahih al-Bukhari (3411), Sahih Muslim (2430), Tafsir al-Tabari & Ibn Kathir",
    lessonAr: `• العفة والصدق والقنوت ترفع المرأة إلى قمة القدوة الإنسانية في القرآن.\n• ختمت السورة بالقدوتين النسائيتين آسية ومريم تكريماً للمرأة الصالحة وتثبيتاً لأهل الإيمان.`,
    lessonEn: `• Chastity, unwavering faith, and devotion raise believers to timeless honor.\n• Ending with Asiyah and Mary celebrates moral courage across every circumstance.`
  }
];
