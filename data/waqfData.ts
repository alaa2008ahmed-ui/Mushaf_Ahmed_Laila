// دليل علامات الوقف في المصحف الشريف وأحكامها
export interface WaqfSignInfo {
  id: string;
  symbol: string;
  unicodeChar: string;
  alternativeChars?: string[];
  nameAr: string;
  nameEn: string;
  shortNameAr: string;
  category: string;
  color: string;
  bgColor: string;
  borderColor: string;
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

export interface WaqfOccurrence {
  sign: WaqfSignInfo;
  char: string;
  wordBefore: string;
  stopPhrase: string;
  index: number;
}

export type VerseSegment = 
  | { type: 'text'; content: string }
  | { type: 'waqf'; content: string; sign: WaqfSignInfo; occurrenceIndex: number; wordBefore: string };

export const WAQF_SIGNS: WaqfSignInfo[] = [
  {
    id: 'lazim',
    symbol: 'مـ',
    unicodeChar: '\u06D8', // ۘ
    alternativeChars: ['\u06D8', 'مـ', 'م'],
    nameAr: 'الوقف اللازم (الواجب)',
    nameEn: 'Compulsory Stop (Mīm)',
    shortNameAr: 'وقف لازم',
    category: 'necessary',
    color: '#d97706', // amber-600
    bgColor: 'rgba(217, 119, 6, 0.12)',
    borderColor: 'rgba(217, 119, 6, 0.4)',
    summaryAr: 'يلزم الوقف عنده وجوباً؛ لأن وصله بما بعده يفسد المعنى ويوهم معنى باطلاً أو منافياً للعقيدة.',
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
    id: 'mamnu',
    symbol: 'لا',
    unicodeChar: '\u06D9', // ۙ
    alternativeChars: ['\u06D9', 'لا'],
    nameAr: 'الوقف الممنوع (قبيح عند تعمده)',
    nameEn: 'Prohibited Stop (Lā)',
    shortNameAr: 'وقف ممنوع',
    category: 'prohibited',
    color: '#ef4444', // red-500
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    summaryAr: 'يحرم تعمّد الوقف عنده إلا لضرورة انقطاع النفس، ويجب ابتداء القراءة بما قبله لربط المعنى.',
    summaryEn: 'Prohibited stop. The clause is grammatically incomplete and stopping distorts meaning.',
    ruleDetailAr: 'هو الوقف على كلام لم يتم معناه لتعلقه الشديد بما بعده لفظاً ومعنى كالوقف بين الفعل وفاعله أو المبتدأ وخبره.',
    ruleDetailEn: 'Clause is tightly bound to subsequent words in grammar and syntax.',
    impactOnMeaningAr: 'الوقف يقطع الصفة عن الموصوف أو المضاف عن المضاف إليه أو يُفرد كلاماً يخل بدلالة الآية.',
    impactOnMeaningEn: 'Stopping severs adjectives from nouns or conditions from answers.',
    audioGuideAr: 'لا يقف القارئ اختياراً، وإن انقطع نفسه يرجع كلمة أو كلمتين للخلف لاستئناف المعنى متصلاً.',
    audioGuideEn: 'Do not stop voluntarily; if forced by breath, backtrack one or two words before resuming.',
    examples: []
  },
  {
    id: 'jaiz',
    symbol: 'ج',
    unicodeChar: '\u06DA', // ۚ
    alternativeChars: ['\u06DA', 'ج'],
    nameAr: 'الوقف الجائز (مستوي الطرفين)',
    nameEn: 'Permissible Stop (Jīm)',
    shortNameAr: 'وقف جائز',
    category: 'permissible',
    color: '#10b981', // emerald-500
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    summaryAr: 'يجوز الوقف ويجوز الوصل بدرجة متساوية تماماً دون ترجيح أحدهما على الآخر.',
    summaryEn: 'Permissible stop with equal preference between stopping and continuing.',
    ruleDetailAr: 'تساوى فيه المقتضي للوقف والمقتضي للوصل، فالكلام تام ولكن له تعلق بليغ بصلة المعنى بعده.',
    ruleDetailEn: 'The clause is complete yet holds thematic connection with the following sentence.',
    impactOnMeaningAr: 'كلا الأمرين (الوقف أو الوصل) يؤدي معنى صحيحاً تماماً وبليغاً موافقاً للأصول.',
    impactOnMeaningEn: 'Both pausing and continuing yield valid and eloquent meanings.',
    audioGuideAr: 'القارئ مخير بالكامل بين الوقوف للأخذ بالنفس أو المواصلة برفق حسب ارتياحه النفسي.',
    audioGuideEn: 'Reciter has complete choice to pause for breath or continue smoothly.',
    examples: []
  },
  {
    id: 'qala',
    symbol: 'قلى',
    unicodeChar: '\u06D7', // ۗ
    alternativeChars: ['\u06D7', 'قلى', 'قلي'],
    nameAr: 'الوقف أولى مع جواز الوصل (قلى)',
    nameEn: 'Preferred Stop (Qalā)',
    shortNameAr: 'الوقف أولى',
    category: 'preferred_stop',
    color: '#0284c7', // sky-600
    bgColor: 'rgba(2, 132, 199, 0.12)',
    borderColor: 'rgba(2, 132, 199, 0.4)',
    summaryAr: 'الوقف أفضل وأولى لإبراز تمام المعنى واستقلال الجملة القرآنية، مع جواز الوصل دون حرج.',
    summaryEn: 'Pausing is preferred to highlight sentence completeness, though continuing is allowed.',
    ruleDetailAr: 'المعنى تام ومستقل، والوقف عليه يظهر جمال الفاصلة القرآنية وبلاغة الاستئناف وحسن البيان.',
    ruleDetailEn: 'The verse clause is independent; pausing underscores the rhetorical pause.',
    impactOnMeaningAr: 'الوقف يمنح ذهن المستمع فرصة لاستيعاب الجملة المكتملة وتأمل دلالتها.',
    impactOnMeaningEn: 'Pausing allows the listener to absorb the complete statement.',
    audioGuideAr: 'يستحسن القارئ الوقوف وتخفيف التلاوة مع أخذ نفس ثم متابعة الآية السامية.',
    audioGuideEn: 'Preferably pause gently before proceeding to the next clause.',
    examples: []
  },
  {
    id: 'sala',
    symbol: 'صلى',
    unicodeChar: '\u06D6', // ۖ
    alternativeChars: ['\u06D6', 'صلى', 'صلي'],
    nameAr: 'الوصل أولى مع جواز الوقف (صلى)',
    nameEn: 'Preferred Continuation (Salā)',
    shortNameAr: 'الوصل أولى',
    category: 'preferred_continue',
    color: '#0d9488', // teal-600
    bgColor: 'rgba(13, 148, 136, 0.12)',
    borderColor: 'rgba(13, 148, 136, 0.4)',
    summaryAr: 'الوصل أولى وأفضل لترابط الجمل والمعنى، مع جواز الوقف عند الحاجة والتنفس.',
    summaryEn: 'Continuing is preferred for sentence flow, though pausing is permitted.',
    ruleDetailAr: 'الارتباط اللفظي أو المعنوي قوي، فالوصل يظهر التماسك البياني للجملة القرآنية وتناسقها.',
    ruleDetailEn: 'Strong grammatical connection where continuation manifests cohesive syntax.',
    impactOnMeaningAr: 'الوصل يربط السبب بالمسبب أو الشرط بجوابه بنسيج متكامل لا انفصال فيه.',
    impactOnMeaningEn: 'Continuation links conditions and outcomes seamlessly.',
    audioGuideAr: 'يصل القارئ جملته بنبرة متصلة إلا إذا احتاج للتنفس فيجوز له الوقف دون إثم.',
    audioGuideEn: 'Continue reading smoothly unless needing a breath pause.',
    examples: []
  },
  {
    id: 'muanaqa',
    symbol: '∴',
    unicodeChar: '\u06DB', // ۛ
    alternativeChars: ['\u06DB', '∴', '∴ ∴', '...'],
    nameAr: 'وقف التعانق أو المراقبة (∴)',
    nameEn: 'Embraced/Paired Stop (Three Dots)',
    shortNameAr: 'وقف تعانق',
    category: 'embraced',
    color: '#8b5cf6', // purple-500
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    summaryAr: 'إذا وقفتَ على أحد الموضعين المتقاربين فلا تقف على الآخر، ويجوز وصلهما معاً.',
    summaryEn: 'Paired stops: If you pause at the first symbol, do not pause at the second.',
    ruleDetailAr: 'وجود موضعين متجاورين مترابطين بدلالة متغيرة؛ فوقفك على أحدهما يعطي معنى، وعلى الآخر معنى ثانياً.',
    ruleDetailEn: 'Two adjacent stop points with shifting semantic focus based on choice.',
    impactOnMeaningAr: 'الوقف على أحدهما يعطي معنًى شاهقاً، والجمع بينهما بالوقف يفسد السياق والتركيب اللغوي.',
    impactOnMeaningEn: 'Pausing at one site gives a distinct profound meaning; pausing at both spoils flow.',
    audioGuideAr: 'اختر موقعاً واحداً للوقف من بين النقطتين الثلاثيتين ولا تجمع بينهما في الوقوف، أو صِلْهما معاً.',
    audioGuideEn: 'Select only one of the two three-dot locations to pause, not both.',
    examples: []
  },
  {
    id: 'saktah',
    symbol: 'سكتة',
    unicodeChar: '\u06DC', // ۜ
    alternativeChars: ['\u06DC', 'ۜ', 'س', 'سكتة'],
    nameAr: 'السكت اللطيف (سكتة)',
    nameEn: 'Subtle Pause (Saktah)',
    shortNameAr: 'سكت لطيف',
    category: 'saktah',
    color: '#6366f1', // indigo-500
    bgColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    summaryAr: 'قطع الصوت زمناً يسيراً من غير تنفس ثم مواصلة القراءة مباشرة لإبانة المعنى.',
    summaryEn: 'A short pause without breathing, then immediately resuming recitation.',
    ruleDetailAr: 'السكت يمنع توهم اتصال معنيين متناقضين كما في سورة الكهف (عِوَجَا ۜ قَيِّمًا) ويس (مِن مَّرْقَدِنَا ۜ هَٰذَا).',
    ruleDetailEn: 'A pause without breath to distinguish clauses and prevent false syntactic connections.',
    impactOnMeaningAr: 'يفصل بين المعنى المكتمل والوصف الجديد دون تنفس ليظل السياق التعبيري متصلاً.',
    impactOnMeaningEn: 'Separates consecutive clauses without breaking overall sentence flow.',
    audioGuideAr: 'يقف القارئ وقفة يسيرة جداً دون أخذ نفس ثم يواصل التلاوة مباشرة بنَفَسِه السابق.',
    audioGuideEn: 'Pause momentarily without inhaling, then continue recitation directly.',
    examples: []
  }
];

// Regex matching all Quranic waqf and saktah Unicode characters
export const WAQF_CHARS_REGEX = /([\u06D6\u06D7\u06D8\u06D9\u06DA\u06DB\u06DC])/g;

export const WAQF_CHAR_MAP: Record<string, WaqfSignInfo> = {
  '\u06D8': WAQF_SIGNS[0], // lazim مـ
  '\u06D9': WAQF_SIGNS[1], // mamnu لا
  '\u06DA': WAQF_SIGNS[2], // jaiz ج
  '\u06D7': WAQF_SIGNS[3], // qala قلى
  '\u06D6': WAQF_SIGNS[4], // sala صلى
  '\u06DB': WAQF_SIGNS[5], // muanaqa ∴
  '\u06DC': WAQF_SIGNS[6], // saktah سكتة
};

export function getWaqfSignByChar(char: string): WaqfSignInfo | undefined {
  if (!char) return undefined;
  if (WAQF_CHAR_MAP[char]) return WAQF_CHAR_MAP[char];

  // Try matching against symbol or alternativeChars
  const normalized = char.trim();
  return WAQF_SIGNS.find(s => 
    s.symbol === normalized || 
    s.unicodeChar === normalized || 
    s.alternativeChars?.includes(normalized)
  );
}

/**
 * Extracts each occurrence of a waqf mark in order from the verse text,
 * identifying the mark, its position, and the exact word preceding it.
 */
export function extractWaqfOccurrencesFromVerse(verseText: string): WaqfOccurrence[] {
  const occurrences: WaqfOccurrence[] = [];
  if (!verseText) return occurrences;

  const parts = verseText.split(WAQF_CHARS_REGEX);
  let accumulatedText = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const sign = WAQF_CHAR_MAP[part] || getWaqfSignByChar(part);

    if (sign) {
      const prevText = accumulatedText.trim();
      const words = prevText.split(/\s+/).filter(Boolean);
      const wordBefore = words[words.length - 1] || '';
      const stopPhrase = wordBefore ? `${wordBefore} ${sign.symbol}` : sign.symbol;

      occurrences.push({
        sign,
        char: part,
        wordBefore,
        stopPhrase,
        index: occurrences.length
      });
    } else {
      accumulatedText += part;
    }
  }

