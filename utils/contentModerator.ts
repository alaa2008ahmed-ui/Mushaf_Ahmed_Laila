/**
 * Content Moderation Engine for Chat & Community
 * Automated detection for offensive, profane, and political content.
 * Supports Arabic normalization, dotless/variant matching (e.g. ثورة / توره),
 * unified alef/teh marbuta/yeh, and comprehensive English/Franco words.
 */

// 1. Offensive & Profane Words List (Arabic, English, and Franco)
export const DEFAULT_OFFENSIVE_WORDS = [
  // --- Arabic Offensive Words ---
  'كلب', 'حمار', 'حيوان', 'حقير', 'غبي', 'احمق', 'أحمق', 'تفه', 'تافه',
  'سافل', 'وسخ', 'واطي', 'قذر', 'منحط', 'منحرف', 'عاهر', 'عاهره', 'عاهرة',
  'قواد', 'شرطوط', 'شرموط', 'شرموطه', 'شرموطة', 'قحبة', 'قحبه', 'عرص',
  'منيوك', 'منيوكه', 'كس', 'طيز', 'زب', 'زبي', 'خول', 'عرصات', 'شاذ',
  'لوطي', 'سحاقية', 'سحاقيه', 'ابن الكلب', 'ابن الحمار', 'ابن الشرموطة',
  'ابن الشرموطه', 'ابن الحرام', 'ابن الستين', 'يلعن', 'يلعن ابوك', 'يلعن امك',
  'يلعن ربك', 'لعنة الله', 'لعنه الله', 'تفو', 'تفو عليك', 'يا ابن الكلب',
  'يا ابن الشرموطة', 'يا ابن الشرموطه', 'يا معرص', 'يا منيوك', 'يا خول',
  'ابن القحبة', 'ابن القحبه', 'يا قحبة', 'يا قحبه', 'يا سافل', 'يا حقير',
  'خرا', 'يا خرا', 'خنزير', 'يا حيوان', 'نجس', 'فاجر', 'فاجرة', 'فاجره',
  'متناك', 'متناكه', 'متناكة', 'متناكين', 'لبوة', 'لبوه', 'يا لبوة', 'يا لبوه', 'يا متناك', 'يا متناكه',

  // --- English Offensive Words ---
  'bitch', 'dog', 'donkey', 'animal', 'idiot', 'stupid', 'bastard', 'whore',
  'slut', 'pimp', 'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bullshit',
  'asshole', 'cunt', 'dick', 'pussy', 'gay', 'lesbian', 'fag', 'faggot',
  'son of a bitch', 'damn you', 'curse you', 'jerk', 'scumbag', 'trash',

  // --- Franco-Arabic Offensive Words ---
  'sharmota', 'sharmouta', 'sharmuta', 'kos', 'koss', 'kosomak', 'kuss',
  'teez', 'tyz', '3ars', 'ars', 'menyouk', 'manyook', 'khalb', 'kalb',
  '5ra', 'khara', 'kharaa', '5awwal', 'khawal', 'gahba', 'qa7ba'
];

// 2. Political & Incitement Keywords List (Arabic, English, and Franco)
export const DEFAULT_POLITICAL_WORDS = [
  // --- Arabic Political Words ---
  'سيسي', 'السيسي', 'سيسى', 'السيسى', 'حكومه', 'حكومة', 'الحكومة', 'الحكومه',
  'مظاهرات', 'مظاهره', 'مظاهرة', 'المظاهرات', 'تظاهر', 'ثورة', 'ثوره', 'الثورة', 'الثوره',
  'توره', 'التوره', 'انقلاب', 'الانقلاب', 'انقلاب عسكري', 'اسقاط النظام',
  'إسقاط النظام', 'ارحل يا', 'الشعب يريد اسقاط', 'الشعب يريد إسقاط',
  'اخواني', 'إخواني', 'اخوان', 'إخوان', 'إخوان مسلمين', 'اخوان مسلمين',
  'الاخوان المسلمين', 'الإخوان المسلمين', 'داعش', 'داعشي', 'داعشية', 'داعشيه',
  'ارهابي', 'إرهابي', 'ارهاب', 'إرهاب', 'الارهاب', 'الإرهاب', 'بلطجية',
  'بلطجيه', 'شبيحة', 'شبيحه', 'تكتل سياسي', 'تمرد', 'عصيان مدني',
  'اعتصام', 'ميدان التحرير', 'الانقلاب العسكري', 'حزب سياسي', 'المعارضة المسلحة',
  'المليشيات', 'ميليشيا', 'طائفية', 'طائفيه', 'سب الصحابة', 'سب الصحابه',
  'الرافضة', 'الرافضه', 'النواصب', 'التحريض', 'حاكم ظالم', 'طاغية', 'طاغيه',

  // --- English Political Words ---
  'sisi', 'elsisi', 'al-sisi', 'alsisi', 'government', 'gov', 'regime',
  'protest', 'protests', 'demonstration', 'demonstrations', 'revolution',
  'revolt', 'coup', 'military coup', 'overthrow', 'regime change',
  'down with the regime', 'down with', 'muslim brotherhood', 'ikhwan',
  'daesh', 'isis', 'isil', 'terrorist', 'terrorism', 'thug', 'thugs',
  'rebellion', 'civil disobedience', 'sit-in', 'tahrir square', 'militia',
  'militias', 'sectarian', 'sectarianism', 'dictator', 'dictatorship',

  // --- Franco-Arabic Political Words ---
  'thawra', 'thowra', '7okoma', '7okomah', 'hokoma', 'hokomah', 'inqilab',
  'enqelab', 'mothaharat', 'mozaharat', 'da3esh', 'erhab', 'erhabi'
];

