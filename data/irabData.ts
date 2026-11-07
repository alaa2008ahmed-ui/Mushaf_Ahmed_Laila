// إعراب القرآن الكريم وبيانه النحوي والتراكيب اللغوية
export interface WordSyntax {
  word: string;
  pos: string; // جزء الكلام (اسم، فعل، حرف)
  posEn?: string;
  grammarAr: string; // الإعراب التفصيلي للكلمة
  grammarEn?: string;
}

export interface AyahSyntaxEntry {
  surahNumber: number;
  ayahNumber: number;
  overallStructureAr: string; // الإعراب العام للجملة والتراكيب
  overallStructureEn?: string;
  rhetoricalInsightAr: string; // بلاغة الإعراب والسر النحوي
  rhetoricalInsightEn?: string;
  words: WordSyntax[];
}

export const IRAB_DATABASE: Record<string, AyahSyntaxEntry> = {
  // الفاتحة - الآية 1
  '1:1': {
    surahNumber: 1,
    ayahNumber: 1,
    overallStructureAr: 'شبه الجملة (بِسْمِ) متعلق بمحذوف تقديره فعل مؤخر خاص بالسياق (أقرأُ أو أبدأُ). وحذف الفعل لتعظيم اسم الله وتقديم البركة.',
    overallStructureEn: 'The prepositional phrase (Bi-ismi) relates to an omitted context-specific verb ("I begin/recite in the name of Allah"). Omission honors Allah\'s name and prioritizes blessing.',
    rhetoricalInsightAr: 'تقديم الجار والمجرور (باسم الله) يفيد الحصر والقصر؛ أي: لا أبدأ إلا باسم الله تبركاً وتعظيماً.',
    rhetoricalInsightEn: 'Fronting the prepositional phrase ("In the name of Allah") signifies exclusivity; I begin exclusively seeking Allah\'s blessing and honor.',
    words: [
      { word: 'بِـ', pos: 'حرف جر', posEn: 'Preposition', grammarAr: 'حرف جر مبني على الكسر لا محل له من الإعراب، يفيد الاستعانة والتبرك.', grammarEn: 'Preposition particle with kasrah, seeking divine aid and blessing.' },
      { word: 'اسْمِ', pos: 'اسم مجرور', posEn: 'Genitive Noun', grammarAr: 'اسم مجرور بالباء وعلامة جره الكسرة الظاهرة، وهو مضاف.', grammarEn: 'Genitive noun governed by Ba, ending in kasrah, in possessive construction.' },
      { word: 'اللَّهِ', pos: 'علم على الذات الإلهية', posEn: 'Proper Noun of Majesty', grammarAr: 'اسم الجلالة مضاف إليه مجرور وعلامة جره الكسرة الظاهرة للتعظيم.', grammarEn: 'The Proper Name of Divine Majesty, possessive genitive ending in kasrah.' },
      { word: 'الرَّحْمَٰنِ', pos: 'نعت أول', posEn: 'First Adjective', grammarAr: 'نعت أول لاسم الجلالة مجرور وعلامة جره الكسرة الظاهرة.', grammarEn: 'First divine attribute, genitive case with kasrah.' },
      { word: 'الرَّحِيمِ', pos: 'نعت ثانٍ', posEn: 'Second Adjective', grammarAr: 'نعت ثانٍ مجرور وعلامة جره الكسرة الظاهرة.', grammarEn: 'Second divine attribute, genitive case with kasrah.' }
    ]
  },
  // الفاتحة - الآية 2
  '1:2': {
    surahNumber: 1,
    ayahNumber: 2,
    overallStructureAr: 'جملة اسمية تفيد الثبوت والدوام. (الْحَمْدُ) مبتدأ مرفوع، و(لِلَّهِ) شبه جملة متعلق بخبر محذوف وجوباً تقديره كائن أو مستقر.',
    overallStructureEn: 'Nominal sentence denoting permanence. "Al-Hamdu" is the subject (Mubtada) in nominative case, and "Li-llahi" is the prepositional predicate (Khabar).',
    rhetoricalInsightAr: 'العدول عن الجملة الفعلية (نحمد الله) إلى الاسمية (الحمد لله) لإفادة استمرار الحمد وثبوته لله أزلاً وأبداً دون انقطاع.',
    rhetoricalInsightEn: 'Choosing the nominal structure ("Praise be to Allah") over the verbal ("We praise Allah") establishes eternal, uninterrupted praise to Allah.',
    words: [
      { word: 'الْحَمْدُ', pos: 'مبتدأ', posEn: 'Subject Noun', grammarAr: 'مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره، و(أل) للاستغراق أي استغراق جميع المحامد.', grammarEn: 'Subject in nominative case with dammah; "Al-" indicates total comprehensive praise.' },
      { word: 'لِـ', pos: 'حرف جر', posEn: 'Preposition', grammarAr: 'حرف جر مبني على الكسر يفيد الاستحقاق والاختصاص.', grammarEn: 'Preposition particle denoting absolute entitlement and exclusivity.' },
      { word: 'اللَّهِ', pos: 'لفظ الجلالة مجرور', posEn: 'Genitive Proper Name', grammarAr: 'اسم الجلالة مجرور باللام وعلامة جره الكسرة، وشبه الجملة في محل رفع خبر المبتدأ.', grammarEn: 'Divine Name governed by Li in genitive case; prepositional clause forms the predicate.' },
      { word: 'رَبِّ', pos: 'نعت أول', posEn: 'First Attribute', grammarAr: 'نعت لاسم الجلالة مجرور وعلامة جره الكسرة، وهو مضاف.', grammarEn: 'Attribute of Majesty in genitive case with kasrah, possessive ruler.' },
      { word: 'الْعَالَمِينَ', pos: 'مضاف إليه', posEn: 'Possessive Genitive', grammarAr: 'مضاف إليه مجرور وعلامة جره الياء لأنه ملحق بجمع المذكر السالم.', grammarEn: 'Possessive noun in genitive case with Ya as sound masculine plural.' }
    ]
  },
  // الفاتحة - الآية 5
  '1:5': {
    surahNumber: 1,
    ayahNumber: 5,
    overallStructureAr: 'جملتان فعليتان تعاطفتا. قُدِّم فيهما المفعول به المنفصل (إِيَّاكَ) على الفعلين (نَعْبُدُ) و(نَسْتَعِينُ).',
    overallStructureEn: 'Two coupled verbal clauses. The detached accusative pronoun "Iyyaka" is fronted before verbs "Na\'budu" and "Nasta\'een".',
    rhetoricalInsightAr: 'تقديم المعمول (إياك) يفيد الاختصاص؛ أي: نعبدك وحدك ولا نعبد غيرك، ونستعين بك وحدك ولا نستعين بسواك.',
    rhetoricalInsightEn: 'Fronting the direct object pronoun ("You alone") yields exclusive devotion: "You alone we worship, and You alone we ask for help."',
    words: [
      { word: 'إِيَّاكَ', pos: 'ضمير منفصل مفعول به', posEn: 'Detached Accusative Pronoun', grammarAr: 'ضمير منفصل مبني على الفتح في محل نصب مفعول به مقدّم وجوباً.', grammarEn: 'Detached accusative direct object pronoun, fronted for exclusivity.' },
      { word: 'نَعْبُدُ', pos: 'فعل مضارع', posEn: 'Imperfect Verb', grammarAr: 'فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة، والفاعل ضمير مستتر وجوباً تقديره نحن.', grammarEn: 'Present verb in nominative case with dammah; subject pronoun "We" is implied.' },
      { word: 'وَ', pos: 'حرف عطف', posEn: 'Conjunction Particle', grammarAr: 'حرف عطف مبني على الفتح يفيد مطلق الجمع.', grammarEn: 'Conjunction particle "And" linking clauses.' },
      { word: 'إِيَّاكَ', pos: 'ضمير منفصل مفعول به', posEn: 'Detached Accusative Pronoun', grammarAr: 'ضمير منفصل مبني على الفتح في محل نصب مفعول به مقدّم للفعل نستعين.', grammarEn: 'Detached accusative pronoun fronted for the second verb.' },
      { word: 'نَسْتَعِينُ', pos: 'فعل مضارع', posEn: 'Imperfect Verb', grammarAr: 'فعل مضارع مرفوع بالضمة، والفاعل ضمير مستتر وجوباً تقديره نحن.', grammarEn: 'Present verb in nominative case; subject pronoun "We" is implied.' }
    ]
  },
  // البقرة - الآية 255 (آية الكرسي)
  '2:255': {
    surahNumber: 2,
    ayahNumber: 255,
    overallStructureAr: 'افتُتحت باسم الجلالة مبتدأ، وتتابعت الأخبار في نسق مهيب يصف كمال الذات الإلهية وقيوميته المطلقة وعلمه الذي لا يحده حد.',
    overallStructureEn: 'Commences with the Divine Proper Name as subject, followed by a majestic sequence of divine attributes establishing absolute self-subsistence and omniscience.',
    rhetoricalInsightAr: 'تكرار النفي بـ (لا) لتنزيه الذات العلية عن كل سمات النقص والقصور البشري كالسنة والنوم والعجز.',
    rhetoricalInsightEn: 'Repeated negation with "La" purifies the Divine Nature from all human limitations, drowsiness, sleep, or incapacity.',
    words: [
      { word: 'اللَّهُ', pos: 'مبتدأ أول', posEn: 'Primary Subject', grammarAr: 'اسم الجلالة مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره للتعظيم.', grammarEn: 'Divine Proper Name, subject in nominative case with dammah.' },
      { word: 'لَا', pos: 'نافية للجنس', posEn: 'Categorical Negation Particle', grammarAr: 'حرف نفي يعمل عمل إن مبني على السكون.', grammarEn: 'Absolute categorical negation particle.' },
      { word: 'إِلَٰهَ', pos: 'اسم لا', posEn: 'Noun of Negation', grammarAr: 'اسم لا النافية للجنس مبني على الفتح في محل نصب، وخبرها محذوف تقديره (حق).', grammarEn: 'Noun of categorical negation in accusative case with fatha ("No deity worthy of worship").' },
      { word: 'إِلَّا', pos: 'أداة حصر', posEn: 'Exceptive Restriction Particle', grammarAr: 'أداة استثناء ملغاة تفيد الحصر والقصر.', grammarEn: 'Particle of restriction and exception.' },
      { word: 'هُوَ', pos: 'بدل', posEn: 'Appositive Pronoun', grammarAr: 'ضمير منفصل مبني على الفتح في محل رفع بدل من الضمير المستكن في الخبر المحذوف.', grammarEn: 'Third person pronoun in nominative apposition ("Except Him").' },
      { word: 'الْحَيُّ', pos: 'خبر ثانٍ', posEn: 'Divine Attribute / Predicate', grammarAr: 'خبر ثانٍ لاسم الجلالة مرفوع وعلامة رفعه الضمة الظاهرة.', grammarEn: 'The Ever-Living attribute in nominative case.' },
      { word: 'الْقَيُّومُ', pos: 'خبر ثالث', posEn: 'Divine Attribute / Predicate', grammarAr: 'خبر ثالث مرفوع وعلامة رفعه الضمة الظاهرة، صيغة مبالغة تفيد كمال القيام على خلقه تدبيراً ورزقاً.', grammarEn: 'The Sustainer of All, intensive predicate attribute in nominative case.' }
    ]
  },
  // الإخلاص - الآية 1
  '112:1': {
    surahNumber: 112,
    ayahNumber: 1,
    overallStructureAr: '(قُلْ) فعل أمر للتبليغ، وجملة (هُوَ اللَّهُ أَحَدٌ) في محل نصب مقول القول. (هُوَ) ضمير الشأن مبتدأ، و(اللَّهُ) مبتدأ ثانٍ و(أَحَدٌ) خبره.',
    overallStructureEn: '"Qul" is an imperative command to convey, followed by the statement clause "Huwa Allāhu Aḥad". "Huwa" is the pronoun of majesty, "Allahu" is subject, and "Ahad" is predicate.',
    rhetoricalInsightAr: 'استخدام ضمير الشأن (هو) لتفخيم الأمر وإثارة انتباه السامع لعظم الشأن المذكور بعده.',
    rhetoricalInsightEn: 'Employing the pronoun of majesty ("Huwa") magnifies the grand truth proclaimed immediately after.',
    words: [
      { word: 'قُلْ', pos: 'فعل أمر', posEn: 'Imperative Verb', grammarAr: 'فعل أمر مبني على السكون، والفاعل ضمير مستتر وجوباً تقديره أنت (يا محمد).', grammarEn: 'Imperative command verb ending in sukoon ("Say").' },
      { word: 'هُوَ', pos: 'ضمير شأن', posEn: 'Pronoun of Majesty', grammarAr: 'ضمير منفصل مبني على الفتح في محل رفع مبتدأ أول (ضمير الشأن).', grammarEn: 'Detached pronoun of majesty functioning as initial subject.' },
      { word: 'اللَّهُ', pos: 'مبتدأ ثانٍ', posEn: 'Subject Proper Name', grammarAr: 'اسم الجلالة مبتدأ ثانٍ مرفوع وعلامة رفعه الضمة الظاهرة.', grammarEn: 'Proper Divine Name as second subject in nominative case.' },
      { word: 'أَحَدٌ', pos: 'خبر المبتدأ الثاني', posEn: 'Predicate Noun', grammarAr: 'خبر المبتدأ الثاني مرفوع وعلامة رفعه الضمة الظاهرة، والجملة الاسمية في محل رفع خبر المبتدأ الأول.', grammarEn: 'Predicate noun "One, Indivisible" in nominative case with dammah.' }
    ]
  }
};

