import { PassageStoryMap } from './asbabNuzulData';

// مقاطع وأسباب نزول وتفاسير سورة الطلاق (At-Talaq) - 12 مقطعاً تفصيلياً تغطي جميع آيات السورة آيةً بآية
export const TALAQ_DETAILED_PASSAGES: PassageStoryMap[] = [
  {
    surahNumber: 65,
    startAyah: 1,
    endAyah: 1,
    storyTitleAr: "فطلقوهن لعدتهن: قصة طلاق عبد الله بن عمر لزوجته في الحيض وأحكام العدة والسكنى",
    storyTitleEn: "Divorce for Their Waiting Period: The Ruling on Ibn Umar's Divorce",
    causeAr: `سبب النزول الصحيح لمطلع السورة: {يَا أَيُّهَا النَّبِيُّ إِذَا طَلَّقْتُمُ النِّسَاءَ فَطَلِّقُوهُنَّ لِعِدَّتِهِنَّ}.
ثبت في الصحيحين عن ابن عمر رضي الله عنهما أنه طلّق امرأته وهي حائض على عهد رسول الله ﷺ، فسأل عمر بن الخطاب رسول الله ﷺ عن ذلك فتغيّظ وقال: «مُره فليراجعها ثم ليمسكها حتى تطهر، ثم تحيض ثم تطهر، ثم إن شاء أمسك بعد وإن شاء طلق قبل أن يمس؛ فتلك العدة التي أمر الله أن يطلق لها النساء» وأمره بإحصاء العدة وبقاء المطلقة الرجعية في بيتها رجاء المراجعة.`,
    causeEn: `Revealed over Ibn Umar divorcing his wife during menstruation: {O Prophet, when you [Muslims] divorce women, divorce them for [the commencement of] their waiting period and keep count of the waiting period}. Sahih al-Bukhari (4908, 5251) and Sahih Muslim (1471) narrate the Prophet ﷺ became indignant, ordering Ibn Umar to take her back until clean, pass another cycle, and only then decide—and forbade evicting waiting wives so reconciliation stays possible.`,
    sourceAr: "صحيح البخاري (4908، 5251)، صحيح مسلم (1471) عن ابن عمر رضي الله عنهما",
    sourceEn: "Sahih al-Bukhari (4908, 5251), Sahih Muslim (1471) via Ibn Umar (RA)",
    lessonAr: `• تقييد الطلاق بالسنة والهدوء (في طهر بلا جماع) يمنح فرصة للتروي ويمنع التهور.\n• بقاء الزوجة المعتدة في بيت الزوجية حفظٌ لكرامتها وتيسيرٌ للمصالحة.`,
    lessonEn: `• Sunnah timing in divorce prevents impulsive breakups and protects women's dignity.\n• Keeping waiting wives at home preserves space for reconciliation.`
  },
  {
    surahNumber: 65,
    startAyah: 2,
    endAyah: 2,
    storyTitleAr: "ومن يتق الله يجعل له مخرجاً: الإشهاد في الرجعة والفرقة ووعد المخرج للمتقين",
    storyTitleEn: "Whoever Fears Allah—He Will Make for Him a Way Out",
    causeAr: `توجيه الأزواج عند قرب انقضاء العدة إما بالإمساك بالمعروف أو الفراق بإحسان مع الإشهاد درءاً للنزاع: {فَإِذَا بَلَغْنَ أَجَلَهُنَّ فَأَمْسِكُوهُنَّ بِمَعْرُوفٍ أَوْ فَارِقُوهُنَّ بِمَعْرُوفٍ وَأَشْهِدُوا ذَوَيْ عَدْلٍ مِّنكُمْ}.
ثم ختمت بوعد عام عظيم {وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا}؛ وذكر المفسرون كالواحدي وابن كثير فيه قصة عوف بن مالك الأشجعي حين أُسر ابنه فأوصاه النبي ﷺ بتقوى الله والإكثار من «لا حول ولا قوة إلا بالله» ففرّج الله كربه، واللفظ عام لكل من التزم حدود الله في أسرته ومعاشه.`,
    causeEn: `Mandating either honorable reconciliation or dignified separation with just witnesses as the waiting term nears completion, crowned by the universal promise: {And whoever fears Allah—He will make for him a way out}. Classical Tafsir (Al-Wahidi, Ibn Kathir) also cite the story of Awf ibn Malik al-Ashja'i whose captive son returned safely through piety and supplication.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير، أسباب النزول للواحدي",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir, Asbab al-Nuzul by Al-Wahidi",
    lessonAr: `• الشريعة تصون الأسرة بالمعروف سواء عند استمرار الزواج أو عند إنهائه.\n• تقوى الله والوقوف عند حدوده في الخلافات الزوجية تفتح أبواب الفرج والمخرج.`,
    lessonEn: `• Justice and kindness govern both marriage and respectful separation.\n• Conscientious obedience to Allah opens unexpected relief in every crisis.`
  },
  {
    surahNumber: 65,
    startAyah: 3,
    endAyah: 3,
    storyTitleAr: "ومن يتوكل على الله فهو حسبه: الرزق من حيث لا يحتسب وكفاية التوكل",
    storyTitleEn: "He Provides From Where He Does Not Expect, and Allah Is Sufficient",
    causeAr: `إكمال البشارة القلبية لمن يخشون الفقر أو الضيق بسبب الالتزام بأحكام الله: {وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ}.
فالله كافٍ من فوض أمره إليه، ومبلّغ ما قضاه في وقته المقدّر لكل شدة ورخاء.`,
    causeEn: `Completing reassurance for those fearing financial strain from upholding sacred duties: {And will provide for him from where he does not expect. And whoever relies upon Allah—then He is sufficient for him}.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير، تفسير السعدي",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir, Tafsir al-Sa'di",
    lessonAr: `• الرزق لا ينحصر في الأسباب المألوفة بل يسوقه الله للمتقي من أبواب لا تخطر بباله.\n• كمال التوكل على الله يغرس السكينة والصبر حتى يحين الفرج المقدّر.`,
    lessonEn: `• Provision reaches the God-conscious through unforeseen avenues.\n• Deep reliance on Allah brings patience until His appointed relief arrives.`
  },
  {
    surahNumber: 65,
    startAyah: 4,
    endAyah: 4,
    storyTitleAr: "وأولات الأحمال أجلهن أن يضعن حملهن: قصة سبيعة الأسلمية وعدة الحامل واليائسة",
    storyTitleEn: "Subay'ah al-Aslamiyyah and the Waiting Period of Pregnant Women",
    causeAr: `بيان بقية أحكام العدد النسائية: {وَاللَّائِي يَئِسْنَ مِنَ الْمَحِيضِ مِن نِّسَائِكُمْ إِنِ ارْتَبْتُمْ فَعِدَّتُهُنَّ ثَلَاثَةُ أَشْهُرٍ وَاللَّائِي لَمْ يَحِضْنَ ۚ وَأُولَاتُ الْأَحْمَالِ أَجَلُهُنَّ أَن يَضَعْنَ حَمْلَهُنَّ}.
ثبت في الصحيحين عن سبيعة الأسلمية رضي الله عنها أنها كانت حاملاً فتوفي عنها زوجها سعد بن خولة في حجة الوداع، فلم تمكث إلا ليالي حتى وضعت، فأفتاها النبي ﷺ بأنها قد حلّت بالوضع وأذن لها في الزواج.`,
    causeEn: `Clarifying remaining waiting-period rulings (three months where menstruation has ceased or not begun, and childbirth for pregnant women): {And for those who are pregnant, their term is until they give birth}. Sahih al-Bukhari (4909, 5318) & Sahih Muslim (1484) confirm Subay'ah al-Aslamiyyah gave birth shortly after her husband died, and the Prophet ﷺ ruled her waiting period ended upon delivery.`,
    sourceAr: "صحيح البخاري (4909، 5318)، صحيح مسلم (1484) عن سبيعة الأسلمية رضي الله عنها",
    sourceEn: "Sahih al-Bukhari (4909, 5318), Sahih Muslim (1484) via Subay'ah al-Aslamiyyah (RA)",
    lessonAr: `• يسر الشريعة ورفع التباس العدة عن النساء ذوات الأحوال الخاصة بوضع الحمل أو الأشهر.\n• اقتران كل حكم أسري بالتقوى: {وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مِنْ أَمْرِهِ يُسْرًا}.`,
    lessonEn: `• Clear legal rulings remove uncertainty around women's waiting periods.\n• Taqwa repeatedly turns complex duties into ease and clarity.`
  },
  {
    surahNumber: 65,
    startAyah: 5,
    endAyah: 5,
    storyTitleAr: "ذلك أمر الله أنزله إليكم: تعظيم تشريع الله وتكفير السيئات للمتقين",
    storyTitleEn: "That Is the Command of Allah Sent Down to You",
    causeAr: `توكيد قدسية هذه الأحكام الأسرية وربطها بمضاعفة الأجر: {ذَٰلِكَ أَمْرُ اللَّهِ أَنزَلَهُ إِلَيْكُمْ ۚ وَمَن يَتَّقِ اللَّهَ يُكَفِّرْ عَنْهُ سَيِّئَاتِهِ وَيُعْظِمْ لَهُ أَجْرًا}.
ليدرك المسلم أن الالتزام بأحكام الطلاق والعدة عبادة عظيمة تُكفّر بها الخطايا ويُعظم بها الثواب.`,
    causeEn: `Underscoring the sacred authority of family laws: {That is the command of Allah, which He has sent down to you; and whoever fears Allah—He will remove for him his misdeeds and make great for him his reward}.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir",
    lessonAr: `• أحكام الأسرة في الإسلام شريعة منزلة من عند الله وليست مجرد أعراف اجتماعية.\n• الامتثال لهذه الأحكام يمحو السيئات ويعظم الأجر يوم القيامة.`,
    lessonEn: `• Family ethics carry the weight of sacred worship, not mere custom.\n• Observing these boundaries brings forgiveness and great reward.`
  },
  {
    surahNumber: 65,
    startAyah: 6,
    endAyah: 6,
    storyTitleAr: "أسكنوهن من حيث سكنتم: حقوق المطلقة في السكن والنفقة وأجرة الرضاع",
    storyTitleEn: "Lodge Them Where You Dwell: Housing, Maintenance, and Nursing Rights",
    causeAr: `تفصيل الحقوق المادية للمعتدة والأم المرضعة حفظاً لكرامتها والولد: {أَسْكِنُوهُنَّ مِنْ حَيْثُ سَكَنتُم مِّن وُجْدِكُمْ وَلَا تُضَارُّوهُنَّ لِتُضَيِّقُوا عَلَيْهِنَّ}.
فنهى الأزواج عن مضايقة المعتدات في المسكن أو النفقة، وأوجب النفقة على الحامل حتى تضع، وإعطاء المطلقة أجرة إرضاع ولدها بالتشاور بالمعروف أو استئجار مرضع أخرى دون إكراه.`,
    causeEn: `Guaranteeing housing, support, and nursing wages for divorced mothers: {Lodge them [in a section] of where you dwell out of your means and do not harm them in order to oppress them}. Spouses must not squeeze them out, must support pregnant mothers through birth, and must compensate nursing mothers fairly.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير، تفسير القرطبي",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir, Tafsir al-Qurtubi",
    lessonAr: `• النهي القاطع عن استغلال حقوق السكن والنفقة للإضرار بالمرأة أو ابتزازها.\n• رعاية مصلحة الطفل بالمعروف والتشاور السلمي حتى بعد وقوع الطلاق.`,
    lessonEn: `• Coercing or mistreating divorced wives through housing or support is forbidden.\n• Mutual consultation protects a child's welfare even after separation.`
  },
  {
    surahNumber: 65,
    startAyah: 7,
    endAyah: 7,
    storyTitleAr: "سيجعل الله بعد عسر يسراً: عدل التكليف المالي وبشارة اليسر بعد العسر",
    storyTitleEn: "Let the Man of Wealth Spend According to His Means; After Hardship Comes Ease",
    causeAr: `وضع الميزان العادل للنفقة الأسرية بحسب حال الزوج: {لِيُنفِقْ ذُو سَعَةٍ مِّن سَعَتِهِ ۖ وَمَن قُدِرَ عَلَيْهِ رِزْقُهُ فَلْيُنفِقْ مِمَّا آتَاهُ اللَّهُ}.
فالموسر ينفق بسعته والفقير على قدر رزقه لأن الله لا يكلف نفساً إلا وسعها، وبشّر الله بأن العسر يعقبه يسر وفرج.`,
    causeEn: `Establishing proportionate maintenance obligations: {Let a man of wealth spend from his wealth, and he whose provision is restricted—let him spend from what Allah has given him. Allah does not charge a soul except [according to] what He has given it. Allah will bring about, after hardship, ease}.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير، تفسير السعدي",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir, Tafsir al-Sa'di",
    lessonAr: `• الواقعية والتوازن في تقدير النفقات دون تقتير من الغني أو إرهاق للفقير.\n• اليقين القلبي بوعد الله الصادق أن كل عسر مآله إلى يسر.`,
    lessonEn: `• Financial obligations remain fair and proportionate to actual capacity.\n• Hope-filled certainty that hardship inevitably gives way to divine ease.`
  },
  {
    surahNumber: 65,
    startAyah: 8,
    endAyah: 8,
    storyTitleAr: "وكأين من قرية عتت عن أمر ربها: تحذير من الاستخفاف بحدود الله",
    storyTitleEn: "How Many a City Insolently Rebelled Against the Command of Its Lord",
    causeAr: `ربط الالتزام بأحكام الأسرة والشرع بسنة الله في الأمم: {وَكَأَيِّن مِّن قَرْيَةٍ عَتَتْ عَنْ أَمْرِ رَبِّهَا وَرُسُلِهِ فَحَاسَبْنَاهَا حِسَابًا شَدِيدًا}.
فإن القرى التي تمردت واستخفت بأوامر الله ورسله عوقبت بالحساب الشديد والعذاب المنكر.`,
    causeEn: `Linking family ethics to universal moral accountability: {And how many a city was insolent toward the command of its Lord and His messengers, so We took it to severe account and punished it with a terrible punishment}.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir",
    lessonAr: `• الاستهانة بحدود الله في الأحكام الاجتماعية والشخصية تقود إلى هلاك المجتمعات.\n• حفظ أوامر الشرع صمام أمان للأفراد والبلاد.`,
    lessonEn: `• Flouting divine limits erodes social stability and invites ruin.\n• Reverence for moral law safeguards entire communities.`
  },
  {
    surahNumber: 65,
    startAyah: 9,
    endAyah: 9,
    storyTitleAr: "فذاقت وبال أمرها: عاقبة التمرد والخسران المبين",
    storyTitleEn: "So It Tasted the Bad Consequence of Its Affair, and Its Outcome Was Loss",
    causeAr: `بيان نتيجة العتو والمعصية لتلك القرى الهالكة: {فَذَاقَتْ وَبَالَ أَمْرِهَا وَكَانَ عَاقِبَةُ أَمْرِهَا خُسْرًا}.
أي تجرعت ثقل سوء صنيعها وانقلب كبرها إلى خسران تام في الدنيا والآخرة.`,
    causeEn: `Describing the inevitable collapse of defiant societies: {So it tasted the bad consequence of its affair, and the outcome of its affair was loss}.`,
    sourceAr: "تفسير الطبري، تفسير الجلالين",
    sourceEn: "Tafsir al-Tabari, Tafsir al-Jalalayn",
    lessonAr: `• كل معصية يتبعها وبالها وثقل عاقبتها وإن تأخر قليلاً.\n• النظر في العواقب يعصم من الاغترار بالقوة أو المهلة.`,
    lessonEn: `• Rebellion carries bitter fruit even when delayed.\n• Looking toward final outcomes guards against reckless pride.`
  },
  {
    surahNumber: 65,
    startAyah: 10,
    endAyah: 10,
    storyTitleAr: "فاتقوا الله يا أولي الألباب: نداء أصحاب العقول النيرة لقبول الذكر",
    storyTitleEn: "Fear Allah, O People of Understanding—Allah Has Sent Down a Reminder",
    causeAr: `تحويل الوعيد إلى دعوة لأصحاب العقول المستنيرة: {أَعَدَّ اللَّهُ لَهُمْ عَذَابًا شَدِيدًا ۖ فَاتَّقُوا اللَّهَ يَا أُولِي الْأَلْبَابِ الَّذِينَ آمَنُوا ۚ قَدْ أَنزَلَ اللَّهُ إِلَيْكُمْ ذِكْرًا}.
فنداء «يا أولي الألباب» يربط العقل الواعي بتقوى الله والاهتداء بالقرآن الكريم.`,
    causeEn: `Appealing to sound intellects after the warning: {Allah has prepared for them a severe punishment; so fear Allah, O you of understanding who have believed. Allah has sent down to you a message}.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir",
    lessonAr: `• العقل السليم هو الذي يقود صاحبه إلى تقوى الله والتمسك بالوحي.\n• وصف القرآن بالذكر لأنه يوقظ القلوب الغافلة ويذكرها بربها.`,
    lessonEn: `• True intelligence leads to reverent consciousness of Allah.\n• Revelation serves as an awakening reminder for thoughtful minds.`
  },
  {
    surahNumber: 65,
    startAyah: 11,
    endAyah: 11,
    storyTitleAr: "رسولاً يتلو عليكم آيات الله مبينات: إخراج المؤمنين من الظلمات إلى النور",
    storyTitleEn: "A Messenger Reciting Clear Verses to Bring Believers From Darkness to Light",
    causeAr: `بيان المراد من الذكر والرسالة المحمدية: {رَّسُولًا يَتْلُو عَلَيْكُمْ آيَاتِ اللَّهِ مُبَيِّنَاتٍ لِّيُخْرِجَ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ مِنَ الظُّلُمَاتِ إِلَى النُّورِ}.
فمن آمن وعمل صالحاً أخرجه الله من ظلمات الجهل والظلم إلى نور الهداية وأدخله جنات تجري من تحتها الأنهار وقد أحسن له الرزق الدائم.`,
    causeEn: `Elaborating the Messenger's mission of transformation: {[He sent] a Messenger reciting to you the distinct verses of Allah that He may bring out those who believe and do righteous deeds from darknesses into the light}. Faith coupled with good deeds leads to eternal gardens and noble provision.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير، تفسير السعدي",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir, Tafsir al-Sa'di",
    lessonAr: `• مهمة الرسول والوحي إخراج البشرية من ظلمات الحيرة والظلم إلى نور الوضوح والعدل.\n• حسن رزق الله في الجنة دائم لا ينقطع بعكس متاع الدنيا الزائل.`,
    lessonEn: `• Prophetic teaching rescues humanity from confusion into illuminating clarity.\n• Eternal provision in Paradise never fades.`
  },
  {
    surahNumber: 65,
    startAyah: 12,
    endAyah: 12,
    storyTitleAr: "الله الذي خلق سبع سماوات ومن الأرض مثلهن: ختم السورة بعظمة الخلق والعلم والقدرة",
    storyTitleEn: "Allah Who Created Seven Heavens and of the Earth the Like of Them",
    causeAr: `خاتمة مهيبة تربط شرائع الأسرة في الدنيا بجلال الكون وتدبير الوحي: {اللَّهُ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ وَمِنَ الْأَرْضِ مِثْلَهُنَّ يَتَنَزَّلُ الْأَمْرُ بَيْنَهُنَّ}.
فخالق السبع الطباق والسبع الأرضين هو الذي ينزّل أوامره الكونية والتشريعية بينهن لتعلموا أن الله على كل شيء قدير وأنه أحاط بكل شيء علماً.`,
    causeEn: `Closing the Surah by anchoring family legislation in cosmic majesty: {It is Allah who has created seven heavens and of the earth, the like of them. [His] command descends among them so you may know that Allah is over all things competent and that Allah has encompassed all things in knowledge}.`,
    sourceAr: "تفسير الطبري، تفسير ابن كثير، صحيح البخاري (في ذكر السبع أرضين)",
    sourceEn: "Tafsir al-Tabari, Tafsir Ibn Kathir, Sahih al-Bukhari",
    lessonAr: `• الذي دبر السماوات السبع والأرضين السبع أحكم تشريعات الأسرة بكمال علمه وقدرته.\n• اليقين بإحاطة علم الله وقدرته يبعث على التسليم التام لأحكامه.`,
    lessonEn: `• The Designer of seven heavens and earths crafted human laws with absolute wisdom.\n• Recognizing Allah's limitless knowledge and power inspires serene compliance.`
  }
];
