/**
 * On This Day in History Localization & Fetching Service
 * Provides English translations for historical events, English Wikipedia integration,
 * and seamless multilingual event management.
 */

import { ON_THIS_DAY_EVENTS } from '../data/onThisDayEvents';

export interface OnThisDayItem {
  year: number;
  text: string;
  textEn?: string;
}

// Pre-compiled verified English translations for offline events in database
const EVENT_TRANSLATIONS_EN: Record<string, string> = {
  // 10-18 (Current date events)
  "البرلمان التُركي يُقر مشروع قرار يمنح دور الإفتاء والعُلماء المُسلمين صلاحية عقد القران بين الأزواج بالبلاد، بعد أن كانت حكرًا على موظفي دوائر شؤون الزواج في البلديات منذ قيام الجُمهُوريَّة سنة 1923م.":
    "The Turkish Parliament approves a landmark bill granting mufti offices and Muslim religious scholars the legal authority to conduct marriages, which had previously been restricted to municipal marriage registration offices since the founding of the republic in 1923.",
  "فيضانات في حيدر آباد الهندية، تؤدي لوفاة 81 شخصًا.":
    "Severe torrential floods in Hyderabad, India, cause widespread destruction and result in the death of at least 81 people.",
  "مقتل العميد في الجيش السوري عصام زهر الدين، خلال المعارك مع تنظيم داعش بانفجار لغم أرضي في دير الزور.":
    "Syrian Army Brigadier General Issam Zahreddine is killed by a landmine explosion during military operations in Deir ez-Zor.",

  // 10-19
  "انتخاب طوفان إرهورمان رئيسًا لجمهورية قبرص الشمالية.":
    "Tufan Erhurman is elected President of Northern Cyprus.",
  "سرقة قطع من مجوهرات التاج الفرنسي المحفوظة في متحف اللوفر في عملية استغرقت 7 دقائق.":
    "Pieces of the historic French Crown Jewels preserved at the Louvre Museum are stolen in a 7-minute heist.",
  "انتخاب لويس آرسي رئيسًا لبوليفيا في الانتخابات العامة البوليفية 2020.":
    "Luis Arce is elected President of Bolivia in the 2020 general election.",

  // 10-17
  "مجلس النواب الأمريكي يصوت لصالح إدانة الرئيس دونالد ترامب بتهمتي إساءة استخدام السلطة وعرقلة عمل الكونغرس.":
    "The US House of Representatives votes to impeach President Donald Trump.",

  // 10-11
  "منح جائزة نوبل للسلام لجمعية نيهون هيدانكيو، وهي جمعية تضم «هيباكوشا»، الناجين من القصفين الذريين على هيروشيما وناجازاكي.":
    "The Nobel Peace Prize is awarded to the Japanese organization Nihon Hidankyo, representing Hibakusha atomic bomb survivors of Hiroshima and Nagasaki.",
  "حكومة تونسية جديدة برئاسة نجلاء بودن تؤدي اليمين الدستورية، وهي أول حكومة تترأسها امرأة في العالم العربي.":
    "A new Tunisian government headed by Najla Bouden takes the constitutional oath, becoming the first female-led government in the Arab world.",
  "اللجنة النرويجية لجائزة نوبل تعلن فوز رئيس الوزراء الأثيوبي آبي أحمد علي بجائزة نوبل للسلام، بعد جهوده في حلِّ النزاع الحدودي مع إريتريا.":
    "Ethiopian Prime Minister Abiy Ahmed Ali is awarded the Nobel Peace Prize for his decisive efforts to achieve peace and resolve the border conflict with Eritrea.",

  // 10-13
  "تحرير 1768 أسيرًا فلسطينيًّا مقابل 20 أسيرًا إسرائيليًّا ضمن المرحلة الأولى من اتفاق السلام في غزة برعاية الولايات المتحدة وتركيا وقطر ومصر.":
    "Release of 1,768 Palestinian prisoners in exchange for 20 Israeli captives under the first phase of the peace framework sponsored by international mediators.",
  "مجلس النواب العراقي ينتخب مرشح الاتحاد الوطني الكردستاني عبد اللطيف جمال رشيد رئيسًا للجمهورية، وتكليف مرشح الإطار التنسيقي محمد شياع السوداني بتشكيل الحكومة.":
    "The Iraqi Parliament elects Abdul Latif Rashid as President of Iraq and tasks Mohammed Shia' al-Sudani with forming the new cabinet.",
  "مقتل خمسة أشخاص وإصابة ثلاثة آخرين في هجوم في كونجسبرج، النرويج.":
    "Five people are killed and three others injured in a bow-and-arrow attack in Kongsberg, Norway."
};

// Fallback curated English events for key dates
const FALLBACK_ENGLISH_EVENTS: Record<string, { year: number; text: string }[]> = {
  "10-18": [
    {
      year: 2017,
      text: "The Turkish Parliament approves a bill granting mufti offices and Muslim religious scholars the legal authority to conduct marriages, which had previously been restricted to civil registration offices since 1923."
    },
    {
      year: 2020,
      text: "Severe torrential floods in Hyderabad, India, cause widespread destruction and result in the death of at least 81 people."
    },
    {
      year: 1922,
      text: "The British Broadcasting Company (BBC) is founded to establish a nationwide network of radio transmitters."
    },
    {
      year: 1967,
      text: "The Soviet space probe Venera 4 reaches Venus, becoming the first spacecraft to measure the atmosphere of another planet."
    },
    {
      year: 2019,
      text: "NASA astronauts Jessica Meir and Christina Koch conduct the first all-female spacewalk outside the International Space Station."
    }
  ]
};

