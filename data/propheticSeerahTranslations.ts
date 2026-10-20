import { 
    SeerahMilestone, 
    PropheticStance, 
    PropheticLineage, 
    PROPHETIC_LINEAGE_DATA, 
    PROPHETIC_STANCES_DATA, 
    PROPHETIC_SEERAH_DATA 
} from './propheticSeerahData';

export const SEERAH_UI_TEXTS = {
    ar: {
        pageTitle: 'السيرة النبوية الشريفة',
        pageSubtitle: 'محطات خالدة من مولده ﷺ إلى الرفيق الأعلى ونسبه الشريف وشمائله العطرة',
        tabTimeline: 'الخط الزمني',
        tabStances: 'المواقف',
        tabLineage: 'النسب',
        tabTimelineFull: 'الخط الزمني',
        tabStancesFull: 'المواقف',
        tabLineageFull: 'النسب',
        searchTimelinePlaceholder: 'ابحث في أحداث السيرة، المعارك، الشخصيات، الأماكن والعِبر...',
        searchStancesPlaceholder: 'ابحث في المواقف الخالدة، الكلمات النبوية، الأخلاق والعِبر...',
        filterAll: 'كامل السيرة',
        filterAllStances: 'الكل',
        noMilestones: 'لا توجد محطات تطابق بحثك',
        noStances: 'لا توجد مواقف تطابق بحثك',
        copyMilestone: 'نسخ المحطة',
        zoom: 'تكبير',
        enlargeCardText: 'تكبير نص البطاقات',
        shareImage: 'مشاركة كبطاقة صورة',
        detailsAndLessons: 'التفاصيل والعِبر',
        stanceDetails: 'تفاصيل الموقف والعِبرة',
        dateAndTime: 'التاريخ والزمن:',
        prophetAge: 'عمر النبي ﷺ:',
        keyFigures: 'شخصيات وأعلام بارزة في هذه المحطة:',
        milestoneDetailsTitle: 'أحداث المحطة وتفاصيلها الموثقة',
        strategicImpact: 'الأثر الاستراتيجي والتحول التاريخي',
        miraclesAndDuas: 'معجزات وأدعية وبركات ارتبطت بالمحطة',
        historicalSecrets: 'أسرار ولطائف تاريخية وحكم نبوية خفية',
        lessonsTitle: 'العِبر والدروس الإيمانية والعملية',
        proofTitle: 'شاهد من القرآن الكريم أو السنة الشريفة:',
        shareCardHighRes: 'مشاركة كبطاقة صورة بدقة عالية',
        preparingImage: 'جاري تجهيز الصورة...',
        copyAllData: 'نسخ كامل البيانات',
        prevMilestone: 'المحطة السابقة',
        nextMilestone: 'المحطة التالية',
        immortalQuote: 'الكلمة والموقف الخالد',
        situationContext: 'السياق وتفاصيل الموقف',
        dialogueTitle: 'نص المحاورة والحوار النبوي الشريف',
        psychologicalAnalysis: 'التحليل النفسي والتربوي والقيادي للموقف',
        contemporaryReflection: 'إسقاط الموقف على واقعنا المعاصر وحياتنا اليومية',
        practicalApplication: 'خطوات وتطبيقات عملية للاقتداء بالخلق النبوي',
        moralLesson: 'القيمة الإنسانية والعِبرة الخالدة',
        proofSource: 'التوثيق والمصدر:',
        shareStanceCard: 'مشاركة الموقف كبطاقة صورة',
        copyStanceDetails: 'نسخ كامل تفاصيل الموقف',
        lineageTabTree: 'الأجداد',
        lineageTabMother: 'نسب الأم',
        lineageTabNames: 'الأسماء',
        lineageTabNurses: 'المرضعات',
        lineageTabCharacteristics: 'الشمائل',
        lineageTabVirtues: 'طهارة النسب',
        lineageBadge: 'النسب الشريف المصطفى وخاتم الأنبياء',
        directLineTitle: 'عمود النسب الشريف الأقرب:',
        fullLineTitle: 'سلسلة الأجداد المتصلة وصولاً إلى إسماعيل وإبراهيم عليهما السلام:',
        shareLineagePoster: 'مشاركة بطاقة النسب كصورة',
        copyLineageAll: 'نسخ شجرة النسب والشمائل كاملة',
        ancestorsTitle: 'سير الأجداد ومآثرهم من عبد الله حتى إبراهيم عليه السلام',
        ancestorStoryTitle: 'مأثرته وقصته في التاريخ:',
        copy: 'نسخ',
        motherLineageTitle: 'نسب أمه الطاهرة السيدة آمنة بنت وهب رضي الله عنها',
        meetingPointTitle: 'ملتقى النسبين الشريفين:',
        namesTitle: 'أسماء النبي ﷺ المباركة ومعانيها',
        nursesTitle: 'مرضعات النبي ﷺ وحاضناته وإخوته في الرضاع',
        characteristicsTitle: 'الشمائل المحمدية الشريفة',
        virtuesTitle: 'أحاديث شريفة في اصطفاء نسبه الشريف وطهارته',
        hadithSource: 'الشاهد والتخريج:',
        nobleHadithBadge: 'حديث شريف',
        zoomTitleSizeUp: 'تكبير الخط',
        zoomTitleSizeDown: 'تصغير الخط',
        close: 'إغلاق',
        copyText: 'نسخ النص',
        toastCopiedMilestone: 'تم نسخ كامل بيانات وتفاصيل المحطة بنجاح',
        toastCopiedStance: 'تم نسخ الموقف الخالد بجميع تفاصيله وعِبره',
        toastCopiedLineage: 'تم نسخ بيانات النسب والشمائل النبوية الشريفة بنجاح',
        toastCopiedText: 'تم نسخ النص بنجاح',
        toastCopyFailed: 'تعذر النسخ',
        toastShareFailed: 'تعذر مشاركة البطاقة كصورة',
        goBack: 'رجوع للخلف',
        home: 'الصفحة الرئيسية'
    },
    en: {
        pageTitle: 'The Prophetic Seerah',
        pageSubtitle: 'Immortal Milestones from his Birth ﷺ to the Highest Companion, Noble Lineage & Sublime Character',
        tabTimeline: 'Timeline',
        tabStances: 'Stances',
        tabLineage: 'Lineage',
        tabTimelineFull: 'Prophetic Timeline',
        tabStancesFull: 'Immortal Prophetic Stances',
        tabLineageFull: 'The Noble Prophetic Lineage',
        searchTimelinePlaceholder: 'Search events, expeditions, figures, places, and lessons...',
        searchStancesPlaceholder: 'Search immortal stances, prophetic quotes, morals, and lessons...',
        filterAll: 'Full Seerah',
        filterAllStances: 'All',
        noMilestones: 'No milestones match your search',
        noStances: 'No stances match your search',
        copyMilestone: 'Copy Milestone',
        zoom: 'Zoom In',
        enlargeCardText: 'Enlarge card text',
        shareImage: 'Share as Image Card',
        detailsAndLessons: 'Details & Lessons',
        stanceDetails: 'Details & Moral Lessons',
        dateAndTime: 'Date & Era:',
        prophetAge: "Prophet's Age ﷺ:",
        keyFigures: 'Key Figures in this Milestone:',
        milestoneDetailsTitle: 'Documented Events & Historical Narrative',
        strategicImpact: 'Strategic Impact & Historical Turning Point',
        miraclesAndDuas: 'Prophetic Miracles, Duas & Blessings',
        historicalSecrets: 'Historical Insights & Hidden Wisdom',
        lessonsTitle: 'Faith & Practical Life Lessons',
        proofTitle: "Evidence from the Holy Qur'an or Sunnah:",
        shareCardHighRes: 'Share High-Res Card Image',
        preparingImage: 'Preparing image...',
        copyAllData: 'Copy Full Data',
        prevMilestone: 'Previous Milestone',
        nextMilestone: 'Next Milestone',
        immortalQuote: 'Immortal Prophetic Quote',
        situationContext: 'Context & Detailed Circumstances',
        dialogueTitle: 'Documented Prophetic Dialogue',
        psychologicalAnalysis: 'Psychological, Educational & Leadership Analysis',
        contemporaryReflection: 'Contemporary Reflection on Modern Daily Life',
        practicalApplication: 'Practical Action Steps to Emulate the Prophet ﷺ',
        moralLesson: 'Eternal Human Value & Moral Lesson',
        proofSource: 'Source & Reference Documentation:',
        shareStanceCard: 'Share Stance as Image Card',
        copyStanceDetails: 'Copy Full Stance Details',
        lineageTabTree: 'Ancestors',
        lineageTabMother: "Mother's Lineage",
        lineageTabNames: 'Names',
        lineageTabNurses: 'Nurses',
        lineageTabCharacteristics: 'Shamail',
        lineageTabVirtues: 'Purity of Lineage',
        lineageBadge: 'The Chosen Noble Lineage & Seal of Prophets',
        directLineTitle: 'Direct Line of Noble Ancestry:',
        fullLineTitle: 'Unbroken Chain of Ancestors to Ismail & Ibrahim (peace be upon them):',
        shareLineagePoster: 'Share Lineage as Image Card',
        copyLineageAll: 'Copy Full Lineage & Shamail',
        ancestorsTitle: 'Biographies of Ancestors from Abdullah to Ibrahim (peace be upon him)',
        ancestorStoryTitle: 'Historical Legacy & Story:',
        copy: 'Copy',
        motherLineageTitle: 'Lineage of his Pure Mother, Lady Aminah bint Wahb (may Allah be pleased with her)',
        meetingPointTitle: 'Meeting Point of the Two Noble Lineages:',
        namesTitle: 'Blessed Names of the Prophet ﷺ & Their Meanings',
        nursesTitle: "The Prophet's Wet Nurses, Caregivers & Foster Siblings",
        characteristicsTitle: 'Sublime Prophetic Characteristics & Shamail',
        virtuesTitle: 'Noble Hadiths on Divine Selection & Purity of Lineage',
        hadithSource: 'Hadith Reference:',
        nobleHadithBadge: 'Noble Hadith',
        zoomTitleSizeUp: 'Increase Font Size',
        zoomTitleSizeDown: 'Decrease Font Size',
        close: 'Close',
        copyText: 'Copy Text',
        toastCopiedMilestone: 'Milestone details copied successfully',
        toastCopiedStance: 'Stance details copied successfully',
        toastCopiedLineage: 'Lineage details copied successfully',
        toastCopiedText: 'Text copied successfully',
        toastCopyFailed: 'Failed to copy',
        toastShareFailed: 'Failed to share card as image',
        goBack: 'Go Back',
        home: 'Home'
    }
};

