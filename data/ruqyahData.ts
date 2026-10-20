// Complete authentic Ruqyah Data (Verses & Prophetic Supplications) with full Arabic & English support

export interface RuqyahItem {
  id: string;
  type: 'quran' | 'sunnah';
  title: string;
  titleEn: string;
  text: string;
  textEn: string;
  source: string;
  sourceEn: string;
}

export interface RuqyahGuideStep {
  number: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

export const RUQYAH_GUIDE_STEPS: RuqyahGuideStep[] = [
  {
    "number": 1,
    "titleAr": "الوضوء والطهارة الكاملة:",
    "titleEn": "Complete Ablution (Wudu) & Sincerity:",
    "descAr": "استحضر النية الخالصة لله وحده بأن الشفاء بيده سبحانه، وتوضأ وضوءك للصلاة.",
    "descEn": "Purify your intention solely for Allah knowing that healing is in His Hands alone, and perform complete ablution as for prayer."
  },
  {
    "number": 2,
    "titleAr": "الالتقاء والمسح والنفث:",
    "titleEn": "Cupping Hands, Reciting, Nafth & Wiping:",
    "descAr": "اجمع كفيك واقرأ فيهما سورة الفاتحة وآية الكرسي والمعوذات، ثم انفث فيهما (نفخ خفيف رقيق مع رذاذ يسير) وامسح بهما وجهك ورأسك وما أقبل من جسدك.",
    "descEn": "Cup your hands together and recite Surah Al-Fatihah, Ayat Al-Kursi, and the Mu'awwidhat (Al-Ikhlas, Al-Falaq, An-Nas), then gently blow into them with a fine breath (nafth), and wipe over your face, head, and the front of your body."
  },
  {
    "number": 3,
    "titleAr": "الرقية على الماء وزيت الزيتون:",
    "titleEn": "Ruqyah over Water and Olive Oil:",
    "descAr": "قرّب إناء ماء أو زيت زيتون من فمك أثناء قراءة آيات الرقية الشرعية، ثم انفث فيه بعد الانتهاء، واشرب من الماء وامسح أو ادهن مواضع الألم بزيت الزيتون.",
    "descEn": "Bring a vessel of pure water or olive oil close to your mouth while reciting Ruqyah verses, then breathe lightly into it upon finishing. Drink from the water and apply or massage the oil over areas of pain."
  },
  {
    "number": 4,
    "titleAr": "وضع اليد على موضع الوجع:",
    "titleEn": "Placing the Right Hand on the Place of Pain:",
    "descAr": "وضع يدك اليمنى على موضع الألم من جسدك، وركز قلبك ويقينك على قدرة الله في الشفاء، ثم ردد الأذكار النبوية المقررة.",
    "descEn": "Place your right hand on the location of pain on your body, fix your heart and certitude on Allah's absolute power to heal, then repeat the prescribed Prophetic supplications."
  },
  {
    "number": 5,
    "titleAr": "الاستمرارية والمحافظة:",
    "titleEn": "Consistency & Daily Fortification:",
    "descAr": "كرر الرقية يومياً وخاصة في الصباح والمساء، وحافظ بانتظام على أذكار اليوم والليلة لتبقى في حصن إلهي منيع ومستمر.",
    "descEn": "Repeat the Ruqyah daily, especially in the morning and evening, and consistently maintain your daily morning and evening Adhkar to remain within a steadfast divine fortress."
  }
];

export const RUQYAH_DATA: RuqyahItem[] = [
  {
    "id": "rq_quran_1",
    "type": "quran",
    "title": "سورة الفاتحة (أم الكتاب والشافية والسبع المثاني)",
    "titleEn": "Surah Al-Fatihah (The Opening & The Cure)",
    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (١) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (٢) الرَّحْمَٰنِ الرَّحِيمِ (٣) مَالِكِ يَوْمِ الدِّينِ (٤) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (٥) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (٦) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (٧)",
    "textEn": "In the name of Allah, the Entirely Merciful, the Especially Merciful. (1) [All] praise is [due] to Allah, Lord of the worlds - (2) The Entirely Merciful, the Especially Merciful, (3) Sovereign of the Day of Recompense. (4) It is You we worship and You we ask for help. (5) Guide us to the straight path - (6) The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (7)",
    "source": "سورة الفاتحة: الآيات ١ - ٧",
    "sourceEn": "Surah Al-Fatihah: Verses 1-7"
  },
  {
    "id": "rq_quran_2",
    "type": "quran",
    "title": "سورة البقرة (الآيات ١ - ٥)",
    "titleEn": "Surah Al-Baqarah (Verses 1 - 5)",
    "text": "الم (١) ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِلْمُتَّقِينَ (٢) الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ (٣) وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ (٤) أُولَٰئِكَ عَلَىٰ هُدًى مِنْ رَبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ (٥)",
    "textEn": "Alif, Lam, Meem. (1) This is the Book about which there is no doubt, a guidance for those conscious of Allah - (2) Who believe in the unseen, establish prayer, and spend out of what We have provided for them, (3) And who believe in what has been revealed to you, [O Muhammad], and what was revealed before you, and of the Hereafter they are certain [in faith]. (4) Those are upon [right] guidance from their Lord, and it is those who are the successful. (5)",
    "source": "سورة البقرة: الآيات ١ - ٥",
    "sourceEn": "Surah Al-Baqarah: Verses 1-5"
  },
  {
    "id": "rq_quran_3",
    "type": "quran",
    "title": "آية الكرسي (آية التحصين والوقاية العظمى - البقرة ٢٥٥)",
    "titleEn": "Ayat Al-Kursi (The Greatest Verse of Protection - Al-Baqarah 255)",
    "text": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    "textEn": "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    "source": "سورة البقرة: آية الكرسي (٢٥٥)",
    "sourceEn": "Surah Al-Baqarah: Ayat Al-Kursi (255)"
  },
  {
    "id": "rq_quran_4",
    "type": "quran",
    "title": "أواخر سورة البقرة (الآيات ٢٨٤ - ٢٨٦)",
    "titleEn": "End of Surah Al-Baqarah (Verses 284 - 286)",
    "text": "لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ وَإِنْ تُبْدُوا مَا فِي أَنْفُسِكُمْ أَوْ تُخْفُوهُ يُحَاسِبْكُمْ بِهِ اللَّهُ ۖ فَيَغْفِرُ لِمَنْ يَشَاءُ وَيُعَذِّبُ مَنْ يَشَاءُ ۗ وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (٢٨٤) آمَنَ الرَّسُولُ بِمَا أُنْزلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ (٢٨٥) لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ (٢٨٦)",
    "textEn": "To Allah belongs whatever is in the heavens and whatever is in the earth. Whether you show what is within yourselves or conceal it, Allah will bring you to account for it. Then He will forgive whom He wills and punish whom He wills, and Allah is over all things competent. (284) The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers. All of them have believed in Allah and His angels and His books and His messengers, [saying], 'We make no distinction between any of His messengers.' And they say, 'We hear and we obey. [We seek] Your forgiveness, our Lord, and to You is the [final] destination.' (285) Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned. 'Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people.' (286)",
    "source": "سورة البقرة: الآيات ٢٨٤ - ٢٨٦",
    "sourceEn": "Surah Al-Baqarah: Verses 284-286"
  },
  {
    "id": "rq_quran_5",
    "type": "quran",
    "title": "سورة البقرة (الآية ١٠٢ - كفاية الله ورد كيد السحر)",
    "titleEn": "Surah Al-Baqarah (Verse 102 - Breaking Magic by Allah's Will)",
    "text": "وَمَا هُمْ بِضَارِّينَ بِهِ مِنْ أَحَدٍ إِلَّا بِإِذْنِ اللَّهِ ۚ وَيَتَعَلَّمُونَ مَا يَضُرُّهُمْ وَلَا يَنْفَعُهُمْ ۚ وَلَقَدْ عَلِمُوا لَمَنِ اشْتَرَاهُ مَا لَهُ فِي الْآخِرَةِ مِنْ خَلَاقٍ ۚ وَلَبِئْسَ مَا شَرَوْا بِهِ أَنْفُسَهُمْ ۚ لَوْ كَانُوا يَعْلَمُونَ",
    "textEn": "And they could not harm anyone through it except by permission of Allah. And the people learn what harms them and does not benefit them. But they certainly knew that whoever purchased the art would not have in the Hereafter any share. And wretched is that for which they sold themselves, if they only knew.",
    "source": "سورة البقرة: آية ١٠٢",
    "sourceEn": "Surah Al-Baqarah: Verse 102"
  },
  {
    "id": "rq_quran_6",
    "type": "quran",
    "title": "سورة البقرة (الآيتان ١٦٣ - ١٦٤ - آية الوحدانية والرحمة)",
    "titleEn": "Surah Al-Baqarah (Verses 163 - 164 - Divine Oneness & Mercy)",
    "text": "وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ لَا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ (١٦٣) إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ وَالْفُلْكِ الَّتِي تَجْرِي فِي الْبَحْرِ بِمَا يَنْفَعُ النَّاسَ وَمَا أَنْزَلَ اللَّهُ مِنَ السَّمَاءِ مِنْ مَاءٍ فَأَحْيَا بِهِ الْأَرْضَ بَعْدَ مَوْتِهَا وَبَثَّ فِيهَا مِنْ كُلِّ دَابَّةٍ وَتَصْرِيفِ الرِّيَاحِ وَالسَّحَابِ الْمُسَخَّرِ بَيْنَ السَّمَاءِ وَالْأَرْضِ لَآيَاتٍ لِقَوْمٍ يَعْقِلُونَ (١٦٤)",
    "textEn": "And your god is one God. There is no deity [worthy of worship] except Him, the Entirely Merciful, the Especially Merciful. (163) Indeed, in the creation of the heavens and earth, and the alternation of the night and the day, and the [great] ships which sail through the sea with that which benefits people, and what Allah has sent down from the heavens of rain, giving life thereby to the earth after its lifelessness and dispersing therein every [kind of] moving creature, and [His] directing of the winds and the clouds controlled between the heaven and the earth are signs for a people who use reason. (164)",
    "source": "سورة البقرة: الآيتان ١٦٣ - ١٦٤",
    "sourceEn": "Surah Al-Baqarah: Verses 163-164"
  },
  {
    "id": "rq_quran_7",
    "type": "quran",
    "title": "سورة آل عمران (الآيتان ١٨ - ١٩ - شهادة التوحيد والعدل)",
    "titleEn": "Surah Ali 'Imran (Verses 18 - 19 - Testifying to Divine Justice)",
    "text": "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ ۚ لَا إِلَٰهَ إِلَّا هُوَ الْعَزِيزُ الْحَكِيمُ (١٨) إِنَّ الدِّينَ عِنْدَ اللَّهِ الْإِسْلَامُ",
    "textEn": "Allah witnesses that there is no deity except Him, and [so do] the angels and those of knowledge - [that He is] maintaining [creation] in justice. There is no deity except Him, the Exalted in Might, the Wise. (18) Indeed, the religion in the sight of Allah is Islam.",
    "source": "سورة آل عمران: الآيتان ١٨ - ١٩",
    "sourceEn": "Surah Ali 'Imran: Verses 18-19"
  },
  {
    "id": "rq_quran_8",
    "type": "quran",
    "title": "سورة آل عمران (الآيات ١٩٠ - ١٩٤ - التفكر والسكينة ودعاء المؤمنين)",
    "titleEn": "Surah Ali 'Imran (Verses 190 - 194 - Contemplation & Supplication)",
    "text": "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِأُولِي الْأَلْبَابِ (١٩٠) الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ (١٩١) رَبَّنَا إِنَّكَ مَنْ تُدْخِلِ النَّارَ فَقَدْ أَخْزَيْتَهُ ۖ وَمَا لِلظَّالِمِينَ مِنْ أَنْصَارٍ (١٩٢) رَبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلْإِيمَانِ أَنْ آمِنُوا بِرَبِّكُمْ فَآمَنَّا ۚ رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الْأَبْرَارِ (١٩٣) رَبَّنَا وَآتِنَا مَا وَعَدْتَنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ ۗ إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ (١٩٤)",
    "textEn": "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding (190) Who remember Allah while standing or sitting or [lying] on their sides and give thought to the creation of the heavens and the earth, [saying], 'Our Lord, You did not create this aimlessly; exalted are You [above such a thing]; then protect us from the punishment of the Fire. (191) Our Lord, indeed whoever You admit to the Fire - You have disgraced him, and for the wrongdoers there are no helpers. (192) Our Lord, indeed we have heard a caller calling to faith, [saying], 'Believe in your Lord,' and we have believed. Our Lord, so forgive us our sins and remove from us our misdeeds and cause us to die with the righteous. (193) Our Lord, and grant us what You promised us through Your messengers and do not disgrace us on the Day of Resurrection. Indeed, You do not fail in [Your] promise.' (194)",
    "source": "سورة آل عمران: الآيات ١٩٠ - ١٩٤",
    "sourceEn": "Surah Ali 'Imran: Verses 190-194"
  },
  {
    "id": "rq_quran_9",
    "type": "quran",
    "title": "سورة النساء (الآية ٥٤ - كبت عين الحاسدين ورد كيدهم)",
    "titleEn": "Surah An-Nisa (Verse 54 - Repelling Envy and Evil Eye)",
    "text": "أَمْ يَحْسُدُونَ النَّاسَ عَلَىٰ مَا آتَاهُمُ اللَّهُ مِنْ فَضْلِهِ ۖ فَقَدْ آتَيْنَا آلَ إِبْرَاهِيمَ الْكِتَابَ وَالْحِكْمَةَ وَآتَيْنَاهُمْ مُلْكًا عَظِيمًا",
    "textEn": "Or do they envy people for what Allah has given them of His bounty? But We had already given the family of Abraham the Scripture and wisdom and conferred upon them a great kingdom.",
    "source": "سورة النساء: آية ٥٤",
    "sourceEn": "Surah An-Nisa: Verse 54"
  },
  {
    "id": "rq_quran_10",
    "type": "quran",
    "title": "سورة الأعراف (الآيات ٥٤ - ٥٦ - عظمة الخالق وسؤال العافية)",
    "titleEn": "Surah Al-A'raf (Verses 54 - 56 - The Creator's Glory & Humility)",
    "text": "إِنَّ رَبَّكُمُ اللَّهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ فِي سِتَّةِ أَيَّامٍ ثُمَّ اسْتَوَىٰ عَلَى الْعَرْشِ يُغْشِي اللَّيْلَ النَّهَارَ يَطْلُبُهُ حَثِيثًا وَالشَّمْسَ وَالْقَمَرَ وَالنُّجُومَ مُسَخَّرَاتٍ بِأَمْرِهِ ۗ أَلَا لَهُ الْخَلْقُ وَالْأَمْرُ ۗ تَبَارَكَ اللَّهُ رَبُّ الْعَالَمِينَ (٥٤) ادْعُوا رَبَّكُمْ تَضَرُّعًا وَخُفْيَةً ۚ إِنَّهُ لَا يُحِبُّ الْمُعْتَدِينَ (٥٥) وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا وَادْعُوهُ خَوْفًا وَطَمَعًا ۚ إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِنَ الْمُحْسِنِينَ (٥٦)",
    "textEn": "Indeed, your Lord is Allah, who created the heavens and earth in six days and then established Himself above the Throne. He covers the night with the day, [another night] chasing it rapidly; and [He created] the sun, the moon, and the stars, subjected by His command. Unquestionably, His is the creation and the command; blessed is Allah, Lord of the worlds. (54) Call upon your Lord in humility and privately; indeed, He does not like transgressors. (55) And cause not corruption upon the earth after its reformation. And invoke Him in fear and aspiration. Indeed, the mercy of Allah is near to the doers of good. (56)",
    "source": "سورة الأعراف: الآيات ٥٤ - ٥٦",
    "sourceEn": "Surah Al-A'raf: Verses 54-56"
  },
  {
    "id": "rq_quran_11",
    "type": "quran",
    "title": "آيات إبطال السحر والعين (سورة الأعراف: الآيات ١١٧ - ١٢٢)",
    "titleEn": "Surah Al-A'raf (Verses 117 - 122 - Nullifying Sorcery & Plots)",
    "text": "وَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنْ أَلْقِ عَصَاكَ ۖ فَإِذَا هِيَ تَلْقَفُ مَا يَأْفِكُونَ (١١٧) فَوَقَعَ الْحَقُّ وَبَطَلَ مَا كَانُوا يَعْمَلُونَ (١١٨) فَغُلِبُوا هُنَالِكَ وَانْقَلَبُوا صَاغِرِينَ (١١٩) وَأُلْقِيَ السَّحَرَةُ سَاجِدِينَ (١٢٠) قَالُوا آمَنَّا بِرَبِّ الْعَالَمِينَ (١٢١) رَبِّ مُوسَىٰ وَهَارُونَ (١٢٢)",
    "textEn": "And We inspired to Moses, 'Throw your staff,' and at once it devoured what they were falsifying. (117) So the truth was established, and abolished was what they were doing. (118) And [Pharaoh and his people] were overcome right there and became debased. (119) And the magicians fell down in prostration. (120) They said, 'We have believed in the Lord of the worlds, (121) The Lord of Moses and Aaron.' (122)",
    "source": "سورة الأعراف: الآيات ١١٧ - ١٢٢",
    "sourceEn": "Surah Al-A'raf: Verses 117-122"
  },
  {
    "id": "rq_quran_12",
    "type": "quran",
    "title": "سورة يونس (الآيتان ٥٧ - ٥٨ - موعظة وشفاء لما في الصدور)",
    "titleEn": "Surah Yunus (Verses 57 - 58 - Healing for the Breasts)",
    "text": "يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُمْ مَوْعِظَةٌ مِنْ رَبِّكُمْ وَشِفَاءٌ لِمَا فِي الصُّدُورِ وَهُدًى وَرَحْمَةٌ لِلْمُؤْمِنِينَ (٥٧) قُلْ بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا هُوَ خَيْرٌ مِمَّا يَجْمَعُونَ (٥٨)",
    "textEn": "O mankind, there has to come to you instruction from your Lord and healing for what is in the breasts and guidance and mercy for the believers. (57) Say, 'In the bounty of Allah and in His mercy - in that let them rejoice; it is better than what they accumulate.' (58)",
    "source": "سورة يونس: الآيتان ٥٧ - ٥٨",
    "sourceEn": "Surah Yunus: Verses 57-58"
  },
  {
    "id": "rq_quran_13",
    "type": "quran",
    "title": "آيات الشفاء وإبطال السحر (سورة يونس: الآيتان ٨١ - ٨٢)",
    "titleEn": "Surah Yunus (Verses 81 - 82 - Allah Shall Abolish Sorcery)",
    "text": "فَلَمَّا أَلْقَوْا قَالَ مُوسَىٰ مَا جِئْتُمْ بِهِ السِّحْرُ ۖ إِنَّ اللَّهَ سَيُبْطِلُهُ ۖ إِنَّ اللَّهَ لَا يُصْلِحُ عَمَلَ الْمُفْسِدِينَ (٨١) وَيُحِقُّ اللَّهُ الْحَقَّ بِكَلِمَاتِهِ وَلَوْ كَرِهَ الْمُجْرِمُونَ (٨٢)",
    "textEn": "And when they had thrown, Moses said, 'What you have brought is [only] magic. Indeed, Allah will expose its worthlessness. Indeed, Allah does not amend the work of corrupters. (81) And Allah will establish the truth by His words, even if the criminals dislike it.' (82)",
    "source": "سورة يونس: الآيتان ٨١ - ٨٢",
    "sourceEn": "Surah Yunus: Verses 81-82"
  },
  {
    "id": "rq_quran_14",
    "type": "quran",
    "title": "سورة يوسف (الآية ٦٤ - كفاية العبد بحفظ أرحم الراحمين)",
    "titleEn": "Surah Yusuf (Verse 64 - Allah is the Best Guardian)",
    "text": "قَالَ هَلْ آمَنُكُمْ عَلَيْهِ إِلَّا كَمَا أَمِنْتُكُمْ عَلَىٰ أَخِيهِ مِنْ قَبْلُ ۖ فَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ",
    "textEn": "He said, 'Should I entrust you with him except as I entrusted you with his brother before? But Allah is the best guardian, and He is the most merciful of the merciful.'",
    "source": "سورة يوسف: آية ٦٤",
    "sourceEn": "Surah Yusuf: Verse 64"
  },
  {
    "id": "rq_quran_15",
    "type": "quran",
    "title": "سورة الرعد (الآية ١١ - الحفظ الرباني والمعقبات من أمر الله)",
    "titleEn": "Surah Ar-Ra'd (Verse 11 - Divine Protection by Angels)",
    "text": "لَهُ مُعَقِّبَاتٌ مِنْ بَيْنِ يَدَيْهِ وَمِنْ خَلْفِهِ يَحْفَظُونَهُ مِنْ أَمْرِ اللَّهِ ۗ إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنْفُسِهِمْ",
    "textEn": "For each one are successive [angels] before and behind him who protect him by the decree of Allah. Indeed, Allah will not change the condition of a people until they change what is in themselves.",
    "source": "سورة الرعد: آية ١١",
    "sourceEn": "Surah Ar-Ra'd: Verse 11"
  },
  {
    "id": "rq_quran_16",
    "type": "quran",
    "title": "سورة الإسراء (الآيتان ٨١ - ٨٢ - إزهاق الباطل والشفاء بالقرآن)",
    "titleEn": "Surah Al-Isra (Verses 81 - 82 - The Qur'an is Healing & Mercy)",
    "text": "وَقُلْ جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ ۚ إِنَّ الْبَاطِلَ كَانَ زَهُوقًا (٨١) وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِلْمُؤْمِنِينَ ۙ وَلَا يَزِيدُ الظَّالِمِينَ إِلَّا خَسَارًا (٨٢)",
    "textEn": "And say, 'Truth has come, and falsehood has departed. Indeed is falsehood, [by nature], bound to depart.' (81) And We send down of the Qur'an that which is healing and mercy for the believers, but it does not increase the wrongdoers except in loss. (82)",
    "source": "سورة الإسراء: الآيتان ٨١ - ٨٢",
    "sourceEn": "Surah Al-Isra: Verses 81-82"
  },
  {
    "id": "rq_quran_17",
    "type": "quran",
    "title": "آية الشفاء واليقين ودحر كيد السحرة (سورة طه: الآية ٦٩)",
    "titleEn": "Surah Taha (Verse 69 - The Magician Shall Never Prosper)",
    "text": "وَأَلْقِ مَا فِي يَمِينِكَ تَلْقَفْ مَا صَنَعُوا ۖ إِنَّمَا صَنَعُوا كَيْدُ سَاحِرٍ ۖ وَلَا يُفْلِحُ السَّاحِرُ حَيْثُ أَتَىٰ",
    "textEn": "And throw what is in your right hand; it will swallow up what they have crafted. What they have crafted is but the trick of a magician, and the magician will not succeed wherever he is.",
    "source": "سورة طه: آية ٦٩",
    "sourceEn": "Surah Taha: Verse 69"
  },
  {
    "id": "rq_quran_18",
    "type": "quran",
    "title": "آيات الحفظ والطمأنينة (سورة المؤمنون: الآيات ١١٥ - ١١٨)",
    "titleEn": "Surah Al-Mu'minun (Verses 115 - 118 - Sovereignty of the True King)",
    "text": "أَفَحَسِبْتُمْ أَنَّمَا خَلَقْنَاكُمْ عَبَثًا وَأَنَّكُمْ إِلَيْنَا لَا تُرْجَعُونَ (١١٥) فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ ۖ لَا إِلَٰهَ إِلَّا هُوَ رَبُّ الْعَرْشِ الْكَرِيمِ (١١٦) وَمَنْ يَدْعُ مَعَ اللَّهِ إِلَٰهًا آخَرَ لَا بُرْهَانَ لَهُ بِهِ فَإِنَّمَا حِسَابُهُ عِنْدَ رَبِّهِ ۖ إِنَّهُ لَا يُفْلِحُ الْكَافِرُونَ (١١٧) وَقُلْ رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ (١١٨)",
    "textEn": "Then did you think that We created you uselessly and that to Us you would not be returned? (115) So exalted is Allah, the Sovereign, the Truth; there is no deity except Him, Lord of the Noble Throne. (116) And whoever invokes besides Allah another deity for which he has no proof - then his account is only with his Lord. Indeed, the disbelievers will not succeed. (117) And, [O Muhammad], say, 'My Lord, forgive and have mercy, and You are the best of the merciful.' (118)",
    "source": "سورة المؤمنون: الآيات ١١٥ - ١١٨",
    "sourceEn": "Surah Al-Mu'minun: Verses 115-118"
  },
  {
    "id": "rq_quran_19",
    "type": "quran",
    "title": "سورة الشعراء (الآيات ٧٨ - ٨٢ - يقين الخليل: وإذا مرضت فهو يشفين)",
    "titleEn": "Surah Ash-Shu'ara (Verses 78 - 82 - And When I Am Ill, He Heals Me)",
    "text": "الَّذِي خَلَقَنِي فَهُوَ يَهْدِينِ (٧٨) وَالَّذِي هُوَ يُطْعِمُنِي وَيَسْقِينِ (٧٩) وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ (٨٠) وَالَّذِي يُمِيتُنِي ثُمَّ يُحْيِينِ (٨١) وَالَّذِي أَطْمَعُ أَنْ يَغْفِرَ لِي خَطِيئَتِي يَوْمَ الدِّينِ (٨٢)",
    "textEn": "Who created me, and He [it is who] guides me. (78) And it is He who feeds me and gives me drink. (79) And when I am ill, it is He who cures me. (80) And who will cause me to die and then bring me to life. (81) And who I aspire that He will forgive me my sin on the Day of Recompense. (82)",
    "source": "سورة الشعراء: الآيات ٧٨ - ٨٢",
    "sourceEn": "Surah Ash-Shu'ara: Verses 78-82"
  },
  {
    "id": "rq_quran_20",
    "type": "quran",
    "title": "آيات طرد الشياطين وتثبيت السكينة (سورة الصافات: الآيات ١ - ١٠)",
    "titleEn": "Surah As-Saffat (Verses 1 - 10 - Guarding Against Rebellious Devils)",
    "text": "وَالصَّافَّاتِ صَفًّا (١) فَالزَّاجِرَاتِ زَجْرًا (٢) فَالتَّالِيَاتِ ذِكْرًا (٣) إِنَّ إِلَٰهَكُمْ لَوَاحِدٌ (٤) رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا وَرَبُّ الْمَشَارِقِ (٥) إِنَّا زَيَّنَّا السَّمَاءَ الدُّنْيَا بِزِينَةٍ الْكَوَاكِبِ (٦) وَحِفْظًا مِنْ كُلِّ شَيْطَانٍ مَارِدٍ (٧) لَا يَسَّمَّعُونَ إِلَى الْمَلَإِ الْأَعْلَىٰ وَيُقْذَفُونَ مِنْ كُلِّ جَانِبٍ (٨) دُحُورًا ۖ وَلَهُمْ عَذَابٌ وَاصِبٌ (٩) إِلَّا مَنْ خَطِفَ الْخَطْفَةَ فَأَتْبَعَهُ شِهَابٌ ثَاقِبٌ (١٠)",
    "textEn": "By those [angels] lined up in rows (1) And those who drive [the clouds] (2) And those who recite the message, (3) Indeed, your God is One, (4) Lord of the heavens and the earth and that between them and Lord of the sunrises. (5) Indeed, We have adorned the nearest heaven with an adornment of stars (6) And as protection against every rebellious devil (7) [So] they may not listen to the exalted assembly [of angels] and are pelted from every side, (8) Repelled; and for them is a constant punishment; (9) Except one who snatches [some words] by theft, but they are pursued by a burning, piercing flame. (10)",
    "source": "سورة الصافات: الآيات ١ - ١٠",
    "sourceEn": "Surah As-Saffat: Verses 1-10"
  },
  {
    "id": "rq_quran_21",
    "type": "quran",
    "title": "سورة فصلت (الآية ٤٤ - القرآن هدى وشفاء للمؤمنين)",
    "titleEn": "Surah Fussilat (Verse 44 - A Guidance and Cure for Believers)",
    "text": "وَلَوْ جَعَلْنَاهُ قُرْآنًا أَعْجَمِيًّا لَقَالُوا لَوْلَا فُصِّلَتْ آيَاتُهُ ۖ أَأَعْجَمِيٌّ وَعَرَبِيٌّ ۗ قُلْ هُوَ لِلَّذِينَ آمَنُوا هُدًى وَشِفَاءٌ",
    "textEn": "And if We had made it a non-Arabic Qur'an, they would have said, 'Why are its verses not explained in detail [in our language]? Is it a foreign [recitation] and an Arab [messenger]?' Say, 'It is, for those who believe, a guidance and cure.'",
    "source": "سورة فصلت: آية ٤٤",
    "sourceEn": "Surah Fussilat: Verse 44"
  },
  {
    "id": "rq_quran_22",
    "type": "quran",
    "title": "سورة الفتح (الآية ٤ - إنزال السكينة وطرد القلق والخوف)",
    "titleEn": "Surah Al-Fath (Verse 4 - Tranquility and Serenity in Hearts)",
    "text": "هُوَ الَّذِي أَنْزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَعَ إِيمَانِهِمْ ۗ وَلِلَّهِ جُنُودُ السَّمَاوَاتِ وَالْأَرْضِ ۚ وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا",
    "textEn": "It is He who sent down tranquility into the hearts of the believers that they would increase in faith along with their [present] faith. And to Allah belong the soldiers of the heavens and the earth, and ever is Allah Knowing and Wise.",
    "source": "سورة الفتح: آية ٤",
    "sourceEn": "Surah Al-Fath: Verse 4"
  },
  {
    "id": "rq_quran_23",
    "type": "quran",
    "title": "أواخر سورة الحشر (الآيات ٢١ - ٢٤ - أسماء الله الحسنى والخشوع)",
    "titleEn": "Surah Al-Hashr (Verses 21 - 24 - The Most Beautiful Divine Names)",
    "text": "لَوْ أَنْزَلْنَا هَٰذَا الْقُرْآنَ عَلَىٰ جَبَلٍ لَرَأَيْتَهُ خَاشِعًا مُتَصَدِّعًا مِنْ خَشْيَةِ اللَّهِ ۚ وَتِلْكَ الْأَمْثَالُ نَضْرِبُهَا لِلنَّاسِ لَعَلَّهُمْ يَتَفَكَّرُونَ (٢١) هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ ۖ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ ۖ هُوَ الرَّحْمَٰنُ الرَّحِيمُ (٢٢) هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ ۚ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ (٢٣) هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ ۖ لَهُ الْأَسْمَاءُ الْحُسْنَىٰ ۚ يُسَبِّحُ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ (٢٤)",
    "textEn": "If We had sent down this Qur'an upon a mountain, you would have seen it humbled and coming apart from fear of Allah. And these examples We present to the people that perhaps they will give thought. (21) He is Allah, other than whom there is no deity, Knower of the unseen and the witnessed. He is the Entirely Merciful, the Especially Merciful. (22) He is Allah, other than whom there is no deity, the Sovereign, the Pure, the Perfection, the Bestower of Faith, the Overseer, the Exalted in Might, the Compeller, the Superior. Exalted is Allah above whatever they associate with Him. (23) He is Allah, the Creator, the Inventor, the Fashioner; to Him belong the best names. Whatever is in the heavens and earth is exalting Him. And He is the Exalted in Might, the Wise. (24)",
    "source": "سورة الحشر: الآيات ٢١ - ٢٤",
    "sourceEn": "Surah Al-Hashr: Verses 21-24"
  },
  {
    "id": "rq_quran_24",
    "type": "quran",
    "title": "سورة الملك (الآيات ١ - ٤ - رد أثر العين والحسد بإتقان الخلق)",
    "titleEn": "Surah Al-Mulk (Verses 1 - 4 - Perfection of Divine Creation)",
    "text": "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (١) الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ (٢) الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِنْ تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِنْ فُطُورٍ (٣) ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنْقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ (٤)",
    "textEn": "Blessed is He in whose hand is dominion, and He is over all things competent - (1) [He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving - (2) [And] who created seven heavens in layers. You see no flaw in the creation of the Most Merciful. So return [your] vision [to the sky]; do you see any breaks? (3) Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued. (4)",
    "source": "سورة الملك: الآيات ١ - ٤",
    "sourceEn": "Surah Al-Mulk: Verses 1-4"
  },
  {
    "id": "rq_quran_25",
    "type": "quran",
    "title": "سورة القلم (الآيتان ٥١ - ٥٢ - دفع أثر العين وإزلاق الأبصار)",
    "titleEn": "Surah Al-Qalam (Verses 51 - 52 - Repelling the Malicious Eyes)",
    "text": "وَإِنْ يَكَادُ الَّذِينَ كَفَرُوا لَيُزْلِقُونَكَ بِأَبْصَارِهِمْ لَمَّا سَمِعُوا الذِّكْرَ وَيَقُولُونَ إِنَّهُ لَمَجْنُونٌ (٥١) وَمَا هُوَ إِلَّا ذِكْرٌ لِلْعَالَمِينَ (٥٢)",
    "textEn": "And indeed, those who disbelieve would almost make you slip with their eyes when they hear the message, and they say, 'Indeed, he is mad.' (51) But it is not except a reminder to the worlds. (52)",
    "source": "سورة القلم: الآيتان ٥١ - ٥٢",
    "sourceEn": "Surah Al-Qalam: Verses 51-52"
  },
  {
    "id": "rq_quran_26",
    "type": "quran",
    "title": "سورة الجن (الآيات ١ - ٦ - صرف شياطين الإنس والجن وتوحيد الله)",
    "titleEn": "Surah Al-Jinn (Verses 1 - 6 - Subduing Devils & Sincere Tawhid)",
    "text": "قُلْ أُوحِيَ إِلَيَّ أَنَّهُ اسْتَمَعَ نَفَرٌ مِنَ الْجِنِّ فَقَالُوا إِنَّا سَمِعْنَا قُرْآنًا عَجَبًا (١) يَهْدِي إِلَى الرُّشْدِ فَآمَنَّا بِهِ ۖ وَلَنْ نُشْرِكَ بِرَبِّنَا أَحَدًا (٢) وَأَنَّهُ تَعَالَىٰ جَدُّ رَبِّنَا مَا اتَّخَذَ صَاحِبَةً وَلَا وَلَدًا (٣) وَأَنَّهُ كَانَ يَقُولُ سَفِيهُنَا عَلَى اللَّهِ شَطَطًا (٤) وَأَنَّا ظَنَنَّا أَنْ لَنْ تَقُولَ الْإِنْسُ وَالْجِنُّ عَلَى اللَّهِ كَذِبًا (٥) وَأَنَّهُ كَانَ رِجَالٌ مِنَ الْإِنْسِ يَعُوذُونَ بِرِجَالٍ مِنَ الْجِنِّ فَزَادُوهُمْ رَهَقًا (٦)",
    "textEn": "Say, [O Muhammad], 'It has been revealed to me that a group of the jinn listened and said, 'Indeed, we have heard an amazing Qur'an. (1) It guides to the right course, and we have believed in it. And we will never associate with our Lord anyone. (2) And [we believe] that exalted is the nobleness of our Lord; He has not taken a wife or a son (3) And that our foolish one has been saying about Allah an excessive transgression. (4) And we had thought that mankind and the jinn would never speak about Allah a lie. (5) And there were men from mankind who sought refuge in men from the jinn, so they [only] increased them in burden.' (6)",
    "source": "سورة الجن: الآيات ١ - ٦",
    "sourceEn": "Surah Al-Jinn: Verses 1-6"
  },
  {
    "id": "rq_quran_27",
    "type": "quran",
    "title": "سورة الطارق (الآيات ١ - ٤ - حفظ النفس من كل طارق بسوء)",
    "titleEn": "Surah At-Tariq (Verses 1 - 4 - Divine Protector Over Every Soul)",
    "text": "وَالسَّمَاءِ وَالطَّارِقِ (١) وَمَا أَدْرَاكَ مَا الطَّارِقُ (٢) النَّجْمُ الثَّاقِبُ (٣) إِنْ كُلُّ نَفْسٍ لَمَّا عَلَيْهَا حَافِظٌ (٤)",
    "textEn": "By the sky and the night comer - (1) And what can make you know what is the night comer? (2) It is the piercing star - (3) There is no soul but that it has over it a protector. (4)",
    "source": "سورة الطارق: الآيات ١ - ٤",
    "sourceEn": "Surah At-Tariq: Verses 1-4"
  },
  {
    "id": "rq_quran_28",
    "type": "quran",
    "title": "سورة الكافرون (للبراءة من الشرك والوسواس)",
    "titleEn": "Surah Al-Kafirun (Disavowal of Polytheism & Whispers)",
    "text": "قُلْ يَا أَيُّهَا الْكَافِرُونَ (١) لَا أَعْبُدُ مَا تَعْبُدُونَ (٢) وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ (٣) وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ (٤) وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ (٥) لَكُمْ دِينُكُمْ وَلِيَ دِينِ (٦)",
    "textEn": "Say, 'O disbelievers, (1) I do not worship what you worship. (2) Nor are you worshippers of what I worship. (3) Nor will I be a worshipper of what you worship. (4) Nor will you be worshippers of what I worship. (5) For you is your religion, and for me is my religion.' (6)",
    "source": "سورة الكافرون: الآيات ١ - ٦",
    "sourceEn": "Surah Al-Kafirun: Verses 1-6"
  },
  {
    "id": "rq_quran_29",
    "type": "quran",
    "title": "سورة الإخلاص (تعدل ثلث القرآن - تُكرر ثلاثاً)",
    "titleEn": "Surah Al-Ikhlas (Tawhid - Equal to One Third of Qur'an)",
    "text": "قُلْ هُوَ اللَّهُ أَحَدٌ (١) اللَّهُ الصَّمَدُ (٢) لَمْ يَلِدْ وَلَمْ يُولَدْ (٣) وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (٤)",
    "textEn": "Say, 'He is Allah, [who is] One, (1) Allah, the Eternal Refuge. (2) He neither begets nor is born, (3) Nor is there to Him any equivalent.' (4)",
    "source": "سورة الإخلاص: الآيات ١ - ٤",
    "sourceEn": "Surah Al-Ikhlas: Verses 1-4"
  },
  {
    "id": "rq_quran_30",
    "type": "quran",
    "title": "سورة الفلق (التحصين من عين الحاسدين والنفاثات في العقد)",
    "titleEn": "Surah Al-Falaq (Protection from Envy & Witchcraft)",
    "text": "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (١) مِنْ شَرِّ مَا خَلَقَ (٢) وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ (٣) وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ (٤) وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ (٥)",
    "textEn": "Say, 'I seek refuge in the Lord of daybreak (1) From the evil of that which He created (2) And from the evil of darkness when it settles (3) And from the evil of the blowers in knots (4) And from the evil of an envier when he envies.' (5)",
    "source": "سورة الفلق: الآيات ١ - ٥",
    "sourceEn": "Surah Al-Falaq: Verses 1-5"
  },
  {
    "id": "rq_quran_31",
    "type": "quran",
    "title": "سورة الناس (للطرد من وساوس الشيطان الخناس)",
    "titleEn": "Surah An-Nas (Protection from Evil Whispers)",
    "text": "قُلْ أَعُوذُ بِرَبِّ النَّاسِ (١) مَلِكِ النَّاسِ (٢) إِلَٰهِ النَّاسِ (٣) مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ (٤) الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ (٥) مِنَ الْجِنَّةِ وَالنَّاسِ (٦)",
    "textEn": "Say, 'I seek refuge in the Lord of mankind, (1) The Sovereign of mankind. (2) The God of mankind, (3) From the evil of the retreating whisperer - (4) Who whispers into the breasts of mankind - (5) From among the jinn and mankind.' (6)",
    "source": "سورة الناس: الآيات ١ - ٦",
    "sourceEn": "Surah An-Nas: Verses 1-6"
  },
  {
    "id": "rq_quran_32",
    "type": "quran",
    "title": "سورة البقرة (الآية ٢٠ - كشف البصيرة وإبطال حيرة الضالين)",
    "titleEn": "Surah Al-Baqarah (Verse 20 - Allah is Competent Over All)",
    "text": "يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ ۖ كُلَّمَا أَضَاءَ لَهُمْ مَشَوْا فِيهِ وَإِذَا أَظْلَمَ عَلَيْهِمْ قَامُوا ۚ وَلَوْ شَاءَ اللَّهُ لَذَهَبَ بِسَمْعِهِمْ وَأَبْصَارِهِمْ ۚ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    "textEn": "The lightning almost snatches away their sight. Every time it lights [the way] for them, they walk therein; but when darkness comes over them, they stand [still]. And if Allah had willed, He could have taken away their hearing and their sight. Indeed, Allah is over all things competent.",
    "source": "سورة البقرة: آية ٢٠",
    "sourceEn": "Surah Al-Baqarah: Verse 20"
  },
  {
    "id": "rq_quran_33",
    "type": "quran",
    "title": "سورة البقرة (الآية ١٠٩ - رد حسد الأعداء وكفاية الله)",
    "titleEn": "Surah Al-Baqarah (Verse 109 - Overcoming the Envy of Enemies)",
    "text": "وَدَّ كَثِيرٌ مِنْ أَهْلِ الْكِتَابِ لَوْ يَرُدُّونَكُمْ مِنْ بَعْدِ إِيمَانِكُمْ كُفَّارًا حَسَدًا مِنْ عِنْدِ أَنْفُسِهِمْ مِنْ بَعْدِ مَا تَبَيَّنَ لَهُمُ الْحَقُّ ۖ فَاعْفُوا وَاصْفَحُوا حَتَّىٰ يَأْتِيَ اللَّهُ بِأَمْرِهِ ۗ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    "textEn": "Many of the People of the Scripture wish they could turn you back to disbelief after you have believed, out of envy from themselves [even] after the truth has become clear to them. So pardon and overlook until Allah delivers His command. Indeed, Allah is over all things competent.",
    "source": "سورة البقرة: آية ١٠٩",
    "sourceEn": "Surah Al-Baqarah: Verse 109"
  },
  {
    "id": "rq_quran_34",
    "type": "quran",
    "title": "سورة البقرة (الآية ١٣٧ - فسيكفيكهم الله وهو السميع العليم)",
    "titleEn": "Surah Al-Baqarah (Verse 137 - Allah Suffices Against Them)",
    "text": "فَإِنْ آمَنُوا بِمِثْلِ مَا آمَنْتُمْ بِهِ فَقَدِ اهْتَدَوْا ۖ وَإِنْ تَوَلَّوْا فَإِنَّمَا هُمْ فِي شِقَاقٍ ۖ فَسَيَكْفِيكَهُمُ اللَّهُ ۚ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    "textEn": "So if they believe in the same as you believe in, they have been [rightly] guided; but if they turn away, they are only in dissension. And Allah will be sufficient for you against them. And He is the Hearing, the Knowing.",
    "source": "سورة البقرة: آية ١٣٧",
    "sourceEn": "Surah Al-Baqarah: Verse 137"
  },
  {
    "id": "rq_quran_35",
    "type": "quran",
    "title": "سورة البقرة (الآية ٢٥٦ - الاستمساك بالعروة الوثقى)",
    "titleEn": "Surah Al-Baqarah (Verse 256 - The Trustworthy Handhold)",
    "text": "لَا إِكْرَاهَ فِي الدِّينِ ۖ قَدْ تَبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ ۚ فَمَنْ يَكْفُرْ بِالطَّاغُوتِ وَيُؤْمِنْ بِاللَّهِ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ لَا انْفِصَامَ لَهَا ۗ وَاللَّهُ سَمِيعٌ عَلِيمٌ",
    "textEn": "There is no compulsion in religion. The right direction is distinctly clear from the wrong. So whoever disbelieves in Taghut and believes in Allah has grasped the most trustworthy handhold with no break in it. And Allah is Hearing and Knowing.",
    "source": "سورة البقرة: آية ٢٥٦",
    "sourceEn": "Surah Al-Baqarah: Verse 256"
  },
  {
    "id": "rq_quran_36",
    "type": "quran",
    "title": "سورة البقرة (الآية ٢٥٧ - ولاية الله وإخراج المؤمنين من الظلمات إلى النور)",
    "titleEn": "Surah Al-Baqarah (Verse 257 - Allah is the Ally of Believers)",
    "text": "اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا يُخْرِجُهُمْ مِنَ الظُّلُمَاتِ إِلَى النُّورِ ۖ وَالَّذِينَ كَفَرُوا أَوْلِيَاؤُهُمُ الطَّاغُوتُ يُخْرِجُونَهُمْ مِنَ النُّورِ إِلَى الظُّلُمَاتِ ۗ أُولَٰئِكَ أَصْحَابُ النَّارِ ۖ هُمْ فِيهَا خَالِدُونَ",
    "textEn": "Allah is the ally of those who believe. He brings them out from darknesses into the light. And those who disbelieve - their allies are Taghut. They take them out of the light into darknesses. Those are the companions of the Fire; they will abide eternally therein.",
    "source": "سورة البقرة: آية ٢٥٧",
    "sourceEn": "Surah Al-Baqarah: Verse 257"
  },
  {
    "id": "rq_quran_37",
    "type": "quran",
    "title": "سورة آل عمران (الآيتان ١ - ٢ - اسم الله الأعظم الحي القيوم)",
    "titleEn": "Surah Ali 'Imran (Verses 1 - 2 - The Ever-Living, The Sustainer)",
    "text": "الم (١) اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ (٢)",
    "textEn": "Alif, Lam, Meem. (1) Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. (2)",
    "source": "سورة آل عمران: الآيتان ١ - ٢",
    "sourceEn": "Surah Ali 'Imran: Verses 1-2"
  },
  {
    "id": "rq_quran_38",
    "type": "quran",
    "title": "سورة آل عمران (الآيتان ٢٦ - ٢٧ - آية الملك والقدرة والعزة)",
    "titleEn": "Surah Ali 'Imran (Verses 26 - 27 - Owner of All Sovereignty)",
    "text": "قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَنْ تَشَاءُ وَتَنْزِعُ الْمُلْكَ مِمَّنْ تَشَاءُ وَتُعِزُّ مَنْ تَشَاءُ وَتُذِلُّ مَنْ تَشَاءُ ۖ بِيَدِكَ الْخَيْرُ ۖ إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (٢٦) تُولِجُ اللَّيْلَ فِي النَّهَارِ وَتُولِجُ النَّهَارَ فِي اللَّيْلِ ۖ وَتُخْرِجُ الْحَيَّ مِنَ الْمَيِّتِ وَتُخْرِجُ الْمَيِّتَ مِنَ الْحَيِّ ۖ وَتَرْزُقُ مَنْ تَشَاءُ بِغَيْرِ حِسَابٍ (٢٧)",
    "textEn": "Say, 'O Allah, Owner of Sovereignty, You give sovereignty to whom You will and You take sovereignty away from whom You will. You honor whom You will and You humble whom You will. In Your hand is [all] good. Indeed, You are over all things competent. (26) You cause the night to enter the day, and You cause the day to enter the night; and You bring the living out of the dead, and You bring the dead out of the living. And You give provision to whom You will without account.' (27)",
    "source": "سورة آل عمران: الآيتان ٢٦ - ٢٧",
    "sourceEn": "Surah Ali 'Imran: Verses 26-27"
  },
  {
    "id": "rq_quran_39",
    "type": "quran",
    "title": "سورة آل عمران (الآية ٨٣ - خضوع الكائنات وإسلامها لله)",
    "titleEn": "Surah Ali 'Imran (Verse 83 - All Creation Submits to Allah)",
    "text": "أَفَغَيْرَ دِينِ اللَّهِ يَبْغُونَ وَلَهُ أَسْلَمَ مَنْ فِي السَّمَاوَاتِ وَالْأَرْضِ طَوْعًا وَكَرْهًا وَإِلَيْهِ يُرْجَعُونَ",
    "textEn": "So is it other than the religion of Allah they desire, while to Him have submitted all those within the heavens and earth, willingly or by compulsion, and to Him they will be returned?",
    "source": "سورة آل عمران: آية ٨٣",
    "sourceEn": "Surah Ali 'Imran: Verse 83"
  },
  {
    "id": "rq_quran_40",
    "type": "quran",
    "title": "سورة النساء (الآية ٢٨ - التخفيف الرباني ولطفه بالإنسان)",
    "titleEn": "Surah An-Nisa (Verse 28 - Allah Desires to Lighten for You)",
    "text": "يُرِيدُ اللَّهُ أَنْ يُخَفِّفَ عَنْكُمْ ۚ وَخُلِقَ الْإِنْسَانُ ضَعِيفًا",
    "textEn": "And Allah desires to lighten for you [your difficulties]; and mankind was created weak.",
    "source": "سورة النساء: آية ٢٨",
    "sourceEn": "Surah An-Nisa: Verse 28"
  },
  {
    "id": "rq_quran_41",
    "type": "quran",
    "title": "سورة الأنعام (الآية ١٧ - كشف الضر بيد الله وحده)",
    "titleEn": "Surah Al-An'am (Verse 17 - None Can Remove Harm Except Allah)",
    "text": "وَإِنْ يَمْسَسْكَ اللَّهُ بِضُرٍّ فَلَا كَاشِفَ لَهُ إِلَّا هُوَ ۖ وَإِنْ يَمْسَسْكَ بِخَيْرٍ فَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    "textEn": "And if Allah should touch you with adversity, there is no remover of it except Him. And if He touches you with good - then He is over all things competent.",
    "source": "سورة الأنعام: آية ١٧",
    "sourceEn": "Surah Al-An'am: Verse 17"
  },
  {
    "id": "rq_quran_42",
    "type": "quran",
    "title": "سورة الأنعام (الآيتان ١٠٢ - ١٠٣ - اللطيف الخبير الذي لا تدركه الأبصار)",
    "titleEn": "Surah Al-An'am (Verses 102 - 103 - The Subtle, The Acquainted)",
    "text": "ذَٰلِكُمُ اللَّهُ رَبُّكُمْ ۖ لَا إِلَٰهَ إِلَّا هُوَ ۖ خَالِقُ كُلِّ شَيْءٍ فَاعْبُدُوهُ ۚ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ وَكِيلٌ (١٠٢) لَا تُدْرِكُهُ الْأَبْصَارُ وَهُوَ يُدْرِكُ الْأَبْصَارَ ۖ وَهُوَ اللَّطِيفُ الْخَبِيرُ (١٠٣)",
    "textEn": "That is Allah, your Lord; there is no deity except Him, the Creator of all things, so worship Him. And He is Disposer of all things. (102) Vision perceives Him not, but He perceives [all] vision; and He is the Subtle, the Acquainted. (103)",
    "source": "سورة الأنعام: الآيتان ١٠٢ - ١٠٣",
    "sourceEn": "Surah Al-An'am: Verses 102-103"
  },
  {
    "id": "rq_quran_43",
    "type": "quran",
    "title": "سورة التوبة (الآيتان ١٤ - ١٥ - ويشف صدور قوم مؤمنين)",
    "titleEn": "Surah At-Tawbah (Verses 14 - 15 - Healing the Believers' Breasts)",
    "text": "قَاتِلُوهُمْ يُعَذِّبْهُمُ اللَّهُ بِأَيْدِيكُمْ وَيُخْزِهِمْ وَيَنْصُرْكُمْ عَلَيْهِمْ وَيَشْفِ صُدُورَ قَوْمٍ مُؤْمِنِينَ (١٤) وَيُذْهِبْ غَيْظَ قُلُوبِهِمْ ۗ وَيَتُوبُ اللَّهُ عَلَىٰ مَنْ يَشَاءُ ۗ وَاللَّهُ عَلِيمٌ حَكِيمٌ (١٥)",
    "textEn": "Fight them; Allah will punish them by your hands and will disgrace them and give you victory over them and satisfy the breasts of a believing people (14) And remove the fury in their hearts. And Allah turns in forgiveness to whom He wills; and Allah is Knowing and Wise. (15)",
    "source": "سورة التوبة: الآيتان ١٤ - ١٥",
    "sourceEn": "Surah At-Tawbah: Verses 14-15"
  },
  {
    "id": "rq_quran_44",
    "type": "quran",
    "title": "سورة التوبة (الآيتان ١٢٨ - ١٢٩ - حسبي الله لا إله إلا هو)",
    "titleEn": "Surah At-Tawbah (Verses 128 - 129 - Sufficient for Me is Allah)",
    "text": "لَقَدْ جَاءَكُمْ رَسُولٌ مِنْ أَنْفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرِيصٌ عَلَيْكُمْ بِالْمُؤْمِنِينَ رَءُوفٌ رَحِيمٌ (١٢٨) فَإِنْ تَوَلَّوْا فَقُلْ حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ (١٢٩)",
    "textEn": "There has certainly come to you a Messenger from among yourselves. Grievous to him is what you suffer; [he is] concerned over you and to the believers is kind and merciful. (128) But if they turn away, [O Muhammad], say, 'Sufficient for me is Allah; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.' (129)",
    "source": "سورة التوبة: الآيتان ١٢٨ - ١٢٩",
    "sourceEn": "Surah At-Tawbah: Verses 128-129"
  },
  {
    "id": "rq_quran_45",
    "type": "quran",
    "title": "سورة يونس (الآيات ٨٥ - ٨٦ - دعاء النجاة من كيد الظالمين)",
    "titleEn": "Surah Yunus (Verses 85 - 86 - In Allah We Put Our Trust)",
    "text": "فَقَالُوا عَلَى اللَّهِ تَوَكَّلْنَا رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِلْقَوْمِ الظَّالِمِينَ (٨٥) وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ (٨٦)",
    "textEn": "So they said, 'Upon Allah we have relied. Our Lord, make us not [objects of] trial for the wrongdoing people (85) And save us by Your mercy from the disbelieving people.' (86)",
    "source": "سورة يونس: الآيات ٨٥ - ٨٦",
    "sourceEn": "Surah Yunus: Verses 85-86"
  },
  {
    "id": "rq_quran_46",
    "type": "quran",
    "title": "سورة يوسف (الآية ٨٦ - الشكوى والبث إلى الله وتفريج الهم)",
    "titleEn": "Surah Yusuf (Verse 86 - I Only Complain of Grief to Allah)",
    "text": "قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ وَأَعْلَمُ مِنَ اللَّهِ مَا لَا تَعْلَمُونَ",
    "textEn": "He said, 'I only complain of my suffering and my grief to Allah, and I know from Allah that which you do not know.'",
    "source": "سورة يوسف: آية ٨٦",
    "sourceEn": "Surah Yusuf: Verse 86"
  },
  {
    "id": "rq_quran_47",
    "type": "quran",
    "title": "سورة إبراهيم (الآيات ١٥ - ١٧ - خيبة كل جبار عنيد وهزيمة الشياطين)",
    "titleEn": "Surah Ibrahim (Verses 15 - 17 - Disappointment of Every Tyrant)",
    "text": "وَاسْتَفْتَحُوا وَخَابَ كُلُّ جَبَّارٍ عَنِيدٍ (١٥) مِنْ وَرَائِهِ جَهَنَّمُ وَيُسْقَىٰ مِنْ مَاءٍ صَدِيدٍ (١٦) يَتَجَرَّعُهُ وَلَا يَكَادُ يُسِيغُهُ وَيَأْتِيهِ الْمَوْتُ مِنْ كُلِّ مَكَانٍ وَمَا هُوَ بِمَيِّتٍ ۖ وَمِنْ وَرَائِهِ عَذَابٌ غَلِيظٌ (١٧)",
    "textEn": "And they requested victory from Allah, and disappointed, [therefore], was every obstinate tyrant. (15) Before him is Hell, and he will be given a drink of purulent water. (16) He will gulp it but will hardly be able to swallow it. And death will come to him from every place, yet he will not die. And before him is a massive punishment. (17)",
    "source": "سورة إبراهيم: الآيات ١٥ - ١٧",
    "sourceEn": "Surah Ibrahim: Verses 15-17"
  },
  {
    "id": "rq_quran_48",
    "type": "quran",
    "title": "سورة الحجر (الآيات ١٦ - ١٨ - حفظ الله للسماء من كل شيطان رجيم)",
    "titleEn": "Surah Al-Hijr (Verses 16 - 18 - Protection from Accursed Devils)",
    "text": "وَلَقَدْ جَعَلْنَا فِي السَّمَاءِ بُرُوجًا وَزَيَّنَّاهَا لِلنَّاظِرِينَ (١٦) وَحَفِظْنَاهَا مِنْ كُلِّ شَيْطَانٍ رَجِيمٍ (١٧) إِلَّا مَنِ اسْتَرَقَ السَّمْعَ فَأَتْبَعَهُ شِهَابٌ مُبِينٌ (١٨)",
    "textEn": "And We have placed within the sky great stars and have beautified it for the observers. (16) And We have protected it from every accursed devil (17) Except one who steals a hearing and is pursued by a clear burning flame. (18)",
    "source": "سورة الحجر: الآيات ١٦ - ١٨",
    "sourceEn": "Surah Al-Hijr: Verses 16-18"
  },
  {
    "id": "rq_quran_49",
    "type": "quran",
    "title": "سورة النحل (الآية ٦٩ - الشفاء والتداوي بآيات الله ونعمه)",
    "titleEn": "Surah An-Nahl (Verse 69 - Honey and Healing for People)",
    "text": "يَخْرُجُ مِنْ بُطُونِهَا شَرَابٌ مُخْتَلِفٌ أَلْوَانُهُ فِيهِ شِفَاءٌ لِلنَّاسِ ۗ إِنَّ فِي ذَٰلِكَ لَآيَةً لِقَوْمٍ يَتَفَكَّرُونَ",
    "textEn": "There emerges from their bellies a drink, varying in colors, in which there is healing for people. Indeed in that is a sign for a people who give thought.",
    "source": "سورة النحل: آية ٦٩",
    "sourceEn": "Surah An-Nahl: Verse 69"
  },
  {
    "id": "rq_quran_50",
    "type": "quran",
    "title": "سورة النحل (الآيات ٩٨ - ١٠٠ - الاستعاذة بالله ونفي سلطان الشيطان عن المؤمنين)",
    "titleEn": "Surah An-Nahl (Verses 98 - 100 - Seeking Refuge in Allah)",
    "text": "فَإِذَا قَرَأْتَ الْقُرْآنَ فَاسْتَعِذْ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ (٩٨) إِنَّهُ لَيْسَ لَهُ سُلْطَانٌ عَلَى الَّذِينَ آمَنُوا وَعَلَىٰ رَبِّهِمْ يَتَوَكَّلُونَ (٩٩) إِنَّمَا سُلْطَانُهُ عَلَى الَّذِينَ يَتَوَلَّوْنَهُ وَالَّذِينَ هُمْ بِهِ مُشْرِكُونَ (١٠٠)",
    "textEn": "So when you recite the Qur'an, [first] seek refuge in Allah from Satan, the expelled [from His mercy]. (98) Indeed, there is for him no authority over those who have believed and rely upon their Lord. (99) His authority is only over those who take him as an ally and those who through him associate others with Allah. (100)",
    "source": "سورة النحل: الآيات ٩٨ - ١٠٠",
    "sourceEn": "Surah An-Nahl: Verses 98-100"
  },
  {
    "id": "rq_quran_51",
    "type": "quran",
    "title": "سورة الإسراء (الآيتان ٤٥ - ٤٦ - الحجاب المستور وطرد وساوس الغافلين)",
    "titleEn": "Surah Al-Isra (Verses 45 - 46 - A Hidden Protective Barrier)",
    "text": "وَإِذَا قَرَأْتَ الْقُرْآنَ جَعَلْنَا بَيْنَكَ وَبَيْنَ الَّذِينَ لَا يُؤْمِنُونَ بِالْآخِرَةِ حِجَابًا مَسْتُورًا (٤٥) وَجَعَلْنَا عَلَىٰ قُلُوبِهِمْ أَكِنَّةً أَنْ يَفْقَهُوهُ وَفِي آذَانِهِمْ وَقْرًا ۚ وَإِذَا ذَكَرْتَ رَبَّكَ فِي الْقُرْآنِ وَحْدَهُ وَلَّوْا عَلَىٰ أَدْبَارِهِمْ نُفُورًا (٤٦)",
    "textEn": "And when you recite the Qur'an, We put between you and those who do not believe in the Hereafter a concealed partition. (45) And We have placed over their hearts coverings, lest they understand it, and in their ears deafness. And when you mention your Lord alone in the Qur'an, they turn back in aversion. (46)",
    "source": "سورة الإسراء: الآيتان ٤٥ - ٤٦",
    "sourceEn": "Surah Al-Isra: Verses 45-46"
  },
  {
    "id": "rq_quran_52",
    "type": "quran",
    "title": "سورة الإسراء (الآية ١٠٥ - نزول الحق ودحر الباطل)",
    "titleEn": "Surah Al-Isra (Verse 105 - In Truth It Was Sent Down)",
    "text": "وَبِالْحَقِّ أَنْزَلْنَاهُ وَبِالْحَقِّ نَزَلَ ۗ وَمَا أَرْسَلْنَاكَ إِلَّا مُبَشِّرًا وَنَذِيرًا",
    "textEn": "And with the truth We have sent the Qur'an down, and with the truth it has descended. And We have not sent you, [O Muhammad], except as a bringer of good tidings and a warner.",
    "source": "سورة الإسراء: آية ١٠٥",
    "sourceEn": "Surah Al-Isra: Verse 105"
  },
  {
    "id": "rq_quran_53",
    "type": "quran",
    "title": "سورة الكهف (الآية ٣٩ - دفع العين والحسد: ما شاء الله لا قوة إلا بالله)",
    "titleEn": "Surah Al-Kahf (Verse 39 - As Allah Wills, No Power Except in Him)",
    "text": "وَلَوْلَا إِذْ دَخَلْتَ جَنَّتَكَ قُلْتَ مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ ۚ إِنْ تَرَنِ أَنَا أَقَلَّ مِنْكَ مَالًا وَوَلَدًا",
    "textEn": "And why did you, when you entered your garden, not say, 'What Allah willed [has occurred]; there is no power except in Allah'? Although you see me less than you in wealth and children.",
    "source": "سورة الكهف: آية ٣٩",
    "sourceEn": "Surah Al-Kahf: Verse 39"
  },
  {
    "id": "rq_quran_54",
    "type": "quran",
    "title": "سورة مريم (الآيات ٨١ - ٨٣ - بطلان كيد الشياطين وشركهم)",
    "titleEn": "Surah Maryam (Verses 81 - 83 - Falsehood of Devils & Idols)",
    "text": "وَاتَّخَذُوا مِنْ دُونِ اللَّهِ آلِهَةً لِيَكُونُوا لَهُمْ عِزًّا (٨١) كَلَّا ۚ سَيَكْفُرُونَ بِعِبَادَتِهِمْ وَيَكُونُونَ عَلَيْهِمْ ضِدًّا (٨٢) أَلَمْ تَرَ أَنَّا أَرْسَلْنَا الشَّيَاطِينَ عَلَى الْكَافِرِينَ تَؤُزُّهُمْ أَزًّا (٨٣)",
    "textEn": "And they have taken besides Allah gods that they might be for them [a source of] honor. (81) No! Those gods will deny their worship and become against them opponents. (82) Do you not see that We have sent the devils upon the disbelievers, inciting them to evil with [constant] incitement? (83)",
    "source": "سورة مريم: الآيات ٨١ - ٨٣",
    "sourceEn": "Surah Maryam: Verses 81-83"
  },
  {
    "id": "rq_quran_55",
    "type": "quran",
    "title": "سورة طه (الآيات ١ - ٥ - تنزيل القرآن لرفع الشقاء ونيل السكينة)",
    "titleEn": "Surah Taha (Verses 1 - 5 - Peace and Relief Through the Qur'an)",
    "text": "طه (١) مَا أَنْزَلْنَا عَلَيْكَ الْقُرْآنَ لِتَشْقَىٰ (٢) إِلَّا تَذْكِرَةً لِمَنْ يَخْشَىٰ (٣) تَنْزِيلًا مِمَّنْ خَلَقَ الْأَرْضَ وَالسَّمَاوَاتِ الْعُلَى (٤) الرَّحْمَٰنُ عَلَى الْعَرْشِ اسْتَوَىٰ (٥)",
    "textEn": "Ta, Ha. (1) We have not sent down to you the Qur'an that you be distressed (2) But only as a reminder for those who fear [Allah] - (3) A revelation from He who created the earth and highest heavens, (4) The Most Merciful [who is] above the Throne established. (5)",
    "source": "سورة طه: الآيات ١ - ٥",
    "sourceEn": "Surah Taha: Verses 1-5"
  },
  {
    "id": "rq_quran_56",
    "type": "quran",
    "title": "سورة طه (الآيات ١٠٥ - ١٠٧ - نسف الأسقام والعقد نسفاً)",
    "titleEn": "Surah Taha (Verses 105 - 107 - Shattering Afflictions and Knots)",
    "text": "وَيَسْأَلُونَكَ عَنِ الْجِبَالِ فَقُلْ يَنْسِفُهَا رَبِّي نَسْفًا (١٠٥) فَيَذَرُهَا قَاعًا صَفْصَفًا (١٠٦) لَا تَرَىٰ فِيهَا عِوَجًا وَلَا أَمْتًا (١٠٧)",
    "textEn": "And they ask you about the mountains, so say, 'My Lord will blow them away with a blast. (105) And He will leave the earth a level plain; (106) You will not see therein a depression or an elevation.' (107)",
    "source": "سورة طه: الآيات ١٠٥ - ١٠٧",
    "sourceEn": "Surah Taha: Verses 105-107"
  },
  {
    "id": "rq_quran_57",
    "type": "quran",
    "title": "سورة الأنبياء (الآيتان ٨٣ - ٨٤ - استجابة دعاء أيوب عليه السلام وكشف الضر)",
    "titleEn": "Surah Al-Anbiya (Verses 83 - 84 - Ayyub's Prayer and Healing)",
    "text": "وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ (٨٣) فَاسْتَجَبْنَا لَهُ فَكَشَفْنَا مَا بِهِ مِنْ ضُرٍّ ۖ وَآتَيْنَاهُ أَهْلَهُ وَمِثْلَهُمْ مَعَهُمْ رَحْمَةً مِنْ عِنْدِنَا وَذِكْرَىٰ لِلْعَابِدِينَ (٨٤)",
    "textEn": "And [mention] Job, when he called to his Lord, 'Indeed, adversity has touched me, and You are the most merciful of the merciful.' (83) So We responded to him and removed what afflicted him of adversity. And We gave him [back] his family and the like thereof with them as mercy from Us and a reminder for the worshippers. (84)",
    "source": "سورة الأنبياء: الآيتان ٨٣ - ٨٤",
    "sourceEn": "Surah Al-Anbiya: Verses 83-84"
  },
  {
    "id": "rq_quran_58",
    "type": "quran",
    "title": "سورة الأنبياء (الآيتان ٨٧ - ٨٨ - دعاء ذي النون والنجاة من الغم والهم)",
    "titleEn": "Surah Al-Anbiya (Verses 87 - 88 - Supplication of Dhul-Nun)",
    "text": "وَذَا النُّونِ إِذْ ذَهَبَ مُغَاضِبًا فَظَنَّ أَنْ لَنْ نَقْدِرَ عَلَيْهِ فَنَادَىٰ فِي الظُّلُمَاتِ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ (٨٧) فَاسْتَجَبْنَا لَهُ وَنَجَّيْنَاهُ مِنَ الْغَمِّ ۚ وَكَذَٰلِكَ نُنْجِي الْمُؤْمِنِينَ (٨٨)",
    "textEn": "And [mention] the man of the fish, when he went off in anger and thought that We would not decree [any hardship] upon him. And he called out within the darknesses, 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.' (87) So We responded to him and saved him from the distress. And thus do We save the believers. (88)",
    "source": "سورة الأنبياء: الآيتان ٨٧ - ٨٨",
    "sourceEn": "Surah Al-Anbiya: Verses 87-88"
  },
  {
    "id": "rq_quran_59",
    "type": "quran",
    "title": "سورة المؤمنون (الآيتان ٩٧ - ٩٨ - الاستعاذة من همزات الشياطين وحضورهم)",
    "titleEn": "Surah Al-Mu'minun (Verses 97 - 98 - Seeking Refuge from Devils)",
    "text": "وَقُلْ رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ (٩٧) وَأَعُوذُ بِكَ رَبِّ أَنْ يَحْضُرُونِ (٩٨)",
    "textEn": "And say, 'My Lord, I seek refuge in You from the incitements of the devils, (97) And I seek refuge in You, my Lord, lest they be present with me.' (98)",
    "source": "سورة المؤمنون: الآيتان ٩٧ - ٩٨",
    "sourceEn": "Surah Al-Mu'minun: Verses 97-98"
  },
  {
    "id": "rq_quran_60",
    "type": "quran",
    "title": "سورة النور (الآية ٣٥ - آية النور الرباني وطرد ظلمات السحر والغم)",
    "titleEn": "Surah An-Nur (Verse 35 - The Divine Light)",
    "text": "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ ۖ الْمِصْبَاحُ فِي زُجَاجَةٍ ۖ الزُّجَاجَةُ كَأَنَّهَا كَوْكَبٌ دُرِّيٌّ يُوقَدُ مِنْ شَجَرَةٍ مُبَارَكَةٍ زَيْتُونَةٍ لَا شَرْقِيَّةٍ وَلَا غَرْبِيَّةٍ يَكَادُ زَيْتُهَا يُضِيءُ وَلَوْ لَمْ تَمْسَسْهُ نَارٌ ۚ نُورٌ عَلَىٰ نُورٍ ۗ يَهْدِي اللَّهُ لِنُورِهِ مَنْ يَشَاءُ ۚ وَيَضْرِبُ اللَّهُ الْأَمْثَالَ لِلنَّاسِ ۗ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ",
    "textEn": "Allah is the Light of the heavens and the earth. The example of His light is like a niche within which is a lamp, the lamp is within glass, the glass as if it were a pearly [white] star lit from [the oil of] a blessed olive tree, neither of the east nor of the west, whose oil would almost glow even if untouched by fire. Light upon light. Allah guides to His light whom He wills. And Allah presents examples for the people, and Allah is Knowing of all things.",
    "source": "سورة النور: آية ٣٥",
    "sourceEn": "Surah An-Nur: Verse 35"
  },
  {
    "id": "rq_quran_61",
    "type": "quran",
    "title": "سورة الفرقان (الآية ٢٣ - إحباط أعمال السحرة وجعلها هباء منثورا)",
    "titleEn": "Surah Al-Furqan (Verse 23 - Rendering Ill Deeds to Dust)",
    "text": "وَقَدِمْنَا إِلَىٰ مَا عَمِلُوا مِنْ عَمَلٍ فَجَعَلْنَاهُ هَبَاءً مَنْثُورًا",
    "textEn": "And We will approach what they have done of deeds and make it dust dispersing.",
    "source": "سورة الفرقان: آية ٢٣",
    "sourceEn": "Surah Al-Furqan: Verse 23"
  },
  {
    "id": "rq_quran_62",
    "type": "quran",
    "title": "سورة يس (الآيات ١ - ٩ - السد المنيع وإغشاء أبصار المعتدين)",
    "titleEn": "Surah Ya-Sin (Verses 1 - 9 - An Unbreakable Barrier for Safety)",
    "text": "يس (١) وَالْقُرْآنِ الْحَكِيمِ (٢) إِنَّكَ لَمِنَ الْمُرْسَلِينَ (٣) عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ (٤) تَنْزِيلَ الْعَزِيزِ الرَّحِيمِ (٥) لِتُنْذِرَ قَوْمًا مَا أُنْذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ (٦) لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ (٧) إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا فَهِيَ إِلَى الْأَذْقَانِ فَهُمْ مُقْمَحُونَ (٨) وَجَعَلْنَا مِنْ بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ (٩)",
    "textEn": "Ya, Seen. (1) By the wise Qur'an. (2) Indeed you, [O Muhammad], are from among the messengers, (3) On a straight path. (4) [This is] a revelation of the Exalted in Might, the Merciful, (5) That you may warn a people whose forefathers were not warned, so they are unaware. (6) Already the word has come into effect upon most of them, so they do not believe. (7) Indeed, We have put shackles on their necks, and they are to their chins, so they are with heads [kept] aloft. (8) And We have put before them a barrier and behind them a barrier and covered them, so they do not see. (9)",
    "source": "سورة يس: الآيات ١ - ٩",
    "sourceEn": "Surah Ya-Sin: Verses 1-9"
  },
  {
    "id": "rq_quran_63",
    "type": "quran",
    "title": "سورة غافر (الآيات ١ - ٣ - غافر الذنب وقابل التوب شديد العقاب)",
    "titleEn": "Surah Ghafir (Verses 1 - 3 - Forgiver of Sin, Severe in Penalty)",
    "text": "حم (١) تَنْزِيلُ الْكِتَابِ مِنَ اللَّهِ الْعَزِيزِ الْعَلِيمِ (٢) غَافِرِ الذَّنْبِ وَقَابِلِ التَّوْبِ شَدِيدِ الْعِقَابِ ذِي الطَّوْلِ ۖ لَا إِلَٰهَ إِلَّا هُوَ ۖ إِلَيْهِ الْمَصِيرُ (٣)",
    "textEn": "Ha, Meem. (1) The revelation of the Book is from Allah, the Exalted in Might, the Knowing. (2) The forgiver of sin, acceptor of repentance, severe in penalty, owner of abundance. There is no deity except Him; to Him is the destination. (3)",
    "source": "سورة غافر: الآيات ١ - ٣",
    "sourceEn": "Surah Ghafir: Verses 1-3"
  },
  {
    "id": "rq_quran_64",
    "type": "quran",
    "title": "سورة الأحقاف (الآيات ٢٩ - ٣١ - خضوع الجن واستماعهم للقرآن)",
    "titleEn": "Surah Al-Ahqaf (Verses 29 - 31 - The Jinn Listening to the Qur'an)",
    "text": "وَإِذْ صَرَفْنَا إِلَيْكَ نَفَرًا مِنَ الْجِنِّ يَسْتَمِعُونَ الْقُرْآنَ فَلَمَّا حَضَرُوهُ قَالُوا أَنْصِتُوا ۖ فَلَمَّا قُضِيَ وَلَّوْا إِلَىٰ قَوْمِهِمْ مُنْذِرِينَ (٢٩) قَالُوا يَا قَوْمَنَا إِنَّا سَمِعْنَا كِتَابًا أُنْزِلَ مِنْ بَعْدِ مُوسَىٰ مُصَدِّقًا لِمَا بَيْنَ يَدَيْهِ يَهْدِي إِلَىٰ الْحَقِّ وَإِلَىٰ طَرِيقٍ مُسْتَقِيمٍ (٣٠) يَا قَوْمَنَا أَجِيبُوا دَاعِيَ اللَّهِ وَآمِنُوا بِهِ يَغْفِرْ لَكُمْ مِنْ ذُنُوبِكُمْ وَيُجِرْكُمْ مِنْ عَذَابٍ أَلِيمٍ (٣١)",
    "textEn": "And [mention, O Muhammad], when We directed to you a few of the jinn, listening to the Qur'an. And when they attended it, they said, 'Listen quietly.' And when it was concluded, they turned back to their people as warners. (29) They said, 'O our people, indeed we have heard a [recited] Book revealed after Moses confirming what was before it which guides to the truth and to a straight path. (30) O our people, respond to the Messenger of Allah and believe in him; Allah will forgive for you your sins and protect you from a painful punishment.' (31)",
    "source": "سورة الأحقاف: الآيات ٢٩ - ٣١",
    "sourceEn": "Surah Al-Ahqaf: Verses 29-31"
  },
  {
    "id": "rq_quran_65",
    "type": "quran",
    "title": "سورة ق (الآيات ١٦ - ٢٢ - علم الله بالسرائر وكشف الغطاء)",
    "titleEn": "Surah Qaf (Verses 16 - 22 - The Removal of All Veils)",
    "text": "وَلَقَدْ خَلَقْنَا الْإِنْسَانَ وَنَعْلَمُ مَا تُوَسْوِسُ بِهِ نَفْسُهُ ۖ وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ (١٦) إِذْ يَتَلَقَّى الْمُتَلَقِّيَانِ عَنِ الْيَمِينِ وَعَنِ الشِّمَالِ قَعِيدٌ (١٧) مَا يَلْفِظُ مِنْ قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ (١٨) وَجَاءَتْ سَكْرَةُ الْمَوْتِ بِالْحَقِّ ۖ ذَٰلِكَ مَا كُنْتَ مِنْهُ تَحِيدُ (١٩) وَنُفِخَ فِي الصُّورِ ۚ ذَٰلِكَ يَوْمُ الْوَعِيدِ (٢٠) وَجَاءَتْ كُلُّ نَفْسٍ مَعَهَا سَائِقٌ وَشَهِيدٌ (٢١) لَقَدْ كُنْتَ فِي غَفْلَةٍ مِنْ هَٰذَا فَكَشَفْنَا عَنْكَ غِطَاءَكَ فَبَصَرُكَ الْيَوْمَ حَدِيدٌ (٢٢)",
    "textEn": "And We have already created man and know what his soul whispers to him, and We are closer to him than [his] jugular vein (16) When the two receivers receive, seated on the right and on the left. (17) Man does not utter any word except that with him is an observer prepared. (18) And the intoxication of death will bring the truth; that is what you were trying to avoid. (19) And the Horn will be blown. That is the Day of [which] warning [was given]. (20) And every soul will come, with it a driver and a witness. (21) [It will be said], 'You were certainly in unmindfulness of this, and We have removed from you your cover, so your sight, this Day, is sharp.' (22)",
    "source": "سورة ق: الآيات ١٦ - ٢٢",
    "sourceEn": "Surah Qaf: Verses 16-22"
  },
  {
    "id": "rq_quran_66",
    "type": "quran",
    "title": "سورة الرحمن (الآيات ٣٣ - ٣٥ - عجز الجن والإنس عن النفوذ إلا بسلطان)",
    "titleEn": "Surah Ar-Rahman (Verses 33 - 35 - Supremacy of Divine Authority)",
    "text": "يَا مَعْشَرَ الْجِنِّ وَالْإِنْسِ إِنِ اسْتَطَعْتُمْ أَنْ تَنْفُذُوا مِنْ أَقْطَارِ السَّمَاوَاتِ وَالْأَرْضِ فَانْفُذُوا ۚ لَا تَنْفُذُونَ إِلَّا بِسُلْطَانٍ (٣٣) فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ (٣٤) يُرْسَلُ عَلَيْكُمَا شُوَاظٌ مِنْ نَارٍ وَنُحَاسٌ فَلَا تَنْتَصِرَانِ (٣٥)",
    "textEn": "O company of jinn and mankind, if you are able to pass beyond the regions of the heavens and the earth, then pass. You will not pass except by authority [from Allah]. (33) So which of the favors of your Lord would you deny? (34) There will be sent upon you a flame of fire and smoke, and you will not defend yourselves. (35)",
    "source": "سورة الرحمن: الآيات ٣٣ - ٣٥",
    "sourceEn": "Surah Ar-Rahman: Verses 33-35"
  },
  {
    "id": "rq_quran_67",
    "type": "quran",
    "title": "سورة البروج (الآيات ١ - ١٠ - حفظ المؤمنين وبطش الله الشديد)",
    "titleEn": "Surah Al-Buruj (Verses 1 - 10 - Divine Protection of Believers)",
    "text": "وَالسَّمَاءِ ذَاتِ الْبُرُوجِ (١) وَالْيَوْمِ الْمَوْعُودِ (٢) وَشَاهِدٍ وَمَشْهُودٍ (٣) قُتِلَ أَصْحَابُ الْأُخْدُودِ (٤) النَّارِ ذَاتِ الْوَقُودِ (٥) إِذْ هُمْ عَلَيْهَا قُعُودٌ (٦) وَهُمْ عَلَىٰ مَا يَفْعَلُونَ بِالْمُؤْمِنِينَ شُهُودٌ (٧) وَمَا نَقَمُوا مِنْهُمْ إِلَّا أَنْ يُؤْمِنُوا بِاللَّهِ الْعَزِيزِ الْحَمِيدِ (٨) الَّذِي لَهُ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ ۚ وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ شَهِيدٌ (٩) إِنَّ الَّذِينَ فَتَنُوا الْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ ثُمَّ لَمْ يَتُوبُوا فَلَهُمْ عَذَابُ جَهَنَّمَ وَلَهُمْ عَذَابُ الْحَرِيقِ (١٠)",
    "textEn": "By the sky containing great stars (1) And [by] the promised Day (2) And [by] the witness and what is witnessed, (3) Cursed were the companions of the trench (4) [Containing] the fire full of fuel, (5) When they were sitting near it (6) And they, to what they were doing against the believers, were witnesses. (7) And they resented them not except because they believed in Allah, the Exalted in Might, the Praiseworthy, (8) To whom belongs the dominion of the heavens and the earth. And Allah, over all things, is Witness. (9) Indeed, those who have tortured the believing men and believing women and then have not repented will have the punishment of Hell, and they will have the punishment of the Burning Fire. (10)",
    "source": "سورة البروج: الآيات ١ - ١٠",
    "sourceEn": "Surah Al-Buruj: Verses 1-10"
  },
  {
    "id": "rq_quran_68",
    "type": "quran",
    "title": "سورة الشرح (الآيات ١ - ٨ - انشراح الصدر وتفريج العسر)",
    "titleEn": "Surah Ash-Sharh (Verses 1 - 8 - Expansion of Breast & Relief)",
    "text": "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ (١) وَوَضَعْنَا عَنْكَ وِزْرَكَ (٢) الَّذِي أَنْقَضَ ظَهْرَكَ (٣) وَرَفَعْنَا لَكَ ذِكْرَكَ (٤) فَإِنَّ مَعَ الْعُسْرِ يُسْرًا (٥) إِنَّ مَعَ الْعُسْرِ يُسْرًا (٦) فَإِذَا فَرَغْتَ فَانْصَبْ (٧) وَإِلَىٰ رَبِّكَ فَارْغَبْ (٨)",
    "textEn": "Did We not expand for you, [O Muhammad], your breast? (1) And We removed from you your burden (2) Which had weighed upon your back (3) And raised high for you your repute. (4) For indeed, with hardship [will be] ease. (5) Indeed, with hardship [will be] ease. (6) So when you have finished [your duties], then stand up [for worship]. (7) And to your Lord direct [your] longing. (8)",
    "source": "سورة الشرح: الآيات ١ - ٨",
    "sourceEn": "Surah Ash-Sharh: Verses 1-8"
  },
  {
    "id": "rq_quran_69",
    "type": "quran",
    "title": "سورة الزلزلة (الآيات ١ - ٨ - إخراج ما في البدن من خبايا وأثقال)",
    "titleEn": "Surah Az-Zalzalah (Verses 1 - 8 - Dispelling Burdens & Hidden Harms)",
    "text": "إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا (١) وَأَخْرَجَتِ الْأَرْضُ أَثْقَالَهَا (٢) وَقَالَ الْإِنْسَانُ مَا لَهَا (٣) يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا (٤) بِأَنَّ رَبَّكَ أَوْحَىٰ لَهَا (٥) يَوْمَئِذٍ يَصْدُرُ النَّاسُ أَشْتَاتًا لِيُرَوْا أَعْمَالَهُمْ (٦) فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ (٧) وَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ (٨)",
    "textEn": "When the earth is shaken with its [final] earthquake (1) And the earth discharges its burdens (2) And man says, 'What is [wrong] with it?' - (3) That Day, it will report its news (4) Because your Lord has commanded it. (5) That Day, the people will depart separated [into categories] to be shown [the result of] their deeds. (6) So whoever does an atom's weight of good will see it, (7) And whoever does an atom's weight of evil will see it. (8)",
    "source": "سورة الزلزلة: الآيات ١ - ٨",
    "sourceEn": "Surah Az-Zalzalah: Verses 1-8"
  },
  {
    "id": "rq_quran_70",
    "type": "quran",
    "title": "سورة النصر وسورة الكوثر (النصر والخير وقطع دابر المؤذين)",
    "titleEn": "Surah Al-Kawthar & Surah An-Nasr (Abundant Good & Victory)",
    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ ۝ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ﴾ • بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ ۝ وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا ۝ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا﴾",
    "textEn": "In the name of Allah, the Entirely Merciful, the Especially Merciful. Indeed, We have granted you, [O Muhammad], al-Kawthar (abundance). So pray to your Lord and offer sacrifice. Indeed, your enemy is the one cut off. • In the name of Allah, the Entirely Merciful, the Especially Merciful. When the victory of Allah has come and the conquest, and you see the people entering into the religion of Allah in multitudes, then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.",
    "source": "سورة الكوثر وسورة النصر",
    "sourceEn": "Surah Al-Kawthar & Surah An-Nasr"
  },
  {
    "id": "rq_sunnah_1",
    "type": "sunnah",
    "title": "تعويذ بكلمات الله التامات (٣ مرات)",
    "titleEn": "Seeking Refuge in the Perfect Words of Allah (3 Times)",
    "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
    "textEn": "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_2",
    "type": "sunnah",
    "title": "رقية جبريل عليه السلام لنبينا محمد ﷺ",
    "titleEn": "Ruqyah of Angel Jibril for Prophet Muhammad ﷺ",
    "text": "بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ.",
    "textEn": "In the name of Allah I perform Ruqyah for you, from everything that may harm you, from the evil of any soul or envious eye. May Allah heal you; in the name of Allah I perform Ruqyah for you.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_3",
    "type": "sunnah",
    "title": "دعاء الشفاء للرفع وإزالة الأوجاع والأسقام",
    "titleEn": "Supplication for Healing and Removing Ailments",
    "text": "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، وَاشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا.",
    "textEn": "Take away the hardship, O Lord of mankind, and grant healing, for You are the Healer. There is no healing except Your healing, a healing that leaves behind no illness.",
    "source": "متفق عليه",
    "sourceEn": "Agreed Upon (Bukhari & Muslim)"
  },
  {
    "id": "rq_sunnah_4",
    "type": "sunnah",
    "title": "تعويذ نبوي من الشيطان والعين اللامة",
    "titleEn": "Prophetic Refuge from Devils and the Evil Eye",
    "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ.",
    "textEn": "I seek refuge in the perfect words of Allah from every devil and poisonous creature, and from every evil, envious eye.",
    "source": "صحيح البخاري",
    "sourceEn": "Sahih Al-Bukhari"
  },
  {
    "id": "rq_sunnah_5",
    "type": "sunnah",
    "title": "دعاء الوجع والألم بالبدن (تضع يدك على الوجع)",
    "titleEn": "Supplication for Bodily Pain (Placing Hand on Pain)",
    "text": "بِسْمِ اللَّهِ (٣ مرات)، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (٧ مرات).",
    "textEn": "In the name of Allah (3 times). I seek refuge in Allah and His power from the evil of what I feel and fear (7 times).",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_6",
    "type": "sunnah",
    "title": "التحصين النبوي اليومي الأعظم",
    "titleEn": "The Great Daily Prophetic Fortress (3 Times)",
    "text": "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ (٣ مرات).",
    "textEn": "In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the Hearing, the Knowing (3 times).",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_7",
    "type": "sunnah",
    "title": "كفاية العبد وتوكله (٧ مرات صباحاً ومساءً)",
    "titleEn": "Sufficiency and Trust in Allah (7 Times)",
    "text": "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
    "textEn": "Allah is sufficient for me; there is no deity except Him. Upon Him I have relied, and He is the Lord of the Great Throne.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_8",
    "type": "sunnah",
    "title": "دعاء عيادة المريض وسؤال الشفاء العاجل (٧ مرات)",
    "titleEn": "Supplication for Visiting the Sick (7 Times)",
    "text": "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ.",
    "textEn": "I ask Allah the Almighty, Lord of the Magnificent Throne, to heal you.",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_9",
    "type": "sunnah",
    "title": "دعاء تفريج الهم والكرب وصرف ضرر العين والوصب",
    "titleEn": "Dispelling the Heat, Cold, and Affliction of the Evil Eye",
    "text": "اللَّهُمَّ اصْرِفْ عَنِّي حَرَّ الْعَيْنِ، وَبَرْدَ الْعَيْنِ، وَوَصَبَ الْعَيْنِ.",
    "textEn": "O Allah, turn away from me the heat of the evil eye, its coldness, and its chronic ailment.",
    "source": "مسند أحمد",
    "sourceEn": "Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_10",
    "type": "sunnah",
    "title": "تعويذ نبوي شامل من شر عباده وهمزات الشياطين",
    "titleEn": "Comprehensive Refuge from Wrath and Whispers of Devils",
    "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ، وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ.",
    "textEn": "I seek refuge in the perfect words of Allah from His anger and His punishment, from the evil of His servants, and from the whispers of devils and that they should be present with me.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami' At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_11",
    "type": "sunnah",
    "title": "رقية التربة النبوية بالريق للمريض",
    "titleEn": "Prophetic Healing with Soil and Pure Breath",
    "text": "بِسْمِ اللَّهِ تُرْبَةُ أَرْضِنَا، بِرِيقَةِ بَعْضِنَا، يُشْفَى سَقِيمُنَا، بِإِذْنِ رَبِّنَا.",
    "textEn": "In the name of Allah, the soil of our earth, with the saliva of some of us, our sick person is healed by the permission of our Lord.",
    "source": "متفق عليه",
    "sourceEn": "Agreed Upon (Bukhari & Muslim)"
  },
  {
    "id": "rq_sunnah_12",
    "type": "sunnah",
    "title": "سؤال العافية في البدن والسمع والبصر",
    "titleEn": "Asking for Health in Body, Hearing, and Sight",
    "text": "اللَّهُمَّ عافِني في بَدَني، اللَّهُمَّ عافِني في سَمْعي، اللَّهُمَّ عافِني في بَصَري، لا إلهَ إلَّا أنتَ.",
    "textEn": "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight. There is no deity except You.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_13",
    "type": "sunnah",
    "title": "دعاء التبريك وصرف حر وحسد العين وضررها",
    "titleEn": "Blessing Upon Seeing Something Pleasing to Ward off Envy",
    "text": "اللَّهُمَّ بَارِكْ عَلَيْهِ، وَأَذْهِبْ عَنْهُ حَرَّ الْعَيْنِ وَبَرْدَهَا وَوَصَبَهَا.",
    "textEn": "O Allah, bless him and do not harm him; as Allah wills, there is no power except in Allah.",
    "source": "مسند أحمد",
    "sourceEn": "Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_14",
    "type": "sunnah",
    "title": "تعويذ نبوي عظيم لا يجاوزه بر ولا فاجر",
    "titleEn": "Comprehensive Refuge Surpassing All Evil",
    "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ الَّتِي لَا يُجَاوِزُهُنَّ بَرٌّ وَلَا فَاجِرٌ مِنْ شَرِّ مَا خَلَقَ، وَبَرَأَ وَذَرَأَ، وَمِنْ شَرِّ مَا يَنْزِلُ مِنَ السَّمَاءِ، وَمِنْ شَرِّ مَا يَعْرُجُ فِيهَا، وَمِنْ شَرِّ مَا ذَرَأَ فِي الْأَرْضِ، وَمِنْ شَرِّ مَا يَخْرُجُ مِنْهَا، وَمِنْ شَرِّ فِتَنِ اللَّيْلِ وَالنَّهَارِ، وَمِنْ شَرِّ كُلِّ طَارِقٍ إِلَّا طَارِقًا يَطْرُقُ بِخَيْرٍ يَا رَحْمَنُ.",
    "textEn": "I seek refuge in the perfect words of Allah which neither the righteous nor the wicked can surpass, from the evil of what He created, originated, and multiplied, and from the evil of what descends from heaven and what ascends into it, and from the evil of what is created in the earth and what comes out of it, and from the trials of night and day, and from the night comers except one who arrives with good, O Merciful One.",
    "source": "مسند أحمد",
    "sourceEn": "Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_15",
    "type": "sunnah",
    "title": "الاستعاذة بوجه الله الكريم وكلماته التامات",
    "titleEn": "Refuge by the Noble Countenance of Allah",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِوَجْهِكَ الْكَرِيمِ، وَكَلِمَاتِكَ التَّامَّاتِ، مِنْ شَرِّ مَا أَنْتَ آخِذٌ بِنَاصِيَتِهِ، اللَّهُمَّ أَنْتَ تَكْشِفُ الْمَغْرَمَ وَالْمَأْثَمَ.",
    "textEn": "I seek refuge in the Noble Countenance of Allah and His complete words, which neither the righteous nor the wicked can surpass, from the evil of what descends from the sky and what ascends into it, and from the evil of what is scattered in the earth and what comes out of it.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_16",
    "type": "sunnah",
    "title": "دعاء الاستعاذة من الهم والحزن والعجز والكسل",
    "titleEn": "Refuge from Anxiety, Sorrow, Inability, and Sloth",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ.",
    "textEn": "O Allah, I seek refuge in You from anxiety and sorrow, from inability and laziness, from cowardice and stinginess, from being heavily in debt and being overcome by men.",
    "source": "صحيح البخاري",
    "sourceEn": "Sahih Al-Bukhari"
  },
  {
    "id": "rq_sunnah_17",
    "type": "sunnah",
    "title": "الاستعاذة من زوال النعمة وفجاءة النقمة",
    "titleEn": "Refuge from Loss of Blessings and Sudden Wrath",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ.",
    "textEn": "O Allah, I seek refuge in You from the withdrawal of Your blessing, the transformation of Your wellness, the sudden onset of Your wrath, and all of Your displeasure.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_18",
    "type": "sunnah",
    "title": "دعاء الحفظ التام من الجهات الست (دعاء العافية)",
    "titleEn": "Supplication for Comprehensive Protection from Six Directions",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
    "textEn": "O Allah, I ask You for pardon and well-being in my religious and worldly affairs, my family and my wealth. O Allah, conceal my faults and calm my fears. O Allah, protect me from before me, from behind me, from my right, from my left, from above me, and I seek refuge in Your greatness from being assassinated from beneath me.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_19",
    "type": "sunnah",
    "title": "دعاء الكرب العظيم لرسول الله ﷺ",
    "titleEn": "The Prophet's ﷺ Great Supplication for Distress",
    "text": "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ.",
    "textEn": "There is no deity except Allah, the Magnificent, the Forbearing. There is no deity except Allah, Lord of the Magnificent Throne. There is no deity except Allah, Lord of the heavens and Lord of the earth and Lord of the Noble Throne.",
    "source": "متفق عليه",
    "sourceEn": "Agreed Upon (Bukhari & Muslim)"
  },
  {
    "id": "rq_sunnah_20",
    "type": "sunnah",
    "title": "دعاء ذي النون لتفريج كل ضر وكرب",
    "titleEn": "Supplication of Dhul-Nun for Relief from Every Hardship",
    "text": "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.",
    "textEn": "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami' At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_21",
    "type": "sunnah",
    "title": "الاستعاذة من سيئ الأسقام والأمراض",
    "titleEn": "Refuge from Severe Diseases and Ailments",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبَرَصِ، وَالْجُنُونِ، وَالْجُذَامِ، وَمِنْ سَيِّئِ الْأَسْقَامِ.",
    "textEn": "O Allah, I seek refuge in You from leucoderma, madness, leprosy, and all evil diseases.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_22",
    "type": "sunnah",
    "title": "الاستغاثة برحمة الله وتفويض الشأن كله",
    "titleEn": "Supplication for Divine Mercy & Rectification of All Affairs",
    "text": "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
    "textEn": "O Ever-Living, O Sustainer of all existence, by Your mercy I call for help. Set right all my affairs for me, and do not leave me to myself even for the blink of an eye.",
    "source": "سنن النسائي",
    "sourceEn": "Sunan An-Nasa'i"
  },
  {
    "id": "rq_sunnah_23",
    "type": "sunnah",
    "title": "الاستعاذة من جهد البلاء ودرك الشقاء",
    "titleEn": "Refuge from Severe Affliction and Hardship",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَهْدِ الْبَلَاءِ، وَدَرَكِ الشَّقَاءِ، وَسُوءِ الْقَضَاءِ، وَشَمَاتَةِ الْأَعْدَاءِ.",
    "textEn": "O Allah, I seek refuge in You from the severity of affliction, the depths of misery, an evil decree, and the malicious joy of enemies.",
    "source": "متفق عليه",
    "sourceEn": "Agreed Upon (Bukhari & Muslim)"
  },
  {
    "id": "rq_sunnah_24",
    "type": "sunnah",
    "title": "دعاء من رأى شيئاً يعجبه دفعاً للعين والحسد",
    "titleEn": "Supplication of Blessing When Seeing Something Pleasing",
    "text": "مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ، اللَّهُمَّ بَارِكْ فِيهِ وَلَا تَضُرَّهُ.",
    "textEn": "May Allah bless it upon you; as Allah wills, there is no power except in Allah.",
    "source": "مسند أحمد",
    "sourceEn": "Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_25",
    "type": "sunnah",
    "title": "الاستعاذة من شر السمع والبصر واللسان والقلب",
    "titleEn": "Refuge from the Evils of Hearing, Sight, Tongue, and Heart",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ سَمْعِي، وَمِنْ شَرِّ بَصَرِي، وَمِنْ شَرِّ لِسَانِي، وَمِنْ شَرِّ قَلْبِي.",
    "textEn": "O Allah, I seek refuge in You from the evil of my hearing, the evil of my sight, the evil of my tongue, the evil of my heart, and the evil of my desires.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_26",
    "type": "sunnah",
    "title": "التعوذ برضا الله ومعافاته من عقوبته",
    "titleEn": "Seeking Refuge in Allah's Pleasure from His Displeasure",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِرِضَاكَ مِنْ سَخَطِكَ، وَبِمُعَافَاتِكَ مِنْ عُقُوبَتِكَ، وَأَعُوذُ بِكَ مِنْكَ لَا أُحْصِي ثَنَاءً عَلَيْكَ أَنْتَ كَمَا أَثْنَيْتَ عَلَىٰ نَفْسِكَ.",
    "textEn": "O Allah, I seek refuge in Your pleasure from Your anger, and in Your pardon from Your punishment, and I seek refuge in You from You. I cannot praise You enough; You are as You have praised Yourself.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_27",
    "type": "sunnah",
    "title": "دعاء التوكل وتفويض الأمر والكفاية",
    "titleEn": "Trust in Allah and Complete Reliance",
    "text": "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ (يُقال له: كُفيتَ ووُقيتَ وهُديتَ وتَنحَّى عنه الشَّيطانُ).",
    "textEn": "In the name of Allah, I trust in Allah; there is no might and no power except with Allah.",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_28",
    "type": "sunnah",
    "title": "دعاء الصباح والمساء للسلامة من مكر الشياطين",
    "titleEn": "Morning and Evening Fortress from the Cunning of Devils",
    "text": "أَصْبَحْنَا (أَمْسَيْنَا) عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.",
    "textEn": "O Allah, Creator of the heavens and the earth, Knower of the unseen and the seen, Lord and Possessor of all things. I testify that there is no deity except You. I seek refuge in You from the evil of my own self and from the evil of Satan and his polytheism.",
    "source": "مسند أحمد",
    "sourceEn": "Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_29",
    "type": "sunnah",
    "title": "التعويذ النبوي عند نزول أي منزل أو مكان جديد",
    "titleEn": "Prophetic Refuge When Stopping at Any New Place",
    "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ (من قالها لم يضره شيء حتى يرتحل من منزله ذلك).",
    "textEn": "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_30",
    "type": "sunnah",
    "title": "رقية النبي ﷺ لكشف البأس ورفع الوجع",
    "titleEn": "Prophetic Ruqyah to Relieve Distress and Pain",
    "text": "اكْشِفِ الْبَاسَ رَبَّ النَّاسِ، إِلَهَ النَّاسِ، عَبْدُكَ يَرْجُو رَحْمَتَكَ وَيَخْشَىٰ عَذَابَكَ.",
    "textEn": "Wipe away the pain, Lord of mankind; in Your hand is the cure, none can remove it except You.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_31",
    "type": "sunnah",
    "title": "دعاء الفزع والأرق عند النوم وطرد طوارق الليل",
    "titleEn": "Supplication for Restlessness and Sleeplessness at Night",
    "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ.",
    "textEn": "I seek refuge in the perfect words of Allah from His wrath, from the evil of His servants, and from the whispers of devils and that they should approach me.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami' At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_32",
    "type": "sunnah",
    "title": "دعاء تفريج الهم والحزن العظيم وجلاء الصدر بالقرآن",
    "titleEn": "Supplication for Great Relief from Sorrow Through the Qur'an",
    "text": "اللَّهُمَّ إِنِّي عَبْدُكَ، وَابْنُ عَبْدِكَ، وَابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي.",
    "textEn": "O Allah, I am Your servant, son of Your servant, son of Your maidservant. My forelock is in Your hand, Your command over me is ever executed, and Your decree over me is just. I ask You by every name belonging to You, by which You named Yourself, revealed in Your Book, taught to any of Your creation, or preserved in the knowledge of the unseen with You, to make the Qur'an the spring of my heart, the light of my chest, the banisher of my grief, and the reliever of my anxiety.",
    "source": "مسند أحمد",
    "sourceEn": "Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_33",
    "type": "sunnah",
    "title": "الاستعاذة الشاملة برب السماوات والعرش العظيم",
    "titleEn": "Comprehensive Refuge by the Lord of the Heavens and the Throne",
    "text": "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ، اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ.",
    "textEn": "O Allah, Lord of the seven heavens, Lord of the earth, Lord of the Magnificent Throne, our Lord and Lord of everything, Cleaver of the grain and date stone, Revealer of the Torah, the Gospel, and the Qur'an. I seek refuge in You from the evil of every creature whose forelock You hold.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_34",
    "type": "sunnah",
    "title": "سنة النفث في الكفين بالمعوذات ومسح الجسد",
    "titleEn": "Sunnah of Blowing into the Hands and Wiping the Body",
    "text": "كَانَ رَسُولُ اللَّهِ ﷺ إِذَا اشْتَكَى نَفَثَ عَلَى نَفْسِهِ بِالْمُعَوِّذَاتِ وَمَسَحَ عَنْهُ بِيَدِهِ؛ فَلَمَّا اشْتَكَى وَجَعَهُ الَّذِي تُوُفِّيَ فِيهِ طَفِقْتُ أَنْفِثُ عَلَيْهِ بِالْمُعَوِّذَاتِ الَّتِي كَانَ يَنْفِثُ وَأَمْسَحُ بِيَدِ النَّبِيِّ ﷺ عَنْهُ.",
    "textEn": "The Messenger of Allah ﷺ would cup his hands together, blow into them with light breath, and recite Surah Al-Ikhlas, Al-Falaq, and An-Nas, then wipe with them as much of his body as he could reach, starting with his head and face.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih Al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_35",
    "type": "sunnah",
    "title": "دعاء كفاية كيد الأعداء والسحرة",
    "titleEn": "Supplication Against the Plots of Enemies and Sorcerers",
    "text": "اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ، وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ.",
    "textEn": "O Allah, we place You before them and we seek refuge in You from their evils.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_36",
    "type": "sunnah",
    "title": "دعاء طرد وسوسة الشيطان والشك في الإيمان",
    "titleEn": "Supplication to Repel Satanic Doubts and Whispers",
    "text": "آمَنْتُ بِاللَّهِ وَرُسُلِهِ، اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ، ثُمَّ يَتْفُلُ عَنْ يَسَارِهِ ثَلَاثًا وَيَسْتَعِيذُ بِاللَّهِ مِنَ الشَّيْطَانِ.",
    "textEn": "I seek refuge in Allah from Satan, the accursed. I believe in Allah and His messengers.",
    "source": "سنن أبي داود ومسلم",
    "sourceEn": "سنن أبي داود ومسلم"
  },
  {
    "id": "rq_sunnah_37",
    "type": "sunnah",
    "title": "دعاء السكينة وهدوء البال في الليل",
    "titleEn": "Supplication for Tranquility and Serenity at Night",
    "text": "اللَّهُمَّ غَارَتِ النُّجُومُ، وَهَدَأَتِ الْعُيُونُ، وَأَنْتَ حَيٌّ قَيُّومٌ لَا تَأْخُذُكَ سِنَةٌ وَلَا نَوْمٌ، يَا حَيُّ يَا قَيُّومُ أَهْدِئْ لَيْلِي وَأَنِمْ عَيْنِي.",
    "textEn": "O Allah, the stars have set and all eyes are quiet, while You are the Ever-Living, the Sustainer; neither drowsiness nor sleep overtakes You. O Ever-Living, O Sustainer, calm my night and put my eyes to rest.",
    "source": "المعجم الكبير للطبراني",
    "sourceEn": "Al-Mu'jam Al-Kabir (At-Tabarani)"
  },
  {
    "id": "rq_sunnah_38",
    "type": "sunnah",
    "title": "تعويذ الأبناء والأهل والأحباب من العين والهامة",
    "titleEn": "Blessing Children and Loved Ones from the Evil Eye",
    "text": "أُعِيذُكُمْ بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ.",
    "textEn": "I commend you to the protection of Allah's perfect words from every devil and poisonous creature, and from every envious, harmful eye.",
    "source": "صحيح البخاري",
    "sourceEn": "Sahih Al-Bukhari"
  },
  {
    "id": "rq_sunnah_39",
    "type": "sunnah",
    "title": "دعاء صرف شيطان الصلاة والوسواس (خنزب)",
    "titleEn": "Repelling the Devil of Prayer and Whispers (Khanzab)",
    "text": "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ (والنفث عن اليسار ثلاثاً لإذهاب الوسواس في الصلاة).",
    "textEn": "I seek refuge in Allah from Satan, the accursed (spit lightly to your left three times).",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_40",
    "type": "sunnah",
    "title": "دعاء الخروج من المنزل للحفظ والعصمة من الشياطين",
    "titleEn": "Supplication Upon Leaving Home for Complete Protection",
    "text": "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ.",
    "textEn": "In the name of Allah, I trust in Allah, there is no power and no might except with Allah. (It is said to him: You are guided, defended, and protected, and the devil turns away from him).",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_41",
    "type": "sunnah",
    "title": "دعاء دفع البلاء عند رؤية المبتلى أو المريض",
    "titleEn": "Supplication Upon Seeing an Afflicted or Sick Person",
    "text": "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ، وَفَضَّلَنِي عَلَىٰ كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا (عُوفِيَ مِنْ ذَلِكَ الْبَلَاءِ كَائِنًا مَا كَانَ).",
    "textEn": "Praise be to Allah Who has spared me from that with which He has afflicted you and favored me over many of those He has created with a marked favor.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami' At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_42",
    "type": "sunnah",
    "title": "الاستعاذة من غلبة العدو والدين وشماتة الأعداء",
    "titleEn": "Refuge from Overpowering Enemies, Debt, and Gloating",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ، وَغَلَبَةِ الْعَدُوِّ، وَشَمَاتَةِ الْأَعْدَاءِ.",
    "textEn": "O Allah, I seek refuge in You from the burden of debt, the dominance of the enemy, and the gloating of foes.",
    "source": "سنن النسائي",
    "sourceEn": "Sunan An-Nasa'i"
  },
  {
    "id": "rq_sunnah_43",
    "type": "sunnah",
    "title": "التحصين المسائي من لدغة العقارب وهوام الأرض",
    "titleEn": "Evening Protection from Scorpions and Creeping Insects",
    "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ (ثلاث مرات إذا أمسى؛ لم تضره حُمَةٌ تلك الليلة).",
    "textEn": "I seek refuge in the perfect words of Allah from the evil of what He has created (3 times in the evening).",
    "source": "جامع الترمذي",
    "sourceEn": "Jami' At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_44",
    "type": "sunnah",
    "title": "دعاء الرضا وتسكين النفس وقطع مدخل الشيطان",
    "titleEn": "Supplication of Contentment Warding off Satanic Regret",
    "text": "قَدَرُ اللَّهِ وَمَا شَاءَ فَعَلَ (فإن كلمة «لو» تفتح عمل الشيطان).",
    "textEn": "It is the decree of Allah, and what He wills He does.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_45",
    "type": "sunnah",
    "title": "الاستعاذة من تخبط الشيطان والميتات السيئة",
    "titleEn": "Refuge from Being Stumbled by Satan and Bad Deaths",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ التَّرَدِّي وَالْهَدْمِ وَالْغَرَقِ وَالْحَرِيقِ، وَأَعُوذُ بِكَ أَنْ يَتَخَبَّطَنِي الشَّيْطَانُ عِنْدَ الْمَوْتِ، وَأَعُوذُ بِكَ أَنْ أَمُوتَ فِي سَبِيلِكَ مُدْبِرًا، وَأَعُوذُ بِكَ أَنْ أَمُوتَ لَدِيغًا.",
    "textEn": "O Allah, I seek refuge in You from being struck down from height, from being crushed, from drowning, and from fire, and I seek refuge in You lest Satan stumble me at death.",
    "source": "سنن أبي داود والنسائي",
    "sourceEn": "Sunan Abi Dawud & An-Nasa'i"
  },
  {
    "id": "rq_sunnah_46",
    "type": "sunnah",
    "title": "دعاء شفاء المريض ليكون عوناً في طاعة الله",
    "titleEn": "Supplication for the Sick to Regain Strength for Obedience",
    "text": "اللَّهُمَّ اشْفِ عَبْدَكَ، يَنْكَأُ لَكَ عَدُوًّا، أَوْ يَمْشِي لَكَ إِلَىٰ صَلَاةٍ.",
    "textEn": "O Allah, heal Your servant who may cause damage to an enemy for Your sake or walk to a prayer for Your sake.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_47",
    "type": "sunnah",
    "title": "دعاء كشف الضر والاستغاثة بالرحمة الإلهية",
    "titleEn": "Seeking Divine Compassion and Relief from Harm",
    "text": "يَا حَيُّ يَا قَيُّومُ لَا إِلَهَ إِلَّا أَنْتَ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
    "textEn": "O Allah, it is Your mercy that I hope for, so do not leave me to myself even for a blink of an eye, and set right all my affairs. There is no deity except You.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami' At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_48",
    "type": "sunnah",
    "title": "الاستعاذة من أمراض القلوب والنفاق وسوء الأخلاق",
    "titleEn": "Refuge from Hypocrisy, Ill-Morals, and Hardness of Heart",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الشِّقَاقِ وَالنِّفَاقِ وَسُوءِ الْأَخْلَاقِ.",
    "textEn": "O Allah, I seek refuge in You from hypocrisy, schism, and bad morals.",
    "source": "سنن أبي داود والنسائي",
    "sourceEn": "Sunan Abi Dawud & An-Nasa'i"
  },
  {
    "id": "rq_sunnah_49",
    "type": "sunnah",
    "title": "الاستعاذة من وساوس الشيطان عند قراءة القرآن والمناجاة",
    "titleEn": "Refuge from Satanic Whispers During Recitation and Prayer",
    "text": "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي بَصَرِي نُورًا، وَفِي سَمْعِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ يَسَارِي نُورًا، وَفَوْقِي نُورًا، وَتَحْتِي نُورًا، وَأَمَامِي نُورًا، وَخَلْفِي نُورًا، وَاجْعَلْ لِي نُورًا.",
    "textEn": "I seek refuge in Allah, the All-Hearing, the All-Knowing, from Satan the accursed, from his pride, his whispering, and his puffing.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih Al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_50",
    "type": "sunnah",
    "title": "دعاء الشفاء والتبرؤ من كل حول وقوة",
    "titleEn": "Complete Healing and Disavowal of Human Strength",
    "text": "اللَّهُمَّ رَبَّ النَّاسِ، مُذْهِبَ الْبَاسِ، اشْفِ أَنْتَ الشَّافِي، لَا كَافِيَ إِلَّا أَنْتَ، وَلَا شَافِيَ إِلَّا أَنْتَ، شِفَاءً لَا يُغَادِرُ سَقَمًا.",
    "textEn": "There is no power and no might except with Allah, the Most High, the Supreme; we rely upon Him and seek His healing.",
    "source": "المصنف لابن أبي شيبة",
    "sourceEn": "Al-Musannaf (Ibn Abi Shaybah)"
  },
  {
    "id": "rq_sunnah_51",
    "type": "sunnah",
    "title": "دعاء البركة في السمع والبصر والبدن",
    "titleEn": "Supplication for Blessing and Protection in Senses and Body",
    "text": "اللَّهُمَّ مَتِّعْنِي بِسَمْعِي وَبَصَرِي، وَاجْعَلْهُمَا الْوَارِثَ مِنِّي، وَانْصُرْنِي عَلَىٰ مَنْ يَظْلِمُنِي، وَخُذْ مِنْهُ بِثَأْرِي.",
    "textEn": "O Allah, let us enjoy our hearing, our sight, and our strength for as long as You keep us alive, and make it our heir.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami' At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_52",
    "type": "sunnah",
    "title": "الاستعاذة برب العرش العظيم من طوارق السوء",
    "titleEn": "Refuge in the Lord of the Throne from Ill Omens and Harm",
    "text": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ عَلَيْكَ تَوَكَّلْتُ وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ، مَا شَاءَ اللَّهُ كَانَ وَمَا لَمْ يَشَأْ لَمْ يَكُنْ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ.",
    "textEn": "I seek refuge in the glory of Allah and His power from the evil of that which I encounter and fear.",
    "source": "الدعاء للطبراني",
    "sourceEn": "Ad-Du'a (At-Tabarani)"
  },
  {
    "id": "rq_sunnah_53",
    "type": "sunnah",
    "title": "دعاء تفريج ضيق الصدر وانشراح الخاطر",
    "titleEn": "Supplication for Relief from Tightness of the Chest",
    "text": "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ.",
    "textEn": "O Allah, expand my chest with peace, ease my affair, and cure the ailment within me.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_54",
    "type": "sunnah",
    "title": "دعاء دفع الوحشة والخوف في الليل والوحدة",
    "titleEn": "Supplication for Repelling Loneliness and Nighttime Fear",
    "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ.",
    "textEn": "In the name of Allah, I seek refuge in the words of Allah from His anger and the evil of His creatures.",
    "source": "مسند أحمد",
    "sourceEn": "Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_55",
    "type": "sunnah",
    "title": "دعاء طلب كمال العافية ودوامها والشكر عليها",
    "titleEn": "Asking for Perfect and Lasting Health and Gratitude",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ تَمَامَ الْعَافِيَةِ، وَشُكْرَ الْعَافِيَةِ، وَدَوَامَ الْعَافِيَةِ، وَالْغِنَىٰ عَنِ النَّاسِ.",
    "textEn": "O Allah, I ask You for pardon, health, and permanent well-being in religion, this worldly life, and the Hereafter.",
    "source": "جامع الترمذي ومصنف ابن أبي شيبة",
    "sourceEn": "At-Tirmidhi & Ibn Abi Shaybah"
  },
  {
    "id": "rq_sunnah_56",
    "type": "sunnah",
    "title": "الاستعاذة من النفس الأمارة والقلب الذي لا يخشع",
    "titleEn": "Refuge from a Soul That is Never Satisfied",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ، وَمِنْ قَلْبٍ لَا يَخْشَعُ، وَمِنْ نَفْسٍ لَا تَشْبَعُ، وَمِنْ دَعْوَةٍ لَا يُسْتَجَابُ لَهَا.",
    "textEn": "O Allah, I seek refuge in You from knowledge that does not benefit, from a heart that is not humble, from a soul that is never satisfied, and from a prayer that is not answered.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_57",
    "type": "sunnah",
    "title": "دعاء كشف الوسواس القهري وحيرة الصدر",
    "titleEn": "Supplication for Dispelling Obsessive Whispers (Waswas)",
    "text": "اللَّهُ اللَّهُ رَبِّي لَا أُشْرِكُ بِهِ شَيْئًا (يُكرر سبع مرات عند اشتداد الضيق أو الوسواس).",
    "textEn": "He is the First and the Last, the Manifest and the Hidden, and He is Knowing of all things.",
    "source": "سنن أبي داود وابن ماجه",
    "sourceEn": "Sunan Abi Dawud & Ibn Majah"
  },
  {
    "id": "rq_sunnah_58",
    "type": "sunnah",
    "title": "رقية جامعة من كل داء وسحر وحسد",
    "titleEn": "Comprehensive Ruqyah for Any Disease, Magic, or Envy",
    "text": "بِسْمِ اللَّهِ أَرْقِيكَ، وَاللَّهُ يَشْفِيكَ مِنْ كُلِّ دَاءٍ يُؤْذِيكَ، وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ.",
    "textEn": "In the name of Allah, may He banish all your sickness, and heal you from the evil of an envier when he envies, and from the evil of every malicious eye.",
    "source": "سنن ابن ماجه والترمذي",
    "sourceEn": "Sunan Ibn Majah & At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_59",
    "type": "sunnah",
    "title": "دعاء طمأنينة النفس والرضا بالقدر",
    "titleEn": "Supplication for Peace of Mind and Acceptance of Decree",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ نَفْسًا بِكَ مُطْمَئِنَّةً، تُؤْمِنُ بِلِقَائِكَ، وَتَرْضَى بِقَضَائِكَ، وَتَقْنَعُ بِعَطَائِكَ.",
    "textEn": "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet and Messenger.",
    "source": "المعجم الكبير للطبراني",
    "sourceEn": "Al-Mu'jam Al-Kabir (At-Tabarani)"
  },
  {
    "id": "rq_sunnah_60",
    "type": "sunnah",
    "title": "الاستعاذة من الفتن العظام وعذاب القبر",
    "titleEn": "Refuge from Great Tribulations and Torment",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ جَهَنَّمَ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ.",
    "textEn": "O Allah, I seek refuge in You from the punishment of the grave, from the punishment of Hellfire, from the trials of life and death, and from the evil trial of the False Messiah.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih Al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_61",
    "type": "sunnah",
    "title": "رقية التوسل بأسماء الله وصفاته العليا للشفاء",
    "titleEn": "Ruqyah Beseeching Allah's Supreme Names for Cure",
    "text": "اللَّهُمَّ رَبَّ السَّمَاوَاتِ وَرَبَّ الْأَرْضِ، لَا إِلَهَ إِلَّا أَنْتَ، أَنْتَ الرَّحْمَنُ الرَّحِيمُ، أَنْتَ الْمَلِكُ الْقُدُّوسُ، اشْفِ سَقَمِي وَعَافِ بَدَنِي وَأَذْهِبْ هَمِّي.",
    "textEn": "O Allah, Lord of mankind, Remover of afflictions, heal; You are the Healer, none can heal except You.",
    "source": "مسند أبي يعلى",
    "sourceEn": "Musnad Abi Ya'la"
  },
  {
    "id": "rq_sunnah_62",
    "type": "sunnah",
    "title": "الاستعاذة من جار السوء وأصحاب النوايا الخبيثة",
    "titleEn": "Refuge from Bad Neighbors and Malicious Companions",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَارِ السُّوءِ فِي دَارِ الْمُقَامَةِ، فَإِنَّ جَارَ الْبَادِيَةِ يَتَحَوَّلُ.",
    "textEn": "O Allah, I seek refuge in You from an evil neighbor in the permanent residence, for the nomad neighbor moves on.",
    "source": "سنن النسائي",
    "sourceEn": "Sunan An-Nasa'i"
  },
  {
    "id": "rq_sunnah_63",
    "type": "sunnah",
    "title": "دعاء طهارة القلب واللسان من الخبث والغل",
    "titleEn": "Supplication for Purity of Heart and Freedom from Malice",
    "text": "اللَّهُمَّ طَهِّرْ قَلْبِي مِنَ النِّفَاقِ، وَعَمَلِي مِنَ الرِّيَاءِ، وَلِسَانِي مِنَ الْكَذِبِ، وَعَيْنِي مِنَ الْخِيَانَةِ، فَإِنَّكَ تَعْلَمُ خَائِنَةَ الْأَعْيُنِ وَمَا تُخْفِي الصُّدُورُ.",
    "textEn": "O Allah, purify my heart from hypocrisy, my deeds from show, my tongue from lying, and my eyes from treachery.",
    "source": "شعب الإيمان للبيهقي",
    "sourceEn": "Shu'ab Al-Iman (Al-Bayhaqi)"
  },
  {
    "id": "rq_sunnah_64",
    "type": "sunnah",
    "title": "الصلاة على النبي ﷺ كفاية للهم وغفران للذنب",
    "titleEn": "Blessings on the Prophet ﷺ to Suffice All Cares",
    "text": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ (مَنْ أكثر منها كُفي همّه وغُفر ذنبه).",
    "textEn": "O Allah, send peace and blessings upon our Master Muhammad and upon his family and companions.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami' At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_65",
    "type": "sunnah",
    "title": "دعاء تثبيت القلب على الإيمان والعافية",
    "titleEn": "Supplication for Firmness of the Heart on Faith and Health",
    "text": "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَىٰ دِينِكَ، وَيَا مُصَرِّفَ الْقُلُوبِ صَرِّفْ قَلْبِي عَلَىٰ طَاعَتِكَ.",
    "textEn": "O Controller of hearts, make my heart firm upon Your religion.",
    "source": "صحيح مسلم والترمذي",
    "sourceEn": "Sahih Muslim & At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_66",
    "type": "sunnah",
    "title": "دعاء الاسترجاع وتفريج المصائب والأحزان",
    "titleEn": "Supplication of Istirja' for Consolation in Tribulations",
    "text": "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي، وَأَخْلِفْ لِي خَيْرًا مِنْهَا.",
    "textEn": "Indeed we belong to Allah, and indeed to Him we shall return. O Allah, reward me in my affliction and replace it for me with that which is better.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_67",
    "type": "sunnah",
    "title": "دعاء الكفاية من بطش المعتدين والظالمين",
    "titleEn": "Supplication of Sufficiency Against Aggressors and Tyrants",
    "text": "اللَّهُمَّ اكْفِنِيهِمْ بِمَا شِئْتَ وَكَيْفَ شِئْتَ، إِنَّكَ عَلَىٰ مَا تَشَاءُ قَدِيرٌ.",
    "textEn": "O Allah, suffice me against them with whatever You will and however You will. Indeed You are competent over whatever You will.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_68",
    "type": "sunnah",
    "title": "دعاء التحصن بحمى الله وذمته التي لا تُخفر",
    "titleEn": "Fortifying in Allah's Inviolable Sanctuary",
    "text": "أَصْبَحْنَا فِي حِمَى اللَّهِ الَّذِي لَا يُسْتَبَاحُ، وَذِمَّةِ اللَّهِ الَّتِي لَا تُخْفَرُ، وَجِوَارِ اللَّهِ الَّذِي لَا يُرَامُ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ.",
    "textEn": "We have entered the morning in the sanctuary of Allah which cannot be violated, the covenant of Allah which cannot be broken, and the neighborhood of Allah which cannot be overcome. There is no power and no might except with Allah, the Most High, the Supreme.",
    "source": "مأثورات السلف الصالح",
    "sourceEn": "Supplications of the Pious Predecessors"
  },
  {
    "id": "rq_sunnah_69",
    "type": "sunnah",
    "title": "الاستعاذة من فتن المحيا والممات وضلال الطريق",
    "titleEn": "Refuge from Misguidance and the Trials of Life and Death",
    "text": "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَىٰ عَلَيْكَ.",
    "textEn": "O Allah, guide me among those whom You have guided, grant me well-being among those whom You have granted well-being, protect me among those whom You have protected, bless for me in what You have granted, and save me from the evil of what You have decreed. For You decree and none can decree against You.",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_70",
    "type": "sunnah",
    "title": "كفارة المجلس وإعلان التوحيد وختام الرقية",
    "titleEn": "Expiation of the Gathering and Conclusion of Ruqyah",
    "text": "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ.",
    "textEn": "Glory be to You, O Allah, and praise be to You. I bear witness that there is no deity except You; I seek Your forgiveness and repent to You.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami' At-Tirmidhi"
  }
];
