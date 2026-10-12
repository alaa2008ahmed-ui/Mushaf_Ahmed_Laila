import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en';

export interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const ISLAMIC_TRANSLATIONS: Translations = {
  // Application Info & Branding
  'app.name': {
    ar: 'مُصْحَفُ أَحْمَدَ وَلَيْلَى',
    en: 'Mushaf Ahmed & Laila'
  },
  'app.subtitle': {
    ar: 'نرجوا الدعاء لهم بالرحمة والمغفرة',
    en: 'Kindly pray for their mercy & forgiveness'
  },
  'app.version': {
    ar: 'الإصدار 1.13',
    en: 'Version 1.13'
  },

  // Main Page Buttons & Menu Items
  'menu.quran': {
    ar: '📖 القرآن الكريم',
    en: '📖 The Noble Qur\'an'
  },
  'menu.quran_plain': {
    ar: 'القرآن الكريم',
    en: 'The Noble Qur\'an'
  },
  'menu.listen': {
    ar: '🎧 الاستماع للقرآن',
    en: '🎧 Listen to Qur\'an'
  },
  'menu.prayer_times': {
    ar: '⏱️ مواقيت الصلاة',
    en: '⏱️ Prayer Times'
  },
  'menu.adia': {
    ar: '🤲 الأدعية',
    en: '🤲 Supplications (Du\'a)'
  },
  'menu.sabah_masaa': {
    ar: '☀️ الأذكار',
    en: '☀️ Morning & Evening Adhkar'
  },
  'menu.salah_adhkar': {
    ar: '🕌 أذكار الصلاة',
    en: '🕌 Adhkar of Salah'
  },
  'menu.hisn_muslim': {
    ar: '🛡️ حصن المسلم',
    en: '🛡️ Fortress of the Muslim'
  },
  'menu.tasbeeh': {
    ar: '📿 السبحة',
    en: '📿 Electronic Tasbeeh'
  },
  'menu.calendar': {
    ar: '📅 التقويم',
    en: '📅 Hijri Calendar'
  },
  'menu.qibla': {
    ar: '🧭 القبلة',
    en: '🧭 Qibla Direction'
  },
  'menu.hajj_umrah': {
    ar: '🕋 الحج والعمرة',
    en: '🕋 Hajj & Umrah Guide'
  },
  'menu.nawawi': {
    ar: '📚 الأربعون النووية',
    en: '📚 40 Hadith An-Nawawi'
  },
  'menu.calculators': {
    ar: '🧮 الحاسبة الشرعية',
    en: '🧮 Islamic Calculators'
  },
  'menu.asmaul_husna': {
    ar: '✨ أسماء الله الحسنى',
    en: '✨ The 99 Beautiful Names'
  },
  'menu.ahl_al_quran': {
    ar: '🏆 أهل القرآن',
    en: '🏆 Ahl Al-Qur\'an'
  },
  'menu.community': {
    ar: '💬 مجتمع التواصل',
    en: '💬 Faith Community'
  },
  'menu.more': {
    ar: 'قائمة التطبيقات',
    en: 'Apps & Features'
  },
  'menu.more_menu': {
    ar: 'قائمة التطبيقات',
    en: 'Apps & Features'
  },
  'menu.daily_wird': {
    ar: '📅 الورد اليومي',
    en: '📅 Daily Wird & Khatmah'
  },
  'menu.habit_tracker': {
    ar: '🎯 مربّي العبادات',
    en: '🎯 Worship Habit Tracker'
  },
  'menu.memorization': {
    ar: '🧠 التحفيظ',
    en: '🧠 Qur\'an Memorization'
  },
  'menu.voice_control': {
    ar: '🎙️ التحكم الصوتي',
    en: '🎙️ Voice Control'
  },
  'menu.islamic_sites': {
    ar: '🌐 مواقع إسلامية',
    en: '🌐 Islamic Websites'
  },
  'menu.others': {
    ar: '✨ الرقية الشرعية',
    en: '✨ Al-Ruqyah Al-Shar\'iyyah'
  },
  'menu.tajweed': {
    ar: 'تعليم التجويد',
    en: 'Tajweed Rules'
  },

  // Side Menu Items & Descriptions
  'sidemenu.community_desc': {
    ar: 'التواصل والمحادثات مع القراء والحفاظ من جميع أنحاء العالم.',
    en: 'Brotherly discussions & connection with Qur\'an reciters worldwide.'
  },
  'sidemenu.ahl_al_quran_desc': {
    ar: 'لوحة صدارة وتنافس محمود لقراء القرآن الكريم مع تحديث شهري للأجزاء والختمات.',
    en: 'Honor leaderboard and inspiring competition for Qur\'an reciters.'
  },
  'sidemenu.search': {
    ar: 'البحث المتقدم',
    en: 'Advanced Search'
  },
  'sidemenu.search_desc': {
    ar: 'البحث عن آية، أو دعاء، أو أذكار.',
    en: 'Search for verses, prophetic supplications, or adhkar.'
  },
  'sidemenu.habit_tracker_desc': {
    ar: 'متابعة الصلاة وتلاوة القرآن والأذكار والأهداف اليومية.',
    en: 'Track your daily prayers, Qur\'an reading, adhkar, and good deeds.'
  },
  'sidemenu.home': {
    ar: 'الرئيسية',
    en: 'Home'
  },
  'sidemenu.home_desc': {
    ar: 'العودة إلى الشاشة الرئيسية للتطبيق.',
    en: 'Return to the main screen.'
  },
  'sidemenu.quran_desc': {
    ar: 'يقوم بعرض النص القرآني والتلاوة والتفسير والترجمة.',
    en: 'Read the Holy Qur\'an with authentic recitation and interpretation.'
  },
  'sidemenu.listen': {
    ar: 'الاستماع',
    en: 'Audio Recitations'
  },
  'sidemenu.listen_desc': {
    ar: 'الاستماع إلى تلاوات كبار القراء بمختلف الروايات.',
    en: 'Listen to renowned reciters across multiple Riwayat.'
  },
  'sidemenu.prayer_times_desc': {
    ar: 'عرض مواقيت الصلاة واتجاه القبلة لموقعك الحالي.',
    en: 'Accurate prayer times and Qibla direction for your location.'
  },
  'sidemenu.daily_wird_desc': {
    ar: 'متابعة وردك اليومي من القرآن والأذكار.',
    en: 'Daily Qur\'an reading progress and completed Khatmahs.'
  },
  'sidemenu.memorization_desc': {
    ar: 'أدوات مساعدة لحفظ ومراجعة القرآن الكريم.',
    en: 'Interactive tools for Qur\'an memorization and revision.'
  },
  'sidemenu.voice_control_desc': {
    ar: 'التحكم في التطبيق من خلال الأوامر الصوتية.',
    en: 'Navigate and control the app using voice commands.'
  },
  'sidemenu.readers': {
    ar: 'القراء',
    en: 'Reciters'
  },
  'sidemenu.readers_desc': {
    ar: 'اختر قارئك المفضل للاستماع إلى التلاوة العطرة.',
    en: 'Select from hundreds of renowned Qur\'an reciters.'
  },
  'sidemenu.font_type': {
    ar: 'نوع الخط',
    en: 'Font Style'
  },
  'sidemenu.font_type_desc': {
    ar: 'تغيير نوع الخط بما يناسب راحتك في القراءة.',
    en: 'Choose optimal Arabic and Latin typography for comfort.'
  },
  'sidemenu.notifications': {
    ar: 'الإشعارات',
    en: 'Notifications'
  },
  'sidemenu.notifications_desc': {
    ar: 'تنبيهات الأذان والأذكار والورد اليومي.',
    en: 'Adhan prayer alerts, daily adhkar, and wird reminders.'
  },
  'sidemenu.sajdah': {
    ar: 'آيات السجدة',
    en: 'Sajdah Verses'
  },
  'sidemenu.sajdah_desc': {
    ar: 'قائمة بجميع مواضع السجدات في القرآن الكريم للوصول السريع.',
    en: 'List of all Prostration (Sajdah) verses in the Qur\'an.'
  },
  'sidemenu.settings': {
    ar: 'الإعدادات',
    en: 'Settings'
  },
  'sidemenu.settings_desc': {
    ar: 'التحكم الكامل بخيارات وتفضيلات التطبيق.',
    en: 'Customize application preferences, audio, and display.'
  },
  'sidemenu.themes': {
    ar: 'الثيمات',
    en: 'Themes'
  },
  'sidemenu.themes_desc': {
    ar: 'تغيير ألوان ومظهر التطبيق بالكامل.',
    en: 'Choose from customized Islamic color themes.'
  },
  'sidemenu.whatsapp': {
    ar: 'تواصل معنا',
    en: 'Contact Us'
  },
  'sidemenu.whatsapp_desc': {
    ar: 'تواصل مباشر معنا للاقتراحات أو الدعم الفني.',
    en: 'Direct contact for inquiries, suggestions, and support.'
  },
  'sidemenu.about': {
    ar: 'عن التطبيق',
    en: 'About App'
  },
  'sidemenu.help': {
    ar: 'المساعدة',
    en: 'Help & FAQ'
  },
  'sidemenu.rate': {
    ar: 'تقييمنا',
    en: 'Rate Us'
  },

  // Page Titles & Subtitles
  'page.quran_title': {
    ar: 'القرآن الكريم',
    en: 'The Noble Qur\'an'
  },
  'page.quran_subtitle': {
    ar: 'كتاب الله العزيز وتلاوته وتدبره',
    en: 'The Word of Allah — Recitation & Reflection'
  },
  'page.prayer_times_title': {
    ar: 'مواقيت الصلاة',
    en: 'Prayer Times'
  },
  'page.prayer_times_subtitle': {
    ar: 'مواقيت الصلاة الدقيقة والأذان',
    en: 'Accurate Salah Timings & Adhan Alerts'
  },
  'page.monthly_prayer_title': {
    ar: 'مواقيت الصلاة الشهرية',
    en: 'Monthly Prayer Times'
  },
  'page.monthly_prayer_subtitle': {
    ar: 'جدول مواقيت الصلاة للشهر كاملاً',
    en: 'Full monthly timetable for all prayers'
  },
  'page.tasbeeh_title': {
    ar: 'السبحة الإلكترونية',
    en: 'Electronic Tasbeeh'
  },
  'page.tasbeeh_subtitle': {
    ar: 'أضف أذكارك الخاصة وتتبع تسبيحك بدقة',
    en: 'Custom Dhikr counter & spiritual remembrance'
  },
  'page.sabah_masaa_title': {
    ar: 'أذكار الصباح والمساء',
    en: 'Morning & Evening Adhkar'
  },
  'page.sabah_masaa_subtitle': {
    ar: 'حصنك اليومي من هدي النبي صلى الله عليه وسلم',
    en: 'Daily spiritual fortress from the Prophetic Sunnah'
  },
  'page.hisn_muslim_title': {
    ar: 'حصن المسلم',
    en: 'Fortress of the Muslim'
  },
  'page.hisn_muslim_subtitle': {
    ar: 'من أذكار الكتاب والسنة',
    en: 'Invocations from the Qur\'an and Sunnah'
  },
  'page.adia_title': {
    ar: 'الأدعية المأثورة',
    en: 'Prophetic Supplications'
  },
  'page.adia_subtitle': {
    ar: 'أدعية من القرآن الكريم والسنة النبوية',
    en: 'Du\'as from the Holy Qur\'an and Noble Sunnah'
  },
  'page.salah_adhkar_title': {
    ar: 'أذكار الصلاة',
    en: 'Adhkar of Salah'
  },
  'page.salah_adhkar_subtitle': {
    ar: 'الأذكار الواردة قبل وأثناء وبعد الصلاة المفروضة',
    en: 'Remembrances before, during, and after obligatory prayers'
  },
  'page.nawawi_title': {
    ar: 'الأربعون النووية',
    en: 'An-Nawawi\'s Forty Hadith'
  },
  'page.nawawi_subtitle': {
    ar: 'متن الأربعين حديثاً مع الفوائد والشرح المختصر',
    en: 'The Forty Hadith with concise explanation & lessons'
  },
  'page.listen_title': {
    ar: 'الاستماع للقرآن الكريم',
    en: 'Listen to the Holy Qur\'an'
  },
  'page.listen_subtitle': {
    ar: 'تلاوات عطرة من أشهر القراء',
    en: 'Soulful recitations by renowned international Qaris'
  },
  'page.qibla_title': {
    ar: 'اتجاه القبلة',
    en: 'Qibla Direction'
  },
  'page.qibla_subtitle': {
    ar: 'بوصلة دقيقة نحو الكعبة المشرفة',
    en: 'Precise compass pointing to the Holy Kaaba'
  },
  'page.calendar_title': {
    ar: 'التقويم',
    en: 'Islamic Calendar'
  },
  'page.calendar_subtitle': {
    ar: 'الميلادي والهجري في مكان واحد',
    en: 'Hijri & Gregorian calendar with sacred dates'
  },
  'page.hajj_umrah_title': {
    ar: 'الحج والعمرة',
    en: 'Hajj & Umrah Guide'
  },
  'page.hajj_umrah_subtitle': {
    ar: 'دليل شامل ومفصل لمناسك الحج والعمرة خطوة بخطوة',
    en: 'Step-by-step comprehensive guide to Pilgrimage rites'
  },
  'page.daily_wird_title': {
    ar: 'الورد اليومي',
    en: 'Daily Wird'
  },
  'page.daily_wird_subtitle': {
    ar: 'تابع ختمتك للقرآن الكريم',
    en: 'Track your daily reading and Khatmah progress'
  },
  'page.memorization_title': {
    ar: 'تحفيظ القرآن الكريم',
    en: 'Qur\'an Memorization'
  },
  'page.memorization_subtitle': {
    ar: 'أدوات تفاعلية للحفظ والتكرار والمراجعة المتقنة',
    en: 'Interactive tools for memorizing and revising verses'
  },
  'page.asmaul_husna_title': {
    ar: 'أسماء الله الحسنى',
    en: 'The 99 Beautiful Names of Allah'
  },
  'page.asmaul_husna_subtitle': {
    ar: '٩٩ اسماً من أحصاها دخل الجنة مع المعاني والدلائل',
    en: 'Whoever enumerates them will enter Paradise — with meanings'
  },
  'page.calculators_title': {
    ar: 'الحاسبة الشرعية',
    en: 'Islamic Legal Calculators'
  },
  'page.calculators_subtitle': {
    ar: 'زكاة، مواريث، كفارات',
    en: 'Zakat, Inheritance (Mawarith), and Expiations (Kaffarat)'
  },
  'page.habit_tracker_title': {
    ar: 'مربّي العبادات',
    en: 'Worship Habit Tracker'
  },
  'page.habit_tracker_subtitle': {
    ar: 'بناء العادات الإيمانية وتتبع الطاعات اليومية',
    en: 'Cultivate spiritual habits and record daily good deeds'
  },
  'page.community_title': {
    ar: 'مجتمع التواصل الإيماني',
    en: 'Faith Community'
  },
  'page.community_subtitle': {
    ar: 'ملتقى القراء والذاكرين والتواصي بالحق',
    en: 'Gathering of Qur\'an readers, mutual encouragement & discussions'
  },
  'page.ahl_al_quran_title': {
    ar: 'أهل القرآن (لوحة الشرف)',
    en: 'Ahl Al-Qur\'an Leaderboard'
  },
  'page.ahl_al_quran_subtitle': {
    ar: 'لوحة صدارة وتنافس محمود لقراء كتاب الله',
    en: 'Honor rankings and blessed competition in Qur\'an recitation'
  },
  'page.islamic_sites_title': {
    ar: 'مواقع إسلامية موثوقة',
    en: 'Verified Islamic Websites'
  },
  'page.islamic_sites_subtitle': {
    ar: 'دليل المواقع الموثوقة للفتاوى والعلوم الشرعية',
    en: 'Directory of trusted Islamic scholarly and legal resources'
  },
  'page.others_title': {
    ar: 'الرقية الشرعية',
    en: 'Al-Ruqyah Al-Shar\'iyyah'
  },
  'page.others_subtitle': {
    ar: 'آيات الشفاء والتحصين من القرآن الكريم والسنة النبوية',
    en: 'Healing and protection verses from Qur\'an & Sunnah'
  },
  'page.more_menu_title': {
    ar: 'قائمة التطبيقات',
    en: 'All Features & Applications'
  },
  'page.more_menu_subtitle': {
    ar: 'تصفح جميع أقسام التطبيق',
    en: 'Explore all spiritual sections and tools'
  },
  'page.voice_control_title': {
    ar: 'التحكم الصوتي',
    en: 'Voice Control'
  },
  'page.voice_control_subtitle': {
    ar: 'تنقل في التطبيق بصوتك',
    en: 'Navigate the application using voice commands'
  },

  // Bottom Navigation Bar
  'bottombar.home': {
    ar: 'الرئيسية',
    en: 'Home'
  },
  'bottombar.themes': {
    ar: 'الثيمات',
    en: 'Themes'
  },

  // Themes Sidebar
  'themes.title': {
    ar: 'ثيمات التطبيق',
    en: 'App Themes'
  },
  'themes.wallpaper': {
    ar: 'خلفية',
    en: 'Wallpaper'
  },
  'themes.reset': {
    ar: 'استعادة',
    en: 'Reset'
  },
  'themes.default': {
    ar: 'الافتراضي',
    en: 'Default'
  },

  // Common UI Actions & Labels
  'common.save': {
    ar: 'حفظ',
    en: 'Save'
  },
  'common.cancel': {
    ar: 'إلغاء',
    en: 'Cancel'
  },
  'common.close': {
    ar: 'إغلاق',
    en: 'Close'
  },
  'common.reset': {
    ar: 'الافتراضي',
    en: 'Default'
  },
  'common.search': {
    ar: 'بحث',
    en: 'Search'
  },
  'common.back': {
    ar: 'رجوع',
    en: 'Back'
  },
  'common.new': {
    ar: 'جديد',
    en: 'NEW'
  },
  'common.drag_to_reorder': {
    ar: 'اسحب الأزرار لترتيبها',
    en: 'Drag buttons to reorder'
  },
  'common.landscape_mode': {
    ar: 'وضع العرض',
    en: 'Landscape View'
  },

  // Prayer Cards on Home Screen
  'prayer.previous': {
    ar: 'السابقة',
    en: 'Previous'
  },
  'prayer.remaining': {
    ar: 'متبقي',
    en: 'Remaining'
  },
  'prayer.next': {
    ar: 'القادمة',
    en: 'Next'
  },
  'prayer.fajr': {
    ar: 'الفجر',
    en: 'Fajr'
  },
  'prayer.sunrise': {
    ar: 'الشروق',
    en: 'Sunrise'
  },
  'prayer.dhuhr': {
    ar: 'الظهر',
    en: 'Dhuhr'
  },
  'prayer.asr': {
    ar: 'العصر',
    en: 'Asr'
  },
  'prayer.maghrib': {
    ar: 'المغرب',
    en: 'Maghrib'
  },
  'prayer.isha': {
    ar: 'العشاء',
    en: 'Isha'
  },

  // Main Page Action Buttons
  'home.customize_menu': {
    ar: 'تخصيص القائمة',
    en: 'Customize Menu'
  },
  'home.rearrange_buttons': {
    ar: 'ترتيب الأزرار',
    en: 'Rearrange Buttons'
  },
  'home.share_app': {
    ar: 'مشاركة التطبيق',
    en: 'Share Application'
  },
  'home.voice_control': {
    ar: 'التحكم الصوتي',
    en: 'Voice Control'
  },
  'home.quran_radio': {
    ar: 'إذاعة القرآن',
    en: 'Holy Qur\'an Radio'
  },
  'home.whatsapp': {
    ar: 'واتساب',
    en: 'WhatsApp'
  },
  'home.on_this_day': {
    ar: 'حدث في مثل هذا اليوم',
    en: 'On This Day in Islamic History'
  },
  'home.upcoming_events': {
    ar: 'المناسبات الإسلامية القادمة',
    en: 'Upcoming Islamic Occasions'
  },

  // Theme Names Localization
  'theme.default': { ar: 'الافتراضي', en: 'Default Emerald' },
  'theme.deep_black': { ar: 'أسود عميق', en: 'Deep Obsidian' },
  'theme.fajr_light': { ar: 'نور الفجر', en: 'Fajr Dawn' },
  'theme.golden_sand': { ar: 'رمال ذهبية', en: 'Golden Sand' },
  'theme.olive_grove': { ar: 'بستان الزيتون', en: 'Olive Grove' },
  'theme.kaaba_kiswa': { ar: 'كسوة الكعبة', en: 'Kaaba Kiswah' },
  'theme.islamic_heritage': { ar: 'التراث الإسلامي', en: 'Islamic Heritage' },
  'theme.evening_tranquility': { ar: 'سكينة المساء', en: 'Evening Serenity' },
  'theme.morning_dew': { ar: 'ندى الصباح', en: 'Morning Dew' },
  'theme.madinah_rose': { ar: 'ورد المدينة', en: 'Madinah Rose' },
  'theme.andalusian_garden': { ar: 'حديقة أندلسية', en: 'Andalusian Garden' },
  'theme.blue_mosque': { ar: 'المسجد الأزرق', en: 'Blue Mosque' },
  'theme.clay_earth': { ar: 'تراب وأصالة', en: 'Earthy Clay' },
  'theme.slate_stone': { ar: 'حجر رمادي', en: 'Slate Stone' },
  'theme.sunset_glow': { ar: 'وهج الغروب', en: 'Sunset Glow' },
  'theme.electric_violet': { ar: 'بنفسج ساطع', en: 'Royal Violet' },
  'theme.sakura_breeze': { ar: 'نسيم الكرز', en: 'Sakura Breeze' },
  'theme.midnight_neon': { ar: 'نيون منتصف الليل', en: 'Midnight Cyan' },
  'theme.royal_purple': { ar: 'أرجواني ملكي', en: 'Royal Purple' },
  'theme.desert_night': { ar: 'ليل الصحراء', en: 'Desert Night' },
  'theme.ocean_peace': { ar: 'سلام المحيط', en: 'Ocean Peace' },
  'theme.vintage_paper': { ar: 'ورق قديم', en: 'Vintage Parchment' },
  'theme.turquoise_gem': { ar: 'حجر الفيروز', en: 'Turquoise Gem' },
  'theme.deep_forest': { ar: 'غابة عميقة', en: 'Deep Forest' },
  'theme.lavender_mist': { ar: 'ضباب اللافندر', en: 'Lavender Mist' },
  'theme.crystal_glass': { ar: 'زجاج كريستالي', en: 'Crystal Glass' },
  'theme.frosted_emerald': { ar: 'زمرد زجاجي', en: 'Frosted Emerald' },
  'theme.midnight_glass': { ar: 'زجاج ليلي', en: 'Midnight Glass' },

  // Language Button
  'lang.switch_to_en': {
    ar: 'English',
    en: 'العربية'
  },
  'lang.badge': {
    ar: 'EN',
    en: 'عربي'
  },
  'lang.current': {
    ar: 'العربية',
    en: 'English'
  }
};

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
  translateMenuItem: (itemId: string, defaultText?: string) => string;
  translatePageTitle: (pageId: string, defaultText?: string) => string;
  translatePageSubtitle: (pageId: string, defaultText?: string) => string;
  translateThemeName: (themeKey: string, defaultName?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_language');
      if (saved === 'en' || saved === 'ar') {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'ar';
  });

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem('app_language', language);
    } catch (e) {
      // ignore
    }
    // Update document root attributes
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string, defaultText?: string): string => {
    const item = ISLAMIC_TRANSLATIONS[key];
    if (item && item[language]) {
      return item[language];
    }
    return defaultText || item?.ar || key;
  };

  const translateMenuItem = (itemId: string, defaultText?: string): string => {
    // Standardize IDs: 'quran' -> 'menu.quran', 'prayer-times' -> 'menu.prayer_times'
    const normalizedKey = `menu.${itemId.replace(/-/g, '_')}`;
    if (ISLAMIC_TRANSLATIONS[normalizedKey]) {
      return ISLAMIC_TRANSLATIONS[normalizedKey][language];
    }
    // Check with plain fallback
    if (language === 'ar') {
      return defaultText || itemId;
    }
    // If English and not matched directly, handle known items
    const fallbackMap: Record<string, string> = {
      'quran': '📖 The Noble Qur\'an',
      'listen': '🎧 Listen to Qur\'an',
      'prayer-times': '⏱️ Prayer Times',
      'adia': '🤲 Supplications (Du\'a)',
      'sabah-masaa': '☀️ Morning & Evening Adhkar',
      'salah-adhkar': '🕌 Adhkar of Salah',
      'hisn-muslim': '🛡️ Fortress of the Muslim',
      'tasbeeh': '📿 Electronic Tasbeeh',
      'calendar': '📅 Hijri Calendar',
      'qibla': '🧭 Qibla Direction',
      'hajj-umrah': '🕋 Hajj & Umrah Guide',
      'nawawi': '📚 40 Hadith An-Nawawi',
      'calculators': '🧮 Islamic Calculators',
      'asmaul-husna': '✨ The 99 Beautiful Names',
      'ahl-al-quran': '🏆 Ahl Al-Qur\'an',
      'community': '💬 Faith Community',
      'more': 'Apps & Features',
      'more-menu': 'Apps & Features',
      'daily-wird': '📅 Daily Wird & Khatmah',
      'habit-tracker': '🎯 Worship Habit Tracker',
      'memorization': '🧠 Qur\'an Memorization',
      'voice-control': '🎙️ Voice Control',
      'islamic-sites': '🌐 Islamic Websites',
      'others': '✨ Al-Ruqyah Al-Shar\'iyyah',
      'tajweed-education': 'Tajweed Rules'
    };
    return fallbackMap[itemId] || defaultText || itemId;
  };

  const translatePageTitle = (pageId: string, defaultText?: string): string => {
    const normalizedKey = `page.${pageId.replace(/-/g, '_')}_title`;
    if (ISLAMIC_TRANSLATIONS[normalizedKey]) {
      return ISLAMIC_TRANSLATIONS[normalizedKey][language];
    }
    return defaultText || (language === 'en' ? pageId : defaultText || pageId);
  };

  const translatePageSubtitle = (pageId: string, defaultText?: string): string => {
    const normalizedKey = `page.${pageId.replace(/-/g, '_')}_subtitle`;
    if (ISLAMIC_TRANSLATIONS[normalizedKey]) {
      return ISLAMIC_TRANSLATIONS[normalizedKey][language];
    }
    return defaultText || '';
  };

  const translateThemeName = (themeKey: string, defaultName?: string): string => {
    const key = `theme.${themeKey}`;
    if (ISLAMIC_TRANSLATIONS[key]) {
      return ISLAMIC_TRANSLATIONS[key][language];
    }
    return defaultName || themeKey;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isRTL,
        dir,
        setLanguage,
        toggleLanguage,
        t,
        translateMenuItem,
        translatePageTitle,
        translatePageSubtitle,
        translateThemeName
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