  return occurrences;
}

/**
 * Extracts unique WaqfSignInfo items found in the verse.
 */
export const extractWaqfSignsFromVerse = (verseText: string): WaqfSignInfo[] => {
  if (!verseText) return [];
  const occurrences = extractWaqfOccurrencesFromVerse(verseText);
  const seenIds = new Set<string>();
  const uniqueSigns: WaqfSignInfo[] = [];

  for (const occ of occurrences) {
    if (!seenIds.has(occ.sign.id)) {
      seenIds.add(occ.sign.id);
      uniqueSigns.push(occ.sign);
    }
  }

  return uniqueSigns;
};

/**
 * Parses verse text into displayable tokens (text chunks and waqf markers).
 */
export function parseVerseWithWaqfMarks(verseText: string): VerseSegment[] {
  if (!verseText) return [];

  const segments: VerseSegment[] = [];
  const parts = verseText.split(WAQF_CHARS_REGEX);
  let accumulatedText = '';
  let occurrenceCounter = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const sign = WAQF_CHAR_MAP[part] || getWaqfSignByChar(part);

    if (sign) {
      const prevText = accumulatedText.trim();
      const words = prevText.split(/\s+/).filter(Boolean);
      const wordBefore = words[words.length - 1] || '';

      segments.push({
        type: 'waqf',
        content: part,
        sign,
        occurrenceIndex: occurrenceCounter,
        wordBefore
      });
      occurrenceCounter++;
    } else {
      if (part) {
        segments.push({
          type: 'text',
          content: part
        });
        accumulatedText += part;
      }
    }
  }

  return segments;
}

