import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import { syncDailyWirdNotifications } from '../utils/dailyWirdNotificationService';
import { setupNotifications } from '../utils/notifications';
import { setNativeAppLanguage } from '../utils/silentMode';

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
  'app.dua_bottom': {
    ar: 'اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة',
    en: 'O Allah, have mercy on them, forgive them, and grant them Paradise'
  },

  // Main Page Buttons & Menu Items
  'menu.quran': {
    ar: 'القرآن الكريم',
    en: 'The Noble Qur\'an'
  },
  'menu.quran_plain': {
    ar: 'القرآن الكريم',
    en: 'The Noble Qur\'an'
  },
  'menu.listen': {
    ar: 'الاستماع للقرآن',
    en: 'Listen to Qur\'an'
  },
  'menu.prayer_times': {
    ar: 'مواقيت الصلاة',
    en: 'Prayer Times'
  },
  'menu.adia': {
    ar: 'الأدعية',
    en: 'Supplications'
  },
  'menu.sabah_masaa': {
    ar: 'الأذكار',
    en: 'Daily Adhkar'
  },
  'menu.salah_adhkar': {
    ar: 'أذكار الصلاة',
    en: 'Salah Adhkar'
  },
  'menu.hisn_muslim': {
    ar: 'حصن المسلم',
    en: 'Hisn Al-Muslim'
  },
  'menu.tasbeeh': {
    ar: 'التسبيح',
    en: 'Tasbeeh'
  },
  'menu.calendar': {
    ar: 'التقويم',
    en: 'Islamic Calendar'
  },
  'menu.qibla': {
    ar: 'البوصلة',
    en: 'Compass'
  },
  'menu.hajj_umrah': {
    ar: 'الحج والعمرة',
    en: 'Hajj & Umrah'
  },
  'menu.nawawi': {
    ar: 'الأربعون النووية',
    en: 'Forty Hadith'
  },
  'menu.calculators': {
    ar: 'الحاسبة الشرعية',
    en: 'Calculators'
  },
  'menu.asmaul_husna': {
    ar: 'أسماء الله',
    en: 'Names of Allah'
  },
  'menu.daily_wird': {
    ar: 'الورد اليومي',
    en: 'Daily Wird'
  },
  'menu.habit_tracker': {
    ar: 'مربّي العبادات',
    en: 'Habit Tracker'
  },
  'menu.memorization': {
    ar: 'التحفيظ',
    en: 'Memorization'
  },
  'menu.voice_control': {
    ar: 'التحكم الصوتي',
    en: 'Voice Control'
  },
  'menu.islamic_sites': {
    ar: 'مواقع إسلامية',
    en: 'Islamic Sites'
  },
  'menu.others': {
    ar: 'الرقية الشرعية',
    en: 'Ruqyah'
  },
  'menu.prophetic_seerah': {
    ar: 'السيرة النبوية',
    en: 'Prophetic Seerah'
  },
  'menu.ten_promised': {
    ar: 'العشرة المبشرون',
    en: 'The Ten Promised Paradise'
  },
  'menu.tajweed': {
    ar: 'تعليم التجويد',
    en: 'Tajweed Rules'
  },
  'sidemenu.ten_promised_desc': {
    ar: 'سير وأحوال وفضائل ومواقف العشرة المبشرين بالجنة.',
    en: 'Biographies and virtues of the Ten Promised Paradise.'
  },

  // Side Menu Items & Descriptions
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
  'sidemenu.page_guide': {
    ar: 'دليل صفحات التطبيق',
    en: 'App Pages Guide'
  },
  'sidemenu.page_guide_desc': {
    ar: 'شرح وافٍ ومبسط لجميع خدمات وصفحات ومميزات التطبيق.',
    en: 'Comprehensive guide to all application services, features, and screens.'
  },
  'sidemenu.prophetic_seerah_desc': {
    ar: 'خط زمني تفاعلي لمحطات السيرة العطرة والعبر المستفادة.',
    en: 'Interactive timeline of the blessed Prophetic biography and lessons.'
  },
  'sidemenu.quran_download_parent': {
    ar: 'تحميل القرآن',
    en: 'Download Qur\'an'
  },
  'sidemenu.tafseer_download': {
    ar: 'تحميل التفسير',
    en: 'Download Tafseer'
  },
  'sidemenu.interface_customization': {
    ar: 'تخصيص الواجهة',
    en: 'Customize Interface'
  },
  'sidemenu.audio': {
    ar: 'القراء',
    en: 'Reciters'
  },
  'sidemenu.bookmarks': {
    ar: 'العلامات المرجعية',
    en: 'Bookmarks'
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
  'page.prophetic_seerah_title': {
    ar: 'السيرة النبوية',
    en: 'The Prophetic Seerah'
  },
  'page.prophetic_seerah_subtitle': {
    ar: 'رحلة تفاعلية في سيرة خير الأنام ﷺ',
    en: 'Interactive journey through the life of Prophet Muhammad ﷺ'
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
  'theme.black': { ar: 'افتراضي', en: 'Default' },
  'theme.night_sky': { ar: 'أزرق', en: 'Blue' },
  'theme.green': { ar: 'أخضر', en: 'Green' },
  'theme.red': { ar: 'أحمر', en: 'Red' },
  'theme.maroon': { ar: 'نبيتي', en: 'Maroon' },
  'theme.olive': { ar: 'زيتوني', en: 'Olive' },
  'theme.blue': { ar: 'نيلي فاتح', en: 'Light Indigo' },
  'theme.brown': { ar: 'بني', en: 'Brown' },
  'theme.purple': { ar: 'بنفسجي', en: 'Purple' },
  'theme.orange': { ar: 'برتقالي', en: 'Orange' },
  'theme.sky': { ar: 'سماوي فاتح', en: 'Light Sky' },
  'theme.gold': { ar: 'ذهبي', en: 'Gold' },
  'theme.amber_light': { ar: 'كهرماني', en: 'Amber' },
  'theme.mint': { ar: 'نعناعي', en: 'Mint' },
  'theme.pink': { ar: 'وردي', en: 'Pink' },
  'theme.cyan': { ar: 'سماوي', en: 'Cyan' },
  'theme.lime': { ar: 'ليموني', en: 'Lime' },
  'theme.i_emerald': { ar: 'زمرد', en: 'Emerald' },
  'theme.i_ruby': { ar: 'ياقوت', en: 'Ruby' },
  'theme.i_lapis': { ar: 'لازورد', en: 'Lapis Lazuli' },
  'theme.i_gold': { ar: 'ذهبي', en: 'Gold' },
  'theme.i_royal_gold': { ar: 'ذهبي ملكي', en: 'Royal Gold' },
  'theme.i_amber': { ar: 'عنبر', en: 'Amber' },
  'theme.i_amethyst': { ar: 'أرجوان', en: 'Amethyst' },
  'theme.i_sunset_royal': { ar: 'ملك الغروب', en: 'Royal Sunset' },
  'theme.i_deep_ocean': { ar: 'ملك الأعماق', en: 'Deep Ocean' },
  'theme.i_brocade': { ar: 'إستبرق', en: 'Brocade' },
  'theme.i_musk': { ar: 'مسك', en: 'Musk' },
  'theme.i_midnight': { ar: 'ليل', en: 'Midnight' },
  'theme.i_obsidian': { ar: 'بركان', en: 'Obsidian' },
  'theme.i_forest': { ar: 'غابة', en: 'Forest' },
  'theme.i_turquoise': { ar: 'فيروزي داكن', en: 'Dark Turquoise' },
  'theme.i_slate': { ar: 'حجري', en: 'Slate' },


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
  'common.copy': {
    ar: 'نسخ',
    en: 'Copy'
  },
  'common.share': {
    ar: 'مشاركة',
    en: 'Share'
  },
  'common.copied': {
    ar: 'تم النسخ إلى الحافظة',
    en: 'Copied to clipboard'
  },
  'common.copy_failed': {
    ar: 'فشل في النسخ',
    en: 'Failed to copy'
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
  'common.landscape': {
    ar: 'عرضي',
    en: 'Landscape'
  },
  'common.quran': {
    ar: 'القرآن الكريم',
    en: 'The Noble Qur\'an'
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
  'prayer_card.previous': {
    ar: 'السابقة',
    en: 'Previous'
  },
  'prayer_card.remaining': {
    ar: 'متبقي',
    en: 'Remaining'
  },
  'prayer_card.next': {
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

  // Habit Tracker Card (مربي العبادات)
  'habit_card.title': {
    ar: 'مربي العبادات',
    en: 'Worship Habit Tracker'
  },
  'habit_card.today_badge': {
    ar: 'إنجاز اليوم',
    en: 'Today\'s Progress'
  },
  'habit_card.open_log': {
    ar: 'فتح السجل',
    en: 'Open Log'
  },
  'habit_card.completion_rate': {
    ar: 'نسبة إنجاز اليوم',
    en: 'Today\'s Completion'
  },
  'habit_card.completed': {
    ar: 'مكتمل ما شاء الله 🌟',
    en: 'Completed, Masha\'Allah! 🌟'
  },
  'habit_card.excellent': {
    ar: 'إنجاز ممتاز 🌿',
    en: 'Excellent Progress 🌿'
  },
  'habit_card.in_progress': {
    ar: 'مستمر بالعمل 🤲',
    en: 'In Progress 🤲'
  },
  'habit_card.start_today': {
    ar: 'ابدأ عبادات اليوم ✨',
    en: 'Start Today\'s Worship ✨'
  },
  'habit_card.prev_summary': {
    ar: 'ملخص الأيام السابقة:',
    en: 'Previous Days Summary:'
  },
  'habit_card.yesterday': {
    ar: 'اليوم السابق:',
    en: 'Yesterday:'
  },
  'habit_card.before_yesterday': {
    ar: 'الذي قبله:',
    en: 'Day Before:'
  },

  // Tawaf & Sa'i Counter Card
  'tawaf.title': {
    ar: 'عداد أشواط الطواف',
    en: 'Tawaf Lap Counter'
  },
  'sai.title': {
    ar: 'عداد أشواط السعي',
    en: 'Sa\'i Lap Counter'
  },
  'tawaf.tab': {
    ar: 'طواف',
    en: 'Tawaf'
  },
  'sai.tab': {
    ar: 'سعي',
    en: 'Sa\'i'
  },
  'tawaf.reset_tooltip': {
    ar: 'إعادة ضبط العداد',
    en: 'Reset Counter'
  },
  'tawaf.completed_title': {
    ar: 'اكتملت 7 أشواط مباركة!',
    en: '7 Blessed Laps Completed!'
  },
  'tawaf.completed_subtitle': {
    ar: 'تقبل الله نسككم وطاعتكم',
    en: 'May Allah accept your worship'
  },
  'tawaf.record_lap_prefix': {
    ar: 'تسجيل الشوط',
    en: 'Record Lap'
  },
  'tawaf.tap_hint': {
    ar: 'اضغط بعد كل شوط لاحتساب الرقم',
    en: 'Tap after each completed circuit'
  },
  'tawaf.of_seven': {
    ar: 'من 7',
    en: 'of 7'
  },

  // On This Day Card (حدث في مثل هذا اليوم)
  'on_this_day.title': {
    ar: 'حدث في مثل هذا اليوم',
    en: 'On This Day in History'
  },
  'on_this_day.next': {
    ar: 'حدث آخر',
    en: 'Another Event'
  },
  'on_this_day.next_event': {
    ar: 'حدث آخر',
    en: 'Another Event'
  },
  'on_this_day.ad': {
    ar: 'ميلادي',
    en: 'AD'
  },
  'on_this_day.ce': {
    ar: 'ميلادي',
    en: 'AD'
  },
  'on_this_day.copied': {
    ar: 'تم النسخ إلى الحافظة',
    en: 'Copied to clipboard'
  },

  // Upcoming Events Card (المناسبات الإسلامية)
  'upcoming.title': {
    ar: 'المناسبات الإسلامية',
    en: 'Islamic Occasions'
  },
  'islamic_events.title': {
    ar: 'المناسبات الإسلامية',
    en: 'Islamic Occasions'
  },
  'upcoming.modal_title': {
    ar: 'المناسبة الإسلامية',
    en: 'Islamic Occasion'
  },
  'islamic_events.single_title': {
    ar: 'المناسبة الإسلامية',
    en: 'Islamic Occasion'
  },
  'islamic_events.modal_title': {
    ar: 'المناسبة الإسلامية',
    en: 'Islamic Occasion'
  },
  'upcoming.prev': {
    ar: 'المناسبة السابقة',
    en: 'Previous Occasion'
  },
  'islamic_events.prev': {
    ar: 'المناسبة السابقة',
    en: 'Previous Occasion'
  },
  'upcoming.next': {
    ar: 'المناسبة التالية',
    en: 'Next Occasion'
  },
  'islamic_events.next': {
    ar: 'المناسبة التالية',
    en: 'Next Occasion'
  },
  'upcoming.today': {
    ar: 'اليوم',
    en: 'Today'
  },
  'islamic_events.today': {
    ar: 'اليوم',
    en: 'Today'
  },
  'upcoming.remaining': {
    ar: 'باقي',
    en: 'Remaining'
  },
  'islamic_events.remaining': {
    ar: 'باقي',
    en: 'Remaining'
  },
  'upcoming.passed': {
    ar: 'مر عليها',
    en: 'Passed'
  },
  'islamic_events.passed': {
    ar: 'مر عليها',
    en: 'Passed'
  },
  'upcoming.days': {
    ar: 'يوم',
    en: 'Days'
  },
  'islamic_events.days': {
    ar: 'يوم',
    en: 'Days'
  },
  'upcoming.occurs': {
    ar: 'توافق',
    en: 'Occurs on'
  },
  'islamic_events.matches': {
    ar: 'توافق',
    en: 'Occurs on'
  },
  'upcoming.remaining_days': {
    ar: 'يتبقى عليها',
    en: 'Time Remaining'
  },
  'islamic_events.remaining_on': {
    ar: 'يتبقى عليها',
    en: 'Time Remaining'
  },
  'islamic_events.passed_on': {
    ar: 'مر عليها',
    en: 'Time Elapsed'
  },

  // Web App Link Card (تصفح التطبيق)
  'webapp.title': {
    ar: 'تصفح التطبيق',
    en: 'Browse Web App'
  },
  'webapp.desc': {
    ar: 'لمشاهدة التطبيق على المتصفح او الايفون اضغط على الرابط',
    en: 'To view the application on web browser or iPhone, click the link'
  },
  'webapp.open': {
    ar: 'فتح الرابط',
    en: 'Open Link'
  },
  'webapp.open_link': {
    ar: 'فتح الرابط',
    en: 'Open Link'
  },
  'webapp.copy': {
    ar: 'نسخ الرابط',
    en: 'Copy Link'
  },
  'webapp.copy_link': {
    ar: 'نسخ الرابط',
    en: 'Copy Link'
  },
  'webapp.share': {
    ar: 'مشاركة الرابط',
    en: 'Share Link'
  },
  'webapp.share_link': {
    ar: 'مشاركة الرابط',
    en: 'Share Link'
  },
  'webapp.copied': {
    ar: 'تم نسخ الرابط',
    en: 'Link copied to clipboard'
  },

  // App Share Card (شارك التطبيق)
  'app_share.title': {
    ar: 'شارك التطبيق',
    en: 'Share Application'
  },
  'app_share.ayah': {
    ar: 'قال تعالى: ﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ﴾',
    en: 'Allah says: ﴿ And cooperate in righteousness and piety ﴾'
  },
  'app_share.hadith': {
    ar: '« مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ »',
    en: '« Whoever guides someone to goodness will have a reward like one who did it »'
  },
  'app_share.desc': {
    ar: 'اذا اعجبك التطبيق قم بنشره على وسائل التواصل ليكون لك الاجر ولمن تحب ان شاء الله .',
    en: 'If you benefit from the app, share it on social media to earn ongoing rewards, insha\'Allah.'
  },
  'app_share.copied': {
    ar: 'تم نسخ نص المشاركة',
    en: 'Share text copied to clipboard'
  },
  'app_share.qr_button': {
    ar: 'الكيو ار',
    en: 'QR Code'
  },
  'app_share.qr_page_title': {
    ar: 'رمز الاستجابة السريعة (QR Code)',
    en: 'Application QR Code'
  },
  'app_share.qr_page_subtitle': {
    ar: 'امسح رمز الاستجابة السريعة بكاميرا هاتفك للوصول المباشر إلى التطبيق على متجر جوجل بلاي',
    en: 'Scan the QR code with your phone camera for direct access on Google Play'
  },
  'app_share.print': {
    ar: 'طباعة',
    en: 'Print'
  },
  'app_share.print_a4': {
    ar: 'طباعة A4',
    en: 'Print A4'
  },
  'app_share.print_a5': {
    ar: 'طباعة A5',
    en: 'Print A5'
  },

  // Theme Names Localization
  'theme.default': { ar: 'الافتراضي', en: 'Default Emerald' },
  'theme.deep_black': { ar: 'اسود غامق', en: 'Deep Black' },
  'theme.fajr_light': { ar: 'نور الفجر', en: 'Fajr Dawn' },
  'theme.golden_sand': { ar: 'رمال ذهبية', en: 'Golden Sand' },
  'theme.olive_grove': { ar: 'بستان الزيتون', en: 'Olive Grove' },
  'theme.kaaba_kiswa': { ar: 'كسوة الكعبة', en: 'Kaaba Kiswah' },
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
  'lang.toggle_tooltip': {
    ar: 'التحويل إلى اللغة الإنجليزية',
    en: 'Switch language to Arabic'
  }
};

const ISLAMIC_EVENTS_EN: Record<string, string> = {
  "رأس السنة الهجرية": "Islamic Hijri New Year",
  "يوم عاشوراء": "Day of Ashura",
  "المولد النبوي الشريف": "The Prophet's Birthday (Mawlid)",
  "الإسراء والمعراج": "Al-Isra' & Al-Mi'raj",
  "النصف من شعبان": "Mid-Sha'ban",
  "أول أيام شهر رمضان": "First Day of Ramadan",
  "ليلة القدر": "Laylat Al-Qadr (Night of Decree)",
  "عيد الفطر المبارك": "Blessed Eid Al-Fitr",
  "يوم عرفة": "Day of Arafah",
  "عيد الأضحى المبارك": "Blessed Eid Al-Adha"
};

const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", 
  "Jumada al-Ula", "Jumada al-Thaniyah", "Rajab", "Sha'ban", 
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

const GREGORIAN_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const PRAYER_NAMES_EN: Record<string, string> = {
  'الفجر': 'Fajr',
  'الشروق': 'Sunrise',
  'الظهر': 'Dhuhr',
  'العصر': 'Asr',
  'المغرب': 'Maghrib',
  'العشاء': 'Isha',
  'Fajr': 'Fajr',
  'Sunrise': 'Sunrise',
  'Dhuhr': 'Dhuhr',
  'Asr': 'Asr',
  'Maghrib': 'Maghrib',
  'Isha': 'Isha'
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
  translatePrayerName: (prayerName: string) => string;
  translateEventName: (eventName: string) => string;
  translateHijriMonth: (monthIndex: number) => string;
  translateGregorianMonth: (monthIndex: number) => string;
  formatNumber: (n: number | string) => string;
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
      Preferences.set({ key: 'app_language', value: language }).catch(() => {});
    } catch (e) {
      // ignore
    }
    // Update document root attributes
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Update native Android app locale & notification titles
    try {
      setNativeAppLanguage(language).catch(() => {});
    } catch (e) {
      // ignore
    }

    // Sync Daily Wird notifications with the new language
    try {
      syncDailyWirdNotifications(language);
    } catch (e) {
      // ignore
    }

    // Sync general Athkar, Duas, Tasbeeh & Occasions notifications with the new language
    try {
      setupNotifications(undefined, language).catch(() => {});
    } catch (e) {
      // ignore
    }
  }, [language, isRTL]);

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguageState(prev => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const t = (key: string, defaultText?: string): string => {
    const item = ISLAMIC_TRANSLATIONS[key];
    if (item && item[language]) {
      return item[language];
    }
    return defaultText || item?.ar || key;
  };

  const translateMenuItem = (itemId: string, defaultText?: string): string => {
    const normalizedKey = `menu.${itemId.replace(/-/g, '_')}`;
    if (ISLAMIC_TRANSLATIONS[normalizedKey]) {
      return ISLAMIC_TRANSLATIONS[normalizedKey][language];
    }
    if (language === 'ar') {
      return defaultText || itemId;
    }
    const fallbackMap: Record<string, string> = {
      'quran': 'The Noble Qur\'an',
      'listen': 'Listen to Qur\'an',
      'prayer-times': 'Prayer Times',
      'adia': 'Supplications',
      'sabah-masaa': 'Daily Adhkar',
      'salah-adhkar': 'Salah Adhkar',
      'hisn-muslim': 'Hisn Al-Muslim',
      'tasbeeh': 'Tasbeeh',
      'calendar': 'Islamic Calendar',
      'qibla': 'Compass',
      'hajj-umrah': 'Hajj & Umrah',
      'nawawi': 'Forty Hadith',
      'calculators': 'Calculators',
      'asmaul-husna': 'Names of Allah',
      'daily-wird': 'Daily Wird',
      'habit-tracker': 'Habit Tracker',
      'memorization': 'Memorization',
      'voice-control': 'Voice Control',
      'islamic-sites': 'Islamic Sites',
      'others': 'Ruqyah',
      'prophetic-seerah': 'Prophetic Seerah',
      'ten-promised': 'The Ten Promised Paradise',
      'tajweed-education': 'Tajweed Rules',
      'quran-download-parent': 'Download Qur\'an',
      'tafseer-download': 'Download Tafseer',
      'interface-customization': 'Customize Interface',
      'audio': 'Reciters',
      'font-type': 'Font Style',
      'notification-settings': 'Notifications',
      'sajdah-list': 'Sajdah Verses',
      'mushaf': 'Mushaf',
      'tafseer': 'Tafseer',
      'meanings': 'Meanings',
      'translation': 'Translation',
      'themes': 'Themes',
      'settings': 'Settings',
      'bookmarks': 'Bookmarks',
      'search': 'Advanced Search'
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

  const translatePrayerName = (prayerName: string): string => {
    if (!prayerName || prayerName === '-') return prayerName;
    if (language === 'ar') return prayerName;
    return PRAYER_NAMES_EN[prayerName] || prayerName;
  };

  const translateEventName = (eventName: string): string => {
    if (!eventName) return '';
    if (language === 'ar') return eventName;
    return ISLAMIC_EVENTS_EN[eventName] || eventName;
  };

  const translateHijriMonth = (monthIndex: number): string => {
    if (language === 'en') {
      return HIJRI_MONTHS_EN[monthIndex] || '';
    }
    const arMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    return arMonths[monthIndex] || '';
  };

  const translateGregorianMonth = (monthIndex: number): string => {
    if (language === 'en') {
      return GREGORIAN_MONTHS_EN[monthIndex] || '';
    }
    const arMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    return arMonths[monthIndex] || '';
  };

  const formatNumber = (n: number | string): string => {
    const str = String(n);
    if (language === 'en') {
      return str
        .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
        .replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
    }
    const easternDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (w) => easternDigits[+w]);
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
        translateThemeName,
        translatePrayerName,
        translateEventName,
        translateHijriMonth,
        translateGregorianMonth,
        formatNumber
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

