
/**
 * Voice Command Parser Utility for Quran App
 * Handles normalization, number conversion, and regex-based command extraction.
 */

export const ARABIC_NUMBERS_MAP: Record<string, number> = {
    'واحد': 1, 'واحده': 1, 'اول': 1, 'الاول': 1, 'اولى': 1,
    'اثنان': 2, 'اثنين': 2, 'ثاني': 2, 'الثاني': 2,
    'ثلاثه': 3, 'ثلاث': 3, 'ثالث': 3, 'الثالث': 3,
    'اربعة': 4, 'اربع': 4, 'رابع': 4, 'الرابع': 4, 'اربعه': 4,
    'خمسه': 5, 'خمس': 5, 'خامس': 5, 'الخامس': 5,
    'سته': 6, 'ست': 6, 'سادس': 6, 'السادس': 6,
    'سبعه': 7, 'سبع': 7, 'سابع': 7, 'السابع': 7,
    'ثمانيه': 8, 'ثمان': 8, 'ثامن': 8, 'الثامن': 8,
    'تسعه': 9, 'تسع': 9, 'تاسع': 9, 'التاسع': 9,
    'عشره': 10, 'عشر': 10, 'عاشر': 10, 'العاشر': 10,
    'احد عشر': 11, 'اثنا عشر': 12, 'ثلاثه عشر': 13, 'اربعة عشر': 14, 'اربعه عشر': 14, 'خمسه عشر': 15,
    'سته عشر': 16, 'سبعه عشر': 17, 'ثمانيه عشر': 18, 'تسعه عشر': 19,
    'عشرون': 20, 'عشرين': 20,
    'ثلاثون': 30, 'ثلاثين': 30,
    'اربعون': 40, 'اربعين': 40,
    'خمسون': 50, 'خمسين': 50,
    'ستون': 60, 'ستين': 60,
    'سبعون': 70, 'سبعين': 70,
    'ثمانون': 80, 'ثمانين': 80,
    'تسعون': 90, 'تسعين': 90,
    'مائه': 100, 'مئه': 100,
    'مائتان': 200, 'مئتان': 200,
    'ثلاثمائه': 300, 'اربعمائه': 400, 'خمسمائه': 500,
    'ستمائه': 600, 'سبعمائه': 700, 'ثمانمائه': 800, 'تسعمائه': 900,
    'الف': 1000,
    'نصف': 0.5, 'نص': 0.5
};

/**
 * Normalizes Arabic text for better matching
 */
export const normalizeArabic = (text: string): string => {
    if (!text) return '';
    return text
        .trim()
        .replace(/[\u064B-\u0652]/g, '') // Remove Tashkeel
        .replace(/[أإآ]/g, 'ا')
        .replace(/[ة]/g, 'ه')
        .replace(/[ى]/g, 'ي')
        .replace(/[ؤ]/g, 'و')
        .replace(/[ئ]/g, 'ي')
        .replace(/\bال/g, '') // Remove 'Al-' prefix
        .replace(/\s+/g, ' ')
        .toLowerCase();
};

/**
 * Converts Arabic word-based numbers to digits (supports decimals)
 */
export const arabicWordsToNumber = (text: string): number | null => {
    if (!text) return null;
    
    // Check if it's already digits (including decimals)
    const digitsMatch = text.match(/(\d+[\.,]\d+|\d+)/);
    if (digitsMatch) {
        const val = digitsMatch[0].replace(',', '.');
        return parseFloat(val);
    }

    const words = text.split(/[\sو]+/); // Split by space or 'و'
    let total = 0;
    let current = 0;
    let hasHalf = false;

    for (const word of words) {
        const normWord = normalizeArabic(word);
        if (normWord === 'نصف' || normWord === 'نص') {
            hasHalf = true;
            continue;
        }
        if (ARABIC_NUMBERS_MAP[normWord] !== undefined) {
            const val = ARABIC_NUMBERS_MAP[normWord];
            if (val >= 100) {
                if (current === 0) current = 1;
                total += current * val;
                current = 0;
            } else {
                current += val;
            }
        }
    }
    total += current;
    if (hasHalf) total += 0.5;
    
    return total > 0 ? total : (hasHalf ? 0.5 : null);
};

