// محرك المتشابهات اللفظية القرآنية الشامل والفروق الدلالية لكافة آيات القرآن الكريم
import { quranData } from '../utils/quranData';

export interface MutashabihVerse {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  verseText: string;
  highlightedDifference: string; // الكلمة أو العبارة المختلفة أو موضع التباين
  contextExplanation: string; // علة الفارق اللفظي والدلالة
  contextExplanationEn?: string;
  juz?: number;
  page?: number;
  matchType?: 'exact' | 'start' | 'end' | 'phrase' | 'classical';
  matchTypeDesc?: string;
  matchedPhrase?: string;
  score?: number;
}

export interface MutashabihGroup {
  id: string;
  topicAr: string;
  topicEn?: string;
  summaryRuleAr: string; // الضابط أو القاعدة الذهبية للتفريق
  summaryRuleEn?: string;
  isUniqueAyah?: boolean; // هل الآية موضع فريد
  verses: MutashabihVerse[];
}

export function stripPrefixBasmalah(text: string, surahNumber: number, ayahNumber: number): string {
  if (ayahNumber === 1 && surahNumber !== 1) {
    return text
      .replace(/^[﻿\s]*بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ\s*/u, '')
      .replace(/^[﻿\s]*بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u, '')
      .replace(/^[﻿\s]*بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/u, '')
      .trim();
  }
  return text;
}

/**
 * تنظيف النص القرآني من التشكيل وعلامات المصحف وضبط الأحرف للمقارنة السريعة
 */
export function cleanQuranText(str: string, surahNumber?: number, ayahNumber?: number): string {
  if (!str) return '';
  let s = str;
  if (surahNumber !== undefined && ayahNumber !== undefined) {
    s = stripPrefixBasmalah(s, surahNumber, ayahNumber);
  }
  return s
    .replace(/[\u064B-\u0660\u0670\u06D6-\u06ED\u06DF-\u06E8\u06EA-\u06ED]/g, '') // التشكيل وعلامات الوقف ورؤوس الآيات
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u0640]/g, '') // علامة المد والتطويل
    .replace(/[^\u0621-\u064A\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanSingleWord(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u064B-\u0660\u0670\u06D6-\u06ED\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u0640]/g, '')
    .replace(/[^\u0621-\u064A]/g, '')
    .trim();
}

/**
 * قاعدة البيانات التراثية لأشهر المتشابهات اللفظية وقواعد الضبط الذهبية لعلماء المتشابهات
 */
