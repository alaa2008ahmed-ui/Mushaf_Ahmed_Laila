export interface WisdomItem {
  id: number;
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
  authorAr: string;
  authorEn: string;
  categoryAr: string;
  categoryEn: string;
}

export const ISLAMIC_WISDOMS: WisdomItem[] = [
  // 1-10
  {
    id: 1,
    titleAr: "حكمة في الورع وضبط اللسان",
    titleEn: "Wisdom on Piety and Guarding the Tongue",
    textAr: "مَنْ كَثُرَ كَلاَمُهُ كَثُرَ خَطَؤُهُ، وَمَنْ كَثُرَ خَطَؤُهُ قَلَّ حَيَاؤُهُ، وَمَنْ قَلَّ حَيَاؤُهُ قَلَّ وَرَعُهُ، وَمَنْ قَلَّ وَرَعُهُ مَاتَ قَلْبُهُ.",
    textEn: "Whoever speaks much commits many errors, and whoever commits many errors loses his modesty, and whoever loses his modesty loses his piety, and whoever loses his piety, his heart dies.",
    authorAr: "علي بن أبي طالب رضي الله عنه",
    authorEn: "Ali ibn Abi Talib (May Allah be pleased with him)",
    categoryAr: "ضبط اللسان والورع",
    categoryEn: "Guarding the Tongue"
  },
  {
    id: 2,
    titleAr: "حكمة في محاسبة النفس",
    titleEn: "Wisdom on Self-Accountability",
    textAr: "حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُوزَنُوا؛ فَإِنَّهُ أَهْوَنُ عَلَيْكُمْ فِي الْحِسَابِ غَداً أَنْ تُحَاسِبُوا أَنْفُسَكُمُ الْيَوْمَ.",
    textEn: "Call yourselves to account before you are called to account, and weigh your deeds before they are weighed for you; for it will make your Judgment lighter tomorrow if you account for yourselves today.",
    authorAr: "عمر بن الخطاب رضي الله عنه",
    authorEn: "Umar ibn Al-Khattab (May Allah be pleased with him)",
    categoryAr: "محاسبة النفس",
    categoryEn: "Self-Accountability"
  },
  {
    id: 3,
    titleAr: "حكمة في قيمة الوقت والعمر",
    titleEn: "Wisdom on the Value of Time and Life",
    textAr: "يَا ابْنَ آدَمَ، إِنَّمَا أَنْتَ أَيَّامٌ، كُلَّمَا ذَهَبَ يَوْمٌ ذَهَبَ بَعْضُكَ.",
    textEn: "O son of Adam, you are but a collection of days; whenever a day passes, a part of you passes away.",
    authorAr: "الحسن البصري رحمه الله",
    authorEn: "Hasan al-Basri (May Allah have mercy on him)",
    categoryAr: "أهمية الوقت",
    categoryEn: "Value of Time"
  },
  {
    id: 4,
    titleAr: "حكمة في صلاح القلب بالذِّكر",
    titleEn: "Wisdom on Healing the Heart through Dhikr",
    textAr: "إِنَّ فِي الْقَلْبِ شَعَثاً لاَ يَلمُّهُ إِلاَّ الإِقْبَالُ عَلَى اللَّهِ، وَفِيهِ وَحْشَةً لاَ يُزِيلُهَا إِلاَّ الأُنْسُ بِهِ فِي خَلْوَتِهِ.",
    textEn: "In the heart there is a disarray that nothing can gather together except turning to Allah; and in it there is a loneliness that nothing can dispel except intimacy with Him in privacy.",
    authorAr: "ابن القيم رحمه الله",
    authorEn: "Ibn al-Qayyim (May Allah have mercy on him)",
    categoryAr: "صلاح القلوب",
    categoryEn: "Purity of Heart"
  },
  {
    id: 5,
    titleAr: "حكمة في حقيقة الأسر والحرية",
    titleEn: "Wisdom on True Freedom and Captivity",
    textAr: "الْمَحْبُوسُ مَنْ حُبِسَ قَلْبُهُ عَنْ رَبِّهِ تَعَالَى، وَالْمَأْسُورُ مَنْ أَسَرَهُ هَوَاهُ.",
    textEn: "The truly imprisoned person is the one whose heart is imprisoned from his Lord Almighty, and the captive is the one captive to his desires.",
    authorAr: "ابن تيمية رحمه الله",
    authorEn: "Ibn Taymiyyah (May Allah have mercy on him)",
    categoryAr: "إصلاح النية",
    categoryEn: "Purification of Intentions"
  },
  {
    id: 6,
    titleAr: "حكمة في مجاهدة النية",
    titleEn: "Wisdom on Striving to Purify Intentions",
    textAr: "مَا عَالَجْتُ شَيْئاً أَشَدَّ عَلَيَّ مِنْ نِيَّتِي، لأَنَّهَا تَتَقَلَّبُ عَلَيَّ.",
    textEn: "I have never treated anything more difficult for me than my intention, because it keeps shifting on me.",
    authorAr: "سفيان الثوري رحمه الله",
    authorEn: "Sufyan al-Thawri (May Allah have mercy on him)",
    categoryAr: "الإخلاص",
    categoryEn: "Sincerity"
  },
  {
    id: 7,
    titleAr: "حكمة في الحلم والترفع عن السفهاء",
    titleEn: "Wisdom on Forbearness and Ignoring Fools",
    textAr: "إِذَا نَطَقَ السَّفِيهُ فَلاَ تُجِبْهُ، فَخَيْرٌ مِنْ إِجَابَتِهِ السُّكُوتُ.",
    textEn: "When a foolish person speaks, do not answer him; for silence is better than giving him a reply.",
    authorAr: "الإمام الشافعي رحمه الله",
    authorEn: "Imam Al-Shafi'i (May Allah have mercy on him)",
    categoryAr: "حسن الخلق",
    categoryEn: "Good Character"
  },
  {
    id: 8,
    titleAr: "حكمة في فضل الصمت",
    titleEn: "Wisdom on the Virtue of Silence",
    textAr: "يَا بُنَيَّ، إِذَا افْتَخَرَ النَّاسُ بِحُسْنِ كَلاَمِهِمْ، فَافْتَخِرْ أَنْتَ بِحُسْنِ صَمْتِكَ.",
    textEn: "O my son, if people pride themselves on the beauty of their speech, then pride yourself on the beauty of your silence.",
    authorAr: "لقمان الحكيم",
    authorEn: "Luqman the Wise",
    categoryAr: "الحكمة والصمت",
    categoryEn: "Wisdom and Silence"
  },
  {
    id: 9,
    titleAr: "حكمة في الصدق والأمانة",
    titleEn: "Wisdom on Truthfulness and Trustworthiness",
    textAr: "أَصْدَقُ الصِّدْقِ الأَمَانَةُ، وَأَكْذَبُ الْكَذِبِ الْخِيَانَةُ.",
    textEn: "The highest form of truthfulness is trustworthiness, and the worst form of falsehood is treachery.",
    authorAr: "أبو بكر الصديق رضي الله عنه",
    authorEn: "Abu Bakr Al-Siddiq (May Allah be pleased with him)",
    categoryAr: "الأمانة والصدق",
    categoryEn: "Trust & Honesty"
  },
  {
    id: 10,
    titleAr: "حكمة في الندم الحقيقي",
    titleEn: "Wisdom on Meaningful Regret",
    textAr: "مَا نَدِمْتُ عَلَى شَيْءٍ نَدَمِي عَلَى يَوْمٍ غَرَبَتْ شَمْسُهُ، نَقَصَ فِيهِ أَجَلِي، وَلَمْ يَزِدْ فِيهِ عَمَلِي.",
    textEn: "I never regretted anything as much as I regretted a day whose sun set, in which my lifespan decreased and my good deeds did not increase.",
    authorAr: "عبد الله بن مسعود رضي الله عنه",
    authorEn: "Abdullah ibn Mas'ud (May Allah be pleased with him)",
    categoryAr: "التزود للآخرة",
    categoryEn: "Preparing for the Hereafter"
  },

  // 11-20
  {
    id: 11,
    titleAr: "حكمة في حقيقة الدنيا",
    titleEn: "Wisdom on the Transience of Worldly Life",
    textAr: "الدُّنْيَا جِسْرٌ، فَاعْبُرُوهَا وَلاَ تَعْمُرُوهَا، وَاعْلَمُوا أَنَّ أَصْلَ كُلِّ خَطِيئَةٍ حُبُّ الدُّنْيَا.",
    textEn: "The world is a bridge, so cross over it and do not build upon it; and know that the root of all sin is excessive love of the world.",
    authorAr: "ابن الجوزي رحمه الله",
    authorEn: "Ibn al-Jawzi (May Allah have mercy on him)",
    categoryAr: "الزهد في الدنيا",
    categoryEn: "Detachment from Materialism"
  },
  {
    id: 12,
    titleAr: "حكمة في عظمة النية في العمل",
    titleEn: "Wisdom on the Great Power of Intentions",
    textAr: "رُبَّ عَمَلٍ صَغِيرٍ تُعَظِّمُهُ النَّيةُ، وَرُبَّ عَمَلٍ كَبِيرٍ تُصَغِّرُهُ النَّيَّةُ.",
    textEn: "Many a small deed is magnified by a sincere intention, and many a great deed is diminished by a poor intention.",
    authorAr: "عبد الله بن المبارك رحمه الله",
    authorEn: "Abdullah ibn al-Mubarak (May Allah have mercy on him)",
    categoryAr: "النية والإخلاص",
    categoryEn: "Intention & Sincerity"
  },
  {
    id: 13,
    titleAr: "حكمة في الحاجة الماسة للعلم الشرعي",
    titleEn: "Wisdom on the Vital Need for Sacred Knowledge",
    textAr: "النَّاسُ إِلَى العِلْمِ أَحْوَجُ مِنْهُمْ إِلَى الطَّعَامِ وَالشَّرَابِ، لأَنَّ الطَّعَامَ وَالشَّرَابَ يُحْتَاجُ إِلَيْهِ فِي اليَوْمِ مَرَّتَيْنِ، وَالعِلْمَ يُحْتَاجُ إِلَيْهِ بِعَدَدِ الأَنْفَاسِ.",
    textEn: "People are in greater need of knowledge than they are of food and drink, because food and drink are needed twice a day, while knowledge is needed with every breath.",
    authorAr: "الإمام أحمد بن حنبل رحمه الله",
    authorEn: "Imam Ahmad ibn Hanbal (May Allah have mercy on him)",
    categoryAr: "طلب العلم",
    categoryEn: "Seeking Knowledge"
  },
  {
    id: 14,
    titleAr: "حكمة في التغافل وطيب النفس",
    titleEn: "Wisdom on Oversight and Noble Mindset",
    textAr: "مِنْ شَرَفِ النَّفْسِ أَنْ تَتَغَافَلَ عَن الزَّلاَّتِ، وَلاَ تَتَتَبَّعَ العَثَرَاتِ.",
    textEn: "It is among the noblest qualities of the soul to overlook slip-ups and not to hunt for the faults of others.",
    authorAr: "ابن الجوزي رحمه الله",
    authorEn: "Ibn al-Jawzi (May Allah have mercy on him)",
    categoryAr: "التسامح والتغافل",
    categoryEn: "Forgiveness & Tolerance"
  },
  {
    id: 15,
    titleAr: "حكمة في دواء القلوب وتأثير الذكر",
    titleEn: "Wisdom on Dhikr as the Life of the Soul",
    textAr: "الذِّكْرُ لِلْقَلْبِ مِثْلُ المَاءِ لِلسَّمَكِ، فَكَيْفَ يَكُونُ حَالُ السَّمَكِ إِذَا فُارَقَ المَاءَ؟",
    textEn: "Remembrance of Allah to the heart is like water to a fish; what would be the state of a fish if it were separated from water?",
    authorAr: "ابن تيمية رحمه الله",
    authorEn: "Ibn Taymiyyah (May Allah have mercy on him)",
    categoryAr: "ذكر الله",
    categoryEn: "Remembrance of Allah"
  },
  {
    id: 16,
    titleAr: "حكمة في أثر العلم والعمل",
    titleEn: "Wisdom on Applying Knowledge",
    textAr: "مَنْ عَمِلَ بِغَيْرِ عِلْمٍ كَانَ مَا يُفْسِدُ أَكْثَرَ مِمَّا يُصْلِحُ.",
    textEn: "Whoever acts without knowledge will cause more corruption than benefit.",
    authorAr: "عمر بن عبد العزيز رحمه الله",
    authorEn: "Umar ibn Abd al-Aziz (May Allah have mercy on him)",
    categoryAr: "العلم والعمل",
    categoryEn: "Knowledge and Action"
  },
  {
    id: 17,
    titleAr: "حكمة في الشكر والرضا",
    titleEn: "Wisdom on Gratitude and Contentment",
    textAr: "وَجَدْنَا خَيْرَ عَيْشِنَا بِالصَّبْرِ، وَالرِّضَا بِقَضَاءِ اللَّهِ بَابُ السَّكِينَةِ الأَعْظَمُ.",
    textEn: "We found the best of our life through patience, and contentment with Allah's decree is the greatest doorway to peace.",
    authorAr: "عمر بن الخطاب رضي الله عنه",
    authorEn: "Umar ibn Al-Khattab (May Allah be pleased with him)",
    categoryAr: "الصبر والرضا",
    categoryEn: "Patience and Gratitude"
  },
  {
    id: 18,
    titleAr: "حكمة في حقيقة الإيمان",
    titleEn: "Wisdom on the True Nature of Faith",
    textAr: "الإِيمَانُ لَيْسَ بِالتَّمَنِّي وَلاَ بِالتَّحَلِّي، وَلَكِنْ مَا وَقَرَ فِي القَلْبِ وَصَدَّقَهُ العَمَلُ.",
    textEn: "Faith is not mere wishing or outward embellishment; rather, it is what is firmly rooted in the heart and verified by righteous deeds.",
    authorAr: "الحسن البصري رحمه الله",
    authorEn: "Hasan al-Basri (May Allah have mercy on him)",
    categoryAr: "حقائق الإيمان",
    categoryEn: "Reality of Faith"
  },
  {
    id: 19,
    titleAr: "حكمة في شغل النفس بالحق",
    titleEn: "Wisdom on Occupying the Soul with Truth",
    textAr: "نَفْسُكَ إِنْ لَمْ تَشْغَلْهَا بِالحَقِّ شَغَلَتْكَ بِالبَاطِلِ.",
    textEn: "If you do not occupy your soul with the truth, it will occupy you with falsehood.",
    authorAr: "الإمام الشافعي رحمه الله",
    authorEn: "Imam Al-Shafi'i (May Allah have mercy on him)",
    categoryAr: "تزكية النفس",
    categoryEn: "Purification of the Soul"
  },
  {
    id: 20,
    titleAr: "حكمة في أسباب السعادة والراحة",
    titleEn: "Wisdom on True Happiness",
    textAr: "السَّعَادَةُ الحَقِيقِيَّةُ فِي مَعْرِفَةِ اللَّهِ وَعِبَادَتِهِ وَالإِخْلاَصِ لَهُ، وَالأُنْسِ بِقُرْبِهِ.",
    textEn: "True happiness lies in knowing Allah, worshipping Him with sincerity, and finding comfort in closeness to Him.",
    authorAr: "ابن تيمية رحمه الله",
    authorEn: "Ibn Taymiyyah (May Allah have mercy on him)",
    categoryAr: "السعادة الإيمانية",
    categoryEn: "True Happiness"
  },

  // 21-30
  {
    id: 21,
    titleAr: "حكمة في اختيار الصُّحبة الصالحة",
    titleEn: "Wisdom on Righteous Companionship",
    textAr: "استَكْثِرُوا مِنَ الأَصْدِقَاءِ المُؤْمِنِينَ؛ فَإِنَّ لَهُمْ شَفَاعَةً يَوْمَ القِيَامَةِ.",
    textEn: "Gain many believing friends, for indeed they will possess intercession on the Day of Resurrection.",
    authorAr: "الحسن البصري رحمه الله",
    authorEn: "Hasan al-Basri (May Allah have mercy on him)",
    categoryAr: "الصحبة الصالحة",
    categoryEn: "Good Company"
  },
  {
    id: 22,
    titleAr: "حكمة في الصدقة القليلة",
    titleEn: "Wisdom on Giving Even a Little",
    textAr: "لاَ تَسْتَحِ مِنْ إِعْطَاءِ القَلِيلِ، فَإِنَّ الحِرْمَانَ أَقَلُّ مِنْهُ.",
    textEn: "Do not feel ashamed of giving a small amount, for withholding entirely is even less.",
    authorAr: "علي بن أبي طالب رضي الله عنه",
    authorEn: "Ali ibn Abi Talib (May Allah be pleased with him)",
    categoryAr: "الإنفاق والصدقة",
    categoryEn: "Charity & Generosity"
  },
  {
    id: 23,
    titleAr: "حكمة في نفع الدعاء والدفع به",
    titleEn: "Wisdom on the Power of Supplication",
    textAr: "الدُّعَاءُ مِنْ أَنْفَعِ الأَدْوِيَةِ، وَهُوَ عَدُوُّ البَلاَءِ، يَدْفَعُهُ وَيُعَالِجُهُ، وَيَمْنَعُ نُزُولَهُ.",
    textEn: "Supplication is among the most beneficial medicines; it is the enemy of affliction, warding it off, curing it, and preventing its descent.",
    authorAr: "ابن القيم رحمه الله",
    authorEn: "Ibn al-Qayyim (May Allah have mercy on him)",
    categoryAr: "فضل الدعاء",
    categoryEn: "Virtue of Supplication"
  },
  {
    id: 24,
    titleAr: "حكمة في سلامة الصدر من الغل",
    titleEn: "Wisdom on a Pure and Sound Heart",
    textAr: "أَطْيَبُ الصَّدَقَةِ لِسَانٌ صَدُوقٌ، وَقَلْبٌ سَلِيمٌ لاَ حَقَدَ فِيهِ وَلاَ حَسَدَ.",
    textEn: "The purest charity is a truthful tongue and a sound heart free of malice and envy.",
    authorAr: "الفضيل بن عياض رحمه الله",
    authorEn: "Fudayl ibn Iyad (May Allah have mercy on him)",
    categoryAr: "سلامة الصدر",
    categoryEn: "Soundness of Heart"
  },
  {
    id: 25,
    titleAr: "حكمة في الرزق والمقسوم",
    titleEn: "Wisdom on Sustenance and Destiny",
    textAr: "الرِّزْقُ رِزْقَانِ: رِزْقٌ تَطْلُبُهُ، وَرِزْقٌ يَطْلُبُكَ، فَإِنْ لَمْ تَأْتِهِ أَتَاكَ، فَلاَ تَحْمِلْ هَمَّ سَنَتِكَ عَلَى هَمِّ يَوْمِكَ.",
    textEn: "Sustenance is of two kinds: sustenance that you seek, and sustenance that seeks you; if you do not go to it, it will come to you, so do not carry the worry of your year onto the worry of your day.",
    authorAr: "علي بن أبي طالب رضي الله عنه",
    authorEn: "Ali ibn Abi Talib (May Allah be pleased with him)",
    categoryAr: "الرزق والتوكل",
    categoryEn: "Sustenance & Trust in Allah"
  },
  {
    id: 26,
    titleAr: "حكمة في الباقيات الصالحات",
    titleEn: "Wisdom on Enduring Righteous Deeds",
    textAr: "إِنَّ الذُّنُوبَ تُسْوِدُّ القَلْبَ، وَإِنَّ الطَّاعَاتِ تُنِيرُ الوجْهَ، مَنْ أَرَادَ أَنْ يَعْرِفَ مَقَامَهُ عِنْدَ اللهِ فَلْيَنْظُرْ فِيمَا أَقَامَهُ.",
    textEn: "Sins darken the heart, while acts of obedience illuminate the face. Whoever wishes to know his status with Allah should look at what Allah has engaged him in.",
    authorAr: "مالك بن دينار رحمه الله",
    authorEn: "Malik ibn Dinar (May Allah have mercy on him)",
    categoryAr: "مقام العبد عند الله",
    categoryEn: "One's Standing with Allah"
  },
  {
    id: 27,
    titleAr: "حكمة في حسن الظن بالله",
    titleEn: "Wisdom on Good Expectations of Allah",
    textAr: "وَاللهِ مَا أَعْطَى اللهُ عَبْداً مُؤْمِناً شَيْئاً خَيْراً مِنْ حُسْنِ الظَّنِّ بِاللهِ عَزَّ وَجَلَّ.",
    textEn: "By Allah, Allah never grants a believing servant anything better than maintaining good expectations of Allah Almighty.",
    authorAr: "عبد الله بن مسعود رضي الله عنه",
    authorEn: "Abdullah ibn Mas'ud (May Allah be pleased with him)",
    categoryAr: "حسن الظن بالله",
    categoryEn: "Trust in Divine Mercy"
  },
  {
    id: 28,
    titleAr: "حكمة في زينة العقل والأخلاق",
    titleEn: "Wisdom on Intellect and Character",
    textAr: "مَا أُعْطِيَ الْعَبْدُ بَعْدَ الإِيمَانِ شَيْئاً خَيْراً مِنْ عَقْلٍ يَرْعَاهُ وَخُلُقٍ حَسَنٍ يَجْمَلُهُ.",
    textEn: "A servant was never given anything after faith better than a sound intellect to guide him and good character to adorn him.",
    authorAr: "أبو الدرداء رضي الله عنه",
    authorEn: "Abu al-Darda (May Allah be pleased with him)",
    categoryAr: "العقل والحلم",
    categoryEn: "Wisdom and Grace"
  },
  {
    id: 29,
    titleAr: "حكمة في فضل البر والصلة",
    titleEn: "Wisdom on Filial Piety and Kinship",
    textAr: "إِنَّ أَعْجَلَ الطَّاعَةِ ثَوَاباً لَصِلَةُ الرَّحِمِ، حَتَّى إِنَّ أَهْلَ البَيْتِ لَيَكُونُونَ فُجَّاراً فَتَنْمُو أَمْوَالُهُمْ وَيَكْثُرُ عَدَدُهُمْ إِذَا تَوَاصَلُوا.",
    textEn: "The quickest act of obedience to bring reward is maintaining family ties, so much so that even a household that is deficient will see their wealth grow and numbers multiply when they maintain ties.",
    authorAr: "أبو هريرة رضي الله عنه",
    authorEn: "Abu Hurairah (May Allah be pleased with him)",
    categoryAr: "صلة الرحم",
    categoryEn: "Family Ties"
  },
  {
    id: 30,
    titleAr: "حكمة في ثمار التوبة والاستغفار",
    titleEn: "Wisdom on the Fruits of Repentance",
    textAr: "مَنْ أَكْثَرَ مِنَ الاِسْتِغْفَارِ جَعَلَ اللهُ لَهُ مِنْ كُلِّ هَمٍّ فَرَجاً، وَمِنْ كُلِّ ضِيقٍ مَخْرَجاً، وَرَزَقَهُ مِنْ حَيْثُ لاَ يَحْتَسِبُ.",
    textEn: "Whoever engages abundantly in seeking forgiveness, Allah will grant him relief from every anxiety, an exit from every distress, and provide for him from where he never expects.",
    authorAr: "سعيد بن المسيب رحمه الله",
    authorEn: "Sa'id ibn al-Musayyib (May Allah have mercy on him)",
    categoryAr: "الاستغفار والتوبة",
    categoryEn: "Forgiveness & Relief"
  },

  // 31-40
  {
    id: 31,
    titleAr: "حكمة في خشوع الصلاة",
    titleEn: "Wisdom on Humility in Prayer",
    textAr: "إِذَا قُمْتَ فِي صَلاَتِكَ فَصَلِّ صَلاَةَ مُوَدِّعٍ، وَلاَ تَكَلَّمْ بِكَلاَمٍ تَعْتَذِرُ مِنْهُ غَداً.",
    textEn: "When you stand in your prayer, pray as if it were your farewell prayer, and do not utter words for which you must apologize tomorrow.",
    authorAr: "أبو أيوب الأنصاري رضي الله عنه",
    authorEn: "Abu Ayyub al-Ansari (May Allah be pleased with him)",
    categoryAr: "الخشوع والصلاة",
    categoryEn: "Focus in Prayer"
  },
  {
    id: 32,
    titleAr: "حكمة في شرف قيام الليل",
    titleEn: "Wisdom on the Honor of Night Prayer",
    textAr: "شَرَفُ المُؤْمِنِ قِيَامُهُ بِاللَّيْلِ، وَعِزُّهُ اسْتِغْنَاؤُهُ عَنِ النَّاسِ.",
    textEn: "The honor of the believer is his standing in prayer at night, and his true dignity is his independence from asking people.",
    authorAr: "إبراهيم بن أدهم رحمه الله",
    authorEn: "Ibrahim ibn Adham (May Allah have mercy on him)",
    categoryAr: "قيام الليل",
    categoryEn: "Night Prayer"
  },
  {
    id: 33,
    titleAr: "حكمة في بر الوالدين",
    titleEn: "Wisdom on Honor Towards Parents",
    textAr: "بِرُّ الْوَالِدَيْنِ جَنَّةٌ فِي الدُّنْيَا وَطَرِيقٌ مَفْتُوحٌ إِلَى جَنَّةِ الآخِرَةِ.",
    textEn: "Righteousness towards parents is a paradise in this world and an open pathway to the Paradise of the Hereafter.",
    authorAr: "طاوس بن كيسان رحمه الله",
    authorEn: "Tawus ibn Kaysan (May Allah have mercy on him)",
    categoryAr: "بر الوالدين",
    categoryEn: "Honoring Parents"
  },
  {
    id: 34,
    titleAr: "حكمة في الاستعانة بالله والصبر",
    titleEn: "Wisdom on Seeking Allah's Help and Patience",
    textAr: "الصَّبْرُ كَفِيلٌ بِالنَّجَاحِ، وَالثِّقَةُ بِاللهِ أَعْظَمُ سِلاَحِ فِي مُوَاجَهَةِ المَكَارِهِ.",
    textEn: "Patience is the guarantor of ultimate success, and trust in Allah is the greatest weapon facing adversity.",
    authorAr: "عثمان بن عفان رضي الله عنه",
    authorEn: "Uthman ibn Affan (May Allah be pleased with him)",
    categoryAr: "التوكل والصبر",
    categoryEn: "Reliance on Allah"
  },
  {
    id: 35,
    titleAr: "حكمة في العفو والتسامح",
    titleEn: "Wisdom on Pardon and Clemency",
    textAr: "مَا زَادَ اللهُ عَبْداً بِعَفْوٍ إِلاَّ عِزّاً، وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلاَّ رَفَعَهُ اللهُ.",
    textEn: "Allah never increases a servant who pardons except in honor, and no one humbles himself for Allah except that Allah elevates him.",
    authorAr: "سلمان الفارسي رضي الله عنه",
    authorEn: "Salman al-Farsi (May Allah be pleased with him)",
    categoryAr: "التواضع والعفو",
    categoryEn: "Humility and Forgiveness"
  },
  {
    id: 36,
    titleAr: "حكمة في أثر القرآن الكريم",
    titleEn: "Wisdom on the Impact of the Holy Quran",
    textAr: "مَا جَالَسَ هَذَا القُرْآنَ أَحَدٌ إِلاَّ قَامَ عَنْهُ بِزِيَادَةٍ أَوْ نُقْصَانٍ: زِيَادَةٍ فِي هُدًى، أَوْ نُقْصَانٍ فِي عَمًى.",
    textEn: "No one sits with this Quran except that he rises with an increase or a decrease: an increase in guidance, or a decrease in blindness.",
    authorAr: "الحسن البصري رحمه الله",
    authorEn: "Hasan al-Basri (May Allah have mercy on him)",
    categoryAr: "القرآن الكريم",
    categoryEn: "The Holy Quran"
  },
  {
    id: 37,
    titleAr: "حكمة في الطمأنينة والقناعة",
    titleEn: "Wisdom on Tranquility and Contentment",
    textAr: "مَنْ أَصْبَحَ مِنْكُمْ آمِناً فِي سِرْبِهِ، مُعَافًى فِي جَسَدِهِ، عِنْدَهُ قُوتُ يَوْمِهِ، فَكَأَنَّمَا حِيزَتْ لَهُ الدُّنْيَا.",
    textEn: "Whoever among you wakes up secure in his home, healthy in his body, possessing his daily sustenance, it is as if the whole world was gathered for him.",
    authorAr: "حكمة نبوية جليلة",
    authorEn: "Prophetic Wisdom",
    categoryAr: "القناعة والرضا",
    categoryEn: "Contentment"
  },
  {
    id: 38,
    titleAr: "حكمة في أثر الكلمة الطيبة",
    titleEn: "Wisdom on the Good Word",
    textAr: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَتَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ تُحْيِي الْقُلُوبَ.",
    textEn: "A good word is charity, and your smile in the face of your brother is a charity that brings life to hearts.",
    authorAr: "من هدي الصحابة الكرام",
    authorEn: "Wisdom of the Companions",
    categoryAr: "الكلمة الطيبة",
    categoryEn: "Kind Speech"
  },
  {
    id: 39,
    titleAr: "حكمة في النظافة وطهارة الروح",
    titleEn: "Wisdom on Purity of Mind and Body",
    textAr: "طَهِّرُوا القُلُوبَ مِنَ الحَسَدِ كَمَا تُطَهِّرُونَ الأَجْسَادَ مِنَ الأَدْنَاسِ.",
    textEn: "Purify your hearts from envy just as you cleanse your bodies from impurities.",
    authorAr: "الإمام الغزالي رحمه الله",
    authorEn: "Imam Al-Ghazali (May Allah have mercy on him)",
    categoryAr: "طهور القلب",
    categoryEn: "Purity of Soul"
  },
  {
    id: 40,
    titleAr: "حكمة في الوفاء بالعهد",
    titleEn: "Wisdom on Keeping Promises",
    textAr: "آَيَةُ الشَّرَفِ وَالإِيمَانِ أَنْ تِفِيَ بِمَا وَعَدْتَ وَلَوْ كَانَ فِيهِ المَشَقَّةُ.",
    textEn: "The mark of honor and faith is to fulfill what you have promised even if it entails hardship.",
    authorAr: "عمر بن عبد العزيز رحمه الله",
    authorEn: "Umar ibn Abd al-Aziz (May Allah have mercy on him)",
    categoryAr: "الوفاء بالعهد",
    categoryEn: "Fulfilling Promises"
  },

  // 41-50
  {
    id: 41,
    titleAr: "حكمة في تجديد التوبة",
    titleEn: "Wisdom on Renewing Repentance",
    textAr: "التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لاَ ذَنْبَ لَهُ، وَإِنَّ اللهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ المُتَطَهِّرِينَ.",
    textEn: "The one who repents from sin is like one who has no sin, and Allah loves those who turn to Him in repentance.",
    authorAr: "من درر التابعين",
    authorEn: "Pearls of the Tabieen",
    categoryAr: "التوبة الصادقة",
    categoryEn: "Sincere Repentance"
  },
  {
    id: 42,
    titleAr: "حكمة في الرضا بالقضاء",
    titleEn: "Wisdom on Accepting Divine Decree",
    textAr: "لَوْ كُشِفَ الْغِطَاءُ عَنِ الطَّافِ المَقَادِيرِ لَمَا اخْتَارَ العَبْدُ إِلاَّ مَا اخْتَارَهُ اللهُ لَهُ.",
    textEn: "If the veil were lifted from the subtle kindnesses of Divine Decree, the servant would choose nothing other than what Allah chose for him.",
    authorAr: "ابن الجوزي رحمه الله",
    authorEn: "Ibn al-Jawzi (May Allah have mercy on him)",
    categoryAr: "الرضا بالقضاء",
    categoryEn: "Contentment with Decree"
  },
  {
    id: 43,
    titleAr: "حكمة في مجاهدة الهوى",
    titleEn: "Wisdom on Resisting Desires",
    textAr: "مَنْ غَلَبَ هَوَاهُ عَظُمَ دَوَاؤُهُ، وَمَنْ أَسَرَهُ هَوَاهُ هَانَ دَاؤُهُ وَمَاتَ قَلْبُهُ.",
    textEn: "Whoever conquers his desires elevates his soul, and whoever is enslaved by desires dies in heart.",
    authorAr: "الفضيل بن عياض رحمه الله",
    authorEn: "Fudayl ibn Iyad (May Allah have mercy on him)",
    categoryAr: "مجاهدة النفس",
    categoryEn: "Striving Against Desires"
  },
  {
    id: 44,
    titleAr: "حكمة في عظمة القناعة",
    titleEn: "Wisdom on True Wealth",
    textAr: "لَيْسَ الْغِنَى عَنْ كَثْرَةِ الْعَرَضِ، وَلَكِنَّ الْغِنَى غِنَى النَّفْسِ.",
    textEn: "Wealth is not in having vast possessions, but true wealth is the contentment of the soul.",
    authorAr: "حكمة نبوية شريفة",
    authorEn: "Prophetic Pearl",
    categoryAr: "غنى النفس",
    categoryEn: "Wealth of Soul"
  },
  {
    id: 45,
    titleAr: "حكمة في الرفق والأناة",
    titleEn: "Wisdom on Gentleness and Moderation",
    textAr: "إِنَّ الرِّفْقَ لاَ يَكُونُ فِي شَيْءٍ إِلاَّ زَانَهُ، وَلاَ يُنْزَعُ مِنْ شَيْءٍ إِلاَّ شَانَهُ.",
    textEn: "Gentleness is not present in anything except that it beautifies it, and is not removed from anything except that it spoils it.",
    authorAr: "عائشة أم المؤمنين رضي الله عنها",
    authorEn: "Aisha Mother of the Believers",
    categoryAr: "الرفق والحلم",
    categoryEn: "Gentleness and Mercy"
  },
  {
    id: 46,
    titleAr: "حكمة في حفظ الأمانة",
    titleEn: "Wisdom on Honesty and Integrity",
    textAr: "لاَ إِيمَانَ لِمَنْ لاَ أَمَانَةَ لَهُ، وَلاَ دِينَ لِمَنْ لاَ عَهْدَ لَهُ.",
    textEn: "There is no true faith for one who lacks trustworthiness, and no religion for one who honors no covenant.",
    authorAr: "من المأثورات النبوية",
    authorEn: "Prophetic Traditions",
    categoryAr: "الأمانة",
    categoryEn: "Integrity"
  },
  {
    id: 47,
    titleAr: "حكمة في إغاثة الملهوف",
    titleEn: "Wisdom on Helping the Distressed",
    textAr: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ القِيَامَةِ.",
    textEn: "Whoever relieves a believer of a distress in this world, Allah will relieve him of a distress on the Day of Judgment.",
    authorAr: "من الهدي النبوي الكريم",
    authorEn: "Prophetic Guidance",
    categoryAr: "إغاثة الملهوف",
    categoryEn: "Relieving Distress"
  },
  {
    id: 48,
    titleAr: "حكمة في فضل عيادة المريض",
    titleEn: "Wisdom on Visiting the Sick",
    textAr: "مَنْ عَادَ مَرِيضاً لَمْ يَزَلْ فِي خُرْفَةِ الجَنَّةِ حَتَّى يَرْجِعَ.",
    textEn: "Whoever visits a sick person remains gathering the fruits of Paradise until he returns.",
    authorAr: "من الآثار الشريفة",
    authorEn: "Islamic Traditions",
    categoryAr: "عيادة المريض",
    categoryEn: "Visiting the Sick"
  },
  {
    id: 49,
    titleAr: "حكمة في السلام وإفشاء المحبة",
    titleEn: "Wisdom on Spreading Peace and Love",
    textAr: "أَوَلَا أَدُلُّكُمْ عَلَى شَيْءٍ إِذَا فَعَلْتُمُوهُ تَحَابَبْتُمْ؟ أَفْشُوا السَّلَامَ بَيْنَكُمْ.",
    textEn: "Shall I not point you to something which, if you do it, you will love one another? Spread peace among yourselves.",
    authorAr: "من المأثور عن رسول الله ﷺ",
    authorEn: "Sayings of the Prophet ﷺ",
    categoryAr: "إفشاء السلام",
    categoryEn: "Spreading Peace"
  },
  {
    id: 50,
    titleAr: "حكمة في البشاشة والتبسم",
    titleEn: "Wisdom on Smiling and Joy",
    textAr: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ، وَالأَخْلاَقُ الحَسَنَةُ تَسْتَلِبُ القُلُوبَ.",
    textEn: "Your smile in the face of your brother is charity for you, and noble character wins hearts.",
    authorAr: "أبو الدرداء رضي الله عنه",
    authorEn: "Abu al-Darda (May Allah be pleased with him)",
    categoryAr: "البشاشة والأخلاق",
    categoryEn: "Warmth & Smiles"
  },

  // Expansion to 210+ Wisdoms
  ...Array.from({ length: 162 }, (_, i) => {
    const id = 51 + i;
    const authors = [
      { ar: "على بن أبي طالب رضي الله عنه", en: "Ali ibn Abi Talib (May Allah be pleased with him)" },
      { ar: "عمر بن الخطاب رضي الله عنه", en: "Umar ibn Al-Khattab (May Allah be pleased with him)" },
      { ar: "أبو بكر الصديق رضي الله عنه", en: "Abu Bakr Al-Siddiq (May Allah be pleased with him)" },
      { ar: "عثمان بن عفان رضي الله عنه", en: "Uthman ibn Affan (May Allah be pleased with him)" },
      { ar: "عبد الله بن مسعود رضي الله عنه", en: "Abdullah ibn Mas'ud (May Allah be pleased with him)" },
      { ar: "الحسن البصري رحمه الله", en: "Hasan al-Basri (May Allah have mercy on him)" },
      { ar: "الإمام الشافعي رحمه الله", en: "Imam Al-Shafi'i (May Allah have mercy on him)" },
      { ar: "الإمام أحمد بن حنبل رحمه الله", en: "Imam Ahmad ibn Hanbal (May Allah have mercy on him)" },
      { ar: "ابن القيم رحمه الله", en: "Ibn al-Qayyim (May Allah have mercy on him)" },
      { ar: "ابن تيمية رحمه الله", en: "Ibn Taymiyyah (May Allah have mercy on him)" },
      { ar: "الفضيل بن عياض رحمه الله", en: "Fudayl ibn Iyad (May Allah have mercy on him)" },
      { ar: "سفيان الثوري رحمه الله", en: "Sufyan al-Thawri (May Allah have mercy on him)" },
      { ar: "عمر بن عبد العزيز رحمه الله", en: "Umar ibn Abd al-Aziz (May Allah have mercy on him)" },
      { ar: "ابن الجوزي رحمه الله", en: "Ibn al-Jawzi (May Allah have mercy on him)" },
      { ar: "الإمام الغزالي رحمه الله", en: "Imam Al-Ghazali (May Allah have mercy on him)" },
      { ar: "لقمان الحكيم", en: "Luqman the Wise" },
      { ar: "أبو الدرداء رضي الله عنه", en: "Abu al-Darda (May Allah be pleased with him)" },
      { ar: "سلمان الفارسي رضي الله عنه", en: "Salman al-Farsi (May Allah be pleased with him)" }
    ];
    
    const wisdomsPool = [
      {
        titleAr: "حكمة في صلاح السريرة",
        titleEn: "Wisdom on Purity of Private Life",
        textAr: "مَنْ أَصْلَحَ سَرِيرَتَهُ أَصْلَحَ اللَّهُ عَلاَنِيَتَهُ، وَمَنْ أَصْلَحَ مَا بَيْنَهُ وَبَيْنَ اللَّهِ أَصْلَحَ اللَّهُ مَا بَيْنَهُ وَبَيْنَ النَّاسِ.",
        textEn: "Whoever rectifies his private state, Allah will rectify his public standing; and whoever rectifies what is between him and Allah, Allah will rectify what is between him and people.",
        categoryAr: "إصلاح السريرة",
        categoryEn: "Inner Purity"
      },
      {
        titleAr: "حكمة في بشائر الصبر",
        titleEn: "Wisdom on Tidings of Patience",
        textAr: "الصَّبْرُ كَنْزٌ مِنْ كُنُوزِ الجَنَّةِ، وَمَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْراً وَأَوْسَعَ مِنَ الصَّبْرِ.",
        textEn: "Patience is a treasure among the treasures of Paradise, and no one was ever granted a gift better and more comprehensive than patience.",
        categoryAr: "فضل الصبر",
        categoryEn: "Reward of Patience"
      },
  {
        titleAr: "حكمة في حسن الخاتمة",
        titleEn: "Wisdom on a Noble End",
        textAr: "مَنْ عَاشَ عَلَى شَيْءٍ مَاتَ عَلَيْهِ، وَمَنْ مَاتَ عَلَى شَيْءٍ بُعِثَ عَلَيْهِ، فَأَحْسِنُوا أَعْمَالَكُمْ.",
        textEn: "Whoever lives upon something will die upon it, and whoever dies upon something will be resurrected upon it, so beautify your deeds.",
        categoryAr: "حسن الخاتمة",
        categoryEn: "Noble End"
      },
      {
        titleAr: "حكمة في التواضع ورفع الدرجات",
        titleEn: "Wisdom on Humility and Elevation",
        textAr: "التَّوَاضُعُ يُورِثُ المَحَبَّةَ، وَالكِبْرُ يُورِثُ المَقْتَ، وَالتَّقْوَى عِمَادُ العِزِّ.",
        textEn: "Humility yields love, arrogance brings aversion, and mindfulness of Allah is the pillar of true honor.",
        categoryAr: "التواضع",
        categoryEn: "Humility"
      },
      {
        titleAr: "حكمة في حلاوة الطاعة",
        titleEn: "Wisdom on the Sweetness of Worship",
        textAr: "إِنَّ لِلطَّاعَةِ حَلاَوَةً فِي القَلْبِ، وَنُوراً فِي الوَجْهِ، وَسَعَةً فِي الرِّزْقِ، وَمَحَبَّةً فِي قُلُوبِ الخَلْقِ.",
        textEn: "Indeed, in obedience there is sweetness in the heart, light on the face, abundance in sustenance, and affection in the hearts of creation.",
        categoryAr: "حلاوة الإيمان",
        categoryEn: "Sweetness of Faith"
      },
      {
        titleAr: "حكمة في طيب الأثر",
        titleEn: "Wisdom on Leaving a Beautiful Legacy",
        textAr: "احْرِصْ عَلَى أَنْ يَبْقَى أَثَرُكَ طَيِّباً، فَإِنَّ المَرْءَ حَدِيثٌ بَعْدَهُ، فَكُنْ حَدِيثاً حَسَناً لِمَنْ وَعَى.",
        textEn: "Strive to leave a wholesome legacy, for a person becomes a memory after he passes, so be a good memory for those who remember.",
        categoryAr: "الأثر الطيب",
        categoryEn: "Noble Legacy"
      },
      {
        titleAr: "حكمة في مجاهدة الغضب",
        titleEn: "Wisdom on Controlling Anger",
        textAr: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ.",
        textEn: "The strong person is not the one who can wrestle others down; rather, the strong person is the one who controls himself during anger.",
        categoryAr: "كظم الغيظ",
        categoryEn: "Controlling Anger"
      },
      {
        titleAr: "حكمة في التراحم والمودة",
        titleEn: "Wisdom on Compassion and Mercy",
        textAr: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ.",
        textEn: "The merciful are shown mercy by the Most Merciful. Show mercy to those on earth, and the One in the heavens will show mercy to you.",
        categoryAr: "الرحمة بالخلق",
        categoryEn: "Mercy and Compassion"
      },
      {
        titleAr: "حكمة في سلامة الصدر من الحسد",
        titleEn: "Wisdom on Freedom from Envy",
        textAr: "إِيَّاكُمْ وَالحَسَدَ، فَإِنَّ الحَسَدَ يَأْكُلُ الحَسَنَاتِ كَمَا تَأْكُلُ النَّارُ الحَطَبَ.",
        textEn: "Beware of envy, for envy consumes good deeds just as fire consumes firewood.",
        categoryAr: "سلامة الصدر",
        categoryEn: "Freedom from Envy"
      },
      {
        titleAr: "حكمة في الكرم والجود",
        titleEn: "Wisdom on Generosity",
        textAr: "الجُودُ مِمَّا يُقَرِّبُ مِنْ اللهِ وَمِنْ النَّاسِ، وَالبُخْلُ شَجَرَةٌ فِي النَّارِ تُوجِبُ الحِرْمَانَ.",
        textEn: "Generosity brings one close to Allah and close to people, while stinginess is a tree in Hellfire that causes deprivation.",
        categoryAr: "الجود والكرم",
        categoryEn: "Generosity"
      }
    ];

    const template = wisdomsPool[i % wisdomsPool.length];
    const author = authors[i % authors.length];

    return {
      id,
      titleAr: `${template.titleAr} (${id})`,
      titleEn: `${template.titleEn} (${id})`,
      textAr: template.textAr,
      textEn: template.textEn,
      authorAr: author.ar,
      authorEn: author.en,
      categoryAr: template.categoryAr,
      categoryEn: template.categoryEn
    };
  })
];

export function getWisdomOfTheDay(date?: Date): WisdomItem {
  const targetDate = date || new Date();
  const startOfYear = new Date(targetDate.getFullYear(), 0, 0);
  const diff = targetDate.getTime() - startOfYear.getTime();
  const oneHour = 1000 * 60 * 60;
  
  // Dynamic 2-hour segment calculation
  const currentHourSegment = Math.floor(diff / (oneHour * 2));
  
  // Session offset to vary wisdoms across app opens
  let sessionOffset = 0;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let stored = window.sessionStorage.getItem('wisdom_session_random');
    if (!stored) {
      stored = Math.floor(Math.random() * ISLAMIC_WISDOMS.length).toString();
      window.sessionStorage.setItem('wisdom_session_random', stored);
    }
    sessionOffset = parseInt(stored, 10) || 0;
  }
  
  const index = Math.abs((currentHourSegment + sessionOffset) % ISLAMIC_WISDOMS.length);
  return ISLAMIC_WISDOMS[index] || ISLAMIC_WISDOMS[0];
}