// توليد إعراب إرشادي ذكي لأي آية غير مسجلة نصياً
export const getIrabForAyah = (surahNumber: number, ayahNumber: number, verseText: string): AyahSyntaxEntry => {
  const key = `${surahNumber}:${ayahNumber}`;
  if (IRAB_DATABASE[key]) {
    return IRAB_DATABASE[key];
  }

  // تفكيك الكلمات تحليلياً
  const wordsRaw = verseText.replace(/[۞۩ۘۙۚۗۖۛ]/g, '').trim().split(/\s+/).filter(Boolean);
  const words: WordSyntax[] = wordsRaw.slice(0, 10).map((w) => {
    let pos = 'اسم';
    let posEn = 'Noun';
    let grammarAr = 'معرب بحسب موقعه في السياق القرآني.';
    let grammarEn = 'Declined according to its position in the Quranic clause context.';

    if (w.startsWith('و') || w.startsWith('ف') || w.startsWith('ب') || w.startsWith('ل')) {
      pos = 'حرف وكلمة مركبة';
      posEn = 'Particle & Compound Word';
      grammarAr = 'حرف مبني لا محل له من الإعراب، ويليه الاسم أو الفعل المكمل لمعنى التركيب.';
      grammarEn = 'Invariable particle with no isolated position, attached to the head noun/verb completing the structure.';
    } else if (w.match(/^(يـ|تـ|نـ|أ|ي|ت|ن)/)) {
      pos = 'فعل';
      posEn = 'Verb';
      grammarAr = 'فعل مضارع أو ماضٍ بحسب الصيغة الإسنادية مع فاعله.';
      grammarEn = 'Verbal predicate conjugate agreeing with its subject in tense and person.';
    } else if (w === 'إِنَّ' || w === 'أَنَّ') {
      pos = 'حرف ناسخ';
      posEn = 'Emphasis Accusative Particle';
      grammarAr = 'حرف توكيد ونصب ينصب المبتدأ اسماً له ويرفع الخبر خبراً له.';
      grammarEn = 'Invariable particle of emphasis governing its subject in accusative case.';
    } else if (w === 'مَا' || w === 'لَا') {
      pos = 'حرف نفي / اسم موصول';
      posEn = 'Negation / Relative Particle';
      grammarAr = 'حرف نفي أو اسم موصول بحسب دلالة السياق والتركيب.';
      grammarEn = 'Negation particle or relative pronoun depending on sentence context.';
    }

    return {
      word: w,
      pos,
      posEn,
      grammarAr,
      grammarEn
    };
  });

  return {
    surahNumber,
    ayahNumber,
    overallStructureAr: `جملة قرآنية بليغة ذات بناء تركيبي فصيح، تتركب من المفردات والأدوات الإعرابية المتسقة مع سياق السورة المباركة.`,
    overallStructureEn: `Eloquent Quranic verse constructed with refined grammatical composition, harmonizing words and particles in context of the Surah.`,
    rhetoricalInsightAr: `فصاحة النظم والترتيب القرآني المعجز الذي يجمع بين إيجاز اللفظ واتساع المعنى وسلامة السبك اللغوي.`,
    rhetoricalInsightEn: `Inimitable Quranic syntax uniting conciseness of words, depth of meaning, and linguistic fluency.`,
    words
  };
};