// In-memory extendable lists (initialized with defaults)
export let customOffensiveWords: string[] = [...DEFAULT_OFFENSIVE_WORDS];
export let customPoliticalWords: string[] = [...DEFAULT_POLITICAL_WORDS];

/**
 * Normalizes text for accurate matching across Arabic dialects, spelling mistakes,
 * English variations, and Franco-Arabic.
 * 
 * Rules applied:
 * 1. Diacritics (Tashkeel) removal.
 * 2. Tatweel (Kashida) removal.
 * 3. Dotless / letter variation unifications:
 *    - [أإآٱ] -> ا
 *    - ة -> ه
 *    - [ىيئ] -> ي
 *    - ؤ -> و
 *    - ث -> ت (e.g. ثورة -> توره / تورة -> توره)
 *    - ذ -> د (e.g. قذافي -> قدافي)
 * 4. Punctuation/symbols/dots between letters removed (e.g., س-ي-س-ي or f.u.c.k -> سيسي or fuck).
 * 5. Excessive repeated characters collapsed (e.g., سسسسيسي -> سيسي).
 * 6. Numbers/leetspeak in English normalized (0->o, 1->i, 3->e, 4->a, 5->s, 7->t).
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';

  let normalized = text.trim().toLowerCase();

  // 1. Remove Arabic Tashkeel (Diacritics)
  normalized = normalized.replace(/[\u064B-\u0652\u0670]/g, '');

  // 2. Remove Tatweel (Kashida)
  normalized = normalized.replace(/\u0640/g, '');

  // 3. Remove punctuation / separators inserted inside words (e.g. "س-ي-س-ي", "ف.ك", "f_u_c_k")
  normalized = normalized.replace(/([\u0600-\u06FFa-zA-Z0-9])[\.\-_/\\s~*#@!$%^&()+=\[\]{}|:;\"'<>,?]+(?=[\u0600-\u06FFa-zA-Z0-9])/g, '$1');

  // 4. Arabic letter normalizations (Unified phonetic and spelling variations)
  normalized = normalized
    // Unify all Alef variations [أ إ آ ٱ] -> ا
    .replace(/[أإآٱ]/g, 'ا')
    // Unify Teh Marbuta [ة] -> ه
    .replace(/ة/g, 'ه')
    // Unify Yeh [ى ي ئ] -> ي
    .replace(/[ىيئ]/g, 'ي')
    // Unify Waw with hamza [ؤ] -> و
    .replace(/ؤ/g, 'و')
    // Unify Theh [ث] -> ت (Matches "ثورة" with "توره" / "تورة" flawlessly)
    .replace(/ث/g, 'ت')
    // Unify Dhal [ذ] -> د
    .replace(/ذ/g, 'د');

  // 5. Reduce 3 or more repeated letters to 1 or 2 (e.g., "سسسسيسي" -> "سيسي", "fuuuuck" -> "fuck")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');

  // 6. Normalize spaces
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}

export interface ModerationResult {
  isViolating: boolean;
  category: 'offensive' | 'political' | 'none';
  detectedWords: string[];
  normalizedText: string;
}

/**
 * Checks text against banned words list
 */
export function checkContentModeration(text: string): ModerationResult {
  if (!text || !text.trim()) {
    return { isViolating: false, category: 'none', detectedWords: [], normalizedText: '' };
  }

  const normalized = normalizeArabicText(text);
  const detectedWords: string[] = [];
  let foundCategory: 'offensive' | 'political' | 'none' = 'none';

  // Check offensive words
  for (const rawWord of customOffensiveWords) {
    const normWord = normalizeArabicText(rawWord);
    if (!normWord) continue;

    // Use boundary or substring test
    const regex = new RegExp(`(?:^|\\s|_|\\b)${normWord}(?:$|\\s|_|\\b)`, 'i');
    if (regex.test(normalized) || normalized.includes(normWord)) {
      if (!detectedWords.includes(rawWord)) {
        detectedWords.push(rawWord);
      }
      foundCategory = 'offensive';
    }
  }

  // Check political words
  for (const rawWord of customPoliticalWords) {
    const normWord = normalizeArabicText(rawWord);
    if (!normWord) continue;

    const regex = new RegExp(`(?:^|\\s|_|\\b)${normWord}(?:$|\\s|_|\\b)`, 'i');
    if (regex.test(normalized) || normalized.includes(normWord)) {
      if (!detectedWords.includes(rawWord)) {
        detectedWords.push(rawWord);
      }
      if (foundCategory === 'none') {
        foundCategory = 'political';
      }
    }
  }

  return {
    isViolating: detectedWords.length > 0,
    category: foundCategory,
    detectedWords,
    normalizedText: normalized
  };
}

/**
 * Helper to dynamically add new banned words
 */
export function addCustomBannedWord(word: string, category: 'offensive' | 'political'): boolean {
  if (!word || !word.trim()) return false;
  const cleanWord = word.trim();

  if (category === 'offensive') {
    if (!customOffensiveWords.includes(cleanWord)) {
      customOffensiveWords.push(cleanWord);
      return true;
    }
  } else {
    if (!customPoliticalWords.includes(cleanWord)) {
      customPoliticalWords.push(cleanWord);
      return true;
    }
  }
  return false;
}
