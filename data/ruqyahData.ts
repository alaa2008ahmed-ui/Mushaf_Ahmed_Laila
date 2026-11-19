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
    "text": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ (٢٥٥)",
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
    "text": "وَمَا هُمْ بِضَارِّينَ بِهِ مِنْ أَحَدٍ إِلَّا بِإِذْنِ اللَّهِ ۚ وَيَتَعَلَّمُونَ مَا يَضُرُّهُمْ وَلَا يَنْفَعُهُمْ ۚ وَلَقَدْ عَلِمُوا لَمَنِ اشْتَرَاهُ مَا لَهُ فِي الْآخِرَةِ مِنْ خَلَاقٍ ۚ وَلَبِئْسَ مَا شَرَوْا بِهِ أَنْفُسَهُمْ ۚ لَوْ كَانُوا يَعْلَمُونَ (١٠٢)",
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
    "text": "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ ۚ لَا إِلَٰهَ إِلَّا هُوَ الْعَزِيزُ الْحَكِيمُ (١٨) إِنَّ الدِّينَ عِنْدَ اللَّهِ الْإِسْلَامُ (١٩)",
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
    "text": "أَمْ يَحْسُدُونَ النَّاسَ عَلَىٰ مَا آتَاهُمُ اللَّهُ مِنْ فَضْلِهِ ۖ فَقَدْ آتَيْنَا آلَ إِبْرَاهِيمَ الْكِتَابَ وَالْحِكْمَةَ وَآتَيْنَاهُمْ مُلْكًا عَظِيمًا (٥٤)",
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
    "text": "قَالَ هَلْ آمَنُكُمْ عَلَيْهِ إِلَّا كَمَا أَمِنْتُكُمْ عَلَىٰ أَخِيهِ مِنْ قَبْلُ ۖ فَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ (٦٤)",
    "textEn": "He said, 'Should I entrust you with him except as I entrusted you with his brother before? But Allah is the best guardian, and He is the most merciful of the merciful.'",
    "source": "سورة يوسف: آية ٦٤",
    "sourceEn": "Surah Yusuf: Verse 64"
  },
  {
    "id": "rq_quran_15",
    "type": "quran",
    "title": "سورة الرعد (الآية ١١ - الحفظ الرباني والمعقبات من أمر الله)",
    "titleEn": "Surah Ar-Ra'd (Verse 11 - Divine Protection by Angels)",
    "text": "لَهُ مُعَقِّبَاتٌ مِنْ بَيْنِ يَدَيْهِ وَمِنْ خَلْفِهِ يَحْفَظُونَهُ مِنْ أَمْرِ اللَّهِ ۗ إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنْفُسِهِمْ (١١)",
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
    "text": "وَأَلْقِ مَا فِي يَمِينِكَ تَلْقَفْ مَا صَنَعُوا ۖ إِنَّمَا صَنَعُوا كَيْدُ سَاحِرٍ ۖ وَلَا يُفْلِحُ السَّاحِرُ حَيْثُ أَتَىٰ (٦٩)",
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
    "text": "وَلَوْ جَعَلْنَاهُ قُرْآنًا أَعْجَمِيًّا لَقَالُوا لَوْلَا فُصِّلَتْ آيَاتُهُ ۖ أَأَعْجَمِيٌّ وَعَرَبِيٌّ ۗ قُلْ هُوَ لِلَّذِينَ آمَنُوا هُدًى وَشِفَاءٌ (٤٤)",
    "textEn": "And if We had made it a non-Arabic Qur'an, they would have said, 'Why are its verses not explained in detail [in our language]? Is it a foreign [recitation] and an Arab [messenger]?' Say, 'It is, for those who believe, a guidance and cure.'",
    "source": "سورة فصلت: آية ٤٤",
    "sourceEn": "Surah Fussilat: Verse 44"
  },
  {
    "id": "rq_quran_22",
    "type": "quran",
    "title": "سورة الفتح (الآية ٤ - إنزال السكينة وطرد القلق والخوف)",
    "titleEn": "Surah Al-Fath (Verse 4 - Tranquility and Serenity in Hearts)",
    "text": "هُوَ الَّذِي أَنْزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَعَ إِيمَانِهِمْ ۗ وَلِلَّهِ جُنُودُ السَّمَاوَاتِ وَالْأَرْضِ ۚ وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا (٤)",
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
    "text": "يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ ۖ كُلَّمَا أَضَاءَ لَهُمْ مَشَوْا فِيهِ وَإِذَا أَظْلَمَ عَلَيْهِمْ قَامُوا ۚ وَلَوْ شَاءَ اللَّهُ لَذَهَبَ بِسَمْعِهِمْ وَأَبْصَارِهِمْ ۚ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (٢٠)",
    "textEn": "The lightning almost snatches away their sight. Every time it lights [the way] for them, they walk therein; but when darkness comes over them, they stand [still]. And if Allah had willed, He could have taken away their hearing and their sight. Indeed, Allah is over all things competent.",
    "source": "سورة البقرة: آية ٢٠",
    "sourceEn": "Surah Al-Baqarah: Verse 20"
  },
  {
    "id": "rq_quran_33",
    "type": "quran",
    "title": "سورة البقرة (الآية ١٠٩ - رد حسد الأعداء وكفاية الله)",
    "titleEn": "Surah Al-Baqarah (Verse 109 - Overcoming the Envy of Enemies)",
    "text": "وَدَّ كَثِيرٌ مِنْ أَهْلِ الْكِتَابِ لَوْ يَرُدُّونَكُمْ مِنْ بَعْدِ إِيمَانِكُمْ كُفَّارًا حَسَدًا مِنْ عِنْدِ أَنْفُسِهِمْ مِنْ بَعْدِ مَا تَبَيَّنَ لَهُمُ الْحَقُّ ۖ فَاعْفُوا وَاصْفَحُوا حَتَّىٰ يَأْتِيَ اللَّهُ بِأَمْرِهِ ۗ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (١٠٩)",
    "textEn": "Many of the People of the Scripture wish they could turn you back to disbelief after you have believed, out of envy from themselves [even] after the truth has become clear to them. So pardon and overlook until Allah delivers His command. Indeed, Allah is over all things competent.",
    "source": "سورة البقرة: آية ١٠٩",
    "sourceEn": "Surah Al-Baqarah: Verse 109"
  },
  {
    "id": "rq_quran_34",
    "type": "quran",
    "title": "سورة البقرة (الآية ١٣٧ - فسيكفيكهم الله وهو السميع العليم)",
    "titleEn": "Surah Al-Baqarah (Verse 137 - Allah Suffices Against Them)",
    "text": "فَإِنْ آمَنُوا بِمِثْلِ مَا آمَنْتُمْ بِهِ فَقَدِ اهْتَدَوْا ۖ وَإِنْ تَوَلَّوْا فَإِنَّمَا هُمْ فِي شِقَاقٍ ۖ فَسَيَكْفِيكَهُمُ اللَّهُ ۚ وَهُوَ السَّمِيعُ الْعَلِيمُ (١٣٧)",
    "textEn": "So if they believe in the same as you believe in, they have been [rightly] guided; but if they turn away, they are only in dissension. And Allah will be sufficient for you against them. And He is the Hearing, the Knowing.",
    "source": "سورة البقرة: آية ١٣٧",
    "sourceEn": "Surah Al-Baqarah: Verse 137"
  },
  {
    "id": "rq_quran_35",
    "type": "quran",
    "title": "سورة البقرة (الآية ٢٥٦ - الاستمساك بالعروة الوثقى)",
    "titleEn": "Surah Al-Baqarah (Verse 256 - The Trustworthy Handhold)",
    "text": "لَا إِكْرَاهَ فِي الدِّينِ ۖ قَدْ تَبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ ۚ فَمَنْ يَكْفُرْ بِالطَّاغُوتِ وَيُؤْمِنْ بِاللَّهِ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ لَا انْفِصَامَ لَهَا ۗ وَاللَّهُ سَمِيعٌ عَلِيمٌ (٢٥٦)",
    "textEn": "There is no compulsion in religion. The right direction is distinctly clear from the wrong. So whoever disbelieves in Taghut and believes in Allah has grasped the most trustworthy handhold with no break in it. And Allah is Hearing and Knowing.",
    "source": "سورة البقرة: آية ٢٥٦",
    "sourceEn": "Surah Al-Baqarah: Verse 256"
  },
  {
    "id": "rq_quran_36",
    "type": "quran",
    "title": "سورة البقرة (الآية ٢٥٧ - ولاية الله وإخراج المؤمنين من الظلمات إلى النور)",
    "titleEn": "Surah Al-Baqarah (Verse 257 - Allah is the Ally of Believers)",
    "text": "اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا يُخْرِجُهُمْ مِنَ الظُّلُمَاتِ إِلَى النُّورِ ۖ وَالَّذِينَ كَفَرُوا أَوْلِيَاؤُهُمُ الطَّاغُوتُ يُخْرِجُونَهُمْ مِنَ النُّورِ إِلَى الظُّلُمَاتِ ۗ أُولَٰئِكَ أَصْحَابُ النَّارِ ۖ هُمْ فِيهَا خَالِدُونَ (٢٥٧)",
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
    "text": "أَفَغَيْرَ دِينِ اللَّهِ يَبْغُونَ وَلَهُ أَسْلَمَ مَنْ فِي السَّمَاوَاتِ وَالْأَرْضِ طَوْعًا وَكَرْهًا وَإِلَيْهِ يُرْجَعُونَ (٨٣)",
    "textEn": "So is it other than the religion of Allah they desire, while to Him have submitted all those within the heavens and earth, willingly or by compulsion, and to Him they will be returned?",
    "source": "سورة آل عمران: آية ٨٣",
    "sourceEn": "Surah Ali 'Imran: Verse 83"
  },
  {
    "id": "rq_quran_40",
    "type": "quran",
    "title": "سورة النساء (الآية ٢٨ - التخفيف الرباني ولطفه بالإنسان)",
    "titleEn": "Surah An-Nisa (Verse 28 - Allah Desires to Lighten for You)",
    "text": "يُرِيدُ اللَّهُ أَنْ يُخَفِّفَ عَنْكُمْ ۚ وَخُلِقَ الْإِنْسَانُ ضَعِيفًا (٢٨)",
    "textEn": "And Allah desires to lighten for you [your difficulties]; and mankind was created weak.",
    "source": "سورة النساء: آية ٢٨",
    "sourceEn": "Surah An-Nisa: Verse 28"
  },
  {
    "id": "rq_quran_41",
    "type": "quran",
    "title": "سورة الأنعام (الآية ١٧ - كشف الضر بيد الله وحده)",
    "titleEn": "Surah Al-An'am (Verse 17 - None Can Remove Harm Except Allah)",
    "text": "وَإِنْ يَمْسَسْكَ اللَّهُ بِضُرٍّ فَلَا كَاشِفَ لَهُ إِلَّا هُوَ ۖ وَإِنْ يَمْسَسْكَ بِخَيْرٍ فَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (١٧)",
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
    "text": "قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ وَأَعْلَمُ مِنَ اللَّهِ مَا لَا تَعْلَمُونَ (٨٦)",
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
    "text": "يَخْرُجُ مِنْ بُطُونِهَا شَرَابٌ مُخْتَلِفٌ أَلْوَانُهُ فِيهِ شِفَاءٌ لِلنَّاسِ ۗ إِنَّ فِي ذَٰلِكَ لَآيَةً لِقَوْمٍ يَتَفَكَّرُونَ (٦٩)",
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
    "text": "وَبِالْحَقِّ أَنْزَلْنَاهُ وَبِالْحَقِّ نَزَلَ ۗ وَمَا أَرْسَلْنَاكَ إِلَّا مُبَشِّرًا وَنَذِيرًا (١٠٥)",
    "textEn": "And with the truth We have sent the Qur'an down, and with the truth it has descended. And We have not sent you, [O Muhammad], except as a bringer of good tidings and a warner.",
    "source": "سورة الإسراء: آية ١٠٥",
    "sourceEn": "Surah Al-Isra: Verse 105"
  },
  {
    "id": "rq_quran_53",
    "type": "quran",
    "title": "سورة الكهف (الآية ٣٩ - دفع العين والحسد: ما شاء الله لا قوة إلا بالله)",
    "titleEn": "Surah Al-Kahf (Verse 39 - As Allah Wills, No Power Except in Him)",
    "text": "وَلَوْلَا إِذْ دَخَلْتَ جَنَّتَكَ قُلْتَ مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ ۚ إِنْ تَرَنِ أَنَا أَقَلَّ مِنْكَ مَالًا وَوَلَدًا (٣٩)",
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
    "text": "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ ۖ الْمِصْبَاحُ فِي زُجَاجَةٍ ۖ الزُّجَاجَةُ كَأَنَّهَا كَوْكَبٌ دُرِّيٌّ يُوقَدُ مِنْ شَجَرَةٍ مُبَارَكَةٍ زَيْتُونَةٍ لَا شَرْقِيَّةٍ وَلَا غَرْبِيَّةٍ يَكَادُ زَيْتُهَا يُضِيءُ وَلَوْ لَمْ تَمْسَسْهُ نَارٌ ۚ نُورٌ عَلَىٰ نُورٍ ۗ يَهْدِي اللَّهُ لِنُورِهِ مَنْ يَشَاءُ ۚ وَيَضْرِبُ اللَّهُ الْأَمْثَالَ لِلنَّاسِ ۗ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ (٣٥)",
    "textEn": "Allah is the Light of the heavens and the earth. The example of His light is like a niche within which is a lamp, the lamp is within glass, the glass as if it were a pearly [white] star lit from [the oil of] a blessed olive tree, neither of the east nor of the west, whose oil would almost glow even if untouched by fire. Light upon light. Allah guides to His light whom He wills. And Allah presents examples for the people, and Allah is Knowing of all things.",
    "source": "سورة النور: آية ٣٥",
    "sourceEn": "Surah An-Nur: Verse 35"
  },
  {
    "id": "rq_quran_61",
    "type": "quran",
    "title": "سورة الفرقان (الآية ٢٣ - إحباط أعمال السحرة وجعلها هباء منثورا)",
    "titleEn": "Surah Al-Furqan (Verse 23 - Rendering Ill Deeds to Dust)",
    "text": "وَقَدِمْنَا إِلَىٰ مَا عَمِلُوا مِنْ عَمَلٍ فَجَعَلْنَاهُ هَبَاءً مَنْثُورًا (٢٣)",
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
    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nإِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ (١) فَصَلِّ لِرَبِّكَ وَانْحَرْ (٢) إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ (٣)\n\n•\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nإِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ (١) وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا (٢) فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا (٣)",
    "textEn": "In the name of Allah, the Entirely Merciful, the Especially Merciful. Indeed, We have granted you, [O Muhammad], al-Kawthar (abundance). So pray to your Lord and offer sacrifice. Indeed, your enemy is the one cut off. • In the name of Allah, the Entirely Merciful, the Especially Merciful. When the victory of Allah has come and the conquest, and you see the people entering into the religion of Allah in multitudes, then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.",
    "source": "سورة الكوثر وسورة النصر",
    "sourceEn": "Surah Al-Kawthar & Surah An-Nasr"
  },
  {
    "id": "rq_quran_71",
    "type": "quran",
    "title": "سورة البقرة (الآيتان ٢٨ - ٢٩ - إحياء الله للخلق وقدرته)",
    "titleEn": "Surah Al-Baqarah (Verses 28-29 - Allah Gives Life & Power)",
    "text": "كَيْفَ تَكْفُرُونَ بِاللَّهِ وَكُنتُمْ أَمْوَٰتًا فَأَحْيَٰكُمْ ۖ ثُمَّ يُمِيتُكُمْ ثُمَّ يُحْيِيكُمْ ثُمَّ إِلَيْهِ تُرْجَعُونَ (٢٨) هُوَ الَّذِى خَلَقَ لَكُم مَّا فِى الْأَرْضِ جَمِيعًا ثُمَّ اسْتَوَىٰ إِلَى السَّمَاءِ فَسَوَّىٰهُنَّ سَبْعَ سَمَٰوَٰتٍ ۚ وَهُوَ بِكُلِّ شَىْءٍ عَلِيمٌ (٢٩)",
    "textEn": "How could you deny Allah when you were lifeless and He gave you life; then He causes you to die, brings you back to life, and to Him you return. He created for you all that is on earth, then turned to the heaven and fashioned seven heavens; He has knowledge of all things.",
    "source": "سورة البقرة: الآيتان ٢٨ - ٢٩",
    "sourceEn": "Surah Al-Baqarah: Verses 28-29"
  },
  {
    "id": "rq_quran_72",
    "type": "quran",
    "title": "سورة البقرة (الآيتان ٧٢ - ٧٣ - كشف الخفايا وإحياء النفوس)",
    "titleEn": "Surah Al-Baqarah (Verses 72-73 - Revealing What Is Concealed)",
    "text": "وَإِذْ قَتَلْتُمْ نَفْسًا فَادَّٰرَْٰٔتُمْ فِيهَا ۖ وَاللَّهُ مُخْرِجٌ مَّا كُنتُمْ تَكْتُمُونَ (٧٢) فَقُلْنَا اضْرِبُوهُ بِبَعْضِهَا ۚ كَذَٰلِكَ يُحْىِ اللَّهُ الْمَوْتَىٰ وَيُرِيكُمْ ءَايَٰتِهِ لَعَلَّكُمْ تَعْقِلُونَ (٧٣)",
    "textEn": "When you disputed over a slain soul, Allah brings forth whatever you used to hide. So We commanded striking with part of it; thus Allah revives the dead and shows you His signs so that you may reason.",
    "source": "سورة البقرة: الآيتان ٧٢ - ٧٣",
    "sourceEn": "Surah Al-Baqarah: Verses 72-73"
  },
  {
    "id": "rq_quran_73",
    "type": "quran",
    "title": "سورة البقرة (الآيات ١٠٥ - ١٠٧ - دفع الحسد وولاية الله ونصرته)",
    "titleEn": "Surah Al-Baqarah (Verses 105-107 - Repelling Envy & Divine Care)",
    "text": "مَّا يَوَدُّ الَّذِينَ كَفَرُوا مِنْ أَهْلِ الْكِتَٰبِ وَلَا الْمُشْرِكِينَ أَن يُنَزَّلَ عَلَيْكُم مِّنْ خَيْرٍ مِّن رَّبِّكُمْ ۗ وَاللَّهُ يَخْتَصُّ بِرَحْمَتِهِ مَن يَشَاءُ ۚ وَاللَّهُ ذُو الْفَضْلِ الْعَظِيمِ (١٠٥) ۞ مَا نَنسَخْ مِنْ ءَايَةٍ أَوْ نُنسِهَا نَأْتِ بِخَيْرٍ مِّنْهَا أَوْ مِثْلِهَا ۗ أَلَمْ تَعْلَمْ أَنَّ اللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ (١٠٦) أَلَمْ تَعْلَمْ أَنَّ اللَّهَ لَهُ مُلْكُ السَّمَٰوَٰتِ وَالْأَرْضِ ۗ وَمَا لَكُم مِّن دُونِ اللَّهِ مِن وَلِىٍّ وَلَا نَصِيرٍ (١٠٧)",
    "textEn": "Allah chooses for His mercy whomever He wills, and Allah is Possessor of tremendous grace. None can overturn His decree, and to Allah belongs the dominion of the heavens and earth; besides Allah you have no protector or helper.",
    "source": "سورة البقرة: الآيات ١٠٥ - ١٠٧",
    "sourceEn": "Surah Al-Baqarah: Verses 105-107"
  },
  {
    "id": "rq_quran_74",
    "type": "quran",
    "title": "سورة البقرة (الآية ١٤٨ - شمول قدرة الله تعالى)",
    "titleEn": "Surah Al-Baqarah (Verse 148 - All-Encompassing Power of Allah)",
    "text": "وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا ۖ فَاسْتَبِقُوا الْخَيْرَٰتِ ۚ أَيْنَ مَا تَكُونُوا يَأْتِ بِكُمُ اللَّهُ جَمِيعًا ۚ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ (١٤٨)",
    "textEn": "Every people has a direction to which they turn, so race toward good deeds. Wherever you may be, Allah will bring you all together; surely Allah has power over every single thing.",
    "source": "سورة البقرة: آية ١٤٨",
    "sourceEn": "Surah Al-Baqarah: Verse 148"
  },
  {
    "id": "rq_quran_75",
    "type": "quran",
    "title": "سورة البقرة (الآيات ١٥٥ - ١٥٧ - الثبات عند البلاء والبشرى للصابرين)",
    "titleEn": "Surah Al-Baqarah (Verses 155-157 - Steadfastness & Glad Tidings)",
    "text": "وَلَنَبْلُوَنَّكُم بِشَىْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَٰلِ وَالْأَنفُسِ وَالثَّمَرَٰتِ ۗ وَبَشِّرِ الصَّٰبِرِينَ (١٥٥) الَّذِينَ إِذَا أَصَٰبَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَٰجِعُونَ (١٥٦) أُولَٰئِكَ عَلَيْهِمْ صَلَوَٰتٌ مِّن رَّبِّهِمْ وَرَحْمَةٌ ۖ وَأُولَٰئِكَ هُمُ الْمُهْتَدُونَ (١٥٧)",
    "textEn": "We will surely test you with some fear, hunger, and loss, so give glad tidings to the patient who say in affliction: To Allah we belong and to Him we return. Upon them are blessings and mercy from their Lord, and they are the rightly guided.",
    "source": "سورة البقرة: الآيات ١٥٥ - ١٥٧",
    "sourceEn": "Surah Al-Baqarah: Verses 155-157"
  },
  {
    "id": "rq_quran_76",
    "type": "quran",
    "title": "سورة البقرة (الآية ١٨٦ - قرب الله وإجابة دعوة الداعي)",
    "titleEn": "Surah Al-Baqarah (Verse 186 - Allah Answers the Supplicant)",
    "text": "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِى وَلْيُؤْمِنُوا بِى لَعَلَّهُمْ يَرْشُدُونَ (١٨٦)",
    "textEn": "When My servants ask you concerning Me, truly I am near; I respond to the call of the supplicant whenever he calls upon Me. So let them respond to Me and believe in Me that they may be rightly guided.",
    "source": "سورة البقرة: آية ١٨٦",
    "sourceEn": "Surah Al-Baqarah: Verse 186"
  },
  {
    "id": "rq_quran_77",
    "type": "quran",
    "title": "سورة البقرة (الآيات ٢٠٠ - ٢٠٢ - سؤال حسنة الدنيا والآخرة)",
    "titleEn": "Surah Al-Baqarah (Verses 200-202 - Goodness in Both Worlds)",
    "text": "فَإِذَا قَضَيْتُم مَّنَٰسِكَكُمْ فَاذْكُرُوا اللَّهَ كَذِكْرِكُمْ ءَابَاءَكُمْ أَوْ أَشَدَّ ذِكْرًا ۗ فَمِنَ النَّاسِ مَن يَقُولُ رَبَّنَا ءَاتِنَا فِى الدُّنْيَا وَمَا لَهُ فِى الْءَاخِرَةِ مِنْ خَلَٰقٍ (٢٠٠) وَمِنْهُم مَّن يَقُولُ رَبَّنَا ءَاتِنَا فِى الدُّنْيَا حَسَنَةً وَفِى الْءَاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ (٢٠١) أُولَٰئِكَ لَهُمْ نَصِيبٌ مِّمَّا كَسَبُوا ۚ وَاللَّهُ سَرِيعُ الْحِسَابِ (٢٠٢)",
    "textEn": "Among people are those who say: Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire. Those will have a share of what they earned, and Allah is swift in reckoning.",
    "source": "سورة البقرة: الآيات ٢٠٠ - ٢٠٢",
    "sourceEn": "Surah Al-Baqarah: Verses 200-202"
  },
  {
    "id": "rq_quran_78",
    "type": "quran",
    "title": "سورة البقرة (الآية ٢٤٨ - آية السكينة والطمأنينة الربانية)",
    "titleEn": "Surah Al-Baqarah (Verse 248 - Verse of Divine Tranquility)",
    "text": "وَقَالَ لَهُمْ نَبِيُّهُمْ إِنَّ ءَايَةَ مُلْكِهِ أَن يَأْتِيَكُمُ التَّابُوتُ فِيهِ سَكِينَةٌ مِّن رَّبِّكُمْ وَبَقِيَّةٌ مِّمَّا تَرَكَ ءَالُ مُوسَىٰ وَءَالُ هَٰرُونَ تَحْمِلُهُ الْمَلَٰئِكَةُ ۚ إِنَّ فِى ذَٰلِكَ لَءَايَةً لَّكُمْ إِن كُنتُم مُّؤْمِنِينَ (٢٤٨)",
    "textEn": "Their prophet told them the sign of his kingship is that the Ark will come to you containing serenity from your Lord and a remnant left by the family of Moses and Aaron, carried by the angels; truly therein is a sign if you are believers.",
    "source": "سورة البقرة: آية ٢٤٨",
    "sourceEn": "Surah Al-Baqarah: Verse 248"
  },
  {
    "id": "rq_quran_79",
    "type": "quran",
    "title": "سورة البقرة (الآية ٢٥٠ - إفراغ الصبر وتثبيت الأقدام)",
    "titleEn": "Surah Al-Baqarah (Verse 250 - Patience & Firmness)",
    "text": "وَلَمَّا بَرَزُوا لِجَالُوتَ وَجُنُودِهِ قَالُوا رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَٰفِرِينَ (٢٥٠)",
    "textEn": "When they went out to face Goliath and his forces, they prayed: Our Lord, pour patience upon us, plant our feet firmly, and grant us victory over the disbelieving people.",
    "source": "سورة البقرة: آية ٢٥٠",
    "sourceEn": "Surah Al-Baqarah: Verse 250"
  },
  {
    "id": "rq_quran_80",
    "type": "quran",
    "title": "سورة البقرة (الآية ٢٥٩ - إحياء العظام وإعادة القوة والشفاء)",
    "titleEn": "Surah Al-Baqarah (Verse 259 - Restoration of Strength & Healing)",
    "text": "أَوْ كَالَّذِى مَرَّ عَلَىٰ قَرْيَةٍ وَهِىَ خَاوِيَةٌ عَلَىٰ عُرُوشِهَا قَالَ أَنَّىٰ يُحْىِ هَٰذِهِ اللَّهُ بَعْدَ مَوْتِهَا ۖ فَأَمَاتَهُ اللَّهُ مِائَةَ عَامٍ ثُمَّ بَعَثَهُ ۖ قَالَ كَمْ لَبِثْتَ ۖ قَالَ لَبِثْتُ يَوْمًا أَوْ بَعْضَ يَوْمٍ ۖ قَالَ بَل لَّبِثْتَ مِائَةَ عَامٍ فَانظُرْ إِلَىٰ طَعَامِكَ وَشَرَابِكَ لَمْ يَتَسَنَّهْ ۖ وَانظُرْ إِلَىٰ حِمَارِكَ وَلِنَجْعَلَكَ ءَايَةً لِّلنَّاسِ ۖ وَانظُرْ إِلَى الْعِظَامِ كَيْفَ نُنشِزُهَا ثُمَّ نَكْسُوهَا لَحْمًا ۚ فَلَمَّا تَبَيَّنَ لَهُ قَالَ أَعْلَمُ أَنَّ اللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ (٢٥٩)",
    "textEn": "Look at your food and drink that have not spoiled, and look at your donkey, and see how We assemble the bones and clothe them with flesh. When it became clear to him, he declared: I know that Allah has power over all things.",
    "source": "سورة البقرة: آية ٢٥٩",
    "sourceEn": "Surah Al-Baqarah: Verse 259"
  },
  {
    "id": "rq_quran_81",
    "type": "quran",
    "title": "سورة البقرة (الآية ٢٦٠ - طمأنينة القلب بقدرة الله العزيز الحكيم)",
    "titleEn": "Surah Al-Baqarah (Verse 260 - Reassurance of the Heart)",
    "text": "وَإِذْ قَالَ إِبْرَٰهِمُ رَبِّ أَرِنِى كَيْفَ تُحْىِ الْمَوْتَىٰ ۖ قَالَ أَوَلَمْ تُؤْمِن ۖ قَالَ بَلَىٰ وَلَٰكِن لِّيَطْمَئِنَّ قَلْبِى ۖ قَالَ فَخُذْ أَرْبَعَةً مِّنَ الطَّيْرِ فَصُرْهُنَّ إِلَيْكَ ثُمَّ اجْعَلْ عَلَىٰ كُلِّ جَبَلٍ مِّنْهُنَّ جُزْءًا ثُمَّ ادْعُهُنَّ يَأْتِينَكَ سَعْيًا ۚ وَاعْلَمْ أَنَّ اللَّهَ عَزِيزٌ حَكِيمٌ (٢٦٠)",
    "textEn": "Abraham asked his Lord to show him how He revives the dead so his heart might be at ease. He was told to take four birds, place portions on the hills, and call them; they came swiftly. Know that Allah is Almighty, All-Wise.",
    "source": "سورة البقرة: آية ٢٦٠",
    "sourceEn": "Surah Al-Baqarah: Verse 260"
  },
  {
    "id": "rq_quran_82",
    "type": "quran",
    "title": "سورة آل عمران (الآيتان ٨ - ٩ - الثبات على الهداية وسؤال الرحمة)",
    "titleEn": "Surah Ali Imran (Verses 8-9 - Seeking Steadfastness & Mercy)",
    "text": "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ (٨) رَبَّنَا إِنَّكَ جَامِعُ النَّاسِ لِيَوْمٍ لَّا رَيْبَ فِيهِ ۚ إِنَّ اللَّهَ لَا يُخْلِفُ الْمِيعَادَ (٩)",
    "textEn": "Our Lord, do not let our hearts swerve after You have guided us, and bestow upon us mercy from Your presence; surely You are the Bestower. Our Lord, You will surely gather mankind for a Day free of doubt.",
    "source": "سورة آل عمران: الآيتان ٨ - ٩",
    "sourceEn": "Surah Ali Imran: Verses 8-9"
  },
  {
    "id": "rq_quran_83",
    "type": "quran",
    "title": "سورة آل عمران (الآيتان ٣٨ - ٣٩ - استجابة الدعاء والذرية الصالحة)",
    "titleEn": "Surah Ali Imran (Verses 38-39 - Answered Prayer & Righteous Offspring)",
    "text": "هُنَالِكَ دَعَا زَكَرِيَّا رَبَّهُ ۖ قَالَ رَبِّ هَبْ لِى مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ الدُّعَاءِ (٣٨) فَنَادَتْهُ الْمَلَٰئِكَةُ وَهُوَ قَائِمٌ يُصَلِّى فِى الْمِحْرَابِ أَنَّ اللَّهَ يُبَشِّرُكَ بِيَحْيَىٰ مُصَدِّقًا بِكَلِمَةٍ مِّنَ اللَّهِ وَسَيِّدًا وَحَصُورًا وَنَبِيًّا مِّنَ الصَّٰلِحِينَ (٣٩)",
    "textEn": "There Zakariyya prayed to his Lord: My Lord, grant me from Yourself righteous offspring; You are the Hearer of prayer. So the angels called him while he stood praying in the sanctuary with glad tidings of Yahya.",
    "source": "سورة آل عمران: الآيتان ٣٨ - ٣٩",
    "sourceEn": "Surah Ali Imran: Verses 38-39"
  },
  {
    "id": "rq_quran_84",
    "type": "quran",
    "title": "سورة آل عمران (الآية ١٢٠ - إبطال كيد الحاسدين بالصبر والتقوى)",
    "titleEn": "Surah Ali Imran (Verse 120 - Foiling Envy Through Patience & Piety)",
    "text": "إِن تَمْسَسْكُمْ حَسَنَةٌ تَسُؤْهُمْ وَإِن تُصِبْكُمْ سَيِّئَةٌ يَفْرَحُوا بِهَا ۖ وَإِن تَصْبِرُوا وَتَتَّقُوا لَا يَضُرُّكُمْ كَيْدُهُمْ شَيْـًٔا ۗ إِنَّ اللَّهَ بِمَا يَعْمَلُونَ مُحِيطٌ (١٢٠)",
    "textEn": "If good touches you it grieves them, and if harm strikes you they rejoice at it; yet if you remain patient and mindful of Allah, their scheming will not harm you at all. Allah encompasses whatever they do.",
    "source": "سورة آل عمران: آية ١٢٠",
    "sourceEn": "Surah Ali Imran: Verse 120"
  },
  {
    "id": "rq_quran_85",
    "type": "quran",
    "title": "سورة آل عمران (الآية ١٢٦ - بشرى النصر وطمأنينة القلب)",
    "titleEn": "Surah Ali Imran (Verse 126 - Glad Tidings & Reassurance)",
    "text": "وَمَا جَعَلَهُ اللَّهُ إِلَّا بُشْرَىٰ لَكُمْ وَلِتَطْمَئِنَّ قُلُوبُكُم بِهِ ۗ وَمَا النَّصْرُ إِلَّا مِنْ عِندِ اللَّهِ الْعَزِيزِ الْحَكِيمِ (١٢٦)",
    "textEn": "Allah made it only as glad tidings for you so that your hearts might be reassured thereby, and victory comes solely from Allah, the Almighty, the All-Wise.",
    "source": "سورة آل عمران: آية ١٢٦",
    "sourceEn": "Surah Ali Imran: Verse 126"
  },
  {
    "id": "rq_quran_86",
    "type": "quran",
    "title": "سورة آل عمران (الآيتان ١٣٩ - ١٤٠ - رفع الهمة وذهاب الوهن والحزن)",
    "titleEn": "Surah Ali Imran (Verses 139-140 - Removing Weakness & Grief)",
    "text": "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ (١٣٩) إِن يَمْسَسْكُمْ قَرْحٌ فَقَدْ مَسَّ الْقَوْمَ قَرْحٌ مِّثْلُهُ ۚ وَتِلْكَ الْأَيَّامُ نُدَاوِلُهَا بَيْنَ النَّاسِ وَلِيَعْلَمَ اللَّهُ الَّذِينَ ءَامَنُوا وَيَتَّخِذَ مِنكُمْ شُهَدَاءَ ۗ وَاللَّهُ لَا يُحِبُّ الظَّٰلِمِينَ (١٤٠)",
    "textEn": "Do not weaken and do not grieve, for you are superior if you are truly believers. If a wound touches you, a similar wound has touched others, and Allah alternates these days among people so He may know the faithful.",
    "source": "سورة آل عمران: الآيتان ١٣٩ - ١٤٠",
    "sourceEn": "Surah Ali Imran: Verses 139-140"
  },
  {
    "id": "rq_quran_87",
    "type": "quran",
    "title": "سورة آل عمران (الآيات ١٤٥ - ١٤٨ - تفويض الآجال وطلب النصر والثبات)",
    "titleEn": "Surah Ali Imran (Verses 145-148 - Life Terms in Allahs Hand)",
    "text": "وَمَا كَانَ لِنَفْسٍ أَن تَمُوتَ إِلَّا بِإِذْنِ اللَّهِ كِتَٰبًا مُّؤَجَّلًا ۗ وَمَن يُرِدْ ثَوَابَ الدُّنْيَا نُؤْتِهِ مِنْهَا وَمَن يُرِدْ ثَوَابَ الْءَاخِرَةِ نُؤْتِهِ مِنْهَا ۚ وَسَنَجْزِى الشَّٰكِرِينَ (١٤٥) وَكَأَيِّن مِّن نَّبِىٍّ قَٰتَلَ مَعَهُ رِبِّيُّونَ كَثِيرٌ فَمَا وَهَنُوا لِمَا أَصَابَهُمْ فِى سَبِيلِ اللَّهِ وَمَا ضَعُفُوا وَمَا اسْتَكَانُوا ۗ وَاللَّهُ يُحِبُّ الصَّٰبِرِينَ (١٤٦) وَمَا كَانَ قَوْلَهُمْ إِلَّا أَن قَالُوا رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِى أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَٰفِرِينَ (١٤٧) فَـَٔاتَىٰهُمُ اللَّهُ ثَوَابَ الدُّنْيَا وَحُسْنَ ثَوَابِ الْءَاخِرَةِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ (١٤٨)",
    "textEn": "No soul dies except by Allahs permission at a decreed term. Many prophets fought alongside devout companions who never weakened; their prayer was: Our Lord, forgive our sins and excesses, plant our feet firmly, and grant us victory.",
    "source": "سورة آل عمران: الآيات ١٤٥ - ١٤٨",
    "sourceEn": "Surah Ali Imran: Verses 145-148"
  },
  {
    "id": "rq_quran_88",
    "type": "quran",
    "title": "سورة آل عمران (الآية ١٥٤ - إنزال الأمنة والسكينة في الشدائد)",
    "titleEn": "Surah Ali Imran (Verse 154 - Tranquil Slumber After Distress)",
    "text": "ثُمَّ أَنزَلَ عَلَيْكُم مِّن بَعْدِ الْغَمِّ أَمَنَةً نُّعَاسًا يَغْشَىٰ طَائِفَةً مِّنكُمْ ۖ وَطَائِفَةٌ قَدْ أَهَمَّتْهُمْ أَنفُسُهُمْ يَظُنُّونَ بِاللَّهِ غَيْرَ الْحَقِّ ظَنَّ الْجَٰهِلِيَّةِ ۖ يَقُولُونَ هَل لَّنَا مِنَ الْأَمْرِ مِن شَىْءٍ ۗ قُلْ إِنَّ الْأَمْرَ كُلَّهُ لِلَّهِ ۗ يُخْفُونَ فِى أَنفُسِهِم مَّا لَا يُبْدُونَ لَكَ ۖ يَقُولُونَ لَوْ كَانَ لَنَا مِنَ الْأَمْرِ شَىْءٌ مَّا قُتِلْنَا هَٰهُنَا ۗ قُل لَّوْ كُنتُمْ فِى بُيُوتِكُمْ لَبَرَزَ الَّذِينَ كُتِبَ عَلَيْهِمُ الْقَتْلُ إِلَىٰ مَضَاجِعِهِمْ ۖ وَلِيَبْتَلِىَ اللَّهُ مَا فِى صُدُورِكُمْ وَلِيُمَحِّصَ مَا فِى قُلُوبِكُمْ ۗ وَاللَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ (١٥٤)",
    "textEn": "Then after grief He sent down security upon you—a peaceful slumber overcoming a group among you. Say: All authority belongs completely to Allah. Allah knows fully what lies within every chest.",
    "source": "سورة آل عمران: آية ١٥٤",
    "sourceEn": "Surah Ali Imran: Verse 154"
  },
  {
    "id": "rq_quran_89",
    "type": "quran",
    "title": "سورة آل عمران (الآيات ١٧٣ - ١٧٥ - حسبنا الله ونعم الوكيل لرد كيد الشيطان)",
    "titleEn": "Surah Ali Imran (Verses 173-175 - Allah Suffices Us Against Satan)",
    "text": "الَّذِينَ قَالَ لَهُمُ النَّاسُ إِنَّ النَّاسَ قَدْ جَمَعُوا لَكُمْ فَاخْشَوْهُمْ فَزَادَهُمْ إِيمَٰنًا وَقَالُوا حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ (١٧٣) فَانقَلَبُوا بِنِعْمَةٍ مِّنَ اللَّهِ وَفَضْلٍ لَّمْ يَمْسَسْهُمْ سُوءٌ وَاتَّبَعُوا رِضْوَٰنَ اللَّهِ ۗ وَاللَّهُ ذُو فَضْلٍ عَظِيمٍ (١٧٤) إِنَّمَا ذَٰلِكُمُ الشَّيْطَٰنُ يُخَوِّفُ أَوْلِيَاءَهُ فَلَا تَخَافُوهُمْ وَخَافُونِ إِن كُنتُم مُّؤْمِنِينَ (١٧٥)",
    "textEn": "When warned of gathered foes, their faith increased and they said: Allah suffices us and He is the best Disposer of affairs. So they returned with grace and favor from Allah untouched by harm; it is only Satan who frightens his allies.",
    "source": "سورة آل عمران: الآيات ١٧٣ - ١٧٥",
    "sourceEn": "Surah Ali Imran: Verses 173-175"
  },
  {
    "id": "rq_quran_90",
    "type": "quran",
    "title": "سورة النساء (الآية ٤٥ - كفاية ولاية الله ونصرته)",
    "titleEn": "Surah An-Nisa (Verse 45 - Allah Is Sufficient as Protector & Helper)",
    "text": "وَاللَّهُ أَعْلَمُ بِأَعْدَائِكُمْ ۚ وَكَفَىٰ بِاللَّهِ وَلِيًّا وَكَفَىٰ بِاللَّهِ نَصِيرًا (٤٥)",
    "textEn": "Allah knows best who your enemies are, and Allah suffices as an ally, and Allah suffices as a helper.",
    "source": "سورة النساء: آية ٤٥",
    "sourceEn": "Surah An-Nisa: Verse 45"
  },
  {
    "id": "rq_quran_91",
    "type": "quran",
    "title": "سورة النساء (الآيتان ٧٥ - ٧٦ - وهن وضعف كيد الشيطان)",
    "titleEn": "Surah An-Nisa (Verses 75-76 - Satans Plot Is Ever Feeble)",
    "text": "وَمَا لَكُمْ لَا تُقَٰتِلُونَ فِى سَبِيلِ اللَّهِ وَالْمُسْتَضْعَفِينَ مِنَ الرِّجَالِ وَالنِّسَاءِ وَالْوِلْدَٰنِ الَّذِينَ يَقُولُونَ رَبَّنَا أَخْرِجْنَا مِنْ هَٰذِهِ الْقَرْيَةِ الظَّالِمِ أَهْلُهَا وَاجْعَل لَّنَا مِن لَّدُنكَ وَلِيًّا وَاجْعَل لَّنَا مِن لَّدُنكَ نَصِيرًا (٧٥) الَّذِينَ ءَامَنُوا يُقَٰتِلُونَ فِى سَبِيلِ اللَّهِ ۖ وَالَّذِينَ كَفَرُوا يُقَٰتِلُونَ فِى سَبِيلِ الطَّٰغُوتِ فَقَٰتِلُوا أَوْلِيَاءَ الشَّيْطَٰنِ ۖ إِنَّ كَيْدَ الشَّيْطَٰنِ كَانَ ضَعِيفًا (٧٦)",
    "textEn": "Our Lord, rescue us from this oppressive city and appoint for us from You a protector and helper. Those who believe strive in Allahs cause; so stand firm against Satans allies, for surely the plotting of Satan is ever weak.",
    "source": "سورة النساء: الآيتان ٧٥ - ٧٦",
    "sourceEn": "Surah An-Nisa: Verses 75-76"
  },
  {
    "id": "rq_quran_92",
    "type": "quran",
    "title": "سورة النساء (الآية ٨١ - الإعراض عن المؤذين والتوكل على الله)",
    "titleEn": "Surah An-Nisa (Verse 81 - Turning Away & Trusting Allah)",
    "text": "وَيَقُولُونَ طَاعَةٌ فَإِذَا بَرَزُوا مِنْ عِندِكَ بَيَّتَ طَائِفَةٌ مِّنْهُمْ غَيْرَ الَّذِى تَقُولُ ۖ وَاللَّهُ يَكْتُبُ مَا يُبَيِّتُونَ ۖ فَأَعْرِضْ عَنْهُمْ وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا (٨١)",
    "textEn": "So turn away from their scheming and put your trust completely in Allah; and Allah is fully sufficient as a Disposer of affairs.",
    "source": "سورة النساء: آية ٨١",
    "sourceEn": "Surah An-Nisa: Verse 81"
  },
  {
    "id": "rq_quran_93",
    "type": "quran",
    "title": "سورة النساء (الآية ١١٣ - عصمة الله وحفظه وفضله العظيم)",
    "titleEn": "Surah An-Nisa (Verse 113 - Protection Against Misleading Plots)",
    "text": "وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكَ وَرَحْمَتُهُ لَهَمَّت طَّائِفَةٌ مِّنْهُمْ أَن يُضِلُّوكَ وَمَا يُضِلُّونَ إِلَّا أَنفُسَهُمْ ۖ وَمَا يَضُرُّونَكَ مِن شَىْءٍ ۚ وَأَنزَلَ اللَّهُ عَلَيْكَ الْكِتَٰبَ وَالْحِكْمَةَ وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ ۚ وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا (١١٣)",
    "textEn": "Were it not for Allahs grace and mercy upon you, a faction intended to mislead you, yet they only mislead themselves and cannot harm you at all. Allah revealed to you the Book and wisdom, and His grace upon you is immense.",
    "source": "سورة النساء: آية ١١٣",
    "sourceEn": "Surah An-Nisa: Verse 113"
  },
  {
    "id": "rq_quran_94",
    "type": "quran",
    "title": "سورة النساء (الآية ١٤١ - نفي تسلط المعتدين على المؤمنين)",
    "titleEn": "Surah An-Nisa (Verse 141 - No Way for Disbelievers Over Believers)",
    "text": "الَّذِينَ يَتَرَبَّصُونَ بِكُمْ فَإِن كَانَ لَكُمْ فَتْحٌ مِّنَ اللَّهِ قَالُوا أَلَمْ نَكُن مَّعَكُمْ وَإِن كَانَ لِلْكَٰفِرِينَ نَصِيبٌ قَالُوا أَلَمْ نَسْتَحْوِذْ عَلَيْكُمْ وَنَمْنَعْكُم مِّنَ الْمُؤْمِنِينَ ۚ فَاللَّهُ يَحْكُمُ بَيْنَكُمْ يَوْمَ الْقِيَٰمَةِ ۗ وَلَن يَجْعَلَ اللَّهُ لِلْكَٰفِرِينَ عَلَى الْمُؤْمِنِينَ سَبِيلًا (١٤١)",
    "textEn": "Allah will judge between all people on the Day of Resurrection, and never will Allah grant disbelievers any way of dominance over the believers.",
    "source": "سورة النساء: آية ١٤١",
    "sourceEn": "Surah An-Nisa: Verse 141"
  },
  {
    "id": "rq_quran_95",
    "type": "quran",
    "title": "سورة المائدة (الآية ١١ - كف أيدي المعتدين وتقوى الله)",
    "titleEn": "Surah Al-Maidah (Verse 11 - Restraining the Hands of Harm)",
    "text": "يَٰأَيُّهَا الَّذِينَ ءَامَنُوا اذْكُرُوا نِعْمَتَ اللَّهِ عَلَيْكُمْ إِذْ هَمَّ قَوْمٌ أَن يَبْسُطُوا إِلَيْكُمْ أَيْدِيَهُمْ فَكَفَّ أَيْدِيَهُمْ عَنكُمْ ۖ وَاتَّقُوا اللَّهَ ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ (١١)",
    "textEn": "O believers, remember Allahs favor upon you when a people resolved to stretch their hands against you, yet He held back their hands from you; so be mindful of Allah and let believers rely upon Him.",
    "source": "سورة المائدة: آية ١١",
    "sourceEn": "Surah Al-Maidah: Verse 11"
  },
  {
    "id": "rq_quran_96",
    "type": "quran",
    "title": "سورة المائدة (الآية ٢٣ - التوكل والفتح القريب)",
    "titleEn": "Surah Al-Maidah (Verse 23 - Trust in Allah Brings Triumph)",
    "text": "قَالَ رَجُلَانِ مِنَ الَّذِينَ يَخَافُونَ أَنْعَمَ اللَّهُ عَلَيْهِمَا ادْخُلُوا عَلَيْهِمُ الْبَابَ فَإِذَا دَخَلْتُمُوهُ فَإِنَّكُمْ غَٰلِبُونَ ۚ وَعَلَى اللَّهِ فَتَوَكَّلُوا إِن كُنتُم مُّؤْمِنِينَ (٢٣)",
    "textEn": "Two God-fearing men favored by Allah said: Enter through the gate, for once you enter you shall prevail; and place your trust in Allah if you are truly believers.",
    "source": "سورة المائدة: آية ٢٣",
    "sourceEn": "Surah Al-Maidah: Verse 23"
  },
  {
    "id": "rq_quran_97",
    "type": "quran",
    "title": "سورة المائدة (الآية ٦٤ - إطفاء نار الفساد والعداوة)",
    "titleEn": "Surah Al-Maidah (Verse 64 - Extinguishing Fires of Mischief)",
    "text": "وَقَالَتِ الْيَهُودُ يَدُ اللَّهِ مَغْلُولَةٌ ۚ غُلَّتْ أَيْدِيهِمْ وَلُعِنُوا بِمَا قَالُوا ۘ بَلْ يَدَاهُ مَبْسُوطَتَانِ يُنفِقُ كَيْفَ يَشَاءُ ۚ وَلَيَزِيدَنَّ كَثِيرًا مِّنْهُم مَّا أُنزِلَ إِلَيْكَ مِن رَّبِّكَ طُغْيَٰنًا وَكُفْرًا ۚ وَأَلْقَيْنَا بَيْنَهُمُ الْعَدَٰوَةَ وَالْبَغْضَاءَ إِلَىٰ يَوْمِ الْقِيَٰمَةِ ۚ كُلَّمَا أَوْقَدُوا نَارًا لِّلْحَرْبِ أَطْفَأَهَا اللَّهُ ۚ وَيَسْعَوْنَ فِى الْأَرْضِ فَسَادًا ۚ وَاللَّهُ لَا يُحِبُّ الْمُفْسِدِينَ (٦٤)",
    "textEn": "Both of His hands are outstretched; He gives however He wills. Every time they kindle a fire of war and mischief, Allah extinguishes it; Allah does not love corrupters.",
    "source": "سورة المائدة: آية ٦٤",
    "sourceEn": "Surah Al-Maidah: Verse 64"
  },
  {
    "id": "rq_quran_98",
    "type": "quran",
    "title": "سورة المائدة (الآية ٦٧ - آية العصمة والحماية من أذى الخلق)",
    "titleEn": "Surah Al-Maidah (Verse 67 - Allah Protects You from People)",
    "text": "۞ يَٰأَيُّهَا الرَّسُولُ بَلِّغْ مَا أُنزِلَ إِلَيْكَ مِن رَّبِّكَ ۖ وَإِن لَّمْ تَفْعَلْ فَمَا بَلَّغْتَ رِسَالَتَهُ ۚ وَاللَّهُ يَعْصِمُكَ مِنَ النَّاسِ ۗ إِنَّ اللَّهَ لَا يَهْدِى الْقَوْمَ الْكَٰفِرِينَ (٦٧)",
    "textEn": "Deliver what has been sent down to you from your Lord; and Allah will protect you from all people. Truly Allah does not guide disbelieving folk.",
    "source": "سورة المائدة: آية ٦٧",
    "sourceEn": "Surah Al-Maidah: Verse 67"
  },
  {
    "id": "rq_quran_99",
    "type": "quran",
    "title": "سورة الأنعام (الآيات ١ - ٣ - خالق الظلمات والنور وعالم السر)",
    "titleEn": "Surah Al-Anam (Verses 1-3 - Creator of Light & Knower of Secrets)",
    "text": "الْحَمْدُ لِلَّهِ الَّذِى خَلَقَ السَّمَٰوَٰتِ وَالْأَرْضَ وَجَعَلَ الظُّلُمَٰتِ وَالنُّورَ ۖ ثُمَّ الَّذِينَ كَفَرُوا بِرَبِّهِمْ يَعْدِلُونَ (١) هُوَ الَّذِى خَلَقَكُم مِّن طِينٍ ثُمَّ قَضَىٰ أَجَلًا ۖ وَأَجَلٌ مُّسَمًّى عِندَهُ ۖ ثُمَّ أَنتُمْ تَمْتَرُونَ (٢) وَهُوَ اللَّهُ فِى السَّمَٰوَٰتِ وَفِى الْأَرْضِ ۖ يَعْلَمُ سِرَّكُمْ وَجَهْرَكُمْ وَيَعْلَمُ مَا تَكْسِبُونَ (٣)",
    "textEn": "Praise belongs to Allah who created the heavens and earth and made darkness and light. He is Allah in the heavens and on earth; He knows your secrets and open deeds and knows what you earn.",
    "source": "سورة الأنعام: الآيات ١ - ٣",
    "sourceEn": "Surah Al-Anam: Verses 1-3"
  },
  {
    "id": "rq_quran_100",
    "type": "quran",
    "title": "سورة الأنعام (الآيات ١٢ - ١٤ - كتابة الرحمة وملك ما في الليل والنهار)",
    "titleEn": "Surah Al-Anam (Verses 12-14 - Decree of Mercy Over Creation)",
    "text": "قُل لِّمَن مَّا فِى السَّمَٰوَٰتِ وَالْأَرْضِ ۖ قُل لِّلَّهِ ۚ كَتَبَ عَلَىٰ نَفْسِهِ الرَّحْمَةَ ۚ لَيَجْمَعَنَّكُمْ إِلَىٰ يَوْمِ الْقِيَٰمَةِ لَا رَيْبَ فِيهِ ۚ الَّذِينَ خَسِرُوا أَنفُسَهُمْ فَهُمْ لَا يُؤْمِنُونَ (١٢) ۞ وَلَهُ مَا سَكَنَ فِى الَّيْلِ وَالنَّهَارِ ۚ وَهُوَ السَّمِيعُ الْعَلِيمُ (١٣) قُلْ أَغَيْرَ اللَّهِ أَتَّخِذُ وَلِيًّا فَاطِرِ السَّمَٰوَٰتِ وَالْأَرْضِ وَهُوَ يُطْعِمُ وَلَا يُطْعَمُ ۗ قُلْ إِنِّى أُمِرْتُ أَنْ أَكُونَ أَوَّلَ مَنْ أَسْلَمَ ۖ وَلَا تَكُونَنَّ مِنَ الْمُشْرِكِينَ (١٤)",
    "textEn": "To Allah belongs all that dwells in the night and day; He has prescribed mercy upon Himself. Shall I take any protector other than Allah, Originator of the heavens and earth, who feeds and is never fed?",
    "source": "سورة الأنعام: الآيات ١٢ - ١٤",
    "sourceEn": "Surah Al-Anam: Verses 12-14"
  },
  {
    "id": "rq_quran_101",
    "type": "quran",
    "title": "سورة الأنعام (الآية ١٨ - القاهر فوق عباده الحكيم الخبير)",
    "titleEn": "Surah Al-Anam (Verse 18 - Supreme Dominator Over His Servants)",
    "text": "وَهُوَ الْقَاهِرُ فَوْقَ عِبَادِهِ ۚ وَهُوَ الْحَكِيمُ الْخَبِيرُ (١٨)",
    "textEn": "And He is the Supreme Subjugator over all His servants, and He is the All-Wise, the All-Aware.",
    "source": "سورة الأنعام: آية ١٨",
    "sourceEn": "Surah Al-Anam: Verse 18"
  },
  {
    "id": "rq_quran_102",
    "type": "quran",
    "title": "سورة الأنعام (الآية ٤٥ - قطع دابر الظالمين المؤذين)",
    "titleEn": "Surah Al-Anam (Verse 45 - Cutting Off the Roots of Oppressors)",
    "text": "فَقُطِعَ دَابِرُ الْقَوْمِ الَّذِينَ ظَلَمُوا ۚ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَٰلَمِينَ (٤٥)",
    "textEn": "So the last remnant of the wrongdoing people was cut off, and all praise belongs to Allah, Lord of all worlds.",
    "source": "سورة الأنعام: آية ٤٥",
    "sourceEn": "Surah Al-Anam: Verse 45"
  },
  {
    "id": "rq_quran_103",
    "type": "quran",
    "title": "سورة الأنعام (الآية ٥٩ - مفاتح الغيب وإحاطة علم الله)",
    "titleEn": "Surah Al-Anam (Verse 59 - Keys of the Unseen)",
    "text": "۞ وَعِندَهُ مَفَاتِحُ الْغَيْبِ لَا يَعْلَمُهَا إِلَّا هُوَ ۚ وَيَعْلَمُ مَا فِى الْبَرِّ وَالْبَحْرِ ۚ وَمَا تَسْقُطُ مِن وَرَقَةٍ إِلَّا يَعْلَمُهَا وَلَا حَبَّةٍ فِى ظُلُمَٰتِ الْأَرْضِ وَلَا رَطْبٍ وَلَا يَابِسٍ إِلَّا فِى كِتَٰبٍ مُّبِينٍ (٥٩)",
    "textEn": "With Him are the keys of the unseen; none knows them except Him. He knows what is on land and in the sea; not a leaf falls without His knowledge, all recorded in a clear Book.",
    "source": "سورة الأنعام: آية ٥٩",
    "sourceEn": "Surah Al-Anam: Verse 59"
  },
  {
    "id": "rq_quran_104",
    "type": "quran",
    "title": "سورة الأنعام (الآيتان ٦١ - ٦٢ - إرسال الملائكة الحفظة)",
    "titleEn": "Surah Al-Anam (Verses 61-62 - Sending Guardian Angels)",
    "text": "وَهُوَ الْقَاهِرُ فَوْقَ عِبَادِهِ ۖ وَيُرْسِلُ عَلَيْكُمْ حَفَظَةً حَتَّىٰ إِذَا جَاءَ أَحَدَكُمُ الْمَوْتُ تَوَفَّتْهُ رُسُلُنَا وَهُمْ لَا يُفَرِّطُونَ (٦١) ثُمَّ رُدُّوا إِلَى اللَّهِ مَوْلَىٰهُمُ الْحَقِّ ۚ أَلَا لَهُ الْحُكْمُ وَهُوَ أَسْرَعُ الْحَٰسِبِينَ (٦٢)",
    "textEn": "He is Supreme over His servants and sends guardian angels over you, until death reaches one and His messengers take the soul faithfully. Then all return to Allah, their True Master.",
    "source": "سورة الأنعام: الآيتان ٦١ - ٦٢",
    "sourceEn": "Surah Al-Anam: Verses 61-62"
  },
  {
    "id": "rq_quran_105",
    "type": "quran",
    "title": "سورة الأنعام (الآيتان ٦٣ - ٦٤ - منجي من كل كرب وشدة)",
    "titleEn": "Surah Al-Anam (Verses 63-64 - Deliverer from Every Distress)",
    "text": "قُلْ مَن يُنَجِّيكُم مِّن ظُلُمَٰتِ الْبَرِّ وَالْبَحْرِ تَدْعُونَهُ تَضَرُّعًا وَخُفْيَةً لَّئِنْ أَنجَىٰنَا مِنْ هَٰذِهِ لَنَكُونَنَّ مِنَ الشَّٰكِرِينَ (٦٣) قُلِ اللَّهُ يُنَجِّيكُم مِّنْهَا وَمِن كُلِّ كَرْبٍ ثُمَّ أَنتُمْ تُشْرِكُونَ (٦٤)",
    "textEn": "Who rescues you from the darkness of land and sea when you call upon Him humbly? Say: It is Allah who rescues you from them and from every distress, yet people still associate partners.",
    "source": "سورة الأنعام: الآيتان ٦٣ - ٦٤",
    "sourceEn": "Surah Al-Anam: Verses 63-64"
  },
  {
    "id": "rq_quran_106",
    "type": "quran",
    "title": "سورة الأنعام (الآيتان ٧١ - ٧٢ - الهداية من الحيرة والتخبط)",
    "titleEn": "Surah Al-Anam (Verses 71-72 - True Guidance Over Confusion)",
    "text": "قُلْ أَنَدْعُوا مِن دُونِ اللَّهِ مَا لَا يَنفَعُنَا وَلَا يَضُرُّنَا وَنُرَدُّ عَلَىٰ أَعْقَابِنَا بَعْدَ إِذْ هَدَىٰنَا اللَّهُ كَالَّذِى اسْتَهْوَتْهُ الشَّيَٰطِينُ فِى الْأَرْضِ حَيْرَانَ لَهُ أَصْحَٰبٌ يَدْعُونَهُ إِلَى الْهُدَى ائْتِنَا ۗ قُلْ إِنَّ هُدَى اللَّهِ هُوَ الْهُدَىٰ ۖ وَأُمِرْنَا لِنُسْلِمَ لِرَبِّ الْعَٰلَمِينَ (٧١) وَأَنْ أَقِيمُوا الصَّلَوٰةَ وَاتَّقُوهُ ۚ وَهُوَ الَّذِى إِلَيْهِ تُحْشَرُونَ (٧٢)",
    "textEn": "Say: Truly Allahs guidance is the only real guidance, and we are commanded to submit to the Lord of all worlds, establish prayer, and remain mindful of Him, for to Him we shall all be gathered.",
    "source": "سورة الأنعام: الآيتان ٧١ - ٧٢",
    "sourceEn": "Surah Al-Anam: Verses 71-72"
  },
  {
    "id": "rq_quran_107",
    "type": "quran",
    "title": "سورة الأنعام (الآية ١٢٢ - إحياء القلب والنور الرباني)",
    "titleEn": "Surah Al-Anam (Verse 122 - Revival of Heart & Divine Light)",
    "text": "أَوَمَن كَانَ مَيْتًا فَأَحْيَيْنَٰهُ وَجَعَلْنَا لَهُ نُورًا يَمْشِى بِهِ فِى النَّاسِ كَمَن مَّثَلُهُ فِى الظُّلُمَٰتِ لَيْسَ بِخَارِجٍ مِّنْهَا ۚ كَذَٰلِكَ زُيِّنَ لِلْكَٰفِرِينَ مَا كَانُوا يَعْمَلُونَ (١٢٢)",
    "textEn": "Is one who was lifeless and whom We revived and gave a light by which he walks among people like one trapped in darkness never able to emerge from it?",
    "source": "سورة الأنعام: آية ١٢٢",
    "sourceEn": "Surah Al-Anam: Verse 122"
  },
  {
    "id": "rq_quran_108",
    "type": "quran",
    "title": "سورة الأعراف (الآيتان ١٢٨ - ١٢٩ - الاستعانة بالله والصبر على الأذى)",
    "titleEn": "Surah Al-Araf (Verses 128-129 - Seeking Allahs Help & Patience)",
    "text": "قَالَ مُوسَىٰ لِقَوْمِهِ اسْتَعِينُوا بِاللَّهِ وَاصْبِرُوا ۖ إِنَّ الْأَرْضَ لِلَّهِ يُورِثُهَا مَن يَشَاءُ مِنْ عِبَادِهِ ۖ وَالْعَٰقِبَةُ لِلْمُتَّقِينَ (١٢٨) قَالُوا أُوذِينَا مِن قَبْلِ أَن تَأْتِيَنَا وَمِن بَعْدِ مَا جِئْتَنَا ۚ قَالَ عَسَىٰ رَبُّكُمْ أَن يُهْلِكَ عَدُوَّكُمْ وَيَسْتَخْلِفَكُمْ فِى الْأَرْضِ فَيَنظُرَ كَيْفَ تَعْمَلُونَ (١٢٩)",
    "textEn": "Moses told his people: Seek help in Allah and be patient; the earth belongs to Allah, who grants it to whom He wills, and the blessed end belongs to the righteous. Perhaps your Lord will destroy your enemy and establish you.",
    "source": "سورة الأعراف: الآيتان ١٢٨ - ١٢٩",
    "sourceEn": "Surah Al-Araf: Verses 128-129"
  },
  {
    "id": "rq_quran_109",
    "type": "quran",
    "title": "سورة الأعراف (الآية ١٩٦ - ولاية الله للصالحين وحفظهم)",
    "titleEn": "Surah Al-Araf (Verse 196 - Allah Protects the Righteous)",
    "text": "إِنَّ وَلِِّىَ اللَّهُ الَّذِى نَزَّلَ الْكِتَٰبَ ۖ وَهُوَ يَتَوَلَّى الصَّٰلِحِينَ (١٩٦)",
    "textEn": "Surely my Protector is Allah who revealed the Book, and He takes care of and protects the righteous.",
    "source": "سورة الأعراف: آية ١٩٦",
    "sourceEn": "Surah Al-Araf: Verse 196"
  },
  {
    "id": "rq_quran_110",
    "type": "quran",
    "title": "سورة الأعراف (الآيتان ٢٠٠ - ٢٠١ - دفع نزغ الشيطان ووسوسته)",
    "titleEn": "Surah Al-Araf (Verses 200-201 - Seeking Refuge from Satans Whisper)",
    "text": "وَإِمَّا يَنزَغَنَّكَ مِنَ الشَّيْطَٰنِ نَزْغٌ فَاسْتَعِذْ بِاللَّهِ ۚ إِنَّهُ سَمِيعٌ عَلِيمٌ (٢٠٠) إِنَّ الَّذِينَ اتَّقَوْا إِذَا مَسَّهُمْ طَٰئِفٌ مِّنَ الشَّيْطَٰنِ تَذَكَّرُوا فَإِذَا هُم مُّبْصِرُونَ (٢٠١)",
    "textEn": "If a prompting from Satan assails you, seek refuge immediately in Allah; He is All-Hearing, All-Knowing. Truly when a passing touch of Satan troubles the God-fearing, they remember Allah and immediately see clearly.",
    "source": "سورة الأعراف: الآيتان ٢٠٠ - ٢٠١",
    "sourceEn": "Surah Al-Araf: Verses 200-201"
  },
  {
    "id": "rq_quran_111",
    "type": "quran",
    "title": "سورة الأنفال (الآيات ٩ - ١٢ - إنزال السكينة والنصر وإلقاء الرعب في المعتدين)",
    "titleEn": "Surah Al-Anfal (Verses 9-12 - Serenity, Angels & Divine Support)",
    "text": "إِذْ تَسْتَغِيثُونَ رَبَّكُمْ فَاسْتَجَابَ لَكُمْ أَنِّى مُمِدُّكُم بِأَلْفٍ مِّنَ الْمَلَٰئِكَةِ مُرْدِفِينَ (٩) وَمَا جَعَلَهُ اللَّهُ إِلَّا بُشْرَىٰ وَلِتَطْمَئِنَّ بِهِ قُلُوبُكُمْ ۚ وَمَا النَّصْرُ إِلَّا مِنْ عِندِ اللَّهِ ۚ إِنَّ اللَّهَ عَزِيزٌ حَكِيمٌ (١٠) إِذْ يُغَشِّيكُمُ النُّعَاسَ أَمَنَةً مِّنْهُ وَيُنَزِّلُ عَلَيْكُم مِّنَ السَّمَاءِ مَاءً لِّيُطَهِّرَكُم بِهِ وَيُذْهِبَ عَنكُمْ رِجْزَ الشَّيْطَٰنِ وَلِيَرْبِطَ عَلَىٰ قُلُوبِكُمْ وَيُثَبِّتَ بِهِ الْأَقْدَامَ (١١) إِذْ يُوحِى رَبُّكَ إِلَى الْمَلَٰئِكَةِ أَنِّى مَعَكُمْ فَثَبِّتُوا الَّذِينَ ءَامَنُوا ۚ سَأُلْقِى فِى قُلُوبِ الَّذِينَ كَفَرُوا الرُّعْبَ فَاضْرِبُوا فَوْقَ الْأَعْنَاقِ وَاضْرِبُوا مِنْهُمْ كُلَّ بَنَانٍ (١٢)",
    "textEn": "When you cried out to your Lord for help, He answered you with reinforcing angels as glad tidings to reassure your hearts. He covered you with peaceful slumber as security and sent purifying water from the sky to strengthen your hearts and plant your feet firmly.",
    "source": "سورة الأنفال: الآيات ٩ - ١٢",
    "sourceEn": "Surah Al-Anfal: Verses 9-12"
  },
  {
    "id": "rq_quran_112",
    "type": "quran",
    "title": "سورة الأنفال (الآية ١٧ - نصر الله وبلاء المؤمنين الحسن)",
    "titleEn": "Surah Al-Anfal (Verse 17 - Allah Grants Victory & Goodly Trial)",
    "text": "فَلَمْ تَقْتُلُوهُمْ وَلَٰكِنَّ اللَّهَ قَتَلَهُمْ ۚ وَمَا رَمَيْتَ إِذْ رَمَيْتَ وَلَٰكِنَّ اللَّهَ رَمَىٰ ۚ وَلِيُبْلِىَ الْمُؤْمِنِينَ مِنْهُ بَلَاءً حَسَنًا ۚ إِنَّ اللَّهَ سَمِيعٌ عَلِيمٌ (١٧)",
    "textEn": "It was not you who overcame them, rather Allah overcame them and guided your aim so He might favor the believers with a gracious trial; Allah is All-Hearing, All-Knowing.",
    "source": "سورة الأنفال: آية ١٧",
    "sourceEn": "Surah Al-Anfal: Verse 17"
  },
  {
    "id": "rq_quran_113",
    "type": "quran",
    "title": "سورة الأنفال (الآية ٤٠ - نعم المولى ونعم النصير)",
    "titleEn": "Surah Al-Anfal (Verse 40 - The Best Protector & Helper)",
    "text": "وَإِن تَوَلَّوْا فَاعْلَمُوا أَنَّ اللَّهَ مَوْلَىٰكُمْ ۚ نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ (٤٠)",
    "textEn": "Know that Allah is your Protector—what an excellent Protector and what an excellent Helper!",
    "source": "سورة الأنفال: آية ٤٠",
    "sourceEn": "Surah Al-Anfal: Verse 40"
  },
  {
    "id": "rq_quran_114",
    "type": "quran",
    "title": "سورة التوبة (الآية ٢٦ - آية السكينة ونزول الطمأنينة الإلهية)",
    "titleEn": "Surah At-Tawbah (Verse 26 - Allah Sent Down His Serenity)",
    "text": "ثُمَّ أَنزَلَ اللَّهُ سَكِينَتَهُ عَلَىٰ رَسُولِهِ وَعَلَى الْمُؤْمِنِينَ وَأَنزَلَ جُنُودًا لَّمْ تَرَوْهَا وَعَذَّبَ الَّذِينَ كَفَرُوا ۚ وَذَٰلِكَ جَزَاءُ الْكَٰفِرِينَ (٢٦)",
    "textEn": "Then Allah sent down His tranquility upon His Messenger and upon the believers, and sent unseen forces to support them and humbled the hostile disbelievers.",
    "source": "سورة التوبة: آية ٢٦",
    "sourceEn": "Surah At-Tawbah: Verse 26"
  },
  {
    "id": "rq_quran_115",
    "type": "quran",
    "title": "سورة التوبة (الآية ٤٠ - لا تحزن إن الله معنا وإنزال السكينة)",
    "titleEn": "Surah At-Tawbah (Verse 40 - Do Not Grieve, Allah Is With Us)",
    "text": "إِلَّا تَنصُرُوهُ فَقَدْ نَصَرَهُ اللَّهُ إِذْ أَخْرَجَهُ الَّذِينَ كَفَرُوا ثَانِىَ اثْنَيْنِ إِذْ هُمَا فِى الْغَارِ إِذْ يَقُولُ لِصَٰحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا ۖ فَأَنزَلَ اللَّهُ سَكِينَتَهُ عَلَيْهِ وَأَيَّدَهُ بِجُنُودٍ لَّمْ تَرَوْهَا وَجَعَلَ كَلِمَةَ الَّذِينَ كَفَرُوا السُّفْلَىٰ ۗ وَكَلِمَةُ اللَّهِ هِىَ الْعُلْيَا ۗ وَاللَّهُ عَزِيزٌ حَكِيمٌ (٤٠)",
    "textEn": "Do not grieve; truly Allah is with us. So Allah sent down His serenity upon him, aided him with unseen soldiers, and made the word of falsehood lowest while Allahs word remains supreme.",
    "source": "سورة التوبة: آية ٤٠",
    "sourceEn": "Surah At-Tawbah: Verse 40"
  },
  {
    "id": "rq_quran_116",
    "type": "quran",
    "title": "سورة التوبة (الآية ٥١ - الرضا بالقدر والتوكل على الله مولانا)",
    "titleEn": "Surah At-Tawbah (Verse 51 - Relying Upon Allahs Decree)",
    "text": "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَىٰنَا ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ (٥١)",
    "textEn": "Say: Nothing will ever strike us except what Allah has decreed for us; He is our Protector, and upon Allah alone let the believers place their trust.",
    "source": "سورة التوبة: آية ٥١",
    "sourceEn": "Surah At-Tawbah: Verse 51"
  },
  {
    "id": "rq_quran_117",
    "type": "quran",
    "title": "سورة التوبة (الآية ١٠٣ - التطهير والتزكية والطمأنينة)",
    "titleEn": "Surah At-Tawbah (Verse 103 - Purification & Reassurance)",
    "text": "خُذْ مِنْ أَمْوَٰلِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا وَصَلِّ عَلَيْهِمْ ۖ إِنَّ صَلَوٰتَكَ سَكَنٌ لَّهُمْ ۗ وَاللَّهُ سَمِيعٌ عَلِيمٌ (١٠٣)",
    "textEn": "Purify and sanctify them thereby and pray for them, for your prayer brings serenity and peace to them; and Allah is All-Hearing, All-Knowing.",
    "source": "سورة التوبة: آية ١٠٣",
    "sourceEn": "Surah At-Tawbah: Verse 103"
  },
  {
    "id": "rq_quran_118",
    "type": "quran",
    "title": "سورة يونس (الآيات ٦٢ - ٦٤ - أولياء الله لا خوف عليهم ولا هم يحزنون)",
    "titleEn": "Surah Yunus (Verses 62-64 - No Fear or Grief for Allahs Allies)",
    "text": "أَلَا إِنَّ أَوْلِيَاءَ اللَّهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ (٦٢) الَّذِينَ ءَامَنُوا وَكَانُوا يَتَّقُونَ (٦٣) لَهُمُ الْبُشْرَىٰ فِى الْحَيَوٰةِ الدُّنْيَا وَفِى الْءَاخِرَةِ ۚ لَا تَبْدِيلَ لِكَلِمَٰتِ اللَّهِ ۚ ذَٰلِكَ هُوَ الْفَوْزُ الْعَظِيمُ (٦٤)",
    "textEn": "Unquestionably, upon the allies of Allah there is no fear nor shall they grieve—those who believe and stay mindful of Him. Theirs are glad tidings in this life and the Hereafter; Allahs promise never changes.",
    "source": "سورة يونس: الآيات ٦٢ - ٦٤",
    "sourceEn": "Surah Yunus: Verses 62-64"
  },
  {
    "id": "rq_quran_119",
    "type": "quran",
    "title": "سورة يونس (الآية ١٠٧ - لا كاشف للضر إلا الله وحده)",
    "titleEn": "Surah Yunus (Verse 107 - None Removes Harm Except Allah)",
    "text": "وَإِن يَمْسَسْكَ اللَّهُ بِضُرٍّ فَلَا كَاشِفَ لَهُ إِلَّا هُوَ ۖ وَإِن يُرِدْكَ بِخَيْرٍ فَلَا رَادَّ لِفَضْلِهِ ۚ يُصِيبُ بِهِ مَن يَشَاءُ مِنْ عِبَادِهِ ۚ وَهُوَ الْغَفُورُ الرَّحِيمُ (١٠٧)",
    "textEn": "If Allah touches you with harm, none can remove it except Him; and if He wills good for you, none can repel His bounty. He grants it to whomever of His servants He wills, and He is the Most Forgiving, Most Merciful.",
    "source": "سورة يونس: آية ١٠٧",
    "sourceEn": "Surah Yunus: Verse 107"
  },
  {
    "id": "rq_quran_120",
    "type": "quran",
    "title": "سورة هود (الآيتان ٥٦ - ٥٧ - التوكل المطلق على من بيده نواصي الخلق)",
    "titleEn": "Surah Hud (Verses 56-57 - Total Trust in the Master of Creation)",
    "text": "إِنِّى تَوَكَّلْتُ عَلَى اللَّهِ رَبِّى وَرَبِّكُم ۚ مَّا مِن دَابَّةٍ إِلَّا هُوَ ءَاخِذٌ بِنَاصِيَتِهَا ۚ إِنَّ رَبِّى عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ (٥٦) فَإِن تَوَلَّوْا فَقَدْ أَبْلَغْتُكُم مَّا أُرْسِلْتُ بِهِ إِلَيْكُمْ ۚ وَيَسْتَخْلِفُ رَبِّى قَوْمًا غَيْرَكُمْ وَلَا تَضُرُّونَهُ شَيْـًٔا ۚ إِنَّ رَبِّى عَلَىٰ كُلِّ شَىْءٍ حَفِيظٌ (٥٧)",
    "textEn": "I have placed my trust in Allah, my Lord and your Lord; there is no moving creature except that He holds its forelock in His control. Surely my Lord is upon a straight path, and my Lord is Guardian over every single thing.",
    "source": "سورة هود: الآيتان ٥٦ - ٥٧",
    "sourceEn": "Surah Hud: Verses 56-57"
  },
  {
    "id": "rq_quran_121",
    "type": "quran",
    "title": "سورة هود (الآية ٨٨ - طلب التوفيق من الله والتوكل والإنابة)",
    "titleEn": "Surah Hud (Verse 88 - Success Comes Only Through Allah)",
    "text": "قَالَ يَٰقَوْمِ أَرَءَيْتُمْ إِن كُنتُ عَلَىٰ بَيِّنَةٍ مِّن رَّبِّى وَرَزَقَنِى مِنْهُ رِزْقًا حَسَنًا ۚ وَمَا أُرِيدُ أَنْ أُخَالِفَكُمْ إِلَىٰ مَا أَنْهَىٰكُمْ عَنْهُ ۚ إِنْ أُرِيدُ إِلَّا الْإِصْلَٰحَ مَا اسْتَطَعْتُ ۚ وَمَا تَوْفِيقِى إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ (٨٨)",
    "textEn": "My success comes solely through Allah; upon Him I have placed my trust and to Him I always turn in repentance.",
    "source": "سورة هود: آية ٨٨",
    "sourceEn": "Surah Hud: Verse 88"
  },
  {
    "id": "rq_quran_122",
    "type": "quran",
    "title": "سورة هود (الآية ١٢٣ - رجوع الأمر كله إلى الله والتوكل عليه)",
    "titleEn": "Surah Hud (Verse 123 - All Matters Return to Allah)",
    "text": "وَلِلَّهِ غَيْبُ السَّمَٰوَٰتِ وَالْأَرْضِ وَإِلَيْهِ يُرْجَعُ الْأَمْرُ كُلُّهُ فَاعْبُدْهُ وَتَوَكَّلْ عَلَيْهِ ۚ وَمَا رَبُّكَ بِغَٰفِلٍ عَمَّا تَعْمَلُونَ (١٢٣)",
    "textEn": "To Allah belongs the unseen of the heavens and earth, and to Him the entire matter returns; so worship Him and place your trust in Him, for your Lord is never unaware of what you do.",
    "source": "سورة هود: آية ١٢٣",
    "sourceEn": "Surah Hud: Verse 123"
  },
  {
    "id": "rq_quran_123",
    "type": "quran",
    "title": "سورة يوسف (الآية ٢١ - غلبة أمر الله وتيسير التمكين)",
    "titleEn": "Surah Yusuf (Verse 21 - Allah Always Prevails in His Affair)",
    "text": "وَقَالَ الَّذِى اشْتَرَىٰهُ مِن مِّصْرَ لِامْرَأَتِهِ أَكْرِمِى مَثْوَىٰهُ عَسَىٰ أَن يَنفَعَنَا أَوْ نَتَّخِذَهُ وَلَدًا ۚ وَكَذَٰلِكَ مَكَّنَّا لِيُوسُفَ فِى الْأَرْضِ وَلِنُعَلِّمَهُ مِن تَأْوِيلِ الْأَحَادِيثِ ۚ وَاللَّهُ غَالِبٌ عَلَىٰ أَمْرِهِ وَلَٰكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ (٢١)",
    "textEn": "And Allah always prevails over His purpose, though most people do not understand.",
    "source": "سورة يوسف: آية ٢١",
    "sourceEn": "Surah Yusuf: Verse 21"
  },
  {
    "id": "rq_quran_124",
    "type": "quran",
    "title": "سورة يوسف (الآية ٢٤ - صرف السوء والفحشاء عن العباد المخلصين)",
    "titleEn": "Surah Yusuf (Verse 24 - Averting Evil from Sincere Servants)",
    "text": "وَلَقَدْ هَمَّتْ بِهِ ۖ وَهَمَّ بِهَا لَوْلَا أَن رَّءَا بُرْهَٰنَ رَبِّهِ ۚ كَذَٰلِكَ لِنَصْرِفَ عَنْهُ السُّوءَ وَالْفَحْشَاءَ ۚ إِنَّهُ مِنْ عِبَادِنَا الْمُخْلَصِينَ (٢٤)",
    "textEn": "Thus We did so in order to turn away from him all evil and indecency; truly he was among Our sincere, chosen servants.",
    "source": "سورة يوسف: آية ٢٤",
    "sourceEn": "Surah Yusuf: Verse 24"
  },
  {
    "id": "rq_quran_125",
    "type": "quran",
    "title": "سورة الرعد (الآيتان ٢٨ - ٢٩ - طمأنينة القلوب بذكر الله تعالى)",
    "titleEn": "Surah Ar-Rad (Verses 28-29 - Hearts Find Rest in Allahs Remembrance)",
    "text": "الَّذِينَ ءَامَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ (٢٨) الَّذِينَ ءَامَنُوا وَعَمِلُوا الصَّٰلِحَٰتِ طُوبَىٰ لَهُمْ وَحُسْنُ مَـَٔابٍ (٢٩)",
    "textEn": "Those who believe and whose hearts find deep tranquility in the remembrance of Allah—surely in Allahs remembrance do hearts find peace. For those who believe and do good is blessedness and a beautiful return.",
    "source": "سورة الرعد: الآيتان ٢٨ - ٢٩",
    "sourceEn": "Surah Ar-Rad: Verses 28-29"
  },
  {
    "id": "rq_quran_126",
    "type": "quran",
    "title": "سورة الرعد (الآية ٣٩ - محو الشر وتثبيت الخير بأمر الله)",
    "titleEn": "Surah Ar-Rad (Verse 39 - Allah Erases & Confirms What He Wills)",
    "text": "يَمْحُوا اللَّهُ مَا يَشَاءُ وَيُثْبِتُ ۖ وَعِندَهُ أُمُّ الْكِتَٰبِ (٣٩)",
    "textEn": "Allah wipes out whatever He wills and confirms whatever He wills, and with Him is the Master Record.",
    "source": "سورة الرعد: آية ٣٩",
    "sourceEn": "Surah Ar-Rad: Verse 39"
  },
  {
    "id": "rq_quran_127",
    "type": "quran",
    "title": "سورة إبراهيم (الآيتان ١١ - ١٢ - التوكل على الله والصبر على الأذى)",
    "titleEn": "Surah Ibrahim (Verses 11-12 - Relying on Allah Under Harm)",
    "text": "قَالَتْ لَهُمْ رُسُلُهُمْ إِن نَّحْنُ إِلَّا بَشَرٌ مِّثْلُكُمْ وَلَٰكِنَّ اللَّهَ يَمُنُّ عَلَىٰ مَن يَشَاءُ مِنْ عِبَادِهِ ۖ وَمَا كَانَ لَنَا أَن نَّأْتِيَكُم بِسُلْطَٰنٍ إِلَّا بِإِذْنِ اللَّهِ ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ (١١) وَمَا لَنَا أَلَّا نَتَوَكَّلَ عَلَى اللَّهِ وَقَدْ هَدَىٰنَا سُبُلَنَا ۚ وَلَنَصْبِرَنَّ عَلَىٰ مَا ءَاذَيْتُمُونَا ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُتَوَكِّلُونَ (١٢)",
    "textEn": "Upon Allah let believers rely; and why should we not trust in Allah when He has guided our paths? We will surely endure whatever harm you cause us, and upon Allah let all trusting people rely.",
    "source": "سورة إبراهيم: الآيتان ١١ - ١٢",
    "sourceEn": "Surah Ibrahim: Verses 11-12"
  },
  {
    "id": "rq_quran_128",
    "type": "quran",
    "title": "سورة إبراهيم (الآية ٢٧ - تثبيت المؤمنين بالقول الثابت)",
    "titleEn": "Surah Ibrahim (Verse 27 - Firmness Through the Steadfast Word)",
    "text": "يُثَبِّتُ اللَّهُ الَّذِينَ ءَامَنُوا بِالْقَوْلِ الثَّابِتِ فِى الْحَيَوٰةِ الدُّنْيَا وَفِى الْءَاخِرَةِ ۖ وَيُضِلُّ اللَّهُ الظَّٰلِمِينَ ۚ وَيَفْعَلُ اللَّهُ مَا يَشَاءُ (٢٧)",
    "textEn": "Allah keeps firm those who believe with the steadfast word in this worldly life and in the Hereafter, and Allah leaves wrongdoers astray and does whatever He wills.",
    "source": "سورة إبراهيم: آية ٢٧",
    "sourceEn": "Surah Ibrahim: Verse 27"
  },
  {
    "id": "rq_quran_129",
    "type": "quran",
    "title": "سورة الحجر (الآية ٩ - حفظ الله لكتابه وأهله)",
    "titleEn": "Surah Al-Hijr (Verse 9 - Allah Guards His Remembrance)",
    "text": "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَٰفِظُونَ (٩)",
    "textEn": "Truly it is We who sent down the Reminder, and truly it is We who will certainly guard it.",
    "source": "سورة الحجر: آية ٩",
    "sourceEn": "Surah Al-Hijr: Verse 9"
  },
  {
    "id": "rq_quran_130",
    "type": "quran",
    "title": "سورة الحجر (الآيتان ٨٧ - ٨٨ - نعمة القرآن العظيم وغنى النفس)",
    "titleEn": "Surah Al-Hijr (Verses 87-88 - Gift of the Great Quran)",
    "text": "وَلَقَدْ ءَاتَيْنَٰكَ سَبْعًا مِّنَ الْمَثَانِى وَالْقُرْءَانَ الْعَظِيمَ (٨٧) لَا تَمُدَّنَّ عَيْنَيْكَ إِلَىٰ مَا مَتَّعْنَا بِهِ أَزْوَٰجًا مِّنْهُمْ وَلَا تَحْزَنْ عَلَيْهِمْ وَاخْفِضْ جَنَاحَكَ لِلْمُؤْمِنِينَ (٨٨)",
    "textEn": "We have surely granted you the seven oft-repeated verses and the Magnificent Quran. Do not cast your eyes toward fleeting comforts given to others, do not grieve over them, and lower your wing gently to believers.",
    "source": "سورة الحجر: الآيتان ٨٧ - ٨٨",
    "sourceEn": "Surah Al-Hijr: Verses 87-88"
  },
  {
    "id": "rq_quran_131",
    "type": "quran",
    "title": "سورة الحجر (الآيات ٩٧ - ٩٩ - علاج ضيق الصدر بالتسبيح والسجود)",
    "titleEn": "Surah Al-Hijr (Verses 97-99 - Remedy for Constriction of the Chest)",
    "text": "وَلَقَدْ نَعْلَمُ أَنَّكَ يَضِيقُ صَدْرُكَ بِمَا يَقُولُونَ (٩٧) فَسَبِّحْ بِحَمْدِ رَبِّكَ وَكُن مِّنَ السَّٰجِدِينَ (٩٨) وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ (٩٩)",
    "textEn": "We already know that your chest tightens because of what they say; so exalt your Lord with praise, be among those who prostrate, and worship your Lord until certainty reaches you.",
    "source": "سورة الحجر: الآيات ٩٧ - ٩٩",
    "sourceEn": "Surah Al-Hijr: Verses 97-99"
  },
  {
    "id": "rq_quran_132",
    "type": "quran",
    "title": "سورة النحل (الآيتان ١٢٧ - ١٢٨ - الصبر بالله ومعية الإحسان والتقوى)",
    "titleEn": "Surah An-Nahl (Verses 127-128 - Patience & Divine Companionship)",
    "text": "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ ۚ وَلَا تَحْزَنْ عَلَيْهِمْ وَلَا تَكُ فِى ضَيْقٍ مِّمَّا يَمْكُرُونَ (١٢٧) إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا وَّالَّذِينَ هُم مُّحْسِنُونَ (١٢٨)",
    "textEn": "Be patient—your patience is only through Allah—do not grieve over them, and feel no distress from their scheming. Truly Allah is with those who are mindful of Him and those who do good.",
    "source": "سورة النحل: الآيتان ١٢٧ - ١٢٨",
    "sourceEn": "Surah An-Nahl: Verses 127-128"
  },
  {
    "id": "rq_quran_133",
    "type": "quran",
    "title": "سورة الإسراء (الآيتان ٩ - ١٠ - هداية القرآن للتي هي أقوم)",
    "titleEn": "Surah Al-Isra (Verses 9-10 - The Quran Guides to What Is Upright)",
    "text": "إِنَّ هَٰذَا الْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّٰلِحَٰتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا (٩) وَأَنَّ الَّذِينَ لَا يُؤْمِنُونَ بِالْءَاخِرَةِ أَعْتَدْنَا لَهُمْ عَذَابًا أَلِيمًا (١٠)",
    "textEn": "Truly this Quran guides to the path that is most upright and brings glad tidings to believers who do righteous deeds that theirs is a great reward.",
    "source": "سورة الإسراء: الآيتان ٩ - ١٠",
    "sourceEn": "Surah Al-Isra: Verses 9-10"
  },
  {
    "id": "rq_quran_134",
    "type": "quran",
    "title": "سورة الإسراء (الآية ٦٥ - نفي سلطان الشيطان عن عباد الله)",
    "titleEn": "Surah Al-Isra (Verse 65 - Satan Has No Authority Over Allahs Servants)",
    "text": "إِنَّ عِبَادِى لَيْسَ لَكَ عَلَيْهِمْ سُلْطَٰنٌ ۚ وَكَفَىٰ بِرَبِّكَ وَكِيلًا (٦٥)",
    "textEn": "As for My true servants, you have no authority over them whatsoever; and your Lord suffices completely as Guardian.",
    "source": "سورة الإسراء: آية ٦٥",
    "sourceEn": "Surah Al-Isra: Verse 65"
  },
  {
    "id": "rq_quran_135",
    "type": "quran",
    "title": "سورة الإسراء (الآية ٨٠ - سؤال المدخل الصادق والسلطان النصير)",
    "titleEn": "Surah Al-Isra (Verse 80 - Seeking Supporting Authority from Allah)",
    "text": "وَقُل رَّبِّ أَدْخِلْنِى مُدْخَلَ صِدْقٍ وَأَخْرِجْنِى مُخْرَجَ صِدْقٍ وَاجْعَل لِّى مِن لَّدُنكَ سُلْطَٰنًا نَّصِيرًا (٨٠)",
    "textEn": "Pray: My Lord, grant me an honorable entrance and an honorable exit, and bestow upon me from Yourself a supporting authority.",
    "source": "سورة الإسراء: آية ٨٠",
    "sourceEn": "Surah Al-Isra: Verse 80"
  },
  {
    "id": "rq_quran_136",
    "type": "quran",
    "title": "سورة الإسراء (الآيتان ١١٠ - ١١١ - دعاء الأسماء الحسنى وتنزيه الله)",
    "titleEn": "Surah Al-Isra (Verses 110-111 - Calling Upon His Beautiful Names)",
    "text": "قُلِ ادْعُوا اللَّهَ أَوِ ادْعُوا الرَّحْمَٰنَ ۖ أَيًّا مَّا تَدْعُوا فَلَهُ الْأَسْمَاءُ الْحُسْنَىٰ ۚ وَلَا تَجْهَرْ بِصَلَاتِكَ وَلَا تُخَافِتْ بِهَا وَابْتَغِ بَيْنَ ذَٰلِكَ سَبِيلًا (١١٠) وَقُلِ الْحَمْدُ لِلَّهِ الَّذِى لَمْ يَتَّخِذْ وَلَدًا وَلَمْ يَكُن لَّهُ شَرِيكٌ فِى الْمُلْكِ وَلَمْ يَكُن لَّهُ وَلِىٌّ مِّنَ الذُّلِّ ۖ وَكَبِّرْهُ تَكْبِيرًا (١١١)",
    "textEn": "Call upon Allah or call upon the Most Merciful; whichever name you call, to Him belong the most beautiful names. And say: Praise be to Allah who never took a child, has no partner in dominion, and needs no protector out of weakness; magnify Him greatly.",
    "source": "سورة الإسراء: الآيتان ١١٠ - ١١١",
    "sourceEn": "Surah Al-Isra: Verses 110-111"
  },
  {
    "id": "rq_quran_137",
    "type": "quran",
    "title": "سورة الكهف (الآيات ١٠ - ١٢ - طلب الرحمة والرشاد وتيسير الأمر)",
    "titleEn": "Surah Al-Kahf (Verses 10-12 - Seeking Mercy & Right Guidance)",
    "text": "إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا ءَاتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا (١٠) فَضَرَبْنَا عَلَىٰ ءَاذَانِهِمْ فِى الْكَهْفِ سِنِينَ عَدَدًا (١١) ثُمَّ بَعَثْنَٰهُمْ لِنَعْلَمَ أَىُّ الْحِزْبَيْنِ أَحْصَىٰ لِمَا لَبِثُوا أَمَدًا (١٢)",
    "textEn": "When the youths took refuge in the cave, they prayed: Our Lord, grant us mercy directly from You and prepare right guidance for us in our affair. So We sealed their ears for years in safety and then awakened them.",
    "source": "سورة الكهف: الآيات ١٠ - ١٢",
    "sourceEn": "Surah Al-Kahf: Verses 10-12"
  },
  {
    "id": "rq_quran_138",
    "type": "quran",
    "title": "سورة الكهف (الآية ٦٥ - فيض الرحمة والعلم اللدني)",
    "titleEn": "Surah Al-Kahf (Verse 65 - Bestowal of Divine Mercy & Knowledge)",
    "text": "فَوَجَدَا عَبْدًا مِّنْ عِبَادِنَا ءَاتَيْنَٰهُ رَحْمَةً مِّنْ عِندِنَا وَعَلَّمْنَٰهُ مِن لَّدُنَّا عِلْمًا (٦٥)",
    "textEn": "They found one of Our servants upon whom We had bestowed special mercy from Us and whom We had taught knowledge from Our own presence.",
    "source": "سورة الكهف: آية ٦٥",
    "sourceEn": "Surah Al-Kahf: Verse 65"
  },
  {
    "id": "rq_quran_139",
    "type": "quran",
    "title": "سورة طه (الآيات ٢٥ - ٢٨ - انشراح الصدر وفك العقد من اللسان)",
    "titleEn": "Surah Taha (Verses 25-28 - Expanding the Chest & Untying Knots)",
    "text": "قَالَ رَبِّ اشْرَحْ لِى صَدْرِى (٢٥) وَيَسِّرْ لِى أَمْرِى (٢٦) وَاحْلُلْ عُقْدَةً مِّن لِّسَانِى (٢٧) يَفْقَهُوا قَوْلِى (٢٨)",
    "textEn": "My Lord, expand my chest for me, ease my task for me, and untie the knot from my tongue so that they may clearly understand my speech.",
    "source": "سورة طه: الآيات ٢٥ - ٢٨",
    "sourceEn": "Surah Taha: Verses 25-28"
  },
  {
    "id": "rq_quran_140",
    "type": "quran",
    "title": "سورة طه (الآية ٦٨ - تثبيت القلب وإذهاب الخوف: لا تخف إنك أنت الأعلى)",
    "titleEn": "Surah Taha (Verse 68 - Fear Not, Surely You Are Uppermost)",
    "text": "قُلْنَا لَا تَخَفْ إِنَّكَ أَنتَ الْأَعْلَىٰ (٦٨)",
    "textEn": "We said to him: Do not fear at all; surely it is you who will be uppermost.",
    "source": "سورة طه: آية ٦٨",
    "sourceEn": "Surah Taha: Verse 68"
  },
  {
    "id": "rq_quran_141",
    "type": "quran",
    "title": "سورة الأنبياء (الآيتان ٦٩ - ٧٠ - إطفاء حر العين والحسد: برداً وسلاماً)",
    "titleEn": "Surah Al-Anbiya (Verses 69-70 - Be Coolness & Peace)",
    "text": "قُلْنَا يَٰنَارُ كُونِى بَرْدًا وَسَلَٰمًا عَلَىٰ إِبْرَٰهِيمَ (٦٩) وَأَرَادُوا بِهِ كَيْدًا فَجَعَلْنَٰهُمُ الْأَخْسَرِينَ (٧٠)",
    "textEn": "We commanded: O fire, be coolness and peace upon Abraham! They intended harm and plotting against him, yet We made them the greatest losers.",
    "source": "سورة الأنبياء: الآيتان ٦٩ - ٧٠",
    "sourceEn": "Surah Al-Anbiya: Verses 69-70"
  },
  {
    "id": "rq_quran_142",
    "type": "quran",
    "title": "سورة الأنبياء (الآية ١٠٧ - شمول الرحمة المحمدية للعالمين)",
    "titleEn": "Surah Al-Anbiya (Verse 107 - Sent as a Mercy to All Worlds)",
    "text": "وَمَا أَرْسَلْنَٰكَ إِلَّا رَحْمَةً لِّلْعَٰلَمِينَ (١٠٧)",
    "textEn": "We have not sent you except as a mercy to all the worlds.",
    "source": "سورة الأنبياء: آية ١٠٧",
    "sourceEn": "Surah Al-Anbiya: Verse 107"
  },
  {
    "id": "rq_quran_143",
    "type": "quran",
    "title": "سورة الحج (الآية ٣٨ - دفاع الله عن المؤمنين وحفظهم)",
    "titleEn": "Surah Al-Hajj (Verse 38 - Allah Defends Those Who Believe)",
    "text": "۞ إِنَّ اللَّهَ يُدَٰفِعُ عَنِ الَّذِينَ ءَامَنُوا ۗ إِنَّ اللَّهَ لَا يُحِبُّ كُلَّ خَوَّانٍ كَفُورٍ (٣٨)",
    "textEn": "Surely Allah defends those who believe; Allah does not love any treacherous, ungrateful person.",
    "source": "سورة الحج: آية ٣٨",
    "sourceEn": "Surah Al-Hajj: Verse 38"
  },
  {
    "id": "rq_quran_144",
    "type": "quran",
    "title": "سورة الحج (الآية ٧٨ - الاعتصام بالله: نعم المولى ونعم النصير)",
    "titleEn": "Surah Al-Hajj (Verse 78 - Hold Fast to Allah, Best Protector)",
    "text": "وَجَٰهِدُوا فِى اللَّهِ حَقَّ جِهَادِهِ ۚ هُوَ اجْتَبَىٰكُمْ وَمَا جَعَلَ عَلَيْكُمْ فِى الدِّينِ مِنْ حَرَجٍ ۚ مِّلَّةَ أَبِيكُمْ إِبْرَٰهِيمَ ۚ هُوَ سَمَّىٰكُمُ الْمُسْلِمِينَ مِن قَبْلُ وَفِى هَٰذَا لِيَكُونَ الرَّسُولُ شَهِيدًا عَلَيْكُمْ وَتَكُونُوا شُهَدَاءَ عَلَى النَّاسِ ۚ فَأَقِيمُوا الصَّلَوٰةَ وَءَاتُوا الزَّكَوٰةَ وَاعْتَصِمُوا بِاللَّهِ هُوَ مَوْلَىٰكُمْ ۖ فَنِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ (٧٨)",
    "textEn": "Strive sincerely for Allah, establish prayer, give charity, and hold fast to Allah; He is your Protector—what an excellent Protector and what an excellent Helper!",
    "source": "سورة الحج: آية ٧٨",
    "sourceEn": "Surah Al-Hajj: Verse 78"
  },
  {
    "id": "rq_quran_145",
    "type": "quran",
    "title": "سورة المؤمنون (الآيتان ٧٩ - ٨٠ - التذكير بقدرة المحيي المميت)",
    "titleEn": "Surah Al-Muminun (Verses 79-80 - He Who Gives Life & Death)",
    "text": "وَهُوَ الَّذِى ذَرَأَكُمْ فِى الْأَرْضِ وَإِلَيْهِ تُحْشَرُونَ (٧٩) وَهُوَ الَّذِى يُحْىِ وَيُمِيتُ وَلَهُ اخْتِلَٰفُ الَّيْلِ وَالنَّهَارِ ۚ أَفَلَا تَعْقِلُونَ (٨٠)",
    "textEn": "It is He who multiplied you upon the earth and to Him you will be gathered; and it is He who gives life and causes death and alternates night and day—will you not then reflect?",
    "source": "سورة المؤمنون: الآيتان ٧٩ - ٨٠",
    "sourceEn": "Surah Al-Muminun: Verses 79-80"
  },
  {
    "id": "rq_quran_146",
    "type": "quran",
    "title": "سورة المؤمنون (الآيات ٨٤ - ٨٩ - بيده ملكوت كل شيء وهو يجير)",
    "titleEn": "Surah Al-Muminun (Verses 84-89 - Dominion & Protection Belong to Allah)",
    "text": "قُل لِّمَنِ الْأَرْضُ وَمَن فِيهَا إِن كُنتُمْ تَعْلَمُونَ (٨٤) سَيَقُولُونَ لِلَّهِ ۚ قُلْ أَفَلَا تَذَكَّرُونَ (٨٥) قُلْ مَن رَّبُّ السَّمَٰوَٰتِ السَّبْعِ وَرَبُّ الْعَرْشِ الْعَظِيمِ (٨٦) سَيَقُولُونَ لِلَّهِ ۚ قُلْ أَفَلَا تَتَّقُونَ (٨٧) قُلْ مَن بِيَدِهِ مَلَكُوتُ كُلِّ شَىْءٍ وَهُوَ يُجِيرُ وَلَا يُجَارُ عَلَيْهِ إِن كُنتُمْ تَعْلَمُونَ (٨٨) سَيَقُولُونَ لِلَّهِ ۚ قُلْ فَأَنَّىٰ تُسْحَرُونَ (٨٩)",
    "textEn": "To Allah belongs the earth and everyone in it, He is Lord of the seven heavens and the Great Throne, and in His hand rests the dominion of every single thing—He protects while none can protect against Him.",
    "source": "سورة المؤمنون: الآيات ٨٤ - ٨٩",
    "sourceEn": "Surah Al-Muminun: Verses 84-89"
  },
  {
    "id": "rq_quran_147",
    "type": "quran",
    "title": "سورة النور (الآية ٤٠ - طلب النور الإلهي ودفع الظلمات)",
    "titleEn": "Surah An-Nur (Verse 40 - Only Allah Grants True Light)",
    "text": "أَوْ كَظُلُمَٰتٍ فِى بَحْرٍ لُّجِّىٍّ يَغْشَىٰهُ مَوْجٌ مِّن فَوْقِهِ مَوْجٌ مِّن فَوْقِهِ سَحَابٌ ۚ ظُلُمَٰتٌ بَعْضُهَا فَوْقَ بَعْضٍ إِذَا أَخْرَجَ يَدَهُ لَمْ يَكَدْ يَرَىٰهَا ۗ وَمَن لَّمْ يَجْعَلِ اللَّهُ لَهُ نُورًا فَمَا لَهُ مِن نُّورٍ (٤٠)",
    "textEn": "In deep layered darkness one can scarcely see his own hand; and whomever Allah does not grant light will have no light at all.",
    "source": "سورة النور: آية ٤٠",
    "sourceEn": "Surah An-Nur: Verse 40"
  },
  {
    "id": "rq_quran_148",
    "type": "quran",
    "title": "سورة الفرقان (الآية ٣٢ - تثبيت الفؤاد بالقرآن الكريم)",
    "titleEn": "Surah Al-Furqan (Verse 32 - Strengthening the Heart with the Quran)",
    "text": "وَقَالَ الَّذِينَ كَفَرُوا لَوْلَا نُزِّلَ عَلَيْهِ الْقُرْءَانُ جُمْلَةً وَٰحِدَةً ۚ كَذَٰلِكَ لِنُثَبِّتَ بِهِ فُؤَادَكَ ۖ وَرَتَّلْنَٰهُ تَرْتِيلًا (٣٢)",
    "textEn": "It was revealed gradually so that We may strengthen your heart thereby, and We recited it in clear measured order.",
    "source": "سورة الفرقان: آية ٣٢",
    "sourceEn": "Surah Al-Furqan: Verse 32"
  },
  {
    "id": "rq_quran_149",
    "type": "quran",
    "title": "سورة الفرقان (الآية ٥٨ - التوكل على الحي الذي لا يموت)",
    "titleEn": "Surah Al-Furqan (Verse 58 - Rely Upon the Ever-Living Who Never Dies)",
    "text": "وَتَوَكَّلْ عَلَى الْحَىِّ الَّذِى لَا يَمُوتُ وَسَبِّحْ بِحَمْدِهِ ۚ وَكَفَىٰ بِهِ بِذُنُوبِ عِبَادِهِ خَبِيرًا (٥٨)",
    "textEn": "Place your trust in the Ever-Living Who never dies, exalt Him with praise, and He suffices as the All-Aware of His servants sins.",
    "source": "سورة الفرقان: آية ٥٨",
    "sourceEn": "Surah Al-Furqan: Verse 58"
  },
  {
    "id": "rq_quran_150",
    "type": "quran",
    "title": "سورة الشعراء (الآيات ٦١ - ٦٦ - كلا إن معي ربي سيهدين للنجاة)",
    "titleEn": "Surah Ash-Shuara (Verses 61-66 - My Lord Is With Me, He Will Guide Me)",
    "text": "فَلَمَّا تَرَٰءَا الْجَمْعَانِ قَالَ أَصْحَٰبُ مُوسَىٰ إِنَّا لَمُدْرَكُونَ (٦١) قَالَ كَلَّا ۖ إِنَّ مَعِىَ رَبِّى سَيَهْدِينِ (٦٢) فَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنِ اضْرِب بِّعَصَاكَ الْبَحْرَ ۖ فَانفَلَقَ فَكَانَ كُلُّ فِرْقٍ كَالطَّوْدِ الْعَظِيمِ (٦٣) وَأَزْلَفْنَا ثَمَّ الْءَاخَرِينَ (٦٤) وَأَنجَيْنَا مُوسَىٰ وَمَن مَّعَهُ أَجْمَعِينَ (٦٥) ثُمَّ أَغْرَقْنَا الْءَاخَرِينَ (٦٦)",
    "textEn": "When the two hosts saw each other, Moses declared: By no means! Surely my Lord is with me and He will guide me. So We parted the sea like towering mountains and saved Moses and all with him.",
    "source": "سورة الشعراء: الآيات ٦١ - ٦٦",
    "sourceEn": "Surah Ash-Shuara: Verses 61-66"
  },
  {
    "id": "rq_quran_151",
    "type": "quran",
    "title": "سورة النمل (الآيتان ٣٠ - ٣١ - إخضاع العارض بسم الله الرحمن الرحيم)",
    "titleEn": "Surah An-Naml (Verses 30-31 - In the Name of Allah, Do Not Exalt Yourselves)",
    "text": "إِنَّهُ مِن سُلَيْمَٰنَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (٣٠) أَلَّا تَعْلُوا عَلَىَّ وَأْتُونِى مُسْلِمِينَ (٣١)",
    "textEn": "Truly it is from Solomon, and surely it begins: In the name of Allah, the Most Compassionate, the Most Merciful; do not exalt yourselves against me, and come to me in submission.",
    "source": "سورة النمل: الآيتان ٣٠ - ٣١",
    "sourceEn": "Surah An-Naml: Verses 30-31"
  },
  {
    "id": "rq_quran_152",
    "type": "quran",
    "title": "سورة النمل (الآية ٦٢ - إجابة المضطر وكشف السوء والضر)",
    "titleEn": "Surah An-Naml (Verse 62 - Answering the Distressed & Removing Harm)",
    "text": "أَمَّن يُجِيبُ الْمُضْطَرَّ إِذَا دَعَاهُ وَيَكْشِفُ السُّوءَ وَيَجْعَلُكُمْ خُلَفَاءَ الْأَرْضِ ۗ أَءِلَٰهٌ مَّعَ اللَّهِ ۚ قَلِيلًا مَّا تَذَكَّرُونَ (٦٢)",
    "textEn": "Who else answers the distressed person when he calls out to Him, removes the harm, and establishes you on earth? Could there be any god besides Allah? Little do people remember!",
    "source": "سورة النمل: آية ٦٢",
    "sourceEn": "Surah An-Naml: Verse 62"
  },
  {
    "id": "rq_quran_153",
    "type": "quran",
    "title": "سورة القصص (الآيتان ٢٤ - ٢٥ - سؤال الخير والأمان من الظالمين)",
    "titleEn": "Surah Al-Qasas (Verses 24-25 - In Need of Allahs Good & Safety)",
    "text": "فَسَقَىٰ لَهُمَا ثُمَّ تَوَلَّىٰ إِلَى الظِّلِّ فَقَالَ رَبِّ إِنِّى لِمَا أَنزَلْتَ إِلَىَّ مِنْ خَيْرٍ فَقِيرٌ (٢٤) فَجَاءَتْهُ إِحْدَىٰهُمَا تَمْشِى عَلَى اسْتِحْيَاءٍ قَالَتْ إِنَّ أَبِى يَدْعُوكَ لِيَجْزِيَكَ أَجْرَ مَا سَقَيْتَ لَنَا ۚ فَلَمَّا جَاءَهُ وَقَصَّ عَلَيْهِ الْقَصَصَ قَالَ لَا تَخَفْ ۖ نَجَوْتَ مِنَ الْقَوْمِ الظَّٰلِمِينَ (٢٥)",
    "textEn": "My Lord, truly I am in dire need of whatever good You send down to me. Then reassurance came: Do not fear, you are now safe from the wrongdoing people.",
    "source": "سورة القصص: الآيتان ٢٤ - ٢٥",
    "sourceEn": "Surah Al-Qasas: Verses 24-25"
  },
  {
    "id": "rq_quran_154",
    "type": "quran",
    "title": "سورة القصص (الآية ٨٥ - الرد إلى الخير والمآب الحسن)",
    "titleEn": "Surah Al-Qasas (Verse 85 - Safe Return & Divine Care)",
    "text": "إِنَّ الَّذِى فَرَضَ عَلَيْكَ الْقُرْءَانَ لَرَادُّكَ إِلَىٰ مَعَادٍ ۚ قُل رَّبِّى أَعْلَمُ مَن جَاءَ بِالْهُدَىٰ وَمَنْ هُوَ فِى ضَلَٰلٍ مُّبِينٍ (٨٥)",
    "textEn": "Surely He who ordained the Quran upon you will bring you back to an honorable return; my Lord knows best who brings guidance.",
    "source": "سورة القصص: آية ٨٥",
    "sourceEn": "Surah Al-Qasas: Verse 85"
  },
  {
    "id": "rq_quran_155",
    "type": "quran",
    "title": "سورة العنكبوت (الآية ٦٩ - هداية السبل ومعية المحسنين)",
    "titleEn": "Surah Al-Ankabut (Verse 69 - Guiding Paths & Being with Doers of Good)",
    "text": "وَالَّذِينَ جَٰهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا ۚ وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ (٦٩)",
    "textEn": "Those who strive sincerely for Our sake—We will surely guide them to Our ways, and truly Allah is with those who do good.",
    "source": "سورة العنكبوت: آية ٦٩",
    "sourceEn": "Surah Al-Ankabut: Verse 69"
  },
  {
    "id": "rq_quran_156",
    "type": "quran",
    "title": "سورة الروم (الآيات ١٧ - ١٩ - التسبيح بالليل والنهار وإحياء العافية)",
    "titleEn": "Surah Ar-Rum (Verses 17-19 - Glorification Morning & Evening)",
    "text": "فَسُبْحَٰنَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ (١٧) وَلَهُ الْحَمْدُ فِى السَّمَٰوَٰتِ وَالْأَرْضِ وَعَشِيًّا وَحِينَ تُظْهِرُونَ (١٨) يُخْرِجُ الْحَىَّ مِنَ الْمَيِّتِ وَيُخْرِجُ الْمَيِّتَ مِنَ الْحَىِّ وَيُحْىِ الْأَرْضَ بَعْدَ مَوْتِهَا ۚ وَكَذَٰلِكَ تُخْرَجُونَ (١٩)",
    "textEn": "So glorify Allah when you reach evening and when you enter morning; to Him belongs all praise in the heavens and earth. He brings the living out of the dead and revives the earth after its death.",
    "source": "سورة الروم: الآيات ١٧ - ١٩",
    "sourceEn": "Surah Ar-Rum: Verses 17-19"
  },
  {
    "id": "rq_quran_157",
    "type": "quran",
    "title": "سورة لقمان (الآية ٢٢ - الاستمساك بالعروة الوثقى)",
    "titleEn": "Surah Luqman (Verse 22 - Holding Fast to the Firmest Handhold)",
    "text": "۞ وَمَن يُسْلِمْ وَجْهَهُ إِلَى اللَّهِ وَهُوَ مُحْسِنٌ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ ۗ وَإِلَى اللَّهِ عَٰقِبَةُ الْأُمُورِ (٢٢)",
    "textEn": "Whoever submits his whole self to Allah while doing good has indeed grasped the most trustworthy handhold, and to Allah belongs the outcome of all affairs.",
    "source": "سورة لقمان: آية ٢٢",
    "sourceEn": "Surah Luqman: Verse 22"
  },
  {
    "id": "rq_quran_158",
    "type": "quran",
    "title": "سورة السجدة (الآيات ٧ - ٩ - تقويم الخلقة والسمع والبصر والفؤاد)",
    "titleEn": "Surah As-Sajdah (Verses 7-9 - Restoring Sight, Hearing & Heart)",
    "text": "الَّذِى أَحْسَنَ كُلَّ شَىْءٍ خَلَقَهُ ۖ وَبَدَأَ خَلْقَ الْإِنسَٰنِ مِن طِينٍ (٧) ثُمَّ جَعَلَ نَسْلَهُ مِن سُلَٰلَةٍ مِّن مَّاءٍ مَّهِينٍ (٨) ثُمَّ سَوَّىٰهُ وَنَفَخَ فِيهِ مِن رُّوحِهِ ۖ وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَٰرَ وَالْأَفْـِٔدَةَ ۚ قَلِيلًا مَّا تَشْكُرُونَ (٩)",
    "textEn": "He perfected everything He created, shaped humankind harmoniously, breathed into him of His spirit, and granted you hearing, sight, and hearts—how little thanks you give!",
    "source": "سورة السجدة: الآيات ٧ - ٩",
    "sourceEn": "Surah As-Sajdah: Verses 7-9"
  },
  {
    "id": "rq_quran_159",
    "type": "quran",
    "title": "سورة الأحزاب (الآيات ١ - ٣ - التوكل على الله وكفاية وكالته)",
    "titleEn": "Surah Al-Ahzab (Verses 1-3 - Follow Revelation & Trust Allah Alone)",
    "text": "يَٰأَيُّهَا النَّبِىُّ اتَّقِ اللَّهَ وَلَا تُطِعِ الْكَٰفِرِينَ وَالْمُنَٰفِقِينَ ۗ إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا (١) وَاتَّبِعْ مَا يُوحَىٰ إِلَيْكَ مِن رَّبِّكَ ۚ إِنَّ اللَّهَ كَانَ بِمَا تَعْمَلُونَ خَبِيرًا (٢) وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا (٣)",
    "textEn": "Be mindful of Allah, follow what is revealed to you from your Lord—for Allah is Aware of all you do—and rely entirely upon Allah, for Allah suffices as Guardian.",
    "source": "سورة الأحزاب: الآيات ١ - ٣",
    "sourceEn": "Surah Al-Ahzab: Verses 1-3"
  },
  {
    "id": "rq_quran_160",
    "type": "quran",
    "title": "سورة الأحزاب (الآيات ٤١ - ٤٤ - الإخراج من الظلمات إلى النور بالذكر)",
    "titleEn": "Surah Al-Ahzab (Verses 41-44 - Brought from Darkness into Light)",
    "text": "يَٰأَيُّهَا الَّذِينَ ءَامَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا (٤١) وَسَبِّحُوهُ بُكْرَةً وَأَصِيلًا (٤٢) هُوَ الَّذِى يُصَلِّى عَلَيْكُمْ وَمَلَٰئِكَتُهُ لِيُخْرِجَكُم مِّنَ الظُّلُمَٰتِ إِلَى النُّورِ ۚ وَكَانَ بِالْمُؤْمِنِينَ رَحِيمًا (٤٣) تَحِيَّتُهُمْ يَوْمَ يَلْقَوْنَهُ سَلَٰمٌ ۚ وَأَعَدَّ لَهُمْ أَجْرًا كَرِيمًا (٤٤)",
    "textEn": "O believers, remember Allah abundantly and glorify Him morning and evening; it is He and His angels who send blessings upon you to bring you out from darkness into light, and He is Ever-Merciful to believers.",
    "source": "سورة الأحزاب: الآيات ٤١ - ٤٤",
    "sourceEn": "Surah Al-Ahzab: Verses 41-44"
  },
  {
    "id": "rq_quran_161",
    "type": "quran",
    "title": "سورة فاطر (الآية ٢ - فتح أبواب الرحمة والشفاء بلا ممسك)",
    "titleEn": "Surah Fatir (Verse 2 - None Can Withhold Allahs Mercy)",
    "text": "مَّا يَفْتَحِ اللَّهُ لِلنَّاسِ مِن رَّحْمَةٍ فَلَا مُمْسِكَ لَهَا ۖ وَمَا يُمْسِكْ فَلَا مُرْسِلَ لَهُ مِن بَعْدِهِ ۚ وَهُوَ الْعَزِيزُ الْحَكِيمُ (٢)",
    "textEn": "Whatever mercy Allah opens for people, none can hold it back; and whatever He withholds, none can release after Him—He is the Almighty, the All-Wise.",
    "source": "سورة فاطر: آية ٢",
    "sourceEn": "Surah Fatir: Verse 2"
  },
  {
    "id": "rq_quran_162",
    "type": "quran",
    "title": "سورة فاطر (الآية ١٠ - العزة لله ورفعة الكلم الطيب ورد المكر)",
    "titleEn": "Surah Fatir (Verse 10 - Honor Belongs to Allah & Evil Plots Fail)",
    "text": "مَن كَانَ يُرِيدُ الْعِزَّةَ فَلِلَّهِ الْعِزَّةُ جَمِيعًا ۚ إِلَيْهِ يَصْعَدُ الْكَلِمُ الطَّيِّبُ وَالْعَمَلُ الصَّٰلِحُ يَرْفَعُهُ ۚ وَالَّذِينَ يَمْكُرُونَ السَّيِّـَٔاتِ لَهُمْ عَذَابٌ شَدِيدٌ ۖ وَمَكْرُ أُولَٰئِكَ هُوَ يَبُورُ (١٠)",
    "textEn": "Whoever desires honor, all honor belongs entirely to Allah; to Him ascends good speech and righteous deeds He elevates, while those who plot evil face severe doom and their schemes perish.",
    "source": "سورة فاطر: آية ١٠",
    "sourceEn": "Surah Fatir: Verse 10"
  },
  {
    "id": "rq_quran_163",
    "type": "quran",
    "title": "سورة يس (الآية ٥٨ - سلام قولاً من رب رحيم)",
    "titleEn": "Surah Ya-Sin (Verse 58 - Peace, a Word from a Merciful Lord)",
    "text": "سَلَٰمٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ (٥٨)",
    "textEn": "Peace! A greeting spoken directly from a Most Merciful Lord.",
    "source": "سورة يس: آية ٥٨",
    "sourceEn": "Surah Ya-Sin: Verse 58"
  },
  {
    "id": "rq_quran_164",
    "type": "quran",
    "title": "سورة يس (الآيات ٧٨ - ٨٣ - إحياء الرميم بقدرة كن فيكون)",
    "titleEn": "Surah Ya-Sin (Verses 78-83 - Be and It Is: Healing & Restoration)",
    "text": "وَضَرَبَ لَنَا مَثَلًا وَنَسِىَ خَلْقَهُ ۖ قَالَ مَن يُحْىِ الْعِظَٰمَ وَهِىَ رَمِيمٌ (٧٨) قُلْ يُحْيِيهَا الَّذِى أَنشَأَهَا أَوَّلَ مَرَّةٍ ۖ وَهُوَ بِكُلِّ خَلْقٍ عَلِيمٌ (٧٩) الَّذِى جَعَلَ لَكُم مِّنَ الشَّجَرِ الْأَخْضَرِ نَارًا فَإِذَا أَنتُم مِّنْهُ تُوقِدُونَ (٨٠) أَوَلَيْسَ الَّذِى خَلَقَ السَّمَٰوَٰتِ وَالْأَرْضَ بِقَٰدِرٍ عَلَىٰ أَن يَخْلُقَ مِثْلَهُم ۚ بَلَىٰ وَهُوَ الْخَلَّٰقُ الْعَلِيمُ (٨١) إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْـًٔا أَن يَقُولَ لَهُ كُن فَيَكُونُ (٨٢) فَسُبْحَٰنَ الَّذِى بِيَدِهِ مَلَكُوتُ كُلِّ شَىْءٍ وَإِلَيْهِ تُرْجَعُونَ (٨٣)",
    "textEn": "He who created them the first time will revive them, and He knows every creation. His command when He intends anything is merely to say to it Be, and it is; glory to Him in whose hand is dominion over all things.",
    "source": "سورة يس: الآيات ٧٨ - ٨٣",
    "sourceEn": "Surah Ya-Sin: Verses 78-83"
  },
  {
    "id": "rq_quran_165",
    "type": "quran",
    "title": "سورة الصافات (الآيات ١٧١ - ١٨٢ - نصر العباد وتسبيح رب العزة)",
    "titleEn": "Surah As-Saffat (Verses 171-182 - Promise of Victory & Praise)",
    "text": "وَلَقَدْ سَبَقَتْ كَلِمَتُنَا لِعِبَادِنَا الْمُرْسَلِينَ (١٧١) إِنَّهُمْ لَهُمُ الْمَنصُورُونَ (١٧٢) وَإِنَّ جُندَنَا لَهُمُ الْغَٰلِبُونَ (١٧٣) فَتَوَلَّ عَنْهُمْ حَتَّىٰ حِينٍ (١٧٤) وَأَبْصِرْهُمْ فَسَوْفَ يُبْصِرُونَ (١٧٥) أَفَبِعَذَابِنَا يَسْتَعْجِلُونَ (١٧٦) فَإِذَا نَزَلَ بِسَاحَتِهِمْ فَسَاءَ صَبَاحُ الْمُنذَرِينَ (١٧٧) وَتَوَلَّ عَنْهُمْ حَتَّىٰ حِينٍ (١٧٨) وَأَبْصِرْ فَسَوْفَ يُبْصِرُونَ (١٧٩) سُبْحَٰنَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ (١٨٠) وَسَلَٰمٌ عَلَى الْمُرْسَلِينَ (١٨١) وَالْحَمْدُ لِلَّهِ رَبِّ الْعَٰلَمِينَ (١٨٢)",
    "textEn": "Our word has already gone forth to Our sent servants that they will be aided and Our forces will prevail. Exalted is your Lord, Lord of Might, above what they ascribe, peace upon the messengers, and praise to Allah, Lord of all worlds.",
    "source": "سورة الصافات: الآيات ١٧١ - ١٨٢",
    "sourceEn": "Surah As-Saffat: Verses 171-182"
  },
  {
    "id": "rq_quran_166",
    "type": "quran",
    "title": "سورة ص (الآيات ٤١ - ٤٤ - آية شفاء نبي الله أيوب من المس والضر)",
    "titleEn": "Surah Sad (Verses 41-44 - Healing of Prophet Job from Affliction)",
    "text": "وَاذْكُرْ عَبْدَنَا أَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّى مَسَّنِىَ الشَّيْطَٰنُ بِنُصْبٍ وَعَذَابٍ (٤١) ارْكُضْ بِرِجْلِكَ ۖ هَٰذَا مُغْتَسَلٌ بَارِدٌ وَشَرَابٌ (٤٢) وَوَهَبْنَا لَهُ أَهْلَهُ وَمِثْلَهُم مَّعَهُمْ رَحْمَةً مِّنَّا وَذِكْرَىٰ لِأُولِى الْأَلْبَٰبِ (٤٣) وَخُذْ بِيَدِكَ ضِغْثًا فَاضْرِب بِّهِ وَلَا تَحْنَثْ ۗ إِنَّا وَجَدْنَٰهُ صَابِرًا ۚ نِّعْمَ الْعَبْدُ ۖ إِنَّهُ أَوَّابٌ (٤٤)",
    "textEn": "Remember Our servant Job when he cried: Satan has touched me with distress and torment! He was told: Strike with your foot—here is cool water to bathe in and drink. And We restored his family doubled as mercy from Us.",
    "source": "سورة ص: الآيات ٤١ - ٤٤",
    "sourceEn": "Surah Sad: Verses 41-44"
  },
  {
    "id": "rq_quran_167",
    "type": "quran",
    "title": "سورة الزمر (الآية ٢٣ - لين الجلود والقلوب لذكر الله تعالى)",
    "titleEn": "Surah Az-Zumar (Verse 23 - Softening of Skin & Hearts to Allahs Word)",
    "text": "اللَّهُ نَزَّلَ أَحْسَنَ الْحَدِيثِ كِتَٰبًا مُّتَشَٰبِهًا مَّثَانِىَ تَقْشَعِرُّ مِنْهُ جُلُودُ الَّذِينَ يَخْشَوْنَ رَبَّهُمْ ثُمَّ تَلِينُ جُلُودُهُمْ وَقُلُوبُهُمْ إِلَىٰ ذِكْرِ اللَّهِ ۚ ذَٰلِكَ هُدَى اللَّهِ يَهْدِى بِهِ مَن يَشَاءُ ۚ وَمَن يُضْلِلِ اللَّهُ فَمَا لَهُ مِنْ هَادٍ (٢٣)",
    "textEn": "Allah revealed the finest discourse—a harmonious Book—from which the skins of those who fear their Lord shiver, then their skins and hearts soften peacefully toward the remembrance of Allah.",
    "source": "سورة الزمر: آية ٢٣",
    "sourceEn": "Surah Az-Zumar: Verse 23"
  },
  {
    "id": "rq_quran_168",
    "type": "quran",
    "title": "سورة الزمر (الآيات ٣٦ - ٣٨ - أليس الله بكاف عبده ودفع الضر)",
    "titleEn": "Surah Az-Zumar (Verses 36-38 - Is Allah Not Sufficient for His Servant?)",
    "text": "أَلَيْسَ اللَّهُ بِكَافٍ عَبْدَهُ ۖ وَيُخَوِّفُونَكَ بِالَّذِينَ مِن دُونِهِ ۚ وَمَن يُضْلِلِ اللَّهُ فَمَا لَهُ مِنْ هَادٍ (٣٦) وَمَن يَهْدِ اللَّهُ فَمَا لَهُ مِن مُّضِلٍّ ۗ أَلَيْسَ اللَّهُ بِعَزِيزٍ ذِى انتِقَامٍ (٣٧) وَلَئِن سَأَلْتَهُم مَّنْ خَلَقَ السَّمَٰوَٰتِ وَالْأَرْضَ لَيَقُولُنَّ اللَّهُ ۚ قُلْ أَفَرَءَيْتُم مَّا تَدْعُونَ مِن دُونِ اللَّهِ إِنْ أَرَادَنِىَ اللَّهُ بِضُرٍّ هَلْ هُنَّ كَٰشِفَٰتُ ضُرِّهِ أَوْ أَرَادَنِى بِرَحْمَةٍ هَلْ هُنَّ مُمْسِكَٰتُ رَحْمَتِهِ ۚ قُلْ حَسْبِىَ اللَّهُ ۖ عَلَيْهِ يَتَوَكَّلُ الْمُتَوَكِّلُونَ (٣٨)",
    "textEn": "Is Allah not sufficient for His servant? If Allah intends harm for me, could anything remove His harm, or if He intends mercy, could anything withhold His mercy? Say: Allah suffices for me; upon Him relying people place their trust.",
    "source": "سورة الزمر: الآيات ٣٦ - ٣٨",
    "sourceEn": "Surah Az-Zumar: Verses 36-38"
  },
  {
    "id": "rq_quran_169",
    "type": "quran",
    "title": "سورة غافر (الآيتان ٤٤ - ٤٥ - التفويض والوقاية من سيئات المكر)",
    "titleEn": "Surah Ghafir (Verses 44-45 - Entrusting Affairs & Saved from Plots)",
    "text": "فَسَتَذْكُرُونَ مَا أَقُولُ لَكُمْ ۚ وَأُفَوِّضُ أَمْرِى إِلَى اللَّهِ ۚ إِنَّ اللَّهَ بَصِيرٌ بِالْعِبَادِ (٤٤) فَوَقَىٰهُ اللَّهُ سَيِّـَٔاتِ مَا مَكَرُوا ۖ وَحَاقَ بِـَٔالِ فِرْعَوْنَ سُوءُ الْعَذَابِ (٤٥)",
    "textEn": "I entrust my entire affair to Allah; truly Allah sees His servants clearly. So Allah protected him completely from the evils of what they schemed.",
    "source": "سورة غافر: الآيتان ٤٤ - ٤٥",
    "sourceEn": "Surah Ghafir: Verses 44-45"
  },
  {
    "id": "rq_quran_170",
    "type": "quran",
    "title": "سورة فصلت (الآيات ٣٠ - ٣٢ - تنزل الملائكة بالطمأنينة: ألا تخافوا ولا تحزنوا)",
    "titleEn": "Surah Fussilat (Verses 30-32 - Angels Descend: Fear Not Nor Grieve)",
    "text": "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَٰمُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَٰئِكَةُ أَلَّا تَخَافُوا وَلَا تَحْزَنُوا وَأَبْشِرُوا بِالْجَنَّةِ الَّتِى كُنتُمْ تُوعَدُونَ (٣٠) نَحْنُ أَوْلِيَاؤُكُمْ فِى الْحَيَوٰةِ الدُّنْيَا وَفِى الْءَاخِرَةِ ۖ وَلَكُمْ فِيهَا مَا تَشْتَهِى أَنفُسُكُمْ وَلَكُمْ فِيهَا مَا تَدَّعُونَ (٣١) نُزُلًا مِّنْ غَفُورٍ رَّحِيمٍ (٣٢)",
    "textEn": "Upon those who affirm Our Lord is Allah and remain steadfast, angels descend saying: Have no fear and do not grieve, and rejoice in Paradise promised to you; we are your protectors in this world and the Hereafter.",
    "source": "سورة فصلت: الآيات ٣٠ - ٣٢",
    "sourceEn": "Surah Fussilat: Verses 30-32"
  },
  {
    "id": "rq_quran_171",
    "type": "quran",
    "title": "سورة فصلت (الآية ٣٦ - الاستعاذة بالله من نزغ الشيطان)",
    "titleEn": "Surah Fussilat (Verse 36 - Seeking Refuge from Satans Incitement)",
    "text": "وَإِمَّا يَنزَغَنَّكَ مِنَ الشَّيْطَٰنِ نَزْغٌ فَاسْتَعِذْ بِاللَّهِ ۖ إِنَّهُ هُوَ السَّمِيعُ الْعَلِيمُ (٣٦)",
    "textEn": "If any evil prompting from Satan touches you, seek refuge immediately in Allah; surely He is the All-Hearing, the All-Knowing.",
    "source": "سورة فصلت: آية ٣٦",
    "sourceEn": "Surah Fussilat: Verse 36"
  },
  {
    "id": "rq_quran_172",
    "type": "quran",
    "title": "سورة الشورى (الآية ١٩ - لطف الله بعباده القوي العزيز)",
    "titleEn": "Surah Ash-Shura (Verse 19 - Allah Is Most Subtle & All-Powerful)",
    "text": "اللَّهُ لَطِيفٌ بِعِبَادِهِ يَرْزُقُ مَن يَشَاءُ ۖ وَهُوَ الْقَوِىُّ الْعَزِيزُ (١٩)",
    "textEn": "Allah is Gentle and Subtle toward His servants; He provides for whomever He wills, and He is the All-Strong, the Almighty.",
    "source": "سورة الشورى: آية ١٩",
    "sourceEn": "Surah Ash-Shura: Verse 19"
  },
  {
    "id": "rq_quran_173",
    "type": "quran",
    "title": "سورة الفتح (الآية ١٨ - إنزال السكينة والفتح القريب)",
    "titleEn": "Surah Al-Fath (Verse 18 - Serenity Sent Down & Near Victory)",
    "text": "۞ لَّقَدْ رَضِىَ اللَّهُ عَنِ الْمُؤْمِنِينَ إِذْ يُبَايِعُونَكَ تَحْتَ الشَّجَرَةِ فَعَلِمَ مَا فِى قُلُوبِهِمْ فَأَنزَلَ السَّكِينَةَ عَلَيْهِمْ وَأَثَٰبَهُمْ فَتْحًا قَرِيبًا (١٨)",
    "textEn": "Allah was pleased with the believers when they pledged allegiance beneath the tree; He knew what was in their hearts, so He sent tranquility down upon them and rewarded them with a near victory.",
    "source": "سورة الفتح: آية ١٨",
    "sourceEn": "Surah Al-Fath: Verse 18"
  },
  {
    "id": "rq_quran_174",
    "type": "quran",
    "title": "سورة الفتح (الآية ٢٦ - إنزال السكينة وإلزام كلمة التقوى)",
    "titleEn": "Surah Al-Fath (Verse 26 - Tranquility & the Word of Piety)",
    "text": "إِذْ جَعَلَ الَّذِينَ كَفَرُوا فِى قُلُوبِهِمُ الْحَمِيَّةَ حَمِيَّةَ الْجَٰهِلِيَّةِ فَأَنزَلَ اللَّهُ سَكِينَتَهُ عَلَىٰ رَسُولِهِ وَعَلَى الْمُؤْمِنِينَ وَأَلْزَمَهُمْ كَلِمَةَ التَّقْوَىٰ وَكَانُوا أَحَقَّ بِهَا وَأَهْلَهَا ۚ وَكَانَ اللَّهُ بِكُلِّ شَىْءٍ عَلِيمًا (٢٦)",
    "textEn": "So Allah sent His serenity down upon His Messenger and upon the believers and bound them firmly to the word of righteousness; they were most deserving and worthy of it, and Allah knows all things.",
    "source": "سورة الفتح: آية ٢٦",
    "sourceEn": "Surah Al-Fath: Verse 26"
  },
  {
    "id": "rq_quran_175",
    "type": "quran",
    "title": "سورة الطلاق (الآيتان ٢ - ٣ - المخرج من كل ضيق وكفاية المتوكل)",
    "titleEn": "Surah At-Talaq (Verses 2-3 - A Way Out from Every Difficulty)",
    "text": "فَإِذَا بَلَغْنَ أَجَلَهُنَّ فَأَمْسِكُوهُنَّ بِمَعْرُوفٍ أَوْ فَارِقُوهُنَّ بِمَعْرُوفٍ وَأَشْهِدُوا ذَوَىْ عَدْلٍ مِّنكُمْ وَأَقِيمُوا الشَّهَٰدَةَ لِلَّهِ ۚ ذَٰلِكُمْ يُوعَظُ بِهِ مَن كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْءَاخِرِ ۚ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا (٢) وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَٰلِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَىْءٍ قَدْرًا (٣)",
    "textEn": "Whoever is mindful of Allah—He will make a way out for him and provide for him from sources never expected; and whoever puts his trust in Allah, He alone is sufficient for him.",
    "source": "سورة الطلاق: الآيتان ٢ - ٣",
    "sourceEn": "Surah At-Talaq: Verses 2-3"
  },
  {
    "id": "rq_quran_176",
    "type": "quran",
    "title": "سورة التحريم (الآية ٨ - التوبة النصوح وإتمام النور الرباني)",
    "titleEn": "Surah At-Tahrim (Verse 8 - Perfecting Our Light & Forgiveness)",
    "text": "يَٰأَيُّهَا الَّذِينَ ءَامَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا عَسَىٰ رَبُّكُمْ أَن يُكَفِّرَ عَنكُمْ سَيِّـَٔاتِكُمْ وَيُدْخِلَكُمْ جَنَّٰتٍ تَجْرِى مِن تَحْتِهَا الْأَنْهَٰرُ يَوْمَ لَا يُخْزِى اللَّهُ النَّبِىَّ وَالَّذِينَ ءَامَنُوا مَعَهُ ۖ نُورُهُمْ يَسْعَىٰ بَيْنَ أَيْدِيهِمْ وَبِأَيْمَٰنِهِمْ يَقُولُونَ رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا ۖ إِنَّكَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ (٨)",
    "textEn": "Turn to Allah in sincere repentance so your Lord may remove your misdeeds, while believers pray: Our Lord, perfect our light for us and forgive us, for You have power over all things.",
    "source": "سورة التحريم: آية ٨",
    "sourceEn": "Surah At-Tahrim: Verse 8"
  },
  {
    "id": "rq_quran_177",
    "type": "quran",
    "title": "سورة الأعلى (الآيات ١ - ٩ - التنزيه والتيسير لليسرى وتبديد العسر)",
    "titleEn": "Surah Al-Ala (Verses 1-9 - Easing the Path to Ease)",
    "text": "سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى (١) الَّذِى خَلَقَ فَسَوَّىٰ (٢) وَالَّذِى قَدَّرَ فَهَدَىٰ (٣) وَالَّذِى أَخْرَجَ الْمَرْعَىٰ (٤) فَجَعَلَهُ غُثَاءً أَحْوَىٰ (٥) سَنُقْرِئُكَ فَلَا تَنسَىٰ (٦) إِلَّا مَا شَاءَ اللَّهُ ۚ إِنَّهُ يَعْلَمُ الْجَهْرَ وَمَا يَخْفَىٰ (٧) وَنُيَسِّرُكَ لِلْيُسْرَىٰ (٨) فَذَكِّرْ إِن نَّفَعَتِ الذِّكْرَىٰ (٩)",
    "textEn": "Glorify the name of your Most High Lord who created and fashioned in harmony, guided all things, and brings forth fresh pasture. We will ease you into the path of total ease.",
    "source": "سورة الأعلى: الآيات ١ - ٩",
    "sourceEn": "Surah Al-Ala: Verses 1-9"
  },
  {
    "id": "rq_quran_178",
    "type": "quran",
    "title": "سورة الضحى (الآيات ١ - ١١ - طرد الهم والاكتئاب وبشرى العطاء والرضا)",
    "titleEn": "Surah Ad-Duha (Verses 1-11 - Comfort, Hope & Lifting Grief)",
    "text": "وَالضُّحَىٰ (١) وَالَّيْلِ إِذَا سَجَىٰ (٢) مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ (٣) وَلَلْءَاخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ (٤) وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ (٥) أَلَمْ يَجِدْكَ يَتِيمًا فَـَٔاوَىٰ (٦) وَوَجَدَكَ ضَالًّا فَهَدَىٰ (٧) وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ (٨) فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ (٩) وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ (١٠) وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ (١١)",
    "textEn": "By the bright morning and peaceful night, your Lord has never forsaken you nor grown displeased. The coming will be far better than the past, your Lord will give you until you are well pleased, and proclaim His favors.",
    "source": "سورة الضحى: الآيات ١ - ١١",
    "sourceEn": "Surah Ad-Duha: Verses 1-11"
  },
  {
    "id": "rq_quran_179",
    "type": "quran",
    "title": "سورة التين (الآيات ١ - ٨ - تقويم الخلقة في أحسن صورة)",
    "titleEn": "Surah At-Tin (Verses 1-8 - Created in the Finest Form)",
    "text": "وَالتِّينِ وَالزَّيْتُونِ (١) وَطُورِ سِينِينَ (٢) وَهَٰذَا الْبَلَدِ الْأَمِينِ (٣) لَقَدْ خَلَقْنَا الْإِنسَٰنَ فِى أَحْسَنِ تَقْوِيمٍ (٤) ثُمَّ رَدَدْنَٰهُ أَسْفَلَ سَٰفِلِينَ (٥) إِلَّا الَّذِينَ ءَامَنُوا وَعَمِلُوا الصَّٰلِحَٰتِ فَلَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍ (٦) فَمَا يُكَذِّبُكَ بَعْدُ بِالدِّينِ (٧) أَلَيْسَ اللَّهُ بِأَحْكَمِ الْحَٰكِمِينَ (٨)",
    "textEn": "We surely created humankind in the finest form and stature; those who believe and do good earn an unending reward, and is Allah not the wisest of all judges?",
    "source": "سورة التين: الآيات ١ - ٨",
    "sourceEn": "Surah At-Tin: Verses 1-8"
  },
  {
    "id": "rq_quran_180",
    "type": "quran",
    "title": "سورة القدر (الآيات ١ - ٥ - السكينة والسلام حتى مطلع الفجر)",
    "titleEn": "Surah Al-Qadr (Verses 1-5 - Peace Until the Rising of Dawn)",
    "text": "إِنَّا أَنزَلْنَٰهُ فِى لَيْلَةِ الْقَدْرِ (١) وَمَا أَدْرَىٰكَ مَا لَيْلَةُ الْقَدْرِ (٢) لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ (٣) تَنَزَّلُ الْمَلَٰئِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ (٤) سَلَٰمٌ هِىَ حَتَّىٰ مَطْلَعِ الْفَجْرِ (٥)",
    "textEn": "Truly We sent it down on the Night of Decree—better than a thousand months; therein angels and the Spirit descend by their Lords permission with every decree: all is peace until the break of dawn.",
    "source": "سورة القدر: الآيات ١ - ٥",
    "sourceEn": "Surah Al-Qadr: Verses 1-5"
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
  },
  {
    "id": "rq_sunnah_71",
    "type": "sunnah",
    "title": "الاستعاذة من شر النفس والشيطان وشركه صباحاً ومساءً",
    "titleEn": "Refuge from Self-Evil and Satans Polytheism Morning & Evening",
    "text": "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.",
    "textEn": "O Allah, Knower of the unseen and seen, Creator of the heavens and earth, Lord and Sovereign of everything: I witness there is no deity except You, and seek refuge in You from the evil of my soul, from Satan and his snare, and from harming myself or any Muslim.",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_72",
    "type": "sunnah",
    "title": "دعاء طلب خير اليوم وخير الليلة والوقاية من شرهما",
    "titleEn": "Asking the Good of the Day & Night and Protection from Their Evil",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ: فَتْحَهُ، وَنَصْرَهُ، وَنُورَهُ، وَبَرَكَتَهُ، وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ.",
    "textEn": "O Allah, I ask You for the goodness of this day—its opening, victory, light, blessing, and guidance—and seek refuge in You from the evil within it and after it.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_73",
    "type": "sunnah",
    "title": "التهليل المائة حرز من الشيطان طوال اليوم",
    "titleEn": "One Hundred Tahlil as a Daily Shield Against Satan",
    "text": "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ (مائة مرة: كانت له حرزاً من الشيطان يومه ذلك حتى يمسي).",
    "textEn": "There is no deity except Allah alone without partner; His is the dominion, His is all praise, and He is capable over everything. Reciting this a hundred times serves as a shield against Satan all day.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_74",
    "type": "sunnah",
    "title": "دعاء السكينة وطلب العافية في الصباح والمساء",
    "titleEn": "Morning & Evening Supplication of Dominion & Refuge from Sloth",
    "text": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    "textEn": "We have entered the morning and all sovereignty belongs to Allah. My Lord, I seek refuge in You from laziness, wretched old age, punishment in the Fire, and punishment in the grave.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_75",
    "type": "sunnah",
    "title": "التحصين النبوي الشامل للقلب والروح صباحاً ومساءً",
    "titleEn": "Comprehensive Prophetic Morning & Evening Protection for Soul & Body",
    "text": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
    "textEn": "O Allah, by Your leave we reach morning and evening, by Your will we live and die, and unto You is the resurrection.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_76",
    "type": "sunnah",
    "title": "الشكر على النعم وتحصينها من الزوال والحسد",
    "titleEn": "Gratitude Protecting Blessings from Loss and Envy",
    "text": "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.",
    "textEn": "O Allah, whatever blessing reaches me or any of Your creation this morning comes solely from You without partner, so to You belongs all praise and thanks.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_77",
    "type": "sunnah",
    "title": "دعاء حفظ النفس والروح عند النوم",
    "titleEn": "Safeguarding the Soul Upon Lying Down to Sleep",
    "text": "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
    "textEn": "In Your Name, my Lord, I lay down my side and by You I raise it; should You retain my soul have mercy on it, and should You send it back guard it as You guard Your righteous servants.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_78",
    "type": "sunnah",
    "title": "دعاء تسليم النفس والوجه والظهر لله عند النوم",
    "titleEn": "Surrendering the Soul to Allahs Protection Before Sleep",
    "text": "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ.",
    "textEn": "O Allah, I surrender myself to You, entrust my affair to You, turn my face toward You, and take shelter in You with hope and awe; there is no refuge or escape from You except unto You.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_79",
    "type": "sunnah",
    "title": "ذكر التقلب في الليل وطرد الأحلام المزعجة",
    "titleEn": "Remembrance When Waking or Turning at Night",
    "text": "لَا إِلَٰهَ إِلَّا اللَّهُ الْوَاحِدُ الْقَهَّارُ، رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا الْعَزِيزُ الْغَفَّارُ.",
    "textEn": "There is no deity except Allah, the One, the Subduer, Lord of the heavens and earth and what lies between them, the Almighty, the Perpetual Forgiver.",
    "source": "صحيح ابن حبان والحاكم",
    "sourceEn": "Sahih Ibn Hibban & Al-Hakim"
  },
  {
    "id": "rq_sunnah_80",
    "type": "sunnah",
    "title": "دعاء حفظ النفس في الممات والمحيا عند النوم",
    "titleEn": "Entrusting Life and Death of the Soul to Allah",
    "text": "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ.",
    "textEn": "O Allah, You created my soul and You take it back; to You belong its death and life. Keep it safe if You preserve it alive, forgive it if You take it, and grant me well-being.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_81",
    "type": "sunnah",
    "title": "الاستعاذة عند دخول الخلاء من الشياطين",
    "titleEn": "Refuge from Male and Female Devils Upon Entering the Restroom",
    "text": "بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ.",
    "textEn": "In Allahs Name; O Allah, I seek refuge in You from evil male and female devils.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_82",
    "type": "sunnah",
    "title": "ذكر دخول المنزل لتحصينه من مبيت الشيطان",
    "titleEn": "Supplication Upon Entering Home to Bar Satans Stay",
    "text": "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا.",
    "textEn": "In Allahs Name we enter, in Allahs Name we depart, and upon Allah our Lord we place our reliance.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_83",
    "type": "sunnah",
    "title": "ذكر الدخول إلى المسجد والحفظ من الشيطان الرجيم",
    "titleEn": "Seeking Refuge in the Almighty When Entering the Mosque",
    "text": "أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ.",
    "textEn": "I seek refuge in Almighty Allah, in His Noble Countenance, and in His eternal sovereignty from the accursed Satan.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_84",
    "type": "sunnah",
    "title": "دعاء التطهر من الدنس والذنوب بعد الوضوء",
    "titleEn": "Purification of Heart and Body After Ablution",
    "text": "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ.",
    "textEn": "O Allah, count me among those who constantly turn in repentance and among those who keep themselves pure.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_85",
    "type": "sunnah",
    "title": "دعاء حفظ البصر والسمع والعقل من السوء في السفر",
    "titleEn": "Refuge from Hardship and Harm During Travel",
    "text": "اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ.",
    "textEn": "O Allah, You are the Companion on travel and Guardian over the household; I seek refuge in You from travels hardship, sorrowful sights, and evil return in wealth and family.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_86",
    "type": "sunnah",
    "title": "الاستعاذة من العجز والكسل والهرم وعذاب القبر",
    "titleEn": "Refuge from Weakness, Laziness & Trials of Old Age",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَالْهَرَمِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ.",
    "textEn": "O Allah, I seek refuge in You from helplessness, laziness, cowardice, stinginess, extreme old age, punishment in the grave, and the trials of life and death.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_87",
    "type": "sunnah",
    "title": "الاستعاذة من الكفر والفقر والغضب الإلهي",
    "titleEn": "Refuge from Disbelief, Poverty & Grave Punishment",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَٰهَ إِلَّا أَنْتَ (ثلاث مرات صباحاً ومساءً).",
    "textEn": "O Allah, I seek refuge in You from disbelief, poverty, and the torment of the grave; there is no deity except You.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_88",
    "type": "sunnah",
    "title": "الاستعاذة من الصمم والبكم وأمراض البدن المزمنة",
    "titleEn": "Refuge from Deafness, Muteness & Severe Diseases",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الصَّمَمِ، وَالْبَكَمِ، وَالْجُنُونِ، وَالْجُذَامِ، وَالْبَرَصِ، وَسَيِّئِ الْأَسْقَامِ.",
    "textEn": "O Allah, I seek refuge in You from deafness, muteness, insanity, leprosy, vitiligo, and all severe ailments.",
    "source": "صحيح ابن حبان والحاكم",
    "sourceEn": "Sahih Ibn Hibban & Al-Hakim"
  },
  {
    "id": "rq_sunnah_89",
    "type": "sunnah",
    "title": "الاستعاذة من منكرات الأخلاق والأعمال والأهواء والأدواء",
    "titleEn": "Refuge from Corrupt Character, Desires & Illnesses",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ مُنْكَرَاتِ الْأَخْلَاقِ، وَالْأَعْمَالِ، وَالْأَهْوَاءِ، وَالْأَدْوَاءِ.",
    "textEn": "O Allah, I seek refuge in You from dishonorable manners, evil deeds, misguided desires, and malignant diseases.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_90",
    "type": "sunnah",
    "title": "الاستعاذة من الفقر والقلة والذلة ومن الظلم",
    "titleEn": "Refuge from Destitution, Humiliation & Oppression",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْفَقْرِ وَالْقِلَّةِ وَالذِّلَّةِ، وَأَعُوذُ بِكَ مِنْ أَنْ أَظْلِمَ أَوْ أُظْلَمَ.",
    "textEn": "O Allah, I seek refuge in You from poverty, scarcity, and humiliation, and I seek refuge in You from wronging others or being wronged.",
    "source": "سنن أبي داود والنسائي",
    "sourceEn": "Sunan Abi Dawud & An-Nasai"
  },
  {
    "id": "rq_sunnah_91",
    "type": "sunnah",
    "title": "الاستعاذة من القسوة والغفلة والعيلة والفسوق",
    "titleEn": "Refuge from Hard-Heartedness, Heedlessness & Discord",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْقَسْوَةِ وَالْغَفْلَةِ وَالْعَيْلَةِ وَالذِّلَّةِ وَالْمَسْكَنَةِ، وَأَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفُسُوقِ وَالشِّقَاقِ وَالسُّمْعَةِ وَالرِّيَاءِ.",
    "textEn": "O Allah, I seek refuge in You from a hardened heart, heedlessness, destitution, abasement, disbelief, wickedness, division, vanity, and showing off.",
    "source": "صحيح ابن حبان والحاكم",
    "sourceEn": "Sahih Ibn Hibban & Al-Hakim"
  },
  {
    "id": "rq_sunnah_92",
    "type": "sunnah",
    "title": "الاستعاذة من يوم السوء وليلة السوء وصاحب السوء",
    "titleEn": "Refuge from an Evil Day, Night, Hour & Companion",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ يَوْمِ السُّوءِ، وَمِنْ لَيْلَةِ السُّوءِ، وَمِنْ سَاعَةِ السُّوءِ، وَمِنْ صَاحِبِ السُّوءِ، وَمِنْ جَارِ السُّوءِ فِي دَارِ الْمُقَامَةِ.",
    "textEn": "O Allah, I seek refuge in You from a bad day, a bad night, an evil hour, an evil companion, and an evil neighbor in my permanent home.",
    "source": "المعجم الكبير للطبراني",
    "sourceEn": "Al-Mujam al-Kabir (At-Tabarani)"
  },
  {
    "id": "rq_sunnah_93",
    "type": "sunnah",
    "title": "الاستعاذة من الجوع والخيانة وفساد الباطن",
    "titleEn": "Refuge from Destructive Hunger and Treachery",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْجُوعِ فَإِنَّهُ بِئْسَ الضَّجِيعُ، وَأَعُوذُ بِكَ مِنَ الْخِيَانَةِ فَإِنَّهَا بِئْسَتِ الْبِطَانَةُ.",
    "textEn": "O Allah, I seek refuge in You from hunger for it is a miserable companion, and from treachery for it is a wretched inner trait.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_94",
    "type": "sunnah",
    "title": "الاستعاذة من شر ما عملت ومن شر ما لم أعمل",
    "titleEn": "Refuge from the Evil of Past & Uncommitted Actions",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا عَمِلْتُ، وَمِنْ شَرِّ مَا لَمْ أَعْمَلْ.",
    "textEn": "O Allah, I seek refuge in You from the evil of whatever I have done and from the evil of whatever I have not done.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_95",
    "type": "sunnah",
    "title": "الاستعاذة من المأثم والمغرم وتسلط الديون",
    "titleEn": "Refuge from Sin and Crushing Debt",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْمَأْثَمِ وَالْمَغْرَمِ.",
    "textEn": "O Allah, I seek refuge in You from falling into sin and from being burdened by debt.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_96",
    "type": "sunnah",
    "title": "الاستعاذة من أرذل العمر وفتنة الدنيا والدجال",
    "titleEn": "Refuge from Feeble Old Age & Worldly Trials",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُرَدَّ إِلَى أَرْذَلِ الْعُمُرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الدُّنْيَا، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ.",
    "textEn": "O Allah, I seek refuge in You from being returned to the feeblest old age, from the trials of this world, and from the torment of the grave.",
    "source": "صحيح البخاري",
    "sourceEn": "Sahih al-Bukhari"
  },
  {
    "id": "rq_sunnah_97",
    "type": "sunnah",
    "title": "دعاء النجاة من الشرك الخفي والجلي",
    "titleEn": "Seeking Refuge from Known and Unseen Polytheism",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ.",
    "textEn": "O Allah, I seek refuge in You from associating anything with You knowingly, and I ask Your forgiveness for what I do unknowingly.",
    "source": "الأدب المفرد للبخاري",
    "sourceEn": "Al-Adab al-Mufrad (Al-Bukhari)"
  },
  {
    "id": "rq_sunnah_98",
    "type": "sunnah",
    "title": "الاستعاذة من ضيق الدنيا وضيق يوم القيامة",
    "titleEn": "Refuge from the Constrictions of This World & Hereafter",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ ضِيقِ الدُّنْيَا وَضِيقِ يَوْمِ الْقِيَامَةِ.",
    "textEn": "O Allah, I seek refuge in You from the distress and narrowness of this world and the Day of Resurrection.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_99",
    "type": "sunnah",
    "title": "دعاء حفظ البصر عند النظر إلى المرآة وتحسين الخُلق",
    "titleEn": "Beautifying Character Just as Allah Perfected Form",
    "text": "اللَّهُمَّ كَمَا أَحْسَنْتَ خَلْقِي فَحَسِّنْ خُلُقِي.",
    "textEn": "O Allah, just as You have made my outward form good, make my character noble as well.",
    "source": "مسند أحمد",
    "sourceEn": "Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_100",
    "type": "sunnah",
    "title": "دعاء التبريك على كل ما يعجب الإنسان أو يخصه",
    "titleEn": "Invoking Allahs Blessing Upon Whatever Pleases One",
    "text": "اللَّهُمَّ بَارِكْ عَلَيْهِ، إِذَا رَأَى أَحَدُكُمْ مِنْ نَفْسِهِ أَوْ مَالِهِ أَوْ مِنْ أَخِيهِ مَا يُعْجِبُهُ فَلْيَدْعُ لَهُ بِالْبَرَكَةِ؛ فَإِنَّ الْعَيْنَ حَقٌّ.",
    "textEn": "O Allah, shower blessing upon it. Whenever one of you sees something pleasing in himself, his wealth, or his brother, let him pray for blessing upon it, for the evil eye is real.",
    "source": "مسند أحمد وسنن ابن ماجه",
    "sourceEn": "Musnad Ahmad & Sunan Ibn Majah"
  },
  {
    "id": "rq_sunnah_101",
    "type": "sunnah",
    "title": "أمر النبي ﷺ بالاغتسال للمعيون من العائن طلباً للشفاء",
    "titleEn": "Prophetic Guidance on Neutralizing the Evil Eye",
    "text": "الْعَيْنُ حَقٌّ، وَلَوْ كَانَ شَيْءٌ سَابَقَ الْقَدَرَ سَبَقَتْهُ الْعَيْنُ، وَإِذَا اسْتُغْسِلْتُمْ فَاغْسِلُوا.",
    "textEn": "The evil eye is real; if anything could overtake divine decree, the evil eye would overtake it. And if you are asked to wash as a remedy for it, then wash.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_102",
    "type": "sunnah",
    "title": "الرضا بالله رباً وبالإسلام ديناً حصن الصباح والمساء",
    "titleEn": "Daily Fortress of Contentment with Allah, Islam & His Prophet",
    "text": "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا (ثلاث مرات صباحاً ومساءً).",
    "textEn": "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad, peace and blessings be upon him, as my Prophet (recited three times morning and evening).",
    "source": "سنن أبي داود ومسند أحمد",
    "sourceEn": "Sunan Abi Dawud & Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_103",
    "type": "sunnah",
    "title": "دعاء اللدغة والحمى والوجع المفاجئ",
    "titleEn": "Prophetic Supplication for Fever and Sudden Pain",
    "text": "بِسْمِ اللَّهِ الْكَبِيرِ، أَعُوذُ بِاللَّهِ الْعَظِيمِ مِنْ شَرِّ كُلِّ عِرْقٍ نَعَّارٍ، وَمِنْ شَرِّ حَرِّ النَّارِ.",
    "textEn": "In the Name of Allah the Great, I seek refuge in Almighty Allah from the evil of every throbbing vein and from the evil of the heat of fire.",
    "source": "جامع الترمذي وابن ماجه",
    "sourceEn": "Jami At-Tirmidhi & Ibn Majah"
  },
  {
    "id": "rq_sunnah_104",
    "type": "sunnah",
    "title": "دعاء كشف الغم وسؤال الله بأسمائه الحسنى وأفعاله",
    "titleEn": "Supplication by Allahs Oneness and Praise for Relief",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدَ لَا إِلَٰهَ إِلَّا أَنْتَ، الْمَنَّانُ، بَدِيعُ السَّمَاوَاتِ وَالْأَرْضِ، يَا ذَا الْجَلَالِ وَالْإِكْرَامِ، يَا حَيُّ يَا قَيُّومُ، أَنْ تَشْفِيَنِي وَتُعَافِيَنِي.",
    "textEn": "O Allah, I ask You since all praise is Yours, there is no deity except You, the Bestower, Originator of the heavens and earth, O Possessor of Majesty and Honor, O Ever-Living, O Sustainer, to heal me and grant me wellness.",
    "source": "سنن أبي داود والنسائي",
    "sourceEn": "Sunan Abi Dawud & An-Nasai"
  },
  {
    "id": "rq_sunnah_105",
    "type": "sunnah",
    "title": "التوسل باسم الله الأعظم لدفع الشدة وتفريج الكرب",
    "titleEn": "Beseeching by the Greatest Name for Deliverance",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنِّي أَشْهَدُ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ، الْأَحَدُ الصَّمَدُ، الَّذِي لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ، أَنْ تَفْرُجَ كَرْبِي وَتَشْفِيَ سَقَمِي.",
    "textEn": "O Allah, I ask You by testifying that You are Allah, there is no deity except You, the One, Eternal Refuge, who neither begets nor is born nor has any equal, to lift my distress and cure my illness.",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_106",
    "type": "sunnah",
    "title": "دعاء قضاء الدين وزوال الهم المالي والنفسي",
    "titleEn": "Supplication for Settling Debt and Dispelling Worry",
    "text": "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ.",
    "textEn": "O Allah, suffice me with what You made lawful over what You forbade, and enrich me by Your grace so I need none besides You.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_107",
    "type": "sunnah",
    "title": "الاستعاذة النبوية عند الخوف من السحر أو كيد الساحرين",
    "titleEn": "Seeking Allahs Protection Against Sorcery & Devils",
    "text": "أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ، مِنْ هَمْزِهِ وَنَفْخِهِ وَنَفْثِهِ.",
    "textEn": "I seek refuge in Allah, the All-Hearing, All-Knowing, from the accursed Satan—from his madness, his pride, and his sorcerous whispers.",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_108",
    "type": "sunnah",
    "title": "التعوذ بالله من تخوفات الليل والظلام والوحشة",
    "titleEn": "Seeking Peace When Feeling Frightened at Night",
    "text": "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ (من قالها إذا تعارّ من الليل ثم دعا استجيب له).",
    "textEn": "There is no deity except Allah alone without partner; glory to Allah, praise to Allah, Allah is Most Great, and there is no power except with Allah. Whoever wakes at night saying this and supplicates will be answered.",
    "source": "صحيح البخاري",
    "sourceEn": "Sahih al-Bukhari"
  },
  {
    "id": "rq_sunnah_109",
    "type": "sunnah",
    "title": "دعاء صلاح الدين والدنيا والآخرة وجعل الموت راحة من كل شر",
    "titleEn": "Rectifying Religion, Life & Hereafter and Relief from Evil",
    "text": "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.",
    "textEn": "O Allah, rectify my religion which safeguards my affairs, my worldly life wherein lies my livelihood, and my Hereafter to which I return; make life an increase in all good and death a rest from all evil.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_110",
    "type": "sunnah",
    "title": "دعاء المغفرة والرحمة والهداية والعافية والرزق",
    "titleEn": "Fivefold Prophetic Prayer for Forgiveness & Health",
    "text": "اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي.",
    "textEn": "O Allah, forgive me, have mercy on me, guide me, grant me well-being, and provide for me.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_111",
    "type": "sunnah",
    "title": "دعاء الجار الحصين برب السماوات السبع والأرضين",
    "titleEn": "Taking Allah as Protector Against Hostile Creation",
    "text": "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، كُنْ لِي جَارًا مِنْ شَرِّ فُلَانٍ وَأَحْزَابِهِ مِنْ خَلَائِقِكَ أَنْ يَفْرُطَ عَلَيَّ أَحَدٌ مِنْهُمْ أَوْ يَطْغَى، عَزَّ جَارُكَ وَجَلَّ ثَنَاؤُكَ وَلَا إِلَٰهَ إِلَّا أَنْتَ.",
    "textEn": "O Allah, Lord of the seven heavens and the Great Throne, be a protector for me against the evil of every hostile creature lest any of them transgress or oppress me; mighty is Your shelter and exalted is Your praise.",
    "source": "الأدب المفرد للبخاري",
    "sourceEn": "Al-Adab al-Mufrad (Al-Bukhari)"
  },
  {
    "id": "rq_sunnah_112",
    "type": "sunnah",
    "title": "التعوذ من فتنة الغنى وفتنة الفقر ومخالطة السوء",
    "titleEn": "Refuge from Trials of Wealth, Poverty & Hellfire",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ فِتْنَةِ النَّارِ وَعَذَابِ النَّارِ، وَمِنْ شَرِّ الْغِنَى وَالْفَقْرِ.",
    "textEn": "O Allah, I seek refuge in You from the trial and torment of the Fire, and from the evil trials of both wealth and poverty.",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_113",
    "type": "sunnah",
    "title": "الاستعاذة من سوء المنظر وتبدل الحال في الأهل والمال",
    "titleEn": "Refuge from Sudden Calamity and Loss of Blessings",
    "text": "اللَّهُمَّ قِنِي شَرَّ نَفْسِي، وَاعْزِمْ لِي عَلَى أَرْشَدِ أَمْرِي، اللَّهُمَّ اغْفِرْ لِي مَا أَسْرَرْتُ وَمَا أَعْلَنْتُ، وَمَا أَخْطَأْتُ وَمَا عَمَدْتُ، وَمَا عَلِمْتُ وَمَا جَهِلْتُ.",
    "textEn": "O Allah, shield me from the evil of myself and resolve me upon my wisest course; forgive what I did secretly or openly, by mistake or deliberately, knowingly or unknowingly.",
    "source": "مسند أحمد والحاكم",
    "sourceEn": "Musnad Ahmad & Al-Hakim"
  },
  {
    "id": "rq_sunnah_114",
    "type": "sunnah",
    "title": "دعاء طلب التثبيت والهداية والسداد عند الاضطراب",
    "titleEn": "Supplication for Guidance & Straightness of Heart",
    "text": "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي، وَاذْكُرْ بِالْهُدَى هِدَايَتَكَ الطَّرِيقَ، وَالسَّدَادِ سَدَادَ السَّهْمِ.",
    "textEn": "O Allah, guide me and keep me straight, aiming my path to true guidance just as a well-shot arrow flies straight.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_115",
    "type": "sunnah",
    "title": "دعاء الثبات في الأمر والعزيمة على الرشد",
    "titleEn": "Asking Steadfastness and Sound Determination",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الثَّبَاتَ فِي الْأَمْرِ، وَالْعَزِيمَةَ عَلَى الرُّشْدِ، وَأَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ وَعَزَائِمَ مَغْفِرَتِكَ، وَأَسْأَلُكَ شُكْرَ نِعْمَتِكَ وَحُسْنَ عِبَادَتِكَ.",
    "textEn": "O Allah, I ask You for firmness in every matter, resolve upon right guidance, the means of Your mercy, Your assured forgiveness, gratitude for Your blessings, and excellence in worship.",
    "source": "سنن النسائي",
    "sourceEn": "Sunan An-Nasai"
  },
  {
    "id": "rq_sunnah_116",
    "type": "sunnah",
    "title": "دعاء السلامة من كل إثم والفوز بالعفو والمغفرة",
    "titleEn": "Asking Safety from Every Sin & Full Pardon",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ سَلَامَةً فِي دِينِي، وَعَافِيَةً فِي جَسَدِي، وَبَرَكَةً فِي رِزْقِي، وَتَوْبَةً قَبْلَ الْمَوْتِ، وَرَحْمَةً عِنْدَ الْمَوْتِ، وَمَغْفِرَةً بَعْدَ الْمَوْتِ.",
    "textEn": "O Allah, grant me soundness in my religion, health in my body, blessing in my provision, sincere repentance before death, mercy at death, and forgiveness after death.",
    "source": "دعاء مأثور للسلامة والعافية",
    "sourceEn": "Traditional Dua for Health & Safety"
  },
  {
    "id": "rq_sunnah_117",
    "type": "sunnah",
    "title": "دعاء الإعانة على الذكر والشكر وحسن العبادة للوقاية الروحية",
    "titleEn": "Seeking Aid in Constant Remembrance & Worship",
    "text": "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.",
    "textEn": "O Allah, assist me in remembering You, thanking You, and worshipping You in the finest manner.",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_118",
    "type": "sunnah",
    "title": "دعاء العفاف والغنى بالله عن جميع خلقه",
    "titleEn": "Asking Guidance, Piety, Purity & Independence",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.",
    "textEn": "O Allah, I ask You for guidance, righteousness, purity of soul, and self-sufficiency.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_119",
    "type": "sunnah",
    "title": "سؤال الله القنوع والبركة وإخلاف الخيرات",
    "titleEn": "Contentment, Blessing & Replacing Every Loss",
    "text": "اللَّهُمَّ قَنِّعْنِي بِمَا رَزَقْتَنِي، وَبَارِكْ لِي فِيهِ، وَاخْلُفْ عَلَيَّ كُلَّ غَائِبَةٍ لِي بِخَيْرٍ.",
    "textEn": "O Allah, make me content with what You have provided me, bless it for me, and replace whatever I lose with good.",
    "source": "المستدرك للحاكم",
    "sourceEn": "Al-Mustadrak (Al-Hakim)"
  },
  {
    "id": "rq_sunnah_120",
    "type": "sunnah",
    "title": "دعاء حسن العاقبة والأمن من خزي الدنيا وعذاب الآخرة",
    "titleEn": "Seeking a Good Outcome in All Affairs",
    "text": "اللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الْأُمُورِ كُلِّهَا، وَأَجِرْنَا مِنْ خِزْيِ الدُّنْيَا وَعَذَابِ الْآخِرَةِ.",
    "textEn": "O Allah, grant us a blessed end in every affair, and protect us from disgrace in this life and torment in the Hereafter.",
    "source": "مسند أحمد والحاكم",
    "sourceEn": "Musnad Ahmad & Al-Hakim"
  },
  {
    "id": "rq_sunnah_121",
    "type": "sunnah",
    "title": "سيد الاستغفار للتحصين اليومي ودفع البلاء بالذنوب",
    "titleEn": "Sayyid al-Istighfar: Removing Sins That Invite Harm",
    "text": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    "textEn": "O Allah, You are my Lord; there is no deity except You. You created me and I am Your servant, upholding Your covenant as best I can. I seek refuge from the evil I have done, acknowledge Your favor and my sin, so forgive me, for none forgives sins except You.",
    "source": "صحيح البخاري",
    "sourceEn": "Sahih al-Bukhari"
  },
  {
    "id": "rq_sunnah_122",
    "type": "sunnah",
    "title": "الباقيات الصالحات حصن للقلب من الوساوس والأحزان",
    "titleEn": "Enduring Good Words That Guard the Heart",
    "text": "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ.",
    "textEn": "Glory be to Allah, all praise belongs to Allah, there is no deity except Allah, Allah is Most Great, and there is no power nor might except through Allah.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_123",
    "type": "sunnah",
    "title": "التسبيح المضاعف لتفريج الكرب وشرح الصدر",
    "titleEn": "Multiplied Glorification for Peace of Heart",
    "text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ (ثلاث مرات صباحاً).",
    "textEn": "Exalted is Allah and praise be to Him, by the number of His creation, His own pleasure, the weight of His Throne, and the ink of His words.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_124",
    "type": "sunnah",
    "title": "دعاء الحرز عند سماع الرعد والصواعق",
    "titleEn": "Remembrance for Safety During Thunder & Storms",
    "text": "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ.",
    "textEn": "Exalted is He whom the thunder glorifies with His praise and the angels in awe of Him.",
    "source": "الموطأ للإمام مالك",
    "sourceEn": "Al-Muwatta (Imam Malik)"
  },
  {
    "id": "rq_sunnah_125",
    "type": "sunnah",
    "title": "دعاء دفع أذى الريح العاتية وطلب خيرها",
    "titleEn": "Seeking the Good of Wind & Refuge from Its Harm",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَخَيْرَ مَا فِيهَا، وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا، وَشَرِّ مَا فِيهَا، وَشَرِّ مَا أُرْسِلَتْ بِهِ.",
    "textEn": "O Allah, I ask You for its good, the good within it, and the good it brings; and seek refuge in You from its evil and harm.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_126",
    "type": "sunnah",
    "title": "دعاء النزول بالماء النافع عند المطر والشفاء ببركته",
    "titleEn": "Asking for Beneficial & Healing Rain",
    "text": "اللَّهُمَّ صَيِّبًا نَافِعًا.",
    "textEn": "O Allah, make it a beneficial, wholesome rain.",
    "source": "صحيح البخاري",
    "sourceEn": "Sahih al-Bukhari"
  },
  {
    "id": "rq_sunnah_127",
    "type": "sunnah",
    "title": "دعاء استقبال الهلال بالأمن والإيمان والسلامة",
    "titleEn": "Welcoming the New Month in Safety & Faith",
    "text": "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ.",
    "textEn": "O Allah, let this crescent appear over us with blessing, faith, safety, and Islam; my Lord and your Lord is Allah.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_128",
    "type": "sunnah",
    "title": "دعاء الشفاء من وجع الرأس والحمى وأمراض الجسد",
    "titleEn": "Seeking Relief from Bodily Pain & Illness",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا أَجِدُ فِي نَفْسِي وَفِي جَسَدِي، اللهم اشفني بشفائك وداوني بدوائك وعافني من بلائك.",
    "textEn": "O Allah, I seek refuge in You from the harm I feel in my soul and body; heal me with Your cure, treat me with Your remedy, and spare me from Your affliction.",
    "source": "دعاء نبوي ومأثور للشفاء",
    "sourceEn": "Prophetic & Traditional Healing Dua"
  },
  {
    "id": "rq_sunnah_129",
    "type": "sunnah",
    "title": "دعاء كشف الضيق عند دخول الكعبة أو الصلاة في الخلوات",
    "titleEn": "Prayer of Forgiveness & Protection from Punishment",
    "text": "اللَّهُمَّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي وَإِسْرَافِي فِي أَمْرِي، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي، اللَّهُمَّ اغْفِرْ لِي جِدِّي وَهَزْلِي وَخَطَئِي وَعَمْدِي وَكُلُّ ذَلِكَ عِنْدِي.",
    "textEn": "O Allah, forgive my sin, my ignorance, my excess in my affairs, and whatever You know better than I; forgive my earnestness and jesting, my unintentional and intentional mistakes.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_130",
    "type": "sunnah",
    "title": "دعاء حفظ الحواس والأعضاء في الحياة والممات",
    "titleEn": "Preserving Hearing, Sight & Strength Throughout Life",
    "text": "اللَّهُمَّ مَتِّعْنَا بِأَسْمَاعِنَا وَأَبْصَارِنَا وَقُوَّتِنَا مَا أَحْيَيْتَنَا، وَاجْعَلْهُ الْوَارِثَ مِنَّا، وَاجْعَلْ ثَأْرَنَا عَلَى مَنْ ظَلَمَنَا، وَانْصُرْنَا عَلَى مَنْ عَادَانَا.",
    "textEn": "O Allah, grant us enjoyment of our hearing, sight, and strength as long as You keep us alive, preserve them throughout our lives, and aid us against those who oppress or oppose us.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_131",
    "type": "sunnah",
    "title": "دعاء دفع البلاء في الدين وتسلط من لا يرحم",
    "titleEn": "Protection from Trial in Religion & Merciless Rulers",
    "text": "اللَّهُمَّ لَا تَجْعَلْ مُصِيبَتَنَا فِي دِينِنَا، وَلَا تَجْعَلِ الدُّنْيَا أَكْبَرَ هَمِّنَا وَلَا مَبْلَغَ عِلْمِنَا، وَلَا تُسَلِّطْ عَلَيْنَا مَنْ لَا يَرْحَمُنَا.",
    "textEn": "O Allah, do not place our calamity in our religion, do not make this world our greatest worry or limit of knowledge, and do not give power over us to anyone who shows no mercy.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_132",
    "type": "sunnah",
    "title": "دعاء الاستخارة في الأمور المستعصية وطلب صرف السوء",
    "titleEn": "Istikharah Prayer to Avert Evil & Bring Good",
    "text": "اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ.",
    "textEn": "O Allah, if You know this matter is harmful to my religion, livelihood, and final outcome, turn it away from me and turn me from it, ordain good for me wherever it is, and make me pleased with it.",
    "source": "صحيح البخاري",
    "sourceEn": "Sahih al-Bukhari"
  },
  {
    "id": "rq_sunnah_133",
    "type": "sunnah",
    "title": "الاستعاذة بالله من فتنة النساء ووساوس الشهوات",
    "titleEn": "Seeking Purity & Refuge from Temptations",
    "text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَنِيِّي، وَأَعُوذُ بِكَ مِنْ شَرِّ قَلْبِي وَلِسَانِي، اللَّهُمَّ حَصِّنْ فَرْجِي وَطَهِّرْ قَلْبِي.",
    "textEn": "O Allah, I seek refuge in You from the evil of my desires, my heart, and my tongue; O Allah, guard my chastity and purify my heart.",
    "source": "سنن أبي داود ومسند أحمد",
    "sourceEn": "Sunan Abi Dawud & Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_134",
    "type": "sunnah",
    "title": "دعاء حفظ النفس من الهم واليأس بإيمان صادق",
    "titleEn": "Prayer for Unwavering Faith and Eternal Delight",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ إِيمَانًا لَا يَرْتَدُّ، وَنَعِيمًا لَا يَنْفَدُ، وَمُرَافَقَةَ نَبِيِّنَا مُحَمَّدٍ ﷺ فِي أَعْلَى جَنَّةِ الْخُلْدِ.",
    "textEn": "O Allah, I ask You for faith that never wavers, bliss that never fades, and companionship with Prophet Muhammad ﷺ in the highest Garden of Eternity.",
    "source": "مسند أحمد",
    "sourceEn": "Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_135",
    "type": "sunnah",
    "title": "دعاء القنوت الجامع للحفظ والهداية والبركة",
    "titleEn": "Complete Qunut Supplication of Mercy & Protection",
    "text": "اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ، وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ، وَنُثْنِي عَلَيْكَ الْخَيْرَ كُلَّهُ، وَلَا نَكْفُرُكَ، وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ.",
    "textEn": "O Allah, we seek Your help and forgiveness, believe in You, rely upon You, praise You for all good, never deny You, and cast off whoever rebels against You.",
    "source": "سنن البيهقي ومصنف ابن أبي شيبة",
    "sourceEn": "As-Sunan al-Kubra (Al-Bayhaqi)"
  },
  {
    "id": "rq_sunnah_136",
    "type": "sunnah",
    "title": "دعاء الصباح للإيمان والرضا بعد القضاء",
    "titleEn": "Asking Contentment After Decree & Joy After Death",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الرِّضَا بَعْدَ الْقَضَاءِ، وَبَرْدَ الْعَيْشِ بَعْدَ الْمَوْتِ، وَلَذَّةَ النَّظَرِ إِلَى وَجْهِكَ، وَالشَّوْقَ إِلَى لِقَائِكَ فِي غَيْرِ ضَرَّاءَ مُضِرَّةٍ وَلَا فِتْنَةٍ مُضِلَّةٍ.",
    "textEn": "O Allah, I ask You for contentment after Your decree, tranquil life after death, delight of gazing upon Your Face, and longing to meet You without harmful distress or misleading trial.",
    "source": "سنن النسائي",
    "sourceEn": "Sunan An-Nasai"
  },
  {
    "id": "rq_sunnah_137",
    "type": "sunnah",
    "title": "دعاء الخشية في الغيب والشهادة وطلب القصد والاعتدال",
    "titleEn": "Fear of Allah in Unseen & Seen and Moderation",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَشْيَتَكَ فِي الْغَيْبِ وَالشَّهَادَةِ، وَأَسْأَلُكَ كَلِمَةَ الْحَقِّ فِي الرِّضَا وَالْغَضَبِ، وَأَسْأَلُكَ الْقَصْدَ فِي الْفَقْرِ وَالْغِنَى.",
    "textEn": "O Allah, I ask You for awe of You in secret and public, speaking truth in pleasure and anger, and moderation in poverty and wealth.",
    "source": "سنن النسائي",
    "sourceEn": "Sunan An-Nasai"
  },
  {
    "id": "rq_sunnah_138",
    "type": "sunnah",
    "title": "الاستعاذة من سوء الخلق والعمل وطلب أحسن الأخلاق",
    "titleEn": "Guidance to Noble Character & Refuge from Bad Manners",
    "text": "اللَّهُمَّ اهْدِنِي لِأَحْسَنِ الْأَخْلَاقِ لَا يَهْدِي لِأَحْسَنِهَا إِلَّا أَنْتَ، وَاصْرِفْ عَنِّي سَيِّئَهَا لَا يَصْرِفُ عَنِّي سَيِّئَهَا إِلَّا أَنْتَ.",
    "textEn": "O Allah, guide me to the finest character—none guides to it except You—and turn away from me evil character—none turns it away except You.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_139",
    "type": "sunnah",
    "title": "دعاء طلب التزكية والتقوى للنفس من وساوس السوء",
    "titleEn": "Asking Piety and Purification for the Soul",
    "text": "اللَّهُمَّ آتِ نَفْسِي تَقْوَاهَا، وَزَكِّهَا أَنْتَ خَيْرُ مَنْ زَكَّاهَا، أَنْتَ وَلِيُّهَا وَمَوْلَاهَا.",
    "textEn": "O Allah, grant my soul its piety and purify it; You are the Best to purify it, and You are its Guardian and Master.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_140",
    "type": "sunnah",
    "title": "دعاء الإلهام بالرشد والوقاية من شر النفس",
    "titleEn": "Asking Inspired Guidance & Protection from Self-Harm",
    "text": "اللَّهُمَّ أَلْهِمْنِي رُشْدِي، وَأَعِذْنِي مِنْ شَرِّ نَفْسِي.",
    "textEn": "O Allah, inspire me with right guidance and protect me from the evil of my own soul.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_141",
    "type": "sunnah",
    "title": "دعاء تحصين المنزل وأهله بالقرآن وسورة البقرة",
    "titleEn": "Prophetic Sunnah on Protecting Homes with Surah Al-Baqarah",
    "text": "لَا تَجْعَلُوا بُيُوتَكُمْ مَقَابِرَ، إِنَّ الشَّيْطَانَ يَنْفِرُ مِنَ الْبَيْتِ الَّذِي تُقْرَأُ فِيهِ سُورَةُ الْبَقَرَةِ.",
    "textEn": "Do not turn your homes into graves; indeed Satan flees from the house in which Surah Al-Baqarah is recited.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_142",
    "type": "sunnah",
    "title": "فضل قراءة الآيتين من آخر سورة البقرة للحفظ والكفاية بالليل",
    "titleEn": "Sufficiency of the Last Two Verses of Al-Baqarah at Night",
    "text": "مَنْ قَرَأَ بِالْآيَتَيْنِ مِنْ آخِرِ سُورَةِ الْبَقَرَةِ فِي لَيْلَةٍ كَفَتَاهُ.",
    "textEn": "Whoever recites the last two verses of Surah Al-Baqarah during the night, they will suffice him against all harm.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_143",
    "type": "sunnah",
    "title": "فضل آية الكرسي عند النوم لحراسة الملائكة وطرد الشيطان",
    "titleEn": "Guardian Angel Protection Through Ayat Al-Kursi at Sleep",
    "text": "إِذَا أَوَيْتَ إِلَى فِرَاشِكَ فَاقْرَأْ آيَةَ الْكُرْسِيِّ، لَنْ يَزَالَ عَلَيْكَ مِنَ اللَّهِ حَافِظٌ وَلَا يَقْرَبَكَ شَيْطَانٌ حَتَّى تُصْبِحَ.",
    "textEn": "When you lie down in bed, recite Ayat Al-Kursi; a guardian from Allah will remain over you and no devil will come near you until morning.",
    "source": "صحيح البخاري",
    "sourceEn": "Sahih al-Bukhari"
  },
  {
    "id": "rq_sunnah_144",
    "type": "sunnah",
    "title": "سنة التسمية عند الأكل والشرب وإغلاق الأبواب لدفع الشياطين",
    "titleEn": "Mentioning Allahs Name Over Food, Drink & Doors at Dusk",
    "text": "غَطُّوا الْإِنَاءَ، وَأَوْكُوا السِّقَاءَ، وَأَغْلِقُوا الْبَابَ، وَاذْكُرُوا اسْمَ اللَّهِ؛ فَإِنَّ الشَّيْطَانَ لَا يَفْتَحُ بَابًا مُغْلَقًا وَلَا يَكْشِفُ إِنَاءً.",
    "textEn": "Cover vessels, tie waterskins, close doors, and mention Allahs Name, for Satan cannot open a shut door or uncover a covered vessel.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_145",
    "type": "sunnah",
    "title": "تحصين الصبيان عند إقبال الليل ووقت العشاء",
    "titleEn": "Protecting Children at Nightfall",
    "text": "إِذَا كَانَ جُنْحُ اللَّيْلِ فَكُفُّوا صِبْيَانَكُمْ، فَإِنَّ الشَّيَاطِينَ تَنْتَشِرُ حِينَئِذٍ.",
    "textEn": "When the darkness of night approaches, keep your children indoors, for devils spread out at that hour.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_146",
    "type": "sunnah",
    "title": "الاستعاذة بالله في الأذكار الثلاثة بعد الفجر والمغرب",
    "titleEn": "Threefold Protection from Hellfire After Fajr & Maghrib",
    "text": "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ (سبع مرات بعد صلاتي الفجر والمغرب).",
    "textEn": "O Allah, protect me from the Hellfire (recited seven times after Fajr and Maghrib prayers).",
    "source": "سنن أبي داود",
    "sourceEn": "Sunan Abi Dawud"
  },
  {
    "id": "rq_sunnah_147",
    "type": "sunnah",
    "title": "التسبيح والتحميد والتكبير قبل النوم قوة وعافية للجسد",
    "titleEn": "Fatimahs Tasbih Before Sleep for Bodily Strength",
    "text": "سُبْحَانَ اللَّهِ (٣٣) وَالْحَمْدُ لِلَّهِ (٣٣) وَاللَّهُ أَكْبَرُ (٣٤) عِنْدَ أَخْذِ الْمَضْجَعِ (خير من خادم وقوة في البدن).",
    "textEn": "SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times before sleep—better than a helper and a source of physical strength.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_148",
    "type": "sunnah",
    "title": "دعاء الاستيقاظ من النوم وحمد الله على رد الروح والعافية",
    "titleEn": "Praise Upon Waking with Health and Returned Soul",
    "text": "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.",
    "textEn": "Praise be to Allah who restored health to my body, returned my soul to me, and permitted me to remember Him.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_149",
    "type": "sunnah",
    "title": "دعاء الاستغفار الشامل وتبديل السيئات عافية",
    "titleEn": "Comprehensive Repentance Prayer at the Start & End of Worship",
    "text": "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ.",
    "textEn": "O Allah, forgive all my sins—small and great, first and last, open and secret.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_150",
    "type": "sunnah",
    "title": "دعاء النور والتنوير الإلهي عند دخول الفجر وصلاة الليل",
    "titleEn": "Seeking Light, Mercy & Expansion at Prayer",
    "text": "اللَّهُمَّ اغْسِلْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّ قَلْبِي مِنَ الْخَطَايَا كَمَا نَقَّيْتَ الثَّوْبَ الْأَبْيَضَ مِنَ الدَّنَسِ.",
    "textEn": "O Allah, wash away my sins with water, snow, and hail, and purify my heart from sins just as a white garment is purified from stain.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_151",
    "type": "sunnah",
    "title": "دعاء طلب التيسير في كل عسير وصرف الكرب",
    "titleEn": "Nothing Is Easy Except What Allah Makes Easy",
    "text": "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا.",
    "textEn": "O Allah, nothing is easy except what You make easy, and You turn grief and rugged hardship into ease whenever You will.",
    "source": "صحيح ابن حبان",
    "sourceEn": "Sahih Ibn Hibban"
  },
  {
    "id": "rq_sunnah_152",
    "type": "sunnah",
    "title": "دعاء سؤال الخير العاجل والآجل والاستعاذة من كل شر",
    "titleEn": "Jawami ad-Dua: Asking All Good & Refuge from All Evil",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ، وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ عَاجِلِهِ وَآجِلِهِ مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ.",
    "textEn": "O Allah, I ask You for all good, immediate and future, what I know and do not know; and seek refuge in You from all evil, immediate and future, what I know and do not know.",
    "source": "سنن ابن ماجه ومسند أحمد",
    "sourceEn": "Sunan Ibn Majah & Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_153",
    "type": "sunnah",
    "title": "دعاء سؤال ما سأل النبي ﷺ والاستعاذة مما استعاذ منه",
    "titleEn": "Asking Every Good the Prophet ﷺ Asked For",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ خَيْرِ مَا سَأَلَكَ مِنْهُ عَبْدُكَ وَنَبِيُّكَ مُحَمَّدٌ ﷺ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا عَاذَ مِنْهُ عَبْدُكَ وَنَبِيُّكَ مُحَمَّدٌ ﷺ.",
    "textEn": "O Allah, I ask You for the good that Your servant and Prophet Muhammad ﷺ asked You for, and seek refuge in You from the evil from which he sought refuge.",
    "source": "جامع الترمذي وابن ماجه",
    "sourceEn": "Jami At-Tirmidhi & Ibn Majah"
  },
  {
    "id": "rq_sunnah_154",
    "type": "sunnah",
    "title": "دعاء الخشية والتثبيت والسلامة من السقوط عند البلاء",
    "titleEn": "Portion of Reverence, Obedience & Certainty in Trials",
    "text": "اللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَا يَحُولُ بَيْنَنَا وَبَيْنَ مَعَاصِيكَ، وَمِنْ طَاعَتِكَ مَا تُبَلِّغُنَا بِهِ جَنَّتَكَ، وَمِنَ الْيَقِينِ مَا تُهَوِّنُ بِهِ عَلَيْنَا مُصِيبَاتِ الدُّنْيَا.",
    "textEn": "O Allah, grant us enough awe of You to keep us from disobeying You, obedience that brings us to Paradise, and certainty that lightens worldly calamities.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_155",
    "type": "sunnah",
    "title": "دعاء النجاة من الشيطان والرجوع بالتوبة في كل مجلس",
    "titleEn": "Seeking Forgiveness 100 Times for Inner Peace",
    "text": "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ (مائة مرة في المجلس الواحد).",
    "textEn": "My Lord, forgive me and accept my repentance; surely You are the Acceptor of repentance, Most Merciful.",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_156",
    "type": "sunnah",
    "title": "دعاء طلب الرحمة الجامعة لهداية القلب ولم الشعث",
    "titleEn": "Asking Mercy That Guides the Heart & Unites Affairs",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ رَحْمَةً مِنْ عِنْدِكَ تَهْدِي بِهَا قَلْبِي، وَتَجْمَعُ بِهَا أَمْرِي، وَتَلُمُّ بِهَا شَعَثِي، وَتُصْلِحُ بِهَا غَائِبِي، وَتَرْفَعُ بِهَا شَاهِدِي.",
    "textEn": "O Allah, I ask You for mercy from Yourself by which You guide my heart, gather my affairs, mend my brokenness, set right what is absent from me, and elevate my outward state.",
    "source": "جامع الترمذي",
    "sourceEn": "Jami At-Tirmidhi"
  },
  {
    "id": "rq_sunnah_157",
    "type": "sunnah",
    "title": "دعاء الحفظ في البصر والعمل ودفع الفتن الظاهرة والباطنة",
    "titleEn": "Asking Pardon & Safety in Religion, Family & Wealth",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ.",
    "textEn": "O Allah, I ask You for pardon and well-being in my religion, worldly life, family, and wealth; O Allah, settle our debts and enrich us from poverty.",
    "source": "سنن أبي داود ومسلم",
    "sourceEn": "Sunan Abi Dawud & Muslim"
  },
  {
    "id": "rq_sunnah_158",
    "type": "sunnah",
    "title": "دعاء التطهير من الذنوب والأسقام المعنوية بالماء والثلج والبرد",
    "titleEn": "Asking Purification from Sins & Spiritual Harm Like Snow and Hail",
    "text": "اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ.",
    "textEn": "O Allah, distance me from my sins as You have distanced the east from the west; cleanse me of faults as a white garment is purified from stains, and wash away my sins with water, snow, and hail.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_159",
    "type": "sunnah",
    "title": "دعاء التبرؤ من الحول والقوة والاستسلام لعزة الله",
    "titleEn": "Renouncing Self-Power & Relying on Allahs Might",
    "text": "اللَّهُمَّ لَكَ أَسْلَمْتُ، وَبِكَ آمَنْتُ، وَعَلَيْكَ تَوَكَّلْتُ، وَإِلَيْكَ أَنَبْتُ، وَبِكَ خَاصَمْتُ، اللهم إني أعوذ بعزتك لا إله إلا أنت أن تضلني.",
    "textEn": "O Allah, to You I have submitted, in You I believe, upon You I rely, to You I turn in repentance, and by You I contend; I seek refuge in Your might—none is worthy of worship except You—lest You leave me to stray.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_160",
    "type": "sunnah",
    "title": "دعاء التحصن بالإيمان بعد التسليم من الصلاة",
    "titleEn": "Post-Prayer Fortress of Praise & Refuge",
    "text": "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.",
    "textEn": "O Allah, You are Peace and from You comes all peace; blessed are You, O Possessor of Majesty and Honor.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_161",
    "type": "sunnah",
    "title": "دعاء منع كيد الشياطين والحسد بذكر لا مانع لما أعطى الله",
    "titleEn": "None Can Withhold What Allah Bestows",
    "text": "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.",
    "textEn": "There is no deity except Allah alone without partner; His is dominion and praise, and He has power over all things. O Allah, none can withhold what You give, none can give what You withhold, and worldly fortune avails none against You.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_162",
    "type": "sunnah",
    "title": "دعاء العجب والانشراح من غير حسد عند رؤية الخير",
    "titleEn": "Blessing Someone Whose Blessing You Admire",
    "text": "بَارَكَ اللَّهُ لَكَ فِي أَهْلِكَ وَمَالِكَ، مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ.",
    "textEn": "May Allah bless you in your family and wealth; whatever Allah wills occurs, and there is no power except through Allah.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_163",
    "type": "sunnah",
    "title": "دعاء المغفرة الجامعة والالتجاء إلى الله المقدم والمؤخر",
    "titleEn": "Comprehensive Plea for Forgiveness to the Advancer and Delayer",
    "text": "اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ، وَمَا أَسْرَفْتُ، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي، أَنْتَ الْمُقَدِّمُ وَأَنْتَ الْمُؤَخِّرُ، لَا إِلَهَ إِلَّا أَنْتَ.",
    "textEn": "O Allah, forgive my past and future errors, what I concealed and revealed, my excesses, and what You know better than I; You alone advance and defer, and there is no deity except You.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_164",
    "type": "sunnah",
    "title": "دعاء فك الكرب والهم الشديد: يا فارج الهم وكاشف الغم",
    "titleEn": "Remover of Anxiety & Answerer of the Desperate",
    "text": "اللَّهُمَّ فَارِجَ الْهَمِّ، كَاشِفَ الْغَمِّ، مُجِيبَ دَعْوَةِ الْمُضْطَرِّينَ، رَحْمَنَ الدُّنْيَا وَالْآخِرَةِ وَرَحِيمَهُمَا، أَنْتَ تَرْحَمُنِي فَارْحَمْنِي بِرَحْمَةٍ تُغْنِينِي بِهَا عَنْ رَحْمَةِ مَنْ سِوَاكَ.",
    "textEn": "O Allah, Reliever of worry, Remover of grief, Answerer of the desperate, Most Merciful in this world and the Hereafter: grant me mercy that frees me from needing anyone elses mercy.",
    "source": "المستدرك للحاكم",
    "sourceEn": "Al-Mustadrak (Al-Hakim)"
  },
  {
    "id": "rq_sunnah_165",
    "type": "sunnah",
    "title": "التعوذ بالله من جوار الشياطين عند رؤية الكابوس والفزع",
    "titleEn": "Sunnah Upon Seeing a Disturbing Dream",
    "text": "إِذَا رَأَى أَحَدُكُمْ رُؤْيَا يَكْرَهُهَا فَلْيَبْصُقْ عَنْ يَسَارِهِ ثَلَاثًا، وَلْيَسْتَعِذْ بِاللَّهِ مِنَ الشَّيْطَانِ ثَلَاثًا، وَلْيَتَحَوَّلْ عَنْ جَنْبِهِ الَّذِي كَانَ عَلَيْهِ.",
    "textEn": "When one of you sees a dream he dislikes, let him blow lightly three times to his left, seek refuge in Allah from Satan three times, and turn over onto his other side.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_166",
    "type": "sunnah",
    "title": "دعاء النهيق والنباح ليلاً للاستعاذة من رؤية الشياطين",
    "titleEn": "Seeking Refuge When Hearing Dogs Bark or Donkeys Bray at Night",
    "text": "إِذَا سَمِعْتُمْ نُبَاحَ الْكِلَابِ وَنَهِيقَ الْحُمُرِ بِاللَّيْلِ فَتَعَوَّذُوا بِاللَّهِ مِنْهُنَّ؛ فَإِنَّهُنَّ يَرَيْنَ مَا لَا تَرَوْنَ.",
    "textEn": "When you hear dogs barking or donkeys braying at night, seek refuge in Allah from Satan, for they see what you do not see.",
    "source": "سنن أبي داود ومسند أحمد",
    "sourceEn": "Sunan Abi Dawud & Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_167",
    "type": "sunnah",
    "title": "دعاء حفظ الغضب وطرد مس الشيطان عند الانفعال",
    "titleEn": "Seeking Refuge from Anger-Inciting Satan",
    "text": "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ (يُقال عند ثوران الغضب ليذهب عنه ما يجد).",
    "textEn": "I seek refuge in Allah from the accursed Satan—said upon feeling anger so Allah removes its agitation.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_168",
    "type": "sunnah",
    "title": "دعاء طهارة اللسان وحفظ الجوارح من شر الخلق",
    "titleEn": "Asking a Sound Heart and Truthful Tongue",
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ قَلْبًا سَلِيمًا، وَلِسَانًا صَادِقًا، وَأَسْأَلُكَ مِنْ خَيْرِ مَا تَعْلَمُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا تَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا تَعْلَمُ.",
    "textEn": "O Allah, I ask You for a pure heart and a truthful tongue; I ask You for the good You know, seek refuge in You from the evil You know, and seek Your forgiveness for what You know.",
    "source": "جامع الترمذي والنسائي",
    "sourceEn": "Jami At-Tirmidhi & An-Nasai"
  },
  {
    "id": "rq_sunnah_169",
    "type": "sunnah",
    "title": "دعاء العودة من السفر بطهارة القلب والتوبة والحمد",
    "titleEn": "Returning Safely in Repentance and Worship",
    "text": "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ.",
    "textEn": "Returning safely, turning in repentance, worshipping, and praising our Lord.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_170",
    "type": "sunnah",
    "title": "دعاء دخول السوق والأماكن المزدحمة حفظاً من الغفلة والشياطين",
    "titleEn": "Remembrance Upon Entering Busy Marketplaces",
    "text": "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    "textEn": "There is no deity except Allah alone without partner; His is dominion and praise; He gives life and death while He is Ever-Living and never dies; in His hand is all good, and He is capable over all things.",
    "source": "جامع الترمذي وابن ماجه",
    "sourceEn": "Jami At-Tirmidhi & Ibn Majah"
  },
  {
    "id": "rq_sunnah_171",
    "type": "sunnah",
    "title": "دعاء التبرؤ من السحر والكهانة والتمائم وتجديد التوحيد",
    "titleEn": "Renouncing Amulets, Sorcery & Charms for Pure Ruqyah",
    "text": "اعْرِضُوا عَلَيَّ رُقَاكُمْ، لَا بَأْسَ بِالرُّقَى مَا لَمْ يَكُنْ فِيهِ شِرْكٌ.",
    "textEn": "Present your Ruqyah to me; there is no harm in Ruqyah so long as it contains no polytheism.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_172",
    "type": "sunnah",
    "title": "الهدي النبوي في التداوي الحلال وطلب الشفاء من خالق الداء",
    "titleEn": "Prophetic Principle That Allah Sent a Cure for Every Illness",
    "text": "لِكُلِّ دَاءٍ دَوَاءٌ، فَإِذَا أُصِيبَ دَوَاءُ الدَّاءِ بَرَأَ بِإِذْنِ اللَّهِ عَزَّ وَجَلَّ.",
    "textEn": "For every illness there is a cure; when the proper remedy meets the illness, healing occurs by the permission of Allah Almighty.",
    "source": "صحيح مسلم",
    "sourceEn": "Sahih Muslim"
  },
  {
    "id": "rq_sunnah_173",
    "type": "sunnah",
    "title": "دعاء طلب الشفاء بالقرآن والعسل والرقية الجامعة",
    "titleEn": "Seeking Cure Through the Quran and Pure Honey",
    "text": "عَلَيْكُمْ بِالشِّفَاءَيْنِ: الْعَسَلِ وَالْقُرْآنِ.",
    "textEn": "Hold fast to the two sources of healing: pure honey and the Noble Quran.",
    "source": "سنن ابن ماجه والمستدرك",
    "sourceEn": "Sunan Ibn Majah & Al-Mustadrak"
  },
  {
    "id": "rq_sunnah_174",
    "type": "sunnah",
    "title": "سنة الحبة السوداء شفاءً من كل داء بإذن الله",
    "titleEn": "Healing Blessing of Black Seed by Allahs Leave",
    "text": "إِنَّ فِي الْحَبَّةِ السَّوْدَاءِ شِفَاءً مِنْ كُلِّ دَاءٍ إِلَّا السَّامَ (الموت).",
    "textEn": "Indeed, in the black seed there is healing for every ailment except death.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_175",
    "type": "sunnah",
    "title": "سنة التصبح بسبع تمرات عجوة للحفظ من السم والسحر",
    "titleEn": "Morning Protection Against Poison and Sorcery",
    "text": "مَنْ تَصَبَّحَ كُلَّ يَوْمٍ سَبْعَ تَمَرَاتٍ عَجْوَةً لَمْ يَضُرَّهُ فِي ذَلِكَ الْيَوْمِ سُمٌّ وَلَا سِحْرٌ.",
    "textEn": "Whoever eats seven Ajwah dates in the morning will not be harmed that day by poison or magic.",
    "source": "صحيح البخاري ومسلم",
    "sourceEn": "Sahih al-Bukhari & Muslim"
  },
  {
    "id": "rq_sunnah_176",
    "type": "sunnah",
    "title": "دعاء طلب البركة والشفاء في ماء زمزم المبارك",
    "titleEn": "Zamzam Water for Whatever Purpose It Is Drunk",
    "text": "مَاءُ زَمْزَمَ لِمَا شُرِبَ لَهُ، اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ.",
    "textEn": "Zamzam water fulfills the intention for which it is drunk. O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every illness.",
    "source": "سنن ابن ماجه ومسند أحمد",
    "sourceEn": "Sunan Ibn Majah & Musnad Ahmad"
  },
  {
    "id": "rq_sunnah_177",
    "type": "sunnah",
    "title": "سنة الدهان والادام بزيت الزيتون المبارك مع الرقية",
    "titleEn": "Prophetic Guidance on Using Olive Oil from a Blessed Tree",
    "text": "كُلُوا الزَّيْتَ وَادَّهِنُوا بِهِ؛ فَإِنَّهُ مِنْ شَجَرَةٍ مُبَارَكَةٍ.",
    "textEn": "Eat olive oil and anoint yourselves with it, for it comes from a blessed tree.",
    "source": "جامع الترمذي وابن ماجه",
    "sourceEn": "Jami At-Tirmidhi & Ibn Majah"
  },
  {
    "id": "rq_sunnah_178",
    "type": "sunnah",
    "title": "دعاء طرد الهم والحزن وتفريج الكرب بالثقة في موعود الله",
    "titleEn": "Seeking Relief, Comfort & Safety from Every Anxiety",
    "text": "رَبِّ تَقَبَّلْ تَوْبَتِي، وَاغْسِلْ حَوْبَتِي، وَأَجِبْ دَعْوَتِي، وَثَبِّتْ حُجَّتِي، وَاهْدِ قَلْبِي، وَسَدِّدْ لِسَانِي، وَاسْلُلْ سَخِيمَةَ صَدْرِي.",
    "textEn": "My Lord, accept my repentance, wash away my sin, answer my prayer, confirm my proof, guide my heart, direct my tongue, and draw out all malice from my chest.",
    "source": "سنن أبي داود والترمذي",
    "sourceEn": "Sunan Abi Dawud & Al-Tirmidhi"
  },
  {
    "id": "rq_sunnah_179",
    "type": "sunnah",
    "title": "دعاء النجاة من شرور الفتن والوقاية بالإسلام حياً وميتاً",
    "titleEn": "Guarded by Islam Standing, Sitting & Sleeping",
    "text": "اللَّهُمَّ احْفَظْنِي بِالْإِسْلَامِ قَائِمًا، وَاحْفَظْنِي بِالْإِسْلَامِ قَاعِدًا، وَاحْفَظْنِي بِالْإِسْلَامِ رَاقِدًا، وَلَا تُشْمِتْ بِي عَدُوًّا وَلَا حَاسِدًا.",
    "textEn": "O Allah, protect me through Islam while standing, sitting, and lying down, and do not allow any enemy or envier to gloat over me.",
    "source": "المستدرك للحاكم",
    "sourceEn": "Al-Mustadrak (Al-Hakim)"
  },
  {
    "id": "rq_sunnah_180",
    "type": "sunnah",
    "title": "الختام بالحمد والصلاة على النبي ﷺ وطلب تمام الشفاء",
    "titleEn": "Closing Ruqyah with Praise, Salawat & Complete Recovery",
    "text": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ، وَاشْفِ مَرْضَانَا وَمَرْضَى الْمُسْلِمِينَ شِفَاءً لَا يُغَادِرُ سَقَمًا.",
    "textEn": "Praise belongs to Allah, Lord of all worlds; O Allah, send peace and blessings upon Prophet Muhammad, his family, and companions, and grant our sick and all sick Muslims complete healing leaving no trace of illness.",
    "source": "ختام الرقية الشرعية المأثور",
    "sourceEn": "Traditional Closing of Ruqyah"
  }
];