// Dynamic in-memory cache for Wikipedia fetched events
const cachedEventsEn: Record<string, { year: number; text: string }[]> = {};
const cachedEventsAr: Record<string, { year: number; text: string }[]> = {};

/**
 * Clean and normalize Arabic text for dictionary lookup
 */
function normalizeKey(str: string): string {
  return str.replace(/[\u064B-\u065F\u0670]/g, '').trim();
}

/**
 * Translate an Arabic event text into fluent English
 */
export function getTranslatedEventText(arabicText: string, year: number): string {
  if (!arabicText) return '';

  // Direct match
  if (EVENT_TRANSLATIONS_EN[arabicText]) {
    return EVENT_TRANSLATIONS_EN[arabicText];
  }

  // Normalized match
  const normalizedInput = normalizeKey(arabicText);
  for (const [key, value] of Object.entries(EVENT_TRANSLATIONS_EN)) {
    if (normalizeKey(key) === normalizedInput) {
      return value;
    }
  }

  // Common pattern translations for typical Arabic historical events
  let en = arabicText;

  // Replacements of recurring historical phrases
  const phrasePatterns: [RegExp, string][] = [
    [/البرلمان التُ?ركي يُ?قر مشروع قرار يمنح دور الإفتاء والعُلماء المُ?سلمين صلاحية عقد القران/g, "The Turkish Parliament approves a bill granting mufti offices and Muslim scholars authority to conduct civil marriages"],
    [/بعد أن كانت حكرًا على موظفي دوائر شؤون الزواج في البلديات منذ قيام الجُ?مهُ?وريَّة سنة 1923م?/g, "which had previously been restricted to civil registration offices since the republic's founding in 1923"],
    [/فيضانات في حيدر آباد الهندية، تؤدي لوفاة (\d+) شخصًا/g, "Floods in Hyderabad, India, result in the death of $1 people"],
    [/مقتل العميد في الجيش السوري عصام زهر الدين/g, "Syrian Army Brigadier General Issam Zahreddine is killed in action"],
    [/خلال المعارك مع تنظيم داعش بانفجار لغم أرضي في دير الزور/g, "during clashes with ISIS from a landmine explosion in Deir ez-Zor"],
    [/زلزالٌ? بقوة ([\d\.]+) درجة على مقياس ريختر يضرب/g, "An earthquake of magnitude $1 on the Richter scale strikes"],
    [/ما أدى لمقتل (.+) شخصًا/g, "resulting in the death of $1 people"],
    [/انتخاب (.+) رئيسًا لـ?جمهورية (.+)/g, "Election of $1 as President of $2"],
    [/منح جائزة نوبل للسلام لـ?(.+)/g, "The Nobel Peace Prize is awarded to $1"],
    [/توقيع اتفاقية (.+) بين (.+) و(.+)/g, "Signing of the $1 agreement between $2 and $3"],
    [/تأسيس (.+)/g, "Establishment of $1"],
    [/وفاة (.+)/g, "Passing of $1"],
    [/ميلادي/g, "AD"]
  ];

  for (const [pattern, replacement] of phrasePatterns) {
    if (pattern.test(en)) {
      en = en.replace(pattern, replacement);
    }
  }

  return en;
}

/**
 * Loads events for a specific month and day in either English or Arabic
 */
export async function loadDayEvents(
  mm: string,
  dd: string,
  language: 'ar' | 'en'
): Promise<OnThisDayItem[]> {
  const key = `${mm}-${dd}`;

  if (language === 'en') {
    // Check cached English events
    if (cachedEventsEn[key] && cachedEventsEn[key].length > 0) {
      return cachedEventsEn[key].map(ev => ({
        year: ev.year,
        text: ev.text,
        textEn: ev.text
      }));
    }

    // Check predefined curated English events
    if (FALLBACK_ENGLISH_EVENTS[key] && FALLBACK_ENGLISH_EVENTS[key].length > 0) {
      return FALLBACK_ENGLISH_EVENTS[key].map(ev => ({
        year: ev.year,
        text: ev.text,
        textEn: ev.text
      }));
    }

    // Try fetching authentic English on-this-day events from Wikipedia REST API
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`,
          { headers: { 'Accept': 'application/json' } }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.events) && data.events.length > 0) {
            const parsed = data.events.map((e: any) => ({
              year: e.year || 0,
              text: e.text || ''
            }));
            cachedEventsEn[key] = parsed;
            return parsed.map(ev => ({
              year: ev.year,
              text: ev.text,
              textEn: ev.text
            }));
          }
        }
      } catch (err) {
        console.warn('English Wikipedia OnThisDay fetch error, falling back to local translations', err);
      }
    }

    // Fallback: translate Arabic local database events to English
    const baseAr = ON_THIS_DAY_EVENTS[key] || [];
    return baseAr.map(item => ({
      year: item.year,
      text: getTranslatedEventText(item.text, item.year),
      textEn: getTranslatedEventText(item.text, item.year)
    }));
  }

  // Arabic language
  if (cachedEventsAr[key] && cachedEventsAr[key].length > 0) {
    return cachedEventsAr[key].map(ev => ({
      year: ev.year,
      text: ev.text
    }));
  }

  const baseAr = ON_THIS_DAY_EVENTS[key] || [];
  return baseAr.map(item => ({
    year: item.year,
    text: item.text,
    textEn: getTranslatedEventText(item.text, item.year)
  }));
}
