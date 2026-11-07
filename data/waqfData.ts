// دليل علامات الوقف في المصحف الشريف وأحكامها
export interface WaqfSignInfo {
  id: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  category: string;
  summaryAr: string;
  summaryEn?: string;
  ruleDetailAr: string;
  ruleDetailEn?: string;
  impactOnMeaningAr: string;
  impactOnMeaningEn?: string;
  audioGuideAr: string;
  audioGuideEn?: string;
  examples: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    verseText: string;
    stopAt: string;
    reasonAr: string;
    reasonEn?: string;
  }[];
}

export const WAQF_SIGNS: WaqfSignInfo[] = [
  {
    id: 'lazim',
    symbol: 'مـ',
    nameAr: 'الوقف اللازم (الواجب)',
    nameEn: 'Compulsory Stop (Mīm)',
    category: 'necessary',
    summaryAr: 'يلزم الوقف عنده؛ لأن وصله يوهم معنى غير المراد فاسداً أو منافياً للعقيدة.',
    summaryEn: 'Compulsory stop. Continuing would corrupt the meaning or join unrelated theological statements.',
    ruleDetailAr: 'هو ما تم معناه ولا يتعلق بما بعده من جهة الإعراب، وإذا وصله القارئ بما بعده اختل المعنى والتحم كلام المتكلم بكلام غيره.',
    ruleDetailEn: 'Grammatically complete sentence. Continuing joins divine statements with non-divine utterances.',
    impactOnMeaningAr: 'الوصل هنا يفسد المعنى تماماً ويجمع بين معنيين متناقضين أو ينسب قولاً قبيحاً لله عز وجل.',
    impactOnMeaningEn: 'Continuing completely alters the intended meaning or attributes contradictory statements.',
    audioGuideAr: 'يقف القارئ وقفة كاملة مع أخذ نفس طبيعي، ثم يستأنف بما بعده مباشرة دون إعادة الكلمة السابقة.',
    audioGuideEn: 'Reciter must make a complete pause with a natural breath before resuming.',
    examples: [
      {
        surahNumber: 6,
        surahName: 'الأنعام',
        ayahNumber: 36,
        verseText: 'إِنَّمَا يَسْتَجِيبُ الَّذِينَ يَسْمَعُونَ ۘ وَالْمَوْتَىٰ يَبْعَثُهُمُ اللَّهُ',
        stopAt: 'يَسْمَعُونَ ۘ',
        reasonAr: 'الوقف على (يسمعون) لازم؛ لأن الوصل يوهم أن الموتى يشتركون مع الأحياء في الاستجابة.',
        reasonEn: 'Stop at "yasma\'ūn" is compulsory so as not to imply the deceased share in worldly listening.'
      }
    ]
  },
  {
    id: 'mambnu',
    symbol: 'لا',
    nameAr: 'الوقف الممنوع (الكلابِي)',
    nameEn: 'Prohibited Stop (Lā)',
    category: 'prohibited',
    summaryAr: 'يحرم الوقف عنده إلا لضرورة انقطاع النفس، ويجب ابتداء القراءة بما قبله لربط المعنى.',
    summaryEn: 'Prohibited stop. The clause is grammatically incomplete and stopping distorts meaning.',
    ruleDetailAr: 'هو الوقف على كلام لم يتم معناه لتعلقه الشديد بما بعده لفظاً ومعنى.',
    ruleDetailEn: 'Clause is tightly bound to subsequent words in grammar and syntax.',
    impactOnMeaningAr: 'الوقف يقطع الصفة عن الموصوف أو المضاف عن المضاف إليه.',
    impactOnMeaningEn: 'Stopping severs adjectives from nouns or conditions from answers.',
    audioGuideAr: 'لا يقف القارئ اختياراً، وإن انقطع نفسه يرجع كلمة أو كلمتين للخلف لاستئناف المعنى.',
    audioGuideEn: 'Do not stop voluntarily; if forced by breath, backtrack one or two words before resuming.',
    examples: []
  },
  {
    id: 'jaiz',
    symbol: 'ج',
    nameAr: 'الوقف الجائز مستوي الطرفين',
    nameEn: 'Permissible Stop (Jīm)',
    category: 'permissible',
    summaryAr: 'يجوز الوقف ويجوز الوصل بدرجة متساوية تماماً دون ترجيح أحدهما على الآخر.',
    summaryEn: 'Permissible stop with equal preference between stopping and continuing.',
    ruleDetailAr: 'تساوى فيه المقتضي للوقف والمقتضي للوصل، فالكلام تام ولكن له تعلق بليغ بصلة المعنى بعده.',
    ruleDetailEn: 'The clause is complete yet holds thematic connection with the following sentence.',
    impactOnMeaningAr: 'كلا الأمرين (الوقف أو الوصل) يؤدي معنى صحيحاً تماماً وبليغاً.',
    impactOnMeaningEn: 'Both pausing and continuing yield valid and eloquent meanings.',
    audioGuideAr: 'القارئ مخير بالكامل بين الوقوف للأخذ بالنفس أو المواصلة برفق.',
    audioGuideEn: 'Reciter has complete choice to pause for breath or continue smoothly.',
    examples: []
  },
  {
    id: 'qala',
    symbol: 'قلى',
    nameAr: 'الوقف الأولى مع جواز الوصل',
    nameEn: 'Preferred Stop (Qalā)',
    category: 'preferred_stop',
    summaryAr: 'الوقف أفضل وأولى لإبراز تمام المعنى واستقلال الجملة، مع جواز الوصل دون إثم.',
    summaryEn: 'Pausing is preferred to highlight sentence completeness, though continuing is allowed.',
    ruleDetailAr: 'المعنى تام ومستقل، والوقف عليه يظهر جمال الفاصلة القرآنية وبلاغة الاستئناف.',
    ruleDetailEn: 'The verse clause is independent; pausing underscores the rhetorical pause.',
    impactOnMeaningAr: 'الوقف يمنح ذهن المستمع فرصة لاستيعاب الجملة المكتملة.',
    impactOnMeaningEn: 'Pausing allows the listener to absorb the complete statement.',
    audioGuideAr: 'يستحسن القارئ الوقوف وتخفيف التلاوة ثم متابعة الآية السامية.',
    audioGuideEn: 'Preferably pause gently before proceeding to the next clause.',
    examples: []
  },
  {
    id: 'sala',
    symbol: 'صلى',
    nameAr: 'الوصل الأولى مع جواز الوقف',
    nameEn: 'Preferred Continuation (Salā)',
    category: 'preferred_continue',
    summaryAr: 'الوصل أولى وأفضل لترابط الجمل والمعنى، مع جواز الوقف عند الحاجة.',
    summaryEn: 'Continuing is preferred for sentence flow, though pausing is permitted.',
    ruleDetailAr: 'الارتباط اللفظي أو المعنوي قوي، فالوصل يظهر التماسك البياني للجملة القرآنية.',
    ruleDetailEn: 'Strong grammatical connection where continuation manifests cohesive syntax.',
    impactOnMeaningAr: 'الوصل يربط السبب بالمسبب أو الشرط بجوابه بنسيج متكامل.',
    impactOnMeaningEn: 'Continuation links conditions and outcomes seamlessly.',
    audioGuideAr: 'يصل القارئ جملته بنبرة متصلة إلا إذا احتاج للتنفس.',
    audioGuideEn: 'Continue reading smoothly unless needing a breath pause.',
    examples: []
  },
  {
    id: 'muanaqa',
    symbol: '∴ ∴',
    nameAr: 'وقف التعانق (المراقبة)',
    nameEn: 'Embraced/Paired Stop (Three Dots)',
    category: 'embraced',
    summaryAr: 'إذا وقفت على أحد الموضعين المتقاربين فلا تقف على الآخر، ويجوز وصلهما معاً.',
    summaryEn: 'Paired stops: If you pause at the first symbol, do not pause at the second.',
    ruleDetailAr: 'وجود موضعين متجاورين مترابطين بدلالة متغيرة بحسب موضع الوقف.',
    ruleDetailEn: 'Two adjacent stop points with shifting semantic focus based on choice.',
    impactOnMeaningAr: 'الوقف على أحدهما يعطي معنًى شاهقاً، والجمع بينهما بالوقف يفسد السياق.',
    impactOnMeaningEn: 'Pausing at one site gives a distinct profound meaning; pausing at both spoils flow.',
    audioGuideAr: 'اختر موقعاً واحداً للوقف من بين النقطتين الثلاثيتين ولا تجمع بينهما في الوقوف.',
    audioGuideEn: 'Select only one of the two three-dot locations to pause, not both.',
    examples: []
  }
];

export const extractWaqfSignsFromVerse = (verseText: string): WaqfSignInfo[] => {
  const found: WaqfSignInfo[] = [];
  if (!verseText) return found;

  WAQF_SIGNS.forEach(sign => {
    if (verseText.includes(sign.symbol)) {
      found.push(sign);
    }
  });

  return found;
};