export const CLASSICAL_MUTASHABIHAT_GROUPS: MutashabihGroup[] = [
  {
    id: 'fadhla_allah_aleekum',
    topicAr: 'وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ',
    topicEn: 'And if not for the favor of Allah upon you and His mercy...',
    summaryRuleAr: 'قاعدة: اقترنت في النور بالتوبة والحكمة (10)، وفي الدنيا والآخرة (14)، وبالرأفة والرحمة (20)، وبالتزكية (21)، بينما انفردت النساء بـ (لَاتَّبَعْتُمُ الشَّيْطَانَ إِلَّا قَلِيلًا).',
    summaryRuleEn: 'Golden Rule: In Surah An-Nur it couples with Repentance/Wisdom (10), Dunya & Akhirah (14), Kindness & Mercy (20), and Purification (21), while An-Nisa features "you would have followed Satan".',
    verses: [
      {
        surahNumber: 24,
        surahName: 'النور',
        ayahNumber: 10,
        verseText: 'وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ وَأَنَّ اللَّهَ تَوَّابٌ حَكِيمٌ',
        highlightedDifference: 'وَأَنَّ اللَّهَ تَوَّابٌ حَكِيمٌ',
        contextExplanation: 'في سياق حديث الإفك واللعان، ناسب ذكر التوبة للمذنبين والحكمة في تشريع الأحكام والستر.',
        contextExplanationEn: 'In the context of slander and oaths, repentance for sinners and divine wisdom in legislation are highlighted.',
        matchType: 'classical',
        matchTypeDesc: 'موضع في سورة النور (آية 10)'
      },
      {
        surahNumber: 24,
        surahName: 'النور',
        ayahNumber: 14,
        verseText: 'وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ فِي الدُّنْيَا وَالْآخِرَةِ لَمَسَّكُمْ فِي مَا أَفَضْتُمْ فِيهِ عَذَابٌ عَظِيمٌ',
        highlightedDifference: 'فِي الدُّنْيَا وَالْآخِرَةِ لَمَسَّكُمْ...',
        contextExplanation: 'في سياق الإفاضة في حديث الإفك، ناسب ذكر رحمة الله في الدارين وصرف العذاب العظيم عن المؤمنين.',
        contextExplanationEn: 'Regarding rumor mongering; divine grace in this life and the hereafter prevented severe punishment.',
        matchType: 'classical',
        matchTypeDesc: 'موضع في سورة النور (آية 14)'
      },
      {
        surahNumber: 24,
        surahName: 'النور',
        ayahNumber: 20,
        verseText: 'وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ وَأَنَّ اللَّهَ رَءُوفٌ رَّحِيمٌ',
        highlightedDifference: 'وَأَنَّ اللَّهَ رَءُوفٌ رَّحِيمٌ',
        contextExplanation: 'لما عاتب المؤمنين على ما خاضوا فيه، ختم بالرأفة والرحمة بهم ألا يعاجلهم بالعقوبة.',
        contextExplanationEn: 'Admonishing believers for taking part in gossip; concluding with divine compassion and kindness.',
        matchType: 'classical',
        matchTypeDesc: 'موضع في سورة النور (آية 20)'
      },
      {
        surahNumber: 24,
        surahName: 'النور',
        ayahNumber: 21,
        verseText: '۞ يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَتَّبِعُوا خُطُوَاتِ الشَّيْطَانِ ۚ وَمَن يَتَّبِعْ خُطُوَاتِ الشَّيْطَانِ فَإِنَّهُ يَأْمُرُ بِالْفَحْشَاءِ وَالْمُنكَرِ ۚ وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ مَا زَكَىٰ مِنكُم مِّنْ أَحَدٍ أَبَدًا وَلَٰكِنَّ اللَّهَ يُزَكِّي مَن يَشَاءُ ۗ وَاللَّهُ سَمِيعٌ عَلِيمٌ',
        highlightedDifference: 'مَا زَكَىٰ مِنكُم مِّنْ أَحَدٍ أَبَدًا',
        contextExplanation: 'في سياق التحذير من خطوات الشيطان، ناسب بيان أن الطهارة وتزكية النفس لا تنال إلا بفضل الله ورحمته.',
        contextExplanationEn: 'Warning against the footsteps of Satan; personal purification is achievable only through divine grace.',
        matchType: 'classical',
        matchTypeDesc: 'موضع في سورة النور (آية 21)'
      },
      {
        surahNumber: 4,
        surahName: 'النساء',
        ayahNumber: 83,
        verseText: 'وَإِذَا جَاءَهُمْ أَمْرٌ مِّنَ الْأَمْنِ أَوِ الْخَوْفِ أَذَاعُوا بِهِ ۖ وَلَوْ رَدُّوهُ إِلَى الرَّسُولِ وَإِلَىٰ أُولِي الْأَمْرِ مِنْهُمْ لَعَلِمَهُ الَّذِينَ يَسْتَنبِطُونَهُ مِنْهُمْ ۗ وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ لَاتَّبَعْتُمُ الشَّيْطَانَ إِلَّا قَلِيلًا',
        highlightedDifference: 'لَاتَّبَعْتُمُ الشَّيْطَانَ إِلَّا قَلِيلًا',
        contextExplanation: 'في سياق تثبيت المؤمنين والمنافقين وضعفاء الإيمان وإشاعة الأخبار، لولا فضل الله بالهدى لاتبعوا مكائد الشيطان.',
        contextExplanationEn: 'Regarding handling news and security rumors during times of war; divine guidance shielded believers from deception.',
        matchType: 'classical',
        matchTypeDesc: 'موضع في سورة النساء (آية 83)'
      }
    ]
  },
  {
    id: 'anzur_kayfa_kana_aaqibah',
    topicAr: 'فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ (المفسدين / الظالمين / المكذبين / المجرمين / المنذرين)',
    topicEn: 'Observe how was the end of the (corrupters / wrongdoers / deniers / criminals)...',
    summaryRuleAr: 'قاعدة فواصل (فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ): خُتمت بـ (الْمُفْسِدِينَ) في الأعراف (86 و103) والنمل (14) لتقدم ذكر الإفساد وظلم الآيات، وبـ (الظَّالِمِينَ) في يونس (39) والقصص (40)، وبـ (الْمُكَذِّبِينَ) في آل عمران والأنعام والنحل والزخرف، وبـ (الْمُنذَرِينَ) في يونس (73) والصافات (73)، وبـ (الْمُجْرِمِينَ) في الأعراف (84) في قصة لوط، وبـ (مَكْرِهِمْ) في النمل (51) في قصة ثمود.',
    summaryRuleEn: 'Golden Rule: Concludes with "corrupters" in Al-A\'raf and An-Naml, "wrongdoers" in Yunus and Al-Qasas, "deniers" in Aal-Imran, Al-An\'am, An-Nahl and Az-Zukhruf, "warned ones" in Yunus and As-Saffat.',
    verses: [
      {
        surahNumber: 27,
        surahName: 'النمل',
        ayahNumber: 14,
        verseText: 'وَجَحَدُوا بِهَا وَاسْتَيْقَنَتْهَا أَنفُسُهُمْ ظُلْمًا وَعُلُوًّا ۚ فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ الْمُفْسِدِينَ',
        highlightedDifference: 'الْمُفْسِدِينَ',
        contextExplanation: 'ختمت بـ (الْمُفْسِدِينَ) لأن الجحود بالآيات والاستكبار عنها بعد استيقانها هو عين الإفساد في الأرض.',
        contextExplanationEn: 'Ended with "the corrupters" because denying divine signs out of injustice and arrogance is the height of corruption.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة النمل (آية 14)'
      },
      {
        surahNumber: 7,
        surahName: 'الأعراف',
        ayahNumber: 103,
        verseText: 'ثُمَّ بَعَثْنَا مِن بَعْدِهِم مُّوسَىٰ بِآيَاتِنَا إِلَىٰ فِرْعَوْنَ وَمَلَئِهِ فَظَلَمُوا بِهَا ۖ فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ الْمُفْسِدِينَ',
        highlightedDifference: 'الْمُفْسِدِينَ',
        contextExplanation: 'تطابق تام في الفاصلة مع النمل (14): لما تقدم قوله تعالى (فظلموا بها) في شأن فرعون وملئه طابق الختم بـ (المفسدين).',
        contextExplanationEn: 'Identical 5-word ending with An-Naml 14 regarding Pharaoh and his chiefs who wronged the signs.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الأعراف (آية 103)'
      },
      {
        surahNumber: 7,
        surahName: 'الأعراف',
        ayahNumber: 86,
        verseText: 'وَلَا تَقْعُدُوا بِكُلِّ صِرَاطٍ تُوعِدُونَ وَتَصُدُّونَ عَن سَبِيلِ اللَّهِ مَنْ آمَنَ بِهِ وَتَبْغُونَهَا عِوَجًا ۚ وَاذْكُرُوا إِذْ كُنتُمْ قَلِيلًا فَكَثَّرَكُمْ ۖ وَانظُرُوا كَيْفَ كَانَ عَاقِبَةُ الْمُفْسِدِينَ',
        highlightedDifference: 'وَانظُرُوا كَيْفَ كَانَ عَاقِبَةُ الْمُفْسِدِينَ',
        contextExplanation: 'بصيغة الجمع (وانظروا) مع الواو، وختم بـ (المفسدين) لأن قطع الطريق وإيعاد الناس والصد عن سبيل الله إفساد عظيم.',
        contextExplanationEn: 'In plural ("And see"), ending with "the corrupters" for highway robbery and obstructing believers.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الأعراف (آية 86)'
      },
      {
        surahNumber: 7,
        surahName: 'الأعراف',
        ayahNumber: 84,
        verseText: 'وَأَمْطَرْنَا عَلَيْهِم مَّطَرًا ۖ فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ الْمُجْرِمِينَ',
        highlightedDifference: 'الْمُجْرِمِينَ',
        contextExplanation: 'في قصة قوم لوط ومجازاتهم على فاحشتهم النكراء التي ارتكبوها، ناسب الختم بـ (الْمُجْرِمِينَ).',
        contextExplanationEn: 'In the narrative of Lot\'s people, concluding with "the criminals" fitting the enormity of their crime.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الأعراف (آية 84)'
      },
      {
        surahNumber: 10,
        surahName: 'يونس',
        ayahNumber: 39,
        verseText: 'بَلْ كَذَّبُوا بِمَا لَمْ يُحِيطُوا بِعِلْمِهِ وَلَمَّا يَأْتِهِمْ تَأْوِيلُهُ ۚ كَذَٰلِكَ كَذَّبَ الَّذِينَ مِن قَبْلِهِمْ ۖ فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ الظَّالِمِينَ',
        highlightedDifference: 'الظَّالِمِينَ',
        contextExplanation: 'ختمت بـ (الظَّالِمِينَ) لمناسبة تكذيبهم بما لم يحيطوا بعلمه، وظلمهم لأنفسهم بإنكار الحق.',
        contextExplanationEn: 'Concludes with "the wrongdoers" for rejecting what they had not encompassed in knowledge.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة يونس (آية 39)'
      },
      {
        surahNumber: 10,
        surahName: 'يونس',
        ayahNumber: 73,
        verseText: 'فَكَذَّبُوهُ فَنَجَّيْنَاهُ وَمَن مَّعَهُ فِي الْفُلْكِ وَجَعَلْنَاهُمْ خَلَائِفَ وَأَغْرَقْنَا الَّذِينَ كَذَّبُوا بِآيَاتِنَا ۖ فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ الْمُنذَرِينَ',
        highlightedDifference: 'الْمُنذَرِينَ',
        contextExplanation: 'ختمت بـ (الْمُنذَرِينَ) لأن نوحاً عليه السلام لبث فيهم ألف سنة إلا خمسين عاماً ينذرهم فكذبوا بعد طول الإنذار.',
        contextExplanationEn: 'Concludes with "those who were warned" after long admonition by prophet Noah.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة يونس (آية 73)'
      },
      {
        surahNumber: 27,
        surahName: 'النمل',
        ayahNumber: 51,
        verseText: 'فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ مَكْرِهِمْ أَنَّا دَمَّرْنَاهُمْ وَقَوْمَهُمْ أَجْمَعِينَ',
        highlightedDifference: 'مَكْرِهِمْ أَنَّا دَمَّرْنَاهُمْ',
        contextExplanation: 'في قصة ثمود والرهط التسعة الذين مكروا مكرهم لقتل صالح، فناظر المكر بالتدبير الإلهي المحكم.',
        contextExplanationEn: 'Focusing on the plot of the conspirators against Salih; divine retribution overwhelmed their scheme.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة النمل (آية 51)'
      },
      {
        surahNumber: 28,
        surahName: 'القصص',
        ayahNumber: 40,
        verseText: 'فَأَخَذْنَاهُ وَجُنُودَهُ فَنَبَذْنَاهُمْ فِي الْيَمِّ ۖ فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ الظَّالِمِينَ',
        highlightedDifference: 'الظَّالِمِينَ',
        contextExplanation: 'بعد رمي فرعون وجنوده في اليم، خُتم بالظالمين لبغيهم وتكبرهم وادعاء الألوهية.',
        contextExplanationEn: 'After casting Pharaoh and his armies into the sea, concluded with "the wrongdoers" for their hubris.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة القصص (آية 40)'
      },
      {
        surahNumber: 37,
        surahName: 'الصافات',
        ayahNumber: 73,
        verseText: 'فَانظُرْ كَيْفَ كَانَ عَاقِبَةُ الْمُنذَرِينَ',
        highlightedDifference: 'الْمُنذَرِينَ',
        contextExplanation: 'آية مستقلة موجزة بعد قوله (ولقد أرسلنا فيهم منذرين)، فناظر الإرسال بعاقبة الإنذار.',
        contextExplanationEn: 'Brief standalone verse immediately following "And We had already sent among them warners".',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الصافات (آية 73)'
      },
      {
        surahNumber: 3,
        surahName: 'آل عمران',
        ayahNumber: 137,
        verseText: 'قَدْ خَلَتْ مِن قَبْلِكُمْ سُنَنٌ فَسِيرُوا فِي الْأَرْضِ فَانظُرُوا كَيْفَ كَانَ عَاقِبَةُ الْمُكَذِّبِينَ',
        highlightedDifference: 'فَسِيرُوا ... فَانظُرُوا ... الْمُكَذِّبِينَ',
        contextExplanation: 'أمر بالسير في الأرض والاعتبار بمصائر المكذبين للرسل عبر التاريخ البشري.',
        contextExplanationEn: 'Command to travel through the earth and observe the fate of the deniers.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة آل عمران (آية 137)'
      }
    ]
  },
  {
    id: 'idkhulu_al_qaryah',
    topicAr: 'وَإِذْ قُلْنَا ادْخُلُوا هَٰذِهِ الْقَرْيَةَ (البقرة مقابل الأعراف)',
    topicEn: 'Enter this town... (Al-Baqarah vs. Al-A\'raf)',
    summaryRuleAr: 'قاعدة: في البقرة (ادْخُلُوا) بزيادة (رَغَدًا) وتقديم الدخول وتأخير القول، وصيغة الجمع (خَطَايَاكُمْ) وبالواو (وَسَنَزِيدُ). وفي الأعراف (اسْكُنُوا) دون رغداً وبتقديم القول وجمع المؤنث (خَطِيئَاتِكُمْ) وبلا واو (سَنَزِيدُ).',
    summaryRuleEn: 'Golden Rule: Al-Baqarah features "Enter", "freely/bountifully", "We shall forgive your mistakes (plural masculine)", and "And We shall increase". Al-A\'raf features "Dwell", places saying first, and omits the "And".',
    verses: [
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 58,
        verseText: 'وَإِذْ قُلْنَا ادْخُلُوا هَٰذِهِ الْقَرْيَةَ فَكُلُوا مِنْهَا حَيْثُ شِئْتُمْ رَغَدًا وَادْخُلُوا الْبَابَ سُجَّدًا وَقُولُوا حِطَّةٌ نَّغْفِرْ لَكُمْ خَطَايَاكُمْ ۚ وَسَنَزِيدُ الْمُحْسِنِينَ',
        highlightedDifference: 'ادْخُلُوا ... رَغَدًا ... خَطَايَاكُمْ ... وَسَنَزِيدُ',
        contextExplanation: 'سورة البقرة بُنيت على التكريم والإنعام فجاء لفظ (رغداً)، وبصيغة التعظيم (نغفر) وبالواو (وسنزيد المحسنين).',
        contextExplanationEn: 'Al-Baqarah emphasizes divine grace and bounties ("freely"), using plural majesty ("We shall forgive").',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة البقرة (آية 58)'
      },
      {
        surahNumber: 7,
        surahName: 'الأعراف',
        ayahNumber: 161,
        verseText: 'وَإِذْ قِيلَ لَهُمُ اسْكُنُوا هَٰذِهِ الْقَرْيَةَ وَكُلُوا مِنْهَا حَيْثُ شِئْتُمْ وَقُولُوا حِطَّةٌ وَادْخُلُوا الْبَابَ سُجَّدًا نَّغْفِرْ لَكُمْ خَطِيئَاتِكُمْ ۚ سَنَزِيدُ الْمُحْسِنِينَ',
        highlightedDifference: 'اسْكُنُوا ... خَطِيئَاتِكُمْ ... سَنَزِيدُ',
        contextExplanation: 'سورة الأعراف جاءت في سياق العرض التاريخي لمواقف بني إسرائيل وإسكانهم الأرض دون ذكر (رغداً) وجمع المؤنث (خطيئاتكم).',
        contextExplanationEn: 'Al-A\'raf presents historical narrative regarding Israelite settlement, using "Dwell" and omitting "freely".',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الأعراف (آية 161)'
      }
    ]
  },
  {
    id: 'la_tajzi_nafsun',
    topicAr: 'وَاتَّقُوا يَوْمًا لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا (البقرة 48 مقابل 123)',
    topicEn: 'And fear a Day when no soul will suffice for another soul at all...',
    summaryRuleAr: 'قاعدة: في الموضع الأول (البقرة 48) قُدّمت الشفاعة مع (يُقْبَلُ): (وَلَا يُقْبَلُ مِنْهَا شَفَاعَةٌ وَلَا يُؤْخَذُ مِنْهَا عَدْلٌ). وفي الموضع الثاني (البقرة 123) قُدّم العدل مع (يُقْبَلُ): (وَلَا يُقْبَلُ مِنْهَا عَدْلٌ وَلَا تَنفَعُهَا شَفَاعَةٌ).',
    summaryRuleEn: 'Golden Rule: In verse 48, "intercession" comes first with "accepted". In verse 123, "ransom/compensation" comes first with "accepted", while intercession uses "benefits".',
    verses: [
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 48,
        verseText: 'وَاتَّقُوا يَوْمًا لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا وَلَا يُقْبَلُ مِنْهَا شَفَاعَةٌ وَلَا يُؤْخَذُ مِنْهَا عَدْلٌ وَلَا هُمْ يُنصَرُونَ',
        highlightedDifference: 'وَلَا يُقْبَلُ مِنْهَا شَفَاعَةٌ وَلَا يُؤْخَذُ مِنْهَا عَدْلٌ',
        contextExplanation: 'بدأ بنفي الشفاعة التي كان بنو إسرائيل يتكلون عليها من آبائهم الأنبياء، ثم ثنى بنفي الفدية والعدل.',
        contextExplanationEn: 'Refutes false reliance on ancestral intercession first, followed by monetary ransom.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة البقرة (آية 48)'
      },
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 123,
        verseText: 'وَاتَّقُوا يَوْمًا لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا وَلَا يُقْبَلُ مِنْهَا عَدْلٌ وَلَا تَنفَعُهَا شَفَاعَةٌ وَلَا هُمْ يُنصَرُونَ',
        highlightedDifference: 'وَلَا يُقْبَلُ مِنْهَا عَدْلٌ وَلَا تَنفَعُهَا شَفَاعَةٌ',
        contextExplanation: 'بدأ بنفي الفدية والعدل لأن الإنسان في الشدة يبذل ماله وفداءه أولاً، فإن لم يُقبل طلب شفاعة الشفعاء.',
        contextExplanationEn: 'Starts with ransom rejection because in distress a person offers wealth first, then seeks intercession.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة البقرة (آية 123)'
      }
    ]
  },
  {
    id: 'uthkuroo_ni_mati',
    topicAr: 'يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ',
    topicEn: 'O Children of Israel, remember My favor which I have bestowed upon you...',
    summaryRuleAr: 'قاعدة: تكرر هذا النداء ثلاث مرات في البقرة: الأولى (40) أردفت بالعهد والرهبة (وَأَوْفُوا بِعَهْدِي ... وَإِيَّايَ فَارْهَبُونِ)، والثانية (47) والثالثة (122) أردفتا بالتفضيل (وَأَنِّي فَضَّلْتُكُمْ عَلَى الْعَالَمِينَ).',
    summaryRuleEn: 'Golden Rule: Thrice in Al-Baqarah: v40 ends with Covenant and Awe, while v47 and v122 end with Divine Favor over all worlds.',
    verses: [
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 40,
        verseText: 'يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ وَأَوْفُوا بِعَهْدِي أُوفِ بِعَهْدِكُمْ وَإِيَّايَ فَارْهَبُونِ',
        highlightedDifference: 'وَأَوْفُوا بِعَهْدِي أُوفِ بِعَهْدِكُمْ وَإِيَّايَ فَارْهَبُونِ',
        contextExplanation: 'افتتاح نداءات بني إسرائيل في السورة بتذكيرهم بالميثاق الأول والتقوى والرهبة من نقضه.',
        contextExplanationEn: 'First call commanding fulfillment of the ancient covenant and reverent fear.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة البقرة (آية 40)'
      },
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 47,
        verseText: 'يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ وَأَنِّي فَضَّلْتُكُمْ عَلَى الْعَالَمِينَ',
        highlightedDifference: 'وَأَنِّي فَضَّلْتُكُمْ عَلَى الْعَالَمِينَ',
        contextExplanation: 'تذكيرهم بتفضيل آبائهم على عالمي زمانهم بالرسالات والمن والسلوى لإلزامهم بالإيمان بمحمد ﷺ.',
        contextExplanationEn: 'Reminder of divine precedence given to their ancestors with scriptures and miracles.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة البقرة (آية 47)'
      },
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 122,
        verseText: 'يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ وَأَنِّي فَضَّلْتُكُمْ عَلَى الْعَالَمِينَ',
        highlightedDifference: 'وَأَنِّي فَضَّلْتُكُمْ عَلَى الْعَالَمِينَ (ختام المحاجة)',
        contextExplanation: 'إعادة نفس اللفظ ختاماً لمحاجة أهل الكتاب قبل الانتقال إلى قصة بناء الكعبة وإمامة إبراهيم عليه السلام.',
        contextExplanationEn: 'Final recurrence concluding the discourse before introducing the Abrahamic covenant and the Kaaba.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة البقرة (آية 122)'
      }
    ]
  },
  {
    id: 'tilka_ummatun_khalat',
    topicAr: 'تِلْكَ أُمَّةٌ قَدْ خَلَتْ لَهَا مَا كَسَبَتْ وَلَكُم مَّا كَسَبْتُمْ',
    topicEn: 'That was a nation which has passed on...',
    summaryRuleAr: 'قاعدة: آيتان متطابقتان تماماً في سورة البقرة (134 و141): الأولى جاءت بعد ذكر وصية يعقوب وبنيه، والثانية جاءت بعد رد دعوى أن الأنبياء كانوا هوداً أو نصارى.',
    summaryRuleEn: 'Golden Rule: Identical twin verses in Al-Baqarah (134 and 141), cutting off false lineage entitlement.',
    verses: [
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 134,
        verseText: 'تِلْكَ أُمَّةٌ قَدْ خَلَتْ ۖ لَهَا مَا كَسَبَتْ وَلَكُم مَّا كَسَبْتُمْ ۖ وَلَا تُسْأَلُونَ عَمَّا كَانُوا يَعْمَلُونَ',
        highlightedDifference: 'الموضع الأول (بعد وصية يعقوب)',
        contextExplanation: 'رد على من زعم النجاة بصلاح آبائه الأنبياء، فقرر أن النجاة بالعمل الصالح لا بالانتساب.',
        contextExplanationEn: 'Refuting reliance on ancestral righteousness; accountability rests on individual deeds.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة البقرة (آية 134)'
      },
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 141,
        verseText: 'تِلْكَ أُمَّةٌ قَدْ خَلَتْ ۖ لَهَا مَا كَسَبَتْ وَلَكُم مَّا كَسَبْتُمْ ۖ وَلَا تُسْأَلُونَ عَمَّا كَانُوا يَعْمَلُونَ',
        highlightedDifference: 'الموضع الثاني (بعد رد دعوى اليهودية والنصرانية)',
        contextExplanation: 'تأكيد الرد بعد إبطال مقولة أن إبراهيم وإسماعيل وإسحاق ويعقوب كانوا هوداً أو نصارى.',
        contextExplanationEn: 'Reiterating individual responsibility following rebuttal that prophets were Jewish or Christian.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة البقرة (آية 141)'
      }
    ]
  },
  {
    id: 'allatheena_aamanoo_hadu',
    topicAr: 'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَىٰ وَالصَّابِئِينَ',
    topicEn: 'Indeed, those who believed and those who were Jews or Christians or Sabeans...',
    summaryRuleAr: 'قاعدة: في البقرة (62) والحج (17) جاءت (وَالصَّابِئِينَ) بالياء منصوبة، وفي المائدة (69) جاءت (وَالصَّابِئُونَ) بالواو مرفوعة على الابتداء وقُدّمت على النصارى.',
    summaryRuleEn: 'Golden Rule: In Al-Baqarah (62) and Al-Hajj (17), "Sabeans" is in the accusative (ending in -yeen). In Al-Ma\'idah (69), it appears in the nominative (ending in -oon) for rhetorical emphasis.',
    verses: [
      {
        surahNumber: 2,
        surahName: 'البقرة',
        ayahNumber: 62,
        verseText: 'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَىٰ وَالصَّابِئِينَ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَعَمِلَ صَالِحًا فَلَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
        highlightedDifference: 'وَالنَّصَارَىٰ وَالصَّابِئِينَ',
        contextExplanation: 'نصبت معطوفة على اسم إن، وأخّرت الصابئين بعد النصارى لكونهم أبعد ملة من أهل الكتاب.',
        contextExplanationEn: 'Sabeans comes after Christians and is grammatically in the accusative.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة البقرة (آية 62)'
      },
      {
        surahNumber: 5,
        surahName: 'المائدة',
        ayahNumber: 69,
        verseText: 'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالصَّابِئُونَ وَالنَّصَارَىٰ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَعَمِلَ صَالِحًا فَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
        highlightedDifference: 'وَالصَّابِئُونَ وَالنَّصَارَىٰ',
        contextExplanation: 'رُفعت بالواو على الابتداء وقُدمت لبيان أن الصابئين مع عظيم ضلالهم وعبادتهم الكواكب إن آمنوا وعملوا صالحاً فلا خوف عليهم.',
        contextExplanationEn: 'Nominative case used rhetorically to prove that even Sabeans, despite astral veneration, are accepted if they truly believe.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة المائدة (آية 69)'
      },
      {
        surahNumber: 22,
        surahName: 'الحج',
        ayahNumber: 17,
        verseText: 'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالصَّابِئِينَ وَالنَّصَارَىٰ وَالْمَجُوسَ وَالَّذِينَ أَشْرَكُوا إِنَّ اللَّهَ يَفْصِلُ بَيْنَهُمْ يَوْمَ الْقِيَامَةِ ۚ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ شَهِيدٌ',
        highlightedDifference: 'وَالصَّابِئِينَ وَالنَّصَارَىٰ وَالْمَجُوسَ وَالَّذِينَ أَشْرَكُوا',
        contextExplanation: 'ذكرت ست ملل وقُدم الصابئون على النصارى ونصبت بالياء وختمت بالفصل يوم القيامة.',
        contextExplanationEn: 'Enlists six religious groups with divine judgment to adjudicate on the Day of Resurrection.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الحج (آية 17)'
      }
    ]
  },
  {
    id: 'wa_in_tauddoo_nimatallahi',
    topicAr: 'وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا',
    topicEn: 'And if you should count the favor of Allah, you could not enumerate it...',
    summaryRuleAr: 'قاعدة: في إبراهيم (34) خُتمت بصفة الإنسان: (إِنَّ الْإِنسَانَ لَظَلُومٌ كَفَّارٌ)، وفي النحل (18) خُتمت بصفة الرب جل جلاله: (إِنَّ اللَّهَ لَغَفُورٌ رَّحِيمٌ).',
    summaryRuleEn: 'Golden Rule: In Surah Ibrahim it concludes focusing on man\'s ingratitude ("man is unjust and ungrateful"), while in An-Nahl it concludes focusing on divine mercy ("Allah is Forgiving and Merciful").',
    verses: [
      {
        surahNumber: 14,
        surahName: 'إبراهيم',
        ayahNumber: 34,
        verseText: 'وَآتَاكُم مِّن كُلِّ مَا سَأَلْتُمُوهُ ۚ وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا ۗ إِنَّ الْإِنسَانَ لَظَلُومٌ كَفَّارٌ',
        highlightedDifference: 'إِنَّ الْإِنسَانَ لَظَلُومٌ كَفَّارٌ',
        contextExplanation: 'في سياق كفران المشركين بنعمة الله وتبديلهم نعمة الله كفراً فناظر ختام الآية حالهم.',
        contextExplanationEn: 'Reflects human shortcoming and ingratitude when gifted bounties.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة إبراهيم (آية 34)'
      },
      {
        surahNumber: 16,
        surahName: 'النحل',
        ayahNumber: 18,
        verseText: 'وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا ۗ إِنَّ اللَّهَ لَغَفُورٌ رَّحِيمٌ',
        highlightedDifference: 'إِنَّ اللَّهَ لَغَفُورٌ رَّحِيمٌ',
        contextExplanation: 'سورة النحل سورة النعم، فختم الآية ببيان سعة مغفرة الله ورحمته بعباده وإفضاله عليهم رغم عجزهم عن شكر النعم.',
        contextExplanationEn: 'An-Nahl is known as the chapter of bounties; concluding with divine forgiveness and compassion.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة النحل (آية 18)'
      }
    ]
  },
  {
    id: 'qul_ateeu_allaha',
    topicAr: 'أَطِيعُوا اللَّهَ وَالرَّسُولَ / وَأَطِيعُوا الرَّسُولَ',
    topicEn: 'Obey Allah and the Messenger...',
    summaryRuleAr: 'قاعدة: في آل عمران (32) جاءت دون تكرار الفعل: (أَطِيعُوا اللَّهَ وَالرَّسُولَ)، بينما في النساء (59) والمائدة (92) والنور (54) ومحمد (33) والتغابن (12) كُرر الفعل: (وَأَطِيعُوا الرَّسُولَ).',
    summaryRuleEn: 'Golden Rule: Aal-Imran uses "Obey Allah and the Messenger" without repeating the verb, while other chapters repeat "and obey the Messenger" explicitly.',
    verses: [
      {
        surahNumber: 3,
        surahName: 'آل عمران',
        ayahNumber: 32,
        verseText: 'قُلْ أَطِيعُوا اللَّهَ وَالرَّسُولَ ۖ فَإِن تَوَلَّوْا فَإِنَّ اللَّهَ لَا يُحِبُّ الْكَافِرِينَ',
        highlightedDifference: 'أَطِيعُوا اللَّهَ وَالرَّسُولَ (دون تكرار فعل أطيعوا)',
        contextExplanation: 'جمع بين اسم الله ورسوله في فعل طاعة واحد لبيان أن طاعة الرسول هي عين طاعة الله.',
        contextExplanationEn: 'Single verb governs both to denote undivided obedience.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة آل عمران (آية 32)'
      },
      {
        surahNumber: 4,
        surahName: 'النساء',
        ayahNumber: 59,
        verseText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ',
        highlightedDifference: 'وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ',
        contextExplanation: 'تكرار فعل الطاعة للرسول استقلالاً بحجية سنته الشريفة، ولم يكرر لأولي الأمر لبيان أن طاعتهم تابعة.',
        contextExplanationEn: 'Reiteration of the verb for the Messenger implies independent authority of the Sunnah.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة النساء (آية 59)'
      },
      {
        surahNumber: 5,
        surahName: 'المائدة',
        ayahNumber: 92,
        verseText: 'وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَاحْذَرُوا ۚ فَإِن تَوَلَّيْتُمْ فَاعْلَمُوا أَنَّمَا عَلَىٰ رَسُولِنَا الْبَلَاغُ الْمُبِينُ',
        highlightedDifference: 'وَاحْذَرُوا ۚ فَإِن تَوَلَّيْتُمْ',
        contextExplanation: 'اقترنت بالأمر بالحذر بعد تشريع تحريم الخمر والميسر والأزلام صيانة للمجتمع المسلم.',
        contextExplanationEn: 'Coupled with caution following prohibitions of intoxicants and gambling.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة المائدة (آية 92)'
      },
      {
        surahNumber: 24,
        surahName: 'النور',
        ayahNumber: 54,
        verseText: 'قُلْ أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ ۖ فَإِن تَوَلَّوْا فَإِنَّمَا عَلَيْهِ مَا حُمِّلَ وَعَلَيْكُم مَّا حُمِّلْتُمْ',
        highlightedDifference: 'فَإِن تَوَلَّوْا فَإِنَّمَا عَلَيْهِ مَا حُمِّلَ',
        contextExplanation: 'في سياق الاستجابة لحكم الله ورسوله والرد على ادعاءات المنافقين.',
        contextExplanationEn: 'In context of obedience to prophetic judgment versus hypocritical excuses.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة النور (آية 54)'
      }
    ]
  },
  {
    id: 'yusabbihu_lillahi',
    topicAr: 'سَبَّحَ لِلَّهِ / يُسَبِّحُ لِلَّهِ (فواتح سور المسبحات)',
    topicEn: 'Glorifies Allah... (Past vs. Present tense openings)',
    summaryRuleAr: 'قاعدة سور المسبحات: الثلاث الأولى بالماضي: (الحديد، الحشر، الصف)، واللتان بعدها بالمضارع: (الجمعة، التغابن)، وسبقتها الإسراء بالمصدر (سُبْحَانَ)، وختمت بالأمر في الأعلى (سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى).',
    summaryRuleEn: 'Golden Rule for the Glorification Chapters: Past tense for Hadid, Hashr, Saff; Present tense for Jumu\'ah, Taghabun; Infinitive for Isra, and Imperative for A\'la.',
    verses: [
      {
        surahNumber: 57,
        surahName: 'الحديد',
        ayahNumber: 1,
        verseText: 'سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ',
        highlightedDifference: 'سَبَّحَ (بالماضي) ... وَالْأَرْضِ (دون تكرار ما)',
        contextExplanation: 'صيغة الماضي تفيد ثبوت التسبيح واستقراره في الأزل، ولم تكرر (ما) في الأرض.',
        contextExplanationEn: 'Past tense conveys primordial and eternal glorification.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الحديد (آية 1)'
      },
      {
        surahNumber: 59,
        surahName: 'الحشر',
        ayahNumber: 1,
        verseText: 'سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ',
        highlightedDifference: 'سَبَّحَ (بالماضي) ... وَمَا فِي الْأَرْضِ (بتكرار ما)',
        contextExplanation: 'تكرار الموصول (ما في السموات وما في الأرض) لمزيد العناية والتوكيد قبل ذكر إجلاء بني النضير.',
        contextExplanationEn: 'Reiteration of "whatever is in the earth" reinforces universal submission.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الحشر (آية 1)'
      },
      {
        surahNumber: 61,
        surahName: 'الصف',
        ayahNumber: 1,
        verseText: 'سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ',
        highlightedDifference: 'سَبَّحَ (بالماضي)',
        contextExplanation: 'تكرار نفس افتتاحية الحشر تمهيداً للدعوة إلى الثبات في الصف والجهاد.',
        contextExplanationEn: 'Opening matches Al-Hashr before commanding steadfastness.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الصف (آية 1)'
      },
      {
        surahNumber: 62,
        surahName: 'الجمعة',
        ayahNumber: 1,
        verseText: 'يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ الْمَلِكِ الْقُدُّوسِ الْعَزِيزِ الْحَكِيمِ',
        highlightedDifference: 'يُسَبِّحُ (بالمضارع) ... الْمَلِكِ الْقُدُّوسِ',
        contextExplanation: 'صيغة المضارع تفيد استمرار التسبيح وتجدده في كل آن وحين، وإضافة الملك القدوس.',
        contextExplanationEn: 'Present tense signifies ongoing, perpetual glorification across time.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة الجمعة (آية 1)'
      },
      {
        surahNumber: 64,
        surahName: 'التغابن',
        ayahNumber: 1,
        verseText: 'يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۖ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ ۖ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        highlightedDifference: 'يُسَبِّحُ (بالمضارع) ... لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ',
        contextExplanation: 'بالمضارع أيضاً وأردفت بإثبات الملك والحمد المطلق والقدرة التامة لله تعالى.',
        contextExplanationEn: 'Affirms ongoing glorification coupled with sovereignty and all praise.',
        matchType: 'classical',
        matchTypeDesc: 'موضع سورة التغابن (آية 1)'
      }
    ]
  }
];