export const ERA_FILTERS_EN: Record<string, string> = {
    'all': 'All',
    'pre-prophethood': 'Pre-Prophethood',
    'makki': 'Meccan Era',
    'early-madani': 'Early Medinan',
    'late-madani': 'Late Medinan'
};

export const STANCE_CATEGORIES_EN: Record<string, string> = {
    'all': 'All',
    'رحمة وعفو': 'Mercy',
    'شجاعة وثبات': 'Courage',
    'حلم وتواضع': 'Humility',
    'وفاء وأمانة': 'Loyalty',
    'شورى وعدالة': 'Justice',
    'رفق بالخلق': 'Kindness'
};

import { PROPHETIC_LINEAGE_DATA_EN } from './propheticLineageEn';
import { getStanceTranslationEn } from './propheticStancesEn';
import { getMilestoneTranslationEn } from './propheticMilestonesEn';
import { translateKeyFiguresList } from './propheticKeyFiguresEn';

export function getTranslatedMilestone(m: SeerahMilestone, isEn: boolean): SeerahMilestone {
    if (!isEn) return m;
    const tr = getMilestoneTranslationEn(m.id) || {};
    return {
        ...m,
        ...tr,
        eraLabel: tr.eraLabel || ERA_FILTERS_EN[m.era] || m.eraLabel,
        keyFigures: translateKeyFiguresList(tr.keyFigures || m.keyFigures),
        historicalSecrets: tr.historicalSecrets || undefined,
        propheticMiraclesOrDuas: tr.propheticMiraclesOrDuas || undefined,
        strategicImpact: tr.strategicImpact || undefined
    };
}

export function getTranslatedStance(s: PropheticStance, isEn: boolean): PropheticStance {
    if (!isEn) return s;
    const tr = getStanceTranslationEn(s.id) || {};
    return {
        ...s,
        ...tr,
        categoryBadge: tr.categoryBadge || STANCE_CATEGORIES_EN[s.category] || s.categoryBadge,
        keyFigures: translateKeyFiguresList(tr.keyFigures || s.keyFigures)
    };
}

export function getTranslatedLineage(isEn: boolean): PropheticLineage {
    if (!isEn) return PROPHETIC_LINEAGE_DATA;
    return PROPHETIC_LINEAGE_DATA_EN;
}