export interface ParsedCommand {
    action: string;
    params?: Record<string, any>;
    originalText: string;
}

/**
 * Main parser for voice commands
 */
export const parseVoiceCommand = (
    text: string, 
    surahNames: string[], 
    customCommands: any[] = []
): ParsedCommand | null => {
    const normalized = normalizeArabic(text);
    
    // 1. Check Custom Commands first (Dynamic Commands)
    for (const cmd of customCommands) {
        const normPhrase = normalizeArabic(cmd.phrase);
        if (normalized.includes(normPhrase)) {
            return { action: cmd.action, originalText: text };
        }
    }

    // 2. Extract Generic Numbers (Context-Aware)
    const genericNumberMatch = normalized.match(/\d+/);
    const wordNumber = arabicWordsToNumber(normalized);
    const extractedNumber = genericNumberMatch ? parseInt(genericNumberMatch[0], 10) : wordNumber;

    // 3. Font Size Control: "خط" + [رقم]
    const fontRegex = /(?:خط|حجم الخط)\s+(?:الي|إلى|الى)?\s*([آ-ي\s\d\.,]+)/;
    const fontMatch = normalized.match(fontRegex);
    if (fontMatch) {
        const num = arabicWordsToNumber(fontMatch[1]);
        if (num) {
            return { action: 'set_font_size', params: { size: num }, originalText: text };
        }
    }

    // 4. Theme Control: "ثيم" or "لون" + [اسم اللون]
    const themeRegex = /(?:ثيم|سيم|لون|مظهر)\s+([آ-ي\s]+)/;
    const themeMatch = normalized.match(themeRegex);
    
    // Theme names mapping from constants.ts
    const themeNameMap: Record<string, string> = {
        'الافتراضي': 'black',
        'افتراضي': 'black',
        'اخضر': 'green',
        'احمر': 'red',
        'نبيتي': 'maroon',
        'زيتوني': 'olive',
        'ازرق': 'blue',
        'بني': 'brown',
        'بنفسجي': 'purple',
        'برتقالي': 'orange',
        'ازرق مخضر': 'teal',
        'وردي': 'pink',
        'سماوي': 'cyan',
        'رمادي': 'gray',
        'اسود': 'black'
    };

    if (themeMatch) {
        const themeName = themeMatch[1].trim();
        const normThemeName = normalizeArabic(themeName);
        
        // Try mapping from the full theme names first
        for (const [arName, id] of Object.entries(themeNameMap)) {
            if (normThemeName === normalizeArabic(arName)) {
                return { action: 'set_theme', params: { theme: id }, originalText: text };
            }
        }

        // Mapping common Arabic color names to theme IDs (fallback)
        const colorMap: Record<string, string> = {
            'اخضر': 'medina', 'الأخضر': 'medina',
            'ازرق': 'blue_cyan', 'الأزرق': 'blue_cyan',
            'احمر': 'coral', 'الأحمر': 'coral',
            'اسود': 'deep_black', 'الأسود': 'deep_black', 'ليلي': 'midnight',
            'ابيض': 'default', 'الأبيض': 'default', 'نهاري': 'default',
            'بني': 'cream', 'البني': 'cream', 'قديم': 'cream',
        };
        const themeId = colorMap[normThemeName];
        if (themeId) {
            return { action: 'set_theme', params: { theme: themeId }, originalText: text };
        }
    }

    // Check for direct theme names if they are spoken alone
    for (const [arName, id] of Object.entries(themeNameMap)) {
        if (normalized === normalizeArabic(arName)) {
            return { action: 'set_theme', params: { theme: id }, originalText: text };
        }
    }

    // 5. Action Verbs (Contextual Execution)
    const actionVerbs: Record<string, string> = {
        'نزل': 'download', 'تحميل': 'download',
        'احذف': 'delete', 'مسح': 'delete',
        'شغل': 'play_audio', 'استماع': 'play_audio',
        'وقف': 'stop_audio', 'اسكت': 'stop_audio',
        'كبر': 'increase_font', 'صغر': 'decrease_font',
        'بحث': 'open_search'
    };
    for (const [verb, action] of Object.entries(actionVerbs)) {
        if (normalized.startsWith(normalizeArabic(verb))) {
            const remaining = normalized.replace(normalizeArabic(verb), '').trim();
            return { action, params: { target: remaining }, originalText: text };
        }
    }

    // 6. Global Constants / Relative Commands
    const relativeMap: Record<string, string> = {
        'تكبير': 'increase_font',
        'تصغير': 'decrease_font',
        'تكبير الخط': 'increase_font',
        'تصغير الخط': 'decrease_font',
        'تغيير لون الخلفية': 'change_theme',
        'لون الخلفيه': 'change_theme',
        'ايقاف': 'stop_audio',
        'تشغيل': 'play_audio',
        'التالي': 'next_page',
        'السابق': 'prev_page',
        'رجوع': 'go_back',
        'الرئيسية': 'go_home',
        'الرئيسيه': 'go_home',
        'افقي': 'set_orientation_horizontal',
        'رأسي': 'set_orientation_vertical',
        'راسي': 'set_orientation_vertical',
        'عرضي': 'set_orientation_horizontal',
        'طولي': 'set_orientation_vertical',
        'خروج': 'exit_app',
        'الغاء': 'cancel',
        'إلغاء': 'cancel',
        'مصحف': 'open_quran',
        'صفحة القراءة': 'open_quran',
        'القرآن الكريم': 'open_quran',
        'القران الكريم': 'open_quran',
        'فتح مواقيت الصلاة': 'open_prayer',
        'مواقيت الصلاه': 'open_prayer',
        'فتح القبلة': 'open_qibla',
        'القبله': 'open_qibla',
        'فتح السبحه': 'open_tasbeeh',
        'السبحه': 'open_tasbeeh',
        'فتح الأذكار': 'open_athkar',
        'الاذكار': 'open_athkar',
        'فتح أذكار الصلاة': 'open_salah_adhkar',
        'اذكار الصلاه': 'open_salah_adhkar',
        'فتح حصن المسلم': 'open_hisn_muslim',
        'حصن المسلم': 'open_hisn_muslim',
        'حسن المسلم': 'open_hisn_muslim',
        'فتح التقويم': 'open_calendar',
        'التقويم': 'open_calendar',
        'فتح الاستماع للقرآن': 'open_listen',
        'الاستماع للقران': 'open_listen',
        'فتح الإعدادات': 'open_settings',
        'الاعدادات': 'open_settings',
        'فتح الثيمات': 'open_themes',
        'ثيمات': 'open_themes',
        'السيمات': 'open_themes',
        'سيمات': 'open_themes',
        'فتح التحكم الصوتي': 'open_voice_control',
        'التحكم الصوتى': 'open_voice_control',
        'فتح الادعيه': 'open_adia',
        'الادعيه': 'open_adia',
        'فتح الحج والعمرة': 'open_hajj_umrah',
        'الحج والعمرة': 'open_hajj_umrah',
        'اسماء الله الحسنى': 'open_asmaul_husna',
        'أسماء الله الحسنى': 'open_asmaul_husna',
        'مواقع اسلامية': 'open_islamic_sites',
        'مواقع إسلامية': 'open_islamic_sites',
        'المواقع الاسلامية': 'open_islamic_sites',
        'المواقع الإسلامية': 'open_islamic_sites',
        'الورد اليومي': 'open_daily_wird',
        'التحفيظ': 'open_memorization',
        'فتح المزيد': 'open_more',
        'المزيد': 'open_more',
        'فتح الاربعون النوويه': 'open_nawawi',
        'الاربعون النوويه': 'open_nawawi',
        'تفسير الايه': 'show_tafsir',
        'تفسير الاية': 'show_tafsir',
        'عرض التفسير': 'show_tafsir',
        'تشغيل التمرير التلقائى': 'toggle_auto_scroll',
        'التمرير التلقائى': 'toggle_auto_scroll',
        'التمرير التلقائي': 'toggle_auto_scroll',
        'اسرع': 'faster_auto_scroll',
        'ابطئ': 'slower_auto_scroll',
        'ايقاف التمرير': 'pause_auto_scroll',
        'ايقاف مؤقت': 'pause_auto_scroll',
        'اغلاق التمرير': 'stop_auto_scroll',
        'ايقاف كامل': 'stop_auto_scroll',
        'المشاركه': 'open_share',
        'مشاركه': 'open_share',
        'فتح البحث': 'open_search',
        'بحث': 'open_search',
        'اغلاق القائمه': 'close_modal',
        'اغلاق': 'close_modal',
        'الاشارات المرجعيه': 'open_bookmarks',
        'الاشارات المرجعية': 'open_bookmarks',
        'فتح العلامات': 'open_bookmarks',
        'حفظ الايه': 'save_bookmark',
        'حفظ الاية': 'save_bookmark',
        'تشغيل الصوت': 'play_audio',
        'إيقاف الصوت': 'stop_audio',
        'ايقاف الصوت': 'stop_audio'
    };
    for (const [key, action] of Object.entries(relativeMap)) {
        if (normalized === normalizeArabic(key)) {
            return { action, originalText: text };
        }
    }

    // 7. Page Logic: "صفحة [رقم]"
    const pageRegex = /(?:صفحه|صفحة)\s+([آ-ي\s\d]+)/;
    const pageMatch = normalized.match(pageRegex);
    if (pageMatch) {
        const num = arabicWordsToNumber(pageMatch[1]);
        if (num && num >= 1 && num <= 604) {
            return { action: 'go_to_page', params: { page: num }, originalText: text };
        }
    }

    // 8. Juz Logic: "جزء [رقم]"
    const juzRegex = /(?:جزء)\s+([آ-ي\s\d]+)/;
    const juzMatch = normalized.match(juzRegex);
    if (juzMatch) {
        const num = arabicWordsToNumber(juzMatch[1]);
        if (num && num >= 1 && num <= 30) {
            return { action: 'go_to_juz', params: { juz: num }, originalText: text };
        }
    }

    // 9. Surah & Ayah Logic
    for (let i = 0; i < surahNames.length; i++) {
        const surahName = normalizeArabic(surahNames[i]);
        if (normalized.includes(surahName)) {
            const surahId = i + 1;
            const ayahRegex = new RegExp(`${surahName}\\s+(?:آيه|آية)?\\s*([آ-ي\\s\\d]+)`);
            const ayahMatch = normalized.match(ayahRegex);
            
            if (ayahMatch) {
                const ayahNum = arabicWordsToNumber(ayahMatch[1].trim());
                if (ayahNum) {
                    return { action: 'go_to_ayah', params: { surah: surahId, ayah: ayahNum }, originalText: text };
                }
            }
            return { action: 'go_to_surah', params: { surah: surahId }, originalText: text };
        }
    }

    // 10. Contextual Number (If just a number is spoken)
    if (extractedNumber) {
        return { action: 'contextual_number', params: { value: extractedNumber }, originalText: text };
    }

    // 11. UI Discovery Fallback (Return as potential UI click)
    return { action: 'ui_discovery', params: { text: normalized }, originalText: text };

    return null;
};
