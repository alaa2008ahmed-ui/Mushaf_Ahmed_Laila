export interface SalahDhikrItem {
    id: string;
    text: string;
    textEn?: string;
    title?: string;
    titleEn?: string;
    count: number;
    note: string;
    noteEn?: string;
    isQuran?: boolean;
}

export const fajrDhikr: SalahDhikrItem = { 
    id: 'fajr_special', 
    title: "طلب العلم النافع والرزق والعمل",
    titleEn: "Supplication for Knowledge, Provision & Deeds",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.", 
    textEn: "O Allah, I ask You for beneficial knowledge, good provision, and acceptable deeds.",
    count: 1, 
    note: "مرة واحدة",
    noteEn: "Once"
};

export const fajrMaghribDhikr: SalahDhikrItem = { 
    id: 'fajr_maghrib_special', 
    title: "الاستعاذة من النار",
    titleEn: "Seeking Refuge from Hellfire",
    text: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ.", 
    textEn: "O Allah, protect me from the Fire.",
    count: 7, 
    note: "7 مرات",
    noteEn: "7 times"
};

const afterEveryPrayerDhikr: SalahDhikrItem = { 
    id: 'after_every_prayer', 
    title: "دعاء الإعانة على الذكر والشكر",
    titleEn: "Supplication for Allah's Aid in Remembrance",
    text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.", 
    textEn: "O Allah, help me to remember You, give thanks to You, and worship You in the best manner.",
    count: 1, 
    note: "مرة واحدة",
    noteEn: "Once"
};

