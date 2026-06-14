import React, { useState, useEffect, useMemo, useRef } from 'react';
import BottomBar from '../components/BottomBar';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { gregorianMonths, hijriMonths, islamicEvents, IslamicEvent } from '../data/calendarData';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Info, RefreshCw, ZoomIn, Copy, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';

// --- Helper Functions ---
const ARABIC_TO_ENGLISH_NUMERALS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };

function toArabicNumerals(num: string | number) {
    if (num === null || num === undefined) return '';
    return String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

function toEnglishNumerals(str: string | number) {
    if (str === null || str === undefined) return '';
    let result = str.toString();
    for (const [arabic, english] of Object.entries(ARABIC_TO_ENGLISH_NUMERALS)) {
        result = result.split(arabic).join(english);
    }
    return result;
}

// Convert Gregorian to Hijri for a given date
function getHijriDetails(date: Date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return g2h(y, m, d);
}

function g2h(year: number, month: number, day: number) {
    const gDate = new Date(year, month - 1, day);
    
    // Try Intl first for modern dates (very accurate for today)
    try {
        const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
        const parts = formatter.formatToParts(gDate);
        const find = (type: string) => parts.find(p => p.type === type)?.value || '0';
        
        const hDay = parseInt(find('day'));
        const hMonth = parseInt(find('month'));
        const hYear = parseInt(find('year'));
        
        if (hDay > 0 && hMonth > 0 && hYear > 0) {
            return {
                day: hDay,
                month: hMonth,
                year: hYear,
                monthName: hijriMonths[hMonth - 1]?.name || ''
            };
        }
    } catch (e) {
        // Fallback to mathematical
    }

    // Mathematical algorithm (Tabular) - calibrated for historical dates
    let y = year;
    let m = month;
    if (m < 3) {
        y -= 1;
        m += 12;
    }
    let a = Math.floor(y / 100);
    let b = 2 - a + Math.floor(a / 4);
    if (y < 1583) b = 0;
    if (y === 1582) {
        if (m > 10) b = -10;
        if (m === 10 && day > 14) b = -10;
    }

    let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
    
    // Adjust JD for better alignment with standard tabular calendars
    // 1948440 is the epoch for AH 1, Muharram 1.
    let l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const hMonth = Math.floor((24 * l) / 709);
    const hDay = l - Math.floor((709 * hMonth) / 24);
    const hYear = 30 * n + j - 30;

    return {
        day: hDay,
        month: hMonth,
        year: hYear,
        monthName: hijriMonths[hMonth - 1]?.name || ''
    };
}

/**
 * Robust Hijri to Gregorian conversion.
 * Uses iterative search for precision.
 */
function h2g(y: number, m: number, d: number): Date {
    // Start with a rough estimate based on days per Hijri year
    const daysSinceEpoch = Math.floor((y - 1) * 354.367) + (m - 1) * 29.5 + d;
    const estimateDate = new Date(622, 6, 19); // Hijri AH 1-1-1 epoch
    estimateDate.setDate(estimateDate.getDate() + daysSinceEpoch);
    
    // Search in a window to find the exact match for our g2h function
    let bestDate = new Date(estimateDate);
    
    for (let i = -5; i <= 5; i++) {
        const testDate = new Date(estimateDate);
        testDate.setDate(testDate.getDate() + i);
        const res = g2h(testDate.getFullYear(), testDate.getMonth() + 1, testDate.getDate());
        if (res.year === y && res.month === m && res.day === d) {
            return testDate;
        }
    }
    
    return bestDate;
}

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const historicalEvents = [
    {
        title: "الهجرة النبوية الشريفة",
        hijriYear: "1 هـ",
        gregorianYear: "622 م",
        description: "هجرة النبي محمد ﷺ من مكة إلى المدينة المنورة (يثرب). تعتبر نقطة التحول الكبرى في التاريخ الإسلامي، حيث تأسست أول دولة إسلامية، وبها بدأ التأريخ الهجري الذي اعتمده عمر بن الخطاب رضي الله عنه."
    },
    {
        title: "تحويل القبلة",
        hijriYear: "2 هـ",
        gregorianYear: "624 م",
        description: "تحويل القبلة من بيت المقدس إلى الكعبة المشرفة في مكة المكرمة، وذلك استجابة لرغبة النبي ﷺ، وكان ذلك في شهر شعبان من السنة الثانية للهجرة."
    },
    {
        title: "غزوة بدر الكبرى",
        hijriYear: "2 هـ",
        gregorianYear: "624 م",
        description: "أول معركة فاصلة في تاريخ الإسلام. التقى فيها المسلمون (313 مقاتل) بجيش قريش (1000 مقاتل). انتهت بنصر مؤزر للمسلمين، مما عزز مكانة الدولة الإسلامية الناشئة في شبه الجزيرة العربية."
    },
    {
        title: "غزوة أحد",
        hijriYear: "3 هـ",
        gregorianYear: "625 م",
        description: "وقعت بين المسلمين وقوات قريش عند جبل أحد. كانت المعركة اختباراً كبيراً للمسلمين، وتعلموا منها دروساً عظيمة في الطاعة والثبات، واستشهد فيها حمزة بن عبد المطلب رضي الله عنه."
    },
    {
        title: "غزوة الخندق (الأحزاب)",
        hijriYear: "5 هـ",
        gregorianYear: "627 م",
        description: "حصار ضربته قبائل العرب واليهود (الأحزاب) على المدينة. أشار سلمان الفارسي بحفر خندق لحماية المدينة. انتهى الحصار بهزيمة الأحزاب بفضل الله ثم الرياح الشديدة التي اقتلعت خيامهم."
    },
    {
        title: "صلح الحديبية",
        hijriYear: "6 هـ",
        gregorianYear: "628 م",
        description: "معاهدة سلام بين المسلمين وقريش لمدة 10 سنوات. رغم شروطها التي بدت مجحفة ظاهرياً، اعتبرها القرآن 'فتحاً مبيناً' لأنها أتاحت للمسلمين نشر الدعوة بأمان وتفرغوا لدعوة القبائل والملوك."
    },
    {
        title: "غزوة خيبر",
        hijriYear: "7 هـ",
        gregorianYear: "628 م",
        description: "فتح فيها المسلمون حصون خيبر التي كانت مركزاً لمؤامرات اليهود ضد الدولة الإسلامية، وشهدت المعركة بطولات كبيرة لعلي بن أبي طالب رضي الله عنه."
    },
    {
        title: "غزوة مؤتة",
        hijriYear: "8 هـ",
        gregorianYear: "629 م",
        description: "أول مواجهة عسكرية كبيرة بين المسلمين والإمبراطورية البيزنطية وحلفائها. استشهد فيها القادة الثلاثة: زيد بن حارثة، جعفر بن أبي طالب، وعبد الله بن رواحة، وأظهر فيها خالد بن الوليد عبقرية عسكرية في الانسحاب."
    },
    {
        title: "فتح مكة",
        hijriYear: "8 هـ",
        gregorianYear: "630 م",
        description: "دخول النبي ﷺ مكة بجيش قوامه 10 آلاف مقاتل دون إراقة دماء بعد نقض قريش لصلح الحديبية. تم تطهير الكعبة من الأصنام، وأعلن النبي العفو العام قائلاً: 'اذهبوا فأنتم الطلقاء'."
    },
    {
        title: "غزوة تبوك",
        hijriYear: "9 هـ",
        gregorianYear: "630 م",
        description: "آخر غزوة خرج فيها النبي ﷺ بنفسه، وتسمى 'غزوة العسرة' لصعوبتها. خرج المسلمون لملاقاة الروم، لكن الروم تراجعوا، وعقد النبي ﷺ معاهدات مع القبائل المجاورة."
    },
    {
        title: "وفاة النبي ﷺ",
        hijriYear: "11 هـ",
        gregorianYear: "632 م",
        description: "انتقل النبي محمد ﷺ إلى الرفيق الأعلى في يوم الاثنين 12 ربيع الأول بعد أداء حجة الوداع وإتمام الدين، وخلفه أبو بكر الصديق في قيادة المسلمين."
    },
    {
        title: "جمع القرآن الكريم",
        hijriYear: "12 هـ",
        gregorianYear: "633 م",
        description: "تم جمع القرآن الكريم في مصحف واحد لأول مرة في عهد الخليفة أبي بكر الصديق وبإشارة من عمر بن الخطاب، وذلك بعد استشهاد عدد كبير من حفاظ القرآن في حروب الردة."
    },
    {
        title: "معركة اليرموك",
        hijriYear: "15 هـ",
        gregorianYear: "636 م",
        description: "معركة حاسمة بقيادة خالد بن الوليد ضد الإمبراطورية البيزنطية. استمرت 6 أيام وانتهت بانتصار ساحق للمسلمين، مما أدى إلى إنهاء السيطرة الرومانية على بلاد الشام وفتح أبواب القدس."
    },
    {
        title: "معركة القادسية",
        hijriYear: "15 هـ",
        gregorianYear: "636 م",
        description: "معركة كبرى بقيادة سعد بن أبي وقاص ضد الإمبراطورية الساسانية الفارسية. انتهت بانتصار المسلمين وسقوط عاصمة الفرس (المدائن)، وافتتاح بلاد العراق للعرب المسلمين."
    },
    {
        title: "فتح بيت المقدس",
        hijriYear: "16 هـ",
        gregorianYear: "637 م",
        description: "تسلم عمر بن الخطاب رضي الله عنه مفاتيح القدس من البطريرك صفرونيوس، وكتب 'العهدة العمرية' التي منحت المسيحيين الأمان على أنفسهم وكنائسهم وممتلكاتهم."
    },
    {
        title: "عام الرمادة",
        hijriYear: "18 هـ",
        gregorianYear: "639 م",
        description: "سنة قحط وجفاف شديد أصابت بلاد الحجاز في عهد عمر بن الخطاب، وأبلى فيها الفاروق بلاءً حسناً في إدارة الأزمة وإغاثة الناس من الأمصار المجاورة."
    },
    {
        title: "فتح مصر",
        hijriYear: "20 هـ",
        gregorianYear: "641 م",
        description: "دخول الإسلام إلى مصر بقيادة عمرو بن العاص، حيث سقط حصن بابليون وفتحت الإسكندرية، وبدأت مرحلة جديدة من تاريخ مصر تحت الحكم الإسلامي."
    },
    {
        title: "معارك ذات الصواري",
        hijriYear: "34 هـ",
        gregorianYear: "654 م",
        description: "أول معركة بحرية كبرى في تاريخ المسلمين، وقعت بين الأسطول الإسلامي والأسطول البيزنطي في البحر المتوسط، وانتهت بانتصار المسلمين وسيطرتهم البحرية."
    },
    {
        title: "تأسيس الدولة الأموية",
        hijriYear: "41 هـ",
        gregorianYear: "661 م",
        description: "بدء حكم الدولة الأموية بتولي معاوية بن أبي سفيان رضي الله عنه الخلافة، واتخاذ دمشق عاصمة لها، لتبدأ مرحلة الفتوحات الواسعة شرقاً وغرباً."
    },
    {
        title: "بناء القيروان",
        hijriYear: "50 هـ",
        gregorianYear: "670 م",
        description: "أسسها القائد عقبة بن نافع في تونس لتكون أول قاعدة عسكرية ومدنية للمسلمين في إفريقيا ومنطلقاً لنشر الإسلام في المغرب العربي."
    },
    {
        title: "بناء مسجد قبة الصخرة",
        hijriYear: "72 هـ",
        gregorianYear: "691 م",
        description: "أتم بناءه الخليفة الأموي عبد الملك بن مروان في المسجد الأقصى بالقدس، ويعد أحد أقدم وأجمل المعالم المعمارية الإسلامية الباقية حتى اليوم."
    },
    {
        title: "تعريب الدواوين",
        hijriYear: "81 هـ",
        gregorianYear: "700 م",
        description: "أمر الخليفة عبد الملك بن مروان بتحويل لغة السجلات الرسمية (الدواوين) إلى اللغة العربية بدلاً من الفارسية واليونانية، مما عزز الهوية العربية للدولة."
    },
    {
        title: "بناء الجامع الأموي",
        hijriYear: "86 هـ",
        gregorianYear: "705 م",
        description: "بدأ الخليفة الوليد بن عبد الملك بناء الجامع الكبير في دمشق، والذي يعد من أعظم المساجد في تاريخ الإسلام وفخر العمارة الأموية."
    },
    {
        title: "فتح الأندلس",
        hijriYear: "92 هـ",
        gregorianYear: "711 م",
        description: "بدأ بقيادة طارق بن زياد وموسى بن نصير. عبرت القوات المضيق وانتهت بفتح معظم شبه الجزيرة الأيبيرية وبداية الحضارة الأندلسية العريقة."
    },
    {
        title: "معركة بلاط الشهداء",
        hijriYear: "114 هـ",
        gregorianYear: "732 م",
        description: "وقعت في فرنسا بقيادة عبد الرحمن الغافقي ضد قوات الفرنجة، وتعتبر من أهم المعارك التي أوقفت التمدد الإسلامي في أوربا."
    },
    {
        title: "تأسيس الدولة العباسية",
        hijriYear: "132 هـ",
        gregorianYear: "750 م",
        description: "سقوط الدولة الأموية وقيام الدولة العباسية بعد معركة الزاب، وانتقال مركز الخلافة إلى العراق."
    },
    {
        title: "بناء مدينة بغداد",
        hijriYear: "145 هـ",
        gregorianYear: "762 م",
        description: "أنشأها الخليفة العباسي أبو جعفر المنصور وسماها 'دار السلام'. أصبحت عاصمة الخلافة العباسية ومركزاً عالمياً للعلم والترجمة والازدهار الحضاري."
    },
    {
        title: "تأسيس إمارة الأندلس",
        hijriYear: "138 هـ",
        gregorianYear: "756 م",
        description: "نجاح عبد الرحمن الداخل (صقر قريش) في دخول الأندلس وتأسيس إمارة أموية مستقلة فيها بعد سقوط الدولة الأموية في المشرق."
    },
    {
        title: "فتح جزيرة صقلية",
        hijriYear: "212 هـ",
        gregorianYear: "827 م",
        description: "بدأ الفتح بقيادة القاضي أسد بن الفرات في عهد الأغالبة، واستمرت الجزيرة تحت الحكم الإسلامي لعدة قرون كمركز حضاري هام."
    },
    {
        title: "فتح عمورية",
        hijriYear: "223 هـ",
        gregorianYear: "838 م",
        description: "قادها الخليفة المعتصم بالله رداً على اعتداء البيزنطيين على المسلمين، وتخلدت ببيت أبي تمام: 'السيف أصدق أنباء من الكتب'."
    },
    {
        title: "بناء جامعة القرويين",
        hijriYear: "245 هـ",
        gregorianYear: "859 م",
        description: "أسستها فاطمة الفهرية في مدينة فاس بالمغرب، وتعتبر أقدم جامعة مستمرة في منح الدرجات العلمية في العالم حسب اليونسكو."
    },
    {
        title: "بناء الجامع الأزهر",
        hijriYear: "359 هـ",
        gregorianYear: "970 م",
        description: "أسسه جوهر الصقلي القائد الفاطمي في القاهرة. تحول لاحقاً إلى أهم مدرسة ومعلم علمي في العالم الإسلامي لتدريس العلوم الشرعية واللغة العربية."
    },
    {
        title: "معركة ملاذكرد",
        hijriYear: "463 هـ",
        gregorianYear: "1071 م",
        description: "انتصار السلاجقة بقيادة ألب أرسلان على الإمبراطورية البيزنطية، مما مهد الطريق لدخول الأتراك المسلمين إلى بلاد الأناضول."
    },
    {
        title: "معركة الزلاقة",
        hijriYear: "479 هـ",
        gregorianYear: "1086 م",
        description: "انتصار كبير للمرابطين بقيادة يوسف بن تاشفين مع ملوك الطوائف ضد قوات ألفونسو السادس ملك قشتالة، مما أدى إلى تأخير سقوط الأندلس لأكثر من قرنين."
    },
    {
        title: "معركة حطين",
        hijriYear: "583 هـ",
        gregorianYear: "1187 م",
        description: "معركة فاصلة بقيادة صلاح الدين الأيوبي ضد الصليبيين. تم فيها تدمير الجيش الصليبي وأسر ملك القدس، مما مهد الطريق لاستعادة القدس وشريفها."
    },
    {
        title: "وفاة صلاح الدين الأيوبي",
        hijriYear: "589 هـ",
        gregorianYear: "1193 م",
        description: "وفاة الناصر صلاح الدين في دمشق بعد حياة حافلة بالبطولات والعدل والجهاد ضد الصليبيين، ودفن في منزله بجانب المسجد الأموي."
    },
    {
        title: "معركة المنصورة",
        hijriYear: "648 هـ",
        gregorianYear: "1250 م",
        description: "هزيمة الحملة الصليبية السابعة بقيادة الملك لويس التاسع في مصر، وأسره في دار ابن لقمان، مما مثل نهاية للحروب الصليبية الكبرى."
    },
    {
        title: "معركة عين جالوت",
        hijriYear: "658 هـ",
        gregorianYear: "1260 م",
        description: "معركة تاريخية كبرى بقيادة سيف الدين قطز والظاهر بيبرس. انتهت بهزيمة جيش المغول، وأنقذت العالم الإسلامي من الزوال ومهدت لدولة المماليك."
    },
    {
        title: "استعادة عكا",
        hijriYear: "690 هـ",
        gregorianYear: "1291 م",
        description: "نجاح المماليك بقيادة الأشرف خليل بن قلاوون في فتح مدينة عكا، وبذلك انتهى الوجود الصليبي في بلاد الشام بشكل نهائي."
    },
    {
        title: "فتح القسطنطينية",
        hijriYear: "857 هـ",
        gregorianYear: "1453 م",
        description: "نجاح السلطان العثماني محمد الفاتح في فتح القسطنطينية، تحقق بذلك حديث النبي ﷺ، وتم تحويل اسمها إلى إسطنبول لتصبح عاصمة العثمانيين."
    },
    {
        title: "سقوط غرناطة",
        hijriYear: "897 هـ",
        gregorianYear: "1492 م",
        description: "سلم أبو عبد الله محمد الصغير مفاتيح غرناطة للملوك الكاثوليك، وبذلك سقطت آخر ممالك المسلمين في الأندلس بعد 8 قرون."
    },
    {
        title: "معركة مرج دابق",
        hijriYear: "922 هـ",
        gregorianYear: "1516 م",
        description: "معركة بين العثمانيين والمماليك بقيادة سليم الأول وقنصوة الغوري. انتهت بضم بلاد الشام ومصر لاحقاً إلى السيادة العثمانية."
    },
    {
        title: "بناء المسجد السليماني",
        hijriYear: "964 هـ",
        gregorianYear: "1557 م",
        description: "تحفة معمارية صممها المهندس سنان في عهد السلطان سليمان القانوني في إسطنبول، تعبيراً عن قوة الدولة العثمانية في عصرها الذهبي."
    },
    {
        title: "معركة ليبانتو",
        hijriYear: "979 هـ",
        gregorianYear: "1571 م",
        description: "معركة بحرية ضخمة بين الأسطول العثماني والتحالف المسيحي في البحر المتوسط، وتعتبر هزة قوية للبحرية العثمانية في ذلك الوقت."
    },
    {
        title: "حصار فيينا الثاني",
        hijriYear: "1094 هـ",
        gregorianYear: "1683 م",
        description: "محاولة العثمانيين الكبرى لفتح فيينا بقيادة مرزيفونلو قره مصطفى باشا، وانتهت بتراجع العثمانيين وبدء مرحلة انحسار نفوذهم في أوربا."
    },
    {
        title: "تأسيس الدولة السعودية الأولى",
        hijriYear: "1157 هـ",
        gregorianYear: "1744 م",
        description: "بدأ التحالف التاريخي بين الإمام محمد بن سعود والشيخ محمد بن عبد الوهاب في الدرعية، لتبدأ مرحلة جديدة في تاريخ الجزيرة العربية."
    },
    {
        title: "بناء مسجد قباء",
        hijriYear: "1 هـ",
        gregorianYear: "622 م",
        description: "أول مسجد أسسه النبي ﷺ عند وصوله إلى المدينة المنورة في رحلة الهجرة، ويمثل أول لبنة في العمارة الإسلامية المسجدية."
    },
    {
        title: "بناء مسجد القبلتين",
        hijriYear: "2 هـ",
        gregorianYear: "624 م",
        description: "المكان الذي شهد نزول الوحي على النبي ﷺ بتحويل القبلة من بيت المقدس إلى الكعبة المشرفة بمكة أثناء صلاة الظهر."
    },
    {
        title: "فتح جزيرة قبرص",
        hijriYear: "28 هـ",
        gregorianYear: "649 م",
        description: "أول غزو بحري للمسلمين في عهد الخليفة عثمان بن عفان، بقيادة معاوية بن أبي سفيان، مما مهد للسيادة البحرية الإسلامية."
    },
    {
        title: "معركة نهاوند",
        hijriYear: "21 هـ",
        gregorianYear: "642 م",
        description: "تسمى 'فتح الفتوح'؛ حيث انتصر المسلمون بقيادة النعمان بن مقرن على الفرس، وكانت المعركة الفاصلة التي أنهت حكم الساسانيين."
    },
    {
        title: "فتح بلاد النوبة",
        hijriYear: "31 هـ",
        gregorianYear: "652 م",
        description: "بقيادة عمرو بن العاص ثم عبد الله بن أبي السرح؛ حيث تم توقيع معاهدة 'البقط' التي نظمت العلاقة بين المسلمين وأهل النوبة لقرون."
    },
    {
        title: "فتح بلاد السند",
        hijriYear: "92 هـ",
        gregorianYear: "711 م",
        description: "بقيادة البطل الشاب محمد بن القاسم الثقفي، الذي تمكن من دخول الهند ونشر الإسلام في تلك الربوع بفضل عدله وشجاعته."
    },
    {
        title: "فتح سمرقند",
        hijriYear: "93 هـ",
        gregorianYear: "712 م",
        description: "نجح القائد قتيبة بن مسلم الباهلي في فتح سمرقند، لتصبح لاحقاً واحدة من أعظم مراكز العلم والحضارة في تاريخ الإسلام."
    },
    {
        title: "تأسيس مدينة القاهرة",
        hijriYear: "358 هـ",
        gregorianYear: "969 م",
        description: "وضع حجر أساسها القائد جوهر الصقلي في عهد الخليفة المعز لدين الله الفاطمي، وسُميت 'القاهرة' تيمناً بالكوكب القاهر."
    },
    {
        title: "فتح كابل",
        hijriYear: "367 هـ",
        gregorianYear: "977 م",
        description: "بدأ دخول الإسلام الفعلي لأفغانستان في عهد الدولة الغزنوية بقيادة سبكتكين، مما مهد الطريق لنشر الإسلام في شبه القارة الهندية."
    },
    {
        title: "استعادة دمشق",
        hijriYear: "549 هـ",
        gregorianYear: "1154 م",
        description: "نجح نور الدين زنكي في ضم دمشق، موحداً بذلك الجبهة الإسلامية ضد الصليبيين، مما مهد الطريق لاحقاً لانتصارات صلاح الدين."
    },
    {
        title: "معركة العقاب",
        hijriYear: "609 هـ",
        gregorianYear: "1212 م",
        description: "معركة كبرى في الأندلس بين الموحدين والتحالف الصليبي الإسباني؛ وتعتبر نقطة البداية لتفكك دولة الموحدين وضياع الأندلس."
    },
    {
        title: "سقوط بغداد",
        hijriYear: "656 هـ",
        gregorianYear: "1258 م",
        description: "اجتياح هولاكو وجيوش المغول لبغداد، عاصمة الخلافة العباسية، مما أدى إلى دمار هائل للمكتبات والمساجد ونهاية حقبة حضارية."
    },
    {
        title: "معركة وادي الخزندار",
        hijriYear: "699 هـ",
        gregorianYear: "1299 م",
        description: "اشتباك عنيف بين المماليك وإيلخانات المغول في الشام؛ ورغم الهزيمة الظاهرية، إلا أنها استنزفت المغول ومنعتهم من الاستقرار."
    },
    {
        title: "معركة نيقوبوليس",
        hijriYear: "798 هـ",
        gregorianYear: "1396 م",
        description: "انتصار العثمانيين بقيادة بايزيد الأول (الصاعقة) على تحالف صليبي أوروبي ضخم، مما أثبت قوة العثمانيين في قلب القارة الأوروبية."
    },
    {
        title: "معركة أنقرة",
        hijriYear: "804 هـ",
        gregorianYear: "1402 م",
        description: "وقعت بين تيمورلنك وبايزيد الأول؛ أدت لهزيمة العثمانيين ودخول الدولة في مرحلة 'الفترة' الانتقالية قبل أن تعود أقوى مما كانت."
    },
    {
        title: "معركة تشالديران",
        hijriYear: "920 هـ",
        gregorianYear: "1514 م",
        description: "انتصار السلطان سليم الأول على الصفويين؛ مما أدى إلى تأمين الحدود الشرقية للدولة العثمانية والسيطرة على المناطق الحيوية."
    },
    {
        title: "معركة وادي المخازن",
        hijriYear: "986 هـ",
        gregorianYear: "1578 م",
        description: "أو معركة الملوك الثلاثة في المغرب؛ حيث انتصر المغاربة على البرتغاليين، مما حفظ استقلال المغرب وحماه من الاستعمار لعدة قرون."
    },
    {
        title: "تأسيس الدار البيضاء",
        hijriYear: "710 هـ تقريباً",
        gregorianYear: "1310 م",
        description: "بداية تشكل النواة الأولى للمدينة في العهد المريني، حيث بدأت تبرز كمركز تجاري وبحري هام على المحيط الأطلسي."
    },
    {
        title: "بناء تاج محل",
        hijriYear: "1041 هـ",
        gregorianYear: "1632 م",
        description: "بدأ الإمبراطور شاه جهان بناء ضريح 'تاج محل' في أغرة بالهند، والذي يعد من أروع نماذج العمارة الإسلامية الفنية في العالم."
    },
    {
        title: "رحلة الإمام البخاري",
        hijriYear: "210 هـ تقريباً",
        gregorianYear: "825 م",
        description: "بدأ الإمام البخاري رحلته الكبرى في طلب الحديث عبر الأمصار، والتي أثمرت عن 'صحيح البخاري' أصح كتاب بعد كتاب الله."
    }
];

// --- Sub-components ---

const CalendarGrid = ({ viewDate, onSelectDay, selectedDay, theme, primaryColor, secondaryColor, isBlackAndWhite, isDefaultTheme }: any) => {
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 is Sunday
    
    const prevMonthDays = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
    
    const cells = [];
    
    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, prevMonthDays - i);
        cells.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            date: d
        });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
        cells.push({
            day: i,
            isCurrentMonth: true,
            date: d
        });
    }
    
    // Next month padding
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, i);
        cells.push({
            day: i,
            isCurrentMonth: false,
            date: d
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full p-1 sm:p-2">
            {WEEKDAYS.map(day => (
                <div key={day} className="text-center py-2 text-[10px] sm:text-xs font-black themed-text-muted opacity-40 uppercase tracking-tighter">
                    {day}
                </div>
            ))}
            {cells.map((cell, idx) => {
                const dayDate = new Date(cell.date);
                dayDate.setHours(0,0,0,0);
                const isToday = dayDate.getTime() === today.getTime();
                const isSelected = selectedDay && dayDate.getTime() === new Date(selectedDay).setHours(0,0,0,0);
                const hijri = getHijriDetails(cell.date);
                const event = islamicEvents.find(e => e.day === hijri.day && e.month === hijri.month);
                const isRamadan = hijri.month === 9;

                let dynamicBgClass = 'bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm';
                let dynamicTextClass = '';
                let dynamicDotClass = '';
                
                if (event?.isPrimary) {
                    if (isSelected) {
                        dynamicBgClass = 'bg-red-500 text-white shadow-lg border-transparent';
                        dynamicDotClass = 'bg-white';
                    } else {
                        dynamicBgClass = 'bg-red-500/15 dark:bg-red-500/25 border border-red-500/30 shadow-sm text-red-500';
                        dynamicTextClass = 'text-red-600 dark:text-red-400';
                        dynamicDotClass = 'bg-red-500';
                    }
                } else if (event) {
                    if (isSelected) {
                        dynamicBgClass = 'bg-blue-500 text-white shadow-lg border-transparent';
                        dynamicDotClass = 'bg-white';
                    } else {
                        dynamicBgClass = 'bg-blue-500/15 dark:bg-blue-500/25 border border-blue-500/30 shadow-sm text-blue-500';
                        dynamicTextClass = 'text-blue-600 dark:text-blue-400';
                        dynamicDotClass = 'bg-blue-500';
                    }
                } else if (isRamadan) {
                    if (isSelected) {
                        dynamicBgClass = 'bg-emerald-500 text-white shadow-lg border-transparent';
                    } else {
                        dynamicBgClass = 'bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/30 shadow-sm text-emerald-600 dark:text-emerald-400';
                        dynamicTextClass = 'text-emerald-700 dark:text-emerald-400';
                    }
                } else {
                    if (isSelected) {
                        dynamicBgClass = 'shadow-xl text-white';
                    }
                }

                let cellStyle: React.CSSProperties = {};
                if (!event && !isRamadan) {
                    if (isSelected) {
                        cellStyle.backgroundColor = isDefaultTheme ? '#000000' : secondaryColor;
                        cellStyle.color = isBlackAndWhite ? '#000' : '#FFF';
                    } else if (isToday) {
                        if (isDefaultTheme) {
                            cellStyle.backgroundColor = '#000000';
                            cellStyle.color = '#FFFFFF';
                        }
                    }
                } else if (isToday && !isSelected) {
                    // Just put a colored ring if it's today and an event
                    dynamicBgClass += ' ring-2 ring-offset-1 ' + (event?.isPrimary ? 'ring-red-500 dark:ring-offset-gray-900' : (event ? 'ring-blue-500 dark:ring-offset-gray-900' : 'ring-emerald-500 dark:ring-offset-gray-900'));
                }

                return (
                    <button
                        key={idx}
                        onClick={() => onSelectDay(cell.date)}
                        className={`relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl transition-all aspect-square 
                            ${cell.isCurrentMonth ? dynamicBgClass : 'opacity-30 ' + dynamicBgClass}
                            ${isSelected ? 'scale-110 z-10 shadow-xl' : 'hover:scale-[1.02] hover:bg-white/80 dark:hover:bg-white/10'}
                        `}
                        style={cellStyle}
                    >
                        <span className={`text-sm sm:text-lg font-black leading-none ${!isSelected ? dynamicTextClass : ''}`}>
                            {toArabicNumerals(cell.day)}
                        </span>
                        <span className={`text-[9px] sm:text-[10px] mt-1 font-bold ${isSelected || isToday ? 'opacity-100' : 'opacity-40'} ${event ? 'opacity-100 font-black' : ''}`}>
                            {toArabicNumerals(hijri.day)}
                        </span>
                        
                        {isToday && !isSelected && !isDefaultTheme && !event && !isRamadan && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white dark:border-gray-900" style={{ backgroundColor: secondaryColor }}></div>
                        )}

                        {event && (
                            <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${dynamicDotClass}`}></div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// --- Main Component ---
function HijriCalendar({ onBack , onNavigate }: { onBack: () => void, onNavigate: (id: string, params?: any) => void; }) {
    const { theme, themeKey } = useTheme();
    const isBlackAndWhite = themeKey === 'deep_black';
    const isDefaultTheme = themeKey === 'default';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];
    const secondaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[1];
    
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'converter'
    const [convTab, setConvTab] = useState('hijriToGregorian');
    const [historicalEvent, setHistoricalEvent] = useState<any>(null);
    const [historyFontSize, setHistoryFontSize] = useState(1);
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Picker States
    const [pickerConfig, setPickerConfig] = useState<{
        isOpen: boolean;
        type: 'gDay' | 'gMonth' | 'gYear' | 'hDay' | 'hMonth' | 'hYear' | 'calendarMonth' | 'calendarYear';
        options: { label: string; value: any }[];
        title: string;
    }>({ isOpen: false, type: 'gMonth', options: [], title: '' });

    // Converter State
    const [inputs, setInputs] = useState(() => {
        const h = getHijriDetails(new Date());
        return {
            gDay: new Date().getDate(), 
            gMonth: new Date().getMonth() + 1, 
            gYear: String(new Date().getFullYear()),
            hDay: h.day, 
            hMonth: h.month, 
            hYear: String(h.year)
        };
    });
    const [convResult, setConvResult] = useState('');
    const [convMessage, setConvMessage] = useState('');

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * historicalEvents.length);
        setHistoricalEvent(historicalEvents[randomIndex]);
    }, []);

    const selectedHijri = useMemo(() => getHijriDetails(selectedDate), [selectedDate]);
    const refreshEvent = () => {
        const randomIndex = Math.floor(Math.random() * historicalEvents.length);
        setHistoricalEvent(historicalEvents[randomIndex]);
    };
    const selectedEvent = useMemo(() => islamicEvents.find(e => e.day === selectedHijri.day && e.month === selectedHijri.month), [selectedHijri]);

    const handleHomeClick = () => {
        if (showZoomModal) {
            setShowZoomModal(false);
        } else if (pickerConfig.isOpen) {
            setPickerConfig({ ...pickerConfig, isOpen: false });
        } else {
            onBack();
        }
    };

    useEffect(() => {
        const interceptor = () => {
            if (showZoomModal) { setShowZoomModal(false); return true; }
            if (pickerConfig.isOpen) { setPickerConfig({ ...pickerConfig, isOpen: false }); return true; }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [showZoomModal, pickerConfig.isOpen]);

    const changeMonth = (offset: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleSelectDay = (date: Date) => {
        setSelectedDate(date);
    };

    useEffect(() => {
        handleConversion();
    }, [inputs, convTab, activeTab]);

    // Converter Logic
    const handleConversion = () => {
        if (convTab === 'gregorianToHijri') {
            const gY = parseInt(String(inputs.gYear));
            const gM = parseInt(String(inputs.gMonth));
            const gD = parseInt(String(inputs.gDay));

            if (isNaN(gY) || isNaN(gM) || isNaN(gD)) {
                setConvResult('تاريخ غير صالح');
                setConvMessage('');
                return;
            }

            const hijri = g2h(gY, gM, gD);
            setConvResult(`${toArabicNumerals(hijri.day)} ${hijri.monthName} ${toArabicNumerals(hijri.year)} هـ`);
            setConvMessage('النتيجة هجرياً:');
        } else {
            const hY = parseInt(String(inputs.hYear));
            const hM = parseInt(String(inputs.hMonth));
            const hD = parseInt(String(inputs.hDay));
            
            if (isNaN(hY) || isNaN(hM) || isNaN(hD) || hY < 1 || hM < 1 || hM > 12 || hD < 1 || hD > 30) {
                 setConvResult('تاريخ هجري غير صالح');
                 setConvMessage('');
                 return;
            }

            const date = h2g(hY, hM, hD);
            if (isNaN(date.getTime())) {
                setConvResult('خطأ في التحويل');
                setConvMessage('');
            } else {
                setConvResult(new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(date) + ' م');
                setConvMessage('النتيجة ميلادياً:');
            }
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setToastMessage('تم النسخ إلى الحافظة');
            setTimeout(() => setToastMessage(''), 2000);
        });
    };

    const handleShare = async (title: string, desc: string) => {
        const dateStr = `${toArabicNumerals(historicalEvent.hijriYear)} • ${toArabicNumerals(historicalEvent.gregorianYear)}`;
        await shareAsImage({
            text: desc,
            source: `${title} (${dateStr})`,
            category: 'ذاكرة التاريخ',
            theme,
            setToastMessage
        });
    };

    const openPicker = (type: typeof pickerConfig.type) => {
        let options: { label: string; value: any }[] = [];
        let title = '';

        switch (type) {
            case 'gDay':
                options = Array.from({ length: 31 }, (_, i) => ({ label: toArabicNumerals(i + 1), value: i + 1 }));
                title = 'اختر اليوم (ميلادي)';
                break;
            case 'gMonth':
                options = gregorianMonths.map(m => ({ label: m.name, value: m.id }));
                title = 'اختر الشهر (ميلادي)';
                break;
            case 'gYear':
                const curGY = new Date().getFullYear();
                // Range from 622 AD (approx 1 AH) to 2100 AD
                options = Array.from({ length: 2100 - 622 + 1 }, (_, i) => ({ label: toArabicNumerals(622 + i), value: 622 + i }));
                title = 'اختر السنة (ميلادي)';
                break;
            case 'hDay':
                options = Array.from({ length: 30 }, (_, i) => ({ label: toArabicNumerals(i + 1), value: i + 1 }));
                title = 'اختر اليوم (هجري)';
                break;
            case 'hMonth':
                options = hijriMonths.map(m => ({ label: m.name, value: m.id }));
                title = 'اختر الشهر (هجري)';
                break;
            case 'hYear':
                const curHY = getHijriDetails(new Date()).year;
                // Range from 1 AH to 1600 AH
                options = Array.from({ length: 1600 }, (_, i) => ({ label: toArabicNumerals(i + 1), value: i + 1 }));
                title = 'اختر السنة (هجري)';
                break;
            case 'calendarMonth':
                options = gregorianMonths.map(m => ({ label: m.name, value: m.id - 1 }));
                title = 'اختر الشهر';
                break;
            case 'calendarYear':
                // Range from 1900 to 2100 for the main calendar (can be adjusted if they want historical main calendar too)
                const startGY = 1800;
                options = Array.from({ length: 2100 - 1800 + 1 }, (_, i) => ({ label: toArabicNumerals(startGY + i), value: startGY + i }));
                title = 'اختر السنة';
                break;
        }

        setPickerConfig({ isOpen: true, type, options, title });
    };

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (pickerConfig.isOpen && scrollRef.current) {
            const selectedItem = scrollRef.current.querySelector('[data-selected="true"]');
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
    }, [pickerConfig.isOpen]);

    const handlePickerSelect = (value: any) => {
        const type = pickerConfig.type;
        if (type === 'calendarMonth') {
            setViewDate(new Date(viewDate.getFullYear(), value, 1));
        } else if (type === 'calendarYear') {
            setViewDate(new Date(value, viewDate.getMonth(), 1));
        } else {
            setInputs(prev => ({ ...prev, [type]: value }));
        }
        // Use a small timeout to allow the click feedback before closing, but keeping it snappy
        setPickerConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="h-screen flex flex-col bg-transparent font-sans overflow-hidden">
            <header className="app-top-bar shrink-0">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">التقويم</h1>
                    </div>
                    <p className="app-top-bar__subtitle shrink-0">الميلادي والهجري في مكان واحد</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-3 pb-24 shadow-inner">
                <div className="w-full max-w-lg mx-auto space-y-3">
                    
                    {/* Mode Toggles */}
                    <div className="flex p-1 rounded-2xl themed-bg-alt shadow-inner bg-white border border-gray-100">
                        <button 
                            onClick={() => setActiveTab('calendar')}
                            className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center gap-2 duration-300 ${activeTab === 'calendar' ? 'shadow-lg' : (isDefaultTheme ? 'text-black opacity-60' : 'themed-text-muted hover:bg-black/5')}`}
                            style={activeTab === 'calendar' ? { backgroundColor: isDefaultTheme ? '#000000' : primaryColor, color: isDefaultTheme ? '#FFFFFF' : (isBlackAndWhite ? '#000' : '#FFF') } : (isDefaultTheme ? { backgroundColor: '#FFFFFF', color: '#000000' } : {})}
                        >
                            <CalendarIcon size={16} />
                            عرض التقويم
                        </button>
                        <button 
                            onClick={() => setActiveTab('converter')}
                            className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center gap-2 duration-300 ${activeTab === 'converter' ? 'shadow-lg' : (isDefaultTheme ? 'text-black opacity-60' : 'themed-text-muted hover:bg-black/5')}`}
                            style={activeTab === 'converter' ? { backgroundColor: isDefaultTheme ? '#000000' : primaryColor, color: isDefaultTheme ? '#FFFFFF' : (isBlackAndWhite ? '#000' : '#FFF') } : (isDefaultTheme ? { backgroundColor: '#FFFFFF', color: '#000000' } : {})}
                        >
                            <RefreshCw size={16} />
                            محول التاريخ
                        </button>
                    </div>

                    {activeTab === 'calendar' ? (
                        <div className="space-y-2">
                            {/* Calendar Header Card */}
                            <div className="themed-card rounded-2xl shadow-lg overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: isDefaultTheme ? '#000000' : primaryColor }}></div>
                                <div className="flex items-center justify-between p-3">
                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all group active:scale-90">
                                        <ChevronRight size={22} style={{ color: isDefaultTheme ? '#000000' : primaryColor }} />
                                    </button>
                                    <div className="flex-1 flex flex-col items-center justify-center cursor-pointer group" onClick={() => openPicker('calendarMonth')}>
                                        <h2 className="text-lg font-black tracking-tight group-active:scale-95 transition-transform" style={{ color: isDefaultTheme ? '#000000' : primaryColor }}>
                                            {gregorianMonths[viewDate.getMonth()].name} <span onClick={(e) => { e.stopPropagation(); openPicker('calendarYear'); }}>{toArabicNumerals(viewDate.getFullYear())}</span>
                                        </h2>
                                        <p className="text-xs font-bold opacity-70 mt-0.5">
                                            {hijriMonths[getHijriDetails(viewDate).month - 1].name} {toArabicNumerals(getHijriDetails(viewDate).year)} هـ
                                        </p>
                                    </div>
                                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all group active:scale-90">
                                        <ChevronLeft size={22} style={{ color: isDefaultTheme ? '#000000' : primaryColor }} />
                                    </button>
                                </div>

                                {/* Calendar Grid */}
                                <div className="px-2 pb-3">
                                    <CalendarGrid 
                                        viewDate={viewDate} 
                                        onSelectDay={handleSelectDay} 
                                        selectedDay={selectedDate}
                                        theme={theme}
                                        primaryColor={primaryColor}
                                        secondaryColor={secondaryColor}
                                        isBlackAndWhite={isBlackAndWhite}
                                        isDefaultTheme={isDefaultTheme}
                                    />
                                </div>
                            </div>

                            {/* Event List Section */}
                            <div className="themed-card p-5 rounded-2xl shadow-md">
                                <h3 className="font-kufi font-black text-lg mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: secondaryColor }}></div>
                                    أبرز المناسبات هذا الشهر
                                </h3>
                            <div className="space-y-3">
                                {(() => {
                                    const mYear = viewDate.getFullYear();
                                    const mMonth = viewDate.getMonth();
                                    const daysInMonth = new Date(mYear, mMonth + 1, 0).getDate();
                                    
                                    const eventsToShow: any[] = [];
                                    for (let i = 1; i <= daysInMonth; i++) {
                                        const dayDate = new Date(mYear, mMonth, i);
                                        const hInfo = getHijriDetails(dayDate);
                                        const e = islamicEvents.find(ev => ev.day === hInfo.day && ev.month === hInfo.month);
                                        if (e) {
                                            if (!eventsToShow.find(existing => existing.id === e.id)) {
                                                eventsToShow.push({ ...e, gDate: dayDate });
                                            }
                                        }
                                    }
                                    
                                    if (eventsToShow.length > 0) {
                                        return eventsToShow.map((event: any) => {
                                            const gDate = event.gDate;
                                            const dayName = WEEKDAYS[gDate.getDay()];
                                            const gFormatted = `${toArabicNumerals(gDate.getDate())} ${gregorianMonths[gDate.getMonth()].name}`;

                                            return (
                                                <div key={event.id} className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all border border-black/5 dark:border-white/5 shadow-sm">
                                                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm shrink-0 ${event.isPrimary ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                                                    <div className="flex-1">
                                                        <p className="font-black text-base opacity-95 mb-1" style={{ color: primaryColor }}>{event.name}</p>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                            <span className="text-sm font-black" style={{ color: 'var(--text-color)' }}>
                                                                {toArabicNumerals(event.day)} {hijriMonths[event.month - 1].name}
                                                            </span>
                                                            <span className="text-xs opacity-30">|</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm font-black" style={{ color: secondaryColor }}>{dayName}</span>
                                                                <span className="text-xs font-black" style={{ color: 'var(--text-color)' }}>{gFormatted}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    }
                                    return (
                                        <div className="text-center py-6 opacity-40 grayscale">
                                            <CalendarIcon size={36} className="mx-auto mb-2" />
                                            <p className="text-sm font-bold">لا توجد مناسبات مسجلة</p>
                                        </div>
                                    );
                                })()}
                            </div>
                            </div>
                        </div>
                    ) : (
                        /* Converter View */
                        <div className="space-y-3">
                            <div className="themed-card p-5 rounded-2xl shadow-lg space-y-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 -mr-12 -mt-12" style={{ backgroundColor: isDefaultTheme ? '#000000' : primaryColor }}></div>
                                
                                <div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold ring-1 ring-black/5">
                                    <button 
                                        onClick={() => setConvTab('hijriToGregorian')}
                                        className={`flex-1 py-2 px-1 rounded-lg transition-all duration-300 ${convTab === 'hijriToGregorian' ? 'themed-card shadow-md transform scale-100' : 'themed-text-muted opacity-50 scale-95'}`}
                                    >هجري ← ميلادي</button>
                                    <button 
                                        onClick={() => setConvTab('gregorianToHijri')}
                                        className={`flex-1 py-2 px-1 rounded-lg transition-all duration-300 ${convTab === 'gregorianToHijri' ? 'themed-card shadow-md transform scale-100' : 'themed-text-muted opacity-50 scale-95'}`}
                                    >ميلادي ← هجري</button>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {convTab === 'gregorianToHijri' ? (
                                        <>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('gDay')}>
                                                <label className="text-[10px] themed-text-muted font-black">اليوم</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner border border-black/5 text-xs">
                                                    {toArabicNumerals(inputs.gDay)}
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('gMonth')}>
                                                <label className="text-[10px] themed-text-muted font-black">الشهر</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner text-[10px] border border-black/5">
                                                    {gregorianMonths[inputs.gMonth - 1].name}
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('gYear')}>
                                                <label className="text-[10px] themed-text-muted font-black">السنة</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner border border-black/5 text-xs">
                                                    {toArabicNumerals(inputs.gYear)}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('hDay')}>
                                                <label className="text-[10px] themed-text-muted font-black">اليوم</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner border border-black/5 text-xs">
                                                    {toArabicNumerals(inputs.hDay)}
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('hMonth')}>
                                                <label className="text-[10px] themed-text-muted font-black">الشهر</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner text-[10px] border border-black/5">
                                                    {hijriMonths[inputs.hMonth - 1].name}
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-center cursor-pointer" onClick={() => openPicker('hYear')}>
                                                <label className="text-[10px] themed-text-muted font-black">السنة</label>
                                                <div className="w-full p-2.5 themed-bg-alt rounded-xl font-black text-center shadow-inner border border-black/5 text-xs">
                                                    {toArabicNumerals(inputs.hYear)}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {convResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-center p-4 rounded-2xl bg-black/5 dark:bg-white/5 border-2 border-dashed relative"
                                            style={{ borderColor: `${secondaryColor}30` }}
                                        >
                                            <p className="text-[10px] themed-text-muted font-black mb-1 tracking-widest">{convMessage}</p>
                                            <p className="text-xl font-black" style={{ color: isDefaultTheme ? '#000000' : primaryColor }}>{convResult}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {historicalEvent && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="themed-card p-4 rounded-2xl shadow-md relative mt-1 group"
                                >
                                    <div className="absolute top-0 right-0 w-12 h-1 bg-gradient-to-l from-transparent" style={{ backgroundColor: isDefaultTheme ? '#000000' : secondaryColor, borderTopRightRadius: '999px' }}></div>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={refreshEvent}
                                                className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-all active:scale-90"
                                            >
                                                <RefreshCw size={12} className="hover:rotate-180 transition-transform duration-500" style={{ color: secondaryColor }} />
                                            </button>
                                            <h4 className="text-[10px] sm:text-xs font-black opacity-30 uppercase tracking-widest">ذاكرة التاريخ</h4>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setShowZoomModal(true)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                            >
                                                <ZoomIn size={14} style={{ color: secondaryColor }} />
                                            </button>
                                            <button 
                                                onClick={() => handleCopy(historicalEvent.description)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                            >
                                                <Copy size={14} style={{ color: secondaryColor }} />
                                            </button>
                                            <button 
                                                onClick={() => handleShare(historicalEvent.title, historicalEvent.description)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                            >
                                                <Share2 size={14} style={{ color: secondaryColor }} />
                                            </button>
                                        </div>
                                    </div>
                                    <h5 className="text-lg sm:text-xl font-black mb-1.5" style={{ color: isDefaultTheme ? '#000000' : primaryColor }}>{historicalEvent.title}</h5>
                                    <div className="flex gap-4 text-xs font-bold themed-text-muted mb-3 justify-end">
                                        <span className="flex items-center gap-1.5"><CalendarIcon size={13} /> {toArabicNumerals(historicalEvent.hijriYear)}</span>
                                        <span className="flex items-center gap-1.5"><CalendarIcon size={13} /> {toArabicNumerals(historicalEvent.gregorianYear)}</span>
                                    </div>
                                    <p 
                                        className="leading-relaxed font-amiri themed-text-muted border-r-2 pr-4 text-justify" 
                                        style={{ 
                                            borderRightColor: `${secondaryColor}40`,
                                            fontSize: `${1.0 * historyFontSize}rem`
                                        }}
                                    >
                                        {historicalEvent.description}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Final Spacer to ensure bottom content clears the nav bar */}
                    <div className="h-24" />
                </div>
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-24 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Zoom Modal */}
            <AnimatePresence>
                {showZoomModal && historicalEvent && (
                    <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => setShowZoomModal(false)}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="themed-card p-8 rounded-3xl w-full max-w-2xl text-center relative shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                                <h3 className="text-2xl font-black mb-6" style={{ color: isDefaultTheme ? '#000000' : primaryColor }}>{historicalEvent.title}</h3>
                                <div 
                                    className="text-2xl md:text-3xl leading-relaxed font-amiri themed-text"
                                >
                                    {historicalEvent.description}
                                </div>
                                <div className="flex gap-6 text-sm font-bold themed-text-muted mt-8 justify-center">
                                    <span className="flex items-center gap-2"><CalendarIcon size={18} /> {toArabicNumerals(historicalEvent.hijriYear)}</span>
                                    <span className="flex items-center gap-2"><CalendarIcon size={18} /> {toArabicNumerals(historicalEvent.gregorianYear)}</span>
                                </div>
                            </div>

                            <div className="mt-8 shrink-0 flex gap-3">
                                <button onClick={() => setShowZoomModal(false)} className="flex-1 py-4 rounded-2xl font-black bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors">إغلاق</button>
                                <button 
                                    onClick={() => handleShare(historicalEvent.title, historicalEvent.description)}
                                    className="flex-1 py-4 rounded-2xl font-black text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >مشاركة الحدث</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Picker Modal */}
            {pickerConfig.isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-[300] flex items-center justify-center p-6 backdrop-blur-[1px]"
                    onClick={() => setPickerConfig(p => ({ ...p, isOpen: false }))}
                >
                    <div 
                        className="themed-card w-full max-w-[280px] rounded-[2.5rem] shadow-2xl flex flex-col max-h-[450px] overflow-hidden border border-white/20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-black/5 dark:border-white/5 text-center shrink-0 bg-black/[0.03] dark:bg-white/[0.03]">
                            <h3 className="text-sm font-black opacity-80" style={{ color: primaryColor }}>{pickerConfig.title}</h3>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 hide-scrollbar">
                            {pickerConfig.options.map((opt, i) => {
                                const currentValue = pickerConfig.type === 'calendarMonth' ? viewDate.getMonth() 
                                                    : pickerConfig.type === 'calendarYear' ? viewDate.getFullYear()
                                                    : (inputs as any)[pickerConfig.type];
                                const isSelected = String(opt.value) === String(currentValue);

                                return (
                                    <button
                                        key={i}
                                        data-selected={isSelected}
                                        onClick={() => handlePickerSelect(opt.value)}
                                        className={`w-full flex items-center justify-center p-3 rounded-2xl transition-all active:scale-[0.94] ${
                                            isSelected ? 'shadow-md z-10' : 'hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                        style={isSelected ? { backgroundColor: secondaryColor, color: isBlackAndWhite ? '#000' : '#FFF' } : {}}
                                    >
                                        <span className={`text-base ${isSelected ? 'font-black scale-110' : 'font-bold opacity-60'}`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HijriCalendar;