export const MUTASHABIHAT_GROUPS = CLASSICAL_MUTASHABIHAT_GROUPS;

/**
 * بنية الفهرس السريع لكافة آيات القرآن الكريم (6236 آية)
 */
interface IndexedAyah {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  juz: number;
  page: number;
  verseText: string;
  clean: string;
  words: string[];
}

let cachedAllAyahs: IndexedAyah[] | null = null;
let cachedTrigramIndex: Map<string, IndexedAyah[]> | null = null;
let cachedBigramIndex: Map<string, IndexedAyah[]> | null = null;
let cachedExactMap: Map<string, IndexedAyah[]> | null = null;

function ensureConcordanceIndex(): {
  allAyahs: IndexedAyah[];
  trigramIndex: Map<string, IndexedAyah[]>;
  bigramIndex: Map<string, IndexedAyah[]>;
  exactMap: Map<string, IndexedAyah[]>;
} {
  if (cachedAllAyahs && cachedTrigramIndex && cachedBigramIndex && cachedExactMap) {
    return {
      allAyahs: cachedAllAyahs,
      trigramIndex: cachedTrigramIndex,
      bigramIndex: cachedBigramIndex,
      exactMap: cachedExactMap
    };
  }

  const allAyahs: IndexedAyah[] = [];
  const trigramIndex = new Map<string, IndexedAyah[]>();
  const bigramIndex = new Map<string, IndexedAyah[]>();
  const exactMap = new Map<string, IndexedAyah[]>();

  const surahs = quranData?.surahs || [];
  for (const s of surahs) {
    const sNum = s.number;
    const sName = (s.name || '').replace(/سُورَةُ\s*/g, '').trim();

    for (const a of s.ayahs) {
      const aNum = a.numberInSurah;
      const text = a.text;
      const clean = cleanQuranText(text, sNum, aNum);
      const words = clean.split(' ').filter(Boolean);

      const item: IndexedAyah = {
        surahNumber: sNum,
        surahName: sName,
        ayahNumber: aNum,
        juz: a.juz || 1,
        page: a.page || 1,
        verseText: text,
        clean,
        words
      };

      allAyahs.push(item);

      // 1. Exact string indexing
      let exactList = exactMap.get(clean);
      if (!exactList) {
        exactList = [];
        exactMap.set(clean, exactList);
      }
      exactList.push(item);

      // 2. Trigrams (3 consecutive words)
      for (let i = 0; i <= words.length - 3; i++) {
        const tri = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        let list = trigramIndex.get(tri);
        if (!list) {
          list = [];
          trigramIndex.set(tri, list);
        }
        list.push(item);
      }

      // 3. Bigrams (2 consecutive words) for short verses and key phrases
      if (words.length <= 5) {
        for (let i = 0; i <= words.length - 2; i++) {
          const bi = `${words[i]} ${words[i + 1]}`;
          let list = bigramIndex.get(bi);
          if (!list) {
            list = [];
            bigramIndex.set(bi, list);
          }
          list.push(item);
        }
      }
    }
  }

  cachedAllAyahs = allAyahs;
  cachedTrigramIndex = trigramIndex;
  cachedBigramIndex = bigramIndex;
  cachedExactMap = exactMap;

  return { allAyahs, trigramIndex, bigramIndex, exactMap };
}

