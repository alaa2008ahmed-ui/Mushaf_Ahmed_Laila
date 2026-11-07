// محرك المتشابهات اللفظية القرآنية وتوجيه الفروق اللفظية للحفاظ
export interface MutashabihGroup {
  id: string;
  topicAr: string;
  topicEn?: string;
  summaryRuleAr: string; // الضابط أو القاعدة الذهبية للتفريق
  summaryRuleEn?: string;
  verses: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    verseText: string;
    highlightedDifference: string; // الكلمة أو العبارة المختلفة
    contextExplanation: string; // علة الفارق اللفظي
    contextExplanationEn?: string;
  }[];
}

export const MUTASHABIHAT_GROUPS: MutashabihGroup[] = [
  {
    id: 'fadhla_allah_aleekum',
    topicAr: 'وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ',
    topicEn: 'And if not for the favor of Allah upon you and His mercy...',
    summaryRuleAr: 'قاعدة: اقتران المغفرة في النساء "وَأَنَّ اللَّهَ غَفُورٌ رَّحِيمٌ"، واقتران الرأفة في النور "وَأَنَّ اللَّهَ رَءُوفٌ رَّحِيمٌ".',
    summaryRuleEn: 'Golden Rule: Forgiveness phrasing in Surah An-Nisa ("And Allah is Forgiving"), while mercy/tenderness in Surah An-Nur ("And Allah is Kind").',
    verses: [
      {
        surahNumber: 24,
        surahName: 'النور',
        ayahNumber: 10,
        verseText: 'وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ وَأَنَّ اللَّهَ تَوَّابٌ حَكِيمٌ',
        highlightedDifference: 'وَأَنَّ اللَّهَ تَوَّابٌ حَكِيمٌ',
        contextExplanation: 'في سياق حديث الإفك واللعان، ناسب ذكر التوبة للمذنبين والحكمة في تشريع الأحكام.',
        contextExplanationEn: 'In context of oaths and slander laws, repentance for sinners and divine wisdom in rulings is emphasized.'
      },
      {
        surahNumber: 24,
        surahName: 'النور',
        ayahNumber: 20,
        verseText: 'وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ وَأَنَّ اللَّهَ رَءُوفٌ رَّحِيمٌ',
        highlightedDifference: 'وَأَنَّ اللَّهَ رَءُوفٌ رَّحِيمٌ',
        contextExplanation: 'لما عاتب المؤمنين على ما خاضوا فيه، ختم بالرأفة والرحمة بهم ألا يعاجلهم بالعقوبة.',
        contextExplanationEn: 'When admonishing believers regarding rumor spreading, it concludes with divine compassion so punishment is not hastened.'
      },
      {
        surahNumber: 4,
        surahName: 'النساء',
        ayahNumber: 83,
        verseText: 'وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ لَاتَّبَعْتُمُ الشَّيْطَانَ إِلَّا قَلِيلًا',
        highlightedDifference: 'لَاتَّبَعْتُمُ الشَّيْطَانَ إِلَّا قَلِيلًا',
        contextExplanation: 'في سياق تثبيت المنافقين وضعفاء الإيمان وإذاعة الأخبار، لولا فضل الله بالهدى لاتبعوا الشيطان.',
        contextExplanationEn: 'In context of weak faith and spreading rumors during conflict; without divine guidance people would succumb to Satan.'
      }
    ]
  },
  {
    id: 'idkhulu_al_qaryah',
    topicAr: 'وَإِذْ قُلْنَا ادْخُلُوا هَٰذِهِ الْقَرْيَةَ (البقرة مقابل الأعراف)',
    topicEn: 'Enter this town... (Al-Baqarah vs. Al-A\'raf)',
    summaryRuleAr: 'قاعدة: البقرة تقدم فيها الأمر بالأكل "فَكُلُوا مِنْهَا حَيْثُ شِئْتُمْ رَغَدًا"، والأعراف "وَاسْكُنُوا هَٰذِهِ الْقَرْيَةَ وَكُلُوا مِنْهَا حَيْثُ شِئْتُمْ".',
    summaryRuleEn: 'Golden Rule: Al-Baqarah prioritizes eating abundantly ("Eat therefrom freely"), whereas Al-A\'raf commands dwelling ("Dwell in this town").',
    verses: [
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 58,
        verseText: 'وَإِذْ قُلْنَا ادْخُلُوا هَٰذِهِ الْقَرْيَةَ فَكُلُوا مِنْهَا حَيْثُ شِئْتُمْ رَغَدًا وَادْخُلُوا الْبَابَ سُجَّدًا وَقُولُوا حِطَّةٌ نَّغْفِرْ لَكُمْ خَطَايَاكُمْ ۚ وَسَنَزِيدُ الْمُحْسِنِينَ',
        highlightedDifference: 'فَكُلُوا مِنْهَا ... نَّغْفِرْ لَكُمْ ... وَسَنَزِيدُ',
        contextExplanation: 'سورة البقرة بُنيت على التكريم والإنعام فجاء لفظ (رغداً)، وبصيغة التعظيم (نغفر) وبالواو (وسنزيد المحسنين).',
        contextExplanationEn: 'Al-Baqarah emphasizes divine grace and bounties ("freely"), using plural majesty ("We shall forgive").'
      },
      {
        surahNumber: 7,
        surahName: 'الأعراف',
        ayahNumber: 161,
        verseText: 'وَإِذْ قِيلَ لَهُمُ اسْكُنُوا هَٰذِهِ الْقَرْيَةَ وَكُلُوا مِنْهَا حَيْثُ شِئْتُمْ وَقُولُوا حِطَّةٌ وَادْخُلُوا الْبَابَ سُجَّدًا نَّغْفِرْ لَكُمْ خَطِيئَاتِكُمْ ۚ سَنَزِيدُ الْمُحْسِنِينَ',
        highlightedDifference: 'اسْكُنُوا ... نَّغْفِرْ لَكُمْ خَطِيئَاتِكُمْ ... سَنَزِيدُ',
        contextExplanation: 'سورة الأعراف جاءت في سياق العرض التاريخي لمواقف بني إسرائيل وإسكانهم الأرض.',
        contextExplanationEn: 'Al-A\'raf presents historical narrative regarding Israelite settlement.'
      }
    ]
  }
];

export const getMutashabihatForAyah = (surahNumber: number, ayahNumber: number): MutashabihGroup | null => {
  for (const g of MUTASHABIHAT_GROUPS) {
    if (g.verses.some(v => v.surahNumber === surahNumber && v.ayahNumber === ayahNumber)) {
      return g;
    }
  }
  return null;
};