export const baseAthkar: SalahDhikrItem[] = [
    { 
        id: 'istighfar', 
        title: "الاستغفار",
        titleEn: "Istighfar (Seeking Forgiveness)",
        text: "أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ.", 
        textEn: "I seek forgiveness from Allah, I seek forgiveness from Allah, I seek forgiveness from Allah.",
        count: 1, 
        note: "البداية",
        noteEn: "Start"
    },
    { 
        id: 'salam', 
        title: "دعاء السلام",
        titleEn: "Supplication of Peace",
        text: "اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.", 
        textEn: "O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.",
        count: 1, 
        note: "مرة واحدة",
        noteEn: "Once"
    },
    afterEveryPrayerDhikr,
    { 
        id: 'tahleel_1', 
        title: "التهليل والثناء على الله",
        titleEn: "Declaration of Faith & Praise",
        text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.", 
        textEn: "None has the right to be worshipped but Allah alone, with no partner. His is the kingdom, His is all praise, and He has power over all things. O Allah, none can prevent what You give, and none can give what You prevent, and no wealth or fortune can benefit its possessor against You.",
        count: 1, 
        note: "مرة واحدة",
        noteEn: "Once"
    },
    { 
        id: 'tahleel_2', 
        title: "التهليل والتوحيد",
        titleEn: "Declaration of Faith & Sincerity",
        text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ، لَا إِلَهَ إِلَّا اللهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ، لَا إِلَهَ إِلَّا اللهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ.", 
        textEn: "None has the right to be worshipped but Allah alone, with no partner. His is the kingdom and praise, and He has power over all things. There is no power nor strength except with Allah. None has the right to be worshipped but Allah, and we worship none but Him. To Him belongs all grace, bounty, and praise. None has the right to be worshipped but Allah, making religion sincerely for Him, even if the disbelievers detest it.",
        count: 1, 
        note: "مرة واحدة",
        noteEn: "Once"
    },
    { 
        id: 'tasbeeh', 
        title: "التسبيح",
        titleEn: "Tasbeeh (Subhan Allah)",
        text: 'سُبْحَانَ اللهِ', 
        textEn: 'Glory be to Allah (Subhan Allah)',
        count: 33, 
        note: '33 مرة',
        noteEn: '33 times'
    },
    { 
        id: 'tahmeed', 
        title: "التحميد",
        titleEn: "Tahmeed (Alhamdulillah)",
        text: 'الْحَمْدُ للهِ', 
        textEn: 'Praise be to Allah (Alhamdulillah)',
        count: 33, 
        note: '33 مرة',
        noteEn: '33 times'
    },
    { 
        id: 'takbeer', 
        title: "التكبير",
        titleEn: "Takbeer (Allahu Akbar)",
        text: 'اللهُ أَكْبَرُ', 
        textEn: 'Allah is Most Great (Allahu Akbar)',
        count: 33, 
        note: '33 مرة',
        noteEn: '33 times'
    },
    { 
        id: 'khatima', 
        title: "تمام المائة",
        titleEn: "Completion of 100",
        text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", 
        textEn: "None has the right to be worshipped but Allah alone, with no partner. His is the kingdom and praise, and He has power over all things.",
        count: 1, 
        note: "تمام المائة",
        noteEn: "Completion of 100"
    },
    { 
        id: 'kursi', 
        title: "آية الكرسي", 
        titleEn: "Ayat Al-Kursi (The Throne Verse)",
        text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", 
        textEn: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        count: 1, 
        note: "مرة واحدة", 
        noteEn: "Once",
        isQuran: true 
    },
    { 
        id: 'ikhlas', 
        title: "سورة الإخلاص", 
        titleEn: "Surah Al-Ikhlas",
        text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<br>قُلْ هُوَ اللَّهُ أَحَدٌ (١) اللَّهُ الصَّمَدُ (٢) لَمْ يَلِدْ وَلَمْ يُولَدْ (٣) وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ (٤)", 
        textEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.<br>Say, 'He is Allah, [who is] One, (1) Allah, the Eternal Refuge. (2) He neither begets nor is born, (3) Nor is there to Him any equivalent.' (4)",
        count: 1, 
        note: "مرة واحدة", 
        noteEn: "Once",
        isQuran: true 
    },
    { 
        id: 'falaq', 
        title: "سورة الفلق", 
        titleEn: "Surah Al-Falaq",
        text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<br>قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (١) مِن شَرِّ مَا خَلَقَ (٢) وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ (٣) وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ (٤) وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ (٥)", 
        textEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.<br>Say, 'I seek refuge in the Lord of daybreak (1) From the evil of that which He created (2) And from the evil of darkness when it settles (3) And from the evil of the blowers in knots (4) And from the evil of an envier when he envies.' (5)",
        count: 1, 
        note: "مرة واحدة", 
        noteEn: "Once",
        isQuran: true 
    },
    { 
        id: 'naas', 
        title: "سورة الناس", 
        titleEn: "Surah An-Nas",
        text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<br>قُلْ أَعُوذُ بِرَبِّ النَّاسِ (١) مَلِكِ النَّاسِ (٢) إِلَٰهِ النَّاسِ (٣) مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ (٤) الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ (٥) مِنَ الْجِنَّةِ وَالنَّاسِ (٦)", 
        textEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.<br>Say, 'I seek refuge in the Lord of mankind, (1) The Sovereign of mankind, (2) The God of mankind, (3) From the evil of the retreating whisperer - (4) Who whispers into the breasts of mankind - (5) From among the jinn and mankind.' (6)",
        count: 1, 
        note: "مرة واحدة", 
        noteEn: "Once",
        isQuran: true 
    }
];

export const specialZikr: SalahDhikrItem = { 
    id: 'special_10', 
    title: "التهليل عشر مرات",
    titleEn: "Declaration of Tawheed (10 Times)",
    text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", 
    textEn: "None has the right to be worshipped but Allah alone, with no partner. His is the kingdom and praise, He gives life and causes death, and He has power over all things.",
    count: 10, 
    note: "10 مرات",
    noteEn: "10 times"
};

export interface PrayerOption {
    id: string;
    title: string;
    titleEn: string;
    icon: string;
    color: string;
}

export const prayerOptions: PrayerOption[] = [
    { id: 'fajr', title: 'صلاة الفجر', titleEn: 'Fajr Prayer', icon: 'fa-cloud-sun', color: 'primary' },
    { id: 'dhuhr', title: 'صلاة الظهر', titleEn: 'Dhuhr Prayer', icon: 'fa-sun', color: 'secondary' },
    { id: 'asr', title: 'صلاة العصر', titleEn: 'Asr Prayer', icon: 'fa-cloud-sun-rain', color: 'primary' },
    { id: 'maghrib', title: 'صلاة المغرب', titleEn: 'Maghrib Prayer', icon: 'fa-moon', color: 'secondary' },
    { id: 'isha', title: 'صلاة العشاء', titleEn: 'Isha Prayer', icon: 'fa-star-and-crescent', color: 'primary' }
];