/**
 * المحرك الرئيسي والذكي لاستخراج المتشابهات اللفظية الحقيقية لأي آية من القرآن الكريم
 */
export function getMutashabihatForAyah(
  surahNumber: number,
  ayahNumber: number,
  passedVerseText?: string
): MutashabihGroup {
  const { allAyahs, trigramIndex, bigramIndex, exactMap } = ensureConcordanceIndex();

  // 1. أولاً: فحص ما إذا كانت الآية تنتمي لإحدى المجموعات التراثية الكبرى المحققة
  const classical = CLASSICAL_MUTASHABIHAT_GROUPS.find(g =>
    g.verses.some(v => v.surahNumber === surahNumber && v.ayahNumber === ayahNumber)
  );

  // البحث عن الآية المستهدفة في المصحف
  let target = allAyahs.find(x => x.surahNumber === surahNumber && x.ayahNumber === ayahNumber);
  if (!target) {
    const text = passedVerseText || '';
    const clean = cleanQuranText(text, surahNumber, ayahNumber);
    target = {
      surahNumber,
      surahName: `سورة ${surahNumber}`,
      ayahNumber,
      juz: 1,
      page: 1,
      verseText: text,
      clean,
      words: clean.split(' ').filter(Boolean)
    };
  }

  const targetWords = target.words;
  const targetLen = targetWords.length;
  const targetClean = target.clean;

  // 2. البحث الحي في فهرس المصحف الشريف كاملاً (Dynamic Quran Concordance Engine)
  const candidateMap = new Map<string, IndexedAyah>();

  // أ. التطابق التام في نص الآية (مثل فبأي آلاء ربكما تكذبان، ويل يومئذ للمكذبين، الم...)
  const exacts = exactMap.get(targetClean) || [];
  for (const ex of exacts) {
    if (ex.surahNumber === surahNumber && ex.ayahNumber === ayahNumber) continue;
    candidateMap.set(`${ex.surahNumber}:${ex.ayahNumber}`, ex);
  }

  // ب. استعلام المقاطع الثلاثية (Trigrams)
  for (let i = 0; i <= targetLen - 3; i++) {
    const tri = `${targetWords[i]} ${targetWords[i + 1]} ${targetWords[i + 2]}`;
    const matched = trigramIndex.get(tri) || [];
    for (const m of matched) {
      if (m.surahNumber === surahNumber && m.ayahNumber === ayahNumber) continue;
      candidateMap.set(`${m.surahNumber}:${m.ayahNumber}`, m);
    }
  }

  // ج. للآيات القصيرة (أقل من 5 كلمات) استعلام المقاطع الثنائية
  if (targetLen <= 4) {
    for (let i = 0; i <= targetLen - 2; i++) {
      const bi = `${targetWords[i]} ${targetWords[i + 1]}`;
      const matched = bigramIndex.get(bi) || [];
      for (const m of matched) {
        if (m.surahNumber === surahNumber && m.ayahNumber === ayahNumber) continue;
        candidateMap.set(`${m.surahNumber}:${m.ayahNumber}`, m);
      }
    }
  }

  // تقييم وتحليل درجات التشابه ومواضع التماثل والفروق
  const evaluatedMatches: MutashabihVerse[] = [];

  for (const candidate of candidateMap.values()) {
    const cClean = candidate.clean;
    const cWords = candidate.words;
    const cLen = cWords.length;

    // تطابق تام بنسبة 100%
    if (cClean === targetClean) {
      evaluatedMatches.push({
        surahNumber: candidate.surahNumber,
        surahName: candidate.surahName,
        ayahNumber: candidate.ayahNumber,
        verseText: candidate.verseText,
        juz: candidate.juz,
        page: candidate.page,
        matchType: 'exact',
        matchTypeDesc: 'تطابق تام في نص الآية بالكامل',
        matchedPhrase: targetClean,
        highlightedDifference: 'تطابق تام في كامل ألفاظ الآية الكريمة',
        contextExplanation: `تكررت هذه الآية الكريمة بنفس النظم التام في سورة ${candidate.surahName} (آية ${candidate.ayahNumber}) لتقرير المعنى وترسيخه.`,
        score: 1000
      });
      continue;
    }

    // حساب التشابه في مطلع الآية (Opening Match)
    let startMatch = 0;
    const maxStart = Math.min(targetLen, cLen);
    for (let i = 0; i < maxStart; i++) {
      if (targetWords[i] === cWords[i]) startMatch++;
      else break;
    }

    // حساب التشابه في خاتمة وفاصلة الآية (Ending Match)
    let endMatch = 0;
    for (let i = 1; i <= maxStart; i++) {
      if (targetWords[targetLen - i] === cWords[cLen - i]) endMatch++;
      else break;
    }

    // حساب أطول مقطع متصل مشترك (Longest Common Contiguous Subphrase)
    let maxNgram = 0;
    let matchedNgram = '';
    const minNgram = targetLen <= 4 ? 2 : 3;

    for (let len = targetLen; len >= minNgram; len--) {
      let found = false;
      for (let i = 0; i <= targetLen - len; i++) {
        const sub = targetWords.slice(i, i + len).join(' ');
        if (candidate.clean.includes(sub)) {
          maxNgram = len;
          matchedNgram = sub;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // التحقق من الجدارة العلمية للتشابه اللفظي
    const isSignificant =
      startMatch >= 3 ||
      endMatch >= 3 ||
      maxNgram >= 3 ||
      (targetLen <= 4 && (startMatch >= 2 || endMatch >= 2 || maxNgram >= 2));

    if (isSignificant) {
      let score = 0;
      let matchType: 'start' | 'end' | 'phrase' = 'phrase';
      let matchTypeDesc = '';
      let matchedPhrase = matchedNgram;

      if (startMatch >= 3 || (startMatch >= 2 && targetLen <= 5)) {
        matchType = 'start';
        score = startMatch * 20;
        matchTypeDesc = `تشابه في مطلع الآية (${startMatch} كلمات)`;
        matchedPhrase = targetWords.slice(0, startMatch).join(' ');
      } else if (endMatch >= 3 || (endMatch >= 2 && targetLen <= 5)) {
        matchType = 'end';
        score = endMatch * 18;
        matchTypeDesc = `تشابه في خاتمة وفاصلة الآية (${endMatch} كلمات)`;
        matchedPhrase = targetWords.slice(-endMatch).join(' ');
      } else {
        matchType = 'phrase';
        score = maxNgram * 12;
        matchTypeDesc = `مقطع مشترك متطابق (${maxNgram} كلمات)`;
      }

      // إضافة نسبة المفردات المشتركة
      const sharedWordsCount = targetWords.filter(w => cWords.includes(w)).length;
      score += Math.round((sharedWordsCount / Math.max(targetLen, cLen)) * 30);

      // صياغة بيان الفارق اللفظي
      let highlightedDiff = '';
      if (matchType === 'end') {
        highlightedDiff = `الاتفاق في فاصلة: «${matchedPhrase}»`;
      } else if (matchType === 'start') {
        highlightedDiff = `الاتفاق في مطلع: «${matchedPhrase}»`;
      } else {
        highlightedDiff = `موضع التقارب في عبارة: «${matchedPhrase}»`;
      }

      const explanation = `موضع نظير ومشترك مع سورة ${candidate.surahName} (آية ${candidate.ayahNumber}) في النظم والتركيب القرآني.`;

      evaluatedMatches.push({
        surahNumber: candidate.surahNumber,
        surahName: candidate.surahName,
        ayahNumber: candidate.ayahNumber,
        verseText: candidate.verseText,
        juz: candidate.juz,
        page: candidate.page,
        matchType,
        matchTypeDesc,
        matchedPhrase,
        highlightedDifference: highlightedDiff,
        contextExplanation: explanation,
        score
      });
    }
  }

  // ترتيب النتائج حسب قوة التشابه وتناسبها
  evaluatedMatches.sort((a, b) => (b.score || 0) - (a.score || 0));

  // إذا كانت الآية تنتمي لمجموعة تراثية محققة، ندمج معلوماتها الثرية
  if (classical) {
    // دمج الآيات المستكشفة مع الآيات التراثية لضمان الشمول
    const mergedVerses = [...classical.verses];
    for (const em of evaluatedMatches) {
      if (!mergedVerses.some(v => v.surahNumber === em.surahNumber && v.ayahNumber === em.ayahNumber)) {
        mergedVerses.push(em);
      }
    }

    return {
      id: classical.id,
      topicAr: classical.topicAr,
      topicEn: classical.topicEn,
      summaryRuleAr: classical.summaryRuleAr,
      summaryRuleEn: classical.summaryRuleEn,
      verses: mergedVerses
    };
  }

  // إذا لم تكن مسجلة في التراث ولكن محرك البحث وجد نظائر حقيقية في المصحف:
  if (evaluatedMatches.length > 0) {
    const topMatch = evaluatedMatches[0];
    const sharedPhrase = topMatch.matchedPhrase || targetWords.slice(0, 3).join(' ');
    const surahNames = Array.from(new Set(evaluatedMatches.slice(0, 4).map(m => m.surahName))).join('، ');

    const topicAr = `المتشابهات اللفظية للآية («${sharedPhrase}»)`;
    const summaryRuleAr = `قاعدة الضبط: ورد هذا المقطع المشترك «${sharedPhrase}» في (${evaluatedMatches.length}) مواضع من القرآن الكريم (في سور: ${surahNames})، وتتفق في العبارة وتتمايز بحسب السياق ودلالة الخاتمة.`;

    return {
      id: `dynamic_${surahNumber}_${ayahNumber}`,
      topicAr,
      topicEn: `Ayah Verbal Concordance (${topMatch.matchedPhrase || ''})`,
      summaryRuleAr,
      summaryRuleEn: `Concordance: Found ${evaluatedMatches.length} matching occurrences across the Holy Quran.`,
      verses: evaluatedMatches
    };
  }

  // إذا كانت الآية فريدة اللفظ والنظم ولم يتكرر تركيبها (آية فريدة في القرآن الكريم)
  return {
    id: `unique_${surahNumber}_${ayahNumber}`,
    topicAr: `موضع فريد في النظم القرآني الكريم`,
    topicEn: 'Unique Eloquent Quranic Expression',
    isUniqueAyah: true,
    summaryRuleAr: `هذه الآية الكريمة موضع فريد في كتاب الله تعالى؛ لم يتكرر نظمها وتركيب ألفاظها بهذا التتابع في سائر سور القرآن الكريم، وهو من دلائل إعجاز النظم وبلاغة السياق القرآني الخاص بسورة ${target.surahName}.`,
    summaryRuleEn: 'This noble verse is uniquely composed in the Quranic corpus; its specific phrasing sequence is not repeated elsewhere, demonstrating context-specific eloquence.',
    verses: [
      {
        surahNumber: target.surahNumber,
        surahName: target.surahName,
        ayahNumber: target.ayahNumber,
        verseText: target.verseText,
        juz: target.juz,
        page: target.page,
        matchType: 'exact',
        matchTypeDesc: 'موضع فريد لا نظير للفظه',
        highlightedDifference: 'نظم فريد متكامل',
        contextExplanation: `انفردت سورة ${target.surahName} (آية ${target.ayahNumber}) بهذه الصياغة القرآنية الشريفة.`
      }
    ]
  };
}
